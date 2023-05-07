// Copyright 2019-2023, University of Colorado Boulder

/**
 * Mostly like a normal Rectangle (Node), but instead of a hard transition from "in" to "out", it has a defined region
 * of gradients around the edges.
 *
 * Has options for controlling the margin amounts for each side. This will control the area that will be covered
 * by a gradient.
 *
 * You can control the margin amounts for each side individually with:
 * - leftMargin
 * - rightMargin
 * - topMargin
 * - bottomMargin
 *
 * Additionally, the horizontal/vertical margins can also be controlled together with:
 * - xMargin
 * - yMargin
 *
 * And all margins can be controlled together with:
 * - margin
 *
 * These options can be provided in the options object, or can be used with setters/getters (like normal Node
 * options). Note that the getters only work if all equivalent values are the same.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Matrix3 from '../../dot/js/Matrix3.js';
import { Shape } from '../../kite/js/imports.js';
import { ColorDef, LinearGradient, PaintColorProperty, Path, RadialGradient, Rectangle } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';

// constants
const GRADIENT_RECTANGLE_OPTION_KEYS = ['roundMargins', 'border', 'extension', 'margin', 'xMargin', 'yMargin', 'leftMargin', 'rightMargin', 'topMargin', 'bottomMargin'];
export default class GradientRectangle extends Rectangle {
  // Margin amounts for each individual side

  // The starting color stop ratio.

  constructor(providedOptions) {
    super({});
    this._leftMargin = 0;
    this._rightMargin = 0;
    this._topMargin = 0;
    this._bottomMargin = 0;
    this._extension = 0;
    this._roundMargins = true;
    this._fillProperty = new PaintColorProperty(this.fill);
    this._borderOverrideProperty = new PaintColorProperty(null);
    this._borderProperty = new DerivedProperty([this._fillProperty, this._borderOverrideProperty], (fill, borderOverride) => {
      if (this._borderOverrideProperty.paint === null) {
        return fill.withAlpha(0);
      } else {
        return borderOverride;
      }
    });
    this.roundedShape = new Shape().moveTo(0, 0).arc(0, 0, 1, 0, Math.PI / 2, false).close().makeImmutable();
    this.rectangularShape = Shape.rectangle(0, 0, 1, 1).makeImmutable();
    this.leftSide = new Rectangle(0, 0, 1, 1);
    this.rightSide = new Rectangle(0, 0, 1, 1);
    this.topSide = new Rectangle(0, 0, 1, 1);
    this.bottomSide = new Rectangle(0, 0, 1, 1);
    this.topLeftCorner = new Path(null);
    this.topRightCorner = new Path(null);
    this.bottomLeftCorner = new Path(null);
    this.bottomRightCorner = new Path(null);
    this.invalidateGradients();
    this.invalidateRoundMargins();
    this.invalidateMargin();
    this.mutate(providedOptions);
  }

  /**
   * Updates the rounded-ness of the margins.
   */
  invalidateRoundMargins() {
    if (this._roundMargins) {
      this.topLeftCorner.shape = this.roundedShape;
      this.topRightCorner.shape = this.roundedShape;
      this.bottomLeftCorner.shape = this.roundedShape;
      this.bottomRightCorner.shape = this.roundedShape;
    } else {
      this.topLeftCorner.shape = this.rectangularShape;
      this.topRightCorner.shape = this.rectangularShape;
      this.bottomLeftCorner.shape = this.rectangularShape;
      this.bottomRightCorner.shape = this.rectangularShape;
    }
  }

  /**
   * Updates the rounded-ness of the margins.
   */
  invalidateGradients() {
    const linearGradient = new LinearGradient(0, 0, 1, 0).addColorStop(this._extension, this._fillProperty).addColorStop(1, this._borderProperty);
    const radialGradient = new RadialGradient(0, 0, 0, 0, 0, 1).addColorStop(this._extension, this._fillProperty).addColorStop(1, this._borderProperty);
    this.leftSide.fill = linearGradient;
    this.rightSide.fill = linearGradient;
    this.topSide.fill = linearGradient;
    this.bottomSide.fill = linearGradient;
    this.topLeftCorner.fill = radialGradient;
    this.topRightCorner.fill = radialGradient;
    this.bottomLeftCorner.fill = radialGradient;
    this.bottomRightCorner.fill = radialGradient;
  }

  /**
   * Custom behavior so we can see when the rectangle dimensions change.
   */
  invalidateRectangle() {
    super.invalidateRectangle();

    // Update our margins
    this.invalidateMargin();
  }

  /**
   * Handles repositioning of the margins.
   */
  invalidateMargin() {
    this.children = [...(this._leftMargin > 0 && this.rectHeight > 0 ? [this.leftSide] : []), ...(this._rightMargin > 0 && this.rectHeight > 0 ? [this.rightSide] : []), ...(this._topMargin > 0 && this.rectWidth > 0 ? [this.topSide] : []), ...(this._bottomMargin > 0 && this.rectWidth > 0 ? [this.bottomSide] : []), ...(this._topMargin > 0 && this._leftMargin > 0 ? [this.topLeftCorner] : []), ...(this._topMargin > 0 && this._rightMargin > 0 ? [this.topRightCorner] : []), ...(this._bottomMargin > 0 && this._leftMargin > 0 ? [this.bottomLeftCorner] : []), ...(this._bottomMargin > 0 && this._rightMargin > 0 ? [this.bottomRightCorner] : [])];
    const width = this.rectWidth;
    const height = this.rectHeight;
    const left = this.rectX;
    const top = this.rectY;
    const right = this.rectX + width;
    const bottom = this._rectY + height;
    if (this.leftSide.hasParent()) {
      this.leftSide.matrix = new Matrix3().rowMajor(-this._leftMargin, 0, left, 0, height, top, 0, 0, 1);
    }
    if (this.rightSide.hasParent()) {
      this.rightSide.matrix = new Matrix3().rowMajor(this._rightMargin, 0, right, 0, height, top, 0, 0, 1);
    }
    if (this.topSide.hasParent()) {
      this.topSide.matrix = new Matrix3().rowMajor(0, width, left, -this._topMargin, 0, top, 0, 0, 1);
    }
    if (this.bottomSide.hasParent()) {
      this.bottomSide.matrix = new Matrix3().rowMajor(0, width, left, this._bottomMargin, 0, bottom, 0, 0, 1);
    }
    if (this.topLeftCorner.hasParent()) {
      this.topLeftCorner.matrix = new Matrix3().rowMajor(-this._leftMargin, 0, left, 0, -this._topMargin, top, 0, 0, 1);
    }
    if (this.topRightCorner.hasParent()) {
      this.topRightCorner.matrix = new Matrix3().rowMajor(this._rightMargin, 0, right, 0, -this._topMargin, top, 0, 0, 1);
    }
    if (this.bottomLeftCorner.hasParent()) {
      this.bottomLeftCorner.matrix = new Matrix3().rowMajor(-this._leftMargin, 0, left, 0, this._bottomMargin, bottom, 0, 0, 1);
    }
    if (this.bottomRightCorner.hasParent()) {
      this.bottomRightCorner.matrix = new Matrix3().rowMajor(this._rightMargin, 0, right, 0, this._bottomMargin, bottom, 0, 0, 1);
    }
  }

  /**
   * Overrides disposal to clean up some extra things.
   */
  dispose() {
    this._fillProperty.dispose();
    this._borderOverrideProperty.dispose();
    super.dispose();
  }

  /**
   * We want to be notified of fill changes.
   */
  setFill(fill) {
    assert && assert(ColorDef.isColorDef(fill), 'GradientRectangle only supports ColorDef as a fill');
    super.setFill(fill);
    this._fillProperty.paint = fill;
    return this;
  }

  /**
   * We don't want to allow strokes.
   */
  setStroke(stroke) {
    assert && assert(stroke === null, 'GradientRectangle only supports a null stroke');
    super.setStroke(stroke);
    return this;
  }

  /*
   * NOTE TO THE READER:
   * This super-boilerplate-heavy style is made to conform to the guidelines. Sorry!
   */

  /**
   * Sets the left-side margin amount (the amount in local-coordinate units from the left edge of the rectangle to
   * where the margin ends).
   */
  set leftMargin(value) {
    assert && assert(isFinite(value) && value >= 0, 'leftMargin should be a finite non-negative number');
    if (this._leftMargin !== value) {
      this._leftMargin = value;
      this.invalidateMargin();
    }
  }

  /**
   * Gets the left-side margin amount.
   */
  get leftMargin() {
    return this._leftMargin;
  }

  /**
   * Sets the right-side margin amount (the amount in local-coordinate units from the right edge of the rectangle to
   * where the margin ends).
   */
  set rightMargin(value) {
    assert && assert(isFinite(value) && value >= 0, 'rightMargin should be a finite non-negative number');
    if (this._rightMargin !== value) {
      this._rightMargin = value;
      this.invalidateMargin();
    }
  }

  /**
   * Gets the right-side margin amount.
   */
  get rightMargin() {
    return this._rightMargin;
  }

  /**
   * Sets the top-side margin amount (the amount in local-coordinate units from the top edge of the rectangle to
   * where the margin ends).
   */
  set topMargin(value) {
    assert && assert(isFinite(value) && value >= 0, 'topMargin should be a finite non-negative number');
    if (this._topMargin !== value) {
      this._topMargin = value;
      this.invalidateMargin();
    }
  }

  /**
   * Gets the top-side margin amount.
   */
  get topMargin() {
    return this._topMargin;
  }

  /**
   * Sets the bottom-side margin amount (the amount in local-coordinate units from the bottom edge of the rectangle to
   * where the margin ends).
   */
  set bottomMargin(value) {
    assert && assert(isFinite(value) && value >= 0, 'bottomMargin should be a finite non-negative number');
    if (this._bottomMargin !== value) {
      this._bottomMargin = value;
      this.invalidateMargin();
    }
  }

  /**
   * Gets the bottom-side margin amount.
   */
  get bottomMargin() {
    return this._bottomMargin;
  }

  /**
   * Sets the left and right margin amounts.
   */
  set xMargin(value) {
    assert && assert(isFinite(value) && value >= 0, 'xMargin should be a finite non-negative number');
    if (this._leftMargin !== value || this._rightMargin !== value) {
      this._leftMargin = value;
      this._rightMargin = value;
      this.invalidateMargin();
    }
  }

  /**
   * Gets the left and right margin amounts.
   */
  get xMargin() {
    assert && assert(this._leftMargin === this._rightMargin, 'leftMargin and rightMargin differ, so getting xMargin is not well-defined');
    return this._leftMargin;
  }

  /**
   * Sets the top and bottom margin amounts.
   */
  set yMargin(value) {
    assert && assert(isFinite(value) && value >= 0, 'yMargin should be a finite non-negative number');
    if (this._topMargin !== value || this._bottomMargin !== value) {
      this._topMargin = value;
      this._bottomMargin = value;
      this.invalidateMargin();
    }
  }

  /**
   * Gets the top and bottom margin amounts.
   */
  get yMargin() {
    assert && assert(this._topMargin === this._bottomMargin, 'leftMargin and rightMargin differ, so getting yMargin is not well-defined');
    return this._topMargin;
  }

  /**
   * Sets all of the margin amounts.
   */
  set margin(value) {
    assert && assert(isFinite(value) && value >= 0, 'margin should be a finite non-negative number');
    if (this._leftMargin !== value || this._rightMargin !== value || this._topMargin !== value || this._bottomMargin !== value) {
      this._leftMargin = value;
      this._rightMargin = value;
      this._topMargin = value;
      this._bottomMargin = value;
      this.invalidateMargin();
    }
  }

  /**
   * Gets the top and bottom margin amounts.
   */
  get margin() {
    assert && assert(this._leftMargin === this._rightMargin && this._rightMargin === this._topMargin && this._topMargin === this._bottomMargin, 'Some margins differ, so getting margin is not well-defined');
    return this._leftMargin;
  }

  /**
   * Sets whether the corners of the margin will be rounded or not.
   */
  set roundMargins(value) {
    if (this._roundMargins !== value) {
      this._roundMargins = value;
      this.invalidateRoundMargins();
    }
  }

  /**
   * Returns whether the corners of the margin are rounded or not.
   */
  get roundMargins() {
    return this._roundMargins;
  }

  /**
   * Sets the border "fade" color (that is on the other side of the gradient).
   */
  set border(value) {
    assert && assert(ColorDef.isColorDef(value));
    if (this._borderOverrideProperty.paint !== value) {
      this._borderOverrideProperty.paint = value;
    }
  }

  /**
   * Returns the border color (see the setter)
   */
  get border() {
    return this._borderOverrideProperty.paint;
  }

  /**
   * Sets the extension amount (from 0 to <1) of where the "starting" gradient amount should be.
   */
  set extension(value) {
    assert && assert(isFinite(value) && value >= 0 && value < 1);
    if (this._extension !== value) {
      this._extension = value;
      this.invalidateGradients();
    }
  }

  /**
   * Returns the extension amount (see the setter).
   */
  get extension() {
    return this._extension;
  }
  mutate(options) {
    return super.mutate(options);
  }
}

