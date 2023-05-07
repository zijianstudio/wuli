// Copyright 2019-2023, University of Colorado Boulder

/**
 * A Ball is the model for a single spherical moving object that appears in all screens. Each Ball is a apart of a
 * isolated system of multiple Balls in a BallSystem. Balls are implemented to work generally for both 1D and 2D
 * screens.
 *
 * Primary responsibilities are:
 *   - Center-position Property.
 *   - Mass Property.
 *   - Velocity and Momentum Properties.
 *   - Radius Property.
 *   - Dragging, user-control, restarting, etc.
 *   - Creating the trailing 'Path' behind the Ball.
 *
 * For the 'Collision Lab' sim, the same Ball instances are used with the same number of Balls. See BallSystem for more
 * context. Thus, Balls are created at the start of the sim and persist for the lifetime of the sim, so no dispose
 * method is necessary.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabUtils from '../CollisionLabUtils.js';
import BallState from './BallState.js';
import BallUtils from './BallUtils.js';
import CollisionLabPath from './CollisionLabPath.js';
import PlayArea from './PlayArea.js';
class Ball {
  /**
   * @param {BallState} initialBallState - starting state of the Ball.
   * @param {PlayArea} playArea - the PlayArea instance, which may or may not 'contain' this Ball.
   * @param {Property.<boolean>} isConstantSizeProperty - indicates if the Ball's radius is independent of mass.
   * @param {Property.<boolean>} pathsVisibleProperty - indicates if the Ball's trailing 'Path' is visible.
   * @param {number} index - the index of the Ball, which indicates which Ball in the system is this Ball. This index
   *                         number is displayed on the Ball, and each Ball within the system has a unique index.
   *                         Indices start from 1 within the system (ie. 1, 2, 3, ...).
   */
  constructor(initialBallState, playArea, isConstantSizeProperty, pathsVisibleProperty, index) {
    assert && assert(initialBallState instanceof BallState, `invalid initialBallState: ${initialBallState}`);
    assert && assert(playArea instanceof PlayArea, `invalid playArea: ${playArea}`);
    assert && AssertUtils.assertPropertyOf(isConstantSizeProperty, 'boolean');
    assert && AssertUtils.assertPropertyOf(pathsVisibleProperty, 'boolean');
    assert && AssertUtils.assertPositiveInteger(index);

    // @public {Property.<Vector2>} - Property of the center-position of the Ball, in meters.
    this.positionProperty = new Vector2Property(initialBallState.position, {
      valueComparisonStrategy: 'equalsFunction'
    });

    // @public {Property.<Vector2>} - Property of the velocity of the Ball, in m/s.
    this.velocityProperty = new Vector2Property(initialBallState.velocity, {
      valueComparisonStrategy: 'equalsFunction'
    });

    // @public {Property.<number>} speedProperty - Property of the speed of the Ball, in m/s.
    this.speedProperty = new DerivedProperty([this.velocityProperty], velocity => velocity.magnitude, {
      isValidValue: value => value >= 0,
      valueType: 'number'
    });

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Property.<number>} - Property of the mass of the Ball, in kg. Manipulated in the view.
    this.massProperty = new NumberProperty(initialBallState.mass, {
      range: CollisionLabConstants.MASS_RANGE
    });

    // @public {Property.<Vector2>} - Property of the momentum of the Ball, in kg*(m/s).
    this.momentumProperty = new DerivedProperty([this.massProperty, this.velocityProperty], (mass, velocity) => velocity.timesScalar(mass), {
      valueType: Vector2
    });

    // @public {Property.<number>} - the momentum, in kg*m/s. Separated into components to display individually.
    this.xMomentumProperty = new DerivedProperty([this.momentumProperty], momentum => momentum.x);
    this.yMomentumProperty = new DerivedProperty([this.momentumProperty], momentum => momentum.y);

    // @public {Property.<number>} - magnitude of this Ball's momentum, kg*(m/s).
    this.momentumMagnitudeProperty = new DerivedProperty([this.momentumProperty], momentum => momentum.magnitude, {
      isValidValue: value => value >= 0,
      valueType: 'number'
    });

    //----------------------------------------------------------------------------------------

    // @public {Property.<number>} - Property of the radius of the Ball, in meters.
    this.radiusProperty = new DerivedProperty([this.massProperty, isConstantSizeProperty], BallUtils.calculateBallRadius, {
      valueType: 'number',
      isValidValue: value => value > 0
    });

    // @public {Property.<number>} - Property of the rotation of the Ball relative to its own center, in radians. This is
    //                            used for 'sticky' collisions in the 'Inelastic' screen.
    this.rotationProperty = new NumberProperty(0);

    // @public {Property.<boolean>} - indicates if ANY part of the Ball is inside the PlayArea's bounds.
    this.insidePlayAreaProperty = new DerivedProperty([this.positionProperty, this.radiusProperty], () => playArea.containsAnyPartOfBall(this), {
      valueType: 'boolean'
    });

    // @public (read-only) {CollisionLabPath} - the trailing 'Path' behind the Ball.
    this.path = new CollisionLabPath(this.positionProperty, pathsVisibleProperty);

    //----------------------------------------------------------------------------------------

    // @public {Property.<boolean>} - indicates if the Ball's mass is being manipulated by the user. Set in the view.
    this.massUserControlledProperty = new BooleanProperty(false);

    // @public {Property.<boolean>} - indicates if the Ball's position is being manipulated by the user. Set in the view.
    this.xPositionUserControlledProperty = new BooleanProperty(false);
    this.yPositionUserControlledProperty = new BooleanProperty(false);

    // @public {Property.<boolean>} - indicates if the Ball's velocity is being manipulated by the user. Set in the view.
    this.xVelocityUserControlledProperty = new BooleanProperty(false);
    this.yVelocityUserControlledProperty = new BooleanProperty(false);

    // @public {Property.<boolean>} - indicates if the Ball is being controlled by the user in any way, either by
    //                                       dragging or through the Keypad.
    this.userControlledProperty = new DerivedProperty([this.massUserControlledProperty, this.xPositionUserControlledProperty, this.yPositionUserControlledProperty, this.xVelocityUserControlledProperty, this.yVelocityUserControlledProperty], (...userControlledValues) => userControlledValues.some(_.identity), {
      valueType: 'boolean'
    });

    //----------------------------------------------------------------------------------------

    // @public (read-only) {number} - the unique index of this Ball within a system of multiple Balls.
    this.index = index;

    // @private {BallState} - the state to set this Ball to when the restart button is pressed.
    this.restartState = initialBallState;

    // @public (read-only) {PlayArea} - reference to the passed-in PlayArea.
    this.playArea = playArea;

    // Clear the path when the ball is repositioned, see https://github.com/phetsims/collision-lab/issues/200
    this.userControlledProperty.lazyLink(() => {
      this.path.clear();
    });
  }

  /**
   * Resets this Ball to its factory settings. Called when the reset-all button is pressed.
   * @public
   */
  reset() {
    this.positionProperty.reset();
    this.velocityProperty.reset();
    this.massProperty.reset();
    this.rotationProperty.reset();
    this.path.clear();
    this.massUserControlledProperty.reset();
    this.xPositionUserControlledProperty.reset();
    this.yPositionUserControlledProperty.reset();
    this.xVelocityUserControlledProperty.reset();
    this.yVelocityUserControlledProperty.reset();
    this.saveState();
  }

  /**
   * Restarts this Ball. Called when the restart button is pressed.
   * @public
   *
   * See https://github.com/phetsims/collision-lab/issues/76 for context on the differences between reset and restart.
   */
  restart() {
    this.setState(this.restartState);

    // Setting the state resets the trailing 'Path' and the rotation of the Ball.
    this.path.clear();
    this.rotationProperty.reset();
  }

  /**
   * Moves the ball by some time step, assuming that the Ball isn't accelerating and is in uniform motion.
   * @public
   *
   * @param {number} dt - time in seconds
   */
  stepUniformMotion(dt) {
    assert && assert(typeof dt === 'number', `invalid dt: ${dt}`);

    // Since velocity is the first derivative of position, and the ball isn't accelerating, we can solely multiply
    // the velocity by the delta-time to get the displacement.
    this.positionProperty.value = this.velocityProperty.value.times(dt).add(this.positionProperty.value);
  }

  /**
   * Saves the state of the Ball in our restartState reference for the next restart() call.
   * @public
   *
   * This is called when the user presses the play button. See https://github.com/phetsims/collision-lab/issues/76.
   */
  saveState() {
    this.restartState = new BallState(this.positionProperty.value, this.velocityProperty.value, this.massProperty.value);
  }

  /**
   * Sets the Properties of this Ball to match the passed-in BallState.
   * @public
   *
   * @param {BallState} ballState
   */
  setState(ballState) {
    assert && assert(ballState instanceof BallState, `invalid ballState: ${ballState}`);
    this.positionProperty.value = ballState.position;
    this.velocityProperty.value = ballState.velocity;
    this.massProperty.value = ballState.mass;
  }

  /**
   * Invoked from the view when the Ball is dragged to a different position. Attempts to position the Ball at the
   * passed in position but ensures the Ball is inside the PlayArea's Bounds.
   *
   * If the grid is visible, the Ball will also snap to the nearest grid-line.
   * If the PlayArea is 1D, the Ball's y-position will be kept at 0.
   *
   * @public
   * @param {Vector2} position - the attempted drag position, in model units, of the center of the Ball.
   */
  dragToPosition(position) {
    assert && assert(position instanceof Vector2, `invalid position: ${position}`);

    // Flag that references the corrected position of the attempted drag position of the Ball.
    let correctedPosition;
    if (!this.playArea.gridVisibleProperty.value) {
      // Ensure that the Ball's position is inside of the PlayArea's bounds, eroded by the radius to ensure that the
      // entire Ball is inside the PlayArea.
      correctedPosition = this.playArea.bounds.eroded(this.radiusProperty.value).closestPointTo(position);
    } else {
      // Ensure that the Ball's position is inside of the grid-safe bounds, which is rounded inwards to the nearest
      // grid-line to ensure that the Ball is both inside the PlayArea and snapped to a grid-line.
      correctedPosition = CollisionLabUtils.roundVectorToNearest(BallUtils.getBallGridSafeConstrainedBounds(this.playArea.bounds, this.radiusProperty.value).closestPointTo(position), CollisionLabConstants.MINOR_GRIDLINE_SPACING);
    }

    // If the PlayArea is 1D, ensure that the y-position of the Ball is set to 0.
    this.playArea.dimension === PlayArea.Dimension.ONE && correctedPosition.setY(0);

    // Finally, set the position of the Ball to the corrected position.
    this.positionProperty.value = correctedPosition;
    assert && assert(this.playArea.fullyContainsBall(this));
  }

  /*----------------------------------------------------------------------------*
   * Convenience Methods
   *----------------------------------------------------------------------------*/

  /**
   * ES5 getters for the location of the edges of the Ball, in meters.
   * @public
   *
   * @returns {number} - in meters.
   */
  get left() {
    return this.positionProperty.value.x - this.radiusProperty.value;
  }
  get right() {
    return this.positionProperty.value.x + this.radiusProperty.value;
  }
  get top() {
    return this.positionProperty.value.y + this.radiusProperty.value;
  }
  get bottom() {
    return this.positionProperty.value.y - this.radiusProperty.value;
  }

  /**
   * Sets the x-position of the Ball, in meters.
   * @public
   *
   * @param {number} xPosition - in meters
   */
  setXPosition(xPosition) {
    this.positionProperty.value = this.positionProperty.value.copy().setX(xPosition);
  }

  /**
   * Sets the y-position of the Ball, in meters.
   * @public
   *
   * @param {number} yPosition - in meters
   */
  setYPosition(yPosition) {
    this.positionProperty.value = this.positionProperty.value.copy().setY(yPosition);
  }

  /**
   * Sets the horizontal velocity of the Ball, in m/s.
   * @public
   *
   * @param {number} xVelocity - in m/s.
   */
  setXVelocity(xVelocity) {
    this.velocityProperty.value = this.velocityProperty.value.copy().setX(CollisionLabUtils.clampDown(xVelocity, CollisionLabConstants.MIN_VELOCITY));
  }

  /**
   * Sets the vertical velocity of the Ball, in m/s.
   * @public
   *
   * @param {number} yVelocity - in m/s.
   */
  setYVelocity(yVelocity) {
    this.velocityProperty.value = this.velocityProperty.value.copy().setY(CollisionLabUtils.clampDown(yVelocity, CollisionLabConstants.MIN_VELOCITY));
  }
}
collisionLab.register('Ball', Ball);
export default Ball;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJBc3NlcnRVdGlscyIsImNvbGxpc2lvbkxhYiIsIkNvbGxpc2lvbkxhYkNvbnN0YW50cyIsIkNvbGxpc2lvbkxhYlV0aWxzIiwiQmFsbFN0YXRlIiwiQmFsbFV0aWxzIiwiQ29sbGlzaW9uTGFiUGF0aCIsIlBsYXlBcmVhIiwiQmFsbCIsImNvbnN0cnVjdG9yIiwiaW5pdGlhbEJhbGxTdGF0ZSIsInBsYXlBcmVhIiwiaXNDb25zdGFudFNpemVQcm9wZXJ0eSIsInBhdGhzVmlzaWJsZVByb3BlcnR5IiwiaW5kZXgiLCJhc3NlcnQiLCJhc3NlcnRQcm9wZXJ0eU9mIiwiYXNzZXJ0UG9zaXRpdmVJbnRlZ2VyIiwicG9zaXRpb25Qcm9wZXJ0eSIsInBvc2l0aW9uIiwidmFsdWVDb21wYXJpc29uU3RyYXRlZ3kiLCJ2ZWxvY2l0eVByb3BlcnR5IiwidmVsb2NpdHkiLCJzcGVlZFByb3BlcnR5IiwibWFnbml0dWRlIiwiaXNWYWxpZFZhbHVlIiwidmFsdWUiLCJ2YWx1ZVR5cGUiLCJtYXNzUHJvcGVydHkiLCJtYXNzIiwicmFuZ2UiLCJNQVNTX1JBTkdFIiwibW9tZW50dW1Qcm9wZXJ0eSIsInRpbWVzU2NhbGFyIiwieE1vbWVudHVtUHJvcGVydHkiLCJtb21lbnR1bSIsIngiLCJ5TW9tZW50dW1Qcm9wZXJ0eSIsInkiLCJtb21lbnR1bU1hZ25pdHVkZVByb3BlcnR5IiwicmFkaXVzUHJvcGVydHkiLCJjYWxjdWxhdGVCYWxsUmFkaXVzIiwicm90YXRpb25Qcm9wZXJ0eSIsImluc2lkZVBsYXlBcmVhUHJvcGVydHkiLCJjb250YWluc0FueVBhcnRPZkJhbGwiLCJwYXRoIiwibWFzc1VzZXJDb250cm9sbGVkUHJvcGVydHkiLCJ4UG9zaXRpb25Vc2VyQ29udHJvbGxlZFByb3BlcnR5IiwieVBvc2l0aW9uVXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsInhWZWxvY2l0eVVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJ5VmVsb2NpdHlVc2VyQ29udHJvbGxlZFByb3BlcnR5IiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsInVzZXJDb250cm9sbGVkVmFsdWVzIiwic29tZSIsIl8iLCJpZGVudGl0eSIsInJlc3RhcnRTdGF0ZSIsImxhenlMaW5rIiwiY2xlYXIiLCJyZXNldCIsInNhdmVTdGF0ZSIsInJlc3RhcnQiLCJzZXRTdGF0ZSIsInN0ZXBVbmlmb3JtTW90aW9uIiwiZHQiLCJ0aW1lcyIsImFkZCIsImJhbGxTdGF0ZSIsImRyYWdUb1Bvc2l0aW9uIiwiY29ycmVjdGVkUG9zaXRpb24iLCJncmlkVmlzaWJsZVByb3BlcnR5IiwiYm91bmRzIiwiZXJvZGVkIiwiY2xvc2VzdFBvaW50VG8iLCJyb3VuZFZlY3RvclRvTmVhcmVzdCIsImdldEJhbGxHcmlkU2FmZUNvbnN0cmFpbmVkQm91bmRzIiwiTUlOT1JfR1JJRExJTkVfU1BBQ0lORyIsImRpbWVuc2lvbiIsIkRpbWVuc2lvbiIsIk9ORSIsInNldFkiLCJmdWxseUNvbnRhaW5zQmFsbCIsImxlZnQiLCJyaWdodCIsInRvcCIsImJvdHRvbSIsInNldFhQb3NpdGlvbiIsInhQb3NpdGlvbiIsImNvcHkiLCJzZXRYIiwic2V0WVBvc2l0aW9uIiwieVBvc2l0aW9uIiwic2V0WFZlbG9jaXR5IiwieFZlbG9jaXR5IiwiY2xhbXBEb3duIiwiTUlOX1ZFTE9DSVRZIiwic2V0WVZlbG9jaXR5IiwieVZlbG9jaXR5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYWxsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgQmFsbCBpcyB0aGUgbW9kZWwgZm9yIGEgc2luZ2xlIHNwaGVyaWNhbCBtb3Zpbmcgb2JqZWN0IHRoYXQgYXBwZWFycyBpbiBhbGwgc2NyZWVucy4gRWFjaCBCYWxsIGlzIGEgYXBhcnQgb2YgYVxyXG4gKiBpc29sYXRlZCBzeXN0ZW0gb2YgbXVsdGlwbGUgQmFsbHMgaW4gYSBCYWxsU3lzdGVtLiBCYWxscyBhcmUgaW1wbGVtZW50ZWQgdG8gd29yayBnZW5lcmFsbHkgZm9yIGJvdGggMUQgYW5kIDJEXHJcbiAqIHNjcmVlbnMuXHJcbiAqXHJcbiAqIFByaW1hcnkgcmVzcG9uc2liaWxpdGllcyBhcmU6XHJcbiAqICAgLSBDZW50ZXItcG9zaXRpb24gUHJvcGVydHkuXHJcbiAqICAgLSBNYXNzIFByb3BlcnR5LlxyXG4gKiAgIC0gVmVsb2NpdHkgYW5kIE1vbWVudHVtIFByb3BlcnRpZXMuXHJcbiAqICAgLSBSYWRpdXMgUHJvcGVydHkuXHJcbiAqICAgLSBEcmFnZ2luZywgdXNlci1jb250cm9sLCByZXN0YXJ0aW5nLCBldGMuXHJcbiAqICAgLSBDcmVhdGluZyB0aGUgdHJhaWxpbmcgJ1BhdGgnIGJlaGluZCB0aGUgQmFsbC5cclxuICpcclxuICogRm9yIHRoZSAnQ29sbGlzaW9uIExhYicgc2ltLCB0aGUgc2FtZSBCYWxsIGluc3RhbmNlcyBhcmUgdXNlZCB3aXRoIHRoZSBzYW1lIG51bWJlciBvZiBCYWxscy4gU2VlIEJhbGxTeXN0ZW0gZm9yIG1vcmVcclxuICogY29udGV4dC4gVGh1cywgQmFsbHMgYXJlIGNyZWF0ZWQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzaW0gYW5kIHBlcnNpc3QgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltLCBzbyBubyBkaXNwb3NlXHJcbiAqIG1ldGhvZCBpcyBuZWNlc3NhcnkuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQXNzZXJ0VXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9Bc3NlcnRVdGlscy5qcyc7XHJcbmltcG9ydCBjb2xsaXNpb25MYWIgZnJvbSAnLi4vLi4vY29sbGlzaW9uTGFiLmpzJztcclxuaW1wb3J0IENvbGxpc2lvbkxhYkNvbnN0YW50cyBmcm9tICcuLi9Db2xsaXNpb25MYWJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiVXRpbHMgZnJvbSAnLi4vQ29sbGlzaW9uTGFiVXRpbHMuanMnO1xyXG5pbXBvcnQgQmFsbFN0YXRlIGZyb20gJy4vQmFsbFN0YXRlLmpzJztcclxuaW1wb3J0IEJhbGxVdGlscyBmcm9tICcuL0JhbGxVdGlscy5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJQYXRoIGZyb20gJy4vQ29sbGlzaW9uTGFiUGF0aC5qcyc7XHJcbmltcG9ydCBQbGF5QXJlYSBmcm9tICcuL1BsYXlBcmVhLmpzJztcclxuXHJcbmNsYXNzIEJhbGwge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0JhbGxTdGF0ZX0gaW5pdGlhbEJhbGxTdGF0ZSAtIHN0YXJ0aW5nIHN0YXRlIG9mIHRoZSBCYWxsLlxyXG4gICAqIEBwYXJhbSB7UGxheUFyZWF9IHBsYXlBcmVhIC0gdGhlIFBsYXlBcmVhIGluc3RhbmNlLCB3aGljaCBtYXkgb3IgbWF5IG5vdCAnY29udGFpbicgdGhpcyBCYWxsLlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBpc0NvbnN0YW50U2l6ZVByb3BlcnR5IC0gaW5kaWNhdGVzIGlmIHRoZSBCYWxsJ3MgcmFkaXVzIGlzIGluZGVwZW5kZW50IG9mIG1hc3MuXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHBhdGhzVmlzaWJsZVByb3BlcnR5IC0gaW5kaWNhdGVzIGlmIHRoZSBCYWxsJ3MgdHJhaWxpbmcgJ1BhdGgnIGlzIHZpc2libGUuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gdGhlIGluZGV4IG9mIHRoZSBCYWxsLCB3aGljaCBpbmRpY2F0ZXMgd2hpY2ggQmFsbCBpbiB0aGUgc3lzdGVtIGlzIHRoaXMgQmFsbC4gVGhpcyBpbmRleFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgIG51bWJlciBpcyBkaXNwbGF5ZWQgb24gdGhlIEJhbGwsIGFuZCBlYWNoIEJhbGwgd2l0aGluIHRoZSBzeXN0ZW0gaGFzIGEgdW5pcXVlIGluZGV4LlxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgIEluZGljZXMgc3RhcnQgZnJvbSAxIHdpdGhpbiB0aGUgc3lzdGVtIChpZS4gMSwgMiwgMywgLi4uKS5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaW5pdGlhbEJhbGxTdGF0ZSwgcGxheUFyZWEsIGlzQ29uc3RhbnRTaXplUHJvcGVydHksIHBhdGhzVmlzaWJsZVByb3BlcnR5LCBpbmRleCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluaXRpYWxCYWxsU3RhdGUgaW5zdGFuY2VvZiBCYWxsU3RhdGUsIGBpbnZhbGlkIGluaXRpYWxCYWxsU3RhdGU6ICR7aW5pdGlhbEJhbGxTdGF0ZX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwbGF5QXJlYSBpbnN0YW5jZW9mIFBsYXlBcmVhLCBgaW52YWxpZCBwbGF5QXJlYTogJHtwbGF5QXJlYX1gICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHlPZiggaXNDb25zdGFudFNpemVQcm9wZXJ0eSwgJ2Jvb2xlYW4nICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHlPZiggcGF0aHNWaXNpYmxlUHJvcGVydHksICdib29sZWFuJyApO1xyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydFBvc2l0aXZlSW50ZWdlciggaW5kZXggKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48VmVjdG9yMj59IC0gUHJvcGVydHkgb2YgdGhlIGNlbnRlci1wb3NpdGlvbiBvZiB0aGUgQmFsbCwgaW4gbWV0ZXJzLlxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggaW5pdGlhbEJhbGxTdGF0ZS5wb3NpdGlvbiwge1xyXG4gICAgICB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogJ2VxdWFsc0Z1bmN0aW9uJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxWZWN0b3IyPn0gLSBQcm9wZXJ0eSBvZiB0aGUgdmVsb2NpdHkgb2YgdGhlIEJhbGwsIGluIG0vcy5cclxuICAgIHRoaXMudmVsb2NpdHlQcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIGluaXRpYWxCYWxsU3RhdGUudmVsb2NpdHksIHtcclxuICAgICAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gc3BlZWRQcm9wZXJ0eSAtIFByb3BlcnR5IG9mIHRoZSBzcGVlZCBvZiB0aGUgQmFsbCwgaW4gbS9zLlxyXG4gICAgdGhpcy5zcGVlZFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnZlbG9jaXR5UHJvcGVydHkgXSwgdmVsb2NpdHkgPT4gdmVsb2NpdHkubWFnbml0dWRlLCB7XHJcbiAgICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gdmFsdWUgPj0gMCxcclxuICAgICAgdmFsdWVUeXBlOiAnbnVtYmVyJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1Byb3BlcnR5LjxudW1iZXI+fSAtIFByb3BlcnR5IG9mIHRoZSBtYXNzIG9mIHRoZSBCYWxsLCBpbiBrZy4gTWFuaXB1bGF0ZWQgaW4gdGhlIHZpZXcuXHJcbiAgICB0aGlzLm1hc3NQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggaW5pdGlhbEJhbGxTdGF0ZS5tYXNzLCB7IHJhbmdlOiBDb2xsaXNpb25MYWJDb25zdGFudHMuTUFTU19SQU5HRSB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPFZlY3RvcjI+fSAtIFByb3BlcnR5IG9mIHRoZSBtb21lbnR1bSBvZiB0aGUgQmFsbCwgaW4ga2cqKG0vcykuXHJcbiAgICB0aGlzLm1vbWVudHVtUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMubWFzc1Byb3BlcnR5LCB0aGlzLnZlbG9jaXR5UHJvcGVydHkgXSxcclxuICAgICAgKCBtYXNzLCB2ZWxvY2l0eSApID0+IHZlbG9jaXR5LnRpbWVzU2NhbGFyKCBtYXNzICksXHJcbiAgICAgIHsgdmFsdWVUeXBlOiBWZWN0b3IyIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gLSB0aGUgbW9tZW50dW0sIGluIGtnKm0vcy4gU2VwYXJhdGVkIGludG8gY29tcG9uZW50cyB0byBkaXNwbGF5IGluZGl2aWR1YWxseS5cclxuICAgIHRoaXMueE1vbWVudHVtUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMubW9tZW50dW1Qcm9wZXJ0eSBdLCBtb21lbnR1bSA9PiBtb21lbnR1bS54ICk7XHJcbiAgICB0aGlzLnlNb21lbnR1bVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLm1vbWVudHVtUHJvcGVydHkgXSwgbW9tZW50dW0gPT4gbW9tZW50dW0ueSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSAtIG1hZ25pdHVkZSBvZiB0aGlzIEJhbGwncyBtb21lbnR1bSwga2cqKG0vcykuXHJcbiAgICB0aGlzLm1vbWVudHVtTWFnbml0dWRlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMubW9tZW50dW1Qcm9wZXJ0eSBdLCBtb21lbnR1bSA9PiBtb21lbnR1bS5tYWduaXR1ZGUsIHtcclxuICAgICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB2YWx1ZSA+PSAwLFxyXG4gICAgICB2YWx1ZVR5cGU6ICdudW1iZXInXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IC0gUHJvcGVydHkgb2YgdGhlIHJhZGl1cyBvZiB0aGUgQmFsbCwgaW4gbWV0ZXJzLlxyXG4gICAgdGhpcy5yYWRpdXNQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5tYXNzUHJvcGVydHksIGlzQ29uc3RhbnRTaXplUHJvcGVydHkgXSxcclxuICAgICAgQmFsbFV0aWxzLmNhbGN1bGF0ZUJhbGxSYWRpdXMsXHJcbiAgICAgIHsgdmFsdWVUeXBlOiAnbnVtYmVyJywgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB2YWx1ZSA+IDAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSAtIFByb3BlcnR5IG9mIHRoZSByb3RhdGlvbiBvZiB0aGUgQmFsbCByZWxhdGl2ZSB0byBpdHMgb3duIGNlbnRlciwgaW4gcmFkaWFucy4gVGhpcyBpc1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlZCBmb3IgJ3N0aWNreScgY29sbGlzaW9ucyBpbiB0aGUgJ0luZWxhc3RpYycgc2NyZWVuLlxyXG4gICAgdGhpcy5yb3RhdGlvblByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSAtIGluZGljYXRlcyBpZiBBTlkgcGFydCBvZiB0aGUgQmFsbCBpcyBpbnNpZGUgdGhlIFBsYXlBcmVhJ3MgYm91bmRzLlxyXG4gICAgdGhpcy5pbnNpZGVQbGF5QXJlYVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnBvc2l0aW9uUHJvcGVydHksIHRoaXMucmFkaXVzUHJvcGVydHkgXSxcclxuICAgICAgKCkgPT4gcGxheUFyZWEuY29udGFpbnNBbnlQYXJ0T2ZCYWxsKCB0aGlzICksXHJcbiAgICAgIHsgdmFsdWVUeXBlOiAnYm9vbGVhbicgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge0NvbGxpc2lvbkxhYlBhdGh9IC0gdGhlIHRyYWlsaW5nICdQYXRoJyBiZWhpbmQgdGhlIEJhbGwuXHJcbiAgICB0aGlzLnBhdGggPSBuZXcgQ29sbGlzaW9uTGFiUGF0aCggdGhpcy5wb3NpdGlvblByb3BlcnR5LCBwYXRoc1Zpc2libGVQcm9wZXJ0eSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gLSBpbmRpY2F0ZXMgaWYgdGhlIEJhbGwncyBtYXNzIGlzIGJlaW5nIG1hbmlwdWxhdGVkIGJ5IHRoZSB1c2VyLiBTZXQgaW4gdGhlIHZpZXcuXHJcbiAgICB0aGlzLm1hc3NVc2VyQ29udHJvbGxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IC0gaW5kaWNhdGVzIGlmIHRoZSBCYWxsJ3MgcG9zaXRpb24gaXMgYmVpbmcgbWFuaXB1bGF0ZWQgYnkgdGhlIHVzZXIuIFNldCBpbiB0aGUgdmlldy5cclxuICAgIHRoaXMueFBvc2l0aW9uVXNlckNvbnRyb2xsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICB0aGlzLnlQb3NpdGlvblVzZXJDb250cm9sbGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gLSBpbmRpY2F0ZXMgaWYgdGhlIEJhbGwncyB2ZWxvY2l0eSBpcyBiZWluZyBtYW5pcHVsYXRlZCBieSB0aGUgdXNlci4gU2V0IGluIHRoZSB2aWV3LlxyXG4gICAgdGhpcy54VmVsb2NpdHlVc2VyQ29udHJvbGxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuICAgIHRoaXMueVZlbG9jaXR5VXNlckNvbnRyb2xsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSAtIGluZGljYXRlcyBpZiB0aGUgQmFsbCBpcyBiZWluZyBjb250cm9sbGVkIGJ5IHRoZSB1c2VyIGluIGFueSB3YXksIGVpdGhlciBieVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZyBvciB0aHJvdWdoIHRoZSBLZXlwYWQuXHJcbiAgICB0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMubWFzc1VzZXJDb250cm9sbGVkUHJvcGVydHksXHJcbiAgICAgIHRoaXMueFBvc2l0aW9uVXNlckNvbnRyb2xsZWRQcm9wZXJ0eSxcclxuICAgICAgdGhpcy55UG9zaXRpb25Vc2VyQ29udHJvbGxlZFByb3BlcnR5LFxyXG4gICAgICB0aGlzLnhWZWxvY2l0eVVzZXJDb250cm9sbGVkUHJvcGVydHksXHJcbiAgICAgIHRoaXMueVZlbG9jaXR5VXNlckNvbnRyb2xsZWRQcm9wZXJ0eVxyXG4gICAgXSwgKCAuLi51c2VyQ29udHJvbGxlZFZhbHVlcyApID0+IHVzZXJDb250cm9sbGVkVmFsdWVzLnNvbWUoIF8uaWRlbnRpdHkgKSwge1xyXG4gICAgICB2YWx1ZVR5cGU6ICdib29sZWFuJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge251bWJlcn0gLSB0aGUgdW5pcXVlIGluZGV4IG9mIHRoaXMgQmFsbCB3aXRoaW4gYSBzeXN0ZW0gb2YgbXVsdGlwbGUgQmFsbHMuXHJcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0JhbGxTdGF0ZX0gLSB0aGUgc3RhdGUgdG8gc2V0IHRoaXMgQmFsbCB0byB3aGVuIHRoZSByZXN0YXJ0IGJ1dHRvbiBpcyBwcmVzc2VkLlxyXG4gICAgdGhpcy5yZXN0YXJ0U3RhdGUgPSBpbml0aWFsQmFsbFN0YXRlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1BsYXlBcmVhfSAtIHJlZmVyZW5jZSB0byB0aGUgcGFzc2VkLWluIFBsYXlBcmVhLlxyXG4gICAgdGhpcy5wbGF5QXJlYSA9IHBsYXlBcmVhO1xyXG5cclxuICAgIC8vIENsZWFyIHRoZSBwYXRoIHdoZW4gdGhlIGJhbGwgaXMgcmVwb3NpdGlvbmVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NvbGxpc2lvbi1sYWIvaXNzdWVzLzIwMFxyXG4gICAgdGhpcy51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucGF0aC5jbGVhcigpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoaXMgQmFsbCB0byBpdHMgZmFjdG9yeSBzZXR0aW5ncy4gQ2FsbGVkIHdoZW4gdGhlIHJlc2V0LWFsbCBidXR0b24gaXMgcHJlc3NlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudmVsb2NpdHlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5tYXNzUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucm90YXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wYXRoLmNsZWFyKCk7XHJcbiAgICB0aGlzLm1hc3NVc2VyQ29udHJvbGxlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnhQb3NpdGlvblVzZXJDb250cm9sbGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMueVBvc2l0aW9uVXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy54VmVsb2NpdHlVc2VyQ29udHJvbGxlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnlWZWxvY2l0eVVzZXJDb250cm9sbGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc2F2ZVN0YXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXN0YXJ0cyB0aGlzIEJhbGwuIENhbGxlZCB3aGVuIHRoZSByZXN0YXJ0IGJ1dHRvbiBpcyBwcmVzc2VkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY29sbGlzaW9uLWxhYi9pc3N1ZXMvNzYgZm9yIGNvbnRleHQgb24gdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gcmVzZXQgYW5kIHJlc3RhcnQuXHJcbiAgICovXHJcbiAgcmVzdGFydCgpIHtcclxuICAgIHRoaXMuc2V0U3RhdGUoIHRoaXMucmVzdGFydFN0YXRlICk7XHJcblxyXG4gICAgLy8gU2V0dGluZyB0aGUgc3RhdGUgcmVzZXRzIHRoZSB0cmFpbGluZyAnUGF0aCcgYW5kIHRoZSByb3RhdGlvbiBvZiB0aGUgQmFsbC5cclxuICAgIHRoaXMucGF0aC5jbGVhcigpO1xyXG4gICAgdGhpcy5yb3RhdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlcyB0aGUgYmFsbCBieSBzb21lIHRpbWUgc3RlcCwgYXNzdW1pbmcgdGhhdCB0aGUgQmFsbCBpc24ndCBhY2NlbGVyYXRpbmcgYW5kIGlzIGluIHVuaWZvcm0gbW90aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRpbWUgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHN0ZXBVbmlmb3JtTW90aW9uKCBkdCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBkdCA9PT0gJ251bWJlcicsIGBpbnZhbGlkIGR0OiAke2R0fWAgKTtcclxuXHJcbiAgICAvLyBTaW5jZSB2ZWxvY2l0eSBpcyB0aGUgZmlyc3QgZGVyaXZhdGl2ZSBvZiBwb3NpdGlvbiwgYW5kIHRoZSBiYWxsIGlzbid0IGFjY2VsZXJhdGluZywgd2UgY2FuIHNvbGVseSBtdWx0aXBseVxyXG4gICAgLy8gdGhlIHZlbG9jaXR5IGJ5IHRoZSBkZWx0YS10aW1lIHRvIGdldCB0aGUgZGlzcGxhY2VtZW50LlxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gdGhpcy52ZWxvY2l0eVByb3BlcnR5LnZhbHVlLnRpbWVzKCBkdCApLmFkZCggdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTYXZlcyB0aGUgc3RhdGUgb2YgdGhlIEJhbGwgaW4gb3VyIHJlc3RhcnRTdGF0ZSByZWZlcmVuY2UgZm9yIHRoZSBuZXh0IHJlc3RhcnQoKSBjYWxsLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgY2FsbGVkIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyB0aGUgcGxheSBidXR0b24uIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY29sbGlzaW9uLWxhYi9pc3N1ZXMvNzYuXHJcbiAgICovXHJcbiAgc2F2ZVN0YXRlKCkgeyB0aGlzLnJlc3RhcnRTdGF0ZSA9IG5ldyBCYWxsU3RhdGUoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSwgdGhpcy52ZWxvY2l0eVByb3BlcnR5LnZhbHVlLCB0aGlzLm1hc3NQcm9wZXJ0eS52YWx1ZSApOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIFByb3BlcnRpZXMgb2YgdGhpcyBCYWxsIHRvIG1hdGNoIHRoZSBwYXNzZWQtaW4gQmFsbFN0YXRlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QmFsbFN0YXRlfSBiYWxsU3RhdGVcclxuICAgKi9cclxuICBzZXRTdGF0ZSggYmFsbFN0YXRlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmFsbFN0YXRlIGluc3RhbmNlb2YgQmFsbFN0YXRlLCBgaW52YWxpZCBiYWxsU3RhdGU6ICR7YmFsbFN0YXRlfWAgKTtcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IGJhbGxTdGF0ZS5wb3NpdGlvbjtcclxuICAgIHRoaXMudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSA9IGJhbGxTdGF0ZS52ZWxvY2l0eTtcclxuICAgIHRoaXMubWFzc1Byb3BlcnR5LnZhbHVlID0gYmFsbFN0YXRlLm1hc3M7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnZva2VkIGZyb20gdGhlIHZpZXcgd2hlbiB0aGUgQmFsbCBpcyBkcmFnZ2VkIHRvIGEgZGlmZmVyZW50IHBvc2l0aW9uLiBBdHRlbXB0cyB0byBwb3NpdGlvbiB0aGUgQmFsbCBhdCB0aGVcclxuICAgKiBwYXNzZWQgaW4gcG9zaXRpb24gYnV0IGVuc3VyZXMgdGhlIEJhbGwgaXMgaW5zaWRlIHRoZSBQbGF5QXJlYSdzIEJvdW5kcy5cclxuICAgKlxyXG4gICAqIElmIHRoZSBncmlkIGlzIHZpc2libGUsIHRoZSBCYWxsIHdpbGwgYWxzbyBzbmFwIHRvIHRoZSBuZWFyZXN0IGdyaWQtbGluZS5cclxuICAgKiBJZiB0aGUgUGxheUFyZWEgaXMgMUQsIHRoZSBCYWxsJ3MgeS1wb3NpdGlvbiB3aWxsIGJlIGtlcHQgYXQgMC5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uIC0gdGhlIGF0dGVtcHRlZCBkcmFnIHBvc2l0aW9uLCBpbiBtb2RlbCB1bml0cywgb2YgdGhlIGNlbnRlciBvZiB0aGUgQmFsbC5cclxuICAgKi9cclxuICBkcmFnVG9Qb3NpdGlvbiggcG9zaXRpb24gKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb3NpdGlvbiBpbnN0YW5jZW9mIFZlY3RvcjIsIGBpbnZhbGlkIHBvc2l0aW9uOiAke3Bvc2l0aW9ufWAgKTtcclxuXHJcbiAgICAvLyBGbGFnIHRoYXQgcmVmZXJlbmNlcyB0aGUgY29ycmVjdGVkIHBvc2l0aW9uIG9mIHRoZSBhdHRlbXB0ZWQgZHJhZyBwb3NpdGlvbiBvZiB0aGUgQmFsbC5cclxuICAgIGxldCBjb3JyZWN0ZWRQb3NpdGlvbjtcclxuXHJcbiAgICBpZiAoICF0aGlzLnBsYXlBcmVhLmdyaWRWaXNpYmxlUHJvcGVydHkudmFsdWUgKSB7XHJcblxyXG4gICAgICAvLyBFbnN1cmUgdGhhdCB0aGUgQmFsbCdzIHBvc2l0aW9uIGlzIGluc2lkZSBvZiB0aGUgUGxheUFyZWEncyBib3VuZHMsIGVyb2RlZCBieSB0aGUgcmFkaXVzIHRvIGVuc3VyZSB0aGF0IHRoZVxyXG4gICAgICAvLyBlbnRpcmUgQmFsbCBpcyBpbnNpZGUgdGhlIFBsYXlBcmVhLlxyXG4gICAgICBjb3JyZWN0ZWRQb3NpdGlvbiA9IHRoaXMucGxheUFyZWEuYm91bmRzLmVyb2RlZCggdGhpcy5yYWRpdXNQcm9wZXJ0eS52YWx1ZSApLmNsb3Nlc3RQb2ludFRvKCBwb3NpdGlvbiApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBFbnN1cmUgdGhhdCB0aGUgQmFsbCdzIHBvc2l0aW9uIGlzIGluc2lkZSBvZiB0aGUgZ3JpZC1zYWZlIGJvdW5kcywgd2hpY2ggaXMgcm91bmRlZCBpbndhcmRzIHRvIHRoZSBuZWFyZXN0XHJcbiAgICAgIC8vIGdyaWQtbGluZSB0byBlbnN1cmUgdGhhdCB0aGUgQmFsbCBpcyBib3RoIGluc2lkZSB0aGUgUGxheUFyZWEgYW5kIHNuYXBwZWQgdG8gYSBncmlkLWxpbmUuXHJcbiAgICAgIGNvcnJlY3RlZFBvc2l0aW9uID0gQ29sbGlzaW9uTGFiVXRpbHMucm91bmRWZWN0b3JUb05lYXJlc3QoXHJcbiAgICAgICAgQmFsbFV0aWxzLmdldEJhbGxHcmlkU2FmZUNvbnN0cmFpbmVkQm91bmRzKCB0aGlzLnBsYXlBcmVhLmJvdW5kcywgdGhpcy5yYWRpdXNQcm9wZXJ0eS52YWx1ZSApLmNsb3Nlc3RQb2ludFRvKCBwb3NpdGlvbiApLFxyXG4gICAgICAgIENvbGxpc2lvbkxhYkNvbnN0YW50cy5NSU5PUl9HUklETElORV9TUEFDSU5HXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgdGhlIFBsYXlBcmVhIGlzIDFELCBlbnN1cmUgdGhhdCB0aGUgeS1wb3NpdGlvbiBvZiB0aGUgQmFsbCBpcyBzZXQgdG8gMC5cclxuICAgICggdGhpcy5wbGF5QXJlYS5kaW1lbnNpb24gPT09IFBsYXlBcmVhLkRpbWVuc2lvbi5PTkUgKSAmJiBjb3JyZWN0ZWRQb3NpdGlvbi5zZXRZKCAwICk7XHJcblxyXG4gICAgLy8gRmluYWxseSwgc2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgQmFsbCB0byB0aGUgY29ycmVjdGVkIHBvc2l0aW9uLlxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gY29ycmVjdGVkUG9zaXRpb247XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnBsYXlBcmVhLmZ1bGx5Q29udGFpbnNCYWxsKCB0aGlzICkgKTtcclxuICB9XHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgKiBDb252ZW5pZW5jZSBNZXRob2RzXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogRVM1IGdldHRlcnMgZm9yIHRoZSBsb2NhdGlvbiBvZiB0aGUgZWRnZXMgb2YgdGhlIEJhbGwsIGluIG1ldGVycy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIGluIG1ldGVycy5cclxuICAgKi9cclxuICBnZXQgbGVmdCgpIHsgcmV0dXJuIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54IC0gdGhpcy5yYWRpdXNQcm9wZXJ0eS52YWx1ZTsgfVxyXG5cclxuICBnZXQgcmlnaHQoKSB7IHJldHVybiB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCArIHRoaXMucmFkaXVzUHJvcGVydHkudmFsdWU7IH1cclxuXHJcbiAgZ2V0IHRvcCgpIHsgcmV0dXJuIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICsgdGhpcy5yYWRpdXNQcm9wZXJ0eS52YWx1ZTsgfVxyXG5cclxuICBnZXQgYm90dG9tKCkgeyByZXR1cm4gdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgLSB0aGlzLnJhZGl1c1Byb3BlcnR5LnZhbHVlOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHgtcG9zaXRpb24gb2YgdGhlIEJhbGwsIGluIG1ldGVycy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFBvc2l0aW9uIC0gaW4gbWV0ZXJzXHJcbiAgICovXHJcbiAgc2V0WFBvc2l0aW9uKCB4UG9zaXRpb24gKSB7IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5jb3B5KCkuc2V0WCggeFBvc2l0aW9uICk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgeS1wb3NpdGlvbiBvZiB0aGUgQmFsbCwgaW4gbWV0ZXJzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5UG9zaXRpb24gLSBpbiBtZXRlcnNcclxuICAgKi9cclxuICBzZXRZUG9zaXRpb24oIHlQb3NpdGlvbiApIHsgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLmNvcHkoKS5zZXRZKCB5UG9zaXRpb24gKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBob3Jpem9udGFsIHZlbG9jaXR5IG9mIHRoZSBCYWxsLCBpbiBtL3MuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhWZWxvY2l0eSAtIGluIG0vcy5cclxuICAgKi9cclxuICBzZXRYVmVsb2NpdHkoIHhWZWxvY2l0eSApIHtcclxuICAgIHRoaXMudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSA9IHRoaXMudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZS5jb3B5KCkuc2V0WCggQ29sbGlzaW9uTGFiVXRpbHMuY2xhbXBEb3duKCB4VmVsb2NpdHksIENvbGxpc2lvbkxhYkNvbnN0YW50cy5NSU5fVkVMT0NJVFkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdmVydGljYWwgdmVsb2NpdHkgb2YgdGhlIEJhbGwsIGluIG0vcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVZlbG9jaXR5IC0gaW4gbS9zLlxyXG4gICAqL1xyXG4gIHNldFlWZWxvY2l0eSggeVZlbG9jaXR5ICkge1xyXG4gICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5LnZhbHVlID0gdGhpcy52ZWxvY2l0eVByb3BlcnR5LnZhbHVlLmNvcHkoKS5zZXRZKCBDb2xsaXNpb25MYWJVdGlscy5jbGFtcERvd24oIHlWZWxvY2l0eSwgQ29sbGlzaW9uTGFiQ29uc3RhbnRzLk1JTl9WRUxPQ0lUWSApICk7XHJcbiAgfVxyXG59XHJcblxyXG5jb2xsaXNpb25MYWIucmVnaXN0ZXIoICdCYWxsJywgQmFsbCApO1xyXG5leHBvcnQgZGVmYXVsdCBCYWxsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MsV0FBVyxNQUFNLDBDQUEwQztBQUNsRSxPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBQ2hELE9BQU9DLHFCQUFxQixNQUFNLDZCQUE2QjtBQUMvRCxPQUFPQyxpQkFBaUIsTUFBTSx5QkFBeUI7QUFDdkQsT0FBT0MsU0FBUyxNQUFNLGdCQUFnQjtBQUN0QyxPQUFPQyxTQUFTLE1BQU0sZ0JBQWdCO0FBQ3RDLE9B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