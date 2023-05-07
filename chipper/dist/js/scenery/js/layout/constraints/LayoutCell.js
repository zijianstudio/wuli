// Copyright 2022, University of Colorado Boulder

/**
 * A configurable cell containing a Node used for more permanent layouts
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Orientation from '../../../../phet-core/js/Orientation.js';
import { LayoutProxyProperty, scenery } from '../../imports.js';

// NOTE: This would be an abstract class, but that is incompatible with how mixin constraints work in TypeScript
export default class LayoutCell {
  // We might need to notify the constraint it needs a layout

  // Our proxy will be dynamically computed and updated (based on whether there is a valid ancestorNode=>node trail)
  // Generally used to compute layout in the node's parent coordinate frame.
  // Called when layoutOptions changes for our Node
  // If we're not provided a (static) LayoutProxy in our constructor, we'll track and generate LayoutProxies with this.
  /**
   * NOTE: Consider this scenery-internal AND protected. It's effectively a protected constructor for an abstract type,
   * but cannot be due to how mixins constrain things (TypeScript doesn't work with private/protected things like this)
   *
   * NOTE: Methods can be marked as protected, however!
   *
   * (scenery-internal)
   *
   * @param constraint
   * @param node
   * @param proxy - If not provided, LayoutProxies will be computed and updated based on the ancestorNode of the
   *                constraint. This includes more work, and ideally should be avoided for things like FlowBox/GridBox
   *                (but will be needed by ManualConstraint or other direct LayoutConstraint usage)
   */
  constructor(constraint, node, proxy) {
    if (proxy) {
      this.layoutProxyProperty = null;
      this._proxy = proxy;
    } else {
      this._proxy = null;

      // If a LayoutProxy is not provided, we'll listen to (a) all the trails between our ancestor and this node,
      // (b) construct layout proxies for it (and assign here), and (c) listen to ancestor transforms to refresh
      // the layout when needed.
      this.layoutProxyProperty = new LayoutProxyProperty(constraint.ancestorNode, node, {
        onTransformChange: () => constraint.updateLayoutAutomatically()
      });
      this.layoutProxyProperty.link(proxy => {
        this._proxy = proxy;
        constraint.updateLayoutAutomatically();
      });
    }
    this._constraint = constraint;
    this._node = node;
    this.layoutOptionsListener = this.onLayoutOptionsChange.bind(this);
    this.node.layoutOptionsChangedEmitter.addListener(this.layoutOptionsListener);
  }

  // Can't be abstract, we're using mixins :(
  onLayoutOptionsChange() {
    // Lint rule not needed here
  }

  /**
   * (scenery-internal)
   */
  get node() {
    return this._node;
  }

  /**
   * (scenery-internal)
   */
  isConnected() {
    return this._proxy !== null;
  }

  /**
   * (scenery-internal)
   */
  get proxy() {
    assert && assert(this._proxy);
    return this._proxy;
  }

  /**
   * (scenery-internal)
   */
  isSizable(orientation) {
    return orientation === Orientation.HORIZONTAL ? this.proxy.widthSizable : this.proxy.heightSizable;
  }

  /**
   * Releases references
   */
  dispose() {
    this.layoutProxyProperty && this.layoutProxyProperty.dispose();
    this.node.layoutOptionsChangedEmitter.removeListener(this.layoutOptionsListener);
  }
}
scenery.register('LayoutCell', LayoutCell);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPcmllbnRhdGlvbiIsIkxheW91dFByb3h5UHJvcGVydHkiLCJzY2VuZXJ5IiwiTGF5b3V0Q2VsbCIsImNvbnN0cnVjdG9yIiwiY29uc3RyYWludCIsIm5vZGUiLCJwcm94eSIsImxheW91dFByb3h5UHJvcGVydHkiLCJfcHJveHkiLCJhbmNlc3Rvck5vZGUiLCJvblRyYW5zZm9ybUNoYW5nZSIsInVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkiLCJsaW5rIiwiX2NvbnN0cmFpbnQiLCJfbm9kZSIsImxheW91dE9wdGlvbnNMaXN0ZW5lciIsIm9uTGF5b3V0T3B0aW9uc0NoYW5nZSIsImJpbmQiLCJsYXlvdXRPcHRpb25zQ2hhbmdlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImlzQ29ubmVjdGVkIiwiYXNzZXJ0IiwiaXNTaXphYmxlIiwib3JpZW50YXRpb24iLCJIT1JJWk9OVEFMIiwid2lkdGhTaXphYmxlIiwiaGVpZ2h0U2l6YWJsZSIsImRpc3Bvc2UiLCJyZW1vdmVMaXN0ZW5lciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGF5b3V0Q2VsbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBjb25maWd1cmFibGUgY2VsbCBjb250YWluaW5nIGEgTm9kZSB1c2VkIGZvciBtb3JlIHBlcm1hbmVudCBsYXlvdXRzXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcclxuaW1wb3J0IHsgTGF5b3V0Q29uc3RyYWludCwgTGF5b3V0UHJveHksIExheW91dFByb3h5UHJvcGVydHksIE5vZGUsIHNjZW5lcnkgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcclxuXHJcbi8vIE5PVEU6IFRoaXMgd291bGQgYmUgYW4gYWJzdHJhY3QgY2xhc3MsIGJ1dCB0aGF0IGlzIGluY29tcGF0aWJsZSB3aXRoIGhvdyBtaXhpbiBjb25zdHJhaW50cyB3b3JrIGluIFR5cGVTY3JpcHRcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGF5b3V0Q2VsbCB7XHJcblxyXG4gIC8vIFdlIG1pZ2h0IG5lZWQgdG8gbm90aWZ5IHRoZSBjb25zdHJhaW50IGl0IG5lZWRzIGEgbGF5b3V0XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfY29uc3RyYWludDogTGF5b3V0Q29uc3RyYWludDtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBfbm9kZTogTm9kZTtcclxuXHJcbiAgLy8gT3VyIHByb3h5IHdpbGwgYmUgZHluYW1pY2FsbHkgY29tcHV0ZWQgYW5kIHVwZGF0ZWQgKGJhc2VkIG9uIHdoZXRoZXIgdGhlcmUgaXMgYSB2YWxpZCBhbmNlc3Rvck5vZGU9Pm5vZGUgdHJhaWwpXHJcbiAgLy8gR2VuZXJhbGx5IHVzZWQgdG8gY29tcHV0ZSBsYXlvdXQgaW4gdGhlIG5vZGUncyBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZS5cclxuICBwcml2YXRlIF9wcm94eTogTGF5b3V0UHJveHkgfCBudWxsO1xyXG5cclxuICAvLyBDYWxsZWQgd2hlbiBsYXlvdXRPcHRpb25zIGNoYW5nZXMgZm9yIG91ciBOb2RlXHJcbiAgcHJpdmF0ZSByZWFkb25seSBsYXlvdXRPcHRpb25zTGlzdGVuZXI6ICgpID0+IHZvaWQ7XHJcblxyXG4gIC8vIElmIHdlJ3JlIG5vdCBwcm92aWRlZCBhIChzdGF0aWMpIExheW91dFByb3h5IGluIG91ciBjb25zdHJ1Y3Rvciwgd2UnbGwgdHJhY2sgYW5kIGdlbmVyYXRlIExheW91dFByb3hpZXMgd2l0aCB0aGlzLlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbGF5b3V0UHJveHlQcm9wZXJ0eTogTGF5b3V0UHJveHlQcm9wZXJ0eSB8IG51bGw7XHJcblxyXG4gIC8qKlxyXG4gICAqIE5PVEU6IENvbnNpZGVyIHRoaXMgc2NlbmVyeS1pbnRlcm5hbCBBTkQgcHJvdGVjdGVkLiBJdCdzIGVmZmVjdGl2ZWx5IGEgcHJvdGVjdGVkIGNvbnN0cnVjdG9yIGZvciBhbiBhYnN0cmFjdCB0eXBlLFxyXG4gICAqIGJ1dCBjYW5ub3QgYmUgZHVlIHRvIGhvdyBtaXhpbnMgY29uc3RyYWluIHRoaW5ncyAoVHlwZVNjcmlwdCBkb2Vzbid0IHdvcmsgd2l0aCBwcml2YXRlL3Byb3RlY3RlZCB0aGluZ3MgbGlrZSB0aGlzKVxyXG4gICAqXHJcbiAgICogTk9URTogTWV0aG9kcyBjYW4gYmUgbWFya2VkIGFzIHByb3RlY3RlZCwgaG93ZXZlciFcclxuICAgKlxyXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIGNvbnN0cmFpbnRcclxuICAgKiBAcGFyYW0gbm9kZVxyXG4gICAqIEBwYXJhbSBwcm94eSAtIElmIG5vdCBwcm92aWRlZCwgTGF5b3V0UHJveGllcyB3aWxsIGJlIGNvbXB1dGVkIGFuZCB1cGRhdGVkIGJhc2VkIG9uIHRoZSBhbmNlc3Rvck5vZGUgb2YgdGhlXHJcbiAgICogICAgICAgICAgICAgICAgY29uc3RyYWludC4gVGhpcyBpbmNsdWRlcyBtb3JlIHdvcmssIGFuZCBpZGVhbGx5IHNob3VsZCBiZSBhdm9pZGVkIGZvciB0aGluZ3MgbGlrZSBGbG93Qm94L0dyaWRCb3hcclxuICAgKiAgICAgICAgICAgICAgICAoYnV0IHdpbGwgYmUgbmVlZGVkIGJ5IE1hbnVhbENvbnN0cmFpbnQgb3Igb3RoZXIgZGlyZWN0IExheW91dENvbnN0cmFpbnQgdXNhZ2UpXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjb25zdHJhaW50OiBMYXlvdXRDb25zdHJhaW50LCBub2RlOiBOb2RlLCBwcm94eTogTGF5b3V0UHJveHkgfCBudWxsICkge1xyXG4gICAgaWYgKCBwcm94eSApIHtcclxuICAgICAgdGhpcy5sYXlvdXRQcm94eVByb3BlcnR5ID0gbnVsbDtcclxuICAgICAgdGhpcy5fcHJveHkgPSBwcm94eTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgdGhpcy5fcHJveHkgPSBudWxsO1xyXG5cclxuICAgICAgLy8gSWYgYSBMYXlvdXRQcm94eSBpcyBub3QgcHJvdmlkZWQsIHdlJ2xsIGxpc3RlbiB0byAoYSkgYWxsIHRoZSB0cmFpbHMgYmV0d2VlbiBvdXIgYW5jZXN0b3IgYW5kIHRoaXMgbm9kZSxcclxuICAgICAgLy8gKGIpIGNvbnN0cnVjdCBsYXlvdXQgcHJveGllcyBmb3IgaXQgKGFuZCBhc3NpZ24gaGVyZSksIGFuZCAoYykgbGlzdGVuIHRvIGFuY2VzdG9yIHRyYW5zZm9ybXMgdG8gcmVmcmVzaFxyXG4gICAgICAvLyB0aGUgbGF5b3V0IHdoZW4gbmVlZGVkLlxyXG4gICAgICB0aGlzLmxheW91dFByb3h5UHJvcGVydHkgPSBuZXcgTGF5b3V0UHJveHlQcm9wZXJ0eSggY29uc3RyYWludC5hbmNlc3Rvck5vZGUsIG5vZGUsIHtcclxuICAgICAgICBvblRyYW5zZm9ybUNoYW5nZTogKCkgPT4gY29uc3RyYWludC51cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5KClcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmxheW91dFByb3h5UHJvcGVydHkubGluayggcHJveHkgPT4ge1xyXG4gICAgICAgIHRoaXMuX3Byb3h5ID0gcHJveHk7XHJcblxyXG4gICAgICAgIGNvbnN0cmFpbnQudXBkYXRlTGF5b3V0QXV0b21hdGljYWxseSgpO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fY29uc3RyYWludCA9IGNvbnN0cmFpbnQ7XHJcbiAgICB0aGlzLl9ub2RlID0gbm9kZTtcclxuXHJcbiAgICB0aGlzLmxheW91dE9wdGlvbnNMaXN0ZW5lciA9IHRoaXMub25MYXlvdXRPcHRpb25zQ2hhbmdlLmJpbmQoIHRoaXMgKTtcclxuICAgIHRoaXMubm9kZS5sYXlvdXRPcHRpb25zQ2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMubGF5b3V0T3B0aW9uc0xpc3RlbmVyICk7XHJcbiAgfVxyXG5cclxuICAvLyBDYW4ndCBiZSBhYnN0cmFjdCwgd2UncmUgdXNpbmcgbWl4aW5zIDooXHJcbiAgcHJvdGVjdGVkIG9uTGF5b3V0T3B0aW9uc0NoYW5nZSgpOiB2b2lkIHtcclxuICAgIC8vIExpbnQgcnVsZSBub3QgbmVlZGVkIGhlcmVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgbm9kZSgpOiBOb2RlIHtcclxuICAgIHJldHVybiB0aGlzLl9ub2RlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGlzQ29ubmVjdGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Byb3h5ICE9PSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBwcm94eSgpOiBMYXlvdXRQcm94eSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9wcm94eSApO1xyXG5cclxuICAgIHJldHVybiB0aGlzLl9wcm94eSE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgaXNTaXphYmxlKCBvcmllbnRhdGlvbjogT3JpZW50YXRpb24gKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gb3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgPyB0aGlzLnByb3h5LndpZHRoU2l6YWJsZSA6IHRoaXMucHJveHkuaGVpZ2h0U2l6YWJsZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcclxuICAgKi9cclxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMubGF5b3V0UHJveHlQcm9wZXJ0eSAmJiB0aGlzLmxheW91dFByb3h5UHJvcGVydHkuZGlzcG9zZSgpO1xyXG5cclxuICAgIHRoaXMubm9kZS5sYXlvdXRPcHRpb25zQ2hhbmdlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMubGF5b3V0T3B0aW9uc0xpc3RlbmVyICk7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnTGF5b3V0Q2VsbCcsIExheW91dENlbGwgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsU0FBd0NDLG1CQUFtQixFQUFRQyxPQUFPLFFBQVEsa0JBQWtCOztBQUVwRztBQUNBLGVBQWUsTUFBTUMsVUFBVSxDQUFDO0VBRTlCOztFQUtBO0VBQ0E7RUFHQTtFQUdBO0VBR0E7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTQyxXQUFXQSxDQUFFQyxVQUE0QixFQUFFQyxJQUFVLEVBQUVDLEtBQXlCLEVBQUc7SUFDeEYsSUFBS0EsS0FBSyxFQUFHO01BQ1gsSUFBSSxDQUFDQyxtQkFBbUIsR0FBRyxJQUFJO01BQy9CLElBQUksQ0FBQ0MsTUFBTSxHQUFHRixLQUFLO0lBQ3JCLENBQUMsTUFDSTtNQUVILElBQUksQ0FBQ0UsTUFBTSxHQUFHLElBQUk7O01BRWxCO01BQ0E7TUFDQTtNQUNBLElBQUksQ0FBQ0QsbUJBQW1CLEdBQUcsSUFBSVAsbUJBQW1CLENBQUVJLFVBQVUsQ0FBQ0ssWUFBWSxFQUFFSixJQUFJLEVBQUU7UUFDakZLLGlCQUFpQixFQUFFQSxDQUFBLEtBQU1OLFVBQVUsQ0FBQ08seUJBQXlCLENBQUM7TUFDaEUsQ0FBRSxDQUFDO01BQ0gsSUFBSSxDQUFDSixtQkFBbUIsQ0FBQ0ssSUFBSSxDQUFFTixLQUFLLElBQUk7UUFDdEMsSUFBSSxDQUFDRSxNQUFNLEdBQUdGLEtBQUs7UUFFbkJGLFVBQVUsQ0FBQ08seUJBQXlCLENBQUMsQ0FBQztNQUN4QyxDQUFFLENBQUM7SUFDTDtJQUVBLElBQUksQ0FBQ0UsV0FBVyxHQUFHVCxVQUFVO0lBQzdCLElBQUksQ0FBQ1UsS0FBSyxHQUFHVCxJQUFJO0lBRWpCLElBQUksQ0FBQ1UscUJBQXFCLEdBQUcsSUFBSSxDQUFDQyxxQkFBcUIsQ0FBQ0MsSUFBSSxDQUFFLElBQUssQ0FBQztJQUNwRSxJQUFJLENBQUNaLElBQUksQ0FBQ2EsMkJBQTJCLENBQUNDLFdBQVcsQ0FBRSxJQUFJLENBQUNKLHFCQUFzQixDQUFDO0VBQ2pGOztFQUVBO0VBQ1VDLHFCQUFxQkEsQ0FBQSxFQUFTO0lBQ3RDO0VBQUE7O0VBR0Y7QUFDRjtBQUNBO0VBQ0UsSUFBV1gsSUFBSUEsQ0FBQSxFQUFTO0lBQ3RCLE9BQU8sSUFBSSxDQUFDUyxLQUFLO0VBQ25COztFQUVBO0FBQ0Y7QUFDQTtFQUNTTSxXQUFXQSxDQUFBLEVBQVk7SUFDNUIsT0FBTyxJQUFJLENBQUNaLE1BQU0sS0FBSyxJQUFJO0VBQzdCOztFQUVBO0FBQ0Y7QUFDQTtFQUNFLElBQVdGLEtBQUtBLENBQUEsRUFBZ0I7SUFDOUJlLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ2IsTUFBTyxDQUFDO0lBRS9CLE9BQU8sSUFBSSxDQUFDQSxNQUFNO0VBQ3BCOztFQUVBO0FBQ0Y7QUFDQTtFQUNTYyxTQUFTQSxDQUFFQyxXQUF3QixFQUFZO0lBQ3BELE9BQU9BLFdBQVcsS0FBS3hCLFdBQVcsQ0FBQ3lCLFVBQVUsR0FBRyxJQUFJLENBQUNsQixLQUFLLENBQUNtQixZQUFZLEdBQUcsSUFBSSxDQUFDbkIsS0FBSyxDQUFDb0IsYUFBYTtFQUNwRzs7RUFFQTtBQUNGO0FBQ0E7RUFDU0MsT0FBT0EsQ0FBQSxFQUFTO0lBQ3JCLElBQUksQ0FBQ3BCLG1CQUFtQixJQUFJLElBQUksQ0FBQ0EsbUJBQW1CLENBQUNvQixPQUFPLENBQUMsQ0FBQztJQUU5RCxJQUFJLENBQUN0QixJQUFJLENBQUNhLDJCQUEyQixDQUFDVSxjQUFjLENBQUUsSUFBSSxDQUFDYixxQkFBc0IsQ0FBQztFQUNwRjtBQUNGO0FBRUFkLE9BQU8sQ0FBQzRCLFFBQVEsQ0FBRSxZQUFZLEVBQUUzQixVQUFXLENBQUMifQ==