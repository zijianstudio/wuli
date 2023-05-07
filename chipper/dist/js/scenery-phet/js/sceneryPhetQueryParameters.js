// Copyright 2016-2022, University of Colorado Boulder

/**
 * Query parameters for the scenery-phet demo application.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import sceneryPhet from './sceneryPhet.js';
const sceneryPhetQueryParameters = QueryStringMachine.getAll({
  // background color of the screens
  backgroundColor: {
    type: 'string',
    // CSS color format, e.g. 'green', 'ff8c00', 'rgb(255,0,255)'
    defaultValue: 'white'
  },
  // initial selection on the Sliders screen, values are the same as the labels on combo box items
  slider: {
    type: 'string',
    defaultValue: null
  },
  // initial selection on the Components screen, values are the same as the labels on combo box items
  component: {
    type: 'string',
    defaultValue: null
  },
  // Should be a CSS font-family compatible string, see https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
  fontFamily: {
    type: 'string',
    defaultValue: 'Arial'
  }
});
sceneryPhet.register('sceneryPhetQueryParameters', sceneryPhetQueryParameters);
export default sceneryPhetQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzY2VuZXJ5UGhldCIsInNjZW5lcnlQaGV0UXVlcnlQYXJhbWV0ZXJzIiwiUXVlcnlTdHJpbmdNYWNoaW5lIiwiZ2V0QWxsIiwiYmFja2dyb3VuZENvbG9yIiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsInNsaWRlciIsImNvbXBvbmVudCIsImZvbnRGYW1pbHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbInNjZW5lcnlQaGV0UXVlcnlQYXJhbWV0ZXJzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFF1ZXJ5IHBhcmFtZXRlcnMgZm9yIHRoZSBzY2VuZXJ5LXBoZXQgZGVtbyBhcHBsaWNhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XHJcblxyXG5jb25zdCBzY2VuZXJ5UGhldFF1ZXJ5UGFyYW1ldGVycyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGwoIHtcclxuXHJcbiAgLy8gYmFja2dyb3VuZCBjb2xvciBvZiB0aGUgc2NyZWVuc1xyXG4gIGJhY2tncm91bmRDb2xvcjoge1xyXG4gICAgdHlwZTogJ3N0cmluZycsIC8vIENTUyBjb2xvciBmb3JtYXQsIGUuZy4gJ2dyZWVuJywgJ2ZmOGMwMCcsICdyZ2IoMjU1LDAsMjU1KSdcclxuICAgIGRlZmF1bHRWYWx1ZTogJ3doaXRlJ1xyXG4gIH0sXHJcblxyXG4gIC8vIGluaXRpYWwgc2VsZWN0aW9uIG9uIHRoZSBTbGlkZXJzIHNjcmVlbiwgdmFsdWVzIGFyZSB0aGUgc2FtZSBhcyB0aGUgbGFiZWxzIG9uIGNvbWJvIGJveCBpdGVtc1xyXG4gIHNsaWRlcjoge1xyXG4gICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICBkZWZhdWx0VmFsdWU6IG51bGxcclxuICB9LFxyXG5cclxuICAvLyBpbml0aWFsIHNlbGVjdGlvbiBvbiB0aGUgQ29tcG9uZW50cyBzY3JlZW4sIHZhbHVlcyBhcmUgdGhlIHNhbWUgYXMgdGhlIGxhYmVscyBvbiBjb21ibyBib3ggaXRlbXNcclxuICBjb21wb25lbnQ6IHtcclxuICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgZGVmYXVsdFZhbHVlOiBudWxsXHJcbiAgfSxcclxuXHJcbiAgLy8gU2hvdWxkIGJlIGEgQ1NTIGZvbnQtZmFtaWx5IGNvbXBhdGlibGUgc3RyaW5nLCBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL2ZvbnQtZmFtaWx5XHJcbiAgZm9udEZhbWlseToge1xyXG4gICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICBkZWZhdWx0VmFsdWU6ICdBcmlhbCdcclxuICB9XHJcbn0gKTtcclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnc2NlbmVyeVBoZXRRdWVyeVBhcmFtZXRlcnMnLCBzY2VuZXJ5UGhldFF1ZXJ5UGFyYW1ldGVycyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgc2NlbmVyeVBoZXRRdWVyeVBhcmFtZXRlcnM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSxrQkFBa0I7QUFFMUMsTUFBTUMsMEJBQTBCLEdBQUdDLGtCQUFrQixDQUFDQyxNQUFNLENBQUU7RUFFNUQ7RUFDQUMsZUFBZSxFQUFFO0lBQ2ZDLElBQUksRUFBRSxRQUFRO0lBQUU7SUFDaEJDLFlBQVksRUFBRTtFQUNoQixDQUFDO0VBRUQ7RUFDQUMsTUFBTSxFQUFFO0lBQ05GLElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRTtFQUNoQixDQUFDO0VBRUQ7RUFDQUUsU0FBUyxFQUFFO0lBQ1RILElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRTtFQUNoQixDQUFDO0VBRUQ7RUFDQUcsVUFBVSxFQUFFO0lBQ1ZKLElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRTtFQUNoQjtBQUNGLENBQUUsQ0FBQztBQUVITixXQUFXLENBQUNVLFFBQVEsQ0FBRSw0QkFBNEIsRUFBRVQsMEJBQTJCLENBQUM7QUFFaEYsZUFBZUEsMEJBQTBCIn0=