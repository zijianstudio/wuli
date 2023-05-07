// Copyright 2014-2022, University of Colorado Boulder

/**
 * A Scenery node that defines a user interface element which allows the user
 * to select one of three possible ways in which the balance might behave -
 * tilt left, tilt right, or stay balanced.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import { HBox, Node } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import plankBalanced_png from '../../../images/plankBalanced_png.js';
import plankTippedLeft_png from '../../../images/plankTippedLeft_png.js';
import plankTippedRight_png from '../../../images/plankTippedRight_png.js';
import balancingAct from '../../balancingAct.js';
import TiltPredictionSelectionPanel from './TiltPredictionSelectionPanel.js';

class TiltPredictionSelectorNode extends Node {

  /**
   * @param gameStateProperty
   */
  constructor( gameStateProperty ) {
    super();

    // Property that tracks the selected prediction.  Valid values are 'none',
    // 'tiltDownOnLeftSide', 'stayBalanced', and 'tiltDownOnRightSide'.
    this.tiltPredictionProperty = new Property( 'none' ); // TODO: Enumeration

    const panelContents = new HBox(
      {
        children: [
          new TiltPredictionSelectionPanel( plankTippedLeft_png, 'tiltDownOnLeftSide', this.tiltPredictionProperty, gameStateProperty ),
          new TiltPredictionSelectionPanel( plankBalanced_png, 'stayBalanced', this.tiltPredictionProperty, gameStateProperty ),
          new TiltPredictionSelectionPanel( plankTippedRight_png, 'tiltDownOnRightSide', this.tiltPredictionProperty, gameStateProperty )
        ], spacing: 5
      } );

    this.addChild( new Panel( panelContents, { cornerRadius: 5 } ) );
  }
}

balancingAct.register( 'TiltPredictionSelectorNode', TiltPredictionSelectorNode );

export default TiltPredictionSelectorNode;