// Copyright 2014-2022, University of Colorado Boulder

/**
 * Magnet field lines for 'Faradays Law' simulation.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';

// constants
const ARROW_WIDTH = 16;
const ARROW_HEIGHT = 18;

// describes ellipse lines properties (sizes + arrows)
const LINE_DESCRIPTION = [
  { a: 600, b: 300, arrowPositions: [ Math.PI / 3.5, Math.PI - Math.PI / 3.5 ] },
  { a: 350, b: 125, arrowPositions: [ Math.PI / 7, Math.PI - Math.PI / 7 ] },
  { a: 180, b: 50, arrowPositions: [ -Math.PI / 2 ] },
  { a: 90, b: 25, arrowPositions: [ -Math.PI / 2 ] }
];

class MagnetFieldLines extends Node {

  /**
   * @param {Magnet} magnet - magnet model
   * @param {Tandem} tandem
   */
  constructor( magnet, tandem ) {
    super( {
      tandem: tandem,
      children: [
        createSideFieldLines( magnet.orientationProperty, +1 ), // top
        createSideFieldLines( magnet.orientationProperty, -1 ) // bottom
      ]
    } );
    magnet.fieldLinesVisibleProperty.linkAttribute( this, 'visible' );
  }
}

/**
 * Creates a single arrow
 * @param {Object} [options]
 * @returns {Path}
 */
const createArrow = options => new Path(
  new Shape()
    .moveTo( -ARROW_WIDTH, -ARROW_HEIGHT / 2 )
    .lineTo( 0, 0 )
    .lineTo( -ARROW_WIDTH, ARROW_HEIGHT / 2 ),
  {
    stroke: options.stroke,
    lineWidth: options.lineWidth
  }
);

/**
 * Create ellipse with arrows on it.
 * @param {number} radiusX - major axis of ellipse
 * @param {number} radiusY - minor axis of ellipse
 * @param {number[]} arrowPositions - array of angle positions of arrows on ellipse
 * @param {Property.<OrientationEnum>} orientationProperty - is magnet flipped
 * @param {Object} [options]
 * @returns {Node}
 */
const createArcWithArrow = ( radiusX, radiusY, arrowPositions, orientationProperty, options ) => {
  const arcWithArrow = new Node();
  options = merge( {
    stroke: '#ffffff',
    lineWidth: 3
  }, options );

  // arc
  const ellipticalShape = new Shape().ellipticalArc( 0, 0, radiusX, radiusY, 0, 0, 2 * Math.PI );
  arcWithArrow.addChild( new Path( ellipticalShape, {
    stroke: options.stroke,
    lineWidth: options.lineWidth
  } ) );

  // arrows on arc
  arrowPositions.forEach( angle => {
    const arrow = createArrow( {
      stroke: options.stroke,
      lineWidth: options.lineWidth
    } );
    const arrowPosition = ellipticalShape.getLastSegment().positionAtAngle( angle );
    arrow.right = arrowPosition.x;
    arrow.centerY = arrowPosition.y;

    const arrowTangent = ellipticalShape.getLastSegment().tangentAtAngle( angle );
    let rotationAngle = Math.atan( arrowTangent.y / arrowTangent.x ); // angle of tangent to an ellipse

    if ( arrowPosition.y > 0 ) {
      rotationAngle += Math.PI;
    }

    arrow.rotateAround( arrowPosition, rotationAngle );

    orientationProperty.lazyLink( () => {
      arrow.rotateAround( arrowPosition, Math.PI );
    } );
    arcWithArrow.addChild( arrow );
  } );

  return arcWithArrow;
};

/**
 * Create half of all magnet field lines
 * @param {Property.<OrientationEnum>} orientationProperty - is magnet flipped
 * @param {number} scaleY - +1/-1 bottom node is vertically flipped
 * @returns {Node}
 */
const createSideFieldLines = ( orientationProperty, scaleY ) => {
  const sideFieldLinesContainer = new Node();

  const dy = 3;

  // each ellipse change a bit position to show a near constant field
  LINE_DESCRIPTION.forEach( ( line, index ) => {
    const arc = createArcWithArrow( line.a, line.b, line.arrowPositions, orientationProperty );
    arc.bottom = 2 - index * dy;
    arc.centerX = 0;
    sideFieldLinesContainer.addChild( arc );
  } );
  sideFieldLinesContainer.scale( 1, scaleY );
  return sideFieldLinesContainer;
};

faradaysLaw.register( 'MagnetFieldLines', MagnetFieldLines );
export default MagnetFieldLines;