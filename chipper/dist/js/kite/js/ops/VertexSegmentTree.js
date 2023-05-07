// Copyright 2022, University of Colorado Boulder

/**
 * A SegmentTree for Vertices. See SegmentTree for more details
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { kite, SegmentTree } from '../imports.js';
export default class VertexSegmentTree extends SegmentTree {
  getMinX(vertex, epsilon) {
    return vertex.point.x - epsilon;
  }
  getMaxX(vertex, epsilon) {
    return vertex.point.x + epsilon;
  }
}
kite.register('VertexSegmentTree', VertexSegmentTree);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJraXRlIiwiU2VnbWVudFRyZWUiLCJWZXJ0ZXhTZWdtZW50VHJlZSIsImdldE1pblgiLCJ2ZXJ0ZXgiLCJlcHNpbG9uIiwicG9pbnQiLCJ4IiwiZ2V0TWF4WCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVmVydGV4U2VnbWVudFRyZWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgU2VnbWVudFRyZWUgZm9yIFZlcnRpY2VzLiBTZWUgU2VnbWVudFRyZWUgZm9yIG1vcmUgZGV0YWlsc1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IHsga2l0ZSwgU2VnbWVudFRyZWUsIFZlcnRleCB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmVydGV4U2VnbWVudFRyZWUgZXh0ZW5kcyBTZWdtZW50VHJlZTxWZXJ0ZXg+IHtcclxuICBwdWJsaWMgZ2V0TWluWCggdmVydGV4OiBWZXJ0ZXgsIGVwc2lsb246IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHZlcnRleC5wb2ludCEueCAtIGVwc2lsb247XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0TWF4WCggdmVydGV4OiBWZXJ0ZXgsIGVwc2lsb246IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHZlcnRleC5wb2ludCEueCArIGVwc2lsb247XHJcbiAgfVxyXG59XHJcblxyXG5raXRlLnJlZ2lzdGVyKCAnVmVydGV4U2VnbWVudFRyZWUnLCBWZXJ0ZXhTZWdtZW50VHJlZSApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsSUFBSSxFQUFFQyxXQUFXLFFBQWdCLGVBQWU7QUFFekQsZUFBZSxNQUFNQyxpQkFBaUIsU0FBU0QsV0FBVyxDQUFTO0VBQzFERSxPQUFPQSxDQUFFQyxNQUFjLEVBQUVDLE9BQWUsRUFBVztJQUN4RCxPQUFPRCxNQUFNLENBQUNFLEtBQUssQ0FBRUMsQ0FBQyxHQUFHRixPQUFPO0VBQ2xDO0VBRU9HLE9BQU9BLENBQUVKLE1BQWMsRUFBRUMsT0FBZSxFQUFXO0lBQ3hELE9BQU9ELE1BQU0sQ0FBQ0UsS0FBSyxDQUFFQyxDQUFDLEdBQUdGLE9BQU87RUFDbEM7QUFDRjtBQUVBTCxJQUFJLENBQUNTLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRVAsaUJBQWtCLENBQUMifQ==