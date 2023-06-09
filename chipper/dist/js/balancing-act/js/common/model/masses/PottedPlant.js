// Copyright 2014-2021, University of Colorado Boulder

import pottedPlant_png from '../../../../images/pottedPlant_png.js';
import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

// constants
const MASS = 10; // In kg
const HEIGHT = 0.65; // In meters

class PottedPlant extends ImageMass {
  /**
   * @param initialPosition
   * @param isMystery
   */
  constructor(initialPosition, isMystery) {
    super(MASS, pottedPlant_png, HEIGHT, initialPosition, isMystery);
  }
}
balancingAct.register('PottedPlant', PottedPlant);
export default PottedPlant;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwb3R0ZWRQbGFudF9wbmciLCJiYWxhbmNpbmdBY3QiLCJJbWFnZU1hc3MiLCJNQVNTIiwiSEVJR0hUIiwiUG90dGVkUGxhbnQiLCJjb25zdHJ1Y3RvciIsImluaXRpYWxQb3NpdGlvbiIsImlzTXlzdGVyeSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUG90dGVkUGxhbnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5cclxuaW1wb3J0IHBvdHRlZFBsYW50X3BuZyBmcm9tICcuLi8uLi8uLi8uLi9pbWFnZXMvcG90dGVkUGxhbnRfcG5nLmpzJztcclxuaW1wb3J0IGJhbGFuY2luZ0FjdCBmcm9tICcuLi8uLi8uLi9iYWxhbmNpbmdBY3QuanMnO1xyXG5pbXBvcnQgSW1hZ2VNYXNzIGZyb20gJy4uL0ltYWdlTWFzcy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTUFTUyA9IDEwOyAvLyBJbiBrZ1xyXG5jb25zdCBIRUlHSFQgPSAwLjY1OyAvLyBJbiBtZXRlcnNcclxuXHJcbmNsYXNzIFBvdHRlZFBsYW50IGV4dGVuZHMgSW1hZ2VNYXNzIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGluaXRpYWxQb3NpdGlvblxyXG4gICAqIEBwYXJhbSBpc015c3RlcnlcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaW5pdGlhbFBvc2l0aW9uLCBpc015c3RlcnkgKSB7XHJcbiAgICBzdXBlciggTUFTUywgcG90dGVkUGxhbnRfcG5nLCBIRUlHSFQsIGluaXRpYWxQb3NpdGlvbiwgaXNNeXN0ZXJ5ICk7XHJcbiAgfVxyXG59XHJcblxyXG5iYWxhbmNpbmdBY3QucmVnaXN0ZXIoICdQb3R0ZWRQbGFudCcsIFBvdHRlZFBsYW50ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQb3R0ZWRQbGFudDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUdBLE9BQU9BLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MsWUFBWSxNQUFNLDBCQUEwQjtBQUNuRCxPQUFPQyxTQUFTLE1BQU0saUJBQWlCOztBQUV2QztBQUNBLE1BQU1DLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztBQUNqQixNQUFNQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQU1DLFdBQVcsU0FBU0gsU0FBUyxDQUFDO0VBRWxDO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VJLFdBQVdBLENBQUVDLGVBQWUsRUFBRUMsU0FBUyxFQUFHO0lBQ3hDLEtBQUssQ0FBRUwsSUFBSSxFQUFFSCxlQUFlLEVBQUVJLE1BQU0sRUFBRUcsZUFBZSxFQUFFQyxTQUFVLENBQUM7RUFDcEU7QUFDRjtBQUVBUCxZQUFZLENBQUNRLFFBQVEsQ0FBRSxhQUFhLEVBQUVKLFdBQVksQ0FBQztBQUVuRCxlQUFlQSxXQUFXIn0=