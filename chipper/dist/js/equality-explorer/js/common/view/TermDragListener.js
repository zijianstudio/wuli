// Copyright 2018-2022, University of Colorado Boulder

/**
 * Drag listener for terms, abstract base type.
 *
 * Terminology:
 * - The dragged term is the term that you’re dragging.
 * - The equivalent term is the term on the opposite side that follows along with the dragged term.
 *   It has the same value as the dragged term. For example, if you’re dragging 2x, the equivalent term will also be 2x.
 * - The inverse term is the term that is created on the opposite plate if no equivalent term is already on the plate.
 *   It’s value is the inverse of the equivalent term.  For example, if the equivalent term is 2x, the inverse term
 *   is -2x.  (Inverse term is only relevant for the Numbers and Variables screens. In Operations, the equivalent term
 *   is subtracted from what’s on the plate.)
 * - The opposite plate is the plate associated with the equivalent term, opposite the dragging term.
 *
 * General requirements for the 'lock' feature:
 * - toggling the lock state deletes all terms that are not on the plate (dragging and animating terms)
 * - dragged term and equivalent term are added to plates simultaneously
 * - equivalent term is not interactive
 * - equivalent term has a shadow while dragged term has a shadow
 * - equivalent term does not interact with terms on plate (no sum-to-zero)
 * - inverse term is interactive; interacting with it breaks the association to the equivalent term
 * - equivalent term is chosen from a plate based on dragged term's cell - choose closest
 * - equivalent term is put on the plate based on dragged term's cell - choose closest
 * - inverse term is created on a plate based on term's cell - choose closest
 *
 * NOTE: When a Term is created, events are forward to this drag listener by TermCreatorNode, via
 * DragListener.createForwardingListener. At the time of this writing, that means that fields in SceneryEvent and
 * DragListener will contain invalid values. In SceneryEvent, currentTarget and trail will be specific to the
 * forwarding TermCreatorNode. In DragListener, node, trail, transform and startTransformMatrix fields are invalid.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { DragListener } from '../../../../scenery/js/imports.js';
import equalityExplorer from '../../equalityExplorer.js';
import EqualityExplorerColors from '../EqualityExplorerColors.js';
import EqualityExplorerConstants from '../EqualityExplorerConstants.js';
import EqualityExplorerQueryParameters from '../EqualityExplorerQueryParameters.js';
import SumToZeroNode from './SumToZeroNode.js';
export default class TermDragListener extends DragListener {
  // like term that is overlapped while dragging. null if there is no such term.

  // equivalent term on opposite plate, for lock feature. null if there is no such term.

  // these fields are to improve readability

  /**
   * @param termNode - TermNode that the listener is attached to
   * @param term - the term being dragged
   * @param termCreator - the creator of term
   * @param [providedOptions]
   */
  constructor(termNode, term, termCreator, providedOptions) {
    // Workaround for not being able to use 'this' before calling super in ES6.
    // See https://github.com/phetsims/tasks/issues/1026#issuecomment-594357784
    // eslint-disable-next-line consistent-this
    let self = null;
    const options = optionize()({
      // SelfOptions
      haloRadius: 10,
      pickableWhileAnimating: true,
      // DragListenerOptions
      allowTouchSnag: true,
      start: event => self.doStart(event),
      drag: event => self.doDrag(event),
      end: () => self.doEnd()
    }, providedOptions);
    super(options);

    // Now that we've called super, set self to be an alias for this.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    self = this;
    this.termNode = termNode;
    this.term = term;
    this.termCreator = termCreator;
    this.haloRadius = options.haloRadius;
    this.pickableWhileAnimating = options.pickableWhileAnimating;
    this.likeTerm = null; // {Term|null} like term that is overlapped while dragging
    this.equivalentTerm = null; // {Term|null} equivalent term on opposite plate, for lock feature

    // to improve readability
    this.equivalentTermCreator = termCreator.equivalentTermCreator;
    assert && assert(this.equivalentTermCreator);
    this.plate = termCreator.plate;
    this.oppositePlate = this.equivalentTermCreator.plate;

    // Equivalent term tracks the movement of the dragged term throughout the drag cycle and post-drag animation.
    const positionListener = position => {
      if (this.equivalentTerm && !this.equivalentTerm.isDisposed) {
        this.equivalentTerm.moveTo(termCreator.getEquivalentTermPosition(term));
      }
    };
    term.positionProperty.link(positionListener); // unlink required in dispose

    // When the plate moves, or its contents change, refresh the halos around overlapping terms.
    const refreshHalosBound = this.refreshHalos.bind(this);
    this.plate.positionProperty.link(refreshHalosBound); // unlink required in dispose
    this.plate.contentsChangedEmitter.addListener(refreshHalosBound); // removeListener required in dispose

    this.disposeTermDragListener = () => {
      if (term.positionProperty.hasListener(positionListener)) {
        term.positionProperty.unlink(positionListener);
      }
      if (this.plate.positionProperty.hasListener(refreshHalosBound)) {
        this.plate.positionProperty.unlink(refreshHalosBound);
      }
      if (this.plate.contentsChangedEmitter.hasListener(refreshHalosBound)) {
        this.plate.contentsChangedEmitter.removeListener(refreshHalosBound);
      }
    };
  }
  dispose() {
    this.disposeTermDragListener();
    super.dispose();
  }

  /**
   * Called at the start of a drag cycle, on pointer down.
   */
  doStart(event) {
    let success = true;
    if (this.termCreator.isTermOnPlate(this.term)) {
      if (this.termCreator.lockedProperty.value) {
        success = this.startOpposite();
      }
      if (success) {
        this.termCreator.removeTermFromPlate(this.term);
      }
    } else if (!this.term.isAnimating()) {
      // term came from toolbox. If lock is enabled, create an equivalent term on other side of the scale.
      if (this.termCreator.lockedProperty.value) {
        this.equivalentTerm = this.equivalentTermCreator.createTerm(this.term.copyOptions());
      }
    }
    if (success) {
      assert && assert(this.equivalentTerm || !this.termCreator.lockedProperty.value, 'lock is on, equivalentTerm expected');

      // move the term a bit, so it's obvious that we're interacting with it
      this.term.moveTo(this.eventToPosition(event));

      // set term properties at beginning of drag
      this.term.draggingProperty.value = true;
      this.term.shadowVisibleProperty.value = true;
      if (this.equivalentTerm && !this.equivalentTerm.isDisposed) {
        this.equivalentTerm.shadowVisibleProperty.value = true;
        this.equivalentTerm.pickableProperty.value = false;
      }

      // move the node we're dragging to the foreground
      this.termNode.moveToFront();
      this.refreshHalos();
    }
  }

  /**
   * Called while termNode is being dragged.
   * NOTE: This is named doDrag so that it does not override super.drag.
   */
  doDrag(event) {
    // move the term
    this.term.moveTo(this.eventToPosition(event));

    // refresh the halos that appear when dragged term overlaps with an inverse term
    this.refreshHalos();
  }

  /**
   * Called at the end of a drag cycle, on pointer up.
   */
  doEnd() {
    // set term Properties at end of drag
    this.term.draggingProperty.value = false;
    this.term.shadowVisibleProperty.value = false;
    if (this.equivalentTerm && !this.equivalentTerm.isDisposed) {
      this.equivalentTerm.shadowVisibleProperty.value = false;
    }
    if (this.equivalentTerm && !this.termCreator.combineLikeTermsEnabled && this.oppositePlate.isFull()) {
      // there's no place to put equivalentTerm, the opposite plate is full
      this.refreshHalos();
      this.animateToToolbox();
    } else if (this.likeTerm && this.term.isInverseTerm(this.likeTerm)) {
      // overlapping terms sum to zero
      const sumToZeroParent = this.termNode.getParent();
      assert && assert(sumToZeroParent);
      const sumToZeroNode = new SumToZeroNode({
        //TODO https://github.com/phetsims/equality-explorer/issues/200 dynamic
        variable: this.term.getVariable(),
        haloRadius: this.haloRadius,
        haloBaseColor: EqualityExplorerColors.HALO,
        // show the halo
        fontSize: this.termCreator.combineLikeTermsEnabled ? EqualityExplorerConstants.SUM_TO_ZERO_BIG_FONT_SIZE : EqualityExplorerConstants.SUM_TO_ZERO_SMALL_FONT_SIZE
      });
      const sumToZeroCell = this.plate.getCellForTerm(this.likeTerm);
      assert && assert(sumToZeroCell !== null);

      // dispose of terms that sum to zero
      !this.term.isDisposed && this.term.dispose();
      !this.likeTerm.isDisposed && this.likeTerm.dispose();
      this.likeTerm = null;

      // put equivalent term on opposite plate
      let oppositeSumToZeroNode; // {SumToZeroNode|undefined} defined if terms on the opposite plate sum to zero
      if (this.equivalentTerm) {
        oppositeSumToZeroNode = this.endOpposite();
        if (this.equivalentTerm && !this.equivalentTerm.isDisposed) {
          this.equivalentTerm.pickableProperty.value = true;
        }
        this.equivalentTerm = null;
      }

      // Do sum-to-zero animations after addressing both plates, so that plates have moved to their final position.
      sumToZeroParent.addChild(sumToZeroNode);
      sumToZeroNode.center = this.plate.getPositionOfCell(sumToZeroCell);
      sumToZeroNode.startAnimation();
      if (oppositeSumToZeroNode) {
        sumToZeroParent.addChild(oppositeSumToZeroNode);
        oppositeSumToZeroNode.center = this.oppositePlate.getPositionOfCell(sumToZeroCell);
        oppositeSumToZeroNode.startAnimation();
      }
    } else if (!this.term.onPlateProperty.value) {
      if (this.term.positionProperty.value.y > this.plate.positionProperty.value.y + EqualityExplorerQueryParameters.plateYOffset) {
        // term was released below the plate, animate back to toolbox
        this.animateToToolbox();
      } else {
        // term was released above the plate, animate to the plate
        this.animateToPlate();
      }
    }
  }

  /**
   * Returns terms to the toolboxes where they were created.
   */
  animateToToolbox() {
    assert && assert(this.term.toolboxPosition, `toolboxPosition was not initialized for term: ${this.term}`);
    this.term.pickableProperty.value = this.pickableWhileAnimating;
    const toolboxPosition = this.term.toolboxPosition;
    assert && assert(toolboxPosition);
    this.term.animateTo(toolboxPosition, {
      animationCompletedCallback: () => {
        // dispose of terms when they reach the toolbox
        !this.term.isDisposed && this.term.dispose();
        if (this.equivalentTerm) {
          !this.equivalentTerm.isDisposed && this.equivalentTerm.dispose();
          this.equivalentTerm = null;
        }
      }
    });
  }

  /**
   * Converts an event to a model position with some offset, constrained to the drag bounds.
   * This is used at the start of a drag cycle to position termNode relative to the pointer.
   */
  eventToPosition(event) {
    // move bottom-center of termNode to pointer position
    const dx = 0;
    const dy = this.termNode.contentNodeSize.height / 2;
    const position = this.termNode.globalToParentPoint(event.pointer.point).minusXY(dx, dy);

    // constrain to drag bounds
    return this.term.dragBounds.closestPointTo(position);
  }

  /**
   * Refreshes the visual feedback (yellow halo) that is provided when a dragged term overlaps
   * a like term that is on the scale. This has the side-effect of setting this.likeTerm.
   * See https://github.com/phetsims/equality-explorer/issues/17
   */
  refreshHalos() {
    // Bail if this drag listener is not currently active, for example when 2 terms are locked together
    // and only one of them is being dragged. See https://github.com/phetsims/equality-explorer/issues/96
    if (!this.term.pickableProperty.value) {
      return;
    }
    if (this.term.draggingProperty.value) {
      const previousLikeTerm = this.likeTerm;
      this.likeTerm = null;

      // does this term overlap a like term on the plate?
      const termOnPlate = this.plate.getTermAtPosition(this.term.positionProperty.value);
      if (termOnPlate && termOnPlate.isLikeTerm(this.term)) {
        this.likeTerm = termOnPlate;
      }

      // if the like term is new, then clean up previous like term
      if (previousLikeTerm && !previousLikeTerm.isDisposed && previousLikeTerm !== this.likeTerm) {
        previousLikeTerm.haloVisibleProperty.value = false;
      }
      if (this.likeTerm && (this.termCreator.combineLikeTermsEnabled || this.term.isInverseTerm(this.likeTerm))) {
        // terms will combine, show halo for term and likeTerm
        if (!this.term.isDisposed) {
          this.term.shadowVisibleProperty.value = false;
          this.term.haloVisibleProperty.value = true;
        }
        if (!this.likeTerm.isDisposed) {
          this.likeTerm.haloVisibleProperty.value = true;
        }
      } else if (!this.term.isDisposed) {
        // term will not combine
        this.term.shadowVisibleProperty.value = true;
        this.term.haloVisibleProperty.value = false;
      }
    } else {
      if (!this.term.isDisposed) {
        this.term.shadowVisibleProperty.value = false;
        this.term.haloVisibleProperty.value = false;
      }
      if (this.likeTerm && !this.likeTerm.isDisposed) {
        this.likeTerm.haloVisibleProperty.value = false;
      }
    }
  }

  /**
   * Called at the start of a drag cycle, when lock is on, to handle related terms on the opposite side.
   * @returns true=success, false=failure
   */

  /**
   * Called at the end of a drag cycle, when lock is on, to handle related terms on the opposite side.
   * @returns non-null if the drag results in terms on the opposite plate summing to zero
   */

  /**
   * Animates term to plates.
   */
}

