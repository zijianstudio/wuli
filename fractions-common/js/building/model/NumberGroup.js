// Copyright 2018-2021, University of Colorado Boulder

/**
 * Represents a mixed or non-mixed fraction represented by numerator/denominator and optionally a whole number.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import fractionsCommon from '../../fractionsCommon.js';
import BuildingType from './BuildingType.js';
import Group from './Group.js';
import NumberSpot from './NumberSpot.js';
import NumberSpotType from './NumberSpotType.js';

// constants

// {number} - Controls for the sizing of the number group
const HORIZONTAL_SPACING = 18;
const FRACTIONAL_NUMBER_HEIGHT = 43;
const FRACTIONAL_NUMBER_WIDTH = 32;
const WHOLE_NUMBER_HEIGHT = 100;
const WHOLE_NUMBER_WIDTH = FractionsCommonConstants.WHOLE_FRACTIONAL_SIZE_RATIO * FRACTIONAL_NUMBER_WIDTH;
const VERTICAL_SPACING = 12;

// {Bounds2} - Of the spots, in an arbitrary coordinate frame
const SEPARATE_NUMERATOR_BOUNDS = Bounds2.rect( 0, 0, FRACTIONAL_NUMBER_WIDTH, FRACTIONAL_NUMBER_HEIGHT );
const SEPARATE_DENOMINATOR_BOUNDS = Bounds2.rect( 0, SEPARATE_NUMERATOR_BOUNDS.bottom + 2 * VERTICAL_SPACING, FRACTIONAL_NUMBER_WIDTH, FRACTIONAL_NUMBER_HEIGHT );
const SEPARATE_WHOLE_BOUNDS = Bounds2.rect( -WHOLE_NUMBER_WIDTH - HORIZONTAL_SPACING, ( 2 * FRACTIONAL_NUMBER_HEIGHT + 2 * VERTICAL_SPACING - WHOLE_NUMBER_HEIGHT ) / 2, WHOLE_NUMBER_WIDTH, WHOLE_NUMBER_HEIGHT );

// {Vector2} - Centers of the two "groups" of spots (mixed and unmixed)
const UNMIXED_CENTER = SEPARATE_NUMERATOR_BOUNDS.union( SEPARATE_DENOMINATOR_BOUNDS ).center;
const MIXED_CENTER = SEPARATE_NUMERATOR_BOUNDS.union( SEPARATE_DENOMINATOR_BOUNDS ).union( SEPARATE_WHOLE_BOUNDS ).center;

// {Bounds2} - "Centered" versions of the spot bounds for the "unmixed" case
const NUMERATOR_BOUNDS = SEPARATE_NUMERATOR_BOUNDS.shiftedXY( -UNMIXED_CENTER.x, -UNMIXED_CENTER.y );
const DENOMINATOR_BOUNDS = SEPARATE_DENOMINATOR_BOUNDS.shiftedXY( -UNMIXED_CENTER.x, -UNMIXED_CENTER.y );

// {Bounds2} - "Centered" versions of the spot bounds for the "mixed" case
const MIXED_NUMERATOR_BOUNDS = SEPARATE_NUMERATOR_BOUNDS.shiftedXY( -MIXED_CENTER.x, -MIXED_CENTER.y );
const MIXED_DENOMINATOR_BOUNDS = SEPARATE_DENOMINATOR_BOUNDS.shiftedXY( -MIXED_CENTER.x, -MIXED_CENTER.y );
const MIXED_WHOLE_BOUNDS = SEPARATE_WHOLE_BOUNDS.shiftedXY( -MIXED_CENTER.x, -MIXED_CENTER.y );

class NumberGroup extends Group {
  /**
   * @param {boolean} isMixedNumber
   * @param {Object} [options]
   */
  constructor( isMixedNumber, options ) {
    options = merge( {

      // {Property.<Range|null>}
      activeNumberRangeProperty: new Property( null )
    }, options );

    super( BuildingType.NUMBER );

    // @public {boolean}
    this.isMixedNumber = isMixedNumber;

    // @private {Property.<Range|null>}
    this.activeNumberRangeProperty = options.activeNumberRangeProperty;

    // @public {NumberSpot}
    this.numeratorSpot = new NumberSpot( this, NumberSpotType.NUMERATOR, isMixedNumber ? MIXED_NUMERATOR_BOUNDS : NUMERATOR_BOUNDS );

    // @public {NumberSpot}
    this.denominatorSpot = new NumberSpot( this, NumberSpotType.DENOMINATOR, isMixedNumber ? MIXED_DENOMINATOR_BOUNDS : DENOMINATOR_BOUNDS );

    // @public {NumberSpot|null}
    this.wholeSpot = isMixedNumber ? new NumberSpot( this, NumberSpotType.WHOLE, MIXED_WHOLE_BOUNDS ) : null;

    // @public {Array.<NumberSpot>}
    this.spots = [
      ...( isMixedNumber ? [ this.wholeSpot ] : [] ),
      this.numeratorSpot,
      this.denominatorSpot
    ];

    // @public {Property.<boolean>}
    this.isCompleteProperty = new DerivedProperty( this.spots.map( spot => spot.pieceProperty ), () => {
      return _.every( this.spots, spot => spot.pieceProperty.value !== null );
    } );

    // @public {Property.<boolean>}
    this.hasPiecesProperty = new DerivedProperty( this.spots.map( spot => spot.pieceProperty ), () => {
      return _.some( this.spots, spot => spot.pieceProperty.value !== null );
    } );

    // @public {Property.<boolean>}
    this.hasDoubleDigitsProperty = new DerivedProperty( [
      this.numeratorSpot.pieceProperty,
      this.denominatorSpot.pieceProperty
    ], ( numeratorPiece, denominatorPiece ) => {
      return ( numeratorPiece && numeratorPiece.number >= 10 ) ||
             ( denominatorPiece && denominatorPiece.number >= 10 );
    } );

    const allSpotsBounds = _.reduce( this.spots, ( bounds, spot ) => bounds.union( spot.bounds ), Bounds2.NOTHING );

    // @public {Property.<Bounds2>}
    this.allSpotsBoundsProperty = new DerivedProperty( [ this.hasDoubleDigitsProperty ], hasDoubleDigits => {
      const bounds = allSpotsBounds.copy();
      if ( hasDoubleDigits ) {
        bounds.maxX += 10;
        if ( !this.isMixedNumber ) {
          bounds.minX -= 10;
        }
      }
      return bounds;
    } );

    // @private {function}
    this.spotAllowedListener = this.updateAllowedSpots.bind( this );
    this.activeNumberRangeProperty.link( this.spotAllowedListener );
  }

  /**
   * The current "amount" of the entire group
   * @public
   * @override
   *
   * @returns {Fraction}
   */
  get totalFraction() {
    const fraction = new Fraction( this.wholeSpot && this.wholeSpot.pieceProperty.value ? this.wholeSpot.pieceProperty.value.number : 0, 1 );
    if ( this.numeratorSpot.pieceProperty.value && this.denominatorSpot.pieceProperty.value ) {
      fraction.add( new Fraction( this.numeratorSpot.pieceProperty.value.number, this.denominatorSpot.pieceProperty.value.number ) );
    }
    return fraction;
  }

  /**
   * The center positions of every "container" in the group.
   * @public
   * @override
   *
   * @returns {Array.<Vector2>}
   */
  get centerPoints() {
    return [ this.positionProperty.value ];
  }

  /**
   * Updates whether each spot is marked as "normal" or "cannot drop a piece on it".
   * @private
   */
  updateAllowedSpots() {
    if ( this.isMixedNumber ) {
      const range = this.activeNumberRangeProperty.value;

      this.numeratorSpot.showNotAllowedProperty.value = range === null ? false : !this.canPlaceNumberInSpot( range.min, this.numeratorSpot );
      this.denominatorSpot.showNotAllowedProperty.value = range === null ? false : !this.canPlaceNumberInSpot( range.max, this.denominatorSpot );
      this.wholeSpot.showNotAllowedProperty.value = range === null ? false : !this.canPlaceNumberInSpot( range.min, this.wholeSpot );
    }
  }

  /**
   * Returns whether it would be legal, given the current state, to place a number piece with the given number into
   * the given spot.
   * @public
   *
   * @param {number} number
   * @param {NumberSpot} spot
   * @returns {boolean}
   */
  canPlaceNumberInSpot( number, spot ) {
    // NOTE: Intellij formatting really mucks up things if this is simplified to one boolean expression. It's left in
    // this more verbose form so the nesting is more understandable.

    if ( spot.pieceProperty.value !== null ) {
      return false;
    }

    if ( this.isMixedNumber ) {
      if ( spot === this.denominatorSpot && this.numeratorSpot.pieceProperty.value !== null && this.numeratorSpot.pieceProperty.value.number >= number ) {
        return false;
      }
      if ( spot === this.numeratorSpot && this.denominatorSpot.pieceProperty.value !== null && this.denominatorSpot.pieceProperty.value.number <= number ) {
        return false;
      }

      // Don't allow 1s here as there is no valid choice
      if ( spot === this.denominatorSpot && number === 1 ) {
        return false;
      }

      // Don't allow putting 2-digit numbers in the wholes spot.
      if ( spot === this.wholeSpot && number >= 10 ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Whether this group contains any pieces.
   * @public
   * @override
   *
   * @returns {boolean}
   */
  hasAnyPieces() {
    return _.some( this.spots, spot => spot.pieceProperty.value !== null );
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.activeNumberRangeProperty.unlink( this.spotAllowedListener );

    super.dispose();
  }
}

fractionsCommon.register( 'NumberGroup', NumberGroup );
export default NumberGroup;
