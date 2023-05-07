// Copyright 2013-2023, University of Colorado Boulder

/**
 * A debugging version of the CanvasRenderingContext2D that will output all commands issued,
 * but can also forward them to a real context
 *
 * See the spec at http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#2dcontext
 * Wrapping of the CanvasRenderingContext2D interface as of January 27th, 2013 (but not other interfaces like TextMetrics and Path)
 *
 * Shortcut to create:
 *    var context = new phet.scenery.DebugContext( document.createElement( 'canvas' ).getContext( '2d' ) );
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import scenery from '../scenery.js';

// used to serialize arguments so that it displays exactly like the call would be executed
function s(value) {
  return JSON.stringify(value);
}
function log(message) {
  console.log(`context.${message};`);
}
function attributeGet(name) {
  log(name);
}
function attributeSet(name, value) {
  log(`${name} = ${s(value)}`);
}
function command(name, args) {
  if (args === undefined || args.length === 0) {
    log(`${name}()`);
  } else {
    log(`${name}( ${_.reduce(args, (memo, arg) => {
      if (memo.length > 0) {
        return `${memo}, ${s(arg)}`;
      } else {
        return s(arg);
      }
    }, '')} )`);
  }
}
class DebugContext {
  /**
   * @param {CanvasRenderingContext2D} context
   */
  constructor(context) {
    this._context = context;

    // allow checking of context.ellipse for existence
    if (context && !context.ellipse) {
      this.ellipse = context.ellipse;
    }
  }

  /**
   * @public
   *
   * @returns {HTMLCanvasElement}
   */
  get canvas() {
    attributeGet('canvas');
    return this._context.canvas;
  }

  /**
   * @public
   *
   * @returns {number}
   */
  get width() {
    attributeGet('width');
    return this._context.width;
  }

  /**
   * @public
   *
   * @returns {number}
   */
  get height() {
    attributeGet('height');
    return this._context.height;
  }

  /**
   * @public
   */
  commit() {
    command('commit');
    this._context.commit();
  }

  /**
   * @public
   */
  save() {
    command('save');
    this._context.save();
  }

  /**
   * @public
   */
  restore() {
    command('restore');
    this._context.restore();
  }

  /**
   * @public
   *
   * @returns {DOMMatrix}
   */
  get currentTransform() {
    attributeGet('currentTransform');
    return this._context.currentTransform;
  }

  /**
   * @public
   *
   * @param {DOMMatrix} transform
   */
  set currentTransform(transform) {
    attributeSet('currentTransform', transform);
    this._context.currentTransform = transform;
  }

  /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   */
  scale(x, y) {
    command('scale', [x, y]);
    this._context.scale(x, y);
  }

  /**
   * @public
   *
   * @param {number} angle
   */
  rotate(angle) {
    command('rotate', [angle]);
    this._context.rotate(angle);
  }

  /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   */
  translate(x, y) {
    command('translate', [x, y]);
    this._context.translate(x, y);
  }

  /**
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @param {number} c
   * @param {number} d
   * @param {number} e
   * @param {number} f
   */
  transform(a, b, c, d, e, f) {
    command('transform', [a, b, c, d, e, f]);
    this._context.transform(a, b, c, d, e, f);
  }

  /**
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @param {number} c
   * @param {number} d
   * @param {number} e
   * @param {number} f
   */
  setTransform(a, b, c, d, e, f) {
    command('setTransform', [a, b, c, d, e, f]);
    this._context.setTransform(a, b, c, d, e, f);
  }

  /**
   * @public
   */
  resetTransform() {
    command('resetTransform');
    this._context.resetTransform();
  }

  /**
   * @public
   *
   * @returns {number}
   */
  get globalAlpha() {
    attributeGet('globalAlpha');
    return this._context.globalAlpha;
  }

  /**
   * @public
   *
   * @param {number} value
   */
  set globalAlpha(value) {
    attributeSet('globalAlpha', value);
    this._context.globalAlpha = value;
  }

  /**
   * @public
   *
   * @returns {string}
   */
  get globalCompositeOperation() {
    attributeGet('globalCompositeOperation');
    return this._context.globalCompositeOperation;
  }

  /**
   * @public
   *
   * @param {string} value
   */
  set globalCompositeOperation(value) {
    attributeSet('globalCompositeOperation', value);
    this._context.globalCompositeOperation = value;
  }

  /**
   * @public
   *
   * @returns {boolean}
   */
  get imageSmoothingEnabled() {
    attributeGet('imageSmoothingEnabled');
    return this._context.imageSmoothingEnabled;
  }

  /**
   * @public
   *
   * @param {boolean} value
   */
  set imageSmoothingEnabled(value) {
    attributeSet('imageSmoothingEnabled', value);
    this._context.imageSmoothingEnabled = value;
  }

  /**
   * @public
   *
   * @returns {string}
   */
  get strokeStyle() {
    attributeGet('strokeStyle');
    return this._context.strokeStyle;
  }

  /**
   * @public
   *
   * @param {string} value
   */
  set strokeStyle(value) {
    attributeSet('strokeStyle', value);
    this._context.strokeStyle = value;
  }

  /**
   * @public
   *
   * @returns {string}
   */
  get fillStyle() {
    attributeGet('fillStyle');
    return this._context.fillStyle;
  }

  /**
   * @public
   *
   * @param {string} value
   */
  set fillStyle(value) {
    attributeSet('fillStyle', value);
    this._context.fillStyle = value;
  }

  // TODO: create wrapper
  /**
   * @public
   *
   * @param {number} x0
   * @param {number} y0
   * @param {number} x1
   * @param {number} y1
   * @returns {*}
   */
  createLinearGradient(x0, y0, x1, y1) {
    command('createLinearGradient', [x0, y0, x1, y1]);
    return this._context.createLinearGradient(x0, y0, x1, y1);
  }

  // TODO: create wrapper
  /**
   * @public
   *
   * @param {number} x0
   * @param {number} y0
   * @param {number} r0
   * @param {number} x1
   * @param {number} y1
   * @param {number} r1
   * @returns {*}
   */
  createRadialGradient(x0, y0, r0, x1, y1, r1) {
    command('createRadialGradient', [x0, y0, r0, x1, y1, r1]);
    return this._context.createRadialGradient(x0, y0, r0, x1, y1, r1);
  }

  // TODO: create wrapper
  /**
   * @public
   *
   * @param {*} image
   * @param {string} repetition
   * @returns {*}
   */
  createPattern(image, repetition) {
    command('createPattern', [image, repetition]);
    return this._context.createPattern(image, repetition);
  }

  /**
   * @public
   *
   * @returns {number}
   */
  get shadowOffsetX() {
    attributeGet('shadowOffsetX');
    return this._context.shadowOffsetX;
  }

  /**
   * @public
   *
   * @param {number} value
   */
  set shadowOffsetX(value) {
    attributeSet('shadowOffsetX', value);
    this._context.shadowOffsetX = value;
  }

  /**
   * @public
   *
   * @returns {number}
   */
  get shadowOffsetY() {
    attributeGet('shadowOffsetY');
    return this._context.shadowOffsetY;
  }

  /**
   * @public
   *
   * @param {number} value
   */
  set shadowOffsetY(value) {
    attributeSet('shadowOffsetY', value);
    this._context.shadowOffsetY = value;
  }

  /**
   * @public
   *
   * @returns {number}
   */
  get shadowBlur() {
    attributeGet('shadowBlur');
    return this._context.shadowBlur;
  }

  /**
   * @public
   *
   * @param {number} value
   */
  set shadowBlur(value) {
    attributeSet('shadowBlur', value);
    this._context.shadowBlur = value;
  }

  /**
   * @public
   *
   * @returns {string}
   */
  get shadowColor() {
    attributeGet('shadowColor');
    return this._context.shadowColor;
  }

  /**
   * @public
   *
   * @param {string} value
   */
  set shadowColor(value) {
    attributeSet('shadowColor', value);
    this._context.shadowColor = value;
  }

  /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  clearRect(x, y, w, h) {
    command('clearRect', [x, y, w, h]);
    this._context.clearRect(x, y, w, h);
  }

  /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  fillRect(x, y, w, h) {
    command('fillRect', [x, y, w, h]);
    this._context.fillRect(x, y, w, h);
  }

  /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  strokeRect(x, y, w, h) {
    command('strokeRect', [x, y, w, h]);
    this._context.strokeRect(x, y, w, h);
  }

  /**
   * @public
   *
   * @returns {string}
   */
  get fillRule() {
    attributeGet('fillRule');
    return this._context.fillRule;
  }

  /**
   * @public
   *
   * @param {string} value
   */
  set fillRule(value) {
    attributeSet('fillRule', value);
    this._context.fillRule = value;
  }

  /**
   * @public
   */
  beginPath() {
    command('beginPath');
    this._context.beginPath();
  }

  /**
   * @public
   *
   * @param {Path2D} path
   */
  fill(path) {
    if (path) {
      command('fill', [path]);
      this._context.fill(path);
    } else {
      command('fill');
      this._context.fill();
    }
  }

  /**
   * @public
   *
   * @param {Path2D} path
   */
  stroke(path) {
    if (path) {
      command('stroke', [path]);
      this._context.stroke(path);
    } else {
      command('stroke');
      this._context.stroke();
    }
  }

  /**
   * @public
   *
   * @param {Path2D} path
   */
  scrollPathIntoView(path) {
    command('scrollPathIntoView', path ? [path] : undefined);
    this._context.scrollPathIntoView(path);
  }

  /**
   * @public
   *
   * @param {Path2D} path
   */
  clip(path) {
    command('clip', path ? [path] : undefined);
    this._context.clip(path);
  }

  /**
   * @public
   */
  resetClip() {
    command('resetClip');
    this._context.resetClip();
  }

  /**
   * @public
   *
   * @param {*} a
   * @param {*} b
   * @param {*} c
   * @returns {*}
   */
  isPointInPath(a, b, c) {
    command('isPointInPath', c ? [a, b, c] : [a, b]);
    return this._context.isPointInPath(a, b, c);
  }

  /**
   * @public
   *
   * @param {*} text
   * @param {number} x
   * @param {number} y
   * @param {*} maxWidth
   */
  fillText(text, x, y, maxWidth) {
    command('fillText', maxWidth !== undefined ? [text, x, y, maxWidth] : [text, x, y]);
    this._context.fillText(text, x, y, maxWidth);
  }

  /**
   * @public
   *
   * @param {*} text
   * @param {number} x
   * @param {number} y
   * @param {*} maxWidth
   */
  strokeText(text, x, y, maxWidth) {
    command('strokeText', maxWidth !== undefined ? [text, x, y, maxWidth] : [text, x, y]);
    this._context.strokeText(text, x, y, maxWidth);
  }

  /**
   * @public
   *
   * @param {*} text
   * @returns {*}
   */
  measureText(text) {
    command('measureText', [text]);
    return this._context.measureText(text);
  }

  /**
   * @public
   *
   * @param {*} image
   * @param {*} a
   * @param {*} b
   * @param {*} c
   * @param {*} d
   * @param {*} e
   * @param {*} f
   * @param {*} g
   * @param {number} h
   */
  drawImage(image, a, b, c, d, e, f, g, h) {
    command('drawImage', c !== undefined ? e !== undefined ? [image, a, b, c, d, e, f, g, h] : [image, a, b, c, d] : [image, a, b]);
    this._context.drawImage(image, a, b, c, d, e, f, g, h);
  }

  /**
   * @public
   *
   * @param {[Object]} options
   */
  addHitRegion(options) {
    command('addHitRegion', [options]);
    this._context.addHitRegion(options);
  }

  /**
   * @public
   *
   * @param {[Object]} options
   */
  removeHitRegion(options) {
    command('removeHitRegion', [options]);
    this._context.removeHitRegion(options);
  }

  /**
   * @public
   *
   * @param {*} a
   * @param {*} b
   * @returns {*}
   */
  createImageData(a, b) {
    command('createImageData', b !== undefined ? [a, b] : [a]);
    return this._context.createImageData(a, b);
  }

  /**
   * @public
   *
   * @param {*} a
   * @param {*} b
   * @returns {*}
   */
  createImageDataHD(a, b) {
    command('createImageDataHD', [a, b]);
    return this._context.createImageDataHD(a, b);
  }

  /**
   * @public
   *
   * @param {*} sx
   * @param {*} sy
   * @param {*} sw
   * @param {*} sh
   * @returns {*}
   */
  getImageData(sx, sy, sw, sh) {
    command('getImageData', [sx, sy, sw, sh]);
    return this._context.getImageData(sx, sy, sw, sh);
  }

  /**
   * @public
   *
   * @param {*} sx
   * @param {*} sy
   * @param {*} sw
   * @param {*} sh
   * @returns {*}
   */
  getImageDataHD(sx, sy, sw, sh) {
    command('getImageDataHD', [sx, sy, sw, sh]);
    return this._context.getImageDataHD(sx, sy, sw, sh);
  }

  /**
   * @public
   *
   * @param {*} imageData
   * @param {*} dx
   * @param {*} dy
   * @param {*} dirtyX
   * @param {*} dirtyY
   * @param {*} dirtyWidth
   * @param {*} dirtyHeight
   */
  putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
    command('putImageData', dirtyX !== undefined ? [imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight] : [imageData, dx, dy]);
    this._context.putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
  }

  /**
   * @public
   *
   * @param {*} imageData
   * @param {*} dx
   * @param {*} dy
   * @param {*} dirtyX
   * @param {*} dirtyY
   * @param {*} dirtyWidth
   * @param {*} dirtyHeight
   */
  putImageDataHD(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
    command('putImageDataHD', dirtyX !== undefined ? [imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight] : [imageData, dx, dy]);
    this._context.putImageDataHD(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
  }

  /*---------------------------------------------------------------------------*
   * CanvasDrawingStyles
   *----------------------------------------------------------------------------*/

  /**
   * @public
   *
   * @returns {number}
   */
  get lineWidth() {
    attributeGet('lineWidth');
    return this._context.lineWidth;
  }

  /**
   * @public
   *
   * @param {number} value
   */
  set lineWidth(value) {
    attributeSet('lineWidth', value);
    this._context.lineWidth = value;
  }

  /**
   * @public
   *
   * @returns {string}
   */
  get lineCap() {
    attributeGet('lineCap');
    return this._context.lineCap;
  }

  /**
   * @public
   *
   * @param {string} value
   */
  set lineCap(value) {
    attributeSet('lineCap', value);
    this._context.lineCap = value;
  }

  /**
   * @public
   *
   * @returns {string}
   */
  get lineJoin() {
    attributeGet('lineJoin');
    return this._context.lineJoin;
  }

  /**
   * @public
   *
   * @param {string} value
   */
  set lineJoin(value) {
    attributeSet('lineJoin', value);
    this._context.lineJoin = value;
  }

  /**
   * @public
   *
   * @returns {number}
   */
  get miterLimit() {
    attributeGet('miterLimit');
    return this._context.miterLimit;
  }

  /**
   * @public
   *
   * @param {number} value
   */
  set miterLimit(value) {
    attributeSet('miterLimit', value);
    this._context.miterLimit = value;
  }

  /**
   * @public
   *
   * @param {*} segments
   */
  setLineDash(segments) {
    command('setLineDash', [segments]);
    this._context.setLineDash(segments);
  }

  /**
   * @public
   * @returns {*}
   */
  getLineDash() {
    command('getLineDash');
    return this._context.getLineDash();
  }

  /**
   * @public
   *
   * @returns {number}
   */
  get lineDashOffset() {
    attributeGet('lineDashOffset');
    return this._context.lineDashOffset;
  }

  /**
   * @public
   *
   * @param {number} value
   */
  set lineDashOffset(value) {
    attributeSet('lineDashOffset', value);
    this._context.lineDashOffset = value;
  }

  /**
   * @public
   *
   * @returns {string}
   */
  get font() {
    attributeGet('font');
    return this._context.font;
  }

  /**
   * @public
   *
   * @param {string} value
   */
  set font(value) {
    attributeSet('font', value);
    this._context.font = value;
  }

  /**
   * @public
   *
   * @returns {string}
   */
  get textAlign() {
    attributeGet('textAlign');
    return this._context.textAlign;
  }

  /**
   * @public
   *
   * @param {string} value
   */
  set textAlign(value) {
    attributeSet('textAlign', value);
    this._context.textAlign = value;
  }

  /**
   * @public
   *
   * @returns {string}
   */
  get textBaseline() {
    attributeGet('textBaseline');
    return this._context.textBaseline;
  }

  /**
   * @public
   *
   * @param {string} value
   */
  set textBaseline(value) {
    attributeSet('textBaseline', value);
    this._context.textBaseline = value;
  }

  /**
   * @public
   *
   * @returns {string}
   */
  get direction() {
    attributeGet('direction');
    return this._context.direction;
  }

  /**
   * @public
   *
   * @param {string} value
   */
  set direction(value) {
    attributeSet('direction', value);
    this._context.direction = value;
  }

  /*---------------------------------------------------------------------------*
   * CanvasPathMethods
   *----------------------------------------------------------------------------*/

  /**
   * @public
   */
  closePath() {
    command('closePath');
    this._context.closePath();
  }

  /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   */
  moveTo(x, y) {
    command('moveTo', [x, y]);
    this._context.moveTo(x, y);
  }

  /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   */
  lineTo(x, y) {
    command('lineTo', [x, y]);
    this._context.lineTo(x, y);
  }

  /**
   * @public
   *
   * @param {*} cpx
   * @param {*} cpy
   * @param {number} x
   * @param {number} y
   */
  quadraticCurveTo(cpx, cpy, x, y) {
    command('quadraticCurveTo', [cpx, cpy, x, y]);
    this._context.quadraticCurveTo(cpx, cpy, x, y);
  }

  /**
   * @public
   *
   * @param {*} cp1x
   * @param {*} cp1y
   * @param {*} cp2x
   * @param {*} cp2y
   * @param {number} x
   * @param {number} y
   */
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    command('bezierCurveTo', [cp1x, cp1y, cp2x, cp2y, x, y]);
    this._context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  /**
   * @public
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} radiusX
   * @param {number} radiusY
   * @param {number} rotation
   */
  arcTo(x1, y1, x2, y2, radiusX, radiusY, rotation) {
    command('arcTo', radiusY !== undefined ? [x1, y1, x2, y2, radiusX, radiusY, rotation] : [x1, y1, x2, y2, radiusX]);
    this._context.arcTo(x1, y1, x2, y2, radiusX, radiusY, rotation);
  }

  /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  rect(x, y, w, h) {
    command('rect', [x, y, w, h]);
    this._context.rect(x, y, w, h);
  }

  /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {number} startAngle
   * @param {number} endAngle
   * @param {boolean} anticlockwise
   */
  arc(x, y, radius, startAngle, endAngle, anticlockwise) {
    command('arc', [x, y, radius, startAngle, endAngle, anticlockwise]);
    this._context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
  }

  /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} radiusX
   * @param {number} radiusY
   * @param {number} rotation
   * @param {number} startAngle
   * @param {number} endAngle
   * @param {boolean} anticlockwise
   */
  ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
    command('ellipse', [x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise]);
    this._context.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
  }
}
scenery.register('DebugContext', DebugContext);
export default DebugContext;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzY2VuZXJ5IiwicyIsInZhbHVlIiwiSlNPTiIsInN0cmluZ2lmeSIsImxvZyIsIm1lc3NhZ2UiLCJjb25zb2xlIiwiYXR0cmlidXRlR2V0IiwibmFtZSIsImF0dHJpYnV0ZVNldCIsImNvbW1hbmQiLCJhcmdzIiwidW5kZWZpbmVkIiwibGVuZ3RoIiwiXyIsInJlZHVjZSIsIm1lbW8iLCJhcmciLCJEZWJ1Z0NvbnRleHQiLCJjb25zdHJ1Y3RvciIsImNvbnRleHQiLCJfY29udGV4dCIsImVsbGlwc2UiLCJjYW52YXMiLCJ3aWR0aCIsImhlaWdodCIsImNvbW1pdCIsInNhdmUiLCJyZXN0b3JlIiwiY3VycmVudFRyYW5zZm9ybSIsInRyYW5zZm9ybSIsInNjYWxlIiwieCIsInkiLCJyb3RhdGUiLCJhbmdsZSIsInRyYW5zbGF0ZSIsImEiLCJiIiwiYyIsImQiLCJlIiwiZiIsInNldFRyYW5zZm9ybSIsInJlc2V0VHJhbnNmb3JtIiwiZ2xvYmFsQWxwaGEiLCJnbG9iYWxDb21wb3NpdGVPcGVyYXRpb24iLCJpbWFnZVNtb290aGluZ0VuYWJsZWQiLCJzdHJva2VTdHlsZSIsImZpbGxTdHlsZSIsImNyZWF0ZUxpbmVhckdyYWRpZW50IiwieDAiLCJ5MCIsIngxIiwieTEiLCJjcmVhdGVSYWRpYWxHcmFkaWVudCIsInIwIiwicjEiLCJjcmVhdGVQYXR0ZXJuIiwiaW1hZ2UiLCJyZXBldGl0aW9uIiwic2hhZG93T2Zmc2V0WCIsInNoYWRvd09mZnNldFkiLCJzaGFkb3dCbHVyIiwic2hhZG93Q29sb3IiLCJjbGVhclJlY3QiLCJ3IiwiaCIsImZpbGxSZWN0Iiwic3Ryb2tlUmVjdCIsImZpbGxSdWxlIiwiYmVnaW5QYXRoIiwiZmlsbCIsInBhdGgiLCJzdHJva2UiLCJzY3JvbGxQYXRoSW50b1ZpZXciLCJjbGlwIiwicmVzZXRDbGlwIiwiaXNQb2ludEluUGF0aCIsImZpbGxUZXh0IiwidGV4dCIsIm1heFdpZHRoIiwic3Ryb2tlVGV4dCIsIm1lYXN1cmVUZXh0IiwiZHJhd0ltYWdlIiwiZyIsImFkZEhpdFJlZ2lvbiIsIm9wdGlvbnMiLCJyZW1vdmVIaXRSZWdpb24iLCJjcmVhdGVJbWFnZURhdGEiLCJjcmVhdGVJbWFnZURhdGFIRCIsImdldEltYWdlRGF0YSIsInN4Iiwic3kiLCJzdyIsInNoIiwiZ2V0SW1hZ2VEYXRhSEQiLCJwdXRJbWFnZURhdGEiLCJpbWFnZURhdGEiLCJkeCIsImR5IiwiZGlydHlYIiwiZGlydHlZIiwiZGlydHlXaWR0aCIsImRpcnR5SGVpZ2h0IiwicHV0SW1hZ2VEYXRhSEQiLCJsaW5lV2lkdGgiLCJsaW5lQ2FwIiwibGluZUpvaW4iLCJtaXRlckxpbWl0Iiwic2V0TGluZURhc2giLCJzZWdtZW50cyIsImdldExpbmVEYXNoIiwibGluZURhc2hPZmZzZXQiLCJmb250IiwidGV4dEFsaWduIiwidGV4dEJhc2VsaW5lIiwiZGlyZWN0aW9uIiwiY2xvc2VQYXRoIiwibW92ZVRvIiwibGluZVRvIiwicXVhZHJhdGljQ3VydmVUbyIsImNweCIsImNweSIsImJlemllckN1cnZlVG8iLCJjcDF4IiwiY3AxeSIsImNwMngiLCJjcDJ5IiwiYXJjVG8iLCJ4MiIsInkyIiwicmFkaXVzWCIsInJhZGl1c1kiLCJyb3RhdGlvbiIsInJlY3QiLCJhcmMiLCJyYWRpdXMiLCJzdGFydEFuZ2xlIiwiZW5kQW5nbGUiLCJhbnRpY2xvY2t3aXNlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEZWJ1Z0NvbnRleHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBkZWJ1Z2dpbmcgdmVyc2lvbiBvZiB0aGUgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHRoYXQgd2lsbCBvdXRwdXQgYWxsIGNvbW1hbmRzIGlzc3VlZCxcclxuICogYnV0IGNhbiBhbHNvIGZvcndhcmQgdGhlbSB0byBhIHJlYWwgY29udGV4dFxyXG4gKlxyXG4gKiBTZWUgdGhlIHNwZWMgYXQgaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2UvdGhlLWNhbnZhcy1lbGVtZW50Lmh0bWwjMmRjb250ZXh0XHJcbiAqIFdyYXBwaW5nIG9mIHRoZSBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgaW50ZXJmYWNlIGFzIG9mIEphbnVhcnkgMjd0aCwgMjAxMyAoYnV0IG5vdCBvdGhlciBpbnRlcmZhY2VzIGxpa2UgVGV4dE1ldHJpY3MgYW5kIFBhdGgpXHJcbiAqXHJcbiAqIFNob3J0Y3V0IHRvIGNyZWF0ZTpcclxuICogICAgdmFyIGNvbnRleHQgPSBuZXcgcGhldC5zY2VuZXJ5LkRlYnVnQ29udGV4dCggZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKS5nZXRDb250ZXh0KCAnMmQnICkgKTtcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBzY2VuZXJ5IGZyb20gJy4uL3NjZW5lcnkuanMnO1xyXG5cclxuLy8gdXNlZCB0byBzZXJpYWxpemUgYXJndW1lbnRzIHNvIHRoYXQgaXQgZGlzcGxheXMgZXhhY3RseSBsaWtlIHRoZSBjYWxsIHdvdWxkIGJlIGV4ZWN1dGVkXHJcbmZ1bmN0aW9uIHMoIHZhbHVlICkge1xyXG4gIHJldHVybiBKU09OLnN0cmluZ2lmeSggdmFsdWUgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbG9nKCBtZXNzYWdlICkge1xyXG4gIGNvbnNvbGUubG9nKCBgY29udGV4dC4ke21lc3NhZ2V9O2AgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYXR0cmlidXRlR2V0KCBuYW1lICkge1xyXG4gIGxvZyggbmFtZSApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhdHRyaWJ1dGVTZXQoIG5hbWUsIHZhbHVlICkge1xyXG4gIGxvZyggYCR7bmFtZX0gPSAke3MoIHZhbHVlICl9YCApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb21tYW5kKCBuYW1lLCBhcmdzICkge1xyXG4gIGlmICggYXJncyA9PT0gdW5kZWZpbmVkIHx8IGFyZ3MubGVuZ3RoID09PSAwICkge1xyXG4gICAgbG9nKCBgJHtuYW1lfSgpYCApO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIGxvZyggYCR7bmFtZX0oICR7Xy5yZWR1Y2UoIGFyZ3MsICggbWVtbywgYXJnICkgPT4ge1xyXG4gICAgICBpZiAoIG1lbW8ubGVuZ3RoID4gMCApIHtcclxuICAgICAgICByZXR1cm4gYCR7bWVtb30sICR7cyggYXJnICl9YDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gcyggYXJnICk7XHJcbiAgICAgIH1cclxuICAgIH0sICcnICl9IClgICk7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBEZWJ1Z0NvbnRleHQge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjb250ZXh0XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNvbnRleHQgKSB7XHJcbiAgICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcclxuXHJcbiAgICAvLyBhbGxvdyBjaGVja2luZyBvZiBjb250ZXh0LmVsbGlwc2UgZm9yIGV4aXN0ZW5jZVxyXG4gICAgaWYgKCBjb250ZXh0ICYmICFjb250ZXh0LmVsbGlwc2UgKSB7XHJcbiAgICAgIHRoaXMuZWxsaXBzZSA9IGNvbnRleHQuZWxsaXBzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtIVE1MQ2FudmFzRWxlbWVudH1cclxuICAgKi9cclxuICBnZXQgY2FudmFzKCkge1xyXG4gICAgYXR0cmlidXRlR2V0KCAnY2FudmFzJyApO1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQuY2FudmFzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXQgd2lkdGgoKSB7XHJcbiAgICBhdHRyaWJ1dGVHZXQoICd3aWR0aCcgKTtcclxuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LndpZHRoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXQgaGVpZ2h0KCkge1xyXG4gICAgYXR0cmlidXRlR2V0KCAnaGVpZ2h0JyApO1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQuaGVpZ2h0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNvbW1pdCgpIHtcclxuICAgIGNvbW1hbmQoICdjb21taXQnICk7XHJcbiAgICB0aGlzLl9jb250ZXh0LmNvbW1pdCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNhdmUoKSB7XHJcbiAgICBjb21tYW5kKCAnc2F2ZScgKTtcclxuICAgIHRoaXMuX2NvbnRleHQuc2F2ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc3RvcmUoKSB7XHJcbiAgICBjb21tYW5kKCAncmVzdG9yZScgKTtcclxuICAgIHRoaXMuX2NvbnRleHQucmVzdG9yZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge0RPTU1hdHJpeH1cclxuICAgKi9cclxuICBnZXQgY3VycmVudFRyYW5zZm9ybSgpIHtcclxuICAgIGF0dHJpYnV0ZUdldCggJ2N1cnJlbnRUcmFuc2Zvcm0nICk7XHJcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5jdXJyZW50VHJhbnNmb3JtO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtET01NYXRyaXh9IHRyYW5zZm9ybVxyXG4gICAqL1xyXG4gIHNldCBjdXJyZW50VHJhbnNmb3JtKCB0cmFuc2Zvcm0gKSB7XHJcbiAgICBhdHRyaWJ1dGVTZXQoICdjdXJyZW50VHJhbnNmb3JtJywgdHJhbnNmb3JtICk7XHJcbiAgICB0aGlzLl9jb250ZXh0LmN1cnJlbnRUcmFuc2Zvcm0gPSB0cmFuc2Zvcm07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICovXHJcbiAgc2NhbGUoIHgsIHkgKSB7XHJcbiAgICBjb21tYW5kKCAnc2NhbGUnLCBbIHgsIHkgXSApO1xyXG4gICAgdGhpcy5fY29udGV4dC5zY2FsZSggeCwgeSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlXHJcbiAgICovXHJcbiAgcm90YXRlKCBhbmdsZSApIHtcclxuICAgIGNvbW1hbmQoICdyb3RhdGUnLCBbIGFuZ2xlIF0gKTtcclxuICAgIHRoaXMuX2NvbnRleHQucm90YXRlKCBhbmdsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqL1xyXG4gIHRyYW5zbGF0ZSggeCwgeSApIHtcclxuICAgIGNvbW1hbmQoICd0cmFuc2xhdGUnLCBbIHgsIHkgXSApO1xyXG4gICAgdGhpcy5fY29udGV4dC50cmFuc2xhdGUoIHgsIHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJcclxuICAgKiBAcGFyYW0ge251bWJlcn0gY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZlxyXG4gICAqL1xyXG4gIHRyYW5zZm9ybSggYSwgYiwgYywgZCwgZSwgZiApIHtcclxuICAgIGNvbW1hbmQoICd0cmFuc2Zvcm0nLCBbIGEsIGIsIGMsIGQsIGUsIGYgXSApO1xyXG4gICAgdGhpcy5fY29udGV4dC50cmFuc2Zvcm0oIGEsIGIsIGMsIGQsIGUsIGYgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJcclxuICAgKiBAcGFyYW0ge251bWJlcn0gY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZlxyXG4gICAqL1xyXG4gIHNldFRyYW5zZm9ybSggYSwgYiwgYywgZCwgZSwgZiApIHtcclxuICAgIGNvbW1hbmQoICdzZXRUcmFuc2Zvcm0nLCBbIGEsIGIsIGMsIGQsIGUsIGYgXSApO1xyXG4gICAgdGhpcy5fY29udGV4dC5zZXRUcmFuc2Zvcm0oIGEsIGIsIGMsIGQsIGUsIGYgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldFRyYW5zZm9ybSgpIHtcclxuICAgIGNvbW1hbmQoICdyZXNldFRyYW5zZm9ybScgKTtcclxuICAgIHRoaXMuX2NvbnRleHQucmVzZXRUcmFuc2Zvcm0oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0IGdsb2JhbEFscGhhKCkge1xyXG4gICAgYXR0cmlidXRlR2V0KCAnZ2xvYmFsQWxwaGEnICk7XHJcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5nbG9iYWxBbHBoYTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxyXG4gICAqL1xyXG4gIHNldCBnbG9iYWxBbHBoYSggdmFsdWUgKSB7XHJcbiAgICBhdHRyaWJ1dGVTZXQoICdnbG9iYWxBbHBoYScsIHZhbHVlICk7XHJcbiAgICB0aGlzLl9jb250ZXh0Lmdsb2JhbEFscGhhID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldCBnbG9iYWxDb21wb3NpdGVPcGVyYXRpb24oKSB7XHJcbiAgICBhdHRyaWJ1dGVHZXQoICdnbG9iYWxDb21wb3NpdGVPcGVyYXRpb24nICk7XHJcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcclxuICAgKi9cclxuICBzZXQgZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uKCB2YWx1ZSApIHtcclxuICAgIGF0dHJpYnV0ZVNldCggJ2dsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbicsIHZhbHVlICk7XHJcbiAgICB0aGlzLl9jb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgZ2V0IGltYWdlU21vb3RoaW5nRW5hYmxlZCgpIHtcclxuICAgIGF0dHJpYnV0ZUdldCggJ2ltYWdlU21vb3RoaW5nRW5hYmxlZCcgKTtcclxuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LmltYWdlU21vb3RoaW5nRW5hYmxlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWVcclxuICAgKi9cclxuICBzZXQgaW1hZ2VTbW9vdGhpbmdFbmFibGVkKCB2YWx1ZSApIHtcclxuICAgIGF0dHJpYnV0ZVNldCggJ2ltYWdlU21vb3RoaW5nRW5hYmxlZCcsIHZhbHVlICk7XHJcbiAgICB0aGlzLl9jb250ZXh0LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXQgc3Ryb2tlU3R5bGUoKSB7XHJcbiAgICBhdHRyaWJ1dGVHZXQoICdzdHJva2VTdHlsZScgKTtcclxuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LnN0cm9rZVN0eWxlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXHJcbiAgICovXHJcbiAgc2V0IHN0cm9rZVN0eWxlKCB2YWx1ZSApIHtcclxuICAgIGF0dHJpYnV0ZVNldCggJ3N0cm9rZVN0eWxlJywgdmFsdWUgKTtcclxuICAgIHRoaXMuX2NvbnRleHQuc3Ryb2tlU3R5bGUgPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0IGZpbGxTdHlsZSgpIHtcclxuICAgIGF0dHJpYnV0ZUdldCggJ2ZpbGxTdHlsZScgKTtcclxuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LmZpbGxTdHlsZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxyXG4gICAqL1xyXG4gIHNldCBmaWxsU3R5bGUoIHZhbHVlICkge1xyXG4gICAgYXR0cmlidXRlU2V0KCAnZmlsbFN0eWxlJywgdmFsdWUgKTtcclxuICAgIHRoaXMuX2NvbnRleHQuZmlsbFN0eWxlID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICAvLyBUT0RPOiBjcmVhdGUgd3JhcHBlclxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5MFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5MVxyXG4gICAqIEByZXR1cm5zIHsqfVxyXG4gICAqL1xyXG4gIGNyZWF0ZUxpbmVhckdyYWRpZW50KCB4MCwgeTAsIHgxLCB5MSApIHtcclxuICAgIGNvbW1hbmQoICdjcmVhdGVMaW5lYXJHcmFkaWVudCcsIFsgeDAsIHkwLCB4MSwgeTEgXSApO1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQuY3JlYXRlTGluZWFyR3JhZGllbnQoIHgwLCB5MCwgeDEsIHkxICk7XHJcbiAgfVxyXG5cclxuICAvLyBUT0RPOiBjcmVhdGUgd3JhcHBlclxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5MFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByMFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5MVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByMVxyXG4gICAqIEByZXR1cm5zIHsqfVxyXG4gICAqL1xyXG4gIGNyZWF0ZVJhZGlhbEdyYWRpZW50KCB4MCwgeTAsIHIwLCB4MSwgeTEsIHIxICkge1xyXG4gICAgY29tbWFuZCggJ2NyZWF0ZVJhZGlhbEdyYWRpZW50JywgWyB4MCwgeTAsIHIwLCB4MSwgeTEsIHIxIF0gKTtcclxuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LmNyZWF0ZVJhZGlhbEdyYWRpZW50KCB4MCwgeTAsIHIwLCB4MSwgeTEsIHIxICk7XHJcbiAgfVxyXG5cclxuICAvLyBUT0RPOiBjcmVhdGUgd3JhcHBlclxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Kn0gaW1hZ2VcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVwZXRpdGlvblxyXG4gICAqIEByZXR1cm5zIHsqfVxyXG4gICAqL1xyXG4gIGNyZWF0ZVBhdHRlcm4oIGltYWdlLCByZXBldGl0aW9uICkge1xyXG4gICAgY29tbWFuZCggJ2NyZWF0ZVBhdHRlcm4nLCBbIGltYWdlLCByZXBldGl0aW9uIF0gKTtcclxuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LmNyZWF0ZVBhdHRlcm4oIGltYWdlLCByZXBldGl0aW9uICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldCBzaGFkb3dPZmZzZXRYKCkge1xyXG4gICAgYXR0cmlidXRlR2V0KCAnc2hhZG93T2Zmc2V0WCcgKTtcclxuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LnNoYWRvd09mZnNldFg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcclxuICAgKi9cclxuICBzZXQgc2hhZG93T2Zmc2V0WCggdmFsdWUgKSB7XHJcbiAgICBhdHRyaWJ1dGVTZXQoICdzaGFkb3dPZmZzZXRYJywgdmFsdWUgKTtcclxuICAgIHRoaXMuX2NvbnRleHQuc2hhZG93T2Zmc2V0WCA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXQgc2hhZG93T2Zmc2V0WSgpIHtcclxuICAgIGF0dHJpYnV0ZUdldCggJ3NoYWRvd09mZnNldFknICk7XHJcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5zaGFkb3dPZmZzZXRZO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXHJcbiAgICovXHJcbiAgc2V0IHNoYWRvd09mZnNldFkoIHZhbHVlICkge1xyXG4gICAgYXR0cmlidXRlU2V0KCAnc2hhZG93T2Zmc2V0WScsIHZhbHVlICk7XHJcbiAgICB0aGlzLl9jb250ZXh0LnNoYWRvd09mZnNldFkgPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0IHNoYWRvd0JsdXIoKSB7XHJcbiAgICBhdHRyaWJ1dGVHZXQoICdzaGFkb3dCbHVyJyApO1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQuc2hhZG93Qmx1cjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxyXG4gICAqL1xyXG4gIHNldCBzaGFkb3dCbHVyKCB2YWx1ZSApIHtcclxuICAgIGF0dHJpYnV0ZVNldCggJ3NoYWRvd0JsdXInLCB2YWx1ZSApO1xyXG4gICAgdGhpcy5fY29udGV4dC5zaGFkb3dCbHVyID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldCBzaGFkb3dDb2xvcigpIHtcclxuICAgIGF0dHJpYnV0ZUdldCggJ3NoYWRvd0NvbG9yJyApO1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQuc2hhZG93Q29sb3I7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcclxuICAgKi9cclxuICBzZXQgc2hhZG93Q29sb3IoIHZhbHVlICkge1xyXG4gICAgYXR0cmlidXRlU2V0KCAnc2hhZG93Q29sb3InLCB2YWx1ZSApO1xyXG4gICAgdGhpcy5fY29udGV4dC5zaGFkb3dDb2xvciA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhcclxuICAgKi9cclxuICBjbGVhclJlY3QoIHgsIHksIHcsIGggKSB7XHJcbiAgICBjb21tYW5kKCAnY2xlYXJSZWN0JywgWyB4LCB5LCB3LCBoIF0gKTtcclxuICAgIHRoaXMuX2NvbnRleHQuY2xlYXJSZWN0KCB4LCB5LCB3LCBoICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaFxyXG4gICAqL1xyXG4gIGZpbGxSZWN0KCB4LCB5LCB3LCBoICkge1xyXG4gICAgY29tbWFuZCggJ2ZpbGxSZWN0JywgWyB4LCB5LCB3LCBoIF0gKTtcclxuICAgIHRoaXMuX2NvbnRleHQuZmlsbFJlY3QoIHgsIHksIHcsIGggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gd1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoXHJcbiAgICovXHJcbiAgc3Ryb2tlUmVjdCggeCwgeSwgdywgaCApIHtcclxuICAgIGNvbW1hbmQoICdzdHJva2VSZWN0JywgWyB4LCB5LCB3LCBoIF0gKTtcclxuICAgIHRoaXMuX2NvbnRleHQuc3Ryb2tlUmVjdCggeCwgeSwgdywgaCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXQgZmlsbFJ1bGUoKSB7XHJcbiAgICBhdHRyaWJ1dGVHZXQoICdmaWxsUnVsZScgKTtcclxuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LmZpbGxSdWxlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXHJcbiAgICovXHJcbiAgc2V0IGZpbGxSdWxlKCB2YWx1ZSApIHtcclxuICAgIGF0dHJpYnV0ZVNldCggJ2ZpbGxSdWxlJywgdmFsdWUgKTtcclxuICAgIHRoaXMuX2NvbnRleHQuZmlsbFJ1bGUgPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBiZWdpblBhdGgoKSB7XHJcbiAgICBjb21tYW5kKCAnYmVnaW5QYXRoJyApO1xyXG4gICAgdGhpcy5fY29udGV4dC5iZWdpblBhdGgoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UGF0aDJEfSBwYXRoXHJcbiAgICovXHJcbiAgZmlsbCggcGF0aCApIHtcclxuICAgIGlmICggcGF0aCApIHtcclxuICAgICAgY29tbWFuZCggJ2ZpbGwnLCBbIHBhdGggXSApO1xyXG4gICAgICB0aGlzLl9jb250ZXh0LmZpbGwoIHBhdGggKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBjb21tYW5kKCAnZmlsbCcgKTtcclxuICAgICAgdGhpcy5fY29udGV4dC5maWxsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BhdGgyRH0gcGF0aFxyXG4gICAqL1xyXG4gIHN0cm9rZSggcGF0aCApIHtcclxuICAgIGlmICggcGF0aCApIHtcclxuICAgICAgY29tbWFuZCggJ3N0cm9rZScsIFsgcGF0aCBdICk7XHJcbiAgICAgIHRoaXMuX2NvbnRleHQuc3Ryb2tlKCBwYXRoICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29tbWFuZCggJ3N0cm9rZScgKTtcclxuICAgICAgdGhpcy5fY29udGV4dC5zdHJva2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UGF0aDJEfSBwYXRoXHJcbiAgICovXHJcbiAgc2Nyb2xsUGF0aEludG9WaWV3KCBwYXRoICkge1xyXG4gICAgY29tbWFuZCggJ3Njcm9sbFBhdGhJbnRvVmlldycsIHBhdGggPyBbIHBhdGggXSA6IHVuZGVmaW5lZCApO1xyXG4gICAgdGhpcy5fY29udGV4dC5zY3JvbGxQYXRoSW50b1ZpZXcoIHBhdGggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UGF0aDJEfSBwYXRoXHJcbiAgICovXHJcbiAgY2xpcCggcGF0aCApIHtcclxuICAgIGNvbW1hbmQoICdjbGlwJywgcGF0aCA/IFsgcGF0aCBdIDogdW5kZWZpbmVkICk7XHJcbiAgICB0aGlzLl9jb250ZXh0LmNsaXAoIHBhdGggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldENsaXAoKSB7XHJcbiAgICBjb21tYW5kKCAncmVzZXRDbGlwJyApO1xyXG4gICAgdGhpcy5fY29udGV4dC5yZXNldENsaXAoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Kn0gYVxyXG4gICAqIEBwYXJhbSB7Kn0gYlxyXG4gICAqIEBwYXJhbSB7Kn0gY1xyXG4gICAqIEByZXR1cm5zIHsqfVxyXG4gICAqL1xyXG4gIGlzUG9pbnRJblBhdGgoIGEsIGIsIGMgKSB7XHJcbiAgICBjb21tYW5kKCAnaXNQb2ludEluUGF0aCcsIGMgPyBbIGEsIGIsIGMgXSA6IFsgYSwgYiBdICk7XHJcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5pc1BvaW50SW5QYXRoKCBhLCBiLCBjICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0geyp9IHRleHRcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHBhcmFtIHsqfSBtYXhXaWR0aFxyXG4gICAqL1xyXG4gIGZpbGxUZXh0KCB0ZXh0LCB4LCB5LCBtYXhXaWR0aCApIHtcclxuICAgIGNvbW1hbmQoICdmaWxsVGV4dCcsIG1heFdpZHRoICE9PSB1bmRlZmluZWQgPyBbIHRleHQsIHgsIHksIG1heFdpZHRoIF0gOiBbIHRleHQsIHgsIHkgXSApO1xyXG4gICAgdGhpcy5fY29udGV4dC5maWxsVGV4dCggdGV4dCwgeCwgeSwgbWF4V2lkdGggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Kn0gdGV4dFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKiBAcGFyYW0geyp9IG1heFdpZHRoXHJcbiAgICovXHJcbiAgc3Ryb2tlVGV4dCggdGV4dCwgeCwgeSwgbWF4V2lkdGggKSB7XHJcbiAgICBjb21tYW5kKCAnc3Ryb2tlVGV4dCcsIG1heFdpZHRoICE9PSB1bmRlZmluZWQgPyBbIHRleHQsIHgsIHksIG1heFdpZHRoIF0gOiBbIHRleHQsIHgsIHkgXSApO1xyXG4gICAgdGhpcy5fY29udGV4dC5zdHJva2VUZXh0KCB0ZXh0LCB4LCB5LCBtYXhXaWR0aCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHsqfSB0ZXh0XHJcbiAgICogQHJldHVybnMgeyp9XHJcbiAgICovXHJcbiAgbWVhc3VyZVRleHQoIHRleHQgKSB7XHJcbiAgICBjb21tYW5kKCAnbWVhc3VyZVRleHQnLCBbIHRleHQgXSApO1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQubWVhc3VyZVRleHQoIHRleHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Kn0gaW1hZ2VcclxuICAgKiBAcGFyYW0geyp9IGFcclxuICAgKiBAcGFyYW0geyp9IGJcclxuICAgKiBAcGFyYW0geyp9IGNcclxuICAgKiBAcGFyYW0geyp9IGRcclxuICAgKiBAcGFyYW0geyp9IGVcclxuICAgKiBAcGFyYW0geyp9IGZcclxuICAgKiBAcGFyYW0geyp9IGdcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaFxyXG4gICAqL1xyXG4gIGRyYXdJbWFnZSggaW1hZ2UsIGEsIGIsIGMsIGQsIGUsIGYsIGcsIGggKSB7XHJcbiAgICBjb21tYW5kKCAnZHJhd0ltYWdlJywgYyAhPT0gdW5kZWZpbmVkID8gKCBlICE9PSB1bmRlZmluZWQgPyBbIGltYWdlLCBhLCBiLCBjLCBkLCBlLCBmLCBnLCBoIF0gOiBbIGltYWdlLCBhLCBiLCBjLCBkIF0gKSA6IFsgaW1hZ2UsIGEsIGIgXSApO1xyXG4gICAgdGhpcy5fY29udGV4dC5kcmF3SW1hZ2UoIGltYWdlLCBhLCBiLCBjLCBkLCBlLCBmLCBnLCBoICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1tPYmplY3RdfSBvcHRpb25zXHJcbiAgICovXHJcbiAgYWRkSGl0UmVnaW9uKCBvcHRpb25zICkge1xyXG4gICAgY29tbWFuZCggJ2FkZEhpdFJlZ2lvbicsIFsgb3B0aW9ucyBdICk7XHJcbiAgICB0aGlzLl9jb250ZXh0LmFkZEhpdFJlZ2lvbiggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtbT2JqZWN0XX0gb3B0aW9uc1xyXG4gICAqL1xyXG4gIHJlbW92ZUhpdFJlZ2lvbiggb3B0aW9ucyApIHtcclxuICAgIGNvbW1hbmQoICdyZW1vdmVIaXRSZWdpb24nLCBbIG9wdGlvbnMgXSApO1xyXG4gICAgdGhpcy5fY29udGV4dC5yZW1vdmVIaXRSZWdpb24oIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Kn0gYVxyXG4gICAqIEBwYXJhbSB7Kn0gYlxyXG4gICAqIEByZXR1cm5zIHsqfVxyXG4gICAqL1xyXG4gIGNyZWF0ZUltYWdlRGF0YSggYSwgYiApIHtcclxuICAgIGNvbW1hbmQoICdjcmVhdGVJbWFnZURhdGEnLCBiICE9PSB1bmRlZmluZWQgPyBbIGEsIGIgXSA6IFsgYSBdICk7XHJcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5jcmVhdGVJbWFnZURhdGEoIGEsIGIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Kn0gYVxyXG4gICAqIEBwYXJhbSB7Kn0gYlxyXG4gICAqIEByZXR1cm5zIHsqfVxyXG4gICAqL1xyXG4gIGNyZWF0ZUltYWdlRGF0YUhEKCBhLCBiICkge1xyXG4gICAgY29tbWFuZCggJ2NyZWF0ZUltYWdlRGF0YUhEJywgWyBhLCBiIF0gKTtcclxuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LmNyZWF0ZUltYWdlRGF0YUhEKCBhLCBiICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0geyp9IHN4XHJcbiAgICogQHBhcmFtIHsqfSBzeVxyXG4gICAqIEBwYXJhbSB7Kn0gc3dcclxuICAgKiBAcGFyYW0geyp9IHNoXHJcbiAgICogQHJldHVybnMgeyp9XHJcbiAgICovXHJcbiAgZ2V0SW1hZ2VEYXRhKCBzeCwgc3ksIHN3LCBzaCApIHtcclxuICAgIGNvbW1hbmQoICdnZXRJbWFnZURhdGEnLCBbIHN4LCBzeSwgc3csIHNoIF0gKTtcclxuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LmdldEltYWdlRGF0YSggc3gsIHN5LCBzdywgc2ggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Kn0gc3hcclxuICAgKiBAcGFyYW0geyp9IHN5XHJcbiAgICogQHBhcmFtIHsqfSBzd1xyXG4gICAqIEBwYXJhbSB7Kn0gc2hcclxuICAgKiBAcmV0dXJucyB7Kn1cclxuICAgKi9cclxuICBnZXRJbWFnZURhdGFIRCggc3gsIHN5LCBzdywgc2ggKSB7XHJcbiAgICBjb21tYW5kKCAnZ2V0SW1hZ2VEYXRhSEQnLCBbIHN4LCBzeSwgc3csIHNoIF0gKTtcclxuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LmdldEltYWdlRGF0YUhEKCBzeCwgc3ksIHN3LCBzaCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHsqfSBpbWFnZURhdGFcclxuICAgKiBAcGFyYW0geyp9IGR4XHJcbiAgICogQHBhcmFtIHsqfSBkeVxyXG4gICAqIEBwYXJhbSB7Kn0gZGlydHlYXHJcbiAgICogQHBhcmFtIHsqfSBkaXJ0eVlcclxuICAgKiBAcGFyYW0geyp9IGRpcnR5V2lkdGhcclxuICAgKiBAcGFyYW0geyp9IGRpcnR5SGVpZ2h0XHJcbiAgICovXHJcbiAgcHV0SW1hZ2VEYXRhKCBpbWFnZURhdGEsIGR4LCBkeSwgZGlydHlYLCBkaXJ0eVksIGRpcnR5V2lkdGgsIGRpcnR5SGVpZ2h0ICkge1xyXG4gICAgY29tbWFuZCggJ3B1dEltYWdlRGF0YScsIGRpcnR5WCAhPT0gdW5kZWZpbmVkID8gWyBpbWFnZURhdGEsIGR4LCBkeSwgZGlydHlYLCBkaXJ0eVksIGRpcnR5V2lkdGgsIGRpcnR5SGVpZ2h0IF0gOiBbIGltYWdlRGF0YSwgZHgsIGR5IF0gKTtcclxuICAgIHRoaXMuX2NvbnRleHQucHV0SW1hZ2VEYXRhKCBpbWFnZURhdGEsIGR4LCBkeSwgZGlydHlYLCBkaXJ0eVksIGRpcnR5V2lkdGgsIGRpcnR5SGVpZ2h0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0geyp9IGltYWdlRGF0YVxyXG4gICAqIEBwYXJhbSB7Kn0gZHhcclxuICAgKiBAcGFyYW0geyp9IGR5XHJcbiAgICogQHBhcmFtIHsqfSBkaXJ0eVhcclxuICAgKiBAcGFyYW0geyp9IGRpcnR5WVxyXG4gICAqIEBwYXJhbSB7Kn0gZGlydHlXaWR0aFxyXG4gICAqIEBwYXJhbSB7Kn0gZGlydHlIZWlnaHRcclxuICAgKi9cclxuICBwdXRJbWFnZURhdGFIRCggaW1hZ2VEYXRhLCBkeCwgZHksIGRpcnR5WCwgZGlydHlZLCBkaXJ0eVdpZHRoLCBkaXJ0eUhlaWdodCApIHtcclxuICAgIGNvbW1hbmQoICdwdXRJbWFnZURhdGFIRCcsIGRpcnR5WCAhPT0gdW5kZWZpbmVkID8gWyBpbWFnZURhdGEsIGR4LCBkeSwgZGlydHlYLCBkaXJ0eVksIGRpcnR5V2lkdGgsIGRpcnR5SGVpZ2h0IF0gOiBbIGltYWdlRGF0YSwgZHgsIGR5IF0gKTtcclxuICAgIHRoaXMuX2NvbnRleHQucHV0SW1hZ2VEYXRhSEQoIGltYWdlRGF0YSwgZHgsIGR5LCBkaXJ0eVgsIGRpcnR5WSwgZGlydHlXaWR0aCwgZGlydHlIZWlnaHQgKTtcclxuICB9XHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIENhbnZhc0RyYXdpbmdTdHlsZXNcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldCBsaW5lV2lkdGgoKSB7XHJcbiAgICBhdHRyaWJ1dGVHZXQoICdsaW5lV2lkdGgnICk7XHJcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5saW5lV2lkdGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcclxuICAgKi9cclxuICBzZXQgbGluZVdpZHRoKCB2YWx1ZSApIHtcclxuICAgIGF0dHJpYnV0ZVNldCggJ2xpbmVXaWR0aCcsIHZhbHVlICk7XHJcbiAgICB0aGlzLl9jb250ZXh0LmxpbmVXaWR0aCA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXQgbGluZUNhcCgpIHtcclxuICAgIGF0dHJpYnV0ZUdldCggJ2xpbmVDYXAnICk7XHJcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5saW5lQ2FwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXHJcbiAgICovXHJcbiAgc2V0IGxpbmVDYXAoIHZhbHVlICkge1xyXG4gICAgYXR0cmlidXRlU2V0KCAnbGluZUNhcCcsIHZhbHVlICk7XHJcbiAgICB0aGlzLl9jb250ZXh0LmxpbmVDYXAgPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0IGxpbmVKb2luKCkge1xyXG4gICAgYXR0cmlidXRlR2V0KCAnbGluZUpvaW4nICk7XHJcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5saW5lSm9pbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxyXG4gICAqL1xyXG4gIHNldCBsaW5lSm9pbiggdmFsdWUgKSB7XHJcbiAgICBhdHRyaWJ1dGVTZXQoICdsaW5lSm9pbicsIHZhbHVlICk7XHJcbiAgICB0aGlzLl9jb250ZXh0LmxpbmVKb2luID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldCBtaXRlckxpbWl0KCkge1xyXG4gICAgYXR0cmlidXRlR2V0KCAnbWl0ZXJMaW1pdCcgKTtcclxuICAgIHJldHVybiB0aGlzLl9jb250ZXh0Lm1pdGVyTGltaXQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcclxuICAgKi9cclxuICBzZXQgbWl0ZXJMaW1pdCggdmFsdWUgKSB7XHJcbiAgICBhdHRyaWJ1dGVTZXQoICdtaXRlckxpbWl0JywgdmFsdWUgKTtcclxuICAgIHRoaXMuX2NvbnRleHQubWl0ZXJMaW1pdCA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHsqfSBzZWdtZW50c1xyXG4gICAqL1xyXG4gIHNldExpbmVEYXNoKCBzZWdtZW50cyApIHtcclxuICAgIGNvbW1hbmQoICdzZXRMaW5lRGFzaCcsIFsgc2VnbWVudHMgXSApO1xyXG4gICAgdGhpcy5fY29udGV4dC5zZXRMaW5lRGFzaCggc2VnbWVudHMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7Kn1cclxuICAgKi9cclxuICBnZXRMaW5lRGFzaCgpIHtcclxuICAgIGNvbW1hbmQoICdnZXRMaW5lRGFzaCcgKTtcclxuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LmdldExpbmVEYXNoKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldCBsaW5lRGFzaE9mZnNldCgpIHtcclxuICAgIGF0dHJpYnV0ZUdldCggJ2xpbmVEYXNoT2Zmc2V0JyApO1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQubGluZURhc2hPZmZzZXQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcclxuICAgKi9cclxuICBzZXQgbGluZURhc2hPZmZzZXQoIHZhbHVlICkge1xyXG4gICAgYXR0cmlidXRlU2V0KCAnbGluZURhc2hPZmZzZXQnLCB2YWx1ZSApO1xyXG4gICAgdGhpcy5fY29udGV4dC5saW5lRGFzaE9mZnNldCA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXQgZm9udCgpIHtcclxuICAgIGF0dHJpYnV0ZUdldCggJ2ZvbnQnICk7XHJcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5mb250O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXHJcbiAgICovXHJcbiAgc2V0IGZvbnQoIHZhbHVlICkge1xyXG4gICAgYXR0cmlidXRlU2V0KCAnZm9udCcsIHZhbHVlICk7XHJcbiAgICB0aGlzLl9jb250ZXh0LmZvbnQgPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0IHRleHRBbGlnbigpIHtcclxuICAgIGF0dHJpYnV0ZUdldCggJ3RleHRBbGlnbicgKTtcclxuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LnRleHRBbGlnbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxyXG4gICAqL1xyXG4gIHNldCB0ZXh0QWxpZ24oIHZhbHVlICkge1xyXG4gICAgYXR0cmlidXRlU2V0KCAndGV4dEFsaWduJywgdmFsdWUgKTtcclxuICAgIHRoaXMuX2NvbnRleHQudGV4dEFsaWduID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldCB0ZXh0QmFzZWxpbmUoKSB7XHJcbiAgICBhdHRyaWJ1dGVHZXQoICd0ZXh0QmFzZWxpbmUnICk7XHJcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC50ZXh0QmFzZWxpbmU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcclxuICAgKi9cclxuICBzZXQgdGV4dEJhc2VsaW5lKCB2YWx1ZSApIHtcclxuICAgIGF0dHJpYnV0ZVNldCggJ3RleHRCYXNlbGluZScsIHZhbHVlICk7XHJcbiAgICB0aGlzLl9jb250ZXh0LnRleHRCYXNlbGluZSA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXQgZGlyZWN0aW9uKCkge1xyXG4gICAgYXR0cmlidXRlR2V0KCAnZGlyZWN0aW9uJyApO1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQuZGlyZWN0aW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXHJcbiAgICovXHJcbiAgc2V0IGRpcmVjdGlvbiggdmFsdWUgKSB7XHJcbiAgICBhdHRyaWJ1dGVTZXQoICdkaXJlY3Rpb24nLCB2YWx1ZSApO1xyXG4gICAgdGhpcy5fY29udGV4dC5kaXJlY3Rpb24gPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIENhbnZhc1BhdGhNZXRob2RzXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNsb3NlUGF0aCgpIHtcclxuICAgIGNvbW1hbmQoICdjbG9zZVBhdGgnICk7XHJcbiAgICB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqL1xyXG4gIG1vdmVUbyggeCwgeSApIHtcclxuICAgIGNvbW1hbmQoICdtb3ZlVG8nLCBbIHgsIHkgXSApO1xyXG4gICAgdGhpcy5fY29udGV4dC5tb3ZlVG8oIHgsIHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKi9cclxuICBsaW5lVG8oIHgsIHkgKSB7XHJcbiAgICBjb21tYW5kKCAnbGluZVRvJywgWyB4LCB5IF0gKTtcclxuICAgIHRoaXMuX2NvbnRleHQubGluZVRvKCB4LCB5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0geyp9IGNweFxyXG4gICAqIEBwYXJhbSB7Kn0gY3B5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqL1xyXG4gIHF1YWRyYXRpY0N1cnZlVG8oIGNweCwgY3B5LCB4LCB5ICkge1xyXG4gICAgY29tbWFuZCggJ3F1YWRyYXRpY0N1cnZlVG8nLCBbIGNweCwgY3B5LCB4LCB5IF0gKTtcclxuICAgIHRoaXMuX2NvbnRleHQucXVhZHJhdGljQ3VydmVUbyggY3B4LCBjcHksIHgsIHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Kn0gY3AxeFxyXG4gICAqIEBwYXJhbSB7Kn0gY3AxeVxyXG4gICAqIEBwYXJhbSB7Kn0gY3AyeFxyXG4gICAqIEBwYXJhbSB7Kn0gY3AyeVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKi9cclxuICBiZXppZXJDdXJ2ZVRvKCBjcDF4LCBjcDF5LCBjcDJ4LCBjcDJ5LCB4LCB5ICkge1xyXG4gICAgY29tbWFuZCggJ2JlemllckN1cnZlVG8nLCBbIGNwMXgsIGNwMXksIGNwMngsIGNwMnksIHgsIHkgXSApO1xyXG4gICAgdGhpcy5fY29udGV4dC5iZXppZXJDdXJ2ZVRvKCBjcDF4LCBjcDF5LCBjcDJ4LCBjcDJ5LCB4LCB5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geDFcclxuICAgKiBAcGFyYW0ge251bWJlcn0geTFcclxuICAgKiBAcGFyYW0ge251bWJlcn0geDJcclxuICAgKiBAcGFyYW0ge251bWJlcn0geTJcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzWFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXNZXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJvdGF0aW9uXHJcbiAgICovXHJcbiAgYXJjVG8oIHgxLCB5MSwgeDIsIHkyLCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiApIHtcclxuICAgIGNvbW1hbmQoICdhcmNUbycsIHJhZGl1c1kgIT09IHVuZGVmaW5lZCA/IFsgeDEsIHkxLCB4MiwgeTIsIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uIF0gOiBbIHgxLCB5MSwgeDIsIHkyLCByYWRpdXNYIF0gKTtcclxuICAgIHRoaXMuX2NvbnRleHQuYXJjVG8oIHgxLCB5MSwgeDIsIHkyLCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhcclxuICAgKi9cclxuICByZWN0KCB4LCB5LCB3LCBoICkge1xyXG4gICAgY29tbWFuZCggJ3JlY3QnLCBbIHgsIHksIHcsIGggXSApO1xyXG4gICAgdGhpcy5fY29udGV4dC5yZWN0KCB4LCB5LCB3LCBoICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1c1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydEFuZ2xlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVuZEFuZ2xlXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBhbnRpY2xvY2t3aXNlXHJcbiAgICovXHJcbiAgYXJjKCB4LCB5LCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBhbnRpY2xvY2t3aXNlICkge1xyXG4gICAgY29tbWFuZCggJ2FyYycsIFsgeCwgeSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSBdICk7XHJcbiAgICB0aGlzLl9jb250ZXh0LmFyYyggeCwgeSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXNYXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1c1lcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcm90YXRpb25cclxuICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnRBbmdsZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlbmRBbmdsZVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYW50aWNsb2Nrd2lzZVxyXG4gICAqL1xyXG4gIGVsbGlwc2UoIHgsIHksIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApIHtcclxuICAgIGNvbW1hbmQoICdlbGxpcHNlJywgWyB4LCB5LCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGFudGljbG9ja3dpc2UgXSApO1xyXG4gICAgdGhpcy5fY29udGV4dC5lbGxpcHNlKCB4LCB5LCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGFudGljbG9ja3dpc2UgKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdEZWJ1Z0NvbnRleHQnLCBEZWJ1Z0NvbnRleHQgKTtcclxuZXhwb3J0IGRlZmF1bHQgRGVidWdDb250ZXh0OyJdLCJtYXBwaW5ncyI6IkFBQUE7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