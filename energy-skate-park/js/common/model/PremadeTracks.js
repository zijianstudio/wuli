// Copyright 2018-2022, University of Colorado Boulder

/**
 * A collection of tracks used in the EnergySkateParkTrackSet models of energy-skate-park and energy-skate-park-basics.
 * Premade tracks are not draggable but they can sometimes be "configurable", meaning that control points can be moved.
 * For configurable premade tracks, the control points can only be dragged within a smaller set of bounds. These
 * bounds are specified for all premade tracks, but will only apply to the track if the model tracks are "configurable".
 *
 * Premade tracks are all isolated so they have no "parent" tracks, see Track.js for definition of parent.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import merge from '../../../../phet-core/js/merge.js';
import energySkatePark from '../../energySkatePark.js';
import Track from './Track.js';

// constants
const PARENT_TRACKS = [];

// limiting bounds for dragging control points
const END_BOUNDS_WIDTH = 2.5;
const END_BOUNDS_HEIGHT = 4;

// the supported premade tracks, used in EnegySkateParkTrackSetModels
const TrackType = EnumerationDeprecated.byKeys( [ 'PARABOLA', 'SLOPE', 'DOUBLE_WELL', 'LOOP' ] );

/**
 * Create a set of limiting drag bounds for a control point of a premade track. The control point is at the
 * CENTER of the limiting bounds.
 *
 * @param  {Vector2} point - position of control point, CENTER of the bounds
 * @param  {number} width
 * @param  {number} height
 * @returns {Bounds2}
 */
const createCenteredLimitBounds = ( point, width, height ) => {
  return new Bounds2( point.x - width / 2, point.y - height / 2, point.x + width / 2, point.y + height / 2 );
};

/**
 * Create a set of limiting drag bounds for a control point of a premade track. The control point is at the BOTTOM
 * CENTER of the limiting bounds.
 *
 * @param  {Vector2} point - position of control point, BOTTOM CENTER of the bounds
 * @param  {number} width
 * @param  {number} height
 * @returns {Bounds2}
 */
const createBottomLimitBounds = ( point, width, height ) => {
  return new Bounds2( point.x - width / 2, point.y, point.x + width / 2, point.y + height );
};

/**
 * Create a set of limiting drag bounds for a control point. The spacing args are relative to provided point,
 * which is presumably the position of the control point.
 *
 * @param {Vector2} point - spacing in each direction relative to this point
 * @param {number} leftSpace - space to the left of point for bounds
 * @param {number} rightSpace - space to the right of point for bounds
 * @param {number} upSpace - space to the up of point for bounds
 * @param {number} downSpace - space to the down of point for bounds
 * @returns {Bounds2}
 */
const createRelativeSpaceBounds = ( point, leftSpace, rightSpace, upSpace, downSpace ) => {
  return new Bounds2( point.x - leftSpace, point.y - downSpace, point.x + rightSpace, point.y + upSpace );
};

