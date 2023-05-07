// Copyright 2022-2023, University of Colorado Boulder

/**
 * A Node that surrounds a QuadrilateralVertex to represent the current angle. The shape looks like a partial annulus that extends
 * between the sides that define the angles at a vertex. The annulus is broken into alternating light and dark
 * wedges so that it is easy to see relative angle sizes by counting the number of wedges at each guide.
 *
 * The annulus always starts at the same side so that as the QuadrilateralNode rotates, the guides always look the same.
 *
 * It also includes dashed lines that cross through the vertex to give a visualization of the external angle that is
 * outside the quadrilateral shape. Requested in https://github.com/phetsims/quadrilateral/issues/73.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../quadrilateral.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import QuadrilateralVertex from '../model/QuadrilateralVertex.js';
import Utils from '../../../../dot/js/Utils.js';
import { Line, Shape } from '../../../../kite/js/imports.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import QuadrilateralColors from '../../QuadrilateralColors.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import QuadrilateralShapeModel from '../model/QuadrilateralShapeModel.js';
import Multilink from '../../../../axon/js/Multilink.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';

// constants
// The size of each wedge of the angle guide, in radians
const WEDGE_SIZE_DEGREES = 30;
const WEDGE_SIZE_RADIANS = Utils.toRadians( WEDGE_SIZE_DEGREES );

// in model coordinates, width of the arc (outer radius - inner radius of the annulus)
const WEDGE_RADIAL_LENGTH = 0.05;

// The radii of the annulus
const INNER_RADIUS = QuadrilateralConstants.VERTEX_WIDTH / 2;
const OUTER_RADIUS = QuadrilateralConstants.VERTEX_WIDTH / 2 + WEDGE_RADIAL_LENGTH;

const EXTERNAL_ANGLE_GUIDE_LENGTH = WEDGE_RADIAL_LENGTH * 8;

export default class CornerGuideNode extends Node {
  public static readonly WEDGE_SIZE_RADIANS = WEDGE_SIZE_RADIANS;

  /**
   * @param vertex1 - The vertex whose angle we are going to represent
   * @param vertex2 - "anchoring" vertex, corner guide will be drawn relative to a line between vertex1 and vertex2
   * @param visibleProperty
   * @param shapeModel
   * @param modelViewTransform
   */
  public constructor( vertex1: QuadrilateralVertex, vertex2: QuadrilateralVertex, visibleProperty: BooleanProperty, shapeModel: QuadrilateralShapeModel, modelViewTransform: ModelViewTransform2 ) {
    super( {

      // This node is only visible when "Corner Guides" are enabled by the user
      visibleProperty: visibleProperty
    } );

    // The guide looks like alternating dark and light wedges along the annulus, we accomplish this with two paths
    const darkAnglePath = new Path( null, {
      fill: QuadrilateralColors.cornerGuideDarkColorProperty,
      stroke: QuadrilateralColors.markersStrokeColorProperty
    } );
    const lightAnglePath = new Path( null, {
      fill: QuadrilateralColors.cornerGuideLightColorProperty,
      stroke: QuadrilateralColors.markersStrokeColorProperty
    } );

    const crosshairPath = new Path( null, {
      stroke: QuadrilateralColors.markersStrokeColorProperty,
      lineDash: [ 3, 3 ]
    } );

    Multilink.multilink( [ vertex1.angleProperty, vertex1.positionProperty ], ( angle, position ) => {
      assert && assert( angle !== null, 'angleProperty needs to be defined to add listeners in CornerGuideNode' );
      assert && assert( angle! > 0, 'CornerGuideNodes cannot support angles at or less than zero' );
      const vertexCenter = vertex1.positionProperty.value;

      const definedAngle = angle!;

      // Line helps us find where we should start drawing the shape, the annulus is "anchored" to one side so that
      // it will look the same regardless of quadrilateral rotation.
      const line = new Line( vertex1.positionProperty.value, vertex2.positionProperty.value );

      // start of the shape, the edge of the vertex along the line parametrically
      const startT = Math.min( ( INNER_RADIUS ) / line.getArcLength(), 1 );
      let firstInnerPoint = line.positionAt( startT );

      // next point of the shape, edge of the vertex plus the size of the annulus parametrically along the line
      const endT = Math.min( ( OUTER_RADIUS ) / line.getArcLength(), 1 );
      let firstOuterPoint = line.positionAt( endT );

      const lightShape = new Shape();
      const darkShape = new Shape();

      const numberOfWedges = Math.floor( definedAngle / WEDGE_SIZE_RADIANS );
      for ( let i = 0; i < numberOfWedges; i++ ) {
        const nextShape = i % 2 === 0 ? lightShape : darkShape;

        const nextInnerPoint = firstInnerPoint.rotatedAboutPoint( vertexCenter, -WEDGE_SIZE_RADIANS );
        const nextOuterPoint = firstOuterPoint.rotatedAboutPoint( vertexCenter, -WEDGE_SIZE_RADIANS );

        CornerGuideNode.drawAngleSegment( nextShape, firstInnerPoint, firstOuterPoint, nextInnerPoint, nextOuterPoint );

        firstInnerPoint = nextInnerPoint;
        firstOuterPoint = nextOuterPoint;
      }

      // now draw the remainder - check to make sure that it is large enough to display because ellipticalArcTo doesn't
      // work with angles that are close to zero.
      const remainingAngle = ( definedAngle - ( numberOfWedges * WEDGE_SIZE_RADIANS ) );
      if ( remainingAngle > 0.0005 ) {

        // wedges alternate from light to dark, so we can count on the remaining wedge being the alternating color
        const remainderShape = numberOfWedges % 2 === 0 ? lightShape : darkShape;

        const nextInnerPoint = firstInnerPoint.rotatedAboutPoint( vertexCenter, -remainingAngle );
        const nextOuterPoint = firstOuterPoint.rotatedAboutPoint( vertexCenter, -remainingAngle );

        CornerGuideNode.drawAngleSegment( remainderShape, firstInnerPoint, firstOuterPoint, nextInnerPoint, nextOuterPoint );
      }

      darkAnglePath.shape = modelViewTransform.modelToViewShape( lightShape );
      lightAnglePath.shape = modelViewTransform.modelToViewShape( darkShape );

      // now draw the line so that we can update the angle
      // start of the first guiding line, along the line between vertices parametrically
      const innerT = Math.min( ( EXTERNAL_ANGLE_GUIDE_LENGTH / 3 ) / line.getArcLength(), 1 );
      const firstCrosshairPoint = CornerGuideNode.customPositionAt( line, innerT );
      const secondCrosshairPoint = CornerGuideNode.customPositionAt( line, -innerT );

      // for the points on the second crosshair line rotate by the angle around the center of the vertex
      const thirdCrosshairPoint = firstCrosshairPoint.rotatedAboutPoint( vertexCenter, 2 * Math.PI - definedAngle );
      const fourthCrosshairPoint = secondCrosshairPoint.rotatedAboutPoint( vertexCenter, 2 * Math.PI - definedAngle );

      const crosshairShape = new Shape();
      crosshairShape.moveToPoint( firstCrosshairPoint );
      crosshairShape.lineToPoint( secondCrosshairPoint );
      crosshairShape.moveToPoint( thirdCrosshairPoint );
      crosshairShape.lineToPoint( fourthCrosshairPoint );

      crosshairPath.shape = modelViewTransform.modelToViewShape( crosshairShape );
    } );

    const arcNode = new Node( { children: [ darkAnglePath, lightAnglePath ] } );
    this.children = [ arcNode, crosshairPath ];

    // When at a right angle, display the RightAngleIndicator, otherwise the arcs representing angles are shown.
    vertex1.angleProperty.link( angle => {
      arcNode.visible = !shapeModel.isRightAngle( angle! );
    } );
  }

  /**
   * Returns the parametric position along a line at the position t. Modified from Line.positionAt to support
   * positions outside the range [0, 1] which is necessary for drawing code in this component.
   */
  private static customPositionAt( line: Line, t: number ): Vector2 {
    return line.start.plus( line.end.minus( line.start ).times( t ) );
  }

  /**
   * Draw a single angle segment of the annulus. The provided shape will be mutated by this function.
   */
  private static drawAngleSegment( shape: Shape, firstInnerPoint: Vector2, firstOuterPoint: Vector2, secondInnerPoint: Vector2, secondOuterPoint: Vector2 ): void {
    shape.moveToPoint( firstInnerPoint );
    shape.lineToPoint( firstOuterPoint );
    shape.ellipticalArcTo( OUTER_RADIUS, OUTER_RADIUS, 0, false, false, secondOuterPoint.x, secondOuterPoint.y );
    shape.lineToPoint( secondInnerPoint );
    shape.ellipticalArcTo( INNER_RADIUS, INNER_RADIUS, 0, false, false, firstInnerPoint.x, firstInnerPoint.y );
    shape.close();
  }
}

quadrilateral.register( 'CornerGuideNode', CornerGuideNode );
