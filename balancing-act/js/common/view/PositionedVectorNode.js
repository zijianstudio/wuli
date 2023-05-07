// Copyright 2013-2021, University of Colorado Boulder

/**
 * Class that depicts a vector that has an origin as well as x and y components,
 * and that monitors the vector and updates the representation when changes
 * occur.
 *
 * NOTE: This only works with downward pointing vectors, which is what was
 * needed for Balancing Act.  This would need to be generalized to support
 * vectors pointing in other directions.
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Node } from '../../../../scenery/js/imports.js';
import balancingAct from '../../balancingAct.js';

class PositionedVectorNode extends Node {

  /**
   * @param positionedVectorProperty
   * @param visibilityProperty
   * @param scalingFactor
   * @param modelViewTransform
   * @param {Object} [options]
   */
  constructor( positionedVectorProperty, scalingFactor, visibilityProperty, modelViewTransform, options ) {
    super();

    options = merge(
      {
        fill: 'white',
        stroke: 'black',
        lineWidth: 1,
        headHeight: 8,
        headWidth: 12,
        tailWidth: 5
      }, options );

    // Create the vector node and add it as a child.
    const length = positionedVectorProperty.value.vector.magnitude * scalingFactor;
    this.addChild( new ArrowNode( 0, 0, 0, length, options ) );

    positionedVectorProperty.link( positionedVector => {
      this.centerX = modelViewTransform.modelToViewX( positionedVector.origin.x );
      this.top = modelViewTransform.modelToViewY( positionedVector.origin.y );
    } );

    visibilityProperty.link( visible => {
      this.visible = visible;
    } );
  }
}

balancingAct.register( 'PositionedVectorNode', PositionedVectorNode );

export default PositionedVectorNode;