// Copyright 2016-2022, University of Colorado Boulder

/**
 * a Scenery Node that represent a legend that describes the different types of energy chunks
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyType from '../../common/model/EnergyType.js';
import EnergyChunkNode from '../../common/view/EnergyChunkNode.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
const chemicalString = EnergyFormsAndChangesStrings.chemical;
const electricalString = EnergyFormsAndChangesStrings.electrical;
const formsOfEnergyString = EnergyFormsAndChangesStrings.formsOfEnergy;
const lightString = EnergyFormsAndChangesStrings.light;
const mechanicalString = EnergyFormsAndChangesStrings.mechanical;
const thermalString = EnergyFormsAndChangesStrings.thermal;

// constants
const LEGEND_ENTRY_FONT = new PhetFont(14);
class EnergyChunkLegend extends Panel {
  /**
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor(modelViewTransform, options) {
    options = merge({
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
      lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
      cornerRadius: EFACConstants.ENERGY_SYMBOLS_PANEL_CORNER_RADIUS
    }, options);

    // title that appears at the top of the legend
    const titleText = new Text(formsOfEnergyString, {
      font: new PhetFont({
        size: 14,
        weight: 'bold'
      }),
      maxWidth: 130
    });

    // add an entry for each type of energy that can appear in the sim
    const content = new VBox({
      children: [titleText, EnergyChunkLegend.createEnergyChunkSymbol(mechanicalString, EnergyType.MECHANICAL, modelViewTransform), EnergyChunkLegend.createEnergyChunkSymbol(electricalString, EnergyType.ELECTRICAL, modelViewTransform), EnergyChunkLegend.createEnergyChunkSymbol(thermalString, EnergyType.THERMAL, modelViewTransform), EnergyChunkLegend.createEnergyChunkSymbol(lightString, EnergyType.LIGHT, modelViewTransform), EnergyChunkLegend.createEnergyChunkSymbol(chemicalString, EnergyType.CHEMICAL, modelViewTransform)],
      align: 'left',
      spacing: 6
    });
    super(content, options);
  }

  /**
   * helper function to create energy chunk legend entries
   * @param labelString - the label for this legend entry
   * @param energyType - the type of energy for this legend entry
   * @param modelViewTransform - needs to be passed in to create an EnergyChunk
   * @public
   */
  static createEnergyChunkSymbol(labelString, energyType, modelViewTransform) {
    const labelText = new Text(labelString, {
      font: LEGEND_ENTRY_FONT,
      maxWidth: 100
    });

    // The EnergyChunks that are created here are not going to be used in the simulation, they are only needed for the
    // EnergyChunkNodes that are displayed in the legend.
    const iconNode = new EnergyChunkNode(new EnergyChunk(energyType, Vector2.ZERO, Vector2.ZERO, new BooleanProperty(true), {
      tandem: Tandem.OPT_OUT
    }), modelViewTransform);
    return new HBox({
      children: [iconNode, labelText],
      spacing: 10
    });
  }
}
energyFormsAndChanges.register('EnergyChunkLegend', EnergyChunkLegend);
export default EnergyChunkLegend;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJWZWN0b3IyIiwibWVyZ2UiLCJQaGV0Rm9udCIsIkhCb3giLCJUZXh0IiwiVkJveCIsIlBhbmVsIiwiVGFuZGVtIiwiRUZBQ0NvbnN0YW50cyIsIkVuZXJneUNodW5rIiwiRW5lcmd5VHlwZSIsIkVuZXJneUNodW5rTm9kZSIsImVuZXJneUZvcm1zQW5kQ2hhbmdlcyIsIkVuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MiLCJjaGVtaWNhbFN0cmluZyIsImNoZW1pY2FsIiwiZWxlY3RyaWNhbFN0cmluZyIsImVsZWN0cmljYWwiLCJmb3Jtc09mRW5lcmd5U3RyaW5nIiwiZm9ybXNPZkVuZXJneSIsImxpZ2h0U3RyaW5nIiwibGlnaHQiLCJtZWNoYW5pY2FsU3RyaW5nIiwibWVjaGFuaWNhbCIsInRoZXJtYWxTdHJpbmciLCJ0aGVybWFsIiwiTEVHRU5EX0VOVFJZX0ZPTlQiLCJFbmVyZ3lDaHVua0xlZ2VuZCIsImNvbnN0cnVjdG9yIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwib3B0aW9ucyIsImZpbGwiLCJDT05UUk9MX1BBTkVMX0JBQ0tHUk9VTkRfQ09MT1IiLCJzdHJva2UiLCJDT05UUk9MX1BBTkVMX09VVExJTkVfU1RST0tFIiwibGluZVdpZHRoIiwiQ09OVFJPTF9QQU5FTF9PVVRMSU5FX0xJTkVfV0lEVEgiLCJjb3JuZXJSYWRpdXMiLCJFTkVSR1lfU1lNQk9MU19QQU5FTF9DT1JORVJfUkFESVVTIiwidGl0bGVUZXh0IiwiZm9udCIsInNpemUiLCJ3ZWlnaHQiLCJtYXhXaWR0aCIsImNvbnRlbnQiLCJjaGlsZHJlbiIsImNyZWF0ZUVuZXJneUNodW5rU3ltYm9sIiwiTUVDSEFOSUNBTCIsIkVMRUNUUklDQUwiLCJUSEVSTUFMIiwiTElHSFQiLCJDSEVNSUNBTCIsImFsaWduIiwic3BhY2luZyIsImxhYmVsU3RyaW5nIiwiZW5lcmd5VHlwZSIsImxhYmVsVGV4dCIsImljb25Ob2RlIiwiWkVSTyIsInRhbmRlbSIsIk9QVF9PVVQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVuZXJneUNodW5rTGVnZW5kLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIGEgU2NlbmVyeSBOb2RlIHRoYXQgcmVwcmVzZW50IGEgbGVnZW5kIHRoYXQgZGVzY3JpYmVzIHRoZSBkaWZmZXJlbnQgdHlwZXMgb2YgZW5lcmd5IGNodW5rc1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqIEBhdXRob3IgQW5kcmV3IEFkYXJlXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBFRkFDQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9FRkFDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEVuZXJneUNodW5rIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9FbmVyZ3lDaHVuay5qcyc7XHJcbmltcG9ydCBFbmVyZ3lUeXBlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9FbmVyZ3lUeXBlLmpzJztcclxuaW1wb3J0IEVuZXJneUNodW5rTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9FbmVyZ3lDaHVua05vZGUuanMnO1xyXG5pbXBvcnQgZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIGZyb20gJy4uLy4uL2VuZXJneUZvcm1zQW5kQ2hhbmdlcy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzIGZyb20gJy4uLy4uL0VuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MuanMnO1xyXG5cclxuY29uc3QgY2hlbWljYWxTdHJpbmcgPSBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLmNoZW1pY2FsO1xyXG5jb25zdCBlbGVjdHJpY2FsU3RyaW5nID0gRW5lcmd5Rm9ybXNBbmRDaGFuZ2VzU3RyaW5ncy5lbGVjdHJpY2FsO1xyXG5jb25zdCBmb3Jtc09mRW5lcmd5U3RyaW5nID0gRW5lcmd5Rm9ybXNBbmRDaGFuZ2VzU3RyaW5ncy5mb3Jtc09mRW5lcmd5O1xyXG5jb25zdCBsaWdodFN0cmluZyA9IEVuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MubGlnaHQ7XHJcbmNvbnN0IG1lY2hhbmljYWxTdHJpbmcgPSBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLm1lY2hhbmljYWw7XHJcbmNvbnN0IHRoZXJtYWxTdHJpbmcgPSBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLnRoZXJtYWw7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTEVHRU5EX0VOVFJZX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE0ICk7XHJcblxyXG5jbGFzcyBFbmVyZ3lDaHVua0xlZ2VuZCBleHRlbmRzIFBhbmVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsVmlld1RyYW5zZm9ybSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgZmlsbDogRUZBQ0NvbnN0YW50cy5DT05UUk9MX1BBTkVMX0JBQ0tHUk9VTkRfQ09MT1IsXHJcbiAgICAgIHN0cm9rZTogRUZBQ0NvbnN0YW50cy5DT05UUk9MX1BBTkVMX09VVExJTkVfU1RST0tFLFxyXG4gICAgICBsaW5lV2lkdGg6IEVGQUNDb25zdGFudHMuQ09OVFJPTF9QQU5FTF9PVVRMSU5FX0xJTkVfV0lEVEgsXHJcbiAgICAgIGNvcm5lclJhZGl1czogRUZBQ0NvbnN0YW50cy5FTkVSR1lfU1lNQk9MU19QQU5FTF9DT1JORVJfUkFESVVTXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gdGl0bGUgdGhhdCBhcHBlYXJzIGF0IHRoZSB0b3Agb2YgdGhlIGxlZ2VuZFxyXG4gICAgY29uc3QgdGl0bGVUZXh0ID0gbmV3IFRleHQoIGZvcm1zT2ZFbmVyZ3lTdHJpbmcsIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7XHJcbiAgICAgICAgc2l6ZTogMTQsXHJcbiAgICAgICAgd2VpZ2h0OiAnYm9sZCdcclxuICAgICAgfSApLFxyXG4gICAgICBtYXhXaWR0aDogMTMwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIGFuIGVudHJ5IGZvciBlYWNoIHR5cGUgb2YgZW5lcmd5IHRoYXQgY2FuIGFwcGVhciBpbiB0aGUgc2ltXHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IFZCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICB0aXRsZVRleHQsXHJcbiAgICAgICAgRW5lcmd5Q2h1bmtMZWdlbmQuY3JlYXRlRW5lcmd5Q2h1bmtTeW1ib2woIG1lY2hhbmljYWxTdHJpbmcsIEVuZXJneVR5cGUuTUVDSEFOSUNBTCwgbW9kZWxWaWV3VHJhbnNmb3JtICksXHJcbiAgICAgICAgRW5lcmd5Q2h1bmtMZWdlbmQuY3JlYXRlRW5lcmd5Q2h1bmtTeW1ib2woIGVsZWN0cmljYWxTdHJpbmcsIEVuZXJneVR5cGUuRUxFQ1RSSUNBTCwgbW9kZWxWaWV3VHJhbnNmb3JtICksXHJcbiAgICAgICAgRW5lcmd5Q2h1bmtMZWdlbmQuY3JlYXRlRW5lcmd5Q2h1bmtTeW1ib2woIHRoZXJtYWxTdHJpbmcsIEVuZXJneVR5cGUuVEhFUk1BTCwgbW9kZWxWaWV3VHJhbnNmb3JtICksXHJcbiAgICAgICAgRW5lcmd5Q2h1bmtMZWdlbmQuY3JlYXRlRW5lcmd5Q2h1bmtTeW1ib2woIGxpZ2h0U3RyaW5nLCBFbmVyZ3lUeXBlLkxJR0hULCBtb2RlbFZpZXdUcmFuc2Zvcm0gKSxcclxuICAgICAgICBFbmVyZ3lDaHVua0xlZ2VuZC5jcmVhdGVFbmVyZ3lDaHVua1N5bWJvbCggY2hlbWljYWxTdHJpbmcsIEVuZXJneVR5cGUuQ0hFTUlDQUwsIG1vZGVsVmlld1RyYW5zZm9ybSApXHJcbiAgICAgIF0sXHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIHNwYWNpbmc6IDZcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggY29udGVudCwgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogaGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSBlbmVyZ3kgY2h1bmsgbGVnZW5kIGVudHJpZXNcclxuICAgKiBAcGFyYW0gbGFiZWxTdHJpbmcgLSB0aGUgbGFiZWwgZm9yIHRoaXMgbGVnZW5kIGVudHJ5XHJcbiAgICogQHBhcmFtIGVuZXJneVR5cGUgLSB0aGUgdHlwZSBvZiBlbmVyZ3kgZm9yIHRoaXMgbGVnZW5kIGVudHJ5XHJcbiAgICogQHBhcmFtIG1vZGVsVmlld1RyYW5zZm9ybSAtIG5lZWRzIHRvIGJlIHBhc3NlZCBpbiB0byBjcmVhdGUgYW4gRW5lcmd5Q2h1bmtcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZUVuZXJneUNodW5rU3ltYm9sKCBsYWJlbFN0cmluZywgZW5lcmd5VHlwZSwgbW9kZWxWaWV3VHJhbnNmb3JtICkge1xyXG4gICAgY29uc3QgbGFiZWxUZXh0ID0gbmV3IFRleHQoIGxhYmVsU3RyaW5nLCB7XHJcbiAgICAgIGZvbnQ6IExFR0VORF9FTlRSWV9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogMTAwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVGhlIEVuZXJneUNodW5rcyB0aGF0IGFyZSBjcmVhdGVkIGhlcmUgYXJlIG5vdCBnb2luZyB0byBiZSB1c2VkIGluIHRoZSBzaW11bGF0aW9uLCB0aGV5IGFyZSBvbmx5IG5lZWRlZCBmb3IgdGhlXHJcbiAgICAvLyBFbmVyZ3lDaHVua05vZGVzIHRoYXQgYXJlIGRpc3BsYXllZCBpbiB0aGUgbGVnZW5kLlxyXG4gICAgY29uc3QgaWNvbk5vZGUgPSBuZXcgRW5lcmd5Q2h1bmtOb2RlKFxyXG4gICAgICBuZXcgRW5lcmd5Q2h1bmsoIGVuZXJneVR5cGUsIFZlY3RvcjIuWkVSTywgVmVjdG9yMi5aRVJPLCBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICksIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICksXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgaWNvbk5vZGUsIGxhYmVsVGV4dCBdLFxyXG4gICAgICBzcGFjaW5nOiAxMFxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzLnJlZ2lzdGVyKCAnRW5lcmd5Q2h1bmtMZWdlbmQnLCBFbmVyZ3lDaHVua0xlZ2VuZCApO1xyXG5leHBvcnQgZGVmYXVsdCBFbmVyZ3lDaHVua0xlZ2VuZDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FB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