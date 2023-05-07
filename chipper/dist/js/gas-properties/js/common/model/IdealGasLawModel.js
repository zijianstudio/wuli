// Copyright 2019-2023, University of Colorado Boulder

/**
 * IdealGasLawModel extends the base model with functionality related to the Ideal Gas Law.
 *
 * This model has subcomponents that handle the quantities involved in the Ideal Gas Law, PV = NkT.  They are:
 *
 * P (pressure) - see PressureModel pressureProperty
 * V (volume) - see BaseContainer volumeProperty
 * N (number of particles) - see ParticleSystem numberOfParticlesProperty
 * T (temperature) - see TemperatureModel temperatureProperty
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesConstants from '../GasPropertiesConstants.js';
import GasPropertiesQueryParameters from '../GasPropertiesQueryParameters.js';
import BaseModel from './BaseModel.js';
import CollisionCounter from './CollisionCounter.js';
import CollisionDetector from './CollisionDetector.js';
import { HoldConstantValues } from './HoldConstant.js';
import IdealGasLawContainer from './IdealGasLawContainer.js';
import ParticleSystem from './ParticleSystem.js';
import PressureGauge from './PressureGauge.js';
import PressureModel from './PressureModel.js';
import TemperatureModel from './TemperatureModel.js';
export default class IdealGasLawModel extends BaseModel {
  // the quantity to hold constant

  // The factor to heat or cool the contents of the container.
  // See HeaterCoolerNode: 1 is max heat, -1 is max cool, 0 is no change.
  // whether particle-particle collisions are enabled
  // sub-model responsible for temperature T
  // sub-model responsible for pressure P
  // Emitters for conditions related to the 'Hold Constant' feature.
  // When holding a quantity constant would break the model, the model switches to 'Nothing' mode, the model
  // notifies the view via an Emitter, and the view notifies the user via a dialog. This is called oopsEmitters
  // because the end result is that the user sees an OopsDialog, with a message of the form 'Oops! blah blah'.
  // It was difficult to find names for these Emitters that weren't overly verbose, so the names are
  // highly-abbreviated versions of the messages that the user will see, and they are grouped in an object
  // named oopsEmitters.
  constructor(tandem, providedOptions) {
    const options = optionize()({
      // SelfOptions
      leftWallDoesWork: false,
      holdConstant: 'nothing',
      hasCollisionCounter: true
    }, providedOptions);
    super(tandem);
    this.holdConstantProperty = new StringUnionProperty(options.holdConstant, {
      validValues: HoldConstantValues,
      tandem: tandem.createTandem('holdConstantProperty'),
      phetioDocumentation: 'determines which quantity will be held constant'
    });
    this.heatCoolFactorProperty = new NumberProperty(0, {
      range: new Range(-1, 1),
      tandem: tandem.createTandem('heatCoolFactorProperty'),
      phetioDocumentation: 'The amount of heat or cool applied to particles in the container. ' + '-1 is maximum cooling, +1 is maximum heat, 0 is off'
    });
    this.particleParticleCollisionsEnabledProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('particleParticleCollisionsEnabledProperty'),
      phetioDocumentation: 'determines whether collisions between particles are enabled'
    });
    this.container = new IdealGasLawContainer({
      leftWallDoesWork: options.leftWallDoesWork,
      tandem: tandem.createTandem('container')
    });
    this.particleSystem = new ParticleSystem(() => this.temperatureModel.getInitialTemperature(), this.particleParticleCollisionsEnabledProperty, this.container.particleEntryPosition, tandem.createTandem('particleSystem'));
    this.temperatureModel = new TemperatureModel(this.particleSystem.numberOfParticlesProperty,
    // N
    () => this.particleSystem.getAverageKineticEnergy(),
    // KE
    tandem.createTandem('temperatureModel'));
    this.pressureModel = new PressureModel(this.holdConstantProperty, this.particleSystem.numberOfParticlesProperty,
    // N
    this.container.volumeProperty,
    // V
    this.temperatureModel.temperatureProperty,
    // T
    () => {
      this.container.blowLidOff();
    }, tandem.createTandem('pressureModel'));
    this.collisionDetector = new CollisionDetector(this.container, this.particleSystem.insideParticleArrays, this.particleParticleCollisionsEnabledProperty);
    this.collisionCounter = null;
    if (options.hasCollisionCounter) {
      this.collisionCounter = new CollisionCounter(this.collisionDetector, {
        position: new Vector2(40, 15),
        // view coordinates! determined empirically
        tandem: tandem.createTandem('collisionCounter'),
        visible: true
      });
    }

    // If the container's width changes while the sim is paused, and it's not due to the user
    // resizing the container, then update immediately. See #125.
    Multilink.multilink([this.container.widthProperty, this.container.userIsAdjustingWidthProperty], (width, userIsAdjustingWidth) => {
      if (!userIsAdjustingWidth && !this.isPlayingProperty.value) {
        this.updateWhenPaused();
      }
    });
    this.oopsEmitters = {
      temperatureEmptyEmitter: new Emitter(),
      temperatureOpenEmitter: new Emitter(),
      pressureEmptyEmitter: new Emitter(),
      pressureLargeEmitter: new Emitter(),
      pressureSmallEmitter: new Emitter(),
      maximumTemperatureEmitter: new Emitter()
    };

    // When the number of particles in the container changes ...
    this.particleSystem.numberOfParticlesProperty.link(numberOfParticles => {
      // If the container is empty, check for 'Hold Constant' conditions that can't be satisfied.
      if (numberOfParticles === 0) {
        if (this.holdConstantProperty.value === 'temperature') {
          // Temperature can't be held constant when the container is empty.
          phet.log && phet.log('Oops! T cannot be held constant when N=0');
          this.holdConstantProperty.value = 'nothing';
          this.oopsEmitters.temperatureEmptyEmitter.emit();
        } else if (this.holdConstantProperty.value === 'pressureT' || this.holdConstantProperty.value === 'pressureV') {
          // Pressure can't be held constant when the container is empty.
          phet.log && phet.log('Oops! P cannot be held constant when N=0');
          this.holdConstantProperty.value = 'nothing';
          this.oopsEmitters.pressureEmptyEmitter.emit();
        }
      }

      // If the number of particles changes while the sim is paused, update immediately.
      // Do this after checking holdConstantProperty, in case it gets switched to HoldConstant 'nothing'.
      if (!this.isPlayingProperty.value) {
        this.updateWhenPaused();
      }
    });

    // Temperature can't be held constant when the container is open, because we don't want to deal with
    // counteracting evaporative cooling. See https://github.com/phetsims/gas-properties/issues/159
    this.container.isOpenProperty.link(isOpen => {
      if (isOpen && this.holdConstantProperty.value === 'temperature') {
        phet.log && phet.log('Oops! T cannot be held constant when the container is open');
        this.holdConstantProperty.value = 'nothing';
        this.oopsEmitters.temperatureOpenEmitter.emit();
      }
    });

    // When the number of particles (N) is decreased while holding temperature (T) constant, adjust the speed of
    // particles to result in the desired temperature.  We only need to do this when N decreases because particles
    // that are added have their initial speed set based on T of the container, and therefore result in no change
    // to T. See https://github.com/phetsims/gas-properties/issues/159
    this.particleSystem.numberOfParticlesProperty.link((numberOfParticles, previousNumberOfParticles) => {
      if (previousNumberOfParticles !== null && numberOfParticles > 0 && numberOfParticles < previousNumberOfParticles && this.holdConstantProperty.value === 'temperature') {
        assert && assert(!this.temperatureModel.controlTemperatureEnabledProperty.value, 'this feature is not compatible with user-controlled particle temperature');

        // Workaround for https://github.com/phetsims/gas-properties/issues/168. Addresses an ordering problem where
        // the temperature model needs to update when this state occurs, but it's still null. Temperature is null
        // when the container is empty.
        if (this.temperatureModel.temperatureProperty.value === null) {
          this.temperatureModel.update();
        }
        const temperature = this.temperatureModel.temperatureProperty.value;
        assert && assert(temperature !== null);
        this.particleSystem.setTemperature(temperature);
      }
    });

    // Verify that we're not in a bad 'Hold Constant' state.
    assert && this.holdConstantProperty.link(holdConstant => {
      // values that are incompatible with an empty container
      assert && assert(!(this.particleSystem.numberOfParticlesProperty.value === 0 && (holdConstant === 'temperature' || holdConstant === 'pressureT' || holdConstant === 'pressureV')), `bad holdConstant state: ${holdConstant} with numberOfParticles=${this.particleSystem.numberOfParticlesProperty.value}`);

      // values that are incompatible with zero pressure
      assert && assert(!(this.pressureModel.pressureProperty.value === 0 && (holdConstant === 'pressureV' || holdConstant === 'pressureT')), `bad holdConstant state: ${holdConstant} with pressure=${this.pressureModel.pressureProperty.value}`);
    }, {
      // These values need to be correct before this listener fires.  This is not an issue when the sim is running,
      // but is relevant when PhET-iO restores state.  See https://github.com/phetsims/gas-properties/issues/182.
      phetioDependencies: [this.particleSystem.numberOfParticlesProperty, this.pressureModel.pressureProperty]
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  reset() {
    super.reset();

    // Properties
    this.holdConstantProperty.reset();
    this.heatCoolFactorProperty.reset();
    this.particleParticleCollisionsEnabledProperty.reset();

    // model elements
    this.container.reset();
    this.particleSystem.reset();
    this.temperatureModel.reset();
    this.pressureModel.reset();
    this.collisionCounter && this.collisionCounter.reset();
  }

  /**
   * Steps the model using model time units. Order is very important here!
   * @param dt - time delta, in ps
   */
  stepModelTime(dt) {
    assert && assert(dt > 0, `invalid dt: ${dt}`);
    super.stepModelTime(dt);

    // step the system
    this.stepSystem(dt);

    // update things that are dependent on the state of the system
    this.updateModel(dt, this.collisionDetector.numberOfParticleContainerCollisions);
  }

  /**
   * Steps the things that affect the container and particle system, including heating/cooling
   * and collision detection/response. Order is very important here!
   * @param dt - time delta, in ps
   */
  stepSystem(dt) {
    assert && assert(dt > 0, `invalid dt: ${dt}`);

    // Apply heat/cool
    this.particleSystem.heatCool(this.heatCoolFactorProperty.value);

    // Step particles
    this.particleSystem.step(dt);

    // Allow particles to escape from the opening in the top of the container
    this.particleSystem.escapeParticles(this.container);

    // Step container, to animate resizing of left wall and compute velocity of left wall.
    this.container.step(dt);

    // Collision detection and response
    this.collisionDetector.update();

    // Remove particles that have left the model bounds
    this.particleSystem.removeParticlesOutOfBounds(this.modelBoundsProperty.value);

    // Do this after collision detection, so that the number of collisions detected has been recorded.
    this.collisionCounter && this.collisionCounter.step(dt);
  }

  /**
   * Updates parts of the model that are dependent on the state of the particle system.  This is separated from
   * stepSystem so that we can update if the number of particles changes while the simulation is paused.
   * Order is very important here!
   * @param dtPressureGauge - time delta used to step the pressure gauge, in ps
   * @param numberOfCollisions - number of collisions on the most recent time step
   */
  updateModel(dtPressureGauge, numberOfCollisions) {
    assert && assert(dtPressureGauge > 0, `invalid dtPressureGauge: ${dtPressureGauge}`);
    assert && assert(numberOfCollisions >= 0, `invalid numberOfCollisions: ${numberOfCollisions}`);

    // Adjust quantities to compensate for 'Hold Constant' mode. Do this before computing temperature or pressure.
    this.compensateForHoldConstant();

    // Update temperature. Do this before pressure, because pressure depends on temperature.
    this.temperatureModel.update();

    // Update pressure.
    this.pressureModel.update(dtPressureGauge, numberOfCollisions);

    // Do this last.
    this.verifyModel();
  }

  /**
   * Updates when the sim is paused.
   */
  updateWhenPaused() {
    assert && assert(!this.isPlayingProperty.value, 'call this method only when paused');

    // Using the pressure gauge's refresh period causes it to update immediately.
    this.updateModel(PressureGauge.REFRESH_PERIOD, 0 /* numberOfCollisions */);
  }

  /**
   * Adjusts quantities to compensate for the quantity that is being held constant.
   */
  compensateForHoldConstant() {
    if (this.holdConstantProperty.value === 'pressureV') {
      // hold pressure constant by changing volume
      const previousContainerWidth = this.container.widthProperty.value;
      let containerWidth = this.computeIdealVolume() / (this.container.height * this.container.depth);

      // Address floating-point error, see https://github.com/phetsims/gas-properties/issues/89
      containerWidth = Utils.toFixedNumber(containerWidth, 5);

      // If the desired container width is out of range ...
      if (!this.container.widthRange.contains(containerWidth)) {
        // Switch to the 'Nothing' mode
        this.holdConstantProperty.value = 'nothing';

        // This results in an OopsDialog being displayed
        phet.log && phet.log('Oops! P cannot be held constant when V exceeds range, ' + `containerWidth=${containerWidth} widthRange=${this.container.widthRange}`);
        if (containerWidth > this.container.widthRange.max) {
          this.oopsEmitters.pressureLargeEmitter.emit();
        } else {
          this.oopsEmitters.pressureSmallEmitter.emit();
        }

        // Constrain the container width to its min or max.
        containerWidth = this.container.widthRange.constrainValue(containerWidth);
      }

      // Change the container's width immediately, with no animation.
      this.container.resizeImmediately(containerWidth);

      // Redistribute particles in the new width
      this.particleSystem.redistributeParticles(containerWidth / previousContainerWidth);
    } else if (this.holdConstantProperty.value === 'pressureT') {
      // Hold pressure constant by adjusting particle velocities to result in a desired temperature.
      const desiredTemperature = this.computeIdealTemperature();
      this.particleSystem.setTemperature(desiredTemperature);
      assert && assert(Math.abs(desiredTemperature - this.computeIdealTemperature()) < 1E-3, 'actual temperature does not match desired temperature');
      this.temperatureModel.temperatureProperty.value = desiredTemperature;
    }
  }

  /**
   * Verify that the model is in a good state after having been updated. If it's not, adjust accordingly.
   */
  verifyModel() {
    const temperature = this.temperatureModel.temperatureProperty.value;

    // If the maximum temperature was exceeded, reset the state of the container.
    // See https://github.com/phetsims/gas-properties/issues/128
    if (temperature !== null && temperature >= GasPropertiesQueryParameters.maxTemperature) {
      // Switch to a 'Hold Constant' setting that supports an empty container
      if (this.holdConstantProperty.value !== 'nothing' && this.holdConstantProperty.value !== 'volume') {
        this.holdConstantProperty.value = 'nothing';
      }

      // Remove all particles. Do this after changing holdConstantProperty, so that that we don't trigger
      // multiple oopsEmitters.  See https://github.com/phetsims/gas-properties/issues/150.
      this.particleSystem.removeAllParticles();

      // Put the lid on the container
      this.container.lidIsOnProperty.value = true;

      // Notify listeners that maximum temperature was exceeded.
      phet.log && phet.log(`Oops! Maximum temperature reached: ${this.temperatureModel.temperatureProperty.value}`);
      this.oopsEmitters.maximumTemperatureEmitter.emit();
    }
  }

  /**
   * Computes volume in pm^3, using the Ideal Gas Law, V = NkT/P
   * This is used to compute the volume needed to hold pressure constant in HoldConstant 'pressureV' mode.
   */
  computeIdealVolume() {
    const N = this.particleSystem.numberOfParticlesProperty.value;
    const k = GasPropertiesConstants.BOLTZMANN; // (pm^2 * AMU)/(ps^2 * K)
    const T = this.temperatureModel.computeTemperature() || 0; // temperature has not been updated, so compute it
    const P = this.pressureModel.pressureProperty.value / GasPropertiesConstants.PRESSURE_CONVERSION_SCALE;
    assert && assert(P !== 0, 'zero pressure not supported');
    return N * k * T / P;
  }

  /**
   * Computes the temperature in K, using the Ideal Gas Law, T = (PV)/(Nk)
   * This is used to compute the temperature needed to hold pressure constant in HoldConstant 'pressureT' mode.
   */
  computeIdealTemperature() {
    const P = this.pressureModel.pressureProperty.value / GasPropertiesConstants.PRESSURE_CONVERSION_SCALE;
    assert && assert(P !== 0, 'zero pressure not supported');
    const N = this.particleSystem.numberOfParticlesProperty.value;
    assert && assert(N !== 0, 'empty container not supported');
    const V = this.container.volumeProperty.value; // pm^3
    const k = GasPropertiesConstants.BOLTZMANN; // (pm^2 * AMU)/(ps^2 * K)

    return P * V / (N * k);
  }
}
gasProperties.register('IdealGasLawModel', IdealGasLawModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiTXVsdGlsaW5rIiwiTnVtYmVyUHJvcGVydHkiLCJTdHJpbmdVbmlvblByb3BlcnR5IiwiUmFuZ2UiLCJVdGlscyIsIlZlY3RvcjIiLCJvcHRpb25pemUiLCJnYXNQcm9wZXJ0aWVzIiwiR2FzUHJvcGVydGllc0NvbnN0YW50cyIsIkdhc1Byb3BlcnRpZXNRdWVyeVBhcmFtZXRlcnMiLCJCYXNlTW9kZWwiLCJDb2xsaXNpb25Db3VudGVyIiwiQ29sbGlzaW9uRGV0ZWN0b3IiLCJIb2xkQ29uc3RhbnRWYWx1ZXMiLCJJZGVhbEdhc0xhd0NvbnRhaW5lciIsIlBhcnRpY2xlU3lzdGVtIiwiUHJlc3N1cmVHYXVnZSIsIlByZXNzdXJlTW9kZWwiLCJUZW1wZXJhdHVyZU1vZGVsIiwiSWRlYWxHYXNMYXdNb2RlbCIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImxlZnRXYWxsRG9lc1dvcmsiLCJob2xkQ29uc3RhbnQiLCJoYXNDb2xsaXNpb25Db3VudGVyIiwiaG9sZENvbnN0YW50UHJvcGVydHkiLCJ2YWxpZFZhbHVlcyIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJoZWF0Q29vbEZhY3RvclByb3BlcnR5IiwicmFuZ2UiLCJwYXJ0aWNsZVBhcnRpY2xlQ29sbGlzaW9uc0VuYWJsZWRQcm9wZXJ0eSIsImNvbnRhaW5lciIsInBhcnRpY2xlU3lzdGVtIiwidGVtcGVyYXR1cmVNb2RlbCIsImdldEluaXRpYWxUZW1wZXJhdHVyZSIsInBhcnRpY2xlRW50cnlQb3NpdGlvbiIsIm51bWJlck9mUGFydGljbGVzUHJvcGVydHkiLCJnZXRBdmVyYWdlS2luZXRpY0VuZXJneSIsInByZXNzdXJlTW9kZWwiLCJ2b2x1bWVQcm9wZXJ0eSIsInRlbXBlcmF0dXJlUHJvcGVydHkiLCJibG93TGlkT2ZmIiwiY29sbGlzaW9uRGV0ZWN0b3IiLCJpbnNpZGVQYXJ0aWNsZUFycmF5cyIsImNvbGxpc2lvbkNvdW50ZXIiLCJwb3NpdGlvbiIsInZpc2libGUiLCJtdWx0aWxpbmsiLCJ3aWR0aFByb3BlcnR5IiwidXNlcklzQWRqdXN0aW5nV2lkdGhQcm9wZXJ0eSIsIndpZHRoIiwidXNlcklzQWRqdXN0aW5nV2lkdGgiLCJpc1BsYXlpbmdQcm9wZXJ0eSIsInZhbHVlIiwidXBkYXRlV2hlblBhdXNlZCIsIm9vcHNFbWl0dGVycyIsInRlbXBlcmF0dXJlRW1wdHlFbWl0dGVyIiwidGVtcGVyYXR1cmVPcGVuRW1pdHRlciIsInByZXNzdXJlRW1wdHlFbWl0dGVyIiwicHJlc3N1cmVMYXJnZUVtaXR0ZXIiLCJwcmVzc3VyZVNtYWxsRW1pdHRlciIsIm1heGltdW1UZW1wZXJhdHVyZUVtaXR0ZXIiLCJsaW5rIiwibnVtYmVyT2ZQYXJ0aWNsZXMiLCJwaGV0IiwibG9nIiwiZW1pdCIsImlzT3BlblByb3BlcnR5IiwiaXNPcGVuIiwicHJldmlvdXNOdW1iZXJPZlBhcnRpY2xlcyIsImFzc2VydCIsImNvbnRyb2xUZW1wZXJhdHVyZUVuYWJsZWRQcm9wZXJ0eSIsInVwZGF0ZSIsInRlbXBlcmF0dXJlIiwic2V0VGVtcGVyYXR1cmUiLCJwcmVzc3VyZVByb3BlcnR5IiwicGhldGlvRGVwZW5kZW5jaWVzIiwiZGlzcG9zZSIsInJlc2V0Iiwic3RlcE1vZGVsVGltZSIsImR0Iiwic3RlcFN5c3RlbSIsInVwZGF0ZU1vZGVsIiwibnVtYmVyT2ZQYXJ0aWNsZUNvbnRhaW5lckNvbGxpc2lvbnMiLCJoZWF0Q29vbCIsInN0ZXAiLCJlc2NhcGVQYXJ0aWNsZXMiLCJyZW1vdmVQYXJ0aWNsZXNPdXRPZkJvdW5kcyIsIm1vZGVsQm91bmRzUHJvcGVydHkiLCJkdFByZXNzdXJlR2F1Z2UiLCJudW1iZXJPZkNvbGxpc2lvbnMiLCJjb21wZW5zYXRlRm9ySG9sZENvbnN0YW50IiwidmVyaWZ5TW9kZWwiLCJSRUZSRVNIX1BFUklPRCIsInByZXZpb3VzQ29udGFpbmVyV2lkdGgiLCJjb250YWluZXJXaWR0aCIsImNvbXB1dGVJZGVhbFZvbHVtZSIsImhlaWdodCIsImRlcHRoIiwidG9GaXhlZE51bWJlciIsIndpZHRoUmFuZ2UiLCJjb250YWlucyIsIm1heCIsImNvbnN0cmFpblZhbHVlIiwicmVzaXplSW1tZWRpYXRlbHkiLCJyZWRpc3RyaWJ1dGVQYXJ0aWNsZXMiLCJkZXNpcmVkVGVtcGVyYXR1cmUiLCJjb21wdXRlSWRlYWxUZW1wZXJhdHVyZSIsIk1hdGgiLCJhYnMiLCJtYXhUZW1wZXJhdHVyZSIsInJlbW92ZUFsbFBhcnRpY2xlcyIsImxpZElzT25Qcm9wZXJ0eSIsIk4iLCJrIiwiQk9MVFpNQU5OIiwiVCIsImNvbXB1dGVUZW1wZXJhdHVyZSIsIlAiLCJQUkVTU1VSRV9DT05WRVJTSU9OX1NDQUxFIiwiViIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSWRlYWxHYXNMYXdNb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBJZGVhbEdhc0xhd01vZGVsIGV4dGVuZHMgdGhlIGJhc2UgbW9kZWwgd2l0aCBmdW5jdGlvbmFsaXR5IHJlbGF0ZWQgdG8gdGhlIElkZWFsIEdhcyBMYXcuXHJcbiAqXHJcbiAqIFRoaXMgbW9kZWwgaGFzIHN1YmNvbXBvbmVudHMgdGhhdCBoYW5kbGUgdGhlIHF1YW50aXRpZXMgaW52b2x2ZWQgaW4gdGhlIElkZWFsIEdhcyBMYXcsIFBWID0gTmtULiAgVGhleSBhcmU6XHJcbiAqXHJcbiAqIFAgKHByZXNzdXJlKSAtIHNlZSBQcmVzc3VyZU1vZGVsIHByZXNzdXJlUHJvcGVydHlcclxuICogViAodm9sdW1lKSAtIHNlZSBCYXNlQ29udGFpbmVyIHZvbHVtZVByb3BlcnR5XHJcbiAqIE4gKG51bWJlciBvZiBwYXJ0aWNsZXMpIC0gc2VlIFBhcnRpY2xlU3lzdGVtIG51bWJlck9mUGFydGljbGVzUHJvcGVydHlcclxuICogVCAodGVtcGVyYXR1cmUpIC0gc2VlIFRlbXBlcmF0dXJlTW9kZWwgdGVtcGVyYXR1cmVQcm9wZXJ0eVxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVbmlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvU3RyaW5nVW5pb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgZ2FzUHJvcGVydGllcyBmcm9tICcuLi8uLi9nYXNQcm9wZXJ0aWVzLmpzJztcclxuaW1wb3J0IEdhc1Byb3BlcnRpZXNDb25zdGFudHMgZnJvbSAnLi4vR2FzUHJvcGVydGllc0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBHYXNQcm9wZXJ0aWVzUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uL0dhc1Byb3BlcnRpZXNRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgQmFzZU1vZGVsLCB7IEJhc2VNb2RlbE9wdGlvbnMgfSBmcm9tICcuL0Jhc2VNb2RlbC5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25Db3VudGVyIGZyb20gJy4vQ29sbGlzaW9uQ291bnRlci5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25EZXRlY3RvciBmcm9tICcuL0NvbGxpc2lvbkRldGVjdG9yLmpzJztcclxuaW1wb3J0IHsgSG9sZENvbnN0YW50LCBIb2xkQ29uc3RhbnRWYWx1ZXMgfSBmcm9tICcuL0hvbGRDb25zdGFudC5qcyc7XHJcbmltcG9ydCBJZGVhbEdhc0xhd0NvbnRhaW5lciBmcm9tICcuL0lkZWFsR2FzTGF3Q29udGFpbmVyLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlU3lzdGVtIGZyb20gJy4vUGFydGljbGVTeXN0ZW0uanMnO1xyXG5pbXBvcnQgUHJlc3N1cmVHYXVnZSBmcm9tICcuL1ByZXNzdXJlR2F1Z2UuanMnO1xyXG5pbXBvcnQgUHJlc3N1cmVNb2RlbCBmcm9tICcuL1ByZXNzdXJlTW9kZWwuanMnO1xyXG5pbXBvcnQgVGVtcGVyYXR1cmVNb2RlbCBmcm9tICcuL1RlbXBlcmF0dXJlTW9kZWwuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBsZWZ0V2FsbERvZXNXb3JrPzogYm9vbGVhbjsgLy8gZG9lcyB0aGUgY29udGFpbmVyJ3MgbGVmdCB3YWxsIGRvIHdvcmsgb24gcGFydGljbGVzP1xyXG4gIGhvbGRDb25zdGFudD86IEhvbGRDb25zdGFudDtcclxuICBoYXNDb2xsaXNpb25Db3VudGVyPzogYm9vbGVhbjtcclxufTtcclxuXHJcbnR5cGUgSWRlYWxHYXNMYXdNb2RlbE9wdGlvbnMgPSBTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgT29wc0VtaXR0ZXJzID0ge1xyXG5cclxuICAvLyBPb3BzISBUZW1wZXJhdHVyZSBjYW5ub3QgYmUgaGVsZCBjb25zdGFudCB3aGVuIHRoZSBjb250YWluZXIgaXMgZW1wdHkuXHJcbiAgdGVtcGVyYXR1cmVFbXB0eUVtaXR0ZXI6IEVtaXR0ZXI7XHJcblxyXG4gIC8vIE9vcHMhIFRlbXBlcmF0dXJlIGNhbm5vdCBiZSBoZWxkIGNvbnN0YW50IHdoZW4gdGhlIGNvbnRhaW5lciBpcyBvcGVuLlxyXG4gIHRlbXBlcmF0dXJlT3BlbkVtaXR0ZXI6IEVtaXR0ZXI7XHJcblxyXG4gIC8vIE9vcHMhIFByZXNzdXJlIGNhbm5vdCBiZSBoZWxkIGNvbnN0YW50IHdoZW4gdGhlIGNvbnRhaW5lciBpcyBlbXB0eS5cclxuICBwcmVzc3VyZUVtcHR5RW1pdHRlcjogRW1pdHRlcjtcclxuXHJcbiAgLy8gT29wcyEgUHJlc3N1cmUgY2Fubm90IGJlIGhlbGQgY29uc3RhbnQuIFZvbHVtZSB3b3VsZCBiZSB0b28gbGFyZ2UuXHJcbiAgcHJlc3N1cmVMYXJnZUVtaXR0ZXI6IEVtaXR0ZXI7XHJcblxyXG4gIC8vIE9vcHMhIFByZXNzdXJlIGNhbm5vdCBiZSBoZWxkIGNvbnN0YW50LiBWb2x1bWUgd291bGQgYmUgdG9vIHNtYWxsLlxyXG4gIHByZXNzdXJlU21hbGxFbWl0dGVyOiBFbWl0dGVyO1xyXG5cclxuICAvLyBPb3BzISBNYXhpbXVtIHRlbXBlcmF0dXJlIHJlYWNoZWRcclxuICBtYXhpbXVtVGVtcGVyYXR1cmVFbWl0dGVyOiBFbWl0dGVyO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSWRlYWxHYXNMYXdNb2RlbCBleHRlbmRzIEJhc2VNb2RlbCB7XHJcblxyXG4gIC8vIHRoZSBxdWFudGl0eSB0byBob2xkIGNvbnN0YW50XHJcbiAgcHVibGljIHJlYWRvbmx5IGhvbGRDb25zdGFudFByb3BlcnR5OiBTdHJpbmdVbmlvblByb3BlcnR5PEhvbGRDb25zdGFudD47XHJcblxyXG4gIC8vIFRoZSBmYWN0b3IgdG8gaGVhdCBvciBjb29sIHRoZSBjb250ZW50cyBvZiB0aGUgY29udGFpbmVyLlxyXG4gIC8vIFNlZSBIZWF0ZXJDb29sZXJOb2RlOiAxIGlzIG1heCBoZWF0LCAtMSBpcyBtYXggY29vbCwgMCBpcyBubyBjaGFuZ2UuXHJcbiAgcHVibGljIHJlYWRvbmx5IGhlYXRDb29sRmFjdG9yUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG5cclxuICAvLyB3aGV0aGVyIHBhcnRpY2xlLXBhcnRpY2xlIGNvbGxpc2lvbnMgYXJlIGVuYWJsZWRcclxuICBwdWJsaWMgcmVhZG9ubHkgcGFydGljbGVQYXJ0aWNsZUNvbGxpc2lvbnNFbmFibGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgY29udGFpbmVyOiBJZGVhbEdhc0xhd0NvbnRhaW5lcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgcGFydGljbGVTeXN0ZW06IFBhcnRpY2xlU3lzdGVtO1xyXG5cclxuICAvLyBzdWItbW9kZWwgcmVzcG9uc2libGUgZm9yIHRlbXBlcmF0dXJlIFRcclxuICBwdWJsaWMgcmVhZG9ubHkgdGVtcGVyYXR1cmVNb2RlbDogVGVtcGVyYXR1cmVNb2RlbDtcclxuXHJcbiAgLy8gc3ViLW1vZGVsIHJlc3BvbnNpYmxlIGZvciBwcmVzc3VyZSBQXHJcbiAgcHVibGljIHJlYWRvbmx5IHByZXNzdXJlTW9kZWw6IFByZXNzdXJlTW9kZWw7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBjb2xsaXNpb25EZXRlY3RvcjogQ29sbGlzaW9uRGV0ZWN0b3I7XHJcbiAgcHVibGljIHJlYWRvbmx5IGNvbGxpc2lvbkNvdW50ZXI6IENvbGxpc2lvbkNvdW50ZXIgfCBudWxsO1xyXG5cclxuICAvLyBFbWl0dGVycyBmb3IgY29uZGl0aW9ucyByZWxhdGVkIHRvIHRoZSAnSG9sZCBDb25zdGFudCcgZmVhdHVyZS5cclxuICAvLyBXaGVuIGhvbGRpbmcgYSBxdWFudGl0eSBjb25zdGFudCB3b3VsZCBicmVhayB0aGUgbW9kZWwsIHRoZSBtb2RlbCBzd2l0Y2hlcyB0byAnTm90aGluZycgbW9kZSwgdGhlIG1vZGVsXHJcbiAgLy8gbm90aWZpZXMgdGhlIHZpZXcgdmlhIGFuIEVtaXR0ZXIsIGFuZCB0aGUgdmlldyBub3RpZmllcyB0aGUgdXNlciB2aWEgYSBkaWFsb2cuIFRoaXMgaXMgY2FsbGVkIG9vcHNFbWl0dGVyc1xyXG4gIC8vIGJlY2F1c2UgdGhlIGVuZCByZXN1bHQgaXMgdGhhdCB0aGUgdXNlciBzZWVzIGFuIE9vcHNEaWFsb2csIHdpdGggYSBtZXNzYWdlIG9mIHRoZSBmb3JtICdPb3BzISBibGFoIGJsYWgnLlxyXG4gIC8vIEl0IHdhcyBkaWZmaWN1bHQgdG8gZmluZCBuYW1lcyBmb3IgdGhlc2UgRW1pdHRlcnMgdGhhdCB3ZXJlbid0IG92ZXJseSB2ZXJib3NlLCBzbyB0aGUgbmFtZXMgYXJlXHJcbiAgLy8gaGlnaGx5LWFiYnJldmlhdGVkIHZlcnNpb25zIG9mIHRoZSBtZXNzYWdlcyB0aGF0IHRoZSB1c2VyIHdpbGwgc2VlLCBhbmQgdGhleSBhcmUgZ3JvdXBlZCBpbiBhbiBvYmplY3RcclxuICAvLyBuYW1lZCBvb3BzRW1pdHRlcnMuXHJcbiAgcHVibGljIHJlYWRvbmx5IG9vcHNFbWl0dGVyczogT29wc0VtaXR0ZXJzO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtLCBwcm92aWRlZE9wdGlvbnM/OiBJZGVhbEdhc0xhd01vZGVsT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPElkZWFsR2FzTGF3TW9kZWxPcHRpb25zLCBTZWxmT3B0aW9ucywgQmFzZU1vZGVsT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgbGVmdFdhbGxEb2VzV29yazogZmFsc2UsXHJcbiAgICAgIGhvbGRDb25zdGFudDogJ25vdGhpbmcnLFxyXG4gICAgICBoYXNDb2xsaXNpb25Db3VudGVyOiB0cnVlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggdGFuZGVtICk7XHJcblxyXG4gICAgdGhpcy5ob2xkQ29uc3RhbnRQcm9wZXJ0eSA9IG5ldyBTdHJpbmdVbmlvblByb3BlcnR5KCBvcHRpb25zLmhvbGRDb25zdGFudCwge1xyXG4gICAgICB2YWxpZFZhbHVlczogSG9sZENvbnN0YW50VmFsdWVzLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdob2xkQ29uc3RhbnRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2RldGVybWluZXMgd2hpY2ggcXVhbnRpdHkgd2lsbCBiZSBoZWxkIGNvbnN0YW50J1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuaGVhdENvb2xGYWN0b3JQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAtMSwgMSApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdoZWF0Q29vbEZhY3RvclByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIGFtb3VudCBvZiBoZWF0IG9yIGNvb2wgYXBwbGllZCB0byBwYXJ0aWNsZXMgaW4gdGhlIGNvbnRhaW5lci4gJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICctMSBpcyBtYXhpbXVtIGNvb2xpbmcsICsxIGlzIG1heGltdW0gaGVhdCwgMCBpcyBvZmYnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5wYXJ0aWNsZVBhcnRpY2xlQ29sbGlzaW9uc0VuYWJsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGFydGljbGVQYXJ0aWNsZUNvbGxpc2lvbnNFbmFibGVkUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdkZXRlcm1pbmVzIHdoZXRoZXIgY29sbGlzaW9ucyBiZXR3ZWVuIHBhcnRpY2xlcyBhcmUgZW5hYmxlZCdcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmNvbnRhaW5lciA9IG5ldyBJZGVhbEdhc0xhd0NvbnRhaW5lcigge1xyXG4gICAgICBsZWZ0V2FsbERvZXNXb3JrOiBvcHRpb25zLmxlZnRXYWxsRG9lc1dvcmssXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbnRhaW5lcicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucGFydGljbGVTeXN0ZW0gPSBuZXcgUGFydGljbGVTeXN0ZW0oXHJcbiAgICAgICgpID0+IHRoaXMudGVtcGVyYXR1cmVNb2RlbC5nZXRJbml0aWFsVGVtcGVyYXR1cmUoKSxcclxuICAgICAgdGhpcy5wYXJ0aWNsZVBhcnRpY2xlQ29sbGlzaW9uc0VuYWJsZWRQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5jb250YWluZXIucGFydGljbGVFbnRyeVBvc2l0aW9uLFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGFydGljbGVTeXN0ZW0nIClcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy50ZW1wZXJhdHVyZU1vZGVsID0gbmV3IFRlbXBlcmF0dXJlTW9kZWwoXHJcbiAgICAgIHRoaXMucGFydGljbGVTeXN0ZW0ubnVtYmVyT2ZQYXJ0aWNsZXNQcm9wZXJ0eSwgLy8gTlxyXG4gICAgICAoKSA9PiB0aGlzLnBhcnRpY2xlU3lzdGVtLmdldEF2ZXJhZ2VLaW5ldGljRW5lcmd5KCksIC8vIEtFXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0ZW1wZXJhdHVyZU1vZGVsJyApXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMucHJlc3N1cmVNb2RlbCA9IG5ldyBQcmVzc3VyZU1vZGVsKFxyXG4gICAgICB0aGlzLmhvbGRDb25zdGFudFByb3BlcnR5LFxyXG4gICAgICB0aGlzLnBhcnRpY2xlU3lzdGVtLm51bWJlck9mUGFydGljbGVzUHJvcGVydHksIC8vIE5cclxuICAgICAgdGhpcy5jb250YWluZXIudm9sdW1lUHJvcGVydHksIC8vIFZcclxuICAgICAgdGhpcy50ZW1wZXJhdHVyZU1vZGVsLnRlbXBlcmF0dXJlUHJvcGVydHksIC8vIFRcclxuICAgICAgKCkgPT4geyB0aGlzLmNvbnRhaW5lci5ibG93TGlkT2ZmKCk7IH0sXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwcmVzc3VyZU1vZGVsJyApXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuY29sbGlzaW9uRGV0ZWN0b3IgPSBuZXcgQ29sbGlzaW9uRGV0ZWN0b3IoXHJcbiAgICAgIHRoaXMuY29udGFpbmVyLFxyXG4gICAgICB0aGlzLnBhcnRpY2xlU3lzdGVtLmluc2lkZVBhcnRpY2xlQXJyYXlzLFxyXG4gICAgICB0aGlzLnBhcnRpY2xlUGFydGljbGVDb2xsaXNpb25zRW5hYmxlZFByb3BlcnR5XHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuY29sbGlzaW9uQ291bnRlciA9IG51bGw7XHJcbiAgICBpZiAoIG9wdGlvbnMuaGFzQ29sbGlzaW9uQ291bnRlciApIHtcclxuICAgICAgdGhpcy5jb2xsaXNpb25Db3VudGVyID0gbmV3IENvbGxpc2lvbkNvdW50ZXIoIHRoaXMuY29sbGlzaW9uRGV0ZWN0b3IsIHtcclxuICAgICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDQwLCAxNSApLCAvLyB2aWV3IGNvb3JkaW5hdGVzISBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29sbGlzaW9uQ291bnRlcicgKSxcclxuICAgICAgICB2aXNpYmxlOiB0cnVlXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB0aGUgY29udGFpbmVyJ3Mgd2lkdGggY2hhbmdlcyB3aGlsZSB0aGUgc2ltIGlzIHBhdXNlZCwgYW5kIGl0J3Mgbm90IGR1ZSB0byB0aGUgdXNlclxyXG4gICAgLy8gcmVzaXppbmcgdGhlIGNvbnRhaW5lciwgdGhlbiB1cGRhdGUgaW1tZWRpYXRlbHkuIFNlZSAjMTI1LlxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgWyB0aGlzLmNvbnRhaW5lci53aWR0aFByb3BlcnR5LCB0aGlzLmNvbnRhaW5lci51c2VySXNBZGp1c3RpbmdXaWR0aFByb3BlcnR5IF0sXHJcbiAgICAgICggd2lkdGgsIHVzZXJJc0FkanVzdGluZ1dpZHRoICkgPT4ge1xyXG4gICAgICAgIGlmICggIXVzZXJJc0FkanVzdGluZ1dpZHRoICYmICF0aGlzLmlzUGxheWluZ1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVXaGVuUGF1c2VkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5vb3BzRW1pdHRlcnMgPSB7XHJcbiAgICAgIHRlbXBlcmF0dXJlRW1wdHlFbWl0dGVyOiBuZXcgRW1pdHRlcigpLFxyXG4gICAgICB0ZW1wZXJhdHVyZU9wZW5FbWl0dGVyOiBuZXcgRW1pdHRlcigpLFxyXG4gICAgICBwcmVzc3VyZUVtcHR5RW1pdHRlcjogbmV3IEVtaXR0ZXIoKSxcclxuICAgICAgcHJlc3N1cmVMYXJnZUVtaXR0ZXI6IG5ldyBFbWl0dGVyKCksXHJcbiAgICAgIHByZXNzdXJlU21hbGxFbWl0dGVyOiBuZXcgRW1pdHRlcigpLFxyXG4gICAgICBtYXhpbXVtVGVtcGVyYXR1cmVFbWl0dGVyOiBuZXcgRW1pdHRlcigpXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIG51bWJlciBvZiBwYXJ0aWNsZXMgaW4gdGhlIGNvbnRhaW5lciBjaGFuZ2VzIC4uLlxyXG4gICAgdGhpcy5wYXJ0aWNsZVN5c3RlbS5udW1iZXJPZlBhcnRpY2xlc1Byb3BlcnR5LmxpbmsoIG51bWJlck9mUGFydGljbGVzID0+IHtcclxuXHJcbiAgICAgIC8vIElmIHRoZSBjb250YWluZXIgaXMgZW1wdHksIGNoZWNrIGZvciAnSG9sZCBDb25zdGFudCcgY29uZGl0aW9ucyB0aGF0IGNhbid0IGJlIHNhdGlzZmllZC5cclxuICAgICAgaWYgKCBudW1iZXJPZlBhcnRpY2xlcyA9PT0gMCApIHtcclxuICAgICAgICBpZiAoIHRoaXMuaG9sZENvbnN0YW50UHJvcGVydHkudmFsdWUgPT09ICd0ZW1wZXJhdHVyZScgKSB7XHJcblxyXG4gICAgICAgICAgLy8gVGVtcGVyYXR1cmUgY2FuJ3QgYmUgaGVsZCBjb25zdGFudCB3aGVuIHRoZSBjb250YWluZXIgaXMgZW1wdHkuXHJcbiAgICAgICAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggJ09vcHMhIFQgY2Fubm90IGJlIGhlbGQgY29uc3RhbnQgd2hlbiBOPTAnICk7XHJcbiAgICAgICAgICB0aGlzLmhvbGRDb25zdGFudFByb3BlcnR5LnZhbHVlID0gJ25vdGhpbmcnO1xyXG4gICAgICAgICAgdGhpcy5vb3BzRW1pdHRlcnMudGVtcGVyYXR1cmVFbXB0eUVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggdGhpcy5ob2xkQ29uc3RhbnRQcm9wZXJ0eS52YWx1ZSA9PT0gJ3ByZXNzdXJlVCcgfHxcclxuICAgICAgICAgICAgICAgICAgdGhpcy5ob2xkQ29uc3RhbnRQcm9wZXJ0eS52YWx1ZSA9PT0gJ3ByZXNzdXJlVicgKSB7XHJcblxyXG4gICAgICAgICAgLy8gUHJlc3N1cmUgY2FuJ3QgYmUgaGVsZCBjb25zdGFudCB3aGVuIHRoZSBjb250YWluZXIgaXMgZW1wdHkuXHJcbiAgICAgICAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggJ09vcHMhIFAgY2Fubm90IGJlIGhlbGQgY29uc3RhbnQgd2hlbiBOPTAnICk7XHJcbiAgICAgICAgICB0aGlzLmhvbGRDb25zdGFudFByb3BlcnR5LnZhbHVlID0gJ25vdGhpbmcnO1xyXG4gICAgICAgICAgdGhpcy5vb3BzRW1pdHRlcnMucHJlc3N1cmVFbXB0eUVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgdGhlIG51bWJlciBvZiBwYXJ0aWNsZXMgY2hhbmdlcyB3aGlsZSB0aGUgc2ltIGlzIHBhdXNlZCwgdXBkYXRlIGltbWVkaWF0ZWx5LlxyXG4gICAgICAvLyBEbyB0aGlzIGFmdGVyIGNoZWNraW5nIGhvbGRDb25zdGFudFByb3BlcnR5LCBpbiBjYXNlIGl0IGdldHMgc3dpdGNoZWQgdG8gSG9sZENvbnN0YW50ICdub3RoaW5nJy5cclxuICAgICAgaWYgKCAhdGhpcy5pc1BsYXlpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVdoZW5QYXVzZWQoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRlbXBlcmF0dXJlIGNhbid0IGJlIGhlbGQgY29uc3RhbnQgd2hlbiB0aGUgY29udGFpbmVyIGlzIG9wZW4sIGJlY2F1c2Ugd2UgZG9uJ3Qgd2FudCB0byBkZWFsIHdpdGhcclxuICAgIC8vIGNvdW50ZXJhY3RpbmcgZXZhcG9yYXRpdmUgY29vbGluZy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9nYXMtcHJvcGVydGllcy9pc3N1ZXMvMTU5XHJcbiAgICB0aGlzLmNvbnRhaW5lci5pc09wZW5Qcm9wZXJ0eS5saW5rKCBpc09wZW4gPT4ge1xyXG4gICAgICBpZiAoIGlzT3BlbiAmJiB0aGlzLmhvbGRDb25zdGFudFByb3BlcnR5LnZhbHVlID09PSAndGVtcGVyYXR1cmUnICkge1xyXG4gICAgICAgIHBoZXQubG9nICYmIHBoZXQubG9nKCAnT29wcyEgVCBjYW5ub3QgYmUgaGVsZCBjb25zdGFudCB3aGVuIHRoZSBjb250YWluZXIgaXMgb3BlbicgKTtcclxuICAgICAgICB0aGlzLmhvbGRDb25zdGFudFByb3BlcnR5LnZhbHVlID0gJ25vdGhpbmcnO1xyXG4gICAgICAgIHRoaXMub29wc0VtaXR0ZXJzLnRlbXBlcmF0dXJlT3BlbkVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgbnVtYmVyIG9mIHBhcnRpY2xlcyAoTikgaXMgZGVjcmVhc2VkIHdoaWxlIGhvbGRpbmcgdGVtcGVyYXR1cmUgKFQpIGNvbnN0YW50LCBhZGp1c3QgdGhlIHNwZWVkIG9mXHJcbiAgICAvLyBwYXJ0aWNsZXMgdG8gcmVzdWx0IGluIHRoZSBkZXNpcmVkIHRlbXBlcmF0dXJlLiAgV2Ugb25seSBuZWVkIHRvIGRvIHRoaXMgd2hlbiBOIGRlY3JlYXNlcyBiZWNhdXNlIHBhcnRpY2xlc1xyXG4gICAgLy8gdGhhdCBhcmUgYWRkZWQgaGF2ZSB0aGVpciBpbml0aWFsIHNwZWVkIHNldCBiYXNlZCBvbiBUIG9mIHRoZSBjb250YWluZXIsIGFuZCB0aGVyZWZvcmUgcmVzdWx0IGluIG5vIGNoYW5nZVxyXG4gICAgLy8gdG8gVC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9nYXMtcHJvcGVydGllcy9pc3N1ZXMvMTU5XHJcbiAgICB0aGlzLnBhcnRpY2xlU3lzdGVtLm51bWJlck9mUGFydGljbGVzUHJvcGVydHkubGluayggKCBudW1iZXJPZlBhcnRpY2xlcywgcHJldmlvdXNOdW1iZXJPZlBhcnRpY2xlcyApID0+IHtcclxuICAgICAgaWYgKCBwcmV2aW91c051bWJlck9mUGFydGljbGVzICE9PSBudWxsICYmXHJcbiAgICAgICAgICAgbnVtYmVyT2ZQYXJ0aWNsZXMgPiAwICYmXHJcbiAgICAgICAgICAgbnVtYmVyT2ZQYXJ0aWNsZXMgPCBwcmV2aW91c051bWJlck9mUGFydGljbGVzICYmXHJcbiAgICAgICAgICAgdGhpcy5ob2xkQ29uc3RhbnRQcm9wZXJ0eS52YWx1ZSA9PT0gJ3RlbXBlcmF0dXJlJyApIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy50ZW1wZXJhdHVyZU1vZGVsLmNvbnRyb2xUZW1wZXJhdHVyZUVuYWJsZWRQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICAgICd0aGlzIGZlYXR1cmUgaXMgbm90IGNvbXBhdGlibGUgd2l0aCB1c2VyLWNvbnRyb2xsZWQgcGFydGljbGUgdGVtcGVyYXR1cmUnICk7XHJcblxyXG4gICAgICAgIC8vIFdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9nYXMtcHJvcGVydGllcy9pc3N1ZXMvMTY4LiBBZGRyZXNzZXMgYW4gb3JkZXJpbmcgcHJvYmxlbSB3aGVyZVxyXG4gICAgICAgIC8vIHRoZSB0ZW1wZXJhdHVyZSBtb2RlbCBuZWVkcyB0byB1cGRhdGUgd2hlbiB0aGlzIHN0YXRlIG9jY3VycywgYnV0IGl0J3Mgc3RpbGwgbnVsbC4gVGVtcGVyYXR1cmUgaXMgbnVsbFxyXG4gICAgICAgIC8vIHdoZW4gdGhlIGNvbnRhaW5lciBpcyBlbXB0eS5cclxuICAgICAgICBpZiAoIHRoaXMudGVtcGVyYXR1cmVNb2RlbC50ZW1wZXJhdHVyZVByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgICAgICAgdGhpcy50ZW1wZXJhdHVyZU1vZGVsLnVwZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdGVtcGVyYXR1cmUgPSB0aGlzLnRlbXBlcmF0dXJlTW9kZWwudGVtcGVyYXR1cmVQcm9wZXJ0eS52YWx1ZSE7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGVtcGVyYXR1cmUgIT09IG51bGwgKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZVN5c3RlbS5zZXRUZW1wZXJhdHVyZSggdGVtcGVyYXR1cmUgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFZlcmlmeSB0aGF0IHdlJ3JlIG5vdCBpbiBhIGJhZCAnSG9sZCBDb25zdGFudCcgc3RhdGUuXHJcbiAgICBhc3NlcnQgJiYgdGhpcy5ob2xkQ29uc3RhbnRQcm9wZXJ0eS5saW5rKCBob2xkQ29uc3RhbnQgPT4ge1xyXG5cclxuICAgICAgLy8gdmFsdWVzIHRoYXQgYXJlIGluY29tcGF0aWJsZSB3aXRoIGFuIGVtcHR5IGNvbnRhaW5lclxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhKCB0aGlzLnBhcnRpY2xlU3lzdGVtLm51bWJlck9mUGFydGljbGVzUHJvcGVydHkudmFsdWUgPT09IDAgJiZcclxuICAgICAgKCBob2xkQ29uc3RhbnQgPT09ICd0ZW1wZXJhdHVyZScgfHxcclxuICAgICAgICBob2xkQ29uc3RhbnQgPT09ICdwcmVzc3VyZVQnIHx8XHJcbiAgICAgICAgaG9sZENvbnN0YW50ID09PSAncHJlc3N1cmVWJyApICksXHJcbiAgICAgICAgYGJhZCBob2xkQ29uc3RhbnQgc3RhdGU6ICR7aG9sZENvbnN0YW50fSB3aXRoIG51bWJlck9mUGFydGljbGVzPSR7dGhpcy5wYXJ0aWNsZVN5c3RlbS5udW1iZXJPZlBhcnRpY2xlc1Byb3BlcnR5LnZhbHVlfWAgKTtcclxuXHJcbiAgICAgIC8vIHZhbHVlcyB0aGF0IGFyZSBpbmNvbXBhdGlibGUgd2l0aCB6ZXJvIHByZXNzdXJlXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICEoIHRoaXMucHJlc3N1cmVNb2RlbC5wcmVzc3VyZVByb3BlcnR5LnZhbHVlID09PSAwICYmXHJcbiAgICAgICggaG9sZENvbnN0YW50ID09PSAncHJlc3N1cmVWJyB8fFxyXG4gICAgICAgIGhvbGRDb25zdGFudCA9PT0gJ3ByZXNzdXJlVCcgKSApLFxyXG4gICAgICAgIGBiYWQgaG9sZENvbnN0YW50IHN0YXRlOiAke2hvbGRDb25zdGFudH0gd2l0aCBwcmVzc3VyZT0ke3RoaXMucHJlc3N1cmVNb2RlbC5wcmVzc3VyZVByb3BlcnR5LnZhbHVlfWAgKTtcclxuICAgIH0sIHtcclxuXHJcbiAgICAgIC8vIFRoZXNlIHZhbHVlcyBuZWVkIHRvIGJlIGNvcnJlY3QgYmVmb3JlIHRoaXMgbGlzdGVuZXIgZmlyZXMuICBUaGlzIGlzIG5vdCBhbiBpc3N1ZSB3aGVuIHRoZSBzaW0gaXMgcnVubmluZyxcclxuICAgICAgLy8gYnV0IGlzIHJlbGV2YW50IHdoZW4gUGhFVC1pTyByZXN0b3JlcyBzdGF0ZS4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ2FzLXByb3BlcnRpZXMvaXNzdWVzLzE4Mi5cclxuICAgICAgcGhldGlvRGVwZW5kZW5jaWVzOiBbXHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZVN5c3RlbS5udW1iZXJPZlBhcnRpY2xlc1Byb3BlcnR5LFxyXG4gICAgICAgIHRoaXMucHJlc3N1cmVNb2RlbC5wcmVzc3VyZVByb3BlcnR5XHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgcmVzZXQoKTogdm9pZCB7XHJcbiAgICBzdXBlci5yZXNldCgpO1xyXG5cclxuICAgIC8vIFByb3BlcnRpZXNcclxuICAgIHRoaXMuaG9sZENvbnN0YW50UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaGVhdENvb2xGYWN0b3JQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wYXJ0aWNsZVBhcnRpY2xlQ29sbGlzaW9uc0VuYWJsZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIC8vIG1vZGVsIGVsZW1lbnRzXHJcbiAgICB0aGlzLmNvbnRhaW5lci5yZXNldCgpO1xyXG4gICAgdGhpcy5wYXJ0aWNsZVN5c3RlbS5yZXNldCgpO1xyXG4gICAgdGhpcy50ZW1wZXJhdHVyZU1vZGVsLnJlc2V0KCk7XHJcbiAgICB0aGlzLnByZXNzdXJlTW9kZWwucmVzZXQoKTtcclxuICAgIHRoaXMuY29sbGlzaW9uQ291bnRlciAmJiB0aGlzLmNvbGxpc2lvbkNvdW50ZXIucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIHRoZSBtb2RlbCB1c2luZyBtb2RlbCB0aW1lIHVuaXRzLiBPcmRlciBpcyB2ZXJ5IGltcG9ydGFudCBoZXJlIVxyXG4gICAqIEBwYXJhbSBkdCAtIHRpbWUgZGVsdGEsIGluIHBzXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIHN0ZXBNb2RlbFRpbWUoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkdCA+IDAsIGBpbnZhbGlkIGR0OiAke2R0fWAgKTtcclxuXHJcbiAgICBzdXBlci5zdGVwTW9kZWxUaW1lKCBkdCApO1xyXG5cclxuICAgIC8vIHN0ZXAgdGhlIHN5c3RlbVxyXG4gICAgdGhpcy5zdGVwU3lzdGVtKCBkdCApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGluZ3MgdGhhdCBhcmUgZGVwZW5kZW50IG9uIHRoZSBzdGF0ZSBvZiB0aGUgc3lzdGVtXHJcbiAgICB0aGlzLnVwZGF0ZU1vZGVsKCBkdCwgdGhpcy5jb2xsaXNpb25EZXRlY3Rvci5udW1iZXJPZlBhcnRpY2xlQ29udGFpbmVyQ29sbGlzaW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcHMgdGhlIHRoaW5ncyB0aGF0IGFmZmVjdCB0aGUgY29udGFpbmVyIGFuZCBwYXJ0aWNsZSBzeXN0ZW0sIGluY2x1ZGluZyBoZWF0aW5nL2Nvb2xpbmdcclxuICAgKiBhbmQgY29sbGlzaW9uIGRldGVjdGlvbi9yZXNwb25zZS4gT3JkZXIgaXMgdmVyeSBpbXBvcnRhbnQgaGVyZSFcclxuICAgKiBAcGFyYW0gZHQgLSB0aW1lIGRlbHRhLCBpbiBwc1xyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RlcFN5c3RlbSggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGR0ID4gMCwgYGludmFsaWQgZHQ6ICR7ZHR9YCApO1xyXG5cclxuICAgIC8vIEFwcGx5IGhlYXQvY29vbFxyXG4gICAgdGhpcy5wYXJ0aWNsZVN5c3RlbS5oZWF0Q29vbCggdGhpcy5oZWF0Q29vbEZhY3RvclByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgLy8gU3RlcCBwYXJ0aWNsZXNcclxuICAgIHRoaXMucGFydGljbGVTeXN0ZW0uc3RlcCggZHQgKTtcclxuXHJcbiAgICAvLyBBbGxvdyBwYXJ0aWNsZXMgdG8gZXNjYXBlIGZyb20gdGhlIG9wZW5pbmcgaW4gdGhlIHRvcCBvZiB0aGUgY29udGFpbmVyXHJcbiAgICB0aGlzLnBhcnRpY2xlU3lzdGVtLmVzY2FwZVBhcnRpY2xlcyggdGhpcy5jb250YWluZXIgKTtcclxuXHJcbiAgICAvLyBTdGVwIGNvbnRhaW5lciwgdG8gYW5pbWF0ZSByZXNpemluZyBvZiBsZWZ0IHdhbGwgYW5kIGNvbXB1dGUgdmVsb2NpdHkgb2YgbGVmdCB3YWxsLlxyXG4gICAgdGhpcy5jb250YWluZXIuc3RlcCggZHQgKTtcclxuXHJcbiAgICAvLyBDb2xsaXNpb24gZGV0ZWN0aW9uIGFuZCByZXNwb25zZVxyXG4gICAgdGhpcy5jb2xsaXNpb25EZXRlY3Rvci51cGRhdGUoKTtcclxuXHJcbiAgICAvLyBSZW1vdmUgcGFydGljbGVzIHRoYXQgaGF2ZSBsZWZ0IHRoZSBtb2RlbCBib3VuZHNcclxuICAgIHRoaXMucGFydGljbGVTeXN0ZW0ucmVtb3ZlUGFydGljbGVzT3V0T2ZCb3VuZHMoIHRoaXMubW9kZWxCb3VuZHNQcm9wZXJ0eS52YWx1ZSApO1xyXG5cclxuICAgIC8vIERvIHRoaXMgYWZ0ZXIgY29sbGlzaW9uIGRldGVjdGlvbiwgc28gdGhhdCB0aGUgbnVtYmVyIG9mIGNvbGxpc2lvbnMgZGV0ZWN0ZWQgaGFzIGJlZW4gcmVjb3JkZWQuXHJcbiAgICB0aGlzLmNvbGxpc2lvbkNvdW50ZXIgJiYgdGhpcy5jb2xsaXNpb25Db3VudGVyLnN0ZXAoIGR0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHBhcnRzIG9mIHRoZSBtb2RlbCB0aGF0IGFyZSBkZXBlbmRlbnQgb24gdGhlIHN0YXRlIG9mIHRoZSBwYXJ0aWNsZSBzeXN0ZW0uICBUaGlzIGlzIHNlcGFyYXRlZCBmcm9tXHJcbiAgICogc3RlcFN5c3RlbSBzbyB0aGF0IHdlIGNhbiB1cGRhdGUgaWYgdGhlIG51bWJlciBvZiBwYXJ0aWNsZXMgY2hhbmdlcyB3aGlsZSB0aGUgc2ltdWxhdGlvbiBpcyBwYXVzZWQuXHJcbiAgICogT3JkZXIgaXMgdmVyeSBpbXBvcnRhbnQgaGVyZSFcclxuICAgKiBAcGFyYW0gZHRQcmVzc3VyZUdhdWdlIC0gdGltZSBkZWx0YSB1c2VkIHRvIHN0ZXAgdGhlIHByZXNzdXJlIGdhdWdlLCBpbiBwc1xyXG4gICAqIEBwYXJhbSBudW1iZXJPZkNvbGxpc2lvbnMgLSBudW1iZXIgb2YgY29sbGlzaW9ucyBvbiB0aGUgbW9zdCByZWNlbnQgdGltZSBzdGVwXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB1cGRhdGVNb2RlbCggZHRQcmVzc3VyZUdhdWdlOiBudW1iZXIsIG51bWJlck9mQ29sbGlzaW9uczogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZHRQcmVzc3VyZUdhdWdlID4gMCwgYGludmFsaWQgZHRQcmVzc3VyZUdhdWdlOiAke2R0UHJlc3N1cmVHYXVnZX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBudW1iZXJPZkNvbGxpc2lvbnMgPj0gMCwgYGludmFsaWQgbnVtYmVyT2ZDb2xsaXNpb25zOiAke251bWJlck9mQ29sbGlzaW9uc31gICk7XHJcblxyXG4gICAgLy8gQWRqdXN0IHF1YW50aXRpZXMgdG8gY29tcGVuc2F0ZSBmb3IgJ0hvbGQgQ29uc3RhbnQnIG1vZGUuIERvIHRoaXMgYmVmb3JlIGNvbXB1dGluZyB0ZW1wZXJhdHVyZSBvciBwcmVzc3VyZS5cclxuICAgIHRoaXMuY29tcGVuc2F0ZUZvckhvbGRDb25zdGFudCgpO1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0ZW1wZXJhdHVyZS4gRG8gdGhpcyBiZWZvcmUgcHJlc3N1cmUsIGJlY2F1c2UgcHJlc3N1cmUgZGVwZW5kcyBvbiB0ZW1wZXJhdHVyZS5cclxuICAgIHRoaXMudGVtcGVyYXR1cmVNb2RlbC51cGRhdGUoKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgcHJlc3N1cmUuXHJcbiAgICB0aGlzLnByZXNzdXJlTW9kZWwudXBkYXRlKCBkdFByZXNzdXJlR2F1Z2UsIG51bWJlck9mQ29sbGlzaW9ucyApO1xyXG5cclxuICAgIC8vIERvIHRoaXMgbGFzdC5cclxuICAgIHRoaXMudmVyaWZ5TW9kZWwoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgd2hlbiB0aGUgc2ltIGlzIHBhdXNlZC5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgdXBkYXRlV2hlblBhdXNlZCgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzUGxheWluZ1Byb3BlcnR5LnZhbHVlLCAnY2FsbCB0aGlzIG1ldGhvZCBvbmx5IHdoZW4gcGF1c2VkJyApO1xyXG5cclxuICAgIC8vIFVzaW5nIHRoZSBwcmVzc3VyZSBnYXVnZSdzIHJlZnJlc2ggcGVyaW9kIGNhdXNlcyBpdCB0byB1cGRhdGUgaW1tZWRpYXRlbHkuXHJcbiAgICB0aGlzLnVwZGF0ZU1vZGVsKCBQcmVzc3VyZUdhdWdlLlJFRlJFU0hfUEVSSU9ELCAwIC8qIG51bWJlck9mQ29sbGlzaW9ucyAqLyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRqdXN0cyBxdWFudGl0aWVzIHRvIGNvbXBlbnNhdGUgZm9yIHRoZSBxdWFudGl0eSB0aGF0IGlzIGJlaW5nIGhlbGQgY29uc3RhbnQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjb21wZW5zYXRlRm9ySG9sZENvbnN0YW50KCk6IHZvaWQge1xyXG5cclxuICAgIGlmICggdGhpcy5ob2xkQ29uc3RhbnRQcm9wZXJ0eS52YWx1ZSA9PT0gJ3ByZXNzdXJlVicgKSB7XHJcblxyXG4gICAgICAvLyBob2xkIHByZXNzdXJlIGNvbnN0YW50IGJ5IGNoYW5naW5nIHZvbHVtZVxyXG4gICAgICBjb25zdCBwcmV2aW91c0NvbnRhaW5lcldpZHRoID0gdGhpcy5jb250YWluZXIud2lkdGhQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgIGxldCBjb250YWluZXJXaWR0aCA9IHRoaXMuY29tcHV0ZUlkZWFsVm9sdW1lKCkgLyAoIHRoaXMuY29udGFpbmVyLmhlaWdodCAqIHRoaXMuY29udGFpbmVyLmRlcHRoICk7XHJcblxyXG4gICAgICAvLyBBZGRyZXNzIGZsb2F0aW5nLXBvaW50IGVycm9yLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dhcy1wcm9wZXJ0aWVzL2lzc3Vlcy84OVxyXG4gICAgICBjb250YWluZXJXaWR0aCA9IFV0aWxzLnRvRml4ZWROdW1iZXIoIGNvbnRhaW5lcldpZHRoLCA1ICk7XHJcblxyXG4gICAgICAvLyBJZiB0aGUgZGVzaXJlZCBjb250YWluZXIgd2lkdGggaXMgb3V0IG9mIHJhbmdlIC4uLlxyXG4gICAgICBpZiAoICF0aGlzLmNvbnRhaW5lci53aWR0aFJhbmdlLmNvbnRhaW5zKCBjb250YWluZXJXaWR0aCApICkge1xyXG5cclxuICAgICAgICAvLyBTd2l0Y2ggdG8gdGhlICdOb3RoaW5nJyBtb2RlXHJcbiAgICAgICAgdGhpcy5ob2xkQ29uc3RhbnRQcm9wZXJ0eS52YWx1ZSA9ICdub3RoaW5nJztcclxuXHJcbiAgICAgICAgLy8gVGhpcyByZXN1bHRzIGluIGFuIE9vcHNEaWFsb2cgYmVpbmcgZGlzcGxheWVkXHJcbiAgICAgICAgcGhldC5sb2cgJiYgcGhldC5sb2coICdPb3BzISBQIGNhbm5vdCBiZSBoZWxkIGNvbnN0YW50IHdoZW4gViBleGNlZWRzIHJhbmdlLCAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYGNvbnRhaW5lcldpZHRoPSR7Y29udGFpbmVyV2lkdGh9IHdpZHRoUmFuZ2U9JHt0aGlzLmNvbnRhaW5lci53aWR0aFJhbmdlfWAgKTtcclxuICAgICAgICBpZiAoIGNvbnRhaW5lcldpZHRoID4gdGhpcy5jb250YWluZXIud2lkdGhSYW5nZS5tYXggKSB7XHJcbiAgICAgICAgICB0aGlzLm9vcHNFbWl0dGVycy5wcmVzc3VyZUxhcmdlRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5vb3BzRW1pdHRlcnMucHJlc3N1cmVTbWFsbEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29uc3RyYWluIHRoZSBjb250YWluZXIgd2lkdGggdG8gaXRzIG1pbiBvciBtYXguXHJcbiAgICAgICAgY29udGFpbmVyV2lkdGggPSB0aGlzLmNvbnRhaW5lci53aWR0aFJhbmdlLmNvbnN0cmFpblZhbHVlKCBjb250YWluZXJXaWR0aCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDaGFuZ2UgdGhlIGNvbnRhaW5lcidzIHdpZHRoIGltbWVkaWF0ZWx5LCB3aXRoIG5vIGFuaW1hdGlvbi5cclxuICAgICAgdGhpcy5jb250YWluZXIucmVzaXplSW1tZWRpYXRlbHkoIGNvbnRhaW5lcldpZHRoICk7XHJcblxyXG4gICAgICAvLyBSZWRpc3RyaWJ1dGUgcGFydGljbGVzIGluIHRoZSBuZXcgd2lkdGhcclxuICAgICAgdGhpcy5wYXJ0aWNsZVN5c3RlbS5yZWRpc3RyaWJ1dGVQYXJ0aWNsZXMoIGNvbnRhaW5lcldpZHRoIC8gcHJldmlvdXNDb250YWluZXJXaWR0aCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuaG9sZENvbnN0YW50UHJvcGVydHkudmFsdWUgPT09ICdwcmVzc3VyZVQnICkge1xyXG5cclxuICAgICAgLy8gSG9sZCBwcmVzc3VyZSBjb25zdGFudCBieSBhZGp1c3RpbmcgcGFydGljbGUgdmVsb2NpdGllcyB0byByZXN1bHQgaW4gYSBkZXNpcmVkIHRlbXBlcmF0dXJlLlxyXG4gICAgICBjb25zdCBkZXNpcmVkVGVtcGVyYXR1cmUgPSB0aGlzLmNvbXB1dGVJZGVhbFRlbXBlcmF0dXJlKCk7XHJcblxyXG4gICAgICB0aGlzLnBhcnRpY2xlU3lzdGVtLnNldFRlbXBlcmF0dXJlKCBkZXNpcmVkVGVtcGVyYXR1cmUgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggTWF0aC5hYnMoIGRlc2lyZWRUZW1wZXJhdHVyZSAtIHRoaXMuY29tcHV0ZUlkZWFsVGVtcGVyYXR1cmUoKSApIDwgMUUtMyxcclxuICAgICAgICAnYWN0dWFsIHRlbXBlcmF0dXJlIGRvZXMgbm90IG1hdGNoIGRlc2lyZWQgdGVtcGVyYXR1cmUnICk7XHJcblxyXG4gICAgICB0aGlzLnRlbXBlcmF0dXJlTW9kZWwudGVtcGVyYXR1cmVQcm9wZXJ0eS52YWx1ZSA9IGRlc2lyZWRUZW1wZXJhdHVyZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFZlcmlmeSB0aGF0IHRoZSBtb2RlbCBpcyBpbiBhIGdvb2Qgc3RhdGUgYWZ0ZXIgaGF2aW5nIGJlZW4gdXBkYXRlZC4gSWYgaXQncyBub3QsIGFkanVzdCBhY2NvcmRpbmdseS5cclxuICAgKi9cclxuICBwcml2YXRlIHZlcmlmeU1vZGVsKCk6IHZvaWQge1xyXG5cclxuICAgIGNvbnN0IHRlbXBlcmF0dXJlID0gdGhpcy50ZW1wZXJhdHVyZU1vZGVsLnRlbXBlcmF0dXJlUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgLy8gSWYgdGhlIG1heGltdW0gdGVtcGVyYXR1cmUgd2FzIGV4Y2VlZGVkLCByZXNldCB0aGUgc3RhdGUgb2YgdGhlIGNvbnRhaW5lci5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ2FzLXByb3BlcnRpZXMvaXNzdWVzLzEyOFxyXG4gICAgaWYgKCB0ZW1wZXJhdHVyZSAhPT0gbnVsbCAmJiB0ZW1wZXJhdHVyZSA+PSBHYXNQcm9wZXJ0aWVzUXVlcnlQYXJhbWV0ZXJzLm1heFRlbXBlcmF0dXJlICkge1xyXG5cclxuICAgICAgLy8gU3dpdGNoIHRvIGEgJ0hvbGQgQ29uc3RhbnQnIHNldHRpbmcgdGhhdCBzdXBwb3J0cyBhbiBlbXB0eSBjb250YWluZXJcclxuICAgICAgaWYgKCB0aGlzLmhvbGRDb25zdGFudFByb3BlcnR5LnZhbHVlICE9PSAnbm90aGluZycgJiZcclxuICAgICAgICAgICB0aGlzLmhvbGRDb25zdGFudFByb3BlcnR5LnZhbHVlICE9PSAndm9sdW1lJyApIHtcclxuICAgICAgICB0aGlzLmhvbGRDb25zdGFudFByb3BlcnR5LnZhbHVlID0gJ25vdGhpbmcnO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZW1vdmUgYWxsIHBhcnRpY2xlcy4gRG8gdGhpcyBhZnRlciBjaGFuZ2luZyBob2xkQ29uc3RhbnRQcm9wZXJ0eSwgc28gdGhhdCB0aGF0IHdlIGRvbid0IHRyaWdnZXJcclxuICAgICAgLy8gbXVsdGlwbGUgb29wc0VtaXR0ZXJzLiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9nYXMtcHJvcGVydGllcy9pc3N1ZXMvMTUwLlxyXG4gICAgICB0aGlzLnBhcnRpY2xlU3lzdGVtLnJlbW92ZUFsbFBhcnRpY2xlcygpO1xyXG5cclxuICAgICAgLy8gUHV0IHRoZSBsaWQgb24gdGhlIGNvbnRhaW5lclxyXG4gICAgICB0aGlzLmNvbnRhaW5lci5saWRJc09uUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gTm90aWZ5IGxpc3RlbmVycyB0aGF0IG1heGltdW0gdGVtcGVyYXR1cmUgd2FzIGV4Y2VlZGVkLlxyXG4gICAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggYE9vcHMhIE1heGltdW0gdGVtcGVyYXR1cmUgcmVhY2hlZDogJHt0aGlzLnRlbXBlcmF0dXJlTW9kZWwudGVtcGVyYXR1cmVQcm9wZXJ0eS52YWx1ZX1gICk7XHJcbiAgICAgIHRoaXMub29wc0VtaXR0ZXJzLm1heGltdW1UZW1wZXJhdHVyZUVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZXMgdm9sdW1lIGluIHBtXjMsIHVzaW5nIHRoZSBJZGVhbCBHYXMgTGF3LCBWID0gTmtUL1BcclxuICAgKiBUaGlzIGlzIHVzZWQgdG8gY29tcHV0ZSB0aGUgdm9sdW1lIG5lZWRlZCB0byBob2xkIHByZXNzdXJlIGNvbnN0YW50IGluIEhvbGRDb25zdGFudCAncHJlc3N1cmVWJyBtb2RlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY29tcHV0ZUlkZWFsVm9sdW1lKCk6IG51bWJlciB7XHJcblxyXG4gICAgY29uc3QgTiA9IHRoaXMucGFydGljbGVTeXN0ZW0ubnVtYmVyT2ZQYXJ0aWNsZXNQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IGsgPSBHYXNQcm9wZXJ0aWVzQ29uc3RhbnRzLkJPTFRaTUFOTjsgLy8gKHBtXjIgKiBBTVUpLyhwc14yICogSylcclxuICAgIGNvbnN0IFQgPSB0aGlzLnRlbXBlcmF0dXJlTW9kZWwuY29tcHV0ZVRlbXBlcmF0dXJlKCkgfHwgMDsgLy8gdGVtcGVyYXR1cmUgaGFzIG5vdCBiZWVuIHVwZGF0ZWQsIHNvIGNvbXB1dGUgaXRcclxuICAgIGNvbnN0IFAgPSB0aGlzLnByZXNzdXJlTW9kZWwucHJlc3N1cmVQcm9wZXJ0eS52YWx1ZSAvIEdhc1Byb3BlcnRpZXNDb25zdGFudHMuUFJFU1NVUkVfQ09OVkVSU0lPTl9TQ0FMRTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIFAgIT09IDAsICd6ZXJvIHByZXNzdXJlIG5vdCBzdXBwb3J0ZWQnICk7XHJcblxyXG4gICAgcmV0dXJuICggTiAqIGsgKiBUICkgLyBQO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZXMgdGhlIHRlbXBlcmF0dXJlIGluIEssIHVzaW5nIHRoZSBJZGVhbCBHYXMgTGF3LCBUID0gKFBWKS8oTmspXHJcbiAgICogVGhpcyBpcyB1c2VkIHRvIGNvbXB1dGUgdGhlIHRlbXBlcmF0dXJlIG5lZWRlZCB0byBob2xkIHByZXNzdXJlIGNvbnN0YW50IGluIEhvbGRDb25zdGFudCAncHJlc3N1cmVUJyBtb2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb21wdXRlSWRlYWxUZW1wZXJhdHVyZSgpOiBudW1iZXIge1xyXG5cclxuICAgIGNvbnN0IFAgPSB0aGlzLnByZXNzdXJlTW9kZWwucHJlc3N1cmVQcm9wZXJ0eS52YWx1ZSAvIEdhc1Byb3BlcnRpZXNDb25zdGFudHMuUFJFU1NVUkVfQ09OVkVSU0lPTl9TQ0FMRTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIFAgIT09IDAsICd6ZXJvIHByZXNzdXJlIG5vdCBzdXBwb3J0ZWQnICk7XHJcblxyXG4gICAgY29uc3QgTiA9IHRoaXMucGFydGljbGVTeXN0ZW0ubnVtYmVyT2ZQYXJ0aWNsZXNQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE4gIT09IDAsICdlbXB0eSBjb250YWluZXIgbm90IHN1cHBvcnRlZCcgKTtcclxuXHJcbiAgICBjb25zdCBWID0gdGhpcy5jb250YWluZXIudm9sdW1lUHJvcGVydHkudmFsdWU7IC8vIHBtXjNcclxuICAgIGNvbnN0IGsgPSBHYXNQcm9wZXJ0aWVzQ29uc3RhbnRzLkJPTFRaTUFOTjsgLy8gKHBtXjIgKiBBTVUpLyhwc14yICogSylcclxuXHJcbiAgICByZXR1cm4gKCBQICogViApIC8gKCBOICogayApO1xyXG4gIH1cclxufVxyXG5cclxuZ2FzUHJvcGVydGllcy5yZWdpc3RlciggJ0lkZWFsR2FzTGF3TW9kZWwnLCBJZGVhbEdhc0xhd01vZGVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUVsRSxPQUFPQyxtQkFBbUIsTUFBTSw0Q0FBNEM7QUFDNUUsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQUU3RCxPQUFPQyxhQUFhLE1BQU0sd0JBQXdCO0FBQ2xELE9BQU9DLHNCQUFzQixNQUFNLDhCQUE4QjtBQUNqRSxPQUFPQyw0QkFBNEIsTUFBTSxvQ0FBb0M7QUFDN0UsT0FBT0MsU0FBUyxNQUE0QixnQkFBZ0I7QUFDNUQsT0FBT0MsZ0JBQWdCLE1BQU0sdUJBQXVCO0FBQ3BELE9BQU9DLGlCQUFpQixNQUFNLHdCQUF3QjtBQUN0RCxTQUF1QkMsa0JBQWtCLFFBQVEsbUJBQW1CO0FBQ3BFLE9BQU9DLG9CQUFvQixNQUFNLDJCQUEyQjtBQUM1RCxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBQ2hELE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFDOUMsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUM5QyxPQUFPQyxnQkFBZ0IsTUFBTSx1QkFBdUI7QUErQnBELGVBQWUsTUFBTUMsZ0JBQWdCLFNBQVNULFNBQVMsQ0FBQztFQUV0RDs7RUFHQTtFQUNBO0VBR0E7RUFNQTtFQUdBO0VBTUE7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFHT1UsV0FBV0EsQ0FBRUMsTUFBYyxFQUFFQyxlQUF5QyxFQUFHO0lBRTlFLE1BQU1DLE9BQU8sR0FBR2pCLFNBQVMsQ0FBeUQsQ0FBQyxDQUFFO01BRW5GO01BQ0FrQixnQkFBZ0IsRUFBRSxLQUFLO01BQ3ZCQyxZQUFZLEVBQUUsU0FBUztNQUN2QkMsbUJBQW1CLEVBQUU7SUFDdkIsQ0FBQyxFQUFFSixlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRUQsTUFBTyxDQUFDO0lBRWYsSUFBSSxDQUFDTSxvQkFBb0IsR0FBRyxJQUFJekIsbUJBQW1CLENBQUVxQixPQUFPLENBQUNFLFlBQVksRUFBRTtNQUN6RUcsV0FBVyxFQUFFZixrQkFBa0I7TUFDL0JRLE1BQU0sRUFBRUEsTUFBTSxDQUFDUSxZQUFZLENBQUUsc0JBQXVCLENBQUM7TUFDckRDLG1CQUFtQixFQUFFO0lBQ3ZCLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0Msc0JBQXNCLEdBQUcsSUFBSTlCLGNBQWMsQ0FBRSxDQUFDLEVBQUU7TUFDbkQrQixLQUFLLEVBQUUsSUFBSTdCLEtBQUssQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFFLENBQUM7TUFDekJrQixNQUFNLEVBQUVBLE1BQU0sQ0FBQ1EsWUFBWSxDQUFFLHdCQUF5QixDQUFDO01BQ3ZEQyxtQkFBbUIsRUFBRSxvRUFBb0UsR0FDcEU7SUFDdkIsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDRyx5Q0FBeUMsR0FBRyxJQUFJbkMsZUFBZSxDQUFFLElBQUksRUFBRTtNQUMxRXVCLE1BQU0sRUFBRUEsTUFBTSxDQUFDUSxZQUFZLENBQUUsMkNBQTRDLENBQUM7TUFDMUVDLG1CQUFtQixFQUFFO0lBQ3ZCLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0ksU0FBUyxHQUFHLElBQUlwQixvQkFBb0IsQ0FBRTtNQUN6Q1UsZ0JBQWdCLEVBQUVELE9BQU8sQ0FBQ0MsZ0JBQWdCO01BQzFDSCxNQUFNLEVBQUVBLE1BQU0sQ0FBQ1EsWUFBWSxDQUFFLFdBQVk7SUFDM0MsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDTSxjQUFjLEdBQUcsSUFBSXBCLGNBQWMsQ0FDdEMsTUFBTSxJQUFJLENBQUNxQixnQkFBZ0IsQ0FBQ0MscUJBQXFCLENBQUMsQ0FBQyxFQUNuRCxJQUFJLENBQUNKLHlDQUF5QyxFQUM5QyxJQUFJLENBQUNDLFNBQVMsQ0FBQ0kscUJBQXFCLEVBQ3BDakIsTUFBTSxDQUFDUSxZQUFZLENBQUUsZ0JBQWlCLENBQ3hDLENBQUM7SUFFRCxJQUFJLENBQUNPLGdCQUFnQixHQUFHLElBQUlsQixnQkFBZ0IsQ0FDMUMsSUFBSSxDQUFDaUIsY0FBYyxDQUFDSSx5QkFBeUI7SUFBRTtJQUMvQyxNQUFNLElBQUksQ0FBQ0osY0FBYyxDQUFDSyx1QkFBdUIsQ0FBQyxDQUFDO0lBQUU7SUFDckRuQixNQUFNLENBQUNRLFlBQVksQ0FBRSxrQkFBbUIsQ0FDMUMsQ0FBQztJQUVELElBQUksQ0FBQ1ksYUFBYSxHQUFHLElBQUl4QixhQUFhLENBQ3BDLElBQUksQ0FBQ1Usb0JBQW9CLEVBQ3pCLElBQUksQ0FBQ1EsY0FBYyxDQUFDSSx5QkFBeUI7SUFBRTtJQUMvQyxJQUFJLENBQUNMLFNBQVMsQ0FBQ1EsY0FBYztJQUFFO0lBQy9CLElBQUksQ0FBQ04sZ0JBQWdCLENBQUNPLG1CQUFtQjtJQUFFO0lBQzNDLE1BQU07TUFBRSxJQUFJLENBQUNULFNBQVMsQ0FBQ1UsVUFBVSxDQUFDLENBQUM7SUFBRSxDQUFDLEVBQ3RDdkIsTUFBTSxDQUFDUSxZQUFZLENBQUUsZUFBZ0IsQ0FDdkMsQ0FBQztJQUVELElBQUksQ0FBQ2dCLGlCQUFpQixHQUFHLElBQUlqQyxpQkFBaUIsQ0FDNUMsSUFBSSxDQUFDc0IsU0FBUyxFQUNkLElBQUksQ0FBQ0MsY0FBYyxDQUFDVyxvQkFBb0IsRUFDeEMsSUFBSSxDQUFDYix5Q0FDUCxDQUFDO0lBRUQsSUFBSSxDQUFDYyxnQkFBZ0IsR0FBRyxJQUFJO0lBQzVCLElBQUt4QixPQUFPLENBQUNHLG1CQUFtQixFQUFHO01BQ2pDLElBQUksQ0FBQ3FCLGdCQUFnQixHQUFHLElBQUlwQyxnQkFBZ0IsQ0FBRSxJQUFJLENBQUNrQyxpQkFBaUIsRUFBRTtRQUNwRUcsUUFBUSxFQUFFLElBQUkzQyxPQUFPLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQztRQUFFO1FBQ2pDZ0IsTUFBTSxFQUFFQSxNQUFNLENBQUNRLFlBQVksQ0FBRSxrQkFBbUIsQ0FBQztRQUNqRG9CLE9BQU8sRUFBRTtNQUNYLENBQUUsQ0FBQztJQUNMOztJQUVBO0lBQ0E7SUFDQWpELFNBQVMsQ0FBQ2tELFNBQVMsQ0FDakIsQ0FBRSxJQUFJLENBQUNoQixTQUFTLENBQUNpQixhQUFhLEVBQUUsSUFBSSxDQUFDakIsU0FBUyxDQUFDa0IsNEJBQTRCLENBQUUsRUFDN0UsQ0FBRUMsS0FBSyxFQUFFQyxvQkFBb0IsS0FBTTtNQUNqQyxJQUFLLENBQUNBLG9CQUFvQixJQUFJLENBQUMsSUFBSSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxFQUFHO1FBQzVELElBQUksQ0FBQ0MsZ0JBQWdCLENBQUMsQ0FBQztNQUN6QjtJQUNGLENBQUUsQ0FBQztJQUVMLElBQUksQ0FBQ0MsWUFBWSxHQUFHO01BQ2xCQyx1QkFBdUIsRUFBRSxJQUFJNUQsT0FBTyxDQUFDLENBQUM7TUFDdEM2RCxzQkFBc0IsRUFBRSxJQUFJN0QsT0FBTyxDQUFDLENBQUM7TUFDckM4RCxvQkFBb0IsRUFBRSxJQUFJOUQsT0FBTyxDQUFDLENBQUM7TUFDbkMrRCxvQkFBb0IsRUFBRSxJQUFJL0QsT0FBTyxDQUFDLENBQUM7TUFDbkNnRSxvQkFBb0IsRUFBRSxJQUFJaEUsT0FBTyxDQUFDLENBQUM7TUFDbkNpRSx5QkFBeUIsRUFBRSxJQUFJakUsT0FBTyxDQUFDO0lBQ3pDLENBQUM7O0lBRUQ7SUFDQSxJQUFJLENBQUNvQyxjQUFjLENBQUNJLHlCQUF5QixDQUFDMEIsSUFBSSxDQUFFQyxpQkFBaUIsSUFBSTtNQUV2RTtNQUNBLElBQUtBLGlCQUFpQixLQUFLLENBQUMsRUFBRztRQUM3QixJQUFLLElBQUksQ0FBQ3ZDLG9CQUFvQixDQUFDNkIsS0FBSyxLQUFLLGFBQWEsRUFBRztVQUV2RDtVQUNBVyxJQUFJLENBQUNDLEdBQUcsSUFBSUQsSUFBSSxDQUFDQyxHQUFHLENBQUUsMENBQTJDLENBQUM7VUFDbEUsSUFBSSxDQUFDekMsb0JBQW9CLENBQUM2QixLQUFLLEdBQUcsU0FBUztVQUMzQyxJQUFJLENBQUNFLFlBQVksQ0FBQ0MsdUJBQXVCLENBQUNVLElBQUksQ0FBQyxDQUFDO1FBQ2xELENBQUMsTUFDSSxJQUFLLElBQUksQ0FBQzFDLG9CQUFvQixDQUFDNkIsS0FBSyxLQUFLLFdBQVcsSUFDL0MsSUFBSSxDQUFDN0Isb0JBQW9CLENBQUM2QixLQUFLLEtBQUssV0FBVyxFQUFHO1VBRTFEO1VBQ0FXLElBQUksQ0FBQ0MsR0FBRyxJQUFJRCxJQUFJLENBQUNDLEdBQUcsQ0FBRSwwQ0FBMkMsQ0FBQztVQUNsRSxJQUFJLENBQUN6QyxvQkFBb0IsQ0FBQzZCLEtBQUssR0FBRyxTQUFTO1VBQzNDLElBQUksQ0FBQ0UsWUFBWSxDQUFDRyxvQkFBb0IsQ0FBQ1EsSUFBSSxDQUFDLENBQUM7UUFDL0M7TUFDRjs7TUFFQTtNQUNBO01BQ0EsSUFBSyxDQUFDLElBQUksQ0FBQ2QsaUJBQWlCLENBQUNDLEtBQUssRUFBRztRQUNuQyxJQUFJLENBQUNDLGdCQUFnQixDQUFDLENBQUM7TUFDekI7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQTtJQUNBLElBQUksQ0FBQ3ZCLFNBQVMsQ0FBQ29DLGNBQWMsQ0FBQ0wsSUFBSSxDQUFFTSxNQUFNLElBQUk7TUFDNUMsSUFBS0EsTUFBTSxJQUFJLElBQUksQ0FBQzVDLG9CQUFvQixDQUFDNkIsS0FBSyxLQUFLLGFBQWEsRUFBRztRQUNqRVcsSUFBSSxDQUFDQyxHQUFHLElBQUlELElBQUksQ0FBQ0MsR0FBRyxDQUFFLDREQUE2RCxDQUFDO1FBQ3BGLElBQUksQ0FBQ3pDLG9CQUFvQixDQUFDNkIsS0FBSyxHQUFHLFNBQVM7UUFDM0MsSUFBSSxDQUFDRSxZQUFZLENBQUNFLHNCQUFzQixDQUFDUyxJQUFJLENBQUMsQ0FBQztNQUNqRDtJQUNGLENBQUUsQ0FBQzs7SUFFSDtJQUNBO0lBQ0E7SUFDQTtJQUNBLElBQUksQ0FBQ2xDLGNBQWMsQ0FBQ0kseUJBQXlCLENBQUMwQixJQUFJLENBQUUsQ0FBRUMsaUJBQWlCLEVBQUVNLHlCQUF5QixLQUFNO01BQ3RHLElBQUtBLHlCQUF5QixLQUFLLElBQUksSUFDbENOLGlCQUFpQixHQUFHLENBQUMsSUFDckJBLGlCQUFpQixHQUFHTSx5QkFBeUIsSUFDN0MsSUFBSSxDQUFDN0Msb0JBQW9CLENBQUM2QixLQUFLLEtBQUssYUFBYSxFQUFHO1FBQ3ZEaUIsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQyxJQUFJLENBQUNyQyxnQkFBZ0IsQ0FBQ3NDLGlDQUFpQyxDQUFDbEIsS0FBSyxFQUM5RSwwRUFBMkUsQ0FBQzs7UUFFOUU7UUFDQTtRQUNBO1FBQ0EsSUFBSyxJQUFJLENBQUNwQixnQkFBZ0IsQ0FBQ08sbUJBQW1CLENBQUNhLEtBQUssS0FBSyxJQUFJLEVBQUc7VUFDOUQsSUFBSSxDQUFDcEIsZ0JBQWdCLENBQUN1QyxNQUFNLENBQUMsQ0FBQztRQUNoQztRQUVBLE1BQU1DLFdBQVcsR0FBRyxJQUFJLENBQUN4QyxnQkFBZ0IsQ0FBQ08sbUJBQW1CLENBQUNhLEtBQU07UUFDcEVpQixNQUFNLElBQUlBLE1BQU0sQ0FBRUcsV0FBVyxLQUFLLElBQUssQ0FBQztRQUV4QyxJQUFJLENBQUN6QyxjQUFjLENBQUMwQyxjQUFjLENBQUVELFdBQVksQ0FBQztNQUNuRDtJQUNGLENBQUUsQ0FBQzs7SUFFSDtJQUNBSCxNQUFNLElBQUksSUFBSSxDQUFDOUMsb0JBQW9CLENBQUNzQyxJQUFJLENBQUV4QyxZQUFZLElBQUk7TUFFeEQ7TUFDQWdELE1BQU0sSUFBSUEsTUFBTSxDQUFFLEVBQUcsSUFBSSxDQUFDdEMsY0FBYyxDQUFDSSx5QkFBeUIsQ0FBQ2lCLEtBQUssS0FBSyxDQUFDLEtBQzVFL0IsWUFBWSxLQUFLLGFBQWEsSUFDOUJBLFlBQVksS0FBSyxXQUFXLElBQzVCQSxZQUFZLEtBQUssV0FBVyxDQUFFLENBQUUsRUFDL0IsMkJBQTBCQSxZQUFhLDJCQUEwQixJQUFJLENBQUNVLGNBQWMsQ0FBQ0kseUJBQXlCLENBQUNpQixLQUFNLEVBQUUsQ0FBQzs7TUFFM0g7TUFDQWlCLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEVBQUcsSUFBSSxDQUFDaEMsYUFBYSxDQUFDcUMsZ0JBQWdCLENBQUN0QixLQUFLLEtBQUssQ0FBQyxLQUNsRS9CLFlBQVksS0FBSyxXQUFXLElBQzVCQSxZQUFZLEtBQUssV0FBVyxDQUFFLENBQUUsRUFDL0IsMkJBQTBCQSxZQUFhLGtCQUFpQixJQUFJLENBQUNnQixhQUFhLENBQUNxQyxnQkFBZ0IsQ0FBQ3RCLEtBQU0sRUFBRSxDQUFDO0lBQzFHLENBQUMsRUFBRTtNQUVEO01BQ0E7TUFDQXVCLGtCQUFrQixFQUFFLENBQ2xCLElBQUksQ0FBQzVDLGNBQWMsQ0FBQ0kseUJBQXlCLEVBQzdDLElBQUksQ0FBQ0UsYUFBYSxDQUFDcUMsZ0JBQWdCO0lBRXZDLENBQUUsQ0FBQztFQUNMO0VBRWdCRSxPQUFPQSxDQUFBLEVBQVM7SUFDOUJQLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEtBQUssRUFBRSw4REFBK0QsQ0FBQztJQUN6RixLQUFLLENBQUNPLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0VBRWdCQyxLQUFLQSxDQUFBLEVBQVM7SUFDNUIsS0FBSyxDQUFDQSxLQUFLLENBQUMsQ0FBQzs7SUFFYjtJQUNBLElBQUksQ0FBQ3RELG9CQUFvQixDQUFDc0QsS0FBSyxDQUFDLENBQUM7SUFDakMsSUFBSSxDQUFDbEQsc0JBQXNCLENBQUNrRCxLQUFLLENBQUMsQ0FBQztJQUNuQyxJQUFJLENBQUNoRCx5Q0FBeUMsQ0FBQ2dELEtBQUssQ0FBQyxDQUFDOztJQUV0RDtJQUNBLElBQUksQ0FBQy9DLFNBQVMsQ0FBQytDLEtBQUssQ0FBQyxDQUFDO0lBQ3RCLElBQUksQ0FBQzlDLGNBQWMsQ0FBQzhDLEtBQUssQ0FBQyxDQUFDO0lBQzNCLElBQUksQ0FBQzdDLGdCQUFnQixDQUFDNkMsS0FBSyxDQUFDLENBQUM7SUFDN0IsSUFBSSxDQUFDeEMsYUFBYSxDQUFDd0MsS0FBSyxDQUFDLENBQUM7SUFDMUIsSUFBSSxDQUFDbEMsZ0JBQWdCLElBQUksSUFBSSxDQUFDQSxnQkFBZ0IsQ0FBQ2tDLEtBQUssQ0FBQyxDQUFDO0VBQ3hEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ3FCQyxhQUFhQSxDQUFFQyxFQUFVLEVBQVM7SUFDbkRWLE1BQU0sSUFBSUEsTUFBTSxDQUFFVSxFQUFFLEdBQUcsQ0FBQyxFQUFHLGVBQWNBLEVBQUcsRUFBRSxDQUFDO0lBRS9DLEtBQUssQ0FBQ0QsYUFBYSxDQUFFQyxFQUFHLENBQUM7O0lBRXpCO0lBQ0EsSUFBSSxDQUFDQyxVQUFVLENBQUVELEVBQUcsQ0FBQzs7SUFFckI7SUFDQSxJQUFJLENBQUNFLFdBQVcsQ0FBRUYsRUFBRSxFQUFFLElBQUksQ0FBQ3RDLGlCQUFpQixDQUFDeUMsbUNBQW9DLENBQUM7RUFDcEY7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNVRixVQUFVQSxDQUFFRCxFQUFVLEVBQVM7SUFDckNWLE1BQU0sSUFBSUEsTUFBTSxDQUFFVSxFQUFFLEdBQUcsQ0FBQyxFQUFHLGVBQWNBLEVBQUcsRUFBRSxDQUFDOztJQUUvQztJQUNBLElBQUksQ0FBQ2hELGNBQWMsQ0FBQ29ELFFBQVEsQ0FBRSxJQUFJLENBQUN4RCxzQkFBc0IsQ0FBQ3lCLEtBQU0sQ0FBQzs7SUFFakU7SUFDQSxJQUFJLENBQUNyQixjQUFjLENBQUNxRCxJQUFJLENBQUVMLEVBQUcsQ0FBQzs7SUFFOUI7SUFDQSxJQUFJLENBQUNoRCxjQUFjLENBQUNzRCxlQUFlLENBQUUsSUFBSSxDQUFDdkQsU0FBVSxDQUFDOztJQUVyRDtJQUNBLElBQUksQ0FBQ0EsU0FBUyxDQUFDc0QsSUFBSSxDQUFFTCxFQUFHLENBQUM7O0lBRXpCO0lBQ0EsSUFBSSxDQUFDdEMsaUJBQWlCLENBQUM4QixNQUFNLENBQUMsQ0FBQzs7SUFFL0I7SUFDQSxJQUFJLENBQUN4QyxjQUFjLENBQUN1RCwwQkFBMEIsQ0FBRSxJQUFJLENBQUNDLG1CQUFtQixDQUFDbkMsS0FBTSxDQUFDOztJQUVoRjtJQUNBLElBQUksQ0FBQ1QsZ0JBQWdCLElBQUksSUFBSSxDQUFDQSxnQkFBZ0IsQ0FBQ3lDLElBQUksQ0FBRUwsRUFBRyxDQUFDO0VBQzNEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1VFLFdBQVdBLENBQUVPLGVBQXVCLEVBQUVDLGtCQUEwQixFQUFTO0lBQy9FcEIsTUFBTSxJQUFJQSxNQUFNLENBQUVtQixlQUFlLEdBQUcsQ0FBQyxFQUFHLDRCQUEyQkEsZUFBZ0IsRUFBRSxDQUFDO0lBQ3RGbkIsTUFBTSxJQUFJQSxNQUFNLENBQUVvQixrQkFBa0IsSUFBSSxDQUFDLEVBQUcsK0JBQThCQSxrQkFBbUIsRUFBRSxDQUFDOztJQUVoRztJQUNBLElBQUksQ0FBQ0MseUJBQXlCLENBQUMsQ0FBQzs7SUFFaEM7SUFDQSxJQUFJLENBQUMxRCxnQkFBZ0IsQ0FBQ3VDLE1BQU0sQ0FBQyxDQUFDOztJQUU5QjtJQUNBLElBQUksQ0FBQ2xDLGFBQWEsQ0FBQ2tDLE1BQU0sQ0FBRWlCLGVBQWUsRUFBRUMsa0JBQW1CLENBQUM7O0lBRWhFO0lBQ0EsSUFBSSxDQUFDRSxXQUFXLENBQUMsQ0FBQztFQUNwQjs7RUFFQTtBQUNGO0FBQ0E7RUFDWXRDLGdCQUFnQkEsQ0FBQSxFQUFTO0lBQ2pDZ0IsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQyxJQUFJLENBQUNsQixpQkFBaUIsQ0FBQ0MsS0FBSyxFQUFFLG1DQUFvQyxDQUFDOztJQUV0RjtJQUNBLElBQUksQ0FBQzZCLFdBQVcsQ0FBRXJFLGFBQWEsQ0FBQ2dGLGNBQWMsRUFBRSxDQUFDLENBQUMsd0JBQXlCLENBQUM7RUFDOUU7O0VBRUE7QUFDRjtBQUNBO0VBQ1VGLHlCQUF5QkEsQ0FBQSxFQUFTO0lBRXhDLElBQUssSUFBSSxDQUFDbkUsb0JBQW9CLENBQUM2QixLQUFLLEtBQUssV0FBVyxFQUFHO01BRXJEO01BQ0EsTUFBTXlDLHNCQUFzQixHQUFHLElBQUksQ0FBQy9ELFNBQVMsQ0FBQ2lCLGFBQWEsQ0FBQ0ssS0FBSztNQUVqRSxJQUFJMEMsY0FBYyxHQUFHLElBQUksQ0FBQ0Msa0JBQWtCLENBQUMsQ0FBQyxJQUFLLElBQUksQ0FBQ2pFLFNBQVMsQ0FBQ2tFLE1BQU0sR0FBRyxJQUFJLENBQUNsRSxTQUFTLENBQUNtRSxLQUFLLENBQUU7O01BRWpHO01BQ0FILGNBQWMsR0FBRzlGLEtBQUssQ0FBQ2tHLGFBQWEsQ0FBRUosY0FBYyxFQUFFLENBQUUsQ0FBQzs7TUFFekQ7TUFDQSxJQUFLLENBQUMsSUFBSSxDQUFDaEUsU0FBUyxDQUFDcUUsVUFBVSxDQUFDQyxRQUFRLENBQUVOLGNBQWUsQ0FBQyxFQUFHO1FBRTNEO1FBQ0EsSUFBSSxDQUFDdkUsb0JBQW9CLENBQUM2QixLQUFLLEdBQUcsU0FBUzs7UUFFM0M7UUFDQVcsSUFBSSxDQUFDQyxHQUFHLElBQUlELElBQUksQ0FBQ0MsR0FBRyxDQUFFLHdEQUF3RCxHQUN2RCxrQkFBaUI4QixjQUFlLGVBQWMsSUFBSSxDQUFDaEUsU0FBUyxDQUFDcUUsVUFBVyxFQUFFLENBQUM7UUFDbEcsSUFBS0wsY0FBYyxHQUFHLElBQUksQ0FBQ2hFLFNBQVMsQ0FBQ3FFLFVBQVUsQ0FBQ0UsR0FBRyxFQUFHO1VBQ3BELElBQUksQ0FBQy9DLFlBQVksQ0FBQ0ksb0JBQW9CLENBQUNPLElBQUksQ0FBQyxDQUFDO1FBQy9DLENBQUMsTUFDSTtVQUNILElBQUksQ0FBQ1gsWUFBWSxDQUFDSyxvQkFBb0IsQ0FBQ00sSUFBSSxDQUFDLENBQUM7UUFDL0M7O1FBRUE7UUFDQTZCLGNBQWMsR0FBRyxJQUFJLENBQUNoRSxTQUFTLENBQUNxRSxVQUFVLENBQUNHLGNBQWMsQ0FBRVIsY0FBZSxDQUFDO01BQzdFOztNQUVBO01BQ0EsSUFBSSxDQUFDaEUsU0FBUyxDQUFDeUUsaUJBQWlCLENBQUVULGNBQWUsQ0FBQzs7TUFFbEQ7TUFDQSxJQUFJLENBQUMvRCxjQUFjLENBQUN5RSxxQkFBcUIsQ0FBRVYsY0FBYyxHQUFHRCxzQkFBdUIsQ0FBQztJQUN0RixDQUFDLE1BQ0ksSUFBSyxJQUFJLENBQUN0RSxvQkFBb0IsQ0FBQzZCLEtBQUssS0FBSyxXQUFXLEVBQUc7TUFFMUQ7TUFDQSxNQUFNcUQsa0JBQWtCLEdBQUcsSUFBSSxDQUFDQyx1QkFBdUIsQ0FBQyxDQUFDO01BRXpELElBQUksQ0FBQzNFLGNBQWMsQ0FBQzBDLGNBQWMsQ0FBRWdDLGtCQUFtQixDQUFDO01BQ3hEcEMsTUFBTSxJQUFJQSxNQUFNLENBQUVzQyxJQUFJLENBQUNDLEdBQUcsQ0FBRUgsa0JBQWtCLEdBQUcsSUFBSSxDQUFDQyx1QkFBdUIsQ0FBQyxDQUFFLENBQUMsR0FBRyxJQUFJLEVBQ3RGLHVEQUF3RCxDQUFDO01BRTNELElBQUksQ0FBQzFFLGdCQUFnQixDQUFDTyxtQkFBbUIsQ0FBQ2EsS0FBSyxHQUFHcUQsa0JBQWtCO0lBQ3RFO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0VBQ1VkLFdBQVdBLENBQUEsRUFBUztJQUUxQixNQUFNbkIsV0FBVyxHQUFHLElBQUksQ0FBQ3hDLGdCQUFnQixDQUFDTyxtQkFBbUIsQ0FBQ2EsS0FBSzs7SUFFbkU7SUFDQTtJQUNBLElBQUtvQixXQUFXLEtBQUssSUFBSSxJQUFJQSxXQUFXLElBQUluRSw0QkFBNEIsQ0FBQ3dHLGNBQWMsRUFBRztNQUV4RjtNQUNBLElBQUssSUFBSSxDQUFDdEYsb0JBQW9CLENBQUM2QixLQUFLLEtBQUssU0FBUyxJQUM3QyxJQUFJLENBQUM3QixvQkFBb0IsQ0FBQzZCLEtBQUssS0FBSyxRQUFRLEVBQUc7UUFDbEQsSUFBSSxDQUFDN0Isb0JBQW9CLENBQUM2QixLQUFLLEdBQUcsU0FBUztNQUM3Qzs7TUFFQTtNQUNBO01BQ0EsSUFBSSxDQUFDckIsY0FBYyxDQUFDK0Usa0JBQWtCLENBQUMsQ0FBQzs7TUFFeEM7TUFDQSxJQUFJLENBQUNoRixTQUFTLENBQUNpRixlQUFlLENBQUMzRCxLQUFLLEdBQUcsSUFBSTs7TUFFM0M7TUFDQVcsSUFBSSxDQUFDQyxHQUFHLElBQUlELElBQUksQ0FBQ0MsR0FBRyxDQUFHLHNDQUFxQyxJQUFJLENBQUNoQyxnQkFBZ0IsQ0FBQ08sbUJBQW1CLENBQUNhLEtBQU0sRUFBRSxDQUFDO01BQy9HLElBQUksQ0FBQ0UsWUFBWSxDQUFDTSx5QkFBeUIsQ0FBQ0ssSUFBSSxDQUFDLENBQUM7SUFDcEQ7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNVOEIsa0JBQWtCQSxDQUFBLEVBQVc7SUFFbkMsTUFBTWlCLENBQUMsR0FBRyxJQUFJLENBQUNqRixjQUFjLENBQUNJLHlCQUF5QixDQUFDaUIsS0FBSztJQUM3RCxNQUFNNkQsQ0FBQyxHQUFHN0csc0JBQXNCLENBQUM4RyxTQUFTLENBQUMsQ0FBQztJQUM1QyxNQUFNQyxDQUFDLEdBQUcsSUFBSSxDQUFDbkYsZ0JBQWdCLENBQUNvRixrQkFBa0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDM0QsTUFBTUMsQ0FBQyxHQUFHLElBQUksQ0FBQ2hGLGFBQWEsQ0FBQ3FDLGdCQUFnQixDQUFDdEIsS0FBSyxHQUFHaEQsc0JBQXNCLENBQUNrSCx5QkFBeUI7SUFDdEdqRCxNQUFNLElBQUlBLE1BQU0sQ0FBRWdELENBQUMsS0FBSyxDQUFDLEVBQUUsNkJBQThCLENBQUM7SUFFMUQsT0FBU0wsQ0FBQyxHQUFHQyxDQUFDLEdBQUdFLENBQUMsR0FBS0UsQ0FBQztFQUMxQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNTWCx1QkFBdUJBLENBQUEsRUFBVztJQUV2QyxNQUFNVyxDQUFDLEdBQUcsSUFBSSxDQUFDaEYsYUFBYSxDQUFDcUMsZ0JBQWdCLENBQUN0QixLQUFLLEdBQUdoRCxzQkFBc0IsQ0FBQ2tILHlCQUF5QjtJQUN0R2pELE1BQU0sSUFBSUEsTUFBTSxDQUFFZ0QsQ0FBQyxLQUFLLENBQUMsRUFBRSw2QkFBOEIsQ0FBQztJQUUxRCxNQUFNTCxDQUFDLEdBQUcsSUFBSSxDQUFDakYsY0FBYyxDQUFDSSx5QkFBeUIsQ0FBQ2lCLEtBQUs7SUFDN0RpQixNQUFNLElBQUlBLE1BQU0sQ0FBRTJDLENBQUMsS0FBSyxDQUFDLEVBQUUsK0JBQWdDLENBQUM7SUFFNUQsTUFBTU8sQ0FBQyxHQUFHLElBQUksQ0FBQ3pGLFNBQVMsQ0FBQ1EsY0FBYyxDQUFDYyxLQUFLLENBQUMsQ0FBQztJQUMvQyxNQUFNNkQsQ0FBQyxHQUFHN0csc0JBQXNCLENBQUM4RyxTQUFTLENBQUMsQ0FBQzs7SUFFNUMsT0FBU0csQ0FBQyxHQUFHRSxDQUFDLElBQU9QLENBQUMsR0FBR0MsQ0FBQyxDQUFFO0VBQzlCO0FBQ0Y7QUFFQTlHLGFBQWEsQ0FBQ3FILFFBQVEsQ0FBRSxrQkFBa0IsRUFBRXpHLGdCQUFpQixDQUFDIn0=