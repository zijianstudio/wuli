// Copyright 2015-2022, University of Colorado Boulder

/**
 * Class that represents a fragment of messenger ribonucleic acid, or mRNA, in the model. The fragments exist for a short
 * time as mRNA is being destroyed, but can't be translated.
 *
 * @author John Blanco
 * @author Mohamed Safi
 * @author Aadish Gupta
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import { Shape } from '../../../../kite/js/imports.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import MessengerRnaFragmentAttachmentStateMachine from './attachment-state-machines/MessengerRnaFragmentAttachmentStateMachine.js';
import SquareSegment from './SquareSegment.js';
import WindingBiomolecule from './WindingBiomolecule.js';

// constants
const MRNA_WINDING_ALGORITHMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
class MessengerRnaFragment extends WindingBiomolecule {
  /**
   * This creates the mRNA fragment as a single point, with the intention of growing it.
   *
   * @param {GeneExpressionModel} model
   * @param {Vector2} position
   */
  constructor(model, position) {
    super(model, new Shape().moveToPoint(position), position, {
      windingParamSet: MRNA_WINDING_ALGORITHMS[dotRandom.nextInt(MRNA_WINDING_ALGORITHMS.length)]
    });

    // Add the first, and in this case only, segment to the shape segment list.
    this.shapeSegments.push(new SquareSegment(this, position));
  }

  /**
   * Release this mRNA fragment from the destroyer molecule.
   * @public
   */
  releaseFromDestroyer() {
    this.attachmentStateMachine.detach();
  }

  /**
   * Creates the attachment state machine
   * @returns {MessengerRnaFragmentAttachmentStateMachine}
   * @public
   */
  createAttachmentStateMachine() {
    return new MessengerRnaFragmentAttachmentStateMachine(this);
  }
}
geneExpressionEssentials.register('MessengerRnaFragment', MessengerRnaFragment);
export default MessengerRnaFragment;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJTaGFwZSIsImdlbmVFeHByZXNzaW9uRXNzZW50aWFscyIsIk1lc3NlbmdlclJuYUZyYWdtZW50QXR0YWNobWVudFN0YXRlTWFjaGluZSIsIlNxdWFyZVNlZ21lbnQiLCJXaW5kaW5nQmlvbW9sZWN1bGUiLCJNUk5BX1dJTkRJTkdfQUxHT1JJVEhNUyIsIk1lc3NlbmdlclJuYUZyYWdtZW50IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInBvc2l0aW9uIiwibW92ZVRvUG9pbnQiLCJ3aW5kaW5nUGFyYW1TZXQiLCJuZXh0SW50IiwibGVuZ3RoIiwic2hhcGVTZWdtZW50cyIsInB1c2giLCJyZWxlYXNlRnJvbURlc3Ryb3llciIsImF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUiLCJkZXRhY2giLCJjcmVhdGVBdHRhY2htZW50U3RhdGVNYWNoaW5lIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNZXNzZW5nZXJSbmFGcmFnbWVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDbGFzcyB0aGF0IHJlcHJlc2VudHMgYSBmcmFnbWVudCBvZiBtZXNzZW5nZXIgcmlib251Y2xlaWMgYWNpZCwgb3IgbVJOQSwgaW4gdGhlIG1vZGVsLiBUaGUgZnJhZ21lbnRzIGV4aXN0IGZvciBhIHNob3J0XHJcbiAqIHRpbWUgYXMgbVJOQSBpcyBiZWluZyBkZXN0cm95ZWQsIGJ1dCBjYW4ndCBiZSB0cmFuc2xhdGVkLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgTW9oYW1lZCBTYWZpXHJcbiAqIEBhdXRob3IgQWFkaXNoIEd1cHRhXHJcbiAqL1xyXG5cclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIGZyb20gJy4uLy4uL2dlbmVFeHByZXNzaW9uRXNzZW50aWFscy5qcyc7XHJcbmltcG9ydCBNZXNzZW5nZXJSbmFGcmFnbWVudEF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUgZnJvbSAnLi9hdHRhY2htZW50LXN0YXRlLW1hY2hpbmVzL01lc3NlbmdlclJuYUZyYWdtZW50QXR0YWNobWVudFN0YXRlTWFjaGluZS5qcyc7XHJcbmltcG9ydCBTcXVhcmVTZWdtZW50IGZyb20gJy4vU3F1YXJlU2VnbWVudC5qcyc7XHJcbmltcG9ydCBXaW5kaW5nQmlvbW9sZWN1bGUgZnJvbSAnLi9XaW5kaW5nQmlvbW9sZWN1bGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1STkFfV0lORElOR19BTEdPUklUSE1TID0gWyAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCBdO1xyXG5cclxuY2xhc3MgTWVzc2VuZ2VyUm5hRnJhZ21lbnQgZXh0ZW5kcyBXaW5kaW5nQmlvbW9sZWN1bGUge1xyXG5cclxuICAvKipcclxuICAgKiBUaGlzIGNyZWF0ZXMgdGhlIG1STkEgZnJhZ21lbnQgYXMgYSBzaW5nbGUgcG9pbnQsIHdpdGggdGhlIGludGVudGlvbiBvZiBncm93aW5nIGl0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtHZW5lRXhwcmVzc2lvbk1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9zaXRpb25cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHBvc2l0aW9uICkge1xyXG4gICAgc3VwZXIoIG1vZGVsLCBuZXcgU2hhcGUoKS5tb3ZlVG9Qb2ludCggcG9zaXRpb24gKSwgcG9zaXRpb24sIHtcclxuICAgICAgd2luZGluZ1BhcmFtU2V0OiBNUk5BX1dJTkRJTkdfQUxHT1JJVEhNU1sgZG90UmFuZG9tLm5leHRJbnQoIE1STkFfV0lORElOR19BTEdPUklUSE1TLmxlbmd0aCApIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGZpcnN0LCBhbmQgaW4gdGhpcyBjYXNlIG9ubHksIHNlZ21lbnQgdG8gdGhlIHNoYXBlIHNlZ21lbnQgbGlzdC5cclxuICAgIHRoaXMuc2hhcGVTZWdtZW50cy5wdXNoKCBuZXcgU3F1YXJlU2VnbWVudCggdGhpcywgcG9zaXRpb24gKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZSB0aGlzIG1STkEgZnJhZ21lbnQgZnJvbSB0aGUgZGVzdHJveWVyIG1vbGVjdWxlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZWxlYXNlRnJvbURlc3Ryb3llcigpIHtcclxuICAgIHRoaXMuYXR0YWNobWVudFN0YXRlTWFjaGluZS5kZXRhY2goKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIGF0dGFjaG1lbnQgc3RhdGUgbWFjaGluZVxyXG4gICAqIEByZXR1cm5zIHtNZXNzZW5nZXJSbmFGcmFnbWVudEF0dGFjaG1lbnRTdGF0ZU1hY2hpbmV9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNyZWF0ZUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUoKSB7XHJcbiAgICByZXR1cm4gbmV3IE1lc3NlbmdlclJuYUZyYWdtZW50QXR0YWNobWVudFN0YXRlTWFjaGluZSggdGhpcyApO1xyXG4gIH1cclxufVxyXG5cclxuZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLnJlZ2lzdGVyKCAnTWVzc2VuZ2VyUm5hRnJhZ21lbnQnLCBNZXNzZW5nZXJSbmFGcmFnbWVudCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTWVzc2VuZ2VyUm5hRnJhZ21lbnQ7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyx3QkFBd0IsTUFBTSxtQ0FBbUM7QUFDeEUsT0FBT0MsMENBQTBDLE1BQU0sMkVBQTJFO0FBQ2xJLE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFDOUMsT0FBT0Msa0JBQWtCLE1BQU0seUJBQXlCOztBQUV4RDtBQUNBLE1BQU1DLHVCQUF1QixHQUFHLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFFO0FBRWpFLE1BQU1DLG9CQUFvQixTQUFTRixrQkFBa0IsQ0FBQztFQUVwRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUcsV0FBV0EsQ0FBRUMsS0FBSyxFQUFFQyxRQUFRLEVBQUc7SUFDN0IsS0FBSyxDQUFFRCxLQUFLLEVBQUUsSUFBSVIsS0FBSyxDQUFDLENBQUMsQ0FBQ1UsV0FBVyxDQUFFRCxRQUFTLENBQUMsRUFBRUEsUUFBUSxFQUFFO01BQzNERSxlQUFlLEVBQUVOLHVCQUF1QixDQUFFTixTQUFTLENBQUNhLE9BQU8sQ0FBRVAsdUJBQXVCLENBQUNRLE1BQU8sQ0FBQztJQUMvRixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNDLGFBQWEsQ0FBQ0MsSUFBSSxDQUFFLElBQUlaLGFBQWEsQ0FBRSxJQUFJLEVBQUVNLFFBQVMsQ0FBRSxDQUFDO0VBQ2hFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VPLG9CQUFvQkEsQ0FBQSxFQUFHO0lBQ3JCLElBQUksQ0FBQ0Msc0JBQXNCLENBQUNDLE1BQU0sQ0FBQyxDQUFDO0VBQ3RDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsNEJBQTRCQSxDQUFBLEVBQUc7SUFDN0IsT0FBTyxJQUFJakIsMENBQTBDLENBQUUsSUFBSyxDQUFDO0VBQy9EO0FBQ0Y7QUFFQUQsd0JBQXdCLENBQUNtQixRQUFRLENBQUUsc0JBQXNCLEVBQUVkLG9CQUFxQixDQUFDO0FBRWpGLGVBQWVBLG9CQUFvQiJ9