// Copyright 2020-2023, University of Colorado Boulder

/**
 * Demonstrates multiple types of plots.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import Transform1 from '../../../dot/js/Transform1.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import { DragListener, HBox, Node, Text, VBox } from '../../../scenery/js/imports.js';
import VerticalAquaRadioButtonGroup from '../../../sun/js/VerticalAquaRadioButtonGroup.js';
import BarPlot from '../BarPlot.js';
import ChartTransform from '../ChartTransform.js';
import ChartRectangle from '../ChartRectangle.js';
import GridLineSet from '../GridLineSet.js';
import TickLabelSet from '../TickLabelSet.js';
import LinePlot from '../LinePlot.js';
import ScatterPlot from '../ScatterPlot.js';
import TickMarkSet from '../TickMarkSet.js';
import bamboo from '../bamboo.js';
class DemoMultiplePlots extends VBox {
  constructor(options) {
    const dataSet = [];
    for (let x = 2; x < 10; x += 0.1) {
      dataSet.push(new Vector2(x, Math.exp(x) + dotRandom.nextDouble() * 1000));
    }
    const chartTransform = new ChartTransform({
      viewWidth: 600,
      viewHeight: 400,
      modelXRange: new Range(2, 10),
      modelXRangeInverted: true,
      modelYRange: new Range(1, 22000)
      // yTransform is set in link() below
    });

    const chartRectangle = new ChartRectangle(chartTransform, {
      fill: 'white',
      stroke: 'black',
      cornerXRadius: 6,
      cornerYRadius: 6
    });

    // Anything you want clipped goes in here
    const chartClip = new Node({
      clipArea: chartRectangle.getShape(),
      children: [
      // Major grid lines
      new GridLineSet(chartTransform, Orientation.HORIZONTAL, 2, {
        stroke: 'darkGray',
        clippingType: 'strict'
      }), new GridLineSet(chartTransform, Orientation.VERTICAL, 5000, {
        stroke: 'darkGray',
        clippingType: 'strict'
      }),
      // Some data
      new BarPlot(chartTransform, dataSet, {
        opacity: 0.1,
        // So that log plot doesn't compute Math.log(0) = -Infinity
        barTailValue: 1E-8
      }), new LinePlot(chartTransform, dataSet, {
        stroke: 'red',
        lineWidth: 2
      }), new ScatterPlot(chartTransform, dataSet, {
        fill: 'blue',
        radius: 3
      })]
    });
    const chartNode = new Node({
      children: [
      // Background
      chartRectangle,
      // Clipped contents
      chartClip,
      // Tick marks outside the chart
      new TickMarkSet(chartTransform, Orientation.HORIZONTAL, 2, {
        edge: 'min'
      }), new TickLabelSet(chartTransform, Orientation.HORIZONTAL, 2, {
        edge: 'min'
      }), new TickMarkSet(chartTransform, Orientation.VERTICAL, 5000, {
        edge: 'min'
      }), new TickLabelSet(chartTransform, Orientation.VERTICAL, 5000, {
        edge: 'min'
      })]
    });
    const linear = new Transform1(x => x, x => x);
    const transformProperty = new Property(linear);
    const controls = new VerticalAquaRadioButtonGroup(transformProperty, [{
      createNode: tandem => new Text('linear', {
        fontSize: 14
      }),
      value: linear
    }, {
      createNode: tandem => new Text('log', {
        fontSize: 14
      }),
      value: new Transform1(Math.log, Math.exp, {
        range: new Range(0, Number.POSITIVE_INFINITY),
        domain: new Range(0, Number.POSITIVE_INFINITY)
      })
    }]);
    transformProperty.link(type => chartTransform.setYTransform(type));
    const readout = new Text('Press/Drag to show point', {
      fontSize: 30,
      fill: 'black'
    });
    const update = event => {
      const point = event.pointer.point;
      const parentPoint = chartRectangle.globalToParentPoint(point);
      const constrainedParentPoint = new Bounds2(0, 0, chartTransform.viewWidth, chartTransform.viewHeight).closestPointTo(parentPoint);
      const modelPt = chartTransform.viewToModelPosition(constrainedParentPoint);
      readout.string = `x: ${Utils.toFixed(modelPt.x, 1)}, y: ${Utils.toFixed(modelPt.y, 1)}`;
    };
    chartRectangle.addInputListener(new DragListener({
      press: update,
      drag: update
    }));

    // Controls
    super({
      resize: false,
      spacing: 20,
      children: [chartNode, new HBox({
        spacing: 100,
        children: [controls, readout]
      })]
    });
    this.mutate(options);
  }
}
bamboo.register('DemoMultiplePlots', DemoMultiplePlots);
export default DemoMultiplePlots;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkJvdW5kczIiLCJkb3RSYW5kb20iLCJSYW5nZSIsIlV0aWxzIiwiVHJhbnNmb3JtMSIsIlZlY3RvcjIiLCJPcmllbnRhdGlvbiIsIkRyYWdMaXN0ZW5lciIsIkhCb3giLCJOb2RlIiwiVGV4dCIsIlZCb3giLCJWZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwIiwiQmFyUGxvdCIsIkNoYXJ0VHJhbnNmb3JtIiwiQ2hhcnRSZWN0YW5nbGUiLCJHcmlkTGluZVNldCIsIlRpY2tMYWJlbFNldCIsIkxpbmVQbG90IiwiU2NhdHRlclBsb3QiLCJUaWNrTWFya1NldCIsImJhbWJvbyIsIkRlbW9NdWx0aXBsZVBsb3RzIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiZGF0YVNldCIsIngiLCJwdXNoIiwiTWF0aCIsImV4cCIsIm5leHREb3VibGUiLCJjaGFydFRyYW5zZm9ybSIsInZpZXdXaWR0aCIsInZpZXdIZWlnaHQiLCJtb2RlbFhSYW5nZSIsIm1vZGVsWFJhbmdlSW52ZXJ0ZWQiLCJtb2RlbFlSYW5nZSIsImNoYXJ0UmVjdGFuZ2xlIiwiZmlsbCIsInN0cm9rZSIsImNvcm5lclhSYWRpdXMiLCJjb3JuZXJZUmFkaXVzIiwiY2hhcnRDbGlwIiwiY2xpcEFyZWEiLCJnZXRTaGFwZSIsImNoaWxkcmVuIiwiSE9SSVpPTlRBTCIsImNsaXBwaW5nVHlwZSIsIlZFUlRJQ0FMIiwib3BhY2l0eSIsImJhclRhaWxWYWx1ZSIsImxpbmVXaWR0aCIsInJhZGl1cyIsImNoYXJ0Tm9kZSIsImVkZ2UiLCJsaW5lYXIiLCJ0cmFuc2Zvcm1Qcm9wZXJ0eSIsImNvbnRyb2xzIiwiY3JlYXRlTm9kZSIsInRhbmRlbSIsImZvbnRTaXplIiwidmFsdWUiLCJsb2ciLCJyYW5nZSIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwiZG9tYWluIiwibGluayIsInR5cGUiLCJzZXRZVHJhbnNmb3JtIiwicmVhZG91dCIsInVwZGF0ZSIsImV2ZW50IiwicG9pbnQiLCJwb2ludGVyIiwicGFyZW50UG9pbnQiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwiY29uc3RyYWluZWRQYXJlbnRQb2ludCIsImNsb3Nlc3RQb2ludFRvIiwibW9kZWxQdCIsInZpZXdUb01vZGVsUG9zaXRpb24iLCJzdHJpbmciLCJ0b0ZpeGVkIiwieSIsImFkZElucHV0TGlzdGVuZXIiLCJwcmVzcyIsImRyYWciLCJyZXNpemUiLCJzcGFjaW5nIiwibXV0YXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEZW1vTXVsdGlwbGVQbG90cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEZW1vbnN0cmF0ZXMgbXVsdGlwbGUgdHlwZXMgb2YgcGxvdHMuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFRyYW5zZm9ybTEgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1RyYW5zZm9ybTEuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBPcmllbnRhdGlvbiBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvT3JpZW50YXRpb24uanMnO1xyXG5pbXBvcnQgeyBEcmFnTGlzdGVuZXIsIEhCb3gsIE5vZGUsIFNjZW5lcnlFdmVudCwgVGV4dCwgVkJveCwgVkJveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVmVydGljYWxBcXVhUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi8uLi9zdW4vanMvVmVydGljYWxBcXVhUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBCYXJQbG90IGZyb20gJy4uL0JhclBsb3QuanMnO1xyXG5pbXBvcnQgQ2hhcnRUcmFuc2Zvcm0gZnJvbSAnLi4vQ2hhcnRUcmFuc2Zvcm0uanMnO1xyXG5pbXBvcnQgQ2hhcnRSZWN0YW5nbGUgZnJvbSAnLi4vQ2hhcnRSZWN0YW5nbGUuanMnO1xyXG5pbXBvcnQgR3JpZExpbmVTZXQgZnJvbSAnLi4vR3JpZExpbmVTZXQuanMnO1xyXG5pbXBvcnQgVGlja0xhYmVsU2V0IGZyb20gJy4uL1RpY2tMYWJlbFNldC5qcyc7XHJcbmltcG9ydCBMaW5lUGxvdCBmcm9tICcuLi9MaW5lUGxvdC5qcyc7XHJcbmltcG9ydCBTY2F0dGVyUGxvdCBmcm9tICcuLi9TY2F0dGVyUGxvdC5qcyc7XHJcbmltcG9ydCBUaWNrTWFya1NldCBmcm9tICcuLi9UaWNrTWFya1NldC5qcyc7XHJcbmltcG9ydCBiYW1ib28gZnJvbSAnLi4vYmFtYm9vLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuXHJcbmNsYXNzIERlbW9NdWx0aXBsZVBsb3RzIGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9ucz86IFZCb3hPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IGRhdGFTZXQgPSBbXTtcclxuICAgIGZvciAoIGxldCB4ID0gMjsgeCA8IDEwOyB4ICs9IDAuMSApIHtcclxuICAgICAgZGF0YVNldC5wdXNoKCBuZXcgVmVjdG9yMiggeCwgTWF0aC5leHAoIHggKSArIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgKiAxMDAwICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjaGFydFRyYW5zZm9ybSA9IG5ldyBDaGFydFRyYW5zZm9ybSgge1xyXG4gICAgICB2aWV3V2lkdGg6IDYwMCxcclxuICAgICAgdmlld0hlaWdodDogNDAwLFxyXG4gICAgICBtb2RlbFhSYW5nZTogbmV3IFJhbmdlKCAyLCAxMCApLFxyXG4gICAgICBtb2RlbFhSYW5nZUludmVydGVkOiB0cnVlLFxyXG4gICAgICBtb2RlbFlSYW5nZTogbmV3IFJhbmdlKCAxLCAyMjAwMCApXHJcbiAgICAgIC8vIHlUcmFuc2Zvcm0gaXMgc2V0IGluIGxpbmsoKSBiZWxvd1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGNoYXJ0UmVjdGFuZ2xlID0gbmV3IENoYXJ0UmVjdGFuZ2xlKCBjaGFydFRyYW5zZm9ybSwge1xyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGNvcm5lclhSYWRpdXM6IDYsXHJcbiAgICAgIGNvcm5lcllSYWRpdXM6IDZcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBbnl0aGluZyB5b3Ugd2FudCBjbGlwcGVkIGdvZXMgaW4gaGVyZVxyXG4gICAgY29uc3QgY2hhcnRDbGlwID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2xpcEFyZWE6IGNoYXJ0UmVjdGFuZ2xlLmdldFNoYXBlKCksXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcblxyXG4gICAgICAgIC8vIE1ham9yIGdyaWQgbGluZXNcclxuICAgICAgICBuZXcgR3JpZExpbmVTZXQoIGNoYXJ0VHJhbnNmb3JtLCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMLCAyLCB7IHN0cm9rZTogJ2RhcmtHcmF5JywgY2xpcHBpbmdUeXBlOiAnc3RyaWN0JyB9ICksXHJcbiAgICAgICAgbmV3IEdyaWRMaW5lU2V0KCBjaGFydFRyYW5zZm9ybSwgT3JpZW50YXRpb24uVkVSVElDQUwsIDUwMDAsIHsgc3Ryb2tlOiAnZGFya0dyYXknLCBjbGlwcGluZ1R5cGU6ICdzdHJpY3QnIH0gKSxcclxuXHJcbiAgICAgICAgLy8gU29tZSBkYXRhXHJcbiAgICAgICAgbmV3IEJhclBsb3QoIGNoYXJ0VHJhbnNmb3JtLCBkYXRhU2V0LCB7XHJcbiAgICAgICAgICBvcGFjaXR5OiAwLjEsXHJcblxyXG4gICAgICAgICAgLy8gU28gdGhhdCBsb2cgcGxvdCBkb2Vzbid0IGNvbXB1dGUgTWF0aC5sb2coMCkgPSAtSW5maW5pdHlcclxuICAgICAgICAgIGJhclRhaWxWYWx1ZTogMUUtOFxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICBuZXcgTGluZVBsb3QoIGNoYXJ0VHJhbnNmb3JtLCBkYXRhU2V0LCB7XHJcbiAgICAgICAgICBzdHJva2U6ICdyZWQnLFxyXG4gICAgICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIG5ldyBTY2F0dGVyUGxvdCggY2hhcnRUcmFuc2Zvcm0sIGRhdGFTZXQsIHtcclxuICAgICAgICAgIGZpbGw6ICdibHVlJyxcclxuICAgICAgICAgIHJhZGl1czogM1xyXG4gICAgICAgIH0gKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY2hhcnROb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuXHJcbiAgICAgICAgLy8gQmFja2dyb3VuZFxyXG4gICAgICAgIGNoYXJ0UmVjdGFuZ2xlLFxyXG5cclxuICAgICAgICAvLyBDbGlwcGVkIGNvbnRlbnRzXHJcbiAgICAgICAgY2hhcnRDbGlwLFxyXG5cclxuICAgICAgICAvLyBUaWNrIG1hcmtzIG91dHNpZGUgdGhlIGNoYXJ0XHJcbiAgICAgICAgbmV3IFRpY2tNYXJrU2V0KCBjaGFydFRyYW5zZm9ybSwgT3JpZW50YXRpb24uSE9SSVpPTlRBTCwgMiwgeyBlZGdlOiAnbWluJyB9ICksXHJcbiAgICAgICAgbmV3IFRpY2tMYWJlbFNldCggY2hhcnRUcmFuc2Zvcm0sIE9yaWVudGF0aW9uLkhPUklaT05UQUwsIDIsIHsgZWRnZTogJ21pbicgfSApLFxyXG5cclxuICAgICAgICBuZXcgVGlja01hcmtTZXQoIGNoYXJ0VHJhbnNmb3JtLCBPcmllbnRhdGlvbi5WRVJUSUNBTCwgNTAwMCwgeyBlZGdlOiAnbWluJyB9ICksXHJcbiAgICAgICAgbmV3IFRpY2tMYWJlbFNldCggY2hhcnRUcmFuc2Zvcm0sIE9yaWVudGF0aW9uLlZFUlRJQ0FMLCA1MDAwLCB7IGVkZ2U6ICdtaW4nIH0gKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbGluZWFyID0gbmV3IFRyYW5zZm9ybTEoIHggPT4geCwgeCA9PiB4ICk7XHJcbiAgICBjb25zdCB0cmFuc2Zvcm1Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbGluZWFyICk7XHJcbiAgICBjb25zdCBjb250cm9scyA9IG5ldyBWZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwKCB0cmFuc2Zvcm1Qcm9wZXJ0eSwgW1xyXG4gICAgICB7IGNyZWF0ZU5vZGU6ICggdGFuZGVtOiBUYW5kZW0gKSA9PiBuZXcgVGV4dCggJ2xpbmVhcicsIHsgZm9udFNpemU6IDE0IH0gKSwgdmFsdWU6IGxpbmVhciB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgY3JlYXRlTm9kZTogKCB0YW5kZW06IFRhbmRlbSApID0+IG5ldyBUZXh0KCAnbG9nJywgeyBmb250U2l6ZTogMTQgfSApLCB2YWx1ZTogbmV3IFRyYW5zZm9ybTEoIE1hdGgubG9nLCBNYXRoLmV4cCwge1xyXG4gICAgICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZICksXHJcbiAgICAgICAgICBkb21haW46IG5ldyBSYW5nZSggMCwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIClcclxuICAgICAgICB9IClcclxuICAgICAgfVxyXG4gICAgXSApO1xyXG4gICAgdHJhbnNmb3JtUHJvcGVydHkubGluayggdHlwZSA9PiBjaGFydFRyYW5zZm9ybS5zZXRZVHJhbnNmb3JtKCB0eXBlICkgKTtcclxuXHJcbiAgICBjb25zdCByZWFkb3V0ID0gbmV3IFRleHQoICdQcmVzcy9EcmFnIHRvIHNob3cgcG9pbnQnLCB7XHJcbiAgICAgIGZvbnRTaXplOiAzMCxcclxuICAgICAgZmlsbDogJ2JsYWNrJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHVwZGF0ZSA9ICggZXZlbnQ6IFNjZW5lcnlFdmVudCApID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IHBvaW50ID0gZXZlbnQucG9pbnRlci5wb2ludDtcclxuICAgICAgY29uc3QgcGFyZW50UG9pbnQgPSBjaGFydFJlY3RhbmdsZS5nbG9iYWxUb1BhcmVudFBvaW50KCBwb2ludCApO1xyXG4gICAgICBjb25zdCBjb25zdHJhaW5lZFBhcmVudFBvaW50ID0gbmV3IEJvdW5kczIoIDAsIDAsIGNoYXJ0VHJhbnNmb3JtLnZpZXdXaWR0aCwgY2hhcnRUcmFuc2Zvcm0udmlld0hlaWdodCApLmNsb3Nlc3RQb2ludFRvKCBwYXJlbnRQb2ludCApO1xyXG4gICAgICBjb25zdCBtb2RlbFB0ID0gY2hhcnRUcmFuc2Zvcm0udmlld1RvTW9kZWxQb3NpdGlvbiggY29uc3RyYWluZWRQYXJlbnRQb2ludCApO1xyXG5cclxuICAgICAgcmVhZG91dC5zdHJpbmcgPSBgeDogJHtVdGlscy50b0ZpeGVkKCBtb2RlbFB0LngsIDEgKX0sIHk6ICR7VXRpbHMudG9GaXhlZCggbW9kZWxQdC55LCAxICl9YDtcclxuICAgIH07XHJcbiAgICBjaGFydFJlY3RhbmdsZS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIHByZXNzOiB1cGRhdGUsXHJcbiAgICAgIGRyYWc6IHVwZGF0ZVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gQ29udHJvbHNcclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHJlc2l6ZTogZmFsc2UsXHJcbiAgICAgIHNwYWNpbmc6IDIwLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIGNoYXJ0Tm9kZSxcclxuICAgICAgICBuZXcgSEJveCggeyBzcGFjaW5nOiAxMDAsIGNoaWxkcmVuOiBbIGNvbnRyb2xzLCByZWFkb3V0IF0gfSApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuYmFtYm9vLnJlZ2lzdGVyKCAnRGVtb011bHRpcGxlUGxvdHMnLCBEZW1vTXVsdGlwbGVQbG90cyApO1xyXG5leHBvcnQgZGVmYXVsdCBEZW1vTXVsdGlwbGVQbG90czsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLDhCQUE4QjtBQUNuRCxPQUFPQyxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLFNBQVMsTUFBTSw4QkFBOEI7QUFDcEQsT0FBT0MsS0FBSyxNQUFNLDBCQUEwQjtBQUM1QyxPQUFPQyxLQUFLLE1BQU0sMEJBQTBCO0FBQzVDLE9BQU9DLFVBQVUsTUFBTSwrQkFBK0I7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxXQUFXLE1BQU0sc0NBQXNDO0FBQzlELFNBQVNDLFlBQVksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQWdCQyxJQUFJLEVBQUVDLElBQUksUUFBcUIsZ0NBQWdDO0FBQ2hILE9BQU9DLDRCQUE0QixNQUFNLGlEQUFpRDtBQUMxRixPQUFPQyxPQUFPLE1BQU0sZUFBZTtBQUNuQyxPQUFPQyxjQUFjLE1BQU0sc0JBQXNCO0FBQ2pELE9BQU9DLGNBQWMsTUFBTSxzQkFBc0I7QUFDakQsT0FBT0MsV0FBVyxNQUFNLG1CQUFtQjtBQUMzQyxPQUFPQyxZQUFZLE1BQU0sb0JBQW9CO0FBQzdDLE9BQU9DLFFBQVEsTUFBTSxnQkFBZ0I7QUFDckMsT0FBT0MsV0FBVyxNQUFNLG1CQUFtQjtBQUMzQyxPQUFPQyxXQUFXLE1BQU0s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