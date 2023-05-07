// Copyright 2013-2023, University of Colorado Boulder

/**
 * Displays text that can be filled/stroked.
 *
 * For many font/text-related properties, it's helpful to understand the CSS equivalents (http://www.w3.org/TR/css3-fonts/).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import StringProperty from '../../../axon/js/StringProperty.js';
import TinyForwardingProperty from '../../../axon/js/TinyForwardingProperty.js';
import escapeHTML from '../../../phet-core/js/escapeHTML.js';
import extendDefined from '../../../phet-core/js/extendDefined.js';
import platform from '../../../phet-core/js/platform.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import { Font, Node, Paintable, PAINTABLE_DRAWABLE_MARK_FLAGS, PAINTABLE_OPTION_KEYS, Renderer, scenery, TextBounds, TextCanvasDrawable, TextDOMDrawable, TextSVGDrawable } from '../imports.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
const STRING_PROPERTY_NAME = 'stringProperty'; // eslint-disable-line bad-sim-text

// constants
const TEXT_OPTION_KEYS = ['boundsMethod',
// {string} - Sets how bounds are determined for text, see setBoundsMethod() for more documentation
STRING_PROPERTY_NAME,
// {Property.<string>|null} - Sets forwarding of the stringProperty, see setStringProperty() for more documentation
'string',
// {string|number} - Sets the string to be displayed by this Text, see setString() for more documentation
'font',
// {Font|string} - Sets the font used for the text, see setFont() for more documentation
'fontWeight',
// {string|number} - Sets the weight of the current font, see setFont() for more documentation
'fontFamily',
// {string} - Sets the family of the current font, see setFont() for more documentation
'fontStretch',
// {string} - Sets the stretch of the current font, see setFont() for more documentation
'fontStyle',
// {string} - Sets the style of the current font, see setFont() for more documentation
'fontSize' // {string|number} - Sets the size of the current font, see setFont() for more documentation
];

// SVG bounds seems to be malfunctioning for Safari 5. Since we don't have a reproducible test machine for
// fast iteration, we'll guess the user agent and use DOM bounds instead of SVG.
// Hopefully the two constraints rule out any future Safari versions (fairly safe, but not impossible!)
const useDOMAsFastBounds = window.navigator.userAgent.includes('like Gecko) Version/5') && window.navigator.userAgent.includes('Safari/');
export default class Text extends Paintable(Node) {
  // The string to display

  // The font with which to display the text.
  // (scenery-internal)
  // (scenery-internal)
  // Whether the text is rendered as HTML or not. if defined (in a subtype constructor), use that value instead
  // The actual string displayed (can have non-breaking spaces and embedding marks rewritten).
  // When this is null, its value needs to be recomputed
  static STRING_PROPERTY_NAME = STRING_PROPERTY_NAME;
  static STRING_PROPERTY_TANDEM_NAME = STRING_PROPERTY_NAME;

  /**
   * @param string - See setString() for more documentation
   * @param [options] - Text-specific options are documented in TEXT_OPTION_KEYS above, and can be provided
   *                             along-side options for Node
   */
  constructor(string, options) {
    assert && assert(options === undefined || Object.getPrototypeOf(options) === Object.prototype, 'Extra prototype on Node options object is a code smell');
    super();

    // We'll initialize this by mutating.
    this._stringProperty = new TinyForwardingProperty('', true, this.onStringPropertyChange.bind(this));
    this._font = Font.DEFAULT;
    this._boundsMethod = 'hybrid';
    this._isHTML = false; // TODO: clean this up
    this._cachedRenderedText = null;
    const definedOptions = extendDefined({
      fill: '#000000',
      // Default to black filled string

      // phet-io
      tandem: Tandem.OPTIONAL,
      tandemNameSuffix: 'Text',
      phetioType: Text.TextIO,
      phetioVisiblePropertyInstrumented: false
    }, options);
    assert && assert(!definedOptions.hasOwnProperty('string') && !definedOptions.hasOwnProperty(Text.STRING_PROPERTY_TANDEM_NAME), 'provide string and stringProperty through constructor arg please');
    if (typeof string === 'string' || typeof string === 'number') {
      definedOptions.string = string;
    } else {
      definedOptions.stringProperty = string;
    }
    this.mutate(definedOptions);
    this.invalidateSupportedRenderers(); // takes care of setting up supported renderers
  }

  mutate(options) {
    if (assert && options && options.hasOwnProperty('string') && options.hasOwnProperty(STRING_PROPERTY_NAME)) {
      assert && assert(options.stringProperty.value === options.string, 'If both string and stringProperty are provided, then values should match');
    }
    return super.mutate(options);
  }

  /**
   * Sets the string displayed by our node.
   *
   * @param string - The string to display. If it's a number, it will be cast to a string
   */
  setString(string) {
    assert && assert(string !== null && string !== undefined, 'String should be defined and non-null. Use the empty string if needed.');

    // cast it to a string (for numbers, etc., and do it before the change guard so we don't accidentally trigger on non-changed string)
    string = `${string}`;
    this._stringProperty.set(string);
    return this;
  }
  set string(value) {
    this.setString(value);
  }
  get string() {
    return this.getString();
  }

  /**
   * Returns the string displayed by our text Node.
   *
   * NOTE: If a number was provided to setString(), it will not be returned as a number here.
   */
  getString() {
    return this._stringProperty.value;
  }

  /**
   * Returns a potentially modified version of this.string, where spaces are replaced with non-breaking spaces,
   * and embedding marks are potentially simplified.
   */
  getRenderedText() {
    if (this._cachedRenderedText === null) {
      // Using the non-breaking space (&nbsp;) encoded as 0x00A0 in UTF-8
      this._cachedRenderedText = this.string.replace(' ', '\xA0');
      if (platform.edge) {
        // Simplify embedding marks to work around an Edge bug, see https://github.com/phetsims/scenery/issues/520
        this._cachedRenderedText = Text.simplifyEmbeddingMarks(this._cachedRenderedText);
      }
    }
    return this._cachedRenderedText;
  }
  get renderedText() {
    return this.getRenderedText();
  }

  /**
   * Called when our string Property changes values.
   */
  onStringPropertyChange() {
    this._cachedRenderedText = null;
    const stateLen = this._drawables.length;
    for (let i = 0; i < stateLen; i++) {
      this._drawables[i].markDirtyText();
    }
    this.invalidateText();
  }

  /**
   * See documentation for Node.setVisibleProperty, except this is for the text string.
   */
  setStringProperty(newTarget) {
    return this._stringProperty.setTargetProperty(this, Text.STRING_PROPERTY_TANDEM_NAME, newTarget);
  }
  set stringProperty(property) {
    this.setStringProperty(property);
  }
  get stringProperty() {
    return this.getStringProperty();
  }

  /**
   * Like Node.getVisibleProperty(), but for the text string. Note this is not the same as the Property provided in
   * setStringProperty. Thus is the nature of TinyForwardingProperty.
   */
  getStringProperty() {
    return this._stringProperty;
  }

  /**
   * See documentation and comments in Node.initializePhetioObject
   */
  initializePhetioObject(baseOptions, config) {
    // Track this, so we only override our stringProperty once.
    const wasInstrumented = this.isPhetioInstrumented();
    super.initializePhetioObject(baseOptions, config);
    if (Tandem.PHET_IO_ENABLED && !wasInstrumented && this.isPhetioInstrumented()) {
      this._stringProperty.initializePhetio(this, Text.STRING_PROPERTY_TANDEM_NAME, () => {
        return new StringProperty(this.string, combineOptions({
          // by default, texts should be readonly. Editable texts most likely pass in editable Properties from i18n model Properties, see https://github.com/phetsims/scenery/issues/1443
          phetioReadOnly: true,
          tandem: this.tandem.createTandem(Text.STRING_PROPERTY_TANDEM_NAME),
          phetioDocumentation: 'Property for the displayed text'
        }, config.stringPropertyOptions));
      });
    }
  }

  /**
   * Sets the method that is used to determine bounds from the text.
   *
   * Possible values:
   * - 'fast' - Measures using SVG, can be inaccurate. Can't be rendered in Canvas.
   * - 'fastCanvas' - Like 'fast', but allows rendering in Canvas.
   * - 'accurate' - Recursively renders to a Canvas to accurately determine bounds. Slow, but works with all renderers.
   * - 'hybrid' - [default] Cache SVG height, and uses Canvas measureText for the width.
   *
   * TODO: deprecate fast/fastCanvas options?
   *
   * NOTE: Most of these are unfortunately not hard guarantees that content is all inside of the returned bounds.
   *       'accurate' should probably be the only one where that guarantee can be assumed. Things like cyrillic in
   *       italic, combining marks and other unicode features can fail to be detected. This is particularly relevant
   *       for the height, as certain stacked accent marks or descenders can go outside of the prescribed range,
   *       and fast/canvasCanvas/hybrid will always return the same vertical bounds (top and bottom) for a given font
   *       when the text isn't the empty string.
   */
  setBoundsMethod(method) {
    assert && assert(method === 'fast' || method === 'fastCanvas' || method === 'accurate' || method === 'hybrid', 'Unknown Text boundsMethod');
    if (method !== this._boundsMethod) {
      this._boundsMethod = method;
      this.invalidateSupportedRenderers();
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyBounds();
      }
      this.invalidateText();
      this.rendererSummaryRefreshEmitter.emit(); // whether our self bounds are valid may have changed
    }

    return this;
  }
  set boundsMethod(value) {
    this.setBoundsMethod(value);
  }
  get boundsMethod() {
    return this.getBoundsMethod();
  }

  /**
   * Returns the current method to estimate the bounds of the text. See setBoundsMethod() for more information.
   */
  getBoundsMethod() {
    return this._boundsMethod;
  }

  /**
   * Returns a bitmask representing the supported renderers for the current configuration of the Text node.
   *
   * @returns - A bitmask that includes supported renderers, see Renderer for details.
   */
  getTextRendererBitmask() {
    let bitmask = 0;

    // canvas support (fast bounds may leak out of dirty rectangles)
    if (this._boundsMethod !== 'fast' && !this._isHTML) {
      bitmask |= Renderer.bitmaskCanvas;
    }
    if (!this._isHTML) {
      bitmask |= Renderer.bitmaskSVG;
    }

    // fill and stroke will determine whether we have DOM text support
    bitmask |= Renderer.bitmaskDOM;
    return bitmask;
  }

  /**
   * Triggers a check and update for what renderers the current configuration supports.
   * This should be called whenever something that could potentially change supported renderers happen (which can
   * be isHTML, boundsMethod, etc.)
   */
  invalidateSupportedRenderers() {
    this.setRendererBitmask(this.getFillRendererBitmask() & this.getStrokeRendererBitmask() & this.getTextRendererBitmask());
  }

  /**
   * Notifies that something about the text's potential bounds have changed (different string, different stroke or font,
   * etc.)
   */
  invalidateText() {
    this.invalidateSelf();

    // TODO: consider replacing this with a general dirty flag notification, and have DOM update bounds every frame?
    const stateLen = this._drawables.length;
    for (let i = 0; i < stateLen; i++) {
      this._drawables[i].markDirtyBounds();
    }

    // we may have changed renderers if parameters were changed!
    this.invalidateSupportedRenderers();
  }

  /**
   * Computes a more efficient selfBounds for our Text.
   *
   * @returns - Whether the self bounds changed.
   */
  updateSelfBounds() {
    // TODO: don't create another Bounds2 object just for this!
    let selfBounds;

    // investigate http://mudcu.be/journal/2011/01/html5-typographic-metrics/
    if (this._isHTML || useDOMAsFastBounds && this._boundsMethod !== 'accurate') {
      selfBounds = TextBounds.approximateDOMBounds(this._font, this.getDOMTextNode());
    } else if (this._boundsMethod === 'hybrid') {
      selfBounds = TextBounds.approximateHybridBounds(this._font, this.renderedText);
    } else if (this._boundsMethod === 'accurate') {
      selfBounds = TextBounds.accurateCanvasBounds(this);
    } else {
      assert && assert(this._boundsMethod === 'fast' || this._boundsMethod === 'fastCanvas');
      selfBounds = TextBounds.approximateSVGBounds(this._font, this.renderedText);
    }

    // for now, just add extra on, ignoring the possibility of mitered joints passing beyond
    if (this.hasStroke()) {
      selfBounds.dilate(this.getLineWidth() / 2);
    }
    const changed = !selfBounds.equals(this.selfBoundsProperty._value);
    if (changed) {
      this.selfBoundsProperty._value.set(selfBounds);
    }
    return changed;
  }

  /**
   * Called from (and overridden in) the Paintable trait, invalidates our current stroke, triggering recomputation of
   * anything that depended on the old stroke's value. (scenery-internal)
   */
  invalidateStroke() {
    // stroke can change both the bounds and renderer
    this.invalidateText();
    super.invalidateStroke();
  }

  /**
   * Called from (and overridden in) the Paintable trait, invalidates our current fill, triggering recomputation of
   * anything that depended on the old fill's value. (scenery-internal)
   */
  invalidateFill() {
    // fill type can change the renderer (gradient/fill not supported by DOM)
    this.invalidateText();
    super.invalidateFill();
  }

  /**
   * Draws the current Node's self representation, assuming the wrapper's Canvas context is already in the local
   * coordinate frame of this node.
   *
   * @param wrapper
   * @param matrix - The transformation matrix already applied to the context.
   */
  canvasPaintSelf(wrapper, matrix) {
    //TODO: Have a separate method for this, instead of touching the prototype. Can make 'this' references too easily.
    TextCanvasDrawable.prototype.paintCanvas(wrapper, this, matrix);
  }

  /**
   * Creates a DOM drawable for this Text. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createDOMDrawable(renderer, instance) {
    // @ts-expect-error
    return TextDOMDrawable.createFromPool(renderer, instance);
  }

  /**
   * Creates a SVG drawable for this Text. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createSVGDrawable(renderer, instance) {
    // @ts-expect-error
    return TextSVGDrawable.createFromPool(renderer, instance);
  }

  /**
   * Creates a Canvas drawable for this Text. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createCanvasDrawable(renderer, instance) {
    // @ts-expect-error
    return TextCanvasDrawable.createFromPool(renderer, instance);
  }

  /**
   * Returns a DOM element that contains the specified string. (scenery-internal)
   *
   * This is needed since we have to handle HTML text differently.
   */
  getDOMTextNode() {
    if (this._isHTML) {
      const span = document.createElement('span');
      span.innerHTML = this.string;
      return span;
    } else {
      return document.createTextNode(this.renderedText);
    }
  }

  /**
   * Returns a bounding box that should contain all self content in the local coordinate frame (our normal self bounds
   * aren't guaranteed this for Text)
   *
   * We need to add additional padding around the text when the text is in a container that could clip things badly
   * if the text is larger than the normal bounds computation.
   */
  getSafeSelfBounds() {
    const expansionFactor = 1; // we use a new bounding box with a new size of size * ( 1 + 2 * expansionFactor )

    const selfBounds = this.getSelfBounds();

    // NOTE: we'll keep this as an estimate for the bounds including stroke miters
    return selfBounds.dilatedXY(expansionFactor * selfBounds.width, expansionFactor * selfBounds.height);
  }

  /**
   * Sets the font of the Text node.
   *
   * This can either be a Scenery Font object, or a string. The string format is described by Font's constructor, and
   * is basically the CSS3 font shortcut format. If a string is provided, it will be wrapped with a new (immutable)
   * Scenery Font object.
   */
  setFont(font) {
    // We need to detect whether things have updated in a different way depending on whether we are passed a string
    // or a Font object.
    const changed = font !== (typeof font === 'string' ? this._font.toCSS() : this._font);
    if (changed) {
      // Wrap so that our _font is of type {Font}
      this._font = typeof font === 'string' ? Font.fromCSS(font) : font;
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyFont();
      }
      this.invalidateText();
    }
    return this;
  }
  set font(value) {
    this.setFont(value);
  }
  get font() {
    return this.getFont();
  }

  /**
   * Returns a string representation of the current Font.
   *
   * This returns the CSS3 font shortcut that is a possible input to setFont(). See Font's constructor for detailed
   * information on the ordering of information.
   *
   * NOTE: If a Font object was provided to setFont(), this will not currently return it.
   * TODO: Can we refactor so we can have access to (a) the Font object, and possibly (b) the initially provided value.
   */
  getFont() {
    return this._font.getFont();
  }

  /**
   * Sets the weight of this node's font.
   *
   * The font weight supports the following options:
   *   'normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900',
   *   or a number that when cast to a string will be one of the strings above.
   */
  setFontWeight(weight) {
    return this.setFont(this._font.copy({
      weight: weight
    }));
  }
  set fontWeight(value) {
    this.setFontWeight(value);
  }
  get fontWeight() {
    return this.getFontWeight();
  }

  /**
   * Returns the weight of this node's font, see setFontWeight() for details.
   *
   * NOTE: If a numeric weight was passed in, it has been cast to a string, and a string will be returned here.
   */
  getFontWeight() {
    return this._font.getWeight();
  }

  /**
   * Sets the family of this node's font.
   *
   * @param family - A comma-separated list of families, which can include generic families (preferably at
   *                 the end) such as 'serif', 'sans-serif', 'cursive', 'fantasy' and 'monospace'. If there
   *                 is any question about escaping (such as spaces in a font name), the family should be
   *                 surrounded by double quotes.
   */
  setFontFamily(family) {
    return this.setFont(this._font.copy({
      family: family
    }));
  }
  set fontFamily(value) {
    this.setFontFamily(value);
  }
  get fontFamily() {
    return this.getFontFamily();
  }

  /**
   * Returns the family of this node's font, see setFontFamily() for details.
   */
  getFontFamily() {
    return this._font.getFamily();
  }

  /**
   * Sets the stretch of this node's font.
   *
   * The font stretch supports the following options:
   *   'normal', 'ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed',
   *   'semi-expanded', 'expanded', 'extra-expanded' or 'ultra-expanded'
   */
  setFontStretch(stretch) {
    return this.setFont(this._font.copy({
      stretch: stretch
    }));
  }
  set fontStretch(value) {
    this.setFontStretch(value);
  }
  get fontStretch() {
    return this.getFontStretch();
  }

  /**
   * Returns the stretch of this node's font, see setFontStretch() for details.
   */
  getFontStretch() {
    return this._font.getStretch();
  }

  /**
   * Sets the style of this node's font.
   *
   * The font style supports the following options: 'normal', 'italic' or 'oblique'
   */
  setFontStyle(style) {
    return this.setFont(this._font.copy({
      style: style
    }));
  }
  set fontStyle(value) {
    this.setFontStyle(value);
  }
  get fontStyle() {
    return this.getFontStyle();
  }

  /**
   * Returns the style of this node's font, see setFontStyle() for details.
   */
  getFontStyle() {
    return this._font.getStyle();
  }

  /**
   * Sets the size of this node's font.
   *
   * The size can either be a number (created as a quantity of 'px'), or any general CSS font-size string (for
   * example, '30pt', '5em', etc.)
   */
  setFontSize(size) {
    return this.setFont(this._font.copy({
      size: size
    }));
  }
  set fontSize(value) {
    this.setFontSize(value);
  }
  get fontSize() {
    return this.getFontSize();
  }

  /**
   * Returns the size of this node's font, see setFontSize() for details.
   *
   * NOTE: If a numeric size was passed in, it has been converted to a string with 'px', and a string will be
   * returned here.
   */
  getFontSize() {
    return this._font.getSize();
  }

  /**
   * Whether this Node itself is painted (displays something itself).
   */
  isPainted() {
    // Always true for Text nodes
    return true;
  }

  /**
   * Whether this Node's selfBounds are considered to be valid (always containing the displayed self content
   * of this node). Meant to be overridden in subtypes when this can change (e.g. Text).
   *
   * If this value would potentially change, please trigger the event 'selfBoundsValid'.
   */
  areSelfBoundsValid() {
    return this._boundsMethod === 'accurate';
  }

  /**
   * Override for extra information in the debugging output (from Display.getDebugHTML()). (scenery-internal)
   */
  getDebugHTMLExtras() {
    return ` "${escapeHTML(this.renderedText)}"${this._isHTML ? ' (html)' : ''}`;
  }
  dispose() {
    super.dispose();
    this._stringProperty.dispose();
  }

  /**
   * Replaces embedding mark characters with visible strings. Useful for debugging for strings with embedding marks.
   *
   * @returns - With embedding marks replaced.
   */
  static embeddedDebugString(string) {
    return string.replace(/\u202a/g, '[LTR]').replace(/\u202b/g, '[RTL]').replace(/\u202c/g, '[POP]');
  }

  /**
   * Returns a (potentially) modified string where embedding marks have been simplified.
   *
   * This simplification wouldn't usually be necessary, but we need to prevent cases like
   * https://github.com/phetsims/scenery/issues/520 where Edge decides to turn [POP][LTR] (after another [LTR]) into
   * a 'box' character, when nothing should be rendered.
   *
   * This will remove redundant nesting:
   *   e.g. [LTR][LTR]boo[POP][POP] => [LTR]boo[POP])
   * and will also combine adjacent directions:
   *   e.g. [LTR]Mail[POP][LTR]Man[POP] => [LTR]MailMan[Pop]
   *
   * Note that it will NOT combine in this way if there was a space between the two LTRs:
   *   e.g. [LTR]Mail[POP] [LTR]Man[Pop])
   * as in the general case, we'll want to preserve the break there between embeddings.
   *
   * TODO: A stack-based implementation that doesn't create a bunch of objects/closures would be nice for performance.
   */
  static simplifyEmbeddingMarks(string) {
    // First, we'll convert the string into a tree form, where each node is either a string object OR an object of the
    // node type { dir: {LTR||RTL}, children: {Array.<node>}, parent: {null|node} }. Thus each LTR...POP and RTL...POP
    // become a node with their interiors becoming children.

    // Root node (no direction, so we preserve root LTR/RTLs)
    const root = {
      dir: null,
      children: [],
      parent: null
    };
    let current = root;
    for (let i = 0; i < string.length; i++) {
      const chr = string.charAt(i);

      // Push a direction
      if (chr === LTR || chr === RTL) {
        const node = {
          dir: chr,
          children: [],
          parent: current
        };
        current.children.push(node);
        current = node;
      }
      // Pop a direction
      else if (chr === POP) {
        assert && assert(current.parent, `Bad nesting of embedding marks: ${Text.embeddedDebugString(string)}`);
        current = current.parent;
      }
      // Append characters to the current direction
      else {
        current.children.push(chr);
      }
    }
    assert && assert(current === root, `Bad nesting of embedding marks: ${Text.embeddedDebugString(string)}`);

    // Remove redundant nesting (e.g. [LTR][LTR]...[POP][POP])
    function collapseNesting(node) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        const child = node.children[i];
        if (typeof child !== 'string' && node.dir === child.dir) {
          node.children.splice(i, 1, ...child.children);
        }
      }
    }

    // Remove overridden nesting (e.g. [LTR][RTL]...[POP][POP]), since the outer one is not needed
    function collapseUnnecessary(node) {
      if (node.children.length === 1 && typeof node.children[0] !== 'string' && node.children[0].dir) {
        node.dir = node.children[0].dir;
        node.children = node.children[0].children;
      }
    }

    // Collapse adjacent matching dirs, e.g. [LTR]...[POP][LTR]...[POP]
    function collapseAdjacent(node) {
      for (let i = node.children.length - 1; i >= 1; i--) {
        const previousChild = node.children[i - 1];
        const child = node.children[i];
        if (typeof child !== 'string' && typeof previousChild !== 'string' && child.dir && previousChild.dir === child.dir) {
          previousChild.children = previousChild.children.concat(child.children);
          node.children.splice(i, 1);

          // Now try to collapse adjacent items in the child, since we combined children arrays
          collapseAdjacent(previousChild);
        }
      }
    }

    // Simplifies the tree using the above functions
    function simplify(node) {
      if (typeof node !== 'string') {
        for (let i = 0; i < node.children.length; i++) {
          simplify(node.children[i]);
        }
        collapseUnnecessary(node);
        collapseNesting(node);
        collapseAdjacent(node);
      }
      return node;
    }

    // Turns a tree into a string
    function stringify(node) {
      if (typeof node === 'string') {
        return node;
      }
      const childString = node.children.map(stringify).join('');
      if (node.dir) {
        return `${node.dir + childString}\u202c`;
      } else {
        return childString;
      }
    }
    return stringify(simplify(root));
  }
}

