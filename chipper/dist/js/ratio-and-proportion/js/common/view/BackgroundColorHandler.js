// Copyright 2021-2022, University of Colorado Boulder

/**
 * Class responsible for changing the background color based on fitness. It also contains the associated description
 * logic for describing the color.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';
import rapConstants from '../rapConstants.js';
import RAPColors from './RAPColors.js';
import { Color } from '../../../../scenery/js/imports.js';
import Utils from '../../../../dot/js/Utils.js';
import Multilink from '../../../../axon/js/Multilink.js';

// constants
const BACKGROUND_COLOR_STRINGS = [RatioAndProportionStrings.a11y.backgroundColor.notGreenStringProperty, RatioAndProportionStrings.a11y.backgroundColor.lightestGreenStringProperty, RatioAndProportionStrings.a11y.backgroundColor.veryLightGreenStringProperty, RatioAndProportionStrings.a11y.backgroundColor.lightGreenStringProperty, RatioAndProportionStrings.a11y.backgroundColor.darkestGreenStringProperty];
class BackgroundColorHandler {
  constructor(model, backgroundColorProperty) {
    // adjust the background color based on the current ratio fitness
    Multilink.multilink([model.ratioFitnessProperty, model.inProportionProperty], (fitness, inProportion) => {
      let color = null;
      if (inProportion) {
        color = RAPColors.backgroundInFitnessProperty.value;
      } else {
        const interpolatedDistance = (fitness - rapConstants.RATIO_FITNESS_RANGE.min) / (1 - model.getInProportionThreshold());
        color = Color.interpolateRGBA(RAPColors.backgroundOutOfFitnessProperty.value, RAPColors.backgroundInterpolationToFitnessProperty.value, Utils.clamp(interpolatedDistance, 0, 1));
      }
      backgroundColorProperty.value = color;
    });
  }
  static getCurrentColorRegion(fitness, inProportion) {
    if (fitness === rapConstants.RATIO_FITNESS_RANGE.min) {
      return BACKGROUND_COLOR_STRINGS[0].value;
    }
    if (inProportion) {
      return BACKGROUND_COLOR_STRINGS[4].value;
    }
    const numberOfRegionsLeft = BACKGROUND_COLOR_STRINGS.length - 2;
    const interpolatedIndex = (rapConstants.RATIO_FITNESS_RANGE.getLength() / numberOfRegionsLeft + fitness) * numberOfRegionsLeft;
    const regionProperty = BACKGROUND_COLOR_STRINGS[Math.floor(interpolatedIndex)];
    assert && assert(regionProperty, 'region expected');
    return regionProperty.value;
  }
}
ratioAndProportion.register('BackgroundColorHandler', BackgroundColorHandler);
export default BackgroundColorHandler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyYXRpb0FuZFByb3BvcnRpb24iLCJSYXRpb0FuZFByb3BvcnRpb25TdHJpbmdzIiwicmFwQ29uc3RhbnRzIiwiUkFQQ29sb3JzIiwiQ29sb3IiLCJVdGlscyIsIk11bHRpbGluayIsIkJBQ0tHUk9VTkRfQ09MT1JfU1RSSU5HUyIsImExMXkiLCJiYWNrZ3JvdW5kQ29sb3IiLCJub3RHcmVlblN0cmluZ1Byb3BlcnR5IiwibGlnaHRlc3RHcmVlblN0cmluZ1Byb3BlcnR5IiwidmVyeUxpZ2h0R3JlZW5TdHJpbmdQcm9wZXJ0eSIsImxpZ2h0R3JlZW5TdHJpbmdQcm9wZXJ0eSIsImRhcmtlc3RHcmVlblN0cmluZ1Byb3BlcnR5IiwiQmFja2dyb3VuZENvbG9ySGFuZGxlciIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsIm11bHRpbGluayIsInJhdGlvRml0bmVzc1Byb3BlcnR5IiwiaW5Qcm9wb3J0aW9uUHJvcGVydHkiLCJmaXRuZXNzIiwiaW5Qcm9wb3J0aW9uIiwiY29sb3IiLCJiYWNrZ3JvdW5kSW5GaXRuZXNzUHJvcGVydHkiLCJ2YWx1ZSIsImludGVycG9sYXRlZERpc3RhbmNlIiwiUkFUSU9fRklUTkVTU19SQU5HRSIsIm1pbiIsImdldEluUHJvcG9ydGlvblRocmVzaG9sZCIsImludGVycG9sYXRlUkdCQSIsImJhY2tncm91bmRPdXRPZkZpdG5lc3NQcm9wZXJ0eSIsImJhY2tncm91bmRJbnRlcnBvbGF0aW9uVG9GaXRuZXNzUHJvcGVydHkiLCJjbGFtcCIsImdldEN1cnJlbnRDb2xvclJlZ2lvbiIsIm51bWJlck9mUmVnaW9uc0xlZnQiLCJsZW5ndGgiLCJpbnRlcnBvbGF0ZWRJbmRleCIsImdldExlbmd0aCIsInJlZ2lvblByb3BlcnR5IiwiTWF0aCIsImZsb29yIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYWNrZ3JvdW5kQ29sb3JIYW5kbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENsYXNzIHJlc3BvbnNpYmxlIGZvciBjaGFuZ2luZyB0aGUgYmFja2dyb3VuZCBjb2xvciBiYXNlZCBvbiBmaXRuZXNzLiBJdCBhbHNvIGNvbnRhaW5zIHRoZSBhc3NvY2lhdGVkIGRlc2NyaXB0aW9uXHJcbiAqIGxvZ2ljIGZvciBkZXNjcmliaW5nIHRoZSBjb2xvci5cclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCByYXRpb0FuZFByb3BvcnRpb24gZnJvbSAnLi4vLi4vcmF0aW9BbmRQcm9wb3J0aW9uLmpzJztcclxuaW1wb3J0IFJhdGlvQW5kUHJvcG9ydGlvblN0cmluZ3MgZnJvbSAnLi4vLi4vUmF0aW9BbmRQcm9wb3J0aW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IHJhcENvbnN0YW50cyBmcm9tICcuLi9yYXBDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgUkFQQ29sb3JzIGZyb20gJy4vUkFQQ29sb3JzLmpzJztcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFJBUE1vZGVsIGZyb20gJy4uL21vZGVsL1JBUE1vZGVsLmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQkFDS0dST1VORF9DT0xPUl9TVFJJTkdTID0gW1xyXG4gIFJhdGlvQW5kUHJvcG9ydGlvblN0cmluZ3MuYTExeS5iYWNrZ3JvdW5kQ29sb3Iubm90R3JlZW5TdHJpbmdQcm9wZXJ0eSxcclxuICBSYXRpb0FuZFByb3BvcnRpb25TdHJpbmdzLmExMXkuYmFja2dyb3VuZENvbG9yLmxpZ2h0ZXN0R3JlZW5TdHJpbmdQcm9wZXJ0eSxcclxuICBSYXRpb0FuZFByb3BvcnRpb25TdHJpbmdzLmExMXkuYmFja2dyb3VuZENvbG9yLnZlcnlMaWdodEdyZWVuU3RyaW5nUHJvcGVydHksXHJcbiAgUmF0aW9BbmRQcm9wb3J0aW9uU3RyaW5ncy5hMTF5LmJhY2tncm91bmRDb2xvci5saWdodEdyZWVuU3RyaW5nUHJvcGVydHksXHJcbiAgUmF0aW9BbmRQcm9wb3J0aW9uU3RyaW5ncy5hMTF5LmJhY2tncm91bmRDb2xvci5kYXJrZXN0R3JlZW5TdHJpbmdQcm9wZXJ0eVxyXG5dO1xyXG5cclxuY2xhc3MgQmFja2dyb3VuZENvbG9ySGFuZGxlciB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IFJBUE1vZGVsLCBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogUHJvcGVydHk8Q29sb3I+ICkge1xyXG5cclxuICAgIC8vIGFkanVzdCB0aGUgYmFja2dyb3VuZCBjb2xvciBiYXNlZCBvbiB0aGUgY3VycmVudCByYXRpbyBmaXRuZXNzXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbXHJcbiAgICAgIG1vZGVsLnJhdGlvRml0bmVzc1Byb3BlcnR5LFxyXG4gICAgICBtb2RlbC5pblByb3BvcnRpb25Qcm9wZXJ0eVxyXG4gICAgXSwgKCBmaXRuZXNzLCBpblByb3BvcnRpb24gKSA9PiB7XHJcbiAgICAgIGxldCBjb2xvciA9IG51bGw7XHJcbiAgICAgIGlmICggaW5Qcm9wb3J0aW9uICkge1xyXG4gICAgICAgIGNvbG9yID0gUkFQQ29sb3JzLmJhY2tncm91bmRJbkZpdG5lc3NQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBjb25zdCBpbnRlcnBvbGF0ZWREaXN0YW5jZSA9ICggZml0bmVzcyAtIHJhcENvbnN0YW50cy5SQVRJT19GSVRORVNTX1JBTkdFLm1pbiApIC8gKCAxIC0gbW9kZWwuZ2V0SW5Qcm9wb3J0aW9uVGhyZXNob2xkKCkgKTtcclxuICAgICAgICBjb2xvciA9IENvbG9yLmludGVycG9sYXRlUkdCQShcclxuICAgICAgICAgIFJBUENvbG9ycy5iYWNrZ3JvdW5kT3V0T2ZGaXRuZXNzUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgICBSQVBDb2xvcnMuYmFja2dyb3VuZEludGVycG9sYXRpb25Ub0ZpdG5lc3NQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICAgIFV0aWxzLmNsYW1wKCBpbnRlcnBvbGF0ZWREaXN0YW5jZSwgMCwgMSApXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHkudmFsdWUgPSBjb2xvcjtcclxuICAgIH0gKTtcclxuXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIGdldEN1cnJlbnRDb2xvclJlZ2lvbiggZml0bmVzczogbnVtYmVyLCBpblByb3BvcnRpb246IGJvb2xlYW4gKTogc3RyaW5nIHtcclxuICAgIGlmICggZml0bmVzcyA9PT0gcmFwQ29uc3RhbnRzLlJBVElPX0ZJVE5FU1NfUkFOR0UubWluICkge1xyXG4gICAgICByZXR1cm4gQkFDS0dST1VORF9DT0xPUl9TVFJJTkdTWyAwIF0udmFsdWU7XHJcbiAgICB9XHJcbiAgICBpZiAoIGluUHJvcG9ydGlvbiApIHtcclxuICAgICAgcmV0dXJuIEJBQ0tHUk9VTkRfQ09MT1JfU1RSSU5HU1sgNCBdLnZhbHVlO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbnVtYmVyT2ZSZWdpb25zTGVmdCA9ICggQkFDS0dST1VORF9DT0xPUl9TVFJJTkdTLmxlbmd0aCAtIDIgKTtcclxuICAgIGNvbnN0IGludGVycG9sYXRlZEluZGV4ID0gKCByYXBDb25zdGFudHMuUkFUSU9fRklUTkVTU19SQU5HRS5nZXRMZW5ndGgoKSAvIG51bWJlck9mUmVnaW9uc0xlZnQgKyBmaXRuZXNzICkgKiBudW1iZXJPZlJlZ2lvbnNMZWZ0O1xyXG4gICAgY29uc3QgcmVnaW9uUHJvcGVydHkgPSBCQUNLR1JPVU5EX0NPTE9SX1NUUklOR1NbIE1hdGguZmxvb3IoIGludGVycG9sYXRlZEluZGV4ICkgXTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlZ2lvblByb3BlcnR5LCAncmVnaW9uIGV4cGVjdGVkJyApO1xyXG4gICAgcmV0dXJuIHJlZ2lvblByb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxufVxyXG5cclxucmF0aW9BbmRQcm9wb3J0aW9uLnJlZ2lzdGVyKCAnQmFja2dyb3VuZENvbG9ySGFuZGxlcicsIEJhY2tncm91bmRDb2xvckhhbmRsZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgQmFja2dyb3VuZENvbG9ySGFuZGxlcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0Esa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLHlCQUF5QixNQUFNLG9DQUFvQztBQUUxRSxPQUFPQyxZQUFZLE1BQU0sb0JBQW9CO0FBQzdDLE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFDdEMsU0FBU0MsS0FBSyxRQUFRLG1DQUFtQztBQUN6RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBRS9DLE9BQU9DLFNBQVMsTUFBTSxrQ0FBa0M7O0FBRXhEO0FBQ0EsTUFBTUMsd0JBQXdCLEdBQUcsQ0FDL0JOLHlCQUF5QixDQUFDTyxJQUFJLENBQUNDLGVBQWUsQ0FBQ0Msc0JBQXNCLEVBQ3JFVCx5QkFBeUIsQ0FBQ08sSUFBSSxDQUFDQyxlQUFlLENBQUNFLDJCQUEyQixFQUMxRVYseUJBQXlCLENBQUNPLElBQUksQ0FBQ0MsZUFBZSxDQUFDRyw0QkFBNEIsRUFDM0VYLHlCQUF5QixDQUFDTyxJQUFJLENBQUNDLGVBQWUsQ0FBQ0ksd0JBQXdCLEVBQ3ZFWix5QkFBeUIsQ0FBQ08sSUFBSSxDQUFDQyxlQUFlLENBQUNLLDBCQUEwQixDQUMxRTtBQUVELE1BQU1DLHNCQUFzQixDQUFDO0VBRXBCQyxXQUFXQSxDQUFFQyxLQUFlLEVBQUVDLHVCQUF3QyxFQUFHO0lBRTlFO0lBQ0FaLFNBQVMsQ0FBQ2EsU0FBUyxDQUFFLENBQ25CRixLQUFLLENBQUNHLG9CQUFvQixFQUMxQkgsS0FBSyxDQUFDSSxvQkFBb0IsQ0FDM0IsRUFBRSxDQUFFQyxPQUFPLEVBQUVDLFlBQVksS0FBTTtNQUM5QixJQUFJQyxLQUFLLEdBQUcsSUFBSTtNQUNoQixJQUFLRCxZQUFZLEVBQUc7UUFDbEJDLEtBQUssR0FBR3JCLFNBQVMsQ0FBQ3NCLDJCQUEyQixDQUFDQyxLQUFLO01BQ3JELENBQUMsTUFDSTtRQUNILE1BQU1DLG9CQUFvQixHQUFHLENBQUVMLE9BQU8sR0FBR3BCLFlBQVksQ0FBQzBCLG1CQUFtQixDQUFDQyxHQUFHLEtBQU8sQ0FBQyxHQUFHWixLQUFLLENBQUNhLHdCQUF3QixDQUFDLENBQUMsQ0FBRTtRQUMxSE4sS0FBSyxHQUFHcEIsS0FBSyxDQUFDMkIsZUFBZSxDQUMzQjVCLFNBQVMsQ0FBQzZCLDhCQUE4QixDQUFDTixLQUFLLEVBQzlDdkIsU0FBUyxDQUFDOEIsd0NBQXdDLENBQUNQLEtBQUssRUFDeERyQixLQUFLLENBQUM2QixLQUFLLENBQUVQLG9CQUFvQixFQUFFLENBQUMsRUFBRSxDQUFFLENBQzFDLENBQUM7TUFDSDtNQUVBVCx1QkFBdUIsQ0FBQ1EsS0FBSyxHQUFHRixLQUFLO0lBQ3ZDLENBQUUsQ0FBQztFQUVMO0VBRUEsT0FBY1cscUJBQXFCQSxDQUFFYixPQUFlLEVBQUVDLFlBQXFCLEVBQVc7SUFDcEYsSUFBS0QsT0FBTyxLQUFLcEIsWUFBWSxDQUFDMEIsbUJBQW1CLENBQUNDLEdBQUcsRUFBRztNQUN0RCxPQUFPdEIsd0JBQXdCLENBQUUsQ0FBQyxDQUFFLENBQUNtQixLQUFLO0lBQzVDO0lBQ0EsSUFBS0gsWUFBWSxFQUFHO01BQ2xCLE9BQU9oQix3QkFBd0IsQ0FBRSxDQUFDLENBQUUsQ0FBQ21CLEtBQUs7SUFDNUM7SUFDQSxNQUFNVSxtQkFBbUIsR0FBSzdCLHdCQUF3QixDQUFDOEIsTUFBTSxHQUFHLENBQUc7SUFDbkUsTUFBTUMsaUJBQWlCLEdBQUcsQ0FBRXBDLFlBQVksQ0FBQzBCLG1CQUFtQixDQUFDVyxTQUFTLENBQUMsQ0FBQyxHQUFHSCxtQkFBbUIsR0FBR2QsT0FBTyxJQUFLYyxtQkFBbUI7SUFDaEksTUFBTUksY0FBYyxHQUFHakMsd0JBQXdCLENBQUVrQyxJQUFJLENBQUNDLEtBQUssQ0FBRUosaUJBQWtCLENBQUMsQ0FBRTtJQUNsRkssTUFBTSxJQUFJQSxNQUFNLENBQUVILGNBQWMsRUFBRSxpQkFBa0IsQ0FBQztJQUNyRCxPQUFPQSxjQUFjLENBQUNkLEtBQUs7RUFDN0I7QUFDRjtBQUVBMUIsa0JBQWtCLENBQUM0QyxRQUFRLENBQUUsd0JBQXdCLEVBQUU3QixzQkFBdUIsQ0FBQztBQUMvRSxlQUFlQSxzQkFBc0IifQ==