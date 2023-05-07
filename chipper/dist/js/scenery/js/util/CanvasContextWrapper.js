// Copyright 2013-2022, University of Colorado Boulder

/**
 * Wraps the context and contains a reference to the canvas, so that we can absorb unnecessary state changes,
 * and possibly combine certain fill operations.
 *
 * TODO: performance analysis, possibly axe this and use direct modification.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import { scenery } from '../imports.js';
class CanvasContextWrapper {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} context
   */
  constructor(canvas, context) {
    // @public {HTMLCanvasElement}
    this.canvas = canvas;

    // @public {CanvasRenderingContext2D}
    this.context = context;
    this.resetStyles();
  }

  /**
   * Set local styles to undefined, so that they will be invalidated later
   * @public
   */
  resetStyles() {
    this.fillStyle = undefined; // null
    this.strokeStyle = undefined; // null
    this.lineWidth = undefined; // 1
    this.lineCap = undefined; // 'butt'
    this.lineJoin = undefined; // 'miter'
    this.lineDash = undefined; // []
    this.lineDashOffset = undefined; // 0
    this.miterLimit = undefined; // 10

    this.font = undefined; // '10px sans-serif'
    this.direction = undefined; // 'inherit'
  }

  /**
   * Sets a (possibly) new width and height, and clears the canvas.
   * @public
   *
   * @param {number} width
   * @param {number} height
   */
  setDimensions(width, height) {
    //Don't guard against width and height, because we need to clear the canvas.
    //TODO: Is it expensive to clear by setting both the width and the height?  Maybe we just need to set the width to clear it.
    this.canvas.width = width;
    this.canvas.height = height;

    // assume all persistent data could have changed
    this.resetStyles();
  }

  /**
   * @public
   *
   * @param {string|Color|Property.<string>} style
   */
  setFillStyle(style) {
    // turn {Property}s into their values when necessary
    if (style && style instanceof ReadOnlyProperty) {
      style = style.value;
    }

    // turn {Color}s into strings when necessary
    if (style && style.getCanvasStyle) {
      style = style.getCanvasStyle();
    }
    if (this.fillStyle !== style) {
      this.fillStyle = style;

      // allow gradients / patterns
      this.context.fillStyle = style;
    }
  }

  /**
   * @public
   *
   * @param {string|Color|Property.<string>} style
   */
  setStrokeStyle(style) {
    // turn {Property}s into their values when necessary
    if (style && style instanceof ReadOnlyProperty) {
      style = style.value;
    }

    // turn {Color}s into strings when necessary
    if (style && style.getCanvasStyle) {
      style = style.getCanvasStyle();
    }
    if (this.strokeStyle !== style) {
      this.strokeStyle = style;

      // allow gradients / patterns
      this.context.strokeStyle = style;
    }
  }

  /**
   * @public
   *
   * @param {number} width
   */
  setLineWidth(width) {
    if (this.lineWidth !== width) {
      this.lineWidth = width;
      this.context.lineWidth = width;
    }
  }

  /**
   * @public
   *
   * @param {string} cap
   */
  setLineCap(cap) {
    if (this.lineCap !== cap) {
      this.lineCap = cap;
      this.context.lineCap = cap;
    }
  }

  /**
   * @public
   *
   * @param {string} join
   */
  setLineJoin(join) {
    if (this.lineJoin !== join) {
      this.lineJoin = join;
      this.context.lineJoin = join;
    }
  }

  /**
   * @public
   *
   * @param {number} miterLimit
   */
  setMiterLimit(miterLimit) {
    assert && assert(typeof miterLimit === 'number');
    if (this.miterLimit !== miterLimit) {
      this.miterLimit = miterLimit;
      this.context.miterLimit = miterLimit;
    }
  }

  /**
   * @public
   *
   * @param {Array.<number>|null} dash
   */
  setLineDash(dash) {
    assert && assert(dash !== undefined, 'undefined line dash would cause hard-to-trace errors');
    if (this.lineDash !== dash) {
      this.lineDash = dash;
      if (this.context.setLineDash) {
        this.context.setLineDash(dash === null ? [] : dash); // see https://github.com/phetsims/scenery/issues/101 for null line-dash workaround
      } else if (this.context.mozDash !== undefined) {
        this.context.mozDash = dash;
      } else if (this.context.webkitLineDash !== undefined) {
        this.context.webkitLineDash = dash ? dash : [];
      } else {
        // unsupported line dash! do... nothing?
      }
    }
  }

  /**
   * @public
   *
   * @param {number} lineDashOffset
   */
  setLineDashOffset(lineDashOffset) {
    if (this.lineDashOffset !== lineDashOffset) {
      this.lineDashOffset = lineDashOffset;
      if (this.context.lineDashOffset !== undefined) {
        this.context.lineDashOffset = lineDashOffset;
      } else if (this.context.webkitLineDashOffset !== undefined) {
        this.context.webkitLineDashOffset = lineDashOffset;
      } else {
        // unsupported line dash! do... nothing?
      }
    }
  }

  /**
   * @public
   *
   * @param {string} font
   */
  setFont(font) {
    if (this.font !== font) {
      this.font = font;
      this.context.font = font;
    }
  }

  /**
   * @public
   *
   * @param {string} direction
   */
  setDirection(direction) {
    if (this.direction !== direction) {
      this.direction = direction;
      this.context.direction = direction;
    }
  }
}
scenery.register('CanvasContextWrapper', CanvasContextWrapper);
export default CanvasContextWrapper;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFkT25seVByb3BlcnR5Iiwic2NlbmVyeSIsIkNhbnZhc0NvbnRleHRXcmFwcGVyIiwiY29uc3RydWN0b3IiLCJjYW52YXMiLCJjb250ZXh0IiwicmVzZXRTdHlsZXMiLCJmaWxsU3R5bGUiLCJ1bmRlZmluZWQiLCJzdHJva2VTdHlsZSIsImxpbmVXaWR0aCIsImxpbmVDYXAiLCJsaW5lSm9pbiIsImxpbmVEYXNoIiwibGluZURhc2hPZmZzZXQiLCJtaXRlckxpbWl0IiwiZm9udCIsImRpcmVjdGlvbiIsInNldERpbWVuc2lvbnMiLCJ3aWR0aCIsImhlaWdodCIsInNldEZpbGxTdHlsZSIsInN0eWxlIiwidmFsdWUiLCJnZXRDYW52YXNTdHlsZSIsInNldFN0cm9rZVN0eWxlIiwic2V0TGluZVdpZHRoIiwic2V0TGluZUNhcCIsImNhcCIsInNldExpbmVKb2luIiwiam9pbiIsInNldE1pdGVyTGltaXQiLCJhc3NlcnQiLCJzZXRMaW5lRGFzaCIsImRhc2giLCJtb3pEYXNoIiwid2Via2l0TGluZURhc2giLCJzZXRMaW5lRGFzaE9mZnNldCIsIndlYmtpdExpbmVEYXNoT2Zmc2V0Iiwic2V0Rm9udCIsInNldERpcmVjdGlvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2FudmFzQ29udGV4dFdyYXBwZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5cclxuLyoqXHJcbiAqIFdyYXBzIHRoZSBjb250ZXh0IGFuZCBjb250YWlucyBhIHJlZmVyZW5jZSB0byB0aGUgY2FudmFzLCBzbyB0aGF0IHdlIGNhbiBhYnNvcmIgdW5uZWNlc3Nhcnkgc3RhdGUgY2hhbmdlcyxcclxuICogYW5kIHBvc3NpYmx5IGNvbWJpbmUgY2VydGFpbiBmaWxsIG9wZXJhdGlvbnMuXHJcbiAqXHJcbiAqIFRPRE86IHBlcmZvcm1hbmNlIGFuYWx5c2lzLCBwb3NzaWJseSBheGUgdGhpcyBhbmQgdXNlIGRpcmVjdCBtb2RpZmljYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG5jbGFzcyBDYW52YXNDb250ZXh0V3JhcHBlciB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzXHJcbiAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGNvbnRleHRcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY2FudmFzLCBjb250ZXh0ICkge1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0hUTUxDYW52YXNFbGVtZW50fVxyXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfVxyXG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcclxuXHJcbiAgICB0aGlzLnJlc2V0U3R5bGVzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgbG9jYWwgc3R5bGVzIHRvIHVuZGVmaW5lZCwgc28gdGhhdCB0aGV5IHdpbGwgYmUgaW52YWxpZGF0ZWQgbGF0ZXJcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXRTdHlsZXMoKSB7XHJcbiAgICB0aGlzLmZpbGxTdHlsZSA9IHVuZGVmaW5lZDsgLy8gbnVsbFxyXG4gICAgdGhpcy5zdHJva2VTdHlsZSA9IHVuZGVmaW5lZDsgLy8gbnVsbFxyXG4gICAgdGhpcy5saW5lV2lkdGggPSB1bmRlZmluZWQ7IC8vIDFcclxuICAgIHRoaXMubGluZUNhcCA9IHVuZGVmaW5lZDsgLy8gJ2J1dHQnXHJcbiAgICB0aGlzLmxpbmVKb2luID0gdW5kZWZpbmVkOyAvLyAnbWl0ZXInXHJcbiAgICB0aGlzLmxpbmVEYXNoID0gdW5kZWZpbmVkOyAvLyBbXVxyXG4gICAgdGhpcy5saW5lRGFzaE9mZnNldCA9IHVuZGVmaW5lZDsgLy8gMFxyXG4gICAgdGhpcy5taXRlckxpbWl0ID0gdW5kZWZpbmVkOyAvLyAxMFxyXG5cclxuICAgIHRoaXMuZm9udCA9IHVuZGVmaW5lZDsgLy8gJzEwcHggc2Fucy1zZXJpZidcclxuICAgIHRoaXMuZGlyZWN0aW9uID0gdW5kZWZpbmVkOyAvLyAnaW5oZXJpdCdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgYSAocG9zc2libHkpIG5ldyB3aWR0aCBhbmQgaGVpZ2h0LCBhbmQgY2xlYXJzIHRoZSBjYW52YXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxyXG4gICAqL1xyXG4gIHNldERpbWVuc2lvbnMoIHdpZHRoLCBoZWlnaHQgKSB7XHJcblxyXG4gICAgLy9Eb24ndCBndWFyZCBhZ2FpbnN0IHdpZHRoIGFuZCBoZWlnaHQsIGJlY2F1c2Ugd2UgbmVlZCB0byBjbGVhciB0aGUgY2FudmFzLlxyXG4gICAgLy9UT0RPOiBJcyBpdCBleHBlbnNpdmUgdG8gY2xlYXIgYnkgc2V0dGluZyBib3RoIHRoZSB3aWR0aCBhbmQgdGhlIGhlaWdodD8gIE1heWJlIHdlIGp1c3QgbmVlZCB0byBzZXQgdGhlIHdpZHRoIHRvIGNsZWFyIGl0LlxyXG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aDtcclxuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuXHJcbiAgICAvLyBhc3N1bWUgYWxsIHBlcnNpc3RlbnQgZGF0YSBjb3VsZCBoYXZlIGNoYW5nZWRcclxuICAgIHRoaXMucmVzZXRTdHlsZXMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfENvbG9yfFByb3BlcnR5LjxzdHJpbmc+fSBzdHlsZVxyXG4gICAqL1xyXG4gIHNldEZpbGxTdHlsZSggc3R5bGUgKSB7XHJcbiAgICAvLyB0dXJuIHtQcm9wZXJ0eX1zIGludG8gdGhlaXIgdmFsdWVzIHdoZW4gbmVjZXNzYXJ5XHJcbiAgICBpZiAoIHN0eWxlICYmIHN0eWxlIGluc3RhbmNlb2YgUmVhZE9ubHlQcm9wZXJ0eSApIHtcclxuICAgICAgc3R5bGUgPSBzdHlsZS52YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0dXJuIHtDb2xvcn1zIGludG8gc3RyaW5ncyB3aGVuIG5lY2Vzc2FyeVxyXG4gICAgaWYgKCBzdHlsZSAmJiBzdHlsZS5nZXRDYW52YXNTdHlsZSApIHtcclxuICAgICAgc3R5bGUgPSBzdHlsZS5nZXRDYW52YXNTdHlsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5maWxsU3R5bGUgIT09IHN0eWxlICkge1xyXG4gICAgICB0aGlzLmZpbGxTdHlsZSA9IHN0eWxlO1xyXG5cclxuICAgICAgLy8gYWxsb3cgZ3JhZGllbnRzIC8gcGF0dGVybnNcclxuICAgICAgdGhpcy5jb250ZXh0LmZpbGxTdHlsZSA9IHN0eWxlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd8Q29sb3J8UHJvcGVydHkuPHN0cmluZz59IHN0eWxlXHJcbiAgICovXHJcbiAgc2V0U3Ryb2tlU3R5bGUoIHN0eWxlICkge1xyXG4gICAgLy8gdHVybiB7UHJvcGVydHl9cyBpbnRvIHRoZWlyIHZhbHVlcyB3aGVuIG5lY2Vzc2FyeVxyXG4gICAgaWYgKCBzdHlsZSAmJiBzdHlsZSBpbnN0YW5jZW9mIFJlYWRPbmx5UHJvcGVydHkgKSB7XHJcbiAgICAgIHN0eWxlID0gc3R5bGUudmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdHVybiB7Q29sb3J9cyBpbnRvIHN0cmluZ3Mgd2hlbiBuZWNlc3NhcnlcclxuICAgIGlmICggc3R5bGUgJiYgc3R5bGUuZ2V0Q2FudmFzU3R5bGUgKSB7XHJcbiAgICAgIHN0eWxlID0gc3R5bGUuZ2V0Q2FudmFzU3R5bGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMuc3Ryb2tlU3R5bGUgIT09IHN0eWxlICkge1xyXG4gICAgICB0aGlzLnN0cm9rZVN0eWxlID0gc3R5bGU7XHJcblxyXG4gICAgICAvLyBhbGxvdyBncmFkaWVudHMgLyBwYXR0ZXJuc1xyXG4gICAgICB0aGlzLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBzdHlsZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxyXG4gICAqL1xyXG4gIHNldExpbmVXaWR0aCggd2lkdGggKSB7XHJcbiAgICBpZiAoIHRoaXMubGluZVdpZHRoICE9PSB3aWR0aCApIHtcclxuICAgICAgdGhpcy5saW5lV2lkdGggPSB3aWR0aDtcclxuICAgICAgdGhpcy5jb250ZXh0LmxpbmVXaWR0aCA9IHdpZHRoO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNhcFxyXG4gICAqL1xyXG4gIHNldExpbmVDYXAoIGNhcCApIHtcclxuICAgIGlmICggdGhpcy5saW5lQ2FwICE9PSBjYXAgKSB7XHJcbiAgICAgIHRoaXMubGluZUNhcCA9IGNhcDtcclxuICAgICAgdGhpcy5jb250ZXh0LmxpbmVDYXAgPSBjYXA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gam9pblxyXG4gICAqL1xyXG4gIHNldExpbmVKb2luKCBqb2luICkge1xyXG4gICAgaWYgKCB0aGlzLmxpbmVKb2luICE9PSBqb2luICkge1xyXG4gICAgICB0aGlzLmxpbmVKb2luID0gam9pbjtcclxuICAgICAgdGhpcy5jb250ZXh0LmxpbmVKb2luID0gam9pbjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaXRlckxpbWl0XHJcbiAgICovXHJcbiAgc2V0TWl0ZXJMaW1pdCggbWl0ZXJMaW1pdCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBtaXRlckxpbWl0ID09PSAnbnVtYmVyJyApO1xyXG4gICAgaWYgKCB0aGlzLm1pdGVyTGltaXQgIT09IG1pdGVyTGltaXQgKSB7XHJcbiAgICAgIHRoaXMubWl0ZXJMaW1pdCA9IG1pdGVyTGltaXQ7XHJcbiAgICAgIHRoaXMuY29udGV4dC5taXRlckxpbWl0ID0gbWl0ZXJMaW1pdDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPG51bWJlcj58bnVsbH0gZGFzaFxyXG4gICAqL1xyXG4gIHNldExpbmVEYXNoKCBkYXNoICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZGFzaCAhPT0gdW5kZWZpbmVkLCAndW5kZWZpbmVkIGxpbmUgZGFzaCB3b3VsZCBjYXVzZSBoYXJkLXRvLXRyYWNlIGVycm9ycycgKTtcclxuICAgIGlmICggdGhpcy5saW5lRGFzaCAhPT0gZGFzaCApIHtcclxuICAgICAgdGhpcy5saW5lRGFzaCA9IGRhc2g7XHJcbiAgICAgIGlmICggdGhpcy5jb250ZXh0LnNldExpbmVEYXNoICkge1xyXG4gICAgICAgIHRoaXMuY29udGV4dC5zZXRMaW5lRGFzaCggZGFzaCA9PT0gbnVsbCA/IFtdIDogZGFzaCApOyAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzEwMSBmb3IgbnVsbCBsaW5lLWRhc2ggd29ya2Fyb3VuZFxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLmNvbnRleHQubW96RGFzaCAhPT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgIHRoaXMuY29udGV4dC5tb3pEYXNoID0gZGFzaDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdGhpcy5jb250ZXh0LndlYmtpdExpbmVEYXNoICE9PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LndlYmtpdExpbmVEYXNoID0gZGFzaCA/IGRhc2ggOiBbXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyB1bnN1cHBvcnRlZCBsaW5lIGRhc2ghIGRvLi4uIG5vdGhpbmc/XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsaW5lRGFzaE9mZnNldFxyXG4gICAqL1xyXG4gIHNldExpbmVEYXNoT2Zmc2V0KCBsaW5lRGFzaE9mZnNldCApIHtcclxuICAgIGlmICggdGhpcy5saW5lRGFzaE9mZnNldCAhPT0gbGluZURhc2hPZmZzZXQgKSB7XHJcbiAgICAgIHRoaXMubGluZURhc2hPZmZzZXQgPSBsaW5lRGFzaE9mZnNldDtcclxuICAgICAgaWYgKCB0aGlzLmNvbnRleHQubGluZURhc2hPZmZzZXQgIT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICB0aGlzLmNvbnRleHQubGluZURhc2hPZmZzZXQgPSBsaW5lRGFzaE9mZnNldDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdGhpcy5jb250ZXh0LndlYmtpdExpbmVEYXNoT2Zmc2V0ICE9PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LndlYmtpdExpbmVEYXNoT2Zmc2V0ID0gbGluZURhc2hPZmZzZXQ7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gdW5zdXBwb3J0ZWQgbGluZSBkYXNoISBkby4uLiBub3RoaW5nP1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZm9udFxyXG4gICAqL1xyXG4gIHNldEZvbnQoIGZvbnQgKSB7XHJcbiAgICBpZiAoIHRoaXMuZm9udCAhPT0gZm9udCApIHtcclxuICAgICAgdGhpcy5mb250ID0gZm9udDtcclxuICAgICAgdGhpcy5jb250ZXh0LmZvbnQgPSBmb250O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvblxyXG4gICAqL1xyXG4gIHNldERpcmVjdGlvbiggZGlyZWN0aW9uICkge1xyXG4gICAgaWYgKCB0aGlzLmRpcmVjdGlvbiAhPT0gZGlyZWN0aW9uICkge1xyXG4gICAgICB0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICAgICAgdGhpcy5jb250ZXh0LmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdDYW52YXNDb250ZXh0V3JhcHBlcicsIENhbnZhc0NvbnRleHRXcmFwcGVyICk7XHJcbmV4cG9ydCBkZWZhdWx0IENhbnZhc0NvbnRleHRXcmFwcGVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxnQkFBZ0IsTUFBTSxzQ0FBc0M7QUFDbkUsU0FBU0MsT0FBTyxRQUFRLGVBQWU7QUFFdkMsTUFBTUMsb0JBQW9CLENBQUM7RUFDekI7QUFDRjtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsTUFBTSxFQUFFQyxPQUFPLEVBQUc7SUFFN0I7SUFDQSxJQUFJLENBQUNELE1BQU0sR0FBR0EsTUFBTTs7SUFFcEI7SUFDQSxJQUFJLENBQUNDLE9BQU8sR0FBR0EsT0FBTztJQUV0QixJQUFJLENBQUNDLFdBQVcsQ0FBQyxDQUFDO0VBQ3BCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VBLFdBQVdBLENBQUEsRUFBRztJQUNaLElBQUksQ0FBQ0MsU0FBUyxHQUFHQyxTQUFTLENBQUMsQ0FBQztJQUM1QixJQUFJLENBQUNDLFdBQVcsR0FBR0QsU0FBUyxDQUFDLENBQUM7SUFDOUIsSUFBSSxDQUFDRSxTQUFTLEdBQUdGLFNBQVMsQ0FBQyxDQUFDO0lBQzVCLElBQUksQ0FBQ0csT0FBTyxHQUFHSCxTQUFTLENBQUMsQ0FBQztJQUMxQixJQUFJLENBQUNJLFFBQVEsR0FBR0osU0FBUyxDQUFDLENBQUM7SUFDM0IsSUFBSSxDQUFDSyxRQUFRLEdBQUdMLFNBQVMsQ0FBQyxDQUFDO0lBQzNCLElBQUksQ0FBQ00sY0FBYyxHQUFHTixTQUFTLENBQUMsQ0FBQztJQUNqQyxJQUFJLENBQUNPLFVBQVUsR0FBR1AsU0FBUyxDQUFDLENBQUM7O0lBRTdCLElBQUksQ0FBQ1EsSUFBSSxHQUFHUixTQUFTLENBQUMsQ0FBQztJQUN2QixJQUFJLENBQUNTLFNBQVMsR0FBR1QsU0FBUyxDQUFDLENBQUM7RUFDOUI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVUsYUFBYUEsQ0FBRUMsS0FBSyxFQUFFQyxNQUFNLEVBQUc7SUFFN0I7SUFDQTtJQUNBLElBQUksQ0FBQ2hCLE1BQU0sQ0FBQ2UsS0FBSyxHQUFHQSxLQUFLO0lBQ3pCLElBQUksQ0FBQ2YsTUFBTSxDQUFDZ0IsTUFBTSxHQUFHQSxNQUFNOztJQUUzQjtJQUNBLElBQUksQ0FBQ2QsV0FBVyxDQUFDLENBQUM7RUFDcEI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFZSxZQUFZQSxDQUFFQyxLQUFLLEVBQUc7SUFDcEI7SUFDQSxJQUFLQSxLQUFLLElBQUlBLEtBQUssWUFBWXRCLGdCQUFnQixFQUFHO01BQ2hEc0IsS0FBSyxHQUFHQSxLQUFLLENBQUNDLEtBQUs7SUFDckI7O0lBRUE7SUFDQSxJQUFLRCxLQUFLLElBQUlBLEtBQUssQ0FBQ0UsY0FBYyxFQUFHO01BQ25DRixLQUFLLEdBQUdBLEtBQUssQ0FBQ0UsY0FBYyxDQUFDLENBQUM7SUFDaEM7SUFFQSxJQUFLLElBQUksQ0FBQ2pCLFNBQVMsS0FBS2UsS0FBSyxFQUFHO01BQzlCLElBQUksQ0FBQ2YsU0FBUyxHQUFHZSxLQUFLOztNQUV0QjtNQUNBLElBQUksQ0FBQ2pCLE9BQU8sQ0FBQ0UsU0FBUyxHQUFHZSxLQUFLO0lBQ2hDO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxjQUFjQSxDQUFFSCxLQUFLLEVBQUc7SUFDdEI7SUFDQSxJQUFLQSxLQUFLLElBQUlBLEtBQUssWUFBWXRCLGdCQUFnQixFQUFHO01BQ2hEc0IsS0FBSyxHQUFHQSxLQUFLLENBQUNDLEtBQUs7SUFDckI7O0lBRUE7SUFDQSxJQUFLRCxLQUFLLElBQUlBLEtBQUssQ0FBQ0UsY0FBYyxFQUFHO01BQ25DRixLQUFLLEdBQUdBLEtBQUssQ0FBQ0UsY0FBYyxDQUFDLENBQUM7SUFDaEM7SUFFQSxJQUFLLElBQUksQ0FBQ2YsV0FBVyxLQUFLYSxLQUFLLEVBQUc7TUFDaEMsSUFBSSxDQUFDYixXQUFXLEdBQUdhLEtBQUs7O01BRXhCO01BQ0EsSUFBSSxDQUFDakIsT0FBTyxDQUFDSSxXQUFXLEdBQUdhLEtBQUs7SUFDbEM7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VJLFlBQVlBLENBQUVQLEtBQUssRUFBRztJQUNwQixJQUFLLElBQUksQ0FBQ1QsU0FBUyxLQUFLUyxLQUFLLEVBQUc7TUFDOUIsSUFBSSxDQUFDVCxTQUFTLEdBQUdTLEtBQUs7TUFDdEIsSUFBSSxDQUFDZCxPQUFPLENBQUNLLFNBQVMsR0FBR1MsS0FBSztJQUNoQztFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRVEsVUFBVUEsQ0FBRUMsR0FBRyxFQUFHO0lBQ2hCLElBQUssSUFBSSxDQUFDakIsT0FBTyxLQUFLaUIsR0FBRyxFQUFHO01BQzFCLElBQUksQ0FBQ2pCLE9BQU8sR0FBR2lCLEdBQUc7TUFDbEIsSUFBSSxDQUFDdkIsT0FBTyxDQUFDTSxPQUFPLEdBQUdpQixHQUFHO0lBQzVCO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxJQUFJLEVBQUc7SUFDbEIsSUFBSyxJQUFJLENBQUNsQixRQUFRLEtBQUtrQixJQUFJLEVBQUc7TUFDNUIsSUFBSSxDQUFDbEIsUUFBUSxHQUFHa0IsSUFBSTtNQUNwQixJQUFJLENBQUN6QixPQUFPLENBQUNPLFFBQVEsR0FBR2tCLElBQUk7SUFDOUI7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLGFBQWFBLENBQUVoQixVQUFVLEVBQUc7SUFDMUJpQixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPakIsVUFBVSxLQUFLLFFBQVMsQ0FBQztJQUNsRCxJQUFLLElBQUksQ0FBQ0EsVUFBVSxLQUFLQSxVQUFVLEVBQUc7TUFDcEMsSUFBSSxDQUFDQSxVQUFVLEdBQUdBLFVBQVU7TUFDNUIsSUFBSSxDQUFDVixPQUFPLENBQUNVLFVBQVUsR0FBR0EsVUFBVTtJQUN0QztFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRWtCLFdBQVdBLENBQUVDLElBQUksRUFBRztJQUNsQkYsTUFBTSxJQUFJQSxNQUFNLENBQUVFLElBQUksS0FBSzFCLFNBQVMsRUFBRSxzREFBdUQsQ0FBQztJQUM5RixJQUFLLElBQUksQ0FBQ0ssUUFBUSxLQUFLcUIsSUFBSSxFQUFHO01BQzVCLElBQUksQ0FBQ3JCLFFBQVEsR0FBR3FCLElBQUk7TUFDcEIsSUFBSyxJQUFJLENBQUM3QixPQUFPLENBQUM0QixXQUFXLEVBQUc7UUFDOUIsSUFBSSxDQUFDNUIsT0FBTyxDQUFDNEIsV0FBVyxDQUFFQyxJQUFJLEtBQUssSUFBSSxHQUFHLEVBQUUsR0FBR0EsSUFBSyxDQUFDLENBQUMsQ0FBQztNQUN6RCxDQUFDLE1BQ0ksSUFBSyxJQUFJLENBQUM3QixPQUFPLENBQUM4QixPQUFPLEtBQUszQixTQUFTLEVBQUc7UUFDN0MsSUFBSSxDQUFDSCxPQUFPLENBQUM4QixPQUFPLEdBQUdELElBQUk7TUFDN0IsQ0FBQyxNQUNJLElBQUssSUFBSSxDQUFDN0IsT0FBTyxDQUFDK0IsY0FBYyxLQUFLNUIsU0FBUyxFQUFHO1FBQ3BELElBQUksQ0FBQ0gsT0FBTyxDQUFDK0IsY0FBYyxHQUFHRixJQUFJLEdBQUdBLElBQUksR0FBRyxFQUFFO01BQ2hELENBQUMsTUFDSTtRQUNIO01BQUE7SUFFSjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUcsaUJBQWlCQSxDQUFFdkIsY0FBYyxFQUFHO0lBQ2xDLElBQUssSUFBSSxDQUFDQSxjQUFjLEtBQUtBLGNBQWMsRUFBRztNQUM1QyxJQUFJLENBQUNBLGNBQWMsR0FBR0EsY0FBYztNQUNwQyxJQUFLLElBQUksQ0FBQ1QsT0FBTyxDQUFDUyxjQUFjLEtBQUtOLFNBQVMsRUFBRztRQUMvQyxJQUFJLENBQUNILE9BQU8sQ0FBQ1MsY0FBYyxHQUFHQSxjQUFjO01BQzlDLENBQUMsTUFDSSxJQUFLLElBQUksQ0FBQ1QsT0FBTyxDQUFDaUMsb0JBQW9CLEtBQUs5QixTQUFTLEVBQUc7UUFDMUQsSUFBSSxDQUFDSCxPQUFPLENBQUNpQyxvQkFBb0IsR0FBR3hCLGNBQWM7TUFDcEQsQ0FBQyxNQUNJO1FBQ0g7TUFBQTtJQUVKO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFeUIsT0FBT0EsQ0FBRXZCLElBQUksRUFBRztJQUNkLElBQUssSUFBSSxDQUFDQSxJQUFJLEtBQUtBLElBQUksRUFBRztNQUN4QixJQUFJLENBQUNBLElBQUksR0FBR0EsSUFBSTtNQUNoQixJQUFJLENBQUNYLE9BQU8sQ0FBQ1csSUFBSSxHQUFHQSxJQUFJO0lBQzFCO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFd0IsWUFBWUEsQ0FBRXZCLFNBQVMsRUFBRztJQUN4QixJQUFLLElBQUksQ0FBQ0EsU0FBUyxLQUFLQSxTQUFTLEVBQUc7TUFDbEMsSUFBSSxDQUFDQSxTQUFTLEdBQUdBLFNBQVM7TUFDMUIsSUFBSSxDQUFDWixPQUFPLENBQUNZLFNBQVMsR0FBR0EsU0FBUztJQUNwQztFQUNGO0FBQ0Y7QUFFQWhCLE9BQU8sQ0FBQ3dDLFFBQVEsQ0FBRSxzQkFBc0IsRUFBRXZDLG9CQUFxQixDQUFDO0FBQ2hFLGVBQWVBLG9CQUFvQiJ9