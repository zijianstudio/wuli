// Copyright 2019-2023, University of Colorado Boulder

/**
 * SumCheckbox is the checkbox labeled 'Sum', used to control visibility of a sum vector.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import { HBox, Text } from '../../../../scenery/js/imports.js';
import vectorAddition from '../../vectorAddition.js';
import VectorAdditionStrings from '../../VectorAdditionStrings.js';
import VectorColorPalette from '../model/VectorColorPalette.js';
import VectorAdditionConstants from '../VectorAdditionConstants.js';
import VectorAdditionCheckbox from './VectorAdditionCheckbox.js';
import VectorAdditionIconFactory from './VectorAdditionIconFactory.js';
export default class SumCheckbox extends VectorAdditionCheckbox {
  /**
   * @param {BooleanProperty} sumVisibleProperty
   * @param {VectorColorPalette} vectorColorPalette
   * @param {Object} [options]
   */
  constructor(sumVisibleProperty, vectorColorPalette, options) {
    // Type check arguments
    assert && assert(sumVisibleProperty instanceof BooleanProperty, `invalid sumVisibleProperty: ${sumVisibleProperty}`);
    assert && assert(vectorColorPalette instanceof VectorColorPalette, `invalid vectorColorPalette: ${vectorColorPalette}`);
    const textNode = new Text(VectorAdditionStrings.sum, {
      font: VectorAdditionConstants.CHECKBOX_FONT,
      maxWidth: 75 // determined empirically
    });

    const icon = VectorAdditionIconFactory.createVectorIcon({
      fill: vectorColorPalette.sumFill,
      stroke: vectorColorPalette.sumStroke,
      length: 35
    });
    const content = new HBox({
      spacing: VectorAdditionConstants.CHECKBOX_ICON_SPACING,
      children: [textNode, icon]
    });
    super(sumVisibleProperty, content, options);
  }
}
vectorAddition.register('SumCheckbox', SumCheckbox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJIQm94IiwiVGV4dCIsInZlY3RvckFkZGl0aW9uIiwiVmVjdG9yQWRkaXRpb25TdHJpbmdzIiwiVmVjdG9yQ29sb3JQYWxldHRlIiwiVmVjdG9yQWRkaXRpb25Db25zdGFudHMiLCJWZWN0b3JBZGRpdGlvbkNoZWNrYm94IiwiVmVjdG9yQWRkaXRpb25JY29uRmFjdG9yeSIsIlN1bUNoZWNrYm94IiwiY29uc3RydWN0b3IiLCJzdW1WaXNpYmxlUHJvcGVydHkiLCJ2ZWN0b3JDb2xvclBhbGV0dGUiLCJvcHRpb25zIiwiYXNzZXJ0IiwidGV4dE5vZGUiLCJzdW0iLCJmb250IiwiQ0hFQ0tCT1hfRk9OVCIsIm1heFdpZHRoIiwiaWNvbiIsImNyZWF0ZVZlY3Rvckljb24iLCJmaWxsIiwic3VtRmlsbCIsInN0cm9rZSIsInN1bVN0cm9rZSIsImxlbmd0aCIsImNvbnRlbnQiLCJzcGFjaW5nIiwiQ0hFQ0tCT1hfSUNPTl9TUEFDSU5HIiwiY2hpbGRyZW4iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN1bUNoZWNrYm94LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFN1bUNoZWNrYm94IGlzIHRoZSBjaGVja2JveCBsYWJlbGVkICdTdW0nLCB1c2VkIHRvIGNvbnRyb2wgdmlzaWJpbGl0eSBvZiBhIHN1bSB2ZWN0b3IuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHZlY3RvckFkZGl0aW9uIGZyb20gJy4uLy4uL3ZlY3RvckFkZGl0aW9uLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uU3RyaW5ncyBmcm9tICcuLi8uLi9WZWN0b3JBZGRpdGlvblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgVmVjdG9yQ29sb3JQYWxldHRlIGZyb20gJy4uL21vZGVsL1ZlY3RvckNvbG9yUGFsZXR0ZS5qcyc7XHJcbmltcG9ydCBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cyBmcm9tICcuLi9WZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBWZWN0b3JBZGRpdGlvbkNoZWNrYm94IGZyb20gJy4vVmVjdG9yQWRkaXRpb25DaGVja2JveC5qcyc7XHJcbmltcG9ydCBWZWN0b3JBZGRpdGlvbkljb25GYWN0b3J5IGZyb20gJy4vVmVjdG9yQWRkaXRpb25JY29uRmFjdG9yeS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdW1DaGVja2JveCBleHRlbmRzIFZlY3RvckFkZGl0aW9uQ2hlY2tib3gge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW5Qcm9wZXJ0eX0gc3VtVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtWZWN0b3JDb2xvclBhbGV0dGV9IHZlY3RvckNvbG9yUGFsZXR0ZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc3VtVmlzaWJsZVByb3BlcnR5LCB2ZWN0b3JDb2xvclBhbGV0dGUsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gVHlwZSBjaGVjayBhcmd1bWVudHNcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHN1bVZpc2libGVQcm9wZXJ0eSBpbnN0YW5jZW9mIEJvb2xlYW5Qcm9wZXJ0eSwgYGludmFsaWQgc3VtVmlzaWJsZVByb3BlcnR5OiAke3N1bVZpc2libGVQcm9wZXJ0eX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZWN0b3JDb2xvclBhbGV0dGUgaW5zdGFuY2VvZiBWZWN0b3JDb2xvclBhbGV0dGUsIGBpbnZhbGlkIHZlY3RvckNvbG9yUGFsZXR0ZTogJHt2ZWN0b3JDb2xvclBhbGV0dGV9YCApO1xyXG5cclxuICAgIGNvbnN0IHRleHROb2RlID0gbmV3IFRleHQoIFZlY3RvckFkZGl0aW9uU3RyaW5ncy5zdW0sIHtcclxuICAgICAgZm9udDogVmVjdG9yQWRkaXRpb25Db25zdGFudHMuQ0hFQ0tCT1hfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDc1IC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBpY29uID0gVmVjdG9yQWRkaXRpb25JY29uRmFjdG9yeS5jcmVhdGVWZWN0b3JJY29uKCB7XHJcbiAgICAgIGZpbGw6IHZlY3RvckNvbG9yUGFsZXR0ZS5zdW1GaWxsLFxyXG4gICAgICBzdHJva2U6IHZlY3RvckNvbG9yUGFsZXR0ZS5zdW1TdHJva2UsXHJcbiAgICAgIGxlbmd0aDogMzVcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IEhCb3goIHtcclxuICAgICAgc3BhY2luZzogVmVjdG9yQWRkaXRpb25Db25zdGFudHMuQ0hFQ0tCT1hfSUNPTl9TUEFDSU5HLFxyXG4gICAgICBjaGlsZHJlbjogWyB0ZXh0Tm9kZSwgaWNvbiBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIHN1bVZpc2libGVQcm9wZXJ0eSwgY29udGVudCwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxudmVjdG9yQWRkaXRpb24ucmVnaXN0ZXIoICdTdW1DaGVja2JveCcsIFN1bUNoZWNrYm94ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlELE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBQ2xFLE9BQU9DLGtCQUFrQixNQUFNLGdDQUFnQztBQUMvRCxPQUFPQyx1QkFBdUIsTUFBTSwrQkFBK0I7QUFDbkUsT0FBT0Msc0JBQXNCLE1BQU0sNkJBQTZCO0FBQ2hFLE9BQU9DLHlCQUF5QixNQUFNLGdDQUFnQztBQUV0RSxlQUFlLE1BQU1DLFdBQVcsU0FBU0Ysc0JBQXNCLENBQUM7RUFFOUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxrQkFBa0IsRUFBRUMsa0JBQWtCLEVBQUVDLE9BQU8sRUFBRztJQUU3RDtJQUNBQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUgsa0JBQWtCLFlBQVlYLGVBQWUsRUFBRywrQkFBOEJXLGtCQUFtQixFQUFFLENBQUM7SUFDdEhHLE1BQU0sSUFBSUEsTUFBTSxDQUFFRixrQkFBa0IsWUFBWVAsa0JBQWtCLEVBQUcsK0JBQThCTyxrQkFBbUIsRUFBRSxDQUFDO0lBRXpILE1BQU1HLFFBQVEsR0FBRyxJQUFJYixJQUFJLENBQUVFLHFCQUFxQixDQUFDWSxHQUFHLEVBQUU7TUFDcERDLElBQUksRUFBRVgsdUJBQXVCLENBQUNZLGFBQWE7TUFDM0NDLFFBQVEsRUFBRSxFQUFFLENBQUM7SUFDZixDQUFFLENBQUM7O0lBRUgsTUFBTUMsSUFBSSxHQUFHWix5QkFBeUIsQ0FBQ2EsZ0JBQWdCLENBQUU7TUFDdkRDLElBQUksRUFBRVYsa0JBQWtCLENBQUNXLE9BQU87TUFDaENDLE1BQU0sRUFBRVosa0JBQWtCLENBQUNhLFNBQVM7TUFDcENDLE1BQU0sRUFBRTtJQUNWLENBQUUsQ0FBQztJQUVILE1BQU1DLE9BQU8sR0FBRyxJQUFJMUIsSUFBSSxDQUFFO01BQ3hCMkIsT0FBTyxFQUFFdEIsdUJBQXVCLENBQUN1QixxQkFBcUI7TUFDdERDLFFBQVEsRUFBRSxDQUFFZixRQUFRLEVBQUVLLElBQUk7SUFDNUIsQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFVCxrQkFBa0IsRUFBRWdCLE9BQU8sRUFBRWQsT0FBUSxDQUFDO0VBQy9DO0FBQ0Y7QUFFQVYsY0FBYyxDQUFDNEIsUUFBUSxDQUFFLGFBQWEsRUFBRXRCLFdBQVksQ0FBQyJ9