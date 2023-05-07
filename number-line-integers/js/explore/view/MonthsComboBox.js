// Copyright 2019-2023, University of Colorado Boulder

/**
 * A combo box that can be used to change the month of the year for the map in the Temperature scene
 *
 * @author Arnab Purkayastha
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import numberLineIntegers from '../../numberLineIntegers.js';
import NumberLineIntegersStrings from '../../NumberLineIntegersStrings.js';

const januaryString = NumberLineIntegersStrings.january;
const februaryString = NumberLineIntegersStrings.february;
const marchString = NumberLineIntegersStrings.march;
const aprilString = NumberLineIntegersStrings.april;
const mayString = NumberLineIntegersStrings.may;
const juneString = NumberLineIntegersStrings.june;
const julyString = NumberLineIntegersStrings.july;
const augustString = NumberLineIntegersStrings.august;
const septemberString = NumberLineIntegersStrings.september;
const octoberString = NumberLineIntegersStrings.october;
const novemberString = NumberLineIntegersStrings.november;
const decemberString = NumberLineIntegersStrings.december;

const MONTH_STRINGS = [

  // These must be in order of occurrence, not sorted alphabetically.
  januaryString,
  februaryString,
  marchString,
  aprilString,
  mayString,
  juneString,
  julyString,
  augustString,
  septemberString,
  octoberString,
  novemberString,
  decemberString
];

// constants
const COMBO_BOX_ITEM_OPTIONS = { font: new PhetFont( 16 ), maxWidth: 100 };

class MonthsComboBox extends ComboBox {

  /**
   * @param {NumberProperty} monthProperty
   * @param {Node} listParent - node which the ComboBoxListBox will be added
   * @param {Object} [options]
   * @public
   */
  constructor( monthProperty, listParent, options ) {

    options = merge( {
      xMargin: 13,
      yMargin: 6
    }, options );

    const comboBoxItems = [];
    MONTH_STRINGS.forEach( ( monthString, index ) => {
      comboBoxItems.push( {
        value: index + 1,
        createNode: () => new Text( monthString, COMBO_BOX_ITEM_OPTIONS )
      } );
    } );

    super( monthProperty, comboBoxItems, listParent, options );
  }
}

numberLineIntegers.register( 'MonthsComboBox', MonthsComboBox );
export default MonthsComboBox;