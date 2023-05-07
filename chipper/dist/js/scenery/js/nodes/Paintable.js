// Copyright 2021-2022, University of Colorado Boulder

/**
 * Trait for Nodes that support a standard fill and/or stroke (e.g. Text, Path and Path subtypes).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import { LINE_STYLE_DEFAULT_OPTIONS, LineStyles } from '../../../kite/js/imports.js';
import arrayRemove from '../../../phet-core/js/arrayRemove.js';
import assertHasProperties from '../../../phet-core/js/assertHasProperties.js';
import inheritance from '../../../phet-core/js/inheritance.js';
import platform from '../../../phet-core/js/platform.js';
import memoize from '../../../phet-core/js/memoize.js';
import { Color, Gradient, Node, Paint, PaintDef, Pattern, Renderer, scenery } from '../imports.js';
const isSafari5 = platform.safari5;
const PAINTABLE_OPTION_KEYS = ['fill',
// {PaintDef} - Sets the fill of this Node, see setFill() for documentation.
'fillPickable',
// {boolean} - Sets whether the filled area of the Node will be treated as 'inside'. See setFillPickable()
'stroke',
// {PaintDef} - Sets the stroke of this Node, see setStroke() for documentation.
'strokePickable',
// {boolean} - Sets whether the stroked area of the Node will be treated as 'inside'. See setStrokePickable()
'lineWidth',
// {number} - Sets the width of the stroked area, see setLineWidth for documentation.
'lineCap',
// {string} - Sets the shape of the stroked area at the start/end of the path, see setLineCap() for documentation.
'lineJoin',
// {string} - Sets the shape of the stroked area at joints, see setLineJoin() for documentation.
'miterLimit',
// {number} - Sets when lineJoin will switch from miter to bevel, see setMiterLimit() for documentation.
'lineDash',
// {Array.<number>} - Sets a line-dash pattern for the stroke, see setLineDash() for documentation
'lineDashOffset',
// {number} - Sets the offset of the line-dash from the start of the stroke, see setLineDashOffset()
'cachedPaints' // {Array.<PaintDef>} - Sets which paints should be cached, even if not displayed. See setCachedPaints()
];

const DEFAULT_OPTIONS = {
  fill: null,
  fillPickable: true,
  stroke: null,
  strokePickable: false,
  // Not set initially, but they are the LineStyles defaults
  lineWidth: LINE_STYLE_DEFAULT_OPTIONS.lineWidth,
  lineCap: LINE_STYLE_DEFAULT_OPTIONS.lineCap,
  lineJoin: LINE_STYLE_DEFAULT_OPTIONS.lineJoin,
  lineDashOffset: LINE_STYLE_DEFAULT_OPTIONS.lineDashOffset,
  miterLimit: LINE_STYLE_DEFAULT_OPTIONS.miterLimit
};

// Workaround type since we can't detect mixins in the type system well

const PAINTABLE_DRAWABLE_MARK_FLAGS = ['fill', 'stroke', 'lineWidth', 'lineOptions', 'cachedPaints'];
const Paintable = memoize(type => {
  assert && assert(_.includes(inheritance(type), Node), 'Only Node subtypes should mix Paintable');
  return class PaintableMixin extends type {
    // (scenery-internal)

    // (scenery-internal)

    // (scenery-internal)

    constructor(...args) {
      super(...args);
      assertHasProperties(this, ['_drawables']);
      this._fill = DEFAULT_OPTIONS.fill;
      this._fillPickable = DEFAULT_OPTIONS.fillPickable;
      this._stroke = DEFAULT_OPTIONS.stroke;
      this._strokePickable = DEFAULT_OPTIONS.strokePickable;
      this._cachedPaints = [];
      this._lineDrawingStyles = new LineStyles();
    }

    /**
     * Sets the fill color for the Node.
     *
     * The fill determines the appearance of the interior part of a Path or Text.
     *
     * Please use null for indicating "no fill" (that is the default). Strings and Scenery Color objects can be
     * provided for a single-color flat appearance, and can be wrapped with an Axon Property. Gradients and patterns
     * can also be provided.
     */
    setFill(fill) {
      assert && assert(PaintDef.isPaintDef(fill), 'Invalid fill type');
      if (assert && typeof fill === 'string') {
        Color.checkPaintString(fill);
      }

      // Instance equality used here since it would be more expensive to parse all CSS
      // colors and compare every time the fill changes. Right now, usually we don't have
      // to parse CSS colors. See https://github.com/phetsims/scenery/issues/255
      if (this._fill !== fill) {
        this._fill = fill;
        this.invalidateFill();
      }
      return this;
    }
    set fill(value) {
      this.setFill(value);
    }
    get fill() {
      return this.getFill();
    }

    /**
     * Returns the fill (if any) for this Node.
     */
    getFill() {
      return this._fill;
    }

    /**
     * Returns whether there is a fill applied to this Node.
     */
    hasFill() {
      return this.getFillValue() !== null;
    }

    /**
     * Returns a property-unwrapped fill if applicable.
     */
    getFillValue() {
      const fill = this.getFill();
      return fill instanceof ReadOnlyProperty ? fill.get() : fill;
    }
    get fillValue() {
      return this.getFillValue();
    }

    /**
     * Sets the stroke color for the Node.
     *
     * The stroke determines the appearance of the region along the boundary of the Path or Text. The shape of the
     * stroked area depends on the base shape (that of the Path or Text) and multiple parameters:
     * lineWidth/lineCap/lineJoin/miterLimit/lineDash/lineDashOffset. It will be drawn on top of any fill on the
     * same Node.
     *
     * Please use null for indicating "no stroke" (that is the default). Strings and Scenery Color objects can be
     * provided for a single-color flat appearance, and can be wrapped with an Axon Property. Gradients and patterns
     * can also be provided.
     */
    setStroke(stroke) {
      assert && assert(PaintDef.isPaintDef(stroke), 'Invalid stroke type');
      if (assert && typeof stroke === 'string') {
        Color.checkPaintString(stroke);
      }

      // Instance equality used here since it would be more expensive to parse all CSS
      // colors and compare every time the fill changes. Right now, usually we don't have
      // to parse CSS colors. See https://github.com/phetsims/scenery/issues/255
      if (this._stroke !== stroke) {
        this._stroke = stroke;
        if (assert && stroke instanceof Paint && stroke.transformMatrix) {
          const scaleVector = stroke.transformMatrix.getScaleVector();
          assert(Math.abs(scaleVector.x - scaleVector.y) < 1e-7, 'You cannot specify a pattern or gradient to a stroke that does not have a symmetric scale.');
        }
        this.invalidateStroke();
      }
      return this;
    }
    set stroke(value) {
      this.setStroke(value);
    }
    get stroke() {
      return this.getStroke();
    }

    /**
     * Returns the stroke (if any) for this Node.
     */
    getStroke() {
      return this._stroke;
    }

    /**
     * Returns whether there is a stroke applied to this Node.
     */
    hasStroke() {
      return this.getStrokeValue() !== null;
    }

    /**
     * Returns whether there will appear to be a stroke for this Node. Properly handles the lineWidth:0 case.
     */
    hasPaintableStroke() {
      // Should not be stroked if the lineWidth is 0, see https://github.com/phetsims/scenery/issues/658
      // and https://github.com/phetsims/scenery/issues/523
      return this.hasStroke() && this.getLineWidth() > 0;
    }

    /**
     * Returns a property-unwrapped stroke if applicable.
     */
    getStrokeValue() {
      const stroke = this.getStroke();
      return stroke instanceof ReadOnlyProperty ? stroke.get() : stroke;
    }
    get strokeValue() {
      return this.getStrokeValue();
    }

    /**
     * Sets whether the fill is marked as pickable.
     */
    setFillPickable(pickable) {
      if (this._fillPickable !== pickable) {
        this._fillPickable = pickable;

        // TODO: better way of indicating that only the Node under pointers could have changed, but no paint change is needed?
        this.invalidateFill();
      }
      return this;
    }
    set fillPickable(value) {
      this.setFillPickable(value);
    }
    get fillPickable() {
      return this.isFillPickable();
    }

    /**
     * Returns whether the fill is marked as pickable.
     */
    isFillPickable() {
      return this._fillPickable;
    }

    /**
     * Sets whether the stroke is marked as pickable.
     */
    setStrokePickable(pickable) {
      if (this._strokePickable !== pickable) {
        this._strokePickable = pickable;

        // TODO: better way of indicating that only the Node under pointers could have changed, but no paint change is needed?
        this.invalidateStroke();
      }
      return this;
    }
    set strokePickable(value) {
      this.setStrokePickable(value);
    }
    get strokePickable() {
      return this.isStrokePickable();
    }

    /**
     * Returns whether the stroke is marked as pickable.
     */
    isStrokePickable() {
      return this._strokePickable;
    }

    /**
     * Sets the line width that will be applied to strokes on this Node.
     */
    setLineWidth(lineWidth) {
      assert && assert(lineWidth >= 0, `lineWidth should be non-negative instead of ${lineWidth}`);
      if (this.getLineWidth() !== lineWidth) {
        this._lineDrawingStyles.lineWidth = lineWidth;
        this.invalidateStroke();
        const stateLen = this._drawables.length;
        for (let i = 0; i < stateLen; i++) {
          this._drawables[i].markDirtyLineWidth();
        }
      }
      return this;
    }
    set lineWidth(value) {
      this.setLineWidth(value);
    }
    get lineWidth() {
      return this.getLineWidth();
    }

    /**
     * Returns the line width that would be applied to strokes.
     */
    getLineWidth() {
      return this._lineDrawingStyles.lineWidth;
    }

    /**
     * Sets the line cap style. There are three options:
     * - 'butt' (the default) stops the line at the end point
     * - 'round' draws a semicircular arc around the end point
     * - 'square' draws a square outline around the end point (like butt, but extended by 1/2 line width out)
     */
    setLineCap(lineCap) {
      assert && assert(lineCap === 'butt' || lineCap === 'round' || lineCap === 'square', `lineCap should be one of "butt", "round" or "square", not ${lineCap}`);
      if (this._lineDrawingStyles.lineCap !== lineCap) {
        this._lineDrawingStyles.lineCap = lineCap;
        this.invalidateStroke();
        const stateLen = this._drawables.length;
        for (let i = 0; i < stateLen; i++) {
          this._drawables[i].markDirtyLineOptions();
        }
      }
      return this;
    }
    set lineCap(value) {
      this.setLineCap(value);
    }
    get lineCap() {
      return this.getLineCap();
    }

    /**
     * Returns the line cap style (controls appearance at the start/end of paths)
     */
    getLineCap() {
      return this._lineDrawingStyles.lineCap;
    }

    /**
     * Sets the line join style. There are three options:
     * - 'miter' (default) joins by extending the segments out in a line until they meet. For very sharp
     *           corners, they will be chopped off and will act like 'bevel', depending on what the miterLimit is.
     * - 'round' draws a circular arc to connect the two stroked areas.
     * - 'bevel' connects with a single line segment.
     */
    setLineJoin(lineJoin) {
      assert && assert(lineJoin === 'miter' || lineJoin === 'round' || lineJoin === 'bevel', `lineJoin should be one of "miter", "round" or "bevel", not ${lineJoin}`);
      if (this._lineDrawingStyles.lineJoin !== lineJoin) {
        this._lineDrawingStyles.lineJoin = lineJoin;
        this.invalidateStroke();
        const stateLen = this._drawables.length;
        for (let i = 0; i < stateLen; i++) {
          this._drawables[i].markDirtyLineOptions();
        }
      }
      return this;
    }
    set lineJoin(value) {
      this.setLineJoin(value);
    }
    get lineJoin() {
      return this.getLineJoin();
    }

    /**
     * Returns the current line join style (controls join appearance between drawn segments).
     */
    getLineJoin() {
      return this._lineDrawingStyles.lineJoin;
    }

    /**
     * Sets the miterLimit value. This determines how sharp a corner with lineJoin: 'miter' will need to be before
     * it gets cut off to the 'bevel' behavior.
     */
    setMiterLimit(miterLimit) {
      assert && assert(isFinite(miterLimit), 'miterLimit should be a finite number');
      if (this._lineDrawingStyles.miterLimit !== miterLimit) {
        this._lineDrawingStyles.miterLimit = miterLimit;
        this.invalidateStroke();
        const stateLen = this._drawables.length;
        for (let i = 0; i < stateLen; i++) {
          this._drawables[i].markDirtyLineOptions();
        }
      }
      return this;
    }
    set miterLimit(value) {
      this.setMiterLimit(value);
    }
    get miterLimit() {
      return this.getMiterLimit();
    }

    /**
     * Returns the miterLimit value.
     */
    getMiterLimit() {
      return this._lineDrawingStyles.miterLimit;
    }

    /**
     * Sets the line dash pattern. Should be an array of numbers "on" and "off" alternating. An empty array
     * indicates no dashing.
     */
    setLineDash(lineDash) {
      assert && assert(Array.isArray(lineDash) && lineDash.every(n => typeof n === 'number' && isFinite(n) && n >= 0), 'lineDash should be an array of finite non-negative numbers');
      if (this._lineDrawingStyles.lineDash !== lineDash) {
        this._lineDrawingStyles.lineDash = lineDash || [];
        this.invalidateStroke();
        const stateLen = this._drawables.length;
        for (let i = 0; i < stateLen; i++) {
          this._drawables[i].markDirtyLineOptions();
        }
      }
      return this;
    }
    set lineDash(value) {
      this.setLineDash(value);
    }
    get lineDash() {
      return this.getLineDash();
    }

    /**
     * Gets the line dash pattern. An empty array is the default, indicating no dashing.
     */
    getLineDash() {
      return this._lineDrawingStyles.lineDash;
    }

    /**
     * Returns whether the stroke will be dashed.
     */
    hasLineDash() {
      return !!this._lineDrawingStyles.lineDash.length;
    }

    /**
     * Sets the offset of the line dash pattern from the start of the stroke. Defaults to 0.
     */
    setLineDashOffset(lineDashOffset) {
      assert && assert(isFinite(lineDashOffset), `lineDashOffset should be a number, not ${lineDashOffset}`);
      if (this._lineDrawingStyles.lineDashOffset !== lineDashOffset) {
        this._lineDrawingStyles.lineDashOffset = lineDashOffset;
        this.invalidateStroke();
        const stateLen = this._drawables.length;
        for (let i = 0; i < stateLen; i++) {
          this._drawables[i].markDirtyLineOptions();
        }
      }
      return this;
    }
    set lineDashOffset(value) {
      this.setLineDashOffset(value);
    }
    get lineDashOffset() {
      return this.getLineDashOffset();
    }

    /**
     * Returns the offset of the line dash pattern from the start of the stroke.
     */
    getLineDashOffset() {
      return this._lineDrawingStyles.lineDashOffset;
    }

    /**
     * Sets the LineStyles object (it determines stroke appearance). The passed-in object will be mutated as needed.
     */
    setLineStyles(lineStyles) {
      this._lineDrawingStyles = lineStyles;
      this.invalidateStroke();
      return this;
    }
    set lineStyles(value) {
      this.setLineStyles(value);
    }
    get lineStyles() {
      return this.getLineStyles();
    }

    /**
     * Returns the composite {LineStyles} object, that determines stroke appearance.
     */
    getLineStyles() {
      return this._lineDrawingStyles;
    }

    /**
     * Sets the cached paints to the input array (a defensive copy). Note that it also filters out fills that are
     * not considered paints (e.g. strings, Colors, etc.).
     *
     * When this Node is displayed in SVG, it will force the presence of the cached paint to be stored in the SVG's
     * <defs> element, so that we can switch quickly to use the given paint (instead of having to create it on the
     * SVG-side whenever the switch is made).
     *
     * Also note that duplicate paints are acceptable, and don't need to be filtered out before-hand.
     */
    setCachedPaints(paints) {
      this._cachedPaints = paints.filter(paint => paint instanceof Paint);
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyCachedPaints();
      }
      return this;
    }
    set cachedPaints(value) {
      this.setCachedPaints(value);
    }
    get cachedPaints() {
      return this.getCachedPaints();
    }

    /**
     * Returns the cached paints.
     */
    getCachedPaints() {
      return this._cachedPaints;
    }

    /**
     * Adds a cached paint. Does nothing if paint is just a normal fill (string, Color), but for gradients and
     * patterns, it will be made faster to switch to.
     *
     * When this Node is displayed in SVG, it will force the presence of the cached paint to be stored in the SVG's
     * <defs> element, so that we can switch quickly to use the given paint (instead of having to create it on the
     * SVG-side whenever the switch is made).
     *
     * Also note that duplicate paints are acceptable, and don't need to be filtered out before-hand.
     */
    addCachedPaint(paint) {
      if (paint instanceof Paint) {
        this._cachedPaints.push(paint);
        const stateLen = this._drawables.length;
        for (let i = 0; i < stateLen; i++) {
          this._drawables[i].markDirtyCachedPaints();
        }
      }
    }

    /**
     * Removes a cached paint. Does nothing if paint is just a normal fill (string, Color), but for gradients and
     * patterns it will remove any existing cached paint. If it was added more than once, it will need to be removed
     * more than once.
     *
     * When this Node is displayed in SVG, it will force the presence of the cached paint to be stored in the SVG's
     * <defs> element, so that we can switch quickly to use the given paint (instead of having to create it on the
     * SVG-side whenever the switch is made).
     */
    removeCachedPaint(paint) {
      if (paint instanceof Paint) {
        assert && assert(_.includes(this._cachedPaints, paint));
        arrayRemove(this._cachedPaints, paint);
        const stateLen = this._drawables.length;
        for (let i = 0; i < stateLen; i++) {
          this._drawables[i].markDirtyCachedPaints();
        }
      }
    }

    /**
     * Applies the fill to a Canvas context wrapper, before filling. (scenery-internal)
     */
    beforeCanvasFill(wrapper) {
      assert && assert(this.getFillValue() !== null);
      const fillValue = this.getFillValue();
      wrapper.setFillStyle(fillValue);
      // @ts-expect-error - For performance, we could check this by ruling out string and 'transformMatrix' in fillValue
      if (fillValue.transformMatrix) {
        wrapper.context.save();
        // @ts-expect-error
        fillValue.transformMatrix.canvasAppendTransform(wrapper.context);
      }
    }

    /**
     * Un-applies the fill to a Canvas context wrapper, after filling. (scenery-internal)
     */
    afterCanvasFill(wrapper) {
      const fillValue = this.getFillValue();

      // @ts-expect-error
      if (fillValue.transformMatrix) {
        wrapper.context.restore();
      }
    }

    /**
     * Applies the stroke to a Canvas context wrapper, before stroking. (scenery-internal)
     */
    beforeCanvasStroke(wrapper) {
      const strokeValue = this.getStrokeValue();

      // TODO: is there a better way of not calling so many things on each stroke?
      wrapper.setStrokeStyle(this._stroke);
      wrapper.setLineCap(this.getLineCap());
      wrapper.setLineJoin(this.getLineJoin());

      // @ts-expect-error - for performance
      if (strokeValue.transformMatrix) {
        // @ts-expect-error
        const scaleVector = strokeValue.transformMatrix.getScaleVector();
        assert && assert(Math.abs(scaleVector.x - scaleVector.y) < 1e-7, 'You cannot specify a pattern or gradient to a stroke that does not have a symmetric scale.');
        const matrixMultiplier = 1 / scaleVector.x;
        wrapper.context.save();
        // @ts-expect-error
        strokeValue.transformMatrix.canvasAppendTransform(wrapper.context);
        wrapper.setLineWidth(this.getLineWidth() * matrixMultiplier);
        wrapper.setMiterLimit(this.getMiterLimit() * matrixMultiplier);
        wrapper.setLineDash(this.getLineDash().map(dash => dash * matrixMultiplier));
        wrapper.setLineDashOffset(this.getLineDashOffset() * matrixMultiplier);
      } else {
        wrapper.setLineWidth(this.getLineWidth());
        wrapper.setMiterLimit(this.getMiterLimit());
        wrapper.setLineDash(this.getLineDash());
        wrapper.setLineDashOffset(this.getLineDashOffset());
      }
    }

    /**
     * Un-applies the stroke to a Canvas context wrapper, after stroking. (scenery-internal)
     */
    afterCanvasStroke(wrapper) {
      const strokeValue = this.getStrokeValue();

      // @ts-expect-error - for performance
      if (strokeValue.transformMatrix) {
        wrapper.context.restore();
      }
    }

    /**
     * If applicable, returns the CSS color for the fill.
     */
    getCSSFill() {
      const fillValue = this.getFillValue();
      // if it's a Color object, get the corresponding CSS
      // 'transparent' will make us invisible if the fill is null
      // @ts-expect-error - toCSS checks for color, left for performance
      return fillValue ? fillValue.toCSS ? fillValue.toCSS() : fillValue : 'transparent';
    }

    /**
     * If applicable, returns the CSS color for the stroke.
     */
    getSimpleCSSStroke() {
      const strokeValue = this.getStrokeValue();
      // if it's a Color object, get the corresponding CSS
      // 'transparent' will make us invisible if the fill is null
      // @ts-expect-error - toCSS checks for color, left for performance
      return strokeValue ? strokeValue.toCSS ? strokeValue.toCSS() : strokeValue : 'transparent';
    }

    /**
     * Returns the fill-specific property string for use with toString(). (scenery-internal)
     *
     * @param spaces - Whitespace to add
     * @param result
     */
    appendFillablePropString(spaces, result) {
      if (this._fill) {
        if (result) {
          result += ',\n';
        }
        if (typeof this.getFillValue() === 'string') {
          result += `${spaces}fill: '${this.getFillValue()}'`;
        } else {
          result += `${spaces}fill: ${this.getFillValue()}`;
        }
      }
      return result;
    }

    /**
     * Returns the stroke-specific property string for use with toString(). (scenery-internal)
     *
     * @param spaces - Whitespace to add
     * @param result
     */
    appendStrokablePropString(spaces, result) {
      function addProp(key, value, nowrap) {
        if (result) {
          result += ',\n';
        }
        if (!nowrap && typeof value === 'string') {
          result += `${spaces + key}: '${value}'`;
        } else {
          result += `${spaces + key}: ${value}`;
        }
      }
      if (this._stroke) {
        const defaultStyles = new LineStyles();
        const strokeValue = this.getStrokeValue();
        if (typeof strokeValue === 'string') {
          addProp('stroke', strokeValue);
        } else {
          addProp('stroke', strokeValue ? strokeValue.toString() : 'null', true);
        }
        _.each(['lineWidth', 'lineCap', 'miterLimit', 'lineJoin', 'lineDashOffset'], prop => {
          // @ts-expect-error
          if (this[prop] !== defaultStyles[prop]) {
            // @ts-expect-error
            addProp(prop, this[prop]);
          }
        });
        if (this.lineDash.length) {
          addProp('lineDash', JSON.stringify(this.lineDash), true);
        }
      }
      return result;
    }

    /**
     * Determines the default allowed renderers (returned via the Renderer bitmask) that are allowed, given the
     * current fill options. (scenery-internal)
     *
     * This will be used for all types that directly mix in Paintable (i.e. Path and Text), but may be overridden
     * by subtypes.
     *
     * @returns - Renderer bitmask, see Renderer for details
     */
    getFillRendererBitmask() {
      let bitmask = 0;

      // Safari 5 has buggy issues with SVG gradients
      if (!(isSafari5 && this._fill instanceof Gradient)) {
        bitmask |= Renderer.bitmaskSVG;
      }

      // we always have Canvas support?
      bitmask |= Renderer.bitmaskCanvas;
      if (!this.hasFill()) {
        // if there is no fill, it is supported by DOM and WebGL
        bitmask |= Renderer.bitmaskDOM;
        bitmask |= Renderer.bitmaskWebGL;
      } else if (this._fill instanceof Pattern) {
        // no pattern support for DOM or WebGL (for now!)
      } else if (this._fill instanceof Gradient) {
        // no gradient support for DOM or WebGL (for now!)
      } else {
        // solid fills always supported for DOM and WebGL
        bitmask |= Renderer.bitmaskDOM;
        bitmask |= Renderer.bitmaskWebGL;
      }
      return bitmask;
    }

    /**
     * Determines the default allowed renderers (returned via the Renderer bitmask) that are allowed, given the
     * current stroke options. (scenery-internal)
     *
     * This will be used for all types that directly mix in Paintable (i.e. Path and Text), but may be overridden
     * by subtypes.
     *
     * @returns - Renderer bitmask, see Renderer for details
     */
    getStrokeRendererBitmask() {
      let bitmask = 0;
      bitmask |= Renderer.bitmaskCanvas;

      // always have SVG support (for now?)
      bitmask |= Renderer.bitmaskSVG;
      if (!this.hasStroke()) {
        // allow DOM support if there is no stroke (since the fill will determine what is available)
        bitmask |= Renderer.bitmaskDOM;
        bitmask |= Renderer.bitmaskWebGL;
      }
      return bitmask;
    }

    /**
     * Invalidates our current fill, triggering recomputation of anything that depended on the old fill's value
     */
    invalidateFill() {
      this.invalidateSupportedRenderers();
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyFill();
      }
    }

    /**
     * Invalidates our current stroke, triggering recomputation of anything that depended on the old stroke's value
     */
    invalidateStroke() {
      this.invalidateSupportedRenderers();
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyStroke();
      }
    }
  };
});
scenery.register('Paintable', Paintable);

