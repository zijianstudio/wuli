// Copyright 2015-2022, University of Colorado Boulder

/**
 *  ForcePlot is an XY plot of displacement (x-axis) vs force (y-axis),
 *  with energy (E) being the area under the curve.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Line, Path } from '../../../../scenery/js/imports.js';
import HookesLawColors from '../../common/HookesLawColors.js';
import HookesLawConstants from '../../common/HookesLawConstants.js';
import hookesLaw from '../../hookesLaw.js';
import HookesLawStrings from '../../HookesLawStrings.js';
import XYPointPlot from './XYPointPlot.js';
import optionize from '../../../../phet-core/js/optionize.js';
export default class ForcePlot extends XYPointPlot {
  /**
   * @param spring
   * @param unitDisplacementLength - view length of a 1m displacement vector
   * @param valuesVisibleProperty - whether values are visible on the plot
   * @param displacementVectorVisibleProperty - whether the horizontal displacement is displayed
   * @param energyVisibleProperty - whether the area that represents energy is filled in
   * @param providedOptions
   */
  constructor(spring, unitDisplacementLength, valuesVisibleProperty, displacementVectorVisibleProperty, energyVisibleProperty, providedOptions) {
    const options = optionize()({
      // XYPointPlotOptions
      // both axes
      axisFont: HookesLawConstants.XY_PLOT_AXIS_FONT,
      valueFont: HookesLawConstants.XY_PLOT_VALUE_FONT,
      // x-axis
      minX: unitDisplacementLength * (1.1 * spring.displacementRange.min),
      maxX: unitDisplacementLength * (1.1 * spring.displacementRange.max),
      xString: HookesLawStrings.displacement,
      xUnits: HookesLawStrings.meters,
      xDecimalPlaces: HookesLawConstants.DISPLACEMENT_DECIMAL_PLACES,
      xValueFill: HookesLawColors.DISPLACEMENT,
      xUnitLength: unitDisplacementLength,
      xLabelMaxWidth: 100,
      // constrain width for i18n, determined empirically

      // y-axis
      minY: -HookesLawConstants.FORCE_Y_AXIS_LENGTH / 2,
      maxY: HookesLawConstants.FORCE_Y_AXIS_LENGTH / 2,
      yString: HookesLawStrings.appliedForce,
      yUnits: HookesLawStrings.newtons,
      yDecimalPlaces: HookesLawConstants.APPLIED_FORCE_DECIMAL_PLACES,
      yValueFill: HookesLawColors.APPLIED_FORCE,
      yUnitLength: HookesLawConstants.UNIT_FORCE_Y,
      // point
      pointFill: HookesLawColors.SINGLE_SPRING
    }, providedOptions);
    super(spring.displacementProperty, spring.appliedForceProperty, valuesVisibleProperty, displacementVectorVisibleProperty, options);

    // The line that corresponds to F = kx
    const forceLineNode = new Line(0, 0, 1, 1, {
      stroke: HookesLawColors.APPLIED_FORCE,
      lineWidth: 3
    });
    this.addChild(forceLineNode);
    forceLineNode.moveToBack();

    // energy area
    const energyPath = new Path(null, {
      fill: HookesLawColors.ENERGY
    });
    this.addChild(energyPath);
    energyPath.moveToBack();

    // update force line
    spring.springConstantProperty.link(springConstant => {
      // x
      const minDisplacement = options.xUnitLength * spring.displacementRange.min;
      const maxDisplacement = options.xUnitLength * spring.displacementRange.max;

      // F = kx
      const minForce = -options.yUnitLength * springConstant * spring.displacementRange.min;
      const maxForce = -options.yUnitLength * springConstant * spring.displacementRange.max;
      forceLineNode.setLine(minDisplacement, minForce, maxDisplacement, maxForce);
    });

    // update energy area (triangle)
    Multilink.multilink([spring.displacementProperty, spring.appliedForceProperty, energyVisibleProperty], (displacement, appliedForce, visible) => {
      const fixedDisplacement = Utils.toFixedNumber(displacement, options.xDecimalPlaces);
      const x = options.xUnitLength * fixedDisplacement;
      const y = -appliedForce * options.yUnitLength;
      energyPath.visible = fixedDisplacement !== 0 && visible;
      if (energyPath.visible) {
        energyPath.shape = new Shape().moveTo(0, 0).lineTo(x, 0).lineTo(x, y).close();
      }
    });
  }
}
hookesLaw.register('ForcePlot', ForcePlot);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJVdGlscyIsIlNoYXBlIiwiTGluZSIsIlBhdGgiLCJIb29rZXNMYXdDb2xvcnMiLCJIb29rZXNMYXdDb25zdGFudHMiLCJob29rZXNMYXciLCJIb29rZXNMYXdTdHJpbmdzIiwiWFlQb2ludFBsb3QiLCJvcHRpb25pemUiLCJGb3JjZVBsb3QiLCJjb25zdHJ1Y3RvciIsInNwcmluZyIsInVuaXREaXNwbGFjZW1lbnRMZW5ndGgiLCJ2YWx1ZXNWaXNpYmxlUHJvcGVydHkiLCJkaXNwbGFjZW1lbnRWZWN0b3JWaXNpYmxlUHJvcGVydHkiLCJlbmVyZ3lWaXNpYmxlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiYXhpc0ZvbnQiLCJYWV9QTE9UX0FYSVNfRk9OVCIsInZhbHVlRm9udCIsIlhZX1BMT1RfVkFMVUVfRk9OVCIsIm1pblgiLCJkaXNwbGFjZW1lbnRSYW5nZSIsIm1pbiIsIm1heFgiLCJtYXgiLCJ4U3RyaW5nIiwiZGlzcGxhY2VtZW50IiwieFVuaXRzIiwibWV0ZXJzIiwieERlY2ltYWxQbGFjZXMiLCJESVNQTEFDRU1FTlRfREVDSU1BTF9QTEFDRVMiLCJ4VmFsdWVGaWxsIiwiRElTUExBQ0VNRU5UIiwieFVuaXRMZW5ndGgiLCJ4TGFiZWxNYXhXaWR0aCIsIm1pblkiLCJGT1JDRV9ZX0FYSVNfTEVOR1RIIiwibWF4WSIsInlTdHJpbmciLCJhcHBsaWVkRm9yY2UiLCJ5VW5pdHMiLCJuZXd0b25zIiwieURlY2ltYWxQbGFjZXMiLCJBUFBMSUVEX0ZPUkNFX0RFQ0lNQUxfUExBQ0VTIiwieVZhbHVlRmlsbCIsIkFQUExJRURfRk9SQ0UiLCJ5VW5pdExlbmd0aCIsIlVOSVRfRk9SQ0VfWSIsInBvaW50RmlsbCIsIlNJTkdMRV9TUFJJTkciLCJkaXNwbGFjZW1lbnRQcm9wZXJ0eSIsImFwcGxpZWRGb3JjZVByb3BlcnR5IiwiZm9yY2VMaW5lTm9kZSIsInN0cm9rZSIsImxpbmVXaWR0aCIsImFkZENoaWxkIiwibW92ZVRvQmFjayIsImVuZXJneVBhdGgiLCJmaWxsIiwiRU5FUkdZIiwic3ByaW5nQ29uc3RhbnRQcm9wZXJ0eSIsImxpbmsiLCJzcHJpbmdDb25zdGFudCIsIm1pbkRpc3BsYWNlbWVudCIsIm1heERpc3BsYWNlbWVudCIsIm1pbkZvcmNlIiwibWF4Rm9yY2UiLCJzZXRMaW5lIiwibXVsdGlsaW5rIiwidmlzaWJsZSIsImZpeGVkRGlzcGxhY2VtZW50IiwidG9GaXhlZE51bWJlciIsIngiLCJ5Iiwic2hhcGUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJjbG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRm9yY2VQbG90LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqICBGb3JjZVBsb3QgaXMgYW4gWFkgcGxvdCBvZiBkaXNwbGFjZW1lbnQgKHgtYXhpcykgdnMgZm9yY2UgKHktYXhpcyksXHJcbiAqICB3aXRoIGVuZXJneSAoRSkgYmVpbmcgdGhlIGFyZWEgdW5kZXIgdGhlIGN1cnZlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBMaW5lLCBOb2RlVHJhbnNsYXRpb25PcHRpb25zLCBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEhvb2tlc0xhd0NvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vSG9va2VzTGF3Q29sb3JzLmpzJztcclxuaW1wb3J0IEhvb2tlc0xhd0NvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vSG9va2VzTGF3Q29uc3RhbnRzLmpzJztcclxuaW1wb3J0IGhvb2tlc0xhdyBmcm9tICcuLi8uLi9ob29rZXNMYXcuanMnO1xyXG5pbXBvcnQgSG9va2VzTGF3U3RyaW5ncyBmcm9tICcuLi8uLi9Ib29rZXNMYXdTdHJpbmdzLmpzJztcclxuaW1wb3J0IFhZUG9pbnRQbG90LCB7IFhZUG9pbnRQbG90T3B0aW9ucyB9IGZyb20gJy4vWFlQb2ludFBsb3QuanMnO1xyXG5pbXBvcnQgU3ByaW5nIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9TcHJpbmcuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIEZvcmNlUGxvdE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8WFlQb2ludFBsb3RPcHRpb25zLCAndGFuZGVtJyB8ICd2aXNpYmxlUHJvcGVydHknPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZvcmNlUGxvdCBleHRlbmRzIFhZUG9pbnRQbG90IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHNwcmluZ1xyXG4gICAqIEBwYXJhbSB1bml0RGlzcGxhY2VtZW50TGVuZ3RoIC0gdmlldyBsZW5ndGggb2YgYSAxbSBkaXNwbGFjZW1lbnQgdmVjdG9yXHJcbiAgICogQHBhcmFtIHZhbHVlc1Zpc2libGVQcm9wZXJ0eSAtIHdoZXRoZXIgdmFsdWVzIGFyZSB2aXNpYmxlIG9uIHRoZSBwbG90XHJcbiAgICogQHBhcmFtIGRpc3BsYWNlbWVudFZlY3RvclZpc2libGVQcm9wZXJ0eSAtIHdoZXRoZXIgdGhlIGhvcml6b250YWwgZGlzcGxhY2VtZW50IGlzIGRpc3BsYXllZFxyXG4gICAqIEBwYXJhbSBlbmVyZ3lWaXNpYmxlUHJvcGVydHkgLSB3aGV0aGVyIHRoZSBhcmVhIHRoYXQgcmVwcmVzZW50cyBlbmVyZ3kgaXMgZmlsbGVkIGluXHJcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3ByaW5nOiBTcHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICB1bml0RGlzcGxhY2VtZW50TGVuZ3RoOiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXNWaXNpYmxlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgZGlzcGxhY2VtZW50VmVjdG9yVmlzaWJsZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIGVuZXJneVZpc2libGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IEZvcmNlUGxvdE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxGb3JjZVBsb3RPcHRpb25zLCBTZWxmT3B0aW9ucywgWFlQb2ludFBsb3RPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBYWVBvaW50UGxvdE9wdGlvbnNcclxuICAgICAgLy8gYm90aCBheGVzXHJcbiAgICAgIGF4aXNGb250OiBIb29rZXNMYXdDb25zdGFudHMuWFlfUExPVF9BWElTX0ZPTlQsXHJcbiAgICAgIHZhbHVlRm9udDogSG9va2VzTGF3Q29uc3RhbnRzLlhZX1BMT1RfVkFMVUVfRk9OVCxcclxuXHJcbiAgICAgIC8vIHgtYXhpc1xyXG4gICAgICBtaW5YOiB1bml0RGlzcGxhY2VtZW50TGVuZ3RoICogKCAxLjEgKiBzcHJpbmcuZGlzcGxhY2VtZW50UmFuZ2UubWluICksXHJcbiAgICAgIG1heFg6IHVuaXREaXNwbGFjZW1lbnRMZW5ndGggKiAoIDEuMSAqIHNwcmluZy5kaXNwbGFjZW1lbnRSYW5nZS5tYXggKSxcclxuICAgICAgeFN0cmluZzogSG9va2VzTGF3U3RyaW5ncy5kaXNwbGFjZW1lbnQsXHJcbiAgICAgIHhVbml0czogSG9va2VzTGF3U3RyaW5ncy5tZXRlcnMsXHJcbiAgICAgIHhEZWNpbWFsUGxhY2VzOiBIb29rZXNMYXdDb25zdGFudHMuRElTUExBQ0VNRU5UX0RFQ0lNQUxfUExBQ0VTLFxyXG4gICAgICB4VmFsdWVGaWxsOiBIb29rZXNMYXdDb2xvcnMuRElTUExBQ0VNRU5ULFxyXG4gICAgICB4VW5pdExlbmd0aDogdW5pdERpc3BsYWNlbWVudExlbmd0aCxcclxuICAgICAgeExhYmVsTWF4V2lkdGg6IDEwMCwgLy8gY29uc3RyYWluIHdpZHRoIGZvciBpMThuLCBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcblxyXG4gICAgICAvLyB5LWF4aXNcclxuICAgICAgbWluWTogLUhvb2tlc0xhd0NvbnN0YW50cy5GT1JDRV9ZX0FYSVNfTEVOR1RIIC8gMixcclxuICAgICAgbWF4WTogSG9va2VzTGF3Q29uc3RhbnRzLkZPUkNFX1lfQVhJU19MRU5HVEggLyAyLFxyXG4gICAgICB5U3RyaW5nOiBIb29rZXNMYXdTdHJpbmdzLmFwcGxpZWRGb3JjZSxcclxuICAgICAgeVVuaXRzOiBIb29rZXNMYXdTdHJpbmdzLm5ld3RvbnMsXHJcbiAgICAgIHlEZWNpbWFsUGxhY2VzOiBIb29rZXNMYXdDb25zdGFudHMuQVBQTElFRF9GT1JDRV9ERUNJTUFMX1BMQUNFUyxcclxuICAgICAgeVZhbHVlRmlsbDogSG9va2VzTGF3Q29sb3JzLkFQUExJRURfRk9SQ0UsXHJcbiAgICAgIHlVbml0TGVuZ3RoOiBIb29rZXNMYXdDb25zdGFudHMuVU5JVF9GT1JDRV9ZLFxyXG5cclxuICAgICAgLy8gcG9pbnRcclxuICAgICAgcG9pbnRGaWxsOiBIb29rZXNMYXdDb2xvcnMuU0lOR0xFX1NQUklOR1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIHNwcmluZy5kaXNwbGFjZW1lbnRQcm9wZXJ0eSwgc3ByaW5nLmFwcGxpZWRGb3JjZVByb3BlcnR5LFxyXG4gICAgICB2YWx1ZXNWaXNpYmxlUHJvcGVydHksIGRpc3BsYWNlbWVudFZlY3RvclZpc2libGVQcm9wZXJ0eSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFRoZSBsaW5lIHRoYXQgY29ycmVzcG9uZHMgdG8gRiA9IGt4XHJcbiAgICBjb25zdCBmb3JjZUxpbmVOb2RlID0gbmV3IExpbmUoIDAsIDAsIDEsIDEsIHtcclxuICAgICAgc3Ryb2tlOiBIb29rZXNMYXdDb2xvcnMuQVBQTElFRF9GT1JDRSxcclxuICAgICAgbGluZVdpZHRoOiAzXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBmb3JjZUxpbmVOb2RlICk7XHJcbiAgICBmb3JjZUxpbmVOb2RlLm1vdmVUb0JhY2soKTtcclxuXHJcbiAgICAvLyBlbmVyZ3kgYXJlYVxyXG4gICAgY29uc3QgZW5lcmd5UGF0aCA9IG5ldyBQYXRoKCBudWxsLCB7XHJcbiAgICAgIGZpbGw6IEhvb2tlc0xhd0NvbG9ycy5FTkVSR1lcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGVuZXJneVBhdGggKTtcclxuICAgIGVuZXJneVBhdGgubW92ZVRvQmFjaygpO1xyXG5cclxuICAgIC8vIHVwZGF0ZSBmb3JjZSBsaW5lXHJcbiAgICBzcHJpbmcuc3ByaW5nQ29uc3RhbnRQcm9wZXJ0eS5saW5rKCBzcHJpbmdDb25zdGFudCA9PiB7XHJcblxyXG4gICAgICAvLyB4XHJcbiAgICAgIGNvbnN0IG1pbkRpc3BsYWNlbWVudCA9IG9wdGlvbnMueFVuaXRMZW5ndGggKiBzcHJpbmcuZGlzcGxhY2VtZW50UmFuZ2UubWluO1xyXG4gICAgICBjb25zdCBtYXhEaXNwbGFjZW1lbnQgPSBvcHRpb25zLnhVbml0TGVuZ3RoICogc3ByaW5nLmRpc3BsYWNlbWVudFJhbmdlLm1heDtcclxuXHJcbiAgICAgIC8vIEYgPSBreFxyXG4gICAgICBjb25zdCBtaW5Gb3JjZSA9IC1vcHRpb25zLnlVbml0TGVuZ3RoICogc3ByaW5nQ29uc3RhbnQgKiBzcHJpbmcuZGlzcGxhY2VtZW50UmFuZ2UubWluO1xyXG4gICAgICBjb25zdCBtYXhGb3JjZSA9IC1vcHRpb25zLnlVbml0TGVuZ3RoICogc3ByaW5nQ29uc3RhbnQgKiBzcHJpbmcuZGlzcGxhY2VtZW50UmFuZ2UubWF4O1xyXG4gICAgICBmb3JjZUxpbmVOb2RlLnNldExpbmUoIG1pbkRpc3BsYWNlbWVudCwgbWluRm9yY2UsIG1heERpc3BsYWNlbWVudCwgbWF4Rm9yY2UgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgZW5lcmd5IGFyZWEgKHRyaWFuZ2xlKVxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBzcHJpbmcuZGlzcGxhY2VtZW50UHJvcGVydHksIHNwcmluZy5hcHBsaWVkRm9yY2VQcm9wZXJ0eSwgZW5lcmd5VmlzaWJsZVByb3BlcnR5IF0sXHJcbiAgICAgICggZGlzcGxhY2VtZW50LCBhcHBsaWVkRm9yY2UsIHZpc2libGUgKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZml4ZWREaXNwbGFjZW1lbnQgPSBVdGlscy50b0ZpeGVkTnVtYmVyKCBkaXNwbGFjZW1lbnQsIG9wdGlvbnMueERlY2ltYWxQbGFjZXMgKTtcclxuICAgICAgICBjb25zdCB4ID0gb3B0aW9ucy54VW5pdExlbmd0aCAqIGZpeGVkRGlzcGxhY2VtZW50O1xyXG4gICAgICAgIGNvbnN0IHkgPSAtYXBwbGllZEZvcmNlICogb3B0aW9ucy55VW5pdExlbmd0aDtcclxuICAgICAgICBlbmVyZ3lQYXRoLnZpc2libGUgPSAoIGZpeGVkRGlzcGxhY2VtZW50ICE9PSAwICYmIHZpc2libGUgKTtcclxuICAgICAgICBpZiAoIGVuZXJneVBhdGgudmlzaWJsZSApIHtcclxuICAgICAgICAgIGVuZXJneVBhdGguc2hhcGUgPSBuZXcgU2hhcGUoKS5tb3ZlVG8oIDAsIDAgKS5saW5lVG8oIHgsIDAgKS5saW5lVG8oIHgsIHkgKS5jbG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuaG9va2VzTGF3LnJlZ2lzdGVyKCAnRm9yY2VQbG90JywgRm9yY2VQbG90ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsU0FBU0MsSUFBSSxFQUEwQkMsSUFBSSxRQUFRLG1DQUFtQztBQUN0RixPQUFPQyxlQUFlLE1BQU0saUNBQWlDO0FBQzdELE9BQU9DLGtCQUFrQixNQUFNLG9DQUFvQztBQUNuRSxPQUFPQyxTQUFTLE1BQU0sb0JBQW9CO0FBQzFDLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyxXQUFXLE1BQThCLGtCQUFrQjtBQUVsRSxPQUFPQyxTQUFTLE1BQTRCLHVDQUF1QztBQVFuRixlQUFlLE1BQU1DLFNBQVMsU0FBU0YsV0FBVyxDQUFDO0VBRWpEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0csV0FBV0EsQ0FBRUMsTUFBYyxFQUNkQyxzQkFBOEIsRUFDOUJDLHFCQUFpRCxFQUNqREMsaUNBQTZELEVBQzdEQyxxQkFBaUQsRUFDakRDLGVBQWlDLEVBQUc7SUFFdEQsTUFBTUMsT0FB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