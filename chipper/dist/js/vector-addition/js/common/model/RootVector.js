// Copyright 2019-2023, University of Colorado Boulder

/**
 * RootVector is the root class for vector models, for all types of vectors.
 * It is abstract and intended to be subclassed.
 *
 * For an overview of the class hierarchy, see
 * https://github.com/phetsims/vector-addition/blob/master/doc/implementation-notes.md
 *
 * Responsibilities are:
 *  - tip and tail position Properties
 *  - components (x and y as scalars, or in other words the actual vector <x, y>)
 *  - vector color palette
 *  - abstract method for label information, see getLabelContent
 *
 * @author Brandon Li
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import vectorAddition from '../../vectorAddition.js';
import VectorAdditionConstants from '../VectorAdditionConstants.js';
import VectorColorPalette from './VectorColorPalette.js';
export default class RootVector {
  /**
   * @abstract
   * @param {Vector2} initialTailPosition - starting tail position of the vector
   * @param {Vector2} initialComponents - starting components of the vector
   * @param {VectorColorPalette} vectorColorPalette - color palette for this vector
   * @param {string|null} symbol - the symbol for the vector (i.e. 'a', 'b', 'c', ...)
   */
  constructor(initialTailPosition, initialComponents, vectorColorPalette, symbol) {
    assert && assert(initialTailPosition instanceof Vector2, `invalid initialTailPosition: ${initialTailPosition}`);
    assert && assert(initialComponents instanceof Vector2, `invalid initialComponents: ${initialComponents}`);
    assert && assert(vectorColorPalette instanceof VectorColorPalette, `invalid vectorColorPalette: ${vectorColorPalette}`);
    assert && assert(typeof symbol === 'string' || symbol === null, `invalid symbol: ${symbol}`);

    // @public (read-only) {Vector2Property} the vector's components, its x and y scalar values
    this.vectorComponentsProperty = new Vector2Property(initialComponents);

    // @public (read-only) {Vector2Property} the tail position of the vector on the graph
    this.tailPositionProperty = new Vector2Property(initialTailPosition);

    // @public (read-only) {DerivedProperty.<Vector2>} the tip position of the vector on the graph
    // dispose is unnecessary, since this class owns all dependencies.
    this.tipPositionProperty = new DerivedProperty([this.tailPositionProperty, this.vectorComponentsProperty], (tailPosition, vectorComponents) => tailPosition.plus(vectorComponents), {
      valueType: Vector2
    });

    // @public (read-only) {VectorColorPalette} the color palette used to render the vector
    this.vectorColorPalette = vectorColorPalette;

    // @public (read-only) {string} the symbol used to represent the vector
    this.symbol = symbol;
  }

  /**
   * Resets the vector.
   * @public
   */
  reset() {
    this.vectorComponentsProperty.reset();
    this.tailPositionProperty.reset();
  }

  /**
   * Gets the label content information to display on the vector. Labels are different for different vector types.
   *
   * For instance, vectors with values visible display their symbol (i.e. a, b, c, ...) AND their magnitude, while
   * their component vectors only display the x or y component. In the same example, vectors display their magnitude
   * (which is always positive), while component vectors display the component vector's scalar value, which may be
   * negative.
   *
   * Additionally, the label displays different content depending on the screen.
   * See https://github.com/phetsims/vector-addition/issues/39.
   *
   * There are 5 different factors for determining what the label displays:
   *  - Whether the vector has a coefficient and if it should display it
   *  - Whether the values are visible (determined by the values checkbox)
   *  - Whether the magnitude/component is of length 0. See
   *    https://docs.google.com/document/d/1opnDgqIqIroo8VK0CbOyQ5608_g11MSGZXnFlI8k5Ds/edit#bookmark=id.kmeaaeg3ukx9
   *  - Whether the vector has a symbol (e.g. the vectors on lab screen don't have symbols)
   *  - Whether the vector is active (https://github.com/phetsims/vector-addition/issues/39#issuecomment-506586411)
   *
   * These factors play different roles for different vector types, making it difficult to generalize. Thus, an
   * abstract method is used to determine the content.
   *
   * @abstract
   * @public
   * @param {boolean} valuesVisible - whether the values are visible (determined by the Values checkbox)
   * @returns {Object} a description of the label, with these fields:
   *
   * {
   *    // The coefficient (e.g. if the label displayed '|3v|=15', the coefficient would be '3').
   *    // Null means to not display a coefficient
   *    coefficient: {string|null},
   *
   *    // The symbol (e.g. if the label displayed '|3v|=15', the symbol would be 'v').
   *    // Null means to not display a symbol
   *    symbol: {string|null},
   *
   *    // The value (e.g. if the label displayed '|3v|=15', the value would be '=15').
   *    // Null means to not display a value
   *    value: {string|null},
   *
   *    // Include absolute value bars (e.g. if the label displayed '|3v|=15 the includeAbsoluteValueBars
   *    // would be true)
   *    includeAbsoluteValueBars: {boolean}
   * }
   */
  getLabelContent(valuesVisible) {
    throw new Error('getLabelContent must be implemented by subclass');
  }

  /**
   * Gets the components (scalars) of the vector.
   * @public
   * @returns {Vector2}
   */
  get vectorComponents() {
    return this.vectorComponentsProperty.value;
  }

  /**
   * Sets the components (scalars) of the vector
   * @public
   * @param {Vector2} vectorComponents
   */
  set vectorComponents(vectorComponents) {
    assert && assert(vectorComponents instanceof Vector2, `invalid vectorComponents: ${vectorComponents}`);
    this.vectorComponentsProperty.value = vectorComponents;
  }

  /**
   * Gets the magnitude of the vector (always positive).
   * @public
   * @returns {number}
   */
  get magnitude() {
    return this.vectorComponents.magnitude;
  }

  /**
   * Gets the x component (scalar).
   * @public
   * @returns {number}
   */
  get xComponent() {
    return this.vectorComponents.x;
  }

  /**
   * Sets the x component (scalar).
   * @public
   * @param {number} xComponent
   */
  set xComponent(xComponent) {
    assert && assert(typeof xComponent === 'number', `invalid xComponent: ${xComponent}`);
    this.vectorComponents = this.vectorComponents.copy().setX(xComponent);
  }

  /**
   * Gets the y component (scalar).
   * @public
   * @returns {number}
   */
  get yComponent() {
    return this.vectorComponents.y;
  }

  /**
   * Sets the y component (scalar).
   * @public
   * @param {number} yComponent
   */
  set yComponent(yComponent) {
    assert && assert(typeof yComponent === 'number', `invalid yComponent: ${yComponent}`);
    this.vectorComponents = this.vectorComponents.copy().setY(yComponent);
  }

  /**
   * Is either of this vector's components effectively zero?
   * See https://github.com/phetsims/vector-addition/issues/264
   * @public
   * @returns {boolean}
   */
  hasZeroComponent() {
    return Math.abs(this.xComponent) < VectorAdditionConstants.ZERO_THRESHOLD || Math.abs(this.yComponent) < VectorAdditionConstants.ZERO_THRESHOLD;
  }

  /**
   * Moves the vector to the specified tail position.
   * This keeps the magnitude constant, and (as a side effect) changes the tip position.
   * @public
   * @param {Vector2} position
   */
  moveToTailPosition(position) {
    this.tailPositionProperty.value = position;
  }

  /**
   * Sets the tail position.
   * This keeps the tip position constant, and (as a side effect) changes magnitude.
   * @public
   * @param {number} x
   * @param {number} y
   */
  setTailXY(x, y) {
    assert && assert(typeof x === 'number', `invalid x: ${x}`);
    assert && assert(typeof y === 'number', `invalid y: ${y}`);

    // Keep a reference to the original tip
    const tip = this.tip;
    this.moveToTailPosition(new Vector2(x, y));

    // Set the tip back
    this.tip = tip;
  }

  /**
   * Sets the tail position.
   * This keeps the tip position constant, and (as a side effect) changes magnitude.
   * @public
   * @param {Vector2} tail
   */
  set tail(tail) {
    assert && assert(tail instanceof Vector2, `invalid tail: ${tail}`);
    this.setTailXY(tail.x, tail.y);
  }

  /**
   * Gets the tail position.
   * @public
   * @returns {Vector2}
   */
  get tail() {
    return this.tailPositionProperty.value;
  }

  /**
   * Sets the tail's x coordinate.
   * This keeps the tip position constant, and (as a side effect) changes magnitude.
   * @public
   * @param {number} tailX
   */
  set tailX(tailX) {
    this.setTailXY(tailX, this.tailY);
  }

  /**
   * Gets the tail's x coordinate.
   * @public
   * @returns {number}
   */
  get tailX() {
    return this.tailPositionProperty.value.x;
  }

  /**
   * Sets the tail's y coordinate.
   * This keeps the tip position constant, and (as a side effect) changes magnitude.
   * @public
   * @param {number} tailY
   */
  set tailY(tailY) {
    this.setTailXY(this.tailX, tailY);
  }

  /**
   * Gets the tail's y coordinate.
   * @public
   * @returns {number}
   */
  get tailY() {
    return this.tailPositionProperty.value.y;
  }

  /**
   * Sets the tip position.
   * This keeps the tail position constant, and (as a side effect) changes magnitude.
   * @public
   * @param {number} x
   * @param {number} y
   */
  setTipXY(x, y) {
    assert && assert(typeof x === 'number', `invalid x: ${x}`);
    assert && assert(typeof y === 'number', `invalid y: ${y}`);

    // Since tipPositionProperty is a DerivedProperty, we cannot directly set it.
    // Instead, we will update the vector components, keeping the tail constant.
    const tip = new Vector2(x, y);
    this.vectorComponents = this.vectorComponents.plus(tip.minus(this.tip));
  }

  /**
   * Sets the tip position.
   * This keeps the tail position constant, and (as a side effect) changes magnitude.
   * @public
   * @param {Vector2} tip
   */
  set tip(tip) {
    assert && assert(tip instanceof Vector2, `invalid tip: ${tip}`);
    this.setTipXY(tip.x, tip.y);
  }

  /**
   * Gets the tip position.
   * @public
   * @returns {Vector2}
   */
  get tip() {
    return this.tipPositionProperty.value;
  }

  /**
   * Gets the tip's x coordinate.
   * @public
   * @returns {number}
   */
  get tipX() {
    return this.tipPositionProperty.value.x;
  }

  /**
   * Gets the tip's y coordinate.
   * @public
   * @returns {number}
   */
  get tipY() {
    return this.tipPositionProperty.value.y;
  }

  /**
   * Gets the angle of the vector in radians, measured clockwise from the horizontal.
   * null when the vector has 0 magnitude.
   * @public
   * @returns {number|null}
   */
  get angle() {
    return this.vectorComponents.equalsEpsilon(Vector2.ZERO, 1e-7) ? null : this.vectorComponents.angle;
  }

  /**
   * Gets the angle of the vector in degrees, measured clockwise from the horizontal.
   * null when the vector has 0 magnitude.
   * @public
   * @returns {number|null}
   */
  get angleDegrees() {
    const angleRadians = this.angle;
    return angleRadians === null ? null : Utils.toDegrees(angleRadians);
  }
}
vectorAddition.register('RootVector', RootVector);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJVdGlscyIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJ2ZWN0b3JBZGRpdGlvbiIsIlZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIiwiVmVjdG9yQ29sb3JQYWxldHRlIiwiUm9vdFZlY3RvciIsImNvbnN0cnVjdG9yIiwiaW5pdGlhbFRhaWxQb3NpdGlvbiIsImluaXRpYWxDb21wb25lbnRzIiwidmVjdG9yQ29sb3JQYWxldHRlIiwic3ltYm9sIiwiYXNzZXJ0IiwidmVjdG9yQ29tcG9uZW50c1Byb3BlcnR5IiwidGFpbFBvc2l0aW9uUHJvcGVydHkiLCJ0aXBQb3NpdGlvblByb3BlcnR5IiwidGFpbFBvc2l0aW9uIiwidmVjdG9yQ29tcG9uZW50cyIsInBsdXMiLCJ2YWx1ZVR5cGUiLCJyZXNldCIsImdldExhYmVsQ29udGVudCIsInZhbHVlc1Zpc2libGUiLCJFcnJvciIsInZhbHVlIiwibWFnbml0dWRlIiwieENvbXBvbmVudCIsIngiLCJjb3B5Iiwic2V0WCIsInlDb21wb25lbnQiLCJ5Iiwic2V0WSIsImhhc1plcm9Db21wb25lbnQiLCJNYXRoIiwiYWJzIiwiWkVST19USFJFU0hPTEQiLCJtb3ZlVG9UYWlsUG9zaXRpb24iLCJwb3NpdGlvbiIsInNldFRhaWxYWSIsInRpcCIsInRhaWwiLCJ0YWlsWCIsInRhaWxZIiwic2V0VGlwWFkiLCJtaW51cyIsInRpcFgiLCJ0aXBZIiwiYW5nbGUiLCJlcXVhbHNFcHNpbG9uIiwiWkVSTyIsImFuZ2xlRGVncmVlcyIsImFuZ2xlUmFkaWFucyIsInRvRGVncmVlcyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUm9vdFZlY3Rvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSb290VmVjdG9yIGlzIHRoZSByb290IGNsYXNzIGZvciB2ZWN0b3IgbW9kZWxzLCBmb3IgYWxsIHR5cGVzIG9mIHZlY3RvcnMuXHJcbiAqIEl0IGlzIGFic3RyYWN0IGFuZCBpbnRlbmRlZCB0byBiZSBzdWJjbGFzc2VkLlxyXG4gKlxyXG4gKiBGb3IgYW4gb3ZlcnZpZXcgb2YgdGhlIGNsYXNzIGhpZXJhcmNoeSwgc2VlXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy92ZWN0b3ItYWRkaXRpb24vYmxvYi9tYXN0ZXIvZG9jL2ltcGxlbWVudGF0aW9uLW5vdGVzLm1kXHJcbiAqXHJcbiAqIFJlc3BvbnNpYmlsaXRpZXMgYXJlOlxyXG4gKiAgLSB0aXAgYW5kIHRhaWwgcG9zaXRpb24gUHJvcGVydGllc1xyXG4gKiAgLSBjb21wb25lbnRzICh4IGFuZCB5IGFzIHNjYWxhcnMsIG9yIGluIG90aGVyIHdvcmRzIHRoZSBhY3R1YWwgdmVjdG9yIDx4LCB5PilcclxuICogIC0gdmVjdG9yIGNvbG9yIHBhbGV0dGVcclxuICogIC0gYWJzdHJhY3QgbWV0aG9kIGZvciBsYWJlbCBpbmZvcm1hdGlvbiwgc2VlIGdldExhYmVsQ29udGVudFxyXG4gKlxyXG4gKiBAYXV0aG9yIEJyYW5kb24gTGlcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IHZlY3RvckFkZGl0aW9uIGZyb20gJy4uLy4uL3ZlY3RvckFkZGl0aW9uLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIGZyb20gJy4uL1ZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFZlY3RvckNvbG9yUGFsZXR0ZSBmcm9tICcuL1ZlY3RvckNvbG9yUGFsZXR0ZS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb290VmVjdG9yIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQGFic3RyYWN0XHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBpbml0aWFsVGFpbFBvc2l0aW9uIC0gc3RhcnRpbmcgdGFpbCBwb3NpdGlvbiBvZiB0aGUgdmVjdG9yXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBpbml0aWFsQ29tcG9uZW50cyAtIHN0YXJ0aW5nIGNvbXBvbmVudHMgb2YgdGhlIHZlY3RvclxyXG4gICAqIEBwYXJhbSB7VmVjdG9yQ29sb3JQYWxldHRlfSB2ZWN0b3JDb2xvclBhbGV0dGUgLSBjb2xvciBwYWxldHRlIGZvciB0aGlzIHZlY3RvclxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IHN5bWJvbCAtIHRoZSBzeW1ib2wgZm9yIHRoZSB2ZWN0b3IgKGkuZS4gJ2EnLCAnYicsICdjJywgLi4uKVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBpbml0aWFsVGFpbFBvc2l0aW9uLCBpbml0aWFsQ29tcG9uZW50cywgdmVjdG9yQ29sb3JQYWxldHRlLCBzeW1ib2wgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5pdGlhbFRhaWxQb3NpdGlvbiBpbnN0YW5jZW9mIFZlY3RvcjIsIGBpbnZhbGlkIGluaXRpYWxUYWlsUG9zaXRpb246ICR7aW5pdGlhbFRhaWxQb3NpdGlvbn1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbml0aWFsQ29tcG9uZW50cyBpbnN0YW5jZW9mIFZlY3RvcjIsIGBpbnZhbGlkIGluaXRpYWxDb21wb25lbnRzOiAke2luaXRpYWxDb21wb25lbnRzfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlY3RvckNvbG9yUGFsZXR0ZSBpbnN0YW5jZW9mIFZlY3RvckNvbG9yUGFsZXR0ZSwgYGludmFsaWQgdmVjdG9yQ29sb3JQYWxldHRlOiAke3ZlY3RvckNvbG9yUGFsZXR0ZX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygc3ltYm9sID09PSAnc3RyaW5nJyB8fCBzeW1ib2wgPT09IG51bGwsIGBpbnZhbGlkIHN5bWJvbDogJHtzeW1ib2x9YCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1ZlY3RvcjJQcm9wZXJ0eX0gdGhlIHZlY3RvcidzIGNvbXBvbmVudHMsIGl0cyB4IGFuZCB5IHNjYWxhciB2YWx1ZXNcclxuICAgIHRoaXMudmVjdG9yQ29tcG9uZW50c1Byb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggaW5pdGlhbENvbXBvbmVudHMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtWZWN0b3IyUHJvcGVydHl9IHRoZSB0YWlsIHBvc2l0aW9uIG9mIHRoZSB2ZWN0b3Igb24gdGhlIGdyYXBoXHJcbiAgICB0aGlzLnRhaWxQb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggaW5pdGlhbFRhaWxQb3NpdGlvbiApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge0Rlcml2ZWRQcm9wZXJ0eS48VmVjdG9yMj59IHRoZSB0aXAgcG9zaXRpb24gb2YgdGhlIHZlY3RvciBvbiB0aGUgZ3JhcGhcclxuICAgIC8vIGRpc3Bvc2UgaXMgdW5uZWNlc3NhcnksIHNpbmNlIHRoaXMgY2xhc3Mgb3ducyBhbGwgZGVwZW5kZW5jaWVzLlxyXG4gICAgdGhpcy50aXBQb3NpdGlvblByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB0aGlzLnRhaWxQb3NpdGlvblByb3BlcnR5LCB0aGlzLnZlY3RvckNvbXBvbmVudHNQcm9wZXJ0eSBdLFxyXG4gICAgICAoIHRhaWxQb3NpdGlvbiwgdmVjdG9yQ29tcG9uZW50cyApID0+IHRhaWxQb3NpdGlvbi5wbHVzKCB2ZWN0b3JDb21wb25lbnRzICksXHJcbiAgICAgIHsgdmFsdWVUeXBlOiBWZWN0b3IyIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7VmVjdG9yQ29sb3JQYWxldHRlfSB0aGUgY29sb3IgcGFsZXR0ZSB1c2VkIHRvIHJlbmRlciB0aGUgdmVjdG9yXHJcbiAgICB0aGlzLnZlY3RvckNvbG9yUGFsZXR0ZSA9IHZlY3RvckNvbG9yUGFsZXR0ZTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtzdHJpbmd9IHRoZSBzeW1ib2wgdXNlZCB0byByZXByZXNlbnQgdGhlIHZlY3RvclxyXG4gICAgdGhpcy5zeW1ib2wgPSBzeW1ib2w7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIHZlY3Rvci5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnZlY3RvckNvbXBvbmVudHNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy50YWlsUG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgbGFiZWwgY29udGVudCBpbmZvcm1hdGlvbiB0byBkaXNwbGF5IG9uIHRoZSB2ZWN0b3IuIExhYmVscyBhcmUgZGlmZmVyZW50IGZvciBkaWZmZXJlbnQgdmVjdG9yIHR5cGVzLlxyXG4gICAqXHJcbiAgICogRm9yIGluc3RhbmNlLCB2ZWN0b3JzIHdpdGggdmFsdWVzIHZpc2libGUgZGlzcGxheSB0aGVpciBzeW1ib2wgKGkuZS4gYSwgYiwgYywgLi4uKSBBTkQgdGhlaXIgbWFnbml0dWRlLCB3aGlsZVxyXG4gICAqIHRoZWlyIGNvbXBvbmVudCB2ZWN0b3JzIG9ubHkgZGlzcGxheSB0aGUgeCBvciB5IGNvbXBvbmVudC4gSW4gdGhlIHNhbWUgZXhhbXBsZSwgdmVjdG9ycyBkaXNwbGF5IHRoZWlyIG1hZ25pdHVkZVxyXG4gICAqICh3aGljaCBpcyBhbHdheXMgcG9zaXRpdmUpLCB3aGlsZSBjb21wb25lbnQgdmVjdG9ycyBkaXNwbGF5IHRoZSBjb21wb25lbnQgdmVjdG9yJ3Mgc2NhbGFyIHZhbHVlLCB3aGljaCBtYXkgYmVcclxuICAgKiBuZWdhdGl2ZS5cclxuICAgKlxyXG4gICAqIEFkZGl0aW9uYWxseSwgdGhlIGxhYmVsIGRpc3BsYXlzIGRpZmZlcmVudCBjb250ZW50IGRlcGVuZGluZyBvbiB0aGUgc2NyZWVuLlxyXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdmVjdG9yLWFkZGl0aW9uL2lzc3Vlcy8zOS5cclxuICAgKlxyXG4gICAqIFRoZXJlIGFyZSA1IGRpZmZlcmVudCBmYWN0b3JzIGZvciBkZXRlcm1pbmluZyB3aGF0IHRoZSBsYWJlbCBkaXNwbGF5czpcclxuICAgKiAgLSBXaGV0aGVyIHRoZSB2ZWN0b3IgaGFzIGEgY29lZmZpY2llbnQgYW5kIGlmIGl0IHNob3VsZCBkaXNwbGF5IGl0XHJcbiAgICogIC0gV2hldGhlciB0aGUgdmFsdWVzIGFyZSB2aXNpYmxlIChkZXRlcm1pbmVkIGJ5IHRoZSB2YWx1ZXMgY2hlY2tib3gpXHJcbiAgICogIC0gV2hldGhlciB0aGUgbWFnbml0dWRlL2NvbXBvbmVudCBpcyBvZiBsZW5ndGggMC4gU2VlXHJcbiAgICogICAgaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xb3BuRGdxSXFJcm9vOFZLMENiT3lRNTYwOF9nMTFNU0daWG5GbEk4azVEcy9lZGl0I2Jvb2ttYXJrPWlkLmttZWFhZWczdWt4OVxyXG4gICAqICAtIFdoZXRoZXIgdGhlIHZlY3RvciBoYXMgYSBzeW1ib2wgKGUuZy4gdGhlIHZlY3RvcnMgb24gbGFiIHNjcmVlbiBkb24ndCBoYXZlIHN5bWJvbHMpXHJcbiAgICogIC0gV2hldGhlciB0aGUgdmVjdG9yIGlzIGFjdGl2ZSAoaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlY3Rvci1hZGRpdGlvbi9pc3N1ZXMvMzkjaXNzdWVjb21tZW50LTUwNjU4NjQxMSlcclxuICAgKlxyXG4gICAqIFRoZXNlIGZhY3RvcnMgcGxheSBkaWZmZXJlbnQgcm9sZXMgZm9yIGRpZmZlcmVudCB2ZWN0b3IgdHlwZXMsIG1ha2luZyBpdCBkaWZmaWN1bHQgdG8gZ2VuZXJhbGl6ZS4gVGh1cywgYW5cclxuICAgKiBhYnN0cmFjdCBtZXRob2QgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIGNvbnRlbnQuXHJcbiAgICpcclxuICAgKiBAYWJzdHJhY3RcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtib29sZWFufSB2YWx1ZXNWaXNpYmxlIC0gd2hldGhlciB0aGUgdmFsdWVzIGFyZSB2aXNpYmxlIChkZXRlcm1pbmVkIGJ5IHRoZSBWYWx1ZXMgY2hlY2tib3gpXHJcbiAgICogQHJldHVybnMge09iamVjdH0gYSBkZXNjcmlwdGlvbiBvZiB0aGUgbGFiZWwsIHdpdGggdGhlc2UgZmllbGRzOlxyXG4gICAqXHJcbiAgICoge1xyXG4gICAqICAgIC8vIFRoZSBjb2VmZmljaWVudCAoZS5nLiBpZiB0aGUgbGFiZWwgZGlzcGxheWVkICd8M3Z8PTE1JywgdGhlIGNvZWZmaWNpZW50IHdvdWxkIGJlICczJykuXHJcbiAgICogICAgLy8gTnVsbCBtZWFucyB0byBub3QgZGlzcGxheSBhIGNvZWZmaWNpZW50XHJcbiAgICogICAgY29lZmZpY2llbnQ6IHtzdHJpbmd8bnVsbH0sXHJcbiAgICpcclxuICAgKiAgICAvLyBUaGUgc3ltYm9sIChlLmcuIGlmIHRoZSBsYWJlbCBkaXNwbGF5ZWQgJ3wzdnw9MTUnLCB0aGUgc3ltYm9sIHdvdWxkIGJlICd2JykuXHJcbiAgICogICAgLy8gTnVsbCBtZWFucyB0byBub3QgZGlzcGxheSBhIHN5bWJvbFxyXG4gICAqICAgIHN5bWJvbDoge3N0cmluZ3xudWxsfSxcclxuICAgKlxyXG4gICAqICAgIC8vIFRoZSB2YWx1ZSAoZS5nLiBpZiB0aGUgbGFiZWwgZGlzcGxheWVkICd8M3Z8PTE1JywgdGhlIHZhbHVlIHdvdWxkIGJlICc9MTUnKS5cclxuICAgKiAgICAvLyBOdWxsIG1lYW5zIHRvIG5vdCBkaXNwbGF5IGEgdmFsdWVcclxuICAgKiAgICB2YWx1ZToge3N0cmluZ3xudWxsfSxcclxuICAgKlxyXG4gICAqICAgIC8vIEluY2x1ZGUgYWJzb2x1dGUgdmFsdWUgYmFycyAoZS5nLiBpZiB0aGUgbGFiZWwgZGlzcGxheWVkICd8M3Z8PTE1IHRoZSBpbmNsdWRlQWJzb2x1dGVWYWx1ZUJhcnNcclxuICAgKiAgICAvLyB3b3VsZCBiZSB0cnVlKVxyXG4gICAqICAgIGluY2x1ZGVBYnNvbHV0ZVZhbHVlQmFyczoge2Jvb2xlYW59XHJcbiAgICogfVxyXG4gICAqL1xyXG4gIGdldExhYmVsQ29udGVudCggdmFsdWVzVmlzaWJsZSApIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ2dldExhYmVsQ29udGVudCBtdXN0IGJlIGltcGxlbWVudGVkIGJ5IHN1YmNsYXNzJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgY29tcG9uZW50cyAoc2NhbGFycykgb2YgdGhlIHZlY3Rvci5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgZ2V0IHZlY3RvckNvbXBvbmVudHMoKSB7IHJldHVybiB0aGlzLnZlY3RvckNvbXBvbmVudHNQcm9wZXJ0eS52YWx1ZTsgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBjb21wb25lbnRzIChzY2FsYXJzKSBvZiB0aGUgdmVjdG9yXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gdmVjdG9yQ29tcG9uZW50c1xyXG4gICAqL1xyXG4gIHNldCB2ZWN0b3JDb21wb25lbnRzKCB2ZWN0b3JDb21wb25lbnRzICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmVjdG9yQ29tcG9uZW50cyBpbnN0YW5jZW9mIFZlY3RvcjIsIGBpbnZhbGlkIHZlY3RvckNvbXBvbmVudHM6ICR7dmVjdG9yQ29tcG9uZW50c31gICk7XHJcbiAgICB0aGlzLnZlY3RvckNvbXBvbmVudHNQcm9wZXJ0eS52YWx1ZSA9IHZlY3RvckNvbXBvbmVudHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBtYWduaXR1ZGUgb2YgdGhlIHZlY3RvciAoYWx3YXlzIHBvc2l0aXZlKS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXQgbWFnbml0dWRlKCkgeyByZXR1cm4gdGhpcy52ZWN0b3JDb21wb25lbnRzLm1hZ25pdHVkZTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB4IGNvbXBvbmVudCAoc2NhbGFyKS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXQgeENvbXBvbmVudCgpIHsgcmV0dXJuIHRoaXMudmVjdG9yQ29tcG9uZW50cy54OyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHggY29tcG9uZW50IChzY2FsYXIpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge251bWJlcn0geENvbXBvbmVudFxyXG4gICAqL1xyXG4gIHNldCB4Q29tcG9uZW50KCB4Q29tcG9uZW50ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHhDb21wb25lbnQgPT09ICdudW1iZXInLCBgaW52YWxpZCB4Q29tcG9uZW50OiAke3hDb21wb25lbnR9YCApO1xyXG4gICAgdGhpcy52ZWN0b3JDb21wb25lbnRzID0gdGhpcy52ZWN0b3JDb21wb25lbnRzLmNvcHkoKS5zZXRYKCB4Q29tcG9uZW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB5IGNvbXBvbmVudCAoc2NhbGFyKS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXQgeUNvbXBvbmVudCgpIHsgcmV0dXJuIHRoaXMudmVjdG9yQ29tcG9uZW50cy55OyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHkgY29tcG9uZW50IChzY2FsYXIpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge251bWJlcn0geUNvbXBvbmVudFxyXG4gICAqL1xyXG4gIHNldCB5Q29tcG9uZW50KCB5Q29tcG9uZW50ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHlDb21wb25lbnQgPT09ICdudW1iZXInLCBgaW52YWxpZCB5Q29tcG9uZW50OiAke3lDb21wb25lbnR9YCApO1xyXG4gICAgdGhpcy52ZWN0b3JDb21wb25lbnRzID0gdGhpcy52ZWN0b3JDb21wb25lbnRzLmNvcHkoKS5zZXRZKCB5Q29tcG9uZW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJcyBlaXRoZXIgb2YgdGhpcyB2ZWN0b3IncyBjb21wb25lbnRzIGVmZmVjdGl2ZWx5IHplcm8/XHJcbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy92ZWN0b3ItYWRkaXRpb24vaXNzdWVzLzI2NFxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBoYXNaZXJvQ29tcG9uZW50KCkge1xyXG4gICAgcmV0dXJuIE1hdGguYWJzKCB0aGlzLnhDb21wb25lbnQgKSA8IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlpFUk9fVEhSRVNIT0xEIHx8XHJcbiAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMueUNvbXBvbmVudCApIDwgVmVjdG9yQWRkaXRpb25Db25zdGFudHMuWkVST19USFJFU0hPTEQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlcyB0aGUgdmVjdG9yIHRvIHRoZSBzcGVjaWZpZWQgdGFpbCBwb3NpdGlvbi5cclxuICAgKiBUaGlzIGtlZXBzIHRoZSBtYWduaXR1ZGUgY29uc3RhbnQsIGFuZCAoYXMgYSBzaWRlIGVmZmVjdCkgY2hhbmdlcyB0aGUgdGlwIHBvc2l0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXHJcbiAgICovXHJcbiAgbW92ZVRvVGFpbFBvc2l0aW9uKCBwb3NpdGlvbiApIHtcclxuICAgIHRoaXMudGFpbFBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBwb3NpdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHRhaWwgcG9zaXRpb24uXHJcbiAgICogVGhpcyBrZWVwcyB0aGUgdGlwIHBvc2l0aW9uIGNvbnN0YW50LCBhbmQgKGFzIGEgc2lkZSBlZmZlY3QpIGNoYW5nZXMgbWFnbml0dWRlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICovXHJcbiAgc2V0VGFpbFhZKCB4LCB5ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHggPT09ICdudW1iZXInLCBgaW52YWxpZCB4OiAke3h9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHkgPT09ICdudW1iZXInLCBgaW52YWxpZCB5OiAke3l9YCApO1xyXG5cclxuICAgIC8vIEtlZXAgYSByZWZlcmVuY2UgdG8gdGhlIG9yaWdpbmFsIHRpcFxyXG4gICAgY29uc3QgdGlwID0gdGhpcy50aXA7XHJcblxyXG4gICAgdGhpcy5tb3ZlVG9UYWlsUG9zaXRpb24oIG5ldyBWZWN0b3IyKCB4LCB5ICkgKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIHRpcCBiYWNrXHJcbiAgICB0aGlzLnRpcCA9IHRpcDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHRhaWwgcG9zaXRpb24uXHJcbiAgICogVGhpcyBrZWVwcyB0aGUgdGlwIHBvc2l0aW9uIGNvbnN0YW50LCBhbmQgKGFzIGEgc2lkZSBlZmZlY3QpIGNoYW5nZXMgbWFnbml0dWRlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHRhaWxcclxuICAgKi9cclxuICBzZXQgdGFpbCggdGFpbCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRhaWwgaW5zdGFuY2VvZiBWZWN0b3IyLCBgaW52YWxpZCB0YWlsOiAke3RhaWx9YCApO1xyXG4gICAgdGhpcy5zZXRUYWlsWFkoIHRhaWwueCwgdGFpbC55ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB0YWlsIHBvc2l0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKi9cclxuICBnZXQgdGFpbCgpIHsgcmV0dXJuIHRoaXMudGFpbFBvc2l0aW9uUHJvcGVydHkudmFsdWU7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdGFpbCdzIHggY29vcmRpbmF0ZS5cclxuICAgKiBUaGlzIGtlZXBzIHRoZSB0aXAgcG9zaXRpb24gY29uc3RhbnQsIGFuZCAoYXMgYSBzaWRlIGVmZmVjdCkgY2hhbmdlcyBtYWduaXR1ZGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0YWlsWFxyXG4gICAqL1xyXG4gIHNldCB0YWlsWCggdGFpbFggKSB7XHJcbiAgICB0aGlzLnNldFRhaWxYWSggdGFpbFgsIHRoaXMudGFpbFkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHRhaWwncyB4IGNvb3JkaW5hdGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0IHRhaWxYKCkgeyByZXR1cm4gdGhpcy50YWlsUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54OyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHRhaWwncyB5IGNvb3JkaW5hdGUuXHJcbiAgICogVGhpcyBrZWVwcyB0aGUgdGlwIHBvc2l0aW9uIGNvbnN0YW50LCBhbmQgKGFzIGEgc2lkZSBlZmZlY3QpIGNoYW5nZXMgbWFnbml0dWRlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdGFpbFlcclxuICAgKi9cclxuICBzZXQgdGFpbFkoIHRhaWxZICkge1xyXG4gICAgdGhpcy5zZXRUYWlsWFkoIHRoaXMudGFpbFgsIHRhaWxZICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB0YWlsJ3MgeSBjb29yZGluYXRlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldCB0YWlsWSgpIHsgcmV0dXJuIHRoaXMudGFpbFBvc2l0aW9uUHJvcGVydHkudmFsdWUueTsgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB0aXAgcG9zaXRpb24uXHJcbiAgICogVGhpcyBrZWVwcyB0aGUgdGFpbCBwb3NpdGlvbiBjb25zdGFudCwgYW5kIChhcyBhIHNpZGUgZWZmZWN0KSBjaGFuZ2VzIG1hZ25pdHVkZS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqL1xyXG4gIHNldFRpcFhZKCB4LCB5ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHggPT09ICdudW1iZXInLCBgaW52YWxpZCB4OiAke3h9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHkgPT09ICdudW1iZXInLCBgaW52YWxpZCB5OiAke3l9YCApO1xyXG5cclxuICAgIC8vIFNpbmNlIHRpcFBvc2l0aW9uUHJvcGVydHkgaXMgYSBEZXJpdmVkUHJvcGVydHksIHdlIGNhbm5vdCBkaXJlY3RseSBzZXQgaXQuXHJcbiAgICAvLyBJbnN0ZWFkLCB3ZSB3aWxsIHVwZGF0ZSB0aGUgdmVjdG9yIGNvbXBvbmVudHMsIGtlZXBpbmcgdGhlIHRhaWwgY29uc3RhbnQuXHJcbiAgICBjb25zdCB0aXAgPSBuZXcgVmVjdG9yMiggeCwgeSApO1xyXG4gICAgdGhpcy52ZWN0b3JDb21wb25lbnRzID0gdGhpcy52ZWN0b3JDb21wb25lbnRzLnBsdXMoIHRpcC5taW51cyggdGhpcy50aXAgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdGlwIHBvc2l0aW9uLlxyXG4gICAqIFRoaXMga2VlcHMgdGhlIHRhaWwgcG9zaXRpb24gY29uc3RhbnQsIGFuZCAoYXMgYSBzaWRlIGVmZmVjdCkgY2hhbmdlcyBtYWduaXR1ZGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gdGlwXHJcbiAgICovXHJcbiAgc2V0IHRpcCggdGlwICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGlwIGluc3RhbmNlb2YgVmVjdG9yMiwgYGludmFsaWQgdGlwOiAke3RpcH1gICk7XHJcbiAgICB0aGlzLnNldFRpcFhZKCB0aXAueCwgdGlwLnkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHRpcCBwb3NpdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgZ2V0IHRpcCgpIHsgcmV0dXJuIHRoaXMudGlwUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB0aXAncyB4IGNvb3JkaW5hdGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0IHRpcFgoKSB7IHJldHVybiB0aGlzLnRpcFBvc2l0aW9uUHJvcGVydHkudmFsdWUueDsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB0aXAncyB5IGNvb3JkaW5hdGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0IHRpcFkoKSB7IHJldHVybiB0aGlzLnRpcFBvc2l0aW9uUHJvcGVydHkudmFsdWUueTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBhbmdsZSBvZiB0aGUgdmVjdG9yIGluIHJhZGlhbnMsIG1lYXN1cmVkIGNsb2Nrd2lzZSBmcm9tIHRoZSBob3Jpem9udGFsLlxyXG4gICAqIG51bGwgd2hlbiB0aGUgdmVjdG9yIGhhcyAwIG1hZ25pdHVkZS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge251bWJlcnxudWxsfVxyXG4gICAqL1xyXG4gIGdldCBhbmdsZSgpIHtcclxuICAgIHJldHVybiB0aGlzLnZlY3RvckNvbXBvbmVudHMuZXF1YWxzRXBzaWxvbiggVmVjdG9yMi5aRVJPLCAxZS03ICkgPyBudWxsIDogdGhpcy52ZWN0b3JDb21wb25lbnRzLmFuZ2xlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgYW5nbGUgb2YgdGhlIHZlY3RvciBpbiBkZWdyZWVzLCBtZWFzdXJlZCBjbG9ja3dpc2UgZnJvbSB0aGUgaG9yaXpvbnRhbC5cclxuICAgKiBudWxsIHdoZW4gdGhlIHZlY3RvciBoYXMgMCBtYWduaXR1ZGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ8bnVsbH1cclxuICAgKi9cclxuICBnZXQgYW5nbGVEZWdyZWVzKCkge1xyXG4gICAgY29uc3QgYW5nbGVSYWRpYW5zID0gdGhpcy5hbmdsZTtcclxuICAgIHJldHVybiAoIGFuZ2xlUmFkaWFucyA9PT0gbnVsbCApID8gbnVsbCA6IFV0aWxzLnRvRGVncmVlcyggYW5nbGVSYWRpYW5zICk7XHJcbiAgfVxyXG59XHJcblxyXG52ZWN0b3JBZGRpdGlvbi5yZWdpc3RlciggJ1Jvb3RWZWN0b3InLCBSb290VmVjdG9yICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxLQUFLLE1BQU0s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