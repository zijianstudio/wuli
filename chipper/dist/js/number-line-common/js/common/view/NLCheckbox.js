// Copyright 2020-2022, University of Colorado Boulder

/**
 * NLCheckbox is a text-only checkbox that is used throughout the number-line suite of sims for consistency.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import numberLineCommon from '../../numberLineCommon.js';

// constants
const BOX_WIDTH = 17;
const TOUCH_AREA_DILATION = 5;
class NLCheckbox extends Checkbox {
  /**
   * @param {BooleanProperty} property - Property that will be controlled by the checkbox
   * @param {string} contentString - the string that will be used as the label for the checkbox
   * @param {Object} [options]
   */
  constructor(property, contentString, options) {
    options = merge({
      boxWidth: BOX_WIDTH,
      // passed through to the text label
      textOptions: {
        font: new PhetFont(16),
        maxWidth: 200
      }
    }, options);
    const content = new Text(contentString, options.textOptions);
    super(property, content, options);
    this.touchArea = this.localBounds.dilated(TOUCH_AREA_DILATION);
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'NLCheckbox does not support dispose');
  }
}
numberLineCommon.register('NLCheckbox', NLCheckbox);
export default NLCheckbox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlBoZXRGb250IiwiVGV4dCIsIkNoZWNrYm94IiwibnVtYmVyTGluZUNvbW1vbiIsIkJPWF9XSURUSCIsIlRPVUNIX0FSRUFfRElMQVRJT04iLCJOTENoZWNrYm94IiwiY29uc3RydWN0b3IiLCJwcm9wZXJ0eSIsImNvbnRlbnRTdHJpbmciLCJvcHRpb25zIiwiYm94V2lkdGgiLCJ0ZXh0T3B0aW9ucyIsImZvbnQiLCJtYXhXaWR0aCIsImNvbnRlbnQiLCJ0b3VjaEFyZWEiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWQiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOTENoZWNrYm94LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE5MQ2hlY2tib3ggaXMgYSB0ZXh0LW9ubHkgY2hlY2tib3ggdGhhdCBpcyB1c2VkIHRocm91Z2hvdXQgdGhlIG51bWJlci1saW5lIHN1aXRlIG9mIHNpbXMgZm9yIGNvbnNpc3RlbmN5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDaGVja2JveCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgbnVtYmVyTGluZUNvbW1vbiBmcm9tICcuLi8uLi9udW1iZXJMaW5lQ29tbW9uLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBCT1hfV0lEVEggPSAxNztcclxuY29uc3QgVE9VQ0hfQVJFQV9ESUxBVElPTiA9IDU7XHJcblxyXG5jbGFzcyBOTENoZWNrYm94IGV4dGVuZHMgQ2hlY2tib3gge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW5Qcm9wZXJ0eX0gcHJvcGVydHkgLSBQcm9wZXJ0eSB0aGF0IHdpbGwgYmUgY29udHJvbGxlZCBieSB0aGUgY2hlY2tib3hcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGVudFN0cmluZyAtIHRoZSBzdHJpbmcgdGhhdCB3aWxsIGJlIHVzZWQgYXMgdGhlIGxhYmVsIGZvciB0aGUgY2hlY2tib3hcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHByb3BlcnR5LCBjb250ZW50U3RyaW5nLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBib3hXaWR0aDogQk9YX1dJRFRILFxyXG5cclxuICAgICAgLy8gcGFzc2VkIHRocm91Z2ggdG8gdGhlIHRleHQgbGFiZWxcclxuICAgICAgdGV4dE9wdGlvbnM6IHtcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE2ICksXHJcbiAgICAgICAgbWF4V2lkdGg6IDIwMFxyXG4gICAgICB9XHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBUZXh0KCBjb250ZW50U3RyaW5nLCBvcHRpb25zLnRleHRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIHByb3BlcnR5LCBjb250ZW50LCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy50b3VjaEFyZWEgPSB0aGlzLmxvY2FsQm91bmRzLmRpbGF0ZWQoIFRPVUNIX0FSRUFfRElMQVRJT04gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdOTENoZWNrYm94IGRvZXMgbm90IHN1cHBvcnQgZGlzcG9zZScgKTtcclxuICB9XHJcbn1cclxuXHJcbm51bWJlckxpbmVDb21tb24ucmVnaXN0ZXIoICdOTENoZWNrYm94JywgTkxDaGVja2JveCApO1xyXG5leHBvcnQgZGVmYXVsdCBOTENoZWNrYm94OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxRQUFRLG1DQUFtQztBQUN4RCxPQUFPQyxRQUFRLE1BQU0sZ0NBQWdDO0FBQ3JELE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjs7QUFFeEQ7QUFDQSxNQUFNQyxTQUFTLEdBQUcsRUFBRTtBQUNwQixNQUFNQyxtQkFBbUIsR0FBRyxDQUFDO0FBRTdCLE1BQU1DLFVBQVUsU0FBU0osUUFBUSxDQUFDO0VBRWhDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUssV0FBV0EsQ0FBRUMsUUFBUSxFQUFFQyxhQUFhLEVBQUVDLE9BQU8sRUFBRztJQUU5Q0EsT0FBTyxHQUFHWCxLQUFLLENBQUU7TUFDZlksUUFBUSxFQUFFUCxTQUFTO01BRW5CO01BQ0FRLFdBQVcsRUFBRTtRQUNYQyxJQUFJLEVBQUUsSUFBSWIsUUFBUSxDQUFFLEVBQUcsQ0FBQztRQUN4QmMsUUFBUSxFQUFFO01BQ1o7SUFDRixDQUFDLEVBQUVKLE9BQVEsQ0FBQztJQUVaLE1BQU1LLE9BQU8sR0FBRyxJQUFJZCxJQUFJLENBQUVRLGFBQWEsRUFBRUMsT0FBTyxDQUFDRSxXQUFZLENBQUM7SUFFOUQsS0FBSyxDQUFFSixRQUFRLEVBQUVPLE9BQU8sRUFBRUwsT0FBUSxDQUFDO0lBRW5DLElBQUksQ0FBQ00sU0FBUyxHQUFHLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxPQUFPLENBQUViLG1CQUFvQixDQUFDO0VBQ2xFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VjLE9BQU9BLENBQUEsRUFBRztJQUNSQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUscUNBQXNDLENBQUM7RUFDbEU7QUFDRjtBQUVBakIsZ0JBQWdCLENBQUNrQixRQUFRLENBQUUsWUFBWSxFQUFFZixVQUFXLENBQUM7QUFDckQsZUFBZUEsVUFBVSJ9