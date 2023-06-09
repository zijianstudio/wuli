// Copyright 2018-2022, University of Colorado Boulder

/**
 * Enumerates strategies for turning ShapePartition + Fraction => FilledPartition
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import fractionsCommon from '../../fractionsCommon.js';
const FillType = EnumerationDeprecated.byKeys(['SEQUENTIAL', 'MIXED',
// when number of shapes > 1, first shape will be completely filled and the 2nd shape will be random
'RANDOM']);
fractionsCommon.register('FillType', FillType);
export default FillType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJmcmFjdGlvbnNDb21tb24iLCJGaWxsVHlwZSIsImJ5S2V5cyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRmlsbFR5cGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRW51bWVyYXRlcyBzdHJhdGVnaWVzIGZvciB0dXJuaW5nIFNoYXBlUGFydGl0aW9uICsgRnJhY3Rpb24gPT4gRmlsbGVkUGFydGl0aW9uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb25EZXByZWNhdGVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbkRlcHJlY2F0ZWQuanMnO1xyXG5pbXBvcnQgZnJhY3Rpb25zQ29tbW9uIGZyb20gJy4uLy4uL2ZyYWN0aW9uc0NvbW1vbi5qcyc7XHJcblxyXG5jb25zdCBGaWxsVHlwZSA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFtcclxuICAnU0VRVUVOVElBTCcsXHJcbiAgJ01JWEVEJywgLy8gd2hlbiBudW1iZXIgb2Ygc2hhcGVzID4gMSwgZmlyc3Qgc2hhcGUgd2lsbCBiZSBjb21wbGV0ZWx5IGZpbGxlZCBhbmQgdGhlIDJuZCBzaGFwZSB3aWxsIGJlIHJhbmRvbVxyXG4gICdSQU5ET00nXHJcbl0gKTtcclxuZnJhY3Rpb25zQ29tbW9uLnJlZ2lzdGVyKCAnRmlsbFR5cGUnLCBGaWxsVHlwZSApO1xyXG5leHBvcnQgZGVmYXVsdCBGaWxsVHlwZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFCLE1BQU0sbURBQW1EO0FBQ3JGLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFFdEQsTUFBTUMsUUFBUSxHQUFHRixxQkFBcUIsQ0FBQ0csTUFBTSxDQUFFLENBQzdDLFlBQVksRUFDWixPQUFPO0FBQUU7QUFDVCxRQUFRLENBQ1IsQ0FBQztBQUNIRixlQUFlLENBQUNHLFFBQVEsQ0FBRSxVQUFVLEVBQUVGLFFBQVMsQ0FBQztBQUNoRCxlQUFlQSxRQUFRIn0=