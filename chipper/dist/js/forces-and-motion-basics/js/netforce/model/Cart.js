// Copyright 2013-2021, University of Colorado Boulder

/**
 * Model for the cart, which has a position (x) and velocity (v).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import forcesAndMotionBasics from '../../forcesAndMotionBasics.js';
class Cart {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    // @public {number} - 1-D x position of the cart
    this.xProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('xProperty'),
      units: 'm',
      range: new Range(-403, 403)
    });

    // @public {number} - 1-D velocity in MKS
    this.vProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('vProperty'),
      units: 'm/s',
      range: new Range(-6, 6)
    });

    // @public (read-only) - width from the center of the cart to the wheels, used to determine when a wheel touches
    // a game stopper in meters
    this.widthToWheel = 55;
  }

  /**
   * Reset the Properties associated with this model.
   * @public
   */
  reset() {
    this.xProperty.reset();
    this.vProperty.reset();
  }
}
forcesAndMotionBasics.register('Cart', Cart);
export default Cart;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiZm9yY2VzQW5kTW90aW9uQmFzaWNzIiwiQ2FydCIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwieFByb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwidW5pdHMiLCJyYW5nZSIsInZQcm9wZXJ0eSIsIndpZHRoVG9XaGVlbCIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDYXJ0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGZvciB0aGUgY2FydCwgd2hpY2ggaGFzIGEgcG9zaXRpb24gKHgpIGFuZCB2ZWxvY2l0eSAodikuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IGZvcmNlc0FuZE1vdGlvbkJhc2ljcyBmcm9tICcuLi8uLi9mb3JjZXNBbmRNb3Rpb25CYXNpY3MuanMnO1xyXG5cclxuY2xhc3MgQ2FydCB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0YW5kZW0gKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIDEtRCB4IHBvc2l0aW9uIG9mIHRoZSBjYXJ0XHJcbiAgICB0aGlzLnhQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd4UHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnbScsXHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIC00MDMsIDQwMyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIDEtRCB2ZWxvY2l0eSBpbiBNS1NcclxuICAgIHRoaXMudlByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZQcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICdtL3MnLFxyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAtNiwgNiApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSAtIHdpZHRoIGZyb20gdGhlIGNlbnRlciBvZiB0aGUgY2FydCB0byB0aGUgd2hlZWxzLCB1c2VkIHRvIGRldGVybWluZSB3aGVuIGEgd2hlZWwgdG91Y2hlc1xyXG4gICAgLy8gYSBnYW1lIHN0b3BwZXIgaW4gbWV0ZXJzXHJcbiAgICB0aGlzLndpZHRoVG9XaGVlbCA9IDU1O1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IHRoZSBQcm9wZXJ0aWVzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIG1vZGVsLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMueFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnZQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuZm9yY2VzQW5kTW90aW9uQmFzaWNzLnJlZ2lzdGVyKCAnQ2FydCcsIENhcnQgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENhcnQ7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBRWxFLE1BQU1DLElBQUksQ0FBQztFQUNUO0FBQ0Y7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxNQUFNLEVBQUc7SUFFcEI7SUFDQSxJQUFJLENBQUNDLFNBQVMsR0FBRyxJQUFJTixjQUFjLENBQUUsQ0FBQyxFQUFFO01BQ3RDSyxNQUFNLEVBQUVBLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLFdBQVksQ0FBQztNQUMxQ0MsS0FBSyxFQUFFLEdBQUc7TUFDVkMsS0FBSyxFQUFFLElBQUlSLEtBQUssQ0FBRSxDQUFDLEdBQUcsRUFBRSxHQUFJO0lBQzlCLENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQ1MsU0FBUyxHQUFHLElBQUlWLGNBQWMsQ0FBRSxDQUFDLEVBQUU7TUFDdENLLE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsV0FBWSxDQUFDO01BQzFDQyxLQUFLLEVBQUUsS0FBSztNQUNaQyxLQUFLLEVBQUUsSUFBSVIsS0FBSyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUU7SUFDMUIsQ0FBRSxDQUFDOztJQUVIO0lBQ0E7SUFDQSxJQUFJLENBQUNVLFlBQVksR0FBRyxFQUFFO0VBQ3hCOztFQUdBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLEtBQUtBLENBQUEsRUFBRztJQUNOLElBQUksQ0FBQ04sU0FBUyxDQUFDTSxLQUFLLENBQUMsQ0FBQztJQUN0QixJQUFJLENBQUNGLFNBQVMsQ0FBQ0UsS0FBSyxDQUFDLENBQUM7RUFDeEI7QUFDRjtBQUVBVixxQkFBcUIsQ0FBQ1csUUFBUSxDQUFFLE1BQU0sRUFBRVYsSUFBSyxDQUFDO0FBRTlDLGVBQWVBLElBQUkifQ==