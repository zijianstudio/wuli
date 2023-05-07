// Copyright 2014-2022, University of Colorado Boulder

/**
 * EFieldControl is the control for turning E-field on/off.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import moleculePolarity from '../../moleculePolarity.js';
import MoleculePolarityStrings from '../../MoleculePolarityStrings.js';
import MPConstants from '../MPConstants.js';

// constants
const SWITCH_LABEL_OPTIONS = combineOptions({}, MPConstants.CONTROL_TEXT_OPTIONS, {
  maxWidth: 80 // i18n, set empirically
});

export default class EFieldControl extends VBox {
  constructor(eFieldEnabledProperty, providedOptions) {
    const options = optionize()({
      // VBoxOptions
      align: 'left',
      spacing: MPConstants.CONTROL_PANEL_Y_SPACING
    }, providedOptions);

    // title
    const titleText = new Text(MoleculePolarityStrings.electricFieldStringProperty, combineOptions({}, MPConstants.CONTROL_PANEL_TITLE_OPTIONS, {
      tandem: options.tandem.createTandem('titleText')
    }));

    // on/off switch
    const onOffSwitch = new ABSwitch(eFieldEnabledProperty, false, new Text(MoleculePolarityStrings.offStringProperty, SWITCH_LABEL_OPTIONS), true, new Text(MoleculePolarityStrings.onStringProperty, SWITCH_LABEL_OPTIONS), {
      spacing: 12,
      toggleSwitchOptions: {
        trackFillLeft: 'rgb( 180, 180, 180 )',
        trackFillRight: 'rgb( 0, 180, 0 )'
      },
      tandem: options.tandem.createTandem('onOffSwitch')
    });
    options.children = [titleText, onOffSwitch];
    super(options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
moleculePolarity.register('EFieldControl', EFieldControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIlRleHQiLCJWQm94IiwiQUJTd2l0Y2giLCJtb2xlY3VsZVBvbGFyaXR5IiwiTW9sZWN1bGVQb2xhcml0eVN0cmluZ3MiLCJNUENvbnN0YW50cyIsIlNXSVRDSF9MQUJFTF9PUFRJT05TIiwiQ09OVFJPTF9URVhUX09QVElPTlMiLCJtYXhXaWR0aCIsIkVGaWVsZENvbnRyb2wiLCJjb25zdHJ1Y3RvciIsImVGaWVsZEVuYWJsZWRQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJhbGlnbiIsInNwYWNpbmciLCJDT05UUk9MX1BBTkVMX1lfU1BBQ0lORyIsInRpdGxlVGV4dCIsImVsZWN0cmljRmllbGRTdHJpbmdQcm9wZXJ0eSIsIkNPTlRST0xfUEFORUxfVElUTEVfT1BUSU9OUyIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsIm9uT2ZmU3dpdGNoIiwib2ZmU3RyaW5nUHJvcGVydHkiLCJvblN0cmluZ1Byb3BlcnR5IiwidG9nZ2xlU3dpdGNoT3B0aW9ucyIsInRyYWNrRmlsbExlZnQiLCJ0cmFja0ZpbGxSaWdodCIsImNoaWxkcmVuIiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRUZpZWxkQ29udHJvbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBFRmllbGRDb250cm9sIGlzIHRoZSBjb250cm9sIGZvciB0dXJuaW5nIEUtZmllbGQgb24vb2ZmLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgeyBUZXh0LCBUZXh0T3B0aW9ucywgVkJveCwgVkJveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQUJTd2l0Y2ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0FCU3dpdGNoLmpzJztcclxuaW1wb3J0IG1vbGVjdWxlUG9sYXJpdHkgZnJvbSAnLi4vLi4vbW9sZWN1bGVQb2xhcml0eS5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZVBvbGFyaXR5U3RyaW5ncyBmcm9tICcuLi8uLi9Nb2xlY3VsZVBvbGFyaXR5U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBNUENvbnN0YW50cyBmcm9tICcuLi9NUENvbnN0YW50cy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgU1dJVENIX0xBQkVMX09QVElPTlMgPSBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oIHt9LCBNUENvbnN0YW50cy5DT05UUk9MX1RFWFRfT1BUSU9OUywge1xyXG4gIG1heFdpZHRoOiA4MCAgLy8gaTE4biwgc2V0IGVtcGlyaWNhbGx5XHJcbn0gKTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBFRmllbGRDb250cm9sT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPFZCb3hPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFRmllbGRDb250cm9sIGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZUZpZWxkRW5hYmxlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiwgcHJvdmlkZWRPcHRpb25zOiBFRmllbGRDb250cm9sT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEVGaWVsZENvbnRyb2xPcHRpb25zLCBTZWxmT3B0aW9ucywgVkJveE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFZCb3hPcHRpb25zXHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIHNwYWNpbmc6IE1QQ29uc3RhbnRzLkNPTlRST0xfUEFORUxfWV9TUEFDSU5HXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyB0aXRsZVxyXG4gICAgY29uc3QgdGl0bGVUZXh0ID0gbmV3IFRleHQoIE1vbGVjdWxlUG9sYXJpdHlTdHJpbmdzLmVsZWN0cmljRmllbGRTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgY29tYmluZU9wdGlvbnM8VGV4dE9wdGlvbnM+KCB7fSwgTVBDb25zdGFudHMuQ09OVFJPTF9QQU5FTF9USVRMRV9PUFRJT05TLCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aXRsZVRleHQnIClcclxuICAgICAgfSApICk7XHJcblxyXG4gICAgLy8gb24vb2ZmIHN3aXRjaFxyXG4gICAgY29uc3Qgb25PZmZTd2l0Y2ggPSBuZXcgQUJTd2l0Y2goIGVGaWVsZEVuYWJsZWRQcm9wZXJ0eSxcclxuICAgICAgZmFsc2UsIG5ldyBUZXh0KCBNb2xlY3VsZVBvbGFyaXR5U3RyaW5ncy5vZmZTdHJpbmdQcm9wZXJ0eSwgU1dJVENIX0xBQkVMX09QVElPTlMgKSxcclxuICAgICAgdHJ1ZSwgbmV3IFRleHQoIE1vbGVjdWxlUG9sYXJpdHlTdHJpbmdzLm9uU3RyaW5nUHJvcGVydHksIFNXSVRDSF9MQUJFTF9PUFRJT05TICksIHtcclxuICAgICAgICBzcGFjaW5nOiAxMixcclxuICAgICAgICB0b2dnbGVTd2l0Y2hPcHRpb25zOiB7XHJcbiAgICAgICAgICB0cmFja0ZpbGxMZWZ0OiAncmdiKCAxODAsIDE4MCwgMTgwICknLFxyXG4gICAgICAgICAgdHJhY2tGaWxsUmlnaHQ6ICdyZ2IoIDAsIDE4MCwgMCApJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdvbk9mZlN3aXRjaCcgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgdGl0bGVUZXh0LCBvbk9mZlN3aXRjaCBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxubW9sZWN1bGVQb2xhcml0eS5yZWdpc3RlciggJ0VGaWVsZENvbnRyb2wnLCBFRmllbGRDb250cm9sICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLFNBQVMsSUFBSUMsY0FBYyxRQUEwQix1Q0FBdUM7QUFFbkcsU0FBU0MsSUFBSSxFQUFlQyxJQUFJLFFBQXFCLG1DQUFtQztBQUN4RixPQUFPQyxRQUFRLE1BQU0sZ0NBQWdDO0FBQ3JELE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyx1QkFBdUIsTUFBTSxrQ0FBa0M7QUFDdEUsT0FBT0MsV0FBVyxNQUFNLG1CQUFtQjs7QUFFM0M7QUFDQSxNQUFNQyxvQkFBb0IsR0FBR1AsY0FBYyxDQUFlLENBQUMsQ0FBQyxFQUFFTSxXQUFXLENBQUNFLG9CQUFvQixFQUFFO0VBQzlGQyxRQUFRLEVBQUUsRUFBRSxDQUFFO0FBQ2hCLENBQUUsQ0FBQzs7QUFNSCxlQUFlLE1BQU1DLGFBQWEsU0FBU1IsSUFBSSxDQUFDO0VBRXZDUyxXQUFXQSxDQUFFQyxxQkFBd0MsRUFBRUMsZUFBcUMsRUFBRztJQUVwRyxNQUFNQyxPQUFPLEdBQUdmLFNBQVMsQ0FBaUQsQ0FBQyxDQUFFO01BRTNFO01BQ0FnQixLQUFLLEVBQUUsTUFBTTtNQUNiQyxPQUFPLEVBQUVWLFdBQVcsQ0FBQ1c7SUFDdkIsQ0FBQyxFQUFFSixlQUFnQixDQUFDOztJQUVwQjtJQUNBLE1BQU1LLFNBQVMsR0FBRyxJQUFJakIsSUFBSSxDQUFFSSx1QkFBdUIsQ0FBQ2MsMkJBQTJCLEVBQzdFbkIsY0FBYyxDQUFlLENBQUMsQ0FBQyxFQUFFTSxXQUFXLENBQUNjLDJCQUEyQixFQUFFO01BQ3hFQyxNQUFNLEVBQUVQLE9BQU8sQ0FBQ08sTUFBTSxDQUFDQyxZQUFZLENBQUUsV0FBWTtJQUNuRCxDQUFFLENBQUUsQ0FBQzs7SUFFUDtJQUNBLE1BQU1DLFdBQVcsR0FBRyxJQUFJcEIsUUFBUSxDQUFFUyxxQkFBcUIsRUFDckQsS0FBSyxFQUFFLElBQUlYLElBQUksQ0FBRUksdUJBQXVCLENBQUNtQixpQkFBaUIsRUFBRWpCLG9CQUFxQixDQUFDLEVBQ2xGLElBQUksRUFBRSxJQUFJTixJQUFJLENBQUVJLHVCQUF1QixDQUFDb0IsZ0JBQWdCLEVBQUVsQixvQkFBcUIsQ0FBQyxFQUFFO01BQ2hGUyxPQUFPLEVBQUUsRUFBRTtNQUNYVSxtQkFBbUIsRUFBRTtRQUNuQkMsYUFBYSxFQUFFLHNCQUFzQjtRQUNyQ0MsY0FBYyxFQUFFO01BQ2xCLENBQUM7TUFDRFAsTUFBTSxFQUFFUCxPQUFPLENBQUNPLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLGFBQWM7SUFDckQsQ0FBRSxDQUFDO0lBRUxSLE9BQU8sQ0FBQ2UsUUFBUSxHQUFHLENBQUVYLFNBQVMsRUFBRUssV0FBVyxDQUFFO0lBRTdDLEtBQUssQ0FBRVQsT0FBUSxDQUFDO0VBQ2xCO0VBRWdCZ0IsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDRCxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUExQixnQkFBZ0IsQ0FBQzRCLFFBQVEsQ0FBRSxlQUFlLEVBQUV0QixhQUFjLENBQUMifQ==