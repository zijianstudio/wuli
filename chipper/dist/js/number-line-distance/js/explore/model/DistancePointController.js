// Copyright 2021-2022, University of Colorado Boulder

/**
 * A point controller for the distance scene of NLD that locks on to the numberline when in the sidewalk's bounds, and
 * unlocks when outside. Must be separate from AreaPointController because it cannot move freely within the play area,
 * but must rather lock onto a specific height when in the play area.
 *
 * @author Saurabh Totey
 */

import LockToNumberLine from '../../../../number-line-common/js/common/model/LockToNumberLine.js';
import NumberLinePoint from '../../../../number-line-common/js/common/model/NumberLinePoint.js';
import numberLineDistance from '../../numberLineDistance.js';
import DropFromDirection from './DropFromDirection.js';
import ExplorePointController from './ExplorePointController.js';
class DistancePointController extends ExplorePointController {
  /**
   * @param {SpatializedNumberLine} numberLine
   * @param {Bounds2} lockingBounds - the point controller will lock on to the number line if in the bounds
   * @param {number} lockHeight
   * @param {number} scaleInBox
   */
  constructor(numberLine, lockingBounds, lockHeight, scaleInBox) {
    super(DropFromDirection.TOP, lockingBounds, {
      numberLines: [numberLine],
      lockToNumberLine: LockToNumberLine.WHEN_CLOSE,
      offsetFromHorizontalNumberLine: lockHeight,
      scaleInBox: scaleInBox
    });

    // @private {Bounds2} the bounds for when the point controller will lock onto the number line
    this.lockingBounds = lockingBounds;
  }

