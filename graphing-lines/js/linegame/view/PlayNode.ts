// Copyright 2013-2023, University of Colorado Boulder

/**
 * Portion of the scenegraph that corresponds to the 'play' game phase. (See GamePhase.PLAY)
 * Displays the scoreboard and current challenge.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import FiniteStatusBar from '../../../../vegas/js/FiniteStatusBar.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import ScoreDisplayLabeledNumber from '../../../../vegas/js/ScoreDisplayLabeledNumber.js';
import graphingLines from '../../graphingLines.js';
import GamePhase from '../model/GamePhase.js';
import LineGameModel from '../model/LineGameModel.js';
import ChallengeNode from './ChallengeNode.js';

// constants
const STATUS_BAR_FONT = new PhetFont( 20 );
const STATUS_BAR_TEXT_FILL = 'white';

export default class PlayNode extends Node {

  public constructor( model: LineGameModel, layoutBounds: Bounds2, visibleBoundsProperty: TReadOnlyProperty<Bounds2>,
                      audioPlayer: GameAudioPlayer ) {

    super();

    const statusBar = new FiniteStatusBar( layoutBounds, visibleBoundsProperty, model.scoreProperty, {
      createScoreDisplay: scoreProperty => new ScoreDisplayLabeledNumber( scoreProperty, {
        font: STATUS_BAR_FONT,
        textFill: STATUS_BAR_TEXT_FILL
      } ),

      // FiniteStatusBar uses 1-based level numbering, model is 0-based, see #88.
      levelProperty: new DerivedProperty( [ model.levelProperty ], level => level + 1 ),
      challengeIndexProperty: model.challengeIndexProperty,
      numberOfChallengesProperty: model.challengesPerGameProperty,
      elapsedTimeProperty: model.timer.elapsedTimeProperty,
      timerEnabledProperty: model.timerEnabledProperty,
      font: STATUS_BAR_FONT,
      textFill: STATUS_BAR_TEXT_FILL,
      barFill: 'rgb( 49, 117, 202 )',
      xMargin: 40,
      startOverButtonOptions: {
        baseColor: 'rgb( 229, 243, 255 )',
        textFill: 'black',
        xMargin: 10,
        yMargin: 5,
        listener: () => {
          model.setGamePhase( GamePhase.SETTINGS );
        }
      }
    } );
    this.addChild( statusBar );

    // compute the size of the area available for the challenges
    const challengeSize = new Dimension2( layoutBounds.width, layoutBounds.height - statusBar.bottom );

    // challenge parent, to keep challenge below scoreboard
    const challengeParent = new Rectangle( 0, 0, 0, 1 );
    challengeParent.top = statusBar.bottom;
    this.addChild( challengeParent );

    // Set up a new challenge
    // unlink unnecessary because PlayNode exists for the lifetime of the sim.
    let previousChallengeNode: ChallengeNode;
    model.challengeProperty.link( challenge => {

      // dispose of view for previous challenge
      if ( previousChallengeNode ) {
        previousChallengeNode.dispose(); // handles challengeParent.removeChild
      }

      // add view for current challenge
      const challengeNode = challenge.createView( model, challengeSize, audioPlayer );
      challengeParent.addChild( challengeNode );
      previousChallengeNode = challengeNode;
    } );
  }
}

graphingLines.register( 'PlayNode', PlayNode );