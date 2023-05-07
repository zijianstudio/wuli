// Copyright 2022-2023, University of Colorado Boulder

/**
 * Icons for the simulation.
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { Circle, FlowBox, HBox, Line, Node, Path, PathOptions, Text } from '../../../../scenery/js/imports.js';
import Utils from '../../../../dot/js/Utils.js';
import GridIcon from '../../../../scenery-phet/js/GridIcon.js';
import quadrilateral from '../../quadrilateral.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';
import QuadrilateralColors from '../../QuadrilateralColors.js';
import { Line as ShapeLine, Shape } from '../../../../kite/js/imports.js';
import musicSolidShape from '../../../../sherpa/js/fontawesome-5/musicSolidShape.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Ray2 from '../../../../dot/js/Ray2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';

class QuadrilateralIconFactory {

  // layout constants for all icons
  public static readonly ICON_HEIGHT = 30;
  public static readonly ICON_LINE_WIDTH = 1.5;

  /**
   * Creates an icon for the "Corner Labels" checkbox that toggles visibility of labels on each QuadrilateralVertex.
   */
  public static createCornerLabelsIcon(): Node {

    const circle = new Circle( QuadrilateralIconFactory.ICON_HEIGHT / 2, {
      stroke: QuadrilateralColors.visibilityIconsColorProperty,
      lineWidth: QuadrilateralIconFactory.ICON_LINE_WIDTH
    } );

    const label = new Text( 'A', { ...QuadrilateralConstants.SCREEN_TEXT_OPTIONS, center: circle.center } );
    circle.addChild( label );

    return circle;
  }

  /**
   * Create an icon for the "Markers" checkbox that toggles visual indicators of the angle at each vertex.
   */
  public static createMarkersIcon(): Node {

    const pathOptions = {
      stroke: QuadrilateralColors.visibilityIconsColorProperty,
      lineWidth: QuadrilateralIconFactory.ICON_LINE_WIDTH
    };

    // parameters for drawing the icon
    const sidesAngle = Utils.toRadians( 110 ); // overall angle for the icon
    const sidesLength = QuadrilateralIconFactory.ICON_HEIGHT;
    const sidesHeight = QuadrilateralIconFactory.ICON_HEIGHT * 0.25; // chosen by inspection
    const wedgeAngle = Math.PI / 6; // size of each wedge graphic
    const tickLength = sidesHeight / 2;
    const innerIconRadius = sidesLength * 0.4; // radius of the inner-most arc and for the inner curve of angle wedges
    const outerIconRadius = sidesLength * 0.8; // radius of the outer-most arc and for the outer curve of angle wedges

    assert && assert( outerIconRadius > innerIconRadius, 'Arc radii do not make sense' );
    assert && assert( tickLength < sidesHeight, 'ticks will be too tall' );
    assert && assert( wedgeAngle < 2 * Math.PI, 'that angle does not make sense for this icon' );
    assert && assert( sidesLength > sidesHeight, 'Sides must be longer than they are tall for this icon' );

    // draw the "sides"
    const sidesShape = new Shape();

    // all drawing is relative to this origin
    const origin = new Vector2( 0, 0 );

    // bottom right of the horizontal side
    const bottomRightPoint = new Vector2( sidesLength, sidesHeight );

    // angle used to calculate new points perpendicular to others
    const strokeLeftAngle = Math.PI / 2;

    // the top right point of the vertical side
    const leftSideTopPoint = new Vector2( Math.cos( -sidesAngle ) * sidesLength, Math.sin( -sidesAngle ) * sidesLength );

    // the top left point of the vertical side
    const strokedLeftSidePoint = leftSideTopPoint.plusXY( Math.cos( sidesAngle + strokeLeftAngle ) * sidesHeight, -Math.sin( sidesAngle + strokeLeftAngle ) * sidesHeight );

    // the hardest part...we need to find the bottom point where the two outer lines of both sides intersect - we do
    // this by creating a line/ray pair that runs along the outer lines and using Kite to find the intersection point
    const bottomRay = new Ray2( bottomRightPoint, new Vector2( -1, 0 ) );
    const leftSideLine = new ShapeLine(
      strokedLeftSidePoint,

      // Line rotated back around to the origin, then with extra length to find the intersection point
      strokedLeftSidePoint.plusXY(
        Math.cos( sidesAngle + 2 * strokeLeftAngle ) * sidesLength * 2,
        -Math.sin( sidesAngle + 2 * strokeLeftAngle ) * sidesLength * 2 )
    );
    const intersections = leftSideLine.intersection( bottomRay );
    assert && assert( intersections.length === 1, 'Needs to be one and only one intersection point' );
    const bottomSideConnectionPoint = intersections[ 0 ].point;

    // Now that we have all points, draw the sides
    sidesShape.moveToPoint( origin );
    sidesShape.lineTo( sidesLength, 0 );
    sidesShape.lineTo( sidesLength, sidesHeight );
    sidesShape.lineToPoint( bottomSideConnectionPoint );

    // the outline of the vertical side
    sidesShape.lineToPoint( strokedLeftSidePoint );
    sidesShape.lineToPoint( leftSideTopPoint );

    // close back to the origin
    sidesShape.close();

    const sidesPath = new Path( sidesShape, pathOptions );

    // creates two arcs that look like the perpendicular axis angle split into three 30 degree segments
    const innerArcShape = Shape.arc( 0, 0, innerIconRadius, 0, 2 * Math.PI - sidesAngle, true );
    const innerArcPath = new Path( innerArcShape, pathOptions );

    const outerArcShape = Shape.arc( 0, 0, outerIconRadius, 0, 2 * Math.PI - sidesAngle, true );
    const outerArcPath = new Path( outerArcShape, pathOptions );

    const halfRadius = ( outerIconRadius + innerIconRadius ) / 2;
    const arcPaths = [];

    // only drawing every other wedge
    for ( let i = 0; i < sidesAngle; i = i + ( 2 * wedgeAngle ) ) {

      const startAngle = i;

      // only draw the final wedge within the angle range for thiss icon
      const endAngle = Math.min( startAngle + wedgeAngle, sidesAngle );

      const arcShape = Shape.arc( 0, 0, halfRadius, 2 * Math.PI - startAngle, 2 * Math.PI - endAngle, true );
      arcPaths.push( new Path( arcShape, combineOptions<PathOptions>( {}, pathOptions, { lineWidth: outerIconRadius - innerIconRadius } ) ) );
    }

    // ticks (along the bottom side)
    const ticksShape = new Shape();
    for ( let i = 0; i < 3; i++ ) {
      const tickX = 5 + i * sidesLength / 3; // offset a little from the origin
      ticksShape.moveTo( tickX, sidesHeight );
      ticksShape.lineTo( tickX, sidesHeight - tickLength );
    }
    const bottomTicksPath = new Path( ticksShape, pathOptions );

    // Effectively translates the ticksShape to the left and then rotates it clockwise (opposite direction of
    // sidesAngle) so that it lies on the left-most edge of the vertical side.
    const verticalTicksShape = ticksShape.transformed( Matrix3.rotationAround( Math.PI - sidesAngle, 0, 0 ).timesMatrix( Matrix3.translation( -sidesLength, 0 ) ) );
    const verticalTicksPath = new Path( verticalTicksShape, pathOptions );

    return new Node( {
      children: [ sidesPath, innerArcPath, outerArcPath, ...arcPaths, bottomTicksPath, verticalTicksPath ],

      // drawing relative to the origin means that the icon is wider than it should be
      maxWidth: QuadrilateralIconFactory.ICON_HEIGHT
    } );
  }

  /**
   * Icon for the diagonals control, a pair of crossed lines.
   */
  public static createDiagonalGuidesIcon(): Node {
    const iconHeight = QuadrilateralIconFactory.ICON_HEIGHT;
    const lineOptions = { stroke: QuadrilateralColors.visibilityIconsColorProperty, lineWidth: QuadrilateralIconFactory.ICON_LINE_WIDTH, lineDash: [ 5, 3 ] };
    const firstDiagonal = new Line( -iconHeight / 2, -iconHeight / 2, iconHeight / 2, iconHeight / 2, lineOptions );
    const secondDiagonal = new Line( iconHeight / 2, -iconHeight / 2, -iconHeight / 2, iconHeight / 2, lineOptions );

    return new Node( {
      children: [ firstDiagonal, secondDiagonal ]
    } );
  }

  /**
   * Icon for the shape music control.
   */
  public static createSoundIcon(): Node {
    return new Path( musicSolidShape, {
      maxHeight: QuadrilateralIconFactory.ICON_HEIGHT,
      fill: QuadrilateralColors.visibilityIconsColorProperty
    } );
  }

  /**
   * Icon for the grid visibility control.
   */
  public static createGridIcon(): Node {
    return new GridIcon( {
      size: QuadrilateralIconFactory.ICON_HEIGHT,
      stroke: QuadrilateralColors.visibilityIconsColorProperty,
      lineWidth: QuadrilateralIconFactory.ICON_LINE_WIDTH
    } );
  }

  /**
   * Layout a label Text and icon Node, in that order for various UI controls. Returns a flowbox so that 'stretch'
   * can be used to align text and icons in a parent layout container.
   */
  public static createLabelledIcon( iconNode: Node, labelString: TReadOnlyProperty<string> ): FlowBox {
    const labelText = new Text( labelString, {
      font: QuadrilateralConstants.SCREEN_TEXT_FONT,
      maxWidth: 85
    } );

    return new HBox( {
      children: [ labelText, iconNode ],
      spacing: 15
    } );
  }
}

quadrilateral.register( 'QuadrilateralIconFactory', QuadrilateralIconFactory );
export default QuadrilateralIconFactory;
