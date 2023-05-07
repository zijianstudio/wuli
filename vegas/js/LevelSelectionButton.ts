// Copyright 2014-2023, University of Colorado Boulder

/**
 * Button for selecting a game level.
 * Includes an icon, score display, and (optional) 'best time' display.
 * See specification in https://github.com/phetsims/vegas/issues/59.
 * Originally named LevelSelectionItemNode, renamed to LevelSelectionButton on 4/10/2018.
 *
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Andrea Lin
 */

import TProperty from '../../axon/js/TProperty.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import optionize from '../../phet-core/js/optionize.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { Font, TColor, Node, Rectangle, Text } from '../../scenery/js/imports.js';
import RectangularPushButton, { RectangularPushButtonOptions } from '../../sun/js/buttons/RectangularPushButton.js';
import SoundClip from '../../tambo/js/sound-generators/SoundClip.js';
import soundConstants from '../../tambo/js/soundConstants.js';
import soundManager from '../../tambo/js/soundManager.js';
import Tandem from '../../tandem/js/Tandem.js';
import levelSelectionButton_mp3 from '../sounds/levelSelectionButton_mp3.js';
import GameTimer from './GameTimer.js';
import ScoreDisplayStars from './ScoreDisplayStars.js';
import vegas from './vegas.js';

// constants
const DEFAULT_BEST_TIME_FONT = new PhetFont( 24 );
const SCALING_TOLERANCE = 1E-4; // Empirically chosen as something the human eye is unlikely to notice.

type SelfOptions = {

  // Used to size the content
  buttonWidth?: number;
  buttonHeight?: number;

  // score display
  createScoreDisplay?: ( scoreProperty: TProperty<number> ) => Node;
  scoreDisplayProportion?: number; // percentage of the button height occupied by scoreDisplay, (0,0.5]
  scoreDisplayMinXMargin?: number; // horizontal margin between scoreDisplay and its background
  scoreDisplayMinYMargin?: number;  // vertical margin between scoreDisplay and its background
  iconToScoreDisplayYSpace?: number; // vertical space between icon and score display

  // best time (optional)
  bestTimeProperty?: TProperty<number | null> | null; // best time in seconds, null if no best time
  bestTimeVisibleProperty?: TProperty<boolean> | null; // controls visibility of best time, null if no best time
  bestTimeFill?: TColor;
  bestTimeFont?: Font;
  bestTimeYSpacing?: number;  // vertical space between drop shadow and best time

  // Configures the soundPlayer for a specific game level. Note that this assumes zero-based indexing for game level,
  // which is often not the case. This option is ignored if RectangularPushButtonOptions.soundPlayer is provided.
  soundPlayerIndex?: number;
};

export type LevelSelectionButtonOptions = SelfOptions & StrictOmit<RectangularPushButtonOptions, 'content'>;

export default class LevelSelectionButton extends RectangularPushButton {

  private readonly disposeLevelSelectionButton: () => void;

