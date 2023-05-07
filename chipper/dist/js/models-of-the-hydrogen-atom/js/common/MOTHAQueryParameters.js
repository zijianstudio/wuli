// Copyright 2022, University of Colorado Boulder

/**
 * Query parameters supported by the geometric-optics simulation.
 * Running with ?log will print these query parameters and their values to the console at startup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import modelsOfTheHydrogenAtom from '../modelsOfTheHydrogenAtom.js';
const SCHEMA_MAP = {
  //----------------------------------------------------------------------------------------------------------------
  // Public-facing query parameters
  //----------------------------------------------------------------------------------------------------------------

  //----------------------------------------------------------------------------------------------------------------
  // Internal query parameters
  //----------------------------------------------------------------------------------------------------------------

  // Draws a red rectangle around emitted photons.
  debugEmission: {
    type: 'flag'
  },
  // Specifies how much to scale time (dt) for 'Normal' and 'Fast' time speeds, in that order.
  timeScale: {
    type: 'array',
    elementSchema: {
      type: 'number',
      isValidValue: scale => scale > 0
    },
    defaultValue: [1, 2],
    isValidValue: array => array.length === 2 && array[0] < array[1]
  }
};
const MOTHAQueryParameters = QueryStringMachine.getAll(SCHEMA_MAP);
MOTHAQueryParameters.SCHEMA_MAP = SCHEMA_MAP;
modelsOfTheHydrogenAtom.register('MOTHAQueryParameters', MOTHAQueryParameters);

// Log query parameters
logGlobal('phet.chipper.queryParameters');
logGlobal('phet.preloads.phetio.queryParameters');
logGlobal('phet.geometricOptics.MOTHAQueryParameters');
export default MOTHAQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJsb2dHbG9iYWwiLCJtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSIsIlNDSEVNQV9NQVAiLCJkZWJ1Z0VtaXNzaW9uIiwidHlwZSIsInRpbWVTY2FsZSIsImVsZW1lbnRTY2hlbWEiLCJpc1ZhbGlkVmFsdWUiLCJzY2FsZSIsImRlZmF1bHRWYWx1ZSIsImFycmF5IiwibGVuZ3RoIiwiTU9USEFRdWVyeVBhcmFtZXRlcnMiLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJnZXRBbGwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1PVEhBUXVlcnlQYXJhbWV0ZXJzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBRdWVyeSBwYXJhbWV0ZXJzIHN1cHBvcnRlZCBieSB0aGUgZ2VvbWV0cmljLW9wdGljcyBzaW11bGF0aW9uLlxyXG4gKiBSdW5uaW5nIHdpdGggP2xvZyB3aWxsIHByaW50IHRoZXNlIHF1ZXJ5IHBhcmFtZXRlcnMgYW5kIHRoZWlyIHZhbHVlcyB0byB0aGUgY29uc29sZSBhdCBzdGFydHVwLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBsb2dHbG9iYWwgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2xvZ0dsb2JhbC5qcyc7XHJcbmltcG9ydCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSBmcm9tICcuLi9tb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbS5qcyc7XHJcblxyXG5jb25zdCBTQ0hFTUFfTUFQOiBSZWNvcmQ8c3RyaW5nLCBRdWVyeVN0cmluZ01hY2hpbmVTY2hlbWE+ID0ge1xyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBQdWJsaWMtZmFjaW5nIHF1ZXJ5IHBhcmFtZXRlcnNcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gSW50ZXJuYWwgcXVlcnkgcGFyYW1ldGVyc1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvLyBEcmF3cyBhIHJlZCByZWN0YW5nbGUgYXJvdW5kIGVtaXR0ZWQgcGhvdG9ucy5cclxuICBkZWJ1Z0VtaXNzaW9uOiB7XHJcbiAgICB0eXBlOiAnZmxhZydcclxuICB9LFxyXG5cclxuICAvLyBTcGVjaWZpZXMgaG93IG11Y2ggdG8gc2NhbGUgdGltZSAoZHQpIGZvciAnTm9ybWFsJyBhbmQgJ0Zhc3QnIHRpbWUgc3BlZWRzLCBpbiB0aGF0IG9yZGVyLlxyXG4gIHRpbWVTY2FsZToge1xyXG4gICAgdHlwZTogJ2FycmF5JyxcclxuICAgIGVsZW1lbnRTY2hlbWE6IHtcclxuICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgIGlzVmFsaWRWYWx1ZTogKCBzY2FsZTogbnVtYmVyICkgPT4gKCBzY2FsZSA+IDAgKVxyXG4gICAgfSxcclxuICAgIGRlZmF1bHRWYWx1ZTogWyAxLCAyIF0sXHJcbiAgICBpc1ZhbGlkVmFsdWU6ICggYXJyYXk6IG51bWJlcltdICkgPT4gKCBhcnJheS5sZW5ndGggPT09IDIgKSAmJiAoIGFycmF5WyAwIF0gPCBhcnJheVsgMSBdIClcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBNT1RIQVF1ZXJ5UGFyYW1ldGVycyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGwoIFNDSEVNQV9NQVAgKTtcclxuXHJcbk1PVEhBUXVlcnlQYXJhbWV0ZXJzLlNDSEVNQV9NQVAgPSBTQ0hFTUFfTUFQO1xyXG5cclxubW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20ucmVnaXN0ZXIoICdNT1RIQVF1ZXJ5UGFyYW1ldGVycycsIE1PVEhBUXVlcnlQYXJhbWV0ZXJzICk7XHJcblxyXG4vLyBMb2cgcXVlcnkgcGFyYW1ldGVyc1xyXG5sb2dHbG9iYWwoICdwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzJyApO1xyXG5sb2dHbG9iYWwoICdwaGV0LnByZWxvYWRzLnBoZXRpby5xdWVyeVBhcmFtZXRlcnMnICk7XHJcbmxvZ0dsb2JhbCggJ3BoZXQuZ2VvbWV0cmljT3B0aWNzLk1PVEhBUXVlcnlQYXJhbWV0ZXJzJyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTU9USEFRdWVyeVBhcmFtZXRlcnM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLG9DQUFvQztBQUMxRCxPQUFPQyx1QkFBdUIsTUFBTSwrQkFBK0I7QUFFbkUsTUFBTUMsVUFBb0QsR0FBRztFQUUzRDtFQUNBO0VBQ0E7O0VBRUE7RUFDQTtFQUNBOztFQUVBO0VBQ0FDLGFBQWEsRUFBRTtJQUNiQyxJQUFJLEVBQUU7RUFDUixDQUFDO0VBRUQ7RUFDQUMsU0FBUyxFQUFFO0lBQ1RELElBQUksRUFBRSxPQUFPO0lBQ2JFLGFBQWEsRUFBRTtNQUNiRixJQUFJLEVBQUUsUUFBUTtNQUNkRyxZQUFZLEVBQUlDLEtBQWEsSUFBUUEsS0FBSyxHQUFHO0lBQy9DLENBQUM7SUFDREMsWUFBWSxFQUFFLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRTtJQUN0QkYsWUFBWSxFQUFJRyxLQUFlLElBQVFBLEtBQUssQ0FBQ0MsTUFBTSxLQUFLLENBQUMsSUFBUUQsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHQSxLQUFLLENBQUUsQ0FBQztFQUN4RjtBQUNGLENBQUM7QUFFRCxNQUFNRSxvQkFBb0IsR0FBR0Msa0JBQWtCLENBQUNDLE1BQU0sQ0FBRVosVUFBVyxDQUFDO0FBRXBFVSxvQkFBb0IsQ0FBQ1YsVUFBVSxHQUFHQSxVQUFVO0FBRTVDRCx1QkFBdUIsQ0FBQ2MsUUFBUSxDQUFFLHNCQUFzQixFQUFFSCxvQkFBcUIsQ0FBQzs7QUFFaEY7QUFDQVosU0FBUyxDQUFFLDhCQUErQixDQUFDO0FBQzNDQSxTQUFTLENBQUUsc0NBQXVDLENBQUM7QUFDbkRBLFNBQVMsQ0FBRSwyQ0FBNEMsQ0FBQztBQUV4RCxlQUFlWSxvQkFBb0IifQ==