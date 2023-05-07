// Copyright 2017-2023, University of Colorado Boulder

/**
 * Accordion box used to modify a rate.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line, Node, Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import URConstants from '../URConstants.js';

// If the Rate accordion box appears to change size when switching categories, increase this value. Determined empirically.
const MIN_FRACTION_LINE_LENGTH = 115;

export default class RateAccordionBox extends AccordionBox {

  /**
   * @param {Rate} rate
   * @param {Object} [options]
   */
  constructor( rate, options ) {

    options = merge( {}, URConstants.ACCORDION_BOX_OPTIONS, {

      // AccordionBox options
      contentXMargin: 20,
      contentYMargin: 24,
      contentYSpacing: 20,

      // RateAccordionBox options
      titleString: UnitRatesStrings.rateStringProperty,
      unitsFont: new PhetFont( 16 ),
      unitsMaxWidth: 60, // i18n, determined empirically
      numeratorRange: new Range( 0, 10 ),
      denominatorRange: new Range( 0, 10 ),
      numeratorUnits: '',
      denominatorUnits: '',
      pickerFont: new PhetFont( 24 ),
      numeratorPickerColor: 'black',
      denominatorPickerColor: 'black',
      numeratorPickerIncrementFunction: value => value + 1,
      numeratorPickerDecrementFunction: value => value - 1,
      denominatorPickerIncrementFunction: value => value + 1,
      denominatorPickerDecrementFunction: value => value - 1,
      numeratorDecimals: 0,
      denominatorDecimals: 0,
      xSpacing: 10,
      ySpacing: 8

    }, options );

    assert && assert( options.numeratorRange.contains( rate.numeratorProperty.value ),
      `numerator out of range: ${rate.numeratorProperty.value}` );
    assert && assert( options.denominatorRange.contains( rate.denominatorProperty.value ),
      `denominator out of range: ${rate.denominatorProperty.value}` );

    assert && assert( !options.titleNode, 'creates its own title node' );
    options.titleNode = new Text( options.titleString, {
      font: URConstants.ACCORDION_BOX_TITLE_FONT,
      maxWidth: 100  // i18n, determined empirically
    } );

    // numerator picker, must be disposed
    const numeratorPicker = new NumberPicker( rate.numeratorProperty, new Property( options.numeratorRange ),
      merge( {}, URConstants.NUMBER_PICKER_OPTIONS, {
        incrementFunction: options.numeratorPickerIncrementFunction,
        decrementFunction: options.numeratorPickerDecrementFunction,
        decimalPlaces: options.numeratorDecimals,
        font: options.pickerFont,
        color: options.numeratorPickerColor
      } ) );

    // numerator units
    const numeratorUnitsNode = new Text( options.numeratorUnits, {
      font: options.unitsFont,
      maxWidth: options.unitsMaxWidth
    } );

    // denominator picker, must be disposed
    const denominatorPicker = new NumberPicker( rate.denominatorProperty, new Property( options.denominatorRange ),
      merge( {}, URConstants.NUMBER_PICKER_OPTIONS, {
        incrementFunction: options.denominatorPickerIncrementFunction,
        decrementFunction: options.denominatorPickerDecrementFunction,
        decimalPlaces: options.denominatorDecimals,
        font: options.pickerFont,
        color: options.denominatorPickerColor
      } ) );

    // denominator units
    const denominatorUnitsNode = new Text( options.denominatorUnits, {
      font: options.unitsFont,
      maxWidth: options.unitsMaxWidth
    } );

    const contentNode = new Node( {
      children: [ numeratorPicker, numeratorUnitsNode, denominatorPicker, denominatorUnitsNode ]
    } );

    // horizontal layout: center justify pickers, left justify labels
    denominatorPicker.centerX = numeratorPicker.centerX;
    numeratorUnitsNode.left = Math.max( numeratorPicker.right, denominatorPicker.right ) + options.xSpacing;
    denominatorUnitsNode.left = numeratorUnitsNode.left;

    // fraction line
    const fractionLineLength = Math.max( MIN_FRACTION_LINE_LENGTH,
      Math.max( numeratorUnitsNode.right - numeratorPicker.left, denominatorUnitsNode.right - denominatorPicker.left ) );
    const fractionLineNode = new Line( 0, 0, fractionLineLength, 0, {
      stroke: 'black',
      lineWidth: 2,
      left: Math.min( numeratorPicker.left, denominatorPicker.left )
    } );
    contentNode.addChild( fractionLineNode );

    // vertical layout
    numeratorUnitsNode.centerY = numeratorPicker.centerY;
    fractionLineNode.top = numeratorPicker.bottom + options.ySpacing;
    denominatorPicker.top = fractionLineNode.bottom + options.ySpacing;
    denominatorUnitsNode.centerY = denominatorPicker.centerY;

    super( contentNode, options );

    // @private
    this.disposeRateAccordionBox = () => {
      numeratorPicker.dispose();
      denominatorPicker.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeRateAccordionBox();
    super.dispose();
  }
}

unitRates.register( 'RateAccordionBox', RateAccordionBox );