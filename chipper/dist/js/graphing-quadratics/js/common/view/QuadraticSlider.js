// Copyright 2018-2023, University of Colorado Boulder

/**
 * QuadraticSlider is a vertical slider that has a quadratic taper.
 * This slider is used for the 'a' coefficient in the Explore screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQSlider from './GQSlider.js';
export default class QuadraticSlider extends GQSlider {
  /**
   * @param symbol - the coefficient's symbol
   * @param coefficientProperty - the coefficient's value
   * @param [providedOptions]
   */
  constructor(symbol, coefficientProperty, providedOptions) {
    assert && assert(Math.abs(coefficientProperty.range.min) === coefficientProperty.range.max, `symmetrical range is required: ${coefficientProperty.range}`);

    // coefficient for quadratic equation y = ax^2
    const a = 1 / coefficientProperty.range.max;
    const options = optionize()({
      // map coefficientProperty.value to slider value, x = sqrt( y / a )
      map: value => Math.sign(value) * Math.sqrt(Math.abs(value) / a),
      // map slider value to coefficientProperty.value, y = ax^2
      inverseMap: value => Math.sign(value) * a * value * value
    }, providedOptions);
    super(symbol, coefficientProperty, options);
  }
}
graphingQuadratics.register('QuadraticSlider', QuadraticSlider);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJncmFwaGluZ1F1YWRyYXRpY3MiLCJHUVNsaWRlciIsIlF1YWRyYXRpY1NsaWRlciIsImNvbnN0cnVjdG9yIiwic3ltYm9sIiwiY29lZmZpY2llbnRQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsImFzc2VydCIsIk1hdGgiLCJhYnMiLCJyYW5nZSIsIm1pbiIsIm1heCIsImEiLCJvcHRpb25zIiwibWFwIiwidmFsdWUiLCJzaWduIiwic3FydCIsImludmVyc2VNYXAiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlF1YWRyYXRpY1NsaWRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBRdWFkcmF0aWNTbGlkZXIgaXMgYSB2ZXJ0aWNhbCBzbGlkZXIgdGhhdCBoYXMgYSBxdWFkcmF0aWMgdGFwZXIuXHJcbiAqIFRoaXMgc2xpZGVyIGlzIHVzZWQgZm9yIHRoZSAnYScgY29lZmZpY2llbnQgaW4gdGhlIEV4cGxvcmUgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IGdyYXBoaW5nUXVhZHJhdGljcyBmcm9tICcuLi8uLi9ncmFwaGluZ1F1YWRyYXRpY3MuanMnO1xyXG5pbXBvcnQgR1FTbGlkZXIsIHsgR1FTbGlkZXJPcHRpb25zIH0gZnJvbSAnLi9HUVNsaWRlci5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgUXVhZHJhdGljU2xpZGVyT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxHUVNsaWRlck9wdGlvbnMsICdtYXAnIHwgJ2ludmVyc2VNYXAnPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFF1YWRyYXRpY1NsaWRlciBleHRlbmRzIEdRU2xpZGVyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHN5bWJvbCAtIHRoZSBjb2VmZmljaWVudCdzIHN5bWJvbFxyXG4gICAqIEBwYXJhbSBjb2VmZmljaWVudFByb3BlcnR5IC0gdGhlIGNvZWZmaWNpZW50J3MgdmFsdWVcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHN5bWJvbDogc3RyaW5nLCBjb2VmZmljaWVudFByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eSwgcHJvdmlkZWRPcHRpb25zOiBRdWFkcmF0aWNTbGlkZXJPcHRpb25zICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE1hdGguYWJzKCBjb2VmZmljaWVudFByb3BlcnR5LnJhbmdlLm1pbiApID09PSBjb2VmZmljaWVudFByb3BlcnR5LnJhbmdlLm1heCxcclxuICAgICAgYHN5bW1ldHJpY2FsIHJhbmdlIGlzIHJlcXVpcmVkOiAke2NvZWZmaWNpZW50UHJvcGVydHkucmFuZ2V9YCApO1xyXG5cclxuICAgIC8vIGNvZWZmaWNpZW50IGZvciBxdWFkcmF0aWMgZXF1YXRpb24geSA9IGF4XjJcclxuICAgIGNvbnN0IGEgPSAxIC8gY29lZmZpY2llbnRQcm9wZXJ0eS5yYW5nZS5tYXg7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxRdWFkcmF0aWNTbGlkZXJPcHRpb25zLCBTZWxmT3B0aW9ucywgR1FTbGlkZXJPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBtYXAgY29lZmZpY2llbnRQcm9wZXJ0eS52YWx1ZSB0byBzbGlkZXIgdmFsdWUsIHggPSBzcXJ0KCB5IC8gYSApXHJcbiAgICAgIG1hcDogdmFsdWUgPT4gKCBNYXRoLnNpZ24oIHZhbHVlICkgKiBNYXRoLnNxcnQoIE1hdGguYWJzKCB2YWx1ZSApIC8gYSApICksXHJcblxyXG4gICAgICAvLyBtYXAgc2xpZGVyIHZhbHVlIHRvIGNvZWZmaWNpZW50UHJvcGVydHkudmFsdWUsIHkgPSBheF4yXHJcbiAgICAgIGludmVyc2VNYXA6IHZhbHVlID0+ICggTWF0aC5zaWduKCB2YWx1ZSApICogYSAqIHZhbHVlICogdmFsdWUgKVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIHN5bWJvbCwgY29lZmZpY2llbnRQcm9wZXJ0eSwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JhcGhpbmdRdWFkcmF0aWNzLnJlZ2lzdGVyKCAnUXVhZHJhdGljU2xpZGVyJywgUXVhZHJhdGljU2xpZGVyICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsU0FBUyxNQUE0Qix1Q0FBdUM7QUFFbkYsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLFFBQVEsTUFBMkIsZUFBZTtBQU16RCxlQUFlLE1BQU1DLGVBQWUsU0FBU0QsUUFBUSxDQUFDO0VBRXBEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDU0UsV0FBV0EsQ0FBRUMsTUFBYyxFQUFFQyxtQkFBbUMsRUFBRUMsZUFBdUMsRUFBRztJQUVqSEMsTUFBTSxJQUFJQSxNQUFNLENBQUVDLElBQUksQ0FBQ0MsR0FBRyxDQUFFSixtQkFBbUIsQ0FBQ0ssS0FBSyxDQUFDQyxHQUFJLENBQUMsS0FBS04sbUJBQW1CLENBQUNLLEtBQUssQ0FBQ0UsR0FBRyxFQUMxRixrQ0FBaUNQLG1CQUFtQixDQUFDSyxLQUFNLEVBQUUsQ0FBQzs7SUFFakU7SUFDQSxNQUFNRyxDQUFDLEdBQUcsQ0FBQyxHQUFHUixtQkFBbUIsQ0FBQ0ssS0FBSyxDQUFDRSxHQUFHO0lBRTNDLE1BQU1FLE9BQU8sR0FBR2YsU0FBUyxDQUF1RCxDQUFDLENBQUU7TUFFakY7TUFDQWdCLEdBQUcsRUFBRUMsS0FBSyxJQUFNUixJQUFJLENBQUNTLElBQUksQ0FBRUQsS0FBTSxDQUFDLEdBQUdSLElBQUksQ0FBQ1UsSUFBSSxDQUFFVixJQUFJLENBQUNDLEdBQUcsQ0FBRU8sS0FBTSxDQUFDLEdBQUdILENBQUUsQ0FBRztNQUV6RTtNQUNBTSxVQUFVLEVBQUVILEtBQUssSUFBTVIsSUFBSSxDQUFDUyxJQUFJLENBQUVELEtBQU0sQ0FBQyxHQUFHSCxDQUFDLEdBQUdHLEtBQUssR0FBR0E7SUFDMUQsQ0FBQyxFQUFFVixlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRUYsTUFBTSxFQUFFQyxtQkFBbUIsRUFBRVMsT0FBUSxDQUFDO0VBQy9DO0FBQ0Y7QUFFQWQsa0JBQWtCLENBQUNvQixRQUFRLENBQUUsaUJBQWlCLEVBQUVsQixlQUFnQixDQUFDIn0=