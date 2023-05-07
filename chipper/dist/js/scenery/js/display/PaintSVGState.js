// Copyright 2016-2021, University of Colorado Boulder

/**
 * Handles SVG <defs> and fill/stroke style for SVG elements (by composition, not a trait or for inheritance).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { scenery } from '../imports.js';
class PaintSVGState {
  constructor() {
    this.initialize();
  }

  /**
   * Initializes the state
   * @public
   */
  initialize() {
    // @public {SVGBlock|null}
    this.svgBlock = null;

    // @public {string} fill/stroke style fragments that are currently used
    this.fillStyle = 'none';
    this.strokeStyle = 'none';

    // @public {PaintDef} - current reference-counted fill/stroke paints (gradients and fills) that will need to be
    // released on changes or disposal
    this.fillPaint = null;
    this.strokePaint = null;

    // these are used by the actual SVG element
    this.updateBaseStyle(); // the main style CSS
    this.strokeDetailStyle = ''; // width/dash/cap/join CSS
  }

  /**
   * Disposes the PaintSVGState, releasing listeners as needed.
   * @public
   */
  dispose() {
    // be cautious, release references
    this.releaseFillPaint();
    this.releaseStrokePaint();
  }

  /**
   * @private
   */
  releaseFillPaint() {
    if (this.fillPaint) {
      this.svgBlock.decrementPaint(this.fillPaint);
      this.fillPaint = null;
    }
  }

  /**
   * @private
   */
  releaseStrokePaint() {
    if (this.strokePaint) {
      this.svgBlock.decrementPaint(this.strokePaint);
      this.strokePaint = null;
    }
  }

  /**
   * Called when the fill needs to be updated, with the latest defs SVG block
   * @public
   *
   * @param {SVGBlock} svgBlock
   * @param {null|string|Color|LinearGradient|RadialGradient|Pattern} fill
   */
  updateFill(svgBlock, fill) {
    assert && assert(this.svgBlock === svgBlock);

    // NOTE: If fill.isPaint === true, this should be different if we switched to a different SVG block.
    const fillStyle = paintToSVGStyle(fill, svgBlock);

    // If our fill paint reference changed
    if (fill !== this.fillPaint) {
      // release the old reference
      this.releaseFillPaint();

      // only store a new reference if our new fill is a paint
      if (fill && fill.isPaint) {
        this.fillPaint = fill;
        svgBlock.incrementPaint(fill);
      }
    }

    // If we need to update the SVG style of our fill
    if (fillStyle !== this.fillStyle) {
      this.fillStyle = fillStyle;
      this.updateBaseStyle();
    }
  }

  /**
   * Called when the stroke needs to be updated, with the latest defs SVG block
   * @public
   *
   * @param {SVGBlock} svgBlock
   * @param {null|string|Color|LinearGradient|RadialGradient|Pattern} fill
   */
  updateStroke(svgBlock, stroke) {
    assert && assert(this.svgBlock === svgBlock);

    // NOTE: If stroke.isPaint === true, this should be different if we switched to a different SVG block.
    const strokeStyle = paintToSVGStyle(stroke, svgBlock);

    // If our stroke paint reference changed
    if (stroke !== this.strokePaint) {
      // release the old reference
      this.releaseStrokePaint();

      // only store a new reference if our new stroke is a paint
      if (stroke && stroke.isPaint) {
        this.strokePaint = stroke;
        svgBlock.incrementPaint(stroke);
      }
    }

    // If we need to update the SVG style of our stroke
    if (strokeStyle !== this.strokeStyle) {
      this.strokeStyle = strokeStyle;
      this.updateBaseStyle();
    }
  }

  /**
   * @private
   */
  updateBaseStyle() {
    this.baseStyle = `fill: ${this.fillStyle}; stroke: ${this.strokeStyle};`;
  }

  /**
   * @private
   *
   * @param {Node} node
   */
  updateStrokeDetailStyle(node) {
    let strokeDetailStyle = '';
    const lineWidth = node.getLineWidth();
    if (lineWidth !== 1) {
      strokeDetailStyle += `stroke-width: ${lineWidth};`;
    }
    const lineCap = node.getLineCap();
    if (lineCap !== 'butt') {
      strokeDetailStyle += `stroke-linecap: ${lineCap};`;
    }
    const lineJoin = node.getLineJoin();
    if (lineJoin !== 'miter') {
      strokeDetailStyle += `stroke-linejoin: ${lineJoin};`;
    }
    const miterLimit = node.getMiterLimit();
    strokeDetailStyle += `stroke-miterlimit: ${miterLimit};`;
    if (node.hasLineDash()) {
      strokeDetailStyle += `stroke-dasharray: ${node.getLineDash().join(',')};`;
      strokeDetailStyle += `stroke-dashoffset: ${node.getLineDashOffset()};`;
    }
    this.strokeDetailStyle = strokeDetailStyle;
  }

  /**
   * Called when the defs SVG block is switched (our SVG element was moved to another SVG top-level context)
   * @public
   *
   * @param {SVGBlock} svgBlock
   */
  updateSVGBlock(svgBlock) {
    // remove paints from the old svgBlock
    const oldSvgBlock = this.svgBlock;
    if (oldSvgBlock) {
      if (this.fillPaint) {
        oldSvgBlock.decrementPaint(this.fillPaint);
      }
      if (this.strokePaint) {
        oldSvgBlock.decrementPaint(this.strokePaint);
      }
    }
    this.svgBlock = svgBlock;

    // add paints to the new svgBlock
    if (this.fillPaint) {
      svgBlock.incrementPaint(this.fillPaint);
    }
    if (this.strokePaint) {
      svgBlock.incrementPaint(this.strokePaint);
    }
  }
}