// @ts-expect-error
Paintable.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
export { Paintable as default, PAINTABLE_DRAWABLE_MARK_FLAGS, PAINTABLE_OPTION_KEYS, DEFAULT_OPTIONS, DEFAULT_OPTIONS as PAINTABLE_DEFAULT_OPTIONS };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFkT25seVByb3BlcnR5IiwiTElORV9TVFlMRV9ERUZBVUxUX09QVElPTlMiLCJMaW5lU3R5bGVzIiwiYXJyYXlSZW1vdmUiLCJhc3NlcnRIYXNQcm9wZXJ0aWVzIiwiaW5oZXJpdGFuY2UiLCJwbGF0Zm9ybSIsIm1lbW9pemUiLCJDb2xvciIsIkdyYWRpZW50IiwiTm9kZSIsIlBhaW50IiwiUGFpbnREZWYiLCJQYXR0ZXJuIiwiUmVuZGVyZXIiLCJzY2VuZXJ5IiwiaXNTYWZhcmk1Iiwic2FmYXJpNSIsIlBBSU5UQUJMRV9PUFRJT05fS0VZUyIsIkRFRkFVTFRfT1BUSU9OUyIsImZpbGwiLCJmaWxsUGlja2FibGUiLCJzdHJva2UiLCJzdHJva2VQaWNrYWJsZSIsImxpbmVXaWR0aCIsImxpbmVDYXAiLCJsaW5lSm9pbiIsImxpbmVEYXNoT2Zmc2V0IiwibWl0ZXJMaW1pdCIsIlBBSU5UQUJMRV9EUkFXQUJMRV9NQVJLX0ZMQUdTIiwiUGFpbnRhYmxlIiwidHlwZSIsImFzc2VydCIsIl8iLCJpbmNsdWRlcyIsIlBhaW50YWJsZU1peGluIiwiY29uc3RydWN0b3IiLCJhcmdzIiwiX2ZpbGwiLCJfZmlsbFBpY2thYmxlIiwiX3N0cm9rZSIsIl9zdHJva2VQaWNrYWJsZSIsIl9jYWNoZWRQYWludHMiLCJfbGluZURyYXdpbmdTdHlsZXMiLCJzZXRGaWxsIiwiaXNQYWludERlZiIsImNoZWNrUGFpbnRTdHJpbmciLCJpbnZhbGlkYXRlRmlsbCIsInZhbHVlIiwiZ2V0RmlsbCIsImhhc0ZpbGwiLCJnZXRGaWxsVmFsdWUiLCJnZXQiLCJmaWxsVmFsdWUiLCJzZXRTdHJva2UiLCJ0cmFuc2Zvcm1NYXRyaXgiLCJzY2FsZVZlY3RvciIsImdldFNjYWxlVmVjdG9yIiwiTWF0aCIsImFicyIsIngiLCJ5IiwiaW52YWxpZGF0ZVN0cm9rZSIsImdldFN0cm9rZSIsImhhc1N0cm9rZSIsImdldFN0cm9rZVZhbHVlIiwiaGFzUGFpbnRhYmxlU3Ryb2tlIiwiZ2V0TGluZVdpZHRoIiwic3Ryb2tlVmFsdWUiLCJzZXRGaWxsUGlja2FibGUiLCJwaWNrYWJsZSIsImlzRmlsbFBpY2thYmxlIiwic2V0U3Ryb2tlUGlja2FibGUiLCJpc1N0cm9rZVBpY2thYmxlIiwic2V0TGluZVdpZHRoIiwic3RhdGVMZW4iLCJfZHJhd2FibGVzIiwibGVuZ3RoIiwiaSIsIm1hcmtEaXJ0eUxpbmVXaWR0aCIsInNldExpbmVDYXAiLCJtYXJrRGlydHlMaW5lT3B0aW9ucyIsImdldExpbmVDYXAiLCJzZXRMaW5lSm9pbiIsImdldExpbmVKb2luIiwic2V0TWl0ZXJMaW1pdCIsImlzRmluaXRlIiwiZ2V0TWl0ZXJMaW1pdCIsInNldExpbmVEYXNoIiwibGluZURhc2giLCJBcnJheSIsImlzQXJyYXkiLCJldmVyeSIsIm4iLCJnZXRMaW5lRGFzaCIsImhhc0xpbmVEYXNoIiwic2V0TGluZURhc2hPZmZzZXQiLCJnZXRMaW5lRGFzaE9mZnNldCIsInNldExpbmVTdHlsZXMiLCJsaW5lU3R5bGVzIiwiZ2V0TGluZVN0eWxlcyIsInNldENhY2hlZFBhaW50cyIsInBhaW50cyIsImZpbHRlciIsInBhaW50IiwibWFya0RpcnR5Q2FjaGVkUGFpbnRzIiwiY2FjaGVkUGFpbnRzIiwiZ2V0Q2FjaGVkUGFpbnRzIiwiYWRkQ2FjaGVkUGFpbnQiLCJwdXNoIiwicmVtb3ZlQ2FjaGVkUGFpbnQiLCJiZWZvcmVDYW52YXNGaWxsIiwid3JhcHBlciIsInNldEZpbGxTdHlsZSIsImNvbnRleHQiLCJzYXZlIiwiY2FudmFzQXBwZW5kVHJhbnNmb3JtIiwiYWZ0ZXJDYW52YXNGaWxsIiwicmVzdG9yZSIsImJlZm9yZUNhbnZhc1N0cm9rZSIsInNldFN0cm9rZVN0eWxlIiwibWF0cml4TXVsdGlwbGllciIsIm1hcCIsImRhc2giLCJhZnRlckNhbnZhc1N0cm9rZSIsImdldENTU0ZpbGwiLCJ0b0NTUyIsImdldFNpbXBsZUNTU1N0cm9rZSIsImFwcGVuZEZpbGxhYmxlUHJvcFN0cmluZyIsInNwYWNlcyIsInJlc3VsdCIsImFwcGVuZFN0cm9rYWJsZVByb3BTdHJpbmciLCJhZGRQcm9wIiwia2V5Iiwibm93cmFwIiwiZGVmYXVsdFN0eWxlcyIsInRvU3RyaW5nIiwiZWFjaCIsInByb3AiLCJKU09OIiwic3RyaW5naWZ5IiwiZ2V0RmlsbFJlbmRlcmVyQml0bWFzayIsImJpdG1hc2siLCJiaXRtYXNrU1ZHIiwiYml0bWFza0NhbnZhcyIsImJpdG1hc2tET00iLCJiaXRtYXNrV2ViR0wiLCJnZXRTdHJva2VSZW5kZXJlckJpdG1hc2siLCJpbnZhbGlkYXRlU3VwcG9ydGVkUmVuZGVyZXJzIiwibWFya0RpcnR5RmlsbCIsIm1hcmtEaXJ0eVN0cm9rZSIsInJlZ2lzdGVyIiwiZGVmYXVsdCIsIlBBSU5UQUJMRV9ERUZBVUxUX09QVElPTlMiXSwic291cmNlcyI6WyJQYWludGFibGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVHJhaXQgZm9yIE5vZGVzIHRoYXQgc3VwcG9ydCBhIHN0YW5kYXJkIGZpbGwgYW5kL29yIHN0cm9rZSAoZS5nLiBUZXh0LCBQYXRoIGFuZCBQYXRoIHN1YnR5cGVzKS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IExJTkVfU1RZTEVfREVGQVVMVF9PUFRJT05TLCBMaW5lQ2FwLCBMaW5lSm9pbiwgTGluZVN0eWxlcyB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xyXG5pbXBvcnQgYXNzZXJ0SGFzUHJvcGVydGllcyBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvYXNzZXJ0SGFzUHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBpbmhlcml0YW5jZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvaW5oZXJpdGFuY2UuanMnO1xyXG5pbXBvcnQgcGxhdGZvcm0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3BsYXRmb3JtLmpzJztcclxuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lbW9pemUuanMnO1xyXG5pbXBvcnQgeyBDYW52YXNDb250ZXh0V3JhcHBlciwgQ29sb3IsIEdyYWRpZW50LCBUUGFpbnQsIFRQYWludGFibGVEcmF3YWJsZSwgTGluZWFyR3JhZGllbnQsIE5vZGUsIFBhaW50LCBQYWludERlZiwgUGF0aCwgUGF0dGVybiwgUmFkaWFsR3JhZGllbnQsIFJlbmRlcmVyLCBzY2VuZXJ5LCBUZXh0IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDb25zdHJ1Y3RvciBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvQ29uc3RydWN0b3IuanMnO1xyXG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5cclxuY29uc3QgaXNTYWZhcmk1ID0gcGxhdGZvcm0uc2FmYXJpNTtcclxuXHJcbmNvbnN0IFBBSU5UQUJMRV9PUFRJT05fS0VZUyA9IFtcclxuICAnZmlsbCcsIC8vIHtQYWludERlZn0gLSBTZXRzIHRoZSBmaWxsIG9mIHRoaXMgTm9kZSwgc2VlIHNldEZpbGwoKSBmb3IgZG9jdW1lbnRhdGlvbi5cclxuICAnZmlsbFBpY2thYmxlJywgLy8ge2Jvb2xlYW59IC0gU2V0cyB3aGV0aGVyIHRoZSBmaWxsZWQgYXJlYSBvZiB0aGUgTm9kZSB3aWxsIGJlIHRyZWF0ZWQgYXMgJ2luc2lkZScuIFNlZSBzZXRGaWxsUGlja2FibGUoKVxyXG4gICdzdHJva2UnLCAvLyB7UGFpbnREZWZ9IC0gU2V0cyB0aGUgc3Ryb2tlIG9mIHRoaXMgTm9kZSwgc2VlIHNldFN0cm9rZSgpIGZvciBkb2N1bWVudGF0aW9uLlxyXG4gICdzdHJva2VQaWNrYWJsZScsIC8vIHtib29sZWFufSAtIFNldHMgd2hldGhlciB0aGUgc3Ryb2tlZCBhcmVhIG9mIHRoZSBOb2RlIHdpbGwgYmUgdHJlYXRlZCBhcyAnaW5zaWRlJy4gU2VlIHNldFN0cm9rZVBpY2thYmxlKClcclxuICAnbGluZVdpZHRoJywgLy8ge251bWJlcn0gLSBTZXRzIHRoZSB3aWR0aCBvZiB0aGUgc3Ryb2tlZCBhcmVhLCBzZWUgc2V0TGluZVdpZHRoIGZvciBkb2N1bWVudGF0aW9uLlxyXG4gICdsaW5lQ2FwJywgLy8ge3N0cmluZ30gLSBTZXRzIHRoZSBzaGFwZSBvZiB0aGUgc3Ryb2tlZCBhcmVhIGF0IHRoZSBzdGFydC9lbmQgb2YgdGhlIHBhdGgsIHNlZSBzZXRMaW5lQ2FwKCkgZm9yIGRvY3VtZW50YXRpb24uXHJcbiAgJ2xpbmVKb2luJywgLy8ge3N0cmluZ30gLSBTZXRzIHRoZSBzaGFwZSBvZiB0aGUgc3Ryb2tlZCBhcmVhIGF0IGpvaW50cywgc2VlIHNldExpbmVKb2luKCkgZm9yIGRvY3VtZW50YXRpb24uXHJcbiAgJ21pdGVyTGltaXQnLCAvLyB7bnVtYmVyfSAtIFNldHMgd2hlbiBsaW5lSm9pbiB3aWxsIHN3aXRjaCBmcm9tIG1pdGVyIHRvIGJldmVsLCBzZWUgc2V0TWl0ZXJMaW1pdCgpIGZvciBkb2N1bWVudGF0aW9uLlxyXG4gICdsaW5lRGFzaCcsIC8vIHtBcnJheS48bnVtYmVyPn0gLSBTZXRzIGEgbGluZS1kYXNoIHBhdHRlcm4gZm9yIHRoZSBzdHJva2UsIHNlZSBzZXRMaW5lRGFzaCgpIGZvciBkb2N1bWVudGF0aW9uXHJcbiAgJ2xpbmVEYXNoT2Zmc2V0JywgLy8ge251bWJlcn0gLSBTZXRzIHRoZSBvZmZzZXQgb2YgdGhlIGxpbmUtZGFzaCBmcm9tIHRoZSBzdGFydCBvZiB0aGUgc3Ryb2tlLCBzZWUgc2V0TGluZURhc2hPZmZzZXQoKVxyXG4gICdjYWNoZWRQYWludHMnIC8vIHtBcnJheS48UGFpbnREZWY+fSAtIFNldHMgd2hpY2ggcGFpbnRzIHNob3VsZCBiZSBjYWNoZWQsIGV2ZW4gaWYgbm90IGRpc3BsYXllZC4gU2VlIHNldENhY2hlZFBhaW50cygpXHJcbl07XHJcblxyXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XHJcbiAgZmlsbDogbnVsbCxcclxuICBmaWxsUGlja2FibGU6IHRydWUsXHJcbiAgc3Ryb2tlOiBudWxsLFxyXG4gIHN0cm9rZVBpY2thYmxlOiBmYWxzZSxcclxuXHJcbiAgLy8gTm90IHNldCBpbml0aWFsbHksIGJ1dCB0aGV5IGFyZSB0aGUgTGluZVN0eWxlcyBkZWZhdWx0c1xyXG4gIGxpbmVXaWR0aDogTElORV9TVFlMRV9ERUZBVUxUX09QVElPTlMubGluZVdpZHRoLFxyXG4gIGxpbmVDYXA6IExJTkVfU1RZTEVfREVGQVVMVF9PUFRJT05TLmxpbmVDYXAsXHJcbiAgbGluZUpvaW46IExJTkVfU1RZTEVfREVGQVVMVF9PUFRJT05TLmxpbmVKb2luLFxyXG4gIGxpbmVEYXNoT2Zmc2V0OiBMSU5FX1NUWUxFX0RFRkFVTFRfT1BUSU9OUy5saW5lRGFzaE9mZnNldCxcclxuICBtaXRlckxpbWl0OiBMSU5FX1NUWUxFX0RFRkFVTFRfT1BUSU9OUy5taXRlckxpbWl0XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBQYWludGFibGVPcHRpb25zID0ge1xyXG4gIGZpbGw/OiBUUGFpbnQ7XHJcbiAgZmlsbFBpY2thYmxlPzogYm9vbGVhbjtcclxuICBzdHJva2U/OiBUUGFpbnQ7XHJcbiAgc3Ryb2tlUGlja2FibGU/OiBib29sZWFuO1xyXG4gIGxpbmVXaWR0aD86IG51bWJlcjtcclxuICBsaW5lQ2FwPzogTGluZUNhcDtcclxuICBsaW5lSm9pbj86IExpbmVKb2luO1xyXG4gIG1pdGVyTGltaXQ/OiBudW1iZXI7XHJcbiAgbGluZURhc2g/OiBudW1iZXJbXTtcclxuICBsaW5lRGFzaE9mZnNldD86IG51bWJlcjtcclxuICBjYWNoZWRQYWludHM/OiBUUGFpbnRbXTtcclxufTtcclxuXHJcbi8vIFdvcmthcm91bmQgdHlwZSBzaW5jZSB3ZSBjYW4ndCBkZXRlY3QgbWl4aW5zIGluIHRoZSB0eXBlIHN5c3RlbSB3ZWxsXHJcbmV4cG9ydCB0eXBlIFBhaW50YWJsZU5vZGUgPSBQYXRoIHwgVGV4dDtcclxuXHJcbmNvbnN0IFBBSU5UQUJMRV9EUkFXQUJMRV9NQVJLX0ZMQUdTID0gWyAnZmlsbCcsICdzdHJva2UnLCAnbGluZVdpZHRoJywgJ2xpbmVPcHRpb25zJywgJ2NhY2hlZFBhaW50cycgXTtcclxuXHJcbmNvbnN0IFBhaW50YWJsZSA9IG1lbW9pemUoIDxTdXBlclR5cGUgZXh0ZW5kcyBDb25zdHJ1Y3RvcjxOb2RlPj4oIHR5cGU6IFN1cGVyVHlwZSApID0+IHtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBpbmhlcml0YW5jZSggdHlwZSApLCBOb2RlICksICdPbmx5IE5vZGUgc3VidHlwZXMgc2hvdWxkIG1peCBQYWludGFibGUnICk7XHJcblxyXG4gIHJldHVybiBjbGFzcyBQYWludGFibGVNaXhpbiBleHRlbmRzIHR5cGUge1xyXG5cclxuICAgIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAgcHVibGljIF9maWxsOiBUUGFpbnQ7XHJcbiAgICBwdWJsaWMgX2ZpbGxQaWNrYWJsZTogYm9vbGVhbjtcclxuXHJcbiAgICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgIHB1YmxpYyBfc3Ryb2tlOiBUUGFpbnQ7XHJcbiAgICBwdWJsaWMgX3N0cm9rZVBpY2thYmxlOiBib29sZWFuO1xyXG5cclxuICAgIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAgcHVibGljIF9jYWNoZWRQYWludHM6IFBhaW50W107XHJcbiAgICBwdWJsaWMgX2xpbmVEcmF3aW5nU3R5bGVzOiBMaW5lU3R5bGVzO1xyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvciggLi4uYXJnczogSW50ZW50aW9uYWxBbnlbXSApIHtcclxuICAgICAgc3VwZXIoIC4uLmFyZ3MgKTtcclxuXHJcbiAgICAgIGFzc2VydEhhc1Byb3BlcnRpZXMoIHRoaXMsIFsgJ19kcmF3YWJsZXMnIF0gKTtcclxuXHJcbiAgICAgIHRoaXMuX2ZpbGwgPSBERUZBVUxUX09QVElPTlMuZmlsbDtcclxuICAgICAgdGhpcy5fZmlsbFBpY2thYmxlID0gREVGQVVMVF9PUFRJT05TLmZpbGxQaWNrYWJsZTtcclxuXHJcbiAgICAgIHRoaXMuX3N0cm9rZSA9IERFRkFVTFRfT1BUSU9OUy5zdHJva2U7XHJcbiAgICAgIHRoaXMuX3N0cm9rZVBpY2thYmxlID0gREVGQVVMVF9PUFRJT05TLnN0cm9rZVBpY2thYmxlO1xyXG5cclxuICAgICAgdGhpcy5fY2FjaGVkUGFpbnRzID0gW107XHJcbiAgICAgIHRoaXMuX2xpbmVEcmF3aW5nU3R5bGVzID0gbmV3IExpbmVTdHlsZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGZpbGwgY29sb3IgZm9yIHRoZSBOb2RlLlxyXG4gICAgICpcclxuICAgICAqIFRoZSBmaWxsIGRldGVybWluZXMgdGhlIGFwcGVhcmFuY2Ugb2YgdGhlIGludGVyaW9yIHBhcnQgb2YgYSBQYXRoIG9yIFRleHQuXHJcbiAgICAgKlxyXG4gICAgICogUGxlYXNlIHVzZSBudWxsIGZvciBpbmRpY2F0aW5nIFwibm8gZmlsbFwiICh0aGF0IGlzIHRoZSBkZWZhdWx0KS4gU3RyaW5ncyBhbmQgU2NlbmVyeSBDb2xvciBvYmplY3RzIGNhbiBiZVxyXG4gICAgICogcHJvdmlkZWQgZm9yIGEgc2luZ2xlLWNvbG9yIGZsYXQgYXBwZWFyYW5jZSwgYW5kIGNhbiBiZSB3cmFwcGVkIHdpdGggYW4gQXhvbiBQcm9wZXJ0eS4gR3JhZGllbnRzIGFuZCBwYXR0ZXJuc1xyXG4gICAgICogY2FuIGFsc28gYmUgcHJvdmlkZWQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRGaWxsKCBmaWxsOiBUUGFpbnQgKTogdGhpcyB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIFBhaW50RGVmLmlzUGFpbnREZWYoIGZpbGwgKSwgJ0ludmFsaWQgZmlsbCB0eXBlJyApO1xyXG5cclxuICAgICAgaWYgKCBhc3NlcnQgJiYgdHlwZW9mIGZpbGwgPT09ICdzdHJpbmcnICkge1xyXG4gICAgICAgIENvbG9yLmNoZWNrUGFpbnRTdHJpbmcoIGZpbGwgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSW5zdGFuY2UgZXF1YWxpdHkgdXNlZCBoZXJlIHNpbmNlIGl0IHdvdWxkIGJlIG1vcmUgZXhwZW5zaXZlIHRvIHBhcnNlIGFsbCBDU1NcclxuICAgICAgLy8gY29sb3JzIGFuZCBjb21wYXJlIGV2ZXJ5IHRpbWUgdGhlIGZpbGwgY2hhbmdlcy4gUmlnaHQgbm93LCB1c3VhbGx5IHdlIGRvbid0IGhhdmVcclxuICAgICAgLy8gdG8gcGFyc2UgQ1NTIGNvbG9ycy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8yNTVcclxuICAgICAgaWYgKCB0aGlzLl9maWxsICE9PSBmaWxsICkge1xyXG4gICAgICAgIHRoaXMuX2ZpbGwgPSBmaWxsO1xyXG5cclxuICAgICAgICB0aGlzLmludmFsaWRhdGVGaWxsKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBmaWxsKCB2YWx1ZTogVFBhaW50ICkgeyB0aGlzLnNldEZpbGwoIHZhbHVlICk7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGZpbGwoKTogVFBhaW50IHsgcmV0dXJuIHRoaXMuZ2V0RmlsbCgpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBmaWxsIChpZiBhbnkpIGZvciB0aGlzIE5vZGUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRGaWxsKCk6IFRQYWludCB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9maWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB3aGV0aGVyIHRoZXJlIGlzIGEgZmlsbCBhcHBsaWVkIHRvIHRoaXMgTm9kZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGhhc0ZpbGwoKTogYm9vbGVhbiB7XHJcbiAgICAgIHJldHVybiB0aGlzLmdldEZpbGxWYWx1ZSgpICE9PSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHByb3BlcnR5LXVud3JhcHBlZCBmaWxsIGlmIGFwcGxpY2FibGUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRGaWxsVmFsdWUoKTogbnVsbCB8IHN0cmluZyB8IENvbG9yIHwgTGluZWFyR3JhZGllbnQgfCBSYWRpYWxHcmFkaWVudCB8IFBhdHRlcm4ge1xyXG4gICAgICBjb25zdCBmaWxsID0gdGhpcy5nZXRGaWxsKCk7XHJcblxyXG4gICAgICByZXR1cm4gZmlsbCBpbnN0YW5jZW9mIFJlYWRPbmx5UHJvcGVydHkgPyBmaWxsLmdldCgpIDogZmlsbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGZpbGxWYWx1ZSgpOiBudWxsIHwgc3RyaW5nIHwgQ29sb3IgfCBMaW5lYXJHcmFkaWVudCB8IFJhZGlhbEdyYWRpZW50IHwgUGF0dGVybiB7IHJldHVybiB0aGlzLmdldEZpbGxWYWx1ZSgpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBzdHJva2UgY29sb3IgZm9yIHRoZSBOb2RlLlxyXG4gICAgICpcclxuICAgICAqIFRoZSBzdHJva2UgZGV0ZXJtaW5lcyB0aGUgYXBwZWFyYW5jZSBvZiB0aGUgcmVnaW9uIGFsb25nIHRoZSBib3VuZGFyeSBvZiB0aGUgUGF0aCBvciBUZXh0LiBUaGUgc2hhcGUgb2YgdGhlXHJcbiAgICAgKiBzdHJva2VkIGFyZWEgZGVwZW5kcyBvbiB0aGUgYmFzZSBzaGFwZSAodGhhdCBvZiB0aGUgUGF0aCBvciBUZXh0KSBhbmQgbXVsdGlwbGUgcGFyYW1ldGVyczpcclxuICAgICAqIGxpbmVXaWR0aC9saW5lQ2FwL2xpbmVKb2luL21pdGVyTGltaXQvbGluZURhc2gvbGluZURhc2hPZmZzZXQuIEl0IHdpbGwgYmUgZHJhd24gb24gdG9wIG9mIGFueSBmaWxsIG9uIHRoZVxyXG4gICAgICogc2FtZSBOb2RlLlxyXG4gICAgICpcclxuICAgICAqIFBsZWFzZSB1c2UgbnVsbCBmb3IgaW5kaWNhdGluZyBcIm5vIHN0cm9rZVwiICh0aGF0IGlzIHRoZSBkZWZhdWx0KS4gU3RyaW5ncyBhbmQgU2NlbmVyeSBDb2xvciBvYmplY3RzIGNhbiBiZVxyXG4gICAgICogcHJvdmlkZWQgZm9yIGEgc2luZ2xlLWNvbG9yIGZsYXQgYXBwZWFyYW5jZSwgYW5kIGNhbiBiZSB3cmFwcGVkIHdpdGggYW4gQXhvbiBQcm9wZXJ0eS4gR3JhZGllbnRzIGFuZCBwYXR0ZXJuc1xyXG4gICAgICogY2FuIGFsc28gYmUgcHJvdmlkZWQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRTdHJva2UoIHN0cm9rZTogVFBhaW50ICk6IHRoaXMge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBQYWludERlZi5pc1BhaW50RGVmKCBzdHJva2UgKSwgJ0ludmFsaWQgc3Ryb2tlIHR5cGUnICk7XHJcblxyXG4gICAgICBpZiAoIGFzc2VydCAmJiB0eXBlb2Ygc3Ryb2tlID09PSAnc3RyaW5nJyApIHtcclxuICAgICAgICBDb2xvci5jaGVja1BhaW50U3RyaW5nKCBzdHJva2UgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSW5zdGFuY2UgZXF1YWxpdHkgdXNlZCBoZXJlIHNpbmNlIGl0IHdvdWxkIGJlIG1vcmUgZXhwZW5zaXZlIHRvIHBhcnNlIGFsbCBDU1NcclxuICAgICAgLy8gY29sb3JzIGFuZCBjb21wYXJlIGV2ZXJ5IHRpbWUgdGhlIGZpbGwgY2hhbmdlcy4gUmlnaHQgbm93LCB1c3VhbGx5IHdlIGRvbid0IGhhdmVcclxuICAgICAgLy8gdG8gcGFyc2UgQ1NTIGNvbG9ycy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8yNTVcclxuICAgICAgaWYgKCB0aGlzLl9zdHJva2UgIT09IHN0cm9rZSApIHtcclxuICAgICAgICB0aGlzLl9zdHJva2UgPSBzdHJva2U7XHJcblxyXG4gICAgICAgIGlmICggYXNzZXJ0ICYmIHN0cm9rZSBpbnN0YW5jZW9mIFBhaW50ICYmIHN0cm9rZS50cmFuc2Zvcm1NYXRyaXggKSB7XHJcbiAgICAgICAgICBjb25zdCBzY2FsZVZlY3RvciA9IHN0cm9rZS50cmFuc2Zvcm1NYXRyaXguZ2V0U2NhbGVWZWN0b3IoKTtcclxuICAgICAgICAgIGFzc2VydCggTWF0aC5hYnMoIHNjYWxlVmVjdG9yLnggLSBzY2FsZVZlY3Rvci55ICkgPCAxZS03LCAnWW91IGNhbm5vdCBzcGVjaWZ5IGEgcGF0dGVybiBvciBncmFkaWVudCB0byBhIHN0cm9rZSB0aGF0IGRvZXMgbm90IGhhdmUgYSBzeW1tZXRyaWMgc2NhbGUuJyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmludmFsaWRhdGVTdHJva2UoKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IHN0cm9rZSggdmFsdWU6IFRQYWludCApIHsgdGhpcy5zZXRTdHJva2UoIHZhbHVlICk7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHN0cm9rZSgpOiBUUGFpbnQgeyByZXR1cm4gdGhpcy5nZXRTdHJva2UoKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc3Ryb2tlIChpZiBhbnkpIGZvciB0aGlzIE5vZGUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRTdHJva2UoKTogVFBhaW50IHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3N0cm9rZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgd2hldGhlciB0aGVyZSBpcyBhIHN0cm9rZSBhcHBsaWVkIHRvIHRoaXMgTm9kZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGhhc1N0cm9rZSgpOiBib29sZWFuIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0U3Ryb2tlVmFsdWUoKSAhPT0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgd2hldGhlciB0aGVyZSB3aWxsIGFwcGVhciB0byBiZSBhIHN0cm9rZSBmb3IgdGhpcyBOb2RlLiBQcm9wZXJseSBoYW5kbGVzIHRoZSBsaW5lV2lkdGg6MCBjYXNlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaGFzUGFpbnRhYmxlU3Ryb2tlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAvLyBTaG91bGQgbm90IGJlIHN0cm9rZWQgaWYgdGhlIGxpbmVXaWR0aCBpcyAwLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzY1OFxyXG4gICAgICAvLyBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzUyM1xyXG4gICAgICByZXR1cm4gdGhpcy5oYXNTdHJva2UoKSAmJiB0aGlzLmdldExpbmVXaWR0aCgpID4gMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBwcm9wZXJ0eS11bndyYXBwZWQgc3Ryb2tlIGlmIGFwcGxpY2FibGUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRTdHJva2VWYWx1ZSgpOiBudWxsIHwgc3RyaW5nIHwgQ29sb3IgfCBMaW5lYXJHcmFkaWVudCB8IFJhZGlhbEdyYWRpZW50IHwgUGF0dGVybiB7XHJcbiAgICAgIGNvbnN0IHN0cm9rZSA9IHRoaXMuZ2V0U3Ryb2tlKCk7XHJcblxyXG4gICAgICByZXR1cm4gc3Ryb2tlIGluc3RhbmNlb2YgUmVhZE9ubHlQcm9wZXJ0eSA/IHN0cm9rZS5nZXQoKSA6IHN0cm9rZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHN0cm9rZVZhbHVlKCk6IG51bGwgfCBzdHJpbmcgfCBDb2xvciB8IExpbmVhckdyYWRpZW50IHwgUmFkaWFsR3JhZGllbnQgfCBQYXR0ZXJuIHsgcmV0dXJuIHRoaXMuZ2V0U3Ryb2tlVmFsdWUoKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB3aGV0aGVyIHRoZSBmaWxsIGlzIG1hcmtlZCBhcyBwaWNrYWJsZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldEZpbGxQaWNrYWJsZSggcGlja2FibGU6IGJvb2xlYW4gKTogdGhpcyB7XHJcbiAgICAgIGlmICggdGhpcy5fZmlsbFBpY2thYmxlICE9PSBwaWNrYWJsZSApIHtcclxuICAgICAgICB0aGlzLl9maWxsUGlja2FibGUgPSBwaWNrYWJsZTtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogYmV0dGVyIHdheSBvZiBpbmRpY2F0aW5nIHRoYXQgb25seSB0aGUgTm9kZSB1bmRlciBwb2ludGVycyBjb3VsZCBoYXZlIGNoYW5nZWQsIGJ1dCBubyBwYWludCBjaGFuZ2UgaXMgbmVlZGVkP1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZUZpbGwoKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGZpbGxQaWNrYWJsZSggdmFsdWU6IGJvb2xlYW4gKSB7IHRoaXMuc2V0RmlsbFBpY2thYmxlKCB2YWx1ZSApOyB9XHJcblxyXG4gICAgcHVibGljIGdldCBmaWxsUGlja2FibGUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmlzRmlsbFBpY2thYmxlKCk7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgd2hldGhlciB0aGUgZmlsbCBpcyBtYXJrZWQgYXMgcGlja2FibGUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpc0ZpbGxQaWNrYWJsZSgpOiBib29sZWFuIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2ZpbGxQaWNrYWJsZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgd2hldGhlciB0aGUgc3Ryb2tlIGlzIG1hcmtlZCBhcyBwaWNrYWJsZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldFN0cm9rZVBpY2thYmxlKCBwaWNrYWJsZTogYm9vbGVhbiApOiB0aGlzIHtcclxuXHJcbiAgICAgIGlmICggdGhpcy5fc3Ryb2tlUGlja2FibGUgIT09IHBpY2thYmxlICkge1xyXG4gICAgICAgIHRoaXMuX3N0cm9rZVBpY2thYmxlID0gcGlja2FibGU7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IGJldHRlciB3YXkgb2YgaW5kaWNhdGluZyB0aGF0IG9ubHkgdGhlIE5vZGUgdW5kZXIgcG9pbnRlcnMgY291bGQgaGF2ZSBjaGFuZ2VkLCBidXQgbm8gcGFpbnQgY2hhbmdlIGlzIG5lZWRlZD9cclxuICAgICAgICB0aGlzLmludmFsaWRhdGVTdHJva2UoKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IHN0cm9rZVBpY2thYmxlKCB2YWx1ZTogYm9vbGVhbiApIHsgdGhpcy5zZXRTdHJva2VQaWNrYWJsZSggdmFsdWUgKTsgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgc3Ryb2tlUGlja2FibGUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmlzU3Ryb2tlUGlja2FibGUoKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBzdHJva2UgaXMgbWFya2VkIGFzIHBpY2thYmxlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaXNTdHJva2VQaWNrYWJsZSgpOiBib29sZWFuIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3N0cm9rZVBpY2thYmxlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgbGluZSB3aWR0aCB0aGF0IHdpbGwgYmUgYXBwbGllZCB0byBzdHJva2VzIG9uIHRoaXMgTm9kZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldExpbmVXaWR0aCggbGluZVdpZHRoOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpbmVXaWR0aCA+PSAwLCBgbGluZVdpZHRoIHNob3VsZCBiZSBub24tbmVnYXRpdmUgaW5zdGVhZCBvZiAke2xpbmVXaWR0aH1gICk7XHJcblxyXG4gICAgICBpZiAoIHRoaXMuZ2V0TGluZVdpZHRoKCkgIT09IGxpbmVXaWR0aCApIHtcclxuICAgICAgICB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcy5saW5lV2lkdGggPSBsaW5lV2lkdGg7XHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xyXG4gICAgICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRQYWludGFibGVEcmF3YWJsZSApLm1hcmtEaXJ0eUxpbmVXaWR0aCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGxpbmVXaWR0aCggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRMaW5lV2lkdGgoIHZhbHVlICk7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGxpbmVXaWR0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRMaW5lV2lkdGgoKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgbGluZSB3aWR0aCB0aGF0IHdvdWxkIGJlIGFwcGxpZWQgdG8gc3Ryb2tlcy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldExpbmVXaWR0aCgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5fbGluZURyYXdpbmdTdHlsZXMubGluZVdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgbGluZSBjYXAgc3R5bGUuIFRoZXJlIGFyZSB0aHJlZSBvcHRpb25zOlxyXG4gICAgICogLSAnYnV0dCcgKHRoZSBkZWZhdWx0KSBzdG9wcyB0aGUgbGluZSBhdCB0aGUgZW5kIHBvaW50XHJcbiAgICAgKiAtICdyb3VuZCcgZHJhd3MgYSBzZW1pY2lyY3VsYXIgYXJjIGFyb3VuZCB0aGUgZW5kIHBvaW50XHJcbiAgICAgKiAtICdzcXVhcmUnIGRyYXdzIGEgc3F1YXJlIG91dGxpbmUgYXJvdW5kIHRoZSBlbmQgcG9pbnQgKGxpa2UgYnV0dCwgYnV0IGV4dGVuZGVkIGJ5IDEvMiBsaW5lIHdpZHRoIG91dClcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldExpbmVDYXAoIGxpbmVDYXA6IExpbmVDYXAgKTogdGhpcyB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpbmVDYXAgPT09ICdidXR0JyB8fCBsaW5lQ2FwID09PSAncm91bmQnIHx8IGxpbmVDYXAgPT09ICdzcXVhcmUnLFxyXG4gICAgICAgIGBsaW5lQ2FwIHNob3VsZCBiZSBvbmUgb2YgXCJidXR0XCIsIFwicm91bmRcIiBvciBcInNxdWFyZVwiLCBub3QgJHtsaW5lQ2FwfWAgKTtcclxuXHJcbiAgICAgIGlmICggdGhpcy5fbGluZURyYXdpbmdTdHlsZXMubGluZUNhcCAhPT0gbGluZUNhcCApIHtcclxuICAgICAgICB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcy5saW5lQ2FwID0gbGluZUNhcDtcclxuICAgICAgICB0aGlzLmludmFsaWRhdGVTdHJva2UoKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XHJcbiAgICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVFBhaW50YWJsZURyYXdhYmxlICkubWFya0RpcnR5TGluZU9wdGlvbnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBsaW5lQ2FwKCB2YWx1ZTogTGluZUNhcCApIHsgdGhpcy5zZXRMaW5lQ2FwKCB2YWx1ZSApOyB9XHJcblxyXG4gICAgcHVibGljIGdldCBsaW5lQ2FwKCk6IExpbmVDYXAgeyByZXR1cm4gdGhpcy5nZXRMaW5lQ2FwKCk7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGxpbmUgY2FwIHN0eWxlIChjb250cm9scyBhcHBlYXJhbmNlIGF0IHRoZSBzdGFydC9lbmQgb2YgcGF0aHMpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRMaW5lQ2FwKCk6IExpbmVDYXAge1xyXG4gICAgICByZXR1cm4gdGhpcy5fbGluZURyYXdpbmdTdHlsZXMubGluZUNhcDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGxpbmUgam9pbiBzdHlsZS4gVGhlcmUgYXJlIHRocmVlIG9wdGlvbnM6XHJcbiAgICAgKiAtICdtaXRlcicgKGRlZmF1bHQpIGpvaW5zIGJ5IGV4dGVuZGluZyB0aGUgc2VnbWVudHMgb3V0IGluIGEgbGluZSB1bnRpbCB0aGV5IG1lZXQuIEZvciB2ZXJ5IHNoYXJwXHJcbiAgICAgKiAgICAgICAgICAgY29ybmVycywgdGhleSB3aWxsIGJlIGNob3BwZWQgb2ZmIGFuZCB3aWxsIGFjdCBsaWtlICdiZXZlbCcsIGRlcGVuZGluZyBvbiB3aGF0IHRoZSBtaXRlckxpbWl0IGlzLlxyXG4gICAgICogLSAncm91bmQnIGRyYXdzIGEgY2lyY3VsYXIgYXJjIHRvIGNvbm5lY3QgdGhlIHR3byBzdHJva2VkIGFyZWFzLlxyXG4gICAgICogLSAnYmV2ZWwnIGNvbm5lY3RzIHdpdGggYSBzaW5nbGUgbGluZSBzZWdtZW50LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0TGluZUpvaW4oIGxpbmVKb2luOiBMaW5lSm9pbiApOiB0aGlzIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbGluZUpvaW4gPT09ICdtaXRlcicgfHwgbGluZUpvaW4gPT09ICdyb3VuZCcgfHwgbGluZUpvaW4gPT09ICdiZXZlbCcsXHJcbiAgICAgICAgYGxpbmVKb2luIHNob3VsZCBiZSBvbmUgb2YgXCJtaXRlclwiLCBcInJvdW5kXCIgb3IgXCJiZXZlbFwiLCBub3QgJHtsaW5lSm9pbn1gICk7XHJcblxyXG4gICAgICBpZiAoIHRoaXMuX2xpbmVEcmF3aW5nU3R5bGVzLmxpbmVKb2luICE9PSBsaW5lSm9pbiApIHtcclxuICAgICAgICB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcy5saW5lSm9pbiA9IGxpbmVKb2luO1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZVN0cm9rZSgpO1xyXG5cclxuICAgICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcclxuICAgICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUUGFpbnRhYmxlRHJhd2FibGUgKS5tYXJrRGlydHlMaW5lT3B0aW9ucygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGxpbmVKb2luKCB2YWx1ZTogTGluZUpvaW4gKSB7IHRoaXMuc2V0TGluZUpvaW4oIHZhbHVlICk7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGxpbmVKb2luKCk6IExpbmVKb2luIHsgcmV0dXJuIHRoaXMuZ2V0TGluZUpvaW4oKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCBsaW5lIGpvaW4gc3R5bGUgKGNvbnRyb2xzIGpvaW4gYXBwZWFyYW5jZSBiZXR3ZWVuIGRyYXduIHNlZ21lbnRzKS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldExpbmVKb2luKCk6IExpbmVKb2luIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2xpbmVEcmF3aW5nU3R5bGVzLmxpbmVKb2luO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgbWl0ZXJMaW1pdCB2YWx1ZS4gVGhpcyBkZXRlcm1pbmVzIGhvdyBzaGFycCBhIGNvcm5lciB3aXRoIGxpbmVKb2luOiAnbWl0ZXInIHdpbGwgbmVlZCB0byBiZSBiZWZvcmVcclxuICAgICAqIGl0IGdldHMgY3V0IG9mZiB0byB0aGUgJ2JldmVsJyBiZWhhdmlvci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldE1pdGVyTGltaXQoIG1pdGVyTGltaXQ6IG51bWJlciApOiB0aGlzIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIG1pdGVyTGltaXQgKSwgJ21pdGVyTGltaXQgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcclxuXHJcbiAgICAgIGlmICggdGhpcy5fbGluZURyYXdpbmdTdHlsZXMubWl0ZXJMaW1pdCAhPT0gbWl0ZXJMaW1pdCApIHtcclxuICAgICAgICB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcy5taXRlckxpbWl0ID0gbWl0ZXJMaW1pdDtcclxuICAgICAgICB0aGlzLmludmFsaWRhdGVTdHJva2UoKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XHJcbiAgICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVFBhaW50YWJsZURyYXdhYmxlICkubWFya0RpcnR5TGluZU9wdGlvbnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBtaXRlckxpbWl0KCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldE1pdGVyTGltaXQoIHZhbHVlICk7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IG1pdGVyTGltaXQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0TWl0ZXJMaW1pdCgpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBtaXRlckxpbWl0IHZhbHVlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0TWl0ZXJMaW1pdCgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5fbGluZURyYXdpbmdTdHlsZXMubWl0ZXJMaW1pdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGxpbmUgZGFzaCBwYXR0ZXJuLiBTaG91bGQgYmUgYW4gYXJyYXkgb2YgbnVtYmVycyBcIm9uXCIgYW5kIFwib2ZmXCIgYWx0ZXJuYXRpbmcuIEFuIGVtcHR5IGFycmF5XHJcbiAgICAgKiBpbmRpY2F0ZXMgbm8gZGFzaGluZy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldExpbmVEYXNoKCBsaW5lRGFzaDogbnVtYmVyW10gKTogdGhpcyB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGxpbmVEYXNoICkgJiYgbGluZURhc2guZXZlcnkoIG4gPT4gdHlwZW9mIG4gPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBuICkgJiYgbiA+PSAwICksXHJcbiAgICAgICAgJ2xpbmVEYXNoIHNob3VsZCBiZSBhbiBhcnJheSBvZiBmaW5pdGUgbm9uLW5lZ2F0aXZlIG51bWJlcnMnICk7XHJcblxyXG4gICAgICBpZiAoIHRoaXMuX2xpbmVEcmF3aW5nU3R5bGVzLmxpbmVEYXNoICE9PSBsaW5lRGFzaCApIHtcclxuICAgICAgICB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcy5saW5lRGFzaCA9IGxpbmVEYXNoIHx8IFtdO1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZVN0cm9rZSgpO1xyXG5cclxuICAgICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcclxuICAgICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUUGFpbnRhYmxlRHJhd2FibGUgKS5tYXJrRGlydHlMaW5lT3B0aW9ucygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGxpbmVEYXNoKCB2YWx1ZTogbnVtYmVyW10gKSB7IHRoaXMuc2V0TGluZURhc2goIHZhbHVlICk7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGxpbmVEYXNoKCk6IG51bWJlcltdIHsgcmV0dXJuIHRoaXMuZ2V0TGluZURhc2goKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgbGluZSBkYXNoIHBhdHRlcm4uIEFuIGVtcHR5IGFycmF5IGlzIHRoZSBkZWZhdWx0LCBpbmRpY2F0aW5nIG5vIGRhc2hpbmcuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRMaW5lRGFzaCgpOiBudW1iZXJbXSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcy5saW5lRGFzaDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgd2hldGhlciB0aGUgc3Ryb2tlIHdpbGwgYmUgZGFzaGVkLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaGFzTGluZURhc2goKTogYm9vbGVhbiB7XHJcbiAgICAgIHJldHVybiAhIXRoaXMuX2xpbmVEcmF3aW5nU3R5bGVzLmxpbmVEYXNoLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIG9mZnNldCBvZiB0aGUgbGluZSBkYXNoIHBhdHRlcm4gZnJvbSB0aGUgc3RhcnQgb2YgdGhlIHN0cm9rZS4gRGVmYXVsdHMgdG8gMC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldExpbmVEYXNoT2Zmc2V0KCBsaW5lRGFzaE9mZnNldDogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggbGluZURhc2hPZmZzZXQgKSxcclxuICAgICAgICBgbGluZURhc2hPZmZzZXQgc2hvdWxkIGJlIGEgbnVtYmVyLCBub3QgJHtsaW5lRGFzaE9mZnNldH1gICk7XHJcblxyXG4gICAgICBpZiAoIHRoaXMuX2xpbmVEcmF3aW5nU3R5bGVzLmxpbmVEYXNoT2Zmc2V0ICE9PSBsaW5lRGFzaE9mZnNldCApIHtcclxuICAgICAgICB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcy5saW5lRGFzaE9mZnNldCA9IGxpbmVEYXNoT2Zmc2V0O1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZVN0cm9rZSgpO1xyXG5cclxuICAgICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcclxuICAgICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUUGFpbnRhYmxlRHJhd2FibGUgKS5tYXJrRGlydHlMaW5lT3B0aW9ucygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGxpbmVEYXNoT2Zmc2V0KCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldExpbmVEYXNoT2Zmc2V0KCB2YWx1ZSApOyB9XHJcblxyXG4gICAgcHVibGljIGdldCBsaW5lRGFzaE9mZnNldCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRMaW5lRGFzaE9mZnNldCgpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBvZmZzZXQgb2YgdGhlIGxpbmUgZGFzaCBwYXR0ZXJuIGZyb20gdGhlIHN0YXJ0IG9mIHRoZSBzdHJva2UuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRMaW5lRGFzaE9mZnNldCgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5fbGluZURyYXdpbmdTdHlsZXMubGluZURhc2hPZmZzZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBMaW5lU3R5bGVzIG9iamVjdCAoaXQgZGV0ZXJtaW5lcyBzdHJva2UgYXBwZWFyYW5jZSkuIFRoZSBwYXNzZWQtaW4gb2JqZWN0IHdpbGwgYmUgbXV0YXRlZCBhcyBuZWVkZWQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRMaW5lU3R5bGVzKCBsaW5lU3R5bGVzOiBMaW5lU3R5bGVzICk6IHRoaXMge1xyXG4gICAgICB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcyA9IGxpbmVTdHlsZXM7XHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZVN0cm9rZSgpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGxpbmVTdHlsZXMoIHZhbHVlOiBMaW5lU3R5bGVzICkgeyB0aGlzLnNldExpbmVTdHlsZXMoIHZhbHVlICk7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGxpbmVTdHlsZXMoKTogTGluZVN0eWxlcyB7IHJldHVybiB0aGlzLmdldExpbmVTdHlsZXMoKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgY29tcG9zaXRlIHtMaW5lU3R5bGVzfSBvYmplY3QsIHRoYXQgZGV0ZXJtaW5lcyBzdHJva2UgYXBwZWFyYW5jZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldExpbmVTdHlsZXMoKTogTGluZVN0eWxlcyB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGNhY2hlZCBwYWludHMgdG8gdGhlIGlucHV0IGFycmF5IChhIGRlZmVuc2l2ZSBjb3B5KS4gTm90ZSB0aGF0IGl0IGFsc28gZmlsdGVycyBvdXQgZmlsbHMgdGhhdCBhcmVcclxuICAgICAqIG5vdCBjb25zaWRlcmVkIHBhaW50cyAoZS5nLiBzdHJpbmdzLCBDb2xvcnMsIGV0Yy4pLlxyXG4gICAgICpcclxuICAgICAqIFdoZW4gdGhpcyBOb2RlIGlzIGRpc3BsYXllZCBpbiBTVkcsIGl0IHdpbGwgZm9yY2UgdGhlIHByZXNlbmNlIG9mIHRoZSBjYWNoZWQgcGFpbnQgdG8gYmUgc3RvcmVkIGluIHRoZSBTVkcnc1xyXG4gICAgICogPGRlZnM+IGVsZW1lbnQsIHNvIHRoYXQgd2UgY2FuIHN3aXRjaCBxdWlja2x5IHRvIHVzZSB0aGUgZ2l2ZW4gcGFpbnQgKGluc3RlYWQgb2YgaGF2aW5nIHRvIGNyZWF0ZSBpdCBvbiB0aGVcclxuICAgICAqIFNWRy1zaWRlIHdoZW5ldmVyIHRoZSBzd2l0Y2ggaXMgbWFkZSkuXHJcbiAgICAgKlxyXG4gICAgICogQWxzbyBub3RlIHRoYXQgZHVwbGljYXRlIHBhaW50cyBhcmUgYWNjZXB0YWJsZSwgYW5kIGRvbid0IG5lZWQgdG8gYmUgZmlsdGVyZWQgb3V0IGJlZm9yZS1oYW5kLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0Q2FjaGVkUGFpbnRzKCBwYWludHM6IFRQYWludFtdICk6IHRoaXMge1xyXG4gICAgICB0aGlzLl9jYWNoZWRQYWludHMgPSBwYWludHMuZmlsdGVyKCAoIHBhaW50OiBUUGFpbnQgKTogcGFpbnQgaXMgUGFpbnQgPT4gcGFpbnQgaW5zdGFuY2VvZiBQYWludCApO1xyXG5cclxuICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xyXG4gICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUUGFpbnRhYmxlRHJhd2FibGUgKS5tYXJrRGlydHlDYWNoZWRQYWludHMoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBjYWNoZWRQYWludHMoIHZhbHVlOiBUUGFpbnRbXSApIHsgdGhpcy5zZXRDYWNoZWRQYWludHMoIHZhbHVlICk7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGNhY2hlZFBhaW50cygpOiBUUGFpbnRbXSB7IHJldHVybiB0aGlzLmdldENhY2hlZFBhaW50cygpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjYWNoZWQgcGFpbnRzLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0Q2FjaGVkUGFpbnRzKCk6IFRQYWludFtdIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZFBhaW50cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSBjYWNoZWQgcGFpbnQuIERvZXMgbm90aGluZyBpZiBwYWludCBpcyBqdXN0IGEgbm9ybWFsIGZpbGwgKHN0cmluZywgQ29sb3IpLCBidXQgZm9yIGdyYWRpZW50cyBhbmRcclxuICAgICAqIHBhdHRlcm5zLCBpdCB3aWxsIGJlIG1hZGUgZmFzdGVyIHRvIHN3aXRjaCB0by5cclxuICAgICAqXHJcbiAgICAgKiBXaGVuIHRoaXMgTm9kZSBpcyBkaXNwbGF5ZWQgaW4gU1ZHLCBpdCB3aWxsIGZvcmNlIHRoZSBwcmVzZW5jZSBvZiB0aGUgY2FjaGVkIHBhaW50IHRvIGJlIHN0b3JlZCBpbiB0aGUgU1ZHJ3NcclxuICAgICAqIDxkZWZzPiBlbGVtZW50LCBzbyB0aGF0IHdlIGNhbiBzd2l0Y2ggcXVpY2tseSB0byB1c2UgdGhlIGdpdmVuIHBhaW50IChpbnN0ZWFkIG9mIGhhdmluZyB0byBjcmVhdGUgaXQgb24gdGhlXHJcbiAgICAgKiBTVkctc2lkZSB3aGVuZXZlciB0aGUgc3dpdGNoIGlzIG1hZGUpLlxyXG4gICAgICpcclxuICAgICAqIEFsc28gbm90ZSB0aGF0IGR1cGxpY2F0ZSBwYWludHMgYXJlIGFjY2VwdGFibGUsIGFuZCBkb24ndCBuZWVkIHRvIGJlIGZpbHRlcmVkIG91dCBiZWZvcmUtaGFuZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFkZENhY2hlZFBhaW50KCBwYWludDogVFBhaW50ICk6IHZvaWQge1xyXG4gICAgICBpZiAoIHBhaW50IGluc3RhbmNlb2YgUGFpbnQgKSB7XHJcbiAgICAgICAgdGhpcy5fY2FjaGVkUGFpbnRzLnB1c2goIHBhaW50ICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xyXG4gICAgICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRQYWludGFibGVEcmF3YWJsZSApLm1hcmtEaXJ0eUNhY2hlZFBhaW50cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhIGNhY2hlZCBwYWludC4gRG9lcyBub3RoaW5nIGlmIHBhaW50IGlzIGp1c3QgYSBub3JtYWwgZmlsbCAoc3RyaW5nLCBDb2xvciksIGJ1dCBmb3IgZ3JhZGllbnRzIGFuZFxyXG4gICAgICogcGF0dGVybnMgaXQgd2lsbCByZW1vdmUgYW55IGV4aXN0aW5nIGNhY2hlZCBwYWludC4gSWYgaXQgd2FzIGFkZGVkIG1vcmUgdGhhbiBvbmNlLCBpdCB3aWxsIG5lZWQgdG8gYmUgcmVtb3ZlZFxyXG4gICAgICogbW9yZSB0aGFuIG9uY2UuXHJcbiAgICAgKlxyXG4gICAgICogV2hlbiB0aGlzIE5vZGUgaXMgZGlzcGxheWVkIGluIFNWRywgaXQgd2lsbCBmb3JjZSB0aGUgcHJlc2VuY2Ugb2YgdGhlIGNhY2hlZCBwYWludCB0byBiZSBzdG9yZWQgaW4gdGhlIFNWRydzXHJcbiAgICAgKiA8ZGVmcz4gZWxlbWVudCwgc28gdGhhdCB3ZSBjYW4gc3dpdGNoIHF1aWNrbHkgdG8gdXNlIHRoZSBnaXZlbiBwYWludCAoaW5zdGVhZCBvZiBoYXZpbmcgdG8gY3JlYXRlIGl0IG9uIHRoZVxyXG4gICAgICogU1ZHLXNpZGUgd2hlbmV2ZXIgdGhlIHN3aXRjaCBpcyBtYWRlKS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlbW92ZUNhY2hlZFBhaW50KCBwYWludDogVFBhaW50ICk6IHZvaWQge1xyXG4gICAgICBpZiAoIHBhaW50IGluc3RhbmNlb2YgUGFpbnQgKSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggdGhpcy5fY2FjaGVkUGFpbnRzLCBwYWludCApICk7XHJcblxyXG4gICAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLl9jYWNoZWRQYWludHMsIHBhaW50ICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xyXG4gICAgICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRQYWludGFibGVEcmF3YWJsZSApLm1hcmtEaXJ0eUNhY2hlZFBhaW50cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXBwbGllcyB0aGUgZmlsbCB0byBhIENhbnZhcyBjb250ZXh0IHdyYXBwZXIsIGJlZm9yZSBmaWxsaW5nLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgICAqL1xyXG4gICAgcHVibGljIGJlZm9yZUNhbnZhc0ZpbGwoIHdyYXBwZXI6IENhbnZhc0NvbnRleHRXcmFwcGVyICk6IHZvaWQge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmdldEZpbGxWYWx1ZSgpICE9PSBudWxsICk7XHJcblxyXG4gICAgICBjb25zdCBmaWxsVmFsdWUgPSB0aGlzLmdldEZpbGxWYWx1ZSgpITtcclxuXHJcbiAgICAgIHdyYXBwZXIuc2V0RmlsbFN0eWxlKCBmaWxsVmFsdWUgKTtcclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIEZvciBwZXJmb3JtYW5jZSwgd2UgY291bGQgY2hlY2sgdGhpcyBieSBydWxpbmcgb3V0IHN0cmluZyBhbmQgJ3RyYW5zZm9ybU1hdHJpeCcgaW4gZmlsbFZhbHVlXHJcbiAgICAgIGlmICggZmlsbFZhbHVlLnRyYW5zZm9ybU1hdHJpeCApIHtcclxuICAgICAgICB3cmFwcGVyLmNvbnRleHQuc2F2ZSgpO1xyXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgICAgICBmaWxsVmFsdWUudHJhbnNmb3JtTWF0cml4LmNhbnZhc0FwcGVuZFRyYW5zZm9ybSggd3JhcHBlci5jb250ZXh0ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVuLWFwcGxpZXMgdGhlIGZpbGwgdG8gYSBDYW52YXMgY29udGV4dCB3cmFwcGVyLCBhZnRlciBmaWxsaW5nLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFmdGVyQ2FudmFzRmlsbCggd3JhcHBlcjogQ2FudmFzQ29udGV4dFdyYXBwZXIgKTogdm9pZCB7XHJcbiAgICAgIGNvbnN0IGZpbGxWYWx1ZSA9IHRoaXMuZ2V0RmlsbFZhbHVlKCk7XHJcblxyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICAgIGlmICggZmlsbFZhbHVlLnRyYW5zZm9ybU1hdHJpeCApIHtcclxuICAgICAgICB3cmFwcGVyLmNvbnRleHQucmVzdG9yZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBcHBsaWVzIHRoZSBzdHJva2UgdG8gYSBDYW52YXMgY29udGV4dCB3cmFwcGVyLCBiZWZvcmUgc3Ryb2tpbmcuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYmVmb3JlQ2FudmFzU3Ryb2tlKCB3cmFwcGVyOiBDYW52YXNDb250ZXh0V3JhcHBlciApOiB2b2lkIHtcclxuICAgICAgY29uc3Qgc3Ryb2tlVmFsdWUgPSB0aGlzLmdldFN0cm9rZVZhbHVlKCk7XHJcblxyXG4gICAgICAvLyBUT0RPOiBpcyB0aGVyZSBhIGJldHRlciB3YXkgb2Ygbm90IGNhbGxpbmcgc28gbWFueSB0aGluZ3Mgb24gZWFjaCBzdHJva2U/XHJcbiAgICAgIHdyYXBwZXIuc2V0U3Ryb2tlU3R5bGUoIHRoaXMuX3N0cm9rZSApO1xyXG4gICAgICB3cmFwcGVyLnNldExpbmVDYXAoIHRoaXMuZ2V0TGluZUNhcCgpICk7XHJcbiAgICAgIHdyYXBwZXIuc2V0TGluZUpvaW4oIHRoaXMuZ2V0TGluZUpvaW4oKSApO1xyXG5cclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGZvciBwZXJmb3JtYW5jZVxyXG4gICAgICBpZiAoIHN0cm9rZVZhbHVlLnRyYW5zZm9ybU1hdHJpeCApIHtcclxuXHJcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICAgIGNvbnN0IHNjYWxlVmVjdG9yOiBWZWN0b3IyID0gc3Ryb2tlVmFsdWUudHJhbnNmb3JtTWF0cml4LmdldFNjYWxlVmVjdG9yKCk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggTWF0aC5hYnMoIHNjYWxlVmVjdG9yLnggLSBzY2FsZVZlY3Rvci55ICkgPCAxZS03LCAnWW91IGNhbm5vdCBzcGVjaWZ5IGEgcGF0dGVybiBvciBncmFkaWVudCB0byBhIHN0cm9rZSB0aGF0IGRvZXMgbm90IGhhdmUgYSBzeW1tZXRyaWMgc2NhbGUuJyApO1xyXG4gICAgICAgIGNvbnN0IG1hdHJpeE11bHRpcGxpZXIgPSAxIC8gc2NhbGVWZWN0b3IueDtcclxuXHJcbiAgICAgICAgd3JhcHBlci5jb250ZXh0LnNhdmUoKTtcclxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICAgICAgc3Ryb2tlVmFsdWUudHJhbnNmb3JtTWF0cml4LmNhbnZhc0FwcGVuZFRyYW5zZm9ybSggd3JhcHBlci5jb250ZXh0ICk7XHJcblxyXG4gICAgICAgIHdyYXBwZXIuc2V0TGluZVdpZHRoKCB0aGlzLmdldExpbmVXaWR0aCgpICogbWF0cml4TXVsdGlwbGllciApO1xyXG4gICAgICAgIHdyYXBwZXIuc2V0TWl0ZXJMaW1pdCggdGhpcy5nZXRNaXRlckxpbWl0KCkgKiBtYXRyaXhNdWx0aXBsaWVyICk7XHJcbiAgICAgICAgd3JhcHBlci5zZXRMaW5lRGFzaCggdGhpcy5nZXRMaW5lRGFzaCgpLm1hcCggZGFzaCA9PiBkYXNoICogbWF0cml4TXVsdGlwbGllciApICk7XHJcbiAgICAgICAgd3JhcHBlci5zZXRMaW5lRGFzaE9mZnNldCggdGhpcy5nZXRMaW5lRGFzaE9mZnNldCgpICogbWF0cml4TXVsdGlwbGllciApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHdyYXBwZXIuc2V0TGluZVdpZHRoKCB0aGlzLmdldExpbmVXaWR0aCgpICk7XHJcbiAgICAgICAgd3JhcHBlci5zZXRNaXRlckxpbWl0KCB0aGlzLmdldE1pdGVyTGltaXQoKSApO1xyXG4gICAgICAgIHdyYXBwZXIuc2V0TGluZURhc2goIHRoaXMuZ2V0TGluZURhc2goKSApO1xyXG4gICAgICAgIHdyYXBwZXIuc2V0TGluZURhc2hPZmZzZXQoIHRoaXMuZ2V0TGluZURhc2hPZmZzZXQoKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbi1hcHBsaWVzIHRoZSBzdHJva2UgdG8gYSBDYW52YXMgY29udGV4dCB3cmFwcGVyLCBhZnRlciBzdHJva2luZy4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZnRlckNhbnZhc1N0cm9rZSggd3JhcHBlcjogQ2FudmFzQ29udGV4dFdyYXBwZXIgKTogdm9pZCB7XHJcbiAgICAgIGNvbnN0IHN0cm9rZVZhbHVlID0gdGhpcy5nZXRTdHJva2VWYWx1ZSgpO1xyXG5cclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGZvciBwZXJmb3JtYW5jZVxyXG4gICAgICBpZiAoIHN0cm9rZVZhbHVlLnRyYW5zZm9ybU1hdHJpeCApIHtcclxuICAgICAgICB3cmFwcGVyLmNvbnRleHQucmVzdG9yZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiBhcHBsaWNhYmxlLCByZXR1cm5zIHRoZSBDU1MgY29sb3IgZm9yIHRoZSBmaWxsLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0Q1NTRmlsbCgpOiBzdHJpbmcge1xyXG4gICAgICBjb25zdCBmaWxsVmFsdWUgPSB0aGlzLmdldEZpbGxWYWx1ZSgpO1xyXG4gICAgICAvLyBpZiBpdCdzIGEgQ29sb3Igb2JqZWN0LCBnZXQgdGhlIGNvcnJlc3BvbmRpbmcgQ1NTXHJcbiAgICAgIC8vICd0cmFuc3BhcmVudCcgd2lsbCBtYWtlIHVzIGludmlzaWJsZSBpZiB0aGUgZmlsbCBpcyBudWxsXHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSB0b0NTUyBjaGVja3MgZm9yIGNvbG9yLCBsZWZ0IGZvciBwZXJmb3JtYW5jZVxyXG4gICAgICByZXR1cm4gZmlsbFZhbHVlID8gKCBmaWxsVmFsdWUudG9DU1MgPyBmaWxsVmFsdWUudG9DU1MoKSA6IGZpbGxWYWx1ZSApIDogJ3RyYW5zcGFyZW50JztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIElmIGFwcGxpY2FibGUsIHJldHVybnMgdGhlIENTUyBjb2xvciBmb3IgdGhlIHN0cm9rZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFNpbXBsZUNTU1N0cm9rZSgpOiBzdHJpbmcge1xyXG4gICAgICBjb25zdCBzdHJva2VWYWx1ZSA9IHRoaXMuZ2V0U3Ryb2tlVmFsdWUoKTtcclxuICAgICAgLy8gaWYgaXQncyBhIENvbG9yIG9iamVjdCwgZ2V0IHRoZSBjb3JyZXNwb25kaW5nIENTU1xyXG4gICAgICAvLyAndHJhbnNwYXJlbnQnIHdpbGwgbWFrZSB1cyBpbnZpc2libGUgaWYgdGhlIGZpbGwgaXMgbnVsbFxyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gdG9DU1MgY2hlY2tzIGZvciBjb2xvciwgbGVmdCBmb3IgcGVyZm9ybWFuY2VcclxuICAgICAgcmV0dXJuIHN0cm9rZVZhbHVlID8gKCBzdHJva2VWYWx1ZS50b0NTUyA/IHN0cm9rZVZhbHVlLnRvQ1NTKCkgOiBzdHJva2VWYWx1ZSApIDogJ3RyYW5zcGFyZW50JztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGZpbGwtc3BlY2lmaWMgcHJvcGVydHkgc3RyaW5nIGZvciB1c2Ugd2l0aCB0b1N0cmluZygpLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gc3BhY2VzIC0gV2hpdGVzcGFjZSB0byBhZGRcclxuICAgICAqIEBwYXJhbSByZXN1bHRcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFwcGVuZEZpbGxhYmxlUHJvcFN0cmluZyggc3BhY2VzOiBzdHJpbmcsIHJlc3VsdDogc3RyaW5nICk6IHN0cmluZyB7XHJcbiAgICAgIGlmICggdGhpcy5fZmlsbCApIHtcclxuICAgICAgICBpZiAoIHJlc3VsdCApIHtcclxuICAgICAgICAgIHJlc3VsdCArPSAnLFxcbic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggdHlwZW9mIHRoaXMuZ2V0RmlsbFZhbHVlKCkgPT09ICdzdHJpbmcnICkge1xyXG4gICAgICAgICAgcmVzdWx0ICs9IGAke3NwYWNlc31maWxsOiAnJHt0aGlzLmdldEZpbGxWYWx1ZSgpfSdgO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHJlc3VsdCArPSBgJHtzcGFjZXN9ZmlsbDogJHt0aGlzLmdldEZpbGxWYWx1ZSgpfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc3Ryb2tlLXNwZWNpZmljIHByb3BlcnR5IHN0cmluZyBmb3IgdXNlIHdpdGggdG9TdHJpbmcoKS4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHNwYWNlcyAtIFdoaXRlc3BhY2UgdG8gYWRkXHJcbiAgICAgKiBAcGFyYW0gcmVzdWx0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhcHBlbmRTdHJva2FibGVQcm9wU3RyaW5nKCBzcGFjZXM6IHN0cmluZywgcmVzdWx0OiBzdHJpbmcgKTogc3RyaW5nIHtcclxuICAgICAgZnVuY3Rpb24gYWRkUHJvcCgga2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIG5vd3JhcD86IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCByZXN1bHQgKSB7XHJcbiAgICAgICAgICByZXN1bHQgKz0gJyxcXG4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoICFub3dyYXAgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyApIHtcclxuICAgICAgICAgIHJlc3VsdCArPSBgJHtzcGFjZXMgKyBrZXl9OiAnJHt2YWx1ZX0nYDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICByZXN1bHQgKz0gYCR7c3BhY2VzICsga2V5fTogJHt2YWx1ZX1gO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCB0aGlzLl9zdHJva2UgKSB7XHJcbiAgICAgICAgY29uc3QgZGVmYXVsdFN0eWxlcyA9IG5ldyBMaW5lU3R5bGVzKCk7XHJcbiAgICAgICAgY29uc3Qgc3Ryb2tlVmFsdWUgPSB0aGlzLmdldFN0cm9rZVZhbHVlKCk7XHJcbiAgICAgICAgaWYgKCB0eXBlb2Ygc3Ryb2tlVmFsdWUgPT09ICdzdHJpbmcnICkge1xyXG4gICAgICAgICAgYWRkUHJvcCggJ3N0cm9rZScsIHN0cm9rZVZhbHVlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgYWRkUHJvcCggJ3N0cm9rZScsIHN0cm9rZVZhbHVlID8gc3Ryb2tlVmFsdWUudG9TdHJpbmcoKSA6ICdudWxsJywgdHJ1ZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXy5lYWNoKCBbICdsaW5lV2lkdGgnLCAnbGluZUNhcCcsICdtaXRlckxpbWl0JywgJ2xpbmVKb2luJywgJ2xpbmVEYXNoT2Zmc2V0JyBdLCBwcm9wID0+IHtcclxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgICAgICAgIGlmICggdGhpc1sgcHJvcCBdICE9PSBkZWZhdWx0U3R5bGVzWyBwcm9wIF0gKSB7XHJcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgICAgICAgICAgYWRkUHJvcCggcHJvcCwgdGhpc1sgcHJvcCBdICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMubGluZURhc2gubGVuZ3RoICkge1xyXG4gICAgICAgICAgYWRkUHJvcCggJ2xpbmVEYXNoJywgSlNPTi5zdHJpbmdpZnkoIHRoaXMubGluZURhc2ggKSwgdHJ1ZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERldGVybWluZXMgdGhlIGRlZmF1bHQgYWxsb3dlZCByZW5kZXJlcnMgKHJldHVybmVkIHZpYSB0aGUgUmVuZGVyZXIgYml0bWFzaykgdGhhdCBhcmUgYWxsb3dlZCwgZ2l2ZW4gdGhlXHJcbiAgICAgKiBjdXJyZW50IGZpbGwgb3B0aW9ucy4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICAgKlxyXG4gICAgICogVGhpcyB3aWxsIGJlIHVzZWQgZm9yIGFsbCB0eXBlcyB0aGF0IGRpcmVjdGx5IG1peCBpbiBQYWludGFibGUgKGkuZS4gUGF0aCBhbmQgVGV4dCksIGJ1dCBtYXkgYmUgb3ZlcnJpZGRlblxyXG4gICAgICogYnkgc3VidHlwZXMuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgLSBSZW5kZXJlciBiaXRtYXNrLCBzZWUgUmVuZGVyZXIgZm9yIGRldGFpbHNcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEZpbGxSZW5kZXJlckJpdG1hc2soKTogbnVtYmVyIHtcclxuICAgICAgbGV0IGJpdG1hc2sgPSAwO1xyXG5cclxuICAgICAgLy8gU2FmYXJpIDUgaGFzIGJ1Z2d5IGlzc3VlcyB3aXRoIFNWRyBncmFkaWVudHNcclxuICAgICAgaWYgKCAhKCBpc1NhZmFyaTUgJiYgdGhpcy5fZmlsbCBpbnN0YW5jZW9mIEdyYWRpZW50ICkgKSB7XHJcbiAgICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrU1ZHO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB3ZSBhbHdheXMgaGF2ZSBDYW52YXMgc3VwcG9ydD9cclxuICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrQ2FudmFzO1xyXG5cclxuICAgICAgaWYgKCAhdGhpcy5oYXNGaWxsKCkgKSB7XHJcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gZmlsbCwgaXQgaXMgc3VwcG9ydGVkIGJ5IERPTSBhbmQgV2ViR0xcclxuICAgICAgICBiaXRtYXNrIHw9IFJlbmRlcmVyLmJpdG1hc2tET007XHJcbiAgICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrV2ViR0w7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHRoaXMuX2ZpbGwgaW5zdGFuY2VvZiBQYXR0ZXJuICkge1xyXG4gICAgICAgIC8vIG5vIHBhdHRlcm4gc3VwcG9ydCBmb3IgRE9NIG9yIFdlYkdMIChmb3Igbm93ISlcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdGhpcy5fZmlsbCBpbnN0YW5jZW9mIEdyYWRpZW50ICkge1xyXG4gICAgICAgIC8vIG5vIGdyYWRpZW50IHN1cHBvcnQgZm9yIERPTSBvciBXZWJHTCAoZm9yIG5vdyEpXHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gc29saWQgZmlsbHMgYWx3YXlzIHN1cHBvcnRlZCBmb3IgRE9NIGFuZCBXZWJHTFxyXG4gICAgICAgIGJpdG1hc2sgfD0gUmVuZGVyZXIuYml0bWFza0RPTTtcclxuICAgICAgICBiaXRtYXNrIHw9IFJlbmRlcmVyLmJpdG1hc2tXZWJHTDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGJpdG1hc2s7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlcm1pbmVzIHRoZSBkZWZhdWx0IGFsbG93ZWQgcmVuZGVyZXJzIChyZXR1cm5lZCB2aWEgdGhlIFJlbmRlcmVyIGJpdG1hc2spIHRoYXQgYXJlIGFsbG93ZWQsIGdpdmVuIHRoZVxyXG4gICAgICogY3VycmVudCBzdHJva2Ugb3B0aW9ucy4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICAgKlxyXG4gICAgICogVGhpcyB3aWxsIGJlIHVzZWQgZm9yIGFsbCB0eXBlcyB0aGF0IGRpcmVjdGx5IG1peCBpbiBQYWludGFibGUgKGkuZS4gUGF0aCBhbmQgVGV4dCksIGJ1dCBtYXkgYmUgb3ZlcnJpZGRlblxyXG4gICAgICogYnkgc3VidHlwZXMuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgLSBSZW5kZXJlciBiaXRtYXNrLCBzZWUgUmVuZGVyZXIgZm9yIGRldGFpbHNcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFN0cm9rZVJlbmRlcmVyQml0bWFzaygpOiBudW1iZXIge1xyXG4gICAgICBsZXQgYml0bWFzayA9IDA7XHJcblxyXG4gICAgICBiaXRtYXNrIHw9IFJlbmRlcmVyLmJpdG1hc2tDYW52YXM7XHJcblxyXG4gICAgICAvLyBhbHdheXMgaGF2ZSBTVkcgc3VwcG9ydCAoZm9yIG5vdz8pXHJcbiAgICAgIGJpdG1hc2sgfD0gUmVuZGVyZXIuYml0bWFza1NWRztcclxuXHJcbiAgICAgIGlmICggIXRoaXMuaGFzU3Ryb2tlKCkgKSB7XHJcbiAgICAgICAgLy8gYWxsb3cgRE9NIHN1cHBvcnQgaWYgdGhlcmUgaXMgbm8gc3Ryb2tlIChzaW5jZSB0aGUgZmlsbCB3aWxsIGRldGVybWluZSB3aGF0IGlzIGF2YWlsYWJsZSlcclxuICAgICAgICBiaXRtYXNrIHw9IFJlbmRlcmVyLmJpdG1hc2tET007XHJcbiAgICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrV2ViR0w7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBiaXRtYXNrO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW52YWxpZGF0ZXMgb3VyIGN1cnJlbnQgZmlsbCwgdHJpZ2dlcmluZyByZWNvbXB1dGF0aW9uIG9mIGFueXRoaW5nIHRoYXQgZGVwZW5kZWQgb24gdGhlIG9sZCBmaWxsJ3MgdmFsdWVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGludmFsaWRhdGVGaWxsKCk6IHZvaWQge1xyXG4gICAgICB0aGlzLmludmFsaWRhdGVTdXBwb3J0ZWRSZW5kZXJlcnMoKTtcclxuXHJcbiAgICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcclxuICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVFBhaW50YWJsZURyYXdhYmxlICkubWFya0RpcnR5RmlsbCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnZhbGlkYXRlcyBvdXIgY3VycmVudCBzdHJva2UsIHRyaWdnZXJpbmcgcmVjb21wdXRhdGlvbiBvZiBhbnl0aGluZyB0aGF0IGRlcGVuZGVkIG9uIHRoZSBvbGQgc3Ryb2tlJ3MgdmFsdWVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGludmFsaWRhdGVTdHJva2UoKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZVN1cHBvcnRlZFJlbmRlcmVycygpO1xyXG5cclxuICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xyXG4gICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUUGFpbnRhYmxlRHJhd2FibGUgKS5tYXJrRGlydHlTdHJva2UoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbn0gKTtcclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdQYWludGFibGUnLCBQYWludGFibGUgKTtcclxuXHJcbi8vIEB0cy1leHBlY3QtZXJyb3JcclxuUGFpbnRhYmxlLkRFRkFVTFRfT1BUSU9OUyA9IERFRkFVTFRfT1BUSU9OUztcclxuXHJcbmV4cG9ydCB7XHJcbiAgUGFpbnRhYmxlIGFzIGRlZmF1bHQsXHJcbiAgUEFJTlRBQkxFX0RSQVdBQkxFX01BUktfRkxBR1MsXHJcbiAgUEFJTlRBQkxFX09QVElPTl9LRVlTLFxyXG4gIERFRkFVTFRfT1BUSU9OUyxcclxuICBERUZBVUxUX09QVElPTlMgYXMgUEFJTlRBQkxFX0RFRkFVTFRfT1BUSU9OU1xyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZ0JBQWdCLE1BQU0sc0NBQXNDO0FBQ25FLFNBQVNDLDBCQUEwQixFQUFxQkMsVUFBVSxRQUFRLDZCQUE2QjtBQUN2RyxPQUFPQyxXQUFXLE1BQU0s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