// Copyright 2018-2022, University of Colorado Boulder

/**
 * An HBox of stack views, with logic for proper alignment and mouse/touch areas.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { DragListener, HBox, Node } from '../../../../scenery/js/imports.js';
import fractionsCommon from '../../fractionsCommon.js';
import NumberGroupStack from '../model/NumberGroupStack.js';
import NumberStack from '../model/NumberStack.js';
import ShapeGroupStack from '../model/ShapeGroupStack.js';
import ShapeStack from '../model/ShapeStack.js';
import NumberGroupStackNode from './NumberGroupStackNode.js';
import NumberStackNode from './NumberStackNode.js';
import ShapeGroupStackNode from './ShapeGroupStackNode.js';
import ShapeStackNode from './ShapeStackNode.js';
class StackNodesBox extends HBox {
  /**
   * @param {Array.<Stack>} stacks
   * @param {function} pressCallback - function( {SceneryEvent}, {Stack} ) - Called when a press is started.
   * @param {Object} [options]
   */
  constructor(stacks, pressCallback, options) {
    options = merge({
      padding: 20
    }, options);
    super({
      spacing: options.padding
    });

    // @private {Array.<StackNode>}
    this.stackNodes = stacks.map(stack => {
      if (stack instanceof NumberStack) {
        return new NumberStackNode(stack);
      } else if (stack instanceof ShapeStack) {
        return new ShapeStackNode(stack);
      } else if (stack instanceof NumberGroupStack) {
        return new NumberGroupStackNode(stack);
      } else if (stack instanceof ShapeGroupStack) {
        return new ShapeGroupStackNode(stack);
      } else {
        throw new Error('Unknown stack');
      }
    });

    // @private {Array.<function>} - For disposal
    this.lengthListeners = [];

    // @private {Array.<Node>} - We want to create custom-area targets for each stack that when clicked will activate
    // the "press" of the stack.
    this.stackTargets = this.stackNodes.map(stackNode => {
      const stackTarget = new Node({
        children: [stackNode],
        cursor: 'pointer',
        inputListeners: [DragListener.createForwardingListener(event => pressCallback(event, stackNode.stack))]
      });
      stackTarget.layoutBounds = stackNode.localToParentBounds(stackNode.layoutBounds);

      // Shouldn't be pickable when it has no elements.
      const lengthListener = length => {
        stackTarget.pickable = length === 0 ? false : null;
      };
      this.lengthListeners.push(lengthListener);
      stackNode.stack.array.lengthProperty.link(lengthListener);
      return stackTarget;
    });

    // Apply appropriate mouse/touch areas
    const maxHalfHeight = _.max(this.stackTargets.map(stackTarget => {
      return Math.max(Math.abs(stackTarget.layoutBounds.minY), Math.abs(stackTarget.layoutBounds.maxY));
    }));
    this.stackTargets.forEach(node => {
      const layoutBounds = node.layoutBounds;
      assert && assert(layoutBounds.isValid());
      const bounds = new Bounds2(-options.padding / 2 + layoutBounds.left, -maxHalfHeight, layoutBounds.right + options.padding / 2, maxHalfHeight);
      node.mouseArea = bounds;
      node.touchArea = bounds;

      // For layout, handle verticality
      node.localBounds = new Bounds2(layoutBounds.left, -maxHalfHeight, layoutBounds.right, maxHalfHeight);
    });
    this.children = this.stackTargets;
  }

  /**
   * Sets the model positions of our model objects corresponding to their displayed (view) positions.
   * @public
   *
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Node} panel
   */
  updateModelPositions(modelViewTransform, panel) {
    this.stackNodes.forEach(stackNode => {
      stackNode.stack.positionProperty.value = modelViewTransform.viewToModelPosition(stackNode.getUniqueTrailTo(panel).localToGlobalPoint(Vector2.ZERO));
    });
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.stackNodes.forEach((stackNode, index) => {
      stackNode.stack.array.lengthProperty.unlink(this.lengthListeners[index]);
      stackNode.dispose();
    });
    super.dispose();
  }
}
fractionsCommon.register('StackNodesBox', StackNodesBox);
export default StackNodesBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVmVjdG9yMiIsIm1lcmdlIiwiRHJhZ0xpc3RlbmVyIiwiSEJveCIsIk5vZGUiLCJmcmFjdGlvbnNDb21tb24iLCJOdW1iZXJHcm91cFN0YWNrIiwiTnVtYmVyU3RhY2siLCJTaGFwZUdyb3VwU3RhY2siLCJTaGFwZVN0YWNrIiwiTnVtYmVyR3JvdXBTdGFja05vZGUiLCJOdW1iZXJTdGFja05vZGUiLCJTaGFwZUdyb3VwU3RhY2tOb2RlIiwiU2hhcGVTdGFja05vZGUiLCJTdGFja05vZGVzQm94IiwiY29uc3RydWN0b3IiLCJzdGFja3MiLCJwcmVzc0NhbGxiYWNrIiwib3B0aW9ucyIsInBhZGRpbmciLCJzcGFjaW5nIiwic3RhY2tOb2RlcyIsIm1hcCIsInN0YWNrIiwiRXJyb3IiLCJsZW5ndGhMaXN0ZW5lcnMiLCJzdGFja1RhcmdldHMiLCJzdGFja05vZGUiLCJzdGFja1RhcmdldCIsImNoaWxkcmVuIiwiY3Vyc29yIiwiaW5wdXRMaXN0ZW5lcnMiLCJjcmVhdGVGb3J3YXJkaW5nTGlzdGVuZXIiLCJldmVudCIsImxheW91dEJvdW5kcyIsImxvY2FsVG9QYXJlbnRCb3VuZHMiLCJsZW5ndGhMaXN0ZW5lciIsImxlbmd0aCIsInBpY2thYmxlIiwicHVzaCIsImFycmF5IiwibGVuZ3RoUHJvcGVydHkiLCJsaW5rIiwibWF4SGFsZkhlaWdodCIsIl8iLCJtYXgiLCJNYXRoIiwiYWJzIiwibWluWSIsIm1heFkiLCJmb3JFYWNoIiwibm9kZSIsImFzc2VydCIsImlzVmFsaWQiLCJib3VuZHMiLCJsZWZ0IiwicmlnaHQiLCJtb3VzZUFyZWEiLCJ0b3VjaEFyZWEiLCJsb2NhbEJvdW5kcyIsInVwZGF0ZU1vZGVsUG9zaXRpb25zIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwicGFuZWwiLCJwb3NpdGlvblByb3BlcnR5IiwidmFsdWUiLCJ2aWV3VG9Nb2RlbFBvc2l0aW9uIiwiZ2V0VW5pcXVlVHJhaWxUbyIsImxvY2FsVG9HbG9iYWxQb2ludCIsIlpFUk8iLCJkaXNwb3NlIiwiaW5kZXgiLCJ1bmxpbmsiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN0YWNrTm9kZXNCb3guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQW4gSEJveCBvZiBzdGFjayB2aWV3cywgd2l0aCBsb2dpYyBmb3IgcHJvcGVyIGFsaWdubWVudCBhbmQgbW91c2UvdG91Y2ggYXJlYXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IERyYWdMaXN0ZW5lciwgSEJveCwgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBmcmFjdGlvbnNDb21tb24gZnJvbSAnLi4vLi4vZnJhY3Rpb25zQ29tbW9uLmpzJztcclxuaW1wb3J0IE51bWJlckdyb3VwU3RhY2sgZnJvbSAnLi4vbW9kZWwvTnVtYmVyR3JvdXBTdGFjay5qcyc7XHJcbmltcG9ydCBOdW1iZXJTdGFjayBmcm9tICcuLi9tb2RlbC9OdW1iZXJTdGFjay5qcyc7XHJcbmltcG9ydCBTaGFwZUdyb3VwU3RhY2sgZnJvbSAnLi4vbW9kZWwvU2hhcGVHcm91cFN0YWNrLmpzJztcclxuaW1wb3J0IFNoYXBlU3RhY2sgZnJvbSAnLi4vbW9kZWwvU2hhcGVTdGFjay5qcyc7XHJcbmltcG9ydCBOdW1iZXJHcm91cFN0YWNrTm9kZSBmcm9tICcuL051bWJlckdyb3VwU3RhY2tOb2RlLmpzJztcclxuaW1wb3J0IE51bWJlclN0YWNrTm9kZSBmcm9tICcuL051bWJlclN0YWNrTm9kZS5qcyc7XHJcbmltcG9ydCBTaGFwZUdyb3VwU3RhY2tOb2RlIGZyb20gJy4vU2hhcGVHcm91cFN0YWNrTm9kZS5qcyc7XHJcbmltcG9ydCBTaGFwZVN0YWNrTm9kZSBmcm9tICcuL1NoYXBlU3RhY2tOb2RlLmpzJztcclxuXHJcbmNsYXNzIFN0YWNrTm9kZXNCb3ggZXh0ZW5kcyBIQm94IHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge0FycmF5LjxTdGFjaz59IHN0YWNrc1xyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IHByZXNzQ2FsbGJhY2sgLSBmdW5jdGlvbigge1NjZW5lcnlFdmVudH0sIHtTdGFja30gKSAtIENhbGxlZCB3aGVuIGEgcHJlc3MgaXMgc3RhcnRlZC5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHN0YWNrcywgcHJlc3NDYWxsYmFjaywgb3B0aW9ucyApIHtcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBwYWRkaW5nOiAyMFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHNwYWNpbmc6IG9wdGlvbnMucGFkZGluZ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBcnJheS48U3RhY2tOb2RlPn1cclxuICAgIHRoaXMuc3RhY2tOb2RlcyA9IHN0YWNrcy5tYXAoIHN0YWNrID0+IHtcclxuICAgICAgaWYgKCBzdGFjayBpbnN0YW5jZW9mIE51bWJlclN0YWNrICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTnVtYmVyU3RhY2tOb2RlKCBzdGFjayApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBzdGFjayBpbnN0YW5jZW9mIFNoYXBlU3RhY2sgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZVN0YWNrTm9kZSggc3RhY2sgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggc3RhY2sgaW5zdGFuY2VvZiBOdW1iZXJHcm91cFN0YWNrICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTnVtYmVyR3JvdXBTdGFja05vZGUoIHN0YWNrICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHN0YWNrIGluc3RhbmNlb2YgU2hhcGVHcm91cFN0YWNrICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2hhcGVHcm91cFN0YWNrTm9kZSggc3RhY2sgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdVbmtub3duIHN0YWNrJyApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxmdW5jdGlvbj59IC0gRm9yIGRpc3Bvc2FsXHJcbiAgICB0aGlzLmxlbmd0aExpc3RlbmVycyA9IFtdO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBcnJheS48Tm9kZT59IC0gV2Ugd2FudCB0byBjcmVhdGUgY3VzdG9tLWFyZWEgdGFyZ2V0cyBmb3IgZWFjaCBzdGFjayB0aGF0IHdoZW4gY2xpY2tlZCB3aWxsIGFjdGl2YXRlXHJcbiAgICAvLyB0aGUgXCJwcmVzc1wiIG9mIHRoZSBzdGFjay5cclxuICAgIHRoaXMuc3RhY2tUYXJnZXRzID0gdGhpcy5zdGFja05vZGVzLm1hcCggc3RhY2tOb2RlID0+IHtcclxuICAgICAgY29uc3Qgc3RhY2tUYXJnZXQgPSBuZXcgTm9kZSgge1xyXG4gICAgICAgIGNoaWxkcmVuOiBbIHN0YWNrTm9kZSBdLFxyXG4gICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgIGlucHV0TGlzdGVuZXJzOiBbIERyYWdMaXN0ZW5lci5jcmVhdGVGb3J3YXJkaW5nTGlzdGVuZXIoIGV2ZW50ID0+IHByZXNzQ2FsbGJhY2soIGV2ZW50LCBzdGFja05vZGUuc3RhY2sgKSApIF1cclxuICAgICAgfSApO1xyXG4gICAgICBzdGFja1RhcmdldC5sYXlvdXRCb3VuZHMgPSBzdGFja05vZGUubG9jYWxUb1BhcmVudEJvdW5kcyggc3RhY2tOb2RlLmxheW91dEJvdW5kcyApO1xyXG5cclxuICAgICAgLy8gU2hvdWxkbid0IGJlIHBpY2thYmxlIHdoZW4gaXQgaGFzIG5vIGVsZW1lbnRzLlxyXG4gICAgICBjb25zdCBsZW5ndGhMaXN0ZW5lciA9IGxlbmd0aCA9PiB7XHJcbiAgICAgICAgc3RhY2tUYXJnZXQucGlja2FibGUgPSBsZW5ndGggPT09IDAgPyBmYWxzZSA6IG51bGw7XHJcbiAgICAgIH07XHJcbiAgICAgIHRoaXMubGVuZ3RoTGlzdGVuZXJzLnB1c2goIGxlbmd0aExpc3RlbmVyICk7XHJcbiAgICAgIHN0YWNrTm9kZS5zdGFjay5hcnJheS5sZW5ndGhQcm9wZXJ0eS5saW5rKCBsZW5ndGhMaXN0ZW5lciApO1xyXG5cclxuICAgICAgcmV0dXJuIHN0YWNrVGFyZ2V0O1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFwcGx5IGFwcHJvcHJpYXRlIG1vdXNlL3RvdWNoIGFyZWFzXHJcbiAgICBjb25zdCBtYXhIYWxmSGVpZ2h0ID0gXy5tYXgoIHRoaXMuc3RhY2tUYXJnZXRzLm1hcCggc3RhY2tUYXJnZXQgPT4ge1xyXG4gICAgICByZXR1cm4gTWF0aC5tYXgoIE1hdGguYWJzKCBzdGFja1RhcmdldC5sYXlvdXRCb3VuZHMubWluWSApLCBNYXRoLmFicyggc3RhY2tUYXJnZXQubGF5b3V0Qm91bmRzLm1heFkgKSApO1xyXG4gICAgfSApICk7XHJcbiAgICB0aGlzLnN0YWNrVGFyZ2V0cy5mb3JFYWNoKCBub2RlID0+IHtcclxuICAgICAgY29uc3QgbGF5b3V0Qm91bmRzID0gbm9kZS5sYXlvdXRCb3VuZHM7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGxheW91dEJvdW5kcy5pc1ZhbGlkKCkgKTtcclxuICAgICAgY29uc3QgYm91bmRzID0gbmV3IEJvdW5kczIoXHJcbiAgICAgICAgLW9wdGlvbnMucGFkZGluZyAvIDIgKyBsYXlvdXRCb3VuZHMubGVmdCxcclxuICAgICAgICAtbWF4SGFsZkhlaWdodCxcclxuICAgICAgICBsYXlvdXRCb3VuZHMucmlnaHQgKyBvcHRpb25zLnBhZGRpbmcgLyAyLFxyXG4gICAgICAgIG1heEhhbGZIZWlnaHRcclxuICAgICAgKTtcclxuICAgICAgbm9kZS5tb3VzZUFyZWEgPSBib3VuZHM7XHJcbiAgICAgIG5vZGUudG91Y2hBcmVhID0gYm91bmRzO1xyXG5cclxuICAgICAgLy8gRm9yIGxheW91dCwgaGFuZGxlIHZlcnRpY2FsaXR5XHJcbiAgICAgIG5vZGUubG9jYWxCb3VuZHMgPSBuZXcgQm91bmRzMiggbGF5b3V0Qm91bmRzLmxlZnQsIC1tYXhIYWxmSGVpZ2h0LCBsYXlvdXRCb3VuZHMucmlnaHQsIG1heEhhbGZIZWlnaHQgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmNoaWxkcmVuID0gdGhpcy5zdGFja1RhcmdldHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBtb2RlbCBwb3NpdGlvbnMgb2Ygb3VyIG1vZGVsIG9iamVjdHMgY29ycmVzcG9uZGluZyB0byB0aGVpciBkaXNwbGF5ZWQgKHZpZXcpIHBvc2l0aW9ucy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSB7Tm9kZX0gcGFuZWxcclxuICAgKi9cclxuICB1cGRhdGVNb2RlbFBvc2l0aW9ucyggbW9kZWxWaWV3VHJhbnNmb3JtLCBwYW5lbCApIHtcclxuICAgIHRoaXMuc3RhY2tOb2Rlcy5mb3JFYWNoKCBzdGFja05vZGUgPT4ge1xyXG4gICAgICBzdGFja05vZGUuc3RhY2sucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbFBvc2l0aW9uKFxyXG4gICAgICAgIHN0YWNrTm9kZS5nZXRVbmlxdWVUcmFpbFRvKCBwYW5lbCApLmxvY2FsVG9HbG9iYWxQb2ludCggVmVjdG9yMi5aRVJPIClcclxuICAgICAgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLnN0YWNrTm9kZXMuZm9yRWFjaCggKCBzdGFja05vZGUsIGluZGV4ICkgPT4ge1xyXG4gICAgICBzdGFja05vZGUuc3RhY2suYXJyYXkubGVuZ3RoUHJvcGVydHkudW5saW5rKCB0aGlzLmxlbmd0aExpc3RlbmVyc1sgaW5kZXggXSApO1xyXG4gICAgICBzdGFja05vZGUuZGlzcG9zZSgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmZyYWN0aW9uc0NvbW1vbi5yZWdpc3RlciggJ1N0YWNrTm9kZXNCb3gnLCBTdGFja05vZGVzQm94ICk7XHJcbmV4cG9ydCBkZWZhdWx0IFN0YWNrTm9kZXNCb3g7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxZQUFZLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM1RSxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLGdCQUFnQixNQUFNLDhCQUE4QjtBQUMzRCxPQUFPQyxXQUFXLE1BQU0seUJBQXlCO0FBQ2pELE9BQU9DLGVBQWUsTUFBTSw2QkFBNkI7QUFDekQsT0FBT0MsVUFBVSxNQUFNLHdCQUF3QjtBQUMvQyxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7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