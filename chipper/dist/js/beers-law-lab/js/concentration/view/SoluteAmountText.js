// Copyright 2016-2022, University of Colorado Boulder

/**
 * SoluteGramsNode displays the amount of solute, in grams. See https://github.com/phetsims/beers-law-lab/issues/148
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import beersLawLab from '../../beersLawLab.js';
import BeersLawLabStrings from '../../BeersLawLabStrings.js';
import BLLPreferences from '../../common/model/BLLPreferences.js';

// constants
const DECIMAL_PLACES = 0;
export default class SoluteAmountText extends Text {
  constructor(soluteGramsProperty, providedOptions) {
    const options = optionize()({
      font: new PhetFont(22),
      maxWidth: 200,
      visibleProperty: BLLPreferences.showSoluteAmountProperty
    }, providedOptions);
    const stringProperty = new DerivedProperty([BeersLawLabStrings.pattern['0soluteAmountStringProperty'], soluteGramsProperty], (pattern, soluteGrams) => StringUtils.format(pattern, Utils.toFixed(soluteGrams, DECIMAL_PLACES)), {
      tandem: options.tandem.createTandem(Text.STRING_PROPERTY_TANDEM_NAME),
      phetioValueType: StringIO
    });
    super(stringProperty, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
beersLawLab.register('SoluteAmountText', SoluteAmountText);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJVdGlscyIsIm9wdGlvbml6ZSIsIlN0cmluZ1V0aWxzIiwiUGhldEZvbnQiLCJUZXh0IiwiU3RyaW5nSU8iLCJiZWVyc0xhd0xhYiIsIkJlZXJzTGF3TGFiU3RyaW5ncyIsIkJMTFByZWZlcmVuY2VzIiwiREVDSU1BTF9QTEFDRVMiLCJTb2x1dGVBbW91bnRUZXh0IiwiY29uc3RydWN0b3IiLCJzb2x1dGVHcmFtc1Byb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImZvbnQiLCJtYXhXaWR0aCIsInZpc2libGVQcm9wZXJ0eSIsInNob3dTb2x1dGVBbW91bnRQcm9wZXJ0eSIsInN0cmluZ1Byb3BlcnR5IiwicGF0dGVybiIsInNvbHV0ZUdyYW1zIiwiZm9ybWF0IiwidG9GaXhlZCIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsIlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSIsInBoZXRpb1ZhbHVlVHlwZSIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNvbHV0ZUFtb3VudFRleHQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU29sdXRlR3JhbXNOb2RlIGRpc3BsYXlzIHRoZSBhbW91bnQgb2Ygc29sdXRlLCBpbiBncmFtcy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iZWVycy1sYXctbGFiL2lzc3Vlcy8xNDhcclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgVGV4dCwgVGV4dE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgU3RyaW5nSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0cmluZ0lPLmpzJztcclxuaW1wb3J0IGJlZXJzTGF3TGFiIGZyb20gJy4uLy4uL2JlZXJzTGF3TGFiLmpzJztcclxuaW1wb3J0IEJlZXJzTGF3TGFiU3RyaW5ncyBmcm9tICcuLi8uLi9CZWVyc0xhd0xhYlN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQkxMUHJlZmVyZW5jZXMgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0JMTFByZWZlcmVuY2VzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBERUNJTUFMX1BMQUNFUyA9IDA7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgU29sdXRlR3JhbXNOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPFRleHRPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb2x1dGVBbW91bnRUZXh0IGV4dGVuZHMgVGV4dCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc29sdXRlR3JhbXNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPiwgcHJvdmlkZWRPcHRpb25zOiBTb2x1dGVHcmFtc05vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U29sdXRlR3JhbXNOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIFRleHRPcHRpb25zPigpKCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMjIgKSxcclxuICAgICAgbWF4V2lkdGg6IDIwMCxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBCTExQcmVmZXJlbmNlcy5zaG93U29sdXRlQW1vdW50UHJvcGVydHlcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyBCZWVyc0xhd0xhYlN0cmluZ3MucGF0dGVyblsgJzBzb2x1dGVBbW91bnRTdHJpbmdQcm9wZXJ0eScgXSwgc29sdXRlR3JhbXNQcm9wZXJ0eSBdLFxyXG4gICAgICAoIHBhdHRlcm4sIHNvbHV0ZUdyYW1zICkgPT4gU3RyaW5nVXRpbHMuZm9ybWF0KCBwYXR0ZXJuLCBVdGlscy50b0ZpeGVkKCBzb2x1dGVHcmFtcywgREVDSU1BTF9QTEFDRVMgKSApLCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oIFRleHQuU1RSSU5HX1BST1BFUlRZX1RBTkRFTV9OQU1FICksXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBTdHJpbmdJT1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIHN0cmluZ1Byb3BlcnR5LCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuYmVlcnNMYXdMYWIucmVnaXN0ZXIoICdTb2x1dGVBbW91bnRUZXh0JywgU29sdXRlQW1vdW50VGV4dCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBRXBFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsU0FBUyxNQUE0Qix1Q0FBdUM7QUFFbkYsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksUUFBcUIsbUNBQW1DO0FBQ3JFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MsY0FBYyxNQUFNLHNDQUFzQzs7QUFFakU7QUFDQSxNQUFNQyxjQUFjLEdBQUcsQ0FBQztBQU14QixlQUFlLE1BQU1DLGdCQUFnQixTQUFTTixJQUFJLENBQUM7RUFFMUNPLFdBQVdBLENBQUVDLG1CQUE4QyxFQUFFQyxlQUF1QyxFQUFHO0lBRTVHLE1BQU1DLE9BQU8sR0FBR2IsU0FBUyxDQUFtRCxDQUFDLENBQUU7TUFDN0VjLElBQUksRUFBRSxJQUFJWixRQUFRLENBQUUsRUFBRyxDQUFDO01BQ3hCYSxRQUFRLEVBQUUsR0FBRztNQUNiQyxlQUFlLEVBQUVULGNBQWMsQ0FBQ1U7SUFDbEMsQ0FBQyxFQUFFTCxlQUFnQixDQUFDO0lBRXBCLE1BQU1NLGNBQWMsR0FBRyxJQUFJcEIsZUFBZSxDQUN4QyxDQUFFUSxrQkFBa0IsQ0FBQ2EsT0FBTyxDQUFFLDZCQUE2QixDQUFFLEVBQUVSLG1CQUFtQixDQUFFLEVBQ3BGLENBQUVRLE9BQU8sRUFBRUMsV0FBVyxLQUFNbkIsV0FBVyxDQUFDb0IsTUFBTSxDQUFFRixPQUFPLEVBQUVwQixLQUFLLENBQUN1QixPQUFPLENBQUVGLFdBQVcsRUFBRVosY0FBZSxDQUFFLENBQUMsRUFBRTtNQUN2R2UsTUFBTSxFQUFFVixPQUFPLENBQUNVLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFckIsSUFBSSxDQUFDc0IsMkJBQTRCLENBQUM7TUFDdkVDLGVBQWUsRUFBRXRCO0lBQ25CLENBQUUsQ0FBQztJQUVMLEtBQUssQ0FBRWMsY0FBYyxFQUFFTCxPQUFRLENBQUM7RUFDbEM7RUFFZ0JjLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBdEIsV0FBVyxDQUFDd0IsUUFBUSxDQUFFLGtCQUFrQixFQUFFcEIsZ0JBQWlCLENBQUMifQ==