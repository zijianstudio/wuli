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
  1: Permutation.permutations( 1 ),
  2: Permutation.permutations( 2 ),
  3: Permutation.permutations( 3 )
};

class AreaChallengeDescription {
  /**
   * @param {Object} config
   */
  constructor( config ) {
    config = merge( {
      // required
      horizontal: null, // {Array.<EntryType>}
      vertical: null, // {Array.<EntryType>}
      products: null, // {Array.<Array.<EntryType>>}
      total: null, // {EntryType}
      horizontalTotal: null, // {EntryType}
      verticalTotal: null, // {EntryType}
      type: null, // {AreaChallengeType}

      // optional
      shufflable: true,
      unique: true
    }, config );

    assert && assert( Array.isArray( config.horizontal ) );
    assert && assert( Array.isArray( config.vertical ) );
    assert && assert( Array.isArray( config.products ) );
    assert && assert( _.includes( EntryType.VALUES, config.total ) );
    assert && assert( _.includes( EntryType.VALUES, config.horizontalTotal ) );
    assert && assert( _.includes( EntryType.VALUES, config.verticalTotal ) );
    assert && assert( _.includes( AreaChallengeType.VALUES, config.type ) );

    // @public {OrientationPair.<Array.<EntryType>>} - Entry types for partition sizes
    this.partitionTypes = new OrientationPair( config.horizontal, config.vertical );

    // @public {Array.<Array.<EntryType>>} - Entry types for partitioned areas
    this.productTypes = config.products;

    // @public {OrientationPair.<EntryType>} - Entry types for horizontal and vertical dimension totals
    this.dimensionTypes = new OrientationPair( config.horizontalTotal, config.verticalTotal );

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
    this.layout = GenericLayout.fromValues( config.horizontal.length, config.vertical.length );
  }

  /**
   * Returns the string representing the prompt for this challenge (what should be done to solve it).
   * @public
   *
   * @returns {string}
   */
  getPromptString() {
    const hasAreaEntry = isEditable( this.totalType );
    const numProductEntries = _.flatten( this.productTypes ).filter( isEditable ).length;
    const numPartitionEntries = this.partitionTypes.horizontal.concat( this.partitionTypes.vertical ).filter( isEditable ).length;

    const text = promptMap[ getPromptKey( hasAreaEntry, numProductEntries, numPartitionEntries ) ];
    assert && assert( text );

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

    if ( this.shufflable ) {
      // Horizontal shuffle
      const horizontalPermutation = dotRandom.sample( permutations[ options.horizontal.length ] );
      options.horizontal = horizontalPermutation.apply( options.horizontal );
      options.products = options.products.map( row => horizontalPermutation.apply( row ) );

      // Vertical shuffle
      const verticalPermutation = dotRandom.sample( permutations[ options.vertical.length ] );
      options.vertical = verticalPermutation.apply( options.vertical );
      options.products = verticalPermutation.apply( options.products );
    }

    if ( this.transposable && dotRandom.nextBoolean() ) {
      const tmpPartition = options.horizontal;
      options.horizontal = options.vertical;
      options.vertical = tmpPartition;

      const tmpTotal = options.horizontalTotal;
      options.horizontalTotal = options.verticalTotal;
      options.verticalTotal = tmpTotal;

      options.products = _.range( options.vertical.length ).map( verticalIndex => _.range( options.horizontal.length ).map( horizontalIndex => options.products[ horizontalIndex ][ verticalIndex ] ) );
    }

    return new AreaChallengeDescription( options );
  }

  /**
   * Returns a conditional value (like a ternary) based on whether this is a number or variable challenge.
   * @public
   *
   * @param {*} numberTypeValue
   * @param {*} variableTypeValue
   * @returns {*}
   */
  numberOrVariable( numberTypeValue, variableTypeValue ) {
    return this.type === AreaChallengeType.VARIABLES ? variableTypeValue : numberTypeValue;
  }
}

areaModelCommon.register( 'AreaChallengeDescription', AreaChallengeDescription );

/**
 * Returns a string key used for looking up the proper prompt in promptMap below.
 * @private
 *
 * @param {boolean} hasAreaEntry
 * @param {number} numProductEntries
 * @param {number} numPartitionEntries
 * @returns {string}
 */
function getPromptKey( hasAreaEntry, numProductEntries, numPartitionEntries ) {
  return `${hasAreaEntry},${numProductEntries},${numPartitionEntries}`;
}

