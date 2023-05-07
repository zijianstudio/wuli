// Copyright 2016-2023, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Shows an empty box for 'Test' mode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import CCKCColors from '../../../../circuit-construction-kit-common/js/view/CCKCColors.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import circuitConstructionKitBlackBoxStudy from '../../circuitConstructionKitBlackBoxStudy.js';

class WhiteBoxNode extends Node {
  constructor( width, height, options ) {
    super( {
      children: [
        new Rectangle( 0, 0, width, height, 20, 20, {
          stroke: 'black',
          lineWidth: 3,
          fill: CCKCColors.screenBackgroundColorProperty
        } )
      ]
    } );
    this.mutate( options );
  }
}

circuitConstructionKitBlackBoxStudy.register( 'WhiteBoxNode', WhiteBoxNode );
export default WhiteBoxNode;