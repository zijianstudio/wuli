// Copyright 2021-2022, University of Colorado Boulder

/**
 * Model for Molecules and Light.  It is called PhotonAbsorptionModel because it came from the original Java version
 * in a file called PhotonAbsorptionModel.java, which is used by both "Molecules & Light" and "Greenhouse Gas"
 *
 * This models photons being absorbed (or often NOT absorbed) by various molecules.  The scale for this model is
 * picometers (10E-12 meters).
 *
 * The basic idea for this model is that there is some sort of photon emitter that emits photons, and some sort of
 * photon target that could potentially some of the emitted photons and react in some way.  In many cases, the photon
 * target can re-emit one or more photons after absorption.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import EnumerationIO from '../../../../tandem/js/types/EnumerationIO.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import MicroPhoton from './MicroPhoton.js';
import Molecule from './Molecule.js';
import CH4 from './molecules/CH4.js';
import CO from './molecules/CO.js';
import CO2 from './molecules/CO2.js';
import H2O from './molecules/H2O.js';
import N2 from './molecules/N2.js';
import NO2 from './molecules/NO2.js';
import O2 from './molecules/O2.js';
import O3 from './molecules/O3.js';
import PhotonTarget from './PhotonTarget.js';
import WavelengthConstants from './WavelengthConstants.js';

// ------- constants -------------

// constants that control where and how photons are emitted.
const PHOTON_EMISSION_POSITION = new Vector2(-1350, 0);

// Velocity of emitted photons.  Since they are emitted horizontally, only one value is needed.
const PHOTON_VELOCITY = 3000; // picometers/second

// Defaults for photon emission periods.
const DEFAULT_PHOTON_EMISSION_PERIOD = Number.POSITIVE_INFINITY; // Milliseconds of sim time.

// Default values for various parameters that weren't already covered.
const DEFAULT_EMITTED_PHOTON_WAVELENGTH = WavelengthConstants.IR_WAVELENGTH;
const INITIAL_COUNTDOWN_WHEN_EMISSION_ENABLED = 0.0; // seconds, emitted right away

// photon emission periods, in seconds
const EMITTER_ON_EMISSION_PERIOD = 0.8;
const EMITTER_OFF_EMISSION_PERIOD = Number.POSITIVE_INFINITY;

// when stepping at "slow" speed, animate rate is reduced by this factor
const SLOW_SPEED_FACTOR = 0.5;
class PhotonAbsorptionModel extends PhetioObject {
  /**
   * Constructor for a photon absorption model.
   *
   * @param {PhotonTarget} initialPhotonTarget - Initial molecule which the photon gets fired at.
   * @param {Tandem} tandem
   */
  constructor(initialPhotonTarget, tandem) {
    super();
    this.photonAbsorptionModel = tandem; // @private

    // @private
    this.photonGroup = new PhetioGroup((tandem, wavelength) => new MicroPhoton(wavelength, {
      tandem: tandem
    }), [WavelengthConstants.IR_WAVELENGTH], {
      phetioType: PhetioGroup.PhetioGroupIO(MicroPhoton.PhotonIO),
      tandem: tandem.createTandem('photonGroup')
    });

    // @public - Property that indicating whether photons are being emitted from the photon emitter
    this.photonEmitterOnProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('photonEmitterOnProperty')
    });

    // @public
    this.photonWavelengthProperty = new NumberProperty(WavelengthConstants.IR_WAVELENGTH, {
      tandem: tandem.createTandem('photonWavelengthProperty'),
      units: 'm',
      validValues: [WavelengthConstants.MICRO_WAVELENGTH, WavelengthConstants.IR_WAVELENGTH, WavelengthConstants.VISIBLE_WAVELENGTH, WavelengthConstants.UV_WAVELENGTH]
    });

    // {Property.<PhotonTarget>}
    this.photonTargetProperty = new Property(initialPhotonTarget, {
      tandem: tandem.createTandem('photonTargetProperty'),
      phetioValueType: EnumerationIO(PhotonTarget),
      validValues: PhotonTarget.VALUES
    });

    // @public (read-only) {null|Molecule} - A reference to the current target molecule, determined from the
    // photonTargetProperty. If the molecule breaks apart this will become null again.
    this.targetMolecule = null;

    // @public (BooleanProperty) - Whether or the simulation is currently playing or paused
    this.runningProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('runningProperty')
    });

    // @public controls play speed of the simulation
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL, {
      validValues: [TimeSpeed.NORMAL, TimeSpeed.SLOW],
      tandem: tandem.createTandem('timeSpeedProperty')
    });

    // @public - convenience Property, indicating whether sim is running in slow motion
    this.slowMotionProperty = new DerivedProperty([this.timeSpeedProperty], speed => speed === TimeSpeed.SLOW);
    this.activeMolecules = createObservableArray({
      tandem: tandem.createTandem('molecules'),
      phetioType: createObservableArray.ObservableArrayIO(Molecule.MoleculeIO)
    }); // Elements are of type Molecule.

    // @public (read-only) {Emitter} - emitter for when a photon is emitted from the emission point - useful in addition
    // to the photons ObservableArrayDef because this is specifically for photon emission from the light source
    this.photonEmittedEmitter = new Emitter({
      parameters: [{
        valueType: MicroPhoton
      }]
    });

    // @public - Emits when the model has been reset
    this.resetEmitter = new Emitter();

    // @public - Emits an event when the user manually steps forward one frame
    this.manualStepEmitter = new Emitter();

    // Link the model's active molecule to the photon target property.  Note that this wiring must be done after the
    // listeners for the activeMolecules observable array have been implemented.
    this.photonTargetProperty.link(photonTarget => this.updateActiveMolecule(photonTarget, tandem));

    // when the photon emitter is on, set to default "on" and "off" period
    this.photonEmitterOnProperty.link(emitterOn => {
      this.setPhotonEmissionPeriod(emitterOn ? EMITTER_ON_EMISSION_PERIOD : EMITTER_OFF_EMISSION_PERIOD);
    });

    // Clear all photons to avoid cases where photons of the previous wavelength
    // could be absorbed after new wavelength was selected. Some users interpreted
    // absorption of the previous wavelength as absorption of the selected wavelength
    this.photonWavelengthProperty.lazyLink(() => {
      this.resetPhotons();

      // after clearing, next photon should be emitted right away
      if (this.photonEmitterOnProperty.get()) {
        this.setEmissionTimerToInitialCountdown();
      }
    });

    // Variables that control periodic photon emission.
    this.photonEmissionCountdownTimer = Number.POSITIVE_INFINITY; // @private
    this.photonEmissionPeriodTarget = DEFAULT_PHOTON_EMISSION_PERIOD; // @private
  }

  /**
   * Reset the model to its initial state.
   * @public
   */
  reset() {
    this.resetPhotons();

    // Reset all active molecules, which will stop any vibrations.
    for (let molecule = 0; molecule < this.activeMolecules.length; molecule++) {
      this.activeMolecules.get(molecule).reset();
    }

    // Set default values.
    this.photonTargetProperty.reset();
    this.setEmittedPhotonWavelength(DEFAULT_EMITTED_PHOTON_WAVELENGTH);
    this.setPhotonEmissionPeriod(DEFAULT_PHOTON_EMISSION_PERIOD);

    // Reset all associated properties.
    this.photonEmitterOnProperty.reset();
    this.photonWavelengthProperty.reset();
    this.runningProperty.reset();
    this.timeSpeedProperty.reset();
    this.photonTargetProperty.reset();

    // broadcast that the model has been reset
    this.resetEmitter.emit();
  }

  /**
   * Clears all photons.
   * @public
   */
  resetPhotons() {
    // If setting state, the state engine will do this step.
    if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
      this.photonGroup.clear();
    }
  }

  /**
   * Advance the molecules one step in time.  Called by the animation loop.
   * @public
   *
   * @param {number} dt - The incremental time step.
   */
  step(dt) {
    // Reject large dt values that often result from returning to this sim when it has been hidden, e.g. when another
    // tab was open in the browser or the browser was minimized.  The nominal dt value is based on 60 fps and is
    // 1/60 = 0.016667 sec.
    if (dt > 0.2) {
      return;
    }

    // reduce time step if running in slow motion
    if (this.slowMotionProperty.value) {
      dt = dt * SLOW_SPEED_FACTOR;
    }
    if (this.runningProperty.get()) {
      // Step the photons, marking and removing any that have moved beyond the model
      this.stepPhotons(dt);

      // Check if it is time to emit any photons.
      this.checkEmissionTimer(dt);

      // Step the molecules.
      this.stepMolecules(dt);
    }
  }

  /**
   * Check if it is time to emit any photons from the photon emitter.
   * @public
   *
   * @param {number} dt - the incremental time step, in seconds
   */
  checkEmissionTimer(dt) {
    if (this.photonEmissionCountdownTimer !== Number.POSITIVE_INFINITY) {
      this.photonEmissionCountdownTimer -= dt;
      if (this.photonEmissionCountdownTimer <= 0) {
        // Time to emit.
        this.emitPhoton(Math.abs(this.photonEmissionCountdownTimer));
        this.photonEmissionCountdownTimer = this.photonEmissionPeriodTarget;
      }
    }
  }

  /**
   * Sets the timer to the initial countdown time when emission is first enabled.
   * @public
   */
  setEmissionTimerToInitialCountdown() {
    this.photonEmissionCountdownTimer = INITIAL_COUNTDOWN_WHEN_EMISSION_ENABLED;
  }

  /**
   * Step the photons in time.
   * @public
   *
   * @param {number} dt - the incremental times step, in seconds
   */
  stepPhotons(dt) {
    const photonsToRemove = [];

    // check for possible interaction between each photon and molecule
    this.photonGroup.forEach(photon => {
      this.activeMolecules.forEach(molecule => {
        if (molecule.queryAbsorbPhoton(photon)) {
          // the photon was absorbed, so put it on the removal list
          photonsToRemove.push(photon);
        }
      });
      photon.step(dt);
    });

    // Remove any photons that were marked for removal.
    photonsToRemove.forEach(photon => this.photonGroup.disposeElement(photon));
  }

  /**
   * @public
   */
  clearPhotons() {
    this.photonGroup.clear();
  }

  /**
   * Step the molecules one step in time.
   * @public
   *
   * @param {number} dt - The incremental time step.
   */
  stepMolecules(dt) {
    const moleculesToStep = this.activeMolecules.slice(0);
    for (let molecule = 0; molecule < moleculesToStep.length; molecule++) {
      moleculesToStep[molecule].step(dt);
    }
  }

  /**
   * Step one frame manually.
   * @public
   *
   * @param {number} dt - time to step forward the model by, in seconds
   */
  manualStep(dt) {
    // Check if it is time to emit any photons.
    this.checkEmissionTimer(dt);

    // Step the photons, marking and removing any that have moved beyond the model bounds.
    this.stepPhotons(dt);

    // Step the molecules.
    this.stepMolecules(dt);
    this.manualStepEmitter.emit();
  }

  /**
   * Cause a photon to be emitted from the emission point.  Emitted photons will travel toward the photon target,
   * which will decide whether a given photon should be absorbed.
   * @param advanceAmount - amount of time that the photon should be "advanced" from its starting position.  This
   * makes it possible to make the emission stream look more constant in cases where there was a long delay between
   * frames.
   * @public
   */
  emitPhoton(advanceAmount) {
    const photon = this.photonGroup.createNextElement(this.photonWavelengthProperty.get());
    photon.positionProperty.set(new Vector2(PHOTON_EMISSION_POSITION.x + PHOTON_VELOCITY * advanceAmount, PHOTON_EMISSION_POSITION.y));
    const emissionAngle = 0; // Straight to the right.
    photon.setVelocity(PHOTON_VELOCITY * Math.cos(emissionAngle), PHOTON_VELOCITY * Math.sin(emissionAngle));

    // indicate that a photon has been emitted from the initial emission point
    this.photonEmittedEmitter.emit(photon);
  }

  /**
   * Set the wavelength of the photon to be emitted if desired frequency is not equal to the current value.
   * @public
   *
   * @param {number} freq
   */
  setEmittedPhotonWavelength(freq) {
    if (this.photonWavelengthProperty.get() !== freq) {
      // Set the new value and send out notification of change to listeners.
      this.photonWavelengthProperty.set(freq);
    }
  }

  /**
   * Get the emission position for this photonAbsorptionModel.  Useful when other models need access to this position.
   * @public
   *
   * @returns {Vector2}
   */
  getPhotonEmissionPosition() {
    return PHOTON_EMISSION_POSITION;
  }

  /**
   * Set the emission period, i.e. the time between photons.
   * @public
   *
   * @param {number} photonEmissionPeriod - Period between photons in milliseconds.
   */
  setPhotonEmissionPeriod(photonEmissionPeriod) {
    assert && assert(photonEmissionPeriod >= 0);
    if (this.photonEmissionPeriodTarget !== photonEmissionPeriod) {
      // If we are transitioning from off to on, set the countdown timer such that a photon will be emitted right away
      // so that the user doesn't have to wait too long in order to see something come out, but only if there
      // are no other photons in the observation window so we don't emit unlimitted photons when turning
      // on/off rapidly
      if (this.photonEmissionPeriodTarget === Number.POSITIVE_INFINITY && photonEmissionPeriod !== Number.POSITIVE_INFINITY && this.photonGroup.count === 0) {
        // only reset time on emission of first photon, there should still be a delay after subsequent photons
        this.setEmissionTimerToInitialCountdown();
      } else if (photonEmissionPeriod < this.photonEmissionCountdownTimer) {
        // Handle the case where the new value is smaller than the current countdown value.
        this.photonEmissionCountdownTimer = photonEmissionPeriod;
      } else if (photonEmissionPeriod === Number.POSITIVE_INFINITY) {
        // If the new value is infinity, it means that emissions are being turned off, so set the period to infinity
        // right away.
        this.photonEmissionCountdownTimer = photonEmissionPeriod;
      }
      this.photonEmissionPeriodTarget = photonEmissionPeriod;
    }
  }

  /**
   * Update the active molecule to the current photon target.  Clear the old array of active molecules, create a new
   * molecule, and then add it to the active molecules array.  Add listeners to the molecule that check for when
   * the molecule should emit a photon or break apart into constituents.
   * @public
   *
   * @param {PhotonTarget} photonTarget - The string constant which represents the desired photon target.
   * @param {Tandem} tandem
   */
  updateActiveMolecule(photonTarget, tandem) {
    this.activeMolecules.forEach(molecule => {
      molecule.dispose();
    });

    // Remove the old photon target(s).
    this.activeMolecules.clear(); // Clear the old active molecules array

    // Add the new photon target(s).
    const newMolecule = photonTarget === PhotonTarget.SINGLE_CO_MOLECULE ? new CO({
      tandem: tandem.createTandem('CO')
    }) : photonTarget === PhotonTarget.SINGLE_CO2_MOLECULE ? new CO2({
      tandem: tandem.createTandem('CO2')
    }) : photonTarget === PhotonTarget.SINGLE_H2O_MOLECULE ? new H2O({
      tandem: tandem.createTandem('H2O')
    }) : photonTarget === PhotonTarget.SINGLE_N2_MOLECULE ? new N2({
      tandem: tandem.createTandem('N2')
    }) : photonTarget === PhotonTarget.SINGLE_O2_MOLECULE ? new O2({
      tandem: tandem.createTandem('O2')
    }) : photonTarget === PhotonTarget.SINGLE_O3_MOLECULE ? new O3({
      tandem: tandem.createTandem('O3')
    }) : photonTarget === PhotonTarget.SINGLE_NO2_MOLECULE ? new NO2({
      tandem: tandem.createTandem('NO2')
    }) : photonTarget === PhotonTarget.SINGLE_CH4_MOLECULE ? new CH4({
      tandem: tandem.createTandem('CH4')
    }) : assert && assert(false, 'unhandled photon target.');
    this.targetMolecule = newMolecule;
    this.activeMolecules.add(newMolecule);

    // Set the photonGroup so that photons created by the molecule can be registered for PhET-iO
    newMolecule.photonGroup = this.photonGroup;

    // Break apart into constituent molecules.
    newMolecule.brokeApartEmitter.addListener((constituentMolecule1, constituentMolecule2) => {
      // Remove the molecule from the photonAbsorptionModel's list of active molecules.

      newMolecule.dispose();
      this.targetMolecule = null;
      this.activeMolecules.remove(newMolecule);
      // Add the constituent molecules to the photonAbsorptionModel.
      this.activeMolecules.add(constituentMolecule1);
      this.activeMolecules.add(constituentMolecule2);
    });
  }

  /**
   * Get the active molecules in this photonAbsorption model.  Returns a new array object holding those molecules.
   * @public
   *
   * @returns {Array.<Molecule>} activeMolecules
   */
  getMolecules() {
    return this.activeMolecules.slice(0);
  }

  /**
   * Returns true if this model still contains both of the constituent molecules provided after a break apart.
   * @public
   *
   * @param {Molecule} moleculeA
   * @param {Molecule} moleculeB
   * @returns {boolean}
   */
  hasBothConstituentMolecules(moleculeA, moleculeB) {
    return this.activeMolecules.includes(moleculeA) && this.activeMolecules.includes(moleculeB);
  }

  /**
   * This method restores the active molecule.  This may seem nonsensical, and in some cases it is, but it is useful
   * in cases where an atom has broken apart and needs to be restored to its original condition.
   * @public
   */
  restoreActiveMolecule() {
    const currentTarget = this.photonTargetProperty.get();
    this.updateActiveMolecule(currentTarget, this.photonAbsorptionModel);
  }
}
greenhouseEffect.register('PhotonAbsorptionModel', PhotonAbsorptionModel);

