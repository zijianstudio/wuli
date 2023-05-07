// Copyright 2016-2021, University of Colorado Boulder

/**
 * Represents a game level. Contains information and the ability to generate challenges for the particular level.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import { Image } from '../../../../../scenery/js/imports.js';
import makeATen from '../../../makeATen.js';

class Level {
  /**
   * @param {number} number - The number of the level, from 1 to 10
   * @param {string} color - The color for the level
   * @param {HTMLImageElement} icon - Image to be shown as the icon for the level
   * @param {string} description - Translated description to be shown in info and the status bar
   * @param {NumberChallengeFactory} numberChallengeFactory - For generating challenges
   */
  constructor( number, color, icon, description, numberChallengeFactory ) {

    // @public {number} - The level number, from 1 to 10
    this.number = number;

    // @public {number} - The color of the level, used for backgrounds mostly
    this.color = color;

    // @public {Node} - A properly sized node for use as an icon representing the level
    this.iconNode = new Image( icon );

    // @public {string} - Translated description to be shown in info and the status bar
    this.description = description;

    // @public {Property.<number>} - The total score for this level
    this.scoreProperty = new NumberProperty( 0 );

    // @private {NumberChallengeFactory}
    this.numberChallengeFactory = numberChallengeFactory;
  }

  /**
   * Resets all of our mutable state to the initial values.
   * @public
   */
  reset() {
    this.scoreProperty.reset();
  }

  /**
   * Creates a NumberChallenge that should be used as the next challenge for this level.
   * @public
   *
   * @returns {NumberChallenge}
   */
  generateChallenge() {
    return this.numberChallengeFactory.generateChallenge( this.number - 1 );
  }
}

makeATen.register( 'Level', Level );

export default Level;