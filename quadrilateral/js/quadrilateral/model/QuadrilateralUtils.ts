// Copyright 2022-2023, University of Colorado Boulder

/**
 * Model utility functions for the quadrilateral sim. These functions assist with various shape and geometry
 * calculations.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Ray2 from '../../../../dot/js/Ray2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Line, Shape } from '../../../../kite/js/imports.js';
import quadrilateral from '../../quadrilateral.js';
import QuadrilateralVertex from './QuadrilateralVertex.js';

// A useful type for calculations for the vertex Shapes which define where the QuadrilateralVertex can move depending on
// the positions of the other vertices. Lines are along the bounds of model space and RayIntersections
// are the intersections between rays formed by adjacent vertices and the Line. See createVertexAreas for
// more information.
export type LineIntersectionPair = {
  line: Line;
  intersectionPoint: Vector2;
};

export default class QuadrilateralUtils {

  /**
   * A workaround for https://github.com/phetsims/kite/issues/94. Shape.containsPoint implementation does not work
   * if both the provided point and one of the shape segment vertices lie along the test ray used in the
   * winding intersection algorithm. This function looks for a different ray to use in the test if that is the case.
   *
   * This solution has been proposed in https://github.com/phetsims/kite/issues/94. If it is absorbed or fixed a
   * different way in kite, this function could be removed and replaced with shape.containsPoint.
   */
  public static customShapeContainsPoint( shape: Shape, point: Vector2 ): boolean {
    const rayDirectionVector = new Vector2( 1, 0 ); // unit x Vector, but we may mutate it
    let ray = new Ray2( point, rayDirectionVector );

    // Put a limit on attempts so we don't try forever
    let count = 0;
    while ( count < 5 ) {
      count++;

      // Look for cases where the proposed ray will intersect with one of the vertices of a shape segment - in this case
      // the intersection in windingIntersection is not well-defined and won't be counted so we need to use a ray with
      // a different direction
      const rayIntersectsSegmentVertex = _.some( shape.subpaths, subpath => {
        return _.some( subpath.segments, segment => {
          return segment.start.minus( point ).normalize().equals( rayDirectionVector );
        } );
      } );

      if ( rayIntersectsSegmentVertex ) {

        // the proposed ray will not work because it intersects with a segment QuadrilateralVertex - try another one
        rayDirectionVector.rotate( dotRandom.nextDouble() );
      }
      else {

        // Should be safe to use this Ray for windingIntersection
        ray = new Ray2( point, rayDirectionVector );
        break;
      }
    }

    return shape.windingIntersection( ray ) !== 0;
  }

  /**
   * Returns one of the corner points of the Bounds2 if the provided ray goes exactly through that point. Works
   * around a limitation of Shape.intersects( Ray2 ) where if the ray intersects with a start/end point of a shape
   * segment, the intersection is not defined.
   */
  public static getBoundsCornerPositionAlongRay( ray: Ray2, bounds: Bounds2 ): Vector2 | null {
    return QuadrilateralUtils.isPointOnRay( ray, bounds.leftTop ) ? bounds.leftTop :
           QuadrilateralUtils.isPointOnRay( ray, bounds.rightTop ) ? bounds.rightTop :
           QuadrilateralUtils.isPointOnRay( ray, bounds.rightBottom ) ? bounds.rightBottom :
           QuadrilateralUtils.isPointOnRay( ray, bounds.leftBottom ) ? bounds.leftBottom :
           null;
  }

  /**
   * Returns the centroid of a shape from an array of potential QuadrilateralVertex positions.
   */
  public static getCentroidFromPositions( positions: Vector2[] ): Vector2 {
    const centerX = _.sumBy( positions, position => position.x ) / positions.length;
    const centerY = _.sumBy( positions, position => position.y ) / positions.length;

    return new Vector2( centerX, centerY );
  }

  /**
   * Create a constraining area for a QuadrilateralVertex to move in the play area that will ensure that it cannot overlap
   * other vertices or sides or create a crossed quadrilateral shape.
   *
   * For discussion about this algorithm, see https://github.com/phetsims/quadrilateral/issues/15. In
   * particular, see https://github.com/phetsims/quadrilateral/issues/15#issuecomment-964534862 for final comments
   * and examples for the shape this function should return.
   *
   * @param modelBounds - The bounds containing all vertices (entire model space)
   * @param vertex1 - The vertex whose area we are determining
   * @param vertex2 - the next vertex from vertexA, moving clockwise
   * @param vertex3 - the next vertex from vertexB, moving clockwise
   * @param vertex4 - the next vertex from vertexC, moving clockwise
   * @param validateShape - Ensure that vertex positions are valid?
   */
  public static createVertexArea( modelBounds: Bounds2, vertex1: QuadrilateralVertex, vertex2: QuadrilateralVertex, vertex3: QuadrilateralVertex, vertex4: QuadrilateralVertex, validateShape: boolean ): Shape {

    const allVerticesInBounds = _.every( [ vertex1, vertex2, vertex3, vertex4 ], vertex => modelBounds.containsPoint( vertex.positionProperty.value ) );
    const vertexPositionsUnique = _.uniqBy( [ vertex1, vertex2, vertex3, vertex4 ].map( vertex => vertex.positionProperty.value.toString() ), positionString => {
      return positionString;
    } ).length === 4;
    if ( validateShape ) {
      assert && assert( allVerticesInBounds, 'A vertex is not contained by modelBounds!' );
      assert && assert( vertexPositionsUnique, 'There are two vertices that overlap! That would create lines of zero length and break this algorithm' );
    }

    if ( !allVerticesInBounds || !vertexPositionsUnique ) {

      // The shape creation algorithm requires that all vertices are in bounds - we may need to handle this gracefully
      // so just return an empty shape in this case
      return new Shape();
    }

    // Lines around the bounds to detect intersections - remember that for Bounds2 top and bottom
    // will be flipped relative to the model because Bounds2 matches scenery +y direction convention.
    const leftLine = new Line( modelBounds.leftTop, modelBounds.leftBottom );
    const topLine = new Line( modelBounds.leftBottom, modelBounds.rightBottom );
    const rightLine = new Line( modelBounds.rightBottom, modelBounds.rightTop );
    const bottomLine = new Line( modelBounds.rightTop, modelBounds.leftTop );

    // the lines collected here in clockwise order, segments have start/end points in clockwise order as well.
    // This way we can create a bounding shape with getPointsAlongBoundary, see that function for more info.
    const directedLines: Line[] = [ leftLine, topLine, rightLine, bottomLine ];

    let firstRayDirection: null | Vector2 = null;
    let firstRay: null | Ray2 = null;

    let secondRayDirection: null | Vector2 = null;
    let secondRay: null | Ray2 = null;

    if ( vertex3.angleProperty.value! > Math.PI ) {

      // angle is greater than Math.PI so we have a concave shape and need to create a more constrained shape to for
      // the QuadrilateralVertex to prevent crossed quadrilaterals
      firstRayDirection = vertex3.positionProperty.value.minus( vertex2.positionProperty.value ).normalized();
      firstRay = new Ray2( vertex2.positionProperty.value, firstRayDirection );

      secondRayDirection = vertex3.positionProperty.value.minus( vertex4.positionProperty.value ).normalized();
      secondRay = new Ray2( vertex4.positionProperty.value, secondRayDirection );
    }
    else {

      // with an angle less than Math.PI we can walk along rays that form a bisection between vertex2 and vertex4
      firstRayDirection = vertex4.positionProperty.value.minus( vertex2.positionProperty.value ).normalized();
      firstRay = new Ray2( vertex4.positionProperty.value, firstRayDirection );

      secondRayDirection = vertex2.positionProperty.value.minus( vertex4.positionProperty.value ).normalized();
      secondRay = new Ray2( vertex2.positionProperty.value, secondRayDirection );
    }

    // Find the intersection points between the calculated rays and directed boundary lines.
    let firstRayIntersectionLinePair: null | LineIntersectionPair = null;
    let secondRayIntersectionLinePair: null | LineIntersectionPair = null;
    directedLines.forEach( line => {
      if ( firstRayIntersectionLinePair === null ) {
        firstRayIntersectionLinePair = QuadrilateralUtils.getLineIntersectionPair( firstRay!, line );
      }
      if ( secondRayIntersectionLinePair === null ) {
        secondRayIntersectionLinePair = QuadrilateralUtils.getLineIntersectionPair( secondRay!, line );
      }
    } );
    assert && assert( firstRayIntersectionLinePair && secondRayIntersectionLinePair, 'ray intersections were not found' );

    // An array of points that will create the final shape
    let points = [];

    if ( vertex3.angleProperty.value! > Math.PI ) {

      // angle is greater than Math.PI so we have a concave shape and need to use a more constrained shape to
      // prevent crossed quadrilaterals
      points.push( vertex3.positionProperty.value ); // start at the opposite vertex

      // The rays between (vertex2 and vertex3) and (vertex4 and vertex3) define the shape that will prevent crossed
      // quadrilaterals, so after starting at vertex3 we just walk clockwise along the boundary points
      const intersectionAndBoundaryPoints = QuadrilateralUtils.getPointsAlongBoundary( directedLines, firstRayIntersectionLinePair!, secondRayIntersectionLinePair! );
      points = points.concat( intersectionAndBoundaryPoints );
    }
    else {

      // We have a convex shape so we can allow a larger area of movement without creating a twisted shape. This shape
      // will walk between all other vertices and then close by walking clockwise around the bounds
      points.push( vertex3.positionProperty.value ); // start at the opposite vertex
      points.push( vertex4.positionProperty.value ); // walk to the next vertex

      const intersectionAndBoundaryPoints = QuadrilateralUtils.getPointsAlongBoundary( directedLines, firstRayIntersectionLinePair!, secondRayIntersectionLinePair! );
      points = points.concat( intersectionAndBoundaryPoints );

      points.push( vertex2.positionProperty.value ); // walk back to vertexB
    }

    // Finally, create the shape from calculated points
    const shape = new Shape();
    shape.moveToPoint( points[ 0 ] );
    for ( let i = 1; i < points.length; i++ ) {
      shape.lineToPoint( points[ i ] );
    }

    // closing the shape after the last intersection should bring us back to vertex3
    shape.close();

    return shape;
  }

  /**
   * Get the LineIntersectionPair from the intersection between the ray and the Line. Handles a special case where
   * the ray intersects the exact start/end of a Line. If there is no intersection point, returns null.
   */
  private static getLineIntersectionPair( ray: Ray2, line: Line ): LineIntersectionPair | null {
    let intersectionLinePair: null | LineIntersectionPair = null;

    const rayIntersections = line.intersection( ray );
    if ( rayIntersections.length > 0 ) {
      intersectionLinePair = {
        line: line,
        intersectionPoint: rayIntersections[ 0 ].point
      };
    }
    else {

      // There wasn't an intersection, the ray intersected exactly with a corner of the bounds, which is not
      // a defined intersection according to Kite.
      const intersectionPoint = QuadrilateralUtils.getLinePositionAlongRay( ray, line );
      if ( intersectionPoint ) {
        intersectionLinePair = {
          line: line,
          intersectionPoint: intersectionPoint
        };
      }
    }

    return intersectionLinePair;
  }

  /**
   * Returns true if the provided point lies on the ray.
   */
  private static isPointOnRay( ray: Ray2, point: Vector2 ): boolean {
    const directionToPoint = point.minus( ray.position ).normalized();
    return ray.direction.equalsEpsilon( directionToPoint, 1e-2 );
  }

  /**
   * Returns the start or end point of a Line if the ray goes through it. Assists with intersection detection since
   * Kite functions do not have a defined intersection if a ray goes exactly through an endpoint of a line or segment.
   */
  private static getLinePositionAlongRay( ray: Ray2, line: Line ): Vector2 | null {
    return QuadrilateralUtils.isPointOnRay( ray, line.start ) ? line.start :
           QuadrilateralUtils.isPointOnRay( ray, line.end ) ? line.end :
           null;
  }

  /**
   * To create a bounding shape for a QuadrilateralVertex, walk along the boundary defined by directedLines until we traverse
   * between two points along the boundary. The directed lines are ordered and directed in a clockwise motion around
   * the entire model to assist in the traversal between intersection points. Graphically, what we are accomplishing
   * is this:
   *                        - firstLineIntersectionPair.intersection.point (A)
   *   -------------------A--B
   *  |                      |
   *  |                      |
   *  |                      |
   *  |                      |
   *  |                      |
   *  ----D------------------C
   *       - secondLineIntersectionPair.intersection.point (D)
   *
   * This function will return an array of points [A, B, C, D] to create a shape between the intersections on the lines.
   */
  private static getPointsAlongBoundary( directedLines: Line[], firstLineIntersectionPair: LineIntersectionPair, secondLineIntersectionPair: LineIntersectionPair ): Vector2[] {
    const points = [];

    // walk to the first ray intersection with the bounds
    points.push( firstLineIntersectionPair.intersectionPoint );

    // a safety net to make sure that we don't get stuck in this while loop
    let iterations = 0;

    // walk along the bounds, adding corner points until we reach the same line as the secondLineIntersectionPair
    let nextLine = firstLineIntersectionPair.line;
    while ( nextLine !== secondLineIntersectionPair.line ) {
      points.push( nextLine.end );

      let nextIndex = directedLines.indexOf( nextLine ) + 1;
      nextIndex = nextIndex > ( directedLines.length - 1 ) ? 0 : nextIndex;

      nextLine = directedLines[ nextIndex ];
      assert && assert( nextLine, 'No more lines in the traversal' );

      iterations++;
      assert && assert( iterations < 10, 'we should have closed the shape by now! Likely infinite loop' );
    }

    // we have walked to the same line as the second intersection point, finalize by including the second
    // intersection point
    points.push( secondLineIntersectionPair.intersectionPoint );

    return points;
  }
}

quadrilateral.register( 'QuadrilateralUtils', QuadrilateralUtils );
