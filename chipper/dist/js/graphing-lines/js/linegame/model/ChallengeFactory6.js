// Copyright 2013-2023, University of Colorado Boulder

/**
 * Creates game challenges for Level 6, as specified in the design document.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../dot/js/Range.js';
import { Color } from '../../../../scenery/js/imports.js';
import Line from '../../common/model/Line.js';
import graphingLines from '../../graphingLines.js';
import BaseChallengeFactory from './BaseChallengeFactory.js';
import ChallengeFactory5 from './ChallengeFactory5.js';
import EquationForm from './EquationForm.js';
import GraphTheLine from './GraphTheLine.js';
import ManipulationMode from './ManipulationMode.js';
import PlaceThePoints from './PlaceThePoints.js';
import ValuePool from './ValuePool.js';
export default class ChallengeFactory6 extends BaseChallengeFactory {
  constructor() {
    super();
  }

  /**
   * Creates challenges for this game level.
   */
  createChallenges() {
    const challenges = [];
    let challengeNumber = 1;

    // for y-intercept manipulation challenges
    const yIntercepts = ValuePool.rangeToArray(this.yRange);

    // CHALLENGE 1:Place-the-Point, slope-intercept form, slope=0 (horizontal line), slope and intercept variable
    const yIntercept = ValuePool.choose(yIntercepts);
    challenges.push(new PlaceThePoints(`${challengeNumber++}: PlaceThePoints, slope=0, slope and intercept variable`, Line.createSlopeIntercept(0, 1, yIntercept), EquationForm.SLOPE_INTERCEPT, this.xRange, this.yRange));

    // CHALLENGES 2-4:
    // 3 Graph-the-Line challenges with mismatched representations
    // (eg, point-slope equation with slope-intercept manipulators)
    {
      // we'll pick 3 from here
      const equationForms = [EquationForm.SLOPE_INTERCEPT, EquationForm.SLOPE_INTERCEPT, EquationForm.POINT_SLOPE, EquationForm.POINT_SLOPE];
      assert && assert(equationForms.length === 4);
      for (let i = 0; i < 3; i++) {
        const equationForm = ValuePool.choose(equationForms);

        // random points
        const range = new Range(-7, 7);
        assert && assert(this.xRange.containsRange(range) && this.yRange.containsRange(range));
        const xList = ValuePool.rangeToArray(range);
        const yList = ValuePool.rangeToArray(range);
        const x1 = 0; // y-intercept must be an integer since we're mismatching representations
        const y1 = ValuePool.choose(yList);
        let x2 = ValuePool.choose(xList);
        if (x2 === x1) {
          x2 = ValuePool.choose(xList); // prevent undefined slope
        }

        let y2 = ValuePool.choose(yList);

        // exclude slopes of +1 and -1
        const slope = (y2 - y1) / (x2 - x1);
        if (slope === 1 || slope === -1) {
          y2 = ValuePool.choose(yList);
        }

        // challenge, with mismatched representations
        const line = new Line(x1, y1, x2, y2, Color.BLACK);
        if (equationForm === EquationForm.SLOPE_INTERCEPT) {
          challenges.push(new GraphTheLine(`${challengeNumber++}: GraphTheLine, slope-intercept form, point and slope variable`, line, equationForm, ManipulationMode.POINT_SLOPE, this.xRange, this.yRange));
        } else {
          challenges.push(new GraphTheLine(`${challengeNumber++}: GraphTheLine, point-slope form, slope and intercept variable`, line, equationForm, ManipulationMode.SLOPE_INTERCEPT, this.xRange, this.yRange));
        }
      }
    }

    // CHALLENGES 5 & 6: 2 Place-the-Point challenges (same as level 5)
    ChallengeFactory5.addPlaceThePointsChallenges(challenges, this.xRange, this.yRange);
    return challenges;
  }
}
graphingLines.register('ChallengeFactory6', ChallengeFactory6);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIkNvbG9yIiwiTGluZSIsImdyYXBoaW5nTGluZXMiLCJCYXNlQ2hhbGxlbmdlRmFjdG9yeSIsIkNoYWxsZW5nZUZhY3Rvcnk1IiwiRXF1YXRpb25Gb3JtIiwiR3JhcGhUaGVMaW5lIiwiTWFuaXB1bGF0aW9uTW9kZSIsIlBsYWNlVGhlUG9pbnRzIiwiVmFsdWVQb29sIiwiQ2hhbGxlbmdlRmFjdG9yeTYiLCJjb25zdHJ1Y3RvciIsImNyZWF0ZUNoYWxsZW5nZXMiLCJjaGFsbGVuZ2VzIiwiY2hhbGxlbmdlTnVtYmVyIiwieUludGVyY2VwdHMiLCJyYW5nZVRvQXJyYXkiLCJ5UmFuZ2UiLCJ5SW50ZXJjZXB0IiwiY2hvb3NlIiwicHVzaCIsImNyZWF0ZVNsb3BlSW50ZXJjZXB0IiwiU0xPUEVfSU5URVJDRVBUIiwieFJhbmdlIiwiZXF1YXRpb25Gb3JtcyIsIlBPSU5UX1NMT1BFIiwiYXNzZXJ0IiwibGVuZ3RoIiwiaSIsImVxdWF0aW9uRm9ybSIsInJhbmdlIiwiY29udGFpbnNSYW5nZSIsInhMaXN0IiwieUxpc3QiLCJ4MSIsInkxIiwieDIiLCJ5MiIsInNsb3BlIiwibGluZSIsIkJMQUNLIiwiYWRkUGxhY2VUaGVQb2ludHNDaGFsbGVuZ2VzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDaGFsbGVuZ2VGYWN0b3J5Ni50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGdhbWUgY2hhbGxlbmdlcyBmb3IgTGV2ZWwgNiwgYXMgc3BlY2lmaWVkIGluIHRoZSBkZXNpZ24gZG9jdW1lbnQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IExpbmUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0xpbmUuanMnO1xyXG5pbXBvcnQgZ3JhcGhpbmdMaW5lcyBmcm9tICcuLi8uLi9ncmFwaGluZ0xpbmVzLmpzJztcclxuaW1wb3J0IEJhc2VDaGFsbGVuZ2VGYWN0b3J5IGZyb20gJy4vQmFzZUNoYWxsZW5nZUZhY3RvcnkuanMnO1xyXG5pbXBvcnQgQ2hhbGxlbmdlIGZyb20gJy4vQ2hhbGxlbmdlLmpzJztcclxuaW1wb3J0IENoYWxsZW5nZUZhY3Rvcnk1IGZyb20gJy4vQ2hhbGxlbmdlRmFjdG9yeTUuanMnO1xyXG5pbXBvcnQgRXF1YXRpb25Gb3JtIGZyb20gJy4vRXF1YXRpb25Gb3JtLmpzJztcclxuaW1wb3J0IEdyYXBoVGhlTGluZSBmcm9tICcuL0dyYXBoVGhlTGluZS5qcyc7XHJcbmltcG9ydCBNYW5pcHVsYXRpb25Nb2RlIGZyb20gJy4vTWFuaXB1bGF0aW9uTW9kZS5qcyc7XHJcbmltcG9ydCBQbGFjZVRoZVBvaW50cyBmcm9tICcuL1BsYWNlVGhlUG9pbnRzLmpzJztcclxuaW1wb3J0IFZhbHVlUG9vbCBmcm9tICcuL1ZhbHVlUG9vbC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGFsbGVuZ2VGYWN0b3J5NiBleHRlbmRzIEJhc2VDaGFsbGVuZ2VGYWN0b3J5IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgY2hhbGxlbmdlcyBmb3IgdGhpcyBnYW1lIGxldmVsLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBjcmVhdGVDaGFsbGVuZ2VzKCk6IENoYWxsZW5nZVtdIHtcclxuXHJcbiAgICBjb25zdCBjaGFsbGVuZ2VzID0gW107XHJcbiAgICBsZXQgY2hhbGxlbmdlTnVtYmVyID0gMTtcclxuXHJcbiAgICAvLyBmb3IgeS1pbnRlcmNlcHQgbWFuaXB1bGF0aW9uIGNoYWxsZW5nZXNcclxuICAgIGNvbnN0IHlJbnRlcmNlcHRzID0gVmFsdWVQb29sLnJhbmdlVG9BcnJheSggdGhpcy55UmFuZ2UgKTtcclxuXHJcbiAgICAvLyBDSEFMTEVOR0UgMTpQbGFjZS10aGUtUG9pbnQsIHNsb3BlLWludGVyY2VwdCBmb3JtLCBzbG9wZT0wIChob3Jpem9udGFsIGxpbmUpLCBzbG9wZSBhbmQgaW50ZXJjZXB0IHZhcmlhYmxlXHJcbiAgICBjb25zdCB5SW50ZXJjZXB0ID0gVmFsdWVQb29sLmNob29zZSggeUludGVyY2VwdHMgKTtcclxuICAgIGNoYWxsZW5nZXMucHVzaCggbmV3IFBsYWNlVGhlUG9pbnRzKFxyXG4gICAgICBgJHtjaGFsbGVuZ2VOdW1iZXIrK306IFBsYWNlVGhlUG9pbnRzLCBzbG9wZT0wLCBzbG9wZSBhbmQgaW50ZXJjZXB0IHZhcmlhYmxlYCxcclxuICAgICAgTGluZS5jcmVhdGVTbG9wZUludGVyY2VwdCggMCwgMSwgeUludGVyY2VwdCApLFxyXG4gICAgICBFcXVhdGlvbkZvcm0uU0xPUEVfSU5URVJDRVBULFxyXG4gICAgICB0aGlzLnhSYW5nZSwgdGhpcy55UmFuZ2UgKSApO1xyXG5cclxuICAgIC8vIENIQUxMRU5HRVMgMi00OlxyXG4gICAgLy8gMyBHcmFwaC10aGUtTGluZSBjaGFsbGVuZ2VzIHdpdGggbWlzbWF0Y2hlZCByZXByZXNlbnRhdGlvbnNcclxuICAgIC8vIChlZywgcG9pbnQtc2xvcGUgZXF1YXRpb24gd2l0aCBzbG9wZS1pbnRlcmNlcHQgbWFuaXB1bGF0b3JzKVxyXG4gICAge1xyXG4gICAgICAvLyB3ZSdsbCBwaWNrIDMgZnJvbSBoZXJlXHJcbiAgICAgIGNvbnN0IGVxdWF0aW9uRm9ybXMgPSBbIEVxdWF0aW9uRm9ybS5TTE9QRV9JTlRFUkNFUFQsIEVxdWF0aW9uRm9ybS5TTE9QRV9JTlRFUkNFUFQsIEVxdWF0aW9uRm9ybS5QT0lOVF9TTE9QRSwgRXF1YXRpb25Gb3JtLlBPSU5UX1NMT1BFIF07XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGVxdWF0aW9uRm9ybXMubGVuZ3RoID09PSA0ICk7XHJcblxyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCAzOyBpKysgKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGVxdWF0aW9uRm9ybSA9IFZhbHVlUG9vbC5jaG9vc2UoIGVxdWF0aW9uRm9ybXMgKTtcclxuXHJcbiAgICAgICAgLy8gcmFuZG9tIHBvaW50c1xyXG4gICAgICAgIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKCAtNywgNyApO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMueFJhbmdlLmNvbnRhaW5zUmFuZ2UoIHJhbmdlICkgJiYgdGhpcy55UmFuZ2UuY29udGFpbnNSYW5nZSggcmFuZ2UgKSApO1xyXG4gICAgICAgIGNvbnN0IHhMaXN0ID0gVmFsdWVQb29sLnJhbmdlVG9BcnJheSggcmFuZ2UgKTtcclxuICAgICAgICBjb25zdCB5TGlzdCA9IFZhbHVlUG9vbC5yYW5nZVRvQXJyYXkoIHJhbmdlICk7XHJcbiAgICAgICAgY29uc3QgeDEgPSAwOyAvLyB5LWludGVyY2VwdCBtdXN0IGJlIGFuIGludGVnZXIgc2luY2Ugd2UncmUgbWlzbWF0Y2hpbmcgcmVwcmVzZW50YXRpb25zXHJcbiAgICAgICAgY29uc3QgeTEgPSBWYWx1ZVBvb2wuY2hvb3NlKCB5TGlzdCApO1xyXG4gICAgICAgIGxldCB4MiA9IFZhbHVlUG9vbC5jaG9vc2UoIHhMaXN0ICk7XHJcbiAgICAgICAgaWYgKCB4MiA9PT0geDEgKSB7XHJcbiAgICAgICAgICB4MiA9IFZhbHVlUG9vbC5jaG9vc2UoIHhMaXN0ICk7IC8vIHByZXZlbnQgdW5kZWZpbmVkIHNsb3BlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB5MiA9IFZhbHVlUG9vbC5jaG9vc2UoIHlMaXN0ICk7XHJcblxyXG4gICAgICAgIC8vIGV4Y2x1ZGUgc2xvcGVzIG9mICsxIGFuZCAtMVxyXG4gICAgICAgIGNvbnN0IHNsb3BlID0gKCB5MiAtIHkxICkgLyAoIHgyIC0geDEgKTtcclxuICAgICAgICBpZiAoIHNsb3BlID09PSAxIHx8IHNsb3BlID09PSAtMSApIHtcclxuICAgICAgICAgIHkyID0gVmFsdWVQb29sLmNob29zZSggeUxpc3QgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNoYWxsZW5nZSwgd2l0aCBtaXNtYXRjaGVkIHJlcHJlc2VudGF0aW9uc1xyXG4gICAgICAgIGNvbnN0IGxpbmUgPSBuZXcgTGluZSggeDEsIHkxLCB4MiwgeTIsIENvbG9yLkJMQUNLICk7XHJcbiAgICAgICAgaWYgKCBlcXVhdGlvbkZvcm0gPT09IEVxdWF0aW9uRm9ybS5TTE9QRV9JTlRFUkNFUFQgKSB7XHJcbiAgICAgICAgICBjaGFsbGVuZ2VzLnB1c2goIG5ldyBHcmFwaFRoZUxpbmUoXHJcbiAgICAgICAgICAgIGAke2NoYWxsZW5nZU51bWJlcisrfTogR3JhcGhUaGVMaW5lLCBzbG9wZS1pbnRlcmNlcHQgZm9ybSwgcG9pbnQgYW5kIHNsb3BlIHZhcmlhYmxlYCxcclxuICAgICAgICAgICAgbGluZSxcclxuICAgICAgICAgICAgZXF1YXRpb25Gb3JtLFxyXG4gICAgICAgICAgICBNYW5pcHVsYXRpb25Nb2RlLlBPSU5UX1NMT1BFLFxyXG4gICAgICAgICAgICB0aGlzLnhSYW5nZSwgdGhpcy55UmFuZ2UgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGNoYWxsZW5nZXMucHVzaCggbmV3IEdyYXBoVGhlTGluZShcclxuICAgICAgICAgICAgYCR7Y2hhbGxlbmdlTnVtYmVyKyt9OiBHcmFwaFRoZUxpbmUsIHBvaW50LXNsb3BlIGZvcm0sIHNsb3BlIGFuZCBpbnRlcmNlcHQgdmFyaWFibGVgLFxyXG4gICAgICAgICAgICBsaW5lLFxyXG4gICAgICAgICAgICBlcXVhdGlvbkZvcm0sXHJcbiAgICAgICAgICAgIE1hbmlwdWxhdGlvbk1vZGUuU0xPUEVfSU5URVJDRVBULFxyXG4gICAgICAgICAgICB0aGlzLnhSYW5nZSwgdGhpcy55UmFuZ2UgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIENIQUxMRU5HRVMgNSAmIDY6IDIgUGxhY2UtdGhlLVBvaW50IGNoYWxsZW5nZXMgKHNhbWUgYXMgbGV2ZWwgNSlcclxuICAgIENoYWxsZW5nZUZhY3Rvcnk1LmFkZFBsYWNlVGhlUG9pbnRzQ2hhbGxlbmdlcyggY2hhbGxlbmdlcywgdGhpcy54UmFuZ2UsIHRoaXMueVJhbmdlICk7XHJcblxyXG4gICAgcmV0dXJuIGNoYWxsZW5nZXM7XHJcbiAgfVxyXG59XHJcblxyXG5ncmFwaGluZ0xpbmVzLnJlZ2lzdGVyKCAnQ2hhbGxlbmdlRmFjdG9yeTYnLCBDaGFsbGVuZ2VGYWN0b3J5NiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLFNBQVNDLEtBQUssUUFBUSxtQ0FBbUM7QUFDekQsT0FBT0MsSUFBSSxNQUFNLDRCQUE0QjtBQUM3QyxPQUFPQyxhQUFhLE1BQU0sd0JBQXdCO0FBQ2xELE9BQU9DLG9CQUFvQixNQUFNLDJCQUEyQjtBQUU1RCxPQUFPQyxpQkFBaUIsTUFBTSx3QkFBd0I7QUFDdEQsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUM1QyxPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBQzVDLE9BQU9DLGdCQUFnQixNQUFNLHVCQUF1QjtBQUNwRCxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBQ2hELE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFFdEMsZUFBZSxNQUFNQyxpQkFBaUIsU0FBU1Asb0JBQW9CLENBQUM7RUFFM0RRLFdBQVdBLENBQUEsRUFBRztJQUNuQixLQUFLLENBQUMsQ0FBQztFQUNUOztFQUVBO0FBQ0Y7QUFDQTtFQUNrQkMsZ0JBQWdCQSxDQUFBLEVBQWdCO0lBRTlDLE1BQU1DLFVB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