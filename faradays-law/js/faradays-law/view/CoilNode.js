// Copyright 2014-2022, University of Colorado Boulder

/**
 * Coil node for 'Faradays Law' simulation.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Image, Node } from '../../../../scenery/js/imports.js';
import fourLoopBack_png from '../../../mipmaps/fourLoopBack_png.js';
import fourLoopFront_png from '../../../mipmaps/fourLoopFront_png.js';
import twoLoopBack_png from '../../../mipmaps/twoLoopBack_png.js';
import twoLoopFront_png from '../../../mipmaps/twoLoopFront_png.js';
import faradaysLaw from '../../faradaysLaw.js';
import CoilTypeEnum from './CoilTypeEnum.js';

const IMAGE_MAP = {};
IMAGE_MAP[ CoilTypeEnum.TWO_COIL ] = {
  frontImage: twoLoopFront_png,
  backImage: twoLoopBack_png
};
IMAGE_MAP[ CoilTypeEnum.FOUR_COIL ] = {
  frontImage: fourLoopFront_png,
  backImage: fourLoopBack_png
};

// each coil have 2 ends, coordinates of each end relative to center of the coil
const COIL_END_COORDINATES_MAP = {};
COIL_END_COORDINATES_MAP[ CoilTypeEnum.TWO_COIL ] = {
  topEnd: new Vector2( 30, -10 ),
  bottomEnd: new Vector2( 60, 6 )
};
COIL_END_COORDINATES_MAP[ CoilTypeEnum.FOUR_COIL ] = {
  topEnd: new Vector2( 0, -10 ),
  bottomEnd: new Vector2( 70, 6 )
};

class CoilNode extends Node {

  /**
   * @param {CoilTypeEnum} coilType - determines which picture must we add to show coil
   * @param {Object} [options]
   */
  constructor( coilType, options ) {
    options = options || {};
    super();

    const scale = 1 / 3;

    const xOffset = CoilNode.xOffset + ( coilType === CoilTypeEnum.TWO_COIL ? CoilNode.twoOffset : 0 );

    this.addChild( new Image( IMAGE_MAP[ coilType ].backImage, {
      centerX: xOffset,
      centerY: 0,
      scale: scale
    } ) );

    // In FaradaysLawScreenView, the front image is detached from this Node and appended to front layer because the
    // front of the coil must be over magnet and backImage must be under it.
    // @public
    this.frontImage = new Image( IMAGE_MAP[ coilType ].frontImage, {
      centerX: xOffset,
      centerY: 0,
      scale: scale
    } );
    this.addChild( this.frontImage );

    this.endRelativePositions = COIL_END_COORDINATES_MAP[ coilType ];

    this.mutate( options );
  }
}

// extra offset is applied to the two-coil image to align with the wires
CoilNode.twoOffset = 8;
CoilNode.xOffset = 8;

faradaysLaw.register( 'CoilNode', CoilNode );
export default CoilNode;