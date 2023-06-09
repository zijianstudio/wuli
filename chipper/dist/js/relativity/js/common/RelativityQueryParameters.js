// Copyright 2023, University of Colorado Boulder

/**
 * Defines query parameters that are specific to this simulation.
 * Run with ?log to print query parameters and their values to the browser console at startup.
 *
 * @author Zijian Wang
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import relativity from '../relativity.js';
const SCHEMA_MAP = {
  //TODO add schemas for query parameters
};
const RelativityQueryParameters = QueryStringMachine.getAll(SCHEMA_MAP);

// The schema map is a read-only part of the public API, in case schema details (e.g. validValues) are needed elsewhere.
RelativityQueryParameters.SCHEMA_MAP = SCHEMA_MAP;
relativity.register('RelativityQueryParameters', RelativityQueryParameters);

// Log query parameters
logGlobal('phet.chipper.queryParameters');
logGlobal('phet.preloads.phetio.queryParameters');
logGlobal('phet.relativity.RelativityQueryParameters');
export default RelativityQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJsb2dHbG9iYWwiLCJyZWxhdGl2aXR5IiwiU0NIRU1BX01BUCIsIlJlbGF0aXZpdHlRdWVyeVBhcmFtZXRlcnMiLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJnZXRBbGwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJlbGF0aXZpdHlRdWVyeVBhcmFtZXRlcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERlZmluZXMgcXVlcnkgcGFyYW1ldGVycyB0aGF0IGFyZSBzcGVjaWZpYyB0byB0aGlzIHNpbXVsYXRpb24uXHJcbiAqIFJ1biB3aXRoID9sb2cgdG8gcHJpbnQgcXVlcnkgcGFyYW1ldGVycyBhbmQgdGhlaXIgdmFsdWVzIHRvIHRoZSBicm93c2VyIGNvbnNvbGUgYXQgc3RhcnR1cC5cclxuICpcclxuICogQGF1dGhvciBaaWppYW4gV2FuZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBsb2dHbG9iYWwgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2xvZ0dsb2JhbC5qcyc7XHJcbmltcG9ydCByZWxhdGl2aXR5IGZyb20gJy4uL3JlbGF0aXZpdHkuanMnO1xyXG5cclxuY29uc3QgU0NIRU1BX01BUCA9IHtcclxuICAvL1RPRE8gYWRkIHNjaGVtYXMgZm9yIHF1ZXJ5IHBhcmFtZXRlcnNcclxufTtcclxuXHJcbmNvbnN0IFJlbGF0aXZpdHlRdWVyeVBhcmFtZXRlcnMgPSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsKCBTQ0hFTUFfTUFQICk7XHJcblxyXG4vLyBUaGUgc2NoZW1hIG1hcCBpcyBhIHJlYWQtb25seSBwYXJ0IG9mIHRoZSBwdWJsaWMgQVBJLCBpbiBjYXNlIHNjaGVtYSBkZXRhaWxzIChlLmcuIHZhbGlkVmFsdWVzKSBhcmUgbmVlZGVkIGVsc2V3aGVyZS5cclxuUmVsYXRpdml0eVF1ZXJ5UGFyYW1ldGVycy5TQ0hFTUFfTUFQID0gU0NIRU1BX01BUDtcclxuXHJcbnJlbGF0aXZpdHkucmVnaXN0ZXIoICdSZWxhdGl2aXR5UXVlcnlQYXJhbWV0ZXJzJywgUmVsYXRpdml0eVF1ZXJ5UGFyYW1ldGVycyApO1xyXG5cclxuLy8gTG9nIHF1ZXJ5IHBhcmFtZXRlcnNcclxubG9nR2xvYmFsKCAncGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycycgKTtcclxubG9nR2xvYmFsKCAncGhldC5wcmVsb2Fkcy5waGV0aW8ucXVlcnlQYXJhbWV0ZXJzJyApO1xyXG5sb2dHbG9iYWwoICdwaGV0LnJlbGF0aXZpdHkuUmVsYXRpdml0eVF1ZXJ5UGFyYW1ldGVycycgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJlbGF0aXZpdHlRdWVyeVBhcmFtZXRlcnM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLG9DQUFvQztBQUMxRCxPQUFPQyxVQUFVLE1BQU0sa0JBQWtCO0FBRXpDLE1BQU1DLFVBQVUsR0FBRztFQUNqQjtBQUFBLENBQ0Q7QUFFRCxNQUFNQyx5QkFBeUIsR0FBR0Msa0JBQWtCLENBQUNDLE1BQU0sQ0FBRUgsVUFBVyxDQUFDOztBQUV6RTtBQUNBQyx5QkFBeUIsQ0FBQ0QsVUFBVSxHQUFHQSxVQUFVO0FBRWpERCxVQUFVLENBQUNLLFFBQVEsQ0FBRSwyQkFBMkIsRUFBRUgseUJBQTBCLENBQUM7O0FBRTdFO0FBQ0FILFNBQVMsQ0FBRSw4QkFBK0IsQ0FBQztBQUMzQ0EsU0FBUyxDQUFFLHNDQUF1QyxDQUFDO0FBQ25EQSxTQUFTLENBQUUsMkNBQTRDLENBQUM7QUFFeEQsZUFBZUcseUJBQXlCIn0=