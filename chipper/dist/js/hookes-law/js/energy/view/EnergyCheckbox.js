// Copyright 2022, University of Colorado Boulder

/**
 * EnergyCheckboxOptions is 'Energy' check box in the control panel on the 'Energy' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import hookesLaw from '../../hookesLaw.js';
import HookesLawStrings from '../../HookesLawStrings.js';
import HookesLawConstants from '../../common/HookesLawConstants.js';
import HookesLawColors from '../../common/HookesLawColors.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import { combineOptions, optionize3 } from '../../../../phet-core/js/optionize.js';
import { HBox, Path, Text } from '../../../../scenery/js/imports.js';
import { Shape } from '../../../../kite/js/imports.js';
export default class EnergyCheckbox extends Checkbox {
  constructor(energyOnForcePlotVisibleProperty, providedOptions) {
    const options = optionize3()({}, HookesLawConstants.CHECKBOX_OPTIONS, providedOptions);
    const text = new Text(HookesLawStrings.energyStringProperty, combineOptions({}, HookesLawConstants.CONTROL_TEXT_OPTIONS, {
      tandem: options.tandem.createTandem('text')
    }));
    const triangle = new Path(new Shape().moveTo(0, 0).lineTo(20, 0).lineTo(20, -10).close(), {
      fill: HookesLawColors.ENERGY
    });
    const content = new HBox({
      children: [text, triangle],
      spacing: 6
    });
    super(energyOnForcePlotVisibleProperty, content, options);
  }
}
hookesLaw.register('EnergyCheckbox', EnergyCheckbox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJob29rZXNMYXciLCJIb29rZXNMYXdTdHJpbmdzIiwiSG9va2VzTGF3Q29uc3RhbnRzIiwiSG9va2VzTGF3Q29sb3JzIiwiQ2hlY2tib3giLCJjb21iaW5lT3B0aW9ucyIsIm9wdGlvbml6ZTMiLCJIQm94IiwiUGF0aCIsIlRleHQiLCJTaGFwZSIsIkVuZXJneUNoZWNrYm94IiwiY29uc3RydWN0b3IiLCJlbmVyZ3lPbkZvcmNlUGxvdFZpc2libGVQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJDSEVDS0JPWF9PUFRJT05TIiwidGV4dCIsImVuZXJneVN0cmluZ1Byb3BlcnR5IiwiQ09OVFJPTF9URVhUX09QVElPTlMiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJ0cmlhbmdsZSIsIm1vdmVUbyIsImxpbmVUbyIsImNsb3NlIiwiZmlsbCIsIkVORVJHWSIsImNvbnRlbnQiLCJjaGlsZHJlbiIsInNwYWNpbmciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVuZXJneUNoZWNrYm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBFbmVyZ3lDaGVja2JveE9wdGlvbnMgaXMgJ0VuZXJneScgY2hlY2sgYm94IGluIHRoZSBjb250cm9sIHBhbmVsIG9uIHRoZSAnRW5lcmd5JyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgaG9va2VzTGF3IGZyb20gJy4uLy4uL2hvb2tlc0xhdy5qcyc7XHJcbmltcG9ydCBIb29rZXNMYXdTdHJpbmdzIGZyb20gJy4uLy4uL0hvb2tlc0xhd1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgSG9va2VzTGF3Q29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9Ib29rZXNMYXdDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgSG9va2VzTGF3Q29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9Ib29rZXNMYXdDb2xvcnMuanMnO1xyXG5pbXBvcnQgQ2hlY2tib3gsIHsgQ2hlY2tib3hPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcclxuaW1wb3J0IHsgY29tYmluZU9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIG9wdGlvbml6ZTMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IHsgSEJveCwgUGF0aCwgVGV4dCwgVGV4dE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgRW5lcmd5Q2hlY2tib3hPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8Q2hlY2tib3hPcHRpb25zLCAndGFuZGVtJyB8ICdlbmFibGVkUHJvcGVydHknPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVuZXJneUNoZWNrYm94IGV4dGVuZHMgQ2hlY2tib3gge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGVuZXJneU9uRm9yY2VQbG90VmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiwgcHJvdmlkZWRPcHRpb25zOiBFbmVyZ3lDaGVja2JveE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTM8RW5lcmd5Q2hlY2tib3hPcHRpb25zLCBTZWxmT3B0aW9ucywgQ2hlY2tib3hPcHRpb25zPigpKFxyXG4gICAgICB7fSwgSG9va2VzTGF3Q29uc3RhbnRzLkNIRUNLQk9YX09QVElPTlMsIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHRleHQgPSBuZXcgVGV4dCggSG9va2VzTGF3U3RyaW5ncy5lbmVyZ3lTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgY29tYmluZU9wdGlvbnM8VGV4dE9wdGlvbnM+KCB7fSwgSG9va2VzTGF3Q29uc3RhbnRzLkNPTlRST0xfVEVYVF9PUFRJT05TLCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0ZXh0JyApXHJcbiAgICAgIH0gKSApO1xyXG5cclxuICAgIGNvbnN0IHRyaWFuZ2xlID0gbmV3IFBhdGgoIG5ldyBTaGFwZSgpLm1vdmVUbyggMCwgMCApLmxpbmVUbyggMjAsIDAgKS5saW5lVG8oIDIwLCAtMTAgKS5jbG9zZSgpLCB7XHJcbiAgICAgIGZpbGw6IEhvb2tlc0xhd0NvbG9ycy5FTkVSR1lcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgdGV4dCwgdHJpYW5nbGUgXSxcclxuICAgICAgc3BhY2luZzogNlxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBlbmVyZ3lPbkZvcmNlUGxvdFZpc2libGVQcm9wZXJ0eSwgY29udGVudCwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuaG9va2VzTGF3LnJlZ2lzdGVyKCAnRW5lcmd5Q2hlY2tib3gnLCBFbmVyZ3lDaGVja2JveCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxTQUFTLE1BQU0sb0JBQW9CO0FBQzFDLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyxrQkFBa0IsTUFBTSxvQ0FBb0M7QUFDbkUsT0FBT0MsZUFBZSxNQUFNLGlDQUFpQztBQUM3RCxPQUFPQyxRQUFRLE1BQTJCLGdDQUFnQztBQUMxRSxTQUFTQyxjQUFjLEVBQW9CQyxVQUFVLFFBQVEsdUNBQXVDO0FBRXBHLFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQXFCLG1DQUFtQztBQUNqRixTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBTXRELGVBQWUsTUFBTUMsY0FBYyxTQUFTUCxRQUFRLENBQUM7RUFFNUNRLFdBQVdBLENBQUVDLGdDQUFtRCxFQUFFQyxlQUFzQyxFQUFHO0lBRWhILE1BQU1DLE9BQU8sR0FBR1QsVUFBVSxDQUFzRCxDQUFDLENBQy9FLENBQUMsQ0FBQyxFQUFFSixrQkFBa0IsQ0FBQ2MsZ0JBQWdCLEVBQUVGLGVBQWdCLENBQUM7SUFFNUQsTUFBTUcsSUFBSSxHQUFHLElBQUlSLElBQUksQ0FBRVIsZ0JBQWdCLENBQUNpQixvQkFBb0IsRUFDMURiLGNBQWMsQ0FBZSxDQUFDLENBQUMsRUFBRUgsa0JBQWtCLENBQUNpQixvQkFBb0IsRUFBRTtNQUN4RUMsTUFBTSxFQUFFTCxPQUFPLENBQUNLLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLE1BQU87SUFDOUMsQ0FBRSxDQUFFLENBQUM7SUFFUCxNQUFNQyxRQUFRLEdBQUcsSUFBSWQsSUFBSSxDQUFFLElBQUlFLEtBQUssQ0FBQyxDQUFDLENBQUNhLE1BQU0sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQUNDLE1BQU0sQ0FBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDLENBQUNBLE1BQU0sQ0FBRSxFQUFFLEVBQUUsQ0FBQyxFQUFHLENBQUMsQ0FBQ0MsS0FBSyxDQUFDLENBQUMsRUFBRTtNQUMvRkMsSUFBSSxFQUFFdkIsZUFBZSxDQUFDd0I7SUFDeEIsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsT0FBTyxHQUFHLElBQUlyQixJQUFJLENBQUU7TUFDeEJzQixRQUFRLEVBQUUsQ0FBRVosSUFBSSxFQUFFSyxRQUFRLENBQUU7TUFDNUJRLE9BQU8sRUFBRTtJQUNYLENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRWpCLGdDQUFnQyxFQUFFZSxPQUFPLEVBQUViLE9BQVEsQ0FBQztFQUM3RDtBQUNGO0FBRUFmLFNBQVMsQ0FBQytCLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRXBCLGNBQWUsQ0FBQyJ9