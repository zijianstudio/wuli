// Copyright 2015-2021, University of Colorado Boulder

/**
 * One of the states for RnaPolymeraseAttachmentStateMachine. RnaPolymerase enters this state when it is attached to the
 * DNA but is not transcribing. In this state, it is doing a 1D random walk on the DNA strand.
 *
 * @author Sharfudeen Ashraf
 * @author John Blanco
 * @author Aadish Gupta
 */

import dotRandom from '../../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import geneExpressionEssentials from '../../../geneExpressionEssentials.js';
import GEEConstants from '../../GEEConstants.js';
import MoveDirectlyToDestinationMotionStrategy from '../motion-strategies/MoveDirectlyToDestinationMotionStrategy.js';
import WanderInGeneralDirectionMotionStrategy from '../motion-strategies/WanderInGeneralDirectionMotionStrategy.js';
import AttachmentState from './AttachmentState.js';

// constant
const REEVALUATE_TRANSCRIPTION_DECISION_TIME = 1; // seconds

class AttachedToDnaNotTranscribingState extends AttachmentState {
  /**
   * @param {RnaPolymeraseAttachmentStateMachine} rnaPolymeraseAttachmentStateMachine
   */
  constructor(rnaPolymeraseAttachmentStateMachine) {
    super();

    // @public (read-ony) {RnaPolymeraseAttachmentStateMachine}
    this.rnaPolymeraseAttachmentStateMachine = rnaPolymeraseAttachmentStateMachine;

    // @private - flag that is set upon entry that determines whether transcription occurs
    this.transcribe = false;

    // @private
    this.timeSinceTranscriptionDecision = 0;
  }

  /**
   * Helper function which detaches RnaPolymerase from the DNA
   * @param  {AttachmentStateMachine} asm
   * @private
   */
  detachFromDnaMolecule(asm) {
    asm.attachmentSite.attachedOrAttachingMoleculeProperty.set(null);
    asm.attachmentSite = null;
    asm.setState(this.rnaPolymeraseAttachmentStateMachine.unattachedButUnavailableState);
    this.rnaPolymeraseAttachmentStateMachine.biomolecule.setMotionStrategy(new WanderInGeneralDirectionMotionStrategy(this.rnaPolymeraseAttachmentStateMachine.biomolecule.getDetachDirection(), this.rnaPolymeraseAttachmentStateMachine.biomolecule.motionBoundsProperty));
    this.rnaPolymeraseAttachmentStateMachine.detachFromDnaThreshold.reset(); // Reset this threshold.
    asm.biomolecule.attachedToDnaProperty.set(false); // Update externally visible state indication.
  }

