// Copyright 2021-2022, University of Colorado Boulder

import CoreModel from './CoreModel.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';

/**
 * For capacitors and inductors, includes the voltage and current from prior calculation,
 * since they feed into the next calculation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
export default class DynamicCoreModel extends CoreModel {
  // the voltage drop v1-v0
  // the conventional current as it moves from node 0 to node 1

  constructor(id, node0, node1, voltage, current) {
    super(id, node0, node1);
    this.voltage = voltage;
    this.current = current;
  }
}
circuitConstructionKitCommon.register('DynamicCoreModel', DynamicCoreModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb3JlTW9kZWwiLCJjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIiwiRHluYW1pY0NvcmVNb2RlbCIsImNvbnN0cnVjdG9yIiwiaWQiLCJub2RlMCIsIm5vZGUxIiwidm9sdGFnZSIsImN1cnJlbnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkR5bmFtaWNDb3JlTW9kZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5pbXBvcnQgQ29yZU1vZGVsIGZyb20gJy4vQ29yZU1vZGVsLmpzJztcclxuaW1wb3J0IGNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24gZnJvbSAnLi4vLi4vY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5qcyc7XHJcblxyXG4vKipcclxuICogRm9yIGNhcGFjaXRvcnMgYW5kIGluZHVjdG9ycywgaW5jbHVkZXMgdGhlIHZvbHRhZ2UgYW5kIGN1cnJlbnQgZnJvbSBwcmlvciBjYWxjdWxhdGlvbixcclxuICogc2luY2UgdGhleSBmZWVkIGludG8gdGhlIG5leHQgY2FsY3VsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEeW5hbWljQ29yZU1vZGVsIGV4dGVuZHMgQ29yZU1vZGVsIHtcclxuICBwdWJsaWMgcmVhZG9ubHkgdm9sdGFnZTogbnVtYmVyOyAvLyB0aGUgdm9sdGFnZSBkcm9wIHYxLXYwXHJcbiAgcHVibGljIHJlYWRvbmx5IGN1cnJlbnQ6IG51bWJlcjsgLy8gdGhlIGNvbnZlbnRpb25hbCBjdXJyZW50IGFzIGl0IG1vdmVzIGZyb20gbm9kZSAwIHRvIG5vZGUgMVxyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGlkOiBudW1iZXIsIG5vZGUwOiBzdHJpbmcsIG5vZGUxOiBzdHJpbmcsIHZvbHRhZ2U6IG51bWJlciwgY3VycmVudDogbnVtYmVyICkge1xyXG4gICAgc3VwZXIoIGlkLCBub2RlMCwgbm9kZTEgKTtcclxuICAgIHRoaXMudm9sdGFnZSA9IHZvbHRhZ2U7XHJcbiAgICB0aGlzLmN1cnJlbnQgPSBjdXJyZW50O1xyXG4gIH1cclxufVxyXG5cclxuY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5yZWdpc3RlciggJ0R5bmFtaWNDb3JlTW9kZWwnLCBEeW5hbWljQ29yZU1vZGVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sZ0JBQWdCO0FBQ3RDLE9BQU9DLDRCQUE0QixNQUFNLHVDQUF1Qzs7QUFFaEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxNQUFNQyxnQkFBZ0IsU0FBU0YsU0FBUyxDQUFDO0VBQ3JCO0VBQ0E7O0VBRTFCRyxXQUFXQSxDQUFFQyxFQUFVLEVBQUVDLEtBQWEsRUFBRUMsS0FBYSxFQUFFQyxPQUFlLEVBQUVDLE9BQWUsRUFBRztJQUMvRixLQUFLLENBQUVKLEVBQUUsRUFBRUMsS0FBSyxFQUFFQyxLQUFNLENBQUM7SUFDekIsSUFBSSxDQUFDQyxPQUFPLEdBQUdBLE9BQU87SUFDdEIsSUFBSSxDQUFDQyxPQUFPLEdBQUdBLE9BQU87RUFDeEI7QUFDRjtBQUVBUCw0QkFBNEIsQ0FBQ1EsUUFBUSxDQUFFLGtCQUFrQixFQUFFUCxnQkFBaUIsQ0FBQyJ9