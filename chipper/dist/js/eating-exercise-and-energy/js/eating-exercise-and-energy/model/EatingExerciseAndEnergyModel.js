// Copyright 2020-2021, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import eatingExerciseAndEnergy from '../../eatingExerciseAndEnergy.js';
class EatingExerciseAndEnergyModel {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    assert && assert(tandem instanceof Tandem, 'invalid tandem');
    //TODO
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {
    //TODO
  }

  /**
   * Steps the model.
   * @param {number} dt - time step, in seconds
   * @public
   */
  step(dt) {
    //TODO
  }
}
eatingExerciseAndEnergy.register('EatingExerciseAndEnergyModel', EatingExerciseAndEnergyModel);
export default EatingExerciseAndEnergyModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYW5kZW0iLCJlYXRpbmdFeGVyY2lzZUFuZEVuZXJneSIsIkVhdGluZ0V4ZXJjaXNlQW5kRW5lcmd5TW9kZWwiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsImFzc2VydCIsInJlc2V0Iiwic3RlcCIsImR0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFYXRpbmdFeGVyY2lzZUFuZEVuZXJneU1vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGVhdGluZ0V4ZXJjaXNlQW5kRW5lcmd5IGZyb20gJy4uLy4uL2VhdGluZ0V4ZXJjaXNlQW5kRW5lcmd5LmpzJztcclxuXHJcbmNsYXNzIEVhdGluZ0V4ZXJjaXNlQW5kRW5lcmd5TW9kZWwge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRhbmRlbSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRhbmRlbSBpbnN0YW5jZW9mIFRhbmRlbSwgJ2ludmFsaWQgdGFuZGVtJyApO1xyXG4gICAgLy9UT0RPXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIG1vZGVsLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIC8vVE9ET1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcHMgdGhlIG1vZGVsLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIC8vVE9ET1xyXG4gIH1cclxufVxyXG5cclxuZWF0aW5nRXhlcmNpc2VBbmRFbmVyZ3kucmVnaXN0ZXIoICdFYXRpbmdFeGVyY2lzZUFuZEVuZXJneU1vZGVsJywgRWF0aW5nRXhlcmNpc2VBbmRFbmVyZ3lNb2RlbCApO1xyXG5leHBvcnQgZGVmYXVsdCBFYXRpbmdFeGVyY2lzZUFuZEVuZXJneU1vZGVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsdUJBQXVCLE1BQU0sa0NBQWtDO0FBRXRFLE1BQU1DLDRCQUE0QixDQUFDO0VBRWpDO0FBQ0Y7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxNQUFNLEVBQUc7SUFDcEJDLE1BQU0sSUFBSUEsTUFBTSxDQUFFRCxNQUFNLFlBQVlKLE1BQU0sRUFBRSxnQkFBaUIsQ0FBQztJQUM5RDtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VNLEtBQUtBLENBQUEsRUFBRztJQUNOO0VBQUE7O0VBR0Y7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxJQUFJQSxDQUFFQyxFQUFFLEVBQUc7SUFDVDtFQUFBO0FBRUo7QUFFQVAsdUJBQXVCLENBQUNRLFFBQVEsQ0FBRSw4QkFBOEIsRUFBRVAsNEJBQTZCLENBQUM7QUFDaEcsZUFBZUEsNEJBQTRCIn0=