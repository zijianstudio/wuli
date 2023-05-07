// Copyright 2014-2022, University of Colorado Boulder

/**
 * Voltmeter wires for 'Faradays Law' simulation model
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Circle, Color, Node, Path, RadialGradient } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawConstants from '../FaradaysLawConstants.js';

// constants
const BULB_POSITION = FaradaysLawConstants.BULB_POSITION;
const VOLTMETER_POSITION = FaradaysLawConstants.VOLTMETER_POSITION;
class VoltmeterWiresNode extends Node {
  /**
   * @param {VoltmeterNode} voltmeterNode
   */
  constructor(voltmeterNode) {
    super();
    const wireColor = '#353a89';
    const wireWidth = 3;

    // variables, used for measuring pads too
    const leftWireX = VOLTMETER_POSITION.x + voltmeterNode.minusNode.centerX;
    const rightWireX = VOLTMETER_POSITION.x + voltmeterNode.plusNode.centerX;
    const wireTop = VOLTMETER_POSITION.y + voltmeterNode.height / 2;

    // wires goes not to exactly to bulb position, need small deltas
    const leftWireBottom = BULB_POSITION.y - 23;
    const rightWireBottom = BULB_POSITION.y - 10;
    this.addChild(new Path(new Shape().moveTo(leftWireX, wireTop).lineTo(leftWireX, leftWireBottom), {
      stroke: wireColor,
      lineWidth: wireWidth
    }));
    this.addChild(new Path(new Shape().moveTo(rightWireX, wireTop).lineTo(rightWireX, rightWireBottom), {
      stroke: wireColor,
      lineWidth: wireWidth
    }));
    this.addChild(createPad({
      centerX: leftWireX,
      centerY: leftWireBottom
    }));
    this.addChild(createPad({
      centerX: rightWireX,
      centerY: rightWireBottom
    }));

    // For PhET-iO, synchronize visibility with the VoltmeterNode
    const updateVisible = () => {
      this.visible = voltmeterNode.visible;
    };
    voltmeterNode.visibleProperty.lazyLink(updateVisible);
    updateVisible();
  }
}

/**
 * Creates measure pad.
 * @param {Object} [options]
 * @returns {Node}
 */
