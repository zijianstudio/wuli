// Copyright 2014-2020, University of Colorado Boulder

/**
 * Model of a photon for RGB screen.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import colorVision from '../../colorVision.js';
class RGBPhoton extends PhetioObject {
  /**
   * @param {Vector2} position
   * @param {Vector2} velocity
   * @param {number} intensity between 0-255 for rgb intensity
   * @param {Object} [options]
   */
  constructor(position, velocity, intensity, options) {
    super(options);

    // @public
    this.position = position;
    this.velocity = velocity;
    this.intensity = intensity;
  }

  /**
   * @param {number} newX
   * @param {number} newY
   * @public
   */
  updateAnimationFrame(newX, newY) {
    this.position.x = newX;
    this.position.y = newY;
  }
}
colorVision.register('RGBPhoton', RGBPhoton);
RGBPhoton.RGBPhotonIO = new IOType('RGBPhotonIO', {
  valueType: RGBPhoton,
  documentation: 'A Photon that has R, G, and B',
  toStateObject: rgbPhoton => ({
    position: Vector2.Vector2IO.toStateObject(rgbPhoton.position),
    velocity: Vector2.Vector2IO.toStateObject(rgbPhoton.velocity),
    intensity: rgbPhoton.intensity
  }),
  fromStateObject: stateObject => new RGBPhoton(Vector2.Vector2IO.fromStateObject(stateObject.position), Vector2.Vector2IO.fromStateObject(stateObject.velocity), stateObject.intensity)
});
export default RGBPhoton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiUGhldGlvT2JqZWN0IiwiSU9UeXBlIiwiY29sb3JWaXNpb24iLCJSR0JQaG90b24iLCJjb25zdHJ1Y3RvciIsInBvc2l0aW9uIiwidmVsb2NpdHkiLCJpbnRlbnNpdHkiLCJvcHRpb25zIiwidXBkYXRlQW5pbWF0aW9uRnJhbWUiLCJuZXdYIiwibmV3WSIsIngiLCJ5IiwicmVnaXN0ZXIiLCJSR0JQaG90b25JTyIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJ0b1N0YXRlT2JqZWN0IiwicmdiUGhvdG9uIiwiVmVjdG9yMklPIiwiZnJvbVN0YXRlT2JqZWN0Iiwic3RhdGVPYmplY3QiXSwic291cmNlcyI6WyJSR0JQaG90b24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgb2YgYSBwaG90b24gZm9yIFJHQiBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQWFyb24gRGF2aXMgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0IGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgY29sb3JWaXNpb24gZnJvbSAnLi4vLi4vY29sb3JWaXNpb24uanMnO1xyXG5cclxuY2xhc3MgUkdCUGhvdG9uIGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gdmVsb2NpdHlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW50ZW5zaXR5IGJldHdlZW4gMC0yNTUgZm9yIHJnYiBpbnRlbnNpdHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHBvc2l0aW9uLCB2ZWxvY2l0eSwgaW50ZW5zaXR5LCBvcHRpb25zICkge1xyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcbiAgICB0aGlzLnZlbG9jaXR5ID0gdmVsb2NpdHk7XHJcbiAgICB0aGlzLmludGVuc2l0eSA9IGludGVuc2l0eTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuZXdYXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5ld1lcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdXBkYXRlQW5pbWF0aW9uRnJhbWUoIG5ld1gsIG5ld1kgKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uLnggPSBuZXdYO1xyXG4gICAgdGhpcy5wb3NpdGlvbi55ID0gbmV3WTtcclxuICB9XHJcbn1cclxuXHJcbmNvbG9yVmlzaW9uLnJlZ2lzdGVyKCAnUkdCUGhvdG9uJywgUkdCUGhvdG9uICk7XHJcblxyXG5SR0JQaG90b24uUkdCUGhvdG9uSU8gPSBuZXcgSU9UeXBlKCAnUkdCUGhvdG9uSU8nLCB7XHJcbiAgdmFsdWVUeXBlOiBSR0JQaG90b24sXHJcbiAgZG9jdW1lbnRhdGlvbjogJ0EgUGhvdG9uIHRoYXQgaGFzIFIsIEcsIGFuZCBCJyxcclxuICB0b1N0YXRlT2JqZWN0OiByZ2JQaG90b24gPT4gKCB7XHJcbiAgICBwb3NpdGlvbjogVmVjdG9yMi5WZWN0b3IySU8udG9TdGF0ZU9iamVjdCggcmdiUGhvdG9uLnBvc2l0aW9uICksXHJcbiAgICB2ZWxvY2l0eTogVmVjdG9yMi5WZWN0b3IySU8udG9TdGF0ZU9iamVjdCggcmdiUGhvdG9uLnZlbG9jaXR5ICksXHJcbiAgICBpbnRlbnNpdHk6IHJnYlBob3Rvbi5pbnRlbnNpdHlcclxuICB9ICksXHJcbiAgZnJvbVN0YXRlT2JqZWN0OiBzdGF0ZU9iamVjdCA9PiBuZXcgUkdCUGhvdG9uKFxyXG4gICAgVmVjdG9yMi5WZWN0b3IySU8uZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdC5wb3NpdGlvbiApLFxyXG4gICAgVmVjdG9yMi5WZWN0b3IySU8uZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdC52ZWxvY2l0eSApLFxyXG4gICAgc3RhdGVPYmplY3QuaW50ZW5zaXR5XHJcbiAgKVxyXG59ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSR0JQaG90b247XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFlBQVksTUFBTSx1Q0FBdUM7QUFDaEUsT0FBT0MsTUFBTSxNQUFNLHVDQUF1QztBQUMxRCxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBRTlDLE1BQU1DLFNBQVMsU0FBU0gsWUFBWSxDQUFDO0VBRW5DO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxXQUFXQSxDQUFFQyxRQUFRLEVBQUVDLFFBQVEsRUFBRUMsU0FBUyxFQUFFQyxPQUFPLEVBQUc7SUFDcEQsS0FBSyxDQUFFQSxPQUFRLENBQUM7O0lBRWhCO0lBQ0EsSUFBSSxDQUFDSCxRQUFRLEdBQUdBLFFBQVE7SUFDeEIsSUFBSSxDQUFDQyxRQUFRLEdBQUdBLFFBQVE7SUFDeEIsSUFBSSxDQUFDQyxTQUFTLEdBQUdBLFNBQVM7RUFDNUI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxvQkFBb0JBLENBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFHO0lBQ2pDLElBQUksQ0FBQ04sUUFBUSxDQUFDTyxDQUFDLEdBQUdGLElBQUk7SUFDdEIsSUFBSSxDQUFDTCxRQUFRLENBQUNRLENBQUMsR0FBR0YsSUFBSTtFQUN4QjtBQUNGO0FBRUFULFdBQVcsQ0FBQ1ksUUFBUSxDQUFFLFdBQVcsRUFBRVgsU0FBVSxDQUFDO0FBRTlDQSxTQUFTLENBQUNZLFdBQVcsR0FBRyxJQUFJZCxNQUFNLENBQUUsYUFBYSxFQUFFO0VBQ2pEZSxTQUFTLEVBQUViLFNBQVM7RUFDcEJjLGFBQWEsRUFBRSwrQkFBK0I7RUFDOUNDLGFBQWEsRUFBRUMsU0FBUyxLQUFNO0lBQzVCZCxRQUFRLEVBQUVOLE9BQU8sQ0FBQ3FCLFNBQVMsQ0FBQ0YsYUFBYSxDQUFFQyxTQUFTLENBQUNkLFFBQVMsQ0FBQztJQUMvREMsUUFBUSxFQUFFUCxPQUFPLENBQUNxQixTQUFTLENBQUNGLGFBQWEsQ0FBRUMsU0FBUyxDQUFDYixRQUFTLENBQUM7SUFDL0RDLFNBQVMsRUFBRVksU0FBUyxDQUFDWjtFQUN2QixDQUFDLENBQUU7RUFDSGMsZUFBZSxFQUFFQyxXQUFXLElBQUksSUFBSW5CLFNBQVMsQ0FDM0NKLE9BQU8sQ0FBQ3FCLFNBQVMsQ0FBQ0MsZUFBZSxDQUFFQyxXQUFXLENBQUNqQixRQUFTLENBQUMsRUFDekROLE9BQU8sQ0FBQ3FCLFNBQVMsQ0FBQ0MsZUFBZSxDQUFFQyxXQUFXLENBQUNoQixRQUFTLENBQUMsRUFDekRnQixXQUFXLENBQUNmLFNBQ2Q7QUFDRixDQUFFLENBQUM7QUFFSCxlQUFlSixTQUFTIn0=