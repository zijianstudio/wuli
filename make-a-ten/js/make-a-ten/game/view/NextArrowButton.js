// Copyright 2015-2022, University of Colorado Boulder

/**
 * Button for showing "next" label and a arrow button.
 *
 * @author Sharfudeen Ashraf
 * @author John Blanco
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../../../phet-core/js/merge.js';
import ArrowShape from '../../../../../scenery-phet/js/ArrowShape.js';
import PhetColorScheme from '../../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { HBox, Path, Text } from '../../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../../sun/js/buttons/RectangularPushButton.js';
import makeATen from '../../../makeATen.js';

// constants
const LABEL_FONT = new PhetFont( { size: 20, weight: 'bold' } );

class NextArrowButton extends RectangularPushButton {

  /**
   * @param {string} buttonText
   * @param {Object} [options]
   */
  constructor( buttonText, options ) {

    const arrowShape = new ArrowShape( 0, 0, 28.5, 0, {
      tailWidth: 2,
      headWidth: 8,
      headHeight: 8
    } );

    const labelArrowBox = new HBox( {
      children: [
        new Text( buttonText, { font: LABEL_FONT, fill: 'black', maxWidth: 150 } ),
        new Path( arrowShape, { fill: 'black' } )
      ],
      spacing: 15
    } );

    super( merge( {
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      xMargin: 12,
      yMargin: 10,
      content: labelArrowBox
    }, options ) );
  }
}

makeATen.register( 'NextArrowButton', NextArrowButton );
export default NextArrowButton;