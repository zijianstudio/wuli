// Copyright 2014-2023, University of Colorado Boulder

/**
 * SettingsNode is responsible for the view that corresponds to GamePhase.PLAY.
 * It displays the status bar and current challenge.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import FiniteStatusBar from '../../../../vegas/js/FiniteStatusBar.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import ScoreDisplayLabeledNumber from '../../../../vegas/js/ScoreDisplayLabeledNumber.js';
import DevGameControls from '../../dev/DevGameControls.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import GameModel from '../model/GameModel.js';
import GamePhase from '../model/GamePhase.js';
import ChallengeNode from './ChallengeNode.js';
import GamePhaseNode from './GamePhaseNode.js';

const STATUS_BAR_FONT = new PhetFont( 16 );
const STATUS_BAR_TEXT_FILL = 'white';

export default class PlayNode extends GamePhaseNode {

  private readonly model: GameModel;
  private readonly layoutBounds: Bounds2;
  private readonly audioPlayer: GameAudioPlayer;
  private readonly challengeBounds: Bounds2; // challenge will be displayed in the area below the status bar

  public constructor( model: GameModel, layoutBounds: Bounds2, visibleBoundsProperty: TReadOnlyProperty<Bounds2>,
                      audioPlayer: GameAudioPlayer, tandem: Tandem ) {

    super( GamePhase.PLAY, model.gamePhaseProperty, {
      tandem: tandem
    } );

    this.model = model;
    this.layoutBounds = layoutBounds;
    this.audioPlayer = audioPlayer;

    // status bar, across the top of the screen
    const statusBar = new FiniteStatusBar( layoutBounds, visibleBoundsProperty, model.scoreProperty, {
      createScoreDisplay: scoreProperty => new ScoreDisplayLabeledNumber( scoreProperty, {
        font: STATUS_BAR_FONT,
        textFill: STATUS_BAR_TEXT_FILL
      } ),

      // FiniteStatusBar uses 1-based level numbering, model is 0-based, see #57.
      levelProperty: new DerivedProperty( [ model.levelProperty ], level => level + 1 ),
      challengeIndexProperty: model.challengeIndexProperty,
      numberOfChallengesProperty: model.numberOfChallengesProperty,
      elapsedTimeProperty: model.timer.elapsedTimeProperty,
      timerEnabledProperty: model.timerEnabledProperty,
      font: STATUS_BAR_FONT,
      textFill: STATUS_BAR_TEXT_FILL,
      barFill: 'rgb( 49, 117, 202 )',
      xMargin: 50,
      startOverButtonOptions: {
        baseColor: 'rgb( 229, 243, 255 )',
        textFill: 'black',
        xMargin: 10,
        yMargin: 5,
        listener: () => model.settings()
      },
      tandem: tandem.createTandem( 'statusBar' )
    } );
    this.addChild( statusBar );

    // Developer controls at top-right, below status bar
    if ( phet.chipper.queryParameters.showAnswers ) {
      this.addChild( new DevGameControls( model, {
        right: layoutBounds.right - 5,
        top: statusBar.bottom + 5
      } ) );
    }

    this.challengeBounds = new Bounds2( layoutBounds.left, statusBar.bottom, layoutBounds.right, layoutBounds.bottom );

    let currentChallengeNode: ChallengeNode | null = null;

    /*
     * Displays the current challenge.
     * Unlink is unnecessary because this node exists for the lifetime of the simulation.
     */
    model.challengeProperty.link( challenge => {

      // schedule previous challenge for deletion
      if ( currentChallengeNode ) {
        currentChallengeNode.dispose(); // handles removeChild
        currentChallengeNode = null;
      }

      // activate current challenge
      if ( challenge ) { // challenge will be null on startup and 'Reset All'
        currentChallengeNode = new ChallengeNode( model, challenge, this.challengeBounds, audioPlayer );
        this.addChild( currentChallengeNode );
      }
    } );

    /*
     * When we transition away from 'play' phase, dispose of the current challengeNode.
     */
    model.gamePhaseProperty.link( gamePhase => {
      if ( gamePhase !== GamePhase.PLAY && currentChallengeNode ) {
        currentChallengeNode.dispose();
        currentChallengeNode = null;
      }
    } );
  }
}

reactantsProductsAndLeftovers.register( 'PlayNode', PlayNode );