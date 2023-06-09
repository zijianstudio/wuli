// Copyright 2014-2021, University of Colorado Boulder

import flowerPot_png from '../../../../images/flowerPot_png.js';
import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

// constants
const MASS = 5; // In kg
const HEIGHT = 0.55; // In meters

class FlowerPot extends ImageMass {
  /**
   * @param initialPosition
   * @param isMystery
   */
  constructor(initialPosition, isMystery) {
    super(MASS, flowerPot_png, HEIGHT, initialPosition, isMystery);
  }
}
balancingAct.register('FlowerPot', FlowerPot);
export default FlowerPot;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmbG93ZXJQb3RfcG5nIiwiYmFsYW5jaW5nQWN0IiwiSW1hZ2VNYXNzIiwiTUFTUyIsIkhFSUdIVCIsIkZsb3dlclBvdCIsImNvbnN0cnVjdG9yIiwiaW5pdGlhbFBvc2l0aW9uIiwiaXNNeXN0ZXJ5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGbG93ZXJQb3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5cclxuaW1wb3J0IGZsb3dlclBvdF9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vaW1hZ2VzL2Zsb3dlclBvdF9wbmcuanMnO1xyXG5pbXBvcnQgYmFsYW5jaW5nQWN0IGZyb20gJy4uLy4uLy4uL2JhbGFuY2luZ0FjdC5qcyc7XHJcbmltcG9ydCBJbWFnZU1hc3MgZnJvbSAnLi4vSW1hZ2VNYXNzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNQVNTID0gNTsgLy8gSW4ga2dcclxuY29uc3QgSEVJR0hUID0gMC41NTsgLy8gSW4gbWV0ZXJzXHJcblxyXG5jbGFzcyBGbG93ZXJQb3QgZXh0ZW5kcyBJbWFnZU1hc3Mge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gaW5pdGlhbFBvc2l0aW9uXHJcbiAgICogQHBhcmFtIGlzTXlzdGVyeVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBpbml0aWFsUG9zaXRpb24sIGlzTXlzdGVyeSApIHtcclxuICAgIHN1cGVyKCBNQVNTLCBmbG93ZXJQb3RfcG5nLCBIRUlHSFQsIGluaXRpYWxQb3NpdGlvbiwgaXNNeXN0ZXJ5ICk7XHJcbiAgfVxyXG59XHJcblxyXG5iYWxhbmNpbmdBY3QucmVnaXN0ZXIoICdGbG93ZXJQb3QnLCBGbG93ZXJQb3QgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZsb3dlclBvdDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUdBLE9BQU9BLGFBQWEsTUFBTSxxQ0FBcUM7QUFDL0QsT0FBT0MsWUFBWSxNQUFNLDBCQUEwQjtBQUNuRCxPQUFPQyxTQUFTLE1BQU0saUJBQWlCOztBQUV2QztBQUNBLE1BQU1DLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoQixNQUFNQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQU1DLFNBQVMsU0FBU0gsU0FBUyxDQUFDO0VBRWhDO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VJLFdBQVdBLENBQUVDLGVBQWUsRUFBRUMsU0FBUyxFQUFHO0lBQ3hDLEtBQUssQ0FBRUwsSUFBSSxFQUFFSCxhQUFhLEVBQUVJLE1BQU0sRUFBRUcsZUFBZSxFQUFFQyxTQUFVLENBQUM7RUFDbEU7QUFDRjtBQUVBUCxZQUFZLENBQUNRLFFBQVEsQ0FBRSxXQUFXLEVBQUVKLFNBQVUsQ0FBQztBQUUvQyxlQUFlQSxTQUFTIn0=