const promptMap = {};
promptMap[ getPromptKey( true, 0, 0 ) ] = levelPromptTotalAreaString;
promptMap[ getPromptKey( false, 1, 0 ) ] = levelPromptOneProductTextString;
promptMap[ getPromptKey( false, 2, 0 ) ] = levelPromptTwoProductsString;
promptMap[ getPromptKey( true, 1, 0 ) ] = levelPromptOneProductTotalAreaString;
promptMap[ getPromptKey( false, 1, 1 ) ] = levelPromptOneProductOneLengthString;
promptMap[ getPromptKey( false, 0, 2 ) ] = levelPromptTwoLengthsString;
promptMap[ getPromptKey( false, 0, 3 ) ] = levelPromptThreeLengthsString;

function isEditable( type ) {
  return type === EntryType.EDITABLE;
}

/*---------------------------------------------------------------------------*
* Numbers 1
*----------------------------------------------------------------------------*/

// L1-1
AreaChallengeDescription.LEVEL_1_NUMBERS_1 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN ],
  vertical: [ GIVEN ],
  products: [
    [ GIVEN, GIVEN ]
  ],
  total: EDITABLE,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

// L1-2
AreaChallengeDescription.LEVEL_1_NUMBERS_2 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN ],
  vertical: [ GIVEN ],
  products: [
    [ EDITABLE, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

// L1-3
AreaChallengeDescription.LEVEL_1_NUMBERS_3 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN, GIVEN ],
  vertical: [ GIVEN ],
  products: [
    [ GIVEN, GIVEN, GIVEN ]
  ],
  total: EDITABLE,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

// L1-4
AreaChallengeDescription.LEVEL_1_NUMBERS_4 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN, GIVEN ],
  vertical: [ GIVEN ],
  products: [
    [ EDITABLE, GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

// L1-5
AreaChallengeDescription.LEVEL_1_NUMBERS_5 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN ],
  vertical: [ GIVEN, GIVEN ],
  products: [
    [ GIVEN, GIVEN ],
    [ GIVEN, GIVEN ]
  ],
  total: EDITABLE,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

// L1-6
AreaChallengeDescription.LEVEL_1_NUMBERS_6 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN ],
  vertical: [ GIVEN, GIVEN ],
  products: [
    [ EDITABLE, GIVEN ],
    [ GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

/*---------------------------------------------------------------------------*
* Numbers 2
*----------------------------------------------------------------------------*/

// L2-1
AreaChallengeDescription.LEVEL_2_NUMBERS_1 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN ],
  vertical: [ GIVEN, GIVEN ],
  products: [
    [ EDITABLE, GIVEN ],
    [ GIVEN, EDITABLE ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

// L2-2
AreaChallengeDescription.LEVEL_2_NUMBERS_2 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN ],
  vertical: [ GIVEN, GIVEN ],
  products: [
    [ EDITABLE, GIVEN ],
    [ GIVEN, GIVEN ]
  ],
  total: EDITABLE,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

// L2-3
AreaChallengeDescription.LEVEL_2_NUMBERS_3 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN, GIVEN ],
  vertical: [ GIVEN, GIVEN ],
  products: [
    [ EDITABLE, GIVEN, GIVEN ],
    [ GIVEN, EDITABLE, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

// L2-4
AreaChallengeDescription.LEVEL_2_NUMBERS_4 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN, GIVEN ],
  vertical: [ GIVEN, GIVEN ],
  products: [
    [ EDITABLE, GIVEN, GIVEN ],
    [ GIVEN, GIVEN, GIVEN ]
  ],
  total: EDITABLE,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

// L2-5
AreaChallengeDescription.LEVEL_2_NUMBERS_5 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN, GIVEN ],
  vertical: [ GIVEN, GIVEN, GIVEN ],
  products: [
    [ EDITABLE, GIVEN, GIVEN ],
    [ GIVEN, EDITABLE, GIVEN ],
    [ GIVEN, GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

/*---------------------------------------------------------------------------*
* Numbers 3
*----------------------------------------------------------------------------*/

// L3-1
AreaChallengeDescription.LEVEL_3_NUMBERS_1 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, EDITABLE ],
  vertical: [ GIVEN ],
  products: [
    [ DYNAMIC, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

// L3-2
AreaChallengeDescription.LEVEL_3_NUMBERS_2 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, GIVEN ],
  vertical: [ EDITABLE ],
  products: [
    [ DYNAMIC, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.NUMBERS
} );

// L3-3
AreaChallengeDescription.LEVEL_3_NUMBERS_3 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, EDITABLE, GIVEN ],
  vertical: [ GIVEN ],
  products: [
    [ DYNAMIC, GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

// L3-4
AreaChallengeDescription.LEVEL_3_NUMBERS_4 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, GIVEN, GIVEN ],
  vertical: [ EDITABLE ],
  products: [
    [ GIVEN, GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.NUMBERS
} );

// L3-5
AreaChallengeDescription.LEVEL_3_NUMBERS_5 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, GIVEN ],
  vertical: [ EDITABLE, GIVEN ],
  products: [
    [ GIVEN, DYNAMIC ],
    [ DYNAMIC, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

// L3-6
AreaChallengeDescription.LEVEL_3_NUMBERS_6 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, GIVEN ],
  vertical: [ EDITABLE, GIVEN ],
  products: [
    [ DYNAMIC, GIVEN ],
    [ GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

/*---------------------------------------------------------------------------*
* Numbers 4
*----------------------------------------------------------------------------*/

// L4-1
AreaChallengeDescription.LEVEL_4_NUMBERS_1 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, EDITABLE, EDITABLE ],
  vertical: [ GIVEN, GIVEN ],
  products: [
    [ DYNAMIC, GIVEN, GIVEN ],
    [ GIVEN, DYNAMIC, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

// L4-2
AreaChallengeDescription.LEVEL_4_NUMBERS_2 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, EDITABLE, GIVEN ],
  vertical: [ EDITABLE, GIVEN ],
  products: [
    [ DYNAMIC, GIVEN, GIVEN ],
    [ GIVEN, GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

// L4-3
AreaChallengeDescription.LEVEL_4_NUMBERS_3 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, EDITABLE, GIVEN ],
  vertical: [ EDITABLE, GIVEN ],
  products: [
    [ DYNAMIC, GIVEN, GIVEN ],
    [ GIVEN, DYNAMIC, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

// L4-4
AreaChallengeDescription.LEVEL_4_NUMBERS_4 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, EDITABLE, EDITABLE ],
  vertical: [ GIVEN, GIVEN, GIVEN ],
  products: [
    [ DYNAMIC, GIVEN, GIVEN ],
    [ GIVEN, DYNAMIC, GIVEN ],
    [ GIVEN, GIVEN, DYNAMIC ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

// L4-5
AreaChallengeDescription.LEVEL_4_NUMBERS_5 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, EDITABLE, GIVEN ],
  vertical: [ EDITABLE, GIVEN, GIVEN ],
  products: [
    [ DYNAMIC, GIVEN, GIVEN ],
    [ GIVEN, DYNAMIC, GIVEN ],
    [ GIVEN, GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.NUMBERS
} );

/*---------------------------------------------------------------------------*
* Numbers 5
*----------------------------------------------------------------------------*/

// L5-1
AreaChallengeDescription.LEVEL_5_NUMBERS_1 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, GIVEN ],
  vertical: [ EDITABLE ],
  products: [
    [ GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: DYNAMIC,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.NUMBERS
} );

// L5-3
AreaChallengeDescription.LEVEL_5_NUMBERS_3 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, GIVEN, GIVEN ],
  vertical: [ EDITABLE ],
  products: [
    [ GIVEN, GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: DYNAMIC,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.NUMBERS
} );

/*---------------------------------------------------------------------------*
* Numbers 6
*----------------------------------------------------------------------------*/

// L6-1
AreaChallengeDescription.LEVEL_6_NUMBERS_1 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, EDITABLE ],
  vertical: [ EDITABLE, GIVEN ],
  products: [
    [ GIVEN, GIVEN ],
    [ GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: DYNAMIC,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.NUMBERS
} );

/*---------------------------------------------------------------------------*
* Variables 1
*----------------------------------------------------------------------------*/

// L1-1
AreaChallengeDescription.LEVEL_1_VARIABLES_1 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN ],
  vertical: [ GIVEN ],
  products: [
    [ EDITABLE, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
} );

// L1-2
AreaChallengeDescription.LEVEL_1_VARIABLES_2 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN ],
  vertical: [ GIVEN ],
  products: [
    [ GIVEN, GIVEN ]
  ],
  total: EDITABLE,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
} );

// L1-3
AreaChallengeDescription.LEVEL_1_VARIABLES_3 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN, GIVEN ],
  vertical: [ GIVEN ],
  products: [
    [ EDITABLE, GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
} );

