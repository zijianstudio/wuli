// Copyright 2014-2020, University of Colorado Boulder
/**
 * Behavior modes that were decided upon after testing
 * @author John Blanco
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
const BehaviourModeType = {
  pauseAtEndOfPlayback: true,
  recordAtEndOfPlayback: false
};

// verify that enum is immutable, without the runtime penalty in production code
if (assert) {
  Object.freeze(BehaviourModeType);
}
neuron.register('BehaviourModeType', BehaviourModeType);
export default BehaviourModeType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJuZXVyb24iLCJCZWhhdmlvdXJNb2RlVHlwZSIsInBhdXNlQXRFbmRPZlBsYXliYWNrIiwicmVjb3JkQXRFbmRPZlBsYXliYWNrIiwiYXNzZXJ0IiwiT2JqZWN0IiwiZnJlZXplIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCZWhhdmlvdXJNb2RlVHlwZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuLyoqXHJcbiAqIEJlaGF2aW9yIG1vZGVzIHRoYXQgd2VyZSBkZWNpZGVkIHVwb24gYWZ0ZXIgdGVzdGluZ1xyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgU2hhcmZ1ZGVlbiBBc2hyYWYgKGZvciBHaGVudCBVbml2ZXJzaXR5KVxyXG4gKi9cclxuXHJcbmltcG9ydCBuZXVyb24gZnJvbSAnLi4vLi4vbmV1cm9uLmpzJztcclxuXHJcbmNvbnN0IEJlaGF2aW91ck1vZGVUeXBlID0ge1xyXG4gIHBhdXNlQXRFbmRPZlBsYXliYWNrOiB0cnVlLFxyXG4gIHJlY29yZEF0RW5kT2ZQbGF5YmFjazogZmFsc2VcclxufTtcclxuXHJcbi8vIHZlcmlmeSB0aGF0IGVudW0gaXMgaW1tdXRhYmxlLCB3aXRob3V0IHRoZSBydW50aW1lIHBlbmFsdHkgaW4gcHJvZHVjdGlvbiBjb2RlXHJcbmlmICggYXNzZXJ0ICkgeyBPYmplY3QuZnJlZXplKCBCZWhhdmlvdXJNb2RlVHlwZSApOyB9XHJcblxyXG5uZXVyb24ucmVnaXN0ZXIoICdCZWhhdmlvdXJNb2RlVHlwZScsIEJlaGF2aW91ck1vZGVUeXBlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCZWhhdmlvdXJNb2RlVHlwZTsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE1BQU0sTUFBTSxpQkFBaUI7QUFFcEMsTUFBTUMsaUJBQWlCLEdBQUc7RUFDeEJDLG9CQUFvQixFQUFFLElBQUk7RUFDMUJDLHFCQUFxQixFQUFFO0FBQ3pCLENBQUM7O0FBRUQ7QUFDQSxJQUFLQyxNQUFNLEVBQUc7RUFBRUMsTUFBTSxDQUFDQyxNQUFNLENBQUVMLGlCQUFrQixDQUFDO0FBQUU7QUFFcERELE1BQU0sQ0FBQ08sUUFBUSxDQUFFLG1CQUFtQixFQUFFTixpQkFBa0IsQ0FBQztBQUV6RCxlQUFlQSxpQkFBaUIifQ==