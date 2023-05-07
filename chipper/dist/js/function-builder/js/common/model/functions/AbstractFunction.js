// Copyright 2015-2023, University of Colorado Boulder

/**
 * Abstract base type for functions with one input and one output.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../../axon/js/Property.js';
import merge from '../../../../../phet-core/js/merge.js';
import functionBuilder from '../../../functionBuilder.js';
import FBConstants from '../../FBConstants.js';
import FBMovable from '../FBMovable.js';
export default class AbstractFunction extends FBMovable {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      // {string} optional name, for internal debugging
      name: null,
      // {boolean} is this function invertible?
      invertible: true,
      // {number} distance/second when animating
      animationSpeed: FBConstants.FUNCTION_ANIMATION_SPEED,
      // properties of associated FunctionNode, in the model for convenience
      fill: 'white',
      // {Color|string|null}
      stroke: 'black',
      // {Color|string|null}
      lineWidth: 1,
      // {number}
      lineDash: [] // {number[]|null}
    }, options);
    super(options);

    // @private
    this._invertible = options.invertible;

    // @public (read-only)
    this.name = options.name;

    // @public (read-only) properties of FunctionNode, in the model for convenience
    this.viewOptions = _.pick(options, 'fill', 'stroke', 'lineWidth', 'lineDash');

    // @public {Property.<Color|string>}
    this.fillProperty = new Property(options.fill);
    this.fillProperty.link(fill => {
      this.viewOptions.fill = fill;
    });
  }

  // @public @override
  reset() {
    super.reset();
    this.fillProperty.reset();
  }

  /**
   * Is this function invertible?
   *
   * @returns {boolean}
   * @public
   */
  getInvertible() {
    return this._invertible;
  }
  get invertible() {
    return this.getInvertible();
  }

  /**
   * Applies the function to the input, produces the output.
   *
   * @param {*} input - the input, which should not be modified
   * @returns {*} output, of the same type as input
   * @public
   * @abstract
   */
  applyFunction(input) {
    throw new Error('must be implemented by subtype');
  }
}
functionBuilder.register('AbstractFunction', AbstractFunction);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIm1lcmdlIiwiZnVuY3Rpb25CdWlsZGVyIiwiRkJDb25zdGFudHMiLCJGQk1vdmFibGUiLCJBYnN0cmFjdEZ1bmN0aW9uIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwibmFtZSIsImludmVydGlibGUiLCJhbmltYXRpb25TcGVlZCIsIkZVTkNUSU9OX0FOSU1BVElPTl9TUEVFRCIsImZpbGwiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJsaW5lRGFzaCIsIl9pbnZlcnRpYmxlIiwidmlld09wdGlvbnMiLCJfIiwicGljayIsImZpbGxQcm9wZXJ0eSIsImxpbmsiLCJyZXNldCIsImdldEludmVydGlibGUiLCJhcHBseUZ1bmN0aW9uIiwiaW5wdXQiLCJFcnJvciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQWJzdHJhY3RGdW5jdGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBYnN0cmFjdCBiYXNlIHR5cGUgZm9yIGZ1bmN0aW9ucyB3aXRoIG9uZSBpbnB1dCBhbmQgb25lIG91dHB1dC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgZnVuY3Rpb25CdWlsZGVyIGZyb20gJy4uLy4uLy4uL2Z1bmN0aW9uQnVpbGRlci5qcyc7XHJcbmltcG9ydCBGQkNvbnN0YW50cyBmcm9tICcuLi8uLi9GQkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBGQk1vdmFibGUgZnJvbSAnLi4vRkJNb3ZhYmxlLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFic3RyYWN0RnVuY3Rpb24gZXh0ZW5kcyBGQk1vdmFibGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyB7c3RyaW5nfSBvcHRpb25hbCBuYW1lLCBmb3IgaW50ZXJuYWwgZGVidWdnaW5nXHJcbiAgICAgIG5hbWU6IG51bGwsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gaXMgdGhpcyBmdW5jdGlvbiBpbnZlcnRpYmxlP1xyXG4gICAgICBpbnZlcnRpYmxlOiB0cnVlLFxyXG5cclxuICAgICAgLy8ge251bWJlcn0gZGlzdGFuY2Uvc2Vjb25kIHdoZW4gYW5pbWF0aW5nXHJcbiAgICAgIGFuaW1hdGlvblNwZWVkOiBGQkNvbnN0YW50cy5GVU5DVElPTl9BTklNQVRJT05fU1BFRUQsXHJcblxyXG4gICAgICAvLyBwcm9wZXJ0aWVzIG9mIGFzc29jaWF0ZWQgRnVuY3Rpb25Ob2RlLCBpbiB0aGUgbW9kZWwgZm9yIGNvbnZlbmllbmNlXHJcbiAgICAgIGZpbGw6ICd3aGl0ZScsIC8vIHtDb2xvcnxzdHJpbmd8bnVsbH1cclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLCAvLyB7Q29sb3J8c3RyaW5nfG51bGx9XHJcbiAgICAgIGxpbmVXaWR0aDogMSwgLy8ge251bWJlcn1cclxuICAgICAgbGluZURhc2g6IFtdIC8vIHtudW1iZXJbXXxudWxsfVxyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLl9pbnZlcnRpYmxlID0gb3B0aW9ucy5pbnZlcnRpYmxlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIHRoaXMubmFtZSA9IG9wdGlvbnMubmFtZTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHByb3BlcnRpZXMgb2YgRnVuY3Rpb25Ob2RlLCBpbiB0aGUgbW9kZWwgZm9yIGNvbnZlbmllbmNlXHJcbiAgICB0aGlzLnZpZXdPcHRpb25zID0gXy5waWNrKCBvcHRpb25zLCAnZmlsbCcsICdzdHJva2UnLCAnbGluZVdpZHRoJywgJ2xpbmVEYXNoJyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxDb2xvcnxzdHJpbmc+fVxyXG4gICAgdGhpcy5maWxsUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG9wdGlvbnMuZmlsbCApO1xyXG4gICAgdGhpcy5maWxsUHJvcGVydHkubGluayggZmlsbCA9PiB7XHJcbiAgICAgIHRoaXMudmlld09wdGlvbnMuZmlsbCA9IGZpbGw7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIEBvdmVycmlkZVxyXG4gIHJlc2V0KCkge1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuICAgIHRoaXMuZmlsbFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJcyB0aGlzIGZ1bmN0aW9uIGludmVydGlibGU/XHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0SW52ZXJ0aWJsZSgpIHsgcmV0dXJuIHRoaXMuX2ludmVydGlibGU7IH1cclxuXHJcbiAgZ2V0IGludmVydGlibGUoKSB7IHJldHVybiB0aGlzLmdldEludmVydGlibGUoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBsaWVzIHRoZSBmdW5jdGlvbiB0byB0aGUgaW5wdXQsIHByb2R1Y2VzIHRoZSBvdXRwdXQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0geyp9IGlucHV0IC0gdGhlIGlucHV0LCB3aGljaCBzaG91bGQgbm90IGJlIG1vZGlmaWVkXHJcbiAgICogQHJldHVybnMgeyp9IG91dHB1dCwgb2YgdGhlIHNhbWUgdHlwZSBhcyBpbnB1dFxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAYWJzdHJhY3RcclxuICAgKi9cclxuICBhcHBseUZ1bmN0aW9uKCBpbnB1dCApIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ211c3QgYmUgaW1wbGVtZW50ZWQgYnkgc3VidHlwZScgKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uQnVpbGRlci5yZWdpc3RlciggJ0Fic3RyYWN0RnVuY3Rpb24nLCBBYnN0cmFjdEZ1bmN0aW9uICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxvQ0FBb0M7QUFDekQsT0FBT0MsS0FBSyxNQUFNLHNDQUFzQztBQUN4RCxPQUFPQyxlQUFlLE1BQU0sNkJBQTZCO0FBQ3pELE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0MsU0FBUyxNQUFNLGlCQUFpQjtBQUV2QyxlQUFlLE1BQU1DLGdCQUFnQixTQUFTRCxTQUFTLENBQUM7RUFFdEQ7QUFDRjtBQUNBO0VBQ0VFLFdBQVdBLENBQUVDLE9BQU8sRUFBRztJQUVyQkEsT0FBTyxHQUFHTixLQUFLLENBQUU7TUFFZjtNQUNBTyxJQUFJLEVBQUUsSUFBSTtNQUVWO01BQ0FDLFVBQVUsRUFBRSxJQUFJO01BRWhCO01BQ0FDLGNBQWMsRUFBRVAsV0FBVyxDQUFDUSx3QkFBd0I7TUFFcEQ7TUFDQUMsSUFBSSxFQUFFLE9BQU87TUFBRTtNQUNmQyxNQUFNLEVBQUUsT0FBTztNQUFFO01BQ2pCQyxTQUFTLEVBQUUsQ0FBQztNQUFFO01BQ2RDLFFBQVEsRUFBRSxFQUFFLENBQUM7SUFFZixDQUFDLEVBQUVSLE9BQVEsQ0FBQztJQUVaLEtBQUssQ0FBRUEsT0FBUSxDQUFDOztJQUVoQjtJQUNBLElBQUksQ0FBQ1MsV0FBVyxHQUFHVCxPQUFPLENBQUNFLFVBQVU7O0lBRXJDO0lBQ0EsSUFBSSxDQUFDRCxJQUFJLEdBQUdELE9BQU8sQ0FBQ0MsSUFBSTs7SUFFeEI7SUFDQSxJQUFJLENBQUNTLFdBQVcsR0FBR0MsQ0FBQyxDQUFDQyxJQUFJLENBQUVaLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxVQUFXLENBQUM7O0lBRS9FO0lBQ0EsSUFBSSxDQUFDYSxZQUFZLEdBQUcsSUFBSXBCLFFBQVEsQ0FBRU8sT0FBTyxDQUFDSyxJQUFLLENBQUM7SUFDaEQsSUFBSSxDQUFDUSxZQUFZLENBQUNDLElBQUksQ0FBRVQsSUFBSSxJQUFJO01BQzlCLElBQUksQ0FBQ0ssV0FBVyxDQUFDTCxJQUFJLEdBQUdBLElBQUk7SUFDOUIsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7RUFDQVUsS0FBS0EsQ0FBQSxFQUFHO0lBQ04sS0FBSyxDQUFDQSxLQUFLLENBQUMsQ0FBQztJQUNiLElBQUksQ0FBQ0YsWUFBWSxDQUFDRSxLQUFLLENBQUMsQ0FBQztFQUMzQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsYUFBYUEsQ0FBQSxFQUFHO0lBQUUsT0FBTyxJQUFJLENBQUNQLFdBQVc7RUFBRTtFQUUzQyxJQUFJUCxVQUFVQSxDQUFBLEVBQUc7SUFBRSxPQUFPLElBQUksQ0FBQ2MsYUFBYSxDQUFDLENBQUM7RUFBRTs7RUFFaEQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxhQUFhQSxDQUFFQyxLQUFLLEVBQUc7SUFDckIsTUFBTSxJQUFJQyxLQUFLLENBQUUsZ0NBQWlDLENBQUM7RUFDckQ7QUFDRjtBQUVBeEIsZUFBZSxDQUFDeUIsUUFBUSxDQUFFLGtCQUFrQixFQUFFdEIsZ0JBQWlCLENBQUMifQ==