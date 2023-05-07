// Copyright 2018-2022, University of Colorado Boulder

/**
 * Displays a slice of cake.
 *
 * @author Martin Veillette (Berea College)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../../dot/js/Dimension2.js';
import Ray2 from '../../../../../dot/js/Ray2.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import { EllipticalArc, Line, Shape } from '../../../../../kite/js/imports.js';
import merge from '../../../../../phet-core/js/merge.js';
import { Image, Node, Path } from '../../../../../scenery/js/imports.js';
import cake_1_1_png from '../../../../mipmaps/cake_1_1_png.js';
import cake_2_1_png from '../../../../mipmaps/cake_2_1_png.js';
import cake_2_2_png from '../../../../mipmaps/cake_2_2_png.js';
import cake_3_1_png from '../../../../mipmaps/cake_3_1_png.js';
import cake_3_2_png from '../../../../mipmaps/cake_3_2_png.js';
import cake_3_3_png from '../../../../mipmaps/cake_3_3_png.js';
import cake_4_1_png from '../../../../mipmaps/cake_4_1_png.js';
import cake_4_2_png from '../../../../mipmaps/cake_4_2_png.js';
import cake_4_3_png from '../../../../mipmaps/cake_4_3_png.js';
import cake_4_4_png from '../../../../mipmaps/cake_4_4_png.js';
import cake_5_1_png from '../../../../mipmaps/cake_5_1_png.js';
import cake_5_2_png from '../../../../mipmaps/cake_5_2_png.js';
import cake_5_3_png from '../../../../mipmaps/cake_5_3_png.js';
import cake_5_4_png from '../../../../mipmaps/cake_5_4_png.js';
import cake_5_5_png from '../../../../mipmaps/cake_5_5_png.js';
import cake_6_1_png from '../../../../mipmaps/cake_6_1_png.js';
import cake_6_2_png from '../../../../mipmaps/cake_6_2_png.js';
import cake_6_3_png from '../../../../mipmaps/cake_6_3_png.js';
import cake_6_4_png from '../../../../mipmaps/cake_6_4_png.js';
import cake_6_5_png from '../../../../mipmaps/cake_6_5_png.js';
import cake_6_6_png from '../../../../mipmaps/cake_6_6_png.js';
import cake_7_1_png from '../../../../mipmaps/cake_7_1_png.js';
import cake_7_2_png from '../../../../mipmaps/cake_7_2_png.js';
import cake_7_3_png from '../../../../mipmaps/cake_7_3_png.js';
import cake_7_4_png from '../../../../mipmaps/cake_7_4_png.js';
import cake_7_5_png from '../../../../mipmaps/cake_7_5_png.js';
import cake_7_6_png from '../../../../mipmaps/cake_7_6_png.js';
import cake_7_7_png from '../../../../mipmaps/cake_7_7_png.js';
import cake_8_1_png from '../../../../mipmaps/cake_8_1_png.js';
import cake_8_2_png from '../../../../mipmaps/cake_8_2_png.js';
import cake_8_3_png from '../../../../mipmaps/cake_8_3_png.js';
import cake_8_4_png from '../../../../mipmaps/cake_8_4_png.js';
import cake_8_5_png from '../../../../mipmaps/cake_8_5_png.js';
import cake_8_6_png from '../../../../mipmaps/cake_8_6_png.js';
import cake_8_7_png from '../../../../mipmaps/cake_8_7_png.js';
import cake_8_8_png from '../../../../mipmaps/cake_8_8_png.js';
import FractionsCommonConstants from '../../../common/FractionsCommonConstants.js';
import FractionsCommonColors from '../../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../../fractionsCommon.js';

// constants

// {Array.<Array.<Array.<*>>>} - cakeImageArray[ denominator + 1 ][ rotationalIndex ] will be something that can be
// passed to scenery Images.
const cakeImageArray = [
  [ cake_1_1_png ],
  [ cake_2_2_png, cake_2_1_png ],
  [ cake_3_1_png, cake_3_2_png, cake_3_3_png ],
  [ cake_4_1_png, cake_4_2_png, cake_4_3_png, cake_4_4_png ],
  [ cake_5_1_png, cake_5_2_png, cake_5_3_png, cake_5_4_png, cake_5_5_png ],
  [ cake_6_1_png, cake_6_2_png, cake_6_3_png, cake_6_4_png, cake_6_5_png, cake_6_6_png ],
  [ cake_7_1_png, cake_7_2_png, cake_7_3_png, cake_7_4_png, cake_7_5_png, cake_7_6_png, cake_7_7_png ],
  [ cake_8_1_png, cake_8_2_png, cake_8_3_png, cake_8_4_png, cake_8_5_png, cake_8_6_png, cake_8_7_png, cake_8_8_png ]
];

// We create a matching mathematical model of the cake's "positions", tuned by hand so that the shapes will match the
// given images.
const CAKE_IMAGE_SIZE = new Dimension2( 219, 166 );
const CAKE_IMAGE_BOUNDS = new Bounds2( 25, 10, 194, 154 );
const CAKE_DEFAULT_SCALE = 130 / CAKE_IMAGE_SIZE.height;
const SCALED_CAKE_IMAGE_SIZE = new Dimension2(
  CAKE_DEFAULT_SCALE * CAKE_IMAGE_SIZE.width,
  CAKE_DEFAULT_SCALE * CAKE_IMAGE_SIZE.height
);
// The determined center of the cake images (determined empirically)
const CAKE_OFFSET = new Vector2( 0.5 * SCALED_CAKE_IMAGE_SIZE.width, 0.55 * SCALED_CAKE_IMAGE_SIZE.height );

// The ellipse base (bottom face) of cake slices
const BASE_ELLIPSE_CENTER = new Vector2( CAKE_IMAGE_SIZE.width * 0.501, CAKE_IMAGE_SIZE.height * 0.641 );
const BASE_ELLIPSE_RADII = new Vector2( CAKE_IMAGE_SIZE.width * 0.364, CAKE_IMAGE_SIZE.height * 0.276 );
const BASE_ELLIPSE_OFFSET_CENTER = BASE_ELLIPSE_CENTER.plusXY( 0, -0.07 * CAKE_IMAGE_SIZE.height );
const BASE_ASPECT = 0.565;

// An ellipse at the very top of the "side" of the cake (where the black line is)
const MID_ELLIPSE_CENTER = new Vector2( CAKE_IMAGE_SIZE.width * 0.501, CAKE_IMAGE_SIZE.height * 0.42 );
const MID_ELLIPSE_RADII = new Vector2( CAKE_IMAGE_SIZE.width * 0.38, CAKE_IMAGE_SIZE.height * 0.25 );
const MID_ELLIPSE_OFFSET_CENTER = MID_ELLIPSE_CENTER.plusXY( 0, -0.06 * CAKE_IMAGE_SIZE.height );
const MID_ASPECT = 0.46;

// An ellipse at the outside of the "top" of the cake (where the green piping is)
const TOP_ELLIPSE_CENTER = new Vector2( CAKE_IMAGE_SIZE.width * 0.501, CAKE_IMAGE_SIZE.height * 0.365 );
const TOP_ELLIPSE_RADII = new Vector2( CAKE_IMAGE_SIZE.width * 0.355, CAKE_IMAGE_SIZE.height * 0.215 );
const TOP_ELLIPSE_OFFSET_CENTER = TOP_ELLIPSE_CENTER.plusXY( 0, -0.04 * CAKE_IMAGE_SIZE.height );
const TOP_ASPECT = 0.42;

const BASE_ELLIPSE = new EllipticalArc(
  BASE_ELLIPSE_CENTER,
  BASE_ELLIPSE_RADII.x,
  BASE_ELLIPSE_RADII.y,
  0, 0, 2 * Math.PI, false );

const MID_ELLIPSE = new EllipticalArc(
  MID_ELLIPSE_CENTER,
  MID_ELLIPSE_RADII.x,
  MID_ELLIPSE_RADII.y,
  0, 0, 2 * Math.PI, false );

const TOP_ELLIPSE = new EllipticalArc(
  TOP_ELLIPSE_CENTER,
  TOP_ELLIPSE_RADII.x,
  TOP_ELLIPSE_RADII.y,
  0, 0, 2 * Math.PI, false );

class CakeNode extends Node {
  /**
   * @param {number} denominator
   * @param {number} index
   * @param {Object} [options]
   */
  constructor( denominator, index, options ) {
    assert && assert( index < denominator );

    options = merge( {
      // {boolean} - If true, this node will have a permanent drop shadow added
      dropShadow: false
    }, options );

    assert && assert( typeof options.dropShadow === 'boolean' );

    super();

    if ( options.dropShadow ) {
      // @private {Node}
      this.shadowPath = new Path( null, {
        fill: FractionsCommonColors.introShapeShadowProperty,
        scale: CAKE_DEFAULT_SCALE
      } );
      this.addChild( this.shadowPath );
    }

    // @private {Image}
    this.imageNode = new Image( cakeImageArray[ denominator - 1 ][ index ], {
      scale: CAKE_DEFAULT_SCALE,
      localBounds: CAKE_IMAGE_BOUNDS
    } );
    this.addChild( this.imageNode );

    // @private {number}
    this.denominator = denominator;

    this.setCakeIndex( index );
    this.mutate( options );
  }

  /**
   * Returns the offset of the node comared to the origin.
   * @public
   *
   * NOTE: This may be slightly wrong, but AP wasn't concerned about it enough. Try the cake animations when
   * you drop a piece with ?speed=0.1, there will be a slight jump.
   *
   * @returns {Vector2}
   */
  getOffset() {
    return this.imageNode.translation.negated().minus( CAKE_OFFSET );
  }

  /**
   * Sets the slice cake image based on the index.
   * @public
   *
   * @param {number} index
   */
  setCakeIndex( index ) {
    this.imageNode.setImage( cakeImageArray[ this.denominator - 1 ][ index ] );

    // Center of the cake plate, empirically determined
    const imageCenter = CAKE_OFFSET;

    if ( this.denominator === 1 ) {
      this.imageNode.translation = imageCenter.negated();
    }
    else if ( this.denominator === 2 ) {
      this.imageNode.translation = imageCenter.plus(
        Vector2.createPolar( this.height / 4, -2 * Math.PI * ( 1 - index ) / this.denominator ) ).negated();
    }
    else {
      this.imageNode.translation = imageCenter.plus( Vector2.createPolar(
        this.height / 4,
        -2 * Math.PI * ( index + 1 / 2 ) / this.denominator
      ) ).negated();
    }

    const cakeShape = CakeNode.CAKE_SHAPES[ this.denominator - 1 ][ index ];
    this.imageNode.mouseArea = cakeShape;
    this.imageNode.touchArea = cakeShape;
    this.imageNode.localBounds = cakeShape.bounds;

    if ( this.shadowPath ) {
      const cakeShadowShape = CakeNode.CAKE_SHADOW_SHAPES[ this.denominator - 1 ][ index ];
      this.shadowPath.translation = this.imageNode.translation.plusScalar( FractionsCommonConstants.INTRO_DROP_SHADOW_OFFSET );
      this.shadowPath.shape = cakeShadowShape;
    }
  }

  /**
   * Returns the start (smaller) angle for a given size/rotation of a cake piece.
   * @public
   *
   * @param {number} denominator
   * @param {number} index
   * @returns {number}
   */
  static getStartAngle( denominator, index ) {
    return 2 * Math.PI * index / denominator + ( denominator === 2 ? 0.5 * Math.PI : 0 );
  }

  /**
   * Returns the end (larger) angle for a given size/rotation of a cake piece.
   * @public
   *
   * @param {number} denominator
   * @param {number} index
   * @returns {number}
   */
  static getEndAngle( denominator, index ) {
    return 2 * Math.PI * ( index + 1 ) / denominator + ( denominator === 2 ? 0.5 * Math.PI : 0 );
  }

  /**
   * Returns the first intersection of an ellipse with a ray defined by the angle (modified by the aspect ratio
   * modifier).
   * @private
   *
   * @param {number} angle
   * @param {EllipticalArc} ellipse
   * @param {Vector2} offsetCenter
   * @param {number} aspect
   * @returns {RayIntersection}
   */
  static ellipseIntersect( angle, ellipse, offsetCenter, aspect ) {
    const direction = Vector2.createPolar( 1, angle ).componentTimes( new Vector2( 1, aspect ) ).normalized();
    const intersections = ellipse.intersection( new Ray2( offsetCenter, direction ) );
    return intersections[ 0 ];
  }

  /**
   * Returns the intersection information for the base ellipse (shooting a ray for the given cake angle from the
   * center).
   * @public
   *
   * @param {number} angle
   * @returns {number}
   */
  static getBaseIntersection( angle ) {
    return CakeNode.ellipseIntersect( angle, BASE_ELLIPSE, BASE_ELLIPSE_OFFSET_CENTER, BASE_ASPECT );
  }

  /**
   * Returns the intersection information for the mid ellipse (shooting a ray for the given cake angle from the
   * center).
   * @public
   *
   * @param {number} angle
   * @returns {number}
   */
  static getMidIntersection( angle ) {
    return CakeNode.ellipseIntersect( angle, MID_ELLIPSE, MID_ELLIPSE_OFFSET_CENTER, MID_ASPECT );
  }

  /**
   * Returns the intersection information for the top ellipse (shooting a ray for the given cake angle from the
   * center).
   * @public
   *
   * @param {number} angle
   * @returns {number}
   */
  static getTopIntersection( angle ) {
    return CakeNode.ellipseIntersect( angle, TOP_ELLIPSE, TOP_ELLIPSE_OFFSET_CENTER, TOP_ASPECT );
  }
}

