// Copyright 2019-2023, University of Colorado Boulder

/**
 * Button that resets a Fuse.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import { Circle, Node, Path } from '../../../scenery/js/imports.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Fuse from '../model/Fuse.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';
import optionize from '../../../phet-core/js/optionize.js';
import Tandem from '../../../tandem/js/Tandem.js';
export default class FuseRepairButton extends CCKCRoundPushButton {
  constructor(circuit, providedOptions) {
    const shape = new Shape().moveTo(0, 0).zigZagToPoint(new Vector2(35, 0), 4.7, 4, false);
    const icon = new Node({
      children: [new Path(shape, {
        stroke: 'black',
        lineWidth: 1.2,
        centerX: 0,
        centerY: 0
      }), new Circle(2.2, {
        fill: 'black',
        centerX: 0,
        centerY: 0
      })],
      scale: 0.9 // to match the size of the trash can icon
    });

    const options = optionize()({
      enabledPropertyOptions: {
        tandem: Tandem.OPT_OUT
      },
      touchAreaDilation: 5,
      // radius dilation for touch area
      content: icon,
      listener: () => {
        const fuse = circuit.selectionProperty.value;

        // eslint-disable-next-line no-simple-type-checking-assertions
        assert && assert(fuse instanceof Fuse);
        if (fuse instanceof Fuse) {
          fuse.resetFuse();
          circuit.componentEditedEmitter.emit();
        }
      }
    }, providedOptions);
    super(options);
    const isTrippedListener = isTripped => this.setEnabled(isTripped);

    // This is reused across all instances.  The button itself can be hidden by PhET-iO customization, but the parent
    // node is another gate for the visibility.
    circuit.selectionProperty.link((newCircuitElement, oldCircuitElement) => {
      oldCircuitElement instanceof Fuse && oldCircuitElement.isTrippedProperty.unlink(isTrippedListener);
      newCircuitElement instanceof Fuse && newCircuitElement.isTrippedProperty.link(isTrippedListener);
    });
  }
  dispose() {
    assert && assert(false, 'should not be disposed');
  }
}
circuitConstructionKitCommon.register('FuseRepairButton', FuseRepairButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2hhcGUiLCJDaXJjbGUiLCJOb2RlIiwiUGF0aCIsImNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24iLCJGdXNlIiwiQ0NLQ1JvdW5kUHVzaEJ1dHRvbiIsIm9wdGlvbml6ZSIsIlRhbmRlbSIsIkZ1c2VSZXBhaXJCdXR0b24iLCJjb25zdHJ1Y3RvciIsImNpcmN1aXQiLCJwcm92aWRlZE9wdGlvbnMiLCJzaGFwZSIsIm1vdmVUbyIsInppZ1phZ1RvUG9pbnQiLCJpY29uIiwiY2hpbGRyZW4iLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJjZW50ZXJYIiwiY2VudGVyWSIsImZpbGwiLCJzY2FsZSIsIm9wdGlvbnMiLCJlbmFibGVkUHJvcGVydHlPcHRpb25zIiwidGFuZGVtIiwiT1BUX09VVCIsInRvdWNoQXJlYURpbGF0aW9uIiwiY29udGVudCIsImxpc3RlbmVyIiwiZnVzZSIsInNlbGVjdGlvblByb3BlcnR5IiwidmFsdWUiLCJhc3NlcnQiLCJyZXNldEZ1c2UiLCJjb21wb25lbnRFZGl0ZWRFbWl0dGVyIiwiZW1pdCIsImlzVHJpcHBlZExpc3RlbmVyIiwiaXNUcmlwcGVkIiwic2V0RW5hYmxlZCIsImxpbmsiLCJuZXdDaXJjdWl0RWxlbWVudCIsIm9sZENpcmN1aXRFbGVtZW50IiwiaXNUcmlwcGVkUHJvcGVydHkiLCJ1bmxpbmsiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGdXNlUmVwYWlyQnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJ1dHRvbiB0aGF0IHJlc2V0cyBhIEZ1c2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IENpcmNsZSwgTm9kZSwgUGF0aCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIGZyb20gJy4uL2NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24uanMnO1xyXG5pbXBvcnQgQ2lyY3VpdCBmcm9tICcuLi9tb2RlbC9DaXJjdWl0LmpzJztcclxuaW1wb3J0IEZ1c2UgZnJvbSAnLi4vbW9kZWwvRnVzZS5qcyc7XHJcbmltcG9ydCBDQ0tDUm91bmRQdXNoQnV0dG9uIGZyb20gJy4vQ0NLQ1JvdW5kUHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBDaXJjdWl0RWxlbWVudCBmcm9tICcuLi9tb2RlbC9DaXJjdWl0RWxlbWVudC5qcyc7XHJcbmltcG9ydCBWZXJ0ZXggZnJvbSAnLi4vbW9kZWwvVmVydGV4LmpzJztcclxuaW1wb3J0IHsgUm91bmRQdXNoQnV0dG9uT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JvdW5kUHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcbnR5cGUgUmVwYWlyRnVzZUJ1dHRvbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFJvdW5kUHVzaEJ1dHRvbk9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGdXNlUmVwYWlyQnV0dG9uIGV4dGVuZHMgQ0NLQ1JvdW5kUHVzaEJ1dHRvbiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY2lyY3VpdDogQ2lyY3VpdCwgcHJvdmlkZWRPcHRpb25zPzogUmVwYWlyRnVzZUJ1dHRvbk9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgc2hhcGUgPSBuZXcgU2hhcGUoKS5tb3ZlVG8oIDAsIDAgKS56aWdaYWdUb1BvaW50KCBuZXcgVmVjdG9yMiggMzUsIDAgKSwgNC43LCA0LCBmYWxzZSApO1xyXG5cclxuICAgIGNvbnN0IGljb24gPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyBuZXcgUGF0aCggc2hhcGUsIHtcclxuICAgICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgICAgbGluZVdpZHRoOiAxLjIsXHJcbiAgICAgICAgY2VudGVyWDogMCxcclxuICAgICAgICBjZW50ZXJZOiAwXHJcbiAgICAgIH0gKSwgbmV3IENpcmNsZSggMi4yLCB7IGZpbGw6ICdibGFjaycsIGNlbnRlclg6IDAsIGNlbnRlclk6IDAgfSApIF0sXHJcbiAgICAgIHNjYWxlOiAwLjkgLy8gdG8gbWF0Y2ggdGhlIHNpemUgb2YgdGhlIHRyYXNoIGNhbiBpY29uXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxSZXBhaXJGdXNlQnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIFJvdW5kUHVzaEJ1dHRvbk9wdGlvbnM+KCkoIHtcclxuICAgICAgZW5hYmxlZFByb3BlcnR5T3B0aW9uczogeyB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIH0sXHJcbiAgICAgIHRvdWNoQXJlYURpbGF0aW9uOiA1LCAvLyByYWRpdXMgZGlsYXRpb24gZm9yIHRvdWNoIGFyZWFcclxuICAgICAgY29udGVudDogaWNvbixcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBjb25zdCBmdXNlID0gY2lyY3VpdC5zZWxlY3Rpb25Qcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNpbXBsZS10eXBlLWNoZWNraW5nLWFzc2VydGlvbnNcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmdXNlIGluc3RhbmNlb2YgRnVzZSApO1xyXG4gICAgICAgIGlmICggZnVzZSBpbnN0YW5jZW9mIEZ1c2UgKSB7XHJcbiAgICAgICAgICBmdXNlLnJlc2V0RnVzZSgpO1xyXG4gICAgICAgICAgY2lyY3VpdC5jb21wb25lbnRFZGl0ZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgaXNUcmlwcGVkTGlzdGVuZXIgPSAoIGlzVHJpcHBlZDogYm9vbGVhbiApID0+IHRoaXMuc2V0RW5hYmxlZCggaXNUcmlwcGVkICk7XHJcblxyXG4gICAgLy8gVGhpcyBpcyByZXVzZWQgYWNyb3NzIGFsbCBpbnN0YW5jZXMuICBUaGUgYnV0dG9uIGl0c2VsZiBjYW4gYmUgaGlkZGVuIGJ5IFBoRVQtaU8gY3VzdG9taXphdGlvbiwgYnV0IHRoZSBwYXJlbnRcclxuICAgIC8vIG5vZGUgaXMgYW5vdGhlciBnYXRlIGZvciB0aGUgdmlzaWJpbGl0eS5cclxuICAgIGNpcmN1aXQuc2VsZWN0aW9uUHJvcGVydHkubGluayggKCBuZXdDaXJjdWl0RWxlbWVudDogQ2lyY3VpdEVsZW1lbnQgfCBWZXJ0ZXggfCBudWxsLCBvbGRDaXJjdWl0RWxlbWVudDogQ2lyY3VpdEVsZW1lbnQgfCBWZXJ0ZXggfCBudWxsICkgPT4ge1xyXG4gICAgICBvbGRDaXJjdWl0RWxlbWVudCBpbnN0YW5jZW9mIEZ1c2UgJiYgb2xkQ2lyY3VpdEVsZW1lbnQuaXNUcmlwcGVkUHJvcGVydHkudW5saW5rKCBpc1RyaXBwZWRMaXN0ZW5lciApO1xyXG4gICAgICBuZXdDaXJjdWl0RWxlbWVudCBpbnN0YW5jZW9mIEZ1c2UgJiYgbmV3Q2lyY3VpdEVsZW1lbnQuaXNUcmlwcGVkUHJvcGVydHkubGluayggaXNUcmlwcGVkTGlzdGVuZXIgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdzaG91bGQgbm90IGJlIGRpc3Bvc2VkJyApO1xyXG4gIH1cclxufVxyXG5cclxuY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5yZWdpc3RlciggJ0Z1c2VSZXBhaXJCdXR0b24nLCBGdXNlUmVwYWlyQnV0dG9uICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsU0FBU0MsS0FBSyxRQUFRLDZCQUE2QjtBQUNuRCxTQUFTQyxNQUFNLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLGdDQUFnQztBQUNuRSxPQUFPQyw0QkFBNEIsTUFBTSxvQ0FBb0M7QUFFN0UsT0FBT0MsSUFBSSxNQUFNLGtCQUFrQjtBQUNuQyxPQUFPQyxtQkFBbUIsTUFBTSwwQkFBMEI7QUFJMUQsT0FBT0MsU0FBUyxNQUE0QixvQ0FBb0M7QUFDaEYsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUtqRCxlQUFlLE1BQU1DLGdCQUFnQixTQUFTSCxtQkFBbUIsQ0FBQztFQUV6REksV0FBV0EsQ0FBRUMsT0FBZ0IsRUFBRUMsZUFBeUMsRUFBRztJQUVoRixNQUFNQyxLQUFLLEdBQUcsSUFBSWIsS0FBSyxDQUFDLENBQUMsQ0FBQ2MsTUFBTSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsQ0FBQ0MsYUFBYSxDQUFFLElBQUloQixPQUFPLENBQUUsRUFBRSxFQUFFLENBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBTSxDQUFDO0lBRTdGLE1BQU1pQixJQUFJLEdBQUcsSUFBSWQsSUFBSSxDQUFFO01BQ3JCZSxRQUFRLEVBQUUsQ0FBRSxJQUFJZCxJQUFJLENBQUVVLEtBQUssRUFBRTtRQUMzQkssTUFBTSxFQUFFLE9BQU87UUFDZkMsU0FBUyxFQUFFLEdBQUc7UUFDZEMsT0FBTyxFQUFFLENBQUM7UUFDVkMsT0FBTyxFQUFFO01BQ1gsQ0FBRSxDQUFDLEVBQUUsSUFBSXBCLE1BQU0sQ0FBRSxHQUFHLEVBQUU7UUFBRXFCLElBQUksRUFBRSxPQUFPO1FBQUVGLE9BQU8sRUFBRSxDQUFDO1FBQUVDLE9BQU8sRUFBRTtNQUFFLENBQUUsQ0FBQyxDQUFFO01BQ25FRSxLQUFLLEVBQUUsR0FBRyxDQUFDO0lBQ2IsQ0FBRSxDQUFDOztJQUVILE1BQU1DLE9BQU8sR0FBR2pCLFNBQVMsQ0FBK0QsQ0FBQyxDQUFFO01BQ3pGa0Isc0JBQXNCLEVBQUU7UUFBRUMsTUFBTSxFQUFFbEIsTUFBTSxDQUFDbUI7TUFBUSxDQUFDO01BQ2xEQyxpQkFBaUIsRUFBRSxDQUFDO01BQUU7TUFDdEJDLE9BQU8sRUFBRWIsSUFBSTtNQUNiYyxRQUFRLEVBQUVBLENBQUEsS0FBTTtRQUNkLE1BQU1DLElBQUksR0FBR3BCLE9BQU8sQ0FBQ3FCLGlCQUFpQixDQUFDQyxLQUFLOztRQUU1QztRQUNBQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUgsSUFBSSxZQUFZMUIsSUFBSyxDQUFDO1FBQ3hDLElBQUswQixJQUFJLFlBQVkxQixJQUFJLEVBQUc7VUFDMUIwQixJQUFJLENBQUNJLFNBQVMsQ0FBQyxDQUFDO1VBQ2hCeEIsT0FBTyxDQUFDeUIsc0JBQXNCLENBQUNDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDO01BQ0Y7SUFDRixDQUFDLEVBQUV6QixlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRVksT0FBUSxDQUFDO0lBRWhCLE1BQU1jLGlCQUFpQixHQUFLQyxTQUFrQixJQUFNLElBQUksQ0FBQ0MsVUFBVSxDQUFFRCxTQUFVLENBQUM7O0lBRWhGO0lBQ0E7SUFDQTVCLE9BQU8sQ0FBQ3FCLGlCQUFpQixDQUFDUyxJQUFJLENBQUUsQ0FBRUMsaUJBQWlELEVBQUVDLGlCQUFpRCxLQUFNO01BQzFJQSxpQkFBaUIsWUFBWXRDLElBQUksSUFBSXNDLGlCQUFpQixDQUFDQyxpQkFBaUIsQ0FBQ0MsTUFBTSxDQUFFUCxpQkFBa0IsQ0FBQztNQUNwR0ksaUJBQWlCLFlBQVlyQyxJQUFJLElBQUlxQyxpQkFBaUIsQ0FBQ0UsaUJBQWlCLENBQUNILElBQUksQ0FBRUgsaUJBQWtCLENBQUM7SUFDcEcsQ0FBRSxDQUFDO0VBQ0w7RUFFZ0JRLE9BQU9BLENBQUEsRUFBUztJQUM5QlosTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLHdCQUF5QixDQUFDO0VBQ3JEO0FBQ0Y7QUFFQTlCLDRCQUE0QixDQUFDMkMsUUFBUSxDQUFFLGtCQUFrQixFQUFFdEMsZ0JBQWlCLENBQUMifQ==