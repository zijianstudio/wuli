// Copyright 2016-2022, University of Colorado Boulder

/**
 * A type that represents a model of a solar panel that converts light energy to electrical energy.  The panel actually
 * consists of an actual panel but also is meant to have a lower assembly through which energy chunks move.  The
 * appearance needs to be tightly coordinated with the images used in the view.
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import solarPanelIcon_png from '../../../images/solarPanelIcon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyType from '../../common/model/EnergyType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import Energy from './Energy.js';
import EnergyChunkPathMover from './EnergyChunkPathMover.js';
import EnergyConverter from './EnergyConverter.js';

// constants
const PANEL_SIZE = new Dimension2(0.15, 0.07); // size of the panel-only portion (no connectors), in meters

// Constants used for creating the path followed by the energy chunks and for positioning the wire and connector
// images in the view.  Many of these numbers were empirically determined based on the images, and will need to be
// updated if the images change.  All values are in meters.
const PANEL_CONNECTOR_OFFSET = new Vector2(0.015, 0); // where the bottom of the panel connects to the wires & such
const CONVERGENCE_POINT_OFFSET = PANEL_CONNECTOR_OFFSET.plusXY(0, 0.0065);
const WIRE_CURVE_POINT_1_OFFSET = PANEL_CONNECTOR_OFFSET.plusXY(0, -0.025);
const WIRE_CURVE_POINT_2_OFFSET = PANEL_CONNECTOR_OFFSET.plusXY(0.005, -0.0325);
const WIRE_CURVE_POINT_3_OFFSET = PANEL_CONNECTOR_OFFSET.plusXY(0.008, -0.0355);
const WIRE_CURVE_POINT_4_OFFSET = PANEL_CONNECTOR_OFFSET.plusXY(0.012, -0.038);
const WIRE_CURVE_POINT_5_OFFSET = PANEL_CONNECTOR_OFFSET.plusXY(0.0165, -0.040);
const OUTGOING_CONNECTOR_OFFSET = PANEL_CONNECTOR_OFFSET.plusXY(0.042, -0.041);

// Inter chunk spacing time for when the chunks reach the 'convergence point' at the bottom of the solar panel.
// Empirically determined to create an appropriate flow of electrical chunks in an energy user wire. In seconds.
const MIN_INTER_CHUNK_TIME = 0.6;
class SolarPanel extends EnergyConverter {
  /**
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {EnergyChunkPathMoverGroup} energyChunkPathMoverGroup
   * @param {Object} [options]
   */
  constructor(energyChunksVisibleProperty, energyChunkGroup, energyChunkPathMoverGroup, options) {
    options = merge({
      tandem: Tandem.REQUIRED,
      phetioType: SolarPanel.SolarPanelIO,
      phetioState: true
    }, options);
    super(new Image(solarPanelIcon_png), options);

    // @public {string} - a11y name
    this.a11yName = EnergyFormsAndChangesStrings.a11y.solarPanel;

    // @private
    this.electricalEnergyChunkMovers = createObservableArray({
      tandem: options.tandem.createTandem('electricalEnergyChunkMovers'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunkPathMover.EnergyChunkPathMoverIO))
    });
    this.lightEnergyChunkMovers = createObservableArray({
      tandem: options.tandem.createTandem('lightEnergyChunkMovers'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunkPathMover.EnergyChunkPathMoverIO))
    });
    this.latestChunkArrivalTime = 0;
    this.numberOfConvertedChunks = 0;
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.energyOutputRateProperty = new NumberProperty(0, {
      tandem: options.tandem.createTandem('energyOutputRateProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true
    });

    // @private - counter to mimic function of IClock in original Java code
    this.simulationTime = 0;
    this.energyChunkGroup = energyChunkGroup;
    this.energyChunkPathMoverGroup = energyChunkPathMoverGroup;

    // A shape used to describe where the collection area is relative to the model position.  The collection area is at
    // the top, and the energy chunks flow through wires and connectors below.
    // @public - (read-only)
    this.untranslatedPanelBounds = new Bounds2(-PANEL_SIZE.width / 2, 0, PANEL_SIZE.width / 2, PANEL_SIZE.height);

    // @public - (read-only)
    this.untranslatedAbsorptionShape = new Shape().moveTo(0, 0).lineToRelative(-PANEL_SIZE.width / 2, 0).lineToRelative(PANEL_SIZE.width, PANEL_SIZE.height).close();
    this.positionProperty.link(position => {
      // shape used when determining if a given chunk of light energy should be absorbed. It is created at (0,0) relative
      // to the solar panel, so its position needs to be adjusted when the solar panel changes its position. It cannot
      // just use a relative position to the solar panel because energy chunks that are positioned globally need to check
      // to see if they are located within this shape, so it needs a global position as well. The untranslated version of
      // this shape is needed to draw the helper shape node in SolarPanelNode.
      // @private {Shape}
      this.absorptionShape = this.untranslatedAbsorptionShape.transformed(Matrix3.translation(position.x, position.y));
    });
  }

  /**
   * @param  {number} dt - time step, in seconds
   * @param  {Energy} incomingEnergy - type, amount, direction of energy
   * @returns {Energy}
   * @public
   */
  step(dt, incomingEnergy) {
    if (this.activeProperty.value) {
      // handle any incoming energy chunks
      if (this.incomingEnergyChunks.length > 0) {
        this.incomingEnergyChunks.forEach(incomingChunk => {
          if (incomingChunk.energyTypeProperty.get() === EnergyType.LIGHT) {
            if (this.numberOfConvertedChunks < 4) {
              // convert this chunk to electrical energy and add it to the list of energy chunks being managed
              incomingChunk.energyTypeProperty.set(EnergyType.ELECTRICAL);
              this.energyChunkList.push(incomingChunk);

              // add a "mover" that will move this energy chunk to the bottom of the solar panel
              this.electricalEnergyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(incomingChunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.get(), [CONVERGENCE_POINT_OFFSET]), this.chooseChunkSpeedOnPanel(incomingChunk)));
              this.numberOfConvertedChunks++;
            } else {
              // leave this chunk as light energy and add it to the list of energy chunks being managed
              this.energyChunkList.push(incomingChunk);

              // add a "mover" that will reflect this energy chunk up and away from the panel
              this.lightEnergyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(incomingChunk, EnergyChunkPathMover.createStraightPath(incomingChunk.positionProperty.get(), -incomingChunk.velocity.angle), EFACConstants.ENERGY_CHUNK_VELOCITY));
              this.numberOfConvertedChunks = 0;
            }
          }

          // by design, this shouldn't happen, so raise an error if it does
          else {
            assert && assert(false, `Encountered energy chunk with unexpected type: ${incomingChunk.energyTypeProperty.get()}`);
          }
        });
        this.incomingEnergyChunks.clear();
      }

      // move the energy chunks that are currently under management
      this.moveElectricalEnergyChunks(dt);
      this.moveReflectedEnergyChunks(dt);
    }

    // produce the appropriate amount of energy
    let energyProduced = 0;
    if (this.activeProperty.value && incomingEnergy.type === EnergyType.LIGHT) {
      // 68% efficient. Empirically determined to match the rate of energy chunks that flow from the sun to the solar
      // panel (this way, the fan moves at the same speed when chunks are on or off).
      energyProduced = incomingEnergy.amount * 0.68;
    }
    this.energyOutputRateProperty.value = Utils.toFixedNumber(energyProduced / dt, 11);
    this.simulationTime += dt;
    return new Energy(EnergyType.ELECTRICAL, energyProduced, 0);
  }

  /**
   * update electrical energy chunk positions
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveElectricalEnergyChunks(dt) {
    // iterate over a copy to mutate original without problems
    const movers = this.electricalEnergyChunkMovers.slice();
    movers.forEach(mover => {
      mover.moveAlongPath(dt);
      if (mover.pathFullyTraversed) {
        this.electricalEnergyChunkMovers.remove(mover);
        const pathThroughConverterOffsets = [WIRE_CURVE_POINT_1_OFFSET, WIRE_CURVE_POINT_2_OFFSET, WIRE_CURVE_POINT_3_OFFSET, WIRE_CURVE_POINT_4_OFFSET, WIRE_CURVE_POINT_5_OFFSET, OUTGOING_CONNECTOR_OFFSET];

        // energy chunk has reached the bottom of the panel and now needs to move through the converter
        if (mover.energyChunk.positionProperty.value.equals(this.positionProperty.value.plus(CONVERGENCE_POINT_OFFSET))) {
          this.electricalEnergyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(mover.energyChunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.value, pathThroughConverterOffsets), EFACConstants.ENERGY_CHUNK_VELOCITY));
        }

        // the energy chunk has traveled across the panel and through the converter, so pass it off to the next
        // element in the system
        else {
          this.energyChunkList.remove(mover.energyChunk);
          this.outgoingEnergyChunks.push(mover.energyChunk);
        }
        this.energyChunkPathMoverGroup.disposeElement(mover);
      }
    });
  }

  /**
   * update light energy chunk positions
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveReflectedEnergyChunks(dt) {
    // iterate over a copy to mutate original without problems
    const movers = this.lightEnergyChunkMovers.slice();
    movers.forEach(mover => {
      mover.moveAlongPath(dt);

      // remove this energy chunk entirely
      if (mover.pathFullyTraversed) {
        this.lightEnergyChunkMovers.remove(mover);
        this.energyChunkList.remove(mover.energyChunk);
        this.energyChunkGroup.disposeElement(mover.energyChunk);
        this.energyChunkPathMoverGroup.disposeElement(mover);
      }
    });
  }

  /**
   * @param {Energy} incomingEnergy
   * @public
   * @override
   */
  preloadEnergyChunks(incomingEnergy) {
    this.clearEnergyChunks();
    if (incomingEnergy.amount === 0 || incomingEnergy.type !== EnergyType.LIGHT) {
      // no energy chunk pre-loading needed
      return;
    }
    const absorptionBounds = this.getAbsorptionShape().bounds;
    const lowerLeftOfPanel = new Vector2(absorptionBounds.minX, absorptionBounds.minY);
    const upperRightOfPanel = new Vector2(absorptionBounds.maxX, absorptionBounds.maxY);
    const crossLineAngle = upperRightOfPanel.minus(lowerLeftOfPanel).angle;
    const crossLineLength = lowerLeftOfPanel.distance(upperRightOfPanel);
    const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
    let energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;
    let preloadComplete = false;

    // simulate energy chunks moving through the system
    while (!preloadComplete) {
      // full energy rate generates too many chunks, so an adjustment factor is used
      energySinceLastChunk += incomingEnergy.amount * dt * 0.4;

      // determine if time to add a new chunk
      if (energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK) {
        let initialPosition;
        if (this.energyChunkList.length === 0) {
          // for predictability of the algorithm, add the first chunk to the center of the panel
          initialPosition = lowerLeftOfPanel.plus(new Vector2(crossLineLength * 0.5, 0).rotated(crossLineAngle));
        } else {
          // choose a random position along the center portion of the cross line
          initialPosition = lowerLeftOfPanel.plus(new Vector2(crossLineLength * (0.5 * dotRandom.nextDouble() + 0.25), 0).rotated(crossLineAngle));
        }
        const newEnergyChunk = this.energyChunkGroup.createNextElement(EnergyType.ELECTRICAL, initialPosition, Vector2.ZERO, this.energyChunksVisibleProperty);
        this.energyChunkList.push(newEnergyChunk);

        // add a "mover" that will move this energy chunk to the bottom of the solar panel
        this.electricalEnergyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(newEnergyChunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.get(), [CONVERGENCE_POINT_OFFSET]), this.chooseChunkSpeedOnPanel(newEnergyChunk)));

        // update energy since last chunk
        energySinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;
      }
      this.moveElectricalEnergyChunks(dt);
      if (this.outgoingEnergyChunks.length > 0) {
        // an energy chunk has made it all the way through the system, which completes the pre-load
        preloadComplete = true;
      }
    }
  }

  /**
   * @returns {Energy} type, amount, direction of emitted energy
   * @public
   */
  getEnergyOutputRate() {
    return new Energy(EnergyType.ELECTRICAL, this.energyOutputRateProperty.value, 0);
  }

  /**
   * choose speed of chunk on panel such that it won't clump up with other chunks
   * @param  {EnergyChunk} incomingEnergyChunk
   * @returns {number} speed
   * @private
   */
  chooseChunkSpeedOnPanel(incomingEnergyChunk) {
    // start with default speed
    const chunkSpeed = EFACConstants.ENERGY_CHUNK_VELOCITY;

    // count the number of chunks currently on the panel
    let numberOfChunksOnPanel = 0;
    this.electricalEnergyChunkMovers.forEach(mover => {
      if (mover.getFinalDestination().equals(this.positionProperty.value.plus(CONVERGENCE_POINT_OFFSET))) {
        numberOfChunksOnPanel++;
      }
    });

    // compute the projected time of arrival at the convergence point
    const distanceToConvergencePoint = incomingEnergyChunk.positionProperty.get().distance(this.positionProperty.value.plus(CONVERGENCE_POINT_OFFSET));
    const travelTime = distanceToConvergencePoint / chunkSpeed;
    let projectedArrivalTime = this.simulationTime + travelTime;

    // calculate the minimum spacing based on the number of chunks on the panel
    const minArrivalTimeSpacing = numberOfChunksOnPanel <= 3 ? MIN_INTER_CHUNK_TIME : MIN_INTER_CHUNK_TIME / (numberOfChunksOnPanel - 2);

    // if the projected arrival time is too close to the current last chunk, slow down so that the minimum spacing is
    // maintained
    if (this.latestChunkArrivalTime + minArrivalTimeSpacing > projectedArrivalTime) {
      projectedArrivalTime = this.latestChunkArrivalTime + minArrivalTimeSpacing;
    }
    this.latestChunkArrivalTime = projectedArrivalTime;
    return distanceToConvergencePoint / (projectedArrivalTime - this.simulationTime);
  }

  /**
   * @param {EnergyChunk[]} energyChunks
   * @public
   * @override
   */
  injectEnergyChunks(energyChunks) {
    // before adding all injected chunks into the solar panel's incoming energy chunks array, make sure that they are
    // all light energy. if not, pull out the bad ones and pass the rest through.
    // see https://github.com/phetsims/energy-forms-and-changes/issues/150
    energyChunks.forEach(chunk => {
      if (chunk.energyTypeProperty.value !== EnergyType.LIGHT) {
        energyChunks = _.pull(energyChunks, chunk);
      }
    });
    super.injectEnergyChunks(energyChunks);
  }

  /**
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.electricalEnergyChunkMovers.forEach(mover => this.energyChunkPathMoverGroup.disposeElement(mover));
    this.electricalEnergyChunkMovers.clear();
    this.lightEnergyChunkMovers.forEach(mover => this.energyChunkPathMoverGroup.disposeElement(mover));
    this.lightEnergyChunkMovers.clear();
    this.latestChunkArrivalTime = 0;
  }

  /**
   * get the shape of the area where light can be absorbed
   * @returns {Shape}
   * @public
   */
  getAbsorptionShape() {
    return this.absorptionShape;
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @returns {Object}
   */
  toStateObject() {
    return {
      numberOfConvertedChunks: this.numberOfConvertedChunks,
      latestChunkArrivalTime: this.latestChunkArrivalTime,
      simulationTime: this.simulationTime
    };
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @param {Object} stateObject - see this.toStateObject()
   */
  applyState(stateObject) {
    this.numberOfConvertedChunks = stateObject.numberOfConvertedChunks;
    this.latestChunkArrivalTime = stateObject.latestChunkArrivalTime;
    this.simulationTime = stateObject.simulationTime;
  }
}

// statics
SolarPanel.PANEL_CONNECTOR_OFFSET = PANEL_CONNECTOR_OFFSET;
SolarPanel.SolarPanelIO = new IOType('SolarPanelIO', {
  valueType: SolarPanel,
  toStateObject: solarPanel => solarPanel.toStateObject(),
  applyState: (solarPanel, stateObject) => solarPanel.applyState(stateObject),
  stateSchema: {
    numberOfConvertedChunks: NumberIO,
    latestChunkArrivalTime: NumberIO,
    simulationTime: NumberIO
  }
});
energyFormsAndChanges.register('SolarPanel', SolarPanel);
export default SolarPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJOdW1iZXJQcm9wZXJ0eSIsIkJvdW5kczIiLCJEaW1lbnNpb24yIiwiZG90UmFuZG9tIiwiTWF0cml4MyIsIlV0aWxzIiwiVmVjdG9yMiIsIlNoYXBlIiwibWVyZ2UiLCJJbWFnZSIsIlRhbmRlbSIsIklPVHlwZSIsIk51bWJlcklPIiwiUmVmZXJlbmNlSU8iLCJzb2xhclBhbmVsSWNvbl9wbmciLCJFRkFDQ29uc3RhbnRzIiwiRW5lcmd5VHlwZSIsImVuZXJneUZvcm1zQW5kQ2hhbmdlcyIsIkVuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MiLCJFbmVyZ3kiLCJFbmVyZ3lDaHVua1BhdGhNb3ZlciIsIkVuZXJneUNvbnZlcnRlciIsIlBBTkVMX1NJWkUiLCJQQU5FTF9DT05ORUNUT1JfT0ZGU0VUIiwiQ09OVkVSR0VOQ0VfUE9JTlRfT0ZGU0VUIiwicGx1c1hZIiwiV0lSRV9DVVJWRV9QT0lOVF8xX09GRlNFVCIsIldJUkVfQ1VSVkVfUE9JTlRfMl9PRkZTRVQiLCJXSVJFX0NVUlZFX1BPSU5UXzNfT0ZGU0VUIiwiV0lSRV9DVVJWRV9QT0lOVF80X09GRlNFVCIsIldJUkVfQ1VSVkVfUE9JTlRfNV9PRkZTRVQiLCJPVVRHT0lOR19DT05ORUNUT1JfT0ZGU0VUIiwiTUlOX0lOVEVSX0NIVU5LX1RJTUUiLCJTb2xhclBhbmVsIiwiY29uc3RydWN0b3IiLCJlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHkiLCJlbmVyZ3lDaHVua0dyb3VwIiwiZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cCIsIm9wdGlvbnMiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInBoZXRpb1R5cGUiLCJTb2xhclBhbmVsSU8iLCJwaGV0aW9TdGF0ZSIsImExMXlOYW1lIiwiYTExeSIsInNvbGFyUGFuZWwiLCJlbGVjdHJpY2FsRW5lcmd5Q2h1bmtNb3ZlcnMiLCJjcmVhdGVUYW5kZW0iLCJPYnNlcnZhYmxlQXJyYXlJTyIsIkVuZXJneUNodW5rUGF0aE1vdmVySU8iLCJsaWdodEVuZXJneUNodW5rTW92ZXJzIiwibGF0ZXN0Q2h1bmtBcnJpdmFsVGltZSIsIm51bWJlck9mQ29udmVydGVkQ2h1bmtzIiwiZW5lcmd5T3V0cHV0UmF0ZVByb3BlcnR5IiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9IaWdoRnJlcXVlbmN5Iiwic2ltdWxhdGlvblRpbWUiLCJ1bnRyYW5zbGF0ZWRQYW5lbEJvdW5kcyIsIndpZHRoIiwiaGVpZ2h0IiwidW50cmFuc2xhdGVkQWJzb3JwdGlvblNoYXBlIiwibW92ZVRvIiwibGluZVRvUmVsYXRpdmUiLCJjbG9zZSIsInBvc2l0aW9uUHJvcGVydHkiLCJsaW5rIiwicG9zaXRpb24iLCJhYnNvcnB0aW9uU2hhcGUiLCJ0cmFuc2Zvcm1lZCIsInRyYW5zbGF0aW9uIiwieCIsInkiLCJzdGVwIiwiZHQiLCJpbmNvbWluZ0VuZXJneSIsImFjdGl2ZVByb3BlcnR5IiwidmFsdWUiLCJpbmNvbWluZ0VuZXJneUNodW5rcyIsImxlbmd0aCIsImZvckVhY2giLCJpbmNvbWluZ0NodW5rIiwiZW5lcmd5VHlwZVByb3BlcnR5IiwiZ2V0IiwiTElHSFQiLCJzZXQiLCJFTEVDVFJJQ0FMIiwiZW5lcmd5Q2h1bmtMaXN0IiwicHVzaCIsImNyZWF0ZU5leHRFbGVtZW50IiwiY3JlYXRlUGF0aEZyb21PZmZzZXRzIiwiY2hvb3NlQ2h1bmtTcGVlZE9uUGFuZWwiLCJjcmVhdGVTdHJhaWdodFBhdGgiLCJ2ZWxvY2l0eSIsImFuZ2xlIiwiRU5FUkdZX0NIVU5LX1ZFTE9DSVRZIiwiYXNzZXJ0IiwiY2xlYXIiLCJtb3ZlRWxlY3RyaWNhbEVuZXJneUNodW5rcyIsIm1vdmVSZWZsZWN0ZWRFbmVyZ3lDaHVua3MiLCJlbmVyZ3lQcm9kdWNlZCIsInR5cGUiLCJhbW91bnQiLCJ0b0ZpeGVkTnVtYmVyIiwibW92ZXJzIiwic2xpY2UiLCJtb3ZlciIsIm1vdmVBbG9uZ1BhdGgiLCJwYXRoRnVsbHlUcmF2ZXJzZWQiLCJyZW1vdmUiLCJwYXRoVGhyb3VnaENvbnZlcnRlck9mZnNldHMiLCJlbmVyZ3lDaHVuayIsImVxdWFscyIsInBsdXMiLCJvdXRnb2luZ0VuZXJneUNodW5rcyIsImRpc3Bvc2VFbGVtZW50IiwicHJlbG9hZEVuZXJneUNodW5rcyIsImNsZWFyRW5lcmd5Q2h1bmtzIiwiYWJzb3JwdGlvbkJvdW5kcyIsImdldEFic29ycHRpb25TaGFwZSIsImJvdW5kcyIsImxvd2VyTGVmdE9mUGFuZWwiLCJtaW5YIiwibWluWSIsInVwcGVyUmlnaHRPZlBhbmVsIiwibWF4WCIsIm1heFkiLCJjcm9zc0xpbmVBbmdsZSIsIm1pbnVzIiwiY3Jvc3NMaW5lTGVuZ3RoIiwiZGlzdGFuY2UiLCJGUkFNRVNfUEVSX1NFQ09ORCIsImVuZXJneVNpbmNlTGFzdENodW5rIiwiRU5FUkdZX1BFUl9DSFVOSyIsInByZWxvYWRDb21wbGV0ZSIsImluaXRpYWxQb3NpdGlvbiIsInJvdGF0ZWQiLCJuZXh0RG91YmxlIiwibmV3RW5lcmd5Q2h1bmsiLCJaRVJPIiwiZ2V0RW5lcmd5T3V0cHV0UmF0ZSIsImluY29taW5nRW5lcmd5Q2h1bmsiLCJjaHVua1NwZWVkIiwibnVtYmVyT2ZDaHVua3NPblBhbmVsIiwiZ2V0RmluYWxEZXN0aW5hdGlvbiIsImRpc3RhbmNlVG9Db252ZXJnZW5jZVBvaW50IiwidHJhdmVsVGltZSIsInByb2plY3RlZEFycml2YWxUaW1lIiwibWluQXJyaXZhbFRpbWVTcGFjaW5nIiwiaW5qZWN0RW5lcmd5Q2h1bmtzIiwiZW5lcmd5Q2h1bmtzIiwiY2h1bmsiLCJfIiwicHVsbCIsInRvU3RhdGVPYmplY3QiLCJhcHBseVN0YXRlIiwic3RhdGVPYmplY3QiLCJ2YWx1ZVR5cGUiLCJzdGF0ZVNjaGVtYSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU29sYXJQYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIHR5cGUgdGhhdCByZXByZXNlbnRzIGEgbW9kZWwgb2YgYSBzb2xhciBwYW5lbCB0aGF0IGNvbnZlcnRzIGxpZ2h0IGVuZXJneSB0byBlbGVjdHJpY2FsIGVuZXJneS4gIFRoZSBwYW5lbCBhY3R1YWxseVxyXG4gKiBjb25zaXN0cyBvZiBhbiBhY3R1YWwgcGFuZWwgYnV0IGFsc28gaXMgbWVhbnQgdG8gaGF2ZSBhIGxvd2VyIGFzc2VtYmx5IHRocm91Z2ggd2hpY2ggZW5lcmd5IGNodW5rcyBtb3ZlLiAgVGhlXHJcbiAqIGFwcGVhcmFuY2UgbmVlZHMgdG8gYmUgdGlnaHRseSBjb29yZGluYXRlZCB3aXRoIHRoZSBpbWFnZXMgdXNlZCBpbiB0aGUgdmlldy5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEFuZHJldyBBZGFyZVxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IGNyZWF0ZU9ic2VydmFibGVBcnJheSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IFJlZmVyZW5jZUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9SZWZlcmVuY2VJTy5qcyc7XHJcbmltcG9ydCBzb2xhclBhbmVsSWNvbl9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3NvbGFyUGFuZWxJY29uX3BuZy5qcyc7XHJcbmltcG9ydCBFRkFDQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9FRkFDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEVuZXJneVR5cGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0VuZXJneVR5cGUuanMnO1xyXG5pbXBvcnQgZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIGZyb20gJy4uLy4uL2VuZXJneUZvcm1zQW5kQ2hhbmdlcy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzIGZyb20gJy4uLy4uL0VuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgRW5lcmd5IGZyb20gJy4vRW5lcmd5LmpzJztcclxuaW1wb3J0IEVuZXJneUNodW5rUGF0aE1vdmVyIGZyb20gJy4vRW5lcmd5Q2h1bmtQYXRoTW92ZXIuanMnO1xyXG5pbXBvcnQgRW5lcmd5Q29udmVydGVyIGZyb20gJy4vRW5lcmd5Q29udmVydGVyLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBQQU5FTF9TSVpFID0gbmV3IERpbWVuc2lvbjIoIDAuMTUsIDAuMDcgKTsgLy8gc2l6ZSBvZiB0aGUgcGFuZWwtb25seSBwb3J0aW9uIChubyBjb25uZWN0b3JzKSwgaW4gbWV0ZXJzXHJcblxyXG4vLyBDb25zdGFudHMgdXNlZCBmb3IgY3JlYXRpbmcgdGhlIHBhdGggZm9sbG93ZWQgYnkgdGhlIGVuZXJneSBjaHVua3MgYW5kIGZvciBwb3NpdGlvbmluZyB0aGUgd2lyZSBhbmQgY29ubmVjdG9yXHJcbi8vIGltYWdlcyBpbiB0aGUgdmlldy4gIE1hbnkgb2YgdGhlc2UgbnVtYmVycyB3ZXJlIGVtcGlyaWNhbGx5IGRldGVybWluZWQgYmFzZWQgb24gdGhlIGltYWdlcywgYW5kIHdpbGwgbmVlZCB0byBiZVxyXG4vLyB1cGRhdGVkIGlmIHRoZSBpbWFnZXMgY2hhbmdlLiAgQWxsIHZhbHVlcyBhcmUgaW4gbWV0ZXJzLlxyXG5jb25zdCBQQU5FTF9DT05ORUNUT1JfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIDAuMDE1LCAwICk7IC8vIHdoZXJlIHRoZSBib3R0b20gb2YgdGhlIHBhbmVsIGNvbm5lY3RzIHRvIHRoZSB3aXJlcyAmIHN1Y2hcclxuY29uc3QgQ09OVkVSR0VOQ0VfUE9JTlRfT0ZGU0VUID0gUEFORUxfQ09OTkVDVE9SX09GRlNFVC5wbHVzWFkoIDAsIDAuMDA2NSApO1xyXG5jb25zdCBXSVJFX0NVUlZFX1BPSU5UXzFfT0ZGU0VUID0gUEFORUxfQ09OTkVDVE9SX09GRlNFVC5wbHVzWFkoIDAsIC0wLjAyNSApO1xyXG5jb25zdCBXSVJFX0NVUlZFX1BPSU5UXzJfT0ZGU0VUID0gUEFORUxfQ09OTkVDVE9SX09GRlNFVC5wbHVzWFkoIDAuMDA1LCAtMC4wMzI1ICk7XHJcbmNvbnN0IFdJUkVfQ1VSVkVfUE9JTlRfM19PRkZTRVQgPSBQQU5FTF9DT05ORUNUT1JfT0ZGU0VULnBsdXNYWSggMC4wMDgsIC0wLjAzNTUgKTtcclxuY29uc3QgV0lSRV9DVVJWRV9QT0lOVF80X09GRlNFVCA9IFBBTkVMX0NPTk5FQ1RPUl9PRkZTRVQucGx1c1hZKCAwLjAxMiwgLTAuMDM4ICk7XHJcbmNvbnN0IFdJUkVfQ1VSVkVfUE9JTlRfNV9PRkZTRVQgPSBQQU5FTF9DT05ORUNUT1JfT0ZGU0VULnBsdXNYWSggMC4wMTY1LCAtMC4wNDAgKTtcclxuY29uc3QgT1VUR09JTkdfQ09OTkVDVE9SX09GRlNFVCA9IFBBTkVMX0NPTk5FQ1RPUl9PRkZTRVQucGx1c1hZKCAwLjA0MiwgLTAuMDQxICk7XHJcblxyXG4vLyBJbnRlciBjaHVuayBzcGFjaW5nIHRpbWUgZm9yIHdoZW4gdGhlIGNodW5rcyByZWFjaCB0aGUgJ2NvbnZlcmdlbmNlIHBvaW50JyBhdCB0aGUgYm90dG9tIG9mIHRoZSBzb2xhciBwYW5lbC5cclxuLy8gRW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBjcmVhdGUgYW4gYXBwcm9wcmlhdGUgZmxvdyBvZiBlbGVjdHJpY2FsIGNodW5rcyBpbiBhbiBlbmVyZ3kgdXNlciB3aXJlLiBJbiBzZWNvbmRzLlxyXG5jb25zdCBNSU5fSU5URVJfQ0hVTktfVElNRSA9IDAuNjtcclxuXHJcbmNsYXNzIFNvbGFyUGFuZWwgZXh0ZW5kcyBFbmVyZ3lDb252ZXJ0ZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW5Qcm9wZXJ0eX0gZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtFbmVyZ3lDaHVua0dyb3VwfSBlbmVyZ3lDaHVua0dyb3VwXHJcbiAgICogQHBhcmFtIHtFbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwfSBlbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHksIGVuZXJneUNodW5rR3JvdXAsIGVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxyXG4gICAgICBwaGV0aW9UeXBlOiBTb2xhclBhbmVsLlNvbGFyUGFuZWxJTyxcclxuICAgICAgcGhldGlvU3RhdGU6IHRydWVcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggbmV3IEltYWdlKCBzb2xhclBhbmVsSWNvbl9wbmcgKSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ30gLSBhMTF5IG5hbWVcclxuICAgIHRoaXMuYTExeU5hbWUgPSBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLmExMXkuc29sYXJQYW5lbDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5lbGVjdHJpY2FsRW5lcmd5Q2h1bmtNb3ZlcnMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJpY2FsRW5lcmd5Q2h1bmtNb3ZlcnMnICksXHJcbiAgICAgIHBoZXRpb1R5cGU6IGNyZWF0ZU9ic2VydmFibGVBcnJheS5PYnNlcnZhYmxlQXJyYXlJTyggUmVmZXJlbmNlSU8oIEVuZXJneUNodW5rUGF0aE1vdmVyLkVuZXJneUNodW5rUGF0aE1vdmVySU8gKSApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmxpZ2h0RW5lcmd5Q2h1bmtNb3ZlcnMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdsaWdodEVuZXJneUNodW5rTW92ZXJzJyApLFxyXG4gICAgICBwaGV0aW9UeXBlOiBjcmVhdGVPYnNlcnZhYmxlQXJyYXkuT2JzZXJ2YWJsZUFycmF5SU8oIFJlZmVyZW5jZUlPKCBFbmVyZ3lDaHVua1BhdGhNb3Zlci5FbmVyZ3lDaHVua1BhdGhNb3ZlcklPICkgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5sYXRlc3RDaHVua0Fycml2YWxUaW1lID0gMDtcclxuICAgIHRoaXMubnVtYmVyT2ZDb252ZXJ0ZWRDaHVua3MgPSAwO1xyXG4gICAgdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHkgPSBlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHk7XHJcbiAgICB0aGlzLmVuZXJneU91dHB1dFJhdGVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VuZXJneU91dHB1dFJhdGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIGNvdW50ZXIgdG8gbWltaWMgZnVuY3Rpb24gb2YgSUNsb2NrIGluIG9yaWdpbmFsIEphdmEgY29kZVxyXG4gICAgdGhpcy5zaW11bGF0aW9uVGltZSA9IDA7XHJcbiAgICB0aGlzLmVuZXJneUNodW5rR3JvdXAgPSBlbmVyZ3lDaHVua0dyb3VwO1xyXG4gICAgdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwID0gZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cDtcclxuXHJcbiAgICAvLyBBIHNoYXBlIHVzZWQgdG8gZGVzY3JpYmUgd2hlcmUgdGhlIGNvbGxlY3Rpb24gYXJlYSBpcyByZWxhdGl2ZSB0byB0aGUgbW9kZWwgcG9zaXRpb24uICBUaGUgY29sbGVjdGlvbiBhcmVhIGlzIGF0XHJcbiAgICAvLyB0aGUgdG9wLCBhbmQgdGhlIGVuZXJneSBjaHVua3MgZmxvdyB0aHJvdWdoIHdpcmVzIGFuZCBjb25uZWN0b3JzIGJlbG93LlxyXG4gICAgLy8gQHB1YmxpYyAtIChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLnVudHJhbnNsYXRlZFBhbmVsQm91bmRzID0gbmV3IEJvdW5kczIoXHJcbiAgICAgIC1QQU5FTF9TSVpFLndpZHRoIC8gMixcclxuICAgICAgMCxcclxuICAgICAgUEFORUxfU0laRS53aWR0aCAvIDIsXHJcbiAgICAgIFBBTkVMX1NJWkUuaGVpZ2h0XHJcbiAgICApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy51bnRyYW5zbGF0ZWRBYnNvcnB0aW9uU2hhcGUgPSBuZXcgU2hhcGUoKVxyXG4gICAgICAubW92ZVRvKCAwLCAwIClcclxuICAgICAgLmxpbmVUb1JlbGF0aXZlKCAtUEFORUxfU0laRS53aWR0aCAvIDIsIDAgKVxyXG4gICAgICAubGluZVRvUmVsYXRpdmUoIFBBTkVMX1NJWkUud2lkdGgsIFBBTkVMX1NJWkUuaGVpZ2h0IClcclxuICAgICAgLmNsb3NlKCk7XHJcblxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LmxpbmsoIHBvc2l0aW9uID0+IHtcclxuXHJcbiAgICAgIC8vIHNoYXBlIHVzZWQgd2hlbiBkZXRlcm1pbmluZyBpZiBhIGdpdmVuIGNodW5rIG9mIGxpZ2h0IGVuZXJneSBzaG91bGQgYmUgYWJzb3JiZWQuIEl0IGlzIGNyZWF0ZWQgYXQgKDAsMCkgcmVsYXRpdmVcclxuICAgICAgLy8gdG8gdGhlIHNvbGFyIHBhbmVsLCBzbyBpdHMgcG9zaXRpb24gbmVlZHMgdG8gYmUgYWRqdXN0ZWQgd2hlbiB0aGUgc29sYXIgcGFuZWwgY2hhbmdlcyBpdHMgcG9zaXRpb24uIEl0IGNhbm5vdFxyXG4gICAgICAvLyBqdXN0IHVzZSBhIHJlbGF0aXZlIHBvc2l0aW9uIHRvIHRoZSBzb2xhciBwYW5lbCBiZWNhdXNlIGVuZXJneSBjaHVua3MgdGhhdCBhcmUgcG9zaXRpb25lZCBnbG9iYWxseSBuZWVkIHRvIGNoZWNrXHJcbiAgICAgIC8vIHRvIHNlZSBpZiB0aGV5IGFyZSBsb2NhdGVkIHdpdGhpbiB0aGlzIHNoYXBlLCBzbyBpdCBuZWVkcyBhIGdsb2JhbCBwb3NpdGlvbiBhcyB3ZWxsLiBUaGUgdW50cmFuc2xhdGVkIHZlcnNpb24gb2ZcclxuICAgICAgLy8gdGhpcyBzaGFwZSBpcyBuZWVkZWQgdG8gZHJhdyB0aGUgaGVscGVyIHNoYXBlIG5vZGUgaW4gU29sYXJQYW5lbE5vZGUuXHJcbiAgICAgIC8vIEBwcml2YXRlIHtTaGFwZX1cclxuICAgICAgdGhpcy5hYnNvcnB0aW9uU2hhcGUgPSB0aGlzLnVudHJhbnNsYXRlZEFic29ycHRpb25TaGFwZS50cmFuc2Zvcm1lZCggTWF0cml4My50cmFuc2xhdGlvbiggcG9zaXRpb24ueCwgcG9zaXRpb24ueSApICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHBhcmFtICB7RW5lcmd5fSBpbmNvbWluZ0VuZXJneSAtIHR5cGUsIGFtb3VudCwgZGlyZWN0aW9uIG9mIGVuZXJneVxyXG4gICAqIEByZXR1cm5zIHtFbmVyZ3l9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0LCBpbmNvbWluZ0VuZXJneSApIHtcclxuICAgIGlmICggdGhpcy5hY3RpdmVQcm9wZXJ0eS52YWx1ZSApIHtcclxuXHJcbiAgICAgIC8vIGhhbmRsZSBhbnkgaW5jb21pbmcgZW5lcmd5IGNodW5rc1xyXG4gICAgICBpZiAoIHRoaXMuaW5jb21pbmdFbmVyZ3lDaHVua3MubGVuZ3RoID4gMCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pbmNvbWluZ0VuZXJneUNodW5rcy5mb3JFYWNoKCBpbmNvbWluZ0NodW5rID0+IHtcclxuXHJcbiAgICAgICAgICBpZiAoIGluY29taW5nQ2h1bmsuZW5lcmd5VHlwZVByb3BlcnR5LmdldCgpID09PSBFbmVyZ3lUeXBlLkxJR0hUICkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCB0aGlzLm51bWJlck9mQ29udmVydGVkQ2h1bmtzIDwgNCApIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gY29udmVydCB0aGlzIGNodW5rIHRvIGVsZWN0cmljYWwgZW5lcmd5IGFuZCBhZGQgaXQgdG8gdGhlIGxpc3Qgb2YgZW5lcmd5IGNodW5rcyBiZWluZyBtYW5hZ2VkXHJcbiAgICAgICAgICAgICAgaW5jb21pbmdDaHVuay5lbmVyZ3lUeXBlUHJvcGVydHkuc2V0KCBFbmVyZ3lUeXBlLkVMRUNUUklDQUwgKTtcclxuICAgICAgICAgICAgICB0aGlzLmVuZXJneUNodW5rTGlzdC5wdXNoKCBpbmNvbWluZ0NodW5rICk7XHJcblxyXG4gICAgICAgICAgICAgIC8vIGFkZCBhIFwibW92ZXJcIiB0aGF0IHdpbGwgbW92ZSB0aGlzIGVuZXJneSBjaHVuayB0byB0aGUgYm90dG9tIG9mIHRoZSBzb2xhciBwYW5lbFxyXG4gICAgICAgICAgICAgIHRoaXMuZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzLnB1c2goIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5jcmVhdGVOZXh0RWxlbWVudChcclxuICAgICAgICAgICAgICAgIGluY29taW5nQ2h1bmssXHJcbiAgICAgICAgICAgICAgICBFbmVyZ3lDaHVua1BhdGhNb3Zlci5jcmVhdGVQYXRoRnJvbU9mZnNldHMoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSwgWyBDT05WRVJHRU5DRV9QT0lOVF9PRkZTRVQgXSApLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaG9vc2VDaHVua1NwZWVkT25QYW5lbCggaW5jb21pbmdDaHVuayApIClcclxuICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICB0aGlzLm51bWJlck9mQ29udmVydGVkQ2h1bmtzKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIGxlYXZlIHRoaXMgY2h1bmsgYXMgbGlnaHQgZW5lcmd5IGFuZCBhZGQgaXQgdG8gdGhlIGxpc3Qgb2YgZW5lcmd5IGNodW5rcyBiZWluZyBtYW5hZ2VkXHJcbiAgICAgICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0xpc3QucHVzaCggaW5jb21pbmdDaHVuayApO1xyXG5cclxuICAgICAgICAgICAgICAvLyBhZGQgYSBcIm1vdmVyXCIgdGhhdCB3aWxsIHJlZmxlY3QgdGhpcyBlbmVyZ3kgY2h1bmsgdXAgYW5kIGF3YXkgZnJvbSB0aGUgcGFuZWxcclxuICAgICAgICAgICAgICB0aGlzLmxpZ2h0RW5lcmd5Q2h1bmtNb3ZlcnMucHVzaCggdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KFxyXG4gICAgICAgICAgICAgICAgaW5jb21pbmdDaHVuayxcclxuICAgICAgICAgICAgICAgIEVuZXJneUNodW5rUGF0aE1vdmVyLmNyZWF0ZVN0cmFpZ2h0UGF0aChcclxuICAgICAgICAgICAgICAgICAgaW5jb21pbmdDaHVuay5wb3NpdGlvblByb3BlcnR5LmdldCgpLFxyXG4gICAgICAgICAgICAgICAgICAtaW5jb21pbmdDaHVuay52ZWxvY2l0eS5hbmdsZVxyXG4gICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIEVGQUNDb25zdGFudHMuRU5FUkdZX0NIVU5LX1ZFTE9DSVRZIClcclxuICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICB0aGlzLm51bWJlck9mQ29udmVydGVkQ2h1bmtzID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIGJ5IGRlc2lnbiwgdGhpcyBzaG91bGRuJ3QgaGFwcGVuLCBzbyByYWlzZSBhbiBlcnJvciBpZiBpdCBkb2VzXHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgICAgICAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgICBgRW5jb3VudGVyZWQgZW5lcmd5IGNodW5rIHdpdGggdW5leHBlY3RlZCB0eXBlOiAke2luY29taW5nQ2h1bmsuZW5lcmd5VHlwZVByb3BlcnR5LmdldCgpfWBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5jb21pbmdFbmVyZ3lDaHVua3MuY2xlYXIoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gbW92ZSB0aGUgZW5lcmd5IGNodW5rcyB0aGF0IGFyZSBjdXJyZW50bHkgdW5kZXIgbWFuYWdlbWVudFxyXG4gICAgICB0aGlzLm1vdmVFbGVjdHJpY2FsRW5lcmd5Q2h1bmtzKCBkdCApO1xyXG4gICAgICB0aGlzLm1vdmVSZWZsZWN0ZWRFbmVyZ3lDaHVua3MoIGR0ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcHJvZHVjZSB0aGUgYXBwcm9wcmlhdGUgYW1vdW50IG9mIGVuZXJneVxyXG4gICAgbGV0IGVuZXJneVByb2R1Y2VkID0gMDtcclxuICAgIGlmICggdGhpcy5hY3RpdmVQcm9wZXJ0eS52YWx1ZSAmJiBpbmNvbWluZ0VuZXJneS50eXBlID09PSBFbmVyZ3lUeXBlLkxJR0hUICkge1xyXG5cclxuICAgICAgLy8gNjglIGVmZmljaWVudC4gRW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBtYXRjaCB0aGUgcmF0ZSBvZiBlbmVyZ3kgY2h1bmtzIHRoYXQgZmxvdyBmcm9tIHRoZSBzdW4gdG8gdGhlIHNvbGFyXHJcbiAgICAgIC8vIHBhbmVsICh0aGlzIHdheSwgdGhlIGZhbiBtb3ZlcyBhdCB0aGUgc2FtZSBzcGVlZCB3aGVuIGNodW5rcyBhcmUgb24gb3Igb2ZmKS5cclxuICAgICAgZW5lcmd5UHJvZHVjZWQgPSBpbmNvbWluZ0VuZXJneS5hbW91bnQgKiAwLjY4O1xyXG4gICAgfVxyXG4gICAgdGhpcy5lbmVyZ3lPdXRwdXRSYXRlUHJvcGVydHkudmFsdWUgPSBVdGlscy50b0ZpeGVkTnVtYmVyKCBlbmVyZ3lQcm9kdWNlZCAvIGR0LCAxMSApO1xyXG5cclxuICAgIHRoaXMuc2ltdWxhdGlvblRpbWUgKz0gZHQ7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBFbmVyZ3koIEVuZXJneVR5cGUuRUxFQ1RSSUNBTCwgZW5lcmd5UHJvZHVjZWQsIDAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHVwZGF0ZSBlbGVjdHJpY2FsIGVuZXJneSBjaHVuayBwb3NpdGlvbnNcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBtb3ZlRWxlY3RyaWNhbEVuZXJneUNodW5rcyggZHQgKSB7XHJcblxyXG4gICAgLy8gaXRlcmF0ZSBvdmVyIGEgY29weSB0byBtdXRhdGUgb3JpZ2luYWwgd2l0aG91dCBwcm9ibGVtc1xyXG4gICAgY29uc3QgbW92ZXJzID0gdGhpcy5lbGVjdHJpY2FsRW5lcmd5Q2h1bmtNb3ZlcnMuc2xpY2UoKTtcclxuXHJcbiAgICBtb3ZlcnMuZm9yRWFjaCggbW92ZXIgPT4ge1xyXG5cclxuICAgICAgbW92ZXIubW92ZUFsb25nUGF0aCggZHQgKTtcclxuXHJcbiAgICAgIGlmICggbW92ZXIucGF0aEZ1bGx5VHJhdmVyc2VkICkge1xyXG5cclxuICAgICAgICB0aGlzLmVsZWN0cmljYWxFbmVyZ3lDaHVua01vdmVycy5yZW1vdmUoIG1vdmVyICk7XHJcbiAgICAgICAgY29uc3QgcGF0aFRocm91Z2hDb252ZXJ0ZXJPZmZzZXRzID0gW1xyXG4gICAgICAgICAgV0lSRV9DVVJWRV9QT0lOVF8xX09GRlNFVCxcclxuICAgICAgICAgIFdJUkVfQ1VSVkVfUE9JTlRfMl9PRkZTRVQsXHJcbiAgICAgICAgICBXSVJFX0NVUlZFX1BPSU5UXzNfT0ZGU0VULFxyXG4gICAgICAgICAgV0lSRV9DVVJWRV9QT0lOVF80X09GRlNFVCxcclxuICAgICAgICAgIFdJUkVfQ1VSVkVfUE9JTlRfNV9PRkZTRVQsXHJcbiAgICAgICAgICBPVVRHT0lOR19DT05ORUNUT1JfT0ZGU0VUXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgLy8gZW5lcmd5IGNodW5rIGhhcyByZWFjaGVkIHRoZSBib3R0b20gb2YgdGhlIHBhbmVsIGFuZCBub3cgbmVlZHMgdG8gbW92ZSB0aHJvdWdoIHRoZSBjb252ZXJ0ZXJcclxuICAgICAgICBpZiAoIG1vdmVyLmVuZXJneUNodW5rLnBvc2l0aW9uUHJvcGVydHkudmFsdWUuZXF1YWxzKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUucGx1cyggQ09OVkVSR0VOQ0VfUE9JTlRfT0ZGU0VUICkgKSApIHtcclxuICAgICAgICAgIHRoaXMuZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzLnB1c2goIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5jcmVhdGVOZXh0RWxlbWVudCggbW92ZXIuZW5lcmd5Q2h1bmssXHJcbiAgICAgICAgICAgIEVuZXJneUNodW5rUGF0aE1vdmVyLmNyZWF0ZVBhdGhGcm9tT2Zmc2V0cyggdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLCBwYXRoVGhyb3VnaENvbnZlcnRlck9mZnNldHMgKSxcclxuICAgICAgICAgICAgRUZBQ0NvbnN0YW50cy5FTkVSR1lfQ0hVTktfVkVMT0NJVFkgKSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyB0aGUgZW5lcmd5IGNodW5rIGhhcyB0cmF2ZWxlZCBhY3Jvc3MgdGhlIHBhbmVsIGFuZCB0aHJvdWdoIHRoZSBjb252ZXJ0ZXIsIHNvIHBhc3MgaXQgb2ZmIHRvIHRoZSBuZXh0XHJcbiAgICAgICAgLy8gZWxlbWVudCBpbiB0aGUgc3lzdGVtXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmVuZXJneUNodW5rTGlzdC5yZW1vdmUoIG1vdmVyLmVuZXJneUNodW5rICk7XHJcbiAgICAgICAgICB0aGlzLm91dGdvaW5nRW5lcmd5Q2h1bmtzLnB1c2goIG1vdmVyLmVuZXJneUNodW5rICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5kaXNwb3NlRWxlbWVudCggbW92ZXIgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogdXBkYXRlIGxpZ2h0IGVuZXJneSBjaHVuayBwb3NpdGlvbnNcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBtb3ZlUmVmbGVjdGVkRW5lcmd5Q2h1bmtzKCBkdCApIHtcclxuXHJcbiAgICAvLyBpdGVyYXRlIG92ZXIgYSBjb3B5IHRvIG11dGF0ZSBvcmlnaW5hbCB3aXRob3V0IHByb2JsZW1zXHJcbiAgICBjb25zdCBtb3ZlcnMgPSB0aGlzLmxpZ2h0RW5lcmd5Q2h1bmtNb3ZlcnMuc2xpY2UoKTtcclxuXHJcbiAgICBtb3ZlcnMuZm9yRWFjaCggbW92ZXIgPT4ge1xyXG4gICAgICBtb3Zlci5tb3ZlQWxvbmdQYXRoKCBkdCApO1xyXG5cclxuICAgICAgLy8gcmVtb3ZlIHRoaXMgZW5lcmd5IGNodW5rIGVudGlyZWx5XHJcbiAgICAgIGlmICggbW92ZXIucGF0aEZ1bGx5VHJhdmVyc2VkICkge1xyXG4gICAgICAgIHRoaXMubGlnaHRFbmVyZ3lDaHVua01vdmVycy5yZW1vdmUoIG1vdmVyICk7XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0xpc3QucmVtb3ZlKCBtb3Zlci5lbmVyZ3lDaHVuayApO1xyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtHcm91cC5kaXNwb3NlRWxlbWVudCggbW92ZXIuZW5lcmd5Q2h1bmsgKTtcclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuZGlzcG9zZUVsZW1lbnQoIG1vdmVyICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RW5lcmd5fSBpbmNvbWluZ0VuZXJneVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBwcmVsb2FkRW5lcmd5Q2h1bmtzKCBpbmNvbWluZ0VuZXJneSApIHtcclxuICAgIHRoaXMuY2xlYXJFbmVyZ3lDaHVua3MoKTtcclxuXHJcbiAgICBpZiAoIGluY29taW5nRW5lcmd5LmFtb3VudCA9PT0gMCB8fCBpbmNvbWluZ0VuZXJneS50eXBlICE9PSBFbmVyZ3lUeXBlLkxJR0hUICkge1xyXG5cclxuICAgICAgLy8gbm8gZW5lcmd5IGNodW5rIHByZS1sb2FkaW5nIG5lZWRlZFxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYWJzb3JwdGlvbkJvdW5kcyA9IHRoaXMuZ2V0QWJzb3JwdGlvblNoYXBlKCkuYm91bmRzO1xyXG4gICAgY29uc3QgbG93ZXJMZWZ0T2ZQYW5lbCA9IG5ldyBWZWN0b3IyKCBhYnNvcnB0aW9uQm91bmRzLm1pblgsIGFic29ycHRpb25Cb3VuZHMubWluWSApO1xyXG4gICAgY29uc3QgdXBwZXJSaWdodE9mUGFuZWwgPSBuZXcgVmVjdG9yMiggYWJzb3JwdGlvbkJvdW5kcy5tYXhYLCBhYnNvcnB0aW9uQm91bmRzLm1heFkgKTtcclxuICAgIGNvbnN0IGNyb3NzTGluZUFuZ2xlID0gdXBwZXJSaWdodE9mUGFuZWwubWludXMoIGxvd2VyTGVmdE9mUGFuZWwgKS5hbmdsZTtcclxuICAgIGNvbnN0IGNyb3NzTGluZUxlbmd0aCA9IGxvd2VyTGVmdE9mUGFuZWwuZGlzdGFuY2UoIHVwcGVyUmlnaHRPZlBhbmVsICk7XHJcbiAgICBjb25zdCBkdCA9IDEgLyBFRkFDQ29uc3RhbnRzLkZSQU1FU19QRVJfU0VDT05EO1xyXG4gICAgbGV0IGVuZXJneVNpbmNlTGFzdENodW5rID0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LICogMC45OTtcclxuICAgIGxldCBwcmVsb2FkQ29tcGxldGUgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBzaW11bGF0ZSBlbmVyZ3kgY2h1bmtzIG1vdmluZyB0aHJvdWdoIHRoZSBzeXN0ZW1cclxuICAgIHdoaWxlICggIXByZWxvYWRDb21wbGV0ZSApIHtcclxuXHJcbiAgICAgIC8vIGZ1bGwgZW5lcmd5IHJhdGUgZ2VuZXJhdGVzIHRvbyBtYW55IGNodW5rcywgc28gYW4gYWRqdXN0bWVudCBmYWN0b3IgaXMgdXNlZFxyXG4gICAgICBlbmVyZ3lTaW5jZUxhc3RDaHVuayArPSBpbmNvbWluZ0VuZXJneS5hbW91bnQgKiBkdCAqIDAuNDtcclxuXHJcbiAgICAgIC8vIGRldGVybWluZSBpZiB0aW1lIHRvIGFkZCBhIG5ldyBjaHVua1xyXG4gICAgICBpZiAoIGVuZXJneVNpbmNlTGFzdENodW5rID49IEVGQUNDb25zdGFudHMuRU5FUkdZX1BFUl9DSFVOSyApIHtcclxuICAgICAgICBsZXQgaW5pdGlhbFBvc2l0aW9uO1xyXG4gICAgICAgIGlmICggdGhpcy5lbmVyZ3lDaHVua0xpc3QubGVuZ3RoID09PSAwICkge1xyXG5cclxuICAgICAgICAgIC8vIGZvciBwcmVkaWN0YWJpbGl0eSBvZiB0aGUgYWxnb3JpdGhtLCBhZGQgdGhlIGZpcnN0IGNodW5rIHRvIHRoZSBjZW50ZXIgb2YgdGhlIHBhbmVsXHJcbiAgICAgICAgICBpbml0aWFsUG9zaXRpb24gPSBsb3dlckxlZnRPZlBhbmVsLnBsdXMoXHJcbiAgICAgICAgICAgIG5ldyBWZWN0b3IyKCBjcm9zc0xpbmVMZW5ndGggKiAwLjUsIDAgKS5yb3RhdGVkKCBjcm9zc0xpbmVBbmdsZSApXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBjaG9vc2UgYSByYW5kb20gcG9zaXRpb24gYWxvbmcgdGhlIGNlbnRlciBwb3J0aW9uIG9mIHRoZSBjcm9zcyBsaW5lXHJcbiAgICAgICAgICBpbml0aWFsUG9zaXRpb24gPSBsb3dlckxlZnRPZlBhbmVsLnBsdXMoXHJcbiAgICAgICAgICAgIG5ldyBWZWN0b3IyKCBjcm9zc0xpbmVMZW5ndGggKiAoIDAuNSAqIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgKyAwLjI1ICksIDAgKS5yb3RhdGVkKCBjcm9zc0xpbmVBbmdsZSApXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbmV3RW5lcmd5Q2h1bmsgPSB0aGlzLmVuZXJneUNodW5rR3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoXHJcbiAgICAgICAgICBFbmVyZ3lUeXBlLkVMRUNUUklDQUwsXHJcbiAgICAgICAgICBpbml0aWFsUG9zaXRpb24sXHJcbiAgICAgICAgICBWZWN0b3IyLlpFUk8sXHJcbiAgICAgICAgICB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtMaXN0LnB1c2goIG5ld0VuZXJneUNodW5rICk7XHJcblxyXG4gICAgICAgIC8vIGFkZCBhIFwibW92ZXJcIiB0aGF0IHdpbGwgbW92ZSB0aGlzIGVuZXJneSBjaHVuayB0byB0aGUgYm90dG9tIG9mIHRoZSBzb2xhciBwYW5lbFxyXG4gICAgICAgIHRoaXMuZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzLnB1c2goIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5jcmVhdGVOZXh0RWxlbWVudChcclxuICAgICAgICAgIG5ld0VuZXJneUNodW5rLFxyXG4gICAgICAgICAgRW5lcmd5Q2h1bmtQYXRoTW92ZXIuY3JlYXRlUGF0aEZyb21PZmZzZXRzKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCksIFsgQ09OVkVSR0VOQ0VfUE9JTlRfT0ZGU0VUIF0gKSxcclxuICAgICAgICAgIHRoaXMuY2hvb3NlQ2h1bmtTcGVlZE9uUGFuZWwoIG5ld0VuZXJneUNodW5rICkgKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBlbmVyZ3kgc2luY2UgbGFzdCBjaHVua1xyXG4gICAgICAgIGVuZXJneVNpbmNlTGFzdENodW5rIC09IEVGQUNDb25zdGFudHMuRU5FUkdZX1BFUl9DSFVOSztcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5tb3ZlRWxlY3RyaWNhbEVuZXJneUNodW5rcyggZHQgKTtcclxuXHJcbiAgICAgIGlmICggdGhpcy5vdXRnb2luZ0VuZXJneUNodW5rcy5sZW5ndGggPiAwICkge1xyXG5cclxuICAgICAgICAvLyBhbiBlbmVyZ3kgY2h1bmsgaGFzIG1hZGUgaXQgYWxsIHRoZSB3YXkgdGhyb3VnaCB0aGUgc3lzdGVtLCB3aGljaCBjb21wbGV0ZXMgdGhlIHByZS1sb2FkXHJcbiAgICAgICAgcHJlbG9hZENvbXBsZXRlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge0VuZXJneX0gdHlwZSwgYW1vdW50LCBkaXJlY3Rpb24gb2YgZW1pdHRlZCBlbmVyZ3lcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0RW5lcmd5T3V0cHV0UmF0ZSgpIHtcclxuICAgIHJldHVybiBuZXcgRW5lcmd5KCBFbmVyZ3lUeXBlLkVMRUNUUklDQUwsIHRoaXMuZW5lcmd5T3V0cHV0UmF0ZVByb3BlcnR5LnZhbHVlLCAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBjaG9vc2Ugc3BlZWQgb2YgY2h1bmsgb24gcGFuZWwgc3VjaCB0aGF0IGl0IHdvbid0IGNsdW1wIHVwIHdpdGggb3RoZXIgY2h1bmtzXHJcbiAgICogQHBhcmFtICB7RW5lcmd5Q2h1bmt9IGluY29taW5nRW5lcmd5Q2h1bmtcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzcGVlZFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgY2hvb3NlQ2h1bmtTcGVlZE9uUGFuZWwoIGluY29taW5nRW5lcmd5Q2h1bmsgKSB7XHJcblxyXG4gICAgLy8gc3RhcnQgd2l0aCBkZWZhdWx0IHNwZWVkXHJcbiAgICBjb25zdCBjaHVua1NwZWVkID0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfQ0hVTktfVkVMT0NJVFk7XHJcblxyXG4gICAgLy8gY291bnQgdGhlIG51bWJlciBvZiBjaHVua3MgY3VycmVudGx5IG9uIHRoZSBwYW5lbFxyXG4gICAgbGV0IG51bWJlck9mQ2h1bmtzT25QYW5lbCA9IDA7XHJcblxyXG4gICAgdGhpcy5lbGVjdHJpY2FsRW5lcmd5Q2h1bmtNb3ZlcnMuZm9yRWFjaCggbW92ZXIgPT4ge1xyXG4gICAgICBpZiAoIG1vdmVyLmdldEZpbmFsRGVzdGluYXRpb24oKS5lcXVhbHMoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCBDT05WRVJHRU5DRV9QT0lOVF9PRkZTRVQgKSApICkge1xyXG4gICAgICAgIG51bWJlck9mQ2h1bmtzT25QYW5lbCsrO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY29tcHV0ZSB0aGUgcHJvamVjdGVkIHRpbWUgb2YgYXJyaXZhbCBhdCB0aGUgY29udmVyZ2VuY2UgcG9pbnRcclxuICAgIGNvbnN0IGRpc3RhbmNlVG9Db252ZXJnZW5jZVBvaW50ID1cclxuICAgICAgaW5jb21pbmdFbmVyZ3lDaHVuay5wb3NpdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUucGx1cyggQ09OVkVSR0VOQ0VfUE9JTlRfT0ZGU0VUICkgKTtcclxuICAgIGNvbnN0IHRyYXZlbFRpbWUgPSBkaXN0YW5jZVRvQ29udmVyZ2VuY2VQb2ludCAvIGNodW5rU3BlZWQ7XHJcbiAgICBsZXQgcHJvamVjdGVkQXJyaXZhbFRpbWUgPSB0aGlzLnNpbXVsYXRpb25UaW1lICsgdHJhdmVsVGltZTtcclxuXHJcbiAgICAvLyBjYWxjdWxhdGUgdGhlIG1pbmltdW0gc3BhY2luZyBiYXNlZCBvbiB0aGUgbnVtYmVyIG9mIGNodW5rcyBvbiB0aGUgcGFuZWxcclxuICAgIGNvbnN0IG1pbkFycml2YWxUaW1lU3BhY2luZyA9IG51bWJlck9mQ2h1bmtzT25QYW5lbCA8PSAzID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1JTl9JTlRFUl9DSFVOS19USU1FIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1JTl9JTlRFUl9DSFVOS19USU1FIC8gKCBudW1iZXJPZkNodW5rc09uUGFuZWwgLSAyICk7XHJcblxyXG4gICAgLy8gaWYgdGhlIHByb2plY3RlZCBhcnJpdmFsIHRpbWUgaXMgdG9vIGNsb3NlIHRvIHRoZSBjdXJyZW50IGxhc3QgY2h1bmssIHNsb3cgZG93biBzbyB0aGF0IHRoZSBtaW5pbXVtIHNwYWNpbmcgaXNcclxuICAgIC8vIG1haW50YWluZWRcclxuICAgIGlmICggdGhpcy5sYXRlc3RDaHVua0Fycml2YWxUaW1lICsgbWluQXJyaXZhbFRpbWVTcGFjaW5nID4gcHJvamVjdGVkQXJyaXZhbFRpbWUgKSB7XHJcbiAgICAgIHByb2plY3RlZEFycml2YWxUaW1lID0gdGhpcy5sYXRlc3RDaHVua0Fycml2YWxUaW1lICsgbWluQXJyaXZhbFRpbWVTcGFjaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubGF0ZXN0Q2h1bmtBcnJpdmFsVGltZSA9IHByb2plY3RlZEFycml2YWxUaW1lO1xyXG5cclxuICAgIHJldHVybiBkaXN0YW5jZVRvQ29udmVyZ2VuY2VQb2ludCAvICggcHJvamVjdGVkQXJyaXZhbFRpbWUgLSB0aGlzLnNpbXVsYXRpb25UaW1lICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0VuZXJneUNodW5rW119IGVuZXJneUNodW5rc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBpbmplY3RFbmVyZ3lDaHVua3MoIGVuZXJneUNodW5rcyApIHtcclxuXHJcbiAgICAvLyBiZWZvcmUgYWRkaW5nIGFsbCBpbmplY3RlZCBjaHVua3MgaW50byB0aGUgc29sYXIgcGFuZWwncyBpbmNvbWluZyBlbmVyZ3kgY2h1bmtzIGFycmF5LCBtYWtlIHN1cmUgdGhhdCB0aGV5IGFyZVxyXG4gICAgLy8gYWxsIGxpZ2h0IGVuZXJneS4gaWYgbm90LCBwdWxsIG91dCB0aGUgYmFkIG9uZXMgYW5kIHBhc3MgdGhlIHJlc3QgdGhyb3VnaC5cclxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZW5lcmd5LWZvcm1zLWFuZC1jaGFuZ2VzL2lzc3Vlcy8xNTBcclxuICAgIGVuZXJneUNodW5rcy5mb3JFYWNoKCBjaHVuayA9PiB7XHJcbiAgICAgIGlmICggY2h1bmsuZW5lcmd5VHlwZVByb3BlcnR5LnZhbHVlICE9PSBFbmVyZ3lUeXBlLkxJR0hUICkge1xyXG4gICAgICAgIGVuZXJneUNodW5rcyA9IF8ucHVsbCggZW5lcmd5Q2h1bmtzLCBjaHVuayApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICBzdXBlci5pbmplY3RFbmVyZ3lDaHVua3MoIGVuZXJneUNodW5rcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGNsZWFyRW5lcmd5Q2h1bmtzKCkge1xyXG4gICAgc3VwZXIuY2xlYXJFbmVyZ3lDaHVua3MoKTtcclxuICAgIHRoaXMuZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzLmZvckVhY2goIG1vdmVyID0+IHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5kaXNwb3NlRWxlbWVudCggbW92ZXIgKSApO1xyXG4gICAgdGhpcy5lbGVjdHJpY2FsRW5lcmd5Q2h1bmtNb3ZlcnMuY2xlYXIoKTtcclxuICAgIHRoaXMubGlnaHRFbmVyZ3lDaHVua01vdmVycy5mb3JFYWNoKCBtb3ZlciA9PiB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuZGlzcG9zZUVsZW1lbnQoIG1vdmVyICkgKTtcclxuICAgIHRoaXMubGlnaHRFbmVyZ3lDaHVua01vdmVycy5jbGVhcigpO1xyXG4gICAgdGhpcy5sYXRlc3RDaHVua0Fycml2YWxUaW1lID0gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGdldCB0aGUgc2hhcGUgb2YgdGhlIGFyZWEgd2hlcmUgbGlnaHQgY2FuIGJlIGFic29yYmVkXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRBYnNvcnB0aW9uU2hhcGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hYnNvcnB0aW9uU2hhcGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljIChFbmVyZ3lTeXN0ZW1FbGVtZW50SU8pXHJcbiAgICogQHJldHVybnMge09iamVjdH1cclxuICAgKi9cclxuICB0b1N0YXRlT2JqZWN0KCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbnVtYmVyT2ZDb252ZXJ0ZWRDaHVua3M6IHRoaXMubnVtYmVyT2ZDb252ZXJ0ZWRDaHVua3MsXHJcbiAgICAgIGxhdGVzdENodW5rQXJyaXZhbFRpbWU6IHRoaXMubGF0ZXN0Q2h1bmtBcnJpdmFsVGltZSxcclxuICAgICAgc2ltdWxhdGlvblRpbWU6IHRoaXMuc2ltdWxhdGlvblRpbWVcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljIChFbmVyZ3lTeXN0ZW1FbGVtZW50SU8pXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlT2JqZWN0IC0gc2VlIHRoaXMudG9TdGF0ZU9iamVjdCgpXHJcbiAgICovXHJcbiAgYXBwbHlTdGF0ZSggc3RhdGVPYmplY3QgKSB7XHJcbiAgICB0aGlzLm51bWJlck9mQ29udmVydGVkQ2h1bmtzID0gc3RhdGVPYmplY3QubnVtYmVyT2ZDb252ZXJ0ZWRDaHVua3M7XHJcbiAgICB0aGlzLmxhdGVzdENodW5rQXJyaXZhbFRpbWUgPSBzdGF0ZU9iamVjdC5sYXRlc3RDaHVua0Fycml2YWxUaW1lO1xyXG4gICAgdGhpcy5zaW11bGF0aW9uVGltZSA9IHN0YXRlT2JqZWN0LnNpbXVsYXRpb25UaW1lO1xyXG4gIH1cclxufVxyXG5cclxuLy8gc3RhdGljc1xyXG5Tb2xhclBhbmVsLlBBTkVMX0NPTk5FQ1RPUl9PRkZTRVQgPSBQQU5FTF9DT05ORUNUT1JfT0ZGU0VUO1xyXG5cclxuU29sYXJQYW5lbC5Tb2xhclBhbmVsSU8gPSBuZXcgSU9UeXBlKCAnU29sYXJQYW5lbElPJywge1xyXG4gIHZhbHVlVHlwZTogU29sYXJQYW5lbCxcclxuICB0b1N0YXRlT2JqZWN0OiBzb2xhclBhbmVsID0+IHNvbGFyUGFuZWwudG9TdGF0ZU9iamVjdCgpLFxyXG4gIGFwcGx5U3RhdGU6ICggc29sYXJQYW5lbCwgc3RhdGVPYmplY3QgKSA9PiBzb2xhclBhbmVsLmFwcGx5U3RhdGUoIHN0YXRlT2JqZWN0ICksXHJcbiAgc3RhdGVTY2hlbWE6IHtcclxuICAgIG51bWJlck9mQ29udmVydGVkQ2h1bmtzOiBOdW1iZXJJTyxcclxuICAgIGxhdGVzdENodW5rQXJyaXZhbFRpbWU6IE51bWJlcklPLFxyXG4gICAgc2ltdWxhdGlvblRpbWU6IE51bWJlcklPXHJcbiAgfVxyXG59ICk7XHJcblxyXG5lbmVyZ3lGb3Jtc0FuZENoYW5nZXMucmVnaXN0ZXIoICdTb2xhclBhbmVsJywgU29sYXJQYW5lbCApO1xyXG5leHBvcnQgZGVmYXVsdCBTb2xhclBhbmVsO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxxQkFBcUIsTUFBTSw4Q0FBOEM7QUFDaEYsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSw2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