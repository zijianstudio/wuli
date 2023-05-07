// Copyright 2014-2022, University of Colorado Boulder

/**
 * View representation of the back portion of a cube, which is to say the
 * dotted lines that represent the back edges that are obscured by the front
 * surfaces.
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import estimation from '../../estimation.js';
import EstimationConstants from '../EstimationConstants.js';

class CubeBackView extends Node {

  /**
   * @param {CubeModel} cubeModel
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( cubeModel, modelViewTransform ) {
    super();

    const dottedLineBack = new Path( null, { stroke: '#8b7d6b', lineDash: [ 4, 5 ] } );
    this.addChild( dottedLineBack );

    const updatePosition = () => {
      const transformedPosition = modelViewTransform.modelToViewPosition( cubeModel.positionProperty.value );
      // Position is defined as the bottom left in this sim.
      this.left = transformedPosition.x;
      this.bottom = transformedPosition.y;
    };

    // Hook up the update functions
    cubeModel.sizeProperty.link( () => {
      const faceWidth = modelViewTransform.modelToViewDeltaX( cubeModel.sizeProperty.value.width );
      const projectedDepth = modelViewTransform.modelToViewDeltaX( cubeModel.sizeProperty.value.depth ) * EstimationConstants.DEPTH_PROJECTION_PROPORTION; // Assumes x & y scales are the same.
      const projectionVector = Vector2.createPolar( projectedDepth, -EstimationConstants.CUBE_PROJECTION_ANGLE );
      const height = -modelViewTransform.modelToViewDeltaY( cubeModel.sizeProperty.value.height );
      const origin = new Vector2( projectionVector.x, height + projectionVector.y );
      dottedLineBack.setShape( new Shape()
        .moveTo( origin.x, origin.y )
        .lineToRelative( 0, -height )
        .moveTo( origin.x, origin.y )
        .lineToRelative( -projectionVector.x, -projectionVector.y )
        .moveTo( origin.x, origin.y )
        .lineToRelative( faceWidth, 0 )
      );
      updatePosition();
    } );

    cubeModel.positionProperty.link( updatePosition );

    cubeModel.visibleProperty.link( visible => {
      this.visible = visible;
    } );
  }
}

estimation.register( 'CubeBackView', CubeBackView );

export default CubeBackView;