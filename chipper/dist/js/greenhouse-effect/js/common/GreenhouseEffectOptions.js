// Copyright 2022, University of Colorado Boulder

/**
 * GreenhouseEffectOptions defines the global options for this simulation.  Depending on the particulars, these can be
 * controlled via phet-io, query parameters, and/or from the "Options..." dialog.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import greenhouseEffect from '../greenhouseEffect.js';
import GreenhouseEffectQueryParameters from './GreenhouseEffectQueryParameters.js';

// constants
const optionsTandem = Tandem.GLOBAL_VIEW.createTandem('options');
const GreenhouseEffectOptions = {
  cueingArrowsEnabledProperty: new BooleanProperty(GreenhouseEffectQueryParameters.cueingArrowsEnabled, {
    tandem: optionsTandem.createTandem('cueingArrowsEnabledProperty'),
    phetioDocumentation: 'shows cueing arrows on draggable elements'
  })
};
greenhouseEffect.register('GreenhouseEffectOptions', GreenhouseEffectOptions);
export default GreenhouseEffectOptions;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJUYW5kZW0iLCJncmVlbmhvdXNlRWZmZWN0IiwiR3JlZW5ob3VzZUVmZmVjdFF1ZXJ5UGFyYW1ldGVycyIsIm9wdGlvbnNUYW5kZW0iLCJHTE9CQUxfVklFVyIsImNyZWF0ZVRhbmRlbSIsIkdyZWVuaG91c2VFZmZlY3RPcHRpb25zIiwiY3VlaW5nQXJyb3dzRW5hYmxlZFByb3BlcnR5IiwiY3VlaW5nQXJyb3dzRW5hYmxlZCIsInRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdyZWVuaG91c2VFZmZlY3RPcHRpb25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBHcmVlbmhvdXNlRWZmZWN0T3B0aW9ucyBkZWZpbmVzIHRoZSBnbG9iYWwgb3B0aW9ucyBmb3IgdGhpcyBzaW11bGF0aW9uLiAgRGVwZW5kaW5nIG9uIHRoZSBwYXJ0aWN1bGFycywgdGhlc2UgY2FuIGJlXHJcbiAqIGNvbnRyb2xsZWQgdmlhIHBoZXQtaW8sIHF1ZXJ5IHBhcmFtZXRlcnMsIGFuZC9vciBmcm9tIHRoZSBcIk9wdGlvbnMuLi5cIiBkaWFsb2cuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdFF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuL0dyZWVuaG91c2VFZmZlY3RRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IG9wdGlvbnNUYW5kZW0gPSBUYW5kZW0uR0xPQkFMX1ZJRVcuY3JlYXRlVGFuZGVtKCAnb3B0aW9ucycgKTtcclxuXHJcbmNvbnN0IEdyZWVuaG91c2VFZmZlY3RPcHRpb25zID0ge1xyXG5cclxuICBjdWVpbmdBcnJvd3NFbmFibGVkUHJvcGVydHk6IG5ldyBCb29sZWFuUHJvcGVydHkoIEdyZWVuaG91c2VFZmZlY3RRdWVyeVBhcmFtZXRlcnMuY3VlaW5nQXJyb3dzRW5hYmxlZCwge1xyXG4gICAgdGFuZGVtOiBvcHRpb25zVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2N1ZWluZ0Fycm93c0VuYWJsZWRQcm9wZXJ0eScgKSxcclxuICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdzaG93cyBjdWVpbmcgYXJyb3dzIG9uIGRyYWdnYWJsZSBlbGVtZW50cydcclxuICB9IClcclxuXHJcbn07XHJcblxyXG5ncmVlbmhvdXNlRWZmZWN0LnJlZ2lzdGVyKCAnR3JlZW5ob3VzZUVmZmVjdE9wdGlvbnMnLCBHcmVlbmhvdXNlRWZmZWN0T3B0aW9ucyApO1xyXG5leHBvcnQgZGVmYXVsdCBHcmVlbmhvdXNlRWZmZWN0T3B0aW9ucztcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHFDQUFxQztBQUNqRSxPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLGdCQUFnQixNQUFNLHdCQUF3QjtBQUNyRCxPQUFPQywrQkFBK0IsTUFBTSxzQ0FBc0M7O0FBRWxGO0FBQ0EsTUFBTUMsYUFBYSxHQUFHSCxNQUFNLENBQUNJLFdBQVcsQ0FBQ0MsWUFBWSxDQUFFLFNBQVUsQ0FBQztBQUVsRSxNQUFNQyx1QkFBdUIsR0FBRztFQUU5QkMsMkJBQTJCLEVBQUUsSUFBSVIsZUFBZSxDQUFFRywrQkFBK0IsQ0FBQ00sbUJBQW1CLEVBQUU7SUFDckdDLE1BQU0sRUFBRU4sYUFBYSxDQUFDRSxZQUFZLENBQUUsNkJBQThCLENBQUM7SUFDbkVLLG1CQUFtQixFQUFFO0VBQ3ZCLENBQUU7QUFFSixDQUFDO0FBRURULGdCQUFnQixDQUFDVSxRQUFRLENBQUUseUJBQXlCLEVBQUVMLHVCQUF3QixDQUFDO0FBQy9FLGVBQWVBLHVCQUF1QiJ9