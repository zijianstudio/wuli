// Copyright 2015-2020, University of Colorado Boulder

/**
 * Attachment state machine for messenger RNA fragments. These fragments start their life as being attached to an mRNA
 * destroyer, and and then released into the cytoplasm to wander and fade.
 *
 * @author John Blanco
 * @author Mohamed Safi
 * @author Aadish Gupta
 */

import geneExpressionEssentials from '../../../geneExpressionEssentials.js';
import RandomWalkMotionStrategy from '../motion-strategies/RandomWalkMotionStrategy.js';
import StillnessMotionStrategy from '../motion-strategies/StillnessMotionStrategy.js';
import AttachmentState from './AttachmentState.js';
import AttachmentStateMachine from './AttachmentStateMachine.js';

// constants
const FADE_OUT_TIME = 3; // In seconds.

//------------------------------------------
// States for this attachment state machine
//------------------------------------------
class AttachedToDestroyerState extends AttachmentState {
  constructor(messengerRnaFragmentAttachmentStateMachine) {
    super();
    this.messengerRnaFragmentAttachmentStateMachine = messengerRnaFragmentAttachmentStateMachine;
  }

  /**
   * @override
   * @param {AttachmentStateMachine} asm
   * @public
   */
  entered(asm) {
    const biomolecule = this.messengerRnaFragmentAttachmentStateMachine.biomolecule;
    biomolecule.setMotionStrategy(new StillnessMotionStrategy());
  }
}
class UnattachedAndFadingState extends AttachmentState {
  constructor(messengerRnaFragmentAttachmentStateMachine) {
    super();
    this.messengerRnaFragmentAttachmentStateMachine = messengerRnaFragmentAttachmentStateMachine;
  }

  /**
   * @override
   * @param {AttachmentStateMachine} asm
   * @public
   */
  entered(asm) {
    const biomolecule = this.messengerRnaFragmentAttachmentStateMachine.biomolecule;
    assert && assert(biomolecule.existenceStrengthProperty.get() === 1);
    biomolecule.setMotionStrategy(new RandomWalkMotionStrategy(biomolecule.motionBoundsProperty));
  }

  /**
   * @override
   * @param {AttachmentStateMachine} asm
   * @param {number} dt
   * @public
   */
  step(asm, dt) {
    const biomolecule = this.messengerRnaFragmentAttachmentStateMachine.biomolecule;
    biomolecule.existenceStrengthProperty.set(Math.max(biomolecule.existenceStrengthProperty.get() - dt / FADE_OUT_TIME, 0));
  }
}
class MessengerRnaFragmentAttachmentStateMachine extends AttachmentStateMachine {
  /**
   * @param {MobileBiomolecule} biomolecule
   */
  constructor(biomolecule) {
    super(biomolecule);
    this.setState(new AttachedToDestroyerState(this));
  }

