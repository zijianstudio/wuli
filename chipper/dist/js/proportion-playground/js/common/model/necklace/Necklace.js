// Copyright 2016-2020, University of Colorado Boulder

/**
 * The model for a single necklace, which is a collection of round and square beads.  The pattern (order of beads)
 * is implemented in the view.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import proportionPlayground from '../../../proportionPlayground.js';
import ProportionPlaygroundConstants from '../../ProportionPlaygroundConstants.js';
import SceneRatio from '../SceneRatio.js';
import NecklaceLayout from './NecklaceLayout.js';
class Necklace extends SceneRatio {
  /**
   * @param {number} initialRoundCount - Initial number of round beads
   * @param {number} initialSquareCount - Initial number of square beads
   * @param {Property.<boolean>} visibleProperty - Whether our visual representation is visible
   * @param {Property.<boolean>} controlsVisibleProperty - Whether our controls are visible
   * @param {Tandem} tandem
   */
  constructor(initialRoundCount, initialSquareCount, visibleProperty, controlsVisibleProperty, tandem) {
    const roundBeadCountProperty = new NumberProperty(initialRoundCount, {
      range: ProportionPlaygroundConstants.BEAD_COUNT_RANGE,
      numberType: 'Integer',
      tandem: tandem.createTandem('roundBeadCountProperty')
    });
    const squareBeadCountProperty = new NumberProperty(initialSquareCount, {
      range: ProportionPlaygroundConstants.BEAD_COUNT_RANGE,
      numberType: 'Integer',
      tandem: tandem.createTandem('squareBeadCountProperty')
    });
    super(visibleProperty, controlsVisibleProperty, roundBeadCountProperty, squareBeadCountProperty, tandem);

    // @public {NumberProperty} - Quantity of round beads in the necklace
    this.roundBeadCountProperty = roundBeadCountProperty;

    // @public {NumberProperty} - Quantity of square beads in the necklace
    this.squareBeadCountProperty = squareBeadCountProperty;

    // @public {Property.<NecklaceLayout>}
    this.layoutProperty = new DerivedProperty([this.roundBeadCountProperty, this.squareBeadCountProperty], (roundBeadCount, squareBeadCount) => NecklaceLayout.getLayout(roundBeadCount, squareBeadCount));
  }
}
proportionPlayground.register('Necklace', Necklace);
export default Necklace;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsInByb3BvcnRpb25QbGF5Z3JvdW5kIiwiUHJvcG9ydGlvblBsYXlncm91bmRDb25zdGFudHMiLCJTY2VuZVJhdGlvIiwiTmVja2xhY2VMYXlvdXQiLCJOZWNrbGFjZSIsImNvbnN0cnVjdG9yIiwiaW5pdGlhbFJvdW5kQ291bnQiLCJpbml0aWFsU3F1YXJlQ291bnQiLCJ2aXNpYmxlUHJvcGVydHkiLCJjb250cm9sc1Zpc2libGVQcm9wZXJ0eSIsInRhbmRlbSIsInJvdW5kQmVhZENvdW50UHJvcGVydHkiLCJyYW5nZSIsIkJFQURfQ09VTlRfUkFOR0UiLCJudW1iZXJUeXBlIiwiY3JlYXRlVGFuZGVtIiwic3F1YXJlQmVhZENvdW50UHJvcGVydHkiLCJsYXlvdXRQcm9wZXJ0eSIsInJvdW5kQmVhZENvdW50Iiwic3F1YXJlQmVhZENvdW50IiwiZ2V0TGF5b3V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOZWNrbGFjZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgbW9kZWwgZm9yIGEgc2luZ2xlIG5lY2tsYWNlLCB3aGljaCBpcyBhIGNvbGxlY3Rpb24gb2Ygcm91bmQgYW5kIHNxdWFyZSBiZWFkcy4gIFRoZSBwYXR0ZXJuIChvcmRlciBvZiBiZWFkcylcclxuICogaXMgaW1wbGVtZW50ZWQgaW4gdGhlIHZpZXcuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IHByb3BvcnRpb25QbGF5Z3JvdW5kIGZyb20gJy4uLy4uLy4uL3Byb3BvcnRpb25QbGF5Z3JvdW5kLmpzJztcclxuaW1wb3J0IFByb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzIGZyb20gJy4uLy4uL1Byb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFNjZW5lUmF0aW8gZnJvbSAnLi4vU2NlbmVSYXRpby5qcyc7XHJcbmltcG9ydCBOZWNrbGFjZUxheW91dCBmcm9tICcuL05lY2tsYWNlTGF5b3V0LmpzJztcclxuXHJcbmNsYXNzIE5lY2tsYWNlIGV4dGVuZHMgU2NlbmVSYXRpbyB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluaXRpYWxSb3VuZENvdW50IC0gSW5pdGlhbCBudW1iZXIgb2Ygcm91bmQgYmVhZHNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5pdGlhbFNxdWFyZUNvdW50IC0gSW5pdGlhbCBudW1iZXIgb2Ygc3F1YXJlIGJlYWRzXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHZpc2libGVQcm9wZXJ0eSAtIFdoZXRoZXIgb3VyIHZpc3VhbCByZXByZXNlbnRhdGlvbiBpcyB2aXNpYmxlXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGNvbnRyb2xzVmlzaWJsZVByb3BlcnR5IC0gV2hldGhlciBvdXIgY29udHJvbHMgYXJlIHZpc2libGVcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGluaXRpYWxSb3VuZENvdW50LCBpbml0aWFsU3F1YXJlQ291bnQsIHZpc2libGVQcm9wZXJ0eSwgY29udHJvbHNWaXNpYmxlUHJvcGVydHksIHRhbmRlbSApIHtcclxuICAgIGNvbnN0IHJvdW5kQmVhZENvdW50UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIGluaXRpYWxSb3VuZENvdW50LCB7XHJcbiAgICAgIHJhbmdlOiBQcm9wb3J0aW9uUGxheWdyb3VuZENvbnN0YW50cy5CRUFEX0NPVU5UX1JBTkdFLFxyXG4gICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JvdW5kQmVhZENvdW50UHJvcGVydHknIClcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHNxdWFyZUJlYWRDb3VudFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBpbml0aWFsU3F1YXJlQ291bnQsIHtcclxuICAgICAgcmFuZ2U6IFByb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzLkJFQURfQ09VTlRfUkFOR0UsXHJcbiAgICAgIG51bWJlclR5cGU6ICdJbnRlZ2VyJyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3F1YXJlQmVhZENvdW50UHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggdmlzaWJsZVByb3BlcnR5LCBjb250cm9sc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgcm91bmRCZWFkQ291bnRQcm9wZXJ0eSxcclxuICAgICAgc3F1YXJlQmVhZENvdW50UHJvcGVydHksXHJcbiAgICAgIHRhbmRlbSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge051bWJlclByb3BlcnR5fSAtIFF1YW50aXR5IG9mIHJvdW5kIGJlYWRzIGluIHRoZSBuZWNrbGFjZVxyXG4gICAgdGhpcy5yb3VuZEJlYWRDb3VudFByb3BlcnR5ID0gcm91bmRCZWFkQ291bnRQcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtOdW1iZXJQcm9wZXJ0eX0gLSBRdWFudGl0eSBvZiBzcXVhcmUgYmVhZHMgaW4gdGhlIG5lY2tsYWNlXHJcbiAgICB0aGlzLnNxdWFyZUJlYWRDb3VudFByb3BlcnR5ID0gc3F1YXJlQmVhZENvdW50UHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPE5lY2tsYWNlTGF5b3V0Pn1cclxuICAgIHRoaXMubGF5b3V0UHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbXHJcbiAgICAgICAgdGhpcy5yb3VuZEJlYWRDb3VudFByb3BlcnR5LFxyXG4gICAgICAgIHRoaXMuc3F1YXJlQmVhZENvdW50UHJvcGVydHkgXSxcclxuICAgICAgKCByb3VuZEJlYWRDb3VudCwgc3F1YXJlQmVhZENvdW50ICkgPT4gTmVja2xhY2VMYXlvdXQuZ2V0TGF5b3V0KCByb3VuZEJlYWRDb3VudCwgc3F1YXJlQmVhZENvdW50ICkgKTtcclxuICB9XHJcbn1cclxuXHJcbnByb3BvcnRpb25QbGF5Z3JvdW5kLnJlZ2lzdGVyKCAnTmVja2xhY2UnLCBOZWNrbGFjZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTmVja2xhY2U7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLDJDQUEyQztBQUN2RSxPQUFPQyxjQUFjLE1BQU0sMENBQTBDO0FBQ3JFLE9BQU9DLG9CQUFvQixNQUFNLGtDQUFrQztBQUNuRSxPQUFPQyw2QkFBNkIsTUFBTSx3Q0FBd0M7QUFDbEYsT0FBT0MsVUFBVSxNQUFNLGtCQUFrQjtBQUN6QyxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBRWhELE1BQU1DLFFBQVEsU0FBU0YsVUFBVSxDQUFDO0VBQ2hDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLFdBQVdBLENBQUVDLGlCQUFpQixFQUFFQyxrQkFBa0IsRUFBRUMsZUFBZSxFQUFFQyx1QkFBdUIsRUFBRUMsTUFBTSxFQUFHO0lBQ3JHLE1BQU1DLHNCQUFzQixHQUFHLElBQUlaLGNBQWMsQ0FBRU8saUJBQWlCLEVBQUU7TUFDcEVNLEtBQUssRUFBRVgsNkJBQTZCLENBQUNZLGdCQUFnQjtNQUNyREMsVUFBVSxFQUFFLFNBQVM7TUFDckJKLE1BQU0sRUFBRUEsTUFBTSxDQUFDSyxZQUFZLENBQUUsd0JBQXlCO0lBQ3hELENBQUUsQ0FBQztJQUNILE1BQU1DLHVCQUF1QixHQUFHLElBQUlqQixjQUFjLENBQUVRLGtCQUFrQixFQUFFO01BQ3RFSyxLQUFLLEVBQUVYLDZCQUE2QixDQUFDWSxnQkFBZ0I7TUFDckRDLFVBQVUsRUFBRSxTQUFTO01BQ3JCSixNQUFNLEVBQUVBLE1BQU0sQ0FBQ0ssWUFBWSxDQUFFLHlCQUEwQjtJQUN6RCxDQUFFLENBQUM7SUFFSCxLQUFLLENBQUVQLGVBQWUsRUFBRUMsdUJBQXVCLEVBQzdDRSxzQkFBc0IsRUFDdEJLLHVCQUF1QixFQUN2Qk4sTUFBTyxDQUFDOztJQUVWO0lBQ0EsSUFBSSxDQUFDQyxzQkFBc0IsR0FBR0Esc0JBQXNCOztJQUVwRDtJQUNBLElBQUksQ0FBQ0ssdUJBQXVCLEdBQUdBLHVCQUF1Qjs7SUFFdEQ7SUFDQSxJQUFJLENBQUNDLGNBQWMsR0FBRyxJQUFJbkIsZUFBZSxDQUFFLENBQ3ZDLElBQUksQ0FBQ2Esc0JBQXNCLEVBQzNCLElBQUksQ0FBQ0ssdUJBQXVCLENBQUUsRUFDaEMsQ0FBRUUsY0FBYyxFQUFFQyxlQUFlLEtBQU1oQixjQUFjLENBQUNpQixTQUFTLENBQUVGLGNBQWMsRUFBRUMsZUFBZ0IsQ0FBRSxDQUFDO0VBQ3hHO0FBQ0Y7QUFFQW5CLG9CQUFvQixDQUFDcUIsUUFBUSxDQUFFLFVBQVUsRUFBRWpCLFFBQVMsQ0FBQztBQUVyRCxlQUFlQSxRQUFRIn0=