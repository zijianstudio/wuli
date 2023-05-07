// Copyright 2020-2023, University of Colorado Boulder

/**
 * OperationEntryControl is a control that allows users to add operations to a number line.  Operation can be either
 * addition or subtraction, and have a value associated with them, and this control allows the user to set those
 * attributes and commit the operation to the number line, and also alter it after it has been added.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Range from '../../../../dot/js/Range.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, HBox, Path, Text } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import RoundPushButton from '../../../../sun/js/buttons/RoundPushButton.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import Operation from '../../common/model/Operation.js';
import numberLineOperations from '../../numberLineOperations.js';

// constants
const MATH_SYMBOL_OPTIONS = {
  font: new PhetFont( 32 )
};

// This is a normalized version of the enter arrow shape, pointing in the downward direction.  The upper left corner is
// at 0,0 and the height is 1.
const NORMALIZED_ENTER_ARROW_SHAPE = new Shape()
  .lineTo( 0.45, 0 )
  .lineTo( 0.45, 0.5 )
  .lineTo( 0.65, 0.5 )
  .lineTo( 0.35, 1 )
  .lineTo( 0.05, 0.5 )
  .lineTo( 0.25, 0.5 )
  .lineTo( 0.25, 0.2 )
  .lineTo( 0, 0.2 )
  .lineTo( 0, 0 );
const FULL_SIZE_ARROW_SHAPE = NORMALIZED_ENTER_ARROW_SHAPE.transformed( Matrix3.scale( 28 ) ); // scale empirically chosen

class OperationEntryControl extends HBox {

  /**
   * @param {NumberLineOperation} controlledOperation - the number line operation that is controlled
   * @param {Object} [options]
   * @public
   */
  constructor( controlledOperation, options ) {

    options = merge( {
      spacing: 15,
      increment: 100,
      buttonBaseColor: Color.BLUE,

      // {String} - specifies the way the arrow should point, valid values are 'up' and 'down'
      arrowDirection: 'down',

      numberPickerRangeProperty: new Property( new Range( -200, 200 ) ),

      // options that are passed through to the number picker
      numberPickerOptions: {
        yMargin: 10,
        arrowHeight: 10,
        color: Color.BLACK,
        font: new PhetFont( 26 ),
        timerDelay: 300,
        timerInterval: 30
      }
    }, options );

    // options checking
    assert && assert( options.arrowDirection === 'up' || options.arrowDirection === 'down' );

    // plus/minus operation selector
    const interButtonSpacing = 5;
    const operationSelectorRadioButtonGroup = new RectangularRadioButtonGroup(
      controlledOperation.operationTypeProperty,
      [
        { value: Operation.ADDITION, createNode: () => new Text( MathSymbols.PLUS, MATH_SYMBOL_OPTIONS ) },
        { value: Operation.SUBTRACTION, createNode: () => new Text( MathSymbols.MINUS, MATH_SYMBOL_OPTIONS ) }
      ],
      {
        orientation: 'vertical',
        spacing: interButtonSpacing,
        touchAreaXDilation: 4,
        touchAreaYDilation: interButtonSpacing / 2,
        radioButtonOptions: {
          baseColor: Color.WHITE,
          xMargin: 8,
          yMargin: 0,
          buttonAppearanceStrategyOptions: {
            selectedLineWidth: 2.5
          }
        }
      }
    );

    // amount selector
    const operationAmountPicker = new NumberPicker(
      controlledOperation.amountProperty,
      options.numberPickerRangeProperty,
      merge( {
        incrementFunction: value => value + options.increment,
        decrementFunction: value => value - options.increment
      }, options.numberPickerOptions )
    );

    // enter button
    let enterArrowShape;
    if ( options.arrowDirection === 'down' ) {
      enterArrowShape = FULL_SIZE_ARROW_SHAPE;
    }
    else {
      enterArrowShape = FULL_SIZE_ARROW_SHAPE.transformed( Matrix3.scale( 1, -1 ) );
    }
    const enterArrowNode = new Path( enterArrowShape, { fill: Color.BLACK } );
    const enterButton = new RoundPushButton( {
      enabledProperty: DerivedProperty.not( controlledOperation.isActiveProperty ),
      listener: () => {
        controlledOperation.isActiveProperty.set( true );
      },
      content: enterArrowNode,
      radius: 30,
      xMargin: 16,
      yMargin: 16,
      baseColor: options.buttonBaseColor
    } );

    super( merge( {
      children: [ operationSelectorRadioButtonGroup, operationAmountPicker, enterButton ]
    }, options ) );

    // @private - now that the constructor has been called, make the controlled operation available to the methods
    this.controlledOperation = controlledOperation;
  }

  /**
   * @public
   */
  reset() {
    this.controlledOperation.reset();
  }
}

numberLineOperations.register( 'OperationEntryControl', OperationEntryControl );
export default OperationEntryControl;