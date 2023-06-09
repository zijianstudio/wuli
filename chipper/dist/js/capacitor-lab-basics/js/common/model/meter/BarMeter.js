// Copyright 2015-2022, University of Colorado Boulder

/**
 * Stores properties for showing a bar meter.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import Property from '../../../../../axon/js/Property.js';
import ReadOnlyProperty from '../../../../../axon/js/ReadOnlyProperty.js';
import capacitorLabBasics from '../../../capacitorLabBasics.js';
class BarMeter {
  /**
   * @param {Property.<boolean>} visibleProperty - model property that determines if the entire meter is visible.
   * @param {Property.<number>} valueProperty - property containing model quantity to display
   */
  constructor(visibleProperty, valueProperty) {
    assert && assert(visibleProperty instanceof Property);
    assert && assert(valueProperty instanceof ReadOnlyProperty);

    // @public {Property.<number>}
    this.valueProperty = valueProperty;

    // @public {Property.<boolean>}
    this.visibleProperty = visibleProperty;
  }

  /**
   * Reset the BarMeter
   * @public
   */
  reset() {
    this.visibleProperty.reset();
  }
}
capacitorLabBasics.register('BarMeter', BarMeter);
export default BarMeter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlJlYWRPbmx5UHJvcGVydHkiLCJjYXBhY2l0b3JMYWJCYXNpY3MiLCJCYXJNZXRlciIsImNvbnN0cnVjdG9yIiwidmlzaWJsZVByb3BlcnR5IiwidmFsdWVQcm9wZXJ0eSIsImFzc2VydCIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYXJNZXRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTdG9yZXMgcHJvcGVydGllcyBmb3Igc2hvd2luZyBhIGJhciBtZXRlci5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQW5kcmV3IEFkYXJlIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9SZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IGNhcGFjaXRvckxhYkJhc2ljcyBmcm9tICcuLi8uLi8uLi9jYXBhY2l0b3JMYWJCYXNpY3MuanMnO1xyXG5cclxuY2xhc3MgQmFyTWV0ZXIge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSB2aXNpYmxlUHJvcGVydHkgLSBtb2RlbCBwcm9wZXJ0eSB0aGF0IGRldGVybWluZXMgaWYgdGhlIGVudGlyZSBtZXRlciBpcyB2aXNpYmxlLlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IHZhbHVlUHJvcGVydHkgLSBwcm9wZXJ0eSBjb250YWluaW5nIG1vZGVsIHF1YW50aXR5IHRvIGRpc3BsYXlcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdmlzaWJsZVByb3BlcnR5LCB2YWx1ZVByb3BlcnR5ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmlzaWJsZVByb3BlcnR5IGluc3RhbmNlb2YgUHJvcGVydHkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlUHJvcGVydHkgaW5zdGFuY2VvZiBSZWFkT25seVByb3BlcnR5ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59XHJcbiAgICB0aGlzLnZhbHVlUHJvcGVydHkgPSB2YWx1ZVByb3BlcnR5O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn1cclxuICAgIHRoaXMudmlzaWJsZVByb3BlcnR5ID0gdmlzaWJsZVByb3BlcnR5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgdGhlIEJhck1ldGVyXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy52aXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbmNhcGFjaXRvckxhYkJhc2ljcy5yZWdpc3RlciggJ0Jhck1ldGVyJywgQmFyTWV0ZXIgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJhck1ldGVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLG9DQUFvQztBQUN6RCxPQUFPQyxnQkFBZ0IsTUFBTSw0Q0FBNEM7QUFDekUsT0FBT0Msa0JBQWtCLE1BQU0sZ0NBQWdDO0FBRS9ELE1BQU1DLFFBQVEsQ0FBQztFQUNiO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLGVBQWUsRUFBRUMsYUFBYSxFQUFHO0lBQzVDQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUYsZUFBZSxZQUFZTCxRQUFTLENBQUM7SUFDdkRPLE1BQU0sSUFBSUEsTUFBTSxDQUFFRCxhQUFhLFlBQVlMLGdCQUFpQixDQUFDOztJQUU3RDtJQUNBLElBQUksQ0FBQ0ssYUFBYSxHQUFHQSxhQUFhOztJQUVsQztJQUNBLElBQUksQ0FBQ0QsZUFBZSxHQUFHQSxlQUFlO0VBQ3hDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VHLEtBQUtBLENBQUEsRUFBRztJQUNOLElBQUksQ0FBQ0gsZUFBZSxDQUFDRyxLQUFLLENBQUMsQ0FBQztFQUM5QjtBQUNGO0FBRUFOLGtCQUFrQixDQUFDTyxRQUFRLENBQUUsVUFBVSxFQUFFTixRQUFTLENBQUM7QUFFbkQsZUFBZUEsUUFBUSJ9