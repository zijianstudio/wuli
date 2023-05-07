// Copyright 2023, University of Colorado Boulder

/**
 * LabeledAncillaryTool is the base class for ancillary tools that have a label.
 *
 * @author Martin Veillette
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Text } from '../../../../scenery/js/imports.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import calculusGrapher from '../../calculusGrapher.js';
import AncillaryTool from './AncillaryTool.js';
import CalculusGrapherConstants from '../CalculusGrapherConstants.js';
export default class LabeledAncillaryTool extends AncillaryTool {
  // The string to be displayed on the tool

  constructor(integralCurve, originalCurve, derivativeCurve, secondDerivativeCurve, providedOptions) {
    const options = providedOptions;
    super(integralCurve, originalCurve, derivativeCurve, secondDerivativeCurve, options);
    this.stringProperty = new StringProperty(options.label, {
      tandem: options.tandem.createTandem(Text.STRING_PROPERTY_TANDEM_NAME)
    });
  }

  /**
   * Converts an integer in the range 0-25 to an uppercase letter in the range A-Z.
   * This is used to generate labels for tools.
   */
  static intToUppercaseLetter(integer) {
    assert && assert(Number.isInteger(integer), `must be an integer: ${integer}`);
    assert && assert(integer >= 0 && integer <= 25, `integer must range from 0 to 25: ${integer}`);
    return String.fromCharCode(integer + 'A'.charCodeAt(0));
  }

  /**
   * Creates a specified number of tool instances, with evenly-spaced x coordinates, and alphabetically-ordered labels.
   * @param numberOfTools
   * @param createTool - x is the tool's initial x coordinate, label is the string used to label the tool
   */
  static createLabeledAncillaryTools(numberOfTools, createTool) {
    const tools = [];
    for (let i = 0; i < numberOfTools; i++) {
      // evenly spaced, but avoiding CURVE_X_RANGE.min and CURVE_X_RANGE.max, where they would overlap the
      // edges of the chart
      const x = CalculusGrapherConstants.CURVE_X_RANGE.expandNormalizedValue((i + 1) / (numberOfTools + 1));

      // convert integer to uppercase character: 0->A, 1->B, etc
      const label = LabeledAncillaryTool.intToUppercaseLetter(i);

      // create the tool
      tools.push(createTool(x, label));
    }
    return tools;
  }
}
calculusGrapher.register('LabeledAncillaryTool', LabeledAncillaryTool);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZXh0IiwiU3RyaW5nUHJvcGVydHkiLCJjYWxjdWx1c0dyYXBoZXIiLCJBbmNpbGxhcnlUb29sIiwiQ2FsY3VsdXNHcmFwaGVyQ29uc3RhbnRzIiwiTGFiZWxlZEFuY2lsbGFyeVRvb2wiLCJjb25zdHJ1Y3RvciIsImludGVncmFsQ3VydmUiLCJvcmlnaW5hbEN1cnZlIiwiZGVyaXZhdGl2ZUN1cnZlIiwic2Vjb25kRGVyaXZhdGl2ZUN1cnZlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInN0cmluZ1Byb3BlcnR5IiwibGFiZWwiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJTVFJJTkdfUFJPUEVSVFlfVEFOREVNX05BTUUiLCJpbnRUb1VwcGVyY2FzZUxldHRlciIsImludGVnZXIiLCJhc3NlcnQiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJjaGFyQ29kZUF0IiwiY3JlYXRlTGFiZWxlZEFuY2lsbGFyeVRvb2xzIiwibnVtYmVyT2ZUb29scyIsImNyZWF0ZVRvb2wiLCJ0b29scyIsImkiLCJ4IiwiQ1VSVkVfWF9SQU5HRSIsImV4cGFuZE5vcm1hbGl6ZWRWYWx1ZSIsInB1c2giLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxhYmVsZWRBbmNpbGxhcnlUb29sLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBMYWJlbGVkQW5jaWxsYXJ5VG9vbCBpcyB0aGUgYmFzZSBjbGFzcyBmb3IgYW5jaWxsYXJ5IHRvb2xzIHRoYXQgaGF2ZSBhIGxhYmVsLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBjYWxjdWx1c0dyYXBoZXIgZnJvbSAnLi4vLi4vY2FsY3VsdXNHcmFwaGVyLmpzJztcclxuaW1wb3J0IEFuY2lsbGFyeVRvb2wsIHsgQW5jaWxsYXJ5VG9vbE9wdGlvbnMgfSBmcm9tICcuL0FuY2lsbGFyeVRvb2wuanMnO1xyXG5pbXBvcnQgQ3VydmUgZnJvbSAnLi9DdXJ2ZS5qcyc7XHJcbmltcG9ydCBDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMgZnJvbSAnLi4vQ2FsY3VsdXNHcmFwaGVyQ29uc3RhbnRzLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgbGFiZWw6IHN0cmluZztcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIExhYmVsZWRBbmNpbGxhcnlUb29sT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgQW5jaWxsYXJ5VG9vbE9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYWJlbGVkQW5jaWxsYXJ5VG9vbCBleHRlbmRzIEFuY2lsbGFyeVRvb2wge1xyXG5cclxuICAvLyBUaGUgc3RyaW5nIHRvIGJlIGRpc3BsYXllZCBvbiB0aGUgdG9vbFxyXG4gIHB1YmxpYyByZWFkb25seSBzdHJpbmdQcm9wZXJ0eTogUHJvcGVydHk8c3RyaW5nPjtcclxuXHJcbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxyXG4gICAgaW50ZWdyYWxDdXJ2ZTogQ3VydmUsXHJcbiAgICBvcmlnaW5hbEN1cnZlOiBDdXJ2ZSxcclxuICAgIGRlcml2YXRpdmVDdXJ2ZTogQ3VydmUsXHJcbiAgICBzZWNvbmREZXJpdmF0aXZlQ3VydmU6IEN1cnZlLFxyXG4gICAgcHJvdmlkZWRPcHRpb25zOiBMYWJlbGVkQW5jaWxsYXJ5VG9vbE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IHByb3ZpZGVkT3B0aW9ucztcclxuXHJcbiAgICBzdXBlciggaW50ZWdyYWxDdXJ2ZSwgb3JpZ2luYWxDdXJ2ZSwgZGVyaXZhdGl2ZUN1cnZlLCBzZWNvbmREZXJpdmF0aXZlQ3VydmUsIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnN0cmluZ1Byb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCBvcHRpb25zLmxhYmVsLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCBUZXh0LlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSApXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0cyBhbiBpbnRlZ2VyIGluIHRoZSByYW5nZSAwLTI1IHRvIGFuIHVwcGVyY2FzZSBsZXR0ZXIgaW4gdGhlIHJhbmdlIEEtWi5cclxuICAgKiBUaGlzIGlzIHVzZWQgdG8gZ2VuZXJhdGUgbGFiZWxzIGZvciB0b29scy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGludFRvVXBwZXJjYXNlTGV0dGVyKCBpbnRlZ2VyOiBudW1iZXIgKTogc3RyaW5nIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIGludGVnZXIgKSwgYG11c3QgYmUgYW4gaW50ZWdlcjogJHtpbnRlZ2VyfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGludGVnZXIgPj0gMCAmJiBpbnRlZ2VyIDw9IDI1LCBgaW50ZWdlciBtdXN0IHJhbmdlIGZyb20gMCB0byAyNTogJHtpbnRlZ2VyfWAgKTtcclxuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKCBpbnRlZ2VyICsgJ0EnLmNoYXJDb2RlQXQoIDAgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHNwZWNpZmllZCBudW1iZXIgb2YgdG9vbCBpbnN0YW5jZXMsIHdpdGggZXZlbmx5LXNwYWNlZCB4IGNvb3JkaW5hdGVzLCBhbmQgYWxwaGFiZXRpY2FsbHktb3JkZXJlZCBsYWJlbHMuXHJcbiAgICogQHBhcmFtIG51bWJlck9mVG9vbHNcclxuICAgKiBAcGFyYW0gY3JlYXRlVG9vbCAtIHggaXMgdGhlIHRvb2wncyBpbml0aWFsIHggY29vcmRpbmF0ZSwgbGFiZWwgaXMgdGhlIHN0cmluZyB1c2VkIHRvIGxhYmVsIHRoZSB0b29sXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIHN0YXRpYyBjcmVhdGVMYWJlbGVkQW5jaWxsYXJ5VG9vbHM8VCBleHRlbmRzIExhYmVsZWRBbmNpbGxhcnlUb29sPihcclxuICAgIG51bWJlck9mVG9vbHM6IG51bWJlciwgY3JlYXRlVG9vbDogKCB4OiBudW1iZXIsIGxhYmVsOiBzdHJpbmcgKSA9PiBUICk6IFRbXSB7XHJcblxyXG4gICAgY29uc3QgdG9vbHM6IFRbXSA9IFtdO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZUb29sczsgaSsrICkge1xyXG5cclxuICAgICAgLy8gZXZlbmx5IHNwYWNlZCwgYnV0IGF2b2lkaW5nIENVUlZFX1hfUkFOR0UubWluIGFuZCBDVVJWRV9YX1JBTkdFLm1heCwgd2hlcmUgdGhleSB3b3VsZCBvdmVybGFwIHRoZVxyXG4gICAgICAvLyBlZGdlcyBvZiB0aGUgY2hhcnRcclxuICAgICAgY29uc3QgeCA9IENhbGN1bHVzR3JhcGhlckNvbnN0YW50cy5DVVJWRV9YX1JBTkdFLmV4cGFuZE5vcm1hbGl6ZWRWYWx1ZSggKCBpICsgMSApIC8gKCBudW1iZXJPZlRvb2xzICsgMSApICk7XHJcblxyXG4gICAgICAvLyBjb252ZXJ0IGludGVnZXIgdG8gdXBwZXJjYXNlIGNoYXJhY3RlcjogMC0+QSwgMS0+QiwgZXRjXHJcbiAgICAgIGNvbnN0IGxhYmVsID0gTGFiZWxlZEFuY2lsbGFyeVRvb2wuaW50VG9VcHBlcmNhc2VMZXR0ZXIoIGkgKTtcclxuXHJcbiAgICAgIC8vIGNyZWF0ZSB0aGUgdG9vbFxyXG4gICAgICB0b29scy5wdXNoKCBjcmVhdGVUb29sKCB4LCBsYWJlbCApICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdG9vbHM7XHJcbiAgfVxyXG59XHJcblxyXG5jYWxjdWx1c0dyYXBoZXIucmVnaXN0ZXIoICdMYWJlbGVkQW5jaWxsYXJ5VG9vbCcsIExhYmVsZWRBbmNpbGxhcnlUb29sICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLElBQUksUUFBUSxtQ0FBbUM7QUFFeEQsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLGFBQWEsTUFBZ0Msb0JBQW9CO0FBRXhFLE9BQU9DLHdCQUF3QixNQUFNLGdDQUFnQztBQVFyRSxlQUFlLE1BQU1DLG9CQUFvQixTQUFTRixhQUFhLENBQUM7RUFFOUQ7O0VBR1VHLFdBQVdBLENBQ25CQyxhQUFvQixFQUNwQkMsYUFBb0IsRUFDcEJDLGVBQXNCLEVBQ3RCQyxxQkFBNEIsRUFDNUJDLGVBQTRDLEVBQUc7SUFFL0MsTUFBTUMsT0FBTyxHQUFHRCxlQUFlO0lBRS9CLEtBQUssQ0FBRUosYUFBYSxFQUFFQyxhQUFhLEVBQUVDLGVBQWUsRUFBRUMscUJBQXFCLEVBQUVFLE9BQVEsQ0FBQztJQUV0RixJQUFJLENBQUNDLGNBQWMsR0FBRyxJQUFJWixjQUFjLENBQUVXLE9BQU8sQ0FBQ0UsS0FBSyxFQUFFO01BQ3ZEQyxNQUFNLEVBQUVILE9BQU8sQ0FBQ0csTUFBTSxDQUFDQyxZQUFZLENBQUVoQixJQUFJLENBQUNpQiwyQkFBNEI7SUFDeEUsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRSxPQUFjQyxvQkFBb0JBLENBQUVDLE9BQWUsRUFBVztJQUM1REMsTUFBTSxJQUFJQSxNQUFNLENBQUVDLE1BQU0sQ0FBQ0MsU0FBUyxDQUFFSCxPQUFRLENBQUMsRUFBRyx1QkFBc0JBLE9BQVEsRUFBRSxDQUFDO0lBQ2pGQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUQsT0FBTyxJQUFJLENBQUMsSUFBSUEsT0FBTyxJQUFJLEVBQUUsRUFBRyxvQ0FBbUNBLE9BQVEsRUFBRSxDQUFDO0lBQ2hHLE9BQU9JLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFTCxPQUFPLEdBQUcsR0FBRyxDQUFDTSxVQUFVLENBQUUsQ0FBRSxDQUFFLENBQUM7RUFDN0Q7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQWlCQywyQkFBMkJBLENBQzFDQyxhQUFxQixFQUFFQyxVQUE2QyxFQUFRO0lBRTVFLE1BQU1DLEtBQVUsR0FBRyxFQUFFO0lBQ3JCLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHSCxhQUFhLEVBQUVHLENBQUMsRUFBRSxFQUFHO01BRXhDO01BQ0E7TUFDQSxNQUFNQyxDQUFDLEdBQUczQix3QkFBd0IsQ0FBQzRCLGFBQWEsQ0FBQ0MscUJBQXFCLENBQUUsQ0FBRUgsQ0FBQyxHQUFHLENBQUMsS0FBT0gsYUFBYSxHQUFHLENBQUMsQ0FBRyxDQUFDOztNQUUzRztNQUNBLE1BQU1iLEtBQUssR0FBR1Qsb0JBQW9CLENBQUNhLG9CQUFvQixDQUFFWSxDQUFFLENBQUM7O01BRTVEO01BQ0FELEtBQUssQ0FBQ0ssSUFBSSxDQUFFTixVQUFVLENBQUVHLENBQUMsRUFBRWpCLEtBQU0sQ0FBRSxDQUFDO0lBQ3RDO0lBQ0EsT0FBT2UsS0FBSztFQUNkO0FBQ0Y7QUFFQTNCLGVBQWUsQ0FBQ2lDLFFBQVEsQ0FBRSxzQkFBc0IsRUFBRTlCLG9CQUFxQixDQUFDIn0=