// Copyright 2013-2023, University of Colorado Boulder

/**
 * Portion of the scenegraph that corresponds to the 'results' game phase. (See GamePhase.RESULTS)
 * Displays a panel with the game results.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Node } from '../../../../scenery/js/imports.js';
import LevelCompletedNode from '../../../../vegas/js/LevelCompletedNode.js';
import GLQueryParameters from '../../common/GLQueryParameters.js';
import graphingLines from '../../graphingLines.js';
import GamePhase from '../model/GamePhase.js';
import GLRewardNode from './GLRewardNode.js';
import LineGameModel from '../model/LineGameModel.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';

// Function that creates the Nodes that are passed to RewardNode.
export type RewardNodeFunction = () => Node[];

export default class ResultsNode extends Node {

  private rewardNode: GLRewardNode | null; // created on demand

  public constructor( model: LineGameModel, layoutBounds: Bounds2, audioPlayer: GameAudioPlayer, rewardNodeFunctions: RewardNodeFunction[] ) {

    super();

    this.rewardNode = null;

    // show results when we enter this phase
    // unlink unnecessary because ResultsNode exists for the lifetime of the sim.
    model.gamePhaseProperty.link( gamePhase => {
      if ( gamePhase === GamePhase.RESULTS ) {

        // game reward, shown for perfect score (or with 'reward' query parameter)
        if ( model.isPerfectScore() || GLQueryParameters.showReward ) {

          audioPlayer.gameOverPerfectScore();

          const level = model.levelProperty.value;
          const rewardNodes = rewardNodeFunctions[ level ]();
          this.rewardNode = new GLRewardNode( rewardNodes );
          this.addChild( this.rewardNode );
        }
        else {
          audioPlayer.gameOverImperfectScore();
        }

        // game results
        this.addChild( new LevelCompletedNode(
          model.levelProperty.value + 1,
          model.scoreProperty.value,
          model.getPerfectScore(),
          model.getPerfectScore() / model.maxPointsPerChallenge, // number of stars in the progress indicator
          model.timerEnabledProperty.value,
          model.timer.elapsedTimeProperty.value,
          model.bestTimeProperties[ model.levelProperty.value ].value,
          model.isNewBestTime,
          () => model.setGamePhase( GamePhase.SETTINGS ),
          {
            starDiameter: 45,
            centerX: layoutBounds.centerX,
            centerY: layoutBounds.centerY
          } ) );
      }
      else {
        this.removeAllChildren();
        if ( this.rewardNode !== null ) {
          this.rewardNode.dispose();
        }
        this.rewardNode = null;
      }
    } );
  }

  public step( dt: number ): void {
    if ( this.rewardNode ) {
      this.rewardNode.step( dt );
    }
  }
}

graphingLines.register( 'ResultsNode', ResultsNode );