/**
 * Returns the SVG style string used to represent a paint.
 *
 * @param {null|string|Color|LinearGradient|RadialGradient|Pattern} paint
 * @param {SVGBlock} svgBlock
 */
function paintToSVGStyle(paint, svgBlock) {
  if (!paint) {
    // no paint
    return 'none';
  } else if (paint.toCSS) {
    // Color object paint
    return paint.toCSS();
  } else if (paint.isPaint) {
    // reference the SVG definition with a URL
    return `url(#${paint.id}-${svgBlock ? svgBlock.id : 'noblock'})`;
  } else {
    // plain CSS color
    return paint;
  }
}
scenery.register('PaintSVGState', PaintSVGState);
export default PaintSVGState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzY2VuZXJ5IiwiUGFpbnRTVkdTdGF0ZSIsImNvbnN0cnVjdG9yIiwiaW5pdGlhbGl6ZSIsInN2Z0Jsb2NrIiwiZmlsbFN0eWxlIiwic3Ryb2tlU3R5bGUiLCJmaWxsUGFpbnQiLCJzdHJva2VQYWludCIsInVwZGF0ZUJhc2VTdHlsZSIsInN0cm9rZURldGFpbFN0eWxlIiwiZGlzcG9zZSIsInJlbGVhc2VGaWxsUGFpbnQiLCJyZWxlYXNlU3Ryb2tlUGFpbnQiLCJkZWNyZW1lbnRQYWludCIsInVwZGF0ZUZpbGwiLCJmaWxsIiwiYXNzZXJ0IiwicGFpbnRUb1NWR1N0eWxlIiwiaXNQYWludCIsImluY3JlbWVudFBhaW50IiwidXBkYXRlU3Ryb2tlIiwic3Ryb2tlIiwiYmFzZVN0eWxlIiwidXBkYXRlU3Ryb2tlRGV0YWlsU3R5bGUiLCJub2RlIiwibGluZVdpZHRoIiwiZ2V0TGluZVdpZHRoIiwibGluZUNhcCIsImdldExpbmVDYXAiLCJsaW5lSm9pbiIsImdldExpbmVKb2luIiwibWl0ZXJMaW1pdCIsImdldE1pdGVyTGltaXQiLCJoYXNMaW5lRGFzaCIsImdldExpbmVEYXNoIiwiam9pbiIsImdldExpbmVEYXNoT2Zmc2V0IiwidXBkYXRlU1ZHQmxvY2siLCJvbGRTdmdCbG9jayIsInBhaW50IiwidG9DU1MiLCJpZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGFpbnRTVkdTdGF0ZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBIYW5kbGVzIFNWRyA8ZGVmcz4gYW5kIGZpbGwvc3Ryb2tlIHN0eWxlIGZvciBTVkcgZWxlbWVudHMgKGJ5IGNvbXBvc2l0aW9uLCBub3QgYSB0cmFpdCBvciBmb3IgaW5oZXJpdGFuY2UpLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5cclxuY2xhc3MgUGFpbnRTVkdTdGF0ZSB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIHRoZSBzdGF0ZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBpbml0aWFsaXplKCkge1xyXG4gICAgLy8gQHB1YmxpYyB7U1ZHQmxvY2t8bnVsbH1cclxuICAgIHRoaXMuc3ZnQmxvY2sgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ30gZmlsbC9zdHJva2Ugc3R5bGUgZnJhZ21lbnRzIHRoYXQgYXJlIGN1cnJlbnRseSB1c2VkXHJcbiAgICB0aGlzLmZpbGxTdHlsZSA9ICdub25lJztcclxuICAgIHRoaXMuc3Ryb2tlU3R5bGUgPSAnbm9uZSc7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UGFpbnREZWZ9IC0gY3VycmVudCByZWZlcmVuY2UtY291bnRlZCBmaWxsL3N0cm9rZSBwYWludHMgKGdyYWRpZW50cyBhbmQgZmlsbHMpIHRoYXQgd2lsbCBuZWVkIHRvIGJlXHJcbiAgICAvLyByZWxlYXNlZCBvbiBjaGFuZ2VzIG9yIGRpc3Bvc2FsXHJcbiAgICB0aGlzLmZpbGxQYWludCA9IG51bGw7XHJcbiAgICB0aGlzLnN0cm9rZVBhaW50ID0gbnVsbDtcclxuXHJcbiAgICAvLyB0aGVzZSBhcmUgdXNlZCBieSB0aGUgYWN0dWFsIFNWRyBlbGVtZW50XHJcbiAgICB0aGlzLnVwZGF0ZUJhc2VTdHlsZSgpOyAvLyB0aGUgbWFpbiBzdHlsZSBDU1NcclxuICAgIHRoaXMuc3Ryb2tlRGV0YWlsU3R5bGUgPSAnJzsgLy8gd2lkdGgvZGFzaC9jYXAvam9pbiBDU1NcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc3Bvc2VzIHRoZSBQYWludFNWR1N0YXRlLCByZWxlYXNpbmcgbGlzdGVuZXJzIGFzIG5lZWRlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIC8vIGJlIGNhdXRpb3VzLCByZWxlYXNlIHJlZmVyZW5jZXNcclxuICAgIHRoaXMucmVsZWFzZUZpbGxQYWludCgpO1xyXG4gICAgdGhpcy5yZWxlYXNlU3Ryb2tlUGFpbnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcmVsZWFzZUZpbGxQYWludCgpIHtcclxuICAgIGlmICggdGhpcy5maWxsUGFpbnQgKSB7XHJcbiAgICAgIHRoaXMuc3ZnQmxvY2suZGVjcmVtZW50UGFpbnQoIHRoaXMuZmlsbFBhaW50ICk7XHJcbiAgICAgIHRoaXMuZmlsbFBhaW50ID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcmVsZWFzZVN0cm9rZVBhaW50KCkge1xyXG4gICAgaWYgKCB0aGlzLnN0cm9rZVBhaW50ICkge1xyXG4gICAgICB0aGlzLnN2Z0Jsb2NrLmRlY3JlbWVudFBhaW50KCB0aGlzLnN0cm9rZVBhaW50ICk7XHJcbiAgICAgIHRoaXMuc3Ryb2tlUGFpbnQgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGZpbGwgbmVlZHMgdG8gYmUgdXBkYXRlZCwgd2l0aCB0aGUgbGF0ZXN0IGRlZnMgU1ZHIGJsb2NrXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTVkdCbG9ja30gc3ZnQmxvY2tcclxuICAgKiBAcGFyYW0ge251bGx8c3RyaW5nfENvbG9yfExpbmVhckdyYWRpZW50fFJhZGlhbEdyYWRpZW50fFBhdHRlcm59IGZpbGxcclxuICAgKi9cclxuICB1cGRhdGVGaWxsKCBzdmdCbG9jaywgZmlsbCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuc3ZnQmxvY2sgPT09IHN2Z0Jsb2NrICk7XHJcblxyXG4gICAgLy8gTk9URTogSWYgZmlsbC5pc1BhaW50ID09PSB0cnVlLCB0aGlzIHNob3VsZCBiZSBkaWZmZXJlbnQgaWYgd2Ugc3dpdGNoZWQgdG8gYSBkaWZmZXJlbnQgU1ZHIGJsb2NrLlxyXG4gICAgY29uc3QgZmlsbFN0eWxlID0gcGFpbnRUb1NWR1N0eWxlKCBmaWxsLCBzdmdCbG9jayApO1xyXG5cclxuICAgIC8vIElmIG91ciBmaWxsIHBhaW50IHJlZmVyZW5jZSBjaGFuZ2VkXHJcbiAgICBpZiAoIGZpbGwgIT09IHRoaXMuZmlsbFBhaW50ICkge1xyXG4gICAgICAvLyByZWxlYXNlIHRoZSBvbGQgcmVmZXJlbmNlXHJcbiAgICAgIHRoaXMucmVsZWFzZUZpbGxQYWludCgpO1xyXG5cclxuICAgICAgLy8gb25seSBzdG9yZSBhIG5ldyByZWZlcmVuY2UgaWYgb3VyIG5ldyBmaWxsIGlzIGEgcGFpbnRcclxuICAgICAgaWYgKCBmaWxsICYmIGZpbGwuaXNQYWludCApIHtcclxuICAgICAgICB0aGlzLmZpbGxQYWludCA9IGZpbGw7XHJcbiAgICAgICAgc3ZnQmxvY2suaW5jcmVtZW50UGFpbnQoIGZpbGwgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSBTVkcgc3R5bGUgb2Ygb3VyIGZpbGxcclxuICAgIGlmICggZmlsbFN0eWxlICE9PSB0aGlzLmZpbGxTdHlsZSApIHtcclxuICAgICAgdGhpcy5maWxsU3R5bGUgPSBmaWxsU3R5bGU7XHJcbiAgICAgIHRoaXMudXBkYXRlQmFzZVN0eWxlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgc3Ryb2tlIG5lZWRzIHRvIGJlIHVwZGF0ZWQsIHdpdGggdGhlIGxhdGVzdCBkZWZzIFNWRyBibG9ja1xyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U1ZHQmxvY2t9IHN2Z0Jsb2NrXHJcbiAgICogQHBhcmFtIHtudWxsfHN0cmluZ3xDb2xvcnxMaW5lYXJHcmFkaWVudHxSYWRpYWxHcmFkaWVudHxQYXR0ZXJufSBmaWxsXHJcbiAgICovXHJcbiAgdXBkYXRlU3Ryb2tlKCBzdmdCbG9jaywgc3Ryb2tlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zdmdCbG9jayA9PT0gc3ZnQmxvY2sgKTtcclxuXHJcbiAgICAvLyBOT1RFOiBJZiBzdHJva2UuaXNQYWludCA9PT0gdHJ1ZSwgdGhpcyBzaG91bGQgYmUgZGlmZmVyZW50IGlmIHdlIHN3aXRjaGVkIHRvIGEgZGlmZmVyZW50IFNWRyBibG9jay5cclxuICAgIGNvbnN0IHN0cm9rZVN0eWxlID0gcGFpbnRUb1NWR1N0eWxlKCBzdHJva2UsIHN2Z0Jsb2NrICk7XHJcblxyXG4gICAgLy8gSWYgb3VyIHN0cm9rZSBwYWludCByZWZlcmVuY2UgY2hhbmdlZFxyXG4gICAgaWYgKCBzdHJva2UgIT09IHRoaXMuc3Ryb2tlUGFpbnQgKSB7XHJcbiAgICAgIC8vIHJlbGVhc2UgdGhlIG9sZCByZWZlcmVuY2VcclxuICAgICAgdGhpcy5yZWxlYXNlU3Ryb2tlUGFpbnQoKTtcclxuXHJcbiAgICAgIC8vIG9ubHkgc3RvcmUgYSBuZXcgcmVmZXJlbmNlIGlmIG91ciBuZXcgc3Ryb2tlIGlzIGEgcGFpbnRcclxuICAgICAgaWYgKCBzdHJva2UgJiYgc3Ryb2tlLmlzUGFpbnQgKSB7XHJcbiAgICAgICAgdGhpcy5zdHJva2VQYWludCA9IHN0cm9rZTtcclxuICAgICAgICBzdmdCbG9jay5pbmNyZW1lbnRQYWludCggc3Ryb2tlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgU1ZHIHN0eWxlIG9mIG91ciBzdHJva2VcclxuICAgIGlmICggc3Ryb2tlU3R5bGUgIT09IHRoaXMuc3Ryb2tlU3R5bGUgKSB7XHJcbiAgICAgIHRoaXMuc3Ryb2tlU3R5bGUgPSBzdHJva2VTdHlsZTtcclxuICAgICAgdGhpcy51cGRhdGVCYXNlU3R5bGUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlQmFzZVN0eWxlKCkge1xyXG4gICAgdGhpcy5iYXNlU3R5bGUgPSBgZmlsbDogJHt0aGlzLmZpbGxTdHlsZX07IHN0cm9rZTogJHt0aGlzLnN0cm9rZVN0eWxlfTtgO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxyXG4gICAqL1xyXG4gIHVwZGF0ZVN0cm9rZURldGFpbFN0eWxlKCBub2RlICkge1xyXG4gICAgbGV0IHN0cm9rZURldGFpbFN0eWxlID0gJyc7XHJcblxyXG4gICAgY29uc3QgbGluZVdpZHRoID0gbm9kZS5nZXRMaW5lV2lkdGgoKTtcclxuICAgIGlmICggbGluZVdpZHRoICE9PSAxICkge1xyXG4gICAgICBzdHJva2VEZXRhaWxTdHlsZSArPSBgc3Ryb2tlLXdpZHRoOiAke2xpbmVXaWR0aH07YDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsaW5lQ2FwID0gbm9kZS5nZXRMaW5lQ2FwKCk7XHJcbiAgICBpZiAoIGxpbmVDYXAgIT09ICdidXR0JyApIHtcclxuICAgICAgc3Ryb2tlRGV0YWlsU3R5bGUgKz0gYHN0cm9rZS1saW5lY2FwOiAke2xpbmVDYXB9O2A7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbGluZUpvaW4gPSBub2RlLmdldExpbmVKb2luKCk7XHJcbiAgICBpZiAoIGxpbmVKb2luICE9PSAnbWl0ZXInICkge1xyXG4gICAgICBzdHJva2VEZXRhaWxTdHlsZSArPSBgc3Ryb2tlLWxpbmVqb2luOiAke2xpbmVKb2lufTtgO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG1pdGVyTGltaXQgPSBub2RlLmdldE1pdGVyTGltaXQoKTtcclxuICAgIHN0cm9rZURldGFpbFN0eWxlICs9IGBzdHJva2UtbWl0ZXJsaW1pdDogJHttaXRlckxpbWl0fTtgO1xyXG5cclxuICAgIGlmICggbm9kZS5oYXNMaW5lRGFzaCgpICkge1xyXG4gICAgICBzdHJva2VEZXRhaWxTdHlsZSArPSBgc3Ryb2tlLWRhc2hhcnJheTogJHtub2RlLmdldExpbmVEYXNoKCkuam9pbiggJywnICl9O2A7XHJcbiAgICAgIHN0cm9rZURldGFpbFN0eWxlICs9IGBzdHJva2UtZGFzaG9mZnNldDogJHtub2RlLmdldExpbmVEYXNoT2Zmc2V0KCl9O2A7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zdHJva2VEZXRhaWxTdHlsZSA9IHN0cm9rZURldGFpbFN0eWxlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGRlZnMgU1ZHIGJsb2NrIGlzIHN3aXRjaGVkIChvdXIgU1ZHIGVsZW1lbnQgd2FzIG1vdmVkIHRvIGFub3RoZXIgU1ZHIHRvcC1sZXZlbCBjb250ZXh0KVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U1ZHQmxvY2t9IHN2Z0Jsb2NrXHJcbiAgICovXHJcbiAgdXBkYXRlU1ZHQmxvY2soIHN2Z0Jsb2NrICkge1xyXG4gICAgLy8gcmVtb3ZlIHBhaW50cyBmcm9tIHRoZSBvbGQgc3ZnQmxvY2tcclxuICAgIGNvbnN0IG9sZFN2Z0Jsb2NrID0gdGhpcy5zdmdCbG9jaztcclxuICAgIGlmICggb2xkU3ZnQmxvY2sgKSB7XHJcbiAgICAgIGlmICggdGhpcy5maWxsUGFpbnQgKSB7XHJcbiAgICAgICAgb2xkU3ZnQmxvY2suZGVjcmVtZW50UGFpbnQoIHRoaXMuZmlsbFBhaW50ICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCB0aGlzLnN0cm9rZVBhaW50ICkge1xyXG4gICAgICAgIG9sZFN2Z0Jsb2NrLmRlY3JlbWVudFBhaW50KCB0aGlzLnN0cm9rZVBhaW50ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnN2Z0Jsb2NrID0gc3ZnQmxvY2s7XHJcblxyXG4gICAgLy8gYWRkIHBhaW50cyB0byB0aGUgbmV3IHN2Z0Jsb2NrXHJcbiAgICBpZiAoIHRoaXMuZmlsbFBhaW50ICkge1xyXG4gICAgICBzdmdCbG9jay5pbmNyZW1lbnRQYWludCggdGhpcy5maWxsUGFpbnQgKTtcclxuICAgIH1cclxuICAgIGlmICggdGhpcy5zdHJva2VQYWludCApIHtcclxuICAgICAgc3ZnQmxvY2suaW5jcmVtZW50UGFpbnQoIHRoaXMuc3Ryb2tlUGFpbnQgKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBTVkcgc3R5bGUgc3RyaW5nIHVzZWQgdG8gcmVwcmVzZW50IGEgcGFpbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bnVsbHxzdHJpbmd8Q29sb3J8TGluZWFyR3JhZGllbnR8UmFkaWFsR3JhZGllbnR8UGF0dGVybn0gcGFpbnRcclxuICogQHBhcmFtIHtTVkdCbG9ja30gc3ZnQmxvY2tcclxuICovXHJcbmZ1bmN0aW9uIHBhaW50VG9TVkdTdHlsZSggcGFpbnQsIHN2Z0Jsb2NrICkge1xyXG4gIGlmICggIXBhaW50ICkge1xyXG4gICAgLy8gbm8gcGFpbnRcclxuICAgIHJldHVybiAnbm9uZSc7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCBwYWludC50b0NTUyApIHtcclxuICAgIC8vIENvbG9yIG9iamVjdCBwYWludFxyXG4gICAgcmV0dXJuIHBhaW50LnRvQ1NTKCk7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCBwYWludC5pc1BhaW50ICkge1xyXG4gICAgLy8gcmVmZXJlbmNlIHRoZSBTVkcgZGVmaW5pdGlvbiB3aXRoIGEgVVJMXHJcbiAgICByZXR1cm4gYHVybCgjJHtwYWludC5pZH0tJHtzdmdCbG9jayA/IHN2Z0Jsb2NrLmlkIDogJ25vYmxvY2snfSlgO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIC8vIHBsYWluIENTUyBjb2xvclxyXG4gICAgcmV0dXJuIHBhaW50O1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ1BhaW50U1ZHU3RhdGUnLCBQYWludFNWR1N0YXRlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQYWludFNWR1N0YXRlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxPQUFPLFFBQVEsZUFBZTtBQUV2QyxNQUFNQyxhQUFhLENBQUM7RUFDbEJDLFdBQVdBLENBQUEsRUFBRztJQUNaLElBQUksQ0FBQ0MsVUFBVSxDQUFDLENBQUM7RUFDbkI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRUEsVUFBVUEsQ0FBQSxFQUFHO0lBQ1g7SUFDQSxJQUFJLENBQUNDLFFBQVEsR0FBRyxJQUFJOztJQUVwQjtJQUNBLElBQUksQ0FBQ0MsU0FBUyxHQUFHLE1BQU07SUFDdkIsSUFBSSxDQUFDQyxXQUFXLEdBQUcsTUFBTTs7SUFFekI7SUFDQTtJQUNBLElBQUksQ0FBQ0MsU0FBUyxHQUFHLElBQUk7SUFDckIsSUFBSSxDQUFDQyxXQUFXLEdBQUcsSUFBSTs7SUFFdkI7SUFDQSxJQUFJLENBQUNDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4QixJQUFJLENBQUNDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQyxDQUFDO0VBQy9COztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLE9BQU9BLENBQUEsRUFBRztJQUNSO0lBQ0EsSUFBSSxDQUFDQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3ZCLElBQUksQ0FBQ0Msa0JBQWtCLENBQUMsQ0FBQztFQUMzQjs7RUFFQTtBQUNGO0FBQ0E7RUFDRUQsZ0JBQWdCQSxDQUFBLEVBQUc7SUFDakIsSUFBSyxJQUFJLENBQUNMLFNBQVMsRUFBRztNQUNwQixJQUFJLENBQUNILFFBQVEsQ0FBQ1UsY0FBYyxDQUFFLElBQUksQ0FBQ1AsU0FBVSxDQUFDO01BQzlDLElBQUksQ0FBQ0EsU0FBUyxHQUFHLElBQUk7SUFDdkI7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7RUFDRU0sa0JBQWtCQSxD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