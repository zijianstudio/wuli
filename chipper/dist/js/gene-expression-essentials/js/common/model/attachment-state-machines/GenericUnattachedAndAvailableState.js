// Copyright 2015-2020, University of Colorado Boulder

/**
 * GenericUnattachedAndAvailableState is a generic state when biomolecule is unattached and available
 * @author John Blanco
 * @author Mohamed Safi
 * @author Aadish Gupta
 */

import geneExpressionEssentials from '../../../geneExpressionEssentials.js';
import MeanderToDestinationMotionStrategy from '../motion-strategies/MeanderToDestinationMotionStrategy.js';
import RandomWalkMotionStrategy from '../motion-strategies/RandomWalkMotionStrategy.js';
import AttachmentState from './AttachmentState.js';
class GenericUnattachedAndAvailableState extends AttachmentState {
  constructor() {
    super();
  }

  /**
   * @override
   * @param {AttachmentStateMachine} enclosingStateMachine
   * @param {number} dt
   * @public
   */
  step(enclosingStateMachine, dt) {
    const gsm = enclosingStateMachine;

    // Verify that state is consistent
    assert && assert(gsm.attachmentSite === null);

    // Make the biomolecule look for attachments.
    gsm.attachmentSite = gsm.biomolecule.proposeAttachments();
    if (gsm.attachmentSite !== null) {
      // A proposal was accepted.  Mark the attachment site as being in use.
      gsm.attachmentSite.attachedOrAttachingMoleculeProperty.set(gsm.biomolecule);

      // Start moving towards the site.
      gsm.biomolecule.setMotionStrategy(new MeanderToDestinationMotionStrategy(gsm.attachmentSite.positionProperty, gsm.biomolecule.motionBoundsProperty, gsm.destinationOffset));

      // Update state.
      gsm.setState(gsm.movingTowardsAttachmentState);
    }
  }

