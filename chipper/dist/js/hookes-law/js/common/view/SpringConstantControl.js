// Copyright 2015-2022, University of Colorado Boulder

/**
 * Control for spring constant (k).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import { Text } from '../../../../scenery/js/imports.js';
import SunConstants from '../../../../sun/js/SunConstants.js';
import hookesLaw from '../../hookesLaw.js';
import HookesLawStrings from '../../HookesLawStrings.js';
import HookesLawColors from '../HookesLawColors.js';
import HookesLawConstants from '../HookesLawConstants.js';
export default class SpringConstantControl extends NumberControl {
  constructor(springConstantProperty, springConstantRange, provideOptions) {
    // major ticks
    const majorTicks = [];
    for (let i = 0; i < provideOptions.majorTickValues.length; i++) {
      const tickValue = provideOptions.majorTickValues[i];
      assert && assert(Number.isInteger(tickValue), `not an integer tick: ${tickValue}`);
      majorTicks.push({
        value: tickValue,
        label: new Text(tickValue, HookesLawConstants.MAJOR_TICK_LABEL_OPTIONS)
      });
    }
    const valuePatternProperty = new DerivedProperty([HookesLawStrings.pattern['0value']['1unitsStringProperty'], HookesLawStrings.newtonsPerMeterStringProperty], (pattern, newtonsPerMeterString) => StringUtils.format(pattern, SunConstants.VALUE_NUMBERED_PLACEHOLDER, newtonsPerMeterString));
    const options = optionize()({
      // SelfOptions
      titleStringProperty: HookesLawStrings.springConstantStringProperty,
      // NumberControlOptions
      delta: HookesLawConstants.SPRING_CONSTANT_TWEAKER_INTERVAL,
      startCallback: () => {
        phet.log && phet.log('>>>>> SpringConstantControl start interaction');
      },
      endCallback: () => {
        phet.log && phet.log('>>>>> SpringConstantControl end interaction');
      },
      titleNodeOptions: {
        maxWidth: 200,
        // i18n, determined empirically
        font: HookesLawConstants.CONTROL_PANEL_TITLE_FONT
      },
      numberDisplayOptions: {
        maxWidth: 100,
        // i18n, determined empirically
        textOptions: {
          font: HookesLawConstants.CONTROL_PANEL_VALUE_FONT
        },
        decimalPlaces: HookesLawConstants.SPRING_CONSTANT_DECIMAL_PLACES,
        valuePattern: valuePatternProperty
      },
      arrowButtonOptions: HookesLawConstants.ARROW_BUTTON_OPTIONS,
      sliderOptions: {
        majorTicks: majorTicks,
        minorTickSpacing: provideOptions.minorTickSpacing,
        thumbFill: HookesLawColors.SINGLE_SPRING,
        constrainValue: value => {
          return Utils.roundToInterval(value, HookesLawConstants.SPRING_CONSTANT_THUMB_INTERVAL);
        }
      }
    }, provideOptions);
    super(options.titleStringProperty, springConstantProperty, springConstantRange, options);
  }
}
hookesLaw.register('SpringConstantControl', SpringConstantControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJVdGlscyIsIm9wdGlvbml6ZSIsIlN0cmluZ1V0aWxzIiwiTnVtYmVyQ29udHJvbCIsIlRleHQiLCJTdW5Db25zdGFudHMiLCJob29rZXNMYXciLCJIb29rZXNMYXdTdHJpbmdzIiwiSG9va2VzTGF3Q29sb3JzIiwiSG9va2VzTGF3Q29uc3RhbnRzIiwiU3ByaW5nQ29uc3RhbnRDb250cm9sIiwiY29uc3RydWN0b3IiLCJzcHJpbmdDb25zdGFudFByb3BlcnR5Iiwic3ByaW5nQ29uc3RhbnRSYW5nZSIsInByb3ZpZGVPcHRpb25zIiwibWFqb3JUaWNrcyIsImkiLCJtYWpvclRpY2tWYWx1ZXMiLCJsZW5ndGgiLCJ0aWNrVmFsdWUiLCJhc3NlcnQiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJwdXNoIiwidmFsdWUiLCJsYWJlbCIsIk1BSk9SX1RJQ0tfTEFCRUxfT1BUSU9OUyIsInZhbHVlUGF0dGVyblByb3BlcnR5IiwicGF0dGVybiIsIm5ld3RvbnNQZXJNZXRlclN0cmluZ1Byb3BlcnR5IiwibmV3dG9uc1Blck1ldGVyU3RyaW5nIiwiZm9ybWF0IiwiVkFMVUVfTlVNQkVSRURfUExBQ0VIT0xERVIiLCJvcHRpb25zIiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInNwcmluZ0NvbnN0YW50U3RyaW5nUHJvcGVydHkiLCJkZWx0YSIsIlNQUklOR19DT05TVEFOVF9UV0VBS0VSX0lOVEVSVkFMIiwic3RhcnRDYWxsYmFjayIsInBoZXQiLCJsb2ciLCJlbmRDYWxsYmFjayIsInRpdGxlTm9kZU9wdGlvbnMiLCJtYXhXaWR0aCIsImZvbnQiLCJDT05UUk9MX1BBTkVMX1RJVExFX0ZPTlQiLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsInRleHRPcHRpb25zIiwiQ09OVFJPTF9QQU5FTF9WQUxVRV9GT05UIiwiZGVjaW1hbFBsYWNlcyIsIlNQUklOR19DT05TVEFOVF9ERUNJTUFMX1BMQUNFUyIsInZhbHVlUGF0dGVybiIsImFycm93QnV0dG9uT3B0aW9ucyIsIkFSUk9XX0JVVFRPTl9PUFRJT05TIiwic2xpZGVyT3B0aW9ucyIsIm1pbm9yVGlja1NwYWNpbmciLCJ0aHVtYkZpbGwiLCJTSU5HTEVfU1BSSU5HIiwiY29uc3RyYWluVmFsdWUiLCJyb3VuZFRvSW50ZXJ2YWwiLCJTUFJJTkdfQ09OU1RBTlRfVEhVTUJfSU5URVJWQUwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNwcmluZ0NvbnN0YW50Q29udHJvbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250cm9sIGZvciBzcHJpbmcgY29uc3RhbnQgKGspLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IE51bWJlckNvbnRyb2wsIHsgTnVtYmVyQ29udHJvbE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTnVtYmVyQ29udHJvbC5qcyc7XHJcbmltcG9ydCB7IFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgU3VuQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9TdW5Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgaG9va2VzTGF3IGZyb20gJy4uLy4uL2hvb2tlc0xhdy5qcyc7XHJcbmltcG9ydCBIb29rZXNMYXdTdHJpbmdzIGZyb20gJy4uLy4uL0hvb2tlc0xhd1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgSG9va2VzTGF3Q29sb3JzIGZyb20gJy4uL0hvb2tlc0xhd0NvbG9ycy5qcyc7XHJcbmltcG9ydCBIb29rZXNMYXdDb25zdGFudHMgZnJvbSAnLi4vSG9va2VzTGF3Q29uc3RhbnRzLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgdGl0bGVTdHJpbmdQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz47XHJcbiAgbWFqb3JUaWNrVmFsdWVzOiBudW1iZXJbXTtcclxuICBtaW5vclRpY2tTcGFjaW5nOiBudW1iZXI7XHJcbn07XHJcblxyXG50eXBlIFNwcmluZ0NvbnN0YW50Q29udHJvbE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmXHJcbiAgUGlja09wdGlvbmFsPE51bWJlckNvbnRyb2xPcHRpb25zLCAnc2xpZGVyT3B0aW9ucyc+ICZcclxuICBQaWNrUmVxdWlyZWQ8TnVtYmVyQ29udHJvbE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwcmluZ0NvbnN0YW50Q29udHJvbCBleHRlbmRzIE51bWJlckNvbnRyb2wge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNwcmluZ0NvbnN0YW50UHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBzcHJpbmdDb25zdGFudFJhbmdlOiBSYW5nZSxcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVPcHRpb25zOiBTcHJpbmdDb25zdGFudENvbnRyb2xPcHRpb25zICkge1xyXG5cclxuICAgIC8vIG1ham9yIHRpY2tzXHJcbiAgICBjb25zdCBtYWpvclRpY2tzID0gW107XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwcm92aWRlT3B0aW9ucy5tYWpvclRpY2tWYWx1ZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHRpY2tWYWx1ZSA9IHByb3ZpZGVPcHRpb25zLm1ham9yVGlja1ZhbHVlc1sgaSBdO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCB0aWNrVmFsdWUgKSwgYG5vdCBhbiBpbnRlZ2VyIHRpY2s6ICR7dGlja1ZhbHVlfWAgKTtcclxuICAgICAgbWFqb3JUaWNrcy5wdXNoKCB7XHJcbiAgICAgICAgdmFsdWU6IHRpY2tWYWx1ZSxcclxuICAgICAgICBsYWJlbDogbmV3IFRleHQoIHRpY2tWYWx1ZSwgSG9va2VzTGF3Q29uc3RhbnRzLk1BSk9SX1RJQ0tfTEFCRUxfT1BUSU9OUyApXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2YWx1ZVBhdHRlcm5Qcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgSG9va2VzTGF3U3RyaW5ncy5wYXR0ZXJuWyAnMHZhbHVlJyBdWyAnMXVuaXRzU3RyaW5nUHJvcGVydHknIF0sIEhvb2tlc0xhd1N0cmluZ3MubmV3dG9uc1Blck1ldGVyU3RyaW5nUHJvcGVydHkgXSxcclxuICAgICAgKCBwYXR0ZXJuLCBuZXd0b25zUGVyTWV0ZXJTdHJpbmcgKSA9PiBTdHJpbmdVdGlscy5mb3JtYXQoIHBhdHRlcm4sIFN1bkNvbnN0YW50cy5WQUxVRV9OVU1CRVJFRF9QTEFDRUhPTERFUiwgbmV3dG9uc1Blck1ldGVyU3RyaW5nIClcclxuICAgICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTcHJpbmdDb25zdGFudENvbnRyb2xPcHRpb25zLCBTZWxmT3B0aW9ucywgTnVtYmVyQ29udHJvbE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIHRpdGxlU3RyaW5nUHJvcGVydHk6IEhvb2tlc0xhd1N0cmluZ3Muc3ByaW5nQ29uc3RhbnRTdHJpbmdQcm9wZXJ0eSxcclxuXHJcbiAgICAgIC8vIE51bWJlckNvbnRyb2xPcHRpb25zXHJcbiAgICAgIGRlbHRhOiBIb29rZXNMYXdDb25zdGFudHMuU1BSSU5HX0NPTlNUQU5UX1RXRUFLRVJfSU5URVJWQUwsXHJcbiAgICAgIHN0YXJ0Q2FsbGJhY2s6ICgpID0+IHtcclxuICAgICAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggJz4+Pj4+IFNwcmluZ0NvbnN0YW50Q29udHJvbCBzdGFydCBpbnRlcmFjdGlvbicgKTtcclxuICAgICAgfSxcclxuICAgICAgZW5kQ2FsbGJhY2s6ICgpID0+IHtcclxuICAgICAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggJz4+Pj4+IFNwcmluZ0NvbnN0YW50Q29udHJvbCBlbmQgaW50ZXJhY3Rpb24nICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IHtcclxuICAgICAgICBtYXhXaWR0aDogMjAwLCAvLyBpMThuLCBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgICAgZm9udDogSG9va2VzTGF3Q29uc3RhbnRzLkNPTlRST0xfUEFORUxfVElUTEVfRk9OVFxyXG4gICAgICB9LFxyXG4gICAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xyXG4gICAgICAgIG1heFdpZHRoOiAxMDAsIC8vIGkxOG4sIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgICAgICB0ZXh0T3B0aW9uczoge1xyXG4gICAgICAgICAgZm9udDogSG9va2VzTGF3Q29uc3RhbnRzLkNPTlRST0xfUEFORUxfVkFMVUVfRk9OVFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVjaW1hbFBsYWNlczogSG9va2VzTGF3Q29uc3RhbnRzLlNQUklOR19DT05TVEFOVF9ERUNJTUFMX1BMQUNFUyxcclxuICAgICAgICB2YWx1ZVBhdHRlcm46IHZhbHVlUGF0dGVyblByb3BlcnR5XHJcbiAgICAgIH0sXHJcbiAgICAgIGFycm93QnV0dG9uT3B0aW9uczogSG9va2VzTGF3Q29uc3RhbnRzLkFSUk9XX0JVVFRPTl9PUFRJT05TLFxyXG4gICAgICBzbGlkZXJPcHRpb25zOiB7XHJcbiAgICAgICAgbWFqb3JUaWNrczogbWFqb3JUaWNrcyxcclxuICAgICAgICBtaW5vclRpY2tTcGFjaW5nOiBwcm92aWRlT3B0aW9ucy5taW5vclRpY2tTcGFjaW5nLFxyXG4gICAgICAgIHRodW1iRmlsbDogSG9va2VzTGF3Q29sb3JzLlNJTkdMRV9TUFJJTkcsXHJcbiAgICAgICAgY29uc3RyYWluVmFsdWU6IHZhbHVlID0+IHtcclxuICAgICAgICAgIHJldHVybiBVdGlscy5yb3VuZFRvSW50ZXJ2YWwoIHZhbHVlLCBIb29rZXNMYXdDb25zdGFudHMuU1BSSU5HX0NPTlNUQU5UX1RIVU1CX0lOVEVSVkFMICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LCBwcm92aWRlT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zLnRpdGxlU3RyaW5nUHJvcGVydHksIHNwcmluZ0NvbnN0YW50UHJvcGVydHksIHNwcmluZ0NvbnN0YW50UmFuZ2UsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmhvb2tlc0xhdy5yZWdpc3RlciggJ1NwcmluZ0Nv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