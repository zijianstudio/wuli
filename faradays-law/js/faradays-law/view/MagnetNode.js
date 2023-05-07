// Copyright 2014-2022, University of Colorado Boulder

/**
 * Magnet Node for 'Faradays Law' simulation.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawStrings from '../../FaradaysLawStrings.js';
import OrientationEnum from '../model/OrientationEnum.js';

const faradaysLawNString = FaradaysLawStrings[ 'faradays-law' ].n;
const faradaysLawSString = FaradaysLawStrings[ 'faradays-law' ].s;

// constants

// offset for 3D looking, calculated as width*MAGNET_OFFSET_DX_RATIO
const MAGNET_OFFSET_DX_RATIO = 1 / 35;
const MAGNET_OFFSET_DY_RATIO = 1 / 15;
const MAGNET_3D_SHADOW = 0.4;

class MagnetNode extends Node {

  /**
   * @param {OrientationEnum} orientation - is magnet flipped
   * @param {Object} [options]
   */
  constructor( orientation, options ) {
    super( { cursor: 'pointer' } );

    // options of magnetNode
    options = merge( {
      width: 140,
      height: 30,
      font: new PhetFont( 24 ),
      fontColor: 'white'
    }, options );

    // create north pole magnet
    const northPoleLabel = new Text( faradaysLawNString, {
      font: options.font,
      fill: options.fontColor
    } );
    const northPole = drawHalfMagnetNode( options.width, options.height, northPoleLabel, new Color( '#db1e21' ), {
      left: -options.width / 2,
      centerY: 0
    } );
    this.addChild( northPole );

    // create south pole magnet
    const southPoleLabel = new Text( faradaysLawSString, {
      font: options.font,
      fill: options.fontColor
    } );
    const southPole = drawHalfMagnetNode( options.width, options.height, southPoleLabel, new Color( '#354d9a' ), {
      left: 0,
      centerY: 0
    } );
    this.addChild( southPole );

    // Touch area covers both poles
    this.touchArea = southPole.bounds.union( northPole.bounds ).dilated( 10 );

    if ( orientation === OrientationEnum.SN ) {
      northPole.left = 0;
      southPole.left = -options.width / 2;
      northPole.moveToFront();
    }
  }
}

/**
 * @param {number} magnetWidth - width of Magnet
 * @param {number} magnetHeight - height of Magnet
 * @param {string} label - label on half of magnet
 * @param {Color} backgroundColor
 * @param {Object} [options]
 * @returns {Node}
 */
const drawHalfMagnetNode = ( magnetWidth, magnetHeight, label, backgroundColor, options ) => {
  const halfMagnetNode = new Node();

  // add the top and sides to create a 3D appearance
  halfMagnetNode.addChild( new Path( new Shape()
    .moveTo( -magnetWidth / 4, -magnetHeight / 2 )
    .lineTo( -magnetWidth / 4 + magnetWidth * MAGNET_OFFSET_DX_RATIO, -magnetHeight / 2 - magnetHeight * MAGNET_OFFSET_DY_RATIO )
    .lineTo( magnetWidth / 4 + magnetWidth * MAGNET_OFFSET_DX_RATIO, -magnetHeight / 2 - magnetHeight * MAGNET_OFFSET_DY_RATIO )
    .lineTo( magnetWidth / 4 + magnetWidth * MAGNET_OFFSET_DX_RATIO, magnetHeight / 2 - magnetHeight * MAGNET_OFFSET_DY_RATIO )
    .lineTo( magnetWidth / 4, magnetHeight / 2 )
    .lineTo( -magnetWidth / 4, -magnetHeight / 2 )
    .close(), {
    fill: backgroundColor.colorUtilsDarker( MAGNET_3D_SHADOW )
  } ) );

  // add the front
  halfMagnetNode.addChild( new Rectangle( -magnetWidth / 4, -magnetHeight / 2, magnetWidth / 2, magnetHeight, {
    fill: backgroundColor
  } ) );

  // Scale the label if it's too large.  This assumes that width, not height, is the important factor.
  label.scale( Math.min( ( magnetWidth * 0.45 ) / label.width, 1 ) );
  label.centerX = 0;
  label.centerY = 0;

  // label
  halfMagnetNode.addChild( label );

  halfMagnetNode.mutate( options );

  return halfMagnetNode;
};

faradaysLaw.register( 'MagnetNode', MagnetNode );
export default MagnetNode;