// Copyright 2020-2023, University of Colorado Boulder

/**
 * TotalValueAccordionBox is an accordion box that displays the value of a provided Property and allows customization of
 * the title and label through the options.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import NLCConstants from '../../../../number-line-common/js/common/NLCConstants.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import numberLineOperations from '../../numberLineOperations.js';
import NumberLineOperationsStrings from '../../NumberLineOperationsStrings.js';

// constants
const DEFAULT_WIDTH = 350; // empirically determined to look decent

class TotalValueAccordionBox extends AccordionBox {

  /**
   * @param {NumberProperty} totalValueProperty
   * @param options
   */
  constructor( totalValueProperty, options ) {

    options = merge( {
      titleText: NumberLineOperationsStrings.total,
      labelText: NumberLineOperationsStrings.total,
      showTotalAsCurrency: false,
      minWidth: DEFAULT_WIDTH,
      maxWidth: DEFAULT_WIDTH
    }, NLCConstants.ACCORDION_BOX_COMMON_OPTIONS, options );

    const totalReadoutNode = new Text( '', {
      font: new PhetFont( 26 ),
      maxWidth: DEFAULT_WIDTH * 0.9
    } );

    // Update readout when total value changes.  Instances of this class are assumed to exist for the duration of the
    // sim, so no unlink is necessary.
    totalValueProperty.link( totalValue => {
      let readoutText;
      const sign = totalValue < 0 ? MathSymbols.MINUS : '';
      if ( options.showTotalAsCurrency ) {
        readoutText = StringUtils.fillIn( NumberLineOperationsStrings.totalCurrencyPattern, {
          totalString: options.labelText,
          sign: sign,
          currencyUnits: NumberLineOperationsStrings.currencyUnits,
          totalValue: Math.abs( totalValue )
        } );
      }
      else {
        readoutText = StringUtils.fillIn( NumberLineOperationsStrings.totalValuePattern, {
          totalString: options.labelText,
          totalValue: sign + Math.abs( totalValue ).toString( 10 )
        } );
      }
      totalReadoutNode.string = readoutText;
    } );

    // accordion box title node
    const titleNode = new Text( options.titleText, { font: new PhetFont( 18 ) } );

    super( totalReadoutNode, merge( options, { titleNode: titleNode } ) );
  }
}

numberLineOperations.register( 'TotalValueAccordionBox', TotalValueAccordionBox );
export default TotalValueAccordionBox;
