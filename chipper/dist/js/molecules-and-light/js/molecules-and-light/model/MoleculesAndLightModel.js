// Copyright 2020-2023, University of Colorado Boulder

/**
 * The model for MoleculesAndLight.
 *
 * @author Jesse Greenberg
 */

import GreenhouseEffectQueryParameters from '../../../../greenhouse-effect/js/common/GreenhouseEffectQueryParameters.js';
import PhotonAbsorptionModel from '../../../../greenhouse-effect/js/micro/model/PhotonAbsorptionModel.js';
import PhotonTarget from '../../../../greenhouse-effect/js/micro/model/PhotonTarget.js';
import moleculesAndLight from '../../moleculesAndLight.js';

/**
 * @public
 */
class MoleculesAndLightModel extends PhotonAbsorptionModel {
  constructor(tandem) {
    const initialTarget = GreenhouseEffectQueryParameters.openSciEd ? PhotonTarget.SINGLE_N2_MOLECULE : PhotonTarget.SINGLE_CO_MOLECULE;
    super(initialTarget, tandem);
  }
}
moleculesAndLight.register('MoleculesAndLightModel', MoleculesAndLightModel);
export default MoleculesAndLightModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHcmVlbmhvdXNlRWZmZWN0UXVlcnlQYXJhbWV0ZXJzIiwiUGhvdG9uQWJzb3JwdGlvbk1vZGVsIiwiUGhvdG9uVGFyZ2V0IiwibW9sZWN1bGVzQW5kTGlnaHQiLCJNb2xlY3VsZXNBbmRMaWdodE1vZGVsIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJpbml0aWFsVGFyZ2V0Iiwib3BlblNjaUVkIiwiU0lOR0xFX04yX01PTEVDVUxFIiwiU0lOR0xFX0NPX01PTEVDVUxFIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNb2xlY3VsZXNBbmRMaWdodE1vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBtb2RlbCBmb3IgTW9sZWN1bGVzQW5kTGlnaHQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IEdyZWVuaG91c2VFZmZlY3RRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vLi4vLi4vLi4vZ3JlZW5ob3VzZS1lZmZlY3QvanMvY29tbW9uL0dyZWVuaG91c2VFZmZlY3RRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgUGhvdG9uQWJzb3JwdGlvbk1vZGVsIGZyb20gJy4uLy4uLy4uLy4uL2dyZWVuaG91c2UtZWZmZWN0L2pzL21pY3JvL21vZGVsL1Bob3RvbkFic29ycHRpb25Nb2RlbC5qcyc7XHJcbmltcG9ydCBQaG90b25UYXJnZXQgZnJvbSAnLi4vLi4vLi4vLi4vZ3JlZW5ob3VzZS1lZmZlY3QvanMvbWljcm8vbW9kZWwvUGhvdG9uVGFyZ2V0LmpzJztcclxuaW1wb3J0IG1vbGVjdWxlc0FuZExpZ2h0IGZyb20gJy4uLy4uL21vbGVjdWxlc0FuZExpZ2h0LmpzJztcclxuXHJcbi8qKlxyXG4gKiBAcHVibGljXHJcbiAqL1xyXG5jbGFzcyBNb2xlY3VsZXNBbmRMaWdodE1vZGVsIGV4dGVuZHMgUGhvdG9uQWJzb3JwdGlvbk1vZGVsIHtcclxuICBjb25zdHJ1Y3RvciggdGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IGluaXRpYWxUYXJnZXQgPSBHcmVlbmhvdXNlRWZmZWN0UXVlcnlQYXJhbWV0ZXJzLm9wZW5TY2lFZCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgUGhvdG9uVGFyZ2V0LlNJTkdMRV9OMl9NT0xFQ1VMRSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgUGhvdG9uVGFyZ2V0LlNJTkdMRV9DT19NT0xFQ1VMRTtcclxuICAgIHN1cGVyKCBpbml0aWFsVGFyZ2V0LCB0YW5kZW0gKTtcclxuICB9XHJcbn1cclxuXHJcbm1vbGVjdWxlc0FuZExpZ2h0LnJlZ2lzdGVyKCAnTW9sZWN1bGVzQW5kTGlnaHRNb2RlbCcsIE1vbGVjdWxlc0FuZExpZ2h0TW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgTW9sZWN1bGVzQW5kTGlnaHRNb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsK0JBQStCLE1BQU0sNEVBQTRFO0FBQ3hILE9BQU9DLHFCQUFxQixNQUFNLHVFQUF1RTtBQUN6RyxPQUFPQyxZQUFZLE1BQU0sOERBQThEO0FBQ3ZGLE9BQU9DLGlCQUFpQixNQUFNLDRCQUE0Qjs7QUFFMUQ7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsc0JBQXNCLFNBQVNILHFCQUFxQixDQUFDO0VBQ3pESSxXQUFXQSxDQUFFQyxNQUFNLEVBQUc7SUFFcEIsTUFBTUMsYUFBYSxHQUFHUCwrQkFBK0IsQ0FBQ1EsU0FBUyxHQUN6Q04sWUFBWSxDQUFDTyxrQkFBa0IsR0FDL0JQLFlBQVksQ0FBQ1Esa0JBQWtCO0lBQ3JELEtBQUssQ0FBRUgsYUFBYSxFQUFFRCxNQUFPLENBQUM7RUFDaEM7QUFDRjtBQUVBSCxpQkFBaUIsQ0FBQ1EsUUFBUSxDQUFFLHdCQUF3QixFQUFFUCxzQkFBdUIsQ0FBQztBQUM5RSxlQUFlQSxzQkFBc0IifQ==