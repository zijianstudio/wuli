// Copyright 2016-2023, University of Colorado Boulder

/**
 * Specialization of NumberPicker, adds the ability to optionally skip zero value.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import functionBuilder from '../../functionBuilder.js';
export default class FBNumberPicker extends NumberPicker {
  /**
   * @param {Property.<number>} valueProperty
   * @param {Range} valueRange
   * @param {Object} [options]
   */
  constructor(valueProperty, valueRange, options) {
    options = merge({
      touchAreaXDilation: 0,
      // so that it's easier to grab the function's background
      xMargin: 6,
      skipZero: false // {boolean} whether to skip zero value
    }, options);
    assert && assert(!(options.skipZero && (valueRange.min === 0 || valueRange.max === 0)), 'cannot skip zero when it is min or max');

    // increment, optionally skip zero
    assert && assert(!options.incrementFunction);
    options.incrementFunction = value => {
      let newValue = value + 1;
      if (newValue === 0 && options.skipZero) {
        newValue++;
      }
      assert && assert(!(options.skipZero && newValue === 0), 'programming error, zero should be skipped');
      return newValue;
    };

    // decrement, optionally skip zero
    assert && assert(!options.decrementFunction);
    options.decrementFunction = value => {
      let newValue = value - 1;
      if (newValue === 0 && options.skipZero) {
        newValue--;
      }
      assert && assert(!(options.skipZero && newValue === 0), 'programming error, zero should be skipped');
      return newValue;
    };
    super(valueProperty, new Property(valueRange), options);
  }
}
functionBuilder.register('FBNumberPicker', FBNumberPicker);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIm1lcmdlIiwiTnVtYmVyUGlja2VyIiwiZnVuY3Rpb25CdWlsZGVyIiwiRkJOdW1iZXJQaWNrZXIiLCJjb25zdHJ1Y3RvciIsInZhbHVlUHJvcGVydHkiLCJ2YWx1ZVJhbmdlIiwib3B0aW9ucyIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInhNYXJnaW4iLCJza2lwWmVybyIsImFzc2VydCIsIm1pbiIsIm1heCIsImluY3JlbWVudEZ1bmN0aW9uIiwidmFsdWUiLCJuZXdWYWx1ZSIsImRlY3JlbWVudEZ1bmN0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGQk51bWJlclBpY2tlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTcGVjaWFsaXphdGlvbiBvZiBOdW1iZXJQaWNrZXIsIGFkZHMgdGhlIGFiaWxpdHkgdG8gb3B0aW9uYWxseSBza2lwIHplcm8gdmFsdWUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IE51bWJlclBpY2tlciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvTnVtYmVyUGlja2VyLmpzJztcclxuaW1wb3J0IGZ1bmN0aW9uQnVpbGRlciBmcm9tICcuLi8uLi9mdW5jdGlvbkJ1aWxkZXIuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRkJOdW1iZXJQaWNrZXIgZXh0ZW5kcyBOdW1iZXJQaWNrZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXI+fSB2YWx1ZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtSYW5nZX0gdmFsdWVSYW5nZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdmFsdWVQcm9wZXJ0eSwgdmFsdWVSYW5nZSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiAwLCAvLyBzbyB0aGF0IGl0J3MgZWFzaWVyIHRvIGdyYWIgdGhlIGZ1bmN0aW9uJ3MgYmFja2dyb3VuZFxyXG4gICAgICB4TWFyZ2luOiA2LFxyXG4gICAgICBza2lwWmVybzogZmFsc2UgLy8ge2Jvb2xlYW59IHdoZXRoZXIgdG8gc2tpcCB6ZXJvIHZhbHVlXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggISggb3B0aW9ucy5za2lwWmVybyAmJiAoIHZhbHVlUmFuZ2UubWluID09PSAwIHx8IHZhbHVlUmFuZ2UubWF4ID09PSAwICkgKSxcclxuICAgICAgJ2Nhbm5vdCBza2lwIHplcm8gd2hlbiBpdCBpcyBtaW4gb3IgbWF4JyApO1xyXG5cclxuICAgIC8vIGluY3JlbWVudCwgb3B0aW9uYWxseSBza2lwIHplcm9cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmluY3JlbWVudEZ1bmN0aW9uICk7XHJcbiAgICBvcHRpb25zLmluY3JlbWVudEZ1bmN0aW9uID0gdmFsdWUgPT4ge1xyXG4gICAgICBsZXQgbmV3VmFsdWUgPSB2YWx1ZSArIDE7XHJcbiAgICAgIGlmICggbmV3VmFsdWUgPT09IDAgJiYgb3B0aW9ucy5za2lwWmVybyApIHtcclxuICAgICAgICBuZXdWYWx1ZSsrO1xyXG4gICAgICB9XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICEoIG9wdGlvbnMuc2tpcFplcm8gJiYgbmV3VmFsdWUgPT09IDAgKSwgJ3Byb2dyYW1taW5nIGVycm9yLCB6ZXJvIHNob3VsZCBiZSBza2lwcGVkJyApO1xyXG4gICAgICByZXR1cm4gbmV3VmFsdWU7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGRlY3JlbWVudCwgb3B0aW9uYWxseSBza2lwIHplcm9cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmRlY3JlbWVudEZ1bmN0aW9uICk7XHJcbiAgICBvcHRpb25zLmRlY3JlbWVudEZ1bmN0aW9uID0gdmFsdWUgPT4ge1xyXG4gICAgICBsZXQgbmV3VmFsdWUgPSB2YWx1ZSAtIDE7XHJcbiAgICAgIGlmICggbmV3VmFsdWUgPT09IDAgJiYgb3B0aW9ucy5za2lwWmVybyApIHtcclxuICAgICAgICBuZXdWYWx1ZS0tO1xyXG4gICAgICB9XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICEoIG9wdGlvbnMuc2tpcFplcm8gJiYgbmV3VmFsdWUgPT09IDAgKSwgJ3Byb2dyYW1taW5nIGVycm9yLCB6ZXJvIHNob3VsZCBiZSBza2lwcGVkJyApO1xyXG4gICAgICByZXR1cm4gbmV3VmFsdWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHN1cGVyKCB2YWx1ZVByb3BlcnR5LCBuZXcgUHJvcGVydHkoIHZhbHVlUmFuZ2UgKSwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb25CdWlsZGVyLnJlZ2lzdGVyKCAnRkJOdW1iZXJQaWNrZXInLCBGQk51bWJlclBpY2tlciApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsWUFBWSxNQUFNLG9DQUFvQztBQUM3RCxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBRXRELGVBQWUsTUFBTUMsY0FBYyxTQUFTRixZQUFZLENBQUM7RUFFdkQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxhQUFhLEVBQUVDLFVBQVUsRUFBRUMsT0FBTyxFQUFHO0lBRWhEQSxPQUFPLEdBQUdQLEtBQUssQ0FBRTtNQUNmUSxrQkFBa0IsRUFBRSxDQUFDO01BQUU7TUFDdkJDLE9BQU8sRUFBRSxDQUFDO01BQ1ZDLFFBQVEsRUFBRSxLQUFLLENBQUM7SUFDbEIsQ0FBQyxFQUFFSCxPQUFRLENBQUM7SUFFWkksTUFBTSxJQUFJQSxNQUFNLENBQUUsRUFBR0osT0FBTyxDQUFDRyxRQUFRLEtBQU1KLFVBQVUsQ0FBQ00sR0FBRyxLQUFLLENBQUMsSUFBSU4sVUFBVSxDQUFDTyxHQUFHLEtBQUssQ0FBQyxDQUFFLENBQUUsRUFDekYsd0NBQXlDLENBQUM7O0lBRTVDO0lBQ0FGLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUNKLE9BQU8sQ0FBQ08saUJBQWtCLENBQUM7SUFDOUNQLE9BQU8sQ0FBQ08saUJBQWlCLEdBQUdDLEtBQUssSUFBSTtNQUNuQyxJQUFJQyxRQUFRLEdBQUdELEtBQUssR0FBRyxDQUFDO01BQ3hCLElBQUtDLFFBQVEsS0FBSyxDQUFDLElBQUlULE9BQU8sQ0FBQ0csUUFBUSxFQUFHO1FBQ3hDTSxRQUFRLEVBQUU7TUFDWjtNQUNBTCxNQUFNLElBQUlBLE1BQU0sQ0FBRSxFQUFHSixPQUFPLENBQUNHLFFBQVEsSUFBSU0sUUFBUSxLQUFLLENBQUMsQ0FBRSxFQUFFLDJDQUE0QyxDQUFDO01BQ3hHLE9BQU9BLFFBQVE7SUFDakIsQ0FBQzs7SUFFRDtJQUNBTCxNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDSixPQUFPLENBQUNVLGlCQUFrQixDQUFDO0lBQzlDVixPQUFPLENBQUNVLGlCQUFpQixHQUFHRixLQUFLLElBQUk7TUFDbkMsSUFBSUMsUUFBUSxHQUFHRCxLQUFLLEdBQUcsQ0FBQztNQUN4QixJQUFLQyxRQUFRLEtBQUssQ0FBQyxJQUFJVCxPQUFPLENBQUNHLFFBQVEsRUFBRztRQUN4Q00sUUFBUSxFQUFFO01BQ1o7TUFDQUwsTUFBTSxJQUFJQSxNQUFNLENBQUUsRUFBR0osT0FBTyxDQUFDRyxRQUFRLElBQUlNLFFBQVEsS0FBSyxDQUFDLENBQUUsRUFBRSwyQ0FBNEMsQ0FBQztNQUN4RyxPQUFPQSxRQUFRO0lBQ2pCLENBQUM7SUFFRCxLQUFLLENBQUVYLGFBQWEsRUFBRSxJQUFJTixRQUFRLENBQUVPLFVBQVcsQ0FBQyxFQUFFQyxPQUFRLENBQUM7RUFDN0Q7QUFDRjtBQUVBTCxlQUFlLENBQUNnQixRQUFRLENBQUUsZ0JBQWdCLEVBQUVmLGNBQWUsQ0FBQyJ9