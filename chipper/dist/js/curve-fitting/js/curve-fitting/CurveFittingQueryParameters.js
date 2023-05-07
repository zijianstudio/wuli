// Copyright 2017-2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Martin Veillette (Berea College)
 */

import curveFitting from '../curveFitting.js';
const CurveFittingQueryParameters = window.QueryStringMachine.getAll({
  // Determines whether dragged points should be placed such that their coordinates are rounded to the nearest 1.
  // For internal use only, not public facing.
  snapToGrid: {
    type: 'boolean',
    defaultValue: false
  }
});
curveFitting.register('CurveFittingQueryParameters', CurveFittingQueryParameters);
export default CurveFittingQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjdXJ2ZUZpdHRpbmciLCJDdXJ2ZUZpdHRpbmdRdWVyeVBhcmFtZXRlcnMiLCJ3aW5kb3ciLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJnZXRBbGwiLCJzbmFwVG9HcmlkIiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ3VydmVGaXR0aW5nUXVlcnlQYXJhbWV0ZXJzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFF1ZXJ5IHBhcmFtZXRlcnMgc3VwcG9ydGVkIGJ5IHRoaXMgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlIChCZXJlYSBDb2xsZWdlKVxyXG4gKi9cclxuXHJcbmltcG9ydCBjdXJ2ZUZpdHRpbmcgZnJvbSAnLi4vY3VydmVGaXR0aW5nLmpzJztcclxuXHJcbmNvbnN0IEN1cnZlRml0dGluZ1F1ZXJ5UGFyYW1ldGVycyA9IHdpbmRvdy5RdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsKCB7XHJcblxyXG4gIC8vIERldGVybWluZXMgd2hldGhlciBkcmFnZ2VkIHBvaW50cyBzaG91bGQgYmUgcGxhY2VkIHN1Y2ggdGhhdCB0aGVpciBjb29yZGluYXRlcyBhcmUgcm91bmRlZCB0byB0aGUgbmVhcmVzdCAxLlxyXG4gIC8vIEZvciBpbnRlcm5hbCB1c2Ugb25seSwgbm90IHB1YmxpYyBmYWNpbmcuXHJcbiAgc25hcFRvR3JpZDoge1xyXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgZGVmYXVsdFZhbHVlOiBmYWxzZVxyXG4gIH1cclxuXHJcbn0gKTtcclxuXHJcbmN1cnZlRml0dGluZy5yZWdpc3RlciggJ0N1cnZlRml0dGluZ1F1ZXJ5UGFyYW1ldGVycycsIEN1cnZlRml0dGluZ1F1ZXJ5UGFyYW1ldGVycyApO1xyXG5leHBvcnQgZGVmYXVsdCBDdXJ2ZUZpdHRpbmdRdWVyeVBhcmFtZXRlcnM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFlBQVksTUFBTSxvQkFBb0I7QUFFN0MsTUFBTUMsMkJBQTJCLEdBQUdDLE1BQU0sQ0FBQ0Msa0JBQWtCLENBQUNDLE1BQU0sQ0FBRTtFQUVwRTtFQUNBO0VBQ0FDLFVBQVUsRUFBRTtJQUNWQyxJQUFJLEVBQUUsU0FBUztJQUNmQyxZQUFZLEVBQUU7RUFDaEI7QUFFRixDQUFFLENBQUM7QUFFSFAsWUFBWSxDQUFDUSxRQUFRLENBQUUsNkJBQTZCLEVBQUVQLDJCQUE0QixDQUFDO0FBQ25GLGVBQWVBLDJCQUEyQiJ9