// L1-4
AreaChallengeDescription.LEVEL_1_VARIABLES_4 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN, GIVEN ],
  vertical: [ GIVEN ],
  products: [
    [ GIVEN, GIVEN, GIVEN ]
  ],
  total: EDITABLE,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
} );

/*---------------------------------------------------------------------------*
* Variables 2
*----------------------------------------------------------------------------*/

// L2-1
AreaChallengeDescription.LEVEL_2_VARIABLES_1 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN ],
  vertical: [ GIVEN, GIVEN ],
  products: [
    [ EDITABLE, GIVEN ],
    [ GIVEN, EDITABLE ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
} );

// L2-2
AreaChallengeDescription.LEVEL_2_VARIABLES_2 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, GIVEN ],
  vertical: [ GIVEN, GIVEN ],
  products: [
    [ EDITABLE, GIVEN ],
    [ GIVEN, GIVEN ]
  ],
  total: EDITABLE,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
} );

/*---------------------------------------------------------------------------*
* Variables 3
*----------------------------------------------------------------------------*/

// L3-1
AreaChallengeDescription.LEVEL_3_VARIABLES_1 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, GIVEN ],
  vertical: [ EDITABLE ],
  products: [
    [ GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.VARIABLES
} );

// L3-2
AreaChallengeDescription.LEVEL_3_VARIABLES_2 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, EDITABLE ],
  vertical: [ GIVEN ],
  products: [
    [ DYNAMIC, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
} );

