// Copyright 2021-2022, University of Colorado Boulder

/**
 * Scene view base class for the DistanceSceneView, TemperatureSceneView, and ElevationSceneView:
 * adds the base view and number line node.
 *
 * @author Saurabh Totey
 */

import merge from '../../../../phet-core/js/merge.js';
import required from '../../../../phet-core/js/required.js';
import { Node } from '../../../../scenery/js/imports.js';
import DistanceShadedNumberLineNode from '../../common/view/DistanceShadedNumberLineNode.js';
import NLDBaseView from '../../common/view/NLDBaseView.js';
import numberLineDistance from '../../numberLineDistance.js';

class NLDSceneView extends Node {

  /**
   * @param {AbstractNLDBaseModel} model
   * @param {Object} config
   */
  constructor( model, config ) {
    super();

    config = merge( {

      // {Node} the representations given to the base view to use at the bottom left swap area
      pointControllerRepresentationOne: required( config.pointControllerRepresentationOne ),
      pointControllerRepresentationTwo: required( config.pointControllerRepresentationTwo ),

      // {Object} an object with all the distance description strings (see NLDBaseView)
      distanceDescriptionStrings: required( config.distanceDescriptionStrings ),

      // {Object} options to be passed through to the number line node
      distanceShadedNumberLineNodeOptions: {}
    }, config );

    // @public (read-only)
    this.model = model;

    // @protected {NLDBaseView}
    this.baseView = new NLDBaseView(
      model,
      config.pointControllerRepresentationOne,
      config.pointControllerRepresentationTwo,
      {
        distanceDescriptionStrings: config.distanceDescriptionStrings
      }
    );
    this.addChild( this.baseView );

    // @protected {DistanceShadedNumberLineNode} number line
    this.numberLineNode = new DistanceShadedNumberLineNode( model, config.distanceShadedNumberLineNodeOptions );
    this.addChild( this.numberLineNode );
  }

  /**
   * This function resets the scene view. Right now, all this does is open up accordion box if closed.
   * @public
   */
  reset() {
    this.baseView.accordionBoxOpenedProperty.reset();
  }

}

numberLineDistance.register( 'NLDSceneView', NLDSceneView );
export default NLDSceneView;
