// Copyright 2018-2020, University of Colorado Boulder

/**
 * A movable number "piece" that can be combined/placed into groups.
 *
 * NOTE: The coordinate frame of pieces are always where the origin of this piece is at its centroid.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Animator from '../../common/model/Animator.js';
import fractionsCommon from '../../fractionsCommon.js';

// constants
const NUMBER_HEIGHT = 75;
const NUMBER_SINGLE_DIGIT_WIDTH = 54;
const NUMBER_DOUBLE_DIGIT_WIDTH = 80;

class NumberPiece {
  /**
   * @param {number} number
   */
  constructor( number ) {

    // @public {number}
    this.number = number;

    // @public - Applies only while out in the play area (being animated or dragged)
    this.positionProperty = new Vector2Property( Vector2.ZERO );

    // @public {Property.<number>} - Applies only while out in the play area (being animated or dragged)
    this.scaleProperty = new NumberProperty( 1 );

    // @public {Property.<boolean>}
    this.isUserControlledProperty = new BooleanProperty( false );

    // @public {Property.<boolean>}
    this.isAnimatingProperty = new BooleanProperty( false );

    // @public {Animator}
    this.animator = new Animator( {
      positionProperty: this.positionProperty,
      scaleProperty: this.scaleProperty,
      isAnimatingProperty: this.isAnimatingProperty
    } );

    // @public {Bounds2}
    this.bounds = Bounds2.point( 0, 0 ).dilatedXY( ( number >= 10 ? NUMBER_DOUBLE_DIGIT_WIDTH : NUMBER_SINGLE_DIGIT_WIDTH ) / 2, NUMBER_HEIGHT / 2 );
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
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    this.animator.step( dt );
  }
}

fractionsCommon.register( 'NumberPiece', NumberPiece );
export default NumberPiece;