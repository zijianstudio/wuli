// Copyright 2020-2022, University of Colorado Boulder

/**
 * MagnetMovementArrowsNode is a Scenery node that depicts four arrows that are used to provide a hint to the user about
 * how the magnet can be moved.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowShape from '../../../../scenery-phet/js/ArrowShape.js';
import { Color, Node, Path } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';

// constants
const ARROW_FILL = new Color( 0xB2FCB7 );
const ARROW_STROKE = Color.BLACK;
const DISTANCE_FROM_MAGNET_TO_ARROW = 12; // in screen coordinates
const RIGHT_POINTING_ARROW_SHAPE = new ArrowShape( 0, 0, 30, 0, {
  tailWidth: 10,
  headWidth: 22,
  headHeight: 18
} );

class MagnetMovementArrowsNode extends Node {

  /**
   * @param {Dimension2} magnetDimensions
   * @param {Object} [options]
   */
  constructor( magnetDimensions, options ) {
    const rightArrow = new Path( RIGHT_POINTING_ARROW_SHAPE, {
      fill: ARROW_FILL,
      stroke: ARROW_STROKE,
      left: magnetDimensions.width / 2 + DISTANCE_FROM_MAGNET_TO_ARROW
    } );
    const leftArrow = new Path( RIGHT_POINTING_ARROW_SHAPE.transformed( Matrix3.scaling( -1, 1 ) ), {
      fill: ARROW_FILL,
      stroke: ARROW_STROKE,
      right: -magnetDimensions.width / 2 + -DISTANCE_FROM_MAGNET_TO_ARROW
    } );
    const topArrow = new Path( RIGHT_POINTING_ARROW_SHAPE.transformed( Matrix3.rotationAround( -Math.PI / 2, 0, 0 ) ), {
      fill: ARROW_FILL,
      stroke: ARROW_STROKE,
      bottom: -magnetDimensions.height / 2 - DISTANCE_FROM_MAGNET_TO_ARROW
    } );
    const bottomArrow = new Path( RIGHT_POINTING_ARROW_SHAPE.transformed( Matrix3.rotationAround( Math.PI / 2, 0, 0 ) ), {
      fill: ARROW_FILL,
      stroke: ARROW_STROKE,
      top: magnetDimensions.height / 2 + DISTANCE_FROM_MAGNET_TO_ARROW
    } );

    super( merge( {
      children: [ rightArrow, leftArrow, topArrow, bottomArrow ]
    }, options ) );
  }
}

faradaysLaw.register( 'MagnetMovementArrowsNode', MagnetMovementArrowsNode );
export default MagnetMovementArrowsNode;