/**
 * {Array.<string>} - String keys for all of the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */
Text.prototype._mutatorKeys = [...PAINTABLE_OPTION_KEYS, ...TEXT_OPTION_KEYS, ...Node.prototype._mutatorKeys];

/**
 * {Array.<String>} - List of all dirty flags that should be available on drawables created from this node (or
 *                    subtype). Given a flag (e.g. radius), it indicates the existence of a function
 *                    drawable.markDirtyRadius() that will indicate to the drawable that the radius has changed.
 * (scenery-internal)
 * @override
 */
Text.prototype.drawableMarkFlags = [...Node.prototype.drawableMarkFlags, ...PAINTABLE_DRAWABLE_MARK_FLAGS, 'text', 'font', 'bounds'];
scenery.register('Text', Text);

// Unicode embedding marks that we can combine to work around the Edge issue.
// See https://github.com/phetsims/scenery/issues/520
const LTR = '\u202a';
const RTL = '\u202b';
const POP = '\u202c';

// Initialize computation of hybrid text
TextBounds.initializeTextBounds();
Text.TextIO = new IOType('TextIO', {
  valueType: Text,
  supertype: Node.NodeIO,
  documentation: 'Text that is displayed in the simulation. TextIO has a nested PropertyIO.&lt;String&gt; for ' + 'the current string value.'
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdQcm9wZXJ0eSIsIlRpbnlGb3J3YXJkaW5nUHJvcGVydHkiLCJlc2NhcGVIVE1MIiwiZXh0ZW5kRGVmaW5lZCIsInBsYXRmb3JtIiwiVGFuZGVtIiwiSU9UeXBlIiwiRm9udCIsIk5vZGUiLCJQYWludGFibGUiLCJQQUlOVEFCTEVfRFJBV0FCTEVfTUFSS19GTEFHUyIsIlBBSU5UQUJMRV9PUFRJT05fS0VZUyIsIlJlbmRlcmVyIiwic2NlbmVyeSIsIlRleHRCb3VuZHMiLCJUZXh0Q2FudmFzRHJhd2FibGUiLCJUZXh0RE9NRHJhd2FibGUiLCJUZXh0U1ZHRHJhd2FibGUiLCJjb21iaW5lT3B0aW9ucyIsIlNUUklOR19QUk9QRVJUWV9OQU1FIiwiVEVYVF9PUFRJT05fS0VZUyIsInVzZURPTUFzRmFzdEJvdW5kcyIsIndpbmRvdyIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImluY2x1ZGVzIiwiVGV4dCIsIlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSIsImNvbnN0cnVjdG9yIiwic3RyaW5nIiwib3B0aW9ucyIsImFzc2VydCIsInVuZGVmaW5lZCIsIk9iamVjdCIsImdldFByb3RvdHlwZU9mIiwicHJvdG90eXBlIiwiX3N0cmluZ1Byb3BlcnR5Iiwib25TdHJpbmdQcm9wZXJ0eUNoYW5nZSIsImJpbmQiLCJfZm9udCIsIkRFRkFVTFQiLCJfYm91bmRzTWV0aG9kIiwiX2lzSFRNTCIsIl9jYWNoZWRSZW5kZXJlZFRleHQiLCJkZWZpbmVkT3B0aW9ucyIsImZpbGwiLCJ0YW5kZW0iLCJPUFRJT05BTCIsInRhbmRlbU5hbWVTdWZmaXgiLCJwaGV0aW9UeXBlIiwiVGV4dElPIiwicGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkIiwiaGFzT3duUHJvcGVydHkiLCJzdHJpbmdQcm9wZXJ0eSIsIm11dGF0ZSIsImludmFsaWRhdGVTdXBwb3J0ZWRSZW5kZXJlcnMiLCJ2YWx1ZSIsInNldFN0cmluZyIsInNldCIsImdldFN0cmluZyIsImdldFJlbmRlcmVkVGV4dCIsInJlcGxhY2UiLCJlZGdlIiwic2ltcGxpZnlFbWJlZGRpbmdNYXJrcyIsInJlbmRlcmVkVGV4dCIsInN0YXRlTGVuIiwiX2RyYXdhYmxlcyIsImxlbmd0aCIsImkiLCJtYXJrRGlydHlUZXh0IiwiaW52YWxpZGF0ZVRleHQiLCJzZXRTdHJpbmdQcm9wZXJ0eSIsIm5ld1RhcmdldCIsInNldFRhcmdldFByb3BlcnR5IiwicHJvcGVydHkiLCJnZXRTdHJpbmdQcm9wZXJ0eSIsImluaXRpYWxpemVQaGV0aW9PYmplY3QiLCJiYXNlT3B0aW9ucyIsImNvbmZpZyIsIndhc0luc3RydW1lbnRlZCIsImlzUGhldGlvSW5zdHJ1bWVudGVkIiwiUEhFVF9JT19FTkFCTEVEIiwiaW5pdGlhbGl6ZVBoZXRpbyIsInBoZXRpb1JlYWRPbmx5IiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInN0cmluZ1Byb3BlcnR5T3B0aW9ucyIsInNldEJvdW5kc01ldGhvZCIsIm1ldGhvZCIsIm1hcmtEaXJ0eUJvdW5kcyIsInJlbmRlcmVyU3VtbWFyeVJlZnJlc2hFbWl0dGVyIiwiZW1pdCIsImJvdW5kc01ldGhvZCIsImdldEJvdW5kc01ldGhvZCIsImdldFRleHRSZW5kZXJlckJpdG1hc2siLCJiaXRtYXNrIiwiYml0bWFza0NhbnZhcyIsImJpdG1hc2tTVkciLCJiaXRtYXNrRE9NIiwic2V0UmVuZGVyZXJCaXRtYXNrIiwiZ2V0RmlsbFJlbmRlcmVyQml0bWFzayIsImdldFN0cm9rZVJlbmRlcmVyQml0bWFzayIsImludmFsaWRhdGVTZWxmIiwidXBkYXRlU2VsZkJvdW5kcyIsInNlbGZCb3VuZHMiLCJhcHByb3hpbWF0ZURPTUJvdW5kcyIsImdldERPTVRleHROb2RlIiwiYXBwcm94aW1hdGVIeWJyaWRCb3VuZHMiLCJhY2N1cmF0ZUNhbnZhc0JvdW5kcyIsImFwcHJveGltYXRlU1ZHQm91bmRzIiwiaGFzU3Ryb2tlIiwiZGlsYXRlIiwiZ2V0TGluZVdpZHRoIiwiY2hhbmdlZCIsImVxdWFscyIsInNlbGZCb3VuZHNQcm9wZXJ0eSIsIl92YWx1ZSIsImludmFsaWRhdGVTdHJva2UiLCJpbnZhbGlkYXRlRmlsbCIsImNhbnZhc1BhaW50U2VsZiIsIndyYXBwZXIiLCJtYXRyaXgiLCJwYWludENhbnZhcyIsImNyZWF0ZURPTURyYXdhYmxlIiwicmVuZGVyZXIiLCJpbnN0YW5jZSIsImNyZWF0ZUZyb21Qb29sIiwiY3JlYXRlU1ZHRHJhd2FibGUiLCJjcmVhdGVDYW52YXNEcmF3YWJsZSIsInNwYW4iLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJpbm5lckhUTUwiLCJjcmVhdGVUZXh0Tm9kZSIsImdldFNhZmVTZWxmQm91bmRzIiwiZXhwYW5zaW9uRmFjdG9yIiwiZ2V0U2VsZkJvdW5kcyIsImRpbGF0ZWRYWSIsIndpZHRoIiwiaGVpZ2h0Iiwic2V0Rm9udCIsImZvbnQiLCJ0b0NTUyIsImZyb21DU1MiLCJtYXJrRGlydHlGb250IiwiZ2V0Rm9udCIsInNldEZvbnRXZWlnaHQiLCJ3ZWlnaHQiLCJjb3B5IiwiZm9udFdlaWdodCIsImdldEZvbnRXZWlnaHQiLCJnZXRXZWlnaHQiLCJzZXRGb250RmFtaWx5IiwiZmFtaWx5IiwiZm9udEZhbWlseSIsImdldEZvbnRGYW1pbHkiLCJnZXRGYW1pbHkiLCJzZXRGb250U3RyZXRjaCIsInN0cmV0Y2giLCJmb250U3RyZXRjaCIsImdldEZvbnRTdHJldGNoIiwiZ2V0U3RyZXRjaCIsInNldEZvbnRTdHlsZSIsInN0eWxlIiwiZm9udFN0eWxlIiwiZ2V0Rm9udFN0eWxlIiwiZ2V0U3R5bGUiLCJzZXRGb250U2l6ZSIsInNpemUiLCJmb250U2l6ZSIsImdldEZvbnRTaXplIiwiZ2V0U2l6ZSIsImlzUGFpbnRlZCIsImFyZVNlbGZCb3VuZHNWYWxpZCIsImdldERlYnVnSFRNTEV4dHJhcyIsImRpc3Bvc2UiLCJlbWJlZGRlZERlYnVnU3RyaW5nIiwicm9vdCIsImRpciIsImNoaWxkcmVuIiwicGFyZW50IiwiY3VycmVudCIsImNociIsImNoYXJBdCIsIkxUUiIsIlJUTCIsIm5vZGUiLCJwdXNoIiwiUE9QIiwiY29sbGFwc2VOZXN0aW5nIiwiY2hpbGQiLCJzcGxpY2UiLCJjb2xsYXBzZVVubmVjZXNzYXJ5IiwiY29sbGFwc2VBZGphY2VudCIsInByZXZpb3VzQ2hpbGQiLCJjb25jYXQiLCJzaW1wbGlmeSIsInN0cmluZ2lmeSIsImNoaWxkU3RyaW5nIiwibWFwIiwiam9pbiIsIl9tdXRhdG9yS2V5cyIsImRyYXdhYmxlTWFya0ZsYWdzIiwicmVnaXN0ZXIiLCJpbml0aWFsaXplVGV4dEJvdW5kcyIsInZhbHVlVHlwZSIsInN1cGVydHlwZSIsIk5vZGVJTyIsImRvY3VtZW50YXRpb24iXSwic291cmNlcyI6WyJUZXh0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERpc3BsYXlzIHRleHQgdGhhdCBjYW4gYmUgZmlsbGVkL3N0cm9rZWQuXHJcbiAqXHJcbiAqIEZvciBtYW55IGZvbnQvdGV4dC1yZWxhdGVkIHByb3BlcnRpZXMsIGl0J3MgaGVscGZ1bCB0byB1bmRlcnN0YW5kIHRoZSBDU1MgZXF1aXZhbGVudHMgKGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtZm9udHMvKS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBTdHJpbmdQcm9wZXJ0eSwgeyBTdHJpbmdQcm9wZXJ0eU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1N0cmluZ1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRpbnlGb3J3YXJkaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW55Rm9yd2FyZGluZ1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IGVzY2FwZUhUTUwgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2VzY2FwZUhUTUwuanMnO1xyXG5pbXBvcnQgZXh0ZW5kRGVmaW5lZCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZXh0ZW5kRGVmaW5lZC5qcyc7XHJcbmltcG9ydCBwbGF0Zm9ybSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvcGxhdGZvcm0uanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IHsgQ2FudmFzQ29udGV4dFdyYXBwZXIsIENhbnZhc1NlbGZEcmF3YWJsZSwgRE9NU2VsZkRyYXdhYmxlLCBGb250LCBGb250U3RyZXRjaCwgRm9udFN0eWxlLCBGb250V2VpZ2h0LCBJbnN0YW5jZSwgTm9kZSwgTm9kZU9wdGlvbnMsIFBhaW50YWJsZSwgUEFJTlRBQkxFX0RSQVdBQkxFX01BUktfRkxBR1MsIFBBSU5UQUJMRV9PUFRJT05fS0VZUywgUGFpbnRhYmxlT3B0aW9ucywgUmVuZGVyZXIsIHNjZW5lcnksIFNWR1NlbGZEcmF3YWJsZSwgVGV4dEJvdW5kcywgVGV4dENhbnZhc0RyYXdhYmxlLCBUZXh0RE9NRHJhd2FibGUsIFRleHRTVkdEcmF3YWJsZSwgVFRleHREcmF3YWJsZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBQcm9wZXJ0eU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5cclxuY29uc3QgU1RSSU5HX1BST1BFUlRZX05BTUUgPSAnc3RyaW5nUHJvcGVydHknOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhZC1zaW0tdGV4dFxyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRFWFRfT1BUSU9OX0tFWVMgPSBbXHJcbiAgJ2JvdW5kc01ldGhvZCcsIC8vIHtzdHJpbmd9IC0gU2V0cyBob3cgYm91bmRzIGFyZSBkZXRlcm1pbmVkIGZvciB0ZXh0LCBzZWUgc2V0Qm91bmRzTWV0aG9kKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gIFNUUklOR19QUk9QRVJUWV9OQU1FLCAvLyB7UHJvcGVydHkuPHN0cmluZz58bnVsbH0gLSBTZXRzIGZvcndhcmRpbmcgb2YgdGhlIHN0cmluZ1Byb3BlcnR5LCBzZWUgc2V0U3RyaW5nUHJvcGVydHkoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ3N0cmluZycsIC8vIHtzdHJpbmd8bnVtYmVyfSAtIFNldHMgdGhlIHN0cmluZyB0byBiZSBkaXNwbGF5ZWQgYnkgdGhpcyBUZXh0LCBzZWUgc2V0U3RyaW5nKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdmb250JywgLy8ge0ZvbnR8c3RyaW5nfSAtIFNldHMgdGhlIGZvbnQgdXNlZCBmb3IgdGhlIHRleHQsIHNlZSBzZXRGb250KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdmb250V2VpZ2h0JywgLy8ge3N0cmluZ3xudW1iZXJ9IC0gU2V0cyB0aGUgd2VpZ2h0IG9mIHRoZSBjdXJyZW50IGZvbnQsIHNlZSBzZXRGb250KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdmb250RmFtaWx5JywgLy8ge3N0cmluZ30gLSBTZXRzIHRoZSBmYW1pbHkgb2YgdGhlIGN1cnJlbnQgZm9udCwgc2VlIHNldEZvbnQoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ2ZvbnRTdHJldGNoJywgLy8ge3N0cmluZ30gLSBTZXRzIHRoZSBzdHJldGNoIG9mIHRoZSBjdXJyZW50IGZvbnQsIHNlZSBzZXRGb250KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdmb250U3R5bGUnLCAvLyB7c3RyaW5nfSAtIFNldHMgdGhlIHN0eWxlIG9mIHRoZSBjdXJyZW50IGZvbnQsIHNlZSBzZXRGb250KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdmb250U2l6ZScgLy8ge3N0cmluZ3xudW1iZXJ9IC0gU2V0cyB0aGUgc2l6ZSBvZiB0aGUgY3VycmVudCBmb250LCBzZWUgc2V0Rm9udCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuXTtcclxuXHJcbi8vIFNWRyBib3VuZHMgc2VlbXMgdG8gYmUgbWFsZnVuY3Rpb25pbmcgZm9yIFNhZmFyaSA1LiBTaW5jZSB3ZSBkb24ndCBoYXZlIGEgcmVwcm9kdWNpYmxlIHRlc3QgbWFjaGluZSBmb3JcclxuLy8gZmFzdCBpdGVyYXRpb24sIHdlJ2xsIGd1ZXNzIHRoZSB1c2VyIGFnZW50IGFuZCB1c2UgRE9NIGJvdW5kcyBpbnN0ZWFkIG9mIFNWRy5cclxuLy8gSG9wZWZ1bGx5IHRoZSB0d28gY29uc3RyYWludHMgcnVsZSBvdXQgYW55IGZ1dHVyZSBTYWZhcmkgdmVyc2lvbnMgKGZhaXJseSBzYWZlLCBidXQgbm90IGltcG9zc2libGUhKVxyXG5jb25zdCB1c2VET01Bc0Zhc3RCb3VuZHMgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcyggJ2xpa2UgR2Vja28pIFZlcnNpb24vNScgKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcyggJ1NhZmFyaS8nICk7XHJcblxyXG5leHBvcnQgdHlwZSBUZXh0Qm91bmRzTWV0aG9kID0gJ2Zhc3QnIHwgJ2Zhc3RDYW52YXMnIHwgJ2FjY3VyYXRlJyB8ICdoeWJyaWQnO1xyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGJvdW5kc01ldGhvZD86IFRleHRCb3VuZHNNZXRob2Q7XHJcbiAgc3RyaW5nUHJvcGVydHk/OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+IHwgbnVsbDtcclxuICBzdHJpbmc/OiBzdHJpbmcgfCBudW1iZXI7XHJcbiAgZm9udD86IEZvbnQgfCBzdHJpbmc7XHJcbiAgZm9udFdlaWdodD86IHN0cmluZyB8IG51bWJlcjtcclxuICBmb250RmFtaWx5Pzogc3RyaW5nO1xyXG4gIGZvbnRTdHJldGNoPzogc3RyaW5nO1xyXG4gIGZvbnRTdHlsZT86IHN0cmluZztcclxuICBmb250U2l6ZT86IHN0cmluZyB8IG51bWJlcjtcclxuICBzdHJpbmdQcm9wZXJ0eU9wdGlvbnM/OiBQcm9wZXJ0eU9wdGlvbnM8c3RyaW5nPjtcclxufTtcclxudHlwZSBQYXJlbnRPcHRpb25zID0gUGFpbnRhYmxlT3B0aW9ucyAmIE5vZGVPcHRpb25zO1xyXG5leHBvcnQgdHlwZSBUZXh0T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGFyZW50T3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRleHQgZXh0ZW5kcyBQYWludGFibGUoIE5vZGUgKSB7XHJcblxyXG4gIC8vIFRoZSBzdHJpbmcgdG8gZGlzcGxheVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgX3N0cmluZ1Byb3BlcnR5OiBUaW55Rm9yd2FyZGluZ1Byb3BlcnR5PHN0cmluZz47XHJcblxyXG4gIC8vIFRoZSBmb250IHdpdGggd2hpY2ggdG8gZGlzcGxheSB0aGUgdGV4dC5cclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICBwdWJsaWMgX2ZvbnQ6IEZvbnQ7XHJcblxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIHB1YmxpYyBfYm91bmRzTWV0aG9kOiBUZXh0Qm91bmRzTWV0aG9kO1xyXG5cclxuICAvLyBXaGV0aGVyIHRoZSB0ZXh0IGlzIHJlbmRlcmVkIGFzIEhUTUwgb3Igbm90LiBpZiBkZWZpbmVkIChpbiBhIHN1YnR5cGUgY29uc3RydWN0b3IpLCB1c2UgdGhhdCB2YWx1ZSBpbnN0ZWFkXHJcbiAgcHJpdmF0ZSBfaXNIVE1MOiBib29sZWFuO1xyXG5cclxuICAvLyBUaGUgYWN0dWFsIHN0cmluZyBkaXNwbGF5ZWQgKGNhbiBoYXZlIG5vbi1icmVha2luZyBzcGFjZXMgYW5kIGVtYmVkZGluZyBtYXJrcyByZXdyaXR0ZW4pLlxyXG4gIC8vIFdoZW4gdGhpcyBpcyBudWxsLCBpdHMgdmFsdWUgbmVlZHMgdG8gYmUgcmVjb21wdXRlZFxyXG4gIHByaXZhdGUgX2NhY2hlZFJlbmRlcmVkVGV4dDogc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTVFJJTkdfUFJPUEVSVFlfTkFNRSA9IFNUUklOR19QUk9QRVJUWV9OQU1FO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU1RSSU5HX1BST1BFUlRZX1RBTkRFTV9OQU1FID0gU1RSSU5HX1BST1BFUlRZX05BTUU7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBzdHJpbmcgLSBTZWUgc2V0U3RyaW5nKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICAqIEBwYXJhbSBbb3B0aW9uc10gLSBUZXh0LXNwZWNpZmljIG9wdGlvbnMgYXJlIGRvY3VtZW50ZWQgaW4gVEVYVF9PUFRJT05fS0VZUyBhYm92ZSwgYW5kIGNhbiBiZSBwcm92aWRlZFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbG9uZy1zaWRlIG9wdGlvbnMgZm9yIE5vZGVcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHN0cmluZzogc3RyaW5nIHwgbnVtYmVyIHwgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwgb3B0aW9ucz86IFRleHRPcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucyA9PT0gdW5kZWZpbmVkIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZiggb3B0aW9ucyApID09PSBPYmplY3QucHJvdG90eXBlLFxyXG4gICAgICAnRXh0cmEgcHJvdG90eXBlIG9uIE5vZGUgb3B0aW9ucyBvYmplY3QgaXMgYSBjb2RlIHNtZWxsJyApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gV2UnbGwgaW5pdGlhbGl6ZSB0aGlzIGJ5IG11dGF0aW5nLlxyXG4gICAgdGhpcy5fc3RyaW5nUHJvcGVydHkgPSBuZXcgVGlueUZvcndhcmRpbmdQcm9wZXJ0eSggJycsIHRydWUsIHRoaXMub25TdHJpbmdQcm9wZXJ0eUNoYW5nZS5iaW5kKCB0aGlzICkgKTtcclxuICAgIHRoaXMuX2ZvbnQgPSBGb250LkRFRkFVTFQ7XHJcbiAgICB0aGlzLl9ib3VuZHNNZXRob2QgPSAnaHlicmlkJztcclxuICAgIHRoaXMuX2lzSFRNTCA9IGZhbHNlOyAvLyBUT0RPOiBjbGVhbiB0aGlzIHVwXHJcbiAgICB0aGlzLl9jYWNoZWRSZW5kZXJlZFRleHQgPSBudWxsO1xyXG5cclxuICAgIGNvbnN0IGRlZmluZWRPcHRpb25zID0gZXh0ZW5kRGVmaW5lZCgge1xyXG4gICAgICBmaWxsOiAnIzAwMDAwMCcsIC8vIERlZmF1bHQgdG8gYmxhY2sgZmlsbGVkIHN0cmluZ1xyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRJT05BTCxcclxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ1RleHQnLFxyXG4gICAgICBwaGV0aW9UeXBlOiBUZXh0LlRleHRJTyxcclxuICAgICAgcGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFkZWZpbmVkT3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ3N0cmluZycgKSAmJiAhZGVmaW5lZE9wdGlvbnMuaGFzT3duUHJvcGVydHkoIFRleHQuU1RSSU5HX1BST1BFUlRZX1RBTkRFTV9OQU1FICksXHJcbiAgICAgICdwcm92aWRlIHN0cmluZyBhbmQgc3RyaW5nUHJvcGVydHkgdGhyb3VnaCBjb25zdHJ1Y3RvciBhcmcgcGxlYXNlJyApO1xyXG5cclxuICAgIGlmICggdHlwZW9mIHN0cmluZyA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHN0cmluZyA9PT0gJ251bWJlcicgKSB7XHJcbiAgICAgIGRlZmluZWRPcHRpb25zLnN0cmluZyA9IHN0cmluZztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBkZWZpbmVkT3B0aW9ucy5zdHJpbmdQcm9wZXJ0eSA9IHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm11dGF0ZSggZGVmaW5lZE9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmludmFsaWRhdGVTdXBwb3J0ZWRSZW5kZXJlcnMoKTsgLy8gdGFrZXMgY2FyZSBvZiBzZXR0aW5nIHVwIHN1cHBvcnRlZCByZW5kZXJlcnNcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBtdXRhdGUoIG9wdGlvbnM/OiBUZXh0T3B0aW9ucyApOiB0aGlzIHtcclxuXHJcbiAgICBpZiAoIGFzc2VydCAmJiBvcHRpb25zICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdzdHJpbmcnICkgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggU1RSSU5HX1BST1BFUlRZX05BTUUgKSApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5zdHJpbmdQcm9wZXJ0eSEudmFsdWUgPT09IG9wdGlvbnMuc3RyaW5nLCAnSWYgYm90aCBzdHJpbmcgYW5kIHN0cmluZ1Byb3BlcnR5IGFyZSBwcm92aWRlZCwgdGhlbiB2YWx1ZXMgc2hvdWxkIG1hdGNoJyApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN1cGVyLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgc3RyaW5nIGRpc3BsYXllZCBieSBvdXIgbm9kZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzdHJpbmcgLSBUaGUgc3RyaW5nIHRvIGRpc3BsYXkuIElmIGl0J3MgYSBudW1iZXIsIGl0IHdpbGwgYmUgY2FzdCB0byBhIHN0cmluZ1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRTdHJpbmcoIHN0cmluZzogc3RyaW5nIHwgbnVtYmVyICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3RyaW5nICE9PSBudWxsICYmIHN0cmluZyAhPT0gdW5kZWZpbmVkLCAnU3RyaW5nIHNob3VsZCBiZSBkZWZpbmVkIGFuZCBub24tbnVsbC4gVXNlIHRoZSBlbXB0eSBzdHJpbmcgaWYgbmVlZGVkLicgKTtcclxuXHJcbiAgICAvLyBjYXN0IGl0IHRvIGEgc3RyaW5nIChmb3IgbnVtYmVycywgZXRjLiwgYW5kIGRvIGl0IGJlZm9yZSB0aGUgY2hhbmdlIGd1YXJkIHNvIHdlIGRvbid0IGFjY2lkZW50YWxseSB0cmlnZ2VyIG9uIG5vbi1jaGFuZ2VkIHN0cmluZylcclxuICAgIHN0cmluZyA9IGAke3N0cmluZ31gO1xyXG5cclxuICAgIHRoaXMuX3N0cmluZ1Byb3BlcnR5LnNldCggc3RyaW5nICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHN0cmluZyggdmFsdWU6IHN0cmluZyB8IG51bWJlciApIHsgdGhpcy5zZXRTdHJpbmcoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBzdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZ2V0U3RyaW5nKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3RyaW5nIGRpc3BsYXllZCBieSBvdXIgdGV4dCBOb2RlLlxyXG4gICAqXHJcbiAgICogTk9URTogSWYgYSBudW1iZXIgd2FzIHByb3ZpZGVkIHRvIHNldFN0cmluZygpLCBpdCB3aWxsIG5vdCBiZSByZXR1cm5lZCBhcyBhIG51bWJlciBoZXJlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRTdHJpbmcoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl9zdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBwb3RlbnRpYWxseSBtb2RpZmllZCB2ZXJzaW9uIG9mIHRoaXMuc3RyaW5nLCB3aGVyZSBzcGFjZXMgYXJlIHJlcGxhY2VkIHdpdGggbm9uLWJyZWFraW5nIHNwYWNlcyxcclxuICAgKiBhbmQgZW1iZWRkaW5nIG1hcmtzIGFyZSBwb3RlbnRpYWxseSBzaW1wbGlmaWVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRSZW5kZXJlZFRleHQoKTogc3RyaW5nIHtcclxuICAgIGlmICggdGhpcy5fY2FjaGVkUmVuZGVyZWRUZXh0ID09PSBudWxsICkge1xyXG4gICAgICAvLyBVc2luZyB0aGUgbm9uLWJyZWFraW5nIHNwYWNlICgmbmJzcDspIGVuY29kZWQgYXMgMHgwMEEwIGluIFVURi04XHJcbiAgICAgIHRoaXMuX2NhY2hlZFJlbmRlcmVkVGV4dCA9IHRoaXMuc3RyaW5nLnJlcGxhY2UoICcgJywgJ1xceEEwJyApO1xyXG5cclxuICAgICAgaWYgKCBwbGF0Zm9ybS5lZGdlICkge1xyXG4gICAgICAgIC8vIFNpbXBsaWZ5IGVtYmVkZGluZyBtYXJrcyB0byB3b3JrIGFyb3VuZCBhbiBFZGdlIGJ1Zywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy81MjBcclxuICAgICAgICB0aGlzLl9jYWNoZWRSZW5kZXJlZFRleHQgPSBUZXh0LnNpbXBsaWZ5RW1iZWRkaW5nTWFya3MoIHRoaXMuX2NhY2hlZFJlbmRlcmVkVGV4dCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlZFJlbmRlcmVkVGV4dDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgcmVuZGVyZWRUZXh0KCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmdldFJlbmRlcmVkVGV4dCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIG91ciBzdHJpbmcgUHJvcGVydHkgY2hhbmdlcyB2YWx1ZXMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvblN0cmluZ1Byb3BlcnR5Q2hhbmdlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5fY2FjaGVkUmVuZGVyZWRUZXh0ID0gbnVsbDtcclxuXHJcbiAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xyXG4gICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVFRleHREcmF3YWJsZSApLm1hcmtEaXJ0eVRleHQoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmludmFsaWRhdGVUZXh0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZG9jdW1lbnRhdGlvbiBmb3IgTm9kZS5zZXRWaXNpYmxlUHJvcGVydHksIGV4Y2VwdCB0aGlzIGlzIGZvciB0aGUgdGV4dCBzdHJpbmcuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFN0cmluZ1Byb3BlcnR5KCBuZXdUYXJnZXQ6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4gfCBudWxsICk6IHRoaXMge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0cmluZ1Byb3BlcnR5LnNldFRhcmdldFByb3BlcnR5KCB0aGlzLCBUZXh0LlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSwgbmV3VGFyZ2V0IGFzIFRQcm9wZXJ0eTxzdHJpbmc+ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHN0cmluZ1Byb3BlcnR5KCBwcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiB8IG51bGwgKSB7IHRoaXMuc2V0U3RyaW5nUHJvcGVydHkoIHByb3BlcnR5ICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBzdHJpbmdQcm9wZXJ0eSgpOiBUUHJvcGVydHk8c3RyaW5nPiB7IHJldHVybiB0aGlzLmdldFN0cmluZ1Byb3BlcnR5KCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogTGlrZSBOb2RlLmdldFZpc2libGVQcm9wZXJ0eSgpLCBidXQgZm9yIHRoZSB0ZXh0IHN0cmluZy4gTm90ZSB0aGlzIGlzIG5vdCB0aGUgc2FtZSBhcyB0aGUgUHJvcGVydHkgcHJvdmlkZWQgaW5cclxuICAgKiBzZXRTdHJpbmdQcm9wZXJ0eS4gVGh1cyBpcyB0aGUgbmF0dXJlIG9mIFRpbnlGb3J3YXJkaW5nUHJvcGVydHkuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFN0cmluZ1Byb3BlcnR5KCk6IFRQcm9wZXJ0eTxzdHJpbmc+IHtcclxuICAgIHJldHVybiB0aGlzLl9zdHJpbmdQcm9wZXJ0eTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBkb2N1bWVudGF0aW9uIGFuZCBjb21tZW50cyBpbiBOb2RlLmluaXRpYWxpemVQaGV0aW9PYmplY3RcclxuICAgKi9cclxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgaW5pdGlhbGl6ZVBoZXRpb09iamVjdCggYmFzZU9wdGlvbnM6IFBhcnRpYWw8UGhldGlvT2JqZWN0T3B0aW9ucz4sIGNvbmZpZzogVGV4dE9wdGlvbnMgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gVHJhY2sgdGhpcywgc28gd2Ugb25seSBvdmVycmlkZSBvdXIgc3RyaW5nUHJvcGVydHkgb25jZS5cclxuICAgIGNvbnN0IHdhc0luc3RydW1lbnRlZCA9IHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKTtcclxuXHJcbiAgICBzdXBlci5pbml0aWFsaXplUGhldGlvT2JqZWN0KCBiYXNlT3B0aW9ucywgY29uZmlnICk7XHJcblxyXG4gICAgaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmICF3YXNJbnN0cnVtZW50ZWQgJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpICkge1xyXG4gICAgICB0aGlzLl9zdHJpbmdQcm9wZXJ0eS5pbml0aWFsaXplUGhldGlvKCB0aGlzLCBUZXh0LlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSwgKCkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIG5ldyBTdHJpbmdQcm9wZXJ0eSggdGhpcy5zdHJpbmcsIGNvbWJpbmVPcHRpb25zPFN0cmluZ1Byb3BlcnR5T3B0aW9ucz4oIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGJ5IGRlZmF1bHQsIHRleHRzIHNob3VsZCBiZSByZWFkb25seS4gRWRpdGFibGUgdGV4dHMgbW9zdCBsaWtlbHkgcGFzcyBpbiBlZGl0YWJsZSBQcm9wZXJ0aWVzIGZyb20gaTE4biBtb2RlbCBQcm9wZXJ0aWVzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE0NDNcclxuICAgICAgICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgICAgICAgIHRhbmRlbTogdGhpcy50YW5kZW0uY3JlYXRlVGFuZGVtKCBUZXh0LlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSApLFxyXG4gICAgICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnUHJvcGVydHkgZm9yIHRoZSBkaXNwbGF5ZWQgdGV4dCdcclxuXHJcbiAgICAgICAgICB9LCBjb25maWcuc3RyaW5nUHJvcGVydHlPcHRpb25zICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGRldGVybWluZSBib3VuZHMgZnJvbSB0aGUgdGV4dC5cclxuICAgKlxyXG4gICAqIFBvc3NpYmxlIHZhbHVlczpcclxuICAgKiAtICdmYXN0JyAtIE1lYXN1cmVzIHVzaW5nIFNWRywgY2FuIGJlIGluYWNjdXJhdGUuIENhbid0IGJlIHJlbmRlcmVkIGluIENhbnZhcy5cclxuICAgKiAtICdmYXN0Q2FudmFzJyAtIExpa2UgJ2Zhc3QnLCBidXQgYWxsb3dzIHJlbmRlcmluZyBpbiBDYW52YXMuXHJcbiAgICogLSAnYWNjdXJhdGUnIC0gUmVjdXJzaXZlbHkgcmVuZGVycyB0byBhIENhbnZhcyB0byBhY2N1cmF0ZWx5IGRldGVybWluZSBib3VuZHMuIFNsb3csIGJ1dCB3b3JrcyB3aXRoIGFsbCByZW5kZXJlcnMuXHJcbiAgICogLSAnaHlicmlkJyAtIFtkZWZhdWx0XSBDYWNoZSBTVkcgaGVpZ2h0LCBhbmQgdXNlcyBDYW52YXMgbWVhc3VyZVRleHQgZm9yIHRoZSB3aWR0aC5cclxuICAgKlxyXG4gICAqIFRPRE86IGRlcHJlY2F0ZSBmYXN0L2Zhc3RDYW52YXMgb3B0aW9ucz9cclxuICAgKlxyXG4gICAqIE5PVEU6IE1vc3Qgb2YgdGhlc2UgYXJlIHVuZm9ydHVuYXRlbHkgbm90IGhhcmQgZ3VhcmFudGVlcyB0aGF0IGNvbnRlbnQgaXMgYWxsIGluc2lkZSBvZiB0aGUgcmV0dXJuZWQgYm91bmRzLlxyXG4gICAqICAgICAgICdhY2N1cmF0ZScgc2hvdWxkIHByb2JhYmx5IGJlIHRoZSBvbmx5IG9uZSB3aGVyZSB0aGF0IGd1YXJhbnRlZSBjYW4gYmUgYXNzdW1lZC4gVGhpbmdzIGxpa2UgY3lyaWxsaWMgaW5cclxuICAgKiAgICAgICBpdGFsaWMsIGNvbWJpbmluZyBtYXJrcyBhbmQgb3RoZXIgdW5pY29kZSBmZWF0dXJlcyBjYW4gZmFpbCB0byBiZSBkZXRlY3RlZC4gVGhpcyBpcyBwYXJ0aWN1bGFybHkgcmVsZXZhbnRcclxuICAgKiAgICAgICBmb3IgdGhlIGhlaWdodCwgYXMgY2VydGFpbiBzdGFja2VkIGFjY2VudCBtYXJrcyBvciBkZXNjZW5kZXJzIGNhbiBnbyBvdXRzaWRlIG9mIHRoZSBwcmVzY3JpYmVkIHJhbmdlLFxyXG4gICAqICAgICAgIGFuZCBmYXN0L2NhbnZhc0NhbnZhcy9oeWJyaWQgd2lsbCBhbHdheXMgcmV0dXJuIHRoZSBzYW1lIHZlcnRpY2FsIGJvdW5kcyAodG9wIGFuZCBib3R0b20pIGZvciBhIGdpdmVuIGZvbnRcclxuICAgKiAgICAgICB3aGVuIHRoZSB0ZXh0IGlzbid0IHRoZSBlbXB0eSBzdHJpbmcuXHJcbiAgICovXHJcbiAgcHVibGljIHNldEJvdW5kc01ldGhvZCggbWV0aG9kOiBUZXh0Qm91bmRzTWV0aG9kICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWV0aG9kID09PSAnZmFzdCcgfHwgbWV0aG9kID09PSAnZmFzdENhbnZhcycgfHwgbWV0aG9kID09PSAnYWNjdXJhdGUnIHx8IG1ldGhvZCA9PT0gJ2h5YnJpZCcsICdVbmtub3duIFRleHQgYm91bmRzTWV0aG9kJyApO1xyXG4gICAgaWYgKCBtZXRob2QgIT09IHRoaXMuX2JvdW5kc01ldGhvZCApIHtcclxuICAgICAgdGhpcy5fYm91bmRzTWV0aG9kID0gbWV0aG9kO1xyXG4gICAgICB0aGlzLmludmFsaWRhdGVTdXBwb3J0ZWRSZW5kZXJlcnMoKTtcclxuXHJcbiAgICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcclxuICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVFRleHREcmF3YWJsZSApLm1hcmtEaXJ0eUJvdW5kcygpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVUZXh0KCk7XHJcblxyXG4gICAgICB0aGlzLnJlbmRlcmVyU3VtbWFyeVJlZnJlc2hFbWl0dGVyLmVtaXQoKTsgLy8gd2hldGhlciBvdXIgc2VsZiBib3VuZHMgYXJlIHZhbGlkIG1heSBoYXZlIGNoYW5nZWRcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBib3VuZHNNZXRob2QoIHZhbHVlOiBUZXh0Qm91bmRzTWV0aG9kICkgeyB0aGlzLnNldEJvdW5kc01ldGhvZCggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGJvdW5kc01ldGhvZCgpOiBUZXh0Qm91bmRzTWV0aG9kIHsgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzTWV0aG9kKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCBtZXRob2QgdG8gZXN0aW1hdGUgdGhlIGJvdW5kcyBvZiB0aGUgdGV4dC4gU2VlIHNldEJvdW5kc01ldGhvZCgpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRCb3VuZHNNZXRob2QoKTogVGV4dEJvdW5kc01ldGhvZCB7XHJcbiAgICByZXR1cm4gdGhpcy5fYm91bmRzTWV0aG9kO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGJpdG1hc2sgcmVwcmVzZW50aW5nIHRoZSBzdXBwb3J0ZWQgcmVuZGVyZXJzIGZvciB0aGUgY3VycmVudCBjb25maWd1cmF0aW9uIG9mIHRoZSBUZXh0IG5vZGUuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyAtIEEgYml0bWFzayB0aGF0IGluY2x1ZGVzIHN1cHBvcnRlZCByZW5kZXJlcnMsIHNlZSBSZW5kZXJlciBmb3IgZGV0YWlscy5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgZ2V0VGV4dFJlbmRlcmVyQml0bWFzaygpOiBudW1iZXIge1xyXG4gICAgbGV0IGJpdG1hc2sgPSAwO1xyXG5cclxuICAgIC8vIGNhbnZhcyBzdXBwb3J0IChmYXN0IGJvdW5kcyBtYXkgbGVhayBvdXQgb2YgZGlydHkgcmVjdGFuZ2xlcylcclxuICAgIGlmICggdGhpcy5fYm91bmRzTWV0aG9kICE9PSAnZmFzdCcgJiYgIXRoaXMuX2lzSFRNTCApIHtcclxuICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrQ2FudmFzO1xyXG4gICAgfVxyXG4gICAgaWYgKCAhdGhpcy5faXNIVE1MICkge1xyXG4gICAgICBiaXRtYXNrIHw9IFJlbmRlcmVyLmJpdG1hc2tTVkc7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmlsbCBhbmQgc3Ryb2tlIHdpbGwgZGV0ZXJtaW5lIHdoZXRoZXIgd2UgaGF2ZSBET00gdGV4dCBzdXBwb3J0XHJcbiAgICBiaXRtYXNrIHw9IFJlbmRlcmVyLmJpdG1hc2tET007XHJcblxyXG4gICAgcmV0dXJuIGJpdG1hc2s7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmlnZ2VycyBhIGNoZWNrIGFuZCB1cGRhdGUgZm9yIHdoYXQgcmVuZGVyZXJzIHRoZSBjdXJyZW50IGNvbmZpZ3VyYXRpb24gc3VwcG9ydHMuXHJcbiAgICogVGhpcyBzaG91bGQgYmUgY2FsbGVkIHdoZW5ldmVyIHNvbWV0aGluZyB0aGF0IGNvdWxkIHBvdGVudGlhbGx5IGNoYW5nZSBzdXBwb3J0ZWQgcmVuZGVyZXJzIGhhcHBlbiAod2hpY2ggY2FuXHJcbiAgICogYmUgaXNIVE1MLCBib3VuZHNNZXRob2QsIGV0Yy4pXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGludmFsaWRhdGVTdXBwb3J0ZWRSZW5kZXJlcnMoKTogdm9pZCB7XHJcbiAgICB0aGlzLnNldFJlbmRlcmVyQml0bWFzayggdGhpcy5nZXRGaWxsUmVuZGVyZXJCaXRtYXNrKCkgJiB0aGlzLmdldFN0cm9rZVJlbmRlcmVyQml0bWFzaygpICYgdGhpcy5nZXRUZXh0UmVuZGVyZXJCaXRtYXNrKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE5vdGlmaWVzIHRoYXQgc29tZXRoaW5nIGFib3V0IHRoZSB0ZXh0J3MgcG90ZW50aWFsIGJvdW5kcyBoYXZlIGNoYW5nZWQgKGRpZmZlcmVudCBzdHJpbmcsIGRpZmZlcmVudCBzdHJva2Ugb3IgZm9udCxcclxuICAgKiBldGMuKVxyXG4gICAqL1xyXG4gIHByaXZhdGUgaW52YWxpZGF0ZVRleHQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmludmFsaWRhdGVTZWxmKCk7XHJcblxyXG4gICAgLy8gVE9ETzogY29uc2lkZXIgcmVwbGFjaW5nIHRoaXMgd2l0aCBhIGdlbmVyYWwgZGlydHkgZmxhZyBub3RpZmljYXRpb24sIGFuZCBoYXZlIERPTSB1cGRhdGUgYm91bmRzIGV2ZXJ5IGZyYW1lP1xyXG4gICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcclxuICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRUZXh0RHJhd2FibGUgKS5tYXJrRGlydHlCb3VuZHMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB3ZSBtYXkgaGF2ZSBjaGFuZ2VkIHJlbmRlcmVycyBpZiBwYXJhbWV0ZXJzIHdlcmUgY2hhbmdlZCFcclxuICAgIHRoaXMuaW52YWxpZGF0ZVN1cHBvcnRlZFJlbmRlcmVycygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZXMgYSBtb3JlIGVmZmljaWVudCBzZWxmQm91bmRzIGZvciBvdXIgVGV4dC5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIC0gV2hldGhlciB0aGUgc2VsZiBib3VuZHMgY2hhbmdlZC5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgdXBkYXRlU2VsZkJvdW5kcygpOiBib29sZWFuIHtcclxuICAgIC8vIFRPRE86IGRvbid0IGNyZWF0ZSBhbm90aGVyIEJvdW5kczIgb2JqZWN0IGp1c3QgZm9yIHRoaXMhXHJcbiAgICBsZXQgc2VsZkJvdW5kcztcclxuXHJcbiAgICAvLyBpbnZlc3RpZ2F0ZSBodHRwOi8vbXVkY3UuYmUvam91cm5hbC8yMDExLzAxL2h0bWw1LXR5cG9ncmFwaGljLW1ldHJpY3MvXHJcbiAgICBpZiAoIHRoaXMuX2lzSFRNTCB8fCAoIHVzZURPTUFzRmFzdEJvdW5kcyAmJiB0aGlzLl9ib3VuZHNNZXRob2QgIT09ICdhY2N1cmF0ZScgKSApIHtcclxuICAgICAgc2VsZkJvdW5kcyA9IFRleHRCb3VuZHMuYXBwcm94aW1hdGVET01Cb3VuZHMoIHRoaXMuX2ZvbnQsIHRoaXMuZ2V0RE9NVGV4dE5vZGUoKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuX2JvdW5kc01ldGhvZCA9PT0gJ2h5YnJpZCcgKSB7XHJcbiAgICAgIHNlbGZCb3VuZHMgPSBUZXh0Qm91bmRzLmFwcHJveGltYXRlSHlicmlkQm91bmRzKCB0aGlzLl9mb250LCB0aGlzLnJlbmRlcmVkVGV4dCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuX2JvdW5kc01ldGhvZCA9PT0gJ2FjY3VyYXRlJyApIHtcclxuICAgICAgc2VsZkJvdW5kcyA9IFRleHRCb3VuZHMuYWNjdXJhdGVDYW52YXNCb3VuZHMoIHRoaXMgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9ib3VuZHNNZXRob2QgPT09ICdmYXN0JyB8fCB0aGlzLl9ib3VuZHNNZXRob2QgPT09ICdmYXN0Q2FudmFzJyApO1xyXG4gICAgICBzZWxmQm91bmRzID0gVGV4dEJvdW5kcy5hcHByb3hpbWF0ZVNWR0JvdW5kcyggdGhpcy5fZm9udCwgdGhpcy5yZW5kZXJlZFRleHQgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmb3Igbm93LCBqdXN0IGFkZCBleHRyYSBvbiwgaWdub3JpbmcgdGhlIHBvc3NpYmlsaXR5IG9mIG1pdGVyZWQgam9pbnRzIHBhc3NpbmcgYmV5b25kXHJcbiAgICBpZiAoIHRoaXMuaGFzU3Ryb2tlKCkgKSB7XHJcbiAgICAgIHNlbGZCb3VuZHMuZGlsYXRlKCB0aGlzLmdldExpbmVXaWR0aCgpIC8gMiApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNoYW5nZWQgPSAhc2VsZkJvdW5kcy5lcXVhbHMoIHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5Ll92YWx1ZSApO1xyXG4gICAgaWYgKCBjaGFuZ2VkICkge1xyXG4gICAgICB0aGlzLnNlbGZCb3VuZHNQcm9wZXJ0eS5fdmFsdWUuc2V0KCBzZWxmQm91bmRzICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY2hhbmdlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCBmcm9tIChhbmQgb3ZlcnJpZGRlbiBpbikgdGhlIFBhaW50YWJsZSB0cmFpdCwgaW52YWxpZGF0ZXMgb3VyIGN1cnJlbnQgc3Ryb2tlLCB0cmlnZ2VyaW5nIHJlY29tcHV0YXRpb24gb2ZcclxuICAgKiBhbnl0aGluZyB0aGF0IGRlcGVuZGVkIG9uIHRoZSBvbGQgc3Ryb2tlJ3MgdmFsdWUuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBpbnZhbGlkYXRlU3Ryb2tlKCk6IHZvaWQge1xyXG4gICAgLy8gc3Ryb2tlIGNhbiBjaGFuZ2UgYm90aCB0aGUgYm91bmRzIGFuZCByZW5kZXJlclxyXG4gICAgdGhpcy5pbnZhbGlkYXRlVGV4dCgpO1xyXG5cclxuICAgIHN1cGVyLmludmFsaWRhdGVTdHJva2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCBmcm9tIChhbmQgb3ZlcnJpZGRlbiBpbikgdGhlIFBhaW50YWJsZSB0cmFpdCwgaW52YWxpZGF0ZXMgb3VyIGN1cnJlbnQgZmlsbCwgdHJpZ2dlcmluZyByZWNvbXB1dGF0aW9uIG9mXHJcbiAgICogYW55dGhpbmcgdGhhdCBkZXBlbmRlZCBvbiB0aGUgb2xkIGZpbGwncyB2YWx1ZS4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGludmFsaWRhdGVGaWxsKCk6IHZvaWQge1xyXG4gICAgLy8gZmlsbCB0eXBlIGNhbiBjaGFuZ2UgdGhlIHJlbmRlcmVyIChncmFkaWVudC9maWxsIG5vdCBzdXBwb3J0ZWQgYnkgRE9NKVxyXG4gICAgdGhpcy5pbnZhbGlkYXRlVGV4dCgpO1xyXG5cclxuICAgIHN1cGVyLmludmFsaWRhdGVGaWxsKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEcmF3cyB0aGUgY3VycmVudCBOb2RlJ3Mgc2VsZiByZXByZXNlbnRhdGlvbiwgYXNzdW1pbmcgdGhlIHdyYXBwZXIncyBDYW52YXMgY29udGV4dCBpcyBhbHJlYWR5IGluIHRoZSBsb2NhbFxyXG4gICAqIGNvb3JkaW5hdGUgZnJhbWUgb2YgdGhpcyBub2RlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHdyYXBwZXJcclxuICAgKiBAcGFyYW0gbWF0cml4IC0gVGhlIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBhbHJlYWR5IGFwcGxpZWQgdG8gdGhlIGNvbnRleHQuXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGNhbnZhc1BhaW50U2VsZiggd3JhcHBlcjogQ2FudmFzQ29udGV4dFdyYXBwZXIsIG1hdHJpeDogTWF0cml4MyApOiB2b2lkIHtcclxuICAgIC8vVE9ETzogSGF2ZSBhIHNlcGFyYXRlIG1ldGhvZCBmb3IgdGhpcywgaW5zdGVhZCBvZiB0b3VjaGluZyB0aGUgcHJvdG90eXBlLiBDYW4gbWFrZSAndGhpcycgcmVmZXJlbmNlcyB0b28gZWFzaWx5LlxyXG4gICAgVGV4dENhbnZhc0RyYXdhYmxlLnByb3RvdHlwZS5wYWludENhbnZhcyggd3JhcHBlciwgdGhpcywgbWF0cml4ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgRE9NIGRyYXdhYmxlIGZvciB0aGlzIFRleHQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXHJcbiAgICogQHBhcmFtIGluc3RhbmNlIC0gSW5zdGFuY2Ugb2JqZWN0IHRoYXQgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGRyYXdhYmxlXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZURPTURyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogRE9NU2VsZkRyYXdhYmxlIHtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgIHJldHVybiBUZXh0RE9NRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIFNWRyBkcmF3YWJsZSBmb3IgdGhpcyBUZXh0LiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIEBwYXJhbSByZW5kZXJlciAtIEluIHRoZSBiaXRtYXNrIGZvcm1hdCBzcGVjaWZpZWQgYnkgUmVuZGVyZXIsIHdoaWNoIG1heSBjb250YWluIGFkZGl0aW9uYWwgYml0IGZsYWdzLlxyXG4gICAqIEBwYXJhbSBpbnN0YW5jZSAtIEluc3RhbmNlIG9iamVjdCB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBkcmF3YWJsZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBjcmVhdGVTVkdEcmF3YWJsZSggcmVuZGVyZXI6IG51bWJlciwgaW5zdGFuY2U6IEluc3RhbmNlICk6IFNWR1NlbGZEcmF3YWJsZSB7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICByZXR1cm4gVGV4dFNWR0RyYXdhYmxlLmNyZWF0ZUZyb21Qb29sKCByZW5kZXJlciwgaW5zdGFuY2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBDYW52YXMgZHJhd2FibGUgZm9yIHRoaXMgVGV4dC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcmVuZGVyZXIgLSBJbiB0aGUgYml0bWFzayBmb3JtYXQgc3BlY2lmaWVkIGJ5IFJlbmRlcmVyLCB3aGljaCBtYXkgY29udGFpbiBhZGRpdGlvbmFsIGJpdCBmbGFncy5cclxuICAgKiBAcGFyYW0gaW5zdGFuY2UgLSBJbnN0YW5jZSBvYmplY3QgdGhhdCB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZHJhd2FibGVcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgY3JlYXRlQ2FudmFzRHJhd2FibGUoIHJlbmRlcmVyOiBudW1iZXIsIGluc3RhbmNlOiBJbnN0YW5jZSApOiBDYW52YXNTZWxmRHJhd2FibGUge1xyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgcmV0dXJuIFRleHRDYW52YXNEcmF3YWJsZS5jcmVhdGVGcm9tUG9vbCggcmVuZGVyZXIsIGluc3RhbmNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgRE9NIGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgc3BlY2lmaWVkIHN0cmluZy4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIG5lZWRlZCBzaW5jZSB3ZSBoYXZlIHRvIGhhbmRsZSBIVE1MIHRleHQgZGlmZmVyZW50bHkuXHJcbiAgICovXHJcbiAgcHVibGljIGdldERPTVRleHROb2RlKCk6IEVsZW1lbnQge1xyXG4gICAgaWYgKCB0aGlzLl9pc0hUTUwgKSB7XHJcbiAgICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3BhbicgKTtcclxuICAgICAgc3Bhbi5pbm5lckhUTUwgPSB0aGlzLnN0cmluZztcclxuICAgICAgcmV0dXJuIHNwYW47XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCB0aGlzLnJlbmRlcmVkVGV4dCApIGFzIHVua25vd24gYXMgRWxlbWVudDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBib3VuZGluZyBib3ggdGhhdCBzaG91bGQgY29udGFpbiBhbGwgc2VsZiBjb250ZW50IGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lIChvdXIgbm9ybWFsIHNlbGYgYm91bmRzXHJcbiAgICogYXJlbid0IGd1YXJhbnRlZWQgdGhpcyBmb3IgVGV4dClcclxuICAgKlxyXG4gICAqIFdlIG5lZWQgdG8gYWRkIGFkZGl0aW9uYWwgcGFkZGluZyBhcm91bmQgdGhlIHRleHQgd2hlbiB0aGUgdGV4dCBpcyBpbiBhIGNvbnRhaW5lciB0aGF0IGNvdWxkIGNsaXAgdGhpbmdzIGJhZGx5XHJcbiAgICogaWYgdGhlIHRleHQgaXMgbGFyZ2VyIHRoYW4gdGhlIG5vcm1hbCBib3VuZHMgY29tcHV0YXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGdldFNhZmVTZWxmQm91bmRzKCk6IEJvdW5kczIge1xyXG4gICAgY29uc3QgZXhwYW5zaW9uRmFjdG9yID0gMTsgLy8gd2UgdXNlIGEgbmV3IGJvdW5kaW5nIGJveCB3aXRoIGEgbmV3IHNpemUgb2Ygc2l6ZSAqICggMSArIDIgKiBleHBhbnNpb25GYWN0b3IgKVxyXG5cclxuICAgIGNvbnN0IHNlbGZCb3VuZHMgPSB0aGlzLmdldFNlbGZCb3VuZHMoKTtcclxuXHJcbiAgICAvLyBOT1RFOiB3ZSdsbCBrZWVwIHRoaXMgYXMgYW4gZXN0aW1hdGUgZm9yIHRoZSBib3VuZHMgaW5jbHVkaW5nIHN0cm9rZSBtaXRlcnNcclxuICAgIHJldHVybiBzZWxmQm91bmRzLmRpbGF0ZWRYWSggZXhwYW5zaW9uRmFjdG9yICogc2VsZkJvdW5kcy53aWR0aCwgZXhwYW5zaW9uRmFjdG9yICogc2VsZkJvdW5kcy5oZWlnaHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGZvbnQgb2YgdGhlIFRleHQgbm9kZS5cclxuICAgKlxyXG4gICAqIFRoaXMgY2FuIGVpdGhlciBiZSBhIFNjZW5lcnkgRm9udCBvYmplY3QsIG9yIGEgc3RyaW5nLiBUaGUgc3RyaW5nIGZvcm1hdCBpcyBkZXNjcmliZWQgYnkgRm9udCdzIGNvbnN0cnVjdG9yLCBhbmRcclxuICAgKiBpcyBiYXNpY2FsbHkgdGhlIENTUzMgZm9udCBzaG9ydGN1dCBmb3JtYXQuIElmIGEgc3RyaW5nIGlzIHByb3ZpZGVkLCBpdCB3aWxsIGJlIHdyYXBwZWQgd2l0aCBhIG5ldyAoaW1tdXRhYmxlKVxyXG4gICAqIFNjZW5lcnkgRm9udCBvYmplY3QuXHJcbiAgICovXHJcbiAgcHVibGljIHNldEZvbnQoIGZvbnQ6IEZvbnQgfCBzdHJpbmcgKTogdGhpcyB7XHJcblxyXG4gICAgLy8gV2UgbmVlZCB0byBkZXRlY3Qgd2hldGhlciB0aGluZ3MgaGF2ZSB1cGRhdGVkIGluIGEgZGlmZmVyZW50IHdheSBkZXBlbmRpbmcgb24gd2hldGhlciB3ZSBhcmUgcGFzc2VkIGEgc3RyaW5nXHJcbiAgICAvLyBvciBhIEZvbnQgb2JqZWN0LlxyXG4gICAgY29uc3QgY2hhbmdlZCA9IGZvbnQgIT09ICggKCB0eXBlb2YgZm9udCA9PT0gJ3N0cmluZycgKSA/IHRoaXMuX2ZvbnQudG9DU1MoKSA6IHRoaXMuX2ZvbnQgKTtcclxuICAgIGlmICggY2hhbmdlZCApIHtcclxuICAgICAgLy8gV3JhcCBzbyB0aGF0IG91ciBfZm9udCBpcyBvZiB0eXBlIHtGb250fVxyXG4gICAgICB0aGlzLl9mb250ID0gKCB0eXBlb2YgZm9udCA9PT0gJ3N0cmluZycgKSA/IEZvbnQuZnJvbUNTUyggZm9udCApIDogZm9udDtcclxuXHJcbiAgICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcclxuICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVFRleHREcmF3YWJsZSApLm1hcmtEaXJ0eUZvbnQoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5pbnZhbGlkYXRlVGV4dCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGZvbnQoIHZhbHVlOiBGb250IHwgc3RyaW5nICkgeyB0aGlzLnNldEZvbnQoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBmb250KCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmdldEZvbnQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjdXJyZW50IEZvbnQuXHJcbiAgICpcclxuICAgKiBUaGlzIHJldHVybnMgdGhlIENTUzMgZm9udCBzaG9ydGN1dCB0aGF0IGlzIGEgcG9zc2libGUgaW5wdXQgdG8gc2V0Rm9udCgpLiBTZWUgRm9udCdzIGNvbnN0cnVjdG9yIGZvciBkZXRhaWxlZFxyXG4gICAqIGluZm9ybWF0aW9uIG9uIHRoZSBvcmRlcmluZyBvZiBpbmZvcm1hdGlvbi5cclxuICAgKlxyXG4gICAqIE5PVEU6IElmIGEgRm9udCBvYmplY3Qgd2FzIHByb3ZpZGVkIHRvIHNldEZvbnQoKSwgdGhpcyB3aWxsIG5vdCBjdXJyZW50bHkgcmV0dXJuIGl0LlxyXG4gICAqIFRPRE86IENhbiB3ZSByZWZhY3RvciBzbyB3ZSBjYW4gaGF2ZSBhY2Nlc3MgdG8gKGEpIHRoZSBGb250IG9iamVjdCwgYW5kIHBvc3NpYmx5IChiKSB0aGUgaW5pdGlhbGx5IHByb3ZpZGVkIHZhbHVlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRGb250KCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5fZm9udC5nZXRGb250KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB3ZWlnaHQgb2YgdGhpcyBub2RlJ3MgZm9udC5cclxuICAgKlxyXG4gICAqIFRoZSBmb250IHdlaWdodCBzdXBwb3J0cyB0aGUgZm9sbG93aW5nIG9wdGlvbnM6XHJcbiAgICogICAnbm9ybWFsJywgJ2JvbGQnLCAnYm9sZGVyJywgJ2xpZ2h0ZXInLCAnMTAwJywgJzIwMCcsICczMDAnLCAnNDAwJywgJzUwMCcsICc2MDAnLCAnNzAwJywgJzgwMCcsICc5MDAnLFxyXG4gICAqICAgb3IgYSBudW1iZXIgdGhhdCB3aGVuIGNhc3QgdG8gYSBzdHJpbmcgd2lsbCBiZSBvbmUgb2YgdGhlIHN0cmluZ3MgYWJvdmUuXHJcbiAgICovXHJcbiAgcHVibGljIHNldEZvbnRXZWlnaHQoIHdlaWdodDogRm9udFdlaWdodCB8IG51bWJlciApOiB0aGlzIHtcclxuICAgIHJldHVybiB0aGlzLnNldEZvbnQoIHRoaXMuX2ZvbnQuY29weSgge1xyXG4gICAgICB3ZWlnaHQ6IHdlaWdodFxyXG4gICAgfSApICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGZvbnRXZWlnaHQoIHZhbHVlOiBGb250V2VpZ2h0IHwgbnVtYmVyICkgeyB0aGlzLnNldEZvbnRXZWlnaHQoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBmb250V2VpZ2h0KCk6IEZvbnRXZWlnaHQgeyByZXR1cm4gdGhpcy5nZXRGb250V2VpZ2h0KCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgd2VpZ2h0IG9mIHRoaXMgbm9kZSdzIGZvbnQsIHNlZSBzZXRGb250V2VpZ2h0KCkgZm9yIGRldGFpbHMuXHJcbiAgICpcclxuICAgKiBOT1RFOiBJZiBhIG51bWVyaWMgd2VpZ2h0IHdhcyBwYXNzZWQgaW4sIGl0IGhhcyBiZWVuIGNhc3QgdG8gYSBzdHJpbmcsIGFuZCBhIHN0cmluZyB3aWxsIGJlIHJldHVybmVkIGhlcmUuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEZvbnRXZWlnaHQoKTogRm9udFdlaWdodCB7XHJcbiAgICByZXR1cm4gdGhpcy5fZm9udC5nZXRXZWlnaHQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGZhbWlseSBvZiB0aGlzIG5vZGUncyBmb250LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGZhbWlseSAtIEEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgZmFtaWxpZXMsIHdoaWNoIGNhbiBpbmNsdWRlIGdlbmVyaWMgZmFtaWxpZXMgKHByZWZlcmFibHkgYXRcclxuICAgKiAgICAgICAgICAgICAgICAgdGhlIGVuZCkgc3VjaCBhcyAnc2VyaWYnLCAnc2Fucy1zZXJpZicsICdjdXJzaXZlJywgJ2ZhbnRhc3knIGFuZCAnbW9ub3NwYWNlJy4gSWYgdGhlcmVcclxuICAgKiAgICAgICAgICAgICAgICAgaXMgYW55IHF1ZXN0aW9uIGFib3V0IGVzY2FwaW5nIChzdWNoIGFzIHNwYWNlcyBpbiBhIGZvbnQgbmFtZSksIHRoZSBmYW1pbHkgc2hvdWxkIGJlXHJcbiAgICogICAgICAgICAgICAgICAgIHN1cnJvdW5kZWQgYnkgZG91YmxlIHF1b3Rlcy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0Rm9udEZhbWlseSggZmFtaWx5OiBzdHJpbmcgKTogdGhpcyB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRGb250KCB0aGlzLl9mb250LmNvcHkoIHtcclxuICAgICAgZmFtaWx5OiBmYW1pbHlcclxuICAgIH0gKSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBmb250RmFtaWx5KCB2YWx1ZTogc3RyaW5nICkgeyB0aGlzLnNldEZvbnRGYW1pbHkoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBmb250RmFtaWx5KCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmdldEZvbnRGYW1pbHkoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBmYW1pbHkgb2YgdGhpcyBub2RlJ3MgZm9udCwgc2VlIHNldEZvbnRGYW1pbHkoKSBmb3IgZGV0YWlscy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Rm9udEZhbWlseSgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX2ZvbnQuZ2V0RmFtaWx5KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBzdHJldGNoIG9mIHRoaXMgbm9kZSdzIGZvbnQuXHJcbiAgICpcclxuICAgKiBUaGUgZm9udCBzdHJldGNoIHN1cHBvcnRzIHRoZSBmb2xsb3dpbmcgb3B0aW9uczpcclxuICAgKiAgICdub3JtYWwnLCAndWx0cmEtY29uZGVuc2VkJywgJ2V4dHJhLWNvbmRlbnNlZCcsICdjb25kZW5zZWQnLCAnc2VtaS1jb25kZW5zZWQnLFxyXG4gICAqICAgJ3NlbWktZXhwYW5kZWQnLCAnZXhwYW5kZWQnLCAnZXh0cmEtZXhwYW5kZWQnIG9yICd1bHRyYS1leHBhbmRlZCdcclxuICAgKi9cclxuICBwdWJsaWMgc2V0Rm9udFN0cmV0Y2goIHN0cmV0Y2g6IEZvbnRTdHJldGNoICk6IHRoaXMge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0Rm9udCggdGhpcy5fZm9udC5jb3B5KCB7XHJcbiAgICAgIHN0cmV0Y2g6IHN0cmV0Y2hcclxuICAgIH0gKSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBmb250U3RyZXRjaCggdmFsdWU6IEZvbnRTdHJldGNoICkgeyB0aGlzLnNldEZvbnRTdHJldGNoKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZm9udFN0cmV0Y2goKTogRm9udFN0cmV0Y2ggeyByZXR1cm4gdGhpcy5nZXRGb250U3RyZXRjaCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHN0cmV0Y2ggb2YgdGhpcyBub2RlJ3MgZm9udCwgc2VlIHNldEZvbnRTdHJldGNoKCkgZm9yIGRldGFpbHMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEZvbnRTdHJldGNoKCk6IEZvbnRTdHJldGNoIHtcclxuICAgIHJldHVybiB0aGlzLl9mb250LmdldFN0cmV0Y2goKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHN0eWxlIG9mIHRoaXMgbm9kZSdzIGZvbnQuXHJcbiAgICpcclxuICAgKiBUaGUgZm9udCBzdHlsZSBzdXBwb3J0cyB0aGUgZm9sbG93aW5nIG9wdGlvbnM6ICdub3JtYWwnLCAnaXRhbGljJyBvciAnb2JsaXF1ZSdcclxuICAgKi9cclxuICBwdWJsaWMgc2V0Rm9udFN0eWxlKCBzdHlsZTogRm9udFN0eWxlICk6IHRoaXMge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0Rm9udCggdGhpcy5fZm9udC5jb3B5KCB7XHJcbiAgICAgIHN0eWxlOiBzdHlsZVxyXG4gICAgfSApICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGZvbnRTdHlsZSggdmFsdWU6IEZvbnRTdHlsZSApIHsgdGhpcy5zZXRGb250U3R5bGUoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBmb250U3R5bGUoKTogRm9udFN0eWxlIHsgcmV0dXJuIHRoaXMuZ2V0Rm9udFN0eWxlKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3R5bGUgb2YgdGhpcyBub2RlJ3MgZm9udCwgc2VlIHNldEZvbnRTdHlsZSgpIGZvciBkZXRhaWxzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRGb250U3R5bGUoKTogRm9udFN0eWxlIHtcclxuICAgIHJldHVybiB0aGlzLl9mb250LmdldFN0eWxlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBzaXplIG9mIHRoaXMgbm9kZSdzIGZvbnQuXHJcbiAgICpcclxuICAgKiBUaGUgc2l6ZSBjYW4gZWl0aGVyIGJlIGEgbnVtYmVyIChjcmVhdGVkIGFzIGEgcXVhbnRpdHkgb2YgJ3B4JyksIG9yIGFueSBnZW5lcmFsIENTUyBmb250LXNpemUgc3RyaW5nIChmb3JcclxuICAgKiBleGFtcGxlLCAnMzBwdCcsICc1ZW0nLCBldGMuKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRGb250U2l6ZSggc2l6ZTogc3RyaW5nIHwgbnVtYmVyICk6IHRoaXMge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0Rm9udCggdGhpcy5fZm9udC5jb3B5KCB7XHJcbiAgICAgIHNpemU6IHNpemVcclxuICAgIH0gKSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBmb250U2l6ZSggdmFsdWU6IHN0cmluZyB8IG51bWJlciApIHsgdGhpcy5zZXRGb250U2l6ZSggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGZvbnRTaXplKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmdldEZvbnRTaXplKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc2l6ZSBvZiB0aGlzIG5vZGUncyBmb250LCBzZWUgc2V0Rm9udFNpemUoKSBmb3IgZGV0YWlscy5cclxuICAgKlxyXG4gICAqIE5PVEU6IElmIGEgbnVtZXJpYyBzaXplIHdhcyBwYXNzZWQgaW4sIGl0IGhhcyBiZWVuIGNvbnZlcnRlZCB0byBhIHN0cmluZyB3aXRoICdweCcsIGFuZCBhIHN0cmluZyB3aWxsIGJlXHJcbiAgICogcmV0dXJuZWQgaGVyZS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Rm9udFNpemUoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl9mb250LmdldFNpemUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgdGhpcyBOb2RlIGl0c2VsZiBpcyBwYWludGVkIChkaXNwbGF5cyBzb21ldGhpbmcgaXRzZWxmKS5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgaXNQYWludGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgLy8gQWx3YXlzIHRydWUgZm9yIFRleHQgbm9kZXNcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGlzIE5vZGUncyBzZWxmQm91bmRzIGFyZSBjb25zaWRlcmVkIHRvIGJlIHZhbGlkIChhbHdheXMgY29udGFpbmluZyB0aGUgZGlzcGxheWVkIHNlbGYgY29udGVudFxyXG4gICAqIG9mIHRoaXMgbm9kZSkuIE1lYW50IHRvIGJlIG92ZXJyaWRkZW4gaW4gc3VidHlwZXMgd2hlbiB0aGlzIGNhbiBjaGFuZ2UgKGUuZy4gVGV4dCkuXHJcbiAgICpcclxuICAgKiBJZiB0aGlzIHZhbHVlIHdvdWxkIHBvdGVudGlhbGx5IGNoYW5nZSwgcGxlYXNlIHRyaWdnZXIgdGhlIGV2ZW50ICdzZWxmQm91bmRzVmFsaWQnLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBhcmVTZWxmQm91bmRzVmFsaWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fYm91bmRzTWV0aG9kID09PSAnYWNjdXJhdGUnO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT3ZlcnJpZGUgZm9yIGV4dHJhIGluZm9ybWF0aW9uIGluIHRoZSBkZWJ1Z2dpbmcgb3V0cHV0IChmcm9tIERpc3BsYXkuZ2V0RGVidWdIVE1MKCkpLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0RGVidWdIVE1MRXh0cmFzKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYCBcIiR7ZXNjYXBlSFRNTCggdGhpcy5yZW5kZXJlZFRleHQgKX1cIiR7dGhpcy5faXNIVE1MID8gJyAoaHRtbCknIDogJyd9YDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG5cclxuICAgIHRoaXMuX3N0cmluZ1Byb3BlcnR5LmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcGxhY2VzIGVtYmVkZGluZyBtYXJrIGNoYXJhY3RlcnMgd2l0aCB2aXNpYmxlIHN0cmluZ3MuIFVzZWZ1bCBmb3IgZGVidWdnaW5nIGZvciBzdHJpbmdzIHdpdGggZW1iZWRkaW5nIG1hcmtzLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgLSBXaXRoIGVtYmVkZGluZyBtYXJrcyByZXBsYWNlZC5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGVtYmVkZGVkRGVidWdTdHJpbmcoIHN0cmluZzogc3RyaW5nICk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoIC9cXHUyMDJhL2csICdbTFRSXScgKS5yZXBsYWNlKCAvXFx1MjAyYi9nLCAnW1JUTF0nICkucmVwbGFjZSggL1xcdTIwMmMvZywgJ1tQT1BdJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIChwb3RlbnRpYWxseSkgbW9kaWZpZWQgc3RyaW5nIHdoZXJlIGVtYmVkZGluZyBtYXJrcyBoYXZlIGJlZW4gc2ltcGxpZmllZC5cclxuICAgKlxyXG4gICAqIFRoaXMgc2ltcGxpZmljYXRpb24gd291bGRuJ3QgdXN1YWxseSBiZSBuZWNlc3NhcnksIGJ1dCB3ZSBuZWVkIHRvIHByZXZlbnQgY2FzZXMgbGlrZVxyXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy81MjAgd2hlcmUgRWRnZSBkZWNpZGVzIHRvIHR1cm4gW1BPUF1bTFRSXSAoYWZ0ZXIgYW5vdGhlciBbTFRSXSkgaW50b1xyXG4gICAqIGEgJ2JveCcgY2hhcmFjdGVyLCB3aGVuIG5vdGhpbmcgc2hvdWxkIGJlIHJlbmRlcmVkLlxyXG4gICAqXHJcbiAgICogVGhpcyB3aWxsIHJlbW92ZSByZWR1bmRhbnQgbmVzdGluZzpcclxuICAgKiAgIGUuZy4gW0xUUl1bTFRSXWJvb1tQT1BdW1BPUF0gPT4gW0xUUl1ib29bUE9QXSlcclxuICAgKiBhbmQgd2lsbCBhbHNvIGNvbWJpbmUgYWRqYWNlbnQgZGlyZWN0aW9uczpcclxuICAgKiAgIGUuZy4gW0xUUl1NYWlsW1BPUF1bTFRSXU1hbltQT1BdID0+IFtMVFJdTWFpbE1hbltQb3BdXHJcbiAgICpcclxuICAgKiBOb3RlIHRoYXQgaXQgd2lsbCBOT1QgY29tYmluZSBpbiB0aGlzIHdheSBpZiB0aGVyZSB3YXMgYSBzcGFjZSBiZXR3ZWVuIHRoZSB0d28gTFRSczpcclxuICAgKiAgIGUuZy4gW0xUUl1NYWlsW1BPUF0gW0xUUl1NYW5bUG9wXSlcclxuICAgKiBhcyBpbiB0aGUgZ2VuZXJhbCBjYXNlLCB3ZSdsbCB3YW50IHRvIHByZXNlcnZlIHRoZSBicmVhayB0aGVyZSBiZXR3ZWVuIGVtYmVkZGluZ3MuXHJcbiAgICpcclxuICAgKiBUT0RPOiBBIHN0YWNrLWJhc2VkIGltcGxlbWVudGF0aW9uIHRoYXQgZG9lc24ndCBjcmVhdGUgYSBidW5jaCBvZiBvYmplY3RzL2Nsb3N1cmVzIHdvdWxkIGJlIG5pY2UgZm9yIHBlcmZvcm1hbmNlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgc2ltcGxpZnlFbWJlZGRpbmdNYXJrcyggc3RyaW5nOiBzdHJpbmcgKTogc3RyaW5nIHtcclxuICAgIC8vIEZpcnN0LCB3ZSdsbCBjb252ZXJ0IHRoZSBzdHJpbmcgaW50byBhIHRyZWUgZm9ybSwgd2hlcmUgZWFjaCBub2RlIGlzIGVpdGhlciBhIHN0cmluZyBvYmplY3QgT1IgYW4gb2JqZWN0IG9mIHRoZVxyXG4gICAgLy8gbm9kZSB0eXBlIHsgZGlyOiB7TFRSfHxSVEx9LCBjaGlsZHJlbjoge0FycmF5Ljxub2RlPn0sIHBhcmVudDoge251bGx8bm9kZX0gfS4gVGh1cyBlYWNoIExUUi4uLlBPUCBhbmQgUlRMLi4uUE9QXHJcbiAgICAvLyBiZWNvbWUgYSBub2RlIHdpdGggdGhlaXIgaW50ZXJpb3JzIGJlY29taW5nIGNoaWxkcmVuLlxyXG5cclxuICAgIHR5cGUgRW1iZWROb2RlID0ge1xyXG4gICAgICBkaXI6IG51bGwgfCAnXFx1MjAyYScgfCAnXFx1MjAyYic7XHJcbiAgICAgIGNoaWxkcmVuOiAoIEVtYmVkTm9kZSB8IHN0cmluZyApW107XHJcbiAgICAgIHBhcmVudDogRW1iZWROb2RlIHwgbnVsbDtcclxuICAgIH07XHJcblxyXG4gICAgLy8gUm9vdCBub2RlIChubyBkaXJlY3Rpb24sIHNvIHdlIHByZXNlcnZlIHJvb3QgTFRSL1JUTHMpXHJcbiAgICBjb25zdCByb290ID0ge1xyXG4gICAgICBkaXI6IG51bGwsXHJcbiAgICAgIGNoaWxkcmVuOiBbXSxcclxuICAgICAgcGFyZW50OiBudWxsXHJcbiAgICB9IGFzIEVtYmVkTm9kZTtcclxuICAgIGxldCBjdXJyZW50OiBFbWJlZE5vZGUgPSByb290O1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBjaHIgPSBzdHJpbmcuY2hhckF0KCBpICk7XHJcblxyXG4gICAgICAvLyBQdXNoIGEgZGlyZWN0aW9uXHJcbiAgICAgIGlmICggY2hyID09PSBMVFIgfHwgY2hyID09PSBSVEwgKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IHtcclxuICAgICAgICAgIGRpcjogY2hyLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFtdLFxyXG4gICAgICAgICAgcGFyZW50OiBjdXJyZW50XHJcbiAgICAgICAgfSBhcyBFbWJlZE5vZGU7XHJcbiAgICAgICAgY3VycmVudC5jaGlsZHJlbi5wdXNoKCBub2RlICk7XHJcbiAgICAgICAgY3VycmVudCA9IG5vZGU7XHJcbiAgICAgIH1cclxuICAgICAgLy8gUG9wIGEgZGlyZWN0aW9uXHJcbiAgICAgIGVsc2UgaWYgKCBjaHIgPT09IFBPUCApIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjdXJyZW50LnBhcmVudCwgYEJhZCBuZXN0aW5nIG9mIGVtYmVkZGluZyBtYXJrczogJHtUZXh0LmVtYmVkZGVkRGVidWdTdHJpbmcoIHN0cmluZyApfWAgKTtcclxuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnQhO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIEFwcGVuZCBjaGFyYWN0ZXJzIHRvIHRoZSBjdXJyZW50IGRpcmVjdGlvblxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBjdXJyZW50LmNoaWxkcmVuLnB1c2goIGNociApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjdXJyZW50ID09PSByb290LCBgQmFkIG5lc3Rpbmcgb2YgZW1iZWRkaW5nIG1hcmtzOiAke1RleHQuZW1iZWRkZWREZWJ1Z1N0cmluZyggc3RyaW5nICl9YCApO1xyXG5cclxuICAgIC8vIFJlbW92ZSByZWR1bmRhbnQgbmVzdGluZyAoZS5nLiBbTFRSXVtMVFJdLi4uW1BPUF1bUE9QXSlcclxuICAgIGZ1bmN0aW9uIGNvbGxhcHNlTmVzdGluZyggbm9kZTogRW1iZWROb2RlICk6IHZvaWQge1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IG5vZGUuY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuWyBpIF07XHJcbiAgICAgICAgaWYgKCB0eXBlb2YgY2hpbGQgIT09ICdzdHJpbmcnICYmIG5vZGUuZGlyID09PSBjaGlsZC5kaXIgKSB7XHJcbiAgICAgICAgICBub2RlLmNoaWxkcmVuLnNwbGljZSggaSwgMSwgLi4uY2hpbGQuY2hpbGRyZW4gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBSZW1vdmUgb3ZlcnJpZGRlbiBuZXN0aW5nIChlLmcuIFtMVFJdW1JUTF0uLi5bUE9QXVtQT1BdKSwgc2luY2UgdGhlIG91dGVyIG9uZSBpcyBub3QgbmVlZGVkXHJcbiAgICBmdW5jdGlvbiBjb2xsYXBzZVVubmVjZXNzYXJ5KCBub2RlOiBFbWJlZE5vZGUgKTogdm9pZCB7XHJcbiAgICAgIGlmICggbm9kZS5jaGlsZHJlbi5sZW5ndGggPT09IDEgJiYgdHlwZW9mIG5vZGUuY2hpbGRyZW5bIDAgXSAhPT0gJ3N0cmluZycgJiYgbm9kZS5jaGlsZHJlblsgMCBdLmRpciApIHtcclxuICAgICAgICBub2RlLmRpciA9IG5vZGUuY2hpbGRyZW5bIDAgXS5kaXI7XHJcbiAgICAgICAgbm9kZS5jaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlbjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIENvbGxhcHNlIGFkamFjZW50IG1hdGNoaW5nIGRpcnMsIGUuZy4gW0xUUl0uLi5bUE9QXVtMVFJdLi4uW1BPUF1cclxuICAgIGZ1bmN0aW9uIGNvbGxhcHNlQWRqYWNlbnQoIG5vZGU6IEVtYmVkTm9kZSApOiB2b2lkIHtcclxuICAgICAgZm9yICggbGV0IGkgPSBub2RlLmNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMTsgaS0tICkge1xyXG4gICAgICAgIGNvbnN0IHByZXZpb3VzQ2hpbGQgPSBub2RlLmNoaWxkcmVuWyBpIC0gMSBdO1xyXG4gICAgICAgIGNvbnN0IGNoaWxkID0gbm9kZS5jaGlsZHJlblsgaSBdO1xyXG4gICAgICAgIGlmICggdHlwZW9mIGNoaWxkICE9PSAnc3RyaW5nJyAmJiB0eXBlb2YgcHJldmlvdXNDaGlsZCAhPT0gJ3N0cmluZycgJiYgY2hpbGQuZGlyICYmIHByZXZpb3VzQ2hpbGQuZGlyID09PSBjaGlsZC5kaXIgKSB7XHJcbiAgICAgICAgICBwcmV2aW91c0NoaWxkLmNoaWxkcmVuID0gcHJldmlvdXNDaGlsZC5jaGlsZHJlbi5jb25jYXQoIGNoaWxkLmNoaWxkcmVuICk7XHJcbiAgICAgICAgICBub2RlLmNoaWxkcmVuLnNwbGljZSggaSwgMSApO1xyXG5cclxuICAgICAgICAgIC8vIE5vdyB0cnkgdG8gY29sbGFwc2UgYWRqYWNlbnQgaXRlbXMgaW4gdGhlIGNoaWxkLCBzaW5jZSB3ZSBjb21iaW5lZCBjaGlsZHJlbiBhcnJheXNcclxuICAgICAgICAgIGNvbGxhcHNlQWRqYWNlbnQoIHByZXZpb3VzQ2hpbGQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBTaW1wbGlmaWVzIHRoZSB0cmVlIHVzaW5nIHRoZSBhYm92ZSBmdW5jdGlvbnNcclxuICAgIGZ1bmN0aW9uIHNpbXBsaWZ5KCBub2RlOiBFbWJlZE5vZGUgfCBzdHJpbmcgKTogc3RyaW5nIHwgRW1iZWROb2RlIHtcclxuICAgICAgaWYgKCB0eXBlb2Ygbm9kZSAhPT0gJ3N0cmluZycgKSB7XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgIHNpbXBsaWZ5KCBub2RlLmNoaWxkcmVuWyBpIF0gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbGxhcHNlVW5uZWNlc3NhcnkoIG5vZGUgKTtcclxuICAgICAgICBjb2xsYXBzZU5lc3RpbmcoIG5vZGUgKTtcclxuICAgICAgICBjb2xsYXBzZUFkamFjZW50KCBub2RlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFR1cm5zIGEgdHJlZSBpbnRvIGEgc3RyaW5nXHJcbiAgICBmdW5jdGlvbiBzdHJpbmdpZnkoIG5vZGU6IEVtYmVkTm9kZSB8IHN0cmluZyApOiBzdHJpbmcge1xyXG4gICAgICBpZiAoIHR5cGVvZiBub2RlID09PSAnc3RyaW5nJyApIHtcclxuICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBjaGlsZFN0cmluZyA9IG5vZGUuY2hpbGRyZW4ubWFwKCBzdHJpbmdpZnkgKS5qb2luKCAnJyApO1xyXG4gICAgICBpZiAoIG5vZGUuZGlyICkge1xyXG4gICAgICAgIHJldHVybiBgJHtub2RlLmRpciArIGNoaWxkU3RyaW5nfVxcdTIwMmNgO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBjaGlsZFN0cmluZztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzdHJpbmdpZnkoIHNpbXBsaWZ5KCByb290ICkgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgVGV4dElPOiBJT1R5cGU7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiB7QXJyYXkuPHN0cmluZz59IC0gU3RyaW5nIGtleXMgZm9yIGFsbCBvZiB0aGUgYWxsb3dlZCBvcHRpb25zIHRoYXQgd2lsbCBiZSBzZXQgYnkgbm9kZS5tdXRhdGUoIG9wdGlvbnMgKSwgaW4gdGhlXHJcbiAqIG9yZGVyIHRoZXkgd2lsbCBiZSBldmFsdWF0ZWQgaW4uXHJcbiAqXHJcbiAqIE5PVEU6IFNlZSBOb2RlJ3MgX211dGF0b3JLZXlzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gaG93IHRoaXMgb3BlcmF0ZXMsIGFuZCBwb3RlbnRpYWwgc3BlY2lhbFxyXG4gKiAgICAgICBjYXNlcyB0aGF0IG1heSBhcHBseS5cclxuICovXHJcblRleHQucHJvdG90eXBlLl9tdXRhdG9yS2V5cyA9IFsgLi4uUEFJTlRBQkxFX09QVElPTl9LRVlTLCAuLi5URVhUX09QVElPTl9LRVlTLCAuLi5Ob2RlLnByb3RvdHlwZS5fbXV0YXRvcktleXMgXTtcclxuXHJcbi8qKlxyXG4gKiB7QXJyYXkuPFN0cmluZz59IC0gTGlzdCBvZiBhbGwgZGlydHkgZmxhZ3MgdGhhdCBzaG91bGQgYmUgYXZhaWxhYmxlIG9uIGRyYXdhYmxlcyBjcmVhdGVkIGZyb20gdGhpcyBub2RlIChvclxyXG4gKiAgICAgICAgICAgICAgICAgICAgc3VidHlwZSkuIEdpdmVuIGEgZmxhZyAoZS5nLiByYWRpdXMpLCBpdCBpbmRpY2F0ZXMgdGhlIGV4aXN0ZW5jZSBvZiBhIGZ1bmN0aW9uXHJcbiAqICAgICAgICAgICAgICAgICAgICBkcmF3YWJsZS5tYXJrRGlydHlSYWRpdXMoKSB0aGF0IHdpbGwgaW5kaWNhdGUgdG8gdGhlIGRyYXdhYmxlIHRoYXQgdGhlIHJhZGl1cyBoYXMgY2hhbmdlZC5cclxuICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAqIEBvdmVycmlkZVxyXG4gKi9cclxuVGV4dC5wcm90b3R5cGUuZHJhd2FibGVNYXJrRmxhZ3MgPSBbIC4uLk5vZGUucHJvdG90eXBlLmRyYXdhYmxlTWFya0ZsYWdzLCAuLi5QQUlOVEFCTEVfRFJBV0FCTEVfTUFSS19GTEFHUywgJ3RleHQnLCAnZm9udCcsICdib3VuZHMnIF07XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnVGV4dCcsIFRleHQgKTtcclxuXHJcbi8vIFVuaWNvZGUgZW1iZWRkaW5nIG1hcmtzIHRoYXQgd2UgY2FuIGNvbWJpbmUgdG8gd29yayBhcm91bmQgdGhlIEVkZ2UgaXNzdWUuXHJcbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNTIwXHJcbmNvbnN0IExUUiA9ICdcXHUyMDJhJztcclxuY29uc3QgUlRMID0gJ1xcdTIwMmInO1xyXG5jb25zdCBQT1AgPSAnXFx1MjAyYyc7XHJcblxyXG4vLyBJbml0aWFsaXplIGNvbXB1dGF0aW9uIG9mIGh5YnJpZCB0ZXh0XHJcblRleHRCb3VuZHMuaW5pdGlhbGl6ZVRleHRCb3VuZHMoKTtcclxuXHJcblRleHQuVGV4dElPID0gbmV3IElPVHlwZSggJ1RleHRJTycsIHtcclxuICB2YWx1ZVR5cGU6IFRleHQsXHJcbiAgc3VwZXJ0eXBlOiBOb2RlLk5vZGVJTyxcclxuICBkb2N1bWVudGF0aW9uOiAnVGV4dCB0aGF0IGlzIGRpc3BsYXllZCBpbiB0aGUgc2ltdWxhdGlvbi4gVGV4dElPIGhhcyBhIG5lc3RlZCBQcm9wZXJ0eUlPLiZsdDtTdHJpbmcmZ3Q7IGZvciAnICtcclxuICAgICAgICAgICAgICAgICAndGhlIGN1cnJlbnQgc3RyaW5nIHZhbHVlLidcclxufSApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBaUMsb0NBQW9DO0FBQzFGLE9BQU9DLHNCQUFzQixNQUFNLDRDQUE0QztBQUMvRSxPQUFPQyxVQUFVLE1BQU0scUNBQXFDO0FBQzVELE9BQU9DLGFBQWEsTUFBTSx3Q0FBd0M7QUFDbEUsT0FBT0MsUUFBUSxNQUFNLG1DQUFtQztBQUN4RCxPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLE1BQU0sTUFBTSxvQ0FBb0M7QUFLdkQsU0FBb0VDLElBQUksRUFBZ0RDLElBQUksRUFBZUMsU0FBUyxFQUFFQyw2QkFBNkIsRUFBRUMscUJBQXFCLEVBQW9CQyxRQUFRLEVBQUVDLE9BQU8sRUFBbUJDLFVBQVUsRUFBRUMsa0JBQWtCLEVBQUVDLGVBQWUsRUFBRUMsZUFBZSxRQUF1QixlQUFlO0FBRXhXLFNBQVNDLGNBQWMsUUFBUSxvQ0FBb0M7QUFHbkUsTUFBTUMsb0JBQW9CLEdBQUcsZ0JBQWdCLENBQUMs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