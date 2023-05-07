// Copyright 2017-2022, University of Colorado Boulder

/**
 * A specific challenge for the game
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import dimensionForEach from '../../../../phet-core/js/dimensionForEach.js';
import dimensionMap from '../../../../phet-core/js/dimensionMap.js';
import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import areaModelCommon from '../../areaModelCommon.js';
import OrientationPair from '../../common/model/OrientationPair.js';
import Polynomial from '../../common/model/Polynomial.js';
import Term from '../../common/model/Term.js';
import GenericArea from '../../generic/model/GenericArea.js';
import Entry from './Entry.js';
import EntryDisplayType from './EntryDisplayType.js';
import EntryStatus from './EntryStatus.js';
import EntryType from './EntryType.js';
import GameState from './GameState.js';
import InputMethod from './InputMethod.js';

class AreaChallenge {
  /**
   * @param {AreaChallengeDescription} description
   */
  constructor( description ) {

    // Reassign a permuted version so we don't have a chance to screw up referencing the wrong thing
    description = description.getPermutedDescription();

    // @public {AreaChallengeDescription}
    this.description = description;

    // @public {Property.<GameState>}
    this.stateProperty = new Property( GameState.FIRST_ATTEMPT );

    // @public {GenericArea} - used in _.property( 'area' )
    this.area = new GenericArea( description.layout, description.allowExponents );

    // @public {OrientationPair.<Array.<Term>>} - The actual partition sizes
    this.partitionSizes = OrientationPair.create( orientation => AreaChallenge.generatePartitionTerms(
      description.partitionTypes.get( orientation ).length,
      description.allowExponents
    ) );

    // @public {OrientationPair.<Array.<Entry>>} Entries for the size of each partition.
    this.partitionSizeEntries = OrientationPair.create( orientation => this.partitionSizes.get( orientation ).map( ( size, index ) => new Entry( size, {
      type: description.partitionTypes.get( orientation )[ index ],
      displayType: EntryType.toDisplayType( description.partitionTypes.get( orientation )[ index ] ),
      inputMethod: description.numberOrVariable( InputMethod.CONSTANT, InputMethod.TERM ),
      numberOfDigits: description.numberOrVariable( description.partitionTypes.get( orientation ).length - index, 1 )
    } ) ) );

    // @public {OrientationPair.<Term>|null} - If we're non-unique, it will hold the 0th-place coefficients (e.g. for
    // x+3 times x-7, it would hold the terms 3 and -7). It will always be two 1st-order polynomials times each other.
    this.swappableSizes = this.description.unique ? null : this.partitionSizes.map( _.property( 1 ) );

    // @public {OrientationPair.<Entry>|null} - If we're non-unique, it will hold the 0th-place entries (e.g. for
    // x+3 times x-7, it would hold the entries for 3 and -7). It will always be two 1st-order polynomials times each
    // other.
    this.swappableEntries = this.description.unique ? null : this.partitionSizeEntries.map( _.property( 1 ) );

    // @public {OrientationPair.<Array.<Property.<Term|null>>>} - Basically the values of the partitionSizeEntries, but
    // null if the entry's status is 'error'.
    this.nonErrorPartitionSizeProperties = OrientationPair.create( orientation => this.partitionSizeEntries.get( orientation ).map( _.property( 'nonErrorValueProperty' ) ) );

    // @public {Array.<Array.<Term|null>>}
    this.partialProductSizes = this.partitionSizes.vertical.map( verticalSize => this.partitionSizes.horizontal.map( horizontalSize => horizontalSize.times( verticalSize ) ) );

    // @public {Array.<Array.<Entry>>}
    this.partialProductSizeEntries = dimensionMap( 2, this.partialProductSizes, ( size, verticalIndex, horizontalIndex ) => {

      // The number of allowed digits in entry. Basically it's the sum of vertical and horizontal (multiplication sums
      // the number of digits). The far-right/bototm partition gets 1 digit, and successively higher numbers of digits
      // are used for consecutive partitions.
      const numbersDigits = description.partitionTypes.vertical.length + description.partitionTypes.horizontal.length - verticalIndex - horizontalIndex;
      const type = description.productTypes[ verticalIndex ][ horizontalIndex ];
      const entry = new Entry( size, {
        type: type,
        displayType: EntryType.toDisplayType( type ),
        inputMethod: description.numberOrVariable( InputMethod.CONSTANT, InputMethod.TERM ),

        // Always let them put in 1 more digit than the actual answer, see https://github.com/phetsims/area-model-common/issues/63
        numberOfDigits: description.numberOrVariable( numbersDigits, 2 ) + 1
      } );
      // Link up if dynamic
      if ( type === EntryType.DYNAMIC ) {

        // No unlink needed, since this is just for setup. We have a fixed number of these.
        Multilink.multilink( [
          this.nonErrorPartitionSizeProperties.horizontal[ horizontalIndex ],
          this.nonErrorPartitionSizeProperties.vertical[ verticalIndex ]
        ], ( horizontal, vertical ) => {
          // horizontal or vertical could be null (resulting in null)
          entry.valueProperty.value = horizontal && vertical && horizontal.times( vertical );
        } );
      }
      return entry;
    } );

    // We need at least a certain number of partitions to reach x^2 in the total (either at least an x^2 on one side,
    // or two x-powers on each side).
    const hasXSquaredTotal = ( this.partitionSizes.horizontal.length + this.partitionSizes.vertical.length ) >= 4;

    // @public {OrientationPair.<Polynomial>}
    this.totals = OrientationPair.create( orientation => new Polynomial( this.partitionSizes.get( orientation ) ) );

    // @public {OrientationPair.<Property.<Polynomial|null>>}
    this.totalProperties = OrientationPair.create( orientation => new Property( this.totals.get( orientation ) ) );

    // @public {Polynomial}
    this.total = this.totals.horizontal.times( this.totals.vertical );

    const totalOptions = {
      inputMethod: description.numberOrVariable( InputMethod.CONSTANT, hasXSquaredTotal ? InputMethod.POLYNOMIAL_2 : InputMethod.POLYNOMIAL_1 ),
      numberOfDigits: ( description.allowExponents ? 2 : ( this.partitionSizes.horizontal.length + this.partitionSizes.vertical.length ) )
    };

    // @private {InputMethod}
    this.totalInputMethod = totalOptions.inputMethod;

    // @public {Entry}
    this.totalConstantEntry = new Entry( this.total.getTerm( 0 ), merge( {
      correctValue: this.total.getTerm( 0 ),
      type: description.totalType,
      displayType: EntryType.toDisplayType( description.totalType )
    }, totalOptions ) );
    this.totalXEntry = new Entry( this.total.getTerm( 1 ), merge( {
      correctValue: this.total.getTerm( 1 ),
      type: description.numberOrVariable( EntryType.GIVEN, description.totalType ),
      displayType: description.numberOrVariable( EntryDisplayType.READOUT, EntryType.toDisplayType( description.totalType ) )
    }, totalOptions ) );
    this.totalXSquaredEntry = new Entry( this.total.getTerm( 2 ), merge( {
      correctValue: this.total.getTerm( 2 ),
      type: description.numberOrVariable( EntryType.GIVEN, description.totalType ),
      displayType: description.numberOrVariable( EntryDisplayType.READOUT, EntryType.toDisplayType( description.totalType ) )
    }, totalOptions ) );

    // @public {Array.<Entry>} - All of the coefficient entries that are used by this challenge.
    this.totalCoefficientEntries = [ this.totalConstantEntry ];
    if ( totalOptions.inputMethod !== InputMethod.CONSTANT ) {
      this.totalCoefficientEntries.push( this.totalXEntry );
    }
    if ( totalOptions.inputMethod === InputMethod.POLYNOMIAL_2 ) {
      this.totalCoefficientEntries.push( this.totalXSquaredEntry );
    }

    // @public {Property.<Polynomial|null>}
    this.totalProperty = new DerivedProperty(
      [ this.totalConstantEntry.valueProperty, this.totalXEntry.valueProperty, this.totalXSquaredEntry.valueProperty ],
      ( constant, x, xSquared ) => {
        const terms = [ constant, x, xSquared ].filter( term => term !== null );
        return terms.length ? new Polynomial( terms ) : null;
      } );

    // All of the entries for the challenge - Not including the polynomial "total" coefficient entries
    const mainEntries = this.partitionSizeEntries.horizontal
      .concat( this.partitionSizeEntries.vertical )
      .concat( _.flatten( this.partialProductSizeEntries ) );
    const checkingNotificationProperties = mainEntries.map( _.property( 'valueProperty' ) )
      .concat( this.totalCoefficientEntries.map( _.property( 'statusProperty' ) ) );

    // @public {Property.<boolean>} - Whether the check button should be enabled
    this.allowCheckingProperty = new DerivedProperty( checkingNotificationProperties, () => {
      const allDirtyCoefficients = _.every( this.totalCoefficientEntries, entry => entry.type === EntryType.EDITABLE && entry.statusProperty.value === EntryStatus.DIRTY );
      const hasNullMain = _.some( mainEntries, entry => entry.valueProperty.value === null && entry.type === EntryType.EDITABLE );
      return !hasNullMain && !allDirtyCoefficients;
    } );

    /*---------------------------------------------------------------------------*
    * Dynamic hooks
    *----------------------------------------------------------------------------*/

    // Now hook up dynamic parts, setting their values to null
    Orientation.enumeration.values.forEach( orientation => {
      if ( description.dimensionTypes.get( orientation ) === EntryType.DYNAMIC ) {
        const nonErrorProperties = this.nonErrorPartitionSizeProperties.get( orientation );
        Multilink.multilink( nonErrorProperties, () => {
          const terms = _.map( nonErrorProperties, 'value' ).filter( term => term !== null );
          const lostATerm = terms.length !== nonErrorProperties.length;
          this.totalProperties.get( orientation ).value = ( terms.length && !lostATerm ) ? new Polynomial( terms ) : null;
        } );
      }
    } );

    // @private {boolean} - Pick an arbitrary side to be wrong in particular variables 6-1 cases, see
    // https://github.com/phetsims/area-model-common/issues/42
    this.arbitraryNonUniqueWrongOrientation = dotRandom.nextBoolean() ? Orientation.HORIZONTAL : Orientation.VERTICAL;
  }

  /**
   * Returns a list of all of the editable properties that are incorrect.
   * @public
   *
   * @returns {Array.<Entry>}
   */
  getIncorrectEntries() {
    const incorrectEntries = [];

    function compareEntry( entry, expectedValue ) {
      if ( entry.valueProperty.value === null || !entry.valueProperty.value.equals( expectedValue ) ) {
        incorrectEntries.push( entry );
      }
    }

    // NOTE: Since the only non-unique case is variables 6-1, we just check our secondary properties.
    if ( !this.description.unique ) {
      // Logic described by https://github.com/phetsims/area-model-common/issues/39
      // Addendum to logic in https://github.com/phetsims/area-model-common/issues/42
      if ( this.hasNonUniqueBadMatch() ) {
        incorrectEntries.push( this.swappableEntries.get( this.arbitraryNonUniqueWrongOrientation ) );
      }
      else {
        if ( !this.nonUniqueHorizontalMatches() ) {
          incorrectEntries.push( this.swappableEntries.horizontal );
        }
        if ( !this.nonUniqueVerticalMatches() ) {
          incorrectEntries.push( this.swappableEntries.vertical );
        }
      }
    }
    else {
      this.partitionSizeEntries.horizontal.forEach( ( entry, index ) => {
        compareEntry( entry, this.partitionSizes.horizontal[ index ] );
      } );
      this.partitionSizeEntries.vertical.forEach( ( entry, index ) => {
        compareEntry( entry, this.partitionSizes.vertical[ index ] );
      } );
      dimensionForEach( 2, this.partialProductSizeEntries, ( entry, verticalIndex, horizontalIndex ) => {
        compareEntry( entry, this.partialProductSizes[ verticalIndex ][ horizontalIndex ] );
      } );

      compareEntry( this.totalConstantEntry, this.total.getTerm( 0 ) );
      if ( this.totalInputMethod !== InputMethod.CONSTANT ) {
        compareEntry( this.totalXEntry, this.total.getTerm( 1 ) );
      }
      if ( this.totalInputMethod === InputMethod.POLYNOMIAL_2 ) {
        compareEntry( this.totalXSquaredEntry, this.total.getTerm( 2 ) );
      }
    }

    return _.uniq( incorrectEntries ).filter( entry => entry.displayType === EntryDisplayType.EDITABLE );
  }

  /**
   * Returns whether our horizontal (secondary) partition size equals one of the expected (secondary) partition sizes.
   * @private
   *
   * @returns {boolean}
   */
  nonUniqueHorizontalMatches() {
    const actual = this.swappableEntries.horizontal.valueProperty.value;
    return actual !== null && ( actual.equals( this.swappableSizes.horizontal ) || actual.equals( this.swappableSizes.vertical ) );
  }

  /**
   * Returns whether our vertical (secondary) partition size equals one of the expected (secondary) partition sizes.
   * @private
   *
   * @returns {boolean}
   */
  nonUniqueVerticalMatches() {
    const actual = this.swappableEntries.vertical.valueProperty.value;

    return actual !== null && ( actual.equals( this.swappableSizes.horizontal ) || actual.equals( this.swappableSizes.vertical ) );
  }

  /**
   * Returns whether a permutation of our secondary partition sizes matches the expected sizes. Helpful for the case
   * where values can be swapped between positions.
   * @private
   *
   * @returns {boolean}
   */
  hasNonUniqueMatch() {
    const expected1 = this.swappableSizes.horizontal;
    const expected2 = this.swappableSizes.vertical;

    const actual1 = this.swappableEntries.horizontal.valueProperty.value;
    const actual2 = this.swappableEntries.vertical.valueProperty.value;

    return actual1 !== null && actual2 !== null &&
           ( ( actual1.equals( expected1 ) && actual2.equals( expected2 ) ) ||
             ( actual1.equals( expected2 ) && actual2.equals( expected1 ) ) );
  }

  /**
   * Returns whether both properties match one answer but not the other.
   * @private
   *
   * @returns {boolean}
   */
  hasNonUniqueBadMatch() {
    // Check for a case where both properties match one answer but not the other
    return this.nonUniqueHorizontalMatches() && this.nonUniqueVerticalMatches() && !this.hasNonUniqueMatch();
  }

  /**
   * Remove highlights for non-unique changes, see https://github.com/phetsims/area-model-common/issues/42
   * @private
   */
  checkNonUniqueChanges() {
    if ( !this.description.unique ) {
      if ( this.hasNonUniqueBadMatch() ) {
        this.swappableEntries.horizontal.statusProperty.value = EntryStatus.NORMAL;
        this.swappableEntries.vertical.statusProperty.value = EntryStatus.NORMAL;
      }
    }
  }

  /**
   * Shows the answers to the challenge.
   * @public
   */
  showAnswers() {
    // Match solutions for 6-1 variables, see https://github.com/phetsims/area-model-common/issues/42
    if ( !this.description.unique ) {
      let reversed = false;

      const expected1 = this.swappableSizes.horizontal;
      const expected2 = this.swappableSizes.vertical;

      const actual1Entry = this.swappableEntries.horizontal;
      const actual2Entry = this.swappableEntries.vertical;

      const actual1 = actual1Entry.valueProperty.value;
      const actual2 = actual2Entry.valueProperty.value;

      if ( actual1 && actual2 ) {
        const matches1 = actual1.equals( expected1 ) || actual1.equals( expected2 );
        const matches2 = actual2.equals( expected1 ) || actual2.equals( expected2 );

        if ( matches1 !== matches2 && ( actual1.equals( expected2 ) || actual2.equals( expected1 ) ) ) {
          reversed = true;
        }
      }

      if ( reversed ) {
        actual1Entry.valueProperty.value = expected2;
        actual2Entry.valueProperty.value = expected1;
        this.totalProperties.horizontal.value = this.totals.vertical;
        this.totalProperties.vertical.value = this.totals.horizontal;
      }
      else {
        actual1Entry.valueProperty.value = expected1;
        actual2Entry.valueProperty.value = expected2;
        this.totalProperties.horizontal.value = this.totals.horizontal;
        this.totalProperties.vertical.value = this.totals.vertical;
      }
      actual1Entry.statusProperty.value = EntryStatus.NORMAL;
      actual2Entry.statusProperty.value = EntryStatus.NORMAL;
    }
    else {
      this.partitionSizeEntries.horizontal.forEach( ( entry, index ) => {
        entry.valueProperty.value = this.partitionSizes.horizontal[ index ];
      } );
      this.partitionSizeEntries.vertical.forEach( ( entry, index ) => {
        entry.valueProperty.value = this.partitionSizes.vertical[ index ];
      } );

      this.totalProperties.horizontal.value = this.totals.horizontal;
      this.totalProperties.vertical.value = this.totals.vertical;
    }

    dimensionForEach( 2, this.partialProductSizeEntries, ( entry, verticalIndex, horizontalIndex ) => {
      entry.valueProperty.value = this.partialProductSizes[ verticalIndex ][ horizontalIndex ];
      entry.statusProperty.value = EntryStatus.NORMAL;
    } );

    this.totalConstantEntry.valueProperty.value = this.total.getTerm( 0 );
    this.totalXEntry.valueProperty.value = this.total.getTerm( 1 );
    this.totalXSquaredEntry.valueProperty.value = this.total.getTerm( 2 );
    this.totalConstantEntry.statusProperty.value = EntryStatus.NORMAL;
    this.totalXEntry.statusProperty.value = EntryStatus.NORMAL;
    this.totalXSquaredEntry.statusProperty.value = EntryStatus.NORMAL;
  }

  /**
   * Checks the user's input against the known answer.
   * @public
   *
   * @returns {number} - The amount of score gained
   */
  check() {
    let scoreIncrease = 0;

    const badEntries = this.getIncorrectEntries();
    const isCorrect = badEntries.length === 0;

    const currentState = this.stateProperty.value;

    if ( !isCorrect ) {
      badEntries.forEach( badEntry => {
        badEntry.statusProperty.value = EntryStatus.INCORRECT;
      } );
    }

    if ( currentState === GameState.FIRST_ATTEMPT ) {
      if ( isCorrect ) {
        scoreIncrease = 2;
      }
      this.stateProperty.value = isCorrect ? GameState.CORRECT_ANSWER : GameState.WRONG_FIRST_ANSWER;
    }
    else if ( currentState === GameState.SECOND_ATTEMPT ) {
      if ( isCorrect ) {
        scoreIncrease = 1;
      }
      this.stateProperty.value = isCorrect ? GameState.CORRECT_ANSWER : GameState.WRONG_SECOND_ANSWER;
    }
    else {
      throw new Error( 'How is check possible here?' );
    }

    return scoreIncrease;
  }

  /**
   * Move to try another time.
   * @public
   */
  tryAgain() {
    this.stateProperty.value = GameState.SECOND_ATTEMPT;
  }


  /**
   * Generates a series of (semi) random terms for partition sizes for a particular orientation.
   * @private
   *
   * @param {number} quantity
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed for this area
   * @returns {Array.<Term>}
   */
  static generatePartitionTerms( quantity, allowExponents ) {
    const maxPower = quantity - 1;
    return _.range( maxPower, -1 ).map( power => AreaChallenge.generateTerm( power, maxPower, quantity, allowExponents ) );
  }

  /**
   * Generates a (semi) random term for a partition size.
   * @private
   *
   * @param {number} power - Power of 'x' or '10' that the single digit is multiplied times
   * @param {number} maxPower - Maximum power for all terms of this orientation.
   * @param {number} quantity - Quantity of terms generated total
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   * @returns {Term}
   */
  static generateTerm( power, maxPower, quantity, allowExponents ) {
    if ( allowExponents ) {

      // Don't let leading x or x^2 have a coefficient.
      if ( power === maxPower && power > 0 ) {
        return new Term( 1, power );
      }
      else {
        const sign = dotRandom.nextBoolean() ? 1 : -1;

        // Exclude a 1 if our length is 1 (so that we don't just have a single 1 as a dimensinon, so there is the
        // ability to have a partition line)
        const digit = dotRandom.nextIntBetween( ( sign > 0 && quantity === 1 ) ? 2 : 1, 9 );
        return new Term( sign * digit, power );
      }
    }
    else {

      // Exclude a 1 if our length is 1
      return new Term( dotRandom.nextIntBetween( quantity === 1 ? 2 : 1, 9 ) * Math.pow( 10, power ) );
    }
  }
}

areaModelCommon.register( 'AreaChallenge', AreaChallenge );

export default AreaChallenge;
