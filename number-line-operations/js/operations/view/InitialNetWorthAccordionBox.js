// Copyright 2020-2022, University of Colorado Boulder

/**
 * InitialNetWorthAccordionBox displays the initial net worth value, which is provided as a Property, in an accordion
 * box.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import NLCConstants from '../../../../number-line-common/js/common/NLCConstants.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, RichText, Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import NLOConstants from '../../common/NLOConstants.js';
import numberLineOperations from '../../numberLineOperations.js';
import NumberLineOperationsStrings from '../../NumberLineOperationsStrings.js';

class InitialNetWorthAccordionBox extends AccordionBox {

  /**
   * @param {NumberProperty} initialNetWorthProperty
   * @param {Property.<Range>} netWorthRangeProperty
   * @param {Object} [options]
   */
  constructor( initialNetWorthProperty, netWorthRangeProperty, options ) {

    options = merge( {
      titleNode: new Text( NumberLineOperationsStrings.initialNetWorth, {
        font: new PhetFont( 18 ),
        maxWidth: 200 // empirically determined using stringTest=long
      } )
    }, NLCConstants.ACCORDION_BOX_COMMON_OPTIONS, options );

    const label = new RichText( NumberLineOperationsStrings.initialNetWorthWithBreak, {
      align: 'center',
      font: new PhetFont( 24 ),
      maxWidth: 150 // empirically determined using stringTest=long
    } );

    const equalsAndCurrencyUnits = new Text( `= ${NumberLineOperationsStrings.currencyUnits}`, {
      font: new PhetFont( 24 ),
      maxWidth: 150 // empirically determined using stringTest=long
    } );

    const initialNetWorthPicker = new NumberPicker(
      initialNetWorthProperty,
      netWorthRangeProperty,
      {
        incrementFunction: value => value + 100,
        decrementFunction: value => value - 100,
        yMargin: 10,
        arrowHeight: 10,
        color: NLOConstants.DARK_BLUE_POINT_COLOR,
        font: new PhetFont( 26 )
      }
    );

    const content = new HBox( {
      children: [ label, equalsAndCurrencyUnits, initialNetWorthPicker ],
      spacing: 15
    } );

    super( content, options );
  }
}

numberLineOperations.register( 'InitialNetWorthAccordionBox', InitialNetWorthAccordionBox );
export default InitialNetWorthAccordionBox;
