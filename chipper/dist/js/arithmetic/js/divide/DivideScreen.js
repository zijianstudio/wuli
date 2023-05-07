// Copyright 2014-2022, University of Colorado Boulder

/**
 * The 'Divide' screen. Conforms to the contract specified in joist/Screen.
 *
 * Andrey Zelenkov (MLearner)
 * @author John Blanco
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import arithmetic from '../arithmetic.js';
import ArithmeticStrings from '../ArithmeticStrings.js';
import ArithmeticConstants from '../common/ArithmeticConstants.js';
import DivideModel from './model/DivideModel.js';
import DivideScreenIconNode from './view/DivideScreenIconNode.js';
import DivideView from './view/DivideView.js';
class DivideScreen extends Screen {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      name: ArithmeticStrings.divideStringProperty,
      backgroundColorProperty: new Property(ArithmeticConstants.BACKGROUND_COLOR),
      homeScreenIcon: new ScreenIcon(new DivideScreenIconNode(), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      tandem: Tandem.REQUIRED
    }, options);
    super(() => new DivideModel(options.tandem.createTandem('model')), model => new DivideView(model), options);
  }
}
arithmetic.register('DivideScreen', DivideScreen);
export default DivideScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJtZXJnZSIsIlRhbmRlbSIsImFyaXRobWV0aWMiLCJBcml0aG1ldGljU3RyaW5ncyIsIkFyaXRobWV0aWNDb25zdGFudHMiLCJEaXZpZGVNb2RlbCIsIkRpdmlkZVNjcmVlbkljb25Ob2RlIiwiRGl2aWRlVmlldyIsIkRpdmlkZVNjcmVlbiIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsIm5hbWUiLCJkaXZpZGVTdHJpbmdQcm9wZXJ0eSIsImJhY2tncm91bmRDb2xvclByb3BlcnR5IiwiQkFDS0dST1VORF9DT0xPUiIsImhvbWVTY3JlZW5JY29uIiwibWF4SWNvbldpZHRoUHJvcG9ydGlvbiIsIm1heEljb25IZWlnaHRQcm9wb3J0aW9uIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJjcmVhdGVUYW5kZW0iLCJtb2RlbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRGl2aWRlU2NyZWVuLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSAnRGl2aWRlJyBzY3JlZW4uIENvbmZvcm1zIHRvIHRoZSBjb250cmFjdCBzcGVjaWZpZWQgaW4gam9pc3QvU2NyZWVuLlxyXG4gKlxyXG4gKiBBbmRyZXkgWmVsZW5rb3YgKE1MZWFybmVyKVxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU2NyZWVuIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBTY3JlZW5JY29uIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbkljb24uanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGFyaXRobWV0aWMgZnJvbSAnLi4vYXJpdGhtZXRpYy5qcyc7XHJcbmltcG9ydCBBcml0aG1ldGljU3RyaW5ncyBmcm9tICcuLi9Bcml0aG1ldGljU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBBcml0aG1ldGljQ29uc3RhbnRzIGZyb20gJy4uL2NvbW1vbi9Bcml0aG1ldGljQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IERpdmlkZU1vZGVsIGZyb20gJy4vbW9kZWwvRGl2aWRlTW9kZWwuanMnO1xyXG5pbXBvcnQgRGl2aWRlU2NyZWVuSWNvbk5vZGUgZnJvbSAnLi92aWV3L0RpdmlkZVNjcmVlbkljb25Ob2RlLmpzJztcclxuaW1wb3J0IERpdmlkZVZpZXcgZnJvbSAnLi92aWV3L0RpdmlkZVZpZXcuanMnO1xyXG5cclxuY2xhc3MgRGl2aWRlU2NyZWVuIGV4dGVuZHMgU2NyZWVuIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBuYW1lOiBBcml0aG1ldGljU3RyaW5ncy5kaXZpZGVTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggQXJpdGhtZXRpY0NvbnN0YW50cy5CQUNLR1JPVU5EX0NPTE9SICksXHJcbiAgICAgIGhvbWVTY3JlZW5JY29uOiBuZXcgU2NyZWVuSWNvbiggbmV3IERpdmlkZVNjcmVlbkljb25Ob2RlKCksIHtcclxuICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAxXHJcbiAgICAgIH0gKSxcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4gbmV3IERpdmlkZU1vZGVsKCBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb2RlbCcgKSApLFxyXG4gICAgICBtb2RlbCA9PiBuZXcgRGl2aWRlVmlldyggbW9kZWwgKSxcclxuICAgICAgb3B0aW9uc1xyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbmFyaXRobWV0aWMucmVnaXN0ZXIoICdEaXZpZGVTY3JlZW4nLCBEaXZpZGVTY3JlZW4gKTtcclxuZXhwb3J0IGRlZmF1bHQgRGl2aWRlU2NyZWVuOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSw4QkFBOEI7QUFDbkQsT0FBT0MsTUFBTSxNQUFNLDZCQUE2QjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0saUNBQWlDO0FBQ3hELE9BQU9DLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxVQUFVLE1BQU0sa0JBQWtCO0FBQ3pDLE9BQU9DLGlCQUFpQixNQUFNLHlCQUF5QjtBQUN2RCxPQUFPQyxtQkFBbUIsTUFBTSxrQ0FBa0M7QUFDbEUsT0FBT0MsV0FBVyxNQUFNLHdCQUF3QjtBQUNoRCxPQUFPQyxvQkFBb0IsTUFBTSxnQ0FBZ0M7QUFDakUsT0FBT0MsVUFBVSxNQUFNLHNCQUFzQjtBQUU3QyxNQUFNQyxZQUFZLFNBQVNWLE1BQU0sQ0FBQztFQUVoQztBQUNGO0FBQ0E7RUFDRVcsV0FBV0EsQ0FBRUMsT0FBTyxFQUFHO0lBRXJCQSxPQUFPLEdBQUdWLEtBQUssQ0FBRTtNQUNmVyxJQUFJLEVBQUVSLGlCQUFpQixDQUFDUyxvQkFBb0I7TUFDNUNDLHVCQUF1QixFQUFFLElBQUloQixRQUFRLENBQUVPLG1CQUFtQixDQUFDVSxnQkFBaUIsQ0FBQztNQUM3RUMsY0FBYyxFQUFFLElBQUloQixVQUFVLENBQUUsSUFBSU8sb0JBQW9CLENBQUMsQ0FBQyxFQUFFO1FBQzFEVSxzQkFBc0IsRUFBRSxDQUFDO1FBQ3pCQyx1QkFBdUIsRUFBRTtNQUMzQixDQUFFLENBQUM7TUFDSEMsTUFBTSxFQUFFakIsTUFBTSxDQUFDa0I7SUFDakIsQ0FBQyxFQUFFVCxPQUFRLENBQUM7SUFFWixLQUFLLENBQ0gsTUFBTSxJQUFJTCxXQUFXLENBQUVLLE9BQU8sQ0FBQ1EsTUFBTSxDQUFDRSxZQUFZLENBQUUsT0FBUSxDQUFFLENBQUMsRUFDL0RDLEtBQUssSUFBSSxJQUFJZCxVQUFVLENBQUVjLEtBQU0sQ0FBQyxFQUNoQ1gsT0FDRixDQUFDO0VBQ0g7QUFDRjtBQUVBUixVQUFVLENBQUNvQixRQUFRLENBQUUsY0FBYyxFQUFFZCxZQUFhLENBQUM7QUFDbkQsZUFBZUEsWUFBWSJ9