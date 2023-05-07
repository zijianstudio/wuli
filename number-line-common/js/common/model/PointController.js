// Copyright 2020-2022, University of Colorado Boulder

/**
 * A PointController is a model element that is used to control points on a number line, but can exist independently
 * too. In some use cases, it will create a point on a number line when it gets within a certain distance of it.  In
 * other use cases, it is permanently locked to a number line and a point that it is controlling.
 *
 * One implication of the fact that point controllers can attach to and detach from number lines is that sometimes,
 * despite the name, an instance can be in a state where it isn't controlling any points.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Saurabh Totey
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import NumberLinePoint from '../../../../number-line-common/js/common/model/NumberLinePoint.js';
import merge from '../../../../phet-core/js/merge.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import numberLineCommon from '../../numberLineCommon.js';
import LockToNumberLine from './LockToNumberLine.js';

// constants
const AVERAGE_ANIMATION_SPEED = 1000; // screen coordinates per second
const MIN_ANIMATION_TIME = 0.3; // in seconds

class PointController {

  /**
   * @param {Object} [options]
   * @public
   */
  constructor( options ) {

    options = merge( {

      // color used when represented in the view
      color: 'black',

      // {number} - offset in model coords from a horizontal number line when controlling a point
      offsetFromHorizontalNumberLine: 50,

      // {number} - offset in model coords from a vertical number line when controlling a point
      offsetFromVerticalNumberLine: 52,

      // {number} - scale of controller node when animated back into box
      scaleInBox: 1.0,

      // {LockToNumberLine} - Controls whether this point controller is, or can, lock to the number line.
      lockToNumberLine: LockToNumberLine.WHEN_CLOSE,

      // {NumberLine[]} - the number lines on which this controller can add points, can be empty if this controller
      // never adds or removes points from the number line
      numberLines: [],

      // {NumberLinePoint[]} - the points on the number line that are currently being controlled, can be empty
      numberLinePoints: [],

      // {boolean} - controls whether movements of the controlled number line point(s) should cause this point
      // controller to also move
      bidirectionalAssociation: true

    }, options );

    // @private
    this.offsetFromHorizontalNumberLine = options.offsetFromHorizontalNumberLine;
    this.offsetFromVerticalNumberLine = options.offsetFromVerticalNumberLine;
    this.lockToNumberLine = options.lockToNumberLine;
    this.bidirectionalAssociation = options.bidirectionalAssociation;

    // @public (read-only) {NumberLine[]}
    this.numberLines = options.numberLines;

    // @public (read-only) {Vector2Property} - position of this point in model space
    this.positionProperty = new Vector2Property( Vector2.ZERO, {

      // Allowing reentry is necessary because of two-way position relationship with number line points.
      reentrant: true
    } );

    // @private - the scale of this point controller when stored away
    this.scaleInBox = options.scaleInBox;

    // @public (read-only) {NumberProperty} - scale of this point
    this.scaleProperty = new NumberProperty( this.scaleInBox );

    // @public {BooleanProperty} - indicates whether this is being dragged by the user
    this.isDraggingProperty = new BooleanProperty( false );

    // @public (read-only) {Animation|null} - tracks any animation that is currently in progress
    this.inProgressAnimationProperty = new Property( null );

    // @public (read-only) {ObservableArrayDef.<NumberLinePoint>} - points on the number line that this controls
    this.numberLinePoints = createObservableArray();

    // Add the initial number line points.
    options.numberLinePoints.forEach( point => { this.associateWithNumberLinePoint( point ); } );

    // @public (read-only) {Color}
    this.color = options.color;

    // Monitor the number line(s) with which this point controller is associated for changes that require an update to
    // the point controller's position.
    const positionChangeUpdaters = []; // {Multilink}
    options.numberLines.forEach( numberLine => {
      const multilink = Multilink.multilink(
        [ numberLine.displayedRangeProperty, numberLine.centerPositionProperty ],
        () => {
          if ( this.lockToNumberLine !== LockToNumberLine.NEVER && this.numberLinePoints.length === 1 ) {
            const relevantPoint = this.numberLinePoints.find( point => point.numberLine === numberLine );
            relevantPoint && this.setPositionRelativeToPoint( relevantPoint );
          }
        }
      );
      positionChangeUpdaters.push( multilink );
    } );

    assert && assert( positionChangeUpdaters.length === options.numberLines.length );

    // Set our number line points to match this point controller's dragging state.
    this.isDraggingProperty.link( isDragging => {
      this.numberLinePoints.forEach( point => {
        point.isDraggingProperty.value = isDragging;
      } );
    } );

    // @private - clean up links to avoid memory leaks
    this.disposePointController = () => {
      positionChangeUpdaters.forEach( positionChangeUpdater => {
        positionChangeUpdater.dispose();
      } );
    };
  }

  /**
   * Clean up any linkages or other associations that could cause memory leaks.
   * @public
   */
  dispose() {

    // Disassociate with all number line points.  This will remove any listeners that are observing these points.
    this.clearNumberLinePoints();

    // Remove the linkages created in the constructor.
    this.disposePointController();
  }

  /**
   * Returns whether this point controller is controlling one or more number line points.
   * @returns {boolean}
   * @public
   */
  isControllingNumberLinePoint() {
    return this.numberLinePoints.length > 0;
  }

  /**
   * Associate this controller with a point on the number line.
   * @param {NumberLinePoint} numberLinePoint
   * @public
   */
  associateWithNumberLinePoint( numberLinePoint ) {
    this.numberLinePoints.add( numberLinePoint );

    if ( this.bidirectionalAssociation ) {
      const positionUpdater = () => {
        this.setPositionRelativeToPoint( numberLinePoint );
      };
      numberLinePoint.valueProperty.link( positionUpdater );
      const pointRemovedListener = removedNumberLinePoint => {
        if ( removedNumberLinePoint === numberLinePoint ) {
          this.numberLinePoints.removeItemRemovedListener( pointRemovedListener );
          numberLinePoint.valueProperty.unlink( positionUpdater );
        }
      };
      this.numberLinePoints.addItemRemovedListener( pointRemovedListener );
    }

    // Set initial drag state, there is a link elsewhere that will make subsequent updates.
    numberLinePoint.isDraggingProperty.value = this.isDraggingProperty.value;

    assert && assert(
      this.numberLinePoints.length === _.uniq( this.numberLinePoints.map( point => point.numberLine ) ).length,
      'There shouldn\'t be more than one associated point from the same number line'
    );
  }

  /**
   * Remove the association between this point controller and a number line point.  This does not remove the point
   * from the number line.
   * @param {NumberLinePoint} numberLinePoint
   * @public
   */
  dissociateFromNumberLinePoint( numberLinePoint ) {

    // Verify that the point is being controlled.
    assert && assert(
      this.numberLinePoints.indexOf( numberLinePoint ) >= 0,
      'point is not controlled by this point controller'
    );

    // Since the point will no longer be controlled, it can't be dragging.
    numberLinePoint.isDraggingProperty.value = false;

    // Remove the point from the list of controlled points.
    this.numberLinePoints.remove( numberLinePoint );
  }

  /**
   * Remove the association between this controller and number line points that it was controlling.  Note that this
   * does NOT remove the points from the number line(s) - there is a different method for that.
   * @public
   */
  clearNumberLinePoints() {
    const controlledPoints = [ ...this.numberLinePoints ];
    controlledPoints.forEach( point => {
      this.dissociateFromNumberLinePoint( point );
    } );
  }

  /**
   * Remove all controlled points from the number line on which each one resides.
   * @public
   */
  removePointsFromNumberLines() {
    this.numberLinePoints.forEach( numberLinePoint => {
      numberLinePoint.numberLine.removePoint( numberLinePoint );
    } );
  }

  /**
   * The name for this method is essentially a list of actions, i.e. "remove, clear, and dispose the points".  It is a
   * convenience method that removes the points associated with this controller from any number lines that they are on,
   * clears the point from this point controller's observable array, and disposes the points.  These actions can happen
   * independently, but often go together, so this method just does the whole shebang.
   * @public
   */
  removeClearAndDisposePoints() {
    const controlledPoints = this.numberLinePoints.getArrayCopy();
    this.removePointsFromNumberLines();
    this.clearNumberLinePoints();
    controlledPoints.forEach( point => {
      point.dispose();
    } );
  }

  /**
   * Propose a new position to this point controller, may or may not actually update the position depending on whether
   * a point on the number line is being controlled and how that point moves.
   * @param {Vector2} proposedPosition
   * @public
   */
  proposePosition( proposedPosition ) {

    if ( this.isControllingNumberLinePoint() ) {
      this.numberLinePoints.forEach( point => {

        // Map the proposed position to a value on the number line.
        const proposedNumberLineValue = point.numberLine.modelPositionToValue( proposedPosition );

        if ( this.lockToNumberLine === LockToNumberLine.ALWAYS ) {
          point.proposeValue( proposedNumberLineValue );
        }
        else if ( this.lockToNumberLine === LockToNumberLine.NEVER ) {

          // This will update the number line point and move it in the orientation of the number line.
          point.proposeValue( proposedNumberLineValue );

          // Move the point controller in the direction perpendicular to the number line.
          if ( point.numberLine.isHorizontal ) {
            this.positionProperty.value = new Vector2( this.positionProperty.value.x, proposedPosition.y );
          }
          else {
            this.positionProperty.value = new Vector2( proposedPosition.x, this.positionProperty.value.y );
          }
        }
        else if ( this.lockToNumberLine === LockToNumberLine.WHEN_CLOSE ) {

          // Determine whether to propose a new value for the point or to detach and remove the point.
          if ( point.numberLine.isWithinPointRemovalDistance( proposedPosition ) ) {
            point.proposeValue( proposedNumberLineValue );
          }
          else {
            point.numberLine.removePoint( point );
            this.dissociateFromNumberLinePoint( point );
          }
        }
      } );
    }
    else {

      assert && assert(
        this.lockToNumberLine !== LockToNumberLine.ALWAYS,
        'should not be in this situation if controller is always locked to a point'
      );

      if ( this.lockToNumberLine === LockToNumberLine.WHEN_CLOSE ) {

        // Check if a point should be created and added based on the proposed position.
        const numberLinesInRange = this.numberLines.filter( numberLine => numberLine.isWithinPointCreationDistance( proposedPosition ) );

        const constrainedValues = numberLinesInRange.map(
          numberLine => numberLine.getConstrainedValue( numberLine.modelPositionToValue( proposedPosition ) )
        );
        if ( numberLinesInRange.length > 0 ) {
          numberLinesInRange.forEach( ( numberLine, i ) => {
            const numberLinePoint = new NumberLinePoint( numberLine, {
              initialValue: constrainedValues[ i ],
              initialColor: this.color,
              controller: this
            } );
            numberLine.addPoint( numberLinePoint );
            this.associateWithNumberLinePoint( numberLinePoint );
          } );
        }
        else {

          // Just accept the proposed position, no other action is necessary.
          this.goToPosition( proposedPosition );
        }
      }
      else {

        // No restraint is needed, be free and go wherever you want.
        this.goToPosition( proposedPosition );
      }
    }
  }

  /**
   * Go to the specified position, either immediately or via an animation.
   * @param {Vector2} position
   * @param {boolean} [animate]
   * @public
   */
  goToPosition( position, animate = false ) {

    // If there is an active animation, stop it.
    this.stopAnimation();

    if ( animate ) {

      // Animate the point controller's journey to the provided position.
      const animation = new Animation( {
        duration: Math.max(
          MIN_ANIMATION_TIME,
          this.positionProperty.value.distance( position ) / AVERAGE_ANIMATION_SPEED
        ),
        targets: [

          // scale
          {
            to: this.scaleInBox,
            property: this.scaleProperty,
            easing: Easing.CUBIC_IN_OUT
          },

          // position
          {
            property: this.positionProperty,
            easing: Easing.CUBIC_IN_OUT,
            to: position
          }
        ]
      } );
      this.inProgressAnimationProperty.value = animation;
      animation.start();

      // When the animation is finished, clear the Property that is keeping track of it.
      animation.finishEmitter.addListener( () => {
        this.inProgressAnimationProperty.value = null;
      } );
      animation.stopEmitter.addListener( () => {
        this.inProgressAnimationProperty.value = null;
      } );
    }
    else {

      // Go straight to the specified position.
      this.positionProperty.value = position;
    }
  }

  /**
   * Given a number line point's position in model space, set this point controller to that value, but offset from the
   * number line.
   * @param {NumberLinePoint} point
   * @public
   */
  setPositionRelativeToPoint( point ) {
    const pointPosition = point.getPositionInModelSpace();
    let x;
    let y;
    const lockedAlwaysOrWhenClose = this.lockToNumberLine === LockToNumberLine.ALWAYS ||
                                    this.lockToNumberLine === LockToNumberLine.WHEN_CLOSE;
    if ( point.numberLine.isHorizontal ) {
      x = pointPosition.x;
      if ( lockedAlwaysOrWhenClose ) {
        y = pointPosition.y + this.offsetFromHorizontalNumberLine;
      }
      else {
        y = this.positionProperty.value.y;
      }
    }
    else {
      y = pointPosition.y;
      if ( lockedAlwaysOrWhenClose ) {
        x = pointPosition.x + this.offsetFromVerticalNumberLine;
      }
      else {
        x = this.positionProperty.value.x;
      }
    }
    this.goToPosition( new Vector2( x, y ) );
  }

  /**
   * Stop the current animation if one is happening, do nothing if not.
   * @public
   */
  stopAnimation() {
    if ( this.inProgressAnimationProperty.value ) {
      this.inProgressAnimationProperty.value.stop();
      this.inProgressAnimationProperty.value = null;
    }
  }

  /**
   * Restore initial state.
   * @public
   */
  reset() {
    this.clearNumberLinePoints();
    this.stopAnimation();
    this.positionProperty.reset();
    this.scaleProperty.reset();
  }
}

numberLineCommon.register( 'PointController', PointController );
export default PointController;
