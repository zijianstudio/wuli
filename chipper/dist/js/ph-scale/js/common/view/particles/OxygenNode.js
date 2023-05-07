// Copyright 2013-2022, University of Colorado Boulder

/**
 * Oxygen atom.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ShadedSphereNode from '../../../../../scenery-phet/js/ShadedSphereNode.js';
import { Color } from '../../../../../scenery/js/imports.js';
import phScale from '../../../phScale.js';
import PHScaleColors from '../../PHScaleColors.js';
export default class OxygenNode extends ShadedSphereNode {
  constructor() {
    super(30, {
      mainColor: PHScaleColors.OXYGEN,
      highlightColor: new Color(255, 255, 255)
    });
  }
}
phScale.register('OxygenNode', OxygenNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFkZWRTcGhlcmVOb2RlIiwiQ29sb3IiLCJwaFNjYWxlIiwiUEhTY2FsZUNvbG9ycyIsIk94eWdlbk5vZGUiLCJjb25zdHJ1Y3RvciIsIm1haW5Db2xvciIsIk9YWUdFTiIsImhpZ2hsaWdodENvbG9yIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJPeHlnZW5Ob2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE94eWdlbiBhdG9tLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTaGFkZWRTcGhlcmVOb2RlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TaGFkZWRTcGhlcmVOb2RlLmpzJztcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgcGhTY2FsZSBmcm9tICcuLi8uLi8uLi9waFNjYWxlLmpzJztcclxuaW1wb3J0IFBIU2NhbGVDb2xvcnMgZnJvbSAnLi4vLi4vUEhTY2FsZUNvbG9ycy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPeHlnZW5Ob2RlIGV4dGVuZHMgU2hhZGVkU3BoZXJlTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCAzMCwge1xyXG4gICAgICBtYWluQ29sb3I6IFBIU2NhbGVDb2xvcnMuT1hZR0VOLFxyXG4gICAgICBoaWdobGlnaHRDb2xvcjogbmV3IENvbG9yKCAyNTUsIDI1NSwgMjU1IClcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbnBoU2NhbGUucmVnaXN0ZXIoICdPeHlnZW5Ob2RlJywgT3h5Z2VuTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxnQkFBZ0IsTUFBTSxvREFBb0Q7QUFDakYsU0FBU0MsS0FBSyxRQUFRLHNDQUFzQztBQUM1RCxPQUFPQyxPQUFPLE1BQU0scUJBQXFCO0FBQ3pDLE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFFbEQsZUFBZSxNQUFNQyxVQUFVLFNBQVNKLGdCQUFnQixDQUFDO0VBRWhESyxXQUFXQSxDQUFBLEVBQUc7SUFDbkIsS0FBSyxDQUFFLEVBQUUsRUFBRTtNQUNUQyxTQUFTLEVBQUVILGFBQWEsQ0FBQ0ksTUFBTTtNQUMvQkMsY0FBYyxFQUFFLElBQUlQLEtBQUssQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUk7SUFDM0MsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBQyxPQUFPLENBQUNPLFFBQVEsQ0FBRSxZQUFZLEVBQUVMLFVBQVcsQ0FBQyJ9