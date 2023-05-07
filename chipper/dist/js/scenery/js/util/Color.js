// Copyright 2012-2022, University of Colorado Boulder

/**
 * A color with RGBA values, assuming the sRGB color space is used.
 *
 * See http://www.w3.org/TR/css3-color/
 *
 * TODO: make a getHue, getSaturation, getLightness. we can then expose them via ES5!
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import Utils from '../../../dot/js/Utils.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import { scenery } from '../imports.js';
// constants
const clamp = Utils.clamp;
const linear = Utils.linear;
// regex utilities
const rgbNumber = '(-?\\d{1,3}%?)'; // syntax allows negative integers and percentages
const aNumber = '(\\d+|\\d*\\.\\d+)'; // decimal point number. technically we allow for '255', even though this will be clamped to 1.
const rawNumber = '(\\d{1,3})'; // a 1-3 digit number

// handles negative and percentage values
function parseRGBNumber(str) {
  let multiplier = 1;

  // if it's a percentage, strip it off and handle it that way
  if (str.endsWith('%')) {
    multiplier = 2.55;
    str = str.slice(0, str.length - 1);
  }
  return Utils.roundSymmetric(Number(str) * multiplier);
}
export default class Color {
  // RGBA values

  // For caching and performance

  // If assertions are enabled

  // Fires when the color is changed

  /**
   * Creates a Color with an initial value. Multiple different types of parameters are supported:
   * - new Color( color ) is a copy constructor, for a {Color}
   * - new Color( string ) will parse the string assuming it's a CSS-compatible color, e.g. set( 'red' )
   * - new Color( r, g, b ) is equivalent to setRGBA( r, g, b, 1 ), e.g. set( 255, 0, 128 )
   * - new Color( r, g, b, a ) is equivalent to setRGBA( r, g, b, a ), e.g. set( 255, 0, 128, 0.5 )
   * - new Color( hex ) will set RGB with alpha=1, e.g. set( 0xFF0000 )
   * - new Color( hex, a ) will set RGBA, e.g. set( 0xFF0000, 1 )
   * - new Color( null ) will be transparent
   *
   * The 'r', 'g', and 'b' values stand for red, green and blue respectively, and will be clamped to integers in 0-255.
   * The 'a' value stands for alpha, and will be clamped to 0-1 (floating point)
   * 'hex' indicates a 6-decimal-digit format hex number, for example 0xFFAA00 is equivalent to r=255, g=170, b=0.
   *
   * @param r - See above for the possible overloaded values
   * @param [g] - If provided, should be the green value (or the alpha value if a hex color is given)
   * @param [b] - If provided, should be the blue value
   * @param [a] - If provided, should be the alpha value
   */

  constructor(r, g, b, a) {
    // {Emitter}
    this.changeEmitter = new TinyEmitter();
    this.set(r, g, b, a);
  }

  /**
   * Returns a copy of this color.
   */
  copy() {
    return new Color(this.r, this.g, this.b, this.a);
  }

  /**
   * Sets the values of this Color. Supported styles:
   *
   * - set( color ) is a copy constructor
   * - set( string ) will parse the string assuming it's a CSS-compatible color, e.g. set( 'red' )
   * - set( r, g, b ) is equivalent to setRGBA( r, g, b, 1 ), e.g. set( 255, 0, 128 )
   * - set( r, g, b, a ) is equivalent to setRGBA( r, g, b, a ), e.g. set( 255, 0, 128, 0.5 )
   * - set( hex ) will set RGB with alpha=1, e.g. set( 0xFF0000 )
   * - set( hex, alpha ) will set RGBA, e.g. set( 0xFF0000, 1 )
   * - set( null ) will be transparent
   *
   * @param r - See above for the possible overloaded values
   * @param [g] - If provided, should be the green value (or the alpha value if a hex color is given)
   * @param [b] - If provided, should be the blue value
   * @param [a] - If provided, should be the alpha value
   */
  set(r, g, b, a) {
    assert && assert(r !== undefined, 'Can\'t call Color.set( undefined )');
    if (r === null) {
      this.setRGBA(0, 0, 0, 0);
    }
    // support for set( string )
    else if (typeof r === 'string') {
      this.setCSS(r);
    }
    // support for set( color )
    else if (r instanceof Color) {
      this.setRGBA(r.r, r.g, r.b, r.a);
    }
    // support for set( hex ) and set( hex, alpha )
    else if (b === undefined) {
      assert && assert(g === undefined || typeof g === 'number');
      const red = r >> 16 & 0xFF;
      const green = r >> 8 & 0xFF;
      const blue = r >> 0 & 0xFF;
      const alpha = g === undefined ? 1 : g;
      this.setRGBA(red, green, blue, alpha);
    }
    // support for set( r, g, b ) and set( r, g, b, a )
    else {
      assert && assert(a === undefined || typeof a === 'number');
      this.setRGBA(r, g, b, a === undefined ? 1 : a);
    }
    return this; // support chaining
  }

  /**
   * Returns the red value as an integer between 0 and 255
   */
  getRed() {
    return this.r;
  }
  get red() {
    return this.getRed();
  }
  set red(value) {
    this.setRed(value);
  }

  /**
   * Sets the red value.
   *
   * @param value - Will be clamped to an integer between 0 and 255
   */
  setRed(value) {
    return this.setRGBA(value, this.g, this.b, this.a);
  }

  /**
   * Returns the green value as an integer between 0 and 255
   */
  getGreen() {
    return this.g;
  }
  get green() {
    return this.getGreen();
  }
  set green(value) {
    this.setGreen(value);
  }

  /**
   * Sets the green value.
   *
   * @param value - Will be clamped to an integer between 0 and 255
   */
  setGreen(value) {
    return this.setRGBA(this.r, value, this.b, this.a);
  }

  /**
   * Returns the blue value as an integer between 0 and 255
   */
  getBlue() {
    return this.b;
  }
  get blue() {
    return this.getBlue();
  }
  set blue(value) {
    this.setBlue(value);
  }

  /**
   * Sets the blue value.
   *
   * @param value - Will be clamped to an integer between 0 and 255
   */
  setBlue(value) {
    return this.setRGBA(this.r, this.g, value, this.a);
  }

  /**
   * Returns the alpha value as a floating-point value between 0 and 1
   */
  getAlpha() {
    return this.a;
  }
  get alpha() {
    return this.getAlpha();
  }
  set alpha(value) {
    this.setAlpha(value);
  }

  /**
   * Sets the alpha value.
   *
   * @param value - Will be clamped between 0 and 1
   */
  setAlpha(value) {
    return this.setRGBA(this.r, this.g, this.b, value);
  }

  /**
   * Sets the value of this Color using RGB integral between 0-255, alpha (float) between 0-1.
   */
  setRGBA(red, green, blue, alpha) {
    this.r = Utils.roundSymmetric(clamp(red, 0, 255));
    this.g = Utils.roundSymmetric(clamp(green, 0, 255));
    this.b = Utils.roundSymmetric(clamp(blue, 0, 255));
    this.a = clamp(alpha, 0, 1);
    this.updateColor(); // update the cached value

    return this; // allow chaining
  }

  /**
   * A linear (gamma-corrected) interpolation between this color (ratio=0) and another color (ratio=1).
   *
   * @param otherColor
   * @param ratio - Not necessarily constrained in [0, 1]
   */
  blend(otherColor, ratio) {
    const gamma = 2.4;
    const linearRedA = Math.pow(this.r, gamma);
    const linearRedB = Math.pow(otherColor.r, gamma);
    const linearGreenA = Math.pow(this.g, gamma);
    const linearGreenB = Math.pow(otherColor.g, gamma);
    const linearBlueA = Math.pow(this.b, gamma);
    const linearBlueB = Math.pow(otherColor.b, gamma);
    const r = Math.pow(linearRedA + (linearRedB - linearRedA) * ratio, 1 / gamma);
    const g = Math.pow(linearGreenA + (linearGreenB - linearGreenA) * ratio, 1 / gamma);
    const b = Math.pow(linearBlueA + (linearBlueB - linearBlueA) * ratio, 1 / gamma);
    const a = this.a + (otherColor.a - this.a) * ratio;
    return new Color(r, g, b, a);
  }

  /**
   * Used internally to compute the CSS string for this color. Use toCSS()
   */
  computeCSS() {
    if (this.a === 1) {
      return `rgb(${this.r},${this.g},${this.b})`;
    } else {
      // Since SVG doesn't support parsing scientific notation (e.g. 7e5), we need to output fixed decimal-point strings.
      // Since this needs to be done quickly, and we don't particularly care about slight rounding differences (it's
      // being used for display purposes only, and is never shown to the user), we use the built-in JS toFixed instead of
      // Dot's version of toFixed. See https://github.com/phetsims/kite/issues/50
      let alpha = this.a.toFixed(20); // eslint-disable-line bad-sim-text
      while (alpha.length >= 2 && alpha.endsWith('0') && alpha[alpha.length - 2] !== '.') {
        alpha = alpha.slice(0, alpha.length - 1);
      }
      const alphaString = this.a === 0 || this.a === 1 ? this.a : alpha;
      return `rgba(${this.r},${this.g},${this.b},${alphaString})`;
    }
  }

  /**
   * Returns the value of this Color as a CSS string.
   */
  toCSS() {
    // verify that the cached value is correct (in debugging builds only, defeats the point of caching otherwise)
    assert && assert(this._css === this.computeCSS(), `CSS cached value is ${this._css}, but the computed value appears to be ${this.computeCSS()}`);
    return this._css;
  }

  /**
   * Sets this color for a CSS color string.
   */
  setCSS(cssString) {
    let success = false;
    const str = Color.preprocessCSS(cssString);

    // run through the available text formats
    for (let i = 0; i < Color.formatParsers.length; i++) {
      const parser = Color.formatParsers[i];
      const matches = parser.regexp.exec(str);
      if (matches) {
        parser.apply(this, matches);
        success = true;
        break;
      }
    }
    if (!success) {
      throw new Error(`Color unable to parse color string: ${cssString}`);
    }
    this.updateColor(); // update the cached value

    return this;
  }

  /**
   * Returns this color's RGB information in the hexadecimal number equivalent, e.g. 0xFF00FF
   */
  toNumber() {
    return (this.r << 16) + (this.g << 8) + this.b;
  }

  /**
   * Called to update the internally cached CSS value
   */
  updateColor() {
    assert && assert(!this.immutable, 'Cannot modify an immutable color. Likely caused by trying to mutate a color after it was used for a node fill/stroke');
    assert && assert(typeof this.red === 'number' && typeof this.green === 'number' && typeof this.blue === 'number' && typeof this.alpha === 'number', `Ensure color components are numeric: ${this.toString()}`);
    assert && assert(isFinite(this.red) && isFinite(this.green) && isFinite(this.blue) && isFinite(this.alpha), 'Ensure color components are finite and not NaN');
    assert && assert(this.red >= 0 && this.red <= 255 && this.green >= 0 && this.green <= 255 && this.red >= 0 && this.red <= 255 && this.alpha >= 0 && this.alpha <= 1, `Ensure color components are in the proper ranges: ${this.toString()}`);
    const oldCSS = this._css;
    this._css = this.computeCSS();

    // notify listeners if it changed
    if (oldCSS !== this._css) {
      this.changeEmitter.emit();
    }
  }

  /**
   * Allow setting this Color to be immutable when assertions are disabled. any change will throw an error
   */
  setImmutable() {
    if (assert) {
      this.immutable = true;
    }
    return this; // allow chaining
  }

  /**
   * Returns an object that can be passed to a Canvas context's fillStyle or strokeStyle.
   */
  getCanvasStyle() {
    return this.toCSS(); // should be inlined, leave like this for future maintainability
  }

  /**
   * Sets this color using HSLA values.
   *
   * TODO: make a getHue, getSaturation, getLightness. we can then expose them via ES5!
   *
   * @param hue - integer modulo 360
   * @param saturation - percentage
   * @param lightness - percentage
   * @param alpha
   */
  setHSLA(hue, saturation, lightness, alpha) {
    hue = hue % 360 / 360;
    saturation = clamp(saturation / 100, 0, 1);
    lightness = clamp(lightness / 100, 0, 1);

    // see http://www.w3.org/TR/css3-color/
    let m2;
    if (lightness < 0.5) {
      m2 = lightness * (saturation + 1);
    } else {
      m2 = lightness + saturation - lightness * saturation;
    }
    const m1 = lightness * 2 - m2;
    this.r = Utils.roundSymmetric(Color.hueToRGB(m1, m2, hue + 1 / 3) * 255);
    this.g = Utils.roundSymmetric(Color.hueToRGB(m1, m2, hue) * 255);
    this.b = Utils.roundSymmetric(Color.hueToRGB(m1, m2, hue - 1 / 3) * 255);
    this.a = clamp(alpha, 0, 1);
    this.updateColor(); // update the cached value

    return this; // allow chaining
  }

  equals(color) {
    return this.r === color.r && this.g === color.g && this.b === color.b && this.a === color.a;
  }

  /**
   * Returns a copy of this color with a different alpha value.
   */
  withAlpha(alpha) {
    return new Color(this.r, this.g, this.b, alpha);
  }
  checkFactor(factor) {
    assert && assert(factor === undefined || factor >= 0 && factor <= 1, `factor must be between 0 and 1: ${factor}`);
    return factor === undefined ? 0.7 : factor;
  }

  /**
   * Matches Java's Color.brighter()
   */
  brighterColor(factor) {
    factor = this.checkFactor(factor);
    const red = Math.min(255, Math.floor(this.r / factor));
    const green = Math.min(255, Math.floor(this.g / factor));
    const blue = Math.min(255, Math.floor(this.b / factor));
    return new Color(red, green, blue, this.a);
  }

  /**
   * Brightens a color in RGB space. Useful when creating gradients from a single base color.
   *
   * @param [factor] - 0 (no change) to 1 (white)
   * @returns - (closer to white) version of the original color.
   */
  colorUtilsBrighter(factor) {
    factor = this.checkFactor(factor);
    const red = Math.min(255, this.getRed() + Math.floor(factor * (255 - this.getRed())));
    const green = Math.min(255, this.getGreen() + Math.floor(factor * (255 - this.getGreen())));
    const blue = Math.min(255, this.getBlue() + Math.floor(factor * (255 - this.getBlue())));
    return new Color(red, green, blue, this.getAlpha());
  }

  /**
   * Matches Java's Color.darker()
   */
  darkerColor(factor) {
    factor = this.checkFactor(factor);
    const red = Math.max(0, Math.floor(factor * this.r));
    const green = Math.max(0, Math.floor(factor * this.g));
    const blue = Math.max(0, Math.floor(factor * this.b));
    return new Color(red, green, blue, this.a);
  }

  /**
   * Darken a color in RGB space. Useful when creating gradients from a single
   * base color.
   *
   * @param [factor] - 0 (no change) to 1 (black)
   * @returns - darker (closer to black) version of the original color.
   */
  colorUtilsDarker(factor) {
    factor = this.checkFactor(factor);
    const red = Math.max(0, this.getRed() - Math.floor(factor * this.getRed()));
    const green = Math.max(0, this.getGreen() - Math.floor(factor * this.getGreen()));
    const blue = Math.max(0, this.getBlue() - Math.floor(factor * this.getBlue()));
    return new Color(red, green, blue, this.getAlpha());
  }

  /**
   * Like colorUtilsBrighter/Darker, however factor should be in the range -1 to 1, and it will call:
   *   colorUtilsBrighter( factor )   for factor >  0
   *   this                           for factor == 0
   *   colorUtilsDarker( -factor )    for factor <  0
   *
   * @param factor from -1 (black), to 0 (no change), to 1 (white)
   */
  colorUtilsBrightness(factor) {
    if (factor === 0) {
      return this;
    } else if (factor > 0) {
      return this.colorUtilsBrighter(factor);
    } else {
      return this.colorUtilsDarker(-factor);
    }
  }

  /**
   * Returns a string form of this object
   */
  toString() {
    return `${this.constructor.name}[r:${this.r} g:${this.g} b:${this.b} a:${this.a}]`;
  }

  /**
   * Convert to a hex string, that starts with "#".
   */
  toHexString() {
    let hexString = this.toNumber().toString(16);
    while (hexString.length < 6) {
      hexString = `0${hexString}`;
    }
    return `#${hexString}`;
  }
  toStateObject() {
    return {
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a
    };
  }

  /**
   * Utility function, see http://www.w3.org/TR/css3-color/
   */
  static hueToRGB(m1, m2, h) {
    if (h < 0) {
      h = h + 1;
    }
    if (h > 1) {
      h = h - 1;
    }
    if (h * 6 < 1) {
      return m1 + (m2 - m1) * h * 6;
    }
    if (h * 2 < 1) {
      return m2;
    }
    if (h * 3 < 2) {
      return m1 + (m2 - m1) * (2 / 3 - h) * 6;
    }
    return m1;
  }

  /**
   * Convenience function that converts a color spec to a color object if necessary, or simply returns the color object
   * if not.
   *
   * Please note there is no defensive copy when a color is passed in unlike PaintDef.
   */
  static toColor(colorSpec) {
    if (colorSpec === null) {
      return Color.TRANSPARENT;
    } else if (colorSpec instanceof Color) {
      return colorSpec;
    } else if (typeof colorSpec === 'string') {
      return new Color(colorSpec);
    } else {
      return Color.toColor(colorSpec.value);
    }
  }

  /**
   * Interpolates between 2 colors in RGBA space. When distance is 0, color1 is returned. When distance is 1, color2 is
   * returned. Other values of distance return a color somewhere between color1 and color2. Each color component is
   * interpolated separately.
   *
   * @param color1
   * @param color2
   * @param distance distance between color1 and color2, 0 <= distance <= 1
   */
  static interpolateRGBA(color1, color2, distance) {
    if (distance < 0 || distance > 1) {
      throw new Error(`distance must be between 0 and 1: ${distance}`);
    }
    const r = Math.floor(linear(0, 1, color1.r, color2.r, distance));
    const g = Math.floor(linear(0, 1, color1.g, color2.g, distance));
    const b = Math.floor(linear(0, 1, color1.b, color2.b, distance));
    const a = linear(0, 1, color1.a, color2.a, distance);
    return new Color(r, g, b, a);
  }

  /**
   * Returns a blended color as a mix between the given colors.
   */
  static supersampleBlend(colors) {
    // hard-coded gamma (assuming the exponential part of the sRGB curve as a simplification)
    const GAMMA = 2.2;

    // maps to [0,1] linear colorspace
    const reds = colors.map(color => Math.pow(color.r / 255, GAMMA));
    const greens = colors.map(color => Math.pow(color.g / 255, GAMMA));
    const blues = colors.map(color => Math.pow(color.b / 255, GAMMA));
    const alphas = colors.map(color => Math.pow(color.a, GAMMA));
    const alphaSum = _.sum(alphas);
    if (alphaSum === 0) {
      return new Color(0, 0, 0, 0);
    }

    // blending of pixels, weighted by alphas
    const red = _.sum(_.range(0, colors.length).map(i => reds[i] * alphas[i])) / alphaSum;
    const green = _.sum(_.range(0, colors.length).map(i => greens[i] * alphas[i])) / alphaSum;
    const blue = _.sum(_.range(0, colors.length).map(i => blues[i] * alphas[i])) / alphaSum;
    const alpha = alphaSum / colors.length; // average of alphas

    return new Color(Math.floor(Math.pow(red, 1 / GAMMA) * 255), Math.floor(Math.pow(green, 1 / GAMMA) * 255), Math.floor(Math.pow(blue, 1 / GAMMA) * 255), Math.pow(alpha, 1 / GAMMA));
  }
  static fromStateObject(stateObject) {
    return new Color(stateObject.r, stateObject.g, stateObject.b, stateObject.a);
  }
  static hsla(hue, saturation, lightness, alpha) {
    return new Color(0, 0, 0, 1).setHSLA(hue, saturation, lightness, alpha);
  }
  static checkPaintString(cssString) {
    if (assert) {
      try {
        scratchColor.setCSS(cssString);
      } catch (e) {
        assert(false, `The CSS string is an invalid color: ${cssString}`);
      }
    }
  }

  /**
   * A Paint of the type that Paintable accepts as fills or strokes
   */
  static checkPaint(paint) {
    if (typeof paint === 'string') {
      Color.checkPaintString(paint);
    } else if (paint instanceof ReadOnlyProperty && typeof paint.value === 'string') {
      Color.checkPaintString(paint.value);
    }
  }

  /**
   * Gets the luminance of a color, per ITU-R recommendation BT.709, https://en.wikipedia.org/wiki/Rec._709.
   * Green contributes the most to the intensity perceived by humans, and blue the least.
   * This algorithm works correctly with a grayscale color because the RGB coefficients sum to 1.
   *
   * @returns - a value in the range [0,255]
   */
  static getLuminance(color) {
    const sceneryColor = Color.toColor(color);
    const luminance = sceneryColor.red * 0.2126 + sceneryColor.green * 0.7152 + sceneryColor.blue * 0.0722;
    assert && assert(luminance >= 0 && luminance <= 255, `unexpected luminance: ${luminance}`);
    return luminance;
  }

  /**
   * Converts a color to grayscale.
   */
  static toGrayscale(color) {
    const luminance = Color.getLuminance(color);
    return new Color(luminance, luminance, luminance);
  }

  /**
   * Determines whether a color is 'dark'.
   *
   * @param color - colors with luminance < this value are dark, range [0,255], default 186
   * @param luminanceThreshold - colors with luminance < this value are dark, range [0,255], default 186
   */
  static isDarkColor(color, luminanceThreshold = 186) {
    assert && assert(luminanceThreshold >= 0 && luminanceThreshold <= 255, 'invalid luminanceThreshold');
    return Color.getLuminance(color) < luminanceThreshold;
  }

  /**
   * Determines whether a color is 'light'.
   *
   * @param color
   * @param [luminanceThreshold] - colors with luminance >= this value are light, range [0,255], default 186
   */
  static isLightColor(color, luminanceThreshold) {
    return !Color.isDarkColor(color, luminanceThreshold);
  }

  /**
   * Creates a Color that is a shade of gray.
   * @param rgb - used for red, blue, and green components
   * @param [a] - defaults to 1
   */
  static grayColor(rgb, a) {
    return new Color(rgb, rgb, rgb, a);
  }

  /**
   * Converts a CSS color string into a standard format, lower-casing and keyword-matching it.
   */
  static preprocessCSS(cssString) {
    let str = cssString.replace(/ /g, '').toLowerCase();

    // replace colors based on keywords
    const keywordMatch = Color.colorKeywords[str];
    if (keywordMatch) {
      str = `#${keywordMatch}`;
    }
    return str;
  }

  /**
   * Whether the specified CSS string is a valid CSS color string
   */
  static isCSSColorString(cssString) {
    const str = Color.preprocessCSS(cssString);

    // run through the available text formats
    for (let i = 0; i < Color.formatParsers.length; i++) {
      const parser = Color.formatParsers[i];
      const matches = parser.regexp.exec(str);
      if (matches) {
        return true;
      }
    }
    return false;
  }
  static formatParsers = [{
    // 'transparent'
    regexp: /^transparent$/,
    apply: (color, matches) => {
      color.setRGBA(0, 0, 0, 0);
    }
  }, {
    // short hex form, a la '#fff'
    regexp: /^#(\w{1})(\w{1})(\w{1})$/,
    apply: (color, matches) => {
      color.setRGBA(parseInt(matches[1] + matches[1], 16), parseInt(matches[2] + matches[2], 16), parseInt(matches[3] + matches[3], 16), 1);
    }
  }, {
    // long hex form, a la '#ffffff'
    regexp: /^#(\w{2})(\w{2})(\w{2})$/,
    apply: (color, matches) => {
      color.setRGBA(parseInt(matches[1], 16), parseInt(matches[2], 16), parseInt(matches[3], 16), 1);
    }
  }, {
    // rgb(...)
    regexp: new RegExp(`^rgb\\(${rgbNumber},${rgbNumber},${rgbNumber}\\)$`),
    apply: (color, matches) => {
      color.setRGBA(parseRGBNumber(matches[1]), parseRGBNumber(matches[2]), parseRGBNumber(matches[3]), 1);
    }
  }, {
    // rgba(...)
    regexp: new RegExp(`^rgba\\(${rgbNumber},${rgbNumber},${rgbNumber},${aNumber}\\)$`),
    apply: (color, matches) => {
      color.setRGBA(parseRGBNumber(matches[1]), parseRGBNumber(matches[2]), parseRGBNumber(matches[3]), Number(matches[4]));
    }
  }, {
    // hsl(...)
    regexp: new RegExp(`^hsl\\(${rawNumber},${rawNumber}%,${rawNumber}%\\)$`),
    apply: (color, matches) => {
      color.setHSLA(Number(matches[1]), Number(matches[2]), Number(matches[3]), 1);
    }
  }, {
    // hsla(...)
    regexp: new RegExp(`^hsla\\(${rawNumber},${rawNumber}%,${rawNumber}%,${aNumber}\\)$`),
    apply: (color, matches) => {
      color.setHSLA(Number(matches[1]), Number(matches[2]), Number(matches[3]), Number(matches[4]));
    }
  }];
  static basicColorKeywords = {
    aqua: '00ffff',
    black: '000000',
    blue: '0000ff',
    fuchsia: 'ff00ff',
    gray: '808080',
    green: '008000',
    lime: '00ff00',
    maroon: '800000',
    navy: '000080',
    olive: '808000',
    purple: '800080',
    red: 'ff0000',
    silver: 'c0c0c0',
    teal: '008080',
    white: 'ffffff',
    yellow: 'ffff00'
  };
  static colorKeywords = {
    aliceblue: 'f0f8ff',
    antiquewhite: 'faebd7',
    aqua: '00ffff',
    aquamarine: '7fffd4',
    azure: 'f0ffff',
    beige: 'f5f5dc',
    bisque: 'ffe4c4',
    black: '000000',
    blanchedalmond: 'ffebcd',
    blue: '0000ff',
    blueviolet: '8a2be2',
    brown: 'a52a2a',
    burlywood: 'deb887',
    cadetblue: '5f9ea0',
    chartreuse: '7fff00',
    chocolate: 'd2691e',
    coral: 'ff7f50',
    cornflowerblue: '6495ed',
    cornsilk: 'fff8dc',
    crimson: 'dc143c',
    cyan: '00ffff',
    darkblue: '00008b',
    darkcyan: '008b8b',
    darkgoldenrod: 'b8860b',
    darkgray: 'a9a9a9',
    darkgreen: '006400',
    darkgrey: 'a9a9a9',
    darkkhaki: 'bdb76b',
    darkmagenta: '8b008b',
    darkolivegreen: '556b2f',
    darkorange: 'ff8c00',
    darkorchid: '9932cc',
    darkred: '8b0000',
    darksalmon: 'e9967a',
    darkseagreen: '8fbc8f',
    darkslateblue: '483d8b',
    darkslategray: '2f4f4f',
    darkslategrey: '2f4f4f',
    darkturquoise: '00ced1',
    darkviolet: '9400d3',
    deeppink: 'ff1493',
    deepskyblue: '00bfff',
    dimgray: '696969',
    dimgrey: '696969',
    dodgerblue: '1e90ff',
    firebrick: 'b22222',
    floralwhite: 'fffaf0',
    forestgreen: '228b22',
    fuchsia: 'ff00ff',
    gainsboro: 'dcdcdc',
    ghostwhite: 'f8f8ff',
    gold: 'ffd700',
    goldenrod: 'daa520',
    gray: '808080',
    green: '008000',
    greenyellow: 'adff2f',
    grey: '808080',
    honeydew: 'f0fff0',
    hotpink: 'ff69b4',
    indianred: 'cd5c5c',
    indigo: '4b0082',
    ivory: 'fffff0',
    khaki: 'f0e68c',
    lavender: 'e6e6fa',
    lavenderblush: 'fff0f5',
    lawngreen: '7cfc00',
    lemonchiffon: 'fffacd',
    lightblue: 'add8e6',
    lightcoral: 'f08080',
    lightcyan: 'e0ffff',
    lightgoldenrodyellow: 'fafad2',
    lightgray: 'd3d3d3',
    lightgreen: '90ee90',
    lightgrey: 'd3d3d3',
    lightpink: 'ffb6c1',
    lightsalmon: 'ffa07a',
    lightseagreen: '20b2aa',
    lightskyblue: '87cefa',
    lightslategray: '778899',
    lightslategrey: '778899',
    lightsteelblue: 'b0c4de',
    lightyellow: 'ffffe0',
    lime: '00ff00',
    limegreen: '32cd32',
    linen: 'faf0e6',
    magenta: 'ff00ff',
    maroon: '800000',
    mediumaquamarine: '66cdaa',
    mediumblue: '0000cd',
    mediumorchid: 'ba55d3',
    mediumpurple: '9370db',
    mediumseagreen: '3cb371',
    mediumslateblue: '7b68ee',
    mediumspringgreen: '00fa9a',
    mediumturquoise: '48d1cc',
    mediumvioletred: 'c71585',
    midnightblue: '191970',
    mintcream: 'f5fffa',
    mistyrose: 'ffe4e1',
    moccasin: 'ffe4b5',
    navajowhite: 'ffdead',
    navy: '000080',
    oldlace: 'fdf5e6',
    olive: '808000',
    olivedrab: '6b8e23',
    orange: 'ffa500',
    orangered: 'ff4500',
    orchid: 'da70d6',
    palegoldenrod: 'eee8aa',
    palegreen: '98fb98',
    paleturquoise: 'afeeee',
    palevioletred: 'db7093',
    papayawhip: 'ffefd5',
    peachpuff: 'ffdab9',
    peru: 'cd853f',
    pink: 'ffc0cb',
    plum: 'dda0dd',
    powderblue: 'b0e0e6',
    purple: '800080',
    red: 'ff0000',
    rosybrown: 'bc8f8f',
    royalblue: '4169e1',
    saddlebrown: '8b4513',
    salmon: 'fa8072',
    sandybrown: 'f4a460',
    seagreen: '2e8b57',
    seashell: 'fff5ee',
    sienna: 'a0522d',
    silver: 'c0c0c0',
    skyblue: '87ceeb',
    slateblue: '6a5acd',
    slategray: '708090',
    slategrey: '708090',
    snow: 'fffafa',
    springgreen: '00ff7f',
    steelblue: '4682b4',
    tan: 'd2b48c',
    teal: '008080',
    thistle: 'd8bfd8',
    tomato: 'ff6347',
    turquoise: '40e0d0',
    violet: 'ee82ee',
    wheat: 'f5deb3',
    white: 'ffffff',
    whitesmoke: 'f5f5f5',
    yellow: 'ffff00',
    yellowgreen: '9acd32'
  };

  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
}

