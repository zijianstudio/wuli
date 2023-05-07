// Copyright 2018-2022, University of Colorado Boulder

/**
 * Displays a circular slice.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import { Shape } from '../../../../../kite/js/imports.js';
import merge from '../../../../../phet-core/js/merge.js';
import { Node, Path } from '../../../../../scenery/js/imports.js';
import FractionsCommonConstants from '../../../common/FractionsCommonConstants.js';
import FractionsCommonColors from '../../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../../fractionsCommon.js';

class CircularNode extends Node {
  /**
   * @param {number} denominator
   * @param {number} index
   * @param {Object} [options]
   */
  constructor( denominator, index, options ) {
    assert && assert( typeof denominator === 'number' );
    assert && assert( typeof index === 'number' );
    assert && assert( index < denominator );

    options = merge( {
      // {boolean} - If true, this node will have a permanent drop shadow added
      dropShadow: false,

      // {ColorDef} - If non-null, it will override the given color
      colorOverride: null
    }, options );

    assert && assert( typeof options.dropShadow === 'boolean' );

    super();

    // @private {number}
    this.denominator = denominator;
    this.angleUnit = -2 * Math.PI / denominator;
    this.bucketRotation = denominator === 1 ? 0 : ( Math.PI / 2 - this.angleUnit / 2 );

    const shape = new Shape();
    if ( denominator > 1 ) {
      shape.moveTo( 0, 0 ).arc( 0, 0, CircularNode.RADIUS, 0, this.angleUnit, true ).close();
    }
    else {
      shape.circle( 0, 0, CircularNode.RADIUS );
    }

    // @private {Node}
    this.container = new Node();
    this.addChild( this.container );

    // @private {Node}
    this.primaryPath = new Path( shape, {
      fill: options.colorOverride ? options.colorOverride : FractionsCommonColors.introCircleFillProperty,
      stroke: 'black'
    } );
    if ( options.dropShadow ) {
      // @private {Node}
      this.shadowPath = new Path( shape, { fill: FractionsCommonColors.introShapeShadowProperty } );
      this.shadowPath.center = this.primaryPath.center.plusScalar( FractionsCommonConstants.INTRO_DROP_SHADOW_OFFSET );
      this.container.addChild( this.shadowPath );
    }
    this.container.addChild( this.primaryPath );

    // @private {number}
    this.rotationAngle = 0;
    this.setRotationAngle( index * this.angleUnit );

    this.mutate( options );
  }

  /**
   * Rotates the displayed circular arc to a specific angle (recentering along the centeroid, and handling the shadow)
   * @public
   *
   * @param {number} angle
   */
  setRotationAngle( angle ) {
    this.rotationAngle = angle;
    this.primaryPath.rotation = angle;
    if ( this.shadowPath ) {
      this.shadowPath.rotation = angle;
      this.shadowPath.x = this.primaryPath.x + 5;
    }
    this.container.translation = this.getContainerOffset().negated();
  }

  /**
   * Returns the translation from the center of the container (based on the centroid of the swept arc).
   * @public
   *
   * @returns {Vector2}
   */
  getContainerOffset() {
    // From https://en.wikipedia.org/wiki/List_of_centroids
    const alpha = Math.PI / this.denominator;
    const centroidRadius = ( 2 / 3 ) * CircularNode.RADIUS * Math.sin( alpha ) / alpha;

    return Vector2.createPolar(
      centroidRadius,
      this.angleUnit / 2 + this.rotationAngle
    );
  }

  /**
   *
   * @returns {number}
   * @public
   */
  getCircleRotation() {
    return this.primaryPath.rotation;
  }
}

// @public {number} - The normal radius
CircularNode.RADIUS = 63;

fractionsCommon.register( 'CircularNode', CircularNode );
export default CircularNode;