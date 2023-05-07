// Copyright 2022, University of Colorado Boulder

/**
 * Demo for RulerNode
 */

import RulerNode from '../../RulerNode.js';
export default function demoRulerNode(layoutBounds) {
  const rulerLength = 500;
  const majorTickWidth = 50;
  const majorTickLabels = [];
  const numberOfTicks = Math.floor(rulerLength / majorTickWidth) + 1;
  for (let i = 0; i < numberOfTicks; i++) {
    majorTickLabels[i] = `${i * majorTickWidth}`;
  }
  return new RulerNode(rulerLength, 0.15 * rulerLength, majorTickWidth, majorTickLabels, 'm', {
    insetsWidth: 25,
    minorTicksPerMajorTick: 4,
    center: layoutBounds.center
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSdWxlck5vZGUiLCJkZW1vUnVsZXJOb2RlIiwibGF5b3V0Qm91bmRzIiwicnVsZXJMZW5ndGgiLCJtYWpvclRpY2tXaWR0aCIsIm1ham9yVGlja0xhYmVscyIsIm51bWJlck9mVGlja3MiLCJNYXRoIiwiZmxvb3IiLCJpIiwiaW5zZXRzV2lkdGgiLCJtaW5vclRpY2tzUGVyTWFqb3JUaWNrIiwiY2VudGVyIl0sInNvdXJjZXMiOlsiZGVtb1J1bGVyTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGVtbyBmb3IgUnVsZXJOb2RlXHJcbiAqL1xyXG5cclxuaW1wb3J0IFJ1bGVyTm9kZSBmcm9tICcuLi8uLi9SdWxlck5vZGUuanMnO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb1J1bGVyTm9kZSggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xyXG5cclxuICBjb25zdCBydWxlckxlbmd0aCA9IDUwMDtcclxuICBjb25zdCBtYWpvclRpY2tXaWR0aCA9IDUwO1xyXG4gIGNvbnN0IG1ham9yVGlja0xhYmVscyA9IFtdO1xyXG4gIGNvbnN0IG51bWJlck9mVGlja3MgPSBNYXRoLmZsb29yKCBydWxlckxlbmd0aCAvIG1ham9yVGlja1dpZHRoICkgKyAxO1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mVGlja3M7IGkrKyApIHtcclxuICAgIG1ham9yVGlja0xhYmVsc1sgaSBdID0gYCR7aSAqIG1ham9yVGlja1dpZHRofWA7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbmV3IFJ1bGVyTm9kZSggcnVsZXJMZW5ndGgsIDAuMTUgKiBydWxlckxlbmd0aCwgbWFqb3JUaWNrV2lkdGgsIG1ham9yVGlja0xhYmVscywgJ20nLCB7XHJcbiAgICBpbnNldHNXaWR0aDogMjUsXHJcbiAgICBtaW5vclRpY2tzUGVyTWFqb3JUaWNrOiA0LFxyXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXHJcbiAgfSApO1xyXG59Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLG9CQUFvQjtBQUkxQyxlQUFlLFNBQVNDLGFBQWFBLENBQUVDLFlBQXFCLEVBQVM7RUFFbkUsTUFBTUMsV0FBVyxHQUFHLEdBQUc7RUFDdkIsTUFBTUMsY0FBYyxHQUFHLEVBQUU7RUFDekIsTUFBTUMsZUFBZSxHQUFHLEVBQUU7RUFDMUIsTUFBTUMsYUFBYSxHQUFHQyxJQUFJLENBQUNDLEtBQUssQ0FBRUwsV0FBVyxHQUFHQyxjQUFlLENBQUMsR0FBRyxDQUFDO0VBQ3BFLEtBQU0sSUFBSUssQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHSCxhQUFhLEVBQUVHLENBQUMsRUFBRSxFQUFHO0lBQ3hDSixlQUFlLENBQUVJLENBQUMsQ0FBRSxHQUFJLEdBQUVBLENBQUMsR0FBR0wsY0FBZSxFQUFDO0VBQ2hEO0VBRUEsT0FBTyxJQUFJSixTQUFTLENBQUVHLFdBQVcsRUFBRSxJQUFJLEdBQUdBLFdBQVcsRUFBRUMsY0FBYyxFQUFFQyxlQUFlLEVBQUUsR0FBRyxFQUFFO0lBQzNGSyxXQUFXLEVBQUUsRUFBRTtJQUNmQyxzQkFBc0IsRUFBRSxDQUFDO0lBQ3pCQyxNQUFNLEVBQUVWLFlBQVksQ0FBQ1U7RUFDdkIsQ0FBRSxDQUFDO0FBQ0wifQ==