// Copyright 2014-2020, University of Colorado Boulder

/**
 * Constants used throughout the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import faradaysLaw from '../faradaysLaw.js';

// constants
const BULB_POSITION = new Vector2(190, 200);
const FaradaysLawConstants = {
  LAYOUT_BOUNDS: new Bounds2(0, 0, 834, 504),
  BULB_POSITION: BULB_POSITION,
  VOLTMETER_POSITION: BULB_POSITION.minusXY(0, 120),
  MAGNET_HEIGHT: 30,
  MAGNET_WIDTH: 140,
  TOP_COIL_POSITION: new Vector2(422, 110),
  BOTTOM_COIL_POSITION: new Vector2(448, 310)
};
faradaysLaw.register('FaradaysLawConstants', FaradaysLawConstants);
export default FaradaysLawConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVmVjdG9yMiIsImZhcmFkYXlzTGF3IiwiQlVMQl9QT1NJVElPTiIsIkZhcmFkYXlzTGF3Q29uc3RhbnRzIiwiTEFZT1VUX0JPVU5EUyIsIlZPTFRNRVRFUl9QT1NJVElPTiIsIm1pbnVzWFkiLCJNQUdORVRfSEVJR0hUIiwiTUFHTkVUX1dJRFRIIiwiVE9QX0NPSUxfUE9TSVRJT04iLCJCT1RUT01fQ09JTF9QT1NJVElPTiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRmFyYWRheXNMYXdDb25zdGFudHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29uc3RhbnRzIHVzZWQgdGhyb3VnaG91dCB0aGUgc2ltLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgZmFyYWRheXNMYXcgZnJvbSAnLi4vZmFyYWRheXNMYXcuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEJVTEJfUE9TSVRJT04gPSBuZXcgVmVjdG9yMiggMTkwLCAyMDAgKTtcclxuXHJcbmNvbnN0IEZhcmFkYXlzTGF3Q29uc3RhbnRzID0ge1xyXG4gIExBWU9VVF9CT1VORFM6IG5ldyBCb3VuZHMyKCAwLCAwLCA4MzQsIDUwNCApLFxyXG4gIEJVTEJfUE9TSVRJT046IEJVTEJfUE9TSVRJT04sXHJcbiAgVk9MVE1FVEVSX1BPU0lUSU9OOiBCVUxCX1BPU0lUSU9OLm1pbnVzWFkoIDAsIDEyMCApLFxyXG4gIE1BR05FVF9IRUlHSFQ6IDMwLFxyXG4gIE1BR05FVF9XSURUSDogMTQwLFxyXG4gIFRPUF9DT0lMX1BPU0lUSU9OOiBuZXcgVmVjdG9yMiggNDIyLCAxMTAgKSxcclxuICBCT1RUT01fQ09JTF9QT1NJVElPTjogbmV3IFZlY3RvcjIoIDQ0OCwgMzEwIClcclxufTtcclxuXHJcbmZhcmFkYXlzTGF3LnJlZ2lzdGVyKCAnRmFyYWRheXNMYXdDb25zdGFudHMnLCBGYXJhZGF5c0xhd0NvbnN0YW50cyApO1xyXG5leHBvcnQgZGVmYXVsdCBGYXJhZGF5c0xhd0NvbnN0YW50czsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLFdBQVcsTUFBTSxtQkFBbUI7O0FBRTNDO0FBQ0EsTUFBTUMsYUFBYSxHQUFHLElBQUlGLE9BQU8sQ0FBRSxHQUFHLEVBQUUsR0FBSSxDQUFDO0FBRTdDLE1BQU1HLG9CQUFvQixHQUFHO0VBQzNCQyxhQUFhLEVBQUUsSUFBSUwsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUksQ0FBQztFQUM1Q0csYUFBYSxFQUFFQSxhQUFhO0VBQzVCRyxrQkFBa0IsRUFBRUgsYUFBYSxDQUFDSSxPQUFPLENBQUUsQ0FBQyxFQUFFLEdBQUksQ0FBQztFQUNuREMsYUFBYSxFQUFFLEVBQUU7RUFDakJDLFlBQVksRUFBRSxHQUFHO0VBQ2pCQyxpQkFBaUIsRUFBRSxJQUFJVCxPQUFPLENBQUUsR0FBRyxFQUFFLEdBQUksQ0FBQztFQUMxQ1Usb0JBQW9CLEVBQUUsSUFBSVYsT0FBTyxDQUFFLEdBQUcsRUFBRSxHQUFJO0FBQzlDLENBQUM7QUFFREMsV0FBVyxDQUFDVSxRQUFRLENBQUUsc0JBQXNCLEVBQUVSLG9CQUFxQixDQUFDO0FBQ3BFLGVBQWVBLG9CQUFvQiJ9