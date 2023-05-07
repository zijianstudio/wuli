// Copyright 2013-2022, University of Colorado Boulder

/**
 * Fulcrum (for lack of a better word) that has a pivot point that is above
 * the plank.  This shape looks sort of like a swing set, with angled legs
 * that go from the ground up to apex in a sort of A-frame arrangement.
 *
 * @author John Blanco
 */

import { Shape } from '../../../../kite/js/imports.js';
import balancingAct from '../../balancingAct.js';

// constants
const LEG_THICKNESS_FACTOR = 0.09; // Thickness of legs proportional to overall width, empirically determined.

/**
 * @param {Dimension2} size - width and height of the fulcrum.
 * @constructor
 */
function Fulcrum(size) {
  this.size = size;
  const legThickness = LEG_THICKNESS_FACTOR * size.width;

  // Define the basic shape of the fulcrum, which is an A-frame sort of
  // thing that is centered horizontally around x = 0.  There are some
  // 'tweak factors' in here, adjust as needed for desired look.
  const fulcrumShape = new Shape();
  // Start at leftmost and lowest point.
  fulcrumShape.moveTo(-size.width / 2, 0);
  fulcrumShape.lineTo(-legThickness * 0.67, size.height + legThickness / 2);
  fulcrumShape.lineTo(legThickness * 0.67, size.height + legThickness / 2);
  fulcrumShape.lineTo(size.width / 2, 0);
  fulcrumShape.lineTo(size.width / 2 - legThickness, 0);
  fulcrumShape.lineTo(0, size.height - legThickness * 0.2);
  fulcrumShape.lineTo(-size.width / 2 + legThickness, 0);
  fulcrumShape.close();

  // The shape property is what will define the shape in the view.
  this.shape = fulcrumShape;
}
balancingAct.register('Fulcrum', Fulcrum);
export default Fulcrum;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsImJhbGFuY2luZ0FjdCIsIkxFR19USElDS05FU1NfRkFDVE9SIiwiRnVsY3J1bSIsInNpemUiLCJsZWdUaGlja25lc3MiLCJ3aWR0aCIsImZ1bGNydW1TaGFwZSIsIm1vdmVUbyIsImxpbmVUbyIsImhlaWdodCIsImNsb3NlIiwic2hhcGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkZ1bGNydW0uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRnVsY3J1bSAoZm9yIGxhY2sgb2YgYSBiZXR0ZXIgd29yZCkgdGhhdCBoYXMgYSBwaXZvdCBwb2ludCB0aGF0IGlzIGFib3ZlXHJcbiAqIHRoZSBwbGFuay4gIFRoaXMgc2hhcGUgbG9va3Mgc29ydCBvZiBsaWtlIGEgc3dpbmcgc2V0LCB3aXRoIGFuZ2xlZCBsZWdzXHJcbiAqIHRoYXQgZ28gZnJvbSB0aGUgZ3JvdW5kIHVwIHRvIGFwZXggaW4gYSBzb3J0IG9mIEEtZnJhbWUgYXJyYW5nZW1lbnQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBiYWxhbmNpbmdBY3QgZnJvbSAnLi4vLi4vYmFsYW5jaW5nQWN0LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBMRUdfVEhJQ0tORVNTX0ZBQ1RPUiA9IDAuMDk7IC8vIFRoaWNrbmVzcyBvZiBsZWdzIHByb3BvcnRpb25hbCB0byBvdmVyYWxsIHdpZHRoLCBlbXBpcmljYWxseSBkZXRlcm1pbmVkLlxyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7RGltZW5zaW9uMn0gc2l6ZSAtIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIGZ1bGNydW0uXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gRnVsY3J1bSggc2l6ZSApIHtcclxuICB0aGlzLnNpemUgPSBzaXplO1xyXG4gIGNvbnN0IGxlZ1RoaWNrbmVzcyA9IExFR19USElDS05FU1NfRkFDVE9SICogc2l6ZS53aWR0aDtcclxuXHJcbiAgLy8gRGVmaW5lIHRoZSBiYXNpYyBzaGFwZSBvZiB0aGUgZnVsY3J1bSwgd2hpY2ggaXMgYW4gQS1mcmFtZSBzb3J0IG9mXHJcbiAgLy8gdGhpbmcgdGhhdCBpcyBjZW50ZXJlZCBob3Jpem9udGFsbHkgYXJvdW5kIHggPSAwLiAgVGhlcmUgYXJlIHNvbWVcclxuICAvLyAndHdlYWsgZmFjdG9ycycgaW4gaGVyZSwgYWRqdXN0IGFzIG5lZWRlZCBmb3IgZGVzaXJlZCBsb29rLlxyXG4gIGNvbnN0IGZ1bGNydW1TaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG4gIC8vIFN0YXJ0IGF0IGxlZnRtb3N0IGFuZCBsb3dlc3QgcG9pbnQuXHJcbiAgZnVsY3J1bVNoYXBlLm1vdmVUbyggLXNpemUud2lkdGggLyAyLCAwICk7XHJcbiAgZnVsY3J1bVNoYXBlLmxpbmVUbyggLWxlZ1RoaWNrbmVzcyAqIDAuNjcsIHNpemUuaGVpZ2h0ICsgbGVnVGhpY2tuZXNzIC8gMiApO1xyXG4gIGZ1bGNydW1TaGFwZS5saW5lVG8oIGxlZ1RoaWNrbmVzcyAqIDAuNjcsIHNpemUuaGVpZ2h0ICsgbGVnVGhpY2tuZXNzIC8gMiApO1xyXG4gIGZ1bGNydW1TaGFwZS5saW5lVG8oIHNpemUud2lkdGggLyAyLCAwICk7XHJcbiAgZnVsY3J1bVNoYXBlLmxpbmVUbyggc2l6ZS53aWR0aCAvIDIgLSBsZWdUaGlja25lc3MsIDAgKTtcclxuICBmdWxjcnVtU2hhcGUubGluZVRvKCAwLCBzaXplLmhlaWdodCAtIGxlZ1RoaWNrbmVzcyAqIDAuMiApO1xyXG4gIGZ1bGNydW1TaGFwZS5saW5lVG8oIC1zaXplLndpZHRoIC8gMiArIGxlZ1RoaWNrbmVzcywgMCApO1xyXG4gIGZ1bGNydW1TaGFwZS5jbG9zZSgpO1xyXG5cclxuICAvLyBUaGUgc2hhcGUgcHJvcGVydHkgaXMgd2hhdCB3aWxsIGRlZmluZSB0aGUgc2hhcGUgaW4gdGhlIHZpZXcuXHJcbiAgdGhpcy5zaGFwZSA9IGZ1bGNydW1TaGFwZTtcclxufVxyXG5cclxuYmFsYW5jaW5nQWN0LnJlZ2lzdGVyKCAnRnVsY3J1bScsIEZ1bGNydW0gKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZ1bGNydW07Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7O0FBRWhEO0FBQ0EsTUFBTUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLENBQUM7O0FBRW5DO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0MsT0FBT0EsQ0FBRUMsSUFBSSxFQUFHO0VBQ3ZCLElBQUksQ0FBQ0EsSUFBSSxHQUFHQSxJQUFJO0VBQ2hCLE1BQU1DLFlBQVksR0FBR0gsb0JBQW9CLEdBQUdFLElBQUksQ0FBQ0UsS0FBSzs7RUFFdEQ7RUFDQTtFQUNBO0VBQ0EsTUFBTUMsWUFBWSxHQUFHLElBQUlQLEtBQUssQ0FBQyxDQUFDO0VBQ2hDO0VBQ0FPLFlBQVksQ0FBQ0MsTUFBTSxDQUFFLENBQUNKLElBQUksQ0FBQ0UsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFFLENBQUM7RUFDekNDLFlBQVksQ0FBQ0UsTUFBTSxDQUFFLENBQUNKLFlBQVksR0FBRyxJQUFJLEVBQUVELElBQUksQ0FBQ00sTUFBTSxHQUFHTCxZQUFZLEdBQUcsQ0FBRSxDQUFDO0VBQzNFRSxZQUFZLENBQUNFLE1BQU0sQ0FBRUosWUFBWSxHQUFHLElBQUksRUFBRUQsSUFBSSxDQUFDTSxNQUFNLEdBQUdMLFlBQVksR0FBRyxDQUFFLENBQUM7RUFDMUVFLFlBQVksQ0FBQ0UsTUFBTSxDQUFFTCxJQUFJLENBQUNFLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBRSxDQUFDO0VBQ3hDQyxZQUFZLENBQUNFLE1BQU0sQ0FBRUwsSUFBSSxDQUFDRSxLQUFLLEdBQUcsQ0FBQyxHQUFHRCxZQUFZLEVBQUUsQ0FBRSxDQUFDO0VBQ3ZERSxZQUFZLENBQUNFLE1BQU0sQ0FBRSxDQUFDLEVBQUVMLElBQUksQ0FBQ00sTUFBTSxHQUFHTCxZQUFZLEdBQUcsR0FBSSxDQUFDO0VBQzFERSxZQUFZLENBQUNFLE1BQU0sQ0FBRSxDQUFDTCxJQUFJLENBQUNFLEtBQUssR0FBRyxDQUFDLEdBQUdELFlBQVksRUFBRSxDQUFFLENBQUM7RUFDeERFLFlBQVksQ0FBQ0ksS0FBSyxDQUFDLENBQUM7O0VBRXBCO0VBQ0EsSUFBSSxDQUFDQyxLQUFLLEdBQUdMLFlBQVk7QUFDM0I7QUFFQU4sWUFBWSxDQUFDWSxRQUFRLENBQUUsU0FBUyxFQUFFVixPQUFRLENBQUM7QUFFM0MsZUFBZUEsT0FBTyJ9