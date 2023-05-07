// Copyright 2017-2022, University of Colorado Boulder

/**
 * Functions for creating ShoppingQuestions and question sets.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Utils from '../../../../dot/js/Utils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import URUtils from '../../common/URUtils.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import ShoppingQuestion from './ShoppingQuestion.js';

const ShoppingQuestionFactory = {

  /**
   * Creates a question of the form 'Unit Rate?'
   *
   * @param {number} unitRate
   * @param {string} units - units for the denominator
   * @param {Object} numeratorOptions - see ShoppingItem options.numeratorOptions
   * @param {Object} denominatorOptions - see ShoppingItem options.denominatorOptions
   * @returns {ShoppingQuestion}
   * @public
   * @static
   */
  createUnitRateQuestion: function( unitRate, units, numeratorOptions, denominatorOptions ) {

    // '$0.50'
    const numerator = unitRate;
    const numeratorString = StringUtils.format( UnitRatesStrings.pattern_0cost,
      URUtils.numberToString( numerator, numeratorOptions.maxDecimals, numeratorOptions.trimZeros ) );

    // '1 Apple'
    const denominator = 1;
    const denominatorString = StringUtils.format( UnitRatesStrings.pattern_0value_1units,
      URUtils.numberToString( denominator, denominatorOptions.maxDecimals, denominatorOptions.trimZeros ),
      units );

    return new ShoppingQuestion( UnitRatesStrings.unitRateQuestion, unitRate, numerator, denominator, numeratorString, denominatorString, numeratorOptions );
  },

  /**
   * Creates question sets from raw data.
   *
   * @param {number[][]} questionQuantities - number of items for each question, see ShoppingItemData
   * @param {number} unitRate
   * @param {string} singularUnits - denominator units to use for questions with singular quantities
   * @param {string} pluralUnits - denominator units to use for questions with plural quantities
   * @param {string} amountOfQuestionUnits - units used for "Apples for $10.00?" type questions
   * @param {Object} numeratorOptions - see ShoppingItem.numeratorOptions
   * @param {Object} denominatorOptions - see ShoppingItem.denominatorOptions
   * @returns {ShoppingQuestion[][]}
   * @public
   * @static
   */
  createQuestionSets: function( questionQuantities, unitRate, singularUnits, pluralUnits, amountOfQuestionUnits, numeratorOptions, denominatorOptions ) {

    const questionSets = []; // {ShoppingQuestion[][]}

    questionQuantities.forEach( quantities => {

      const questions = [];

      // the first N-1 questions are of the form 'Cost of 3 Apples?'
      for ( let i = 0; i < quantities.length - 1; i++ ) {
        questions.push( createCostOfQuestion( quantities[ i ],
          unitRate, singularUnits, pluralUnits,
          numeratorOptions, denominatorOptions ) );
      }

      // the last question is of the form 'Apples for $3.00?'
      questions.push( createItemsForQuestion( quantities[ quantities.length - 1 ],
        unitRate, singularUnits, pluralUnits, amountOfQuestionUnits,
        numeratorOptions, denominatorOptions ) );

      questionSets.push( questions );
    } );

    return questionSets;
  }
};

/**
 * Creates a question of the form 'Cost of 10 Apples?' or 'Cost of 2.2 pounds?'
 * @param {number} denominator
 * @param {number} unitRate
 * @param {string} singularUnits - denominator units to use for questions with singular quantities
 * @param {string} pluralUnits - denominator units to use for questions with plural quantities
 * @param {Object} numeratorOptions - see ShoppingItem options.numeratorOptions
 * @param {Object} denominatorOptions - see ShoppingItem options.denominatorOptions
 * @returns {ShoppingQuestion}
 */
function createCostOfQuestion( denominator, unitRate, singularUnits, pluralUnits, numeratorOptions, denominatorOptions ) {

  // answer
  const numerator = denominator * unitRate;
  const answer = Utils.toFixedNumber( numerator, numeratorOptions.maxDecimals );

  // 'Apples' or 'Apple'
  const units = ( denominator > 1 ) ? pluralUnits : singularUnits;

  // '$3.00'
  const numeratorString = StringUtils.format( UnitRatesStrings.pattern_0cost,
    URUtils.numberToString( numerator, numeratorOptions.maxDecimals, numeratorOptions.trimZeros ) );

  // '10 Apples'
  const denominatorString = StringUtils.format( UnitRatesStrings.pattern_0value_1units,
    URUtils.numberToString( denominator, denominatorOptions.maxDecimals, denominatorOptions.trimZeros ),
    units );

  // 'Cost of 10 Apples?'
  const questionString = StringUtils.format( UnitRatesStrings.pattern_costOf_0quantity_1units,
    URUtils.numberToString( denominator, denominatorOptions.maxDecimals, denominatorOptions.trimZeros ),
    units );

  return new ShoppingQuestion( questionString, answer, numerator, denominator, numeratorString, denominatorString, numeratorOptions );
}

/**
 * Creates a question of the form 'Apples for $3.00?'
 * @param {number} denominator
 * @param {number} unitRate
 * @param {string} singularUnits
 * @param {string} pluralUnits
 * @param {string} amountOfQuestionUnits - units used for "Apples for $10.00?" type questions
 * @param {Object} numeratorOptions - see ShoppingItem options.numeratorOptions
 * @param {Object} denominatorOptions - see ShoppingItem options.denominatorOptions
 * @returns {ShoppingQuestion}
 */
function createItemsForQuestion( denominator, unitRate, singularUnits, pluralUnits, amountOfQuestionUnits, numeratorOptions, denominatorOptions ) {

  // answer
  const answer = Utils.toFixedNumber( denominator, denominatorOptions.maxDecimals );

  // 'Apples' or 'Apple'
  const units = ( denominator > 1 ) ? pluralUnits : singularUnits;

  // '$4.00'
  const numerator = denominator * unitRate;
  const numeratorString = StringUtils.format( UnitRatesStrings.pattern_0cost,
    URUtils.numberToString( numerator, numeratorOptions.maxDecimals, numeratorOptions.trimZeros ) );

  // '8 Apples'
  const denominatorString = StringUtils.format( UnitRatesStrings.pattern_0value_1units,
    URUtils.numberToString( denominator, denominatorOptions.maxDecimals, denominatorOptions.trimZeros ),
    units );

  // 'Apples for $4.00?'
  const questionString = StringUtils.format( UnitRatesStrings.pattern_0items_1cost,
    amountOfQuestionUnits,
    URUtils.numberToString( numerator, numeratorOptions.maxDecimals, numeratorOptions.trimZeros ) );

  return new ShoppingQuestion( questionString, answer, numerator, denominator, numeratorString, denominatorString, denominatorOptions );
}

unitRates.register( 'ShoppingQuestionFactory', ShoppingQuestionFactory );

export default ShoppingQuestionFactory;