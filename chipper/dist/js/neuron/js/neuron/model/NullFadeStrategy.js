// Copyright 2014-2020, University of Colorado Boulder
/**
 * Fade strategy that does nothing.  Useful for avoiding having to check for null values of fade strategy all the time.
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import FadeStrategy from './FadeStrategy.js';
class NullFadeStrategy extends FadeStrategy {
  constructor() {
    super();
  }

  // @public, @override
  updateOpacity(fadableModelElement, dt) {
    // Does nothing.
  }

  // @public
  static getInstance() {
    if (!NullFadeStrategy.instance) {
      // No need to create new instance of NullFadeStrategy , it is stateless
      // Using a single strategy instance to avoid allocation
      NullFadeStrategy.instance = new NullFadeStrategy();
    }
    return NullFadeStrategy.instance;
  }
}
neuron.register('NullFadeStrategy', NullFadeStrategy);
export default NullFadeStrategy;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJuZXVyb24iLCJGYWRlU3RyYXRlZ3kiLCJOdWxsRmFkZVN0cmF0ZWd5IiwiY29uc3RydWN0b3IiLCJ1cGRhdGVPcGFjaXR5IiwiZmFkYWJsZU1vZGVsRWxlbWVudCIsImR0IiwiZ2V0SW5zdGFuY2UiLCJpbnN0YW5jZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTnVsbEZhZGVTdHJhdGVneS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuLyoqXHJcbiAqIEZhZGUgc3RyYXRlZ3kgdGhhdCBkb2VzIG5vdGhpbmcuICBVc2VmdWwgZm9yIGF2b2lkaW5nIGhhdmluZyB0byBjaGVjayBmb3IgbnVsbCB2YWx1ZXMgb2YgZmFkZSBzdHJhdGVneSBhbGwgdGhlIHRpbWUuXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBTaGFyZnVkZWVuIEFzaHJhZiAoZm9yIEdoZW50IFVuaXZlcnNpdHkpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG5ldXJvbiBmcm9tICcuLi8uLi9uZXVyb24uanMnO1xyXG5pbXBvcnQgRmFkZVN0cmF0ZWd5IGZyb20gJy4vRmFkZVN0cmF0ZWd5LmpzJztcclxuXHJcbmNsYXNzIE51bGxGYWRlU3RyYXRlZ3kgZXh0ZW5kcyBGYWRlU3RyYXRlZ3kge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljLCBAb3ZlcnJpZGVcclxuICB1cGRhdGVPcGFjaXR5KCBmYWRhYmxlTW9kZWxFbGVtZW50LCBkdCApIHtcclxuICAgIC8vIERvZXMgbm90aGluZy5cclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBzdGF0aWMgZ2V0SW5zdGFuY2UoKSB7XHJcbiAgICBpZiAoICFOdWxsRmFkZVN0cmF0ZWd5Lmluc3RhbmNlICkge1xyXG4gICAgICAvLyBObyBuZWVkIHRvIGNyZWF0ZSBuZXcgaW5zdGFuY2Ugb2YgTnVsbEZhZGVTdHJhdGVneSAsIGl0IGlzIHN0YXRlbGVzc1xyXG4gICAgICAvLyBVc2luZyBhIHNpbmdsZSBzdHJhdGVneSBpbnN0YW5jZSB0byBhdm9pZCBhbGxvY2F0aW9uXHJcbiAgICAgIE51bGxGYWRlU3RyYXRlZ3kuaW5zdGFuY2UgPSBuZXcgTnVsbEZhZGVTdHJhdGVneSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE51bGxGYWRlU3RyYXRlZ3kuaW5zdGFuY2U7XHJcbiAgfVxyXG59XHJcblxyXG5uZXVyb24ucmVnaXN0ZXIoICdOdWxsRmFkZVN0cmF0ZWd5JywgTnVsbEZhZGVTdHJhdGVneSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTnVsbEZhZGVTdHJhdGVneTsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0saUJBQWlCO0FBQ3BDLE9BQU9DLFlBQVksTUFBTSxtQkFBbUI7QUFFNUMsTUFBTUMsZ0JBQWdCLFNBQVNELFlBQVksQ0FBQztFQUUxQ0UsV0FBV0EsQ0FBQSxFQUFHO0lBQ1osS0FBSyxDQUFDLENBQUM7RUFDVDs7RUFFQTtFQUNBQyxhQUFhQSxDQUFFQyxtQkFBbUIsRUFBRUMsRUFBRSxFQUFHO0lBQ3ZDO0VBQUE7O0VBR0Y7RUFDQSxPQUFPQyxXQUFXQSxDQUFBLEVBQUc7SUFDbkIsSUFBSyxDQUFDTCxnQkFBZ0IsQ0FBQ00sUUFBUSxFQUFHO01BQ2hDO01BQ0E7TUFDQU4sZ0JBQWdCLENBQUNNLFFBQVEsR0FBRyxJQUFJTixnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3BEO0lBQ0EsT0FBT0EsZ0JBQWdCLENBQUNNLFFBQVE7RUFDbEM7QUFDRjtBQUVBUixNQUFNLENBQUNTLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRVAsZ0JBQWlCLENBQUM7QUFFdkQsZUFBZUEsZ0JBQWdCIn0=