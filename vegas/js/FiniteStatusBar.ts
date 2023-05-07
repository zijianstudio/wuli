// Copyright 2013-2023, University of Colorado Boulder

/**
 * FiniteStatusBar is the status bar for games that have a finite number of challenges per level.
 * This was adapted from and replaces ScoreboardBar. See https://github.com/phetsims/vegas/issues/66.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import TProperty from '../../axon/js/TProperty.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetColorScheme from '../../scenery-phet/js/PhetColorScheme.js';
import StatusBar, { StatusBarOptions } from '../../scenery-phet/js/StatusBar.js';
import { Font, HBox, Node, Rectangle, TColor, Text, TextOptions } from '../../scenery/js/imports.js';
import TextPushButton, { TextPushButtonOptions } from '../../sun/js/buttons/TextPushButton.js';
import Tandem from '../../tandem/js/Tandem.js';
import ElapsedTimeNode from './ElapsedTimeNode.js';
import ScoreDisplayLabeledNumber from './ScoreDisplayLabeledNumber.js';
import vegas from './vegas.js';
import VegasStrings from './VegasStrings.js';

type SelfOptions = {

  // optional Properties
  challengeIndexProperty?: TReadOnlyProperty<number> | null;
  numberOfChallengesProperty?: TReadOnlyProperty<number> | null;
  levelProperty?: TReadOnlyProperty<number> | null;
  elapsedTimeProperty?: TReadOnlyProperty<number> | null;
  timerEnabledProperty?: TReadOnlyProperty<boolean> | null;

  // things that can be hidden
  levelVisible?: boolean;
  challengeNumberVisible?: boolean;

  // all text
  font?: Font;
  textFill?: TColor;

  // score display
  createScoreDisplay?: ( scoreProperty: TProperty<number> ) => Node;

  // nested options for 'Start Over' button, filled in below
  startOverButtonOptions?: TextPushButtonOptions;
  startOverButtonText?: string | TReadOnlyProperty<string>;

  // options for the timer node
  clockIconRadius?: number;

  // spacing and margin for things in the bar
  xSpacing?: number;
  xMargin?: number;
  yMargin?: number;

  levelTextOptions?: TextOptions; // passed to the "Level N" text
  challengeTextOptions?: TextOptions; // passed to the "Challenge N of M" text

  barFill?: TColor;
  barStroke?: TColor;
};

export type FiniteStatusBarOptions = SelfOptions & StrictOmit<StatusBarOptions, 'children' | 'barHeight'>;

export default class FiniteStatusBar extends StatusBar {

  private readonly disposeFiniteStatusBar: () => void;

  /**
   * @param layoutBounds - layoutBounds of the ScreenView
   * @param visibleBoundsProperty - visible bounds of the ScreenView
   * @param scoreProperty
   * @param providedOptions
   */
  public constructor( layoutBounds: Bounds2, visibleBoundsProperty: TReadOnlyProperty<Bounds2>, scoreProperty: TProperty<number>,
                      providedOptions?: FiniteStatusBarOptions ) {

    const options = optionize<FiniteStatusBarOptions,
      StrictOmit<SelfOptions, 'startOverButtonOptions' | 'levelTextOptions' | 'challengeTextOptions'>,
      StatusBarOptions>()( {

      // SelfOptions
      challengeIndexProperty: null,
      numberOfChallengesProperty: null,
      levelProperty: null,
      elapsedTimeProperty: null,
      timerEnabledProperty: null,
      levelVisible: true,
      challengeNumberVisible: true,
      font: StatusBar.DEFAULT_FONT,
      textFill: StatusBar.DEFAULT_TEXT_FILL,
      createScoreDisplay: scoreProperty => new ScoreDisplayLabeledNumber( scoreProperty, {
        font: providedOptions && providedOptions.font ? providedOptions.font : StatusBar.DEFAULT_FONT,
        textFill: providedOptions && providedOptions.textFill ? providedOptions.textFill : StatusBar.DEFAULT_TEXT_FILL
      } ),
      startOverButtonText: VegasStrings.startOverStringProperty,
      clockIconRadius: 15,
      xSpacing: 50,
      xMargin: 20,
      yMargin: 10,
      barFill: null,
      barStroke: null,

      // StatusBarOptions
      tandem: Tandem.OPTIONAL
    }, providedOptions );

    // nested options for 'Start Over' button
    options.startOverButtonOptions = combineOptions<TextPushButtonOptions>( {
      font: options.font,
      textFill: options.textFill,
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      xMargin: 10,
      yMargin: 8,
      listener: _.noop,
      tandem: options.tandem.createTandem( 'startOverButton' ),
      maxWidth: 0.2 * ( layoutBounds.width - ( 2 * options.xMargin ) ) // use 20% of available width
    }, options.startOverButtonOptions );

    assert && assert( ( options.challengeIndexProperty && options.numberOfChallengesProperty ) ||
                      ( !options.challengeIndexProperty && !options.numberOfChallengesProperty ),
      'challengeIndexProperty and numberOfChallengesProperty are both or neither' );

    // nested options for 'Level N' text
    options.levelTextOptions = combineOptions<TextOptions>( {
      fill: options.textFill,
      font: options.font
    }, options.levelTextOptions );

    // nested options for 'Challenge N of M' text
    options.challengeTextOptions = combineOptions<TextOptions>( {
      fill: options.textFill,
      font: options.font
    }, options.challengeTextOptions );

    // the rectangular bar, size will be set by visibleBoundsListener
    const barNode = new Rectangle( {
      fill: options.barFill,
      stroke: options.barStroke
    } );

    // Nodes on the left end of the bar
    const leftChildren = [];

    // Level N
    let levelText: Node;
    if ( options.levelProperty && options.levelVisible ) {

      const levelStringProperty = new DerivedProperty(
        [ VegasStrings.label.levelStringProperty, options.levelProperty ],
        ( pattern: string, level: number ) => StringUtils.format( pattern, level )
      );

      levelText = new Text( levelStringProperty, combineOptions<TextOptions>( {
        tandem: options.tandem.createTandem( 'levelText' )
      }, options.levelTextOptions ) );
      leftChildren.push( levelText );
    }

    // Challenge N of M
    let challengeNumberText: Node;
    if ( options.challengeIndexProperty && options.numberOfChallengesProperty ) {

      const challengeNumberStringProperty = new DerivedProperty(
        [ VegasStrings.pattern[ '0challenge' ][ '1maxStringProperty' ], options.challengeIndexProperty, options.numberOfChallengesProperty ],
        ( pattern: string, challengeIndex: number, numberOfChallenges: number ) =>
          StringUtils.format( pattern, challengeIndex + 1, numberOfChallenges )
      );

      challengeNumberText = new Text( challengeNumberStringProperty, combineOptions<TextOptions>( {
        tandem: options.tandem.createTandem( 'challengeNumberText' )
      }, options.challengeTextOptions ) );
      leftChildren.push( challengeNumberText );
    }

    // Score
    const scoreDisplay = options.createScoreDisplay( scoreProperty );
    leftChildren.push( scoreDisplay );

    // Timer (optional)
    let elapsedTimeNode: Node;
    if ( options.elapsedTimeProperty && options.timerEnabledProperty ) {
      elapsedTimeNode = new ElapsedTimeNode( options.elapsedTimeProperty, {
        visibleProperty: options.timerEnabledProperty,
        clockIconRadius: options.clockIconRadius,
        font: options.font,
        textFill: options.textFill
      } );
      leftChildren.push( elapsedTimeNode );
    }

    // Start Over button
    const startOverButton = new TextPushButton( options.startOverButtonText, options.startOverButtonOptions );

    // Nodes on the left end of the bar
    const leftNodes = new HBox( {

      // Because elapsedTimeNode needs to be considered regardless of whether it's visible,
      // see https://github.com/phetsims/vegas/issues/80
      excludeInvisibleChildrenFromBounds: false,
      spacing: options.xSpacing,
      children: leftChildren,
      maxWidth: ( layoutBounds.width - ( 2 * options.xMargin ) - startOverButton.width - options.xSpacing )
    } );

    options.children = [ barNode, leftNodes, startOverButton ];

    options.barHeight = Math.max( leftNodes.height, scoreDisplay.height ) + ( 2 * options.yMargin );

    super( layoutBounds, visibleBoundsProperty, options );

    // Dynamically position components on the bar.
    Multilink.multilink( [ this.positioningBoundsProperty, leftNodes.boundsProperty, startOverButton.boundsProperty ],
      ( positioningBounds: Bounds2, leftNodeBounds: Bounds2, startOverButtonBounds: Bounds2 ) => {
        leftNodes.left = positioningBounds.left;
        leftNodes.centerY = positioningBounds.centerY;
        startOverButton.right = positioningBounds.right;
        startOverButton.centerY = positioningBounds.centerY;
      } );

    this.disposeFiniteStatusBar = () => {
      levelText.dispose();
      challengeNumberText.dispose();
      scoreDisplay.dispose();
      elapsedTimeNode && elapsedTimeNode.dispose();
      startOverButton.dispose();
      elapsedTimeNode && elapsedTimeNode.dispose();
    };
  }

  public override dispose(): void {
    this.disposeFiniteStatusBar();
    super.dispose();
  }
}

vegas.register( 'FiniteStatusBar', FiniteStatusBar );