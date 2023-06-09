// Copyright 2023, University of Colorado Boulder

/**
 * LabeledPoint is the model element for a labeled point on a curve. These elements can only be made visible
 * via PhET-iO, or via the (developer) query parameter 'labeledPointsVisible'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import calculusGrapher from '../../calculusGrapher.js';
import { ColorProperty } from '../../../../scenery/js/imports.js';
import LabeledAncillaryTool from './LabeledAncillaryTool.js';
import CalculusGrapherColors from '../CalculusGrapherColors.js';
import CalculusGrapherQueryParameters from '../CalculusGrapherQueryParameters.js';
import optionize from '../../../../phet-core/js/optionize.js';
export default class LabeledPoint extends LabeledAncillaryTool {
  // Color to be used for displaying the point

  constructor(integralCurve, originalCurve, derivativeCurve, secondDerivativeCurve, providedOptions) {
    const options = optionize()({
      // LabeledAncillaryToolOptions
      visible: CalculusGrapherQueryParameters.labeledPointsVisible
    }, providedOptions);
    super(integralCurve, originalCurve, derivativeCurve, secondDerivativeCurve, options);
    this.pointColorProperty = new ColorProperty(options.pointColor, {
      tandem: options.tandem.createTandem('pointColorProperty')
    });
  }

  /**
   * Creates a specified number of LabeledPoint instances, with evenly spaced initialCoordinates,
   * and alphabetically-ordered tandem names.
   */
  static createLabeledPoints(numberOfTools, integralCurve, originalCurve, derivativeCurve, secondDerivativeCurve, parentTandem) {
    return LabeledAncillaryTool.createLabeledAncillaryTools(numberOfTools, (x, label) => new LabeledPoint(integralCurve, originalCurve, derivativeCurve, secondDerivativeCurve, {
      x: x,
      label: label,
      pointColor: CalculusGrapherColors.originalCurveStrokeProperty.value,
      tandem: parentTandem.createTandem(`${label}Point`)
    }));
  }
}
calculusGrapher.register('LabeledPoint', LabeledPoint);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjYWxjdWx1c0dyYXBoZXIiLCJDb2xvclByb3BlcnR5IiwiTGFiZWxlZEFuY2lsbGFyeVRvb2wiLCJDYWxjdWx1c0dyYXBoZXJDb2xvcnMiLCJDYWxjdWx1c0dyYXBoZXJRdWVyeVBhcmFtZXRlcnMiLCJvcHRpb25pemUiLCJMYWJlbGVkUG9pbnQiLCJjb25zdHJ1Y3RvciIsImludGVncmFsQ3VydmUiLCJvcmlnaW5hbEN1cnZlIiwiZGVyaXZhdGl2ZUN1cnZlIiwic2Vjb25kRGVyaXZhdGl2ZUN1cnZlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInZpc2libGUiLCJsYWJlbGVkUG9pbnRzVmlzaWJsZSIsInBvaW50Q29sb3JQcm9wZXJ0eSIsInBvaW50Q29sb3IiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJjcmVhdGVMYWJlbGVkUG9pbnRzIiwibnVtYmVyT2ZUb29scyIsInBhcmVudFRhbmRlbSIsImNyZWF0ZUxhYmVsZWRBbmNpbGxhcnlUb29scyIsIngiLCJsYWJlbCIsIm9yaWdpbmFsQ3VydmVTdHJva2VQcm9wZXJ0eSIsInZhbHVlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMYWJlbGVkUG9pbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIExhYmVsZWRQb2ludCBpcyB0aGUgbW9kZWwgZWxlbWVudCBmb3IgYSBsYWJlbGVkIHBvaW50IG9uIGEgY3VydmUuIFRoZXNlIGVsZW1lbnRzIGNhbiBvbmx5IGJlIG1hZGUgdmlzaWJsZVxyXG4gKiB2aWEgUGhFVC1pTywgb3IgdmlhIHRoZSAoZGV2ZWxvcGVyKSBxdWVyeSBwYXJhbWV0ZXIgJ2xhYmVsZWRQb2ludHNWaXNpYmxlJy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQ3VydmUgZnJvbSAnLi9DdXJ2ZS5qcyc7XHJcbmltcG9ydCBjYWxjdWx1c0dyYXBoZXIgZnJvbSAnLi4vLi4vY2FsY3VsdXNHcmFwaGVyLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIENvbG9yUHJvcGVydHkgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTGFiZWxlZEFuY2lsbGFyeVRvb2wsIHsgTGFiZWxlZEFuY2lsbGFyeVRvb2xPcHRpb25zIH0gZnJvbSAnLi9MYWJlbGVkQW5jaWxsYXJ5VG9vbC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBDYWxjdWx1c0dyYXBoZXJDb2xvcnMgZnJvbSAnLi4vQ2FsY3VsdXNHcmFwaGVyQ29sb3JzLmpzJztcclxuaW1wb3J0IENhbGN1bHVzR3JhcGhlclF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9DYWxjdWx1c0dyYXBoZXJRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBwb2ludENvbG9yOiBDb2xvcjtcclxufTtcclxuXHJcbnR5cGUgTGFiZWxlZFBvaW50T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPExhYmVsZWRBbmNpbGxhcnlUb29sT3B0aW9ucywgJ3gnIHwgJ2xhYmVsJyB8ICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExhYmVsZWRQb2ludCBleHRlbmRzIExhYmVsZWRBbmNpbGxhcnlUb29sIHtcclxuXHJcbiAgLy8gQ29sb3IgdG8gYmUgdXNlZCBmb3IgZGlzcGxheWluZyB0aGUgcG9pbnRcclxuICBwdWJsaWMgcmVhZG9ubHkgcG9pbnRDb2xvclByb3BlcnR5OiBDb2xvclByb3BlcnR5O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGludGVncmFsQ3VydmU6IEN1cnZlLCBvcmlnaW5hbEN1cnZlOiBDdXJ2ZSwgZGVyaXZhdGl2ZUN1cnZlOiBDdXJ2ZSwgc2Vjb25kRGVyaXZhdGl2ZUN1cnZlOiBDdXJ2ZSxcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9uczogTGFiZWxlZFBvaW50T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPExhYmVsZWRQb2ludE9wdGlvbnMsIFNlbGZPcHRpb25zLCBMYWJlbGVkQW5jaWxsYXJ5VG9vbE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIExhYmVsZWRBbmNpbGxhcnlUb29sT3B0aW9uc1xyXG4gICAgICB2aXNpYmxlOiBDYWxjdWx1c0dyYXBoZXJRdWVyeVBhcmFtZXRlcnMubGFiZWxlZFBvaW50c1Zpc2libGVcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBpbnRlZ3JhbEN1cnZlLCBvcmlnaW5hbEN1cnZlLCBkZXJpdmF0aXZlQ3VydmUsIHNlY29uZERlcml2YXRpdmVDdXJ2ZSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMucG9pbnRDb2xvclByb3BlcnR5ID0gbmV3IENvbG9yUHJvcGVydHkoIG9wdGlvbnMucG9pbnRDb2xvciwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BvaW50Q29sb3JQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHNwZWNpZmllZCBudW1iZXIgb2YgTGFiZWxlZFBvaW50IGluc3RhbmNlcywgd2l0aCBldmVubHkgc3BhY2VkIGluaXRpYWxDb29yZGluYXRlcyxcclxuICAgKiBhbmQgYWxwaGFiZXRpY2FsbHktb3JkZXJlZCB0YW5kZW0gbmFtZXMuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVMYWJlbGVkUG9pbnRzKCBudW1iZXJPZlRvb2xzOiBudW1iZXIsIGludGVncmFsQ3VydmU6IEN1cnZlLCBvcmlnaW5hbEN1cnZlOiBDdXJ2ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcml2YXRpdmVDdXJ2ZTogQ3VydmUsIHNlY29uZERlcml2YXRpdmVDdXJ2ZTogQ3VydmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRUYW5kZW06IFRhbmRlbSApOiBMYWJlbGVkUG9pbnRbXSB7XHJcbiAgICByZXR1cm4gTGFiZWxlZEFuY2lsbGFyeVRvb2wuY3JlYXRlTGFiZWxlZEFuY2lsbGFyeVRvb2xzKCBudW1iZXJPZlRvb2xzLFxyXG4gICAgICAoIHg6IG51bWJlciwgbGFiZWw6IHN0cmluZyApID0+XHJcbiAgICAgICAgbmV3IExhYmVsZWRQb2ludCggaW50ZWdyYWxDdXJ2ZSwgb3JpZ2luYWxDdXJ2ZSwgZGVyaXZhdGl2ZUN1cnZlLCBzZWNvbmREZXJpdmF0aXZlQ3VydmUsIHtcclxuICAgICAgICAgIHg6IHgsXHJcbiAgICAgICAgICBsYWJlbDogbGFiZWwsXHJcbiAgICAgICAgICBwb2ludENvbG9yOiBDYWxjdWx1c0dyYXBoZXJDb2xvcnMub3JpZ2luYWxDdXJ2ZVN0cm9rZVByb3BlcnR5LnZhbHVlLFxyXG4gICAgICAgICAgdGFuZGVtOiBwYXJlbnRUYW5kZW0uY3JlYXRlVGFuZGVtKCBgJHtsYWJlbH1Qb2ludGAgKVxyXG4gICAgICAgIH0gKSApO1xyXG4gIH1cclxufVxyXG5cclxuY2FsY3VsdXNHcmFwaGVyLnJlZ2lzdGVyKCAnTGFiZWxlZFBvaW50JywgTGFiZWxlZFBvaW50ICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsU0FBZ0JDLGFBQWEsUUFBUSxtQ0FBbUM7QUFDeEUsT0FBT0Msb0JBQW9CLE1BQXVDLDJCQUEyQjtBQUU3RixPQUFPQyxxQkFBcUIsTUFBTSw2QkFBNkI7QUFDL0QsT0FBT0MsOEJBQThCLE1BQU0sc0NBQXNDO0FBQ2pGLE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFTN0QsZUFBZSxNQUFNQyxZQUFZLFNBQVNKLG9CQUFvQixDQUFDO0VBRTdEOztFQUdPSyxXQUFXQSxDQUFFQyxhQUFvQixFQUFFQyxhQUFvQixFQUFFQyxlQUFzQixFQUFFQyxxQkFBNEIsRUFDaEdDLGVBQW9DLEVBQUc7SUFFekQsTUFBTUMsT0FBTyxHQUFHUixTQUFTLENBQWdFLENBQUMsQ0FBRTtNQUUxRjtNQUNBUyxPQUFPLEVBQUVWLDhCQUE4QixDQUFDVztJQUMxQyxDQUFDLEVBQUVILGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUFFSixhQUFhLEVBQUVDLGFBQWEsRUFBRUMsZUFBZSxFQUFFQyxxQkFBcUIsRUFBRUUsT0FBUSxDQUFDO0lBRXRGLElBQUksQ0FBQ0csa0JBQWtCLEdBQUcsSUFBSWYsYUFBYSxDQUFFWSxPQUFPLENBQUNJLFVBQVUsRUFBRTtNQUMvREMsTUFBTSxFQUFFTCxPQUFPLENBQUNLLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLG9CQUFxQjtJQUM1RCxDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFLE9BQWNDLG1CQUFtQkEsQ0FBRUMsYUFBcUIsRUFBRWIsYUFBb0IsRUFBRUMsYUFBb0IsRUFDakVDLGVBQXNCLEVBQUVDLHFCQUE0QixFQUNwRFcsWUFBb0IsRUFBbUI7SUFDeEUsT0FBT3BCLG9CQUFvQixDQUFDcUIsMkJBQTJCLENBQUVGLGFBQWEsRUFDcEUsQ0FBRUcsQ0FBUyxFQUFFQyxLQUFhLEtBQ3hCLElBQUluQixZQUFZLENBQUVFLGFBQWEsRUFBRUMsYUFBYSxFQUFFQyxlQUFlLEVBQUVDLHFCQUFxQixFQUFFO01BQ3RGYSxDQUFDLEVBQUVBLENBQUM7TUFDSkMsS0FBSyxFQUFFQSxLQUFLO01BQ1pSLFVBQVUsRUFBRWQscUJBQXFCLENBQUN1QiwyQkFBMkIsQ0FBQ0MsS0FBSztNQUNuRVQsTUFBTSxFQUFFSSxZQUFZLENBQUNILFlBQVksQ0FBRyxHQUFFTSxLQUFNLE9BQU87SUFDckQsQ0FBRSxDQUFFLENBQUM7RUFDWDtBQUNGO0FBRUF6QixlQUFlLENBQUM0QixRQUFRLENBQUUsY0FBYyxFQUFFdEIsWUFBYSxDQUFDIn0=