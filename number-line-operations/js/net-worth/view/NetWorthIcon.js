// Copyright 2021-2022, University of Colorado Boulder

/**
 * NetWorthIcon is the icon that is used for the home screen and nav bar for the "Net Worth" screen.  It consists of an
 * image of a piggy bank with a translatable currency symbol on it.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Image, Text } from '../../../../scenery/js/imports.js';
import netWorthHomeScreenIcon_png from '../../../images/netWorthHomeScreenIcon_png.js';
import numberLineOperations from '../../numberLineOperations.js';
import NumberLineOperationsStrings from '../../NumberLineOperationsStrings.js';

class NetWorthIcon extends ScreenIcon {

  constructor() {
    const piggyBankImage = new Image( netWorthHomeScreenIcon_png );
    const currencySymbol = new Text( NumberLineOperationsStrings.currencyUnits, {

      fill: Color.WHITE,
      stroke: Color.black,

      // font size and scale were arrived at empirically
      font: new PhetFont( 32 ),
      scale: 8,

      // position determined empirically
      centerX: piggyBankImage.width * 0.475,
      centerY: piggyBankImage.height * 0.5
    } );

    // Because there is a scale factor in the options, the maxWidth parameter doesn't work very well, so limiting the
    // width of the string is explicitly handled here.
    const maxWidthOfCurrencySymbol = piggyBankImage.width * 0.6;
    if ( currencySymbol.width > maxWidthOfCurrencySymbol ) {
      currencySymbol.scale( maxWidthOfCurrencySymbol / currencySymbol.width );
      currencySymbol.centerX = piggyBankImage.width * 0.5;
      currencySymbol.centerY = piggyBankImage.height * 0.5;
    }
    piggyBankImage.addChild( currencySymbol );

    super( piggyBankImage, {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1
    } );
  }
}

numberLineOperations.register( 'NetWorthIcon', NetWorthIcon );
export default NetWorthIcon;