// Copyright 2019-2022, University of Colorado Boulder

/**
 * Main ScreenView for matching game style screens.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Screen from '../../../../joist/js/Screen.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import BackButton from '../../../../scenery-phet/js/buttons/BackButton.js';
import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import TimerToggleButton from '../../../../scenery-phet/js/buttons/TimerToggleButton.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import MixedFractionNode from '../../../../scenery-phet/js/MixedFractionNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Node, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Easing from '../../../../twixt/js/Easing.js';
import TransitionNode from '../../../../twixt/js/TransitionNode.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import LevelSelectionButton from '../../../../vegas/js/LevelSelectionButton.js';
import ScoreDisplayStars from '../../../../vegas/js/ScoreDisplayStars.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import FractionsCommonStrings from '../../FractionsCommonStrings.js';
import FilledPartition from '../../game/model/FilledPartition.js';
import ShapePartition from '../../game/model/ShapePartition.js';
import FilledPartitionNode from '../../game/view/FilledPartitionNode.js';
import MatchingChallenge from '../model/MatchingChallenge.js';
import MatchingChallengeNode from './MatchingChallengeNode.js';

// constants
const LEVEL_SELECTION_SPACING = 25;
const SIDE_MARGIN = 10;
const ICON_DESIGN_BOUNDS = new Bounds2( 0, 0, 90, 129 );
const select = ( shapePartitions, quantity ) => {
  return _.find( shapePartitions, shapePartition => shapePartition.length === quantity );
};
const LEVEL_SHAPE_PARTITIONS = [
  select( ShapePartition.PIES, 1 ),
  select( ShapePartition.HORIZONTAL_BARS, 2 ),
  select( ShapePartition.VERTICAL_BARS, 3 ),
  select( ShapePartition.DIAGONAL_LS, 4 ),
  select( ShapePartition.POLYGONS, 5 ),
  ShapePartition.SIX_FLOWER,
  ShapePartition.HEX_RING,
  ShapePartition.NINJA_STAR
];
const LEVEL_COLORS = [
  FractionsCommonColors.shapeRedProperty,
  FractionsCommonColors.shapeGreenProperty,
  FractionsCommonColors.shapeBlueProperty,
  FractionsCommonColors.shapeOrangeProperty,
  FractionsCommonColors.shapeMagentaProperty,
  FractionsCommonColors.shapeYellowProperty,
  FractionsCommonColors.shapeLighterPinkProperty,
  FractionsCommonColors.shapeStrongGreenProperty
];
const QUADRATIC_TRANSITION_OPTIONS = {
  duration: 0.4,
  targetOptions: {
    easing: Easing.QUADRATIC_IN_OUT
  }
};

const chooseYourLevelString = VegasStrings.chooseYourLevel;
const fractionsChooseYourLevelString = FractionsCommonStrings.fractionsChooseYourLevel;
const levelTitlePatternString = FractionsCommonStrings.levelTitlePattern;
const mixedNumbersChooseYourLevelString = FractionsCommonStrings.mixedNumbersChooseYourLevel;

class MatchingGameScreenView extends ScreenView {
  /**
   * @param {MatchingGameModel} model
   */
  constructor( model ) {
    super();

    // @private {MatchingGameModel}
    this.model = model;

    const gameAudioPlayer = new GameAudioPlayer();

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      }
    } );

    const levelIcons = model.levels.map( level => MatchingGameScreenView.createLevelIcon( level, model.hasMixedNumbers ) );

    // @private {Node} - The "left" half of the sliding layer, displayed first
    this.levelSelectionLayer = new Node( {
      children: [
        resetAllButton,
        new TimerToggleButton( model.timeVisibleProperty, {
          touchAreaXDilation: 5,
          touchAreaYDilation: 5,
          bottom: this.layoutBounds.bottom - SIDE_MARGIN,
          left: this.layoutBounds.left + SIDE_MARGIN
        } ),
        new VBox( {
          spacing: 20,
          center: this.layoutBounds.center,
          children: [
            new Text( model.useShortTitle ? chooseYourLevelString : ( model.hasMixedNumbers ? mixedNumbersChooseYourLevelString : fractionsChooseYourLevelString ), {
              centerX: this.layoutBounds.centerX,
              top: this.layoutBounds.top + 30,
              font: new PhetFont( 30 )
            } ),
            new VBox( {
              children: [
                this.createLevelRow( this.model.levels.slice( 0, 4 ), levelIcons.slice( 0, 4 ) ),
                this.createLevelRow( this.model.levels.slice( 4 ), levelIcons.slice( 4 ) )
              ],
              spacing: LEVEL_SELECTION_SPACING
            } )
          ]
        } )
      ]
    } );
    resetAllButton.bottom = this.layoutBounds.bottom - SIDE_MARGIN;
    resetAllButton.right = this.layoutBounds.right - SIDE_MARGIN;

    // @private {TransitionNode}
    this.transitionNode = new TransitionNode( this.visibleBoundsProperty, {
      content: this.levelSelectionLayer,
      cachedNodes: [ this.levelSelectionLayer ]
    } );
    this.addChild( this.transitionNode );

    const challengeBackground = new Node();
    const challengeForeground = new Node();

    const leftButtonOptions = {
      touchAreaXDilation: SIDE_MARGIN,
      touchAreaYDilation: SIDE_MARGIN / 2
    };

    const challengeControlBox = new VBox( {
      spacing: 10,
      top: this.layoutBounds.top + 160,
      left: this.layoutBounds.left + FractionsCommonConstants.MATCHING_MARGIN,
      children: [
        new BackButton( merge( {
          listener() {
            const level = model.levelProperty.value;
            const challenge = model.challengeProperty.value;
            model.levelProperty.value = null;

            // Force a refresh on a completed level with the back button
            if ( challenge.isComplete && challenge.stateProperty.value === MatchingChallenge.State.NO_COMPARISON ) {
              level.refresh();
            }
          }
        }, leftButtonOptions ) ),
        new RefreshButton( merge( {
          iconHeight: 27,
          xMargin: 9,
          yMargin: 7,
          listener() {
            const level = model.levelProperty.value;
            if ( level ) {
              level.refresh();
              level.select();
            }
          }
        }, leftButtonOptions ) ),
        ...( phet.chipper.queryParameters.showAnswers ? [
          new RectangularPushButton( merge( {
            content: new FaceNode( 27 ),
            listener: function() {
              model.challengeProperty.value.cheat();
            }
          }, leftButtonOptions ) )
        ] : [] )
      ]
    } );

    // @private {MatchingChallengeNode|null}
    this.lastChallengeNode = null;
    model.challengeProperty.lazyLink( ( challenge, oldChallenge ) => {
      const oldChallengeNode = this.lastChallengeNode;

      if ( oldChallengeNode ) {
        oldChallengeNode.interruptSubtreeInput();
      }

      this.lastChallengeNode = null;
      let transition;
      if ( challenge ) {
        const challengeNode = new MatchingChallengeNode( challenge, this.layoutBounds, gameAudioPlayer, {
          rewardContainer: challengeBackground,
          onContinue: () => {
            const level = model.levelProperty.value;
            model.levelProperty.value = null;

            // Start a new challenge for the level
            if ( level ) {
              level.refresh();
            }
          }
        } );
        this.lastChallengeNode = challengeNode;

        // Assign each challenge node with a wrapper reference, so we can easily dispose it.
        challengeNode.wrapper = new Node( {
          children: [
            challengeBackground,
            challengeControlBox,
            challengeNode,
            challengeForeground
          ]
        } );
        if ( oldChallenge && oldChallenge.refreshedChallenge === challenge ) {
          transition = this.transitionNode.dissolveTo( challengeNode.wrapper, {
            duration: 0.6,
            targetOptions: {
              easing: Easing.LINEAR
            }
          } );
        }
        else {
          transition = this.transitionNode.slideLeftTo( challengeNode.wrapper, QUADRATIC_TRANSITION_OPTIONS );
        }
      }
      else {
        transition = this.transitionNode.slideRightTo( this.levelSelectionLayer, QUADRATIC_TRANSITION_OPTIONS );
      }
      this.delayTransitions = true;
      if ( oldChallengeNode ) {
        transition.endedEmitter.addListener( () => {
          oldChallengeNode.wrapper.dispose();
          oldChallengeNode.dispose();
        } );
      }
    } );
  }

  /**
   * Steps the view forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    this.transitionNode.step( dt );

    this.lastChallengeNode && this.lastChallengeNode.step( dt );
  }

  /**
   * Creates the level icon for the given level. This is passed into LevelSelectionButton as the icon, and in our case
   * includes text about what level number it is, in addition to the icon graphic. We need to handle this and provide
   * same-bounds "icons" for every button since LevelSelectionButton still resizes the icon based on its bounds.
   * @private
   *
   * @param {FractionLevel} level
   * @param {boolean} hasMixedNumbers
   * @returns {Node}
   */
  static createLevelIcon( level, hasMixedNumbers ) {
    const label = new Text( StringUtils.fillIn( levelTitlePatternString, {
      number: level.number
    } ), {
      font: new PhetFont( 18 ),
      maxWidth: ICON_DESIGN_BOUNDS.width
    } );

    // unmixed max width ~106, mixed ~217
    const shapePartition = LEVEL_SHAPE_PARTITIONS[ level.number - 1 ];
    const color = LEVEL_COLORS[ level.number - 1 ];
    const filledPartitions = [
      new FilledPartition( shapePartition, _.times( level.number, () => true ), color ),
      ...( hasMixedNumbers ? [
        new FilledPartition( shapePartition, [ true, ..._.times( level.number - 1, () => false ) ], color )
      ] : [] )
    ];
    const icon = new HBox( {
      spacing: 5,
      children: filledPartitions.map( filledPartition => new FilledPartitionNode( filledPartition, {
        borderLineWidth: FractionsCommonConstants.MATCHING_BORDER
      } ) ),
      scale: hasMixedNumbers ? 0.5 : 0.8
    } );

    label.centerX = ICON_DESIGN_BOUNDS.centerX;
    label.top = ICON_DESIGN_BOUNDS.top;

    const iconContainer = new Node( {
      children: [ icon ],
      maxWidth: ICON_DESIGN_BOUNDS.width
    } );

    iconContainer.centerX = ICON_DESIGN_BOUNDS.centerX;
    iconContainer.centerY = ( label.bottom + ICON_DESIGN_BOUNDS.bottom ) / 2;

    assert && assert( ICON_DESIGN_BOUNDS.containsBounds( label.bounds ), 'Sanity check for level icon layout' );
    assert && assert( ICON_DESIGN_BOUNDS.containsBounds( iconContainer.bounds ), 'Sanity check for level icon layout' );

    return new Node( {
      children: [ label, iconContainer ],
      localBounds: ICON_DESIGN_BOUNDS
    } );
  }

  /**
   * Creates a row of level selection buttons.
   * @private
   *
   * @param {Array.<MatchingLevel>} levels
   * @param {Array.<Node>} icons
   * @returns {Node}
   */
  createLevelRow( levels, icons ) {
    return new HBox( {
      children: levels.map( ( level, index ) => {
        const button = new LevelSelectionButton( icons[ index ], level.levelSelectionScoreProperty, {
          buttonWidth: 110,
          buttonHeight: 200,
          createScoreDisplay: scoreProperty => new ScoreDisplayStars( scoreProperty, {
            numberOfStars: 3,
            perfectScore: 12
          } ),
          listener: () => {
            this.model.levelProperty.value = level;
          },
          baseColor: FractionsCommonColors.matchingLevelBackgroundProperty,
          // Workaround since it expects 0 as the best time if there was no best time. Don't solve levels in
          // under a second!
          bestTimeProperty: new DerivedProperty( [ level.bestTimeProperty ], bestTime => isFinite( bestTime ) ? bestTime : 0 ),
          bestTimeVisibleProperty: new DerivedProperty( [ level.timeVisibleProperty, level.levelSelectionScoreProperty ], ( timeVisible, score ) => {
            return timeVisible && score === 12;
          } ),
          bestTimeYSpacing: 5
        } );
        return button;
      } ),
      spacing: LEVEL_SELECTION_SPACING
    } );
  }

  /**
   * The home-screen icon for the main (non-mixed) screen.
   * @public
   *
   * @returns {Node}
   */
  static createIntroHomeIcon() {
    const rectangle = new Rectangle( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: FractionsCommonColors.matchingHomeIconBackgroundProperty
    } );

    rectangle.addChild( new HBox( {
      spacing: 20,
      children: [
        new FilledPartitionNode( new FilledPartition( select( ShapePartition.PIES, 2 ), [ false, true ], FractionsCommonColors.shapeBlueProperty ), {
          scale: 2.5,
          borderLineWidth: FractionsCommonConstants.MATCHING_BORDER
        } ),
        new Text( '=', { fill: 'black', font: new PhetFont( 160 ) } ),
        new MixedFractionNode( {
          numerator: 1,
          denominator: 2,
          vinculumExtension: 5,
          scale: 3
        } )
      ],
      center: rectangle.center
    } ) );

    return rectangle;
  }

  /**
   * The navbar icon for the main (non-mixed) screen.
   * @public
   *
   * @returns {Node}
   */
  static createIntroNavbarIcon() {
    const rectangle = new Rectangle( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: FractionsCommonColors.matchingNavbarIconBackgroundProperty,
      borderLineWidth: FractionsCommonConstants.MATCHING_BORDER
    } );

    rectangle.addChild( new FilledPartitionNode( new FilledPartition( select( ShapePartition.PIES, 2 ), [ false, true ], FractionsCommonColors.shapeBlueProperty ), {
      center: rectangle.center,
      scale: 4
    } ) );

    return rectangle;
  }

  /**
   * The home-screen icon for the mixed screen.
   * @public
   *
   * @returns {Node}
   */
  static createMixedHomeIcon() {
    const rectangle = new Rectangle( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: FractionsCommonColors.matchingHomeIconBackgroundProperty
    } );

    rectangle.addChild( new HBox( {
      spacing: 15,
      children: [
        new HBox( {
          spacing: 10,
          children: [
            new FilledPartitionNode( new FilledPartition( ShapePartition.SIX_FLOWER, [ true, true, true, true, true, true ], FractionsCommonColors.shapeRedProperty ), {
              borderLineWidth: FractionsCommonConstants.MATCHING_BORDER
            } ),
            new FilledPartitionNode( new FilledPartition( ShapePartition.SIX_FLOWER, [ false, true, true, true, false, false ], FractionsCommonColors.shapeRedProperty ), {
              borderLineWidth: FractionsCommonConstants.MATCHING_BORDER
            } )
          ],
          scale: 1.2
        } ),
        new Text( '=', { fill: 'black', font: new PhetFont( 160 ) } ),
        new MixedFractionNode( {
          whole: 1,
          numerator: 1,
          denominator: 2,
          vinculumExtension: 3,
          scale: 3
        } )
      ],
      center: rectangle.center
    } ) );

    return rectangle;
  }

  /**
   * The navbar icon for the mixed screen.
   * @public
   *
   * @returns {Node}
   */
  static createMixedNavbarIcon() {
    const rectangle = new Rectangle( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: FractionsCommonColors.matchingNavbarIconBackgroundProperty
    } );

    rectangle.addChild( new HBox( {
      spacing: 5,
      children: [
        new FilledPartitionNode( new FilledPartition( ShapePartition.SIX_FLOWER, [ true, true, true, true, true, true ], FractionsCommonColors.shapeRedProperty ), {
          borderLineWidth: FractionsCommonConstants.MATCHING_BORDER
        } ),
        new FilledPartitionNode( new FilledPartition( ShapePartition.SIX_FLOWER, [ false, true, true, true, false, false ], FractionsCommonColors.shapeRedProperty ), {
          borderLineWidth: FractionsCommonConstants.MATCHING_BORDER
        } )
      ],
      center: rectangle.center,
      scale: 2.5
    } ) );

    return rectangle;
  }
}

fractionsCommon.register( 'MatchingGameScreenView', MatchingGameScreenView );
export default MatchingGameScreenView;