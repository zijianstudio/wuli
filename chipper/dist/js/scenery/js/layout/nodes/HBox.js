// Copyright 2022-2023, University of Colorado Boulder

/**
 * HBox is a convenience specialization of FlowBox with horizontal orientation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { FlowBox, scenery, HSeparator } from '../../imports.js';
export default class HBox extends FlowBox {
  constructor(providedOptions) {
    assert && assert(!providedOptions || !providedOptions.orientation, 'HBox sets orientation');
    super(optionize()({
      orientation: 'horizontal'
    }, providedOptions));
  }
  onFlowBoxChildInserted(node, index) {
    assert && assert(!(node instanceof HSeparator), 'HSeparator should not be used in an HBox. Use VSeparator instead');
    super.onFlowBoxChildInserted(node, index);
  }
  mutate(options) {
    return super.mutate(options);
  }
}
scenery.register('HBox', HBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJGbG93Qm94Iiwic2NlbmVyeSIsIkhTZXBhcmF0b3IiLCJIQm94IiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJhc3NlcnQiLCJvcmllbnRhdGlvbiIsIm9uRmxvd0JveENoaWxkSW5zZXJ0ZWQiLCJub2RlIiwiaW5kZXgiLCJtdXRhdGUiLCJvcHRpb25zIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJIQm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEhCb3ggaXMgYSBjb252ZW5pZW5jZSBzcGVjaWFsaXphdGlvbiBvZiBGbG93Qm94IHdpdGggaG9yaXpvbnRhbCBvcmllbnRhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgeyBGbG93Qm94LCBGbG93Qm94T3B0aW9ucywgc2NlbmVyeSwgTm9kZSwgSFNlcGFyYXRvciB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xyXG5cclxuZXhwb3J0IHR5cGUgSEJveE9wdGlvbnMgPSBTdHJpY3RPbWl0PEZsb3dCb3hPcHRpb25zLCAnb3JpZW50YXRpb24nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhCb3ggZXh0ZW5kcyBGbG93Qm94IHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IEhCb3hPcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXByb3ZpZGVkT3B0aW9ucyB8fCAhKCBwcm92aWRlZE9wdGlvbnMgYXMgRmxvd0JveE9wdGlvbnMgKS5vcmllbnRhdGlvbiwgJ0hCb3ggc2V0cyBvcmllbnRhdGlvbicgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9uaXplPEhCb3hPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBGbG93Qm94T3B0aW9ucz4oKSgge1xyXG4gICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKSApO1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIG9uRmxvd0JveENoaWxkSW5zZXJ0ZWQoIG5vZGU6IE5vZGUsIGluZGV4OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhKCBub2RlIGluc3RhbmNlb2YgSFNlcGFyYXRvciApLCAnSFNlcGFyYXRvciBzaG91bGQgbm90IGJlIHVzZWQgaW4gYW4gSEJveC4gVXNlIFZTZXBhcmF0b3IgaW5zdGVhZCcgKTtcclxuXHJcbiAgICBzdXBlci5vbkZsb3dCb3hDaGlsZEluc2VydGVkKCBub2RlLCBpbmRleCApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIG11dGF0ZSggb3B0aW9ucz86IEhCb3hPcHRpb25zICk6IHRoaXMge1xyXG4gICAgcmV0dXJuIHN1cGVyLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0hCb3gnLCBIQm94ICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQTRCLHVDQUF1QztBQUVuRixTQUFTQyxPQUFPLEVBQWtCQyxPQUFPLEVBQVFDLFVBQVUsUUFBUSxrQkFBa0I7QUFJckYsZUFBZSxNQUFNQyxJQUFJLFNBQVNILE9BQU8sQ0FBQztFQUNqQ0ksV0FBV0EsQ0FBRUMsZUFBNkIsRUFBRztJQUNsREMsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQ0QsZUFBZSxJQUFJLENBQUdBLGVBQWUsQ0FBcUJFLFdBQVcsRUFBRSx1QkFBd0IsQ0FBQztJQUVuSCxLQUFLLENBQUVSLFNBQVMsQ0FBZ0QsQ0FBQyxDQUFFO01BQ2pFUSxXQUFXLEVBQUU7SUFDZixDQUFDLEVBQUVGLGVBQWdCLENBQUUsQ0FBQztFQUN4QjtFQUVtQkcsc0JBQXNCQSxDQUFFQyxJQUFVLEVBQUVDLEtBQWEsRUFBUztJQUMzRUosTUFBTSxJQUFJQSxNQUFNLENBQUUsRUFBR0csSUFBSSxZQUFZUCxVQUFVLENBQUUsRUFBRSxrRUFBbUUsQ0FBQztJQUV2SCxLQUFLLENBQUNNLHNCQUFzQixDQUFFQyxJQUFJLEVBQUVDLEtBQU0sQ0FBQztFQUM3QztFQUVnQkMsTUFBTUEsQ0FBRUMsT0FBcUIsRUFBUztJQUNwRCxPQUFPLEtBQUssQ0FBQ0QsTUFBTSxDQUFFQyxPQUFRLENBQUM7RUFDaEM7QUFDRjtBQUVBWCxPQUFPLENBQUNZLFFBQVEsQ0FBRSxNQUFNLEVBQUVWLElBQUssQ0FBQyJ9