// Copyright 2017-2022, University of Colorado Boulder

/**
 * The pullers attached to the mass and charge objects. The node maintains a list of puller images that vary in
 * perceived pull effort. They are made visible and invisible to correspond to a given force value.
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import LinearFunction from '../../../dot/js/LinearFunction.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import merge from '../../../phet-core/js/merge.js';
import { Circle, Image, Node, Path } from '../../../scenery/js/imports.js';
import inverseSquareLawCommon from '../inverseSquareLawCommon.js';
import ISLCPullerImages from '../ISLCPullerImages.js';

// constants
const IMAGE_SCALE = 0.45;

class ISLCPullerNode extends Node {

  /**
   * @param {RangeWithValue} forceRange - range of forces, used for determining the visible pullImage
   * @param {Object} [options]
   */
  constructor( forceRange, options ) {

    options = merge( {
      ropeLength: 50,
      shadowMinWidth: 32,
      shadowMaxWidth: 50,
      attractNegative: true, // if true, add pusher images
      displayShadow: true,
      atomicScale: false
    }, options );

    super();

    let pullImages = ISLCPullerImages.pullImages;
    let pushImages = ISLCPullerImages.pushImages;
    let zeroForceImage = ISLCPullerImages.zeroForceImage;

    // set atomic pullers if on the atomic screen
    if ( options.atomicScale ) {
      pullImages = ISLCPullerImages.atomicPullImages;
      pushImages = ISLCPullerImages.atomicPushImages;
      zeroForceImage = ISLCPullerImages.atomicZeroForceImage;
    }

    // @private
    this.pullerPusherImages = pullImages;

    // @public
    this.touchAreaBounds = new Bounds2( 0, 0, 0, 0 );

    // used to ensure that small non-zero forces do not map to the zero force puller (see lines 130-132)
    let zeroForceIndex = null;

    // if in coulomb's law, add pusher and zero force images in proper order
    if ( options.attractNegative ) {
      zeroForceIndex = pushImages.length;
      this.pullerPusherImages = pushImages.concat( zeroForceImage ).concat( pullImages );
    }

    // function that maps the visible image to the model force value
    const forceToImage = new LinearFunction( forceRange.min, forceRange.max, 0, this.pullerPusherImages.length - 1, true );

    // function to dynamically move the position of the shadow under the puller
    const indexToShadowOffset = new LinearFunction( 0, this.pullerPusherImages.length - 1, -4, 6 );

    // function that maps the size of the shadow to the force value
    const forceToShadowWidth = new LinearFunction( forceRange.min, forceRange.max, options.shadowMinWidth, options.shadowMaxWidth, true );

    // parent node for all puller images and the rope
    const pullerGroupNode = new Node();

    // the optional shadow node under the pullers - a circle scaled down vertically to look elliptical
    const shadowNode = new Circle( 10, {
      fill: '#777',
      scale: new Vector2( 1, 0.20 )
    } );

    // create each of the puller/pusher image nodes
    const images = [];
    let i;
    for ( i = 0; i < this.pullerPusherImages.length; i++ ) {
      const pullerImage = new Image( this.pullerPusherImages[ i ] );

      // puller images are much larger than pushers, so we need to scale it down
      pullerImage.scale( IMAGE_SCALE, IMAGE_SCALE );

      images.push( pullerImage );
    }

    pullerGroupNode.addChild( new Path( Shape.lineSegment( -options.ropeLength, 0, 0, 0 ), {
      stroke: '#666',
      lineWidth: 2
    } ) );

    // set the layout for the images
    for ( i = 0; i < this.pullerPusherImages.length; i++ ) {
      pullerGroupNode.addChild( images[ i ] );
      images[ i ].bottom = 42;
      images[ i ].right = -options.ropeLength;
      images[ i ].setVisible( false );

      // the pullImages grow in width as they animate, but their hands stay in the same position, so make sure that
      // they are still grabbing the rope
      images[ i ].right += 0.1 * images[ i ].width;
    }

    // shadow first so it is behind the pullers
    options.displayShadow && this.addChild( shadowNode );
    this.addChild( pullerGroupNode );
    const self = this;
    // @public - set the visibility of the image corresponding to the current force value
    this.setPull = function( force, offsetX ) {

      if ( options.attractNegative ) {
        force *= -1;
      }

      // from the force value, get an index for the visible image
      let index = Utils.roundSymmetric( forceToImage.evaluate( force ) );

      if ( force !== 0 && index === zeroForceIndex ) {
        index += ( force > 0 ) ? 1 : -1;
      }

      for ( let i = 0; i < this.pullerPusherImages.length; i++ ) {
        images[ i ].setVisible( i === index );
      }
      pullerGroupNode.x = -offsetX;

      // scale the shadow and place it under the visible image
      shadowNode.radius = forceToShadowWidth.evaluate( force ) / 2;
      shadowNode.right = images[ index ].right - offsetX + Utils.roundSymmetric( indexToShadowOffset.evaluate( index ) );
      shadowNode.centerY = images[ index ].bottom;

      // configure pointer area
      // NOTE: the rope is not included in the draggable node, so we expose the puller bounds here for setting
      // the touch and mouse areas in ISLCObjectNode
      self.touchAreaBounds = pullerGroupNode.bounds.withOffsets( 0, 0, -options.ropeLength + 5, 2 );
    };
  }
}

inverseSquareLawCommon.register( 'ISLCPullerNode', ISLCPullerNode );

export default ISLCPullerNode;