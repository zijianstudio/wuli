// Copyright 2022, University of Colorado Boulder

/**
 * Defines query parameters that are specific to this simulation.
 * Run with ?log to print query parameters and their values to the browser console at startup.
 *
 * @author {{AUTHOR}}
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import simulaRasa from '../simulaRasa.js';
const SCHEMA_MAP = {
  //TODO add schemas for query parameters
};
const SimulaRasaQueryParameters = QueryStringMachine.getAll(SCHEMA_MAP);

// The schema map is a read-only part of the public API, in case schema details (e.g. validValues) are needed elsewhere.
SimulaRasaQueryParameters.SCHEMA_MAP = SCHEMA_MAP;
simulaRasa.register('SimulaRasaQueryParameters', SimulaRasaQueryParameters);

// Log query parameters
logGlobal('phet.chipper.queryParameters');
logGlobal('phet.preloads.phetio.queryParameters');
logGlobal('phet.simulaRasa.SimulaRasaQueryParameters');
export default SimulaRasaQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJsb2dHbG9iYWwiLCJzaW11bGFSYXNhIiwiU0NIRU1BX01BUCIsIlNpbXVsYVJhc2FRdWVyeVBhcmFtZXRlcnMiLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJnZXRBbGwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNpbXVsYVJhc2FRdWVyeVBhcmFtZXRlcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERlZmluZXMgcXVlcnkgcGFyYW1ldGVycyB0aGF0IGFyZSBzcGVjaWZpYyB0byB0aGlzIHNpbXVsYXRpb24uXHJcbiAqIFJ1biB3aXRoID9sb2cgdG8gcHJpbnQgcXVlcnkgcGFyYW1ldGVycyBhbmQgdGhlaXIgdmFsdWVzIHRvIHRoZSBicm93c2VyIGNvbnNvbGUgYXQgc3RhcnR1cC5cclxuICpcclxuICogQGF1dGhvciB7e0FVVEhPUn19XHJcbiAqL1xyXG5cclxuaW1wb3J0IGxvZ0dsb2JhbCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbG9nR2xvYmFsLmpzJztcclxuaW1wb3J0IHNpbXVsYVJhc2EgZnJvbSAnLi4vc2ltdWxhUmFzYS5qcyc7XHJcblxyXG5jb25zdCBTQ0hFTUFfTUFQID0ge1xyXG4gIC8vVE9ETyBhZGQgc2NoZW1hcyBmb3IgcXVlcnkgcGFyYW1ldGVyc1xyXG59O1xyXG5cclxuY29uc3QgU2ltdWxhUmFzYVF1ZXJ5UGFyYW1ldGVycyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGwoIFNDSEVNQV9NQVAgKTtcclxuXHJcbi8vIFRoZSBzY2hlbWEgbWFwIGlzIGEgcmVhZC1vbmx5IHBhcnQgb2YgdGhlIHB1YmxpYyBBUEksIGluIGNhc2Ugc2NoZW1hIGRldGFpbHMgKGUuZy4gdmFsaWRWYWx1ZXMpIGFyZSBuZWVkZWQgZWxzZXdoZXJlLlxyXG5TaW11bGFSYXNhUXVlcnlQYXJhbWV0ZXJzLlNDSEVNQV9NQVAgPSBTQ0hFTUFfTUFQO1xyXG5cclxuc2ltdWxhUmFzYS5yZWdpc3RlciggJ1NpbXVsYVJhc2FRdWVyeVBhcmFtZXRlcnMnLCBTaW11bGFSYXNhUXVlcnlQYXJhbWV0ZXJzICk7XHJcblxyXG4vLyBMb2cgcXVlcnkgcGFyYW1ldGVyc1xyXG5sb2dHbG9iYWwoICdwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzJyApO1xyXG5sb2dHbG9iYWwoICdwaGV0LnByZWxvYWRzLnBoZXRpby5xdWVyeVBhcmFtZXRlcnMnICk7XHJcbmxvZ0dsb2JhbCggJ3BoZXQuc2ltdWxhUmFzYS5TaW11bGFSYXNhUXVlcnlQYXJhbWV0ZXJzJyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2ltdWxhUmFzYVF1ZXJ5UGFyYW1ldGVyczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sb0NBQW9DO0FBQzFELE9BQU9DLFVBQVUsTUFBTSxrQkFBa0I7QUFFekMsTUFBTUMsVUFBVSxHQUFHO0VBQ2pCO0FBQUEsQ0FDRDtBQUVELE1BQU1DLHlCQUF5QixHQUFHQyxrQkFBa0IsQ0FBQ0MsTUFBTSxDQUFFSCxVQUFXLENBQUM7O0FBRXpFO0FBQ0FDLHlCQUF5QixDQUFDRCxVQUFVLEdBQUdBLFVBQVU7QUFFakRELFVBQVUsQ0FBQ0ssUUFBUSxDQUFFLDJCQUEyQixFQUFFSCx5QkFBMEIsQ0FBQzs7QUFFN0U7QUFDQUgsU0FBUyxDQUFFLDhCQUErQixDQUFDO0FBQzNDQSxTQUFTLENBQUUsc0NBQXVDLENBQUM7QUFDbkRBLFNBQVMsQ0FBRSwyQ0FBNEMsQ0FBQztBQUV4RCxlQUFlRyx5QkFBeUIifQ==