// @public {number} - horizontal velocity of photons when they leave the emitter, in picometers/second
PhotonAbsorptionModel.PHOTON_VELOCITY = PHOTON_VELOCITY;
export default PhotonAbsorptionModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiRW51bWVyYXRpb25Qcm9wZXJ0eSIsIk51bWJlclByb3BlcnR5IiwiUHJvcGVydHkiLCJWZWN0b3IyIiwiVGltZVNwZWVkIiwiUGhldGlvR3JvdXAiLCJQaGV0aW9PYmplY3QiLCJFbnVtZXJhdGlvbklPIiwiZ3JlZW5ob3VzZUVmZmVjdCIsIk1pY3JvUGhvdG9uIiwiTW9sZWN1bGUiLCJDSDQiLCJDTyIsIkNPMiIsIkgyTyIsIk4yIiwiTk8yIiwiTzIiLCJPMyIsIlBob3RvblRhcmdldCIsIldhdmVsZW5ndGhDb25zdGFudHMiLCJQSE9UT05fRU1JU1NJT05fUE9TSVRJT04iLCJQSE9UT05fVkVMT0NJVFkiLCJERUZBVUxUX1BIT1RPTl9FTUlTU0lPTl9QRVJJT0QiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsIkRFRkFVTFRfRU1JVFRFRF9QSE9UT05fV0FWRUxFTkdUSCIsIklSX1dBVkVMRU5HVEgiLCJJTklUSUFMX0NPVU5URE9XTl9XSEVOX0VNSVNTSU9OX0VOQUJMRUQiLCJFTUlUVEVSX09OX0VNSVNTSU9OX1BFUklPRCIsIkVNSVRURVJfT0ZGX0VNSVNTSU9OX1BFUklPRCIsIlNMT1dfU1BFRURfRkFDVE9SIiwiUGhvdG9uQWJzb3JwdGlvbk1vZGVsIiwiY29uc3RydWN0b3IiLCJpbml0aWFsUGhvdG9uVGFyZ2V0IiwidGFuZGVtIiwicGhvdG9uQWJzb3JwdGlvbk1vZGVsIiwicGhvdG9uR3JvdXAiLCJ3YXZlbGVuZ3RoIiwicGhldGlvVHlwZSIsIlBoZXRpb0dyb3VwSU8iLCJQaG90b25JTyIsImNyZWF0ZVRhbmRlbSIsInBob3RvbkVtaXR0ZXJPblByb3BlcnR5IiwicGhvdG9uV2F2ZWxlbmd0aFByb3BlcnR5IiwidW5pdHMiLCJ2YWxpZFZhbHVlcyIsIk1JQ1JPX1dBVkVMRU5HVEgiLCJWSVNJQkxFX1dBVkVMRU5HVEgiLCJVVl9XQVZFTEVOR1RIIiwicGhvdG9uVGFyZ2V0UHJvcGVydHkiLCJwaGV0aW9WYWx1ZVR5cGUiLCJWQUxVRVMiLCJ0YXJnZXRNb2xlY3VsZSIsInJ1bm5pbmdQcm9wZXJ0eSIsInRpbWVTcGVlZFByb3BlcnR5IiwiTk9STUFMIiwiU0xPVyIsInNsb3dNb3Rpb25Qcm9wZXJ0eSIsInNwZWVkIiwiYWN0aXZlTW9sZWN1bGVzIiwiT2JzZXJ2YWJsZUFycmF5SU8iLCJNb2xlY3VsZUlPIiwicGhvdG9uRW1pdHRlZEVtaXR0ZXIiLCJwYXJhbWV0ZXJzIiwidmFsdWVUeXBlIiwicmVzZXRFbWl0dGVyIiwibWFudWFsU3RlcEVtaXR0ZXIiLCJsaW5rIiwicGhvdG9uVGFyZ2V0IiwidXBkYXRlQWN0aXZlTW9sZWN1bGUiLCJlbWl0dGVyT24iLCJzZXRQaG90b25FbWlzc2lvblBlcmlvZCIsImxhenlMaW5rIiwicmVzZXRQaG90b25zIiwiZ2V0Iiwic2V0RW1pc3Npb25UaW1lclRvSW5pdGlhbENvdW50ZG93biIsInBob3RvbkVtaXNzaW9uQ291bnRkb3duVGltZXIiLCJwaG90b25FbWlzc2lvblBlcmlvZFRhcmdldCIsInJlc2V0IiwibW9sZWN1bGUiLCJsZW5ndGgiLCJzZXRFbWl0dGVkUGhvdG9uV2F2ZWxlbmd0aCIsImVtaXQiLCJwaGV0Iiwiam9pc3QiLCJzaW0iLCJpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5IiwidmFsdWUiLCJjbGVhciIsInN0ZXAiLCJkdCIsInN0ZXBQaG90b25zIiwiY2hlY2tFbWlzc2lvblRpbWVyIiwic3RlcE1vbGVjdWxlcyIsImVtaXRQaG90b24iLCJNYXRoIiwiYWJzIiwicGhvdG9uc1RvUmVtb3ZlIiwiZm9yRWFjaCIsInBob3RvbiIsInF1ZXJ5QWJzb3JiUGhvdG9uIiwicHVzaCIsImRpc3Bvc2VFbGVtZW50IiwiY2xlYXJQaG90b25zIiwibW9sZWN1bGVzVG9TdGVwIiwic2xpY2UiLCJtYW51YWxTdGVwIiwiYWR2YW5jZUFtb3VudCIsImNyZWF0ZU5leHRFbGVtZW50IiwicG9zaXRpb25Qcm9wZXJ0eSIsInNldCIsIngiLCJ5IiwiZW1pc3Npb25BbmdsZSIsInNldFZlbG9jaXR5IiwiY29zIiwic2luIiwiZnJlcSIsImdldFBob3RvbkVtaXNzaW9uUG9zaXRpb24iLCJwaG90b25FbWlzc2lvblBlcmlvZCIsImFzc2VydCIsImNvdW50IiwiZGlzcG9zZSIsIm5ld01vbGVjdWxlIiwiU0lOR0xFX0NPX01PTEVDVUxFIiwiU0lOR0xFX0NPMl9NT0xFQ1VMRSIsIlNJTkdMRV9IMk9fTU9MRUNVTEUiLCJTSU5HTEVfTjJfTU9MRUNVTEUiLCJTSU5HTEVfTzJfTU9MRUNVTEUiLCJTSU5HTEVfTzNfTU9MRUNVTEUiLCJTSU5HTEVfTk8yX01PTEVDVUxFIiwiU0lOR0xFX0NINF9NT0xFQ1VMRSIsImFkZCIsImJyb2tlQXBhcnRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJjb25zdGl0dWVudE1vbGVjdWxlMSIsImNvbnN0aXR1ZW50TW9sZWN1bGUyIiwicmVtb3ZlIiwiZ2V0TW9sZWN1bGVzIiwiaGFzQm90aENvbnN0aXR1ZW50TW9sZWN1bGVzIiwibW9sZWN1bGVBIiwibW9sZWN1bGVCIiwiaW5jbHVkZXMiLCJyZXN0b3JlQWN0aXZlTW9sZWN1bGUiLCJjdXJyZW50VGFyZ2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQaG90b25BYnNvcnB0aW9uTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgZm9yIE1vbGVjdWxlcyBhbmQgTGlnaHQuICBJdCBpcyBjYWxsZWQgUGhvdG9uQWJzb3JwdGlvbk1vZGVsIGJlY2F1c2UgaXQgY2FtZSBmcm9tIHRoZSBvcmlnaW5hbCBKYXZhIHZlcnNpb25cclxuICogaW4gYSBmaWxlIGNhbGxlZCBQaG90b25BYnNvcnB0aW9uTW9kZWwuamF2YSwgd2hpY2ggaXMgdXNlZCBieSBib3RoIFwiTW9sZWN1bGVzICYgTGlnaHRcIiBhbmQgXCJHcmVlbmhvdXNlIEdhc1wiXHJcbiAqXHJcbiAqIFRoaXMgbW9kZWxzIHBob3RvbnMgYmVpbmcgYWJzb3JiZWQgKG9yIG9mdGVuIE5PVCBhYnNvcmJlZCkgYnkgdmFyaW91cyBtb2xlY3VsZXMuICBUaGUgc2NhbGUgZm9yIHRoaXMgbW9kZWwgaXNcclxuICogcGljb21ldGVycyAoMTBFLTEyIG1ldGVycykuXHJcbiAqXHJcbiAqIFRoZSBiYXNpYyBpZGVhIGZvciB0aGlzIG1vZGVsIGlzIHRoYXQgdGhlcmUgaXMgc29tZSBzb3J0IG9mIHBob3RvbiBlbWl0dGVyIHRoYXQgZW1pdHMgcGhvdG9ucywgYW5kIHNvbWUgc29ydCBvZlxyXG4gKiBwaG90b24gdGFyZ2V0IHRoYXQgY291bGQgcG90ZW50aWFsbHkgc29tZSBvZiB0aGUgZW1pdHRlZCBwaG90b25zIGFuZCByZWFjdCBpbiBzb21lIHdheS4gIEluIG1hbnkgY2FzZXMsIHRoZSBwaG90b25cclxuICogdGFyZ2V0IGNhbiByZS1lbWl0IG9uZSBvciBtb3JlIHBob3RvbnMgYWZ0ZXIgYWJzb3JwdGlvbi5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFRpbWVTcGVlZCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVGltZVNwZWVkLmpzJztcclxuaW1wb3J0IFBoZXRpb0dyb3VwIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9Hcm91cC5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9FbnVtZXJhdGlvbklPLmpzJztcclxuaW1wb3J0IGdyZWVuaG91c2VFZmZlY3QgZnJvbSAnLi4vLi4vZ3JlZW5ob3VzZUVmZmVjdC5qcyc7XHJcbmltcG9ydCBNaWNyb1Bob3RvbiBmcm9tICcuL01pY3JvUGhvdG9uLmpzJztcclxuaW1wb3J0IE1vbGVjdWxlIGZyb20gJy4vTW9sZWN1bGUuanMnO1xyXG5pbXBvcnQgQ0g0IGZyb20gJy4vbW9sZWN1bGVzL0NINC5qcyc7XHJcbmltcG9ydCBDTyBmcm9tICcuL21vbGVjdWxlcy9DTy5qcyc7XHJcbmltcG9ydCBDTzIgZnJvbSAnLi9tb2xlY3VsZXMvQ08yLmpzJztcclxuaW1wb3J0IEgyTyBmcm9tICcuL21vbGVjdWxlcy9IMk8uanMnO1xyXG5pbXBvcnQgTjIgZnJvbSAnLi9tb2xlY3VsZXMvTjIuanMnO1xyXG5pbXBvcnQgTk8yIGZyb20gJy4vbW9sZWN1bGVzL05PMi5qcyc7XHJcbmltcG9ydCBPMiBmcm9tICcuL21vbGVjdWxlcy9PMi5qcyc7XHJcbmltcG9ydCBPMyBmcm9tICcuL21vbGVjdWxlcy9PMy5qcyc7XHJcbmltcG9ydCBQaG90b25UYXJnZXQgZnJvbSAnLi9QaG90b25UYXJnZXQuanMnO1xyXG5pbXBvcnQgV2F2ZWxlbmd0aENvbnN0YW50cyBmcm9tICcuL1dhdmVsZW5ndGhDb25zdGFudHMuanMnO1xyXG5cclxuLy8gLS0tLS0tLSBjb25zdGFudHMgLS0tLS0tLS0tLS0tLVxyXG5cclxuLy8gY29uc3RhbnRzIHRoYXQgY29udHJvbCB3aGVyZSBhbmQgaG93IHBob3RvbnMgYXJlIGVtaXR0ZWQuXHJcbmNvbnN0IFBIT1RPTl9FTUlTU0lPTl9QT1NJVElPTiA9IG5ldyBWZWN0b3IyKCAtMTM1MCwgMCApO1xyXG5cclxuLy8gVmVsb2NpdHkgb2YgZW1pdHRlZCBwaG90b25zLiAgU2luY2UgdGhleSBhcmUgZW1pdHRlZCBob3Jpem9udGFsbHksIG9ubHkgb25lIHZhbHVlIGlzIG5lZWRlZC5cclxuY29uc3QgUEhPVE9OX1ZFTE9DSVRZID0gMzAwMDsgLy8gcGljb21ldGVycy9zZWNvbmRcclxuXHJcbi8vIERlZmF1bHRzIGZvciBwaG90b24gZW1pc3Npb24gcGVyaW9kcy5cclxuY29uc3QgREVGQVVMVF9QSE9UT05fRU1JU1NJT05fUEVSSU9EID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZOyAvLyBNaWxsaXNlY29uZHMgb2Ygc2ltIHRpbWUuXHJcblxyXG4vLyBEZWZhdWx0IHZhbHVlcyBmb3IgdmFyaW91cyBwYXJhbWV0ZXJzIHRoYXQgd2VyZW4ndCBhbHJlYWR5IGNvdmVyZWQuXHJcbmNvbnN0IERFRkFVTFRfRU1JVFRFRF9QSE9UT05fV0FWRUxFTkdUSCA9IFdhdmVsZW5ndGhDb25zdGFudHMuSVJfV0FWRUxFTkdUSDtcclxuY29uc3QgSU5JVElBTF9DT1VOVERPV05fV0hFTl9FTUlTU0lPTl9FTkFCTEVEID0gMC4wOyAvLyBzZWNvbmRzLCBlbWl0dGVkIHJpZ2h0IGF3YXlcclxuXHJcbi8vIHBob3RvbiBlbWlzc2lvbiBwZXJpb2RzLCBpbiBzZWNvbmRzXHJcbmNvbnN0IEVNSVRURVJfT05fRU1JU1NJT05fUEVSSU9EID0gMC44O1xyXG5jb25zdCBFTUlUVEVSX09GRl9FTUlTU0lPTl9QRVJJT0QgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcblxyXG4vLyB3aGVuIHN0ZXBwaW5nIGF0IFwic2xvd1wiIHNwZWVkLCBhbmltYXRlIHJhdGUgaXMgcmVkdWNlZCBieSB0aGlzIGZhY3RvclxyXG5jb25zdCBTTE9XX1NQRUVEX0ZBQ1RPUiA9IDAuNTtcclxuXHJcbmNsYXNzIFBob3RvbkFic29ycHRpb25Nb2RlbCBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIGZvciBhIHBob3RvbiBhYnNvcnB0aW9uIG1vZGVsLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQaG90b25UYXJnZXR9IGluaXRpYWxQaG90b25UYXJnZXQgLSBJbml0aWFsIG1vbGVjdWxlIHdoaWNoIHRoZSBwaG90b24gZ2V0cyBmaXJlZCBhdC5cclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGluaXRpYWxQaG90b25UYXJnZXQsIHRhbmRlbSApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy5waG90b25BYnNvcnB0aW9uTW9kZWwgPSB0YW5kZW07IC8vIEBwcml2YXRlXHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMucGhvdG9uR3JvdXAgPSBuZXcgUGhldGlvR3JvdXAoICggdGFuZGVtLCB3YXZlbGVuZ3RoICkgPT4gbmV3IE1pY3JvUGhvdG9uKCB3YXZlbGVuZ3RoLCB7IHRhbmRlbTogdGFuZGVtIH0gKSwgWyBXYXZlbGVuZ3RoQ29uc3RhbnRzLklSX1dBVkVMRU5HVEggXSwge1xyXG4gICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBNaWNyb1Bob3Rvbi5QaG90b25JTyApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwaG90b25Hcm91cCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBQcm9wZXJ0eSB0aGF0IGluZGljYXRpbmcgd2hldGhlciBwaG90b25zIGFyZSBiZWluZyBlbWl0dGVkIGZyb20gdGhlIHBob3RvbiBlbWl0dGVyXHJcbiAgICB0aGlzLnBob3RvbkVtaXR0ZXJPblByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGhvdG9uRW1pdHRlck9uUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLnBob3RvbldhdmVsZW5ndGhQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggV2F2ZWxlbmd0aENvbnN0YW50cy5JUl9XQVZFTEVOR1RILCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Bob3RvbldhdmVsZW5ndGhQcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICdtJyxcclxuICAgICAgdmFsaWRWYWx1ZXM6IFtcclxuICAgICAgICBXYXZlbGVuZ3RoQ29uc3RhbnRzLk1JQ1JPX1dBVkVMRU5HVEgsXHJcbiAgICAgICAgV2F2ZWxlbmd0aENvbnN0YW50cy5JUl9XQVZFTEVOR1RILFxyXG4gICAgICAgIFdhdmVsZW5ndGhDb25zdGFudHMuVklTSUJMRV9XQVZFTEVOR1RILFxyXG4gICAgICAgIFdhdmVsZW5ndGhDb25zdGFudHMuVVZfV0FWRUxFTkdUSFxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8ge1Byb3BlcnR5LjxQaG90b25UYXJnZXQ+fVxyXG4gICAgdGhpcy5waG90b25UYXJnZXRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggaW5pdGlhbFBob3RvblRhcmdldCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwaG90b25UYXJnZXRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBFbnVtZXJhdGlvbklPKCBQaG90b25UYXJnZXQgKSxcclxuICAgICAgdmFsaWRWYWx1ZXM6IFBob3RvblRhcmdldC5WQUxVRVNcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtudWxsfE1vbGVjdWxlfSAtIEEgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IHRhcmdldCBtb2xlY3VsZSwgZGV0ZXJtaW5lZCBmcm9tIHRoZVxyXG4gICAgLy8gcGhvdG9uVGFyZ2V0UHJvcGVydHkuIElmIHRoZSBtb2xlY3VsZSBicmVha3MgYXBhcnQgdGhpcyB3aWxsIGJlY29tZSBudWxsIGFnYWluLlxyXG4gICAgdGhpcy50YXJnZXRNb2xlY3VsZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAoQm9vbGVhblByb3BlcnR5KSAtIFdoZXRoZXIgb3IgdGhlIHNpbXVsYXRpb24gaXMgY3VycmVudGx5IHBsYXlpbmcgb3IgcGF1c2VkXHJcbiAgICB0aGlzLnJ1bm5pbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncnVubmluZ1Byb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyBjb250cm9scyBwbGF5IHNwZWVkIG9mIHRoZSBzaW11bGF0aW9uXHJcbiAgICB0aGlzLnRpbWVTcGVlZFByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uUHJvcGVydHkoIFRpbWVTcGVlZC5OT1JNQUwsIHtcclxuICAgICAgdmFsaWRWYWx1ZXM6IFsgVGltZVNwZWVkLk5PUk1BTCwgVGltZVNwZWVkLlNMT1cgXSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGltZVNwZWVkUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gY29udmVuaWVuY2UgUHJvcGVydHksIGluZGljYXRpbmcgd2hldGhlciBzaW0gaXMgcnVubmluZyBpbiBzbG93IG1vdGlvblxyXG4gICAgdGhpcy5zbG93TW90aW9uUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMudGltZVNwZWVkUHJvcGVydHkgXSwgc3BlZWQgPT4gc3BlZWQgPT09IFRpbWVTcGVlZC5TTE9XICk7XHJcblxyXG4gICAgdGhpcy5hY3RpdmVNb2xlY3VsZXMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW9sZWN1bGVzJyApLFxyXG4gICAgICBwaGV0aW9UeXBlOiBjcmVhdGVPYnNlcnZhYmxlQXJyYXkuT2JzZXJ2YWJsZUFycmF5SU8oIE1vbGVjdWxlLk1vbGVjdWxlSU8gKVxyXG4gICAgfSApOyAvLyBFbGVtZW50cyBhcmUgb2YgdHlwZSBNb2xlY3VsZS5cclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtFbWl0dGVyfSAtIGVtaXR0ZXIgZm9yIHdoZW4gYSBwaG90b24gaXMgZW1pdHRlZCBmcm9tIHRoZSBlbWlzc2lvbiBwb2ludCAtIHVzZWZ1bCBpbiBhZGRpdGlvblxyXG4gICAgLy8gdG8gdGhlIHBob3RvbnMgT2JzZXJ2YWJsZUFycmF5RGVmIGJlY2F1c2UgdGhpcyBpcyBzcGVjaWZpY2FsbHkgZm9yIHBob3RvbiBlbWlzc2lvbiBmcm9tIHRoZSBsaWdodCBzb3VyY2VcclxuICAgIHRoaXMucGhvdG9uRW1pdHRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiBNaWNyb1Bob3RvbiB9IF0gfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBFbWl0cyB3aGVuIHRoZSBtb2RlbCBoYXMgYmVlbiByZXNldFxyXG4gICAgdGhpcy5yZXNldEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBFbWl0cyBhbiBldmVudCB3aGVuIHRoZSB1c2VyIG1hbnVhbGx5IHN0ZXBzIGZvcndhcmQgb25lIGZyYW1lXHJcbiAgICB0aGlzLm1hbnVhbFN0ZXBFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICAvLyBMaW5rIHRoZSBtb2RlbCdzIGFjdGl2ZSBtb2xlY3VsZSB0byB0aGUgcGhvdG9uIHRhcmdldCBwcm9wZXJ0eS4gIE5vdGUgdGhhdCB0aGlzIHdpcmluZyBtdXN0IGJlIGRvbmUgYWZ0ZXIgdGhlXHJcbiAgICAvLyBsaXN0ZW5lcnMgZm9yIHRoZSBhY3RpdmVNb2xlY3VsZXMgb2JzZXJ2YWJsZSBhcnJheSBoYXZlIGJlZW4gaW1wbGVtZW50ZWQuXHJcbiAgICB0aGlzLnBob3RvblRhcmdldFByb3BlcnR5LmxpbmsoIHBob3RvblRhcmdldCA9PiB0aGlzLnVwZGF0ZUFjdGl2ZU1vbGVjdWxlKCBwaG90b25UYXJnZXQsIHRhbmRlbSApICk7XHJcblxyXG4gICAgLy8gd2hlbiB0aGUgcGhvdG9uIGVtaXR0ZXIgaXMgb24sIHNldCB0byBkZWZhdWx0IFwib25cIiBhbmQgXCJvZmZcIiBwZXJpb2RcclxuICAgIHRoaXMucGhvdG9uRW1pdHRlck9uUHJvcGVydHkubGluayggZW1pdHRlck9uID0+IHtcclxuICAgICAgdGhpcy5zZXRQaG90b25FbWlzc2lvblBlcmlvZCggZW1pdHRlck9uID8gRU1JVFRFUl9PTl9FTUlTU0lPTl9QRVJJT0QgOiBFTUlUVEVSX09GRl9FTUlTU0lPTl9QRVJJT0QgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDbGVhciBhbGwgcGhvdG9ucyB0byBhdm9pZCBjYXNlcyB3aGVyZSBwaG90b25zIG9mIHRoZSBwcmV2aW91cyB3YXZlbGVuZ3RoXHJcbiAgICAvLyBjb3VsZCBiZSBhYnNvcmJlZCBhZnRlciBuZXcgd2F2ZWxlbmd0aCB3YXMgc2VsZWN0ZWQuIFNvbWUgdXNlcnMgaW50ZXJwcmV0ZWRcclxuICAgIC8vIGFic29ycHRpb24gb2YgdGhlIHByZXZpb3VzIHdhdmVsZW5ndGggYXMgYWJzb3JwdGlvbiBvZiB0aGUgc2VsZWN0ZWQgd2F2ZWxlbmd0aFxyXG4gICAgdGhpcy5waG90b25XYXZlbGVuZ3RoUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgdGhpcy5yZXNldFBob3RvbnMoKTtcclxuXHJcbiAgICAgIC8vIGFmdGVyIGNsZWFyaW5nLCBuZXh0IHBob3RvbiBzaG91bGQgYmUgZW1pdHRlZCByaWdodCBhd2F5XHJcbiAgICAgIGlmICggdGhpcy5waG90b25FbWl0dGVyT25Qcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICB0aGlzLnNldEVtaXNzaW9uVGltZXJUb0luaXRpYWxDb3VudGRvd24oKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFZhcmlhYmxlcyB0aGF0IGNvbnRyb2wgcGVyaW9kaWMgcGhvdG9uIGVtaXNzaW9uLlxyXG4gICAgdGhpcy5waG90b25FbWlzc2lvbkNvdW50ZG93blRpbWVyID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5waG90b25FbWlzc2lvblBlcmlvZFRhcmdldCA9IERFRkFVTFRfUEhPVE9OX0VNSVNTSU9OX1BFUklPRDsgLy8gQHByaXZhdGVcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBSZXNldCB0aGUgbW9kZWwgdG8gaXRzIGluaXRpYWwgc3RhdGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG5cclxuICAgIHRoaXMucmVzZXRQaG90b25zKCk7XHJcblxyXG4gICAgLy8gUmVzZXQgYWxsIGFjdGl2ZSBtb2xlY3VsZXMsIHdoaWNoIHdpbGwgc3RvcCBhbnkgdmlicmF0aW9ucy5cclxuICAgIGZvciAoIGxldCBtb2xlY3VsZSA9IDA7IG1vbGVjdWxlIDwgdGhpcy5hY3RpdmVNb2xlY3VsZXMubGVuZ3RoOyBtb2xlY3VsZSsrICkge1xyXG4gICAgICB0aGlzLmFjdGl2ZU1vbGVjdWxlcy5nZXQoIG1vbGVjdWxlICkucmVzZXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTZXQgZGVmYXVsdCB2YWx1ZXMuXHJcbiAgICB0aGlzLnBob3RvblRhcmdldFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNldEVtaXR0ZWRQaG90b25XYXZlbGVuZ3RoKCBERUZBVUxUX0VNSVRURURfUEhPVE9OX1dBVkVMRU5HVEggKTtcclxuICAgIHRoaXMuc2V0UGhvdG9uRW1pc3Npb25QZXJpb2QoIERFRkFVTFRfUEhPVE9OX0VNSVNTSU9OX1BFUklPRCApO1xyXG5cclxuICAgIC8vIFJlc2V0IGFsbCBhc3NvY2lhdGVkIHByb3BlcnRpZXMuXHJcbiAgICB0aGlzLnBob3RvbkVtaXR0ZXJPblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnBob3RvbldhdmVsZW5ndGhQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5ydW5uaW5nUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudGltZVNwZWVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucGhvdG9uVGFyZ2V0UHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICAvLyBicm9hZGNhc3QgdGhhdCB0aGUgbW9kZWwgaGFzIGJlZW4gcmVzZXRcclxuICAgIHRoaXMucmVzZXRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFycyBhbGwgcGhvdG9ucy5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXRQaG90b25zKCkge1xyXG5cclxuICAgIC8vIElmIHNldHRpbmcgc3RhdGUsIHRoZSBzdGF0ZSBlbmdpbmUgd2lsbCBkbyB0aGlzIHN0ZXAuXHJcbiAgICBpZiAoICFwaGV0LmpvaXN0LnNpbS5pc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLnBob3Rvbkdyb3VwLmNsZWFyKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZHZhbmNlIHRoZSBtb2xlY3VsZXMgb25lIHN0ZXAgaW4gdGltZS4gIENhbGxlZCBieSB0aGUgYW5pbWF0aW9uIGxvb3AuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gVGhlIGluY3JlbWVudGFsIHRpbWUgc3RlcC5cclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuXHJcbiAgICAvLyBSZWplY3QgbGFyZ2UgZHQgdmFsdWVzIHRoYXQgb2Z0ZW4gcmVzdWx0IGZyb20gcmV0dXJuaW5nIHRvIHRoaXMgc2ltIHdoZW4gaXQgaGFzIGJlZW4gaGlkZGVuLCBlLmcuIHdoZW4gYW5vdGhlclxyXG4gICAgLy8gdGFiIHdhcyBvcGVuIGluIHRoZSBicm93c2VyIG9yIHRoZSBicm93c2VyIHdhcyBtaW5pbWl6ZWQuICBUaGUgbm9taW5hbCBkdCB2YWx1ZSBpcyBiYXNlZCBvbiA2MCBmcHMgYW5kIGlzXHJcbiAgICAvLyAxLzYwID0gMC4wMTY2Njcgc2VjLlxyXG4gICAgaWYgKCBkdCA+IDAuMiApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlZHVjZSB0aW1lIHN0ZXAgaWYgcnVubmluZyBpbiBzbG93IG1vdGlvblxyXG4gICAgaWYgKCB0aGlzLnNsb3dNb3Rpb25Qcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgZHQgPSBkdCAqIFNMT1dfU1BFRURfRkFDVE9SO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5ydW5uaW5nUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICAvLyBTdGVwIHRoZSBwaG90b25zLCBtYXJraW5nIGFuZCByZW1vdmluZyBhbnkgdGhhdCBoYXZlIG1vdmVkIGJleW9uZCB0aGUgbW9kZWxcclxuICAgICAgdGhpcy5zdGVwUGhvdG9ucyggZHQgKTtcclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIGl0IGlzIHRpbWUgdG8gZW1pdCBhbnkgcGhvdG9ucy5cclxuICAgICAgdGhpcy5jaGVja0VtaXNzaW9uVGltZXIoIGR0ICk7XHJcblxyXG4gICAgICAvLyBTdGVwIHRoZSBtb2xlY3VsZXMuXHJcbiAgICAgIHRoaXMuc3RlcE1vbGVjdWxlcyggZHQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIGlmIGl0IGlzIHRpbWUgdG8gZW1pdCBhbnkgcGhvdG9ucyBmcm9tIHRoZSBwaG90b24gZW1pdHRlci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSB0aGUgaW5jcmVtZW50YWwgdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgY2hlY2tFbWlzc2lvblRpbWVyKCBkdCApIHtcclxuXHJcbiAgICBpZiAoIHRoaXMucGhvdG9uRW1pc3Npb25Db3VudGRvd25UaW1lciAhPT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZICkge1xyXG4gICAgICB0aGlzLnBob3RvbkVtaXNzaW9uQ291bnRkb3duVGltZXIgLT0gZHQ7XHJcbiAgICAgIGlmICggdGhpcy5waG90b25FbWlzc2lvbkNvdW50ZG93blRpbWVyIDw9IDAgKSB7XHJcbiAgICAgICAgLy8gVGltZSB0byBlbWl0LlxyXG4gICAgICAgIHRoaXMuZW1pdFBob3RvbiggTWF0aC5hYnMoIHRoaXMucGhvdG9uRW1pc3Npb25Db3VudGRvd25UaW1lciApICk7XHJcbiAgICAgICAgdGhpcy5waG90b25FbWlzc2lvbkNvdW50ZG93blRpbWVyID0gdGhpcy5waG90b25FbWlzc2lvblBlcmlvZFRhcmdldDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdGltZXIgdG8gdGhlIGluaXRpYWwgY291bnRkb3duIHRpbWUgd2hlbiBlbWlzc2lvbiBpcyBmaXJzdCBlbmFibGVkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRFbWlzc2lvblRpbWVyVG9Jbml0aWFsQ291bnRkb3duKCkge1xyXG4gICAgdGhpcy5waG90b25FbWlzc2lvbkNvdW50ZG93blRpbWVyID0gSU5JVElBTF9DT1VOVERPV05fV0hFTl9FTUlTU0lPTl9FTkFCTEVEO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcCB0aGUgcGhvdG9ucyBpbiB0aW1lLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRoZSBpbmNyZW1lbnRhbCB0aW1lcyBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgc3RlcFBob3RvbnMoIGR0ICkge1xyXG4gICAgY29uc3QgcGhvdG9uc1RvUmVtb3ZlID0gW107XHJcblxyXG4gICAgLy8gY2hlY2sgZm9yIHBvc3NpYmxlIGludGVyYWN0aW9uIGJldHdlZW4gZWFjaCBwaG90b24gYW5kIG1vbGVjdWxlXHJcbiAgICB0aGlzLnBob3Rvbkdyb3VwLmZvckVhY2goIHBob3RvbiA9PiB7XHJcbiAgICAgIHRoaXMuYWN0aXZlTW9sZWN1bGVzLmZvckVhY2goIG1vbGVjdWxlID0+IHtcclxuICAgICAgICBpZiAoIG1vbGVjdWxlLnF1ZXJ5QWJzb3JiUGhvdG9uKCBwaG90b24gKSApIHtcclxuXHJcbiAgICAgICAgICAvLyB0aGUgcGhvdG9uIHdhcyBhYnNvcmJlZCwgc28gcHV0IGl0IG9uIHRoZSByZW1vdmFsIGxpc3RcclxuICAgICAgICAgIHBob3RvbnNUb1JlbW92ZS5wdXNoKCBwaG90b24gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgICAgcGhvdG9uLnN0ZXAoIGR0ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUmVtb3ZlIGFueSBwaG90b25zIHRoYXQgd2VyZSBtYXJrZWQgZm9yIHJlbW92YWwuXHJcbiAgICBwaG90b25zVG9SZW1vdmUuZm9yRWFjaCggcGhvdG9uID0+IHRoaXMucGhvdG9uR3JvdXAuZGlzcG9zZUVsZW1lbnQoIHBob3RvbiApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY2xlYXJQaG90b25zKCkge1xyXG4gICAgdGhpcy5waG90b25Hcm91cC5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcCB0aGUgbW9sZWN1bGVzIG9uZSBzdGVwIGluIHRpbWUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gVGhlIGluY3JlbWVudGFsIHRpbWUgc3RlcC5cclxuICAgKi9cclxuICBzdGVwTW9sZWN1bGVzKCBkdCApIHtcclxuICAgIGNvbnN0IG1vbGVjdWxlc1RvU3RlcCA9IHRoaXMuYWN0aXZlTW9sZWN1bGVzLnNsaWNlKCAwICk7XHJcbiAgICBmb3IgKCBsZXQgbW9sZWN1bGUgPSAwOyBtb2xlY3VsZSA8IG1vbGVjdWxlc1RvU3RlcC5sZW5ndGg7IG1vbGVjdWxlKysgKSB7XHJcbiAgICAgIG1vbGVjdWxlc1RvU3RlcFsgbW9sZWN1bGUgXS5zdGVwKCBkdCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcCBvbmUgZnJhbWUgbWFudWFsbHkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gdGltZSB0byBzdGVwIGZvcndhcmQgdGhlIG1vZGVsIGJ5LCBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgbWFudWFsU3RlcCggZHQgKSB7XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgaXQgaXMgdGltZSB0byBlbWl0IGFueSBwaG90b25zLlxyXG4gICAgdGhpcy5jaGVja0VtaXNzaW9uVGltZXIoIGR0ICk7XHJcblxyXG4gICAgLy8gU3RlcCB0aGUgcGhvdG9ucywgbWFya2luZyBhbmQgcmVtb3ZpbmcgYW55IHRoYXQgaGF2ZSBtb3ZlZCBiZXlvbmQgdGhlIG1vZGVsIGJvdW5kcy5cclxuICAgIHRoaXMuc3RlcFBob3RvbnMoIGR0ICk7XHJcblxyXG4gICAgLy8gU3RlcCB0aGUgbW9sZWN1bGVzLlxyXG4gICAgdGhpcy5zdGVwTW9sZWN1bGVzKCBkdCApO1xyXG5cclxuICAgIHRoaXMubWFudWFsU3RlcEVtaXR0ZXIuZW1pdCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2F1c2UgYSBwaG90b24gdG8gYmUgZW1pdHRlZCBmcm9tIHRoZSBlbWlzc2lvbiBwb2ludC4gIEVtaXR0ZWQgcGhvdG9ucyB3aWxsIHRyYXZlbCB0b3dhcmQgdGhlIHBob3RvbiB0YXJnZXQsXHJcbiAgICogd2hpY2ggd2lsbCBkZWNpZGUgd2hldGhlciBhIGdpdmVuIHBob3RvbiBzaG91bGQgYmUgYWJzb3JiZWQuXHJcbiAgICogQHBhcmFtIGFkdmFuY2VBbW91bnQgLSBhbW91bnQgb2YgdGltZSB0aGF0IHRoZSBwaG90b24gc2hvdWxkIGJlIFwiYWR2YW5jZWRcIiBmcm9tIGl0cyBzdGFydGluZyBwb3NpdGlvbi4gIFRoaXNcclxuICAgKiBtYWtlcyBpdCBwb3NzaWJsZSB0byBtYWtlIHRoZSBlbWlzc2lvbiBzdHJlYW0gbG9vayBtb3JlIGNvbnN0YW50IGluIGNhc2VzIHdoZXJlIHRoZXJlIHdhcyBhIGxvbmcgZGVsYXkgYmV0d2VlblxyXG4gICAqIGZyYW1lcy5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZW1pdFBob3RvbiggYWR2YW5jZUFtb3VudCApIHtcclxuICAgIGNvbnN0IHBob3RvbiA9IHRoaXMucGhvdG9uR3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoIHRoaXMucGhvdG9uV2F2ZWxlbmd0aFByb3BlcnR5LmdldCgpICk7XHJcbiAgICBwaG90b24ucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCBQSE9UT05fRU1JU1NJT05fUE9TSVRJT04ueCArIFBIT1RPTl9WRUxPQ0lUWSAqIGFkdmFuY2VBbW91bnQsIFBIT1RPTl9FTUlTU0lPTl9QT1NJVElPTi55ICkgKTtcclxuICAgIGNvbnN0IGVtaXNzaW9uQW5nbGUgPSAwOyAvLyBTdHJhaWdodCB0byB0aGUgcmlnaHQuXHJcbiAgICBwaG90b24uc2V0VmVsb2NpdHkoIFBIT1RPTl9WRUxPQ0lUWSAqIE1hdGguY29zKCBlbWlzc2lvbkFuZ2xlICksIFBIT1RPTl9WRUxPQ0lUWSAqIE1hdGguc2luKCBlbWlzc2lvbkFuZ2xlICkgKTtcclxuXHJcbiAgICAvLyBpbmRpY2F0ZSB0aGF0IGEgcGhvdG9uIGhhcyBiZWVuIGVtaXR0ZWQgZnJvbSB0aGUgaW5pdGlhbCBlbWlzc2lvbiBwb2ludFxyXG4gICAgdGhpcy5waG90b25FbWl0dGVkRW1pdHRlci5lbWl0KCBwaG90b24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgd2F2ZWxlbmd0aCBvZiB0aGUgcGhvdG9uIHRvIGJlIGVtaXR0ZWQgaWYgZGVzaXJlZCBmcmVxdWVuY3kgaXMgbm90IGVxdWFsIHRvIHRoZSBjdXJyZW50IHZhbHVlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBmcmVxXHJcbiAgICovXHJcbiAgc2V0RW1pdHRlZFBob3RvbldhdmVsZW5ndGgoIGZyZXEgKSB7XHJcbiAgICBpZiAoIHRoaXMucGhvdG9uV2F2ZWxlbmd0aFByb3BlcnR5LmdldCgpICE9PSBmcmVxICkge1xyXG4gICAgICAvLyBTZXQgdGhlIG5ldyB2YWx1ZSBhbmQgc2VuZCBvdXQgbm90aWZpY2F0aW9uIG9mIGNoYW5nZSB0byBsaXN0ZW5lcnMuXHJcbiAgICAgIHRoaXMucGhvdG9uV2F2ZWxlbmd0aFByb3BlcnR5LnNldCggZnJlcSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBlbWlzc2lvbiBwb3NpdGlvbiBmb3IgdGhpcyBwaG90b25BYnNvcnB0aW9uTW9kZWwuICBVc2VmdWwgd2hlbiBvdGhlciBtb2RlbHMgbmVlZCBhY2Nlc3MgdG8gdGhpcyBwb3NpdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKi9cclxuICBnZXRQaG90b25FbWlzc2lvblBvc2l0aW9uKCkge1xyXG4gICAgcmV0dXJuIFBIT1RPTl9FTUlTU0lPTl9QT1NJVElPTjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgZW1pc3Npb24gcGVyaW9kLCBpLmUuIHRoZSB0aW1lIGJldHdlZW4gcGhvdG9ucy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcGhvdG9uRW1pc3Npb25QZXJpb2QgLSBQZXJpb2QgYmV0d2VlbiBwaG90b25zIGluIG1pbGxpc2Vjb25kcy5cclxuICAgKi9cclxuICBzZXRQaG90b25FbWlzc2lvblBlcmlvZCggcGhvdG9uRW1pc3Npb25QZXJpb2QgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcGhvdG9uRW1pc3Npb25QZXJpb2QgPj0gMCApO1xyXG4gICAgaWYgKCB0aGlzLnBob3RvbkVtaXNzaW9uUGVyaW9kVGFyZ2V0ICE9PSBwaG90b25FbWlzc2lvblBlcmlvZCApIHtcclxuXHJcbiAgICAgIC8vIElmIHdlIGFyZSB0cmFuc2l0aW9uaW5nIGZyb20gb2ZmIHRvIG9uLCBzZXQgdGhlIGNvdW50ZG93biB0aW1lciBzdWNoIHRoYXQgYSBwaG90b24gd2lsbCBiZSBlbWl0dGVkIHJpZ2h0IGF3YXlcclxuICAgICAgLy8gc28gdGhhdCB0aGUgdXNlciBkb2Vzbid0IGhhdmUgdG8gd2FpdCB0b28gbG9uZyBpbiBvcmRlciB0byBzZWUgc29tZXRoaW5nIGNvbWUgb3V0LCBidXQgb25seSBpZiB0aGVyZVxyXG4gICAgICAvLyBhcmUgbm8gb3RoZXIgcGhvdG9ucyBpbiB0aGUgb2JzZXJ2YXRpb24gd2luZG93IHNvIHdlIGRvbid0IGVtaXQgdW5saW1pdHRlZCBwaG90b25zIHdoZW4gdHVybmluZ1xyXG4gICAgICAvLyBvbi9vZmYgcmFwaWRseVxyXG4gICAgICBpZiAoIHRoaXMucGhvdG9uRW1pc3Npb25QZXJpb2RUYXJnZXQgPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSAmJiBwaG90b25FbWlzc2lvblBlcmlvZCAhPT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZXHJcbiAgICAgICAgICAgJiYgdGhpcy5waG90b25Hcm91cC5jb3VudCA9PT0gMCApIHtcclxuXHJcbiAgICAgICAgLy8gb25seSByZXNldCB0aW1lIG9uIGVtaXNzaW9uIG9mIGZpcnN0IHBob3RvbiwgdGhlcmUgc2hvdWxkIHN0aWxsIGJlIGEgZGVsYXkgYWZ0ZXIgc3Vic2VxdWVudCBwaG90b25zXHJcbiAgICAgICAgdGhpcy5zZXRFbWlzc2lvblRpbWVyVG9Jbml0aWFsQ291bnRkb3duKCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHBob3RvbkVtaXNzaW9uUGVyaW9kIDwgdGhpcy5waG90b25FbWlzc2lvbkNvdW50ZG93blRpbWVyICkge1xyXG5cclxuICAgICAgICAvLyBIYW5kbGUgdGhlIGNhc2Ugd2hlcmUgdGhlIG5ldyB2YWx1ZSBpcyBzbWFsbGVyIHRoYW4gdGhlIGN1cnJlbnQgY291bnRkb3duIHZhbHVlLlxyXG4gICAgICAgIHRoaXMucGhvdG9uRW1pc3Npb25Db3VudGRvd25UaW1lciA9IHBob3RvbkVtaXNzaW9uUGVyaW9kO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBwaG90b25FbWlzc2lvblBlcmlvZCA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZICkge1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgbmV3IHZhbHVlIGlzIGluZmluaXR5LCBpdCBtZWFucyB0aGF0IGVtaXNzaW9ucyBhcmUgYmVpbmcgdHVybmVkIG9mZiwgc28gc2V0IHRoZSBwZXJpb2QgdG8gaW5maW5pdHlcclxuICAgICAgICAvLyByaWdodCBhd2F5LlxyXG4gICAgICAgIHRoaXMucGhvdG9uRW1pc3Npb25Db3VudGRvd25UaW1lciA9IHBob3RvbkVtaXNzaW9uUGVyaW9kO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucGhvdG9uRW1pc3Npb25QZXJpb2RUYXJnZXQgPSBwaG90b25FbWlzc2lvblBlcmlvZDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgYWN0aXZlIG1vbGVjdWxlIHRvIHRoZSBjdXJyZW50IHBob3RvbiB0YXJnZXQuICBDbGVhciB0aGUgb2xkIGFycmF5IG9mIGFjdGl2ZSBtb2xlY3VsZXMsIGNyZWF0ZSBhIG5ld1xyXG4gICAqIG1vbGVjdWxlLCBhbmQgdGhlbiBhZGQgaXQgdG8gdGhlIGFjdGl2ZSBtb2xlY3VsZXMgYXJyYXkuICBBZGQgbGlzdGVuZXJzIHRvIHRoZSBtb2xlY3VsZSB0aGF0IGNoZWNrIGZvciB3aGVuXHJcbiAgICogdGhlIG1vbGVjdWxlIHNob3VsZCBlbWl0IGEgcGhvdG9uIG9yIGJyZWFrIGFwYXJ0IGludG8gY29uc3RpdHVlbnRzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UGhvdG9uVGFyZ2V0fSBwaG90b25UYXJnZXQgLSBUaGUgc3RyaW5nIGNvbnN0YW50IHdoaWNoIHJlcHJlc2VudHMgdGhlIGRlc2lyZWQgcGhvdG9uIHRhcmdldC5cclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgdXBkYXRlQWN0aXZlTW9sZWN1bGUoIHBob3RvblRhcmdldCwgdGFuZGVtICkge1xyXG4gICAgdGhpcy5hY3RpdmVNb2xlY3VsZXMuZm9yRWFjaCggbW9sZWN1bGUgPT4geyBtb2xlY3VsZS5kaXNwb3NlKCk7IH0gKTtcclxuXHJcbiAgICAvLyBSZW1vdmUgdGhlIG9sZCBwaG90b24gdGFyZ2V0KHMpLlxyXG4gICAgdGhpcy5hY3RpdmVNb2xlY3VsZXMuY2xlYXIoKTsgLy8gQ2xlYXIgdGhlIG9sZCBhY3RpdmUgbW9sZWN1bGVzIGFycmF5XHJcblxyXG4gICAgLy8gQWRkIHRoZSBuZXcgcGhvdG9uIHRhcmdldChzKS5cclxuICAgIGNvbnN0IG5ld01vbGVjdWxlID1cclxuICAgICAgcGhvdG9uVGFyZ2V0ID09PSBQaG90b25UYXJnZXQuU0lOR0xFX0NPX01PTEVDVUxFID8gbmV3IENPKCB7IHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ0NPJyApIH0gKSA6XHJcbiAgICAgIHBob3RvblRhcmdldCA9PT0gUGhvdG9uVGFyZ2V0LlNJTkdMRV9DTzJfTU9MRUNVTEUgPyBuZXcgQ08yKCB7IHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ0NPMicgKSB9ICkgOlxyXG4gICAgICBwaG90b25UYXJnZXQgPT09IFBob3RvblRhcmdldC5TSU5HTEVfSDJPX01PTEVDVUxFID8gbmV3IEgyTyggeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdIMk8nICkgfSApIDpcclxuICAgICAgcGhvdG9uVGFyZ2V0ID09PSBQaG90b25UYXJnZXQuU0lOR0xFX04yX01PTEVDVUxFID8gbmV3IE4yKCB7IHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ04yJyApIH0gKSA6XHJcbiAgICAgIHBob3RvblRhcmdldCA9PT0gUGhvdG9uVGFyZ2V0LlNJTkdMRV9PMl9NT0xFQ1VMRSA/IG5ldyBPMiggeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdPMicgKSB9ICkgOlxyXG4gICAgICBwaG90b25UYXJnZXQgPT09IFBob3RvblRhcmdldC5TSU5HTEVfTzNfTU9MRUNVTEUgPyBuZXcgTzMoIHsgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnTzMnICkgfSApIDpcclxuICAgICAgcGhvdG9uVGFyZ2V0ID09PSBQaG90b25UYXJnZXQuU0lOR0xFX05PMl9NT0xFQ1VMRSA/IG5ldyBOTzIoIHsgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnTk8yJyApIH0gKSA6XHJcbiAgICAgIHBob3RvblRhcmdldCA9PT0gUGhvdG9uVGFyZ2V0LlNJTkdMRV9DSDRfTU9MRUNVTEUgPyBuZXcgQ0g0KCB7IHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ0NINCcgKSB9ICkgOlxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ3VuaGFuZGxlZCBwaG90b24gdGFyZ2V0LicgKTtcclxuXHJcbiAgICB0aGlzLnRhcmdldE1vbGVjdWxlID0gbmV3TW9sZWN1bGU7XHJcbiAgICB0aGlzLmFjdGl2ZU1vbGVjdWxlcy5hZGQoIG5ld01vbGVjdWxlICk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBwaG90b25Hcm91cCBzbyB0aGF0IHBob3RvbnMgY3JlYXRlZCBieSB0aGUgbW9sZWN1bGUgY2FuIGJlIHJlZ2lzdGVyZWQgZm9yIFBoRVQtaU9cclxuICAgIG5ld01vbGVjdWxlLnBob3Rvbkdyb3VwID0gdGhpcy5waG90b25Hcm91cDtcclxuXHJcbiAgICAvLyBCcmVhayBhcGFydCBpbnRvIGNvbnN0aXR1ZW50IG1vbGVjdWxlcy5cclxuICAgIG5ld01vbGVjdWxlLmJyb2tlQXBhcnRFbWl0dGVyLmFkZExpc3RlbmVyKCAoIGNvbnN0aXR1ZW50TW9sZWN1bGUxLCBjb25zdGl0dWVudE1vbGVjdWxlMiApID0+IHtcclxuICAgICAgLy8gUmVtb3ZlIHRoZSBtb2xlY3VsZSBmcm9tIHRoZSBwaG90b25BYnNvcnB0aW9uTW9kZWwncyBsaXN0IG9mIGFjdGl2ZSBtb2xlY3VsZXMuXHJcblxyXG4gICAgICBuZXdNb2xlY3VsZS5kaXNwb3NlKCk7XHJcbiAgICAgIHRoaXMudGFyZ2V0TW9sZWN1bGUgPSBudWxsO1xyXG5cclxuICAgICAgdGhpcy5hY3RpdmVNb2xlY3VsZXMucmVtb3ZlKCBuZXdNb2xlY3VsZSApO1xyXG4gICAgICAvLyBBZGQgdGhlIGNvbnN0aXR1ZW50IG1vbGVjdWxlcyB0byB0aGUgcGhvdG9uQWJzb3JwdGlvbk1vZGVsLlxyXG4gICAgICB0aGlzLmFjdGl2ZU1vbGVjdWxlcy5hZGQoIGNvbnN0aXR1ZW50TW9sZWN1bGUxICk7XHJcbiAgICAgIHRoaXMuYWN0aXZlTW9sZWN1bGVzLmFkZCggY29uc3RpdHVlbnRNb2xlY3VsZTIgKTtcclxuXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGFjdGl2ZSBtb2xlY3VsZXMgaW4gdGhpcyBwaG90b25BYnNvcnB0aW9uIG1vZGVsLiAgUmV0dXJucyBhIG5ldyBhcnJheSBvYmplY3QgaG9sZGluZyB0aG9zZSBtb2xlY3VsZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge0FycmF5LjxNb2xlY3VsZT59IGFjdGl2ZU1vbGVjdWxlc1xyXG4gICAqL1xyXG4gIGdldE1vbGVjdWxlcygpIHtcclxuICAgIHJldHVybiB0aGlzLmFjdGl2ZU1vbGVjdWxlcy5zbGljZSggMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgbW9kZWwgc3RpbGwgY29udGFpbnMgYm90aCBvZiB0aGUgY29uc3RpdHVlbnQgbW9sZWN1bGVzIHByb3ZpZGVkIGFmdGVyIGEgYnJlYWsgYXBhcnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZX0gbW9sZWN1bGVBXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZX0gbW9sZWN1bGVCXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaGFzQm90aENvbnN0aXR1ZW50TW9sZWN1bGVzKCBtb2xlY3VsZUEsIG1vbGVjdWxlQiApIHtcclxuICAgIHJldHVybiB0aGlzLmFjdGl2ZU1vbGVjdWxlcy5pbmNsdWRlcyggbW9sZWN1bGVBICkgJiYgdGhpcy5hY3RpdmVNb2xlY3VsZXMuaW5jbHVkZXMoIG1vbGVjdWxlQiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhpcyBtZXRob2QgcmVzdG9yZXMgdGhlIGFjdGl2ZSBtb2xlY3VsZS4gIFRoaXMgbWF5IHNlZW0gbm9uc2Vuc2ljYWwsIGFuZCBpbiBzb21lIGNhc2VzIGl0IGlzLCBidXQgaXQgaXMgdXNlZnVsXHJcbiAgICogaW4gY2FzZXMgd2hlcmUgYW4gYXRvbSBoYXMgYnJva2VuIGFwYXJ0IGFuZCBuZWVkcyB0byBiZSByZXN0b3JlZCB0byBpdHMgb3JpZ2luYWwgY29uZGl0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXN0b3JlQWN0aXZlTW9sZWN1bGUoKSB7XHJcbiAgICBjb25zdCBjdXJyZW50VGFyZ2V0ID0gdGhpcy5waG90b25UYXJnZXRQcm9wZXJ0eS5nZXQoKTtcclxuICAgIHRoaXMudXBkYXRlQWN0aXZlTW9sZWN1bGUoIGN1cnJlbnRUYXJnZXQsIHRoaXMucGhvdG9uQWJzb3JwdGlvbk1vZGVsICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmVlbmhvdXNlRWZmZWN0LnJlZ2lzdGVyKCAnUGhvdG9uQWJzb3JwdGlvbk1vZGVsJywgUGhvdG9uQWJzb3JwdGlvbk1vZGVsICk7XHJcblxyXG4vLyBAcHVibGljIHtudW1iZXJ9IC0gaG9yaXpvbnRhbCB2ZWxvY2l0eSBvZiBwaG90b25zIHdoZW4gdGhleSBsZWF2ZSB0aGUgZW1pdHRlciwgaW4gcGljb21ldGVycy9zZWNvbmRcclxuUGhvdG9uQWJzb3JwdGlvbk1vZGVsLlBIT1RPTl9WRUxPQ0lUWSA9IFBIT1RPTl9WRUxPQ0lUWTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBob3RvbkFic29ycHRpb25Nb2RlbDtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxxQkFBcUIsTUFBTSw4Q0FBOEM7QUFDaEYsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLG1CQUFtQixNQUFNLDRDQUE0QztBQUM1RSxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxTQUFTLE1BQU0sMENBQTBDO0FBQ2hFLE9BQU9DLFdBQVcsTUFBTSxzQ0FBc0M7QUFDOUQsT0FBT0MsWUFBWSxNQUFNLHVDQUF1QztBQUNoRSxPQUFPQyxhQUFhLE1BQU0sOENBQThDO0FBQ3hFLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBQzFDLE9BQU9DLFFBQVEsTUFBTSxlQUFlO0FBQ3BDLE9BQU9DLEdBQUcsTUFBTSxvQkFBb0I7QUFDcEMsT0FBT0MsRUFBRSxNQUFNLG1CQUFtQjtBQUNsQyxPQUFPQyxHQUFHLE1BQU0sb0JBQW9CO0FBQ3BDLE9BQU9DLEdBQUcsTUFBTSxvQkFBb0I7QUFDcEMsT0FBT0MsRUFBRSxNQUFNLG1CQUFtQjtBQUNsQyxPQUFPQyxHQUFHLE1BQU0sb0JBQW9CO0FBQ3BDLE9BQU9DLEVBQUUsTUFBTSxtQkFBbUI7QUFDbEMsT0FBT0MsRUFBRSxNQUFNLG1CQUFtQjtBQUNsQyxPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBQzVDLE9BQU9DLG1CQUFtQixNQUFNLDBCQUEwQjs7QUFFMUQ7O0FBRUE7QUFDQSxNQUFNQyx3QkFBd0IsR0FBRyxJQUFJbEIsT0FBTyxDQUFFLENBQUMsSUFBSSxFQUFFLENBQUUsQ0FBQzs7QUFFeEQ7QUFDQSxNQUFNbUIsZUFBZSxHQUFHLElBQUksQ0FBQyxDQUFDOztBQUU5QjtBQUNBLE1BQU1DLDhCQUE4QixHQUFHQyxNQUFNLENBQUNDLGlCQUFpQixDQUFDLENBQUM7O0FBRWpFO0FBQ0EsTUFBTUMsaUNBQWlDLEdBQUdOLG1CQUFtQixDQUFDTyxhQUFhO0FBQzNFLE1BQU1DLHVDQUF1QyxHQUFHLEdBQUcsQ0FBQyxDQUFDOztBQUVyRDtBQUNBLE1BQU1DLDBCQUEwQixHQUFHLEdBQUc7QUFDdEMsTUFBTUMsMkJBQTJCLEdBQUdOLE1BQU0sQ0FBQ0MsaUJBQWlCOztBQUU1RDtBQUNBLE1BQU1NLGlCQUFpQixHQUFHLEdBQUc7QUFFN0IsTUFBTUMscUJBQXFCLFNBQVMxQixZQUFZLENBQUM7RUFFL0M7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UyQixXQUFXQSxDQUFFQyxtQkFBbUIsRUFBRUMsTUFBTSxFQUFHO0lBQ3pDLEtBQUssQ0FBQyxDQUFDO0lBRVAsSUFBSSxDQUFDQyxxQkFBcUIsR0FBR0QsTUFBTSxDQUFDLENBQUM7O0lBRXJDO0lBQ0EsSUFBSSxDQUFDRSxXQUFXLEdBQUcsSUFBSWhDLFdBQVcsQ0FBRSxDQUFFOEIsTUFBTSxFQUFFRyxVQUFVLEtBQU0sSUFBSTdCLFdBQVcsQ0FBRTZCLFVBQVUsRUFBRTtNQUFFSCxNQUFNLEVBQUVBO0lBQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRWYsbUJBQW1CLENBQUNPLGFBQWEsQ0FBRSxFQUFFO01BQ3RKWSxVQUFVLEVBQUVsQyxXQUFXLENBQUNtQyxhQUFhLENBQUUvQixXQUFXLENBQUNnQyxRQUFTLENBQUM7TUFDN0ROLE1BQU0sRUFBRUEsTUFBTSxDQUFDTyxZQUFZLENBQUUsYUFBYztJQUM3QyxDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNDLHVCQUF1QixHQUFHLElBQUkvQyxlQUFlLENBQUUsS0FBSyxFQUFFO01BQ3pEdUMsTUFBTSxFQUFFQSxNQUFNLENBQUNPLFlBQVksQ0FBRSx5QkFBMEI7SUFDekQsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDRSx3QkFBd0IsR0FBRyxJQUFJM0MsY0FBYyxDQUFFbUIsbUJBQW1CLENBQUNPLGFBQWEsRUFBRTtNQUNyRlEsTUFBTSxFQUFFQSxNQUFNLENBQUNPLFlBQVksQ0FBRSwwQkFBMkIsQ0FBQztNQUN6REcsS0FBSyxFQUFFLEdBQUc7TUFDVkMsV0FBVyxFQUFFLENBQ1gxQixtQkFBbUIsQ0FBQzJCLGdCQUFnQixFQUNwQzNCLG1CQUFtQixDQUFDTyxhQUFhLEVBQ2pDUCxtQkFBbUIsQ0FBQzRCLGtCQUFrQixFQUN0QzVCLG1CQUFtQixDQUFDNkIsYUFBYTtJQUVyQyxDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNDLG9CQUFvQixHQUFHLElBQUloRCxRQUFRLENBQUVnQyxtQkFBbUIsRUFBRTtNQUM3REMsTUFBTSxFQUFFQSxNQUFNLENBQUNPLFlBQVksQ0FBRSxzQkFBdUIsQ0FBQztNQUNyRFMsZUFBZSxFQUFFNUMsYUFBYSxDQUFFWSxZQUFhLENBQUM7TUFDOUMyQixXQUFXLEVBQUUzQixZQUFZLENBQUNpQztJQUM1QixDQUFFLENBQUM7O0lBRUg7SUFDQTtJQUNBLElBQUksQ0FBQ0MsY0FBYyxHQUFHLElBQUk7O0lBRTFCO0lBQ0EsSUFBSSxDQUFDQyxlQUFlLEdBQUcsSUFBSTFELGVBQWUsQ0FBRSxJQUFJLEVBQUU7TUFDaER1QyxNQUFNLEVBQUVBLE1BQU0sQ0FBQ08sWUFBWSxDQUFFLGlCQUFrQjtJQUNqRCxDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNhLGlCQUFpQixHQUFHLElBQUl2RCxtQkFBbUIsQ0FBRUksU0FBUyxDQUFDb0QsTUFBTSxFQUFFO01BQ2xFVixXQUFXLEVBQUUsQ0FBRTFDLFNBQVMsQ0FBQ29ELE1BQU0sRUFBRXBELFNBQVMsQ0FBQ3FELElBQUksQ0FBRTtNQUNqRHRCLE1BQU0sRUFBRUEsTUFBTSxDQUFDTyxZQUFZLENBQUUsbUJBQW9CO0lBQ25ELENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQ2dCLGtCQUFrQixHQUFHLElBQUk1RCxlQUFlLENBQUUsQ0FBRSxJQUFJLENBQUN5RCxpQkFBaUIsQ0FBRSxFQUFFSSxLQUFLLElBQUlBLEtBQUssS0FBS3ZELFNBQVMsQ0FBQ3FELElBQUssQ0FBQztJQUU5RyxJQUFJLENBQUNHLGVBQWUsR0FBRy9ELHFCQUFxQixDQUFFO01BQzVDc0MsTUFBTSxFQUFFQSxNQUFNLENBQUNPLFlBQVksQ0FBRSxXQUFZLENBQUM7TUFDMUNILFVBQVUsRUFBRTFDLHFCQUFxQixDQUFDZ0UsaUJBQWlCLENBQUVuRCxRQUFRLENBQUNvRCxVQUFXO0lBQzNFLENBQUUsQ0FBQyxDQUFDLENBQUM7O0lBRUw7SUFDQTtJQUNBLElBQUksQ0FBQ0Msb0JBQW9CLEdBQUcsSUFBSWhFLE9BQU8sQ0FBRTtNQUFFaUUsVUFBVSxFQUFFLENBQUU7UUFBRUMsU0FBUyxFQUFFeEQ7TUFBWSxDQUFDO0lBQUcsQ0FBRSxDQUFDOztJQUV6RjtJQUNBLElBQUksQ0FBQ3lELFlBQVksR0FBRyxJQUFJbkUsT0FBTyxDQUFDLENBQUM7O0lBRWpDO0lBQ0EsSUFBSSxDQUFDb0UsaUJBQWlCLEdBQUcsSUFBSXBFLE9BQU8sQ0FBQyxDQUFDOztJQUV0QztJQUNBO0lBQ0EsSUFBSSxDQUFDbUQsb0JBQW9CLENBQUNrQixJQUFJLENBQUVDLFlBQVksSUFBSSxJQUFJLENBQUNDLG9CQUFvQixDQUFFRCxZQUFZLEVBQUVsQyxNQUFPLENBQUUsQ0FBQzs7SUFFbkc7SUFDQSxJQUFJLENBQUNRLHVCQUF1QixDQUFDeUIsSUFBSSxDQUFFRyxTQUFTLElBQUk7TUFDOUMsSUFBSSxDQUFDQyx1QkFBdUIsQ0FBRUQsU0FBUyxHQUFHMUMsMEJBQTBCLEdBQUdDLDJCQUE0QixDQUFDO0lBQ3RHLENBQUUsQ0FBQzs7SUFFSDtJQUNBO0lBQ0E7SUFDQSxJQUFJLENBQUNjLHdCQUF3QixDQUFDNkIsUUFBUSxDQUFFLE1BQU07TUFDNUMsSUFBSSxDQUFDQyxZQUFZLENBQUMsQ0FBQzs7TUFFbkI7TUFDQSxJQUFLLElBQUksQ0FBQy9CLHVCQUF1QixDQUFDZ0MsR0FBRyxDQUFDLENBQUMsRUFBRztRQUN4QyxJQUFJLENBQUNDLGtDQUFrQyxDQUFDLENBQUM7TUFDM0M7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNDLDRCQUE0QixHQUFHckQsTUFBTSxDQUFDQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzlELElBQUksQ0FBQ3FELDBCQUEwQixHQUFHdkQsOEJBQThCLENBQUMsQ0FBQztFQUNwRTs7RUFHQTtBQUNGO0FBQ0E7QUFDQTtFQUNFd0QsS0FBS0EsQ0FBQSxFQUFHO0lBRU4sSUFBSSxDQUFDTCxZQUFZLENBQUMsQ0FBQzs7SUFFbkI7SUFDQSxLQUFNLElBQUlNLFFBQVEsR0FBRyxDQUFDLEVBQUVBLFFBQVEsR0FBRyxJQUFJLENBQUNwQixlQUFlLENBQUNxQixNQUFNLEVBQUVELFFBQVEsRUFBRSxFQUFHO01BQzNFLElBQUksQ0FBQ3BCLGVBQWUsQ0FBQ2UsR0FBRyxDQUFFSyxRQUFTLENBQUMsQ0FBQ0QsS0FBSyxDQUFDLENBQUM7SUFDOUM7O0lBRUE7SUFDQSxJQUFJLENBQUM3QixvQkFBb0IsQ0FBQzZCLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLElBQUksQ0FBQ0csMEJBQTBCLENBQUV4RCxpQ0FBa0MsQ0FBQztJQUNwRSxJQUFJLENBQUM4Qyx1QkFBdUIsQ0FBRWpELDhCQUErQixDQUFDOztJQUU5RDtJQUNBLElBQUksQ0FBQ29CLHVCQUF1QixDQUFDb0MsS0FBSyxDQUFDLENBQUM7SUFDcEMsSUFBSSxDQUFDbkMsd0JBQXdCLENBQUNtQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxJQUFJLENBQUN6QixlQUFlLENBQUN5QixLQUFLLENBQUMsQ0FBQztJQUM1QixJQUFJLENBQUN4QixpQkFBaUIsQ0FBQ3dCLEtBQUssQ0FBQyxDQUFDO0lBQzlCLElBQUksQ0FBQzdCLG9CQUFvQixDQUFDNkIsS0FBSyxDQUFDLENBQUM7O0lBRWpDO0lBQ0EsSUFBSSxDQUFDYixZQUFZLENBQUNpQixJQUFJLENBQUMsQ0FBQztFQUMxQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFVCxZQUFZQSxDQUFBLEVBQUc7SUFFYjtJQUNBLElBQUssQ0FBQ1UsSUFBSSxDQUFDQyxLQUFLLENBQUNDLEdBQUcsQ0FBQ0MsNEJBQTRCLENBQUNDLEtBQUssRUFBRztNQUN4RCxJQUFJLENBQUNuRCxXQUFXLENBQUNvRCxLQUFLLENBQUMsQ0FBQztJQUMxQjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxJQUFJQSxDQUFFQyxFQUFFLEVBQUc7SUFFVDtJQUNBO0lBQ0E7SUFDQSxJQUFLQSxFQUFFLEdBQUcsR0FBRyxFQUFHO01BQ2Q7SUFDRjs7SUFFQTtJQUNBLElBQUssSUFBSSxDQUFDakMsa0JBQWtCLENBQUM4QixLQUFLLEVBQUc7TUFDbkNHLEVBQUUsR0FBR0EsRUFBRSxHQUFHNUQsaUJBQWlCO0lBQzdCO0lBRUEsSUFBSyxJQUFJLENBQUN1QixlQUFlLENBQUNxQixHQUFHLENBQUMsQ0FBQyxFQUFHO01BRWhDO01BQ0EsSUFBSSxDQUFDaUIsV0FBVyxDQUFFRCxFQUFHLENBQUM7O01BRXRCO01BQ0EsSUFBSSxDQUFDRSxrQkFBa0IsQ0FBRUYsRUFBRyxDQUFDOztNQUU3QjtNQUNBLElBQUksQ0FBQ0csYUFBYSxDQUFFSCxFQUFHLENBQUM7SUFDMUI7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsa0JBQWtCQSxDQUFFRixFQUFFLEVBQUc7SUFFdkIsSUFBSyxJQUFJLENBQUNkLDRCQUE0QixLQUFLckQsTUFBTSxDQUFDQyxpQkFBaUIsRUFBRztNQUNwRSxJQUFJLENBQUNvRCw0QkFBNEIsSUFBSWMsRUFBRTtNQUN2QyxJQUFLLElBQUksQ0FBQ2QsNEJBQTRCLElBQUksQ0FBQyxFQUFHO1FBQzVDO1FBQ0EsSUFBSSxDQUFDa0IsVUFBVSxDQUFFQyxJQUFJLENBQUNDLEdBQUcsQ0FBRSxJQUFJLENBQUNwQiw0QkFBNkIsQ0FBRSxDQUFDO1FBQ2hFLElBQUksQ0FBQ0EsNEJBQTRCLEdBQUcsSUFBSSxDQUFDQywwQkFBMEI7TUFDckU7SUFDRjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VGLGtDQUFrQ0EsQ0FBQSxFQUFHO0lBQ25DLElBQUksQ0FBQ0MsNEJBQTRCLEdBQUdqRCx1Q0FBdUM7RUFDN0U7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VnRSxXQUFXQSxDQUFFRCxFQUFFLEVBQUc7SUFDaEIsTUFBTU8sZUFBZSxHQUFHLEVBQUU7O0lBRTFCO0lBQ0EsSUFBSSxDQUFDN0QsV0FBVyxDQUFDOEQsT0FBTyxDQUFFQyxNQUFNLElBQUk7TUFDbEMsSUFBSSxDQUFDeEMsZUFBZSxDQUFDdUMsT0FBTyxDQUFFbkIsUUFBUSxJQUFJO1FBQ3hDLElBQUtBLFFBQVEsQ0FBQ3FCLGlCQUFpQixDQUFFRCxNQUFPLENBQUMsRUFBRztVQUUxQztVQUNBRixlQUFlLENBQUNJLElBQUksQ0FBRUYsTUFBTyxDQUFDO1FBQ2hDO01BQ0YsQ0FBRSxDQUFDO01BQ0hBLE1BQU0sQ0FBQ1YsSUFBSSxDQUFFQyxFQUFHLENBQUM7SUFDbkIsQ0FBRSxDQUFDOztJQUVIO0lBQ0FPLGVBQWUsQ0FBQ0MsT0FBTyxDQUFFQyxNQUFNLElBQUksSUFBSSxDQUFDL0QsV0FBVyxDQUFDa0UsY0FBYyxDQUFFSCxNQUFPLENBQUUsQ0FBQztFQUNoRjs7RUFFQTtBQUNGO0FBQ0E7RUFDRUksWUFBWUEsQ0FBQSxFQUFHO0lBQ2IsSUFBSSxDQUFDbkUsV0FBVyxDQUFDb0QsS0FBSyxDQUFDLENBQUM7RUFDMUI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VLLGFBQWFBLENBQUVILEVBQUUsRUFBRztJQUNsQixNQUFNYyxlQUFlLEdBQUcsSUFBSSxDQUFDN0MsZUFBZSxDQUFDOEMsS0FBSyxDQUFFLENBQUUsQ0FBQztJQUN2RCxLQUFNLElBQUkxQixRQUFRLEdBQUcsQ0FBQyxFQUFFQSxRQUFRLEdBQUd5QixlQUFlLENBQUN4QixNQUFNLEVBQUVELFFBQVEsRUFBRSxFQUFHO01BQ3RFeUIsZUFBZSxDQUFFekIsUUFBUSxDQUFFLENBQUNVLElBQUksQ0FBRUMsRUFBRyxDQUFDO0lBQ3hDO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VnQixVQUFVQSxDQUFFaEIsRUFBRSxFQUFHO0lBRWY7SUFDQSxJQUFJLENBQUNFLGtCQUFrQixDQUFFRixFQUFHLENBQUM7O0lBRTdCO0lBQ0EsSUFBSSxDQUFDQyxXQUFXLENBQUVELEVBQUcsQ0FBQzs7SUFFdEI7SUFDQSxJQUFJLENBQUNHLGFBQWEsQ0FBRUgsRUFBRyxDQUFDO0lBRXhCLElBQUksQ0FBQ3hCLGlCQUFpQixDQUFDZ0IsSUFBSSxDQUFDLENBQUM7RUFDL0I7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFWSxVQUFVQSxDQUFFYSxhQUFhLEVBQUc7SUFDMUIsTUFBTVIsTUFBTSxHQUFHLElBQUksQ0FBQy9ELFdBQVcsQ0FBQ3dFLGlCQUFpQixDQUFFLElBQUksQ0FBQ2pFLHdCQUF3QixDQUFDK0IsR0FBRyxDQUFDLENBQUUsQ0FBQztJQUN4RnlCLE1BQU0sQ0FBQ1UsZ0JBQWdCLENBQUNDLEdBQUcsQ0FBRSxJQUFJNUcsT0FBTyxDQUFFa0Isd0JBQXdCLENBQUMyRixDQUFDLEdBQUcxRixlQUFlLEdBQUdzRixhQUFhLEVBQUV2Rix3QkFBd0IsQ0FBQzRGLENBQUUsQ0FBRSxDQUFDO0lBQ3RJLE1BQU1DLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN6QmQsTUFBTSxDQUFDZSxXQUFXLENBQUU3RixlQUFlLEdBQUcwRSxJQUFJLENBQUNvQixHQUFHLENBQUVGLGFBQWMsQ0FBQyxFQUFFNUYsZUFBZSxHQUFHMEUsSUFBSSxDQUFDcUIsR0FBRyxDQUFFSCxhQUFjLENBQUUsQ0FBQzs7SUFFOUc7SUFDQSxJQUFJLENBQUNuRCxvQkFBb0IsQ0FBQ29CLElBQUksQ0FBRWlCLE1BQU8sQ0FBQztFQUMxQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWxCLDBCQUEwQkEsQ0FBRW9DLElBQUksRUFBRztJQUNqQyxJQUFLLElBQUksQ0FBQzFFLHdCQUF3QixDQUFDK0IsR0FBRyxDQUFDLENBQUMsS0FBSzJDLElBQUksRUFBRztNQUNsRDtNQUNBLElBQUksQ0FBQzFFLHdCQUF3QixDQUFDbUUsR0FBRyxDQUFFTyxJQUFLLENBQUM7SUFDM0M7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMseUJBQXlCQSxDQUFBLEVBQUc7SUFDMUIsT0FBT2xHLHdCQUF3QjtFQUNqQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRW1ELHVCQUF1QkEsQ0FBRWdELG9CQUFvQixFQUFHO0lBRTlDQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUQsb0JBQW9CLElBQUksQ0FBRSxDQUFDO0lBQzdDLElBQUssSUFBSSxDQUFDMUMsMEJBQTBCLEtBQUswQyxvQkFBb0IsRUFBRztNQUU5RDtNQUNBO01BQ0E7TUFDQTtNQUNBLElBQUssSUFBSSxDQUFDMUMsMEJBQTBCLEtBQUt0RCxNQUFNLENBQUNDLGlCQUFpQixJQUFJK0Ysb0JBQW9CLEtBQUtoRyxNQUFNLENBQUNDLGlCQUFpQixJQUM5RyxJQUFJLENBQUNZLFdBQVcsQ0FBQ3FGLEtBQUssS0FBSyxDQUFDLEVBQUc7UUFFckM7UUFDQSxJQUFJLENBQUM5QyxrQ0FBa0MsQ0FBQyxDQUFDO01BQzNDLENBQUMsTUFDSSxJQUFLNEMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDM0MsNEJBQTRCLEVBQUc7UUFFbkU7UUFDQSxJQUFJLENBQUNBLDRCQUE0QixHQUFHMkMsb0JBQW9CO01BQzFELENBQUMsTUFDSSxJQUFLQSxvQkFBb0IsS0FBS2hHLE1BQU0sQ0FBQ0MsaUJBQWlCLEVBQUc7UUFFNUQ7UUFDQTtRQUNBLElBQUksQ0FBQ29ELDRCQUE0QixHQUFHMkMsb0JBQW9CO01BQzFEO01BQ0EsSUFBSSxDQUFDMUMsMEJBQTBCLEdBQUcwQyxvQkFBb0I7SUFDeEQ7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWxELG9CQUFvQkEsQ0FBRUQsWUFBWSxFQUFFbEMsTUFBTSxFQUFHO0lBQzNDLElBQUksQ0FBQ3lCLGVBQWUsQ0FBQ3VDLE9BQU8sQ0FBRW5CLFFBQVEsSUFBSTtNQUFFQSxRQUFRLENBQUMyQyxPQUFPLENBQUMsQ0FBQztJQUFFLENBQUUsQ0FBQzs7SUFFbkU7SUFDQSxJQUFJLENBQUMvRCxlQUFlLENBQUM2QixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7O0lBRTlCO0lBQ0EsTUFBTW1DLFdBQVcsR0FDZnZELFlBQVksS0FBS2xELFlBQVksQ0FBQzBHLGtCQUFrQixHQUFHLElBQUlqSCxFQUFFLENBQUU7TUFBRXVCLE1BQU0sRUFBRUEsTUFBTSxDQUFDTyxZQUFZLENBQUUsSUFBSztJQUFFLENBQUUsQ0FBQyxHQUNwRzJCLFlBQVksS0FBS2xELFlBQVksQ0FBQzJHLG1CQUFtQixHQUFHLElBQUlqSCxHQUFHLENBQUU7TUFBRXNCLE1BQU0sRUFBRUEsTUFBTSxDQUFDTyxZQUFZLENBQUUsS0FBTTtJQUFFLENBQUUsQ0FBQyxHQUN2RzJCLFlBQVksS0FBS2xELFlBQVksQ0FBQzRHLG1CQUFtQixHQUFHLElBQUlqSCxHQUFHLENBQUU7TUFBRXFCLE1BQU0sRUFBRUEsTUFBTSxDQUFDTyxZQUFZLENBQUUsS0FBTTtJQUFFLENBQUUsQ0FBQyxHQUN2RzJCLFlBQVksS0FBS2xELFlBQVksQ0FBQzZHLGtCQUFrQixHQUFHLElBQUlqSCxFQUFFLENBQUU7TUFBRW9CLE1BQU0sRUFBRUEsTUFBTSxDQUFDTyxZQUFZLENBQUUsSUFBSztJQUFFLENBQUUsQ0FBQyxHQUNwRzJCLFlBQVksS0FBS2xELFlBQVksQ0FBQzhHLGtCQUFrQixHQUFHLElBQUloSCxFQUFFLENBQUU7TUFBRWtCLE1BQU0sRUFBRUEsTUFBTSxDQUFDTyxZQUFZLENBQUUsSUFBSztJQUFFLENBQUUsQ0FBQyxHQUNwRzJCLFlBQVksS0FBS2xELFlBQVksQ0FBQytHLGtCQUFrQixHQUFHLElBQUloSCxFQUFFLENBQUU7TUFBRWlCLE1BQU0sRUFBRUEsTUFBTSxDQUFDTyxZQUFZLENBQUUsSUFBSztJQUFFLENBQUUsQ0FBQyxHQUNwRzJCLFlBQVksS0FBS2xELFlBQVksQ0FBQ2dILG1CQUFtQixHQUFHLElBQUluSCxHQUFHLENBQUU7TUFBRW1CLE1BQU0sRUFBRUEsTUFBTSxDQUFDTyxZQUFZLENBQUUsS0FBTTtJQUFFLENBQUUsQ0FBQyxHQUN2RzJCLFlBQVksS0FBS2xELFlBQVksQ0FBQ2lILG1CQUFtQixHQUFHLElBQUl6SCxHQUFHLENBQUU7TUFBRXdCLE1BQU0sRUFBRUEsTUFBTSxDQUFDTyxZQUFZLENBQUUsS0FBTTtJQUFFLENBQUUsQ0FBQyxHQUN2RytFLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEtBQUssRUFBRSwwQkFBMkIsQ0FBQztJQUV2RCxJQUFJLENBQUNwRSxjQUFjLEdBQUd1RSxXQUFXO0lBQ2pDLElBQUksQ0FBQ2hFLGVBQWUsQ0FBQ3lFLEdBQUcsQ0FBRVQsV0FBWSxDQUFDOztJQUV2QztJQUNBQSxXQUFXLENBQUN2RixXQUFXLEdBQUcsSUFBSSxDQUFDQSxXQUFXOztJQUUxQztJQUNBdUYsV0FBVyxDQUFDVSxpQkFBaUIsQ0FBQ0MsV0FBVyxDQUFFLENBQUVDLG9CQUFvQixFQUFFQyxvQkFBb0IsS0FBTTtNQUMzRjs7TUFFQWIsV0FBVyxDQUFDRCxPQUFPLENBQUMsQ0FBQztNQUNyQixJQUFJLENBQUN0RSxjQUFjLEdBQUcsSUFBSTtNQUUxQixJQUFJLENBQUNPLGVBQWUsQ0FBQzhFLE1BQU0sQ0FBRWQsV0FBWSxDQUFDO01BQzFDO01BQ0EsSUFBSSxDQUFDaEUsZUFBZSxDQUFDeUUsR0FBRyxDQUFFRyxvQkFBcUIsQ0FBQztNQUNoRCxJQUFJLENBQUM1RSxlQUFlLENBQUN5RSxHQUFHLENBQUVJLG9CQUFxQixDQUFDO0lBRWxELENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxZQUFZQSxDQUFBLEVBQUc7SUFDYixPQUFPLElBQUksQ0FBQy9FLGVBQWUsQ0FBQzhDLEtBQUssQ0FBRSxDQUFFLENBQUM7RUFDeEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFa0MsMkJBQTJCQSxDQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBRztJQUNsRCxPQUFPLElBQUksQ0FBQ2xGLGVBQWUsQ0FBQ21GLFFBQVEsQ0FBRUYsU0FBVSxDQUFDLElBQUksSUFBSSxDQUFDakYsZUFBZSxDQUFDbUYsUUFBUSxDQUFFRCxTQUFVLENBQUM7RUFDakc7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxxQkFBcUJBLENBQUEsRUFBRztJQUN0QixNQUFNQyxhQUFhLEdBQUcsSUFBSSxDQUFDL0Ysb0JBQW9CLENBQUN5QixHQUFHLENBQUMsQ0FBQztJQUNyRCxJQUFJLENBQUNMLG9CQUFvQixDQUFFMkUsYUFBYSxFQUFFLElBQUksQ0FBQzdHLHFCQUFzQixDQUFDO0VBQ3hFO0FBQ0Y7QUFFQTVCLGdCQUFnQixDQUFDMEksUUFBUSxDQUFFLHVCQUF1QixFQUFFbEgscUJBQXNCLENBQUM7O0FBRTNFO0FBQ0FBLHFCQUFxQixDQUFDVixlQUFlLEdBQUdBLGVBQWU7QUFFdkQsZUFBZVUscUJBQXFCIn0=