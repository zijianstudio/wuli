// Copyright 2014-2023, University of Colorado Boulder

/**
 * SettingsNode is responsible for the view that corresponds to GamePhase.RESULTS.
 * It displays the game results (score, optional time,...) and a reward (if the user got a perfect score).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import LevelCompletedNode from '../../../../vegas/js/LevelCompletedNode.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import GameModel from '../model/GameModel.js';
import GamePhase from '../model/GamePhase.js';
import RPALRewardNode from './RPALRewardNode.js';
import RPALQueryParameters from '../../common/RPALQueryParameters.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GamePhaseNode from './GamePhaseNode.js';

export default class ResultsNode extends GamePhaseNode {

  private rewardNode: RPALRewardNode | null; // created dynamically to match the level

  public constructor( model: GameModel, layoutBounds: Bounds2, audioPlayer: GameAudioPlayer, tandem: Tandem ) {

    super( GamePhase.RESULTS, model.gamePhaseProperty, {
      tandem: tandem
    } );

    this.rewardNode = null;

    // Created dynamically to match the level
    let levelCompletedNode: LevelCompletedNode | null = null;

    /*
     * Displays the game results, possibly with a 'reward'.
     * Unlink is unnecessary because this node exists for the lifetime of the simulation.
     */
    model.gamePhaseProperty.link( gamePhase => {

      // show results when we enter this phase
      if ( gamePhase === GamePhase.RESULTS ) {

        // Show the reward if the score is perfect, and play the appropriate audio feedback.
        if ( model.isPerfectScore() || RPALQueryParameters.showReward ) {
          this.rewardNode = new RPALRewardNode( model.levelProperty.value );
          this.addChild( this.rewardNode );
          audioPlayer.gameOverPerfectScore();
        }
        else {
          audioPlayer.gameOverImperfectScore();
        }

        // Pseudo-dialog that shows results.
        const level = model.levelProperty.value;
        levelCompletedNode = new LevelCompletedNode(
          level + 1,
          model.scoreProperty.value,
          model.getPerfectScore( level ),
          model.numberOfChallengesProperty.value, // number of stars in the progress indicator
          model.timerEnabledProperty.value,
          model.timer.elapsedTimeProperty.value,
          model.bestTimeProperties[ level ].value,
          model.isNewBestTime,
          () => model.settings(),
          {
            starDiameter: 45,
            centerX: layoutBounds.centerX,
            centerY: layoutBounds.centerY
          } );
        this.addChild( levelCompletedNode );
      }
      else {
        if ( this.rewardNode ) {
          this.rewardNode.dispose();
          this.rewardNode = null;
        }
        if ( levelCompletedNode ) {
          levelCompletedNode.dispose();
          levelCompletedNode = null;
        }
      }
    } );
  }

  /**
   * Animates the game reward.
   * @param dt - time between step calls, in seconds
   */
  public step( dt: number ): void {
    if ( this.rewardNode ) {
      this.rewardNode.step( dt );
    }
  }
}

reactantsProductsAndLeftovers.register( 'ResultsNode', ResultsNode );