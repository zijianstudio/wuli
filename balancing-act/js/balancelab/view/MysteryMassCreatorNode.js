// Copyright 2013-2021, University of Colorado Boulder

/**
 * This class represents a "mystery mass" in a toolbox.  When the user clicks on this node, the corresponding model
 * element is added to the model at the user's mouse position.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import balancingAct from '../../balancingAct.js';
import MysteryMass from '../../common/model/masses/MysteryMass.js';
import MysteryMassNode from '../../common/view/MysteryMassNode.js';
import ImageMassCreatorNode from './ImageMassCreatorNode.js';

// Model-view transform for scaling the node used in the toolbox.  This may scale the node differently than what is
// used in the model so that items in the toolbox can be sized differently (generally smaller).
const SCALING_MVT = ModelViewTransform2.createOffsetScaleMapping( Vector2.ZERO, 150 );

class MysteryMassCreatorNode extends ImageMassCreatorNode {

  /**
   * @param {number} mysteryMassID
   * @param {BalanceLabModel} model
   * @param {BasicBalanceScreenView} screenView
   * @param {Object} [options]
   */
  constructor( mysteryMassID, model, screenView, options ) {
    super( model, screenView, new MysteryMass( Vector2.ZERO, mysteryMassID, { tandem: Tandem.OPT_OUT } ), false, options );
    this.mysteryMassId = mysteryMassID;
    this.setSelectionNode(
      new MysteryMassNode(
        this.prototypeImageMass,
        SCALING_MVT,
        false,
        new Property( false ),
        false,
        model.columnStateProperty
      )
    );
    this.positioningOffset = new Vector2(
      0,
      -screenView.modelViewTransform.modelToViewDeltaY( this.prototypeImageMass.heightProperty.get() / 2 )
    );
  }

  /**
   * @param position
   * @returns {PhetioObject}
   * @override
   * @public
   */
  addElementToModel( position ) {
    const mass = this.model.mysteryMassGroup.createNextElement( position, this.mysteryMassId );
    this.model.addMass( mass );
    return mass;
  }
}

balancingAct.register( 'MysteryMassCreatorNode', MysteryMassCreatorNode );

export default MysteryMassCreatorNode;
