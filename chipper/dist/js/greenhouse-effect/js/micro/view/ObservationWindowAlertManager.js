// Copyright 2021-2022, University of Colorado Boulder

/**
 * Manages alerts for the state of contents in the Observation window of Molecules and Light. For things that
 * are more general than interactions happening between photons and the active molecule.
 *
 * @author Jesse Greenberg
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Alerter from '../../../../scenery-phet/js/accessibility/describers/Alerter.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectStrings from '../../GreenhouseEffectStrings.js';
import WavelengthConstants from '../model/WavelengthConstants.js';
import MoleculeUtils from './MoleculeUtils.js';
const moleculesFloatingAwayPatternStringProperty = GreenhouseEffectStrings.a11y.moleculesFloatingAwayPatternStringProperty;
const photonsOnStringProperty = GreenhouseEffectStrings.a11y.photonEmitter.alerts.photonsOnStringProperty;
const photonsOffStringProperty = GreenhouseEffectStrings.a11y.photonEmitter.alerts.photonsOffStringProperty;
const photonsOnSlowSpeedStringProperty = GreenhouseEffectStrings.a11y.photonEmitter.alerts.photonsOnSlowSpeedStringProperty;
const photonsOnSimPausedStringProperty = GreenhouseEffectStrings.a11y.photonEmitter.alerts.photonsOnSimPausedStringProperty;
const photonsOnSlowSpeedSimPausedStringProperty = GreenhouseEffectStrings.a11y.photonEmitter.alerts.photonsOnSlowSpeedSimPausedStringProperty;
const simPausedEmitterOnAlertStringProperty = GreenhouseEffectStrings.a11y.timeControls.simPausedEmitterOnAlertStringProperty;
const simPausedEmitterOffAlertStringProperty = GreenhouseEffectStrings.a11y.timeControls.simPausedEmitterOffAlertStringProperty;
const simPlayingHintAlertStringProperty = GreenhouseEffectStrings.a11y.timeControls.simPlayingHintAlertStringProperty;
const stepHintAlertStringProperty = GreenhouseEffectStrings.a11y.timeControls.stepHintAlertStringProperty;
const pausedPhotonEmittedPatternStringProperty = GreenhouseEffectStrings.a11y.photonEmitter.alerts.pausedPhotonEmittedPatternStringProperty;
const shortRotatingAlertStringProperty = GreenhouseEffectStrings.a11y.shortRotatingAlertStringProperty;
const shortStretchingAlertStringProperty = GreenhouseEffectStrings.a11y.shortStretchingAlertStringProperty;
const shortBendingAlertStringProperty = GreenhouseEffectStrings.a11y.shortBendingAlertStringProperty;
const shortGlowingAlertStringProperty = GreenhouseEffectStrings.a11y.shortGlowingAlertStringProperty;
const moleculePiecesGoneStringProperty = GreenhouseEffectStrings.a11y.moleculePiecesGoneStringProperty;
const resetOrChangeMoleculeStringProperty = GreenhouseEffectStrings.a11y.resetOrChangeMoleculeStringProperty;
class ObservationWindowAlertManager extends Alerter {
  /**
   * @param {MicroObservationWindow} observationWindow
   */
  constructor(observationWindow) {
    super({
      // alerts go through the ObservationWindow itself
      descriptionAlertNode: observationWindow
    });

    // @private {Utterance} - single utterances for categories of information so any one set of utterances
    // don't spam the user on frequent interaction
    this.photonStateUtterance = new Utterance();
    this.runningStateUtterance = new Utterance();
    this.manualStepUtterance = new Utterance();
    this.photonEmittedUtterance = new Utterance();

    // We only want to describe that constituent molecules are floating away in the steps AFTER the molecule
    // actually breaks apart to make space for the actual break apart alert
    this.moleculeWasBrokenLastStep = false;

    // {Molecule|null} - Constituent molecules added to the model upon break apart, referenced so that we can
    // still describe them floating after they have left the observation window
    this.constituentMolecule1 = null;
    this.constituentMolecule2 = null;

    // @private {MoleculesAndLightModel}
    this.model = null;
  }

  /**
   * Initialize the alert manager by attaching listers that trigger alerts with various changes to observables.
   * @public
   *
   * @param {PhotonAbsorptionModel} model
   * @param {BooleanProperty} returnMoleculeButtonVisibleProperty
   */
  initialize(model, returnMoleculeButtonVisibleProperty) {
    this.model = model;
    model.photonEmitterOnProperty.lazyLink(on => {
      this.photonStateUtterance.alert = this.getPhotonEmitterStateAlert(on, model.runningProperty.value, model.slowMotionProperty.value);
      this.alertDescriptionUtterance(this.photonStateUtterance);
    });
    model.runningProperty.lazyLink(running => {
      // if the sim is running and the photon emitter is on, there is plenty of sound already, don't add
      // to alerts
      if (running && model.photonEmitterOnProperty.get()) {
        return;
      }
      this.runningStateUtterance.alert = this.getRunningStateAlert(model.photonEmitterOnProperty.get(), running);
      this.alertDescriptionUtterance(this.runningStateUtterance);
    });
    model.manualStepEmitter.addListener(() => {
      const alert = this.getManualStepAlert(model);
      if (alert) {
        this.manualStepUtterance.alert = alert;
        this.alertDescriptionUtterance(this.manualStepUtterance);
      }
    });
    model.photonEmittedEmitter.addListener(photon => {
      if (!model.runningProperty.get()) {
        this.photonEmittedUtterance.alert = this.getPhotonEmittedAlert(photon);
        this.alertDescriptionUtterance(this.photonEmittedUtterance);
      }
    });
    model.activeMolecules.addItemAddedListener(molecule => {
      molecule.brokeApartEmitter.addListener((moleculeA, moleculeB) => {
        this.constituentMolecule1 = moleculeA;
        this.constituentMolecule2 = moleculeB;
      });
    });
    returnMoleculeButtonVisibleProperty.link(visible => {
      // pdom - announce to the user when the button becomes visible
      if (visible && model.runningProperty.get()) {
        this.alertDescriptionUtterance(resetOrChangeMoleculeStringProperty.value);
      }
    });
  }

  /**
   * Get an alert that describes the running state of the simulation. If running and the emitter is off,
   * a hint is returned that prompts the user to turn on the photon emitter.
   * @private
   *
   * @param {boolean} emitterOn
   * @param {boolean} running
   * @returns {string}
   */
  getRunningStateAlert(emitterOn, running) {
    let alert;
    if (running && !emitterOn) {
      alert = simPlayingHintAlertStringProperty.value;
    } else {
      alert = emitterOn ? simPausedEmitterOnAlertStringProperty.value : simPausedEmitterOffAlertStringProperty.value;
    }
    assert && assert(alert);
    return alert;
  }

  /**
   * Get an alert that describes the new state of the photon emitter. Depends on play speed and running state
   * of the simulation to remind the user of the time control state.
   * @public
   *
   * @param {boolean} on
   * @param {boolean} running
   * @param {boolean} slowMotion
   * @returns {*}
   */
  getPhotonEmitterStateAlert(on, running, slowMotion) {
    if (!on) {
      return photonsOffStringProperty.value;
    } else {
      if (!running) {
        if (slowMotion) {
          return photonsOnSlowSpeedSimPausedStringProperty.value;
        } else {
          return photonsOnSimPausedStringProperty.value;
        }
      } else {
        if (slowMotion) {
          return photonsOnSlowSpeedStringProperty.value;
        } else {
          return photonsOnStringProperty.value;
        }
      }
    }
  }

  /**
   * Get an alert that describes the photon as it is re-emitted from a molecule. Pretty verbose, so generally only
   * used when paused or in slow motion.
   * @public
   *
   * @param photon
   * @returns {string}
   */
  getPhotonEmittedAlert(photon) {
    const lightSourceString = WavelengthConstants.getLightSourceName(photon.wavelength);
    return StringUtils.fillIn(pausedPhotonEmittedPatternStringProperty.value, {
      lightSource: lightSourceString
    });
  }

  /**
   * Get an alert as a result of the user pressing the StepForwardButton. If nothing is happening in the observation
   * window, returns an alert that gives the user a hint to activate something. Otherwise, may create an alert
   * that describes state of active molecule. But may also not produce any alert.
   * @private
   *
   * @param {PhotonAbsorptionModel} model
   * @returns {null|string}
   */
  getManualStepAlert(model) {
    let alert = null;
    const emitterOn = model.photonEmitterOnProperty.get();
    const hasPhotons = model.photonGroup.count > 0;
    const targetMolecule = model.targetMolecule;
    if (targetMolecule) {
      const photonAbsorbed = targetMolecule.isPhotonAbsorbed();
      if (!emitterOn && !hasPhotons && !photonAbsorbed) {
        alert = stepHintAlertStringProperty.value;
      } else if (photonAbsorbed) {
        if (targetMolecule.rotatingProperty.get()) {
          alert = shortRotatingAlertStringProperty.value;
        } else if (targetMolecule.vibratingProperty.get()) {
          alert = targetMolecule.vibratesByStretching() ? shortStretchingAlertStringProperty.value : shortBendingAlertStringProperty.value;
        } else if (targetMolecule.highElectronicEnergyStateProperty.get()) {
          alert = shortGlowingAlertStringProperty.value;
        }
      }
    } else if (this.moleculeWasBrokenLastStep) {
      if (!this.model.hasBothConstituentMolecules(this.constituentMolecule1, this.constituentMolecule2)) {
        // no target molecule and constituents have been removed
        alert = moleculePiecesGoneStringProperty.value;
      } else {
        // no target molecule indicates break apert, but molecules are still floating away
        alert = this.getMoleculesFloatingAwayDescription(this.constituentMolecule1, this.constituentMolecule2);
      }
    }
    this.moleculeWasBrokenLastStep = targetMolecule === null;
    return alert;
  }

  /**
   * A description of the constituent molecules as they float away after a molecule breaks apart.
   * @public
   *
   * @param {Molecule} firstMolecule
   * @param {Molecule} secondMolecule
   * @returns {string}
   */
  getMoleculesFloatingAwayDescription(firstMolecule, secondMolecule) {
    const firstMolecularFormula = MoleculeUtils.getMolecularFormula(firstMolecule);
    const secondMolecularFormula = MoleculeUtils.getMolecularFormula(secondMolecule);
    return StringUtils.fillIn(moleculesFloatingAwayPatternStringProperty.value, {
      firstMolecule: firstMolecularFormula,
      secondMolecule: secondMolecularFormula
    });
  }
}
greenhouseEffect.register('ObservationWindowAlertManager', ObservationWindowAlertManager);
export default ObservationWindowAlertManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdVdGlscyIsIkFsZXJ0ZXIiLCJVdHRlcmFuY2UiLCJncmVlbmhvdXNlRWZmZWN0IiwiR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MiLCJXYXZlbGVuZ3RoQ29uc3RhbnRzIiwiTW9sZWN1bGVVdGlscyIsIm1vbGVjdWxlc0Zsb2F0aW5nQXdheVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsImExMXkiLCJwaG90b25zT25TdHJpbmdQcm9wZXJ0eSIsInBob3RvbkVtaXR0ZXIiLCJhbGVydHMiLCJwaG90b25zT2ZmU3RyaW5nUHJvcGVydHkiLCJwaG90b25zT25TbG93U3BlZWRTdHJpbmdQcm9wZXJ0eSIsInBob3RvbnNPblNpbVBhdXNlZFN0cmluZ1Byb3BlcnR5IiwicGhvdG9uc09uU2xvd1NwZWVkU2ltUGF1c2VkU3RyaW5nUHJvcGVydHkiLCJzaW1QYXVzZWRFbWl0dGVyT25BbGVydFN0cmluZ1Byb3BlcnR5IiwidGltZUNvbnRyb2xzIiwic2ltUGF1c2VkRW1pdHRlck9mZkFsZXJ0U3RyaW5nUHJvcGVydHkiLCJzaW1QbGF5aW5nSGludEFsZXJ0U3RyaW5nUHJvcGVydHkiLCJzdGVwSGludEFsZXJ0U3RyaW5nUHJvcGVydHkiLCJwYXVzZWRQaG90b25FbWl0dGVkUGF0dGVyblN0cmluZ1Byb3BlcnR5Iiwic2hvcnRSb3RhdGluZ0FsZXJ0U3RyaW5nUHJvcGVydHkiLCJzaG9ydFN0cmV0Y2hpbmdBbGVydFN0cmluZ1Byb3BlcnR5Iiwic2hvcnRCZW5kaW5nQWxlcnRTdHJpbmdQcm9wZXJ0eSIsInNob3J0R2xvd2luZ0FsZXJ0U3RyaW5nUHJvcGVydHkiLCJtb2xlY3VsZVBpZWNlc0dvbmVTdHJpbmdQcm9wZXJ0eSIsInJlc2V0T3JDaGFuZ2VNb2xlY3VsZVN0cmluZ1Byb3BlcnR5IiwiT2JzZXJ2YXRpb25XaW5kb3dBbGVydE1hbmFnZXIiLCJjb25zdHJ1Y3RvciIsIm9ic2VydmF0aW9uV2luZG93IiwiZGVzY3JpcHRpb25BbGVydE5vZGUiLCJwaG90b25TdGF0ZVV0dGVyYW5jZSIsInJ1bm5pbmdTdGF0ZVV0dGVyYW5jZSIsIm1hbnVhbFN0ZXBVdHRlcmFuY2UiLCJwaG90b25FbWl0dGVkVXR0ZXJhbmNlIiwibW9sZWN1bGVXYXNCcm9rZW5MYXN0U3RlcCIsImNvbnN0aXR1ZW50TW9sZWN1bGUxIiwiY29uc3RpdHVlbnRNb2xlY3VsZTIiLCJtb2RlbCIsImluaXRpYWxpemUiLCJyZXR1cm5Nb2xlY3VsZUJ1dHRvblZpc2libGVQcm9wZXJ0eSIsInBob3RvbkVtaXR0ZXJPblByb3BlcnR5IiwibGF6eUxpbmsiLCJvbiIsImFsZXJ0IiwiZ2V0UGhvdG9uRW1pdHRlclN0YXRlQWxlcnQiLCJydW5uaW5nUHJvcGVydHkiLCJ2YWx1ZSIsInNsb3dNb3Rpb25Qcm9wZXJ0eSIsImFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UiLCJydW5uaW5nIiwiZ2V0IiwiZ2V0UnVubmluZ1N0YXRlQWxlcnQiLCJtYW51YWxTdGVwRW1pdHRlciIsImFkZExpc3RlbmVyIiwiZ2V0TWFudWFsU3RlcEFsZXJ0IiwicGhvdG9uRW1pdHRlZEVtaXR0ZXIiLCJwaG90b24iLCJnZXRQaG90b25FbWl0dGVkQWxlcnQiLCJhY3RpdmVNb2xlY3VsZXMiLCJhZGRJdGVtQWRkZWRMaXN0ZW5lciIsIm1vbGVjdWxlIiwiYnJva2VBcGFydEVtaXR0ZXIiLCJtb2xlY3VsZUEiLCJtb2xlY3VsZUIiLCJsaW5rIiwidmlzaWJsZSIsImVtaXR0ZXJPbiIsImFzc2VydCIsInNsb3dNb3Rpb24iLCJsaWdodFNvdXJjZVN0cmluZyIsImdldExpZ2h0U291cmNlTmFtZSIsIndhdmVsZW5ndGgiLCJmaWxsSW4iLCJsaWdodFNvdXJjZSIsImhhc1Bob3RvbnMiLCJwaG90b25Hcm91cCIsImNvdW50IiwidGFyZ2V0TW9sZWN1bGUiLCJwaG90b25BYnNvcmJlZCIsImlzUGhvdG9uQWJzb3JiZWQiLCJyb3RhdGluZ1Byb3BlcnR5IiwidmlicmF0aW5nUHJvcGVydHkiLCJ2aWJyYXRlc0J5U3RyZXRjaGluZyIsImhpZ2hFbGVjdHJvbmljRW5lcmd5U3RhdGVQcm9wZXJ0eSIsImhhc0JvdGhDb25zdGl0dWVudE1vbGVjdWxlcyIsImdldE1vbGVjdWxlc0Zsb2F0aW5nQXdheURlc2NyaXB0aW9uIiwiZmlyc3RNb2xlY3VsZSIsInNlY29uZE1vbGVjdWxlIiwiZmlyc3RNb2xlY3VsYXJGb3JtdWxhIiwiZ2V0TW9sZWN1bGFyRm9ybXVsYSIsInNlY29uZE1vbGVjdWxhckZvcm11bGEiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk9ic2VydmF0aW9uV2luZG93QWxlcnRNYW5hZ2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1hbmFnZXMgYWxlcnRzIGZvciB0aGUgc3RhdGUgb2YgY29udGVudHMgaW4gdGhlIE9ic2VydmF0aW9uIHdpbmRvdyBvZiBNb2xlY3VsZXMgYW5kIExpZ2h0LiBGb3IgdGhpbmdzIHRoYXRcclxuICogYXJlIG1vcmUgZ2VuZXJhbCB0aGFuIGludGVyYWN0aW9ucyBoYXBwZW5pbmcgYmV0d2VlbiBwaG90b25zIGFuZCB0aGUgYWN0aXZlIG1vbGVjdWxlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgQWxlcnRlciBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYWNjZXNzaWJpbGl0eS9kZXNjcmliZXJzL0FsZXJ0ZXIuanMnO1xyXG5pbXBvcnQgVXR0ZXJhbmNlIGZyb20gJy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2UuanMnO1xyXG5pbXBvcnQgZ3JlZW5ob3VzZUVmZmVjdCBmcm9tICcuLi8uLi9ncmVlbmhvdXNlRWZmZWN0LmpzJztcclxuaW1wb3J0IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzIGZyb20gJy4uLy4uL0dyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmpzJztcclxuaW1wb3J0IFdhdmVsZW5ndGhDb25zdGFudHMgZnJvbSAnLi4vbW9kZWwvV2F2ZWxlbmd0aENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZVV0aWxzIGZyb20gJy4vTW9sZWN1bGVVdGlscy5qcyc7XHJcblxyXG5jb25zdCBtb2xlY3VsZXNGbG9hdGluZ0F3YXlQYXR0ZXJuU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5Lm1vbGVjdWxlc0Zsb2F0aW5nQXdheVBhdHRlcm5TdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgcGhvdG9uc09uU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnBob3RvbkVtaXR0ZXIuYWxlcnRzLnBob3RvbnNPblN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBwaG90b25zT2ZmU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnBob3RvbkVtaXR0ZXIuYWxlcnRzLnBob3RvbnNPZmZTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgcGhvdG9uc09uU2xvd1NwZWVkU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnBob3RvbkVtaXR0ZXIuYWxlcnRzLnBob3RvbnNPblNsb3dTcGVlZFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBwaG90b25zT25TaW1QYXVzZWRTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkucGhvdG9uRW1pdHRlci5hbGVydHMucGhvdG9uc09uU2ltUGF1c2VkU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHBob3RvbnNPblNsb3dTcGVlZFNpbVBhdXNlZFN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5waG90b25FbWl0dGVyLmFsZXJ0cy5waG90b25zT25TbG93U3BlZWRTaW1QYXVzZWRTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc2ltUGF1c2VkRW1pdHRlck9uQWxlcnRTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkudGltZUNvbnRyb2xzLnNpbVBhdXNlZEVtaXR0ZXJPbkFsZXJ0U3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNpbVBhdXNlZEVtaXR0ZXJPZmZBbGVydFN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS50aW1lQ29udHJvbHMuc2ltUGF1c2VkRW1pdHRlck9mZkFsZXJ0U3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNpbVBsYXlpbmdIaW50QWxlcnRTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkudGltZUNvbnRyb2xzLnNpbVBsYXlpbmdIaW50QWxlcnRTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3RlcEhpbnRBbGVydFN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS50aW1lQ29udHJvbHMuc3RlcEhpbnRBbGVydFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBwYXVzZWRQaG90b25FbWl0dGVkUGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5waG90b25FbWl0dGVyLmFsZXJ0cy5wYXVzZWRQaG90b25FbWl0dGVkUGF0dGVyblN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBzaG9ydFJvdGF0aW5nQWxlcnRTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuc2hvcnRSb3RhdGluZ0FsZXJ0U3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNob3J0U3RyZXRjaGluZ0FsZXJ0U3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNob3J0U3RyZXRjaGluZ0FsZXJ0U3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNob3J0QmVuZGluZ0FsZXJ0U3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNob3J0QmVuZGluZ0FsZXJ0U3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNob3J0R2xvd2luZ0FsZXJ0U3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNob3J0R2xvd2luZ0FsZXJ0U3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IG1vbGVjdWxlUGllY2VzR29uZVN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5tb2xlY3VsZVBpZWNlc0dvbmVTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgcmVzZXRPckNoYW5nZU1vbGVjdWxlU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnJlc2V0T3JDaGFuZ2VNb2xlY3VsZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuY2xhc3MgT2JzZXJ2YXRpb25XaW5kb3dBbGVydE1hbmFnZXIgZXh0ZW5kcyBBbGVydGVyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNaWNyb09ic2VydmF0aW9uV2luZG93fSBvYnNlcnZhdGlvbldpbmRvd1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvYnNlcnZhdGlvbldpbmRvdyApIHtcclxuXHJcbiAgICBzdXBlcigge1xyXG5cclxuICAgICAgLy8gYWxlcnRzIGdvIHRocm91Z2ggdGhlIE9ic2VydmF0aW9uV2luZG93IGl0c2VsZlxyXG4gICAgICBkZXNjcmlwdGlvbkFsZXJ0Tm9kZTogb2JzZXJ2YXRpb25XaW5kb3dcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VXR0ZXJhbmNlfSAtIHNpbmdsZSB1dHRlcmFuY2VzIGZvciBjYXRlZ29yaWVzIG9mIGluZm9ybWF0aW9uIHNvIGFueSBvbmUgc2V0IG9mIHV0dGVyYW5jZXNcclxuICAgIC8vIGRvbid0IHNwYW0gdGhlIHVzZXIgb24gZnJlcXVlbnQgaW50ZXJhY3Rpb25cclxuICAgIHRoaXMucGhvdG9uU3RhdGVVdHRlcmFuY2UgPSBuZXcgVXR0ZXJhbmNlKCk7XHJcbiAgICB0aGlzLnJ1bm5pbmdTdGF0ZVV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoKTtcclxuICAgIHRoaXMubWFudWFsU3RlcFV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoKTtcclxuICAgIHRoaXMucGhvdG9uRW1pdHRlZFV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoKTtcclxuXHJcbiAgICAvLyBXZSBvbmx5IHdhbnQgdG8gZGVzY3JpYmUgdGhhdCBjb25zdGl0dWVudCBtb2xlY3VsZXMgYXJlIGZsb2F0aW5nIGF3YXkgaW4gdGhlIHN0ZXBzIEFGVEVSIHRoZSBtb2xlY3VsZVxyXG4gICAgLy8gYWN0dWFsbHkgYnJlYWtzIGFwYXJ0IHRvIG1ha2Ugc3BhY2UgZm9yIHRoZSBhY3R1YWwgYnJlYWsgYXBhcnQgYWxlcnRcclxuICAgIHRoaXMubW9sZWN1bGVXYXNCcm9rZW5MYXN0U3RlcCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIHtNb2xlY3VsZXxudWxsfSAtIENvbnN0aXR1ZW50IG1vbGVjdWxlcyBhZGRlZCB0byB0aGUgbW9kZWwgdXBvbiBicmVhayBhcGFydCwgcmVmZXJlbmNlZCBzbyB0aGF0IHdlIGNhblxyXG4gICAgLy8gc3RpbGwgZGVzY3JpYmUgdGhlbSBmbG9hdGluZyBhZnRlciB0aGV5IGhhdmUgbGVmdCB0aGUgb2JzZXJ2YXRpb24gd2luZG93XHJcbiAgICB0aGlzLmNvbnN0aXR1ZW50TW9sZWN1bGUxID0gbnVsbDtcclxuICAgIHRoaXMuY29uc3RpdHVlbnRNb2xlY3VsZTIgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtNb2xlY3VsZXNBbmRMaWdodE1vZGVsfVxyXG4gICAgdGhpcy5tb2RlbCA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplIHRoZSBhbGVydCBtYW5hZ2VyIGJ5IGF0dGFjaGluZyBsaXN0ZXJzIHRoYXQgdHJpZ2dlciBhbGVydHMgd2l0aCB2YXJpb3VzIGNoYW5nZXMgdG8gb2JzZXJ2YWJsZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQaG90b25BYnNvcnB0aW9uTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtCb29sZWFuUHJvcGVydHl9IHJldHVybk1vbGVjdWxlQnV0dG9uVmlzaWJsZVByb3BlcnR5XHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZSggbW9kZWwsIHJldHVybk1vbGVjdWxlQnV0dG9uVmlzaWJsZVByb3BlcnR5ICkge1xyXG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgIG1vZGVsLnBob3RvbkVtaXR0ZXJPblByb3BlcnR5LmxhenlMaW5rKCBvbiA9PiB7XHJcbiAgICAgIHRoaXMucGhvdG9uU3RhdGVVdHRlcmFuY2UuYWxlcnQgPSB0aGlzLmdldFBob3RvbkVtaXR0ZXJTdGF0ZUFsZXJ0KCBvbiwgbW9kZWwucnVubmluZ1Byb3BlcnR5LnZhbHVlLCBtb2RlbC5zbG93TW90aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgdGhpcy5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCB0aGlzLnBob3RvblN0YXRlVXR0ZXJhbmNlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgbW9kZWwucnVubmluZ1Byb3BlcnR5LmxhenlMaW5rKCBydW5uaW5nID0+IHtcclxuXHJcbiAgICAgIC8vIGlmIHRoZSBzaW0gaXMgcnVubmluZyBhbmQgdGhlIHBob3RvbiBlbWl0dGVyIGlzIG9uLCB0aGVyZSBpcyBwbGVudHkgb2Ygc291bmQgYWxyZWFkeSwgZG9uJ3QgYWRkXHJcbiAgICAgIC8vIHRvIGFsZXJ0c1xyXG4gICAgICBpZiAoIHJ1bm5pbmcgJiYgbW9kZWwucGhvdG9uRW1pdHRlck9uUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnJ1bm5pbmdTdGF0ZVV0dGVyYW5jZS5hbGVydCA9IHRoaXMuZ2V0UnVubmluZ1N0YXRlQWxlcnQoIG1vZGVsLnBob3RvbkVtaXR0ZXJPblByb3BlcnR5LmdldCgpLCBydW5uaW5nICk7XHJcbiAgICAgIHRoaXMuYWxlcnREZXNjcmlwdGlvblV0dGVyYW5jZSggdGhpcy5ydW5uaW5nU3RhdGVVdHRlcmFuY2UgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBtb2RlbC5tYW51YWxTdGVwRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICBjb25zdCBhbGVydCA9IHRoaXMuZ2V0TWFudWFsU3RlcEFsZXJ0KCBtb2RlbCApO1xyXG4gICAgICBpZiAoIGFsZXJ0ICkge1xyXG4gICAgICAgIHRoaXMubWFudWFsU3RlcFV0dGVyYW5jZS5hbGVydCA9IGFsZXJ0O1xyXG4gICAgICAgIHRoaXMuYWxlcnREZXNjcmlwdGlvblV0dGVyYW5jZSggdGhpcy5tYW51YWxTdGVwVXR0ZXJhbmNlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBtb2RlbC5waG90b25FbWl0dGVkRW1pdHRlci5hZGRMaXN0ZW5lciggcGhvdG9uID0+IHtcclxuICAgICAgaWYgKCAhbW9kZWwucnVubmluZ1Byb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgIHRoaXMucGhvdG9uRW1pdHRlZFV0dGVyYW5jZS5hbGVydCA9IHRoaXMuZ2V0UGhvdG9uRW1pdHRlZEFsZXJ0KCBwaG90b24gKTtcclxuICAgICAgICB0aGlzLmFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UoIHRoaXMucGhvdG9uRW1pdHRlZFV0dGVyYW5jZSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgbW9kZWwuYWN0aXZlTW9sZWN1bGVzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBtb2xlY3VsZSA9PiB7XHJcbiAgICAgIG1vbGVjdWxlLmJyb2tlQXBhcnRFbWl0dGVyLmFkZExpc3RlbmVyKCAoIG1vbGVjdWxlQSwgbW9sZWN1bGVCICkgPT4ge1xyXG4gICAgICAgIHRoaXMuY29uc3RpdHVlbnRNb2xlY3VsZTEgPSBtb2xlY3VsZUE7XHJcbiAgICAgICAgdGhpcy5jb25zdGl0dWVudE1vbGVjdWxlMiA9IG1vbGVjdWxlQjtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybk1vbGVjdWxlQnV0dG9uVmlzaWJsZVByb3BlcnR5LmxpbmsoIHZpc2libGUgPT4ge1xyXG5cclxuICAgICAgLy8gcGRvbSAtIGFubm91bmNlIHRvIHRoZSB1c2VyIHdoZW4gdGhlIGJ1dHRvbiBiZWNvbWVzIHZpc2libGVcclxuICAgICAgaWYgKCB2aXNpYmxlICYmIG1vZGVsLnJ1bm5pbmdQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICB0aGlzLmFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UoIHJlc2V0T3JDaGFuZ2VNb2xlY3VsZVN0cmluZ1Byb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhbiBhbGVydCB0aGF0IGRlc2NyaWJlcyB0aGUgcnVubmluZyBzdGF0ZSBvZiB0aGUgc2ltdWxhdGlvbi4gSWYgcnVubmluZyBhbmQgdGhlIGVtaXR0ZXIgaXMgb2ZmLFxyXG4gICAqIGEgaGludCBpcyByZXR1cm5lZCB0aGF0IHByb21wdHMgdGhlIHVzZXIgdG8gdHVybiBvbiB0aGUgcGhvdG9uIGVtaXR0ZXIuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZW1pdHRlck9uXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBydW5uaW5nXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRSdW5uaW5nU3RhdGVBbGVydCggZW1pdHRlck9uLCBydW5uaW5nICkge1xyXG4gICAgbGV0IGFsZXJ0O1xyXG4gICAgaWYgKCBydW5uaW5nICYmICFlbWl0dGVyT24gKSB7XHJcbiAgICAgIGFsZXJ0ID0gc2ltUGxheWluZ0hpbnRBbGVydFN0cmluZ1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGFsZXJ0ID0gZW1pdHRlck9uID8gc2ltUGF1c2VkRW1pdHRlck9uQWxlcnRTdHJpbmdQcm9wZXJ0eS52YWx1ZSA6IHNpbVBhdXNlZEVtaXR0ZXJPZmZBbGVydFN0cmluZ1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFsZXJ0ICk7XHJcbiAgICByZXR1cm4gYWxlcnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYW4gYWxlcnQgdGhhdCBkZXNjcmliZXMgdGhlIG5ldyBzdGF0ZSBvZiB0aGUgcGhvdG9uIGVtaXR0ZXIuIERlcGVuZHMgb24gcGxheSBzcGVlZCBhbmQgcnVubmluZyBzdGF0ZVxyXG4gICAqIG9mIHRoZSBzaW11bGF0aW9uIHRvIHJlbWluZCB0aGUgdXNlciBvZiB0aGUgdGltZSBjb250cm9sIHN0YXRlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gb25cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHJ1bm5pbmdcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNsb3dNb3Rpb25cclxuICAgKiBAcmV0dXJucyB7Kn1cclxuICAgKi9cclxuICBnZXRQaG90b25FbWl0dGVyU3RhdGVBbGVydCggb24sIHJ1bm5pbmcsIHNsb3dNb3Rpb24gKSB7XHJcbiAgICBpZiAoICFvbiApIHtcclxuICAgICAgcmV0dXJuIHBob3RvbnNPZmZTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBpZiAoICFydW5uaW5nICkge1xyXG4gICAgICAgIGlmICggc2xvd01vdGlvbiApIHtcclxuICAgICAgICAgIHJldHVybiBwaG90b25zT25TbG93U3BlZWRTaW1QYXVzZWRTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gcGhvdG9uc09uU2ltUGF1c2VkU3RyaW5nUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICggc2xvd01vdGlvbiApIHtcclxuICAgICAgICAgIHJldHVybiBwaG90b25zT25TbG93U3BlZWRTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gcGhvdG9uc09uU3RyaW5nUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYW4gYWxlcnQgdGhhdCBkZXNjcmliZXMgdGhlIHBob3RvbiBhcyBpdCBpcyByZS1lbWl0dGVkIGZyb20gYSBtb2xlY3VsZS4gUHJldHR5IHZlcmJvc2UsIHNvIGdlbmVyYWxseSBvbmx5XHJcbiAgICogdXNlZCB3aGVuIHBhdXNlZCBvciBpbiBzbG93IG1vdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGhvdG9uXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRQaG90b25FbWl0dGVkQWxlcnQoIHBob3RvbiApIHtcclxuICAgIGNvbnN0IGxpZ2h0U291cmNlU3RyaW5nID0gV2F2ZWxlbmd0aENvbnN0YW50cy5nZXRMaWdodFNvdXJjZU5hbWUoIHBob3Rvbi53YXZlbGVuZ3RoICk7XHJcblxyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggcGF1c2VkUGhvdG9uRW1pdHRlZFBhdHRlcm5TdHJpbmdQcm9wZXJ0eS52YWx1ZSwge1xyXG4gICAgICBsaWdodFNvdXJjZTogbGlnaHRTb3VyY2VTdHJpbmdcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhbiBhbGVydCBhcyBhIHJlc3VsdCBvZiB0aGUgdXNlciBwcmVzc2luZyB0aGUgU3RlcEZvcndhcmRCdXR0b24uIElmIG5vdGhpbmcgaXMgaGFwcGVuaW5nIGluIHRoZSBvYnNlcnZhdGlvblxyXG4gICAqIHdpbmRvdywgcmV0dXJucyBhbiBhbGVydCB0aGF0IGdpdmVzIHRoZSB1c2VyIGEgaGludCB0byBhY3RpdmF0ZSBzb21ldGhpbmcuIE90aGVyd2lzZSwgbWF5IGNyZWF0ZSBhbiBhbGVydFxyXG4gICAqIHRoYXQgZGVzY3JpYmVzIHN0YXRlIG9mIGFjdGl2ZSBtb2xlY3VsZS4gQnV0IG1heSBhbHNvIG5vdCBwcm9kdWNlIGFueSBhbGVydC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQaG90b25BYnNvcnB0aW9uTW9kZWx9IG1vZGVsXHJcbiAgICogQHJldHVybnMge251bGx8c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldE1hbnVhbFN0ZXBBbGVydCggbW9kZWwgKSB7XHJcbiAgICBsZXQgYWxlcnQgPSBudWxsO1xyXG5cclxuICAgIGNvbnN0IGVtaXR0ZXJPbiA9IG1vZGVsLnBob3RvbkVtaXR0ZXJPblByb3BlcnR5LmdldCgpO1xyXG4gICAgY29uc3QgaGFzUGhvdG9ucyA9IG1vZGVsLnBob3Rvbkdyb3VwLmNvdW50ID4gMDtcclxuICAgIGNvbnN0IHRhcmdldE1vbGVjdWxlID0gbW9kZWwudGFyZ2V0TW9sZWN1bGU7XHJcblxyXG4gICAgaWYgKCB0YXJnZXRNb2xlY3VsZSApIHtcclxuICAgICAgY29uc3QgcGhvdG9uQWJzb3JiZWQgPSB0YXJnZXRNb2xlY3VsZS5pc1Bob3RvbkFic29yYmVkKCk7XHJcblxyXG4gICAgICBpZiAoICFlbWl0dGVyT24gJiYgIWhhc1Bob3RvbnMgJiYgIXBob3RvbkFic29yYmVkICkge1xyXG4gICAgICAgIGFsZXJ0ID0gc3RlcEhpbnRBbGVydFN0cmluZ1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBwaG90b25BYnNvcmJlZCApIHtcclxuICAgICAgICBpZiAoIHRhcmdldE1vbGVjdWxlLnJvdGF0aW5nUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgICAgICBhbGVydCA9IHNob3J0Um90YXRpbmdBbGVydFN0cmluZ1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggdGFyZ2V0TW9sZWN1bGUudmlicmF0aW5nUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgICAgICBhbGVydCA9IHRhcmdldE1vbGVjdWxlLnZpYnJhdGVzQnlTdHJldGNoaW5nKCkgP1xyXG4gICAgICAgICAgICAgICAgICBzaG9ydFN0cmV0Y2hpbmdBbGVydFN0cmluZ1Byb3BlcnR5LnZhbHVlIDpcclxuICAgICAgICAgICAgICAgICAgc2hvcnRCZW5kaW5nQWxlcnRTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIHRhcmdldE1vbGVjdWxlLmhpZ2hFbGVjdHJvbmljRW5lcmd5U3RhdGVQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICAgIGFsZXJ0ID0gc2hvcnRHbG93aW5nQWxlcnRTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLm1vbGVjdWxlV2FzQnJva2VuTGFzdFN0ZXAgKSB7XHJcbiAgICAgIGlmICggIXRoaXMubW9kZWwuaGFzQm90aENvbnN0aXR1ZW50TW9sZWN1bGVzKCB0aGlzLmNvbnN0aXR1ZW50TW9sZWN1bGUxLCB0aGlzLmNvbnN0aXR1ZW50TW9sZWN1bGUyICkgKSB7XHJcblxyXG4gICAgICAgIC8vIG5vIHRhcmdldCBtb2xlY3VsZSBhbmQgY29uc3RpdHVlbnRzIGhhdmUgYmVlbiByZW1vdmVkXHJcbiAgICAgICAgYWxlcnQgPSBtb2xlY3VsZVBpZWNlc0dvbmVTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gbm8gdGFyZ2V0IG1vbGVjdWxlIGluZGljYXRlcyBicmVhayBhcGVydCwgYnV0IG1vbGVjdWxlcyBhcmUgc3RpbGwgZmxvYXRpbmcgYXdheVxyXG4gICAgICAgIGFsZXJ0ID0gdGhpcy5nZXRNb2xlY3VsZXNGbG9hdGluZ0F3YXlEZXNjcmlwdGlvbiggdGhpcy5jb25zdGl0dWVudE1vbGVjdWxlMSwgdGhpcy5jb25zdGl0dWVudE1vbGVjdWxlMiApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5tb2xlY3VsZVdhc0Jyb2tlbkxhc3RTdGVwID0gdGFyZ2V0TW9sZWN1bGUgPT09IG51bGw7XHJcblxyXG4gICAgcmV0dXJuIGFsZXJ0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBkZXNjcmlwdGlvbiBvZiB0aGUgY29uc3RpdHVlbnQgbW9sZWN1bGVzIGFzIHRoZXkgZmxvYXQgYXdheSBhZnRlciBhIG1vbGVjdWxlIGJyZWFrcyBhcGFydC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01vbGVjdWxlfSBmaXJzdE1vbGVjdWxlXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZX0gc2Vjb25kTW9sZWN1bGVcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldE1vbGVjdWxlc0Zsb2F0aW5nQXdheURlc2NyaXB0aW9uKCBmaXJzdE1vbGVjdWxlLCBzZWNvbmRNb2xlY3VsZSApIHtcclxuICAgIGNvbnN0IGZpcnN0TW9sZWN1bGFyRm9ybXVsYSA9IE1vbGVjdWxlVXRpbHMuZ2V0TW9sZWN1bGFyRm9ybXVsYSggZmlyc3RNb2xlY3VsZSApO1xyXG4gICAgY29uc3Qgc2Vjb25kTW9sZWN1bGFyRm9ybXVsYSA9IE1vbGVjdWxlVXRpbHMuZ2V0TW9sZWN1bGFyRm9ybXVsYSggc2Vjb25kTW9sZWN1bGUgKTtcclxuXHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBtb2xlY3VsZXNGbG9hdGluZ0F3YXlQYXR0ZXJuU3RyaW5nUHJvcGVydHkudmFsdWUsIHtcclxuICAgICAgZmlyc3RNb2xlY3VsZTogZmlyc3RNb2xlY3VsYXJGb3JtdWxhLFxyXG4gICAgICBzZWNvbmRNb2xlY3VsZTogc2Vjb25kTW9sZWN1bGFyRm9ybXVsYVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JlZW5ob3VzZUVmZmVjdC5yZWdpc3RlciggJ09ic2VydmF0aW9uV2luZG93QWxlcnRNYW5hZ2VyJywgT2JzZXJ2YXRpb25XaW5kb3dBbGVydE1hbmFnZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgT2JzZXJ2YXRpb25XaW5kb3dBbGVydE1hbmFnZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxPQUFPLE1BQU0saUVBQWlFO0FBQ3JGLE9BQU9DLFNBQVMsTUFBTSw2Q0FBNkM7QUFDbkUsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFPQyxtQkFBbUIsTUFBTSxpQ0FBaUM7QUFDakUsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUU5QyxNQUFNQywwQ0FBMEMsR0FBR0gsdUJBQXVCLENBQUNJLElBQUksQ0FBQ0QsMENBQTBDO0FBQzFILE1BQU1FLHVCQUF1QixHQUFHTCx1QkFBdUIsQ0FBQ0ksSUFBSSxDQUFDRSxhQUFhLENBQUNDLE1BQU0sQ0FBQ0YsdUJBQXVCO0FBQ3pHLE1BQU1HLHdCQUF3QixHQUFHUix1QkFBdUIsQ0FBQ0ksSUFBSSxDQUFDRSxhQUFhLENBQUNDLE1BQU0sQ0FBQ0Msd0JBQXdCO0FBQzNHLE1BQU1DLGdDQUFnQyxHQUFHVCx1QkFBdUIsQ0FBQ0ksSUFBSSxDQUFDRSxhQUFhLENBQUNDLE1BQU0sQ0FBQ0UsZ0NBQWdDO0FBQzNILE1BQU1DLGdDQUFnQyxHQUFHVix1QkFBdUIsQ0FBQ0ksSUFBSSxDQUFDRSxhQUFhLENBQUNDLE1BQU0sQ0FBQ0csZ0NBQWdDO0FBQzNILE1BQU1DLHlDQUF5QyxHQUFHWCx1QkFBdUIsQ0FBQ0ksSUFBSSxDQUFDRSxhQUFhLENBQUNDLE1BQU0sQ0FBQ0kseUNBQXlDO0FBQzdJLE1BQU1DLHFDQUFxQyxHQUFHWix1QkFBdUIsQ0FBQ0ksSUFBSSxDQUFDUyxZQUFZLENBQUNELHFDQUFxQztBQUM3SCxNQUFNRSxzQ0FBc0MsR0FBR2QsdUJBQXVCLENBQUNJLElBQUksQ0FBQ1MsWUFBWSxDQUFDQyxzQ0FBc0M7QUFDL0gsTUFBTUMsaUNBQWlDLEdBQUdmLHVCQUF1QixDQUFDSSxJQUFJLENBQUNTLFlBQVksQ0FBQ0UsaUNBQWlDO0FBQ3JILE1BQU1DLDJCQUEyQixHQUFHaEIsdUJBQXVCLENBQUNJLElBQUksQ0FBQ1MsWUFBWSxDQUFDRywyQkFBMkI7QUFDekcsTUFBTUMsd0NBQXdDLEdBQUdqQix1QkFBdUIsQ0FBQ0ksSUFBSSxDQUFDRSxhQUFhLENBQUNDLE1BQU0sQ0FBQ1Usd0NBQXdDO0FBQzNJLE1BQU1DLGdDQUFnQyxHQUFHbEIsdUJBQXVCLENBQUNJLElBQUksQ0FBQ2MsZ0NBQWdDO0FBQ3RHLE1BQU1DLGtDQUFrQyxHQUFHbkIsdUJBQXVCLENBQUNJLElBQUksQ0FBQ2Usa0NBQWtDO0FBQzFHLE1BQU1DLCtCQUErQixHQUFHcEIsdUJBQXVCLENBQUNJLElBQUksQ0FBQ2dCLCtCQUErQjtBQUNwRyxNQUFNQywrQkFBK0IsR0FBR3JCLHVCQUF1QixDQUFDSSxJQUFJLENBQUNpQiwrQkFBK0I7QUFDcEcsTUFBTUMsZ0NBQWdDLEdBQUd0Qix1QkFBdUIsQ0FBQ0ksSUFBSSxDQUFDa0IsZ0NBQWdDO0FBQ3RHLE1BQU1DLG1DQUFtQyxHQUFHdkIsdUJBQXVCLENBQUNJLElBQUksQ0FBQ21CLG1DQUFtQztBQUU1RyxNQUFNQyw2QkFBNkIsU0FBUzNCLE9BQU8sQ0FBQztFQUVsRDtBQUNGO0FBQ0E7RUFDRTRCLFdBQVdBLENBQUVDLGlCQUFpQixFQUFHO0lBRS9CLEtBQUssQ0FBRTtNQUVMO01BQ0FDLG9CQUFvQixFQUFFRDtJQUN4QixDQUFFLENBQUM7O0lBRUg7SUFDQTtJQUNBLElBQUksQ0FBQ0Usb0JBQW9CLEdBQUcsSUFBSTlCLFNBQVMsQ0FBQyxDQUFDO0lBQzNDLElBQUksQ0FBQytCLHFCQUFxQixHQUFHLElBQUkvQixTQUFTLENBQUMsQ0FBQztJQUM1QyxJQUFJLENBQUNnQyxtQkFBbUIsR0FBRyxJQUFJaEMsU0FBUyxDQUFDLENBQUM7SUFDMUMsSUFBSSxDQUFDaUMsc0JBQXNCLEdBQUcsSUFBSWpDLFNBQVMsQ0FBQyxDQUFDOztJQUU3QztJQUNBO0lBQ0EsSUFBSSxDQUFDa0MseUJBQXlCLEdBQUcsS0FBSzs7SUFFdEM7SUFDQTtJQUNBLElBQUksQ0FBQ0Msb0JBQW9CLEdBQUcsSUFBSTtJQUNoQyxJQUFJLENBQUNDLG9CQUFvQixHQUFHLElBQUk7O0lBRWhDO0lBQ0EsSUFBSSxDQUFDQyxLQUFLLEdBQUcsSUFBSTtFQUNuQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxVQUFVQSxDQUFFRCxLQUFLLEVBQUVFLG1DQUFtQyxFQUFHO0lBQ3ZELElBQUksQ0FBQ0YsS0FBSyxHQUFHQSxLQUFLO0lBRWxCQSxLQUFLLENBQUNHLHVCQUF1QixDQUFDQyxRQUFRLENBQUVDLEVBQUUsSUFBSTtNQUM1QyxJQUFJLENBQUNaLG9CQUFvQixDQUFDYSxLQUFLLEdBQUcsSUFBSSxDQUFDQywwQkFBMEIsQ0FBRUYsRUFBRSxFQUFFTCxLQUFLLENBQUNRLGVBQWUsQ0FBQ0MsS0FBSyxFQUFFVCxLQUFLLENBQUNVLGtCQUFrQixDQUFDRCxLQUFNLENBQUM7TUFDcEksSUFBSSxDQUFDRSx5QkFBeUIsQ0FBRSxJQUFJLENBQUNsQixvQkFBcUIsQ0FBQztJQUM3RCxDQUFFLENBQUM7SUFFSE8sS0FBSyxDQUFDUSxlQUFlLENBQUNKLFFBQVEsQ0FBRVEsT0FBTyxJQUFJO01BRXpDO01BQ0E7TUFDQSxJQUFLQSxPQUFPLElBQUlaLEtBQUssQ0FBQ0csdUJBQXVCLENBQUNVLEdBQUcsQ0FBQyxDQUFDLEVBQUc7UUFDcEQ7TUFDRjtNQUVBLElBQUksQ0FBQ25CLHFCQUFxQixDQUFDWSxLQUFLLEdBQUcsSUFBSSxDQUFDUSxvQkFBb0IsQ0FBRWQsS0FBSyxDQUFDRyx1QkFBdUIsQ0FBQ1UsR0FBRyxDQUFDLENBQUMsRUFBRUQsT0FBUSxDQUFDO01BQzVHLElBQUksQ0FBQ0QseUJBQXlCLENBQUUsSUFBSSxDQUFDakIscUJBQXNCLENBQUM7SUFDOUQsQ0FBRSxDQUFDO0lBRUhNLEtBQUssQ0FBQ2UsaUJBQWlCLENBQUNDLFdBQVcsQ0FBRSxNQUFNO01BQ3pDLE1BQU1WLEtBQUssR0FBRyxJQUFJLENBQUNXLGtCQUFrQixDQUFFakIsS0FBTSxDQUFDO01BQzlDLElBQUtNLEtBQUssRUFBRztRQUNYLElBQUksQ0FBQ1gsbUJBQW1CLENBQUNXLEtBQUssR0FBR0EsS0FBSztRQUN0QyxJQUFJLENBQUNLLHlCQUF5QixDQUFFLElBQUksQ0FBQ2hCLG1CQUFvQixDQUFDO01BQzVEO0lBQ0YsQ0FBRSxDQUFDO0lBRUhLLEtBQUssQ0FBQ2tCLG9CQUFvQixDQUFDRixXQUFXLENBQUVHLE1BQU0sSUFBSTtNQUNoRCxJQUFLLENBQUNuQixLQUFLLENBQUNRLGVBQWUsQ0FBQ0ssR0FBRyxDQUFDLENBQUMsRUFBRztRQUNsQyxJQUFJLENBQUNqQixzQkFBc0IsQ0FBQ1UsS0FBSyxHQUFHLElBQUksQ0FBQ2MscUJBQXFCLENBQUVELE1BQU8sQ0FBQztRQUN4RSxJQUFJLENBQUNSLHlCQUF5QixDQUFFLElBQUksQ0FBQ2Ysc0JBQXVCLENBQUM7TUFDL0Q7SUFDRixDQUFFLENBQUM7SUFFSEksS0FBSyxDQUFDcUIsZUFBZSxDQUFDQyxvQkFBb0IsQ0FBRUMsUUFBUSxJQUFJO01BQ3REQSxRQUFRLENBQUNDLGlCQUFpQixDQUFDUixXQUFXLENBQUUsQ0FBRVMsU0FBUyxFQUFFQyxTQUFTLEtBQU07UUFDbEUsSUFBSSxDQUFDNUIsb0JBQW9CLEdBQUcyQixTQUFTO1FBQ3JDLElBQUksQ0FBQzFCLG9CQUFvQixHQUFHMkIsU0FBUztNQUN2QyxDQUFFLENBQUM7SUFDTCxDQUFFLENBQUM7SUFFSHhCLG1DQUFtQyxDQUFDeUIsSUFBSSxDQUFFQyxPQUFPLElBQUk7TUFFbkQ7TUFDQSxJQUFLQSxPQUFPLElBQUk1QixLQUFLLENBQUNRLGVBQWUsQ0FBQ0ssR0FBRyxDQUFDLENBQUMsRUFBRztRQUM1QyxJQUFJLENBQUNGLHlCQUF5QixDQUFFdkIsbUNBQW1DLENBQUNxQixLQUFNLENBQUM7TUFDN0U7SUFDRixDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUssb0JBQW9CQSxDQUFFZSxTQUFTLEVBQUVqQixPQUFPLEVBQUc7SUFDekMsSUFBSU4sS0FBSztJQUNULElBQUtNLE9BQU8sSUFBSSxDQUFDaUIsU0FBUyxFQUFHO01BQzNCdkIsS0FBSyxHQUFHMUIsaUNBQWlDLENBQUM2QixLQUFLO0lBQ2pELENBQUMsTUFDSTtNQUNISCxLQUFLLEdBQUd1QixTQUFTLEdBQUdwRCxxQ0FBcUMsQ0FBQ2dDLEtBQUssR0FBRzlCLHNDQUFzQyxDQUFDOEIsS0FBSztJQUNoSDtJQUVBcUIsTUFBTSxJQUFJQSxNQUFNLENBQUV4QixLQUFNLENBQUM7SUFDekIsT0FBT0EsS0FBSztFQUNkOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLDBCQUEwQkEsQ0FBRUYsRUFBRSxFQUFFTyxPQUFPLEVBQUVtQixVQUFVLEVBQUc7SUFDcEQsSUFBSyxDQUFDMUIsRUFBRSxFQUFHO01BQ1QsT0FBT2hDLHdCQUF3QixDQUFDb0MsS0FBSztJQUN2QyxDQUFDLE1BQ0k7TUFDSCxJQUFLLENBQUNHLE9BQU8sRUFBRztRQUNkLElBQUttQixVQUFVLEVBQUc7VUFDaEIsT0FBT3ZELHlDQUF5QyxDQUFDaUMsS0FBSztRQUN4RCxDQUFDLE1BQ0k7VUFDSCxPQUFPbEMsZ0NBQWdDLENBQUNrQyxLQUFLO1FBQy9DO01BQ0YsQ0FBQyxNQUNJO1FBQ0gsSUFBS3NCLFVBQVUsRUFBRztVQUNoQixPQUFPekQsZ0NBQWdDLENBQUNtQyxLQUFLO1FBQy9DLENBQUMsTUFDSTtVQUNILE9BQU92Qyx1QkFBdUIsQ0FBQ3VDLEtBQUs7UUFDdEM7TUFDRjtJQUNGO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFVyxxQkFBcUJBLENBQUVELE1BQU0sRUFBRztJQUM5QixNQUFNYSxpQkFBaUIsR0FBR2xFLG1CQUFtQixDQUFDbUUsa0JBQWtCLENBQUVkLE1BQU0sQ0FBQ2UsVUFBVyxDQUFDO0lBRXJGLE9BQU96RSxXQUFXLENBQUMwRSxNQUFNLENBQUVyRCx3Q0FBd0MsQ0FBQzJCLEtBQUssRUFBRTtNQUN6RTJCLFdBQVcsRUFBRUo7SUFDZixDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWYsa0JBQWtCQSxDQUFFakIsS0FBSyxFQUFHO0lBQzFCLElBQUlNLEtBQUssR0FBRyxJQUFJO0lBRWhCLE1BQU11QixTQUFTLEdBQUc3QixLQUFLLENBQUNHLHVCQUF1QixDQUFDVSxHQUFHLENBQUMsQ0FBQztJQUNyRCxNQUFNd0IsVUFBVSxHQUFHckMsS0FBSyxDQUFDc0MsV0FBVyxDQUFDQyxLQUFLLEdBQUcsQ0FBQztJQUM5QyxNQUFNQyxjQUFjLEdBQUd4QyxLQUFLLENBQUN3QyxjQUFjO0lBRTNDLElBQUtBLGNBQWMsRUFBRztNQUNwQixNQUFNQyxjQUFjLEdBQUdELGNBQWMsQ0FBQ0UsZ0JBQWdCLENBQUMsQ0FBQztNQUV4RCxJQUFLLENBQUNiLFNBQVMsSUFBSSxDQUFDUSxVQUFVLElBQUksQ0FBQ0ksY0FBYyxFQUFHO1FBQ2xEbkMsS0FBSyxHQUFHekIsMkJBQTJCLENBQUM0QixLQUFLO01BQzNDLENBQUMsTUFDSSxJQUFLZ0MsY0FBYyxFQUFHO1FBQ3pCLElBQUtELGNBQWMsQ0FBQ0csZ0JBQWdCLENBQUM5QixHQUFHLENBQUMsQ0FBQyxFQUFHO1VBQzNDUCxLQUFLLEdBQUd2QixnQ0FBZ0MsQ0FBQzBCLEtBQUs7UUFDaEQsQ0FBQyxNQUNJLElBQUsrQixjQUFjLENBQUNJLGlCQUFpQixDQUFDL0IsR0FBRyxDQUFDLENBQUMsRUFBRztVQUNqRFAsS0FBSyxHQUFHa0MsY0FBYyxDQUFDSyxvQkFBb0IsQ0FBQyxDQUFDLEdBQ3JDN0Qsa0NBQWtDLENBQUN5QixLQUFLLEdBQ3hDeEIsK0JBQStCLENBQUN3QixLQUFLO1FBQy9DLENBQUMsTUFDSSxJQUFLK0IsY0FBYyxDQUFDTSxpQ0FBaUMsQ0FBQ2pDLEdBQUcsQ0FBQyxDQUFDLEVBQUc7VUFDakVQLEtBQUssR0FBR3BCLCtCQUErQixDQUFDdUIsS0FBSztRQUMvQztNQUNGO0lBQ0YsQ0FBQyxNQUNJLElBQUssSUFBSSxDQUFDWix5QkFBeUIsRUFBRztNQUN6QyxJQUFLLENBQUMsSUFBSSxDQUFDRyxLQUFLLENBQUMrQywyQkFBMkIsQ0FBRSxJQUFJLENBQUNqRCxvQkFBb0IsRUFBRSxJQUFJLENBQUNDLG9CQUFxQixDQUFDLEVBQUc7UUFFckc7UUFDQU8sS0FBSyxHQUFHbkIsZ0NBQWdDLENBQUNzQixLQUFLO01BQ2hELENBQUMsTUFDSTtRQUVIO1FBQ0FILEtBQUssR0FBRyxJQUFJLENBQUMwQyxtQ0FBbUMsQ0FBRSxJQUFJLENBQUNsRCxvQkFBb0IsRUFBRSxJQUFJLENBQUNDLG9CQUFxQixDQUFDO01BQzFHO0lBQ0Y7SUFFQSxJQUFJLENBQUNGLHlCQUF5QixHQUFHMkMsY0FBYyxLQUFLLElBQUk7SUFFeEQsT0FBT2xDLEtBQUs7RUFDZDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UwQyxtQ0FBbUNBLENBQUVDLGFBQWEsRUFBRUMsY0FBYyxFQUFHO0lBQ25FLE1BQU1DLHFCQUFxQixHQUFHcEYsYUFBYSxDQUFDcUYsbUJBQW1CLENBQUVILGFBQWMsQ0FBQztJQUNoRixNQUFNSSxzQkFBc0IsR0FBR3RGLGFBQWEsQ0FBQ3FGLG1CQUFtQixDQUFFRixjQUFlLENBQUM7SUFFbEYsT0FBT3pGLFdBQVcsQ0FBQzBFLE1BQU0sQ0FBRW5FLDBDQUEwQyxDQUFDeUMsS0FBSyxFQUFFO01BQzNFd0MsYUFBYSxFQUFFRSxxQkFBcUI7TUFDcENELGNBQWMsRUFBRUc7SUFDbEIsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBekYsZ0JBQWdCLENBQUMwRixRQUFRLENBQUUsK0JBQStCLEVBQUVqRSw2QkFBOEIsQ0FBQztBQUMzRixlQUFlQSw2QkFBNkIifQ==