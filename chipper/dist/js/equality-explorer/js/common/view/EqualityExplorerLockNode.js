// Copyright 2017-2022, University of Colorado Boulder

/**
 * Padlock used to lock/unlock the 2 sides of the scale.
 * When locked, every action on one side is balanced by an equivalent action on the opposite side.
 * Origin is at the center of the 'closed' padlock image. Use x,y options for layout.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import LockNode from '../../../../scenery-phet/js/LockNode.js';
import { FireListener } from '../../../../scenery/js/imports.js';
import equalityExplorer from '../../equalityExplorer.js';
export default class EqualityExplorerLockNode extends LockNode {
  /**
   * @param lockedProperty - indicates whether left and right sides are "locked"
   * @param [providedOptions]
   */
  constructor(lockedProperty, providedOptions) {
    const options = optionize()({
      // LockNodeOptions
      cursor: 'pointer',
      maxHeight: 45
    }, providedOptions);
    super(lockedProperty, options);

    // toggle the state when the user clicks on this Node
    this.addInputListener(new FireListener({
      fire: () => {
        lockedProperty.value = !lockedProperty.value;
        phet.log && phet.log(`Lock pressed, value=${lockedProperty.value}`);
      },
      tandem: options.tandem.createTandem('fireListener')
    }));
    this.touchArea = this.localBounds.dilatedXY(5, 10);
    this.addLinkedElement(lockedProperty, {
      tandem: options.tandem.createTandem(lockedProperty.tandem.name)
    });
  }
}
equalityExplorer.register('EqualityExplorerLockNode', EqualityExplorerLockNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJMb2NrTm9kZSIsIkZpcmVMaXN0ZW5lciIsImVxdWFsaXR5RXhwbG9yZXIiLCJFcXVhbGl0eUV4cGxvcmVyTG9ja05vZGUiLCJjb25zdHJ1Y3RvciIsImxvY2tlZFByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImN1cnNvciIsIm1heEhlaWdodCIsImFkZElucHV0TGlzdGVuZXIiLCJmaXJlIiwidmFsdWUiLCJwaGV0IiwibG9nIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwidG91Y2hBcmVhIiwibG9jYWxCb3VuZHMiLCJkaWxhdGVkWFkiLCJhZGRMaW5rZWRFbGVtZW50IiwibmFtZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRXF1YWxpdHlFeHBsb3JlckxvY2tOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBhZGxvY2sgdXNlZCB0byBsb2NrL3VubG9jayB0aGUgMiBzaWRlcyBvZiB0aGUgc2NhbGUuXHJcbiAqIFdoZW4gbG9ja2VkLCBldmVyeSBhY3Rpb24gb24gb25lIHNpZGUgaXMgYmFsYW5jZWQgYnkgYW4gZXF1aXZhbGVudCBhY3Rpb24gb24gdGhlIG9wcG9zaXRlIHNpZGUuXHJcbiAqIE9yaWdpbiBpcyBhdCB0aGUgY2VudGVyIG9mIHRoZSAnY2xvc2VkJyBwYWRsb2NrIGltYWdlLiBVc2UgeCx5IG9wdGlvbnMgZm9yIGxheW91dC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgTG9ja05vZGUsIHsgTG9ja05vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0xvY2tOb2RlLmpzJztcclxuaW1wb3J0IHsgRmlyZUxpc3RlbmVyLCBOb2RlVHJhbnNsYXRpb25PcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGVxdWFsaXR5RXhwbG9yZXIgZnJvbSAnLi4vLi4vZXF1YWxpdHlFeHBsb3Jlci5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgRXF1YWxpdHlFeHBsb3JlckxvY2tOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxMb2NrTm9kZU9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVxdWFsaXR5RXhwbG9yZXJMb2NrTm9kZSBleHRlbmRzIExvY2tOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGxvY2tlZFByb3BlcnR5IC0gaW5kaWNhdGVzIHdoZXRoZXIgbGVmdCBhbmQgcmlnaHQgc2lkZXMgYXJlIFwibG9ja2VkXCJcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxvY2tlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiwgcHJvdmlkZWRPcHRpb25zPzogRXF1YWxpdHlFeHBsb3JlckxvY2tOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEVxdWFsaXR5RXhwbG9yZXJMb2NrTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBMb2NrTm9kZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIExvY2tOb2RlT3B0aW9uc1xyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgbWF4SGVpZ2h0OiA0NVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIGxvY2tlZFByb3BlcnR5LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gdG9nZ2xlIHRoZSBzdGF0ZSB3aGVuIHRoZSB1c2VyIGNsaWNrcyBvbiB0aGlzIE5vZGVcclxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggbmV3IEZpcmVMaXN0ZW5lcigge1xyXG4gICAgICBmaXJlOiAoKSA9PiB7XHJcbiAgICAgICAgbG9ja2VkUHJvcGVydHkudmFsdWUgPSAhbG9ja2VkUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgcGhldC5sb2cgJiYgcGhldC5sb2coIGBMb2NrIHByZXNzZWQsIHZhbHVlPSR7bG9ja2VkUHJvcGVydHkudmFsdWV9YCApO1xyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZpcmVMaXN0ZW5lcicgKVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgdGhpcy50b3VjaEFyZWEgPSB0aGlzLmxvY2FsQm91bmRzLmRpbGF0ZWRYWSggNSwgMTAgKTtcclxuXHJcbiAgICB0aGlzLmFkZExpbmtlZEVsZW1lbnQoIGxvY2tlZFByb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCBsb2NrZWRQcm9wZXJ0eS50YW5kZW0ubmFtZSApXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5lcXVhbGl0eUV4cGxvcmVyLnJlZ2lzdGVyKCAnRXF1YWxpdHlFeHBsb3JlckxvY2tOb2RlJywgRXF1YWxpdHlFeHBsb3JlckxvY2tOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxTQUFTLE1BQTRCLHVDQUF1QztBQUVuRixPQUFPQyxRQUFRLE1BQTJCLHlDQUF5QztBQUNuRixTQUFTQyxZQUFZLFFBQWdDLG1DQUFtQztBQUN4RixPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFNeEQsZUFBZSxNQUFNQyx3QkFBd0IsU0FBU0gsUUFBUSxDQUFDO0VBRTdEO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NJLFdBQVdBLENBQUVDLGNBQWlDLEVBQUVDLGVBQWlELEVBQUc7SUFFekcsTUFBTUMsT0FBTyxHQUFHUixTQUFTLENBQWdFLENBQUMsQ0FBRTtNQUUxRjtNQUNBUyxNQUFNLEVBQUUsU0FBUztNQUNqQkMsU0FBUyxFQUFFO0lBQ2IsQ0FBQyxFQUFFSCxlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRUQsY0FBYyxFQUFFRSxPQUFRLENBQUM7O0lBRWhDO0lBQ0EsSUFBSSxDQUFDRyxnQkFBZ0IsQ0FBRSxJQUFJVCxZQUFZLENBQUU7TUFDdkNVLElBQUksRUFBRUEsQ0FBQSxLQUFNO1FBQ1ZOLGNBQWMsQ0FBQ08sS0FBSyxHQUFHLENBQUNQLGNBQWMsQ0FBQ08sS0FBSztRQUM1Q0MsSUFBSSxDQUFDQyxHQUFHLElBQUlELElBQUksQ0FBQ0MsR0FBRyxDQUFHLHVCQUFzQlQsY0FBYyxDQUFDTyxLQUFNLEVBQUUsQ0FBQztNQUN2RSxDQUFDO01BQ0RHLE1BQU0sRUFBRVIsT0FBTyxDQUFDUSxNQUFNLENBQUNDLFlBQVksQ0FBRSxjQUFlO0lBQ3RELENBQUUsQ0FBRSxDQUFDO0lBRUwsSUFBSSxDQUFDQyxTQUFTLEdBQUcsSUFBSSxDQUFDQyxXQUFXLENBQUNDLFNBQVMsQ0FBRSxDQUFDLEVBQUUsRUFBRyxDQUFDO0lBRXBELElBQUksQ0FBQ0MsZ0JBQWdCLENBQUVmLGNBQWMsRUFBRTtNQUNyQ1UsTUFBTSxFQUFFUixPQUFPLENBQUNRLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFWCxjQUFjLENBQUNVLE1BQU0sQ0FBQ00sSUFBSztJQUNsRSxDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUFuQixnQkFBZ0IsQ0FBQ29CLFFBQVEsQ0FBRSwwQkFBMEIsRUFBRW5CLHdCQUF5QixDQUFDIn0=