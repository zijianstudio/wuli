// Copyright 2016-2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author John Blanco
 */

import statesOfMatter from '../statesOfMatter.js';
const SOMQueryParameters = QueryStringMachine.getAll({
  // Default to displaying degrees Celsius instead of Kelvin, requested by user(s), see
  // https://github.com/phetsims/states-of-matter/issues/216
  defaultCelsius: {
    type: 'flag',
    public: true
  },
  // make the burners sticky
  // @public, see https://github.com/phetsims/states-of-matter/issues/295
  stickyBurners: {
    type: 'flag',
    public: true
  }
});
statesOfMatter.register('SOMQueryParameters', SOMQueryParameters);
export default SOMQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzdGF0ZXNPZk1hdHRlciIsIlNPTVF1ZXJ5UGFyYW1ldGVycyIsIlF1ZXJ5U3RyaW5nTWFjaGluZSIsImdldEFsbCIsImRlZmF1bHRDZWxzaXVzIiwidHlwZSIsInB1YmxpYyIsInN0aWNreUJ1cm5lcnMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNPTVF1ZXJ5UGFyYW1ldGVycy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBRdWVyeSBwYXJhbWV0ZXJzIHN1cHBvcnRlZCBieSB0aGlzIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgc3RhdGVzT2ZNYXR0ZXIgZnJvbSAnLi4vc3RhdGVzT2ZNYXR0ZXIuanMnO1xyXG5cclxuY29uc3QgU09NUXVlcnlQYXJhbWV0ZXJzID0gUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbCgge1xyXG5cclxuICAvLyBEZWZhdWx0IHRvIGRpc3BsYXlpbmcgZGVncmVlcyBDZWxzaXVzIGluc3RlYWQgb2YgS2VsdmluLCByZXF1ZXN0ZWQgYnkgdXNlcihzKSwgc2VlXHJcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N0YXRlcy1vZi1tYXR0ZXIvaXNzdWVzLzIxNlxyXG4gIGRlZmF1bHRDZWxzaXVzOiB7XHJcbiAgICB0eXBlOiAnZmxhZycsXHJcbiAgICBwdWJsaWM6IHRydWVcclxuICB9LFxyXG5cclxuICAvLyBtYWtlIHRoZSBidXJuZXJzIHN0aWNreVxyXG4gIC8vIEBwdWJsaWMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3RhdGVzLW9mLW1hdHRlci9pc3N1ZXMvMjk1XHJcbiAgc3RpY2t5QnVybmVyczoge1xyXG4gICAgdHlwZTogJ2ZsYWcnLFxyXG4gICAgcHVibGljOiB0cnVlXHJcbiAgfVxyXG5cclxufSApO1xyXG5cclxuc3RhdGVzT2ZNYXR0ZXIucmVnaXN0ZXIoICdTT01RdWVyeVBhcmFtZXRlcnMnLCBTT01RdWVyeVBhcmFtZXRlcnMgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNPTVF1ZXJ5UGFyYW1ldGVyczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHNCQUFzQjtBQUVqRCxNQUFNQyxrQkFBa0IsR0FBR0Msa0JBQWtCLENBQUNDLE1BQU0sQ0FBRTtFQUVwRDtFQUNBO0VBQ0FDLGNBQWMsRUFBRTtJQUNkQyxJQUFJLEVBQUUsTUFBTTtJQUNaQyxNQUFNLEVBQUU7RUFDVixDQUFDO0VBRUQ7RUFDQTtFQUNBQyxhQUFhLEVBQUU7SUFDYkYsSUFBSSxFQUFFLE1BQU07SUFDWkMsTUFBTSxFQUFFO0VBQ1Y7QUFFRixDQUFFLENBQUM7QUFFSE4sY0FBYyxDQUFDUSxRQUFRLENBQUUsb0JBQW9CLEVBQUVQLGtCQUFtQixDQUFDO0FBRW5FLGVBQWVBLGtCQUFrQiJ9