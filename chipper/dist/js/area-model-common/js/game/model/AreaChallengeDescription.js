// Copyright 2017-2022, University of Colorado Boulder

/**
 * Describes a template for the generation of a challenge.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Permutation from '../../../../dot/js/Permutation.js';
import merge from '../../../../phet-core/js/merge.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import OrientationPair from '../../common/model/OrientationPair.js';
import GenericLayout from '../../generic/model/GenericLayout.js';
import AreaChallengeType from './AreaChallengeType.js';
import EntryType from './EntryType.js';
const levelPromptOneProductOneLengthString = AreaModelCommonStrings.levelPrompt.oneProduct.oneLength;
const levelPromptOneProductTextString = AreaModelCommonStrings.levelPrompt.oneProduct.text;
const levelPromptOneProductTotalAreaString = AreaModelCommonStrings.levelPrompt.oneProduct.totalArea;
const levelPromptThreeLengthsString = AreaModelCommonStrings.levelPrompt.threeLengths;
const levelPromptTotalAreaString = AreaModelCommonStrings.levelPrompt.totalArea;
const levelPromptTwoLengthsString = AreaModelCommonStrings.levelPrompt.twoLengths;
const levelPromptTwoProductsString = AreaModelCommonStrings.levelPrompt.twoProducts;

// shortcuts
const EDITABLE = EntryType.EDITABLE;
const DYNAMIC = EntryType.DYNAMIC;
const GIVEN = EntryType.GIVEN;

// We need the ability to generate random permutations for different numbers of elements. It's simplest if we
// enumerate the possibilities here.
const permutations = {
  1: Permutation.permutations(1),
  2: Permutation.permutations(2),
  3: Permutation.permutations(3)
};
class AreaChallengeDescription {
  /**
   * @param {Object} config
   */
  constructor(config) {
    config = merge({
      // required
      horizontal: null,
      // {Array.<EntryType>}
      vertical: null,
      // {Array.<EntryType>}
      products: null,
      // {Array.<Array.<EntryType>>}
      total: null,
      // {EntryType}
      horizontalTotal: null,
      // {EntryType}
      verticalTotal: null,
      // {EntryType}
      type: null,
      // {AreaChallengeType}

      // optional
      shufflable: true,
      unique: true
    }, config);
    assert && assert(Array.isArray(config.horizontal));
    assert && assert(Array.isArray(config.vertical));
    assert && assert(Array.isArray(config.products));
    assert && assert(_.includes(EntryType.VALUES, config.total));
    assert && assert(_.includes(EntryType.VALUES, config.horizontalTotal));
    assert && assert(_.includes(EntryType.VALUES, config.verticalTotal));
    assert && assert(_.includes(AreaChallengeType.VALUES, config.type));

    // @public {OrientationPair.<Array.<EntryType>>} - Entry types for partition sizes
    this.partitionTypes = new OrientationPair(config.horizontal, config.vertical);

    // @public {Array.<Array.<EntryType>>} - Entry types for partitioned areas
    this.productTypes = config.products;

    // @public {OrientationPair.<EntryType>} - Entry types for horizontal and vertical dimension totals
    this.dimensionTypes = new OrientationPair(config.horizontalTotal, config.verticalTotal);

    // @public {EntryType} - Entry type for the total area
    this.totalType = config.total;

    // @public {AreaChallengeType} - The type of challenge
    this.type = config.type;

    // @public {boolean}
    this.allowExponents = this.type === AreaChallengeType.VARIABLES;

    // @public {boolean} - Whether transposing is supported
    this.transposable = this.type === AreaChallengeType.NUMBERS;

    // @public {boolean}
    this.shufflable = config.shufflable;

    // @public {boolean}
    this.unique = config.unique;

    // @public {GenericLayout}
    this.layout = GenericLayout.fromValues(config.horizontal.length, config.vertical.length);
  }

  /**
   * Returns the string representing the prompt for this challenge (what should be done to solve it).
   * @public
   *
   * @returns {string}
   */
  getPromptString() {
    const hasAreaEntry = isEditable(this.totalType);
    const numProductEntries = _.flatten(this.productTypes).filter(isEditable).length;
    const numPartitionEntries = this.partitionTypes.horizontal.concat(this.partitionTypes.vertical).filter(isEditable).length;
    const text = promptMap[getPromptKey(hasAreaEntry, numProductEntries, numPartitionEntries)];
    assert && assert(text);
    return text;
  }

  /**
   * Creates a permuted/transposed version of this description, where allowed.
   * @public
   *
   * @returns {AreaChallengeDescription}
   */
  getPermutedDescription() {
    const options = {
      horizontal: this.partitionTypes.horizontal,
      vertical: this.partitionTypes.vertical,
      products: this.productTypes,
      total: this.totalType,
      horizontalTotal: this.dimensionTypes.horizontal,
      verticalTotal: this.dimensionTypes.vertical,
      type: this.type,
      transposable: this.transposable,
      unique: this.unique
    };
    if (this.shufflable) {
      // Horizontal shuffle
      const horizontalPermutation = dotRandom.sample(permutations[options.horizontal.length]);
      options.horizontal = horizontalPermutation.apply(options.horizontal);
      options.products = options.products.map(row => horizontalPermutation.apply(row));

      // Vertical shuffle
      const verticalPermutation = dotRandom.sample(permutations[options.vertical.length]);
      options.vertical = verticalPermutation.apply(options.vertical);
      options.products = verticalPermutation.apply(options.products);
    }
    if (this.transposable && dotRandom.nextBoolean()) {
      const tmpPartition = options.horizontal;
      options.horizontal = options.vertical;
      options.vertical = tmpPartition;
      const tmpTotal = options.horizontalTotal;
      options.horizontalTotal = options.verticalTotal;
      options.verticalTotal = tmpTotal;
      options.products = _.range(options.vertical.length).map(verticalIndex => _.range(options.horizontal.length).map(horizontalIndex => options.products[horizontalIndex][verticalIndex]));
    }
    return new AreaChallengeDescription(options);
  }

  /**
   * Returns a conditional value (like a ternary) based on whether this is a number or variable challenge.
   * @public
   *
   * @param {*} numberTypeValue
   * @param {*} variableTypeValue
   * @returns {*}
   */
  numberOrVariable(numberTypeValue, variableTypeValue) {
    return this.type === AreaChallengeType.VARIABLES ? variableTypeValue : numberTypeValue;
  }
}
areaModelCommon.register('AreaChallengeDescription', AreaChallengeDescription);

/**
 * Returns a string key used for looking up the proper prompt in promptMap below.
 * @private
 *
 * @param {boolean} hasAreaEntry
 * @param {number} numProductEntries
 * @param {number} numPartitionEntries
 * @returns {string}
 */
function getPromptKey(hasAreaEntry, numProductEntries, numPartitionEntries) {
  return `${hasAreaEntry},${numProductEntries},${numPartitionEntries}`;
}
const promptMap = {};
promptMap[getPromptKey(true, 0, 0)] = levelPromptTotalAreaString;
promptMap[getPromptKey(false, 1, 0)] = levelPromptOneProductTextString;
promptMap[getPromptKey(false, 2, 0)] = levelPromptTwoProductsString;
promptMap[getPromptKey(true, 1, 0)] = levelPromptOneProductTotalAreaString;
promptMap[getPromptKey(false, 1, 1)] = levelPromptOneProductOneLengthString;
promptMap[getPromptKey(false, 0, 2)] = levelPromptTwoLengthsString;
promptMap[getPromptKey(false, 0, 3)] = levelPromptThreeLengthsString;
function isEditable(type) {
  return type === EntryType.EDITABLE;
}

/*---------------------------------------------------------------------------*
* Numbers 1
*----------------------------------------------------------------------------*/

// L1-1
AreaChallengeDescription.LEVEL_1_NUMBERS_1 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN],
  vertical: [GIVEN],
  products: [[GIVEN, GIVEN]],
  total: EDITABLE,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

