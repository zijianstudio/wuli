// Copyright 2019-2022, University of Colorado Boulder

/**
 * Control panel for the WavingGirlScene.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import { HBox } from '../../../../scenery/js/imports.js';
import WaveInterferencePanel from '../../common/view/WaveInterferencePanel.js';
import WaveInterferenceText from '../../common/view/WaveInterferenceText.js';
import WaveInterferenceConstants from '../../common/WaveInterferenceConstants.js';
import waveInterference from '../../waveInterference.js';
import WaveInterferenceStrings from '../../WaveInterferenceStrings.js';
import DiffractionNumberControl from './DiffractionNumberControl.js';
const degreesValueString = WaveInterferenceStrings.degreesValue;
const heightString = WaveInterferenceStrings.height;
const mmValueString = WaveInterferenceStrings.mmValue;
const rotationString = WaveInterferenceStrings.rotation;
class WavingGirlSceneControlPanel extends WaveInterferencePanel {
  constructor(wavingGirlScene, options) {
    super(new HBox({
      spacing: WaveInterferenceConstants.DIFFRACTION_HBOX_SPACING,
      align: 'bottom',
      children: [new DiffractionNumberControl(heightString, wavingGirlScene.heightProperty, {
        delta: 10 * 1E-3,
        numberDisplayOptions: {
          valuePattern: mmValueString,
          decimalPlaces: 2
        },
        sliderOptions: {
          constrainValue: value => Utils.roundToInterval(value, 20E-3)
        }
      }), new DiffractionNumberControl(rotationString, wavingGirlScene.rotationProperty, {
        numberDisplayOptions: {
          valuePattern: degreesValueString
        },
        sliderOptions: {
          constrainValue: value => Utils.roundToInterval(value, 30),
          // degrees
          majorTicks: [{
            value: wavingGirlScene.rotationProperty.range.min,
            label: new WaveInterferenceText(wavingGirlScene.rotationProperty.range.min)
          }, {
            value: wavingGirlScene.rotationProperty.range.max,
            label: new WaveInterferenceText('360')
          }]
        }
      })]
    }), options);
  }
}
waveInterference.register('WavingGirlSceneControlPanel', WavingGirlSceneControlPanel);
export default WavingGirlSceneControlPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIkhCb3giLCJXYXZlSW50ZXJmZXJlbmNlUGFuZWwiLCJXYXZlSW50ZXJmZXJlbmNlVGV4dCIsIldhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMiLCJ3YXZlSW50ZXJmZXJlbmNlIiwiV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MiLCJEaWZmcmFjdGlvbk51bWJlckNvbnRyb2wiLCJkZWdyZWVzVmFsdWVTdHJpbmciLCJkZWdyZWVzVmFsdWUiLCJoZWlnaHRTdHJpbmciLCJoZWlnaHQiLCJtbVZhbHVlU3RyaW5nIiwibW1WYWx1ZSIsInJvdGF0aW9uU3RyaW5nIiwicm90YXRpb24iLCJXYXZpbmdHaXJsU2NlbmVDb250cm9sUGFuZWwiLCJjb25zdHJ1Y3RvciIsIndhdmluZ0dpcmxTY2VuZSIsIm9wdGlvbnMiLCJzcGFjaW5nIiwiRElGRlJBQ1RJT05fSEJPWF9TUEFDSU5HIiwiYWxpZ24iLCJjaGlsZHJlbiIsImhlaWdodFByb3BlcnR5IiwiZGVsdGEiLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsInZhbHVlUGF0dGVybiIsImRlY2ltYWxQbGFjZXMiLCJzbGlkZXJPcHRpb25zIiwiY29uc3RyYWluVmFsdWUiLCJ2YWx1ZSIsInJvdW5kVG9JbnRlcnZhbCIsInJvdGF0aW9uUHJvcGVydHkiLCJtYWpvclRpY2tzIiwicmFuZ2UiLCJtaW4iLCJsYWJlbCIsIm1heCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2F2aW5nR2lybFNjZW5lQ29udHJvbFBhbmVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbnRyb2wgcGFuZWwgZm9yIHRoZSBXYXZpbmdHaXJsU2NlbmUuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCB7IEhCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgV2F2ZUludGVyZmVyZW5jZVBhbmVsLCB7IFdhdmVJbnRlcmZlcmVuY2VQYW5lbE9wdGlvbnMgfSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9XYXZlSW50ZXJmZXJlbmNlUGFuZWwuanMnO1xyXG5pbXBvcnQgV2F2ZUludGVyZmVyZW5jZVRleHQgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvV2F2ZUludGVyZmVyZW5jZVRleHQuanMnO1xyXG5pbXBvcnQgV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCB3YXZlSW50ZXJmZXJlbmNlIGZyb20gJy4uLy4uL3dhdmVJbnRlcmZlcmVuY2UuanMnO1xyXG5pbXBvcnQgV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MgZnJvbSAnLi4vLi4vV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgRGlmZnJhY3Rpb25OdW1iZXJDb250cm9sIGZyb20gJy4vRGlmZnJhY3Rpb25OdW1iZXJDb250cm9sLmpzJztcclxuaW1wb3J0IFdhdmluZ0dpcmxTY2VuZSBmcm9tICcuLi9tb2RlbC9XYXZpbmdHaXJsU2NlbmUuanMnO1xyXG5cclxuY29uc3QgZGVncmVlc1ZhbHVlU3RyaW5nID0gV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MuZGVncmVlc1ZhbHVlO1xyXG5jb25zdCBoZWlnaHRTdHJpbmcgPSBXYXZlSW50ZXJmZXJlbmNlU3RyaW5ncy5oZWlnaHQ7XHJcbmNvbnN0IG1tVmFsdWVTdHJpbmcgPSBXYXZlSW50ZXJmZXJlbmNlU3RyaW5ncy5tbVZhbHVlO1xyXG5jb25zdCByb3RhdGlvblN0cmluZyA9IFdhdmVJbnRlcmZlcmVuY2VTdHJpbmdzLnJvdGF0aW9uO1xyXG5cclxuY2xhc3MgV2F2aW5nR2lybFNjZW5lQ29udHJvbFBhbmVsIGV4dGVuZHMgV2F2ZUludGVyZmVyZW5jZVBhbmVsIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB3YXZpbmdHaXJsU2NlbmU6IFdhdmluZ0dpcmxTY2VuZSwgb3B0aW9ucz86IFdhdmVJbnRlcmZlcmVuY2VQYW5lbE9wdGlvbnMgKSB7XHJcbiAgICBzdXBlciggbmV3IEhCb3goIHtcclxuICAgICAgc3BhY2luZzogV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5ESUZGUkFDVElPTl9IQk9YX1NQQUNJTkcsXHJcbiAgICAgIGFsaWduOiAnYm90dG9tJyxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgRGlmZnJhY3Rpb25OdW1iZXJDb250cm9sKCBoZWlnaHRTdHJpbmcsIHdhdmluZ0dpcmxTY2VuZS5oZWlnaHRQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgZGVsdGE6IDEwICogMUUtMyxcclxuICAgICAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIHZhbHVlUGF0dGVybjogbW1WYWx1ZVN0cmluZyxcclxuICAgICAgICAgICAgZGVjaW1hbFBsYWNlczogMlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHNsaWRlck9wdGlvbnM6IHtcclxuICAgICAgICAgICAgY29uc3RyYWluVmFsdWU6IHZhbHVlID0+IFV0aWxzLnJvdW5kVG9JbnRlcnZhbCggdmFsdWUsIDIwRS0zIClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICksXHJcbiAgICAgICAgbmV3IERpZmZyYWN0aW9uTnVtYmVyQ29udHJvbCggcm90YXRpb25TdHJpbmcsIHdhdmluZ0dpcmxTY2VuZS5yb3RhdGlvblByb3BlcnR5LCB7XHJcbiAgICAgICAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xyXG4gICAgICAgICAgICB2YWx1ZVBhdHRlcm46IGRlZ3JlZXNWYWx1ZVN0cmluZ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHNsaWRlck9wdGlvbnM6IHtcclxuICAgICAgICAgICAgY29uc3RyYWluVmFsdWU6IHZhbHVlID0+IFV0aWxzLnJvdW5kVG9JbnRlcnZhbCggdmFsdWUsIDMwICksIC8vIGRlZ3JlZXNcclxuICAgICAgICAgICAgbWFqb3JUaWNrczogWyB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHdhdmluZ0dpcmxTY2VuZS5yb3RhdGlvblByb3BlcnR5LnJhbmdlLm1pbixcclxuICAgICAgICAgICAgICBsYWJlbDogbmV3IFdhdmVJbnRlcmZlcmVuY2VUZXh0KCB3YXZpbmdHaXJsU2NlbmUucm90YXRpb25Qcm9wZXJ0eS5yYW5nZS5taW4gKVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHdhdmluZ0dpcmxTY2VuZS5yb3RhdGlvblByb3BlcnR5LnJhbmdlLm1heCxcclxuICAgICAgICAgICAgICBsYWJlbDogbmV3IFdhdmVJbnRlcmZlcmVuY2VUZXh0KCAnMzYwJyApXHJcbiAgICAgICAgICAgIH0gXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKVxyXG4gICAgICBdXHJcbiAgICB9ICksIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbndhdmVJbnRlcmZlcmVuY2UucmVnaXN0ZXIoICdXYXZpbmdHaXJsU2NlbmVDb250cm9sUGFuZWwnLCBXYXZpbmdHaXJsU2NlbmVDb250cm9sUGFuZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgV2F2aW5nR2lybFNjZW5lQ29udHJvbFBhbmVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLFNBQVNDLElBQUksUUFBUSxtQ0FBbUM7QUFDeEQsT0FBT0MscUJBQXFCLE1BQXdDLDRDQUE0QztBQUNoSCxPQUFPQyxvQkFBb0IsTUFBTSwyQ0FBMkM7QUFDNUUsT0FBT0MseUJBQXlCLE1BQU0sMkNBQTJDO0FBQ2pGLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyx1QkFBdUIsTUFBTSxrQ0FBa0M7QUFDdEUsT0FBT0Msd0JBQXdCLE1BQU0sK0JBQStCO0FBR3BFLE1BQU1DLGtCQUFrQixHQUFHRix1QkFBdUIsQ0FBQ0csWUFBWTtBQUMvRCxNQUFNQyxZQUFZLEdBQUdKLHVCQUF1QixDQUFDSyxNQUFNO0FBQ25ELE1BQU1DLGFBQWEsR0FBR04sdUJBQXVCLENBQUNPLE9BQU87QUFDckQsTUFBTUMsY0FBYyxHQUFHUix1QkFBdUIsQ0FBQ1MsUUFBUTtBQUV2RCxNQUFNQywyQkFBMkIsU0FBU2QscUJBQXFCLENBQUM7RUFFdkRlLFdBQVdBLENBQUVDLGVBQWdDLEVBQUVDLE9BQXNDLEVBQUc7SUFDN0YsS0FBSyxDQUFFLElBQUlsQixJQUFJLENBQUU7TUFDZm1CLE9BQU8sRUFBRWhCLHlCQUF5QixDQUFDaUIsd0JBQXdCO01BQzNEQyxLQUFLLEVBQUUsUUFBUTtNQUNmQyxRQUFRLEVBQUUsQ0FDUixJQUFJaEIsd0JBQXdCLENBQUVHLFlBQVksRUFBRVEsZUFBZSxDQUFDTSxjQUFjLEVBQUU7UUFDMUVDLEtBQUssRUFBRSxFQUFFLEdBQUcsSUFBSTtRQUNoQkMsb0JBQW9CLEVBQUU7VUFDcEJDLFlBQVksRUFBRWYsYUFBYTtVQUMzQmdCLGFBQWEsRUFBRTtRQUNqQixDQUFDO1FBQ0RDLGFBQWEsRUFBRTtVQUNiQyxjQUFjLEVBQUVDLEtBQUssSUFBSS9CLEtBQUssQ0FBQ2dDLGVBQWUsQ0FBRUQsS0FBSyxFQUFFLEtBQU07UUFDL0Q7TUFDRixDQUFFLENBQUMsRUFDSCxJQUFJeEIsd0JBQXdCLENBQUVPLGNBQWMsRUFBRUksZUFBZSxDQUFDZSxnQkFBZ0IsRUFBRTtRQUM5RVAsb0JBQW9CLEVBQUU7VUFDcEJDLFlBQVksRUFBRW5CO1FBQ2hCLENBQUM7UUFDRHFCLGFBQWEsRUFBRTtVQUNiQyxjQUFjLEVBQUVDLEtBQUssSUFBSS9CLEtBQUssQ0FBQ2dDLGVBQWUsQ0FBRUQsS0FBSyxFQUFFLEVBQUcsQ0FBQztVQUFFO1VBQzdERyxVQUFVLEVBQUUsQ0FBRTtZQUNaSCxLQUFLLEVBQUViLGVBQWUsQ0FBQ2UsZ0JBQWdCLENBQUNFLEtBQUssQ0FBQ0MsR0FBRztZQUNqREMsS0FBSyxFQUFFLElBQUlsQyxvQkFBb0IsQ0FBRWUsZUFBZSxDQUFDZSxnQkFBZ0IsQ0FBQ0UsS0FBSyxDQUFDQyxHQUFJO1VBQzlFLENBQUMsRUFBRTtZQUNETCxLQUFLLEVBQUViLGVBQWUsQ0FBQ2UsZ0JBQWdCLENBQUNFLEtBQUssQ0FBQ0csR0FBRztZQUNqREQsS0FBSyxFQUFFLElBQUlsQyxvQkFBb0IsQ0FBRSxLQUFNO1VBQ3pDLENBQUM7UUFDSDtNQUNGLENBQUUsQ0FBQztJQUVQLENBQUUsQ0FBQyxFQUFFZ0IsT0FBUSxDQUFDO0VBQ2hCO0FBQ0Y7QUFFQWQsZ0JBQWdCLENBQUNrQyxRQUFRLENBQUUsNkJBQTZCLEVBQUV2QiwyQkFBNEIsQ0FBQztBQUN2RixlQUFlQSwyQkFBMkIifQ==