// Copyright 2015-2021, University of Colorado Boulder

/**
 * Generates a pair of numbers that will need to be added together as a challenge.
 *
 * @author Sharfudeen Ashraf
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import dotRandom from '../../../../../dot/js/dotRandom.js';
import makeATen from '../../../makeATen.js';
import NumberChallenge from './NumberChallenge.js';

class NumberChallengeFactory {
  constructor() {

    // @private {Random} - Stored here because we can't grab a reference until after the sim has launched (and after we
    //                     have defined the NumberChallengeFactory type).
    this.random = dotRandom;

    // Level 1. Single digits that add up to <= 10.
    // @private {Array.<NumberChallenge>} - Enumeration of all possibilities, randomly selected.
    this.tenAndUnderChallenges = this.sumsUpTo( 1, 10 );

    // Level 2. Single digits that add up to >= 11, where one of them is 9
    // @private {Array.<NumberChallenge>} - Enumeration of all possibilities when the count is even, randomly selected.
    this.withNineLeftChallenges = this.sumsOverTenChallenges( 9, true, false );
    // @private {Array.<NumberChallenge>} - Enumeration of all possibilities when the count is odd, randomly selected.
    this.withNineRightChallenges = this.sumsOverTenChallenges( 9, false, true );
    // @private {number} - Used for alternation between the 'left' and 'right' varieties.
    this.withNineCount = 0;

    // Level 3. Single digits such that 10 < sum < 20.
    // @private {Array.<NumberChallenge>} - All possible challenges for the "Under Twenty" challenge, and also used for
    //                                      generating many of the other terms lists.
    this.underTwentyChallenges = [].concat(
      this.sumsOverTenChallenges( 9, true, true ),
      this.sumsOverTenChallenges( 8, true, true ),
      this.sumsOverTenChallenges( 7, true, true ),
      this.sumsOverTenChallenges( 6, true, true )
    );

    // Level 4. Like level 3 with each number multiplied by 10.
    // @private {Array.<NumberChallenge>} - All possible challenges for the "Add with Tens" challenge.
    this.addWithTensChallenges = this.underTwentyChallenges.map( challenge => new NumberChallenge( challenge.leftTerm * 10, challenge.rightTerm * 10 ) );

    // Level 5. Like level 3, but one number has a random "decade" added to it.
    // @private {Array.<NumberChallenge>} - All possible challenges for the "Add with Singles" challenge.
    this.addWithSinglesChallenges = [];
    this.underTwentyChallenges.forEach( challenge => {
      for ( let decade = 10; decade <= 80; decade += 10 ) {
        // Only add to the left, since underTwentyChallenges includes both [a,b] and [b,a].
        this.addWithSinglesChallenges.push( new NumberChallenge( challenge.leftTerm + decade, challenge.rightTerm ) );
        this.addWithSinglesChallenges.push( new NumberChallenge( challenge.rightTerm, challenge.leftTerm + decade ) );
      }
    } );

    // Level 6. Double digit numbers with sum < 100.
    // @private {Array.<NumberChallenge>} - All possible challenges for the "Under Hundreds" challenge.
    this.underHundredsChallenges = this.sumsUpTo( 11, 99 );

    // Level 7. Double digit numbers with sum >= 100
    // @private {Array.<NumberChallenge>} - All possible challenges for the "Over Hundreds" challenge.
    this.overHundredsChallenges = this.sumsDownTo( 11, 99, 100 );

    // Level 8. Single digit numbers added to multiples of 100.
    // @private {Array.<NumberChallenge>} - Enumeration of all possibilities when the count is even, randomly selected.
    this.singlesToHundredsLeftChallenges = this.addWithSinglesThreeDigitChallenges( true );
    // @private {Array.<NumberChallenge>} - Enumeration of all possibilities when the count is odd, randomly selected.
    this.singlesToHundredsRightChallenges = this.addWithSinglesThreeDigitChallenges( false );
    // @private {number} - Used for alternation between the 'left' and 'right' varieties.
    this.singlesToHundredsCount = 0;
  }

  /**
   * Creates a random challenge for a specific level.
   * @public
   *
   * @returns {NumberChallenge}
   */
  generateChallenge( level ) {
    switch( level ) {
      case 0:
        return this.random.sample( this.tenAndUnderChallenges );
      case 1:
        // Alternates between the 'left' and 'right' varieties
        return this.random.sample( ( this.withNineCount++ % 2 === 0 ) ? this.withNineLeftChallenges : this.withNineRightChallenges );
      case 2:
        return this.random.sample( this.underTwentyChallenges );
      case 3:
        return this.random.sample( this.addWithTensChallenges );
      case 4:
        return this.random.sample( this.addWithSinglesChallenges );
      case 5:
        return this.random.sample( this.underHundredsChallenges );
      case 6:
        return this.random.sample( this.overHundredsChallenges );
      case 7:
        // Alternates between the 'left' and 'right' varieties
        return this.random.sample( ( this.singlesToHundredsCount++ % 2 === 0 ) ? this.singlesToHundredsLeftChallenges : this.singlesToHundredsRightChallenges );
      case 8:
        return new NumberChallenge( this.random.nextIntBetween( 10, 99 ) * 10, this.random.nextIntBetween( 10, 99 ) * 10 );
      case 9:
        return new NumberChallenge( this.random.nextIntBetween( 101, 999 ), this.random.nextIntBetween( 101, 999 ) );
      default:
        throw new Error( `Invalid level: ${level}` );
    }
  }

  /**
   * Generates an array of challenges whose sum >= 11, where one of the numbers is the bigNumber, and the other is
   * less than or equal to bigNumber.
   * @private
   *
   * For example, if the bigNumber is 8, the result will include:
   * - (8,8) always
   * - (8,7), (8,6), (8,5), (8,4), (8,3) if includeLeftBiggest is true
   * - (7,8), (6,8), (5,8), (4,8), (3,8) if includeRightBiggest is true
   *
   * @param {number} bigNumber - The largest number to be included in the challenges. Guaranteed to be at least one
   *                             term for every challenge.
   * @returns {Array.<NumberChallenge>}
   */
  sumsOverTenChallenges( bigNumber, includeLeftBiggest, includeRightBiggest ) {
    const challenges = [];

    for ( let i = 11 - bigNumber; i < bigNumber; i++ ) {
      if ( includeLeftBiggest ) {
        challenges.push( new NumberChallenge( bigNumber, i ) );
      }
      if ( includeRightBiggest ) {
        challenges.push( new NumberChallenge( i, bigNumber ) );
      }
    }

    // Only include one where both are the big number, so we only have unique challenges
    challenges.push( new NumberChallenge( bigNumber, bigNumber ) );

    return challenges;
  }

  /**
   * Generates an array of challenges where terms are at least minimumNumber, with a combined maximum sum.
   * @private
   *
   * @returns {Array.<NumberChallenge>}
   */
  sumsUpTo( minimumNumber, maximumSum ) {
    const challenges = [];

    for ( let left = minimumNumber; left < maximumSum; left++ ) {
      for ( let right = minimumNumber; left + right <= maximumSum; right++ ) {
        challenges.push( new NumberChallenge( left, right ) );
      }
    }

    return challenges;
  }

  /**
   * Generates an array of challenges where terms satisfy minimumNumber <= term <= maximumNumber, and the sum is
   * sum >= minimumSum.
   * @private
   *
   * @returns {Array.<NumberChallenge>}
   */
  sumsDownTo( minimumNumber, maximumNumber, minimumSum ) {
    const challenges = [];

    for ( let left = minimumNumber; left <= maximumNumber; left++ ) {
      // Start with minimumNumber, OR if that would result in an invalid sum, the number that would add up to the sum
      for ( let right = Math.max( minimumNumber, minimumSum - left ); right <= maximumNumber; right++ ) {
        challenges.push( new NumberChallenge( left, right ) );
      }
    }

    return challenges;
  }

  /**
   * For level 8, adding single digit numbers to multiples of 100.
   * @private
   *
   * @returns {Array.<NumberChallenge>}
   */
  addWithSinglesThreeDigitChallenges( isLeftBiggest ) {
    const challenges = [];

    for ( let left = 100; left <= 900; left += 100 ) {
      for ( let right = 1; right <= 9; right++ ) {
        challenges.push( isLeftBiggest ? new NumberChallenge( left, right ) : new NumberChallenge( right, left ) );
      }
    }

    return challenges;
  }
}

makeATen.register( 'NumberChallengeFactory', NumberChallengeFactory );

export default NumberChallengeFactory;