  /**
   * @override
   * @public
   */
  detach() {
    this.setState(new UnattachedAndFadingState(this));
  }
}
geneExpressionEssentials.register('MessengerRnaFragmentAttachmentStateMachine', MessengerRnaFragmentAttachmentStateMachine);
export default MessengerRnaFragmentAttachmentStateMachine;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMiLCJSYW5kb21XYWxrTW90aW9uU3RyYXRlZ3kiLCJTdGlsbG5lc3NNb3Rpb25TdHJhdGVneSIsIkF0dGFjaG1lbnRTdGF0ZSIsIkF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUiLCJGQURFX09VVF9USU1FIiwiQXR0YWNoZWRUb0Rlc3Ryb3llclN0YXRlIiwiY29uc3RydWN0b3IiLCJtZXNzZW5nZXJSbmFGcmFnbWVudEF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUiLCJlbnRlcmVkIiwiYXNtIiwiYmlvbW9sZWN1bGUiLCJzZXRNb3Rpb25TdHJhdGVneSIsIlVuYXR0YWNoZWRBbmRGYWRpbmdTdGF0ZSIsImFzc2VydCIsImV4aXN0ZW5jZVN0cmVuZ3RoUHJvcGVydHkiLCJnZXQiLCJtb3Rpb25Cb3VuZHNQcm9wZXJ0eSIsInN0ZXAiLCJkdCIsInNldCIsIk1hdGgiLCJtYXgiLCJNZXNzZW5nZXJSbmFGcmFnbWVudEF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUiLCJzZXRTdGF0ZSIsImRldGFjaCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTWVzc2VuZ2VyUm5hRnJhZ21lbnRBdHRhY2htZW50U3RhdGVNYWNoaW5lLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEF0dGFjaG1lbnQgc3RhdGUgbWFjaGluZSBmb3IgbWVzc2VuZ2VyIFJOQSBmcmFnbWVudHMuIFRoZXNlIGZyYWdtZW50cyBzdGFydCB0aGVpciBsaWZlIGFzIGJlaW5nIGF0dGFjaGVkIHRvIGFuIG1STkFcclxuICogZGVzdHJveWVyLCBhbmQgYW5kIHRoZW4gcmVsZWFzZWQgaW50byB0aGUgY3l0b3BsYXNtIHRvIHdhbmRlciBhbmQgZmFkZS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIE1vaGFtZWQgU2FmaVxyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxyXG4gKi9cclxuXHJcbmltcG9ydCBnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMgZnJvbSAnLi4vLi4vLi4vZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLmpzJztcclxuaW1wb3J0IFJhbmRvbVdhbGtNb3Rpb25TdHJhdGVneSBmcm9tICcuLi9tb3Rpb24tc3RyYXRlZ2llcy9SYW5kb21XYWxrTW90aW9uU3RyYXRlZ3kuanMnO1xyXG5pbXBvcnQgU3RpbGxuZXNzTW90aW9uU3RyYXRlZ3kgZnJvbSAnLi4vbW90aW9uLXN0cmF0ZWdpZXMvU3RpbGxuZXNzTW90aW9uU3RyYXRlZ3kuanMnO1xyXG5pbXBvcnQgQXR0YWNobWVudFN0YXRlIGZyb20gJy4vQXR0YWNobWVudFN0YXRlLmpzJztcclxuaW1wb3J0IEF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUgZnJvbSAnLi9BdHRhY2htZW50U3RhdGVNYWNoaW5lLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBGQURFX09VVF9USU1FID0gMzsgLy8gSW4gc2Vjb25kcy5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIFN0YXRlcyBmb3IgdGhpcyBhdHRhY2htZW50IHN0YXRlIG1hY2hpbmVcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuY2xhc3MgQXR0YWNoZWRUb0Rlc3Ryb3llclN0YXRlIGV4dGVuZHMgQXR0YWNobWVudFN0YXRlIHtcclxuXHJcbiAgY29uc3RydWN0b3IoIG1lc3NlbmdlclJuYUZyYWdtZW50QXR0YWNobWVudFN0YXRlTWFjaGluZSApIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLm1lc3NlbmdlclJuYUZyYWdtZW50QXR0YWNobWVudFN0YXRlTWFjaGluZSA9IG1lc3NlbmdlclJuYUZyYWdtZW50QXR0YWNobWVudFN0YXRlTWFjaGluZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwYXJhbSB7QXR0YWNobWVudFN0YXRlTWFjaGluZX0gYXNtXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGVudGVyZWQoIGFzbSApIHtcclxuICAgIGNvbnN0IGJpb21vbGVjdWxlID0gdGhpcy5tZXNzZW5nZXJSbmFGcmFnbWVudEF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUuYmlvbW9sZWN1bGU7XHJcbiAgICBiaW9tb2xlY3VsZS5zZXRNb3Rpb25TdHJhdGVneSggbmV3IFN0aWxsbmVzc01vdGlvblN0cmF0ZWd5KCkgKTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFVuYXR0YWNoZWRBbmRGYWRpbmdTdGF0ZSBleHRlbmRzIEF0dGFjaG1lbnRTdGF0ZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCBtZXNzZW5nZXJSbmFGcmFnbWVudEF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUgKSB7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgdGhpcy5tZXNzZW5nZXJSbmFGcmFnbWVudEF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUgPSBtZXNzZW5nZXJSbmFGcmFnbWVudEF0dGFjaG1lbnRTdGF0ZU1hY2hpbmU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcGFyYW0ge0F0dGFjaG1lbnRTdGF0ZU1hY2hpbmV9IGFzbVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBlbnRlcmVkKCBhc20gKSB7XHJcbiAgICBjb25zdCBiaW9tb2xlY3VsZSA9IHRoaXMubWVzc2VuZ2VyUm5hRnJhZ21lbnRBdHRhY2htZW50U3RhdGVNYWNoaW5lLmJpb21vbGVjdWxlO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmlvbW9sZWN1bGUuZXhpc3RlbmNlU3RyZW5ndGhQcm9wZXJ0eS5nZXQoKSA9PT0gMSApO1xyXG4gICAgYmlvbW9sZWN1bGUuc2V0TW90aW9uU3RyYXRlZ3koIG5ldyBSYW5kb21XYWxrTW90aW9uU3RyYXRlZ3koIGJpb21vbGVjdWxlLm1vdGlvbkJvdW5kc1Byb3BlcnR5ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwYXJhbSB7QXR0YWNobWVudFN0YXRlTWFjaGluZX0gYXNtXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGFzbSwgZHQgKSB7XHJcbiAgICBjb25zdCBiaW9tb2xlY3VsZSA9IHRoaXMubWVzc2VuZ2VyUm5hRnJhZ21lbnRBdHRhY2htZW50U3RhdGVNYWNoaW5lLmJpb21vbGVjdWxlO1xyXG4gICAgYmlvbW9sZWN1bGUuZXhpc3RlbmNlU3RyZW5ndGhQcm9wZXJ0eS5zZXQoIE1hdGgubWF4KCBiaW9tb2xlY3VsZS5leGlzdGVuY2VTdHJlbmd0aFByb3BlcnR5LmdldCgpIC0gZHQgLyBGQURFX09VVF9USU1FLCAwICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIE1lc3NlbmdlclJuYUZyYWdtZW50QXR0YWNobWVudFN0YXRlTWFjaGluZSBleHRlbmRzIEF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge01vYmlsZUJpb21vbGVjdWxlfSBiaW9tb2xlY3VsZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBiaW9tb2xlY3VsZSApIHtcclxuICAgIHN1cGVyKCBiaW9tb2xlY3VsZSApO1xyXG4gICAgdGhpcy5zZXRTdGF0ZSggbmV3IEF0dGFjaGVkVG9EZXN0cm95ZXJTdGF0ZSggdGhpcyApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGV0YWNoKCkge1xyXG4gICAgdGhpcy5zZXRTdGF0ZSggbmV3IFVuYXR0YWNoZWRBbmRGYWRpbmdTdGF0ZSggdGhpcyApICk7XHJcbiAgfVxyXG59XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdNZXNzZW5nZXJSbmFGcmFnbWVudEF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUnLCBNZXNzZW5nZXJSbmFGcmFnbWVudEF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1lc3NlbmdlclJuYUZyYWdtZW50QXR0YWNobWVudFN0YXRlTWFjaGluZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0Esd0JBQXdCLE1BQU0sc0NBQXNDO0FBQzNFLE9BQU9DLHdCQUF3QixNQUFNLGtEQUFrRDtBQUN2RixPQUFPQyx1QkFBdUIsTUFBTSxpREFBaUQ7QUFDckYsT0FBT0MsZUFBZSxNQUFNLHNCQUFzQjtBQUNsRCxPQUFPQyxzQkFBc0IsTUFBTSw2QkFBNkI7O0FBRWhFO0FBQ0EsTUFBTUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUV6QjtBQUNBO0FBQ0E7QUFDQSxNQUFNQyx3QkFBd0IsU0FBU0gsZUFBZSxDQUFDO0VBRXJESSxXQUFXQSxDQUFFQywwQ0FBMEMsRUFBRztJQUN4RCxLQUFLLENBQUMsQ0FBQztJQUNQLElBQUksQ0FBQ0EsMENBQTBDLEdBQUdBLDBDQUEwQztFQUM5Rjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLE9BQU9BLENBQUVDLEdBQUcsRUFBRztJQUNiLE1BQU1DLFdBQVcsR0FBRyxJQUFJLENBQUNILDBDQUEwQyxDQUFDRyxXQUFXO0lBQy9FQSxXQUFXLENBQUNDLGlCQUFpQixDQUFFLElBQUlWLHVCQUF1QixDQUFDLENBQUUsQ0FBQztFQUNoRTtBQUNGO0FBRUEsTUFBTVcsd0JBQXdCLFNBQVNWLGVBQWUsQ0FBQztFQUVyREksV0FBV0EsQ0FBRUMsMENBQTBDLEVBQUc7SUFDeEQsS0FBSyxDQUFDLENBQUM7SUFDUCxJQUFJLENBQUNBLDBDQUEwQyxHQUFHQSwwQ0FBMEM7RUFDOUY7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxPQUFPQSxDQUFFQyxHQUFHLEVBQUc7SUFDYixNQUFNQyxXQUFXLEdBQUcsSUFBSSxDQUFDSCwwQ0FBMEMsQ0FBQ0csV0FBVztJQUMvRUcsTUFBTSxJQUFJQSxNQUFNLENBQUVILFdBQVcsQ0FBQ0kseUJBQXlCLENBQUNDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBRSxDQUFDO0lBQ3JFTCxXQUFXLENBQUNDLGlCQUFpQixDQUFFLElBQUlYLHdCQUF3QixDQUFFVSxXQUFXLENBQUNNLG9CQUFxQixDQUFFLENBQUM7RUFDbkc7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLElBQUlBLENBQUVSLEdBQUcsRUFBRVMsRUFBRSxFQUFHO0lBQ2QsTUFBTVIsV0FBVyxHQUFHLElBQUksQ0FBQ0gsMENBQTBDLENBQUNHLFdBQVc7SUFDL0VBLFdBQVcsQ0FBQ0kseUJBQXlCLENBQUNLLEdBQUcsQ0FBRUMsSUFBSSxDQUFDQyxHQUFHLENBQUVYLFdBQVcsQ0FBQ0kseUJBQXlCLENBQUNDLEdBQUcsQ0FBQyxDQUFDLEdBQUdHLEVBQUUsR0FBR2QsYUFBYSxFQUFFLENBQUUsQ0FBRSxDQUFDO0VBQzlIO0FBQ0Y7QUFFQSxNQUFNa0IsMENBQTBDLFNBQVNuQixzQkFBc0IsQ0FBQztFQUU5RTtBQUNGO0FBQ0E7RUFDRUcsV0FBV0EsQ0FBRUksV0FBVyxFQUFHO0lBQ3pCLEtBQUssQ0FBRUEsV0FBWSxDQUFDO0lBQ3BCLElBQUksQ0FBQ2EsUUFBUSxDQUFFLElBQUlsQix3QkFBd0IsQ0FBRSxJQUFLLENBQUUsQ0FBQztFQUN2RDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFbUIsTUFBTUEsQ0FBQSxFQUFHO0lBQ1AsSUFBSSxDQUFDRCxRQUFRLENBQUUsSUFBSVgsd0JBQXdCLENBQUUsSUFBSyxDQUFFLENBQUM7RUFDdkQ7QUFDRjtBQUVBYix3QkFBd0IsQ0FBQzBCLFFBQVEsQ0FBRSw0Q0FBNEMsRUFBRUgsMENBQTJDLENBQUM7QUFFN0gsZUFBZUEsMENBQTBDIn0=