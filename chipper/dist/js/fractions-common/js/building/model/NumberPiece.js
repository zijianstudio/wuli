// Copyright 2018-2020, University of Colorado Boulder

/**
 * A movable number "piece" that can be combined/placed into groups.
 *
 * NOTE: The coordinate frame of pieces are always where the origin of this piece is at its centroid.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Animator from '../../common/model/Animator.js';
import fractionsCommon from '../../fractionsCommon.js';

// constants
const NUMBER_HEIGHT = 75;
const NUMBER_SINGLE_DIGIT_WIDTH = 54;
const NUMBER_DOUBLE_DIGIT_WIDTH = 80;
class NumberPiece {
  /**
   * @param {number} number
   */
  constructor(number) {
    // @public {number}
    this.number = number;

    // @public - Applies only while out in the play area (being animated or dragged)
    this.positionProperty = new Vector2Property(Vector2.ZERO);

    // @public {Property.<number>} - Applies only while out in the play area (being animated or dragged)
    this.scaleProperty = new NumberProperty(1);

    // @public {Property.<boolean>}
    this.isUserControlledProperty = new BooleanProperty(false);

    // @public {Property.<boolean>}
    this.isAnimatingProperty = new BooleanProperty(false);

    // @public {Animator}
    this.animator = new Animator({
      positionProperty: this.positionProperty,
      scaleProperty: this.scaleProperty,
      isAnimatingProperty: this.isAnimatingProperty
    });

    // @public {Bounds2}
    this.bounds = Bounds2.point(0, 0).dilatedXY((number >= 10 ? NUMBER_DOUBLE_DIGIT_WIDTH : NUMBER_SINGLE_DIGIT_WIDTH) / 2, NUMBER_HEIGHT / 2);
  }

  /**
   * Clears some associated temporary properties (that isn't a full reset), particularly before it is pulled from a
   * stack.
   * @public
   */
  clear() {
    this.scaleProperty.reset();
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step(dt) {
    this.animator.step(dt);
  }
}
fractionsCommon.register('NumberPiece', NumberPiece);
export default NumberPiece;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIkJvdW5kczIiLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5IiwiQW5pbWF0b3IiLCJmcmFjdGlvbnNDb21tb24iLCJOVU1CRVJfSEVJR0hUIiwiTlVNQkVSX1NJTkdMRV9ESUdJVF9XSURUSCIsIk5VTUJFUl9ET1VCTEVfRElHSVRfV0lEVEgiLCJOdW1iZXJQaWVjZSIsImNvbnN0cnVjdG9yIiwibnVtYmVyIiwicG9zaXRpb25Qcm9wZXJ0eSIsIlpFUk8iLCJzY2FsZVByb3BlcnR5IiwiaXNVc2VyQ29udHJvbGxlZFByb3BlcnR5IiwiaXNBbmltYXRpbmdQcm9wZXJ0eSIsImFuaW1hdG9yIiwiYm91bmRzIiwicG9pbnQiLCJkaWxhdGVkWFkiLCJjbGVhciIsInJlc2V0Iiwic3RlcCIsImR0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOdW1iZXJQaWVjZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIG1vdmFibGUgbnVtYmVyIFwicGllY2VcIiB0aGF0IGNhbiBiZSBjb21iaW5lZC9wbGFjZWQgaW50byBncm91cHMuXHJcbiAqXHJcbiAqIE5PVEU6IFRoZSBjb29yZGluYXRlIGZyYW1lIG9mIHBpZWNlcyBhcmUgYWx3YXlzIHdoZXJlIHRoZSBvcmlnaW4gb2YgdGhpcyBwaWVjZSBpcyBhdCBpdHMgY2VudHJvaWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IEFuaW1hdG9yIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9BbmltYXRvci5qcyc7XHJcbmltcG9ydCBmcmFjdGlvbnNDb21tb24gZnJvbSAnLi4vLi4vZnJhY3Rpb25zQ29tbW9uLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBOVU1CRVJfSEVJR0hUID0gNzU7XHJcbmNvbnN0IE5VTUJFUl9TSU5HTEVfRElHSVRfV0lEVEggPSA1NDtcclxuY29uc3QgTlVNQkVSX0RPVUJMRV9ESUdJVF9XSURUSCA9IDgwO1xyXG5cclxuY2xhc3MgTnVtYmVyUGllY2Uge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXJcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbnVtYmVyICkge1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMubnVtYmVyID0gbnVtYmVyO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBBcHBsaWVzIG9ubHkgd2hpbGUgb3V0IGluIHRoZSBwbGF5IGFyZWEgKGJlaW5nIGFuaW1hdGVkIG9yIGRyYWdnZWQpXHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBWZWN0b3IyLlpFUk8gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gLSBBcHBsaWVzIG9ubHkgd2hpbGUgb3V0IGluIHRoZSBwbGF5IGFyZWEgKGJlaW5nIGFuaW1hdGVkIG9yIGRyYWdnZWQpXHJcbiAgICB0aGlzLnNjYWxlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDEgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59XHJcbiAgICB0aGlzLmlzVXNlckNvbnRyb2xsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fVxyXG4gICAgdGhpcy5pc0FuaW1hdGluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBbmltYXRvcn1cclxuICAgIHRoaXMuYW5pbWF0b3IgPSBuZXcgQW5pbWF0b3IoIHtcclxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogdGhpcy5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBzY2FsZVByb3BlcnR5OiB0aGlzLnNjYWxlUHJvcGVydHksXHJcbiAgICAgIGlzQW5pbWF0aW5nUHJvcGVydHk6IHRoaXMuaXNBbmltYXRpbmdQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0JvdW5kczJ9XHJcbiAgICB0aGlzLmJvdW5kcyA9IEJvdW5kczIucG9pbnQoIDAsIDAgKS5kaWxhdGVkWFkoICggbnVtYmVyID49IDEwID8gTlVNQkVSX0RPVUJMRV9ESUdJVF9XSURUSCA6IE5VTUJFUl9TSU5HTEVfRElHSVRfV0lEVEggKSAvIDIsIE5VTUJFUl9IRUlHSFQgLyAyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhcnMgc29tZSBhc3NvY2lhdGVkIHRlbXBvcmFyeSBwcm9wZXJ0aWVzICh0aGF0IGlzbid0IGEgZnVsbCByZXNldCksIHBhcnRpY3VsYXJseSBiZWZvcmUgaXQgaXMgcHVsbGVkIGZyb20gYVxyXG4gICAqIHN0YWNrLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjbGVhcigpIHtcclxuICAgIHRoaXMuc2NhbGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcHMgZm9yd2FyZCBpbiB0aW1lLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy5hbmltYXRvci5zdGVwKCBkdCApO1xyXG4gIH1cclxufVxyXG5cclxuZnJhY3Rpb25zQ29tbW9uLnJlZ2lzdGVyKCAnTnVtYmVyUGllY2UnLCBOdW1iZXJQaWVjZSApO1xyXG5leHBvcnQgZGVmYXVsdCBOdW1iZXJQaWVjZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxRQUFRLE1BQU0sZ0NBQWdDO0FBQ3JELE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7O0FBRXREO0FBQ0EsTUFBTUMsYUFBYSxHQUFHLEVBQUU7QUFDeEIsTUFBTUMseUJBQXlCLEdBQUcsRUFBRTtBQUNwQyxNQUFNQyx5QkFBeUIsR0FBRyxFQUFFO0FBRXBDLE1BQU1DLFdBQVcsQ0FBQztFQUNoQjtBQUNGO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsTUFBTSxFQUFHO0lBRXBCO0lBQ0EsSUFBSSxDQUFDQSxNQUFNLEdBQUdBLE1BQU07O0lBRXBCO0lBQ0EsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBRyxJQUFJVCxlQUFlLENBQUVELE9BQU8sQ0FBQ1csSUFBSyxDQUFDOztJQUUzRDtJQUNBLElBQUksQ0FBQ0MsYUFBYSxHQUFHLElBQUlkLGNBQWMsQ0FBRSxDQUFFLENBQUM7O0lBRTVDO0lBQ0EsSUFBSSxDQUFDZSx3QkFBd0IsR0FBRyxJQUFJaEIsZUFBZSxDQUFFLEtBQU0sQ0FBQzs7SUFFNUQ7SUFDQSxJQUFJLENBQUNpQixtQkFBbUIsR0FBRyxJQUFJakIsZUFBZSxDQUFFLEtBQU0sQ0FBQzs7SUFFdkQ7SUFDQSxJQUFJLENBQUNrQixRQUFRLEdBQUcsSUFBSWIsUUFBUSxDQUFFO01BQzVCUSxnQkFBZ0IsRUFBRSxJQUFJLENBQUNBLGdCQUFnQjtNQUN2Q0UsYUFBYSxFQUFFLElBQUksQ0FBQ0EsYUFBYTtNQUNqQ0UsbUJBQW1CLEVBQUUsSUFBSSxDQUFDQTtJQUM1QixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNFLE1BQU0sR0FBR2pCLE9BQU8sQ0FBQ2tCLEtBQUssQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQUNDLFNBQVMsQ0FBRSxDQUFFVCxNQUFNLElBQUksRUFBRSxHQUFHSCx5QkFBeUIsR0FBR0QseUJBQXlCLElBQUssQ0FBQyxFQUFFRCxhQUFhLEdBQUcsQ0FBRSxDQUFDO0VBQ2xKOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRWUsS0FBS0EsQ0FBQSxFQUFHO0lBQ04sSUFBSSxDQUFDUCxhQUFhLENBQUNRLEtBQUssQ0FBQyxDQUFDO0VBQzVCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxJQUFJQSxDQUFFQyxFQUFFLEVBQUc7SUFDVCxJQUFJLENBQUNQLFFBQVEsQ0FBQ00sSUFBSSxDQUFFQyxFQUFHLENBQUM7RUFDMUI7QUFDRjtBQUVBbkIsZUFBZSxDQUFDb0IsUUFBUSxDQUFFLGFBQWEsRUFBRWhCLFdBQVksQ0FBQztBQUN0RCxlQUFlQSxXQUFXIn0=