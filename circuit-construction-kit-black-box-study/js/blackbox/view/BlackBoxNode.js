// Copyright 2016-2022, University of Colorado Boulder

/**
 * The node that shows the black round rectangle with a question mark.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import circuitConstructionKitBlackBoxStudy from '../../circuitConstructionKitBlackBoxStudy.js';

class BlackBoxNode extends Node {

  /**
   * @param {number} width - the width of the black box in view coordinates
   * @param {number} height - the height of the black box in view coordinates
   * @param {Property.<boolean>} revealingProperty - true if the user is pressing the "reveal" button
   * @param {Object} [options]
   */
  constructor( width, height, revealingProperty, options ) {

    // TODO: i18n
    const questionMarkTextNode = new Text( '?', {
      fontSize: 82,
      centerX: width / 2,
      centerY: height / 2,
      fill: 'white'
    } );

    // Show the question mark if and only if the reveal button is not being pressed.
    revealingProperty.link( revealing => {
      questionMarkTextNode.visible = !revealing;
    } );

    super( {

      // Don't let clicks go through the black box
      pickable: true,

      children: [
        new Rectangle( 0, 0, width, height, 20, 20, {
          fill: 'black',
          opacity: phet.chipper.queryParameters.dev ? 0.2 : 1
        } ),
        questionMarkTextNode
      ]
    } );
    this.mutate( options );
  }
}

circuitConstructionKitBlackBoxStudy.register( 'BlackBoxNode', BlackBoxNode );
export default BlackBoxNode;