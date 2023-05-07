// Copyright 2020-2022, University of Colorado Boulder

/**
 * Model for the 'Temperature' scene
 *
 * @author Saurabh Totey
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import SpatializedNumberLine from '../../../../number-line-common/js/common/model/SpatializedNumberLine.js';
import TemperatureToColorMapper from '../../../../number-line-common/js/explore/model/TemperatureToColorMapper.js';
import AbstractNLDBaseModel from '../../common/model/AbstractNLDBaseModel.js';
import NLDConstants from '../../common/NLDConstants.js';
import numberLineDistance from '../../numberLineDistance.js';
import AreaPointController from './AreaPointController.js';
import DropFromDirection from './DropFromDirection.js';

// constants
const TEMPERATURE_POINT_CONTROLLER_BOX_SCALE = 0.4;
class TemperatureSceneModel extends AbstractNLDBaseModel {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    // values empirically determined
    const numberLine = new SpatializedNumberLine(NLDConstants.NLD_LAYOUT_BOUNDS.center.plusXY(0, -75), {
      widthInModelSpace: NLDConstants.NLD_LAYOUT_BOUNDS.width - 250,
      heightInModelSpace: NLDConstants.NLD_LAYOUT_BOUNDS.height - 160,
      initialDisplayedRange: TemperatureSceneModel.TEMPERATURE_RANGE,
      labelsInitiallyVisible: true,
      tickMarksInitiallyVisible: true,
      preventOverlap: false
    });

    // y-values determined empirically
    const temperatureAreaBounds = new Bounds2(numberLine.valueToModelPosition(numberLine.displayedRangeProperty.value.min).x, 364, numberLine.valueToModelPosition(numberLine.displayedRangeProperty.value.max).x, 464);
    super(numberLine, new AreaPointController(DropFromDirection.TOP, temperatureAreaBounds, {
      numberLines: [numberLine],
      scaleInBox: TEMPERATURE_POINT_CONTROLLER_BOX_SCALE,
      color: '#693cc2'
    }), new AreaPointController(DropFromDirection.TOP, temperatureAreaBounds, {
      numberLines: [numberLine],
      scaleInBox: TEMPERATURE_POINT_CONTROLLER_BOX_SCALE,
      color: '#52c23c'
    }), tandem, {
      positionInBoxOffset: new Vector2(0, 20)
    } // empirically determined
    );

    // Listen to when a point controller is no longer being dragged and push the dragged point controller
    // vertically if there is an extant point controller at the same value that is close enough.
    const pushDistance = temperatureAreaBounds.height / 8;
    const makePointControllerGetPushedIfDraggedToSameValueAsOtherPointController = (pointController, otherPointController) => {
      pointController.isDraggingProperty.link(isDragging => {
        // Only push when the point controller is no longer being dragged and both point controllers are on the number
        // line at the same value.
        const areBothControllersOnNumberLineWithSameValue = this.pointValuesProperty.value[0] !== null && this.pointValuesProperty.value[1] !== null && this.pointValuesProperty.value[0] === this.pointValuesProperty.value[1];
        if (isDragging || !areBothControllersOnNumberLineWithSameValue) {
          return;
        }

        // Check whether to push up or down based on which side (top or bottom) has more space.
        const otherPointControllerYPosition = otherPointController.positionProperty.value.y;
        const pushDownYLocation = otherPointControllerYPosition + pushDistance;
        const pushUpYLocation = otherPointControllerYPosition - pushDistance;
        const shouldPushDown = Math.abs(otherPointControllerYPosition - temperatureAreaBounds.top) < Math.abs(otherPointControllerYPosition - temperatureAreaBounds.bottom);
        const pushYPosition = shouldPushDown ? pushDownYLocation : pushUpYLocation;

        // As long as the push is increasing the distance between the point controllers, push the point controller.
        if (Math.abs(pushYPosition - otherPointControllerYPosition) > Math.abs(pointController.positionProperty.value.y - otherPointControllerYPosition)) {
          pointController.positionProperty.value = new Vector2(pointController.positionProperty.value.x, pushYPosition);
        }
      });
    };
    makePointControllerGetPushedIfDraggedToSameValueAsOtherPointController(this.pointControllerOne, this.pointControllerTwo);
    makePointControllerGetPushedIfDraggedToSameValueAsOtherPointController(this.pointControllerTwo, this.pointControllerOne);

    // @public (read-only) {Bounds2} the bounds where point controllers can be
    this.temperatureAreaBounds = temperatureAreaBounds;

    // @public (read-only) {function(number):Color}
    this.temperatureToColorMapper = new TemperatureToColorMapper(TemperatureSceneModel.TEMPERATURE_RANGE);
  }
}
TemperatureSceneModel.TEMPERATURE_RANGE = new Range(-50, 50);
numberLineDistance.register('TemperatureSceneModel', TemperatureSceneModel);
export default TemperatureSceneModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiUmFuZ2UiLCJWZWN0b3IyIiwiU3BhdGlhbGl6ZWROdW1iZXJMaW5lIiwiVGVtcGVyYXR1cmVUb0NvbG9yTWFwcGVyIiwiQWJzdHJhY3ROTERCYXNlTW9kZWwiLCJOTERDb25zdGFudHMiLCJudW1iZXJMaW5lRGlzdGFuY2UiLCJBcmVhUG9pbnRDb250cm9sbGVyIiwiRHJvcEZyb21EaXJlY3Rpb24iLCJURU1QRVJBVFVSRV9QT0lOVF9DT05UUk9MTEVSX0JPWF9TQ0FMRSIsIlRlbXBlcmF0dXJlU2NlbmVNb2RlbCIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwibnVtYmVyTGluZSIsIk5MRF9MQVlPVVRfQk9VTkRTIiwiY2VudGVyIiwicGx1c1hZIiwid2lkdGhJbk1vZGVsU3BhY2UiLCJ3aWR0aCIsImhlaWdodEluTW9kZWxTcGFjZSIsImhlaWdodCIsImluaXRpYWxEaXNwbGF5ZWRSYW5nZSIsIlRFTVBFUkFUVVJFX1JBTkdFIiwibGFiZWxzSW5pdGlhbGx5VmlzaWJsZSIsInRpY2tNYXJrc0luaXRpYWxseVZpc2libGUiLCJwcmV2ZW50T3ZlcmxhcCIsInRlbXBlcmF0dXJlQXJlYUJvdW5kcyIsInZhbHVlVG9Nb2RlbFBvc2l0aW9uIiwiZGlzcGxheWVkUmFuZ2VQcm9wZXJ0eSIsInZhbHVlIiwibWluIiwieCIsIm1heCIsIlRPUCIsIm51bWJlckxpbmVzIiwic2NhbGVJbkJveCIsImNvbG9yIiwicG9zaXRpb25JbkJveE9mZnNldCIsInB1c2hEaXN0YW5jZSIsIm1ha2VQb2ludENvbnRyb2xsZXJHZXRQdXNoZWRJZkRyYWdnZWRUb1NhbWVWYWx1ZUFzT3RoZXJQb2ludENvbnRyb2xsZXIiLCJwb2ludENvbnRyb2xsZXIiLCJvdGhlclBvaW50Q29udHJvbGxlciIsImlzRHJhZ2dpbmdQcm9wZXJ0eSIsImxpbmsiLCJpc0RyYWdnaW5nIiwiYXJlQm90aENvbnRyb2xsZXJzT25OdW1iZXJMaW5lV2l0aFNhbWVWYWx1ZSIsInBvaW50VmFsdWVzUHJvcGVydHkiLCJvdGhlclBvaW50Q29udHJvbGxlcllQb3NpdGlvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJ5IiwicHVzaERvd25ZTG9jYXRpb24iLCJwdXNoVXBZTG9jYXRpb24iLCJzaG91bGRQdXNoRG93biIsIk1hdGgiLCJhYnMiLCJ0b3AiLCJib3R0b20iLCJwdXNoWVBvc2l0aW9uIiwicG9pbnRDb250cm9sbGVyT25lIiwicG9pbnRDb250cm9sbGVyVHdvIiwidGVtcGVyYXR1cmVUb0NvbG9yTWFwcGVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUZW1wZXJhdHVyZVNjZW5lTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgZm9yIHRoZSAnVGVtcGVyYXR1cmUnIHNjZW5lXHJcbiAqXHJcbiAqIEBhdXRob3IgU2F1cmFiaCBUb3RleVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFNwYXRpYWxpemVkTnVtYmVyTGluZSBmcm9tICcuLi8uLi8uLi8uLi9udW1iZXItbGluZS1jb21tb24vanMvY29tbW9uL21vZGVsL1NwYXRpYWxpemVkTnVtYmVyTGluZS5qcyc7XHJcbmltcG9ydCBUZW1wZXJhdHVyZVRvQ29sb3JNYXBwZXIgZnJvbSAnLi4vLi4vLi4vLi4vbnVtYmVyLWxpbmUtY29tbW9uL2pzL2V4cGxvcmUvbW9kZWwvVGVtcGVyYXR1cmVUb0NvbG9yTWFwcGVyLmpzJztcclxuaW1wb3J0IEFic3RyYWN0TkxEQmFzZU1vZGVsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9BYnN0cmFjdE5MREJhc2VNb2RlbC5qcyc7XHJcbmltcG9ydCBOTERDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL05MRENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBudW1iZXJMaW5lRGlzdGFuY2UgZnJvbSAnLi4vLi4vbnVtYmVyTGluZURpc3RhbmNlLmpzJztcclxuaW1wb3J0IEFyZWFQb2ludENvbnRyb2xsZXIgZnJvbSAnLi9BcmVhUG9pbnRDb250cm9sbGVyLmpzJztcclxuaW1wb3J0IERyb3BGcm9tRGlyZWN0aW9uIGZyb20gJy4vRHJvcEZyb21EaXJlY3Rpb24uanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRFTVBFUkFUVVJFX1BPSU5UX0NPTlRST0xMRVJfQk9YX1NDQUxFID0gMC40O1xyXG5cclxuY2xhc3MgVGVtcGVyYXR1cmVTY2VuZU1vZGVsIGV4dGVuZHMgQWJzdHJhY3ROTERCYXNlTW9kZWwge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRhbmRlbSApIHtcclxuXHJcbiAgICAvLyB2YWx1ZXMgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgY29uc3QgbnVtYmVyTGluZSA9IG5ldyBTcGF0aWFsaXplZE51bWJlckxpbmUoIE5MRENvbnN0YW50cy5OTERfTEFZT1VUX0JPVU5EUy5jZW50ZXIucGx1c1hZKCAwLCAtNzUgKSwge1xyXG4gICAgICB3aWR0aEluTW9kZWxTcGFjZTogTkxEQ29uc3RhbnRzLk5MRF9MQVlPVVRfQk9VTkRTLndpZHRoIC0gMjUwLFxyXG4gICAgICBoZWlnaHRJbk1vZGVsU3BhY2U6IE5MRENvbnN0YW50cy5OTERfTEFZT1VUX0JPVU5EUy5oZWlnaHQgLSAxNjAsXHJcbiAgICAgIGluaXRpYWxEaXNwbGF5ZWRSYW5nZTogVGVtcGVyYXR1cmVTY2VuZU1vZGVsLlRFTVBFUkFUVVJFX1JBTkdFLFxyXG4gICAgICBsYWJlbHNJbml0aWFsbHlWaXNpYmxlOiB0cnVlLFxyXG4gICAgICB0aWNrTWFya3NJbml0aWFsbHlWaXNpYmxlOiB0cnVlLFxyXG4gICAgICBwcmV2ZW50T3ZlcmxhcDogZmFsc2VcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB5LXZhbHVlcyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICBjb25zdCB0ZW1wZXJhdHVyZUFyZWFCb3VuZHMgPSBuZXcgQm91bmRzMihcclxuICAgICAgbnVtYmVyTGluZS52YWx1ZVRvTW9kZWxQb3NpdGlvbiggbnVtYmVyTGluZS5kaXNwbGF5ZWRSYW5nZVByb3BlcnR5LnZhbHVlLm1pbiApLngsIDM2NCxcclxuICAgICAgbnVtYmVyTGluZS52YWx1ZVRvTW9kZWxQb3NpdGlvbiggbnVtYmVyTGluZS5kaXNwbGF5ZWRSYW5nZVByb3BlcnR5LnZhbHVlLm1heCApLngsIDQ2NFxyXG4gICAgKTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgbnVtYmVyTGluZSxcclxuICAgICAgbmV3IEFyZWFQb2ludENvbnRyb2xsZXIoXHJcbiAgICAgICAgRHJvcEZyb21EaXJlY3Rpb24uVE9QLFxyXG4gICAgICAgIHRlbXBlcmF0dXJlQXJlYUJvdW5kcyxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBudW1iZXJMaW5lczogWyBudW1iZXJMaW5lIF0sXHJcbiAgICAgICAgICBzY2FsZUluQm94OiBURU1QRVJBVFVSRV9QT0lOVF9DT05UUk9MTEVSX0JPWF9TQ0FMRSxcclxuICAgICAgICAgIGNvbG9yOiAnIzY5M2NjMidcclxuICAgICAgICB9XHJcbiAgICAgICksXHJcbiAgICAgIG5ldyBBcmVhUG9pbnRDb250cm9sbGVyKFxyXG4gICAgICAgIERyb3BGcm9tRGlyZWN0aW9uLlRPUCxcclxuICAgICAgICB0ZW1wZXJhdHVyZUFyZWFCb3VuZHMsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbnVtYmVyTGluZXM6IFsgbnVtYmVyTGluZSBdLFxyXG4gICAgICAgICAgc2NhbGVJbkJveDogVEVNUEVSQVRVUkVfUE9JTlRfQ09OVFJPTExFUl9CT1hfU0NBTEUsXHJcbiAgICAgICAgICBjb2xvcjogJyM1MmMyM2MnXHJcbiAgICAgICAgfVxyXG4gICAgICApLFxyXG4gICAgICB0YW5kZW0sXHJcbiAgICAgIHsgcG9zaXRpb25JbkJveE9mZnNldDogbmV3IFZlY3RvcjIoIDAsIDIwICkgfSAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICApO1xyXG5cclxuICAgIC8vIExpc3RlbiB0byB3aGVuIGEgcG9pbnQgY29udHJvbGxlciBpcyBubyBsb25nZXIgYmVpbmcgZHJhZ2dlZCBhbmQgcHVzaCB0aGUgZHJhZ2dlZCBwb2ludCBjb250cm9sbGVyXHJcbiAgICAvLyB2ZXJ0aWNhbGx5IGlmIHRoZXJlIGlzIGFuIGV4dGFudCBwb2ludCBjb250cm9sbGVyIGF0IHRoZSBzYW1lIHZhbHVlIHRoYXQgaXMgY2xvc2UgZW5vdWdoLlxyXG4gICAgY29uc3QgcHVzaERpc3RhbmNlID0gdGVtcGVyYXR1cmVBcmVhQm91bmRzLmhlaWdodCAvIDg7XHJcbiAgICBjb25zdCBtYWtlUG9pbnRDb250cm9sbGVyR2V0UHVzaGVkSWZEcmFnZ2VkVG9TYW1lVmFsdWVBc090aGVyUG9pbnRDb250cm9sbGVyID0gKCBwb2ludENvbnRyb2xsZXIsIG90aGVyUG9pbnRDb250cm9sbGVyICkgPT4ge1xyXG4gICAgICBwb2ludENvbnRyb2xsZXIuaXNEcmFnZ2luZ1Byb3BlcnR5LmxpbmsoIGlzRHJhZ2dpbmcgPT4ge1xyXG5cclxuICAgICAgICAvLyBPbmx5IHB1c2ggd2hlbiB0aGUgcG9pbnQgY29udHJvbGxlciBpcyBubyBsb25nZXIgYmVpbmcgZHJhZ2dlZCBhbmQgYm90aCBwb2ludCBjb250cm9sbGVycyBhcmUgb24gdGhlIG51bWJlclxyXG4gICAgICAgIC8vIGxpbmUgYXQgdGhlIHNhbWUgdmFsdWUuXHJcbiAgICAgICAgY29uc3QgYXJlQm90aENvbnRyb2xsZXJzT25OdW1iZXJMaW5lV2l0aFNhbWVWYWx1ZSA9IHRoaXMucG9pbnRWYWx1ZXNQcm9wZXJ0eS52YWx1ZVsgMCBdICE9PSBudWxsICYmXHJcbiAgICAgICAgICB0aGlzLnBvaW50VmFsdWVzUHJvcGVydHkudmFsdWVbIDEgXSAhPT0gbnVsbCAmJlxyXG4gICAgICAgICAgdGhpcy5wb2ludFZhbHVlc1Byb3BlcnR5LnZhbHVlWyAwIF0gPT09IHRoaXMucG9pbnRWYWx1ZXNQcm9wZXJ0eS52YWx1ZVsgMSBdO1xyXG4gICAgICAgIGlmICggaXNEcmFnZ2luZyB8fCAhYXJlQm90aENvbnRyb2xsZXJzT25OdW1iZXJMaW5lV2l0aFNhbWVWYWx1ZSApIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENoZWNrIHdoZXRoZXIgdG8gcHVzaCB1cCBvciBkb3duIGJhc2VkIG9uIHdoaWNoIHNpZGUgKHRvcCBvciBib3R0b20pIGhhcyBtb3JlIHNwYWNlLlxyXG4gICAgICAgIGNvbnN0IG90aGVyUG9pbnRDb250cm9sbGVyWVBvc2l0aW9uID0gb3RoZXJQb2ludENvbnRyb2xsZXIucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55O1xyXG4gICAgICAgIGNvbnN0IHB1c2hEb3duWUxvY2F0aW9uID0gb3RoZXJQb2ludENvbnRyb2xsZXJZUG9zaXRpb24gKyBwdXNoRGlzdGFuY2U7XHJcbiAgICAgICAgY29uc3QgcHVzaFVwWUxvY2F0aW9uID0gb3RoZXJQb2ludENvbnRyb2xsZXJZUG9zaXRpb24gLSBwdXNoRGlzdGFuY2U7XHJcbiAgICAgICAgY29uc3Qgc2hvdWxkUHVzaERvd24gPSBNYXRoLmFicyggb3RoZXJQb2ludENvbnRyb2xsZXJZUG9zaXRpb24gLSB0ZW1wZXJhdHVyZUFyZWFCb3VuZHMudG9wICkgPFxyXG4gICAgICAgICAgTWF0aC5hYnMoIG90aGVyUG9pbnRDb250cm9sbGVyWVBvc2l0aW9uIC0gdGVtcGVyYXR1cmVBcmVhQm91bmRzLmJvdHRvbSApO1xyXG4gICAgICAgIGNvbnN0IHB1c2hZUG9zaXRpb24gPSBzaG91bGRQdXNoRG93biA/IHB1c2hEb3duWUxvY2F0aW9uIDogcHVzaFVwWUxvY2F0aW9uO1xyXG5cclxuICAgICAgICAvLyBBcyBsb25nIGFzIHRoZSBwdXNoIGlzIGluY3JlYXNpbmcgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIHBvaW50IGNvbnRyb2xsZXJzLCBwdXNoIHRoZSBwb2ludCBjb250cm9sbGVyLlxyXG4gICAgICAgIGlmICggTWF0aC5hYnMoIHB1c2hZUG9zaXRpb24gLSBvdGhlclBvaW50Q29udHJvbGxlcllQb3NpdGlvbiApID5cclxuICAgICAgICAgIE1hdGguYWJzKCBwb2ludENvbnRyb2xsZXIucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55IC0gb3RoZXJQb2ludENvbnRyb2xsZXJZUG9zaXRpb24gKSApIHtcclxuICAgICAgICAgIHBvaW50Q29udHJvbGxlci5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgICAgIHBvaW50Q29udHJvbGxlci5wb3NpdGlvblByb3BlcnR5LnZhbHVlLngsXHJcbiAgICAgICAgICAgIHB1c2hZUG9zaXRpb25cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9O1xyXG4gICAgbWFrZVBvaW50Q29udHJvbGxlckdldFB1c2hlZElmRHJhZ2dlZFRvU2FtZVZhbHVlQXNPdGhlclBvaW50Q29udHJvbGxlciggdGhpcy5wb2ludENvbnRyb2xsZXJPbmUsIHRoaXMucG9pbnRDb250cm9sbGVyVHdvICk7XHJcbiAgICBtYWtlUG9pbnRDb250cm9sbGVyR2V0UHVzaGVkSWZEcmFnZ2VkVG9TYW1lVmFsdWVBc090aGVyUG9pbnRDb250cm9sbGVyKCB0aGlzLnBvaW50Q29udHJvbGxlclR3bywgdGhpcy5wb2ludENvbnRyb2xsZXJPbmUgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtCb3VuZHMyfSB0aGUgYm91bmRzIHdoZXJlIHBvaW50IGNvbnRyb2xsZXJzIGNhbiBiZVxyXG4gICAgdGhpcy50ZW1wZXJhdHVyZUFyZWFCb3VuZHMgPSB0ZW1wZXJhdHVyZUFyZWFCb3VuZHM7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7ZnVuY3Rpb24obnVtYmVyKTpDb2xvcn1cclxuICAgIHRoaXMudGVtcGVyYXR1cmVUb0NvbG9yTWFwcGVyID0gbmV3IFRlbXBlcmF0dXJlVG9Db2xvck1hcHBlciggVGVtcGVyYXR1cmVTY2VuZU1vZGVsLlRFTVBFUkFUVVJFX1JBTkdFICk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuVGVtcGVyYXR1cmVTY2VuZU1vZGVsLlRFTVBFUkFUVVJFX1JBTkdFID0gbmV3IFJhbmdlKCAtNTAsIDUwICk7XHJcblxyXG5udW1iZXJMaW5lRGlzdGFuY2UucmVnaXN0ZXIoICdUZW1wZXJhdHVyZVNjZW5lTW9kZWwnLCBUZW1wZXJhdHVyZVNjZW5lTW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgVGVtcGVyYXR1cmVTY2VuZU1vZGVsO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MscUJBQXFCLE1BQU0seUVBQXlFO0FBQzNHLE9BQU9DLHdCQUF3QixNQUFNLDZFQUE2RTtBQUNsSCxPQUFPQyxvQkFBb0IsTUFBTSw0Q0FBNEM7QUFDN0UsT0FBT0MsWUFBWSxNQUFNLDhCQUE4QjtBQUN2RCxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MsbUJBQW1CLE1BQU0sMEJBQTBCO0FBQzFELE9BQU9DLGlCQUFpQixNQUFNLHdCQUF3Qjs7QUFFdEQ7QUFDQSxNQUFNQyxzQ0FBc0MsR0FBRyxHQUFHO0FBRWxELE1BQU1DLHFCQUFxQixTQUFTTixvQkFBb0IsQ0FBQztFQUV2RDtBQUNGO0FBQ0E7RUFDRU8sV0FB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