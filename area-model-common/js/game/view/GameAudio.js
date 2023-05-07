// Copyright 2017-2021, University of Colorado Boulder

/**
 * Handles playing audio for the game.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import GameState from '../model/GameState.js';

class GameAudio {
  /**
   * @param {GameAreaModel} model
   */
  constructor( model ) {
    const audioPlayer = new GameAudioPlayer();

    model.stateProperty.link( ( state, oldState ) => {
      // If we just moved to/from level section (outside of a level), don't fire sounds.
      if ( state === null || oldState === null ) { return; }

      if ( state === GameState.CORRECT_ANSWER ) {
        audioPlayer.correctAnswer();
      }
      if ( state === GameState.WRONG_FIRST_ANSWER || state === GameState.WRONG_SECOND_ANSWER ) {
        audioPlayer.wrongAnswer();
      }
      if ( state === GameState.LEVEL_COMPLETE ) {
        const score = model.currentLevelProperty.value.scoreProperty.value;
        if ( score === AreaModelCommonConstants.PERFECT_SCORE ) {
          audioPlayer.gameOverPerfectScore();
        }
        else if ( score === 0 ) {
          audioPlayer.gameOverZeroScore();
        }
        else {
          audioPlayer.gameOverImperfectScore();
        }
      }
    } );
  }
}

areaModelCommon.register( 'GameAudio', GameAudio );

export default GameAudio;