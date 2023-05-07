// Copyright 2019-2020, University of Colorado Boulder

/**
 * Main model for the matching game style screens
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import fractionsCommon from '../../fractionsCommon.js';
import MatchingLevel from './MatchingLevel.js';

class MatchingGameModel {
  /**
   * @param {boolean} hasMixedNumbers
   * @param {boolean} [useShortTitle]
   */
  constructor( hasMixedNumbers, useShortTitle = false ) {

    // @public {boolean}
    this.hasMixedNumbers = hasMixedNumbers;
    this.useShortTitle = useShortTitle;

    // @public {Property.<MatchingLevel|null>}
    this.levelProperty = new Property( null );

    // Let the level know it's selected
    this.levelProperty.lazyLink( level => {
      level && level.select();
    } );

    // @public {Property.<MatchingChallenge|null}
    this.challengeProperty = new DynamicProperty( this.levelProperty, {
      derive: 'challengeProperty'
    } );

    // @public {Property.<boolean>}
    this.timeVisibleProperty = new BooleanProperty( false );

    const descriptions = hasMixedNumbers ? MatchingLevel.getMixedLevelDescriptions() : MatchingLevel.getUnmixedLevelDescriptions();

    // @public {Array.<MatchingLevel>}
    this.levels = _.range( 1, 9 ).map( number => new MatchingLevel( descriptions[ number - 1 ], number, {
      timeVisibleProperty: this.timeVisibleProperty
    } ) );
  }

  /**
   * Steps the model forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    this.challengeProperty.value && this.challengeProperty.value.step( dt );
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {
    this.levelProperty.reset();
    this.timeVisibleProperty.reset();
    this.levels.forEach( level => level.reset() );
  }
}

fractionsCommon.register( 'MatchingGameModel', MatchingGameModel );
export default MatchingGameModel;