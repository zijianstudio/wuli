// Copyright 2022-2023, University of Colorado Boulder

/**
 * Draws a diagonal line across the opposite pairs of vertex corners. Line extends across the model bounds.
 * Visibility is controlled by a checkbox in the screen.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../quadrilateral.js';
import { Line, Node } from '../../../../scenery/js/imports.js';
import QuadrilateralShapeModel from '../model/QuadrilateralShapeModel.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Ray2 from '../../../../dot/js/Ray2.js';
import { Shape } from '../../../../kite/js/imports.js';
import QuadrilateralColors from '../../QuadrilateralColors.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import QuadrilateralUtils from '../model/QuadrilateralUtils.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';

// constants
const LINE_NODE_OPTIONS = {
  lineWidth: 4,
  lineDash: [ 10, 3 ],
  stroke: QuadrilateralColors.diagonalGuidesStrokeColorProperty
};

export default class QuadrilateralDiagonalGuidesNode extends Node {
  public constructor( quadrilateralShapeModel: QuadrilateralShapeModel, visibleProperty: TReadOnlyProperty<boolean>, modelViewTransform: ModelViewTransform2 ) {

    super( {
      visibleProperty: visibleProperty
    } );

    const lineNode1 = new Line( LINE_NODE_OPTIONS );
    this.addChild( lineNode1 );

    const lineNode2 = new Line( LINE_NODE_OPTIONS );
    this.addChild( lineNode2 );

    Multilink.multilink(
      [ quadrilateralShapeModel.vertexA.positionProperty, quadrilateralShapeModel.vertexC.positionProperty ],
      ( vertexAPosition, vertexCPosition ) => {
        QuadrilateralDiagonalGuidesNode.drawDiagonal( vertexAPosition, vertexCPosition, QuadrilateralConstants.MODEL_BOUNDS, modelViewTransform, lineNode1 );
      }
    );

    Multilink.multilink(
      [ quadrilateralShapeModel.vertexB.positionProperty, quadrilateralShapeModel.vertexD.positionProperty ],
      ( vertexBPosition, vertexDPosition ) => {
        QuadrilateralDiagonalGuidesNode.drawDiagonal( vertexBPosition, vertexDPosition, QuadrilateralConstants.MODEL_BOUNDS, modelViewTransform, lineNode2 );
      }
    );
  }

  /**
   * Draws a line between the provided vertex positions. The line spans across the positions until it intersects
   * with model bounds. This could have been done with a clip area but I worry about clip area performance.
   */
  private static drawDiagonal( vertex1Position: Vector2, vertex2Position: Vector2, bounds: Bounds2, modelViewTransform: ModelViewTransform2, lineNode: Line ): void {

    const boundsShape = Shape.bounds( bounds );
    const p1 = QuadrilateralDiagonalGuidesNode.getBestIntersectionPoint( vertex1Position, vertex2Position, bounds, boundsShape );
    const p2 = QuadrilateralDiagonalGuidesNode.getBestIntersectionPoint( vertex2Position, vertex1Position, bounds, boundsShape );

    const p1View = modelViewTransform.modelToViewPosition( p1 );
    const p2View = modelViewTransform.modelToViewPosition( p2 );

    lineNode.setPoint1( p1View );
    lineNode.setPoint2( p2View );
  }

  /**
   * Creates a ray from vertex1Position to vertex2Position and returns the intersection point of that ray and the
   * provided bounds. This will be one of the end points for the Line created by this Node. This functions works around
   * a Kite limitation that an intersection is undefined if the Ray intersects exactly with a start/end point of a
   * shape segment.
   */
  private static getBestIntersectionPoint( vertex1Position: Vector2, vertex2Position: Vector2, bounds: Bounds2, boundsShape: Shape ): Vector2 {
    const rayDirection = vertex2Position.minus( vertex1Position ).normalized();
    const ray = new Ray2( vertex1Position, rayDirection );

    // First, look for an intersection against one of the corners of the bounds. If there is one, default
    // Kite shape intersection will return 0 intersections (because it is undefined) or 2 intersections (because it is
    // close enough to both intersecting segments at the corner point).
    let point = QuadrilateralUtils.getBoundsCornerPositionAlongRay( ray, bounds )!;
    if ( !point ) {

      // There was not an intersection with a corner, we should be safe to use Kite for shape intersection
      const intersections = boundsShape.intersection( ray );
      assert && assert( intersections.length === 1, 'There should one (and only one) intersection' );
      point = intersections[ 0 ].point;
    }

    assert && assert( point, 'Could not find an intersection point for the ray within the bounds.' );
    return point;
  }
}

quadrilateral.register( 'QuadrilateralDiagonalGuidesNode', QuadrilateralDiagonalGuidesNode );
