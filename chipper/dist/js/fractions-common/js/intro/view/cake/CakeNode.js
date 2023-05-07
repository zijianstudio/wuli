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
const cakeImageArray = [[cake_1_1_png], [cake_2_2_png, cake_2_1_png], [cake_3_1_png, cake_3_2_png, cake_3_3_png], [cake_4_1_png, cake_4_2_png, cake_4_3_png, cake_4_4_png], [cake_5_1_png, cake_5_2_png, cake_5_3_png, cake_5_4_png, cake_5_5_png], [cake_6_1_png, cake_6_2_png, cake_6_3_png, cake_6_4_png, cake_6_5_png, cake_6_6_png], [cake_7_1_png, cake_7_2_png, cake_7_3_png, cake_7_4_png, cake_7_5_png, cake_7_6_png, cake_7_7_png], [cake_8_1_png, cake_8_2_png, cake_8_3_png, cake_8_4_png, cake_8_5_png, cake_8_6_png, cake_8_7_png, cake_8_8_png]];

// We create a matching mathematical model of the cake's "positions", tuned by hand so that the shapes will match the
// given images.
const CAKE_IMAGE_SIZE = new Dimension2(219, 166);
const CAKE_IMAGE_BOUNDS = new Bounds2(25, 10, 194, 154);
const CAKE_DEFAULT_SCALE = 130 / CAKE_IMAGE_SIZE.height;
const SCALED_CAKE_IMAGE_SIZE = new Dimension2(CAKE_DEFAULT_SCALE * CAKE_IMAGE_SIZE.width, CAKE_DEFAULT_SCALE * CAKE_IMAGE_SIZE.height);
// The determined center of the cake images (determined empirically)
const CAKE_OFFSET = new Vector2(0.5 * SCALED_CAKE_IMAGE_SIZE.width, 0.55 * SCALED_CAKE_IMAGE_SIZE.height);

// The ellipse base (bottom face) of cake slices
const BASE_ELLIPSE_CENTER = new Vector2(CAKE_IMAGE_SIZE.width * 0.501, CAKE_IMAGE_SIZE.height * 0.641);
const BASE_ELLIPSE_RADII = new Vector2(CAKE_IMAGE_SIZE.width * 0.364, CAKE_IMAGE_SIZE.height * 0.276);
const BASE_ELLIPSE_OFFSET_CENTER = BASE_ELLIPSE_CENTER.plusXY(0, -0.07 * CAKE_IMAGE_SIZE.height);
const BASE_ASPECT = 0.565;

// An ellipse at the very top of the "side" of the cake (where the black line is)
const MID_ELLIPSE_CENTER = new Vector2(CAKE_IMAGE_SIZE.width * 0.501, CAKE_IMAGE_SIZE.height * 0.42);
const MID_ELLIPSE_RADII = new Vector2(CAKE_IMAGE_SIZE.width * 0.38, CAKE_IMAGE_SIZE.height * 0.25);
const MID_ELLIPSE_OFFSET_CENTER = MID_ELLIPSE_CENTER.plusXY(0, -0.06 * CAKE_IMAGE_SIZE.height);
const MID_ASPECT = 0.46;

// An ellipse at the outside of the "top" of the cake (where the green piping is)
const TOP_ELLIPSE_CENTER = new Vector2(CAKE_IMAGE_SIZE.width * 0.501, CAKE_IMAGE_SIZE.height * 0.365);
const TOP_ELLIPSE_RADII = new Vector2(CAKE_IMAGE_SIZE.width * 0.355, CAKE_IMAGE_SIZE.height * 0.215);
const TOP_ELLIPSE_OFFSET_CENTER = TOP_ELLIPSE_CENTER.plusXY(0, -0.04 * CAKE_IMAGE_SIZE.height);
const TOP_ASPECT = 0.42;
const BASE_ELLIPSE = new EllipticalArc(BASE_ELLIPSE_CENTER, BASE_ELLIPSE_RADII.x, BASE_ELLIPSE_RADII.y, 0, 0, 2 * Math.PI, false);
const MID_ELLIPSE = new EllipticalArc(MID_ELLIPSE_CENTER, MID_ELLIPSE_RADII.x, MID_ELLIPSE_RADII.y, 0, 0, 2 * Math.PI, false);
const TOP_ELLIPSE = new EllipticalArc(TOP_ELLIPSE_CENTER, TOP_ELLIPSE_RADII.x, TOP_ELLIPSE_RADII.y, 0, 0, 2 * Math.PI, false);
class CakeNode extends Node {
  /**
   * @param {number} denominator
   * @param {number} index
   * @param {Object} [options]
   */
  constructor(denominator, index, options) {
    assert && assert(index < denominator);
    options = merge({
      // {boolean} - If true, this node will have a permanent drop shadow added
      dropShadow: false
    }, options);
    assert && assert(typeof options.dropShadow === 'boolean');
    super();
    if (options.dropShadow) {
      // @private {Node}
      this.shadowPath = new Path(null, {
        fill: FractionsCommonColors.introShapeShadowProperty,
        scale: CAKE_DEFAULT_SCALE
      });
      this.addChild(this.shadowPath);
    }

    // @private {Image}
    this.imageNode = new Image(cakeImageArray[denominator - 1][index], {
      scale: CAKE_DEFAULT_SCALE,
      localBounds: CAKE_IMAGE_BOUNDS
    });
    this.addChild(this.imageNode);

    // @private {number}
    this.denominator = denominator;
    this.setCakeIndex(index);
    this.mutate(options);
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
    return this.imageNode.translation.negated().minus(CAKE_OFFSET);
  }

