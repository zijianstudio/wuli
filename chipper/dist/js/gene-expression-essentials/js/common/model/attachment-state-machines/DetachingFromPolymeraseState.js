// Copyright 2015-2020, University of Colorado Boulder

/**
 * One of the states for MessengerRnaAttachmentStateMachine. mRna enters this state when it is detaching from the
 * polymerase. During this time, it moves generally upwards until either the timer runs out or it is attached to by some
 * biomolecule.
 *
 * @author John Blanco
 * @author Mohamed Safi
 * @author Aadish Gupta
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import geneExpressionEssentials from '../../../geneExpressionEssentials.js';
import WanderInGeneralDirectionMotionStrategy from '../motion-strategies/WanderInGeneralDirectionMotionStrategy.js';
import AttachmentState from './AttachmentState.js';
import WanderingAroundCytoplasmState from './WanderingAroundCytoplasmState.js';

// constants
const DETACHING_TIME = 3;
class DetachingFromPolymeraseState extends AttachmentState {
  constructor(msgRnaAttachmentStateMachine) {
    super();

    // @public (read-ony) {RnaPolymeraseAttachmentStateMachine}
    this.msgRnaAttachmentStateMachine = msgRnaAttachmentStateMachine;

    // @private
    this.detachingCountdownTimer = DETACHING_TIME;
  }

  /**
   * @override
   * @param {AttachmentStateMachine} enclosingStateMachine
   * @param {number} dt
   * @public
   */
  step(enclosingStateMachine, dt) {
    this.detachingCountdownTimer -= dt;
    if (this.detachingCountdownTimer <= 0) {
      // Done detaching, start wandering.
      this.msgRnaAttachmentStateMachine.setState(new WanderingAroundCytoplasmState());
    }
  }

  /**
   * @override
   * @param  {AttachmentStateMachine} enclosingStateMachine
   * @public
   */
  entered(enclosingStateMachine) {
    // Move upwards, away from the DNA and polymerase.
    enclosingStateMachine.biomolecule.setMotionStrategy(new WanderInGeneralDirectionMotionStrategy(new Vector2(-0.5, 1), enclosingStateMachine.biomolecule.motionBoundsProperty));

    // Update externally visible state.
    this.msgRnaAttachmentStateMachine.messengerRna.beingSynthesizedProperty.set(false);
  }
}
geneExpressionEssentials.register('DetachingFromPolymeraseState', DetachingFromPolymeraseState);
export default DetachingFromPolymeraseState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIiwiV2FuZGVySW5HZW5lcmFsRGlyZWN0aW9uTW90aW9uU3RyYXRlZ3kiLCJBdHRhY2htZW50U3RhdGUiLCJXYW5kZXJpbmdBcm91bmRDeXRvcGxhc21TdGF0ZSIsIkRFVEFDSElOR19USU1FIiwiRGV0YWNoaW5nRnJvbVBvbHltZXJhc2VTdGF0ZSIsImNvbnN0cnVjdG9yIiwibXNnUm5hQXR0YWNobWVudFN0YXRlTWFjaGluZSIsImRldGFjaGluZ0NvdW50ZG93blRpbWVyIiwic3RlcCIsImVuY2xvc2luZ1N0YXRlTWFjaGluZSIsImR0Iiwic2V0U3RhdGUiLCJlbnRlcmVkIiwiYmlvbW9sZWN1bGUiLCJzZXRNb3Rpb25TdHJhdGVneSIsIm1vdGlvbkJvdW5kc1Byb3BlcnR5IiwibWVzc2VuZ2VyUm5hIiwiYmVpbmdTeW50aGVzaXplZFByb3BlcnR5Iiwic2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEZXRhY2hpbmdGcm9tUG9seW1lcmFzZVN0YXRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE9uZSBvZiB0aGUgc3RhdGVzIGZvciBNZXNzZW5nZXJSbmFBdHRhY2htZW50U3RhdGVNYWNoaW5lLiBtUm5hIGVudGVycyB0aGlzIHN0YXRlIHdoZW4gaXQgaXMgZGV0YWNoaW5nIGZyb20gdGhlXHJcbiAqIHBvbHltZXJhc2UuIER1cmluZyB0aGlzIHRpbWUsIGl0IG1vdmVzIGdlbmVyYWxseSB1cHdhcmRzIHVudGlsIGVpdGhlciB0aGUgdGltZXIgcnVucyBvdXQgb3IgaXQgaXMgYXR0YWNoZWQgdG8gYnkgc29tZVxyXG4gKiBiaW9tb2xlY3VsZS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIE1vaGFtZWQgU2FmaVxyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IGdlbmVFeHByZXNzaW9uRXNzZW50aWFscyBmcm9tICcuLi8uLi8uLi9nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMuanMnO1xyXG5pbXBvcnQgV2FuZGVySW5HZW5lcmFsRGlyZWN0aW9uTW90aW9uU3RyYXRlZ3kgZnJvbSAnLi4vbW90aW9uLXN0cmF0ZWdpZXMvV2FuZGVySW5HZW5lcmFsRGlyZWN0aW9uTW90aW9uU3RyYXRlZ3kuanMnO1xyXG5pbXBvcnQgQXR0YWNobWVudFN0YXRlIGZyb20gJy4vQXR0YWNobWVudFN0YXRlLmpzJztcclxuaW1wb3J0IFdhbmRlcmluZ0Fyb3VuZEN5dG9wbGFzbVN0YXRlIGZyb20gJy4vV2FuZGVyaW5nQXJvdW5kQ3l0b3BsYXNtU3RhdGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IERFVEFDSElOR19USU1FID0gMztcclxuXHJcbmNsYXNzIERldGFjaGluZ0Zyb21Qb2x5bWVyYXNlU3RhdGUgZXh0ZW5kcyBBdHRhY2htZW50U3RhdGUge1xyXG5cclxuICBjb25zdHJ1Y3RvciggbXNnUm5hQXR0YWNobWVudFN0YXRlTWFjaGluZSApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbnkpIHtSbmFQb2x5bWVyYXNlQXR0YWNobWVudFN0YXRlTWFjaGluZX1cclxuICAgIHRoaXMubXNnUm5hQXR0YWNobWVudFN0YXRlTWFjaGluZSA9IG1zZ1JuYUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmU7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZGV0YWNoaW5nQ291bnRkb3duVGltZXIgPSBERVRBQ0hJTkdfVElNRTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwYXJhbSB7QXR0YWNobWVudFN0YXRlTWFjaGluZX0gZW5jbG9zaW5nU3RhdGVNYWNoaW5lXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGVuY2xvc2luZ1N0YXRlTWFjaGluZSwgZHQgKSB7XHJcbiAgICB0aGlzLmRldGFjaGluZ0NvdW50ZG93blRpbWVyIC09IGR0O1xyXG4gICAgaWYgKCB0aGlzLmRldGFjaGluZ0NvdW50ZG93blRpbWVyIDw9IDAgKSB7XHJcblxyXG4gICAgICAvLyBEb25lIGRldGFjaGluZywgc3RhcnQgd2FuZGVyaW5nLlxyXG4gICAgICB0aGlzLm1zZ1JuYUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUuc2V0U3RhdGUoIG5ldyBXYW5kZXJpbmdBcm91bmRDeXRvcGxhc21TdGF0ZSgpICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcGFyYW0gIHtBdHRhY2htZW50U3RhdGVNYWNoaW5lfSBlbmNsb3NpbmdTdGF0ZU1hY2hpbmVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZW50ZXJlZCggZW5jbG9zaW5nU3RhdGVNYWNoaW5lICkge1xyXG4gICAgLy8gTW92ZSB1cHdhcmRzLCBhd2F5IGZyb20gdGhlIEROQSBhbmQgcG9seW1lcmFzZS5cclxuICAgIGVuY2xvc2luZ1N0YXRlTWFjaGluZS5iaW9tb2xlY3VsZS5zZXRNb3Rpb25TdHJhdGVneSggbmV3IFdhbmRlckluR2VuZXJhbERpcmVjdGlvbk1vdGlvblN0cmF0ZWd5KFxyXG4gICAgICBuZXcgVmVjdG9yMiggLTAuNSwgMSApLCBlbmNsb3NpbmdTdGF0ZU1hY2hpbmUuYmlvbW9sZWN1bGUubW90aW9uQm91bmRzUHJvcGVydHkgKSApO1xyXG5cclxuICAgIC8vIFVwZGF0ZSBleHRlcm5hbGx5IHZpc2libGUgc3RhdGUuXHJcbiAgICB0aGlzLm1zZ1JuYUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUubWVzc2VuZ2VyUm5hLmJlaW5nU3ludGhlc2l6ZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgfVxyXG59XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdEZXRhY2hpbmdGcm9tUG9seW1lcmFzZVN0YXRlJywgRGV0YWNoaW5nRnJvbVBvbHltZXJhc2VTdGF0ZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRGV0YWNoaW5nRnJvbVBvbHltZXJhc2VTdGF0ZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELE9BQU9DLHdCQUF3QixNQUFNLHNDQUFzQztBQUMzRSxPQUFPQyxzQ0FBc0MsTUFBTSxnRUFBZ0U7QUFDbkgsT0FBT0MsZUFBZSxNQUFNLHNCQUFzQjtBQUNsRCxPQUFPQyw2QkFBNkIsTUFBTSxvQ0FBb0M7O0FBRTlFO0FBQ0EsTUFBTUMsY0FBYyxHQUFHLENBQUM7QUFFeEIsTUFBTUMsNEJBQTRCLFNBQVNILGVBQWUsQ0FBQztFQUV6REksV0FBV0EsQ0FBRUMsNEJBQTRCLEVBQUc7SUFDMUMsS0FBSyxDQUFDLENBQUM7O0lBRVA7SUFDQSxJQUFJLENBQUNBLDRCQUE0QixHQUFHQSw0QkFBNEI7O0lBRWhFO0lBQ0EsSUFBSSxDQUFDQyx1QkFBdUIsR0FBR0osY0FBYztFQUMvQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUssSUFBSUEsQ0FBRUMscUJBQXFCLEVBQUVDLEVBQUUsRUFBRztJQUNoQyxJQUFJLENBQUNILHVCQUF1QixJQUFJRyxFQUFFO0lBQ2xDLElBQUssSUFBSSxDQUFDSCx1QkFBdUIsSUFBSSxDQUFDLEVBQUc7TUFFdkM7TUFDQSxJQUFJLENBQUNELDRCQUE0QixDQUFDSyxRQUFRLENBQUUsSUFBSVQsNkJBQTZCLENBQUMsQ0FBRSxDQUFDO0lBQ25GO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFVSxPQUFPQSxDQUFFSCxxQkFBcUIsRUFBRztJQUMvQjtJQUNBQSxxQkFBcUIsQ0FBQ0ksV0FBVyxDQUFDQyxpQkFBaUIsQ0FBRSxJQUFJZCxzQ0FBc0MsQ0FDN0YsSUFBSUYsT0FBTyxDQUFFLENBQUMsR0FBRyxFQUFFLENBQUUsQ0FBQyxFQUFFVyxxQkFBcUIsQ0FBQ0ksV0FBVyxDQUFDRSxvQkFBcUIsQ0FBRSxDQUFDOztJQUVwRjtJQUNBLElBQUksQ0FBQ1QsNEJBQTRCLENBQUNVLFlBQVksQ0FBQ0Msd0JBQXdCLENBQUNDLEdBQUcsQ0FBRSxLQUFNLENBQUM7RUFDdEY7QUFDRjtBQUVBbkIsd0JBQXdCLENBQUNvQixRQUFRLENBQUUsOEJBQThCLEVBQUVmLDRCQUE2QixDQUFDO0FBRWpHLGVBQWVBLDRCQUE0QiJ9