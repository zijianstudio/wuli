// Copyright 2017-2022, University of Colorado Boulder

/**
 * A trait for subtypes of Node, used to make the Node behave like a 'slider' with assistive technology. This could be
 * used by anything that moves along a 1-D line. An accessible slider behaves like:
 *
 * - Arrow keys increment/decrement the slider by a specified step size.
 * - Holding shift with arrow keys will increment/decrement by alternative step size, usually smaller than default.
 * - Page Up and Page Down increments/decrements value by an alternative step size, usually larger than default.
 * - Home key sets value to its minimum.
 * - End key sets value to its maximum.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import assertHasProperties from '../../../phet-core/js/assertHasProperties.js';
import optionize from '../../../phet-core/js/optionize.js';
import sun from '../sun.js';
import AccessibleValueHandler from './AccessibleValueHandler.js';
/**
 * @param Type
 * @param optionsArgPosition - zero-indexed number that the options argument is provided at
 */
const AccessibleSlider = (Type, optionsArgPosition) => {
  // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  return class AccessibleSlider extends AccessibleValueHandler(Type, optionsArgPosition) {
    constructor(...args) {
      const providedOptions = args[optionsArgPosition];
      assert && providedOptions && assert(Object.getPrototypeOf(providedOptions) === Object.prototype, 'Extra prototype on AccessibleSlider options object is a code smell (or probably a bug)');
      const options = optionize()({
        startDrag: _.noop,
        endDrag: _.noop,
        drag: _.noop
      }, providedOptions);

      // AccessibleSlider uses 'drag' terminology rather than 'change' for consistency with Slider
      assert && assert(options.startInput === undefined, 'AccessibleSlider sets startInput through options.startDrag');
      options.startInput = options.startDrag;
      assert && assert(options.endInput === undefined, 'AccessibleSlider sets endInput through options.endDrag');
      options.endInput = options.endDrag;
      assert && assert(options.onInput === undefined, 'AccessibleSlider sets onInput through options.drag');
      options.onInput = options.drag;
      args[optionsArgPosition] = options;
      super(...args);

      // members of the Node API that are used by this trait
      assertHasProperties(this, ['addInputListener', 'removeInputListener']);

      // handle all accessible event input
      const accessibleInputListener = this.getAccessibleValueHandlerInputListener();
      this.addInputListener(accessibleInputListener);

      // called by disposeAccessibleSlider to prevent memory leaks
      this._disposeAccessibleSlider = () => {
        this.removeInputListener(accessibleInputListener);
      };
    }

    /**
     * Make the accessible slider portions of this node eligible for garbage collection. Call when disposing
     * the type that this trait is mixed into.
     */
    dispose() {
      this._disposeAccessibleSlider();
      super.dispose();
    }
  };
};
sun.register('AccessibleSlider', AccessibleSlider);
export default AccessibleSlider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3NlcnRIYXNQcm9wZXJ0aWVzIiwib3B0aW9uaXplIiwic3VuIiwiQWNjZXNzaWJsZVZhbHVlSGFuZGxlciIsIkFjY2Vzc2libGVTbGlkZXIiLCJUeXBlIiwib3B0aW9uc0FyZ1Bvc2l0aW9uIiwiY29uc3RydWN0b3IiLCJhcmdzIiwicHJvdmlkZWRPcHRpb25zIiwiYXNzZXJ0IiwiT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJwcm90b3R5cGUiLCJvcHRpb25zIiwic3RhcnREcmFnIiwiXyIsIm5vb3AiLCJlbmREcmFnIiwiZHJhZyIsInN0YXJ0SW5wdXQiLCJ1bmRlZmluZWQiLCJlbmRJbnB1dCIsIm9uSW5wdXQiLCJhY2Nlc3NpYmxlSW5wdXRMaXN0ZW5lciIsImdldEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJJbnB1dExpc3RlbmVyIiwiYWRkSW5wdXRMaXN0ZW5lciIsIl9kaXNwb3NlQWNjZXNzaWJsZVNsaWRlciIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBY2Nlc3NpYmxlU2xpZGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgdHJhaXQgZm9yIHN1YnR5cGVzIG9mIE5vZGUsIHVzZWQgdG8gbWFrZSB0aGUgTm9kZSBiZWhhdmUgbGlrZSBhICdzbGlkZXInIHdpdGggYXNzaXN0aXZlIHRlY2hub2xvZ3kuIFRoaXMgY291bGQgYmVcclxuICogdXNlZCBieSBhbnl0aGluZyB0aGF0IG1vdmVzIGFsb25nIGEgMS1EIGxpbmUuIEFuIGFjY2Vzc2libGUgc2xpZGVyIGJlaGF2ZXMgbGlrZTpcclxuICpcclxuICogLSBBcnJvdyBrZXlzIGluY3JlbWVudC9kZWNyZW1lbnQgdGhlIHNsaWRlciBieSBhIHNwZWNpZmllZCBzdGVwIHNpemUuXHJcbiAqIC0gSG9sZGluZyBzaGlmdCB3aXRoIGFycm93IGtleXMgd2lsbCBpbmNyZW1lbnQvZGVjcmVtZW50IGJ5IGFsdGVybmF0aXZlIHN0ZXAgc2l6ZSwgdXN1YWxseSBzbWFsbGVyIHRoYW4gZGVmYXVsdC5cclxuICogLSBQYWdlIFVwIGFuZCBQYWdlIERvd24gaW5jcmVtZW50cy9kZWNyZW1lbnRzIHZhbHVlIGJ5IGFuIGFsdGVybmF0aXZlIHN0ZXAgc2l6ZSwgdXN1YWxseSBsYXJnZXIgdGhhbiBkZWZhdWx0LlxyXG4gKiAtIEhvbWUga2V5IHNldHMgdmFsdWUgdG8gaXRzIG1pbmltdW0uXHJcbiAqIC0gRW5kIGtleSBzZXRzIHZhbHVlIHRvIGl0cyBtYXhpbXVtLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgYXNzZXJ0SGFzUHJvcGVydGllcyBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvYXNzZXJ0SGFzUHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBDb25zdHJ1Y3RvciBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvQ29uc3RydWN0b3IuanMnO1xyXG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgU2NlbmVyeUV2ZW50IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHN1biBmcm9tICcuLi9zdW4uanMnO1xyXG5pbXBvcnQgQWNjZXNzaWJsZVZhbHVlSGFuZGxlciwgeyBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyT3B0aW9ucyB9IGZyb20gJy4vQWNjZXNzaWJsZVZhbHVlSGFuZGxlci5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG5cclxuICAvLyBjYWxsZWQgd2hlbiBhIGRyYWcgc2VxdWVuY2Ugc3RhcnRzXHJcbiAgc3RhcnREcmFnPzogKCBldmVudDogU2NlbmVyeUV2ZW50ICkgPT4gdm9pZDtcclxuXHJcbiAgLy8gY2FsbGVkIGF0IHRoZSBlbmQgb2YgYSBkcmFnIGV2ZW50LCBhZnRlciB0aGUgdmFsdWVQcm9wZXJ0eSBjaGFuZ2VzXHJcbiAgZHJhZz86ICggZXZlbnQ6IFNjZW5lcnlFdmVudCApID0+IHZvaWQ7XHJcblxyXG4gIC8vIGNhbGxlZCB3aGVuIGEgZHJhZyBzZXF1ZW5jZSBlbmRzXHJcbiAgZW5kRHJhZz86ICggZXZlbnQ6IFNjZW5lcnlFdmVudCB8IG51bGwgKSA9PiB2b2lkO1xyXG59O1xyXG5cclxudHlwZSBBY2Nlc3NpYmxlU2xpZGVyT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgQWNjZXNzaWJsZVZhbHVlSGFuZGxlck9wdGlvbnM7XHJcblxyXG4vKipcclxuICogQHBhcmFtIFR5cGVcclxuICogQHBhcmFtIG9wdGlvbnNBcmdQb3NpdGlvbiAtIHplcm8taW5kZXhlZCBudW1iZXIgdGhhdCB0aGUgb3B0aW9ucyBhcmd1bWVudCBpcyBwcm92aWRlZCBhdFxyXG4gKi9cclxuY29uc3QgQWNjZXNzaWJsZVNsaWRlciA9IDxTdXBlclR5cGUgZXh0ZW5kcyBDb25zdHJ1Y3RvcjxOb2RlPj4oIFR5cGU6IFN1cGVyVHlwZSwgb3B0aW9uc0FyZ1Bvc2l0aW9uOiBudW1iZXIgKSA9PiB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1vZHVsZS1ib3VuZGFyeS10eXBlc1xyXG4gIHJldHVybiBjbGFzcyBBY2Nlc3NpYmxlU2xpZGVyIGV4dGVuZHMgQWNjZXNzaWJsZVZhbHVlSGFuZGxlciggVHlwZSwgb3B0aW9uc0FyZ1Bvc2l0aW9uICkge1xyXG5cclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2Rpc3Bvc2VBY2Nlc3NpYmxlU2xpZGVyOiAoKSA9PiB2b2lkO1xyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvciggLi4uYXJnczogSW50ZW50aW9uYWxBbnlbXSApIHtcclxuXHJcbiAgICAgIGNvbnN0IHByb3ZpZGVkT3B0aW9ucyA9IGFyZ3NbIG9wdGlvbnNBcmdQb3NpdGlvbiBdIGFzIEFjY2Vzc2libGVTbGlkZXJPcHRpb25zO1xyXG5cclxuICAgICAgYXNzZXJ0ICYmIHByb3ZpZGVkT3B0aW9ucyAmJiBhc3NlcnQoIE9iamVjdC5nZXRQcm90b3R5cGVPZiggcHJvdmlkZWRPcHRpb25zICkgPT09IE9iamVjdC5wcm90b3R5cGUsXHJcbiAgICAgICAgJ0V4dHJhIHByb3RvdHlwZSBvbiBBY2Nlc3NpYmxlU2xpZGVyIG9wdGlvbnMgb2JqZWN0IGlzIGEgY29kZSBzbWVsbCAob3IgcHJvYmFibHkgYSBidWcpJyApO1xyXG5cclxuICAgICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxBY2Nlc3NpYmxlU2xpZGVyT3B0aW9ucywgU2VsZk9wdGlvbnMsIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJPcHRpb25zPigpKCB7XHJcbiAgICAgICAgc3RhcnREcmFnOiBfLm5vb3AsXHJcbiAgICAgICAgZW5kRHJhZzogXy5ub29wLFxyXG4gICAgICAgIGRyYWc6IF8ubm9vcFxyXG4gICAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAgIC8vIEFjY2Vzc2libGVTbGlkZXIgdXNlcyAnZHJhZycgdGVybWlub2xvZ3kgcmF0aGVyIHRoYW4gJ2NoYW5nZScgZm9yIGNvbnNpc3RlbmN5IHdpdGggU2xpZGVyXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuc3RhcnRJbnB1dCA9PT0gdW5kZWZpbmVkLCAnQWNjZXNzaWJsZVNsaWRlciBzZXRzIHN0YXJ0SW5wdXQgdGhyb3VnaCBvcHRpb25zLnN0YXJ0RHJhZycgKTtcclxuICAgICAgb3B0aW9ucy5zdGFydElucHV0ID0gb3B0aW9ucy5zdGFydERyYWc7XHJcblxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmVuZElucHV0ID09PSB1bmRlZmluZWQsICdBY2Nlc3NpYmxlU2xpZGVyIHNldHMgZW5kSW5wdXQgdGhyb3VnaCBvcHRpb25zLmVuZERyYWcnICk7XHJcbiAgICAgIG9wdGlvbnMuZW5kSW5wdXQgPSBvcHRpb25zLmVuZERyYWc7XHJcblxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLm9uSW5wdXQgPT09IHVuZGVmaW5lZCwgJ0FjY2Vzc2libGVTbGlkZXIgc2V0cyBvbklucHV0IHRocm91Z2ggb3B0aW9ucy5kcmFnJyApO1xyXG4gICAgICBvcHRpb25zLm9uSW5wdXQgPSBvcHRpb25zLmRyYWc7XHJcblxyXG4gICAgICBhcmdzWyBvcHRpb25zQXJnUG9zaXRpb24gXSA9IG9wdGlvbnM7XHJcblxyXG4gICAgICBzdXBlciggLi4uYXJncyApO1xyXG5cclxuICAgICAgLy8gbWVtYmVycyBvZiB0aGUgTm9kZSBBUEkgdGhhdCBhcmUgdXNlZCBieSB0aGlzIHRyYWl0XHJcbiAgICAgIGFzc2VydEhhc1Byb3BlcnRpZXMoIHRoaXMsIFsgJ2FkZElucHV0TGlzdGVuZXInLCAncmVtb3ZlSW5wdXRMaXN0ZW5lcicgXSApO1xyXG5cclxuICAgICAgLy8gaGFuZGxlIGFsbCBhY2Nlc3NpYmxlIGV2ZW50IGlucHV0XHJcbiAgICAgIGNvbnN0IGFjY2Vzc2libGVJbnB1dExpc3RlbmVyID0gdGhpcy5nZXRBY2Nlc3NpYmxlVmFsdWVIYW5kbGVySW5wdXRMaXN0ZW5lcigpO1xyXG4gICAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIGFjY2Vzc2libGVJbnB1dExpc3RlbmVyICk7XHJcblxyXG4gICAgICAvLyBjYWxsZWQgYnkgZGlzcG9zZUFjY2Vzc2libGVTbGlkZXIgdG8gcHJldmVudCBtZW1vcnkgbGVha3NcclxuICAgICAgdGhpcy5fZGlzcG9zZUFjY2Vzc2libGVTbGlkZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCBhY2Nlc3NpYmxlSW5wdXRMaXN0ZW5lciApO1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFrZSB0aGUgYWNjZXNzaWJsZSBzbGlkZXIgcG9ydGlvbnMgb2YgdGhpcyBub2RlIGVsaWdpYmxlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uIENhbGwgd2hlbiBkaXNwb3NpbmdcclxuICAgICAqIHRoZSB0eXBlIHRoYXQgdGhpcyB0cmFpdCBpcyBtaXhlZCBpbnRvLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgICAgdGhpcy5fZGlzcG9zZUFjY2Vzc2libGVTbGlkZXIoKTtcclxuXHJcbiAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuICB9O1xyXG59O1xyXG5cclxuc3VuLnJlZ2lzdGVyKCAnQWNjZXNzaWJsZVNsaWRlcicsIEFjY2Vzc2libGVTbGlkZXIgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFjY2Vzc2libGVTbGlkZXI7XHJcbmV4cG9ydCB0eXBlIHsgQWNjZXNzaWJsZVNsaWRlck9wdGlvbnMgfTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxtQkFBbUIsTUFBTSw4Q0FBOEM7QUFHOUUsT0FBT0MsU0FBUyxNQUFNLG9DQUFvQztBQUUxRCxPQUFPQyxHQUFHLE1BQU0sV0FBVztBQUMzQixPQUFPQyxzQkFBc0IsTUFBeUMsNkJBQTZCO0FBZ0JuRztBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLGdCQUFnQixHQUFHQSxDQUF1Q0MsSUFBZSxFQUFFQyxrQkFBMEIsS0FBTTtFQUFFO0VBQ2pILE9BQU8sTUFBTUYsZ0JBQWdCLFNBQVNELHNCQUFzQixDQUFFRSxJQUFJLEVBQUVDLGtCQUFtQixDQUFDLENBQUM7SUFJaEZDLFdBQVdBLENBQUUsR0FBR0MsSUFBc0IsRUFBRztNQUU5QyxNQUFNQyxlQUFlLEdBQUdELElBQUksQ0FBRUYsa0JBQWtCLENBQTZCO01BRTdFSSxNQUFNLElBQUlELGVBQWUsSUFBSUMsTUFBTSxDQUFFQyxNQUFNLENBQUNDLGNBQWMsQ0FBRUgsZUFBZ0IsQ0FBQyxLQUFLRSxNQUFNLENBQUNFLFNBQVMsRUFDaEcsd0ZBQXlGLENBQUM7TUFFNUYsTUFBTUMsT0FBTyxHQUFHYixTQUFTLENBQXNFLENBQUMsQ0FBRTtRQUNoR2MsU0FBUyxFQUFFQyxDQUFDLENBQUNDLElBQUk7UUFDakJDLE9BQU8sRUFBRUYsQ0FBQyxDQUFDQyxJQUFJO1FBQ2ZFLElBQUksRUFBRUgsQ0FBQyxDQUFDQztNQUNWLENBQUMsRUFBRVIsZUFBZ0IsQ0FBQzs7TUFFcEI7TUFDQUMsTUFBTSxJQUFJQSxNQUFNLENBQUVJLE9BQU8sQ0FBQ00sVUFBVSxLQUFLQyxTQUFTLEVBQUUsNERBQTZELENBQUM7TUFDbEhQLE9BQU8sQ0FBQ00sVUFBVSxHQUFHTixPQUFPLENBQUNDLFNBQVM7TUFFdENMLE1BQU0sSUFBSUEsTUFBTSxDQUFFSSxPQUFPLENBQUNRLFFBQVEsS0FBS0QsU0FBUyxFQUFFLHdEQUF5RCxDQUFDO01BQzVHUCxPQUFPLENBQUNRLFFBQVEsR0FBR1IsT0FBTyxDQUFDSSxPQUFPO01BRWxDUixNQUFNLElBQUlBLE1BQU0sQ0FBRUksT0FBTyxDQUFDUyxPQUFPLEtBQUtGLFNBQVMsRUFBRSxvREFBcUQsQ0FBQztNQUN2R1AsT0FBTyxDQUFDUyxPQUFPLEdBQUdULE9BQU8sQ0FBQ0ssSUFBSTtNQUU5QlgsSUFBSSxDQUFFRixrQkFBa0IsQ0FBRSxHQUFHUSxPQUFPO01BRXBDLEtBQUssQ0FBRSxHQUFHTixJQUFLLENBQUM7O01BRWhCO01BQ0FSLG1CQUFtQixDQUFFLElBQUksRUFBRSxDQUFFLGtCQUFrQixFQUFFLHFCQUFxQixDQUFHLENBQUM7O01BRTFFO01BQ0EsTUFBTXdCLHVCQUF1QixHQUFHLElBQUksQ0FBQ0Msc0NBQXNDLENBQUMsQ0FBQztNQUM3RSxJQUFJLENBQUNDLGdCQUFnQixDQUFFRix1QkFBd0IsQ0FBQzs7TUFFaEQ7TUFDQSxJQUFJLENBQUNHLHdCQUF3QixHQUFHLE1BQU07UUFDcEMsSUFBSSxDQUFDQyxtQkFBbUIsQ0FBRUosdUJBQXdCLENBQUM7TUFDckQsQ0FBQztJQUNIOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0lBQ29CSyxPQUFPQSxDQUFBLEVBQVM7TUFDOUIsSUFBSSxDQUFDRix3QkFBd0IsQ0FBQyxDQUFDO01BRS9CLEtBQUssQ0FBQ0UsT0FBTyxDQUFDLENBQUM7SUFDakI7RUFDRixDQUFDO0FBQ0gsQ0FBQztBQUVEM0IsR0FBRyxDQUFDNEIsUUFBUSxDQUFFLGtCQUFrQixFQUFFMUIsZ0JBQWlCLENBQUM7QUFFcEQsZUFBZUEsZ0JBQWdCIn0=