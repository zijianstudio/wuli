// Copyright 2017-2023, University of Colorado Boulder

/**
 * Creates game challenges for Level 3 in the 'Graphing Slope-Intercept' sim.
 * Uses the same sets of slopes and y-intercepts as Level 2, but generates different challenges.
 * See createChallenges.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../dot/js/Range.js';
import Line from '../../../../graphing-lines/js/common/model/Line.js';
import EquationForm from '../../../../graphing-lines/js/linegame/model/EquationForm.js';
import GraphTheLine from '../../../../graphing-lines/js/linegame/model/GraphTheLine.js';
import MakeTheEquation from '../../../../graphing-lines/js/linegame/model/MakeTheEquation.js';
import ManipulationMode from '../../../../graphing-lines/js/linegame/model/ManipulationMode.js';
import PlaceThePoints from '../../../../graphing-lines/js/linegame/model/PlaceThePoints.js';
import ValuePool from '../../../../graphing-lines/js/linegame/model/ValuePool.js';
import graphingSlopeIntercept from '../../graphingSlopeIntercept.js';
import GSIChallengeFactory2 from './GSIChallengeFactory2.js';
export default class GSIChallengeFactory3 extends GSIChallengeFactory2 {
  constructor() {
    super();
  }

  /**
   * Creates challenges for this game level.
   */
  createChallenges() {
    // pools of values for slope and y-intercept
    const slopePool = new ValuePool(this.createSlopeArrays());
    const yInterceptPool = new ValuePool(this.createYInterceptArrays());
    let challenges = [];

    // CHALLENGE 1
    challenges.push(new GraphTheLine('1: GraphTheLine, required y-intercept, slope and intercept variable', this.createSlopeInterceptLine(slopePool.chooseOptional(), yInterceptPool.chooseRequired()), EquationForm.SLOPE_INTERCEPT, ManipulationMode.SLOPE_INTERCEPT, this.xRange, this.yRange));

    // CHALLENGE 2
    challenges.push(new GraphTheLine('2: GraphTheLine, required slope, slope and intercept variable', this.createSlopeInterceptLine(slopePool.chooseRequired(), yInterceptPool.chooseOptional()), EquationForm.SLOPE_INTERCEPT, ManipulationMode.SLOPE_INTERCEPT, this.xRange, this.yRange));

    // CHALLENGE 3
    challenges.push(new MakeTheEquation('3: MakeTheEquation, required slope, required y-intercept, slope and intercept variable', this.createSlopeInterceptLine(slopePool.chooseRequired(), yInterceptPool.chooseRequired()), EquationForm.SLOPE_INTERCEPT, ManipulationMode.SLOPE_INTERCEPT, this.xRange, this.yRange));

    // CHALLENGE 4
    challenges.push(new MakeTheEquation('4: MakeTheEquation, required slope, slope and intercept variable', this.createSlopeInterceptLine(slopePool.chooseRequired(), yInterceptPool.chooseOptional()), EquationForm.SLOPE_INTERCEPT, ManipulationMode.SLOPE_INTERCEPT, this.xRange, this.yRange));

    // CHALLENGE 5 & 6
    const placeThePointChallenges = this.createPlaceThePointChallenges();
    challenges = challenges.concat(placeThePointChallenges);
    assert && assert(slopePool.isEmpty(), 'some required slope was not used');
    assert && assert(yInterceptPool.isEmpty(), 'some required y-intercept was not used');
    return challenges;
  }

  /**
   * Creates place-the-point challenges for this level.
   */
  createPlaceThePointChallenges() {
    const challenges = [];
    const range = new Range(-5, 5);
    assert && assert(this.xRange.containsRange(range) && this.yRange.containsRange(range));
    const x1 = 0; // causes y-intercept to be an integer
    const yList = ValuePool.rangeToArray(range);
    const riseList = ValuePool.rangeToArray(range, true /* exclude zero slope */);
    const runList = ValuePool.rangeToArray(range, true /* exclude undefined slope */);

    // CHALLENGE 5
    let y1 = ValuePool.choose(yList);
    let rise = ValuePool.choose(riseList);
    let run = ValuePool.choose(runList);
    if (Math.abs(rise / run) === 1) {
      // prevent unit slope
      run = ValuePool.choose(runList);
    }
    challenges.push(new PlaceThePoints('5: PlaceThePoints, random points, integer y-intercept', new Line(x1, y1, x1 + run, y1 + rise), EquationForm.SLOPE_INTERCEPT, this.xRange, this.yRange));

    // CHALLENGE 6
    y1 = ValuePool.choose(yList);
    rise = ValuePool.choose(riseList);
    run = ValuePool.choose(runList);
    if (Math.abs(rise / run) === 1) {
      // prevent unit slope
      run = ValuePool.choose(runList);
    }
    challenges.push(new PlaceThePoints('6: PlaceThePoints, random points, integer y-intercept', new Line(x1, y1, x1 + run, y1 + rise), EquationForm.SLOPE_INTERCEPT, this.xRange, this.yRange));
    return challenges;
  }
}
graphingSlopeIntercept.register('GSIChallengeFactory3', GSIChallengeFactory3);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIkxpbmUiLCJFcXVhdGlvbkZvcm0iLCJHcmFwaFRoZUxpbmUiLCJNYWtlVGhlRXF1YXRpb24iLCJNYW5pcHVsYXRpb25Nb2RlIiwiUGxhY2VUaGVQb2ludHMiLCJWYWx1ZVBvb2wiLCJncmFwaGluZ1Nsb3BlSW50ZXJjZXB0IiwiR1NJQ2hhbGxlbmdlRmFjdG9yeTIiLCJHU0lDaGFsbGVuZ2VGYWN0b3J5MyIsImNvbnN0cnVjdG9yIiwiY3JlYXRlQ2hhbGxlbmdlcyIsInNsb3BlUG9vbCIsImNyZWF0ZVNsb3BlQXJyYXlzIiwieUludGVyY2VwdFBvb2wiLCJjcmVhdGVZSW50ZXJjZXB0QXJyYXlzIiwiY2hhbGxlbmdlcyIsInB1c2giLCJjcmVhdGVTbG9wZUludGVyY2VwdExpbmUiLCJjaG9vc2VPcHRpb25hbCIsImNob29zZVJlcXVpcmVkIiwiU0xPUEVfSU5URVJDRVBUIiwieFJhbmdlIiwieVJhbmdlIiwicGxhY2VUaGVQb2ludENoYWxsZW5nZXMiLCJjcmVhdGVQbGFjZVRoZVBvaW50Q2hhbGxlbmdlcyIsImNvbmNhdCIsImFzc2VydCIsImlzRW1wdHkiLCJyYW5nZSIsImNvbnRhaW5zUmFuZ2UiLCJ4MSIsInlMaXN0IiwicmFuZ2VUb0FycmF5IiwicmlzZUxpc3QiLCJydW5MaXN0IiwieTEiLCJjaG9vc2UiLCJyaXNlIiwicnVuIiwiTWF0aCIsImFicyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR1NJQ2hhbGxlbmdlRmFjdG9yeTMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBnYW1lIGNoYWxsZW5nZXMgZm9yIExldmVsIDMgaW4gdGhlICdHcmFwaGluZyBTbG9wZS1JbnRlcmNlcHQnIHNpbS5cclxuICogVXNlcyB0aGUgc2FtZSBzZXRzIG9mIHNsb3BlcyBhbmQgeS1pbnRlcmNlcHRzIGFzIExldmVsIDIsIGJ1dCBnZW5lcmF0ZXMgZGlmZmVyZW50IGNoYWxsZW5nZXMuXHJcbiAqIFNlZSBjcmVhdGVDaGFsbGVuZ2VzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgTGluZSBmcm9tICcuLi8uLi8uLi8uLi9ncmFwaGluZy1saW5lcy9qcy9jb21tb24vbW9kZWwvTGluZS5qcyc7XHJcbmltcG9ydCBDaGFsbGVuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZ3JhcGhpbmctbGluZXMvanMvbGluZWdhbWUvbW9kZWwvQ2hhbGxlbmdlLmpzJztcclxuaW1wb3J0IEVxdWF0aW9uRm9ybSBmcm9tICcuLi8uLi8uLi8uLi9ncmFwaGluZy1saW5lcy9qcy9saW5lZ2FtZS9tb2RlbC9FcXVhdGlvbkZvcm0uanMnO1xyXG5pbXBvcnQgR3JhcGhUaGVMaW5lIGZyb20gJy4uLy4uLy4uLy4uL2dyYXBoaW5nLWxpbmVzL2pzL2xpbmVnYW1lL21vZGVsL0dyYXBoVGhlTGluZS5qcyc7XHJcbmltcG9ydCBNYWtlVGhlRXF1YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vZ3JhcGhpbmctbGluZXMvanMvbGluZWdhbWUvbW9kZWwvTWFrZVRoZUVxdWF0aW9uLmpzJztcclxuaW1wb3J0IE1hbmlwdWxhdGlvbk1vZGUgZnJvbSAnLi4vLi4vLi4vLi4vZ3JhcGhpbmctbGluZXMvanMvbGluZWdhbWUvbW9kZWwvTWFuaXB1bGF0aW9uTW9kZS5qcyc7XHJcbmltcG9ydCBQbGFjZVRoZVBvaW50cyBmcm9tICcuLi8uLi8uLi8uLi9ncmFwaGluZy1saW5lcy9qcy9saW5lZ2FtZS9tb2RlbC9QbGFjZVRoZVBvaW50cy5qcyc7XHJcbmltcG9ydCBWYWx1ZVBvb2wgZnJvbSAnLi4vLi4vLi4vLi4vZ3JhcGhpbmctbGluZXMvanMvbGluZWdhbWUvbW9kZWwvVmFsdWVQb29sLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvbW9kZWwvRnJhY3Rpb24uanMnO1xyXG5pbXBvcnQgZ3JhcGhpbmdTbG9wZUludGVyY2VwdCBmcm9tICcuLi8uLi9ncmFwaGluZ1Nsb3BlSW50ZXJjZXB0LmpzJztcclxuaW1wb3J0IEdTSUNoYWxsZW5nZUZhY3RvcnkyIGZyb20gJy4vR1NJQ2hhbGxlbmdlRmFjdG9yeTIuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR1NJQ2hhbGxlbmdlRmFjdG9yeTMgZXh0ZW5kcyBHU0lDaGFsbGVuZ2VGYWN0b3J5MiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGNoYWxsZW5nZXMgZm9yIHRoaXMgZ2FtZSBsZXZlbC5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgY3JlYXRlQ2hhbGxlbmdlcygpOiBDaGFsbGVuZ2VbXSB7XHJcblxyXG4gICAgLy8gcG9vbHMgb2YgdmFsdWVzIGZvciBzbG9wZSBhbmQgeS1pbnRlcmNlcHRcclxuICAgIGNvbnN0IHNsb3BlUG9vbCA9IG5ldyBWYWx1ZVBvb2w8RnJhY3Rpb24+KCB0aGlzLmNyZWF0ZVNsb3BlQXJyYXlzKCkgKTtcclxuICAgIGNvbnN0IHlJbnRlcmNlcHRQb29sID0gbmV3IFZhbHVlUG9vbDxudW1iZXI+KCB0aGlzLmNyZWF0ZVlJbnRlcmNlcHRBcnJheXMoKSApO1xyXG5cclxuICAgIGxldCBjaGFsbGVuZ2VzOiBDaGFsbGVuZ2VbXSA9IFtdO1xyXG5cclxuICAgIC8vIENIQUxMRU5HRSAxXHJcbiAgICBjaGFsbGVuZ2VzLnB1c2goIG5ldyBHcmFwaFRoZUxpbmUoXHJcbiAgICAgICcxOiBHcmFwaFRoZUxpbmUsIHJlcXVpcmVkIHktaW50ZXJjZXB0LCBzbG9wZSBhbmQgaW50ZXJjZXB0IHZhcmlhYmxlJyxcclxuICAgICAgdGhpcy5jcmVhdGVTbG9wZUludGVyY2VwdExpbmUoIHNsb3BlUG9vbC5jaG9vc2VPcHRpb25hbCgpLCB5SW50ZXJjZXB0UG9vbC5jaG9vc2VSZXF1aXJlZCgpICksXHJcbiAgICAgIEVxdWF0aW9uRm9ybS5TTE9QRV9JTlRFUkNFUFQsXHJcbiAgICAgIE1hbmlwdWxhdGlvbk1vZGUuU0xPUEVfSU5URVJDRVBULFxyXG4gICAgICB0aGlzLnhSYW5nZSwgdGhpcy55UmFuZ2UgKSApO1xyXG5cclxuICAgIC8vIENIQUxMRU5HRSAyXHJcbiAgICBjaGFsbGVuZ2VzLnB1c2goIG5ldyBHcmFwaFRoZUxpbmUoXHJcbiAgICAgICcyOiBHcmFwaFRoZUxpbmUsIHJlcXVpcmVkIHNsb3BlLCBzbG9wZSBhbmQgaW50ZXJjZXB0IHZhcmlhYmxlJyxcclxuICAgICAgdGhpcy5jcmVhdGVTbG9wZUludGVyY2VwdExpbmUoIHNsb3BlUG9vbC5jaG9vc2VSZXF1aXJlZCgpLCB5SW50ZXJjZXB0UG9vbC5jaG9vc2VPcHRpb25hbCgpICksXHJcbiAgICAgIEVxdWF0aW9uRm9ybS5TTE9QRV9JTlRFUkNFUFQsXHJcbiAgICAgIE1hbmlwdWxhdGlvbk1vZGUuU0xPUEVfSU5URVJDRVBULFxyXG4gICAgICB0aGlzLnhSYW5nZSwgdGhpcy55UmFuZ2UgKSApO1xyXG5cclxuICAgIC8vIENIQUxMRU5HRSAzXHJcbiAgICBjaGFsbGVuZ2VzLnB1c2goIG5ldyBNYWtlVGhlRXF1YXRpb24oXHJcbiAgICAgICczOiBNYWtlVGhlRXF1YXRpb24sIHJlcXVpcmVkIHNsb3BlLCByZXF1aXJlZCB5LWludGVyY2VwdCwgc2xvcGUgYW5kIGludGVyY2VwdCB2YXJpYWJsZScsXHJcbiAgICAgIHRoaXMuY3JlYXRlU2xvcGVJbnRlcmNlcHRMaW5lKCBzbG9wZVBvb2wuY2hvb3NlUmVxdWlyZWQoKSwgeUludGVyY2VwdFBvb2wuY2hvb3NlUmVxdWlyZWQoKSApLFxyXG4gICAgICBFcXVhdGlvbkZvcm0uU0xPUEVfSU5URVJDRVBULFxyXG4gICAgICBNYW5pcHVsYXRpb25Nb2RlLlNMT1BFX0lOVEVSQ0VQVCxcclxuICAgICAgdGhpcy54UmFuZ2UsIHRoaXMueVJhbmdlICkgKTtcclxuXHJcbiAgICAvLyBDSEFMTEVOR0UgNFxyXG4gICAgY2hhbGxlbmdlcy5wdXNoKCBuZXcgTWFrZVRoZUVxdWF0aW9uKFxyXG4gICAgICAnNDogTWFrZVRoZUVxdWF0aW9uLCByZXF1aXJlZCBzbG9wZSwgc2xvcGUgYW5kIGludGVyY2VwdCB2YXJpYWJsZScsXHJcbiAgICAgIHRoaXMuY3JlYXRlU2xvcGVJbnRlcmNlcHRMaW5lKCBzbG9wZVBvb2wuY2hvb3NlUmVxdWlyZWQoKSwgeUludGVyY2VwdFBvb2wuY2hvb3NlT3B0aW9uYWwoKSApLFxyXG4gICAgICBFcXVhdGlvbkZvcm0uU0xPUEVfSU5URVJDRVBULFxyXG4gICAgICBNYW5pcHVsYXRpb25Nb2RlLlNMT1BFX0lOVEVSQ0VQVCxcclxuICAgICAgdGhpcy54UmFuZ2UsIHRoaXMueVJhbmdlICkgKTtcclxuXHJcbiAgICAvLyBDSEFMTEVOR0UgNSAmIDZcclxuICAgIGNvbnN0IHBsYWNlVGhlUG9pbnRDaGFsbGVuZ2VzID0gdGhpcy5jcmVhdGVQbGFjZVRoZVBvaW50Q2hhbGxlbmdlcygpO1xyXG4gICAgY2hhbGxlbmdlcyA9IGNoYWxsZW5nZXMuY29uY2F0KCBwbGFjZVRoZVBvaW50Q2hhbGxlbmdlcyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNsb3BlUG9vbC5pc0VtcHR5KCksICdzb21lIHJlcXVpcmVkIHNsb3BlIHdhcyBub3QgdXNlZCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHlJbnRlcmNlcHRQb29sLmlzRW1wdHkoKSwgJ3NvbWUgcmVxdWlyZWQgeS1pbnRlcmNlcHQgd2FzIG5vdCB1c2VkJyApO1xyXG5cclxuICAgIHJldHVybiBjaGFsbGVuZ2VzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBwbGFjZS10aGUtcG9pbnQgY2hhbGxlbmdlcyBmb3IgdGhpcyBsZXZlbC5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgY3JlYXRlUGxhY2VUaGVQb2ludENoYWxsZW5nZXMoKTogUGxhY2VUaGVQb2ludHNbXSB7XHJcblxyXG4gICAgY29uc3QgY2hhbGxlbmdlczogUGxhY2VUaGVQb2ludHNbXSA9IFtdO1xyXG5cclxuICAgIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKCAtNSwgNSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy54UmFuZ2UuY29udGFpbnNSYW5nZSggcmFuZ2UgKSAmJiB0aGlzLnlSYW5nZS5jb250YWluc1JhbmdlKCByYW5nZSApICk7XHJcbiAgICBjb25zdCB4MSA9IDA7IC8vIGNhdXNlcyB5LWludGVyY2VwdCB0byBiZSBhbiBpbnRlZ2VyXHJcbiAgICBjb25zdCB5TGlzdCA9IFZhbHVlUG9vbC5yYW5nZVRvQXJyYXkoIHJhbmdlICk7XHJcbiAgICBjb25zdCByaXNlTGlzdCA9IFZhbHVlUG9vbC5yYW5nZVRvQXJyYXkoIHJhbmdlLCB0cnVlIC8qIGV4Y2x1ZGUgemVybyBzbG9wZSAqLyApO1xyXG4gICAgY29uc3QgcnVuTGlzdCA9IFZhbHVlUG9vbC5yYW5nZVRvQXJyYXkoIHJhbmdlLCB0cnVlIC8qIGV4Y2x1ZGUgdW5kZWZpbmVkIHNsb3BlICovICk7XHJcblxyXG4gICAgLy8gQ0hBTExFTkdFIDVcclxuICAgIGxldCB5MSA9IFZhbHVlUG9vbC5jaG9vc2UoIHlMaXN0ICk7XHJcbiAgICBsZXQgcmlzZSA9IFZhbHVlUG9vbC5jaG9vc2UoIHJpc2VMaXN0ICk7XHJcbiAgICBsZXQgcnVuID0gVmFsdWVQb29sLmNob29zZSggcnVuTGlzdCApO1xyXG4gICAgaWYgKCBNYXRoLmFicyggcmlzZSAvIHJ1biApID09PSAxICkgeyAvLyBwcmV2ZW50IHVuaXQgc2xvcGVcclxuICAgICAgcnVuID0gVmFsdWVQb29sLmNob29zZSggcnVuTGlzdCApO1xyXG4gICAgfVxyXG4gICAgY2hhbGxlbmdlcy5wdXNoKCBuZXcgUGxhY2VUaGVQb2ludHMoXHJcbiAgICAgICc1OiBQbGFjZVRoZVBvaW50cywgcmFuZG9tIHBvaW50cywgaW50ZWdlciB5LWludGVyY2VwdCcsXHJcbiAgICAgIG5ldyBMaW5lKCB4MSwgeTEsIHgxICsgcnVuLCB5MSArIHJpc2UgKSxcclxuICAgICAgRXF1YXRpb25Gb3JtLlNMT1BFX0lOVEVSQ0VQVCxcclxuICAgICAgdGhpcy54UmFuZ2UsIHRoaXMueVJhbmdlICkgKTtcclxuXHJcbiAgICAvLyBDSEFMTEVOR0UgNlxyXG4gICAgeTEgPSBWYWx1ZVBvb2wuY2hvb3NlKCB5TGlzdCApO1xyXG4gICAgcmlzZSA9IFZhbHVlUG9vbC5jaG9vc2UoIHJpc2VMaXN0ICk7XHJcbiAgICBydW4gPSBWYWx1ZVBvb2wuY2hvb3NlKCBydW5MaXN0ICk7XHJcbiAgICBpZiAoIE1hdGguYWJzKCByaXNlIC8gcnVuICkgPT09IDEgKSB7IC8vIHByZXZlbnQgdW5pdCBzbG9wZVxyXG4gICAgICBydW4gPSBWYWx1ZVBvb2wuY2hvb3NlKCBydW5MaXN0ICk7XHJcbiAgICB9XHJcbiAgICBjaGFsbGVuZ2VzLnB1c2goIG5ldyBQbGFjZVRoZVBvaW50cyhcclxuICAgICAgJzY6IFBsYWNlVGhlUG9pbnRzLCByYW5kb20gcG9pbnRzLCBpbnRlZ2VyIHktaW50ZXJjZXB0JyxcclxuICAgICAgbmV3IExpbmUoIHgxLCB5MSwgeDEgKyBydW4sIHkxICsgcmlzZSApLFxyXG4gICAgICBFcXVhdGlvbkZvcm0uU0xPUEVfSU5URVJDRVBULFxyXG4gICAgICB0aGlzLnhSYW5nZSwgdGhpcy55UmFuZ2UgKSApO1xyXG5cclxuICAgIHJldHVybiBjaGFsbGVuZ2VzO1xyXG4gIH1cclxufVxyXG5cclxuZ3JhcGhpbmdTbG9wZUludGVyY2VwdC5yZWdpc3RlciggJ0dTSUNoYWxsZW5nZUZhY3RvcnkzJywgR1NJQ2hhbGxlbmdlRmFjdG9yeTMgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVB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