// We use the Node system for mutator keys, so they get added here
GradientRectangle.prototype._mutatorKeys = [...GRADIENT_RECTANGLE_OPTION_KEYS, ...Rectangle.prototype._mutatorKeys];
sceneryPhet.register('GradientRectangle', GradientRectangle);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNYXRyaXgzIiwiU2hhcGUiLCJDb2xvckRlZiIsIkxpbmVhckdyYWRpZW50IiwiUGFpbnRDb2xvclByb3BlcnR5IiwiUGF0aCIsIlJhZGlhbEdyYWRpZW50IiwiUmVjdGFuZ2xlIiwic2NlbmVyeVBoZXQiLCJHUkFESUVOVF9SRUNUQU5HTEVfT1BUSU9OX0tFWVMiLCJHcmFkaWVudFJlY3RhbmdsZSIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwiX2xlZnRNYXJnaW4iLCJfcmlnaHRNYXJnaW4iLCJfdG9wTWFyZ2luIiwiX2JvdHRvbU1hcmdpbiIsIl9leHRlbnNpb24iLCJfcm91bmRNYXJnaW5zIiwiX2ZpbGxQcm9wZXJ0eSIsImZpbGwiLCJfYm9yZGVyT3ZlcnJpZGVQcm9wZXJ0eSIsIl9ib3JkZXJQcm9wZXJ0eSIsImJvcmRlck92ZXJyaWRlIiwicGFpbnQiLCJ3aXRoQWxwaGEiLCJyb3VuZGVkU2hhcGUiLCJtb3ZlVG8iLCJhcmMiLCJNYXRoIiwiUEkiLCJjbG9zZSIsIm1ha2VJbW11dGFibGUiLCJyZWN0YW5ndWxhclNoYXBlIiwicmVjdGFuZ2xlIiwibGVmdFNpZGUiLCJyaWdodFNpZGUiLCJ0b3BTaWRlIiwiYm90dG9tU2lkZSIsInRvcExlZnRDb3JuZXIiLCJ0b3BSaWdodENvcm5lciIsImJvdHRvbUxlZnRDb3JuZXIiLCJib3R0b21SaWdodENvcm5lciIsImludmFsaWRhdGVHcmFkaWVudHMiLCJpbnZhbGlkYXRlUm91bmRNYXJnaW5zIiwiaW52YWxpZGF0ZU1hcmdpbiIsIm11dGF0ZSIsInNoYXBlIiwibGluZWFyR3JhZGllbnQiLCJhZGRDb2xvclN0b3AiLCJyYWRpYWxHcmFkaWVudCIsImludmFsaWRhdGVSZWN0YW5nbGUiLCJjaGlsZHJlbiIsInJlY3RIZWlnaHQiLCJyZWN0V2lkdGgiLCJ3aWR0aCIsImhlaWdodCIsImxlZnQiLCJyZWN0WCIsInRvcCIsInJlY3RZIiwicmlnaHQiLCJib3R0b20iLCJfcmVjdFkiLCJoYXNQYXJlbnQiLCJtYXRyaXgiLCJyb3dNYWpvciIsImRpc3Bvc2UiLCJzZXRGaWxsIiwiYXNzZXJ0IiwiaXNDb2xvckRlZiIsInNldFN0cm9rZSIsInN0cm9rZSIsImxlZnRNYXJnaW4iLCJ2YWx1ZSIsImlzRmluaXRlIiwicmlnaHRNYXJnaW4iLCJ0b3BNYXJnaW4iLCJib3R0b21NYXJnaW4iLCJ4TWFyZ2luIiwieU1hcmdpbiIsIm1hcmdpbiIsInJvdW5kTWFyZ2lucyIsImJvcmRlciIsImV4dGVuc2lvbiIsIm9wdGlvbnMiLCJwcm90b3R5cGUiLCJfbXV0YXRvcktleXMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdyYWRpZW50UmVjdGFuZ2xlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vc3RseSBsaWtlIGEgbm9ybWFsIFJlY3RhbmdsZSAoTm9kZSksIGJ1dCBpbnN0ZWFkIG9mIGEgaGFyZCB0cmFuc2l0aW9uIGZyb20gXCJpblwiIHRvIFwib3V0XCIsIGl0IGhhcyBhIGRlZmluZWQgcmVnaW9uXHJcbiAqIG9mIGdyYWRpZW50cyBhcm91bmQgdGhlIGVkZ2VzLlxyXG4gKlxyXG4gKiBIYXMgb3B0aW9ucyBmb3IgY29udHJvbGxpbmcgdGhlIG1hcmdpbiBhbW91bnRzIGZvciBlYWNoIHNpZGUuIFRoaXMgd2lsbCBjb250cm9sIHRoZSBhcmVhIHRoYXQgd2lsbCBiZSBjb3ZlcmVkXHJcbiAqIGJ5IGEgZ3JhZGllbnQuXHJcbiAqXHJcbiAqIFlvdSBjYW4gY29udHJvbCB0aGUgbWFyZ2luIGFtb3VudHMgZm9yIGVhY2ggc2lkZSBpbmRpdmlkdWFsbHkgd2l0aDpcclxuICogLSBsZWZ0TWFyZ2luXHJcbiAqIC0gcmlnaHRNYXJnaW5cclxuICogLSB0b3BNYXJnaW5cclxuICogLSBib3R0b21NYXJnaW5cclxuICpcclxuICogQWRkaXRpb25hbGx5LCB0aGUgaG9yaXpvbnRhbC92ZXJ0aWNhbCBtYXJnaW5zIGNhbiBhbHNvIGJlIGNvbnRyb2xsZWQgdG9nZXRoZXIgd2l0aDpcclxuICogLSB4TWFyZ2luXHJcbiAqIC0geU1hcmdpblxyXG4gKlxyXG4gKiBBbmQgYWxsIG1hcmdpbnMgY2FuIGJlIGNvbnRyb2xsZWQgdG9nZXRoZXIgd2l0aDpcclxuICogLSBtYXJnaW5cclxuICpcclxuICogVGhlc2Ugb3B0aW9ucyBjYW4gYmUgcHJvdmlkZWQgaW4gdGhlIG9wdGlvbnMgb2JqZWN0LCBvciBjYW4gYmUgdXNlZCB3aXRoIHNldHRlcnMvZ2V0dGVycyAobGlrZSBub3JtYWwgTm9kZVxyXG4gKiBvcHRpb25zKS4gTm90ZSB0aGF0IHRoZSBnZXR0ZXJzIG9ubHkgd29yayBpZiBhbGwgZXF1aXZhbGVudCB2YWx1ZXMgYXJlIHRoZSBzYW1lLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IENvbG9yRGVmLCBUQ29sb3IsIFRQYWludCwgTGluZWFyR3JhZGllbnQsIFBhaW50Q29sb3JQcm9wZXJ0eSwgUGF0aCwgUmFkaWFsR3JhZGllbnQsIFJlY3RhbmdsZSwgUmVjdGFuZ2xlT3B0aW9ucyB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBHUkFESUVOVF9SRUNUQU5HTEVfT1BUSU9OX0tFWVMgPSBbXHJcbiAgJ3JvdW5kTWFyZ2lucycsXHJcbiAgJ2JvcmRlcicsXHJcbiAgJ2V4dGVuc2lvbicsXHJcbiAgJ21hcmdpbicsXHJcbiAgJ3hNYXJnaW4nLFxyXG4gICd5TWFyZ2luJyxcclxuICAnbGVmdE1hcmdpbicsXHJcbiAgJ3JpZ2h0TWFyZ2luJyxcclxuICAndG9wTWFyZ2luJyxcclxuICAnYm90dG9tTWFyZ2luJ1xyXG5dO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG5leHBvcnQgdHlwZSBHcmFkaWVudFJlY3RhbmdsZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFJlY3RhbmdsZU9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmFkaWVudFJlY3RhbmdsZSBleHRlbmRzIFJlY3RhbmdsZSB7XHJcblxyXG4gIC8vIE1hcmdpbiBhbW91bnRzIGZvciBlYWNoIGluZGl2aWR1YWwgc2lkZVxyXG4gIHByaXZhdGUgX2xlZnRNYXJnaW46IG51bWJlcjtcclxuICBwcml2YXRlIF9yaWdodE1hcmdpbjogbnVtYmVyO1xyXG4gIHByaXZhdGUgX3RvcE1hcmdpbjogbnVtYmVyO1xyXG4gIHByaXZhdGUgX2JvdHRvbU1hcmdpbjogbnVtYmVyO1xyXG5cclxuICAvLyBUaGUgc3RhcnRpbmcgY29sb3Igc3RvcCByYXRpby5cclxuICBwcml2YXRlIF9leHRlbnNpb246IG51bWJlcjtcclxuXHJcbiAgcHJpdmF0ZSBfcm91bmRNYXJnaW5zOiBib29sZWFuO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IF9maWxsUHJvcGVydHk6IFBhaW50Q29sb3JQcm9wZXJ0eTtcclxuICBwcml2YXRlIHJlYWRvbmx5IF9ib3JkZXJPdmVycmlkZVByb3BlcnR5OiBQYWludENvbG9yUHJvcGVydHk7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfYm9yZGVyUHJvcGVydHk6IFRDb2xvcjtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSByb3VuZGVkU2hhcGU6IFNoYXBlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVjdGFuZ3VsYXJTaGFwZTogU2hhcGU7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbGVmdFNpZGU6IFJlY3RhbmdsZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IHJpZ2h0U2lkZTogUmVjdGFuZ2xlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdG9wU2lkZTogUmVjdGFuZ2xlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYm90dG9tU2lkZTogUmVjdGFuZ2xlO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IHRvcExlZnRDb3JuZXI6IFBhdGg7XHJcbiAgcHJpdmF0ZSByZWFkb25seSB0b3BSaWdodENvcm5lcjogUGF0aDtcclxuICBwcml2YXRlIHJlYWRvbmx5IGJvdHRvbUxlZnRDb3JuZXI6IFBhdGg7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBib3R0b21SaWdodENvcm5lcjogUGF0aDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBHcmFkaWVudFJlY3RhbmdsZU9wdGlvbnMgKSB7XHJcbiAgICBzdXBlcigge30gKTtcclxuXHJcbiAgICB0aGlzLl9sZWZ0TWFyZ2luID0gMDtcclxuICAgIHRoaXMuX3JpZ2h0TWFyZ2luID0gMDtcclxuICAgIHRoaXMuX3RvcE1hcmdpbiA9IDA7XHJcbiAgICB0aGlzLl9ib3R0b21NYXJnaW4gPSAwO1xyXG4gICAgdGhpcy5fZXh0ZW5zaW9uID0gMDtcclxuICAgIHRoaXMuX3JvdW5kTWFyZ2lucyA9IHRydWU7XHJcbiAgICB0aGlzLl9maWxsUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCB0aGlzLmZpbGwgKTtcclxuICAgIHRoaXMuX2JvcmRlck92ZXJyaWRlUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBudWxsICk7XHJcblxyXG4gICAgdGhpcy5fYm9yZGVyUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbXHJcbiAgICAgIHRoaXMuX2ZpbGxQcm9wZXJ0eSwgdGhpcy5fYm9yZGVyT3ZlcnJpZGVQcm9wZXJ0eVxyXG4gICAgXSwgKCBmaWxsLCBib3JkZXJPdmVycmlkZSApID0+IHtcclxuICAgICAgaWYgKCB0aGlzLl9ib3JkZXJPdmVycmlkZVByb3BlcnR5LnBhaW50ID09PSBudWxsICkge1xyXG4gICAgICAgIHJldHVybiBmaWxsLndpdGhBbHBoYSggMCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBib3JkZXJPdmVycmlkZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucm91bmRlZFNoYXBlID0gbmV3IFNoYXBlKCkubW92ZVRvKCAwLCAwICkuYXJjKCAwLCAwLCAxLCAwLCBNYXRoLlBJIC8gMiwgZmFsc2UgKS5jbG9zZSgpLm1ha2VJbW11dGFibGUoKTtcclxuICAgIHRoaXMucmVjdGFuZ3VsYXJTaGFwZSA9IFNoYXBlLnJlY3RhbmdsZSggMCwgMCwgMSwgMSApLm1ha2VJbW11dGFibGUoKTtcclxuXHJcbiAgICB0aGlzLmxlZnRTaWRlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMSwgMSApO1xyXG4gICAgdGhpcy5yaWdodFNpZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxLCAxICk7XHJcbiAgICB0aGlzLnRvcFNpZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxLCAxICk7XHJcbiAgICB0aGlzLmJvdHRvbVNpZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxLCAxICk7XHJcbiAgICB0aGlzLnRvcExlZnRDb3JuZXIgPSBuZXcgUGF0aCggbnVsbCApO1xyXG4gICAgdGhpcy50b3BSaWdodENvcm5lciA9IG5ldyBQYXRoKCBudWxsICk7XHJcbiAgICB0aGlzLmJvdHRvbUxlZnRDb3JuZXIgPSBuZXcgUGF0aCggbnVsbCApO1xyXG4gICAgdGhpcy5ib3R0b21SaWdodENvcm5lciA9IG5ldyBQYXRoKCBudWxsICk7XHJcblxyXG4gICAgdGhpcy5pbnZhbGlkYXRlR3JhZGllbnRzKCk7XHJcbiAgICB0aGlzLmludmFsaWRhdGVSb3VuZE1hcmdpbnMoKTtcclxuICAgIHRoaXMuaW52YWxpZGF0ZU1hcmdpbigpO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIHJvdW5kZWQtbmVzcyBvZiB0aGUgbWFyZ2lucy5cclxuICAgKi9cclxuICBwcml2YXRlIGludmFsaWRhdGVSb3VuZE1hcmdpbnMoKTogdm9pZCB7XHJcbiAgICBpZiAoIHRoaXMuX3JvdW5kTWFyZ2lucyApIHtcclxuICAgICAgdGhpcy50b3BMZWZ0Q29ybmVyLnNoYXBlID0gdGhpcy5yb3VuZGVkU2hhcGU7XHJcbiAgICAgIHRoaXMudG9wUmlnaHRDb3JuZXIuc2hhcGUgPSB0aGlzLnJvdW5kZWRTaGFwZTtcclxuICAgICAgdGhpcy5ib3R0b21MZWZ0Q29ybmVyLnNoYXBlID0gdGhpcy5yb3VuZGVkU2hhcGU7XHJcbiAgICAgIHRoaXMuYm90dG9tUmlnaHRDb3JuZXIuc2hhcGUgPSB0aGlzLnJvdW5kZWRTaGFwZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnRvcExlZnRDb3JuZXIuc2hhcGUgPSB0aGlzLnJlY3Rhbmd1bGFyU2hhcGU7XHJcbiAgICAgIHRoaXMudG9wUmlnaHRDb3JuZXIuc2hhcGUgPSB0aGlzLnJlY3Rhbmd1bGFyU2hhcGU7XHJcbiAgICAgIHRoaXMuYm90dG9tTGVmdENvcm5lci5zaGFwZSA9IHRoaXMucmVjdGFuZ3VsYXJTaGFwZTtcclxuICAgICAgdGhpcy5ib3R0b21SaWdodENvcm5lci5zaGFwZSA9IHRoaXMucmVjdGFuZ3VsYXJTaGFwZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIHJvdW5kZWQtbmVzcyBvZiB0aGUgbWFyZ2lucy5cclxuICAgKi9cclxuICBwcml2YXRlIGludmFsaWRhdGVHcmFkaWVudHMoKTogdm9pZCB7XHJcbiAgICBjb25zdCBsaW5lYXJHcmFkaWVudCA9IG5ldyBMaW5lYXJHcmFkaWVudCggMCwgMCwgMSwgMCApXHJcbiAgICAgIC5hZGRDb2xvclN0b3AoIHRoaXMuX2V4dGVuc2lvbiwgdGhpcy5fZmlsbFByb3BlcnR5IClcclxuICAgICAgLmFkZENvbG9yU3RvcCggMSwgdGhpcy5fYm9yZGVyUHJvcGVydHkgKTtcclxuXHJcbiAgICBjb25zdCByYWRpYWxHcmFkaWVudCA9IG5ldyBSYWRpYWxHcmFkaWVudCggMCwgMCwgMCwgMCwgMCwgMSApXHJcbiAgICAgIC5hZGRDb2xvclN0b3AoIHRoaXMuX2V4dGVuc2lvbiwgdGhpcy5fZmlsbFByb3BlcnR5IClcclxuICAgICAgLmFkZENvbG9yU3RvcCggMSwgdGhpcy5fYm9yZGVyUHJvcGVydHkgKTtcclxuXHJcbiAgICB0aGlzLmxlZnRTaWRlLmZpbGwgPSBsaW5lYXJHcmFkaWVudDtcclxuICAgIHRoaXMucmlnaHRTaWRlLmZpbGwgPSBsaW5lYXJHcmFkaWVudDtcclxuICAgIHRoaXMudG9wU2lkZS5maWxsID0gbGluZWFyR3JhZGllbnQ7XHJcbiAgICB0aGlzLmJvdHRvbVNpZGUuZmlsbCA9IGxpbmVhckdyYWRpZW50O1xyXG4gICAgdGhpcy50b3BMZWZ0Q29ybmVyLmZpbGwgPSByYWRpYWxHcmFkaWVudDtcclxuICAgIHRoaXMudG9wUmlnaHRDb3JuZXIuZmlsbCA9IHJhZGlhbEdyYWRpZW50O1xyXG4gICAgdGhpcy5ib3R0b21MZWZ0Q29ybmVyLmZpbGwgPSByYWRpYWxHcmFkaWVudDtcclxuICAgIHRoaXMuYm90dG9tUmlnaHRDb3JuZXIuZmlsbCA9IHJhZGlhbEdyYWRpZW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3VzdG9tIGJlaGF2aW9yIHNvIHdlIGNhbiBzZWUgd2hlbiB0aGUgcmVjdGFuZ2xlIGRpbWVuc2lvbnMgY2hhbmdlLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBvdmVycmlkZSBpbnZhbGlkYXRlUmVjdGFuZ2xlKCk6IHZvaWQge1xyXG4gICAgc3VwZXIuaW52YWxpZGF0ZVJlY3RhbmdsZSgpO1xyXG5cclxuICAgIC8vIFVwZGF0ZSBvdXIgbWFyZ2luc1xyXG4gICAgdGhpcy5pbnZhbGlkYXRlTWFyZ2luKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIYW5kbGVzIHJlcG9zaXRpb25pbmcgb2YgdGhlIG1hcmdpbnMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBpbnZhbGlkYXRlTWFyZ2luKCk6IHZvaWQge1xyXG4gICAgdGhpcy5jaGlsZHJlbiA9IFtcclxuICAgICAgLi4uKCB0aGlzLl9sZWZ0TWFyZ2luID4gMCAmJiB0aGlzLnJlY3RIZWlnaHQgPiAwID8gWyB0aGlzLmxlZnRTaWRlIF0gOiBbXSApLFxyXG4gICAgICAuLi4oIHRoaXMuX3JpZ2h0TWFyZ2luID4gMCAmJiB0aGlzLnJlY3RIZWlnaHQgPiAwID8gWyB0aGlzLnJpZ2h0U2lkZSBdIDogW10gKSxcclxuICAgICAgLi4uKCB0aGlzLl90b3BNYXJnaW4gPiAwICYmIHRoaXMucmVjdFdpZHRoID4gMCA/IFsgdGhpcy50b3BTaWRlIF0gOiBbXSApLFxyXG4gICAgICAuLi4oIHRoaXMuX2JvdHRvbU1hcmdpbiA+IDAgJiYgdGhpcy5yZWN0V2lkdGggPiAwID8gWyB0aGlzLmJvdHRvbVNpZGUgXSA6IFtdICksXHJcbiAgICAgIC4uLiggdGhpcy5fdG9wTWFyZ2luID4gMCAmJiB0aGlzLl9sZWZ0TWFyZ2luID4gMCA/IFsgdGhpcy50b3BMZWZ0Q29ybmVyIF0gOiBbXSApLFxyXG4gICAgICAuLi4oIHRoaXMuX3RvcE1hcmdpbiA+IDAgJiYgdGhpcy5fcmlnaHRNYXJnaW4gPiAwID8gWyB0aGlzLnRvcFJpZ2h0Q29ybmVyIF0gOiBbXSApLFxyXG4gICAgICAuLi4oIHRoaXMuX2JvdHRvbU1hcmdpbiA+IDAgJiYgdGhpcy5fbGVmdE1hcmdpbiA+IDAgPyBbIHRoaXMuYm90dG9tTGVmdENvcm5lciBdIDogW10gKSxcclxuICAgICAgLi4uKCB0aGlzLl9ib3R0b21NYXJnaW4gPiAwICYmIHRoaXMuX3JpZ2h0TWFyZ2luID4gMCA/IFsgdGhpcy5ib3R0b21SaWdodENvcm5lciBdIDogW10gKVxyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMucmVjdFdpZHRoO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5yZWN0SGVpZ2h0O1xyXG5cclxuICAgIGNvbnN0IGxlZnQgPSB0aGlzLnJlY3RYO1xyXG4gICAgY29uc3QgdG9wID0gdGhpcy5yZWN0WTtcclxuICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5yZWN0WCArIHdpZHRoO1xyXG4gICAgY29uc3QgYm90dG9tID0gdGhpcy5fcmVjdFkgKyBoZWlnaHQ7XHJcblxyXG4gICAgaWYgKCB0aGlzLmxlZnRTaWRlLmhhc1BhcmVudCgpICkge1xyXG4gICAgICB0aGlzLmxlZnRTaWRlLm1hdHJpeCA9IG5ldyBNYXRyaXgzKCkucm93TWFqb3IoXHJcbiAgICAgICAgLXRoaXMuX2xlZnRNYXJnaW4sIDAsIGxlZnQsXHJcbiAgICAgICAgMCwgaGVpZ2h0LCB0b3AsXHJcbiAgICAgICAgMCwgMCwgMVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLnJpZ2h0U2lkZS5oYXNQYXJlbnQoKSApIHtcclxuICAgICAgdGhpcy5yaWdodFNpZGUubWF0cml4ID0gbmV3IE1hdHJpeDMoKS5yb3dNYWpvcihcclxuICAgICAgICB0aGlzLl9yaWdodE1hcmdpbiwgMCwgcmlnaHQsXHJcbiAgICAgICAgMCwgaGVpZ2h0LCB0b3AsXHJcbiAgICAgICAgMCwgMCwgMVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLnRvcFNpZGUuaGFzUGFyZW50KCkgKSB7XHJcbiAgICAgIHRoaXMudG9wU2lkZS5tYXRyaXggPSBuZXcgTWF0cml4MygpLnJvd01ham9yKFxyXG4gICAgICAgIDAsIHdpZHRoLCBsZWZ0LFxyXG4gICAgICAgIC10aGlzLl90b3BNYXJnaW4sIDAsIHRvcCxcclxuICAgICAgICAwLCAwLCAxXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIHRoaXMuYm90dG9tU2lkZS5oYXNQYXJlbnQoKSApIHtcclxuICAgICAgdGhpcy5ib3R0b21TaWRlLm1hdHJpeCA9IG5ldyBNYXRyaXgzKCkucm93TWFqb3IoXHJcbiAgICAgICAgMCwgd2lkdGgsIGxlZnQsXHJcbiAgICAgICAgdGhpcy5fYm90dG9tTWFyZ2luLCAwLCBib3R0b20sXHJcbiAgICAgICAgMCwgMCwgMVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLnRvcExlZnRDb3JuZXIuaGFzUGFyZW50KCkgKSB7XHJcbiAgICAgIHRoaXMudG9wTGVmdENvcm5lci5tYXRyaXggPSBuZXcgTWF0cml4MygpLnJvd01ham9yKFxyXG4gICAgICAgIC10aGlzLl9sZWZ0TWFyZ2luLCAwLCBsZWZ0LFxyXG4gICAgICAgIDAsIC10aGlzLl90b3BNYXJnaW4sIHRvcCxcclxuICAgICAgICAwLCAwLCAxXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIHRoaXMudG9wUmlnaHRDb3JuZXIuaGFzUGFyZW50KCkgKSB7XHJcbiAgICAgIHRoaXMudG9wUmlnaHRDb3JuZXIubWF0cml4ID0gbmV3IE1hdHJpeDMoKS5yb3dNYWpvcihcclxuICAgICAgICB0aGlzLl9yaWdodE1hcmdpbiwgMCwgcmlnaHQsXHJcbiAgICAgICAgMCwgLXRoaXMuX3RvcE1hcmdpbiwgdG9wLFxyXG4gICAgICAgIDAsIDAsIDFcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIGlmICggdGhpcy5ib3R0b21MZWZ0Q29ybmVyLmhhc1BhcmVudCgpICkge1xyXG4gICAgICB0aGlzLmJvdHRvbUxlZnRDb3JuZXIubWF0cml4ID0gbmV3IE1hdHJpeDMoKS5yb3dNYWpvcihcclxuICAgICAgICAtdGhpcy5fbGVmdE1hcmdpbiwgMCwgbGVmdCxcclxuICAgICAgICAwLCB0aGlzLl9ib3R0b21NYXJnaW4sIGJvdHRvbSxcclxuICAgICAgICAwLCAwLCAxXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIHRoaXMuYm90dG9tUmlnaHRDb3JuZXIuaGFzUGFyZW50KCkgKSB7XHJcbiAgICAgIHRoaXMuYm90dG9tUmlnaHRDb3JuZXIubWF0cml4ID0gbmV3IE1hdHJpeDMoKS5yb3dNYWpvcihcclxuICAgICAgICB0aGlzLl9yaWdodE1hcmdpbiwgMCwgcmlnaHQsXHJcbiAgICAgICAgMCwgdGhpcy5fYm90dG9tTWFyZ2luLCBib3R0b20sXHJcbiAgICAgICAgMCwgMCwgMVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT3ZlcnJpZGVzIGRpc3Bvc2FsIHRvIGNsZWFuIHVwIHNvbWUgZXh0cmEgdGhpbmdzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5fZmlsbFByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuX2JvcmRlck92ZXJyaWRlUHJvcGVydHkuZGlzcG9zZSgpO1xyXG5cclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdlIHdhbnQgdG8gYmUgbm90aWZpZWQgb2YgZmlsbCBjaGFuZ2VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBzZXRGaWxsKCBmaWxsOiBUUGFpbnQgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBDb2xvckRlZi5pc0NvbG9yRGVmKCBmaWxsICksICdHcmFkaWVudFJlY3RhbmdsZSBvbmx5IHN1cHBvcnRzIENvbG9yRGVmIGFzIGEgZmlsbCcgKTtcclxuXHJcbiAgICBzdXBlci5zZXRGaWxsKCBmaWxsICk7XHJcblxyXG4gICAgdGhpcy5fZmlsbFByb3BlcnR5LnBhaW50ID0gZmlsbDtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdlIGRvbid0IHdhbnQgdG8gYWxsb3cgc3Ryb2tlcy5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgc2V0U3Ryb2tlKCBzdHJva2U6IFRQYWludCApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHN0cm9rZSA9PT0gbnVsbCwgJ0dyYWRpZW50UmVjdGFuZ2xlIG9ubHkgc3VwcG9ydHMgYSBudWxsIHN0cm9rZScgKTtcclxuXHJcbiAgICBzdXBlci5zZXRTdHJva2UoIHN0cm9rZSApO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBOT1RFIFRPIFRIRSBSRUFERVI6XHJcbiAgICogVGhpcyBzdXBlci1ib2lsZXJwbGF0ZS1oZWF2eSBzdHlsZSBpcyBtYWRlIHRvIGNvbmZvcm0gdG8gdGhlIGd1aWRlbGluZXMuIFNvcnJ5IVxyXG4gICAqL1xyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBsZWZ0LXNpZGUgbWFyZ2luIGFtb3VudCAodGhlIGFtb3VudCBpbiBsb2NhbC1jb29yZGluYXRlIHVuaXRzIGZyb20gdGhlIGxlZnQgZWRnZSBvZiB0aGUgcmVjdGFuZ2xlIHRvXHJcbiAgICogd2hlcmUgdGhlIG1hcmdpbiBlbmRzKS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IGxlZnRNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdmFsdWUgKSAmJiB2YWx1ZSA+PSAwLFxyXG4gICAgICAnbGVmdE1hcmdpbiBzaG91bGQgYmUgYSBmaW5pdGUgbm9uLW5lZ2F0aXZlIG51bWJlcicgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX2xlZnRNYXJnaW4gIT09IHZhbHVlICkge1xyXG4gICAgICB0aGlzLl9sZWZ0TWFyZ2luID0gdmFsdWU7XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVNYXJnaW4oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGxlZnQtc2lkZSBtYXJnaW4gYW1vdW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgbGVmdE1hcmdpbigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2xlZnRNYXJnaW47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSByaWdodC1zaWRlIG1hcmdpbiBhbW91bnQgKHRoZSBhbW91bnQgaW4gbG9jYWwtY29vcmRpbmF0ZSB1bml0cyBmcm9tIHRoZSByaWdodCBlZGdlIG9mIHRoZSByZWN0YW5nbGUgdG9cclxuICAgKiB3aGVyZSB0aGUgbWFyZ2luIGVuZHMpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgcmlnaHRNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdmFsdWUgKSAmJiB2YWx1ZSA+PSAwLFxyXG4gICAgICAncmlnaHRNYXJnaW4gc2hvdWxkIGJlIGEgZmluaXRlIG5vbi1uZWdhdGl2ZSBudW1iZXInICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9yaWdodE1hcmdpbiAhPT0gdmFsdWUgKSB7XHJcbiAgICAgIHRoaXMuX3JpZ2h0TWFyZ2luID0gdmFsdWU7XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVNYXJnaW4oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHJpZ2h0LXNpZGUgbWFyZ2luIGFtb3VudC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHJpZ2h0TWFyZ2luKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fcmlnaHRNYXJnaW47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB0b3Atc2lkZSBtYXJnaW4gYW1vdW50ICh0aGUgYW1vdW50IGluIGxvY2FsLWNvb3JkaW5hdGUgdW5pdHMgZnJvbSB0aGUgdG9wIGVkZ2Ugb2YgdGhlIHJlY3RhbmdsZSB0b1xyXG4gICAqIHdoZXJlIHRoZSBtYXJnaW4gZW5kcykuXHJcbiAgICovXHJcbiAgcHVibGljIHNldCB0b3BNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdmFsdWUgKSAmJiB2YWx1ZSA+PSAwLFxyXG4gICAgICAndG9wTWFyZ2luIHNob3VsZCBiZSBhIGZpbml0ZSBub24tbmVnYXRpdmUgbnVtYmVyJyApO1xyXG5cclxuICAgIGlmICggdGhpcy5fdG9wTWFyZ2luICE9PSB2YWx1ZSApIHtcclxuICAgICAgdGhpcy5fdG9wTWFyZ2luID0gdmFsdWU7XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVNYXJnaW4oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHRvcC1zaWRlIG1hcmdpbiBhbW91bnQuXHJcbiAgICovXHJcbiAgcHVibGljIGdldCB0b3BNYXJnaW4oKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl90b3BNYXJnaW47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBib3R0b20tc2lkZSBtYXJnaW4gYW1vdW50ICh0aGUgYW1vdW50IGluIGxvY2FsLWNvb3JkaW5hdGUgdW5pdHMgZnJvbSB0aGUgYm90dG9tIGVkZ2Ugb2YgdGhlIHJlY3RhbmdsZSB0b1xyXG4gICAqIHdoZXJlIHRoZSBtYXJnaW4gZW5kcykuXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBib3R0b21NYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdmFsdWUgKSAmJiB2YWx1ZSA+PSAwLFxyXG4gICAgICAnYm90dG9tTWFyZ2luIHNob3VsZCBiZSBhIGZpbml0ZSBub24tbmVnYXRpdmUgbnVtYmVyJyApO1xyXG5cclxuICAgIGlmICggdGhpcy5fYm90dG9tTWFyZ2luICE9PSB2YWx1ZSApIHtcclxuICAgICAgdGhpcy5fYm90dG9tTWFyZ2luID0gdmFsdWU7XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVNYXJnaW4oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGJvdHRvbS1zaWRlIG1hcmdpbiBhbW91bnQuXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBib3R0b21NYXJnaW4oKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9ib3R0b21NYXJnaW47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBsZWZ0IGFuZCByaWdodCBtYXJnaW4gYW1vdW50cy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IHhNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdmFsdWUgKSAmJiB2YWx1ZSA+PSAwLFxyXG4gICAgICAneE1hcmdpbiBzaG91bGQgYmUgYSBmaW5pdGUgbm9uLW5lZ2F0aXZlIG51bWJlcicgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX2xlZnRNYXJnaW4gIT09IHZhbHVlIHx8IHRoaXMuX3JpZ2h0TWFyZ2luICE9PSB2YWx1ZSApIHtcclxuICAgICAgdGhpcy5fbGVmdE1hcmdpbiA9IHZhbHVlO1xyXG4gICAgICB0aGlzLl9yaWdodE1hcmdpbiA9IHZhbHVlO1xyXG5cclxuICAgICAgdGhpcy5pbnZhbGlkYXRlTWFyZ2luKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBsZWZ0IGFuZCByaWdodCBtYXJnaW4gYW1vdW50cy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHhNYXJnaW4oKTogbnVtYmVyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2xlZnRNYXJnaW4gPT09IHRoaXMuX3JpZ2h0TWFyZ2luLFxyXG4gICAgICAnbGVmdE1hcmdpbiBhbmQgcmlnaHRNYXJnaW4gZGlmZmVyLCBzbyBnZXR0aW5nIHhNYXJnaW4gaXMgbm90IHdlbGwtZGVmaW5lZCcgKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5fbGVmdE1hcmdpbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHRvcCBhbmQgYm90dG9tIG1hcmdpbiBhbW91bnRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgeU1hcmdpbiggdmFsdWU6IG51bWJlciApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB2YWx1ZSApICYmIHZhbHVlID49IDAsXHJcbiAgICAgICd5TWFyZ2luIHNob3VsZCBiZSBhIGZpbml0ZSBub24tbmVnYXRpdmUgbnVtYmVyJyApO1xyXG5cclxuICAgIGlmICggdGhpcy5fdG9wTWFyZ2luICE9PSB2YWx1ZSB8fCB0aGlzLl9ib3R0b21NYXJnaW4gIT09IHZhbHVlICkge1xyXG4gICAgICB0aGlzLl90b3BNYXJnaW4gPSB2YWx1ZTtcclxuICAgICAgdGhpcy5fYm90dG9tTWFyZ2luID0gdmFsdWU7XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVNYXJnaW4oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHRvcCBhbmQgYm90dG9tIG1hcmdpbiBhbW91bnRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgeU1hcmdpbigpOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fdG9wTWFyZ2luID09PSB0aGlzLl9ib3R0b21NYXJnaW4sXHJcbiAgICAgICdsZWZ0TWFyZ2luIGFuZCByaWdodE1hcmdpbiBkaWZmZXIsIHNvIGdldHRpbmcgeU1hcmdpbiBpcyBub3Qgd2VsbC1kZWZpbmVkJyApO1xyXG5cclxuICAgIHJldHVybiB0aGlzLl90b3BNYXJnaW47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGFsbCBvZiB0aGUgbWFyZ2luIGFtb3VudHMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBtYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdmFsdWUgKSAmJiB2YWx1ZSA+PSAwLFxyXG4gICAgICAnbWFyZ2luIHNob3VsZCBiZSBhIGZpbml0ZSBub24tbmVnYXRpdmUgbnVtYmVyJyApO1xyXG5cclxuICAgIGlmICggdGhpcy5fbGVmdE1hcmdpbiAhPT0gdmFsdWUgfHwgdGhpcy5fcmlnaHRNYXJnaW4gIT09IHZhbHVlIHx8IHRoaXMuX3RvcE1hcmdpbiAhPT0gdmFsdWUgfHwgdGhpcy5fYm90dG9tTWFyZ2luICE9PSB2YWx1ZSApIHtcclxuICAgICAgdGhpcy5fbGVmdE1hcmdpbiA9IHZhbHVlO1xyXG4gICAgICB0aGlzLl9yaWdodE1hcmdpbiA9IHZhbHVlO1xyXG4gICAgICB0aGlzLl90b3BNYXJnaW4gPSB2YWx1ZTtcclxuICAgICAgdGhpcy5fYm90dG9tTWFyZ2luID0gdmFsdWU7XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVNYXJnaW4oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHRvcCBhbmQgYm90dG9tIG1hcmdpbiBhbW91bnRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgbWFyZ2luKCk6IG51bWJlciB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9sZWZ0TWFyZ2luID09PSB0aGlzLl9yaWdodE1hcmdpbiAmJiB0aGlzLl9yaWdodE1hcmdpbiA9PT0gdGhpcy5fdG9wTWFyZ2luICYmIHRoaXMuX3RvcE1hcmdpbiA9PT0gdGhpcy5fYm90dG9tTWFyZ2luLFxyXG4gICAgICAnU29tZSBtYXJnaW5zIGRpZmZlciwgc28gZ2V0dGluZyBtYXJnaW4gaXMgbm90IHdlbGwtZGVmaW5lZCcgKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5fbGVmdE1hcmdpbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgd2hldGhlciB0aGUgY29ybmVycyBvZiB0aGUgbWFyZ2luIHdpbGwgYmUgcm91bmRlZCBvciBub3QuXHJcbiAgICovXHJcbiAgcHVibGljIHNldCByb3VuZE1hcmdpbnMoIHZhbHVlOiBib29sZWFuICkge1xyXG4gICAgaWYgKCB0aGlzLl9yb3VuZE1hcmdpbnMgIT09IHZhbHVlICkge1xyXG4gICAgICB0aGlzLl9yb3VuZE1hcmdpbnMgPSB2YWx1ZTtcclxuXHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZVJvdW5kTWFyZ2lucygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBjb3JuZXJzIG9mIHRoZSBtYXJnaW4gYXJlIHJvdW5kZWQgb3Igbm90LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgcm91bmRNYXJnaW5zKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3JvdW5kTWFyZ2lucztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGJvcmRlciBcImZhZGVcIiBjb2xvciAodGhhdCBpcyBvbiB0aGUgb3RoZXIgc2lkZSBvZiB0aGUgZ3JhZGllbnQpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgYm9yZGVyKCB2YWx1ZTogVFBhaW50ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQ29sb3JEZWYuaXNDb2xvckRlZiggdmFsdWUgKSApO1xyXG5cclxuICAgIGlmICggdGhpcy5fYm9yZGVyT3ZlcnJpZGVQcm9wZXJ0eS5wYWludCAhPT0gdmFsdWUgKSB7XHJcbiAgICAgIHRoaXMuX2JvcmRlck92ZXJyaWRlUHJvcGVydHkucGFpbnQgPSB2YWx1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGJvcmRlciBjb2xvciAoc2VlIHRoZSBzZXR0ZXIpXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBib3JkZXIoKTogVFBhaW50IHtcclxuICAgIHJldHVybiB0aGlzLl9ib3JkZXJPdmVycmlkZVByb3BlcnR5LnBhaW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgZXh0ZW5zaW9uIGFtb3VudCAoZnJvbSAwIHRvIDwxKSBvZiB3aGVyZSB0aGUgXCJzdGFydGluZ1wiIGdyYWRpZW50IGFtb3VudCBzaG91bGQgYmUuXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBleHRlbnNpb24oIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdmFsdWUgKSAmJiB2YWx1ZSA+PSAwICYmIHZhbHVlIDwgMSApO1xyXG5cclxuICAgIGlmICggdGhpcy5fZXh0ZW5zaW9uICE9PSB2YWx1ZSApIHtcclxuICAgICAgdGhpcy5fZXh0ZW5zaW9uID0gdmFsdWU7XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVHcmFkaWVudHMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGV4dGVuc2lvbiBhbW91bnQgKHNlZSB0aGUgc2V0dGVyKS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGV4dGVuc2lvbigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2V4dGVuc2lvbjtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBtdXRhdGUoIG9wdGlvbnM/OiBHcmFkaWVudFJlY3RhbmdsZU9wdGlvbnMgKTogdGhpcyB7XHJcbiAgICByZXR1cm4gc3VwZXIubXV0YXRlKCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBXZSB1c2UgdGhlIE5vZGUgc3lzdGVtIGZvciBtdXRhdG9yIGtleXMsIHNvIHRoZXkgZ2V0IGFkZGVkIGhlcmVcclxuR3JhZGllbnRSZWN0YW5nbGUucHJvdG90eXBlLl9tdXRhdG9yS2V5cyA9IFtcclxuICAuLi5HUkFESUVOVF9SRUNUQU5HTEVfT1BUSU9OX0tFWVMsXHJcbiAgLi4uUmVjdGFuZ2xlLnByb3RvdHlwZS5fbXV0YXRvcktleXNcclxuXTtcclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVy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