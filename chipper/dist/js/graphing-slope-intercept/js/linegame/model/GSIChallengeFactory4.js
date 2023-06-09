// Copyright 2017-2023, University of Colorado Boulder

/**
 * Creates game challenges for Level 4 in the 'Graphing Slope-Intercept' sim.
 * Identical to level 3, except with different Place-the-Point challenges.
 * See createPlaceThePointChallenges.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Line from '../../../../graphing-lines/js/common/model/Line.js';
import EquationForm from '../../../../graphing-lines/js/linegame/model/EquationForm.js';
import PlaceThePoints from '../../../../graphing-lines/js/linegame/model/PlaceThePoints.js';
import ValuePool from '../../../../graphing-lines/js/linegame/model/ValuePool.js';
import graphingSlopeIntercept from '../../graphingSlopeIntercept.js';
import GSIChallengeFactory3 from './GSIChallengeFactory3.js';
export default class GSIChallengeFactory4 extends GSIChallengeFactory3 {
  constructor() {
    super();
  }

  /**
   * Level 4 has a different set of place-the-point challenges, so override this function.
   */
  createPlaceThePointChallenges() {
    const challenges = [];

    // CHALLENGE 5
    const yIntercepts = ValuePool.rangeToArray(this.yRange, true /* excludeZero */);
    const yIntercept = ValuePool.choose(yIntercepts);
    challenges.push(new PlaceThePoints('5: PlaceThePoints, slope=0, random y-intercept (not zero)', new Line(0, yIntercept, 1, yIntercept), EquationForm.SLOPE_INTERCEPT, this.xRange, this.yRange));

    // CHALLENGE 6
    const xIntercepts = ValuePool.rangeToArray(this.xRange, true /* excludeZero */);
    const xIntercept = ValuePool.choose(xIntercepts);
    challenges.push(new PlaceThePoints('6: PlaceThePoints, slope=undefined, random x-intercept (not zero)', new Line(xIntercept, 0, xIntercept, 1), EquationForm.SLOPE_INTERCEPT, this.xRange, this.yRange));
    return challenges;
  }
}
graphingSlopeIntercept.register('GSIChallengeFactory4', GSIChallengeFactory4);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5lIiwiRXF1YXRpb25Gb3JtIiwiUGxhY2VUaGVQb2ludHMiLCJWYWx1ZVBvb2wiLCJncmFwaGluZ1Nsb3BlSW50ZXJjZXB0IiwiR1NJQ2hhbGxlbmdlRmFjdG9yeTMiLCJHU0lDaGFsbGVuZ2VGYWN0b3J5NCIsImNvbnN0cnVjdG9yIiwiY3JlYXRlUGxhY2VUaGVQb2ludENoYWxsZW5nZXMiLCJjaGFsbGVuZ2VzIiwieUludGVyY2VwdHMiLCJyYW5nZVRvQXJyYXkiLCJ5UmFuZ2UiLCJ5SW50ZXJjZXB0IiwiY2hvb3NlIiwicHVzaCIsIlNMT1BFX0lOVEVSQ0VQVCIsInhSYW5nZSIsInhJbnRlcmNlcHRzIiwieEludGVyY2VwdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR1NJQ2hhbGxlbmdlRmFjdG9yeTQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBnYW1lIGNoYWxsZW5nZXMgZm9yIExldmVsIDQgaW4gdGhlICdHcmFwaGluZyBTbG9wZS1JbnRlcmNlcHQnIHNpbS5cclxuICogSWRlbnRpY2FsIHRvIGxldmVsIDMsIGV4Y2VwdCB3aXRoIGRpZmZlcmVudCBQbGFjZS10aGUtUG9pbnQgY2hhbGxlbmdlcy5cclxuICogU2VlIGNyZWF0ZVBsYWNlVGhlUG9pbnRDaGFsbGVuZ2VzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBMaW5lIGZyb20gJy4uLy4uLy4uLy4uL2dyYXBoaW5nLWxpbmVzL2pzL2NvbW1vbi9tb2RlbC9MaW5lLmpzJztcclxuaW1wb3J0IEVxdWF0aW9uRm9ybSBmcm9tICcuLi8uLi8uLi8uLi9ncmFwaGluZy1saW5lcy9qcy9saW5lZ2FtZS9tb2RlbC9FcXVhdGlvbkZvcm0uanMnO1xyXG5pbXBvcnQgUGxhY2VUaGVQb2ludHMgZnJvbSAnLi4vLi4vLi4vLi4vZ3JhcGhpbmctbGluZXMvanMvbGluZWdhbWUvbW9kZWwvUGxhY2VUaGVQb2ludHMuanMnO1xyXG5pbXBvcnQgVmFsdWVQb29sIGZyb20gJy4uLy4uLy4uLy4uL2dyYXBoaW5nLWxpbmVzL2pzL2xpbmVnYW1lL21vZGVsL1ZhbHVlUG9vbC5qcyc7XHJcbmltcG9ydCBncmFwaGluZ1Nsb3BlSW50ZXJjZXB0IGZyb20gJy4uLy4uL2dyYXBoaW5nU2xvcGVJbnRlcmNlcHQuanMnO1xyXG5pbXBvcnQgR1NJQ2hhbGxlbmdlRmFjdG9yeTMgZnJvbSAnLi9HU0lDaGFsbGVuZ2VGYWN0b3J5My5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHU0lDaGFsbGVuZ2VGYWN0b3J5NCBleHRlbmRzIEdTSUNoYWxsZW5nZUZhY3RvcnkzIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExldmVsIDQgaGFzIGEgZGlmZmVyZW50IHNldCBvZiBwbGFjZS10aGUtcG9pbnQgY2hhbGxlbmdlcywgc28gb3ZlcnJpZGUgdGhpcyBmdW5jdGlvbi5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgY3JlYXRlUGxhY2VUaGVQb2ludENoYWxsZW5nZXMoKTogUGxhY2VUaGVQb2ludHNbXSB7XHJcblxyXG4gICAgY29uc3QgY2hhbGxlbmdlczogUGxhY2VUaGVQb2ludHNbXSA9IFtdO1xyXG5cclxuICAgIC8vIENIQUxMRU5HRSA1XHJcbiAgICBjb25zdCB5SW50ZXJjZXB0cyA9IFZhbHVlUG9vbC5yYW5nZVRvQXJyYXkoIHRoaXMueVJhbmdlLCB0cnVlIC8qIGV4Y2x1ZGVaZXJvICovICk7XHJcbiAgICBjb25zdCB5SW50ZXJjZXB0ID0gVmFsdWVQb29sLmNob29zZSggeUludGVyY2VwdHMgKTtcclxuICAgIGNoYWxsZW5nZXMucHVzaCggbmV3IFBsYWNlVGhlUG9pbnRzKFxyXG4gICAgICAnNTogUGxhY2VUaGVQb2ludHMsIHNsb3BlPTAsIHJhbmRvbSB5LWludGVyY2VwdCAobm90IHplcm8pJyxcclxuICAgICAgbmV3IExpbmUoIDAsIHlJbnRlcmNlcHQsIDEsIHlJbnRlcmNlcHQgKSxcclxuICAgICAgRXF1YXRpb25Gb3JtLlNMT1BFX0lOVEVSQ0VQVCxcclxuICAgICAgdGhpcy54UmFuZ2UsIHRoaXMueVJhbmdlICkgKTtcclxuXHJcbiAgICAvLyBDSEFMTEVOR0UgNlxyXG4gICAgY29uc3QgeEludGVyY2VwdHMgPSBWYWx1ZVBvb2wucmFuZ2VUb0FycmF5KCB0aGlzLnhSYW5nZSwgdHJ1ZSAvKiBleGNsdWRlWmVybyAqLyApO1xyXG4gICAgY29uc3QgeEludGVyY2VwdCA9IFZhbHVlUG9vbC5jaG9vc2UoIHhJbnRlcmNlcHRzICk7XHJcbiAgICBjaGFsbGVuZ2VzLnB1c2goIG5ldyBQbGFjZVRoZVBvaW50cyhcclxuICAgICAgJzY6IFBsYWNlVGhlUG9pbnRzLCBzbG9wZT11bmRlZmluZWQsIHJhbmRvbSB4LWludGVyY2VwdCAobm90IHplcm8pJyxcclxuICAgICAgbmV3IExpbmUoIHhJbnRlcmNlcHQsIDAsIHhJbnRlcmNlcHQsIDEgKSxcclxuICAgICAgRXF1YXRpb25Gb3JtLlNMT1BFX0lOVEVSQ0VQVCxcclxuICAgICAgdGhpcy54UmFuZ2UsIHRoaXMueVJhbmdlICkgKTtcclxuXHJcbiAgICByZXR1cm4gY2hhbGxlbmdlcztcclxuICB9XHJcbn1cclxuXHJcbmdyYXBoaW5nU2xvcGVJbnRlcmNlcHQucmVnaXN0ZXIoICdHU0lDaGFsbGVuZ2VGYWN0b3J5NCcsIEdTSUNoYWxsZW5nZUZhY3Rvcnk0ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxJQUFJLE1BQU0sb0RBQW9EO0FBQ3JFLE9BQU9DLFlBQVksTUFBTSw4REFBOEQ7QUFDdkYsT0FBT0MsY0FBYyxNQUFNLGdFQUFnRTtBQUMzRixPQUFPQyxTQUFTLE1BQU0sMkRBQTJEO0FBQ2pGLE9BQU9DLHNCQUFzQixNQUFNLGlDQUFpQztBQUNwRSxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFFNUQsZUFBZSxNQUFNQyxvQkFBb0IsU0FBU0Qsb0JBQW9CLENBQUM7RUFFOURFLFdBQVdBLENBQUEsRUFBRztJQUNuQixLQUFLLENBQUMsQ0FBQztFQUNUOztFQUVBO0FBQ0Y7QUFDQTtFQUNxQkMsNkJBQTZCQSxDQUFBLEVBQXFCO0lBRW5FLE1BQU1DLFVBQTRCLEdBQUcsRUFBRTs7SUFFdkM7SUFDQSxNQUFNQyxXQUFXLEdBQUdQLFNBQVMsQ0FBQ1EsWUFBWSxDQUFFLElBQUksQ0FBQ0MsTUFBTSxFQUFFLElBQUksQ0FBQyxpQkFBa0IsQ0FBQztJQUNqRixNQUFNQyxVQUFVLEdBQUdWLFNBQVMsQ0FBQ1csTUFBTSxDQUFFSixXQUFZLENBQUM7SUFDbERELFVBQVUsQ0FBQ00sSUFBSSxDQUFFLElBQUliLGNBQWMsQ0FDakMsMkRBQTJELEVBQzNELElBQUlGLElBQUksQ0FBRSxDQUFDLEVBQUVhLFVBQVUsRUFBRSxDQUFDLEVBQUVBLFVBQVcsQ0FBQyxFQUN4Q1osWUFBWSxDQUFDZSxlQUFlLEVBQzVCLElBQUksQ0FBQ0MsTUFBTSxFQUFFLElBQUksQ0FBQ0wsTUFBTyxDQUFFLENBQUM7O0lBRTlCO0lBQ0EsTUFBTU0sV0FBVyxHQUFHZixTQUFTLENBQUNRLFlBQVksQ0FBRSxJQUFJLENBQUNNLE1BQU0sRUFBRSxJQUFJLENBQUMsaUJBQWtCLENBQUM7SUFDakYsTUFBTUUsVUFBVSxHQUFHaEIsU0FBUyxDQUFDVyxNQUFNLENBQUVJLFdBQVksQ0FBQztJQUNsRFQsVUFBVSxDQUFDTSxJQUFJLENBQUUsSUFBSWIsY0FBYyxDQUNqQyxtRUFBbUUsRUFDbkUsSUFBSUYsSUFBSSxDQUFFbUIsVUFBVSxFQUFFLENBQUMsRUFBRUEsVUFBVSxFQUFFLENBQUUsQ0FBQyxFQUN4Q2xCLFlBQVksQ0FBQ2UsZUFBZSxFQUM1QixJQUFJLENBQUNDLE1BQU0sRUFBRSxJQUFJLENBQUNMLE1BQU8sQ0FBRSxDQUFDO0lBRTlCLE9BQU9ILFVBQVU7RUFDbkI7QUFDRjtBQUVBTCxzQkFBc0IsQ0FBQ2dCLFFBQVEsQ0FBRSxzQkFBc0IsRUFBRWQsb0JBQXFCLENBQUMifQ==