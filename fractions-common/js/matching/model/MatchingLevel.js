// Copyright 2019-2020, University of Colorado Boulder

/**
 * A specific level for the matching game, that can have multiple challenges over time.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Anton Ulyanov, Andrey Zelenkov (Mlearner)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import fractionsCommon from '../../fractionsCommon.js';
import FillType from '../../game/model/FillType.js';
import ShapePartition from '../../game/model/ShapePartition.js';
import MatchingChallenge from './MatchingChallenge.js';

// constants
const MAX_SCORE = 12;

class MatchingLevel {
  /**
   * @param {Object} description - To be passed to the challenge options
   * @param {number} number
   * @param {Object} [options]
   */
  constructor( description, number, options ) {

    options = merge( {
      timeVisibleProperty: new BooleanProperty( true )
    }, options );

    // @private {Object}
    this.description = description;

    // @private {Property.<boolean>}
    this.timeVisibleProperty = options.timeVisibleProperty;

    // @public {number}
    this.number = number;

    // @public {Property.<number>}
    this.bestTimeProperty = new NumberProperty( Number.POSITIVE_INFINITY );

    // @public {Property.<MatchingChallenge>}
    this.challengeProperty = new Property( this.nextChallenge() );

    // Clear out the initial value so that we don't leak memory (since they retain a reference to the previous
    // challenge).
    this.challengeProperty._initialValue = null;

    // @public {Property.<number>}
    this.scoreProperty = new DynamicProperty( this.challengeProperty, {
      derive: 'scoreProperty'
    } );

    // @public {Property.<number>} - Track the score shown on the level selection separately, since it needs to be
    // independently controlled for https://github.com/phetsims/fraction-matcher/issues/98.
    this.levelSelectionScoreProperty = new NumberProperty( 0 );
    this.scoreProperty.link( ( newScore, oldScore ) => {
      if ( newScore > oldScore ) {
        this.levelSelectionScoreProperty.value = newScore;
      }
    } );

    // @private {function}
    this.completedListener = () => {
      const score = this.challengeProperty.value.scoreProperty.value;

      // Only record the best time for perfect runs, see https://github.com/phetsims/fractions-common/issues/92
      if ( score === MAX_SCORE ) {
        this.bestTimeProperty.value = Utils.toFixedNumber( Math.min( this.bestTimeProperty.value, this.challengeProperty.value.elapsedTimeProperty.value ), 0 );
      }
    };

    this.challengeProperty.link( ( newChallenge, oldChallenge ) => {
      oldChallenge && oldChallenge.completedEmitter.removeListener( this.completedListener );
      newChallenge.completedEmitter.addListener( this.completedListener );
    } );
  }

  /**
   * Returns a new challenge.
   * @private
   *
   * @returns {MatchingChallenge}
   */
  nextChallenge() {
    return new MatchingChallenge( this.number, merge( {
      timeVisibleProperty: this.timeVisibleProperty,
      previousBestTime: this.bestTimeProperty.value
    }, this.description ) );
  }

  /**
   * When a level is selected, switch the icon's score to the current score.
   * @private
   */
  select() {
    this.levelSelectionScoreProperty.value = this.scoreProperty.value;
  }

  /**
   * Refreshes the level's challenge, without changing permanent things like the high score.
   * @public
   */
  refresh() {
    const nextChallenge = this.nextChallenge();
    this.challengeProperty.value.refreshedChallenge = nextChallenge;
    this.challengeProperty.value = nextChallenge;
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {
    this.bestTimeProperty.reset();
    this.levelSelectionScoreProperty.reset();
    this.refresh();
  }

  /**
   * Returns a set of config options provided to the MatchingChallenge constructor to create a challenge for unmixed
   * levels.
   * @public
   *
   * @returns {Array.<Object>}
   */
  static getUnmixedLevelDescriptions() {
    return [
      /**
       * Level 1
       * No mixed numbers
       * Only “exact” matches will be present. So for instance if there is a 3/6  and a pie with 6 divisions and 3 shaded slices, there will not be a ½  present .  In other words, the numerical representation on this level will exactly match the virtual manipulative.
       * Only numbers/representations ≦ 1 possible on this level
       * “Easy” shapes on this level (not some of the more abstract representations)
       */
      {
        fractions: [
          new Fraction( 1, 2 ),
          new Fraction( 1, 3 ),
          new Fraction( 2, 3 ),
          new Fraction( 1, 4 ),
          new Fraction( 3, 4 ),
          new Fraction( 1, 1 )
        ],
        shapePartitions: [
          ...ShapePartition.PIES,
          ...ShapePartition.HORIZONTAL_BARS,
          ...ShapePartition.VERTICAL_BARS
        ]
      },
      /**
       * Level 2
       * Reduced fractions possible on this level. So, for instance 3/6 and ½  could both be present.  Or a virtual representation of 3/6 could have the numerical of ½ be its only possible match
       * Still only numbers/representations ≦ 1 possible
       * More shapes can be introduced
       */
      {
        fractions: [
          new Fraction( 1, 2 ),
          new Fraction( 1, 3 ),
          new Fraction( 2, 3 ),
          new Fraction( 2, 4 ),
          new Fraction( 3, 4 ),
          new Fraction( 2, 6 ),
          new Fraction( 3, 6 )
        ]
      },
      /**
       * Level 3:
       * Reduced fractions possible on this level. So, for instance 3/6 and ½  could both be present.  Or a virtual representation of 3/6 could have the numerical of ½ be its only possible match
       * Still only numbers/representations ≦ 1 possible
       * More shapes can be introduced
       */
      {
        fractions: [
          new Fraction( 3, 2 ),
          new Fraction( 4, 3 ),
          new Fraction( 5, 4 ),
          new Fraction( 6, 4 ),
          new Fraction( 7, 4 ),
          new Fraction( 4, 5 ),
          new Fraction( 2, 6 ),
          new Fraction( 3, 6 ),
          new Fraction( 4, 6 ),
          new Fraction( 5, 6 ),
          new Fraction( 7, 6 ),
          new Fraction( 3, 8 ),
          new Fraction( 4, 8 ),
          new Fraction( 5, 8 ),
          new Fraction( 6, 8 ),
          new Fraction( 7, 8 )
        ]
      },
      /**
       * Level 4:
       * All representations possible as well as complicated mixed/improper numbers
       */
      {
        fractions: [
          new Fraction( 13, 7 ),
          new Fraction( 13, 7 ),
          new Fraction( 6, 3 ),
          new Fraction( 9, 5 ),
          new Fraction( 9, 7 ),
          new Fraction( 9, 8 ),
          new Fraction( 14, 8 ),
          new Fraction( 2, 9 ),
          new Fraction( 3, 9 ),
          new Fraction( 4, 9 ),
          new Fraction( 6, 9 ),
          new Fraction( 8, 9 )
        ],
        numericScaleFactors: [ 1, 2 ]
      },
      /**
       * Level 5:
       * All representations possible as well as complicated mixed/improper numbers.  Same fractions as level 4 but different representations.
       */
      {
        fractions: [
          new Fraction( 13, 7 ),
          new Fraction( 13, 7 ),
          new Fraction( 6, 3 ),
          new Fraction( 9, 5 ),
          new Fraction( 9, 7 ),
          new Fraction( 9, 8 ),
          new Fraction( 14, 8 ),
          new Fraction( 2, 9 ),
          new Fraction( 3, 9 ),
          new Fraction( 4, 9 ),
          new Fraction( 6, 9 ),
          new Fraction( 8, 9 )
        ],
        numericScaleFactors: [ 1, 2, 3 ],
        fillTypes: [ FillType.SEQUENTIAL, FillType.MIXED ]
      },
      /**
       * Level 6:
       * All representations possible as well as complicated mixed/improper numbers
       */
      {
        fractions: [
          new Fraction( 6, 5 ),
          new Fraction( 7, 5 ),
          new Fraction( 8, 5 ),
          new Fraction( 9, 5 ),
          new Fraction( 7, 6 ),
          new Fraction( 8, 6 ),
          new Fraction( 9, 6 ),
          new Fraction( 9, 7 ),
          new Fraction( 10, 7 ),
          new Fraction( 13, 7 ),
          new Fraction( 9, 8 ),
          new Fraction( 10, 8 ),
          new Fraction( 11, 8 ),
          new Fraction( 14, 8 ),
          new Fraction( 4, 9 ),
          new Fraction( 6, 9 ),
          new Fraction( 8, 9 ),
          new Fraction( 10, 9 ),
          new Fraction( 11, 9 )
        ],
        numericScaleFactors: [ 1, 4, 5 ],
        fillTypes: [ FillType.SEQUENTIAL, FillType.RANDOM ]
      },
      /**
       * Level 7:
       * All representations possible as well as complicated mixed/improper numbers
       */
      {
        fractions: [
          new Fraction( 3, 2 ),
          new Fraction( 4, 3 ),
          new Fraction( 5, 3 ),
          new Fraction( 5, 4 ),
          new Fraction( 7, 4 ),
          new Fraction( 6, 5 ),
          new Fraction( 7, 5 ),
          new Fraction( 8, 5 ),
          new Fraction( 9, 5 ),
          new Fraction( 7, 6 ),
          new Fraction( 11, 6 )
        ],
        numericScaleFactors: [ 1, 6, 7 ],
        fillTypes: [ FillType.SEQUENTIAL, FillType.RANDOM ]
      },
      /**
       * Level 8:
       * All representations possible as well as complicated mixed/improper numbers
       */
      {
        fractions: [
          new Fraction( 8, 7 ),
          new Fraction( 9, 7 ),
          new Fraction( 10, 7 ),
          new Fraction( 11, 7 ),
          new Fraction( 12, 7 ),
          new Fraction( 13, 7 ),
          new Fraction( 9, 8 ),
          new Fraction( 10, 8 ),
          new Fraction( 11, 8 ),
          new Fraction( 12, 8 ),
          new Fraction( 13, 8 ),
          new Fraction( 14, 8 ),
          new Fraction( 15, 8 ),
          new Fraction( 10, 9 ),
          new Fraction( 11, 9 ),
          new Fraction( 12, 9 ),
          new Fraction( 13, 9 ),
          new Fraction( 14, 9 ),
          new Fraction( 15, 9 ),
          new Fraction( 16, 9 ),
          new Fraction( 17, 9 )
        ],
        numericScaleFactors: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
        fillTypes: [ FillType.SEQUENTIAL, FillType.RANDOM ]
      }
    ];
  }

  /**
   * Returns a set of config options provided to the MatchingChallenge constructor to create a challenge for mixed
   * levels.
   * @public
   *
   * @returns {Array.<Object>}
   */
  static getMixedLevelDescriptions() {
    const descriptions = MatchingLevel.getUnmixedLevelDescriptions();

    descriptions.forEach( description => {
      description.hasMixedNumbers = true;
    } );

    //mixed numbers added some more fractions or remove extra
    descriptions[ 0 ].fractions.pop();
    // add mixed fractions
    descriptions[ 0 ].fractions.push(
      new Fraction( 3, 2 ),
      new Fraction( 4, 3 )
    );

    // level 2
    // add more mixed fractions
    descriptions[ 1 ].fractions.push(
      new Fraction( 3, 2 ),
      new Fraction( 4, 3 ),
      new Fraction( 5, 3 ),
      new Fraction( 5, 4 ),
      new Fraction( 6, 4 ),
      new Fraction( 6, 5 )
    );

    // level 3
    // add more mixed fractions
    descriptions[ 2 ].fractions.push(
      new Fraction( 5, 3 ),
      new Fraction( 6, 5 ),
      new Fraction( 7, 5 ),
      new Fraction( 8, 5 ),
      new Fraction( 9, 5 ),
      new Fraction( 8, 6 ),
      new Fraction( 9, 6 ),
      new Fraction( 10, 6 ),
      new Fraction( 11, 6 ),
      new Fraction( 8, 7 ),
      new Fraction( 9, 7 ),
      new Fraction( 10, 7 ),
      new Fraction( 11, 7 ),
      new Fraction( 12, 7 ),
      new Fraction( 13, 7 ),
      new Fraction( 9, 8 ),
      new Fraction( 10, 8 ),
      new Fraction( 11, 8 ),
      new Fraction( 12, 8 ),
      new Fraction( 13, 8 ),
      new Fraction( 14, 8 ),
      new Fraction( 15, 8 )
    );

    // level 4
    // remove one 13/7 fraction
    descriptions[ 3 ].fractions.shift();
    // add more mixed fractions
    descriptions[ 3 ].fractions.push(
      new Fraction( 6, 5 ),
      new Fraction( 7, 5 ),
      new Fraction( 8, 5 ),
      new Fraction( 7, 6 ),
      new Fraction( 8, 6 ),
      new Fraction( 9, 6 ),
      new Fraction( 10, 6 ),
      new Fraction( 11, 6 ),
      new Fraction( 8, 7 ),
      new Fraction( 10, 7 ),
      new Fraction( 11, 7 ),
      new Fraction( 12, 7 ),
      new Fraction( 10, 8 ),
      new Fraction( 11, 8 ),
      new Fraction( 12, 8 ),
      new Fraction( 13, 8 ),
      new Fraction( 15, 8 ),
      new Fraction( 10, 9 ),
      new Fraction( 11, 9 ),
      new Fraction( 12, 9 ),
      new Fraction( 13, 9 ),
      new Fraction( 14, 9 ),
      new Fraction( 15, 9 ),
      new Fraction( 16, 9 ),
      new Fraction( 17, 9 )
    );
    descriptions[ 3 ].numericScaleFactors = [ 1 ];

    // level 5
    descriptions[ 4 ].fractions = descriptions[ 3 ].fractions.slice( 0 );

    // level 6
    // add more mixed fractions
    descriptions[ 5 ].fractions.push(
      new Fraction( 10, 6 ),
      new Fraction( 11, 6 ),
      new Fraction( 8, 7 ),
      new Fraction( 11, 7 ),
      new Fraction( 12, 7 ),
      new Fraction( 12, 8 ),
      new Fraction( 13, 8 ),
      new Fraction( 15, 8 ),
      new Fraction( 12, 9 ),
      new Fraction( 13, 9 ),
      new Fraction( 14, 9 ),
      new Fraction( 15, 9 ),
      new Fraction( 16, 9 ),
      new Fraction( 17, 9 )
    );

    // level 7
    // add more mixed fractions
    descriptions[ 6 ].fractions.push(
      new Fraction( 8, 6 ),
      new Fraction( 9, 6 ),
      new Fraction( 10, 6 ),
      new Fraction( 8, 7 ),
      new Fraction( 9, 7 ),
      new Fraction( 10, 7 ),
      new Fraction( 11, 7 ),
      new Fraction( 12, 7 ),
      new Fraction( 13, 7 ),
      new Fraction( 9, 8 ),
      new Fraction( 10, 8 ),
      new Fraction( 11, 8 ),
      new Fraction( 12, 8 ),
      new Fraction( 13, 8 ),
      new Fraction( 14, 8 ),
      new Fraction( 15, 8 ),
      new Fraction( 10, 9 ),
      new Fraction( 11, 9 ),
      new Fraction( 12, 9 ),
      new Fraction( 13, 9 ),
      new Fraction( 14, 9 ),
      new Fraction( 15, 9 ),
      new Fraction( 16, 9 ),
      new Fraction( 17, 9 )
    );
    descriptions[ 6 ].numericScaleFactors = [ 3, 6, 7 ];

    // level 8
    // add more mixed fractions
    descriptions[ 7 ].fractions.push(
      new Fraction( 6, 5 ),
      new Fraction( 7, 5 ),
      new Fraction( 8, 5 ),
      new Fraction( 9, 5 ),
      new Fraction( 7, 6 ),
      new Fraction( 8, 6 ),
      new Fraction( 9, 6 ),
      new Fraction( 10, 6 ),
      new Fraction( 11, 6 )
    );
    descriptions[ 7 ].numericScaleFactors = [ 3, 4, 5, 6, 7, 8, 9 ];

    return descriptions;
  }
}

fractionsCommon.register( 'MatchingLevel', MatchingLevel );
export default MatchingLevel;