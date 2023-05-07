// Copyright 2017-2022, University of Colorado Boulder

/**
 * Something that has a value for each orientation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import validate from '../../../../axon/js/validate.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import areaModelCommon from '../../areaModelCommon.js';
class OrientationPair {
  /**
   * @param {*} horizontal - Value for the horizontal orientation
   * @param {*} vertical - Value for the vertical orientation
   */
  constructor(horizontal, vertical) {
    // @public {*}
    this.horizontal = horizontal;

    // @public {*}
    this.vertical = vertical;

    // @public {Array.<*>}
    this.values = [horizontal, vertical];
  }

  /**
   * Returns the value associated with the particular orientation.
   * @public
   *
   * @param {Orientation} orientation
   * @returns {*}
   */
  get(orientation) {
    validate(orientation, {
      validValues: Orientation.enumeration.values
    });
    return orientation === Orientation.HORIZONTAL ? this.horizontal : this.vertical;
  }

  /**
   * Returns a new OrientationPair with mapped values.
   * @public
   *
   * @param {Function} mapFunction - function( {*}, {Orientation} ): {*}
   * @returns {OrientationPair.<*>} - With the mapped values
   */
  map(mapFunction) {
    return new OrientationPair(mapFunction(this.horizontal, Orientation.HORIZONTAL), mapFunction(this.vertical, Orientation.VERTICAL));
  }

  /**
   * Calls the callback on each item of the orientation pair.
   * @public
   *
   * @param {Function} callback - function( {*}, {Orientation} )
   */
  forEach(callback) {
    callback(this.horizontal, Orientation.HORIZONTAL);
    callback(this.vertical, Orientation.VERTICAL);
  }

  /**
   * Calls reset() on each item in the orientation pair.
   * @public
   */
  reset() {
    this.forEach(value => {
      value.reset();
    });
  }

  /**
   * Creates an orientation pair based on a factory method.
   * @public
   *
   * @param {function} factory - Called factory( {Orientation} ) : {*}, called once for each orientation to determine
   *                             the value.
   */
  static create(factory) {
    return new OrientationPair(factory(Orientation.HORIZONTAL), factory(Orientation.VERTICAL));
  }
}
areaModelCommon.register('OrientationPair', OrientationPair);
export default OrientationPair;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ2YWxpZGF0ZSIsIk9yaWVudGF0aW9uIiwiYXJlYU1vZGVsQ29tbW9uIiwiT3JpZW50YXRpb25QYWlyIiwiY29uc3RydWN0b3IiLCJob3Jpem9udGFsIiwidmVydGljYWwiLCJ2YWx1ZXMiLCJnZXQiLCJvcmllbnRhdGlvbiIsInZhbGlkVmFsdWVzIiwiZW51bWVyYXRpb24iLCJIT1JJWk9OVEFMIiwibWFwIiwibWFwRnVuY3Rpb24iLCJWRVJUSUNBTCIsImZvckVhY2giLCJjYWxsYmFjayIsInJlc2V0IiwidmFsdWUiLCJjcmVhdGUiLCJmYWN0b3J5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJPcmllbnRhdGlvblBhaXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU29tZXRoaW5nIHRoYXQgaGFzIGEgdmFsdWUgZm9yIGVhY2ggb3JpZW50YXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgdmFsaWRhdGUgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy92YWxpZGF0ZS5qcyc7XHJcbmltcG9ydCBPcmllbnRhdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvT3JpZW50YXRpb24uanMnO1xyXG5pbXBvcnQgYXJlYU1vZGVsQ29tbW9uIGZyb20gJy4uLy4uL2FyZWFNb2RlbENvbW1vbi5qcyc7XHJcblxyXG5jbGFzcyBPcmllbnRhdGlvblBhaXIge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Kn0gaG9yaXpvbnRhbCAtIFZhbHVlIGZvciB0aGUgaG9yaXpvbnRhbCBvcmllbnRhdGlvblxyXG4gICAqIEBwYXJhbSB7Kn0gdmVydGljYWwgLSBWYWx1ZSBmb3IgdGhlIHZlcnRpY2FsIG9yaWVudGF0aW9uXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGhvcml6b250YWwsIHZlcnRpY2FsICkge1xyXG4gICAgLy8gQHB1YmxpYyB7Kn1cclxuICAgIHRoaXMuaG9yaXpvbnRhbCA9IGhvcml6b250YWw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Kn1cclxuICAgIHRoaXMudmVydGljYWwgPSB2ZXJ0aWNhbDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48Kj59XHJcbiAgICB0aGlzLnZhbHVlcyA9IFsgaG9yaXpvbnRhbCwgdmVydGljYWwgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgcGFydGljdWxhciBvcmllbnRhdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09yaWVudGF0aW9ufSBvcmllbnRhdGlvblxyXG4gICAqIEByZXR1cm5zIHsqfVxyXG4gICAqL1xyXG4gIGdldCggb3JpZW50YXRpb24gKSB7XHJcbiAgICB2YWxpZGF0ZSggb3JpZW50YXRpb24sIHsgdmFsaWRWYWx1ZXM6IE9yaWVudGF0aW9uLmVudW1lcmF0aW9uLnZhbHVlcyB9ICk7XHJcblxyXG4gICAgcmV0dXJuIG9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMID8gdGhpcy5ob3Jpem9udGFsIDogdGhpcy52ZXJ0aWNhbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBuZXcgT3JpZW50YXRpb25QYWlyIHdpdGggbWFwcGVkIHZhbHVlcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBtYXBGdW5jdGlvbiAtIGZ1bmN0aW9uKCB7Kn0sIHtPcmllbnRhdGlvbn0gKTogeyp9XHJcbiAgICogQHJldHVybnMge09yaWVudGF0aW9uUGFpci48Kj59IC0gV2l0aCB0aGUgbWFwcGVkIHZhbHVlc1xyXG4gICAqL1xyXG4gIG1hcCggbWFwRnVuY3Rpb24gKSB7XHJcbiAgICByZXR1cm4gbmV3IE9yaWVudGF0aW9uUGFpcihcclxuICAgICAgbWFwRnVuY3Rpb24oIHRoaXMuaG9yaXpvbnRhbCwgT3JpZW50YXRpb24uSE9SSVpPTlRBTCApLFxyXG4gICAgICBtYXBGdW5jdGlvbiggdGhpcy52ZXJ0aWNhbCwgT3JpZW50YXRpb24uVkVSVElDQUwgKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBjYWxsYmFjayBvbiBlYWNoIGl0ZW0gb2YgdGhlIG9yaWVudGF0aW9uIHBhaXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBmdW5jdGlvbiggeyp9LCB7T3JpZW50YXRpb259IClcclxuICAgKi9cclxuICBmb3JFYWNoKCBjYWxsYmFjayApIHtcclxuICAgIGNhbGxiYWNrKCB0aGlzLmhvcml6b250YWwsIE9yaWVudGF0aW9uLkhPUklaT05UQUwgKTtcclxuICAgIGNhbGxiYWNrKCB0aGlzLnZlcnRpY2FsLCBPcmllbnRhdGlvbi5WRVJUSUNBTCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgcmVzZXQoKSBvbiBlYWNoIGl0ZW0gaW4gdGhlIG9yaWVudGF0aW9uIHBhaXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5mb3JFYWNoKCB2YWx1ZSA9PiB7XHJcbiAgICAgIHZhbHVlLnJlc2V0KCk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGFuIG9yaWVudGF0aW9uIHBhaXIgYmFzZWQgb24gYSBmYWN0b3J5IG1ldGhvZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmYWN0b3J5IC0gQ2FsbGVkIGZhY3RvcnkoIHtPcmllbnRhdGlvbn0gKSA6IHsqfSwgY2FsbGVkIG9uY2UgZm9yIGVhY2ggb3JpZW50YXRpb24gdG8gZGV0ZXJtaW5lXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSB2YWx1ZS5cclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlKCBmYWN0b3J5ICkge1xyXG4gICAgcmV0dXJuIG5ldyBPcmllbnRhdGlvblBhaXIoIGZhY3RvcnkoIE9yaWVudGF0aW9uLkhPUklaT05UQUwgKSwgZmFjdG9yeSggT3JpZW50YXRpb24uVkVSVElDQUwgKSApO1xyXG4gIH1cclxufVxyXG5cclxuYXJlYU1vZGVsQ29tbW9uLnJlZ2lzdGVyKCAnT3JpZW50YXRpb25QYWlyJywgT3JpZW50YXRpb25QYWlyICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBPcmllbnRhdGlvblBhaXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBRXRELE1BQU1DLGVBQWUsQ0FBQztFQUNwQjtBQUNGO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxVQUFVLEVBQUVDLFFBQVEsRUFBRztJQUNsQztJQUNBLElBQUksQ0FBQ0QsVUFBVSxHQUFHQSxVQUFVOztJQUU1QjtJQUNBLElBQUksQ0FBQ0MsUUFBUSxHQUFHQSxRQUFROztJQUV4QjtJQUNBLElBQUksQ0FBQ0MsTUFBTSxHQUFHLENBQUVGLFVBQVUsRUFBRUMsUUFBUSxDQUFFO0VBQ3hDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLEdBQUdBLENBQUVDLFdBQVcsRUFBRztJQUNqQlQsUUFBUSxDQUFFUyxXQUFXLEVBQUU7TUFBRUMsV0FBVyxFQUFFVCxXQUFXLENBQUNVLFdBQVcsQ0FBQ0o7SUFBTyxDQUFFLENBQUM7SUFFeEUsT0FBT0UsV0FBVyxLQUFLUixXQUFXLENBQUNXLFVBQVUsR0FBRyxJQUFJLENBQUNQLFVBQVUsR0FBRyxJQUFJLENBQUNDLFFBQVE7RUFDakY7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU8sR0FBR0EsQ0FBRUMsV0FBVyxFQUFHO0lBQ2pCLE9BQU8sSUFBSVgsZUFBZSxDQUN4QlcsV0FBVyxDQUFFLElBQUksQ0FBQ1QsVUFBVSxFQUFFSixXQUFXLENBQUNXLFVBQVcsQ0FBQyxFQUN0REUsV0FBVyxDQUFFLElBQUksQ0FBQ1IsUUFBUSxFQUFFTCxXQUFXLENBQUNjLFFBQVMsQ0FDbkQsQ0FBQztFQUNIOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxPQUFPQSxDQUFFQyxRQUFRLEVBQUc7SUFDbEJBLFFBQVEsQ0FBRSxJQUFJLENBQUNaLFVBQVUsRUFBRUosV0FBVyxDQUFDVyxVQUFXLENBQUM7SUFDbkRLLFFBQVEsQ0FBRSxJQUFJLENBQUNYLFFBQVEsRUFBRUwsV0FBVyxDQUFDYyxRQUFTLENBQUM7RUFDakQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRUcsS0FBS0EsQ0FBQSxFQUFHO0lBQ04sSUFBSSxDQUFDRixPQUFPLENBQUVHLEtBQUssSUFBSTtNQUNyQkEsS0FBSyxDQUFDRCxLQUFLLENBQUMsQ0FBQztJQUNmLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsT0FBT0UsTUFBTUEsQ0FBRUMsT0FBTyxFQUFHO0lBQ3ZCLE9BQU8sSUFBSWxCLGVBQWUsQ0FBRWtCLE9BQU8sQ0FBRXBCLFdBQVcsQ0FBQ1csVUFBVyxDQUFDLEVBQUVTLE9BQU8sQ0FBRXBCLFdBQVcsQ0FBQ2MsUUFBUyxDQUFFLENBQUM7RUFDbEc7QUFDRjtBQUVBYixlQUFlLENBQUNvQixRQUFRLENBQUUsaUJBQWlCLEVBQUVuQixlQUFnQixDQUFDO0FBRTlELGVBQWVBLGVBQWUifQ==