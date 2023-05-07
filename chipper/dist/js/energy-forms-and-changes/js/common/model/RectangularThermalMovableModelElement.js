// Copyright 2014-2022, University of Colorado Boulder

/**
 * RectangularThermalMovableModelElement is a base class for a movable model element that contains thermal energy and
 * that, at least in the model, has an overall shape that can be represented as a rectangle.
 *
 * @author John Blanco
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Range from '../../../../dot/js/Range.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EFACConstants from '../EFACConstants.js';
import EnergyChunk from './EnergyChunk.js';
import energyChunkDistributor from './energyChunkDistributor.js';
import EnergyChunkWanderController from './EnergyChunkWanderController.js';
import EnergyType from './EnergyType.js';
import HeatTransferConstants from './HeatTransferConstants.js';
import ThermalContactArea from './ThermalContactArea.js';
import UserMovableModelElement from './UserMovableModelElement.js';

// const
const MAX_ENERGY_CHUNK_REDISTRIBUTION_TIME = 2; // in seconds, empirically determined to allow good distributions

class RectangularThermalMovableModelElement extends UserMovableModelElement {
  /**
   * @param {Vector2} initialPosition
   * @param {number} width
   * @param {number} height
   * @param {number} mass - in kg
   * @param {number} specificHeat - in J/kg-K
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {Object} [options]
   */
  constructor(initialPosition, width, height, mass, specificHeat, energyChunksVisibleProperty, energyChunkGroup, options) {
    options = merge({
      // {null|EnergyChunkWanderController} - This must be supplied to add EnergyChunks outside of the slices in this
      // element. Usages of this largely correspond to approachingEnergyChunks. See addEnergyChunk() for details.
      energyChunkWanderControllerGroup: null,
      // {Object[]} - pre-distributed energy chunk arrangement, used during initialization and reset to more rapidly
      // set up the model element with reasonably distributed energy chunks.
      predistributedEnergyChunkConfigurations: [],
      // phet-io
      tandem: Tandem.REQUIRED
    }, options);
    super(initialPosition, options);

    // @public (read-only)
    this.mass = mass;
    this.width = width;
    this.height = height;
    this.specificHeat = specificHeat;
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // @public (read-only) {NumberProperty} - the amount of energy in this model element, in joules
    this.energyProperty = new NumberProperty(this.mass * this.specificHeat * EFACConstants.ROOM_TEMPERATURE, {
      units: 'J',
      tandem: options.tandem.createTandem('energyProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the amount of energy in the model element'
    });
    assert && assert(this.mass > 0, `Invalid mass: ${this.mass}`);
    assert && assert(this.specificHeat > 0, `Invalid specific heat: ${this.specificHeat}`);

    // @public (read-only) {ObservableArrayDef} - energy chunks that are approaching this model element
    this.approachingEnergyChunks = createObservableArray({
      tandem: options.tandem.createTandem('approachingEnergyChunks'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunk.EnergyChunkIO))
    });

    // @private - motion controllers for the energy chunks that are approaching this model element
    this.energyChunkWanderControllers = createObservableArray({
      tandem: options.tandem.createTandem('energyChunkWanderControllers'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunkWanderController.EnergyChunkWanderControllerIO))
    });

    // @private {Object[]} - pre-distributed energy chunk configuration,used for fast initialization, see usages for format
    this.predistributedEnergyChunkConfigurations = options.predistributedEnergyChunkConfigurations;

    // @private {Bounds2} - composite bounds for this model element, maintained as position changes
    this.bounds = Bounds2.NOTHING.copy();

    // @private - {EnergyChunkPhetioGroup}
    this.energyChunkGroup = energyChunkGroup;

    // @private - {EnergyChunkWanderControllerGroup}
    this.energyChunkWanderControllerGroup = options.energyChunkWanderControllerGroup;

    // @protected {ThermalContactArea} - the 2D area for this element where it can be in contact with another thermal
    // elements and thus exchange heat, generally set by descendant classes
    this.thermalContactArea = new ThermalContactArea(Bounds2.NOTHING.copy(), false);

    // @public (read-only) {NumberProperty}
    this.temperatureProperty = new NumberProperty(EFACConstants.ROOM_TEMPERATURE, {
      range: new Range(EFACConstants.WATER_FREEZING_POINT_TEMPERATURE, 700),
      // in kelvin, empirically determined max
      units: 'K',
      tandem: options.tandem.createTandem('temperatureProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the temperature of the element'
    });

    // update the composite bounds as the model element moves
    this.positionProperty.link(position => {
      this.bounds.setMinMax(position.x - width / 2, position.y, position.x + width / 2, position.y + height);
    });

    // @private {Dot.Rectangle} - untranslated bounds for this model element
    this.untransformedBounds = new Rectangle(-this.width / 2, 0, this.width, this.height);

    // @private {Bounds2} - composite relative bounds for this model element, cached after first calculation
    this.relativeCompositeBounds = null;

    // @private {Shape} - untranslated shape that accounts for 3D projection
    const forwardPerspectiveOffset = EFACConstants.MAP_Z_TO_XY_OFFSET(EFACConstants.BLOCK_SURFACE_WIDTH / 2);
    const backwardPerspectiveOffset = EFACConstants.MAP_Z_TO_XY_OFFSET(-EFACConstants.BLOCK_SURFACE_WIDTH / 2);
    this.untranslatedProjectedShape = new Shape().moveToPoint(new Vector2(-width / 2, 0).plus(forwardPerspectiveOffset)).lineToPoint(new Vector2(width / 2, 0).plus(forwardPerspectiveOffset)).lineToPoint(new Vector2(width / 2, 0).plus(backwardPerspectiveOffset)).lineToPoint(new Vector2(width / 2, height).plus(backwardPerspectiveOffset)).lineToPoint(new Vector2(-width / 2, height).plus(backwardPerspectiveOffset)).lineToPoint(new Vector2(-width / 2, height).plus(forwardPerspectiveOffset)).close();

    // @private {Shape} - The projected shape translated to the current position.  This is only updated when requested,
    // so should never be accessed directly, since it could be out of date.  See the associated getter method.
    this.latestProjectedShape = this.untranslatedProjectedShape;

    // @private {Vector2} - the position when the projected shape was last updated, used to tell if update is needed
    this.latestProjectedShapePosition = Vector2.ZERO;

    // @private {Matrix3} - a reusable matrix, used to reduce allocations when updating the projected shape
    this.translationMatrix = Matrix3.translation(initialPosition.x, initialPosition.y);

    // @private {number} - a value that is used to implement a countdown timer for energy chunk redistribution
    this.energyChunkDistributionCountdownTimer = 0;

    // perform the initial update of the projected shape
    this.getProjectedShape();

    // when an approaching energy chunk is removed from the list, make sure its wander controller goes away too
    this.approachingEnergyChunks.addItemRemovedListener(removedEC => {
      // When setting PhET-iO state, the wander controllers will already be created to be the right values, so don't
      // mutate them in this listener.
      if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
        // find the wander controller that is controlling the motion of this energy chunk
        const wanderController = this.energyChunkWanderControllers.find(wanderController => {
          return wanderController.energyChunk === removedEC;
        });
        assert && assert(wanderController, 'there should always be a wander controller for each approaching EC');
        this.energyChunkWanderControllers.remove(wanderController);
        assert && assert(this.energyChunkWanderControllerGroup, 'use of approachingEnergyChunks requires an energyChunkWanderControllerGroup');

        // dispose the wander controller
        this.energyChunkWanderControllerGroup.disposeElement(wanderController);
      }
    });

    // @private {number} - minimum amount of energy that this is allowed to have
    this.minEnergy = EFACConstants.WATER_FREEZING_POINT_TEMPERATURE * mass * specificHeat;

    // @public (read-only) {ObservableArrayDef.<EnergyChunkContainerSlice>} 2D "slices" of the container, used for 3D layering of energy
    // chunks in the view
    this.slices = createObservableArray({
      tandem: options.tandem.createTandem('slices'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(IOType.ObjectIO))
    });

    // add the slices
    this.addEnergyChunkSlices();

    // add the initial energy chunks
    this.addInitialEnergyChunks();
  }

  /**
   * Get the composite bounds, meaning the total rectangular bounds occupied by this model element, for the provided
   * position, which may well not be the model element's current position.  This is essentially asking, "what would
   * your 2D bounds be if you were at this position?"
   * @param {Vector2} position
   * @param {Bounds2} [bounds] - an optional pre-allocated bounds instance, saves memory allocations
   * @public
   */
  getCompositeBoundsForPosition(position, bounds) {
    // if the relative composite bounds have not yet been calculated do it now - should only be necessary once
    if (!this.relativeCompositeBounds) {
      const relativeCompositeBounds = Bounds2.NOTHING.copy();
      this.relativePositionTestingBoundsList.forEach(relativePositionTestingBounds => {
        relativeCompositeBounds.includeBounds(relativePositionTestingBounds);
      });
      this.relativeCompositeBounds = relativeCompositeBounds;
    }

    // allocate a Bounds2 instance if none was provided
    if (!bounds) {
      bounds = Bounds2.NOTHING.copy();
    }
    bounds.setMinMax(this.relativeCompositeBounds.minX + position.x, this.relativeCompositeBounds.minY + position.y, this.relativeCompositeBounds.maxX + position.x, this.relativeCompositeBounds.maxY + position.y);
    return bounds;
  }

  /**
   * get the untranslated rectangle
   * @returns {Dot.Rectangle}
   * @public
   */
  getUntransformedBounds() {
    return this.untransformedBounds;
  }

  /**
   * get the bounds for this model element, meaning the full rectangular space that it occupies
   * @returns {Bounds2}
   * @public
   */
  getBounds() {
    return this.bounds;
  }

  /**
   * change the energy of this element by the desired value
   * @param {number} deltaEnergy
   * @public
   */
  changeEnergy(deltaEnergy) {
    assert && assert(!_.isNaN(deltaEnergy), `invalided deltaEnergy, value = ${deltaEnergy}`);
    this.energyProperty.value += deltaEnergy;
  }

  /**
   * get the current energy content
   * @returns {number}
   * @public
   */
  getEnergy() {
    return this.energyProperty.value;
  }

  /**
   * get the amount of energy above the minimum allowed
   * @returns {number}
   * @public
   */
  getEnergyAboveMinimum() {
    return this.energyProperty.value - this.minEnergy;
  }

  /**
   * get the temperature of this element as a function of energy, mass, and specific heat
   * @returns {number}
   * @public
   */
  getTemperature() {
    assert && assert(this.energyProperty.value >= 0, `Invalid energy: ${this.energyProperty.value}`);
    return this.energyProperty.value / (this.mass * this.specificHeat);
  }
  get temperature() {
    return this.getTemperature();
  }

  /**
   * restore initial state
   * @public
   */
  reset() {
    super.reset();
    this.energyProperty.reset();
    this.temperatureProperty.reset();
    this.addInitialEnergyChunks(); // This clears out and disposes old energy chunks in the slices too
    this.approachingEnergyChunks.reset();
    this.clearECDistributionCountdown();
    this.energyChunkWanderControllers.forEach(wanderController => this.energyChunkWanderControllerGroup.disposeElement(wanderController));
    this.energyChunkWanderControllers.clear();
  }

  /**
   * step function to move this model element forward in time
   * @param {number} dt - time step in seconds
   * @public
   */
  step(dt) {
    this.temperatureProperty.set(this.getTemperature());
    if (this.energyChunkDistributionCountdownTimer > 0) {
      // distribute the energy chunks contained within this model element
      const redistributed = energyChunkDistributor.updatePositions(this.slices.slice(), dt);
      if (!redistributed) {
        // the energy chunks are reasonably well distributed, no more needed, so clear the countdown timer
        this.clearECDistributionCountdown();
      } else {
        // decrement the countdown timer
        this.energyChunkDistributionCountdownTimer = Math.max(this.energyChunkDistributionCountdownTimer - dt, 0);
      }
    }

    // animate the energy chunks that are outside this model element
    this.animateNonContainedEnergyChunks(dt);
  }

  /**
   * This function is called to animate energy chunks that are drifting towards the container, e.g. from the burner.
   * It is NOT called during "evaporation", even though the chunks are "non-contained".
   * @param {number} dt - time step, in seconds
   * @private
   */
  animateNonContainedEnergyChunks(dt) {
    // work from a copy of the list of wander controllers in case the list ends up changing
    const ecWanderControllers = this.energyChunkWanderControllers.slice();
    ecWanderControllers.forEach(ecWanderController => {
      ecWanderController.updatePosition(dt);
      if (this.getSliceBounds().containsPoint(ecWanderController.energyChunk.positionProperty.value)) {
        this.moveEnergyChunkToSlices(ecWanderController.energyChunk);
      }
    });
  }

  /**
   * Add an energy chunk to this model element.  The energy chunk can be outside of the element's rectangular bounds,
   * in which case it is added to the list of chunks that are moving towards the element, or it can be positioned
   * already inside, in which case it is immediately added to one of the energy chunk "slices".
   * @param {EnergyChunk} energyChunk
   * @public
   */
  addEnergyChunk(energyChunk) {
    const bounds = this.getSliceBounds();

    // energy chunk is positioned within container bounds, so add it directly to a slice
    if (bounds.containsPoint(energyChunk.positionProperty.value)) {
      this.addEnergyChunkToSlice(energyChunk);
    }

    // chunk is out of the bounds of this element, so make it wander towards it
    else {
      energyChunk.zPosition = 0;
      assert && assert(this.energyChunkWanderControllerGroup, 'The use of approachingEnergyChunks requires an energyChunkWanderControllerGroup');
      this.approachingEnergyChunks.push(energyChunk);
      this.energyChunkWanderControllers.push(this.energyChunkWanderControllerGroup.createNextElement(energyChunk, this.positionProperty));
    }
  }

  /**
   * add an energy chunk to one of the energy chunk container slices owned by this model element
   * @param {EnergyChunk} energyChunk
   * @protected
   */
  addEnergyChunkToSlice(energyChunk) {
    // start with a slice at or near the middle of the order
    let sliceIndex = Math.floor((this.slices.length - 1) / 2);
    let sliceIndexWithLowestEnergyDensity = null;
    let lowestEnergyDensityFound = Number.NEGATIVE_INFINITY;
    for (let ecSliceCount = 0; ecSliceCount < this.slices.length; ecSliceCount++) {
      const slice = this.slices.get(sliceIndex);
      const sliceArea = slice.bounds.width * slice.bounds.height;
      const energyChunkDensity = slice.getNumberOfEnergyChunks() / sliceArea;
      if (sliceIndexWithLowestEnergyDensity === null || energyChunkDensity < lowestEnergyDensityFound) {
        sliceIndexWithLowestEnergyDensity = sliceIndex;
        lowestEnergyDensityFound = energyChunkDensity;
      }
      sliceIndex = (sliceIndex + 1) % this.slices.length;
    }

    // add the energy chunk to the slice with the lowest density of energy chunks
    this.slices.get(sliceIndexWithLowestEnergyDensity).addEnergyChunk(energyChunk);

    // trigger redistribution of the energy chunks
    this.resetECDistributionCountdown();
  }

  /**
   * get the composite bounds of all the slices that are used to hold the energy chunks
   * @returns {Bounds2}
   * @public
   */
  getSliceBounds() {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    this.slices.forEach(slice => {
      const sliceBounds = slice.bounds;
      if (sliceBounds.minX < minX) {
        minX = sliceBounds.minX;
      }
      if (sliceBounds.maxX > maxX) {
        maxX = sliceBounds.maxX;
      }
      if (sliceBounds.minY < minY) {
        minY = sliceBounds.minY;
      }
      if (sliceBounds.maxY > maxY) {
        maxY = sliceBounds.maxY;
      }
    });
    return new Bounds2(minX, minY, maxX, maxY);
  }

  /**
   * Transfer an EnergyChunk from the approachingEnergyChunks list to a slice in this model element. Find the
   * corresponding wander controller and remove it. A new wander controller is then associated with the transferred
   * chunk via a call to addEnergyChunk.
   * @param {EnergyChunk} energyChunk
   * @protected
   */
  moveEnergyChunkToSlices(energyChunk) {
    this.approachingEnergyChunks.remove(energyChunk);
    this.addEnergyChunkToSlice(energyChunk);
  }

  /**
   * Remove an energy chunk from whatever energy chunk list it belongs to. If the chunk does not belong to a specific
   * energy chunk list, return false.
   * @param {EnergyChunk} energyChunk
   * @returns {boolean}
   * @public
   */
  removeEnergyChunk(energyChunk) {
    this.slices.forEach(slice => {
      if (slice.energyChunkList.indexOf(energyChunk) >= 0) {
        slice.energyChunkList.remove(energyChunk);
        this.resetECDistributionCountdown();
        return true;
      }
      return false;
    });
    return false;
  }

  /**
   * Locate, remove, and return the energy chunk that is closed to the provided point.  Compensate distances for the
   * z-offset so that z-positioning doesn't skew the results, since the provided point is 2D.
   * @param {Vector2} point - comparison point
   * @returns {EnergyChunk||null} closestEnergyChunk, null if there are none available
   * @public
   */
  extractEnergyChunkClosestToPoint(point) {
    // make sure this element doesn't give up all its energy chunks
    if (this.getNumberOfEnergyChunksInElement() <= 1) {
      return null;
    }
    let closestEnergyChunk = null;
    let closestCompensatedDistance = Number.POSITIVE_INFINITY;

    // identify the closest energy chunk
    this.slices.forEach(slice => {
      slice.energyChunkList.forEach(energyChunk => {
        // compensate for the Z offset, otherwise front chunk will almost always be chosen
        const compensatedEnergyChunkPosition = energyChunk.positionProperty.value.minusXY(0, EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER * energyChunk.zPositionProperty.value);
        const compensatedDistance = compensatedEnergyChunkPosition.distance(point);
        if (compensatedDistance < closestCompensatedDistance) {
          closestEnergyChunk = energyChunk;
          closestCompensatedDistance = compensatedDistance;
        }
      });
    });
    this.removeEnergyChunk(closestEnergyChunk);
    return closestEnergyChunk;
  }

  /**
   * extract an energy chunk that is a good choice for being transferred to the provided rectangular bounds
   * @param {Bounds2} destinationBounds
   * @returns {EnergyChunk|null} - a suitable energy chunk or null if no energy chunks are available
   * @public
   */
  extractEnergyChunkClosestToBounds(destinationBounds) {
    // make sure this element doesn't give up all its energy chunks
    if (this.getNumberOfEnergyChunksInElement() <= 1) {
      return null;
    }
    let chunkToExtract = null;
    const myBounds = this.getSliceBounds();
    if (destinationBounds.containsBounds(this.thermalContactArea)) {
      // this element's shape is contained by the destination - pick a chunk near our right or left edge
      let closestDistanceToVerticalEdge = Number.POSITIVE_INFINITY;
      this.slices.forEach(slice => {
        slice.energyChunkList.forEach(energyChunk => {
          const distanceToVerticalEdge = Math.min(Math.abs(myBounds.minX - energyChunk.positionProperty.value.x), Math.abs(myBounds.maxX - energyChunk.positionProperty.value.x));
          if (distanceToVerticalEdge < closestDistanceToVerticalEdge) {
            chunkToExtract = energyChunk;
            closestDistanceToVerticalEdge = distanceToVerticalEdge;
          }
        });
      });
    } else if (this.thermalContactArea.containsBounds(destinationBounds)) {
      // This element's shape encloses the destination shape - choose a chunk that is close but doesn't overlap with
      // the destination shape.
      let closestDistanceToDestinationEdge = Number.POSITIVE_INFINITY;
      this.slices.forEach(slice => {
        slice.energyChunkList.forEach(energyChunk => {
          const distanceToDestinationEdge = Math.min(Math.abs(destinationBounds.minX - energyChunk.positionProperty.value.x), Math.abs(destinationBounds.maxX - energyChunk.positionProperty.value.x));
          if (!destinationBounds.containsPoint(energyChunk.positionProperty.value) && distanceToDestinationEdge < closestDistanceToDestinationEdge) {
            chunkToExtract = energyChunk;
            closestDistanceToDestinationEdge = distanceToDestinationEdge;
          }
        });
      });
    } else {
      // there is no or limited overlap, so use center points
      chunkToExtract = this.extractEnergyChunkClosestToPoint(destinationBounds.getCenter());
    }

    // fail safe - if nothing found, get the first chunk
    if (chunkToExtract === null) {
      console.warn('No energy chunk found by extraction algorithm, trying first available..');
      for (let i = 0; i < this.slices.length; i++) {
        if (this.slices.get(i).energyChunkList.length > 0) {
          chunkToExtract = this.slices.get(i).energyChunkList.get(0);
          break;
        }
      }
      if (chunkToExtract === null) {
        console.warn('No chunks available for extraction.');
      }
    }
    this.removeEnergyChunk(chunkToExtract);
    return chunkToExtract;
  }

  /**
   * Initialization method that add the "slices" where the energy chunks reside. Should be called only once at
   * initialization.
   * @protected
   * @abstract
   */
  addEnergyChunkSlices() {
    assert && assert(false, 'subtypes should implement their chunk slice creation');
  }

  /**
   *  add initial energy chunks to this model element
   *  @protected
   */
  addInitialEnergyChunks() {
    let totalSliceArea = 0;

    // remove the current set of energy chunks, calculate total area of the slices
    this.slices.forEach(slice => {
      slice.energyChunkList.forEach(chunk => this.energyChunkGroup.disposeElement(chunk));
      slice.energyChunkList.clear();
      totalSliceArea += slice.bounds.width * slice.bounds.height;
    });

    // calculate the number of energy chunks to add based on the amount of energy
    const targetNumberOfEnergyChunks = EFACConstants.ENERGY_TO_NUM_CHUNKS_MAPPER(this.energyProperty.value);

    // see if there is preset data that matches this configuration
    const presetData = this.predistributedEnergyChunkConfigurations.find(presetDataEntry => {
      return targetNumberOfEnergyChunks === presetDataEntry.numberOfEnergyChunks && this.slices.length === presetDataEntry.numberOfSlices && Math.abs(totalSliceArea - presetDataEntry.totalSliceArea) / totalSliceArea < 0.001; // tolerance empirically determined
    });

    // As of late September 2020 there should be preset data for the initial energy chunk configuration for all thermal
    // model elements used in the sim, so the following assertion should only be hit if a new element has been added or
    // something has been changed about one of the existing ones.  In that case, new preset data should be added.  See
    // https://github.com/phetsims/energy-forms-and-changes/issues/375.
    assert && assert(presetData, 'No preset data found, has something changed about one of the thermal model elements?');
    if (presetData) {
      this.slices.forEach((slice, sliceIndex) => {
        const energyChunkPositions = presetData.energyChunkPositionsBySlice[sliceIndex];
        energyChunkPositions.forEach(energyChunkPosition => {
          slice.addEnergyChunk(this.energyChunkGroup.createNextElement(EnergyType.THERMAL, new Vector2(energyChunkPosition.positionX, energyChunkPosition.positionY), Vector2.ZERO, this.energyChunksVisibleProperty));
        });
      });
    } else {
      this.addAndDistributeInitialEnergyChunks(targetNumberOfEnergyChunks);
    }
  }

  /**
   * Add and distribute energy chunks within this model element algorithmically.  This version works well for simple
   * rectangular model elements, but may need to be overridden for more complex geometries.
   * @param {number} targetNumberOfEnergyChunks
   * @protected
   */
  addAndDistributeInitialEnergyChunks(targetNumberOfEnergyChunks) {
    const smallOffset = 0.00001; // used so that the ECs don't start on top of each other

    // start with the middle slice and cycle through in order, adding chunks evenly to each
    let slideIndex = Math.floor(this.slices.length / 2) - 1;
    let numberOfEnergyChunksAdded = 0;
    while (numberOfEnergyChunksAdded < targetNumberOfEnergyChunks) {
      const slice = this.slices.get(slideIndex);
      const numberOfEnergyChunksInSlice = slice.getNumberOfEnergyChunks();
      const center = slice.bounds.center.plusXY(smallOffset * numberOfEnergyChunksAdded, smallOffset * numberOfEnergyChunksInSlice);
      slice.addEnergyChunk(this.energyChunkGroup.createNextElement(EnergyType.THERMAL, center, Vector2.ZERO, this.energyChunksVisibleProperty));
      numberOfEnergyChunksAdded++;
      slideIndex = (slideIndex + 1) % this.slices.length;
    }

    // clear the distribution timer and do a more thorough distribution below
    this.clearECDistributionCountdown();

    // distribute the initial energy chunks within the container using the repulsive algorithm
    for (let i = 0; i < EFACConstants.MAX_NUMBER_OF_INITIALIZATION_DISTRIBUTION_CYCLES; i++) {
      const distributed = energyChunkDistributor.updatePositions(this.slices.slice(), EFACConstants.SIM_TIME_PER_TICK_NORMAL);
      if (!distributed) {
        break;
      }
    }
  }

  /**
   * This method is used to output a JSON data structure containing the number of energy chunk slices, the total
   * volume, and the number and position of each energy chunk on each slice.  In the production version of the
   * simulation, this is generally not used.  It is only used to gather data that can be used for initial energy chunk
   * positions that can be used to make initialization faster.  See
   * https://github.com/phetsims/energy-forms-and-changes/issues/375
   * @public
   */
  dumpEnergyChunkData() {
    let totalSliceArea = 0;
    let numberOfEnergyChunks = 0;
    this.slices.forEach(slice => {
      totalSliceArea += slice.bounds.width * slice.bounds.height;
      numberOfEnergyChunks += slice.energyChunkList.length;
    });
    const energyChunkInfo = {
      numberOfSlices: this.slices.length,
      totalSliceArea: totalSliceArea,
      numberOfEnergyChunks: numberOfEnergyChunks,
      energyChunkPositionsBySlice: []
    };
    this.slices.forEach((slice, sliceIndex) => {
      energyChunkInfo.energyChunkPositionsBySlice[sliceIndex] = [];
      slice.energyChunkList.forEach(energyChunk => {
        energyChunkInfo.energyChunkPositionsBySlice[sliceIndex].push({
          positionX: energyChunk.positionProperty.value.x,
          positionY: energyChunk.positionProperty.value.y
        });
      });
    });
    console.log(JSON.stringify(energyChunkInfo, null, 2));
  }

  /**
   * get the number of energy chunks that are actually in the element, excluding any that are on the way
   * @returns {number}
   * @private
   */
  getNumberOfEnergyChunksInElement() {
    let numberOfChunks = 0;
    this.slices.forEach(slice => {
      numberOfChunks += slice.getNumberOfEnergyChunks();
    });
    return numberOfChunks;
  }

  /**
   * @returns {number}
   * @public
   */
  getNumberOfEnergyChunks() {
    return this.getNumberOfEnergyChunksInElement() + this.approachingEnergyChunks.length;
  }

  /**
   * @param {RectangularThermalMovableModelElement} otherEnergyContainer
   * @param {number} dt - time of contact, in seconds
   * @returns {number} - amount of energy exchanged, in joules
   * @public
   */
  exchangeEnergyWith(otherEnergyContainer, dt) {
    let amountOfEnergyExchanged = 0; // direction is from this to the other
    const thermalContactLength = this.thermalContactArea.getThermalContactLength(otherEnergyContainer.thermalContactArea);
    if (thermalContactLength > 0) {
      const deltaT = otherEnergyContainer.getTemperature() - this.getTemperature();

      // exchange energy between this and the other energy container
      if (Math.abs(deltaT) > EFACConstants.TEMPERATURES_EQUAL_THRESHOLD) {
        const heatTransferConstant = HeatTransferConstants.getHeatTransferFactor(this.energyContainerCategory, otherEnergyContainer.energyContainerCategory);
        const numberOfFullTimeStepExchanges = Math.floor(dt / EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP);
        const leftoverTime = dt - numberOfFullTimeStepExchanges * EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP;
        for (let i = 0; i < numberOfFullTimeStepExchanges + 1; i++) {
          const timeStep = i < numberOfFullTimeStepExchanges ? EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;
          const thermalEnergyGained = (otherEnergyContainer.getTemperature() - this.getTemperature()) * thermalContactLength * heatTransferConstant * timeStep;
          otherEnergyContainer.changeEnergy(-thermalEnergyGained);
          this.changeEnergy(thermalEnergyGained);
          amountOfEnergyExchanged += -thermalEnergyGained;
        }
      }
    }
    return amountOfEnergyExchanged;
  }

  /**
   * Get the shape as is is projected into 3D in the view.  Ideally, this wouldn't even be in the model, because it
   * would be purely handled in the view, but it proved necessary.
   * @returns {Shape}
   * @public
   */
  getProjectedShape() {
    const currentPosition = this.positionProperty.get();

    // update the projected shape only if the position has changed since the last request
    if (!this.latestProjectedShapePosition.equals(currentPosition)) {
      this.translationMatrix.setToTranslation(currentPosition.x, currentPosition.y);
      this.latestProjectedShape = this.untranslatedProjectedShape.transformed(this.translationMatrix);
      this.latestProjectedShapePosition = this.positionProperty.get();
    }
    return this.latestProjectedShape;
  }

  /**
   * @returns {Vector2}
   * @public
   */
  getCenterPoint() {
    const position = this.positionProperty.value;
    return new Vector2(position.x, position.y + this.height / 2);
  }

  /**
   * @returns {Vector2}
   * @public
   */
  getCenterTopPoint() {
    const position = this.positionProperty.value;
    return new Vector2(position.x, position.y + this.height);
  }

  /**
   * Get a number indicating the balance between the energy level and the number of energy chunks owned by this model
   * element.  Returns 0 if the number of energy chunks matches the energy level, a negative value if there is a
   * deficit, and a positive value if there is a surplus.
   * @returns {number}
   * @public
   */
  getEnergyChunkBalance() {
    return this.getNumberOfEnergyChunks() - EFACConstants.ENERGY_TO_NUM_CHUNKS_MAPPER(this.energyProperty.value);
  }

  /**
   * Reset the energy chunk distribution countdown timer, which will cause EC distribution to start and continue
   * until the countdown reaches zero or no more distribution is needed.
   * @protected
   */
  resetECDistributionCountdown() {
    this.energyChunkDistributionCountdownTimer = MAX_ENERGY_CHUNK_REDISTRIBUTION_TIME;
  }

  /**
   * clear the redistribution countdown timer, which will stop any further redistribution
   * @protected
   */
  clearECDistributionCountdown() {
    this.energyChunkDistributionCountdownTimer = 0;
  }
}
energyFormsAndChanges.register('RectangularThermalMovableModelElement', RectangularThermalMovableModelElement);
export default RectangularThermalMovableModelElement;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJOdW1iZXJQcm9wZXJ0eSIsIkJvdW5kczIiLCJNYXRyaXgzIiwiUmFuZ2UiLCJSZWN0YW5nbGUiLCJWZWN0b3IyIiwiU2hhcGUiLCJtZXJnZSIsIlRhbmRlbSIsIklPVHlwZSIsIlJlZmVyZW5jZUlPIiwiZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIiwiRUZBQ0NvbnN0YW50cyIsIkVuZXJneUNodW5rIiwiZW5lcmd5Q2h1bmtEaXN0cmlidXRvciIsIkVuZXJneUNodW5rV2FuZGVyQ29udHJvbGxlciIsIkVuZXJneVR5cGUiLCJIZWF0VHJhbnNmZXJDb25zdGFudHMiLCJUaGVybWFsQ29udGFjdEFyZWEiLCJVc2VyTW92YWJsZU1vZGVsRWxlbWVudCIsIk1BWF9FTkVSR1lfQ0hVTktfUkVESVNUUklCVVRJT05fVElNRSIsIlJlY3Rhbmd1bGFyVGhlcm1hbE1vdmFibGVNb2RlbEVsZW1lbnQiLCJjb25zdHJ1Y3RvciIsImluaXRpYWxQb3NpdGlvbiIsIndpZHRoIiwiaGVpZ2h0IiwibWFzcyIsInNwZWNpZmljSGVhdCIsImVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSIsImVuZXJneUNodW5rR3JvdXAiLCJvcHRpb25zIiwiZW5lcmd5Q2h1bmtXYW5kZXJDb250cm9sbGVyR3JvdXAiLCJwcmVkaXN0cmlidXRlZEVuZXJneUNodW5rQ29uZmlndXJhdGlvbnMiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsImVuZXJneVByb3BlcnR5IiwiUk9PTV9URU1QRVJBVFVSRSIsInVuaXRzIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9IaWdoRnJlcXVlbmN5IiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImFzc2VydCIsImFwcHJvYWNoaW5nRW5lcmd5Q2h1bmtzIiwicGhldGlvVHlwZSIsIk9ic2VydmFibGVBcnJheUlPIiwiRW5lcmd5Q2h1bmtJTyIsImVuZXJneUNodW5rV2FuZGVyQ29udHJvbGxlcnMiLCJFbmVyZ3lDaHVua1dhbmRlckNvbnRyb2xsZXJJTyIsImJvdW5kcyIsIk5PVEhJTkciLCJjb3B5IiwidGhlcm1hbENvbnRhY3RBcmVhIiwidGVtcGVyYXR1cmVQcm9wZXJ0eSIsInJhbmdlIiwiV0FURVJfRlJFRVpJTkdfUE9JTlRfVEVNUEVSQVRVUkUiLCJwb3NpdGlvblByb3BlcnR5IiwibGluayIsInBvc2l0aW9uIiwic2V0TWluTWF4IiwieCIsInkiLCJ1bnRyYW5zZm9ybWVkQm91bmRzIiwicmVsYXRpdmVDb21wb3NpdGVCb3VuZHMiLCJmb3J3YXJkUGVyc3BlY3RpdmVPZmZzZXQiLCJNQVBfWl9UT19YWV9PRkZTRVQiLCJCTE9DS19TVVJGQUNFX1dJRFRIIiwiYmFja3dhcmRQZXJzcGVjdGl2ZU9mZnNldCIsInVudHJhbnNsYXRlZFByb2plY3RlZFNoYXBlIiwibW92ZVRvUG9pbnQiLCJwbHVzIiwibGluZVRvUG9pbnQiLCJjbG9zZSIsImxhdGVzdFByb2plY3RlZFNoYXBlIiwibGF0ZXN0UHJvamVjdGVkU2hhcGVQb3NpdGlvbiIsIlpFUk8iLCJ0cmFuc2xhdGlvbk1hdHJpeCIsInRyYW5zbGF0aW9uIiwiZW5lcmd5Q2h1bmtEaXN0cmlidXRpb25Db3VudGRvd25UaW1lciIsImdldFByb2plY3RlZFNoYXBlIiwiYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciIsInJlbW92ZWRFQyIsInBoZXQiLCJqb2lzdCIsInNpbSIsImlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkiLCJ2YWx1ZSIsIndhbmRlckNvbnRyb2xsZXIiLCJmaW5kIiwiZW5lcmd5Q2h1bmsiLCJyZW1vdmUiLCJkaXNwb3NlRWxlbWVudCIsIm1pbkVuZXJneSIsInNsaWNlcyIsIk9iamVjdElPIiwiYWRkRW5lcmd5Q2h1bmtTbGljZXMiLCJhZGRJbml0aWFsRW5lcmd5Q2h1bmtzIiwiZ2V0Q29tcG9zaXRlQm91bmRzRm9yUG9zaXRpb24iLCJyZWxhdGl2ZVBvc2l0aW9uVGVzdGluZ0JvdW5kc0xpc3QiLCJmb3JFYWNoIiwicmVsYXRpdmVQb3NpdGlvblRlc3RpbmdCb3VuZHMiLCJpbmNsdWRlQm91bmRzIiwibWluWCIsIm1pblkiLCJtYXhYIiwibWF4WSIsImdldFVudHJhbnNmb3JtZWRCb3VuZHMiLCJnZXRCb3VuZHMiLCJjaGFuZ2VFbmVyZ3kiLCJkZWx0YUVuZXJneSIsIl8iLCJpc05hTiIsImdldEVuZXJneSIsImdldEVuZXJneUFib3ZlTWluaW11bSIsImdldFRlbXBlcmF0dXJlIiwidGVtcGVyYXR1cmUiLCJyZXNldCIsImNsZWFyRUNEaXN0cmlidXRpb25Db3VudGRvd24iLCJjbGVhciIsInN0ZXAiLCJkdCIsInNldCIsInJlZGlzdHJpYnV0ZWQiLCJ1cGRhdGVQb3NpdGlvbnMiLCJzbGljZSIsIk1hdGgiLCJtYXgiLCJhbmltYXRlTm9uQ29udGFpbmVkRW5lcmd5Q2h1bmtzIiwiZWNXYW5kZXJDb250cm9sbGVycyIsImVjV2FuZGVyQ29udHJvbGxlciIsInVwZGF0ZVBvc2l0aW9uIiwiZ2V0U2xpY2VCb3VuZHMiLCJjb250YWluc1BvaW50IiwibW92ZUVuZXJneUNodW5rVG9TbGljZXMiLCJhZGRFbmVyZ3lDaHVuayIsImFkZEVuZXJneUNodW5rVG9TbGljZSIsInpQb3NpdGlvbiIsInB1c2giLCJjcmVhdGVOZXh0RWxlbWVudCIsInNsaWNlSW5kZXgiLCJmbG9vciIsImxlbmd0aCIsInNsaWNlSW5kZXhXaXRoTG93ZXN0RW5lcmd5RGVuc2l0eSIsImxvd2VzdEVuZXJneURlbnNpdHlGb3VuZCIsIk51bWJlciIsIk5FR0FUSVZFX0lORklOSVRZIiwiZWNTbGljZUNvdW50IiwiZ2V0Iiwic2xpY2VBcmVhIiwiZW5lcmd5Q2h1bmtEZW5zaXR5IiwiZ2V0TnVtYmVyT2ZFbmVyZ3lDaHVua3MiLCJyZXNldEVDRGlzdHJpYnV0aW9uQ291bnRkb3duIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJzbGljZUJvdW5kcyIsInJlbW92ZUVuZXJneUNodW5rIiwiZW5lcmd5Q2h1bmtMaXN0IiwiaW5kZXhPZiIsImV4dHJhY3RFbmVyZ3lDaHVua0Nsb3Nlc3RUb1BvaW50IiwicG9pbnQiLCJnZXROdW1iZXJPZkVuZXJneUNodW5rc0luRWxlbWVudCIsImNsb3Nlc3RFbmVyZ3lDaHVuayIsImNsb3Nlc3RDb21wZW5zYXRlZERpc3RhbmNlIiwiY29tcGVuc2F0ZWRFbmVyZ3lDaHVua1Bvc2l0aW9uIiwibWludXNYWSIsIlpfVE9fWV9PRkZTRVRfTVVMVElQTElFUiIsInpQb3NpdGlvblByb3BlcnR5IiwiY29tcGVuc2F0ZWREaXN0YW5jZSIsImRpc3RhbmNlIiwiZXh0cmFjdEVuZXJneUNodW5rQ2xvc2VzdFRvQm91bmRzIiwiZGVzdGluYXRpb25Cb3VuZHMiLCJjaHVua1RvRXh0cmFjdCIsIm15Qm91bmRzIiwiY29udGFpbnNCb3VuZHMiLCJjbG9zZXN0RGlzdGFuY2VUb1ZlcnRpY2FsRWRnZSIsImRpc3RhbmNlVG9WZXJ0aWNhbEVkZ2UiLCJtaW4iLCJhYnMiLCJjbG9zZXN0RGlzdGFuY2VUb0Rlc3RpbmF0aW9uRWRnZSIsImRpc3RhbmNlVG9EZXN0aW5hdGlvbkVkZ2UiLCJnZXRDZW50ZXIiLCJjb25zb2xlIiwid2FybiIsImkiLCJ0b3RhbFNsaWNlQXJlYSIsImNodW5rIiwidGFyZ2V0TnVtYmVyT2ZFbmVyZ3lDaHVua3MiLCJFTkVSR1lfVE9fTlVNX0NIVU5LU19NQVBQRVIiLCJwcmVzZXREYXRhIiwicHJlc2V0RGF0YUVudHJ5IiwibnVtYmVyT2ZFbmVyZ3lDaHVua3MiLCJudW1iZXJPZlNsaWNlcyIsImVuZXJneUNodW5rUG9zaXRpb25zIiwiZW5lcmd5Q2h1bmtQb3NpdGlvbnNCeVNsaWNlIiwiZW5lcmd5Q2h1bmtQb3NpdGlvbiIsIlRIRVJNQUwiLCJwb3NpdGlvblgiLCJwb3NpdGlvblkiLCJhZGRBbmREaXN0cmlidXRlSW5pdGlhbEVuZXJneUNodW5rcyIsInNtYWxsT2Zmc2V0Iiwic2xpZGVJbmRleCIsIm51bWJlck9mRW5lcmd5Q2h1bmtzQWRkZWQiLCJudW1iZXJPZkVuZXJneUNodW5rc0luU2xpY2UiLCJjZW50ZXIiLCJwbHVzWFkiLCJNQVhfTlVNQkVSX09GX0lOSVRJQUxJWkFUSU9OX0RJU1RSSUJVVElPTl9DWUNMRVMiLCJkaXN0cmlidXRlZCIsIlNJTV9USU1FX1BFUl9USUNLX05PUk1BTCIsImR1bXBFbmVyZ3lDaHVua0RhdGEiLCJlbmVyZ3lDaHVua0luZm8iLCJsb2ciLCJKU09OIiwic3RyaW5naWZ5IiwibnVtYmVyT2ZDaHVua3MiLCJleGNoYW5nZUVuZXJneVdpdGgiLCJvdGhlckVuZXJneUNvbnRhaW5lciIsImFtb3VudE9mRW5lcmd5RXhjaGFuZ2VkIiwidGhlcm1hbENvbnRhY3RMZW5ndGgiLCJnZXRUaGVybWFsQ29udGFjdExlbmd0aCIsImRlbHRhVCIsIlRFTVBFUkFUVVJFU19FUVVBTF9USFJFU0hPTEQiLCJoZWF0VHJhbnNmZXJDb25zdGFudCIsImdldEhlYXRUcmFuc2ZlckZhY3RvciIsImVuZXJneUNvbnRhaW5lckNhdGVnb3J5IiwibnVtYmVyT2ZGdWxsVGltZVN0ZXBFeGNoYW5nZXMiLCJNQVhfSEVBVF9FWENIQU5HRV9USU1FX1NURVAiLCJsZWZ0b3ZlclRpbWUiLCJ0aW1lU3RlcCIsInRoZXJtYWxFbmVyZ3lHYWluZWQiLCJjdXJyZW50UG9zaXRpb24iLCJlcXVhbHMiLCJzZXRUb1RyYW5zbGF0aW9uIiwidHJhbnNmb3JtZWQiLCJnZXRDZW50ZXJQb2ludCIsImdldENlbnRlclRvcFBvaW50IiwiZ2V0RW5lcmd5Q2h1bmtCYWxhbmNlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJSZWN0YW5ndWxhclRoZXJtYWxNb3ZhYmxlTW9kZWxFbGVtZW50LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlY3Rhbmd1bGFyVGhlcm1hbE1vdmFibGVNb2RlbEVsZW1lbnQgaXMgYSBiYXNlIGNsYXNzIGZvciBhIG1vdmFibGUgbW9kZWwgZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZXJtYWwgZW5lcmd5IGFuZFxyXG4gKiB0aGF0LCBhdCBsZWFzdCBpbiB0aGUgbW9kZWwsIGhhcyBhbiBvdmVyYWxsIHNoYXBlIHRoYXQgY2FuIGJlIHJlcHJlc2VudGVkIGFzIGEgcmVjdGFuZ2xlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IGNyZWF0ZU9ic2VydmFibGVBcnJheSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ2xlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SZWN0YW5nbGUuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBSZWZlcmVuY2VJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvUmVmZXJlbmNlSU8uanMnO1xyXG5pbXBvcnQgZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIGZyb20gJy4uLy4uL2VuZXJneUZvcm1zQW5kQ2hhbmdlcy5qcyc7XHJcbmltcG9ydCBFRkFDQ29uc3RhbnRzIGZyb20gJy4uL0VGQUNDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRW5lcmd5Q2h1bmsgZnJvbSAnLi9FbmVyZ3lDaHVuay5qcyc7XHJcbmltcG9ydCBlbmVyZ3lDaHVua0Rpc3RyaWJ1dG9yIGZyb20gJy4vZW5lcmd5Q2h1bmtEaXN0cmlidXRvci5qcyc7XHJcbmltcG9ydCBFbmVyZ3lDaHVua1dhbmRlckNvbnRyb2xsZXIgZnJvbSAnLi9FbmVyZ3lDaHVua1dhbmRlckNvbnRyb2xsZXIuanMnO1xyXG5pbXBvcnQgRW5lcmd5VHlwZSBmcm9tICcuL0VuZXJneVR5cGUuanMnO1xyXG5pbXBvcnQgSGVhdFRyYW5zZmVyQ29uc3RhbnRzIGZyb20gJy4vSGVhdFRyYW5zZmVyQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFRoZXJtYWxDb250YWN0QXJlYSBmcm9tICcuL1RoZXJtYWxDb250YWN0QXJlYS5qcyc7XHJcbmltcG9ydCBVc2VyTW92YWJsZU1vZGVsRWxlbWVudCBmcm9tICcuL1VzZXJNb3ZhYmxlTW9kZWxFbGVtZW50LmpzJztcclxuXHJcbi8vIGNvbnN0XHJcbmNvbnN0IE1BWF9FTkVSR1lfQ0hVTktfUkVESVNUUklCVVRJT05fVElNRSA9IDI7IC8vIGluIHNlY29uZHMsIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gYWxsb3cgZ29vZCBkaXN0cmlidXRpb25zXHJcblxyXG5jbGFzcyBSZWN0YW5ndWxhclRoZXJtYWxNb3ZhYmxlTW9kZWxFbGVtZW50IGV4dGVuZHMgVXNlck1vdmFibGVNb2RlbEVsZW1lbnQge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGluaXRpYWxQb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWFzcyAtIGluIGtnXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNwZWNpZmljSGVhdCAtIGluIEova2ctS1xyXG4gICAqIEBwYXJhbSB7Qm9vbGVhblByb3BlcnR5fSBlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge0VuZXJneUNodW5rR3JvdXB9IGVuZXJneUNodW5rR3JvdXBcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGluaXRpYWxQb3NpdGlvbiwgd2lkdGgsIGhlaWdodCwgbWFzcywgc3BlY2lmaWNIZWF0LCBlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHksIGVuZXJneUNodW5rR3JvdXAsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyB7bnVsbHxFbmVyZ3lDaHVua1dhbmRlckNvbnRyb2xsZXJ9IC0gVGhpcyBtdXN0IGJlIHN1cHBsaWVkIHRvIGFkZCBFbmVyZ3lDaHVua3Mgb3V0c2lkZSBvZiB0aGUgc2xpY2VzIGluIHRoaXNcclxuICAgICAgLy8gZWxlbWVudC4gVXNhZ2VzIG9mIHRoaXMgbGFyZ2VseSBjb3JyZXNwb25kIHRvIGFwcHJvYWNoaW5nRW5lcmd5Q2h1bmtzLiBTZWUgYWRkRW5lcmd5Q2h1bmsoKSBmb3IgZGV0YWlscy5cclxuICAgICAgZW5lcmd5Q2h1bmtXYW5kZXJDb250cm9sbGVyR3JvdXA6IG51bGwsXHJcblxyXG4gICAgICAvLyB7T2JqZWN0W119IC0gcHJlLWRpc3RyaWJ1dGVkIGVuZXJneSBjaHVuayBhcnJhbmdlbWVudCwgdXNlZCBkdXJpbmcgaW5pdGlhbGl6YXRpb24gYW5kIHJlc2V0IHRvIG1vcmUgcmFwaWRseVxyXG4gICAgICAvLyBzZXQgdXAgdGhlIG1vZGVsIGVsZW1lbnQgd2l0aCByZWFzb25hYmx5IGRpc3RyaWJ1dGVkIGVuZXJneSBjaHVua3MuXHJcbiAgICAgIHByZWRpc3RyaWJ1dGVkRW5lcmd5Q2h1bmtDb25maWd1cmF0aW9uczogW10sXHJcblxyXG4gICAgICAvLyBwaGV0LWlvXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIGluaXRpYWxQb3NpdGlvbiwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIHRoaXMubWFzcyA9IG1hc3M7XHJcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICAgIHRoaXMuc3BlY2lmaWNIZWF0ID0gc3BlY2lmaWNIZWF0O1xyXG4gICAgdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHkgPSBlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7TnVtYmVyUHJvcGVydHl9IC0gdGhlIGFtb3VudCBvZiBlbmVyZ3kgaW4gdGhpcyBtb2RlbCBlbGVtZW50LCBpbiBqb3VsZXNcclxuICAgIHRoaXMuZW5lcmd5UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIHRoaXMubWFzcyAqIHRoaXMuc3BlY2lmaWNIZWF0ICogRUZBQ0NvbnN0YW50cy5ST09NX1RFTVBFUkFUVVJFLCB7XHJcbiAgICAgIHVuaXRzOiAnSicsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5UHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGhlIGFtb3VudCBvZiBlbmVyZ3kgaW4gdGhlIG1vZGVsIGVsZW1lbnQnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5tYXNzID4gMCwgYEludmFsaWQgbWFzczogJHt0aGlzLm1hc3N9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zcGVjaWZpY0hlYXQgPiAwLCBgSW52YWxpZCBzcGVjaWZpYyBoZWF0OiAke3RoaXMuc3BlY2lmaWNIZWF0fWAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtPYnNlcnZhYmxlQXJyYXlEZWZ9IC0gZW5lcmd5IGNodW5rcyB0aGF0IGFyZSBhcHByb2FjaGluZyB0aGlzIG1vZGVsIGVsZW1lbnRcclxuICAgIHRoaXMuYXBwcm9hY2hpbmdFbmVyZ3lDaHVua3MgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdhcHByb2FjaGluZ0VuZXJneUNodW5rcycgKSxcclxuICAgICAgcGhldGlvVHlwZTogY3JlYXRlT2JzZXJ2YWJsZUFycmF5Lk9ic2VydmFibGVBcnJheUlPKCBSZWZlcmVuY2VJTyggRW5lcmd5Q2h1bmsuRW5lcmd5Q2h1bmtJTyApIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIG1vdGlvbiBjb250cm9sbGVycyBmb3IgdGhlIGVuZXJneSBjaHVua3MgdGhhdCBhcmUgYXBwcm9hY2hpbmcgdGhpcyBtb2RlbCBlbGVtZW50XHJcbiAgICB0aGlzLmVuZXJneUNodW5rV2FuZGVyQ29udHJvbGxlcnMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbmVyZ3lDaHVua1dhbmRlckNvbnRyb2xsZXJzJyApLFxyXG4gICAgICBwaGV0aW9UeXBlOiBjcmVhdGVPYnNlcnZhYmxlQXJyYXkuT2JzZXJ2YWJsZUFycmF5SU8oIFJlZmVyZW5jZUlPKCBFbmVyZ3lDaHVua1dhbmRlckNvbnRyb2xsZXIuRW5lcmd5Q2h1bmtXYW5kZXJDb250cm9sbGVySU8gKSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge09iamVjdFtdfSAtIHByZS1kaXN0cmlidXRlZCBlbmVyZ3kgY2h1bmsgY29uZmlndXJhdGlvbix1c2VkIGZvciBmYXN0IGluaXRpYWxpemF0aW9uLCBzZWUgdXNhZ2VzIGZvciBmb3JtYXRcclxuICAgIHRoaXMucHJlZGlzdHJpYnV0ZWRFbmVyZ3lDaHVua0NvbmZpZ3VyYXRpb25zID0gb3B0aW9ucy5wcmVkaXN0cmlidXRlZEVuZXJneUNodW5rQ29uZmlndXJhdGlvbnM7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0JvdW5kczJ9IC0gY29tcG9zaXRlIGJvdW5kcyBmb3IgdGhpcyBtb2RlbCBlbGVtZW50LCBtYWludGFpbmVkIGFzIHBvc2l0aW9uIGNoYW5nZXNcclxuICAgIHRoaXMuYm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHtFbmVyZ3lDaHVua1BoZXRpb0dyb3VwfVxyXG4gICAgdGhpcy5lbmVyZ3lDaHVua0dyb3VwID0gZW5lcmd5Q2h1bmtHcm91cDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHtFbmVyZ3lDaHVua1dhbmRlckNvbnRyb2xsZXJHcm91cH1cclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtXYW5kZXJDb250cm9sbGVyR3JvdXAgPSBvcHRpb25zLmVuZXJneUNodW5rV2FuZGVyQ29udHJvbGxlckdyb3VwO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQge1RoZXJtYWxDb250YWN0QXJlYX0gLSB0aGUgMkQgYXJlYSBmb3IgdGhpcyBlbGVtZW50IHdoZXJlIGl0IGNhbiBiZSBpbiBjb250YWN0IHdpdGggYW5vdGhlciB0aGVybWFsXHJcbiAgICAvLyBlbGVtZW50cyBhbmQgdGh1cyBleGNoYW5nZSBoZWF0LCBnZW5lcmFsbHkgc2V0IGJ5IGRlc2NlbmRhbnQgY2xhc3Nlc1xyXG4gICAgdGhpcy50aGVybWFsQ29udGFjdEFyZWEgPSBuZXcgVGhlcm1hbENvbnRhY3RBcmVhKCBCb3VuZHMyLk5PVEhJTkcuY29weSgpLCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge051bWJlclByb3BlcnR5fVxyXG4gICAgdGhpcy50ZW1wZXJhdHVyZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBFRkFDQ29uc3RhbnRzLlJPT01fVEVNUEVSQVRVUkUsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggRUZBQ0NvbnN0YW50cy5XQVRFUl9GUkVFWklOR19QT0lOVF9URU1QRVJBVFVSRSwgNzAwICksIC8vIGluIGtlbHZpbiwgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCBtYXhcclxuICAgICAgdW5pdHM6ICdLJyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0ZW1wZXJhdHVyZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSB0ZW1wZXJhdHVyZSBvZiB0aGUgZWxlbWVudCdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIGNvbXBvc2l0ZSBib3VuZHMgYXMgdGhlIG1vZGVsIGVsZW1lbnQgbW92ZXNcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBwb3NpdGlvbiA9PiB7XHJcbiAgICAgIHRoaXMuYm91bmRzLnNldE1pbk1heChcclxuICAgICAgICBwb3NpdGlvbi54IC0gd2lkdGggLyAyLFxyXG4gICAgICAgIHBvc2l0aW9uLnksXHJcbiAgICAgICAgcG9zaXRpb24ueCArIHdpZHRoIC8gMixcclxuICAgICAgICBwb3NpdGlvbi55ICsgaGVpZ2h0XHJcbiAgICAgICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0RvdC5SZWN0YW5nbGV9IC0gdW50cmFuc2xhdGVkIGJvdW5kcyBmb3IgdGhpcyBtb2RlbCBlbGVtZW50XHJcbiAgICB0aGlzLnVudHJhbnNmb3JtZWRCb3VuZHMgPSBuZXcgUmVjdGFuZ2xlKCAtdGhpcy53aWR0aCAvIDIsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0JvdW5kczJ9IC0gY29tcG9zaXRlIHJlbGF0aXZlIGJvdW5kcyBmb3IgdGhpcyBtb2RlbCBlbGVtZW50LCBjYWNoZWQgYWZ0ZXIgZmlyc3QgY2FsY3VsYXRpb25cclxuICAgIHRoaXMucmVsYXRpdmVDb21wb3NpdGVCb3VuZHMgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtTaGFwZX0gLSB1bnRyYW5zbGF0ZWQgc2hhcGUgdGhhdCBhY2NvdW50cyBmb3IgM0QgcHJvamVjdGlvblxyXG4gICAgY29uc3QgZm9yd2FyZFBlcnNwZWN0aXZlT2Zmc2V0ID0gRUZBQ0NvbnN0YW50cy5NQVBfWl9UT19YWV9PRkZTRVQoIEVGQUNDb25zdGFudHMuQkxPQ0tfU1VSRkFDRV9XSURUSCAvIDIgKTtcclxuICAgIGNvbnN0IGJhY2t3YXJkUGVyc3BlY3RpdmVPZmZzZXQgPSBFRkFDQ29uc3RhbnRzLk1BUF9aX1RPX1hZX09GRlNFVCggLUVGQUNDb25zdGFudHMuQkxPQ0tfU1VSRkFDRV9XSURUSCAvIDIgKTtcclxuICAgIHRoaXMudW50cmFuc2xhdGVkUHJvamVjdGVkU2hhcGUgPSBuZXcgU2hhcGUoKVxyXG4gICAgICAubW92ZVRvUG9pbnQoIG5ldyBWZWN0b3IyKCAtd2lkdGggLyAyLCAwICkucGx1cyggZm9yd2FyZFBlcnNwZWN0aXZlT2Zmc2V0ICkgKVxyXG4gICAgICAubGluZVRvUG9pbnQoIG5ldyBWZWN0b3IyKCB3aWR0aCAvIDIsIDAgKS5wbHVzKCBmb3J3YXJkUGVyc3BlY3RpdmVPZmZzZXQgKSApXHJcbiAgICAgIC5saW5lVG9Qb2ludCggbmV3IFZlY3RvcjIoIHdpZHRoIC8gMiwgMCApLnBsdXMoIGJhY2t3YXJkUGVyc3BlY3RpdmVPZmZzZXQgKSApXHJcbiAgICAgIC5saW5lVG9Qb2ludCggbmV3IFZlY3RvcjIoIHdpZHRoIC8gMiwgaGVpZ2h0ICkucGx1cyggYmFja3dhcmRQZXJzcGVjdGl2ZU9mZnNldCApIClcclxuICAgICAgLmxpbmVUb1BvaW50KCBuZXcgVmVjdG9yMiggLXdpZHRoIC8gMiwgaGVpZ2h0ICkucGx1cyggYmFja3dhcmRQZXJzcGVjdGl2ZU9mZnNldCApIClcclxuICAgICAgLmxpbmVUb1BvaW50KCBuZXcgVmVjdG9yMiggLXdpZHRoIC8gMiwgaGVpZ2h0ICkucGx1cyggZm9yd2FyZFBlcnNwZWN0aXZlT2Zmc2V0ICkgKVxyXG4gICAgICAuY2xvc2UoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7U2hhcGV9IC0gVGhlIHByb2plY3RlZCBzaGFwZSB0cmFuc2xhdGVkIHRvIHRoZSBjdXJyZW50IHBvc2l0aW9uLiAgVGhpcyBpcyBvbmx5IHVwZGF0ZWQgd2hlbiByZXF1ZXN0ZWQsXHJcbiAgICAvLyBzbyBzaG91bGQgbmV2ZXIgYmUgYWNjZXNzZWQgZGlyZWN0bHksIHNpbmNlIGl0IGNvdWxkIGJlIG91dCBvZiBkYXRlLiAgU2VlIHRoZSBhc3NvY2lhdGVkIGdldHRlciBtZXRob2QuXHJcbiAgICB0aGlzLmxhdGVzdFByb2plY3RlZFNoYXBlID0gdGhpcy51bnRyYW5zbGF0ZWRQcm9qZWN0ZWRTaGFwZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VmVjdG9yMn0gLSB0aGUgcG9zaXRpb24gd2hlbiB0aGUgcHJvamVjdGVkIHNoYXBlIHdhcyBsYXN0IHVwZGF0ZWQsIHVzZWQgdG8gdGVsbCBpZiB1cGRhdGUgaXMgbmVlZGVkXHJcbiAgICB0aGlzLmxhdGVzdFByb2plY3RlZFNoYXBlUG9zaXRpb24gPSBWZWN0b3IyLlpFUk87XHJcblxyXG4gICAgLy8gQHByaXZhdGUge01hdHJpeDN9IC0gYSByZXVzYWJsZSBtYXRyaXgsIHVzZWQgdG8gcmVkdWNlIGFsbG9jYXRpb25zIHdoZW4gdXBkYXRpbmcgdGhlIHByb2plY3RlZCBzaGFwZVxyXG4gICAgdGhpcy50cmFuc2xhdGlvbk1hdHJpeCA9IE1hdHJpeDMudHJhbnNsYXRpb24oIGluaXRpYWxQb3NpdGlvbi54LCBpbml0aWFsUG9zaXRpb24ueSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gYSB2YWx1ZSB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IGEgY291bnRkb3duIHRpbWVyIGZvciBlbmVyZ3kgY2h1bmsgcmVkaXN0cmlidXRpb25cclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtEaXN0cmlidXRpb25Db3VudGRvd25UaW1lciA9IDA7XHJcblxyXG4gICAgLy8gcGVyZm9ybSB0aGUgaW5pdGlhbCB1cGRhdGUgb2YgdGhlIHByb2plY3RlZCBzaGFwZVxyXG4gICAgdGhpcy5nZXRQcm9qZWN0ZWRTaGFwZSgpO1xyXG5cclxuICAgIC8vIHdoZW4gYW4gYXBwcm9hY2hpbmcgZW5lcmd5IGNodW5rIGlzIHJlbW92ZWQgZnJvbSB0aGUgbGlzdCwgbWFrZSBzdXJlIGl0cyB3YW5kZXIgY29udHJvbGxlciBnb2VzIGF3YXkgdG9vXHJcbiAgICB0aGlzLmFwcHJvYWNoaW5nRW5lcmd5Q2h1bmtzLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIHJlbW92ZWRFQyA9PiB7XHJcblxyXG4gICAgICAvLyBXaGVuIHNldHRpbmcgUGhFVC1pTyBzdGF0ZSwgdGhlIHdhbmRlciBjb250cm9sbGVycyB3aWxsIGFscmVhZHkgYmUgY3JlYXRlZCB0byBiZSB0aGUgcmlnaHQgdmFsdWVzLCBzbyBkb24ndFxyXG4gICAgICAvLyBtdXRhdGUgdGhlbSBpbiB0aGlzIGxpc3RlbmVyLlxyXG4gICAgICBpZiAoICFwaGV0LmpvaXN0LnNpbS5pc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICkge1xyXG5cclxuXHJcbiAgICAgICAgLy8gZmluZCB0aGUgd2FuZGVyIGNvbnRyb2xsZXIgdGhhdCBpcyBjb250cm9sbGluZyB0aGUgbW90aW9uIG9mIHRoaXMgZW5lcmd5IGNodW5rXHJcbiAgICAgICAgY29uc3Qgd2FuZGVyQ29udHJvbGxlciA9IHRoaXMuZW5lcmd5Q2h1bmtXYW5kZXJDb250cm9sbGVycy5maW5kKCB3YW5kZXJDb250cm9sbGVyID0+IHtcclxuICAgICAgICAgIHJldHVybiB3YW5kZXJDb250cm9sbGVyLmVuZXJneUNodW5rID09PSByZW1vdmVkRUM7XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB3YW5kZXJDb250cm9sbGVyLCAndGhlcmUgc2hvdWxkIGFsd2F5cyBiZSBhIHdhbmRlciBjb250cm9sbGVyIGZvciBlYWNoIGFwcHJvYWNoaW5nIEVDJyApO1xyXG5cclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rV2FuZGVyQ29udHJvbGxlcnMucmVtb3ZlKCB3YW5kZXJDb250cm9sbGVyICk7XHJcblxyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZW5lcmd5Q2h1bmtXYW5kZXJDb250cm9sbGVyR3JvdXAsICd1c2Ugb2YgYXBwcm9hY2hpbmdFbmVyZ3lDaHVua3MgcmVxdWlyZXMgYW4gZW5lcmd5Q2h1bmtXYW5kZXJDb250cm9sbGVyR3JvdXAnICk7XHJcblxyXG4gICAgICAgIC8vIGRpc3Bvc2UgdGhlIHdhbmRlciBjb250cm9sbGVyXHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua1dhbmRlckNvbnRyb2xsZXJHcm91cC5kaXNwb3NlRWxlbWVudCggd2FuZGVyQ29udHJvbGxlciApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBtaW5pbXVtIGFtb3VudCBvZiBlbmVyZ3kgdGhhdCB0aGlzIGlzIGFsbG93ZWQgdG8gaGF2ZVxyXG4gICAgdGhpcy5taW5FbmVyZ3kgPSBFRkFDQ29uc3RhbnRzLldBVEVSX0ZSRUVaSU5HX1BPSU5UX1RFTVBFUkFUVVJFICogbWFzcyAqIHNwZWNpZmljSGVhdDtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtPYnNlcnZhYmxlQXJyYXlEZWYuPEVuZXJneUNodW5rQ29udGFpbmVyU2xpY2U+fSAyRCBcInNsaWNlc1wiIG9mIHRoZSBjb250YWluZXIsIHVzZWQgZm9yIDNEIGxheWVyaW5nIG9mIGVuZXJneVxyXG4gICAgLy8gY2h1bmtzIGluIHRoZSB2aWV3XHJcbiAgICB0aGlzLnNsaWNlcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NsaWNlcycgKSxcclxuICAgICAgcGhldGlvVHlwZTogY3JlYXRlT2JzZXJ2YWJsZUFycmF5Lk9ic2VydmFibGVBcnJheUlPKCBSZWZlcmVuY2VJTyggSU9UeXBlLk9iamVjdElPICkgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgc2xpY2VzXHJcbiAgICB0aGlzLmFkZEVuZXJneUNodW5rU2xpY2VzKCk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBpbml0aWFsIGVuZXJneSBjaHVua3NcclxuICAgIHRoaXMuYWRkSW5pdGlhbEVuZXJneUNodW5rcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBjb21wb3NpdGUgYm91bmRzLCBtZWFuaW5nIHRoZSB0b3RhbCByZWN0YW5ndWxhciBib3VuZHMgb2NjdXBpZWQgYnkgdGhpcyBtb2RlbCBlbGVtZW50LCBmb3IgdGhlIHByb3ZpZGVkXHJcbiAgICogcG9zaXRpb24sIHdoaWNoIG1heSB3ZWxsIG5vdCBiZSB0aGUgbW9kZWwgZWxlbWVudCdzIGN1cnJlbnQgcG9zaXRpb24uICBUaGlzIGlzIGVzc2VudGlhbGx5IGFza2luZywgXCJ3aGF0IHdvdWxkXHJcbiAgICogeW91ciAyRCBib3VuZHMgYmUgaWYgeW91IHdlcmUgYXQgdGhpcyBwb3NpdGlvbj9cIlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IFtib3VuZHNdIC0gYW4gb3B0aW9uYWwgcHJlLWFsbG9jYXRlZCBib3VuZHMgaW5zdGFuY2UsIHNhdmVzIG1lbW9yeSBhbGxvY2F0aW9uc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRDb21wb3NpdGVCb3VuZHNGb3JQb3NpdGlvbiggcG9zaXRpb24sIGJvdW5kcyApIHtcclxuXHJcbiAgICAvLyBpZiB0aGUgcmVsYXRpdmUgY29tcG9zaXRlIGJvdW5kcyBoYXZlIG5vdCB5ZXQgYmVlbiBjYWxjdWxhdGVkIGRvIGl0IG5vdyAtIHNob3VsZCBvbmx5IGJlIG5lY2Vzc2FyeSBvbmNlXHJcbiAgICBpZiAoICF0aGlzLnJlbGF0aXZlQ29tcG9zaXRlQm91bmRzICkge1xyXG5cclxuICAgICAgY29uc3QgcmVsYXRpdmVDb21wb3NpdGVCb3VuZHMgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpO1xyXG5cclxuICAgICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uVGVzdGluZ0JvdW5kc0xpc3QuZm9yRWFjaCggcmVsYXRpdmVQb3NpdGlvblRlc3RpbmdCb3VuZHMgPT4ge1xyXG4gICAgICAgIHJlbGF0aXZlQ29tcG9zaXRlQm91bmRzLmluY2x1ZGVCb3VuZHMoIHJlbGF0aXZlUG9zaXRpb25UZXN0aW5nQm91bmRzICk7XHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5yZWxhdGl2ZUNvbXBvc2l0ZUJvdW5kcyA9IHJlbGF0aXZlQ29tcG9zaXRlQm91bmRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFsbG9jYXRlIGEgQm91bmRzMiBpbnN0YW5jZSBpZiBub25lIHdhcyBwcm92aWRlZFxyXG4gICAgaWYgKCAhYm91bmRzICkge1xyXG4gICAgICBib3VuZHMgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGJvdW5kcy5zZXRNaW5NYXgoXHJcbiAgICAgIHRoaXMucmVsYXRpdmVDb21wb3NpdGVCb3VuZHMubWluWCArIHBvc2l0aW9uLngsXHJcbiAgICAgIHRoaXMucmVsYXRpdmVDb21wb3NpdGVCb3VuZHMubWluWSArIHBvc2l0aW9uLnksXHJcbiAgICAgIHRoaXMucmVsYXRpdmVDb21wb3NpdGVCb3VuZHMubWF4WCArIHBvc2l0aW9uLngsXHJcbiAgICAgIHRoaXMucmVsYXRpdmVDb21wb3NpdGVCb3VuZHMubWF4WSArIHBvc2l0aW9uLnlcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIGJvdW5kcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGdldCB0aGUgdW50cmFuc2xhdGVkIHJlY3RhbmdsZVxyXG4gICAqIEByZXR1cm5zIHtEb3QuUmVjdGFuZ2xlfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRVbnRyYW5zZm9ybWVkQm91bmRzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudW50cmFuc2Zvcm1lZEJvdW5kcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGdldCB0aGUgYm91bmRzIGZvciB0aGlzIG1vZGVsIGVsZW1lbnQsIG1lYW5pbmcgdGhlIGZ1bGwgcmVjdGFuZ3VsYXIgc3BhY2UgdGhhdCBpdCBvY2N1cGllc1xyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRCb3VuZHMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ib3VuZHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBjaGFuZ2UgdGhlIGVuZXJneSBvZiB0aGlzIGVsZW1lbnQgYnkgdGhlIGRlc2lyZWQgdmFsdWVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVsdGFFbmVyZ3lcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY2hhbmdlRW5lcmd5KCBkZWx0YUVuZXJneSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFfLmlzTmFOKCBkZWx0YUVuZXJneSApLCBgaW52YWxpZGVkIGRlbHRhRW5lcmd5LCB2YWx1ZSA9ICR7ZGVsdGFFbmVyZ3l9YCApO1xyXG4gICAgdGhpcy5lbmVyZ3lQcm9wZXJ0eS52YWx1ZSArPSBkZWx0YUVuZXJneTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGdldCB0aGUgY3VycmVudCBlbmVyZ3kgY29udGVudFxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldEVuZXJneSgpIHtcclxuICAgIHJldHVybiB0aGlzLmVuZXJneVByb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZ2V0IHRoZSBhbW91bnQgb2YgZW5lcmd5IGFib3ZlIHRoZSBtaW5pbXVtIGFsbG93ZWRcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRFbmVyZ3lBYm92ZU1pbmltdW0oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbmVyZ3lQcm9wZXJ0eS52YWx1ZSAtIHRoaXMubWluRW5lcmd5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZ2V0IHRoZSB0ZW1wZXJhdHVyZSBvZiB0aGlzIGVsZW1lbnQgYXMgYSBmdW5jdGlvbiBvZiBlbmVyZ3ksIG1hc3MsIGFuZCBzcGVjaWZpYyBoZWF0XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0VGVtcGVyYXR1cmUoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmVuZXJneVByb3BlcnR5LnZhbHVlID49IDAsIGBJbnZhbGlkIGVuZXJneTogJHt0aGlzLmVuZXJneVByb3BlcnR5LnZhbHVlfWAgKTtcclxuICAgIHJldHVybiB0aGlzLmVuZXJneVByb3BlcnR5LnZhbHVlIC8gKCB0aGlzLm1hc3MgKiB0aGlzLnNwZWNpZmljSGVhdCApO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHRlbXBlcmF0dXJlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VGVtcGVyYXR1cmUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHJlc3RvcmUgaW5pdGlhbCBzdGF0ZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgICB0aGlzLmVuZXJneVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRlbXBlcmF0dXJlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYWRkSW5pdGlhbEVuZXJneUNodW5rcygpOyAvLyBUaGlzIGNsZWFycyBvdXQgYW5kIGRpc3Bvc2VzIG9sZCBlbmVyZ3kgY2h1bmtzIGluIHRoZSBzbGljZXMgdG9vXHJcbiAgICB0aGlzLmFwcHJvYWNoaW5nRW5lcmd5Q2h1bmtzLnJlc2V0KCk7XHJcbiAgICB0aGlzLmNsZWFyRUNEaXN0cmlidXRpb25Db3VudGRvd24oKTtcclxuXHJcbiAgICB0aGlzLmVuZXJneUNodW5rV2FuZGVyQ29udHJvbGxlcnMuZm9yRWFjaCggd2FuZGVyQ29udHJvbGxlciA9PiB0aGlzLmVuZXJneUNodW5rV2FuZGVyQ29udHJvbGxlckdyb3VwLmRpc3Bvc2VFbGVtZW50KCB3YW5kZXJDb250cm9sbGVyICkgKTtcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtXYW5kZXJDb250cm9sbGVycy5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc3RlcCBmdW5jdGlvbiB0byBtb3ZlIHRoaXMgbW9kZWwgZWxlbWVudCBmb3J3YXJkIGluIHRpbWVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSB0aW1lIHN0ZXAgaW4gc2Vjb25kc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMudGVtcGVyYXR1cmVQcm9wZXJ0eS5zZXQoIHRoaXMuZ2V0VGVtcGVyYXR1cmUoKSApO1xyXG5cclxuICAgIGlmICggdGhpcy5lbmVyZ3lDaHVua0Rpc3RyaWJ1dGlvbkNvdW50ZG93blRpbWVyID4gMCApIHtcclxuXHJcbiAgICAgIC8vIGRpc3RyaWJ1dGUgdGhlIGVuZXJneSBjaHVua3MgY29udGFpbmVkIHdpdGhpbiB0aGlzIG1vZGVsIGVsZW1lbnRcclxuICAgICAgY29uc3QgcmVkaXN0cmlidXRlZCA9IGVuZXJneUNodW5rRGlzdHJpYnV0b3IudXBkYXRlUG9zaXRpb25zKCB0aGlzLnNsaWNlcy5zbGljZSgpLCBkdCApO1xyXG5cclxuICAgICAgaWYgKCAhcmVkaXN0cmlidXRlZCApIHtcclxuXHJcbiAgICAgICAgLy8gdGhlIGVuZXJneSBjaHVua3MgYXJlIHJlYXNvbmFibHkgd2VsbCBkaXN0cmlidXRlZCwgbm8gbW9yZSBuZWVkZWQsIHNvIGNsZWFyIHRoZSBjb3VudGRvd24gdGltZXJcclxuICAgICAgICB0aGlzLmNsZWFyRUNEaXN0cmlidXRpb25Db3VudGRvd24oKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gZGVjcmVtZW50IHRoZSBjb3VudGRvd24gdGltZXJcclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rRGlzdHJpYnV0aW9uQ291bnRkb3duVGltZXIgPSBNYXRoLm1heCggdGhpcy5lbmVyZ3lDaHVua0Rpc3RyaWJ1dGlvbkNvdW50ZG93blRpbWVyIC0gZHQsIDAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGFuaW1hdGUgdGhlIGVuZXJneSBjaHVua3MgdGhhdCBhcmUgb3V0c2lkZSB0aGlzIG1vZGVsIGVsZW1lbnRcclxuICAgIHRoaXMuYW5pbWF0ZU5vbkNvbnRhaW5lZEVuZXJneUNodW5rcyggZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHRvIGFuaW1hdGUgZW5lcmd5IGNodW5rcyB0aGF0IGFyZSBkcmlmdGluZyB0b3dhcmRzIHRoZSBjb250YWluZXIsIGUuZy4gZnJvbSB0aGUgYnVybmVyLlxyXG4gICAqIEl0IGlzIE5PVCBjYWxsZWQgZHVyaW5nIFwiZXZhcG9yYXRpb25cIiwgZXZlbiB0aG91Z2ggdGhlIGNodW5rcyBhcmUgXCJub24tY29udGFpbmVkXCIuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBhbmltYXRlTm9uQ29udGFpbmVkRW5lcmd5Q2h1bmtzKCBkdCApIHtcclxuXHJcbiAgICAvLyB3b3JrIGZyb20gYSBjb3B5IG9mIHRoZSBsaXN0IG9mIHdhbmRlciBjb250cm9sbGVycyBpbiBjYXNlIHRoZSBsaXN0IGVuZHMgdXAgY2hhbmdpbmdcclxuICAgIGNvbnN0IGVjV2FuZGVyQ29udHJvbGxlcnMgPSB0aGlzLmVuZXJneUNodW5rV2FuZGVyQ29udHJvbGxlcnMuc2xpY2UoKTtcclxuXHJcbiAgICBlY1dhbmRlckNvbnRyb2xsZXJzLmZvckVhY2goIGVjV2FuZGVyQ29udHJvbGxlciA9PiB7XHJcbiAgICAgIGVjV2FuZGVyQ29udHJvbGxlci51cGRhdGVQb3NpdGlvbiggZHQgKTtcclxuICAgICAgaWYgKCB0aGlzLmdldFNsaWNlQm91bmRzKCkuY29udGFpbnNQb2ludCggZWNXYW5kZXJDb250cm9sbGVyLmVuZXJneUNodW5rLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKSApIHtcclxuICAgICAgICB0aGlzLm1vdmVFbmVyZ3lDaHVua1RvU2xpY2VzKCBlY1dhbmRlckNvbnRyb2xsZXIuZW5lcmd5Q2h1bmsgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGFuIGVuZXJneSBjaHVuayB0byB0aGlzIG1vZGVsIGVsZW1lbnQuICBUaGUgZW5lcmd5IGNodW5rIGNhbiBiZSBvdXRzaWRlIG9mIHRoZSBlbGVtZW50J3MgcmVjdGFuZ3VsYXIgYm91bmRzLFxyXG4gICAqIGluIHdoaWNoIGNhc2UgaXQgaXMgYWRkZWQgdG8gdGhlIGxpc3Qgb2YgY2h1bmtzIHRoYXQgYXJlIG1vdmluZyB0b3dhcmRzIHRoZSBlbGVtZW50LCBvciBpdCBjYW4gYmUgcG9zaXRpb25lZFxyXG4gICAqIGFscmVhZHkgaW5zaWRlLCBpbiB3aGljaCBjYXNlIGl0IGlzIGltbWVkaWF0ZWx5IGFkZGVkIHRvIG9uZSBvZiB0aGUgZW5lcmd5IGNodW5rIFwic2xpY2VzXCIuXHJcbiAgICogQHBhcmFtIHtFbmVyZ3lDaHVua30gZW5lcmd5Q2h1bmtcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWRkRW5lcmd5Q2h1bmsoIGVuZXJneUNodW5rICkge1xyXG4gICAgY29uc3QgYm91bmRzID0gdGhpcy5nZXRTbGljZUJvdW5kcygpO1xyXG5cclxuICAgIC8vIGVuZXJneSBjaHVuayBpcyBwb3NpdGlvbmVkIHdpdGhpbiBjb250YWluZXIgYm91bmRzLCBzbyBhZGQgaXQgZGlyZWN0bHkgdG8gYSBzbGljZVxyXG4gICAgaWYgKCBib3VuZHMuY29udGFpbnNQb2ludCggZW5lcmd5Q2h1bmsucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApICkge1xyXG4gICAgICB0aGlzLmFkZEVuZXJneUNodW5rVG9TbGljZSggZW5lcmd5Q2h1bmsgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjaHVuayBpcyBvdXQgb2YgdGhlIGJvdW5kcyBvZiB0aGlzIGVsZW1lbnQsIHNvIG1ha2UgaXQgd2FuZGVyIHRvd2FyZHMgaXRcclxuICAgIGVsc2Uge1xyXG4gICAgICBlbmVyZ3lDaHVuay56UG9zaXRpb24gPSAwO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmVuZXJneUNodW5rV2FuZGVyQ29udHJvbGxlckdyb3VwLCAnVGhlIHVzZSBvZiBhcHByb2FjaGluZ0VuZXJneUNodW5rcyByZXF1aXJlcyBhbiBlbmVyZ3lDaHVua1dhbmRlckNvbnRyb2xsZXJHcm91cCcgKTtcclxuICAgICAgdGhpcy5hcHByb2FjaGluZ0VuZXJneUNodW5rcy5wdXNoKCBlbmVyZ3lDaHVuayApO1xyXG5cclxuICAgICAgdGhpcy5lbmVyZ3lDaHVua1dhbmRlckNvbnRyb2xsZXJzLnB1c2goXHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua1dhbmRlckNvbnRyb2xsZXJHcm91cC5jcmVhdGVOZXh0RWxlbWVudCggZW5lcmd5Q2h1bmssIHRoaXMucG9zaXRpb25Qcm9wZXJ0eSApXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBhZGQgYW4gZW5lcmd5IGNodW5rIHRvIG9uZSBvZiB0aGUgZW5lcmd5IGNodW5rIGNvbnRhaW5lciBzbGljZXMgb3duZWQgYnkgdGhpcyBtb2RlbCBlbGVtZW50XHJcbiAgICogQHBhcmFtIHtFbmVyZ3lDaHVua30gZW5lcmd5Q2h1bmtcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgYWRkRW5lcmd5Q2h1bmtUb1NsaWNlKCBlbmVyZ3lDaHVuayApIHtcclxuXHJcbiAgICAvLyBzdGFydCB3aXRoIGEgc2xpY2UgYXQgb3IgbmVhciB0aGUgbWlkZGxlIG9mIHRoZSBvcmRlclxyXG4gICAgbGV0IHNsaWNlSW5kZXggPSBNYXRoLmZsb29yKCAoIHRoaXMuc2xpY2VzLmxlbmd0aCAtIDEgKSAvIDIgKTtcclxuICAgIGxldCBzbGljZUluZGV4V2l0aExvd2VzdEVuZXJneURlbnNpdHkgPSBudWxsO1xyXG4gICAgbGV0IGxvd2VzdEVuZXJneURlbnNpdHlGb3VuZCA9IE51bWJlci5ORUdBVElWRV9JTkZJTklUWTtcclxuXHJcbiAgICBmb3IgKCBsZXQgZWNTbGljZUNvdW50ID0gMDsgZWNTbGljZUNvdW50IDwgdGhpcy5zbGljZXMubGVuZ3RoOyBlY1NsaWNlQ291bnQrKyApIHtcclxuICAgICAgY29uc3Qgc2xpY2UgPSB0aGlzLnNsaWNlcy5nZXQoIHNsaWNlSW5kZXggKTtcclxuICAgICAgY29uc3Qgc2xpY2VBcmVhID0gc2xpY2UuYm91bmRzLndpZHRoICogc2xpY2UuYm91bmRzLmhlaWdodDtcclxuICAgICAgY29uc3QgZW5lcmd5Q2h1bmtEZW5zaXR5ID0gc2xpY2UuZ2V0TnVtYmVyT2ZFbmVyZ3lDaHVua3MoKSAvIHNsaWNlQXJlYTtcclxuICAgICAgaWYgKCBzbGljZUluZGV4V2l0aExvd2VzdEVuZXJneURlbnNpdHkgPT09IG51bGwgfHwgZW5lcmd5Q2h1bmtEZW5zaXR5IDwgbG93ZXN0RW5lcmd5RGVuc2l0eUZvdW5kICkge1xyXG4gICAgICAgIHNsaWNlSW5kZXhXaXRoTG93ZXN0RW5lcmd5RGVuc2l0eSA9IHNsaWNlSW5kZXg7XHJcbiAgICAgICAgbG93ZXN0RW5lcmd5RGVuc2l0eUZvdW5kID0gZW5lcmd5Q2h1bmtEZW5zaXR5O1xyXG4gICAgICB9XHJcbiAgICAgIHNsaWNlSW5kZXggPSAoIHNsaWNlSW5kZXggKyAxICkgJSB0aGlzLnNsaWNlcy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRkIHRoZSBlbmVyZ3kgY2h1bmsgdG8gdGhlIHNsaWNlIHdpdGggdGhlIGxvd2VzdCBkZW5zaXR5IG9mIGVuZXJneSBjaHVua3NcclxuICAgIHRoaXMuc2xpY2VzLmdldCggc2xpY2VJbmRleFdpdGhMb3dlc3RFbmVyZ3lEZW5zaXR5ICkuYWRkRW5lcmd5Q2h1bmsoIGVuZXJneUNodW5rICk7XHJcblxyXG4gICAgLy8gdHJpZ2dlciByZWRpc3RyaWJ1dGlvbiBvZiB0aGUgZW5lcmd5IGNodW5rc1xyXG4gICAgdGhpcy5yZXNldEVDRGlzdHJpYnV0aW9uQ291bnRkb3duKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBnZXQgdGhlIGNvbXBvc2l0ZSBib3VuZHMgb2YgYWxsIHRoZSBzbGljZXMgdGhhdCBhcmUgdXNlZCB0byBob2xkIHRoZSBlbmVyZ3kgY2h1bmtzXHJcbiAgICogQHJldHVybnMge0JvdW5kczJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFNsaWNlQm91bmRzKCkge1xyXG4gICAgbGV0IG1pblggPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICBsZXQgbWluWSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgIGxldCBtYXhYID0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZO1xyXG4gICAgbGV0IG1heFkgPSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XHJcbiAgICB0aGlzLnNsaWNlcy5mb3JFYWNoKCBzbGljZSA9PiB7XHJcbiAgICAgIGNvbnN0IHNsaWNlQm91bmRzID0gc2xpY2UuYm91bmRzO1xyXG4gICAgICBpZiAoIHNsaWNlQm91bmRzLm1pblggPCBtaW5YICkge1xyXG4gICAgICAgIG1pblggPSBzbGljZUJvdW5kcy5taW5YO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggc2xpY2VCb3VuZHMubWF4WCA+IG1heFggKSB7XHJcbiAgICAgICAgbWF4WCA9IHNsaWNlQm91bmRzLm1heFg7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBzbGljZUJvdW5kcy5taW5ZIDwgbWluWSApIHtcclxuICAgICAgICBtaW5ZID0gc2xpY2VCb3VuZHMubWluWTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHNsaWNlQm91bmRzLm1heFkgPiBtYXhZICkge1xyXG4gICAgICAgIG1heFkgPSBzbGljZUJvdW5kcy5tYXhZO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gbmV3IEJvdW5kczIoIG1pblgsIG1pblksIG1heFgsIG1heFkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyYW5zZmVyIGFuIEVuZXJneUNodW5rIGZyb20gdGhlIGFwcHJvYWNoaW5nRW5lcmd5Q2h1bmtzIGxpc3QgdG8gYSBzbGljZSBpbiB0aGlzIG1vZGVsIGVsZW1lbnQuIEZpbmQgdGhlXHJcbiAgICogY29ycmVzcG9uZGluZyB3YW5kZXIgY29udHJvbGxlciBhbmQgcmVtb3ZlIGl0LiBBIG5ldyB3YW5kZXIgY29udHJvbGxlciBpcyB0aGVuIGFzc29jaWF0ZWQgd2l0aCB0aGUgdHJhbnNmZXJyZWRcclxuICAgKiBjaHVuayB2aWEgYSBjYWxsIHRvIGFkZEVuZXJneUNodW5rLlxyXG4gICAqIEBwYXJhbSB7RW5lcmd5Q2h1bmt9IGVuZXJneUNodW5rXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqL1xyXG4gIG1vdmVFbmVyZ3lDaHVua1RvU2xpY2VzKCBlbmVyZ3lDaHVuayApIHtcclxuICAgIHRoaXMuYXBwcm9hY2hpbmdFbmVyZ3lDaHVua3MucmVtb3ZlKCBlbmVyZ3lDaHVuayApO1xyXG4gICAgdGhpcy5hZGRFbmVyZ3lDaHVua1RvU2xpY2UoIGVuZXJneUNodW5rICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYW4gZW5lcmd5IGNodW5rIGZyb20gd2hhdGV2ZXIgZW5lcmd5IGNodW5rIGxpc3QgaXQgYmVsb25ncyB0by4gSWYgdGhlIGNodW5rIGRvZXMgbm90IGJlbG9uZyB0byBhIHNwZWNpZmljXHJcbiAgICogZW5lcmd5IGNodW5rIGxpc3QsIHJldHVybiBmYWxzZS5cclxuICAgKiBAcGFyYW0ge0VuZXJneUNodW5rfSBlbmVyZ3lDaHVua1xyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZW1vdmVFbmVyZ3lDaHVuayggZW5lcmd5Q2h1bmsgKSB7XHJcbiAgICB0aGlzLnNsaWNlcy5mb3JFYWNoKCBzbGljZSA9PiB7XHJcbiAgICAgIGlmICggc2xpY2UuZW5lcmd5Q2h1bmtMaXN0LmluZGV4T2YoIGVuZXJneUNodW5rICkgPj0gMCApIHtcclxuICAgICAgICBzbGljZS5lbmVyZ3lDaHVua0xpc3QucmVtb3ZlKCBlbmVyZ3lDaHVuayApO1xyXG4gICAgICAgIHRoaXMucmVzZXRFQ0Rpc3RyaWJ1dGlvbkNvdW50ZG93bigpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExvY2F0ZSwgcmVtb3ZlLCBhbmQgcmV0dXJuIHRoZSBlbmVyZ3kgY2h1bmsgdGhhdCBpcyBjbG9zZWQgdG8gdGhlIHByb3ZpZGVkIHBvaW50LiAgQ29tcGVuc2F0ZSBkaXN0YW5jZXMgZm9yIHRoZVxyXG4gICAqIHotb2Zmc2V0IHNvIHRoYXQgei1wb3NpdGlvbmluZyBkb2Vzbid0IHNrZXcgdGhlIHJlc3VsdHMsIHNpbmNlIHRoZSBwcm92aWRlZCBwb2ludCBpcyAyRC5cclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvaW50IC0gY29tcGFyaXNvbiBwb2ludFxyXG4gICAqIEByZXR1cm5zIHtFbmVyZ3lDaHVua3x8bnVsbH0gY2xvc2VzdEVuZXJneUNodW5rLCBudWxsIGlmIHRoZXJlIGFyZSBub25lIGF2YWlsYWJsZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBleHRyYWN0RW5lcmd5Q2h1bmtDbG9zZXN0VG9Qb2ludCggcG9pbnQgKSB7XHJcblxyXG4gICAgLy8gbWFrZSBzdXJlIHRoaXMgZWxlbWVudCBkb2Vzbid0IGdpdmUgdXAgYWxsIGl0cyBlbmVyZ3kgY2h1bmtzXHJcbiAgICBpZiAoIHRoaXMuZ2V0TnVtYmVyT2ZFbmVyZ3lDaHVua3NJbkVsZW1lbnQoKSA8PSAxICkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgY2xvc2VzdEVuZXJneUNodW5rID0gbnVsbDtcclxuICAgIGxldCBjbG9zZXN0Q29tcGVuc2F0ZWREaXN0YW5jZSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuXHJcbiAgICAvLyBpZGVudGlmeSB0aGUgY2xvc2VzdCBlbmVyZ3kgY2h1bmtcclxuICAgIHRoaXMuc2xpY2VzLmZvckVhY2goIHNsaWNlID0+IHtcclxuICAgICAgc2xpY2UuZW5lcmd5Q2h1bmtMaXN0LmZvckVhY2goIGVuZXJneUNodW5rID0+IHtcclxuXHJcbiAgICAgICAgLy8gY29tcGVuc2F0ZSBmb3IgdGhlIFogb2Zmc2V0LCBvdGhlcndpc2UgZnJvbnQgY2h1bmsgd2lsbCBhbG1vc3QgYWx3YXlzIGJlIGNob3NlblxyXG4gICAgICAgIGNvbnN0IGNvbXBlbnNhdGVkRW5lcmd5Q2h1bmtQb3NpdGlvbiA9IGVuZXJneUNodW5rLnBvc2l0aW9uUHJvcGVydHkudmFsdWUubWludXNYWShcclxuICAgICAgICAgIDAsXHJcbiAgICAgICAgICBFRkFDQ29uc3RhbnRzLlpfVE9fWV9PRkZTRVRfTVVMVElQTElFUiAqIGVuZXJneUNodW5rLnpQb3NpdGlvblByb3BlcnR5LnZhbHVlXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBjb21wZW5zYXRlZERpc3RhbmNlID0gY29tcGVuc2F0ZWRFbmVyZ3lDaHVua1Bvc2l0aW9uLmRpc3RhbmNlKCBwb2ludCApO1xyXG4gICAgICAgIGlmICggY29tcGVuc2F0ZWREaXN0YW5jZSA8IGNsb3Nlc3RDb21wZW5zYXRlZERpc3RhbmNlICkge1xyXG4gICAgICAgICAgY2xvc2VzdEVuZXJneUNodW5rID0gZW5lcmd5Q2h1bms7XHJcbiAgICAgICAgICBjbG9zZXN0Q29tcGVuc2F0ZWREaXN0YW5jZSA9IGNvbXBlbnNhdGVkRGlzdGFuY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5yZW1vdmVFbmVyZ3lDaHVuayggY2xvc2VzdEVuZXJneUNodW5rICk7XHJcbiAgICByZXR1cm4gY2xvc2VzdEVuZXJneUNodW5rO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZXh0cmFjdCBhbiBlbmVyZ3kgY2h1bmsgdGhhdCBpcyBhIGdvb2QgY2hvaWNlIGZvciBiZWluZyB0cmFuc2ZlcnJlZCB0byB0aGUgcHJvdmlkZWQgcmVjdGFuZ3VsYXIgYm91bmRzXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBkZXN0aW5hdGlvbkJvdW5kc1xyXG4gICAqIEByZXR1cm5zIHtFbmVyZ3lDaHVua3xudWxsfSAtIGEgc3VpdGFibGUgZW5lcmd5IGNodW5rIG9yIG51bGwgaWYgbm8gZW5lcmd5IGNodW5rcyBhcmUgYXZhaWxhYmxlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGV4dHJhY3RFbmVyZ3lDaHVua0Nsb3Nlc3RUb0JvdW5kcyggZGVzdGluYXRpb25Cb3VuZHMgKSB7XHJcblxyXG4gICAgLy8gbWFrZSBzdXJlIHRoaXMgZWxlbWVudCBkb2Vzbid0IGdpdmUgdXAgYWxsIGl0cyBlbmVyZ3kgY2h1bmtzXHJcbiAgICBpZiAoIHRoaXMuZ2V0TnVtYmVyT2ZFbmVyZ3lDaHVua3NJbkVsZW1lbnQoKSA8PSAxICkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgY2h1bmtUb0V4dHJhY3QgPSBudWxsO1xyXG4gICAgY29uc3QgbXlCb3VuZHMgPSB0aGlzLmdldFNsaWNlQm91bmRzKCk7XHJcbiAgICBpZiAoIGRlc3RpbmF0aW9uQm91bmRzLmNvbnRhaW5zQm91bmRzKCB0aGlzLnRoZXJtYWxDb250YWN0QXJlYSApICkge1xyXG5cclxuICAgICAgLy8gdGhpcyBlbGVtZW50J3Mgc2hhcGUgaXMgY29udGFpbmVkIGJ5IHRoZSBkZXN0aW5hdGlvbiAtIHBpY2sgYSBjaHVuayBuZWFyIG91ciByaWdodCBvciBsZWZ0IGVkZ2VcclxuICAgICAgbGV0IGNsb3Nlc3REaXN0YW5jZVRvVmVydGljYWxFZGdlID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgICB0aGlzLnNsaWNlcy5mb3JFYWNoKCBzbGljZSA9PiB7XHJcbiAgICAgICAgc2xpY2UuZW5lcmd5Q2h1bmtMaXN0LmZvckVhY2goIGVuZXJneUNodW5rID0+IHtcclxuICAgICAgICAgIGNvbnN0IGRpc3RhbmNlVG9WZXJ0aWNhbEVkZ2UgPSBNYXRoLm1pbihcclxuICAgICAgICAgICAgTWF0aC5hYnMoIG15Qm91bmRzLm1pblggLSBlbmVyZ3lDaHVuay5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnggKSxcclxuICAgICAgICAgICAgTWF0aC5hYnMoIG15Qm91bmRzLm1heFggLSBlbmVyZ3lDaHVuay5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnggKVxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICBpZiAoIGRpc3RhbmNlVG9WZXJ0aWNhbEVkZ2UgPCBjbG9zZXN0RGlzdGFuY2VUb1ZlcnRpY2FsRWRnZSApIHtcclxuICAgICAgICAgICAgY2h1bmtUb0V4dHJhY3QgPSBlbmVyZ3lDaHVuaztcclxuICAgICAgICAgICAgY2xvc2VzdERpc3RhbmNlVG9WZXJ0aWNhbEVkZ2UgPSBkaXN0YW5jZVRvVmVydGljYWxFZGdlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMudGhlcm1hbENvbnRhY3RBcmVhLmNvbnRhaW5zQm91bmRzKCBkZXN0aW5hdGlvbkJvdW5kcyApICkge1xyXG5cclxuICAgICAgLy8gVGhpcyBlbGVtZW50J3Mgc2hhcGUgZW5jbG9zZXMgdGhlIGRlc3RpbmF0aW9uIHNoYXBlIC0gY2hvb3NlIGEgY2h1bmsgdGhhdCBpcyBjbG9zZSBidXQgZG9lc24ndCBvdmVybGFwIHdpdGhcclxuICAgICAgLy8gdGhlIGRlc3RpbmF0aW9uIHNoYXBlLlxyXG4gICAgICBsZXQgY2xvc2VzdERpc3RhbmNlVG9EZXN0aW5hdGlvbkVkZ2UgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICAgIHRoaXMuc2xpY2VzLmZvckVhY2goIHNsaWNlID0+IHtcclxuICAgICAgICBzbGljZS5lbmVyZ3lDaHVua0xpc3QuZm9yRWFjaCggZW5lcmd5Q2h1bmsgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZGlzdGFuY2VUb0Rlc3RpbmF0aW9uRWRnZSA9XHJcbiAgICAgICAgICAgIE1hdGgubWluKCBNYXRoLmFicyggZGVzdGluYXRpb25Cb3VuZHMubWluWCAtIGVuZXJneUNodW5rLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCApLFxyXG4gICAgICAgICAgICAgIE1hdGguYWJzKCBkZXN0aW5hdGlvbkJvdW5kcy5tYXhYIC0gZW5lcmd5Q2h1bmsucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54ICkgKTtcclxuICAgICAgICAgIGlmICggIWRlc3RpbmF0aW9uQm91bmRzLmNvbnRhaW5zUG9pbnQoIGVuZXJneUNodW5rLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKSAmJlxyXG4gICAgICAgICAgICAgICBkaXN0YW5jZVRvRGVzdGluYXRpb25FZGdlIDwgY2xvc2VzdERpc3RhbmNlVG9EZXN0aW5hdGlvbkVkZ2UgKSB7XHJcbiAgICAgICAgICAgIGNodW5rVG9FeHRyYWN0ID0gZW5lcmd5Q2h1bms7XHJcbiAgICAgICAgICAgIGNsb3Nlc3REaXN0YW5jZVRvRGVzdGluYXRpb25FZGdlID0gZGlzdGFuY2VUb0Rlc3RpbmF0aW9uRWRnZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gdGhlcmUgaXMgbm8gb3IgbGltaXRlZCBvdmVybGFwLCBzbyB1c2UgY2VudGVyIHBvaW50c1xyXG4gICAgICBjaHVua1RvRXh0cmFjdCA9IHRoaXMuZXh0cmFjdEVuZXJneUNodW5rQ2xvc2VzdFRvUG9pbnQoIGRlc3RpbmF0aW9uQm91bmRzLmdldENlbnRlcigpICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmFpbCBzYWZlIC0gaWYgbm90aGluZyBmb3VuZCwgZ2V0IHRoZSBmaXJzdCBjaHVua1xyXG4gICAgaWYgKCBjaHVua1RvRXh0cmFjdCA9PT0gbnVsbCApIHtcclxuICAgICAgY29uc29sZS53YXJuKCAnTm8gZW5lcmd5IGNodW5rIGZvdW5kIGJ5IGV4dHJhY3Rpb24gYWxnb3JpdGhtLCB0cnlpbmcgZmlyc3QgYXZhaWxhYmxlLi4nICk7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuc2xpY2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGlmICggdGhpcy5zbGljZXMuZ2V0KCBpICkuZW5lcmd5Q2h1bmtMaXN0Lmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgICAgICBjaHVua1RvRXh0cmFjdCA9IHRoaXMuc2xpY2VzLmdldCggaSApLmVuZXJneUNodW5rTGlzdC5nZXQoIDAgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoIGNodW5rVG9FeHRyYWN0ID09PSBudWxsICkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybiggJ05vIGNodW5rcyBhdmFpbGFibGUgZm9yIGV4dHJhY3Rpb24uJyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnJlbW92ZUVuZXJneUNodW5rKCBjaHVua1RvRXh0cmFjdCApO1xyXG4gICAgcmV0dXJuIGNodW5rVG9FeHRyYWN0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6YXRpb24gbWV0aG9kIHRoYXQgYWRkIHRoZSBcInNsaWNlc1wiIHdoZXJlIHRoZSBlbmVyZ3kgY2h1bmtzIHJlc2lkZS4gU2hvdWxkIGJlIGNhbGxlZCBvbmx5IG9uY2UgYXRcclxuICAgKiBpbml0aWFsaXphdGlvbi5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICogQGFic3RyYWN0XHJcbiAgICovXHJcbiAgYWRkRW5lcmd5Q2h1bmtTbGljZXMoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ3N1YnR5cGVzIHNob3VsZCBpbXBsZW1lbnQgdGhlaXIgY2h1bmsgc2xpY2UgY3JlYXRpb24nICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiAgYWRkIGluaXRpYWwgZW5lcmd5IGNodW5rcyB0byB0aGlzIG1vZGVsIGVsZW1lbnRcclxuICAgKiAgQHByb3RlY3RlZFxyXG4gICAqL1xyXG4gIGFkZEluaXRpYWxFbmVyZ3lDaHVua3MoKSB7XHJcblxyXG4gICAgbGV0IHRvdGFsU2xpY2VBcmVhID0gMDtcclxuXHJcbiAgICAvLyByZW1vdmUgdGhlIGN1cnJlbnQgc2V0IG9mIGVuZXJneSBjaHVua3MsIGNhbGN1bGF0ZSB0b3RhbCBhcmVhIG9mIHRoZSBzbGljZXNcclxuICAgIHRoaXMuc2xpY2VzLmZvckVhY2goIHNsaWNlID0+IHtcclxuICAgICAgc2xpY2UuZW5lcmd5Q2h1bmtMaXN0LmZvckVhY2goIGNodW5rID0+IHRoaXMuZW5lcmd5Q2h1bmtHcm91cC5kaXNwb3NlRWxlbWVudCggY2h1bmsgKSApO1xyXG4gICAgICBzbGljZS5lbmVyZ3lDaHVua0xpc3QuY2xlYXIoKTtcclxuICAgICAgdG90YWxTbGljZUFyZWEgKz0gc2xpY2UuYm91bmRzLndpZHRoICogc2xpY2UuYm91bmRzLmhlaWdodDtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjYWxjdWxhdGUgdGhlIG51bWJlciBvZiBlbmVyZ3kgY2h1bmtzIHRvIGFkZCBiYXNlZCBvbiB0aGUgYW1vdW50IG9mIGVuZXJneVxyXG4gICAgY29uc3QgdGFyZ2V0TnVtYmVyT2ZFbmVyZ3lDaHVua3MgPSBFRkFDQ29uc3RhbnRzLkVORVJHWV9UT19OVU1fQ0hVTktTX01BUFBFUiggdGhpcy5lbmVyZ3lQcm9wZXJ0eS52YWx1ZSApO1xyXG5cclxuICAgIC8vIHNlZSBpZiB0aGVyZSBpcyBwcmVzZXQgZGF0YSB0aGF0IG1hdGNoZXMgdGhpcyBjb25maWd1cmF0aW9uXHJcbiAgICBjb25zdCBwcmVzZXREYXRhID0gdGhpcy5wcmVkaXN0cmlidXRlZEVuZXJneUNodW5rQ29uZmlndXJhdGlvbnMuZmluZCggcHJlc2V0RGF0YUVudHJ5ID0+IHtcclxuICAgICAgcmV0dXJuIHRhcmdldE51bWJlck9mRW5lcmd5Q2h1bmtzID09PSBwcmVzZXREYXRhRW50cnkubnVtYmVyT2ZFbmVyZ3lDaHVua3MgJiZcclxuICAgICAgICAgICAgIHRoaXMuc2xpY2VzLmxlbmd0aCA9PT0gcHJlc2V0RGF0YUVudHJ5Lm51bWJlck9mU2xpY2VzICYmXHJcbiAgICAgICAgICAgICBNYXRoLmFicyggdG90YWxTbGljZUFyZWEgLSBwcmVzZXREYXRhRW50cnkudG90YWxTbGljZUFyZWEgKSAvIHRvdGFsU2xpY2VBcmVhIDwgMC4wMDE7IC8vIHRvbGVyYW5jZSBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQXMgb2YgbGF0ZSBTZXB0ZW1iZXIgMjAyMCB0aGVyZSBzaG91bGQgYmUgcHJlc2V0IGRhdGEgZm9yIHRoZSBpbml0aWFsIGVuZXJneSBjaHVuayBjb25maWd1cmF0aW9uIGZvciBhbGwgdGhlcm1hbFxyXG4gICAgLy8gbW9kZWwgZWxlbWVudHMgdXNlZCBpbiB0aGUgc2ltLCBzbyB0aGUgZm9sbG93aW5nIGFzc2VydGlvbiBzaG91bGQgb25seSBiZSBoaXQgaWYgYSBuZXcgZWxlbWVudCBoYXMgYmVlbiBhZGRlZCBvclxyXG4gICAgLy8gc29tZXRoaW5nIGhhcyBiZWVuIGNoYW5nZWQgYWJvdXQgb25lIG9mIHRoZSBleGlzdGluZyBvbmVzLiAgSW4gdGhhdCBjYXNlLCBuZXcgcHJlc2V0IGRhdGEgc2hvdWxkIGJlIGFkZGVkLiAgU2VlXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZW5lcmd5LWZvcm1zLWFuZC1jaGFuZ2VzL2lzc3Vlcy8zNzUuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwcmVzZXREYXRhLCAnTm8gcHJlc2V0IGRhdGEgZm91bmQsIGhhcyBzb21ldGhpbmcgY2hhbmdlZCBhYm91dCBvbmUgb2YgdGhlIHRoZXJtYWwgbW9kZWwgZWxlbWVudHM/JyApO1xyXG5cclxuICAgIGlmICggcHJlc2V0RGF0YSApIHtcclxuICAgICAgdGhpcy5zbGljZXMuZm9yRWFjaCggKCBzbGljZSwgc2xpY2VJbmRleCApID0+IHtcclxuICAgICAgICBjb25zdCBlbmVyZ3lDaHVua1Bvc2l0aW9ucyA9IHByZXNldERhdGEuZW5lcmd5Q2h1bmtQb3NpdGlvbnNCeVNsaWNlWyBzbGljZUluZGV4IF07XHJcbiAgICAgICAgZW5lcmd5Q2h1bmtQb3NpdGlvbnMuZm9yRWFjaCggZW5lcmd5Q2h1bmtQb3NpdGlvbiA9PiB7XHJcbiAgICAgICAgICBzbGljZS5hZGRFbmVyZ3lDaHVuayggdGhpcy5lbmVyZ3lDaHVua0dyb3VwLmNyZWF0ZU5leHRFbGVtZW50KFxyXG4gICAgICAgICAgICBFbmVyZ3lUeXBlLlRIRVJNQUwsXHJcbiAgICAgICAgICAgIG5ldyBWZWN0b3IyKCBlbmVyZ3lDaHVua1Bvc2l0aW9uLnBvc2l0aW9uWCwgZW5lcmd5Q2h1bmtQb3NpdGlvbi5wb3NpdGlvblkgKSxcclxuICAgICAgICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICAgICAgICB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eVxyXG4gICAgICAgICAgKSApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuYWRkQW5kRGlzdHJpYnV0ZUluaXRpYWxFbmVyZ3lDaHVua3MoIHRhcmdldE51bWJlck9mRW5lcmd5Q2h1bmtzICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYW5kIGRpc3RyaWJ1dGUgZW5lcmd5IGNodW5rcyB3aXRoaW4gdGhpcyBtb2RlbCBlbGVtZW50IGFsZ29yaXRobWljYWxseS4gIFRoaXMgdmVyc2lvbiB3b3JrcyB3ZWxsIGZvciBzaW1wbGVcclxuICAgKiByZWN0YW5ndWxhciBtb2RlbCBlbGVtZW50cywgYnV0IG1heSBuZWVkIHRvIGJlIG92ZXJyaWRkZW4gZm9yIG1vcmUgY29tcGxleCBnZW9tZXRyaWVzLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0YXJnZXROdW1iZXJPZkVuZXJneUNodW5rc1xyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICBhZGRBbmREaXN0cmlidXRlSW5pdGlhbEVuZXJneUNodW5rcyggdGFyZ2V0TnVtYmVyT2ZFbmVyZ3lDaHVua3MgKSB7XHJcblxyXG4gICAgY29uc3Qgc21hbGxPZmZzZXQgPSAwLjAwMDAxOyAvLyB1c2VkIHNvIHRoYXQgdGhlIEVDcyBkb24ndCBzdGFydCBvbiB0b3Agb2YgZWFjaCBvdGhlclxyXG5cclxuICAgIC8vIHN0YXJ0IHdpdGggdGhlIG1pZGRsZSBzbGljZSBhbmQgY3ljbGUgdGhyb3VnaCBpbiBvcmRlciwgYWRkaW5nIGNodW5rcyBldmVubHkgdG8gZWFjaFxyXG4gICAgbGV0IHNsaWRlSW5kZXggPSBNYXRoLmZsb29yKCB0aGlzLnNsaWNlcy5sZW5ndGggLyAyICkgLSAxO1xyXG4gICAgbGV0IG51bWJlck9mRW5lcmd5Q2h1bmtzQWRkZWQgPSAwO1xyXG4gICAgd2hpbGUgKCBudW1iZXJPZkVuZXJneUNodW5rc0FkZGVkIDwgdGFyZ2V0TnVtYmVyT2ZFbmVyZ3lDaHVua3MgKSB7XHJcbiAgICAgIGNvbnN0IHNsaWNlID0gdGhpcy5zbGljZXMuZ2V0KCBzbGlkZUluZGV4ICk7XHJcbiAgICAgIGNvbnN0IG51bWJlck9mRW5lcmd5Q2h1bmtzSW5TbGljZSA9IHNsaWNlLmdldE51bWJlck9mRW5lcmd5Q2h1bmtzKCk7XHJcbiAgICAgIGNvbnN0IGNlbnRlciA9IHNsaWNlLmJvdW5kcy5jZW50ZXIucGx1c1hZKFxyXG4gICAgICAgIHNtYWxsT2Zmc2V0ICogbnVtYmVyT2ZFbmVyZ3lDaHVua3NBZGRlZCwgc21hbGxPZmZzZXQgKiBudW1iZXJPZkVuZXJneUNodW5rc0luU2xpY2VcclxuICAgICAgKTtcclxuICAgICAgc2xpY2UuYWRkRW5lcmd5Q2h1bmsoXHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0dyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCBFbmVyZ3lUeXBlLlRIRVJNQUwsIGNlbnRlciwgVmVjdG9yMi5aRVJPLCB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSApXHJcbiAgICAgICk7XHJcbiAgICAgIG51bWJlck9mRW5lcmd5Q2h1bmtzQWRkZWQrKztcclxuICAgICAgc2xpZGVJbmRleCA9ICggc2xpZGVJbmRleCArIDEgKSAlIHRoaXMuc2xpY2VzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjbGVhciB0aGUgZGlzdHJpYnV0aW9uIHRpbWVyIGFuZCBkbyBhIG1vcmUgdGhvcm91Z2ggZGlzdHJpYnV0aW9uIGJlbG93XHJcbiAgICB0aGlzLmNsZWFyRUNEaXN0cmlidXRpb25Db3VudGRvd24oKTtcclxuXHJcbiAgICAvLyBkaXN0cmlidXRlIHRoZSBpbml0aWFsIGVuZXJneSBjaHVua3Mgd2l0aGluIHRoZSBjb250YWluZXIgdXNpbmcgdGhlIHJlcHVsc2l2ZSBhbGdvcml0aG1cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IEVGQUNDb25zdGFudHMuTUFYX05VTUJFUl9PRl9JTklUSUFMSVpBVElPTl9ESVNUUklCVVRJT05fQ1lDTEVTOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGRpc3RyaWJ1dGVkID0gZW5lcmd5Q2h1bmtEaXN0cmlidXRvci51cGRhdGVQb3NpdGlvbnMoXHJcbiAgICAgICAgdGhpcy5zbGljZXMuc2xpY2UoKSxcclxuICAgICAgICBFRkFDQ29uc3RhbnRzLlNJTV9USU1FX1BFUl9USUNLX05PUk1BTFxyXG4gICAgICApO1xyXG4gICAgICBpZiAoICFkaXN0cmlidXRlZCApIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhpcyBtZXRob2QgaXMgdXNlZCB0byBvdXRwdXQgYSBKU09OIGRhdGEgc3RydWN0dXJlIGNvbnRhaW5pbmcgdGhlIG51bWJlciBvZiBlbmVyZ3kgY2h1bmsgc2xpY2VzLCB0aGUgdG90YWxcclxuICAgKiB2b2x1bWUsIGFuZCB0aGUgbnVtYmVyIGFuZCBwb3NpdGlvbiBvZiBlYWNoIGVuZXJneSBjaHVuayBvbiBlYWNoIHNsaWNlLiAgSW4gdGhlIHByb2R1Y3Rpb24gdmVyc2lvbiBvZiB0aGVcclxuICAgKiBzaW11bGF0aW9uLCB0aGlzIGlzIGdlbmVyYWxseSBub3QgdXNlZC4gIEl0IGlzIG9ubHkgdXNlZCB0byBnYXRoZXIgZGF0YSB0aGF0IGNhbiBiZSB1c2VkIGZvciBpbml0aWFsIGVuZXJneSBjaHVua1xyXG4gICAqIHBvc2l0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHRvIG1ha2UgaW5pdGlhbGl6YXRpb24gZmFzdGVyLiAgU2VlXHJcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VuZXJneS1mb3Jtcy1hbmQtY2hhbmdlcy9pc3N1ZXMvMzc1XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGR1bXBFbmVyZ3lDaHVua0RhdGEoKSB7XHJcblxyXG4gICAgbGV0IHRvdGFsU2xpY2VBcmVhID0gMDtcclxuICAgIGxldCBudW1iZXJPZkVuZXJneUNodW5rcyA9IDA7XHJcbiAgICB0aGlzLnNsaWNlcy5mb3JFYWNoKCBzbGljZSA9PiB7XHJcbiAgICAgIHRvdGFsU2xpY2VBcmVhICs9IHNsaWNlLmJvdW5kcy53aWR0aCAqIHNsaWNlLmJvdW5kcy5oZWlnaHQ7XHJcbiAgICAgIG51bWJlck9mRW5lcmd5Q2h1bmtzICs9IHNsaWNlLmVuZXJneUNodW5rTGlzdC5sZW5ndGg7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZW5lcmd5Q2h1bmtJbmZvID0ge1xyXG4gICAgICBudW1iZXJPZlNsaWNlczogdGhpcy5zbGljZXMubGVuZ3RoLFxyXG4gICAgICB0b3RhbFNsaWNlQXJlYTogdG90YWxTbGljZUFyZWEsXHJcbiAgICAgIG51bWJlck9mRW5lcmd5Q2h1bmtzOiBudW1iZXJPZkVuZXJneUNodW5rcyxcclxuICAgICAgZW5lcmd5Q2h1bmtQb3NpdGlvbnNCeVNsaWNlOiBbXVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnNsaWNlcy5mb3JFYWNoKCAoIHNsaWNlLCBzbGljZUluZGV4ICkgPT4ge1xyXG4gICAgICBlbmVyZ3lDaHVua0luZm8uZW5lcmd5Q2h1bmtQb3NpdGlvbnNCeVNsaWNlWyBzbGljZUluZGV4IF0gPSBbXTtcclxuICAgICAgc2xpY2UuZW5lcmd5Q2h1bmtMaXN0LmZvckVhY2goIGVuZXJneUNodW5rID0+IHtcclxuICAgICAgICBlbmVyZ3lDaHVua0luZm8uZW5lcmd5Q2h1bmtQb3NpdGlvbnNCeVNsaWNlWyBzbGljZUluZGV4IF0ucHVzaCgge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiBlbmVyZ3lDaHVuay5wb3NpdGlvblByb3BlcnR5LnZhbHVlLngsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IGVuZXJneUNodW5rLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKCBKU09OLnN0cmluZ2lmeSggZW5lcmd5Q2h1bmtJbmZvLCBudWxsLCAyICkgKTtcclxuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBnZXQgdGhlIG51bWJlciBvZiBlbmVyZ3kgY2h1bmtzIHRoYXQgYXJlIGFjdHVhbGx5IGluIHRoZSBlbGVtZW50LCBleGNsdWRpbmcgYW55IHRoYXQgYXJlIG9uIHRoZSB3YXlcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0TnVtYmVyT2ZFbmVyZ3lDaHVua3NJbkVsZW1lbnQoKSB7XHJcbiAgICBsZXQgbnVtYmVyT2ZDaHVua3MgPSAwO1xyXG4gICAgdGhpcy5zbGljZXMuZm9yRWFjaCggc2xpY2UgPT4ge1xyXG4gICAgICBudW1iZXJPZkNodW5rcyArPSBzbGljZS5nZXROdW1iZXJPZkVuZXJneUNodW5rcygpO1xyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIG51bWJlck9mQ2h1bmtzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TnVtYmVyT2ZFbmVyZ3lDaHVua3MoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXROdW1iZXJPZkVuZXJneUNodW5rc0luRWxlbWVudCgpICsgdGhpcy5hcHByb2FjaGluZ0VuZXJneUNodW5rcy5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1JlY3Rhbmd1bGFyVGhlcm1hbE1vdmFibGVNb2RlbEVsZW1lbnR9IG90aGVyRW5lcmd5Q29udGFpbmVyXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gdGltZSBvZiBjb250YWN0LCBpbiBzZWNvbmRzXHJcbiAgICogQHJldHVybnMge251bWJlcn0gLSBhbW91bnQgb2YgZW5lcmd5IGV4Y2hhbmdlZCwgaW4gam91bGVzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGV4Y2hhbmdlRW5lcmd5V2l0aCggb3RoZXJFbmVyZ3lDb250YWluZXIsIGR0ICkge1xyXG5cclxuICAgIGxldCBhbW91bnRPZkVuZXJneUV4Y2hhbmdlZCA9IDA7IC8vIGRpcmVjdGlvbiBpcyBmcm9tIHRoaXMgdG8gdGhlIG90aGVyXHJcbiAgICBjb25zdCB0aGVybWFsQ29udGFjdExlbmd0aCA9IHRoaXNcclxuICAgICAgLnRoZXJtYWxDb250YWN0QXJlYVxyXG4gICAgICAuZ2V0VGhlcm1hbENvbnRhY3RMZW5ndGgoIG90aGVyRW5lcmd5Q29udGFpbmVyLnRoZXJtYWxDb250YWN0QXJlYSApO1xyXG5cclxuICAgIGlmICggdGhlcm1hbENvbnRhY3RMZW5ndGggPiAwICkge1xyXG4gICAgICBjb25zdCBkZWx0YVQgPSBvdGhlckVuZXJneUNvbnRhaW5lci5nZXRUZW1wZXJhdHVyZSgpIC0gdGhpcy5nZXRUZW1wZXJhdHVyZSgpO1xyXG5cclxuICAgICAgLy8gZXhjaGFuZ2UgZW5lcmd5IGJldHdlZW4gdGhpcyBhbmQgdGhlIG90aGVyIGVuZXJneSBjb250YWluZXJcclxuICAgICAgaWYgKCBNYXRoLmFicyggZGVsdGFUICkgPiBFRkFDQ29uc3RhbnRzLlRFTVBFUkFUVVJFU19FUVVBTF9USFJFU0hPTEQgKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGhlYXRUcmFuc2ZlckNvbnN0YW50ID0gSGVhdFRyYW5zZmVyQ29uc3RhbnRzLmdldEhlYXRUcmFuc2ZlckZhY3RvcihcclxuICAgICAgICAgIHRoaXMuZW5lcmd5Q29udGFpbmVyQ2F0ZWdvcnksXHJcbiAgICAgICAgICBvdGhlckVuZXJneUNvbnRhaW5lci5lbmVyZ3lDb250YWluZXJDYXRlZ29yeVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IG51bWJlck9mRnVsbFRpbWVTdGVwRXhjaGFuZ2VzID0gTWF0aC5mbG9vciggZHQgLyBFRkFDQ29uc3RhbnRzLk1BWF9IRUFUX0VYQ0hBTkdFX1RJTUVfU1RFUCApO1xyXG5cclxuICAgICAgICBjb25zdCBsZWZ0b3ZlclRpbWUgPSBkdCAtICggbnVtYmVyT2ZGdWxsVGltZVN0ZXBFeGNoYW5nZXMgKiBFRkFDQ29uc3RhbnRzLk1BWF9IRUFUX0VYQ0hBTkdFX1RJTUVfU1RFUCApO1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mRnVsbFRpbWVTdGVwRXhjaGFuZ2VzICsgMTsgaSsrICkge1xyXG4gICAgICAgICAgY29uc3QgdGltZVN0ZXAgPSBpIDwgbnVtYmVyT2ZGdWxsVGltZVN0ZXBFeGNoYW5nZXMgPyBFRkFDQ29uc3RhbnRzLk1BWF9IRUFUX0VYQ0hBTkdFX1RJTUVfU1RFUCA6IGxlZnRvdmVyVGltZTtcclxuXHJcbiAgICAgICAgICBjb25zdCB0aGVybWFsRW5lcmd5R2FpbmVkID0gKCBvdGhlckVuZXJneUNvbnRhaW5lci5nZXRUZW1wZXJhdHVyZSgpIC0gdGhpcy5nZXRUZW1wZXJhdHVyZSgpICkgKlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZXJtYWxDb250YWN0TGVuZ3RoICogaGVhdFRyYW5zZmVyQ29uc3RhbnQgKiB0aW1lU3RlcDtcclxuICAgICAgICAgIG90aGVyRW5lcmd5Q29udGFpbmVyLmNoYW5nZUVuZXJneSggLXRoZXJtYWxFbmVyZ3lHYWluZWQgKTtcclxuICAgICAgICAgIHRoaXMuY2hhbmdlRW5lcmd5KCB0aGVybWFsRW5lcmd5R2FpbmVkICk7XHJcbiAgICAgICAgICBhbW91bnRPZkVuZXJneUV4Y2hhbmdlZCArPSAtdGhlcm1hbEVuZXJneUdhaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhbW91bnRPZkVuZXJneUV4Y2hhbmdlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgc2hhcGUgYXMgaXMgaXMgcHJvamVjdGVkIGludG8gM0QgaW4gdGhlIHZpZXcuICBJZGVhbGx5LCB0aGlzIHdvdWxkbid0IGV2ZW4gYmUgaW4gdGhlIG1vZGVsLCBiZWNhdXNlIGl0XHJcbiAgICogd291bGQgYmUgcHVyZWx5IGhhbmRsZWQgaW4gdGhlIHZpZXcsIGJ1dCBpdCBwcm92ZWQgbmVjZXNzYXJ5LlxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0UHJvamVjdGVkU2hhcGUoKSB7XHJcblxyXG4gICAgY29uc3QgY3VycmVudFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgcHJvamVjdGVkIHNoYXBlIG9ubHkgaWYgdGhlIHBvc2l0aW9uIGhhcyBjaGFuZ2VkIHNpbmNlIHRoZSBsYXN0IHJlcXVlc3RcclxuICAgIGlmICggIXRoaXMubGF0ZXN0UHJvamVjdGVkU2hhcGVQb3NpdGlvbi5lcXVhbHMoIGN1cnJlbnRQb3NpdGlvbiApICkge1xyXG4gICAgICB0aGlzLnRyYW5zbGF0aW9uTWF0cml4LnNldFRvVHJhbnNsYXRpb24oIGN1cnJlbnRQb3NpdGlvbi54LCBjdXJyZW50UG9zaXRpb24ueSApO1xyXG4gICAgICB0aGlzLmxhdGVzdFByb2plY3RlZFNoYXBlID0gdGhpcy51bnRyYW5zbGF0ZWRQcm9qZWN0ZWRTaGFwZS50cmFuc2Zvcm1lZCggdGhpcy50cmFuc2xhdGlvbk1hdHJpeCApO1xyXG4gICAgICB0aGlzLmxhdGVzdFByb2plY3RlZFNoYXBlUG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5sYXRlc3RQcm9qZWN0ZWRTaGFwZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRDZW50ZXJQb2ludCgpIHtcclxuICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCBwb3NpdGlvbi54LCBwb3NpdGlvbi55ICsgdGhpcy5oZWlnaHQgLyAyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Q2VudGVyVG9wUG9pbnQoKSB7XHJcbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuICAgIHJldHVybiBuZXcgVmVjdG9yMiggcG9zaXRpb24ueCwgcG9zaXRpb24ueSArIHRoaXMuaGVpZ2h0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBudW1iZXIgaW5kaWNhdGluZyB0aGUgYmFsYW5jZSBiZXR3ZWVuIHRoZSBlbmVyZ3kgbGV2ZWwgYW5kIHRoZSBudW1iZXIgb2YgZW5lcmd5IGNodW5rcyBvd25lZCBieSB0aGlzIG1vZGVsXHJcbiAgICogZWxlbWVudC4gIFJldHVybnMgMCBpZiB0aGUgbnVtYmVyIG9mIGVuZXJneSBjaHVua3MgbWF0Y2hlcyB0aGUgZW5lcmd5IGxldmVsLCBhIG5lZ2F0aXZlIHZhbHVlIGlmIHRoZXJlIGlzIGFcclxuICAgKiBkZWZpY2l0LCBhbmQgYSBwb3NpdGl2ZSB2YWx1ZSBpZiB0aGVyZSBpcyBhIHN1cnBsdXMuXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0RW5lcmd5Q2h1bmtCYWxhbmNlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TnVtYmVyT2ZFbmVyZ3lDaHVua3MoKSAtIEVGQUNDb25zdGFudHMuRU5FUkdZX1RPX05VTV9DSFVOS1NfTUFQUEVSKCB0aGlzLmVuZXJneVByb3BlcnR5LnZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldCB0aGUgZW5lcmd5IGNodW5rIGRpc3RyaWJ1dGlvbiBjb3VudGRvd24gdGltZXIsIHdoaWNoIHdpbGwgY2F1c2UgRUMgZGlzdHJpYnV0aW9uIHRvIHN0YXJ0IGFuZCBjb250aW51ZVxyXG4gICAqIHVudGlsIHRoZSBjb3VudGRvd24gcmVhY2hlcyB6ZXJvIG9yIG5vIG1vcmUgZGlzdHJpYnV0aW9uIGlzIG5lZWRlZC5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgcmVzZXRFQ0Rpc3RyaWJ1dGlvbkNvdW50ZG93bigpIHtcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtEaXN0cmlidXRpb25Db3VudGRvd25UaW1lciA9IE1BWF9FTkVSR1lfQ0hVTktfUkVESVNUUklCVVRJT05fVElNRTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGNsZWFyIHRoZSByZWRpc3RyaWJ1dGlvbiBjb3VudGRvd24gdGltZXIsIHdoaWNoIHdpbGwgc3RvcCBhbnkgZnVydGhlciByZWRpc3RyaWJ1dGlvblxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICBjbGVhckVDRGlzdHJpYnV0aW9uQ291bnRkb3duKCkge1xyXG4gICAgdGhpcy5lbmVyZ3lDaHVua0Rpc3RyaWJ1dGlvbkNvdW50ZG93blRpbWVyID0gMDtcclxuICB9XHJcbn1cclxuXHJcbmVuZXJneUZvcm1zQW5kQ2hhbmdlcy5yZWdpc3RlciggJ1JlY3Rhbmd1bGFyVGhlcm1hbE1vdmFibGVNb2RlbEVsZW1lbnQnLCBSZWN0YW5ndWxhclRoZXJtYWxNb3ZhYmxlTW9kZWxFbGVtZW50ICk7XHJcbmV4cG9ydCBkZWZhdWx0IFJlY3Rhbmd1bGFyVGhlcm1hbE1vdmFibGVNb2RlbEVsZW1lbnQ7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFCLE1BQU0sOENBQThDO0FBQ2hGLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7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