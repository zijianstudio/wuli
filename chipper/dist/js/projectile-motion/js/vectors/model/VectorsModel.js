// Copyright 2016-2020, University of Colorado Boulder

/**
 * Model for the 'Vectors' Screen.
 *
 * @author Andrea Lin(PhET Interactive Simulations)
 */

import ProjectileMotionModel from '../../common/model/ProjectileMotionModel.js';
import ProjectileObjectType from '../../common/model/ProjectileObjectType.js';
import projectileMotion from '../../projectileMotion.js';
class VectorsModel extends ProjectileMotionModel {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    super(ProjectileObjectType.COMPANIONLESS, true, [ProjectileObjectType.COMPANIONLESS], tandem, {
      phetioInstrumentAltitudeProperty: false
    });
  }
}
projectileMotion.register('VectorsModel', VectorsModel);
export default VectorsModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9qZWN0aWxlTW90aW9uTW9kZWwiLCJQcm9qZWN0aWxlT2JqZWN0VHlwZSIsInByb2plY3RpbGVNb3Rpb24iLCJWZWN0b3JzTW9kZWwiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsIkNPTVBBTklPTkxFU1MiLCJwaGV0aW9JbnN0cnVtZW50QWx0aXR1ZGVQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVmVjdG9yc01vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGZvciB0aGUgJ1ZlY3RvcnMnIFNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBBbmRyZWEgTGluKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb2plY3RpbGVNb3Rpb25Nb2RlbCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUHJvamVjdGlsZU1vdGlvbk1vZGVsLmpzJztcclxuaW1wb3J0IFByb2plY3RpbGVPYmplY3RUeXBlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Qcm9qZWN0aWxlT2JqZWN0VHlwZS5qcyc7XHJcbmltcG9ydCBwcm9qZWN0aWxlTW90aW9uIGZyb20gJy4uLy4uL3Byb2plY3RpbGVNb3Rpb24uanMnO1xyXG5cclxuY2xhc3MgVmVjdG9yc01vZGVsIGV4dGVuZHMgUHJvamVjdGlsZU1vdGlvbk1vZGVsIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRhbmRlbSApIHtcclxuICAgIHN1cGVyKCBQcm9qZWN0aWxlT2JqZWN0VHlwZS5DT01QQU5JT05MRVNTLCB0cnVlLFxyXG4gICAgICBbIFByb2plY3RpbGVPYmplY3RUeXBlLkNPTVBBTklPTkxFU1MgXSwgdGFuZGVtLCB7XHJcbiAgICAgICAgcGhldGlvSW5zdHJ1bWVudEFsdGl0dWRlUHJvcGVydHk6IGZhbHNlXHJcbiAgICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbnByb2plY3RpbGVNb3Rpb24ucmVnaXN0ZXIoICdWZWN0b3JzTW9kZWwnLCBWZWN0b3JzTW9kZWwgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZlY3RvcnNNb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFCLE1BQU0sNkNBQTZDO0FBQy9FLE9BQU9DLG9CQUFvQixNQUFNLDRDQUE0QztBQUM3RSxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFFeEQsTUFBTUMsWUFBWSxTQUFTSCxxQkFBcUIsQ0FBQztFQUMvQztBQUNGO0FBQ0E7RUFDRUksV0FBV0EsQ0FBRUMsTUFBTSxFQUFHO0lBQ3BCLEtBQUssQ0FBRUosb0JBQW9CLENBQUNLLGFBQWEsRUFBRSxJQUFJLEVBQzdDLENBQUVMLG9CQUFvQixDQUFDSyxhQUFhLENBQUUsRUFBRUQsTUFBTSxFQUFFO01BQzlDRSxnQ0FBZ0MsRUFBRTtJQUNwQyxDQUFFLENBQUM7RUFDUDtBQUNGO0FBRUFMLGdCQUFnQixDQUFDTSxRQUFRLENBQUUsY0FBYyxFQUFFTCxZQUFhLENBQUM7QUFFekQsZUFBZUEsWUFBWSJ9