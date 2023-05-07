// Copyright 2014-2021, University of Colorado Boulder
/**
 * Possible types of particles used in this sim.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
const ParticleType = {
  SODIUM_ION: 'SODIUM_ION',
  POTASSIUM_ION: 'POTASSIUM_ION'
};

// verify that enum is immutable, without the runtime penalty in production code
if (assert) {
  Object.freeze(ParticleType);
}
neuron.register('ParticleType', ParticleType);
export default ParticleType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJuZXVyb24iLCJQYXJ0aWNsZVR5cGUiLCJTT0RJVU1fSU9OIiwiUE9UQVNTSVVNX0lPTiIsImFzc2VydCIsIk9iamVjdCIsImZyZWV6ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGFydGljbGVUeXBlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKipcclxuICogUG9zc2libGUgdHlwZXMgb2YgcGFydGljbGVzIHVzZWQgaW4gdGhpcyBzaW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBTaGFyZnVkZWVuIEFzaHJhZiAoZm9yIEdoZW50IFVuaXZlcnNpdHkpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG5ldXJvbiBmcm9tICcuLi8uLi9uZXVyb24uanMnO1xyXG5cclxuY29uc3QgUGFydGljbGVUeXBlID0ge1xyXG4gIFNPRElVTV9JT046ICdTT0RJVU1fSU9OJyxcclxuICBQT1RBU1NJVU1fSU9OOiAnUE9UQVNTSVVNX0lPTidcclxufTtcclxuXHJcbi8vIHZlcmlmeSB0aGF0IGVudW0gaXMgaW1tdXRhYmxlLCB3aXRob3V0IHRoZSBydW50aW1lIHBlbmFsdHkgaW4gcHJvZHVjdGlvbiBjb2RlXHJcbmlmICggYXNzZXJ0ICkgeyBPYmplY3QuZnJlZXplKCBQYXJ0aWNsZVR5cGUgKTsgfVxyXG5cclxubmV1cm9uLnJlZ2lzdGVyKCAnUGFydGljbGVUeXBlJywgUGFydGljbGVUeXBlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQYXJ0aWNsZVR5cGU7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0saUJBQWlCO0FBRXBDLE1BQU1DLFlBQVksR0FBRztFQUNuQkMsVUFBVSxFQUFFLFlBQVk7RUFDeEJDLGFBQWEsRUFBRTtBQUNqQixDQUFDOztBQUVEO0FBQ0EsSUFBS0MsTUFBTSxFQUFHO0VBQUVDLE1BQU0sQ0FBQ0MsTUFBTSxDQUFFTCxZQUFhLENBQUM7QUFBRTtBQUUvQ0QsTUFBTSxDQUFDTyxRQUFRLENBQUUsY0FBYyxFQUFFTixZQUFhLENBQUM7QUFFL0MsZUFBZUEsWUFBWSJ9