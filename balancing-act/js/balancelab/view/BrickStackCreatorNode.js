// Copyright 2013-2022, University of Colorado Boulder

/**
 * This object type represents a stack of bricks in a toolbox.  When the user clicks on this node, the corresponding
 * model element is added to the model at the user's mouse position.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import balancingAct from '../../balancingAct.js';
import BAQueryParameters from '../../common/BAQueryParameters.js';
import ColumnState from '../../common/model/ColumnState.js';
import BrickStack from '../../common/model/masses/BrickStack.js';
import BrickStackNode from '../../common/view/BrickStackNode.js';
import MassCreatorNode from './MassCreatorNode.js';

// Model-view transform for scaling the node used in the toolbox.  This
// may scale the node differently than what is used in the model so that
// items in the toolbox can be sized differently (generally smaller).
const SCALING_MVT = ModelViewTransform2.createOffsetScaleMapping( Vector2.ZERO, 150 );

class BrickStackCreatorNode extends MassCreatorNode {

  /**
   * @param {number} numBricks
   * @param {BalanceLabModel} model
   * @param {BasicBalanceScreenView} screenView
   * @param {Object} [options]
   */
  constructor( numBricks, model, screenView, options ) {
    super( screenView, numBricks * BrickStack.BRICK_MASS, true, options );
    this.numBricks = numBricks;
    this.model = model;

    // TODO: move this into ModelElementCreatorNode, see https://github.com/phetsims/balancing-act/issues/96
    BAQueryParameters.stanford && model.columnStateProperty.link( columnState => {
      this.cursor = columnState === ColumnState.DOUBLE_COLUMNS ? 'pointer' : 'default';
      this.pickable = columnState === ColumnState.DOUBLE_COLUMNS;
    } );

    const selectionNode = new BrickStackNode(
      new BrickStack( numBricks, Vector2.ZERO, { tandem: Tandem.OPT_OUT } ),
      SCALING_MVT,
      false,
      new Property( false ),
      false,
      model.columnStateProperty
    );

    // Make a larger touch area.  The diameter of the circle was determined empirically.
    selectionNode.touchArea = Shape.circle(
      selectionNode.bounds.width / 2,
      selectionNode.bounds.height / 2,
      selectionNode.bounds.width * 0.8
    );

    this.setSelectionNode( selectionNode );
    this.positioningOffset = new Vector2(
      0,
      -screenView.modelViewTransform.modelToViewDeltaY( BrickStack.BRICK_HEIGHT * numBricks / 2 )
    );
  }

  /**
   *
   * @param {Vector2} position
   * @returns {Mass}
   * @public
   */
  addElementToModel( position ) {
    const mass = this.model.brickStackGroup.createNextElement( this.numBricks, position );
    this.model.addMass( mass );
    return mass;
  }
}

balancingAct.register( 'BrickStackCreatorNode', BrickStackCreatorNode );

export default BrickStackCreatorNode;
