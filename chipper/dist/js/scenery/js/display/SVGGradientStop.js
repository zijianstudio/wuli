// Copyright 2017-2022, University of Colorado Boulder

/**
 * Handles creation of an SVG stop element, and handles keeping it updated based on property/color changes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import Pool from '../../../phet-core/js/Pool.js';
import { Color, scenery, svgns } from '../imports.js';
const scratchColor = new Color('transparent');
class SVGGradientStop {
  // persistent

  // transient

  constructor(svgGradient, ratio, color) {
    this.initialize(svgGradient, ratio, color);
  }
  isActiveSVGGradientStop() {
    return !!this.svgGradient;
  }
  initialize(svgGradient, ratio, color) {
    sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] initialize: ${svgGradient.gradient.id} : ${ratio}`);
    sceneryLog && sceneryLog.Paints && sceneryLog.push();
    this.svgGradient = svgGradient;
    this.color = color;
    this.ratio = ratio;
    this.svgElement = this.svgElement || document.createElementNS(svgns, 'stop');
    this.svgElement.setAttribute('offset', '' + ratio);
    this.dirty = true; // true here so our update() actually properly initializes

    this.update();
    this.propertyListener = this.propertyListener || this.onPropertyChange.bind(this);
    this.colorListener = this.colorListener || this.markDirty.bind(this);
    if (color instanceof ReadOnlyProperty) {
      sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] adding Property listener: ${this.svgGradient.gradient.id} : ${this.ratio}`);
      color.lazyLink(this.propertyListener);
      if (color.value instanceof Color) {
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] adding Color listener: ${this.svgGradient.gradient.id} : ${this.ratio}`);
        color.value.changeEmitter.addListener(this.colorListener);
      }
    } else if (color instanceof Color) {
      sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] adding Color listener: ${this.svgGradient.gradient.id} : ${this.ratio}`);
      color.changeEmitter.addListener(this.colorListener);
    }
    sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    return this;
  }

  /**
   * Called when our color is a Property and it changes.
   */
  onPropertyChange(newValue, oldValue) {
    assert && assert(this.isActiveSVGGradientStop());
    const activeSelf = this;
    if (oldValue instanceof Color) {
      sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] removing Color listener: ${activeSelf.svgGradient.gradient.id} : ${this.ratio}`);
      oldValue.changeEmitter.removeListener(this.colorListener);
    }
    if (newValue instanceof Color) {
      sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] adding Color listener: ${activeSelf.svgGradient.gradient.id} : ${this.ratio}`);
      newValue.changeEmitter.addListener(this.colorListener);
    }
    this.markDirty();
  }

  /**
   * Should be called when the color stop's value may have changed.
   */
  markDirty() {
    assert && assert(this.isActiveSVGGradientStop());
    this.dirty = true;
    this.svgGradient.markDirty();
  }

  /**
   * Updates the color stop to whatever the current color should be.
   */
  update() {
    if (!this.dirty) {
      return;
    }
    this.dirty = false;
    assert && assert(this.isActiveSVGGradientStop());
    const activeSelf = this;
    sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] update: ${activeSelf.svgGradient.gradient.id} : ${this.ratio}`);
    sceneryLog && sceneryLog.Paints && sceneryLog.push();

    // {Color|string|Property.<Color|string|null>|null}
    let color = this.color;

    // to {Color|string|null}
    if (color instanceof ReadOnlyProperty) {
      color = color.value;
    }

    // to {Color|string}
    if (color === null) {
      color = 'transparent';
    }

    // to {Color}, in our scratchColor
    if (typeof color === 'string') {
      scratchColor.setCSS(color);
    } else {
      scratchColor.set(color);
    }

    // Since SVG doesn't support parsing scientific notation (e.g. 7e5), we need to output fixed decimal-point strings.
    // Since this needs to be done quickly, and we don't particularly care about slight rounding differences (it's
    // being used for display purposes only, and is never shown to the user), we use the built-in JS toFixed instead of
    // Dot's version of toFixed. See https://github.com/phetsims/kite/issues/50
    const stopOpacityRule = `stop-opacity: ${scratchColor.a.toFixed(20)};`; // eslint-disable-line bad-sim-text

    // For GC, mutate the color so it is just RGB and output that CSS also
    scratchColor.alpha = 1;
    const stopColorRule = `stop-color: ${scratchColor.toCSS()};`;
    this.svgElement.setAttribute('style', `${stopColorRule} ${stopOpacityRule}`);
    sceneryLog && sceneryLog.Paints && sceneryLog.pop();
  }

  /**
   * Disposes, so that it can be reused from the pool.
   */
  dispose() {
    assert && assert(this.isActiveSVGGradientStop());
    const activeSelf = this;
    sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] dispose: ${activeSelf.svgGradient.gradient.id} : ${this.ratio}`);
    sceneryLog && sceneryLog.Paints && sceneryLog.push();
    const color = this.color;
    if (color instanceof ReadOnlyProperty) {
      sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] removing Property listener: ${activeSelf.svgGradient.gradient.id} : ${this.ratio}`);
      if (color.hasListener(this.propertyListener)) {
        color.unlink(this.propertyListener);
      }
      if (color.value instanceof Color) {
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] removing Color listener: ${activeSelf.svgGradient.gradient.id} : ${this.ratio}`);
        color.value.changeEmitter.removeListener(this.colorListener);
      }
    } else if (color instanceof Color) {
      sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] removing Color listener: ${activeSelf.svgGradient.gradient.id} : ${this.ratio}`);
      color.changeEmitter.removeListener(this.colorListener);
    }
    this.color = null; // clear the reference
    this.svgGradient = null; // clear the reference

    this.freeToPool();
    sceneryLog && sceneryLog.Paints && sceneryLog.pop();
  }
  freeToPool() {
    SVGGradientStop.pool.freeToPool(this);
  }
  static pool = new Pool(SVGGradientStop);
}
scenery.register('SVGGradientStop', SVGGradientStop);
export default SVGGradientStop;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFkT25seVByb3BlcnR5IiwiUG9vbCIsIkNvbG9yIiwic2NlbmVyeSIsInN2Z25zIiwic2NyYXRjaENvbG9yIiwiU1ZHR3JhZGllbnRTdG9wIiwiY29uc3RydWN0b3IiLCJzdmdHcmFkaWVudCIsInJhdGlvIiwiY29sb3IiLCJpbml0aWFsaXplIiwiaXNBY3RpdmVTVkdHcmFkaWVudFN0b3AiLCJzY2VuZXJ5TG9nIiwiUGFpbnRzIiwiZ3JhZGllbnQiLCJpZCIsInB1c2giLCJzdmdFbGVtZW50IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50TlMiLCJzZXRBdHRyaWJ1dGUiLCJkaXJ0eSIsInVwZGF0ZSIsInByb3BlcnR5TGlzdGVuZXIiLCJvblByb3BlcnR5Q2hhbmdlIiwiYmluZCIsImNvbG9yTGlzdGVuZXIiLCJtYXJrRGlydHkiLCJsYXp5TGluayIsInZhbHVlIiwiY2hhbmdlRW1pdHRlciIsImFkZExpc3RlbmVyIiwicG9wIiwibmV3VmFsdWUiLCJvbGRWYWx1ZSIsImFzc2VydCIsImFjdGl2ZVNlbGYiLCJyZW1vdmVMaXN0ZW5lciIsInNldENTUyIsInNldCIsInN0b3BPcGFjaXR5UnVsZSIsImEiLCJ0b0ZpeGVkIiwiYWxwaGEiLCJzdG9wQ29sb3JSdWxlIiwidG9DU1MiLCJkaXNwb3NlIiwiaGFzTGlzdGVuZXIiLCJ1bmxpbmsiLCJmcmVlVG9Qb29sIiwicG9vbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU1ZHR3JhZGllbnRTdG9wLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEhhbmRsZXMgY3JlYXRpb24gb2YgYW4gU1ZHIHN0b3AgZWxlbWVudCwgYW5kIGhhbmRsZXMga2VlcGluZyBpdCB1cGRhdGVkIGJhc2VkIG9uIHByb3BlcnR5L2NvbG9yIGNoYW5nZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUG9vbCwgeyBUUG9vbGFibGUgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbC5qcyc7XHJcbmltcG9ydCBXaXRob3V0TnVsbCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvV2l0aG91dE51bGwuanMnO1xyXG5pbXBvcnQgeyBBY3RpdmVTVkdHcmFkaWVudCwgQ29sb3IsIFRDb2xvciwgc2NlbmVyeSwgc3ZnbnMgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbmNvbnN0IHNjcmF0Y2hDb2xvciA9IG5ldyBDb2xvciggJ3RyYW5zcGFyZW50JyApO1xyXG5cclxuZXhwb3J0IHR5cGUgQWN0aXZlU1ZHR3JhZGllbnRTdG9wID0gV2l0aG91dE51bGw8U1ZHR3JhZGllbnRTdG9wLCAnc3ZnR3JhZGllbnQnPjtcclxuXHJcbmNsYXNzIFNWR0dyYWRpZW50U3RvcCBpbXBsZW1lbnRzIFRQb29sYWJsZSB7XHJcblxyXG4gIC8vIHBlcnNpc3RlbnRcclxuICBwdWJsaWMgc3ZnRWxlbWVudCE6IFNWR1N0b3BFbGVtZW50O1xyXG5cclxuICAvLyB0cmFuc2llbnRcclxuICBwdWJsaWMgc3ZnR3JhZGllbnQhOiBBY3RpdmVTVkdHcmFkaWVudCB8IG51bGw7XHJcbiAgcHVibGljIGNvbG9yITogVENvbG9yO1xyXG5cclxuICBwdWJsaWMgcmF0aW8hOiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBkaXJ0eSE6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBwcm9wZXJ0eUxpc3RlbmVyITogKCkgPT4gdm9pZDtcclxuICBwcml2YXRlIGNvbG9yTGlzdGVuZXIhOiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHN2Z0dyYWRpZW50OiBBY3RpdmVTVkdHcmFkaWVudCwgcmF0aW86IG51bWJlciwgY29sb3I6IFRDb2xvciApIHtcclxuICAgIHRoaXMuaW5pdGlhbGl6ZSggc3ZnR3JhZGllbnQsIHJhdGlvLCBjb2xvciApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGlzQWN0aXZlU1ZHR3JhZGllbnRTdG9wKCk6IHRoaXMgaXMgQWN0aXZlU1ZHR3JhZGllbnRTdG9wIHsgcmV0dXJuICEhdGhpcy5zdmdHcmFkaWVudDsgfVxyXG5cclxuICBwdWJsaWMgaW5pdGlhbGl6ZSggc3ZnR3JhZGllbnQ6IEFjdGl2ZVNWR0dyYWRpZW50LCByYXRpbzogbnVtYmVyLCBjb2xvcjogVENvbG9yICk6IHRoaXMge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggYFtTVkdHcmFkaWVudFN0b3BdIGluaXRpYWxpemU6ICR7c3ZnR3JhZGllbnQuZ3JhZGllbnQuaWR9IDogJHtyYXRpb31gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIHRoaXMuc3ZnR3JhZGllbnQgPSBzdmdHcmFkaWVudDtcclxuICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcclxuICAgIHRoaXMucmF0aW8gPSByYXRpbztcclxuXHJcbiAgICB0aGlzLnN2Z0VsZW1lbnQgPSB0aGlzLnN2Z0VsZW1lbnQgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBzdmducywgJ3N0b3AnICk7XHJcblxyXG4gICAgdGhpcy5zdmdFbGVtZW50LnNldEF0dHJpYnV0ZSggJ29mZnNldCcsICcnICsgcmF0aW8gKTtcclxuXHJcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTsgLy8gdHJ1ZSBoZXJlIHNvIG91ciB1cGRhdGUoKSBhY3R1YWxseSBwcm9wZXJseSBpbml0aWFsaXplc1xyXG5cclxuICAgIHRoaXMudXBkYXRlKCk7XHJcblxyXG4gICAgdGhpcy5wcm9wZXJ0eUxpc3RlbmVyID0gdGhpcy5wcm9wZXJ0eUxpc3RlbmVyIHx8IHRoaXMub25Qcm9wZXJ0eUNoYW5nZS5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLmNvbG9yTGlzdGVuZXIgPSB0aGlzLmNvbG9yTGlzdGVuZXIgfHwgdGhpcy5tYXJrRGlydHkuYmluZCggdGhpcyApO1xyXG5cclxuICAgIGlmICggY29sb3IgaW5zdGFuY2VvZiBSZWFkT25seVByb3BlcnR5ICkge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCBgW1NWR0dyYWRpZW50U3RvcF0gYWRkaW5nIFByb3BlcnR5IGxpc3RlbmVyOiAke3RoaXMuc3ZnR3JhZGllbnQuZ3JhZGllbnQuaWR9IDogJHt0aGlzLnJhdGlvfWAgKTtcclxuICAgICAgY29sb3IubGF6eUxpbmsoIHRoaXMucHJvcGVydHlMaXN0ZW5lciApO1xyXG4gICAgICBpZiAoIGNvbG9yLnZhbHVlIGluc3RhbmNlb2YgQ29sb3IgKSB7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggYFtTVkdHcmFkaWVudFN0b3BdIGFkZGluZyBDb2xvciBsaXN0ZW5lcjogJHt0aGlzLnN2Z0dyYWRpZW50LmdyYWRpZW50LmlkfSA6ICR7dGhpcy5yYXRpb31gICk7XHJcbiAgICAgICAgY29sb3IudmFsdWUuY2hhbmdlRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5jb2xvckxpc3RlbmVyICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBjb2xvciBpbnN0YW5jZW9mIENvbG9yICkge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCBgW1NWR0dyYWRpZW50U3RvcF0gYWRkaW5nIENvbG9yIGxpc3RlbmVyOiAke3RoaXMuc3ZnR3JhZGllbnQuZ3JhZGllbnQuaWR9IDogJHt0aGlzLnJhdGlvfWAgKTtcclxuICAgICAgY29sb3IuY2hhbmdlRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5jb2xvckxpc3RlbmVyICk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gb3VyIGNvbG9yIGlzIGEgUHJvcGVydHkgYW5kIGl0IGNoYW5nZXMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvblByb3BlcnR5Q2hhbmdlKCBuZXdWYWx1ZTogQ29sb3IgfCBzdHJpbmcgfCBudWxsLCBvbGRWYWx1ZTogQ29sb3IgfCBzdHJpbmcgfCBudWxsICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0FjdGl2ZVNWR0dyYWRpZW50U3RvcCgpICk7XHJcbiAgICBjb25zdCBhY3RpdmVTZWxmID0gdGhpcyBhcyBBY3RpdmVTVkdHcmFkaWVudFN0b3A7XHJcblxyXG4gICAgaWYgKCBvbGRWYWx1ZSBpbnN0YW5jZW9mIENvbG9yICkge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCBgW1NWR0dyYWRpZW50U3RvcF0gcmVtb3ZpbmcgQ29sb3IgbGlzdGVuZXI6ICR7YWN0aXZlU2VsZi5zdmdHcmFkaWVudC5ncmFkaWVudC5pZH0gOiAke3RoaXMucmF0aW99YCApO1xyXG4gICAgICBvbGRWYWx1ZS5jaGFuZ2VFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLmNvbG9yTGlzdGVuZXIgKTtcclxuICAgIH1cclxuICAgIGlmICggbmV3VmFsdWUgaW5zdGFuY2VvZiBDb2xvciApIHtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggYFtTVkdHcmFkaWVudFN0b3BdIGFkZGluZyBDb2xvciBsaXN0ZW5lcjogJHthY3RpdmVTZWxmLnN2Z0dyYWRpZW50LmdyYWRpZW50LmlkfSA6ICR7dGhpcy5yYXRpb31gICk7XHJcbiAgICAgIG5ld1ZhbHVlLmNoYW5nZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuY29sb3JMaXN0ZW5lciApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubWFya0RpcnR5KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTaG91bGQgYmUgY2FsbGVkIHdoZW4gdGhlIGNvbG9yIHN0b3AncyB2YWx1ZSBtYXkgaGF2ZSBjaGFuZ2VkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgbWFya0RpcnR5KCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0FjdGl2ZVNWR0dyYWRpZW50U3RvcCgpICk7XHJcblxyXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XHJcbiAgICAoIHRoaXMgYXMgQWN0aXZlU1ZHR3JhZGllbnRTdG9wICkuc3ZnR3JhZGllbnQubWFya0RpcnR5KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSBjb2xvciBzdG9wIHRvIHdoYXRldmVyIHRoZSBjdXJyZW50IGNvbG9yIHNob3VsZCBiZS5cclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xyXG4gICAgaWYgKCAhdGhpcy5kaXJ0eSApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNBY3RpdmVTVkdHcmFkaWVudFN0b3AoKSApO1xyXG4gICAgY29uc3QgYWN0aXZlU2VsZiA9IHRoaXMgYXMgQWN0aXZlU1ZHR3JhZGllbnRTdG9wO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoIGBbU1ZHR3JhZGllbnRTdG9wXSB1cGRhdGU6ICR7YWN0aXZlU2VsZi5zdmdHcmFkaWVudC5ncmFkaWVudC5pZH0gOiAke3RoaXMucmF0aW99YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyB7Q29sb3J8c3RyaW5nfFByb3BlcnR5LjxDb2xvcnxzdHJpbmd8bnVsbD58bnVsbH1cclxuICAgIGxldCBjb2xvciA9IHRoaXMuY29sb3I7XHJcblxyXG4gICAgLy8gdG8ge0NvbG9yfHN0cmluZ3xudWxsfVxyXG4gICAgaWYgKCBjb2xvciBpbnN0YW5jZW9mIFJlYWRPbmx5UHJvcGVydHkgKSB7XHJcbiAgICAgIGNvbG9yID0gY29sb3IudmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdG8ge0NvbG9yfHN0cmluZ31cclxuICAgIGlmICggY29sb3IgPT09IG51bGwgKSB7XHJcbiAgICAgIGNvbG9yID0gJ3RyYW5zcGFyZW50JztcclxuICAgIH1cclxuXHJcbiAgICAvLyB0byB7Q29sb3J9LCBpbiBvdXIgc2NyYXRjaENvbG9yXHJcbiAgICBpZiAoIHR5cGVvZiBjb2xvciA9PT0gJ3N0cmluZycgKSB7XHJcbiAgICAgIHNjcmF0Y2hDb2xvci5zZXRDU1MoIGNvbG9yICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgc2NyYXRjaENvbG9yLnNldCggY29sb3IgYXMgQ29sb3IgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaW5jZSBTVkcgZG9lc24ndCBzdXBwb3J0IHBhcnNpbmcgc2NpZW50aWZpYyBub3RhdGlvbiAoZS5nLiA3ZTUpLCB3ZSBuZWVkIHRvIG91dHB1dCBmaXhlZCBkZWNpbWFsLXBvaW50IHN0cmluZ3MuXHJcbiAgICAvLyBTaW5jZSB0aGlzIG5lZWRzIHRvIGJlIGRvbmUgcXVpY2tseSwgYW5kIHdlIGRvbid0IHBhcnRpY3VsYXJseSBjYXJlIGFib3V0IHNsaWdodCByb3VuZGluZyBkaWZmZXJlbmNlcyAoaXQnc1xyXG4gICAgLy8gYmVpbmcgdXNlZCBmb3IgZGlzcGxheSBwdXJwb3NlcyBvbmx5LCBhbmQgaXMgbmV2ZXIgc2hvd24gdG8gdGhlIHVzZXIpLCB3ZSB1c2UgdGhlIGJ1aWx0LWluIEpTIHRvRml4ZWQgaW5zdGVhZCBvZlxyXG4gICAgLy8gRG90J3MgdmVyc2lvbiBvZiB0b0ZpeGVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzUwXHJcbiAgICBjb25zdCBzdG9wT3BhY2l0eVJ1bGUgPSBgc3RvcC1vcGFjaXR5OiAke3NjcmF0Y2hDb2xvci5hLnRvRml4ZWQoIDIwICl9O2A7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFkLXNpbS10ZXh0XHJcblxyXG4gICAgLy8gRm9yIEdDLCBtdXRhdGUgdGhlIGNvbG9yIHNvIGl0IGlzIGp1c3QgUkdCIGFuZCBvdXRwdXQgdGhhdCBDU1MgYWxzb1xyXG4gICAgc2NyYXRjaENvbG9yLmFscGhhID0gMTtcclxuICAgIGNvbnN0IHN0b3BDb2xvclJ1bGUgPSBgc3RvcC1jb2xvcjogJHtzY3JhdGNoQ29sb3IudG9DU1MoKX07YDtcclxuXHJcbiAgICB0aGlzLnN2Z0VsZW1lbnQuc2V0QXR0cmlidXRlKCAnc3R5bGUnLCBgJHtzdG9wQ29sb3JSdWxlfSAke3N0b3BPcGFjaXR5UnVsZX1gICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcG9zZXMsIHNvIHRoYXQgaXQgY2FuIGJlIHJldXNlZCBmcm9tIHRoZSBwb29sLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0FjdGl2ZVNWR0dyYWRpZW50U3RvcCgpICk7XHJcbiAgICBjb25zdCBhY3RpdmVTZWxmID0gdGhpcyBhcyBBY3RpdmVTVkdHcmFkaWVudFN0b3A7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggYFtTVkdHcmFkaWVudFN0b3BdIGRpc3Bvc2U6ICR7YWN0aXZlU2VsZi5zdmdHcmFkaWVudC5ncmFkaWVudC5pZH0gOiAke3RoaXMucmF0aW99YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBjb25zdCBjb2xvciA9IHRoaXMuY29sb3I7XHJcblxyXG4gICAgaWYgKCBjb2xvciBpbnN0YW5jZW9mIFJlYWRPbmx5UHJvcGVydHkgKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoIGBbU1ZHR3JhZGllbnRTdG9wXSByZW1vdmluZyBQcm9wZXJ0eSBsaXN0ZW5lcjogJHthY3RpdmVTZWxmLnN2Z0dyYWRpZW50LmdyYWRpZW50LmlkfSA6ICR7dGhpcy5yYXRpb31gICk7XHJcbiAgICAgIGlmICggY29sb3IuaGFzTGlzdGVuZXIoIHRoaXMucHJvcGVydHlMaXN0ZW5lciApICkge1xyXG4gICAgICAgIGNvbG9yLnVubGluayggdGhpcy5wcm9wZXJ0eUxpc3RlbmVyICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBjb2xvci52YWx1ZSBpbnN0YW5jZW9mIENvbG9yICkge1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoIGBbU1ZHR3JhZGllbnRTdG9wXSByZW1vdmluZyBDb2xvciBsaXN0ZW5lcjogJHthY3RpdmVTZWxmLnN2Z0dyYWRpZW50LmdyYWRpZW50LmlkfSA6ICR7dGhpcy5yYXRpb31gICk7XHJcbiAgICAgICAgY29sb3IudmFsdWUuY2hhbmdlRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5jb2xvckxpc3RlbmVyICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBjb2xvciBpbnN0YW5jZW9mIENvbG9yICkge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCBgW1NWR0dyYWRpZW50U3RvcF0gcmVtb3ZpbmcgQ29sb3IgbGlzdGVuZXI6ICR7YWN0aXZlU2VsZi5zdmdHcmFkaWVudC5ncmFkaWVudC5pZH0gOiAke3RoaXMucmF0aW99YCApO1xyXG4gICAgICBjb2xvci5jaGFuZ2VFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLmNvbG9yTGlzdGVuZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNvbG9yID0gbnVsbDsgLy8gY2xlYXIgdGhlIHJlZmVyZW5jZVxyXG4gICAgdGhpcy5zdmdHcmFkaWVudCA9IG51bGw7IC8vIGNsZWFyIHRoZSByZWZlcmVuY2VcclxuXHJcbiAgICB0aGlzLmZyZWVUb1Bvb2woKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZnJlZVRvUG9vbCgpOiB2b2lkIHtcclxuICAgIFNWR0dyYWRpZW50U3RvcC5wb29sLmZyZWVUb1Bvb2woIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgcG9vbCA9IG5ldyBQb29sKCBTVkdHcmFkaWVudFN0b3AgKTtcclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ1NWR0dyYWRpZW50U3RvcCcsIFNWR0dyYWRpZW50U3RvcCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgU1ZHR3JhZGllbnRTdG9wOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxnQkFBZ0IsTUFBTSxzQ0FBc0M7QUFDbkUsT0FBT0MsSUFBSSxNQUFxQiwrQkFBK0I7QUFFL0QsU0FBNEJDLEtBQUssRUFBVUMsT0FBTyxFQUFFQyxLQUFLLFFBQVEsZUFBZTtBQUVoRixNQUFNQyxZQUFZLEdBQUcsSUFBSUgsS0FBSyxDQUFFLGFBQWMsQ0FBQztBQUkvQyxNQUFNSSxlQUFlLENBQXNCO0VBRXpDOztFQUdBOztFQVNPQyxXQUFXQSxDQUFFQyxXQUE4QixFQUFFQyxLQUFhLEVBQUVDLEtBQWEsRUFBRztJQUNqRixJQUFJLENBQUNDLFVBQVUsQ0FBRUgsV0FBVyxFQUFFQyxLQUFLLEVBQUVDLEtBQU0sQ0FBQztFQUM5QztFQUVPRSx1QkFBdUJBLENBQUEsRUFBa0M7SUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUNKLFdBQVc7RUFBRTtFQUV0RkcsVUFBVUEsQ0FBRUgsV0FBOEIsRUFBRUMsS0FBYSxFQUFFQyxLQUFhLEVBQVM7SUFDdEZHLFVBQVUsSUFBSUEsVUFBVSxDQUFDQyxNQUFNLElBQUlELFVBQVUsQ0FBQ0MsTUFBTSxDQUFHLGlDQUFnQ04sV0FBVyxDQUFDTyxRQUFRLENBQUNDLEVBQUcsTUFBS1AsS0FBTSxFQUFFLENBQUM7SUFDN0hJLFVBQVUsSUFBSUEsVUFBVSxDQUFDQyxNQUFNLElBQUlELFVBQVUsQ0FBQ0ksSUFBSSxDQUFDLENBQUM7SUFFcEQsSUFBSSxDQUFDVCxXQUFXLEdBQUdBLFdBQVc7SUFDOUIsSUFBSSxDQUFDRSxLQUFLLEdBQUdBLEtBQUs7SUFDbEIsSUFBSSxDQUFDRCxLQUFLLEdBQUdBLEtBQUs7SUFFbEIsSUFBSSxDQUFDUyxVQUFVLEdBQUcsSUFBSSxDQUFDQSxVQUFVLElBQUlDLFFBQVEsQ0FBQ0MsZUFBZSxDQUFFaEIsS0FBSyxFQUFFLE1BQU8sQ0FBQztJQUU5RSxJQUFJLENBQUNjLFVBQVUsQ0FBQ0csWUFBWSxDQUFFLFFBQVEsRUFBRSxFQUFFLEdBQUdaLEtBQU0sQ0FBQztJQUVwRCxJQUFJLENBQUNhLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQzs7SUFFbkIsSUFBSSxDQUFDQyxNQUFNLENBQUMsQ0FBQztJQUViLElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDQSxnQkFBZ0IsSUFBSSxJQUFJLENBQUNDLGdCQUFnQixDQUFDQyxJQUFJLENBQUUsSUFBSyxDQUFDO0lBQ25GLElBQUksQ0FBQ0MsYUFBYSxHQUFHLElBQUksQ0FBQ0EsYUFBYSxJQUFJLElBQUksQ0FBQ0MsU0FBUyxDQUFDRixJQUFJLENBQUUsSUFBSyxDQUFDO0lBRXRFLElBQUtoQixLQUFLLFlBQVlWLGdCQUFnQixFQUFHO01BQ3ZDYSxVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsTUFBTSxJQUFJRCxVQUFVLENBQUNDLE1BQU0sQ0FBRywrQ0FBOEMsSUFBSSxDQUFDTixXQUFXLENBQUNPLFFBQVEsQ0FBQ0MsRUFBRyxNQUFLLElBQUksQ0FBQ1AsS0FBTSxFQUFFLENBQUM7TUFDckpDLEtBQUssQ0FBQ21CLFFBQVEsQ0FBRSxJQUFJLENBQUNMLGdCQUFpQixDQUFDO01BQ3ZDLElBQUtkLEtBQUssQ0FBQ29CLEtBQUssWUFBWTVCLEtBQUssRUFBRztRQUNsQ1csVUFBVSxJQUFJQSxVQUFVLENBQUNDLE1BQU0sSUFBSUQsVUFBVSxDQUFDQyxNQUFNLENBQUcsNENBQTJDLElBQUksQ0FBQ04sV0FBVyxDQUFDTyxRQUFRLENBQUNDLEVBQUcsTUFBSyxJQUFJLENBQUNQLEtBQU0sRUFBRSxDQUFDO1FBQ2xKQyxLQUFLLENBQUNvQixLQUFLLENBQUNDLGFBQWEsQ0FBQ0MsV0FBVyxDQUFFLElBQUksQ0FBQ0wsYUFBYyxDQUFDO01BQzdEO0lBQ0YsQ0FBQyxNQUNJLElBQUtqQixLQUFLLFlBQVlSLEtBQUssRUFBRztNQUNqQ1csVUFBVSxJQUFJQSxVQUFVLENBQUNDLE1BQU0sSUFBSUQsVUFBVSxDQUFDQyxNQUFNLENBQUcsNENBQTJDLElBQUksQ0FBQ04sV0FBVyxDQUFDTyxRQUFRLENBQUNDLEVBQUcsTUFBSyxJQUFJLENBQUNQLEtBQU0sRUFBRSxDQUFDO01BQ2xKQyxLQUFLLENBQUNxQixhQUFhLENBQUNDLFdBQVcsQ0FBRSxJQUFJLENBQUNMLGFBQWMsQ0FBQztJQUN2RDtJQUVBZCxVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsTUFBTSxJQUFJRCxVQUFVLENBQUNvQixHQUFHLENBQUMsQ0FBQztJQUVuRCxPQUFPLElBQUk7RUFDYjs7RUFFQTtBQUNGO0FBQ0E7RUFDVVIsZ0JBQWdCQSxDQUFFUyxRQUErQixFQUFFQyxRQUErQixFQUFTO0lBQ2pHQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxJQUFJLENBQUN4Qix1QkFBdUIsQ0FBQyxDQUFFLENBQUM7SUFDbEQsTUFBTXlCLFVBQVUsR0FBRyxJQUE2QjtJQUVoRCxJQUFLRixRQUFRLFlBQVlqQyxLQUFLLEVBQUc7TUFDL0JXLFVBQVUsSUFBSUEsVUFBVSxDQUFDQyxNQUFNLElBQUlELFVBQVUsQ0FBQ0MsTUFBTSxDQUFHLDhDQUE2Q3VCLFVBQVUsQ0FBQzdCLFdBQVcsQ0FBQ08sUUFBUSxDQUFDQyxFQUFHLE1BQUssSUFBSSxDQUFDUCxLQUFNLEVBQUUsQ0FBQztNQUMxSjBCLFFBQVEsQ0FBQ0osYUFBYSxDQUFDTyxjQUFjLENBQUUsSUFBSSxDQUFDWCxhQUFjLENBQUM7SUFDN0Q7SUFDQSxJQUFLTyxRQUFRLFlBQVloQyxLQUFLLEVBQUc7TUFDL0JXLFVBQVUsSUFBSUEsVUFBVSxDQUFDQyxNQUFNLElBQUlELFVBQVUsQ0FBQ0MsTUFBTSxDQUFHLDRDQUEyQ3VCLFVBQVUsQ0FBQzdCLFdBQVcsQ0FBQ08sUUFBUSxDQUFDQyxFQUFHLE1BQUssSUFBSSxDQUFDUCxLQUFNLEVBQUUsQ0FBQztNQUN4SnlCLFFBQVEsQ0FBQ0gsYUFBYSxDQUFDQyxXQUFXLENBQUUsSUFBSSxDQUFDTCxhQUFjLENBQUM7SUFDMUQ7SUFFQSxJQUFJLENBQUNDLFNBQVMsQ0FBQyxDQUFDO0VBQ2xCOztFQUVBO0FBQ0Y7QUFDQTtFQUNVQSxTQUFTQSxDQUFBLEVBQVM7SUFDeEJRLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ3hCLHVCQUF1QixDQUFDLENBQUUsQ0FBQztJQUVsRCxJQUFJLENBQUNVLEtBQUssR0FBRyxJQUFJO0lBQ2YsSUFBSSxDQUE0QmQsV0FBVyxDQUFDb0IsU0FBUyxDQUFDLENBQUM7RUFDM0Q7O0VBRUE7QUFDRjtBQUNBO0VBQ1NMLE1BQU1BLENBQUEsRUFBUztJQUNwQixJQUFLLENBQUMsSUFBSSxDQUFDRCxLQUFLLEVBQUc7TUFDakI7SUFDRjtJQUNBLElBQUksQ0FBQ0EsS0FBSyxHQUFHLEtBQUs7SUFFbEJjLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ3hCLHVCQUF1QixDQUFDLENBQUUsQ0FBQztJQUNsRCxNQUFNeUIsVUFBVSxHQUFHLElBQTZCO0lBRWhEeEIsVUFBVSxJQUFJQSxVQUFVLENBQUNDLE1BQU0sSUFBSUQsVUFBVSxDQUFDQyxNQUFNLENBQUcsNkJBQTRCdUIsVUFBVSxDQUFDN0IsV0FBVyxDQUFDTyxRQUFRLENBQUNDLEVBQUcsTUFBSyxJQUFJLENBQUNQLEtBQU0sRUFBRSxDQUFDO0lBQ3pJSSxVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsTUFBTSxJQUFJRCxVQUFVLENBQUNJLElBQUksQ0FBQyxDQUFDOztJQUVwRDtJQUNBLElBQUlQLEtBQUssR0FBRyxJQUFJLENBQUNBLEtBQUs7O0lBRXRCO0lBQ0EsSUFBS0EsS0FBSyxZQUFZVixnQkFBZ0IsRUFBRztNQUN2Q1UsS0FBSyxHQUFHQSxLQUFLLENBQUNvQixLQUFLO0lBQ3JCOztJQUVBO0lBQ0EsSUFBS3BCLEtBQUssS0FBSyxJQUFJLEVBQUc7TUFDcEJBLEtBQUssR0FBRyxhQUFhO0lBQ3ZCOztJQUVBO0lBQ0EsSUFBSyxPQUFPQSxLQUFLLEtBQUssUUFBUSxFQUFHO01BQy9CTCxZQUFZLENBQUNrQyxNQUFNLENBQUU3QixLQUFNLENBQUM7SUFDOUIsQ0FBQyxNQUNJO01BQ0hMLFlBQVksQ0FBQ21DLEdBQUcsQ0FBRTlCLEtBQWUsQ0FBQztJQUNwQzs7SUFFQTtJQUNBO0lBQ0E7SUFDQTtJQUNBLE1BQU0rQixlQUFlLEdBQUksaUJBQWdCcEMsWUFBWSxDQUFDcUMsQ0FBQyxDQUFDQyxPQUFPLENBQUUsRUFBRyxDQUFFLEdBQUUsQ0FBQyxDQUFDOztJQUUxRTtJQUNBdEMsWUFBWSxDQUFDdUMsS0FBSyxHQUFHLENBQUM7SUFDdEIsTUFBTUMsYUFBYSxHQUFJLGVBQWN4QyxZQUFZLENBQUN5QyxLQUFLLENBQUMsQ0FBRSxHQUFFO0lBRTVELElBQUksQ0FBQzVCLFVBQVUsQ0FBQ0csWUFBWSxDQUFFLE9BQU8sRUFBRyxHQUFFd0IsYUFBYyxJQUFHSixlQUFnQixFQUFFLENBQUM7SUFFOUU1QixVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsTUFBTSxJQUFJRCxVQUFVLENBQUNvQixHQUFHLENBQUMsQ0FBQztFQUNyRDs7RUFFQTtBQUNGO0FBQ0E7RUFDU2MsT0FBT0EsQ0FBQSxFQUFTO0lBQ3JCWCxNQUFNLElBQUlBLE1BQU0sQ0FBRSxJQUFJLENBQUN4Qix1QkFBdUIsQ0FBQyxDQUFFLENBQUM7SUFDbEQsTUFBTXlCLFVBQVUsR0FBRyxJQUE2QjtJQUVoRHhCLFVBQVUsSUFBSUEsVUFBVSxDQUFDQyxNQUFNLElBQUlELFVBQVUsQ0FBQ0MsTUFBTSxDQUFHLDhCQUE2QnVCLFVBQVUsQ0FBQzdCLFdBQVcsQ0FBQ08sUUFBUSxDQUFDQyxFQUFHLE1BQUssSUFBSSxDQUFDUCxLQUFNLEVBQUUsQ0FBQztJQUMxSUksVUFBVSxJQUFJQSxVQUFVLENBQUNDLE1BQU0sSUFBSUQsVUFBVSxDQUFDSSxJQUFJLENBQUMsQ0FBQztJQUVwRCxNQUFNUCxLQUFLLEdBQUcsSUFBSSxDQUFDQSxLQUFLO0lBRXhCLElBQUtBLEtBQUssWUFBWVYsZ0JBQWdCLEVBQUc7TUFDdkNhLFVBQVUsSUFBSUEsVUFBVSxDQUFDQyxNQUFNLElBQUlELFVBQVUsQ0FBQ0MsTUFBTSxDQUFHLGlEQUFnRHVCLFVBQVUsQ0FBQzdCLFdBQVcsQ0FBQ08sUUFBUSxDQUFDQyxFQUFHLE1BQUssSUFBSSxDQUFDUCxLQUFNLEVBQUUsQ0FBQztNQUM3SixJQUFLQyxLQUFLLENBQUNzQyxXQUFXLENBQUUsSUFBSSxDQUFDeEIsZ0JBQWlCLENBQUMsRUFBRztRQUNoRGQsS0FBSyxDQUFDdUMsTUFBTSxDQUFFLElBQUksQ0FBQ3pCLGdCQUFpQixDQUFDO01BQ3ZDO01BQ0EsSUFBS2QsS0FBSyxDQUFDb0IsS0FBSyxZQUFZNUIsS0FBSyxFQUFHO1FBQ2xDVyxVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsTUFBTSxJQUFJRCxVQUFVLENBQUNDLE1BQU0sQ0FBRyw4Q0FBNkN1QixVQUFVLENBQUM3QixXQUFXLENBQUNPLFFBQVEsQ0FBQ0MsRUFBRyxNQUFLLElBQUksQ0FBQ1AsS0FBTSxFQUFFLENBQUM7UUFDMUpDLEtBQUssQ0FBQ29CLEtBQUssQ0FBQ0MsYUFBYSxDQUFDTyxjQUFjLENBQUUsSUFBSSxDQUFDWCxhQUFjLENBQUM7TUFDaEU7SUFDRixDQUFDLE1BQ0ksSUFBS2pCLEtBQUssWUFBWVIsS0FBSyxFQUFHO01BQ2pDVyxVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsTUFBTSxJQUFJRCxVQUFVLENBQUNDLE1BQU0sQ0FBRyw4Q0FBNkN1QixVQUFVLENBQUM3QixXQUFXLENBQUNPLFFBQVEsQ0FBQ0MsRUFBRyxNQUFLLElBQUksQ0FBQ1AsS0FBTSxFQUFFLENBQUM7TUFDMUpDLEtBQUssQ0FBQ3FCLGFBQWEsQ0FBQ08sY0FBYyxDQUFFLElBQUksQ0FBQ1gsYUFBYyxDQUFDO0lBQzFEO0lBRUEsSUFBSSxDQUFDakIsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ25CLElBQUksQ0FBQ0YsV0FBVyxHQUFHLElBQUksQ0FBQyxDQUFDOztJQUV6QixJQUFJLENBQUMwQyxVQUFVLENBQUMsQ0FBQztJQUVqQnJDLFVBQVUsSUFBSUEsVUFBVSxDQUFDQyxNQUFNLElBQUlELFVBQVUsQ0FBQ29CLEdBQUcsQ0FBQyxDQUFDO0VBQ3JEO0VBRU9pQixVQUFVQSxDQUFBLEVBQVM7SUFDeEI1QyxlQUFlLENBQUM2QyxJQUFJLENBQUNELFVBQVUsQ0FBRSxJQUFLLENBQUM7RUFDekM7RUFFQSxPQUF1QkMsSUFBSSxHQUFHLElBQUlsRCxJQUFJLENBQUVLLGVBQWdCLENBQUM7QUFDM0Q7QUFFQUgsT0FBTyxDQUFDaUQsUUFBUSxDQUFFLGlCQUFpQixFQUFFOUMsZUFBZ0IsQ0FBQztBQUV0RCxlQUFlQSxlQUFlIn0=