  /**
   * @override
   * @param {AttachmentStateMachine} asm
   * @param {number} dt
   * @public
   */
  step(asm, dt) {
    // Verify that state is consistent
    assert && assert(asm.attachmentSite !== null);
    assert && assert(asm.attachmentSite.attachedOrAttachingMoleculeProperty.get() === asm.biomolecule);

    // set up some convenient variables
    let attachedState = this.rnaPolymeraseAttachmentStateMachine.attachedState;
    const attachedAndConformingState = this.rnaPolymeraseAttachmentStateMachine.attachedAndConformingState;
    const biomolecule = this.rnaPolymeraseAttachmentStateMachine.biomolecule;
    const detachFromDnaThreshold = this.rnaPolymeraseAttachmentStateMachine.detachFromDnaThreshold;
    let attachmentSite = this.rnaPolymeraseAttachmentStateMachine.attachmentSite;

    // Decide whether to transcribe the DNA. The decision is based on the affinity of the site and the time of
    // attachment.
    if (this.transcribe) {
      // Begin transcription.
      attachedState = attachedAndConformingState;
      this.rnaPolymeraseAttachmentStateMachine.setState(attachedState);
      detachFromDnaThreshold.reset(); // Reset this threshold.
    } else if (dotRandom.nextDouble() > 1 - this.rnaPolymeraseAttachmentStateMachine.calculateProbabilityOfDetachment(attachmentSite.getAffinity(), dt)) {
      // The decision has been made to detach. Next, decide whether to detach completely from the DNA strand or just
      // jump to an adjacent base pair.
      if (dotRandom.nextDouble() > detachFromDnaThreshold.get()) {
        // Detach completely from the DNA.
        this.detachFromDnaMolecule(asm);
      } else {
        // Move to an adjacent base pair. Start by making a list of candidate base pairs.
        let attachmentSites = biomolecule.getModel().getDnaMolecule().getAdjacentAttachmentSitesRnaPolymerase(biomolecule, asm.attachmentSite);

        // Eliminate sites that are in use or that, if moved to, would put the biomolecule out of bounds.
        _.remove(attachmentSites, site => site.isMoleculeAttached() || !biomolecule.motionBoundsProperty.get().testIfInMotionBounds(biomolecule.bounds, site.positionProperty.get()));

        // Shuffle in order to produce random-ish behavior.
        attachmentSites = dotRandom.shuffle(attachmentSites);
        if (attachmentSites.length === 0) {
          // No valid adjacent sites, so detach completely.
          this.detachFromDnaMolecule(asm);
        } else {
          // Move to an adjacent base pair. Firs, clear the previous attachment site.
          attachmentSite.attachedOrAttachingMoleculeProperty.set(null);

          // Set a new attachment site.
          attachmentSite = attachmentSites[0];

          // State checking - Make sure site is really available
          assert && assert(attachmentSite.attachedOrAttachingMoleculeProperty.get() === null);
          attachmentSite.attachedOrAttachingMoleculeProperty.set(biomolecule);

          // Set up the state to move to the new attachment site.
          this.rnaPolymeraseAttachmentStateMachine.setState(this.rnaPolymeraseAttachmentStateMachine.movingTowardsAttachmentState);
          biomolecule.setMotionStrategy(new MoveDirectlyToDestinationMotionStrategy(attachmentSite.positionProperty, biomolecule.motionBoundsProperty, new Vector2(0, 0), GEEConstants.VELOCITY_ON_DNA));
          this.rnaPolymeraseAttachmentStateMachine.attachmentSite = attachmentSite;

          // Update the detachment threshold. It gets lower over time to increase the probability of detachment.
          // Tweak as needed.
          detachFromDnaThreshold.set(detachFromDnaThreshold.get() * Math.pow(0.5, GEEConstants.DEFAULT_ATTACH_TIME));
        }
      }
    } else {
      // Reevaluate the decision on whether to transcribe.  This is necessary to avoid getting stuck in the attached
      // state, which can happen if the affinity is changed after the state was initially entered, see
      // https://github.com/phetsims/gene-expression-essentials/issues/100.
      this.timeSinceTranscriptionDecision += dt;
      if (this.timeSinceTranscriptionDecision >= REEVALUATE_TRANSCRIPTION_DECISION_TIME) {
        this.transcribe = attachmentSite.getAffinity() > GEEConstants.DEFAULT_AFFINITY && dotRandom.nextDouble() < attachmentSite.getAffinity();
        this.timeSinceTranscriptionDecision = 0;
      }
    }
  }

