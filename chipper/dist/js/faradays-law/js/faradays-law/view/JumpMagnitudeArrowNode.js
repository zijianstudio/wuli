// Copyright 2018-2022, University of Colorado Boulder

/**
 * A node that provides a visual cue for the speed of the magnet once the key is released.
 * The number of arrows displayed corresponds to the speed.
 *
 * @author Michael Barlow
 */

import { Shape } from '../../../../kite/js/imports.js';
import { HBox, Node, Path } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';

// constants
const ARROW_HEIGHT = 20; // dimensions for the arrow
const ARROW_WIDTH = 1 / 2 * Math.sqrt(3) * ARROW_HEIGHT; // for equilateral triangle
const ARROW_SPACING = 5;
const NODE_PADDING = 8;

// possible directions or the directional cues
const DIRECTION_ANGLES = {
  left: -Math.PI / 2,
  right: Math.PI / 2
};
class JumpMagnitudeArrowNode extends Node {
  /**
   * @param {String} direction
   * @param {Object} [options]
   */
  constructor(direction, options) {
    super();
    this.arrows = [];
    while (this.arrows.length < 3) {
      this.arrows.push(JumpMagnitudeArrowNode.createArrow(direction));
    }
    const arrowsContainer = new HBox({
      children: this.arrows,
      spacing: ARROW_SPACING,
      excludeInvisibleChildrenFromBounds: false
    });
    if (direction === 'left') {
      this.arrows = this.arrows.reverse();
    }
    this.addChild(arrowsContainer);

    // position the arrows
    this.setKeyPositions = nodeBounds => {
      if (direction === 'left') {
        arrowsContainer.rightCenter = nodeBounds.leftCenter.plusXY(-NODE_PADDING, 0);
      } else {
        arrowsContainer.leftCenter = nodeBounds.rightCenter.plusXY(NODE_PADDING, 0);
      }
    };
  }

  /**
   * @param {number} magnitude
   * @public
   */
  showCue(magnitude) {
    assert && assert(magnitude <= this.arrows.length);
    for (let i = 0; i < magnitude; i++) {
      this.arrows[i].visible = true;
    }
  }

  /**
   * @public
   */
  hideCue() {
    for (let i = 0; i < this.arrows.length; i++) {
      this.arrows[i].visible = false;
    }
  }

