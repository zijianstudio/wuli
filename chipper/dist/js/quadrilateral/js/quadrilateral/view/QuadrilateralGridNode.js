// Copyright 2022-2023, University of Colorado Boulder

/**
 * A grid for the play area, to make it easier to place Vertices in reproducible positions.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../quadrilateral.js';
import { Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import QuadrilateralColors from '../../QuadrilateralColors.js';
import { Shape } from '../../../../kite/js/imports.js';
import QuadrilateralQueryParameters from '../QuadrilateralQueryParameters.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';

// constants
const MAJOR_GRID_LINE_OPTIONS = {
  stroke: QuadrilateralColors.gridLinesColorProperty,
  lineWidth: 2
};
const MINOR_GRID_LINE_OPTIONS = {
  stroke: QuadrilateralColors.gridLinesColorProperty,
  lineWidth: 0.5
};
const BORDER_RECTANGLE_LINE_WIDTH = 4;
export default class QuadrilateralGridNode extends Node {
  constructor(visibleProperty, modelViewTransform) {
    super();

    // Rectangle showing available model bounds
    const boundsRectangle = new Rectangle(0, 0, 0, 0, 5, 5, {
      stroke: QuadrilateralColors.gridStrokeColorProperty,
      fill: QuadrilateralColors.gridFillColorProperty,
      lineWidth: BORDER_RECTANGLE_LINE_WIDTH
    });
    this.addChild(boundsRectangle);
    const majorGridLinePath = new Path(null, MAJOR_GRID_LINE_OPTIONS);
    const minorGridLinePath = new Path(null, MINOR_GRID_LINE_OPTIONS);
    const gridLines = new Node({
      children: [majorGridLinePath, minorGridLinePath]
    });
    this.addChild(gridLines);
    const lineShape = new Shape();

    // dilate just enough for the quadrilateral shape to never overlap the stroke
    const modelLineWidth = modelViewTransform.viewToModelDeltaX(BORDER_RECTANGLE_LINE_WIDTH);
    const dilatedBackgroundBounds = QuadrilateralConstants.MODEL_BOUNDS.dilated(modelLineWidth);

    // The grid lines are a different color so they cannot overlap the background rectangle stroke (but should
    // be flush up against it).
    const dilatedGridBounds = QuadrilateralConstants.MODEL_BOUNDS.dilated(modelLineWidth / 2);
    boundsRectangle.setRectBounds(modelViewTransform.modelToViewBounds(dilatedBackgroundBounds));
    this.drawVerticalLines(lineShape, dilatedGridBounds, QuadrilateralConstants.GRID_SPACING);
    this.drawHorizontalLines(lineShape, dilatedGridBounds, QuadrilateralConstants.GRID_SPACING);
    majorGridLinePath.shape = modelViewTransform.modelToViewShape(lineShape);
    const minorDebugShape = new Shape();
    this.drawVerticalLines(minorDebugShape, dilatedGridBounds, QuadrilateralQueryParameters.minorVertexInterval);
    this.drawHorizontalLines(minorDebugShape, dilatedGridBounds, QuadrilateralQueryParameters.minorVertexInterval);
    minorGridLinePath.shape = modelViewTransform.modelToViewShape(minorDebugShape);
    visibleProperty.link(visible => {
      gridLines.visible = visible;
    });
  }

  /**
   * Draw vertical grid lines for this grid.
   * @param shape - lines will be drawn on this shape
   * @param bounds - bounds for the grid lines
   * @param spacing
   */
  drawVerticalLines(shape, bounds, spacing) {
    // Starting at the origin draw horizontal lines up and down the bounds
    let y = 0;
    shape.moveTo(-bounds.width / 2, y).lineTo(bounds.width / 2, y);
    while (y < bounds.height / 2) {
      shape.moveTo(-bounds.width / 2, y).lineTo(bounds.width / 2, y);
      shape.moveTo(-bounds.width / 2, -y).lineTo(bounds.width / 2, -y);
      y = y + spacing;
    }
  }

  /**
   * Draw horizontal grid lines for this grid.
   * @param shape - lines will be drawn on this shape
   * @param bounds - bounds for the grid lines
   * @param spacing
   */
  drawHorizontalLines(shape, bounds, spacing) {
    // Starting at the origin draw vertical lines across the bounds
    let x = 0;
    shape.moveTo(x, -bounds.height / 2).lineTo(x, bounds.height / 2);
    while (x < bounds.width / 2) {
      shape.moveTo(x, -bounds.height / 2).lineTo(x, bounds.height / 2);
      shape.moveTo(-x, -bounds.height / 2).lineTo(-x, bounds.height / 2);
      x = x + spacing;
    }
  }
}
quadrilateral.register('QuadrilateralGridNode', QuadrilateralGridNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJxdWFkcmlsYXRlcmFsIiwiTm9kZSIsIlBhdGgiLCJSZWN0YW5nbGUiLCJRdWFkcmlsYXRlcmFsQ29sb3JzIiwiU2hhcGUiLCJRdWFkcmlsYXRlcmFsUXVlcnlQYXJhbWV0ZXJzIiwiUXVhZHJpbGF0ZXJhbENvbnN0YW50cyIsIk1BSk9SX0dSSURfTElORV9PUFRJT05TIiwic3Ryb2tlIiwiZ3JpZExpbmVzQ29sb3JQcm9wZXJ0eSIsImxpbmVXaWR0aCIsIk1JTk9SX0dSSURfTElORV9PUFRJT05TIiwiQk9SREVSX1JFQ1RBTkdMRV9MSU5FX1dJRFRIIiwiUXVhZHJpbGF0ZXJhbEdyaWROb2RlIiwiY29uc3RydWN0b3IiLCJ2aXNpYmxlUHJvcGVydHkiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJib3VuZHNSZWN0YW5nbGUiLCJncmlkU3Ryb2tlQ29sb3JQcm9wZXJ0eSIsImZpbGwiLCJncmlkRmlsbENvbG9yUHJvcGVydHkiLCJhZGRDaGlsZCIsIm1ham9yR3JpZExpbmVQYXRoIiwibWlub3JHcmlkTGluZVBhdGgiLCJncmlkTGluZXMiLCJjaGlsZHJlbiIsImxpbmVTaGFwZSIsIm1vZGVsTGluZVdpZHRoIiwidmlld1RvTW9kZWxEZWx0YVgiLCJkaWxhdGVkQmFja2dyb3VuZEJvdW5kcyIsIk1PREVMX0JPVU5EUyIsImRpbGF0ZWQiLCJkaWxhdGVkR3JpZEJvdW5kcyIsInNldFJlY3RCb3VuZHMiLCJtb2RlbFRvVmlld0JvdW5kcyIsImRyYXdWZXJ0aWNhbExpbmVzIiwiR1JJRF9TUEFDSU5HIiwiZHJhd0hvcml6b250YWxMaW5lcyIsInNoYXBlIiwibW9kZWxUb1ZpZXdTaGFwZSIsIm1pbm9yRGVidWdTaGFwZSIsIm1pbm9yVmVydGV4SW50ZXJ2YWwiLCJsaW5rIiwidmlzaWJsZSIsImJvdW5kcyIsInNwYWNpbmciLCJ5IiwibW92ZVRvIiwid2lkdGgiLCJsaW5lVG8iLCJoZWlnaHQiLCJ4IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJRdWFkcmlsYXRlcmFsR3JpZE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBncmlkIGZvciB0aGUgcGxheSBhcmVhLCB0byBtYWtlIGl0IGVhc2llciB0byBwbGFjZSBWZXJ0aWNlcyBpbiByZXByb2R1Y2libGUgcG9zaXRpb25zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgcXVhZHJpbGF0ZXJhbCBmcm9tICcuLi8uLi9xdWFkcmlsYXRlcmFsLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUGF0aCwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBRdWFkcmlsYXRlcmFsQ29sb3JzIGZyb20gJy4uLy4uL1F1YWRyaWxhdGVyYWxDb2xvcnMuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFF1YWRyaWxhdGVyYWxRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vUXVhZHJpbGF0ZXJhbFF1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBRdWFkcmlsYXRlcmFsQ29uc3RhbnRzIGZyb20gJy4uLy4uL1F1YWRyaWxhdGVyYWxDb25zdGFudHMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1BSk9SX0dSSURfTElORV9PUFRJT05TID0ge1xyXG4gIHN0cm9rZTogUXVhZHJpbGF0ZXJhbENvbG9ycy5ncmlkTGluZXNDb2xvclByb3BlcnR5LFxyXG4gIGxpbmVXaWR0aDogMlxyXG59O1xyXG5cclxuY29uc3QgTUlOT1JfR1JJRF9MSU5FX09QVElPTlMgPSB7XHJcbiAgc3Ryb2tlOiBRdWFkcmlsYXRlcmFsQ29sb3JzLmdyaWRMaW5lc0NvbG9yUHJvcGVydHksXHJcbiAgbGluZVdpZHRoOiAwLjVcclxufTtcclxuXHJcbmNvbnN0IEJPUkRFUl9SRUNUQU5HTEVfTElORV9XSURUSCA9IDQ7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRdWFkcmlsYXRlcmFsR3JpZE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHZpc2libGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sIG1vZGVsVmlld1RyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMiApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gUmVjdGFuZ2xlIHNob3dpbmcgYXZhaWxhYmxlIG1vZGVsIGJvdW5kc1xyXG4gICAgY29uc3QgYm91bmRzUmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMCwgMCwgNSwgNSwge1xyXG4gICAgICBzdHJva2U6IFF1YWRyaWxhdGVyYWxDb2xvcnMuZ3JpZFN0cm9rZUNvbG9yUHJvcGVydHksXHJcbiAgICAgIGZpbGw6IFF1YWRyaWxhdGVyYWxDb2xvcnMuZ3JpZEZpbGxDb2xvclByb3BlcnR5LFxyXG4gICAgICBsaW5lV2lkdGg6IEJPUkRFUl9SRUNUQU5HTEVfTElORV9XSURUSFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYm91bmRzUmVjdGFuZ2xlICk7XHJcblxyXG4gICAgY29uc3QgbWFqb3JHcmlkTGluZVBhdGggPSBuZXcgUGF0aCggbnVsbCwgTUFKT1JfR1JJRF9MSU5FX09QVElPTlMgKTtcclxuICAgIGNvbnN0IG1pbm9yR3JpZExpbmVQYXRoID0gbmV3IFBhdGgoIG51bGwsIE1JTk9SX0dSSURfTElORV9PUFRJT05TICk7XHJcblxyXG4gICAgY29uc3QgZ3JpZExpbmVzID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgbWFqb3JHcmlkTGluZVBhdGgsIG1pbm9yR3JpZExpbmVQYXRoIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGdyaWRMaW5lcyApO1xyXG5cclxuICAgIGNvbnN0IGxpbmVTaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG5cclxuICAgIC8vIGRpbGF0ZSBqdXN0IGVub3VnaCBmb3IgdGhlIHF1YWRyaWxhdGVyYWwgc2hhcGUgdG8gbmV2ZXIgb3ZlcmxhcCB0aGUgc3Ryb2tlXHJcbiAgICBjb25zdCBtb2RlbExpbmVXaWR0aCA9IG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbERlbHRhWCggQk9SREVSX1JFQ1RBTkdMRV9MSU5FX1dJRFRIICk7XHJcbiAgICBjb25zdCBkaWxhdGVkQmFja2dyb3VuZEJvdW5kcyA9IFF1YWRyaWxhdGVyYWxDb25zdGFudHMuTU9ERUxfQk9VTkRTLmRpbGF0ZWQoIG1vZGVsTGluZVdpZHRoICk7XHJcblxyXG4gICAgLy8gVGhlIGdyaWQgbGluZXMgYXJlIGEgZGlmZmVyZW50IGNvbG9yIHNvIHRoZXkgY2Fubm90IG92ZXJsYXAgdGhlIGJhY2tncm91bmQgcmVjdGFuZ2xlIHN0cm9rZSAoYnV0IHNob3VsZFxyXG4gICAgLy8gYmUgZmx1c2ggdXAgYWdhaW5zdCBpdCkuXHJcbiAgICBjb25zdCBkaWxhdGVkR3JpZEJvdW5kcyA9IFF1YWRyaWxhdGVyYWxDb25zdGFudHMuTU9ERUxfQk9VTkRTLmRpbGF0ZWQoIG1vZGVsTGluZVdpZHRoIC8gMiApO1xyXG5cclxuICAgIGJvdW5kc1JlY3RhbmdsZS5zZXRSZWN0Qm91bmRzKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdCb3VuZHMoIGRpbGF0ZWRCYWNrZ3JvdW5kQm91bmRzICkgKTtcclxuXHJcbiAgICB0aGlzLmRyYXdWZXJ0aWNhbExpbmVzKCBsaW5lU2hhcGUsIGRpbGF0ZWRHcmlkQm91bmRzLCBRdWFkcmlsYXRlcmFsQ29uc3RhbnRzLkdSSURfU1BBQ0lORyApO1xyXG4gICAgdGhpcy5kcmF3SG9yaXpvbnRhbExpbmVzKCBsaW5lU2hhcGUsIGRpbGF0ZWRHcmlkQm91bmRzLCBRdWFkcmlsYXRlcmFsQ29uc3RhbnRzLkdSSURfU1BBQ0lORyApO1xyXG4gICAgbWFqb3JHcmlkTGluZVBhdGguc2hhcGUgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdTaGFwZSggbGluZVNoYXBlICk7XHJcblxyXG4gICAgY29uc3QgbWlub3JEZWJ1Z1NoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICB0aGlzLmRyYXdWZXJ0aWNhbExpbmVzKCBtaW5vckRlYnVnU2hhcGUsIGRpbGF0ZWRHcmlkQm91bmRzLCBRdWFkcmlsYXRlcmFsUXVlcnlQYXJhbWV0ZXJzLm1pbm9yVmVydGV4SW50ZXJ2YWwgKTtcclxuICAgIHRoaXMuZHJhd0hvcml6b250YWxMaW5lcyggbWlub3JEZWJ1Z1NoYXBlLCBkaWxhdGVkR3JpZEJvdW5kcywgUXVhZHJpbGF0ZXJhbFF1ZXJ5UGFyYW1ldGVycy5taW5vclZlcnRleEludGVydmFsICk7XHJcbiAgICBtaW5vckdyaWRMaW5lUGF0aC5zaGFwZSA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1NoYXBlKCBtaW5vckRlYnVnU2hhcGUgKTtcclxuXHJcbiAgICB2aXNpYmxlUHJvcGVydHkubGluayggdmlzaWJsZSA9PiB7IGdyaWRMaW5lcy52aXNpYmxlID0gdmlzaWJsZTsgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRHJhdyB2ZXJ0aWNhbCBncmlkIGxpbmVzIGZvciB0aGlzIGdyaWQuXHJcbiAgICogQHBhcmFtIHNoYXBlIC0gbGluZXMgd2lsbCBiZSBkcmF3biBvbiB0aGlzIHNoYXBlXHJcbiAgICogQHBhcmFtIGJvdW5kcyAtIGJvdW5kcyBmb3IgdGhlIGdyaWQgbGluZXNcclxuICAgKiBAcGFyYW0gc3BhY2luZ1xyXG4gICAqL1xyXG4gIHByaXZhdGUgZHJhd1ZlcnRpY2FsTGluZXMoIHNoYXBlOiBTaGFwZSwgYm91bmRzOiBCb3VuZHMyLCBzcGFjaW5nOiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gU3RhcnRpbmcgYXQgdGhlIG9yaWdpbiBkcmF3IGhvcml6b250YWwgbGluZXMgdXAgYW5kIGRvd24gdGhlIGJvdW5kc1xyXG4gICAgbGV0IHkgPSAwO1xyXG4gICAgc2hhcGUubW92ZVRvKCAtYm91bmRzLndpZHRoIC8gMiwgeSApLmxpbmVUbyggYm91bmRzLndpZHRoIC8gMiwgeSApO1xyXG4gICAgd2hpbGUgKCB5IDwgYm91bmRzLmhlaWdodCAvIDIgKSB7XHJcbiAgICAgIHNoYXBlLm1vdmVUbyggLWJvdW5kcy53aWR0aCAvIDIsIHkgKS5saW5lVG8oIGJvdW5kcy53aWR0aCAvIDIsIHkgKTtcclxuICAgICAgc2hhcGUubW92ZVRvKCAtYm91bmRzLndpZHRoIC8gMiwgLXkgKS5saW5lVG8oIGJvdW5kcy53aWR0aCAvIDIsIC15ICk7XHJcbiAgICAgIHkgPSB5ICsgc3BhY2luZztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERyYXcgaG9yaXpvbnRhbCBncmlkIGxpbmVzIGZvciB0aGlzIGdyaWQuXHJcbiAgICogQHBhcmFtIHNoYXBlIC0gbGluZXMgd2lsbCBiZSBkcmF3biBvbiB0aGlzIHNoYXBlXHJcbiAgICogQHBhcmFtIGJvdW5kcyAtIGJvdW5kcyBmb3IgdGhlIGdyaWQgbGluZXNcclxuICAgKiBAcGFyYW0gc3BhY2luZ1xyXG4gICAqL1xyXG4gIHByaXZhdGUgZHJhd0hvcml6b250YWxMaW5lcyggc2hhcGU6IFNoYXBlLCBib3VuZHM6IEJvdW5kczIsIHNwYWNpbmc6IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBTdGFydGluZyBhdCB0aGUgb3JpZ2luIGRyYXcgdmVydGljYWwgbGluZXMgYWNyb3NzIHRoZSBib3VuZHNcclxuICAgIGxldCB4ID0gMDtcclxuICAgIHNoYXBlLm1vdmVUbyggeCwgLWJvdW5kcy5oZWlnaHQgLyAyICkubGluZVRvKCB4LCBib3VuZHMuaGVpZ2h0IC8gMiApO1xyXG4gICAgd2hpbGUgKCB4IDwgYm91bmRzLndpZHRoIC8gMiApIHtcclxuICAgICAgc2hhcGUubW92ZVRvKCB4LCAtYm91bmRzLmhlaWdodCAvIDIgKS5saW5lVG8oIHgsIGJvdW5kcy5oZWlnaHQgLyAyICk7XHJcbiAgICAgIHNoYXBlLm1vdmVUbyggLXgsIC1ib3VuZHMuaGVpZ2h0IC8gMiApLmxpbmVUbyggLXgsIGJvdW5kcy5oZWlnaHQgLyAyICk7XHJcbiAgICAgIHggPSB4ICsgc3BhY2luZztcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbnF1YWRyaWxhdGVyYWwucmVnaXN0ZXIoICdRdWFkcmlsYXRlcmFsR3JpZE5vZGUnLCBRdWFkcmlsYXRlcmFsR3JpZE5vZGUgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGFBQWEsTUFBTSx3QkFBd0I7QUFDbEQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFHekUsT0FBT0MsbUJBQW1CLE1BQU0sOEJBQThCO0FBRTlELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsNEJBQTRCLE1BQU0sb0NBQW9DO0FBQzdFLE9BQU9DLHNCQUFzQixNQUFNLGlDQUFpQzs7QUFFcEU7QUFDQSxNQUFNQyx1QkFBdUIsR0FBRztFQUM5QkMsTUFBTSxFQUFFTCxtQkFBbUIsQ0FBQ00sc0JBQXNCO0VBQ2xEQyxTQUFTLEVBQUU7QUFDYixDQUFDO0FBRUQsTUFBTUMsdUJBQXVCLEdBQUc7RUFDOUJILE1BQU0sRUFBRUwsbUJBQW1CLENBQUNN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