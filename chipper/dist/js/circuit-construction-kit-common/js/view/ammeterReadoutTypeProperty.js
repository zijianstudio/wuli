// Copyright 2021-2022, University of Colorado Boulder

/**
 * Circuits schematic mode can be rendered as IEC or IEEE
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import AmmeterReadoutType from '../model/AmmeterReadoutType.js';
const ammeterReadoutTypeProperty = new EnumerationProperty(CCKCQueryParameters.ammeterReadout === 'magnitude' ? AmmeterReadoutType.MAGNITUDE : AmmeterReadoutType.SIGNED, {
  tandem: Tandem.PREFERENCES.createTandem('ammeterReadoutTypeProperty')
});
circuitConstructionKitCommon.register('ammeterReadoutTypeProperty', ammeterReadoutTypeProperty);
export default ammeterReadoutTypeProperty;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblByb3BlcnR5IiwiVGFuZGVtIiwiQ0NLQ1F1ZXJ5UGFyYW1ldGVycyIsImNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24iLCJBbW1ldGVyUmVhZG91dFR5cGUiLCJhbW1ldGVyUmVhZG91dFR5cGVQcm9wZXJ0eSIsImFtbWV0ZXJSZWFkb3V0IiwiTUFHTklUVURFIiwiU0lHTkVEIiwidGFuZGVtIiwiUFJFRkVSRU5DRVMiLCJjcmVhdGVUYW5kZW0iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbImFtbWV0ZXJSZWFkb3V0VHlwZVByb3BlcnR5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENpcmN1aXRzIHNjaGVtYXRpYyBtb2RlIGNhbiBiZSByZW5kZXJlZCBhcyBJRUMgb3IgSUVFRVxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IENDS0NRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vQ0NLQ1F1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIGZyb20gJy4uL2NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24uanMnO1xyXG5pbXBvcnQgQW1tZXRlclJlYWRvdXRUeXBlIGZyb20gJy4uL21vZGVsL0FtbWV0ZXJSZWFkb3V0VHlwZS5qcyc7XHJcblxyXG5jb25zdCBhbW1ldGVyUmVhZG91dFR5cGVQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBDQ0tDUXVlcnlQYXJhbWV0ZXJzLmFtbWV0ZXJSZWFkb3V0ID09PSAnbWFnbml0dWRlJyA/IEFtbWV0ZXJSZWFkb3V0VHlwZS5NQUdOSVRVREUgOiBBbW1ldGVyUmVhZG91dFR5cGUuU0lHTkVELCB7XHJcbiAgdGFuZGVtOiBUYW5kZW0uUFJFRkVSRU5DRVMuY3JlYXRlVGFuZGVtKCAnYW1tZXRlclJlYWRvdXRUeXBlUHJvcGVydHknIClcclxufSApO1xyXG5cclxuY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5yZWdpc3RlciggJ2FtbWV0ZXJSZWFkb3V0VHlwZVByb3BlcnR5JywgYW1tZXRlclJlYWRvdXRUeXBlUHJvcGVydHkgKTtcclxuZXhwb3J0IGRlZmF1bHQgYW1tZXRlclJlYWRvdXRUeXBlUHJvcGVydHk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBT0EsbUJBQW1CLE1BQU0seUNBQXlDO0FBQ3pFLE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFDakQsT0FBT0MsbUJBQW1CLE1BQU0sMkJBQTJCO0FBQzNELE9BQU9DLDRCQUE0QixNQUFNLG9DQUFvQztBQUM3RSxPQUFPQyxrQkFBa0IsTUFBTSxnQ0FBZ0M7QUFFL0QsTUFBTUMsMEJBQTBCLEdBQUcsSUFBSUwsbUJBQW1CLENBQUVFLG1CQUFtQixDQUFDSSxjQUFjLEtBQUssV0FBVyxHQUFHRixrQkFBa0IsQ0FBQ0csU0FBUyxHQUFHSCxrQkFBa0IsQ0FBQ0ksTUFBTSxFQUFFO0VBQ3pLQyxNQUFNLEVBQUVSLE1BQU0sQ0FBQ1MsV0FBVyxDQUFDQyxZQUFZLENBQUUsNEJBQTZCO0FBQ3hFLENBQUUsQ0FBQztBQUVIUiw0QkFBNEIsQ0FBQ1MsUUFBUSxDQUFFLDRCQUE0QixFQUFFUCwwQkFBMkIsQ0FBQztBQUNqRyxlQUFlQSwwQkFBMEIifQ==