  /**
   * Performs the normal proposePosition assuming that this only has one number line and is always
   * locked to the number line when close. There is a small change that the locking behaviour
   * doesn't depend on distance from the number line but rather on whether this point controller is
   * within the play area.
   *
   * @override
   * @param {Vector2} proposedPosition
   * @public
   */
  proposePosition(proposedPosition) {
    if (this.isControllingNumberLinePoint()) {
      const point = this.numberLinePoints[0];
      const proposedNumberLineValue = point.numberLine.modelPositionToValue(proposedPosition);

      // Determine whether to propose a new value for the point or to detach and remove the point.
      if (this.lockingBounds.containsPoint(proposedPosition)) {
        point.proposeValue(proposedNumberLineValue);
      } else {
        point.numberLine.removePoint(point);
        this.dissociateFromNumberLinePoint(point);
      }
    } else {
      // Check if a point should be created and added based on the proposed position.
      if (this.lockingBounds.containsPoint(proposedPosition)) {
        const numberLine = this.numberLines[0];
        const constrainedValue = numberLine.getConstrainedValue(numberLine.modelPositionToValue(proposedPosition));
        const numberLinePoint = new NumberLinePoint(numberLine, {
          initialValue: constrainedValue,
          initialColor: this.color,
          controller: this
        });
        numberLine.addPoint(numberLinePoint);
        this.associateWithNumberLinePoint(numberLinePoint);
      } else {
        // Just accept the proposed position, no other action is necessary.
        this.goToPosition(proposedPosition);
      }
    }
  }
}
numberLineDistance.register('DistancePointController', DistancePointController);
export default DistancePointController;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMb2NrVG9OdW1iZXJMaW5lIiwiTnVtYmVyTGluZVBvaW50IiwibnVtYmVyTGluZURpc3RhbmNlIiwiRHJvcEZyb21EaXJlY3Rpb24iLCJFeHBsb3JlUG9pbnRDb250cm9sbGVyIiwiRGlzdGFuY2VQb2ludENvbnRyb2xsZXIiLCJjb25zdHJ1Y3RvciIsIm51bWJlckxpbmUiLCJsb2NraW5nQm91bmRzIiwibG9ja0hlaWdodCIsInNjYWxlSW5Cb3giLCJUT1AiLCJudW1iZXJMaW5lcyIsImxvY2tUb051bWJlckxpbmUiLCJXSEVOX0NMT1NFIiwib2Zmc2V0RnJvbUhvcml6b250YWxOdW1iZXJMaW5lIiwicHJvcG9zZVBvc2l0aW9uIiwicHJvcG9zZWRQb3NpdGlvbiIsImlzQ29udHJvbGxpbmdOdW1iZXJMaW5lUG9pbnQiLCJwb2ludCIsIm51bWJlckxpbmVQb2ludHMiLCJwcm9wb3NlZE51bWJlckxpbmVWYWx1ZSIsIm1vZGVsUG9zaXRpb25Ub1ZhbHVlIiwiY29udGFpbnNQb2ludCIsInByb3Bvc2VWYWx1ZSIsInJlbW92ZVBvaW50IiwiZGlzc29jaWF0ZUZyb21OdW1iZXJMaW5lUG9pbnQiLCJjb25zdHJhaW5lZFZhbHVlIiwiZ2V0Q29uc3RyYWluZWRWYWx1ZSIsIm51bWJlckxpbmVQb2ludCIsImluaXRpYWxWYWx1ZSIsImluaXRpYWxDb2xvciIsImNvbG9yIiwiY29udHJvbGxlciIsImFkZFBvaW50IiwiYXNzb2NpYXRlV2l0aE51bWJlckxpbmVQb2ludCIsImdvVG9Qb3NpdGlvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRGlzdGFuY2VQb2ludENvbnRyb2xsZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBwb2ludCBjb250cm9sbGVyIGZvciB0aGUgZGlzdGFuY2Ugc2NlbmUgb2YgTkxEIHRoYXQgbG9ja3Mgb24gdG8gdGhlIG51bWJlcmxpbmUgd2hlbiBpbiB0aGUgc2lkZXdhbGsncyBib3VuZHMsIGFuZFxyXG4gKiB1bmxvY2tzIHdoZW4gb3V0c2lkZS4gTXVzdCBiZSBzZXBhcmF0ZSBmcm9tIEFyZWFQb2ludENvbnRyb2xsZXIgYmVjYXVzZSBpdCBjYW5ub3QgbW92ZSBmcmVlbHkgd2l0aGluIHRoZSBwbGF5IGFyZWEsXHJcbiAqIGJ1dCBtdXN0IHJhdGhlciBsb2NrIG9udG8gYSBzcGVjaWZpYyBoZWlnaHQgd2hlbiBpbiB0aGUgcGxheSBhcmVhLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhdXJhYmggVG90ZXlcclxuICovXHJcblxyXG5pbXBvcnQgTG9ja1RvTnVtYmVyTGluZSBmcm9tICcuLi8uLi8uLi8uLi9udW1iZXItbGluZS1jb21tb24vanMvY29tbW9uL21vZGVsL0xvY2tUb051bWJlckxpbmUuanMnO1xyXG5pbXBvcnQgTnVtYmVyTGluZVBvaW50IGZyb20gJy4uLy4uLy4uLy4uL251bWJlci1saW5lLWNvbW1vbi9qcy9jb21tb24vbW9kZWwvTnVtYmVyTGluZVBvaW50LmpzJztcclxuaW1wb3J0IG51bWJlckxpbmVEaXN0YW5jZSBmcm9tICcuLi8uLi9udW1iZXJMaW5lRGlzdGFuY2UuanMnO1xyXG5pbXBvcnQgRHJvcEZyb21EaXJlY3Rpb24gZnJvbSAnLi9Ecm9wRnJvbURpcmVjdGlvbi5qcyc7XHJcbmltcG9ydCBFeHBsb3JlUG9pbnRDb250cm9sbGVyIGZyb20gJy4vRXhwbG9yZVBvaW50Q29udHJvbGxlci5qcyc7XHJcblxyXG5jbGFzcyBEaXN0YW5jZVBvaW50Q29udHJvbGxlciBleHRlbmRzIEV4cGxvcmVQb2ludENvbnRyb2xsZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1NwYXRpYWxpemVkTnVtYmVyTGluZX0gbnVtYmVyTGluZVxyXG4gICAqIEBwYXJhbSB7Qm91bmRzMn0gbG9ja2luZ0JvdW5kcyAtIHRoZSBwb2ludCBjb250cm9sbGVyIHdpbGwgbG9jayBvbiB0byB0aGUgbnVtYmVyIGxpbmUgaWYgaW4gdGhlIGJvdW5kc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsb2NrSGVpZ2h0XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNjYWxlSW5Cb3hcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbnVtYmVyTGluZSwgbG9ja2luZ0JvdW5kcywgbG9ja0hlaWdodCwgc2NhbGVJbkJveCApIHtcclxuICAgIHN1cGVyKCBEcm9wRnJvbURpcmVjdGlvbi5UT1AsIGxvY2tpbmdCb3VuZHMsIHtcclxuICAgICAgbnVtYmVyTGluZXM6IFsgbnVtYmVyTGluZSBdLFxyXG4gICAgICBsb2NrVG9OdW1iZXJMaW5lOiBMb2NrVG9OdW1iZXJMaW5lLldIRU5fQ0xPU0UsXHJcbiAgICAgIG9mZnNldEZyb21Ib3Jpem9udGFsTnVtYmVyTGluZTogbG9ja0hlaWdodCxcclxuICAgICAgc2NhbGVJbkJveDogc2NhbGVJbkJveFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtCb3VuZHMyfSB0aGUgYm91bmRzIGZvciB3aGVuIHRoZSBwb2ludCBjb250cm9sbGVyIHdpbGwgbG9jayBvbnRvIHRoZSBudW1iZXIgbGluZVxyXG4gICAgdGhpcy5sb2NraW5nQm91bmRzID0gbG9ja2luZ0JvdW5kcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBlcmZvcm1zIHRoZSBub3JtYWwgcHJvcG9zZVBvc2l0aW9uIGFzc3VtaW5nIHRoYXQgdGhpcyBvbmx5IGhhcyBvbmUgbnVtYmVyIGxpbmUgYW5kIGlzIGFsd2F5c1xyXG4gICAqIGxvY2tlZCB0byB0aGUgbnVtYmVyIGxpbmUgd2hlbiBjbG9zZS4gVGhlcmUgaXMgYSBzbWFsbCBjaGFuZ2UgdGhhdCB0aGUgbG9ja2luZyBiZWhhdmlvdXJcclxuICAgKiBkb2Vzbid0IGRlcGVuZCBvbiBkaXN0YW5jZSBmcm9tIHRoZSBudW1iZXIgbGluZSBidXQgcmF0aGVyIG9uIHdoZXRoZXIgdGhpcyBwb2ludCBjb250cm9sbGVyIGlzXHJcbiAgICogd2l0aGluIHRoZSBwbGF5IGFyZWEuXHJcbiAgICpcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHByb3Bvc2VkUG9zaXRpb25cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcHJvcG9zZVBvc2l0aW9uKCBwcm9wb3NlZFBvc2l0aW9uICkge1xyXG4gICAgaWYgKCB0aGlzLmlzQ29udHJvbGxpbmdOdW1iZXJMaW5lUG9pbnQoKSApIHtcclxuICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLm51bWJlckxpbmVQb2ludHNbIDAgXTtcclxuICAgICAgY29uc3QgcHJvcG9zZWROdW1iZXJMaW5lVmFsdWUgPSBwb2ludC5udW1iZXJMaW5lLm1vZGVsUG9zaXRpb25Ub1ZhbHVlKCBwcm9wb3NlZFBvc2l0aW9uICk7XHJcblxyXG4gICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB0byBwcm9wb3NlIGEgbmV3IHZhbHVlIGZvciB0aGUgcG9pbnQgb3IgdG8gZGV0YWNoIGFuZCByZW1vdmUgdGhlIHBvaW50LlxyXG4gICAgICBpZiAoIHRoaXMubG9ja2luZ0JvdW5kcy5jb250YWluc1BvaW50KCBwcm9wb3NlZFBvc2l0aW9uICkgKSB7XHJcbiAgICAgICAgcG9pbnQucHJvcG9zZVZhbHVlKCBwcm9wb3NlZE51bWJlckxpbmVWYWx1ZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHBvaW50Lm51bWJlckxpbmUucmVtb3ZlUG9pbnQoIHBvaW50ICk7XHJcbiAgICAgICAgdGhpcy5kaXNzb2NpYXRlRnJvbU51bWJlckxpbmVQb2ludCggcG9pbnQgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBDaGVjayBpZiBhIHBvaW50IHNob3VsZCBiZSBjcmVhdGVkIGFuZCBhZGRlZCBiYXNlZCBvbiB0aGUgcHJvcG9zZWQgcG9zaXRpb24uXHJcbiAgICAgIGlmICggdGhpcy5sb2NraW5nQm91bmRzLmNvbnRhaW5zUG9pbnQoIHByb3Bvc2VkUG9zaXRpb24gKSApIHtcclxuICAgICAgICBjb25zdCBudW1iZXJMaW5lID0gdGhpcy5udW1iZXJMaW5lc1sgMCBdO1xyXG4gICAgICAgIGNvbnN0IGNvbnN0cmFpbmVkVmFsdWUgPSBudW1iZXJMaW5lLmdldENvbnN0cmFpbmVkVmFsdWUoIG51bWJlckxpbmUubW9kZWxQb3NpdGlvblRvVmFsdWUoIHByb3Bvc2VkUG9zaXRpb24gKSApO1xyXG4gICAgICAgIGNvbnN0IG51bWJlckxpbmVQb2ludCA9IG5ldyBOdW1iZXJMaW5lUG9pbnQoIG51bWJlckxpbmUsIHtcclxuICAgICAgICAgIGluaXRpYWxWYWx1ZTogY29uc3RyYWluZWRWYWx1ZSxcclxuICAgICAgICAgIGluaXRpYWxDb2xvcjogdGhpcy5jb2xvcixcclxuICAgICAgICAgIGNvbnRyb2xsZXI6IHRoaXNcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgbnVtYmVyTGluZS5hZGRQb2ludCggbnVtYmVyTGluZVBvaW50ICk7XHJcbiAgICAgICAgdGhpcy5hc3NvY2lhdGVXaXRoTnVtYmVyTGluZVBvaW50KCBudW1iZXJMaW5lUG9pbnQgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gSnVzdCBhY2NlcHQgdGhlIHByb3Bvc2VkIHBvc2l0aW9uLCBubyBvdGhlciBhY3Rpb24gaXMgbmVjZXNzYXJ5LlxyXG4gICAgICAgIHRoaXMuZ29Ub1Bvc2l0aW9uKCBwcm9wb3NlZFBvc2l0aW9uICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG59XHJcblxyXG5udW1iZXJMaW5lRGlzdGFuY2UucmVnaXN0ZXIoICdEaXN0YW5jZVBvaW50Q29udHJvbGxlcicsIERpc3RhbmNlUG9pbnRDb250cm9sbGVyICk7XHJcbmV4cG9ydCBkZWZhdWx0IERpc3RhbmNlUG9pbnRDb250cm9sbGVyO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FB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