// Copyright 2016-2020, University of Colorado Boulder

/**
 * Model for the terms in the addition "leftTerm + rightTerm =".
 *
 * @author Sharfudeen Ashraf
 */

import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Property from '../../../../../axon/js/Property.js';
import makeATen from '../../../makeATen.js';
import ActiveTerm from '../../adding/model/ActiveTerm.js';
class AdditionTerms {
  constructor() {
    // @public {NumberProperty} - The left-hand term for the addition.
    this.leftTermProperty = new NumberProperty(0);

    // @public {NumberProperty} - The left-hand term for the addition.
    this.rightTermProperty = new NumberProperty(0);

    // @public {Property.<ActiveTerm>} - The active term being edited (left, right or none basically)
    this.activeTermProperty = new Property(ActiveTerm.NONE);
  }

  /**
   * Returns whether both of the terms have non-zero values (and are not being edited).
   * @public
   *
   * @returns {boolean}
   */
  hasBothTerms() {
    return this.activeTermProperty.value === ActiveTerm.NONE && this.leftTermProperty.value > 0 && this.rightTermProperty.value > 0;
  }

  /**
   * Reset all of the terms
   * @public
   */
  reset() {
    this.leftTermProperty.reset();
    this.rightTermProperty.reset();
    this.activeTermProperty.reset();
  }
}
makeATen.register('AdditionTerms', AdditionTerms);
export default AdditionTerms;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwibWFrZUFUZW4iLCJBY3RpdmVUZXJtIiwiQWRkaXRpb25UZXJtcyIsImNvbnN0cnVjdG9yIiwibGVmdFRlcm1Qcm9wZXJ0eSIsInJpZ2h0VGVybVByb3BlcnR5IiwiYWN0aXZlVGVybVByb3BlcnR5IiwiTk9ORSIsImhhc0JvdGhUZXJtcyIsInZhbHVlIiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFkZGl0aW9uVGVybXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgZm9yIHRoZSB0ZXJtcyBpbiB0aGUgYWRkaXRpb24gXCJsZWZ0VGVybSArIHJpZ2h0VGVybSA9XCIuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2hhcmZ1ZGVlbiBBc2hyYWZcclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IG1ha2VBVGVuIGZyb20gJy4uLy4uLy4uL21ha2VBVGVuLmpzJztcclxuaW1wb3J0IEFjdGl2ZVRlcm0gZnJvbSAnLi4vLi4vYWRkaW5nL21vZGVsL0FjdGl2ZVRlcm0uanMnO1xyXG5cclxuY2xhc3MgQWRkaXRpb25UZXJtcyB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAvLyBAcHVibGljIHtOdW1iZXJQcm9wZXJ0eX0gLSBUaGUgbGVmdC1oYW5kIHRlcm0gZm9yIHRoZSBhZGRpdGlvbi5cclxuICAgIHRoaXMubGVmdFRlcm1Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge051bWJlclByb3BlcnR5fSAtIFRoZSBsZWZ0LWhhbmQgdGVybSBmb3IgdGhlIGFkZGl0aW9uLlxyXG4gICAgdGhpcy5yaWdodFRlcm1Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxBY3RpdmVUZXJtPn0gLSBUaGUgYWN0aXZlIHRlcm0gYmVpbmcgZWRpdGVkIChsZWZ0LCByaWdodCBvciBub25lIGJhc2ljYWxseSlcclxuICAgIHRoaXMuYWN0aXZlVGVybVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBBY3RpdmVUZXJtLk5PTkUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBib3RoIG9mIHRoZSB0ZXJtcyBoYXZlIG5vbi16ZXJvIHZhbHVlcyAoYW5kIGFyZSBub3QgYmVpbmcgZWRpdGVkKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBoYXNCb3RoVGVybXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hY3RpdmVUZXJtUHJvcGVydHkudmFsdWUgPT09IEFjdGl2ZVRlcm0uTk9ORSAmJiB0aGlzLmxlZnRUZXJtUHJvcGVydHkudmFsdWUgPiAwICYmIHRoaXMucmlnaHRUZXJtUHJvcGVydHkudmFsdWUgPiAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgYWxsIG9mIHRoZSB0ZXJtc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMubGVmdFRlcm1Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5yaWdodFRlcm1Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5hY3RpdmVUZXJtUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbm1ha2VBVGVuLnJlZ2lzdGVyKCAnQWRkaXRpb25UZXJtcycsIEFkZGl0aW9uVGVybXMgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFkZGl0aW9uVGVybXM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSwwQ0FBMEM7QUFDckUsT0FBT0MsUUFBUSxNQUFNLG9DQUFvQztBQUN6RCxPQUFPQyxRQUFRLE1BQU0sc0JBQXNCO0FBQzNDLE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFFekQsTUFBTUMsYUFBYSxDQUFDO0VBQ2xCQyxXQUFXQSxDQUFBLEVBQUc7SUFDWjtJQUNBLElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUcsSUFBSU4sY0FBYyxDQUFFLENBQUUsQ0FBQzs7SUFFL0M7SUFDQSxJQUFJLENBQUNPLGlCQUFpQixHQUFHLElBQUlQLGNBQWMsQ0FBRSxDQUFFLENBQUM7O0lBRWhEO0lBQ0EsSUFBSSxDQUFDUSxrQkFBa0IsR0FBRyxJQUFJUCxRQUFRLENBQUVFLFVBQVUsQ0FBQ00sSUFBSyxDQUFDO0VBQzNEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxZQUFZQSxDQUFBLEVBQUc7SUFDYixPQUFPLElBQUksQ0FBQ0Ysa0JBQWtCLENBQUNHLEtBQUssS0FBS1IsVUFBVSxDQUFDTSxJQUFJLElBQUksSUFBSSxDQUFDSCxnQkFBZ0IsQ0FBQ0ssS0FBSyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUNKLGlCQUFpQixDQUFDSSxLQUFLLEdBQUcsQ0FBQztFQUNqSTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFQyxLQUFLQSxDQUFBLEVBQUc7SUFDTixJQUFJLENBQUNOLGdCQUFnQixDQUFDTSxLQUFLLENBQUMsQ0FBQztJQUM3QixJQUFJLENBQUNMLGlCQUFpQixDQUFDSyxLQUFLLENBQUMsQ0FBQztJQUM5QixJQUFJLENBQUNKLGtCQUFrQixDQUFDSSxLQUFLLENBQUMsQ0FBQztFQUNqQztBQUNGO0FBRUFWLFFBQVEsQ0FBQ1csUUFBUSxDQUFFLGVBQWUsRUFBRVQsYUFBYyxDQUFDO0FBRW5ELGVBQWVBLGFBQWEifQ==