  /**
   * @param direction
   * @returns {Path}
   * @private
   */
  static createArrow(direction) {
    const arrowShape = new Shape();
    arrowShape.moveTo(ARROW_HEIGHT / 2, 0).lineTo(ARROW_HEIGHT, ARROW_WIDTH).lineTo(0, ARROW_WIDTH).close();
    const arrowIcon = new Path(arrowShape, {
      fill: 'white',
      stroke: 'black',
      lineJoin: 'bevel',
      lineCap: 'butt',
      lineWidth: 2,
      rotation: DIRECTION_ANGLES[direction]
    });
    arrowIcon.visible = false;
    return arrowIcon;
  }
}
faradaysLaw.register('JumpMagnitudeArrowNode', JumpMagnitudeArrowNode);
export default JumpMagnitudeArrowNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIkhCb3giLCJOb2RlIiwiUGF0aCIsImZhcmFkYXlzTGF3IiwiQVJST1dfSEVJR0hUIiwiQVJST1dfV0lEVEgiLCJNYXRoIiwic3FydCIsIkFSUk9XX1NQQUNJTkciLCJOT0RFX1BBRERJTkciLCJESVJFQ1RJT05fQU5HTEVTIiwibGVmdCIsIlBJIiwicmlnaHQiLCJKdW1wTWFnbml0dWRlQXJyb3dOb2RlIiwiY29uc3RydWN0b3IiLCJkaXJlY3Rpb24iLCJvcHRpb25zIiwiYXJyb3dzIiwibGVuZ3RoIiwicHVzaCIsImNyZWF0ZUFycm93IiwiYXJyb3dzQ29udGFpbmVyIiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwiZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyIsInJldmVyc2UiLCJhZGRDaGlsZCIsInNldEtleVBvc2l0aW9ucyIsIm5vZGVCb3VuZHMiLCJyaWdodENlbnRlciIsImxlZnRDZW50ZXIiLCJwbHVzWFkiLCJzaG93Q3VlIiwibWFnbml0dWRlIiwiYXNzZXJ0IiwiaSIsInZpc2libGUiLCJoaWRlQ3VlIiwiYXJyb3dTaGFwZSIsIm1vdmVUbyIsImxpbmVUbyIsImNsb3NlIiwiYXJyb3dJY29uIiwiZmlsbCIsInN0cm9rZSIsImxpbmVKb2luIiwibGluZUNhcCIsImxpbmVXaWR0aCIsInJvdGF0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJKdW1wTWFnbml0dWRlQXJyb3dOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgbm9kZSB0aGF0IHByb3ZpZGVzIGEgdmlzdWFsIGN1ZSBmb3IgdGhlIHNwZWVkIG9mIHRoZSBtYWduZXQgb25jZSB0aGUga2V5IGlzIHJlbGVhc2VkLlxyXG4gKiBUaGUgbnVtYmVyIG9mIGFycm93cyBkaXNwbGF5ZWQgY29ycmVzcG9uZHMgdG8gdGhlIHNwZWVkLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgQmFybG93XHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBOb2RlLCBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGZhcmFkYXlzTGF3IGZyb20gJy4uLy4uL2ZhcmFkYXlzTGF3LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBBUlJPV19IRUlHSFQgPSAyMDsgLy8gZGltZW5zaW9ucyBmb3IgdGhlIGFycm93XHJcbmNvbnN0IEFSUk9XX1dJRFRIID0gMSAvIDIgKiBNYXRoLnNxcnQoIDMgKSAqIEFSUk9XX0hFSUdIVDsgLy8gZm9yIGVxdWlsYXRlcmFsIHRyaWFuZ2xlXHJcbmNvbnN0IEFSUk9XX1NQQUNJTkcgPSA1O1xyXG5jb25zdCBOT0RFX1BBRERJTkcgPSA4O1xyXG5cclxuLy8gcG9zc2libGUgZGlyZWN0aW9ucyBvciB0aGUgZGlyZWN0aW9uYWwgY3Vlc1xyXG5jb25zdCBESVJFQ1RJT05fQU5HTEVTID0ge1xyXG4gIGxlZnQ6IC1NYXRoLlBJIC8gMixcclxuICByaWdodDogTWF0aC5QSSAvIDJcclxufTtcclxuXHJcbmNsYXNzIEp1bXBNYWduaXR1ZGVBcnJvd05vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRpcmVjdGlvblxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZGlyZWN0aW9uLCBvcHRpb25zICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICB0aGlzLmFycm93cyA9IFtdO1xyXG5cclxuICAgIHdoaWxlICggdGhpcy5hcnJvd3MubGVuZ3RoIDwgMyApIHtcclxuICAgICAgdGhpcy5hcnJvd3MucHVzaCggSnVtcE1hZ25pdHVkZUFycm93Tm9kZS5jcmVhdGVBcnJvdyggZGlyZWN0aW9uICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhcnJvd3NDb250YWluZXIgPSBuZXcgSEJveCgge1xyXG4gICAgICBjaGlsZHJlbjogdGhpcy5hcnJvd3MsXHJcbiAgICAgIHNwYWNpbmc6IEFSUk9XX1NQQUNJTkcsXHJcbiAgICAgIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgaWYgKCBkaXJlY3Rpb24gPT09ICdsZWZ0JyApIHtcclxuICAgICAgdGhpcy5hcnJvd3MgPSB0aGlzLmFycm93cy5yZXZlcnNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggYXJyb3dzQ29udGFpbmVyICk7XHJcblxyXG4gICAgLy8gcG9zaXRpb24gdGhlIGFycm93c1xyXG4gICAgdGhpcy5zZXRLZXlQb3NpdGlvbnMgPSBub2RlQm91bmRzID0+IHtcclxuICAgICAgaWYgKCBkaXJlY3Rpb24gPT09ICdsZWZ0JyApIHtcclxuICAgICAgICBhcnJvd3NDb250YWluZXIucmlnaHRDZW50ZXIgPSBub2RlQm91bmRzLmxlZnRDZW50ZXIucGx1c1hZKCAtTk9ERV9QQURESU5HLCAwICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgYXJyb3dzQ29udGFpbmVyLmxlZnRDZW50ZXIgPSBub2RlQm91bmRzLnJpZ2h0Q2VudGVyLnBsdXNYWSggTk9ERV9QQURESU5HLCAwICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWFnbml0dWRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNob3dDdWUoIG1hZ25pdHVkZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hZ25pdHVkZSA8PSB0aGlzLmFycm93cy5sZW5ndGggKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG1hZ25pdHVkZTsgaSsrICkge1xyXG4gICAgICB0aGlzLmFycm93c1sgaSBdLnZpc2libGUgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGhpZGVDdWUoKSB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmFycm93cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdGhpcy5hcnJvd3NbIGkgXS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gZGlyZWN0aW9uXHJcbiAgICogQHJldHVybnMge1BhdGh9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlQXJyb3coIGRpcmVjdGlvbiApIHtcclxuICAgIGNvbnN0IGFycm93U2hhcGUgPSBuZXcgU2hhcGUoKTtcclxuICAgIGFycm93U2hhcGUubW92ZVRvKCBBUlJPV19IRUlHSFQgLyAyLCAwICkubGluZVRvKCBBUlJPV19IRUlHSFQsIEFSUk9XX1dJRFRIICkubGluZVRvKCAwLCBBUlJPV19XSURUSCApLmNsb3NlKCk7XHJcbiAgICBjb25zdCBhcnJvd0ljb24gPSBuZXcgUGF0aCggYXJyb3dTaGFwZSwge1xyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGxpbmVKb2luOiAnYmV2ZWwnLFxyXG4gICAgICBsaW5lQ2FwOiAnYnV0dCcsXHJcbiAgICAgIGxpbmVXaWR0aDogMixcclxuICAgICAgcm90YXRpb246IERJUkVDVElPTl9BTkdMRVNbIGRpcmVjdGlvbiBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgYXJyb3dJY29uLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICByZXR1cm4gYXJyb3dJY29uO1xyXG4gIH1cclxufVxyXG5cclxuZmFyYWRheXNMYXcucmVnaXN0ZXIoICdKdW1wTWFnbml0dWRlQXJyb3dOb2RlJywgSnVtcE1hZ25pdHVkZUFycm93Tm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBKdW1wTWFnbml0dWRlQXJyb3dOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDcEUsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjs7QUFFOUM7QUFDQSxNQUFNQyxZQUFZLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDekIsTUFBTUMsV0FBVyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUdDLElBQUksQ0FBQ0MsSUFBSSxDQUFFLENBQUUsQ0FBQyxHQUFHSCxZQUFZLENBQUMsQ0FBQztBQUMzRCxNQUFNSSxhQUFhLEdBQUcsQ0FBQztBQUN2QixNQUFNQyxZQUFZLEdBQUcsQ0FBQzs7QUFFdEI7QUFDQSxNQUFNQyxnQkFBZ0IsR0FBRztFQUN2QkMsSUFBSSxFQUFFLENBQUNMLElBQUksQ0FBQ00sRUFBRSxHQUFHLENBQUM7RUFDbEJDLEtBQUssRUFBRVAsSUFBSSxDQUFDTSxFQUFFLEdBQUc7QUFDbkIsQ0FBQztBQUVELE1BQU1FLHNCQUFzQixTQUFTYixJQUFJLENBQUM7RUFFeEM7QUFDRjtBQUNBO0FBQ0E7RUFDRWMsV0FBV0EsQ0FBRUMsU0FBUyxFQUFFQyxPQUFPLEVBQUc7SUFDaEMsS0FBSyxDQUFDLENBQUM7SUFFUCxJQUFJLENBQUNDLE1BQU0sR0FBRyxFQUFFO0lBRWhCLE9BQVEsSUFBSSxDQUFDQSxNQUFNLENBQUNDLE1BQU0sR0FBRyxDQUFDLEVBQUc7TUFDL0IsSUFBSSxDQUFDRCxNQUFNLENBQUNFLElBQUksQ0FBRU4sc0JBQXNCLENBQUNPLFdBQVcsQ0FBRUwsU0FBVSxDQUFFLENBQUM7SUFDckU7SUFFQSxNQUFNTSxlQUFlLEdBQUcsSUFBSXRCLElBQUksQ0FBRTtNQUNoQ3VCLFFBQVEsRUFBRSxJ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