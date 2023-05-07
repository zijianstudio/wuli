// Copyright 2013-2021, University of Colorado Boulder

import trashCan_png from '../../../../images/trashCan_png.js';
import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

// constants
const MASS = 10; // In kg
const HEIGHT = 0.55; // In meters

class SmallTrashCan extends ImageMass {
  /**
   * @param initialPosition
   * @param isMystery
   * @param {Object} [options]
   */
  constructor(initialPosition, isMystery, options) {
    super(MASS, trashCan_png, HEIGHT, initialPosition, isMystery, options);
  }
}
balancingAct.register('SmallTrashCan', SmallTrashCan);
export default SmallTrashCan;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0cmFzaENhbl9wbmciLCJiYWxhbmNpbmdBY3QiLCJJbWFnZU1hc3MiLCJNQVNTIiwiSEVJR0hUIiwiU21hbGxUcmFzaENhbiIsImNvbnN0cnVjdG9yIiwiaW5pdGlhbFBvc2l0aW9uIiwiaXNNeXN0ZXJ5Iiwib3B0aW9ucyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU21hbGxUcmFzaENhbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcblxyXG5pbXBvcnQgdHJhc2hDYW5fcG5nIGZyb20gJy4uLy4uLy4uLy4uL2ltYWdlcy90cmFzaENhbl9wbmcuanMnO1xyXG5pbXBvcnQgYmFsYW5jaW5nQWN0IGZyb20gJy4uLy4uLy4uL2JhbGFuY2luZ0FjdC5qcyc7XHJcbmltcG9ydCBJbWFnZU1hc3MgZnJvbSAnLi4vSW1hZ2VNYXNzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNQVNTID0gMTA7IC8vIEluIGtnXHJcbmNvbnN0IEhFSUdIVCA9IDAuNTU7IC8vIEluIG1ldGVyc1xyXG5cclxuY2xhc3MgU21hbGxUcmFzaENhbiBleHRlbmRzIEltYWdlTWFzcyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBpbml0aWFsUG9zaXRpb25cclxuICAgKiBAcGFyYW0gaXNNeXN0ZXJ5XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBpbml0aWFsUG9zaXRpb24sIGlzTXlzdGVyeSwgb3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCBNQVNTLCB0cmFzaENhbl9wbmcsIEhFSUdIVCwgaW5pdGlhbFBvc2l0aW9uLCBpc015c3RlcnksIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmJhbGFuY2luZ0FjdC5yZWdpc3RlciggJ1NtYWxsVHJhc2hDYW4nLCBTbWFsbFRyYXNoQ2FuICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTbWFsbFRyYXNoQ2FuOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBR0EsT0FBT0EsWUFBWSxNQUFNLG9DQUFvQztBQUM3RCxPQUFPQyxZQUFZLE1BQU0sMEJBQTBCO0FBQ25ELE9BQU9DLFNBQVMsTUFBTSxpQkFBaUI7O0FBRXZDO0FBQ0EsTUFBTUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ2pCLE1BQU1DLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQzs7QUFFckIsTUFBTUMsYUFBYSxTQUFTSCxTQUFTLENBQUM7RUFFcEM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxXQUFXQSxDQUFFQyxlQUFlLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxFQUFHO0lBQ2pELEtBQUssQ0FBRU4sSUFBSSxFQUFFSCxZQUFZLEVBQUVJLE1BQU0sRUFBRUcsZUFBZSxFQUFFQyxTQUFTLEVBQUVDLE9BQVEsQ0FBQztFQUMxRTtBQUNGO0FBRUFSLFlBQVksQ0FBQ1MsUUFBUSxDQUFFLGVBQWUsRUFBRUwsYUFBYyxDQUFDO0FBRXZELGVBQWVBLGFBQWEifQ==