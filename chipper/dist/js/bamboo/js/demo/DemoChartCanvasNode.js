// Copyright 2020-2022, University of Colorado Boulder

/**
 * Demonstrates a ChartCanvasNode.  One of the data sets demonstrates missing data and color mutation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import PlusMinusZoomButtonGroup from '../../../scenery-phet/js/PlusMinusZoomButtonGroup.js';
import { Color, Node, Text } from '../../../scenery/js/imports.js';
import AxisLine from '../AxisLine.js';
import bamboo from '../bamboo.js';
import CanvasLinePlot from '../CanvasLinePlot.js';
import ChartCanvasNode from '../ChartCanvasNode.js';
import ChartRectangle from '../ChartRectangle.js';
import ChartTransform from '../ChartTransform.js';
import TickLabelSet from '../TickLabelSet.js';
import TickMarkSet from '../TickMarkSet.js';
import CanvasGridLineSet from '../CanvasGridLineSet.js';
class DemoChartCanvasNode extends Node {
  constructor(emitter, options) {
    super();
    const createDataSet = (min, max, frequency, offset, delta, missingData = false) => {
      const dataSet = [];
      for (let x = min; x <= max; x += delta) {
        // Test holes in the data
        const data = missingData && Math.abs(x) < 0.1 && x < 0 ? null : new Vector2(x, Math.sin(x * frequency + offset));
        dataSet.push(data);
      }
      return dataSet;
    };
    const chartTransform = new ChartTransform({
      viewWidth: 700,
      viewHeight: 300,
      modelXRange: new Range(-Math.PI / 8, Math.PI / 8),
      modelYRange: new Range(-4 / Math.PI, 4 / Math.PI)
    });
    const chartRectangle = new ChartRectangle(chartTransform, {
      fill: 'white',
      stroke: 'black',
      cornerXRadius: 6,
      cornerYRadius: 6
    });
    const zoomLevelProperty = new NumberProperty(1, {
      range: new Range(1, 4)
    });
    const zoomButtonGroup = new PlusMinusZoomButtonGroup(zoomLevelProperty, {
      orientation: 'horizontal',
      left: chartRectangle.right + 10,
      bottom: chartRectangle.bottom
    });
    zoomLevelProperty.link(zoomLevel => {
      chartTransform.setModelXRange(zoomLevel === 1 ? new Range(-Math.PI / 8, Math.PI / 8) : zoomLevel === 2 ? new Range(-Math.PI / 4, Math.PI / 4) : zoomLevel === 3 ? new Range(-Math.PI / 3, Math.PI / 3) : new Range(-Math.PI / 2, Math.PI / 2));
    });
    const painters = [
    // Minor grid lines
    new CanvasGridLineSet(chartTransform, Orientation.HORIZONTAL, Math.PI / 32, {
      stroke: 'lightGray'
    }), new CanvasGridLineSet(chartTransform, Orientation.VERTICAL, 0.5, {
      stroke: 'lightGray'
    })];
    const colors = ['red', 'blue', 'green', 'violet', 'pink', null, 'blue'];
    const canvasLinePlots = [];
    for (let i = 0; i < colors.length; i++) {
      const d = createDataSet(-2, 2, 5 + i / 10 + dotRandom.nextDouble() / 10, dotRandom.nextDouble() * 2, 0.005, i === colors.length - 1);
      const canvasLinePlot = new CanvasLinePlot(chartTransform, d, {
        stroke: colors[i % colors.length],
        lineWidth: i
      });
      canvasLinePlots.push(canvasLinePlot);
      painters.push(canvasLinePlot);
    }

    // Anything you want clipped goes in here
    const chartCanvasNode = new ChartCanvasNode(chartTransform, painters);
    let time = 0;
    emitter.addListener(dt => {
      time += dt;
      const a = 255 * Math.sin(time * 4);
      canvasLinePlots[canvasLinePlots.length - 1].stroke = new Color(a, a / 2, a / 4);
      chartCanvasNode.update();
    });
    this.children = [
    // Background
    chartRectangle,
    // Clipped contents
    new Node({
      // TODO https://github.com/phetsims/bamboo/issues/15 what if the chart area changes, then clip needs to change
      clipArea: chartRectangle.getShape(),
      children: [
      // Some data
      chartCanvasNode]
    }),
    // Axes and labels outside the chart
    new AxisLine(chartTransform, Orientation.HORIZONTAL), new Text('x', {
      leftCenter: chartRectangle.rightCenter.plusXY(8, 0),
      fontSize: 18
    }), new AxisLine(chartTransform, Orientation.VERTICAL), new Text('y', {
      centerBottom: chartRectangle.centerTop.minusXY(0, 4),
      fontSize: 18
    }),
    // Tick marks outside the chart
    new TickMarkSet(chartTransform, Orientation.VERTICAL, 0.5, {
      edge: 'min'
    }), new TickMarkSet(chartTransform, Orientation.HORIZONTAL, Math.PI / 8, {
      edge: 'min'
    }), new TickLabelSet(chartTransform, Orientation.HORIZONTAL, Math.PI / 8, {
      edge: 'min',
      createLabel: value => new Text(Math.abs(value) < 1E-6 ? Utils.toFixed(value, 0) : Utils.toFixed(value, 2), {
        fontSize: 12
      })
    }), zoomButtonGroup];
    this.mutate(options);
  }
}
bamboo.register('DemoChartCanvasNode', DemoChartCanvasNode);
export default DemoChartCanvasNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIlJhbmdlIiwiVXRpbHMiLCJWZWN0b3IyIiwiT3JpZW50YXRpb24iLCJQbHVzTWludXNab29tQnV0dG9uR3JvdXAiLCJDb2xvciIsIk5vZGUiLCJUZXh0IiwiQXhpc0xpbmUiLCJiYW1ib28iLCJDYW52YXNMaW5lUGxvdCIsIkNoYXJ0Q2FudmFzTm9kZSIsIkNoYXJ0UmVjdGFuZ2xlIiwiQ2hhcnRUcmFuc2Zvcm0iLCJUaWNrTGFiZWxTZXQiLCJUaWNrTWFya1NldCIsIkNhbnZhc0dyaWRMaW5lU2V0IiwiRGVtb0NoYXJ0Q2FudmFzTm9kZSIsImNvbnN0cnVjdG9yIiwiZW1pdHRlciIsIm9wdGlvbnMiLCJjcmVhdGVEYXRhU2V0IiwibWluIiwibWF4IiwiZnJlcXVlbmN5Iiwib2Zmc2V0IiwiZGVsdGEiLCJtaXNzaW5nRGF0YSIsImRhdGFTZXQiLCJ4IiwiZGF0YSIsIk1hdGgiLCJhYnMiLCJzaW4iLCJwdXNoIiwiY2hhcnRUcmFuc2Zvcm0iLCJ2aWV3V2lkdGgiLCJ2aWV3SGVpZ2h0IiwibW9kZWxYUmFuZ2UiLCJQSSIsIm1vZGVsWVJhbmdlIiwiY2hhcnRSZWN0YW5nbGUiLCJmaWxsIiwic3Ryb2tlIiwiY29ybmVyWFJhZGl1cyIsImNvcm5lcllSYWRpdXMiLCJ6b29tTGV2ZWxQcm9wZXJ0eSIsInJhbmdlIiwiem9vbUJ1dHRvbkdyb3VwIiwib3JpZW50YXRpb24iLCJsZWZ0IiwicmlnaHQiLCJib3R0b20iLCJsaW5rIiwiem9vbUxldmVsIiwic2V0TW9kZWxYUmFuZ2UiLCJwYWludGVycyIsIkhPUklaT05UQUwiLCJWRVJUSUNBTCIsImNvbG9ycyIsImNhbnZhc0xpbmVQbG90cyIsImkiLCJsZW5ndGgiLCJkIiwibmV4dERvdWJsZSIsImNhbnZhc0xpbmVQbG90IiwibGluZVdpZHRoIiwiY2hhcnRDYW52YXNOb2RlIiwidGltZSIsImFkZExpc3RlbmVyIiwiZHQiLCJhIiwidXBkYXRlIiwiY2hpbGRyZW4iLCJjbGlwQXJlYSIsImdldFNoYXBlIiwibGVmdENlbnRlciIsInJpZ2h0Q2VudGVyIiwicGx1c1hZIiwiZm9udFNpemUiLCJjZW50ZXJCb3R0b20iLCJjZW50ZXJUb3AiLCJtaW51c1hZIiwiZWRnZSIsImNyZWF0ZUxhYmVsIiwidmFsdWUiLCJ0b0ZpeGVkIiwibXV0YXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEZW1vQ2hhcnRDYW52YXNOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERlbW9uc3RyYXRlcyBhIENoYXJ0Q2FudmFzTm9kZS4gIE9uZSBvZiB0aGUgZGF0YSBzZXRzIGRlbW9uc3RyYXRlcyBtaXNzaW5nIGRhdGEgYW5kIGNvbG9yIG11dGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBPcmllbnRhdGlvbiBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvT3JpZW50YXRpb24uanMnO1xyXG5pbXBvcnQgUGx1c01pbnVzWm9vbUJ1dHRvbkdyb3VwIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QbHVzTWludXNab29tQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgTm9kZSwgTm9kZU9wdGlvbnMsIFRleHQgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQXhpc0xpbmUgZnJvbSAnLi4vQXhpc0xpbmUuanMnO1xyXG5pbXBvcnQgYmFtYm9vIGZyb20gJy4uL2JhbWJvby5qcyc7XHJcbmltcG9ydCBDYW52YXNMaW5lUGxvdCBmcm9tICcuLi9DYW52YXNMaW5lUGxvdC5qcyc7XHJcbmltcG9ydCBDaGFydENhbnZhc05vZGUgZnJvbSAnLi4vQ2hhcnRDYW52YXNOb2RlLmpzJztcclxuaW1wb3J0IENoYXJ0UmVjdGFuZ2xlIGZyb20gJy4uL0NoYXJ0UmVjdGFuZ2xlLmpzJztcclxuaW1wb3J0IENoYXJ0VHJhbnNmb3JtIGZyb20gJy4uL0NoYXJ0VHJhbnNmb3JtLmpzJztcclxuaW1wb3J0IFRpY2tMYWJlbFNldCBmcm9tICcuLi9UaWNrTGFiZWxTZXQuanMnO1xyXG5pbXBvcnQgVGlja01hcmtTZXQgZnJvbSAnLi4vVGlja01hcmtTZXQuanMnO1xyXG5pbXBvcnQgQ2FudmFzR3JpZExpbmVTZXQgZnJvbSAnLi4vQ2FudmFzR3JpZExpbmVTZXQuanMnO1xyXG5pbXBvcnQgQ2FudmFzUGFpbnRlciBmcm9tICcuLi9DYW52YXNQYWludGVyLmpzJztcclxuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xyXG5cclxuY2xhc3MgRGVtb0NoYXJ0Q2FudmFzTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGVtaXR0ZXI6IFRFbWl0dGVyPFsgbnVtYmVyIF0+LCBvcHRpb25zPzogTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICBjb25zdCBjcmVhdGVEYXRhU2V0ID0gKCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIsIGZyZXF1ZW5jeTogbnVtYmVyLCBvZmZzZXQ6IG51bWJlciwgZGVsdGE6IG51bWJlciwgbWlzc2luZ0RhdGEgPSBmYWxzZSApID0+IHtcclxuICAgICAgY29uc3QgZGF0YVNldCA9IFtdO1xyXG4gICAgICBmb3IgKCBsZXQgeCA9IG1pbjsgeCA8PSBtYXg7IHggKz0gZGVsdGEgKSB7XHJcblxyXG4gICAgICAgIC8vIFRlc3QgaG9sZXMgaW4gdGhlIGRhdGFcclxuICAgICAgICBjb25zdCBkYXRhID0gKCBtaXNzaW5nRGF0YSAmJiBNYXRoLmFicyggeCApIDwgMC4xICYmIHggPCAwICkgPyBudWxsIDpcclxuICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcjIoIHgsIE1hdGguc2luKCB4ICogZnJlcXVlbmN5ICsgb2Zmc2V0ICkgKTtcclxuICAgICAgICBkYXRhU2V0LnB1c2goIGRhdGEgKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZGF0YVNldDtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgY2hhcnRUcmFuc2Zvcm0gPSBuZXcgQ2hhcnRUcmFuc2Zvcm0oIHtcclxuICAgICAgdmlld1dpZHRoOiA3MDAsXHJcbiAgICAgIHZpZXdIZWlnaHQ6IDMwMCxcclxuICAgICAgbW9kZWxYUmFuZ2U6IG5ldyBSYW5nZSggLU1hdGguUEkgLyA4LCBNYXRoLlBJIC8gOCApLFxyXG4gICAgICBtb2RlbFlSYW5nZTogbmV3IFJhbmdlKCAtNCAvIE1hdGguUEksIDQgLyBNYXRoLlBJIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjaGFydFJlY3RhbmdsZSA9IG5ldyBDaGFydFJlY3RhbmdsZSggY2hhcnRUcmFuc2Zvcm0sIHtcclxuICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBjb3JuZXJYUmFkaXVzOiA2LFxyXG4gICAgICBjb3JuZXJZUmFkaXVzOiA2XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgem9vbUxldmVsUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDEsIHsgcmFuZ2U6IG5ldyBSYW5nZSggMSwgNCApIH0gKTtcclxuXHJcbiAgICBjb25zdCB6b29tQnV0dG9uR3JvdXAgPSBuZXcgUGx1c01pbnVzWm9vbUJ1dHRvbkdyb3VwKCB6b29tTGV2ZWxQcm9wZXJ0eSwge1xyXG4gICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxyXG4gICAgICBsZWZ0OiBjaGFydFJlY3RhbmdsZS5yaWdodCArIDEwLFxyXG4gICAgICBib3R0b206IGNoYXJ0UmVjdGFuZ2xlLmJvdHRvbVxyXG4gICAgfSApO1xyXG4gICAgem9vbUxldmVsUHJvcGVydHkubGluayggem9vbUxldmVsID0+IHtcclxuICAgICAgY2hhcnRUcmFuc2Zvcm0uc2V0TW9kZWxYUmFuZ2UoIHpvb21MZXZlbCA9PT0gMSA/IG5ldyBSYW5nZSggLU1hdGguUEkgLyA4LCBNYXRoLlBJIC8gOCApIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHpvb21MZXZlbCA9PT0gMiA/IG5ldyBSYW5nZSggLU1hdGguUEkgLyA0LCBNYXRoLlBJIC8gNCApIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHpvb21MZXZlbCA9PT0gMyA/IG5ldyBSYW5nZSggLU1hdGguUEkgLyAzLCBNYXRoLlBJIC8gMyApIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBSYW5nZSggLU1hdGguUEkgLyAyLCBNYXRoLlBJIC8gMiApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcGFpbnRlcnM6IENhbnZhc1BhaW50ZXJbXSA9IFtcclxuXHJcbiAgICAgIC8vIE1pbm9yIGdyaWQgbGluZXNcclxuICAgICAgbmV3IENhbnZhc0dyaWRMaW5lU2V0KCBjaGFydFRyYW5zZm9ybSwgT3JpZW50YXRpb24uSE9SSVpPTlRBTCwgTWF0aC5QSSAvIDMyLCB7IHN0cm9rZTogJ2xpZ2h0R3JheScgfSApLFxyXG4gICAgICBuZXcgQ2FudmFzR3JpZExpbmVTZXQoIGNoYXJ0VHJhbnNmb3JtLCBPcmllbnRhdGlvbi5WRVJUSUNBTCwgMC41LCB7IHN0cm9rZTogJ2xpZ2h0R3JheScgfSApXHJcbiAgICBdO1xyXG4gICAgY29uc3QgY29sb3JzID0gWyAncmVkJywgJ2JsdWUnLCAnZ3JlZW4nLCAndmlvbGV0JywgJ3BpbmsnLCBudWxsLCAnYmx1ZScgXTtcclxuXHJcbiAgICBjb25zdCBjYW52YXNMaW5lUGxvdHM6IENhbnZhc0xpbmVQbG90W10gPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNvbG9ycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgZCA9IGNyZWF0ZURhdGFTZXQoIC0yLCAyLCA1ICsgaSAvIDEwICsgZG90UmFuZG9tLm5leHREb3VibGUoKSAvIDEwLCBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogMiwgMC4wMDUsIGkgPT09IGNvbG9ycy5sZW5ndGggLSAxICk7XHJcbiAgICAgIGNvbnN0IGNhbnZhc0xpbmVQbG90ID0gbmV3IENhbnZhc0xpbmVQbG90KCBjaGFydFRyYW5zZm9ybSwgZCwge1xyXG4gICAgICAgIHN0cm9rZTogY29sb3JzWyBpICUgY29sb3JzLmxlbmd0aCBdISxcclxuICAgICAgICBsaW5lV2lkdGg6IGlcclxuICAgICAgfSApO1xyXG4gICAgICBjYW52YXNMaW5lUGxvdHMucHVzaCggY2FudmFzTGluZVBsb3QgKTtcclxuICAgICAgcGFpbnRlcnMucHVzaCggY2FudmFzTGluZVBsb3QgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBbnl0aGluZyB5b3Ugd2FudCBjbGlwcGVkIGdvZXMgaW4gaGVyZVxyXG4gICAgY29uc3QgY2hhcnRDYW52YXNOb2RlID0gbmV3IENoYXJ0Q2FudmFzTm9kZSggY2hhcnRUcmFuc2Zvcm0sIHBhaW50ZXJzICk7XHJcblxyXG4gICAgbGV0IHRpbWUgPSAwO1xyXG4gICAgZW1pdHRlci5hZGRMaXN0ZW5lciggZHQgPT4ge1xyXG4gICAgICB0aW1lICs9IGR0O1xyXG4gICAgICBjb25zdCBhID0gMjU1ICogTWF0aC5zaW4oIHRpbWUgKiA0ICk7XHJcbiAgICAgIGNhbnZhc0xpbmVQbG90c1sgY2FudmFzTGluZVBsb3RzLmxlbmd0aCAtIDEgXS5zdHJva2UgPSBuZXcgQ29sb3IoIGEsIGEgLyAyLCBhIC8gNCApO1xyXG4gICAgICBjaGFydENhbnZhc05vZGUudXBkYXRlKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5jaGlsZHJlbiA9IFtcclxuXHJcbiAgICAgIC8vIEJhY2tncm91bmRcclxuICAgICAgY2hhcnRSZWN0YW5nbGUsXHJcblxyXG4gICAgICAvLyBDbGlwcGVkIGNvbnRlbnRzXHJcbiAgICAgIG5ldyBOb2RlKCB7XHJcbiAgICAgICAgLy8gVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYmFtYm9vL2lzc3Vlcy8xNSB3aGF0IGlmIHRoZSBjaGFydCBhcmVhIGNoYW5nZXMsIHRoZW4gY2xpcCBuZWVkcyB0byBjaGFuZ2VcclxuICAgICAgICBjbGlwQXJlYTogY2hhcnRSZWN0YW5nbGUuZ2V0U2hhcGUoKSxcclxuICAgICAgICBjaGlsZHJlbjogW1xyXG5cclxuICAgICAgICAgIC8vIFNvbWUgZGF0YVxyXG4gICAgICAgICAgY2hhcnRDYW52YXNOb2RlXHJcbiAgICAgICAgXVxyXG4gICAgICB9ICksXHJcblxyXG4gICAgICAvLyBBeGVzIGFuZCBsYWJlbHMgb3V0c2lkZSB0aGUgY2hhcnRcclxuICAgICAgbmV3IEF4aXNMaW5lKCBjaGFydFRyYW5zZm9ybSwgT3JpZW50YXRpb24uSE9SSVpPTlRBTCApLFxyXG4gICAgICBuZXcgVGV4dCggJ3gnLCB7IGxlZnRDZW50ZXI6IGNoYXJ0UmVjdGFuZ2xlLnJpZ2h0Q2VudGVyLnBsdXNYWSggOCwgMCApLCBmb250U2l6ZTogMTggfSApLFxyXG4gICAgICBuZXcgQXhpc0xpbmUoIGNoYXJ0VHJhbnNmb3JtLCBPcmllbnRhdGlvbi5WRVJUSUNBTCApLFxyXG4gICAgICBuZXcgVGV4dCggJ3knLCB7IGNlbnRlckJvdHRvbTogY2hhcnRSZWN0YW5nbGUuY2VudGVyVG9wLm1pbnVzWFkoIDAsIDQgKSwgZm9udFNpemU6IDE4IH0gKSxcclxuXHJcbiAgICAgIC8vIFRpY2sgbWFya3Mgb3V0c2lkZSB0aGUgY2hhcnRcclxuICAgICAgbmV3IFRpY2tNYXJrU2V0KCBjaGFydFRyYW5zZm9ybSwgT3JpZW50YXRpb24uVkVSVElDQUwsIDAuNSwgeyBlZGdlOiAnbWluJyB9ICksXHJcbiAgICAgIG5ldyBUaWNrTWFya1NldCggY2hhcnRUcmFuc2Zvcm0sIE9yaWVudGF0aW9uLkhPUklaT05UQUwsIE1hdGguUEkgLyA4LCB7IGVkZ2U6ICdtaW4nIH0gKSxcclxuICAgICAgbmV3IFRpY2tMYWJlbFNldCggY2hhcnRUcmFuc2Zvcm0sIE9yaWVudGF0aW9uLkhPUklaT05UQUwsIE1hdGguUEkgLyA4LCB7XHJcbiAgICAgICAgZWRnZTogJ21pbicsXHJcbiAgICAgICAgY3JlYXRlTGFiZWw6ICggdmFsdWU6IG51bWJlciApID0+IG5ldyBUZXh0KCBNYXRoLmFicyggdmFsdWUgKSA8IDFFLTYgPyBVdGlscy50b0ZpeGVkKCB2YWx1ZSwgMCApIDogVXRpbHMudG9GaXhlZCggdmFsdWUsIDIgKSwge1xyXG4gICAgICAgICAgZm9udFNpemU6IDEyXHJcbiAgICAgICAgfSApXHJcbiAgICAgIH0gKSxcclxuXHJcbiAgICAgIHpvb21CdXR0b25Hcm91cFxyXG4gICAgXTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuYmFtYm9vLnJlZ2lzdGVyKCAnRGVtb0NoYXJ0Q2FudmFzTm9kZScsIERlbW9DaGFydENhbnZhc05vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgRGVtb0NoYXJ0Q2FudmFzTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLG9DQUFvQztBQUMvRCxPQUFPQyxTQUFTLE1BQU0sOEJBQThC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