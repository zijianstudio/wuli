// Copyright 2016-2022, University of Colorado Boulder

/**
 * DOM drawable for Rectangle nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import Poolable from '../../../../phet-core/js/Poolable.js';
import { DOMSelfDrawable, Features, RectangleStatefulDrawable, scenery, Utils } from '../../imports.js';

// TODO: change this based on memory and performance characteristics of the platform
const keepDOMRectangleElements = true; // whether we should pool DOM elements for the DOM rendering states, or whether we should free them when possible for memory

// scratch matrix used in DOM rendering
const scratchMatrix = Matrix3.pool.fetch();
class RectangleDOMDrawable extends RectangleStatefulDrawable(DOMSelfDrawable) {
  /**
   * @param {number} renderer
   * @param {Instance} instance
   */
  constructor(renderer, instance) {
    super(renderer, instance);

    // Apply CSS needed for future CSS transforms to work properly.
    Utils.prepareForTransform(this.domElement);
  }

  /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */
  initialize(renderer, instance) {
    super.initialize(renderer, instance);

    // only create elements if we don't already have them (we pool visual states always, and depending on the platform may also pool the actual elements to minimize
    // allocation and performance costs)
    if (!this.fillElement || !this.strokeElement) {
      const fillElement = document.createElement('div');
      this.fillElement = fillElement;
      fillElement.style.display = 'block';
      fillElement.style.position = 'absolute';
      fillElement.style.left = '0';
      fillElement.style.top = '0';
      fillElement.style.pointerEvents = 'none';
      const strokeElement = document.createElement('div');
      this.strokeElement = strokeElement;
      strokeElement.style.display = 'block';
      strokeElement.style.position = 'absolute';
      strokeElement.style.left = '0';
      strokeElement.style.top = '0';
      strokeElement.style.pointerEvents = 'none';
      fillElement.appendChild(strokeElement);
    }

    // @protected {HTMLElement} - Our primary DOM element. This is exposed as part of the DOMSelfDrawable API.
    this.domElement = this.fillElement;
  }

  /**
   * Updates our DOM element so that its appearance matches our node's representation.
   * @protected
   *
   * This implements part of the DOMSelfDrawable required API for subtypes.
   */
  updateDOM() {
    const node = this.node;
    const fillElement = this.fillElement;
    const strokeElement = this.strokeElement;
    if (this.paintDirty) {
      const borderRadius = Math.min(node._cornerXRadius, node._cornerYRadius);
      const borderRadiusDirty = this.dirtyCornerXRadius || this.dirtyCornerYRadius;
      if (this.dirtyWidth) {
        fillElement.style.width = `${node._rectWidth}px`;
      }
      if (this.dirtyHeight) {
        fillElement.style.height = `${node._rectHeight}px`;
      }
      if (borderRadiusDirty) {
        fillElement.style[Features.borderRadius] = `${borderRadius}px`; // if one is zero, we are not rounded, so we do the min here
      }

      if (this.dirtyFill) {
        fillElement.style.backgroundColor = node.getCSSFill();
      }
      if (this.dirtyStroke) {
        // update stroke presence
        if (node.hasStroke()) {
          strokeElement.style.borderStyle = 'solid';
        } else {
          strokeElement.style.borderStyle = 'none';
        }
      }
      if (node.hasStroke()) {
        // since we only execute these if we have a stroke, we need to redo everything if there was no stroke previously.
        // the other option would be to update stroked information when there is no stroke (major performance loss for fill-only rectangles)
        const hadNoStrokeBefore = !this.hadStroke;
        if (hadNoStrokeBefore || this.dirtyWidth || this.dirtyLineWidth) {
          strokeElement.style.width = `${node._rectWidth - node.getLineWidth()}px`;
        }
        if (hadNoStrokeBefore || this.dirtyHeight || this.dirtyLineWidth) {
          strokeElement.style.height = `${node._rectHeight - node.getLineWidth()}px`;
        }
        if (hadNoStrokeBefore || this.dirtyLineWidth) {
          strokeElement.style.left = `${-node.getLineWidth() / 2}px`;
          strokeElement.style.top = `${-node.getLineWidth() / 2}px`;
          strokeElement.style.borderWidth = `${node.getLineWidth()}px`;
        }
        if (hadNoStrokeBefore || this.dirtyStroke) {
          strokeElement.style.borderColor = node.getSimpleCSSStroke();
        }
        if (hadNoStrokeBefore || borderRadiusDirty || this.dirtyLineWidth || this.dirtyLineOptions) {
          strokeElement.style[Features.borderRadius] = node.isRounded() || node.getLineJoin() === 'round' ? `${borderRadius + node.getLineWidth() / 2}px` : '0';
        }
      }
    }

    // shift the element vertically, postmultiplied with the entire transform.
    if (this.transformDirty || this.dirtyX || this.dirtyY) {
      scratchMatrix.set(this.getTransformMatrix());
      const translation = Matrix3.translation(node._rectX, node._rectY);
      scratchMatrix.multiplyMatrix(translation);
      translation.freeToPool();
      Utils.applyPreparedTransform(scratchMatrix, this.fillElement);
    }

    // clear all of the dirty flags
    this.setToCleanState();
    this.cleanPaintableState();
    this.transformDirty = false;
  }

  /**
   * Disposes the drawable.
   * @public
   * @override
   */
  dispose() {
    if (!keepDOMRectangleElements) {
      // clear the references
      this.fillElement = null;
      this.strokeElement = null;
      this.domElement = null;
    }
    super.dispose();
  }
}
scenery.register('RectangleDOMDrawable', RectangleDOMDrawable);
Poolable.mixInto(RectangleDOMDrawable);
export default RectangleDOMDrawable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXgzIiwiUG9vbGFibGUiLCJET01TZWxmRHJhd2FibGUiLCJGZWF0dXJlcyIsIlJlY3RhbmdsZVN0YXRlZnVsRHJhd2FibGUiLCJzY2VuZXJ5IiwiVXRpbHMiLCJrZWVwRE9NUmVjdGFuZ2xlRWxlbWVudHMiLCJzY3JhdGNoTWF0cml4IiwicG9vbCIsImZldGNoIiwiUmVjdGFuZ2xlRE9NRHJhd2FibGUiLCJjb25zdHJ1Y3RvciIsInJlbmRlcmVyIiwiaW5zdGFuY2UiLCJwcmVwYXJlRm9yVHJhbnNmb3JtIiwiZG9tRWxlbWVudCIsImluaXRpYWxpemUiLCJmaWxsRWxlbWVudCIsInN0cm9rZUVsZW1lbnQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsImRpc3BsYXkiLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJwb2ludGVyRXZlbnRzIiwiYXBwZW5kQ2hpbGQiLCJ1cGRhdGVET00iLCJub2RlIiwicGFpbnREaXJ0eSIsImJvcmRlclJhZGl1cyIsIk1hdGgiLCJtaW4iLCJfY29ybmVyWFJhZGl1cyIsIl9jb3JuZXJZUmFkaXVzIiwiYm9yZGVyUmFkaXVzRGlydHkiLCJkaXJ0eUNvcm5lclhSYWRpdXMiLCJkaXJ0eUNvcm5lcllSYWRpdXMiLCJkaXJ0eVdpZHRoIiwid2lkdGgiLCJfcmVjdFdpZHRoIiwiZGlydHlIZWlnaHQiLCJoZWlnaHQiLCJfcmVjdEhlaWdodCIsImRpcnR5RmlsbCIsImJhY2tncm91bmRDb2xvciIsImdldENTU0ZpbGwiLCJkaXJ0eVN0cm9rZSIsImhhc1N0cm9rZSIsImJvcmRlclN0eWxlIiwiaGFkTm9TdHJva2VCZWZvcmUiLCJoYWRTdHJva2UiLCJkaXJ0eUxpbmVXaWR0aCIsImdldExpbmVXaWR0aCIsImJvcmRlcldpZHRoIiwiYm9yZGVyQ29sb3IiLCJnZXRTaW1wbGVDU1NTdHJva2UiLCJkaXJ0eUxpbmVPcHRpb25zIiwiaXNSb3VuZGVkIiwiZ2V0TGluZUpvaW4iLCJ0cmFuc2Zvcm1EaXJ0eSIsImRpcnR5WCIsImRpcnR5WSIsInNldCIsImdldFRyYW5zZm9ybU1hdHJpeCIsInRyYW5zbGF0aW9uIiwiX3JlY3RYIiwiX3JlY3RZIiwibXVsdGlwbHlNYXRyaXgiLCJmcmVlVG9Qb29sIiwiYXBwbHlQcmVwYXJlZFRyYW5zZm9ybSIsInNldFRvQ2xlYW5TdGF0ZSIsImNsZWFuUGFpbnRhYmxlU3RhdGUiLCJkaXNwb3NlIiwicmVnaXN0ZXIiLCJtaXhJbnRvIl0sInNvdXJjZXMiOlsiUmVjdGFuZ2xlRE9NRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRE9NIGRyYXdhYmxlIGZvciBSZWN0YW5nbGUgbm9kZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xyXG5pbXBvcnQgeyBET01TZWxmRHJhd2FibGUsIEZlYXR1cmVzLCBSZWN0YW5nbGVTdGF0ZWZ1bERyYXdhYmxlLCBzY2VuZXJ5LCBVdGlscyB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xyXG5cclxuLy8gVE9ETzogY2hhbmdlIHRoaXMgYmFzZWQgb24gbWVtb3J5IGFuZCBwZXJmb3JtYW5jZSBjaGFyYWN0ZXJpc3RpY3Mgb2YgdGhlIHBsYXRmb3JtXHJcbmNvbnN0IGtlZXBET01SZWN0YW5nbGVFbGVtZW50cyA9IHRydWU7IC8vIHdoZXRoZXIgd2Ugc2hvdWxkIHBvb2wgRE9NIGVsZW1lbnRzIGZvciB0aGUgRE9NIHJlbmRlcmluZyBzdGF0ZXMsIG9yIHdoZXRoZXIgd2Ugc2hvdWxkIGZyZWUgdGhlbSB3aGVuIHBvc3NpYmxlIGZvciBtZW1vcnlcclxuXHJcbi8vIHNjcmF0Y2ggbWF0cml4IHVzZWQgaW4gRE9NIHJlbmRlcmluZ1xyXG5jb25zdCBzY3JhdGNoTWF0cml4ID0gTWF0cml4My5wb29sLmZldGNoKCk7XHJcblxyXG5jbGFzcyBSZWN0YW5nbGVET01EcmF3YWJsZSBleHRlbmRzIFJlY3RhbmdsZVN0YXRlZnVsRHJhd2FibGUoIERPTVNlbGZEcmF3YWJsZSApIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyZXJcclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCByZW5kZXJlciwgaW5zdGFuY2UgKSB7XHJcbiAgICBzdXBlciggcmVuZGVyZXIsIGluc3RhbmNlICk7XHJcblxyXG4gICAgLy8gQXBwbHkgQ1NTIG5lZWRlZCBmb3IgZnV0dXJlIENTUyB0cmFuc2Zvcm1zIHRvIHdvcmsgcHJvcGVybHkuXHJcbiAgICBVdGlscy5wcmVwYXJlRm9yVHJhbnNmb3JtKCB0aGlzLmRvbUVsZW1lbnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlICkge1xyXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlICk7XHJcblxyXG4gICAgLy8gb25seSBjcmVhdGUgZWxlbWVudHMgaWYgd2UgZG9uJ3QgYWxyZWFkeSBoYXZlIHRoZW0gKHdlIHBvb2wgdmlzdWFsIHN0YXRlcyBhbHdheXMsIGFuZCBkZXBlbmRpbmcgb24gdGhlIHBsYXRmb3JtIG1heSBhbHNvIHBvb2wgdGhlIGFjdHVhbCBlbGVtZW50cyB0byBtaW5pbWl6ZVxyXG4gICAgLy8gYWxsb2NhdGlvbiBhbmQgcGVyZm9ybWFuY2UgY29zdHMpXHJcbiAgICBpZiAoICF0aGlzLmZpbGxFbGVtZW50IHx8ICF0aGlzLnN0cm9rZUVsZW1lbnQgKSB7XHJcbiAgICAgIGNvbnN0IGZpbGxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcclxuICAgICAgdGhpcy5maWxsRWxlbWVudCA9IGZpbGxFbGVtZW50O1xyXG4gICAgICBmaWxsRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgZmlsbEVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgICBmaWxsRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzAnO1xyXG4gICAgICBmaWxsRWxlbWVudC5zdHlsZS50b3AgPSAnMCc7XHJcbiAgICAgIGZpbGxFbGVtZW50LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XHJcblxyXG4gICAgICBjb25zdCBzdHJva2VFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcclxuICAgICAgdGhpcy5zdHJva2VFbGVtZW50ID0gc3Ryb2tlRWxlbWVudDtcclxuICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICAgIHN0cm9rZUVsZW1lbnQuc3R5bGUubGVmdCA9ICcwJztcclxuICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS50b3AgPSAnMCc7XHJcbiAgICAgIHN0cm9rZUVsZW1lbnQuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcclxuICAgICAgZmlsbEVsZW1lbnQuYXBwZW5kQ2hpbGQoIHN0cm9rZUVsZW1lbnQgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkIHtIVE1MRWxlbWVudH0gLSBPdXIgcHJpbWFyeSBET00gZWxlbWVudC4gVGhpcyBpcyBleHBvc2VkIGFzIHBhcnQgb2YgdGhlIERPTVNlbGZEcmF3YWJsZSBBUEkuXHJcbiAgICB0aGlzLmRvbUVsZW1lbnQgPSB0aGlzLmZpbGxFbGVtZW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyBvdXIgRE9NIGVsZW1lbnQgc28gdGhhdCBpdHMgYXBwZWFyYW5jZSBtYXRjaGVzIG91ciBub2RlJ3MgcmVwcmVzZW50YXRpb24uXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqXHJcbiAgICogVGhpcyBpbXBsZW1lbnRzIHBhcnQgb2YgdGhlIERPTVNlbGZEcmF3YWJsZSByZXF1aXJlZCBBUEkgZm9yIHN1YnR5cGVzLlxyXG4gICAqL1xyXG4gIHVwZGF0ZURPTSgpIHtcclxuICAgIGNvbnN0IG5vZGUgPSB0aGlzLm5vZGU7XHJcbiAgICBjb25zdCBmaWxsRWxlbWVudCA9IHRoaXMuZmlsbEVsZW1lbnQ7XHJcbiAgICBjb25zdCBzdHJva2VFbGVtZW50ID0gdGhpcy5zdHJva2VFbGVtZW50O1xyXG5cclxuICAgIGlmICggdGhpcy5wYWludERpcnR5ICkge1xyXG4gICAgICBjb25zdCBib3JkZXJSYWRpdXMgPSBNYXRoLm1pbiggbm9kZS5fY29ybmVyWFJhZGl1cywgbm9kZS5fY29ybmVyWVJhZGl1cyApO1xyXG4gICAgICBjb25zdCBib3JkZXJSYWRpdXNEaXJ0eSA9IHRoaXMuZGlydHlDb3JuZXJYUmFkaXVzIHx8IHRoaXMuZGlydHlDb3JuZXJZUmFkaXVzO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLmRpcnR5V2lkdGggKSB7XHJcbiAgICAgICAgZmlsbEVsZW1lbnQuc3R5bGUud2lkdGggPSBgJHtub2RlLl9yZWN0V2lkdGh9cHhgO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggdGhpcy5kaXJ0eUhlaWdodCApIHtcclxuICAgICAgICBmaWxsRWxlbWVudC5zdHlsZS5oZWlnaHQgPSBgJHtub2RlLl9yZWN0SGVpZ2h0fXB4YDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGJvcmRlclJhZGl1c0RpcnR5ICkge1xyXG4gICAgICAgIGZpbGxFbGVtZW50LnN0eWxlWyBGZWF0dXJlcy5ib3JkZXJSYWRpdXMgXSA9IGAke2JvcmRlclJhZGl1c31weGA7IC8vIGlmIG9uZSBpcyB6ZXJvLCB3ZSBhcmUgbm90IHJvdW5kZWQsIHNvIHdlIGRvIHRoZSBtaW4gaGVyZVxyXG4gICAgICB9XHJcbiAgICAgIGlmICggdGhpcy5kaXJ0eUZpbGwgKSB7XHJcbiAgICAgICAgZmlsbEVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gbm9kZS5nZXRDU1NGaWxsKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggdGhpcy5kaXJ0eVN0cm9rZSApIHtcclxuICAgICAgICAvLyB1cGRhdGUgc3Ryb2tlIHByZXNlbmNlXHJcbiAgICAgICAgaWYgKCBub2RlLmhhc1N0cm9rZSgpICkge1xyXG4gICAgICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS5ib3JkZXJTdHlsZSA9ICdzb2xpZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS5ib3JkZXJTdHlsZSA9ICdub25lJztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggbm9kZS5oYXNTdHJva2UoKSApIHtcclxuICAgICAgICAvLyBzaW5jZSB3ZSBvbmx5IGV4ZWN1dGUgdGhlc2UgaWYgd2UgaGF2ZSBhIHN0cm9rZSwgd2UgbmVlZCB0byByZWRvIGV2ZXJ5dGhpbmcgaWYgdGhlcmUgd2FzIG5vIHN0cm9rZSBwcmV2aW91c2x5LlxyXG4gICAgICAgIC8vIHRoZSBvdGhlciBvcHRpb24gd291bGQgYmUgdG8gdXBkYXRlIHN0cm9rZWQgaW5mb3JtYXRpb24gd2hlbiB0aGVyZSBpcyBubyBzdHJva2UgKG1ham9yIHBlcmZvcm1hbmNlIGxvc3MgZm9yIGZpbGwtb25seSByZWN0YW5nbGVzKVxyXG4gICAgICAgIGNvbnN0IGhhZE5vU3Ryb2tlQmVmb3JlID0gIXRoaXMuaGFkU3Ryb2tlO1xyXG5cclxuICAgICAgICBpZiAoIGhhZE5vU3Ryb2tlQmVmb3JlIHx8IHRoaXMuZGlydHlXaWR0aCB8fCB0aGlzLmRpcnR5TGluZVdpZHRoICkge1xyXG4gICAgICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS53aWR0aCA9IGAke25vZGUuX3JlY3RXaWR0aCAtIG5vZGUuZ2V0TGluZVdpZHRoKCl9cHhgO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGhhZE5vU3Ryb2tlQmVmb3JlIHx8IHRoaXMuZGlydHlIZWlnaHQgfHwgdGhpcy5kaXJ0eUxpbmVXaWR0aCApIHtcclxuICAgICAgICAgIHN0cm9rZUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gYCR7bm9kZS5fcmVjdEhlaWdodCAtIG5vZGUuZ2V0TGluZVdpZHRoKCl9cHhgO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGhhZE5vU3Ryb2tlQmVmb3JlIHx8IHRoaXMuZGlydHlMaW5lV2lkdGggKSB7XHJcbiAgICAgICAgICBzdHJva2VFbGVtZW50LnN0eWxlLmxlZnQgPSBgJHstbm9kZS5nZXRMaW5lV2lkdGgoKSAvIDJ9cHhgO1xyXG4gICAgICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS50b3AgPSBgJHstbm9kZS5nZXRMaW5lV2lkdGgoKSAvIDJ9cHhgO1xyXG4gICAgICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS5ib3JkZXJXaWR0aCA9IGAke25vZGUuZ2V0TGluZVdpZHRoKCl9cHhgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCBoYWROb1N0cm9rZUJlZm9yZSB8fCB0aGlzLmRpcnR5U3Ryb2tlICkge1xyXG4gICAgICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS5ib3JkZXJDb2xvciA9IG5vZGUuZ2V0U2ltcGxlQ1NTU3Ryb2tlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIGhhZE5vU3Ryb2tlQmVmb3JlIHx8IGJvcmRlclJhZGl1c0RpcnR5IHx8IHRoaXMuZGlydHlMaW5lV2lkdGggfHwgdGhpcy5kaXJ0eUxpbmVPcHRpb25zICkge1xyXG4gICAgICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZVsgRmVhdHVyZXMuYm9yZGVyUmFkaXVzIF0gPSAoIG5vZGUuaXNSb3VuZGVkKCkgfHwgbm9kZS5nZXRMaW5lSm9pbigpID09PSAncm91bmQnICkgPyBgJHtib3JkZXJSYWRpdXMgKyBub2RlLmdldExpbmVXaWR0aCgpIC8gMn1weGAgOiAnMCc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2hpZnQgdGhlIGVsZW1lbnQgdmVydGljYWxseSwgcG9zdG11bHRpcGxpZWQgd2l0aCB0aGUgZW50aXJlIHRyYW5zZm9ybS5cclxuICAgIGlmICggdGhpcy50cmFuc2Zvcm1EaXJ0eSB8fCB0aGlzLmRpcnR5WCB8fCB0aGlzLmRpcnR5WSApIHtcclxuICAgICAgc2NyYXRjaE1hdHJpeC5zZXQoIHRoaXMuZ2V0VHJhbnNmb3JtTWF0cml4KCkgKTtcclxuICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSBNYXRyaXgzLnRyYW5zbGF0aW9uKCBub2RlLl9yZWN0WCwgbm9kZS5fcmVjdFkgKTtcclxuICAgICAgc2NyYXRjaE1hdHJpeC5tdWx0aXBseU1hdHJpeCggdHJhbnNsYXRpb24gKTtcclxuICAgICAgdHJhbnNsYXRpb24uZnJlZVRvUG9vbCgpO1xyXG4gICAgICBVdGlscy5hcHBseVByZXBhcmVkVHJhbnNmb3JtKCBzY3JhdGNoTWF0cml4LCB0aGlzLmZpbGxFbGVtZW50ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2xlYXIgYWxsIG9mIHRoZSBkaXJ0eSBmbGFnc1xyXG4gICAgdGhpcy5zZXRUb0NsZWFuU3RhdGUoKTtcclxuICAgIHRoaXMuY2xlYW5QYWludGFibGVTdGF0ZSgpO1xyXG4gICAgdGhpcy50cmFuc2Zvcm1EaXJ0eSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcG9zZXMgdGhlIGRyYXdhYmxlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgaWYgKCAha2VlcERPTVJlY3RhbmdsZUVsZW1lbnRzICkge1xyXG4gICAgICAvLyBjbGVhciB0aGUgcmVmZXJlbmNlc1xyXG4gICAgICB0aGlzLmZpbGxFbGVtZW50ID0gbnVsbDtcclxuICAgICAgdGhpcy5zdHJva2VFbGVtZW50ID0gbnVsbDtcclxuICAgICAgdGhpcy5kb21FbGVtZW50ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUmVjdGFuZ2xlRE9NRHJhd2FibGUnLCBSZWN0YW5nbGVET01EcmF3YWJsZSApO1xyXG5cclxuUG9vbGFibGUubWl4SW50byggUmVjdGFuZ2xlRE9NRHJhd2FibGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJlY3RhbmdsZURPTURyYXdhYmxlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFFBQVEsTUFBTSxzQ0FBc0M7QUFDM0QsU0FBU0MsZUFBZSxFQUFFQyxRQUFRLEVBQUVDLHlCQUF5QixFQUFFQyxPQUFPLEVBQUVDLEtBQUssUUFBUSxrQkFBa0I7O0FBRXZHO0FBQ0EsTUFBTUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLENBQUM7O0FBRXZDO0FBQ0EsTUFBTUMsYUFBYSxHQUFHUixPQUFPLENBQUNTLElBQUksQ0FBQ0MsS0FBSyxDQUFDLENBQUM7QUFFMUMsTUFBTUMsb0JBQW9CLFNBQVNQLHlCQUF5QixDQUFFRixlQUFnQixDQUFDLENBQUM7RUFDOUU7QUFDRjtBQUNBO0FBQ0E7RUFDRVUsV0FBV0EsQ0FBRUMsUUFBUSxFQUFFQyxRQUFRLEVBQUc7SUFDaEMsS0FBSyxDQUFFRCxRQUFRLEVBQUVDLFFBQVMsQ0FBQzs7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