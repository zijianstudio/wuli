// Copyright 2013-2023, University of Colorado Boulder

/**
 * View for 'Place the Points' challenges.
 * This is a specialization of the 'Graph the Line' view.
 * User manipulates 3 arbitrary points, equations are displayed on the left.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import graphingLines from '../../graphingLines.js';
import PlayState from '../model/PlayState.js';
import GraphTheLineNode from './GraphTheLineNode.js';
import GraphThreePointsNode from './GraphThreePointsNode.js';
import LineGameModel from '../model/LineGameModel.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import ChallengeGraphNode from './ChallengeGraphNode.js';
import PlaceThePoints from '../model/PlaceThePoints.js';

export default class PlaceThePointsNode extends GraphTheLineNode {

  private readonly disposePlaceThePointsNode: () => void;

  public constructor( challenge: PlaceThePoints, model: LineGameModel, challengeSize: Dimension2, audioPlayer: GameAudioPlayer ) {

    super( challenge, model, challengeSize, audioPlayer );

    const playStateObserver = ( playState: PlayState ) => {

      // No-op if dispose has been called, see https://github.com/phetsims/graphing-lines/issues/133
      if ( !this.isDisposed ) {

        // show user's line only in states where there guess is wrong.
        this.graphNode.setGuessLineVisible(
          !challenge.isCorrect() && ( playState === PlayState.TRY_AGAIN || playState === PlayState.NEXT ) );

        /*
         * Plot (x1,y1) for answer when user got the challenge wrong.
         * Do not plot (x1,y1) for guess because none of the 3 points corresponds to (x1,y1).
         */
        this.graphNode.setAnswerPointVisible( playState === PlayState.NEXT && !challenge.isCorrect() );
        this.graphNode.setGuessPointVisible( false );
      }
    };
    model.playStateProperty.link( playStateObserver ); // unlink in dispose

    this.disposePlaceThePointsNode = () => {
      model.playStateProperty.unlink( playStateObserver );
    };
  }

  public override dispose(): void {
    this.disposePlaceThePointsNode();
    super.dispose();
  }

  /**
   * Creates the graph portion of the view.
   */
  public override createGraphNode( challenge: PlaceThePoints ): ChallengeGraphNode {
    return new GraphThreePointsNode( challenge );
  }
}

graphingLines.register( 'PlaceThePointsNode', PlaceThePointsNode );