// L1-2
AreaChallengeDescription.LEVEL_1_NUMBERS_2 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN],
  vertical: [GIVEN],
  products: [[EDITABLE, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

// L1-3
AreaChallengeDescription.LEVEL_1_NUMBERS_3 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN, GIVEN],
  vertical: [GIVEN],
  products: [[GIVEN, GIVEN, GIVEN]],
  total: EDITABLE,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

// L1-4
AreaChallengeDescription.LEVEL_1_NUMBERS_4 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN, GIVEN],
  vertical: [GIVEN],
  products: [[EDITABLE, GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

// L1-5
AreaChallengeDescription.LEVEL_1_NUMBERS_5 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN],
  vertical: [GIVEN, GIVEN],
  products: [[GIVEN, GIVEN], [GIVEN, GIVEN]],
  total: EDITABLE,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

// L1-6
AreaChallengeDescription.LEVEL_1_NUMBERS_6 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN],
  vertical: [GIVEN, GIVEN],
  products: [[EDITABLE, GIVEN], [GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

/*---------------------------------------------------------------------------*
* Numbers 2
*----------------------------------------------------------------------------*/

// L2-1
AreaChallengeDescription.LEVEL_2_NUMBERS_1 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN],
  vertical: [GIVEN, GIVEN],
  products: [[EDITABLE, GIVEN], [GIVEN, EDITABLE]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

// L2-2
AreaChallengeDescription.LEVEL_2_NUMBERS_2 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN],
  vertical: [GIVEN, GIVEN],
  products: [[EDITABLE, GIVEN], [GIVEN, GIVEN]],
  total: EDITABLE,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

// L2-3
AreaChallengeDescription.LEVEL_2_NUMBERS_3 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN, GIVEN],
  vertical: [GIVEN, GIVEN],
  products: [[EDITABLE, GIVEN, GIVEN], [GIVEN, EDITABLE, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

// L2-4
AreaChallengeDescription.LEVEL_2_NUMBERS_4 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN, GIVEN],
  vertical: [GIVEN, GIVEN],
  products: [[EDITABLE, GIVEN, GIVEN], [GIVEN, GIVEN, GIVEN]],
  total: EDITABLE,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

// L2-5
AreaChallengeDescription.LEVEL_2_NUMBERS_5 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN, GIVEN],
  vertical: [GIVEN, GIVEN, GIVEN],
  products: [[EDITABLE, GIVEN, GIVEN], [GIVEN, EDITABLE, GIVEN], [GIVEN, GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

/*---------------------------------------------------------------------------*
* Numbers 3
*----------------------------------------------------------------------------*/

// L3-1
AreaChallengeDescription.LEVEL_3_NUMBERS_1 = new AreaChallengeDescription({
  horizontal: [EDITABLE, EDITABLE],
  vertical: [GIVEN],
  products: [[DYNAMIC, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

// L3-2
AreaChallengeDescription.LEVEL_3_NUMBERS_2 = new AreaChallengeDescription({
  horizontal: [EDITABLE, GIVEN],
  vertical: [EDITABLE],
  products: [[DYNAMIC, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.NUMBERS
});

// L3-3
AreaChallengeDescription.LEVEL_3_NUMBERS_3 = new AreaChallengeDescription({
  horizontal: [EDITABLE, EDITABLE, GIVEN],
  vertical: [GIVEN],
  products: [[DYNAMIC, GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

// L3-4
AreaChallengeDescription.LEVEL_3_NUMBERS_4 = new AreaChallengeDescription({
  horizontal: [EDITABLE, GIVEN, GIVEN],
  vertical: [EDITABLE],
  products: [[GIVEN, GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.NUMBERS
});

// L3-5
AreaChallengeDescription.LEVEL_3_NUMBERS_5 = new AreaChallengeDescription({
  horizontal: [EDITABLE, GIVEN],
  vertical: [EDITABLE, GIVEN],
  products: [[GIVEN, DYNAMIC], [DYNAMIC, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

// L3-6
AreaChallengeDescription.LEVEL_3_NUMBERS_6 = new AreaChallengeDescription({
  horizontal: [EDITABLE, GIVEN],
  vertical: [EDITABLE, GIVEN],
  products: [[DYNAMIC, GIVEN], [GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

/*---------------------------------------------------------------------------*
* Numbers 4
*----------------------------------------------------------------------------*/

// L4-1
AreaChallengeDescription.LEVEL_4_NUMBERS_1 = new AreaChallengeDescription({
  horizontal: [EDITABLE, EDITABLE, EDITABLE],
  vertical: [GIVEN, GIVEN],
  products: [[DYNAMIC, GIVEN, GIVEN], [GIVEN, DYNAMIC, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

// L4-2
AreaChallengeDescription.LEVEL_4_NUMBERS_2 = new AreaChallengeDescription({
  horizontal: [EDITABLE, EDITABLE, GIVEN],
  vertical: [EDITABLE, GIVEN],
  products: [[DYNAMIC, GIVEN, GIVEN], [GIVEN, GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

// L4-3
AreaChallengeDescription.LEVEL_4_NUMBERS_3 = new AreaChallengeDescription({
  horizontal: [EDITABLE, EDITABLE, GIVEN],
  vertical: [EDITABLE, GIVEN],
  products: [[DYNAMIC, GIVEN, GIVEN], [GIVEN, DYNAMIC, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

// L4-4
AreaChallengeDescription.LEVEL_4_NUMBERS_4 = new AreaChallengeDescription({
  horizontal: [EDITABLE, EDITABLE, EDITABLE],
  vertical: [GIVEN, GIVEN, GIVEN],
  products: [[DYNAMIC, GIVEN, GIVEN], [GIVEN, DYNAMIC, GIVEN], [GIVEN, GIVEN, DYNAMIC]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

// L4-5
AreaChallengeDescription.LEVEL_4_NUMBERS_5 = new AreaChallengeDescription({
  horizontal: [EDITABLE, EDITABLE, GIVEN],
  vertical: [EDITABLE, GIVEN, GIVEN],
  products: [[DYNAMIC, GIVEN, GIVEN], [GIVEN, DYNAMIC, GIVEN], [GIVEN, GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
});

/*---------------------------------------------------------------------------*
* Numbers 5
*----------------------------------------------------------------------------*/

// L5-1
AreaChallengeDescription.LEVEL_5_NUMBERS_1 = new AreaChallengeDescription({
  horizontal: [EDITABLE, GIVEN],
  vertical: [EDITABLE],
  products: [[GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: DYNAMIC,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.NUMBERS
});

// L5-3
AreaChallengeDescription.LEVEL_5_NUMBERS_3 = new AreaChallengeDescription({
  horizontal: [EDITABLE, GIVEN, GIVEN],
  vertical: [EDITABLE],
  products: [[GIVEN, GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: DYNAMIC,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.NUMBERS
});

/*---------------------------------------------------------------------------*
* Numbers 6
*----------------------------------------------------------------------------*/

// L6-1
AreaChallengeDescription.LEVEL_6_NUMBERS_1 = new AreaChallengeDescription({
  horizontal: [EDITABLE, EDITABLE],
  vertical: [EDITABLE, GIVEN],
  products: [[GIVEN, GIVEN], [GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: DYNAMIC,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.NUMBERS
});

/*---------------------------------------------------------------------------*
* Variables 1
*----------------------------------------------------------------------------*/

// L1-1
AreaChallengeDescription.LEVEL_1_VARIABLES_1 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN],
  vertical: [GIVEN],
  products: [[EDITABLE, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
});

// L1-2
AreaChallengeDescription.LEVEL_1_VARIABLES_2 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN],
  vertical: [GIVEN],
  products: [[GIVEN, GIVEN]],
  total: EDITABLE,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
});

// L1-3
AreaChallengeDescription.LEVEL_1_VARIABLES_3 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN, GIVEN],
  vertical: [GIVEN],
  products: [[EDITABLE, GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
});

// L1-4
AreaChallengeDescription.LEVEL_1_VARIABLES_4 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN, GIVEN],
  vertical: [GIVEN],
  products: [[GIVEN, GIVEN, GIVEN]],
  total: EDITABLE,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
});

/*---------------------------------------------------------------------------*
* Variables 2
*----------------------------------------------------------------------------*/

// L2-1
AreaChallengeDescription.LEVEL_2_VARIABLES_1 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN],
  vertical: [GIVEN, GIVEN],
  products: [[EDITABLE, GIVEN], [GIVEN, EDITABLE]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
});

// L2-2
AreaChallengeDescription.LEVEL_2_VARIABLES_2 = new AreaChallengeDescription({
  horizontal: [GIVEN, GIVEN],
  vertical: [GIVEN, GIVEN],
  products: [[EDITABLE, GIVEN], [GIVEN, GIVEN]],
  total: EDITABLE,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
});

/*---------------------------------------------------------------------------*
* Variables 3
*----------------------------------------------------------------------------*/

// L3-1
AreaChallengeDescription.LEVEL_3_VARIABLES_1 = new AreaChallengeDescription({
  horizontal: [EDITABLE, GIVEN],
  vertical: [EDITABLE],
  products: [[GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.VARIABLES
});

// L3-2
AreaChallengeDescription.LEVEL_3_VARIABLES_2 = new AreaChallengeDescription({
  horizontal: [EDITABLE, EDITABLE],
  vertical: [GIVEN],
  products: [[DYNAMIC, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
});

// L3-3
AreaChallengeDescription.LEVEL_3_VARIABLES_3 = new AreaChallengeDescription({
  horizontal: [EDITABLE, GIVEN],
  vertical: [GIVEN],
  products: [[GIVEN, EDITABLE]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
});

// L3-4
AreaChallengeDescription.LEVEL_3_VARIABLES_4 = new AreaChallengeDescription({
  horizontal: [EDITABLE, GIVEN, GIVEN],
  vertical: [EDITABLE],
  products: [[GIVEN, DYNAMIC, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.VARIABLES
});

// L3-5
AreaChallengeDescription.LEVEL_3_VARIABLES_5 = new AreaChallengeDescription({
  horizontal: [EDITABLE, EDITABLE, GIVEN],
  vertical: [GIVEN],
  products: [[DYNAMIC, GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
});

// L3-6
AreaChallengeDescription.LEVEL_3_VARIABLES_6 = new AreaChallengeDescription({
  horizontal: [EDITABLE, GIVEN, GIVEN],
  vertical: [GIVEN],
  products: [[GIVEN, EDITABLE, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
});

/*---------------------------------------------------------------------------*
* Variables 4
*----------------------------------------------------------------------------*/

// L4-1
AreaChallengeDescription.LEVEL_4_VARIABLES_1 = new AreaChallengeDescription({
  horizontal: [EDITABLE, GIVEN],
  vertical: [EDITABLE, GIVEN],
  products: [[GIVEN, DYNAMIC], [DYNAMIC, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
});

// L4-2
AreaChallengeDescription.LEVEL_4_VARIABLES_2 = new AreaChallengeDescription({
  horizontal: [EDITABLE, GIVEN],
  vertical: [GIVEN, GIVEN],
  products: [[GIVEN, EDITABLE], [GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
});

/*---------------------------------------------------------------------------*
* Variables 5
*----------------------------------------------------------------------------*/

// L5-1
AreaChallengeDescription.LEVEL_5_VARIABLES_1 = new AreaChallengeDescription({
  horizontal: [EDITABLE, GIVEN],
  vertical: [EDITABLE],
  products: [[GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: DYNAMIC,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.VARIABLES
});

// L5-2
AreaChallengeDescription.LEVEL_5_VARIABLES_2 = new AreaChallengeDescription({
  horizontal: [EDITABLE, GIVEN, GIVEN],
  vertical: [EDITABLE],
  products: [[GIVEN, GIVEN, GIVEN]],
  total: GIVEN,
  horizontalTotal: DYNAMIC,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.VARIABLES
});

/*---------------------------------------------------------------------------*
* Variables 6
*----------------------------------------------------------------------------*/

// L6-1
AreaChallengeDescription.LEVEL_6_VARIABLES_1 = new AreaChallengeDescription({
  horizontal: [GIVEN, EDITABLE],
  vertical: [GIVEN, EDITABLE],
  products: [[GIVEN, DYNAMIC], [DYNAMIC, GIVEN]],
  total: GIVEN,
  horizontalTotal: DYNAMIC,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.VARIABLES,
  shufflable: false,
  unique: false
});
export default AreaChallengeDescription;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJQZXJtdXRhdGlvbiIsIm1lcmdlIiwiYXJlYU1vZGVsQ29tbW9uIiwiQXJlYU1vZGVsQ29tbW9uU3RyaW5ncyIsIk9yaWVudGF0aW9uUGFpciIsIkdlbmVyaWNMYXlvdXQiLCJBcmVhQ2hhbGxlbmdlVHlwZSIsIkVudHJ5VHlwZSIsImxldmVsUHJvbXB0T25lUHJvZHVjdE9uZUxlbmd0aFN0cmluZyIsImxldmVsUHJvbXB0Iiwib25lUHJvZHVjdCIsIm9uZUxlbmd0aCIsImxldmVsUHJvbXB0T25lUHJvZHVjdFRleHRTdHJpbmciLCJ0ZXh0IiwibGV2ZWxQcm9tcHRPbmVQcm9kdWN0VG90YWxBcmVhU3RyaW5nIiwidG90YWxBcmVhIiwibGV2ZWxQcm9tcHRUaHJlZUxlbmd0aHNTdHJpbmciLCJ0aHJlZUxlbmd0aHMiLCJsZXZlbFByb21wdFRvdGFsQXJlYVN0cmluZyIsImxldmVsUHJvbXB0VHdvTGVuZ3Roc1N0cmluZyIsInR3b0xlbmd0aHMiLCJsZXZlbFByb21wdFR3b1Byb2R1Y3RzU3RyaW5nIiwidHdvUHJvZHVjdHMiLCJFRElUQUJMRSIsIkRZTkFNSUMiLCJHSVZFTiIsInBlcm11dGF0aW9ucyIsIkFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbiIsImNvbnN0cnVjdG9yIiwiY29uZmlnIiwiaG9yaXpvbnRhbCIsInZlcnRpY2FsIiwicHJvZHVjdHMiLCJ0b3RhbCIsImhvcml6b250YWxUb3RhbCIsInZlcnRpY2FsVG90YWwiLCJ0eXBlIiwic2h1ZmZsYWJsZSIsInVuaXF1ZSIsImFzc2VydCIsIkFycmF5IiwiaXNBcnJheSIsIl8iLCJpbmNsdWRlcyIsIlZBTFVFUyIsInBhcnRpdGlvblR5cGVzIiwicHJvZHVjdFR5cGVzIiwiZGltZW5zaW9uVHlwZXMiLCJ0b3RhbFR5cGUiLCJhbGxvd0V4cG9uZW50cyIsIlZBUklBQkxFUyIsInRyYW5zcG9zYWJsZSIsIk5VTUJFUlMiLCJsYXlvdXQiLCJmcm9tVmFsdWVzIiwibGVuZ3RoIiwiZ2V0UHJvbXB0U3RyaW5nIiwiaGFzQXJlYUVudHJ5IiwiaXNFZGl0YWJsZSIsIm51bVByb2R1Y3RFbnRyaWVzIiwiZmxhdHRlbiIsImZpbHRlciIsIm51bVBhcnRpdGlvbkVudHJpZXMiLCJjb25jYXQiLCJwcm9tcHRNYXAiLCJnZXRQcm9tcHRLZXkiLCJnZXRQZXJtdXRlZERlc2NyaXB0aW9uIiwib3B0aW9ucyIsImhvcml6b250YWxQZXJtdXRhdGlvbiIsInNhbXBsZSIsImFwcGx5IiwibWFwIiwicm93IiwidmVydGljYWxQZXJtdXRhdGlvbiIsIm5leHRCb29sZWFuIiwidG1wUGFydGl0aW9uIiwidG1wVG90YWwiLCJyYW5nZSIsInZlcnRpY2FsSW5kZXgiLCJob3Jpem9udGFsSW5kZXgiLCJudW1iZXJPclZhcmlhYmxlIiwibnVtYmVyVHlwZVZhbHVlIiwidmFyaWFibGVUeXBlVmFsdWUiLCJyZWdpc3RlciIsIkxFVkVMXzFfTlVNQkVSU18xIiwiTEVWRUxfMV9OVU1CRVJTXzIiLCJMRVZFTF8xX05VTUJFUlNfMyIsIkxFVkVMXzFfTlVNQkVSU180IiwiTEVWRUxfMV9OVU1CRVJTXzUiLCJMRVZFTF8xX05VTUJFUlNfNiIsIkxFVkVMXzJfTlVNQkVSU18xIiwiTEVWRUxfMl9OVU1CRVJTXzIiLCJMRVZFTF8yX05VTUJFUlNfMyIsIkxFVkVMXzJfTlVNQkVSU180IiwiTEVWRUxfMl9OVU1CRVJTXzUiLCJMRVZFTF8zX05VTUJFUlNfMSIsIkxFVkVMXzNfTlVNQkVSU18yIiwiTEVWRUxfM19OVU1CRVJTXzMiLCJMRVZFTF8zX05VTUJFUlNfNCIsIkxFVkVMXzNfTlVNQkVSU181IiwiTEVWRUxfM19OVU1CRVJTXzYiLCJMRVZFTF80X05VTUJFUlNfMSIsIkxFVkVMXzRfTlVNQkVSU18yIiwiTEVWRUxfNF9OVU1CRVJTXzMiLCJMRVZFTF80X05VTUJFUlNfNCIsIkxFVkVMXzRfTlVNQkVSU181IiwiTEVWRUxfNV9OVU1CRVJTXzEiLCJMRVZFTF81X05VTUJFUlNfMyIsIkxFVkVMXzZfTlVNQkVSU18xIiwiTEVWRUxfMV9WQVJJQUJMRVNfMSIsIkxFVkVMXzFfVkFSSUFCTEVTXzIiLCJMRVZFTF8xX1ZBUklBQkxFU18zIiwiTEVWRUxfMV9WQVJJQUJMRVNfNCIsIkxFVkVMXzJfVkFSSUFCTEVTXzEiLCJMRVZFTF8yX1ZBUklBQkxFU18yIiwiTEVWRUxfM19WQVJJQUJMRVNfMSIsIkxFVkVMXzNfVkFSSUFCTEVTXzIiLCJMRVZFTF8zX1ZBUklBQkxFU18zIiwiTEVWRUxfM19WQVJJQUJMRVNfNCIsIkxFVkVMXzNfVkFSSUFCTEVTXzUiLCJMRVZFTF8zX1ZBUklBQkxFU182IiwiTEVWRUxfNF9WQVJJQUJMRVNfMSIsIkxFVkVMXzRfVkFSSUFCTEVTXzIiLCJMRVZFTF81X1ZBUklBQkxFU18xIiwiTEVWRUxfNV9WQVJJQUJMRVNfMiIsIkxFVkVMXzZfVkFSSUFCTEVTXzEiXSwic291cmNlcyI6WyJBcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGVzY3JpYmVzIGEgdGVtcGxhdGUgZm9yIHRoZSBnZW5lcmF0aW9uIG9mIGEgY2hhbGxlbmdlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFBlcm11dGF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9QZXJtdXRhdGlvbi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgYXJlYU1vZGVsQ29tbW9uIGZyb20gJy4uLy4uL2FyZWFNb2RlbENvbW1vbi5qcyc7XHJcbmltcG9ydCBBcmVhTW9kZWxDb21tb25TdHJpbmdzIGZyb20gJy4uLy4uL0FyZWFNb2RlbENvbW1vblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgT3JpZW50YXRpb25QYWlyIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9PcmllbnRhdGlvblBhaXIuanMnO1xyXG5pbXBvcnQgR2VuZXJpY0xheW91dCBmcm9tICcuLi8uLi9nZW5lcmljL21vZGVsL0dlbmVyaWNMYXlvdXQuanMnO1xyXG5pbXBvcnQgQXJlYUNoYWxsZW5nZVR5cGUgZnJvbSAnLi9BcmVhQ2hhbGxlbmdlVHlwZS5qcyc7XHJcbmltcG9ydCBFbnRyeVR5cGUgZnJvbSAnLi9FbnRyeVR5cGUuanMnO1xyXG5cclxuY29uc3QgbGV2ZWxQcm9tcHRPbmVQcm9kdWN0T25lTGVuZ3RoU3RyaW5nID0gQXJlYU1vZGVsQ29tbW9uU3RyaW5ncy5sZXZlbFByb21wdC5vbmVQcm9kdWN0Lm9uZUxlbmd0aDtcclxuY29uc3QgbGV2ZWxQcm9tcHRPbmVQcm9kdWN0VGV4dFN0cmluZyA9IEFyZWFNb2RlbENvbW1vblN0cmluZ3MubGV2ZWxQcm9tcHQub25lUHJvZHVjdC50ZXh0O1xyXG5jb25zdCBsZXZlbFByb21wdE9uZVByb2R1Y3RUb3RhbEFyZWFTdHJpbmcgPSBBcmVhTW9kZWxDb21tb25TdHJpbmdzLmxldmVsUHJvbXB0Lm9uZVByb2R1Y3QudG90YWxBcmVhO1xyXG5jb25zdCBsZXZlbFByb21wdFRocmVlTGVuZ3Roc1N0cmluZyA9IEFyZWFNb2RlbENvbW1vblN0cmluZ3MubGV2ZWxQcm9tcHQudGhyZWVMZW5ndGhzO1xyXG5jb25zdCBsZXZlbFByb21wdFRvdGFsQXJlYVN0cmluZyA9IEFyZWFNb2RlbENvbW1vblN0cmluZ3MubGV2ZWxQcm9tcHQudG90YWxBcmVhO1xyXG5jb25zdCBsZXZlbFByb21wdFR3b0xlbmd0aHNTdHJpbmcgPSBBcmVhTW9kZWxDb21tb25TdHJpbmdzLmxldmVsUHJvbXB0LnR3b0xlbmd0aHM7XHJcbmNvbnN0IGxldmVsUHJvbXB0VHdvUHJvZHVjdHNTdHJpbmcgPSBBcmVhTW9kZWxDb21tb25TdHJpbmdzLmxldmVsUHJvbXB0LnR3b1Byb2R1Y3RzO1xyXG5cclxuLy8gc2hvcnRjdXRzXHJcbmNvbnN0IEVESVRBQkxFID0gRW50cnlUeXBlLkVESVRBQkxFO1xyXG5jb25zdCBEWU5BTUlDID0gRW50cnlUeXBlLkRZTkFNSUM7XHJcbmNvbnN0IEdJVkVOID0gRW50cnlUeXBlLkdJVkVOO1xyXG5cclxuLy8gV2UgbmVlZCB0aGUgYWJpbGl0eSB0byBnZW5lcmF0ZSByYW5kb20gcGVybXV0YXRpb25zIGZvciBkaWZmZXJlbnQgbnVtYmVycyBvZiBlbGVtZW50cy4gSXQncyBzaW1wbGVzdCBpZiB3ZVxyXG4vLyBlbnVtZXJhdGUgdGhlIHBvc3NpYmlsaXRpZXMgaGVyZS5cclxuY29uc3QgcGVybXV0YXRpb25zID0ge1xyXG4gIDE6IFBlcm11dGF0aW9uLnBlcm11dGF0aW9ucyggMSApLFxyXG4gIDI6IFBlcm11dGF0aW9uLnBlcm11dGF0aW9ucyggMiApLFxyXG4gIDM6IFBlcm11dGF0aW9uLnBlcm11dGF0aW9ucyggMyApXHJcbn07XHJcblxyXG5jbGFzcyBBcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24ge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWdcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY29uZmlnICkge1xyXG4gICAgY29uZmlnID0gbWVyZ2UoIHtcclxuICAgICAgLy8gcmVxdWlyZWRcclxuICAgICAgaG9yaXpvbnRhbDogbnVsbCwgLy8ge0FycmF5LjxFbnRyeVR5cGU+fVxyXG4gICAgICB2ZXJ0aWNhbDogbnVsbCwgLy8ge0FycmF5LjxFbnRyeVR5cGU+fVxyXG4gICAgICBwcm9kdWN0czogbnVsbCwgLy8ge0FycmF5LjxBcnJheS48RW50cnlUeXBlPj59XHJcbiAgICAgIHRvdGFsOiBudWxsLCAvLyB7RW50cnlUeXBlfVxyXG4gICAgICBob3Jpem9udGFsVG90YWw6IG51bGwsIC8vIHtFbnRyeVR5cGV9XHJcbiAgICAgIHZlcnRpY2FsVG90YWw6IG51bGwsIC8vIHtFbnRyeVR5cGV9XHJcbiAgICAgIHR5cGU6IG51bGwsIC8vIHtBcmVhQ2hhbGxlbmdlVHlwZX1cclxuXHJcbiAgICAgIC8vIG9wdGlvbmFsXHJcbiAgICAgIHNodWZmbGFibGU6IHRydWUsXHJcbiAgICAgIHVuaXF1ZTogdHJ1ZVxyXG4gICAgfSwgY29uZmlnICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggY29uZmlnLmhvcml6b250YWwgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggY29uZmlnLnZlcnRpY2FsICkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGNvbmZpZy5wcm9kdWN0cyApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBFbnRyeVR5cGUuVkFMVUVTLCBjb25maWcudG90YWwgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggRW50cnlUeXBlLlZBTFVFUywgY29uZmlnLmhvcml6b250YWxUb3RhbCApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBFbnRyeVR5cGUuVkFMVUVTLCBjb25maWcudmVydGljYWxUb3RhbCApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBBcmVhQ2hhbGxlbmdlVHlwZS5WQUxVRVMsIGNvbmZpZy50eXBlICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtPcmllbnRhdGlvblBhaXIuPEFycmF5LjxFbnRyeVR5cGU+Pn0gLSBFbnRyeSB0eXBlcyBmb3IgcGFydGl0aW9uIHNpemVzXHJcbiAgICB0aGlzLnBhcnRpdGlvblR5cGVzID0gbmV3IE9yaWVudGF0aW9uUGFpciggY29uZmlnLmhvcml6b250YWwsIGNvbmZpZy52ZXJ0aWNhbCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxBcnJheS48RW50cnlUeXBlPj59IC0gRW50cnkgdHlwZXMgZm9yIHBhcnRpdGlvbmVkIGFyZWFzXHJcbiAgICB0aGlzLnByb2R1Y3RUeXBlcyA9IGNvbmZpZy5wcm9kdWN0cztcclxuXHJcbiAgICAvLyBAcHVibGljIHtPcmllbnRhdGlvblBhaXIuPEVudHJ5VHlwZT59IC0gRW50cnkgdHlwZXMgZm9yIGhvcml6b250YWwgYW5kIHZlcnRpY2FsIGRpbWVuc2lvbiB0b3RhbHNcclxuICAgIHRoaXMuZGltZW5zaW9uVHlwZXMgPSBuZXcgT3JpZW50YXRpb25QYWlyKCBjb25maWcuaG9yaXpvbnRhbFRvdGFsLCBjb25maWcudmVydGljYWxUb3RhbCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0VudHJ5VHlwZX0gLSBFbnRyeSB0eXBlIGZvciB0aGUgdG90YWwgYXJlYVxyXG4gICAgdGhpcy50b3RhbFR5cGUgPSBjb25maWcudG90YWw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJlYUNoYWxsZW5nZVR5cGV9IC0gVGhlIHR5cGUgb2YgY2hhbGxlbmdlXHJcbiAgICB0aGlzLnR5cGUgPSBjb25maWcudHlwZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufVxyXG4gICAgdGhpcy5hbGxvd0V4cG9uZW50cyA9IHRoaXMudHlwZSA9PT0gQXJlYUNoYWxsZW5nZVR5cGUuVkFSSUFCTEVTO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gV2hldGhlciB0cmFuc3Bvc2luZyBpcyBzdXBwb3J0ZWRcclxuICAgIHRoaXMudHJhbnNwb3NhYmxlID0gdGhpcy50eXBlID09PSBBcmVhQ2hhbGxlbmdlVHlwZS5OVU1CRVJTO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59XHJcbiAgICB0aGlzLnNodWZmbGFibGUgPSBjb25maWcuc2h1ZmZsYWJsZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufVxyXG4gICAgdGhpcy51bmlxdWUgPSBjb25maWcudW5pcXVlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0dlbmVyaWNMYXlvdXR9XHJcbiAgICB0aGlzLmxheW91dCA9IEdlbmVyaWNMYXlvdXQuZnJvbVZhbHVlcyggY29uZmlnLmhvcml6b250YWwubGVuZ3RoLCBjb25maWcudmVydGljYWwubGVuZ3RoICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBwcm9tcHQgZm9yIHRoaXMgY2hhbGxlbmdlICh3aGF0IHNob3VsZCBiZSBkb25lIHRvIHNvbHZlIGl0KS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldFByb21wdFN0cmluZygpIHtcclxuICAgIGNvbnN0IGhhc0FyZWFFbnRyeSA9IGlzRWRpdGFibGUoIHRoaXMudG90YWxUeXBlICk7XHJcbiAgICBjb25zdCBudW1Qcm9kdWN0RW50cmllcyA9IF8uZmxhdHRlbiggdGhpcy5wcm9kdWN0VHlwZXMgKS5maWx0ZXIoIGlzRWRpdGFibGUgKS5sZW5ndGg7XHJcbiAgICBjb25zdCBudW1QYXJ0aXRpb25FbnRyaWVzID0gdGhpcy5wYXJ0aXRpb25UeXBlcy5ob3Jpem9udGFsLmNvbmNhdCggdGhpcy5wYXJ0aXRpb25UeXBlcy52ZXJ0aWNhbCApLmZpbHRlciggaXNFZGl0YWJsZSApLmxlbmd0aDtcclxuXHJcbiAgICBjb25zdCB0ZXh0ID0gcHJvbXB0TWFwWyBnZXRQcm9tcHRLZXkoIGhhc0FyZWFFbnRyeSwgbnVtUHJvZHVjdEVudHJpZXMsIG51bVBhcnRpdGlvbkVudHJpZXMgKSBdO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGV4dCApO1xyXG5cclxuICAgIHJldHVybiB0ZXh0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHBlcm11dGVkL3RyYW5zcG9zZWQgdmVyc2lvbiBvZiB0aGlzIGRlc2NyaXB0aW9uLCB3aGVyZSBhbGxvd2VkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtBcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb259XHJcbiAgICovXHJcbiAgZ2V0UGVybXV0ZWREZXNjcmlwdGlvbigpIHtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIGhvcml6b250YWw6IHRoaXMucGFydGl0aW9uVHlwZXMuaG9yaXpvbnRhbCxcclxuICAgICAgdmVydGljYWw6IHRoaXMucGFydGl0aW9uVHlwZXMudmVydGljYWwsXHJcbiAgICAgIHByb2R1Y3RzOiB0aGlzLnByb2R1Y3RUeXBlcyxcclxuICAgICAgdG90YWw6IHRoaXMudG90YWxUeXBlLFxyXG4gICAgICBob3Jpem9udGFsVG90YWw6IHRoaXMuZGltZW5zaW9uVHlwZXMuaG9yaXpvbnRhbCxcclxuICAgICAgdmVydGljYWxUb3RhbDogdGhpcy5kaW1lbnNpb25UeXBlcy52ZXJ0aWNhbCxcclxuICAgICAgdHlwZTogdGhpcy50eXBlLFxyXG4gICAgICB0cmFuc3Bvc2FibGU6IHRoaXMudHJhbnNwb3NhYmxlLFxyXG4gICAgICB1bmlxdWU6IHRoaXMudW5pcXVlXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICggdGhpcy5zaHVmZmxhYmxlICkge1xyXG4gICAgICAvLyBIb3Jpem9udGFsIHNodWZmbGVcclxuICAgICAgY29uc3QgaG9yaXpvbnRhbFBlcm11dGF0aW9uID0gZG90UmFuZG9tLnNhbXBsZSggcGVybXV0YXRpb25zWyBvcHRpb25zLmhvcml6b250YWwubGVuZ3RoIF0gKTtcclxuICAgICAgb3B0aW9ucy5ob3Jpem9udGFsID0gaG9yaXpvbnRhbFBlcm11dGF0aW9uLmFwcGx5KCBvcHRpb25zLmhvcml6b250YWwgKTtcclxuICAgICAgb3B0aW9ucy5wcm9kdWN0cyA9IG9wdGlvbnMucHJvZHVjdHMubWFwKCByb3cgPT4gaG9yaXpvbnRhbFBlcm11dGF0aW9uLmFwcGx5KCByb3cgKSApO1xyXG5cclxuICAgICAgLy8gVmVydGljYWwgc2h1ZmZsZVxyXG4gICAgICBjb25zdCB2ZXJ0aWNhbFBlcm11dGF0aW9uID0gZG90UmFuZG9tLnNhbXBsZSggcGVybXV0YXRpb25zWyBvcHRpb25zLnZlcnRpY2FsLmxlbmd0aCBdICk7XHJcbiAgICAgIG9wdGlvbnMudmVydGljYWwgPSB2ZXJ0aWNhbFBlcm11dGF0aW9uLmFwcGx5KCBvcHRpb25zLnZlcnRpY2FsICk7XHJcbiAgICAgIG9wdGlvbnMucHJvZHVjdHMgPSB2ZXJ0aWNhbFBlcm11dGF0aW9uLmFwcGx5KCBvcHRpb25zLnByb2R1Y3RzICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLnRyYW5zcG9zYWJsZSAmJiBkb3RSYW5kb20ubmV4dEJvb2xlYW4oKSApIHtcclxuICAgICAgY29uc3QgdG1wUGFydGl0aW9uID0gb3B0aW9ucy5ob3Jpem9udGFsO1xyXG4gICAgICBvcHRpb25zLmhvcml6b250YWwgPSBvcHRpb25zLnZlcnRpY2FsO1xyXG4gICAgICBvcHRpb25zLnZlcnRpY2FsID0gdG1wUGFydGl0aW9uO1xyXG5cclxuICAgICAgY29uc3QgdG1wVG90YWwgPSBvcHRpb25zLmhvcml6b250YWxUb3RhbDtcclxuICAgICAgb3B0aW9ucy5ob3Jpem9udGFsVG90YWwgPSBvcHRpb25zLnZlcnRpY2FsVG90YWw7XHJcbiAgICAgIG9wdGlvbnMudmVydGljYWxUb3RhbCA9IHRtcFRvdGFsO1xyXG5cclxuICAgICAgb3B0aW9ucy5wcm9kdWN0cyA9IF8ucmFuZ2UoIG9wdGlvbnMudmVydGljYWwubGVuZ3RoICkubWFwKCB2ZXJ0aWNhbEluZGV4ID0+IF8ucmFuZ2UoIG9wdGlvbnMuaG9yaXpvbnRhbC5sZW5ndGggKS5tYXAoIGhvcml6b250YWxJbmRleCA9PiBvcHRpb25zLnByb2R1Y3RzWyBob3Jpem9udGFsSW5kZXggXVsgdmVydGljYWxJbmRleCBdICkgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbiggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGNvbmRpdGlvbmFsIHZhbHVlIChsaWtlIGEgdGVybmFyeSkgYmFzZWQgb24gd2hldGhlciB0aGlzIGlzIGEgbnVtYmVyIG9yIHZhcmlhYmxlIGNoYWxsZW5nZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0geyp9IG51bWJlclR5cGVWYWx1ZVxyXG4gICAqIEBwYXJhbSB7Kn0gdmFyaWFibGVUeXBlVmFsdWVcclxuICAgKiBAcmV0dXJucyB7Kn1cclxuICAgKi9cclxuICBudW1iZXJPclZhcmlhYmxlKCBudW1iZXJUeXBlVmFsdWUsIHZhcmlhYmxlVHlwZVZhbHVlICkge1xyXG4gICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gQXJlYUNoYWxsZW5nZVR5cGUuVkFSSUFCTEVTID8gdmFyaWFibGVUeXBlVmFsdWUgOiBudW1iZXJUeXBlVmFsdWU7XHJcbiAgfVxyXG59XHJcblxyXG5hcmVhTW9kZWxDb21tb24ucmVnaXN0ZXIoICdBcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24nLCBBcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24gKTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGEgc3RyaW5nIGtleSB1c2VkIGZvciBsb29raW5nIHVwIHRoZSBwcm9wZXIgcHJvbXB0IGluIHByb21wdE1hcCBiZWxvdy5cclxuICogQHByaXZhdGVcclxuICpcclxuICogQHBhcmFtIHtib29sZWFufSBoYXNBcmVhRW50cnlcclxuICogQHBhcmFtIHtudW1iZXJ9IG51bVByb2R1Y3RFbnRyaWVzXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1QYXJ0aXRpb25FbnRyaWVzXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRQcm9tcHRLZXkoIGhhc0FyZWFFbnRyeSwgbnVtUHJvZHVjdEVudHJpZXMsIG51bVBhcnRpdGlvbkVudHJpZXMgKSB7XHJcbiAgcmV0dXJuIGAke2hhc0FyZWFFbnRyeX0sJHtudW1Qcm9kdWN0RW50cmllc30sJHtudW1QYXJ0aXRpb25FbnRyaWVzfWA7XHJcbn1cclxuXHJcbmNvbnN0IHByb21wdE1hcCA9IHt9O1xyXG5wcm9tcHRNYXBbIGdldFByb21wdEtleSggdHJ1ZSwgMCwgMCApIF0gPSBsZXZlbFByb21wdFRvdGFsQXJlYVN0cmluZztcclxucHJvbXB0TWFwWyBnZXRQcm9tcHRLZXkoIGZhbHNlLCAxLCAwICkgXSA9IGxldmVsUHJvbXB0T25lUHJvZHVjdFRleHRTdHJpbmc7XHJcbnByb21wdE1hcFsgZ2V0UHJvbXB0S2V5KCBmYWxzZSwgMiwgMCApIF0gPSBsZXZlbFByb21wdFR3b1Byb2R1Y3RzU3RyaW5nO1xyXG5wcm9tcHRNYXBbIGdldFByb21wdEtleSggdHJ1ZSwgMSwgMCApIF0gPSBsZXZlbFByb21wdE9uZVByb2R1Y3RUb3RhbEFyZWFTdHJpbmc7XHJcbnByb21wdE1hcFsgZ2V0UHJvbXB0S2V5KCBmYWxzZSwgMSwgMSApIF0gPSBsZXZlbFByb21wdE9uZVByb2R1Y3RPbmVMZW5ndGhTdHJpbmc7XHJcbnByb21wdE1hcFsgZ2V0UHJvbXB0S2V5KCBmYWxzZSwgMCwgMiApIF0gPSBsZXZlbFByb21wdFR3b0xlbmd0aHNTdHJpbmc7XHJcbnByb21wdE1hcFsgZ2V0UHJvbXB0S2V5KCBmYWxzZSwgMCwgMyApIF0gPSBsZXZlbFByb21wdFRocmVlTGVuZ3Roc1N0cmluZztcclxuXHJcbmZ1bmN0aW9uIGlzRWRpdGFibGUoIHR5cGUgKSB7XHJcbiAgcmV0dXJuIHR5cGUgPT09IEVudHJ5VHlwZS5FRElUQUJMRTtcclxufVxyXG5cclxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiogTnVtYmVycyAxXHJcbiotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbi8vIEwxLTFcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzFfTlVNQkVSU18xID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgR0lWRU4sIEdJVkVOIF0sXHJcbiAgdmVydGljYWw6IFsgR0lWRU4gXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBHSVZFTiwgR0lWRU4gXVxyXG4gIF0sXHJcbiAgdG90YWw6IEVESVRBQkxFLFxyXG4gIGhvcml6b250YWxUb3RhbDogR0lWRU4sXHJcbiAgdmVydGljYWxUb3RhbDogR0lWRU4sXHJcbiAgdHlwZTogQXJlYUNoYWxsZW5nZVR5cGUuTlVNQkVSU1xyXG59ICk7XHJcblxyXG4vLyBMMS0yXHJcbkFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbi5MRVZFTF8xX05VTUJFUlNfMiA9IG5ldyBBcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24oIHtcclxuICBob3Jpem9udGFsOiBbIEdJVkVOLCBHSVZFTiBdLFxyXG4gIHZlcnRpY2FsOiBbIEdJVkVOIF0sXHJcbiAgcHJvZHVjdHM6IFtcclxuICAgIFsgRURJVEFCTEUsIEdJVkVOIF1cclxuICBdLFxyXG4gIHRvdGFsOiBHSVZFTixcclxuICBob3Jpem9udGFsVG90YWw6IEdJVkVOLFxyXG4gIHZlcnRpY2FsVG90YWw6IEdJVkVOLFxyXG4gIHR5cGU6IEFyZWFDaGFsbGVuZ2VUeXBlLk5VTUJFUlNcclxufSApO1xyXG5cclxuLy8gTDEtM1xyXG5BcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24uTEVWRUxfMV9OVU1CRVJTXzMgPSBuZXcgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uKCB7XHJcbiAgaG9yaXpvbnRhbDogWyBHSVZFTiwgR0lWRU4sIEdJVkVOIF0sXHJcbiAgdmVydGljYWw6IFsgR0lWRU4gXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBHSVZFTiwgR0lWRU4sIEdJVkVOIF1cclxuICBdLFxyXG4gIHRvdGFsOiBFRElUQUJMRSxcclxuICBob3Jpem9udGFsVG90YWw6IEdJVkVOLFxyXG4gIHZlcnRpY2FsVG90YWw6IEdJVkVOLFxyXG4gIHR5cGU6IEFyZWFDaGFsbGVuZ2VUeXBlLk5VTUJFUlNcclxufSApO1xyXG5cclxuLy8gTDEtNFxyXG5BcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24uTEVWRUxfMV9OVU1CRVJTXzQgPSBuZXcgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uKCB7XHJcbiAgaG9yaXpvbnRhbDogWyBHSVZFTiwgR0lWRU4sIEdJVkVOIF0sXHJcbiAgdmVydGljYWw6IFsgR0lWRU4gXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBFRElUQUJMRSwgR0lWRU4sIEdJVkVOIF1cclxuICBdLFxyXG4gIHRvdGFsOiBHSVZFTixcclxuICBob3Jpem9udGFsVG90YWw6IEdJVkVOLFxyXG4gIHZlcnRpY2FsVG90YWw6IEdJVkVOLFxyXG4gIHR5cGU6IEFyZWFDaGFsbGVuZ2VUeXBlLk5VTUJFUlNcclxufSApO1xyXG5cclxuLy8gTDEtNVxyXG5BcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24uTEVWRUxfMV9OVU1CRVJTXzUgPSBuZXcgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uKCB7XHJcbiAgaG9yaXpvbnRhbDogWyBHSVZFTiwgR0lWRU4gXSxcclxuICB2ZXJ0aWNhbDogWyBHSVZFTiwgR0lWRU4gXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBHSVZFTiwgR0lWRU4gXSxcclxuICAgIFsgR0lWRU4sIEdJVkVOIF1cclxuICBdLFxyXG4gIHRvdGFsOiBFRElUQUJMRSxcclxuICBob3Jpem9udGFsVG90YWw6IEdJVkVOLFxyXG4gIHZlcnRpY2FsVG90YWw6IEdJVkVOLFxyXG4gIHR5cGU6IEFyZWFDaGFsbGVuZ2VUeXBlLk5VTUJFUlNcclxufSApO1xyXG5cclxuLy8gTDEtNlxyXG5BcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24uTEVWRUxfMV9OVU1CRVJTXzYgPSBuZXcgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uKCB7XHJcbiAgaG9yaXpvbnRhbDogWyBHSVZFTiwgR0lWRU4gXSxcclxuICB2ZXJ0aWNhbDogWyBHSVZFTiwgR0lWRU4gXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBFRElUQUJMRSwgR0lWRU4gXSxcclxuICAgIFsgR0lWRU4sIEdJVkVOIF1cclxuICBdLFxyXG4gIHRvdGFsOiBHSVZFTixcclxuICBob3Jpem9udGFsVG90YWw6IEdJVkVOLFxyXG4gIHZlcnRpY2FsVG90YWw6IEdJVkVOLFxyXG4gIHR5cGU6IEFyZWFDaGFsbGVuZ2VUeXBlLk5VTUJFUlNcclxufSApO1xyXG5cclxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiogTnVtYmVycyAyXHJcbiotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbi8vIEwyLTFcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzJfTlVNQkVSU18xID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgR0lWRU4sIEdJVkVOIF0sXHJcbiAgdmVydGljYWw6IFsgR0lWRU4sIEdJVkVOIF0sXHJcbiAgcHJvZHVjdHM6IFtcclxuICAgIFsgRURJVEFCTEUsIEdJVkVOIF0sXHJcbiAgICBbIEdJVkVOLCBFRElUQUJMRSBdXHJcbiAgXSxcclxuICB0b3RhbDogR0lWRU4sXHJcbiAgaG9yaXpvbnRhbFRvdGFsOiBHSVZFTixcclxuICB2ZXJ0aWNhbFRvdGFsOiBHSVZFTixcclxuICB0eXBlOiBBcmVhQ2hhbGxlbmdlVHlwZS5OVU1CRVJTXHJcbn0gKTtcclxuXHJcbi8vIEwyLTJcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzJfTlVNQkVSU18yID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgR0lWRU4sIEdJVkVOIF0sXHJcbiAgdmVydGljYWw6IFsgR0lWRU4sIEdJVkVOIF0sXHJcbiAgcHJvZHVjdHM6IFtcclxuICAgIFsgRURJVEFCTEUsIEdJVkVOIF0sXHJcbiAgICBbIEdJVkVOLCBHSVZFTiBdXHJcbiAgXSxcclxuICB0b3RhbDogRURJVEFCTEUsXHJcbiAgaG9yaXpvbnRhbFRvdGFsOiBHSVZFTixcclxuICB2ZXJ0aWNhbFRvdGFsOiBHSVZFTixcclxuICB0eXBlOiBBcmVhQ2hhbGxlbmdlVHlwZS5OVU1CRVJTXHJcbn0gKTtcclxuXHJcbi8vIEwyLTNcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzJfTlVNQkVSU18zID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgR0lWRU4sIEdJVkVOLCBHSVZFTiBdLFxyXG4gIHZlcnRpY2FsOiBbIEdJVkVOLCBHSVZFTiBdLFxyXG4gIHByb2R1Y3RzOiBbXHJcbiAgICBbIEVESVRBQkxFLCBHSVZFTiwgR0lWRU4gXSxcclxuICAgIFsgR0lWRU4sIEVESVRBQkxFLCBHSVZFTiBdXHJcbiAgXSxcclxuICB0b3RhbDogR0lWRU4sXHJcbiAgaG9yaXpvbnRhbFRvdGFsOiBHSVZFTixcclxuICB2ZXJ0aWNhbFRvdGFsOiBHSVZFTixcclxuICB0eXBlOiBBcmVhQ2hhbGxlbmdlVHlwZS5OVU1CRVJTXHJcbn0gKTtcclxuXHJcbi8vIEwyLTRcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzJfTlVNQkVSU180ID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgR0lWRU4sIEdJVkVOLCBHSVZFTiBdLFxyXG4gIHZlcnRpY2FsOiBbIEdJVkVOLCBHSVZFTiBdLFxyXG4gIHByb2R1Y3RzOiBbXHJcbiAgICBbIEVESVRBQkxFLCBHSVZFTiwgR0lWRU4gXSxcclxuICAgIFsgR0lWRU4sIEdJVkVOLCBHSVZFTiBdXHJcbiAgXSxcclxuICB0b3RhbDogRURJVEFCTEUsXHJcbiAgaG9yaXpvbnRhbFRvdGFsOiBHSVZFTixcclxuICB2ZXJ0aWNhbFRvdGFsOiBHSVZFTixcclxuICB0eXBlOiBBcmVhQ2hhbGxlbmdlVHlwZS5OVU1CRVJTXHJcbn0gKTtcclxuXHJcbi8vIEwyLTVcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzJfTlVNQkVSU181ID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgR0lWRU4sIEdJVkVOLCBHSVZFTiBdLFxyXG4gIHZlcnRpY2FsOiBbIEdJVkVOLCBHSVZFTiwgR0lWRU4gXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBFRElUQUJMRSwgR0lWRU4sIEdJVkVOIF0sXHJcbiAgICBbIEdJVkVOLCBFRElUQUJMRSwgR0lWRU4gXSxcclxuICAgIFsgR0lWRU4sIEdJVkVOLCBHSVZFTiBdXHJcbiAgXSxcclxuICB0b3RhbDogR0lWRU4sXHJcbiAgaG9yaXpvbnRhbFRvdGFsOiBHSVZFTixcclxuICB2ZXJ0aWNhbFRvdGFsOiBHSVZFTixcclxuICB0eXBlOiBBcmVhQ2hhbGxlbmdlVHlwZS5OVU1CRVJTXHJcbn0gKTtcclxuXHJcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4qIE51bWJlcnMgM1xyXG4qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4vLyBMMy0xXHJcbkFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbi5MRVZFTF8zX05VTUJFUlNfMSA9IG5ldyBBcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24oIHtcclxuICBob3Jpem9udGFsOiBbIEVESVRBQkxFLCBFRElUQUJMRSBdLFxyXG4gIHZlcnRpY2FsOiBbIEdJVkVOIF0sXHJcbiAgcHJvZHVjdHM6IFtcclxuICAgIFsgRFlOQU1JQywgR0lWRU4gXVxyXG4gIF0sXHJcbiAgdG90YWw6IEdJVkVOLFxyXG4gIGhvcml6b250YWxUb3RhbDogR0lWRU4sXHJcbiAgdmVydGljYWxUb3RhbDogR0lWRU4sXHJcbiAgdHlwZTogQXJlYUNoYWxsZW5nZVR5cGUuTlVNQkVSU1xyXG59ICk7XHJcblxyXG4vLyBMMy0yXHJcbkFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbi5MRVZFTF8zX05VTUJFUlNfMiA9IG5ldyBBcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24oIHtcclxuICBob3Jpem9udGFsOiBbIEVESVRBQkxFLCBHSVZFTiBdLFxyXG4gIHZlcnRpY2FsOiBbIEVESVRBQkxFIF0sXHJcbiAgcHJvZHVjdHM6IFtcclxuICAgIFsgRFlOQU1JQywgR0lWRU4gXVxyXG4gIF0sXHJcbiAgdG90YWw6IEdJVkVOLFxyXG4gIGhvcml6b250YWxUb3RhbDogR0lWRU4sXHJcbiAgdmVydGljYWxUb3RhbDogRFlOQU1JQyxcclxuICB0eXBlOiBBcmVhQ2hhbGxlbmdlVHlwZS5OVU1CRVJTXHJcbn0gKTtcclxuXHJcbi8vIEwzLTNcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzNfTlVNQkVSU18zID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgRURJVEFCTEUsIEVESVRBQkxFLCBHSVZFTiBdLFxyXG4gIHZlcnRpY2FsOiBbIEdJVkVOIF0sXHJcbiAgcHJvZHVjdHM6IFtcclxuICAgIFsgRFlOQU1JQywgR0lWRU4sIEdJVkVOIF1cclxuICBdLFxyXG4gIHRvdGFsOiBHSVZFTixcclxuICBob3Jpem9udGFsVG90YWw6IEdJVkVOLFxyXG4gIHZlcnRpY2FsVG90YWw6IEdJVkVOLFxyXG4gIHR5cGU6IEFyZWFDaGFsbGVuZ2VUeXBlLk5VTUJFUlNcclxufSApO1xyXG5cclxuLy8gTDMtNFxyXG5BcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24uTEVWRUxfM19OVU1CRVJTXzQgPSBuZXcgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uKCB7XHJcbiAgaG9yaXpvbnRhbDogWyBFRElUQUJMRSwgR0lWRU4sIEdJVkVOIF0sXHJcbiAgdmVydGljYWw6IFsgRURJVEFCTEUgXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBHSVZFTiwgR0lWRU4sIEdJVkVOIF1cclxuICBdLFxyXG4gIHRvdGFsOiBHSVZFTixcclxuICBob3Jpem9udGFsVG90YWw6IEdJVkVOLFxyXG4gIHZlcnRpY2FsVG90YWw6IERZTkFNSUMsXHJcbiAgdHlwZTogQXJlYUNoYWxsZW5nZVR5cGUuTlVNQkVSU1xyXG59ICk7XHJcblxyXG4vLyBMMy01XHJcbkFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbi5MRVZFTF8zX05VTUJFUlNfNSA9IG5ldyBBcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24oIHtcclxuICBob3Jpem9udGFsOiBbIEVESVRBQkxFLCBHSVZFTiBdLFxyXG4gIHZlcnRpY2FsOiBbIEVESVRBQkxFLCBHSVZFTiBdLFxyXG4gIHByb2R1Y3RzOiBbXHJcbiAgICBbIEdJVkVOLCBEWU5BTUlDIF0sXHJcbiAgICBbIERZTkFNSUMsIEdJVkVOIF1cclxuICBdLFxyXG4gIHRvdGFsOiBHSVZFTixcclxuICBob3Jpem9udGFsVG90YWw6IEdJVkVOLFxyXG4gIHZlcnRpY2FsVG90YWw6IEdJVkVOLFxyXG4gIHR5cGU6IEFyZWFDaGFsbGVuZ2VUeXBlLk5VTUJFUlNcclxufSApO1xyXG5cclxuLy8gTDMtNlxyXG5BcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24uTEVWRUxfM19OVU1CRVJTXzYgPSBuZXcgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uKCB7XHJcbiAgaG9yaXpvbnRhbDogWyBFRElUQUJMRSwgR0lWRU4gXSxcclxuICB2ZXJ0aWNhbDogWyBFRElUQUJMRSwgR0lWRU4gXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBEWU5BTUlDLCBHSVZFTiBdLFxyXG4gICAgWyBHSVZFTiwgR0lWRU4gXVxyXG4gIF0sXHJcbiAgdG90YWw6IEdJVkVOLFxyXG4gIGhvcml6b250YWxUb3RhbDogR0lWRU4sXHJcbiAgdmVydGljYWxUb3RhbDogR0lWRU4sXHJcbiAgdHlwZTogQXJlYUNoYWxsZW5nZVR5cGUuTlVNQkVSU1xyXG59ICk7XHJcblxyXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuKiBOdW1iZXJzIDRcclxuKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuLy8gTDQtMVxyXG5BcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24uTEVWRUxfNF9OVU1CRVJTXzEgPSBuZXcgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uKCB7XHJcbiAgaG9yaXpvbnRhbDogWyBFRElUQUJMRSwgRURJVEFCTEUsIEVESVRBQkxFIF0sXHJcbiAgdmVydGljYWw6IFsgR0lWRU4sIEdJVkVOIF0sXHJcbiAgcHJvZHVjdHM6IFtcclxuICAgIFsgRFlOQU1JQywgR0lWRU4sIEdJVkVOIF0sXHJcbiAgICBbIEdJVkVOLCBEWU5BTUlDLCBHSVZFTiBdXHJcbiAgXSxcclxuICB0b3RhbDogR0lWRU4sXHJcbiAgaG9yaXpvbnRhbFRvdGFsOiBHSVZFTixcclxuICB2ZXJ0aWNhbFRvdGFsOiBHSVZFTixcclxuICB0eXBlOiBBcmVhQ2hhbGxlbmdlVHlwZS5OVU1CRVJTXHJcbn0gKTtcclxuXHJcbi8vIEw0LTJcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzRfTlVNQkVSU18yID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgRURJVEFCTEUsIEVESVRBQkxFLCBHSVZFTiBdLFxyXG4gIHZlcnRpY2FsOiBbIEVESVRBQkxFLCBHSVZFTiBdLFxyXG4gIHByb2R1Y3RzOiBbXHJcbiAgICBbIERZTkFNSUMsIEdJVkVOLCBHSVZFTiBdLFxyXG4gICAgWyBHSVZFTiwgR0lWRU4sIEdJVkVOIF1cclxuICBdLFxyXG4gIHRvdGFsOiBHSVZFTixcclxuICBob3Jpem9udGFsVG90YWw6IEdJVkVOLFxyXG4gIHZlcnRpY2FsVG90YWw6IEdJVkVOLFxyXG4gIHR5cGU6IEFyZWFDaGFsbGVuZ2VUeXBlLk5VTUJFUlNcclxufSApO1xyXG5cclxuLy8gTDQtM1xyXG5BcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24uTEVWRUxfNF9OVU1CRVJTXzMgPSBuZXcgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uKCB7XHJcbiAgaG9yaXpvbnRhbDogWyBFRElUQUJMRSwgRURJVEFCTEUsIEdJVkVOIF0sXHJcbiAgdmVydGljYWw6IFsgRURJVEFCTEUsIEdJVkVOIF0sXHJcbiAgcHJvZHVjdHM6IFtcclxuICAgIFsgRFlOQU1JQywgR0lWRU4sIEdJVkVOIF0sXHJcbiAgICBbIEdJVkVOLCBEWU5BTUlDLCBHSVZFTiBdXHJcbiAgXSxcclxuICB0b3RhbDogR0lWRU4sXHJcbiAgaG9yaXpvbnRhbFRvdGFsOiBHSVZFTixcclxuICB2ZXJ0aWNhbFRvdGFsOiBHSVZFTixcclxuICB0eXBlOiBBcmVhQ2hhbGxlbmdlVHlwZS5OVU1CRVJTXHJcbn0gKTtcclxuXHJcbi8vIEw0LTRcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzRfTlVNQkVSU180ID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgRURJVEFCTEUsIEVESVRBQkxFLCBFRElUQUJMRSBdLFxyXG4gIHZlcnRpY2FsOiBbIEdJVkVOLCBHSVZFTiwgR0lWRU4gXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBEWU5BTUlDLCBHSVZFTiwgR0lWRU4gXSxcclxuICAgIFsgR0lWRU4sIERZTkFNSUMsIEdJVkVOIF0sXHJcbiAgICBbIEdJVkVOLCBHSVZFTiwgRFlOQU1JQyBdXHJcbiAgXSxcclxuICB0b3RhbDogR0lWRU4sXHJcbiAgaG9yaXpvbnRhbFRvdGFsOiBHSVZFTixcclxuICB2ZXJ0aWNhbFRvdGFsOiBHSVZFTixcclxuICB0eXBlOiBBcmVhQ2hhbGxlbmdlVHlwZS5OVU1CRVJTXHJcbn0gKTtcclxuXHJcbi8vIEw0LTVcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzRfTlVNQkVSU181ID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgRURJVEFCTEUsIEVESVRBQkxFLCBHSVZFTiBdLFxyXG4gIHZlcnRpY2FsOiBbIEVESVRBQkxFLCBHSVZFTiwgR0lWRU4gXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBEWU5BTUlDLCBHSVZFTiwgR0lWRU4gXSxcclxuICAgIFsgR0lWRU4sIERZTkFNSUMsIEdJVkVOIF0sXHJcbiAgICBbIEdJVkVOLCBHSVZFTiwgR0lWRU4gXVxyXG4gIF0sXHJcbiAgdG90YWw6IEdJVkVOLFxyXG4gIGhvcml6b250YWxUb3RhbDogR0lWRU4sXHJcbiAgdmVydGljYWxUb3RhbDogR0lWRU4sXHJcbiAgdHlwZTogQXJlYUNoYWxsZW5nZVR5cGUuTlVNQkVSU1xyXG59ICk7XHJcblxyXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuKiBOdW1iZXJzIDVcclxuKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuLy8gTDUtMVxyXG5BcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24uTEVWRUxfNV9OVU1CRVJTXzEgPSBuZXcgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uKCB7XHJcbiAgaG9yaXpvbnRhbDogWyBFRElUQUJMRSwgR0lWRU4gXSxcclxuICB2ZXJ0aWNhbDogWyBFRElUQUJMRSBdLFxyXG4gIHByb2R1Y3RzOiBbXHJcbiAgICBbIEdJVkVOLCBHSVZFTiBdXHJcbiAgXSxcclxuICB0b3RhbDogR0lWRU4sXHJcbiAgaG9yaXpvbnRhbFRvdGFsOiBEWU5BTUlDLFxyXG4gIHZlcnRpY2FsVG90YWw6IERZTkFNSUMsXHJcbiAgdHlwZTogQXJlYUNoYWxsZW5nZVR5cGUuTlVNQkVSU1xyXG59ICk7XHJcblxyXG4vLyBMNS0zXHJcbkFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbi5MRVZFTF81X05VTUJFUlNfMyA9IG5ldyBBcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24oIHtcclxuICBob3Jpem9udGFsOiBbIEVESVRBQkxFLCBHSVZFTiwgR0lWRU4gXSxcclxuICB2ZXJ0aWNhbDogWyBFRElUQUJMRSBdLFxyXG4gIHByb2R1Y3RzOiBbXHJcbiAgICBbIEdJVkVOLCBHSVZFTiwgR0lWRU4gXVxyXG4gIF0sXHJcbiAgdG90YWw6IEdJVkVOLFxyXG4gIGhvcml6b250YWxUb3RhbDogRFlOQU1JQyxcclxuICB2ZXJ0aWNhbFRvdGFsOiBEWU5BTUlDLFxyXG4gIHR5cGU6IEFyZWFDaGFsbGVuZ2VUeXBlLk5VTUJFUlNcclxufSApO1xyXG5cclxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiogTnVtYmVycyA2XHJcbiotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbi8vIEw2LTFcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzZfTlVNQkVSU18xID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgRURJVEFCTEUsIEVESVRBQkxFIF0sXHJcbiAgdmVydGljYWw6IFsgRURJVEFCTEUsIEdJVkVOIF0sXHJcbiAgcHJvZHVjdHM6IFtcclxuICAgIFsgR0lWRU4sIEdJVkVOIF0sXHJcbiAgICBbIEdJVkVOLCBHSVZFTiBdXHJcbiAgXSxcclxuICB0b3RhbDogR0lWRU4sXHJcbiAgaG9yaXpvbnRhbFRvdGFsOiBEWU5BTUlDLFxyXG4gIHZlcnRpY2FsVG90YWw6IERZTkFNSUMsXHJcbiAgdHlwZTogQXJlYUNoYWxsZW5nZVR5cGUuTlVNQkVSU1xyXG59ICk7XHJcblxyXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuKiBWYXJpYWJsZXMgMVxyXG4qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4vLyBMMS0xXHJcbkFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbi5MRVZFTF8xX1ZBUklBQkxFU18xID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgR0lWRU4sIEdJVkVOIF0sXHJcbiAgdmVydGljYWw6IFsgR0lWRU4gXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBFRElUQUJMRSwgR0lWRU4gXVxyXG4gIF0sXHJcbiAgdG90YWw6IEdJVkVOLFxyXG4gIGhvcml6b250YWxUb3RhbDogR0lWRU4sXHJcbiAgdmVydGljYWxUb3RhbDogR0lWRU4sXHJcbiAgdHlwZTogQXJlYUNoYWxsZW5nZVR5cGUuVkFSSUFCTEVTXHJcbn0gKTtcclxuXHJcbi8vIEwxLTJcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzFfVkFSSUFCTEVTXzIgPSBuZXcgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uKCB7XHJcbiAgaG9yaXpvbnRhbDogWyBHSVZFTiwgR0lWRU4gXSxcclxuICB2ZXJ0aWNhbDogWyBHSVZFTiBdLFxyXG4gIHByb2R1Y3RzOiBbXHJcbiAgICBbIEdJVkVOLCBHSVZFTiBdXHJcbiAgXSxcclxuICB0b3RhbDogRURJVEFCTEUsXHJcbiAgaG9yaXpvbnRhbFRvdGFsOiBHSVZFTixcclxuICB2ZXJ0aWNhbFRvdGFsOiBHSVZFTixcclxuICB0eXBlOiBBcmVhQ2hhbGxlbmdlVHlwZS5WQVJJQUJMRVNcclxufSApO1xyXG5cclxuLy8gTDEtM1xyXG5BcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24uTEVWRUxfMV9WQVJJQUJMRVNfMyA9IG5ldyBBcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24oIHtcclxuICBob3Jpem9udGFsOiBbIEdJVkVOLCBHSVZFTiwgR0lWRU4gXSxcclxuICB2ZXJ0aWNhbDogWyBHSVZFTiBdLFxyXG4gIHByb2R1Y3RzOiBbXHJcbiAgICBbIEVESVRBQkxFLCBHSVZFTiwgR0lWRU4gXVxyXG4gIF0sXHJcbiAgdG90YWw6IEdJVkVOLFxyXG4gIGhvcml6b250YWxUb3RhbDogR0lWRU4sXHJcbiAgdmVydGljYWxUb3RhbDogR0lWRU4sXHJcbiAgdHlwZTogQXJlYUNoYWxsZW5nZVR5cGUuVkFSSUFCTEVTXHJcbn0gKTtcclxuXHJcbi8vIEwxLTRcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzFfVkFSSUFCTEVTXzQgPSBuZXcgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uKCB7XHJcbiAgaG9yaXpvbnRhbDogWyBHSVZFTiwgR0lWRU4sIEdJVkVOIF0sXHJcbiAgdmVydGljYWw6IFsgR0lWRU4gXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBHSVZFTiwgR0lWRU4sIEdJVkVOIF1cclxuICBdLFxyXG4gIHRvdGFsOiBFRElUQUJMRSxcclxuICBob3Jpem9udGFsVG90YWw6IEdJVkVOLFxyXG4gIHZlcnRpY2FsVG90YWw6IEdJVkVOLFxyXG4gIHR5cGU6IEFyZWFDaGFsbGVuZ2VUeXBlLlZBUklBQkxFU1xyXG59ICk7XHJcblxyXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuKiBWYXJpYWJsZXMgMlxyXG4qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4vLyBMMi0xXHJcbkFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbi5MRVZFTF8yX1ZBUklBQkxFU18xID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgR0lWRU4sIEdJVkVOIF0sXHJcbiAgdmVydGljYWw6IFsgR0lWRU4sIEdJVkVOIF0sXHJcbiAgcHJvZHVjdHM6IFtcclxuICAgIFsgRURJVEFCTEUsIEdJVkVOIF0sXHJcbiAgICBbIEdJVkVOLCBFRElUQUJMRSBdXHJcbiAgXSxcclxuICB0b3RhbDogR0lWRU4sXHJcbiAgaG9yaXpvbnRhbFRvdGFsOiBHSVZFTixcclxuICB2ZXJ0aWNhbFRvdGFsOiBHSVZFTixcclxuICB0eXBlOiBBcmVhQ2hhbGxlbmdlVHlwZS5WQVJJQUJMRVNcclxufSApO1xyXG5cclxuLy8gTDItMlxyXG5BcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24uTEVWRUxfMl9WQVJJQUJMRVNfMiA9IG5ldyBBcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24oIHtcclxuICBob3Jpem9udGFsOiBbIEdJVkVOLCBHSVZFTiBdLFxyXG4gIHZlcnRpY2FsOiBbIEdJVkVOLCBHSVZFTiBdLFxyXG4gIHByb2R1Y3RzOiBbXHJcbiAgICBbIEVESVRBQkxFLCBHSVZFTiBdLFxyXG4gICAgWyBHSVZFTiwgR0lWRU4gXVxyXG4gIF0sXHJcbiAgdG90YWw6IEVESVRBQkxFLFxyXG4gIGhvcml6b250YWxUb3RhbDogR0lWRU4sXHJcbiAgdmVydGljYWxUb3RhbDogR0lWRU4sXHJcbiAgdHlwZTogQXJlYUNoYWxsZW5nZVR5cGUuVkFSSUFCTEVTXHJcbn0gKTtcclxuXHJcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4qIFZhcmlhYmxlcyAzXHJcbiotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbi8vIEwzLTFcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzNfVkFSSUFCTEVTXzEgPSBuZXcgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uKCB7XHJcbiAgaG9yaXpvbnRhbDogWyBFRElUQUJMRSwgR0lWRU4gXSxcclxuICB2ZXJ0aWNhbDogWyBFRElUQUJMRSBdLFxyXG4gIHByb2R1Y3RzOiBbXHJcbiAgICBbIEdJVkVOLCBHSVZFTiBdXHJcbiAgXSxcclxuICB0b3RhbDogR0lWRU4sXHJcbiAgaG9yaXpvbnRhbFRvdGFsOiBHSVZFTixcclxuICB2ZXJ0aWNhbFRvdGFsOiBEWU5BTUlDLFxyXG4gIHR5cGU6IEFyZWFDaGFsbGVuZ2VUeXBlLlZBUklBQkxFU1xyXG59ICk7XHJcblxyXG4vLyBMMy0yXHJcbkFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbi5MRVZFTF8zX1ZBUklBQkxFU18yID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgRURJVEFCTEUsIEVESVRBQkxFIF0sXHJcbiAgdmVydGljYWw6IFsgR0lWRU4gXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBEWU5BTUlDLCBHSVZFTiBdXHJcbiAgXSxcclxuICB0b3RhbDogR0lWRU4sXHJcbiAgaG9yaXpvbnRhbFRvdGFsOiBHSVZFTixcclxuICB2ZXJ0aWNhbFRvdGFsOiBHSVZFTixcclxuICB0eXBlOiBBcmVhQ2hhbGxlbmdlVHlwZS5WQVJJQUJMRVNcclxufSApO1xyXG5cclxuLy8gTDMtM1xyXG5BcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24uTEVWRUxfM19WQVJJQUJMRVNfMyA9IG5ldyBBcmVhQ2hhbGxlbmdlRGVzY3JpcHRpb24oIHtcclxuICBob3Jpem9udGFsOiBbIEVESVRBQkxFLCBHSVZFTiBdLFxyXG4gIHZlcnRpY2FsOiBbIEdJVkVOIF0sXHJcbiAgcHJvZHVjdHM6IFtcclxuICAgIFsgR0lWRU4sIEVESVRBQkxFIF1cclxuICBdLFxyXG4gIHRvdGFsOiBHSVZFTixcclxuICBob3Jpem9udGFsVG90YWw6IEdJVkVOLFxyXG4gIHZlcnRpY2FsVG90YWw6IEdJVkVOLFxyXG4gIHR5cGU6IEFyZWFDaGFsbGVuZ2VUeXBlLlZBUklBQkxFU1xyXG59ICk7XHJcblxyXG4vLyBMMy00XHJcbkFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbi5MRVZFTF8zX1ZBUklBQkxFU180ID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgRURJVEFCTEUsIEdJVkVOLCBHSVZFTiBdLFxyXG4gIHZlcnRpY2FsOiBbIEVESVRBQkxFIF0sXHJcbiAgcHJvZHVjdHM6IFtcclxuICAgIFsgR0lWRU4sIERZTkFNSUMsIEdJVkVOIF1cclxuICBdLFxyXG4gIHRvdGFsOiBHSVZFTixcclxuICBob3Jpem9udGFsVG90YWw6IEdJVkVOLFxyXG4gIHZlcnRpY2FsVG90YWw6IERZTkFNSUMsXHJcbiAgdHlwZTogQXJlYUNoYWxsZW5nZVR5cGUuVkFSSUFCTEVTXHJcbn0gKTtcclxuXHJcbi8vIEwzLTVcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzNfVkFSSUFCTEVTXzUgPSBuZXcgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uKCB7XHJcbiAgaG9yaXpvbnRhbDogWyBFRElUQUJMRSwgRURJVEFCTEUsIEdJVkVOIF0sXHJcbiAgdmVydGljYWw6IFsgR0lWRU4gXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBEWU5BTUlDLCBHSVZFTiwgR0lWRU4gXVxyXG4gIF0sXHJcbiAgdG90YWw6IEdJVkVOLFxyXG4gIGhvcml6b250YWxUb3RhbDogR0lWRU4sXHJcbiAgdmVydGljYWxUb3RhbDogR0lWRU4sXHJcbiAgdHlwZTogQXJlYUNoYWxsZW5nZVR5cGUuVkFSSUFCTEVTXHJcbn0gKTtcclxuXHJcbi8vIEwzLTZcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzNfVkFSSUFCTEVTXzYgPSBuZXcgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uKCB7XHJcbiAgaG9yaXpvbnRhbDogWyBFRElUQUJMRSwgR0lWRU4sIEdJVkVOIF0sXHJcbiAgdmVydGljYWw6IFsgR0lWRU4gXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBHSVZFTiwgRURJVEFCTEUsIEdJVkVOIF1cclxuICBdLFxyXG4gIHRvdGFsOiBHSVZFTixcclxuICBob3Jpem9udGFsVG90YWw6IEdJVkVOLFxyXG4gIHZlcnRpY2FsVG90YWw6IEdJVkVOLFxyXG4gIHR5cGU6IEFyZWFDaGFsbGVuZ2VUeXBlLlZBUklBQkxFU1xyXG59ICk7XHJcblxyXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuKiBWYXJpYWJsZXMgNFxyXG4qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4vLyBMNC0xXHJcbkFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbi5MRVZFTF80X1ZBUklBQkxFU18xID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgRURJVEFCTEUsIEdJVkVOIF0sXHJcbiAgdmVydGljYWw6IFsgRURJVEFCTEUsIEdJVkVOIF0sXHJcbiAgcHJvZHVjdHM6IFtcclxuICAgIFsgR0lWRU4sIERZTkFNSUMgXSxcclxuICAgIFsgRFlOQU1JQywgR0lWRU4gXVxyXG4gIF0sXHJcbiAgdG90YWw6IEdJVkVOLFxyXG4gIGhvcml6b250YWxUb3RhbDogR0lWRU4sXHJcbiAgdmVydGljYWxUb3RhbDogR0lWRU4sXHJcbiAgdHlwZTogQXJlYUNoYWxsZW5nZVR5cGUuVkFSSUFCTEVTXHJcbn0gKTtcclxuXHJcbi8vIEw0LTJcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzRfVkFSSUFCTEVTXzIgPSBuZXcgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uKCB7XHJcbiAgaG9yaXpvbnRhbDogWyBFRElUQUJMRSwgR0lWRU4gXSxcclxuICB2ZXJ0aWNhbDogWyBHSVZFTiwgR0lWRU4gXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBHSVZFTiwgRURJVEFCTEUgXSxcclxuICAgIFsgR0lWRU4sIEdJVkVOIF1cclxuICBdLFxyXG4gIHRvdGFsOiBHSVZFTixcclxuICBob3Jpem9udGFsVG90YWw6IEdJVkVOLFxyXG4gIHZlcnRpY2FsVG90YWw6IEdJVkVOLFxyXG4gIHR5cGU6IEFyZWFDaGFsbGVuZ2VUeXBlLlZBUklBQkxFU1xyXG59ICk7XHJcblxyXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuKiBWYXJpYWJsZXMgNVxyXG4qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4vLyBMNS0xXHJcbkFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbi5MRVZFTF81X1ZBUklBQkxFU18xID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgRURJVEFCTEUsIEdJVkVOIF0sXHJcbiAgdmVydGljYWw6IFsgRURJVEFCTEUgXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBHSVZFTiwgR0lWRU4gXVxyXG4gIF0sXHJcbiAgdG90YWw6IEdJVkVOLFxyXG4gIGhvcml6b250YWxUb3RhbDogRFlOQU1JQyxcclxuICB2ZXJ0aWNhbFRvdGFsOiBEWU5BTUlDLFxyXG4gIHR5cGU6IEFyZWFDaGFsbGVuZ2VUeXBlLlZBUklBQkxFU1xyXG59ICk7XHJcblxyXG4vLyBMNS0yXHJcbkFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbi5MRVZFTF81X1ZBUklBQkxFU18yID0gbmV3IEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbigge1xyXG4gIGhvcml6b250YWw6IFsgRURJVEFCTEUsIEdJVkVOLCBHSVZFTiBdLFxyXG4gIHZlcnRpY2FsOiBbIEVESVRBQkxFIF0sXHJcbiAgcHJvZHVjdHM6IFtcclxuICAgIFsgR0lWRU4sIEdJVkVOLCBHSVZFTiBdXHJcbiAgXSxcclxuICB0b3RhbDogR0lWRU4sXHJcbiAgaG9yaXpvbnRhbFRvdGFsOiBEWU5BTUlDLFxyXG4gIHZlcnRpY2FsVG90YWw6IERZTkFNSUMsXHJcbiAgdHlwZTogQXJlYUNoYWxsZW5nZVR5cGUuVkFSSUFCTEVTXHJcbn0gKTtcclxuXHJcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4qIFZhcmlhYmxlcyA2XHJcbiotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbi8vIEw2LTFcclxuQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uLkxFVkVMXzZfVkFSSUFCTEVTXzEgPSBuZXcgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uKCB7XHJcbiAgaG9yaXpvbnRhbDogWyBHSVZFTiwgRURJVEFCTEUgXSxcclxuICB2ZXJ0aWNhbDogWyBHSVZFTiwgRURJVEFCTEUgXSxcclxuICBwcm9kdWN0czogW1xyXG4gICAgWyBHSVZFTiwgRFlOQU1JQyBdLFxyXG4gICAgWyBEWU5BTUlDLCBHSVZFTiBdXHJcbiAgXSxcclxuICB0b3RhbDogR0lWRU4sXHJcbiAgaG9yaXpvbnRhbFRvdGFsOiBEWU5BTUlDLFxyXG4gIHZlcnRpY2FsVG90YWw6IERZTkFNSUMsXHJcbiAgdHlwZTogQXJlYUNoYWxsZW5nZVR5cGUuVkFSSUFCTEVTLFxyXG4gIHNodWZmbGFibGU6IGZhbHNlLFxyXG4gIHVuaXF1ZTogZmFsc2VcclxufSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLHNCQUFzQixNQUFNLGlDQUFpQztBQUNwRSxPQUFPQyxlQUFlLE1BQU0sdUNBQXVDO0FBQ25FLE9BQU9DLGFBQWEsTUFBTSxzQ0FBc0M7QUFDaEUsT0FBT0MsaUJBQWlCLE1BQU0sd0JBQXdCO0FBQ3RELE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFFdEMsTUFBTUMsb0NBQW9DLEdBQUdMLHNCQUFzQixDQUFDTSxXQUFXLENBQUNDLFVBQVUsQ0FBQ0MsU0FBUztBQUNwRyxNQUFNQywrQkFBK0IsR0FBR1Qsc0JBQXNCLENBQUNNLFdBQVcsQ0FBQ0MsVUFBVSxDQUFDRyxJQUFJO0FBQzFGLE1BQU1DLG9DQUFvQyxHQUFHWCxzQkFBc0IsQ0FBQ00sV0FBVyxDQUFDQyxVQUFVLENBQUNLLFNBQVM7QUFDcEcsTUFBTUMsNkJBQTZCLEdBQUdiLHNCQUFzQixDQUFDTSxXQUFXLENBQUNRLFlBQVk7QUFDckYsTUFBTUMsMEJBQTBCLEdBQUdmLHNCQUFzQixDQUFDTSxXQUFXLENBQUNNLFNBQVM7QUFDL0UsTUFBTUksMkJBQTJCLEdBQUdoQixzQkFBc0IsQ0FBQ00sV0FBVyxDQUFDVyxVQUFVO0FBQ2pGLE1BQU1DLDRCQUE0QixHQUFHbEIsc0JBQXNCLENBQUNNLFdBQVcsQ0FBQ2EsV0FBVzs7QUFFbkY7QUFDQSxNQUFNQyxRQUFRLEdBQUdoQixTQUFTLENBQUNnQixRQUFRO0FBQ25DLE1BQU1DLE9BQU8sR0FB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