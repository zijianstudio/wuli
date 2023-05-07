// Copyright 2023, University of Colorado Boulder

/**
 * SpeechSynthesisControl is the control for speech synthesis. It groups SpeechSynthesisButton and
 * NoVoiceWarningButton, which should always appear together.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { VBox } from '../../../../scenery/js/imports.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import SpeechSynthesisButton from './SpeechSynthesisButton.js';
import NoVoiceWarningButton from './NoVoiceWarningButton.js';
import optionize from '../../../../phet-core/js/optionize.js';
export default class SpeechSynthesisControl extends VBox {
  constructor(speechSynthesisAnnouncer, utteranceQueue, providedOptions) {
    const options = optionize()({
      speechSynthesisButtonOptions: {},
      // VBoxOptions
      align: 'center',
      spacing: 12
    }, providedOptions);
    const speechSynthesisButton = new SpeechSynthesisButton(speechSynthesisAnnouncer, utteranceQueue, options.speechSynthesisButtonOptions);
    const noVoiceWarningButton = new NoVoiceWarningButton(speechSynthesisAnnouncer.hasVoiceProperty);
    options.children = [speechSynthesisButton, noVoiceWarningButton];
    super(options);
  }
}
numberSuiteCommon.register('SpeechSynthesisControl', SpeechSynthesisControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWQm94IiwibnVtYmVyU3VpdGVDb21tb24iLCJTcGVlY2hTeW50aGVzaXNCdXR0b24iLCJOb1ZvaWNlV2FybmluZ0J1dHRvbiIsIm9wdGlvbml6ZSIsIlNwZWVjaFN5bnRoZXNpc0NvbnRyb2wiLCJjb25zdHJ1Y3RvciIsInNwZWVjaFN5bnRoZXNpc0Fubm91bmNlciIsInV0dGVyYW5jZVF1ZXVlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInNwZWVjaFN5bnRoZXNpc0J1dHRvbk9wdGlvbnMiLCJhbGlnbiIsInNwYWNpbmciLCJzcGVlY2hTeW50aGVzaXNCdXR0b24iLCJub1ZvaWNlV2FybmluZ0J1dHRvbiIsImhhc1ZvaWNlUHJvcGVydHkiLCJjaGlsZHJlbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3BlZWNoU3ludGhlc2lzQ29udHJvbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU3BlZWNoU3ludGhlc2lzQ29udHJvbCBpcyB0aGUgY29udHJvbCBmb3Igc3BlZWNoIHN5bnRoZXNpcy4gSXQgZ3JvdXBzIFNwZWVjaFN5bnRoZXNpc0J1dHRvbiBhbmRcclxuICogTm9Wb2ljZVdhcm5pbmdCdXR0b24sIHdoaWNoIHNob3VsZCBhbHdheXMgYXBwZWFyIHRvZ2V0aGVyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucywgVkJveCwgVkJveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbnVtYmVyU3VpdGVDb21tb24gZnJvbSAnLi4vLi4vbnVtYmVyU3VpdGVDb21tb24uanMnO1xyXG5pbXBvcnQgU3BlZWNoU3ludGhlc2lzQnV0dG9uLCB7IFNwZWVjaFN5bnRoZXNpc0J1dHRvbk9wdGlvbnMgfSBmcm9tICcuL1NwZWVjaFN5bnRoZXNpc0J1dHRvbi5qcyc7XHJcbmltcG9ydCBOb1ZvaWNlV2FybmluZ0J1dHRvbiBmcm9tICcuL05vVm9pY2VXYXJuaW5nQnV0dG9uLmpzJztcclxuaW1wb3J0IE51bWJlclN1aXRlQ29tbW9uU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyIGZyb20gJy4vTnVtYmVyU3VpdGVDb21tb25TcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgTnVtYmVyU3VpdGVDb21tb25VdHRlcmFuY2VRdWV1ZSBmcm9tICcuL051bWJlclN1aXRlQ29tbW9uVXR0ZXJhbmNlUXVldWUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gb3B0aW9ucyBwcm9wYWdhdGVkIHRvIChhbmQgcmVxdWlyZWQgYnkpIFNwZWVjaFN5bnRoZXNpc0J1dHRvblxyXG4gIHNwZWVjaFN5bnRoZXNpc0J1dHRvbk9wdGlvbnM/OiBTcGVlY2hTeW50aGVzaXNCdXR0b25PcHRpb25zO1xyXG59O1xyXG5cclxudHlwZSBTcGVlY2hTeW50aGVzaXNDb250cm9sT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwZWVjaFN5bnRoZXNpc0NvbnRyb2wgZXh0ZW5kcyBWQm94IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzcGVlY2hTeW50aGVzaXNBbm5vdW5jZXI6IE51bWJlclN1aXRlQ29tbW9uU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgdXR0ZXJhbmNlUXVldWU6IE51bWJlclN1aXRlQ29tbW9uVXR0ZXJhbmNlUXVldWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IFNwZWVjaFN5bnRoZXNpc0NvbnRyb2xPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U3BlZWNoU3ludGhlc2lzQ29udHJvbE9wdGlvbnMsIFNlbGZPcHRpb25zLCBWQm94T3B0aW9ucz4oKSgge1xyXG4gICAgICBzcGVlY2hTeW50aGVzaXNCdXR0b25PcHRpb25zOiB7fSxcclxuXHJcbiAgICAgIC8vIFZCb3hPcHRpb25zXHJcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgc3BhY2luZzogMTJcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHNwZWVjaFN5bnRoZXNpc0J1dHRvbiA9IG5ldyBTcGVlY2hTeW50aGVzaXNCdXR0b24oXHJcbiAgICAgIHNwZWVjaFN5bnRoZXNpc0Fubm91bmNlcixcclxuICAgICAgdXR0ZXJhbmNlUXVldWUsXHJcbiAgICAgIG9wdGlvbnMuc3BlZWNoU3ludGhlc2lzQnV0dG9uT3B0aW9uc1xyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBub1ZvaWNlV2FybmluZ0J1dHRvbiA9IG5ldyBOb1ZvaWNlV2FybmluZ0J1dHRvbiggc3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyLmhhc1ZvaWNlUHJvcGVydHkgKTtcclxuXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBzcGVlY2hTeW50aGVzaXNCdXR0b24sIG5vVm9pY2VXYXJuaW5nQnV0dG9uIF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbm51bWJlclN1aXRlQ29tbW9uLnJlZ2lzdGVyKCAnU3BlZWNoU3ludGhlc2lzQ29udHJvbCcsIFNwZWVjaFN5bnRoZXNpc0NvbnRyb2wgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQWlDQSxJQUFJLFFBQXFCLG1DQUFtQztBQUM3RixPQUFPQyxpQkFBaUIsTUFBTSw0QkFBNEI7QUFDMUQsT0FBT0MscUJBQXFCLE1BQXdDLDRCQUE0QjtBQUNoRyxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFFNUQsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQVc3RCxlQUFlLE1BQU1DLHNCQUFzQixTQUFTTCxJQUFJLENBQUM7RUFFaERNLFdBQVdBLENBQUVDLHdCQUFtRSxFQUNuRUMsY0FBK0MsRUFDL0NDLGVBQThDLEVBQUc7SUFFbkUsTUFBTUMsT0FBTyxHQUFHTixTQUFTLENBQTBELENBQUMsQ0FBRTtNQUNwRk8sNEJBQTRCLEVBQUUsQ0FBQyxDQUFDO01BRWhDO01BQ0FDLEtBQUssRUFBRSxRQUFRO01BQ2ZDLE9BQU8sRUFBRTtJQUNYLENBQUMsRUFBRUosZUFBZ0IsQ0FBQztJQUVwQixNQUFNSyxxQkFBcUIsR0FBRyxJQUFJWixxQkFBcUIsQ0FDckRLLHdCQUF3QixFQUN4QkMsY0FBYyxFQUNkRSxPQUFPLENBQUNDLDRCQUNWLENBQUM7SUFFRCxNQUFNSSxvQkFBb0IsR0FBRyxJQUFJWixvQkFBb0IsQ0FBRUksd0JBQXdCLENBQUNTLGdCQUFpQixDQUFDO0lBRWxHTixPQUFPLENBQUNPLFFBQVEsR0FBRyxDQUFFSCxxQkFBcUIsRUFBRUMsb0JBQW9CLENBQUU7SUFFbEUsS0FBSyxDQUFFTCxPQUFRLENBQUM7RUFDbEI7QUFDRjtBQUVBVCxpQkFBaUIsQ0FBQ2lCLFFBQVEsQ0FBRSx3QkFBd0IsRUFBRWIsc0JBQXVCLENBQUMifQ==