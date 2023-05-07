// Copyright 2015-2022, University of Colorado Boulder

/**
 * Graphic that depicts how the laser may be moved (in one direction).
 * It is only shown when the cursor is over the laser and is non-interactive.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import CurvedArrowShape from '../../../../scenery-phet/js/CurvedArrowShape.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
class RotationDragHandle extends Node {
  /**
   * @param modelViewTransform - Transform between model and view coordinate frames
   * @param laser - model of laser
   * @param deltaAngle - deltaAngle in radians
   * @param showDragHandlesProperty - determines whether to show arrows
   * @param notAtMax - function that determines whether the laser is already at the max angle (if at the max
   * angle then that drag handle disappears)
   * @param laserImageWidth - width of the laser
   * @param rotationArrowAngleOffset - for unknown reasons the rotation arrows are off by PI/4 on the
   *                                            intro/more-tools screen, so account for that here.
   */
  constructor(modelViewTransform, laser, deltaAngle, showDragHandlesProperty, notAtMax, laserImageWidth, rotationArrowAngleOffset) {
    super();

    // Property to help determine whether the drag handle should be shown
    const notAtMaximumProperty = new DerivedProperty([laser.emissionPointProperty, laser.pivotProperty, showDragHandlesProperty], (emissionPoint, pivot, showDragHandles) => notAtMax(laser.getAngle()) && showDragHandles);

    // Show the drag handle if the "show drag handles" is true and if the laser isn't already at the max angle.
    notAtMaximumProperty.linkAttribute(this, 'visible');

    // Add drag arrow path
    const dragArrow = new Path(null, {
      fill: '#33FF00',
      stroke: 'black'
    });
    this.addChild(dragArrow);
    const arrowHeadHeight = deltaAngle > 0 ? -7 : 7;
    const isArrowDirectionAntiClockWise = deltaAngle > 0;

    // add arrow shape
    let radius = modelViewTransform.modelToViewDeltaX(laser.getDistanceFromPivot()) + laserImageWidth * 0.85;

    // For the Prisms Screen
    if (laser.getDistanceFromPivot() < 1E-14) {
      radius = 95;
      deltaAngle *= 2;
    }
    const startAngle = -laser.getAngle();
    const endAngle = -laser.getAngle() - deltaAngle;
    const counterClockwiseDragArrow = new CurvedArrowShape(radius, startAngle, endAngle, {
      doubleHead: false,
      headWidth: 13.6,
      headHeight: arrowHeadHeight,
      tailWidth: 7.6,
      anticlockwise: isArrowDirectionAntiClockWise
    });
    dragArrow.setShape(counterClockwiseDragArrow);

    // Update the shape when the laser moves
    Multilink.multilink([laser.emissionPointProperty, showDragHandlesProperty], () => {
      if (showDragHandlesProperty.get()) {
        const dragArrowX = modelViewTransform.modelToViewX(laser.pivotProperty.value.x);
        const dragArrowY = modelViewTransform.modelToViewY(laser.pivotProperty.value.y);
        dragArrow.setRotation(-laser.getAngle() + Math.PI + rotationArrowAngleOffset);
        dragArrow.setTranslation(dragArrowX, dragArrowY);
      }
    });
  }
}
bendingLight.register('RotationDragHandle', RotationDragHandle);
export default RotationDragHandle;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJDdXJ2ZWRBcnJvd1NoYXBlIiwiTm9kZSIsIlBhdGgiLCJiZW5kaW5nTGlnaHQiLCJSb3RhdGlvbkRyYWdIYW5kbGUiLCJjb25zdHJ1Y3RvciIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImxhc2VyIiwiZGVsdGFBbmdsZSIsInNob3dEcmFnSGFuZGxlc1Byb3BlcnR5Iiwibm90QXRNYXgiLCJsYXNlckltYWdlV2lkdGgiLCJyb3RhdGlvbkFycm93QW5nbGVPZmZzZXQiLCJub3RBdE1heGltdW1Qcm9wZXJ0eSIsImVtaXNzaW9uUG9pbnRQcm9wZXJ0eSIsInBpdm90UHJvcGVydHkiLCJlbWlzc2lvblBvaW50IiwicGl2b3QiLCJzaG93RHJhZ0hhbmRsZXMiLCJnZXRBbmdsZSIsImxpbmtBdHRyaWJ1dGUiLCJkcmFnQXJyb3ciLCJmaWxsIiwic3Ryb2tlIiwiYWRkQ2hpbGQiLCJhcnJvd0hlYWRIZWlnaHQiLCJpc0Fycm93RGlyZWN0aW9uQW50aUNsb2NrV2lzZSIsInJhZGl1cyIsIm1vZGVsVG9WaWV3RGVsdGFYIiwiZ2V0RGlzdGFuY2VGcm9tUGl2b3QiLCJzdGFydEFuZ2xlIiwiZW5kQW5nbGUiLCJjb3VudGVyQ2xvY2t3aXNlRHJhZ0Fycm93IiwiZG91YmxlSGVhZCIsImhlYWRXaWR0aCIsImhlYWRIZWlnaHQiLCJ0YWlsV2lkdGgiLCJhbnRpY2xvY2t3aXNlIiwic2V0U2hhcGUiLCJtdWx0aWxpbmsiLCJnZXQiLCJkcmFnQXJyb3dYIiwibW9kZWxUb1ZpZXdYIiwidmFsdWUiLCJ4IiwiZHJhZ0Fycm93WSIsIm1vZGVsVG9WaWV3WSIsInkiLCJzZXRSb3RhdGlvbiIsIk1hdGgiLCJQSSIsInNldFRyYW5zbGF0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJSb3RhdGlvbkRyYWdIYW5kbGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR3JhcGhpYyB0aGF0IGRlcGljdHMgaG93IHRoZSBsYXNlciBtYXkgYmUgbW92ZWQgKGluIG9uZSBkaXJlY3Rpb24pLlxyXG4gKiBJdCBpcyBvbmx5IHNob3duIHdoZW4gdGhlIGN1cnNvciBpcyBvdmVyIHRoZSBsYXNlciBhbmQgaXMgbm9uLWludGVyYWN0aXZlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENoYW5kcmFzaGVrYXIgQmVtYWdvbmkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgQ3VydmVkQXJyb3dTaGFwZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQ3VydmVkQXJyb3dTaGFwZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYmVuZGluZ0xpZ2h0IGZyb20gJy4uLy4uL2JlbmRpbmdMaWdodC5qcyc7XHJcbmltcG9ydCBMYXNlciBmcm9tICcuLi9tb2RlbC9MYXNlci5qcyc7XHJcblxyXG5jbGFzcyBSb3RhdGlvbkRyYWdIYW5kbGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIG1vZGVsVmlld1RyYW5zZm9ybSAtIFRyYW5zZm9ybSBiZXR3ZWVuIG1vZGVsIGFuZCB2aWV3IGNvb3JkaW5hdGUgZnJhbWVzXHJcbiAgICogQHBhcmFtIGxhc2VyIC0gbW9kZWwgb2YgbGFzZXJcclxuICAgKiBAcGFyYW0gZGVsdGFBbmdsZSAtIGRlbHRhQW5nbGUgaW4gcmFkaWFuc1xyXG4gICAqIEBwYXJhbSBzaG93RHJhZ0hhbmRsZXNQcm9wZXJ0eSAtIGRldGVybWluZXMgd2hldGhlciB0byBzaG93IGFycm93c1xyXG4gICAqIEBwYXJhbSBub3RBdE1heCAtIGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBsYXNlciBpcyBhbHJlYWR5IGF0IHRoZSBtYXggYW5nbGUgKGlmIGF0IHRoZSBtYXhcclxuICAgKiBhbmdsZSB0aGVuIHRoYXQgZHJhZyBoYW5kbGUgZGlzYXBwZWFycylcclxuICAgKiBAcGFyYW0gbGFzZXJJbWFnZVdpZHRoIC0gd2lkdGggb2YgdGhlIGxhc2VyXHJcbiAgICogQHBhcmFtIHJvdGF0aW9uQXJyb3dBbmdsZU9mZnNldCAtIGZvciB1bmtub3duIHJlYXNvbnMgdGhlIHJvdGF0aW9uIGFycm93cyBhcmUgb2ZmIGJ5IFBJLzQgb24gdGhlXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludHJvL21vcmUtdG9vbHMgc2NyZWVuLCBzbyBhY2NvdW50IGZvciB0aGF0IGhlcmUuXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsIGxhc2VyOiBMYXNlciwgZGVsdGFBbmdsZTogbnVtYmVyLCBzaG93RHJhZ0hhbmRsZXNQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sIG5vdEF0TWF4OiAoIG46IG51bWJlciApID0+IGJvb2xlYW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBsYXNlckltYWdlV2lkdGg6IG51bWJlciwgcm90YXRpb25BcnJvd0FuZ2xlT2Zmc2V0OiBudW1iZXIgKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBQcm9wZXJ0eSB0byBoZWxwIGRldGVybWluZSB3aGV0aGVyIHRoZSBkcmFnIGhhbmRsZSBzaG91bGQgYmUgc2hvd25cclxuICAgIGNvbnN0IG5vdEF0TWF4aW11bVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggW1xyXG4gICAgICAgIGxhc2VyLmVtaXNzaW9uUG9pbnRQcm9wZXJ0eSxcclxuICAgICAgICBsYXNlci5waXZvdFByb3BlcnR5LFxyXG4gICAgICAgIHNob3dEcmFnSGFuZGxlc1Byb3BlcnR5XHJcbiAgICAgIF0sXHJcbiAgICAgICggZW1pc3Npb25Qb2ludCwgcGl2b3QsIHNob3dEcmFnSGFuZGxlcyApID0+IG5vdEF0TWF4KCBsYXNlci5nZXRBbmdsZSgpICkgJiYgc2hvd0RyYWdIYW5kbGVzXHJcbiAgICApO1xyXG5cclxuICAgIC8vIFNob3cgdGhlIGRyYWcgaGFuZGxlIGlmIHRoZSBcInNob3cgZHJhZyBoYW5kbGVzXCIgaXMgdHJ1ZSBhbmQgaWYgdGhlIGxhc2VyIGlzbid0IGFscmVhZHkgYXQgdGhlIG1heCBhbmdsZS5cclxuICAgIG5vdEF0TWF4aW11bVByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHRoaXMsICd2aXNpYmxlJyApO1xyXG5cclxuICAgIC8vIEFkZCBkcmFnIGFycm93IHBhdGhcclxuICAgIGNvbnN0IGRyYWdBcnJvdyA9IG5ldyBQYXRoKCBudWxsLCB7IGZpbGw6ICcjMzNGRjAwJywgc3Ryb2tlOiAnYmxhY2snIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGRyYWdBcnJvdyApO1xyXG4gICAgY29uc3QgYXJyb3dIZWFkSGVpZ2h0ID0gZGVsdGFBbmdsZSA+IDAgPyAtNyA6IDc7XHJcbiAgICBjb25zdCBpc0Fycm93RGlyZWN0aW9uQW50aUNsb2NrV2lzZSA9IGRlbHRhQW5nbGUgPiAwO1xyXG5cclxuICAgIC8vIGFkZCBhcnJvdyBzaGFwZVxyXG4gICAgbGV0IHJhZGl1cyA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWCggbGFzZXIuZ2V0RGlzdGFuY2VGcm9tUGl2b3QoKSApICsgbGFzZXJJbWFnZVdpZHRoICogMC44NTtcclxuXHJcbiAgICAvLyBGb3IgdGhlIFByaXNtcyBTY3JlZW5cclxuICAgIGlmICggbGFzZXIuZ2V0RGlzdGFuY2VGcm9tUGl2b3QoKSA8IDFFLTE0ICkge1xyXG4gICAgICByYWRpdXMgPSA5NTtcclxuICAgICAgZGVsdGFBbmdsZSAqPSAyO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN0YXJ0QW5nbGUgPSAtbGFzZXIuZ2V0QW5nbGUoKTtcclxuICAgIGNvbnN0IGVuZEFuZ2xlID0gLWxhc2VyLmdldEFuZ2xlKCkgLSBkZWx0YUFuZ2xlO1xyXG4gICAgY29uc3QgY291bnRlckNsb2Nrd2lzZURyYWdBcnJvdyA9IG5ldyBDdXJ2ZWRBcnJvd1NoYXBlKCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCB7XHJcbiAgICAgIGRvdWJsZUhlYWQ6IGZhbHNlLFxyXG4gICAgICBoZWFkV2lkdGg6IDEzLjYsXHJcbiAgICAgIGhlYWRIZWlnaHQ6IGFycm93SGVhZEhlaWdodCxcclxuICAgICAgdGFpbFdpZHRoOiA3LjYsXHJcbiAgICAgIGFudGljbG9ja3dpc2U6IGlzQXJyb3dEaXJlY3Rpb25BbnRpQ2xvY2tXaXNlXHJcbiAgICB9ICk7XHJcbiAgICBkcmFnQXJyb3cuc2V0U2hhcGUoIGNvdW50ZXJDbG9ja3dpc2VEcmFnQXJyb3cgKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHNoYXBlIHdoZW4gdGhlIGxhc2VyIG1vdmVzXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIGxhc2VyLmVtaXNzaW9uUG9pbnRQcm9wZXJ0eSwgc2hvd0RyYWdIYW5kbGVzUHJvcGVydHkgXSwgKCkgPT4ge1xyXG4gICAgICBpZiAoIHNob3dEcmFnSGFuZGxlc1Byb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgIGNvbnN0IGRyYWdBcnJvd1ggPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBsYXNlci5waXZvdFByb3BlcnR5LnZhbHVlLnggKTtcclxuICAgICAgICBjb25zdCBkcmFnQXJyb3dZID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggbGFzZXIucGl2b3RQcm9wZXJ0eS52YWx1ZS55ICk7XHJcblxyXG4gICAgICAgIGRyYWdBcnJvdy5zZXRSb3RhdGlvbiggLWxhc2VyLmdldEFuZ2xlKCkgKyBNYXRoLlBJICsgcm90YXRpb25BcnJvd0FuZ2xlT2Zmc2V0ICk7XHJcbiAgICAgICAgZHJhZ0Fycm93LnNldFRyYW5zbGF0aW9uKCBkcmFnQXJyb3dYLCBkcmFnQXJyb3dZICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmJlbmRpbmdMaWdodC5yZWdpc3RlciggJ1JvdGF0aW9uRHJhZ0hhbmRsZScsIFJvdGF0aW9uRHJhZ0hhbmRsZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUm90YXRpb25EcmFnSGFuZGxlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBR3hELE9BQU9DLGdCQUFnQixNQUFNLGlEQUFpRDtBQUM5RSxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDOUQsT0FBT0MsWUFBWSxNQUFNLHVCQUF1QjtBQUdoRCxNQUFNQyxrQkFBa0IsU0FBU0gsSUFBSSxDQUFDO0VBRXBDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0ksV0FBV0EsQ0FBRUMsa0JBQXVDLEVBQUVDLEtBQVksRUFBRUMsVUFBa0IsRUFBRUMsdUJBQTBDLEVBQUVDLFFBQWtDLEVBQ3pKQyxlQUF1QixFQUFF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