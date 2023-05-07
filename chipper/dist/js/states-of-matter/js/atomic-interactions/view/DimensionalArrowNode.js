// Copyright 2015-2021, University of Colorado Boulder

/**
 * Arrow node for attractive, repulsive, and total forces.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowShape from '../../../../scenery-phet/js/ArrowShape.js';
import { Path } from '../../../../scenery/js/imports.js';
import statesOfMatter from '../../statesOfMatter.js';
class DimensionalArrowNode extends Path {
  /**
   * @param {number} tailX - arrowNode tail X position
   * @param {number} tailY - arrowNode tail Y position
   * @param {number} tipX - arrowNode tip X position
   * @param {number} tipY - arrowNode tip Y position
   * @param {Object} [options] that can be passed on to the underlying node
   */
  constructor(tailX, tailY, tipX, tipY, options) {
    // default options
    options = merge({
      headHeight: 10,
      headWidth: 10,
      tailWidth: 5,
      doubleHead: false,
      // true puts heads on both ends of the arrow, false puts a head at the tip
      fill: 'black',
      stroke: 'black',
      lineWidth: 1
    }, options);

    // things you're likely to mess up, add more as needed
    assert && assert(options.headWidth > options.tailWidth);
    super(new ArrowShape(tailX, tailY, tipX, tipY, options), options);

    // @private arrowNode tip and tail positions, options
    this.tailPosition = new Vector2(0, 0);
    this.tipPosition = new Vector2(0, 0);
    this.options = options;
  }

  /**
   * @param {number} tailX - tail X position
   * @param {number} tailY - tail Y position
   * @param {number} tipX - tip X position
   * @param {number} tipY - tip Y position
   * @public
   */
  setTailAndTip(tailX, tailY, tipX, tipY) {
    this.tailPosition.setXY(tailX, tailY);
    this.tipPosition.setXY(tipX, tipY);
    let tempHeadHeight;
    let tempHeadWidth;
    let tempTailWidth;
    if (this.tailPosition.distance(this.tipPosition) !== 0) {
      tempHeadHeight = this.options.headHeight;
      tempHeadWidth = this.options.headWidth;
      tempTailWidth = this.options.tailWidth;
      const length = this.tipPosition.distance(this.tailPosition);
      const fractionalHeadHeight = 0.5;
      if (length < this.options.headHeight / fractionalHeadHeight) {
        tempHeadHeight = length * fractionalHeadHeight;
        tempTailWidth = this.options.tailWidth * tempHeadHeight / this.options.headHeight;
        tempHeadWidth = this.options.headWidth * tempHeadHeight / this.options.headHeight;
      }
    }
    this.shape = new ArrowShape(tailX, tailY, tipX, tipY, {
      headHeight: tempHeadHeight,
      headWidth: tempHeadWidth,
      tailWidth: tempTailWidth
    });
  }
}
statesOfMatter.register('DimensionalArrowNode', DimensionalArrowNode);
export default DimensionalArrowNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwibWVyZ2UiLCJBcnJvd1NoYXBlIiwiUGF0aCIsInN0YXRlc09mTWF0dGVyIiwiRGltZW5zaW9uYWxBcnJvd05vZGUiLCJjb25zdHJ1Y3RvciIsInRhaWxYIiwidGFpbFkiLCJ0aXBYIiwidGlwWSIsIm9wdGlvbnMiLCJoZWFkSGVpZ2h0IiwiaGVhZFdpZHRoIiwidGFpbFdpZHRoIiwiZG91YmxlSGVhZCIsImZpbGwiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJhc3NlcnQiLCJ0YWlsUG9zaXRpb24iLCJ0aXBQb3NpdGlvbiIsInNldFRhaWxBbmRUaXAiLCJzZXRYWSIsInRlbXBIZWFkSGVpZ2h0IiwidGVtcEhlYWRXaWR0aCIsInRlbXBUYWlsV2lkdGgiLCJkaXN0YW5jZSIsImxlbmd0aCIsImZyYWN0aW9uYWxIZWFkSGVpZ2h0Iiwic2hhcGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkRpbWVuc2lvbmFsQXJyb3dOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFycm93IG5vZGUgZm9yIGF0dHJhY3RpdmUsIHJlcHVsc2l2ZSwgYW5kIHRvdGFsIGZvcmNlcy5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBDaGFuZHJhc2hla2FyIEJlbWFnb25pIChBY3R1YWwgQ29uY2VwdHMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEFycm93U2hhcGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93U2hhcGUuanMnO1xyXG5pbXBvcnQgeyBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHN0YXRlc09mTWF0dGVyIGZyb20gJy4uLy4uL3N0YXRlc09mTWF0dGVyLmpzJztcclxuXHJcbmNsYXNzIERpbWVuc2lvbmFsQXJyb3dOb2RlIGV4dGVuZHMgUGF0aCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0YWlsWCAtIGFycm93Tm9kZSB0YWlsIFggcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge251bWJlcn0gdGFpbFkgLSBhcnJvd05vZGUgdGFpbCBZIHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRpcFggLSBhcnJvd05vZGUgdGlwIFggcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge251bWJlcn0gdGlwWSAtIGFycm93Tm9kZSB0aXAgWSBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gdGhhdCBjYW4gYmUgcGFzc2VkIG9uIHRvIHRoZSB1bmRlcmx5aW5nIG5vZGVcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFpbFgsIHRhaWxZLCB0aXBYLCB0aXBZLCBvcHRpb25zICkge1xyXG5cclxuICAgIC8vIGRlZmF1bHQgb3B0aW9uc1xyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGhlYWRIZWlnaHQ6IDEwLFxyXG4gICAgICBoZWFkV2lkdGg6IDEwLFxyXG4gICAgICB0YWlsV2lkdGg6IDUsXHJcbiAgICAgIGRvdWJsZUhlYWQ6IGZhbHNlLCAvLyB0cnVlIHB1dHMgaGVhZHMgb24gYm90aCBlbmRzIG9mIHRoZSBhcnJvdywgZmFsc2UgcHV0cyBhIGhlYWQgYXQgdGhlIHRpcFxyXG4gICAgICBmaWxsOiAnYmxhY2snLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGxpbmVXaWR0aDogMVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHRoaW5ncyB5b3UncmUgbGlrZWx5IHRvIG1lc3MgdXAsIGFkZCBtb3JlIGFzIG5lZWRlZFxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5oZWFkV2lkdGggPiBvcHRpb25zLnRhaWxXaWR0aCApO1xyXG5cclxuICAgIHN1cGVyKCBuZXcgQXJyb3dTaGFwZSggdGFpbFgsIHRhaWxZLCB0aXBYLCB0aXBZLCBvcHRpb25zICksIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSBhcnJvd05vZGUgdGlwIGFuZCB0YWlsIHBvc2l0aW9ucywgb3B0aW9uc1xyXG4gICAgdGhpcy50YWlsUG9zaXRpb24gPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgdGhpcy50aXBQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRhaWxYIC0gdGFpbCBYIHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRhaWxZIC0gdGFpbCBZIHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRpcFggLSB0aXAgWCBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aXBZIC0gdGlwIFkgcG9zaXRpb25cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0VGFpbEFuZFRpcCggdGFpbFgsIHRhaWxZLCB0aXBYLCB0aXBZICkge1xyXG4gICAgdGhpcy50YWlsUG9zaXRpb24uc2V0WFkoIHRhaWxYLCB0YWlsWSApO1xyXG4gICAgdGhpcy50aXBQb3NpdGlvbi5zZXRYWSggdGlwWCwgdGlwWSApO1xyXG4gICAgbGV0IHRlbXBIZWFkSGVpZ2h0O1xyXG4gICAgbGV0IHRlbXBIZWFkV2lkdGg7XHJcbiAgICBsZXQgdGVtcFRhaWxXaWR0aDtcclxuICAgIGlmICggdGhpcy50YWlsUG9zaXRpb24uZGlzdGFuY2UoIHRoaXMudGlwUG9zaXRpb24gKSAhPT0gMCApIHtcclxuXHJcbiAgICAgIHRlbXBIZWFkSGVpZ2h0ID0gdGhpcy5vcHRpb25zLmhlYWRIZWlnaHQ7XHJcbiAgICAgIHRlbXBIZWFkV2lkdGggPSB0aGlzLm9wdGlvbnMuaGVhZFdpZHRoO1xyXG4gICAgICB0ZW1wVGFpbFdpZHRoID0gdGhpcy5vcHRpb25zLnRhaWxXaWR0aDtcclxuICAgICAgY29uc3QgbGVuZ3RoID0gdGhpcy50aXBQb3NpdGlvbi5kaXN0YW5jZSggdGhpcy50YWlsUG9zaXRpb24gKTtcclxuXHJcbiAgICAgIGNvbnN0IGZyYWN0aW9uYWxIZWFkSGVpZ2h0ID0gMC41O1xyXG4gICAgICBpZiAoIGxlbmd0aCA8IHRoaXMub3B0aW9ucy5oZWFkSGVpZ2h0IC8gZnJhY3Rpb25hbEhlYWRIZWlnaHQgKSB7XHJcbiAgICAgICAgdGVtcEhlYWRIZWlnaHQgPSBsZW5ndGggKiBmcmFjdGlvbmFsSGVhZEhlaWdodDtcclxuXHJcbiAgICAgICAgdGVtcFRhaWxXaWR0aCA9IHRoaXMub3B0aW9ucy50YWlsV2lkdGggKiB0ZW1wSGVhZEhlaWdodCAvIHRoaXMub3B0aW9ucy5oZWFkSGVpZ2h0O1xyXG4gICAgICAgIHRlbXBIZWFkV2lkdGggPSB0aGlzLm9wdGlvbnMuaGVhZFdpZHRoICogdGVtcEhlYWRIZWlnaHQgLyB0aGlzLm9wdGlvbnMuaGVhZEhlaWdodDtcclxuXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuc2hhcGUgPSBuZXcgQXJyb3dTaGFwZSggdGFpbFgsIHRhaWxZLCB0aXBYLCB0aXBZLCB7XHJcbiAgICAgIGhlYWRIZWlnaHQ6IHRlbXBIZWFkSGVpZ2h0LFxyXG4gICAgICBoZWFkV2lkdGg6IHRlbXBIZWFkV2lkdGgsXHJcbiAgICAgIHRhaWxXaWR0aDogdGVtcFRhaWxXaWR0aFxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuc3RhdGVzT2ZNYXR0ZXIucmVnaXN0ZXIoICdEaW1lbnNpb25hbEFycm93Tm9kZScsIERpbWVuc2lvbmFsQXJyb3dOb2Rl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