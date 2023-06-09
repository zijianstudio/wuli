// Copyright 2014-2020, University of Colorado Boulder

/**
 * VelocitySensor that has a position and measures velocity
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
import Sensor from './Sensor.js';
class VelocitySensor extends Sensor {
  /**
   * @param {Vector2} position of the sensor
   * @param {Vector2} value Velocity as measured by the sensor
   */
  constructor(position, value) {
    super(position, value);

    // @public
    this.isArrowVisibleProperty = new DerivedProperty([this.valueProperty], value => value.magnitude > 0);
  }
}
fluidPressureAndFlow.register('VelocitySensor', VelocitySensor);
export default VelocitySensor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJmbHVpZFByZXNzdXJlQW5kRmxvdyIsIlNlbnNvciIsIlZlbG9jaXR5U2Vuc29yIiwiY29uc3RydWN0b3IiLCJwb3NpdGlvbiIsInZhbHVlIiwiaXNBcnJvd1Zpc2libGVQcm9wZXJ0eSIsInZhbHVlUHJvcGVydHkiLCJtYWduaXR1ZGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZlbG9jaXR5U2Vuc29yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZlbG9jaXR5U2Vuc29yIHRoYXQgaGFzIGEgcG9zaXRpb24gYW5kIG1lYXN1cmVzIHZlbG9jaXR5XHJcbiAqXHJcbiAqIEBhdXRob3IgU2lkZGhhcnRoYSBDaGludGhhcGFsbHkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IGZsdWlkUHJlc3N1cmVBbmRGbG93IGZyb20gJy4uLy4uL2ZsdWlkUHJlc3N1cmVBbmRGbG93LmpzJztcclxuaW1wb3J0IFNlbnNvciBmcm9tICcuL1NlbnNvci5qcyc7XHJcblxyXG5jbGFzcyBWZWxvY2l0eVNlbnNvciBleHRlbmRzIFNlbnNvciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9zaXRpb24gb2YgdGhlIHNlbnNvclxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gdmFsdWUgVmVsb2NpdHkgYXMgbWVhc3VyZWQgYnkgdGhlIHNlbnNvclxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwb3NpdGlvbiwgdmFsdWUgKSB7XHJcblxyXG4gICAgc3VwZXIoIHBvc2l0aW9uLCB2YWx1ZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMuaXNBcnJvd1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy52YWx1ZVByb3BlcnR5IF0sIHZhbHVlID0+IHZhbHVlLm1hZ25pdHVkZSA+IDAgKTtcclxuICB9XHJcbn1cclxuXHJcbmZsdWlkUHJlc3N1cmVBbmRGbG93LnJlZ2lzdGVyKCAnVmVsb2NpdHlTZW5zb3InLCBWZWxvY2l0eVNlbnNvciApO1xyXG5leHBvcnQgZGVmYXVsdCBWZWxvY2l0eVNlbnNvcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFDaEUsT0FBT0MsTUFBTSxNQUFNLGFBQWE7QUFFaEMsTUFBTUMsY0FBYyxTQUFTRCxNQUFNLENBQUM7RUFFbEM7QUFDRjtBQUNBO0FBQ0E7RUFDRUUsV0FBV0EsQ0FBRUMsUUFBUSxFQUFFQyxLQUFLLEVBQUc7SUFFN0IsS0FBSyxDQUFFRCxRQUFRLEVBQUVDLEtBQU0sQ0FBQzs7SUFFeEI7SUFDQSxJQUFJLENBQUNDLHNCQUFzQixHQUFHLElBQUlQLGVBQWUsQ0FBRSxDQUFFLElBQUksQ0FBQ1EsYUFBYSxDQUFFLEVBQUVGLEtBQUssSUFBSUEsS0FBSyxDQUFDRyxTQUFTLEdBQUcsQ0FBRSxDQUFDO0VBQzNHO0FBQ0Y7QUFFQVIsb0JBQW9CLENBQUNTLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRVAsY0FBZSxDQUFDO0FBQ2pFLGVBQWVBLGNBQWMifQ==