const createPad = options => {
  // params
  const baseColor = new Color('#b4b5b5');
  const transparentColor = baseColor.withAlpha(0);
  const radius = 7;
  const gradientLength = 2;
  const innerGradientRadius = radius - gradientLength / 2;
  const outerGradientRadius = radius + gradientLength / 2;
  const gradientOffset = gradientLength / 2;
  const pad = new Node();

  // Create the gradient fills
  const highlightFill = new RadialGradient(gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius).addColorStop(0, baseColor).addColorStop(1, baseColor.colorUtilsBrighter(0.7));
  const shadowFill = new RadialGradient(-gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius).addColorStop(0, transparentColor).addColorStop(1, baseColor.colorUtilsDarker(0.5));

  // base circle with white gradient
  const baseCircle = new Circle(radius, {
    fill: highlightFill
  });
  pad.addChild(baseCircle);

  // black gradient
  const overlayForShadowGradient = new Circle(radius, {
    fill: shadowFill
  });
  pad.addChild(overlayForShadowGradient);
  pad.mutate(options);
  return pad;
};
faradaysLaw.register('VoltmeterWiresNode', VoltmeterWiresNode);
export default VoltmeterWiresNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIkNpcmNsZSIsIkNvbG9yIiwiTm9kZSIsIlBhdGgiLCJSYWRpYWxHcmFkaWVudCIsImZhcmFkYXlzTGF3IiwiRmFyYWRheXNMYXdDb25zdGFudHMiLCJCVUxCX1BPU0lUSU9OIiwiVk9MVE1FVEVSX1BPU0lUSU9OIiwiVm9sdG1ldGVyV2lyZXNOb2RlIiwiY29uc3RydWN0b3IiLCJ2b2x0bWV0ZXJOb2RlIiwid2lyZUNvbG9yIiwid2lyZVdpZHRoIiwibGVmdFdpcmVYIiwieCIsIm1pbnVzTm9kZSIsImNlbnRlclgiLCJyaWdodFdpcmVYIiwicGx1c05vZGUiLCJ3aXJlVG9wIiwieSIsImhlaWdodCIsImxlZnRXaXJlQm90dG9tIiwicmlnaHRXaXJlQm90dG9tIiwiYWRkQ2hpbGQiLCJtb3ZlVG8iLCJsaW5lVG8iLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJjcmVhdGVQYWQiLCJjZW50ZXJZIiwidXBkYXRlVmlzaWJsZSIsInZpc2libGUiLCJ2aXNpYmxlUHJvcGVydHkiLCJsYXp5TGluayIsIm9wdGlvbnMiLCJiYXNlQ29sb3IiLCJ0cmFuc3BhcmVudENvbG9yIiwid2l0aEFscGhhIiwicmFkaXVzIiwiZ3JhZGllbnRMZW5ndGgiLCJpbm5lckdyYWRpZW50UmFkaXVzIiwib3V0ZXJHcmFkaWVudFJhZGl1cyIsImdyYWRpZW50T2Zmc2V0IiwicGFkIiwiaGlnaGxpZ2h0RmlsbCIsImFkZENvbG9yU3RvcCIsImNvbG9yVXRpbHNCcmlnaHRlciIsInNoYWRvd0ZpbGwiLCJjb2xvclV0aWxzRGFya2VyIiwiYmFzZUNpcmNsZSIsImZpbGwiLCJvdmVybGF5Rm9yU2hhZG93R3JhZGllbnQiLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZvbHRtZXRlcldpcmVzTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWb2x0bWV0ZXIgd2lyZXMgZm9yICdGYXJhZGF5cyBMYXcnIHNpbXVsYXRpb24gbW9kZWxcclxuICpcclxuICogQGF1dGhvciBWYXNpbHkgU2hha2hvdiAoTUxlYXJuZXIpXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBDaXJjbGUsIENvbG9yLCBOb2RlLCBQYXRoLCBSYWRpYWxHcmFkaWVudCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBmYXJhZGF5c0xhdyBmcm9tICcuLi8uLi9mYXJhZGF5c0xhdy5qcyc7XHJcbmltcG9ydCBGYXJhZGF5c0xhd0NvbnN0YW50cyBmcm9tICcuLi9GYXJhZGF5c0xhd0NvbnN0YW50cy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQlVMQl9QT1NJVElPTiA9IEZhcmFkYXlzTGF3Q29uc3RhbnRzLkJVTEJfUE9TSVRJT047XHJcbmNvbnN0IFZPTFRNRVRFUl9QT1NJVElPTiA9IEZhcmFkYXlzTGF3Q29uc3RhbnRzLlZPTFRNRVRFUl9QT1NJVElPTjtcclxuXHJcbmNsYXNzIFZvbHRtZXRlcldpcmVzTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1ZvbHRtZXRlck5vZGV9IHZvbHRtZXRlck5vZGVcclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggdm9sdG1ldGVyTm9kZSApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgY29uc3Qgd2lyZUNvbG9yID0gJyMzNTNhODknO1xyXG4gICAgY29uc3Qgd2lyZVdpZHRoID0gMztcclxuXHJcbiAgICAvLyB2YXJpYWJsZXMsIHVzZWQgZm9yIG1lYXN1cmluZyBwYWRzIHRvb1xyXG4gICAgY29uc3QgbGVmdFdpcmVYID0gVk9MVE1FVEVSX1BPU0lUSU9OLnggKyB2b2x0bWV0ZXJOb2RlLm1pbnVzTm9kZS5jZW50ZXJYO1xyXG4gICAgY29uc3QgcmlnaHRXaXJlWCA9IFZPTFRNRVRFUl9QT1NJVElPTi54ICsgdm9sdG1ldGVyTm9kZS5wbHVzTm9kZS5jZW50ZXJYO1xyXG4gICAgY29uc3Qgd2lyZVRvcCA9IFZPTFRNRVRFUl9QT1NJVElPTi55ICsgdm9sdG1ldGVyTm9kZS5oZWlnaHQgLyAyO1xyXG5cclxuICAgIC8vIHdpcmVzIGdvZXMgbm90IHRvIGV4YWN0bHkgdG8gYnVsYiBwb3NpdGlvbiwgbmVlZCBzbWFsbCBkZWx0YXNcclxuICAgIGNvbnN0IGxlZnRXaXJlQm90dG9tID0gQlVMQl9QT1NJVElPTi55IC0gMjM7XHJcbiAgICBjb25zdCByaWdodFdpcmVCb3R0b20gPSBCVUxCX1BPU0lUSU9OLnkgLSAxMDtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgUGF0aCggbmV3IFNoYXBlKClcclxuICAgICAgLm1vdmVUbyggbGVmdFdpcmVYLCB3aXJlVG9wIClcclxuICAgICAgLmxpbmVUbyggbGVmdFdpcmVYLCBsZWZ0V2lyZUJvdHRvbSApLCB7XHJcbiAgICAgIHN0cm9rZTogd2lyZUNvbG9yLFxyXG4gICAgICBsaW5lV2lkdGg6IHdpcmVXaWR0aFxyXG4gICAgfSApICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFBhdGgoIG5ldyBTaGFwZSgpXHJcbiAgICAgIC5tb3ZlVG8oIHJpZ2h0V2lyZVgsIHdpcmVUb3AgKVxyXG4gICAgICAubGluZVRvKCByaWdodFdpcmVYLCByaWdodFdpcmVCb3R0b20gKSwge1xyXG4gICAgICBzdHJva2U6IHdpcmVDb2xvcixcclxuICAgICAgbGluZVdpZHRoOiB3aXJlV2lkdGhcclxuICAgIH0gKSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNyZWF0ZVBhZCgge1xyXG4gICAgICBjZW50ZXJYOiBsZWZ0V2lyZVgsXHJcbiAgICAgIGNlbnRlclk6IGxlZnRXaXJlQm90dG9tXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBjcmVhdGVQYWQoIHtcclxuICAgICAgY2VudGVyWDogcmlnaHRXaXJlWCxcclxuICAgICAgY2VudGVyWTogcmlnaHRXaXJlQm90dG9tXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBGb3IgUGhFVC1pTywgc3luY2hyb25pemUgdmlzaWJpbGl0eSB3aXRoIHRoZSBWb2x0bWV0ZXJOb2RlXHJcbiAgICBjb25zdCB1cGRhdGVWaXNpYmxlID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLnZpc2libGUgPSB2b2x0bWV0ZXJOb2RlLnZpc2libGU7XHJcbiAgICB9O1xyXG4gICAgdm9sdG1ldGVyTm9kZS52aXNpYmxlUHJvcGVydHkubGF6eUxpbmsoIHVwZGF0ZVZpc2libGUgKTtcclxuICAgIHVwZGF0ZVZpc2libGUoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIG1lYXN1cmUgcGFkLlxyXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAqIEByZXR1cm5zIHtOb2RlfVxyXG4gKi9cclxuY29uc3QgY3JlYXRlUGFkID0gb3B0aW9ucyA9PiB7XHJcblxyXG4gIC8vIHBhcmFtc1xyXG4gIGNvbnN0IGJhc2VDb2xvciA9IG5ldyBDb2xvciggJyNiNGI1YjUnICk7XHJcbiAgY29uc3QgdHJhbnNwYXJlbnRDb2xvciA9IGJhc2VDb2xvci53aXRoQWxwaGEoIDAgKTtcclxuICBjb25zdCByYWRpdXMgPSA3O1xyXG4gIGNvbnN0IGdyYWRpZW50TGVuZ3RoID0gMjtcclxuICBjb25zdCBpbm5lckdyYWRpZW50UmFkaXVzID0gcmFkaXVzIC0gZ3JhZGllbnRMZW5ndGggLyAyO1xyXG4gIGNvbnN0IG91dGVyR3JhZGllbnRSYWRpdXMgPSByYWRpdXMgKyBncmFkaWVudExlbmd0aCAvIDI7XHJcbiAgY29uc3QgZ3JhZGllbnRPZmZzZXQgPSBncmFkaWVudExlbmd0aCAvIDI7XHJcblxyXG4gIGNvbnN0IHBhZCA9IG5ldyBOb2RlKCk7XHJcblxyXG4gIC8vIENyZWF0ZSB0aGUgZ3JhZGllbnQgZmlsbHNcclxuICBjb25zdCBoaWdobGlnaHRGaWxsID0gbmV3IFJhZGlhbEdyYWRpZW50KCBncmFkaWVudE9mZnNldCwgZ3JhZGllbnRPZmZzZXQsIGlubmVyR3JhZGllbnRSYWRpdXMsIGdyYWRpZW50T2Zmc2V0LCBncmFkaWVudE9mZnNldCwgb3V0ZXJHcmFkaWVudFJhZGl1cyApXHJcbiAgICAuYWRkQ29sb3JTdG9wKCAwLCBiYXNlQ29sb3IgKVxyXG4gICAgLmFkZENvbG9yU3RvcCggMSwgYmFzZUNvbG9yLmNvbG9yVXRpbHNCcmlnaHRlciggMC43ICkgKTtcclxuXHJcbiAgY29uc3Qgc2hhZG93RmlsbCA9IG5ldyBSYWRpYWxHcmFkaWVudCggLWdyYWRpZW50T2Zmc2V0LCAtZ3JhZGllbnRPZmZzZXQsIGlubmVyR3JhZGllbnRSYWRpdXMsIC1ncmFkaWVudE9mZnNldCwgLWdyYWRpZW50T2Zmc2V0LCBvdXRlckdyYWRpZW50UmFkaXVzIClcclxuICAgIC5hZGRDb2xvclN0b3AoIDAsIHRyYW5zcGFyZW50Q29sb3IgKVxyXG4gICAgLmFkZENvbG9yU3RvcCggMSwgYmFzZUNvbG9yLmNvbG9yVXRpbHNEYXJrZXIoIDAuNSApICk7XHJcblxyXG4gIC8vIGJhc2UgY2lyY2xlIHdpdGggd2hpdGUgZ3JhZGllbnRcclxuICBjb25zdCBiYXNlQ2lyY2xlID0gbmV3IENpcmNsZSggcmFkaXVzLCB7IGZpbGw6IGhpZ2hsaWdodEZpbGwgfSApO1xyXG4gIHBhZC5hZGRDaGlsZCggYmFzZUNpcmNsZSApO1xyXG5cclxuICAvLyBibGFjayBncmFkaWVudFxyXG4gIGNvbnN0IG92ZXJsYXlGb3JTaGFkb3dHcmFkaWVudCA9IG5ldyBDaXJjbGUoIHJhZGl1cywgeyBmaWxsOiBzaGFkb3dGaWxsIH0gKTtcclxuICBwYWQuYWRkQ2hpbGQoIG92ZXJsYXlGb3JTaGFkb3dHcmFkaWVudCApO1xyXG5cclxuICBwYWQubXV0YXRlKCBvcHRpb25zICk7XHJcbiAgcmV0dXJuIHBhZDtcclxufTtcclxuXHJcbmZhcmFkYXlzTGF3LnJlZ2lzdGVyKCAnVm9sdG1ldGVyV2lyZXNOb2RlJywgVm9sdG1ldGVyV2lyZXNOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFZvbHRtZXRlcldpcmVzTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELFNBQVNDLE1BQU0sRUFBRUMsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsY0FBYyxRQUFRLG1DQUFtQztBQUM3RixPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLG9CQUFvQixNQUFNLDRCQUE0Qjs7QUFFN0Q7QUFDQSxNQUFNQyxhQUFhLEdBQUdELG9CQUFvQixDQUFDQyxhQUFhO0FBQ3hELE1BQU1DLGtCQUFrQixHQUFHRixvQkFBb0IsQ0FBQ0Usa0JBQWtCO0FBRWxFLE1BQU1DLGtCQUFrQixTQUFTUCxJQUFJLENBQUM7RUFFcEM7QUFDRjtBQUNBO0VBQ0VRLFdBQVdBLENBQUVDLGFBQWEsRUFBRztJQUMzQixLQUFLLENBQUMsQ0FBQztJQUVQLE1BQU1DLFNBQVMsR0FBRyxTQUFTO0lBQzNCLE1BQU1DLFNBQVMsR0FBRyxDQUFDOztJQUVuQjtJQUNBLE1BQU1DLFNBQVMsR0FBR04sa0JBQWtCLENBQUNPLENBQUMsR0FBR0osYUFBYSxDQUFDSyxTQUFTLENBQUNDLE9BQU87SUFDeEUsTUFBTUMsVUFBVSxHQUFHVixrQkFBa0IsQ0FBQ08sQ0FBQyxHQUFHSixhQUFhLENBQUNRLFFBQVEsQ0FBQ0YsT0FBTztJQUN4RSxNQUFNRyxPQUFPLEdBQUdaLGtCQUFrQixDQUFDYSxDQUFDLEdBQUdWLGFBQWEsQ0FBQ1csTUFBTSxHQUFHLENBQUM7O0lBRS9EO0lBQ0EsTUFBTUMsY0FBYyxHQUFHaEIsYUFBYSxDQUFDYyxDQUFDLEdBQUcsRUFBRTtJQUMzQyxNQUFN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