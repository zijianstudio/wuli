// Copyright 2014-2023, University of Colorado Boulder

/**
 * View for the 'Game' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import RPALConstants from '../../common/RPALConstants.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import GameModel from '../model/GameModel.js';
import PlayNode from './PlayNode.js';
import ResultsNode from './ResultsNode.js';
import SettingsNode from './SettingsNode.js';

export default class GameScreenView extends ScreenView {

  private readonly resultsNode: ResultsNode;

  public constructor( model: GameModel, tandem: Tandem ) {

    super( {
      layoutBounds: RPALConstants.SCREEN_VIEW_LAYOUT_BOUNDS,
      tandem: tandem
    } );

    // sounds
    const audioPlayer = new GameAudioPlayer();

    const settingsNode = new SettingsNode( model, this.layoutBounds, tandem.createTandem( 'settingsNode' ) );
    this.addChild( settingsNode );

    const playNode = new PlayNode( model, this.layoutBounds, this.visibleBoundsProperty, audioPlayer, tandem.createTandem( 'playNode' ) );
    this.addChild( playNode );

    this.resultsNode = new ResultsNode( model, this.layoutBounds, audioPlayer, tandem.createTandem( 'resultsNode' ) );
    this.addChild( this.resultsNode );
  }

  /**
   * Animation step function.
   * @param dt - time between step calls, in seconds
   */
  public override step( dt: number ): void {

    // animate the reward
    if ( this.resultsNode && this.resultsNode.visible ) {
      this.resultsNode.step( dt );
    }

    super.step( dt );
  }
}

reactantsProductsAndLeftovers.register( 'GameScreenView', GameScreenView );