  /**
   * @param icon - appears on the button above the score display, scaled to fit
   * @param scoreProperty
   * @param providedOptions
   */
  public constructor( icon: Node, scoreProperty: TProperty<number>, providedOptions?: LevelSelectionButtonOptions ) {

    const options = optionize<LevelSelectionButtonOptions, SelfOptions, RectangularPushButtonOptions>()( {

      // SelfOptions
      buttonWidth: 150,
      buttonHeight: 150,
      createScoreDisplay: () => new ScoreDisplayStars( scoreProperty ),
      scoreDisplayProportion: 0.2,
      scoreDisplayMinXMargin: 10,
      scoreDisplayMinYMargin: 5,
      iconToScoreDisplayYSpace: 10,
      bestTimeProperty: null,
      bestTimeVisibleProperty: null,
      bestTimeFill: 'black',
      bestTimeFont: DEFAULT_BEST_TIME_FONT,
      bestTimeYSpacing: 10,

      // RectangularPushButton options
      cornerRadius: 10,
      baseColor: 'rgb( 242, 255, 204 )',
      xMargin: 10,
      yMargin: 10,
      soundPlayerIndex: 0,

      // phet-io
      tandem: Tandem.REQUIRED
    }, providedOptions );

    assert && assert( options.soundPlayerIndex >= 0, `invalid soundPlayerIndex: ${options.soundPlayerIndex}` );

    const maxContentWidth = options.buttonWidth - 2 * options.xMargin;

    const scoreDisplay = options.createScoreDisplay( scoreProperty );

    // Background behind scoreDisplay
    const scoreDisplayBackgroundHeight = options.buttonHeight * options.scoreDisplayProportion;
    const scoreDisplayBackground = new Rectangle( 0, 0, maxContentWidth, scoreDisplayBackgroundHeight, {
      cornerRadius: options.cornerRadius,
      fill: 'white',
      stroke: 'black',
      pickable: false
    } );

    // constrain scoreDisplay to fit in scoreDisplayBackground
    scoreDisplay.maxWidth = scoreDisplayBackground.width - ( 2 * options.scoreDisplayMinXMargin );
    scoreDisplay.maxHeight = scoreDisplayBackground.height - ( 2 * options.scoreDisplayMinYMargin );

    // Icon, scaled and padded to fit and to make the button size correct.
    const iconHeight = options.buttonHeight - scoreDisplayBackground.height - 2 * options.yMargin - options.iconToScoreDisplayYSpace;
    const iconSize = new Dimension2( maxContentWidth, iconHeight );
    const adjustedIcon = LevelSelectionButton.createSizedImageNode( icon, iconSize );
    adjustedIcon.centerX = scoreDisplayBackground.centerX;
    adjustedIcon.bottom = scoreDisplayBackground.top - options.iconToScoreDisplayYSpace;

    // Keep scoreDisplay centered in its background when its bounds change
    const scoreDisplayUpdateLayout = () => {
      scoreDisplay.center = scoreDisplayBackground.center;
    };
    scoreDisplay.boundsProperty.lazyLink( scoreDisplayUpdateLayout );
    scoreDisplayUpdateLayout();

    options.content = new Node( {
      children: [ adjustedIcon, scoreDisplayBackground, scoreDisplay ]
    } );

    // If no sound player was provided, create the default.
    if ( options.soundPlayer === undefined ) {
      const soundClip = new SoundClip( levelSelectionButton_mp3, {
        initialOutputLevel: 0.5,
        rateChangesAffectPlayingSounds: false
      } );
      soundManager.addSoundGenerator( soundClip, { categoryName: 'user-interface' } );
      options.soundPlayer = {
        play() {
          soundClip.setPlaybackRate( Math.pow( soundConstants.TWELFTH_ROOT_OF_TWO, options.soundPlayerIndex ), 0 );
          soundClip.play();
        },
        stop() {
          soundClip.stop();
        }
      };
    }

    super( options );

    // Variables that are set if options.bestTimeProperty is specified.
    let bestTimeListener: ( ( bestTime: number | null ) => void ) | null = null;
    let bestTimeVisibleListener: ( ( visible: boolean ) => void ) | null = null;

    // Best time decoration (optional), centered below the button, does not move when button is pressed
    if ( options.bestTimeProperty ) {

      const bestTimeNode = new Text( '', {
        font: options.bestTimeFont,
        fill: options.bestTimeFill,
        maxWidth: this.width // constrain to width of the push button
      } );
      const centerX = this.centerX;
      bestTimeNode.top = this.bottom + options.bestTimeYSpacing;
      this.addChild( bestTimeNode );

      bestTimeListener = ( bestTime: number | null ) => {
        if ( bestTime !== null ) {
          bestTimeNode.string = ( bestTime ? GameTimer.formatTime( bestTime ) : '' );
          bestTimeNode.centerX = centerX;
        }
      };
      options.bestTimeProperty.link( bestTimeListener );

      if ( options.bestTimeVisibleProperty ) {
        bestTimeVisibleListener = ( visible: boolean ) => {
          bestTimeNode.visible = visible;
        };
        options.bestTimeVisibleProperty.link( bestTimeVisibleListener );
      }
    }

    this.disposeLevelSelectionButton = () => {

      scoreDisplay.dispose();

      if ( options.bestTimeProperty && bestTimeListener && options.bestTimeProperty.hasListener( bestTimeListener ) ) {
        options.bestTimeProperty.unlink( bestTimeListener );
      }

      if ( options.bestTimeVisibleProperty && bestTimeVisibleListener && options.bestTimeVisibleProperty.hasListener( bestTimeVisibleListener ) ) {
        options.bestTimeVisibleProperty.unlink( bestTimeVisibleListener );
      }
    };
  }

  /**
   * Creates a new icon with the same dimensions as the specified icon. The new icon will be scaled to fit,
   * and a background with the specified size may be added to ensure that the bounds of the returned node are correct.
   */
  public static createSizedImageNode( icon: Node, size: Dimension2 ): Node {
    icon.scale( Math.min( size.width / icon.bounds.width, size.height / icon.bounds.height ) );
    if ( Math.abs( icon.bounds.width - size.width ) < SCALING_TOLERANCE &&
         Math.abs( icon.bounds.height - size.height ) < SCALING_TOLERANCE ) {

      // The aspect ratio of the icon matched that of the specified size, so no padding is necessary.
      return icon;
    }

    // else padding is needed in either the horizontal or vertical direction.
    const background = Rectangle.dimension( size );
    icon.center = background.center;
    background.addChild( icon );
    return background;
  }

  public override dispose(): void {
    this.disposeLevelSelectionButton();
    super.dispose();
  }
}

vegas.register( 'LevelSelectionButton', LevelSelectionButton );