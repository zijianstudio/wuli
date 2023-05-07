// Copyright 2019-2022, University of Colorado Boulder

/**
 * PlayArea is the model for the main container of colliding Balls in the 'collision lab' simulation. It is a
 * sub-model of the top-level model of each screen and has a ideal friction-less surface with rigid borders. The origin
 * is at the center, and its bounds never changes.
 *
 * PlayArea is mainly responsible for:
 *   - Handling the different Bounds of PlayAreas in each screen.
 *   - Handling and referencing the different dimension of each screen.
 *   - PlayArea-related Properties, such as Grid visibility and Reflecting Border.
 *   - Keeping track of the elasticity of collisions.
 *   - Convenience methods related to the PlayArea.
 *
 * PlayAreas are created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import merge from '../../../../phet-core/js/merge.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from './Ball.js';

// constants
const ELASTICITY_PERCENT_RANGE = CollisionLabConstants.ELASTICITY_PERCENT_RANGE;
const EPSILON = CollisionLabConstants.ZERO_THRESHOLD;
class PlayArea {
  /**
   * @param {PlayArea.Dimension} dimension - the dimensions of the PlayArea (1D vs 2D).
   * @param {Object} [options]
   */
  constructor(dimension, options) {
    assert && assert(PlayArea.Dimension.includes(dimension), `invalid dimension: ${dimension}`);
    options = merge({
      // {Bounds2} - the model bounds of the PlayArea, in meters.
      bounds: PlayArea.DEFAULT_BOUNDS,
      // {boolean} - indicates if the Grid is visible initially (and after resetting).
      isGridVisibleInitially: false,
      // {boolean} - indicates if the PlayArea's borders reflect initially (and after resetting).
      reflectingBorderInitially: true,
      // {number} - the initial elasticity of the PlayArea (and after resetting), as a percentage.
      initialElasticityPercent: ELASTICITY_PERCENT_RANGE.max
    }, options);

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Bounds2} - the bounds of the PlayArea, in meters.
    this.bounds = options.bounds;

    // @public (read-only) {PlayArea.Dimension} - the dimensions of the PlayArea (1D vs 2D).
    this.dimension = dimension;

    // @public {Property.<boolean>} - indicates if the Balls reflect at the Border of the PlayArea bounds. This Property
    //                             is manipulated in the view.
    this.reflectingBorderProperty = new BooleanProperty(options.reflectingBorderInitially);

    // @public {Property.<boolean>} - indicates if the grid of the PlayArea is visible. This is placed inside of the model
    //                             since the visibility of the grid affects the drag-snapping of Balls.
    this.gridVisibleProperty = new BooleanProperty(options.isGridVisibleInitially);

    // @public {Property.<number>} - Property of the elasticity of all collisions in the PlayArea, as a percentage. See
    //                            https://en.wikipedia.org/wiki/Coefficient_of_restitution for background.
    this.elasticityPercentProperty = new NumberProperty(options.initialElasticityPercent, {
      range: ELASTICITY_PERCENT_RANGE
    });
  }

  /**
   * Resets the PlayArea.
   * @public
   *
   * Called when the reset-all button is pressed.
   */
  reset() {
    this.reflectingBorderProperty.reset();
    this.gridVisibleProperty.reset();
    this.elasticityPercentProperty.reset();
  }

  //----------------------------------------------------------------------------------------

  /**
   * Convenience method to get the elasticity of all collisions, as a DECIMAL.
   * @public
   *
   * @returns {number}
   */
  getElasticity() {
    return this.elasticityPercentProperty.value / 100;
  }

  /**
   * Gets the width of the PlayArea, in meters.
   * @public
   *
   * @returns {number} - in meters.
   */
  get width() {
    return this.bounds.width;
  }

  /**
   * Gets the height of the PlayArea, in meters.
   * @public
   *
   * @returns {number} - in meters.
   */
  get height() {
    return this.bounds.height;
  }

  /**
   * ES5 Getters for the location of the edges of the PlayArea, in meters.
   * Bounds2 has similar getters, but uses a view coordinate frame, where 'top' is minY and 'bottom' is maxY.
   * Instead, this uses the traditional model coordinate frame.
   * @public
   *
   * @returns {number} - in meters.
   */
  get left() {
    return this.bounds.minX;
  }
  get right() {
    return this.bounds.maxX;
  }
  get bottom() {
    return this.bounds.minY;
  }
  get top() {
    return this.bounds.maxY;
  }

  //----------------------------------------------------------------------------------------

  /**
   * Determines whether the PlayArea FULLY contains all parts of a Ball within its Bounds.
   * @public
   *
   * @param {Ball} ball
   * @returns {boolean}
   */
  fullyContainsBall(ball) {
    assert && assert(ball instanceof Ball, `invalid ball: ${ball}`);
    return ball.left >= this.left && ball.right <= this.right && ball.bottom >= this.bottom && ball.top <= this.top;
  }

  /**
   * Determines whether the PlayArea contains ANY part of the Ball within its Bounds.
   * @public
   *
   * @param {Ball} ball
   * @returns {boolean}
   */
  containsAnyPartOfBall(ball) {
    assert && assert(ball instanceof Ball, `invalid ball: ${ball}`);
    return ball.right > this.left && ball.left < this.right && ball.top > this.bottom && ball.bottom < this.top;
  }

  /**
   * Determines whether a respective side of a Ball is tangentially touching the corresponding side of the PlayArea.
   * @public
   *
   * @param {Ball} ball
   * @returns {boolean}
   */
  isBallTouchingTop(ball) {
    return Utils.equalsEpsilon(ball.top, this.top, EPSILON);
  } // @public

  isBallTouchingLeft(ball) {
    return Utils.equalsEpsilon(ball.left, this.left, EPSILON);
  } // @public

  isBallTouchingRight(ball) {
    return Utils.equalsEpsilon(ball.right, this.right, EPSILON);
  } // @public

  isBallTouchingBottom(ball) {
    return Utils.equalsEpsilon(ball.bottom, this.bottom, EPSILON);
  } // @public

  /**
   * Determines whether any side of a Ball is tangentially touching any side of the PlayArea from the inside.
   * @public
   *
   * @param {Ball} ball
   * @returns {boolean}
   */
  isBallTouchingSide(ball) {
    return this.isBallTouchingTop(ball) || this.isBallTouchingBottom(ball) || this.isBallTouchingLeft(ball) || this.isBallTouchingRight(ball);
  }
}