  /**
   * @override
   * @param {AttachmentStateMachine} enclosingStateMachine
   * @public
   */
  entered(enclosingStateMachine) {
    enclosingStateMachine.biomolecule.setMotionStrategy(new RandomWalkMotionStrategy(enclosingStateMachine.biomolecule.motionBoundsProperty));

    // Allow user interaction.
    enclosingStateMachine.biomolecule.movableByUserProperty.set(true);
  }
}
geneExpressionEssentials.register('GenericUnattachedAndAvailableState', GenericUnattachedAndAvailableState);
export default GenericUnattachedAndAvailableState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMiLCJNZWFuZGVyVG9EZXN0aW5hdGlvbk1vdGlvblN0cmF0ZWd5IiwiUmFuZG9tV2Fsa01vdGlvblN0cmF0ZWd5IiwiQXR0YWNobWVudFN0YXRlIiwiR2VuZXJpY1VuYXR0YWNoZWRBbmRBdmFpbGFibGVTdGF0ZSIsImNvbnN0cnVjdG9yIiwic3RlcCIsImVuY2xvc2luZ1N0YXRlTWFjaGluZSIsImR0IiwiZ3NtIiwiYXNzZXJ0IiwiYXR0YWNobWVudFNpdGUiLCJiaW9tb2xlY3VsZSIsInByb3Bvc2VBdHRhY2htZW50cyIsImF0dGFjaGVkT3JBdHRhY2hpbmdNb2xlY3VsZVByb3BlcnR5Iiwic2V0Iiwic2V0TW90aW9uU3RyYXRlZ3kiLCJwb3NpdGlvblByb3BlcnR5IiwibW90aW9uQm91bmRzUHJvcGVydHkiLCJkZXN0aW5hdGlvbk9mZnNldCIsInNldFN0YXRlIiwibW92aW5nVG93YXJkc0F0dGFjaG1lbnRTdGF0ZSIsImVudGVyZWQiLCJtb3ZhYmxlQnlVc2VyUHJvcGVydHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdlbmVyaWNVbmF0dGFjaGVkQW5kQXZhaWxhYmxlU3RhdGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR2VuZXJpY1VuYXR0YWNoZWRBbmRBdmFpbGFibGVTdGF0ZSBpcyBhIGdlbmVyaWMgc3RhdGUgd2hlbiBiaW9tb2xlY3VsZSBpcyB1bmF0dGFjaGVkIGFuZCBhdmFpbGFibGVcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIE1vaGFtZWQgU2FmaVxyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxyXG4gKi9cclxuXHJcbmltcG9ydCBnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMgZnJvbSAnLi4vLi4vLi4vZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLmpzJztcclxuaW1wb3J0IE1lYW5kZXJUb0Rlc3RpbmF0aW9uTW90aW9uU3RyYXRlZ3kgZnJvbSAnLi4vbW90aW9uLXN0cmF0ZWdpZXMvTWVhbmRlclRvRGVzdGluYXRpb25Nb3Rpb25TdHJhdGVneS5qcyc7XHJcbmltcG9ydCBSYW5kb21XYWxrTW90aW9uU3RyYXRlZ3kgZnJvbSAnLi4vbW90aW9uLXN0cmF0ZWdpZXMvUmFuZG9tV2Fsa01vdGlvblN0cmF0ZWd5LmpzJztcclxuaW1wb3J0IEF0dGFjaG1lbnRTdGF0ZSBmcm9tICcuL0F0dGFjaG1lbnRTdGF0ZS5qcyc7XHJcblxyXG5jbGFzcyBHZW5lcmljVW5hdHRhY2hlZEFuZEF2YWlsYWJsZVN0YXRlIGV4dGVuZHMgQXR0YWNobWVudFN0YXRlIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHBhcmFtIHtBdHRhY2htZW50U3RhdGVNYWNoaW5lfSBlbmNsb3NpbmdTdGF0ZU1hY2hpbmVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCggZW5jbG9zaW5nU3RhdGVNYWNoaW5lLCBkdCApIHtcclxuICAgIGNvbnN0IGdzbSA9IGVuY2xvc2luZ1N0YXRlTWFjaGluZTtcclxuXHJcbiAgICAvLyBWZXJpZnkgdGhhdCBzdGF0ZSBpcyBjb25zaXN0ZW50XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBnc20uYXR0YWNobWVudFNpdGUgPT09IG51bGwgKTtcclxuXHJcbiAgICAvLyBNYWtlIHRoZSBiaW9tb2xlY3VsZSBsb29rIGZvciBhdHRhY2htZW50cy5cclxuICAgIGdzbS5hdHRhY2htZW50U2l0ZSA9IGdzbS5iaW9tb2xlY3VsZS5wcm9wb3NlQXR0YWNobWVudHMoKTtcclxuICAgIGlmICggZ3NtLmF0dGFjaG1lbnRTaXRlICE9PSBudWxsICkge1xyXG5cclxuICAgICAgLy8gQSBwcm9wb3NhbCB3YXMgYWNjZXB0ZWQuICBNYXJrIHRoZSBhdHRhY2htZW50IHNpdGUgYXMgYmVpbmcgaW4gdXNlLlxyXG4gICAgICBnc20uYXR0YWNobWVudFNpdGUuYXR0YWNoZWRPckF0dGFjaGluZ01vbGVjdWxlUHJvcGVydHkuc2V0KCBnc20uYmlvbW9sZWN1bGUgKTtcclxuXHJcbiAgICAgIC8vIFN0YXJ0IG1vdmluZyB0b3dhcmRzIHRoZSBzaXRlLlxyXG4gICAgICBnc20uYmlvbW9sZWN1bGUuc2V0TW90aW9uU3RyYXRlZ3koXHJcbiAgICAgICAgbmV3IE1lYW5kZXJUb0Rlc3RpbmF0aW9uTW90aW9uU3RyYXRlZ3koXHJcbiAgICAgICAgICBnc20uYXR0YWNobWVudFNpdGUucG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgICAgIGdzbS5iaW9tb2xlY3VsZS5tb3Rpb25Cb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgICAgIGdzbS5kZXN0aW5hdGlvbk9mZnNldFxyXG4gICAgICAgIClcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSBzdGF0ZS5cclxuICAgICAgZ3NtLnNldFN0YXRlKCBnc20ubW92aW5nVG93YXJkc0F0dGFjaG1lbnRTdGF0ZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHBhcmFtIHtBdHRhY2htZW50U3RhdGVNYWNoaW5lfSBlbmNsb3NpbmdTdGF0ZU1hY2hpbmVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZW50ZXJlZCggZW5jbG9zaW5nU3RhdGVNYWNoaW5lICkge1xyXG4gICAgZW5jbG9zaW5nU3RhdGVNYWNoaW5lLmJpb21vbGVjdWxlLnNldE1vdGlvblN0cmF0ZWd5KFxyXG4gICAgICBuZXcgUmFuZG9tV2Fsa01vdGlvblN0cmF0ZWd5KCBlbmNsb3NpbmdTdGF0ZU1hY2hpbmUuYmlvbW9sZWN1bGUubW90aW9uQm91bmRzUHJvcGVydHkgKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBBbGxvdyB1c2VyIGludGVyYWN0aW9uLlxyXG4gICAgZW5jbG9zaW5nU3RhdGVNYWNoaW5lLmJpb21vbGVjdWxlLm1vdmFibGVCeVVzZXJQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICB9XHJcbn1cclxuXHJcbmdlbmVFeHByZXNzaW9uRXNzZW50aWFscy5yZWdpc3RlciggJ0dlbmVyaWNVbmF0dGFjaGVkQW5kQXZhaWxhYmxlU3RhdGUnLCBHZW5lcmljVW5hdHRhY2hlZEFuZEF2YWlsYWJsZVN0YXRlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHZW5lcmljVW5hdHRhY2hlZEFuZEF2YWlsYWJsZVN0YXRlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHdCQUF3QixNQUFNLHNDQUFzQztBQUMzRSxPQUFPQyxrQ0FBa0MsTUFBTSw0REFBNEQ7QUFDM0csT0FBT0Msd0JBQXdCLE1BQU0sa0RBQWtEO0FBQ3ZGLE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7QUFFbEQsTUFBTUMsa0NBQWtDLFNBQVNELGVBQWUsQ0FBQztFQUUvREUsV0FBV0EsQ0FBQSxFQUFHO0lBQ1osS0FBSyxDQUFDLENBQUM7RUFDVDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsSUFBSUEsQ0FBRUMscUJBQXFCLEVBQUVDLEVBQUUsRUFBRztJQUNoQyxNQUFNQyxHQUFHLEdBQUdGLHFCQUFxQjs7SUFFakM7SUFDQUcsTUFBTSxJQUFJQSxNQUFNLENBQUVELEdBQUcsQ0FBQ0UsY0FBYyxLQUFLLElBQUssQ0FBQzs7SUFFL0M7SUFDQUYsR0FBRyxDQUFDRSxjQUFjLEdBQUdGLEdBQUcsQ0FBQ0csV0FBVyxDQUFDQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3pELElBQUtKLEdBQUcsQ0FBQ0UsY0FBYyxLQUFLLElBQUksRUFBRztNQUVqQztNQUNBRixHQUFHLENBQUNFLGNBQWMsQ0FBQ0csbUNBQW1DLENBQUNDLEdBQUcsQ0FBRU4sR0FBRyxDQUFDRyxXQUFZLENBQUM7O01BRTdFO01BQ0FILEdBQUcsQ0FBQ0csV0FBVyxDQUFDSSxpQkFBaUIsQ0FDL0IsSUFBSWYsa0NBQWtDLENBQ3BDUSxHQUFHLENBQUNFLGNBQWMsQ0FBQ00sZ0JBQWdCLEVBQ25DUixHQUFHLENBQUNHLFdBQVcsQ0FBQ00sb0JBQW9CLEVBQ3BDVCxHQUFHLENBQUNVLGlCQUNOLENBQ0YsQ0FBQzs7TUFFRDtNQUNBVixHQUFHLENBQUNXLFFBQVEsQ0FBRVgsR0FBRyxDQUFDWSw0QkFBNkIsQ0FBQztJQUNsRDtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsT0FBT0EsQ0FBRWYscUJBQXFCLEVBQUc7SUFDL0JBLHFCQUFxQixDQUFDSyxXQUFXLENBQUNJLGlCQUFpQixDQUNqRCxJQUFJZCx3QkFBd0IsQ0FBRUsscUJBQXFCLENBQUNLLFdBQVcsQ0FBQ00sb0JBQXFCLENBQ3ZGLENBQUM7O0lBRUQ7SUFDQVgscUJBQXFCLENBQUNLLFdBQVcsQ0FBQ1cscUJBQXFCLENBQUNSLEdBQUcsQ0FBRSxJQUFLLENBQUM7RUFDckU7QUFDRjtBQUVBZix3QkFBd0IsQ0FBQ3dCLFFBQVEsQ0FBRSxvQ0FBb0MsRUFBRXBCLGtDQUFtQyxDQUFDO0FBRTdHLGVBQWVBLGtDQUFrQyJ9