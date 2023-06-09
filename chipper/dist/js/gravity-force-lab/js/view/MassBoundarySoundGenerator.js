// Copyright 2019-2022, University of Colorado Boulder

/**
 * MassBoundarySoundGenerator generates the sounds that indicate when the masses have reached their inner and outer motion
 * limits.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../tambo/js/sound-generators/SoundGenerator.js';
import boundaryReached_mp3 from '../../../tambo/sounds/boundaryReached_mp3.js';
import scrunchedMassCollisionSonicWomp_mp3 from '../../sounds/scrunchedMassCollisionSonicWomp_mp3.js';
import gravityForceLab from '../gravityForceLab.js';
class MassBoundarySoundGenerator extends SoundGenerator {
  /**
   * @param {ISLCObject} movableObject
   * @param {ISLCModel} model
   * @param {string} massSidePosition - 'left' or 'right' depending on the side of the sim where this mass appears
   * @param {Object} [options]
   */
  constructor(movableObject, model, massSidePosition, options) {
    super(options);

    // parameter checking
    assert && assert(massSidePosition === 'left' || massSidePosition === 'right');
    const innerBoundarySoundClip = new SoundClip(scrunchedMassCollisionSonicWomp_mp3);
    innerBoundarySoundClip.connect(this.soundSourceDestination);
    const outerBoundarySoundClip = new SoundClip(boundaryReached_mp3);
    outerBoundarySoundClip.connect(this.soundSourceDestination);

    // function for playing the appropriate boundary sound
    const positionListener = position => {
      if (!model.massWasPushed()) {
        if (position === model.getObjectMinPosition(movableObject)) {
          massSidePosition === 'left' ? outerBoundarySoundClip.play() : innerBoundarySoundClip.play();
        } else if (position === model.getObjectMaxPosition(movableObject)) {
          massSidePosition === 'left' ? innerBoundarySoundClip.play() : outerBoundarySoundClip.play();
        }
      }
    };
    movableObject.positionProperty.link(positionListener);

    // @private {function}
    this.disposeBoundarySoundGenerator = () => {
      movableObject.positionProperty.unlink(positionListener);
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeBoundarySoundGenerator();
    super.dispose();
  }
}
gravityForceLab.register('MassBoundarySoundGenerator', MassBoundarySoundGenerator);
export default MassBoundarySoundGenerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTb3VuZENsaXAiLCJTb3VuZEdlbmVyYXRvciIsImJvdW5kYXJ5UmVhY2hlZF9tcDMiLCJzY3J1bmNoZWRNYXNzQ29sbGlzaW9uU29uaWNXb21wX21wMyIsImdyYXZpdHlGb3JjZUxhYiIsIk1hc3NCb3VuZGFyeVNvdW5kR2VuZXJhdG9yIiwiY29uc3RydWN0b3IiLCJtb3ZhYmxlT2JqZWN0IiwibW9kZWwiLCJtYXNzU2lkZVBvc2l0aW9uIiwib3B0aW9ucyIsImFzc2VydCIsImlubmVyQm91bmRhcnlTb3VuZENsaXAiLCJjb25uZWN0Iiwic291bmRTb3VyY2VEZXN0aW5hdGlvbiIsIm91dGVyQm91bmRhcnlTb3VuZENsaXAiLCJwb3NpdGlvbkxpc3RlbmVyIiwicG9zaXRpb24iLCJtYXNzV2FzUHVzaGVkIiwiZ2V0T2JqZWN0TWluUG9zaXRpb24iLCJwbGF5IiwiZ2V0T2JqZWN0TWF4UG9zaXRpb24iLCJwb3NpdGlvblByb3BlcnR5IiwibGluayIsImRpc3Bvc2VCb3VuZGFyeVNvdW5kR2VuZXJhdG9yIiwidW5saW5rIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTWFzc0JvdW5kYXJ5U291bmRHZW5lcmF0b3IuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFzc0JvdW5kYXJ5U291bmRHZW5lcmF0b3IgZ2VuZXJhdGVzIHRoZSBzb3VuZHMgdGhhdCBpbmRpY2F0ZSB3aGVuIHRoZSBtYXNzZXMgaGF2ZSByZWFjaGVkIHRoZWlyIGlubmVyIGFuZCBvdXRlciBtb3Rpb25cclxuICogbGltaXRzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTb3VuZENsaXAgZnJvbSAnLi4vLi4vLi4vdGFtYm8vanMvc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXAuanMnO1xyXG5pbXBvcnQgU291bmRHZW5lcmF0b3IgZnJvbSAnLi4vLi4vLi4vdGFtYm8vanMvc291bmQtZ2VuZXJhdG9ycy9Tb3VuZEdlbmVyYXRvci5qcyc7XHJcbmltcG9ydCBib3VuZGFyeVJlYWNoZWRfbXAzIGZyb20gJy4uLy4uLy4uL3RhbWJvL3NvdW5kcy9ib3VuZGFyeVJlYWNoZWRfbXAzLmpzJztcclxuaW1wb3J0IHNjcnVuY2hlZE1hc3NDb2xsaXNpb25Tb25pY1dvbXBfbXAzIGZyb20gJy4uLy4uL3NvdW5kcy9zY3J1bmNoZWRNYXNzQ29sbGlzaW9uU29uaWNXb21wX21wMy5qcyc7XHJcbmltcG9ydCBncmF2aXR5Rm9yY2VMYWIgZnJvbSAnLi4vZ3Jhdml0eUZvcmNlTGFiLmpzJztcclxuXHJcbmNsYXNzIE1hc3NCb3VuZGFyeVNvdW5kR2VuZXJhdG9yIGV4dGVuZHMgU291bmRHZW5lcmF0b3Ige1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0lTTENPYmplY3R9IG1vdmFibGVPYmplY3RcclxuICAgKiBAcGFyYW0ge0lTTENNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWFzc1NpZGVQb3NpdGlvbiAtICdsZWZ0JyBvciAncmlnaHQnIGRlcGVuZGluZyBvbiB0aGUgc2lkZSBvZiB0aGUgc2ltIHdoZXJlIHRoaXMgbWFzcyBhcHBlYXJzXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb3ZhYmxlT2JqZWN0LCBtb2RlbCwgbWFzc1NpZGVQb3NpdGlvbiwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHBhcmFtZXRlciBjaGVja2luZ1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWFzc1NpZGVQb3NpdGlvbiA9PT0gJ2xlZnQnIHx8IG1hc3NTaWRlUG9zaXRpb24gPT09ICdyaWdodCcgKTtcclxuXHJcbiAgICBjb25zdCBpbm5lckJvdW5kYXJ5U291bmRDbGlwID0gbmV3IFNvdW5kQ2xpcCggc2NydW5jaGVkTWFzc0NvbGxpc2lvblNvbmljV29tcF9tcDMgKTtcclxuICAgIGlubmVyQm91bmRhcnlTb3VuZENsaXAuY29ubmVjdCggdGhpcy5zb3VuZFNvdXJjZURlc3RpbmF0aW9uICk7XHJcbiAgICBjb25zdCBvdXRlckJvdW5kYXJ5U291bmRDbGlwID0gbmV3IFNvdW5kQ2xpcCggYm91bmRhcnlSZWFjaGVkX21wMyApO1xyXG4gICAgb3V0ZXJCb3VuZGFyeVNvdW5kQ2xpcC5jb25uZWN0KCB0aGlzLnNvdW5kU291cmNlRGVzdGluYXRpb24gKTtcclxuXHJcbiAgICAvLyBmdW5jdGlvbiBmb3IgcGxheWluZyB0aGUgYXBwcm9wcmlhdGUgYm91bmRhcnkgc291bmRcclxuICAgIGNvbnN0IHBvc2l0aW9uTGlzdGVuZXIgPSBwb3NpdGlvbiA9PiB7XHJcbiAgICAgIGlmICggIW1vZGVsLm1hc3NXYXNQdXNoZWQoKSApIHtcclxuICAgICAgICBpZiAoIHBvc2l0aW9uID09PSBtb2RlbC5nZXRPYmplY3RNaW5Qb3NpdGlvbiggbW92YWJsZU9iamVjdCApICkge1xyXG4gICAgICAgICAgbWFzc1NpZGVQb3NpdGlvbiA9PT0gJ2xlZnQnID8gb3V0ZXJCb3VuZGFyeVNvdW5kQ2xpcC5wbGF5KCkgOiBpbm5lckJvdW5kYXJ5U291bmRDbGlwLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIHBvc2l0aW9uID09PSBtb2RlbC5nZXRPYmplY3RNYXhQb3NpdGlvbiggbW92YWJsZU9iamVjdCApICkge1xyXG4gICAgICAgICAgbWFzc1NpZGVQb3NpdGlvbiA9PT0gJ2xlZnQnID8gaW5uZXJCb3VuZGFyeVNvdW5kQ2xpcC5wbGF5KCkgOiBvdXRlckJvdW5kYXJ5U291bmRDbGlwLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBtb3ZhYmxlT2JqZWN0LnBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb25MaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cclxuICAgIHRoaXMuZGlzcG9zZUJvdW5kYXJ5U291bmRHZW5lcmF0b3IgPSAoKSA9PiB7IG1vdmFibGVPYmplY3QucG9zaXRpb25Qcm9wZXJ0eS51bmxpbmsoIHBvc2l0aW9uTGlzdGVuZXIgKTsgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5kaXNwb3NlQm91bmRhcnlTb3VuZEdlbmVyYXRvcigpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuZ3Jhdml0eUZvcmNlTGFiLnJlZ2lzdGVyKCAnTWFzc0JvdW5kYXJ5U291bmRHZW5lcmF0b3InLCBNYXNzQm91bmRhcnlTb3VuZEdlbmVyYXRvciApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTWFzc0JvdW5kYXJ5U291bmRHZW5lcmF0b3I7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGlEQUFpRDtBQUN2RSxPQUFPQyxjQUFjLE1BQU0sc0RBQXNEO0FBQ2pGLE9BQU9DLG1CQUFtQixNQUFNLDhDQUE4QztBQUM5RSxPQUFPQyxtQ0FBbUMsTUFBTSxxREFBcUQ7QUFDckcsT0FBT0MsZUFBZSxNQUFNLHVCQUF1QjtBQUVuRCxNQUFNQywwQkFBMEIsU0FBU0osY0FBYyxDQUFDO0VBRXREO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSyxXQUFXQSxDQUFFQyxhQUFhLEVBQUVDLEtBQUssRUFBRUMsZ0JBQWdCLEVBQUVDLE9BQU8sRUFBRztJQUU3RCxLQUFLLENBQUVBLE9BQVEsQ0FBQzs7SUFFaEI7SUFDQUMsTUFBTSxJQUFJQSxNQUFNLENBQUVGLGdCQUFnQixLQUFLLE1BQU0sSUFBSUEsZ0JBQWdCLEtBQUssT0FBUSxDQUFDO0lBRS9FLE1BQU1HLHNCQUFzQixHQUFHLElBQUlaLFNBQVMsQ0FBRUcsbUNBQW9DLENBQUM7SUFDbkZTLHNCQUFzQixDQUFDQyxPQUFPLENBQUUsSUFBSSxDQUFDQyxzQkFBdUIsQ0FBQztJQUM3RCxNQUFNQyxzQkFBc0IsR0FBRyxJQUFJZixTQUFTLENBQUVFLG1CQUFvQixDQUFDO0lBQ25FYSxzQkFBc0IsQ0FBQ0YsT0FBTyxDQUFFLElBQUksQ0FBQ0Msc0JBQXVCLENBQUM7O0lBRTdEO0lBQ0EsTUFBTUUsZ0JBQWdCLEdBQUdDLFFBQVEsSUFBSTtNQUNuQyxJQUFLLENBQUNULEtBQUssQ0FBQ1UsYUFBYSxDQUFDLENBQUMsRUFBRztRQUM1QixJQUFLRCxRQUFRLEtBQUtULEtBQUssQ0FBQ1csb0JBQW9CLENBQUVaLGFBQWMsQ0FBQyxFQUFHO1VBQzlERSxnQkFBZ0IsS0FBSyxNQUFNLEdBQUdNLHNCQUFzQixDQUFDSyxJQUFJLENBQUMsQ0FBQyxHQUFHUixzQkFBc0IsQ0FBQ1EsSUFBSSxDQUFDLENBQUM7UUFDN0YsQ0FBQyxNQUNJLElBQUtILFFBQVEsS0FBS1QsS0FBSyxDQUFDYSxvQkFBb0IsQ0FBRWQsYUFBYyxDQUFDLEVBQUc7VUFDbkVFLGdCQUFnQixLQUFLLE1BQU0sR0FBR0csc0JBQXNCLENBQUNRLElBQUksQ0FBQyxDQUFDLEdBQUdMLHNCQUFzQixDQUFDSyxJQUFJLENBQUMsQ0FBQztRQUM3RjtNQUNGO0lBQ0YsQ0FBQztJQUNEYixhQUFhLENBQUNlLGdCQUFnQixDQUFDQyxJQUFJLENBQUVQLGdCQUFpQixDQUFDOztJQUV2RDtJQUNBLElBQUksQ0FBQ1EsNkJBQTZCLEdBQUcsTUFBTTtNQUFFakIsYUFBYSxDQUFDZSxnQkFBZ0IsQ0FBQ0csTUFBTSxDQUFFVCxnQkFBaUIsQ0FBQztJQUFFLENBQUM7RUFDM0c7O0VBRUE7QUFDRjtBQUNBO0VBQ0VVLE9BQU9BLENBQUEsRUFBRztJQUNSLElBQUksQ0FBQ0YsNkJBQTZCLENBQUMsQ0FBQztJQUNwQyxLQUFLLENBQUNFLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQXRCLGVBQWUsQ0FBQ3VCLFFBQVEsQ0FBRSw0QkFBNEIsRUFBRXRCLDBCQUEyQixDQUFDO0FBRXBGLGVBQWVBLDBCQUEwQiJ9