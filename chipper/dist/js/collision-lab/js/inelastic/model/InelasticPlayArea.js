// Copyright 2020-2022, University of Colorado Boulder

/**
 * InelasticPlayArea is a PlayArea sub-type for the 'Inelastic' screen.
 *
 * @author Brandon Li
 */

import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import collisionLab from '../../collisionLab.js';
import PlayArea from '../../common/model/PlayArea.js';
import InelasticCollisionType from './InelasticCollisionType.js';
class InelasticPlayArea extends PlayArea {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      initialElasticityPercent: 0
    }, options);
    super(PlayArea.Dimension.TWO, options);

    //----------------------------------------------------------------------------------------

    // @public {Property.<InelasticCollisionType>} - the type of perfectly inelastic collision. Ignored
    //                                                           if the elasticity isn't 0.
    this.inelasticCollisionTypeProperty = new EnumerationDeprecatedProperty(InelasticCollisionType, InelasticCollisionType.STICK);

    // Verify that Paths are never visible for the 'Explore 1D' screen.
    assert && this.elasticityPercentProperty.link(elasticityPercent => assert(elasticityPercent === 0));
  }

  /**
   * Resets the InelasticPlayArea.
   * @public
   *
   * Called when the reset-all button is pressed.
   */
  reset() {
    super.reset();
    this.inelasticCollisionTypeProperty.reset();
  }
}
collisionLab.register('InelasticPlayArea', InelasticPlayArea);
export default InelasticPlayArea;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSIsIm1lcmdlIiwiY29sbGlzaW9uTGFiIiwiUGxheUFyZWEiLCJJbmVsYXN0aWNDb2xsaXNpb25UeXBlIiwiSW5lbGFzdGljUGxheUFyZWEiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJpbml0aWFsRWxhc3RpY2l0eVBlcmNlbnQiLCJEaW1lbnNpb24iLCJUV08iLCJpbmVsYXN0aWNDb2xsaXNpb25UeXBlUHJvcGVydHkiLCJTVElDSyIsImFzc2VydCIsImVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHkiLCJsaW5rIiwiZWxhc3RpY2l0eVBlcmNlbnQiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSW5lbGFzdGljUGxheUFyZWEuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSW5lbGFzdGljUGxheUFyZWEgaXMgYSBQbGF5QXJlYSBzdWItdHlwZSBmb3IgdGhlICdJbmVsYXN0aWMnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBCcmFuZG9uIExpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IGNvbGxpc2lvbkxhYiBmcm9tICcuLi8uLi9jb2xsaXNpb25MYWIuanMnO1xyXG5pbXBvcnQgUGxheUFyZWEgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1BsYXlBcmVhLmpzJztcclxuaW1wb3J0IEluZWxhc3RpY0NvbGxpc2lvblR5cGUgZnJvbSAnLi9JbmVsYXN0aWNDb2xsaXNpb25UeXBlLmpzJztcclxuXHJcbmNsYXNzIEluZWxhc3RpY1BsYXlBcmVhIGV4dGVuZHMgUGxheUFyZWEge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICBpbml0aWFsRWxhc3RpY2l0eVBlcmNlbnQ6IDBcclxuXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIFBsYXlBcmVhLkRpbWVuc2lvbi5UV08sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48SW5lbGFzdGljQ29sbGlzaW9uVHlwZT59IC0gdGhlIHR5cGUgb2YgcGVyZmVjdGx5IGluZWxhc3RpYyBjb2xsaXNpb24uIElnbm9yZWRcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiB0aGUgZWxhc3RpY2l0eSBpc24ndCAwLlxyXG4gICAgdGhpcy5pbmVsYXN0aWNDb2xsaXNpb25UeXBlUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkoIEluZWxhc3RpY0NvbGxpc2lvblR5cGUsXHJcbiAgICAgIEluZWxhc3RpY0NvbGxpc2lvblR5cGUuU1RJQ0sgKTtcclxuXHJcblxyXG4gICAgLy8gVmVyaWZ5IHRoYXQgUGF0aHMgYXJlIG5ldmVyIHZpc2libGUgZm9yIHRoZSAnRXhwbG9yZSAxRCcgc2NyZWVuLlxyXG4gICAgYXNzZXJ0ICYmIHRoaXMuZWxhc3RpY2l0eVBlcmNlbnRQcm9wZXJ0eS5saW5rKCBlbGFzdGljaXR5UGVyY2VudCA9PiBhc3NlcnQoIGVsYXN0aWNpdHlQZXJjZW50ID09PSAwICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgSW5lbGFzdGljUGxheUFyZWEuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHJlc2V0LWFsbCBidXR0b24gaXMgcHJlc3NlZC5cclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgICB0aGlzLmluZWxhc3RpY0NvbGxpc2lvblR5cGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuY29sbGlzaW9uTGFiLnJlZ2lzdGVyKCAnSW5lbGFzdGljUGxheUFyZWEnLCBJbmVsYXN0aWNQbGF5QXJlYSApO1xyXG5leHBvcnQgZGVmYXVsdCBJbmVsYXN0aWNQbGF5QXJlYTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsNkJBQTZCLE1BQU0sc0RBQXNEO0FBQ2hHLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsWUFBWSxNQUFNLHVCQUF1QjtBQUNoRCxPQUFPQyxRQUFRLE1BQU0sZ0NBQWdDO0FBQ3JELE9BQU9DLHNCQUFzQixNQUFNLDZCQUE2QjtBQUVoRSxNQUFNQyxpQkFBaUIsU0FBU0YsUUFBUSxDQUFDO0VBRXZDO0FBQ0Y7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxPQUFPLEVBQUc7SUFFckJBLE9BQU8sR0FBR04sS0FBSyxDQUFFO01BRWZPLHdCQUF3QixFQUFFO0lBRTVCLENBQUMsRUFBRUQsT0FBUSxDQUFDO0lBRVosS0FBSyxDQUFFSixRQUFRLENBQUNNLFNBQVMsQ0FBQ0MsR0FBRyxFQUFFSCxPQUFRLENBQUM7O0lBRXhDOztJQUVBO0lBQ0E7SUFDQSxJQUFJLENBQUNJLDhCQUE4QixHQUFHLElBQUlYLDZCQUE2QixDQUFFSSxzQkFBc0IsRUFDN0ZBLHNCQUFzQixDQUFDUSxLQUFNLENBQUM7O0lBR2hDO0lBQ0FDLE1BQU0sSUFBSSxJQUFJLENBQUNDLHlCQUF5QixDQUFDQyxJQUFJLENBQUVDLGlCQUFpQixJQUFJSCxNQUFNLENBQUVHLGlCQUFpQixLQUFLLENBQUUsQ0FBRSxDQUFDO0VBQ3pHOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxLQUFLQSxDQUFBLEVBQUc7SUFDTixLQUFLLENBQUNBLEtBQUssQ0FBQyxDQUFDO0lBQ2IsSUFBSSxDQUFDTiw4QkFBOEIsQ0FBQ00sS0FBSyxDQUFDLENBQUM7RUFDN0M7QUFDRjtBQUVBZixZQUFZLENBQUNnQixRQUFRLENBQUUsbUJBQW1CLEVBQUViLGlCQUFrQixDQUFDO0FBQy9ELGVBQWVBLGlCQUFpQiJ9