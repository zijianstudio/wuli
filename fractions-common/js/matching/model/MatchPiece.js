// Copyright 2019-2020, University of Colorado Boulder

/**
 * A draggable piece (with an associated fraction). May be a fractional representation or a shape representation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import Animator from '../../common/model/Animator.js';
import fractionsCommon from '../../fractionsCommon.js';

class MatchPiece {
  /**
   * @param {Fraction} fraction
   * @param {Array.<FilledPartition>|null} filledPartitions - If null, this should be displayed as a numeric fraction
   * @param {boolean} hasMixedNumbers
   * @param {boolean} hasGreaterThanOne
   * @param {Object} [options]
   */
  constructor( fraction, filledPartitions, hasMixedNumbers, hasGreaterThanOne, options ) {

    options = merge( {
      // {function} - Callbacks for when the piece is grabbed and/or dropped
      grab: _.identity,
      drop: _.identity
    }, options );

    // @public {Fraction}
    this.fraction = fraction;

    // @public {Array.<FilledPartition>|null}
    this.filledPartitions = filledPartitions;

    // @public {boolean}
    this.hasMixedNumbers = hasMixedNumbers;
    this.hasGreaterThanOne = hasGreaterThanOne;

    // @public {function}
    this.grab = options.grab;
    this.drop = options.drop;

    // @public {Bounds2|null} - Written by view elements so that relative positioning can be done
    this.localBounds = null;

    // @public - To be updated by the view when its position changes (usually just initially)
    this.positionProperty = new Vector2Property( Vector2.ZERO );

    // @public {Property.<number>]}
    this.scaleProperty = new NumberProperty( 1 );

    // @public {Property.<MatchSpot|null>}
    this.spotProperty = new Property( null );

    // @public {Property.<boolean>} - Whether the group is being moved (not by the user)
    this.isAnimatingProperty = new BooleanProperty( false );

    // @public {Animator} - Responsible for animating the main properties of this piece.
    this.animator = new Animator( {
      positionProperty: this.positionProperty,
      scaleProperty: this.scaleProperty,
      isAnimatingProperty: this.isAnimatingProperty
    } );

    // @public {number} - The scale that will be used to place it in a target. This can be modified if things need to
    // be scaled down more.
    this.targetScale = this.getIdealTargetScale();
  }

  /**
   * Creates a copy of this MatchPiece (without the grab/drop/other options)
   * @public
   *
   * @returns {MatchPiece}
   */
  copy() {
    return new MatchPiece( this.fraction, this.filledPartitions, this.hasMixedNumbers, this.hasGreaterThanOne );
  }

  /**
   * Returns the color of the given piece (used for the chart).
   * @public
   *
   * @returns {ColorDef}
   */
  getColor() {
    return this.filledPartitions ? this.filledPartitions[ 0 ].color : 'black';
  }

  /**
   * Returns the ending scale size for residing in a target.
   * @public
   *
   * @returns {number}
   */
  getIdealTargetScale() {
    return this.filledPartitions ? 0.5 : 0.7;
  }

  /**
   * Moves this piece to the given spot (with animation).
   * @public
   *
   * @param {MatchSpot} spot
   * @param {Object} [options]
   */
  moveToSpot( spot, options ) {
    spot.attachPiece( this );

    let position = spot.positionProperty.value;

    // Pieces should not rely on their center for positioning on the scale.
    // See https://github.com/phetsims/fractions-common/issues/87
    if ( spot.isScale && this.localBounds ) {
      position = position.minus( this.localBounds.centerBottom );

      // Because bounds on Text is bad, shift down fractional representations by a bit
      if ( !this.filledPartitions ) {
        position = position.plusXY( 0, 8 );
      }
    }

    options = merge( {
      position: position,
      scale: 1,
      animationInvalidationProperty: this.spotProperty
    }, options );

    this.animator.animateTo( options );
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

fractionsCommon.register( 'MatchPiece', MatchPiece );
export default MatchPiece;
