// Copyright 2014-2022, University of Colorado Boulder

/**
 * View representation of a cube used within the Estimation simulation.
 * The cube is defined by a position, size, and color.  Some of these
 * attributes may change.
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Color, Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import estimation from '../../estimation.js';
import EstimationConstants from '../EstimationConstants.js';

class CubeView extends Node {

  /**
   * @param {CubeModel} cubeModel
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( cubeModel, modelViewTransform ) {
    super();

    const baseColor = cubeModel.color instanceof Color ? cubeModel.color : new Color( cubeModel.color );

    const top = new Path( null, {
      fill: baseColor.colorUtilsBrighter( 0.3 ),
      stroke: ( cubeModel.showOutline ? 'white' : null )
    } );
    this.addChild( top );
    const side = new Path( null, {
      fill: baseColor.colorUtilsDarker( 0.3 ),
      stroke: ( cubeModel.showOutline ? 'white' : null )
    } );
    this.addChild( side );
    const front = new Rectangle( 0, 0, 1, 1, 0, 0, {
      fill: baseColor,
      stroke: ( cubeModel.showOutline ? 'white' : null )
    } );
    this.addChild( front );

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

      front.setRect( 0, 0, faceWidth, height );
      side.setShape( new Shape()
        .moveTo( faceWidth, height )
        .lineToRelative( projectionVector.x, projectionVector.y )
        .lineToRelative( 0, -height )
        .lineToRelative( -projectionVector.x, -projectionVector.y )
        .close()
      );

      top.setShape( new Shape()
        .moveTo( 0, 0 )
        .lineToRelative( projectionVector.x, projectionVector.y )
        .lineToRelative( faceWidth, 0 )
        .lineToRelative( -projectionVector.x, -projectionVector.y )
        .close()
      );

      updatePosition();
    } );
    cubeModel.positionProperty.link( updatePosition );
    cubeModel.visibleProperty.link( visible => {
      this.visible = visible;
    } );
  }
}

estimation.register( 'CubeView', CubeView );

export default CubeView;