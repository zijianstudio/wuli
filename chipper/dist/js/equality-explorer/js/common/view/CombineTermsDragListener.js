// Copyright 2018-2022, University of Colorado Boulder

/**
 * CombineTermsDragListener is used when like terms are combined in one cell on a plate.
 * See terminology and requirements in TermDragListener supertype.
 * See https://github.com/phetsims/equality-explorer/blob/master/doc/lock-scenarios.md for scenarios that
 * describe how this feature works.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import equalityExplorer from '../../equalityExplorer.js';
import EqualityExplorerConstants from '../EqualityExplorerConstants.js';
import SumToZeroNode from './SumToZeroNode.js';
import TermDragListener from './TermDragListener.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
export default class CombineTermsDragListener extends TermDragListener {
  /**
   * @param termNode - Node that the listener is attached to
   * @param term - the term being dragged
   * @param termCreator - the creator of term
   * @param [providedOptions]
   */
  constructor(termNode, term, termCreator, providedOptions) {
    assert && assert(termCreator.combineLikeTermsEnabled, 'CombineTermsDragListener is used when like terms are combined');
    super(termNode, term, termCreator, providedOptions);
  }

  //-------------------------------------------------------------------------------------------------
  // Below here is the implementation of the TermDragListener API
  //-------------------------------------------------------------------------------------------------

  /**
   * Called at the start of a drag cycle, when lock is on, to handle related terms on the opposite side of the scale.
   * @returns true=success, false=failure
   */
  startOpposite() {
    assert && assert(this.termCreator.lockedProperty.value, 'startOpposite should only be called when lock is on');
    const likeTermsCell = this.termCreator.likeTermsCell;
    assert && assert(likeTermsCell !== null);
    let oppositeLikeTerm = this.oppositePlate.getTermInCell(likeTermsCell);
    let inverseTerm;
    if (oppositeLikeTerm) {
      // subtract term from what's on the opposite plate
      inverseTerm = oppositeLikeTerm.minus(this.term);
      this.equivalentTermCreator.removeTermFromPlate(oppositeLikeTerm);
      oppositeLikeTerm.dispose();
      oppositeLikeTerm = null;
      if (inverseTerm.significantValue.getValue() === 0) {
        inverseTerm.dispose();
        inverseTerm = null;
      } else {
        this.equivalentTermCreator.putTermOnPlate(inverseTerm, likeTermsCell);
      }
    } else {
      // there was nothing on the opposite plate, so create the inverse of the equivalent term
      inverseTerm = this.equivalentTermCreator.createTerm(combineOptions({}, this.term.copyOptions(), {
        sign: -1
      }));
      this.equivalentTermCreator.putTermOnPlate(inverseTerm, likeTermsCell);
    }

    // create the equivalent term last, so it's in front
    this.equivalentTerm = this.equivalentTermCreator.createTerm(this.term.copyOptions());
    return true;
  }

  /**
   * Called at the end of a drag cycle, when lock is on, to handle related terms on the opposite side of the scale.
   * @returns non-null if the drag results in terms on the opposite plate summing to zero
   */
  endOpposite() {
    assert && assert(this.termCreator.lockedProperty.value, 'endOpposite should only be called when lock is on');

    // {SumToZeroNode|null} truthy when terms sum to zero
    let oppositeSumToZeroNode = null;
    const cell = this.termCreator.likeTermsCell;
    assert && assert(cell !== null);
    let oppositeLikeTerm = this.oppositePlate.getTermInCell(cell);
    if (oppositeLikeTerm) {
      const equivalentTerm = this.equivalentTerm;
      assert && assert(equivalentTerm);

      // opposite cell is occupied, combine equivalentTerm with term that's in the cell
      let combinedTerm = oppositeLikeTerm.plus(equivalentTerm);
      this.equivalentTermCreator.removeTermFromPlate(oppositeLikeTerm);

      // dispose of the terms used to create combinedTerm
      !oppositeLikeTerm.isDisposed && oppositeLikeTerm.dispose();
      oppositeLikeTerm = null;
      !equivalentTerm.isDisposed && equivalentTerm.dispose();
      this.equivalentTerm = null;
      if (combinedTerm.significantValue.getValue() === 0) {
        // Combined term is zero. No halo, since the terms are on the opposite side.
        oppositeSumToZeroNode = new SumToZeroNode({
          //TODO https://github.com/phetsims/equality-explorer/issues/200 dynamic
          variable: combinedTerm.getVariable(),
          fontSize: EqualityExplorerConstants.SUM_TO_ZERO_BIG_FONT_SIZE
        });

        // dispose of the combined term
        combinedTerm.dispose();
        combinedTerm = null;
      } else {
        // put the non-zero combined term on the opposite plate
        this.equivalentTermCreator.putTermOnPlate(combinedTerm, cell);
      }
    } else {
      // opposite cell is empty, put a big copy of equivalentTerm in that cell
      const equivalentTerm = this.equivalentTerm;
      assert && assert(equivalentTerm);
      const equivalentTermCopy = equivalentTerm.copy({
        diameter: EqualityExplorerConstants.BIG_TERM_DIAMETER
      });
      !equivalentTerm.isDisposed && equivalentTerm.dispose();
      this.equivalentTerm = null;
      this.equivalentTermCreator.putTermOnPlate(equivalentTermCopy, cell);
    }
    return oppositeSumToZeroNode;
  }

  /**
   * Animates terms to the cell for like terms.
   * All like terms occupy a specific cell on the plate.
   * If there's a term in that cell, then terms are combined to produce a new term that occupies the cell.
   * If the terms sum to zero, then the sum-to-zero animation is performed.
   */
  animateToPlate() {
    const likeTermsCell = this.termCreator.likeTermsCell;
    assert && assert(likeTermsCell !== null);
    const cellPosition = this.plate.getPositionOfCell(likeTermsCell);

    // This must be done here. If this.term is disposed later in this method, this.termNode will also be disposed,
    // and will not have a parent.
    const sumToZeroParent = this.termNode.getParent();
    assert && assert(sumToZeroParent, 'expected termNode to have a parent');
    this.term.pickableProperty.value = this.pickableWhileAnimating;
    this.term.animateTo(cellPosition, {
      // When the term reaches the cell ...
      animationCompletedCallback: () => {
        let termInCell = this.plate.getTermInCell(likeTermsCell);
        let maxIntegerExceeded = false;
        let combinedTerm; // {Term|undefined} defined when terms are combined to create a new 'big' term
        let sumToZeroNode; // {SumToZeroNode|undefined} defined when terms sum to zero

        //=======================================================================
        // On dragged term's side of the scale
        //=======================================================================

        if (!termInCell) {
          // If the cell is empty, make a 'big' copy of this term and put it in the cell.
          const termCopy = this.term.copy({
            diameter: EqualityExplorerConstants.BIG_TERM_DIAMETER
          });
          this.termCreator.putTermOnPlate(termCopy, likeTermsCell);

          // dispose of the original term
          !this.term.isDisposed && this.term.dispose();
        } else {
          // If the cell is not empty. Combine the terms to create a new 'big' term.
          combinedTerm = termInCell.plus(this.term);
          if (combinedTerm.maxIntegerExceeded()) {
            // The combined term would exceed the maxInteger limit. Make no changes to the other terms.
            maxIntegerExceeded = true;
            termInCell.haloVisibleProperty.value = false;
            combinedTerm.dispose();
            combinedTerm = null;
          } else if (combinedTerm.sign === 0) {
            // Terms sum to zero. No halo, since the terms did not overlap when drag ended.
            sumToZeroNode = new SumToZeroNode({
              //TODO https://github.com/phetsims/equality-explorer/issues/200 dynamic
              variable: this.term.getVariable(),
              fontSize: EqualityExplorerConstants.SUM_TO_ZERO_BIG_FONT_SIZE
            });

            // dispose of terms that sum to zero
            !this.term.isDisposed && this.term.dispose();
            !termInCell.isDisposed && termInCell.dispose();
            termInCell = null;
            combinedTerm.dispose();
            combinedTerm = null;
          } else {
            // Defer putting combinedTerm on the plate until after we deal with equivalentTerm,
            // in case the equivalentTerm causes maxInteger to be exceeded.
          }
        }

        //=======================================================================
        // On opposite side of the scale
        //=======================================================================

        let oppositeSumToZeroNode; // {undefined|SumToZeroNode} defined if terms summed to zero on opposite plate
        if (this.equivalentTerm && !maxIntegerExceeded) {
          let oppositeLikeTerm = this.oppositePlate.getTermInCell(likeTermsCell);
          if (!oppositeLikeTerm) {
            // If the cell on the opposite side is empty, make a 'big' copy of equivalentTerm and put it in the cell.
            const equivalentTermCopy = this.equivalentTerm.copy({
              diameter: EqualityExplorerConstants.BIG_TERM_DIAMETER
            });
            this.equivalentTermCreator.putTermOnPlate(equivalentTermCopy, likeTermsCell);

            // dispose of the original equivalentTerm
            !this.equivalentTerm.isDisposed && this.equivalentTerm.dispose();
            this.equivalentTerm = null;
          } else {
            // The cell is not empty. Combine equivalentTerm with term that's in the cell
            let oppositeCombinedTerm = oppositeLikeTerm.plus(this.equivalentTerm);
            if (oppositeCombinedTerm.maxIntegerExceeded()) {
              // The combined term would exceed the maxInteger limit. Make no changes to the other terms.
              maxIntegerExceeded = true;
              oppositeLikeTerm.haloVisibleProperty.value = false;
              oppositeCombinedTerm.dispose();
              oppositeCombinedTerm = null;
            } else {
              // dispose of the terms used to create oppositeCombinedTerm
              oppositeLikeTerm.dispose();
              oppositeLikeTerm = null;
              !this.equivalentTerm.isDisposed && this.equivalentTerm.dispose();
              this.equivalentTerm = null;
              if (oppositeCombinedTerm.significantValue.getValue() === 0) {
                // terms summed to zero on opposite plate. No halo, since these terms are on opposite side.
                oppositeSumToZeroNode = new SumToZeroNode({
                  //TODO https://github.com/phetsims/equality-explorer/issues/200 dynamic
                  variable: oppositeCombinedTerm.getVariable(),
                  fontSize: EqualityExplorerConstants.SUM_TO_ZERO_BIG_FONT_SIZE
                });

                // dispose of combined term
                oppositeCombinedTerm.dispose();
                oppositeCombinedTerm = null;
              } else {
                // Put the combined term on the plate.
                this.equivalentTermCreator.putTermOnPlate(oppositeCombinedTerm, likeTermsCell);
              }
            }
          }
        }

        // If we still have equivalentTerm, restore its pickability.
        if (this.equivalentTerm) {
          this.equivalentTerm.pickableProperty.value = true;
          this.equivalentTerm = null;
        }
        if (maxIntegerExceeded) {
          // Notify listeners that maxInteger would be exceeded by this drag sequence.
          this.termCreator.maxIntegerExceededEmitter.emit();
        } else {
          if (combinedTerm) {
            // dispose of the terms used to create the combined term
            !this.term.isDisposed && this.term.dispose();
            assert && assert(termInCell);
            !termInCell.isDisposed && termInCell.dispose();
            termInCell = null;

            // Put the combined term on the plate.
            this.termCreator.putTermOnPlate(combinedTerm, likeTermsCell);
          }

          // Do sum-to-zero animations after both plates have moved.
          if (sumToZeroNode) {
            sumToZeroParent.addChild(sumToZeroNode);
            sumToZeroNode.center = this.plate.getPositionOfCell(likeTermsCell);
            sumToZeroNode.startAnimation();
          }
          if (oppositeSumToZeroNode) {
            sumToZeroParent.addChild(oppositeSumToZeroNode);
            oppositeSumToZeroNode.center = this.oppositePlate.getPositionOfCell(likeTermsCell);
            oppositeSumToZeroNode.startAnimation();
          }
        }
        assert && assert(this.equivalentTerm === null, 'equivalentTerm should be null');
      }
    });
  }
}
equalityExplorer.register('CombineTermsDragListener', CombineTermsDragListener);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJlcXVhbGl0eUV4cGxvcmVyIiwiRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cyIsIlN1bVRvWmVyb05vZGUiLCJUZXJtRHJhZ0xpc3RlbmVyIiwiY29tYmluZU9wdGlvbnMiLCJDb21iaW5lVGVybXNEcmFnTGlzdGVuZXIiLCJjb25zdHJ1Y3RvciIsInRlcm1Ob2RlIiwidGVybSIsInRlcm1DcmVhdG9yIiwicHJvdmlkZWRPcHRpb25zIiwiYXNzZXJ0IiwiY29tYmluZUxpa2VUZXJtc0VuYWJsZWQiLCJzdGFydE9wcG9zaXRlIiwibG9ja2VkUHJvcGVydHkiLCJ2YWx1ZSIsImxpa2VUZXJtc0NlbGwiLCJvcHBvc2l0ZUxpa2VUZXJtIiwib3Bwb3NpdGVQbGF0ZSIsImdldFRlcm1JbkNlbGwiLCJpbnZlcnNlVGVybSIsIm1pbnVzIiwiZXF1aXZhbGVudFRlcm1DcmVhdG9yIiwicmVtb3ZlVGVybUZyb21QbGF0ZSIsImRpc3Bvc2UiLCJzaWduaWZpY2FudFZhbHVlIiwiZ2V0VmFsdWUiLCJwdXRUZXJtT25QbGF0ZSIsImNyZWF0ZVRlcm0iLCJjb3B5T3B0aW9ucyIsInNpZ24iLCJlcXVpdmFsZW50VGVybSIsImVuZE9wcG9zaXRlIiwib3Bwb3NpdGVTdW1Ub1plcm9Ob2RlIiwiY2VsbCIsImNvbWJpbmVkVGVybSIsInBsdXMiLCJpc0Rpc3Bvc2VkIiwidmFyaWFibGUiLCJnZXRWYXJpYWJsZSIsImZvbnRTaXplIiwiU1VNX1RPX1pFUk9fQklHX0ZPTlRfU0laRSIsImVxdWl2YWxlbnRUZXJtQ29weSIsImNvcHkiLCJkaWFtZXRlciIsIkJJR19URVJNX0RJQU1FVEVSIiwiYW5pbWF0ZVRvUGxhdGUiLCJjZWxsUG9zaXRpb24iLCJwbGF0ZSIsImdldFBvc2l0aW9uT2ZDZWxsIiwic3VtVG9aZXJvUGFyZW50IiwiZ2V0UGFyZW50IiwicGlja2FibGVQcm9wZXJ0eSIsInBpY2thYmxlV2hpbGVBbmltYXRpbmciLCJhbmltYXRlVG8iLCJhbmltYXRpb25Db21wbGV0ZWRDYWxsYmFjayIsInRlcm1JbkNlbGwiLCJtYXhJbnRlZ2VyRXhjZWVkZWQiLCJzdW1Ub1plcm9Ob2RlIiwidGVybUNvcHkiLCJoYWxvVmlzaWJsZVByb3BlcnR5Iiwib3Bwb3NpdGVDb21iaW5lZFRlcm0iLCJtYXhJbnRlZ2VyRXhjZWVkZWRFbWl0dGVyIiwiZW1pdCIsImFkZENoaWxkIiwiY2VudGVyIiwic3RhcnRBbmltYXRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvbWJpbmVUZXJtc0RyYWdMaXN0ZW5lci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb21iaW5lVGVybXNEcmFnTGlzdGVuZXIgaXMgdXNlZCB3aGVuIGxpa2UgdGVybXMgYXJlIGNvbWJpbmVkIGluIG9uZSBjZWxsIG9uIGEgcGxhdGUuXHJcbiAqIFNlZSB0ZXJtaW5vbG9neSBhbmQgcmVxdWlyZW1lbnRzIGluIFRlcm1EcmFnTGlzdGVuZXIgc3VwZXJ0eXBlLlxyXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VxdWFsaXR5LWV4cGxvcmVyL2Jsb2IvbWFzdGVyL2RvYy9sb2NrLXNjZW5hcmlvcy5tZCBmb3Igc2NlbmFyaW9zIHRoYXRcclxuICogZGVzY3JpYmUgaG93IHRoaXMgZmVhdHVyZSB3b3Jrcy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgZXF1YWxpdHlFeHBsb3JlciBmcm9tICcuLi8uLi9lcXVhbGl0eUV4cGxvcmVyLmpzJztcclxuaW1wb3J0IEVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMgZnJvbSAnLi4vRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBTdW1Ub1plcm9Ob2RlIGZyb20gJy4vU3VtVG9aZXJvTm9kZS5qcyc7XHJcbmltcG9ydCBUZXJtRHJhZ0xpc3RlbmVyLCB7IFRlcm1EcmFnTGlzdGVuZXJPcHRpb25zIH0gZnJvbSAnLi9UZXJtRHJhZ0xpc3RlbmVyLmpzJztcclxuaW1wb3J0IFRlcm1Ob2RlIGZyb20gJy4vVGVybU5vZGUuanMnO1xyXG5pbXBvcnQgVGVybSBmcm9tICcuLi9tb2RlbC9UZXJtLmpzJztcclxuaW1wb3J0IFRlcm1DcmVhdG9yLCB7IENyZWF0ZVRlcm1PcHRpb25zIH0gZnJvbSAnLi4vbW9kZWwvVGVybUNyZWF0b3IuanMnO1xyXG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIENvbWJpbmVUZXJtc0RyYWdMaXN0ZW5lck9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFRlcm1EcmFnTGlzdGVuZXJPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tYmluZVRlcm1zRHJhZ0xpc3RlbmVyIGV4dGVuZHMgVGVybURyYWdMaXN0ZW5lciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB0ZXJtTm9kZSAtIE5vZGUgdGhhdCB0aGUgbGlzdGVuZXIgaXMgYXR0YWNoZWQgdG9cclxuICAgKiBAcGFyYW0gdGVybSAtIHRoZSB0ZXJtIGJlaW5nIGRyYWdnZWRcclxuICAgKiBAcGFyYW0gdGVybUNyZWF0b3IgLSB0aGUgY3JlYXRvciBvZiB0ZXJtXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0ZXJtTm9kZTogVGVybU5vZGUsIHRlcm06IFRlcm0sIHRlcm1DcmVhdG9yOiBUZXJtQ3JlYXRvciwgcHJvdmlkZWRPcHRpb25zPzogQ29tYmluZVRlcm1zRHJhZ0xpc3RlbmVyT3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRlcm1DcmVhdG9yLmNvbWJpbmVMaWtlVGVybXNFbmFibGVkLCAnQ29tYmluZVRlcm1zRHJhZ0xpc3RlbmVyIGlzIHVzZWQgd2hlbiBsaWtlIHRlcm1zIGFyZSBjb21iaW5lZCcgKTtcclxuICAgIHN1cGVyKCB0ZXJtTm9kZSwgdGVybSwgdGVybUNyZWF0b3IsIHByb3ZpZGVkT3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gQmVsb3cgaGVyZSBpcyB0aGUgaW1wbGVtZW50YXRpb24gb2YgdGhlIFRlcm1EcmFnTGlzdGVuZXIgQVBJXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCBhdCB0aGUgc3RhcnQgb2YgYSBkcmFnIGN5Y2xlLCB3aGVuIGxvY2sgaXMgb24sIHRvIGhhbmRsZSByZWxhdGVkIHRlcm1zIG9uIHRoZSBvcHBvc2l0ZSBzaWRlIG9mIHRoZSBzY2FsZS5cclxuICAgKiBAcmV0dXJucyB0cnVlPXN1Y2Nlc3MsIGZhbHNlPWZhaWx1cmVcclxuICAgKi9cclxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgc3RhcnRPcHBvc2l0ZSgpOiBib29sZWFuIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMudGVybUNyZWF0b3IubG9ja2VkUHJvcGVydHkudmFsdWUsICdzdGFydE9wcG9zaXRlIHNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aGVuIGxvY2sgaXMgb24nICk7XHJcblxyXG4gICAgY29uc3QgbGlrZVRlcm1zQ2VsbCA9IHRoaXMudGVybUNyZWF0b3IubGlrZVRlcm1zQ2VsbCE7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsaWtlVGVybXNDZWxsICE9PSBudWxsICk7XHJcbiAgICBsZXQgb3Bwb3NpdGVMaWtlVGVybSA9IHRoaXMub3Bwb3NpdGVQbGF0ZS5nZXRUZXJtSW5DZWxsKCBsaWtlVGVybXNDZWxsICk7XHJcblxyXG4gICAgbGV0IGludmVyc2VUZXJtO1xyXG5cclxuICAgIGlmICggb3Bwb3NpdGVMaWtlVGVybSApIHtcclxuXHJcbiAgICAgIC8vIHN1YnRyYWN0IHRlcm0gZnJvbSB3aGF0J3Mgb24gdGhlIG9wcG9zaXRlIHBsYXRlXHJcbiAgICAgIGludmVyc2VUZXJtID0gb3Bwb3NpdGVMaWtlVGVybS5taW51cyggdGhpcy50ZXJtICk7XHJcbiAgICAgIHRoaXMuZXF1aXZhbGVudFRlcm1DcmVhdG9yLnJlbW92ZVRlcm1Gcm9tUGxhdGUoIG9wcG9zaXRlTGlrZVRlcm0gKTtcclxuICAgICAgb3Bwb3NpdGVMaWtlVGVybS5kaXNwb3NlKCk7XHJcbiAgICAgIG9wcG9zaXRlTGlrZVRlcm0gPSBudWxsO1xyXG4gICAgICBpZiAoIGludmVyc2VUZXJtLnNpZ25pZmljYW50VmFsdWUuZ2V0VmFsdWUoKSA9PT0gMCApIHtcclxuICAgICAgICBpbnZlcnNlVGVybS5kaXNwb3NlKCk7XHJcbiAgICAgICAgaW52ZXJzZVRlcm0gPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZXF1aXZhbGVudFRlcm1DcmVhdG9yLnB1dFRlcm1PblBsYXRlKCBpbnZlcnNlVGVybSwgbGlrZVRlcm1zQ2VsbCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIHRoZXJlIHdhcyBub3RoaW5nIG9uIHRoZSBvcHBvc2l0ZSBwbGF0ZSwgc28gY3JlYXRlIHRoZSBpbnZlcnNlIG9mIHRoZSBlcXVpdmFsZW50IHRlcm1cclxuICAgICAgaW52ZXJzZVRlcm0gPSB0aGlzLmVxdWl2YWxlbnRUZXJtQ3JlYXRvci5jcmVhdGVUZXJtKFxyXG4gICAgICAgIGNvbWJpbmVPcHRpb25zPENyZWF0ZVRlcm1PcHRpb25zPigge30sIHRoaXMudGVybS5jb3B5T3B0aW9ucygpLCB7XHJcbiAgICAgICAgICBzaWduOiAtMVxyXG4gICAgICAgIH0gKSApO1xyXG4gICAgICB0aGlzLmVxdWl2YWxlbnRUZXJtQ3JlYXRvci5wdXRUZXJtT25QbGF0ZSggaW52ZXJzZVRlcm0sIGxpa2VUZXJtc0NlbGwgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIGVxdWl2YWxlbnQgdGVybSBsYXN0LCBzbyBpdCdzIGluIGZyb250XHJcbiAgICB0aGlzLmVxdWl2YWxlbnRUZXJtID0gdGhpcy5lcXVpdmFsZW50VGVybUNyZWF0b3IuY3JlYXRlVGVybSggdGhpcy50ZXJtLmNvcHlPcHRpb25zKCkgKTtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCBhdCB0aGUgZW5kIG9mIGEgZHJhZyBjeWNsZSwgd2hlbiBsb2NrIGlzIG9uLCB0byBoYW5kbGUgcmVsYXRlZCB0ZXJtcyBvbiB0aGUgb3Bwb3NpdGUgc2lkZSBvZiB0aGUgc2NhbGUuXHJcbiAgICogQHJldHVybnMgbm9uLW51bGwgaWYgdGhlIGRyYWcgcmVzdWx0cyBpbiB0ZXJtcyBvbiB0aGUgb3Bwb3NpdGUgcGxhdGUgc3VtbWluZyB0byB6ZXJvXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGVuZE9wcG9zaXRlKCk6IFN1bVRvWmVyb05vZGUgfCBudWxsIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMudGVybUNyZWF0b3IubG9ja2VkUHJvcGVydHkudmFsdWUsICdlbmRPcHBvc2l0ZSBzaG91bGQgb25seSBiZSBjYWxsZWQgd2hlbiBsb2NrIGlzIG9uJyApO1xyXG5cclxuICAgIC8vIHtTdW1Ub1plcm9Ob2RlfG51bGx9IHRydXRoeSB3aGVuIHRlcm1zIHN1bSB0byB6ZXJvXHJcbiAgICBsZXQgb3Bwb3NpdGVTdW1Ub1plcm9Ob2RlID0gbnVsbDtcclxuXHJcbiAgICBjb25zdCBjZWxsID0gdGhpcy50ZXJtQ3JlYXRvci5saWtlVGVybXNDZWxsITtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNlbGwgIT09IG51bGwgKTtcclxuICAgIGxldCBvcHBvc2l0ZUxpa2VUZXJtID0gdGhpcy5vcHBvc2l0ZVBsYXRlLmdldFRlcm1JbkNlbGwoIGNlbGwgKTtcclxuICAgIGlmICggb3Bwb3NpdGVMaWtlVGVybSApIHtcclxuXHJcbiAgICAgIGNvbnN0IGVxdWl2YWxlbnRUZXJtID0gdGhpcy5lcXVpdmFsZW50VGVybSE7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGVxdWl2YWxlbnRUZXJtICk7XHJcblxyXG4gICAgICAvLyBvcHBvc2l0ZSBjZWxsIGlzIG9jY3VwaWVkLCBjb21iaW5lIGVxdWl2YWxlbnRUZXJtIHdpdGggdGVybSB0aGF0J3MgaW4gdGhlIGNlbGxcclxuICAgICAgbGV0IGNvbWJpbmVkVGVybTogVGVybSB8IG51bGwgPSBvcHBvc2l0ZUxpa2VUZXJtLnBsdXMoIGVxdWl2YWxlbnRUZXJtICk7XHJcbiAgICAgIHRoaXMuZXF1aXZhbGVudFRlcm1DcmVhdG9yLnJlbW92ZVRlcm1Gcm9tUGxhdGUoIG9wcG9zaXRlTGlrZVRlcm0gKTtcclxuXHJcbiAgICAgIC8vIGRpc3Bvc2Ugb2YgdGhlIHRlcm1zIHVzZWQgdG8gY3JlYXRlIGNvbWJpbmVkVGVybVxyXG4gICAgICAhb3Bwb3NpdGVMaWtlVGVybS5pc0Rpc3Bvc2VkICYmIG9wcG9zaXRlTGlrZVRlcm0uZGlzcG9zZSgpO1xyXG4gICAgICBvcHBvc2l0ZUxpa2VUZXJtID0gbnVsbDtcclxuICAgICAgIWVxdWl2YWxlbnRUZXJtLmlzRGlzcG9zZWQgJiYgZXF1aXZhbGVudFRlcm0uZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLmVxdWl2YWxlbnRUZXJtID0gbnVsbDtcclxuXHJcbiAgICAgIGlmICggY29tYmluZWRUZXJtLnNpZ25pZmljYW50VmFsdWUuZ2V0VmFsdWUoKSA9PT0gMCApIHtcclxuXHJcbiAgICAgICAgLy8gQ29tYmluZWQgdGVybSBpcyB6ZXJvLiBObyBoYWxvLCBzaW5jZSB0aGUgdGVybXMgYXJlIG9uIHRoZSBvcHBvc2l0ZSBzaWRlLlxyXG4gICAgICAgIG9wcG9zaXRlU3VtVG9aZXJvTm9kZSA9IG5ldyBTdW1Ub1plcm9Ob2RlKCB7IC8vVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzIwMCBkeW5hbWljXHJcbiAgICAgICAgICB2YXJpYWJsZTogY29tYmluZWRUZXJtLmdldFZhcmlhYmxlKCksXHJcbiAgICAgICAgICBmb250U2l6ZTogRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cy5TVU1fVE9fWkVST19CSUdfRk9OVF9TSVpFXHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAvLyBkaXNwb3NlIG9mIHRoZSBjb21iaW5lZCB0ZXJtXHJcbiAgICAgICAgY29tYmluZWRUZXJtLmRpc3Bvc2UoKTtcclxuICAgICAgICBjb21iaW5lZFRlcm0gPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBwdXQgdGhlIG5vbi16ZXJvIGNvbWJpbmVkIHRlcm0gb24gdGhlIG9wcG9zaXRlIHBsYXRlXHJcbiAgICAgICAgdGhpcy5lcXVpdmFsZW50VGVybUNyZWF0b3IucHV0VGVybU9uUGxhdGUoIGNvbWJpbmVkVGVybSwgY2VsbCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIG9wcG9zaXRlIGNlbGwgaXMgZW1wdHksIHB1dCBhIGJpZyBjb3B5IG9mIGVxdWl2YWxlbnRUZXJtIGluIHRoYXQgY2VsbFxyXG4gICAgICBjb25zdCBlcXVpdmFsZW50VGVybSA9IHRoaXMuZXF1aXZhbGVudFRlcm0hO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlcXVpdmFsZW50VGVybSApO1xyXG4gICAgICBjb25zdCBlcXVpdmFsZW50VGVybUNvcHkgPSBlcXVpdmFsZW50VGVybS5jb3B5KCB7XHJcbiAgICAgICAgZGlhbWV0ZXI6IEVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMuQklHX1RFUk1fRElBTUVURVJcclxuICAgICAgfSApO1xyXG4gICAgICAhZXF1aXZhbGVudFRlcm0uaXNEaXNwb3NlZCAmJiBlcXVpdmFsZW50VGVybS5kaXNwb3NlKCk7XHJcbiAgICAgIHRoaXMuZXF1aXZhbGVudFRlcm0gPSBudWxsO1xyXG4gICAgICB0aGlzLmVxdWl2YWxlbnRUZXJtQ3JlYXRvci5wdXRUZXJtT25QbGF0ZSggZXF1aXZhbGVudFRlcm1Db3B5LCBjZWxsICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG9wcG9zaXRlU3VtVG9aZXJvTm9kZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFuaW1hdGVzIHRlcm1zIHRvIHRoZSBjZWxsIGZvciBsaWtlIHRlcm1zLlxyXG4gICAqIEFsbCBsaWtlIHRlcm1zIG9jY3VweSBhIHNwZWNpZmljIGNlbGwgb24gdGhlIHBsYXRlLlxyXG4gICAqIElmIHRoZXJlJ3MgYSB0ZXJtIGluIHRoYXQgY2VsbCwgdGhlbiB0ZXJtcyBhcmUgY29tYmluZWQgdG8gcHJvZHVjZSBhIG5ldyB0ZXJtIHRoYXQgb2NjdXBpZXMgdGhlIGNlbGwuXHJcbiAgICogSWYgdGhlIHRlcm1zIHN1bSB0byB6ZXJvLCB0aGVuIHRoZSBzdW0tdG8temVybyBhbmltYXRpb24gaXMgcGVyZm9ybWVkLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBvdmVycmlkZSBhbmltYXRlVG9QbGF0ZSgpOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBsaWtlVGVybXNDZWxsID0gdGhpcy50ZXJtQ3JlYXRvci5saWtlVGVybXNDZWxsITtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpa2VUZXJtc0NlbGwgIT09IG51bGwgKTtcclxuICAgIGNvbnN0IGNlbGxQb3NpdGlvbiA9IHRoaXMucGxhdGUuZ2V0UG9zaXRpb25PZkNlbGwoIGxpa2VUZXJtc0NlbGwgKTtcclxuXHJcbiAgICAvLyBUaGlzIG11c3QgYmUgZG9uZSBoZXJlLiBJZiB0aGlzLnRlcm0gaXMgZGlzcG9zZWQgbGF0ZXIgaW4gdGhpcyBtZXRob2QsIHRoaXMudGVybU5vZGUgd2lsbCBhbHNvIGJlIGRpc3Bvc2VkLFxyXG4gICAgLy8gYW5kIHdpbGwgbm90IGhhdmUgYSBwYXJlbnQuXHJcbiAgICBjb25zdCBzdW1Ub1plcm9QYXJlbnQgPSB0aGlzLnRlcm1Ob2RlLmdldFBhcmVudCgpITtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHN1bVRvWmVyb1BhcmVudCwgJ2V4cGVjdGVkIHRlcm1Ob2RlIHRvIGhhdmUgYSBwYXJlbnQnICk7XHJcblxyXG4gICAgdGhpcy50ZXJtLnBpY2thYmxlUHJvcGVydHkudmFsdWUgPSB0aGlzLnBpY2thYmxlV2hpbGVBbmltYXRpbmc7XHJcblxyXG4gICAgdGhpcy50ZXJtLmFuaW1hdGVUbyggY2VsbFBvc2l0aW9uLCB7XHJcblxyXG4gICAgICAvLyBXaGVuIHRoZSB0ZXJtIHJlYWNoZXMgdGhlIGNlbGwgLi4uXHJcbiAgICAgIGFuaW1hdGlvbkNvbXBsZXRlZENhbGxiYWNrOiAoKSA9PiB7XHJcblxyXG4gICAgICAgIGxldCB0ZXJtSW5DZWxsID0gdGhpcy5wbGF0ZS5nZXRUZXJtSW5DZWxsKCBsaWtlVGVybXNDZWxsICk7XHJcbiAgICAgICAgbGV0IG1heEludGVnZXJFeGNlZWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBjb21iaW5lZFRlcm07IC8vIHtUZXJtfHVuZGVmaW5lZH0gZGVmaW5lZCB3aGVuIHRlcm1zIGFyZSBjb21iaW5lZCB0byBjcmVhdGUgYSBuZXcgJ2JpZycgdGVybVxyXG4gICAgICAgIGxldCBzdW1Ub1plcm9Ob2RlOyAvLyB7U3VtVG9aZXJvTm9kZXx1bmRlZmluZWR9IGRlZmluZWQgd2hlbiB0ZXJtcyBzdW0gdG8gemVyb1xyXG5cclxuICAgICAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAgICAgLy8gT24gZHJhZ2dlZCB0ZXJtJ3Mgc2lkZSBvZiB0aGUgc2NhbGVcclxuICAgICAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICAgICAgIGlmICggIXRlcm1JbkNlbGwgKSB7XHJcblxyXG4gICAgICAgICAgLy8gSWYgdGhlIGNlbGwgaXMgZW1wdHksIG1ha2UgYSAnYmlnJyBjb3B5IG9mIHRoaXMgdGVybSBhbmQgcHV0IGl0IGluIHRoZSBjZWxsLlxyXG4gICAgICAgICAgY29uc3QgdGVybUNvcHkgPSB0aGlzLnRlcm0uY29weSgge1xyXG4gICAgICAgICAgICBkaWFtZXRlcjogRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cy5CSUdfVEVSTV9ESUFNRVRFUlxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgICAgdGhpcy50ZXJtQ3JlYXRvci5wdXRUZXJtT25QbGF0ZSggdGVybUNvcHksIGxpa2VUZXJtc0NlbGwgKTtcclxuXHJcbiAgICAgICAgICAvLyBkaXNwb3NlIG9mIHRoZSBvcmlnaW5hbCB0ZXJtXHJcbiAgICAgICAgICAhdGhpcy50ZXJtLmlzRGlzcG9zZWQgJiYgdGhpcy50ZXJtLmRpc3Bvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gSWYgdGhlIGNlbGwgaXMgbm90IGVtcHR5LiBDb21iaW5lIHRoZSB0ZXJtcyB0byBjcmVhdGUgYSBuZXcgJ2JpZycgdGVybS5cclxuICAgICAgICAgIGNvbWJpbmVkVGVybSA9IHRlcm1JbkNlbGwucGx1cyggdGhpcy50ZXJtICk7XHJcblxyXG4gICAgICAgICAgaWYgKCBjb21iaW5lZFRlcm0ubWF4SW50ZWdlckV4Y2VlZGVkKCkgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgY29tYmluZWQgdGVybSB3b3VsZCBleGNlZWQgdGhlIG1heEludGVnZXIgbGltaXQuIE1ha2Ugbm8gY2hhbmdlcyB0byB0aGUgb3RoZXIgdGVybXMuXHJcbiAgICAgICAgICAgIG1heEludGVnZXJFeGNlZWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRlcm1JbkNlbGwuaGFsb1Zpc2libGVQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjb21iaW5lZFRlcm0uZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICBjb21iaW5lZFRlcm0gPSBudWxsO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIGNvbWJpbmVkVGVybS5zaWduID09PSAwICkge1xyXG5cclxuICAgICAgICAgICAgLy8gVGVybXMgc3VtIHRvIHplcm8uIE5vIGhhbG8sIHNpbmNlIHRoZSB0ZXJtcyBkaWQgbm90IG92ZXJsYXAgd2hlbiBkcmFnIGVuZGVkLlxyXG4gICAgICAgICAgICBzdW1Ub1plcm9Ob2RlID0gbmV3IFN1bVRvWmVyb05vZGUoIHsgLy9UT0RPIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lcXVhbGl0eS1leHBsb3Jlci9pc3N1ZXMvMjAwIGR5bmFtaWNcclxuICAgICAgICAgICAgICB2YXJpYWJsZTogdGhpcy50ZXJtLmdldFZhcmlhYmxlKCksXHJcbiAgICAgICAgICAgICAgZm9udFNpemU6IEVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMuU1VNX1RPX1pFUk9fQklHX0ZPTlRfU0laRVxyXG4gICAgICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgICAgICAvLyBkaXNwb3NlIG9mIHRlcm1zIHRoYXQgc3VtIHRvIHplcm9cclxuICAgICAgICAgICAgIXRoaXMudGVybS5pc0Rpc3Bvc2VkICYmIHRoaXMudGVybS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgICF0ZXJtSW5DZWxsLmlzRGlzcG9zZWQgJiYgdGVybUluQ2VsbC5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgIHRlcm1JbkNlbGwgPSBudWxsO1xyXG4gICAgICAgICAgICBjb21iaW5lZFRlcm0uZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICBjb21iaW5lZFRlcm0gPSBudWxsO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIERlZmVyIHB1dHRpbmcgY29tYmluZWRUZXJtIG9uIHRoZSBwbGF0ZSB1bnRpbCBhZnRlciB3ZSBkZWFsIHdpdGggZXF1aXZhbGVudFRlcm0sXHJcbiAgICAgICAgICAgIC8vIGluIGNhc2UgdGhlIGVxdWl2YWxlbnRUZXJtIGNhdXNlcyBtYXhJbnRlZ2VyIHRvIGJlIGV4Y2VlZGVkLlxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgICAgIC8vIE9uIG9wcG9zaXRlIHNpZGUgb2YgdGhlIHNjYWxlXHJcbiAgICAgICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgICAgICBsZXQgb3Bwb3NpdGVTdW1Ub1plcm9Ob2RlOyAvLyB7dW5kZWZpbmVkfFN1bVRvWmVyb05vZGV9IGRlZmluZWQgaWYgdGVybXMgc3VtbWVkIHRvIHplcm8gb24gb3Bwb3NpdGUgcGxhdGVcclxuICAgICAgICBpZiAoIHRoaXMuZXF1aXZhbGVudFRlcm0gJiYgIW1heEludGVnZXJFeGNlZWRlZCApIHtcclxuXHJcbiAgICAgICAgICBsZXQgb3Bwb3NpdGVMaWtlVGVybSA9IHRoaXMub3Bwb3NpdGVQbGF0ZS5nZXRUZXJtSW5DZWxsKCBsaWtlVGVybXNDZWxsICk7XHJcblxyXG4gICAgICAgICAgaWYgKCAhb3Bwb3NpdGVMaWtlVGVybSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHRoZSBjZWxsIG9uIHRoZSBvcHBvc2l0ZSBzaWRlIGlzIGVtcHR5LCBtYWtlIGEgJ2JpZycgY29weSBvZiBlcXVpdmFsZW50VGVybSBhbmQgcHV0IGl0IGluIHRoZSBjZWxsLlxyXG4gICAgICAgICAgICBjb25zdCBlcXVpdmFsZW50VGVybUNvcHkgPSB0aGlzLmVxdWl2YWxlbnRUZXJtLmNvcHkoIHtcclxuICAgICAgICAgICAgICBkaWFtZXRlcjogRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cy5CSUdfVEVSTV9ESUFNRVRFUlxyXG4gICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICAgIHRoaXMuZXF1aXZhbGVudFRlcm1DcmVhdG9yLnB1dFRlcm1PblBsYXRlKCBlcXVpdmFsZW50VGVybUNvcHksIGxpa2VUZXJtc0NlbGwgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGRpc3Bvc2Ugb2YgdGhlIG9yaWdpbmFsIGVxdWl2YWxlbnRUZXJtXHJcbiAgICAgICAgICAgICF0aGlzLmVxdWl2YWxlbnRUZXJtLmlzRGlzcG9zZWQgJiYgdGhpcy5lcXVpdmFsZW50VGVybS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZXF1aXZhbGVudFRlcm0gPSBudWxsO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgY2VsbCBpcyBub3QgZW1wdHkuIENvbWJpbmUgZXF1aXZhbGVudFRlcm0gd2l0aCB0ZXJtIHRoYXQncyBpbiB0aGUgY2VsbFxyXG4gICAgICAgICAgICBsZXQgb3Bwb3NpdGVDb21iaW5lZFRlcm06IFRlcm0gfCBudWxsID0gb3Bwb3NpdGVMaWtlVGVybS5wbHVzKCB0aGlzLmVxdWl2YWxlbnRUZXJtICk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIG9wcG9zaXRlQ29tYmluZWRUZXJtLm1heEludGVnZXJFeGNlZWRlZCgpICkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBUaGUgY29tYmluZWQgdGVybSB3b3VsZCBleGNlZWQgdGhlIG1heEludGVnZXIgbGltaXQuIE1ha2Ugbm8gY2hhbmdlcyB0byB0aGUgb3RoZXIgdGVybXMuXHJcbiAgICAgICAgICAgICAgbWF4SW50ZWdlckV4Y2VlZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICBvcHBvc2l0ZUxpa2VUZXJtLmhhbG9WaXNpYmxlUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICBvcHBvc2l0ZUNvbWJpbmVkVGVybS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgICAgb3Bwb3NpdGVDb21iaW5lZFRlcm0gPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAvLyBkaXNwb3NlIG9mIHRoZSB0ZXJtcyB1c2VkIHRvIGNyZWF0ZSBvcHBvc2l0ZUNvbWJpbmVkVGVybVxyXG4gICAgICAgICAgICAgIG9wcG9zaXRlTGlrZVRlcm0uZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgIG9wcG9zaXRlTGlrZVRlcm0gPSBudWxsO1xyXG4gICAgICAgICAgICAgICF0aGlzLmVxdWl2YWxlbnRUZXJtLmlzRGlzcG9zZWQgJiYgdGhpcy5lcXVpdmFsZW50VGVybS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgICAgdGhpcy5lcXVpdmFsZW50VGVybSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgIGlmICggb3Bwb3NpdGVDb21iaW5lZFRlcm0uc2lnbmlmaWNhbnRWYWx1ZS5nZXRWYWx1ZSgpID09PSAwICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHRlcm1zIHN1bW1lZCB0byB6ZXJvIG9uIG9wcG9zaXRlIHBsYXRlLiBObyBoYWxvLCBzaW5jZSB0aGVzZSB0ZXJtcyBhcmUgb24gb3Bwb3NpdGUgc2lkZS5cclxuICAgICAgICAgICAgICAgIG9wcG9zaXRlU3VtVG9aZXJvTm9kZSA9IG5ldyBTdW1Ub1plcm9Ob2RlKCB7IC8vVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzIwMCBkeW5hbWljXHJcbiAgICAgICAgICAgICAgICAgIHZhcmlhYmxlOiBvcHBvc2l0ZUNvbWJpbmVkVGVybS5nZXRWYXJpYWJsZSgpLFxyXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cy5TVU1fVE9fWkVST19CSUdfRk9OVF9TSVpFXHJcbiAgICAgICAgICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gZGlzcG9zZSBvZiBjb21iaW5lZCB0ZXJtXHJcbiAgICAgICAgICAgICAgICBvcHBvc2l0ZUNvbWJpbmVkVGVybS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgICAgICBvcHBvc2l0ZUNvbWJpbmVkVGVybSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFB1dCB0aGUgY29tYmluZWQgdGVybSBvbiB0aGUgcGxhdGUuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVxdWl2YWxlbnRUZXJtQ3JlYXRvci5wdXRUZXJtT25QbGF0ZSggb3Bwb3NpdGVDb21iaW5lZFRlcm0sIGxpa2VUZXJtc0NlbGwgKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIHdlIHN0aWxsIGhhdmUgZXF1aXZhbGVudFRlcm0sIHJlc3RvcmUgaXRzIHBpY2thYmlsaXR5LlxyXG4gICAgICAgIGlmICggdGhpcy5lcXVpdmFsZW50VGVybSApIHtcclxuICAgICAgICAgIHRoaXMuZXF1aXZhbGVudFRlcm0ucGlja2FibGVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLmVxdWl2YWxlbnRUZXJtID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICggbWF4SW50ZWdlckV4Y2VlZGVkICkge1xyXG5cclxuICAgICAgICAgIC8vIE5vdGlmeSBsaXN0ZW5lcnMgdGhhdCBtYXhJbnRlZ2VyIHdvdWxkIGJlIGV4Y2VlZGVkIGJ5IHRoaXMgZHJhZyBzZXF1ZW5jZS5cclxuICAgICAgICAgIHRoaXMudGVybUNyZWF0b3IubWF4SW50ZWdlckV4Y2VlZGVkRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgIGlmICggY29tYmluZWRUZXJtICkge1xyXG5cclxuICAgICAgICAgICAgLy8gZGlzcG9zZSBvZiB0aGUgdGVybXMgdXNlZCB0byBjcmVhdGUgdGhlIGNvbWJpbmVkIHRlcm1cclxuICAgICAgICAgICAgIXRoaXMudGVybS5pc0Rpc3Bvc2VkICYmIHRoaXMudGVybS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRlcm1JbkNlbGwgKTtcclxuICAgICAgICAgICAgIXRlcm1JbkNlbGwhLmlzRGlzcG9zZWQgJiYgdGVybUluQ2VsbCEuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICB0ZXJtSW5DZWxsID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIFB1dCB0aGUgY29tYmluZWQgdGVybSBvbiB0aGUgcGxhdGUuXHJcbiAgICAgICAgICAgIHRoaXMudGVybUNyZWF0b3IucHV0VGVybU9uUGxhdGUoIGNvbWJpbmVkVGVybSwgbGlrZVRlcm1zQ2VsbCApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIERvIHN1bS10by16ZXJvIGFuaW1hdGlvbnMgYWZ0ZXIgYm90aCBwbGF0ZXMgaGF2ZSBtb3ZlZC5cclxuICAgICAgICAgIGlmICggc3VtVG9aZXJvTm9kZSApIHtcclxuICAgICAgICAgICAgc3VtVG9aZXJvUGFyZW50LmFkZENoaWxkKCBzdW1Ub1plcm9Ob2RlICk7XHJcbiAgICAgICAgICAgIHN1bVRvWmVyb05vZGUuY2VudGVyID0gdGhpcy5wbGF0ZS5nZXRQb3NpdGlvbk9mQ2VsbCggbGlrZVRlcm1zQ2VsbCApO1xyXG4gICAgICAgICAgICBzdW1Ub1plcm9Ob2RlLnN0YXJ0QW5pbWF0aW9uKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoIG9wcG9zaXRlU3VtVG9aZXJvTm9kZSApIHtcclxuICAgICAgICAgICAgc3VtVG9aZXJvUGFyZW50LmFkZENoaWxkKCBvcHBvc2l0ZVN1bVRvWmVyb05vZGUgKTtcclxuICAgICAgICAgICAgb3Bwb3NpdGVTdW1Ub1plcm9Ob2RlLmNlbnRlciA9IHRoaXMub3Bwb3NpdGVQbGF0ZS5nZXRQb3NpdGlvbk9mQ2VsbCggbGlrZVRlcm1zQ2VsbCApO1xyXG4gICAgICAgICAgICBvcHBvc2l0ZVN1bVRvWmVyb05vZGUuc3RhcnRBbmltYXRpb24oKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZXF1aXZhbGVudFRlcm0gPT09IG51bGwsICdlcXVpdmFsZW50VGVybSBzaG91bGQgYmUgbnVsbCcgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZXF1YWxpdHlFeHBsb3Jlci5yZWdpc3RlciggJ0NvbWJpbmVUZXJtc0RyYWdMaXN0ZW5lcicsIENvbWJpbmVUZXJtc0RyYWdMaXN0ZW5lciApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MseUJBQXlCLE1BQU0saUNBQWlDO0FBQ3ZFLE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFDOUMsT0FBT0MsZ0JBQWdCLE1BQW1DLHVCQUF1QjtBQUlqRixTQUFTQyxjQUFjLFFBQTBCLHVDQUF1QztBQU14RixlQUFlLE1BQU1DLHdCQUF3QixTQUFTRixnQkFBZ0IsQ0FBQztFQUVyRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0csV0FBV0EsQ0FB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