// Copyright 2018-2020, University of Colorado Boulder

/**
 * Supertype for different types of groups (containers of pieces in the play area)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Animator from '../../common/model/Animator.js';
import fractionsCommon from '../../fractionsCommon.js';

class Group {
  /**
   * @param {BuildingType} type
   */
  constructor( type ) {

    // @public {BuildingType}
    this.type = type;

    // @public
    this.positionProperty = new Vector2Property( Vector2.ZERO );

    // @public {Property.<number>} - Applies only while out in the play area (being animated or dragged)
    this.scaleProperty = new NumberProperty( 1 );

    // @public {Emitter} - Emitted when containers/pieces change
    this.changedEmitter = new Emitter();

    // @public {Property.<boolean>} - Whether the group is being moved (not by the user)
    this.isAnimatingProperty = new BooleanProperty( false );

    // @public {Property.<Target|null>} - The target, if any, that the user is holding this group over.
    this.hoveringTargetProperty = new Property( null );

    // @public {Animator} - Responsible for animating the main properties of this group.
    this.animator = new Animator( {
      positionProperty: this.positionProperty,
      scaleProperty: this.scaleProperty,
      isAnimatingProperty: this.isAnimatingProperty
    } );

    // Keep our hover target up-to-date (no need to unlink, as we own the given Property)
    this.hoveringTargetProperty.lazyLink( ( newTarget, oldTarget ) => {
      oldTarget && oldTarget.hoveringGroups.remove( this );
      newTarget && newTarget.hoveringGroups.push( this );
    } );

    // @private {boolean}
    this.isDisposed = false;
  }

  /**
   * The current "amount" of the entire group
   * @public
   *
   * @returns {Fraction}
   */
  get totalFraction() {
    throw new Error( 'abstract method' );
  }

  /**
   * The center positions of every "container" in the group.
   * @public
   *
   * @returns {Array.<Vector2>}
   */
  get centerPoints() {
    throw new Error( 'abstract method' );
  }

  /**
   * Whether this group contains any pieces.
   * @public
   *
   * @returns {boolean}
   */
  hasAnyPieces() {
    throw new Error( 'abstract method' );
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    this.animator.step( dt );
  }

  /**
   * Clears some associated temporary properties (that isn't a full reset), particularly before it is pulled from a
   * stack.
   * @public
   */
  clear() {
    this.scaleProperty.reset();
  }

  /**
   * Releases references.
   * @public
   */
  dispose() {
    assert && assert( !this.isDisposed );

    this.isDisposed = true;
  }
}

fractionsCommon.register( 'Group', Group );
export default Group;