equalityExplorer.register('TermDragListener', TermDragListener);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJEcmFnTGlzdGVuZXIiLCJlcXVhbGl0eUV4cGxvcmVyIiwiRXF1YWxpdHlFeHBsb3JlckNvbG9ycyIsIkVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMiLCJFcXVhbGl0eUV4cGxvcmVyUXVlcnlQYXJhbWV0ZXJzIiwiU3VtVG9aZXJvTm9kZSIsIlRlcm1EcmFnTGlzdGVuZXIiLCJjb25zdHJ1Y3RvciIsInRlcm1Ob2RlIiwidGVybSIsInRlcm1DcmVhdG9yIiwicHJvdmlkZWRPcHRpb25zIiwic2VsZiIsIm9wdGlvbnMiLCJoYWxvUmFkaXVzIiwicGlja2FibGVXaGlsZUFuaW1hdGluZyIsImFsbG93VG91Y2hTbmFnIiwic3RhcnQiLCJldmVudCIsImRvU3RhcnQiLCJkcmFnIiwiZG9EcmFnIiwiZW5kIiwiZG9FbmQiLCJsaWtlVGVybSIsImVxdWl2YWxlbnRUZXJtIiwiZXF1aXZhbGVudFRlcm1DcmVhdG9yIiwiYXNzZXJ0IiwicGxhdGUiLCJvcHBvc2l0ZVBsYXRlIiwicG9zaXRpb25MaXN0ZW5lciIsInBvc2l0aW9uIiwiaXNEaXNwb3NlZCIsIm1vdmVUbyIsImdldEVxdWl2YWxlbnRUZXJtUG9zaXRpb24iLCJwb3NpdGlvblByb3BlcnR5IiwibGluayIsInJlZnJlc2hIYWxvc0JvdW5kIiwicmVmcmVzaEhhbG9zIiwiYmluZCIsImNvbnRlbnRzQ2hhbmdlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImRpc3Bvc2VUZXJtRHJhZ0xpc3RlbmVyIiwiaGFzTGlzdGVuZXIiLCJ1bmxpbmsiLCJyZW1vdmVMaXN0ZW5lciIsImRpc3Bvc2UiLCJzdWNjZXNzIiwiaXNUZXJtT25QbGF0ZSIsImxvY2tlZFByb3BlcnR5IiwidmFsdWUiLCJzdGFydE9wcG9zaXRlIiwicmVtb3ZlVGVybUZyb21QbGF0ZSIsImlzQW5pbWF0aW5nIiwiY3JlYXRlVGVybSIsImNvcHlPcHRpb25zIiwiZXZlbnRUb1Bvc2l0aW9uIiwiZHJhZ2dpbmdQcm9wZXJ0eSIsInNoYWRvd1Zpc2libGVQcm9wZXJ0eSIsInBpY2thYmxlUHJvcGVydHkiLCJtb3ZlVG9Gcm9udCIsImNvbWJpbmVMaWtlVGVybXNFbmFibGVkIiwiaXNGdWxsIiwiYW5pbWF0ZVRvVG9vbGJveCIsImlzSW52ZXJzZVRlcm0iLCJzdW1Ub1plcm9QYXJlbnQiLCJnZXRQYXJlbnQiLCJzdW1Ub1plcm9Ob2RlIiwidmFyaWFibGUiLCJnZXRWYXJpYWJsZSIsImhhbG9CYXNlQ29sb3IiLCJIQUxPIiwiZm9udFNpemUiLCJTVU1fVE9fWkVST19CSUdfRk9OVF9TSVpFIiwiU1VNX1RPX1pFUk9fU01BTExfRk9OVF9TSVpFIiwic3VtVG9aZXJvQ2VsbCIsImdldENlbGxGb3JUZXJtIiwib3Bwb3NpdGVTdW1Ub1plcm9Ob2RlIiwiZW5kT3Bwb3NpdGUiLCJhZGRDaGlsZCIsImNlbnRlciIsImdldFBvc2l0aW9uT2ZDZWxsIiwic3RhcnRBbmltYXRpb24iLCJvblBsYXRlUHJvcGVydHkiLCJ5IiwicGxhdGVZT2Zmc2V0IiwiYW5pbWF0ZVRvUGxhdGUiLCJ0b29sYm94UG9zaXRpb24iLCJhbmltYXRlVG8iLCJhbmltYXRpb25Db21wbGV0ZWRDYWxsYmFjayIsImR4IiwiZHkiLCJjb250ZW50Tm9kZVNpemUiLCJoZWlnaHQiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwicG9pbnRlciIsInBvaW50IiwibWludXNYWSIsImRyYWdCb3VuZHMiLCJjbG9zZXN0UG9pbnRUbyIsInByZXZpb3VzTGlrZVRlcm0iLCJ0ZXJtT25QbGF0ZSIsImdldFRlcm1BdFBvc2l0aW9uIiwiaXNMaWtlVGVybSIsImhhbG9WaXNpYmxlUHJvcGVydHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRlcm1EcmFnTGlzdGVuZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRHJhZyBsaXN0ZW5lciBmb3IgdGVybXMsIGFic3RyYWN0IGJhc2UgdHlwZS5cclxuICpcclxuICogVGVybWlub2xvZ3k6XHJcbiAqIC0gVGhlIGRyYWdnZWQgdGVybSBpcyB0aGUgdGVybSB0aGF0IHlvdeKAmXJlIGRyYWdnaW5nLlxyXG4gKiAtIFRoZSBlcXVpdmFsZW50IHRlcm0gaXMgdGhlIHRlcm0gb24gdGhlIG9wcG9zaXRlIHNpZGUgdGhhdCBmb2xsb3dzIGFsb25nIHdpdGggdGhlIGRyYWdnZWQgdGVybS5cclxuICogICBJdCBoYXMgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIGRyYWdnZWQgdGVybS4gRm9yIGV4YW1wbGUsIGlmIHlvdeKAmXJlIGRyYWdnaW5nIDJ4LCB0aGUgZXF1aXZhbGVudCB0ZXJtIHdpbGwgYWxzbyBiZSAyeC5cclxuICogLSBUaGUgaW52ZXJzZSB0ZXJtIGlzIHRoZSB0ZXJtIHRoYXQgaXMgY3JlYXRlZCBvbiB0aGUgb3Bwb3NpdGUgcGxhdGUgaWYgbm8gZXF1aXZhbGVudCB0ZXJtIGlzIGFscmVhZHkgb24gdGhlIHBsYXRlLlxyXG4gKiAgIEl04oCZcyB2YWx1ZSBpcyB0aGUgaW52ZXJzZSBvZiB0aGUgZXF1aXZhbGVudCB0ZXJtLiAgRm9yIGV4YW1wbGUsIGlmIHRoZSBlcXVpdmFsZW50IHRlcm0gaXMgMngsIHRoZSBpbnZlcnNlIHRlcm1cclxuICogICBpcyAtMnguICAoSW52ZXJzZSB0ZXJtIGlzIG9ubHkgcmVsZXZhbnQgZm9yIHRoZSBOdW1iZXJzIGFuZCBWYXJpYWJsZXMgc2NyZWVucy4gSW4gT3BlcmF0aW9ucywgdGhlIGVxdWl2YWxlbnQgdGVybVxyXG4gKiAgIGlzIHN1YnRyYWN0ZWQgZnJvbSB3aGF04oCZcyBvbiB0aGUgcGxhdGUuKVxyXG4gKiAtIFRoZSBvcHBvc2l0ZSBwbGF0ZSBpcyB0aGUgcGxhdGUgYXNzb2NpYXRlZCB3aXRoIHRoZSBlcXVpdmFsZW50IHRlcm0sIG9wcG9zaXRlIHRoZSBkcmFnZ2luZyB0ZXJtLlxyXG4gKlxyXG4gKiBHZW5lcmFsIHJlcXVpcmVtZW50cyBmb3IgdGhlICdsb2NrJyBmZWF0dXJlOlxyXG4gKiAtIHRvZ2dsaW5nIHRoZSBsb2NrIHN0YXRlIGRlbGV0ZXMgYWxsIHRlcm1zIHRoYXQgYXJlIG5vdCBvbiB0aGUgcGxhdGUgKGRyYWdnaW5nIGFuZCBhbmltYXRpbmcgdGVybXMpXHJcbiAqIC0gZHJhZ2dlZCB0ZXJtIGFuZCBlcXVpdmFsZW50IHRlcm0gYXJlIGFkZGVkIHRvIHBsYXRlcyBzaW11bHRhbmVvdXNseVxyXG4gKiAtIGVxdWl2YWxlbnQgdGVybSBpcyBub3QgaW50ZXJhY3RpdmVcclxuICogLSBlcXVpdmFsZW50IHRlcm0gaGFzIGEgc2hhZG93IHdoaWxlIGRyYWdnZWQgdGVybSBoYXMgYSBzaGFkb3dcclxuICogLSBlcXVpdmFsZW50IHRlcm0gZG9lcyBub3QgaW50ZXJhY3Qgd2l0aCB0ZXJtcyBvbiBwbGF0ZSAobm8gc3VtLXRvLXplcm8pXHJcbiAqIC0gaW52ZXJzZSB0ZXJtIGlzIGludGVyYWN0aXZlOyBpbnRlcmFjdGluZyB3aXRoIGl0IGJyZWFrcyB0aGUgYXNzb2NpYXRpb24gdG8gdGhlIGVxdWl2YWxlbnQgdGVybVxyXG4gKiAtIGVxdWl2YWxlbnQgdGVybSBpcyBjaG9zZW4gZnJvbSBhIHBsYXRlIGJhc2VkIG9uIGRyYWdnZWQgdGVybSdzIGNlbGwgLSBjaG9vc2UgY2xvc2VzdFxyXG4gKiAtIGVxdWl2YWxlbnQgdGVybSBpcyBwdXQgb24gdGhlIHBsYXRlIGJhc2VkIG9uIGRyYWdnZWQgdGVybSdzIGNlbGwgLSBjaG9vc2UgY2xvc2VzdFxyXG4gKiAtIGludmVyc2UgdGVybSBpcyBjcmVhdGVkIG9uIGEgcGxhdGUgYmFzZWQgb24gdGVybSdzIGNlbGwgLSBjaG9vc2UgY2xvc2VzdFxyXG4gKlxyXG4gKiBOT1RFOiBXaGVuIGEgVGVybSBpcyBjcmVhdGVkLCBldmVudHMgYXJlIGZvcndhcmQgdG8gdGhpcyBkcmFnIGxpc3RlbmVyIGJ5IFRlcm1DcmVhdG9yTm9kZSwgdmlhXHJcbiAqIERyYWdMaXN0ZW5lci5jcmVhdGVGb3J3YXJkaW5nTGlzdGVuZXIuIEF0IHRoZSB0aW1lIG9mIHRoaXMgd3JpdGluZywgdGhhdCBtZWFucyB0aGF0IGZpZWxkcyBpbiBTY2VuZXJ5RXZlbnQgYW5kXHJcbiAqIERyYWdMaXN0ZW5lciB3aWxsIGNvbnRhaW4gaW52YWxpZCB2YWx1ZXMuIEluIFNjZW5lcnlFdmVudCwgY3VycmVudFRhcmdldCBhbmQgdHJhaWwgd2lsbCBiZSBzcGVjaWZpYyB0byB0aGVcclxuICogZm9yd2FyZGluZyBUZXJtQ3JlYXRvck5vZGUuIEluIERyYWdMaXN0ZW5lciwgbm9kZSwgdHJhaWwsIHRyYW5zZm9ybSBhbmQgc3RhcnRUcmFuc2Zvcm1NYXRyaXggZmllbGRzIGFyZSBpbnZhbGlkLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgRHJhZ0xpc3RlbmVyLCBEcmFnTGlzdGVuZXJPcHRpb25zLCBQcmVzc2VkRHJhZ0xpc3RlbmVyLCBQcmVzc0xpc3RlbmVyRXZlbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZXF1YWxpdHlFeHBsb3JlciBmcm9tICcuLi8uLi9lcXVhbGl0eUV4cGxvcmVyLmpzJztcclxuaW1wb3J0IEVxdWFsaXR5RXhwbG9yZXJDb2xvcnMgZnJvbSAnLi4vRXF1YWxpdHlFeHBsb3JlckNvbG9ycy5qcyc7XHJcbmltcG9ydCBFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzIGZyb20gJy4uL0VxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRXF1YWxpdHlFeHBsb3JlclF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9FcXVhbGl0eUV4cGxvcmVyUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IFBsYXRlIGZyb20gJy4uL21vZGVsL1BsYXRlLmpzJztcclxuaW1wb3J0IFRlcm0gZnJvbSAnLi4vbW9kZWwvVGVybS5qcyc7XHJcbmltcG9ydCBUZXJtQ3JlYXRvciBmcm9tICcuLi9tb2RlbC9UZXJtQ3JlYXRvci5qcyc7XHJcbmltcG9ydCBTdW1Ub1plcm9Ob2RlIGZyb20gJy4vU3VtVG9aZXJvTm9kZS5qcyc7XHJcbmltcG9ydCBUZXJtTm9kZSBmcm9tICcuL1Rlcm1Ob2RlLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgaGFsb1JhZGl1cz86IG51bWJlcjsgLy8gcmFkaXVzIG9mIHRoZSBoYWxvIGFyb3VuZCB0ZXJtcyB0aGF0IHN1bSB0byB6ZXJvXHJcbiAgcGlja2FibGVXaGlsZUFuaW1hdGluZz86IGJvb2xlYW47IC8vIGlzIHRlcm1Ob2RlIHBpY2thYmxlIHdoaWxlIHRlcm0gaXMgYW5pbWF0aW5nP1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgVGVybURyYWdMaXN0ZW5lck9wdGlvbnMgPSBTZWxmT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIFRlcm1EcmFnTGlzdGVuZXIgZXh0ZW5kcyBEcmFnTGlzdGVuZXIge1xyXG5cclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgdGVybU5vZGU6IFRlcm1Ob2RlO1xyXG4gIHByb3RlY3RlZCByZWFkb25seSB0ZXJtOiBUZXJtO1xyXG4gIHByb3RlY3RlZCByZWFkb25seSB0ZXJtQ3JlYXRvcjogVGVybUNyZWF0b3I7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGhhbG9SYWRpdXM6IG51bWJlcjtcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgcGlja2FibGVXaGlsZUFuaW1hdGluZzogYm9vbGVhbjtcclxuXHJcbiAgLy8gbGlrZSB0ZXJtIHRoYXQgaXMgb3ZlcmxhcHBlZCB3aGlsZSBkcmFnZ2luZy4gbnVsbCBpZiB0aGVyZSBpcyBubyBzdWNoIHRlcm0uXHJcbiAgcHJvdGVjdGVkIGxpa2VUZXJtOiBUZXJtIHwgbnVsbDtcclxuXHJcbiAgLy8gZXF1aXZhbGVudCB0ZXJtIG9uIG9wcG9zaXRlIHBsYXRlLCBmb3IgbG9jayBmZWF0dXJlLiBudWxsIGlmIHRoZXJlIGlzIG5vIHN1Y2ggdGVybS5cclxuICBwcm90ZWN0ZWQgZXF1aXZhbGVudFRlcm06IFRlcm0gfCBudWxsO1xyXG5cclxuICAvLyB0aGVzZSBmaWVsZHMgYXJlIHRvIGltcHJvdmUgcmVhZGFiaWxpdHlcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgcGxhdGU6IFBsYXRlO1xyXG4gIHByb3RlY3RlZCByZWFkb25seSBvcHBvc2l0ZVBsYXRlOiBQbGF0ZTtcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZXF1aXZhbGVudFRlcm1DcmVhdG9yOiBUZXJtQ3JlYXRvcjtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlVGVybURyYWdMaXN0ZW5lcjogKCkgPT4gdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHRlcm1Ob2RlIC0gVGVybU5vZGUgdGhhdCB0aGUgbGlzdGVuZXIgaXMgYXR0YWNoZWQgdG9cclxuICAgKiBAcGFyYW0gdGVybSAtIHRoZSB0ZXJtIGJlaW5nIGRyYWdnZWRcclxuICAgKiBAcGFyYW0gdGVybUNyZWF0b3IgLSB0aGUgY3JlYXRvciBvZiB0ZXJtXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCB0ZXJtTm9kZTogVGVybU5vZGUsIHRlcm06IFRlcm0sIHRlcm1DcmVhdG9yOiBUZXJtQ3JlYXRvciwgcHJvdmlkZWRPcHRpb25zPzogVGVybURyYWdMaXN0ZW5lck9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gV29ya2Fyb3VuZCBmb3Igbm90IGJlaW5nIGFibGUgdG8gdXNlICd0aGlzJyBiZWZvcmUgY2FsbGluZyBzdXBlciBpbiBFUzYuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Rhc2tzL2lzc3Vlcy8xMDI2I2lzc3VlY29tbWVudC01OTQzNTc3ODRcclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXRoaXNcclxuICAgIGxldCBzZWxmOiBUZXJtRHJhZ0xpc3RlbmVyIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxUZXJtRHJhZ0xpc3RlbmVyT3B0aW9ucywgU2VsZk9wdGlvbnMsIERyYWdMaXN0ZW5lck9wdGlvbnM8UHJlc3NlZERyYWdMaXN0ZW5lcj4+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIGhhbG9SYWRpdXM6IDEwLFxyXG4gICAgICBwaWNrYWJsZVdoaWxlQW5pbWF0aW5nOiB0cnVlLFxyXG5cclxuICAgICAgLy8gRHJhZ0xpc3RlbmVyT3B0aW9uc1xyXG4gICAgICBhbGxvd1RvdWNoU25hZzogdHJ1ZSxcclxuICAgICAgc3RhcnQ6ICggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApID0+IHNlbGYhLmRvU3RhcnQoIGV2ZW50ICksXHJcbiAgICAgIGRyYWc6ICggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApID0+IHNlbGYhLmRvRHJhZyggZXZlbnQgKSxcclxuICAgICAgZW5kOiAoKSA9PiBzZWxmIS5kb0VuZCgpXHJcblxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBOb3cgdGhhdCB3ZSd2ZSBjYWxsZWQgc3VwZXIsIHNldCBzZWxmIHRvIGJlIGFuIGFsaWFzIGZvciB0aGlzLlxyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXHJcbiAgICBzZWxmID0gdGhpcztcclxuXHJcbiAgICB0aGlzLnRlcm1Ob2RlID0gdGVybU5vZGU7XHJcbiAgICB0aGlzLnRlcm0gPSB0ZXJtO1xyXG4gICAgdGhpcy50ZXJtQ3JlYXRvciA9IHRlcm1DcmVhdG9yO1xyXG4gICAgdGhpcy5oYWxvUmFkaXVzID0gb3B0aW9ucy5oYWxvUmFkaXVzO1xyXG4gICAgdGhpcy5waWNrYWJsZVdoaWxlQW5pbWF0aW5nID0gb3B0aW9ucy5waWNrYWJsZVdoaWxlQW5pbWF0aW5nO1xyXG4gICAgdGhpcy5saWtlVGVybSA9IG51bGw7IC8vIHtUZXJtfG51bGx9IGxpa2UgdGVybSB0aGF0IGlzIG92ZXJsYXBwZWQgd2hpbGUgZHJhZ2dpbmdcclxuICAgIHRoaXMuZXF1aXZhbGVudFRlcm0gPSBudWxsOyAvLyB7VGVybXxudWxsfSBlcXVpdmFsZW50IHRlcm0gb24gb3Bwb3NpdGUgcGxhdGUsIGZvciBsb2NrIGZlYXR1cmVcclxuXHJcbiAgICAvLyB0byBpbXByb3ZlIHJlYWRhYmlsaXR5XHJcbiAgICB0aGlzLmVxdWl2YWxlbnRUZXJtQ3JlYXRvciA9IHRlcm1DcmVhdG9yLmVxdWl2YWxlbnRUZXJtQ3JlYXRvciE7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmVxdWl2YWxlbnRUZXJtQ3JlYXRvciApO1xyXG4gICAgdGhpcy5wbGF0ZSA9IHRlcm1DcmVhdG9yLnBsYXRlO1xyXG4gICAgdGhpcy5vcHBvc2l0ZVBsYXRlID0gdGhpcy5lcXVpdmFsZW50VGVybUNyZWF0b3IucGxhdGU7XHJcblxyXG4gICAgLy8gRXF1aXZhbGVudCB0ZXJtIHRyYWNrcyB0aGUgbW92ZW1lbnQgb2YgdGhlIGRyYWdnZWQgdGVybSB0aHJvdWdob3V0IHRoZSBkcmFnIGN5Y2xlIGFuZCBwb3N0LWRyYWcgYW5pbWF0aW9uLlxyXG4gICAgY29uc3QgcG9zaXRpb25MaXN0ZW5lciA9ICggcG9zaXRpb246IFZlY3RvcjIgKSA9PiB7XHJcbiAgICAgIGlmICggdGhpcy5lcXVpdmFsZW50VGVybSAmJiAhdGhpcy5lcXVpdmFsZW50VGVybS5pc0Rpc3Bvc2VkICkge1xyXG4gICAgICAgIHRoaXMuZXF1aXZhbGVudFRlcm0ubW92ZVRvKCB0ZXJtQ3JlYXRvci5nZXRFcXVpdmFsZW50VGVybVBvc2l0aW9uKCB0ZXJtICkgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRlcm0ucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBwb3NpdGlvbkxpc3RlbmVyICk7IC8vIHVubGluayByZXF1aXJlZCBpbiBkaXNwb3NlXHJcblxyXG4gICAgLy8gV2hlbiB0aGUgcGxhdGUgbW92ZXMsIG9yIGl0cyBjb250ZW50cyBjaGFuZ2UsIHJlZnJlc2ggdGhlIGhhbG9zIGFyb3VuZCBvdmVybGFwcGluZyB0ZXJtcy5cclxuICAgIGNvbnN0IHJlZnJlc2hIYWxvc0JvdW5kID0gdGhpcy5yZWZyZXNoSGFsb3MuYmluZCggdGhpcyApO1xyXG4gICAgdGhpcy5wbGF0ZS5wb3NpdGlvblByb3BlcnR5LmxpbmsoIHJlZnJlc2hIYWxvc0JvdW5kICk7IC8vIHVubGluayByZXF1aXJlZCBpbiBkaXNwb3NlXHJcbiAgICB0aGlzLnBsYXRlLmNvbnRlbnRzQ2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHJlZnJlc2hIYWxvc0JvdW5kICk7IC8vIHJlbW92ZUxpc3RlbmVyIHJlcXVpcmVkIGluIGRpc3Bvc2VcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VUZXJtRHJhZ0xpc3RlbmVyID0gKCkgPT4ge1xyXG5cclxuICAgICAgaWYgKCB0ZXJtLnBvc2l0aW9uUHJvcGVydHkuaGFzTGlzdGVuZXIoIHBvc2l0aW9uTGlzdGVuZXIgKSApIHtcclxuICAgICAgICB0ZXJtLnBvc2l0aW9uUHJvcGVydHkudW5saW5rKCBwb3NpdGlvbkxpc3RlbmVyICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggdGhpcy5wbGF0ZS5wb3NpdGlvblByb3BlcnR5Lmhhc0xpc3RlbmVyKCByZWZyZXNoSGFsb3NCb3VuZCApICkge1xyXG4gICAgICAgIHRoaXMucGxhdGUucG9zaXRpb25Qcm9wZXJ0eS51bmxpbmsoIHJlZnJlc2hIYWxvc0JvdW5kICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggdGhpcy5wbGF0ZS5jb250ZW50c0NoYW5nZWRFbWl0dGVyLmhhc0xpc3RlbmVyKCByZWZyZXNoSGFsb3NCb3VuZCApICkge1xyXG4gICAgICAgIHRoaXMucGxhdGUuY29udGVudHNDaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggcmVmcmVzaEhhbG9zQm91bmQgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlVGVybURyYWdMaXN0ZW5lcigpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGF0IHRoZSBzdGFydCBvZiBhIGRyYWcgY3ljbGUsIG9uIHBvaW50ZXIgZG93bi5cclxuICAgKi9cclxuICBwcml2YXRlIGRvU3RhcnQoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XHJcblxyXG4gICAgbGV0IHN1Y2Nlc3MgPSB0cnVlO1xyXG5cclxuICAgIGlmICggdGhpcy50ZXJtQ3JlYXRvci5pc1Rlcm1PblBsYXRlKCB0aGlzLnRlcm0gKSApIHtcclxuXHJcbiAgICAgIGlmICggdGhpcy50ZXJtQ3JlYXRvci5sb2NrZWRQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICBzdWNjZXNzID0gdGhpcy5zdGFydE9wcG9zaXRlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggc3VjY2VzcyApIHtcclxuICAgICAgICB0aGlzLnRlcm1DcmVhdG9yLnJlbW92ZVRlcm1Gcm9tUGxhdGUoIHRoaXMudGVybSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggIXRoaXMudGVybS5pc0FuaW1hdGluZygpICkge1xyXG5cclxuICAgICAgLy8gdGVybSBjYW1lIGZyb20gdG9vbGJveC4gSWYgbG9jayBpcyBlbmFibGVkLCBjcmVhdGUgYW4gZXF1aXZhbGVudCB0ZXJtIG9uIG90aGVyIHNpZGUgb2YgdGhlIHNjYWxlLlxyXG4gICAgICBpZiAoIHRoaXMudGVybUNyZWF0b3IubG9ja2VkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5lcXVpdmFsZW50VGVybSA9IHRoaXMuZXF1aXZhbGVudFRlcm1DcmVhdG9yLmNyZWF0ZVRlcm0oIHRoaXMudGVybS5jb3B5T3B0aW9ucygpICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHN1Y2Nlc3MgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZXF1aXZhbGVudFRlcm0gfHwgIXRoaXMudGVybUNyZWF0b3IubG9ja2VkUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgJ2xvY2sgaXMgb24sIGVxdWl2YWxlbnRUZXJtIGV4cGVjdGVkJyApO1xyXG5cclxuICAgICAgLy8gbW92ZSB0aGUgdGVybSBhIGJpdCwgc28gaXQncyBvYnZpb3VzIHRoYXQgd2UncmUgaW50ZXJhY3Rpbmcgd2l0aCBpdFxyXG4gICAgICB0aGlzLnRlcm0ubW92ZVRvKCB0aGlzLmV2ZW50VG9Qb3NpdGlvbiggZXZlbnQgKSApO1xyXG5cclxuICAgICAgLy8gc2V0IHRlcm0gcHJvcGVydGllcyBhdCBiZWdpbm5pbmcgb2YgZHJhZ1xyXG4gICAgICB0aGlzLnRlcm0uZHJhZ2dpbmdQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgIHRoaXMudGVybS5zaGFkb3dWaXNpYmxlUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICBpZiAoIHRoaXMuZXF1aXZhbGVudFRlcm0gJiYgIXRoaXMuZXF1aXZhbGVudFRlcm0uaXNEaXNwb3NlZCApIHtcclxuICAgICAgICB0aGlzLmVxdWl2YWxlbnRUZXJtLnNoYWRvd1Zpc2libGVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5lcXVpdmFsZW50VGVybS5waWNrYWJsZVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG1vdmUgdGhlIG5vZGUgd2UncmUgZHJhZ2dpbmcgdG8gdGhlIGZvcmVncm91bmRcclxuICAgICAgdGhpcy50ZXJtTm9kZS5tb3ZlVG9Gcm9udCgpO1xyXG5cclxuICAgICAgdGhpcy5yZWZyZXNoSGFsb3MoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGlsZSB0ZXJtTm9kZSBpcyBiZWluZyBkcmFnZ2VkLlxyXG4gICAqIE5PVEU6IFRoaXMgaXMgbmFtZWQgZG9EcmFnIHNvIHRoYXQgaXQgZG9lcyBub3Qgb3ZlcnJpZGUgc3VwZXIuZHJhZy5cclxuICAgKi9cclxuICBwcml2YXRlIGRvRHJhZyggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBtb3ZlIHRoZSB0ZXJtXHJcbiAgICB0aGlzLnRlcm0ubW92ZVRvKCB0aGlzLmV2ZW50VG9Qb3NpdGlvbiggZXZlbnQgKSApO1xyXG5cclxuICAgIC8vIHJlZnJlc2ggdGhlIGhhbG9zIHRoYXQgYXBwZWFyIHdoZW4gZHJhZ2dlZCB0ZXJtIG92ZXJsYXBzIHdpdGggYW4gaW52ZXJzZSB0ZXJtXHJcbiAgICB0aGlzLnJlZnJlc2hIYWxvcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGF0IHRoZSBlbmQgb2YgYSBkcmFnIGN5Y2xlLCBvbiBwb2ludGVyIHVwLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZG9FbmQoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gc2V0IHRlcm0gUHJvcGVydGllcyBhdCBlbmQgb2YgZHJhZ1xyXG4gICAgdGhpcy50ZXJtLmRyYWdnaW5nUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgIHRoaXMudGVybS5zaGFkb3dWaXNpYmxlUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgIGlmICggdGhpcy5lcXVpdmFsZW50VGVybSAmJiAhdGhpcy5lcXVpdmFsZW50VGVybS5pc0Rpc3Bvc2VkICkge1xyXG4gICAgICB0aGlzLmVxdWl2YWxlbnRUZXJtLnNoYWRvd1Zpc2libGVQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5lcXVpdmFsZW50VGVybSAmJiAhdGhpcy50ZXJtQ3JlYXRvci5jb21iaW5lTGlrZVRlcm1zRW5hYmxlZCAmJiB0aGlzLm9wcG9zaXRlUGxhdGUuaXNGdWxsKCkgKSB7XHJcblxyXG4gICAgICAvLyB0aGVyZSdzIG5vIHBsYWNlIHRvIHB1dCBlcXVpdmFsZW50VGVybSwgdGhlIG9wcG9zaXRlIHBsYXRlIGlzIGZ1bGxcclxuICAgICAgdGhpcy5yZWZyZXNoSGFsb3MoKTtcclxuICAgICAgdGhpcy5hbmltYXRlVG9Ub29sYm94KCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5saWtlVGVybSAmJiB0aGlzLnRlcm0uaXNJbnZlcnNlVGVybSggdGhpcy5saWtlVGVybSApICkge1xyXG5cclxuICAgICAgLy8gb3ZlcmxhcHBpbmcgdGVybXMgc3VtIHRvIHplcm9cclxuICAgICAgY29uc3Qgc3VtVG9aZXJvUGFyZW50ID0gdGhpcy50ZXJtTm9kZS5nZXRQYXJlbnQoKSE7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHN1bVRvWmVyb1BhcmVudCApO1xyXG5cclxuICAgICAgY29uc3Qgc3VtVG9aZXJvTm9kZSA9IG5ldyBTdW1Ub1plcm9Ob2RlKCB7IC8vVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzIwMCBkeW5hbWljXHJcbiAgICAgICAgdmFyaWFibGU6IHRoaXMudGVybS5nZXRWYXJpYWJsZSgpLFxyXG4gICAgICAgIGhhbG9SYWRpdXM6IHRoaXMuaGFsb1JhZGl1cyxcclxuICAgICAgICBoYWxvQmFzZUNvbG9yOiBFcXVhbGl0eUV4cGxvcmVyQ29sb3JzLkhBTE8sIC8vIHNob3cgdGhlIGhhbG9cclxuICAgICAgICBmb250U2l6ZTogdGhpcy50ZXJtQ3JlYXRvci5jb21iaW5lTGlrZVRlcm1zRW5hYmxlZCA/XHJcbiAgICAgICAgICAgICAgICAgIEVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMuU1VNX1RPX1pFUk9fQklHX0ZPTlRfU0laRSA6XHJcbiAgICAgICAgICAgICAgICAgIEVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMuU1VNX1RPX1pFUk9fU01BTExfRk9OVF9TSVpFXHJcbiAgICAgIH0gKTtcclxuICAgICAgY29uc3Qgc3VtVG9aZXJvQ2VsbCA9IHRoaXMucGxhdGUuZ2V0Q2VsbEZvclRlcm0oIHRoaXMubGlrZVRlcm0gKSE7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHN1bVRvWmVyb0NlbGwgIT09IG51bGwgKTtcclxuXHJcbiAgICAgIC8vIGRpc3Bvc2Ugb2YgdGVybXMgdGhhdCBzdW0gdG8gemVyb1xyXG4gICAgICAhdGhpcy50ZXJtLmlzRGlzcG9zZWQgJiYgdGhpcy50ZXJtLmRpc3Bvc2UoKTtcclxuICAgICAgIXRoaXMubGlrZVRlcm0uaXNEaXNwb3NlZCAmJiB0aGlzLmxpa2VUZXJtLmRpc3Bvc2UoKTtcclxuICAgICAgdGhpcy5saWtlVGVybSA9IG51bGw7XHJcblxyXG4gICAgICAvLyBwdXQgZXF1aXZhbGVudCB0ZXJtIG9uIG9wcG9zaXRlIHBsYXRlXHJcbiAgICAgIGxldCBvcHBvc2l0ZVN1bVRvWmVyb05vZGU7IC8vIHtTdW1Ub1plcm9Ob2RlfHVuZGVmaW5lZH0gZGVmaW5lZCBpZiB0ZXJtcyBvbiB0aGUgb3Bwb3NpdGUgcGxhdGUgc3VtIHRvIHplcm9cclxuICAgICAgaWYgKCB0aGlzLmVxdWl2YWxlbnRUZXJtICkge1xyXG4gICAgICAgIG9wcG9zaXRlU3VtVG9aZXJvTm9kZSA9IHRoaXMuZW5kT3Bwb3NpdGUoKTtcclxuICAgICAgICBpZiAoIHRoaXMuZXF1aXZhbGVudFRlcm0gJiYgIXRoaXMuZXF1aXZhbGVudFRlcm0uaXNEaXNwb3NlZCApIHtcclxuICAgICAgICAgIHRoaXMuZXF1aXZhbGVudFRlcm0ucGlja2FibGVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZXF1aXZhbGVudFRlcm0gPSBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBEbyBzdW0tdG8temVybyBhbmltYXRpb25zIGFmdGVyIGFkZHJlc3NpbmcgYm90aCBwbGF0ZXMsIHNvIHRoYXQgcGxhdGVzIGhhdmUgbW92ZWQgdG8gdGhlaXIgZmluYWwgcG9zaXRpb24uXHJcbiAgICAgIHN1bVRvWmVyb1BhcmVudC5hZGRDaGlsZCggc3VtVG9aZXJvTm9kZSApO1xyXG4gICAgICBzdW1Ub1plcm9Ob2RlLmNlbnRlciA9IHRoaXMucGxhdGUuZ2V0UG9zaXRpb25PZkNlbGwoIHN1bVRvWmVyb0NlbGwgKTtcclxuICAgICAgc3VtVG9aZXJvTm9kZS5zdGFydEFuaW1hdGlvbigpO1xyXG4gICAgICBpZiAoIG9wcG9zaXRlU3VtVG9aZXJvTm9kZSApIHtcclxuICAgICAgICBzdW1Ub1plcm9QYXJlbnQuYWRkQ2hpbGQoIG9wcG9zaXRlU3VtVG9aZXJvTm9kZSApO1xyXG4gICAgICAgIG9wcG9zaXRlU3VtVG9aZXJvTm9kZS5jZW50ZXIgPSB0aGlzLm9wcG9zaXRlUGxhdGUuZ2V0UG9zaXRpb25PZkNlbGwoIHN1bVRvWmVyb0NlbGwgKTtcclxuICAgICAgICBvcHBvc2l0ZVN1bVRvWmVyb05vZGUuc3RhcnRBbmltYXRpb24oKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoICF0aGlzLnRlcm0ub25QbGF0ZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICBpZiAoIHRoaXMudGVybS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgPlxyXG4gICAgICAgICAgIHRoaXMucGxhdGUucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICsgRXF1YWxpdHlFeHBsb3JlclF1ZXJ5UGFyYW1ldGVycy5wbGF0ZVlPZmZzZXQgKSB7XHJcblxyXG4gICAgICAgIC8vIHRlcm0gd2FzIHJlbGVhc2VkIGJlbG93IHRoZSBwbGF0ZSwgYW5pbWF0ZSBiYWNrIHRvIHRvb2xib3hcclxuICAgICAgICB0aGlzLmFuaW1hdGVUb1Rvb2xib3goKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gdGVybSB3YXMgcmVsZWFzZWQgYWJvdmUgdGhlIHBsYXRlLCBhbmltYXRlIHRvIHRoZSBwbGF0ZVxyXG4gICAgICAgIHRoaXMuYW5pbWF0ZVRvUGxhdGUoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0ZXJtcyB0byB0aGUgdG9vbGJveGVzIHdoZXJlIHRoZXkgd2VyZSBjcmVhdGVkLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBhbmltYXRlVG9Ub29sYm94KCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy50ZXJtLnRvb2xib3hQb3NpdGlvbiwgYHRvb2xib3hQb3NpdGlvbiB3YXMgbm90IGluaXRpYWxpemVkIGZvciB0ZXJtOiAke3RoaXMudGVybX1gICk7XHJcblxyXG4gICAgdGhpcy50ZXJtLnBpY2thYmxlUHJvcGVydHkudmFsdWUgPSB0aGlzLnBpY2thYmxlV2hpbGVBbmltYXRpbmc7XHJcblxyXG4gICAgY29uc3QgdG9vbGJveFBvc2l0aW9uID0gdGhpcy50ZXJtLnRvb2xib3hQb3NpdGlvbiE7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0b29sYm94UG9zaXRpb24gKTtcclxuXHJcbiAgICB0aGlzLnRlcm0uYW5pbWF0ZVRvKCB0b29sYm94UG9zaXRpb24sIHtcclxuICAgICAgYW5pbWF0aW9uQ29tcGxldGVkQ2FsbGJhY2s6ICgpID0+IHtcclxuXHJcbiAgICAgICAgLy8gZGlzcG9zZSBvZiB0ZXJtcyB3aGVuIHRoZXkgcmVhY2ggdGhlIHRvb2xib3hcclxuICAgICAgICAhdGhpcy50ZXJtLmlzRGlzcG9zZWQgJiYgdGhpcy50ZXJtLmRpc3Bvc2UoKTtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLmVxdWl2YWxlbnRUZXJtICkge1xyXG4gICAgICAgICAgIXRoaXMuZXF1aXZhbGVudFRlcm0uaXNEaXNwb3NlZCAmJiB0aGlzLmVxdWl2YWxlbnRUZXJtLmRpc3Bvc2UoKTtcclxuICAgICAgICAgIHRoaXMuZXF1aXZhbGVudFRlcm0gPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgYW4gZXZlbnQgdG8gYSBtb2RlbCBwb3NpdGlvbiB3aXRoIHNvbWUgb2Zmc2V0LCBjb25zdHJhaW5lZCB0byB0aGUgZHJhZyBib3VuZHMuXHJcbiAgICogVGhpcyBpcyB1c2VkIGF0IHRoZSBzdGFydCBvZiBhIGRyYWcgY3ljbGUgdG8gcG9zaXRpb24gdGVybU5vZGUgcmVsYXRpdmUgdG8gdGhlIHBvaW50ZXIuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBldmVudFRvUG9zaXRpb24oIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogVmVjdG9yMiB7XHJcblxyXG4gICAgLy8gbW92ZSBib3R0b20tY2VudGVyIG9mIHRlcm1Ob2RlIHRvIHBvaW50ZXIgcG9zaXRpb25cclxuICAgIGNvbnN0IGR4ID0gMDtcclxuICAgIGNvbnN0IGR5ID0gdGhpcy50ZXJtTm9kZS5jb250ZW50Tm9kZVNpemUuaGVpZ2h0IC8gMjtcclxuICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy50ZXJtTm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkubWludXNYWSggZHgsIGR5ICk7XHJcblxyXG4gICAgLy8gY29uc3RyYWluIHRvIGRyYWcgYm91bmRzXHJcbiAgICByZXR1cm4gdGhpcy50ZXJtLmRyYWdCb3VuZHMuY2xvc2VzdFBvaW50VG8oIHBvc2l0aW9uICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWZyZXNoZXMgdGhlIHZpc3VhbCBmZWVkYmFjayAoeWVsbG93IGhhbG8pIHRoYXQgaXMgcHJvdmlkZWQgd2hlbiBhIGRyYWdnZWQgdGVybSBvdmVybGFwc1xyXG4gICAqIGEgbGlrZSB0ZXJtIHRoYXQgaXMgb24gdGhlIHNjYWxlLiBUaGlzIGhhcyB0aGUgc2lkZS1lZmZlY3Qgb2Ygc2V0dGluZyB0aGlzLmxpa2VUZXJtLlxyXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzE3XHJcbiAgICovXHJcbiAgcHJpdmF0ZSByZWZyZXNoSGFsb3MoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gQmFpbCBpZiB0aGlzIGRyYWcgbGlzdGVuZXIgaXMgbm90IGN1cnJlbnRseSBhY3RpdmUsIGZvciBleGFtcGxlIHdoZW4gMiB0ZXJtcyBhcmUgbG9ja2VkIHRvZ2V0aGVyXHJcbiAgICAvLyBhbmQgb25seSBvbmUgb2YgdGhlbSBpcyBiZWluZyBkcmFnZ2VkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VxdWFsaXR5LWV4cGxvcmVyL2lzc3Vlcy85NlxyXG4gICAgaWYgKCAhdGhpcy50ZXJtLnBpY2thYmxlUHJvcGVydHkudmFsdWUgKSB7IHJldHVybjsgfVxyXG5cclxuICAgIGlmICggdGhpcy50ZXJtLmRyYWdnaW5nUHJvcGVydHkudmFsdWUgKSB7XHJcblxyXG4gICAgICBjb25zdCBwcmV2aW91c0xpa2VUZXJtID0gdGhpcy5saWtlVGVybTtcclxuICAgICAgdGhpcy5saWtlVGVybSA9IG51bGw7XHJcblxyXG4gICAgICAvLyBkb2VzIHRoaXMgdGVybSBvdmVybGFwIGEgbGlrZSB0ZXJtIG9uIHRoZSBwbGF0ZT9cclxuICAgICAgY29uc3QgdGVybU9uUGxhdGUgPSB0aGlzLnBsYXRlLmdldFRlcm1BdFBvc2l0aW9uKCB0aGlzLnRlcm0ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICBpZiAoIHRlcm1PblBsYXRlICYmIHRlcm1PblBsYXRlLmlzTGlrZVRlcm0oIHRoaXMudGVybSApICkge1xyXG4gICAgICAgIHRoaXMubGlrZVRlcm0gPSB0ZXJtT25QbGF0ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYgdGhlIGxpa2UgdGVybSBpcyBuZXcsIHRoZW4gY2xlYW4gdXAgcHJldmlvdXMgbGlrZSB0ZXJtXHJcbiAgICAgIGlmICggcHJldmlvdXNMaWtlVGVybSAmJiAhcHJldmlvdXNMaWtlVGVybS5pc0Rpc3Bvc2VkICYmICggcHJldmlvdXNMaWtlVGVybSAhPT0gdGhpcy5saWtlVGVybSApICkge1xyXG4gICAgICAgIHByZXZpb3VzTGlrZVRlcm0uaGFsb1Zpc2libGVQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIHRoaXMubGlrZVRlcm0gJiYgKCB0aGlzLnRlcm1DcmVhdG9yLmNvbWJpbmVMaWtlVGVybXNFbmFibGVkIHx8IHRoaXMudGVybS5pc0ludmVyc2VUZXJtKCB0aGlzLmxpa2VUZXJtICkgKSApIHtcclxuXHJcbiAgICAgICAgLy8gdGVybXMgd2lsbCBjb21iaW5lLCBzaG93IGhhbG8gZm9yIHRlcm0gYW5kIGxpa2VUZXJtXHJcbiAgICAgICAgaWYgKCAhdGhpcy50ZXJtLmlzRGlzcG9zZWQgKSB7XHJcbiAgICAgICAgICB0aGlzLnRlcm0uc2hhZG93VmlzaWJsZVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLnRlcm0uaGFsb1Zpc2libGVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggIXRoaXMubGlrZVRlcm0uaXNEaXNwb3NlZCApIHtcclxuICAgICAgICAgIHRoaXMubGlrZVRlcm0uaGFsb1Zpc2libGVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCAhdGhpcy50ZXJtLmlzRGlzcG9zZWQgKSB7XHJcblxyXG4gICAgICAgIC8vIHRlcm0gd2lsbCBub3QgY29tYmluZVxyXG4gICAgICAgIHRoaXMudGVybS5zaGFkb3dWaXNpYmxlUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudGVybS5oYWxvVmlzaWJsZVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBpZiAoICF0aGlzLnRlcm0uaXNEaXNwb3NlZCApIHtcclxuICAgICAgICB0aGlzLnRlcm0uc2hhZG93VmlzaWJsZVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy50ZXJtLmhhbG9WaXNpYmxlUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHRoaXMubGlrZVRlcm0gJiYgIXRoaXMubGlrZVRlcm0uaXNEaXNwb3NlZCApIHtcclxuICAgICAgICB0aGlzLmxpa2VUZXJtLmhhbG9WaXNpYmxlUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGF0IHRoZSBzdGFydCBvZiBhIGRyYWcgY3ljbGUsIHdoZW4gbG9jayBpcyBvbiwgdG8gaGFuZGxlIHJlbGF0ZWQgdGVybXMgb24gdGhlIG9wcG9zaXRlIHNpZGUuXHJcbiAgICogQHJldHVybnMgdHJ1ZT1zdWNjZXNzLCBmYWxzZT1mYWlsdXJlXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHN0YXJ0T3Bwb3NpdGUoKTogYm9vbGVhbjtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGF0IHRoZSBlbmQgb2YgYSBkcmFnIGN5Y2xlLCB3aGVuIGxvY2sgaXMgb24sIHRvIGhhbmRsZSByZWxhdGVkIHRlcm1zIG9uIHRoZSBvcHBvc2l0ZSBzaWRlLlxyXG4gICAqIEByZXR1cm5zIG5vbi1udWxsIGlmIHRoZSBkcmFnIHJlc3VsdHMgaW4gdGVybXMgb24gdGhlIG9wcG9zaXRlIHBsYXRlIHN1bW1pbmcgdG8gemVyb1xyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBlbmRPcHBvc2l0ZSgpOiBTdW1Ub1plcm9Ob2RlIHwgbnVsbDtcclxuXHJcbiAgLyoqXHJcbiAgICogQW5pbWF0ZXMgdGVybSB0byBwbGF0ZXMuXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGFic3RyYWN0IGFuaW1hdGVUb1BsYXRlKCk6IHZvaWQ7XHJcbn1cclxuXHJcbmVxdWFsaXR5RXhwbG9yZXIucmVnaXN0ZXIoICdUZXJtRHJhZ0xpc3RlbmVyJywgVGVybURyYWdMaXN0ZW5lciApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsU0FBUyxNQUFNLHVDQUF1QztBQUM3RCxTQUFTQyxZQUFZLFFBQXNFLG1DQUFtQztBQUM5SCxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0Msc0JBQXNCLE1BQU0sOEJBQThCO0FBQ2pFLE9BQU9DLHlCQUF5QixNQUFNLGlDQUFpQztBQUN2RSxPQUFPQywrQkFBK0IsTUFBTSx1Q0FBdUM7QUFJbkYsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQVU5QyxlQUFlLE1BQWVDLGdCQUFnQixTQUFTTixZQUFZLENBQUM7RUFRbEU7O0VBR0E7O0VBR0E7O0VBT0E7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1lPLFdBQVdBLENBQUVDLFFBQWtCLEVBQUVDLElBQVUsRUFBRUMsV0FBd0IsRUFBRUMsZUFBeUMsRUFBRztJQUUzSDtJQUNBO0lBQ0E7SUFDQSxJQUFJQyxJQUE2QixHQUFHLElBQUk7SUFFeEMsTUFBTUMsT0FBTyxHQUFHZCxTQUFTLENBQWlGLENBQUMsQ0FBRTtNQUUzRztNQUNBZSxVQUFVLEVBQUUsRUFBRTtNQUNkQyxzQkFBc0IsRUFBRSxJQUFJO01BRTVCO01BQ0FDLGNBQWMsRUFBRSxJQUFJO01BQ3BCQyxLQUFLLEVBQUlDLEtBQXlCLElBQU1OLElBQUksQ0FBRU8sT0FBTyxDQUFFRCxLQUFNLENBQUM7TUFDOURFLElBQUksRUFBSUYsS0FBeUIsSUFBTU4sSUFBSSxDQUFFUyxNQUFNLENBQUVILEtBQU0sQ0FBQztNQUM1REksR0FBRyxFQUFFQSxDQUFBLEtBQU1WLElBQUksQ0FBRVcsS0FBSyxDQUFDO0lBRXpCLENBQUMsRUFBRVosZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQUVFLE9BQVEsQ0FBQzs7SUFFaEI7SUFDQTtJQUNBRCxJQUFJLEdBQUcsSUFBSTtJQUVYLElBQUksQ0FBQ0osUUFBUSxHQUFHQSxRQUFRO0lBQ3hCLElBQUksQ0FBQ0MsSUFBSSxHQUFHQSxJQUFJO0lBQ2hCLElBQUksQ0FBQ0MsV0FBVyxHQUFHQSxXQUFXO0lBQzlCLElBQUksQ0FBQ0ksVUFBVSxHQUFHRCxPQUFPLENBQUNDLFVBQVU7SUFDcEMsSUFBSSxDQUFDQyxzQkFBc0IsR0FBR0YsT0FBTyxDQUFDRSxzQkFBc0I7SUFDNUQsSUFBSSxDQUFDUyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDdEIsSUFBSSxDQUFDQyxjQUFjLEdBQUcsSUFBSSxDQUFDLENBQUM7O0lBRTVCO0lBQ0EsSUFBSSxDQUFDQyxxQkFBcUIsR0FBR2hCLFdBQVcsQ0FBQ2dCLHFCQUFzQjtJQUMvREMsTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDRCxxQkFBc0IsQ0FBQztJQUM5QyxJQUFJLENBQUNFLEtBQUssR0FBR2xCLFdBQVcsQ0FBQ2tCLEtBQUs7SUFDOUIsSUFBSSxDQUFDQyxhQUFhLEdBQUcsSUFBSSxDQUFDSCxxQkFBcUIsQ0FBQ0UsS0FBSzs7SUFFckQ7SUFDQSxNQUFNRSxnQkFBZ0IsR0FBS0MsUUFBaUIsSUFBTTtNQUNoRCxJQUFLLElBQUksQ0FBQ04sY0FBYyxJQUFJLENBQUMsSUFBSSxDQUFDQSxjQUFjLENBQUNPLFVBQVUsRUFBRztRQUM1RCxJQUFJLENBQUNQLGNBQWMsQ0FBQ1EsTUFBTSxDQUFFdkIsV0FBVyxDQUFDd0IseUJBQXlCLENBQUV6QixJQUFLLENBQUUsQ0FBQztNQUM3RTtJQUNGLENBQUM7SUFDREEsSUFBSSxDQUFDMEIsZ0JBQWdCLENBQUNDLElBQUksQ0FBRU4sZ0JBQWlCLENBQUMsQ0FBQyxDQUFDOztJQUVoRDtJQUNBLE1BQU1PLGlCQUFpQixHQUFHLElBQUksQ0FBQ0MsWUFBWSxDQUFDQyxJQUFJLENBQUUsSUFBSyxDQUFDO0lBQ3hELElBQUksQ0FBQ1gsS0FBSyxDQUFDTyxnQkFBZ0IsQ0FBQ0MsSUFBSSxDQUFFQyxpQkFBa0IsQ0FBQyxDQUFDLENBQUM7SUFDdkQsSUFBSSxDQUFDVCxLQUFLLENBQUNZLHNCQUFzQixDQUFDQyxXQUFXLENBQUVKLGlCQUFrQixDQUFDLENBQUMsQ0FBQzs7SUFFcEUsSUFBSSxDQUFDSyx1QkFBdUIsR0FBRyxNQUFNO01BRW5DLElBQUtqQyxJQUFJLENBQUMwQixnQkFBZ0IsQ0FBQ1EsV0FBVyxDQUFFYixnQkFBaUIsQ0FBQyxFQUFHO1FBQzNEckIsSUFBSSxDQUFDMEIsZ0JBQWdCLENBQUNTLE1BQU0sQ0FBRWQsZ0JBQWlCLENBQUM7TUFDbEQ7TUFFQSxJQUFLLElBQUksQ0FBQ0YsS0FBSyxDQUFDTyxnQkFBZ0IsQ0FBQ1EsV0FBVyxDQUFFTixpQkFBa0IsQ0FBQyxFQUFHO1FBQ2xFLElBQUksQ0FBQ1QsS0FBSyxDQUFDTyxnQkFBZ0IsQ0FBQ1MsTUFBTSxDQUFFUCxpQkFBa0IsQ0FBQztNQUN6RDtNQUVBLElBQUssSUFBSSxDQUFDVCxLQUFLLENBQUNZLHNCQUFzQixDQUFDRyxXQUFXLENBQUVOLGlCQUFrQixDQUFDLEVBQUc7UUFDeEUsSUFBSSxDQUFDVCxLQUFLLENBQUNZLHNCQUFzQixDQUFDSyxjQUFjLENBQUVSLGlCQUFrQixDQUFDO01BQ3ZFO0lBQ0YsQ0FBQztFQUNIO0VBRWdCUyxPQUFPQSxDQUFBLEVBQVM7SUFDOUIsSUFBSSxDQUFDSix1QkFBdUIsQ0FBQyxDQUFDO0lBQzlCLEtBQUssQ0FBQ0ksT0FBTyxDQUFDLENBQUM7RUFDakI7O0VBRUE7QUFDRjtBQUNBO0VBQ1UzQixPQUFPQSxDQUFFRCxLQUF5QixFQUFTO0lBRWpELElBQUk2QixPQUFPLEdBQUcsSUFBSTtJQUVsQixJQUFLLElBQUksQ0FBQ3JDLFdBQVcsQ0FBQ3NDLGFBQWEsQ0FBRSxJQUFJLENBQUN2QyxJQUFLLENBQUMsRUFBRztNQUVqRCxJQUFLLElBQUksQ0FBQ0MsV0FBVyxDQUFDdUMsY0FBYyxDQUFDQyxLQUFLLEVBQUc7UUFDM0NILE9BQU8sR0FBRyxJQUFJLENBQUNJLGFBQWEsQ0FBQyxDQUFDO01BQ2hDO01BRUEsSUFBS0osT0FBTyxFQUFHO1FBQ2IsSUFBSSxDQUFDckMsV0FBVyxDQUFDMEMsbUJBQW1CLENBQUUsSUFBSSxDQUFDM0MsSUFBSyxDQUFDO01BQ25EO0lBQ0YsQ0FBQyxNQUNJLElBQUssQ0FBQyxJQUFJLENBQUNBLElBQUksQ0FBQzRDLFdBQVcsQ0FBQyxDQUFDLEVBQUc7TUFFbkM7TUFDQSxJQUFLLElBQUksQ0FBQzNDLFdBQVcsQ0FBQ3VDLGNBQWMsQ0FBQ0MsS0FBSyxFQUFHO1FBQzNDLElBQUksQ0FBQ3pCLGNBQWMsR0FBRyxJQUFJLENBQUNDLHFCQUFxQixDQUFDNEIsVUFBVSxDQUFFLElBQUksQ0FBQzdDLElBQUksQ0FBQzhDLFdBQVcsQ0FBQyxDQUFFLENBQUM7TUFDeEY7SUFDRjtJQUVBLElBQUtSLE9BQU8sRUFBRztNQUNicEIsTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDRixjQUFjLElBQUksQ0FBQyxJQUFJLENBQUNmLFdBQVcsQ0FBQ3VDLGNBQWMsQ0FBQ0MsS0FBSyxFQUM3RSxxQ0FBc0MsQ0FBQzs7TUFFekM7TUFDQSxJQUFJLENBQUN6QyxJQUFJLENBQUN3QixNQUFNLENBQUUsSUFBSSxDQUFDdUIsZUFBZSxDQUFFdEMsS0FBTSxDQUFFLENBQUM7O01BRWpEO01BQ0EsSUFBSSxDQUFDVCxJQUFJLENBQUNnRCxnQkFBZ0IsQ0FBQ1AsS0FBSyxHQUFHLElBQUk7TUFDdkMsSUFBSSxDQUFDekMsSUFBSSxDQUFDaUQscUJBQXFCLENBQUNSLEtBQUssR0FBRyxJQUFJO01BQzVDLElBQUssSUFBSSxDQUFDekIsY0FBYyxJQUFJLENBQUMsSUFBSSxDQUFDQSxjQUFjLENBQUNPLFVBQVUsRUFBRztRQUM1RCxJQUFJLENBQUNQLGNBQWMsQ0FBQ2lDLHFCQUFxQixDQUFDUixLQUFLLEdBQUcsSUFBSTtRQUN0RCxJQUFJLENBQUN6QixjQUFjLENBQUNrQyxnQkFBZ0IsQ0FBQ1QsS0FBSyxHQUFHLEtBQUs7TUFDcEQ7O01BRUE7TUFDQSxJQUFJLENBQUMxQyxRQUFRLENBQUNvRCxXQUFXLENBQUMsQ0FBQztNQUUzQixJQUFJLENBQUN0QixZQUFZLENBQUMsQ0FBQztJQUNyQjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ1VqQixNQUFNQSxDQUFFSCxLQUF5QixFQUFTO0lBRWhEO0lBQ0EsSUFBSSxDQUFDVCxJQUFJLENBQUN3QixNQUFNLENBQUUsSUFBSSxDQUFDdUIsZUFBZSxDQUFFdEMsS0FBTSxDQUFFLENBQUM7O0lBRWpEO0lBQ0EsSUFBSSxDQUFDb0IsWUFBWSxDQUFDLENBQUM7RUFDckI7O0VBRUE7QUFDRjtBQUNBO0VBQ1VmLEtBQUtBLENBQUEsRUFBUztJQUVwQjtJQUNBLElBQUksQ0FBQ2QsSUFBSSxDQUFDZ0QsZ0JBQWdCLENBQUNQLEtBQUssR0FBRyxLQUFLO0lBQ3hDLElBQUksQ0FBQ3pDLElBQUksQ0FBQ2lELHFCQUFxQixDQUFDUixLQUFLLEdBQUcsS0FBSztJQUM3QyxJQUFLLElBQUksQ0FBQ3pCLGNBQWMsSUFBSSxDQUFDLElBQUksQ0FBQ0EsY0FBYyxDQUFDTyxVQUFVLEVBQUc7TUFDNUQsSUFBSSxDQUFDUCxjQUFjLENBQUNpQyxxQkFBcUIsQ0FBQ1IsS0FBSyxHQUFHLEtBQUs7SUFDekQ7SUFFQSxJQUFLLElBQUksQ0FBQ3pCLGNBQWMsSUFBSSxDQUFDLElBQUksQ0FBQ2YsV0FBVyxDQUFDbUQsdUJBQXVCLElBQUksSUFBSSxDQUFDaEMsYUFBYSxDQUFDaUMsTUFBTSxDQUFDLENBQUMsRUFBRztNQUVyRztNQUNBLElBQUksQ0FBQ3hCLFlBQVksQ0FBQyxDQUFDO01BQ25CLElBQUksQ0FBQ3lCLGdCQUFnQixDQUFDLENBQUM7SUFDekIsQ0FBQyxNQUNJLElBQUssSUFBSSxDQUFDdkMsUUFBUSxJQUFJLElBQUksQ0FBQ2YsSUFBSSxDQUFDdUQsYUFBYSxDQUFFLElBQUksQ0FBQ3hDLFFBQVMsQ0FBQyxFQUFHO01BRXBFO01BQ0EsTUFBTXlDLGVBQWUsR0FBRyxJQUFJLENBQUN6RCxRQUFRLENBQUMwRCxTQUFTLENBQUMsQ0FBRTtNQUNsRHZDLE1BQU0sSUFBSUEsTUFBTSxDQUFFc0MsZUFBZ0IsQ0FBQztNQUVuQyxNQUFNRSxhQUFhLEdBQUcsSUFBSTlELGFBQWEsQ0FBRTtRQUFFO1FBQ3pDK0QsUUFBUSxFQUFFLElBQUksQ0FBQzNELElBQUksQ0FBQzRELFdBQVcsQ0FBQyxDQUFDO1FBQ2pDdkQsVUFBVSxFQUFFLElBQUksQ0FBQ0EsVUFBVTtRQUMzQndELGFBQWEsRUFBRXBFLHNCQUFzQixDQUFDcUUsSUFBSTtRQUFFO1FBQzVDQyxRQUFRLEVBQUUsSUFBSSxDQUFDOUQsV0FBVyxDQUFDbUQsdUJBQXVCLEdBQ3hDMUQseUJBQXlCLENBQUNzRSx5QkFBeUIsR0FDbkR0RSx5QkFBeUIsQ0FBQ3VFO01BQ3RDLENBQUUsQ0FBQztNQUNILE1BQU1DLGFBQWEsR0FBRyxJQUFJLENBQUMvQyxLQUFLLENBQUNnRCxjQUFjLENBQUUsSUFBSSxDQUFDcEQsUUFBUyxDQUFFO01BQ2pFRyxNQUFNLElBQUlBLE1BQU0sQ0FBRWdELGFBQWEsS0FBSyxJQUFLLENBQUM7O01BRTFDO01BQ0EsQ0FBQyxJQUFJLENBQUNsRSxJQUFJLENBQUN1QixVQUFVLElBQUksSUFBSSxDQUFDdkIsSUFBSSxDQUFDcUMsT0FBTyxDQUFDLENBQUM7TUFDNUMsQ0FBQyxJQUFJLENBQUN0QixRQUFRLENBQUNRLFVBQVUsSUFBSSxJQUFJLENBQUNSLFFBQVEsQ0FBQ3NCLE9BQU8sQ0FBQyxDQUFDO01BQ3BELElBQUksQ0FBQ3RCLFFBQVEsR0FBRyxJQUFJOztNQUVwQjtNQUNBLElBQUlxRCxxQkFBcUIsQ0FBQyxDQUFDO01BQzNCLElBQUssSUFBSSxDQUFDcEQsY0FBYyxFQUFHO1FBQ3pCb0QscUJBQXFCLEdBQUcsSUFBSSxDQUFDQyxXQUFXLENBQUMsQ0FBQztRQUMxQyxJQUFLLElBQUksQ0FBQ3JELGNBQWMsSUFBSSxDQUFDLElBQUksQ0FBQ0EsY0FBYyxDQUFDTyxVQUFVLEVBQUc7VUFDNUQsSUFBSSxDQUFDUCxjQUFjLENBQUNrQyxnQkFBZ0IsQ0FBQ1QsS0FBSyxHQUFHLElBQUk7UUFDbkQ7UUFDQSxJQUFJLENBQUN6QixjQUFjLEdBQUcsSUFBSTtNQUM1Qjs7TUFFQTtNQUNBd0MsZUFBZSxDQUFDYyxRQUFRLENBQUVaLGFBQWMsQ0FBQztNQUN6Q0EsYUFBYSxDQUFDYSxNQUFNLEdBQUcsSUFBSSxDQUFDcEQsS0FBSyxDQUFDcUQsaUJBQWlCLENBQUVOLGFBQWMsQ0FBQztNQUNwRVIsYUFBYSxDQUFDZSxjQUFjLENBQUMsQ0FBQztNQUM5QixJQUFLTCxxQkFBcUIsRUFBRztRQUMzQlosZUFBZSxDQUFDYyxRQUFRLENBQUVGLHFCQUFzQixDQUFDO1FBQ2pEQSxxQkFBcUIsQ0FBQ0csTUFBTSxHQUFHLElBQUksQ0FBQ25ELGFBQWEsQ0FBQ29ELGlCQUFpQixDQUFFTixhQUFjLENBQUM7UUFDcEZFLHFCQUFxQixDQUFDSyxjQUFjLENBQUMsQ0FBQztNQUN4QztJQUNGLENBQUMsTUFDSSxJQUFLLENBQUMsSUFBSSxDQUFDekUsSUFBSSxDQUFDMEUsZUFBZSxDQUFDakMsS0FBSyxFQUFHO01BQzNDLElBQUssSUFBSSxDQUFDekMsSUFBSSxDQUFDMEIsZ0JBQWdCLENBQUNlLEtBQUssQ0FBQ2tDLENBQUMsR0FDbEMsSUFBSSxDQUFDeEQsS0FBSyxDQUFDTyxnQkFBZ0IsQ0FBQ2UsS0FBSyxDQUFDa0MsQ0FBQyxHQUFHaEYsK0JBQStCLENBQUNpRixZQUFZLEVBQUc7UUFFeEY7UUFDQSxJQUFJLENBQUN0QixnQkFBZ0IsQ0FBQyxDQUFDO01BQ3pCLENBQUMsTUFDSTtRQUVIO1FBQ0EsSUFBSSxDQUFDdUIsY0FBYyxDQUFDLENBQUM7TUFDdkI7SUFDRjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtFQUNZdkIsZ0JBQWdCQSxDQUFBLEVBQVM7SUFDakNwQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxJQUFJLENBQUNsQixJQUFJLENBQUM4RSxlQUFlLEVBQUcsaURBQWdELElBQUksQ0FBQzlFLElBQUssRUFBRSxDQUFDO0lBRTNHLElBQUksQ0FBQ0EsSUFBSSxDQUFDa0QsZ0JBQWdCLENBQUNULEtBQUssR0FBRyxJQUFJLENBQUNuQyxzQkFBc0I7SUFFOUQsTUFBTXdFLGVBQWUsR0FBRyxJQUFJLENBQUM5RSxJQUFJLENBQUM4RSxlQUFnQjtJQUNsRDVELE1BQU0sSUFBSUEsTUFBTSxDQUFFNEQsZUFBZ0IsQ0FBQztJQUVuQyxJQUFJLENBQUM5RSxJQUFJLENBQUMrRSxTQUFTLENBQUVELGVBQWUsRUFBRTtNQUNwQ0UsMEJBQTBCLEVBQUVBLENBQUEsS0FBTTtRQUVoQztRQUNBLENBQUMsSUFBSSxDQUFDaEYsSUFBSSxDQUFDdUIsVUFBVSxJQUFJLElBQUksQ0FBQ3ZCLElBQUksQ0FBQ3FDLE9BQU8sQ0FBQyxDQUFDO1FBRTVDLElBQUssSUFBSSxDQUFDckIsY0FBYyxFQUFHO1VBQ3pCLENBQUMsSUFBSSxDQUFDQSxjQUFjLENBQUNPLFVBQVUsSUFBSSxJQUFJLENBQUNQLGNBQWMsQ0FBQ3FCLE9BQU8sQ0FBQyxDQUFDO1VBQ2hFLElBQUksQ0FBQ3JCLGNBQWMsR0FBRyxJQUFJO1FBQzVCO01BQ0Y7SUFDRixDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNVK0IsZUFBZUEsQ0FBRXRDLEtBQXlCLEVBQVk7SUFFNUQ7SUFDQSxNQUFNd0UsRUFBRSxHQUFHLENBQUM7SUFDWixNQUFNQyxFQUFFLEdBQUcsSUFBSSxDQUFDbkYsUUFBUSxDQUFDb0YsZUFBZSxDQUFDQyxNQUFNLEdBQUcsQ0FBQztJQUNuRCxNQUFNOUQsUUFBUSxHQUFHLElBQUksQ0FBQ3ZCLFFBQVEsQ0FBQ3NGLG1CQUFtQixDQUFFNUUsS0FBSyxDQUFDNkUsT0FBTyxDQUFDQyxLQUFNLENBQUMsQ0FBQ0MsT0FBTyxDQUFFUCxFQUFFLEVBQUVDLEVBQUcsQ0FBQzs7SUFFM0Y7SUFDQSxPQUFPLElBQUksQ0FBQ2xGLElBQUksQ0FBQ3lGLFVBQVUsQ0FBQ0MsY0FBYyxDQUFFcEUsUUFBUyxDQUFDO0VBQ3hEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDVU8sWUFBWUEsQ0FBQSxFQUFTO0lBRTNCO0lBQ0E7SUFDQSxJQUFLLENBQUMsSUFBSSxDQUFDN0IsSUFBSSxDQUFDa0QsZ0JBQWdCLENBQUNULEtBQUssRUFBRztNQUFFO0lBQVE7SUFFbkQsSUFBSyxJQUFJLENBQUN6QyxJQUFJLENBQUNnRCxnQkFBZ0IsQ0FBQ1AsS0FBSyxFQUFHO01BRXRDLE1BQU1rRCxnQkFBZ0IsR0FBRyxJQUFJLENBQUM1RSxRQUFRO01BQ3RDLElBQUksQ0FBQ0EsUUFBUSxHQUFHLElBQUk7O01BRXBCO01BQ0EsTUFBTTZFLFdBQVcsR0FBRyxJQUFJLENBQUN6RSxLQUFLLENBQUMwRSxpQkFBaUIsQ0FBRSxJQUFJLENBQUM3RixJQUFJLENBQUMwQixnQkFBZ0IsQ0FBQ2UsS0FBTSxDQUFDO01BQ3BGLElBQUttRCxXQUFXLElBQUlBLFdBQVcsQ0FBQ0UsVUFBVSxDQUFFLElBQUksQ0FBQzlGLElBQUssQ0FBQyxFQUFHO1FBQ3hELElBQUksQ0FBQ2UsUUFBUSxHQUFHNkUsV0FBVztNQUM3Qjs7TUFFQTtNQUNBLElBQUtELGdCQUFnQixJQUFJLENBQUNBLGdCQUFnQixDQUFDcEUsVUFBVSxJQUFNb0UsZ0JBQWdCLEtBQUssSUFBSSxDQUFDNUUsUUFBVSxFQUFHO1FBQ2hHNEUsZ0JBQWdCLENBQUNJLG1CQUFtQixDQUFDdEQsS0FBSyxHQUFHLEtBQUs7TUFDcEQ7TUFFQSxJQUFLLElBQUksQ0FBQzFCLFFBQVEsS0FBTSxJQUFJLENBQUNkLFdBQVcsQ0FBQ21ELHVCQUF1QixJQUFJLElBQUksQ0FBQ3BELElBQUksQ0FBQ3VELGFBQWEsQ0FBRSxJQUFJLENBQUN4QyxRQUFTLENBQUMsQ0FBRSxFQUFHO1FBRS9HO1FBQ0EsSUFBSyxDQUFDLElBQUksQ0FBQ2YsSUFBSSxDQUFDdUIsVUFBVSxFQUFHO1VBQzNCLElBQUksQ0FBQ3ZCLElBQUksQ0FBQ2lELHFCQUFxQixDQUFDUixLQUFLLEdBQUcsS0FBSztVQUM3QyxJQUFJLENBQUN6QyxJQUFJLENBQUMrRixtQkFBbUIsQ0FBQ3RELEtBQUssR0FBRyxJQUFJO1FBQzVDO1FBQ0EsSUFBSyxDQUFDLElBQUksQ0FBQzFCLFFBQVEsQ0FBQ1EsVUFBVSxFQUFHO1VBQy9CLElBQUksQ0FBQ1IsUUFBUSxDQUFDZ0YsbUJBQW1CLENBQUN0RCxLQUFLLEdBQUcsSUFBSTtRQUNoRDtNQUNGLENBQUMsTUFDSSxJQUFLLENBQUMsSUFBSSxDQUFDekMsSUFBSSxDQUFDdUIsVUFBVSxFQUFHO1FBRWhDO1FBQ0EsSUFBSSxDQUFDdkIsSUFBSSxDQUFDaUQscUJBQXFCLENBQUNSLEtBQUssR0FBRyxJQUFJO1FBQzVDLElBQUksQ0FBQ3pDLElBQUksQ0FBQytGLG1CQUFtQixDQUFDdEQsS0FBSyxHQUFHLEtBQUs7TUFDN0M7SUFDRixDQUFDLE1BQ0k7TUFDSCxJQUFLLENBQUMsSUFBSSxDQUFDekMsSUFBSSxDQUFDdUIsVUFBVSxFQUFHO1FBQzNCLElBQUksQ0FBQ3ZCLElBQUksQ0FBQ2lELHFCQUFxQixDQUFDUixLQUFLLEdBQUcsS0FBSztRQUM3QyxJQUFJLENBQUN6QyxJQUFJLENBQUMrRixtQkFBbUIsQ0FBQ3RELEtBQUssR0FBRyxLQUFLO01BQzdDO01BQ0EsSUFBSyxJQUFJLENBQUMxQixRQUFRLElBQUksQ0FBQyxJQUFJLENBQUNBLFFBQVEsQ0FBQ1EsVUFBVSxFQUFHO1FBQ2hELElBQUksQ0FBQ1IsUUFBUSxDQUFDZ0YsbUJBQW1CLENBQUN0RCxLQUFLLEdBQUcsS0FBSztNQUNqRDtJQUNGO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7O0VBR0U7QUFDRjtBQUNBO0FBQ0E7O0VBR0U7QUFDRjtBQUNBO0FBRUE7O0FBRUFqRCxnQkFBZ0IsQ0FBQ3dHLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRW5HLGdCQUFpQixDQUFDIn0=