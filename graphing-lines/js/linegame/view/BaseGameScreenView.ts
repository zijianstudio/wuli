// Copyright 2013-2023, University of Colorado Boulder

/**
 * The base type for the 'Line Game' view.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import GLConstants from '../../common/GLConstants.js';
import graphingLines from '../../graphingLines.js';
import BaseGameModel from '../model/BaseGameModel.js';
import GamePhase from '../model/GamePhase.js';
import PlayNode from './PlayNode.js';
import ResultsNode, { RewardNodeFunction } from './ResultsNode.js';
import SettingsNode, { SettingsNodeOptions } from './SettingsNode.js';

type SelfOptions = {
  settingsNodeOptions?: StrictOmit<SettingsNodeOptions, 'tandem'>; // propagated to SettingsNode
};

type BaseGameScreenViewOptions = SelfOptions;

export default class BaseGameScreenView extends ScreenView {

  // a node for each 'phase' of the game
  private readonly settingsNode: SettingsNode;
  private readonly playNode: PlayNode;
  private readonly resultsNode: ResultsNode;

  /**
   * @param model
   * @param levelImages - grid of images for the level-selection buttons, ordered by level
   * @param rewardNodeFunctions - functions that create nodes for the game reward, ordered by level
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( model: BaseGameModel,
                      levelImages: HTMLImageElement[],
                      rewardNodeFunctions: RewardNodeFunction[],
                      tandem: Tandem,
                      providedOptions?: BaseGameScreenViewOptions ) {

    const options = optionize<BaseGameScreenViewOptions, SelfOptions, ScreenViewOptions>()( {

      // SelfOptions
      settingsNodeOptions: {},

      // ScreenViewOptions
      layoutBounds: GLConstants.SCREEN_VIEW_LAYOUT_BOUNDS,
      tandem: tandem
    }, providedOptions );

    super( options );

    // sounds
    const audioPlayer = new GameAudioPlayer();

    this.settingsNode = new SettingsNode( model, this.layoutBounds, levelImages, combineOptions<SettingsNodeOptions>( {
      tandem: tandem.createTandem( 'settingsNode' )
    }, options.settingsNodeOptions ) );
    this.playNode = new PlayNode( model, this.layoutBounds, this.visibleBoundsProperty, audioPlayer );
    this.resultsNode = new ResultsNode( model, this.layoutBounds, audioPlayer, rewardNodeFunctions );

    // rendering order
    this.addChild( this.resultsNode );
    this.addChild( this.playNode );
    this.addChild( this.settingsNode );

    // game 'phase' changes
    // unlink unnecessary because BaseGameScreenView exists for the lifetime of the sim.
    model.gamePhaseProperty.link( gamePhase => {
      this.settingsNode.visible = ( gamePhase === GamePhase.SETTINGS );
      this.playNode.visible = ( gamePhase === GamePhase.PLAY );
      this.resultsNode.visible = ( gamePhase === GamePhase.RESULTS );
    } );
  }

  public override step( dt: number ): void {
    if ( this.resultsNode.visible ) {
      this.resultsNode.step( dt );
    }
    super.step( dt );
  }
}

graphingLines.register( 'BaseGameScreenView', BaseGameScreenView );