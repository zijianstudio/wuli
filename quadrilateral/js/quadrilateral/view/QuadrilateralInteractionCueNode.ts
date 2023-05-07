// Copyright 2022-2023, University of Colorado Boulder

/**
 * Draws a Node that hints that the quadrilateral shape is interactive. Surrounds each vertex and side with dashed
 * lines and draws arrows pointing at the sides.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { Path } from '../../../../scenery/js/imports.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import QuadrilateralColors from '../../QuadrilateralColors.js';
import QuadrilateralShapeModel from '../model/QuadrilateralShapeModel.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';
import QuadrilateralSide from '../model/QuadrilateralSide.js';
import { Line, Shape } from '../../../../kite/js/imports.js';
import quadrilateral from '../../quadrilateral.js';
import Emitter from '../../../../axon/js/Emitter.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';

const PATH_OPTIONS = {
  stroke: QuadrilateralColors.interactionCueColorProperty,
  lineDash: [ 8, 2 ],
  lineWidth: 2
};

export default class QuadrilateralInteractionCueNode extends Path {
  public constructor( quadrilateralShapeModel: QuadrilateralShapeModel, connectedToDeviceProperty: TReadOnlyProperty<boolean>, resetEmitter: Emitter, modelViewTransform: ModelViewTransform2 ) {
    const nodeShape = new Shape();

    // vertices
    quadrilateralShapeModel.vertices.forEach( vertex => {
      const viewBounds = modelViewTransform.modelToViewBounds( vertex.modelBoundsProperty.value ).dilate( QuadrilateralConstants.POINTER_AREA_DILATION );
      nodeShape.circle( viewBounds.centerX, viewBounds.centerY, viewBounds.width / 2 );

      // so that you don't have to include the start point for the circles
      nodeShape.newSubpath();
    } );

    // sides
    const indicatorViewWidth = modelViewTransform.modelToViewDeltaX( QuadrilateralSide.SIDE_WIDTH * 1.5 );
    quadrilateralShapeModel.sides.forEach( side => {

      // model coordinates
      const midLine = new Line( side.vertex1.positionProperty.value, side.vertex2.positionProperty.value );

      // view coordinates
      const tipViewPoint = modelViewTransform.modelToViewPosition( midLine.positionAt( 0.2 ) );
      const tailViewPoint = modelViewTransform.modelToViewPosition( midLine.positionAt( 0.8 ) );
      const reducedMidLine = new Line( tipViewPoint, tailViewPoint );

      const leftStroke = reducedMidLine.strokeLeft( indicatorViewWidth )[ 0 ];
      const rightStroke = reducedMidLine.strokeRight( indicatorViewWidth )[ 0 ];

      // create a rectangle from the strokes along the midLine
      nodeShape.moveToPoint( leftStroke.start );
      nodeShape.lineToPoint( leftStroke.end );
      nodeShape.lineToPoint( rightStroke.start );
      nodeShape.lineToPoint( rightStroke.end );
      nodeShape.close();
    } );

    super( nodeShape, PATH_OPTIONS );

    // If the shape changes at all this content disappears (until reset)
    quadrilateralShapeModel.shapeChangedEmitter.addListener( () => {
      this.visible = false;
    } );

    // When connection is first made to a tangible, the interaction cues are invisible.
    connectedToDeviceProperty.link( connectedToDevice => {
      if ( connectedToDevice ) {
        this.setVisible( false );
      }
    } );

    // If reset is pressed, we should see the cue again
    resetEmitter.addListener( () => this.setVisible( !connectedToDeviceProperty.value ) );
  }
}

quadrilateral.register( 'QuadrilateralInteractionCueNode', QuadrilateralInteractionCueNode );
