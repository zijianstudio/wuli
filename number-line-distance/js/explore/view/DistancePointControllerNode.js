// Copyright 2021-2022, University of Colorado Boulder

/**
 * A point controller node that is meant for use in the distance scene.
 *
 * @author Saurabh Totey
 */

import PointControllerNode from '../../../../number-line-common/js/common/view/PointControllerNode.js';
import { Node } from '../../../../scenery/js/imports.js';
import numberLineDistance from '../../numberLineDistance.js';

// constants
const IMAGE_DILATION = 20;

class DistancePointControllerNode extends PointControllerNode {

  /**
   * @param {PointController} pointController
   * @param {Image} image - is mutated
   * @public
   */
  constructor( pointController, image ) {
    image.centerX = 0;
    image.centerY = 0;
    image.touchArea = image.localBounds.dilated( IMAGE_DILATION / image.getScaleVector().x );

    super( pointController, {
      connectorLine: false,
      node: new Node( { children: [ image ] } )
    } );
  }

}

numberLineDistance.register( 'DistancePointControllerNode', DistancePointControllerNode );
export default DistancePointControllerNode;
