// Copyright 2022, University of Colorado Boulder

/**
 * Mixin for storing options that can affect each cell. `null` for values usually means "inherit from the default".
 *
 * Handles a lot of conversion from internal Enumeration values (for performance) and external string representations.
 * This is done primarily for performance and that style of internal enumeration pattern. If string comparisons are
 * faster, that could be used instead.
 *
 * NOTE: Internal non-string representations are also orientation-agnostic - thus "left" and "top" map to the same
 * "start" internally, and thus the external value will appear to "switch" depending on the orientation.
 *
 * NOTE: This is mixed into both the constraint AND the cell, since we have two layers of options. The `null` meaning
 * "inherit from the default" is mainly used for the cells, so that if it's not specified in the cell, it will be
 * specified in the constraint (as non-null).
 *
 * NOTE: This is a mixin meant to be used internally only by Scenery (for the constraint and cell), and should not be
 * used by outside code.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import memoize from '../../../../phet-core/js/memoize.js';
import mutate from '../../../../phet-core/js/mutate.js';
import { LayoutAlign, MARGIN_LAYOUT_CONFIGURABLE_OPTION_KEYS, MarginLayoutConfigurable, scenery } from '../../imports.js';
const FLOW_CONFIGURABLE_OPTION_KEYS = ['orientation', 'align', 'stretch', 'grow'].concat(MARGIN_LAYOUT_CONFIGURABLE_OPTION_KEYS);

// We remove the null values for the values that won't actually take null

// (scenery-internal)
const FlowConfigurable = memoize(type => {
  return class FlowConfigurableMixin extends MarginLayoutConfigurable(type) {
    _orientation = Orientation.HORIZONTAL;

    // (scenery-internal)
    _align = null;
    _stretch = null;
    _grow = null;
    orientationChangedEmitter = new TinyEmitter();

    /**
     * (scenery-internal)
     */
    constructor(...args) {
      super(...args);
    }

    /**
     * (scenery-internal)
     */
    mutateConfigurable(options) {
      super.mutateConfigurable(options);
      mutate(this, FLOW_CONFIGURABLE_OPTION_KEYS, options);
    }

    /**
     * Resets values to the "base" state.
     *
     * This is the fallback state for a constraint where every value is defined and valid. If a cell does not have a
     * specific "overridden" value, or a constraint doesn't have an "overridden" value, then it will take the value
     * defined here.
     *
     * These should be the default values for constraints.
     *
     * (scenery-internal)
     */
    setConfigToBaseDefault() {
      this._align = LayoutAlign.CENTER;
      this._stretch = false;
      this._grow = 0;
      super.setConfigToBaseDefault();
    }

    /**
     * Resets values to the "don't override anything, only inherit from the constraint" state
     *
     * These should be the default values for cells (e.g. "take all the behavior from the constraint, nothing is
     * overridden").
     *
     * (scenery-internal)
     */
    setConfigToInherit() {
      this._align = null;
      this._stretch = null;
      this._grow = null;
      super.setConfigToInherit();
    }

    /**
     * (scenery-internal)
     */
    get orientation() {
      return this._orientation === Orientation.HORIZONTAL ? 'horizontal' : 'vertical';
    }

    /**
     * (scenery-internal)
     */
    set orientation(value) {
      assert && assert(value === 'horizontal' || value === 'vertical');
      const enumOrientation = value === 'horizontal' ? Orientation.HORIZONTAL : Orientation.VERTICAL;
      if (this._orientation !== enumOrientation) {
        this._orientation = enumOrientation;
        this.orientationChangedEmitter.emit();
        this.changedEmitter.emit();
      }
    }

    /**
     * (scenery-internal)
     */
    get align() {
      const result = LayoutAlign.internalToAlign(this._orientation, this._align);
      assert && assert(result === null || typeof result === 'string');
      return result;
    }

    /**
     * (scenery-internal)
     */
    set align(value) {
      assert && assert(LayoutAlign.getAllowedAligns(this._orientation.opposite).includes(value), `align ${value} not supported, with the orientation ${this._orientation}, the valid values are ${LayoutAlign.getAllowedAligns(this._orientation.opposite)}`);

      // remapping align values to an independent set, so they aren't orientation-dependent
      const mappedValue = LayoutAlign.alignToInternal(this._orientation.opposite, value);
      assert && assert(mappedValue === null || mappedValue instanceof LayoutAlign);
      if (this._align !== mappedValue) {
        this._align = mappedValue;
        this.changedEmitter.emit();
      }
    }

    /**
     * (scenery-internal)
     */
    get stretch() {
      return this._stretch;
    }

    /**
     * (scenery-internal)
     */
    set stretch(value) {
      if (this._stretch !== value) {
        this._stretch = value;
        this.changedEmitter.emit();
      }
    }

    /**
     * (scenery-internal)
     */
    get grow() {
      return this._grow;
    }

    /**
     * (scenery-internal)
     */
    set grow(value) {
      assert && assert(value === null || typeof value === 'number' && isFinite(value) && value >= 0);
      if (this._grow !== value) {
        this._grow = value;
        this.changedEmitter.emit();
      }
    }
  };
});
scenery.register('FlowConfigurable', FlowConfigurable);
export default FlowConfigurable;
export { FLOW_CONFIGURABLE_OPTION_KEYS };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsIk9yaWVudGF0aW9uIiwibWVtb2l6ZSIsIm11dGF0ZSIsIkxheW91dEFsaWduIiwiTUFSR0lOX0xBWU9VVF9DT05GSUdVUkFCTEVfT1BUSU9OX0tFWVMiLCJNYXJnaW5MYXlvdXRDb25maWd1cmFibGUiLCJzY2VuZXJ5IiwiRkxPV19DT05GSUdVUkFCTEVfT1BUSU9OX0tFWVMiLCJjb25jYXQiLCJGbG93Q29uZmlndXJhYmxlIiwidHlwZSIsIkZsb3dDb25maWd1cmFibGVNaXhpbiIsIl9vcmllbnRhdGlvbiIsIkhPUklaT05UQUwiLCJfYWxpZ24iLCJfc3RyZXRjaCIsIl9ncm93Iiwib3JpZW50YXRpb25DaGFuZ2VkRW1pdHRlciIsImNvbnN0cnVjdG9yIiwiYXJncyIsIm11dGF0ZUNvbmZpZ3VyYWJsZSIsIm9wdGlvbnMiLCJzZXRDb25maWdUb0Jhc2VEZWZhdWx0IiwiQ0VOVEVSIiwic2V0Q29uZmlnVG9Jbmhlcml0Iiwib3JpZW50YXRpb24iLCJ2YWx1ZSIsImFzc2VydCIsImVudW1PcmllbnRhdGlvbiIsIlZFUlRJQ0FMIiwiZW1pdCIsImNoYW5nZWRFbWl0dGVyIiwiYWxpZ24iLCJyZXN1bHQiLCJpbnRlcm5hbFRvQWxpZ24iLCJnZXRBbGxvd2VkQWxpZ25zIiwib3Bwb3NpdGUiLCJpbmNsdWRlcyIsIm1hcHBlZFZhbHVlIiwiYWxpZ25Ub0ludGVybmFsIiwic3RyZXRjaCIsImdyb3ciLCJpc0Zpbml0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRmxvd0NvbmZpZ3VyYWJsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWl4aW4gZm9yIHN0b3Jpbmcgb3B0aW9ucyB0aGF0IGNhbiBhZmZlY3QgZWFjaCBjZWxsLiBgbnVsbGAgZm9yIHZhbHVlcyB1c3VhbGx5IG1lYW5zIFwiaW5oZXJpdCBmcm9tIHRoZSBkZWZhdWx0XCIuXHJcbiAqXHJcbiAqIEhhbmRsZXMgYSBsb3Qgb2YgY29udmVyc2lvbiBmcm9tIGludGVybmFsIEVudW1lcmF0aW9uIHZhbHVlcyAoZm9yIHBlcmZvcm1hbmNlKSBhbmQgZXh0ZXJuYWwgc3RyaW5nIHJlcHJlc2VudGF0aW9ucy5cclxuICogVGhpcyBpcyBkb25lIHByaW1hcmlseSBmb3IgcGVyZm9ybWFuY2UgYW5kIHRoYXQgc3R5bGUgb2YgaW50ZXJuYWwgZW51bWVyYXRpb24gcGF0dGVybi4gSWYgc3RyaW5nIGNvbXBhcmlzb25zIGFyZVxyXG4gKiBmYXN0ZXIsIHRoYXQgY291bGQgYmUgdXNlZCBpbnN0ZWFkLlxyXG4gKlxyXG4gKiBOT1RFOiBJbnRlcm5hbCBub24tc3RyaW5nIHJlcHJlc2VudGF0aW9ucyBhcmUgYWxzbyBvcmllbnRhdGlvbi1hZ25vc3RpYyAtIHRodXMgXCJsZWZ0XCIgYW5kIFwidG9wXCIgbWFwIHRvIHRoZSBzYW1lXHJcbiAqIFwic3RhcnRcIiBpbnRlcm5hbGx5LCBhbmQgdGh1cyB0aGUgZXh0ZXJuYWwgdmFsdWUgd2lsbCBhcHBlYXIgdG8gXCJzd2l0Y2hcIiBkZXBlbmRpbmcgb24gdGhlIG9yaWVudGF0aW9uLlxyXG4gKlxyXG4gKiBOT1RFOiBUaGlzIGlzIG1peGVkIGludG8gYm90aCB0aGUgY29uc3RyYWludCBBTkQgdGhlIGNlbGwsIHNpbmNlIHdlIGhhdmUgdHdvIGxheWVycyBvZiBvcHRpb25zLiBUaGUgYG51bGxgIG1lYW5pbmdcclxuICogXCJpbmhlcml0IGZyb20gdGhlIGRlZmF1bHRcIiBpcyBtYWlubHkgdXNlZCBmb3IgdGhlIGNlbGxzLCBzbyB0aGF0IGlmIGl0J3Mgbm90IHNwZWNpZmllZCBpbiB0aGUgY2VsbCwgaXQgd2lsbCBiZVxyXG4gKiBzcGVjaWZpZWQgaW4gdGhlIGNvbnN0cmFpbnQgKGFzIG5vbi1udWxsKS5cclxuICpcclxuICogTk9URTogVGhpcyBpcyBhIG1peGluIG1lYW50IHRvIGJlIHVzZWQgaW50ZXJuYWxseSBvbmx5IGJ5IFNjZW5lcnkgKGZvciB0aGUgY29uc3RyYWludCBhbmQgY2VsbCksIGFuZCBzaG91bGQgbm90IGJlXHJcbiAqIHVzZWQgYnkgb3V0c2lkZSBjb2RlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xyXG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcclxuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lbW9pemUuanMnO1xyXG5pbXBvcnQgbXV0YXRlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tdXRhdGUuanMnO1xyXG5pbXBvcnQgeyBIb3Jpem9udGFsTGF5b3V0QWxpZ24sIExheW91dEFsaWduLCBMYXlvdXRPcmllbnRhdGlvbiwgTUFSR0lOX0xBWU9VVF9DT05GSUdVUkFCTEVfT1BUSU9OX0tFWVMsIE1hcmdpbkxheW91dENvbmZpZ3VyYWJsZSwgTWFyZ2luTGF5b3V0Q29uZmlndXJhYmxlT3B0aW9ucywgc2NlbmVyeSwgVmVydGljYWxMYXlvdXRBbGlnbiB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQ29uc3RydWN0b3IgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0NvbnN0cnVjdG9yLmpzJztcclxuaW1wb3J0IFdpdGhvdXROdWxsIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9XaXRob3V0TnVsbC5qcyc7XHJcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XHJcblxyXG5jb25zdCBGTE9XX0NPTkZJR1VSQUJMRV9PUFRJT05fS0VZUyA9IFtcclxuICAnb3JpZW50YXRpb24nLFxyXG4gICdhbGlnbicsXHJcbiAgJ3N0cmV0Y2gnLFxyXG4gICdncm93J1xyXG5dLmNvbmNhdCggTUFSR0lOX0xBWU9VVF9DT05GSUdVUkFCTEVfT1BUSU9OX0tFWVMgKTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgLy8gVGhlIG1haW4gb3JpZW50YXRpb24gb2YgdGhlIGxheW91dCB0aGF0IHRha2VzIHBsYWNlLiBJdGVtcyB3aWxsIGJlIHNwYWNlZCBvdXQgaW4gdGhpcyBvcmllbnRhdGlvbiAoZS5nLiBpZiBpdCdzXHJcbiAgLy8gJ3ZlcnRpY2FsJywgdGhlIHktdmFsdWVzIG9mIHRoZSBjb21wb25lbnRzIHdpbGwgYmUgYWRqdXN0ZWQgdG8gc3BhY2UgdGhlbSBvdXQpOyB0aGlzIGlzIGtub3duIGFzIHRoZSBcInByaW1hcnlcIlxyXG4gIC8vIGF4aXMuIEl0ZW1zIHdpbGwgYmUgYWxpZ25lZC9zdHJldGNoZWQgaW4gdGhlIG9wcG9zaXRlIG9yaWVudGF0aW9uIChlLmcuIGlmIGl0J3MgJ3ZlcnRpY2FsJywgdGhlIHgtdmFsdWVzIG9mXHJcbiAgLy8gdGhlIGNvbXBvbmVudHMgd2lsbCBiZSBhZGp1c3RlZCBieSBhbGlnbiBhbmQgc3RyZXRjaCk7IHRoaXMgaXMga25vd24gYXMgdGhlIFwic2Vjb25kYXJ5XCIgb3IgXCJvcHBvc2l0ZVwiIGF4aXMuXHJcbiAgLy8gU2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNGbG93Qm94LW9yaWVudGF0aW9uXHJcbiAgb3JpZW50YXRpb24/OiBMYXlvdXRPcmllbnRhdGlvbiB8IG51bGw7XHJcblxyXG4gIC8vIEFkanVzdHMgdGhlIHBvc2l0aW9uIG9mIGVsZW1lbnRzIGluIHRoZSBcIm9wcG9zaXRlXCIgZGltZW5zaW9uLCBlaXRoZXIgdG8gYSBzcGVjaWZpYyBzaWRlLCB0aGUgY2VudGVyLCBvciBzbyB0aGF0IGFsbFxyXG4gIC8vIHRoZSBvcmlnaW5zIG9mIGl0ZW1zIGFyZSBhbGlnbmVkIChzaW1pbGFyIHRvIHg9MCBmb3IgYSAndmVydGljYWwnIG9yaWVudGF0aW9uKS5cclxuICAvLyBTZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0Zsb3dCb3gtYWxpZ25cclxuICBhbGlnbj86IEhvcml6b250YWxMYXlvdXRBbGlnbiB8IFZlcnRpY2FsTGF5b3V0QWxpZ24gfCBudWxsO1xyXG5cclxuICAvLyBDb250cm9scyB3aGV0aGVyIGVsZW1lbnRzIHdpbGwgYXR0ZW1wdCB0byBleHBhbmQgYWxvbmcgdGhlIFwib3Bwb3NpdGVcIiBheGlzIHRvIHRha2UgdXAgdGhlIGZ1bGwgc2l6ZSBvZiB0aGVcclxuICAvLyBsYXJnZXN0IGxheW91dCBlbGVtZW50LlxyXG4gIC8vIFNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjRmxvd0JveC1zdHJldGNoXHJcbiAgc3RyZXRjaD86IGJvb2xlYW47XHJcblxyXG4gIC8vIENvbnRyb2xzIHdoZXRoZXIgZWxlbWVudHMgd2lsbCBhdHRlbXB0IHRvIGV4cGFuZCBhbG9uZyB0aGUgXCJwcmltYXJ5XCIgYXhpcy4gRWxlbWVudHMgd2lsbCBleHBhbmQgcHJvcG9ydGlvbmFsbHlcclxuICAvLyBiYXNlZCBvbiB0aGUgdG90YWwgZ3JvdyBzdW0gKGFuZCB3aWxsIG5vdCBleHBhbmQgYXQgYWxsIGlmIHRoZSBncm93IGlzIHplcm8pLlxyXG4gIC8vIFNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjRmxvd0JveC1ncm93XHJcbiAgZ3Jvdz86IG51bWJlciB8IG51bGw7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBGbG93Q29uZmlndXJhYmxlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTWFyZ2luTGF5b3V0Q29uZmlndXJhYmxlT3B0aW9ucztcclxuXHJcbi8vIFdlIHJlbW92ZSB0aGUgbnVsbCB2YWx1ZXMgZm9yIHRoZSB2YWx1ZXMgdGhhdCB3b24ndCBhY3R1YWxseSB0YWtlIG51bGxcclxuZXhwb3J0IHR5cGUgRXh0ZXJuYWxGbG93Q29uZmlndXJhYmxlT3B0aW9ucyA9IFdpdGhvdXROdWxsPEZsb3dDb25maWd1cmFibGVPcHRpb25zLCBFeGNsdWRlPGtleW9mIEZsb3dDb25maWd1cmFibGVPcHRpb25zLCAnbWluQ29udGVudFdpZHRoJyB8ICdtaW5Db250ZW50SGVpZ2h0JyB8ICdtYXhDb250ZW50V2lkdGgnIHwgJ21heENvbnRlbnRIZWlnaHQnPj47XHJcblxyXG4vLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuY29uc3QgRmxvd0NvbmZpZ3VyYWJsZSA9IG1lbW9pemUoIDxTdXBlclR5cGUgZXh0ZW5kcyBDb25zdHJ1Y3Rvcj4oIHR5cGU6IFN1cGVyVHlwZSApID0+IHtcclxuICByZXR1cm4gY2xhc3MgRmxvd0NvbmZpZ3VyYWJsZU1peGluIGV4dGVuZHMgTWFyZ2luTGF5b3V0Q29uZmlndXJhYmxlKCB0eXBlICkge1xyXG5cclxuICAgIHByb3RlY3RlZCBfb3JpZW50YXRpb246IE9yaWVudGF0aW9uID0gT3JpZW50YXRpb24uSE9SSVpPTlRBTDtcclxuXHJcbiAgICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgIHB1YmxpYyBfYWxpZ246IExheW91dEFsaWduIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgX3N0cmV0Y2g6IGJvb2xlYW4gfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBfZ3JvdzogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgcHVibGljIHJlYWRvbmx5IG9yaWVudGF0aW9uQ2hhbmdlZEVtaXR0ZXI6IFRFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCAuLi5hcmdzOiBJbnRlbnRpb25hbEFueVtdICkge1xyXG4gICAgICBzdXBlciggLi4uYXJncyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBvdmVycmlkZSBtdXRhdGVDb25maWd1cmFibGUoIG9wdGlvbnM/OiBGbG93Q29uZmlndXJhYmxlT3B0aW9ucyApOiB2b2lkIHtcclxuICAgICAgc3VwZXIubXV0YXRlQ29uZmlndXJhYmxlKCBvcHRpb25zICk7XHJcblxyXG4gICAgICBtdXRhdGUoIHRoaXMsIEZMT1dfQ09ORklHVVJBQkxFX09QVElPTl9LRVlTLCBvcHRpb25zICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXNldHMgdmFsdWVzIHRvIHRoZSBcImJhc2VcIiBzdGF0ZS5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIGlzIHRoZSBmYWxsYmFjayBzdGF0ZSBmb3IgYSBjb25zdHJhaW50IHdoZXJlIGV2ZXJ5IHZhbHVlIGlzIGRlZmluZWQgYW5kIHZhbGlkLiBJZiBhIGNlbGwgZG9lcyBub3QgaGF2ZSBhXHJcbiAgICAgKiBzcGVjaWZpYyBcIm92ZXJyaWRkZW5cIiB2YWx1ZSwgb3IgYSBjb25zdHJhaW50IGRvZXNuJ3QgaGF2ZSBhbiBcIm92ZXJyaWRkZW5cIiB2YWx1ZSwgdGhlbiBpdCB3aWxsIHRha2UgdGhlIHZhbHVlXHJcbiAgICAgKiBkZWZpbmVkIGhlcmUuXHJcbiAgICAgKlxyXG4gICAgICogVGhlc2Ugc2hvdWxkIGJlIHRoZSBkZWZhdWx0IHZhbHVlcyBmb3IgY29uc3RyYWludHMuXHJcbiAgICAgKlxyXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBvdmVycmlkZSBzZXRDb25maWdUb0Jhc2VEZWZhdWx0KCk6IHZvaWQge1xyXG4gICAgICB0aGlzLl9hbGlnbiA9IExheW91dEFsaWduLkNFTlRFUjtcclxuICAgICAgdGhpcy5fc3RyZXRjaCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLl9ncm93ID0gMDtcclxuXHJcbiAgICAgIHN1cGVyLnNldENvbmZpZ1RvQmFzZURlZmF1bHQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlc2V0cyB2YWx1ZXMgdG8gdGhlIFwiZG9uJ3Qgb3ZlcnJpZGUgYW55dGhpbmcsIG9ubHkgaW5oZXJpdCBmcm9tIHRoZSBjb25zdHJhaW50XCIgc3RhdGVcclxuICAgICAqXHJcbiAgICAgKiBUaGVzZSBzaG91bGQgYmUgdGhlIGRlZmF1bHQgdmFsdWVzIGZvciBjZWxscyAoZS5nLiBcInRha2UgYWxsIHRoZSBiZWhhdmlvciBmcm9tIHRoZSBjb25zdHJhaW50LCBub3RoaW5nIGlzXHJcbiAgICAgKiBvdmVycmlkZGVuXCIpLlxyXG4gICAgICpcclxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgc2V0Q29uZmlnVG9Jbmhlcml0KCk6IHZvaWQge1xyXG4gICAgICB0aGlzLl9hbGlnbiA9IG51bGw7XHJcbiAgICAgIHRoaXMuX3N0cmV0Y2ggPSBudWxsO1xyXG4gICAgICB0aGlzLl9ncm93ID0gbnVsbDtcclxuXHJcbiAgICAgIHN1cGVyLnNldENvbmZpZ1RvSW5oZXJpdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgb3JpZW50YXRpb24oKTogTGF5b3V0T3JpZW50YXRpb24ge1xyXG4gICAgICByZXR1cm4gdGhpcy5fb3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgPyAnaG9yaXpvbnRhbCcgOiAndmVydGljYWwnO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgb3JpZW50YXRpb24oIHZhbHVlOiBMYXlvdXRPcmllbnRhdGlvbiApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdmFsdWUgPT09ICdob3Jpem9udGFsJyB8fCB2YWx1ZSA9PT0gJ3ZlcnRpY2FsJyApO1xyXG5cclxuICAgICAgY29uc3QgZW51bU9yaWVudGF0aW9uID0gdmFsdWUgPT09ICdob3Jpem9udGFsJyA/IE9yaWVudGF0aW9uLkhPUklaT05UQUwgOiBPcmllbnRhdGlvbi5WRVJUSUNBTDtcclxuXHJcbiAgICAgIGlmICggdGhpcy5fb3JpZW50YXRpb24gIT09IGVudW1PcmllbnRhdGlvbiApIHtcclxuICAgICAgICB0aGlzLl9vcmllbnRhdGlvbiA9IGVudW1PcmllbnRhdGlvbjtcclxuXHJcbiAgICAgICAgdGhpcy5vcmllbnRhdGlvbkNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgICAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgYWxpZ24oKTogSG9yaXpvbnRhbExheW91dEFsaWduIHwgVmVydGljYWxMYXlvdXRBbGlnbiB8IG51bGwge1xyXG4gICAgICBjb25zdCByZXN1bHQgPSBMYXlvdXRBbGlnbi5pbnRlcm5hbFRvQWxpZ24oIHRoaXMuX29yaWVudGF0aW9uLCB0aGlzLl9hbGlnbiApO1xyXG5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0ID09PSBudWxsIHx8IHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnICk7XHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgYWxpZ24oIHZhbHVlOiBIb3Jpem9udGFsTGF5b3V0QWxpZ24gfCBWZXJ0aWNhbExheW91dEFsaWduIHwgbnVsbCApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggTGF5b3V0QWxpZ24uZ2V0QWxsb3dlZEFsaWducyggdGhpcy5fb3JpZW50YXRpb24ub3Bwb3NpdGUgKS5pbmNsdWRlcyggdmFsdWUgKSxcclxuICAgICAgICBgYWxpZ24gJHt2YWx1ZX0gbm90IHN1cHBvcnRlZCwgd2l0aCB0aGUgb3JpZW50YXRpb24gJHt0aGlzLl9vcmllbnRhdGlvbn0sIHRoZSB2YWxpZCB2YWx1ZXMgYXJlICR7TGF5b3V0QWxpZ24uZ2V0QWxsb3dlZEFsaWducyggdGhpcy5fb3JpZW50YXRpb24ub3Bwb3NpdGUgKX1gICk7XHJcblxyXG4gICAgICAvLyByZW1hcHBpbmcgYWxpZ24gdmFsdWVzIHRvIGFuIGluZGVwZW5kZW50IHNldCwgc28gdGhleSBhcmVuJ3Qgb3JpZW50YXRpb24tZGVwZW5kZW50XHJcbiAgICAgIGNvbnN0IG1hcHBlZFZhbHVlID0gTGF5b3V0QWxpZ24uYWxpZ25Ub0ludGVybmFsKCB0aGlzLl9vcmllbnRhdGlvbi5vcHBvc2l0ZSwgdmFsdWUgKTtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hcHBlZFZhbHVlID09PSBudWxsIHx8IG1hcHBlZFZhbHVlIGluc3RhbmNlb2YgTGF5b3V0QWxpZ24gKTtcclxuXHJcbiAgICAgIGlmICggdGhpcy5fYWxpZ24gIT09IG1hcHBlZFZhbHVlICkge1xyXG4gICAgICAgIHRoaXMuX2FsaWduID0gbWFwcGVkVmFsdWU7XHJcblxyXG4gICAgICAgIHRoaXMuY2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBzdHJldGNoKCk6IGJvb2xlYW4gfCBudWxsIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3N0cmV0Y2g7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCBzdHJldGNoKCB2YWx1ZTogYm9vbGVhbiB8IG51bGwgKSB7XHJcbiAgICAgIGlmICggdGhpcy5fc3RyZXRjaCAhPT0gdmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5fc3RyZXRjaCA9IHZhbHVlO1xyXG5cclxuICAgICAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgZ3JvdygpOiBudW1iZXIgfCBudWxsIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2dyb3c7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCBncm93KCB2YWx1ZTogbnVtYmVyIHwgbnVsbCApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdmFsdWUgPT09IG51bGwgfHwgKCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB2YWx1ZSApICYmIHZhbHVlID49IDAgKSApO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLl9ncm93ICE9PSB2YWx1ZSApIHtcclxuICAgICAgICB0aGlzLl9ncm93ID0gdmFsdWU7XHJcblxyXG4gICAgICAgIHRoaXMuY2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufSApO1xyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0Zsb3dDb25maWd1cmFibGUnLCBGbG93Q29uZmlndXJhYmxlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEZsb3dDb25maWd1cmFibGU7XHJcbmV4cG9ydCB7IEZMT1dfQ09ORklHVVJB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