// Copyright 2013-2021, University of Colorado Boulder

/**
 * Base class for all objects that can be placed on the balance.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import balancingAct from '../../balancingAct.js';

// constants
const MIN_ANIMATION_VELOCITY = 3; // In meters/sec.
const MAX_REMOVAL_ANIMATION_DURATION = 0.75; // In seconds.

// TODO: JSDoc is missing in many places, see https://github.com/phetsims/balancing-act/issues/96
class Mass extends PhetioObject {

  constructor( massValue, initialPosition, isMystery, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED,
      phetioType: ReferenceIO( IOType.ObjectIO ),
      phetioState: false
    }, options );

    // instrumented so it can be phetioDynamicElement: true for PhetioGroups
    super( options );

    // Property that indicates whether this mass is currently user controlled, i.e. being moved around by the user.
    this.userControlledProperty = new Property( false );

    // Property that contains the position in model space.  By convention for this simulation, the position of a mass is
    // the center bottom of the model object.
    this.positionProperty = new Property( initialPosition );

    // Property that contains the rotation angle, in radians, of the model element.  By convention for this simulation,
    // the point of rotation is considered to be the center bottom of the model element.
    this.rotationAngleProperty = new Property( 0 );

    // Property that tracks whether this mass is on the plank, changes to which may initiate changes in the visual
    // depiction of the mass.
    this.onPlankProperty = new Property( false );

    // Boolean property that indicates whether this model element is currently animating.  At the time of this writing,
    // the only animation supported is a simple linear motion to a preset point.
    this.animatingProperty = new Property( false );

    //------------------------------------------------------------------------
    // Externally used (i.e. public) attributes that don't need to be properties.
    //------------------------------------------------------------------------
    this.massValue = massValue;
    this.animationDestination = null;
    this.animationMotionVector = null;
    this.animationScale = 1;
    this.expectedAnimationTime = 0;
    this.isMystery = isMystery;

    // This property is used to keep track of a function that is used to to
    // add/remove this mass from a list of user-controlled masses.
    this.userControlledMassesUpdater = null;

    // Since not all objects are symmetrical, some may need to have an offset
    // that indicates where their center of mass is when placed on a balance.
    // This is the horizontal offset from the center of the shape or image.
    this.centerOfMassXOffset = 0;

  }

  /**
   * @public
   */
  reset() {
    this.userControlledProperty.reset();
    this.positionProperty.reset();
    this.rotationAngleProperty.reset();
    this.onPlankProperty.reset();
    this.animatingProperty.reset();
  }

  /**
   * @public
   */
  translate( translationVector ) {
    this.positionProperty.set( this.positionProperty.get().plus( translationVector ) );
  }

  /**
   * @public
   */
  getMiddlePoint() { throw new Error( 'getMiddlePoint should be implemented in descendant types.' ); }

  /**
   * @public
   */
  initiateAnimation() {

    // Calculate velocity.  A higher velocity is used if the model element has a long way to travel, otherwise it
    // takes too long.
    const position = this.positionProperty.get();
    const velocity = Math.max(
      position.distance( this.animationDestination ) / MAX_REMOVAL_ANIMATION_DURATION,
      MIN_ANIMATION_VELOCITY
    );
    this.expectedAnimationTime = position.distance( this.animationDestination ) / velocity; // In seconds.

    // Calculate the animation motion vector.
    this.animationMotionVector = new Vector2( velocity, 0 );
    const animationAngle = Math.atan2(
      this.animationDestination.y - position.y,
      this.animationDestination.x - position.x
    );
    this.animationMotionVector = this.animationMotionVector.rotated( animationAngle );

    // Update the property that tracks the animation state.
    this.animatingProperty.set( true );
  }

  /**
   * @public
   */
  step( dt ) {
    if ( this.animatingProperty.get() ) {

      // Do a step of the linear animation towards the destination.
      if ( this.positionProperty.get().distance( this.animationDestination ) >= this.animationMotionVector.magnitude * dt ) {

        // Perform next step of animation.
        this.translate( this.animationMotionVector.times( dt ) );
        this.animationScale = Math.max( this.animationScale - ( dt / this.expectedAnimationTime ) * 0.9, 0.1 );
      }
      else {

        // Close enough - animation is complete.
        this.positionProperty.set( this.animationDestination );
        this.animatingProperty.set( false );
        this.animationScale = 1;
      }
    }
  }

  /**
   * @public
   */
  createCopy() { throw new Error( 'createCopy should be implemented in descendant types.' ); }
}

balancingAct.register( 'Mass', Mass );

export default Mass;