scenery.register('Color', Color);

// Java compatibility
Color.BLACK = Color.black = new Color(0, 0, 0).setImmutable();
Color.BLUE = Color.blue = new Color(0, 0, 255).setImmutable();
Color.CYAN = Color.cyan = new Color(0, 255, 255).setImmutable();
Color.DARK_GRAY = Color.darkGray = new Color(64, 64, 64).setImmutable();
Color.GRAY = Color.gray = new Color(128, 128, 128).setImmutable();
Color.GREEN = Color.green = new Color(0, 255, 0).setImmutable();
Color.LIGHT_GRAY = Color.lightGray = new Color(192, 192, 192).setImmutable();
Color.MAGENTA = Color.magenta = new Color(255, 0, 255).setImmutable();
Color.ORANGE = Color.orange = new Color(255, 200, 0).setImmutable();
Color.PINK = Color.pink = new Color(255, 175, 175).setImmutable();
Color.RED = Color.red = new Color(255, 0, 0).setImmutable();
Color.WHITE = Color.white = new Color(255, 255, 255).setImmutable();
Color.YELLOW = Color.yellow = new Color(255, 255, 0).setImmutable();

// Helper for transparent colors
Color.TRANSPARENT = Color.transparent = new Color(0, 0, 0, 0).setImmutable();
const scratchColor = new Color('blue');
Color.ColorIO = new IOType('ColorIO', {
  valueType: Color,
  documentation: 'A color, with rgba',
  toStateObject: color => color.toStateObject(),
  fromStateObject: stateObject => new Color(stateObject.r, stateObject.g, stateObject.b, stateObject.a),
  stateSchema: {
    r: NumberIO,
    g: NumberIO,
    b: NumberIO,
    a: NumberIO
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFkT25seVByb3BlcnR5IiwiVGlueUVtaXR0ZXIiLCJVdGlscyIsIklPVHlwZSIsIk51bWJlcklPIiwic2NlbmVyeSIsImNsYW1wIiwibGluZWFyIiwicmdiTnVtYmVyIiwiYU51bWJlciIsInJhd051bWJlciIsInBhcnNlUkdCTnVtYmVyIiwic3RyIiwibXVsdGlwbGllciIsImVuZHNXaXRoIiwic2xpY2UiLCJsZW5ndGgiLCJyb3VuZFN5bW1ldHJpYyIsIk51bWJlciIsIkNvbG9yIiwiY29uc3RydWN0b3IiLCJyIiwiZyIsImIiLCJhIiwiY2hhbmdlRW1pdHRlciIsInNldCIsImNvcHkiLCJhc3NlcnQiLCJ1bmRlZmluZWQiLCJzZXRSR0JBIiwic2V0Q1NTIiwicmVkIiwiZ3JlZW4iLCJibHVlIiwiYWxwaGEiLCJnZXRSZWQiLCJ2YWx1ZSIsInNldFJlZCIsImdldEdyZWVuIiwic2V0R3JlZW4iLCJnZXRCbHVlIiwic2V0Qmx1ZSIsImdldEFscGhhIiwic2V0QWxwaGEiLCJ1cGRhdGVDb2xvciIsImJsZW5kIiwib3RoZXJDb2xvciIsInJhdGlvIiwiZ2FtbWEiLCJsaW5lYXJSZWRBIiwiTWF0aCIsInBvdyIsImxpbmVhclJlZEIiLCJsaW5lYXJHcmVlbkEiLCJsaW5lYXJHcmVlbkIiLCJsaW5lYXJCbHVlQSIsImxpbmVhckJsdWVCIiwiY29tcHV0ZUNTUyIsInRvRml4ZWQiLCJhbHBoYVN0cmluZyIsInRvQ1NTIiwiX2NzcyIsImNzc1N0cmluZyIsInN1Y2Nlc3MiLCJwcmVwcm9jZXNzQ1NTIiwiaSIsImZvcm1hdFBhcnNlcnMiLCJwYXJzZXIiLCJtYXRjaGVzIiwicmVnZXhwIiwiZXhlYyIsImFwcGx5IiwiRXJyb3IiLCJ0b051bWJlciIsImltbXV0YWJsZSIsInRvU3RyaW5nIiwiaXNGaW5pdGUiLCJvbGRDU1MiLCJlbWl0Iiwic2V0SW1tdXRhYmxlIiwiZ2V0Q2FudmFzU3R5bGUiLCJzZXRIU0xBIiwiaHVlIiwic2F0dXJhdGlvbiIsImxpZ2h0bmVzcyIsIm0yIiwibTEiLCJodWVUb1JHQiIsImVxdWFscyIsImNvbG9yIiwid2l0aEFscGhhIiwiY2hlY2tGYWN0b3IiLCJmYWN0b3IiLCJicmlnaHRlckNvbG9yIiwibWluIiwiZmxvb3IiLCJjb2xvclV0aWxzQnJpZ2h0ZXIiLCJkYXJrZXJDb2xvciIsIm1heCIsImNvbG9yVXRpbHNEYXJrZXIiLCJjb2xvclV0aWxzQnJpZ2h0bmVzcyIsIm5hbWUiLCJ0b0hleFN0cmluZyIsImhleFN0cmluZyIsInRvU3RhdGVPYmplY3QiLCJoIiwidG9Db2xvciIsImNvbG9yU3BlYyIsIlRSQU5TUEFSRU5UIiwiaW50ZXJwb2xhdGVSR0JBIiwiY29sb3IxIiwiY29sb3IyIiwiZGlzdGFuY2UiLCJzdXBlcnNhbXBsZUJsZW5kIiwiY29sb3JzIiwiR0FNTUEiLCJyZWRzIiwibWFwIiwiZ3JlZW5zIiwiYmx1ZXMiLCJhbHBoYXMiLCJhbHBoYVN1bSIsIl8iLCJzdW0iLCJyYW5nZSIsImZyb21TdGF0ZU9iamVjdCIsInN0YXRlT2JqZWN0IiwiaHNsYSIsImNoZWNrUGFpbnRTdHJpbmciLCJzY3JhdGNoQ29sb3IiLCJlIiwiY2hlY2tQYWludCIsInBhaW50IiwiZ2V0THVtaW5hbmNlIiwic2NlbmVyeUNvbG9yIiwibHVtaW5hbmNlIiwidG9HcmF5c2NhbGUiLCJpc0RhcmtDb2xvciIsImx1bWluYW5jZVRocmVzaG9sZCIsImlzTGlnaHRDb2xvciIsImdyYXlDb2xvciIsInJnYiIsInJlcGxhY2UiLCJ0b0xvd2VyQ2FzZSIsImtleXdvcmRNYXRjaCIsImNvbG9yS2V5d29yZHMiLCJpc0NTU0NvbG9yU3RyaW5nIiwicGFyc2VJbnQiLCJSZWdFeHAiLCJiYXNpY0NvbG9yS2V5d29yZHMiLCJhcXVhIiwiYmxhY2siLCJmdWNoc2lhIiwiZ3JheSIsImxpbWUiLCJtYXJvb24iLCJuYXZ5Iiwib2xpdmUiLCJwdXJwbGUiLCJzaWx2ZXIiLCJ0ZWFsIiwid2hpdGUiLCJ5ZWxsb3ciLCJhbGljZWJsdWUiLCJhbnRpcXVld2hpdGUiLCJhcXVhbWFyaW5lIiwiYXp1cmUiLCJiZWlnZSIsImJpc3F1ZSIsImJsYW5jaGVkYWxtb25kIiwiYmx1ZXZpb2xldCIsImJyb3duIiwiYnVybHl3b29kIiwiY2FkZXRibHVlIiwiY2hhcnRyZXVzZSIsImNob2NvbGF0ZSIsImNvcmFsIiwiY29ybmZsb3dlcmJsdWUiLCJjb3Juc2lsayIsImNyaW1zb24iLCJjeWFuIiwiZGFya2JsdWUiLCJkYXJrY3lhbiIsImRhcmtnb2xkZW5yb2QiLCJkYXJrZ3JheSIsImRhcmtncmVlbiIsImRhcmtncmV5IiwiZGFya2toYWtpIiwiZGFya21hZ2VudGEiLCJkYXJrb2xpdmVncmVlbiIsImRhcmtvcmFuZ2UiLCJkYXJrb3JjaGlkIiwiZGFya3JlZCIsImRhcmtzYWxtb24iLCJkYXJrc2VhZ3JlZW4iLCJkYXJrc2xhdGVibHVlIiwiZGFya3NsYXRlZ3JheSIsImRhcmtzbGF0ZWdyZXkiLCJkYXJrdHVycXVvaXNlIiwiZGFya3Zpb2xldCIsImRlZXBwaW5rIiwiZGVlcHNreWJsdWUiLCJkaW1ncmF5IiwiZGltZ3JleSIsImRvZGdlcmJsdWUiLCJmaXJlYnJpY2siLCJmbG9yYWx3aGl0ZSIsImZvcmVzdGdyZWVuIiwiZ2FpbnNib3JvIiwiZ2hvc3R3aGl0ZSIsImdvbGQiLCJnb2xkZW5yb2QiLCJncmVlbnllbGxvdyIsImdyZXkiLCJob25leWRldyIsImhvdHBpbmsiLCJpbmRpYW5yZWQiLCJpbmRpZ28iLCJpdm9yeSIsImtoYWtpIiwibGF2ZW5kZXIiLCJsYXZlbmRlcmJsdXNoIiwibGF3bmdyZWVuIiwibGVtb25jaGlmZm9uIiwibGlnaHRibHVlIiwibGlnaHRjb3JhbCIsImxpZ2h0Y3lhbiIsImxpZ2h0Z29sZGVucm9keWVsbG93IiwibGlnaHRncmF5IiwibGlnaHRncmVlbiIsImxpZ2h0Z3JleSIsImxpZ2h0cGluayIsImxpZ2h0c2FsbW9uIiwibGlnaHRzZWFncmVlbiIsImxpZ2h0c2t5Ymx1ZSIsImxpZ2h0c2xhdGVncmF5IiwibGlnaHRzbGF0ZWdyZXkiLCJsaWdodHN0ZWVsYmx1ZSIsImxpZ2h0eWVsbG93IiwibGltZWdyZWVuIiwibGluZW4iLCJtYWdlbnRhIiwibWVkaXVtYXF1YW1hcmluZSIsIm1lZGl1bWJsdWUiLCJtZWRpdW1vcmNoaWQiLCJtZWRpdW1wdXJwbGUiLCJtZWRpdW1zZWFncmVlbiIsIm1lZGl1bXNsYXRlYmx1ZSIsIm1lZGl1bXNwcmluZ2dyZWVuIiwibWVkaXVtdHVycXVvaXNlIiwibWVkaXVtdmlvbGV0cmVkIiwibWlkbmlnaHRibHVlIiwibWludGNyZWFtIiwibWlzdHlyb3NlIiwibW9jY2FzaW4iLCJuYXZham93aGl0ZSIsIm9sZGxhY2UiLCJvbGl2ZWRyYWIiLCJvcmFuZ2UiLCJvcmFuZ2VyZWQiLCJvcmNoaWQiLCJwYWxlZ29sZGVucm9kIiwicGFsZWdyZWVuIiwicGFsZXR1cnF1b2lzZSIsInBhbGV2aW9sZXRyZWQiLCJwYXBheWF3aGlwIiwicGVhY2hwdWZmIiwicGVydSIsInBpbmsiLCJwbHVtIiwicG93ZGVyYmx1ZSIsInJvc3licm93biIsInJveWFsYmx1ZSIsInNhZGRsZWJyb3duIiwic2FsbW9uIiwic2FuZHlicm93biIsInNlYWdyZWVuIiwic2Vhc2hlbGwiLCJzaWVubmEiLCJza3libHVlIiwic2xhdGVibHVlIiwic2xhdGVncmF5Iiwic2xhdGVncmV5Iiwic25vdyIsInNwcmluZ2dyZWVuIiwic3RlZWxibHVlIiwidGFuIiwidGhpc3RsZSIsInRvbWF0byIsInR1cnF1b2lzZSIsInZpb2xldCIsIndoZWF0Iiwid2hpdGVzbW9rZSIsInllbGxvd2dyZWVuIiwicmVnaXN0ZXIiLCJCTEFDSyIsIkJMVUUiLCJDWUFOIiwiREFSS19HUkFZIiwiZGFya0dyYXkiLCJHUkFZIiwiR1JFRU4iLCJMSUdIVF9HUkFZIiwibGlnaHRHcmF5IiwiTUFHRU5UQSIsIk9SQU5HRSIsIlBJTksiLCJSRUQiLCJXSElURSIsIllFTExPVyIsInRyYW5zcGFyZW50IiwiQ29sb3JJTyIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJzdGF0ZVNjaGVtYSJdLCJzb3VyY2VzIjpbIkNvbG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEyLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgY29sb3Igd2l0aCBSR0JBIHZhbHVlcywgYXNzdW1pbmcgdGhlIHNSR0IgY29sb3Igc3BhY2UgaXMgdXNlZC5cclxuICpcclxuICogU2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtY29sb3IvXHJcbiAqXHJcbiAqIFRPRE86IG1ha2UgYSBnZXRIdWUsIGdldFNhdHVyYXRpb24sIGdldExpZ2h0bmVzcy4gd2UgY2FuIHRoZW4gZXhwb3NlIHRoZW0gdmlhIEVTNSFcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBURW1pdHRlciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RFbWl0dGVyLmpzJztcclxuaW1wb3J0IFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9SZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCB7IFRQYWludCwgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVENvbG9yIGZyb20gJy4vVENvbG9yLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBjbGFtcCA9IFV0aWxzLmNsYW1wO1xyXG5jb25zdCBsaW5lYXIgPSBVdGlscy5saW5lYXI7XHJcblxyXG50eXBlIEZvcm1hdFBhcnNlciA9IHtcclxuICByZWdleHA6IFJlZ0V4cDtcclxuICBhcHBseTogKCBjb2xvcjogQ29sb3IsIG1hdGNoZXM6IFJlZ0V4cEV4ZWNBcnJheSApID0+IHZvaWQ7XHJcbn07XHJcblxyXG4vLyByZWdleCB1dGlsaXRpZXNcclxuY29uc3QgcmdiTnVtYmVyID0gJygtP1xcXFxkezEsM30lPyknOyAvLyBzeW50YXggYWxsb3dzIG5lZ2F0aXZlIGludGVnZXJzIGFuZCBwZXJjZW50YWdlc1xyXG5jb25zdCBhTnVtYmVyID0gJyhcXFxcZCt8XFxcXGQqXFxcXC5cXFxcZCspJzsgLy8gZGVjaW1hbCBwb2ludCBudW1iZXIuIHRlY2huaWNhbGx5IHdlIGFsbG93IGZvciAnMjU1JywgZXZlbiB0aG91Z2ggdGhpcyB3aWxsIGJlIGNsYW1wZWQgdG8gMS5cclxuY29uc3QgcmF3TnVtYmVyID0gJyhcXFxcZHsxLDN9KSc7IC8vIGEgMS0zIGRpZ2l0IG51bWJlclxyXG5cclxuLy8gaGFuZGxlcyBuZWdhdGl2ZSBhbmQgcGVyY2VudGFnZSB2YWx1ZXNcclxuZnVuY3Rpb24gcGFyc2VSR0JOdW1iZXIoIHN0cjogc3RyaW5nICk6IG51bWJlciB7XHJcbiAgbGV0IG11bHRpcGxpZXIgPSAxO1xyXG5cclxuICAvLyBpZiBpdCdzIGEgcGVyY2VudGFnZSwgc3RyaXAgaXQgb2ZmIGFuZCBoYW5kbGUgaXQgdGhhdCB3YXlcclxuICBpZiAoIHN0ci5lbmRzV2l0aCggJyUnICkgKSB7XHJcbiAgICBtdWx0aXBsaWVyID0gMi41NTtcclxuICAgIHN0ciA9IHN0ci5zbGljZSggMCwgc3RyLmxlbmd0aCAtIDEgKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBVdGlscy5yb3VuZFN5bW1ldHJpYyggTnVtYmVyKCBzdHIgKSAqIG11bHRpcGxpZXIgKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29sb3Ige1xyXG4gIC8vIFJHQkEgdmFsdWVzXHJcbiAgcHVibGljIHIhOiBudW1iZXI7XHJcbiAgcHVibGljIGchOiBudW1iZXI7XHJcbiAgcHVibGljIGIhOiBudW1iZXI7XHJcbiAgcHVibGljIGEhOiBudW1iZXI7XHJcblxyXG4gIC8vIEZvciBjYWNoaW5nIGFuZCBwZXJmb3JtYW5jZVxyXG4gIHByaXZhdGUgX2Nzcz86IHN0cmluZztcclxuXHJcbiAgLy8gSWYgYXNzZXJ0aW9ucyBhcmUgZW5hYmxlZFxyXG4gIHByaXZhdGUgaW1tdXRhYmxlPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gRmlyZXMgd2hlbiB0aGUgY29sb3IgaXMgY2hhbmdlZFxyXG4gIHB1YmxpYyByZWFkb25seSBjaGFuZ2VFbWl0dGVyOiBURW1pdHRlcjtcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIENvbG9yIHdpdGggYW4gaW5pdGlhbCB2YWx1ZS4gTXVsdGlwbGUgZGlmZmVyZW50IHR5cGVzIG9mIHBhcmFtZXRlcnMgYXJlIHN1cHBvcnRlZDpcclxuICAgKiAtIG5ldyBDb2xvciggY29sb3IgKSBpcyBhIGNvcHkgY29uc3RydWN0b3IsIGZvciBhIHtDb2xvcn1cclxuICAgKiAtIG5ldyBDb2xvciggc3RyaW5nICkgd2lsbCBwYXJzZSB0aGUgc3RyaW5nIGFzc3VtaW5nIGl0J3MgYSBDU1MtY29tcGF0aWJsZSBjb2xvciwgZS5nLiBzZXQoICdyZWQnIClcclxuICAgKiAtIG5ldyBDb2xvciggciwgZywgYiApIGlzIGVxdWl2YWxlbnQgdG8gc2V0UkdCQSggciwgZywgYiwgMSApLCBlLmcuIHNldCggMjU1LCAwLCAxMjggKVxyXG4gICAqIC0gbmV3IENvbG9yKCByLCBnLCBiLCBhICkgaXMgZXF1aXZhbGVudCB0byBzZXRSR0JBKCByLCBnLCBiLCBhICksIGUuZy4gc2V0KCAyNTUsIDAsIDEyOCwgMC41IClcclxuICAgKiAtIG5ldyBDb2xvciggaGV4ICkgd2lsbCBzZXQgUkdCIHdpdGggYWxwaGE9MSwgZS5nLiBzZXQoIDB4RkYwMDAwIClcclxuICAgKiAtIG5ldyBDb2xvciggaGV4LCBhICkgd2lsbCBzZXQgUkdCQSwgZS5nLiBzZXQoIDB4RkYwMDAwLCAxIClcclxuICAgKiAtIG5ldyBDb2xvciggbnVsbCApIHdpbGwgYmUgdHJhbnNwYXJlbnRcclxuICAgKlxyXG4gICAqIFRoZSAncicsICdnJywgYW5kICdiJyB2YWx1ZXMgc3RhbmQgZm9yIHJlZCwgZ3JlZW4gYW5kIGJsdWUgcmVzcGVjdGl2ZWx5LCBhbmQgd2lsbCBiZSBjbGFtcGVkIHRvIGludGVnZXJzIGluIDAtMjU1LlxyXG4gICAqIFRoZSAnYScgdmFsdWUgc3RhbmRzIGZvciBhbHBoYSwgYW5kIHdpbGwgYmUgY2xhbXBlZCB0byAwLTEgKGZsb2F0aW5nIHBvaW50KVxyXG4gICAqICdoZXgnIGluZGljYXRlcyBhIDYtZGVjaW1hbC1kaWdpdCBmb3JtYXQgaGV4IG51bWJlciwgZm9yIGV4YW1wbGUgMHhGRkFBMDAgaXMgZXF1aXZhbGVudCB0byByPTI1NSwgZz0xNzAsIGI9MC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSByIC0gU2VlIGFib3ZlIGZvciB0aGUgcG9zc2libGUgb3ZlcmxvYWRlZCB2YWx1ZXNcclxuICAgKiBAcGFyYW0gW2ddIC0gSWYgcHJvdmlkZWQsIHNob3VsZCBiZSB0aGUgZ3JlZW4gdmFsdWUgKG9yIHRoZSBhbHBoYSB2YWx1ZSBpZiBhIGhleCBjb2xvciBpcyBnaXZlbilcclxuICAgKiBAcGFyYW0gW2JdIC0gSWYgcHJvdmlkZWQsIHNob3VsZCBiZSB0aGUgYmx1ZSB2YWx1ZVxyXG4gICAqIEBwYXJhbSBbYV0gLSBJZiBwcm92aWRlZCwgc2hvdWxkIGJlIHRoZSBhbHBoYSB2YWx1ZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY29sb3I6IENvbG9yICk7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzdHJpbmc6IHN0cmluZyApO1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcjogbnVtYmVyLCBnOiBudW1iZXIsIGI6IG51bWJlciwgYT86IG51bWJlciApO1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaGV4OiBudW1iZXIsIGE/OiBudW1iZXIgKTtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRyYW5zcGFyZW50OiBudWxsICk7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCByOiBudW1iZXIgfCBDb2xvciB8IHN0cmluZyB8IG51bGwsIGc/OiBudW1iZXIsIGI/OiBudW1iZXIsIGE/OiBudW1iZXIgKSB7XHJcblxyXG4gICAgLy8ge0VtaXR0ZXJ9XHJcbiAgICB0aGlzLmNoYW5nZUVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcclxuXHJcbiAgICB0aGlzLnNldCggciwgZywgYiwgYSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGNvcHkgb2YgdGhpcyBjb2xvci5cclxuICAgKi9cclxuICBwdWJsaWMgY29weSgpOiBDb2xvciB7XHJcbiAgICByZXR1cm4gbmV3IENvbG9yKCB0aGlzLnIsIHRoaXMuZywgdGhpcy5iLCB0aGlzLmEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHZhbHVlcyBvZiB0aGlzIENvbG9yLiBTdXBwb3J0ZWQgc3R5bGVzOlxyXG4gICAqXHJcbiAgICogLSBzZXQoIGNvbG9yICkgaXMgYSBjb3B5IGNvbnN0cnVjdG9yXHJcbiAgICogLSBzZXQoIHN0cmluZyApIHdpbGwgcGFyc2UgdGhlIHN0cmluZyBhc3N1bWluZyBpdCdzIGEgQ1NTLWNvbXBhdGlibGUgY29sb3IsIGUuZy4gc2V0KCAncmVkJyApXHJcbiAgICogLSBzZXQoIHIsIGcsIGIgKSBpcyBlcXVpdmFsZW50IHRvIHNldFJHQkEoIHIsIGcsIGIsIDEgKSwgZS5nLiBzZXQoIDI1NSwgMCwgMTI4IClcclxuICAgKiAtIHNldCggciwgZywgYiwgYSApIGlzIGVxdWl2YWxlbnQgdG8gc2V0UkdCQSggciwgZywgYiwgYSApLCBlLmcuIHNldCggMjU1LCAwLCAxMjgsIDAuNSApXHJcbiAgICogLSBzZXQoIGhleCApIHdpbGwgc2V0IFJHQiB3aXRoIGFscGhhPTEsIGUuZy4gc2V0KCAweEZGMDAwMCApXHJcbiAgICogLSBzZXQoIGhleCwgYWxwaGEgKSB3aWxsIHNldCBSR0JBLCBlLmcuIHNldCggMHhGRjAwMDAsIDEgKVxyXG4gICAqIC0gc2V0KCBudWxsICkgd2lsbCBiZSB0cmFuc3BhcmVudFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHIgLSBTZWUgYWJvdmUgZm9yIHRoZSBwb3NzaWJsZSBvdmVybG9hZGVkIHZhbHVlc1xyXG4gICAqIEBwYXJhbSBbZ10gLSBJZiBwcm92aWRlZCwgc2hvdWxkIGJlIHRoZSBncmVlbiB2YWx1ZSAob3IgdGhlIGFscGhhIHZhbHVlIGlmIGEgaGV4IGNvbG9yIGlzIGdpdmVuKVxyXG4gICAqIEBwYXJhbSBbYl0gLSBJZiBwcm92aWRlZCwgc2hvdWxkIGJlIHRoZSBibHVlIHZhbHVlXHJcbiAgICogQHBhcmFtIFthXSAtIElmIHByb3ZpZGVkLCBzaG91bGQgYmUgdGhlIGFscGhhIHZhbHVlXHJcbiAgICovXHJcbiAgcHVibGljIHNldCggcjogbnVtYmVyIHwgQ29sb3IgfCBzdHJpbmcgfCBudWxsLCBnPzogbnVtYmVyLCBiPzogbnVtYmVyLCBhPzogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggciAhPT0gdW5kZWZpbmVkLCAnQ2FuXFwndCBjYWxsIENvbG9yLnNldCggdW5kZWZpbmVkICknICk7XHJcblxyXG4gICAgaWYgKCByID09PSBudWxsICkge1xyXG4gICAgICB0aGlzLnNldFJHQkEoIDAsIDAsIDAsIDAgKTtcclxuICAgIH1cclxuICAgIC8vIHN1cHBvcnQgZm9yIHNldCggc3RyaW5nIClcclxuICAgIGVsc2UgaWYgKCB0eXBlb2YgciA9PT0gJ3N0cmluZycgKSB7XHJcbiAgICAgIHRoaXMuc2V0Q1NTKCByICk7XHJcbiAgICB9XHJcbiAgICAvLyBzdXBwb3J0IGZvciBzZXQoIGNvbG9yIClcclxuICAgIGVsc2UgaWYgKCByIGluc3RhbmNlb2YgQ29sb3IgKSB7XHJcbiAgICAgIHRoaXMuc2V0UkdCQSggci5yLCByLmcsIHIuYiwgci5hICk7XHJcbiAgICB9XHJcbiAgICAvLyBzdXBwb3J0IGZvciBzZXQoIGhleCApIGFuZCBzZXQoIGhleCwgYWxwaGEgKVxyXG4gICAgZWxzZSBpZiAoIGIgPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBnID09PSAnbnVtYmVyJyApO1xyXG5cclxuICAgICAgY29uc3QgcmVkID0gKCByID4+IDE2ICkgJiAweEZGO1xyXG4gICAgICBjb25zdCBncmVlbiA9ICggciA+PiA4ICkgJiAweEZGO1xyXG4gICAgICBjb25zdCBibHVlID0gKCByID4+IDAgKSAmIDB4RkY7XHJcbiAgICAgIGNvbnN0IGFscGhhID0gKCBnID09PSB1bmRlZmluZWQgKSA/IDEgOiBnO1xyXG4gICAgICB0aGlzLnNldFJHQkEoIHJlZCwgZ3JlZW4sIGJsdWUsIGFscGhhICk7XHJcbiAgICB9XHJcbiAgICAvLyBzdXBwb3J0IGZvciBzZXQoIHIsIGcsIGIgKSBhbmQgc2V0KCByLCBnLCBiLCBhIClcclxuICAgIGVsc2Uge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIGEgPT09ICdudW1iZXInICk7XHJcbiAgICAgIHRoaXMuc2V0UkdCQSggciwgZyEsIGIsICggYSA9PT0gdW5kZWZpbmVkICkgPyAxIDogYSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzOyAvLyBzdXBwb3J0IGNoYWluaW5nXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSByZWQgdmFsdWUgYXMgYW4gaW50ZWdlciBiZXR3ZWVuIDAgYW5kIDI1NVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRSZWQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLnI7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHJlZCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRSZWQoKTsgfVxyXG5cclxuICBwdWJsaWMgc2V0IHJlZCggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRSZWQoIHZhbHVlICk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgcmVkIHZhbHVlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHZhbHVlIC0gV2lsbCBiZSBjbGFtcGVkIHRvIGFuIGludGVnZXIgYmV0d2VlbiAwIGFuZCAyNTVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0UmVkKCB2YWx1ZTogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0UkdCQSggdmFsdWUsIHRoaXMuZywgdGhpcy5iLCB0aGlzLmEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGdyZWVuIHZhbHVlIGFzIGFuIGludGVnZXIgYmV0d2VlbiAwIGFuZCAyNTVcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0R3JlZW4oKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmc7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGdyZWVuKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldEdyZWVuKCk7IH1cclxuXHJcbiAgcHVibGljIHNldCBncmVlbiggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRHcmVlbiggdmFsdWUgKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBncmVlbiB2YWx1ZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB2YWx1ZSAtIFdpbGwgYmUgY2xhbXBlZCB0byBhbiBpbnRlZ2VyIGJldHdlZW4gMCBhbmQgMjU1XHJcbiAgICovXHJcbiAgcHVibGljIHNldEdyZWVuKCB2YWx1ZTogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0UkdCQSggdGhpcy5yLCB2YWx1ZSwgdGhpcy5iLCB0aGlzLmEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGJsdWUgdmFsdWUgYXMgYW4gaW50ZWdlciBiZXR3ZWVuIDAgYW5kIDI1NVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRCbHVlKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5iO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBibHVlKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldEJsdWUoKTsgfVxyXG5cclxuICBwdWJsaWMgc2V0IGJsdWUoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0Qmx1ZSggdmFsdWUgKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBibHVlIHZhbHVlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHZhbHVlIC0gV2lsbCBiZSBjbGFtcGVkIHRvIGFuIGludGVnZXIgYmV0d2VlbiAwIGFuZCAyNTVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0Qmx1ZSggdmFsdWU6IG51bWJlciApOiB0aGlzIHtcclxuICAgIHJldHVybiB0aGlzLnNldFJHQkEoIHRoaXMuciwgdGhpcy5nLCB2YWx1ZSwgdGhpcy5hICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBhbHBoYSB2YWx1ZSBhcyBhIGZsb2F0aW5nLXBvaW50IHZhbHVlIGJldHdlZW4gMCBhbmQgMVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRBbHBoYSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuYTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYWxwaGEoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0QWxwaGEoKTsgfVxyXG5cclxuICBwdWJsaWMgc2V0IGFscGhhKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldEFscGhhKCB2YWx1ZSApOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGFscGhhIHZhbHVlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHZhbHVlIC0gV2lsbCBiZSBjbGFtcGVkIGJldHdlZW4gMCBhbmQgMVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRBbHBoYSggdmFsdWU6IG51bWJlciApOiB0aGlzIHtcclxuICAgIHJldHVybiB0aGlzLnNldFJHQkEoIHRoaXMuciwgdGhpcy5nLCB0aGlzLmIsIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiB0aGlzIENvbG9yIHVzaW5nIFJHQiBpbnRlZ3JhbCBiZXR3ZWVuIDAtMjU1LCBhbHBoYSAoZmxvYXQpIGJldHdlZW4gMC0xLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRSR0JBKCByZWQ6IG51bWJlciwgZ3JlZW46IG51bWJlciwgYmx1ZTogbnVtYmVyLCBhbHBoYTogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgdGhpcy5yID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIGNsYW1wKCByZWQsIDAsIDI1NSApICk7XHJcbiAgICB0aGlzLmcgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggY2xhbXAoIGdyZWVuLCAwLCAyNTUgKSApO1xyXG4gICAgdGhpcy5iID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIGNsYW1wKCBibHVlLCAwLCAyNTUgKSApO1xyXG4gICAgdGhpcy5hID0gY2xhbXAoIGFscGhhLCAwLCAxICk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVDb2xvcigpOyAvLyB1cGRhdGUgdGhlIGNhY2hlZCB2YWx1ZVxyXG5cclxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBsaW5lYXIgKGdhbW1hLWNvcnJlY3RlZCkgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHRoaXMgY29sb3IgKHJhdGlvPTApIGFuZCBhbm90aGVyIGNvbG9yIChyYXRpbz0xKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBvdGhlckNvbG9yXHJcbiAgICogQHBhcmFtIHJhdGlvIC0gTm90IG5lY2Vzc2FyaWx5IGNvbnN0cmFpbmVkIGluIFswLCAxXVxyXG4gICAqL1xyXG4gIHB1YmxpYyBibGVuZCggb3RoZXJDb2xvcjogQ29sb3IsIHJhdGlvOiBudW1iZXIgKTogQ29sb3Ige1xyXG4gICAgY29uc3QgZ2FtbWEgPSAyLjQ7XHJcbiAgICBjb25zdCBsaW5lYXJSZWRBID0gTWF0aC5wb3coIHRoaXMuciwgZ2FtbWEgKTtcclxuICAgIGNvbnN0IGxpbmVhclJlZEIgPSBNYXRoLnBvdyggb3RoZXJDb2xvci5yLCBnYW1tYSApO1xyXG4gICAgY29uc3QgbGluZWFyR3JlZW5BID0gTWF0aC5wb3coIHRoaXMuZywgZ2FtbWEgKTtcclxuICAgIGNvbnN0IGxpbmVhckdyZWVuQiA9IE1hdGgucG93KCBvdGhlckNvbG9yLmcsIGdhbW1hICk7XHJcbiAgICBjb25zdCBsaW5lYXJCbHVlQSA9IE1hdGgucG93KCB0aGlzLmIsIGdhbW1hICk7XHJcbiAgICBjb25zdCBsaW5lYXJCbHVlQiA9IE1hdGgucG93KCBvdGhlckNvbG9yLmIsIGdhbW1hICk7XHJcblxyXG4gICAgY29uc3QgciA9IE1hdGgucG93KCBsaW5lYXJSZWRBICsgKCBsaW5lYXJSZWRCIC0gbGluZWFyUmVkQSApICogcmF0aW8sIDEgLyBnYW1tYSApO1xyXG4gICAgY29uc3QgZyA9IE1hdGgucG93KCBsaW5lYXJHcmVlbkEgKyAoIGxpbmVhckdyZWVuQiAtIGxpbmVhckdyZWVuQSApICogcmF0aW8sIDEgLyBnYW1tYSApO1xyXG4gICAgY29uc3QgYiA9IE1hdGgucG93KCBsaW5lYXJCbHVlQSArICggbGluZWFyQmx1ZUIgLSBsaW5lYXJCbHVlQSApICogcmF0aW8sIDEgLyBnYW1tYSApO1xyXG4gICAgY29uc3QgYSA9IHRoaXMuYSArICggb3RoZXJDb2xvci5hIC0gdGhpcy5hICkgKiByYXRpbztcclxuXHJcbiAgICByZXR1cm4gbmV3IENvbG9yKCByLCBnLCBiLCBhICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVc2VkIGludGVybmFsbHkgdG8gY29tcHV0ZSB0aGUgQ1NTIHN0cmluZyBmb3IgdGhpcyBjb2xvci4gVXNlIHRvQ1NTKClcclxuICAgKi9cclxuICBwcml2YXRlIGNvbXB1dGVDU1MoKTogc3RyaW5nIHtcclxuICAgIGlmICggdGhpcy5hID09PSAxICkge1xyXG4gICAgICByZXR1cm4gYHJnYigke3RoaXMucn0sJHt0aGlzLmd9LCR7dGhpcy5ifSlgO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIFNpbmNlIFNWRyBkb2Vzbid0IHN1cHBvcnQgcGFyc2luZyBzY2llbnRpZmljIG5vdGF0aW9uIChlLmcuIDdlNSksIHdlIG5lZWQgdG8gb3V0cHV0IGZpeGVkIGRlY2ltYWwtcG9pbnQgc3RyaW5ncy5cclxuICAgICAgLy8gU2luY2UgdGhpcyBuZWVkcyB0byBiZSBkb25lIHF1aWNrbHksIGFuZCB3ZSBkb24ndCBwYXJ0aWN1bGFybHkgY2FyZSBhYm91dCBzbGlnaHQgcm91bmRpbmcgZGlmZmVyZW5jZXMgKGl0J3NcclxuICAgICAgLy8gYmVpbmcgdXNlZCBmb3IgZGlzcGxheSBwdXJwb3NlcyBvbmx5LCBhbmQgaXMgbmV2ZXIgc2hvd24gdG8gdGhlIHVzZXIpLCB3ZSB1c2UgdGhlIGJ1aWx0LWluIEpTIHRvRml4ZWQgaW5zdGVhZCBvZlxyXG4gICAgICAvLyBEb3QncyB2ZXJzaW9uIG9mIHRvRml4ZWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNTBcclxuICAgICAgbGV0IGFscGhhID0gdGhpcy5hLnRvRml4ZWQoIDIwICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFkLXNpbS10ZXh0XHJcbiAgICAgIHdoaWxlICggYWxwaGEubGVuZ3RoID49IDIgJiYgYWxwaGEuZW5kc1dpdGgoICcwJyApICYmIGFscGhhWyBhbHBoYS5sZW5ndGggLSAyIF0gIT09ICcuJyApIHtcclxuICAgICAgICBhbHBoYSA9IGFscGhhLnNsaWNlKCAwLCBhbHBoYS5sZW5ndGggLSAxICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGFscGhhU3RyaW5nID0gdGhpcy5hID09PSAwIHx8IHRoaXMuYSA9PT0gMSA/IHRoaXMuYSA6IGFscGhhO1xyXG4gICAgICByZXR1cm4gYHJnYmEoJHt0aGlzLnJ9LCR7dGhpcy5nfSwke3RoaXMuYn0sJHthbHBoYVN0cmluZ30pYDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoaXMgQ29sb3IgYXMgYSBDU1Mgc3RyaW5nLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b0NTUygpOiBzdHJpbmcge1xyXG4gICAgLy8gdmVyaWZ5IHRoYXQgdGhlIGNhY2hlZCB2YWx1ZSBpcyBjb3JyZWN0IChpbiBkZWJ1Z2dpbmcgYnVpbGRzIG9ubHksIGRlZmVhdHMgdGhlIHBvaW50IG9mIGNhY2hpbmcgb3RoZXJ3aXNlKVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fY3NzID09PSB0aGlzLmNvbXB1dGVDU1MoKSwgYENTUyBjYWNoZWQgdmFsdWUgaXMgJHt0aGlzLl9jc3N9LCBidXQgdGhlIGNvbXB1dGVkIHZhbHVlIGFwcGVhcnMgdG8gYmUgJHt0aGlzLmNvbXB1dGVDU1MoKX1gICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX2NzcyE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoaXMgY29sb3IgZm9yIGEgQ1NTIGNvbG9yIHN0cmluZy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q1NTKCBjc3NTdHJpbmc6IHN0cmluZyApOiB0aGlzIHtcclxuICAgIGxldCBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICBjb25zdCBzdHIgPSBDb2xvci5wcmVwcm9jZXNzQ1NTKCBjc3NTdHJpbmcgKTtcclxuXHJcbiAgICAvLyBydW4gdGhyb3VnaCB0aGUgYXZhaWxhYmxlIHRleHQgZm9ybWF0c1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgQ29sb3IuZm9ybWF0UGFyc2Vycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgcGFyc2VyID0gQ29sb3IuZm9ybWF0UGFyc2Vyc1sgaSBdO1xyXG5cclxuICAgICAgY29uc3QgbWF0Y2hlcyA9IHBhcnNlci5yZWdleHAuZXhlYyggc3RyICk7XHJcbiAgICAgIGlmICggbWF0Y2hlcyApIHtcclxuICAgICAgICBwYXJzZXIuYXBwbHkoIHRoaXMsIG1hdGNoZXMgKTtcclxuICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICggIXN1Y2Nlc3MgKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggYENvbG9yIHVuYWJsZSB0byBwYXJzZSBjb2xvciBzdHJpbmc6ICR7Y3NzU3RyaW5nfWAgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnVwZGF0ZUNvbG9yKCk7IC8vIHVwZGF0ZSB0aGUgY2FjaGVkIHZhbHVlXHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoaXMgY29sb3IncyBSR0IgaW5mb3JtYXRpb24gaW4gdGhlIGhleGFkZWNpbWFsIG51bWJlciBlcXVpdmFsZW50LCBlLmcuIDB4RkYwMEZGXHJcbiAgICovXHJcbiAgcHVibGljIHRvTnVtYmVyKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gKCB0aGlzLnIgPDwgMTYgKSArICggdGhpcy5nIDw8IDggKSArIHRoaXMuYjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB0byB1cGRhdGUgdGhlIGludGVybmFsbHkgY2FjaGVkIENTUyB2YWx1ZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgdXBkYXRlQ29sb3IoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pbW11dGFibGUsXHJcbiAgICAgICdDYW5ub3QgbW9kaWZ5IGFuIGltbXV0YWJsZSBjb2xvci4gTGlrZWx5IGNhdXNlZCBieSB0cnlpbmcgdG8gbXV0YXRlIGEgY29sb3IgYWZ0ZXIgaXQgd2FzIHVzZWQgZm9yIGEgbm9kZSBmaWxsL3N0cm9rZScgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGhpcy5yZWQgPT09ICdudW1iZXInICYmXHJcbiAgICB0eXBlb2YgdGhpcy5ncmVlbiA9PT0gJ251bWJlcicgJiZcclxuICAgIHR5cGVvZiB0aGlzLmJsdWUgPT09ICdudW1iZXInICYmXHJcbiAgICB0eXBlb2YgdGhpcy5hbHBoYSA9PT0gJ251bWJlcicsXHJcbiAgICAgIGBFbnN1cmUgY29sb3IgY29tcG9uZW50cyBhcmUgbnVtZXJpYzogJHt0aGlzLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB0aGlzLnJlZCApICYmIGlzRmluaXRlKCB0aGlzLmdyZWVuICkgJiYgaXNGaW5pdGUoIHRoaXMuYmx1ZSApICYmIGlzRmluaXRlKCB0aGlzLmFscGhhICksXHJcbiAgICAgICdFbnN1cmUgY29sb3IgY29tcG9uZW50cyBhcmUgZmluaXRlIGFuZCBub3QgTmFOJyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucmVkID49IDAgJiYgdGhpcy5yZWQgPD0gMjU1ICYmXHJcbiAgICB0aGlzLmdyZWVuID49IDAgJiYgdGhpcy5ncmVlbiA8PSAyNTUgJiZcclxuICAgIHRoaXMucmVkID49IDAgJiYgdGhpcy5yZWQgPD0gMjU1ICYmXHJcbiAgICB0aGlzLmFscGhhID49IDAgJiYgdGhpcy5hbHBoYSA8PSAxLFxyXG4gICAgICBgRW5zdXJlIGNvbG9yIGNvbXBvbmVudHMgYXJlIGluIHRoZSBwcm9wZXIgcmFuZ2VzOiAke3RoaXMudG9TdHJpbmcoKX1gICk7XHJcblxyXG4gICAgY29uc3Qgb2xkQ1NTID0gdGhpcy5fY3NzO1xyXG4gICAgdGhpcy5fY3NzID0gdGhpcy5jb21wdXRlQ1NTKCk7XHJcblxyXG4gICAgLy8gbm90aWZ5IGxpc3RlbmVycyBpZiBpdCBjaGFuZ2VkXHJcbiAgICBpZiAoIG9sZENTUyAhPT0gdGhpcy5fY3NzICkge1xyXG4gICAgICB0aGlzLmNoYW5nZUVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWxsb3cgc2V0dGluZyB0aGlzIENvbG9yIHRvIGJlIGltbXV0YWJsZSB3aGVuIGFzc2VydGlvbnMgYXJlIGRpc2FibGVkLiBhbnkgY2hhbmdlIHdpbGwgdGhyb3cgYW4gZXJyb3JcclxuICAgKi9cclxuICBwdWJsaWMgc2V0SW1tdXRhYmxlKCk6IHRoaXMge1xyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIHRoaXMuaW1tdXRhYmxlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHBhc3NlZCB0byBhIENhbnZhcyBjb250ZXh0J3MgZmlsbFN0eWxlIG9yIHN0cm9rZVN0eWxlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDYW52YXNTdHlsZSgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMudG9DU1MoKTsgLy8gc2hvdWxkIGJlIGlubGluZWQsIGxlYXZlIGxpa2UgdGhpcyBmb3IgZnV0dXJlIG1haW50YWluYWJpbGl0eVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGlzIGNvbG9yIHVzaW5nIEhTTEEgdmFsdWVzLlxyXG4gICAqXHJcbiAgICogVE9ETzogbWFrZSBhIGdldEh1ZSwgZ2V0U2F0dXJhdGlvbiwgZ2V0TGlnaHRuZXNzLiB3ZSBjYW4gdGhlbiBleHBvc2UgdGhlbSB2aWEgRVM1IVxyXG4gICAqXHJcbiAgICogQHBhcmFtIGh1ZSAtIGludGVnZXIgbW9kdWxvIDM2MFxyXG4gICAqIEBwYXJhbSBzYXR1cmF0aW9uIC0gcGVyY2VudGFnZVxyXG4gICAqIEBwYXJhbSBsaWdodG5lc3MgLSBwZXJjZW50YWdlXHJcbiAgICogQHBhcmFtIGFscGhhXHJcbiAgICovXHJcbiAgcHVibGljIHNldEhTTEEoIGh1ZTogbnVtYmVyLCBzYXR1cmF0aW9uOiBudW1iZXIsIGxpZ2h0bmVzczogbnVtYmVyLCBhbHBoYTogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgaHVlID0gKCBodWUgJSAzNjAgKSAvIDM2MDtcclxuICAgIHNhdHVyYXRpb24gPSBjbGFtcCggc2F0dXJhdGlvbiAvIDEwMCwgMCwgMSApO1xyXG4gICAgbGlnaHRuZXNzID0gY2xhbXAoIGxpZ2h0bmVzcyAvIDEwMCwgMCwgMSApO1xyXG5cclxuICAgIC8vIHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLWNvbG9yL1xyXG4gICAgbGV0IG0yO1xyXG4gICAgaWYgKCBsaWdodG5lc3MgPCAwLjUgKSB7XHJcbiAgICAgIG0yID0gbGlnaHRuZXNzICogKCBzYXR1cmF0aW9uICsgMSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIG0yID0gbGlnaHRuZXNzICsgc2F0dXJhdGlvbiAtIGxpZ2h0bmVzcyAqIHNhdHVyYXRpb247XHJcbiAgICB9XHJcbiAgICBjb25zdCBtMSA9IGxpZ2h0bmVzcyAqIDIgLSBtMjtcclxuXHJcbiAgICB0aGlzLnIgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggQ29sb3IuaHVlVG9SR0IoIG0xLCBtMiwgaHVlICsgMSAvIDMgKSAqIDI1NSApO1xyXG4gICAgdGhpcy5nID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIENvbG9yLmh1ZVRvUkdCKCBtMSwgbTIsIGh1ZSApICogMjU1ICk7XHJcbiAgICB0aGlzLmIgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggQ29sb3IuaHVlVG9SR0IoIG0xLCBtMiwgaHVlIC0gMSAvIDMgKSAqIDI1NSApO1xyXG4gICAgdGhpcy5hID0gY2xhbXAoIGFscGhhLCAwLCAxICk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVDb2xvcigpOyAvLyB1cGRhdGUgdGhlIGNhY2hlZCB2YWx1ZVxyXG5cclxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGVxdWFscyggY29sb3I6IENvbG9yICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuciA9PT0gY29sb3IuciAmJiB0aGlzLmcgPT09IGNvbG9yLmcgJiYgdGhpcy5iID09PSBjb2xvci5iICYmIHRoaXMuYSA9PT0gY29sb3IuYTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBjb3B5IG9mIHRoaXMgY29sb3Igd2l0aCBhIGRpZmZlcmVudCBhbHBoYSB2YWx1ZS5cclxuICAgKi9cclxuICBwdWJsaWMgd2l0aEFscGhhKCBhbHBoYTogbnVtYmVyICk6IENvbG9yIHtcclxuICAgIHJldHVybiBuZXcgQ29sb3IoIHRoaXMuciwgdGhpcy5nLCB0aGlzLmIsIGFscGhhICk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNoZWNrRmFjdG9yKCBmYWN0b3I/OiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhY3RvciA9PT0gdW5kZWZpbmVkIHx8ICggZmFjdG9yID49IDAgJiYgZmFjdG9yIDw9IDEgKSwgYGZhY3RvciBtdXN0IGJlIGJldHdlZW4gMCBhbmQgMTogJHtmYWN0b3J9YCApO1xyXG5cclxuICAgIHJldHVybiAoIGZhY3RvciA9PT0gdW5kZWZpbmVkICkgPyAwLjcgOiBmYWN0b3I7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXRjaGVzIEphdmEncyBDb2xvci5icmlnaHRlcigpXHJcbiAgICovXHJcbiAgcHVibGljIGJyaWdodGVyQ29sb3IoIGZhY3Rvcj86IG51bWJlciApOiBDb2xvciB7XHJcbiAgICBmYWN0b3IgPSB0aGlzLmNoZWNrRmFjdG9yKCBmYWN0b3IgKTtcclxuICAgIGNvbnN0IHJlZCA9IE1hdGgubWluKCAyNTUsIE1hdGguZmxvb3IoIHRoaXMuciAvIGZhY3RvciApICk7XHJcbiAgICBjb25zdCBncmVlbiA9IE1hdGgubWluKCAyNTUsIE1hdGguZmxvb3IoIHRoaXMuZyAvIGZhY3RvciApICk7XHJcbiAgICBjb25zdCBibHVlID0gTWF0aC5taW4oIDI1NSwgTWF0aC5mbG9vciggdGhpcy5iIC8gZmFjdG9yICkgKTtcclxuICAgIHJldHVybiBuZXcgQ29sb3IoIHJlZCwgZ3JlZW4sIGJsdWUsIHRoaXMuYSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQnJpZ2h0ZW5zIGEgY29sb3IgaW4gUkdCIHNwYWNlLiBVc2VmdWwgd2hlbiBjcmVhdGluZyBncmFkaWVudHMgZnJvbSBhIHNpbmdsZSBiYXNlIGNvbG9yLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIFtmYWN0b3JdIC0gMCAobm8gY2hhbmdlKSB0byAxICh3aGl0ZSlcclxuICAgKiBAcmV0dXJucyAtIChjbG9zZXIgdG8gd2hpdGUpIHZlcnNpb24gb2YgdGhlIG9yaWdpbmFsIGNvbG9yLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb2xvclV0aWxzQnJpZ2h0ZXIoIGZhY3Rvcj86IG51bWJlciApOiBDb2xvciB7XHJcbiAgICBmYWN0b3IgPSB0aGlzLmNoZWNrRmFjdG9yKCBmYWN0b3IgKTtcclxuICAgIGNvbnN0IHJlZCA9IE1hdGgubWluKCAyNTUsIHRoaXMuZ2V0UmVkKCkgKyBNYXRoLmZsb29yKCBmYWN0b3IgKiAoIDI1NSAtIHRoaXMuZ2V0UmVkKCkgKSApICk7XHJcbiAgICBjb25zdCBncmVlbiA9IE1hdGgubWluKCAyNTUsIHRoaXMuZ2V0R3JlZW4oKSArIE1hdGguZmxvb3IoIGZhY3RvciAqICggMjU1IC0gdGhpcy5nZXRHcmVlbigpICkgKSApO1xyXG4gICAgY29uc3QgYmx1ZSA9IE1hdGgubWluKCAyNTUsIHRoaXMuZ2V0Qmx1ZSgpICsgTWF0aC5mbG9vciggZmFjdG9yICogKCAyNTUgLSB0aGlzLmdldEJsdWUoKSApICkgKTtcclxuICAgIHJldHVybiBuZXcgQ29sb3IoIHJlZCwgZ3JlZW4sIGJsdWUsIHRoaXMuZ2V0QWxwaGEoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWF0Y2hlcyBKYXZhJ3MgQ29sb3IuZGFya2VyKClcclxuICAgKi9cclxuICBwdWJsaWMgZGFya2VyQ29sb3IoIGZhY3Rvcj86IG51bWJlciApOiBDb2xvciB7XHJcbiAgICBmYWN0b3IgPSB0aGlzLmNoZWNrRmFjdG9yKCBmYWN0b3IgKTtcclxuICAgIGNvbnN0IHJlZCA9IE1hdGgubWF4KCAwLCBNYXRoLmZsb29yKCBmYWN0b3IgKiB0aGlzLnIgKSApO1xyXG4gICAgY29uc3QgZ3JlZW4gPSBNYXRoLm1heCggMCwgTWF0aC5mbG9vciggZmFjdG9yICogdGhpcy5nICkgKTtcclxuICAgIGNvbnN0IGJsdWUgPSBNYXRoLm1heCggMCwgTWF0aC5mbG9vciggZmFjdG9yICogdGhpcy5iICkgKTtcclxuICAgIHJldHVybiBuZXcgQ29sb3IoIHJlZCwgZ3JlZW4sIGJsdWUsIHRoaXMuYSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGFya2VuIGEgY29sb3IgaW4gUkdCIHNwYWNlLiBVc2VmdWwgd2hlbiBjcmVhdGluZyBncmFkaWVudHMgZnJvbSBhIHNpbmdsZVxyXG4gICAqIGJhc2UgY29sb3IuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gW2ZhY3Rvcl0gLSAwIChubyBjaGFuZ2UpIHRvIDEgKGJsYWNrKVxyXG4gICAqIEByZXR1cm5zIC0gZGFya2VyIChjbG9zZXIgdG8gYmxhY2spIHZlcnNpb24gb2YgdGhlIG9yaWdpbmFsIGNvbG9yLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb2xvclV0aWxzRGFya2VyKCBmYWN0b3I/OiBudW1iZXIgKTogQ29sb3Ige1xyXG4gICAgZmFjdG9yID0gdGhpcy5jaGVja0ZhY3RvciggZmFjdG9yICk7XHJcbiAgICBjb25zdCByZWQgPSBNYXRoLm1heCggMCwgdGhpcy5nZXRSZWQoKSAtIE1hdGguZmxvb3IoIGZhY3RvciAqIHRoaXMuZ2V0UmVkKCkgKSApO1xyXG4gICAgY29uc3QgZ3JlZW4gPSBNYXRoLm1heCggMCwgdGhpcy5nZXRHcmVlbigpIC0gTWF0aC5mbG9vciggZmFjdG9yICogdGhpcy5nZXRHcmVlbigpICkgKTtcclxuICAgIGNvbnN0IGJsdWUgPSBNYXRoLm1heCggMCwgdGhpcy5nZXRCbHVlKCkgLSBNYXRoLmZsb29yKCBmYWN0b3IgKiB0aGlzLmdldEJsdWUoKSApICk7XHJcbiAgICByZXR1cm4gbmV3IENvbG9yKCByZWQsIGdyZWVuLCBibHVlLCB0aGlzLmdldEFscGhhKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExpa2UgY29sb3JVdGlsc0JyaWdodGVyL0RhcmtlciwgaG93ZXZlciBmYWN0b3Igc2hvdWxkIGJlIGluIHRoZSByYW5nZSAtMSB0byAxLCBhbmQgaXQgd2lsbCBjYWxsOlxyXG4gICAqICAgY29sb3JVdGlsc0JyaWdodGVyKCBmYWN0b3IgKSAgIGZvciBmYWN0b3IgPiAgMFxyXG4gICAqICAgdGhpcyAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBmYWN0b3IgPT0gMFxyXG4gICAqICAgY29sb3JVdGlsc0RhcmtlciggLWZhY3RvciApICAgIGZvciBmYWN0b3IgPCAgMFxyXG4gICAqXHJcbiAgICogQHBhcmFtIGZhY3RvciBmcm9tIC0xIChibGFjayksIHRvIDAgKG5vIGNoYW5nZSksIHRvIDEgKHdoaXRlKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb2xvclV0aWxzQnJpZ2h0bmVzcyggZmFjdG9yOiBudW1iZXIgKTogQ29sb3Ige1xyXG4gICAgaWYgKCBmYWN0b3IgPT09IDAgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGZhY3RvciA+IDAgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNvbG9yVXRpbHNCcmlnaHRlciggZmFjdG9yICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY29sb3JVdGlsc0RhcmtlciggLWZhY3RvciApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHN0cmluZyBmb3JtIG9mIHRoaXMgb2JqZWN0XHJcbiAgICovXHJcbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfVtyOiR7dGhpcy5yfSBnOiR7dGhpcy5nfSBiOiR7dGhpcy5ifSBhOiR7dGhpcy5hfV1gO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCB0byBhIGhleCBzdHJpbmcsIHRoYXQgc3RhcnRzIHdpdGggXCIjXCIuXHJcbiAgICovXHJcbiAgcHVibGljIHRvSGV4U3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICBsZXQgaGV4U3RyaW5nID0gdGhpcy50b051bWJlcigpLnRvU3RyaW5nKCAxNiApO1xyXG4gICAgd2hpbGUgKCBoZXhTdHJpbmcubGVuZ3RoIDwgNiApIHtcclxuICAgICAgaGV4U3RyaW5nID0gYDAke2hleFN0cmluZ31gO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGAjJHtoZXhTdHJpbmd9YDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB0b1N0YXRlT2JqZWN0KCk6IHsgcjogbnVtYmVyOyBnOiBudW1iZXI7IGI6IG51bWJlcjsgYTogbnVtYmVyIH0ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcjogdGhpcy5yLFxyXG4gICAgICBnOiB0aGlzLmcsXHJcbiAgICAgIGI6IHRoaXMuYixcclxuICAgICAgYTogdGhpcy5hXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXRpbGl0eSBmdW5jdGlvbiwgc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtY29sb3IvXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBodWVUb1JHQiggbTE6IG51bWJlciwgbTI6IG51bWJlciwgaDogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBpZiAoIGggPCAwICkge1xyXG4gICAgICBoID0gaCArIDE7XHJcbiAgICB9XHJcbiAgICBpZiAoIGggPiAxICkge1xyXG4gICAgICBoID0gaCAtIDE7XHJcbiAgICB9XHJcbiAgICBpZiAoIGggKiA2IDwgMSApIHtcclxuICAgICAgcmV0dXJuIG0xICsgKCBtMiAtIG0xICkgKiBoICogNjtcclxuICAgIH1cclxuICAgIGlmICggaCAqIDIgPCAxICkge1xyXG4gICAgICByZXR1cm4gbTI7XHJcbiAgICB9XHJcbiAgICBpZiAoIGggKiAzIDwgMiApIHtcclxuICAgICAgcmV0dXJuIG0xICsgKCBtMiAtIG0xICkgKiAoIDIgLyAzIC0gaCApICogNjtcclxuICAgIH1cclxuICAgIHJldHVybiBtMTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlbmllbmNlIGZ1bmN0aW9uIHRoYXQgY29udmVydHMgYSBjb2xvciBzcGVjIHRvIGEgY29sb3Igb2JqZWN0IGlmIG5lY2Vzc2FyeSwgb3Igc2ltcGx5IHJldHVybnMgdGhlIGNvbG9yIG9iamVjdFxyXG4gICAqIGlmIG5vdC5cclxuICAgKlxyXG4gICAqIFBsZWFzZSBub3RlIHRoZXJlIGlzIG5vIGRlZmVuc2l2ZSBjb3B5IHdoZW4gYSBjb2xvciBpcyBwYXNzZWQgaW4gdW5saWtlIFBhaW50RGVmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgdG9Db2xvciggY29sb3JTcGVjOiBUQ29sb3IgKTogQ29sb3Ige1xyXG4gICAgaWYgKCBjb2xvclNwZWMgPT09IG51bGwgKSB7XHJcbiAgICAgIHJldHVybiBDb2xvci5UUkFOU1BBUkVOVDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBjb2xvclNwZWMgaW5zdGFuY2VvZiBDb2xvciApIHtcclxuICAgICAgcmV0dXJuIGNvbG9yU3BlYztcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0eXBlb2YgY29sb3JTcGVjID09PSAnc3RyaW5nJyApIHtcclxuICAgICAgcmV0dXJuIG5ldyBDb2xvciggY29sb3JTcGVjICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIENvbG9yLnRvQ29sb3IoIGNvbG9yU3BlYy52YWx1ZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW50ZXJwb2xhdGVzIGJldHdlZW4gMiBjb2xvcnMgaW4gUkdCQSBzcGFjZS4gV2hlbiBkaXN0YW5jZSBpcyAwLCBjb2xvcjEgaXMgcmV0dXJuZWQuIFdoZW4gZGlzdGFuY2UgaXMgMSwgY29sb3IyIGlzXHJcbiAgICogcmV0dXJuZWQuIE90aGVyIHZhbHVlcyBvZiBkaXN0YW5jZSByZXR1cm4gYSBjb2xvciBzb21ld2hlcmUgYmV0d2VlbiBjb2xvcjEgYW5kIGNvbG9yMi4gRWFjaCBjb2xvciBjb21wb25lbnQgaXNcclxuICAgKiBpbnRlcnBvbGF0ZWQgc2VwYXJhdGVseS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjb2xvcjFcclxuICAgKiBAcGFyYW0gY29sb3IyXHJcbiAgICogQHBhcmFtIGRpc3RhbmNlIGRpc3RhbmNlIGJldHdlZW4gY29sb3IxIGFuZCBjb2xvcjIsIDAgPD0gZGlzdGFuY2UgPD0gMVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgaW50ZXJwb2xhdGVSR0JBKCBjb2xvcjE6IENvbG9yLCBjb2xvcjI6IENvbG9yLCBkaXN0YW5jZTogbnVtYmVyICk6IENvbG9yIHtcclxuICAgIGlmICggZGlzdGFuY2UgPCAwIHx8IGRpc3RhbmNlID4gMSApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgZGlzdGFuY2UgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDE6ICR7ZGlzdGFuY2V9YCApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgciA9IE1hdGguZmxvb3IoIGxpbmVhciggMCwgMSwgY29sb3IxLnIsIGNvbG9yMi5yLCBkaXN0YW5jZSApICk7XHJcbiAgICBjb25zdCBnID0gTWF0aC5mbG9vciggbGluZWFyKCAwLCAxLCBjb2xvcjEuZywgY29sb3IyLmcsIGRpc3RhbmNlICkgKTtcclxuICAgIGNvbnN0IGIgPSBNYXRoLmZsb29yKCBsaW5lYXIoIDAsIDEsIGNvbG9yMS5iLCBjb2xvcjIuYiwgZGlzdGFuY2UgKSApO1xyXG4gICAgY29uc3QgYSA9IGxpbmVhciggMCwgMSwgY29sb3IxLmEsIGNvbG9yMi5hLCBkaXN0YW5jZSApO1xyXG4gICAgcmV0dXJuIG5ldyBDb2xvciggciwgZywgYiwgYSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGJsZW5kZWQgY29sb3IgYXMgYSBtaXggYmV0d2VlbiB0aGUgZ2l2ZW4gY29sb3JzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgc3VwZXJzYW1wbGVCbGVuZCggY29sb3JzOiBDb2xvcltdICk6IENvbG9yIHtcclxuICAgIC8vIGhhcmQtY29kZWQgZ2FtbWEgKGFzc3VtaW5nIHRoZSBleHBvbmVudGlhbCBwYXJ0IG9mIHRoZSBzUkdCIGN1cnZlIGFzIGEgc2ltcGxpZmljYXRpb24pXHJcbiAgICBjb25zdCBHQU1NQSA9IDIuMjtcclxuXHJcbiAgICAvLyBtYXBzIHRvIFswLDFdIGxpbmVhciBjb2xvcnNwYWNlXHJcbiAgICBjb25zdCByZWRzID0gY29sb3JzLm1hcCggY29sb3IgPT4gTWF0aC5wb3coIGNvbG9yLnIgLyAyNTUsIEdBTU1BICkgKTtcclxuICAgIGNvbnN0IGdyZWVucyA9IGNvbG9ycy5tYXAoIGNvbG9yID0+IE1hdGgucG93KCBjb2xvci5nIC8gMjU1LCBHQU1NQSApICk7XHJcbiAgICBjb25zdCBibHVlcyA9IGNvbG9ycy5tYXAoIGNvbG9yID0+IE1hdGgucG93KCBjb2xvci5iIC8gMjU1LCBHQU1NQSApICk7XHJcbiAgICBjb25zdCBhbHBoYXMgPSBjb2xvcnMubWFwKCBjb2xvciA9PiBNYXRoLnBvdyggY29sb3IuYSwgR0FNTUEgKSApO1xyXG5cclxuICAgIGNvbnN0IGFscGhhU3VtID0gXy5zdW0oIGFscGhhcyApO1xyXG5cclxuICAgIGlmICggYWxwaGFTdW0gPT09IDAgKSB7XHJcbiAgICAgIHJldHVybiBuZXcgQ29sb3IoIDAsIDAsIDAsIDAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBibGVuZGluZyBvZiBwaXhlbHMsIHdlaWdodGVkIGJ5IGFscGhhc1xyXG4gICAgY29uc3QgcmVkID0gXy5zdW0oIF8ucmFuZ2UoIDAsIGNvbG9ycy5sZW5ndGggKS5tYXAoIGkgPT4gcmVkc1sgaSBdICogYWxwaGFzWyBpIF0gKSApIC8gYWxwaGFTdW07XHJcbiAgICBjb25zdCBncmVlbiA9IF8uc3VtKCBfLnJhbmdlKCAwLCBjb2xvcnMubGVuZ3RoICkubWFwKCBpID0+IGdyZWVuc1sgaSBdICogYWxwaGFzWyBpIF0gKSApIC8gYWxwaGFTdW07XHJcbiAgICBjb25zdCBibHVlID0gXy5zdW0oIF8ucmFuZ2UoIDAsIGNvbG9ycy5sZW5ndGggKS5tYXAoIGkgPT4gYmx1ZXNbIGkgXSAqIGFscGhhc1sgaSBdICkgKSAvIGFscGhhU3VtO1xyXG4gICAgY29uc3QgYWxwaGEgPSBhbHBoYVN1bSAvIGNvbG9ycy5sZW5ndGg7IC8vIGF2ZXJhZ2Ugb2YgYWxwaGFzXHJcblxyXG4gICAgcmV0dXJuIG5ldyBDb2xvcihcclxuICAgICAgTWF0aC5mbG9vciggTWF0aC5wb3coIHJlZCwgMSAvIEdBTU1BICkgKiAyNTUgKSxcclxuICAgICAgTWF0aC5mbG9vciggTWF0aC5wb3coIGdyZWVuLCAxIC8gR0FNTUEgKSAqIDI1NSApLFxyXG4gICAgICBNYXRoLmZsb29yKCBNYXRoLnBvdyggYmx1ZSwgMSAvIEdBTU1BICkgKiAyNTUgKSxcclxuICAgICAgTWF0aC5wb3coIGFscGhhLCAxIC8gR0FNTUEgKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdDogeyByOiBudW1iZXI7IGc6IG51bWJlcjsgYjogbnVtYmVyOyBhOiBudW1iZXIgfSApOiBDb2xvciB7XHJcbiAgICByZXR1cm4gbmV3IENvbG9yKCBzdGF0ZU9iamVjdC5yLCBzdGF0ZU9iamVjdC5nLCBzdGF0ZU9iamVjdC5iLCBzdGF0ZU9iamVjdC5hICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIGhzbGEoIGh1ZTogbnVtYmVyLCBzYXR1cmF0aW9uOiBudW1iZXIsIGxpZ2h0bmVzczogbnVtYmVyLCBhbHBoYTogbnVtYmVyICk6IENvbG9yIHtcclxuICAgIHJldHVybiBuZXcgQ29sb3IoIDAsIDAsIDAsIDEgKS5zZXRIU0xBKCBodWUsIHNhdHVyYXRpb24sIGxpZ2h0bmVzcywgYWxwaGEgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgY2hlY2tQYWludFN0cmluZyggY3NzU3RyaW5nOiBzdHJpbmcgKTogdm9pZCB7XHJcbiAgICBpZiAoIGFzc2VydCApIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzY3JhdGNoQ29sb3Iuc2V0Q1NTKCBjc3NTdHJpbmcgKTtcclxuICAgICAgfVxyXG4gICAgICBjYXRjaCggZSApIHtcclxuICAgICAgICBhc3NlcnQoIGZhbHNlLCBgVGhlIENTUyBzdHJpbmcgaXMgYW4gaW52YWxpZCBjb2xvcjogJHtjc3NTdHJpbmd9YCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIFBhaW50IG9mIHRoZSB0eXBlIHRoYXQgUGFpbnRhYmxlIGFjY2VwdHMgYXMgZmlsbHMgb3Igc3Ryb2tlc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY2hlY2tQYWludCggcGFpbnQ6IFRQYWludCApOiB2b2lkIHtcclxuICAgIGlmICggdHlwZW9mIHBhaW50ID09PSAnc3RyaW5nJyApIHtcclxuICAgICAgQ29sb3IuY2hlY2tQYWludFN0cmluZyggcGFpbnQgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCAoIHBhaW50IGluc3RhbmNlb2YgUmVhZE9ubHlQcm9wZXJ0eSApICYmICggdHlwZW9mIHBhaW50LnZhbHVlID09PSAnc3RyaW5nJyApICkge1xyXG4gICAgICBDb2xvci5jaGVja1BhaW50U3RyaW5nKCBwYWludC52YWx1ZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgbHVtaW5hbmNlIG9mIGEgY29sb3IsIHBlciBJVFUtUiByZWNvbW1lbmRhdGlvbiBCVC43MDksIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1JlYy5fNzA5LlxyXG4gICAqIEdyZWVuIGNvbnRyaWJ1dGVzIHRoZSBtb3N0IHRvIHRoZSBpbnRlbnNpdHkgcGVyY2VpdmVkIGJ5IGh1bWFucywgYW5kIGJsdWUgdGhlIGxlYXN0LlxyXG4gICAqIFRoaXMgYWxnb3JpdGhtIHdvcmtzIGNvcnJlY3RseSB3aXRoIGEgZ3JheXNjYWxlIGNvbG9yIGJlY2F1c2UgdGhlIFJHQiBjb2VmZmljaWVudHMgc3VtIHRvIDEuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyAtIGEgdmFsdWUgaW4gdGhlIHJhbmdlIFswLDI1NV1cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGdldEx1bWluYW5jZSggY29sb3I6IENvbG9yIHwgc3RyaW5nICk6IG51bWJlciB7XHJcbiAgICBjb25zdCBzY2VuZXJ5Q29sb3IgPSBDb2xvci50b0NvbG9yKCBjb2xvciApO1xyXG4gICAgY29uc3QgbHVtaW5hbmNlID0gKCBzY2VuZXJ5Q29sb3IucmVkICogMC4yMTI2ICsgc2NlbmVyeUNvbG9yLmdyZWVuICogMC43MTUyICsgc2NlbmVyeUNvbG9yLmJsdWUgKiAwLjA3MjIgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGx1bWluYW5jZSA+PSAwICYmIGx1bWluYW5jZSA8PSAyNTUsIGB1bmV4cGVjdGVkIGx1bWluYW5jZTogJHtsdW1pbmFuY2V9YCApO1xyXG4gICAgcmV0dXJuIGx1bWluYW5jZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIGEgY29sb3IgdG8gZ3JheXNjYWxlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgdG9HcmF5c2NhbGUoIGNvbG9yOiBDb2xvciB8IHN0cmluZyApOiBDb2xvciB7XHJcbiAgICBjb25zdCBsdW1pbmFuY2UgPSBDb2xvci5nZXRMdW1pbmFuY2UoIGNvbG9yICk7XHJcbiAgICByZXR1cm4gbmV3IENvbG9yKCBsdW1pbmFuY2UsIGx1bWluYW5jZSwgbHVtaW5hbmNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBjb2xvciBpcyAnZGFyaycuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY29sb3IgLSBjb2xvcnMgd2l0aCBsdW1pbmFuY2UgPCB0aGlzIHZhbHVlIGFyZSBkYXJrLCByYW5nZSBbMCwyNTVdLCBkZWZhdWx0IDE4NlxyXG4gICAqIEBwYXJhbSBsdW1pbmFuY2VUaHJlc2hvbGQgLSBjb2xvcnMgd2l0aCBsdW1pbmFuY2UgPCB0aGlzIHZhbHVlIGFyZSBkYXJrLCByYW5nZSBbMCwyNTVdLCBkZWZhdWx0IDE4NlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgaXNEYXJrQ29sb3IoIGNvbG9yOiBDb2xvciB8IHN0cmluZywgbHVtaW5hbmNlVGhyZXNob2xkID0gMTg2ICk6IGJvb2xlYW4ge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbHVtaW5hbmNlVGhyZXNob2xkID49IDAgJiYgbHVtaW5hbmNlVGhyZXNob2xkIDw9IDI1NSxcclxuICAgICAgJ2ludmFsaWQgbHVtaW5hbmNlVGhyZXNob2xkJyApO1xyXG4gICAgcmV0dXJuICggQ29sb3IuZ2V0THVtaW5hbmNlKCBjb2xvciApIDwgbHVtaW5hbmNlVGhyZXNob2xkICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBjb2xvciBpcyAnbGlnaHQnLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGNvbG9yXHJcbiAgICogQHBhcmFtIFtsdW1pbmFuY2VUaHJlc2hvbGRdIC0gY29sb3JzIHdpdGggbHVtaW5hbmNlID49IHRoaXMgdmFsdWUgYXJlIGxpZ2h0LCByYW5nZSBbMCwyNTVdLCBkZWZhdWx0IDE4NlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgaXNMaWdodENvbG9yKCBjb2xvcjogQ29sb3IgfCBzdHJpbmcsIGx1bWluYW5jZVRocmVzaG9sZD86IG51bWJlciApOiBib29sZWFuIHtcclxuICAgIHJldHVybiAhQ29sb3IuaXNEYXJrQ29sb3IoIGNvbG9yLCBsdW1pbmFuY2VUaHJlc2hvbGQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBDb2xvciB0aGF0IGlzIGEgc2hhZGUgb2YgZ3JheS5cclxuICAgKiBAcGFyYW0gcmdiIC0gdXNlZCBmb3IgcmVkLCBibHVlLCBhbmQgZ3JlZW4gY29tcG9uZW50c1xyXG4gICAqIEBwYXJhbSBbYV0gLSBkZWZhdWx0cyB0byAxXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBncmF5Q29sb3IoIHJnYjogbnVtYmVyLCBhPzogbnVtYmVyICk6IENvbG9yIHtcclxuICAgIHJldHVybiBuZXcgQ29sb3IoIHJnYiwgcmdiLCByZ2IsIGEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIGEgQ1NTIGNvbG9yIHN0cmluZyBpbnRvIGEgc3RhbmRhcmQgZm9ybWF0LCBsb3dlci1jYXNpbmcgYW5kIGtleXdvcmQtbWF0Y2hpbmcgaXQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgcHJlcHJvY2Vzc0NTUyggY3NzU3RyaW5nOiBzdHJpbmcgKTogc3RyaW5nIHtcclxuICAgIGxldCBzdHIgPSBjc3NTdHJpbmcucmVwbGFjZSggLyAvZywgJycgKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgIC8vIHJlcGxhY2UgY29sb3JzIGJhc2VkIG9uIGtleXdvcmRzXHJcbiAgICBjb25zdCBrZXl3b3JkTWF0Y2ggPSBDb2xvci5jb2xvcktleXdvcmRzWyBzdHIgXTtcclxuICAgIGlmICgga2V5d29yZE1hdGNoICkge1xyXG4gICAgICBzdHIgPSBgIyR7a2V5d29yZE1hdGNofWA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHN0cjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgdGhlIHNwZWNpZmllZCBDU1Mgc3RyaW5nIGlzIGEgdmFsaWQgQ1NTIGNvbG9yIHN0cmluZ1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgaXNDU1NDb2xvclN0cmluZyggY3NzU3RyaW5nOiBzdHJpbmcgKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBzdHIgPSBDb2xvci5wcmVwcm9jZXNzQ1NTKCBjc3NTdHJpbmcgKTtcclxuXHJcbiAgICAvLyBydW4gdGhyb3VnaCB0aGUgYXZhaWxhYmxlIHRleHQgZm9ybWF0c1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgQ29sb3IuZm9ybWF0UGFyc2Vycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgcGFyc2VyID0gQ29sb3IuZm9ybWF0UGFyc2Vyc1sgaSBdO1xyXG5cclxuICAgICAgY29uc3QgbWF0Y2hlcyA9IHBhcnNlci5yZWdleHAuZXhlYyggc3RyICk7XHJcbiAgICAgIGlmICggbWF0Y2hlcyApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgZm9ybWF0UGFyc2VyczogRm9ybWF0UGFyc2VyW10gPSBbXHJcbiAgICB7XHJcbiAgICAgIC8vICd0cmFuc3BhcmVudCdcclxuICAgICAgcmVnZXhwOiAvXnRyYW5zcGFyZW50JC8sXHJcbiAgICAgIGFwcGx5OiAoIGNvbG9yOiBDb2xvciwgbWF0Y2hlczogUmVnRXhwRXhlY0FycmF5ICk6IHZvaWQgPT4ge1xyXG4gICAgICAgIGNvbG9yLnNldFJHQkEoIDAsIDAsIDAsIDAgKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gc2hvcnQgaGV4IGZvcm0sIGEgbGEgJyNmZmYnXHJcbiAgICAgIHJlZ2V4cDogL14jKFxcd3sxfSkoXFx3ezF9KShcXHd7MX0pJC8sXHJcbiAgICAgIGFwcGx5OiAoIGNvbG9yOiBDb2xvciwgbWF0Y2hlczogUmVnRXhwRXhlY0FycmF5ICk6IHZvaWQgPT4ge1xyXG4gICAgICAgIGNvbG9yLnNldFJHQkEoXHJcbiAgICAgICAgICBwYXJzZUludCggbWF0Y2hlc1sgMSBdICsgbWF0Y2hlc1sgMSBdLCAxNiApLFxyXG4gICAgICAgICAgcGFyc2VJbnQoIG1hdGNoZXNbIDIgXSArIG1hdGNoZXNbIDIgXSwgMTYgKSxcclxuICAgICAgICAgIHBhcnNlSW50KCBtYXRjaGVzWyAzIF0gKyBtYXRjaGVzWyAzIF0sIDE2ICksXHJcbiAgICAgICAgICAxICk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIGxvbmcgaGV4IGZvcm0sIGEgbGEgJyNmZmZmZmYnXHJcbiAgICAgIHJlZ2V4cDogL14jKFxcd3syfSkoXFx3ezJ9KShcXHd7Mn0pJC8sXHJcbiAgICAgIGFwcGx5OiAoIGNvbG9yOiBDb2xvciwgbWF0Y2hlczogUmVnRXhwRXhlY0FycmF5ICk6IHZvaWQgPT4ge1xyXG4gICAgICAgIGNvbG9yLnNldFJHQkEoXHJcbiAgICAgICAgICBwYXJzZUludCggbWF0Y2hlc1sgMSBdLCAxNiApLFxyXG4gICAgICAgICAgcGFyc2VJbnQoIG1hdGNoZXNbIDIgXSwgMTYgKSxcclxuICAgICAgICAgIHBhcnNlSW50KCBtYXRjaGVzWyAzIF0sIDE2ICksXHJcbiAgICAgICAgICAxICk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIHJnYiguLi4pXHJcbiAgICAgIHJlZ2V4cDogbmV3IFJlZ0V4cCggYF5yZ2JcXFxcKCR7cmdiTnVtYmVyfSwke3JnYk51bWJlcn0sJHtyZ2JOdW1iZXJ9XFxcXCkkYCApLFxyXG4gICAgICBhcHBseTogKCBjb2xvcjogQ29sb3IsIG1hdGNoZXM6IFJlZ0V4cEV4ZWNBcnJheSApOiB2b2lkID0+IHtcclxuICAgICAgICBjb2xvci5zZXRSR0JBKFxyXG4gICAgICAgICAgcGFyc2VSR0JOdW1iZXIoIG1hdGNoZXNbIDEgXSApLFxyXG4gICAgICAgICAgcGFyc2VSR0JOdW1iZXIoIG1hdGNoZXNbIDIgXSApLFxyXG4gICAgICAgICAgcGFyc2VSR0JOdW1iZXIoIG1hdGNoZXNbIDMgXSApLFxyXG4gICAgICAgICAgMSApO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyByZ2JhKC4uLilcclxuICAgICAgcmVnZXhwOiBuZXcgUmVnRXhwKCBgXnJnYmFcXFxcKCR7cmdiTnVtYmVyfSwke3JnYk51bWJlcn0sJHtyZ2JOdW1iZXJ9LCR7YU51bWJlcn1cXFxcKSRgICksXHJcbiAgICAgIGFwcGx5OiAoIGNvbG9yOiBDb2xvciwgbWF0Y2hlczogUmVnRXhwRXhlY0FycmF5ICk6IHZvaWQgPT4ge1xyXG4gICAgICAgIGNvbG9yLnNldFJHQkEoXHJcbiAgICAgICAgICBwYXJzZVJHQk51bWJlciggbWF0Y2hlc1sgMSBdICksXHJcbiAgICAgICAgICBwYXJzZVJHQk51bWJlciggbWF0Y2hlc1sgMiBdICksXHJcbiAgICAgICAgICBwYXJzZVJHQk51bWJlciggbWF0Y2hlc1sgMyBdICksXHJcbiAgICAgICAgICBOdW1iZXIoIG1hdGNoZXNbIDQgXSApICk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIGhzbCguLi4pXHJcbiAgICAgIHJlZ2V4cDogbmV3IFJlZ0V4cCggYF5oc2xcXFxcKCR7cmF3TnVtYmVyfSwke3Jhd051bWJlcn0lLCR7cmF3TnVtYmVyfSVcXFxcKSRgICksXHJcbiAgICAgIGFwcGx5OiAoIGNvbG9yOiBDb2xvciwgbWF0Y2hlczogUmVnRXhwRXhlY0FycmF5ICk6IHZvaWQgPT4ge1xyXG4gICAgICAgIGNvbG9yLnNldEhTTEEoXHJcbiAgICAgICAgICBOdW1iZXIoIG1hdGNoZXNbIDEgXSApLFxyXG4gICAgICAgICAgTnVtYmVyKCBtYXRjaGVzWyAyIF0gKSxcclxuICAgICAgICAgIE51bWJlciggbWF0Y2hlc1sgMyBdICksXHJcbiAgICAgICAgICAxICk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIGhzbGEoLi4uKVxyXG4gICAgICByZWdleHA6IG5ldyBSZWdFeHAoIGBeaHNsYVxcXFwoJHtyYXdOdW1iZXJ9LCR7cmF3TnVtYmVyfSUsJHtyYXdOdW1iZXJ9JSwke2FOdW1iZXJ9XFxcXCkkYCApLFxyXG4gICAgICBhcHBseTogKCBjb2xvcjogQ29sb3IsIG1hdGNoZXM6IFJlZ0V4cEV4ZWNBcnJheSApOiB2b2lkID0+IHtcclxuICAgICAgICBjb2xvci5zZXRIU0xBKFxyXG4gICAgICAgICAgTnVtYmVyKCBtYXRjaGVzWyAxIF0gKSxcclxuICAgICAgICAgIE51bWJlciggbWF0Y2hlc1sgMiBdICksXHJcbiAgICAgICAgICBOdW1iZXIoIG1hdGNoZXNbIDMgXSApLFxyXG4gICAgICAgICAgTnVtYmVyKCBtYXRjaGVzWyA0IF0gKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgXTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyBiYXNpY0NvbG9yS2V5d29yZHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICBhcXVhOiAnMDBmZmZmJyxcclxuICAgIGJsYWNrOiAnMDAwMDAwJyxcclxuICAgIGJsdWU6ICcwMDAwZmYnLFxyXG4gICAgZnVjaHNpYTogJ2ZmMDBmZicsXHJcbiAgICBncmF5OiAnODA4MDgwJyxcclxuICAgIGdyZWVuOiAnMDA4MDAwJyxcclxuICAgIGxpbWU6ICcwMGZmMDAnLFxyXG4gICAgbWFyb29uOiAnODAwMDAwJyxcclxuICAgIG5hdnk6ICcwMDAwODAnLFxyXG4gICAgb2xpdmU6ICc4MDgwMDAnLFxyXG4gICAgcHVycGxlOiAnODAwMDgwJyxcclxuICAgIHJlZDogJ2ZmMDAwMCcsXHJcbiAgICBzaWx2ZXI6ICdjMGMwYzAnLFxyXG4gICAgdGVhbDogJzAwODA4MCcsXHJcbiAgICB3aGl0ZTogJ2ZmZmZmZicsXHJcbiAgICB5ZWxsb3c6ICdmZmZmMDAnXHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyBjb2xvcktleXdvcmRzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgYWxpY2VibHVlOiAnZjBmOGZmJyxcclxuICAgIGFudGlxdWV3aGl0ZTogJ2ZhZWJkNycsXHJcbiAgICBhcXVhOiAnMDBmZmZmJyxcclxuICAgIGFxdWFtYXJpbmU6ICc3ZmZmZDQnLFxyXG4gICAgYXp1cmU6ICdmMGZmZmYnLFxyXG4gICAgYmVpZ2U6ICdmNWY1ZGMnLFxyXG4gICAgYmlzcXVlOiAnZmZlNGM0JyxcclxuICAgIGJsYWNrOiAnMDAwMDAwJyxcclxuICAgIGJsYW5jaGVkYWxtb25kOiAnZmZlYmNkJyxcclxuICAgIGJsdWU6ICcwMDAwZmYnLFxyXG4gICAgYmx1ZXZpb2xldDogJzhhMmJlMicsXHJcbiAgICBicm93bjogJ2E1MmEyYScsXHJcbiAgICBidXJseXdvb2Q6ICdkZWI4ODcnLFxyXG4gICAgY2FkZXRibHVlOiAnNWY5ZWEwJyxcclxuICAgIGNoYXJ0cmV1c2U6ICc3ZmZmMDAnLFxyXG4gICAgY2hvY29sYXRlOiAnZDI2OTFlJyxcclxuICAgIGNvcmFsOiAnZmY3ZjUwJyxcclxuICAgIGNvcm5mbG93ZXJibHVlOiAnNjQ5NWVkJyxcclxuICAgIGNvcm5zaWxrOiAnZmZmOGRjJyxcclxuICAgIGNyaW1zb246ICdkYzE0M2MnLFxyXG4gICAgY3lhbjogJzAwZmZmZicsXHJcbiAgICBkYXJrYmx1ZTogJzAwMDA4YicsXHJcbiAgICBkYXJrY3lhbjogJzAwOGI4YicsXHJcbiAgICBkYXJrZ29sZGVucm9kOiAnYjg4NjBiJyxcclxuICAgIGRhcmtncmF5OiAnYTlhOWE5JyxcclxuICAgIGRhcmtncmVlbjogJzAwNjQwMCcsXHJcbiAgICBkYXJrZ3JleTogJ2E5YTlhOScsXHJcbiAgICBkYXJra2hha2k6ICdiZGI3NmInLFxyXG4gICAgZGFya21hZ2VudGE6ICc4YjAwOGInLFxyXG4gICAgZGFya29saXZlZ3JlZW46ICc1NTZiMmYnLFxyXG4gICAgZGFya29yYW5nZTogJ2ZmOGMwMCcsXHJcbiAgICBkYXJrb3JjaGlkOiAnOTkzMmNjJyxcclxuICAgIGRhcmtyZWQ6ICc4YjAwMDAnLFxyXG4gICAgZGFya3NhbG1vbjogJ2U5OTY3YScsXHJcbiAgICBkYXJrc2VhZ3JlZW46ICc4ZmJjOGYnLFxyXG4gICAgZGFya3NsYXRlYmx1ZTogJzQ4M2Q4YicsXHJcbiAgICBkYXJrc2xhdGVncmF5OiAnMmY0ZjRmJyxcclxuICAgIGRhcmtzbGF0ZWdyZXk6ICcyZjRmNGYnLFxyXG4gICAgZGFya3R1cnF1b2lzZTogJzAwY2VkMScsXHJcbiAgICBkYXJrdmlvbGV0OiAnOTQwMGQzJyxcclxuICAgIGRlZXBwaW5rOiAnZmYxNDkzJyxcclxuICAgIGRlZXBza3libHVlOiAnMDBiZmZmJyxcclxuICAgIGRpbWdyYXk6ICc2OTY5NjknLFxyXG4gICAgZGltZ3JleTogJzY5Njk2OScsXHJcbiAgICBkb2RnZXJibHVlOiAnMWU5MGZmJyxcclxuICAgIGZpcmVicmljazogJ2IyMjIyMicsXHJcbiAgICBmbG9yYWx3aGl0ZTogJ2ZmZmFmMCcsXHJcbiAgICBmb3Jlc3RncmVlbjogJzIyOGIyMicsXHJcbiAgICBmdWNoc2lhOiAnZmYwMGZmJyxcclxuICAgIGdhaW5zYm9ybzogJ2RjZGNkYycsXHJcbiAgICBnaG9zdHdoaXRlOiAnZjhmOGZmJyxcclxuICAgIGdvbGQ6ICdmZmQ3MDAnLFxyXG4gICAgZ29sZGVucm9kOiAnZGFhNTIwJyxcclxuICAgIGdyYXk6ICc4MDgwODAnLFxyXG4gICAgZ3JlZW46ICcwMDgwMDAnLFxyXG4gICAgZ3JlZW55ZWxsb3c6ICdhZGZmMmYnLFxyXG4gICAgZ3JleTogJzgwODA4MCcsXHJcbiAgICBob25leWRldzogJ2YwZmZmMCcsXHJcbiAgICBob3RwaW5rOiAnZmY2OWI0JyxcclxuICAgIGluZGlhbnJlZDogJ2NkNWM1YycsXHJcbiAgICBpbmRpZ286ICc0YjAwODInLFxyXG4gICAgaXZvcnk6ICdmZmZmZjAnLFxyXG4gICAga2hha2k6ICdmMGU2OGMnLFxyXG4gICAgbGF2ZW5kZXI6ICdlNmU2ZmEnLFxyXG4gICAgbGF2ZW5kZXJibHVzaDogJ2ZmZjBmNScsXHJcbiAgICBsYXduZ3JlZW46ICc3Y2ZjMDAnLFxyXG4gICAgbGVtb25jaGlmZm9uOiAnZmZmYWNkJyxcclxuICAgIGxpZ2h0Ymx1ZTogJ2FkZDhlNicsXHJcbiAgICBsaWdodGNvcmFsOiAnZjA4MDgwJyxcclxuICAgIGxpZ2h0Y3lhbjogJ2UwZmZmZicsXHJcbiAgICBsaWdodGdvbGRlbnJvZHllbGxvdzogJ2ZhZmFkMicsXHJcbiAgICBsaWdodGdyYXk6ICdkM2QzZDMnLFxyXG4gICAgbGlnaHRncmVlbjogJzkwZWU5MCcsXHJcbiAgICBsaWdodGdyZXk6ICdkM2QzZDMnLFxyXG4gICAgbGlnaHRwaW5rOiAnZmZiNmMxJyxcclxuICAgIGxpZ2h0c2FsbW9uOiAnZmZhMDdhJyxcclxuICAgIGxpZ2h0c2VhZ3JlZW46ICcyMGIyYWEnLFxyXG4gICAgbGlnaHRza3libHVlOiAnODdjZWZhJyxcclxuICAgIGxpZ2h0c2xhdGVncmF5OiAnNzc4ODk5JyxcclxuICAgIGxpZ2h0c2xhdGVncmV5OiAnNzc4ODk5JyxcclxuICAgIGxpZ2h0c3RlZWxibHVlOiAnYjBjNGRlJyxcclxuICAgIGxpZ2h0eWVsbG93OiAnZmZmZmUwJyxcclxuICAgIGxpbWU6ICcwMGZmMDAnLFxyXG4gICAgbGltZWdyZWVuOiAnMzJjZDMyJyxcclxuICAgIGxpbmVuOiAnZmFmMGU2JyxcclxuICAgIG1hZ2VudGE6ICdmZjAwZmYnLFxyXG4gICAgbWFyb29uOiAnODAwMDAwJyxcclxuICAgIG1lZGl1bWFxdWFtYXJpbmU6ICc2NmNkYWEnLFxyXG4gICAgbWVkaXVtYmx1ZTogJzAwMDBjZCcsXHJcbiAgICBtZWRpdW1vcmNoaWQ6ICdiYTU1ZDMnLFxyXG4gICAgbWVkaXVtcHVycGxlOiAnOTM3MGRiJyxcclxuICAgIG1lZGl1bXNlYWdyZWVuOiAnM2NiMzcxJyxcclxuICAgIG1lZGl1bXNsYXRlYmx1ZTogJzdiNjhlZScsXHJcbiAgICBtZWRpdW1zcHJpbmdncmVlbjogJzAwZmE5YScsXHJcbiAgICBtZWRpdW10dXJxdW9pc2U6ICc0OGQxY2MnLFxyXG4gICAgbWVkaXVtdmlvbGV0cmVkOiAnYzcxNTg1JyxcclxuICAgIG1pZG5pZ2h0Ymx1ZTogJzE5MTk3MCcsXHJcbiAgICBtaW50Y3JlYW06ICdmNWZmZmEnLFxyXG4gICAgbWlzdHlyb3NlOiAnZmZlNGUxJyxcclxuICAgIG1vY2Nhc2luOiAnZmZlNGI1JyxcclxuICAgIG5hdmFqb3doaXRlOiAnZmZkZWFkJyxcclxuICAgIG5hdnk6ICcwMDAwODAnLFxyXG4gICAgb2xkbGFjZTogJ2ZkZjVlNicsXHJcbiAgICBvbGl2ZTogJzgwODAwMCcsXHJcbiAgICBvbGl2ZWRyYWI6ICc2YjhlMjMnLFxyXG4gICAgb3JhbmdlOiAnZmZhNTAwJyxcclxuICAgIG9yYW5nZXJlZDogJ2ZmNDUwMCcsXHJcbiAgICBvcmNoaWQ6ICdkYTcwZDYnLFxyXG4gICAgcGFsZWdvbGRlbnJvZDogJ2VlZThhYScsXHJcbiAgICBwYWxlZ3JlZW46ICc5OGZiOTgnLFxyXG4gICAgcGFsZXR1cnF1b2lzZTogJ2FmZWVlZScsXHJcbiAgICBwYWxldmlvbGV0cmVkOiAnZGI3MDkzJyxcclxuICAgIHBhcGF5YXdoaXA6ICdmZmVmZDUnLFxyXG4gICAgcGVhY2hwdWZmOiAnZmZkYWI5JyxcclxuICAgIHBlcnU6ICdjZDg1M2YnLFxyXG4gICAgcGluazogJ2ZmYzBjYicsXHJcbiAgICBwbHVtOiAnZGRhMGRkJyxcclxuICAgIHBvd2RlcmJsdWU6ICdiMGUwZTYnLFxyXG4gICAgcHVycGxlOiAnODAwMDgwJyxcclxuICAgIHJlZDogJ2ZmMDAwMCcsXHJcbiAgICByb3N5YnJvd246ICdiYzhmOGYnLFxyXG4gICAgcm95YWxibHVlOiAnNDE2OWUxJyxcclxuICAgIHNhZGRsZWJyb3duOiAnOGI0NTEzJyxcclxuICAgIHNhbG1vbjogJ2ZhODA3MicsXHJcbiAgICBzYW5keWJyb3duOiAnZjRhNDYwJyxcclxuICAgIHNlYWdyZWVuOiAnMmU4YjU3JyxcclxuICAgIHNlYXNoZWxsOiAnZmZmNWVlJyxcclxuICAgIHNpZW5uYTogJ2EwNTIyZCcsXHJcbiAgICBzaWx2ZXI6ICdjMGMwYzAnLFxyXG4gICAgc2t5Ymx1ZTogJzg3Y2VlYicsXHJcbiAgICBzbGF0ZWJsdWU6ICc2YTVhY2QnLFxyXG4gICAgc2xhdGVncmF5OiAnNzA4MDkwJyxcclxuICAgIHNsYXRlZ3JleTogJzcwODA5MCcsXHJcbiAgICBzbm93OiAnZmZmYWZhJyxcclxuICAgIHNwcmluZ2dyZWVuOiAnMDBmZjdmJyxcclxuICAgIHN0ZWVsYmx1ZTogJzQ2ODJiNCcsXHJcbiAgICB0YW46ICdkMmI0OGMnLFxyXG4gICAgdGVhbDogJzAwODA4MCcsXHJcbiAgICB0aGlzdGxlOiAnZDhiZmQ4JyxcclxuICAgIHRvbWF0bzogJ2ZmNjM0NycsXHJcbiAgICB0dXJxdW9pc2U6ICc0MGUwZDAnLFxyXG4gICAgdmlvbGV0OiAnZWU4MmVlJyxcclxuICAgIHdoZWF0OiAnZjVkZWIzJyxcclxuICAgIHdoaXRlOiAnZmZmZmZmJyxcclxuICAgIHdoaXRlc21va2U6ICdmNWY1ZjUnLFxyXG4gICAgeWVsbG93OiAnZmZmZjAwJyxcclxuICAgIHllbGxvd2dyZWVuOiAnOWFjZDMyJ1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgQkxBQ0s6IENvbG9yOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSB1cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcclxuICBwdWJsaWMgc3RhdGljIEJMVUU6IENvbG9yOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSB1cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcclxuICBwdWJsaWMgc3RhdGljIENZQU46IENvbG9yOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSB1cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcclxuICBwdWJsaWMgc3RhdGljIERBUktfR1JBWTogQ29sb3I7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHVwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxyXG4gIHB1YmxpYyBzdGF0aWMgR1JBWTogQ29sb3I7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHVwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxyXG4gIHB1YmxpYyBzdGF0aWMgR1JFRU46IENvbG9yOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSB1cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcclxuICBwdWJsaWMgc3RhdGljIExJR0hUX0dSQVk6IENvbG9yOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSB1cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcclxuICBwdWJsaWMgc3RhdGljIE1BR0VOVEE6IENvbG9yOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSB1cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcclxuICBwdWJsaWMgc3RhdGljIE9SQU5HRTogQ29sb3I7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHVwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxyXG4gIHB1YmxpYyBzdGF0aWMgUElOSzogQ29sb3I7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHVwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxyXG4gIHB1YmxpYyBzdGF0aWMgUkVEOiBDb2xvcjsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgdXBwZXJjYXNlLXN0YXRpY3Mtc2hvdWxkLWJlLXJlYWRvbmx5XHJcbiAgcHVibGljIHN0YXRpYyBXSElURTogQ29sb3I7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHVwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxyXG4gIHB1YmxpYyBzdGF0aWMgWUVMTE9XOiBDb2xvcjsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgdXBwZXJjYXNlLXN0YXRpY3Mtc2hvdWxkLWJlLXJlYWRvbmx5XHJcbiAgcHVibGljIHN0YXRpYyBUUkFOU1BBUkVOVDogQ29sb3I7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHVwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxyXG5cclxuICBwdWJsaWMgc3RhdGljIGJsYWNrOiBDb2xvcjtcclxuICBwdWJsaWMgc3RhdGljIGJsdWU6IENvbG9yO1xyXG4gIHB1YmxpYyBzdGF0aWMgY3lhbjogQ29sb3I7XHJcbiAgcHVibGljIHN0YXRpYyBkYXJrR3JheTogQ29sb3I7XHJcbiAgcHVibGljIHN0YXRpYyBncmF5OiBDb2xvcjtcclxuICBwdWJsaWMgc3RhdGljIGdyZWVuOiBDb2xvcjtcclxuICBwdWJsaWMgc3RhdGljIGxpZ2h0R3JheTogQ29sb3I7XHJcbiAgcHVibGljIHN0YXRpYyBtYWdlbnRhOiBDb2xvcjtcclxuICBwdWJsaWMgc3RhdGljIG9yYW5nZTogQ29sb3I7XHJcbiAgcHVibGljIHN0YXRpYyBwaW5rOiBDb2xvcjtcclxuICBwdWJsaWMgc3RhdGljIHJlZDogQ29sb3I7XHJcbiAgcHVibGljIHN0YXRpYyB3aGl0ZTogQ29sb3I7XHJcbiAgcHVibGljIHN0YXRpYyB5ZWxsb3c6IENvbG9yO1xyXG4gIHB1YmxpYyBzdGF0aWMgdHJhbnNwYXJlbnQ6IENvbG9yO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIENvbG9ySU86IElPVHlwZTtcclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0NvbG9yJywgQ29sb3IgKTtcclxuXHJcbi8vIEphdmEgY29tcGF0aWJpbGl0eVxyXG5Db2xvci5CTEFDSyA9IENvbG9yLmJsYWNrID0gbmV3IENvbG9yKCAwLCAwLCAwICkuc2V0SW1tdXRhYmxlKCk7XHJcbkNvbG9yLkJMVUUgPSBDb2xvci5ibHVlID0gbmV3IENvbG9yKCAwLCAwLCAyNTUgKS5zZXRJbW11dGFibGUoKTtcclxuQ29sb3IuQ1lBTiA9IENvbG9yLmN5YW4gPSBuZXcgQ29sb3IoIDAsIDI1NSwgMjU1ICkuc2V0SW1tdXRhYmxlKCk7XHJcbkNvbG9yLkRBUktfR1JBWSA9IENvbG9yLmRhcmtHcmF5ID0gbmV3IENvbG9yKCA2NCwgNjQsIDY0ICkuc2V0SW1tdXRhYmxlKCk7XHJcbkNvbG9yLkdSQVkgPSBDb2xvci5ncmF5ID0gbmV3IENvbG9yKCAxMjgsIDEyOCwgMTI4ICkuc2V0SW1tdXRhYmxlKCk7XHJcbkNvbG9yLkdSRUVOID0gQ29sb3IuZ3JlZW4gPSBuZXcgQ29sb3IoIDAsIDI1NSwgMCApLnNldEltbXV0YWJsZSgpO1xyXG5Db2xvci5MSUdIVF9HUkFZID0gQ29sb3IubGlnaHRHcmF5ID0gbmV3IENvbG9yKCAxOTIsIDE5MiwgMTkyICkuc2V0SW1tdXRhYmxlKCk7XHJcbkNvbG9yLk1BR0VOVEEgPSBDb2xvci5tYWdlbnRhID0gbmV3IENvbG9yKCAyNTUsIDAsIDI1NSApLnNldEltbXV0YWJsZSgpO1xyXG5Db2xvci5PUkFOR0UgPSBDb2xvci5vcmFuZ2UgPSBuZXcgQ29sb3IoIDI1NSwgMjAwLCAwICkuc2V0SW1tdXRhYmxlKCk7XHJcbkNvbG9yLlBJTksgPSBDb2xvci5waW5rID0gbmV3IENvbG9yKCAyNTUsIDE3NSwgMTc1ICkuc2V0SW1tdXRhYmxlKCk7XHJcbkNvbG9yLlJFRCA9IENvbG9yLnJlZCA9IG5ldyBDb2xvciggMjU1LCAwLCAwICkuc2V0SW1tdXRhYmxlKCk7XHJcbkNvbG9yLldISVRFID0gQ29sb3Iud2hpdGUgPSBuZXcgQ29sb3IoIDI1NSwgMjU1LCAyNTUgKS5zZXRJbW11dGFibGUoKTtcclxuQ29sb3IuWUVMTE9XID0gQ29sb3IueWVsbG93ID0gbmV3IENvbG9yKCAyNTUsIDI1NSwgMCApLnNldEltbXV0YWJsZSgpO1xyXG5cclxuLy8gSGVscGVyIGZvciB0cmFuc3BhcmVudCBjb2xvcnNcclxuQ29sb3IuVFJBTlNQQVJFTlQgPSBDb2xvci50cmFuc3BhcmVudCA9IG5ldyBDb2xvciggMCwgMCwgMCwgMCApLnNldEltbXV0YWJsZSgpO1xyXG5cclxuY29uc3Qgc2NyYXRjaENvbG9yID0gbmV3IENvbG9yKCAnYmx1ZScgKTtcclxuXHJcbmV4cG9ydCB0eXBlIENvbG9yU3RhdGUgPSB7XHJcbiAgcjogbnVtYmVyO1xyXG4gIGc6IG51bWJlcjtcclxuICBiOiBudW1iZXI7XHJcbiAgYTogbnVtYmVyO1xyXG59O1xyXG5cclxuQ29sb3IuQ29sb3JJTyA9IG5ldyBJT1R5cGUoICdDb2xvcklPJywge1xyXG4gIHZhbHVlVHlwZTogQ29sb3IsXHJcbiAgZG9jdW1lbnRhdGlvbjogJ0EgY29sb3IsIHdpdGggcmdiYScsXHJcbiAgdG9TdGF0ZU9iamVjdDogKCBjb2xvcjogQ29sb3IgKSA9PiBjb2xvci50b1N0YXRlT2JqZWN0KCksXHJcbiAgZnJvbVN0YXRlT2JqZWN0OiAoIHN0YXRlT2JqZWN0OiB7IHI6IG51bWJlcjsgZzogbnVtYmVyOyBiOiBudW1iZXI7IGE6IG51bWJlciB9ICkgPT4gbmV3IENvbG9yKCBzdGF0ZU9iamVjdC5yLCBzdGF0ZU9iamVjdC5nLCBzdGF0ZU9iamVjdC5iLCBzdGF0ZU9iamVjdC5hICksXHJcbiAgc3RhdGVTY2hlbWE6IHtcclxuICAgIHI6IE51bWJlcklPLFxyXG4gICAgZzogTnVtYmVySU8sXHJcbiAgICBiOiBOdW1iZXJJTyxcclxuICAgIGE6IE51bWJlcklPXHJcbiAgfVxyXG59ICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLGdCQUFnQixNQUFNLHNDQUFzQztBQUNuRSxPQUFPQyxXQUFXLE1BQU0saUNBQWlDO0FBQ3pELE9BQU9DLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsTUFBTSxNQUFNLG9DQUFvQztBQUN2RCxPQUFPQyxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELFNBQWlCQyxPQUFPLFFBQVEsZUFBZTtBQUcvQztBQUNBLE1BQU1DLEtBQUssR0FBR0osS0FBSyxDQUFDSSxLQUFLO0FBQ3pCLE1BQU1DLE1BQU0sR0FBR0wsS0FBSyxDQUFDSyxNQUFNO0FBTzNCO0FBQ0EsTUFBTUMsU0FBUyxHQUFHLGdCQUFnQixDQUFDLENBQUM7QUFDcEMsTUFBTUMsT0FBTyxHQUFHLG9CQUFv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