// Copyright 2018-2021, University of Colorado Boulder

/**
 * A canvas node for minus charges in the wall. This was added as a performance enhancement for #409.
 *
 * @author Jesse Greenberg
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { CanvasNode } from '../../../../scenery/js/imports.js';
import balloonsAndStaticElectricity from '../../balloonsAndStaticElectricity.js';
import BASEConstants from '../BASEConstants.js';
import PointChargeModel from '../model/PointChargeModel.js';
import MinusChargeNode from './MinusChargeNode.js';

// Node converted to image to be drawn in canvas - scale up the node, then back down when converting to image so it
// doesn't look fuzzy
const scale = 3.0;
let chargeNode = null;

// This is to prevent an instrumented phet-io instance from being created outside of a constructor,
// see https://github.com/phetsims/phet-io-wrappers/issues/97
const getChargeNode = () => {
  if (!chargeNode) {
    chargeNode = new MinusChargeNode(new Vector2(0, 0), {
      scale: scale
    });
  }
  return chargeNode;
};
class MinusChargesCanvasNode extends CanvasNode {
  /**
   * @param {number} wallX - x position of the wall, to offset charge positions
   * @param {Bounds2} wallBounds - bounds of the wall in view coordinates, passed as canvasBounds
   * @param {Array.<MovablePointChargeModel>} charges
   * @param {[object]} options
   */
  constructor(wallX, wallBounds, charges, options) {
    super(options);
    this.setCanvasBounds(wallBounds);
    this.invalidatePaint();

    // @private {Array.<MovablePointChargeNode>}
    this.charges = charges;

    // @private {number}
    this.wallX = wallX;

    // @private - created synchronously so that it can be drawn immediately in paintCanvas
    this.chargeImageNode = getChargeNode().rasterized({
      wrap: false
    });
  }

  /**
   * Draw charges at their correct positions indicating induced charge.
   *
   * @param {CanvasRenderingContext2D} context
   * @override
   * @public
   */
  paintCanvas(context) {
    // we scaled up the node before converting to image so that it looks less pixelated, so now we need to
    // scale it back down
    context.scale(1 / scale, 1 / scale);

    // draw all of the charges
    for (let i = 0; i < this.charges.length; i++) {
      const charge = this.charges[i];
      const chargePosition = charge.positionProperty.get();
      const xPosition = (chargePosition.x - this.wallX + PointChargeModel.RADIUS - BASEConstants.IMAGE_PADDING) * scale;
      const yPosition = (chargePosition.y + PointChargeModel.RADIUS - BASEConstants.IMAGE_PADDING) * scale;

      // render particle
      context.drawImage(this.chargeImageNode.image, xPosition, yPosition);
    }
  }
}
balloonsAndStaticElectricity.register('MinusChargesCanvasNode', MinusChargesCanvasNode);
export default MinusChargesCanvasNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiQ2FudmFzTm9kZSIsImJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkiLCJCQVNFQ29uc3RhbnRzIiwiUG9pbnRDaGFyZ2VNb2RlbCIsIk1pbnVzQ2hhcmdlTm9kZSIsInNjYWxlIiwiY2hhcmdlTm9kZSIsImdldENoYXJnZU5vZGUiLCJNaW51c0NoYXJnZXNDYW52YXNOb2RlIiwiY29uc3RydWN0b3IiLCJ3YWxsWCIsIndhbGxCb3VuZHMiLCJjaGFyZ2VzIiwib3B0aW9ucyIsInNldENhbnZhc0JvdW5kcyIsImludmFsaWRhdGVQYWludCIsImNoYXJnZUltYWdlTm9kZSIsInJhc3Rlcml6ZWQiLCJ3cmFwIiwicGFpbnRDYW52YXMiLCJjb250ZXh0IiwiaSIsImxlbmd0aCIsImNoYXJnZSIsImNoYXJnZVBvc2l0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsImdldCIsInhQb3NpdGlvbiIsIngiLCJSQURJVVMiLCJJTUFHRV9QQURESU5HIiwieVBvc2l0aW9uIiwieSIsImRyYXdJbWFnZSIsImltYWdlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNaW51c0NoYXJnZXNDYW52YXNOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgY2FudmFzIG5vZGUgZm9yIG1pbnVzIGNoYXJnZXMgaW4gdGhlIHdhbGwuIFRoaXMgd2FzIGFkZGVkIGFzIGEgcGVyZm9ybWFuY2UgZW5oYW5jZW1lbnQgZm9yICM0MDkuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBDYW52YXNOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkgZnJvbSAnLi4vLi4vYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eS5qcyc7XHJcbmltcG9ydCBCQVNFQ29uc3RhbnRzIGZyb20gJy4uL0JBU0VDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgUG9pbnRDaGFyZ2VNb2RlbCBmcm9tICcuLi9tb2RlbC9Qb2ludENoYXJnZU1vZGVsLmpzJztcclxuaW1wb3J0IE1pbnVzQ2hhcmdlTm9kZSBmcm9tICcuL01pbnVzQ2hhcmdlTm9kZS5qcyc7XHJcblxyXG4vLyBOb2RlIGNvbnZlcnRlZCB0byBpbWFnZSB0byBiZSBkcmF3biBpbiBjYW52YXMgLSBzY2FsZSB1cCB0aGUgbm9kZSwgdGhlbiBiYWNrIGRvd24gd2hlbiBjb252ZXJ0aW5nIHRvIGltYWdlIHNvIGl0XHJcbi8vIGRvZXNuJ3QgbG9vayBmdXp6eVxyXG5jb25zdCBzY2FsZSA9IDMuMDtcclxubGV0IGNoYXJnZU5vZGUgPSBudWxsO1xyXG5cclxuLy8gVGhpcyBpcyB0byBwcmV2ZW50IGFuIGluc3RydW1lbnRlZCBwaGV0LWlvIGluc3RhbmNlIGZyb20gYmVpbmcgY3JlYXRlZCBvdXRzaWRlIG9mIGEgY29uc3RydWN0b3IsXHJcbi8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby13cmFwcGVycy9pc3N1ZXMvOTdcclxuY29uc3QgZ2V0Q2hhcmdlTm9kZSA9ICgpID0+IHtcclxuICBpZiAoICFjaGFyZ2VOb2RlICkge1xyXG4gICAgY2hhcmdlTm9kZSA9IG5ldyBNaW51c0NoYXJnZU5vZGUoIG5ldyBWZWN0b3IyKCAwLCAwICksIHtcclxuICAgICAgc2NhbGU6IHNjYWxlXHJcbiAgICB9ICk7XHJcbiAgfVxyXG4gIHJldHVybiBjaGFyZ2VOb2RlO1xyXG59O1xyXG5cclxuY2xhc3MgTWludXNDaGFyZ2VzQ2FudmFzTm9kZSBleHRlbmRzIENhbnZhc05vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gd2FsbFggLSB4IHBvc2l0aW9uIG9mIHRoZSB3YWxsLCB0byBvZmZzZXQgY2hhcmdlIHBvc2l0aW9uc1xyXG4gICAqIEBwYXJhbSB7Qm91bmRzMn0gd2FsbEJvdW5kcyAtIGJvdW5kcyBvZiB0aGUgd2FsbCBpbiB2aWV3IGNvb3JkaW5hdGVzLCBwYXNzZWQgYXMgY2FudmFzQm91bmRzXHJcbiAgICogQHBhcmFtIHtBcnJheS48TW92YWJsZVBvaW50Q2hhcmdlTW9kZWw+fSBjaGFyZ2VzXHJcbiAgICogQHBhcmFtIHtbb2JqZWN0XX0gb3B0aW9uc1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB3YWxsWCwgd2FsbEJvdW5kcywgY2hhcmdlcywgb3B0aW9ucyApIHtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gICAgdGhpcy5zZXRDYW52YXNCb3VuZHMoIHdhbGxCb3VuZHMgKTtcclxuICAgIHRoaXMuaW52YWxpZGF0ZVBhaW50KCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxNb3ZhYmxlUG9pbnRDaGFyZ2VOb2RlPn1cclxuICAgIHRoaXMuY2hhcmdlcyA9IGNoYXJnZXM7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn1cclxuICAgIHRoaXMud2FsbFggPSB3YWxsWDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIGNyZWF0ZWQgc3luY2hyb25vdXNseSBzbyB0aGF0IGl0IGNhbiBiZSBkcmF3biBpbW1lZGlhdGVseSBpbiBwYWludENhbnZhc1xyXG4gICAgdGhpcy5jaGFyZ2VJbWFnZU5vZGUgPSBnZXRDaGFyZ2VOb2RlKCkucmFzdGVyaXplZCggeyB3cmFwOiBmYWxzZSB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEcmF3IGNoYXJnZXMgYXQgdGhlaXIgY29ycmVjdCBwb3NpdGlvbnMgaW5kaWNhdGluZyBpbmR1Y2VkIGNoYXJnZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjb250ZXh0XHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHBhaW50Q2FudmFzKCBjb250ZXh0ICkge1xyXG5cclxuICAgIC8vIHdlIHNjYWxlZCB1cCB0aGUgbm9kZSBiZWZvcmUgY29udmVydGluZyB0byBpbWFnZSBzbyB0aGF0IGl0IGxvb2tzIGxlc3MgcGl4ZWxhdGVkLCBzbyBub3cgd2UgbmVlZCB0b1xyXG4gICAgLy8gc2NhbGUgaXQgYmFjayBkb3duXHJcbiAgICBjb250ZXh0LnNjYWxlKCAxIC8gc2NhbGUsIDEgLyBzY2FsZSApO1xyXG5cclxuICAgIC8vIGRyYXcgYWxsIG9mIHRoZSBjaGFyZ2VzXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNoYXJnZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGNoYXJnZSA9IHRoaXMuY2hhcmdlc1sgaSBdO1xyXG4gICAgICBjb25zdCBjaGFyZ2VQb3NpdGlvbiA9IGNoYXJnZS5wb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgICAgY29uc3QgeFBvc2l0aW9uID0gKCAoIGNoYXJnZVBvc2l0aW9uLnggLSB0aGlzLndhbGxYICsgUG9pbnRDaGFyZ2VNb2RlbC5SQURJVVMgLSBCQVNFQ29uc3RhbnRzLklNQUdFX1BBRERJTkcgKSAqIHNjYWxlICk7XHJcbiAgICAgIGNvbnN0IHlQb3NpdGlvbiA9ICggY2hhcmdlUG9zaXRpb24ueSArIFBvaW50Q2hhcmdlTW9kZWwuUkFESVVTIC0gQkFTRUNvbnN0YW50cy5JTUFHRV9QQURESU5HICkgKiBzY2FsZTtcclxuXHJcbiAgICAgIC8vIHJlbmRlciBwYXJ0aWNsZVxyXG4gICAgICBjb250ZXh0LmRyYXdJbWFnZSggdGhpcy5jaGFyZ2VJbWFnZU5vZGUuaW1hZ2UsIHhQb3NpdGlvbiwgeVBvc2l0aW9uICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5LnJlZ2lzdGVyKCAnTWludXNDaGFyZ2VzQ2FudmFzTm9kZScsIE1pbnVzQ2hhcmdlc0NhbnZhc05vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1pbnVzQ2hhcmdlc0NhbnZhc05vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsVUFBVSxRQUFRLG1DQUFtQztBQUM5RCxPQUFPQyw0QkFBNEIsTUFBTSx1Q0FBdUM7QUFDaEYsT0FBT0MsYUFBYSxNQUFNLHFCQUFxQjtBQUMvQyxPQUFPQyxnQkFBZ0IsTUFBTSw4QkFBOEI7QUFDM0QsT0FBT0MsZUFBZSxNQUFNLHNCQUFzQjs7QUFFbEQ7QUFDQTtBQUNBLE1BQU1DLEtBQUssR0FBRyxHQUFHO0FBQ2pCLElBQUlDLFVBQVUsR0FBRyxJQUFJOztBQUVyQjtBQUNBO0FBQ0EsTUFBTUMsYUFBYSxHQUFHQSxDQUFBLEtBQU07RUFDMUIsSUFBSyxDQUFDRCxVQUFVLEVBQUc7SUFDakJBLFVBQVUsR0FBRyxJQUFJRixlQUFlLENBQUUsSUFBSUwsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFBRTtNQUNyRE0sS0FBSyxFQUFFQTtJQUNULENBQUUsQ0FBQztFQUNMO0VBQ0EsT0FBT0MsVUFBVTtBQUNuQixDQUFDO0FBRUQsTUFBTUUsc0JBQXNCLFNBQVNSLFVBQVUsQ0FBQztFQUU5QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVMsV0FBV0EsQ0FBRUMsS0FBSyxFQUFFQyxVQUFVLEVBQUVDLE9BQU8sRUFBRUMsT0FBTyxFQUFHO0lBRWpELEtBQUssQ0FBRUEsT0FBUSxDQUFDO0lBQ2hCLElBQUksQ0FBQ0MsZUFBZSxDQUFFSCxVQUFXLENBQUM7SUFDbEMsSUFBSSxDQUFDSSxlQUFlLENBQUMsQ0FBQzs7SUFFdEI7SUFDQSxJQUFJLENBQUNILE9BQU8sR0FBR0EsT0FBTzs7SUFFdEI7SUFDQSxJQUFJLENBQUNGLEtBQUssR0FBR0EsS0FBSzs7SUFFbEI7SUFDQSxJQUFJLENBQUNNLGVBQWUsR0FBR1QsYUFBYSxDQUFDLENBQUMsQ0FBQ1UsVUFBVSxDQUFFO01BQUVDLElBQUksRUFBRTtJQUFNLENBQUUsQ0FBQztFQUN0RTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxPQUFPLEVBQUc7SUFFckI7SUFDQTtJQUNBQSxPQUFPLENBQUNmLEtBQUssQ0FBRSxDQUFDLEdBQUdBLEtBQUssRUFBRSxDQUFDLEdBQUdBLEtBQU0sQ0FBQzs7SUFFckM7SUFDQSxLQUFNLElBQUlnQixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDVCxPQUFPLENBQUNVLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUc7TUFDOUMsTUFBTUUsTUFBTSxHQUFHLElBQUksQ0FBQ1gsT0FBTyxDQUFFUyxDQUFDLENBQUU7TUFDaEMsTUFBTUcsY0FBYyxHQUFHRCxNQUFNLENBQUNFLGdCQUFnQixDQUFDQyxHQUFHLENBQUMsQ0FBQztNQUVwRCxNQUFNQyxTQUFTLEdBQUssQ0FBRUgsY0FBYyxDQUFDSSxDQUFDLEdBQUcsSUFBSSxDQUFDbEIsS0FBSyxHQUFHUCxnQkFBZ0IsQ0FBQzBCLE1BQU0sR0FBRzNCLGFBQWEsQ0FBQzRCLGFBQWEsSUFBS3pCLEtBQU87TUFDdkgsTUFBTTBCLFNBQVMsR0FBRyxDQUFFUCxjQUFjLENBQUNRLENBQUMsR0FBRzdCLGdCQUFnQixDQUFDMEIsTUFBTSxHQUFHM0IsYUFBYSxDQUFDNEIsYUFBYSxJQUFLekIsS0FBSzs7TUFFdEc7TUFDQWUsT0FBTyxDQUFDYSxTQUFTLENBQUUsSUFBSSxDQUFDakIsZUFBZSxDQUFDa0IsS0FBSyxFQUFFUCxTQUFTLEVBQUVJLFNBQVUsQ0FBQztJQUN2RTtFQUNGO0FBQ0Y7QUFFQTlCLDRCQUE0QixDQUFDa0MsUUFBUSxDQUFFLHdCQUF3QixFQUFFM0Isc0JBQXVCLENBQUM7QUFFekYsZUFBZUEsc0JBQXNCIn0=