// Copyright 2018-2022, University of Colorado Boulder

/**
 * InfiniteStatusBar is the status bar for games that have an infinite (open-ended) number of challenges per level.
 * See specification in https://github.com/phetsims/vegas/issues/59.
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */

import TProperty from '../../axon/js/TProperty.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import optionize from '../../phet-core/js/optionize.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import BackButton from '../../scenery-phet/js/buttons/BackButton.js';
import StatusBar, { StatusBarOptions } from '../../scenery-phet/js/StatusBar.js';
import { HBox, Node } from '../../scenery/js/imports.js';
import { PushButtonListener } from '../../sun/js/buttons/PushButtonModel.js';
import Tandem from '../../tandem/js/Tandem.js';
import ScoreDisplayNumberAndStar from './ScoreDisplayNumberAndStar.js';
import vegas from './vegas.js';

type SelfOptions = {
  backButtonListener?: PushButtonListener;
  xMargin?: number;
  yMargin?: number;
  spacing?: number;

  // score display
  createScoreDisplay?: ( scoreProperty: TProperty<number> ) => Node;
};

export type InfiniteStatusBarOptions = SelfOptions & StrictOmit<StatusBarOptions, 'children' | 'barHeight'>;

export default class InfiniteStatusBar extends StatusBar {

  private readonly disposeInfiniteStatusBar: () => void;

  /**
   * @param layoutBounds - layoutBounds of the ScreenView
   * @param visibleBoundsProperty - visible bounds of the ScreenView
   * @param messageNode - to the right of the back button, typically Text
   * @param scoreProperty
   * @param providedOptions
   */
  public constructor( layoutBounds: Bounds2, visibleBoundsProperty: TReadOnlyProperty<Bounds2>, messageNode: Node,
                      scoreProperty: TProperty<number>, providedOptions?: InfiniteStatusBarOptions ) {

    const options = optionize<InfiniteStatusBarOptions, SelfOptions, StatusBarOptions>()( {

      // SelfOptions
      backButtonListener: _.noop,
      xMargin: 20,
      yMargin: 10,
      spacing: 10,
      createScoreDisplay: scoreProperty => new ScoreDisplayNumberAndStar( scoreProperty ),

      // StatusBarOptions
      tandem: Tandem.OPTIONAL
    }, providedOptions );

    // button that typically takes us back to the level-selection UI
    const backButton = new BackButton( {
      listener: options.backButtonListener,
      xMargin: 8,
      yMargin: 10,
      tandem: options.tandem.createTandem( 'backButton' )
    } );

    // Nodes on the left end of the bar
    const leftNodes = new HBox( {
      spacing: options.spacing,
      align: 'center',
      children: [ backButton, messageNode ],
      maxWidth: 0.7 * layoutBounds.width
    } );

    // Create the score display.
    const scoreDisplay = options.createScoreDisplay( scoreProperty );
    scoreDisplay.maxWidth = 0.2 * layoutBounds.width;

    options.children = [ leftNodes, scoreDisplay ];

    options.barHeight = Math.max( leftNodes.height, scoreDisplay.height ) + ( 2 * options.yMargin );

    super( layoutBounds, visibleBoundsProperty, options );

    // Position components on the bar.
    this.positioningBoundsProperty.link( positioningBounds => {
      leftNodes.left = positioningBounds.left;
      leftNodes.centerY = positioningBounds.centerY;
      scoreDisplay.right = positioningBounds.right;
      scoreDisplay.centerY = positioningBounds.centerY;
    } );

    // Keep the score right justified.
    scoreDisplay.localBoundsProperty.link( () => {
      scoreDisplay.right = this.positioningBoundsProperty.value.right;
    } );

    this.disposeInfiniteStatusBar = () => {
      scoreDisplay.dispose();
    };
  }

  public override dispose(): void {
    this.disposeInfiniteStatusBar();
    super.dispose();
  }
}

vegas.register( 'InfiniteStatusBar', InfiniteStatusBar );