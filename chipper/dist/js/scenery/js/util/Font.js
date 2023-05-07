// Copyright 2013-2023, University of Colorado Boulder

/**
 * Immutable font object.
 *
 * Examples:
 * new phet.scenery.Font().font                      // "10px sans-serif" (the default)
 * new phet.scenery.Font( { family: 'serif' } ).font // "10px serif"
 * new phet.scenery.Font( { weight: 'bold' } ).font  // "bold 10px sans-serif"
 * new phet.scenery.Font( { size: 16 } ).font        // "16px sans-serif"
 * var font = new phet.scenery.Font( {
 *   family: '"Times New Roman", serif',
 *   style: 'italic',
 *   lineHeight: 10
 * } );
 * font.font;                                   // "italic 10px/10 'Times New Roman', serif"
 * font.family;                                 // "'Times New Roman', serif"
 * font.weight;                                 // 400 (the default)
 *
 * Useful specs:
 * http://www.w3.org/TR/css3-fonts/
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import { scenery } from '../imports.js';

// Valid values for the 'style' property of Font
const VALID_STYLES = ['normal', 'italic', 'oblique'];

// Valid values for the 'variant' property of Font
const VALID_VARIANTS = ['normal', 'small-caps'];

// Valid values for the 'weight' property of Font
const VALID_WEIGHTS = ['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

// Valid values for the 'stretch' property of Font
const VALID_STRETCHES = ['normal', 'ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded'];
export default class Font extends PhetioObject {
  // See https://www.w3.org/TR/css-fonts-3/#propdef-font-style

  // See https://www.w3.org/TR/css-fonts-3/#font-variant-css21-values

  // See https://www.w3.org/TR/css-fonts-3/#propdef-font-weight

  // See https://www.w3.org/TR/css-fonts-3/#propdef-font-stretch

  // See https://www.w3.org/TR/css-fonts-3/#propdef-font-size

  // See https://www.w3.org/TR/CSS2/visudet.html#propdef-line-height

  // See https://www.w3.org/TR/css-fonts-3/#propdef-font-family

  // Shorthand font property

  constructor(providedOptions) {
    assert && assert(providedOptions === undefined || typeof providedOptions === 'object' && Object.getPrototypeOf(providedOptions) === Object.prototype, 'options, if provided, should be a raw object');
    const options = optionize()({
      // {string} - 'normal', 'italic' or 'oblique'
      style: 'normal',
      // {string} - 'normal' or 'small-caps'
      variant: 'normal',
      // {number|string} - 'normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700',
      // '800', '900', or a number that when cast to a string will be one of the strings above.
      weight: 'normal',
      // {string} - 'normal', 'ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'semi-expanded',
      // 'expanded', 'extra-expanded' or 'ultra-expanded'
      stretch: 'normal',
      // {number|string} - A valid CSS font-size string, or a number representing a quantity of 'px'.
      size: '10px',
      // {string} - A valid CSS line-height, typically 'normal', a number, a CSS length (e.g. '15px'), or a percentage
      // of the normal height.
      lineHeight: 'normal',
      // {string} - A comma-separated list of families, which can include generic families (preferably at the end) such
      // as 'serif', 'sans-serif', 'cursive', 'fantasy' and 'monospace'. If there is any question about escaping (such
      // as spaces in a font name), the family should be surrounded by double quotes.
      family: 'sans-serif',
      phetioType: Font.FontIO,
      tandem: Tandem.OPTIONAL
    }, providedOptions);
    assert && assert(typeof options.weight === 'string' || typeof options.weight === 'number', 'Font weight should be specified as a string or number');
    assert && assert(typeof options.size === 'string' || typeof options.size === 'number', 'Font size should be specified as a string or number');
    super(options);
    this._style = options.style;
    this._variant = options.variant;
    this._weight = `${options.weight}`; // cast to string, we'll double check it later
    this._stretch = options.stretch;
    this._size = Font.castSize(options.size);
    this._lineHeight = options.lineHeight;
    this._family = options.family;

    // sanity checks to prevent errors in interpretation or in the font shorthand usage
    assert && assert(typeof this._style === 'string' && _.includes(VALID_STYLES, this._style), 'Font style must be one of "normal", "italic", or "oblique"');
    assert && assert(typeof this._variant === 'string' && _.includes(VALID_VARIANTS, this._variant), 'Font variant must be "normal" or "small-caps"');
    assert && assert(typeof this._weight === 'string' && _.includes(VALID_WEIGHTS, this._weight), 'Font weight must be one of "normal", "bold", "bolder", "lighter", "100", "200", "300", "400", "500", "600", "700", "800", or "900"');
    assert && assert(typeof this._stretch === 'string' && _.includes(VALID_STRETCHES, this._stretch), 'Font stretch must be one of "normal", "ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "semi-expanded", "expanded", "extra-expanded", or "ultra-expanded"');
    assert && assert(typeof this._size === 'string' && !_.includes(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], this._size[this._size.length - 1]), 'Font size must be either passed as a number (not a string, interpreted as px), or must contain a suffix for percentage, absolute or relative units, or an explicit size constant');
    assert && assert(typeof this._lineHeight === 'string');
    assert && assert(typeof this._family === 'string');

    // Initialize the shorthand font property
    this._font = this.computeShorthand();
  }

  /**
   * Returns this font's CSS shorthand, which includes all of the font's information reduced into a single string.
   *
   * This can be used for CSS as the 'font' attribute, or is needed to set Canvas fonts.
   *
   * https://www.w3.org/TR/css-fonts-3/#propdef-font contains detailed information on how this is formatted.
   */
  getFont() {
    return this._font;
  }
  get font() {
    return this.getFont();
  }

  /**
   * Returns this font's style. See the constructor for more details on valid values.
   */
  getStyle() {
    return this._style;
  }
  get style() {
    return this.getStyle();
  }

  /**
   * Returns this font's variant. See the constructor for more details on valid values.
   */
  getVariant() {
    return this._variant;
  }
  get variant() {
    return this.getVariant();
  }

  /**
   * Returns this font's weight. See the constructor for more details on valid values.
   *
   * NOTE: If a numeric weight was passed in, it has been cast to a string, and a string will be returned here.
   */
  getWeight() {
    return this._weight;
  }
  get weight() {
    return this.getWeight();
  }

  /**
   * Returns this font's stretch. See the constructor for more details on valid values.
   */
  getStretch() {
    return this._stretch;
  }
  get stretch() {
    return this.getStretch();
  }

  /**
   * Returns this font's size. See the constructor for more details on valid values.
   *
   * NOTE: If a numeric size was passed in, it has been cast to a string, and a string will be returned here.
   */
  getSize() {
    return this._size;
  }
  get size() {
    return this.getSize();
  }

  /**
   * Returns an approximate value of this font's size in px.
   */
  getNumericSize() {
    const pxMatch = this._size.match(/^(\d+)px$/);
    if (pxMatch) {
      return Number(pxMatch[1]);
    }
    const ptMatch = this._size.match(/^(\d+)pt$/);
    if (ptMatch) {
      return 0.75 * Number(ptMatch[1]);
    }
    const emMatch = this._size.match(/^(\d+)em$/);
    if (emMatch) {
      return Number(emMatch[1]) / 16;
    }
    return 12; // a guess?
  }

  get numericSize() {
    return this.getNumericSize();
  }

  /**
   * Returns this font's line-height. See the constructor for more details on valid values.
   */
  getLineHeight() {
    return this._lineHeight;
  }
  get lineHeight() {
    return this.getLineHeight();
  }

  /**
   * Returns this font's family. See the constructor for more details on valid values.
   */
  getFamily() {
    return this._family;
  }
  get family() {
    return this.getFamily();
  }

  /**
   * Returns a new Font object, which is a copy of this object. If options are provided, they override the current
   * values in this object.
   */
  copy(options) {
    // TODO: get merge working in typescript
    return new Font(combineOptions({
      style: this._style,
      variant: this._variant,
      weight: this._weight,
      stretch: this._stretch,
      size: this._size,
      lineHeight: this._lineHeight,
      family: this._family
    }, options));
  }

  /**
   * Computes the combined CSS shorthand font string.
   *
   * https://www.w3.org/TR/css-fonts-3/#propdef-font contains details about the format.
   */
  computeShorthand() {
    let ret = '';
    if (this._style !== 'normal') {
      ret += `${this._style} `;
    }
    if (this._variant !== 'normal') {
      ret += `${this._variant} `;
    }
    if (this._weight !== 'normal') {
      ret += `${this._weight} `;
    }
    if (this._stretch !== 'normal') {
      ret += `${this._stretch} `;
    }
    ret += this._size;
    if (this._lineHeight !== 'normal') {
      ret += `/${this._lineHeight}`;
    }
    ret += ` ${this._family}`;
    return ret;
  }

  /**
   * Returns this font's CSS shorthand, which includes all of the font's information reduced into a single string.
   *
   * NOTE: This is an alias of getFont().
   *
   * This can be used for CSS as the 'font' attribute, or is needed to set Canvas fonts.
   *
   * https://www.w3.org/TR/css-fonts-3/#propdef-font contains detailed information on how this is formatted.
   */
  toCSS() {
    return this.getFont();
  }

  /**
   * Converts a generic size to a specific CSS pixel string, assuming 'px' for numbers.
   *
   * @param size - If it's a number, 'px' will be appended
   */
  static castSize(size) {
    if (typeof size === 'number') {
      return `${size}px`; // add the pixels suffix by default for numbers
    } else {
      return size; // assume that it's a valid to-spec string
    }
  }

  static isFontStyle(style) {
    return VALID_STYLES.includes(style);
  }
  static isFontVariant(variant) {
    return VALID_VARIANTS.includes(variant);
  }
  static isFontWeight(weight) {
    return VALID_WEIGHTS.includes(weight);
  }
  static isFontStretch(stretch) {
    return VALID_STRETCHES.includes(stretch);
  }

  /**
   * Parses a CSS-compliant "font" shorthand string into a Font object.
   *
   * Font strings should be a valid CSS3 font declaration value (see http://www.w3.org/TR/css3-fonts/) which consists
   * of the following pattern:
   *   [ [ <‘font-style’> || <font-variant-css21> || <‘font-weight’> || <‘font-stretch’> ]? <‘font-size’>
   *   [ / <‘line-height’> ]? <‘font-family’> ]
   */
  static fromCSS(cssString) {
    // parse a somewhat proper CSS3 form (not guaranteed to handle it precisely the same as browsers yet)

    const options = {};

    // split based on whitespace allowed by CSS spec (more restrictive than regular regexp whitespace)
    const tokens = _.filter(cssString.split(/[\x09\x0A\x0C\x0D\x20]/), token => token.length > 0); // eslint-disable-line no-control-regex

    // pull tokens out until we reach something that doesn't match. that must be the font size (according to spec)
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token === 'normal') {
        // nothing has to be done, everything already normal as default
      } else if (Font.isFontStyle(token)) {
        assert && assert(options.style === undefined, `Style cannot be applied twice. Already set to "${options.style}", attempt to replace with "${token}"`);
        options.style = token;
      } else if (Font.isFontVariant(token)) {
        assert && assert(options.variant === undefined, `Variant cannot be applied twice. Already set to "${options.variant}", attempt to replace with "${token}"`);
        options.variant = token;
      } else if (Font.isFontWeight(token)) {
        assert && assert(options.weight === undefined, `Weight cannot be applied twice. Already set to "${options.weight}", attempt to replace with "${token}"`);
        options.weight = token;
      } else if (Font.isFontStretch(token)) {
        assert && assert(options.stretch === undefined, `Stretch cannot be applied twice. Already set to "${options.stretch}", attempt to replace with "${token}"`);
        options.stretch = token;
      } else {
        // not a style/variant/weight/stretch, must be a font size, possibly with an included line-height
        const subtokens = token.split(/\//); // extract font size from any line-height
        options.size = subtokens[0];
        if (subtokens[1]) {
          options.lineHeight = subtokens[1];
        }
        // all future tokens are guaranteed to be part of the font-family if it is given according to spec
        options.family = tokens.slice(i + 1).join(' ');
        break;
      }
    }
    return new Font(options);
  }
  // {Font} - Default Font object (since they are immutable).
  static DEFAULT = new Font();
}
scenery.register('Font', Font);
Font.FontIO = new IOType('FontIO', {
  valueType: Font,
  documentation: 'Font handling for text drawing. Options:' + '<ul>' + '<li><strong>style:</strong> normal      &mdash; normal | italic | oblique </li>' + '<li><strong>variant:</strong> normal    &mdash; normal | small-caps </li>' + '<li><strong>weight:</strong> normal     &mdash; normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 </li>' + '<li><strong>stretch:</strong> normal    &mdash; normal | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded </li>' + '<li><strong>size:</strong> 10px         &mdash; absolute-size | relative-size | length | percentage -- unitless number interpreted as px. absolute suffixes: cm, mm, in, pt, pc, px. relative suffixes: em, ex, ch, rem, vw, vh, vmin, vmax. </li>' + '<li><strong>lineHeight:</strong> normal &mdash; normal | number | length | percentage -- NOTE: Canvas spec forces line-height to normal </li>' + '<li><strong>family:</strong> sans-serif &mdash; comma-separated list of families, including generic families (serif, sans-serif, cursive, fantasy, monospace). ideally escape with double-quotes</li>' + '</ul>',
  toStateObject: font => ({
    style: font.getStyle(),
    variant: font.getVariant(),
    weight: font.getWeight(),
    stretch: font.getStretch(),
    size: font.getSize(),
    lineHeight: font.getLineHeight(),
    family: font.getFamily()
  }),
  fromStateObject(stateObject) {
    return new Font(stateObject);
  },
  stateSchema: {
    style: StringIO,
    variant: StringIO,
    weight: StringIO,
    stretch: StringIO,
    size: StringIO,
    lineHeight: StringIO,
    family: StringIO
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsIklPVHlwZSIsIlN0cmluZ0lPIiwic2NlbmVyeSIsIlZBTElEX1NUWUxFUyIsIlZBTElEX1ZBUklBTlRTIiwiVkFMSURfV0VJR0hUUyIsIlZBTElEX1NUUkVUQ0hFUyIsIkZvbnQiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsImFzc2VydCIsInVuZGVmaW5lZCIsIk9iamVjdCIsImdldFByb3RvdHlwZU9mIiwicHJvdG90eXBlIiwib3B0aW9ucyIsInN0eWxlIiwidmFyaWFudCIsIndlaWdodCIsInN0cmV0Y2giLCJzaXplIiwibGluZUhlaWdodCIsImZhbWlseSIsInBoZXRpb1R5cGUiLCJGb250SU8iLCJ0YW5kZW0iLCJPUFRJT05BTCIsIl9zdHlsZSIsIl92YXJpYW50IiwiX3dlaWdodCIsIl9zdHJldGNoIiwiX3NpemUiLCJjYXN0U2l6ZSIsIl9saW5lSGVpZ2h0IiwiX2ZhbWlseSIsIl8iLCJpbmNsdWRlcyIsImxlbmd0aCIsIl9mb250IiwiY29tcHV0ZVNob3J0aGFuZCIsImdldEZvbnQiLCJmb250IiwiZ2V0U3R5bGUiLCJnZXRWYXJpYW50IiwiZ2V0V2VpZ2h0IiwiZ2V0U3RyZXRjaCIsImdldFNpemUiLCJnZXROdW1lcmljU2l6ZSIsInB4TWF0Y2giLCJtYXRjaCIsIk51bWJlciIsInB0TWF0Y2giLCJlbU1hdGNoIiwibnVtZXJpY1NpemUiLCJnZXRMaW5lSGVpZ2h0IiwiZ2V0RmFtaWx5IiwiY29weSIsInJldCIsInRvQ1NTIiwiaXNGb250U3R5bGUiLCJpc0ZvbnRWYXJpYW50IiwiaXNGb250V2VpZ2h0IiwiaXNGb250U3RyZXRjaCIsImZyb21DU1MiLCJjc3NTdHJpbmciLCJ0b2tlbnMiLCJmaWx0ZXIiLCJzcGxpdCIsInRva2VuIiwiaSIsInN1YnRva2VucyIsInNsaWNlIiwiam9pbiIsIkRFRkFVTFQiLCJyZWdpc3RlciIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJ0b1N0YXRlT2JqZWN0IiwiZnJvbVN0YXRlT2JqZWN0Iiwic3RhdGVPYmplY3QiLCJzdGF0ZVNjaGVtYSJdLCJzb3VyY2VzIjpbIkZvbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSW1tdXRhYmxlIGZvbnQgb2JqZWN0LlxyXG4gKlxyXG4gKiBFeGFtcGxlczpcclxuICogbmV3IHBoZXQuc2NlbmVyeS5Gb250KCkuZm9udCAgICAgICAgICAgICAgICAgICAgICAvLyBcIjEwcHggc2Fucy1zZXJpZlwiICh0aGUgZGVmYXVsdClcclxuICogbmV3IHBoZXQuc2NlbmVyeS5Gb250KCB7IGZhbWlseTogJ3NlcmlmJyB9ICkuZm9udCAvLyBcIjEwcHggc2VyaWZcIlxyXG4gKiBuZXcgcGhldC5zY2VuZXJ5LkZvbnQoIHsgd2VpZ2h0OiAnYm9sZCcgfSApLmZvbnQgIC8vIFwiYm9sZCAxMHB4IHNhbnMtc2VyaWZcIlxyXG4gKiBuZXcgcGhldC5zY2VuZXJ5LkZvbnQoIHsgc2l6ZTogMTYgfSApLmZvbnQgICAgICAgIC8vIFwiMTZweCBzYW5zLXNlcmlmXCJcclxuICogdmFyIGZvbnQgPSBuZXcgcGhldC5zY2VuZXJ5LkZvbnQoIHtcclxuICogICBmYW1pbHk6ICdcIlRpbWVzIE5ldyBSb21hblwiLCBzZXJpZicsXHJcbiAqICAgc3R5bGU6ICdpdGFsaWMnLFxyXG4gKiAgIGxpbmVIZWlnaHQ6IDEwXHJcbiAqIH0gKTtcclxuICogZm9udC5mb250OyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gXCJpdGFsaWMgMTBweC8xMCAnVGltZXMgTmV3IFJvbWFuJywgc2VyaWZcIlxyXG4gKiBmb250LmZhbWlseTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBcIidUaW1lcyBOZXcgUm9tYW4nLCBzZXJpZlwiXHJcbiAqIGZvbnQud2VpZ2h0OyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDQwMCAodGhlIGRlZmF1bHQpXHJcbiAqXHJcbiAqIFVzZWZ1bCBzcGVjczpcclxuICogaHR0cDovL3d3dy53My5vcmcvVFIvY3NzMy1mb250cy9cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBoZXRpb09iamVjdCwgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvU3RyaW5nSU8uanMnO1xyXG5pbXBvcnQgeyBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG4vLyBWYWxpZCB2YWx1ZXMgZm9yIHRoZSAnc3R5bGUnIHByb3BlcnR5IG9mIEZvbnRcclxuY29uc3QgVkFMSURfU1RZTEVTID0gWyAnbm9ybWFsJywgJ2l0YWxpYycsICdvYmxpcXVlJyBdO1xyXG5cclxuLy8gVmFsaWQgdmFsdWVzIGZvciB0aGUgJ3ZhcmlhbnQnIHByb3BlcnR5IG9mIEZvbnRcclxuY29uc3QgVkFMSURfVkFSSUFOVFMgPSBbICdub3JtYWwnLCAnc21hbGwtY2FwcycgXTtcclxuXHJcbi8vIFZhbGlkIHZhbHVlcyBmb3IgdGhlICd3ZWlnaHQnIHByb3BlcnR5IG9mIEZvbnRcclxuY29uc3QgVkFMSURfV0VJR0hUUyA9IFsgJ25vcm1hbCcsICdib2xkJywgJ2JvbGRlcicsICdsaWdodGVyJyxcclxuICAnMTAwJywgJzIwMCcsICczMDAnLCAnNDAwJywgJzUwMCcsICc2MDAnLCAnNzAwJywgJzgwMCcsICc5MDAnIF07XHJcblxyXG4vLyBWYWxpZCB2YWx1ZXMgZm9yIHRoZSAnc3RyZXRjaCcgcHJvcGVydHkgb2YgRm9udFxyXG5jb25zdCBWQUxJRF9TVFJFVENIRVMgPSBbICdub3JtYWwnLCAndWx0cmEtY29uZGVuc2VkJywgJ2V4dHJhLWNvbmRlbnNlZCcsICdjb25kZW5zZWQnLCAnc2VtaS1jb25kZW5zZWQnLFxyXG4gICdzZW1pLWV4cGFuZGVkJywgJ2V4cGFuZGVkJywgJ2V4dHJhLWV4cGFuZGVkJywgJ3VsdHJhLWV4cGFuZGVkJyBdO1xyXG5cclxuZXhwb3J0IHR5cGUgRm9udFN0eWxlID0gJ25vcm1hbCcgfCAnaXRhbGljJyB8ICdvYmxpcXVlJztcclxuZXhwb3J0IHR5cGUgRm9udFZhcmlhbnQgPSAnbm9ybWFsJyB8ICdzbWFsbC1jYXBzJztcclxuZXhwb3J0IHR5cGUgRm9udFdlaWdodCA9XHJcbiAgJ25vcm1hbCdcclxuICB8ICdib2xkJ1xyXG4gIHwgJ2JvbGRlcidcclxuICB8ICdsaWdodGVyJ1xyXG4gIHwgJzEwMCdcclxuICB8ICcyMDAnXHJcbiAgfCAnMzAwJ1xyXG4gIHwgJzQwMCdcclxuICB8ICc1MDAnXHJcbiAgfCAnNjAwJ1xyXG4gIHwgJzcwMCdcclxuICB8ICc4MDAnXHJcbiAgfCAnOTAwJztcclxuZXhwb3J0IHR5cGUgRm9udFN0cmV0Y2ggPVxyXG4gICdub3JtYWwnXHJcbiAgfCAndWx0cmEtY29uZGVuc2VkJ1xyXG4gIHwgJ2V4dHJhLWNvbmRlbnNlZCdcclxuICB8ICdjb25kZW5zZWQnXHJcbiAgfCAnc2VtaS1jb25kZW5zZWQnXHJcbiAgfCAnc2VtaS1leHBhbmRlZCdcclxuICB8ICdleHBhbmRlZCdcclxuICB8ICdleHRyYS1leHBhbmRlZCdcclxuICB8ICd1bHRyYS1leHBhbmRlZCc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHN0eWxlPzogRm9udFN0eWxlO1xyXG4gIHZhcmlhbnQ/OiBGb250VmFyaWFudDtcclxuICB3ZWlnaHQ/OiBudW1iZXIgfCBGb250V2VpZ2h0O1xyXG4gIHN0cmV0Y2g/OiBGb250U3RyZXRjaDtcclxuICBzaXplPzogbnVtYmVyIHwgc3RyaW5nO1xyXG4gIGxpbmVIZWlnaHQ/OiBzdHJpbmc7XHJcbiAgZmFtaWx5Pzogc3RyaW5nO1xyXG59O1xyXG5leHBvcnQgdHlwZSBGb250T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGhldGlvT2JqZWN0T3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZvbnQgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG5cclxuICAvLyBTZWUgaHR0cHM6Ly93d3cudzMub3JnL1RSL2Nzcy1mb250cy0zLyNwcm9wZGVmLWZvbnQtc3R5bGVcclxuICBwcml2YXRlIHJlYWRvbmx5IF9zdHlsZTogRm9udFN0eWxlO1xyXG5cclxuICAvLyBTZWUgaHR0cHM6Ly93d3cudzMub3JnL1RSL2Nzcy1mb250cy0zLyNmb250LXZhcmlhbnQtY3NzMjEtdmFsdWVzXHJcbiAgcHJpdmF0ZSByZWFkb25seSBfdmFyaWFudDogRm9udFZhcmlhbnQ7XHJcblxyXG4gIC8vIFNlZSBodHRwczovL3d3dy53My5vcmcvVFIvY3NzLWZvbnRzLTMvI3Byb3BkZWYtZm9udC13ZWlnaHRcclxuICBwcml2YXRlIHJlYWRvbmx5IF93ZWlnaHQ6IEZvbnRXZWlnaHQ7XHJcblxyXG4gIC8vIFNlZSBodHRwczovL3d3dy53My5vcmcvVFIvY3NzLWZvbnRzLTMvI3Byb3BkZWYtZm9udC1zdHJldGNoXHJcbiAgcHJpdmF0ZSByZWFkb25seSBfc3RyZXRjaDogRm9udFN0cmV0Y2g7XHJcblxyXG4gIC8vIFNlZSBodHRwczovL3d3dy53My5vcmcvVFIvY3NzLWZvbnRzLTMvI3Byb3BkZWYtZm9udC1zaXplXHJcbiAgcHJpdmF0ZSByZWFkb25seSBfc2l6ZTogc3RyaW5nO1xyXG5cclxuICAvLyBTZWUgaHR0cHM6Ly93d3cudzMub3JnL1RSL0NTUzIvdmlzdWRldC5odG1sI3Byb3BkZWYtbGluZS1oZWlnaHRcclxuICBwcml2YXRlIHJlYWRvbmx5IF9saW5lSGVpZ2h0OiBzdHJpbmc7XHJcblxyXG4gIC8vIFNlZSBodHRwczovL3d3dy53My5vcmcvVFIvY3NzLWZvbnRzLTMvI3Byb3BkZWYtZm9udC1mYW1pbHlcclxuICBwcml2YXRlIHJlYWRvbmx5IF9mYW1pbHk6IHN0cmluZztcclxuXHJcbiAgLy8gU2hvcnRoYW5kIGZvbnQgcHJvcGVydHlcclxuICBwcml2YXRlIHJlYWRvbmx5IF9mb250OiBzdHJpbmc7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogRm9udE9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwcm92aWRlZE9wdGlvbnMgPT09IHVuZGVmaW5lZCB8fCAoIHR5cGVvZiBwcm92aWRlZE9wdGlvbnMgPT09ICdvYmplY3QnICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZiggcHJvdmlkZWRPcHRpb25zICkgPT09IE9iamVjdC5wcm90b3R5cGUgKSxcclxuICAgICAgJ29wdGlvbnMsIGlmIHByb3ZpZGVkLCBzaG91bGQgYmUgYSByYXcgb2JqZWN0JyApO1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Rm9udE9wdGlvbnMsIFNlbGZPcHRpb25zLCBQaGV0aW9PYmplY3RPcHRpb25zPigpKCB7XHJcbiAgICAgIC8vIHtzdHJpbmd9IC0gJ25vcm1hbCcsICdpdGFsaWMnIG9yICdvYmxpcXVlJ1xyXG4gICAgICBzdHlsZTogJ25vcm1hbCcsXHJcblxyXG4gICAgICAvLyB7c3RyaW5nfSAtICdub3JtYWwnIG9yICdzbWFsbC1jYXBzJ1xyXG4gICAgICB2YXJpYW50OiAnbm9ybWFsJyxcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ8c3RyaW5nfSAtICdub3JtYWwnLCAnYm9sZCcsICdib2xkZXInLCAnbGlnaHRlcicsICcxMDAnLCAnMjAwJywgJzMwMCcsICc0MDAnLCAnNTAwJywgJzYwMCcsICc3MDAnLFxyXG4gICAgICAvLyAnODAwJywgJzkwMCcsIG9yIGEgbnVtYmVyIHRoYXQgd2hlbiBjYXN0IHRvIGEgc3RyaW5nIHdpbGwgYmUgb25lIG9mIHRoZSBzdHJpbmdzIGFib3ZlLlxyXG4gICAgICB3ZWlnaHQ6ICdub3JtYWwnLFxyXG5cclxuICAgICAgLy8ge3N0cmluZ30gLSAnbm9ybWFsJywgJ3VsdHJhLWNvbmRlbnNlZCcsICdleHRyYS1jb25kZW5zZWQnLCAnY29uZGVuc2VkJywgJ3NlbWktY29uZGVuc2VkJywgJ3NlbWktZXhwYW5kZWQnLFxyXG4gICAgICAvLyAnZXhwYW5kZWQnLCAnZXh0cmEtZXhwYW5kZWQnIG9yICd1bHRyYS1leHBhbmRlZCdcclxuICAgICAgc3RyZXRjaDogJ25vcm1hbCcsXHJcblxyXG4gICAgICAvLyB7bnVtYmVyfHN0cmluZ30gLSBBIHZhbGlkIENTUyBmb250LXNpemUgc3RyaW5nLCBvciBhIG51bWJlciByZXByZXNlbnRpbmcgYSBxdWFudGl0eSBvZiAncHgnLlxyXG4gICAgICBzaXplOiAnMTBweCcsXHJcblxyXG4gICAgICAvLyB7c3RyaW5nfSAtIEEgdmFsaWQgQ1NTIGxpbmUtaGVpZ2h0LCB0eXBpY2FsbHkgJ25vcm1hbCcsIGEgbnVtYmVyLCBhIENTUyBsZW5ndGggKGUuZy4gJzE1cHgnKSwgb3IgYSBwZXJjZW50YWdlXHJcbiAgICAgIC8vIG9mIHRoZSBub3JtYWwgaGVpZ2h0LlxyXG4gICAgICBsaW5lSGVpZ2h0OiAnbm9ybWFsJyxcclxuXHJcbiAgICAgIC8vIHtzdHJpbmd9IC0gQSBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBmYW1pbGllcywgd2hpY2ggY2FuIGluY2x1ZGUgZ2VuZXJpYyBmYW1pbGllcyAocHJlZmVyYWJseSBhdCB0aGUgZW5kKSBzdWNoXHJcbiAgICAgIC8vIGFzICdzZXJpZicsICdzYW5zLXNlcmlmJywgJ2N1cnNpdmUnLCAnZmFudGFzeScgYW5kICdtb25vc3BhY2UnLiBJZiB0aGVyZSBpcyBhbnkgcXVlc3Rpb24gYWJvdXQgZXNjYXBpbmcgKHN1Y2hcclxuICAgICAgLy8gYXMgc3BhY2VzIGluIGEgZm9udCBuYW1lKSwgdGhlIGZhbWlseSBzaG91bGQgYmUgc3Vycm91bmRlZCBieSBkb3VibGUgcXVvdGVzLlxyXG4gICAgICBmYW1pbHk6ICdzYW5zLXNlcmlmJyxcclxuXHJcbiAgICAgIHBoZXRpb1R5cGU6IEZvbnQuRm9udElPLFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRJT05BTFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG9wdGlvbnMud2VpZ2h0ID09PSAnc3RyaW5nJyB8fCB0eXBlb2Ygb3B0aW9ucy53ZWlnaHQgPT09ICdudW1iZXInLCAnRm9udCB3ZWlnaHQgc2hvdWxkIGJlIHNwZWNpZmllZCBhcyBhIHN0cmluZyBvciBudW1iZXInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygb3B0aW9ucy5zaXplID09PSAnc3RyaW5nJyB8fCB0eXBlb2Ygb3B0aW9ucy5zaXplID09PSAnbnVtYmVyJywgJ0ZvbnQgc2l6ZSBzaG91bGQgYmUgc3BlY2lmaWVkIGFzIGEgc3RyaW5nIG9yIG51bWJlcicgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuX3N0eWxlID0gb3B0aW9ucy5zdHlsZTtcclxuICAgIHRoaXMuX3ZhcmlhbnQgPSBvcHRpb25zLnZhcmlhbnQ7XHJcbiAgICB0aGlzLl93ZWlnaHQgPSBgJHtvcHRpb25zLndlaWdodH1gIGFzIEZvbnRXZWlnaHQ7IC8vIGNhc3QgdG8gc3RyaW5nLCB3ZSdsbCBkb3VibGUgY2hlY2sgaXQgbGF0ZXJcclxuICAgIHRoaXMuX3N0cmV0Y2ggPSBvcHRpb25zLnN0cmV0Y2g7XHJcbiAgICB0aGlzLl9zaXplID0gRm9udC5jYXN0U2l6ZSggb3B0aW9ucy5zaXplICk7XHJcbiAgICB0aGlzLl9saW5lSGVpZ2h0ID0gb3B0aW9ucy5saW5lSGVpZ2h0O1xyXG4gICAgdGhpcy5fZmFtaWx5ID0gb3B0aW9ucy5mYW1pbHk7XHJcblxyXG4gICAgLy8gc2FuaXR5IGNoZWNrcyB0byBwcmV2ZW50IGVycm9ycyBpbiBpbnRlcnByZXRhdGlvbiBvciBpbiB0aGUgZm9udCBzaG9ydGhhbmQgdXNhZ2VcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLl9zdHlsZSA9PT0gJ3N0cmluZycgJiYgXy5pbmNsdWRlcyggVkFMSURfU1RZTEVTLCB0aGlzLl9zdHlsZSApLFxyXG4gICAgICAnRm9udCBzdHlsZSBtdXN0IGJlIG9uZSBvZiBcIm5vcm1hbFwiLCBcIml0YWxpY1wiLCBvciBcIm9ibGlxdWVcIicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLl92YXJpYW50ID09PSAnc3RyaW5nJyAmJiBfLmluY2x1ZGVzKCBWQUxJRF9WQVJJQU5UUywgdGhpcy5fdmFyaWFudCApLFxyXG4gICAgICAnRm9udCB2YXJpYW50IG11c3QgYmUgXCJub3JtYWxcIiBvciBcInNtYWxsLWNhcHNcIicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLl93ZWlnaHQgPT09ICdzdHJpbmcnICYmIF8uaW5jbHVkZXMoIFZBTElEX1dFSUdIVFMsIHRoaXMuX3dlaWdodCApLFxyXG4gICAgICAnRm9udCB3ZWlnaHQgbXVzdCBiZSBvbmUgb2YgXCJub3JtYWxcIiwgXCJib2xkXCIsIFwiYm9sZGVyXCIsIFwibGlnaHRlclwiLCBcIjEwMFwiLCBcIjIwMFwiLCBcIjMwMFwiLCBcIjQwMFwiLCBcIjUwMFwiLCBcIjYwMFwiLCBcIjcwMFwiLCBcIjgwMFwiLCBvciBcIjkwMFwiJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRoaXMuX3N0cmV0Y2ggPT09ICdzdHJpbmcnICYmIF8uaW5jbHVkZXMoIFZBTElEX1NUUkVUQ0hFUywgdGhpcy5fc3RyZXRjaCApLFxyXG4gICAgICAnRm9udCBzdHJldGNoIG11c3QgYmUgb25lIG9mIFwibm9ybWFsXCIsIFwidWx0cmEtY29uZGVuc2VkXCIsIFwiZXh0cmEtY29uZGVuc2VkXCIsIFwiY29uZGVuc2VkXCIsIFwic2VtaS1jb25kZW5zZWRcIiwgXCJzZW1pLWV4cGFuZGVkXCIsIFwiZXhwYW5kZWRcIiwgXCJleHRyYS1leHBhbmRlZFwiLCBvciBcInVsdHJhLWV4cGFuZGVkXCInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGhpcy5fc2l6ZSA9PT0gJ3N0cmluZycgJiYgIV8uaW5jbHVkZXMoIFsgJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknIF0sIHRoaXMuX3NpemVbIHRoaXMuX3NpemUubGVuZ3RoIC0gMSBdICksXHJcbiAgICAgICdGb250IHNpemUgbXVzdCBiZSBlaXRoZXIgcGFzc2VkIGFzIGEgbnVtYmVyIChub3QgYSBzdHJpbmcsIGludGVycHJldGVkIGFzIHB4KSwgb3IgbXVzdCBjb250YWluIGEgc3VmZml4IGZvciBwZXJjZW50YWdlLCBhYnNvbHV0ZSBvciByZWxhdGl2ZSB1bml0cywgb3IgYW4gZXhwbGljaXQgc2l6ZSBjb25zdGFudCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLl9saW5lSGVpZ2h0ID09PSAnc3RyaW5nJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRoaXMuX2ZhbWlseSA9PT0gJ3N0cmluZycgKTtcclxuXHJcbiAgICAvLyBJbml0aWFsaXplIHRoZSBzaG9ydGhhbmQgZm9udCBwcm9wZXJ0eVxyXG4gICAgdGhpcy5fZm9udCA9IHRoaXMuY29tcHV0ZVNob3J0aGFuZCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGlzIGZvbnQncyBDU1Mgc2hvcnRoYW5kLCB3aGljaCBpbmNsdWRlcyBhbGwgb2YgdGhlIGZvbnQncyBpbmZvcm1hdGlvbiByZWR1Y2VkIGludG8gYSBzaW5nbGUgc3RyaW5nLlxyXG4gICAqXHJcbiAgICogVGhpcyBjYW4gYmUgdXNlZCBmb3IgQ1NTIGFzIHRoZSAnZm9udCcgYXR0cmlidXRlLCBvciBpcyBuZWVkZWQgdG8gc2V0IENhbnZhcyBmb250cy5cclxuICAgKlxyXG4gICAqIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9jc3MtZm9udHMtMy8jcHJvcGRlZi1mb250IGNvbnRhaW5zIGRldGFpbGVkIGluZm9ybWF0aW9uIG9uIGhvdyB0aGlzIGlzIGZvcm1hdHRlZC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Rm9udCgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX2ZvbnQ7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGZvbnQoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZ2V0Rm9udCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhpcyBmb250J3Mgc3R5bGUuIFNlZSB0aGUgY29uc3RydWN0b3IgZm9yIG1vcmUgZGV0YWlscyBvbiB2YWxpZCB2YWx1ZXMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFN0eWxlKCk6IEZvbnRTdHlsZSB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3R5bGU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHN0eWxlKCk6IEZvbnRTdHlsZSB7IHJldHVybiB0aGlzLmdldFN0eWxlKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGlzIGZvbnQncyB2YXJpYW50LiBTZWUgdGhlIGNvbnN0cnVjdG9yIGZvciBtb3JlIGRldGFpbHMgb24gdmFsaWQgdmFsdWVzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRWYXJpYW50KCk6IEZvbnRWYXJpYW50IHtcclxuICAgIHJldHVybiB0aGlzLl92YXJpYW50O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCB2YXJpYW50KCk6IEZvbnRWYXJpYW50IHsgcmV0dXJuIHRoaXMuZ2V0VmFyaWFudCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhpcyBmb250J3Mgd2VpZ2h0LiBTZWUgdGhlIGNvbnN0cnVjdG9yIGZvciBtb3JlIGRldGFpbHMgb24gdmFsaWQgdmFsdWVzLlxyXG4gICAqXHJcbiAgICogTk9URTogSWYgYSBudW1lcmljIHdlaWdodCB3YXMgcGFzc2VkIGluLCBpdCBoYXMgYmVlbiBjYXN0IHRvIGEgc3RyaW5nLCBhbmQgYSBzdHJpbmcgd2lsbCBiZSByZXR1cm5lZCBoZXJlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRXZWlnaHQoKTogRm9udFdlaWdodCB7XHJcbiAgICByZXR1cm4gdGhpcy5fd2VpZ2h0O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCB3ZWlnaHQoKTogRm9udFdlaWdodCB7IHJldHVybiB0aGlzLmdldFdlaWdodCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhpcyBmb250J3Mgc3RyZXRjaC4gU2VlIHRoZSBjb25zdHJ1Y3RvciBmb3IgbW9yZSBkZXRhaWxzIG9uIHZhbGlkIHZhbHVlcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U3RyZXRjaCgpOiBGb250U3RyZXRjaCB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3RyZXRjaDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc3RyZXRjaCgpOiBGb250U3RyZXRjaCB7IHJldHVybiB0aGlzLmdldFN0cmV0Y2goKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoaXMgZm9udCdzIHNpemUuIFNlZSB0aGUgY29uc3RydWN0b3IgZm9yIG1vcmUgZGV0YWlscyBvbiB2YWxpZCB2YWx1ZXMuXHJcbiAgICpcclxuICAgKiBOT1RFOiBJZiBhIG51bWVyaWMgc2l6ZSB3YXMgcGFzc2VkIGluLCBpdCBoYXMgYmVlbiBjYXN0IHRvIGEgc3RyaW5nLCBhbmQgYSBzdHJpbmcgd2lsbCBiZSByZXR1cm5lZCBoZXJlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRTaXplKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2l6ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc2l6ZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5nZXRTaXplKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcHByb3hpbWF0ZSB2YWx1ZSBvZiB0aGlzIGZvbnQncyBzaXplIGluIHB4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXROdW1lcmljU2l6ZSgpOiBudW1iZXIge1xyXG4gICAgY29uc3QgcHhNYXRjaCA9IHRoaXMuX3NpemUubWF0Y2goIC9eKFxcZCspcHgkLyApO1xyXG4gICAgaWYgKCBweE1hdGNoICkge1xyXG4gICAgICByZXR1cm4gTnVtYmVyKCBweE1hdGNoWyAxIF0gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwdE1hdGNoID0gdGhpcy5fc2l6ZS5tYXRjaCggL14oXFxkKylwdCQvICk7XHJcbiAgICBpZiAoIHB0TWF0Y2ggKSB7XHJcbiAgICAgIHJldHVybiAwLjc1ICogTnVtYmVyKCBwdE1hdGNoWyAxIF0gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBlbU1hdGNoID0gdGhpcy5fc2l6ZS5tYXRjaCggL14oXFxkKyllbSQvICk7XHJcbiAgICBpZiAoIGVtTWF0Y2ggKSB7XHJcbiAgICAgIHJldHVybiBOdW1iZXIoIGVtTWF0Y2hbIDEgXSApIC8gMTY7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIDEyOyAvLyBhIGd1ZXNzP1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBudW1lcmljU2l6ZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXROdW1lcmljU2l6ZSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhpcyBmb250J3MgbGluZS1oZWlnaHQuIFNlZSB0aGUgY29uc3RydWN0b3IgZm9yIG1vcmUgZGV0YWlscyBvbiB2YWxpZCB2YWx1ZXMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldExpbmVIZWlnaHQoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl9saW5lSGVpZ2h0O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBsaW5lSGVpZ2h0KCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmdldExpbmVIZWlnaHQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoaXMgZm9udCdzIGZhbWlseS4gU2VlIHRoZSBjb25zdHJ1Y3RvciBmb3IgbW9yZSBkZXRhaWxzIG9uIHZhbGlkIHZhbHVlcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RmFtaWx5KCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5fZmFtaWx5O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBmYW1pbHkoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZ2V0RmFtaWx5KCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5ldyBGb250IG9iamVjdCwgd2hpY2ggaXMgYSBjb3B5IG9mIHRoaXMgb2JqZWN0LiBJZiBvcHRpb25zIGFyZSBwcm92aWRlZCwgdGhleSBvdmVycmlkZSB0aGUgY3VycmVudFxyXG4gICAqIHZhbHVlcyBpbiB0aGlzIG9iamVjdC5cclxuICAgKi9cclxuICBwdWJsaWMgY29weSggb3B0aW9ucz86IEZvbnRPcHRpb25zICk6IEZvbnQge1xyXG4gICAgLy8gVE9ETzogZ2V0IG1lcmdlIHdvcmtpbmcgaW4gdHlwZXNjcmlwdFxyXG4gICAgcmV0dXJuIG5ldyBGb250KCBjb21iaW5lT3B0aW9uczxGb250T3B0aW9ucz4oIHtcclxuICAgICAgc3R5bGU6IHRoaXMuX3N0eWxlLFxyXG4gICAgICB2YXJpYW50OiB0aGlzLl92YXJpYW50LFxyXG4gICAgICB3ZWlnaHQ6IHRoaXMuX3dlaWdodCxcclxuICAgICAgc3RyZXRjaDogdGhpcy5fc3RyZXRjaCxcclxuICAgICAgc2l6ZTogdGhpcy5fc2l6ZSxcclxuICAgICAgbGluZUhlaWdodDogdGhpcy5fbGluZUhlaWdodCxcclxuICAgICAgZmFtaWx5OiB0aGlzLl9mYW1pbHlcclxuICAgIH0sIG9wdGlvbnMgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZXMgdGhlIGNvbWJpbmVkIENTUyBzaG9ydGhhbmQgZm9udCBzdHJpbmcuXHJcbiAgICpcclxuICAgKiBodHRwczovL3d3dy53My5vcmcvVFIvY3NzLWZvbnRzLTMvI3Byb3BkZWYtZm9udCBjb250YWlucyBkZXRhaWxzIGFib3V0IHRoZSBmb3JtYXQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjb21wdXRlU2hvcnRoYW5kKCk6IHN0cmluZyB7XHJcbiAgICBsZXQgcmV0ID0gJyc7XHJcbiAgICBpZiAoIHRoaXMuX3N0eWxlICE9PSAnbm9ybWFsJyApIHsgcmV0ICs9IGAke3RoaXMuX3N0eWxlfSBgOyB9XHJcbiAgICBpZiAoIHRoaXMuX3ZhcmlhbnQgIT09ICdub3JtYWwnICkgeyByZXQgKz0gYCR7dGhpcy5fdmFyaWFudH0gYDsgfVxyXG4gICAgaWYgKCB0aGlzLl93ZWlnaHQgIT09ICdub3JtYWwnICkgeyByZXQgKz0gYCR7dGhpcy5fd2VpZ2h0fSBgOyB9XHJcbiAgICBpZiAoIHRoaXMuX3N0cmV0Y2ggIT09ICdub3JtYWwnICkgeyByZXQgKz0gYCR7dGhpcy5fc3RyZXRjaH0gYDsgfVxyXG4gICAgcmV0ICs9IHRoaXMuX3NpemU7XHJcbiAgICBpZiAoIHRoaXMuX2xpbmVIZWlnaHQgIT09ICdub3JtYWwnICkgeyByZXQgKz0gYC8ke3RoaXMuX2xpbmVIZWlnaHR9YDsgfVxyXG4gICAgcmV0ICs9IGAgJHt0aGlzLl9mYW1pbHl9YDtcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoaXMgZm9udCdzIENTUyBzaG9ydGhhbmQsIHdoaWNoIGluY2x1ZGVzIGFsbCBvZiB0aGUgZm9udCdzIGluZm9ybWF0aW9uIHJlZHVjZWQgaW50byBhIHNpbmdsZSBzdHJpbmcuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIGlzIGFuIGFsaWFzIG9mIGdldEZvbnQoKS5cclxuICAgKlxyXG4gICAqIFRoaXMgY2FuIGJlIHVzZWQgZm9yIENTUyBhcyB0aGUgJ2ZvbnQnIGF0dHJpYnV0ZSwgb3IgaXMgbmVlZGVkIHRvIHNldCBDYW52YXMgZm9udHMuXHJcbiAgICpcclxuICAgKiBodHRwczovL3d3dy53My5vcmcvVFIvY3NzLWZvbnRzLTMvI3Byb3BkZWYtZm9udCBjb250YWlucyBkZXRhaWxlZCBpbmZvcm1hdGlvbiBvbiBob3cgdGhpcyBpcyBmb3JtYXR0ZWQuXHJcbiAgICovXHJcbiAgcHVibGljIHRvQ1NTKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRGb250KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0cyBhIGdlbmVyaWMgc2l6ZSB0byBhIHNwZWNpZmljIENTUyBwaXhlbCBzdHJpbmcsIGFzc3VtaW5nICdweCcgZm9yIG51bWJlcnMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc2l6ZSAtIElmIGl0J3MgYSBudW1iZXIsICdweCcgd2lsbCBiZSBhcHBlbmRlZFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY2FzdFNpemUoIHNpemU6IHN0cmluZyB8IG51bWJlciApOiBzdHJpbmcge1xyXG4gICAgaWYgKCB0eXBlb2Ygc2l6ZSA9PT0gJ251bWJlcicgKSB7XHJcbiAgICAgIHJldHVybiBgJHtzaXplfXB4YDsgLy8gYWRkIHRoZSBwaXhlbHMgc3VmZml4IGJ5IGRlZmF1bHQgZm9yIG51bWJlcnNcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gc2l6ZTsgLy8gYXNzdW1lIHRoYXQgaXQncyBhIHZhbGlkIHRvLXNwZWMgc3RyaW5nXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIGlzRm9udFN0eWxlKCBzdHlsZTogc3RyaW5nICk6IHN0eWxlIGlzIEZvbnRTdHlsZSB7XHJcbiAgICByZXR1cm4gVkFMSURfU1RZTEVTLmluY2x1ZGVzKCBzdHlsZSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBpc0ZvbnRWYXJpYW50KCB2YXJpYW50OiBzdHJpbmcgKTogdmFyaWFudCBpcyBGb250VmFyaWFudCB7XHJcbiAgICByZXR1cm4gVkFMSURfVkFSSUFOVFMuaW5jbHVkZXMoIHZhcmlhbnQgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgaXNGb250V2VpZ2h0KCB3ZWlnaHQ6IHN0cmluZyApOiB3ZWlnaHQgaXMgRm9udFdlaWdodCB7XHJcbiAgICByZXR1cm4gVkFMSURfV0VJR0hUUy5pbmNsdWRlcyggd2VpZ2h0ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIGlzRm9udFN0cmV0Y2goIHN0cmV0Y2g6IHN0cmluZyApOiBzdHJldGNoIGlzIEZvbnRTdHJldGNoIHtcclxuICAgIHJldHVybiBWQUxJRF9TVFJFVENIRVMuaW5jbHVkZXMoIHN0cmV0Y2ggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBhcnNlcyBhIENTUy1jb21wbGlhbnQgXCJmb250XCIgc2hvcnRoYW5kIHN0cmluZyBpbnRvIGEgRm9udCBvYmplY3QuXHJcbiAgICpcclxuICAgKiBGb250IHN0cmluZ3Mgc2hvdWxkIGJlIGEgdmFsaWQgQ1NTMyBmb250IGRlY2xhcmF0aW9uIHZhbHVlIChzZWUgaHR0cDovL3d3dy53My5vcmcvVFIvY3NzMy1mb250cy8pIHdoaWNoIGNvbnNpc3RzXHJcbiAgICogb2YgdGhlIGZvbGxvd2luZyBwYXR0ZXJuOlxyXG4gICAqICAgWyBbIDzigJhmb250LXN0eWxl4oCZPiB8fCA8Zm9udC12YXJpYW50LWNzczIxPiB8fCA84oCYZm9udC13ZWlnaHTigJk+IHx8IDzigJhmb250LXN0cmV0Y2jigJk+IF0/IDzigJhmb250LXNpemXigJk+XHJcbiAgICogICBbIC8gPOKAmGxpbmUtaGVpZ2h04oCZPiBdPyA84oCYZm9udC1mYW1pbHnigJk+IF1cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGZyb21DU1MoIGNzc1N0cmluZzogc3RyaW5nICk6IEZvbnQge1xyXG4gICAgLy8gcGFyc2UgYSBzb21ld2hhdCBwcm9wZXIgQ1NTMyBmb3JtIChub3QgZ3VhcmFudGVlZCB0byBoYW5kbGUgaXQgcHJlY2lzZWx5IHRoZSBzYW1lIGFzIGJyb3dzZXJzIHlldClcclxuXHJcbiAgICBjb25zdCBvcHRpb25zOiBGb250T3B0aW9ucyA9IHt9O1xyXG5cclxuICAgIC8vIHNwbGl0IGJhc2VkIG9uIHdoaXRlc3BhY2UgYWxsb3dlZCBieSBDU1Mgc3BlYyAobW9yZSByZXN0cmljdGl2ZSB0aGFuIHJlZ3VsYXIgcmVnZXhwIHdoaXRlc3BhY2UpXHJcbiAgICBjb25zdCB0b2tlbnMgPSBfLmZpbHRlciggY3NzU3RyaW5nLnNwbGl0KCAvW1xceDA5XFx4MEFcXHgwQ1xceDBEXFx4MjBdLyApLCB0b2tlbiA9PiB0b2tlbi5sZW5ndGggPiAwICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29udHJvbC1yZWdleFxyXG5cclxuICAgIC8vIHB1bGwgdG9rZW5zIG91dCB1bnRpbCB3ZSByZWFjaCBzb21ldGhpbmcgdGhhdCBkb2Vzbid0IG1hdGNoLiB0aGF0IG11c3QgYmUgdGhlIGZvbnQgc2l6ZSAoYWNjb3JkaW5nIHRvIHNwZWMpXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHRva2VuID0gdG9rZW5zWyBpIF07XHJcbiAgICAgIGlmICggdG9rZW4gPT09ICdub3JtYWwnICkge1xyXG4gICAgICAgIC8vIG5vdGhpbmcgaGFzIHRvIGJlIGRvbmUsIGV2ZXJ5dGhpbmcgYWxyZWFkeSBub3JtYWwgYXMgZGVmYXVsdFxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBGb250LmlzRm9udFN0eWxlKCB0b2tlbiApICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuc3R5bGUgPT09IHVuZGVmaW5lZCwgYFN0eWxlIGNhbm5vdCBiZSBhcHBsaWVkIHR3aWNlLiBBbHJlYWR5IHNldCB0byBcIiR7b3B0aW9ucy5zdHlsZX1cIiwgYXR0ZW1wdCB0byByZXBsYWNlIHdpdGggXCIke3Rva2VufVwiYCApO1xyXG4gICAgICAgIG9wdGlvbnMuc3R5bGUgPSB0b2tlbjtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggRm9udC5pc0ZvbnRWYXJpYW50KCB0b2tlbiApICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMudmFyaWFudCA9PT0gdW5kZWZpbmVkLCBgVmFyaWFudCBjYW5ub3QgYmUgYXBwbGllZCB0d2ljZS4gQWxyZWFkeSBzZXQgdG8gXCIke29wdGlvbnMudmFyaWFudH1cIiwgYXR0ZW1wdCB0byByZXBsYWNlIHdpdGggXCIke3Rva2VufVwiYCApO1xyXG4gICAgICAgIG9wdGlvbnMudmFyaWFudCA9IHRva2VuO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBGb250LmlzRm9udFdlaWdodCggdG9rZW4gKSApIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLndlaWdodCA9PT0gdW5kZWZpbmVkLCBgV2VpZ2h0IGNhbm5vdCBiZSBhcHBsaWVkIHR3aWNlLiBBbHJlYWR5IHNldCB0byBcIiR7b3B0aW9ucy53ZWlnaHR9XCIsIGF0dGVtcHQgdG8gcmVwbGFjZSB3aXRoIFwiJHt0b2tlbn1cImAgKTtcclxuICAgICAgICBvcHRpb25zLndlaWdodCA9IHRva2VuO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBGb250LmlzRm9udFN0cmV0Y2goIHRva2VuICkgKSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5zdHJldGNoID09PSB1bmRlZmluZWQsIGBTdHJldGNoIGNhbm5vdCBiZSBhcHBsaWVkIHR3aWNlLiBBbHJlYWR5IHNldCB0byBcIiR7b3B0aW9ucy5zdHJldGNofVwiLCBhdHRlbXB0IHRvIHJlcGxhY2Ugd2l0aCBcIiR7dG9rZW59XCJgICk7XHJcbiAgICAgICAgb3B0aW9ucy5zdHJldGNoID0gdG9rZW47XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gbm90IGEgc3R5bGUvdmFyaWFudC93ZWlnaHQvc3RyZXRjaCwgbXVzdCBiZSBhIGZvbnQgc2l6ZSwgcG9zc2libHkgd2l0aCBhbiBpbmNsdWRlZCBsaW5lLWhlaWdodFxyXG4gICAgICAgIGNvbnN0IHN1YnRva2VucyA9IHRva2VuLnNwbGl0KCAvXFwvLyApOyAvLyBleHRyYWN0IGZvbnQgc2l6ZSBmcm9tIGFueSBsaW5lLWhlaWdodFxyXG4gICAgICAgIG9wdGlvbnMuc2l6ZSA9IHN1YnRva2Vuc1sgMCBdO1xyXG4gICAgICAgIGlmICggc3VidG9rZW5zWyAxIF0gKSB7XHJcbiAgICAgICAgICBvcHRpb25zLmxpbmVIZWlnaHQgPSBzdWJ0b2tlbnNbIDEgXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gYWxsIGZ1dHVyZSB0b2tlbnMgYXJlIGd1YXJhbnRlZWQgdG8gYmUgcGFydCBvZiB0aGUgZm9udC1mYW1pbHkgaWYgaXQgaXMgZ2l2ZW4gYWNjb3JkaW5nIHRvIHNwZWNcclxuICAgICAgICBvcHRpb25zLmZhbWlseSA9IHRva2Vucy5zbGljZSggaSArIDEgKS5qb2luKCAnICcgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgRm9udCggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBGb250SU86IElPVHlwZTxGb250LCBGb250U3RhdGU+O1xyXG5cclxuICAvLyB7Rm9udH0gLSBEZWZhdWx0IEZvbnQgb2JqZWN0IChzaW5jZSB0aGV5IGFyZSBpbW11dGFibGUpLlxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgREVGQVVMVCA9IG5ldyBGb250KCk7XHJcbn1cclxuXHJcbnR5cGUgRm9udFN0YXRlID0gUmVxdWlyZWQ8U2VsZk9wdGlvbnM+O1xyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0ZvbnQnLCBGb250ICk7XHJcblxyXG5Gb250LkZvbnRJTyA9IG5ldyBJT1R5cGUoICdGb250SU8nLCB7XHJcbiAgdmFsdWVUeXBlOiBGb250LFxyXG4gIGRvY3VtZW50YXRpb246ICdGb250IGhhbmRsaW5nIGZvciB0ZXh0IGRyYXdpbmcuIE9wdGlvbnM6JyArXHJcbiAgICAgICAgICAgICAgICAgJzx1bD4nICtcclxuICAgICAgICAgICAgICAgICAnPGxpPjxzdHJvbmc+c3R5bGU6PC9zdHJvbmc+IG5vcm1hbCAgICAgICZtZGFzaDsgbm9ybWFsIHwgaXRhbGljIHwgb2JsaXF1ZSA8L2xpPicgK1xyXG4gICAgICAgICAgICAgICAgICc8bGk+PHN0cm9uZz52YXJpYW50Ojwvc3Ryb25nPiBub3JtYWwgICAgJm1kYXNoOyBub3JtYWwgfCBzbWFsbC1jYXBzIDwvbGk+JyArXHJcbiAgICAgICAgICAgICAgICAgJzxsaT48c3Ryb25nPndlaWdodDo8L3N0cm9uZz4gbm9ybWFsICAgICAmbWRhc2g7IG5vcm1hbCB8IGJvbGQgfCBib2xkZXIgfCBsaWdodGVyIHwgMTAwIHwgMjAwIHwgMzAwIHwgNDAwIHwgNTAwIHwgNjAwIHwgNzAwIHwgODAwIHwgOTAwIDwvbGk+JyArXHJcbiAgICAgICAgICAgICAgICAgJzxsaT48c3Ryb25nPnN0cmV0Y2g6PC9zdHJvbmc+IG5vcm1hbCAgICAmbWRhc2g7IG5vcm1hbCB8IHVsdHJhLWNvbmRlbnNlZCB8IGV4dHJhLWNvbmRlbnNlZCB8IGNvbmRlbnNlZCB8IHNlbWktY29uZGVuc2VkIHwgc2VtaS1leHBhbmRlZCB8IGV4cGFuZGVkIHwgZXh0cmEtZXhwYW5kZWQgfCB1bHRyYS1leHBhbmRlZCA8L2xpPicgK1xyXG4gICAgICAgICAgICAgICAgICc8bGk+PHN0cm9uZz5zaXplOjwvc3Ryb25nPiAxMHB4ICAgICAgICAgJm1kYXNoOyBhYnNvbHV0ZS1zaXplIHwgcmVsYXRpdmUtc2l6ZSB8IGxlbmd0aCB8IHBlcmNlbnRhZ2UgLS0gdW5pdGxlc3MgbnVtYmVyIGludGVycHJldGVkIGFzIHB4LiBhYnNvbHV0ZSBzdWZmaXhlczogY20sIG1tLCBpbiwgcHQsIHBjLCBweC4gcmVsYXRpdmUgc3VmZml4ZXM6IGVtLCBleCwgY2gsIHJlbSwgdncsIHZoLCB2bWluLCB2bWF4LiA8L2xpPicgK1xyXG4gICAgICAgICAgICAgICAgICc8bGk+PHN0cm9uZz5saW5lSGVpZ2h0Ojwvc3Ryb25nPiBub3JtYWwgJm1kYXNoOyBub3JtYWwgfCBudW1iZXIgfCBsZW5ndGggfCBwZXJjZW50YWdlIC0tIE5PVEU6IENhbnZhcyBzcGVjIGZvcmNlcyBsaW5lLWhlaWdodCB0byBub3JtYWwgPC9saT4nICtcclxuICAgICAgICAgICAgICAgICAnPGxpPjxzdHJvbmc+ZmFtaWx5Ojwvc3Ryb25nPiBzYW5zLXNlcmlmICZtZGFzaDsgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgZmFtaWxpZXMsIGluY2x1ZGluZyBnZW5lcmljIGZhbWlsaWVzIChzZXJpZiwgc2Fucy1zZXJpZiwgY3Vyc2l2ZSwgZmFudGFzeSwgbW9ub3NwYWNlKS4gaWRlYWxseSBlc2NhcGUgd2l0aCBkb3VibGUtcXVvdGVzPC9saT4nICtcclxuICAgICAgICAgICAgICAgICAnPC91bD4nLFxyXG4gIHRvU3RhdGVPYmplY3Q6ICggZm9udDogRm9udCApOiBGb250U3RhdGUgPT4gKCB7XHJcbiAgICBzdHlsZTogZm9udC5nZXRTdHlsZSgpLFxyXG4gICAgdmFyaWFudDogZm9udC5nZXRWYXJpYW50KCksXHJcbiAgICB3ZWlnaHQ6IGZvbnQuZ2V0V2VpZ2h0KCksXHJcbiAgICBzdHJldGNoOiBmb250LmdldFN0cmV0Y2goKSxcclxuICAgIHNpemU6IGZvbnQuZ2V0U2l6ZSgpLFxyXG4gICAgbGluZUhlaWdodDogZm9udC5nZXRMaW5lSGVpZ2h0KCksXHJcbiAgICBmYW1pbHk6IGZvbnQuZ2V0RmFtaWx5KClcclxuICB9ICksXHJcblxyXG4gIGZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3Q6IEZvbnRTdGF0ZSApIHtcclxuICAgIHJldHVybiBuZXcgRm9udCggc3RhdGVPYmplY3QgKTtcclxuICB9LFxyXG5cclxuICBzdGF0ZVNjaGVtYToge1xyXG4gICAgc3R5bGU6IFN0cmluZ0lPLFxyXG4gICAgdmFyaWFudDogU3RyaW5nSU8sXHJcbiAgICB3ZWlnaHQ6IFN0cmluZ0lPLFxyXG4gICAgc3RyZXRjaDogU3RyaW5nSU8sXHJcbiAgICBzaXplOiBTdHJpbmdJTyxcclxuICAgIGxpbmVIZWlnaHQ6IFN0cmluZ0lPLFxyXG4gICAgZmFtaWx5OiBTdHJpbmdJT1xyXG4gIH1cclxufSApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsSUFBSUMsY0FBYyxRQUFRLG9DQUFvQztBQUM5RSxPQUFPQyxZQUFZLE1BQStCLG9DQUFvQztBQUN0RixPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLE1BQU0sTUFBTSxvQ0FBb0M7QUFDdkQsT0FBT0MsUUFBUSxNQUFNLHNDQUFzQztBQUMzRCxTQUFTQyxPQUFPLFFBQVEsZUFBZTs7QUFFdkM7QUFDQSxNQUFNQyxZQUFZLEdBQUcsQ0FBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBRTs7QUFFdEQ7QUFDQSxNQUFNQyxjQUFjLEdBQUcsQ0FBRSxRQUFRLEVBQUUsWUFBWSxDQUFFOztBQUVqRDtBQUNBLE1BQU1DLGFBQWEsR0FBRyxDQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFDM0QsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFL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