const PremadeTracks = {

  /**
   * Create a set of control points that create a parabola shaped track.
   * @param {EnergySkateParkModel} model
   * @param {Object} [options]
   * @returns {ControlPoint[]}
   */
  createParabolaControlPoints: ( model, options ) => {
    options = merge( {
      trackHeight: 6, // largest height for the parabola
      trackWidth: 8, // width from the left most control point to the right most control point

      // {boolean} - individual points may or may not be visible
      p1Visible: true,
      p2Visible: true,
      p3Visible: true
    }, options );

    const p1 = new Vector2( -options.trackWidth / 2, options.trackHeight );
    const p2 = new Vector2( 0, 0 );
    const p3 = new Vector2( options.trackWidth / 2, options.trackHeight );

    const p1Bounds = createCenteredLimitBounds( p1, END_BOUNDS_WIDTH, END_BOUNDS_HEIGHT );
    const p2Bounds = createBottomLimitBounds( p2, 5, 3 );
    const p3Bounds = createCenteredLimitBounds( p3, END_BOUNDS_WIDTH, END_BOUNDS_HEIGHT );

    return [
      model.controlPointGroup.createNextElement( p1.x, p1.y, {
        visible: options.p1Visible,
        limitBounds: p1Bounds,
        phetioState: false
      } ),
      model.controlPointGroup.createNextElement( p2.x, p2.y, {
        visible: options.p2Visible,
        limitBounds: p2Bounds,
        phetioState: false
      } ),
      model.controlPointGroup.createNextElement( p3.x, p3.y, {
        visible: options.p3Visible,
        limitBounds: p3Bounds,
        phetioState: false
      } )
    ];
  },

  /**
   * Create a set of control points which create a slope shaped track, touching the ground on the right side.
   *
   * @param {EnergySkateParkModel} model
   * @param {Object} [options]
   * @returns {ControlPoint[]}
   */
  createSlopeControlPoints: ( model, options ) => {

    options = merge( {
      trackWidth: 6,
      trackHeight: 6
    }, options );

    const p1 = new Vector2( -4, options.trackHeight );
    const p2 = new Vector2( -2, 1.2 );
    const p3 = new Vector2( -4 + options.trackWidth, 0 );

    const p1Bounds = createCenteredLimitBounds( p1, END_BOUNDS_WIDTH, END_BOUNDS_HEIGHT );

    // custom relative bounds so that bounds fall along the meter
    const p2Bounds = createRelativeSpaceBounds( p2, 0.5, 2.5, 1.8, 0.2 );
    const p3Bounds = createRelativeSpaceBounds( p3, 0.5, 2.5, 3, 0 );

    return [
      model.controlPointGroup.createNextElement( p1.x, p1.y, {
        limitBounds: p1Bounds,
        phetioState: false
      } ),
      model.controlPointGroup.createNextElement( p2.x, p2.y, {
        limitBounds: p2Bounds,
        phetioState: false
      } ),
      model.controlPointGroup.createNextElement( p3.x, p3.y, {
        limitBounds: p3Bounds,
        phetioState: false
      } )
    ];
  },

  /**
   * Create a set of control points that will create a double well track. For the double well, move the left well up
   * a but since the interpolation moves it down by that much and we don't want the skater to go below ground
   * while on the track. Numbers determined by trial and error.
   *
   * @param {EnergySkateParkModel} model
   * @param {Object} [options]
   * @returns {ControlPoint[]}
   */
  createDoubleWellControlPoints: ( model, options ) => {
    options = merge( {
      trackHeight: 5, // largest height for the well
      trackWidth: 8, // width from the left most control point to the right most control point
      trackMidHeight: 2, // height of the mid control point that creates the double well

      // {boolean} - individual points may or may not be visible
      p1Visible: true,
      p2Visible: true,
      p3Visible: true,
      p4Visible: true,
      p5Visible: true,

      // spacing for drag bounds of the first (left) control point for createRelativeSpaceBounds
      p1UpSpacing: 3,
      p1DownSpacing: 1,

      // Spacing for drag bounds of the third (center) control point for createRelativeSpaceBounds
      p3UpSpacing: 4,
      p3DownSpacing: 2,

      // spacing for the drag bounds of the fifth (right) control point for createRelativeSpaceBounds
      p5UpSpacing: 3,
      p5DownSpacing: 1

    }, options );

    const p1 = new Vector2( -options.trackWidth / 2, options.trackHeight );
    const p2 = new Vector2( -2, 0.0166015 );
    const p3 = new Vector2( 0, options.trackMidHeight );
    const p4 = new Vector2( 2, 1 );
    const p5 = new Vector2( options.trackWidth / 2, options.trackHeight );

    const p1Bounds = createRelativeSpaceBounds( p1, 1.0, 1.5, options.p1UpSpacing, options.p1DownSpacing );
    const p2Bounds = createRelativeSpaceBounds( p2, 1.5, 0.5, 3, 0 );
    const p3Bounds = createRelativeSpaceBounds( p3, 1, 1, options.p3UpSpacing, options.p3DownSpacing );
    const p4Bounds = createRelativeSpaceBounds( p4, 0.5, 1.5, 2, 1 );
    const p5Bounds = createRelativeSpaceBounds( p5, 1.5, 1.0, options.p5UpSpacing, options.p5DownSpacing );

    return [
      model.controlPointGroup.createNextElement( p1.x, p1.y, {
        limitBounds: p1Bounds,
        visible: options.p1Visible,
        phetioState: false
      } ),
      model.controlPointGroup.createNextElement( p2.x, p2.y, {
        limitBounds: p2Bounds,
        visible: options.p2Visible,
        phetioState: false
      } ),
      model.controlPointGroup.createNextElement( p3.x, p3.y, {
        limitBounds: p3Bounds,
        visible: options.p3Visible,
        phetioState: false
      } ),
      model.controlPointGroup.createNextElement( p4.x, p4.y, {
        limitBounds: p4Bounds,
        visible: options.p4Visible,
        phetioState: false
      } ),
      model.controlPointGroup.createNextElement( p5.x, p5.y, {
        limitBounds: p5Bounds,
        visible: options.p5Visible,
        phetioState: false
      } )
    ];
  },

  /**
   * Create a set of control points that will form a track that takes the shape of a loop.
   *
   * @param {EnergySkateParkModel} model
   * @param {Object} [options]
   * @returns {Array.<ControlPoint>}
   */
  createLoopControlPoints: ( model, options ) => {
    options = merge( {
      trackWidth: 9,
      trackHeight: 6,
      innerLoopWidth: 3,
      innerLoopTop: 4
    }, options );

    // top of the left and right endpoints of the loop, higher than loopTop so that it is easy for the skater to go
    // all the way around the loop
    const trackTop = options.trackHeight;

    const trackBottom = 0.3; // bottom points, so that the skater doesn't go below y = 0
    const loopTop = options.innerLoopTop; // adjust to make the loop top point higher or lower
    const loopWidth = options.trackWidth; // adjust to make the loop more or less wide
    const innerLoopWidth = options.innerLoopWidth; // roughly adjusts the width of the innerloop
    const innerLoopHeight = 2; // roughly adjust inner loop height (for control points, actual loop will be higher)

    const p1 = new Vector2( -loopWidth / 2, trackTop );
    const p2 = new Vector2( -innerLoopWidth / 2, trackBottom );
    const p3 = new Vector2( innerLoopWidth / 2, innerLoopHeight );
    const p4 = new Vector2( 0, loopTop );
    const p5 = new Vector2( -innerLoopWidth / 2, innerLoopHeight );
    const p6 = new Vector2( innerLoopWidth / 2, trackBottom );
    const p7 = new Vector2( loopWidth / 2, trackTop );

    const p1Bounds = createRelativeSpaceBounds( p1, 0.5, 1.5, 2, 3 );
    const p2Bounds = createRelativeSpaceBounds( p2, 1, 1, 1 - trackBottom, trackBottom );
    const p3Bounds = createCenteredLimitBounds( p3, 2, 1 );
    const p4Bounds = createRelativeSpaceBounds( p4, 1.5, 1.5, 2, 1 );
    const p5Bounds = createCenteredLimitBounds( p5, 2, 1 );
    const p6Bounds = createRelativeSpaceBounds( p6, 1, 1, 1 - trackBottom, trackBottom );
    const p7Bounds = createRelativeSpaceBounds( p7, 1.5, 0.5, 2, 3 );

    return [
      model.controlPointGroup.createNextElement( p1.x, p1.y, {
        limitBounds: p1Bounds,
        phetioState: false
      } ),
      model.controlPointGroup.createNextElement( p2.x, p2.y, {
        limitBounds: p2Bounds,
        phetioState: false
      } ),
      model.controlPointGroup.createNextElement( p3.x, p3.y, {
        limitBounds: p3Bounds,
        phetioState: false
      } ),
      model.controlPointGroup.createNextElement( p4.x, p4.y, {
        limitBounds: p4Bounds,
        phetioState: false
      } ),
      model.controlPointGroup.createNextElement( p5.x, p5.y, {
        limitBounds: p5Bounds,
        phetioState: false
      } ),
      model.controlPointGroup.createNextElement( p6.x, p6.y, {
        limitBounds: p6Bounds,
        phetioState: false
      } ),
      model.controlPointGroup.createNextElement( p7.x, p7.y, {
        limitBounds: p7Bounds,
        phetioState: false
      } )
    ];
  },

  /**
   * Create a track from the provided control points.
   *
   * @param {EnergySkateParkModel} model
   * @param {Array.<ControlPoint>} controlPoints
   * @param {Object} [options]
   * @returns {Track}
   */
  createTrack( model, controlPoints, options ) {
    return new Track( model, controlPoints, PARENT_TRACKS, options );
  }
};

// @public @static
PremadeTracks.TrackType = TrackType;

energySkatePark.register( 'PremadeTracks', PremadeTracks );

export default PremadeTracks;