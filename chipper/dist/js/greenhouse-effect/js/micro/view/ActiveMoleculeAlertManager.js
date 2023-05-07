// Copyright 2021-2022, University of Colorado Boulder

/**
 * Manages alerts for the "Active Molecule" in the observation window. In molecules-and-light you can only have one
 * molecule active at a time and this alert manager sends alerts to the UtteranceQueue that announce interactions
 * between this molecule and incoming photons.
 *
 * @author Jesse Greenberg
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Alerter from '../../../../scenery-phet/js/accessibility/describers/Alerter.js';
import MovementAlerter from '../../../../scenery-phet/js/accessibility/describers/MovementAlerter.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectStrings from '../../GreenhouseEffectStrings.js';
import PhotonTarget from '../model/PhotonTarget.js';
import WavelengthConstants from '../model/WavelengthConstants.js';
import MoleculeUtils from './MoleculeUtils.js';
const pausedEmittingPatternStringProperty = GreenhouseEffectStrings.a11y.pausedEmittingPatternStringProperty;
const absorptionPhaseBondsDescriptionPatternStringProperty = GreenhouseEffectStrings.a11y.absorptionPhaseBondsDescriptionPatternStringProperty;
const shortStretchingAlertStringProperty = GreenhouseEffectStrings.a11y.shortStretchingAlertStringProperty;
const bendUpAndDownStringProperty = GreenhouseEffectStrings.a11y.bendUpAndDownStringProperty;
const longStretchingAlertStringProperty = GreenhouseEffectStrings.a11y.longStretchingAlertStringProperty;
const shortBendingAlertStringProperty = GreenhouseEffectStrings.a11y.shortBendingAlertStringProperty;
const rotatesClockwiseStringProperty = GreenhouseEffectStrings.a11y.rotatesClockwiseStringProperty;
const longBendingAlertStringProperty = GreenhouseEffectStrings.a11y.longBendingAlertStringProperty;
const pausedPassingPatternStringProperty = GreenhouseEffectStrings.a11y.pausedPassingPatternStringProperty;
const slowMotionPassingPatternStringProperty = GreenhouseEffectStrings.a11y.slowMotionPassingPatternStringProperty;
const shortRotatingAlertStringProperty = GreenhouseEffectStrings.a11y.shortRotatingAlertStringProperty;
const longRotatingAlertStringProperty = GreenhouseEffectStrings.a11y.longRotatingAlertStringProperty;
const shortGlowingAlertStringProperty = GreenhouseEffectStrings.a11y.shortGlowingAlertStringProperty;
const longGlowingAlertStringProperty = GreenhouseEffectStrings.a11y.longGlowingAlertStringProperty;
const breaksApartAlertPatternStringProperty = GreenhouseEffectStrings.a11y.breaksApartAlertPatternStringProperty;
const slowMotionVibratingPatternStringProperty = GreenhouseEffectStrings.a11y.slowMotionVibratingPatternStringProperty;
const slowMotionAbsorbedMoleculeExcitedPatternStringProperty = GreenhouseEffectStrings.a11y.slowMotionAbsorbedMoleculeExcitedPatternStringProperty;
const slowMotionBreakApartPatternStringProperty = GreenhouseEffectStrings.a11y.slowMotionBreakApartPatternStringProperty;
const slowMotionEmittedPatternStringProperty = GreenhouseEffectStrings.a11y.slowMotionEmittedPatternStringProperty;
const absorptionPhaseMoleculeDescriptionPatternStringProperty = GreenhouseEffectStrings.a11y.absorptionPhaseMoleculeDescriptionPatternStringProperty;
const glowsStringProperty = GreenhouseEffectStrings.a11y.glowsStringStringProperty;
const rotatesCounterClockwiseStringProperty = GreenhouseEffectStrings.a11y.rotatesCounterClockwiseStringProperty;
const breaksApartStringProperty = GreenhouseEffectStrings.a11y.breaksApartStringProperty;
const breakApartPhaseDescriptionPatternStringProperty = GreenhouseEffectStrings.a11y.breakApartPhaseDescriptionPatternStringProperty;
const stretchBackAndForthStringProperty = GreenhouseEffectStrings.a11y.stretchBackAndForthStringProperty;
const slowMotionAbsorbedShortPatternStringProperty = GreenhouseEffectStrings.a11y.slowMotionAbsorbedShortPatternStringProperty;
const photonPassesStringProperty = GreenhouseEffectStrings.a11y.photonPassesStringProperty;
const photonsPassingStringProperty = GreenhouseEffectStrings.a11y.photonsPassingStringProperty;

// constants
// Number of "pass through" events before we alert that no absorptions are taking place in the case of molecule/photon
// pair that has no absorption strategy. See member variable passThroughCount.
const PASS_THROUGH_COUNT_BEFORE_DESCRIPTION = 5;

// constants
// in seconds, amount of time before an alert describing molecule/photon interaction goes to the utteranceQueue to
// allow time for the screeen reader to announce other control changes
// NOTE: This is not currently being used to control rate of alerts. This is on option but may not be necessary
// any more. See https://github.com/phetsims/molecules-and-light/issues/228
const ALERT_DELAY = 5;
class ActiveMoleculeAlertManager extends Alerter {
  /**
   * @param {PhotonAbsorptionModel} photonAbsorptionModel
   * @param {MicroObservationWindow} observationWindow
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(photonAbsorptionModel, observationWindow, modelViewTransform) {
    super({
      // Alerts related to active molecules alert through the ObservationWindow because we often want alerts about
      // molecules to continue for longer than the lifetime of an active molecule.
      descriptionAlertNode: observationWindow
    });

    // @privates
    this.photonAbsorptionModel = photonAbsorptionModel;
    this.modelViewTransform = modelViewTransform;

    // @private - persistent alert to avoid a pile up of too many in the utteranceQueue
    this.absorptionUtterance = new Utterance();

    // @private {boolean} - Keeps track of whether this is the first occurrence of an alert for a particular type of
    // interaction.  After the first alert a much shorter form of the alert is provided to reduce AT speaking time.
    this.firstVibrationAlert = true;
    this.firstRotationAlert = true;
    this.firstExcitationAlert = true;

    // @private {number} - amount of time that has passed since the first interaction between photon/molecule, we
    // wait ALERT_DELAY before making an alert to provide the screen reader some space to finish speaking and
    // prevent a queue
    this.timeSinceFirstAlert = 0;

    // @private {number} - number of times photons of a particular wavelength have passed through the active molecule
    // consecutively. Allows us to generate descriptions that indicate that no absorption is taking place after
    // several pass through events have ocurred.
    this.passThroughCount = 0;

    // @private {number} while a photon is absorbed the model photonWavelengthProperty may change - we want
    // to describe the absorbed photon not the photon wavelength currently being emitted
    this.wavelengthOnAbsorption = photonAbsorptionModel.photonWavelengthProperty.get();

    // whenenver target molecule or light source changes, reset to describe a new molecule/photon combination
    // for the first time
    photonAbsorptionModel.activeMolecules.addItemAddedListener(molecule => {
      this.attachAbsorptionAlertListeners(molecule);
      this.reset();
    });
    photonAbsorptionModel.photonWavelengthProperty.link(() => this.reset());
    photonAbsorptionModel.resetEmitter.addListener(() => this.reset());

    // allow some time before the next alert after changing the emission period as the screen reader will need to
    // announce that the emitter has turned on
    photonAbsorptionModel.photonEmitterOnProperty.link(() => {
      this.timeSinceFirstAlert = 0;
    });

    // attach listeners to the first molecule already in the observation window
    this.attachAbsorptionAlertListeners(photonAbsorptionModel.targetMolecule);
    photonAbsorptionModel.slowMotionProperty.lazyLink(() => {
      // reset counters that control verbosity of the responses so that the first response is always more verbose
      // after changing play speed
      this.reset();
    });
  }

  /**
   * Reset flags that indicate we are describing the first of a particular kind of interaction between photon
   * and molecule, and should be reset when the photon light source changes or the photon target changes.
   *
   * @public
   */
  reset() {
    this.firstVibrationAlert = true;
    this.firstRotationAlert = true;
    this.firstExcitationAlert = true;
    this.timeSinceFirstAlert = 0;
    this.passThroughCount = 0;
  }

  /**
   * Increment variables watching timing of alerts
   * @public
   *
   * @param {number} dt [description]
   */
  step(dt) {
    if (this.timeSinceFirstAlert <= ALERT_DELAY) {
      this.timeSinceFirstAlert += dt;
    }
  }

  /**
   * Attach listeners to a Molecule that alert when an interaction between photon and molecule occurs.
   * @public
   *
   * @param {Molecule} molecule
   */
  attachAbsorptionAlertListeners(molecule) {
    // vibration
    molecule.vibratingProperty.lazyLink(vibrating => {
      if (vibrating) {
        this.wavelengthOnAbsorption = this.photonAbsorptionModel.photonWavelengthProperty.get();
        this.absorptionUtterance.alert = this.getVibrationAlert(molecule);
        this.alertDescriptionUtterance(this.absorptionUtterance);
      }
    });

    // rotation
    molecule.rotatingProperty.lazyLink(rotating => {
      if (rotating) {
        this.wavelengthOnAbsorption = this.photonAbsorptionModel.photonWavelengthProperty.get();
        this.absorptionUtterance.alert = this.getRotationAlert(molecule);
        this.alertDescriptionUtterance(this.absorptionUtterance);
      }
    });

    // high electronic energy state (glowing)
    molecule.highElectronicEnergyStateProperty.lazyLink(highEnergy => {
      if (highEnergy) {
        this.wavelengthOnAbsorption = this.photonAbsorptionModel.photonWavelengthProperty.get();
        this.absorptionUtterance.alert = this.getExcitationAlert(molecule);
        this.alertDescriptionUtterance(this.absorptionUtterance);
      }
    });

    // break apart
    molecule.brokeApartEmitter.addListener((moleculeA, moleculeB) => {
      this.wavelengthOnAbsorption = this.photonAbsorptionModel.photonWavelengthProperty.get();
      this.absorptionUtterance.alert = this.getBreakApartAlert(moleculeA, moleculeB);
      this.alertDescriptionUtterance(this.absorptionUtterance);
    });

    // photon emission - alert this only in slow motion and paused playback
    molecule.photonEmittedEmitter.addListener(photon => {
      if (!this.photonAbsorptionModel.runningProperty.get() || this.photonAbsorptionModel.slowMotionProperty.get()) {
        this.absorptionUtterance.alert = this.getEmissionAlert(photon);
        this.alertDescriptionUtterance(this.absorptionUtterance);
      }
    });

    // photon passed through
    molecule.photonPassedThroughEmitter.addListener(photon => {
      this.passThroughCount++;
      const passThroughAlert = this.getPassThroughAlert(photon, molecule);
      if (passThroughAlert) {
        this.absorptionUtterance.alert = passThroughAlert;
        this.alertDescriptionUtterance(this.absorptionUtterance);
      }
      if (this.passThroughCount >= PASS_THROUGH_COUNT_BEFORE_DESCRIPTION) {
        this.passThroughCount = 0;
      }
    });

    // if rotation direction changes during slow playback, describe the rotation direction in full again
    molecule.rotationDirectionClockwiseProperty.lazyLink(() => {
      if (this.photonAbsorptionModel.slowMotionProperty.get()) {
        this.firstRotationAlert = true;
      }
    });
  }

  /**
   * Gets a description of the vibration representation of absorption. Dependent on whether the molecule is
   * linear/bent and current angle of vibration. Returns something like
   *
   * "Infrared photon absorbed and bonds of carbon monoxide molecule stretching." or
   * "Infrared absorbed and bonds of ozone molecule bending up and down."
   *
   * @public
   *
   * @param {number} vibrationRadians
   * @returns {string}
   */
  getVibrationPhaseDescription(vibrationRadians) {
    let descriptionString;
    const targetMolecule = this.photonAbsorptionModel.targetMolecule;
    const lightSourceString = WavelengthConstants.getLightSourceName(this.wavelengthOnAbsorption);
    const photonTargetString = PhotonTarget.getMoleculeName(this.photonAbsorptionModel.photonTargetProperty.get());
    if (targetMolecule.vibratesByStretching()) {
      descriptionString = StringUtils.fillIn(absorptionPhaseBondsDescriptionPatternStringProperty.value, {
        lightSource: lightSourceString,
        photonTarget: photonTargetString,
        excitedRepresentation: stretchBackAndForthStringProperty.value
      });
    } else {
      // more than atoms have non-linear geometry
      descriptionString = StringUtils.fillIn(absorptionPhaseBondsDescriptionPatternStringProperty.value, {
        lightSource: lightSourceString,
        photonTarget: photonTargetString,
        excitedRepresentation: bendUpAndDownStringProperty.value
      });
    }
    return descriptionString;
  }

  /**
   * Get a string the describes the molecule when it starts to glow from its high electronic energy state
   * representation after absorption. Will return a string like
   * "‪Visible‬ photon absorbed and Nitrogen Dioxide‬ molecule starts glowing."
   * @private
   *
   * @returns {string}
   */
  getHighElectronicEnergyPhaseDescription() {
    const lightSourceString = WavelengthConstants.getLightSourceName(this.wavelengthOnAbsorption);
    const photonTargetString = PhotonTarget.getMoleculeName(this.photonAbsorptionModel.photonTargetProperty.get());
    return StringUtils.fillIn(absorptionPhaseMoleculeDescriptionPatternStringProperty.value, {
      lightSource: lightSourceString,
      photonTarget: photonTargetString,
      excitedRepresentation: glowsStringProperty.value
    });
  }

  /**
   * Get a description of the molecule in its rotation phase. Will return something like
   * "Microwave photon absorbed, water molecule rotates clockwise."
   * @public
   *
   * @returns {string}
   */
  getRotationPhaseDescription() {
    const targetMolecule = this.photonAbsorptionModel.targetMolecule;
    const lightSourceString = WavelengthConstants.getLightSourceName(this.wavelengthOnAbsorption);
    const photonTargetString = PhotonTarget.getMoleculeName(this.photonAbsorptionModel.photonTargetProperty.get());
    const rotationString = targetMolecule.rotationDirectionClockwiseProperty.get() ? rotatesClockwiseStringProperty.value : rotatesCounterClockwiseStringProperty.value;
    return StringUtils.fillIn(absorptionPhaseMoleculeDescriptionPatternStringProperty.value, {
      lightSource: lightSourceString,
      photonTarget: photonTargetString,
      excitedRepresentation: rotationString
    });
  }

  /**
   * Returns a string that describes the molecule after it breaks apart into two other molecules. Will return
   * a string like
   *
   * "Infrared photon absorbed, Carbon Dioxide molecule breaks into CO and O."
   *
   * @public
   *
   * @returns {string}
   */
  getBreakApartPhaseDescription(firstMolecule, secondMolecule) {
    const firstMolecularFormula = MoleculeUtils.getMolecularFormula(firstMolecule);
    const secondMolecularFormula = MoleculeUtils.getMolecularFormula(secondMolecule);
    const lightSourceString = WavelengthConstants.getLightSourceName(this.wavelengthOnAbsorption);
    const photonTargetString = PhotonTarget.getMoleculeName(this.photonAbsorptionModel.photonTargetProperty.get());
    return StringUtils.fillIn(breakApartPhaseDescriptionPatternStringProperty.value, {
      lightSource: lightSourceString,
      photonTarget: photonTargetString,
      firstMolecule: firstMolecularFormula,
      secondMolecule: secondMolecularFormula
    });
  }

  /**
   * Get an alert that describes the molecule in its "vibrating" state.
   * @private
   *
   * @param {Molecule} molecule
   * @returns {string}
   */
  getVibrationAlert(molecule) {
    let alert;
    const stretches = molecule.vibratesByStretching();

    // different alerts depending on playback speed, longer alerts when we have more time to speak
    if (!this.photonAbsorptionModel.runningProperty.get()) {
      // we are paused and stepping through frames
      alert = this.getVibrationPhaseDescription(molecule.currentVibrationRadiansProperty.get());
    } else if (this.photonAbsorptionModel.slowMotionProperty.get()) {
      let excitedRepresentationString;
      let patternString;
      if (this.firstVibrationAlert) {
        excitedRepresentationString = stretches ? stretchBackAndForthStringProperty.value : bendUpAndDownStringProperty.value;
        patternString = slowMotionVibratingPatternStringProperty.value;
      } else {
        excitedRepresentationString = stretches ? shortStretchingAlertStringProperty.value : shortBendingAlertStringProperty.value;
        patternString = slowMotionAbsorbedShortPatternStringProperty.value;
      }

      // we are running in slow motion
      alert = StringUtils.fillIn(patternString, {
        excitedRepresentation: excitedRepresentationString
      });
    } else {
      // we are running at normal speed
      if (this.firstVibrationAlert) {
        alert = stretches ? longStretchingAlertStringProperty.value : longBendingAlertStringProperty.value;
      } else {
        alert = stretches ? shortStretchingAlertStringProperty.value : shortBendingAlertStringProperty.value;
      }
    }
    this.firstVibrationAlert = false;
    return alert;
  }

  /**
   * Get an alert that describes the Molecule in its "excited" (glowing) state.
   * @private
   *
   * @param {Molecule} molecule
   * @returns {string}
   */
  getExcitationAlert(molecule) {
    let alert;
    if (!this.photonAbsorptionModel.runningProperty.get()) {
      // we are paused and stepping through animation frames
      alert = this.getHighElectronicEnergyPhaseDescription();
    } else if (this.photonAbsorptionModel.slowMotionProperty.get()) {
      let patternString;
      let excitationString;
      if (this.firstExcitationAlert) {
        patternString = slowMotionAbsorbedMoleculeExcitedPatternStringProperty.value;
        excitationString = glowsStringProperty.value;
      } else {
        patternString = slowMotionAbsorbedShortPatternStringProperty.value;
        excitationString = shortGlowingAlertStringProperty.value;
      }

      // we are running in slow motion
      alert = StringUtils.fillIn(patternString, {
        excitedRepresentation: excitationString
      });
    } else {
      // we are running at normal speed
      alert = this.firstExcitationAlert ? longGlowingAlertStringProperty.value : shortGlowingAlertStringProperty.value;
    }
    this.firstExcitationAlert = false;
    return alert;
  }

  /**
   * Get an alert that describes the Molecules in its "rotating" state. Will return something like
   * "Molecule rotates." or
   * "MicroPhoton absorbed. Molecule rotates counterclockwise."
   * @private
   *
   * @param {Molecule} molecule
   * @returns {string}
   */
  getRotationAlert(molecule) {
    let alert;
    if (!this.photonAbsorptionModel.runningProperty.get()) {
      // we are paused and stepping through frames
      alert = this.getRotationPhaseDescription();
    } else if (this.photonAbsorptionModel.slowMotionProperty.get()) {
      let representationString;
      let stringPattern;
      if (this.firstRotationAlert) {
        representationString = molecule.rotationDirectionClockwiseProperty.get() ? rotatesClockwiseStringProperty.value : rotatesCounterClockwiseStringProperty.value;
        stringPattern = slowMotionAbsorbedMoleculeExcitedPatternStringProperty.value;
      } else {
        representationString = shortRotatingAlertStringProperty.value;
        stringPattern = slowMotionAbsorbedShortPatternStringProperty.value;
      }
      alert = StringUtils.fillIn(stringPattern, {
        excitedRepresentation: representationString
      });
    } else {
      //  we are playing at normal speed
      if (this.firstRotationAlert) {
        alert = longRotatingAlertStringProperty.value;
      } else {
        alert = shortRotatingAlertStringProperty.value;
      }
    }
    this.firstRotationAlert = false;
    return alert;
  }

  /**
   * Get an alert that describes the molecule after it has broken up into constituent molecules.
   * @private
   *
   * @param {Molecule} firstMolecule
   * @param {Molecule} secondMolecule
   * @returns {string}
   */
  getBreakApartAlert(firstMolecule, secondMolecule) {
    let alert;
    const firstMolecularFormula = MoleculeUtils.getMolecularFormula(firstMolecule);
    const secondMolecularFormula = MoleculeUtils.getMolecularFormula(secondMolecule);
    if (!this.photonAbsorptionModel.runningProperty.get()) {
      // we are stepping through frame by frame
      alert = this.getBreakApartPhaseDescription(firstMolecule, secondMolecule);
    } else if (this.photonAbsorptionModel.slowMotionProperty.get()) {
      //  playing in slow motion
      alert = StringUtils.fillIn(slowMotionBreakApartPatternStringProperty.value, {
        excitedRepresentation: breaksApartStringProperty.value,
        firstMolecule: firstMolecularFormula,
        secondMolecule: secondMolecularFormula
      });
    } else {
      // playing at normal speed
      alert = StringUtils.fillIn(breaksApartAlertPatternStringProperty.value, {
        firstMolecule: firstMolecularFormula,
        secondMolecule: secondMolecularFormula
      });
    }
    return alert;
  }

  /**
   * Get an alert that describes a photon being emitted from othe molecule. Verbocity will depend on whether the sim
   * is paused or running in slow motion.
   * @public
   *
   * @param {Photon} photon
   * @returns {string}
   */
  getEmissionAlert(photon) {
    let alert = '';
    const directionString = this.getPhotonDirectionDescription(photon);
    if (!this.photonAbsorptionModel.runningProperty.get()) {
      alert = StringUtils.fillIn(pausedEmittingPatternStringProperty.value, {
        direction: directionString
      });
    } else if (this.photonAbsorptionModel.slowMotionProperty.get()) {
      alert = StringUtils.fillIn(slowMotionEmittedPatternStringProperty.value, {
        direction: directionString
      });
    }
    return alert;
  }

  /**
   * Get an alert that describes the photon is passing through the molecule. Will return something like
   *
   * "Microwave photon passes through Carbon Monoxide molecule." or simply
   * "MicroPhoton passes."
   *
   * Describing each pass through takes a lot of time, so this is only used while the simulation is paused and
   * user is stepping through frame by frames.
   * @public
   *
   * @param {Photon} photon
   * @param {Molecule} molecule
   * @returns {string|null}
   */
  getPassThroughAlert(photon, molecule) {
    let alert;

    // we only have enough time to speak detailed information about the "pass through" while stepping through frame by
    // frame, so "pass through" while playing is only described for molecule/photon combos with no absorption
    // strategy, and after several pass throughs have ocurred
    if (this.photonAbsorptionModel.runningProperty.get()) {
      const strategy = molecule.getPhotonAbsorptionStrategyForWavelength(photon.wavelength);
      if (strategy === null) {
        if (this.passThroughCount >= PASS_THROUGH_COUNT_BEFORE_DESCRIPTION) {
          if (this.photonAbsorptionModel.slowMotionProperty.get()) {
            alert = this.getDetailedPassThroughAlert(photon, slowMotionPassingPatternStringProperty.value);
          } else {
            alert = photonsPassingStringProperty.value;
          }
        }
      }
    } else {
      if (molecule.isPhotonAbsorbed()) {
        alert = photonPassesStringProperty.value;
      } else {
        alert = this.getDetailedPassThroughAlert(photon, pausedPassingPatternStringProperty.value);
      }
    }
    return alert;
  }

  /**
   * Get a detailed alert that describes the photon passing through a molecule. This is pretty verbose so this
   * is intended to describe pass through when we have lots of time for the screen reader to read this in full,
   * such as during slow motion or step. Will return something like
   *
   * "Microwave photons passing through Methane molecule." or
   * "Microwave photon passes through Methane molecule"
   *
   * depending on the context and provided patternString.
   * @private
   *
   * @param {Photon} photon - the MicroPhoton passing through the photon target
   * @param {string} patternString - A pattern string to be filled in with light source and molecular names, changing
   *                                 the verb tense depending on context.
   */
  getDetailedPassThroughAlert(photon, patternString) {
    const lightSourceString = WavelengthConstants.getLightSourceName(photon.wavelength);
    const molecularNameString = PhotonTarget.getMoleculeName(this.photonAbsorptionModel.photonTargetProperty.get());
    return StringUtils.fillIn(patternString, {
      lightSource: lightSourceString,
      molecularName: molecularNameString
    });
  }

  /**
   * Get a description of the photon's direction of motion.  Will return something like
   *
   * "up and to the left" or
   * "down"
   *
   * @public
   *
   * @param {Photon} photon
   * @returns {string}
   */
  getPhotonDirectionDescription(photon) {
    const emissionAngle = Math.atan2(photon.vy, photon.vx);
    return MovementAlerter.getDirectionDescriptionFromAngle(emissionAngle, {
      modelViewTransform: this.modelViewTransform
    });
  }
}
greenhouseEffect.register('ActiveMoleculeAlertManager', ActiveMoleculeAlertManager);
export default ActiveMoleculeAlertManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdVdGlscyIsIkFsZXJ0ZXIiLCJNb3ZlbWVudEFsZXJ0ZXIiLCJVdHRlcmFuY2UiLCJncmVlbmhvdXNlRWZmZWN0IiwiR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MiLCJQaG90b25UYXJnZXQiLCJXYXZlbGVuZ3RoQ29uc3RhbnRzIiwiTW9sZWN1bGVVdGlscyIsInBhdXNlZEVtaXR0aW5nUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwiYTExeSIsImFic29ycHRpb25QaGFzZUJvbmRzRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJzaG9ydFN0cmV0Y2hpbmdBbGVydFN0cmluZ1Byb3BlcnR5IiwiYmVuZFVwQW5kRG93blN0cmluZ1Byb3BlcnR5IiwibG9uZ1N0cmV0Y2hpbmdBbGVydFN0cmluZ1Byb3BlcnR5Iiwic2hvcnRCZW5kaW5nQWxlcnRTdHJpbmdQcm9wZXJ0eSIsInJvdGF0ZXNDbG9ja3dpc2VTdHJpbmdQcm9wZXJ0eSIsImxvbmdCZW5kaW5nQWxlcnRTdHJpbmdQcm9wZXJ0eSIsInBhdXNlZFBhc3NpbmdQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJzbG93TW90aW9uUGFzc2luZ1BhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsInNob3J0Um90YXRpbmdBbGVydFN0cmluZ1Byb3BlcnR5IiwibG9uZ1JvdGF0aW5nQWxlcnRTdHJpbmdQcm9wZXJ0eSIsInNob3J0R2xvd2luZ0FsZXJ0U3RyaW5nUHJvcGVydHkiLCJsb25nR2xvd2luZ0FsZXJ0U3RyaW5nUHJvcGVydHkiLCJicmVha3NBcGFydEFsZXJ0UGF0dGVyblN0cmluZ1Byb3BlcnR5Iiwic2xvd01vdGlvblZpYnJhdGluZ1BhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsInNsb3dNb3Rpb25BYnNvcmJlZE1vbGVjdWxlRXhjaXRlZFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsInNsb3dNb3Rpb25CcmVha0FwYXJ0UGF0dGVyblN0cmluZ1Byb3BlcnR5Iiwic2xvd01vdGlvbkVtaXR0ZWRQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJhYnNvcnB0aW9uUGhhc2VNb2xlY3VsZURlc2NyaXB0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwiZ2xvd3NTdHJpbmdQcm9wZXJ0eSIsImdsb3dzU3RyaW5nU3RyaW5nUHJvcGVydHkiLCJyb3RhdGVzQ291bnRlckNsb2Nrd2lzZVN0cmluZ1Byb3BlcnR5IiwiYnJlYWtzQXBhcnRTdHJpbmdQcm9wZXJ0eSIsImJyZWFrQXBhcnRQaGFzZURlc2NyaXB0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5Iiwic3RyZXRjaEJhY2tBbmRGb3J0aFN0cmluZ1Byb3BlcnR5Iiwic2xvd01vdGlvbkFic29yYmVkU2hvcnRQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJwaG90b25QYXNzZXNTdHJpbmdQcm9wZXJ0eSIsInBob3RvbnNQYXNzaW5nU3RyaW5nUHJvcGVydHkiLCJQQVNTX1RIUk9VR0hfQ09VTlRfQkVGT1JFX0RFU0NSSVBUSU9OIiwiQUxFUlRfREVMQVkiLCJBY3RpdmVNb2xlY3VsZUFsZXJ0TWFuYWdlciIsImNvbnN0cnVjdG9yIiwicGhvdG9uQWJzb3JwdGlvbk1vZGVsIiwib2JzZXJ2YXRpb25XaW5kb3ciLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJkZXNjcmlwdGlvbkFsZXJ0Tm9kZSIsImFic29ycHRpb25VdHRlcmFuY2UiLCJmaXJzdFZpYnJhdGlvbkFsZXJ0IiwiZmlyc3RSb3RhdGlvbkFsZXJ0IiwiZmlyc3RFeGNpdGF0aW9uQWxlcnQiLCJ0aW1lU2luY2VGaXJzdEFsZXJ0IiwicGFzc1Rocm91Z2hDb3VudCIsIndhdmVsZW5ndGhPbkFic29ycHRpb24iLCJwaG90b25XYXZlbGVuZ3RoUHJvcGVydHkiLCJnZXQiLCJhY3RpdmVNb2xlY3VsZXMiLCJhZGRJdGVtQWRkZWRMaXN0ZW5lciIsIm1vbGVjdWxlIiwiYXR0YWNoQWJzb3JwdGlvbkFsZXJ0TGlzdGVuZXJzIiwicmVzZXQiLCJsaW5rIiwicmVzZXRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJwaG90b25FbWl0dGVyT25Qcm9wZXJ0eSIsInRhcmdldE1vbGVjdWxlIiwic2xvd01vdGlvblByb3BlcnR5IiwibGF6eUxpbmsiLCJzdGVwIiwiZHQiLCJ2aWJyYXRpbmdQcm9wZXJ0eSIsInZpYnJhdGluZyIsImFsZXJ0IiwiZ2V0VmlicmF0aW9uQWxlcnQiLCJhbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlIiwicm90YXRpbmdQcm9wZXJ0eSIsInJvdGF0aW5nIiwiZ2V0Um90YXRpb25BbGVydCIsImhpZ2hFbGVjdHJvbmljRW5lcmd5U3RhdGVQcm9wZXJ0eSIsImhpZ2hFbmVyZ3kiLCJnZXRFeGNpdGF0aW9uQWxlcnQiLCJicm9rZUFwYXJ0RW1pdHRlciIsIm1vbGVjdWxlQSIsIm1vbGVjdWxlQiIsImdldEJyZWFrQXBhcnRBbGVydCIsInBob3RvbkVtaXR0ZWRFbWl0dGVyIiwicGhvdG9uIiwicnVubmluZ1Byb3BlcnR5IiwiZ2V0RW1pc3Npb25BbGVydCIsInBob3RvblBhc3NlZFRocm91Z2hFbWl0dGVyIiwicGFzc1Rocm91Z2hBbGVydCIsImdldFBhc3NUaHJvdWdoQWxlcnQiLCJyb3RhdGlvbkRpcmVjdGlvbkNsb2Nrd2lzZVByb3BlcnR5IiwiZ2V0VmlicmF0aW9uUGhhc2VEZXNjcmlwdGlvbiIsInZpYnJhdGlvblJhZGlhbnMiLCJkZXNjcmlwdGlvblN0cmluZyIsImxpZ2h0U291cmNlU3RyaW5nIiwiZ2V0TGlnaHRTb3VyY2VOYW1lIiwicGhvdG9uVGFyZ2V0U3RyaW5nIiwiZ2V0TW9sZWN1bGVOYW1lIiwicGhvdG9uVGFyZ2V0UHJvcGVydHkiLCJ2aWJyYXRlc0J5U3RyZXRjaGluZyIsImZpbGxJbiIsInZhbHVlIiwibGlnaHRTb3VyY2UiLCJwaG90b25UYXJnZXQiLCJleGNpdGVkUmVwcmVzZW50YXRpb24iLCJnZXRIaWdoRWxlY3Ryb25pY0VuZXJneVBoYXNlRGVzY3JpcHRpb24iLCJnZXRSb3RhdGlvblBoYXNlRGVzY3JpcHRpb24iLCJyb3RhdGlvblN0cmluZyIsImdldEJyZWFrQXBhcnRQaGFzZURlc2NyaXB0aW9uIiwiZmlyc3RNb2xlY3VsZSIsInNlY29uZE1vbGVjdWxlIiwiZmlyc3RNb2xlY3VsYXJGb3JtdWxhIiwiZ2V0TW9sZWN1bGFyRm9ybXVsYSIsInNlY29uZE1vbGVjdWxhckZvcm11bGEiLCJzdHJldGNoZXMiLCJjdXJyZW50VmlicmF0aW9uUmFkaWFuc1Byb3BlcnR5IiwiZXhjaXRlZFJlcHJlc2VudGF0aW9uU3RyaW5nIiwicGF0dGVyblN0cmluZyIsImV4Y2l0YXRpb25TdHJpbmciLCJyZXByZXNlbnRhdGlvblN0cmluZyIsInN0cmluZ1BhdHRlcm4iLCJkaXJlY3Rpb25TdHJpbmciLCJnZXRQaG90b25EaXJlY3Rpb25EZXNjcmlwdGlvbiIsImRpcmVjdGlvbiIsInN0cmF0ZWd5IiwiZ2V0UGhvdG9uQWJzb3JwdGlvblN0cmF0ZWd5Rm9yV2F2ZWxlbmd0aCIsIndhdmVsZW5ndGgiLCJnZXREZXRhaWxlZFBhc3NUaHJvdWdoQWxlcnQiLCJpc1Bob3RvbkFic29yYmVkIiwibW9sZWN1bGFyTmFtZVN0cmluZyIsIm1vbGVjdWxhck5hbWUiLCJlbWlzc2lvbkFuZ2xlIiwiTWF0aCIsImF0YW4yIiwidnkiLCJ2eCIsImdldERpcmVjdGlvbkRlc2NyaXB0aW9uRnJvbUFuZ2xlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBY3RpdmVNb2xlY3VsZUFsZXJ0TWFuYWdlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYW5hZ2VzIGFsZXJ0cyBmb3IgdGhlIFwiQWN0aXZlIE1vbGVjdWxlXCIgaW4gdGhlIG9ic2VydmF0aW9uIHdpbmRvdy4gSW4gbW9sZWN1bGVzLWFuZC1saWdodCB5b3UgY2FuIG9ubHkgaGF2ZSBvbmVcclxuICogbW9sZWN1bGUgYWN0aXZlIGF0IGEgdGltZSBhbmQgdGhpcyBhbGVydCBtYW5hZ2VyIHNlbmRzIGFsZXJ0cyB0byB0aGUgVXR0ZXJhbmNlUXVldWUgdGhhdCBhbm5vdW5jZSBpbnRlcmFjdGlvbnNcclxuICogYmV0d2VlbiB0aGlzIG1vbGVjdWxlIGFuZCBpbmNvbWluZyBwaG90b25zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgQWxlcnRlciBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYWNjZXNzaWJpbGl0eS9kZXNjcmliZXJzL0FsZXJ0ZXIuanMnO1xyXG5pbXBvcnQgTW92ZW1lbnRBbGVydGVyIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9hY2Nlc3NpYmlsaXR5L2Rlc2NyaWJlcnMvTW92ZW1lbnRBbGVydGVyLmpzJztcclxuaW1wb3J0IFV0dGVyYW5jZSBmcm9tICcuLi8uLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvVXR0ZXJhbmNlLmpzJztcclxuaW1wb3J0IGdyZWVuaG91c2VFZmZlY3QgZnJvbSAnLi4vLi4vZ3JlZW5ob3VzZUVmZmVjdC5qcyc7XHJcbmltcG9ydCBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncyBmcm9tICcuLi8uLi9HcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBQaG90b25UYXJnZXQgZnJvbSAnLi4vbW9kZWwvUGhvdG9uVGFyZ2V0LmpzJztcclxuaW1wb3J0IFdhdmVsZW5ndGhDb25zdGFudHMgZnJvbSAnLi4vbW9kZWwvV2F2ZWxlbmd0aENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZVV0aWxzIGZyb20gJy4vTW9sZWN1bGVVdGlscy5qcyc7XHJcblxyXG5jb25zdCBwYXVzZWRFbWl0dGluZ1BhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkucGF1c2VkRW1pdHRpbmdQYXR0ZXJuU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IGFic29ycHRpb25QaGFzZUJvbmRzRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LmFic29ycHRpb25QaGFzZUJvbmRzRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNob3J0U3RyZXRjaGluZ0FsZXJ0U3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNob3J0U3RyZXRjaGluZ0FsZXJ0U3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IGJlbmRVcEFuZERvd25TdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuYmVuZFVwQW5kRG93blN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBsb25nU3RyZXRjaGluZ0FsZXJ0U3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LmxvbmdTdHJldGNoaW5nQWxlcnRTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc2hvcnRCZW5kaW5nQWxlcnRTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuc2hvcnRCZW5kaW5nQWxlcnRTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgcm90YXRlc0Nsb2Nrd2lzZVN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5yb3RhdGVzQ2xvY2t3aXNlU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IGxvbmdCZW5kaW5nQWxlcnRTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkubG9uZ0JlbmRpbmdBbGVydFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBwYXVzZWRQYXNzaW5nUGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5wYXVzZWRQYXNzaW5nUGF0dGVyblN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBzbG93TW90aW9uUGFzc2luZ1BhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuc2xvd01vdGlvblBhc3NpbmdQYXR0ZXJuU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNob3J0Um90YXRpbmdBbGVydFN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5zaG9ydFJvdGF0aW5nQWxlcnRTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgbG9uZ1JvdGF0aW5nQWxlcnRTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkubG9uZ1JvdGF0aW5nQWxlcnRTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc2hvcnRHbG93aW5nQWxlcnRTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuc2hvcnRHbG93aW5nQWxlcnRTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgbG9uZ0dsb3dpbmdBbGVydFN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5sb25nR2xvd2luZ0FsZXJ0U3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IGJyZWFrc0FwYXJ0QWxlcnRQYXR0ZXJuU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LmJyZWFrc0FwYXJ0QWxlcnRQYXR0ZXJuU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNsb3dNb3Rpb25WaWJyYXRpbmdQYXR0ZXJuU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNsb3dNb3Rpb25WaWJyYXRpbmdQYXR0ZXJuU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNsb3dNb3Rpb25BYnNvcmJlZE1vbGVjdWxlRXhjaXRlZFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuc2xvd01vdGlvbkFic29yYmVkTW9sZWN1bGVFeGNpdGVkUGF0dGVyblN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBzbG93TW90aW9uQnJlYWtBcGFydFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuc2xvd01vdGlvbkJyZWFrQXBhcnRQYXR0ZXJuU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNsb3dNb3Rpb25FbWl0dGVkUGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5zbG93TW90aW9uRW1pdHRlZFBhdHRlcm5TdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgYWJzb3JwdGlvblBoYXNlTW9sZWN1bGVEZXNjcmlwdGlvblBhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuYWJzb3JwdGlvblBoYXNlTW9sZWN1bGVEZXNjcmlwdGlvblBhdHRlcm5TdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgZ2xvd3NTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuZ2xvd3NTdHJpbmdTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgcm90YXRlc0NvdW50ZXJDbG9ja3dpc2VTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkucm90YXRlc0NvdW50ZXJDbG9ja3dpc2VTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgYnJlYWtzQXBhcnRTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuYnJlYWtzQXBhcnRTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgYnJlYWtBcGFydFBoYXNlRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LmJyZWFrQXBhcnRQaGFzZURlc2NyaXB0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBzdHJldGNoQmFja0FuZEZvcnRoU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnN0cmV0Y2hCYWNrQW5kRm9ydGhTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc2xvd01vdGlvbkFic29yYmVkU2hvcnRQYXR0ZXJuU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNsb3dNb3Rpb25BYnNvcmJlZFNob3J0UGF0dGVyblN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBwaG90b25QYXNzZXNTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkucGhvdG9uUGFzc2VzU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHBob3RvbnNQYXNzaW5nU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnBob3RvbnNQYXNzaW5nU3RyaW5nUHJvcGVydHk7XHJcblxyXG4vLyBjb25zdGFudHNcclxuLy8gTnVtYmVyIG9mIFwicGFzcyB0aHJvdWdoXCIgZXZlbnRzIGJlZm9yZSB3ZSBhbGVydCB0aGF0IG5vIGFic29ycHRpb25zIGFyZSB0YWtpbmcgcGxhY2UgaW4gdGhlIGNhc2Ugb2YgbW9sZWN1bGUvcGhvdG9uXHJcbi8vIHBhaXIgdGhhdCBoYXMgbm8gYWJzb3JwdGlvbiBzdHJhdGVneS4gU2VlIG1lbWJlciB2YXJpYWJsZSBwYXNzVGhyb3VnaENvdW50LlxyXG5jb25zdCBQQVNTX1RIUk9VR0hfQ09VTlRfQkVGT1JFX0RFU0NSSVBUSU9OID0gNTtcclxuXHJcblxyXG4vLyBjb25zdGFudHNcclxuLy8gaW4gc2Vjb25kcywgYW1vdW50IG9mIHRpbWUgYmVmb3JlIGFuIGFsZXJ0IGRlc2NyaWJpbmcgbW9sZWN1bGUvcGhvdG9uIGludGVyYWN0aW9uIGdvZXMgdG8gdGhlIHV0dGVyYW5jZVF1ZXVlIHRvXHJcbi8vIGFsbG93IHRpbWUgZm9yIHRoZSBzY3JlZWVuIHJlYWRlciB0byBhbm5vdW5jZSBvdGhlciBjb250cm9sIGNoYW5nZXNcclxuLy8gTk9URTogVGhpcyBpcyBub3QgY3VycmVudGx5IGJlaW5nIHVzZWQgdG8gY29udHJvbCByYXRlIG9mIGFsZXJ0cy4gVGhpcyBpcyBvbiBvcHRpb24gYnV0IG1heSBub3QgYmUgbmVjZXNzYXJ5XHJcbi8vIGFueSBtb3JlLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL21vbGVjdWxlcy1hbmQtbGlnaHQvaXNzdWVzLzIyOFxyXG5jb25zdCBBTEVSVF9ERUxBWSA9IDU7XHJcblxyXG5jbGFzcyBBY3RpdmVNb2xlY3VsZUFsZXJ0TWFuYWdlciBleHRlbmRzIEFsZXJ0ZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1Bob3RvbkFic29ycHRpb25Nb2RlbH0gcGhvdG9uQWJzb3JwdGlvbk1vZGVsXHJcbiAgICogQHBhcmFtIHtNaWNyb09ic2VydmF0aW9uV2luZG93fSBvYnNlcnZhdGlvbldpbmRvd1xyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHBob3RvbkFic29ycHRpb25Nb2RlbCwgb2JzZXJ2YXRpb25XaW5kb3csIG1vZGVsVmlld1RyYW5zZm9ybSApIHtcclxuXHJcbiAgICBzdXBlcigge1xyXG5cclxuICAgICAgLy8gQWxlcnRzIHJlbGF0ZWQgdG8gYWN0aXZlIG1vbGVjdWxlcyBhbGVydCB0aHJvdWdoIHRoZSBPYnNlcnZhdGlvbldpbmRvdyBiZWNhdXNlIHdlIG9mdGVuIHdhbnQgYWxlcnRzIGFib3V0XHJcbiAgICAgIC8vIG1vbGVjdWxlcyB0byBjb250aW51ZSBmb3IgbG9uZ2VyIHRoYW4gdGhlIGxpZmV0aW1lIG9mIGFuIGFjdGl2ZSBtb2xlY3VsZS5cclxuICAgICAgZGVzY3JpcHRpb25BbGVydE5vZGU6IG9ic2VydmF0aW9uV2luZG93XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVzXHJcbiAgICB0aGlzLnBob3RvbkFic29ycHRpb25Nb2RlbCA9IHBob3RvbkFic29ycHRpb25Nb2RlbDtcclxuICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtID0gbW9kZWxWaWV3VHJhbnNmb3JtO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gcGVyc2lzdGVudCBhbGVydCB0byBhdm9pZCBhIHBpbGUgdXAgb2YgdG9vIG1hbnkgaW4gdGhlIHV0dGVyYW5jZVF1ZXVlXHJcbiAgICB0aGlzLmFic29ycHRpb25VdHRlcmFuY2UgPSBuZXcgVXR0ZXJhbmNlKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gS2VlcHMgdHJhY2sgb2Ygd2hldGhlciB0aGlzIGlzIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuIGFsZXJ0IGZvciBhIHBhcnRpY3VsYXIgdHlwZSBvZlxyXG4gICAgLy8gaW50ZXJhY3Rpb24uICBBZnRlciB0aGUgZmlyc3QgYWxlcnQgYSBtdWNoIHNob3J0ZXIgZm9ybSBvZiB0aGUgYWxlcnQgaXMgcHJvdmlkZWQgdG8gcmVkdWNlIEFUIHNwZWFraW5nIHRpbWUuXHJcbiAgICB0aGlzLmZpcnN0VmlicmF0aW9uQWxlcnQgPSB0cnVlO1xyXG4gICAgdGhpcy5maXJzdFJvdGF0aW9uQWxlcnQgPSB0cnVlO1xyXG4gICAgdGhpcy5maXJzdEV4Y2l0YXRpb25BbGVydCA9IHRydWU7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBhbW91bnQgb2YgdGltZSB0aGF0IGhhcyBwYXNzZWQgc2luY2UgdGhlIGZpcnN0IGludGVyYWN0aW9uIGJldHdlZW4gcGhvdG9uL21vbGVjdWxlLCB3ZVxyXG4gICAgLy8gd2FpdCBBTEVSVF9ERUxBWSBiZWZvcmUgbWFraW5nIGFuIGFsZXJ0IHRvIHByb3ZpZGUgdGhlIHNjcmVlbiByZWFkZXIgc29tZSBzcGFjZSB0byBmaW5pc2ggc3BlYWtpbmcgYW5kXHJcbiAgICAvLyBwcmV2ZW50IGEgcXVldWVcclxuICAgIHRoaXMudGltZVNpbmNlRmlyc3RBbGVydCA9IDA7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBudW1iZXIgb2YgdGltZXMgcGhvdG9ucyBvZiBhIHBhcnRpY3VsYXIgd2F2ZWxlbmd0aCBoYXZlIHBhc3NlZCB0aHJvdWdoIHRoZSBhY3RpdmUgbW9sZWN1bGVcclxuICAgIC8vIGNvbnNlY3V0aXZlbHkuIEFsbG93cyB1cyB0byBnZW5lcmF0ZSBkZXNjcmlwdGlvbnMgdGhhdCBpbmRpY2F0ZSB0aGF0IG5vIGFic29ycHRpb24gaXMgdGFraW5nIHBsYWNlIGFmdGVyXHJcbiAgICAvLyBzZXZlcmFsIHBhc3MgdGhyb3VnaCBldmVudHMgaGF2ZSBvY3VycmVkLlxyXG4gICAgdGhpcy5wYXNzVGhyb3VnaENvdW50ID0gMDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSB3aGlsZSBhIHBob3RvbiBpcyBhYnNvcmJlZCB0aGUgbW9kZWwgcGhvdG9uV2F2ZWxlbmd0aFByb3BlcnR5IG1heSBjaGFuZ2UgLSB3ZSB3YW50XHJcbiAgICAvLyB0byBkZXNjcmliZSB0aGUgYWJzb3JiZWQgcGhvdG9uIG5vdCB0aGUgcGhvdG9uIHdhdmVsZW5ndGggY3VycmVudGx5IGJlaW5nIGVtaXR0ZWRcclxuICAgIHRoaXMud2F2ZWxlbmd0aE9uQWJzb3JwdGlvbiA9IHBob3RvbkFic29ycHRpb25Nb2RlbC5waG90b25XYXZlbGVuZ3RoUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgLy8gd2hlbmVudmVyIHRhcmdldCBtb2xlY3VsZSBvciBsaWdodCBzb3VyY2UgY2hhbmdlcywgcmVzZXQgdG8gZGVzY3JpYmUgYSBuZXcgbW9sZWN1bGUvcGhvdG9uIGNvbWJpbmF0aW9uXHJcbiAgICAvLyBmb3IgdGhlIGZpcnN0IHRpbWVcclxuICAgIHBob3RvbkFic29ycHRpb25Nb2RlbC5hY3RpdmVNb2xlY3VsZXMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIG1vbGVjdWxlID0+IHtcclxuICAgICAgdGhpcy5hdHRhY2hBYnNvcnB0aW9uQWxlcnRMaXN0ZW5lcnMoIG1vbGVjdWxlICk7XHJcbiAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgIH0gKTtcclxuICAgIHBob3RvbkFic29ycHRpb25Nb2RlbC5waG90b25XYXZlbGVuZ3RoUHJvcGVydHkubGluayggKCkgPT4gdGhpcy5yZXNldCgpICk7XHJcbiAgICBwaG90b25BYnNvcnB0aW9uTW9kZWwucmVzZXRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB0aGlzLnJlc2V0KCkgKTtcclxuXHJcbiAgICAvLyBhbGxvdyBzb21lIHRpbWUgYmVmb3JlIHRoZSBuZXh0IGFsZXJ0IGFmdGVyIGNoYW5naW5nIHRoZSBlbWlzc2lvbiBwZXJpb2QgYXMgdGhlIHNjcmVlbiByZWFkZXIgd2lsbCBuZWVkIHRvXHJcbiAgICAvLyBhbm5vdW5jZSB0aGF0IHRoZSBlbWl0dGVyIGhhcyB0dXJuZWQgb25cclxuICAgIHBob3RvbkFic29ycHRpb25Nb2RlbC5waG90b25FbWl0dGVyT25Qcm9wZXJ0eS5saW5rKCAoKSA9PiB7IHRoaXMudGltZVNpbmNlRmlyc3RBbGVydCA9IDA7IH0gKTtcclxuXHJcbiAgICAvLyBhdHRhY2ggbGlzdGVuZXJzIHRvIHRoZSBmaXJzdCBtb2xlY3VsZSBhbHJlYWR5IGluIHRoZSBvYnNlcnZhdGlvbiB3aW5kb3dcclxuICAgIHRoaXMuYXR0YWNoQWJzb3JwdGlvbkFsZXJ0TGlzdGVuZXJzKCBwaG90b25BYnNvcnB0aW9uTW9kZWwudGFyZ2V0TW9sZWN1bGUgKTtcclxuXHJcbiAgICBwaG90b25BYnNvcnB0aW9uTW9kZWwuc2xvd01vdGlvblByb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcblxyXG4gICAgICAvLyByZXNldCBjb3VudGVycyB0aGF0IGNvbnRyb2wgdmVyYm9zaXR5IG9mIHRoZSByZXNwb25zZXMgc28gdGhhdCB0aGUgZmlyc3QgcmVzcG9uc2UgaXMgYWx3YXlzIG1vcmUgdmVyYm9zZVxyXG4gICAgICAvLyBhZnRlciBjaGFuZ2luZyBwbGF5IHNwZWVkXHJcbiAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IGZsYWdzIHRoYXQgaW5kaWNhdGUgd2UgYXJlIGRlc2NyaWJpbmcgdGhlIGZpcnN0IG9mIGEgcGFydGljdWxhciBraW5kIG9mIGludGVyYWN0aW9uIGJldHdlZW4gcGhvdG9uXHJcbiAgICogYW5kIG1vbGVjdWxlLCBhbmQgc2hvdWxkIGJlIHJlc2V0IHdoZW4gdGhlIHBob3RvbiBsaWdodCBzb3VyY2UgY2hhbmdlcyBvciB0aGUgcGhvdG9uIHRhcmdldCBjaGFuZ2VzLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5maXJzdFZpYnJhdGlvbkFsZXJ0ID0gdHJ1ZTtcclxuICAgIHRoaXMuZmlyc3RSb3RhdGlvbkFsZXJ0ID0gdHJ1ZTtcclxuICAgIHRoaXMuZmlyc3RFeGNpdGF0aW9uQWxlcnQgPSB0cnVlO1xyXG4gICAgdGhpcy50aW1lU2luY2VGaXJzdEFsZXJ0ID0gMDtcclxuICAgIHRoaXMucGFzc1Rocm91Z2hDb3VudCA9IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbmNyZW1lbnQgdmFyaWFibGVzIHdhdGNoaW5nIHRpbWluZyBvZiBhbGVydHNcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgW2Rlc2NyaXB0aW9uXVxyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgaWYgKCB0aGlzLnRpbWVTaW5jZUZpcnN0QWxlcnQgPD0gQUxFUlRfREVMQVkgKSB7XHJcbiAgICAgIHRoaXMudGltZVNpbmNlRmlyc3RBbGVydCArPSBkdDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGFjaCBsaXN0ZW5lcnMgdG8gYSBNb2xlY3VsZSB0aGF0IGFsZXJ0IHdoZW4gYW4gaW50ZXJhY3Rpb24gYmV0d2VlbiBwaG90b24gYW5kIG1vbGVjdWxlIG9jY3Vycy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01vbGVjdWxlfSBtb2xlY3VsZVxyXG4gICAqL1xyXG4gIGF0dGFjaEFic29ycHRpb25BbGVydExpc3RlbmVycyggbW9sZWN1bGUgKSB7XHJcblxyXG4gICAgLy8gdmlicmF0aW9uXHJcbiAgICBtb2xlY3VsZS52aWJyYXRpbmdQcm9wZXJ0eS5sYXp5TGluayggdmlicmF0aW5nID0+IHtcclxuICAgICAgaWYgKCB2aWJyYXRpbmcgKSB7XHJcbiAgICAgICAgdGhpcy53YXZlbGVuZ3RoT25BYnNvcnB0aW9uID0gdGhpcy5waG90b25BYnNvcnB0aW9uTW9kZWwucGhvdG9uV2F2ZWxlbmd0aFByb3BlcnR5LmdldCgpO1xyXG4gICAgICAgIHRoaXMuYWJzb3JwdGlvblV0dGVyYW5jZS5hbGVydCA9IHRoaXMuZ2V0VmlicmF0aW9uQWxlcnQoIG1vbGVjdWxlICk7XHJcbiAgICAgICAgdGhpcy5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCB0aGlzLmFic29ycHRpb25VdHRlcmFuY2UgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHJvdGF0aW9uXHJcbiAgICBtb2xlY3VsZS5yb3RhdGluZ1Byb3BlcnR5LmxhenlMaW5rKCByb3RhdGluZyA9PiB7XHJcbiAgICAgIGlmICggcm90YXRpbmcgKSB7XHJcbiAgICAgICAgdGhpcy53YXZlbGVuZ3RoT25BYnNvcnB0aW9uID0gdGhpcy5waG90b25BYnNvcnB0aW9uTW9kZWwucGhvdG9uV2F2ZWxlbmd0aFByb3BlcnR5LmdldCgpO1xyXG4gICAgICAgIHRoaXMuYWJzb3JwdGlvblV0dGVyYW5jZS5hbGVydCA9IHRoaXMuZ2V0Um90YXRpb25BbGVydCggbW9sZWN1bGUgKTtcclxuICAgICAgICB0aGlzLmFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UoIHRoaXMuYWJzb3JwdGlvblV0dGVyYW5jZSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gaGlnaCBlbGVjdHJvbmljIGVuZXJneSBzdGF0ZSAoZ2xvd2luZylcclxuICAgIG1vbGVjdWxlLmhpZ2hFbGVjdHJvbmljRW5lcmd5U3RhdGVQcm9wZXJ0eS5sYXp5TGluayggaGlnaEVuZXJneSA9PiB7XHJcbiAgICAgIGlmICggaGlnaEVuZXJneSApIHtcclxuICAgICAgICB0aGlzLndhdmVsZW5ndGhPbkFic29ycHRpb24gPSB0aGlzLnBob3RvbkFic29ycHRpb25Nb2RlbC5waG90b25XYXZlbGVuZ3RoUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgdGhpcy5hYnNvcnB0aW9uVXR0ZXJhbmNlLmFsZXJ0ID0gdGhpcy5nZXRFeGNpdGF0aW9uQWxlcnQoIG1vbGVjdWxlICk7XHJcbiAgICAgICAgdGhpcy5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCB0aGlzLmFic29ycHRpb25VdHRlcmFuY2UgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGJyZWFrIGFwYXJ0XHJcbiAgICBtb2xlY3VsZS5icm9rZUFwYXJ0RW1pdHRlci5hZGRMaXN0ZW5lciggKCBtb2xlY3VsZUEsIG1vbGVjdWxlQiApID0+IHtcclxuICAgICAgdGhpcy53YXZlbGVuZ3RoT25BYnNvcnB0aW9uID0gdGhpcy5waG90b25BYnNvcnB0aW9uTW9kZWwucGhvdG9uV2F2ZWxlbmd0aFByb3BlcnR5LmdldCgpO1xyXG4gICAgICB0aGlzLmFic29ycHRpb25VdHRlcmFuY2UuYWxlcnQgPSB0aGlzLmdldEJyZWFrQXBhcnRBbGVydCggbW9sZWN1bGVBLCBtb2xlY3VsZUIgKTtcclxuICAgICAgdGhpcy5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCB0aGlzLmFic29ycHRpb25VdHRlcmFuY2UgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBwaG90b24gZW1pc3Npb24gLSBhbGVydCB0aGlzIG9ubHkgaW4gc2xvdyBtb3Rpb24gYW5kIHBhdXNlZCBwbGF5YmFja1xyXG4gICAgbW9sZWN1bGUucGhvdG9uRW1pdHRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHBob3RvbiA9PiB7XHJcbiAgICAgIGlmICggIXRoaXMucGhvdG9uQWJzb3JwdGlvbk1vZGVsLnJ1bm5pbmdQcm9wZXJ0eS5nZXQoKSB8fCB0aGlzLnBob3RvbkFic29ycHRpb25Nb2RlbC5zbG93TW90aW9uUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgICAgdGhpcy5hYnNvcnB0aW9uVXR0ZXJhbmNlLmFsZXJ0ID0gdGhpcy5nZXRFbWlzc2lvbkFsZXJ0KCBwaG90b24gKTtcclxuICAgICAgICB0aGlzLmFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UoIHRoaXMuYWJzb3JwdGlvblV0dGVyYW5jZSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcGhvdG9uIHBhc3NlZCB0aHJvdWdoXHJcbiAgICBtb2xlY3VsZS5waG90b25QYXNzZWRUaHJvdWdoRW1pdHRlci5hZGRMaXN0ZW5lciggcGhvdG9uID0+IHtcclxuICAgICAgdGhpcy5wYXNzVGhyb3VnaENvdW50Kys7XHJcblxyXG4gICAgICBjb25zdCBwYXNzVGhyb3VnaEFsZXJ0ID0gdGhpcy5nZXRQYXNzVGhyb3VnaEFsZXJ0KCBwaG90b24sIG1vbGVjdWxlICk7XHJcbiAgICAgIGlmICggcGFzc1Rocm91Z2hBbGVydCApIHtcclxuICAgICAgICB0aGlzLmFic29ycHRpb25VdHRlcmFuY2UuYWxlcnQgPSBwYXNzVGhyb3VnaEFsZXJ0O1xyXG4gICAgICAgIHRoaXMuYWxlcnREZXNjcmlwdGlvblV0dGVyYW5jZSggdGhpcy5hYnNvcnB0aW9uVXR0ZXJhbmNlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggdGhpcy5wYXNzVGhyb3VnaENvdW50ID49IFBBU1NfVEhST1VHSF9DT1VOVF9CRUZPUkVfREVTQ1JJUFRJT04gKSB7XHJcbiAgICAgICAgdGhpcy5wYXNzVGhyb3VnaENvdW50ID0gMDtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGlmIHJvdGF0aW9uIGRpcmVjdGlvbiBjaGFuZ2VzIGR1cmluZyBzbG93IHBsYXliYWNrLCBkZXNjcmliZSB0aGUgcm90YXRpb24gZGlyZWN0aW9uIGluIGZ1bGwgYWdhaW5cclxuICAgIG1vbGVjdWxlLnJvdGF0aW9uRGlyZWN0aW9uQ2xvY2t3aXNlUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgaWYgKCB0aGlzLnBob3RvbkFic29ycHRpb25Nb2RlbC5zbG93TW90aW9uUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgICAgdGhpcy5maXJzdFJvdGF0aW9uQWxlcnQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIGEgZGVzY3JpcHRpb24gb2YgdGhlIHZpYnJhdGlvbiByZXByZXNlbnRhdGlvbiBvZiBhYnNvcnB0aW9uLiBEZXBlbmRlbnQgb24gd2hldGhlciB0aGUgbW9sZWN1bGUgaXNcclxuICAgKiBsaW5lYXIvYmVudCBhbmQgY3VycmVudCBhbmdsZSBvZiB2aWJyYXRpb24uIFJldHVybnMgc29tZXRoaW5nIGxpa2VcclxuICAgKlxyXG4gICAqIFwiSW5mcmFyZWQgcGhvdG9uIGFic29yYmVkIGFuZCBib25kcyBvZiBjYXJib24gbW9ub3hpZGUgbW9sZWN1bGUgc3RyZXRjaGluZy5cIiBvclxyXG4gICAqIFwiSW5mcmFyZWQgYWJzb3JiZWQgYW5kIGJvbmRzIG9mIG96b25lIG1vbGVjdWxlIGJlbmRpbmcgdXAgYW5kIGRvd24uXCJcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2aWJyYXRpb25SYWRpYW5zXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRWaWJyYXRpb25QaGFzZURlc2NyaXB0aW9uKCB2aWJyYXRpb25SYWRpYW5zICkge1xyXG4gICAgbGV0IGRlc2NyaXB0aW9uU3RyaW5nO1xyXG5cclxuICAgIGNvbnN0IHRhcmdldE1vbGVjdWxlID0gdGhpcy5waG90b25BYnNvcnB0aW9uTW9kZWwudGFyZ2V0TW9sZWN1bGU7XHJcbiAgICBjb25zdCBsaWdodFNvdXJjZVN0cmluZyA9IFdhdmVsZW5ndGhDb25zdGFudHMuZ2V0TGlnaHRTb3VyY2VOYW1lKCB0aGlzLndhdmVsZW5ndGhPbkFic29ycHRpb24gKTtcclxuICAgIGNvbnN0IHBob3RvblRhcmdldFN0cmluZyA9IFBob3RvblRhcmdldC5nZXRNb2xlY3VsZU5hbWUoIHRoaXMucGhvdG9uQWJzb3JwdGlvbk1vZGVsLnBob3RvblRhcmdldFByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgaWYgKCB0YXJnZXRNb2xlY3VsZS52aWJyYXRlc0J5U3RyZXRjaGluZygpICkge1xyXG4gICAgICBkZXNjcmlwdGlvblN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggYWJzb3JwdGlvblBoYXNlQm9uZHNEZXNjcmlwdGlvblBhdHRlcm5TdHJpbmdQcm9wZXJ0eS52YWx1ZSwge1xyXG4gICAgICAgIGxpZ2h0U291cmNlOiBsaWdodFNvdXJjZVN0cmluZyxcclxuICAgICAgICBwaG90b25UYXJnZXQ6IHBob3RvblRhcmdldFN0cmluZyxcclxuICAgICAgICBleGNpdGVkUmVwcmVzZW50YXRpb246IHN0cmV0Y2hCYWNrQW5kRm9ydGhTdHJpbmdQcm9wZXJ0eS52YWx1ZVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIG1vcmUgdGhhbiBhdG9tcyBoYXZlIG5vbi1saW5lYXIgZ2VvbWV0cnlcclxuICAgICAgZGVzY3JpcHRpb25TdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIGFic29ycHRpb25QaGFzZUJvbmRzRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHkudmFsdWUsIHtcclxuICAgICAgICBsaWdodFNvdXJjZTogbGlnaHRTb3VyY2VTdHJpbmcsXHJcbiAgICAgICAgcGhvdG9uVGFyZ2V0OiBwaG90b25UYXJnZXRTdHJpbmcsXHJcbiAgICAgICAgZXhjaXRlZFJlcHJlc2VudGF0aW9uOiBiZW5kVXBBbmREb3duU3RyaW5nUHJvcGVydHkudmFsdWVcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXNjcmlwdGlvblN0cmluZztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIHN0cmluZyB0aGUgZGVzY3JpYmVzIHRoZSBtb2xlY3VsZSB3aGVuIGl0IHN0YXJ0cyB0byBnbG93IGZyb20gaXRzIGhpZ2ggZWxlY3Ryb25pYyBlbmVyZ3kgc3RhdGVcclxuICAgKiByZXByZXNlbnRhdGlvbiBhZnRlciBhYnNvcnB0aW9uLiBXaWxsIHJldHVybiBhIHN0cmluZyBsaWtlXHJcbiAgICogXCLigKpWaXNpYmxl4oCsIHBob3RvbiBhYnNvcmJlZCBhbmQgTml0cm9nZW4gRGlveGlkZeKArCBtb2xlY3VsZSBzdGFydHMgZ2xvd2luZy5cIlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEhpZ2hFbGVjdHJvbmljRW5lcmd5UGhhc2VEZXNjcmlwdGlvbigpIHtcclxuICAgIGNvbnN0IGxpZ2h0U291cmNlU3RyaW5nID0gV2F2ZWxlbmd0aENvbnN0YW50cy5nZXRMaWdodFNvdXJjZU5hbWUoIHRoaXMud2F2ZWxlbmd0aE9uQWJzb3JwdGlvbiApO1xyXG4gICAgY29uc3QgcGhvdG9uVGFyZ2V0U3RyaW5nID0gUGhvdG9uVGFyZ2V0LmdldE1vbGVjdWxlTmFtZSggdGhpcy5waG90b25BYnNvcnB0aW9uTW9kZWwucGhvdG9uVGFyZ2V0UHJvcGVydHkuZ2V0KCkgKTtcclxuXHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBhYnNvcnB0aW9uUGhhc2VNb2xlY3VsZURlc2NyaXB0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5LnZhbHVlLCB7XHJcbiAgICAgIGxpZ2h0U291cmNlOiBsaWdodFNvdXJjZVN0cmluZyxcclxuICAgICAgcGhvdG9uVGFyZ2V0OiBwaG90b25UYXJnZXRTdHJpbmcsXHJcbiAgICAgIGV4Y2l0ZWRSZXByZXNlbnRhdGlvbjogZ2xvd3NTdHJpbmdQcm9wZXJ0eS52YWx1ZVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZGVzY3JpcHRpb24gb2YgdGhlIG1vbGVjdWxlIGluIGl0cyByb3RhdGlvbiBwaGFzZS4gV2lsbCByZXR1cm4gc29tZXRoaW5nIGxpa2VcclxuICAgKiBcIk1pY3Jvd2F2ZSBwaG90b24gYWJzb3JiZWQsIHdhdGVyIG1vbGVjdWxlIHJvdGF0ZXMgY2xvY2t3aXNlLlwiXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRSb3RhdGlvblBoYXNlRGVzY3JpcHRpb24oKSB7XHJcbiAgICBjb25zdCB0YXJnZXRNb2xlY3VsZSA9IHRoaXMucGhvdG9uQWJzb3JwdGlvbk1vZGVsLnRhcmdldE1vbGVjdWxlO1xyXG4gICAgY29uc3QgbGlnaHRTb3VyY2VTdHJpbmcgPSBXYXZlbGVuZ3RoQ29uc3RhbnRzLmdldExpZ2h0U291cmNlTmFtZSggdGhpcy53YXZlbGVuZ3RoT25BYnNvcnB0aW9uICk7XHJcbiAgICBjb25zdCBwaG90b25UYXJnZXRTdHJpbmcgPSBQaG90b25UYXJnZXQuZ2V0TW9sZWN1bGVOYW1lKCB0aGlzLnBob3RvbkFic29ycHRpb25Nb2RlbC5waG90b25UYXJnZXRQcm9wZXJ0eS5nZXQoKSApO1xyXG5cclxuICAgIGNvbnN0IHJvdGF0aW9uU3RyaW5nID0gdGFyZ2V0TW9sZWN1bGUucm90YXRpb25EaXJlY3Rpb25DbG9ja3dpc2VQcm9wZXJ0eS5nZXQoKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0ZXNDbG9ja3dpc2VTdHJpbmdQcm9wZXJ0eS52YWx1ZSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0ZXNDb3VudGVyQ2xvY2t3aXNlU3RyaW5nUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggYWJzb3JwdGlvblBoYXNlTW9sZWN1bGVEZXNjcmlwdGlvblBhdHRlcm5TdHJpbmdQcm9wZXJ0eS52YWx1ZSwge1xyXG4gICAgICBsaWdodFNvdXJjZTogbGlnaHRTb3VyY2VTdHJpbmcsXHJcbiAgICAgIHBob3RvblRhcmdldDogcGhvdG9uVGFyZ2V0U3RyaW5nLFxyXG4gICAgICBleGNpdGVkUmVwcmVzZW50YXRpb246IHJvdGF0aW9uU3RyaW5nXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIHRoYXQgZGVzY3JpYmVzIHRoZSBtb2xlY3VsZSBhZnRlciBpdCBicmVha3MgYXBhcnQgaW50byB0d28gb3RoZXIgbW9sZWN1bGVzLiBXaWxsIHJldHVyblxyXG4gICAqIGEgc3RyaW5nIGxpa2VcclxuICAgKlxyXG4gICAqIFwiSW5mcmFyZWQgcGhvdG9uIGFic29yYmVkLCBDYXJib24gRGlveGlkZSBtb2xlY3VsZSBicmVha3MgaW50byBDTyBhbmQgTy5cIlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRCcmVha0FwYXJ0UGhhc2VEZXNjcmlwdGlvbiggZmlyc3RNb2xlY3VsZSwgc2Vjb25kTW9sZWN1bGUgKSB7XHJcbiAgICBjb25zdCBmaXJzdE1vbGVjdWxhckZvcm11bGEgPSBNb2xlY3VsZVV0aWxzLmdldE1vbGVjdWxhckZvcm11bGEoIGZpcnN0TW9sZWN1bGUgKTtcclxuICAgIGNvbnN0IHNlY29uZE1vbGVjdWxhckZvcm11bGEgPSBNb2xlY3VsZVV0aWxzLmdldE1vbGVjdWxhckZvcm11bGEoIHNlY29uZE1vbGVjdWxlICk7XHJcblxyXG4gICAgY29uc3QgbGlnaHRTb3VyY2VTdHJpbmcgPSBXYXZlbGVuZ3RoQ29uc3RhbnRzLmdldExpZ2h0U291cmNlTmFtZSggdGhpcy53YXZlbGVuZ3RoT25BYnNvcnB0aW9uICk7XHJcbiAgICBjb25zdCBwaG90b25UYXJnZXRTdHJpbmcgPSBQaG90b25UYXJnZXQuZ2V0TW9sZWN1bGVOYW1lKCB0aGlzLnBob3RvbkFic29ycHRpb25Nb2RlbC5waG90b25UYXJnZXRQcm9wZXJ0eS5nZXQoKSApO1xyXG5cclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIGJyZWFrQXBhcnRQaGFzZURlc2NyaXB0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5LnZhbHVlLCB7XHJcbiAgICAgIGxpZ2h0U291cmNlOiBsaWdodFNvdXJjZVN0cmluZyxcclxuICAgICAgcGhvdG9uVGFyZ2V0OiBwaG90b25UYXJnZXRTdHJpbmcsXHJcbiAgICAgIGZpcnN0TW9sZWN1bGU6IGZpcnN0TW9sZWN1bGFyRm9ybXVsYSxcclxuICAgICAgc2Vjb25kTW9sZWN1bGU6IHNlY29uZE1vbGVjdWxhckZvcm11bGFcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhbiBhbGVydCB0aGF0IGRlc2NyaWJlcyB0aGUgbW9sZWN1bGUgaW4gaXRzIFwidmlicmF0aW5nXCIgc3RhdGUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TW9sZWN1bGV9IG1vbGVjdWxlXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRWaWJyYXRpb25BbGVydCggbW9sZWN1bGUgKSB7XHJcbiAgICBsZXQgYWxlcnQ7XHJcblxyXG4gICAgY29uc3Qgc3RyZXRjaGVzID0gbW9sZWN1bGUudmlicmF0ZXNCeVN0cmV0Y2hpbmcoKTtcclxuXHJcbiAgICAvLyBkaWZmZXJlbnQgYWxlcnRzIGRlcGVuZGluZyBvbiBwbGF5YmFjayBzcGVlZCwgbG9uZ2VyIGFsZXJ0cyB3aGVuIHdlIGhhdmUgbW9yZSB0aW1lIHRvIHNwZWFrXHJcbiAgICBpZiAoICF0aGlzLnBob3RvbkFic29ycHRpb25Nb2RlbC5ydW5uaW5nUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICAvLyB3ZSBhcmUgcGF1c2VkIGFuZCBzdGVwcGluZyB0aHJvdWdoIGZyYW1lc1xyXG4gICAgICBhbGVydCA9IHRoaXMuZ2V0VmlicmF0aW9uUGhhc2VEZXNjcmlwdGlvbiggbW9sZWN1bGUuY3VycmVudFZpYnJhdGlvblJhZGlhbnNQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMucGhvdG9uQWJzb3JwdGlvbk1vZGVsLnNsb3dNb3Rpb25Qcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgIGxldCBleGNpdGVkUmVwcmVzZW50YXRpb25TdHJpbmc7XHJcbiAgICAgIGxldCBwYXR0ZXJuU3RyaW5nO1xyXG4gICAgICBpZiAoIHRoaXMuZmlyc3RWaWJyYXRpb25BbGVydCApIHtcclxuICAgICAgICBleGNpdGVkUmVwcmVzZW50YXRpb25TdHJpbmcgPSBzdHJldGNoZXMgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmV0Y2hCYWNrQW5kRm9ydGhTdHJpbmdQcm9wZXJ0eS52YWx1ZSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVuZFVwQW5kRG93blN0cmluZ1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgIHBhdHRlcm5TdHJpbmcgPSBzbG93TW90aW9uVmlicmF0aW5nUGF0dGVyblN0cmluZ1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGV4Y2l0ZWRSZXByZXNlbnRhdGlvblN0cmluZyA9IHN0cmV0Y2hlcyA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvcnRTdHJldGNoaW5nQWxlcnRTdHJpbmdQcm9wZXJ0eS52YWx1ZSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvcnRCZW5kaW5nQWxlcnRTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICBwYXR0ZXJuU3RyaW5nID0gc2xvd01vdGlvbkFic29yYmVkU2hvcnRQYXR0ZXJuU3RyaW5nUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHdlIGFyZSBydW5uaW5nIGluIHNsb3cgbW90aW9uXHJcbiAgICAgIGFsZXJ0ID0gU3RyaW5nVXRpbHMuZmlsbEluKCBwYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgZXhjaXRlZFJlcHJlc2VudGF0aW9uOiBleGNpdGVkUmVwcmVzZW50YXRpb25TdHJpbmdcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyB3ZSBhcmUgcnVubmluZyBhdCBub3JtYWwgc3BlZWRcclxuICAgICAgaWYgKCB0aGlzLmZpcnN0VmlicmF0aW9uQWxlcnQgKSB7XHJcbiAgICAgICAgYWxlcnQgPSBzdHJldGNoZXMgP1xyXG4gICAgICAgICAgICAgICAgbG9uZ1N0cmV0Y2hpbmdBbGVydFN0cmluZ1Byb3BlcnR5LnZhbHVlIDpcclxuICAgICAgICAgICAgICAgIGxvbmdCZW5kaW5nQWxlcnRTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBhbGVydCA9IHN0cmV0Y2hlcyA/XHJcbiAgICAgICAgICAgICAgICBzaG9ydFN0cmV0Y2hpbmdBbGVydFN0cmluZ1Byb3BlcnR5LnZhbHVlIDpcclxuICAgICAgICAgICAgICAgIHNob3J0QmVuZGluZ0FsZXJ0U3RyaW5nUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmZpcnN0VmlicmF0aW9uQWxlcnQgPSBmYWxzZTtcclxuICAgIHJldHVybiBhbGVydDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhbiBhbGVydCB0aGF0IGRlc2NyaWJlcyB0aGUgTW9sZWN1bGUgaW4gaXRzIFwiZXhjaXRlZFwiIChnbG93aW5nKSBzdGF0ZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZX0gbW9sZWN1bGVcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEV4Y2l0YXRpb25BbGVydCggbW9sZWN1bGUgKSB7XHJcbiAgICBsZXQgYWxlcnQ7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5waG90b25BYnNvcnB0aW9uTW9kZWwucnVubmluZ1Byb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgLy8gd2UgYXJlIHBhdXNlZCBhbmQgc3RlcHBpbmcgdGhyb3VnaCBhbmltYXRpb24gZnJhbWVzXHJcbiAgICAgIGFsZXJ0ID0gdGhpcy5nZXRIaWdoRWxlY3Ryb25pY0VuZXJneVBoYXNlRGVzY3JpcHRpb24oKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLnBob3RvbkFic29ycHRpb25Nb2RlbC5zbG93TW90aW9uUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICBsZXQgcGF0dGVyblN0cmluZztcclxuICAgICAgbGV0IGV4Y2l0YXRpb25TdHJpbmc7XHJcbiAgICAgIGlmICggdGhpcy5maXJzdEV4Y2l0YXRpb25BbGVydCApIHtcclxuICAgICAgICBwYXR0ZXJuU3RyaW5nID0gc2xvd01vdGlvbkFic29yYmVkTW9sZWN1bGVFeGNpdGVkUGF0dGVyblN0cmluZ1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgIGV4Y2l0YXRpb25TdHJpbmcgPSBnbG93c1N0cmluZ1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHBhdHRlcm5TdHJpbmcgPSBzbG93TW90aW9uQWJzb3JiZWRTaG9ydFBhdHRlcm5TdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICBleGNpdGF0aW9uU3RyaW5nID0gc2hvcnRHbG93aW5nQWxlcnRTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gd2UgYXJlIHJ1bm5pbmcgaW4gc2xvdyBtb3Rpb25cclxuICAgICAgYWxlcnQgPSBTdHJpbmdVdGlscy5maWxsSW4oIHBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBleGNpdGVkUmVwcmVzZW50YXRpb246IGV4Y2l0YXRpb25TdHJpbmdcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyB3ZSBhcmUgcnVubmluZyBhdCBub3JtYWwgc3BlZWRcclxuICAgICAgYWxlcnQgPSB0aGlzLmZpcnN0RXhjaXRhdGlvbkFsZXJ0ID8gbG9uZ0dsb3dpbmdBbGVydFN0cmluZ1Byb3BlcnR5LnZhbHVlIDogc2hvcnRHbG93aW5nQWxlcnRTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmZpcnN0RXhjaXRhdGlvbkFsZXJ0ID0gZmFsc2U7XHJcbiAgICByZXR1cm4gYWxlcnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYW4gYWxlcnQgdGhhdCBkZXNjcmliZXMgdGhlIE1vbGVjdWxlcyBpbiBpdHMgXCJyb3RhdGluZ1wiIHN0YXRlLiBXaWxsIHJldHVybiBzb21ldGhpbmcgbGlrZVxyXG4gICAqIFwiTW9sZWN1bGUgcm90YXRlcy5cIiBvclxyXG4gICAqIFwiTWljcm9QaG90b24gYWJzb3JiZWQuIE1vbGVjdWxlIHJvdGF0ZXMgY291bnRlcmNsb2Nrd2lzZS5cIlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01vbGVjdWxlfSBtb2xlY3VsZVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0Um90YXRpb25BbGVydCggbW9sZWN1bGUgKSB7XHJcbiAgICBsZXQgYWxlcnQ7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5waG90b25BYnNvcnB0aW9uTW9kZWwucnVubmluZ1Byb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgLy8gd2UgYXJlIHBhdXNlZCBhbmQgc3RlcHBpbmcgdGhyb3VnaCBmcmFtZXNcclxuICAgICAgYWxlcnQgPSB0aGlzLmdldFJvdGF0aW9uUGhhc2VEZXNjcmlwdGlvbigpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMucGhvdG9uQWJzb3JwdGlvbk1vZGVsLnNsb3dNb3Rpb25Qcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgIGxldCByZXByZXNlbnRhdGlvblN0cmluZztcclxuICAgICAgbGV0IHN0cmluZ1BhdHRlcm47XHJcbiAgICAgIGlmICggdGhpcy5maXJzdFJvdGF0aW9uQWxlcnQgKSB7XHJcbiAgICAgICAgcmVwcmVzZW50YXRpb25TdHJpbmcgPSBtb2xlY3VsZS5yb3RhdGlvbkRpcmVjdGlvbkNsb2Nrd2lzZVByb3BlcnR5LmdldCgpID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0ZXNDbG9ja3dpc2VTdHJpbmdQcm9wZXJ0eS52YWx1ZSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3RhdGVzQ291bnRlckNsb2Nrd2lzZVN0cmluZ1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgIHN0cmluZ1BhdHRlcm4gPSBzbG93TW90aW9uQWJzb3JiZWRNb2xlY3VsZUV4Y2l0ZWRQYXR0ZXJuU3RyaW5nUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmVwcmVzZW50YXRpb25TdHJpbmcgPSBzaG9ydFJvdGF0aW5nQWxlcnRTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICBzdHJpbmdQYXR0ZXJuID0gc2xvd01vdGlvbkFic29yYmVkU2hvcnRQYXR0ZXJuU3RyaW5nUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFsZXJ0ID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzdHJpbmdQYXR0ZXJuLCB7XHJcbiAgICAgICAgZXhjaXRlZFJlcHJlc2VudGF0aW9uOiByZXByZXNlbnRhdGlvblN0cmluZ1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vICB3ZSBhcmUgcGxheWluZyBhdCBub3JtYWwgc3BlZWRcclxuICAgICAgaWYgKCB0aGlzLmZpcnN0Um90YXRpb25BbGVydCApIHtcclxuICAgICAgICBhbGVydCA9IGxvbmdSb3RhdGluZ0FsZXJ0U3RyaW5nUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgYWxlcnQgPSBzaG9ydFJvdGF0aW5nQWxlcnRTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZmlyc3RSb3RhdGlvbkFsZXJ0ID0gZmFsc2U7XHJcbiAgICByZXR1cm4gYWxlcnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYW4gYWxlcnQgdGhhdCBkZXNjcmliZXMgdGhlIG1vbGVjdWxlIGFmdGVyIGl0IGhhcyBicm9rZW4gdXAgaW50byBjb25zdGl0dWVudCBtb2xlY3VsZXMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TW9sZWN1bGV9IGZpcnN0TW9sZWN1bGVcclxuICAgKiBAcGFyYW0ge01vbGVjdWxlfSBzZWNvbmRNb2xlY3VsZVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0QnJlYWtBcGFydEFsZXJ0KCBmaXJzdE1vbGVjdWxlLCBzZWNvbmRNb2xlY3VsZSApIHtcclxuICAgIGxldCBhbGVydDtcclxuXHJcbiAgICBjb25zdCBmaXJzdE1vbGVjdWxhckZvcm11bGEgPSBNb2xlY3VsZVV0aWxzLmdldE1vbGVjdWxhckZvcm11bGEoIGZpcnN0TW9sZWN1bGUgKTtcclxuICAgIGNvbnN0IHNlY29uZE1vbGVjdWxhckZvcm11bGEgPSBNb2xlY3VsZVV0aWxzLmdldE1vbGVjdWxhckZvcm11bGEoIHNlY29uZE1vbGVjdWxlICk7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5waG90b25BYnNvcnB0aW9uTW9kZWwucnVubmluZ1Byb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgLy8gd2UgYXJlIHN0ZXBwaW5nIHRocm91Z2ggZnJhbWUgYnkgZnJhbWVcclxuICAgICAgYWxlcnQgPSB0aGlzLmdldEJyZWFrQXBhcnRQaGFzZURlc2NyaXB0aW9uKCBmaXJzdE1vbGVjdWxlLCBzZWNvbmRNb2xlY3VsZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMucGhvdG9uQWJzb3JwdGlvbk1vZGVsLnNsb3dNb3Rpb25Qcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgIC8vICBwbGF5aW5nIGluIHNsb3cgbW90aW9uXHJcbiAgICAgIGFsZXJ0ID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzbG93TW90aW9uQnJlYWtBcGFydFBhdHRlcm5TdHJpbmdQcm9wZXJ0eS52YWx1ZSwge1xyXG4gICAgICAgIGV4Y2l0ZWRSZXByZXNlbnRhdGlvbjogYnJlYWtzQXBhcnRTdHJpbmdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICBmaXJzdE1vbGVjdWxlOiBmaXJzdE1vbGVjdWxhckZvcm11bGEsXHJcbiAgICAgICAgc2Vjb25kTW9sZWN1bGU6IHNlY29uZE1vbGVjdWxhckZvcm11bGFcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBwbGF5aW5nIGF0IG5vcm1hbCBzcGVlZFxyXG4gICAgICBhbGVydCA9IFN0cmluZ1V0aWxzLmZpbGxJbiggYnJlYWtzQXBhcnRBbGVydFBhdHRlcm5TdHJpbmdQcm9wZXJ0eS52YWx1ZSwge1xyXG4gICAgICAgIGZpcnN0TW9sZWN1bGU6IGZpcnN0TW9sZWN1bGFyRm9ybXVsYSxcclxuICAgICAgICBzZWNvbmRNb2xlY3VsZTogc2Vjb25kTW9sZWN1bGFyRm9ybXVsYVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFsZXJ0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGFuIGFsZXJ0IHRoYXQgZGVzY3JpYmVzIGEgcGhvdG9uIGJlaW5nIGVtaXR0ZWQgZnJvbSBvdGhlIG1vbGVjdWxlLiBWZXJib2NpdHkgd2lsbCBkZXBlbmQgb24gd2hldGhlciB0aGUgc2ltXHJcbiAgICogaXMgcGF1c2VkIG9yIHJ1bm5pbmcgaW4gc2xvdyBtb3Rpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQaG90b259IHBob3RvblxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0RW1pc3Npb25BbGVydCggcGhvdG9uICkge1xyXG4gICAgbGV0IGFsZXJ0ID0gJyc7XHJcblxyXG4gICAgY29uc3QgZGlyZWN0aW9uU3RyaW5nID0gdGhpcy5nZXRQaG90b25EaXJlY3Rpb25EZXNjcmlwdGlvbiggcGhvdG9uICk7XHJcbiAgICBpZiAoICF0aGlzLnBob3RvbkFic29ycHRpb25Nb2RlbC5ydW5uaW5nUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIGFsZXJ0ID0gU3RyaW5nVXRpbHMuZmlsbEluKCBwYXVzZWRFbWl0dGluZ1BhdHRlcm5TdHJpbmdQcm9wZXJ0eS52YWx1ZSwge1xyXG4gICAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9uU3RyaW5nXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLnBob3RvbkFic29ycHRpb25Nb2RlbC5zbG93TW90aW9uUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIGFsZXJ0ID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzbG93TW90aW9uRW1pdHRlZFBhdHRlcm5TdHJpbmdQcm9wZXJ0eS52YWx1ZSwge1xyXG4gICAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9uU3RyaW5nXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYWxlcnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYW4gYWxlcnQgdGhhdCBkZXNjcmliZXMgdGhlIHBob3RvbiBpcyBwYXNzaW5nIHRocm91Z2ggdGhlIG1vbGVjdWxlLiBXaWxsIHJldHVybiBzb21ldGhpbmcgbGlrZVxyXG4gICAqXHJcbiAgICogXCJNaWNyb3dhdmUgcGhvdG9uIHBhc3NlcyB0aHJvdWdoIENhcmJvbiBNb25veGlkZSBtb2xlY3VsZS5cIiBvciBzaW1wbHlcclxuICAgKiBcIk1pY3JvUGhvdG9uIHBhc3Nlcy5cIlxyXG4gICAqXHJcbiAgICogRGVzY3JpYmluZyBlYWNoIHBhc3MgdGhyb3VnaCB0YWtlcyBhIGxvdCBvZiB0aW1lLCBzbyB0aGlzIGlzIG9ubHkgdXNlZCB3aGlsZSB0aGUgc2ltdWxhdGlvbiBpcyBwYXVzZWQgYW5kXHJcbiAgICogdXNlciBpcyBzdGVwcGluZyB0aHJvdWdoIGZyYW1lIGJ5IGZyYW1lcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1Bob3Rvbn0gcGhvdG9uXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZX0gbW9sZWN1bGVcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfG51bGx9XHJcbiAgICovXHJcbiAgZ2V0UGFzc1Rocm91Z2hBbGVydCggcGhvdG9uLCBtb2xlY3VsZSApIHtcclxuICAgIGxldCBhbGVydDtcclxuXHJcbiAgICAvLyB3ZSBvbmx5IGhhdmUgZW5vdWdoIHRpbWUgdG8gc3BlYWsgZGV0YWlsZWQgaW5mb3JtYXRpb24gYWJvdXQgdGhlIFwicGFzcyB0aHJvdWdoXCIgd2hpbGUgc3RlcHBpbmcgdGhyb3VnaCBmcmFtZSBieVxyXG4gICAgLy8gZnJhbWUsIHNvIFwicGFzcyB0aHJvdWdoXCIgd2hpbGUgcGxheWluZyBpcyBvbmx5IGRlc2NyaWJlZCBmb3IgbW9sZWN1bGUvcGhvdG9uIGNvbWJvcyB3aXRoIG5vIGFic29ycHRpb25cclxuICAgIC8vIHN0cmF0ZWd5LCBhbmQgYWZ0ZXIgc2V2ZXJhbCBwYXNzIHRocm91Z2hzIGhhdmUgb2N1cnJlZFxyXG4gICAgaWYgKCB0aGlzLnBob3RvbkFic29ycHRpb25Nb2RlbC5ydW5uaW5nUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIGNvbnN0IHN0cmF0ZWd5ID0gbW9sZWN1bGUuZ2V0UGhvdG9uQWJzb3JwdGlvblN0cmF0ZWd5Rm9yV2F2ZWxlbmd0aCggcGhvdG9uLndhdmVsZW5ndGggKTtcclxuICAgICAgaWYgKCBzdHJhdGVneSA9PT0gbnVsbCApIHtcclxuICAgICAgICBpZiAoIHRoaXMucGFzc1Rocm91Z2hDb3VudCA+PSBQQVNTX1RIUk9VR0hfQ09VTlRfQkVGT1JFX0RFU0NSSVBUSU9OICkge1xyXG4gICAgICAgICAgaWYgKCB0aGlzLnBob3RvbkFic29ycHRpb25Nb2RlbC5zbG93TW90aW9uUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0ID0gdGhpcy5nZXREZXRhaWxlZFBhc3NUaHJvdWdoQWxlcnQoIHBob3Rvbiwgc2xvd01vdGlvblBhc3NpbmdQYXR0ZXJuU3RyaW5nUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhbGVydCA9IHBob3RvbnNQYXNzaW5nU3RyaW5nUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgaWYgKCBtb2xlY3VsZS5pc1Bob3RvbkFic29yYmVkKCkgKSB7XHJcbiAgICAgICAgYWxlcnQgPSBwaG90b25QYXNzZXNTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBhbGVydCA9IHRoaXMuZ2V0RGV0YWlsZWRQYXNzVGhyb3VnaEFsZXJ0KCBwaG90b24sIHBhdXNlZFBhc3NpbmdQYXR0ZXJuU3RyaW5nUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhbGVydDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGRldGFpbGVkIGFsZXJ0IHRoYXQgZGVzY3JpYmVzIHRoZSBwaG90b24gcGFzc2luZyB0aHJvdWdoIGEgbW9sZWN1bGUuIFRoaXMgaXMgcHJldHR5IHZlcmJvc2Ugc28gdGhpc1xyXG4gICAqIGlzIGludGVuZGVkIHRvIGRlc2NyaWJlIHBhc3MgdGhyb3VnaCB3aGVuIHdlIGhhdmUgbG90cyBvZiB0aW1lIGZvciB0aGUgc2NyZWVuIHJlYWRlciB0byByZWFkIHRoaXMgaW4gZnVsbCxcclxuICAgKiBzdWNoIGFzIGR1cmluZyBzbG93IG1vdGlvbiBvciBzdGVwLiBXaWxsIHJldHVybiBzb21ldGhpbmcgbGlrZVxyXG4gICAqXHJcbiAgICogXCJNaWNyb3dhdmUgcGhvdG9ucyBwYXNzaW5nIHRocm91Z2ggTWV0aGFuZSBtb2xlY3VsZS5cIiBvclxyXG4gICAqIFwiTWljcm93YXZlIHBob3RvbiBwYXNzZXMgdGhyb3VnaCBNZXRoYW5lIG1vbGVjdWxlXCJcclxuICAgKlxyXG4gICAqIGRlcGVuZGluZyBvbiB0aGUgY29udGV4dCBhbmQgcHJvdmlkZWQgcGF0dGVyblN0cmluZy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQaG90b259IHBob3RvbiAtIHRoZSBNaWNyb1Bob3RvbiBwYXNzaW5nIHRocm91Z2ggdGhlIHBob3RvbiB0YXJnZXRcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0dGVyblN0cmluZyAtIEEgcGF0dGVybiBzdHJpbmcgdG8gYmUgZmlsbGVkIGluIHdpdGggbGlnaHQgc291cmNlIGFuZCBtb2xlY3VsYXIgbmFtZXMsIGNoYW5naW5nXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgdmVyYiB0ZW5zZSBkZXBlbmRpbmcgb24gY29udGV4dC5cclxuICAgKi9cclxuICBnZXREZXRhaWxlZFBhc3NUaHJvdWdoQWxlcnQoIHBob3RvbiwgcGF0dGVyblN0cmluZyApIHtcclxuICAgIGNvbnN0IGxpZ2h0U291cmNlU3RyaW5nID0gV2F2ZWxlbmd0aENvbnN0YW50cy5nZXRMaWdodFNvdXJjZU5hbWUoIHBob3Rvbi53YXZlbGVuZ3RoICk7XHJcbiAgICBjb25zdCBtb2xlY3VsYXJOYW1lU3RyaW5nID0gUGhvdG9uVGFyZ2V0LmdldE1vbGVjdWxlTmFtZSggdGhpcy5waG90b25BYnNvcnB0aW9uTW9kZWwucGhvdG9uVGFyZ2V0UHJvcGVydHkuZ2V0KCkgKTtcclxuXHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBwYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIGxpZ2h0U291cmNlOiBsaWdodFNvdXJjZVN0cmluZyxcclxuICAgICAgbW9sZWN1bGFyTmFtZTogbW9sZWN1bGFyTmFtZVN0cmluZ1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZGVzY3JpcHRpb24gb2YgdGhlIHBob3RvbidzIGRpcmVjdGlvbiBvZiBtb3Rpb24uICBXaWxsIHJldHVybiBzb21ldGhpbmcgbGlrZVxyXG4gICAqXHJcbiAgICogXCJ1cCBhbmQgdG8gdGhlIGxlZnRcIiBvclxyXG4gICAqIFwiZG93blwiXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1Bob3Rvbn0gcGhvdG9uXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRQaG90b25EaXJlY3Rpb25EZXNjcmlwdGlvbiggcGhvdG9uICkge1xyXG4gICAgY29uc3QgZW1pc3Npb25BbmdsZSA9IE1hdGguYXRhbjIoIHBob3Rvbi52eSwgcGhvdG9uLnZ4ICk7XHJcbiAgICByZXR1cm4gTW92ZW1lbnRBbGVydGVyLmdldERpcmVjdGlvbkRlc2NyaXB0aW9uRnJvbUFuZ2xlKCBlbWlzc2lvbkFuZ2xlLCB7XHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybTogdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmdyZWVuaG91c2VFZmZlY3QucmVnaXN0ZXIoICdBY3RpdmVNb2xlY3VsZUFsZXJ0TWFuYWdlcicsIEFjdGl2ZU1vbGVjdWxlQWxlcnRNYW5hZ2VyICk7XHJcbmV4cG9ydCBkZWZhdWx0IEFjdGl2ZU1vbGVjdWxlQWxlcnRNYW5hZ2VyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxPQUFPLE1BQU0saUVBQWlFO0FBQ3JGLE9BQU9DLGVBQWUsTUFBTSx5RUFBeUU7QUFDckcsT0FBT0MsU0FBUyxNQUFNLDZDQUE2QztBQUNuRSxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MsdUJBQXVCLE1BQU0sa0NBQWtDO0FBQ3RFLE9BQU9DLFlBQVksTUFBTSwwQkFBMEI7QUFDbkQsT0FBT0MsbUJBQW1CLE1BQU0saUNBQWlDO0FBQ2pFLE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFFOUMsTUFBTUMsbUNBQW1DLEdBQUdKLHVCQUF1QixDQUFDSyxJQUFJLENBQUNELG1DQUFtQztBQUM1RyxNQUFNRSxvREFBb0QsR0FBR04sdUJBQXVCLENBQUNLLElBQUksQ0FBQ0Msb0RBQW9EO0FBQzlJLE1BQU1DLGtDQUFrQyxHQUFHUCx1QkFBdUIsQ0FBQ0ssSUFBSSxDQUFDRSxrQ0FBa0M7QUFDMUcsTUFBTUMsMkJBQTJCLEdBQUdSLHVCQUF1QixDQUFDSyxJQUFJLENBQUNHLDJCQUEyQjtBQUM1RixNQUFNQyxpQ0FBaUMsR0FBR1QsdUJBQXVCLENBQUNLLElBQUksQ0FBQ0ksaUNBQWlDO0FBQ3hHLE1BQU1DLCtCQUErQixHQUFHVix1QkFBdUIsQ0FBQ0ssSUFBSSxDQUFDSywrQkFBK0I7QUFDcEcsTUFBTUMsOEJBQThCLEdBQUdYLHVCQUF1QixDQUFDSyxJQUFJLENBQUNNLDhCQUE4QjtBQUNsRyxNQUFNQyw4QkFBOEIsR0FBR1osdUJBQXVCLENBQUNLLElBQUksQ0FBQ08sOEJBQThCO0FBQ2xHLE1BQU1DLGtDQUFrQyxHQUFHYix1QkFBdUIsQ0FBQ0ssSUFBSSxDQUFDUSxrQ0FBa0M7QUFDMUcsTUFBTUMs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