// @public (read-only) {Bounds2} - the default bounds of the PlayArea.
PlayArea.DEFAULT_BOUNDS = new Bounds2(-2, -1, 2, 1);

// @public (read-only) {EnumerationDeprecated} - Enumeration of the possible 'dimension' of a PlayArea.
PlayArea.Dimension = EnumerationDeprecated.byKeys(['ONE', 'TWO']);
collisionLab.register('PlayArea', PlayArea);
export default PlayArea;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIkJvdW5kczIiLCJVdGlscyIsIkVudW1lcmF0aW9uRGVwcmVjYXRlZCIsIm1lcmdlIiwiY29sbGlzaW9uTGFiIiwiQ29sbGlzaW9uTGFiQ29uc3RhbnRzIiwiQmFsbCIsIkVMQVNUSUNJVFlfUEVSQ0VOVF9SQU5HRSIsIkVQU0lMT04iLCJaRVJPX1RIUkVTSE9MRCIsIlBsYXlBcmVhIiwiY29uc3RydWN0b3IiLCJkaW1lbnNpb24iLCJvcHRpb25zIiwiYXNzZXJ0IiwiRGltZW5zaW9uIiwiaW5jbHVkZXMiLCJib3VuZHMiLCJERUZBVUxUX0JPVU5EUyIsImlzR3JpZFZpc2libGVJbml0aWFsbHkiLCJyZWZsZWN0aW5nQm9yZGVySW5pdGlhbGx5IiwiaW5pdGlhbEVsYXN0aWNpdHlQZXJjZW50IiwibWF4IiwicmVmbGVjdGluZ0JvcmRlclByb3BlcnR5IiwiZ3JpZFZpc2libGVQcm9wZXJ0eSIsImVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHkiLCJyYW5nZSIsInJlc2V0IiwiZ2V0RWxhc3RpY2l0eSIsInZhbHVlIiwid2lkdGgiLCJoZWlnaHQiLCJsZWZ0IiwibWluWCIsInJpZ2h0IiwibWF4WCIsImJvdHRvbSIsIm1pblkiLCJ0b3AiLCJtYXhZIiwiZnVsbHlDb250YWluc0JhbGwiLCJiYWxsIiwiY29udGFpbnNBbnlQYXJ0T2ZCYWxsIiwiaXNCYWxsVG91Y2hpbmdUb3AiLCJlcXVhbHNFcHNpbG9uIiwiaXNCYWxsVG91Y2hpbmdMZWZ0IiwiaXNCYWxsVG91Y2hpbmdSaWdodCIsImlzQmFsbFRvdWNoaW5nQm90dG9tIiwiaXNCYWxsVG91Y2hpbmdTaWRlIiwiYnlLZXlzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQbGF5QXJlYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQbGF5QXJlYSBpcyB0aGUgbW9kZWwgZm9yIHRoZSBtYWluIGNvbnRhaW5lciBvZiBjb2xsaWRpbmcgQmFsbHMgaW4gdGhlICdjb2xsaXNpb24gbGFiJyBzaW11bGF0aW9uLiBJdCBpcyBhXHJcbiAqIHN1Yi1tb2RlbCBvZiB0aGUgdG9wLWxldmVsIG1vZGVsIG9mIGVhY2ggc2NyZWVuIGFuZCBoYXMgYSBpZGVhbCBmcmljdGlvbi1sZXNzIHN1cmZhY2Ugd2l0aCByaWdpZCBib3JkZXJzLiBUaGUgb3JpZ2luXHJcbiAqIGlzIGF0IHRoZSBjZW50ZXIsIGFuZCBpdHMgYm91bmRzIG5ldmVyIGNoYW5nZXMuXHJcbiAqXHJcbiAqIFBsYXlBcmVhIGlzIG1haW5seSByZXNwb25zaWJsZSBmb3I6XHJcbiAqICAgLSBIYW5kbGluZyB0aGUgZGlmZmVyZW50IEJvdW5kcyBvZiBQbGF5QXJlYXMgaW4gZWFjaCBzY3JlZW4uXHJcbiAqICAgLSBIYW5kbGluZyBhbmQgcmVmZXJlbmNpbmcgdGhlIGRpZmZlcmVudCBkaW1lbnNpb24gb2YgZWFjaCBzY3JlZW4uXHJcbiAqICAgLSBQbGF5QXJlYS1yZWxhdGVkIFByb3BlcnRpZXMsIHN1Y2ggYXMgR3JpZCB2aXNpYmlsaXR5IGFuZCBSZWZsZWN0aW5nIEJvcmRlci5cclxuICogICAtIEtlZXBpbmcgdHJhY2sgb2YgdGhlIGVsYXN0aWNpdHkgb2YgY29sbGlzaW9ucy5cclxuICogICAtIENvbnZlbmllbmNlIG1ldGhvZHMgcmVsYXRlZCB0byB0aGUgUGxheUFyZWEuXHJcbiAqXHJcbiAqIFBsYXlBcmVhcyBhcmUgY3JlYXRlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIHNpbSBhbmQgYXJlIG5ldmVyIGRpc3Bvc2VkLCBzbyBubyBkaXNwb3NlIG1ldGhvZCBpcyBuZWNlc3NhcnkuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZC5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgY29sbGlzaW9uTGFiIGZyb20gJy4uLy4uL2NvbGxpc2lvbkxhYi5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJDb25zdGFudHMgZnJvbSAnLi4vQ29sbGlzaW9uTGFiQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEJhbGwgZnJvbSAnLi9CYWxsLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBFTEFTVElDSVRZX1BFUkNFTlRfUkFOR0UgPSBDb2xsaXNpb25MYWJDb25zdGFudHMuRUxBU1RJQ0lUWV9QRVJDRU5UX1JBTkdFO1xyXG5jb25zdCBFUFNJTE9OID0gQ29sbGlzaW9uTGFiQ29uc3RhbnRzLlpFUk9fVEhSRVNIT0xEO1xyXG5cclxuY2xhc3MgUGxheUFyZWEge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1BsYXlBcmVhLkRpbWVuc2lvbn0gZGltZW5zaW9uIC0gdGhlIGRpbWVuc2lvbnMgb2YgdGhlIFBsYXlBcmVhICgxRCB2cyAyRCkuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBkaW1lbnNpb24sIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBQbGF5QXJlYS5EaW1lbnNpb24uaW5jbHVkZXMoIGRpbWVuc2lvbiApLCBgaW52YWxpZCBkaW1lbnNpb246ICR7ZGltZW5zaW9ufWAgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHtCb3VuZHMyfSAtIHRoZSBtb2RlbCBib3VuZHMgb2YgdGhlIFBsYXlBcmVhLCBpbiBtZXRlcnMuXHJcbiAgICAgIGJvdW5kczogUGxheUFyZWEuREVGQVVMVF9CT1VORFMsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBpbmRpY2F0ZXMgaWYgdGhlIEdyaWQgaXMgdmlzaWJsZSBpbml0aWFsbHkgKGFuZCBhZnRlciByZXNldHRpbmcpLlxyXG4gICAgICBpc0dyaWRWaXNpYmxlSW5pdGlhbGx5OiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIGluZGljYXRlcyBpZiB0aGUgUGxheUFyZWEncyBib3JkZXJzIHJlZmxlY3QgaW5pdGlhbGx5IChhbmQgYWZ0ZXIgcmVzZXR0aW5nKS5cclxuICAgICAgcmVmbGVjdGluZ0JvcmRlckluaXRpYWxseTogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gdGhlIGluaXRpYWwgZWxhc3RpY2l0eSBvZiB0aGUgUGxheUFyZWEgKGFuZCBhZnRlciByZXNldHRpbmcpLCBhcyBhIHBlcmNlbnRhZ2UuXHJcbiAgICAgIGluaXRpYWxFbGFzdGljaXR5UGVyY2VudDogRUxBU1RJQ0lUWV9QRVJDRU5UX1JBTkdFLm1heFxyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtCb3VuZHMyfSAtIHRoZSBib3VuZHMgb2YgdGhlIFBsYXlBcmVhLCBpbiBtZXRlcnMuXHJcbiAgICB0aGlzLmJvdW5kcyA9IG9wdGlvbnMuYm91bmRzO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1BsYXlBcmVhLkRpbWVuc2lvbn0gLSB0aGUgZGltZW5zaW9ucyBvZiB0aGUgUGxheUFyZWEgKDFEIHZzIDJEKS5cclxuICAgIHRoaXMuZGltZW5zaW9uID0gZGltZW5zaW9uO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gLSBpbmRpY2F0ZXMgaWYgdGhlIEJhbGxzIHJlZmxlY3QgYXQgdGhlIEJvcmRlciBvZiB0aGUgUGxheUFyZWEgYm91bmRzLiBUaGlzIFByb3BlcnR5XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXMgbWFuaXB1bGF0ZWQgaW4gdGhlIHZpZXcuXHJcbiAgICB0aGlzLnJlZmxlY3RpbmdCb3JkZXJQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIG9wdGlvbnMucmVmbGVjdGluZ0JvcmRlckluaXRpYWxseSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gLSBpbmRpY2F0ZXMgaWYgdGhlIGdyaWQgb2YgdGhlIFBsYXlBcmVhIGlzIHZpc2libGUuIFRoaXMgaXMgcGxhY2VkIGluc2lkZSBvZiB0aGUgbW9kZWxcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaW5jZSB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgZ3JpZCBhZmZlY3RzIHRoZSBkcmFnLXNuYXBwaW5nIG9mIEJhbGxzLlxyXG4gICAgdGhpcy5ncmlkVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggb3B0aW9ucy5pc0dyaWRWaXNpYmxlSW5pdGlhbGx5ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IC0gUHJvcGVydHkgb2YgdGhlIGVsYXN0aWNpdHkgb2YgYWxsIGNvbGxpc2lvbnMgaW4gdGhlIFBsYXlBcmVhLCBhcyBhIHBlcmNlbnRhZ2UuIFNlZVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ29lZmZpY2llbnRfb2ZfcmVzdGl0dXRpb24gZm9yIGJhY2tncm91bmQuXHJcbiAgICB0aGlzLmVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIG9wdGlvbnMuaW5pdGlhbEVsYXN0aWNpdHlQZXJjZW50LCB7XHJcbiAgICAgIHJhbmdlOiBFTEFTVElDSVRZX1BFUkNFTlRfUkFOR0VcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgUGxheUFyZWEuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHJlc2V0LWFsbCBidXR0b24gaXMgcHJlc3NlZC5cclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMucmVmbGVjdGluZ0JvcmRlclByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmdyaWRWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZWxhc3RpY2l0eVBlcmNlbnRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlbmllbmNlIG1ldGhvZCB0byBnZXQgdGhlIGVsYXN0aWNpdHkgb2YgYWxsIGNvbGxpc2lvbnMsIGFzIGEgREVDSU1BTC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldEVsYXN0aWNpdHkoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbGFzdGljaXR5UGVyY2VudFByb3BlcnR5LnZhbHVlIC8gMTAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgd2lkdGggb2YgdGhlIFBsYXlBcmVhLCBpbiBtZXRlcnMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn0gLSBpbiBtZXRlcnMuXHJcbiAgICovXHJcbiAgZ2V0IHdpZHRoKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLndpZHRoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgaGVpZ2h0IG9mIHRoZSBQbGF5QXJlYSwgaW4gbWV0ZXJzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gaW4gbWV0ZXJzLlxyXG4gICAqL1xyXG4gIGdldCBoZWlnaHQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ib3VuZHMuaGVpZ2h0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRVM1IEdldHRlcnMgZm9yIHRoZSBsb2NhdGlvbiBvZiB0aGUgZWRnZXMgb2YgdGhlIFBsYXlBcmVhLCBpbiBtZXRlcnMuXHJcbiAgICogQm91bmRzMiBoYXMgc2ltaWxhciBnZXR0ZXJzLCBidXQgdXNlcyBhIHZpZXcgY29vcmRpbmF0ZSBmcmFtZSwgd2hlcmUgJ3RvcCcgaXMgbWluWSBhbmQgJ2JvdHRvbScgaXMgbWF4WS5cclxuICAgKiBJbnN0ZWFkLCB0aGlzIHVzZXMgdGhlIHRyYWRpdGlvbmFsIG1vZGVsIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn0gLSBpbiBtZXRlcnMuXHJcbiAgICovXHJcbiAgZ2V0IGxlZnQoKSB7IHJldHVybiB0aGlzLmJvdW5kcy5taW5YOyB9XHJcblxyXG4gIGdldCByaWdodCgpIHsgcmV0dXJuIHRoaXMuYm91bmRzLm1heFg7IH1cclxuXHJcbiAgZ2V0IGJvdHRvbSgpIHsgcmV0dXJuIHRoaXMuYm91bmRzLm1pblk7IH1cclxuXHJcbiAgZ2V0IHRvcCgpIHsgcmV0dXJuIHRoaXMuYm91bmRzLm1heFk7IH1cclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciB0aGUgUGxheUFyZWEgRlVMTFkgY29udGFpbnMgYWxsIHBhcnRzIG9mIGEgQmFsbCB3aXRoaW4gaXRzIEJvdW5kcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JhbGx9IGJhbGxcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBmdWxseUNvbnRhaW5zQmFsbCggYmFsbCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJhbGwgaW5zdGFuY2VvZiBCYWxsLCBgaW52YWxpZCBiYWxsOiAke2JhbGx9YCApO1xyXG5cclxuICAgIHJldHVybiBiYWxsLmxlZnQgPj0gdGhpcy5sZWZ0ICYmXHJcbiAgICAgICAgICAgYmFsbC5yaWdodCA8PSB0aGlzLnJpZ2h0ICYmXHJcbiAgICAgICAgICAgYmFsbC5ib3R0b20gPj0gdGhpcy5ib3R0b20gJiZcclxuICAgICAgICAgICBiYWxsLnRvcCA8PSB0aGlzLnRvcDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciB0aGUgUGxheUFyZWEgY29udGFpbnMgQU5ZIHBhcnQgb2YgdGhlIEJhbGwgd2l0aGluIGl0cyBCb3VuZHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCYWxsfSBiYWxsXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgY29udGFpbnNBbnlQYXJ0T2ZCYWxsKCBiYWxsICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmFsbCBpbnN0YW5jZW9mIEJhbGwsIGBpbnZhbGlkIGJhbGw6ICR7YmFsbH1gICk7XHJcblxyXG4gICAgcmV0dXJuIGJhbGwucmlnaHQgPiB0aGlzLmxlZnQgJiZcclxuICAgICAgICAgICBiYWxsLmxlZnQgPCB0aGlzLnJpZ2h0ICYmXHJcbiAgICAgICAgICAgYmFsbC50b3AgPiB0aGlzLmJvdHRvbSAmJlxyXG4gICAgICAgICAgIGJhbGwuYm90dG9tIDwgdGhpcy50b3A7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSByZXNwZWN0aXZlIHNpZGUgb2YgYSBCYWxsIGlzIHRhbmdlbnRpYWxseSB0b3VjaGluZyB0aGUgY29ycmVzcG9uZGluZyBzaWRlIG9mIHRoZSBQbGF5QXJlYS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JhbGx9IGJhbGxcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc0JhbGxUb3VjaGluZ1RvcCggYmFsbCApIHsgcmV0dXJuIFV0aWxzLmVxdWFsc0Vwc2lsb24oIGJhbGwudG9wLCB0aGlzLnRvcCwgRVBTSUxPTiApOyB9IC8vIEBwdWJsaWNcclxuXHJcbiAgaXNCYWxsVG91Y2hpbmdMZWZ0KCBiYWxsICkgeyByZXR1cm4gVXRpbHMuZXF1YWxzRXBzaWxvbiggYmFsbC5sZWZ0LCB0aGlzLmxlZnQsIEVQU0lMT04gKTsgfSAvLyBAcHVibGljXHJcblxyXG4gIGlzQmFsbFRvdWNoaW5nUmlnaHQoIGJhbGwgKSB7IHJldHVybiBVdGlscy5lcXVhbHNFcHNpbG9uKCBiYWxsLnJpZ2h0LCB0aGlzLnJpZ2h0LCBFUFNJTE9OICk7IH0gLy8gQHB1YmxpY1xyXG5cclxuICBpc0JhbGxUb3VjaGluZ0JvdHRvbSggYmFsbCApIHsgcmV0dXJuIFV0aWxzLmVxdWFsc0Vwc2lsb24oIGJhbGwuYm90dG9tLCB0aGlzLmJvdHRvbSwgRVBTSUxPTiApOyB9IC8vIEBwdWJsaWNcclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGFueSBzaWRlIG9mIGEgQmFsbCBpcyB0YW5nZW50aWFsbHkgdG91Y2hpbmcgYW55IHNpZGUgb2YgdGhlIFBsYXlBcmVhIGZyb20gdGhlIGluc2lkZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JhbGx9IGJhbGxcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc0JhbGxUb3VjaGluZ1NpZGUoIGJhbGwgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pc0JhbGxUb3VjaGluZ1RvcCggYmFsbCApIHx8XHJcbiAgICAgICAgICAgdGhpcy5pc0JhbGxUb3VjaGluZ0JvdHRvbSggYmFsbCApIHx8XHJcbiAgICAgICAgICAgdGhpcy5pc0JhbGxUb3VjaGluZ0xlZnQoIGJhbGwgKSB8fFxyXG4gICAgICAgICAgIHRoaXMuaXNCYWxsVG91Y2hpbmdSaWdodCggYmFsbCApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7Qm91bmRzMn0gLSB0aGUgZGVmYXVsdCBib3VuZHMgb2YgdGhlIFBsYXlBcmVhLlxyXG5QbGF5QXJlYS5ERUZBVUxUX0JPVU5EUyA9IG5ldyBCb3VuZHMyKCAtMiwgLTEsIDIsIDEgKTtcclxuXHJcbi8vIEBwdWJsaWMgKHJlYWQtb25seSkge0VudW1lcmF0aW9uRGVwcmVjYXRlZH0gLSBFbnVtZXJhdGlvbiBvZiB0aGUgcG9zc2libGUgJ2RpbWVuc2lvbicgb2YgYSBQbGF5QXJlYS5cclxuUGxheUFyZWEuRGltZW5zaW9uID0gRW51bWVyYXRpb25EZXByZWNhdGVkLmJ5S2V5cyggWyAnT05FJywgJ1RXTycgXSApO1xyXG5cclxuY29sbGlzaW9uTGFiLnJlZ2lzdGVyKCAnUGxheUFyZWEnLCBQbGF5QXJlYSApO1xyXG5leHBvcnQgZGVmYXVsdCBQbGF5QXJlYTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUs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