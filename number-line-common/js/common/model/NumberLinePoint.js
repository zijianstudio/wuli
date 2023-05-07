// Copyright 2020-2022, University of Colorado Boulder

/**
 * NumberLinePoint defines points on a number line in the "Number Line" suite of sims
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color, PaintColorProperty } from '../../../../scenery/js/imports.js';
import numberLineCommon from '../../numberLineCommon.js';

class NumberLinePoint {

  /**
   * @param {SpatializedNumberLine} numberLine - the number line on which this point exists
   * @param {Object} [options]
   * @public
   */
  constructor( numberLine, options ) {

    options = merge( {

      // {NumberProperty} - a Property containing the value for this point, created below if not provided
      valueProperty: null,

      // {number} - the initial value, only used if the value Property is not provided
      initialValue: null,

      // {PaintColorProperty} - the color that will be used when portraying this point in the view
      colorProperty: null,

      // {Color} - initial color, only used if color Property is not provided
      initialColor: null,

      // {PointController} - point controller to attach to this point
      controller: null
    }, options );

    // options checking
    assert && assert(
      !this.valueProperty || this.initialValue === null,
      'can\'t specify both an initial value and the value Property'
    );
    assert && assert(
      !this.colorProperty || this.initialColor === null,
      'can\'t specify both an initial color and the color Property'
    );

    // @private - emitter that is fired on dispose, add listeners as needed
    this.disposeEmitterNumberLinePoint = new Emitter();

    // @public {NumberProperty} - value of the point on the number line
    this.valueProperty = options.valueProperty;
    if ( !this.valueProperty ) {
      this.valueProperty = new NumberProperty( options.initialValue === null ? 0 : options.initialValue );
      this.disposeEmitterNumberLinePoint.addListener( () => { this.valueProperty.dispose(); } );
    }

    // @public {PaintColorProperty} - color used when portraying this point
    this.colorProperty = options.colorProperty;
    if ( !this.colorProperty ) {
      this.colorProperty = new PaintColorProperty( options.initialColor === null ? Color.BLACK : options.initialColor );
      this.disposeEmitterNumberLinePoint.addListener( () => { this.colorProperty.dispose(); } );
    }

    // @public {BooleanProperty} - indicates whether this is being dragged by the user
    this.isDraggingProperty = new BooleanProperty( false );

    // @public (read-only) {SpatializedNumberLine} - the number line on which this point resides
    this.numberLine = numberLine;

    // @private {PointController|null} - a "point controller" that controls where this point is, can be null
    this.controller = options.controller;

    // @public (read-only) {number|null} - the most recently proposed value, used when deciding where to land on number line
    this.mostRecentlyProposedValue = null;
  }

  /**
   * Get the position of this number line point in model space.
   * @returns {Vector2}
   * @public
   */
  getPositionInModelSpace() {
    return this.numberLine.valueToModelPosition( this.valueProperty.value );
  }

  /**
   * Given the proposed value, set the value of this number line point to the closest valid value on the number line.
   * @param {number} numberLineValue - value on number line, doesn't have to be constrained to integer values
   * @public
   */
  proposeValue( numberLineValue ) {
    const constrainedValue = this.numberLine.getConstrainedValue( numberLineValue );
    if ( constrainedValue !== this.valueProperty.value ) {
      this.valueProperty.value = constrainedValue;
    }
    this.mostRecentlyProposedValue = numberLineValue;
  }

  /**
   * Get a string representation that is worthy of logging to the console.
   * @public
   * @returns {string}
   */
  toString() {
    return `point value: ${this.valueProperty.value}, color: ${this.colorProperty.value}`;
  }

  /**
   * Release all memory to avoid leaks.
   * @public
   * @override
   */
  dispose() {
    this.disposeEmitterNumberLinePoint.emit();
  }
}

numberLineCommon.register( 'NumberLinePoint', NumberLinePoint );
export default NumberLinePoint;
