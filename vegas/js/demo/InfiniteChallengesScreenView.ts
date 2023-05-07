// Copyright 2014-2022, University of Colorado Boulder

/**
 * Demonstrates UI components that typically appear in a game level that has an infinite number of challenges.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { HBox, Text } from '../../../scenery/js/imports.js';
import HSlider from '../../../sun/js/HSlider.js';
import InfiniteStatusBar from '../InfiniteStatusBar.js';
import StatusBar from '../../../scenery-phet/js/StatusBar.js';
import vegas from '../vegas.js';
import Tandem from '../../../tandem/js/Tandem.js';
import RewardDialog from '../RewardDialog.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';

export default class InfiniteChallengesScreenView extends ScreenView {

  public constructor() {

    super( {
      tandem: Tandem.OPT_OUT
    } );

    const scoreProperty = new NumberProperty( 0, {
      range: new Range( 0, 1000 )
    } );

    // bar across the top
    const messageNode = new Text( 'Your message goes here', {
      font: StatusBar.DEFAULT_FONT
    } );
    const statusBar = new InfiniteStatusBar( this.layoutBounds, this.visibleBoundsProperty, messageNode, scoreProperty, {
      backButtonListener: () => console.log( 'back' ),
      tandem: Tandem.OPT_OUT
    } );

    // slider for testing score changes
    const scoreSlider = new HBox( {
      right: this.layoutBounds.right - 20,
      top: statusBar.bottom + 30,
      children: [
        new Text( 'Score: ', { font: new PhetFont( 20 ) } ),
        new HSlider( scoreProperty, scoreProperty.range )
      ]
    } );

    const openButton = new RectangularPushButton( {
      content: new Text( 'open RewardDialog', { font: new PhetFont( 20 ) } ),
      listener: function() {
        const rewardDialog = new RewardDialog( 10, {
          keepGoingButtonListener: () => {
            console.log( 'Keep Going button' );
            rewardDialog.dispose();
          },
          newLevelButtonListener: () => {
            console.log( 'New Level button' );
            rewardDialog.dispose();
          }
        } );
        rewardDialog.show();
      },
      center: this.layoutBounds.center
    } );

    this.children = [
      statusBar,
      scoreSlider,
      openButton
    ];
  }
}

vegas.register( 'InfiniteChallengesScreenView', InfiniteChallengesScreenView );