fractionsCommon.register( 'CakeNode', CakeNode );

// @public {Dimension2}
CakeNode.CAKE_IMAGE_SIZE = CAKE_IMAGE_SIZE;
CakeNode.SCALED_CAKE_IMAGE_SIZE = SCALED_CAKE_IMAGE_SIZE;

// @public {number}
CakeNode.CAKE_DEFAULT_SCALE = CAKE_DEFAULT_SCALE;

// @public {Vector2}
CakeNode.CAKE_OFFSET = CAKE_OFFSET;

// @public {Bounds2}
CakeNode.CAKE_IMAGE_BOUNDS = CAKE_IMAGE_BOUNDS;

// @public {Shape}
CakeNode.BASE_ELLIPSE = BASE_ELLIPSE;
CakeNode.MID_ELLIPSE = MID_ELLIPSE;
CakeNode.TOP_ELLIPSE = TOP_ELLIPSE;

// @public {Vector2}
CakeNode.BASE_ELLIPSE_OFFSET_CENTER = BASE_ELLIPSE_OFFSET_CENTER;
CakeNode.MID_ELLIPSE_OFFSET_CENTER = MID_ELLIPSE_OFFSET_CENTER;
CakeNode.TOP_ELLIPSE_OFFSET_CENTER = TOP_ELLIPSE_OFFSET_CENTER;

