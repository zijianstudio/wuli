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
  constructor(description) {
    // Reassign a permuted version so we don't have a chance to screw up referencing the wrong thing
    description = description.getPermutedDescription();

    // @public {AreaChallengeDescription}
    this.description = description;

    // @public {Property.<GameState>}
    this.stateProperty = new Property(GameState.FIRST_ATTEMPT);

    // @public {GenericArea} - used in _.property( 'area' )
    this.area = new GenericArea(description.layout, description.allowExponents);

    // @public {OrientationPair.<Array.<Term>>} - The actual partition sizes
    this.partitionSizes = OrientationPair.create(orientation => AreaChallenge.generatePartitionTerms(description.partitionTypes.get(orientation).length, description.allowExponents));

    // @public {OrientationPair.<Array.<Entry>>} Entries for the size of each partition.
    this.partitionSizeEntries = OrientationPair.create(orientation => this.partitionSizes.get(orientation).map((size, index) => new Entry(size, {
      type: description.partitionTypes.get(orientation)[index],
      displayType: EntryType.toDisplayType(description.partitionTypes.get(orientation)[index]),
      inputMethod: description.numberOrVariable(InputMethod.CONSTANT, InputMethod.TERM),
      numberOfDigits: description.numberOrVariable(description.partitionTypes.get(orientation).length - index, 1)
    })));

    // @public {OrientationPair.<Term>|null} - If we're non-unique, it will hold the 0th-place coefficients (e.g. for
    // x+3 times x-7, it would hold the terms 3 and -7). It will always be two 1st-order polynomials times each other.
    this.swappableSizes = this.description.unique ? null : this.partitionSizes.map(_.property(1));

    // @public {OrientationPair.<Entry>|null} - If we're non-unique, it will hold the 0th-place entries (e.g. for
    // x+3 times x-7, it would hold the entries for 3 and -7). It will always be two 1st-order polynomials times each
    // other.
    this.swappableEntries = this.description.unique ? null : this.partitionSizeEntries.map(_.property(1));

    // @public {OrientationPair.<Array.<Property.<Term|null>>>} - Basically the values of the partitionSizeEntries, but
    // null if the entry's status is 'error'.
    this.nonErrorPartitionSizeProperties = OrientationPair.create(orientation => this.partitionSizeEntries.get(orientation).map(_.property('nonErrorValueProperty')));

    // @public {Array.<Array.<Term|null>>}
    this.partialProductSizes = this.partitionSizes.vertical.map(verticalSize => this.partitionSizes.horizontal.map(horizontalSize => horizontalSize.times(verticalSize)));

    // @public {Array.<Array.<Entry>>}
    this.partialProductSizeEntries = dimensionMap(2, this.partialProductSizes, (size, verticalIndex, horizontalIndex) => {
      // The number of allowed digits in entry. Basically it's the sum of vertical and horizontal (multiplication sums
      // the number of digits). The far-right/bototm partition gets 1 digit, and successively higher numbers of digits
      // are used for consecutive partitions.
      const numbersDigits = description.partitionTypes.vertical.length + description.partitionTypes.horizontal.length - verticalIndex - horizontalIndex;
      const type = description.productTypes[verticalIndex][horizontalIndex];
      const entry = new Entry(size, {
        type: type,
        displayType: EntryType.toDisplayType(type),
        inputMethod: description.numberOrVariable(InputMethod.CONSTANT, InputMethod.TERM),
        // Always let them put in 1 more digit than the actual answer, see https://github.com/phetsims/area-model-common/issues/63
        numberOfDigits: description.numberOrVariable(numbersDigits, 2) + 1
      });
      // Link up if dynamic
      if (type === EntryType.DYNAMIC) {
        // No unlink needed, since this is just for setup. We have a fixed number of these.
        Multilink.multilink([this.nonErrorPartitionSizeProperties.horizontal[horizontalIndex], this.nonErrorPartitionSizeProperties.vertical[verticalIndex]], (horizontal, vertical) => {
          // horizontal or vertical could be null (resulting in null)
          entry.valueProperty.value = horizontal && vertical && horizontal.times(vertical);
        });
      }
      return entry;
    });

    // We need at least a certain number of partitions to reach x^2 in the total (either at least an x^2 on one side,
    // or two x-powers on each side).
    const hasXSquaredTotal = this.partitionSizes.horizontal.length + this.partitionSizes.vertical.length >= 4;

    // @public {OrientationPair.<Polynomial>}
    this.totals = OrientationPair.create(orientation => new Polynomial(this.partitionSizes.get(orientation)));

    // @public {OrientationPair.<Property.<Polynomial|null>>}
    this.totalProperties = OrientationPair.create(orientation => new Property(this.totals.get(orientation)));

    // @public {Polynomial}
    this.total = this.totals.horizontal.times(this.totals.vertical);
    const totalOptions = {
      inputMethod: description.numberOrVariable(InputMethod.CONSTANT, hasXSquaredTotal ? InputMethod.POLYNOMIAL_2 : InputMethod.POLYNOMIAL_1),
      numberOfDigits: description.allowExponents ? 2 : this.partitionSizes.horizontal.length + this.partitionSizes.vertical.length
    };

    // @private {InputMethod}
    this.totalInputMethod = totalOptions.inputMethod;

    // @public {Entry}
    this.totalConstantEntry = new Entry(this.total.getTerm(0), merge({
      correctValue: this.total.getTerm(0),
      type: description.totalType,
      displayType: EntryType.toDisplayType(description.totalType)
    }, totalOptions));
    this.totalXEntry = new Entry(this.total.getTerm(1), merge({
      correctValue: this.total.getTerm(1),
      type: description.numberOrVariable(EntryType.GIVEN, description.totalType),
      displayType: description.numberOrVariable(EntryDisplayType.READOUT, EntryType.toDisplayType(description.totalType))
    }, totalOptions));
    this.totalXSquaredEntry = new Entry(this.total.getTerm(2), merge({
      correctValue: this.total.getTerm(2),
      type: description.numberOrVariable(EntryType.GIVEN, description.totalType),
      displayType: description.numberOrVariable(EntryDisplayType.READOUT, EntryType.toDisplayType(description.totalType))
    }, totalOptions));

    // @public {Array.<Entry>} - All of the coefficient entries that are used by this challenge.
    this.totalCoefficientEntries = [this.totalConstantEntry];
    if (totalOptions.inputMethod !== InputMethod.CONSTANT) {
      this.totalCoefficientEntries.push(this.totalXEntry);
    }
    if (totalOptions.inputMethod === InputMethod.POLYNOMIAL_2) {
      this.totalCoefficientEntries.push(this.totalXSquaredEntry);
    }

    // @public {Property.<Polynomial|null>}
    this.totalProperty = new DerivedProperty([this.totalConstantEntry.valueProperty, this.totalXEntry.valueProperty, this.totalXSquaredEntry.valueProperty], (constant, x, xSquared) => {
      const terms = [constant, x, xSquared].filter(term => term !== null);
      return terms.length ? new Polynomial(terms) : null;
    });

    // All of the entries for the challenge - Not including the polynomial "total" coefficient entries
    const mainEntries = this.partitionSizeEntries.horizontal.concat(this.partitionSizeEntries.vertical).concat(_.flatten(this.partialProductSizeEntries));
    const checkingNotificationProperties = mainEntries.map(_.property('valueProperty')).concat(this.totalCoefficientEntries.map(_.property('statusProperty')));

    // @public {Property.<boolean>} - Whether the check button should be enabled
    this.allowCheckingProperty = new DerivedProperty(checkingNotificationProperties, () => {
      const allDirtyCoefficients = _.every(this.totalCoefficientEntries, entry => entry.type === EntryType.EDITABLE && entry.statusProperty.value === EntryStatus.DIRTY);
      const hasNullMain = _.some(mainEntries, entry => entry.valueProperty.value === null && entry.type === EntryType.EDITABLE);
      return !hasNullMain && !allDirtyCoefficients;
    });

    /*---------------------------------------------------------------------------*
    * Dynamic hooks
    *----------------------------------------------------------------------------*/

    // Now hook up dynamic parts, setting their values to null
    Orientation.enumeration.values.forEach(orientation => {
      if (description.dimensionTypes.get(orientation) === EntryType.DYNAMIC) {
        const nonErrorProperties = this.nonErrorPartitionSizeProperties.get(orientation);
        Multilink.multilink(nonErrorProperties, () => {
          const terms = _.map(nonErrorProperties, 'value').filter(term => term !== null);
          const lostATerm = terms.length !== nonErrorProperties.length;
          this.totalProperties.get(orientation).value = terms.length && !lostATerm ? new Polynomial(terms) : null;
        });
      }
    });

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
    function compareEntry(entry, expectedValue) {
      if (entry.valueProperty.value === null || !entry.valueProperty.value.equals(expectedValue)) {
        incorrectEntries.push(entry);
      }
    }

    // NOTE: Since the only non-unique case is variables 6-1, we just check our secondary properties.
    if (!this.description.unique) {
      // Logic described by https://github.com/phetsims/area-model-common/issues/39
      // Addendum to logic in https://github.com/phetsims/area-model-common/issues/42
      if (this.hasNonUniqueBadMatch()) {
        incorrectEntries.push(this.swappableEntries.get(this.arbitraryNonUniqueWrongOrientation));
      } else {
        if (!this.nonUniqueHorizontalMatches()) {
          incorrectEntries.push(this.swappableEntries.horizontal);
        }
        if (!this.nonUniqueVerticalMatches()) {
          incorrectEntries.push(this.swappableEntries.vertical);
        }
      }
    } else {
      this.partitionSizeEntries.horizontal.forEach((entry, index) => {
        compareEntry(entry, this.partitionSizes.horizontal[index]);
      });
      this.partitionSizeEntries.vertical.forEach((entry, index) => {
        compareEntry(entry, this.partitionSizes.vertical[index]);
      });
      dimensionForEach(2, this.partialProductSizeEntries, (entry, verticalIndex, horizontalIndex) => {
        compareEntry(entry, this.partialProductSizes[verticalIndex][horizontalIndex]);
      });
      compareEntry(this.totalConstantEntry, this.total.getTerm(0));
      if (this.totalInputMethod !== InputMethod.CONSTANT) {
        compareEntry(this.totalXEntry, this.total.getTerm(1));
      }
      if (this.totalInputMethod === InputMethod.POLYNOMIAL_2) {
        compareEntry(this.totalXSquaredEntry, this.total.getTerm(2));
      }
    }
    return _.uniq(incorrectEntries).filter(entry => entry.displayType === EntryDisplayType.EDITABLE);
  }

  /**
   * Returns whether our horizontal (secondary) partition size equals one of the expected (secondary) partition sizes.
   * @private
   *
   * @returns {boolean}
   */
  nonUniqueHorizontalMatches() {
    const actual = this.swappableEntries.horizontal.valueProperty.value;
    return actual !== null && (actual.equals(this.swappableSizes.horizontal) || actual.equals(this.swappableSizes.vertical));
  }

  /**
   * Returns whether our vertical (secondary) partition size equals one of the expected (secondary) partition sizes.
   * @private
   *
   * @returns {boolean}
   */
  nonUniqueVerticalMatches() {
    const actual = this.swappableEntries.vertical.valueProperty.value;
    return actual !== null && (actual.equals(this.swappableSizes.horizontal) || actual.equals(this.swappableSizes.vertical));
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
    return actual1 !== null && actual2 !== null && (actual1.equals(expected1) && actual2.equals(expected2) || actual1.equals(expected2) && actual2.equals(expected1));
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
    if (!this.description.unique) {
      if (this.hasNonUniqueBadMatch()) {
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
    if (!this.description.unique) {
      let reversed = false;
      const expected1 = this.swappableSizes.horizontal;
      const expected2 = this.swappableSizes.vertical;
      const actual1Entry = this.swappableEntries.horizontal;
      const actual2Entry = this.swappableEntries.vertical;
      const actual1 = actual1Entry.valueProperty.value;
      const actual2 = actual2Entry.valueProperty.value;
      if (actual1 && actual2) {
        const matches1 = actual1.equals(expected1) || actual1.equals(expected2);
        const matches2 = actual2.equals(expected1) || actual2.equals(expected2);
        if (matches1 !== matches2 && (actual1.equals(expected2) || actual2.equals(expected1))) {
          reversed = true;
        }
      }
      if (reversed) {
        actual1Entry.valueProperty.value = expected2;
        actual2Entry.valueProperty.value = expected1;
        this.totalProperties.horizontal.value = this.totals.vertical;
        this.totalProperties.vertical.value = this.totals.horizontal;
      } else {
        actual1Entry.valueProperty.value = expected1;
        actual2Entry.valueProperty.value = expected2;
        this.totalProperties.horizontal.value = this.totals.horizontal;
        this.totalProperties.vertical.value = this.totals.vertical;
      }
      actual1Entry.statusProperty.value = EntryStatus.NORMAL;
      actual2Entry.statusProperty.value = EntryStatus.NORMAL;
    } else {
      this.partitionSizeEntries.horizontal.forEach((entry, index) => {
        entry.valueProperty.value = this.partitionSizes.horizontal[index];
      });
      this.partitionSizeEntries.vertical.forEach((entry, index) => {
        entry.valueProperty.value = this.partitionSizes.vertical[index];
      });
      this.totalProperties.horizontal.value = this.totals.horizontal;
      this.totalProperties.vertical.value = this.totals.vertical;
    }
    dimensionForEach(2, this.partialProductSizeEntries, (entry, verticalIndex, horizontalIndex) => {
      entry.valueProperty.value = this.partialProductSizes[verticalIndex][horizontalIndex];
      entry.statusProperty.value = EntryStatus.NORMAL;
    });
    this.totalConstantEntry.valueProperty.value = this.total.getTerm(0);
    this.totalXEntry.valueProperty.value = this.total.getTerm(1);
    this.totalXSquaredEntry.valueProperty.value = this.total.getTerm(2);
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
    if (!isCorrect) {
      badEntries.forEach(badEntry => {
        badEntry.statusProperty.value = EntryStatus.INCORRECT;
      });
    }
    if (currentState === GameState.FIRST_ATTEMPT) {
      if (isCorrect) {
        scoreIncrease = 2;
      }
      this.stateProperty.value = isCorrect ? GameState.CORRECT_ANSWER : GameState.WRONG_FIRST_ANSWER;
    } else if (currentState === GameState.SECOND_ATTEMPT) {
      if (isCorrect) {
        scoreIncrease = 1;
      }
      this.stateProperty.value = isCorrect ? GameState.CORRECT_ANSWER : GameState.WRONG_SECOND_ANSWER;
    } else {
      throw new Error('How is check possible here?');
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
  static generatePartitionTerms(quantity, allowExponents) {
    const maxPower = quantity - 1;
    return _.range(maxPower, -1).map(power => AreaChallenge.generateTerm(power, maxPower, quantity, allowExponents));
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
  static generateTerm(power, maxPower, quantity, allowExponents) {
    if (allowExponents) {
      // Don't let leading x or x^2 have a coefficient.
      if (power === maxPower && power > 0) {
        return new Term(1, power);
      } else {
        const sign = dotRandom.nextBoolean() ? 1 : -1;

        // Exclude a 1 if our length is 1 (so that we don't just have a single 1 as a dimensinon, so there is the
        // ability to have a partition line)
        const digit = dotRandom.nextIntBetween(sign > 0 && quantity === 1 ? 2 : 1, 9);
        return new Term(sign * digit, power);
      }
    } else {
      // Exclude a 1 if our length is 1
      return new Term(dotRandom.nextIntBetween(quantity === 1 ? 2 : 1, 9) * Math.pow(10, power));
    }
  }
}
areaModelCommon.register('AreaChallenge', AreaChallenge);
export default AreaChallenge;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsImRpbWVuc2lvbkZvckVhY2giLCJkaW1lbnNpb25NYXAiLCJtZXJnZSIsIk9yaWVudGF0aW9uIiwiYXJlYU1vZGVsQ29tbW9uIiwiT3JpZW50YXRpb25QYWlyIiwiUG9seW5vbWlhbCIsIlRlcm0iLCJHZW5lcmljQXJlYSIsIkVudHJ5IiwiRW50cnlEaXNwbGF5VHlwZSIsIkVudHJ5U3RhdHVzIiwiRW50cnlUeXBlIiwiR2FtZVN0YXRlIiwiSW5wdXRNZXRob2QiLCJBcmVhQ2hhbGxlbmdlIiwiY29uc3RydWN0b3IiLCJkZXNjcmlwdGlvbiIsImdldFBlcm11dGVkRGVzY3JpcHRpb24iLCJzdGF0ZVByb3BlcnR5IiwiRklSU1RfQVRURU1QVCIsImFyZWEiLCJsYXlvdXQiLCJhbGxvd0V4cG9uZW50cyIsInBhcnRpdGlvblNpemVzIiwiY3JlYXRlIiwib3JpZW50YXRpb24iLCJnZW5lcmF0ZVBhcnRpdGlvblRlcm1zIiwicGFydGl0aW9uVHlwZXMiLCJnZXQiLCJsZW5ndGgiLCJwYXJ0aXRpb25TaXplRW50cmllcyIsIm1hcCIsInNpemUiLCJpbmRleCIsInR5cGUiLCJkaXNwbGF5VHlwZSIsInRvRGlzcGxheVR5cGUiLCJpbnB1dE1ldGhvZCIsIm51bWJlck9yVmFyaWFibGUiLCJDT05TVEFOVCIsIlRFUk0iLCJudW1iZXJPZkRpZ2l0cyIsInN3YXBwYWJsZVNpemVzIiwidW5pcXVlIiwiXyIsInByb3BlcnR5Iiwic3dhcHBhYmxlRW50cmllcyIsIm5vbkVycm9yUGFydGl0aW9uU2l6ZVByb3BlcnRpZXMiLCJwYXJ0aWFsUHJvZHVjdFNpemVzIiwidmVydGljYWwiLCJ2ZXJ0aWNhbFNpemUiLCJob3Jpem9udGFsIiwiaG9yaXpvbnRhbFNpemUiLCJ0aW1lcyIsInBhcnRpYWxQcm9kdWN0U2l6ZUVudHJpZXMiLCJ2ZXJ0aWNhbEluZGV4IiwiaG9yaXpvbnRhbEluZGV4IiwibnVtYmVyc0RpZ2l0cyIsInByb2R1Y3RUeXBlcyIsImVudHJ5IiwiRFlOQU1JQyIsIm11bHRpbGluayIsInZhbHVlUHJvcGVydHkiLCJ2YWx1ZSIsImhhc1hTcXVhcmVkVG90YWwiLCJ0b3RhbHMiLCJ0b3RhbFByb3BlcnRpZXMiLCJ0b3RhbCIsInRvdGFsT3B0aW9ucyIsIlBPTFlOT01JQUxfMiIsIlBPTFlOT01JQUxfMSIsInRvdGFsSW5wdXRNZXRob2QiLCJ0b3RhbENvbnN0YW50RW50cnkiLCJnZXRUZXJtIiwiY29ycmVjdFZhbHVlIiwidG90YWxUeXBlIiwidG90YWxYRW50cnkiLCJHSVZFTiIsIlJFQURPVVQiLCJ0b3RhbFhTcXVhcmVkRW50cnkiLCJ0b3RhbENvZWZmaWNpZW50RW50cmllcyIsInB1c2giLCJ0b3RhbFByb3BlcnR5IiwiY29uc3RhbnQiLCJ4IiwieFNxdWFyZWQiLCJ0ZXJtcyIsImZpbHRlciIsInRlcm0iLCJtYWluRW50cmllcyIsImNvbmNhdCIsImZsYXR0ZW4iLCJjaGVja2luZ05vdGlmaWNhdGlvblByb3BlcnRpZXMiLCJhbGxvd0NoZWNraW5nUHJvcGVydHkiLCJhbGxEaXJ0eUNvZWZmaWNpZW50cyIsImV2ZXJ5IiwiRURJVEFCTEUiLCJzdGF0dXNQcm9wZXJ0eSIsIkRJUlRZIiwiaGFzTnVsbE1haW4iLCJzb21lIiwiZW51bWVyYXRpb24iLCJ2YWx1ZXMiLCJmb3JFYWNoIiwiZGltZW5zaW9uVHlwZXMiLCJub25FcnJvclByb3BlcnRpZXMiLCJsb3N0QVRlcm0iLCJhcmJpdHJhcnlOb25VbmlxdWVXcm9uZ09yaWVudGF0aW9uIiwibmV4dEJvb2xlYW4iLCJIT1JJWk9OVEFMIiwiVkVSVElDQUwiLCJnZXRJbmNvcnJlY3RFbnRyaWVzIiwiaW5jb3JyZWN0RW50cmllcyIsImNvbXBhcmVFbnRyeSIsImV4cGVjdGVkVmFsdWUiLCJlcXVhbHMiLCJoYXNOb25VbmlxdWVCYWRNYXRjaCIsIm5vblVuaXF1ZUhvcml6b250YWxNYXRjaGVzIiwibm9uVW5pcXVlVmVydGljYWxNYXRjaGVzIiwidW5pcSIsImFjdHVhbCIsImhhc05vblVuaXF1ZU1hdGNoIiwiZXhwZWN0ZWQxIiwiZXhwZWN0ZWQyIiwiYWN0dWFsMSIsImFjdHVhbDIiLCJjaGVja05vblVuaXF1ZUNoYW5nZXMiLCJOT1JNQUwiLCJzaG93QW5zd2VycyIsInJldmVyc2VkIiwiYWN0dWFsMUVudHJ5IiwiYWN0dWFsMkVudHJ5IiwibWF0Y2hlczEiLCJtYXRjaGVzMiIsImNoZWNrIiwic2NvcmVJbmNyZWFzZSIsImJhZEVudHJpZXMiLCJpc0NvcnJlY3QiLCJjdXJyZW50U3RhdGUiLCJiYWRFbnRyeSIsIklOQ09SUkVDVCIsIkNPUlJFQ1RfQU5TV0VSIiwiV1JPTkdfRklSU1RfQU5TV0VSIiwiU0VDT05EX0FUVEVNUFQiLCJXUk9OR19TRUNPTkRfQU5TV0VSIiwiRXJyb3IiLCJ0cnlBZ2FpbiIsInF1YW50aXR5IiwibWF4UG93ZXIiLCJyYW5nZSIsInBvd2VyIiwiZ2VuZXJhdGVUZXJtIiwic2lnbiIsImRpZ2l0IiwibmV4dEludEJldHdlZW4iLCJNYXRoIiwicG93IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBcmVhQ2hhbGxlbmdlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgc3BlY2lmaWMgY2hhbGxlbmdlIGZvciB0aGUgZ2FtZVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBkaW1lbnNpb25Gb3JFYWNoIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9kaW1lbnNpb25Gb3JFYWNoLmpzJztcclxuaW1wb3J0IGRpbWVuc2lvbk1hcCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvZGltZW5zaW9uTWFwLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBPcmllbnRhdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvT3JpZW50YXRpb24uanMnO1xyXG5pbXBvcnQgYXJlYU1vZGVsQ29tbW9uIGZyb20gJy4uLy4uL2FyZWFNb2RlbENvbW1vbi5qcyc7XHJcbmltcG9ydCBPcmllbnRhdGlvblBhaXIgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL09yaWVudGF0aW9uUGFpci5qcyc7XHJcbmltcG9ydCBQb2x5bm9taWFsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Qb2x5bm9taWFsLmpzJztcclxuaW1wb3J0IFRlcm0gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1Rlcm0uanMnO1xyXG5pbXBvcnQgR2VuZXJpY0FyZWEgZnJvbSAnLi4vLi4vZ2VuZXJpYy9tb2RlbC9HZW5lcmljQXJlYS5qcyc7XHJcbmltcG9ydCBFbnRyeSBmcm9tICcuL0VudHJ5LmpzJztcclxuaW1wb3J0IEVudHJ5RGlzcGxheVR5cGUgZnJvbSAnLi9FbnRyeURpc3BsYXlUeXBlLmpzJztcclxuaW1wb3J0IEVudHJ5U3RhdHVzIGZyb20gJy4vRW50cnlTdGF0dXMuanMnO1xyXG5pbXBvcnQgRW50cnlUeXBlIGZyb20gJy4vRW50cnlUeXBlLmpzJztcclxuaW1wb3J0IEdhbWVTdGF0ZSBmcm9tICcuL0dhbWVTdGF0ZS5qcyc7XHJcbmltcG9ydCBJbnB1dE1ldGhvZCBmcm9tICcuL0lucHV0TWV0aG9kLmpzJztcclxuXHJcbmNsYXNzIEFyZWFDaGFsbGVuZ2Uge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QXJlYUNoYWxsZW5nZURlc2NyaXB0aW9ufSBkZXNjcmlwdGlvblxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBkZXNjcmlwdGlvbiApIHtcclxuXHJcbiAgICAvLyBSZWFzc2lnbiBhIHBlcm11dGVkIHZlcnNpb24gc28gd2UgZG9uJ3QgaGF2ZSBhIGNoYW5jZSB0byBzY3JldyB1cCByZWZlcmVuY2luZyB0aGUgd3JvbmcgdGhpbmdcclxuICAgIGRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24uZ2V0UGVybXV0ZWREZXNjcmlwdGlvbigpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbn1cclxuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48R2FtZVN0YXRlPn1cclxuICAgIHRoaXMuc3RhdGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggR2FtZVN0YXRlLkZJUlNUX0FUVEVNUFQgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtHZW5lcmljQXJlYX0gLSB1c2VkIGluIF8ucHJvcGVydHkoICdhcmVhJyApXHJcbiAgICB0aGlzLmFyZWEgPSBuZXcgR2VuZXJpY0FyZWEoIGRlc2NyaXB0aW9uLmxheW91dCwgZGVzY3JpcHRpb24uYWxsb3dFeHBvbmVudHMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtPcmllbnRhdGlvblBhaXIuPEFycmF5LjxUZXJtPj59IC0gVGhlIGFjdHVhbCBwYXJ0aXRpb24gc2l6ZXNcclxuICAgIHRoaXMucGFydGl0aW9uU2l6ZXMgPSBPcmllbnRhdGlvblBhaXIuY3JlYXRlKCBvcmllbnRhdGlvbiA9PiBBcmVhQ2hhbGxlbmdlLmdlbmVyYXRlUGFydGl0aW9uVGVybXMoXHJcbiAgICAgIGRlc2NyaXB0aW9uLnBhcnRpdGlvblR5cGVzLmdldCggb3JpZW50YXRpb24gKS5sZW5ndGgsXHJcbiAgICAgIGRlc2NyaXB0aW9uLmFsbG93RXhwb25lbnRzXHJcbiAgICApICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7T3JpZW50YXRpb25QYWlyLjxBcnJheS48RW50cnk+Pn0gRW50cmllcyBmb3IgdGhlIHNpemUgb2YgZWFjaCBwYXJ0aXRpb24uXHJcbiAgICB0aGlzLnBhcnRpdGlvblNpemVFbnRyaWVzID0gT3JpZW50YXRpb25QYWlyLmNyZWF0ZSggb3JpZW50YXRpb24gPT4gdGhpcy5wYXJ0aXRpb25TaXplcy5nZXQoIG9yaWVudGF0aW9uICkubWFwKCAoIHNpemUsIGluZGV4ICkgPT4gbmV3IEVudHJ5KCBzaXplLCB7XHJcbiAgICAgIHR5cGU6IGRlc2NyaXB0aW9uLnBhcnRpdGlvblR5cGVzLmdldCggb3JpZW50YXRpb24gKVsgaW5kZXggXSxcclxuICAgICAgZGlzcGxheVR5cGU6IEVudHJ5VHlwZS50b0Rpc3BsYXlUeXBlKCBkZXNjcmlwdGlvbi5wYXJ0aXRpb25UeXBlcy5nZXQoIG9yaWVudGF0aW9uIClbIGluZGV4IF0gKSxcclxuICAgICAgaW5wdXRNZXRob2Q6IGRlc2NyaXB0aW9uLm51bWJlck9yVmFyaWFibGUoIElucHV0TWV0aG9kLkNPTlNUQU5ULCBJbnB1dE1ldGhvZC5URVJNICksXHJcbiAgICAgIG51bWJlck9mRGlnaXRzOiBkZXNjcmlwdGlvbi5udW1iZXJPclZhcmlhYmxlKCBkZXNjcmlwdGlvbi5wYXJ0aXRpb25UeXBlcy5nZXQoIG9yaWVudGF0aW9uICkubGVuZ3RoIC0gaW5kZXgsIDEgKVxyXG4gICAgfSApICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtPcmllbnRhdGlvblBhaXIuPFRlcm0+fG51bGx9IC0gSWYgd2UncmUgbm9uLXVuaXF1ZSwgaXQgd2lsbCBob2xkIHRoZSAwdGgtcGxhY2UgY29lZmZpY2llbnRzIChlLmcuIGZvclxyXG4gICAgLy8geCszIHRpbWVzIHgtNywgaXQgd291bGQgaG9sZCB0aGUgdGVybXMgMyBhbmQgLTcpLiBJdCB3aWxsIGFsd2F5cyBiZSB0d28gMXN0LW9yZGVyIHBvbHlub21pYWxzIHRpbWVzIGVhY2ggb3RoZXIuXHJcbiAgICB0aGlzLnN3YXBwYWJsZVNpemVzID0gdGhpcy5kZXNjcmlwdGlvbi51bmlxdWUgPyBudWxsIDogdGhpcy5wYXJ0aXRpb25TaXplcy5tYXAoIF8ucHJvcGVydHkoIDEgKSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge09yaWVudGF0aW9uUGFpci48RW50cnk+fG51bGx9IC0gSWYgd2UncmUgbm9uLXVuaXF1ZSwgaXQgd2lsbCBob2xkIHRoZSAwdGgtcGxhY2UgZW50cmllcyAoZS5nLiBmb3JcclxuICAgIC8vIHgrMyB0aW1lcyB4LTcsIGl0IHdvdWxkIGhvbGQgdGhlIGVudHJpZXMgZm9yIDMgYW5kIC03KS4gSXQgd2lsbCBhbHdheXMgYmUgdHdvIDFzdC1vcmRlciBwb2x5bm9taWFscyB0aW1lcyBlYWNoXHJcbiAgICAvLyBvdGhlci5cclxuICAgIHRoaXMuc3dhcHBhYmxlRW50cmllcyA9IHRoaXMuZGVzY3JpcHRpb24udW5pcXVlID8gbnVsbCA6IHRoaXMucGFydGl0aW9uU2l6ZUVudHJpZXMubWFwKCBfLnByb3BlcnR5KCAxICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtPcmllbnRhdGlvblBhaXIuPEFycmF5LjxQcm9wZXJ0eS48VGVybXxudWxsPj4+fSAtIEJhc2ljYWxseSB0aGUgdmFsdWVzIG9mIHRoZSBwYXJ0aXRpb25TaXplRW50cmllcywgYnV0XHJcbiAgICAvLyBudWxsIGlmIHRoZSBlbnRyeSdzIHN0YXR1cyBpcyAnZXJyb3InLlxyXG4gICAgdGhpcy5ub25FcnJvclBhcnRpdGlvblNpemVQcm9wZXJ0aWVzID0gT3JpZW50YXRpb25QYWlyLmNyZWF0ZSggb3JpZW50YXRpb24gPT4gdGhpcy5wYXJ0aXRpb25TaXplRW50cmllcy5nZXQoIG9yaWVudGF0aW9uICkubWFwKCBfLnByb3BlcnR5KCAnbm9uRXJyb3JWYWx1ZVByb3BlcnR5JyApICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48QXJyYXkuPFRlcm18bnVsbD4+fVxyXG4gICAgdGhpcy5wYXJ0aWFsUHJvZHVjdFNpemVzID0gdGhpcy5wYXJ0aXRpb25TaXplcy52ZXJ0aWNhbC5tYXAoIHZlcnRpY2FsU2l6ZSA9PiB0aGlzLnBhcnRpdGlvblNpemVzLmhvcml6b250YWwubWFwKCBob3Jpem9udGFsU2l6ZSA9PiBob3Jpem9udGFsU2l6ZS50aW1lcyggdmVydGljYWxTaXplICkgKSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxBcnJheS48RW50cnk+Pn1cclxuICAgIHRoaXMucGFydGlhbFByb2R1Y3RTaXplRW50cmllcyA9IGRpbWVuc2lvbk1hcCggMiwgdGhpcy5wYXJ0aWFsUHJvZHVjdFNpemVzLCAoIHNpemUsIHZlcnRpY2FsSW5kZXgsIGhvcml6b250YWxJbmRleCApID0+IHtcclxuXHJcbiAgICAgIC8vIFRoZSBudW1iZXIgb2YgYWxsb3dlZCBkaWdpdHMgaW4gZW50cnkuIEJhc2ljYWxseSBpdCdzIHRoZSBzdW0gb2YgdmVydGljYWwgYW5kIGhvcml6b250YWwgKG11bHRpcGxpY2F0aW9uIHN1bXNcclxuICAgICAgLy8gdGhlIG51bWJlciBvZiBkaWdpdHMpLiBUaGUgZmFyLXJpZ2h0L2JvdG90bSBwYXJ0aXRpb24gZ2V0cyAxIGRpZ2l0LCBhbmQgc3VjY2Vzc2l2ZWx5IGhpZ2hlciBudW1iZXJzIG9mIGRpZ2l0c1xyXG4gICAgICAvLyBhcmUgdXNlZCBmb3IgY29uc2VjdXRpdmUgcGFydGl0aW9ucy5cclxuICAgICAgY29uc3QgbnVtYmVyc0RpZ2l0cyA9IGRlc2NyaXB0aW9uLnBhcnRpdGlvblR5cGVzLnZlcnRpY2FsLmxlbmd0aCArIGRlc2NyaXB0aW9uLnBhcnRpdGlvblR5cGVzLmhvcml6b250YWwubGVuZ3RoIC0gdmVydGljYWxJbmRleCAtIGhvcml6b250YWxJbmRleDtcclxuICAgICAgY29uc3QgdHlwZSA9IGRlc2NyaXB0aW9uLnByb2R1Y3RUeXBlc1sgdmVydGljYWxJbmRleCBdWyBob3Jpem9udGFsSW5kZXggXTtcclxuICAgICAgY29uc3QgZW50cnkgPSBuZXcgRW50cnkoIHNpemUsIHtcclxuICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgIGRpc3BsYXlUeXBlOiBFbnRyeVR5cGUudG9EaXNwbGF5VHlwZSggdHlwZSApLFxyXG4gICAgICAgIGlucHV0TWV0aG9kOiBkZXNjcmlwdGlvbi5udW1iZXJPclZhcmlhYmxlKCBJbnB1dE1ldGhvZC5DT05TVEFOVCwgSW5wdXRNZXRob2QuVEVSTSApLFxyXG5cclxuICAgICAgICAvLyBBbHdheXMgbGV0IHRoZW0gcHV0IGluIDEgbW9yZSBkaWdpdCB0aGFuIHRoZSBhY3R1YWwgYW5zd2VyLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FyZWEtbW9kZWwtY29tbW9uL2lzc3Vlcy82M1xyXG4gICAgICAgIG51bWJlck9mRGlnaXRzOiBkZXNjcmlwdGlvbi5udW1iZXJPclZhcmlhYmxlKCBudW1iZXJzRGlnaXRzLCAyICkgKyAxXHJcbiAgICAgIH0gKTtcclxuICAgICAgLy8gTGluayB1cCBpZiBkeW5hbWljXHJcbiAgICAgIGlmICggdHlwZSA9PT0gRW50cnlUeXBlLkRZTkFNSUMgKSB7XHJcblxyXG4gICAgICAgIC8vIE5vIHVubGluayBuZWVkZWQsIHNpbmNlIHRoaXMgaXMganVzdCBmb3Igc2V0dXAuIFdlIGhhdmUgYSBmaXhlZCBudW1iZXIgb2YgdGhlc2UuXHJcbiAgICAgICAgTXVsdGlsaW5rLm11bHRpbGluayggW1xyXG4gICAgICAgICAgdGhpcy5ub25FcnJvclBhcnRpdGlvblNpemVQcm9wZXJ0aWVzLmhvcml6b250YWxbIGhvcml6b250YWxJbmRleCBdLFxyXG4gICAgICAgICAgdGhpcy5ub25FcnJvclBhcnRpdGlvblNpemVQcm9wZXJ0aWVzLnZlcnRpY2FsWyB2ZXJ0aWNhbEluZGV4IF1cclxuICAgICAgICBdLCAoIGhvcml6b250YWwsIHZlcnRpY2FsICkgPT4ge1xyXG4gICAgICAgICAgLy8gaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbCBjb3VsZCBiZSBudWxsIChyZXN1bHRpbmcgaW4gbnVsbClcclxuICAgICAgICAgIGVudHJ5LnZhbHVlUHJvcGVydHkudmFsdWUgPSBob3Jpem9udGFsICYmIHZlcnRpY2FsICYmIGhvcml6b250YWwudGltZXMoIHZlcnRpY2FsICk7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBlbnRyeTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBXZSBuZWVkIGF0IGxlYXN0IGEgY2VydGFpbiBudW1iZXIgb2YgcGFydGl0aW9ucyB0byByZWFjaCB4XjIgaW4gdGhlIHRvdGFsIChlaXRoZXIgYXQgbGVhc3QgYW4geF4yIG9uIG9uZSBzaWRlLFxyXG4gICAgLy8gb3IgdHdvIHgtcG93ZXJzIG9uIGVhY2ggc2lkZSkuXHJcbiAgICBjb25zdCBoYXNYU3F1YXJlZFRvdGFsID0gKCB0aGlzLnBhcnRpdGlvblNpemVzLmhvcml6b250YWwubGVuZ3RoICsgdGhpcy5wYXJ0aXRpb25TaXplcy52ZXJ0aWNhbC5sZW5ndGggKSA+PSA0O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge09yaWVudGF0aW9uUGFpci48UG9seW5vbWlhbD59XHJcbiAgICB0aGlzLnRvdGFscyA9IE9yaWVudGF0aW9uUGFpci5jcmVhdGUoIG9yaWVudGF0aW9uID0+IG5ldyBQb2x5bm9taWFsKCB0aGlzLnBhcnRpdGlvblNpemVzLmdldCggb3JpZW50YXRpb24gKSApICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7T3JpZW50YXRpb25QYWlyLjxQcm9wZXJ0eS48UG9seW5vbWlhbHxudWxsPj59XHJcbiAgICB0aGlzLnRvdGFsUHJvcGVydGllcyA9IE9yaWVudGF0aW9uUGFpci5jcmVhdGUoIG9yaWVudGF0aW9uID0+IG5ldyBQcm9wZXJ0eSggdGhpcy50b3RhbHMuZ2V0KCBvcmllbnRhdGlvbiApICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQb2x5bm9taWFsfVxyXG4gICAgdGhpcy50b3RhbCA9IHRoaXMudG90YWxzLmhvcml6b250YWwudGltZXMoIHRoaXMudG90YWxzLnZlcnRpY2FsICk7XHJcblxyXG4gICAgY29uc3QgdG90YWxPcHRpb25zID0ge1xyXG4gICAgICBpbnB1dE1ldGhvZDogZGVzY3JpcHRpb24ubnVtYmVyT3JWYXJpYWJsZSggSW5wdXRNZXRob2QuQ09OU1RBTlQsIGhhc1hTcXVhcmVkVG90YWwgPyBJbnB1dE1ldGhvZC5QT0xZTk9NSUFMXzIgOiBJbnB1dE1ldGhvZC5QT0xZTk9NSUFMXzEgKSxcclxuICAgICAgbnVtYmVyT2ZEaWdpdHM6ICggZGVzY3JpcHRpb24uYWxsb3dFeHBvbmVudHMgPyAyIDogKCB0aGlzLnBhcnRpdGlvblNpemVzLmhvcml6b250YWwubGVuZ3RoICsgdGhpcy5wYXJ0aXRpb25TaXplcy52ZXJ0aWNhbC5sZW5ndGggKSApXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtJbnB1dE1ldGhvZH1cclxuICAgIHRoaXMudG90YWxJbnB1dE1ldGhvZCA9IHRvdGFsT3B0aW9ucy5pbnB1dE1ldGhvZDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtFbnRyeX1cclxuICAgIHRoaXMudG90YWxDb25zdGFudEVudHJ5ID0gbmV3IEVudHJ5KCB0aGlzLnRvdGFsLmdldFRlcm0oIDAgKSwgbWVyZ2UoIHtcclxuICAgICAgY29ycmVjdFZhbHVlOiB0aGlzLnRvdGFsLmdldFRlcm0oIDAgKSxcclxuICAgICAgdHlwZTogZGVzY3JpcHRpb24udG90YWxUeXBlLFxyXG4gICAgICBkaXNwbGF5VHlwZTogRW50cnlUeXBlLnRvRGlzcGxheVR5cGUoIGRlc2NyaXB0aW9uLnRvdGFsVHlwZSApXHJcbiAgICB9LCB0b3RhbE9wdGlvbnMgKSApO1xyXG4gICAgdGhpcy50b3RhbFhFbnRyeSA9IG5ldyBFbnRyeSggdGhpcy50b3RhbC5nZXRUZXJtKCAxICksIG1lcmdlKCB7XHJcbiAgICAgIGNvcnJlY3RWYWx1ZTogdGhpcy50b3RhbC5nZXRUZXJtKCAxICksXHJcbiAgICAgIHR5cGU6IGRlc2NyaXB0aW9uLm51bWJlck9yVmFyaWFibGUoIEVudHJ5VHlwZS5HSVZFTiwgZGVzY3JpcHRpb24udG90YWxUeXBlICksXHJcbiAgICAgIGRpc3BsYXlUeXBlOiBkZXNjcmlwdGlvbi5udW1iZXJPclZhcmlhYmxlKCBFbnRyeURpc3BsYXlUeXBlLlJFQURPVVQsIEVudHJ5VHlwZS50b0Rpc3BsYXlUeXBlKCBkZXNjcmlwdGlvbi50b3RhbFR5cGUgKSApXHJcbiAgICB9LCB0b3RhbE9wdGlvbnMgKSApO1xyXG4gICAgdGhpcy50b3RhbFhTcXVhcmVkRW50cnkgPSBuZXcgRW50cnkoIHRoaXMudG90YWwuZ2V0VGVybSggMiApLCBtZXJnZSgge1xyXG4gICAgICBjb3JyZWN0VmFsdWU6IHRoaXMudG90YWwuZ2V0VGVybSggMiApLFxyXG4gICAgICB0eXBlOiBkZXNjcmlwdGlvbi5udW1iZXJPclZhcmlhYmxlKCBFbnRyeVR5cGUuR0lWRU4sIGRlc2NyaXB0aW9uLnRvdGFsVHlwZSApLFxyXG4gICAgICBkaXNwbGF5VHlwZTogZGVzY3JpcHRpb24ubnVtYmVyT3JWYXJpYWJsZSggRW50cnlEaXNwbGF5VHlwZS5SRUFET1VULCBFbnRyeVR5cGUudG9EaXNwbGF5VHlwZSggZGVzY3JpcHRpb24udG90YWxUeXBlICkgKVxyXG4gICAgfSwgdG90YWxPcHRpb25zICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48RW50cnk+fSAtIEFsbCBvZiB0aGUgY29lZmZpY2llbnQgZW50cmllcyB0aGF0IGFyZSB1c2VkIGJ5IHRoaXMgY2hhbGxlbmdlLlxyXG4gICAgdGhpcy50b3RhbENvZWZmaWNpZW50RW50cmllcyA9IFsgdGhpcy50b3RhbENvbnN0YW50RW50cnkgXTtcclxuICAgIGlmICggdG90YWxPcHRpb25zLmlucHV0TWV0aG9kICE9PSBJbnB1dE1ldGhvZC5DT05TVEFOVCApIHtcclxuICAgICAgdGhpcy50b3RhbENvZWZmaWNpZW50RW50cmllcy5wdXNoKCB0aGlzLnRvdGFsWEVudHJ5ICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIHRvdGFsT3B0aW9ucy5pbnB1dE1ldGhvZCA9PT0gSW5wdXRNZXRob2QuUE9MWU5PTUlBTF8yICkge1xyXG4gICAgICB0aGlzLnRvdGFsQ29lZmZpY2llbnRFbnRyaWVzLnB1c2goIHRoaXMudG90YWxYU3F1YXJlZEVudHJ5ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPFBvbHlub21pYWx8bnVsbD59XHJcbiAgICB0aGlzLnRvdGFsUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHRoaXMudG90YWxDb25zdGFudEVudHJ5LnZhbHVlUHJvcGVydHksIHRoaXMudG90YWxYRW50cnkudmFsdWVQcm9wZXJ0eSwgdGhpcy50b3RhbFhTcXVhcmVkRW50cnkudmFsdWVQcm9wZXJ0eSBdLFxyXG4gICAgICAoIGNvbnN0YW50LCB4LCB4U3F1YXJlZCApID0+IHtcclxuICAgICAgICBjb25zdCB0ZXJtcyA9IFsgY29uc3RhbnQsIHgsIHhTcXVhcmVkIF0uZmlsdGVyKCB0ZXJtID0+IHRlcm0gIT09IG51bGwgKTtcclxuICAgICAgICByZXR1cm4gdGVybXMubGVuZ3RoID8gbmV3IFBvbHlub21pYWwoIHRlcm1zICkgOiBudWxsO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gQWxsIG9mIHRoZSBlbnRyaWVzIGZvciB0aGUgY2hhbGxlbmdlIC0gTm90IGluY2x1ZGluZyB0aGUgcG9seW5vbWlhbCBcInRvdGFsXCIgY29lZmZpY2llbnQgZW50cmllc1xyXG4gICAgY29uc3QgbWFpbkVudHJpZXMgPSB0aGlzLnBhcnRpdGlvblNpemVFbnRyaWVzLmhvcml6b250YWxcclxuICAgICAgLmNvbmNhdCggdGhpcy5wYXJ0aXRpb25TaXplRW50cmllcy52ZXJ0aWNhbCApXHJcbiAgICAgIC5jb25jYXQoIF8uZmxhdHRlbiggdGhpcy5wYXJ0aWFsUHJvZHVjdFNpemVFbnRyaWVzICkgKTtcclxuICAgIGNvbnN0IGNoZWNraW5nTm90aWZpY2F0aW9uUHJvcGVydGllcyA9IG1haW5FbnRyaWVzLm1hcCggXy5wcm9wZXJ0eSggJ3ZhbHVlUHJvcGVydHknICkgKVxyXG4gICAgICAuY29uY2F0KCB0aGlzLnRvdGFsQ29lZmZpY2llbnRFbnRyaWVzLm1hcCggXy5wcm9wZXJ0eSggJ3N0YXR1c1Byb3BlcnR5JyApICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IC0gV2hldGhlciB0aGUgY2hlY2sgYnV0dG9uIHNob3VsZCBiZSBlbmFibGVkXHJcbiAgICB0aGlzLmFsbG93Q2hlY2tpbmdQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIGNoZWNraW5nTm90aWZpY2F0aW9uUHJvcGVydGllcywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBhbGxEaXJ0eUNvZWZmaWNpZW50cyA9IF8uZXZlcnkoIHRoaXMudG90YWxDb2VmZmljaWVudEVudHJpZXMsIGVudHJ5ID0+IGVudHJ5LnR5cGUgPT09IEVudHJ5VHlwZS5FRElUQUJMRSAmJiBlbnRyeS5zdGF0dXNQcm9wZXJ0eS52YWx1ZSA9PT0gRW50cnlTdGF0dXMuRElSVFkgKTtcclxuICAgICAgY29uc3QgaGFzTnVsbE1haW4gPSBfLnNvbWUoIG1haW5FbnRyaWVzLCBlbnRyeSA9PiBlbnRyeS52YWx1ZVByb3BlcnR5LnZhbHVlID09PSBudWxsICYmIGVudHJ5LnR5cGUgPT09IEVudHJ5VHlwZS5FRElUQUJMRSApO1xyXG4gICAgICByZXR1cm4gIWhhc051bGxNYWluICYmICFhbGxEaXJ0eUNvZWZmaWNpZW50cztcclxuICAgIH0gKTtcclxuXHJcbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgICogRHluYW1pYyBob29rc1xyXG4gICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAgIC8vIE5vdyBob29rIHVwIGR5bmFtaWMgcGFydHMsIHNldHRpbmcgdGhlaXIgdmFsdWVzIHRvIG51bGxcclxuICAgIE9yaWVudGF0aW9uLmVudW1lcmF0aW9uLnZhbHVlcy5mb3JFYWNoKCBvcmllbnRhdGlvbiA9PiB7XHJcbiAgICAgIGlmICggZGVzY3JpcHRpb24uZGltZW5zaW9uVHlwZXMuZ2V0KCBvcmllbnRhdGlvbiApID09PSBFbnRyeVR5cGUuRFlOQU1JQyApIHtcclxuICAgICAgICBjb25zdCBub25FcnJvclByb3BlcnRpZXMgPSB0aGlzLm5vbkVycm9yUGFydGl0aW9uU2l6ZVByb3BlcnRpZXMuZ2V0KCBvcmllbnRhdGlvbiApO1xyXG4gICAgICAgIE11bHRpbGluay5tdWx0aWxpbmsoIG5vbkVycm9yUHJvcGVydGllcywgKCkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgdGVybXMgPSBfLm1hcCggbm9uRXJyb3JQcm9wZXJ0aWVzLCAndmFsdWUnICkuZmlsdGVyKCB0ZXJtID0+IHRlcm0gIT09IG51bGwgKTtcclxuICAgICAgICAgIGNvbnN0IGxvc3RBVGVybSA9IHRlcm1zLmxlbmd0aCAhPT0gbm9uRXJyb3JQcm9wZXJ0aWVzLmxlbmd0aDtcclxuICAgICAgICAgIHRoaXMudG90YWxQcm9wZXJ0aWVzLmdldCggb3JpZW50YXRpb24gKS52YWx1ZSA9ICggdGVybXMubGVuZ3RoICYmICFsb3N0QVRlcm0gKSA/IG5ldyBQb2x5bm9taWFsKCB0ZXJtcyApIDogbnVsbDtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBQaWNrIGFuIGFyYml0cmFyeSBzaWRlIHRvIGJlIHdyb25nIGluIHBhcnRpY3VsYXIgdmFyaWFibGVzIDYtMSBjYXNlcywgc2VlXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXJlYS1tb2RlbC1jb21tb24vaXNzdWVzLzQyXHJcbiAgICB0aGlzLmFyYml0cmFyeU5vblVuaXF1ZVdyb25nT3JpZW50YXRpb24gPSBkb3RSYW5kb20ubmV4dEJvb2xlYW4oKSA/IE9yaWVudGF0aW9uLkhPUklaT05UQUwgOiBPcmllbnRhdGlvbi5WRVJUSUNBTDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBsaXN0IG9mIGFsbCBvZiB0aGUgZWRpdGFibGUgcHJvcGVydGllcyB0aGF0IGFyZSBpbmNvcnJlY3QuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge0FycmF5LjxFbnRyeT59XHJcbiAgICovXHJcbiAgZ2V0SW5jb3JyZWN0RW50cmllcygpIHtcclxuICAgIGNvbnN0IGluY29ycmVjdEVudHJpZXMgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjb21wYXJlRW50cnkoIGVudHJ5LCBleHBlY3RlZFZhbHVlICkge1xyXG4gICAgICBpZiAoIGVudHJ5LnZhbHVlUHJvcGVydHkudmFsdWUgPT09IG51bGwgfHwgIWVudHJ5LnZhbHVlUHJvcGVydHkudmFsdWUuZXF1YWxzKCBleHBlY3RlZFZhbHVlICkgKSB7XHJcbiAgICAgICAgaW5jb3JyZWN0RW50cmllcy5wdXNoKCBlbnRyeSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTk9URTogU2luY2UgdGhlIG9ubHkgbm9uLXVuaXF1ZSBjYXNlIGlzIHZhcmlhYmxlcyA2LTEsIHdlIGp1c3QgY2hlY2sgb3VyIHNlY29uZGFyeSBwcm9wZXJ0aWVzLlxyXG4gICAgaWYgKCAhdGhpcy5kZXNjcmlwdGlvbi51bmlxdWUgKSB7XHJcbiAgICAgIC8vIExvZ2ljIGRlc2NyaWJlZCBieSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXJlYS1tb2RlbC1jb21tb24vaXNzdWVzLzM5XHJcbiAgICAgIC8vIEFkZGVuZHVtIHRvIGxvZ2ljIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hcmVhLW1vZGVsLWNvbW1vbi9pc3N1ZXMvNDJcclxuICAgICAgaWYgKCB0aGlzLmhhc05vblVuaXF1ZUJhZE1hdGNoKCkgKSB7XHJcbiAgICAgICAgaW5jb3JyZWN0RW50cmllcy5wdXNoKCB0aGlzLnN3YXBwYWJsZUVudHJpZXMuZ2V0KCB0aGlzLmFyYml0cmFyeU5vblVuaXF1ZVdyb25nT3JpZW50YXRpb24gKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICggIXRoaXMubm9uVW5pcXVlSG9yaXpvbnRhbE1hdGNoZXMoKSApIHtcclxuICAgICAgICAgIGluY29ycmVjdEVudHJpZXMucHVzaCggdGhpcy5zd2FwcGFibGVFbnRyaWVzLmhvcml6b250YWwgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCAhdGhpcy5ub25VbmlxdWVWZXJ0aWNhbE1hdGNoZXMoKSApIHtcclxuICAgICAgICAgIGluY29ycmVjdEVudHJpZXMucHVzaCggdGhpcy5zd2FwcGFibGVFbnRyaWVzLnZlcnRpY2FsICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5wYXJ0aXRpb25TaXplRW50cmllcy5ob3Jpem9udGFsLmZvckVhY2goICggZW50cnksIGluZGV4ICkgPT4ge1xyXG4gICAgICAgIGNvbXBhcmVFbnRyeSggZW50cnksIHRoaXMucGFydGl0aW9uU2l6ZXMuaG9yaXpvbnRhbFsgaW5kZXggXSApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMucGFydGl0aW9uU2l6ZUVudHJpZXMudmVydGljYWwuZm9yRWFjaCggKCBlbnRyeSwgaW5kZXggKSA9PiB7XHJcbiAgICAgICAgY29tcGFyZUVudHJ5KCBlbnRyeSwgdGhpcy5wYXJ0aXRpb25TaXplcy52ZXJ0aWNhbFsgaW5kZXggXSApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGRpbWVuc2lvbkZvckVhY2goIDIsIHRoaXMucGFydGlhbFByb2R1Y3RTaXplRW50cmllcywgKCBlbnRyeSwgdmVydGljYWxJbmRleCwgaG9yaXpvbnRhbEluZGV4ICkgPT4ge1xyXG4gICAgICAgIGNvbXBhcmVFbnRyeSggZW50cnksIHRoaXMucGFydGlhbFByb2R1Y3RTaXplc1sgdmVydGljYWxJbmRleCBdWyBob3Jpem9udGFsSW5kZXggXSApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBjb21wYXJlRW50cnkoIHRoaXMudG90YWxDb25zdGFudEVudHJ5LCB0aGlzLnRvdGFsLmdldFRlcm0oIDAgKSApO1xyXG4gICAgICBpZiAoIHRoaXMudG90YWxJbnB1dE1ldGhvZCAhPT0gSW5wdXRNZXRob2QuQ09OU1RBTlQgKSB7XHJcbiAgICAgICAgY29tcGFyZUVudHJ5KCB0aGlzLnRvdGFsWEVudHJ5LCB0aGlzLnRvdGFsLmdldFRlcm0oIDEgKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggdGhpcy50b3RhbElucHV0TWV0aG9kID09PSBJbnB1dE1ldGhvZC5QT0xZTk9NSUFMXzIgKSB7XHJcbiAgICAgICAgY29tcGFyZUVudHJ5KCB0aGlzLnRvdGFsWFNxdWFyZWRFbnRyeSwgdGhpcy50b3RhbC5nZXRUZXJtKCAyICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBfLnVuaXEoIGluY29ycmVjdEVudHJpZXMgKS5maWx0ZXIoIGVudHJ5ID0+IGVudHJ5LmRpc3BsYXlUeXBlID09PSBFbnRyeURpc3BsYXlUeXBlLkVESVRBQkxFICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgb3VyIGhvcml6b250YWwgKHNlY29uZGFyeSkgcGFydGl0aW9uIHNpemUgZXF1YWxzIG9uZSBvZiB0aGUgZXhwZWN0ZWQgKHNlY29uZGFyeSkgcGFydGl0aW9uIHNpemVzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBub25VbmlxdWVIb3Jpem9udGFsTWF0Y2hlcygpIHtcclxuICAgIGNvbnN0IGFjdHVhbCA9IHRoaXMuc3dhcHBhYmxlRW50cmllcy5ob3Jpem9udGFsLnZhbHVlUHJvcGVydHkudmFsdWU7XHJcbiAgICByZXR1cm4gYWN0dWFsICE9PSBudWxsICYmICggYWN0dWFsLmVxdWFscyggdGhpcy5zd2FwcGFibGVTaXplcy5ob3Jpem9udGFsICkgfHwgYWN0dWFsLmVxdWFscyggdGhpcy5zd2FwcGFibGVTaXplcy52ZXJ0aWNhbCApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgb3VyIHZlcnRpY2FsIChzZWNvbmRhcnkpIHBhcnRpdGlvbiBzaXplIGVxdWFscyBvbmUgb2YgdGhlIGV4cGVjdGVkIChzZWNvbmRhcnkpIHBhcnRpdGlvbiBzaXplcy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgbm9uVW5pcXVlVmVydGljYWxNYXRjaGVzKCkge1xyXG4gICAgY29uc3QgYWN0dWFsID0gdGhpcy5zd2FwcGFibGVFbnRyaWVzLnZlcnRpY2FsLnZhbHVlUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgcmV0dXJuIGFjdHVhbCAhPT0gbnVsbCAmJiAoIGFjdHVhbC5lcXVhbHMoIHRoaXMuc3dhcHBhYmxlU2l6ZXMuaG9yaXpvbnRhbCApIHx8IGFjdHVhbC5lcXVhbHMoIHRoaXMuc3dhcHBhYmxlU2l6ZXMudmVydGljYWwgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIGEgcGVybXV0YXRpb24gb2Ygb3VyIHNlY29uZGFyeSBwYXJ0aXRpb24gc2l6ZXMgbWF0Y2hlcyB0aGUgZXhwZWN0ZWQgc2l6ZXMuIEhlbHBmdWwgZm9yIHRoZSBjYXNlXHJcbiAgICogd2hlcmUgdmFsdWVzIGNhbiBiZSBzd2FwcGVkIGJldHdlZW4gcG9zaXRpb25zLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBoYXNOb25VbmlxdWVNYXRjaCgpIHtcclxuICAgIGNvbnN0IGV4cGVjdGVkMSA9IHRoaXMuc3dhcHBhYmxlU2l6ZXMuaG9yaXpvbnRhbDtcclxuICAgIGNvbnN0IGV4cGVjdGVkMiA9IHRoaXMuc3dhcHBhYmxlU2l6ZXMudmVydGljYWw7XHJcblxyXG4gICAgY29uc3QgYWN0dWFsMSA9IHRoaXMuc3dhcHBhYmxlRW50cmllcy5ob3Jpem9udGFsLnZhbHVlUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBhY3R1YWwyID0gdGhpcy5zd2FwcGFibGVFbnRyaWVzLnZlcnRpY2FsLnZhbHVlUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgcmV0dXJuIGFjdHVhbDEgIT09IG51bGwgJiYgYWN0dWFsMiAhPT0gbnVsbCAmJlxyXG4gICAgICAgICAgICggKCBhY3R1YWwxLmVxdWFscyggZXhwZWN0ZWQxICkgJiYgYWN0dWFsMi5lcXVhbHMoIGV4cGVjdGVkMiApICkgfHxcclxuICAgICAgICAgICAgICggYWN0dWFsMS5lcXVhbHMoIGV4cGVjdGVkMiApICYmIGFjdHVhbDIuZXF1YWxzKCBleHBlY3RlZDEgKSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgYm90aCBwcm9wZXJ0aWVzIG1hdGNoIG9uZSBhbnN3ZXIgYnV0IG5vdCB0aGUgb3RoZXIuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGhhc05vblVuaXF1ZUJhZE1hdGNoKCkge1xyXG4gICAgLy8gQ2hlY2sgZm9yIGEgY2FzZSB3aGVyZSBib3RoIHByb3BlcnRpZXMgbWF0Y2ggb25lIGFuc3dlciBidXQgbm90IHRoZSBvdGhlclxyXG4gICAgcmV0dXJuIHRoaXMubm9uVW5pcXVlSG9yaXpvbnRhbE1hdGNoZXMoKSAmJiB0aGlzLm5vblVuaXF1ZVZlcnRpY2FsTWF0Y2hlcygpICYmICF0aGlzLmhhc05vblVuaXF1ZU1hdGNoKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgaGlnaGxpZ2h0cyBmb3Igbm9uLXVuaXF1ZSBjaGFuZ2VzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FyZWEtbW9kZWwtY29tbW9uL2lzc3Vlcy80MlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgY2hlY2tOb25VbmlxdWVDaGFuZ2VzKCkge1xyXG4gICAgaWYgKCAhdGhpcy5kZXNjcmlwdGlvbi51bmlxdWUgKSB7XHJcbiAgICAgIGlmICggdGhpcy5oYXNOb25VbmlxdWVCYWRNYXRjaCgpICkge1xyXG4gICAgICAgIHRoaXMuc3dhcHBhYmxlRW50cmllcy5ob3Jpem9udGFsLnN0YXR1c1Byb3BlcnR5LnZhbHVlID0gRW50cnlTdGF0dXMuTk9STUFMO1xyXG4gICAgICAgIHRoaXMuc3dhcHBhYmxlRW50cmllcy52ZXJ0aWNhbC5zdGF0dXNQcm9wZXJ0eS52YWx1ZSA9IEVudHJ5U3RhdHVzLk5PUk1BTDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2hvd3MgdGhlIGFuc3dlcnMgdG8gdGhlIGNoYWxsZW5nZS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2hvd0Fuc3dlcnMoKSB7XHJcbiAgICAvLyBNYXRjaCBzb2x1dGlvbnMgZm9yIDYtMSB2YXJpYWJsZXMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXJlYS1tb2RlbC1jb21tb24vaXNzdWVzLzQyXHJcbiAgICBpZiAoICF0aGlzLmRlc2NyaXB0aW9uLnVuaXF1ZSApIHtcclxuICAgICAgbGV0IHJldmVyc2VkID0gZmFsc2U7XHJcblxyXG4gICAgICBjb25zdCBleHBlY3RlZDEgPSB0aGlzLnN3YXBwYWJsZVNpemVzLmhvcml6b250YWw7XHJcbiAgICAgIGNvbnN0IGV4cGVjdGVkMiA9IHRoaXMuc3dhcHBhYmxlU2l6ZXMudmVydGljYWw7XHJcblxyXG4gICAgICBjb25zdCBhY3R1YWwxRW50cnkgPSB0aGlzLnN3YXBwYWJsZUVudHJpZXMuaG9yaXpvbnRhbDtcclxuICAgICAgY29uc3QgYWN0dWFsMkVudHJ5ID0gdGhpcy5zd2FwcGFibGVFbnRyaWVzLnZlcnRpY2FsO1xyXG5cclxuICAgICAgY29uc3QgYWN0dWFsMSA9IGFjdHVhbDFFbnRyeS52YWx1ZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICBjb25zdCBhY3R1YWwyID0gYWN0dWFsMkVudHJ5LnZhbHVlUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgICBpZiAoIGFjdHVhbDEgJiYgYWN0dWFsMiApIHtcclxuICAgICAgICBjb25zdCBtYXRjaGVzMSA9IGFjdHVhbDEuZXF1YWxzKCBleHBlY3RlZDEgKSB8fCBhY3R1YWwxLmVxdWFscyggZXhwZWN0ZWQyICk7XHJcbiAgICAgICAgY29uc3QgbWF0Y2hlczIgPSBhY3R1YWwyLmVxdWFscyggZXhwZWN0ZWQxICkgfHwgYWN0dWFsMi5lcXVhbHMoIGV4cGVjdGVkMiApO1xyXG5cclxuICAgICAgICBpZiAoIG1hdGNoZXMxICE9PSBtYXRjaGVzMiAmJiAoIGFjdHVhbDEuZXF1YWxzKCBleHBlY3RlZDIgKSB8fCBhY3R1YWwyLmVxdWFscyggZXhwZWN0ZWQxICkgKSApIHtcclxuICAgICAgICAgIHJldmVyc2VkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggcmV2ZXJzZWQgKSB7XHJcbiAgICAgICAgYWN0dWFsMUVudHJ5LnZhbHVlUHJvcGVydHkudmFsdWUgPSBleHBlY3RlZDI7XHJcbiAgICAgICAgYWN0dWFsMkVudHJ5LnZhbHVlUHJvcGVydHkudmFsdWUgPSBleHBlY3RlZDE7XHJcbiAgICAgICAgdGhpcy50b3RhbFByb3BlcnRpZXMuaG9yaXpvbnRhbC52YWx1ZSA9IHRoaXMudG90YWxzLnZlcnRpY2FsO1xyXG4gICAgICAgIHRoaXMudG90YWxQcm9wZXJ0aWVzLnZlcnRpY2FsLnZhbHVlID0gdGhpcy50b3RhbHMuaG9yaXpvbnRhbDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBhY3R1YWwxRW50cnkudmFsdWVQcm9wZXJ0eS52YWx1ZSA9IGV4cGVjdGVkMTtcclxuICAgICAgICBhY3R1YWwyRW50cnkudmFsdWVQcm9wZXJ0eS52YWx1ZSA9IGV4cGVjdGVkMjtcclxuICAgICAgICB0aGlzLnRvdGFsUHJvcGVydGllcy5ob3Jpem9udGFsLnZhbHVlID0gdGhpcy50b3RhbHMuaG9yaXpvbnRhbDtcclxuICAgICAgICB0aGlzLnRvdGFsUHJvcGVydGllcy52ZXJ0aWNhbC52YWx1ZSA9IHRoaXMudG90YWxzLnZlcnRpY2FsO1xyXG4gICAgICB9XHJcbiAgICAgIGFjdHVhbDFFbnRyeS5zdGF0dXNQcm9wZXJ0eS52YWx1ZSA9IEVudHJ5U3RhdHVzLk5PUk1BTDtcclxuICAgICAgYWN0dWFsMkVudHJ5LnN0YXR1c1Byb3BlcnR5LnZhbHVlID0gRW50cnlTdGF0dXMuTk9STUFMO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMucGFydGl0aW9uU2l6ZUVudHJpZXMuaG9yaXpvbnRhbC5mb3JFYWNoKCAoIGVudHJ5LCBpbmRleCApID0+IHtcclxuICAgICAgICBlbnRyeS52YWx1ZVByb3BlcnR5LnZhbHVlID0gdGhpcy5wYXJ0aXRpb25TaXplcy5ob3Jpem9udGFsWyBpbmRleCBdO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMucGFydGl0aW9uU2l6ZUVudHJpZXMudmVydGljYWwuZm9yRWFjaCggKCBlbnRyeSwgaW5kZXggKSA9PiB7XHJcbiAgICAgICAgZW50cnkudmFsdWVQcm9wZXJ0eS52YWx1ZSA9IHRoaXMucGFydGl0aW9uU2l6ZXMudmVydGljYWxbIGluZGV4IF07XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMudG90YWxQcm9wZXJ0aWVzLmhvcml6b250YWwudmFsdWUgPSB0aGlzLnRvdGFscy5ob3Jpem9udGFsO1xyXG4gICAgICB0aGlzLnRvdGFsUHJvcGVydGllcy52ZXJ0aWNhbC52YWx1ZSA9IHRoaXMudG90YWxzLnZlcnRpY2FsO1xyXG4gICAgfVxyXG5cclxuICAgIGRpbWVuc2lvbkZvckVhY2goIDIsIHRoaXMucGFydGlhbFByb2R1Y3RTaXplRW50cmllcywgKCBlbnRyeSwgdmVydGljYWxJbmRleCwgaG9yaXpvbnRhbEluZGV4ICkgPT4ge1xyXG4gICAgICBlbnRyeS52YWx1ZVByb3BlcnR5LnZhbHVlID0gdGhpcy5wYXJ0aWFsUHJvZHVjdFNpemVzWyB2ZXJ0aWNhbEluZGV4IF1bIGhvcml6b250YWxJbmRleCBdO1xyXG4gICAgICBlbnRyeS5zdGF0dXNQcm9wZXJ0eS52YWx1ZSA9IEVudHJ5U3RhdHVzLk5PUk1BTDtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnRvdGFsQ29uc3RhbnRFbnRyeS52YWx1ZVByb3BlcnR5LnZhbHVlID0gdGhpcy50b3RhbC5nZXRUZXJtKCAwICk7XHJcbiAgICB0aGlzLnRvdGFsWEVudHJ5LnZhbHVlUHJvcGVydHkudmFsdWUgPSB0aGlzLnRvdGFsLmdldFRlcm0oIDEgKTtcclxuICAgIHRoaXMudG90YWxYU3F1YXJlZEVudHJ5LnZhbHVlUHJvcGVydHkudmFsdWUgPSB0aGlzLnRvdGFsLmdldFRlcm0oIDIgKTtcclxuICAgIHRoaXMudG90YWxDb25zdGFudEVudHJ5LnN0YXR1c1Byb3BlcnR5LnZhbHVlID0gRW50cnlTdGF0dXMuTk9STUFMO1xyXG4gICAgdGhpcy50b3RhbFhFbnRyeS5zdGF0dXNQcm9wZXJ0eS52YWx1ZSA9IEVudHJ5U3RhdHVzLk5PUk1BTDtcclxuICAgIHRoaXMudG90YWxYU3F1YXJlZEVudHJ5LnN0YXR1c1Byb3BlcnR5LnZhbHVlID0gRW50cnlTdGF0dXMuTk9STUFMO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHRoZSB1c2VyJ3MgaW5wdXQgYWdhaW5zdCB0aGUga25vd24gYW5zd2VyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gVGhlIGFtb3VudCBvZiBzY29yZSBnYWluZWRcclxuICAgKi9cclxuICBjaGVjaygpIHtcclxuICAgIGxldCBzY29yZUluY3JlYXNlID0gMDtcclxuXHJcbiAgICBjb25zdCBiYWRFbnRyaWVzID0gdGhpcy5nZXRJbmNvcnJlY3RFbnRyaWVzKCk7XHJcbiAgICBjb25zdCBpc0NvcnJlY3QgPSBiYWRFbnRyaWVzLmxlbmd0aCA9PT0gMDtcclxuXHJcbiAgICBjb25zdCBjdXJyZW50U3RhdGUgPSB0aGlzLnN0YXRlUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgaWYgKCAhaXNDb3JyZWN0ICkge1xyXG4gICAgICBiYWRFbnRyaWVzLmZvckVhY2goIGJhZEVudHJ5ID0+IHtcclxuICAgICAgICBiYWRFbnRyeS5zdGF0dXNQcm9wZXJ0eS52YWx1ZSA9IEVudHJ5U3RhdHVzLklOQ09SUkVDVDtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggY3VycmVudFN0YXRlID09PSBHYW1lU3RhdGUuRklSU1RfQVRURU1QVCApIHtcclxuICAgICAgaWYgKCBpc0NvcnJlY3QgKSB7XHJcbiAgICAgICAgc2NvcmVJbmNyZWFzZSA9IDI7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5zdGF0ZVByb3BlcnR5LnZhbHVlID0gaXNDb3JyZWN0ID8gR2FtZVN0YXRlLkNPUlJFQ1RfQU5TV0VSIDogR2FtZVN0YXRlLldST05HX0ZJUlNUX0FOU1dFUjtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBjdXJyZW50U3RhdGUgPT09IEdhbWVTdGF0ZS5TRUNPTkRfQVRURU1QVCApIHtcclxuICAgICAgaWYgKCBpc0NvcnJlY3QgKSB7XHJcbiAgICAgICAgc2NvcmVJbmNyZWFzZSA9IDE7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5zdGF0ZVByb3BlcnR5LnZhbHVlID0gaXNDb3JyZWN0ID8gR2FtZVN0YXRlLkNPUlJFQ1RfQU5TV0VSIDogR2FtZVN0YXRlLldST05HX1NFQ09ORF9BTlNXRVI7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnSG93IGlzIGNoZWNrIHBvc3NpYmxlIGhlcmU/JyApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzY29yZUluY3JlYXNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZSB0byB0cnkgYW5vdGhlciB0aW1lLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICB0cnlBZ2FpbigpIHtcclxuICAgIHRoaXMuc3RhdGVQcm9wZXJ0eS52YWx1ZSA9IEdhbWVTdGF0ZS5TRUNPTkRfQVRURU1QVDtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBHZW5lcmF0ZXMgYSBzZXJpZXMgb2YgKHNlbWkpIHJhbmRvbSB0ZXJtcyBmb3IgcGFydGl0aW9uIHNpemVzIGZvciBhIHBhcnRpY3VsYXIgb3JpZW50YXRpb24uXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBxdWFudGl0eVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYWxsb3dFeHBvbmVudHMgLSBXaGV0aGVyIGV4cG9uZW50cyAocG93ZXJzIG9mIHgpIGFyZSBhbGxvd2VkIGZvciB0aGlzIGFyZWFcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPFRlcm0+fVxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZW5lcmF0ZVBhcnRpdGlvblRlcm1zKCBxdWFudGl0eSwgYWxsb3dFeHBvbmVudHMgKSB7XHJcbiAgICBjb25zdCBtYXhQb3dlciA9IHF1YW50aXR5IC0gMTtcclxuICAgIHJldHVybiBfLnJhbmdlKCBtYXhQb3dlciwgLTEgKS5tYXAoIHBvd2VyID0+IEFyZWFDaGFsbGVuZ2UuZ2VuZXJhdGVUZXJtKCBwb3dlciwgbWF4UG93ZXIsIHF1YW50aXR5LCBhbGxvd0V4cG9uZW50cyApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZW5lcmF0ZXMgYSAoc2VtaSkgcmFuZG9tIHRlcm0gZm9yIGEgcGFydGl0aW9uIHNpemUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwb3dlciAtIFBvd2VyIG9mICd4JyBvciAnMTAnIHRoYXQgdGhlIHNpbmdsZSBkaWdpdCBpcyBtdWx0aXBsaWVkIHRpbWVzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heFBvd2VyIC0gTWF4aW11bSBwb3dlciBmb3IgYWxsIHRlcm1zIG9mIHRoaXMgb3JpZW50YXRpb24uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHF1YW50aXR5IC0gUXVhbnRpdHkgb2YgdGVybXMgZ2VuZXJhdGVkIHRvdGFsXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBhbGxvd0V4cG9uZW50cyAtIFdoZXRoZXIgZXhwb25lbnRzIChwb3dlcnMgb2YgeCkgYXJlIGFsbG93ZWRcclxuICAgKiBAcmV0dXJucyB7VGVybX1cclxuICAgKi9cclxuICBzdGF0aWMgZ2VuZXJhdGVUZXJtKCBwb3dlciwgbWF4UG93ZXIsIHF1YW50aXR5LCBhbGxvd0V4cG9uZW50cyApIHtcclxuICAgIGlmICggYWxsb3dFeHBvbmVudHMgKSB7XHJcblxyXG4gICAgICAvLyBEb24ndCBsZXQgbGVhZGluZyB4IG9yIHheMiBoYXZlIGEgY29lZmZpY2llbnQuXHJcbiAgICAgIGlmICggcG93ZXIgPT09IG1heFBvd2VyICYmIHBvd2VyID4gMCApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oIDEsIHBvd2VyICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY29uc3Qgc2lnbiA9IGRvdFJhbmRvbS5uZXh0Qm9vbGVhbigpID8gMSA6IC0xO1xyXG5cclxuICAgICAgICAvLyBFeGNsdWRlIGEgMSBpZiBvdXIgbGVuZ3RoIGlzIDEgKHNvIHRoYXQgd2UgZG9uJ3QganVzdCBoYXZlIGEgc2luZ2xlIDEgYXMgYSBkaW1lbnNpbm9uLCBzbyB0aGVyZSBpcyB0aGVcclxuICAgICAgICAvLyBhYmlsaXR5IHRvIGhhdmUgYSBwYXJ0aXRpb24gbGluZSlcclxuICAgICAgICBjb25zdCBkaWdpdCA9IGRvdFJhbmRvbS5uZXh0SW50QmV0d2VlbiggKCBzaWduID4gMCAmJiBxdWFudGl0eSA9PT0gMSApID8gMiA6IDEsIDkgKTtcclxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oIHNpZ24gKiBkaWdpdCwgcG93ZXIgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBFeGNsdWRlIGEgMSBpZiBvdXIgbGVuZ3RoIGlzIDFcclxuICAgICAgcmV0dXJuIG5ldyBUZXJtKCBkb3RSYW5kb20ubmV4dEludEJldHdlZW4oIHF1YW50aXR5ID09PSAxID8gMiA6IDEsIDkgKSAqIE1hdGgucG93KCAxMCwgcG93ZXIgKSApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuYXJlYU1vZGVsQ29tbW9uLnJlZ2lzdGVyKCAnQXJlYUNoYWxsZW5nZScsIEFyZWFDaGFsbGVuZ2UgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFyZWFDaGFsbGVuZ2U7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLGdCQUFnQixNQUFNLDhDQUE4QztBQUMzRSxPQUFPQyxZQUFZLE1BQU0sMENBQTBDO0FBQ25FLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7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