// Copyright 2019-2022, University of Colorado Boulder

/**
 * a point controller with some extensions that are specific to the "Elevation" scene
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import LockToNumberLine from '../../../../number-line-common/js/common/model/LockToNumberLine.js';
import NumberLinePoint from '../../../../number-line-common/js/common/model/NumberLinePoint.js';
import PointController from '../../../../number-line-common/js/common/model/PointController.js';
import merge from '../../../../phet-core/js/merge.js';
import numberLineIntegers from '../../numberLineIntegers.js';
class ElevationPointController extends PointController {
  /**
   * @param {NumberLine} numberLine - the number line on which this controller will be moving points
   * @param {Bounds2} elevationAreaBounds
   * @param {Object} [options]
   * @public
   */
  constructor(numberLine, elevationAreaBounds, options) {
    options = merge({
      // This style of point controller never locks to the number line.
      lockToNumberLine: LockToNumberLine.NEVER,
      numberLines: [numberLine]
    }, options);
    super(options);

    // @private {Bounds2}
    this.elevationsAreaBounds = elevationAreaBounds;

    // @public (read-only) property that tracks whether this point controller is in the area where it should be controlling a point
    this.overElevationAreaProperty = new BooleanProperty(false);

    // These point controllers are never disposed, so no unlinking is needed.
    this.positionProperty.link(position => {
      this.overElevationAreaProperty.value = elevationAreaBounds.containsPoint(position);
    });

    // Create/remove number line points based on whether we're over the elevation area.
    this.overElevationAreaProperty.lazyLink(over => {
      if (over && this.isDraggingProperty.value) {
        // state checking
        assert && assert(!this.isControllingNumberLinePoint(), 'should not already have a point');

        // Create a new point on the number line.
        const numberLinePoint = new NumberLinePoint(numberLine, {
          initialValue: Utils.roundSymmetric(numberLine.modelPositionToValue(this.positionProperty.value)),
          initialColor: this.color,
          controller: this
        });
        numberLine.addPoint(numberLinePoint);
        this.associateWithNumberLinePoint(numberLinePoint);
      } else if (!over && this.isControllingNumberLinePoint()) {
        // Remove our point(s) from the number line and disassociate from them.
        this.removeClearAndDisposePoints();
      }
    });
  }

  /**
   * Do essentially what the base class does, but then allow any X direction motion.
   * @param {Vector2} proposedPosition
   * @override - see base class for more information
   * @public
   */
  proposePosition(proposedPosition) {
    if (this.isControllingNumberLinePoint() && !this.elevationsAreaBounds.containsPoint(proposedPosition)) {
      // The user has dragged the controller outside of the elevation bounds, so allow the motion.  Listeners in
      // other places will remove the point from the number line.
      this.positionProperty.value = proposedPosition;
    } else {
      super.proposePosition(proposedPosition);
    }
  }
}
numberLineIntegers.register('ElevationPointController', ElevationPointController);
export default ElevationPointController;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJVdGlscyIsIkxvY2tUb051bWJlckxpbmUiLCJOdW1iZXJMaW5lUG9pbnQiLCJQb2ludENvbnRyb2xsZXIiLCJtZXJnZSIsIm51bWJlckxpbmVJbnRlZ2VycyIsIkVsZXZhdGlvblBvaW50Q29udHJvbGxlciIsImNvbnN0cnVjdG9yIiwibnVtYmVyTGluZSIsImVsZXZhdGlvbkFyZWFCb3VuZHMiLCJvcHRpb25zIiwibG9ja1RvTnVtYmVyTGluZSIsIk5FVkVSIiwibnVtYmVyTGluZXMiLCJlbGV2YXRpb25zQXJlYUJvdW5kcyIsIm92ZXJFbGV2YXRpb25BcmVhUHJvcGVydHkiLCJwb3NpdGlvblByb3BlcnR5IiwibGluayIsInBvc2l0aW9uIiwidmFsdWUiLCJjb250YWluc1BvaW50IiwibGF6eUxpbmsiLCJvdmVyIiwiaXNEcmFnZ2luZ1Byb3BlcnR5IiwiYXNzZXJ0IiwiaXNDb250cm9sbGluZ051bWJlckxpbmVQb2ludCIsIm51bWJlckxpbmVQb2ludCIsImluaXRpYWxWYWx1ZSIsInJvdW5kU3ltbWV0cmljIiwibW9kZWxQb3NpdGlvblRvVmFsdWUiLCJpbml0aWFsQ29sb3IiLCJjb2xvciIsImNvbnRyb2xsZXIiLCJhZGRQb2ludCIsImFzc29jaWF0ZVdpdGhOdW1iZXJMaW5lUG9pbnQiLCJyZW1vdmVDbGVhckFuZERpc3Bvc2VQb2ludHMiLCJwcm9wb3NlUG9zaXRpb24iLCJwcm9wb3NlZFBvc2l0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFbGV2YXRpb25Qb2ludENvbnRyb2xsZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogYSBwb2ludCBjb250cm9sbGVyIHdpdGggc29tZSBleHRlbnNpb25zIHRoYXQgYXJlIHNwZWNpZmljIHRvIHRoZSBcIkVsZXZhdGlvblwiIHNjZW5lXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgTG9ja1RvTnVtYmVyTGluZSBmcm9tICcuLi8uLi8uLi8uLi9udW1iZXItbGluZS1jb21tb24vanMvY29tbW9uL21vZGVsL0xvY2tUb051bWJlckxpbmUuanMnO1xyXG5pbXBvcnQgTnVtYmVyTGluZVBvaW50IGZyb20gJy4uLy4uLy4uLy4uL251bWJlci1saW5lLWNvbW1vbi9qcy9jb21tb24vbW9kZWwvTnVtYmVyTGluZVBvaW50LmpzJztcclxuaW1wb3J0IFBvaW50Q29udHJvbGxlciBmcm9tICcuLi8uLi8uLi8uLi9udW1iZXItbGluZS1jb21tb24vanMvY29tbW9uL21vZGVsL1BvaW50Q29udHJvbGxlci5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgbnVtYmVyTGluZUludGVnZXJzIGZyb20gJy4uLy4uL251bWJlckxpbmVJbnRlZ2Vycy5qcyc7XHJcblxyXG5jbGFzcyBFbGV2YXRpb25Qb2ludENvbnRyb2xsZXIgZXh0ZW5kcyBQb2ludENvbnRyb2xsZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge051bWJlckxpbmV9IG51bWJlckxpbmUgLSB0aGUgbnVtYmVyIGxpbmUgb24gd2hpY2ggdGhpcyBjb250cm9sbGVyIHdpbGwgYmUgbW92aW5nIHBvaW50c1xyXG4gICAqIEBwYXJhbSB7Qm91bmRzMn0gZWxldmF0aW9uQXJlYUJvdW5kc1xyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG51bWJlckxpbmUsIGVsZXZhdGlvbkFyZWFCb3VuZHMsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBUaGlzIHN0eWxlIG9mIHBvaW50IGNvbnRyb2xsZXIgbmV2ZXIgbG9ja3MgdG8gdGhlIG51bWJlciBsaW5lLlxyXG4gICAgICBsb2NrVG9OdW1iZXJMaW5lOiBMb2NrVG9OdW1iZXJMaW5lLk5FVkVSLFxyXG5cclxuICAgICAgbnVtYmVyTGluZXM6IFsgbnVtYmVyTGluZSBdXHJcblxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0JvdW5kczJ9XHJcbiAgICB0aGlzLmVsZXZhdGlvbnNBcmVhQm91bmRzID0gZWxldmF0aW9uQXJlYUJvdW5kcztcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHByb3BlcnR5IHRoYXQgdHJhY2tzIHdoZXRoZXIgdGhpcyBwb2ludCBjb250cm9sbGVyIGlzIGluIHRoZSBhcmVhIHdoZXJlIGl0IHNob3VsZCBiZSBjb250cm9sbGluZyBhIHBvaW50XHJcbiAgICB0aGlzLm92ZXJFbGV2YXRpb25BcmVhUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIFRoZXNlIHBvaW50IGNvbnRyb2xsZXJzIGFyZSBuZXZlciBkaXNwb3NlZCwgc28gbm8gdW5saW5raW5nIGlzIG5lZWRlZC5cclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBwb3NpdGlvbiA9PiB7XHJcbiAgICAgIHRoaXMub3ZlckVsZXZhdGlvbkFyZWFQcm9wZXJ0eS52YWx1ZSA9IGVsZXZhdGlvbkFyZWFCb3VuZHMuY29udGFpbnNQb2ludCggcG9zaXRpb24gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUvcmVtb3ZlIG51bWJlciBsaW5lIHBvaW50cyBiYXNlZCBvbiB3aGV0aGVyIHdlJ3JlIG92ZXIgdGhlIGVsZXZhdGlvbiBhcmVhLlxyXG4gICAgdGhpcy5vdmVyRWxldmF0aW9uQXJlYVByb3BlcnR5LmxhenlMaW5rKCBvdmVyID0+IHtcclxuICAgICAgaWYgKCBvdmVyICYmIHRoaXMuaXNEcmFnZ2luZ1Byb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgICAvLyBzdGF0ZSBjaGVja2luZ1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzQ29udHJvbGxpbmdOdW1iZXJMaW5lUG9pbnQoKSwgJ3Nob3VsZCBub3QgYWxyZWFkeSBoYXZlIGEgcG9pbnQnICk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhIG5ldyBwb2ludCBvbiB0aGUgbnVtYmVyIGxpbmUuXHJcbiAgICAgICAgY29uc3QgbnVtYmVyTGluZVBvaW50ID0gbmV3IE51bWJlckxpbmVQb2ludCggbnVtYmVyTGluZSwge1xyXG4gICAgICAgICAgaW5pdGlhbFZhbHVlOiBVdGlscy5yb3VuZFN5bW1ldHJpYyggbnVtYmVyTGluZS5tb2RlbFBvc2l0aW9uVG9WYWx1ZSggdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlICkgKSxcclxuICAgICAgICAgIGluaXRpYWxDb2xvcjogdGhpcy5jb2xvcixcclxuICAgICAgICAgIGNvbnRyb2xsZXI6IHRoaXNcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgbnVtYmVyTGluZS5hZGRQb2ludCggbnVtYmVyTGluZVBvaW50ICk7XHJcbiAgICAgICAgdGhpcy5hc3NvY2lhdGVXaXRoTnVtYmVyTGluZVBvaW50KCBudW1iZXJMaW5lUG9pbnQgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggIW92ZXIgJiYgdGhpcy5pc0NvbnRyb2xsaW5nTnVtYmVyTGluZVBvaW50KCkgKSB7XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBvdXIgcG9pbnQocykgZnJvbSB0aGUgbnVtYmVyIGxpbmUgYW5kIGRpc2Fzc29jaWF0ZSBmcm9tIHRoZW0uXHJcbiAgICAgICAgdGhpcy5yZW1vdmVDbGVhckFuZERpc3Bvc2VQb2ludHMoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRG8gZXNzZW50aWFsbHkgd2hhdCB0aGUgYmFzZSBjbGFzcyBkb2VzLCBidXQgdGhlbiBhbGxvdyBhbnkgWCBkaXJlY3Rpb24gbW90aW9uLlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcHJvcG9zZWRQb3NpdGlvblxyXG4gICAqIEBvdmVycmlkZSAtIHNlZSBiYXNlIGNsYXNzIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHByb3Bvc2VQb3NpdGlvbiggcHJvcG9zZWRQb3NpdGlvbiApIHtcclxuXHJcbiAgICBpZiAoIHRoaXMuaXNDb250cm9sbGluZ051bWJlckxpbmVQb2ludCgpICYmICF0aGlzLmVsZXZhdGlvbnNBcmVhQm91bmRzLmNvbnRhaW5zUG9pbnQoIHByb3Bvc2VkUG9zaXRpb24gKSApIHtcclxuXHJcbiAgICAgIC8vIFRoZSB1c2VyIGhhcyBkcmFnZ2VkIHRoZSBjb250cm9sbGVyIG91dHNpZGUgb2YgdGhlIGVsZXZhdGlvbiBib3VuZHMsIHNvIGFsbG93IHRoZSBtb3Rpb24uICBMaXN0ZW5lcnMgaW5cclxuICAgICAgLy8gb3RoZXIgcGxhY2VzIHdpbGwgcmVtb3ZlIHRoZSBwb2ludCBmcm9tIHRoZSBudW1iZXIgbGluZS5cclxuICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gcHJvcG9zZWRQb3NpdGlvbjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBzdXBlci5wcm9wb3NlUG9zaXRpb24oIHByb3Bvc2VkUG9zaXRpb24gKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcblxyXG5udW1iZXJMaW5lSW50ZWdlcnMucmVnaXN0ZXIoICdFbGV2YXRpb25Qb2ludENvbnRyb2xsZXInLCBFbGV2YXRpb25Qb2ludENvbnRyb2xsZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgRWxldmF0aW9uUG9pbnRDb250cm9sbGVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsZ0JBQWdCLE1BQU0sb0VBQW9FO0FBQ2pHLE9BQU9DLGVBQWUsTUFBTSxtRUFBbUU7QUFDL0YsT0FBT0MsZUFBZSxNQUFNLG1FQUFtRTtBQUMvRixPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUU1RCxNQUFNQyx3QkFBd0IsU0FBU0gsZUFBZSxDQUFDO0VBRXJEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxXQUFXQSxDQUFFQyxVQUFVLEVBQUVDLG1CQUFtQixFQUFFQyxPQUFPLEVBQUc7SUFFdERBLE9BQU8sR0FBR04sS0FBSyxDQUFFO01BRWY7TUFDQU8sZ0JBQWdCLEVBQUVWLGdCQUFnQixDQUFDVyxLQUFLO01BRXhDQyxXQUFXLEVBQUUsQ0FBRUwsVUFBVTtJQUUzQixDQUFDLEVBQUVFLE9BQVEsQ0FBQztJQUVaLEtBQUssQ0FBRUEsT0FBUSxDQUFDOztJQUVoQjtJQUNBLElBQUksQ0FBQ0ksb0JBQW9CLEdBQUdMLG1CQUFtQjs7SUFFL0M7SUFDQSxJQUFJLENBQUNNLHlCQUF5QixHQUFHLElBQUloQixlQUFlLENBQUUsS0FBTSxDQUFDOztJQUU3RDtJQUNBLElBQUksQ0FBQ2lCLGdCQUFnQixDQUFDQyxJQUFJLENBQUVDLFFBQVEsSUFBSTtNQUN0QyxJQUFJLENBQUNILHlCQUF5QixDQUFDSSxLQUFLLEdBQUdWLG1CQUFtQixDQUFDVyxhQUFhLENBQUVGLFFBQVMsQ0FBQztJQUN0RixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNILHlCQUF5QixDQUFDTSxRQUFRLENBQUVDLElBQUksSUFBSTtNQUMvQyxJQUFLQSxJQUFJLElBQUksSUFBSSxDQUFDQyxrQkFBa0IsQ0FBQ0osS0FBSyxFQUFHO1FBRTNDO1FBQ0FLLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUMsSUFBSSxDQUFDQyw0QkFBNEIsQ0FBQyxDQUFDLEVBQUUsaUNBQWtDLENBQUM7O1FBRTNGO1FBQ0EsTUFBTUMsZUFBZSxHQUFHLElBQUl4QixlQUFlLENBQUVNLFVBQVUsRUFBRTtVQUN2RG1CLFlBQVksRUFBRTNCLEtBQUssQ0FBQzRCLGNBQWMsQ0FBRXBCLFVBQVUsQ0FBQ3FCLG9CQUFvQixDQUFFLElBQUksQ0FBQ2IsZ0JBQWdCLENBQUNHLEtBQU0sQ0FBRSxDQUFDO1VBQ3BHVyxZQUFZLEVBQUUsSUFBSSxDQUFDQyxLQUFLO1VBQ3hCQyxVQUFVLEVBQUU7UUFDZCxDQUFFLENBQUM7UUFDSHhCLFVBQVUsQ0FBQ3lCLFFBQVEsQ0FBRVAsZUFBZ0IsQ0FBQztRQUN0QyxJQUFJLENBQUNRLDRCQUE0QixDQUFFUixlQUFnQixDQUFDO01BQ3RELENBQUMsTUFDSSxJQUFLLENBQUNKLElBQUksSUFBSSxJQUFJLENBQUNHLDRCQUE0QixDQUFDLENBQUMsRUFBRztRQUV2RDtRQUNBLElBQUksQ0FBQ1UsMkJBQTJCLENBQUMsQ0FBQztNQUNwQztJQUNGLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxlQUFlQSxDQUFFQyxnQkFBZ0IsRUFBRztJQUVsQyxJQUFLLElBQUksQ0FBQ1osNEJBQTRCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDWCxvQkFBb0IsQ0FBQ00sYUFBYSxDQUFFaUIsZ0JBQWlCLENBQUMsRUFBRztNQUV6RztNQUNBO01BQ0EsSUFBSSxDQUFDckIsZ0JBQWdCLENBQUNHLEtBQUssR0FBR2tCLGdCQUFnQjtJQUNoRCxDQUFDLE1BQ0k7TUFDSCxLQUFLLENBQUNELGVBQWUsQ0FBRUMsZ0JBQWlCLENBQUM7SUFDM0M7RUFDRjtBQUNGO0FBR0FoQyxrQkFBa0IsQ0FBQ2lDLFFBQVEsQ0FBRSwwQkFBMEIsRUFBRWhDLHdCQUF5QixDQUFDO0FBQ25GLGVBQWVBLHdCQUF3QiJ9