// Copyright 2018-2022, University of Colorado Boulder

/**
 * DimensionalArrowsNode is a horizontal dimensional arrow. It looks like this, but with solid arrow heads:
 *
 * |<- - - ->|
 *
 * NOTE! This implementation is specific to Gas Properties. Since the container grows and shrinks by moving
 * its left wall, we want the arrow to grow from right to left, so that the dashes in its line remain stationary
 * as the container is resized.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Line, Node, Path } from '../../../../scenery/js/imports.js';
import gasProperties from '../../gasProperties.js';

// constants
const DEFAULT_ARROW_HEAD_DIMENSIONS = new Dimension2(8, 8);
export default class DimensionalArrowsNode extends Node {
  /**
   * @param lengthProperty - length in view coordinates
   * @param providedOptions
   */
  constructor(lengthProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      color: 'black',
      horizontalLineWidth: 2,
      horizontalLineDash: [5, 5],
      verticalLineWidth: 1,
      verticalLineLength: 12,
      arrowHeadDimensions: DEFAULT_ARROW_HEAD_DIMENSIONS,
      // NodeOptions
      pickable: false
    }, providedOptions);

    // horizontal dashed line in center
    const horizontalLine = new Line(0, 0, 1, 0, {
      stroke: options.color,
      lineWidth: options.horizontalLineWidth,
      lineDash: options.horizontalLineDash
    });

    // vertical solid line at left end
    const leftVerticalLine = new Line(0, 0, 0, options.verticalLineLength, {
      stroke: options.color,
      lineWidth: options.verticalLineWidth,
      centerY: horizontalLine.centerY
    });

    // vertical solid line at right end
    const rightVerticalLine = new Line(0, 0, 0, options.verticalLineLength, {
      stroke: options.color,
      lineWidth: options.verticalLineWidth,
      centerX: 0,
      centerY: horizontalLine.centerY
    });

    // arrow head that points left
    const leftArrowHeadShape = new Shape().polygon([new Vector2(0, 0), new Vector2(options.arrowHeadDimensions.width, -options.arrowHeadDimensions.height / 2), new Vector2(options.arrowHeadDimensions.width, options.arrowHeadDimensions.height / 2)]);
    const leftArrowHead = new Path(leftArrowHeadShape, {
      fill: options.color
    });

    // arrow head that points right
    const rightArrowHeadShape = leftArrowHeadShape.transformed(Matrix3.scaling(-1, 1));
    const rightArrowHead = new Path(rightArrowHeadShape, {
      fill: options.color,
      right: 0
    });
    options.children = [leftVerticalLine, rightVerticalLine, horizontalLine, leftArrowHead, rightArrowHead];
    super(options);

    // Make the line grow to the left, and reposition left arrow and vertical line.
    lengthProperty.link(length => {
      horizontalLine.setLine(0, 0, -length, 0);
      leftVerticalLine.centerX = -length;
      leftArrowHead.left = -length;
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
gasProperties.register('DimensionalArrowsNode', DimensionalArrowsNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiTWF0cml4MyIsIlZlY3RvcjIiLCJTaGFwZSIsIm9wdGlvbml6ZSIsIkxpbmUiLCJOb2RlIiwiUGF0aCIsImdhc1Byb3BlcnRpZXMiLCJERUZBVUxUX0FSUk9XX0hFQURfRElNRU5TSU9OUyIsIkRpbWVuc2lvbmFsQXJyb3dzTm9kZSIsImNvbnN0cnVjdG9yIiwibGVuZ3RoUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiY29sb3IiLCJob3Jpem9udGFsTGluZVdpZHRoIiwiaG9yaXpvbnRhbExpbmVEYXNoIiwidmVydGljYWxMaW5lV2lkdGgiLCJ2ZXJ0aWNhbExpbmVMZW5ndGgiLCJhcnJvd0hlYWREaW1lbnNpb25zIiwicGlja2FibGUiLCJob3Jpem9udGFsTGluZSIsInN0cm9rZSIsImxpbmVXaWR0aCIsImxpbmVEYXNoIiwibGVmdFZlcnRpY2FsTGluZSIsImNlbnRlclkiLCJyaWdodFZlcnRpY2FsTGluZSIsImNlbnRlclgiLCJsZWZ0QXJyb3dIZWFkU2hhcGUiLCJwb2x5Z29uIiwid2lkdGgiLCJoZWlnaHQiLCJsZWZ0QXJyb3dIZWFkIiwiZmlsbCIsInJpZ2h0QXJyb3dIZWFkU2hhcGUiLCJ0cmFuc2Zvcm1lZCIsInNjYWxpbmciLCJyaWdodEFycm93SGVhZCIsInJpZ2h0IiwiY2hpbGRyZW4iLCJsaW5rIiwibGVuZ3RoIiwic2V0TGluZSIsImxlZnQiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEaW1lbnNpb25hbEFycm93c05vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGltZW5zaW9uYWxBcnJvd3NOb2RlIGlzIGEgaG9yaXpvbnRhbCBkaW1lbnNpb25hbCBhcnJvdy4gSXQgbG9va3MgbGlrZSB0aGlzLCBidXQgd2l0aCBzb2xpZCBhcnJvdyBoZWFkczpcclxuICpcclxuICogfDwtIC0gLSAtPnxcclxuICpcclxuICogTk9URSEgVGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBzcGVjaWZpYyB0byBHYXMgUHJvcGVydGllcy4gU2luY2UgdGhlIGNvbnRhaW5lciBncm93cyBhbmQgc2hyaW5rcyBieSBtb3ZpbmdcclxuICogaXRzIGxlZnQgd2FsbCwgd2Ugd2FudCB0aGUgYXJyb3cgdG8gZ3JvdyBmcm9tIHJpZ2h0IHRvIGxlZnQsIHNvIHRoYXQgdGhlIGRhc2hlcyBpbiBpdHMgbGluZSByZW1haW4gc3RhdGlvbmFyeVxyXG4gKiBhcyB0aGUgY29udGFpbmVyIGlzIHJlc2l6ZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IExpbmUsIE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoLCBUQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZ2FzUHJvcGVydGllcyBmcm9tICcuLi8uLi9nYXNQcm9wZXJ0aWVzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBERUZBVUxUX0FSUk9XX0hFQURfRElNRU5TSU9OUyA9IG5ldyBEaW1lbnNpb24yKCA4LCA4ICk7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGNvbG9yPzogVENvbG9yO1xyXG4gIGhvcml6b250YWxMaW5lV2lkdGg/OiBudW1iZXI7XHJcbiAgaG9yaXpvbnRhbExpbmVEYXNoPzogbnVtYmVyW107XHJcbiAgdmVydGljYWxMaW5lV2lkdGg/OiBudW1iZXI7XHJcbiAgdmVydGljYWxMaW5lTGVuZ3RoPzogbnVtYmVyO1xyXG4gIGFycm93SGVhZERpbWVuc2lvbnM/OiBEaW1lbnNpb24yO1xyXG59O1xyXG5cclxudHlwZSBEaW1lbnNpb25hbEFycm93c05vZGVPcHRpb25zID0gU2VsZk9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaW1lbnNpb25hbEFycm93c05vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGxlbmd0aFByb3BlcnR5IC0gbGVuZ3RoIGluIHZpZXcgY29vcmRpbmF0ZXNcclxuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsZW5ndGhQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPiwgcHJvdmlkZWRPcHRpb25zOiBEaW1lbnNpb25hbEFycm93c05vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8RGltZW5zaW9uYWxBcnJvd3NOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICBjb2xvcjogJ2JsYWNrJyxcclxuICAgICAgaG9yaXpvbnRhbExpbmVXaWR0aDogMixcclxuICAgICAgaG9yaXpvbnRhbExpbmVEYXNoOiBbIDUsIDUgXSxcclxuICAgICAgdmVydGljYWxMaW5lV2lkdGg6IDEsXHJcbiAgICAgIHZlcnRpY2FsTGluZUxlbmd0aDogMTIsXHJcbiAgICAgIGFycm93SGVhZERpbWVuc2lvbnM6IERFRkFVTFRfQVJST1dfSEVBRF9ESU1FTlNJT05TLFxyXG5cclxuICAgICAgLy8gTm9kZU9wdGlvbnNcclxuICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBob3Jpem9udGFsIGRhc2hlZCBsaW5lIGluIGNlbnRlclxyXG4gICAgY29uc3QgaG9yaXpvbnRhbExpbmUgPSBuZXcgTGluZSggMCwgMCwgMSwgMCwge1xyXG4gICAgICBzdHJva2U6IG9wdGlvbnMuY29sb3IsXHJcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5ob3Jpem9udGFsTGluZVdpZHRoLFxyXG4gICAgICBsaW5lRGFzaDogb3B0aW9ucy5ob3Jpem9udGFsTGluZURhc2hcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB2ZXJ0aWNhbCBzb2xpZCBsaW5lIGF0IGxlZnQgZW5kXHJcbiAgICBjb25zdCBsZWZ0VmVydGljYWxMaW5lID0gbmV3IExpbmUoIDAsIDAsIDAsIG9wdGlvbnMudmVydGljYWxMaW5lTGVuZ3RoLCB7XHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5jb2xvcixcclxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLnZlcnRpY2FsTGluZVdpZHRoLFxyXG4gICAgICBjZW50ZXJZOiBob3Jpem9udGFsTGluZS5jZW50ZXJZXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdmVydGljYWwgc29saWQgbGluZSBhdCByaWdodCBlbmRcclxuICAgIGNvbnN0IHJpZ2h0VmVydGljYWxMaW5lID0gbmV3IExpbmUoIDAsIDAsIDAsIG9wdGlvbnMudmVydGljYWxMaW5lTGVuZ3RoLCB7XHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5jb2xvcixcclxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLnZlcnRpY2FsTGluZVdpZHRoLFxyXG4gICAgICBjZW50ZXJYOiAwLFxyXG4gICAgICBjZW50ZXJZOiBob3Jpem9udGFsTGluZS5jZW50ZXJZXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYXJyb3cgaGVhZCB0aGF0IHBvaW50cyBsZWZ0XHJcbiAgICBjb25zdCBsZWZ0QXJyb3dIZWFkU2hhcGUgPSBuZXcgU2hhcGUoKS5wb2x5Z29uKCBbXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAwLCAwICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCBvcHRpb25zLmFycm93SGVhZERpbWVuc2lvbnMud2lkdGgsIC1vcHRpb25zLmFycm93SGVhZERpbWVuc2lvbnMuaGVpZ2h0IC8gMiApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggb3B0aW9ucy5hcnJvd0hlYWREaW1lbnNpb25zLndpZHRoLCBvcHRpb25zLmFycm93SGVhZERpbWVuc2lvbnMuaGVpZ2h0IC8gMiApXHJcbiAgICBdICk7XHJcbiAgICBjb25zdCBsZWZ0QXJyb3dIZWFkID0gbmV3IFBhdGgoIGxlZnRBcnJvd0hlYWRTaGFwZSwge1xyXG4gICAgICBmaWxsOiBvcHRpb25zLmNvbG9yXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYXJyb3cgaGVhZCB0aGF0IHBvaW50cyByaWdodFxyXG4gICAgY29uc3QgcmlnaHRBcnJvd0hlYWRTaGFwZSA9IGxlZnRBcnJvd0hlYWRTaGFwZS50cmFuc2Zvcm1lZCggTWF0cml4My5zY2FsaW5nKCAtMSwgMSApICk7XHJcbiAgICBjb25zdCByaWdodEFycm93SGVhZCA9IG5ldyBQYXRoKCByaWdodEFycm93SGVhZFNoYXBlLCB7XHJcbiAgICAgIGZpbGw6IG9wdGlvbnMuY29sb3IsXHJcbiAgICAgIHJpZ2h0OiAwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgbGVmdFZlcnRpY2FsTGluZSwgcmlnaHRWZXJ0aWNhbExpbmUsIGhvcml6b250YWxMaW5lLCBsZWZ0QXJyb3dIZWFkLCByaWdodEFycm93SGVhZCBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gTWFrZSB0aGUgbGluZSBncm93IHRvIHRoZSBsZWZ0LCBhbmQgcmVwb3NpdGlvbiBsZWZ0IGFycm93IGFuZCB2ZXJ0aWNhbCBsaW5lLlxyXG4gICAgbGVuZ3RoUHJvcGVydHkubGluayggbGVuZ3RoID0+IHtcclxuICAgICAgaG9yaXpvbnRhbExpbmUuc2V0TGluZSggMCwgMCwgLWxlbmd0aCwgMCApO1xyXG4gICAgICBsZWZ0VmVydGljYWxMaW5lLmNlbnRlclggPSAtbGVuZ3RoO1xyXG4gICAgICBsZWZ0QXJyb3dIZWFkLmxlZnQgPSAtbGVuZ3RoO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmdhc1Byb3BlcnRpZXMucmVnaXN0ZXIoICdEaW1lbnNpb25hbEFycm93c05vZGUnLCBEaW1lbnNpb25hbEFycm93c05vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxTQUFTLE1BQU0sdUNBQXVDO0FBQzdELFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFlQyxJQUFJLFFBQWdCLG1DQUFtQztBQUN6RixPQUFPQyxhQUFhLE1BQU0sd0JBQXdCOztBQUVsRDtBQUNBLE1BQU1DLDZCQUE2QixHQUFHLElBQUlU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