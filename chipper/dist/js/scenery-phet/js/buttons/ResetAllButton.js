// Copyright 2013-2023, University of Colorado Boulder

/**
 * Reset All button, typically used to reset everything ('reset all') on a Screen.
 * Extends ResetButton, adding things that are specific to 'reset all'.
 *
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { KeyboardListener, voicingUtteranceQueue } from '../../../scenery/js/imports.js';
import resetAllSoundPlayer from '../../../tambo/js/shared-sound-players/resetAllSoundPlayer.js';
import optionize from '../../../phet-core/js/optionize.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ActivationUtterance from '../../../utterance-queue/js/ActivationUtterance.js';
import PhetColorScheme from '../PhetColorScheme.js';
import sceneryPhet from '../sceneryPhet.js';
import SceneryPhetConstants from '../SceneryPhetConstants.js';
import SceneryPhetStrings from '../SceneryPhetStrings.js';
import ResetButton from './ResetButton.js';
const MARGIN_COEFFICIENT = 5 / SceneryPhetConstants.DEFAULT_BUTTON_RADIUS;
export default class ResetAllButton extends ResetButton {
  constructor(providedOptions) {
    const options = optionize()({
      // ResetAllButtonOptions
      radius: SceneryPhetConstants.DEFAULT_BUTTON_RADIUS,
      // {boolean} - option specific to ResetAllButton. If true, then the reset all button will reset back to the
      // previous PhET-iO state, if applicable.
      phetioRestoreScreenStateOnReset: true,
      // Fine tuned in https://github.com/phetsims/tasks/issues/985 and should not be overridden lightly
      touchAreaDilation: 5.2,
      baseColor: PhetColorScheme.RESET_ALL_BUTTON_BASE_COLOR,
      arrowColor: 'white',
      listener: _.noop,
      // {function}

      // phet-io
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'ResetAllButton',
      phetioDocumentation: 'The orange, round button that can be used to restore the initial state',
      // sound generation
      soundPlayer: resetAllSoundPlayer,
      // pdom
      innerContent: SceneryPhetStrings.a11y.resetAll.labelStringProperty,
      // voicing
      voicingNameResponse: SceneryPhetStrings.a11y.resetAll.labelStringProperty,
      voicingContextResponse: SceneryPhetStrings.a11y.voicing.resetAll.contextResponseStringProperty
    }, providedOptions);

    // Wrap the listener for all cases, since PhET-iO won't be able to call this.isPhetioInstrumented() until the super
    // call is complete.
    const passedInListener = options.listener;
    options.listener = () => {
      passedInListener && passedInListener();

      // every ResetAllButton has the option to reset to the last PhET-iO state if desired.
      if (Tandem.PHET_IO_ENABLED && options.phetioRestoreScreenStateOnReset &&
      // even though this is Tandem.REQUIRED, still be graceful if not yet instrumented
      this.isPhetioInstrumented()) {
        phet.phetio.phetioEngine.phetioStateEngine.restoreStateForScreen(options.tandem);
      }
    };
    assert && assert(options.xMargin === undefined && options.yMargin === undefined, 'resetAllButton sets margins');
    options.xMargin = options.yMargin = options.radius * MARGIN_COEFFICIENT;
    super(options);

    // a11y - when reset all button is fired, disable alerts so that there isn't an excessive stream of alerts
    // while many Properties are reset. When callbacks are ended for reset all, enable alerts again and announce an
    // alert that everything was reset.
    const resetUtterance = new ActivationUtterance({
      alert: SceneryPhetStrings.a11y.resetAll.alertStringProperty
    });
    let voicingEnabledOnFire = voicingUtteranceQueue.enabled;
    const ariaEnabledOnFirePerUtteranceQueueMap = new Map(); // Keep track of the enabled of each connected description UtteranceQueue
    this.pushButtonModel.isFiringProperty.lazyLink(isFiring => {
      // Handle voicingUtteranceQueue
      if (isFiring) {
        voicingEnabledOnFire = voicingUtteranceQueue.enabled;
        voicingUtteranceQueue.enabled = false;
        voicingUtteranceQueue.clear();
      } else {
        // restore the enabled state to each utteranceQueue after resetting
        voicingUtteranceQueue.enabled = voicingEnabledOnFire;
        this.voicingSpeakFullResponse();
      }

      // Handle each connected description UtteranceQueue
      this.forEachUtteranceQueue(utteranceQueue => {
        if (isFiring) {
          // mute and clear the utteranceQueue
          ariaEnabledOnFirePerUtteranceQueueMap.set(utteranceQueue, utteranceQueue.enabled);
          utteranceQueue.enabled = false;
          utteranceQueue.clear();
        } else {
          utteranceQueue.enabled = ariaEnabledOnFirePerUtteranceQueueMap.get(utteranceQueue) || utteranceQueue.enabled;
          utteranceQueue.addToBack(resetUtterance);
        }
      });
    });
    const keyboardListener = new KeyboardListener({
      keys: ['alt+r'],
      callback: () => this.pdomClick(),
      global: true,
      // fires on up because the listener will often call interruptSubtreeInput (interrupting this keyboard listener)
      listenerFireTrigger: 'up'
    });
    this.addInputListener(keyboardListener);
    this.disposeResetAllButton = () => {
      this.removeInputListener(keyboardListener);
      ariaEnabledOnFirePerUtteranceQueueMap.clear();
    };
  }
  dispose() {
    this.disposeResetAllButton();
    super.dispose();
  }
}
sceneryPhet.register('ResetAllButton', ResetAllButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLZXlib2FyZExpc3RlbmVyIiwidm9pY2luZ1V0dGVyYW5jZVF1ZXVlIiwicmVzZXRBbGxTb3VuZFBsYXllciIsIm9wdGlvbml6ZSIsIlRhbmRlbSIsIkFjdGl2YXRpb25VdHRlcmFuY2UiLCJQaGV0Q29sb3JTY2hlbWUiLCJzY2VuZXJ5UGhldCIsIlNjZW5lcnlQaGV0Q29uc3RhbnRzIiwiU2NlbmVyeVBoZXRTdHJpbmdzIiwiUmVzZXRCdXR0b24iLCJNQVJHSU5fQ09FRkZJQ0lFTlQiLCJERUZBVUxUX0JVVFRPTl9SQURJVVMiLCJSZXNldEFsbEJ1dHRvbiIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInJhZGl1cyIsInBoZXRpb1Jlc3RvcmVTY3JlZW5TdGF0ZU9uUmVzZXQiLCJ0b3VjaEFyZWFEaWxhdGlvbiIsImJhc2VDb2xvciIsIlJFU0VUX0FMTF9CVVRUT05fQkFTRV9DT0xPUiIsImFycm93Q29sb3IiLCJsaXN0ZW5lciIsIl8iLCJub29wIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInNvdW5kUGxheWVyIiwiaW5uZXJDb250ZW50IiwiYTExeSIsInJlc2V0QWxsIiwibGFiZWxTdHJpbmdQcm9wZXJ0eSIsInZvaWNpbmdOYW1lUmVzcG9uc2UiLCJ2b2ljaW5nQ29udGV4dFJlc3BvbnNlIiwidm9pY2luZyIsImNvbnRleHRSZXNwb25zZVN0cmluZ1Byb3BlcnR5IiwicGFzc2VkSW5MaXN0ZW5lciIsIlBIRVRfSU9fRU5BQkxFRCIsImlzUGhldGlvSW5zdHJ1bWVudGVkIiwicGhldCIsInBoZXRpbyIsInBoZXRpb0VuZ2luZSIsInBoZXRpb1N0YXRlRW5naW5lIiwicmVzdG9yZVN0YXRlRm9yU2NyZWVuIiwiYXNzZXJ0IiwieE1hcmdpbiIsInVuZGVmaW5lZCIsInlNYXJnaW4iLCJyZXNldFV0dGVyYW5jZSIsImFsZXJ0IiwiYWxlcnRTdHJpbmdQcm9wZXJ0eSIsInZvaWNpbmdFbmFibGVkT25GaXJlIiwiZW5hYmxlZCIsImFyaWFFbmFibGVkT25GaXJlUGVyVXR0ZXJhbmNlUXVldWVNYXAiLCJNYXAiLCJwdXNoQnV0dG9uTW9kZWwiLCJpc0ZpcmluZ1Byb3BlcnR5IiwibGF6eUxpbmsiLCJpc0ZpcmluZyIsImNsZWFyIiwidm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlIiwiZm9yRWFjaFV0dGVyYW5jZVF1ZXVlIiwidXR0ZXJhbmNlUXVldWUiLCJzZXQiLCJnZXQiLCJhZGRUb0JhY2siLCJrZXlib2FyZExpc3RlbmVyIiwia2V5cyIsImNhbGxiYWNrIiwicGRvbUNsaWNrIiwiZ2xvYmFsIiwibGlzdGVuZXJGaXJlVHJpZ2dlciIsImFkZElucHV0TGlzdGVuZXIiLCJkaXNwb3NlUmVzZXRBbGxCdXR0b24iLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUmVzZXRBbGxCdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmVzZXQgQWxsIGJ1dHRvbiwgdHlwaWNhbGx5IHVzZWQgdG8gcmVzZXQgZXZlcnl0aGluZyAoJ3Jlc2V0IGFsbCcpIG9uIGEgU2NyZWVuLlxyXG4gKiBFeHRlbmRzIFJlc2V0QnV0dG9uLCBhZGRpbmcgdGhpbmdzIHRoYXQgYXJlIHNwZWNpZmljIHRvICdyZXNldCBhbGwnLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgS2V5Ym9hcmRMaXN0ZW5lciwgdm9pY2luZ1V0dGVyYW5jZVF1ZXVlIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgcmVzZXRBbGxTb3VuZFBsYXllciBmcm9tICcuLi8uLi8uLi90YW1iby9qcy9zaGFyZWQtc291bmQtcGxheWVycy9yZXNldEFsbFNvdW5kUGxheWVyLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEFjdGl2YXRpb25VdHRlcmFuY2UgZnJvbSAnLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL0FjdGl2YXRpb25VdHRlcmFuY2UuanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuLi9zY2VuZXJ5UGhldC5qcyc7XHJcbmltcG9ydCBTY2VuZXJ5UGhldENvbnN0YW50cyBmcm9tICcuLi9TY2VuZXJ5UGhldENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBTY2VuZXJ5UGhldFN0cmluZ3MgZnJvbSAnLi4vU2NlbmVyeVBoZXRTdHJpbmdzLmpzJztcclxuaW1wb3J0IFJlc2V0QnV0dG9uLCB7IFJlc2V0QnV0dG9uT3B0aW9ucyB9IGZyb20gJy4vUmVzZXRCdXR0b24uanMnO1xyXG5cclxuY29uc3QgTUFSR0lOX0NPRUZGSUNJRU5UID0gNSAvIFNjZW5lcnlQaGV0Q29uc3RhbnRzLkRFRkFVTFRfQlVUVE9OX1JBRElVUztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgcGhldGlvUmVzdG9yZVNjcmVlblN0YXRlT25SZXNldD86IGJvb2xlYW47XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBSZXNldEFsbEJ1dHRvbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8UmVzZXRCdXR0b25PcHRpb25zLCAneE1hcmdpbicgfCAneU1hcmdpbic+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzZXRBbGxCdXR0b24gZXh0ZW5kcyBSZXNldEJ1dHRvbiB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVJlc2V0QWxsQnV0dG9uOiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IFJlc2V0QWxsQnV0dG9uT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFJlc2V0QWxsQnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIFJlc2V0QnV0dG9uT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gUmVzZXRBbGxCdXR0b25PcHRpb25zXHJcbiAgICAgIHJhZGl1czogU2NlbmVyeVBoZXRDb25zdGFudHMuREVGQVVMVF9CVVRUT05fUkFESVVTLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gb3B0aW9uIHNwZWNpZmljIHRvIFJlc2V0QWxsQnV0dG9uLiBJZiB0cnVlLCB0aGVuIHRoZSByZXNldCBhbGwgYnV0dG9uIHdpbGwgcmVzZXQgYmFjayB0byB0aGVcclxuICAgICAgLy8gcHJldmlvdXMgUGhFVC1pTyBzdGF0ZSwgaWYgYXBwbGljYWJsZS5cclxuICAgICAgcGhldGlvUmVzdG9yZVNjcmVlblN0YXRlT25SZXNldDogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIEZpbmUgdHVuZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Rhc2tzL2lzc3Vlcy85ODUgYW5kIHNob3VsZCBub3QgYmUgb3ZlcnJpZGRlbiBsaWdodGx5XHJcbiAgICAgIHRvdWNoQXJlYURpbGF0aW9uOiA1LjIsXHJcbiAgICAgIGJhc2VDb2xvcjogUGhldENvbG9yU2NoZW1lLlJFU0VUX0FMTF9CVVRUT05fQkFTRV9DT0xPUixcclxuICAgICAgYXJyb3dDb2xvcjogJ3doaXRlJyxcclxuICAgICAgbGlzdGVuZXI6IF8ubm9vcCwgLy8ge2Z1bmN0aW9ufVxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcclxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ1Jlc2V0QWxsQnV0dG9uJyxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSBvcmFuZ2UsIHJvdW5kIGJ1dHRvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlc3RvcmUgdGhlIGluaXRpYWwgc3RhdGUnLFxyXG5cclxuICAgICAgLy8gc291bmQgZ2VuZXJhdGlvblxyXG4gICAgICBzb3VuZFBsYXllcjogcmVzZXRBbGxTb3VuZFBsYXllcixcclxuXHJcbiAgICAgIC8vIHBkb21cclxuICAgICAgaW5uZXJDb250ZW50OiBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5yZXNldEFsbC5sYWJlbFN0cmluZ1Byb3BlcnR5LFxyXG5cclxuICAgICAgLy8gdm9pY2luZ1xyXG4gICAgICB2b2ljaW5nTmFtZVJlc3BvbnNlOiBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5yZXNldEFsbC5sYWJlbFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICB2b2ljaW5nQ29udGV4dFJlc3BvbnNlOiBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS52b2ljaW5nLnJlc2V0QWxsLmNvbnRleHRSZXNwb25zZVN0cmluZ1Byb3BlcnR5XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBXcmFwIHRoZSBsaXN0ZW5lciBmb3IgYWxsIGNhc2VzLCBzaW5jZSBQaEVULWlPIHdvbid0IGJlIGFibGUgdG8gY2FsbCB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgdW50aWwgdGhlIHN1cGVyXHJcbiAgICAvLyBjYWxsIGlzIGNvbXBsZXRlLlxyXG4gICAgY29uc3QgcGFzc2VkSW5MaXN0ZW5lciA9IG9wdGlvbnMubGlzdGVuZXI7XHJcbiAgICBvcHRpb25zLmxpc3RlbmVyID0gKCkgPT4ge1xyXG4gICAgICBwYXNzZWRJbkxpc3RlbmVyICYmIHBhc3NlZEluTGlzdGVuZXIoKTtcclxuXHJcbiAgICAgIC8vIGV2ZXJ5IFJlc2V0QWxsQnV0dG9uIGhhcyB0aGUgb3B0aW9uIHRvIHJlc2V0IHRvIHRoZSBsYXN0IFBoRVQtaU8gc3RhdGUgaWYgZGVzaXJlZC5cclxuICAgICAgaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmIG9wdGlvbnMucGhldGlvUmVzdG9yZVNjcmVlblN0YXRlT25SZXNldCAmJlxyXG5cclxuICAgICAgICAgICAvLyBldmVuIHRob3VnaCB0aGlzIGlzIFRhbmRlbS5SRVFVSVJFRCwgc3RpbGwgYmUgZ3JhY2VmdWwgaWYgbm90IHlldCBpbnN0cnVtZW50ZWRcclxuICAgICAgICAgICB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XHJcbiAgICAgICAgcGhldC5waGV0aW8ucGhldGlvRW5naW5lLnBoZXRpb1N0YXRlRW5naW5lLnJlc3RvcmVTdGF0ZUZvclNjcmVlbiggb3B0aW9ucy50YW5kZW0gKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnhNYXJnaW4gPT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLnlNYXJnaW4gPT09IHVuZGVmaW5lZCwgJ3Jlc2V0QWxsQnV0dG9uIHNldHMgbWFyZ2lucycgKTtcclxuICAgIG9wdGlvbnMueE1hcmdpbiA9IG9wdGlvbnMueU1hcmdpbiA9IG9wdGlvbnMucmFkaXVzICogTUFSR0lOX0NPRUZGSUNJRU5UO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gYTExeSAtIHdoZW4gcmVzZXQgYWxsIGJ1dHRvbiBpcyBmaXJlZCwgZGlzYWJsZSBhbGVydHMgc28gdGhhdCB0aGVyZSBpc24ndCBhbiBleGNlc3NpdmUgc3RyZWFtIG9mIGFsZXJ0c1xyXG4gICAgLy8gd2hpbGUgbWFueSBQcm9wZXJ0aWVzIGFyZSByZXNldC4gV2hlbiBjYWxsYmFja3MgYXJlIGVuZGVkIGZvciByZXNldCBhbGwsIGVuYWJsZSBhbGVydHMgYWdhaW4gYW5kIGFubm91bmNlIGFuXHJcbiAgICAvLyBhbGVydCB0aGF0IGV2ZXJ5dGhpbmcgd2FzIHJlc2V0LlxyXG4gICAgY29uc3QgcmVzZXRVdHRlcmFuY2UgPSBuZXcgQWN0aXZhdGlvblV0dGVyYW5jZSggeyBhbGVydDogU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkucmVzZXRBbGwuYWxlcnRTdHJpbmdQcm9wZXJ0eSB9ICk7XHJcbiAgICBsZXQgdm9pY2luZ0VuYWJsZWRPbkZpcmUgPSB2b2ljaW5nVXR0ZXJhbmNlUXVldWUuZW5hYmxlZDtcclxuICAgIGNvbnN0IGFyaWFFbmFibGVkT25GaXJlUGVyVXR0ZXJhbmNlUXVldWVNYXAgPSBuZXcgTWFwKCk7IC8vIEtlZXAgdHJhY2sgb2YgdGhlIGVuYWJsZWQgb2YgZWFjaCBjb25uZWN0ZWQgZGVzY3JpcHRpb24gVXR0ZXJhbmNlUXVldWVcclxuICAgIHRoaXMucHVzaEJ1dHRvbk1vZGVsLmlzRmlyaW5nUHJvcGVydHkubGF6eUxpbmsoICggaXNGaXJpbmc6IGJvb2xlYW4gKSA9PiB7XHJcblxyXG4gICAgICAvLyBIYW5kbGUgdm9pY2luZ1V0dGVyYW5jZVF1ZXVlXHJcbiAgICAgIGlmICggaXNGaXJpbmcgKSB7XHJcbiAgICAgICAgdm9pY2luZ0VuYWJsZWRPbkZpcmUgPSB2b2ljaW5nVXR0ZXJhbmNlUXVldWUuZW5hYmxlZDtcclxuICAgICAgICB2b2ljaW5nVXR0ZXJhbmNlUXVldWUuZW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIHZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5jbGVhcigpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyByZXN0b3JlIHRoZSBlbmFibGVkIHN0YXRlIHRvIGVhY2ggdXR0ZXJhbmNlUXVldWUgYWZ0ZXIgcmVzZXR0aW5nXHJcbiAgICAgICAgdm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmVuYWJsZWQgPSB2b2ljaW5nRW5hYmxlZE9uRmlyZTtcclxuICAgICAgICB0aGlzLnZvaWNpbmdTcGVha0Z1bGxSZXNwb25zZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBIYW5kbGUgZWFjaCBjb25uZWN0ZWQgZGVzY3JpcHRpb24gVXR0ZXJhbmNlUXVldWVcclxuICAgICAgdGhpcy5mb3JFYWNoVXR0ZXJhbmNlUXVldWUoIHV0dGVyYW5jZVF1ZXVlID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCBpc0ZpcmluZyApIHtcclxuXHJcbiAgICAgICAgICAvLyBtdXRlIGFuZCBjbGVhciB0aGUgdXR0ZXJhbmNlUXVldWVcclxuICAgICAgICAgIGFyaWFFbmFibGVkT25GaXJlUGVyVXR0ZXJhbmNlUXVldWVNYXAuc2V0KCB1dHRlcmFuY2VRdWV1ZSwgdXR0ZXJhbmNlUXVldWUuZW5hYmxlZCApO1xyXG4gICAgICAgICAgdXR0ZXJhbmNlUXVldWUuZW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgdXR0ZXJhbmNlUXVldWUuY2xlYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB1dHRlcmFuY2VRdWV1ZS5lbmFibGVkID0gYXJpYUVuYWJsZWRPbkZpcmVQZXJVdHRlcmFuY2VRdWV1ZU1hcC5nZXQoIHV0dGVyYW5jZVF1ZXVlICkgfHwgdXR0ZXJhbmNlUXVldWUuZW5hYmxlZDtcclxuICAgICAgICAgIHV0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggcmVzZXRVdHRlcmFuY2UgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBrZXlib2FyZExpc3RlbmVyID0gbmV3IEtleWJvYXJkTGlzdGVuZXIoIHtcclxuICAgICAga2V5czogWyAnYWx0K3InIF0sXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBkb21DbGljaygpLFxyXG4gICAgICBnbG9iYWw6IHRydWUsXHJcblxyXG4gICAgICAvLyBmaXJlcyBvbiB1cCBiZWNhdXNlIHRoZSBsaXN0ZW5lciB3aWxsIG9mdGVuIGNhbGwgaW50ZXJydXB0U3VidHJlZUlucHV0IChpbnRlcnJ1cHRpbmcgdGhpcyBrZXlib2FyZCBsaXN0ZW5lcilcclxuICAgICAgbGlzdGVuZXJGaXJlVHJpZ2dlcjogJ3VwJ1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBrZXlib2FyZExpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlUmVzZXRBbGxCdXR0b24gPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMucmVtb3ZlSW5wdXRMaXN0ZW5lcigga2V5Ym9hcmRMaXN0ZW5lciApO1xyXG4gICAgICBhcmlhRW5hYmxlZE9uRmlyZVBlclV0dGVyYW5jZVF1ZXVlTWFwLmNsZWFyKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VSZXNldEFsbEJ1dHRvbigpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdSZXNldEFsbEJ1dHRvbicsIFJlc2V0QWxsQnV0dG9uICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxnQkFBZ0IsRUFBRUMscUJBQXFCLFFBQVEsZ0NBQWdDO0FBRXhGLE9BQU9DLG1CQUFtQixNQUFNLCtEQUErRDtBQUMvRixPQUFPQyxTQUFTLE1BQU0sb0NBQW9DO0FBQzFELE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFDakQsT0FBT0MsbUJBQW1CLE1BQU0sb0RBQW9EO0FBQ3BGLE9BQU9DLGVBQWUsTUFBTSx1QkFBdUI7QUFDbkQsT0FBT0MsV0FBVyxNQUFNLG1CQUFtQjtBQUMzQyxPQUFPQyxvQkFBb0IsTUFBTSw0QkFBNEI7QUFDN0QsT0FBT0Msa0JBQWtCLE1BQU0sMEJBQTBCO0FBQ3pELE9BQU9DLFdBQVcsTUFBOEIsa0JBQWtC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