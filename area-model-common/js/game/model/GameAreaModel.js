// Copyright 2017-2021, University of Colorado Boulder

/**
 * Model for the game screens
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaLevel from './AreaLevel.js';
import Entry from './Entry.js';
import EntryStatus from './EntryStatus.js';
import GameState from './GameState.js';

class GameAreaModel {
  /**
   * @param {Array.<AreaLevel>} levels
   * @param {boolean} hasExponents
   */
  constructor( levels, hasExponents ) {

    // @public {Array.<AreaLevel>}
    this.levels = levels;

    // @public {boolean}
    this.hasExponents = hasExponents;

    // @public {Property.<AreaLevel|null>} - The current level
    this.currentLevelProperty = new Property( null, {
      isValidValue: value => value === null || value instanceof AreaLevel
    } );

    // @public {Property.<Entry|null}
    this.activeEntryProperty = new Property( null, {
      isValidValue: value => value === null || value instanceof Entry
    } );

    // @public {Property.<AreaChallenge|null>}
    this.currentChallengeProperty = new DynamicProperty( this.currentLevelProperty, {
      derive: 'currentChallengeProperty'
    } );
    this.currentChallengeProperty.lazyLink( this.activeEntryProperty.reset.bind( this.activeEntryProperty ) );

    // @public {Property.<GameState|null>} - This is null when there is no current challenge (e.g. level selection)
    this.stateProperty = new DynamicProperty( this.currentChallengeProperty, {
      derive: 'stateProperty',
      bidirectional: true
    }, {
      validValues: GameState.VALUES.concat( [ null ] )
    } );

    // @public {Property.<boolean>} - Whether the check button should be enabled
    this.allowCheckingProperty = new DynamicProperty( this.currentChallengeProperty, {
      derive: 'allowCheckingProperty',
      defaultValue: false
    } );
  }

  /**
   * Selects a given level, making it the current level.
   * @public
   *
   * @param {AreaLevel} level
   */
  selectLevel( level ) {
    level.select();
    this.currentLevelProperty.value = level;
  }

  /**
   * Sets the value of the current editable property to that of the provided term.
   * @public
   *
   * @param {Term} term
   */
  setActiveTerm( term ) {
    // Appearance change for https://github.com/phetsims/area-model-common/issues/42, handles only showing the
    // "wrong" values for the variables 6-1 case (non-unique)
    this.currentChallengeProperty.value.checkNonUniqueChanges();

    this.activeEntryProperty.value.valueProperty.value = term;
    this.activeEntryProperty.value.statusProperty.value = EntryStatus.NORMAL;
    this.activeEntryProperty.value = null;
  }

  /**
   * Checks the user's input against the known answer.
   * @public
   */
  check() {
    // Close any keypads, see https://github.com/phetsims/area-model-common/issues/66
    this.activeEntryProperty.value = null;

    const challenge = this.currentChallengeProperty.value;

    this.currentLevelProperty.value.scoreProperty.value += challenge.check();
  }

  /**
   * Move to try another time.
   * @public
   */
  tryAgain() {
    if ( this.currentChallengeProperty.value ) {
      this.currentChallengeProperty.value.tryAgain();
    }
  }

  /**
   * Move to the next challenge.
   * @public
   */
  next() {
    if ( this.currentLevelProperty.value ) {
      this.currentLevelProperty.value.next();
    }
  }

  /**
   * Goes to the level selection.
   * @public
   */
  moveToLevelSelection() {
    this.currentLevelProperty.value = null; // move to no level
  }

  /**
   * Shows the answer.
   * @public
   */
  showAnswer() {
    if ( this.currentChallengeProperty.value ) {
      this.currentChallengeProperty.value.showAnswers();
      this.currentChallengeProperty.value.stateProperty.value = GameState.SHOW_SOLUTION;
      this.activeEntryProperty.reset();
    }
  }

  /**
   * Fills in the answers without moving to the "SHOW_SOLUTION" state.
   * @public
   */
  cheat() {
    if ( this.currentChallengeProperty.value ) {

      // filling in the correct answers to the entries
      this.currentChallengeProperty.value.showAnswers();

      // unselecting the edited one and closing the keypad if necessary
      this.activeEntryProperty.reset();
    }
  }

  /**
   * Returns the model to its initial state.
   * @public
   */
  reset() {
    this.activeEntryProperty.reset();
    this.currentLevelProperty.reset();
    this.levels.forEach( level => {
      level.reset();
    } );
  }
}

areaModelCommon.register( 'GameAreaModel', GameAreaModel );

export default GameAreaModel;