  /**
   * Sets the slice cake image based on the index.
   * @public
   *
   * @param {number} index
   */
  setCakeIndex(index) {
    this.imageNode.setImage(cakeImageArray[this.denominator - 1][index]);

    // Center of the cake plate, empirically determined
    const imageCenter = CAKE_OFFSET;
    if (this.denominator === 1) {
      this.imageNode.translation = imageCenter.negated();
    } else if (this.denominator === 2) {
      this.imageNode.translation = imageCenter.plus(Vector2.createPolar(this.height / 4, -2 * Math.PI * (1 - index) / this.denominator)).negated();
    } else {
      this.imageNode.translation = imageCenter.plus(Vector2.createPolar(this.height / 4, -2 * Math.PI * (index + 1 / 2) / this.denominator)).negated();
    }
    const cakeShape = CakeNode.CAKE_SHAPES[this.denominator - 1][index];
    this.imageNode.mouseArea = cakeShape;
    this.imageNode.touchArea = cakeShape;
    this.imageNode.localBounds = cakeShape.bounds;
    if (this.shadowPath) {
      const cakeShadowShape = CakeNode.CAKE_SHADOW_SHAPES[this.denominator - 1][index];
      this.shadowPath.translation = this.imageNode.translation.plusScalar(FractionsCommonConstants.INTRO_DROP_SHADOW_OFFSET);
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
  static getStartAngle(denominator, index) {
    return 2 * Math.PI * index / denominator + (denominator === 2 ? 0.5 * Math.PI : 0);
  }

  /**
   * Returns the end (larger) angle for a given size/rotation of a cake piece.
   * @public
   *
   * @param {number} denominator
   * @param {number} index
   * @returns {number}
   */
  static getEndAngle(denominator, index) {
    return 2 * Math.PI * (index + 1) / denominator + (denominator === 2 ? 0.5 * Math.PI : 0);
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
  static ellipseIntersect(angle, ellipse, offsetCenter, aspect) {
    const direction = Vector2.createPolar(1, angle).componentTimes(new Vector2(1, aspect)).normalized();
    const intersections = ellipse.intersection(new Ray2(offsetCenter, direction));
    return intersections[0];
  }

  /**
   * Returns the intersection information for the base ellipse (shooting a ray for the given cake angle from the
   * center).
   * @public
   *
   * @param {number} angle
   * @returns {number}
   */
  static getBaseIntersection(angle) {
    return CakeNode.ellipseIntersect(angle, BASE_ELLIPSE, BASE_ELLIPSE_OFFSET_CENTER, BASE_ASPECT);
  }

  /**
   * Returns the intersection information for the mid ellipse (shooting a ray for the given cake angle from the
   * center).
   * @public
   *
   * @param {number} angle
   * @returns {number}
   */
  static getMidIntersection(angle) {
    return CakeNode.ellipseIntersect(angle, MID_ELLIPSE, MID_ELLIPSE_OFFSET_CENTER, MID_ASPECT);
  }

  /**
   * Returns the intersection information for the top ellipse (shooting a ray for the given cake angle from the
   * center).
   * @public
   *
   * @param {number} angle
   * @returns {number}
   */
  static getTopIntersection(angle) {
    return CakeNode.ellipseIntersect(angle, TOP_ELLIPSE, TOP_ELLIPSE_OFFSET_CENTER, TOP_ASPECT);
  }
}
fractionsCommon.register('CakeNode', CakeNode);

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
CakeNode.CAKE_SHAPES = _.range(1, 9).map(denominator => {
  const shadowShapes = [];
  CakeNode.CAKE_SHADOW_SHAPES.push(shadowShapes);
  return _.range(0, denominator).map(index => {
    const shapes = []; // We'll union all of these shapes

    // We'll basically gather shapes that represent each face (surface area) of a cake slice, and then will union
    // those 2d shapes together to get the mouse/touch area for cake slices.

    // Compute the visual angles for the cake slice.
    const angleA = -CakeNode.getStartAngle(denominator, index);
    const angleB = -CakeNode.getEndAngle(denominator, index);

    // Adds a pie-shaped wedge (flat) to the list of shapes. We'll do this for all three vertical "layers"
    function getPieShape(ellipse, offsetCenter, aspect) {
      const topSegments = [];
      if (denominator === 1) {
        topSegments.push(ellipse);
      } else {
        const intersectionA = CakeNode.ellipseIntersect(angleA, ellipse, offsetCenter, aspect);
        const intersectionB = CakeNode.ellipseIntersect(angleB, ellipse, offsetCenter, aspect);
        if (intersectionA.t > intersectionB.t) {
          topSegments.push(ellipse.slice(intersectionB.t, intersectionA.t));
        } else {
          topSegments.push(ellipse.slice(intersectionB.t, 1));
          topSegments.push(ellipse.slice(0, intersectionA.t));
        }
        topSegments.push(new Line(intersectionA.point, offsetCenter));
        topSegments.push(new Line(offsetCenter, intersectionB.point));
      }
      return Shape.segments(topSegments, true).makeImmutable();
    }
    shapes.push(getPieShape(TOP_ELLIPSE, TOP_ELLIPSE_OFFSET_CENTER, TOP_ASPECT));
    shapes.push(getPieShape(MID_ELLIPSE, MID_ELLIPSE_OFFSET_CENTER, MID_ASPECT));

    // Reuse the base for the shadow
    const pieBase = getPieShape(BASE_ELLIPSE, BASE_ELLIPSE_OFFSET_CENTER, BASE_ASPECT);
    shapes.push(pieBase);
    shadowShapes.push(pieBase);

    // Interior
    if (denominator > 1) {
      [angleA, angleB].forEach(angle => {
        if (Math.abs(angle) !== Math.PI / 2) {
          shapes.push(Shape.polygon([BASE_ELLIPSE_OFFSET_CENTER, TOP_ELLIPSE_OFFSET_CENTER, CakeNode.getTopIntersection(angle).point, ...(Math.sin(angle) > -0.2 ? [CakeNode.getMidIntersection(angle).point] : []), CakeNode.getBaseIntersection(angle).point]));
        }
      });
    }

    // If our slice includes the "far left" side, include a polygon that will give us the horizontal swept area.
    if (angleA > -Math.PI && angleB < -Math.PI) {
      shapes.push(Shape.polygon([
      // 0.99 is a workaround for current Kite shape handling.
      BASE_ELLIPSE.positionAt(0.5).timesScalar(0.99), MID_ELLIPSE.positionAt(0.5).timesScalar(0.99), MID_ELLIPSE_OFFSET_CENTER, BASE_ELLIPSE_OFFSET_CENTER]));
    }

    // If our slice includes the "far right" side, include a polygon that will give us the horizontal swept area.
    if (denominator === 1 || denominator === 2 && index === 1) {
      shapes.push(Shape.polygon([BASE_ELLIPSE_OFFSET_CENTER, MID_ELLIPSE.positionAt(0).timesScalar(0.99), BASE_ELLIPSE.positionAt(0).timesScalar(0.99)]));
    }
    return Shape.union(shapes).makeImmutable();
  });
});
export default CakeNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiRGltZW5zaW9uMiIsIlJheTIiLCJWZWN0b3IyIiwiRWxsaXB0aWNhbEFyYyIsIkxpbmUiLCJTaGFwZSIsIm1lcmdlIiwiSW1hZ2UiLCJOb2RlIiwiUGF0aCIsImNha2VfMV8xX3BuZyIsImNha2VfMl8xX3BuZyIsImNha2VfMl8yX3BuZyIsImNha2VfM18xX3BuZyIsImNha2VfM18yX3BuZyIsImNha2VfM18zX3BuZyIsImNha2VfNF8xX3BuZyIsImNha2VfNF8yX3BuZyIsImNha2VfNF8zX3BuZyIsImNha2VfNF80X3BuZyIsImNha2VfNV8xX3BuZyIsImNha2VfNV8yX3BuZyIsImNha2VfNV8zX3BuZyIsImNha2VfNV80X3BuZyIsImNha2VfNV81X3BuZyIsImNha2VfNl8xX3BuZyIsImNha2VfNl8yX3BuZyIsImNha2VfNl8zX3BuZyIsImNha2VfNl80X3BuZyIsImNha2VfNl81X3BuZyIsImNha2VfNl82X3BuZyIsImNha2VfN18xX3BuZyIsImNha2VfN18yX3BuZyIsImNha2VfN18zX3BuZyIsImNha2VfN180X3BuZyIsImNha2VfN181X3BuZyIsImNha2VfN182X3BuZyIsImNha2VfN183X3BuZyIsImNha2VfOF8xX3BuZyIsImNha2VfOF8yX3BuZyIsImNha2VfOF8zX3BuZyIsImNha2VfOF80X3BuZyIsImNha2VfOF81X3BuZyIsImNha2VfOF82X3BuZyIsImNha2VfOF83X3BuZyIsImNha2VfOF84X3BuZyIsIkZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cyIsIkZyYWN0aW9uc0NvbW1vbkNvbG9ycyIsImZyYWN0aW9uc0NvbW1vbiIsImNha2VJbWFnZUFycmF5IiwiQ0FLRV9JTUFHRV9TSVpFIiwiQ0FLRV9JTUFHRV9CT1VORFMiLCJDQUtFX0RFRkFVTFRfU0NBTEUiLCJoZWlnaHQiLCJTQ0FMRURfQ0FLRV9JTUFHRV9TSVpFIiwid2lkdGgiLCJDQUtFX09GRlNFVCIsIkJBU0VfRUxMSVBTRV9DRU5URVIiLCJCQVNFX0VMTElQU0VfUkFESUkiLCJCQVNFX0VMTElQU0VfT0ZGU0VUX0NFTlRFUiIsInBsdXNYWSIsIkJBU0VfQVNQRUNUIiwiTUlEX0VMTElQU0VfQ0VOVEVSIiwiTUlEX0VMTElQU0VfUkFESUkiLCJNSURfRUxMSVBTRV9PRkZTRVRfQ0VOVEVSIiwiTUlEX0FTUEVDVCIsIlRPUF9FTExJUFNFX0NFTlRFUiIsIlRPUF9FTExJUFNFX1JBRElJIiwiVE9QX0VMTElQU0VfT0ZGU0VUX0NFTlRFUiIsIlRPUF9BU1BFQ1QiLCJCQVNFX0VMTElQU0UiLCJ4IiwieSIsIk1hdGgiLCJQSSIsIk1JRF9FTExJUFNFIiwiVE9QX0VMTElQU0UiLCJDYWtlTm9kZSIsImNvbnN0cnVjdG9yIiwiZGVub21pbmF0b3IiLCJpbmRleCIsIm9wdGlvbnMiLCJhc3NlcnQiLCJkcm9wU2hhZG93Iiwic2hhZG93UGF0aCIsImZpbGwiLCJpbnRyb1NoYXBlU2hhZG93UHJvcGVydHkiLCJzY2FsZSIsImFkZENoaWxkIiwiaW1hZ2VOb2RlIiwibG9jYWxCb3VuZHMiLCJzZXRDYWtlSW5kZXgiLCJtdXRhdGUiLCJnZXRPZmZzZXQiLCJ0cmFuc2xhdGlvbiIsIm5lZ2F0ZWQiLCJtaW51cyIsInNldEltYWdlIiwiaW1hZ2VDZW50ZXIiLCJwbHVzIiwiY3JlYXRlUG9sYXIiLCJjYWtlU2hhcGUiLCJDQUtFX1NIQVBFUyIsIm1vdXNlQXJlYSIsInRvdWNoQXJlYSIsImJvdW5kcyIsImNha2VTaGFkb3dTaGFwZSIsIkNBS0VfU0hBRE9XX1NIQVBFUyIsInBsdXNTY2FsYXIiLCJJTlRST19EUk9QX1NIQURPV19PRkZTRVQiLCJzaGFwZSIsImdldFN0YXJ0QW5nbGUiLCJnZXRFbmRBbmdsZSIsImVsbGlwc2VJbnRlcnNlY3QiLCJhbmdsZSIsImVsbGlwc2UiLCJvZmZzZXRDZW50ZXIiLCJhc3BlY3QiLCJkaXJlY3Rpb24iLCJjb21wb25lbnRUaW1lcyIsIm5vcm1hbGl6ZWQiLCJpbnRlcnNlY3Rpb25zIiwiaW50ZXJzZWN0aW9uIiwiZ2V0QmFzZUludGVyc2VjdGlvbiIsImdldE1pZEludGVyc2VjdGlvbiIsImdldFRvcEludGVyc2VjdGlvbiIsInJlZ2lzdGVyIiwiXyIsInJhbmdlIiwibWFwIiwic2hhZG93U2hhcGVzIiwicHVzaCIsInNoYXBlcyIsImFuZ2xlQSIsImFuZ2xlQiIsImdldFBpZVNoYXBlIiwidG9wU2VnbWVudHMiLCJpbnRlcnNlY3Rpb25BIiwiaW50ZXJzZWN0aW9uQiIsInQiLCJzbGljZSIsInBvaW50Iiwic2VnbWVudHMiLCJtYWtlSW1tdXRhYmxlIiwicGllQmFzZSIsImZvckVhY2giLCJhYnMiLCJwb2x5Z29uIiwic2luIiwicG9zaXRpb25BdCIsInRpbWVzU2NhbGFyIiwidW5pb24iXSwic291cmNlcyI6WyJDYWtlTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEaXNwbGF5cyBhIHNsaWNlIG9mIGNha2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFydGluIFZlaWxsZXR0ZSAoQmVyZWEgQ29sbGVnZSlcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgUmF5MiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvUmF5Mi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgRWxsaXB0aWNhbEFyYywgTGluZSwgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UsIE5vZGUsIFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY2FrZV8xXzFfcG5nIGZyb20gJy4uLy4uLy4uLy4uL21pcG1hcHMvY2FrZV8xXzFfcG5nLmpzJztcclxuaW1wb3J0IGNha2VfMl8xX3BuZyBmcm9tICcuLi8uLi8uLi8uLi9taXBtYXBzL2Nha2VfMl8xX3BuZy5qcyc7XHJcbmltcG9ydCBjYWtlXzJfMl9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vbWlwbWFwcy9jYWtlXzJfMl9wbmcuanMnO1xyXG5pbXBvcnQgY2FrZV8zXzFfcG5nIGZyb20gJy4uLy4uLy4uLy4uL21pcG1hcHMvY2FrZV8zXzFfcG5nLmpzJztcclxuaW1wb3J0IGNha2VfM18yX3BuZyBmcm9tICcuLi8uLi8uLi8uLi9taXBtYXBzL2Nha2VfM18yX3BuZy5qcyc7XHJcbmltcG9ydCBjYWtlXzNfM19wbmcgZnJvbSAnLi4vLi4vLi4vLi4vbWlwbWFwcy9jYWtlXzNfM19wbmcuanMnO1xyXG5pbXBvcnQgY2FrZV80XzFfcG5nIGZyb20gJy4uLy4uLy4uLy4uL21pcG1hcHMvY2FrZV80XzFfcG5nLmpzJztcclxuaW1wb3J0IGNha2VfNF8yX3BuZyBmcm9tICcuLi8uLi8uLi8uLi9taXBtYXBzL2Nha2VfNF8yX3BuZy5qcyc7XHJcbmltcG9ydCBjYWtlXzRfM19wbmcgZnJvbSAnLi4vLi4vLi4vLi4vbWlwbWFwcy9jYWtlXzRfM19wbmcuanMnO1xyXG5pbXBvcnQgY2FrZV80XzRfcG5nIGZyb20gJy4uLy4uLy4uLy4uL21pcG1hcHMvY2FrZV80XzRfcG5nLmpzJztcclxuaW1wb3J0IGNha2VfNV8xX3BuZyBmcm9tICcuLi8uLi8uLi8uLi9taXBtYXBzL2Nha2VfNV8xX3BuZy5qcyc7XHJcbmltcG9ydCBjYWtlXzVfMl9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vbWlwbWFwcy9jYWtlXzVfMl9wbmcuanMnO1xyXG5pbXBvcnQgY2FrZV81XzNfcG5nIGZyb20gJy4uLy4uLy4uLy4uL21pcG1hcHMvY2FrZV81XzNfcG5nLmpzJztcclxuaW1wb3J0IGNha2VfNV80X3BuZyBmcm9tICcuLi8uLi8uLi8uLi9taXBtYXBzL2Nha2VfNV80X3BuZy5qcyc7XHJcbmltcG9ydCBjYWtlXzVfNV9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vbWlwbWFwcy9jYWtlXzVfNV9wbmcuanMnO1xyXG5pbXBvcnQgY2FrZV82XzFfcG5nIGZyb20gJy4uLy4uLy4uLy4uL21pcG1hcHMvY2FrZV82XzFfcG5nLmpzJztcclxuaW1wb3J0IGNha2VfNl8yX3BuZyBmcm9tICcuLi8uLi8uLi8uLi9taXBtYXBzL2Nha2VfNl8yX3BuZy5qcyc7XHJcbmltcG9ydCBjYWtlXzZfM19wbmcgZnJvbSAnLi4vLi4vLi4vLi4vbWlwbWFwcy9jYWtlXzZfM19wbmcuanMnO1xyXG5pbXBvcnQgY2FrZV82XzRfcG5nIGZyb20gJy4uLy4uLy4uLy4uL21pcG1hcHMvY2FrZV82XzRfcG5nLmpzJztcclxuaW1wb3J0IGNha2VfNl81X3BuZyBmcm9tICcuLi8uLi8uLi8uLi9taXBtYXBzL2Nha2VfNl81X3BuZy5qcyc7XHJcbmltcG9ydCBjYWtlXzZfNl9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vbWlwbWFwcy9jYWtlXzZfNl9wbmcuanMnO1xyXG5pbXBvcnQgY2FrZV83XzFfcG5nIGZyb20gJy4uLy4uLy4uLy4uL21pcG1hcHMvY2FrZV83XzFfcG5nLmpzJztcclxuaW1wb3J0IGNha2VfN18yX3BuZyBmcm9tICcuLi8uLi8uLi8uLi9taXBtYXBzL2Nha2VfN18yX3BuZy5qcyc7XHJcbmltcG9ydCBjYWtlXzdfM19wbmcgZnJvbSAnLi4vLi4vLi4vLi4vbWlwbWFwcy9jYWtlXzdfM19wbmcuanMnO1xyXG5pbXBvcnQgY2FrZV83XzRfcG5nIGZyb20gJy4uLy4uLy4uLy4uL21pcG1hcHMvY2FrZV83XzRfcG5nLmpzJztcclxuaW1wb3J0IGNha2VfN181X3BuZyBmcm9tICcuLi8uLi8uLi8uLi9taXBtYXBzL2Nha2VfN181X3BuZy5qcyc7XHJcbmltcG9ydCBjYWtlXzdfNl9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vbWlwbWFwcy9jYWtlXzdfNl9wbmcuanMnO1xyXG5pbXBvcnQgY2FrZV83XzdfcG5nIGZyb20gJy4uLy4uLy4uLy4uL21pcG1hcHMvY2FrZV83XzdfcG5nLmpzJztcclxuaW1wb3J0IGNha2VfOF8xX3BuZyBmcm9tICcuLi8uLi8uLi8uLi9taXBtYXBzL2Nha2VfOF8xX3BuZy5qcyc7XHJcbmltcG9ydCBjYWtlXzhfMl9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vbWlwbWFwcy9jYWtlXzhfMl9wbmcuanMnO1xyXG5pbXBvcnQgY2FrZV84XzNfcG5nIGZyb20gJy4uLy4uLy4uLy4uL21pcG1hcHMvY2FrZV84XzNfcG5nLmpzJztcclxuaW1wb3J0IGNha2VfOF80X3BuZyBmcm9tICcuLi8uLi8uLi8uLi9taXBtYXBzL2Nha2VfOF80X3BuZy5qcyc7XHJcbmltcG9ydCBjYWtlXzhfNV9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vbWlwbWFwcy9jYWtlXzhfNV9wbmcuanMnO1xyXG5pbXBvcnQgY2FrZV84XzZfcG5nIGZyb20gJy4uLy4uLy4uLy4uL21pcG1hcHMvY2FrZV84XzZfcG5nLmpzJztcclxuaW1wb3J0IGNha2VfOF83X3BuZyBmcm9tICcuLi8uLi8uLi8uLi9taXBtYXBzL2Nha2VfOF83X3BuZy5qcyc7XHJcbmltcG9ydCBjYWtlXzhfOF9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vbWlwbWFwcy9jYWtlXzhfOF9wbmcuanMnO1xyXG5pbXBvcnQgRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uL2NvbW1vbi9GcmFjdGlvbnNDb21tb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgRnJhY3Rpb25zQ29tbW9uQ29sb3JzIGZyb20gJy4uLy4uLy4uL2NvbW1vbi92aWV3L0ZyYWN0aW9uc0NvbW1vbkNvbG9ycy5qcyc7XHJcbmltcG9ydCBmcmFjdGlvbnNDb21tb24gZnJvbSAnLi4vLi4vLi4vZnJhY3Rpb25zQ29tbW9uLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5cclxuLy8ge0FycmF5LjxBcnJheS48QXJyYXkuPCo+Pj59IC0gY2FrZUltYWdlQXJyYXlbIGRlbm9taW5hdG9yICsgMSBdWyByb3RhdGlvbmFsSW5kZXggXSB3aWxsIGJlIHNvbWV0aGluZyB0aGF0IGNhbiBiZVxyXG4vLyBwYXNzZWQgdG8gc2NlbmVyeSBJbWFnZXMuXHJcbmNvbnN0IGNha2VJbWFnZUFycmF5ID0gW1xyXG4gIFsgY2FrZV8xXzFfcG5nIF0sXHJcbiAgWyBjYWtlXzJfMl9wbmcsIGNha2VfMl8xX3BuZyBdLFxyXG4gIFsgY2FrZV8zXzFfcG5nLCBjYWtlXzNfMl9wbmcsIGNha2VfM18zX3BuZyBdLFxyXG4gIFsgY2FrZV80XzFfcG5nLCBjYWtlXzRfMl9wbmcsIGNha2VfNF8zX3BuZywgY2FrZV80XzRfcG5nIF0sXHJcbiAgWyBjYWtlXzVfMV9wbmcsIGNha2VfNV8yX3BuZywgY2FrZV81XzNfcG5nLCBjYWtlXzVfNF9wbmcsIGNha2VfNV81X3BuZyBdLFxyXG4gIFsgY2FrZV82XzFfcG5nLCBjYWtlXzZfMl9wbmcsIGNha2VfNl8zX3BuZywgY2FrZV82XzRfcG5nLCBjYWtlXzZfNV9wbmcsIGNha2VfNl82X3BuZyBdLFxyXG4gIFsgY2FrZV83XzFfcG5nLCBjYWtlXzdfMl9wbmcsIGNha2VfN18zX3BuZywgY2FrZV83XzRfcG5nLCBjYWtlXzdfNV9wbmcsIGNha2VfN182X3BuZywgY2FrZV83XzdfcG5nIF0sXHJcbiAgWyBjYWtlXzhfMV9wbmcsIGNha2VfOF8yX3BuZywgY2FrZV84XzNfcG5nLCBjYWtlXzhfNF9wbmcsIGNha2VfOF81X3BuZywgY2FrZV84XzZfcG5nLCBjYWtlXzhfN19wbmcsIGNha2VfOF84X3BuZyBdXHJcbl07XHJcblxyXG4vLyBXZSBjcmVhdGUgYSBtYXRjaGluZyBtYXRoZW1hdGljYWwgbW9kZWwgb2YgdGhlIGNha2UncyBcInBvc2l0aW9uc1wiLCB0dW5lZCBieSBoYW5kIHNvIHRoYXQgdGhlIHNoYXBlcyB3aWxsIG1hdGNoIHRoZVxyXG4vLyBnaXZlbiBpbWFnZXMuXHJcbmNvbnN0IENBS0VfSU1BR0VfU0laRSA9IG5ldyBEaW1lbnNpb24yKCAyMTksIDE2NiApO1xyXG5jb25zdCBDQUtFX0lNQUdFX0JPVU5EUyA9IG5ldyBCb3VuZHMyKCAyNSwgMTAsIDE5NCwgMTU0ICk7XHJcbmNvbnN0IENBS0VfREVGQVVMVF9TQ0FMRSA9IDEzMCAvIENBS0VfSU1BR0VfU0laRS5oZWlnaHQ7XHJcbmNvbnN0IFNDQUxFRF9DQUtFX0lNQUdFX1NJWkUgPSBuZXcgRGltZW5zaW9uMihcclxuICBDQUtFX0RFRkFVTFRfU0NBTEUgKiBDQUtFX0lNQUdFX1NJWkUud2lkdGgsXHJcbiAgQ0FLRV9ERUZBVUxUX1NDQUxFICogQ0FLRV9JTUFHRV9TSVpFLmhlaWdodFxyXG4pO1xyXG4vLyBUaGUgZGV0ZXJtaW5lZCBjZW50ZXIgb2YgdGhlIGNha2UgaW1hZ2VzIChkZXRlcm1pbmVkIGVtcGlyaWNhbGx5KVxyXG5jb25zdCBDQUtFX09GRlNFVCA9IG5ldyBWZWN0b3IyKCAwLjUgKiBTQ0FMRURfQ0FLRV9JTUFHRV9TSVpFLndpZHRoLCAwLjU1ICogU0NBTEVEX0NBS0VfSU1BR0VfU0laRS5oZWlnaHQgKTtcclxuXHJcbi8vIFRoZSBlbGxpcHNlIGJhc2UgKGJvdHRvbSBmYWNlKSBvZiBjYWtlIHNsaWNlc1xyXG5jb25zdCBCQVNFX0VMTElQU0VfQ0VOVEVSID0gbmV3IFZlY3RvcjIoIENBS0VfSU1BR0VfU0laRS53aWR0aCAqIDAuNTAxLCBDQUtFX0lNQUdFX1NJWkUuaGVpZ2h0ICogMC42NDEgKTtcclxuY29uc3QgQkFTRV9FTExJUFNFX1JBRElJID0gbmV3IFZlY3RvcjIoIENBS0VfSU1BR0VfU0laRS53aWR0aCAqIDAuMzY0LCBDQUtFX0lNQUdFX1NJWkUuaGVpZ2h0ICogMC4yNzYgKTtcclxuY29uc3QgQkFTRV9FTExJUFNFX09GRlNFVF9DRU5URVIgPSBCQVNFX0VMTElQU0VfQ0VOVEVSLnBsdXNYWSggMCwgLTAuMDcgKiBDQUtFX0lNQUdFX1NJWkUuaGVpZ2h0ICk7XHJcbmNvbnN0IEJBU0VfQVNQRUNUID0gMC41NjU7XHJcblxyXG4vLyBBbiBlbGxpcHNlIGF0IHRoZSB2ZXJ5IHRvcCBvZiB0aGUgXCJzaWRlXCIgb2YgdGhlIGNha2UgKHdoZXJlIHRoZSBibGFjayBsaW5lIGlzKVxyXG5jb25zdCBNSURfRUxMSVBTRV9DRU5URVIgPSBuZXcgVmVjdG9yMiggQ0FLRV9JTUFHRV9TSVpFLndpZHRoICogMC41MDEsIENBS0VfSU1BR0VfU0laRS5oZWlnaHQgKiAwLjQyICk7XHJcbmNvbnN0IE1JRF9FTExJUFNFX1JBRElJID0gbmV3IFZlY3RvcjIoIENBS0VfSU1BR0VfU0laRS53aWR0aCAqIDAuMzgsIENBS0VfSU1BR0VfU0laRS5oZWlnaHQgKiAwLjI1ICk7XHJcbmNvbnN0IE1JRF9FTExJUFNFX09GRlNFVF9DRU5URVIgPSBNSURfRUxMSVBTRV9DRU5URVIucGx1c1hZKCAwLCAtMC4wNiAqIENBS0VfSU1BR0VfU0laRS5oZWlnaHQgKTtcclxuY29uc3QgTUlEX0FTUEVDVCA9IDAuNDY7XHJcblxyXG4vLyBBbiBlbGxpcHNlIGF0IHRoZSBvdXRzaWRlIG9mIHRoZSBcInRvcFwiIG9mIHRoZSBjYWtlICh3aGVyZSB0aGUgZ3JlZW4gcGlwaW5nIGlzKVxyXG5jb25zdCBUT1BfRUxMSVBTRV9DRU5URVIgPSBuZXcgVmVjdG9yMiggQ0FLRV9JTUFHRV9TSVpFLndpZHRoICogMC41MDEsIENBS0VfSU1BR0VfU0laRS5oZWlnaHQgKiAwLjM2NSApO1xyXG5jb25zdCBUT1BfRUxMSVBTRV9SQURJSSA9IG5ldyBWZWN0b3IyKCBDQUtFX0lNQUdFX1NJWkUud2lkdGggKiAwLjM1NSwgQ0FLRV9JTUFHRV9TSVpFLmhlaWdodCAqIDAuMjE1ICk7XHJcbmNvbnN0IFRPUF9FTExJUFNFX09GRlNFVF9DRU5URVIgPSBUT1BfRUxMSVBTRV9DRU5URVIucGx1c1hZKCAwLCAtMC4wNCAqIENBS0VfSU1BR0VfU0laRS5oZWlnaHQgKTtcclxuY29uc3QgVE9QX0FTUEVDVCA9IDAuNDI7XHJcblxyXG5jb25zdCBCQVNFX0VMTElQU0UgPSBuZXcgRWxsaXB0aWNhbEFyYyhcclxuICBCQVNFX0VMTElQU0VfQ0VOVEVSLFxyXG4gIEJBU0VfRUxMSVBTRV9SQURJSS54LFxyXG4gIEJBU0VfRUxMSVBTRV9SQURJSS55LFxyXG4gIDAsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSApO1xyXG5cclxuY29uc3QgTUlEX0VMTElQU0UgPSBuZXcgRWxsaXB0aWNhbEFyYyhcclxuICBNSURfRUxMSVBTRV9DRU5URVIsXHJcbiAgTUlEX0VMTElQU0VfUkFESUkueCxcclxuICBNSURfRUxMSVBTRV9SQURJSS55LFxyXG4gIDAsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSApO1xyXG5cclxuY29uc3QgVE9QX0VMTElQU0UgPSBuZXcgRWxsaXB0aWNhbEFyYyhcclxuICBUT1BfRUxMSVBTRV9DRU5URVIsXHJcbiAgVE9QX0VMTElQU0VfUkFESUkueCxcclxuICBUT1BfRUxMSVBTRV9SQURJSS55LFxyXG4gIDAsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSApO1xyXG5cclxuY2xhc3MgQ2FrZU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVub21pbmF0b3JcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGRlbm9taW5hdG9yLCBpbmRleCwgb3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4IDwgZGVub21pbmF0b3IgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgLy8ge2Jvb2xlYW59IC0gSWYgdHJ1ZSwgdGhpcyBub2RlIHdpbGwgaGF2ZSBhIHBlcm1hbmVudCBkcm9wIHNoYWRvdyBhZGRlZFxyXG4gICAgICBkcm9wU2hhZG93OiBmYWxzZVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBvcHRpb25zLmRyb3BTaGFkb3cgPT09ICdib29sZWFuJyApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLmRyb3BTaGFkb3cgKSB7XHJcbiAgICAgIC8vIEBwcml2YXRlIHtOb2RlfVxyXG4gICAgICB0aGlzLnNoYWRvd1BhdGggPSBuZXcgUGF0aCggbnVsbCwge1xyXG4gICAgICAgIGZpbGw6IEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5pbnRyb1NoYXBlU2hhZG93UHJvcGVydHksXHJcbiAgICAgICAgc2NhbGU6IENBS0VfREVGQVVMVF9TQ0FMRVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuc2hhZG93UGF0aCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwcml2YXRlIHtJbWFnZX1cclxuICAgIHRoaXMuaW1hZ2VOb2RlID0gbmV3IEltYWdlKCBjYWtlSW1hZ2VBcnJheVsgZGVub21pbmF0b3IgLSAxIF1bIGluZGV4IF0sIHtcclxuICAgICAgc2NhbGU6IENBS0VfREVGQVVMVF9TQ0FMRSxcclxuICAgICAgbG9jYWxCb3VuZHM6IENBS0VfSU1BR0VfQk9VTkRTXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmltYWdlTm9kZSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9XHJcbiAgICB0aGlzLmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XHJcblxyXG4gICAgdGhpcy5zZXRDYWtlSW5kZXgoIGluZGV4ICk7XHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgb2Zmc2V0IG9mIHRoZSBub2RlIGNvbWFyZWQgdG8gdGhlIG9yaWdpbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG1heSBiZSBzbGlnaHRseSB3cm9uZywgYnV0IEFQIHdhc24ndCBjb25jZXJuZWQgYWJvdXQgaXQgZW5vdWdoLiBUcnkgdGhlIGNha2UgYW5pbWF0aW9ucyB3aGVuXHJcbiAgICogeW91IGRyb3AgYSBwaWVjZSB3aXRoID9zcGVlZD0wLjEsIHRoZXJlIHdpbGwgYmUgYSBzbGlnaHQganVtcC5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIGdldE9mZnNldCgpIHtcclxuICAgIHJldHVybiB0aGlzLmltYWdlTm9kZS50cmFuc2xhdGlvbi5uZWdhdGVkKCkubWludXMoIENBS0VfT0ZGU0VUICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBzbGljZSBjYWtlIGltYWdlIGJhc2VkIG9uIHRoZSBpbmRleC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcclxuICAgKi9cclxuICBzZXRDYWtlSW5kZXgoIGluZGV4ICkge1xyXG4gICAgdGhpcy5pbWFnZU5vZGUuc2V0SW1hZ2UoIGNha2VJbWFnZUFycmF5WyB0aGlzLmRlbm9taW5hdG9yIC0gMSBdWyBpbmRleCBdICk7XHJcblxyXG4gICAgLy8gQ2VudGVyIG9mIHRoZSBjYWtlIHBsYXRlLCBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICBjb25zdCBpbWFnZUNlbnRlciA9IENBS0VfT0ZGU0VUO1xyXG5cclxuICAgIGlmICggdGhpcy5kZW5vbWluYXRvciA9PT0gMSApIHtcclxuICAgICAgdGhpcy5pbWFnZU5vZGUudHJhbnNsYXRpb24gPSBpbWFnZUNlbnRlci5uZWdhdGVkKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5kZW5vbWluYXRvciA9PT0gMiApIHtcclxuICAgICAgdGhpcy5pbWFnZU5vZGUudHJhbnNsYXRpb24gPSBpbWFnZUNlbnRlci5wbHVzKFxyXG4gICAgICAgIFZlY3RvcjIuY3JlYXRlUG9sYXIoIHRoaXMuaGVpZ2h0IC8gNCwgLTIgKiBNYXRoLlBJICogKCAxIC0gaW5kZXggKSAvIHRoaXMuZGVub21pbmF0b3IgKSApLm5lZ2F0ZWQoKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmltYWdlTm9kZS50cmFuc2xhdGlvbiA9IGltYWdlQ2VudGVyLnBsdXMoIFZlY3RvcjIuY3JlYXRlUG9sYXIoXHJcbiAgICAgICAgdGhpcy5oZWlnaHQgLyA0LFxyXG4gICAgICAgIC0yICogTWF0aC5QSSAqICggaW5kZXggKyAxIC8gMiApIC8gdGhpcy5kZW5vbWluYXRvclxyXG4gICAgICApICkubmVnYXRlZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNha2VTaGFwZSA9IENha2VOb2RlLkNBS0VfU0hBUEVTWyB0aGlzLmRlbm9taW5hdG9yIC0gMSBdWyBpbmRleCBdO1xyXG4gICAgdGhpcy5pbWFnZU5vZGUubW91c2VBcmVhID0gY2FrZVNoYXBlO1xyXG4gICAgdGhpcy5pbWFnZU5vZGUudG91Y2hBcmVhID0gY2FrZVNoYXBlO1xyXG4gICAgdGhpcy5pbWFnZU5vZGUubG9jYWxCb3VuZHMgPSBjYWtlU2hhcGUuYm91bmRzO1xyXG5cclxuICAgIGlmICggdGhpcy5zaGFkb3dQYXRoICkge1xyXG4gICAgICBjb25zdCBjYWtlU2hhZG93U2hhcGUgPSBDYWtlTm9kZS5DQUtFX1NIQURPV19TSEFQRVNbIHRoaXMuZGVub21pbmF0b3IgLSAxIF1bIGluZGV4IF07XHJcbiAgICAgIHRoaXMuc2hhZG93UGF0aC50cmFuc2xhdGlvbiA9IHRoaXMuaW1hZ2VOb2RlLnRyYW5zbGF0aW9uLnBsdXNTY2FsYXIoIEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5JTlRST19EUk9QX1NIQURPV19PRkZTRVQgKTtcclxuICAgICAgdGhpcy5zaGFkb3dQYXRoLnNoYXBlID0gY2FrZVNoYWRvd1NoYXBlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3RhcnQgKHNtYWxsZXIpIGFuZ2xlIGZvciBhIGdpdmVuIHNpemUvcm90YXRpb24gb2YgYSBjYWtlIHBpZWNlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkZW5vbWluYXRvclxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldFN0YXJ0QW5nbGUoIGRlbm9taW5hdG9yLCBpbmRleCApIHtcclxuICAgIHJldHVybiAyICogTWF0aC5QSSAqIGluZGV4IC8gZGVub21pbmF0b3IgKyAoIGRlbm9taW5hdG9yID09PSAyID8gMC41ICogTWF0aC5QSSA6IDAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGVuZCAobGFyZ2VyKSBhbmdsZSBmb3IgYSBnaXZlbiBzaXplL3JvdGF0aW9uIG9mIGEgY2FrZSBwaWVjZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVub21pbmF0b3JcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRFbmRBbmdsZSggZGVub21pbmF0b3IsIGluZGV4ICkge1xyXG4gICAgcmV0dXJuIDIgKiBNYXRoLlBJICogKCBpbmRleCArIDEgKSAvIGRlbm9taW5hdG9yICsgKCBkZW5vbWluYXRvciA9PT0gMiA/IDAuNSAqIE1hdGguUEkgOiAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBpbnRlcnNlY3Rpb24gb2YgYW4gZWxsaXBzZSB3aXRoIGEgcmF5IGRlZmluZWQgYnkgdGhlIGFuZ2xlIChtb2RpZmllZCBieSB0aGUgYXNwZWN0IHJhdGlvXHJcbiAgICogbW9kaWZpZXIpLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGVcclxuICAgKiBAcGFyYW0ge0VsbGlwdGljYWxBcmN9IGVsbGlwc2VcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IG9mZnNldENlbnRlclxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhc3BlY3RcclxuICAgKiBAcmV0dXJucyB7UmF5SW50ZXJzZWN0aW9ufVxyXG4gICAqL1xyXG4gIHN0YXRpYyBlbGxpcHNlSW50ZXJzZWN0KCBhbmdsZSwgZWxsaXBzZSwgb2Zmc2V0Q2VudGVyLCBhc3BlY3QgKSB7XHJcbiAgICBjb25zdCBkaXJlY3Rpb24gPSBWZWN0b3IyLmNyZWF0ZVBvbGFyKCAxLCBhbmdsZSApLmNvbXBvbmVudFRpbWVzKCBuZXcgVmVjdG9yMiggMSwgYXNwZWN0ICkgKS5ub3JtYWxpemVkKCk7XHJcbiAgICBjb25zdCBpbnRlcnNlY3Rpb25zID0gZWxsaXBzZS5pbnRlcnNlY3Rpb24oIG5ldyBSYXkyKCBvZmZzZXRDZW50ZXIsIGRpcmVjdGlvbiApICk7XHJcbiAgICByZXR1cm4gaW50ZXJzZWN0aW9uc1sgMCBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgaW50ZXJzZWN0aW9uIGluZm9ybWF0aW9uIGZvciB0aGUgYmFzZSBlbGxpcHNlIChzaG9vdGluZyBhIHJheSBmb3IgdGhlIGdpdmVuIGNha2UgYW5nbGUgZnJvbSB0aGVcclxuICAgKiBjZW50ZXIpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldEJhc2VJbnRlcnNlY3Rpb24oIGFuZ2xlICkge1xyXG4gICAgcmV0dXJuIENha2VOb2RlLmVsbGlwc2VJbnRlcnNlY3QoIGFuZ2xlLCBCQVNFX0VMTElQU0UsIEJBU0VfRUxMSVBTRV9PRkZTRVRfQ0VOVEVSLCBCQVNFX0FTUEVDVCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgaW50ZXJzZWN0aW9uIGluZm9ybWF0aW9uIGZvciB0aGUgbWlkIGVsbGlwc2UgKHNob290aW5nIGEgcmF5IGZvciB0aGUgZ2l2ZW4gY2FrZSBhbmdsZSBmcm9tIHRoZVxyXG4gICAqIGNlbnRlcikuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0TWlkSW50ZXJzZWN0aW9uKCBhbmdsZSApIHtcclxuICAgIHJldHVybiBDYWtlTm9kZS5lbGxpcHNlSW50ZXJzZWN0KCBhbmdsZSwgTUlEX0VMTElQU0UsIE1JRF9FTExJUFNFX09GRlNFVF9DRU5URVIsIE1JRF9BU1BFQ1QgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGludGVyc2VjdGlvbiBpbmZvcm1hdGlvbiBmb3IgdGhlIHRvcCBlbGxpcHNlIChzaG9vdGluZyBhIHJheSBmb3IgdGhlIGdpdmVuIGNha2UgYW5nbGUgZnJvbSB0aGVcclxuICAgKiBjZW50ZXIpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldFRvcEludGVyc2VjdGlvbiggYW5nbGUgKSB7XHJcbiAgICByZXR1cm4gQ2FrZU5vZGUuZWxsaXBzZUludGVyc2VjdCggYW5nbGUsIFRPUF9FTExJUFNFLCBUT1BfRUxMSVBTRV9PRkZTRVRfQ0VOVEVSLCBUT1BfQVNQRUNUICk7XHJcbiAgfVxyXG59XHJcblxyXG5mcmFjdGlvbnNDb21tb24ucmVnaXN0ZXIoICdDYWtlTm9kZScsIENha2VOb2RlICk7XHJcblxyXG4vLyBAcHVibGljIHtEaW1lbnNpb24yfVxyXG5DYWtlTm9kZS5DQUtFX0lNQUdFX1NJWkUgPSBDQUtFX0lNQUdFX1NJWkU7XHJcbkNha2VOb2RlLlNDQUxFRF9DQUtFX0lNQUdFX1NJWkUgPSBTQ0FMRURfQ0FLRV9JTUFHRV9TSVpFO1xyXG5cclxuLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG5DYWtlTm9kZS5DQUtFX0RFRkFVTFRfU0NBTEUgPSBDQUtFX0RFRkFVTFRfU0NBTEU7XHJcblxyXG4vLyBAcHVibGljIHtWZWN0b3IyfVxyXG5DYWtlTm9kZS5DQUtFX09GRlNFVCA9IENBS0VfT0ZGU0VUO1xyXG5cclxuLy8gQHB1YmxpYyB7Qm91bmRzMn1cclxuQ2FrZU5vZGUuQ0FLRV9JTUFHRV9CT1VORFMgPSBDQUtFX0lNQUdFX0JPVU5EUztcclxuXHJcbi8vIEBwdWJsaWMge1NoYXBlfVxyXG5DYWtlTm9kZS5CQVNFX0VMTElQU0UgPSBCQVNFX0VMTElQU0U7XHJcbkNha2VOb2RlLk1JRF9FTExJUFNFID0gTUlEX0VMTElQU0U7XHJcbkNha2VOb2RlLlRPUF9FTExJUFNFID0gVE9QX0VMTElQU0U7XHJcblxyXG4vLyBAcHVibGljIHtWZWN0b3IyfVxyXG5DYWtlTm9kZS5CQVNFX0VMTElQU0VfT0ZGU0VUX0NFTlRFUiA9IEJBU0VfRUxMSVBTRV9PRkZTRVRfQ0VOVEVSO1xyXG5DYWtlTm9kZS5NSURfRUxMSVBTRV9PRkZTRVRfQ0VOVEVSID0gTUlEX0VMTElQU0VfT0ZGU0VUX0NFTlRFUjtcclxuQ2FrZU5vZGUuVE9QX0VMTElQU0VfT0ZGU0VUX0NFTlRFUiA9IFRPUF9FTExJUFNFX09GRlNFVF9DRU5URVI7XHJcblxyXG4vLyBAcHVibGljIHtBcnJheS48QXJyYXkuPFNoYXBlPj59IC0gMkQgYXJlYXMgdGhhdCBjb3ZlciB0aGUgYm90dG9tIG9mIHRoZSBjYWtlIChzbyB3ZSBjYW4gZGlzcGxheSBzaGFkb3dzIGJlbmVhdGhcclxuLy8gcGllY2VzIHdoZW4gdGhleSBhcmUgZHJhZ2dlZCkuXHJcbkNha2VOb2RlLkNBS0VfU0hBRE9XX1NIQVBFUyA9IFtdO1xyXG5cclxuLy8gQHB1YmxpYyB7QXJyYXkuPEFycmF5LjxTaGFwZT4+fSAtIDJEIGFyZWFzIHRoYXQgY292ZXIgdGhlIGVudGlyZSBjYWtlIChmb3IgYWNjdXJhdGUgdG91Y2gvbW91c2UgYXJlYXMpXHJcbi8vIFBFUkZPUk1BTkNFIE5PVEU6IFRoZXNlIGNvdWxkIGJlIHByZWNvbXB1dGVkIGluIHRoZSBmdXR1cmUsIHdpdGhcclxuLy8gY29weSggSlNPTi5zdHJpbmdpZnkoIHBoZXQuZnJhY3Rpb25zQ29tbW9uLkNha2VOb2RlLkNBS0VfU0hBRE9XX1NIQVBFUy5tYXAoIGFyciA9PiBhcnIubWFwKCBzID0+IHMuZ2V0U1ZHUGF0aCgpICkgKSAsIG51bGwsIDIgKSApO1xyXG4vLyBjb3B5KCBKU09OLnN0cmluZ2lmeSggcGhldC5mcmFjdGlvbnNDb21tb24uQ2FrZU5vZGUuQ0FLRV9TSEFQRVMubWFwKCBhcnIgPT4gYXJyLm1hcCggcyA9PiBzLmdldFNWR1BhdGgoKSApICkgLCBudWxsLCAyICkgKTtcclxuLy8gQW5kIHRoZW4gZGF0YS5tYXAoIGFyciA9PiBhcnIubWFwKCBzdmcgPT4gbmV3IFNoYXBlKCBzdmcgKSApICkgdGhlbS5cclxuLy8gSXQncyBzaW1wbGVyIHRvIGxlYXZlIGFzLWlzIGZvciBub3cuXHJcbkNha2VOb2RlLkNBS0VfU0hBUEVTID0gXy5yYW5nZSggMSwgOSApLm1hcCggZGVub21pbmF0b3IgPT4ge1xyXG4gIGNvbnN0IHNoYWRvd1NoYXBlcyA9IFtdO1xyXG4gIENha2VOb2RlLkNBS0VfU0hBRE9XX1NIQVBFUy5wdXNoKCBzaGFkb3dTaGFwZXMgKTtcclxuICByZXR1cm4gXy5yYW5nZSggMCwgZGVub21pbmF0b3IgKS5tYXAoIGluZGV4ID0+IHtcclxuICAgIGNvbnN0IHNoYXBlcyA9IFtdOyAvLyBXZSdsbCB1bmlvbiBhbGwgb2YgdGhlc2Ugc2hhcGVzXHJcblxyXG4gICAgLy8gV2UnbGwgYmFzaWNhbGx5IGdhdGhlciBzaGFwZXMgdGhhdCByZXByZXNlbnQgZWFjaCBmYWNlIChzdXJmYWNlIGFyZWEpIG9mIGEgY2FrZSBzbGljZSwgYW5kIHRoZW4gd2lsbCB1bmlvblxyXG4gICAgLy8gdGhvc2UgMmQgc2hhcGVzIHRvZ2V0aGVyIHRvIGdldCB0aGUgbW91c2UvdG91Y2ggYXJlYSBmb3IgY2FrZSBzbGljZXMuXHJcblxyXG4gICAgLy8gQ29tcHV0ZSB0aGUgdmlzdWFsIGFuZ2xlcyBmb3IgdGhlIGNha2Ugc2xpY2UuXHJcbiAgICBjb25zdCBhbmdsZUEgPSAtQ2FrZU5vZGUuZ2V0U3RhcnRBbmdsZSggZGVub21pbmF0b3IsIGluZGV4ICk7XHJcbiAgICBjb25zdCBhbmdsZUIgPSAtQ2FrZU5vZGUuZ2V0RW5kQW5nbGUoIGRlbm9taW5hdG9yLCBpbmRleCApO1xyXG5cclxuICAgIC8vIEFkZHMgYSBwaWUtc2hhcGVkIHdlZGdlIChmbGF0KSB0byB0aGUgbGlzdCBvZiBzaGFwZXMuIFdlJ2xsIGRvIHRoaXMgZm9yIGFsbCB0aHJlZSB2ZXJ0aWNhbCBcImxheWVyc1wiXHJcbiAgICBmdW5jdGlvbiBnZXRQaWVTaGFwZSggZWxsaXBzZSwgb2Zmc2V0Q2VudGVyLCBhc3BlY3QgKSB7XHJcbiAgICAgIGNvbnN0IHRvcFNlZ21lbnRzID0gW107XHJcbiAgICAgIGlmICggZGVub21pbmF0b3IgPT09IDEgKSB7XHJcbiAgICAgICAgdG9wU2VnbWVudHMucHVzaCggZWxsaXBzZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGludGVyc2VjdGlvbkEgPSBDYWtlTm9kZS5lbGxpcHNlSW50ZXJzZWN0KCBhbmdsZUEsIGVsbGlwc2UsIG9mZnNldENlbnRlciwgYXNwZWN0ICk7XHJcbiAgICAgICAgY29uc3QgaW50ZXJzZWN0aW9uQiA9IENha2VOb2RlLmVsbGlwc2VJbnRlcnNlY3QoIGFuZ2xlQiwgZWxsaXBzZSwgb2Zmc2V0Q2VudGVyLCBhc3BlY3QgKTtcclxuXHJcbiAgICAgICAgaWYgKCBpbnRlcnNlY3Rpb25BLnQgPiBpbnRlcnNlY3Rpb25CLnQgKSB7XHJcbiAgICAgICAgICB0b3BTZWdtZW50cy5wdXNoKCBlbGxpcHNlLnNsaWNlKCBpbnRlcnNlY3Rpb25CLnQsIGludGVyc2VjdGlvbkEudCApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdG9wU2VnbWVudHMucHVzaCggZWxsaXBzZS5zbGljZSggaW50ZXJzZWN0aW9uQi50LCAxICkgKTtcclxuICAgICAgICAgIHRvcFNlZ21lbnRzLnB1c2goIGVsbGlwc2Uuc2xpY2UoIDAsIGludGVyc2VjdGlvbkEudCApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRvcFNlZ21lbnRzLnB1c2goIG5ldyBMaW5lKCBpbnRlcnNlY3Rpb25BLnBvaW50LCBvZmZzZXRDZW50ZXIgKSApO1xyXG4gICAgICAgIHRvcFNlZ21lbnRzLnB1c2goIG5ldyBMaW5lKCBvZmZzZXRDZW50ZXIsIGludGVyc2VjdGlvbkIucG9pbnQgKSApO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBTaGFwZS5zZWdtZW50cyggdG9wU2VnbWVudHMsIHRydWUgKS5tYWtlSW1tdXRhYmxlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hhcGVzLnB1c2goIGdldFBpZVNoYXBlKCBUT1BfRUxMSVBTRSwgVE9QX0VMTElQU0VfT0ZGU0VUX0NFTlRFUiwgVE9QX0FTUEVDVCApICk7XHJcbiAgICBzaGFwZXMucHVzaCggZ2V0UGllU2hhcGUoIE1JRF9FTExJUFNFLCBNSURfRUxMSVBTRV9PRkZTRVRfQ0VOVEVSLCBNSURfQVNQRUNUICkgKTtcclxuXHJcbiAgICAvLyBSZXVzZSB0aGUgYmFzZSBmb3IgdGhlIHNoYWRvd1xyXG4gICAgY29uc3QgcGllQmFzZSA9IGdldFBpZVNoYXBlKCBCQVNFX0VMTElQU0UsIEJBU0VfRUxMSVBTRV9PRkZTRVRfQ0VOVEVSLCBCQVNFX0FTUEVDVCApO1xyXG4gICAgc2hhcGVzLnB1c2goIHBpZUJhc2UgKTtcclxuICAgIHNoYWRvd1NoYXBlcy5wdXNoKCBwaWVCYXNlICk7XHJcblxyXG4gICAgLy8gSW50ZXJpb3JcclxuICAgIGlmICggZGVub21pbmF0b3IgPiAxICkge1xyXG4gICAgICBbIGFuZ2xlQSwgYW5nbGVCIF0uZm9yRWFjaCggYW5nbGUgPT4ge1xyXG4gICAgICAgIGlmICggTWF0aC5hYnMoIGFuZ2xlICkgIT09IE1hdGguUEkgLyAyICkge1xyXG4gICAgICAgICAgc2hhcGVzLnB1c2goIFNoYXBlLnBvbHlnb24oIFtcclxuICAgICAgICAgICAgQkFTRV9FTExJUFNFX09GRlNFVF9DRU5URVIsXHJcbiAgICAgICAgICAgIFRPUF9FTExJUFNFX09GRlNFVF9DRU5URVIsXHJcbiAgICAgICAgICAgIENha2VOb2RlLmdldFRvcEludGVyc2VjdGlvbiggYW5nbGUgKS5wb2ludCxcclxuICAgICAgICAgICAgLi4uKCBNYXRoLnNpbiggYW5nbGUgKSA+IC0wLjIgPyBbIENha2VOb2RlLmdldE1pZEludGVyc2VjdGlvbiggYW5nbGUgKS5wb2ludCBdIDogW10gKSxcclxuICAgICAgICAgICAgQ2FrZU5vZGUuZ2V0QmFzZUludGVyc2VjdGlvbiggYW5nbGUgKS5wb2ludFxyXG4gICAgICAgICAgXSApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgb3VyIHNsaWNlIGluY2x1ZGVzIHRoZSBcImZhciBsZWZ0XCIgc2lkZSwgaW5jbHVkZSBhIHBvbHlnb24gdGhhdCB3aWxsIGdpdmUgdXMgdGhlIGhvcml6b250YWwgc3dlcHQgYXJlYS5cclxuICAgIGlmICggYW5nbGVBID4gLU1hdGguUEkgJiYgYW5nbGVCIDwgLU1hdGguUEkgKSB7XHJcbiAgICAgIHNoYXBlcy5wdXNoKCBTaGFwZS5wb2x5Z29uKCBbXHJcbiAgICAgICAgLy8gMC45OSBpcyBhIHdvcmthcm91bmQgZm9yIGN1cnJlbnQgS2l0ZSBzaGFwZSBoYW5kbGluZy5cclxuICAgICAgICBCQVNFX0VMTElQU0UucG9zaXRpb25BdCggMC41ICkudGltZXNTY2FsYXIoIDAuOTkgKSxcclxuICAgICAgICBNSURfRUxMSVBTRS5wb3NpdGlvbkF0KCAwLjUgKS50aW1lc1NjYWxhciggMC45OSApLFxyXG4gICAgICAgIE1JRF9FTExJUFNFX09GRlNFVF9DRU5URVIsXHJcbiAgICAgICAgQkFTRV9FTExJUFNFX09GRlNFVF9DRU5URVJcclxuICAgICAgXSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgb3VyIHNsaWNlIGluY2x1ZGVzIHRoZSBcImZhciByaWdodFwiIHNpZGUsIGluY2x1ZGUgYSBwb2x5Z29uIHRoYXQgd2lsbCBnaXZlIHVzIHRoZSBob3Jpem9udGFsIHN3ZXB0IGFyZWEuXHJcbiAgICBpZiAoIGRlbm9taW5hdG9yID09PSAxIHx8ICggZGVub21pbmF0b3IgPT09IDIgJiYgaW5kZXggPT09IDEgKSApIHtcclxuICAgICAgc2hhcGVzLnB1c2goIFNoYXBlLnBvbHlnb24oIFtcclxuICAgICAgICBCQVNFX0VMTElQU0VfT0ZGU0VUX0NFTlRFUixcclxuICAgICAgICBNSURfRUxMSVBTRS5wb3NpdGlvbkF0KCAwICkudGltZXNTY2FsYXIoIDAuOTkgKSxcclxuICAgICAgICBCQVNFX0VMTElQU0UucG9zaXRpb25BdCggMCApLnRpbWVzU2NhbGFyKCAwLjk5IClcclxuICAgICAgXSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFNoYXBlLnVuaW9uKCBzaGFwZXMgKS5tYWtlSW1tdXRhYmxlKCk7XHJcbiAgfSApO1xyXG59ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDYWtlTm9kZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLGtDQUFrQztBQUN0RCxPQUFPQyxVQUFVLE1BQU0scUNBQXFDO0FBQzVELE9BQU9DLElBQUksTUFBTSwrQkFBK0I7QUFDaEQsT0FBT0MsT0FBTyxNQUFNLGtDQUFrQztBQUN0RCxTQUFTQyxhQUFhLEVBQUVDLElBQUksRUFBRUMsS0FBSyxRQUFRLG1DQUFtQztBQUM5RSxPQUFPQyxLQUFLLE1BQU0sc0NBQXNDO0FBQ3hELFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsc0NBQXNDO0FBQ3hFLE9BQU9DLFlBQVksTUFBTSxxQ0FBcUM7QUFDOUQsT0FBT0MsWUFBWSxNQUFNLHFDQUFxQztBQUM5RCxPQUFPQyxZQUFZLE1BQU0scUNBQXFDO0FBQzlELE9BQU9DLFlBQVksTUFBTSxxQ0FBcUM7QUFDOUQsT0FBT0MsWUFBWSxNQUFNLHFDQUFxQztBQUM5RCxPQUFPQyxZQUFZLE1BQU0scUNBQXFDO0FBQzlELE9BQU9DLFlBQVksTUFBTSxxQ0FBcUM7QUFDOUQsT0FBT0MsWUFBWSxNQUFNLHFDQUFxQztBQUM5RCxPQUFPQyxZQUFZLE1BQU0scUNBQXFDO0FBQzlELE9BQU9DLFlBQVksTUFBTSxxQ0FBcUM7QUFDOUQsT0FBT0MsWUFBWSxNQUFNLHFDQUFxQztBQUM5RCxPQUFPQyxZQUFZLE1BQU0scUNBQXFDO0FBQzlELE9BQU9DLFlBQVksTUFBTSxxQ0FBcUM7QUFDOUQsT0FBT0MsWUFBWSxNQUFNLHFDQUFxQztBQUM5RCxPQUFPQyxZQUFZLE1BQU0scUNBQXFDO0FBQzlELE9BQU9DLFlBQVksTUFBTSxxQ0FBcUM7QUFDOUQsT0FBT0MsWUFBWSxNQUFNLHFDQUFxQztBQUM5RCxPQUFPQyxZQUFZLE1BQU0scUNBQXFDO0FBQzlELE9BQU9DLFlBQVksTUFBTSxxQ0FBcUM7QUFDOUQsT0FBT0MsWUFBWSxNQUFNLHFDQUFxQztBQUM5RCxPQUFPQyxZQUFZLE1BQU0scUNBQXFDO0FBQzlELE9BQU9DLFlBQVksTUFBTSxxQ0FBcUM7QUFDOUQsT0FBT0MsWUFBWSxNQUFNLHFDQUFxQztBQUM5RCxPQUFPQyxZQUFZLE1BQU0scUNBQXFDO0FBQzlELE9BQU9DLFlBQVksTUFBTSxxQ0FBcUM7QUFDOUQsT0FBT0MsWUFBWSxNQUFNLHFDQUFxQztBQUM5RCxPQUFPQyxZQUFZLE1BQU0scUNBQXFDO0FBQzlELE9BQU9DLFlBQVks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