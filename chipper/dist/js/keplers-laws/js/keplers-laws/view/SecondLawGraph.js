// Copyright 2023, University of Colorado Boulder

/**
 * Panel that shows the graph of the swept area under the curve of the orbit.
 *
 * @author Agustín Vallejo
 */

import { Color, Node, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import SolarSystemCommonConstants from '../../../../solar-system-common/js/SolarSystemCommonConstants.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import SolarSystemCommonColors from '../../../../solar-system-common/js/SolarSystemCommonColors.js';
import KeplersLawsStrings from '../../../../keplers-laws/js/KeplersLawsStrings.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import ChartRectangle from '../../../../bamboo/js/ChartRectangle.js';
import BarPlot from '../../../../bamboo/js/BarPlot.js';
import TickLabelSet from '../../../../bamboo/js/TickLabelSet.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import TickMarkSet from '../../../../bamboo/js/TickMarkSet.js';
import keplersLaws from '../../keplersLaws.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Utils from '../../../../dot/js/Utils.js';
import KeplersLawsConstants from '../../KeplersLawsConstants.js';
const xAxisLength = 180;
const yAxisLength = 180;
const FOREGROUND_COLOR_PROPERTY = SolarSystemCommonColors.foregroundProperty;

// How much bigger is the top of the graph compared to the total area
const UPSCALE = 1.3;
const TITLE_OPTIONS = {
  font: SolarSystemCommonConstants.TITLE_FONT,
  fill: FOREGROUND_COLOR_PROPERTY
};
export default class SecondLawGraph extends AccordionBox {
  constructor(model) {
    const options = combineOptions({
      visibleProperty: model.isSecondLawProperty,
      titleNode: new Text(KeplersLawsStrings.sweptAreaStringProperty, TITLE_OPTIONS),
      titleYMargin: 4
    }, SolarSystemCommonConstants.CONTROL_PANEL_OPTIONS);
    const xAxis = new ArrowNode(0, 0, xAxisLength, 0, {
      fill: FOREGROUND_COLOR_PROPERTY,
      stroke: FOREGROUND_COLOR_PROPERTY,
      tailWidth: 1
    });
    const yAxis = new ArrowNode(0, 0, 0, -yAxisLength * 1.05, {
      fill: FOREGROUND_COLOR_PROPERTY,
      stroke: FOREGROUND_COLOR_PROPERTY,
      tailWidth: 1
    });
    const barPlot = new AreasBarPlot(model);
    barPlot.y = -yAxisLength;
    const xAxisLabel = new Text(KeplersLawsStrings.area.periodDivisionStringProperty, TITLE_OPTIONS);
    const yAxisLabel = new RichText(KeplersLawsStrings.area.areaUnitsStringProperty, combineOptions({
      x: -25,
      centerY: -yAxisLength * 0.5,
      rotation: -Math.PI / 2
    }, SolarSystemCommonConstants.TITLE_OPTIONS));
    super(new VBox({
      spacing: 10,
      children: [new Node({
        children: [barPlot, xAxis, yAxis, yAxisLabel]
      }), xAxisLabel]
    }), options);
    this.model = model;
    this.expandedProperty.value = false;
  }
}
class AreasBarPlot extends Node {
  constructor(model) {
    super();

    // -1 is so that the first bar is not inside the Y axis
    this.model = model;
    let modelXRange = new Range(-1, 6);
    let modelYRange = new Range(0, 1);

    // one data point for each integer point in the model, y values interpolated along the x range from min to max
    let dataSet = [];
    const chartTransform = new ChartTransform({
      viewWidth: xAxisLength,
      viewHeight: yAxisLength,
      modelXRange: modelXRange,
      modelYRange: modelYRange
    });
    const chartRectangle = new ChartRectangle(chartTransform);
    const barPlot = new BarPlot(chartTransform, dataSet);
    const orbitChangedListener = () => {
      const activeAreas = model.engine.orbitalAreas.filter(area => area.active);
      dataSet = [];

      // First forEach is for updating the dataset, which will create the rectangles
      // Second forEach is for updating the color of the rectangles
      activeAreas.forEach((area, index) => {
        // Setting all the bar's height and pushing them to the dataSet
        const height = area.alreadyEntered && !area.insideProperty.value ? model.engine.segmentArea : area.sweptArea;
        const realIndex = this.model.engine.retrograde ? this.model.periodDivisionProperty.value - index - 1 : index;
        dataSet.push(new Vector2(realIndex, height));
      });
      barPlot.setDataSet(dataSet); // BarPlot creates the rectangles here

      activeAreas.forEach((area, index) => {
        // Setting the color of the bar
        const alpha = area.insideProperty.value ? 1 : area.completion;
        const paintableFields = {
          fill: new Color('fuchsia').setAlpha(alpha)
        };
        barPlot.rectangles[index].mutate(paintableFields);
      });
    };

    // x Labels of each area bar
    const XTickLabelSet = new TickLabelSet(chartTransform, Orientation.HORIZONTAL, 1, {
      edge: 'min'
    });

    // y tick marks
    const YSpacing = 1e4;
    const entries = [{
      scale: 0.001
    }, {
      scale: 0.01
    }, {
      scale: 0.1
    }, {
      scale: 1
    }, {
      scale: 10
    }, {
      scale: 100
    }, {
      scale: 1000
    }];
    const yTickMarkSets = entries.map(entry => new LimitedTickMarkSet(chartTransform, Orientation.VERTICAL, YSpacing * entry.scale, {
      edge: 'min',
      stroke: FOREGROUND_COLOR_PROPERTY,
      // The tickmarks get a little smaller as you zoom out
      extent: 13 - 2 * Math.log10(entry.scale)
    }));
    const tickParentNode = new Node();
    const updateYRange = () => {
      modelYRange = new Range(0, UPSCALE * this.model.engine.totalArea / 2);
      chartTransform.setModelYRange(modelYRange);
      const children = [];
      yTickMarkSets.forEach((tickMarkSet, index) => {
        const distanceBetweenTickMarks = tickMarkSet.spacing / modelYRange.max;

        // Within this range we apply a linear function for the transparency
        const UPPER = 0.09;
        const LOWER = 0.016;
        if (distanceBetweenTickMarks < UPPER && distanceBetweenTickMarks > LOWER) {
          const linear = Utils.linear(UPPER, LOWER, 1, 0, distanceBetweenTickMarks);
          tickMarkSet.opacity = linear;
          children.push(tickMarkSet);
        } else if (distanceBetweenTickMarks > UPPER) {
          tickMarkSet.opacity = 1;
          children.push(tickMarkSet);
        }
      });
      if (!shallowCompare(tickParentNode.children, children)) {
        tickParentNode.children = children;
      }
    };

    // Linking the period division to modify the chart ranges and labels
    this.model.periodDivisionProperty.link(periodDivision => {
      modelXRange = new Range(-1, periodDivision);
      chartTransform.setModelXRange(modelXRange);
      barPlot.barWidth = 15 * (KeplersLawsConstants.MAX_ORBITAL_DIVISIONS / periodDivision);
      barPlot.update();
      XTickLabelSet.setCreateLabel(value => {
        return value >= 0 && value < periodDivision ? new Text((value + 1).toString(), TITLE_OPTIONS) : null;
      });
      // updateYRange();
    });

    updateYRange();

    // anything you want clipped goes in here
    const chartClip = new Node({
      clipArea: chartRectangle.getShape(),
      children: [barPlot]
    });
    this.children = [chartRectangle, chartClip, XTickLabelSet, tickParentNode];
    model.engine.changedEmitter.addListener(() => {
      orbitChangedListener();
      updateYRange();
    });
  }
}
class LimitedTickMarkSet extends TickMarkSet {
  constructor(chartTransform, axisOrientation, spacing, providedOptions) {
    super(chartTransform, axisOrientation, spacing, providedOptions);
    this.spacing = spacing;
  }
  update() {
    const [nMin, nMax] = this.chartTransform.getSpacingBorders(this.axisOrientation, this.spacing, this.origin, this.clippingType);
    if (nMax - nMin < 100) {
      super.update();
    }
  }
}
function shallowCompare(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}
keplersLaws.register('SecondLawGraph', SecondLawGraph);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2xvciIsIk5vZGUiLCJSaWNoVGV4dCIsIlRleHQiLCJWQm94IiwiU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMiLCJjb21iaW5lT3B0aW9ucyIsIkFycm93Tm9kZSIsIlNvbGFyU3lzdGVtQ29tbW9uQ29sb3JzIiwiS2VwbGVyc0xhd3NTdHJpbmdzIiwiUmFuZ2UiLCJWZWN0b3IyIiwiQ2hhcnRUcmFuc2Zvcm0iLCJDaGFydFJlY3RhbmdsZSIsIkJhclBsb3QiLCJUaWNrTGFiZWxTZXQiLCJPcmllbnRhdGlvbiIsIlRpY2tNYXJrU2V0Iiwia2VwbGVyc0xhd3MiLCJBY2NvcmRpb25Cb3giLCJVdGlscyIsIktlcGxlcnNMYXdzQ29uc3RhbnRzIiwieEF4aXNMZW5ndGgiLCJ5QXhpc0xlbmd0aCIsIkZPUkVHUk9VTkRfQ09MT1JfUFJPUEVSVFkiLCJmb3JlZ3JvdW5kUHJvcGVydHkiLCJVUFNDQUxFIiwiVElUTEVfT1BUSU9OUyIsImZvbnQiLCJUSVRMRV9GT05UIiwiZmlsbCIsIlNlY29uZExhd0dyYXBoIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsIm9wdGlvbnMiLCJ2aXNpYmxlUHJvcGVydHkiLCJpc1NlY29uZExhd1Byb3BlcnR5IiwidGl0bGVOb2RlIiwic3dlcHRBcmVhU3RyaW5nUHJvcGVydHkiLCJ0aXRsZVlNYXJnaW4iLCJDT05UUk9MX1BBTkVMX09QVElPTlMiLCJ4QXhpcyIsInN0cm9rZSIsInRhaWxXaWR0aCIsInlBeGlzIiwiYmFyUGxvdCIsIkFyZWFzQmFyUGxvdCIsInkiLCJ4QXhpc0xhYmVsIiwiYXJlYSIsInBlcmlvZERpdmlzaW9uU3RyaW5nUHJvcGVydHkiLCJ5QXhpc0xhYmVsIiwiYXJlYVVuaXRzU3RyaW5nUHJvcGVydHkiLCJ4IiwiY2VudGVyWSIsInJvdGF0aW9uIiwiTWF0aCIsIlBJIiwic3BhY2luZyIsImNoaWxkcmVuIiwiZXhwYW5kZWRQcm9wZXJ0eSIsInZhbHVlIiwibW9kZWxYUmFuZ2UiLCJtb2RlbFlSYW5nZSIsImRhdGFTZXQiLCJjaGFydFRyYW5zZm9ybSIsInZpZXdXaWR0aCIsInZpZXdIZWlnaHQiLCJjaGFydFJlY3RhbmdsZSIsIm9yYml0Q2hhbmdlZExpc3RlbmVyIiwiYWN0aXZlQXJlYXMiLCJlbmdpbmUiLCJvcmJpdGFsQXJlYXMiLCJmaWx0ZXIiLCJhY3RpdmUiLCJmb3JFYWNoIiwiaW5kZXgiLCJoZWlnaHQiLCJhbHJlYWR5RW50ZXJlZCIsImluc2lkZVByb3BlcnR5Iiwic2VnbWVudEFyZWEiLCJzd2VwdEFyZWEiLCJyZWFsSW5kZXgiLCJyZXRyb2dyYWRlIiwicGVyaW9kRGl2aXNpb25Qcm9wZXJ0eSIsInB1c2giLCJzZXREYXRhU2V0IiwiYWxwaGEiLCJjb21wbGV0aW9uIiwicGFpbnRhYmxlRmllbGRzIiwic2V0QWxwaGEiLCJyZWN0YW5nbGVzIiwibXV0YXRlIiwiWFRpY2tMYWJlbFNldCIsIkhPUklaT05UQUwiLCJlZGdlIiwiWVNwYWNpbmciLCJlbnRyaWVzIiwic2NhbGUiLCJ5VGlja01hcmtTZXRzIiwibWFwIiwiZW50cnkiLCJMaW1pdGVkVGlja01hcmtTZXQiLCJWRVJUSUNBTCIsImV4dGVudCIsImxvZzEwIiwidGlja1BhcmVudE5vZGUiLCJ1cGRhdGVZUmFuZ2UiLCJ0b3RhbEFyZWEiLCJzZXRNb2RlbFlSYW5nZSIsInRpY2tNYXJrU2V0IiwiZGlzdGFuY2VCZXR3ZWVuVGlja01hcmtzIiwibWF4IiwiVVBQRVIiLCJMT1dFUiIsImxpbmVhciIsIm9wYWNpdHkiLCJzaGFsbG93Q29tcGFyZSIsImxpbmsiLCJwZXJpb2REaXZpc2lvbiIsInNldE1vZGVsWFJhbmdlIiwiYmFyV2lkdGgiLCJNQVhfT1JCSVRBTF9ESVZJU0lPTlMiLCJ1cGRhdGUiLCJzZXRDcmVhdGVMYWJlbCIsInRvU3RyaW5nIiwiY2hhcnRDbGlwIiwiY2xpcEFyZWEiLCJnZXRTaGFwZSIsImNoYW5nZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJheGlzT3JpZW50YXRpb24iLCJwcm92aWRlZE9wdGlvbnMiLCJuTWluIiwibk1heCIsImdldFNwYWNpbmdCb3JkZXJzIiwib3JpZ2luIiwiY2xpcHBpbmdUeXBlIiwiYXJyMSIsImFycjIiLCJsZW5ndGgiLCJpIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTZWNvbmRMYXdHcmFwaC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUGFuZWwgdGhhdCBzaG93cyB0aGUgZ3JhcGggb2YgdGhlIHN3ZXB0IGFyZWEgdW5kZXIgdGhlIGN1cnZlIG9mIHRoZSBvcmJpdC5cclxuICpcclxuICogQGF1dGhvciBBZ3VzdMOtbiBWYWxsZWpvXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgQ29sb3IsIE5vZGUsIFBhaW50YWJsZU9wdGlvbnMsIFJpY2hUZXh0LCBSaWNoVGV4dE9wdGlvbnMsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMgZnJvbSAnLi4vLi4vLi4vLi4vc29sYXItc3lzdGVtLWNvbW1vbi9qcy9Tb2xhclN5c3RlbUNvbW1vbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCBLZXBsZXJzTGF3c01vZGVsIGZyb20gJy4uL21vZGVsL0tlcGxlcnNMYXdzTW9kZWwuanMnO1xyXG5pbXBvcnQgU29sYXJTeXN0ZW1Db21tb25Db2xvcnMgZnJvbSAnLi4vLi4vLi4vLi4vc29sYXItc3lzdGVtLWNvbW1vbi9qcy9Tb2xhclN5c3RlbUNvbW1vbkNvbG9ycy5qcyc7XHJcbmltcG9ydCBLZXBsZXJzTGF3c1N0cmluZ3MgZnJvbSAnLi4vLi4vLi4vLi4va2VwbGVycy1sYXdzL2pzL0tlcGxlcnNMYXdzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBDaGFydFRyYW5zZm9ybSBmcm9tICcuLi8uLi8uLi8uLi9iYW1ib28vanMvQ2hhcnRUcmFuc2Zvcm0uanMnO1xyXG5pbXBvcnQgQ2hhcnRSZWN0YW5nbGUgZnJvbSAnLi4vLi4vLi4vLi4vYmFtYm9vL2pzL0NoYXJ0UmVjdGFuZ2xlLmpzJztcclxuaW1wb3J0IEJhclBsb3QgZnJvbSAnLi4vLi4vLi4vLi4vYmFtYm9vL2pzL0JhclBsb3QuanMnO1xyXG5pbXBvcnQgVGlja0xhYmVsU2V0IGZyb20gJy4uLy4uLy4uLy4uL2JhbWJvby9qcy9UaWNrTGFiZWxTZXQuanMnO1xyXG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcclxuaW1wb3J0IFRpY2tNYXJrU2V0LCB7IFRpY2tNYXJrU2V0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL2JhbWJvby9qcy9UaWNrTWFya1NldC5qcyc7XHJcbmltcG9ydCBrZXBsZXJzTGF3cyBmcm9tICcuLi8uLi9rZXBsZXJzTGF3cy5qcyc7XHJcbmltcG9ydCBBY2NvcmRpb25Cb3gsIHsgQWNjb3JkaW9uQm94T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IEtlcGxlcnNMYXdzQ29uc3RhbnRzIGZyb20gJy4uLy4uL0tlcGxlcnNMYXdzQ29uc3RhbnRzLmpzJztcclxuXHJcbmNvbnN0IHhBeGlzTGVuZ3RoID0gMTgwO1xyXG5jb25zdCB5QXhpc0xlbmd0aCA9IDE4MDtcclxuXHJcbmNvbnN0IEZPUkVHUk9VTkRfQ09MT1JfUFJPUEVSVFkgPSBTb2xhclN5c3RlbUNvbW1vbkNvbG9ycy5mb3JlZ3JvdW5kUHJvcGVydHk7XHJcblxyXG4vLyBIb3cgbXVjaCBiaWdnZXIgaXMgdGhlIHRvcCBvZiB0aGUgZ3JhcGggY29tcGFyZWQgdG8gdGhlIHRvdGFsIGFyZWFcclxuY29uc3QgVVBTQ0FMRSA9IDEuMztcclxuXHJcbmNvbnN0IFRJVExFX09QVElPTlMgPSB7XHJcbiAgZm9udDogU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuVElUTEVfRk9OVCxcclxuICBmaWxsOiBGT1JFR1JPVU5EX0NPTE9SX1BST1BFUlRZXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWNvbmRMYXdHcmFwaCBleHRlbmRzIEFjY29yZGlvbkJveCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHVibGljIHJlYWRvbmx5IG1vZGVsOiBLZXBsZXJzTGF3c01vZGVsICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxBY2NvcmRpb25Cb3hPcHRpb25zPigge1xyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IG1vZGVsLmlzU2Vjb25kTGF3UHJvcGVydHksXHJcbiAgICAgIHRpdGxlTm9kZTogbmV3IFRleHQoIEtlcGxlcnNMYXdzU3RyaW5ncy5zd2VwdEFyZWFTdHJpbmdQcm9wZXJ0eSwgVElUTEVfT1BUSU9OUyApLFxyXG4gICAgICB0aXRsZVlNYXJnaW46IDRcclxuICAgIH0sIFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLkNPTlRST0xfUEFORUxfT1BUSU9OUyApO1xyXG5cclxuICAgIGNvbnN0IHhBeGlzID0gbmV3IEFycm93Tm9kZSggMCwgMCwgeEF4aXNMZW5ndGgsIDAsIHtcclxuICAgICAgZmlsbDogRk9SRUdST1VORF9DT0xPUl9QUk9QRVJUWSxcclxuICAgICAgc3Ryb2tlOiBGT1JFR1JPVU5EX0NPTE9SX1BST1BFUlRZLFxyXG4gICAgICB0YWlsV2lkdGg6IDFcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHlBeGlzID0gbmV3IEFycm93Tm9kZSggMCwgMCwgMCwgLXlBeGlzTGVuZ3RoICogMS4wNSwge1xyXG4gICAgICBmaWxsOiBGT1JFR1JPVU5EX0NPTE9SX1BST1BFUlRZLFxyXG4gICAgICBzdHJva2U6IEZPUkVHUk9VTkRfQ09MT1JfUFJPUEVSVFksXHJcbiAgICAgIHRhaWxXaWR0aDogMVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGJhclBsb3QgPSBuZXcgQXJlYXNCYXJQbG90KCBtb2RlbCApO1xyXG4gICAgYmFyUGxvdC55ID0gLXlBeGlzTGVuZ3RoO1xyXG5cclxuICAgIGNvbnN0IHhBeGlzTGFiZWwgPSBuZXcgVGV4dCggS2VwbGVyc0xhd3NTdHJpbmdzLmFyZWEucGVyaW9kRGl2aXNpb25TdHJpbmdQcm9wZXJ0eSwgVElUTEVfT1BUSU9OUyApO1xyXG4gICAgY29uc3QgeUF4aXNMYWJlbCA9IG5ldyBSaWNoVGV4dChcclxuICAgICAgS2VwbGVyc0xhd3NTdHJpbmdzLmFyZWEuYXJlYVVuaXRzU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPFJpY2hUZXh0T3B0aW9ucz4oIHtcclxuICAgICAgICB4OiAtMjUsXHJcbiAgICAgICAgY2VudGVyWTogLXlBeGlzTGVuZ3RoICogMC41LFxyXG4gICAgICAgIHJvdGF0aW9uOiAtTWF0aC5QSSAvIDJcclxuICAgICAgfSwgU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuVElUTEVfT1BUSU9OUyApXHJcbiAgICApO1xyXG5cclxuICAgIHN1cGVyKCBuZXcgVkJveCgge1xyXG4gICAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICBuZXcgTm9kZSgge1xyXG4gICAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICAgIGJhclBsb3QsXHJcbiAgICAgICAgICAgICAgeEF4aXMsXHJcbiAgICAgICAgICAgICAgeUF4aXMsXHJcbiAgICAgICAgICAgICAgeUF4aXNMYWJlbFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9ICksXHJcbiAgICAgICAgICB4QXhpc0xhYmVsXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICApLCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5leHBhbmRlZFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBBcmVhc0JhclBsb3QgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwdWJsaWMgbW9kZWw6IEtlcGxlcnNMYXdzTW9kZWwgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIC0xIGlzIHNvIHRoYXQgdGhlIGZpcnN0IGJhciBpcyBub3QgaW5zaWRlIHRoZSBZIGF4aXNcclxuICAgIGxldCBtb2RlbFhSYW5nZSA9IG5ldyBSYW5nZSggLTEsIDYgKTtcclxuICAgIGxldCBtb2RlbFlSYW5nZSA9IG5ldyBSYW5nZSggMCwgMSApO1xyXG5cclxuICAgIC8vIG9uZSBkYXRhIHBvaW50IGZvciBlYWNoIGludGVnZXIgcG9pbnQgaW4gdGhlIG1vZGVsLCB5IHZhbHVlcyBpbnRlcnBvbGF0ZWQgYWxvbmcgdGhlIHggcmFuZ2UgZnJvbSBtaW4gdG8gbWF4XHJcbiAgICBsZXQgZGF0YVNldDogVmVjdG9yMltdID0gW107XHJcblxyXG4gICAgY29uc3QgY2hhcnRUcmFuc2Zvcm0gPSBuZXcgQ2hhcnRUcmFuc2Zvcm0oIHtcclxuICAgICAgdmlld1dpZHRoOiB4QXhpc0xlbmd0aCxcclxuICAgICAgdmlld0hlaWdodDogeUF4aXNMZW5ndGgsXHJcbiAgICAgIG1vZGVsWFJhbmdlOiBtb2RlbFhSYW5nZSxcclxuICAgICAgbW9kZWxZUmFuZ2U6IG1vZGVsWVJhbmdlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY2hhcnRSZWN0YW5nbGUgPSBuZXcgQ2hhcnRSZWN0YW5nbGUoIGNoYXJ0VHJhbnNmb3JtICk7XHJcblxyXG4gICAgY29uc3QgYmFyUGxvdCA9IG5ldyBCYXJQbG90KCBjaGFydFRyYW5zZm9ybSwgZGF0YVNldCApO1xyXG5cclxuICAgIGNvbnN0IG9yYml0Q2hhbmdlZExpc3RlbmVyID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBhY3RpdmVBcmVhcyA9IG1vZGVsLmVuZ2luZS5vcmJpdGFsQXJlYXMuZmlsdGVyKCBhcmVhID0+IGFyZWEuYWN0aXZlICk7XHJcbiAgICAgIGRhdGFTZXQgPSBbXTtcclxuXHJcbiAgICAgIC8vIEZpcnN0IGZvckVhY2ggaXMgZm9yIHVwZGF0aW5nIHRoZSBkYXRhc2V0LCB3aGljaCB3aWxsIGNyZWF0ZSB0aGUgcmVjdGFuZ2xlc1xyXG4gICAgICAvLyBTZWNvbmQgZm9yRWFjaCBpcyBmb3IgdXBkYXRpbmcgdGhlIGNvbG9yIG9mIHRoZSByZWN0YW5nbGVzXHJcbiAgICAgIGFjdGl2ZUFyZWFzLmZvckVhY2goICggYXJlYSwgaW5kZXggKSA9PiB7XHJcbiAgICAgICAgLy8gU2V0dGluZyBhbGwgdGhlIGJhcidzIGhlaWdodCBhbmQgcHVzaGluZyB0aGVtIHRvIHRoZSBkYXRhU2V0XHJcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gYXJlYS5hbHJlYWR5RW50ZXJlZCAmJiAhYXJlYS5pbnNpZGVQcm9wZXJ0eS52YWx1ZSA/IG1vZGVsLmVuZ2luZS5zZWdtZW50QXJlYSA6IGFyZWEuc3dlcHRBcmVhO1xyXG4gICAgICAgIGNvbnN0IHJlYWxJbmRleCA9IHRoaXMubW9kZWwuZW5naW5lLnJldHJvZ3JhZGUgPyB0aGlzLm1vZGVsLnBlcmlvZERpdmlzaW9uUHJvcGVydHkudmFsdWUgLSBpbmRleCAtIDEgOiBpbmRleDtcclxuICAgICAgICBkYXRhU2V0LnB1c2goIG5ldyBWZWN0b3IyKCByZWFsSW5kZXgsIGhlaWdodCApICk7XHJcbiAgICAgIH0gKTtcclxuICAgICAgYmFyUGxvdC5zZXREYXRhU2V0KCBkYXRhU2V0ICk7IC8vIEJhclBsb3QgY3JlYXRlcyB0aGUgcmVjdGFuZ2xlcyBoZXJlXHJcblxyXG4gICAgICBhY3RpdmVBcmVhcy5mb3JFYWNoKCAoIGFyZWEsIGluZGV4ICkgPT4ge1xyXG4gICAgICAgIC8vIFNldHRpbmcgdGhlIGNvbG9yIG9mIHRoZSBiYXJcclxuICAgICAgICBjb25zdCBhbHBoYSA9IGFyZWEuaW5zaWRlUHJvcGVydHkudmFsdWUgPyAxIDogYXJlYS5jb21wbGV0aW9uO1xyXG4gICAgICAgIGNvbnN0IHBhaW50YWJsZUZpZWxkczogUGFpbnRhYmxlT3B0aW9ucyA9IHtcclxuICAgICAgICAgIGZpbGw6IG5ldyBDb2xvciggJ2Z1Y2hzaWEnICkuc2V0QWxwaGEoIGFscGhhIClcclxuICAgICAgICB9O1xyXG4gICAgICAgIGJhclBsb3QucmVjdGFuZ2xlc1sgaW5kZXggXS5tdXRhdGUoIHBhaW50YWJsZUZpZWxkcyApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIHggTGFiZWxzIG9mIGVhY2ggYXJlYSBiYXJcclxuICAgIGNvbnN0IFhUaWNrTGFiZWxTZXQgPSBuZXcgVGlja0xhYmVsU2V0KCBjaGFydFRyYW5zZm9ybSwgT3JpZW50YXRpb24uSE9SSVpPTlRBTCwgMSwge1xyXG4gICAgICBlZGdlOiAnbWluJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHkgdGljayBtYXJrc1xyXG4gICAgY29uc3QgWVNwYWNpbmcgPSAxZTQ7XHJcblxyXG4gICAgY29uc3QgZW50cmllcyA9IFtcclxuICAgICAgeyBzY2FsZTogMC4wMDEgfSxcclxuICAgICAgeyBzY2FsZTogMC4wMSB9LFxyXG4gICAgICB7IHNjYWxlOiAwLjEgfSxcclxuICAgICAgeyBzY2FsZTogMSB9LFxyXG4gICAgICB7IHNjYWxlOiAxMCB9LFxyXG4gICAgICB7IHNjYWxlOiAxMDAgfSxcclxuICAgICAgeyBzY2FsZTogMTAwMCB9IF07XHJcbiAgICBjb25zdCB5VGlja01hcmtTZXRzID0gZW50cmllcy5tYXAoIGVudHJ5ID0+XHJcbiAgICAgIG5ldyBMaW1pdGVkVGlja01hcmtTZXQoIGNoYXJ0VHJhbnNmb3JtLCBPcmllbnRhdGlvbi5WRVJUSUNBTCwgWVNwYWNpbmcgKiBlbnRyeS5zY2FsZSwge1xyXG4gICAgICAgIGVkZ2U6ICdtaW4nLFxyXG4gICAgICAgIHN0cm9rZTogRk9SRUdST1VORF9DT0xPUl9QUk9QRVJUWSxcclxuICAgICAgICAvLyBUaGUgdGlja21hcmtzIGdldCBhIGxpdHRsZSBzbWFsbGVyIGFzIHlvdSB6b29tIG91dFxyXG4gICAgICAgIGV4dGVudDogMTMgLSAyICogTWF0aC5sb2cxMCggZW50cnkuc2NhbGUgKVxyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICBjb25zdCB0aWNrUGFyZW50Tm9kZSA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgY29uc3QgdXBkYXRlWVJhbmdlID0gKCkgPT4ge1xyXG4gICAgICBtb2RlbFlSYW5nZSA9IG5ldyBSYW5nZSggMCwgVVBTQ0FMRSAqIHRoaXMubW9kZWwuZW5naW5lLnRvdGFsQXJlYSAvIDIgKTtcclxuICAgICAgY2hhcnRUcmFuc2Zvcm0uc2V0TW9kZWxZUmFuZ2UoIG1vZGVsWVJhbmdlICk7XHJcblxyXG4gICAgICBjb25zdCBjaGlsZHJlbjogVGlja01hcmtTZXRbXSA9IFtdO1xyXG4gICAgICB5VGlja01hcmtTZXRzLmZvckVhY2goICggdGlja01hcmtTZXQsIGluZGV4ICkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRpc3RhbmNlQmV0d2VlblRpY2tNYXJrcyA9IHRpY2tNYXJrU2V0LnNwYWNpbmcgLyBtb2RlbFlSYW5nZS5tYXg7XHJcblxyXG4gICAgICAgIC8vIFdpdGhpbiB0aGlzIHJhbmdlIHdlIGFwcGx5IGEgbGluZWFyIGZ1bmN0aW9uIGZvciB0aGUgdHJhbnNwYXJlbmN5XHJcbiAgICAgICAgY29uc3QgVVBQRVIgPSAwLjA5O1xyXG4gICAgICAgIGNvbnN0IExPV0VSID0gMC4wMTY7XHJcbiAgICAgICAgaWYgKCBkaXN0YW5jZUJldHdlZW5UaWNrTWFya3MgPCBVUFBFUiAmJiBkaXN0YW5jZUJldHdlZW5UaWNrTWFya3MgPiBMT1dFUiApIHtcclxuICAgICAgICAgIGNvbnN0IGxpbmVhciA9IFV0aWxzLmxpbmVhciggVVBQRVIsIExPV0VSLCAxLCAwLCBkaXN0YW5jZUJldHdlZW5UaWNrTWFya3MgKTtcclxuICAgICAgICAgIHRpY2tNYXJrU2V0Lm9wYWNpdHkgPSBsaW5lYXI7XHJcbiAgICAgICAgICBjaGlsZHJlbi5wdXNoKCB0aWNrTWFya1NldCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggZGlzdGFuY2VCZXR3ZWVuVGlja01hcmtzID4gVVBQRVIgKSB7XHJcbiAgICAgICAgICB0aWNrTWFya1NldC5vcGFjaXR5ID0gMTtcclxuICAgICAgICAgIGNoaWxkcmVuLnB1c2goIHRpY2tNYXJrU2V0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICAgIGlmICggIXNoYWxsb3dDb21wYXJlKCB0aWNrUGFyZW50Tm9kZS5jaGlsZHJlbiwgY2hpbGRyZW4gKSApIHtcclxuICAgICAgICB0aWNrUGFyZW50Tm9kZS5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIExpbmtpbmcgdGhlIHBlcmlvZCBkaXZpc2lvbiB0byBtb2RpZnkgdGhlIGNoYXJ0IHJhbmdlcyBhbmQgbGFiZWxzXHJcbiAgICB0aGlzLm1vZGVsLnBlcmlvZERpdmlzaW9uUHJvcGVydHkubGluayggcGVyaW9kRGl2aXNpb24gPT4ge1xyXG4gICAgICBtb2RlbFhSYW5nZSA9IG5ldyBSYW5nZSggLTEsIHBlcmlvZERpdmlzaW9uICk7XHJcbiAgICAgIGNoYXJ0VHJhbnNmb3JtLnNldE1vZGVsWFJhbmdlKCBtb2RlbFhSYW5nZSApO1xyXG4gICAgICBiYXJQbG90LmJhcldpZHRoID0gMTUgKiAoIEtlcGxlcnNMYXdzQ29uc3RhbnRzLk1BWF9PUkJJVEFMX0RJVklTSU9OUyAvIHBlcmlvZERpdmlzaW9uICk7XHJcbiAgICAgIGJhclBsb3QudXBkYXRlKCk7XHJcbiAgICAgIFhUaWNrTGFiZWxTZXQuc2V0Q3JlYXRlTGFiZWwoICggdmFsdWU6IG51bWJlciApID0+IHtcclxuICAgICAgICByZXR1cm4gKCB2YWx1ZSA+PSAwICYmIHZhbHVlIDwgcGVyaW9kRGl2aXNpb24gKSA/XHJcbiAgICAgICAgICAgICAgIG5ldyBUZXh0KCAoIHZhbHVlICsgMSApLnRvU3RyaW5nKCksIFRJVExFX09QVElPTlMgKSA6IG51bGw7XHJcbiAgICAgIH0gKTtcclxuICAgICAgLy8gdXBkYXRlWVJhbmdlKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdXBkYXRlWVJhbmdlKCk7XHJcblxyXG4gICAgLy8gYW55dGhpbmcgeW91IHdhbnQgY2xpcHBlZCBnb2VzIGluIGhlcmVcclxuICAgIGNvbnN0IGNoYXJ0Q2xpcCA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNsaXBBcmVhOiBjaGFydFJlY3RhbmdsZS5nZXRTaGFwZSgpLFxyXG4gICAgICBjaGlsZHJlbjogWyBiYXJQbG90IF1cclxuICAgIH0gKTtcclxuXHJcblxyXG4gICAgdGhpcy5jaGlsZHJlbiA9IFtcclxuICAgICAgY2hhcnRSZWN0YW5nbGUsXHJcbiAgICAgIGNoYXJ0Q2xpcCxcclxuICAgICAgWFRpY2tMYWJlbFNldCxcclxuICAgICAgdGlja1BhcmVudE5vZGVcclxuICAgIF07XHJcblxyXG4gICAgbW9kZWwuZW5naW5lLmNoYW5nZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIG9yYml0Q2hhbmdlZExpc3RlbmVyKCk7XHJcbiAgICAgIHVwZGF0ZVlSYW5nZSgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgTGltaXRlZFRpY2tNYXJrU2V0IGV4dGVuZHMgVGlja01hcmtTZXQge1xyXG4gIHB1YmxpYyBvdmVycmlkZSBzcGFjaW5nOiBudW1iZXI7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY2hhcnRUcmFuc2Zvcm06IENoYXJ0VHJhbnNmb3JtLCBheGlzT3JpZW50YXRpb246IE9yaWVudGF0aW9uLCBzcGFjaW5nOiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBUaWNrTWFya1NldE9wdGlvbnMgKSB7XHJcbiAgICBzdXBlciggY2hhcnRUcmFuc2Zvcm0sIGF4aXNPcmllbnRhdGlvbiwgc3BhY2luZywgcHJvdmlkZWRPcHRpb25zICk7XHJcbiAgICB0aGlzLnNwYWNpbmcgPSBzcGFjaW5nO1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIHVwZGF0ZSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IFsgbk1pbiwgbk1heCBdID0gdGhpcy5jaGFydFRyYW5zZm9ybS5nZXRTcGFjaW5nQm9yZGVycyggdGhpcy5heGlzT3JpZW50YXRpb24sIHRoaXMuc3BhY2luZywgdGhpcy5vcmlnaW4sIHRoaXMuY2xpcHBpbmdUeXBlICk7XHJcblxyXG4gICAgaWYgKCBuTWF4IC0gbk1pbiA8IDEwMCApIHtcclxuICAgICAgc3VwZXIudXBkYXRlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzaGFsbG93Q29tcGFyZSggYXJyMTogTm9kZVtdLCBhcnIyOiBOb2RlW10gKTogYm9vbGVhbiB7XHJcbiAgaWYgKCBhcnIxLmxlbmd0aCAhPT0gYXJyMi5sZW5ndGggKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhcnIxLmxlbmd0aDsgaSsrICkge1xyXG4gICAgaWYgKCBhcnIxWyBpIF0gIT09IGFycjJbIGkgXSApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbmtlcGxlcnNMYXdzLnJlZ2lzdGVyKCAnU2Vjb25kTGF3R3JhcGgnLCBTZWNvbmRM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