  /**
   * @override
   * @param  { AttachmentStateMachine} asm
   * @public
   */
  entered(asm) {
    const attachmentSite = this.rnaPolymeraseAttachmentStateMachine.attachmentSite;
    const randValue = dotRandom.nextDouble();

    // Decide right away whether or not to transcribe.
    this.transcribe = attachmentSite.getAffinity() > GEEConstants.DEFAULT_AFFINITY && randValue < attachmentSite.getAffinity();

    // Allow user interaction.
    asm.biomolecule.movableByUserProperty.set(true);

    // Indicate attachment to DNA.
    asm.biomolecule.attachedToDnaProperty.set(true);
  }
}
geneExpressionEssentials.register('AttachedToDnaNotTranscribingState', AttachedToDnaNotTranscribingState);
export default AttachedToDnaNotTranscribingState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJWZWN0b3IyIiwiZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIiwiR0VFQ29uc3RhbnRzIiwiTW92ZURpcmVjdGx5VG9EZXN0aW5hdGlvbk1vdGlvblN0cmF0ZWd5IiwiV2FuZGVySW5HZW5lcmFsRGlyZWN0aW9uTW90aW9uU3RyYXRlZ3kiLCJBdHRhY2htZW50U3RhdGUiLCJSRUVWQUxVQVRFX1RSQU5TQ1JJUFRJT05fREVDSVNJT05fVElNRSIsIkF0dGFjaGVkVG9EbmFOb3RUcmFuc2NyaWJpbmdTdGF0ZSIsImNvbnN0cnVjdG9yIiwicm5hUG9seW1lcmFzZUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUiLCJ0cmFuc2NyaWJlIiwidGltZVNpbmNlVHJhbnNjcmlwdGlvbkRlY2lzaW9uIiwiZGV0YWNoRnJvbURuYU1vbGVjdWxlIiwiYXNtIiwiYXR0YWNobWVudFNpdGUiLCJhdHRhY2hlZE9yQXR0YWNoaW5nTW9sZWN1bGVQcm9wZXJ0eSIsInNldCIsInNldFN0YXRlIiwidW5hdHRhY2hlZEJ1dFVuYXZhaWxhYmxlU3RhdGUiLCJiaW9tb2xlY3VsZSIsInNldE1vdGlvblN0cmF0ZWd5IiwiZ2V0RGV0YWNoRGlyZWN0aW9uIiwibW90aW9uQm91bmRzUHJvcGVydHkiLCJkZXRhY2hGcm9tRG5hVGhyZXNob2xkIiwicmVzZXQiLCJhdHRhY2hlZFRvRG5hUHJvcGVydHkiLCJzdGVwIiwiZHQiLCJhc3NlcnQiLCJnZXQiLCJhdHRhY2hlZFN0YXRlIiwiYXR0YWNoZWRBbmRDb25mb3JtaW5nU3RhdGUiLCJuZXh0RG91YmxlIiwiY2FsY3VsYXRlUHJvYmFiaWxpdHlPZkRldGFjaG1lbnQiLCJnZXRBZmZpbml0eSIsImF0dGFjaG1lbnRTaXRlcyIsImdldE1vZGVsIiwiZ2V0RG5hTW9sZWN1bGUiLCJnZXRBZGphY2VudEF0dGFjaG1lbnRTaXRlc1JuYVBvbHltZXJhc2UiLCJfIiwicmVtb3ZlIiwic2l0ZSIsImlzTW9sZWN1bGVBdHRhY2hlZCIsInRlc3RJZkluTW90aW9uQm91bmRzIiwiYm91bmRzIiwicG9zaXRpb25Qcm9wZXJ0eSIsInNodWZmbGUiLCJsZW5ndGgiLCJtb3ZpbmdUb3dhcmRzQXR0YWNobWVudFN0YXRlIiwiVkVMT0NJVFlfT05fRE5BIiwiTWF0aCIsInBvdyIsIkRFRkFVTFRfQVRUQUNIX1RJTUUiLCJERUZBVUxUX0FGRklOSVRZIiwiZW50ZXJlZCIsInJhbmRWYWx1ZSIsIm1vdmFibGVCeVVzZXJQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQXR0YWNoZWRUb0RuYU5vdFRyYW5zY3JpYmluZ1N0YXRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE9uZSBvZiB0aGUgc3RhdGVzIGZvciBSbmFQb2x5bWVyYXNlQXR0YWNobWVudFN0YXRlTWFjaGluZS4gUm5hUG9seW1lcmFzZSBlbnRlcnMgdGhpcyBzdGF0ZSB3aGVuIGl0IGlzIGF0dGFjaGVkIHRvIHRoZVxyXG4gKiBETkEgYnV0IGlzIG5vdCB0cmFuc2NyaWJpbmcuIEluIHRoaXMgc3RhdGUsIGl0IGlzIGRvaW5nIGEgMUQgcmFuZG9tIHdhbGsgb24gdGhlIEROQSBzdHJhbmQuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2hhcmZ1ZGVlbiBBc2hyYWZcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxyXG4gKi9cclxuXHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IGdlbmVFeHByZXNzaW9uRXNzZW50aWFscyBmcm9tICcuLi8uLi8uLi9nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMuanMnO1xyXG5pbXBvcnQgR0VFQ29uc3RhbnRzIGZyb20gJy4uLy4uL0dFRUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBNb3ZlRGlyZWN0bHlUb0Rlc3RpbmF0aW9uTW90aW9uU3RyYXRlZ3kgZnJvbSAnLi4vbW90aW9uLXN0cmF0ZWdpZXMvTW92ZURpcmVjdGx5VG9EZXN0aW5hdGlvbk1vdGlvblN0cmF0ZWd5LmpzJztcclxuaW1wb3J0IFdhbmRlckluR2VuZXJhbERpcmVjdGlvbk1vdGlvblN0cmF0ZWd5IGZyb20gJy4uL21vdGlvbi1zdHJhdGVnaWVzL1dhbmRlckluR2VuZXJhbERpcmVjdGlvbk1vdGlvblN0cmF0ZWd5LmpzJztcclxuaW1wb3J0IEF0dGFjaG1lbnRTdGF0ZSBmcm9tICcuL0F0dGFjaG1lbnRTdGF0ZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudFxyXG5jb25zdCBSRUVWQUxVQVRFX1RSQU5TQ1JJUFRJT05fREVDSVNJT05fVElNRSA9IDE7IC8vIHNlY29uZHNcclxuXHJcbmNsYXNzIEF0dGFjaGVkVG9EbmFOb3RUcmFuc2NyaWJpbmdTdGF0ZSBleHRlbmRzIEF0dGFjaG1lbnRTdGF0ZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Um5hUG9seW1lcmFzZUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmV9IHJuYVBvbHltZXJhc2VBdHRhY2htZW50U3RhdGVNYWNoaW5lXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHJuYVBvbHltZXJhc2VBdHRhY2htZW50U3RhdGVNYWNoaW5lICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ueSkge1JuYVBvbHltZXJhc2VBdHRhY2htZW50U3RhdGVNYWNoaW5lfVxyXG4gICAgdGhpcy5ybmFQb2x5bWVyYXNlQXR0YWNobWVudFN0YXRlTWFjaGluZSA9IHJuYVBvbHltZXJhc2VBdHRhY2htZW50U3RhdGVNYWNoaW5lO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gZmxhZyB0aGF0IGlzIHNldCB1cG9uIGVudHJ5IHRoYXQgZGV0ZXJtaW5lcyB3aGV0aGVyIHRyYW5zY3JpcHRpb24gb2NjdXJzXHJcbiAgICB0aGlzLnRyYW5zY3JpYmUgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy50aW1lU2luY2VUcmFuc2NyaXB0aW9uRGVjaXNpb24gPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGVscGVyIGZ1bmN0aW9uIHdoaWNoIGRldGFjaGVzIFJuYVBvbHltZXJhc2UgZnJvbSB0aGUgRE5BXHJcbiAgICogQHBhcmFtICB7QXR0YWNobWVudFN0YXRlTWFjaGluZX0gYXNtXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBkZXRhY2hGcm9tRG5hTW9sZWN1bGUoIGFzbSApIHtcclxuICAgIGFzbS5hdHRhY2htZW50U2l0ZS5hdHRhY2hlZE9yQXR0YWNoaW5nTW9sZWN1bGVQcm9wZXJ0eS5zZXQoIG51bGwgKTtcclxuICAgIGFzbS5hdHRhY2htZW50U2l0ZSA9IG51bGw7XHJcbiAgICBhc20uc2V0U3RhdGUoIHRoaXMucm5hUG9seW1lcmFzZUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUudW5hdHRhY2hlZEJ1dFVuYXZhaWxhYmxlU3RhdGUgKTtcclxuICAgIHRoaXMucm5hUG9seW1lcmFzZUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUuYmlvbW9sZWN1bGUuc2V0TW90aW9uU3RyYXRlZ3koXHJcbiAgICAgIG5ldyBXYW5kZXJJbkdlbmVyYWxEaXJlY3Rpb25Nb3Rpb25TdHJhdGVneSggdGhpcy5ybmFQb2x5bWVyYXNlQXR0YWNobWVudFN0YXRlTWFjaGluZS5iaW9tb2xlY3VsZS5nZXREZXRhY2hEaXJlY3Rpb24oKSxcclxuICAgICAgICB0aGlzLnJuYVBvbHltZXJhc2VBdHRhY2htZW50U3RhdGVNYWNoaW5lLmJpb21vbGVjdWxlLm1vdGlvbkJvdW5kc1Byb3BlcnR5ICkgKTtcclxuICAgIHRoaXMucm5hUG9seW1lcmFzZUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUuZGV0YWNoRnJvbURuYVRocmVzaG9sZC5yZXNldCgpOyAvLyBSZXNldCB0aGlzIHRocmVzaG9sZC5cclxuICAgIGFzbS5iaW9tb2xlY3VsZS5hdHRhY2hlZFRvRG5hUHJvcGVydHkuc2V0KCBmYWxzZSApOyAvLyBVcGRhdGUgZXh0ZXJuYWxseSB2aXNpYmxlIHN0YXRlIGluZGljYXRpb24uXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcGFyYW0ge0F0dGFjaG1lbnRTdGF0ZU1hY2hpbmV9IGFzbVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBhc20sIGR0ICkge1xyXG5cclxuICAgIC8vIFZlcmlmeSB0aGF0IHN0YXRlIGlzIGNvbnNpc3RlbnRcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFzbS5hdHRhY2htZW50U2l0ZSAhPT0gbnVsbCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYXNtLmF0dGFjaG1lbnRTaXRlLmF0dGFjaGVkT3JBdHRhY2hpbmdNb2xlY3VsZVByb3BlcnR5LmdldCgpID09PSBhc20uYmlvbW9sZWN1bGUgKTtcclxuXHJcbiAgICAvLyBzZXQgdXAgc29tZSBjb252ZW5pZW50IHZhcmlhYmxlc1xyXG4gICAgbGV0IGF0dGFjaGVkU3RhdGUgPSB0aGlzLnJuYVBvbHltZXJhc2VBdHRhY2htZW50U3RhdGVNYWNoaW5lLmF0dGFjaGVkU3RhdGU7XHJcbiAgICBjb25zdCBhdHRhY2hlZEFuZENvbmZvcm1pbmdTdGF0ZSA9IHRoaXMucm5hUG9seW1lcmFzZUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUuYXR0YWNoZWRBbmRDb25mb3JtaW5nU3RhdGU7XHJcbiAgICBjb25zdCBiaW9tb2xlY3VsZSA9IHRoaXMucm5hUG9seW1lcmFzZUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUuYmlvbW9sZWN1bGU7XHJcbiAgICBjb25zdCBkZXRhY2hGcm9tRG5hVGhyZXNob2xkID0gdGhpcy5ybmFQb2x5bWVyYXNlQXR0YWNobWVudFN0YXRlTWFjaGluZS5kZXRhY2hGcm9tRG5hVGhyZXNob2xkO1xyXG4gICAgbGV0IGF0dGFjaG1lbnRTaXRlID0gdGhpcy5ybmFQb2x5bWVyYXNlQXR0YWNobWVudFN0YXRlTWFjaGluZS5hdHRhY2htZW50U2l0ZTtcclxuXHJcbiAgICAvLyBEZWNpZGUgd2hldGhlciB0byB0cmFuc2NyaWJlIHRoZSBETkEuIFRoZSBkZWNpc2lvbiBpcyBiYXNlZCBvbiB0aGUgYWZmaW5pdHkgb2YgdGhlIHNpdGUgYW5kIHRoZSB0aW1lIG9mXHJcbiAgICAvLyBhdHRhY2htZW50LlxyXG4gICAgaWYgKCB0aGlzLnRyYW5zY3JpYmUgKSB7XHJcblxyXG4gICAgICAvLyBCZWdpbiB0cmFuc2NyaXB0aW9uLlxyXG4gICAgICBhdHRhY2hlZFN0YXRlID0gYXR0YWNoZWRBbmRDb25mb3JtaW5nU3RhdGU7XHJcbiAgICAgIHRoaXMucm5hUG9seW1lcmFzZUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUuc2V0U3RhdGUoIGF0dGFjaGVkU3RhdGUgKTtcclxuICAgICAgZGV0YWNoRnJvbURuYVRocmVzaG9sZC5yZXNldCgpOyAvLyBSZXNldCB0aGlzIHRocmVzaG9sZC5cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpID5cclxuICAgICAgICAgICAgICAoIDEgLSB0aGlzLnJuYVBvbHltZXJhc2VBdHRhY2htZW50U3RhdGVNYWNoaW5lLmNhbGN1bGF0ZVByb2JhYmlsaXR5T2ZEZXRhY2htZW50KCBhdHRhY2htZW50U2l0ZS5nZXRBZmZpbml0eSgpLCBkdCApICkgKSB7XHJcblxyXG4gICAgICAvLyBUaGUgZGVjaXNpb24gaGFzIGJlZW4gbWFkZSB0byBkZXRhY2guIE5leHQsIGRlY2lkZSB3aGV0aGVyIHRvIGRldGFjaCBjb21wbGV0ZWx5IGZyb20gdGhlIEROQSBzdHJhbmQgb3IganVzdFxyXG4gICAgICAvLyBqdW1wIHRvIGFuIGFkamFjZW50IGJhc2UgcGFpci5cclxuICAgICAgaWYgKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpID4gZGV0YWNoRnJvbURuYVRocmVzaG9sZC5nZXQoKSApIHtcclxuXHJcbiAgICAgICAgLy8gRGV0YWNoIGNvbXBsZXRlbHkgZnJvbSB0aGUgRE5BLlxyXG4gICAgICAgIHRoaXMuZGV0YWNoRnJvbURuYU1vbGVjdWxlKCBhc20gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gTW92ZSB0byBhbiBhZGphY2VudCBiYXNlIHBhaXIuIFN0YXJ0IGJ5IG1ha2luZyBhIGxpc3Qgb2YgY2FuZGlkYXRlIGJhc2UgcGFpcnMuXHJcbiAgICAgICAgbGV0IGF0dGFjaG1lbnRTaXRlcyA9IGJpb21vbGVjdWxlLmdldE1vZGVsKCkuZ2V0RG5hTW9sZWN1bGUoKS5nZXRBZGphY2VudEF0dGFjaG1lbnRTaXRlc1JuYVBvbHltZXJhc2UoXHJcbiAgICAgICAgICBiaW9tb2xlY3VsZSxcclxuICAgICAgICAgIGFzbS5hdHRhY2htZW50U2l0ZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIEVsaW1pbmF0ZSBzaXRlcyB0aGF0IGFyZSBpbiB1c2Ugb3IgdGhhdCwgaWYgbW92ZWQgdG8sIHdvdWxkIHB1dCB0aGUgYmlvbW9sZWN1bGUgb3V0IG9mIGJvdW5kcy5cclxuICAgICAgICBfLnJlbW92ZSggYXR0YWNobWVudFNpdGVzLCBzaXRlID0+IHNpdGUuaXNNb2xlY3VsZUF0dGFjaGVkKCkgfHwgIWJpb21vbGVjdWxlLm1vdGlvbkJvdW5kc1Byb3BlcnR5LmdldCgpLnRlc3RJZkluTW90aW9uQm91bmRzKFxyXG4gICAgICAgICAgYmlvbW9sZWN1bGUuYm91bmRzLCBzaXRlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSApO1xyXG5cclxuICAgICAgICAvLyBTaHVmZmxlIGluIG9yZGVyIHRvIHByb2R1Y2UgcmFuZG9tLWlzaCBiZWhhdmlvci5cclxuICAgICAgICBhdHRhY2htZW50U2l0ZXMgPSBkb3RSYW5kb20uc2h1ZmZsZSggYXR0YWNobWVudFNpdGVzICk7XHJcblxyXG4gICAgICAgIGlmICggYXR0YWNobWVudFNpdGVzLmxlbmd0aCA9PT0gMCApIHtcclxuXHJcbiAgICAgICAgICAvLyBObyB2YWxpZCBhZGphY2VudCBzaXRlcywgc28gZGV0YWNoIGNvbXBsZXRlbHkuXHJcbiAgICAgICAgICB0aGlzLmRldGFjaEZyb21EbmFNb2xlY3VsZSggYXNtICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIE1vdmUgdG8gYW4gYWRqYWNlbnQgYmFzZSBwYWlyLiBGaXJzLCBjbGVhciB0aGUgcHJldmlvdXMgYXR0YWNobWVudCBzaXRlLlxyXG4gICAgICAgICAgYXR0YWNobWVudFNpdGUuYXR0YWNoZWRPckF0dGFjaGluZ01vbGVjdWxlUHJvcGVydHkuc2V0KCBudWxsICk7XHJcblxyXG4gICAgICAgICAgLy8gU2V0IGEgbmV3IGF0dGFjaG1lbnQgc2l0ZS5cclxuICAgICAgICAgIGF0dGFjaG1lbnRTaXRlID0gYXR0YWNobWVudFNpdGVzWyAwIF07XHJcblxyXG4gICAgICAgICAgLy8gU3RhdGUgY2hlY2tpbmcgLSBNYWtlIHN1cmUgc2l0ZSBpcyByZWFsbHkgYXZhaWxhYmxlXHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhdHRhY2htZW50U2l0ZS5hdHRhY2hlZE9yQXR0YWNoaW5nTW9sZWN1bGVQcm9wZXJ0eS5nZXQoKSA9PT0gbnVsbCApO1xyXG4gICAgICAgICAgYXR0YWNobWVudFNpdGUuYXR0YWNoZWRPckF0dGFjaGluZ01vbGVjdWxlUHJvcGVydHkuc2V0KCBiaW9tb2xlY3VsZSApO1xyXG5cclxuICAgICAgICAgIC8vIFNldCB1cCB0aGUgc3RhdGUgdG8gbW92ZSB0byB0aGUgbmV3IGF0dGFjaG1lbnQgc2l0ZS5cclxuICAgICAgICAgIHRoaXMucm5hUG9seW1lcmFzZUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUuc2V0U3RhdGUoXHJcbiAgICAgICAgICAgIHRoaXMucm5hUG9seW1lcmFzZUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUubW92aW5nVG93YXJkc0F0dGFjaG1lbnRTdGF0ZVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGJpb21vbGVjdWxlLnNldE1vdGlvblN0cmF0ZWd5KCBuZXcgTW92ZURpcmVjdGx5VG9EZXN0aW5hdGlvbk1vdGlvblN0cmF0ZWd5KFxyXG4gICAgICAgICAgICBhdHRhY2htZW50U2l0ZS5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICAgICAgICBiaW9tb2xlY3VsZS5tb3Rpb25Cb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgICAgICAgbmV3IFZlY3RvcjIoIDAsIDAgKSxcclxuICAgICAgICAgICAgR0VFQ29uc3RhbnRzLlZFTE9DSVRZX09OX0ROQVxyXG4gICAgICAgICAgKSApO1xyXG4gICAgICAgICAgdGhpcy5ybmFQb2x5bWVyYXNlQXR0YWNobWVudFN0YXRlTWFjaGluZS5hdHRhY2htZW50U2l0ZSA9IGF0dGFjaG1lbnRTaXRlO1xyXG5cclxuICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgZGV0YWNobWVudCB0aHJlc2hvbGQuIEl0IGdldHMgbG93ZXIgb3ZlciB0aW1lIHRvIGluY3JlYXNlIHRoZSBwcm9iYWJpbGl0eSBvZiBkZXRhY2htZW50LlxyXG4gICAgICAgICAgLy8gVHdlYWsgYXMgbmVlZGVkLlxyXG4gICAgICAgICAgZGV0YWNoRnJvbURuYVRocmVzaG9sZC5zZXQoIGRldGFjaEZyb21EbmFUaHJlc2hvbGQuZ2V0KCkgKiBNYXRoLnBvdyggMC41LCBHRUVDb25zdGFudHMuREVGQVVMVF9BVFRBQ0hfVElNRSApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFJlZXZhbHVhdGUgdGhlIGRlY2lzaW9uIG9uIHdoZXRoZXIgdG8gdHJhbnNjcmliZS4gIFRoaXMgaXMgbmVjZXNzYXJ5IHRvIGF2b2lkIGdldHRpbmcgc3R1Y2sgaW4gdGhlIGF0dGFjaGVkXHJcbiAgICAgIC8vIHN0YXRlLCB3aGljaCBjYW4gaGFwcGVuIGlmIHRoZSBhZmZpbml0eSBpcyBjaGFuZ2VkIGFmdGVyIHRoZSBzdGF0ZSB3YXMgaW5pdGlhbGx5IGVudGVyZWQsIHNlZVxyXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ2VuZS1leHByZXNzaW9uLWVzc2VudGlhbHMvaXNzdWVzLzEwMC5cclxuICAgICAgdGhpcy50aW1lU2luY2VUcmFuc2NyaXB0aW9uRGVjaXNpb24gKz0gZHQ7XHJcblxyXG4gICAgICBpZiAoIHRoaXMudGltZVNpbmNlVHJhbnNjcmlwdGlvbkRlY2lzaW9uID49IFJFRVZBTFVBVEVfVFJBTlNDUklQVElPTl9ERUNJU0lPTl9USU1FICkge1xyXG4gICAgICAgIHRoaXMudHJhbnNjcmliZSA9IGF0dGFjaG1lbnRTaXRlLmdldEFmZmluaXR5KCkgPiBHRUVDb25zdGFudHMuREVGQVVMVF9BRkZJTklUWSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgPCBhdHRhY2htZW50U2l0ZS5nZXRBZmZpbml0eSgpO1xyXG4gICAgICAgIHRoaXMudGltZVNpbmNlVHJhbnNjcmlwdGlvbkRlY2lzaW9uID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHBhcmFtICB7IEF0dGFjaG1lbnRTdGF0ZU1hY2hpbmV9IGFzbVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBlbnRlcmVkKCBhc20gKSB7XHJcbiAgICBjb25zdCBhdHRhY2htZW50U2l0ZSA9IHRoaXMucm5hUG9seW1lcmFzZUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUuYXR0YWNobWVudFNpdGU7XHJcbiAgICBjb25zdCByYW5kVmFsdWUgPSBkb3RSYW5kb20ubmV4dERvdWJsZSgpO1xyXG5cclxuICAgIC8vIERlY2lkZSByaWdodCBhd2F5IHdoZXRoZXIgb3Igbm90IHRvIHRyYW5zY3JpYmUuXHJcbiAgICB0aGlzLnRyYW5zY3JpYmUgPSBhdHRhY2htZW50U2l0ZS5nZXRBZmZpbml0eSgpID4gR0VFQ29uc3RhbnRzLkRFRkFVTFRfQUZGSU5JVFkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgIHJhbmRWYWx1ZSA8IGF0dGFjaG1lbnRTaXRlLmdldEFmZmluaXR5KCk7XHJcblxyXG4gICAgLy8gQWxsb3cgdXNlciBpbnRlcmFjdGlvbi5cclxuICAgIGFzbS5iaW9tb2xlY3VsZS5tb3ZhYmxlQnlVc2VyUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcblxyXG4gICAgLy8gSW5kaWNhdGUgYXR0YWNobWVudCB0byBETkEuXHJcbiAgICBhc20uYmlvbW9sZWN1bGUuYXR0YWNoZWRUb0RuYVByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gIH1cclxufVxyXG5cclxuZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLnJlZ2lzdGVyKCAnQXR0YWNoZWRUb0RuYU5vdFRyYW5zY3JpYmluZ1N0YXRlJywgQXR0YWNoZWRUb0RuYU5vdFRyYW5zY3JpYmluZ1N0YXRlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBdHRhY2hlZFRvRG5hTm90VHJhbnNjcmliaW5nU3RhdGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxvQ0FBb0M7QUFDMUQsT0FBT0MsT0FBTyxNQUFNLGtDQUFrQztBQUN0RCxPQUFPQyx3QkFBd0IsTUFBTSxzQ0FBc0M7QUFDM0UsT0FBT0MsWUFBWSxNQUFNLHVCQUF1QjtBQUNoRCxPQUFPQyx1Q0FBdUMsTUFBTSxpRUFBaUU7QUFDckgsT0FBT0Msc0NBQXNDLE1BQU0sZ0VBQWdFO0FBQ25ILE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7O0FBRWxEO0FBQ0EsTUFBTUMsc0NBQXNDLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRWxELE1BQU1DLGlDQUFpQyxTQUFTRixlQUFlLENBQUM7RUFFOUQ7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