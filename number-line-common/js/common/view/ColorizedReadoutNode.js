// Copyright 2020-2022, University of Colorado Boulder

/**
 * ColorizedReadoutNode is a Scenery node that presents a number enclosed in a rounded rectangle "background",
 * where the color of the stroke and fill of the background changes based on the value of a provided Property.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import numberLineCommon from '../../numberLineCommon.js';
import NLCConstants from '../NLCConstants.js';

// constants
const DEFAULT_FONT = new PhetFont( 18 );

class ColorizedReadoutNode extends BackgroundNode {

  /**
   * @param {StringProperty} stringProperty - a Property that encloses the value to display
   * @param {Property.<Color>} baseColorProperty - a Property that encloses a color from which the fill and stroke are
   * derived
   * @param {Object} [options]
   * @public
   */
  constructor( stringProperty, baseColorProperty, options ) {

    options = merge(
      {
        rectangleOptions: { lineWidth: 2 },
        textOptions: { font: DEFAULT_FONT },
        colorizeBackground: true,
        colorizeText: false
      },
      NLCConstants.LABEL_BACKGROUND_OPTIONS,
      options
    );

    // text that will be displayed on the background
    const textNode = new Text( stringProperty, options.textOptions );

    super( textNode, options );

    // Update the stroke and background colors as the base color changes.
    const updateColors = baseColor => {
      if ( options.colorizeBackground ) {
        this.background.stroke = baseColor;

        // Use a lighter version of the base color as the fill.
        this.background.fill = baseColor.colorUtilsBrighter( 0.75 );
      }

      if ( options.colorizeText ) {
        textNode.fill = baseColor;
      }
    };
    baseColorProperty.link( updateColors );

    // @private - dispose function
    this.disposeColorizedReadoutNode = () => {
      baseColorProperty.unlink( updateColors );
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeColorizedReadoutNode();
    super.dispose();
  }
}

numberLineCommon.register( 'ColorizedReadoutNode', ColorizedReadoutNode );
export default ColorizedReadoutNode;