// @public {Array.<Array.<Shape>>} - 2D areas that cover the bottom of the cake (so we can display shadows beneath
// pieces when they are dragged).
CakeNode.CAKE_SHADOW_SHAPES = [];

// @public {Array.<Array.<Shape>>} - 2D areas that cover the entire cake (for accurate touch/mouse areas)
// PERFORMANCE NOTE: These could be precomputed in the future, with
// copy( JSON.stringify( phet.fractionsCommon.CakeNode.CAKE_SHADOW_SHAPES.map( arr => arr.map( s => s.getSVGPath() ) ) , null, 2 ) );
// copy( JSON.stringify( phet.fractionsCommon.CakeNode.CAKE_SHAPES.map( arr => arr.map( s => s.getSVGPath() ) ) , null, 2 ) );
// And then data.map( arr => arr.map( svg => new Shape( svg ) ) ) them.
// It's simpler to leave as-is for now.
CakeNode.CAKE_SHAPES = _.range( 1, 9 ).map( denominator => {
  const shadowShapes = [];
  CakeNode.CAKE_SHADOW_SHAPES.push( shadowShapes );
  return _.range( 0, denominator ).map( index => {
    const shapes = []; // We'll union all of these shapes

    // We'll basically gather shapes that represent each face (surface area) of a cake slice, and then will union
    // those 2d shapes together to get the mouse/touch area for cake slices.

    // Compute the visual angles for the cake slice.
    const angleA = -CakeNode.getStartAngle( denominator, index );
    const angleB = -CakeNode.getEndAngle( denominator, index );

    // Adds a pie-shaped wedge (flat) to the list of shapes. We'll do this for all three vertical "layers"
    function getPieShape( ellipse, offsetCenter, aspect ) {
      const topSegments = [];
      if ( denominator === 1 ) {
        topSegments.push( ellipse );
      }
      else {
        const intersectionA = CakeNode.ellipseIntersect( angleA, ellipse, offsetCenter, aspect );
        const intersectionB = CakeNode.ellipseIntersect( angleB, ellipse, offsetCenter, aspect );

        if ( intersectionA.t > intersectionB.t ) {
          topSegments.push( ellipse.slice( intersectionB.t, intersectionA.t ) );
        }
        else {
          topSegments.push( ellipse.slice( intersectionB.t, 1 ) );
          topSegments.push( ellipse.slice( 0, intersectionA.t ) );
        }
        topSegments.push( new Line( intersectionA.point, offsetCenter ) );
        topSegments.push( new Line( offsetCenter, intersectionB.point ) );
      }
      return Shape.segments( topSegments, true ).makeImmutable();
    }

    shapes.push( getPieShape( TOP_ELLIPSE, TOP_ELLIPSE_OFFSET_CENTER, TOP_ASPECT ) );
    shapes.push( getPieShape( MID_ELLIPSE, MID_ELLIPSE_OFFSET_CENTER, MID_ASPECT ) );

    // Reuse the base for the shadow
    const pieBase = getPieShape( BASE_ELLIPSE, BASE_ELLIPSE_OFFSET_CENTER, BASE_ASPECT );
    shapes.push( pieBase );
    shadowShapes.push( pieBase );

    // Interior
    if ( denominator > 1 ) {
      [ angleA, angleB ].forEach( angle => {
        if ( Math.abs( angle ) !== Math.PI / 2 ) {
          shapes.push( Shape.polygon( [
            BASE_ELLIPSE_OFFSET_CENTER,
            TOP_ELLIPSE_OFFSET_CENTER,
            CakeNode.getTopIntersection( angle ).point,
            ...( Math.sin( angle ) > -0.2 ? [ CakeNode.getMidIntersection( angle ).point ] : [] ),
            CakeNode.getBaseIntersection( angle ).point
          ] ) );
        }
      } );
    }

    // If our slice includes the "far left" side, include a polygon that will give us the horizontal swept area.
    if ( angleA > -Math.PI && angleB < -Math.PI ) {
      shapes.push( Shape.polygon( [
        // 0.99 is a workaround for current Kite shape handling.
        BASE_ELLIPSE.positionAt( 0.5 ).timesScalar( 0.99 ),
        MID_ELLIPSE.positionAt( 0.5 ).timesScalar( 0.99 ),
        MID_ELLIPSE_OFFSET_CENTER,
        BASE_ELLIPSE_OFFSET_CENTER
      ] ) );
    }

    // If our slice includes the "far right" side, include a polygon that will give us the horizontal swept area.
    if ( denominator === 1 || ( denominator === 2 && index === 1 ) ) {
      shapes.push( Shape.polygon( [
        BASE_ELLIPSE_OFFSET_CENTER,
        MID_ELLIPSE.positionAt( 0 ).timesScalar( 0.99 ),
        BASE_ELLIPSE.positionAt( 0 ).timesScalar( 0.99 )
      ] ) );
    }

    return Shape.union( shapes ).makeImmutable();
  } );
} );

export default CakeNode;
