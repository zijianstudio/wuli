// Copyright 2013-2022, University of Colorado Boulder

/**
 * Class that depicts a "mystery vector", which is a vector that is presented to
 * the user in the appropriate position but that has a fixed size and is labeled
 * with a question mark (or some other symbol).
 *
 * @author John Blanco
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import balancingAct from '../../balancingAct.js';
import BalancingActStrings from '../../BalancingActStrings.js';

const unknownMassLabelString = BalancingActStrings.unknownMassLabel;

// constants
const FONT = new PhetFont( { size: 36 } );
const Y_DIST_FROM_POSITION = 3; // In screen units.

class MysteryVectorNode extends Node {

  /**
   * @param positionedVectorProperty
   * @param visibilityProperty
   * @param modelViewTransform Model-view transform
   */
  constructor( positionedVectorProperty, visibilityProperty, modelViewTransform ) {
    super();

    // Create the 'mystery vector' node and add it as a child.
    this.addChild( new Text( unknownMassLabelString, { font: FONT, fill: 'white', stroke: 'black', lineWidth: 1 } ) );

    // Follow the position as it changes
    positionedVectorProperty.link( positionedVector => {
      this.centerX = modelViewTransform.modelToViewX( positionedVector.origin.x );
      this.top = modelViewTransform.modelToViewY( positionedVector.origin.y ) + Y_DIST_FROM_POSITION;
    } );

    // Control visibility
    visibilityProperty.link( visible => {
      this.visible = visible;
    } );
  }
}

balancingAct.register( 'MysteryVectorNode', MysteryVectorNode );

export default MysteryVectorNode;
