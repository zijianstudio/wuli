// Copyright 2022-2023, University of Colorado Boulder

/**
 * A representation of the angle when it is a right angle.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { Path } from '../../../../scenery/js/imports.js';
import QuadrilateralVertex from '../model/QuadrilateralVertex.js';
import QuadrilateralShapeModel from '../model/QuadrilateralShapeModel.js';
import { Line, Shape } from '../../../../kite/js/imports.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import QuadrilateralColors from '../../QuadrilateralColors.js';
import quadrilateral from '../../quadrilateral.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';

// in model coordinates, length of a side of the indicator from the edge of a line between two vertices
const SIDE_LENGTH = 0.12;

export default class RightAngleIndicatorNode extends Path {
  private readonly shapeModel: QuadrilateralShapeModel;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly cornerGuideVisibleProperty: TReadOnlyProperty<boolean>;

  /**
   * @param vertex1 - The QuadrilateralVertex being represented, indicator will be visible when angle at this vertex is 90 degrees
   * @param vertex2 - QuadrilateralVertex with a side connected to vertexA in the clockwise direction
   * @param vertex3 - QuadrilateralVertex with a side connected to vertexB in the counterclockwise direction
   * @param cornerGuideVisibleProperty
   * @param shapeModel
   * @param modelViewTransform
   */
  public constructor( vertex1: QuadrilateralVertex, vertex2: QuadrilateralVertex, vertex3: QuadrilateralVertex, cornerGuideVisibleProperty: TReadOnlyProperty<boolean>, shapeModel: QuadrilateralShapeModel, modelViewTransform: ModelViewTransform2 ) {
    super( null, {
      stroke: QuadrilateralColors.rightAngleIndicatorStrokeColorProperty,
      lineWidth: 2
    } );

    this.shapeModel = shapeModel;
    this.modelViewTransform = modelViewTransform;
    this.cornerGuideVisibleProperty = cornerGuideVisibleProperty;

    // indicator visibility matches how we name shapes.
    const redrawShapeListener = () => {
      this.redrawShape( vertex1, vertex2, vertex3 );
    };

    cornerGuideVisibleProperty.link( redrawShapeListener );
    shapeModel.shapeChangedEmitter.addListener( redrawShapeListener );
  }

  /**
   * Draws the "right angle indicator" shape - a right angle bracket that gets drawn between two adjacent sides
   * in the interior of the quadrilateral.
   */
  private redrawShape( vertex1: QuadrilateralVertex, vertex2: QuadrilateralVertex, vertex3: QuadrilateralVertex ): void {

    assert && assert( vertex1.angleProperty.value, 'Angle must be available to draw the indicator' );
    const angle = vertex1.angleProperty.value!;

    this.visible = this.shapeModel.isRightAngle( angle ) && this.cornerGuideVisibleProperty.value;

    // if visible, we need to redraw the shape
    if ( this.visible ) {
      const vertex1Position = vertex1.positionProperty.value;

      // The line from vertex1 to vertex2 (clockwise connected side)
      const firstLine = new Line( vertex1Position, vertex2.positionProperty.value );

      // the line from vertex1 to vertex3 (counterclockwise connected side)
      const secondLine = new Line( vertex1Position, vertex3.positionProperty.value );

      // point along the first side where we start drawing
      const t1 = Math.min( SIDE_LENGTH / firstLine.getArcLength(), 1 );
      const pointAlongFirstInnerLine = firstLine.positionAt( t1 );

      // point along the second side where we finish drawing
      const t2 = Math.min( SIDE_LENGTH / secondLine.getArcLength(), 1 );
      const pointAlongSecondInnerLine = secondLine.positionAt( t2 );

      // intersection point between the perpendicular lines
      const innerPoint = pointAlongSecondInnerLine.plus( pointAlongFirstInnerLine.minus( vertex1Position ) );

      // We now have all points for our "square" shape
      const shape = new Shape();
      shape.moveToPoint( pointAlongFirstInnerLine );
      shape.lineToPoint( innerPoint );
      shape.lineToPoint( pointAlongSecondInnerLine );

      this.shape = this.modelViewTransform.modelToViewShape( shape );
    }
  }
}

quadrilateral.register( 'RightAngleIndicatorNode', RightAngleIndicatorNode );
