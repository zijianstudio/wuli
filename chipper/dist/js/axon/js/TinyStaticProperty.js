// Copyright 2020-2022, University of Colorado Boulder

/**
 * An observable stub which satisfies some of the Property interface, which can store a (static/constant) value
 * and also notify listeners when that value has mutated. The actual value reference does not change, however it can
 * itself be mutated.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import axon from './axon.js';
import TinyProperty from './TinyProperty.js';
export default class TinyStaticProperty extends TinyProperty {
  // When set, it will be called whenever there is an attempt to read the value of this TinyStaticProperty.

  constructor(value, onAccessAttempt) {
    super(value);
    this.onAccessAttempt = onAccessAttempt;
  }

  /**
   * Returns the value. Overridden to support onAccessAttempt.
   */
  get() {
    this.onAccessAttempt();
    return super.get();
  }

  /**
   * Don't set the value of a TinyStaticProperty!
   */
  set(value) {
    throw new Error('Cannot set a TinyStaticProperty value');
  }

  /**
   * Returns true if the value can be set externally. Static Property values should only be mutated, not set.
   */
  isSettable() {
    return false;
  }

  /**
   * Directly notifies listeners of changes.
   */
  notifyListeners(oldValue) {
    // We use this.get() to ensure value is up to date with onAccessAttempt().
    this.emit(this.get(), oldValue, this);
  }

  /**
   * Adds listener and calls it immediately. If listener is already registered, this is a no-op. The initial
   * notification provides the current value for newValue and null for oldValue.
   */
  link(listener) {
    this.addListener(listener);

    // listener called with this.get() to ensure value is up to date with onAccessAttempt().
    listener(this.get(), null, this); // null should be used when an object is expected but unavailable
  }

  /**
   * Returns true if and only if the specified value equals the value of this property
   */
  equalsValue(value) {
    // checked with this.get() to ensure value is up to date with onAccessAttempt()
    return this.areValuesEqual(value, this.get());
  }
}
axon.register('TinyStaticProperty', TinyStaticProperty);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJheG9uIiwiVGlueVByb3BlcnR5IiwiVGlueVN0YXRpY1Byb3BlcnR5IiwiY29uc3RydWN0b3IiLCJ2YWx1ZSIsIm9uQWNjZXNzQXR0ZW1wdCIsImdldCIsInNldCIsIkVycm9yIiwiaXNTZXR0YWJsZSIsIm5vdGlmeUxpc3RlbmVycyIsIm9sZFZhbHVlIiwiZW1pdCIsImxpbmsiLCJsaXN0ZW5lciIsImFkZExpc3RlbmVyIiwiZXF1YWxzVmFsdWUiLCJhcmVWYWx1ZXNFcXVhbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVGlueVN0YXRpY1Byb3BlcnR5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFuIG9ic2VydmFibGUgc3R1YiB3aGljaCBzYXRpc2ZpZXMgc29tZSBvZiB0aGUgUHJvcGVydHkgaW50ZXJmYWNlLCB3aGljaCBjYW4gc3RvcmUgYSAoc3RhdGljL2NvbnN0YW50KSB2YWx1ZVxyXG4gKiBhbmQgYWxzbyBub3RpZnkgbGlzdGVuZXJzIHdoZW4gdGhhdCB2YWx1ZSBoYXMgbXV0YXRlZC4gVGhlIGFjdHVhbCB2YWx1ZSByZWZlcmVuY2UgZG9lcyBub3QgY2hhbmdlLCBob3dldmVyIGl0IGNhblxyXG4gKiBpdHNlbGYgYmUgbXV0YXRlZC5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBheG9uIGZyb20gJy4vYXhvbi5qcyc7XHJcbmltcG9ydCBUaW55UHJvcGVydHkgZnJvbSAnLi9UaW55UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBQcm9wZXJ0eUxpbmtMaXN0ZW5lciB9IGZyb20gJy4vVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGlueVN0YXRpY1Byb3BlcnR5PFQ+IGV4dGVuZHMgVGlueVByb3BlcnR5PFQ+IHtcclxuXHJcbiAgLy8gV2hlbiBzZXQsIGl0IHdpbGwgYmUgY2FsbGVkIHdoZW5ldmVyIHRoZXJlIGlzIGFuIGF0dGVtcHQgdG8gcmVhZCB0aGUgdmFsdWUgb2YgdGhpcyBUaW55U3RhdGljUHJvcGVydHkuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBvbkFjY2Vzc0F0dGVtcHQ6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdmFsdWU6IFQsIG9uQWNjZXNzQXR0ZW1wdDogKCkgPT4gdm9pZCApIHtcclxuICAgIHN1cGVyKCB2YWx1ZSApO1xyXG5cclxuICAgIHRoaXMub25BY2Nlc3NBdHRlbXB0ID0gb25BY2Nlc3NBdHRlbXB0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdmFsdWUuIE92ZXJyaWRkZW4gdG8gc3VwcG9ydCBvbkFjY2Vzc0F0dGVtcHQuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGdldCgpOiBUIHtcclxuICAgIHRoaXMub25BY2Nlc3NBdHRlbXB0KCk7XHJcblxyXG4gICAgcmV0dXJuIHN1cGVyLmdldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRG9uJ3Qgc2V0IHRoZSB2YWx1ZSBvZiBhIFRpbnlTdGF0aWNQcm9wZXJ0eSFcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgc2V0KCB2YWx1ZTogVCApOiB2b2lkIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ0Nhbm5vdCBzZXQgYSBUaW55U3RhdGljUHJvcGVydHkgdmFsdWUnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHZhbHVlIGNhbiBiZSBzZXQgZXh0ZXJuYWxseS4gU3RhdGljIFByb3BlcnR5IHZhbHVlcyBzaG91bGQgb25seSBiZSBtdXRhdGVkLCBub3Qgc2V0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBpc1NldHRhYmxlKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlyZWN0bHkgbm90aWZpZXMgbGlzdGVuZXJzIG9mIGNoYW5nZXMuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIG5vdGlmeUxpc3RlbmVycyggb2xkVmFsdWU6IFQgfCBudWxsICk6IHZvaWQge1xyXG5cclxuICAgIC8vIFdlIHVzZSB0aGlzLmdldCgpIHRvIGVuc3VyZSB2YWx1ZSBpcyB1cCB0byBkYXRlIHdpdGggb25BY2Nlc3NBdHRlbXB0KCkuXHJcbiAgICB0aGlzLmVtaXQoIHRoaXMuZ2V0KCksIG9sZFZhbHVlLCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGxpc3RlbmVyIGFuZCBjYWxscyBpdCBpbW1lZGlhdGVseS4gSWYgbGlzdGVuZXIgaXMgYWxyZWFkeSByZWdpc3RlcmVkLCB0aGlzIGlzIGEgbm8tb3AuIFRoZSBpbml0aWFsXHJcbiAgICogbm90aWZpY2F0aW9uIHByb3ZpZGVzIHRoZSBjdXJyZW50IHZhbHVlIGZvciBuZXdWYWx1ZSBhbmQgbnVsbCBmb3Igb2xkVmFsdWUuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGxpbmsoIGxpc3RlbmVyOiBQcm9wZXJ0eUxpbmtMaXN0ZW5lcjxUPiApOiB2b2lkIHtcclxuICAgIHRoaXMuYWRkTGlzdGVuZXIoIGxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gbGlzdGVuZXIgY2FsbGVkIHdpdGggdGhpcy5nZXQoKSB0byBlbnN1cmUgdmFsdWUgaXMgdXAgdG8gZGF0ZSB3aXRoIG9uQWNjZXNzQXR0ZW1wdCgpLlxyXG4gICAgbGlzdGVuZXIoIHRoaXMuZ2V0KCksIG51bGwsIHRoaXMgKTsgLy8gbnVsbCBzaG91bGQgYmUgdXNlZCB3aGVuIGFuIG9iamVjdCBpcyBleHBlY3RlZCBidXQgdW5hdmFpbGFibGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBhbmQgb25seSBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGVxdWFscyB0aGUgdmFsdWUgb2YgdGhpcyBwcm9wZXJ0eVxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBvdmVycmlkZSBlcXVhbHNWYWx1ZSggdmFsdWU6IFQgKTogYm9vbGVhbiB7XHJcblxyXG4gICAgLy8gY2hlY2tlZCB3aXRoIHRoaXMuZ2V0KCkgdG8gZW5zdXJlIHZhbHVlIGlzIHVwIHRvIGRhdGUgd2l0aCBvbkFjY2Vzc0F0dGVtcHQoKVxyXG4gICAgcmV0dXJuIHRoaXMuYXJlVmFsdWVzRXF1YWwoIHZhbHVlLCB0aGlzLmdldCgpICk7XHJcbiAgfVxyXG59XHJcblxyXG5heG9uLnJlZ2lzdGVyKCAnVGlueVN0YXRpY1Byb3BlcnR5JywgVGlueVN0YXRpY1Byb3BlcnR5ICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxJQUFJLE1BQU0sV0FBVztBQUM1QixPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBRzVDLGVBQWUsTUFBTUMsa0JBQWtCLFNBQVlELFlBQVksQ0FBSTtFQUVqRTs7RUFHT0UsV0FBV0EsQ0FBRUMsS0FBUSxFQUFFQyxlQUEyQixFQUFHO0lBQzFELEtBQUssQ0FBRUQsS0FBTSxDQUFDO0lBRWQsSUFBSSxDQUFDQyxlQUFlLEdBQUdBLGVBQWU7RUFDeEM7O0VBRUE7QUFDRjtBQUNBO0VBQ2tCQyxHQUFHQSxDQUFBLEVBQU07SUFDdkIsSUFBSSxDQUFDRCxlQUFlLENBQUMsQ0FBQztJQUV0QixPQUFPLEtBQUssQ0FBQ0MsR0FBRyxDQUFDLENBQUM7RUFDcEI7O0VBRUE7QUFDRjtBQUNBO0VBQ2tCQyxHQUFHQSxDQUFFSCxLQUFRLEVBQVM7SUFDcEMsTUFBTSxJQUFJSSxLQUFLLENBQUUsdUNBQXdDLENBQUM7RUFDNUQ7O0VBRUE7QUFDRjtBQUNBO0VBQ2tCQyxVQUFVQSxDQUFBLEVBQVk7SUFDcEMsT0FBTyxLQUFLO0VBQ2Q7O0VBRUE7QUFDRjtBQUNBO0VBQ2tCQyxlQUFlQSxDQUFFQyxRQUFrQixFQUFTO0lBRTFEO0lBQ0EsSUFBSSxDQUFDQyxJQUFJLENBQUUsSUFBSSxDQUFDTixHQUFHLENBQUMsQ0FBQyxFQUFFSyxRQUFRLEVBQUUsSUFBSyxDQUFDO0VBQ3pDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ2tCRSxJQUFJQSxDQUFFQyxRQUFpQyxFQUFTO0lBQzlELElBQUksQ0FBQ0MsV0FBVyxDQUFFRCxRQUFTLENBQUM7O0lBRTVCO0lBQ0FBLFFBQVEsQ0FBRSxJQUFJLENBQUNSLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUssQ0FBQyxDQUFDLENBQUM7RUFDdEM7O0VBRUE7QUFDRjtBQUNBO0VBQ3FCVSxXQUFXQSxDQUFFWixLQUFRLEVBQVk7SUFFbEQ7SUFDQSxPQUFPLElBQUksQ0FBQ2EsY0FBYyxDQUFFYixLQUFLLEVBQUUsSUFBSSxDQUFDRSxHQUFHLENBQUMsQ0FBRSxDQUFDO0VBQ2pEO0FBQ0Y7QUFFQU4sSUFBSSxDQUFDa0IsUUFBUSxDQUFFLG9CQUFvQixFQUFFaEIsa0JBQW1CLENBQUMifQ==