// L3-3
AreaChallengeDescription.LEVEL_3_VARIABLES_3 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, GIVEN ],
  vertical: [ GIVEN ],
  products: [
    [ GIVEN, EDITABLE ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
} );

// L3-4
AreaChallengeDescription.LEVEL_3_VARIABLES_4 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, GIVEN, GIVEN ],
  vertical: [ EDITABLE ],
  products: [
    [ GIVEN, DYNAMIC, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.VARIABLES
} );

// L3-5
AreaChallengeDescription.LEVEL_3_VARIABLES_5 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, EDITABLE, GIVEN ],
  vertical: [ GIVEN ],
  products: [
    [ DYNAMIC, GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
} );

// L3-6
AreaChallengeDescription.LEVEL_3_VARIABLES_6 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, GIVEN, GIVEN ],
  vertical: [ GIVEN ],
  products: [
    [ GIVEN, EDITABLE, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
} );

/*---------------------------------------------------------------------------*
* Variables 4
*----------------------------------------------------------------------------*/

// L4-1
AreaChallengeDescription.LEVEL_4_VARIABLES_1 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, GIVEN ],
  vertical: [ EDITABLE, GIVEN ],
  products: [
    [ GIVEN, DYNAMIC ],
    [ DYNAMIC, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
} );

// L4-2
AreaChallengeDescription.LEVEL_4_VARIABLES_2 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, GIVEN ],
  vertical: [ GIVEN, GIVEN ],
  products: [
    [ GIVEN, EDITABLE ],
    [ GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: GIVEN,
  verticalTotal: GIVEN,
  type: AreaChallengeType.VARIABLES
} );

/*---------------------------------------------------------------------------*
* Variables 5
*----------------------------------------------------------------------------*/

// L5-1
AreaChallengeDescription.LEVEL_5_VARIABLES_1 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, GIVEN ],
  vertical: [ EDITABLE ],
  products: [
    [ GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: DYNAMIC,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.VARIABLES
} );

// L5-2
AreaChallengeDescription.LEVEL_5_VARIABLES_2 = new AreaChallengeDescription( {
  horizontal: [ EDITABLE, GIVEN, GIVEN ],
  vertical: [ EDITABLE ],
  products: [
    [ GIVEN, GIVEN, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: DYNAMIC,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.VARIABLES
} );

/*---------------------------------------------------------------------------*
* Variables 6
*----------------------------------------------------------------------------*/

// L6-1
AreaChallengeDescription.LEVEL_6_VARIABLES_1 = new AreaChallengeDescription( {
  horizontal: [ GIVEN, EDITABLE ],
  vertical: [ GIVEN, EDITABLE ],
  products: [
    [ GIVEN, DYNAMIC ],
    [ DYNAMIC, GIVEN ]
  ],
  total: GIVEN,
  horizontalTotal: DYNAMIC,
  verticalTotal: DYNAMIC,
  type: AreaChallengeType.VARIABLES,
  shufflable: false,
  unique: false
} );

export default AreaChallengeDescription;