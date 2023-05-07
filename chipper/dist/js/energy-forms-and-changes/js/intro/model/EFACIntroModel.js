// Copyright 2014-2022, University of Colorado Boulder

/**
 * model for the 'Intro' screen of the Energy Forms And Changes simulation
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import { Color } from '../../../../scenery/js/imports.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import EFACConstants from '../../common/EFACConstants.js';
import Beaker from '../../common/model/Beaker.js';
import BeakerType from '../../common/model/BeakerType.js';
import Burner from '../../common/model/Burner.js';
import EnergyChunkGroup from '../../common/model/EnergyChunkGroup.js';
import EnergyChunkWanderControllerGroup from '../../common/model/EnergyChunkWanderControllerGroup.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import Air from './Air.js';
import BeakerContainer from './BeakerContainer.js';
import Block from './Block.js';
import BlockType from './BlockType.js';
import EnergyBalanceTracker from './EnergyBalanceTracker.js';
import StickyTemperatureAndColorSensor from './StickyTemperatureAndColorSensor.js';

// constants
const NUMBER_OF_THERMOMETERS = 4;
const BEAKER_WIDTH = 0.085; // in meters
const BEAKER_HEIGHT = BEAKER_WIDTH * 1.1;
const BEAKER_MAJOR_TICK_MARK_DISTANCE = BEAKER_HEIGHT * 0.95 / 3;
const FAST_FORWARD_MULTIPLIER = 4; // how many times faster the intro screen runs when in fast forward mode

// the sim model x range is laid out in meters with 0 in the middle, so this value is the left edge of the sim, in meters
const LEFT_EDGE = -0.30;
const RIGHT_EDGE = 0.30;

// the desired space between the edges of the sim (left edge or right edge) and the edge of the widest element
// (a beaker) when it's sitting at one of the outer snap-to spots on the ground, in meters
const EDGE_PAD = 0.016;

// number of snap-to spots on the ground
const NUMBER_OF_GROUND_SPOTS = EFACConstants.MAX_NUMBER_OF_INTRO_BURNERS + EFACConstants.MAX_NUMBER_OF_INTRO_ELEMENTS;

// of the available ground spots, this is the index at which the burner(s) is/are created
const LEFT_BURNER_GROUND_SPOT_INDEX = 2;

// initial thermometer position, intended to be away from any model objects so that they don't get stuck to anything
const INITIAL_THERMOMETER_POSITION = new Vector2(100, 100);

// colors
const FLAME_ORANGE = new Color('orange');
const ICE_BLUE = new Color('#87CEFA');
class EFACIntroModel {
  /**
   * @param {BlockType[]} blocksToCreate
   * @param {BeakerType[]} beakersToCreate
   * @param {number} numberOfBurners
   * @param {Tandem} tandem
   */
  constructor(blocksToCreate, beakersToCreate, numberOfBurners, tandem) {
    // @public {BooleanProperty} - controls whether the energy chunks are visible in the view
    this.energyChunksVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('energyChunksVisibleProperty'),
      phetioDocumentation: 'whether the energy chunks are visible'
    });

    // @public {BooleanProperty} - controls whether HeaterCoolerNodes are linked together
    this.linkedHeatersProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('linkedHeatersProperty'),
      phetioDocumentation: 'whether the heaters are linked together or independent of each other'
    });

    // @public {BooleanProperty} - is the sim running or paused?
    this.isPlayingProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('isPlayingProperty'),
      phetioDocumentation: 'whether the screen is playing or paused'
    });

    // @private
    this.energyChunkGroup = new EnergyChunkGroup(this.energyChunksVisibleProperty, {
      tandem: tandem.createTandem('energyChunkGroup')
    });

    // @private
    this.energyChunkWanderControllerGroup = new EnergyChunkWanderControllerGroup(this.energyChunkGroup, {
      tandem: tandem.createTandem('energyChunkWanderControllerGroup')
    });

    // @public for debugging, controls play speed of the simulation
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

    // @public (read-only) {Air} - model of the air that surrounds the other model elements, and can absorb or provide
    // energy
    this.air = new Air(this.energyChunksVisibleProperty, this.energyChunkGroup, this.energyChunkWanderControllerGroup, {
      tandem: tandem.createTandem('air')
    });

    // @private {number} - calculate space in between the center points of the snap-to spots on the ground
    this.spaceBetweenGroundSpotCenters = (RIGHT_EDGE - LEFT_EDGE - EDGE_PAD * 2 - BEAKER_WIDTH) / (NUMBER_OF_GROUND_SPOTS - 1);

    // @private {number[]} - list of valid x-positions for model elements to rest. this is used for the initial
    // positions of model elements, but also for finding valid spots for the elements to fall to, so it should be
    // modified after creation.
    this.groundSpotXPositions = [];

    // determine the positions of the snap-to spots, and round them to a few decimal places
    const leftEdgeToBeakerCenterPad = LEFT_EDGE + EDGE_PAD + BEAKER_WIDTH / 2;
    for (let i = 0; i < NUMBER_OF_GROUND_SPOTS; i++) {
      this.groundSpotXPositions.push(Utils.roundSymmetric((this.spaceBetweenGroundSpotCenters * i + leftEdgeToBeakerCenterPad) * 1000) / 1000);
    }

    // @public (read-only) {boolean}
    this.twoBurners = numberOfBurners === 2;

    // after creating the burners, the rest of the elements are created starting from this index
    const indexOfFirstElementAfterLastBeaker = LEFT_BURNER_GROUND_SPOT_INDEX + numberOfBurners;

    // only used for initial positions of model elements. determine which spots are only for burners, then pull those
    // out of the available indices for movable elements
    const burnerGroundSpotXPositions = this.groundSpotXPositions.slice(LEFT_BURNER_GROUND_SPOT_INDEX, indexOfFirstElementAfterLastBeaker);
    let movableElementGroundSpotXPositions = [...this.groundSpotXPositions.slice(0, LEFT_BURNER_GROUND_SPOT_INDEX), ...this.groundSpotXPositions.slice(indexOfFirstElementAfterLastBeaker)];

    // @public (read-only) {Burner}
    this.leftBurner = new Burner(new Vector2(burnerGroundSpotXPositions[0], 0), this.energyChunksVisibleProperty, this.energyChunkGroup, {
      energyChunkWanderControllerGroup: this.energyChunkWanderControllerGroup,
      tandem: tandem.createTandem('leftBurner'),
      phetioDocumentation: 'always appears in the simulation, but may be the only burner'
    });

    // @public (read-only) {Burner}
    this.rightBurner = new Burner(new Vector2(burnerGroundSpotXPositions[1] || 0, 0), this.energyChunksVisibleProperty, this.energyChunkGroup, {
      energyChunkWanderControllerGroup: this.energyChunkWanderControllerGroup,
      tandem: tandem.createTandem('rightBurner'),
      phetioDocumentation: 'does not appear in the simulation if the query parameter value burners=1 is provided'
    });

    // @private {Burner[]} - put burners into a list for easy iteration
    this.burners = [this.leftBurner];
    if (this.twoBurners) {
      this.burners.push(this.rightBurner);
    }

    // @public {PhetioGroup.<Block>}
    this.blockGroup = new PhetioGroup((tandem, blockType, initialXPosition) => {
      return new Block(new Vector2(initialXPosition, 0), this.energyChunksVisibleProperty, blockType, this.energyChunkGroup, {
        energyChunkWanderControllerGroup: this.energyChunkWanderControllerGroup,
        tandem: tandem
      });
    }, [BlockType.IRON, 0], {
      tandem: tandem.createTandem('blockGroup'),
      phetioType: PhetioGroup.PhetioGroupIO(Block.BlockIO),
      supportsDynamicState: false,
      phetioDocumentation: `group that contains 0-${EFACConstants.MAX_NUMBER_OF_INTRO_ELEMENTS} blocks`
    });
    blocksToCreate.forEach(blockType => {
      this.blockGroup.createNextElement(blockType, movableElementGroundSpotXPositions.shift());
    });

    // ensure any created beakers are initialized to the right of the burner(s)
    movableElementGroundSpotXPositions = movableElementGroundSpotXPositions.slice(movableElementGroundSpotXPositions.length - EFACConstants.MAX_NUMBER_OF_INTRO_BEAKERS - (EFACConstants.MAX_NUMBER_OF_INTRO_BURNERS - numberOfBurners));

    // @public {PhetioGroup.<BeakerContainer>}
    this.beakerGroup = new PhetioGroup((tandem, beakerType, initialXPosition) => {
      return new BeakerContainer(new Vector2(initialXPosition, 0), BEAKER_WIDTH, BEAKER_HEIGHT, this.blockGroup, this.energyChunksVisibleProperty, this.energyChunkGroup, {
        energyChunkWanderControllerGroup: this.energyChunkWanderControllerGroup,
        beakerType: beakerType,
        majorTickMarkDistance: BEAKER_MAJOR_TICK_MARK_DISTANCE,
        tandem: tandem,
        phetioDynamicElement: true
      });
    }, [BeakerType.WATER, 0], {
      tandem: tandem.createTandem('beakerGroup'),
      phetioType: PhetioGroup.PhetioGroupIO(Beaker.BeakerIO),
      supportsDynamicState: false,
      phetioDocumentation: `group that contains 0-${EFACConstants.MAX_NUMBER_OF_INTRO_BEAKERS} beakers`
    });

    // create any specified beakers
    beakersToCreate.forEach(beakerType => {
      this.beakerGroup.createNextElement(beakerType, movableElementGroundSpotXPositions.shift());
    });

    // @private {Object} - an object that is used to track which thermal containers are in contact with one another in
    // each model step.
    this.inThermalContactInfo = {};
    this.thermalContainers.forEach(thermalContainer => {
      this.inThermalContactInfo[thermalContainer.id] = [];
    });

    // @private {ModelElement} - put all of the model elements on a list for easy iteration
    this.modelElementList = [...this.burners, ...this.thermalContainers];

    // @public (read-only) {StickyTemperatureAndColorSensor[]}
    this.thermometers = [];
    let thermometerIndex = NUMBER_OF_THERMOMETERS + 1;
    _.times(NUMBER_OF_THERMOMETERS, () => {
      const thermometer = new StickyTemperatureAndColorSensor(this, INITIAL_THERMOMETER_POSITION, false, {
        tandem: tandem.createTandem(`thermometer${--thermometerIndex}`) // 1 indexed
      });

      this.thermometers.push(thermometer);

      // Add handling for a special case where the user drops a block in the beaker behind this thermometer. The
      // action is to automatically move the thermometer to a position where it continues to sense the beaker
      // temperature. Not needed if zero blocks are in use. This was requested after interviews.
      if (this.blockGroup.count) {
        thermometer.sensedElementColorProperty.link((newColor, oldColor) => {
          this.beakerGroup.forEach(beaker => {
            const blockWidthIncludingPerspective = this.blockGroup.getElement(0).getProjectedShape().bounds.width;
            const xRange = new Range(beaker.getBounds().centerX - blockWidthIncludingPerspective / 2, beaker.getBounds().centerX + blockWidthIncludingPerspective / 2);
            const checkBlocks = block => {
              // see if one of the blocks is being sensed in the beaker
              return block.color === newColor && block.positionProperty.value.y > beaker.positionProperty.value.y;
            };

            // if the new color matches any of the blocks (which are the only things that can go in a beaker), and the
            // thermometer was previously stuck to the beaker and sensing its fluid, then move it to the side of the beaker
            if (_.some(this.blockGroup.getArray(), checkBlocks) && oldColor === beaker.fluidColor && !thermometer.userControlledProperty.get() && !beaker.userControlledProperty.get() && xRange.contains(thermometer.positionProperty.value.x)) {
              // fake a movement by the user to a point in the beaker where the thermometer is not over a brick
              thermometer.userControlledProperty.set(true); // must toggle userControlled to enable element following
              thermometer.positionProperty.value = new Vector2(beaker.getBounds().maxX - 0.01, beaker.getBounds().minY + beaker.getBounds().height * 0.33);
              thermometer.userControlledProperty.set(false);
            }
          });
        });
      }
    });

    // @private {EnergyBalanceTracker} - This is used to track energy exchanges between all of the various energy
    // containing elements and using that information to transfer energy chunks commensurately.
    this.energyBalanceTracker = new EnergyBalanceTracker();

    // @private {EnergyBalanceRecord[]} - An array used for getting energy balances from the energy balance tracker,
    // pre-allocated and reused in an effort to reduce memory allocations.
    this.reusableBalanceArray = [];

    // @public - used to notify the view that a manual step was called
    this.manualStepEmitter = new Emitter({
      parameters: [{
        valueType: 'number'
      }]
    });
  }

  /**
   * @param {number} heatCoolLevel
   * @returns {string}
   * @private
   */
  static mapHeatCoolLevelToColor(heatCoolLevel) {
    let color;
    if (heatCoolLevel > 0) {
      color = FLAME_ORANGE;
    } else if (heatCoolLevel < 0) {
      color = ICE_BLUE;
    } else {
      color = EFACConstants.FIRST_SCREEN_BACKGROUND_COLOR;
    }
    return color;
  }

  // @private {RectangularThermalMovableModelElement[]} - put all the thermal containers in a list for easy iteration
  get thermalContainers() {
    return [...this.blockGroup.getArray(), ...this.beakerGroup.getArray()];
  }

  /**
   * determines if the first thermal model element is immersed in the second
   * @param {RectangularThermalMovableModelElement} thermalModelElement1
   * @param {RectangularThermalMovableModelElement} thermalModelElement2
   * @returns {boolean}
   * @private
   */
  isImmersedIn(thermalModelElement1, thermalModelElement2) {
    return thermalModelElement1 !== thermalModelElement2 && thermalModelElement1.blockType !== undefined && thermalModelElement2.thermalContactArea.containsBounds(thermalModelElement1.getBounds());
  }

  /**
   * restore the initial conditions of the model
   * @public
   */
  reset() {
    this.energyChunksVisibleProperty.reset();
    this.linkedHeatersProperty.reset();
    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();
    this.air.reset();
    this.burners.forEach(burner => {
      burner.reset();
    });
    this.blockGroup.forEach(block => {
      block.reset();
    });
    this.beakerGroup.forEach(beaker => {
      beaker.reset();
    });
    this.thermometers.forEach(thermometer => {
      thermometer.reset();
    });
    this.energyBalanceTracker.clearAllBalances();
  }

  /**
   * step the sim forward by one fixed nominal frame time
   * @public
   */
  manualStep() {
    this.stepModel(EFACConstants.SIM_TIME_PER_TICK_NORMAL);
    this.manualStepEmitter.emit(EFACConstants.SIM_TIME_PER_TICK_NORMAL); // notify the view
  }

  /**
   * step function for this model, automatically called by joist
   * @param {number} dt - delta time, in seconds
   * @public
   */
  step(dt) {
    // only step the model if not paused
    if (this.isPlayingProperty.get()) {
      const multiplier = this.timeSpeedProperty.get() === TimeSpeed.NORMAL ? 1 : FAST_FORWARD_MULTIPLIER;
      this.stepModel(dt * multiplier);
    }

    // step the thermometers regardless of whether the sim is paused, and fast forward makes no difference
    this.thermometers.forEach(thermometer => {
      thermometer.step(dt);
    });
  }

  /**
   * update the state of the model for a given time amount
   * @param {number} dt - time step, in seconds
   * @private
   */
  stepModel(dt) {
    // Cause any user-movable model elements that are not supported by a surface to fall or, in some cases, jump up
    // towards the nearest supporting surface.
    this.thermalContainers.forEach(movableModelElement => {
      const userControlled = movableModelElement.userControlledProperty.value;
      const unsupported = movableModelElement.supportingSurface === null;
      const raised = movableModelElement.positionProperty.value.y !== 0;
      const atXSpot = _.includes(this.groundSpotXPositions, movableModelElement.positionProperty.value.x);
      if (!userControlled && unsupported && (raised || !atXSpot)) {
        this.fallToSurface(movableModelElement, dt);
      }
    });

    // update the fluid level in the beaker, which could be displaced by one or more of the blocks
    this.beakerGroup.forEach(beaker => {
      beaker.updateFluidDisplacement(this.blockGroup.map(block => block.getBounds()));
    });

    //=====================================================================
    // Energy and Energy Chunk Exchange
    //=====================================================================

    // Note: Ideally, the order in which the exchanges occur shouldn't make any difference, but since we are working
    // with discrete non-infinitesimal time values, it probably does, so any changes to the order in which the energy
    // exchanges occur below should be thoroughly tested.

    // --------- transfer continuous energy (and not energy chunks yet) between elements --------------

    // clear the flags that are used to track whether energy transfers occurred during this step
    this.energyBalanceTracker.clearRecentlyUpdatedFlags();

    // loop through all the movable thermal energy containers and have them exchange energy with one another
    this.thermalContainers.forEach((container1, index) => {
      this.thermalContainers.slice(index + 1, this.thermalContainers.length).forEach(container2 => {
        // transfer energy if there is a thermal differential, keeping track of what was exchanged
        const energyTransferredFrom1to2 = container1.exchangeEnergyWith(container2, dt);
        this.energyBalanceTracker.logEnergyExchange(container1.id, container2.id, energyTransferredFrom1to2);
      });
    });

    // exchange thermal energy between the burners and the other thermal model elements, including air
    this.burners.forEach(burner => {
      let energyTransferredFromBurner = 0;
      if (burner.areAnyOnTop(this.thermalContainers)) {
        this.thermalContainers.forEach(energyContainer => {
          energyTransferredFromBurner = burner.addOrRemoveEnergyToFromObject(energyContainer, dt);
          this.energyBalanceTracker.logEnergyExchange(burner.id, energyContainer.id, energyTransferredFromBurner);
        });
      } else {
        // nothing on a burner, so heat/cool the air
        energyTransferredFromBurner = burner.addOrRemoveEnergyToFromAir(this.air, dt);
        this.energyBalanceTracker.logEnergyExchange(burner.id, this.air.id, energyTransferredFromBurner);
      }
    });

    // clear the "in thermal contact" information
    _.values(this.inThermalContactInfo).forEach(inContactList => {
      inContactList.length = 0;
    });

    // exchange energy between the movable thermal energy containers and the air
    this.thermalContainers.forEach(container1 => {
      // detect elements that are immersed in a beaker and don't allow them to exchange energy directly with the air
      let immersedInBeaker = false;
      this.beakerGroup.forEach(beaker => {
        if (this.isImmersedIn(container1, beaker)) {
          // this model element is immersed in the beaker
          immersedInBeaker = true;
        }
      });

      // exchange energy with the air if not immersed in the beaker
      if (!immersedInBeaker) {
        const energyExchangedWithAir = this.air.exchangeEnergyWith(container1, dt);
        this.energyBalanceTracker.logEnergyExchange(this.air.id, container1.id, energyExchangedWithAir);
      }
    });

    // --------- transfer energy chunks between elements --------------

    // Get a list of all energy balances between pairs of objects whose magnitude exceeds the amount that corresponds
    // to an energy chunk, and that also were recently updated.  The reason that it is important whether or not the
    // balance was recently updated is that it indicates that the entities are in thermal contact, and thus can
    // exchange energy chunks.
    this.reusableBalanceArray.length = 0; // clear the list
    this.energyBalanceTracker.getBalancesOverThreshold(EFACConstants.ENERGY_PER_CHUNK, true, this.reusableBalanceArray);
    this.reusableBalanceArray.forEach(energyBalanceRecord => {
      const fromID = energyBalanceRecord.fromID;
      const toID = energyBalanceRecord.toID;

      // figure out who will supply the energy chunk and who will consume it
      let energyChunkSupplier;
      let energyChunkConsumer;
      if (energyBalanceRecord.energyBalance > 0) {
        energyChunkSupplier = this.getThermalElementByID(fromID);
        energyChunkConsumer = this.getThermalElementByID(toID);
      } else {
        energyChunkSupplier = this.getThermalElementByID(toID);
        energyChunkConsumer = this.getThermalElementByID(fromID);
      }

      // if the transfer is supposed to go to or from a burner, make sure the burner is in the correct state
      if (energyChunkSupplier.id.indexOf('burner') >= 0 && energyChunkSupplier.heatCoolLevelProperty.value < 0 || energyChunkConsumer.id.indexOf('burner') >= 0 && energyChunkConsumer.heatCoolLevelProperty.value > 0) {
        // burner isn't in correct state, bail on this transfer
        return;
      }

      // transfer the energy chunk from the supplier to the consumer
      this.transferEnergyChunk(energyChunkSupplier, energyChunkConsumer, energyBalanceRecord);
    });

    // Now that continuous energy has been exchanged and then energy chunks have been exchanged based on the
    // accumulated energy exchange balances, we now check to see if any thermal energy containers are left with an
    // imbalance between their energy levels versus the number of energy chunks they contain.  If such an imbalance is
    // detected, we search for a good candidate with which to make an exchange and, if one is found, transfer an
    // energy chunk.  If no good candidate is found, no transfer is made.
    this.thermalContainers.forEach(thermalContainer => {
      const energyChunkBalance = thermalContainer.getEnergyChunkBalance();
      if (energyChunkBalance !== 0) {
        // This thermal energy container has an energy chunk imbalance.  Get a list of all thermal model elements with
        // which a recent thermal energy exchange has occurred, because this lets us know who is in thermal contact
        // ans could thus potentially supply or consume an energy chunk.
        const recentlyUpdatedBalances = this.energyBalanceTracker.getBalancesForID(thermalContainer.id, true);

        // set up some variables that will be used in the loops below
        let bestExchangeCandidate = null;
        let closestMatchExchangeRecord = null;
        let currentRecord;
        let otherElementInRecord;

        // Search for other thermal containers that can consume this container's excess or supply this container's
        // needs, as the case may be.
        for (let i = 0; i < recentlyUpdatedBalances.length && bestExchangeCandidate === null; i++) {
          currentRecord = recentlyUpdatedBalances[i];
          otherElementInRecord = this.getThermalElementByID(currentRecord.getOtherID(thermalContainer.id));
          const thisElementTemperature = thermalContainer.getTemperature();
          const otherElementTemperature = otherElementInRecord.getTemperature();

          // See if there is another thermal container that is in the opposite situation from this one, i.e. one that
          // has a deficit of ECs when this one has excess, or vice versa.
          if (this.thermalContainers.indexOf(otherElementInRecord) >= 0) {
            const otherECBalance = otherElementInRecord.getEnergyChunkBalance();
            if (energyChunkBalance > 0 && otherECBalance < 0 && thisElementTemperature > otherElementTemperature || energyChunkBalance < 0 && otherECBalance > 0 && thisElementTemperature < otherElementTemperature) {
              // this is a great candidate for an exchange
              bestExchangeCandidate = otherElementInRecord;
              closestMatchExchangeRecord = currentRecord;
            }
          }
        }
        if (!bestExchangeCandidate) {
          // nothing found yet, see if there is a burner that could take or provide and energy chunk
          for (let i = 0; i < recentlyUpdatedBalances.length && bestExchangeCandidate === null; i++) {
            currentRecord = recentlyUpdatedBalances[i];
            const otherID = currentRecord.getOtherID(thermalContainer.id);
            if (otherID.indexOf('burner') >= 0) {
              // This is a burner, is it in a state where it is able to provide or receive an energy chunk?
              const burner = this.getThermalElementByID(otherID);
              const heatCoolLevel = burner.heatCoolLevelProperty.get();
              if (energyChunkBalance > 0 && heatCoolLevel < 0 || energyChunkBalance < 0 && heatCoolLevel > 0) {
                bestExchangeCandidate = burner;
                closestMatchExchangeRecord = currentRecord;
              }
            }
          }
        }
        if (bestExchangeCandidate) {
          // a good candidate was found, make the transfer
          let energyChunkSupplier;
          let energyChunkConsumer;
          if (energyChunkBalance > 0) {
            energyChunkSupplier = thermalContainer;
            energyChunkConsumer = bestExchangeCandidate;
          } else {
            energyChunkSupplier = bestExchangeCandidate;
            energyChunkConsumer = thermalContainer;
          }
          this.transferEnergyChunk(energyChunkSupplier, energyChunkConsumer, closestMatchExchangeRecord);
        }
      }
    });

    // step model elements to animate energy chunks movement
    this.air.step(dt);
    this.burners.forEach(burner => {
      burner.step(dt);
    });
    this.thermalContainers.forEach(thermalContainer => {
      thermalContainer.step(dt);
    });
  }

  /**
   * exchanges an energy chunk between the provided model elements
   * @param {ModelElement} energyChunkSupplier
   * @param {ModelElement} energyChunkConsumer
   * @param {EnergyBalanceRecord} energyBalanceRecord
   * @private
   */
  transferEnergyChunk(energyChunkSupplier, energyChunkConsumer, energyBalanceRecord) {
    // attempt to extract an energy chunk from the supplier
    let energyChunk;
    if (energyChunkSupplier !== this.air) {
      if (energyChunkConsumer !== this.air) {
        energyChunk = energyChunkSupplier.extractEnergyChunkClosestToBounds(energyChunkConsumer.getBounds());
      } else {
        // when giving an energy chunk to the air, pull one from the top of the supplier
        energyChunk = energyChunkSupplier.extractEnergyChunkClosestToPoint(energyChunkSupplier.getCenterTopPoint());
      }
    } else {
      // when getting an energy chunk from the air, just let is know roughly where it's going
      energyChunk = energyChunkSupplier.requestEnergyChunk(energyChunkConsumer.positionProperty.get());
    }

    // if we got an energy chunk, pass it to the consumer
    if (energyChunk) {
      if (energyChunkConsumer === this.air) {
        // When supplying and energy chunk to the air, constrain the path that the energy chunk will take so that it
        // stays above the container.  The bounds are tweaked a bit to account for the width of the energy chunks in
        // the view.
        const supplierBounds = energyChunkSupplier.getBounds();
        const horizontalWanderConstraint = new Range(supplierBounds.minX + 0.01, supplierBounds.maxX - 0.01);
        if (energyChunk.positionProperty.value.x < horizontalWanderConstraint.min) {
          energyChunk.setPositionXY(horizontalWanderConstraint.min, energyChunk.positionProperty.value.y);
        } else if (energyChunk.positionProperty.value.x > horizontalWanderConstraint.max) {
          energyChunk.setPositionXY(horizontalWanderConstraint.max, energyChunk.positionProperty.value.y);
        }
        energyChunkConsumer.addEnergyChunk(energyChunk, horizontalWanderConstraint);
      } else {
        energyChunkConsumer.addEnergyChunk(energyChunk);
      }

      // adjust the energy balance since a chunk was transferred, but don't cross zero for the energy balance
      let energyExchangeToLog;
      if (energyBalanceRecord.energyBalance > 0) {
        energyExchangeToLog = Math.max(-EFACConstants.ENERGY_PER_CHUNK, -energyBalanceRecord.energyBalance);
      } else {
        energyExchangeToLog = Math.min(EFACConstants.ENERGY_PER_CHUNK, energyBalanceRecord.energyBalance);
      }
      this.energyBalanceTracker.logEnergyExchange(energyChunkSupplier.id, energyChunkConsumer.id, energyExchangeToLog);
    }
  }

  /**
   * make a user-movable model element fall to the nearest supporting surface
   * @param {UserMovableModelElement} modelElement - the falling object
   * @param {number} dt - time step in seconds
   * @private
   */
  fallToSurface(modelElement, dt) {
    let minYPos = 0;
    const acceleration = -9.8; // meters/s/s

    // sort list of ground spots in order, with the closest spot to modelElement first
    const groundSpotXPositionsCopy = [...this.groundSpotXPositions];
    groundSpotXPositionsCopy.sort((a, b) => {
      const distanceA = Math.abs(a - modelElement.positionProperty.value.x);
      const distanceB = Math.abs(b - modelElement.positionProperty.value.x);
      return distanceA - distanceB;
    });
    let destinationXSpot = null;
    let destinationSurface = null;

    // check out each spot
    for (let i = 0; i < groundSpotXPositionsCopy.length && destinationXSpot === null && destinationSurface === null; i++) {
      const modelElementsInSpot = [];

      // get a list of what's currently in the spot being checked
      this.modelElementList.forEach(potentialRestingModelElement => {
        if (potentialRestingModelElement === modelElement) {
          return;
        }

        // This if statement is checking each potentialRestingModelElement to see which ones are already in the spot
        // that modelElement is falling to.
        //
        // The following first condition usually just needs to check if potentialRestingModelElement's center x
        // coordinate matches the current ground spot x coordinate, but instead it considers any
        // potentialRestingModelElement's to be in this spot if its center x coordinate is within half a spot's
        // width of the ground spot x coordinate. this handles the multitouch case where modelElement is falling and
        // a user drags a different model element somewhere underneath it (which is likely not located at a ground
        // x coordinate), because instead of not detecting that user-held model element as occupying this spot
        // (and therefore falling through it and overlapping), it does detect it, and then falls to the model
        // elements surface instead of all the way down to the ground spot.
        //
        // The second condition checks that potentialRestingModelElement is below modelElement because, for example, in
        // the case where a beaker with a block inside is being dropped, we don't want the beaker to think that its
        // block is in the spot below it.
        if (Math.abs(potentialRestingModelElement.positionProperty.value.x - groundSpotXPositionsCopy[i]) <= this.spaceBetweenGroundSpotCenters / 2 && potentialRestingModelElement.positionProperty.value.y <= modelElement.positionProperty.value.y) {
          modelElementsInSpot.push(potentialRestingModelElement);

          // this is an additional search to see if there are any elements stacked on a found element that are
          // *above* the element being dropped, see https://github.com/phetsims/energy-forms-and-changes/issues/221
          let restingModelElement = potentialRestingModelElement;
          while (restingModelElement.topSurface.elementOnSurfaceProperty.value) {
            const stackedRestingModelElement = restingModelElement.topSurface.elementOnSurfaceProperty.value;
            if (stackedRestingModelElement.positionProperty.value.y > modelElement.positionProperty.value.y && modelElementsInSpot.indexOf(stackedRestingModelElement) < 0) {
              modelElementsInSpot.push(stackedRestingModelElement);
            }
            restingModelElement = stackedRestingModelElement;
          }
        }
      });
      if (modelElementsInSpot.length > 0) {
        // flag any beakers that are in the spot because beakers aren't allowed to stack on top of one another
        let beakerFoundInSpot = false;
        for (let j = 0; j < modelElementsInSpot.length && !beakerFoundInSpot; j++) {
          beakerFoundInSpot = beakerFoundInSpot || modelElementsInSpot[j] instanceof Beaker;
        }
        let currentModelElementInStack = modelElement;
        let beakerFoundInStack = currentModelElementInStack instanceof Beaker;

        // iterate through the stack of model elements being held and flag if any beakers are in it
        while (currentModelElementInStack.topSurface.elementOnSurfaceProperty.value && !beakerFoundInStack) {
          beakerFoundInStack = beakerFoundInStack || currentModelElementInStack.topSurface.elementOnSurfaceProperty.value instanceof Beaker;
          currentModelElementInStack = currentModelElementInStack.topSurface.elementOnSurfaceProperty.value;
        }
        if (!(beakerFoundInSpot && beakerFoundInStack)) {
          // find the highest element in the stack
          let highestElement = modelElementsInSpot[0];
          for (let j = 1; j < modelElementsInSpot.length; j++) {
            if (modelElementsInSpot[j].topSurface.positionProperty.value.y > highestElement.topSurface.positionProperty.value.y) {
              highestElement = modelElementsInSpot[j];
            }
          }
          destinationSurface = highestElement.topSurface;
        }
      } else {
        destinationXSpot = groundSpotXPositionsCopy[i];
      }
    }
    if (destinationSurface !== null) {
      // center the model element above its new supporting element
      minYPos = destinationSurface.positionProperty.value.y;
      modelElement.positionProperty.set(new Vector2(destinationSurface.positionProperty.value.x, modelElement.positionProperty.value.y));
    } else {
      modelElement.positionProperty.set(new Vector2(destinationXSpot, modelElement.positionProperty.value.y));
    }

    // calculate a proposed Y position based on gravitational falling
    const velocity = modelElement.verticalVelocityProperty.value + acceleration * dt;
    let proposedYPos = modelElement.positionProperty.value.y + velocity * dt;
    if (proposedYPos < minYPos) {
      // the element has landed on the ground or some other surface
      proposedYPos = minYPos;
      modelElement.verticalVelocityProperty.set(0);
      if (destinationSurface !== null) {
        modelElement.setSupportingSurface(destinationSurface);
        destinationSurface.elementOnSurfaceProperty.set(modelElement);
      }
    } else {
      modelElement.verticalVelocityProperty.set(velocity);
    }
    modelElement.positionProperty.set(new Vector2(modelElement.positionProperty.value.x, proposedYPos));
  }

  /**
   * Updates the temperature and color that would be sensed by a thermometer at the provided position.  This is done
   * as a single operation instead of having separate methods for getting temperature and color because it is more
   * efficient to do it like this.
   * @param {Vector2} position - position to be sensed
   * @param {Property.<number>} sensedTemperatureProperty
   * @param {Property.<Color>} sensedElementColorProperty
   * @param {StringProperty} sensedElementNameProperty
   * @public
   */
  updateTemperatureAndColorAndNameAtPosition(position, sensedTemperatureProperty, sensedElementColorProperty, sensedElementNameProperty) {
    let temperatureAndColorAndNameUpdated = false;

    // Test blocks first. Sort them by zIndex so sensors measure the highest one that the sensor is over
    const blocks = _.sortBy(this.blockGroup.getArrayCopy(), block => block.zIndex);
    for (let i = blocks.length - 1; i >= 0 && !temperatureAndColorAndNameUpdated; i--) {
      const block = blocks[i];
      if (block.getProjectedShape().containsPoint(position)) {
        sensedTemperatureProperty.set(block.temperature);
        sensedElementColorProperty.set(block.color);
        sensedElementNameProperty.set(block.tandem.phetioID);
        temperatureAndColorAndNameUpdated = true;
      }
    }

    // test if this point is in any beaker's fluid
    for (let i = 0; i < this.beakerGroup.count && !temperatureAndColorAndNameUpdated; i++) {
      const beaker = this.beakerGroup.getElement(i);
      if (beaker.thermalContactArea.containsPoint(position)) {
        sensedTemperatureProperty.set(beaker.temperatureProperty.get());
        sensedElementColorProperty.set(beaker.fluidColor);
        sensedElementNameProperty.set(beaker.tandem.phetioID);
        temperatureAndColorAndNameUpdated = true;
      }
    }

    // test if this point is in any beaker's steam. this check happens separately after all beakers' fluid have been
    // checked because in the case of a beaker body and another beaker's steam overlapping, the thermometer should
    // detect the beaker body first
    for (let i = 0; i < this.beakerGroup.count && !temperatureAndColorAndNameUpdated; i++) {
      const beaker = this.beakerGroup.getElement(i);
      if (beaker.getSteamArea().containsPoint(position) && beaker.steamingProportion > 0) {
        sensedTemperatureProperty.set(beaker.getSteamTemperature(position.y - beaker.getSteamArea().minY));
        sensedElementColorProperty.set(beaker.steamColor);
        sensedElementNameProperty.set(beaker.tandem.phetioID);
        temperatureAndColorAndNameUpdated = true;
      }
    }

    // test if the point is a burner
    for (let i = 0; i < this.burners.length && !temperatureAndColorAndNameUpdated; i++) {
      const burner = this.burners[i];
      if (burner.getFlameIceRect().containsPoint(position)) {
        sensedTemperatureProperty.set(burner.getTemperature());
        sensedElementColorProperty.set(EFACIntroModel.mapHeatCoolLevelToColor(burner.heatCoolLevelProperty.get()));
        sensedElementNameProperty.set(burner.tandem.phetioID);
        temperatureAndColorAndNameUpdated = true;
      }
    }
    if (!temperatureAndColorAndNameUpdated) {
      // the position is in nothing else, so set the air temperature and color
      sensedTemperatureProperty.set(this.air.getTemperature());
      sensedElementColorProperty.set(EFACConstants.FIRST_SCREEN_BACKGROUND_COLOR);
      sensedElementNameProperty.reset();
    }
  }

  /**
   * get the thermal model element that has the provided ID
   * @param {string} id
   * @returns {Object} - one of the elements in the model that can provide and absorb energy
   * @private
   */
  getThermalElementByID(id) {
    let element = null;
    if (id === this.air.id) {
      element = this.air;
    } else if (id.indexOf('burner') >= 0) {
      element = _.find(this.burners, burner => burner.id === id);
    } else {
      element = _.find(this.thermalContainers, container => container.id === id);
    }
    assert && assert(element, `no element found for id: ${id}`);
    return element;
  }
}
energyFormsAndChanges.register('EFACIntroModel', EFACIntroModel);
export default EFACIntroModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiRW51bWVyYXRpb25Qcm9wZXJ0eSIsIlJhbmdlIiwiVXRpbHMiLCJWZWN0b3IyIiwiVGltZVNwZWVkIiwiQ29sb3IiLCJQaGV0aW9Hcm91cCIsIkVGQUNDb25zdGFudHMiLCJCZWFrZXIiLCJCZWFrZXJUeXBlIiwiQnVybmVyIiwiRW5lcmd5Q2h1bmtHcm91cCIsIkVuZXJneUNodW5rV2FuZGVyQ29udHJvbGxlckdyb3VwIiwiZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIiwiQWlyIiwiQmVha2VyQ29udGFpbmVyIiwiQmxvY2siLCJCbG9ja1R5cGUiLCJFbmVyZ3lCYWxhbmNlVHJhY2tlciIsIlN0aWNreVRlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3IiLCJOVU1CRVJfT0ZfVEhFUk1PTUVURVJTIiwiQkVBS0VSX1dJRFRIIiwiQkVBS0VSX0hFSUdIVCIsIkJFQUtFUl9NQUpPUl9USUNLX01BUktfRElTVEFOQ0UiLCJGQVNUX0ZPUldBUkRfTVVMVElQTElFUiIsIkxFRlRfRURHRSIsIlJJR0hUX0VER0UiLCJFREdFX1BBRCIsIk5VTUJFUl9PRl9HUk9VTkRfU1BPVFMiLCJNQVhfTlVNQkVSX09GX0lOVFJPX0JVUk5FUlMiLCJNQVhfTlVNQkVSX09GX0lOVFJPX0VMRU1FTlRTIiwiTEVGVF9CVVJORVJfR1JPVU5EX1NQT1RfSU5ERVgiLCJJTklUSUFMX1RIRVJNT01FVEVSX1BPU0lUSU9OIiwiRkxBTUVfT1JBTkdFIiwiSUNFX0JMVUUiLCJFRkFDSW50cm9Nb2RlbCIsImNvbnN0cnVjdG9yIiwiYmxvY2tzVG9DcmVhdGUiLCJiZWFrZXJzVG9DcmVhdGUiLCJudW1iZXJPZkJ1cm5lcnMiLCJ0YW5kZW0iLCJlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwibGlua2VkSGVhdGVyc1Byb3BlcnR5IiwiaXNQbGF5aW5nUHJvcGVydHkiLCJlbmVyZ3lDaHVua0dyb3VwIiwiZW5lcmd5Q2h1bmtXYW5kZXJDb250cm9sbGVyR3JvdXAiLCJ0aW1lU3BlZWRQcm9wZXJ0eSIsIk5PUk1BTCIsImFpciIsInNwYWNlQmV0d2Vlbkdyb3VuZFNwb3RDZW50ZXJzIiwiZ3JvdW5kU3BvdFhQb3NpdGlvbnMiLCJsZWZ0RWRnZVRvQmVha2VyQ2VudGVyUGFkIiwiaSIsInB1c2giLCJyb3VuZFN5bW1ldHJpYyIsInR3b0J1cm5lcnMiLCJpbmRleE9mRmlyc3RFbGVtZW50QWZ0ZXJMYXN0QmVha2VyIiwiYnVybmVyR3JvdW5kU3BvdFhQb3NpdGlvbnMiLCJzbGljZSIsIm1vdmFibGVFbGVtZW50R3JvdW5kU3BvdFhQb3NpdGlvbnMiLCJsZWZ0QnVybmVyIiwicmlnaHRCdXJuZXIiLCJidXJuZXJzIiwiYmxvY2tHcm91cCIsImJsb2NrVHlwZSIsImluaXRpYWxYUG9zaXRpb24iLCJJUk9OIiwicGhldGlvVHlwZSIsIlBoZXRpb0dyb3VwSU8iLCJCbG9ja0lPIiwic3VwcG9ydHNEeW5hbWljU3RhdGUiLCJmb3JFYWNoIiwiY3JlYXRlTmV4dEVsZW1lbnQiLCJzaGlmdCIsImxlbmd0aCIsIk1BWF9OVU1CRVJfT0ZfSU5UUk9fQkVBS0VSUyIsImJlYWtlckdyb3VwIiwiYmVha2VyVHlwZSIsIm1ham9yVGlja01hcmtEaXN0YW5jZSIsInBoZXRpb0R5bmFtaWNFbGVtZW50IiwiV0FURVIiLCJCZWFrZXJJTyIsImluVGhlcm1hbENvbnRhY3RJbmZvIiwidGhlcm1hbENvbnRhaW5lcnMiLCJ0aGVybWFsQ29udGFpbmVyIiwiaWQiLCJtb2RlbEVsZW1lbnRMaXN0IiwidGhlcm1vbWV0ZXJzIiwidGhlcm1vbWV0ZXJJbmRleCIsIl8iLCJ0aW1lcyIsInRoZXJtb21ldGVyIiwiY291bnQiLCJzZW5zZWRFbGVtZW50Q29sb3JQcm9wZXJ0eSIsImxpbmsiLCJuZXdDb2xvciIsIm9sZENvbG9yIiwiYmVha2VyIiwiYmxvY2tXaWR0aEluY2x1ZGluZ1BlcnNwZWN0aXZlIiwiZ2V0RWxlbWVudCIsImdldFByb2plY3RlZFNoYXBlIiwiYm91bmRzIiwid2lkdGgiLCJ4UmFuZ2UiLCJnZXRCb3VuZHMiLCJjZW50ZXJYIiwiY2hlY2tCbG9ja3MiLCJibG9jayIsImNvbG9yIiwicG9zaXRpb25Qcm9wZXJ0eSIsInZhbHVlIiwieSIsInNvbWUiLCJnZXRBcnJheSIsImZsdWlkQ29sb3IiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5IiwiZ2V0IiwiY29udGFpbnMiLCJ4Iiwic2V0IiwibWF4WCIsIm1pblkiLCJoZWlnaHQiLCJlbmVyZ3lCYWxhbmNlVHJhY2tlciIsInJldXNhYmxlQmFsYW5jZUFycmF5IiwibWFudWFsU3RlcEVtaXR0ZXIiLCJwYXJhbWV0ZXJzIiwidmFsdWVUeXBlIiwibWFwSGVhdENvb2xMZXZlbFRvQ29sb3IiLCJoZWF0Q29vbExldmVsIiwiRklSU1RfU0NSRUVOX0JBQ0tHUk9VTkRfQ09MT1IiLCJpc0ltbWVyc2VkSW4iLCJ0aGVybWFsTW9kZWxFbGVtZW50MSIsInRoZXJtYWxNb2RlbEVsZW1lbnQyIiwidW5kZWZpbmVkIiwidGhlcm1hbENvbnRhY3RBcmVhIiwiY29udGFpbnNCb3VuZHMiLCJyZXNldCIsImJ1cm5lciIsImNsZWFyQWxsQmFsYW5jZXMiLCJtYW51YWxTdGVwIiwic3RlcE1vZGVsIiwiU0lNX1RJTUVfUEVSX1RJQ0tfTk9STUFMIiwiZW1pdCIsInN0ZXAiLCJkdCIsIm11bHRpcGxpZXIiLCJtb3ZhYmxlTW9kZWxFbGVtZW50IiwidXNlckNvbnRyb2xsZWQiLCJ1bnN1cHBvcnRlZCIsInN1cHBvcnRpbmdTdXJmYWNlIiwicmFpc2VkIiwiYXRYU3BvdCIsImluY2x1ZGVzIiwiZmFsbFRvU3VyZmFjZSIsInVwZGF0ZUZsdWlkRGlzcGxhY2VtZW50IiwibWFwIiwiY2xlYXJSZWNlbnRseVVwZGF0ZWRGbGFncyIsImNvbnRhaW5lcjEiLCJpbmRleCIsImNvbnRhaW5lcjIiLCJlbmVyZ3lUcmFuc2ZlcnJlZEZyb20xdG8yIiwiZXhjaGFuZ2VFbmVyZ3lXaXRoIiwibG9nRW5lcmd5RXhjaGFuZ2UiLCJlbmVyZ3lUcmFuc2ZlcnJlZEZyb21CdXJuZXIiLCJhcmVBbnlPblRvcCIsImVuZXJneUNvbnRhaW5lciIsImFkZE9yUmVtb3ZlRW5lcmd5VG9Gcm9tT2JqZWN0IiwiYWRkT3JSZW1vdmVFbmVyZ3lUb0Zyb21BaXIiLCJ2YWx1ZXMiLCJpbkNvbnRhY3RMaXN0IiwiaW1tZXJzZWRJbkJlYWtlciIsImVuZXJneUV4Y2hhbmdlZFdpdGhBaXIiLCJnZXRCYWxhbmNlc092ZXJUaHJlc2hvbGQiLCJFTkVSR1lfUEVSX0NIVU5LIiwiZW5lcmd5QmFsYW5jZVJlY29yZCIsImZyb21JRCIsInRvSUQiLCJlbmVyZ3lDaHVua1N1cHBsaWVyIiwiZW5lcmd5Q2h1bmtDb25zdW1lciIsImVuZXJneUJhbGFuY2UiLCJnZXRUaGVybWFsRWxlbWVudEJ5SUQiLCJpbmRleE9mIiwiaGVhdENvb2xMZXZlbFByb3BlcnR5IiwidHJhbnNmZXJFbmVyZ3lDaHVuayIsImVuZXJneUNodW5rQmFsYW5jZSIsImdldEVuZXJneUNodW5rQmFsYW5jZSIsInJlY2VudGx5VXBkYXRlZEJhbGFuY2VzIiwiZ2V0QmFsYW5jZXNGb3JJRCIsImJlc3RFeGNoYW5nZUNhbmRpZGF0ZSIsImNsb3Nlc3RNYXRjaEV4Y2hhbmdlUmVjb3JkIiwiY3VycmVudFJlY29yZCIsIm90aGVyRWxlbWVudEluUmVjb3JkIiwiZ2V0T3RoZXJJRCIsInRoaXNFbGVtZW50VGVtcGVyYXR1cmUiLCJnZXRUZW1wZXJhdHVyZSIsIm90aGVyRWxlbWVudFRlbXBlcmF0dXJlIiwib3RoZXJFQ0JhbGFuY2UiLCJvdGhlcklEIiwiZW5lcmd5Q2h1bmsiLCJleHRyYWN0RW5lcmd5Q2h1bmtDbG9zZXN0VG9Cb3VuZHMiLCJleHRyYWN0RW5lcmd5Q2h1bmtDbG9zZXN0VG9Qb2ludCIsImdldENlbnRlclRvcFBvaW50IiwicmVxdWVzdEVuZXJneUNodW5rIiwic3VwcGxpZXJCb3VuZHMiLCJob3Jpem9udGFsV2FuZGVyQ29uc3RyYWludCIsIm1pblgiLCJtaW4iLCJzZXRQb3NpdGlvblhZIiwibWF4IiwiYWRkRW5lcmd5Q2h1bmsiLCJlbmVyZ3lFeGNoYW5nZVRvTG9nIiwiTWF0aCIsIm1vZGVsRWxlbWVudCIsIm1pbllQb3MiLCJhY2NlbGVyYXRpb24iLCJncm91bmRTcG90WFBvc2l0aW9uc0NvcHkiLCJzb3J0IiwiYSIsImIiLCJkaXN0YW5jZUEiLCJhYnMiLCJkaXN0YW5jZUIiLCJkZXN0aW5hdGlvblhTcG90IiwiZGVzdGluYXRpb25TdXJmYWNlIiwibW9kZWxFbGVtZW50c0luU3BvdCIsInBvdGVudGlhbFJlc3RpbmdNb2RlbEVsZW1lbnQiLCJyZXN0aW5nTW9kZWxFbGVtZW50IiwidG9wU3VyZmFjZSIsImVsZW1lbnRPblN1cmZhY2VQcm9wZXJ0eSIsInN0YWNrZWRSZXN0aW5nTW9kZWxFbGVtZW50IiwiYmVha2VyRm91bmRJblNwb3QiLCJqIiwiY3VycmVudE1vZGVsRWxlbWVudEluU3RhY2siLCJiZWFrZXJGb3VuZEluU3RhY2siLCJoaWdoZXN0RWxlbWVudCIsInZlbG9jaXR5IiwidmVydGljYWxWZWxvY2l0eVByb3BlcnR5IiwicHJvcG9zZWRZUG9zIiwic2V0U3VwcG9ydGluZ1N1cmZhY2UiLCJ1cGRhdGVUZW1wZXJhdHVyZUFuZENvbG9yQW5kTmFtZUF0UG9zaXRpb24iLCJwb3NpdGlvbiIsInNlbnNlZFRlbXBlcmF0dXJlUHJvcGVydHkiLCJzZW5zZWRFbGVtZW50TmFtZVByb3BlcnR5IiwidGVtcGVyYXR1cmVBbmRDb2xvckFuZE5hbWVVcGRhdGVkIiwiYmxvY2tzIiwic29ydEJ5IiwiZ2V0QXJyYXlDb3B5IiwiekluZGV4IiwiY29udGFpbnNQb2ludCIsInRlbXBlcmF0dXJlIiwicGhldGlvSUQiLCJ0ZW1wZXJhdHVyZVByb3BlcnR5IiwiZ2V0U3RlYW1BcmVhIiwic3RlYW1pbmdQcm9wb3J0aW9uIiwiZ2V0U3RlYW1UZW1wZXJhdHVyZSIsInN0ZWFtQ29sb3IiLCJnZXRGbGFtZUljZVJlY3QiLCJlbGVtZW50IiwiZmluZCIsImNvbnRhaW5lciIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRUZBQ0ludHJvTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogbW9kZWwgZm9yIHRoZSAnSW50cm8nIHNjcmVlbiBvZiB0aGUgRW5lcmd5IEZvcm1zIEFuZCBDaGFuZ2VzIHNpbXVsYXRpb25cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGUgKEJlcmVhIENvbGxlZ2UpXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBUaW1lU3BlZWQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1RpbWVTcGVlZC5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBoZXRpb0dyb3VwIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9Hcm91cC5qcyc7XHJcbmltcG9ydCBFRkFDQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9FRkFDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEJlYWtlciBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQmVha2VyLmpzJztcclxuaW1wb3J0IEJlYWtlclR5cGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0JlYWtlclR5cGUuanMnO1xyXG5pbXBvcnQgQnVybmVyIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9CdXJuZXIuanMnO1xyXG5pbXBvcnQgRW5lcmd5Q2h1bmtHcm91cCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRW5lcmd5Q2h1bmtHcm91cC5qcyc7XHJcbmltcG9ydCBFbmVyZ3lDaHVua1dhbmRlckNvbnRyb2xsZXJHcm91cCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRW5lcmd5Q2h1bmtXYW5kZXJDb250cm9sbGVyR3JvdXAuanMnO1xyXG5pbXBvcnQgZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIGZyb20gJy4uLy4uL2VuZXJneUZvcm1zQW5kQ2hhbmdlcy5qcyc7XHJcbmltcG9ydCBBaXIgZnJvbSAnLi9BaXIuanMnO1xyXG5pbXBvcnQgQmVha2VyQ29udGFpbmVyIGZyb20gJy4vQmVha2VyQ29udGFpbmVyLmpzJztcclxuaW1wb3J0IEJsb2NrIGZyb20gJy4vQmxvY2suanMnO1xyXG5pbXBvcnQgQmxvY2tUeXBlIGZyb20gJy4vQmxvY2tUeXBlLmpzJztcclxuaW1wb3J0IEVuZXJneUJhbGFuY2VUcmFja2VyIGZyb20gJy4vRW5lcmd5QmFsYW5jZVRyYWNrZXIuanMnO1xyXG5pbXBvcnQgU3RpY2t5VGVtcGVyYXR1cmVBbmRDb2xvclNlbnNvciBmcm9tICcuL1N0aWNreVRlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3IuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE5VTUJFUl9PRl9USEVSTU9NRVRFUlMgPSA0O1xyXG5jb25zdCBCRUFLRVJfV0lEVEggPSAwLjA4NTsgLy8gaW4gbWV0ZXJzXHJcbmNvbnN0IEJFQUtFUl9IRUlHSFQgPSBCRUFLRVJfV0lEVEggKiAxLjE7XHJcbmNvbnN0IEJFQUtFUl9NQUpPUl9USUNLX01BUktfRElTVEFOQ0UgPSBCRUFLRVJfSEVJR0hUICogMC45NSAvIDM7XHJcbmNvbnN0IEZBU1RfRk9SV0FSRF9NVUxUSVBMSUVSID0gNDsgLy8gaG93IG1hbnkgdGltZXMgZmFzdGVyIHRoZSBpbnRybyBzY3JlZW4gcnVucyB3aGVuIGluIGZhc3QgZm9yd2FyZCBtb2RlXHJcblxyXG4vLyB0aGUgc2ltIG1vZGVsIHggcmFuZ2UgaXMgbGFpZCBvdXQgaW4gbWV0ZXJzIHdpdGggMCBpbiB0aGUgbWlkZGxlLCBzbyB0aGlzIHZhbHVlIGlzIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIHNpbSwgaW4gbWV0ZXJzXHJcbmNvbnN0IExFRlRfRURHRSA9IC0wLjMwO1xyXG5jb25zdCBSSUdIVF9FREdFID0gMC4zMDtcclxuXHJcbi8vIHRoZSBkZXNpcmVkIHNwYWNlIGJldHdlZW4gdGhlIGVkZ2VzIG9mIHRoZSBzaW0gKGxlZnQgZWRnZSBvciByaWdodCBlZGdlKSBhbmQgdGhlIGVkZ2Ugb2YgdGhlIHdpZGVzdCBlbGVtZW50XHJcbi8vIChhIGJlYWtlcikgd2hlbiBpdCdzIHNpdHRpbmcgYXQgb25lIG9mIHRoZSBvdXRlciBzbmFwLXRvIHNwb3RzIG9uIHRoZSBncm91bmQsIGluIG1ldGVyc1xyXG5jb25zdCBFREdFX1BBRCA9IDAuMDE2O1xyXG5cclxuLy8gbnVtYmVyIG9mIHNuYXAtdG8gc3BvdHMgb24gdGhlIGdyb3VuZFxyXG5jb25zdCBOVU1CRVJfT0ZfR1JPVU5EX1NQT1RTID0gRUZBQ0NvbnN0YW50cy5NQVhfTlVNQkVSX09GX0lOVFJPX0JVUk5FUlMgKyBFRkFDQ29uc3RhbnRzLk1BWF9OVU1CRVJfT0ZfSU5UUk9fRUxFTUVOVFM7XHJcblxyXG4vLyBvZiB0aGUgYXZhaWxhYmxlIGdyb3VuZCBzcG90cywgdGhpcyBpcyB0aGUgaW5kZXggYXQgd2hpY2ggdGhlIGJ1cm5lcihzKSBpcy9hcmUgY3JlYXRlZFxyXG5jb25zdCBMRUZUX0JVUk5FUl9HUk9VTkRfU1BPVF9JTkRFWCA9IDI7XHJcblxyXG4vLyBpbml0aWFsIHRoZXJtb21ldGVyIHBvc2l0aW9uLCBpbnRlbmRlZCB0byBiZSBhd2F5IGZyb20gYW55IG1vZGVsIG9iamVjdHMgc28gdGhhdCB0aGV5IGRvbid0IGdldCBzdHVjayB0byBhbnl0aGluZ1xyXG5jb25zdCBJTklUSUFMX1RIRVJNT01FVEVSX1BPU0lUSU9OID0gbmV3IFZlY3RvcjIoIDEwMCwgMTAwICk7XHJcblxyXG4vLyBjb2xvcnNcclxuY29uc3QgRkxBTUVfT1JBTkdFID0gbmV3IENvbG9yKCAnb3JhbmdlJyApO1xyXG5jb25zdCBJQ0VfQkxVRSA9IG5ldyBDb2xvciggJyM4N0NFRkEnICk7XHJcblxyXG5jbGFzcyBFRkFDSW50cm9Nb2RlbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QmxvY2tUeXBlW119IGJsb2Nrc1RvQ3JlYXRlXHJcbiAgICogQHBhcmFtIHtCZWFrZXJUeXBlW119IGJlYWtlcnNUb0NyZWF0ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXJPZkJ1cm5lcnNcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGJsb2Nrc1RvQ3JlYXRlLCBiZWFrZXJzVG9DcmVhdGUsIG51bWJlck9mQnVybmVycywgdGFuZGVtICkge1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0Jvb2xlYW5Qcm9wZXJ0eX0gLSBjb250cm9scyB3aGV0aGVyIHRoZSBlbmVyZ3kgY2h1bmtzIGFyZSB2aXNpYmxlIGluIHRoZSB2aWV3XHJcbiAgICB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3doZXRoZXIgdGhlIGVuZXJneSBjaHVua3MgYXJlIHZpc2libGUnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Qm9vbGVhblByb3BlcnR5fSAtIGNvbnRyb2xzIHdoZXRoZXIgSGVhdGVyQ29vbGVyTm9kZXMgYXJlIGxpbmtlZCB0b2dldGhlclxyXG4gICAgdGhpcy5saW5rZWRIZWF0ZXJzUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsaW5rZWRIZWF0ZXJzUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd3aGV0aGVyIHRoZSBoZWF0ZXJzIGFyZSBsaW5rZWQgdG9nZXRoZXIgb3IgaW5kZXBlbmRlbnQgb2YgZWFjaCBvdGhlcidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtCb29sZWFuUHJvcGVydHl9IC0gaXMgdGhlIHNpbSBydW5uaW5nIG9yIHBhdXNlZD9cclxuICAgIHRoaXMuaXNQbGF5aW5nUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2lzUGxheWluZ1Byb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnd2hldGhlciB0aGUgc2NyZWVuIGlzIHBsYXlpbmcgb3IgcGF1c2VkJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmVuZXJneUNodW5rR3JvdXAgPSBuZXcgRW5lcmd5Q2h1bmtHcm91cCggdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHksIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5Q2h1bmtHcm91cCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmVuZXJneUNodW5rV2FuZGVyQ29udHJvbGxlckdyb3VwID0gbmV3IEVuZXJneUNodW5rV2FuZGVyQ29udHJvbGxlckdyb3VwKCB0aGlzLmVuZXJneUNodW5rR3JvdXAsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5Q2h1bmtXYW5kZXJDb250cm9sbGVyR3JvdXAnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIGZvciBkZWJ1Z2dpbmcsIGNvbnRyb2xzIHBsYXkgc3BlZWQgb2YgdGhlIHNpbXVsYXRpb25cclxuICAgIHRoaXMudGltZVNwZWVkUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25Qcm9wZXJ0eSggVGltZVNwZWVkLk5PUk1BTCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge0Fpcn0gLSBtb2RlbCBvZiB0aGUgYWlyIHRoYXQgc3Vycm91bmRzIHRoZSBvdGhlciBtb2RlbCBlbGVtZW50cywgYW5kIGNhbiBhYnNvcmIgb3IgcHJvdmlkZVxyXG4gICAgLy8gZW5lcmd5XHJcbiAgICB0aGlzLmFpciA9IG5ldyBBaXIoIHRoaXMuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LCB0aGlzLmVuZXJneUNodW5rR3JvdXAsIHRoaXMuZW5lcmd5Q2h1bmtXYW5kZXJDb250cm9sbGVyR3JvdXAsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYWlyJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBjYWxjdWxhdGUgc3BhY2UgaW4gYmV0d2VlbiB0aGUgY2VudGVyIHBvaW50cyBvZiB0aGUgc25hcC10byBzcG90cyBvbiB0aGUgZ3JvdW5kXHJcbiAgICB0aGlzLnNwYWNlQmV0d2Vlbkdyb3VuZFNwb3RDZW50ZXJzID0gKCBSSUdIVF9FREdFIC0gTEVGVF9FREdFIC0gKCBFREdFX1BBRCAqIDIgKSAtIEJFQUtFUl9XSURUSCApIC9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIE5VTUJFUl9PRl9HUk9VTkRfU1BPVFMgLSAxICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcltdfSAtIGxpc3Qgb2YgdmFsaWQgeC1wb3NpdGlvbnMgZm9yIG1vZGVsIGVsZW1lbnRzIHRvIHJlc3QuIHRoaXMgaXMgdXNlZCBmb3IgdGhlIGluaXRpYWxcclxuICAgIC8vIHBvc2l0aW9ucyBvZiBtb2RlbCBlbGVtZW50cywgYnV0IGFsc28gZm9yIGZpbmRpbmcgdmFsaWQgc3BvdHMgZm9yIHRoZSBlbGVtZW50cyB0byBmYWxsIHRvLCBzbyBpdCBzaG91bGQgYmVcclxuICAgIC8vIG1vZGlmaWVkIGFmdGVyIGNyZWF0aW9uLlxyXG4gICAgdGhpcy5ncm91bmRTcG90WFBvc2l0aW9ucyA9IFtdO1xyXG5cclxuICAgIC8vIGRldGVybWluZSB0aGUgcG9zaXRpb25zIG9mIHRoZSBzbmFwLXRvIHNwb3RzLCBhbmQgcm91bmQgdGhlbSB0byBhIGZldyBkZWNpbWFsIHBsYWNlc1xyXG4gICAgY29uc3QgbGVmdEVkZ2VUb0JlYWtlckNlbnRlclBhZCA9IExFRlRfRURHRSArIEVER0VfUEFEICsgKCBCRUFLRVJfV0lEVEggLyAyICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBOVU1CRVJfT0ZfR1JPVU5EX1NQT1RTOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuZ3JvdW5kU3BvdFhQb3NpdGlvbnMucHVzaChcclxuICAgICAgICBVdGlscy5yb3VuZFN5bW1ldHJpYyggKCB0aGlzLnNwYWNlQmV0d2Vlbkdyb3VuZFNwb3RDZW50ZXJzICogaSArIGxlZnRFZGdlVG9CZWFrZXJDZW50ZXJQYWQgKSAqIDEwMDAgKSAvIDEwMDBcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtib29sZWFufVxyXG4gICAgdGhpcy50d29CdXJuZXJzID0gbnVtYmVyT2ZCdXJuZXJzID09PSAyO1xyXG5cclxuICAgIC8vIGFmdGVyIGNyZWF0aW5nIHRoZSBidXJuZXJzLCB0aGUgcmVzdCBvZiB0aGUgZWxlbWVudHMgYXJlIGNyZWF0ZWQgc3RhcnRpbmcgZnJvbSB0aGlzIGluZGV4XHJcbiAgICBjb25zdCBpbmRleE9mRmlyc3RFbGVtZW50QWZ0ZXJMYXN0QmVha2VyID0gTEVGVF9CVVJORVJfR1JPVU5EX1NQT1RfSU5ERVggKyBudW1iZXJPZkJ1cm5lcnM7XHJcblxyXG4gICAgLy8gb25seSB1c2VkIGZvciBpbml0aWFsIHBvc2l0aW9ucyBvZiBtb2RlbCBlbGVtZW50cy4gZGV0ZXJtaW5lIHdoaWNoIHNwb3RzIGFyZSBvbmx5IGZvciBidXJuZXJzLCB0aGVuIHB1bGwgdGhvc2VcclxuICAgIC8vIG91dCBvZiB0aGUgYXZhaWxhYmxlIGluZGljZXMgZm9yIG1vdmFibGUgZWxlbWVudHNcclxuICAgIGNvbnN0IGJ1cm5lckdyb3VuZFNwb3RYUG9zaXRpb25zID1cclxuICAgICAgdGhpcy5ncm91bmRTcG90WFBvc2l0aW9ucy5zbGljZSggTEVGVF9CVVJORVJfR1JPVU5EX1NQT1RfSU5ERVgsIGluZGV4T2ZGaXJzdEVsZW1lbnRBZnRlckxhc3RCZWFrZXIgKTtcclxuICAgIGxldCBtb3ZhYmxlRWxlbWVudEdyb3VuZFNwb3RYUG9zaXRpb25zID0gW1xyXG4gICAgICAuLi50aGlzLmdyb3VuZFNwb3RYUG9zaXRpb25zLnNsaWNlKCAwLCBMRUZUX0JVUk5FUl9HUk9VTkRfU1BPVF9JTkRFWCApLFxyXG4gICAgICAuLi50aGlzLmdyb3VuZFNwb3RYUG9zaXRpb25zLnNsaWNlKCBpbmRleE9mRmlyc3RFbGVtZW50QWZ0ZXJMYXN0QmVha2VyIClcclxuICAgIF07XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7QnVybmVyfVxyXG4gICAgdGhpcy5sZWZ0QnVybmVyID0gbmV3IEJ1cm5lcihcclxuICAgICAgbmV3IFZlY3RvcjIoIGJ1cm5lckdyb3VuZFNwb3RYUG9zaXRpb25zWyAwIF0sIDAgKSxcclxuICAgICAgdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtHcm91cCxcclxuICAgICAge1xyXG4gICAgICAgIGVuZXJneUNodW5rV2FuZGVyQ29udHJvbGxlckdyb3VwOiB0aGlzLmVuZXJneUNodW5rV2FuZGVyQ29udHJvbGxlckdyb3VwLFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xlZnRCdXJuZXInICksXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2Fsd2F5cyBhcHBlYXJzIGluIHRoZSBzaW11bGF0aW9uLCBidXQgbWF5IGJlIHRoZSBvbmx5IGJ1cm5lcidcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtCdXJuZXJ9XHJcbiAgICB0aGlzLnJpZ2h0QnVybmVyID0gbmV3IEJ1cm5lcihcclxuICAgICAgbmV3IFZlY3RvcjIoIGJ1cm5lckdyb3VuZFNwb3RYUG9zaXRpb25zWyAxIF0gfHwgMCwgMCApLFxyXG4gICAgICB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5lbmVyZ3lDaHVua0dyb3VwLFxyXG4gICAgICB7XHJcbiAgICAgICAgZW5lcmd5Q2h1bmtXYW5kZXJDb250cm9sbGVyR3JvdXA6IHRoaXMuZW5lcmd5Q2h1bmtXYW5kZXJDb250cm9sbGVyR3JvdXAsXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmlnaHRCdXJuZXInICksXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2RvZXMgbm90IGFwcGVhciBpbiB0aGUgc2ltdWxhdGlvbiBpZiB0aGUgcXVlcnkgcGFyYW1ldGVyIHZhbHVlIGJ1cm5lcnM9MSBpcyBwcm92aWRlZCdcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QnVybmVyW119IC0gcHV0IGJ1cm5lcnMgaW50byBhIGxpc3QgZm9yIGVhc3kgaXRlcmF0aW9uXHJcbiAgICB0aGlzLmJ1cm5lcnMgPSBbIHRoaXMubGVmdEJ1cm5lciBdO1xyXG4gICAgaWYgKCB0aGlzLnR3b0J1cm5lcnMgKSB7XHJcbiAgICAgIHRoaXMuYnVybmVycy5wdXNoKCB0aGlzLnJpZ2h0QnVybmVyICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UGhldGlvR3JvdXAuPEJsb2NrPn1cclxuICAgIHRoaXMuYmxvY2tHcm91cCA9IG5ldyBQaGV0aW9Hcm91cChcclxuICAgICAgKCB0YW5kZW0sIGJsb2NrVHlwZSwgaW5pdGlhbFhQb3NpdGlvbiApID0+IHtcclxuICAgICAgICByZXR1cm4gbmV3IEJsb2NrKFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIGluaXRpYWxYUG9zaXRpb24sIDAgKSxcclxuICAgICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgICAgYmxvY2tUeXBlLFxyXG4gICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0dyb3VwLCB7XHJcbiAgICAgICAgICAgIGVuZXJneUNodW5rV2FuZGVyQ29udHJvbGxlckdyb3VwOiB0aGlzLmVuZXJneUNodW5rV2FuZGVyQ29udHJvbGxlckdyb3VwLFxyXG4gICAgICAgICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICB9LFxyXG4gICAgICBbIEJsb2NrVHlwZS5JUk9OLCAwIF0sXHJcbiAgICAgIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdibG9ja0dyb3VwJyApLFxyXG4gICAgICAgIHBoZXRpb1R5cGU6IFBoZXRpb0dyb3VwLlBoZXRpb0dyb3VwSU8oIEJsb2NrLkJsb2NrSU8gKSxcclxuICAgICAgICBzdXBwb3J0c0R5bmFtaWNTdGF0ZTogZmFsc2UsXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogYGdyb3VwIHRoYXQgY29udGFpbnMgMC0ke0VGQUNDb25zdGFudHMuTUFYX05VTUJFUl9PRl9JTlRST19FTEVNRU5UU30gYmxvY2tzYFxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIGJsb2Nrc1RvQ3JlYXRlLmZvckVhY2goIGJsb2NrVHlwZSA9PiB7XHJcbiAgICAgIHRoaXMuYmxvY2tHcm91cC5jcmVhdGVOZXh0RWxlbWVudCggYmxvY2tUeXBlLCBtb3ZhYmxlRWxlbWVudEdyb3VuZFNwb3RYUG9zaXRpb25zLnNoaWZ0KCkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBlbnN1cmUgYW55IGNyZWF0ZWQgYmVha2VycyBhcmUgaW5pdGlhbGl6ZWQgdG8gdGhlIHJpZ2h0IG9mIHRoZSBidXJuZXIocylcclxuICAgIG1vdmFibGVFbGVtZW50R3JvdW5kU3BvdFhQb3NpdGlvbnMgPVxyXG4gICAgICBtb3ZhYmxlRWxlbWVudEdyb3VuZFNwb3RYUG9zaXRpb25zLnNsaWNlKCBtb3ZhYmxlRWxlbWVudEdyb3VuZFNwb3RYUG9zaXRpb25zLmxlbmd0aCAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVGQUNDb25zdGFudHMuTUFYX05VTUJFUl9PRl9JTlRST19CRUFLRVJTIC1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBFRkFDQ29uc3RhbnRzLk1BWF9OVU1CRVJfT0ZfSU5UUk9fQlVSTkVSUyAtIG51bWJlck9mQnVybmVycyApICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UGhldGlvR3JvdXAuPEJlYWtlckNvbnRhaW5lcj59XHJcbiAgICB0aGlzLmJlYWtlckdyb3VwID0gbmV3IFBoZXRpb0dyb3VwKFxyXG4gICAgICAoIHRhbmRlbSwgYmVha2VyVHlwZSwgaW5pdGlhbFhQb3NpdGlvbiApID0+IHtcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWtlckNvbnRhaW5lcihcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCBpbml0aWFsWFBvc2l0aW9uLCAwICksXHJcbiAgICAgICAgICBCRUFLRVJfV0lEVEgsXHJcbiAgICAgICAgICBCRUFLRVJfSEVJR0hULFxyXG4gICAgICAgICAgdGhpcy5ibG9ja0dyb3VwLFxyXG4gICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgICAgICB0aGlzLmVuZXJneUNodW5rR3JvdXAsIHtcclxuICAgICAgICAgICAgZW5lcmd5Q2h1bmtXYW5kZXJDb250cm9sbGVyR3JvdXA6IHRoaXMuZW5lcmd5Q2h1bmtXYW5kZXJDb250cm9sbGVyR3JvdXAsXHJcbiAgICAgICAgICAgIGJlYWtlclR5cGU6IGJlYWtlclR5cGUsXHJcbiAgICAgICAgICAgIG1ham9yVGlja01hcmtEaXN0YW5jZTogQkVBS0VSX01BSk9SX1RJQ0tfTUFSS19ESVNUQU5DRSxcclxuICAgICAgICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgICAgICAgIHBoZXRpb0R5bmFtaWNFbGVtZW50OiB0cnVlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuICAgICAgfSxcclxuICAgICAgWyBCZWFrZXJUeXBlLldBVEVSLCAwIF0sXHJcbiAgICAgIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdiZWFrZXJHcm91cCcgKSxcclxuICAgICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBCZWFrZXIuQmVha2VySU8gKSxcclxuICAgICAgICBzdXBwb3J0c0R5bmFtaWNTdGF0ZTogZmFsc2UsXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogYGdyb3VwIHRoYXQgY29udGFpbnMgMC0ke0VGQUNDb25zdGFudHMuTUFYX05VTUJFUl9PRl9JTlRST19CRUFLRVJTfSBiZWFrZXJzYFxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbnkgc3BlY2lmaWVkIGJlYWtlcnNcclxuICAgIGJlYWtlcnNUb0NyZWF0ZS5mb3JFYWNoKCBiZWFrZXJUeXBlID0+IHtcclxuICAgICAgdGhpcy5iZWFrZXJHcm91cC5jcmVhdGVOZXh0RWxlbWVudCggYmVha2VyVHlwZSwgbW92YWJsZUVsZW1lbnRHcm91bmRTcG90WFBvc2l0aW9ucy5zaGlmdCgpICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge09iamVjdH0gLSBhbiBvYmplY3QgdGhhdCBpcyB1c2VkIHRvIHRyYWNrIHdoaWNoIHRoZXJtYWwgY29udGFpbmVycyBhcmUgaW4gY29udGFjdCB3aXRoIG9uZSBhbm90aGVyIGluXHJcbiAgICAvLyBlYWNoIG1vZGVsIHN0ZXAuXHJcbiAgICB0aGlzLmluVGhlcm1hbENvbnRhY3RJbmZvID0ge307XHJcbiAgICB0aGlzLnRoZXJtYWxDb250YWluZXJzLmZvckVhY2goIHRoZXJtYWxDb250YWluZXIgPT4ge1xyXG4gICAgICB0aGlzLmluVGhlcm1hbENvbnRhY3RJbmZvWyB0aGVybWFsQ29udGFpbmVyLmlkIF0gPSBbXTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7TW9kZWxFbGVtZW50fSAtIHB1dCBhbGwgb2YgdGhlIG1vZGVsIGVsZW1lbnRzIG9uIGEgbGlzdCBmb3IgZWFzeSBpdGVyYXRpb25cclxuICAgIHRoaXMubW9kZWxFbGVtZW50TGlzdCA9IFsgLi4udGhpcy5idXJuZXJzLCAuLi50aGlzLnRoZXJtYWxDb250YWluZXJzIF07XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7U3RpY2t5VGVtcGVyYXR1cmVBbmRDb2xvclNlbnNvcltdfVxyXG4gICAgdGhpcy50aGVybW9tZXRlcnMgPSBbXTtcclxuICAgIGxldCB0aGVybW9tZXRlckluZGV4ID0gTlVNQkVSX09GX1RIRVJNT01FVEVSUyArIDE7XHJcbiAgICBfLnRpbWVzKCBOVU1CRVJfT0ZfVEhFUk1PTUVURVJTLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRoZXJtb21ldGVyID0gbmV3IFN0aWNreVRlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3IoXHJcbiAgICAgICAgdGhpcyxcclxuICAgICAgICBJTklUSUFMX1RIRVJNT01FVEVSX1BPU0lUSU9OLFxyXG4gICAgICAgIGZhbHNlLCB7XHJcbiAgICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oIGB0aGVybW9tZXRlciR7LS10aGVybW9tZXRlckluZGV4fWAgKSAvLyAxIGluZGV4ZWRcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMudGhlcm1vbWV0ZXJzLnB1c2goIHRoZXJtb21ldGVyICk7XHJcblxyXG4gICAgICAvLyBBZGQgaGFuZGxpbmcgZm9yIGEgc3BlY2lhbCBjYXNlIHdoZXJlIHRoZSB1c2VyIGRyb3BzIGEgYmxvY2sgaW4gdGhlIGJlYWtlciBiZWhpbmQgdGhpcyB0aGVybW9tZXRlci4gVGhlXHJcbiAgICAgIC8vIGFjdGlvbiBpcyB0byBhdXRvbWF0aWNhbGx5IG1vdmUgdGhlIHRoZXJtb21ldGVyIHRvIGEgcG9zaXRpb24gd2hlcmUgaXQgY29udGludWVzIHRvIHNlbnNlIHRoZSBiZWFrZXJcclxuICAgICAgLy8gdGVtcGVyYXR1cmUuIE5vdCBuZWVkZWQgaWYgemVybyBibG9ja3MgYXJlIGluIHVzZS4gVGhpcyB3YXMgcmVxdWVzdGVkIGFmdGVyIGludGVydmlld3MuXHJcbiAgICAgIGlmICggdGhpcy5ibG9ja0dyb3VwLmNvdW50ICkge1xyXG4gICAgICAgIHRoZXJtb21ldGVyLnNlbnNlZEVsZW1lbnRDb2xvclByb3BlcnR5LmxpbmsoICggbmV3Q29sb3IsIG9sZENvbG9yICkgPT4ge1xyXG5cclxuICAgICAgICAgIHRoaXMuYmVha2VyR3JvdXAuZm9yRWFjaCggYmVha2VyID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYmxvY2tXaWR0aEluY2x1ZGluZ1BlcnNwZWN0aXZlID0gdGhpcy5ibG9ja0dyb3VwLmdldEVsZW1lbnQoIDAgKS5nZXRQcm9qZWN0ZWRTaGFwZSgpLmJvdW5kcy53aWR0aDtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHhSYW5nZSA9IG5ldyBSYW5nZShcclxuICAgICAgICAgICAgICBiZWFrZXIuZ2V0Qm91bmRzKCkuY2VudGVyWCAtIGJsb2NrV2lkdGhJbmNsdWRpbmdQZXJzcGVjdGl2ZSAvIDIsXHJcbiAgICAgICAgICAgICAgYmVha2VyLmdldEJvdW5kcygpLmNlbnRlclggKyBibG9ja1dpZHRoSW5jbHVkaW5nUGVyc3BlY3RpdmUgLyAyXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBjaGVja0Jsb2NrcyA9IGJsb2NrID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gc2VlIGlmIG9uZSBvZiB0aGUgYmxvY2tzIGlzIGJlaW5nIHNlbnNlZCBpbiB0aGUgYmVha2VyXHJcbiAgICAgICAgICAgICAgcmV0dXJuIGJsb2NrLmNvbG9yID09PSBuZXdDb2xvciAmJiBibG9jay5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgPiBiZWFrZXIucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55O1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgdGhlIG5ldyBjb2xvciBtYXRjaGVzIGFueSBvZiB0aGUgYmxvY2tzICh3aGljaCBhcmUgdGhlIG9ubHkgdGhpbmdzIHRoYXQgY2FuIGdvIGluIGEgYmVha2VyKSwgYW5kIHRoZVxyXG4gICAgICAgICAgICAvLyB0aGVybW9tZXRlciB3YXMgcHJldmlvdXNseSBzdHVjayB0byB0aGUgYmVha2VyIGFuZCBzZW5zaW5nIGl0cyBmbHVpZCwgdGhlbiBtb3ZlIGl0IHRvIHRoZSBzaWRlIG9mIHRoZSBiZWFrZXJcclxuICAgICAgICAgICAgaWYgKCBfLnNvbWUoIHRoaXMuYmxvY2tHcm91cC5nZXRBcnJheSgpLCBjaGVja0Jsb2NrcyApICYmXHJcbiAgICAgICAgICAgICAgICAgb2xkQ29sb3IgPT09IGJlYWtlci5mbHVpZENvbG9yICYmXHJcbiAgICAgICAgICAgICAgICAgIXRoZXJtb21ldGVyLnVzZXJDb250cm9sbGVkUHJvcGVydHkuZ2V0KCkgJiZcclxuICAgICAgICAgICAgICAgICAhYmVha2VyLnVzZXJDb250cm9sbGVkUHJvcGVydHkuZ2V0KCkgJiZcclxuICAgICAgICAgICAgICAgICB4UmFuZ2UuY29udGFpbnMoIHRoZXJtb21ldGVyLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCApICkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBmYWtlIGEgbW92ZW1lbnQgYnkgdGhlIHVzZXIgdG8gYSBwb2ludCBpbiB0aGUgYmVha2VyIHdoZXJlIHRoZSB0aGVybW9tZXRlciBpcyBub3Qgb3ZlciBhIGJyaWNrXHJcbiAgICAgICAgICAgICAgdGhlcm1vbWV0ZXIudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5zZXQoIHRydWUgKTsgLy8gbXVzdCB0b2dnbGUgdXNlckNvbnRyb2xsZWQgdG8gZW5hYmxlIGVsZW1lbnQgZm9sbG93aW5nXHJcbiAgICAgICAgICAgICAgdGhlcm1vbWV0ZXIucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgICAgICAgICAgYmVha2VyLmdldEJvdW5kcygpLm1heFggLSAwLjAxLFxyXG4gICAgICAgICAgICAgICAgYmVha2VyLmdldEJvdW5kcygpLm1pblkgKyBiZWFrZXIuZ2V0Qm91bmRzKCkuaGVpZ2h0ICogMC4zM1xyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgdGhlcm1vbWV0ZXIudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7RW5lcmd5QmFsYW5jZVRyYWNrZXJ9IC0gVGhpcyBpcyB1c2VkIHRvIHRyYWNrIGVuZXJneSBleGNoYW5nZXMgYmV0d2VlbiBhbGwgb2YgdGhlIHZhcmlvdXMgZW5lcmd5XHJcbiAgICAvLyBjb250YWluaW5nIGVsZW1lbnRzIGFuZCB1c2luZyB0aGF0IGluZm9ybWF0aW9uIHRvIHRyYW5zZmVyIGVuZXJneSBjaHVua3MgY29tbWVuc3VyYXRlbHkuXHJcbiAgICB0aGlzLmVuZXJneUJhbGFuY2VUcmFja2VyID0gbmV3IEVuZXJneUJhbGFuY2VUcmFja2VyKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0VuZXJneUJhbGFuY2VSZWNvcmRbXX0gLSBBbiBhcnJheSB1c2VkIGZvciBnZXR0aW5nIGVuZXJneSBiYWxhbmNlcyBmcm9tIHRoZSBlbmVyZ3kgYmFsYW5jZSB0cmFja2VyLFxyXG4gICAgLy8gcHJlLWFsbG9jYXRlZCBhbmQgcmV1c2VkIGluIGFuIGVmZm9ydCB0byByZWR1Y2UgbWVtb3J5IGFsbG9jYXRpb25zLlxyXG4gICAgdGhpcy5yZXVzYWJsZUJhbGFuY2VBcnJheSA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSB1c2VkIHRvIG5vdGlmeSB0aGUgdmlldyB0aGF0IGEgbWFudWFsIHN0ZXAgd2FzIGNhbGxlZFxyXG4gICAgdGhpcy5tYW51YWxTdGVwRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7IHBhcmFtZXRlcnM6IFsgeyB2YWx1ZVR5cGU6ICdudW1iZXInIH0gXSB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVhdENvb2xMZXZlbFxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBzdGF0aWMgbWFwSGVhdENvb2xMZXZlbFRvQ29sb3IoIGhlYXRDb29sTGV2ZWwgKSB7XHJcbiAgICBsZXQgY29sb3I7XHJcbiAgICBpZiAoIGhlYXRDb29sTGV2ZWwgPiAwICkge1xyXG4gICAgICBjb2xvciA9IEZMQU1FX09SQU5HRTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBoZWF0Q29vbExldmVsIDwgMCApIHtcclxuICAgICAgY29sb3IgPSBJQ0VfQkxVRTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBjb2xvciA9IEVGQUNDb25zdGFudHMuRklSU1RfU0NSRUVOX0JBQ0tHUk9VTkRfQ09MT1I7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY29sb3I7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZSB7UmVjdGFuZ3VsYXJUaGVybWFsTW92YWJsZU1vZGVsRWxlbWVudFtdfSAtIHB1dCBhbGwgdGhlIHRoZXJtYWwgY29udGFpbmVycyBpbiBhIGxpc3QgZm9yIGVhc3kgaXRlcmF0aW9uXHJcbiAgZ2V0IHRoZXJtYWxDb250YWluZXJzKCkge1xyXG4gICAgcmV0dXJuIFsgLi4udGhpcy5ibG9ja0dyb3VwLmdldEFycmF5KCksIC4uLnRoaXMuYmVha2VyR3JvdXAuZ2V0QXJyYXkoKSBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZGV0ZXJtaW5lcyBpZiB0aGUgZmlyc3QgdGhlcm1hbCBtb2RlbCBlbGVtZW50IGlzIGltbWVyc2VkIGluIHRoZSBzZWNvbmRcclxuICAgKiBAcGFyYW0ge1JlY3Rhbmd1bGFyVGhlcm1hbE1vdmFibGVNb2RlbEVsZW1lbnR9IHRoZXJtYWxNb2RlbEVsZW1lbnQxXHJcbiAgICogQHBhcmFtIHtSZWN0YW5ndWxhclRoZXJtYWxNb3ZhYmxlTW9kZWxFbGVtZW50fSB0aGVybWFsTW9kZWxFbGVtZW50MlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaXNJbW1lcnNlZEluKCB0aGVybWFsTW9kZWxFbGVtZW50MSwgdGhlcm1hbE1vZGVsRWxlbWVudDIgKSB7XHJcbiAgICByZXR1cm4gdGhlcm1hbE1vZGVsRWxlbWVudDEgIT09IHRoZXJtYWxNb2RlbEVsZW1lbnQyICYmXHJcbiAgICAgICAgICAgdGhlcm1hbE1vZGVsRWxlbWVudDEuYmxvY2tUeXBlICE9PSB1bmRlZmluZWQgJiZcclxuICAgICAgICAgICB0aGVybWFsTW9kZWxFbGVtZW50Mi50aGVybWFsQ29udGFjdEFyZWEuY29udGFpbnNCb3VuZHMoIHRoZXJtYWxNb2RlbEVsZW1lbnQxLmdldEJvdW5kcygpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiByZXN0b3JlIHRoZSBpbml0aWFsIGNvbmRpdGlvbnMgb2YgdGhlIG1vZGVsXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubGlua2VkSGVhdGVyc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmlzUGxheWluZ1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRpbWVTcGVlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmFpci5yZXNldCgpO1xyXG4gICAgdGhpcy5idXJuZXJzLmZvckVhY2goIGJ1cm5lciA9PiB7XHJcbiAgICAgIGJ1cm5lci5yZXNldCgpO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5ibG9ja0dyb3VwLmZvckVhY2goIGJsb2NrID0+IHtcclxuICAgICAgYmxvY2sucmVzZXQoKTtcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYmVha2VyR3JvdXAuZm9yRWFjaCggYmVha2VyID0+IHtcclxuICAgICAgYmVha2VyLnJlc2V0KCk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnRoZXJtb21ldGVycy5mb3JFYWNoKCB0aGVybW9tZXRlciA9PiB7XHJcbiAgICAgIHRoZXJtb21ldGVyLnJlc2V0KCk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmVuZXJneUJhbGFuY2VUcmFja2VyLmNsZWFyQWxsQmFsYW5jZXMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHN0ZXAgdGhlIHNpbSBmb3J3YXJkIGJ5IG9uZSBmaXhlZCBub21pbmFsIGZyYW1lIHRpbWVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbWFudWFsU3RlcCgpIHtcclxuICAgIHRoaXMuc3RlcE1vZGVsKCBFRkFDQ29uc3RhbnRzLlNJTV9USU1FX1BFUl9USUNLX05PUk1BTCApO1xyXG4gICAgdGhpcy5tYW51YWxTdGVwRW1pdHRlci5lbWl0KCBFRkFDQ29uc3RhbnRzLlNJTV9USU1FX1BFUl9USUNLX05PUk1BTCApOyAvLyBub3RpZnkgdGhlIHZpZXdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHN0ZXAgZnVuY3Rpb24gZm9yIHRoaXMgbW9kZWwsIGF1dG9tYXRpY2FsbHkgY2FsbGVkIGJ5IGpvaXN0XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gZGVsdGEgdGltZSwgaW4gc2Vjb25kc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuXHJcbiAgICAvLyBvbmx5IHN0ZXAgdGhlIG1vZGVsIGlmIG5vdCBwYXVzZWRcclxuICAgIGlmICggdGhpcy5pc1BsYXlpbmdQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgY29uc3QgbXVsdGlwbGllciA9IHRoaXMudGltZVNwZWVkUHJvcGVydHkuZ2V0KCkgPT09IFRpbWVTcGVlZC5OT1JNQUwgPyAxIDogRkFTVF9GT1JXQVJEX01VTFRJUExJRVI7XHJcbiAgICAgIHRoaXMuc3RlcE1vZGVsKCBkdCAqIG11bHRpcGxpZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzdGVwIHRoZSB0aGVybW9tZXRlcnMgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSBzaW0gaXMgcGF1c2VkLCBhbmQgZmFzdCBmb3J3YXJkIG1ha2VzIG5vIGRpZmZlcmVuY2VcclxuICAgIHRoaXMudGhlcm1vbWV0ZXJzLmZvckVhY2goIHRoZXJtb21ldGVyID0+IHtcclxuICAgICAgdGhlcm1vbWV0ZXIuc3RlcCggZHQgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHVwZGF0ZSB0aGUgc3RhdGUgb2YgdGhlIG1vZGVsIGZvciBhIGdpdmVuIHRpbWUgYW1vdW50XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBzdGVwTW9kZWwoIGR0ICkge1xyXG5cclxuICAgIC8vIENhdXNlIGFueSB1c2VyLW1vdmFibGUgbW9kZWwgZWxlbWVudHMgdGhhdCBhcmUgbm90IHN1cHBvcnRlZCBieSBhIHN1cmZhY2UgdG8gZmFsbCBvciwgaW4gc29tZSBjYXNlcywganVtcCB1cFxyXG4gICAgLy8gdG93YXJkcyB0aGUgbmVhcmVzdCBzdXBwb3J0aW5nIHN1cmZhY2UuXHJcbiAgICB0aGlzLnRoZXJtYWxDb250YWluZXJzLmZvckVhY2goIG1vdmFibGVNb2RlbEVsZW1lbnQgPT4ge1xyXG4gICAgICBjb25zdCB1c2VyQ29udHJvbGxlZCA9IG1vdmFibGVNb2RlbEVsZW1lbnQudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgY29uc3QgdW5zdXBwb3J0ZWQgPSBtb3ZhYmxlTW9kZWxFbGVtZW50LnN1cHBvcnRpbmdTdXJmYWNlID09PSBudWxsO1xyXG4gICAgICBjb25zdCByYWlzZWQgPSBtb3ZhYmxlTW9kZWxFbGVtZW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUueSAhPT0gMDtcclxuICAgICAgY29uc3QgYXRYU3BvdCA9IF8uaW5jbHVkZXMoIHRoaXMuZ3JvdW5kU3BvdFhQb3NpdGlvbnMsIG1vdmFibGVNb2RlbEVsZW1lbnQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54ICk7XHJcbiAgICAgIGlmICggIXVzZXJDb250cm9sbGVkICYmIHVuc3VwcG9ydGVkICYmICggcmFpc2VkIHx8ICFhdFhTcG90ICkgKSB7XHJcbiAgICAgICAgdGhpcy5mYWxsVG9TdXJmYWNlKCBtb3ZhYmxlTW9kZWxFbGVtZW50LCBkdCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBmbHVpZCBsZXZlbCBpbiB0aGUgYmVha2VyLCB3aGljaCBjb3VsZCBiZSBkaXNwbGFjZWQgYnkgb25lIG9yIG1vcmUgb2YgdGhlIGJsb2Nrc1xyXG4gICAgdGhpcy5iZWFrZXJHcm91cC5mb3JFYWNoKCBiZWFrZXIgPT4ge1xyXG4gICAgICBiZWFrZXIudXBkYXRlRmx1aWREaXNwbGFjZW1lbnQoIHRoaXMuYmxvY2tHcm91cC5tYXAoIGJsb2NrID0+IGJsb2NrLmdldEJvdW5kcygpICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgLy8gRW5lcmd5IGFuZCBFbmVyZ3kgQ2h1bmsgRXhjaGFuZ2VcclxuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICAgLy8gTm90ZTogSWRlYWxseSwgdGhlIG9yZGVyIGluIHdoaWNoIHRoZSBleGNoYW5nZXMgb2NjdXIgc2hvdWxkbid0IG1ha2UgYW55IGRpZmZlcmVuY2UsIGJ1dCBzaW5jZSB3ZSBhcmUgd29ya2luZ1xyXG4gICAgLy8gd2l0aCBkaXNjcmV0ZSBub24taW5maW5pdGVzaW1hbCB0aW1lIHZhbHVlcywgaXQgcHJvYmFibHkgZG9lcywgc28gYW55IGNoYW5nZXMgdG8gdGhlIG9yZGVyIGluIHdoaWNoIHRoZSBlbmVyZ3lcclxuICAgIC8vIGV4Y2hhbmdlcyBvY2N1ciBiZWxvdyBzaG91bGQgYmUgdGhvcm91Z2hseSB0ZXN0ZWQuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tIHRyYW5zZmVyIGNvbnRpbnVvdXMgZW5lcmd5IChhbmQgbm90IGVuZXJneSBjaHVua3MgeWV0KSBiZXR3ZWVuIGVsZW1lbnRzIC0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gY2xlYXIgdGhlIGZsYWdzIHRoYXQgYXJlIHVzZWQgdG8gdHJhY2sgd2hldGhlciBlbmVyZ3kgdHJhbnNmZXJzIG9jY3VycmVkIGR1cmluZyB0aGlzIHN0ZXBcclxuICAgIHRoaXMuZW5lcmd5QmFsYW5jZVRyYWNrZXIuY2xlYXJSZWNlbnRseVVwZGF0ZWRGbGFncygpO1xyXG5cclxuICAgIC8vIGxvb3AgdGhyb3VnaCBhbGwgdGhlIG1vdmFibGUgdGhlcm1hbCBlbmVyZ3kgY29udGFpbmVycyBhbmQgaGF2ZSB0aGVtIGV4Y2hhbmdlIGVuZXJneSB3aXRoIG9uZSBhbm90aGVyXHJcbiAgICB0aGlzLnRoZXJtYWxDb250YWluZXJzLmZvckVhY2goICggY29udGFpbmVyMSwgaW5kZXggKSA9PiB7XHJcbiAgICAgIHRoaXMudGhlcm1hbENvbnRhaW5lcnMuc2xpY2UoIGluZGV4ICsgMSwgdGhpcy50aGVybWFsQ29udGFpbmVycy5sZW5ndGggKS5mb3JFYWNoKCBjb250YWluZXIyID0+IHtcclxuXHJcbiAgICAgICAgLy8gdHJhbnNmZXIgZW5lcmd5IGlmIHRoZXJlIGlzIGEgdGhlcm1hbCBkaWZmZXJlbnRpYWwsIGtlZXBpbmcgdHJhY2sgb2Ygd2hhdCB3YXMgZXhjaGFuZ2VkXHJcbiAgICAgICAgY29uc3QgZW5lcmd5VHJhbnNmZXJyZWRGcm9tMXRvMiA9IGNvbnRhaW5lcjEuZXhjaGFuZ2VFbmVyZ3lXaXRoKCBjb250YWluZXIyLCBkdCApO1xyXG4gICAgICAgIHRoaXMuZW5lcmd5QmFsYW5jZVRyYWNrZXIubG9nRW5lcmd5RXhjaGFuZ2UoIGNvbnRhaW5lcjEuaWQsIGNvbnRhaW5lcjIuaWQsIGVuZXJneVRyYW5zZmVycmVkRnJvbTF0bzIgKTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGV4Y2hhbmdlIHRoZXJtYWwgZW5lcmd5IGJldHdlZW4gdGhlIGJ1cm5lcnMgYW5kIHRoZSBvdGhlciB0aGVybWFsIG1vZGVsIGVsZW1lbnRzLCBpbmNsdWRpbmcgYWlyXHJcbiAgICB0aGlzLmJ1cm5lcnMuZm9yRWFjaCggYnVybmVyID0+IHtcclxuICAgICAgbGV0IGVuZXJneVRyYW5zZmVycmVkRnJvbUJ1cm5lciA9IDA7XHJcbiAgICAgIGlmICggYnVybmVyLmFyZUFueU9uVG9wKCB0aGlzLnRoZXJtYWxDb250YWluZXJzICkgKSB7XHJcbiAgICAgICAgdGhpcy50aGVybWFsQ29udGFpbmVycy5mb3JFYWNoKCBlbmVyZ3lDb250YWluZXIgPT4ge1xyXG4gICAgICAgICAgZW5lcmd5VHJhbnNmZXJyZWRGcm9tQnVybmVyID0gYnVybmVyLmFkZE9yUmVtb3ZlRW5lcmd5VG9Gcm9tT2JqZWN0KCBlbmVyZ3lDb250YWluZXIsIGR0ICk7XHJcbiAgICAgICAgICB0aGlzLmVuZXJneUJhbGFuY2VUcmFja2VyLmxvZ0VuZXJneUV4Y2hhbmdlKCBidXJuZXIuaWQsIGVuZXJneUNvbnRhaW5lci5pZCwgZW5lcmd5VHJhbnNmZXJyZWRGcm9tQnVybmVyICk7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBub3RoaW5nIG9uIGEgYnVybmVyLCBzbyBoZWF0L2Nvb2wgdGhlIGFpclxyXG4gICAgICAgIGVuZXJneVRyYW5zZmVycmVkRnJvbUJ1cm5lciA9IGJ1cm5lci5hZGRPclJlbW92ZUVuZXJneVRvRnJvbUFpciggdGhpcy5haXIsIGR0ICk7XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lCYWxhbmNlVHJhY2tlci5sb2dFbmVyZ3lFeGNoYW5nZSggYnVybmVyLmlkLCB0aGlzLmFpci5pZCwgZW5lcmd5VHJhbnNmZXJyZWRGcm9tQnVybmVyICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjbGVhciB0aGUgXCJpbiB0aGVybWFsIGNvbnRhY3RcIiBpbmZvcm1hdGlvblxyXG4gICAgXy52YWx1ZXMoIHRoaXMuaW5UaGVybWFsQ29udGFjdEluZm8gKS5mb3JFYWNoKCBpbkNvbnRhY3RMaXN0ID0+IHtcclxuICAgICAgaW5Db250YWN0TGlzdC5sZW5ndGggPSAwO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGV4Y2hhbmdlIGVuZXJneSBiZXR3ZWVuIHRoZSBtb3ZhYmxlIHRoZXJtYWwgZW5lcmd5IGNvbnRhaW5lcnMgYW5kIHRoZSBhaXJcclxuICAgIHRoaXMudGhlcm1hbENvbnRhaW5lcnMuZm9yRWFjaCggY29udGFpbmVyMSA9PiB7XHJcblxyXG4gICAgICAvLyBkZXRlY3QgZWxlbWVudHMgdGhhdCBhcmUgaW1tZXJzZWQgaW4gYSBiZWFrZXIgYW5kIGRvbid0IGFsbG93IHRoZW0gdG8gZXhjaGFuZ2UgZW5lcmd5IGRpcmVjdGx5IHdpdGggdGhlIGFpclxyXG4gICAgICBsZXQgaW1tZXJzZWRJbkJlYWtlciA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmJlYWtlckdyb3VwLmZvckVhY2goIGJlYWtlciA9PiB7XHJcbiAgICAgICAgaWYgKCB0aGlzLmlzSW1tZXJzZWRJbiggY29udGFpbmVyMSwgYmVha2VyICkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gdGhpcyBtb2RlbCBlbGVtZW50IGlzIGltbWVyc2VkIGluIHRoZSBiZWFrZXJcclxuICAgICAgICAgIGltbWVyc2VkSW5CZWFrZXIgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gZXhjaGFuZ2UgZW5lcmd5IHdpdGggdGhlIGFpciBpZiBub3QgaW1tZXJzZWQgaW4gdGhlIGJlYWtlclxyXG4gICAgICBpZiAoICFpbW1lcnNlZEluQmVha2VyICkge1xyXG4gICAgICAgIGNvbnN0IGVuZXJneUV4Y2hhbmdlZFdpdGhBaXIgPSB0aGlzLmFpci5leGNoYW5nZUVuZXJneVdpdGgoIGNvbnRhaW5lcjEsIGR0ICk7XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lCYWxhbmNlVHJhY2tlci5sb2dFbmVyZ3lFeGNoYW5nZSggdGhpcy5haXIuaWQsIGNvbnRhaW5lcjEuaWQsIGVuZXJneUV4Y2hhbmdlZFdpdGhBaXIgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIC0tLS0tLS0tLSB0cmFuc2ZlciBlbmVyZ3kgY2h1bmtzIGJldHdlZW4gZWxlbWVudHMgLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBHZXQgYSBsaXN0IG9mIGFsbCBlbmVyZ3kgYmFsYW5jZXMgYmV0d2VlbiBwYWlycyBvZiBvYmplY3RzIHdob3NlIG1hZ25pdHVkZSBleGNlZWRzIHRoZSBhbW91bnQgdGhhdCBjb3JyZXNwb25kc1xyXG4gICAgLy8gdG8gYW4gZW5lcmd5IGNodW5rLCBhbmQgdGhhdCBhbHNvIHdlcmUgcmVjZW50bHkgdXBkYXRlZC4gIFRoZSByZWFzb24gdGhhdCBpdCBpcyBpbXBvcnRhbnQgd2hldGhlciBvciBub3QgdGhlXHJcbiAgICAvLyBiYWxhbmNlIHdhcyByZWNlbnRseSB1cGRhdGVkIGlzIHRoYXQgaXQgaW5kaWNhdGVzIHRoYXQgdGhlIGVudGl0aWVzIGFyZSBpbiB0aGVybWFsIGNvbnRhY3QsIGFuZCB0aHVzIGNhblxyXG4gICAgLy8gZXhjaGFuZ2UgZW5lcmd5IGNodW5rcy5cclxuICAgIHRoaXMucmV1c2FibGVCYWxhbmNlQXJyYXkubGVuZ3RoID0gMDsgLy8gY2xlYXIgdGhlIGxpc3RcclxuICAgIHRoaXMuZW5lcmd5QmFsYW5jZVRyYWNrZXIuZ2V0QmFsYW5jZXNPdmVyVGhyZXNob2xkKFxyXG4gICAgICBFRkFDQ29uc3RhbnRzLkVORVJHWV9QRVJfQ0hVTkssXHJcbiAgICAgIHRydWUsXHJcbiAgICAgIHRoaXMucmV1c2FibGVCYWxhbmNlQXJyYXlcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5yZXVzYWJsZUJhbGFuY2VBcnJheS5mb3JFYWNoKCBlbmVyZ3lCYWxhbmNlUmVjb3JkID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IGZyb21JRCA9IGVuZXJneUJhbGFuY2VSZWNvcmQuZnJvbUlEO1xyXG4gICAgICBjb25zdCB0b0lEID0gZW5lcmd5QmFsYW5jZVJlY29yZC50b0lEO1xyXG5cclxuICAgICAgLy8gZmlndXJlIG91dCB3aG8gd2lsbCBzdXBwbHkgdGhlIGVuZXJneSBjaHVuayBhbmQgd2hvIHdpbGwgY29uc3VtZSBpdFxyXG4gICAgICBsZXQgZW5lcmd5Q2h1bmtTdXBwbGllcjtcclxuICAgICAgbGV0IGVuZXJneUNodW5rQ29uc3VtZXI7XHJcbiAgICAgIGlmICggZW5lcmd5QmFsYW5jZVJlY29yZC5lbmVyZ3lCYWxhbmNlID4gMCApIHtcclxuICAgICAgICBlbmVyZ3lDaHVua1N1cHBsaWVyID0gdGhpcy5nZXRUaGVybWFsRWxlbWVudEJ5SUQoIGZyb21JRCApO1xyXG4gICAgICAgIGVuZXJneUNodW5rQ29uc3VtZXIgPSB0aGlzLmdldFRoZXJtYWxFbGVtZW50QnlJRCggdG9JRCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGVuZXJneUNodW5rU3VwcGxpZXIgPSB0aGlzLmdldFRoZXJtYWxFbGVtZW50QnlJRCggdG9JRCApO1xyXG4gICAgICAgIGVuZXJneUNodW5rQ29uc3VtZXIgPSB0aGlzLmdldFRoZXJtYWxFbGVtZW50QnlJRCggZnJvbUlEICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGlmIHRoZSB0cmFuc2ZlciBpcyBzdXBwb3NlZCB0byBnbyB0byBvciBmcm9tIGEgYnVybmVyLCBtYWtlIHN1cmUgdGhlIGJ1cm5lciBpcyBpbiB0aGUgY29ycmVjdCBzdGF0ZVxyXG4gICAgICBpZiAoIGVuZXJneUNodW5rU3VwcGxpZXIuaWQuaW5kZXhPZiggJ2J1cm5lcicgKSA+PSAwICYmIGVuZXJneUNodW5rU3VwcGxpZXIuaGVhdENvb2xMZXZlbFByb3BlcnR5LnZhbHVlIDwgMCB8fFxyXG4gICAgICAgICAgIGVuZXJneUNodW5rQ29uc3VtZXIuaWQuaW5kZXhPZiggJ2J1cm5lcicgKSA+PSAwICYmIGVuZXJneUNodW5rQ29uc3VtZXIuaGVhdENvb2xMZXZlbFByb3BlcnR5LnZhbHVlID4gMCApIHtcclxuXHJcbiAgICAgICAgLy8gYnVybmVyIGlzbid0IGluIGNvcnJlY3Qgc3RhdGUsIGJhaWwgb24gdGhpcyB0cmFuc2ZlclxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdHJhbnNmZXIgdGhlIGVuZXJneSBjaHVuayBmcm9tIHRoZSBzdXBwbGllciB0byB0aGUgY29uc3VtZXJcclxuICAgICAgdGhpcy50cmFuc2ZlckVuZXJneUNodW5rKCBlbmVyZ3lDaHVua1N1cHBsaWVyLCBlbmVyZ3lDaHVua0NvbnN1bWVyLCBlbmVyZ3lCYWxhbmNlUmVjb3JkICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gTm93IHRoYXQgY29udGludW91cyBlbmVyZ3kgaGFzIGJlZW4gZXhjaGFuZ2VkIGFuZCB0aGVuIGVuZXJneSBjaHVua3MgaGF2ZSBiZWVuIGV4Y2hhbmdlZCBiYXNlZCBvbiB0aGVcclxuICAgIC8vIGFjY3VtdWxhdGVkIGVuZXJneSBleGNoYW5nZSBiYWxhbmNlcywgd2Ugbm93IGNoZWNrIHRvIHNlZSBpZiBhbnkgdGhlcm1hbCBlbmVyZ3kgY29udGFpbmVycyBhcmUgbGVmdCB3aXRoIGFuXHJcbiAgICAvLyBpbWJhbGFuY2UgYmV0d2VlbiB0aGVpciBlbmVyZ3kgbGV2ZWxzIHZlcnN1cyB0aGUgbnVtYmVyIG9mIGVuZXJneSBjaHVua3MgdGhleSBjb250YWluLiAgSWYgc3VjaCBhbiBpbWJhbGFuY2UgaXNcclxuICAgIC8vIGRldGVjdGVkLCB3ZSBzZWFyY2ggZm9yIGEgZ29vZCBjYW5kaWRhdGUgd2l0aCB3aGljaCB0byBtYWtlIGFuIGV4Y2hhbmdlIGFuZCwgaWYgb25lIGlzIGZvdW5kLCB0cmFuc2ZlciBhblxyXG4gICAgLy8gZW5lcmd5IGNodW5rLiAgSWYgbm8gZ29vZCBjYW5kaWRhdGUgaXMgZm91bmQsIG5vIHRyYW5zZmVyIGlzIG1hZGUuXHJcbiAgICB0aGlzLnRoZXJtYWxDb250YWluZXJzLmZvckVhY2goIHRoZXJtYWxDb250YWluZXIgPT4ge1xyXG5cclxuICAgICAgY29uc3QgZW5lcmd5Q2h1bmtCYWxhbmNlID0gdGhlcm1hbENvbnRhaW5lci5nZXRFbmVyZ3lDaHVua0JhbGFuY2UoKTtcclxuICAgICAgaWYgKCBlbmVyZ3lDaHVua0JhbGFuY2UgIT09IDAgKSB7XHJcblxyXG4gICAgICAgIC8vIFRoaXMgdGhlcm1hbCBlbmVyZ3kgY29udGFpbmVyIGhhcyBhbiBlbmVyZ3kgY2h1bmsgaW1iYWxhbmNlLiAgR2V0IGEgbGlzdCBvZiBhbGwgdGhlcm1hbCBtb2RlbCBlbGVtZW50cyB3aXRoXHJcbiAgICAgICAgLy8gd2hpY2ggYSByZWNlbnQgdGhlcm1hbCBlbmVyZ3kgZXhjaGFuZ2UgaGFzIG9jY3VycmVkLCBiZWNhdXNlIHRoaXMgbGV0cyB1cyBrbm93IHdobyBpcyBpbiB0aGVybWFsIGNvbnRhY3RcclxuICAgICAgICAvLyBhbnMgY291bGQgdGh1cyBwb3RlbnRpYWxseSBzdXBwbHkgb3IgY29uc3VtZSBhbiBlbmVyZ3kgY2h1bmsuXHJcbiAgICAgICAgY29uc3QgcmVjZW50bHlVcGRhdGVkQmFsYW5jZXMgPSB0aGlzLmVuZXJneUJhbGFuY2VUcmFja2VyLmdldEJhbGFuY2VzRm9ySUQoIHRoZXJtYWxDb250YWluZXIuaWQsIHRydWUgKTtcclxuXHJcbiAgICAgICAgLy8gc2V0IHVwIHNvbWUgdmFyaWFibGVzIHRoYXQgd2lsbCBiZSB1c2VkIGluIHRoZSBsb29wcyBiZWxvd1xyXG4gICAgICAgIGxldCBiZXN0RXhjaGFuZ2VDYW5kaWRhdGUgPSBudWxsO1xyXG4gICAgICAgIGxldCBjbG9zZXN0TWF0Y2hFeGNoYW5nZVJlY29yZCA9IG51bGw7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRSZWNvcmQ7XHJcbiAgICAgICAgbGV0IG90aGVyRWxlbWVudEluUmVjb3JkO1xyXG5cclxuICAgICAgICAvLyBTZWFyY2ggZm9yIG90aGVyIHRoZXJtYWwgY29udGFpbmVycyB0aGF0IGNhbiBjb25zdW1lIHRoaXMgY29udGFpbmVyJ3MgZXhjZXNzIG9yIHN1cHBseSB0aGlzIGNvbnRhaW5lcidzXHJcbiAgICAgICAgLy8gbmVlZHMsIGFzIHRoZSBjYXNlIG1heSBiZS5cclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCByZWNlbnRseVVwZGF0ZWRCYWxhbmNlcy5sZW5ndGggJiYgYmVzdEV4Y2hhbmdlQ2FuZGlkYXRlID09PSBudWxsOyBpKysgKSB7XHJcbiAgICAgICAgICBjdXJyZW50UmVjb3JkID0gcmVjZW50bHlVcGRhdGVkQmFsYW5jZXNbIGkgXTtcclxuICAgICAgICAgIG90aGVyRWxlbWVudEluUmVjb3JkID0gdGhpcy5nZXRUaGVybWFsRWxlbWVudEJ5SUQoIGN1cnJlbnRSZWNvcmQuZ2V0T3RoZXJJRCggdGhlcm1hbENvbnRhaW5lci5pZCApICk7XHJcbiAgICAgICAgICBjb25zdCB0aGlzRWxlbWVudFRlbXBlcmF0dXJlID0gdGhlcm1hbENvbnRhaW5lci5nZXRUZW1wZXJhdHVyZSgpO1xyXG4gICAgICAgICAgY29uc3Qgb3RoZXJFbGVtZW50VGVtcGVyYXR1cmUgPSBvdGhlckVsZW1lbnRJblJlY29yZC5nZXRUZW1wZXJhdHVyZSgpO1xyXG5cclxuICAgICAgICAgIC8vIFNlZSBpZiB0aGVyZSBpcyBhbm90aGVyIHRoZXJtYWwgY29udGFpbmVyIHRoYXQgaXMgaW4gdGhlIG9wcG9zaXRlIHNpdHVhdGlvbiBmcm9tIHRoaXMgb25lLCBpLmUuIG9uZSB0aGF0XHJcbiAgICAgICAgICAvLyBoYXMgYSBkZWZpY2l0IG9mIEVDcyB3aGVuIHRoaXMgb25lIGhhcyBleGNlc3MsIG9yIHZpY2UgdmVyc2EuXHJcbiAgICAgICAgICBpZiAoIHRoaXMudGhlcm1hbENvbnRhaW5lcnMuaW5kZXhPZiggb3RoZXJFbGVtZW50SW5SZWNvcmQgKSA+PSAwICkge1xyXG4gICAgICAgICAgICBjb25zdCBvdGhlckVDQmFsYW5jZSA9IG90aGVyRWxlbWVudEluUmVjb3JkLmdldEVuZXJneUNodW5rQmFsYW5jZSgpO1xyXG4gICAgICAgICAgICBpZiAoIGVuZXJneUNodW5rQmFsYW5jZSA+IDAgJiYgb3RoZXJFQ0JhbGFuY2UgPCAwICYmIHRoaXNFbGVtZW50VGVtcGVyYXR1cmUgPiBvdGhlckVsZW1lbnRUZW1wZXJhdHVyZSB8fFxyXG4gICAgICAgICAgICAgICAgIGVuZXJneUNodW5rQmFsYW5jZSA8IDAgJiYgb3RoZXJFQ0JhbGFuY2UgPiAwICYmIHRoaXNFbGVtZW50VGVtcGVyYXR1cmUgPCBvdGhlckVsZW1lbnRUZW1wZXJhdHVyZSApIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhIGdyZWF0IGNhbmRpZGF0ZSBmb3IgYW4gZXhjaGFuZ2VcclxuICAgICAgICAgICAgICBiZXN0RXhjaGFuZ2VDYW5kaWRhdGUgPSBvdGhlckVsZW1lbnRJblJlY29yZDtcclxuICAgICAgICAgICAgICBjbG9zZXN0TWF0Y2hFeGNoYW5nZVJlY29yZCA9IGN1cnJlbnRSZWNvcmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICggIWJlc3RFeGNoYW5nZUNhbmRpZGF0ZSApIHtcclxuXHJcbiAgICAgICAgICAvLyBub3RoaW5nIGZvdW5kIHlldCwgc2VlIGlmIHRoZXJlIGlzIGEgYnVybmVyIHRoYXQgY291bGQgdGFrZSBvciBwcm92aWRlIGFuZCBlbmVyZ3kgY2h1bmtcclxuICAgICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHJlY2VudGx5VXBkYXRlZEJhbGFuY2VzLmxlbmd0aCAmJiBiZXN0RXhjaGFuZ2VDYW5kaWRhdGUgPT09IG51bGw7IGkrKyApIHtcclxuICAgICAgICAgICAgY3VycmVudFJlY29yZCA9IHJlY2VudGx5VXBkYXRlZEJhbGFuY2VzWyBpIF07XHJcbiAgICAgICAgICAgIGNvbnN0IG90aGVySUQgPSBjdXJyZW50UmVjb3JkLmdldE90aGVySUQoIHRoZXJtYWxDb250YWluZXIuaWQgKTtcclxuICAgICAgICAgICAgaWYgKCBvdGhlcklELmluZGV4T2YoICdidXJuZXInICkgPj0gMCApIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhIGJ1cm5lciwgaXMgaXQgaW4gYSBzdGF0ZSB3aGVyZSBpdCBpcyBhYmxlIHRvIHByb3ZpZGUgb3IgcmVjZWl2ZSBhbiBlbmVyZ3kgY2h1bms/XHJcbiAgICAgICAgICAgICAgY29uc3QgYnVybmVyID0gdGhpcy5nZXRUaGVybWFsRWxlbWVudEJ5SUQoIG90aGVySUQgKTtcclxuICAgICAgICAgICAgICBjb25zdCBoZWF0Q29vbExldmVsID0gYnVybmVyLmhlYXRDb29sTGV2ZWxQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICAgICAgICBpZiAoIGVuZXJneUNodW5rQmFsYW5jZSA+IDAgJiYgaGVhdENvb2xMZXZlbCA8IDAgfHwgZW5lcmd5Q2h1bmtCYWxhbmNlIDwgMCAmJiBoZWF0Q29vbExldmVsID4gMCApIHtcclxuICAgICAgICAgICAgICAgIGJlc3RFeGNoYW5nZUNhbmRpZGF0ZSA9IGJ1cm5lcjtcclxuICAgICAgICAgICAgICAgIGNsb3Nlc3RNYXRjaEV4Y2hhbmdlUmVjb3JkID0gY3VycmVudFJlY29yZDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICggYmVzdEV4Y2hhbmdlQ2FuZGlkYXRlICkge1xyXG5cclxuICAgICAgICAgIC8vIGEgZ29vZCBjYW5kaWRhdGUgd2FzIGZvdW5kLCBtYWtlIHRoZSB0cmFuc2ZlclxyXG4gICAgICAgICAgbGV0IGVuZXJneUNodW5rU3VwcGxpZXI7XHJcbiAgICAgICAgICBsZXQgZW5lcmd5Q2h1bmtDb25zdW1lcjtcclxuICAgICAgICAgIGlmICggZW5lcmd5Q2h1bmtCYWxhbmNlID4gMCApIHtcclxuICAgICAgICAgICAgZW5lcmd5Q2h1bmtTdXBwbGllciA9IHRoZXJtYWxDb250YWluZXI7XHJcbiAgICAgICAgICAgIGVuZXJneUNodW5rQ29uc3VtZXIgPSBiZXN0RXhjaGFuZ2VDYW5kaWRhdGU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZW5lcmd5Q2h1bmtTdXBwbGllciA9IGJlc3RFeGNoYW5nZUNhbmRpZGF0ZTtcclxuICAgICAgICAgICAgZW5lcmd5Q2h1bmtDb25zdW1lciA9IHRoZXJtYWxDb250YWluZXI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLnRyYW5zZmVyRW5lcmd5Q2h1bmsoIGVuZXJneUNodW5rU3VwcGxpZXIsIGVuZXJneUNodW5rQ29uc3VtZXIsIGNsb3Nlc3RNYXRjaEV4Y2hhbmdlUmVjb3JkICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gc3RlcCBtb2RlbCBlbGVtZW50cyB0byBhbmltYXRlIGVuZXJneSBjaHVua3MgbW92ZW1lbnRcclxuICAgIHRoaXMuYWlyLnN0ZXAoIGR0ICk7XHJcbiAgICB0aGlzLmJ1cm5lcnMuZm9yRWFjaCggYnVybmVyID0+IHtcclxuICAgICAgYnVybmVyLnN0ZXAoIGR0ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy50aGVybWFsQ29udGFpbmVycy5mb3JFYWNoKCB0aGVybWFsQ29udGFpbmVyID0+IHtcclxuICAgICAgdGhlcm1hbENvbnRhaW5lci5zdGVwKCBkdCApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZXhjaGFuZ2VzIGFuIGVuZXJneSBjaHVuayBiZXR3ZWVuIHRoZSBwcm92aWRlZCBtb2RlbCBlbGVtZW50c1xyXG4gICAqIEBwYXJhbSB7TW9kZWxFbGVtZW50fSBlbmVyZ3lDaHVua1N1cHBsaWVyXHJcbiAgICogQHBhcmFtIHtNb2RlbEVsZW1lbnR9IGVuZXJneUNodW5rQ29uc3VtZXJcclxuICAgKiBAcGFyYW0ge0VuZXJneUJhbGFuY2VSZWNvcmR9IGVuZXJneUJhbGFuY2VSZWNvcmRcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHRyYW5zZmVyRW5lcmd5Q2h1bmsoIGVuZXJneUNodW5rU3VwcGxpZXIsIGVuZXJneUNodW5rQ29uc3VtZXIsIGVuZXJneUJhbGFuY2VSZWNvcmQgKSB7XHJcblxyXG4gICAgLy8gYXR0ZW1wdCB0byBleHRyYWN0IGFuIGVuZXJneSBjaHVuayBmcm9tIHRoZSBzdXBwbGllclxyXG4gICAgbGV0IGVuZXJneUNodW5rO1xyXG4gICAgaWYgKCBlbmVyZ3lDaHVua1N1cHBsaWVyICE9PSB0aGlzLmFpciApIHtcclxuXHJcbiAgICAgIGlmICggZW5lcmd5Q2h1bmtDb25zdW1lciAhPT0gdGhpcy5haXIgKSB7XHJcbiAgICAgICAgZW5lcmd5Q2h1bmsgPSBlbmVyZ3lDaHVua1N1cHBsaWVyLmV4dHJhY3RFbmVyZ3lDaHVua0Nsb3Nlc3RUb0JvdW5kcyhcclxuICAgICAgICAgIGVuZXJneUNodW5rQ29uc3VtZXIuZ2V0Qm91bmRzKClcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyB3aGVuIGdpdmluZyBhbiBlbmVyZ3kgY2h1bmsgdG8gdGhlIGFpciwgcHVsbCBvbmUgZnJvbSB0aGUgdG9wIG9mIHRoZSBzdXBwbGllclxyXG4gICAgICAgIGVuZXJneUNodW5rID0gZW5lcmd5Q2h1bmtTdXBwbGllci5leHRyYWN0RW5lcmd5Q2h1bmtDbG9zZXN0VG9Qb2ludChcclxuICAgICAgICAgIGVuZXJneUNodW5rU3VwcGxpZXIuZ2V0Q2VudGVyVG9wUG9pbnQoKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gd2hlbiBnZXR0aW5nIGFuIGVuZXJneSBjaHVuayBmcm9tIHRoZSBhaXIsIGp1c3QgbGV0IGlzIGtub3cgcm91Z2hseSB3aGVyZSBpdCdzIGdvaW5nXHJcbiAgICAgIGVuZXJneUNodW5rID0gZW5lcmd5Q2h1bmtTdXBwbGllci5yZXF1ZXN0RW5lcmd5Q2h1bmsoIGVuZXJneUNodW5rQ29uc3VtZXIucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIHdlIGdvdCBhbiBlbmVyZ3kgY2h1bmssIHBhc3MgaXQgdG8gdGhlIGNvbnN1bWVyXHJcbiAgICBpZiAoIGVuZXJneUNodW5rICkge1xyXG5cclxuICAgICAgaWYgKCBlbmVyZ3lDaHVua0NvbnN1bWVyID09PSB0aGlzLmFpciApIHtcclxuXHJcbiAgICAgICAgLy8gV2hlbiBzdXBwbHlpbmcgYW5kIGVuZXJneSBjaHVuayB0byB0aGUgYWlyLCBjb25zdHJhaW4gdGhlIHBhdGggdGhhdCB0aGUgZW5lcmd5IGNodW5rIHdpbGwgdGFrZSBzbyB0aGF0IGl0XHJcbiAgICAgICAgLy8gc3RheXMgYWJvdmUgdGhlIGNvbnRhaW5lci4gIFRoZSBib3VuZHMgYXJlIHR3ZWFrZWQgYSBiaXQgdG8gYWNjb3VudCBmb3IgdGhlIHdpZHRoIG9mIHRoZSBlbmVyZ3kgY2h1bmtzIGluXHJcbiAgICAgICAgLy8gdGhlIHZpZXcuXHJcbiAgICAgICAgY29uc3Qgc3VwcGxpZXJCb3VuZHMgPSBlbmVyZ3lDaHVua1N1cHBsaWVyLmdldEJvdW5kcygpO1xyXG4gICAgICAgIGNvbnN0IGhvcml6b250YWxXYW5kZXJDb25zdHJhaW50ID0gbmV3IFJhbmdlKCBzdXBwbGllckJvdW5kcy5taW5YICsgMC4wMSwgc3VwcGxpZXJCb3VuZHMubWF4WCAtIDAuMDEgKTtcclxuICAgICAgICBpZiAoIGVuZXJneUNodW5rLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCA8IGhvcml6b250YWxXYW5kZXJDb25zdHJhaW50Lm1pbiApIHtcclxuICAgICAgICAgIGVuZXJneUNodW5rLnNldFBvc2l0aW9uWFkoIGhvcml6b250YWxXYW5kZXJDb25zdHJhaW50Lm1pbiwgZW5lcmd5Q2h1bmsucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBlbmVyZ3lDaHVuay5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnggPiBob3Jpem9udGFsV2FuZGVyQ29uc3RyYWludC5tYXggKSB7XHJcbiAgICAgICAgICBlbmVyZ3lDaHVuay5zZXRQb3NpdGlvblhZKCBob3Jpem9udGFsV2FuZGVyQ29uc3RyYWludC5tYXgsIGVuZXJneUNodW5rLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbmVyZ3lDaHVua0NvbnN1bWVyLmFkZEVuZXJneUNodW5rKCBlbmVyZ3lDaHVuaywgaG9yaXpvbnRhbFdhbmRlckNvbnN0cmFpbnQgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBlbmVyZ3lDaHVua0NvbnN1bWVyLmFkZEVuZXJneUNodW5rKCBlbmVyZ3lDaHVuayApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBhZGp1c3QgdGhlIGVuZXJneSBiYWxhbmNlIHNpbmNlIGEgY2h1bmsgd2FzIHRyYW5zZmVycmVkLCBidXQgZG9uJ3QgY3Jvc3MgemVybyBmb3IgdGhlIGVuZXJneSBiYWxhbmNlXHJcbiAgICAgIGxldCBlbmVyZ3lFeGNoYW5nZVRvTG9nO1xyXG4gICAgICBpZiAoIGVuZXJneUJhbGFuY2VSZWNvcmQuZW5lcmd5QmFsYW5jZSA+IDAgKSB7XHJcbiAgICAgICAgZW5lcmd5RXhjaGFuZ2VUb0xvZyA9IE1hdGgubWF4KCAtRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LLCAtZW5lcmd5QmFsYW5jZVJlY29yZC5lbmVyZ3lCYWxhbmNlICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgZW5lcmd5RXhjaGFuZ2VUb0xvZyA9IE1hdGgubWluKCBFRkFDQ29uc3RhbnRzLkVORVJHWV9QRVJfQ0hVTkssIGVuZXJneUJhbGFuY2VSZWNvcmQuZW5lcmd5QmFsYW5jZSApO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuZW5lcmd5QmFsYW5jZVRyYWNrZXIubG9nRW5lcmd5RXhjaGFuZ2UoXHJcbiAgICAgICAgZW5lcmd5Q2h1bmtTdXBwbGllci5pZCxcclxuICAgICAgICBlbmVyZ3lDaHVua0NvbnN1bWVyLmlkLFxyXG4gICAgICAgIGVuZXJneUV4Y2hhbmdlVG9Mb2dcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1ha2UgYSB1c2VyLW1vdmFibGUgbW9kZWwgZWxlbWVudCBmYWxsIHRvIHRoZSBuZWFyZXN0IHN1cHBvcnRpbmcgc3VyZmFjZVxyXG4gICAqIEBwYXJhbSB7VXNlck1vdmFibGVNb2RlbEVsZW1lbnR9IG1vZGVsRWxlbWVudCAtIHRoZSBmYWxsaW5nIG9iamVjdFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRpbWUgc3RlcCBpbiBzZWNvbmRzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBmYWxsVG9TdXJmYWNlKCBtb2RlbEVsZW1lbnQsIGR0ICkge1xyXG4gICAgbGV0IG1pbllQb3MgPSAwO1xyXG4gICAgY29uc3QgYWNjZWxlcmF0aW9uID0gLTkuODsgLy8gbWV0ZXJzL3Mvc1xyXG5cclxuICAgIC8vIHNvcnQgbGlzdCBvZiBncm91bmQgc3BvdHMgaW4gb3JkZXIsIHdpdGggdGhlIGNsb3Nlc3Qgc3BvdCB0byBtb2RlbEVsZW1lbnQgZmlyc3RcclxuICAgIGNvbnN0IGdyb3VuZFNwb3RYUG9zaXRpb25zQ29weSA9IFsgLi4udGhpcy5ncm91bmRTcG90WFBvc2l0aW9ucyBdO1xyXG4gICAgZ3JvdW5kU3BvdFhQb3NpdGlvbnNDb3B5LnNvcnQoICggYSwgYiApID0+IHtcclxuICAgICAgY29uc3QgZGlzdGFuY2VBID0gTWF0aC5hYnMoIGEgLSBtb2RlbEVsZW1lbnQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54ICk7XHJcbiAgICAgIGNvbnN0IGRpc3RhbmNlQiA9IE1hdGguYWJzKCBiIC0gbW9kZWxFbGVtZW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCApO1xyXG4gICAgICByZXR1cm4gZGlzdGFuY2VBIC0gZGlzdGFuY2VCO1xyXG4gICAgfSApO1xyXG4gICAgbGV0IGRlc3RpbmF0aW9uWFNwb3QgPSBudWxsO1xyXG4gICAgbGV0IGRlc3RpbmF0aW9uU3VyZmFjZSA9IG51bGw7XHJcblxyXG4gICAgLy8gY2hlY2sgb3V0IGVhY2ggc3BvdFxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZ3JvdW5kU3BvdFhQb3NpdGlvbnNDb3B5Lmxlbmd0aCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvblhTcG90ID09PSBudWxsICYmXHJcbiAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uU3VyZmFjZSA9PT0gbnVsbDsgaSsrXHJcbiAgICApIHtcclxuICAgICAgY29uc3QgbW9kZWxFbGVtZW50c0luU3BvdCA9IFtdO1xyXG5cclxuICAgICAgLy8gZ2V0IGEgbGlzdCBvZiB3aGF0J3MgY3VycmVudGx5IGluIHRoZSBzcG90IGJlaW5nIGNoZWNrZWRcclxuICAgICAgdGhpcy5tb2RlbEVsZW1lbnRMaXN0LmZvckVhY2goIHBvdGVudGlhbFJlc3RpbmdNb2RlbEVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGlmICggcG90ZW50aWFsUmVzdGluZ01vZGVsRWxlbWVudCA9PT0gbW9kZWxFbGVtZW50ICkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVGhpcyBpZiBzdGF0ZW1lbnQgaXMgY2hlY2tpbmcgZWFjaCBwb3RlbnRpYWxSZXN0aW5nTW9kZWxFbGVtZW50IHRvIHNlZSB3aGljaCBvbmVzIGFyZSBhbHJlYWR5IGluIHRoZSBzcG90XHJcbiAgICAgICAgLy8gdGhhdCBtb2RlbEVsZW1lbnQgaXMgZmFsbGluZyB0by5cclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZmlyc3QgY29uZGl0aW9uIHVzdWFsbHkganVzdCBuZWVkcyB0byBjaGVjayBpZiBwb3RlbnRpYWxSZXN0aW5nTW9kZWxFbGVtZW50J3MgY2VudGVyIHhcclxuICAgICAgICAvLyBjb29yZGluYXRlIG1hdGNoZXMgdGhlIGN1cnJlbnQgZ3JvdW5kIHNwb3QgeCBjb29yZGluYXRlLCBidXQgaW5zdGVhZCBpdCBjb25zaWRlcnMgYW55XHJcbiAgICAgICAgLy8gcG90ZW50aWFsUmVzdGluZ01vZGVsRWxlbWVudCdzIHRvIGJlIGluIHRoaXMgc3BvdCBpZiBpdHMgY2VudGVyIHggY29vcmRpbmF0ZSBpcyB3aXRoaW4gaGFsZiBhIHNwb3Qnc1xyXG4gICAgICAgIC8vIHdpZHRoIG9mIHRoZSBncm91bmQgc3BvdCB4IGNvb3JkaW5hdGUuIHRoaXMgaGFuZGxlcyB0aGUgbXVsdGl0b3VjaCBjYXNlIHdoZXJlIG1vZGVsRWxlbWVudCBpcyBmYWxsaW5nIGFuZFxyXG4gICAgICAgIC8vIGEgdXNlciBkcmFncyBhIGRpZmZlcmVudCBtb2RlbCBlbGVtZW50IHNvbWV3aGVyZSB1bmRlcm5lYXRoIGl0ICh3aGljaCBpcyBsaWtlbHkgbm90IGxvY2F0ZWQgYXQgYSBncm91bmRcclxuICAgICAgICAvLyB4IGNvb3JkaW5hdGUpLCBiZWNhdXNlIGluc3RlYWQgb2Ygbm90IGRldGVjdGluZyB0aGF0IHVzZXItaGVsZCBtb2RlbCBlbGVtZW50IGFzIG9jY3VweWluZyB0aGlzIHNwb3RcclxuICAgICAgICAvLyAoYW5kIHRoZXJlZm9yZSBmYWxsaW5nIHRocm91Z2ggaXQgYW5kIG92ZXJsYXBwaW5nKSwgaXQgZG9lcyBkZXRlY3QgaXQsIGFuZCB0aGVuIGZhbGxzIHRvIHRoZSBtb2RlbFxyXG4gICAgICAgIC8vIGVsZW1lbnRzIHN1cmZhY2UgaW5zdGVhZCBvZiBhbGwgdGhlIHdheSBkb3duIHRvIHRoZSBncm91bmQgc3BvdC5cclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIFRoZSBzZWNvbmQgY29uZGl0aW9uIGNoZWNrcyB0aGF0IHBvdGVudGlhbFJlc3RpbmdNb2RlbEVsZW1lbnQgaXMgYmVsb3cgbW9kZWxFbGVtZW50IGJlY2F1c2UsIGZvciBleGFtcGxlLCBpblxyXG4gICAgICAgIC8vIHRoZSBjYXNlIHdoZXJlIGEgYmVha2VyIHdpdGggYSBibG9jayBpbnNpZGUgaXMgYmVpbmcgZHJvcHBlZCwgd2UgZG9uJ3Qgd2FudCB0aGUgYmVha2VyIHRvIHRoaW5rIHRoYXQgaXRzXHJcbiAgICAgICAgLy8gYmxvY2sgaXMgaW4gdGhlIHNwb3QgYmVsb3cgaXQuXHJcbiAgICAgICAgaWYgKCBNYXRoLmFicyggcG90ZW50aWFsUmVzdGluZ01vZGVsRWxlbWVudC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnggLSBncm91bmRTcG90WFBvc2l0aW9uc0NvcHlbIGkgXSApIDw9XHJcbiAgICAgICAgICAgICB0aGlzLnNwYWNlQmV0d2Vlbkdyb3VuZFNwb3RDZW50ZXJzIC8gMiAmJlxyXG4gICAgICAgICAgICAgcG90ZW50aWFsUmVzdGluZ01vZGVsRWxlbWVudC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgPD0gbW9kZWxFbGVtZW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUueSApIHtcclxuICAgICAgICAgIG1vZGVsRWxlbWVudHNJblNwb3QucHVzaCggcG90ZW50aWFsUmVzdGluZ01vZGVsRWxlbWVudCApO1xyXG5cclxuICAgICAgICAgIC8vIHRoaXMgaXMgYW4gYWRkaXRpb25hbCBzZWFyY2ggdG8gc2VlIGlmIHRoZXJlIGFyZSBhbnkgZWxlbWVudHMgc3RhY2tlZCBvbiBhIGZvdW5kIGVsZW1lbnQgdGhhdCBhcmVcclxuICAgICAgICAgIC8vICphYm92ZSogdGhlIGVsZW1lbnQgYmVpbmcgZHJvcHBlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lbmVyZ3ktZm9ybXMtYW5kLWNoYW5nZXMvaXNzdWVzLzIyMVxyXG4gICAgICAgICAgbGV0IHJlc3RpbmdNb2RlbEVsZW1lbnQgPSBwb3RlbnRpYWxSZXN0aW5nTW9kZWxFbGVtZW50O1xyXG4gICAgICAgICAgd2hpbGUgKCByZXN0aW5nTW9kZWxFbGVtZW50LnRvcFN1cmZhY2UuZWxlbWVudE9uU3VyZmFjZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgICBjb25zdCBzdGFja2VkUmVzdGluZ01vZGVsRWxlbWVudCA9IHJlc3RpbmdNb2RlbEVsZW1lbnQudG9wU3VyZmFjZS5lbGVtZW50T25TdXJmYWNlUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgICAgIGlmICggc3RhY2tlZFJlc3RpbmdNb2RlbEVsZW1lbnQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ID4gbW9kZWxFbGVtZW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUueSAmJlxyXG4gICAgICAgICAgICAgICAgIG1vZGVsRWxlbWVudHNJblNwb3QuaW5kZXhPZiggc3RhY2tlZFJlc3RpbmdNb2RlbEVsZW1lbnQgKSA8IDAgKSB7XHJcbiAgICAgICAgICAgICAgbW9kZWxFbGVtZW50c0luU3BvdC5wdXNoKCBzdGFja2VkUmVzdGluZ01vZGVsRWxlbWVudCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3RpbmdNb2RlbEVsZW1lbnQgPSBzdGFja2VkUmVzdGluZ01vZGVsRWxlbWVudDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGlmICggbW9kZWxFbGVtZW50c0luU3BvdC5sZW5ndGggPiAwICkge1xyXG5cclxuICAgICAgICAvLyBmbGFnIGFueSBiZWFrZXJzIHRoYXQgYXJlIGluIHRoZSBzcG90IGJlY2F1c2UgYmVha2VycyBhcmVuJ3QgYWxsb3dlZCB0byBzdGFjayBvbiB0b3Agb2Ygb25lIGFub3RoZXJcclxuICAgICAgICBsZXQgYmVha2VyRm91bmRJblNwb3QgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBtb2RlbEVsZW1lbnRzSW5TcG90Lmxlbmd0aCAmJiAhYmVha2VyRm91bmRJblNwb3Q7IGorKyApIHtcclxuICAgICAgICAgIGJlYWtlckZvdW5kSW5TcG90ID0gYmVha2VyRm91bmRJblNwb3QgfHwgbW9kZWxFbGVtZW50c0luU3BvdFsgaiBdIGluc3RhbmNlb2YgQmVha2VyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY3VycmVudE1vZGVsRWxlbWVudEluU3RhY2sgPSBtb2RlbEVsZW1lbnQ7XHJcbiAgICAgICAgbGV0IGJlYWtlckZvdW5kSW5TdGFjayA9IGN1cnJlbnRNb2RlbEVsZW1lbnRJblN0YWNrIGluc3RhbmNlb2YgQmVha2VyO1xyXG5cclxuICAgICAgICAvLyBpdGVyYXRlIHRocm91Z2ggdGhlIHN0YWNrIG9mIG1vZGVsIGVsZW1lbnRzIGJlaW5nIGhlbGQgYW5kIGZsYWcgaWYgYW55IGJlYWtlcnMgYXJlIGluIGl0XHJcbiAgICAgICAgd2hpbGUgKCBjdXJyZW50TW9kZWxFbGVtZW50SW5TdGFjay50b3BTdXJmYWNlLmVsZW1lbnRPblN1cmZhY2VQcm9wZXJ0eS52YWx1ZSAmJiAhYmVha2VyRm91bmRJblN0YWNrICkge1xyXG4gICAgICAgICAgYmVha2VyRm91bmRJblN0YWNrID0gYmVha2VyRm91bmRJblN0YWNrIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kZWxFbGVtZW50SW5TdGFjay50b3BTdXJmYWNlLmVsZW1lbnRPblN1cmZhY2VQcm9wZXJ0eS52YWx1ZSBpbnN0YW5jZW9mIEJlYWtlcjtcclxuICAgICAgICAgIGN1cnJlbnRNb2RlbEVsZW1lbnRJblN0YWNrID0gY3VycmVudE1vZGVsRWxlbWVudEluU3RhY2sudG9wU3VyZmFjZS5lbGVtZW50T25TdXJmYWNlUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoICEoIGJlYWtlckZvdW5kSW5TcG90ICYmIGJlYWtlckZvdW5kSW5TdGFjayApICkge1xyXG5cclxuICAgICAgICAgIC8vIGZpbmQgdGhlIGhpZ2hlc3QgZWxlbWVudCBpbiB0aGUgc3RhY2tcclxuICAgICAgICAgIGxldCBoaWdoZXN0RWxlbWVudCA9IG1vZGVsRWxlbWVudHNJblNwb3RbIDAgXTtcclxuICAgICAgICAgIGZvciAoIGxldCBqID0gMTsgaiA8IG1vZGVsRWxlbWVudHNJblNwb3QubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgICAgIGlmICggbW9kZWxFbGVtZW50c0luU3BvdFsgaiBdLnRvcFN1cmZhY2UucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ID5cclxuICAgICAgICAgICAgICAgICBoaWdoZXN0RWxlbWVudC50b3BTdXJmYWNlLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueSApIHtcclxuICAgICAgICAgICAgICBoaWdoZXN0RWxlbWVudCA9IG1vZGVsRWxlbWVudHNJblNwb3RbIGogXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZGVzdGluYXRpb25TdXJmYWNlID0gaGlnaGVzdEVsZW1lbnQudG9wU3VyZmFjZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgZGVzdGluYXRpb25YU3BvdCA9IGdyb3VuZFNwb3RYUG9zaXRpb25zQ29weVsgaSBdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBkZXN0aW5hdGlvblN1cmZhY2UgIT09IG51bGwgKSB7XHJcblxyXG4gICAgICAvLyBjZW50ZXIgdGhlIG1vZGVsIGVsZW1lbnQgYWJvdmUgaXRzIG5ldyBzdXBwb3J0aW5nIGVsZW1lbnRcclxuICAgICAgbWluWVBvcyA9IGRlc3RpbmF0aW9uU3VyZmFjZS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnk7XHJcbiAgICAgIG1vZGVsRWxlbWVudC5wb3NpdGlvblByb3BlcnR5LnNldChcclxuICAgICAgICBuZXcgVmVjdG9yMiggZGVzdGluYXRpb25TdXJmYWNlLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCwgbW9kZWxFbGVtZW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUueSApXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgbW9kZWxFbGVtZW50LnBvc2l0aW9uUHJvcGVydHkuc2V0KCBuZXcgVmVjdG9yMiggZGVzdGluYXRpb25YU3BvdCwgbW9kZWxFbGVtZW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUueSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2FsY3VsYXRlIGEgcHJvcG9zZWQgWSBwb3NpdGlvbiBiYXNlZCBvbiBncmF2aXRhdGlvbmFsIGZhbGxpbmdcclxuICAgIGNvbnN0IHZlbG9jaXR5ID0gbW9kZWxFbGVtZW50LnZlcnRpY2FsVmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSArIGFjY2VsZXJhdGlvbiAqIGR0O1xyXG4gICAgbGV0IHByb3Bvc2VkWVBvcyA9IG1vZGVsRWxlbWVudC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgKyB2ZWxvY2l0eSAqIGR0O1xyXG4gICAgaWYgKCBwcm9wb3NlZFlQb3MgPCBtaW5ZUG9zICkge1xyXG5cclxuICAgICAgLy8gdGhlIGVsZW1lbnQgaGFzIGxhbmRlZCBvbiB0aGUgZ3JvdW5kIG9yIHNvbWUgb3RoZXIgc3VyZmFjZVxyXG4gICAgICBwcm9wb3NlZFlQb3MgPSBtaW5ZUG9zO1xyXG4gICAgICBtb2RlbEVsZW1lbnQudmVydGljYWxWZWxvY2l0eVByb3BlcnR5LnNldCggMCApO1xyXG4gICAgICBpZiAoIGRlc3RpbmF0aW9uU3VyZmFjZSAhPT0gbnVsbCApIHtcclxuICAgICAgICBtb2RlbEVsZW1lbnQuc2V0U3VwcG9ydGluZ1N1cmZhY2UoIGRlc3RpbmF0aW9uU3VyZmFjZSApO1xyXG4gICAgICAgIGRlc3RpbmF0aW9uU3VyZmFjZS5lbGVtZW50T25TdXJmYWNlUHJvcGVydHkuc2V0KCBtb2RlbEVsZW1lbnQgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIG1vZGVsRWxlbWVudC52ZXJ0aWNhbFZlbG9jaXR5UHJvcGVydHkuc2V0KCB2ZWxvY2l0eSApO1xyXG4gICAgfVxyXG4gICAgbW9kZWxFbGVtZW50LnBvc2l0aW9uUHJvcGVydHkuc2V0KCBuZXcgVmVjdG9yMiggbW9kZWxFbGVtZW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCwgcHJvcG9zZWRZUG9zICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIHRlbXBlcmF0dXJlIGFuZCBjb2xvciB0aGF0IHdvdWxkIGJlIHNlbnNlZCBieSBhIHRoZXJtb21ldGVyIGF0IHRoZSBwcm92aWRlZCBwb3NpdGlvbi4gIFRoaXMgaXMgZG9uZVxyXG4gICAqIGFzIGEgc2luZ2xlIG9wZXJhdGlvbiBpbnN0ZWFkIG9mIGhhdmluZyBzZXBhcmF0ZSBtZXRob2RzIGZvciBnZXR0aW5nIHRlbXBlcmF0dXJlIGFuZCBjb2xvciBiZWNhdXNlIGl0IGlzIG1vcmVcclxuICAgKiBlZmZpY2llbnQgdG8gZG8gaXQgbGlrZSB0aGlzLlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9zaXRpb24gLSBwb3NpdGlvbiB0byBiZSBzZW5zZWRcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXI+fSBzZW5zZWRUZW1wZXJhdHVyZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Q29sb3I+fSBzZW5zZWRFbGVtZW50Q29sb3JQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7U3RyaW5nUHJvcGVydHl9IHNlbnNlZEVsZW1lbnROYW1lUHJvcGVydHlcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdXBkYXRlVGVtcGVyYXR1cmVBbmRDb2xvckFuZE5hbWVBdFBvc2l0aW9uKFxyXG4gICAgcG9zaXRpb24sXHJcbiAgICBzZW5zZWRUZW1wZXJhdHVyZVByb3BlcnR5LFxyXG4gICAgc2Vuc2VkRWxlbWVudENvbG9yUHJvcGVydHksXHJcbiAgICBzZW5zZWRFbGVtZW50TmFtZVByb3BlcnR5XHJcbiAgKSB7XHJcblxyXG4gICAgbGV0IHRlbXBlcmF0dXJlQW5kQ29sb3JBbmROYW1lVXBkYXRlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIFRlc3QgYmxvY2tzIGZpcnN0LiBTb3J0IHRoZW0gYnkgekluZGV4IHNvIHNlbnNvcnMgbWVhc3VyZSB0aGUgaGlnaGVzdCBvbmUgdGhhdCB0aGUgc2Vuc29yIGlzIG92ZXJcclxuICAgIGNvbnN0IGJsb2NrcyA9IF8uc29ydEJ5KCB0aGlzLmJsb2NrR3JvdXAuZ2V0QXJyYXlDb3B5KCksIGJsb2NrID0+IGJsb2NrLnpJbmRleCApO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gYmxvY2tzLmxlbmd0aCAtIDE7IGkgPj0gMCAmJiAhdGVtcGVyYXR1cmVBbmRDb2xvckFuZE5hbWVVcGRhdGVkOyBpLS0gKSB7XHJcbiAgICAgIGNvbnN0IGJsb2NrID0gYmxvY2tzWyBpIF07XHJcbiAgICAgIGlmICggYmxvY2suZ2V0UHJvamVjdGVkU2hhcGUoKS5jb250YWluc1BvaW50KCBwb3NpdGlvbiApICkge1xyXG4gICAgICAgIHNlbnNlZFRlbXBlcmF0dXJlUHJvcGVydHkuc2V0KCBibG9jay50ZW1wZXJhdHVyZSApO1xyXG4gICAgICAgIHNlbnNlZEVsZW1lbnRDb2xvclByb3BlcnR5LnNldCggYmxvY2suY29sb3IgKTtcclxuICAgICAgICBzZW5zZWRFbGVtZW50TmFtZVByb3BlcnR5LnNldCggYmxvY2sudGFuZGVtLnBoZXRpb0lEICk7XHJcbiAgICAgICAgdGVtcGVyYXR1cmVBbmRDb2xvckFuZE5hbWVVcGRhdGVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHRlc3QgaWYgdGhpcyBwb2ludCBpcyBpbiBhbnkgYmVha2VyJ3MgZmx1aWRcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuYmVha2VyR3JvdXAuY291bnQgJiYgIXRlbXBlcmF0dXJlQW5kQ29sb3JBbmROYW1lVXBkYXRlZDsgaSsrICkge1xyXG4gICAgICBjb25zdCBiZWFrZXIgPSB0aGlzLmJlYWtlckdyb3VwLmdldEVsZW1lbnQoIGkgKTtcclxuICAgICAgaWYgKCBiZWFrZXIudGhlcm1hbENvbnRhY3RBcmVhLmNvbnRhaW5zUG9pbnQoIHBvc2l0aW9uICkgKSB7XHJcbiAgICAgICAgc2Vuc2VkVGVtcGVyYXR1cmVQcm9wZXJ0eS5zZXQoIGJlYWtlci50ZW1wZXJhdHVyZVByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgICAgc2Vuc2VkRWxlbWVudENvbG9yUHJvcGVydHkuc2V0KCBiZWFrZXIuZmx1aWRDb2xvciApO1xyXG4gICAgICAgIHNlbnNlZEVsZW1lbnROYW1lUHJvcGVydHkuc2V0KCBiZWFrZXIudGFuZGVtLnBoZXRpb0lEICk7XHJcbiAgICAgICAgdGVtcGVyYXR1cmVBbmRDb2xvckFuZE5hbWVVcGRhdGVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHRlc3QgaWYgdGhpcyBwb2ludCBpcyBpbiBhbnkgYmVha2VyJ3Mgc3RlYW0uIHRoaXMgY2hlY2sgaGFwcGVucyBzZXBhcmF0ZWx5IGFmdGVyIGFsbCBiZWFrZXJzJyBmbHVpZCBoYXZlIGJlZW5cclxuICAgIC8vIGNoZWNrZWQgYmVjYXVzZSBpbiB0aGUgY2FzZSBvZiBhIGJlYWtlciBib2R5IGFuZCBhbm90aGVyIGJlYWtlcidzIHN0ZWFtIG92ZXJsYXBwaW5nLCB0aGUgdGhlcm1vbWV0ZXIgc2hvdWxkXHJcbiAgICAvLyBkZXRlY3QgdGhlIGJlYWtlciBib2R5IGZpcnN0XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmJlYWtlckdyb3VwLmNvdW50ICYmICF0ZW1wZXJhdHVyZUFuZENvbG9yQW5kTmFtZVVwZGF0ZWQ7IGkrKyApIHtcclxuICAgICAgY29uc3QgYmVha2VyID0gdGhpcy5iZWFrZXJHcm91cC5nZXRFbGVtZW50KCBpICk7XHJcbiAgICAgIGlmICggYmVha2VyLmdldFN0ZWFtQXJlYSgpLmNvbnRhaW5zUG9pbnQoIHBvc2l0aW9uICkgJiYgYmVha2VyLnN0ZWFtaW5nUHJvcG9ydGlvbiA+IDAgKSB7XHJcbiAgICAgICAgc2Vuc2VkVGVtcGVyYXR1cmVQcm9wZXJ0eS5zZXQoIGJlYWtlci5nZXRTdGVhbVRlbXBlcmF0dXJlKCBwb3NpdGlvbi55IC0gYmVha2VyLmdldFN0ZWFtQXJlYSgpLm1pblkgKSApO1xyXG4gICAgICAgIHNlbnNlZEVsZW1lbnRDb2xvclByb3BlcnR5LnNldCggYmVha2VyLnN0ZWFtQ29sb3IgKTtcclxuICAgICAgICBzZW5zZWRFbGVtZW50TmFtZVByb3BlcnR5LnNldCggYmVha2VyLnRhbmRlbS5waGV0aW9JRCApO1xyXG4gICAgICAgIHRlbXBlcmF0dXJlQW5kQ29sb3JBbmROYW1lVXBkYXRlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB0ZXN0IGlmIHRoZSBwb2ludCBpcyBhIGJ1cm5lclxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5idXJuZXJzLmxlbmd0aCAmJiAhdGVtcGVyYXR1cmVBbmRDb2xvckFuZE5hbWVVcGRhdGVkOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGJ1cm5lciA9IHRoaXMuYnVybmVyc1sgaSBdO1xyXG4gICAgICBpZiAoIGJ1cm5lci5nZXRGbGFtZUljZVJlY3QoKS5jb250YWluc1BvaW50KCBwb3NpdGlvbiApICkge1xyXG4gICAgICAgIHNlbnNlZFRlbXBlcmF0dXJlUHJvcGVydHkuc2V0KCBidXJuZXIuZ2V0VGVtcGVyYXR1cmUoKSApO1xyXG4gICAgICAgIHNlbnNlZEVsZW1lbnRDb2xvclByb3BlcnR5LnNldCggRUZBQ0ludHJvTW9kZWwubWFwSGVhdENvb2xMZXZlbFRvQ29sb3IoIGJ1cm5lci5oZWF0Q29vbExldmVsUHJvcGVydHkuZ2V0KCkgKSApO1xyXG4gICAgICAgIHNlbnNlZEVsZW1lbnROYW1lUHJvcGVydHkuc2V0KCBidXJuZXIudGFuZGVtLnBoZXRpb0lEICk7XHJcbiAgICAgICAgdGVtcGVyYXR1cmVBbmRDb2xvckFuZE5hbWVVcGRhdGVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICggIXRlbXBlcmF0dXJlQW5kQ29sb3JBbmROYW1lVXBkYXRlZCApIHtcclxuXHJcbiAgICAgIC8vIHRoZSBwb3NpdGlvbiBpcyBpbiBub3RoaW5nIGVsc2UsIHNvIHNldCB0aGUgYWlyIHRlbXBlcmF0dXJlIGFuZCBjb2xvclxyXG4gICAgICBzZW5zZWRUZW1wZXJhdHVyZVByb3BlcnR5LnNldCggdGhpcy5haXIuZ2V0VGVtcGVyYXR1cmUoKSApO1xyXG4gICAgICBzZW5zZWRFbGVtZW50Q29sb3JQcm9wZXJ0eS5zZXQoIEVGQUNDb25zdGFudHMuRklSU1RfU0NSRUVOX0JBQ0tHUk9VTkRfQ09MT1IgKTtcclxuICAgICAgc2Vuc2VkRWxlbWVudE5hbWVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZ2V0IHRoZSB0aGVybWFsIG1vZGVsIGVsZW1lbnQgdGhhdCBoYXMgdGhlIHByb3ZpZGVkIElEXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlkXHJcbiAgICogQHJldHVybnMge09iamVjdH0gLSBvbmUgb2YgdGhlIGVsZW1lbnRzIGluIHRoZSBtb2RlbCB0aGF0IGNhbiBwcm92aWRlIGFuZCBhYnNvcmIgZW5lcmd5XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRUaGVybWFsRWxlbWVudEJ5SUQoIGlkICkge1xyXG4gICAgbGV0IGVsZW1lbnQgPSBudWxsO1xyXG4gICAgaWYgKCBpZCA9PT0gdGhpcy5haXIuaWQgKSB7XHJcbiAgICAgIGVsZW1lbnQgPSB0aGlzLmFpcjtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBpZC5pbmRleE9mKCAnYnVybmVyJyApID49IDAgKSB7XHJcbiAgICAgIGVsZW1lbnQgPSBfLmZpbmQoIHRoaXMuYnVybmVycywgYnVybmVyID0+IGJ1cm5lci5pZCA9PT0gaWQgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBlbGVtZW50ID0gXy5maW5kKCB0aGlzLnRoZXJtYWxDb250YWluZXJzLCBjb250YWluZXIgPT4gY29udGFpbmVyLmlkID09PSBpZCApO1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZWxlbWVudCwgYG5vIGVsZW1lbnQgZm91bmQgZm9yIGlkOiAke2lkfWAgKTtcclxuICAgIHJldHVybiBlbGVtZW50O1xyXG4gIH1cclxufVxyXG5cclxuZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzLnJlZ2lzdGVyKCAnRUZBQ0ludHJvTW9kZWwnLCBFRkFDSW50cm9Nb2RlbCApO1xyXG5leHBvcnQgZGVmYXVsdCBFRkFDSW50cm9Nb2RlbDtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsbUJBQW1CLE1BQU0sNENBQTRDO0FBQzVFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsU0FBU0MsS0FBSyxRQUFRLG1DQUFtQztBQUN6RCxPQUFPQyxXQUFXLE1BQU0sc0NBQXNDO0FBQzlELE9BQU9DLGFBQWEsTUFBTSwrQkFBK0I7QUFDekQsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFDakQsT0FBT0MsZ0JBQWdCLE1BQU0sd0NBQXdDO0FBQ3JFLE9BQU9DLGdDQUFnQyxNQUFNLHdEQUF3RDtBQUNyRyxPQUFPQyxxQkFBcUIsTUFBTSxnQ0FBZ0M7QUFDbEUsT0FBT0MsR0FBRyxNQUFNLFVBQVU7QUFDMUIsT0FBT0MsZUFBZSxNQUFNLHNCQUFzQjtBQUNsRCxPQUFPQyxLQUFLLE1BQU0sWUFBWTtBQUM5QixPQUFPQyxTQUFTLE1BQU0sZ0JBQWdCO0FBQ3RDLE9BQU9DLG9CQUFvQixNQUFNLDJCQUEyQjtBQUM1RCxPQUFPQywrQkFBK0IsTUFBTSxzQ0FBc0M7O0FBRWxGO0FBQ0EsTUFBTUMsc0JBQXNCLEdBQUcsQ0FBQztBQUNoQyxNQUFNQyxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDNUIsTUFBTUMsYUFBYSxHQUFHRCxZQUFZ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