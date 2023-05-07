// Copyright 2017-2023, University of Colorado Boulder

/**
 * ScreenView for game screens
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import FaceWithPointsNode from '../../../../scenery-phet/js/FaceWithPointsNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import StarNode from '../../../../scenery-phet/js/StarNode.js';
import { AlignBox, HBox, Image, Node, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Panel from '../../../../sun/js/Panel.js';
import Easing from '../../../../twixt/js/Easing.js';
import TransitionNode from '../../../../twixt/js/TransitionNode.js';
import FiniteStatusBar from '../../../../vegas/js/FiniteStatusBar.js';
import LevelCompletedNode from '../../../../vegas/js/LevelCompletedNode.js';
import LevelSelectionButton from '../../../../vegas/js/LevelSelectionButton.js';
import RewardNode from '../../../../vegas/js/RewardNode.js';
import ScoreDisplayLabeledStars from '../../../../vegas/js/ScoreDisplayLabeledStars.js';
import ScoreDisplayStars from '../../../../vegas/js/ScoreDisplayStars.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import level1Icon_png from '../../../mipmaps/level1Icon_png.js';
import level2Icon_png from '../../../mipmaps/level2Icon_png.js';
import level3Icon_png from '../../../mipmaps/level3Icon_png.js';
import level4Icon_png from '../../../mipmaps/level4Icon_png.js';
import level5Icon_png from '../../../mipmaps/level5Icon_png.js';
import level6Icon_png from '../../../mipmaps/level6Icon_png.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import AreaModelCommonGlobals from '../../common/AreaModelCommonGlobals.js';
import Term from '../../common/model/Term.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';
import GenericFactorsNode from '../../generic/view/GenericFactorsNode.js';
import Entry from '../model/Entry.js';
import EntryDisplayType from '../model/EntryDisplayType.js';
import GameAreaDisplay from '../model/GameAreaDisplay.js';
import GameAreaModel from '../model/GameAreaModel.js';
import GameState from '../model/GameState.js';
import GameAreaDisplayNode from './GameAreaDisplayNode.js';
import GameAudio from './GameAudio.js';
import GameEditableLabelNode from './GameEditableLabelNode.js';
import PolynomialEditNode from './PolynomialEditNode.js';
const checkString = VegasStrings.check;
const chooseYourLevelString = VegasStrings.chooseYourLevel;
const dimensionsString = AreaModelCommonStrings.dimensions;
const nextString = VegasStrings.next;
const showAnswerString = VegasStrings.showAnswer;
const totalAreaOfModelString = AreaModelCommonStrings.totalAreaOfModel;
const tryAgainString = VegasStrings.tryAgain;

// constants
const LEVEL_ICON_IMAGES = [level1Icon_png, level2Icon_png, level3Icon_png, level4Icon_png, level5Icon_png, level6Icon_png];
class GameAreaScreenView extends ScreenView {
  /**
   * @extends {ScreenView}
   *
   * @param {GameAreaModel} model
   */
  constructor(model) {
    assert && assert(model instanceof GameAreaModel);
    super();

    // @private {Node} - The "left" half of the sliding layer, displayed first
    this.levelSelectionLayer = new Node();

    // @private {Node} - The "right" half of the sliding layer, will slide into view when the user selects a level
    this.challengeLayer = new Node();

    // @private {GameAudio} - Responsible for all audio
    this.audio = new GameAudio(model);

    // @private {TransitionNode}
    this.transitionNode = new TransitionNode(this.visibleBoundsProperty, {
      content: this.levelSelectionLayer,
      useBoundsClip: false,
      // better performance without the clipping
      cachedNodes: [this.levelSelectionLayer, this.challengeLayer]
    });
    this.addChild(this.transitionNode);
    model.currentLevelProperty.lazyLink(level => {
      if (level) {
        this.transitionNode.slideLeftTo(this.challengeLayer, {
          duration: 0.4,
          targetOptions: {
            easing: Easing.QUADRATIC_IN_OUT
          }
        });
      } else {
        this.transitionNode.dissolveTo(this.levelSelectionLayer, {
          duration: 0.4,
          gamma: 2.2,
          targetOptions: {
            easing: Easing.LINEAR
          }
        });
      }
    });
    const levelIcons = LEVEL_ICON_IMAGES.map(iconImage => new Image(iconImage));
    const buttonSpacing = 30;
    const levelButtons = model.levels.map((level, index) => new LevelSelectionButton(levelIcons[index], level.scoreProperty, {
      createScoreDisplay: scoreProperty => new ScoreDisplayStars(scoreProperty, {
        numberOfStars: AreaModelCommonConstants.NUM_CHALLENGES,
        perfectScore: AreaModelCommonConstants.PERFECT_SCORE
      }),
      listener: () => {
        model.selectLevel(level);
      },
      baseColor: level.colorProperty,
      soundPlayerIndex: index
    }));
    this.levelSelectionLayer.addChild(new VBox({
      children: _.chunk(levelButtons, 3).map(children => new HBox({
        children: children,
        spacing: buttonSpacing
      })),
      spacing: buttonSpacing,
      center: this.layoutBounds.center
    }));
    this.levelSelectionLayer.addChild(new Text(chooseYourLevelString, {
      centerX: this.layoutBounds.centerX,
      centerY: (this.layoutBounds.top + this.levelSelectionLayer.top) / 2,
      font: new PhetFont(30)
    }));

    // Status bar
    let lastKnownLevel = null;
    // Create a property that holds the "last known" level, so that we don't change the view when we are switching
    // away from the current level back to the level selection.
    const lastLevelProperty = new DerivedProperty([model.currentLevelProperty], level => {
      level = level || lastKnownLevel;
      lastKnownLevel = level;
      return level;
    });
    const scoreProperty = new DynamicProperty(lastLevelProperty, {
      derive: 'scoreProperty'
    });
    const statusBar = new FiniteStatusBar(this.layoutBounds, this.visibleBoundsProperty, scoreProperty, {
      challengeIndexProperty: new DynamicProperty(lastLevelProperty, {
        derive: 'challengeIndexProperty',
        defaultValue: 1
      }),
      numberOfChallengesProperty: new NumberProperty(AreaModelCommonConstants.NUM_CHALLENGES),
      levelProperty: new DerivedProperty([lastLevelProperty], level => level ? level.number : 1),
      createScoreDisplay: scoreProperty => new ScoreDisplayLabeledStars(scoreProperty, {
        numberOfStars: AreaModelCommonConstants.NUM_CHALLENGES,
        perfectScore: AreaModelCommonConstants.PERFECT_SCORE,
        font: AreaModelCommonConstants.GAME_STATUS_BAR_NON_BOLD_FONT
      }),
      startOverButtonOptions: {
        listener: () => {
          // Reset the level on "Start Over", see https://github.com/phetsims/area-model-common/issues/87
          model.currentLevelProperty.value.startOver();
          model.currentLevelProperty.value = null;
        }
      },
      font: AreaModelCommonConstants.GAME_STATUS_BAR_NON_BOLD_FONT,
      levelTextOptions: {
        font: AreaModelCommonConstants.GAME_STATUS_BAR_BOLD_FONT
      },
      floatToTop: true,
      barFill: new DynamicProperty(lastLevelProperty, {
        derive: 'colorProperty',
        defaultValue: 'black'
      })
    });
    this.challengeLayer.addChild(statusBar);

    // Prompt
    const promptText = new Text(' ', {
      font: AreaModelCommonConstants.GAME_STATUS_BAR_PROMPT_FONT,
      pickable: false,
      maxWidth: 600,
      top: this.layoutBounds.top + statusBar.height + 20
    });
    this.challengeLayer.addChild(promptText);
    new DynamicProperty(model.currentLevelProperty, {
      derive: 'currentChallengeProperty'
    }).link(challenge => {
      // Could be null
      if (challenge) {
        promptText.string = challenge.description.getPromptString();
        // Center around the area's center.
        promptText.centerX = this.layoutBounds.left + AreaModelCommonConstants.GAME_AREA_OFFSET.x + AreaModelCommonConstants.AREA_SIZE / 2;
        // Don't let it go off the left side of the screen
        promptText.left = Math.max(promptText.left, this.layoutBounds.left + 20);
      }
    });

    // Reset All button
    const resetAllButton = new ResetAllButton({
      listener: () => {
        model.reset();
      },
      right: this.layoutBounds.right - AreaModelCommonConstants.LAYOUT_SPACING,
      bottom: this.layoutBounds.bottom - AreaModelCommonConstants.LAYOUT_SPACING
    });
    this.levelSelectionLayer.addChild(resetAllButton);

    /*---------------------------------------------------------------------------*
    * Area display
    *----------------------------------------------------------------------------*/

    // @private {GameAreaDisplay}
    this.areaDisplay = new GameAreaDisplay(model.currentChallengeProperty);
    const gameAreaNode = new GameAreaDisplayNode(this.areaDisplay, model.activeEntryProperty, model.stateProperty, term => {
      model.setActiveTerm(term);
    });
    this.challengeLayer.addChild(gameAreaNode);
    gameAreaNode.translation = this.layoutBounds.leftTop.plus(AreaModelCommonConstants.GAME_AREA_OFFSET);

    /*---------------------------------------------------------------------------*
    * Panels
    *----------------------------------------------------------------------------*/

    const panelAlignGroup = AreaModelCommonGlobals.panelAlignGroup;
    const factorsNode = new GenericFactorsNode(this.areaDisplay.totalProperties, this.areaDisplay.allowExponentsProperty);
    const factorsContent = this.createPanel(dimensionsString, panelAlignGroup, factorsNode);

    // If we have a polynomial, don't use this editable property (use the polynomial editor component instead)
    const totalTermEntryProperty = new DerivedProperty([this.areaDisplay.totalEntriesProperty], totalEntries => totalEntries.length === 1 ? totalEntries[0] : new Entry(null));
    const totalNode = new GameEditableLabelNode({
      entryProperty: totalTermEntryProperty,
      gameStateProperty: model.stateProperty,
      activeEntryProperty: model.activeEntryProperty,
      colorProperty: AreaModelCommonColors.totalEditableProperty,
      allowExponentsProperty: this.areaDisplay.allowExponentsProperty,
      orientation: Orientation.HORIZONTAL,
      labelFont: AreaModelCommonConstants.GAME_TOTAL_FONT,
      editFont: AreaModelCommonConstants.GAME_TOTAL_FONT
    });
    const polynomialEditNode = new PolynomialEditNode(this.areaDisplay.totalProperty, this.areaDisplay.totalEntriesProperty, () => {
      if (model.stateProperty.value === GameState.WRONG_FIRST_ANSWER) {
        model.stateProperty.value = GameState.SECOND_ATTEMPT;
      }
    });
    const polynomialReadoutText = new RichText('?', {
      font: AreaModelCommonConstants.TOTAL_AREA_LABEL_FONT,
      maxWidth: AreaModelCommonConstants.PANEL_INTERIOR_MAX
    });
    this.areaDisplay.totalProperty.link(total => {
      if (total) {
        polynomialReadoutText.string = total.toRichString(false);
      }
    });
    const totalContainer = new Node();
    Multilink.multilink([this.areaDisplay.totalEntriesProperty, model.stateProperty], (totalEntries, gameState) => {
      if (totalEntries.length > 1) {
        if (totalEntries[0].displayType === EntryDisplayType.EDITABLE && gameState !== GameState.CORRECT_ANSWER && gameState !== GameState.SHOW_SOLUTION) {
          totalContainer.children = [polynomialEditNode];
        } else {
          totalContainer.children = [polynomialReadoutText];
        }
      } else {
        totalContainer.children = [totalNode];
      }
    });
    const productContent = this.createPanel(totalAreaOfModelString, panelAlignGroup, totalContainer);
    const panelBox = new VBox({
      children: [factorsContent, productContent],
      spacing: AreaModelCommonConstants.LAYOUT_SPACING
    });
    this.challengeLayer.addChild(new AlignBox(panelBox, {
      alignBounds: this.layoutBounds,
      xAlign: 'right',
      yAlign: 'top',
      topMargin: gameAreaNode.y,
      rightMargin: AreaModelCommonConstants.LAYOUT_SPACING
    }));

    /**
     * Creates a game-style button that may be enabled via a property
     *
     * @param {string} label
     * @param {function} listener - The callback for when the button is pressed
     * @param {Property.<boolean>} [enabledProperty]
     */
    const createGameButton = (label, listener, enabledProperty) => {
      const button = new RectangularPushButton({
        content: new Text(label, {
          font: AreaModelCommonConstants.BUTTON_FONT,
          maxWidth: 200
        }),
        touchAreaXDilation: 10,
        touchAreaYDilation: 10,
        listener: listener,
        baseColor: AreaModelCommonColors.gameButtonBackgroundProperty,
        centerX: panelBox.centerX,
        top: panelBox.bottom + 80
      });
      enabledProperty && enabledProperty.link(enabled => {
        button.enabled = enabled;
      });
      this.challengeLayer.addChild(button);
      return button;
    };
    const checkButton = createGameButton(checkString, () => {
      model.check();
    }, model.allowCheckingProperty);
    const tryAgainButton = createGameButton(tryAgainString, () => {
      model.tryAgain();
    });
    const nextButton = createGameButton(nextString, () => {
      model.next();
    });
    const showAnswerButton = createGameButton(showAnswerString, () => {
      model.showAnswer();
    });
    let cheatButton = null;

    // Cheat button, see https://github.com/phetsims/area-model-common/issues/116 and
    // https://github.com/phetsims/area-model-common/issues/163
    if (phet.chipper.queryParameters.showAnswers) {
      cheatButton = new RectangularPushButton({
        content: new FaceNode(40),
        top: showAnswerButton.bottom + 10,
        centerX: showAnswerButton.centerX,
        listener: () => model.cheat()
      });
      this.challengeLayer.addChild(cheatButton);
    }
    const faceScoreNode = new FaceWithPointsNode({
      faceDiameter: 90,
      pointsAlignment: 'rightBottom',
      pointsFont: AreaModelCommonConstants.SCORE_INCREASE_FONT,
      spacing: 10,
      centerX: showAnswerButton.centerX,
      // a bit unclean, since the text hasn't been positioned yet.
      top: showAnswerButton.bottom + 10
    });
    this.challengeLayer.addChild(faceScoreNode);
    const levelCompleteContainer = new Node();
    this.challengeLayer.addChild(levelCompleteContainer);

    // @private {RewardNode|null} - We need to step it when there is one
    this.rewardNode = null;
    const rewardNodes = RewardNode.createRandomNodes([new FaceNode(40, {
      headStroke: 'black',
      headLineWidth: 1.5
    }), new StarNode()], 100);
    Orientation.enumeration.values.forEach(orientation => {
      const colorProperty = AreaModelCommonColors.genericColorProperties.get(orientation);
      _.range(1, 10).forEach(digit => {
        [-1, 1].forEach(sign => {
          const powers = model.hasExponents ? [0, 1, 2] : [0, 0, 0];
          powers.forEach(power => {
            rewardNodes.push(new RichText(new Term(sign * digit, power).toRichString(false), {
              font: AreaModelCommonConstants.REWARD_NODE_FONT,
              fill: colorProperty
            }));
          });
        });
      });
    });
    let levelCompletedNode = null;
    model.stateProperty.link((state, oldState) => {
      // When we switch back to level selection, try to leave things as they were.
      if (state !== null) {
        gameAreaNode.visible = state !== GameState.LEVEL_COMPLETE;
        panelBox.visible = state !== GameState.LEVEL_COMPLETE;
        statusBar.visible = state !== GameState.LEVEL_COMPLETE;
        promptText.visible = state !== GameState.LEVEL_COMPLETE;
        levelCompleteContainer.visible = state === GameState.LEVEL_COMPLETE;
        checkButton.visible = state === GameState.FIRST_ATTEMPT || state === GameState.SECOND_ATTEMPT;
        tryAgainButton.visible = state === GameState.WRONG_FIRST_ANSWER;
        nextButton.visible = state === GameState.CORRECT_ANSWER || state === GameState.SHOW_SOLUTION;
        showAnswerButton.visible = state === GameState.WRONG_SECOND_ANSWER;
        faceScoreNode.visible = state === GameState.CORRECT_ANSWER || state === GameState.WRONG_FIRST_ANSWER || state === GameState.WRONG_SECOND_ANSWER;
        if (cheatButton) {
          cheatButton.visible = state === GameState.FIRST_ATTEMPT || state === GameState.SECOND_ATTEMPT;
        }
      }
      if (state === GameState.CORRECT_ANSWER) {
        faceScoreNode.smile();
        faceScoreNode.setPoints(oldState === GameState.FIRST_ATTEMPT ? 2 : 1);
      } else if (state === GameState.WRONG_FIRST_ANSWER || state === GameState.WRONG_SECOND_ANSWER) {
        faceScoreNode.frown();
      }
      if (state === GameState.LEVEL_COMPLETE) {
        const level = model.currentLevelProperty.value;
        levelCompletedNode && levelCompletedNode.dispose();
        levelCompletedNode = new LevelCompletedNode(level.number, level.scoreProperty.value, AreaModelCommonConstants.PERFECT_SCORE, AreaModelCommonConstants.NUM_CHALLENGES, false, 0, 0, 0, () => model.moveToLevelSelection(), {
          cornerRadius: 8,
          center: this.layoutBounds.center,
          fill: level.colorProperty,
          contentMaxWidth: 400
        });
        levelCompleteContainer.children = [levelCompletedNode];
        if (level.scoreProperty.value === AreaModelCommonConstants.PERFECT_SCORE) {
          this.rewardNode = new RewardNode({
            nodes: rewardNodes
          });
          levelCompleteContainer.insertChild(0, this.rewardNode);
        }
      } else {
        if (this.rewardNode) {
          this.rewardNode.detach();
          this.rewardNode.dispose();
          this.rewardNode = null;
        }
      }
    });
  }

  /**
   * Creates a panel interior with the title left-aligned, and the content somewhat offset from the left with a
   * guaranteed margin.
   * @private
   *
   * @param {string} titleString
   * @param {AlignGroup} panelAlignGroup
   * @param {Node} content
   */
  createPanel(titleString, panelAlignGroup, content) {
    const panelContent = new VBox({
      children: [new AlignBox(new Text(titleString, {
        font: AreaModelCommonConstants.TITLE_FONT,
        maxWidth: AreaModelCommonConstants.PANEL_INTERIOR_MAX
      }), {
        group: panelAlignGroup,
        xAlign: 'left'
      }), new AlignBox(content, {
        group: panelAlignGroup,
        xAlign: 'center'
      })],
      spacing: 10
    });
    return new Panel(panelContent, {
      xMargin: 15,
      yMargin: 10,
      fill: AreaModelCommonColors.panelBackgroundProperty,
      stroke: AreaModelCommonColors.panelBorderProperty,
      cornerRadius: AreaModelCommonConstants.PANEL_CORNER_RADIUS
    });
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step(dt) {
    this.transitionNode.step(dt);
    this.rewardNode && this.rewardNode.step(dt);
  }
}
areaModelCommon.register('GameAreaScreenView', GameAreaScreenView);
export default GameAreaScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJEeW5hbWljUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlNjcmVlblZpZXciLCJPcmllbnRhdGlvbiIsIlJlc2V0QWxsQnV0dG9uIiwiRmFjZU5vZGUiLCJGYWNlV2l0aFBvaW50c05vZGUiLCJQaGV0Rm9udCIsIlN0YXJOb2RlIiwiQWxpZ25Cb3giLCJIQm94IiwiSW1hZ2UiLCJOb2RlIiwiUmljaFRleHQiLCJUZXh0IiwiVkJveCIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIlBhbmVsIiwiRWFzaW5nIiwiVHJhbnNpdGlvbk5vZGUiLCJGaW5pdGVTdGF0dXNCYXIiLCJMZXZlbENvbXBsZXRlZE5vZGUiLCJMZXZlbFNlbGVjdGlvbkJ1dHRvbiIsIlJld2FyZE5vZGUiLCJTY29yZURpc3BsYXlMYWJlbGVkU3RhcnMiLCJTY29yZURpc3BsYXlTdGFycyIsIlZlZ2FzU3RyaW5ncyIsImxldmVsMUljb25fcG5nIiwibGV2ZWwySWNvbl9wbmciLCJsZXZlbDNJY29uX3BuZyIsImxldmVsNEljb25fcG5nIiwibGV2ZWw1SWNvbl9wbmciLCJsZXZlbDZJY29uX3BuZyIsImFyZWFNb2RlbENvbW1vbiIsIkFyZWFNb2RlbENvbW1vblN0cmluZ3MiLCJBcmVhTW9kZWxDb21tb25Db25zdGFudHMiLCJBcmVhTW9kZWxDb21tb25HbG9iYWxzIiwiVGVybSIsIkFyZWFNb2RlbENvbW1vbkNvbG9ycyIsIkdlbmVyaWNGYWN0b3JzTm9kZSIsIkVudHJ5IiwiRW50cnlEaXNwbGF5VHlwZSIsIkdhbWVBcmVhRGlzcGxheSIsIkdhbWVBcmVhTW9kZWwiLCJHYW1lU3RhdGUiLCJHYW1lQXJlYURpc3BsYXlOb2RlIiwiR2FtZUF1ZGlvIiwiR2FtZUVkaXRhYmxlTGFiZWxOb2RlIiwiUG9seW5vbWlhbEVkaXROb2RlIiwiY2hlY2tTdHJpbmciLCJjaGVjayIsImNob29zZVlvdXJMZXZlbFN0cmluZyIsImNob29zZVlvdXJMZXZlbCIsImRpbWVuc2lvbnNTdHJpbmciLCJkaW1lbnNpb25zIiwibmV4dFN0cmluZyIsIm5leHQiLCJzaG93QW5zd2VyU3RyaW5nIiwic2hvd0Fuc3dlciIsInRvdGFsQXJlYU9mTW9kZWxTdHJpbmciLCJ0b3RhbEFyZWFPZk1vZGVsIiwidHJ5QWdhaW5TdHJpbmciLCJ0cnlBZ2FpbiIsIkxFVkVMX0lDT05fSU1BR0VTIiwiR2FtZUFyZWFTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsImFzc2VydCIsImxldmVsU2VsZWN0aW9uTGF5ZXIiLCJjaGFsbGVuZ2VMYXllciIsImF1ZGlvIiwidHJhbnNpdGlvbk5vZGUiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJjb250ZW50IiwidXNlQm91bmRzQ2xpcCIsImNhY2hlZE5vZGVzIiwiYWRkQ2hpbGQiLCJjdXJyZW50TGV2ZWxQcm9wZXJ0eSIsImxhenlMaW5rIiwibGV2ZWwiLCJzbGlkZUxlZnRUbyIsImR1cmF0aW9uIiwidGFyZ2V0T3B0aW9ucyIsImVhc2luZyIsIlFVQURSQVRJQ19JTl9PVVQiLCJkaXNzb2x2ZVRvIiwiZ2FtbWEiLCJMSU5FQVIiLCJsZXZlbEljb25zIiwibWFwIiwiaWNvbkltYWdlIiwiYnV0dG9uU3BhY2luZyIsImxldmVsQnV0dG9ucyIsImxldmVscyIsImluZGV4Iiwic2NvcmVQcm9wZXJ0eSIsImNyZWF0ZVNjb3JlRGlzcGxheSIsIm51bWJlck9mU3RhcnMiLCJOVU1fQ0hBTExFTkdFUyIsInBlcmZlY3RTY29yZSIsIlBFUkZFQ1RfU0NPUkUiLCJsaXN0ZW5lciIsInNlbGVjdExldmVsIiwiYmFzZUNvbG9yIiwiY29sb3JQcm9wZXJ0eSIsInNvdW5kUGxheWVySW5kZXgiLCJjaGlsZHJlbiIsIl8iLCJjaHVuayIsInNwYWNpbmciLCJjZW50ZXIiLCJsYXlvdXRCb3VuZHMiLCJjZW50ZXJYIiwiY2VudGVyWSIsInRvcCIsImZvbnQiLCJsYXN0S25vd25MZXZlbCIsImxhc3RMZXZlbFByb3BlcnR5IiwiZGVyaXZlIiwic3RhdHVzQmFyIiwiY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eSIsImRlZmF1bHRWYWx1ZSIsIm51bWJlck9mQ2hhbGxlbmdlc1Byb3BlcnR5IiwibGV2ZWxQcm9wZXJ0eSIsIm51bWJlciIsIkdBTUVfU1RBVFVTX0JBUl9OT05fQk9MRF9GT05UIiwic3RhcnRPdmVyQnV0dG9uT3B0aW9ucyIsInZhbHVlIiwic3RhcnRPdmVyIiwibGV2ZWxUZXh0T3B0aW9ucyIsIkdBTUVfU1RBVFVTX0JBUl9CT0xEX0ZPTlQiLCJmbG9hdFRvVG9wIiwiYmFyRmlsbCIsInByb21wdFRleHQiLCJHQU1FX1NUQVRVU19CQVJfUFJPTVBUX0ZPTlQiLCJwaWNrYWJsZSIsIm1heFdpZHRoIiwiaGVpZ2h0IiwibGluayIsImNoYWxsZW5nZSIsInN0cmluZyIsImRlc2NyaXB0aW9uIiwiZ2V0UHJvbXB0U3RyaW5nIiwibGVmdCIsIkdBTUVfQVJFQV9PRkZTRVQiLCJ4IiwiQVJFQV9TSVpFIiwiTWF0aCIsIm1heCIsInJlc2V0QWxsQnV0dG9uIiwicmVzZXQiLCJyaWdodCIsIkxBWU9VVF9TUEFDSU5HIiwiYm90dG9tIiwiYXJlYURpc3BsYXkiLCJjdXJyZW50Q2hhbGxlbmdlUHJvcGVydHkiLCJnYW1lQXJlYU5vZGUiLCJhY3RpdmVFbnRyeVByb3BlcnR5Iiwic3RhdGVQcm9wZXJ0eSIsInRlcm0iLCJzZXRBY3RpdmVUZXJtIiwidHJhbnNsYXRpb24iLCJsZWZ0VG9wIiwicGx1cyIsInBhbmVsQWxpZ25Hcm91cCIsImZhY3RvcnNOb2RlIiwidG90YWxQcm9wZXJ0aWVzIiwiYWxsb3dFeHBvbmVudHNQcm9wZXJ0eSIsImZhY3RvcnNDb250ZW50IiwiY3JlYXRlUGFuZWwiLCJ0b3RhbFRlcm1FbnRyeVByb3BlcnR5IiwidG90YWxFbnRyaWVzUHJvcGVydHkiLCJ0b3RhbEVudHJpZXMiLCJsZW5ndGgiLCJ0b3RhbE5vZGUiLCJlbnRyeVByb3BlcnR5IiwiZ2FtZVN0YXRlUHJvcGVydHkiLCJ0b3RhbEVkaXRhYmxlUHJvcGVydHkiLCJvcmllbnRhdGlvbiIsIkhPUklaT05UQUwiLCJsYWJlbEZvbnQiLCJHQU1FX1RPVEFMX0ZPTlQiLCJlZGl0Rm9udCIsInBvbHlub21pYWxFZGl0Tm9kZSIsInRvdGFsUHJvcGVydHkiLCJXUk9OR19GSVJTVF9BTlNXRVIiLCJTRUNPTkRfQVRURU1QVCIsInBvbHlub21pYWxSZWFkb3V0VGV4dCIsIlRPVEFMX0FSRUFfTEFCRUxfRk9OVCIsIlBBTkVMX0lOVEVSSU9SX01BWCIsInRvdGFsIiwidG9SaWNoU3RyaW5nIiwidG90YWxDb250YWluZXIiLCJtdWx0aWxpbmsiLCJnYW1lU3RhdGUiLCJkaXNwbGF5VHlwZSIsIkVESVRBQkxFIiwiQ09SUkVDVF9BTlNXRVIiLCJTSE9XX1NPTFVUSU9OIiwicHJvZHVjdENvbnRlbnQiLCJwYW5lbEJveCIsImFsaWduQm91bmRzIiwieEFsaWduIiwieUFsaWduIiwidG9wTWFyZ2luIiwieSIsInJpZ2h0TWFyZ2luIiwiY3JlYXRlR2FtZUJ1dHRvbiIsImxhYmVsIiwiZW5hYmxlZFByb3BlcnR5IiwiYnV0dG9uIiwiQlVUVE9OX0ZPTlQiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJnYW1lQnV0dG9uQmFja2dyb3VuZFByb3BlcnR5IiwiZW5hYmxlZCIsImNoZWNrQnV0dG9uIiwiYWxsb3dDaGVja2luZ1Byb3BlcnR5IiwidHJ5QWdhaW5CdXR0b24iLCJuZXh0QnV0dG9uIiwic2hvd0Fuc3dlckJ1dHRvbiIsImNoZWF0QnV0dG9uIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJzaG93QW5zd2VycyIsImNoZWF0IiwiZmFjZVNjb3JlTm9kZSIsImZhY2VEaWFtZXRlciIsInBvaW50c0FsaWdubWVudCIsInBvaW50c0ZvbnQiLCJTQ09SRV9JTkNSRUFTRV9GT05UIiwibGV2ZWxDb21wbGV0ZUNvbnRhaW5lciIsInJld2FyZE5vZGUiLCJyZXdhcmROb2RlcyIsImNyZWF0ZVJhbmRvbU5vZGVzIiwiaGVhZFN0cm9rZSIsImhlYWRMaW5lV2lkdGgiLCJlbnVtZXJhdGlvbiIsInZhbHVlcyIsImZvckVhY2giLCJnZW5lcmljQ29sb3JQcm9wZXJ0aWVzIiwiZ2V0IiwicmFuZ2UiLCJkaWdpdCIsInNpZ24iLCJwb3dlcnMiLCJoYXNFeHBvbmVudHMiLCJwb3dlciIsInB1c2giLCJSRVdBUkRfTk9ERV9GT05UIiwiZmlsbCIsImxldmVsQ29tcGxldGVkTm9kZSIsInN0YXRlIiwib2xkU3RhdGUiLCJ2aXNpYmxlIiwiTEVWRUxfQ09NUExFVEUiLCJGSVJTVF9BVFRFTVBUIiwiV1JPTkdfU0VDT05EX0FOU1dFUiIsInNtaWxlIiwic2V0UG9pbnRzIiwiZnJvd24iLCJkaXNwb3NlIiwibW92ZVRvTGV2ZWxTZWxlY3Rpb24iLCJjb3JuZXJSYWRpdXMiLCJjb250ZW50TWF4V2lkdGgiLCJub2RlcyIsImluc2VydENoaWxkIiwiZGV0YWNoIiwidGl0bGVTdHJpbmciLCJwYW5lbENvbnRlbnQiLCJUSVRMRV9GT05UIiwiZ3JvdXAiLCJ4TWFyZ2luIiwieU1hcmdpbiIsInBhbmVsQmFja2dyb3VuZFByb3BlcnR5Iiwic3Ryb2tlIiwicGFuZWxCb3JkZXJQcm9wZXJ0eSIsIlBBTkVMX0NPUk5FUl9SQURJVVMiLCJzdGVwIiwiZHQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdhbWVBcmVhU2NyZWVuVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTY3JlZW5WaWV3IGZvciBnYW1lIHNjcmVlbnNcclxuICpcclxuICogTk9URTogVGhpcyB0eXBlIGlzIGRlc2lnbmVkIHRvIGJlIHBlcnNpc3RlbnQsIGFuZCB3aWxsIG5vdCBuZWVkIHRvIHJlbGVhc2UgcmVmZXJlbmNlcyB0byBhdm9pZCBtZW1vcnkgbGVha3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IER5bmFtaWNQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0R5bmFtaWNQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IEZhY2VOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9GYWNlTm9kZS5qcyc7XHJcbmltcG9ydCBGYWNlV2l0aFBvaW50c05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0ZhY2VXaXRoUG9pbnRzTm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgU3Rhck5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1N0YXJOb2RlLmpzJztcclxuaW1wb3J0IHsgQWxpZ25Cb3gsIEhCb3gsIEltYWdlLCBOb2RlLCBSaWNoVGV4dCwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcclxuaW1wb3J0IFRyYW5zaXRpb25Ob2RlIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL1RyYW5zaXRpb25Ob2RlLmpzJztcclxuaW1wb3J0IEZpbml0ZVN0YXR1c0JhciBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9GaW5pdGVTdGF0dXNCYXIuanMnO1xyXG5pbXBvcnQgTGV2ZWxDb21wbGV0ZWROb2RlIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0xldmVsQ29tcGxldGVkTm9kZS5qcyc7XHJcbmltcG9ydCBMZXZlbFNlbGVjdGlvbkJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9MZXZlbFNlbGVjdGlvbkJ1dHRvbi5qcyc7XHJcbmltcG9ydCBSZXdhcmROb2RlIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL1Jld2FyZE5vZGUuanMnO1xyXG5pbXBvcnQgU2NvcmVEaXNwbGF5TGFiZWxlZFN0YXJzIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL1Njb3JlRGlzcGxheUxhYmVsZWRTdGFycy5qcyc7XHJcbmltcG9ydCBTY29yZURpc3BsYXlTdGFycyBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9TY29yZURpc3BsYXlTdGFycy5qcyc7XHJcbmltcG9ydCBWZWdhc1N0cmluZ3MgZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvVmVnYXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IGxldmVsMUljb25fcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvbGV2ZWwxSWNvbl9wbmcuanMnO1xyXG5pbXBvcnQgbGV2ZWwySWNvbl9wbmcgZnJvbSAnLi4vLi4vLi4vbWlwbWFwcy9sZXZlbDJJY29uX3BuZy5qcyc7XHJcbmltcG9ydCBsZXZlbDNJY29uX3BuZyBmcm9tICcuLi8uLi8uLi9taXBtYXBzL2xldmVsM0ljb25fcG5nLmpzJztcclxuaW1wb3J0IGxldmVsNEljb25fcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvbGV2ZWw0SWNvbl9wbmcuanMnO1xyXG5pbXBvcnQgbGV2ZWw1SWNvbl9wbmcgZnJvbSAnLi4vLi4vLi4vbWlwbWFwcy9sZXZlbDVJY29uX3BuZy5qcyc7XHJcbmltcG9ydCBsZXZlbDZJY29uX3BuZyBmcm9tICcuLi8uLi8uLi9taXBtYXBzL2xldmVsNkljb25fcG5nLmpzJztcclxuaW1wb3J0IGFyZWFNb2RlbENvbW1vbiBmcm9tICcuLi8uLi9hcmVhTW9kZWxDb21tb24uanMnO1xyXG5pbXBvcnQgQXJlYU1vZGVsQ29tbW9uU3RyaW5ncyBmcm9tICcuLi8uLi9BcmVhTW9kZWxDb21tb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEFyZWFNb2RlbENvbW1vbkdsb2JhbHMgZnJvbSAnLi4vLi4vY29tbW9uL0FyZWFNb2RlbENvbW1vbkdsb2JhbHMuanMnO1xyXG5pbXBvcnQgVGVybSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvVGVybS5qcyc7XHJcbmltcG9ydCBBcmVhTW9kZWxDb21tb25Db2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQXJlYU1vZGVsQ29tbW9uQ29sb3JzLmpzJztcclxuaW1wb3J0IEdlbmVyaWNGYWN0b3JzTm9kZSBmcm9tICcuLi8uLi9nZW5lcmljL3ZpZXcvR2VuZXJpY0ZhY3RvcnNOb2RlLmpzJztcclxuaW1wb3J0IEVudHJ5IGZyb20gJy4uL21vZGVsL0VudHJ5LmpzJztcclxuaW1wb3J0IEVudHJ5RGlzcGxheVR5cGUgZnJvbSAnLi4vbW9kZWwvRW50cnlEaXNwbGF5VHlwZS5qcyc7XHJcbmltcG9ydCBHYW1lQXJlYURpc3BsYXkgZnJvbSAnLi4vbW9kZWwvR2FtZUFyZWFEaXNwbGF5LmpzJztcclxuaW1wb3J0IEdhbWVBcmVhTW9kZWwgZnJvbSAnLi4vbW9kZWwvR2FtZUFyZWFNb2RlbC5qcyc7XHJcbmltcG9ydCBHYW1lU3RhdGUgZnJvbSAnLi4vbW9kZWwvR2FtZVN0YXRlLmpzJztcclxuaW1wb3J0IEdhbWVBcmVhRGlzcGxheU5vZGUgZnJvbSAnLi9HYW1lQXJlYURpc3BsYXlOb2RlLmpzJztcclxuaW1wb3J0IEdhbWVBdWRpbyBmcm9tICcuL0dhbWVBdWRpby5qcyc7XHJcbmltcG9ydCBHYW1lRWRpdGFibGVMYWJlbE5vZGUgZnJvbSAnLi9HYW1lRWRpdGFibGVMYWJlbE5vZGUuanMnO1xyXG5pbXBvcnQgUG9seW5vbWlhbEVkaXROb2RlIGZyb20gJy4vUG9seW5vbWlhbEVkaXROb2RlLmpzJztcclxuXHJcbmNvbnN0IGNoZWNrU3RyaW5nID0gVmVnYXNTdHJpbmdzLmNoZWNrO1xyXG5jb25zdCBjaG9vc2VZb3VyTGV2ZWxTdHJpbmcgPSBWZWdhc1N0cmluZ3MuY2hvb3NlWW91ckxldmVsO1xyXG5jb25zdCBkaW1lbnNpb25zU3RyaW5nID0gQXJlYU1vZGVsQ29tbW9uU3RyaW5ncy5kaW1lbnNpb25zO1xyXG5jb25zdCBuZXh0U3RyaW5nID0gVmVnYXNTdHJpbmdzLm5leHQ7XHJcbmNvbnN0IHNob3dBbnN3ZXJTdHJpbmcgPSBWZWdhc1N0cmluZ3Muc2hvd0Fuc3dlcjtcclxuY29uc3QgdG90YWxBcmVhT2ZNb2RlbFN0cmluZyA9IEFyZWFNb2RlbENvbW1vblN0cmluZ3MudG90YWxBcmVhT2ZNb2RlbDtcclxuY29uc3QgdHJ5QWdhaW5TdHJpbmcgPSBWZWdhc1N0cmluZ3MudHJ5QWdhaW47XHJcblxyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IExFVkVMX0lDT05fSU1BR0VTID0gW1xyXG4gIGxldmVsMUljb25fcG5nLFxyXG4gIGxldmVsMkljb25fcG5nLFxyXG4gIGxldmVsM0ljb25fcG5nLFxyXG4gIGxldmVsNEljb25fcG5nLFxyXG4gIGxldmVsNUljb25fcG5nLFxyXG4gIGxldmVsNkljb25fcG5nXHJcbl07XHJcblxyXG5jbGFzcyBHYW1lQXJlYVNjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuICAvKipcclxuICAgKiBAZXh0ZW5kcyB7U2NyZWVuVmlld31cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7R2FtZUFyZWFNb2RlbH0gbW9kZWxcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtb2RlbCBpbnN0YW5jZW9mIEdhbWVBcmVhTW9kZWwgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtOb2RlfSAtIFRoZSBcImxlZnRcIiBoYWxmIG9mIHRoZSBzbGlkaW5nIGxheWVyLCBkaXNwbGF5ZWQgZmlyc3RcclxuICAgIHRoaXMubGV2ZWxTZWxlY3Rpb25MYXllciA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge05vZGV9IC0gVGhlIFwicmlnaHRcIiBoYWxmIG9mIHRoZSBzbGlkaW5nIGxheWVyLCB3aWxsIHNsaWRlIGludG8gdmlldyB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgYSBsZXZlbFxyXG4gICAgdGhpcy5jaGFsbGVuZ2VMYXllciA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0dhbWVBdWRpb30gLSBSZXNwb25zaWJsZSBmb3IgYWxsIGF1ZGlvXHJcbiAgICB0aGlzLmF1ZGlvID0gbmV3IEdhbWVBdWRpbyggbW9kZWwgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VHJhbnNpdGlvbk5vZGV9XHJcbiAgICB0aGlzLnRyYW5zaXRpb25Ob2RlID0gbmV3IFRyYW5zaXRpb25Ob2RlKCB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSwge1xyXG4gICAgICBjb250ZW50OiB0aGlzLmxldmVsU2VsZWN0aW9uTGF5ZXIsXHJcbiAgICAgIHVzZUJvdW5kc0NsaXA6IGZhbHNlLCAvLyBiZXR0ZXIgcGVyZm9ybWFuY2Ugd2l0aG91dCB0aGUgY2xpcHBpbmdcclxuICAgICAgY2FjaGVkTm9kZXM6IFsgdGhpcy5sZXZlbFNlbGVjdGlvbkxheWVyLCB0aGlzLmNoYWxsZW5nZUxheWVyIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMudHJhbnNpdGlvbk5vZGUgKTtcclxuICAgIG1vZGVsLmN1cnJlbnRMZXZlbFByb3BlcnR5LmxhenlMaW5rKCBsZXZlbCA9PiB7XHJcbiAgICAgIGlmICggbGV2ZWwgKSB7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uTm9kZS5zbGlkZUxlZnRUbyggdGhpcy5jaGFsbGVuZ2VMYXllciwge1xyXG4gICAgICAgICAgZHVyYXRpb246IDAuNCxcclxuICAgICAgICAgIHRhcmdldE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgZWFzaW5nOiBFYXNpbmcuUVVBRFJBVElDX0lOX09VVFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25Ob2RlLmRpc3NvbHZlVG8oIHRoaXMubGV2ZWxTZWxlY3Rpb25MYXllciwge1xyXG4gICAgICAgICAgZHVyYXRpb246IDAuNCxcclxuICAgICAgICAgIGdhbW1hOiAyLjIsXHJcbiAgICAgICAgICB0YXJnZXRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGVhc2luZzogRWFzaW5nLkxJTkVBUlxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGxldmVsSWNvbnMgPSBMRVZFTF9JQ09OX0lNQUdFUy5tYXAoIGljb25JbWFnZSA9PiBuZXcgSW1hZ2UoIGljb25JbWFnZSApICk7XHJcblxyXG4gICAgY29uc3QgYnV0dG9uU3BhY2luZyA9IDMwO1xyXG4gICAgY29uc3QgbGV2ZWxCdXR0b25zID0gbW9kZWwubGV2ZWxzLm1hcCggKCBsZXZlbCwgaW5kZXggKSA9PiBuZXcgTGV2ZWxTZWxlY3Rpb25CdXR0b24oXHJcbiAgICAgIGxldmVsSWNvbnNbIGluZGV4IF0sXHJcbiAgICAgIGxldmVsLnNjb3JlUHJvcGVydHksXHJcbiAgICAgIHtcclxuICAgICAgICBjcmVhdGVTY29yZURpc3BsYXk6IHNjb3JlUHJvcGVydHkgPT4gbmV3IFNjb3JlRGlzcGxheVN0YXJzKCBzY29yZVByb3BlcnR5LCB7XHJcbiAgICAgICAgICBudW1iZXJPZlN0YXJzOiBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuTlVNX0NIQUxMRU5HRVMsXHJcbiAgICAgICAgICBwZXJmZWN0U2NvcmU6IEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5QRVJGRUNUX1NDT1JFXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgICBtb2RlbC5zZWxlY3RMZXZlbCggbGV2ZWwgKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJhc2VDb2xvcjogbGV2ZWwuY29sb3JQcm9wZXJ0eSxcclxuICAgICAgICBzb3VuZFBsYXllckluZGV4OiBpbmRleFxyXG4gICAgICB9XHJcbiAgICApICk7XHJcblxyXG4gICAgdGhpcy5sZXZlbFNlbGVjdGlvbkxheWVyLmFkZENoaWxkKCBuZXcgVkJveCgge1xyXG4gICAgICBjaGlsZHJlbjogXy5jaHVuayggbGV2ZWxCdXR0b25zLCAzICkubWFwKCBjaGlsZHJlbiA9PiBuZXcgSEJveCgge1xyXG4gICAgICAgIGNoaWxkcmVuOiBjaGlsZHJlbixcclxuICAgICAgICBzcGFjaW5nOiBidXR0b25TcGFjaW5nXHJcbiAgICAgIH0gKSApLFxyXG4gICAgICBzcGFjaW5nOiBidXR0b25TcGFjaW5nLFxyXG4gICAgICBjZW50ZXI6IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclxyXG4gICAgfSApICk7XHJcblxyXG4gICAgdGhpcy5sZXZlbFNlbGVjdGlvbkxheWVyLmFkZENoaWxkKCBuZXcgVGV4dCggY2hvb3NlWW91ckxldmVsU3RyaW5nLCB7XHJcbiAgICAgIGNlbnRlclg6IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclgsXHJcbiAgICAgIGNlbnRlclk6ICggdGhpcy5sYXlvdXRCb3VuZHMudG9wICsgdGhpcy5sZXZlbFNlbGVjdGlvbkxheWVyLnRvcCApIC8gMixcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAzMCApXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBTdGF0dXMgYmFyXHJcbiAgICBsZXQgbGFzdEtub3duTGV2ZWwgPSBudWxsO1xyXG4gICAgLy8gQ3JlYXRlIGEgcHJvcGVydHkgdGhhdCBob2xkcyB0aGUgXCJsYXN0IGtub3duXCIgbGV2ZWwsIHNvIHRoYXQgd2UgZG9uJ3QgY2hhbmdlIHRoZSB2aWV3IHdoZW4gd2UgYXJlIHN3aXRjaGluZ1xyXG4gICAgLy8gYXdheSBmcm9tIHRoZSBjdXJyZW50IGxldmVsIGJhY2sgdG8gdGhlIGxldmVsIHNlbGVjdGlvbi5cclxuICAgIGNvbnN0IGxhc3RMZXZlbFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBtb2RlbC5jdXJyZW50TGV2ZWxQcm9wZXJ0eSBdLCBsZXZlbCA9PiB7XHJcbiAgICAgIGxldmVsID0gbGV2ZWwgfHwgbGFzdEtub3duTGV2ZWw7XHJcbiAgICAgIGxhc3RLbm93bkxldmVsID0gbGV2ZWw7XHJcbiAgICAgIHJldHVybiBsZXZlbDtcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHNjb3JlUHJvcGVydHkgPSBuZXcgRHluYW1pY1Byb3BlcnR5KCBsYXN0TGV2ZWxQcm9wZXJ0eSwge1xyXG4gICAgICBkZXJpdmU6ICdzY29yZVByb3BlcnR5J1xyXG4gICAgfSApO1xyXG4gICAgY29uc3Qgc3RhdHVzQmFyID0gbmV3IEZpbml0ZVN0YXR1c0JhciggdGhpcy5sYXlvdXRCb3VuZHMsIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LCBzY29yZVByb3BlcnR5LCB7XHJcbiAgICAgIGNoYWxsZW5nZUluZGV4UHJvcGVydHk6IG5ldyBEeW5hbWljUHJvcGVydHkoIGxhc3RMZXZlbFByb3BlcnR5LCB7XHJcbiAgICAgICAgZGVyaXZlOiAnY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eScsXHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiAxXHJcbiAgICAgIH0gKSxcclxuICAgICAgbnVtYmVyT2ZDaGFsbGVuZ2VzUHJvcGVydHk6IG5ldyBOdW1iZXJQcm9wZXJ0eSggQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLk5VTV9DSEFMTEVOR0VTICksXHJcbiAgICAgIGxldmVsUHJvcGVydHk6IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgbGFzdExldmVsUHJvcGVydHkgXSwgbGV2ZWwgPT4gbGV2ZWwgPyBsZXZlbC5udW1iZXIgOiAxICksXHJcbiAgICAgIGNyZWF0ZVNjb3JlRGlzcGxheTogc2NvcmVQcm9wZXJ0eSA9PiBuZXcgU2NvcmVEaXNwbGF5TGFiZWxlZFN0YXJzKCBzY29yZVByb3BlcnR5LCB7XHJcbiAgICAgICAgbnVtYmVyT2ZTdGFyczogQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLk5VTV9DSEFMTEVOR0VTLFxyXG4gICAgICAgIHBlcmZlY3RTY29yZTogQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLlBFUkZFQ1RfU0NPUkUsXHJcbiAgICAgICAgZm9udDogQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLkdBTUVfU1RBVFVTX0JBUl9OT05fQk9MRF9GT05UXHJcbiAgICAgIH0gKSxcclxuICAgICAgc3RhcnRPdmVyQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgICAvLyBSZXNldCB0aGUgbGV2ZWwgb24gXCJTdGFydCBPdmVyXCIsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXJlYS1tb2RlbC1jb21tb24vaXNzdWVzLzg3XHJcbiAgICAgICAgICBtb2RlbC5jdXJyZW50TGV2ZWxQcm9wZXJ0eS52YWx1ZS5zdGFydE92ZXIoKTtcclxuICAgICAgICAgIG1vZGVsLmN1cnJlbnRMZXZlbFByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGZvbnQ6IEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5HQU1FX1NUQVRVU19CQVJfTk9OX0JPTERfRk9OVCxcclxuICAgICAgbGV2ZWxUZXh0T3B0aW9uczoge1xyXG4gICAgICAgIGZvbnQ6IEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5HQU1FX1NUQVRVU19CQVJfQk9MRF9GT05UXHJcbiAgICAgIH0sXHJcbiAgICAgIGZsb2F0VG9Ub3A6IHRydWUsXHJcbiAgICAgIGJhckZpbGw6IG5ldyBEeW5hbWljUHJvcGVydHkoIGxhc3RMZXZlbFByb3BlcnR5LCB7XHJcbiAgICAgICAgZGVyaXZlOiAnY29sb3JQcm9wZXJ0eScsXHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiAnYmxhY2snXHJcbiAgICAgIH0gKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VMYXllci5hZGRDaGlsZCggc3RhdHVzQmFyICk7XHJcblxyXG4gICAgLy8gUHJvbXB0XHJcbiAgICBjb25zdCBwcm9tcHRUZXh0ID0gbmV3IFRleHQoICcgJywge1xyXG4gICAgICBmb250OiBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuR0FNRV9TVEFUVVNfQkFSX1BST01QVF9GT05ULFxyXG4gICAgICBwaWNrYWJsZTogZmFsc2UsXHJcbiAgICAgIG1heFdpZHRoOiA2MDAsXHJcbiAgICAgIHRvcDogdGhpcy5sYXlvdXRCb3VuZHMudG9wICsgc3RhdHVzQmFyLmhlaWdodCArIDIwXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLmFkZENoaWxkKCBwcm9tcHRUZXh0ICk7XHJcbiAgICBuZXcgRHluYW1pY1Byb3BlcnR5KCBtb2RlbC5jdXJyZW50TGV2ZWxQcm9wZXJ0eSwge1xyXG4gICAgICBkZXJpdmU6ICdjdXJyZW50Q2hhbGxlbmdlUHJvcGVydHknXHJcbiAgICB9ICkubGluayggY2hhbGxlbmdlID0+IHtcclxuICAgICAgLy8gQ291bGQgYmUgbnVsbFxyXG4gICAgICBpZiAoIGNoYWxsZW5nZSApIHtcclxuICAgICAgICBwcm9tcHRUZXh0LnN0cmluZyA9IGNoYWxsZW5nZS5kZXNjcmlwdGlvbi5nZXRQcm9tcHRTdHJpbmcoKTtcclxuICAgICAgICAvLyBDZW50ZXIgYXJvdW5kIHRoZSBhcmVhJ3MgY2VudGVyLlxyXG4gICAgICAgIHByb21wdFRleHQuY2VudGVyWCA9IHRoaXMubGF5b3V0Qm91bmRzLmxlZnQgKyBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuR0FNRV9BUkVBX09GRlNFVC54ICsgQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLkFSRUFfU0laRSAvIDI7XHJcbiAgICAgICAgLy8gRG9uJ3QgbGV0IGl0IGdvIG9mZiB0aGUgbGVmdCBzaWRlIG9mIHRoZSBzY3JlZW5cclxuICAgICAgICBwcm9tcHRUZXh0LmxlZnQgPSBNYXRoLm1heCggcHJvbXB0VGV4dC5sZWZ0LCB0aGlzLmxheW91dEJvdW5kcy5sZWZ0ICsgMjAgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFJlc2V0IEFsbCBidXR0b25cclxuICAgIGNvbnN0IHJlc2V0QWxsQnV0dG9uID0gbmV3IFJlc2V0QWxsQnV0dG9uKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgbW9kZWwucmVzZXQoKTtcclxuICAgICAgfSxcclxuICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLkxBWU9VVF9TUEFDSU5HLFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLmJvdHRvbSAtIEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5MQVlPVVRfU1BBQ0lOR1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5sZXZlbFNlbGVjdGlvbkxheWVyLmFkZENoaWxkKCByZXNldEFsbEJ1dHRvbiApO1xyXG5cclxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAgKiBBcmVhIGRpc3BsYXlcclxuICAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7R2FtZUFyZWFEaXNwbGF5fVxyXG4gICAgdGhpcy5hcmVhRGlzcGxheSA9IG5ldyBHYW1lQXJlYURpc3BsYXkoIG1vZGVsLmN1cnJlbnRDaGFsbGVuZ2VQcm9wZXJ0eSApO1xyXG5cclxuICAgIGNvbnN0IGdhbWVBcmVhTm9kZSA9IG5ldyBHYW1lQXJlYURpc3BsYXlOb2RlKCB0aGlzLmFyZWFEaXNwbGF5LCBtb2RlbC5hY3RpdmVFbnRyeVByb3BlcnR5LCBtb2RlbC5zdGF0ZVByb3BlcnR5LCB0ZXJtID0+IHtcclxuICAgICAgbW9kZWwuc2V0QWN0aXZlVGVybSggdGVybSApO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VMYXllci5hZGRDaGlsZCggZ2FtZUFyZWFOb2RlICk7XHJcbiAgICBnYW1lQXJlYU5vZGUudHJhbnNsYXRpb24gPSB0aGlzLmxheW91dEJvdW5kcy5sZWZ0VG9wLnBsdXMoIEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5HQU1FX0FSRUFfT0ZGU0VUICk7XHJcblxyXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICAqIFBhbmVsc1xyXG4gICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAgIGNvbnN0IHBhbmVsQWxpZ25Hcm91cCA9IEFyZWFNb2RlbENvbW1vbkdsb2JhbHMucGFuZWxBbGlnbkdyb3VwO1xyXG5cclxuICAgIGNvbnN0IGZhY3RvcnNOb2RlID0gbmV3IEdlbmVyaWNGYWN0b3JzTm9kZSggdGhpcy5hcmVhRGlzcGxheS50b3RhbFByb3BlcnRpZXMsIHRoaXMuYXJlYURpc3BsYXkuYWxsb3dFeHBvbmVudHNQcm9wZXJ0eSApO1xyXG4gICAgY29uc3QgZmFjdG9yc0NvbnRlbnQgPSB0aGlzLmNyZWF0ZVBhbmVsKCBkaW1lbnNpb25zU3RyaW5nLCBwYW5lbEFsaWduR3JvdXAsIGZhY3RvcnNOb2RlICk7XHJcblxyXG4gICAgLy8gSWYgd2UgaGF2ZSBhIHBvbHlub21pYWwsIGRvbid0IHVzZSB0aGlzIGVkaXRhYmxlIHByb3BlcnR5ICh1c2UgdGhlIHBvbHlub21pYWwgZWRpdG9yIGNvbXBvbmVudCBpbnN0ZWFkKVxyXG4gICAgY29uc3QgdG90YWxUZXJtRW50cnlQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5hcmVhRGlzcGxheS50b3RhbEVudHJpZXNQcm9wZXJ0eSBdLCB0b3RhbEVudHJpZXMgPT4gdG90YWxFbnRyaWVzLmxlbmd0aCA9PT0gMSA/IHRvdGFsRW50cmllc1sgMCBdIDogbmV3IEVudHJ5KCBudWxsICkgKTtcclxuXHJcbiAgICBjb25zdCB0b3RhbE5vZGUgPSBuZXcgR2FtZUVkaXRhYmxlTGFiZWxOb2RlKCB7XHJcbiAgICAgIGVudHJ5UHJvcGVydHk6IHRvdGFsVGVybUVudHJ5UHJvcGVydHksXHJcbiAgICAgIGdhbWVTdGF0ZVByb3BlcnR5OiBtb2RlbC5zdGF0ZVByb3BlcnR5LFxyXG4gICAgICBhY3RpdmVFbnRyeVByb3BlcnR5OiBtb2RlbC5hY3RpdmVFbnRyeVByb3BlcnR5LFxyXG4gICAgICBjb2xvclByb3BlcnR5OiBBcmVhTW9kZWxDb21tb25Db2xvcnMudG90YWxFZGl0YWJsZVByb3BlcnR5LFxyXG4gICAgICBhbGxvd0V4cG9uZW50c1Byb3BlcnR5OiB0aGlzLmFyZWFEaXNwbGF5LmFsbG93RXhwb25lbnRzUHJvcGVydHksXHJcbiAgICAgIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbi5IT1JJWk9OVEFMLFxyXG4gICAgICBsYWJlbEZvbnQ6IEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5HQU1FX1RPVEFMX0ZPTlQsXHJcbiAgICAgIGVkaXRGb250OiBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuR0FNRV9UT1RBTF9GT05UXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBwb2x5bm9taWFsRWRpdE5vZGUgPSBuZXcgUG9seW5vbWlhbEVkaXROb2RlKCB0aGlzLmFyZWFEaXNwbGF5LnRvdGFsUHJvcGVydHksIHRoaXMuYXJlYURpc3BsYXkudG90YWxFbnRyaWVzUHJvcGVydHksICgpID0+IHtcclxuICAgICAgaWYgKCBtb2RlbC5zdGF0ZVByb3BlcnR5LnZhbHVlID09PSBHYW1lU3RhdGUuV1JPTkdfRklSU1RfQU5TV0VSICkge1xyXG4gICAgICAgIG1vZGVsLnN0YXRlUHJvcGVydHkudmFsdWUgPSBHYW1lU3RhdGUuU0VDT05EX0FUVEVNUFQ7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHBvbHlub21pYWxSZWFkb3V0VGV4dCA9IG5ldyBSaWNoVGV4dCggJz8nLCB7XHJcbiAgICAgIGZvbnQ6IEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5UT1RBTF9BUkVBX0xBQkVMX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuUEFORUxfSU5URVJJT1JfTUFYXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFyZWFEaXNwbGF5LnRvdGFsUHJvcGVydHkubGluayggdG90YWwgPT4ge1xyXG4gICAgICBpZiAoIHRvdGFsICkge1xyXG4gICAgICAgIHBvbHlub21pYWxSZWFkb3V0VGV4dC5zdHJpbmcgPSB0b3RhbC50b1JpY2hTdHJpbmcoIGZhbHNlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCB0b3RhbENvbnRhaW5lciA9IG5ldyBOb2RlKCk7XHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbIHRoaXMuYXJlYURpc3BsYXkudG90YWxFbnRyaWVzUHJvcGVydHksIG1vZGVsLnN0YXRlUHJvcGVydHkgXSxcclxuICAgICAgKCB0b3RhbEVudHJpZXMsIGdhbWVTdGF0ZSApID0+IHtcclxuICAgICAgICBpZiAoIHRvdGFsRW50cmllcy5sZW5ndGggPiAxICkge1xyXG4gICAgICAgICAgaWYgKCB0b3RhbEVudHJpZXNbIDAgXS5kaXNwbGF5VHlwZSA9PT0gRW50cnlEaXNwbGF5VHlwZS5FRElUQUJMRSAmJlxyXG4gICAgICAgICAgICAgICBnYW1lU3RhdGUgIT09IEdhbWVTdGF0ZS5DT1JSRUNUX0FOU1dFUiAmJlxyXG4gICAgICAgICAgICAgICBnYW1lU3RhdGUgIT09IEdhbWVTdGF0ZS5TSE9XX1NPTFVUSU9OICkge1xyXG4gICAgICAgICAgICB0b3RhbENvbnRhaW5lci5jaGlsZHJlbiA9IFsgcG9seW5vbWlhbEVkaXROb2RlIF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdG90YWxDb250YWluZXIuY2hpbGRyZW4gPSBbIHBvbHlub21pYWxSZWFkb3V0VGV4dCBdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRvdGFsQ29udGFpbmVyLmNoaWxkcmVuID0gWyB0b3RhbE5vZGUgXTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBwcm9kdWN0Q29udGVudCA9IHRoaXMuY3JlYXRlUGFuZWwoIHRvdGFsQXJlYU9mTW9kZWxTdHJpbmcsIHBhbmVsQWxpZ25Hcm91cCwgdG90YWxDb250YWluZXIgKTtcclxuXHJcbiAgICBjb25zdCBwYW5lbEJveCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgZmFjdG9yc0NvbnRlbnQsXHJcbiAgICAgICAgcHJvZHVjdENvbnRlbnRcclxuICAgICAgXSxcclxuICAgICAgc3BhY2luZzogQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLkxBWU9VVF9TUEFDSU5HXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLmFkZENoaWxkKCBuZXcgQWxpZ25Cb3goIHBhbmVsQm94LCB7XHJcbiAgICAgIGFsaWduQm91bmRzOiB0aGlzLmxheW91dEJvdW5kcyxcclxuICAgICAgeEFsaWduOiAncmlnaHQnLFxyXG4gICAgICB5QWxpZ246ICd0b3AnLFxyXG4gICAgICB0b3BNYXJnaW46IGdhbWVBcmVhTm9kZS55LFxyXG4gICAgICByaWdodE1hcmdpbjogQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLkxBWU9VVF9TUEFDSU5HXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBnYW1lLXN0eWxlIGJ1dHRvbiB0aGF0IG1heSBiZSBlbmFibGVkIHZpYSBhIHByb3BlcnR5XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaXN0ZW5lciAtIFRoZSBjYWxsYmFjayBmb3Igd2hlbiB0aGUgYnV0dG9uIGlzIHByZXNzZWRcclxuICAgICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBbZW5hYmxlZFByb3BlcnR5XVxyXG4gICAgICovXHJcbiAgICBjb25zdCBjcmVhdGVHYW1lQnV0dG9uID0gKCBsYWJlbCwgbGlzdGVuZXIsIGVuYWJsZWRQcm9wZXJ0eSApID0+IHtcclxuICAgICAgY29uc3QgYnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xyXG4gICAgICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCBsYWJlbCwge1xyXG4gICAgICAgICAgZm9udDogQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLkJVVFRPTl9GT05ULFxyXG4gICAgICAgICAgbWF4V2lkdGg6IDIwMFxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDEwLFxyXG4gICAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMTAsXHJcbiAgICAgICAgbGlzdGVuZXI6IGxpc3RlbmVyLFxyXG4gICAgICAgIGJhc2VDb2xvcjogQXJlYU1vZGVsQ29tbW9uQ29sb3JzLmdhbWVCdXR0b25CYWNrZ3JvdW5kUHJvcGVydHksXHJcbiAgICAgICAgY2VudGVyWDogcGFuZWxCb3guY2VudGVyWCxcclxuICAgICAgICB0b3A6IHBhbmVsQm94LmJvdHRvbSArIDgwXHJcbiAgICAgIH0gKTtcclxuICAgICAgZW5hYmxlZFByb3BlcnR5ICYmIGVuYWJsZWRQcm9wZXJ0eS5saW5rKCBlbmFibGVkID0+IHtcclxuICAgICAgICBidXR0b24uZW5hYmxlZCA9IGVuYWJsZWQ7XHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5jaGFsbGVuZ2VMYXllci5hZGRDaGlsZCggYnV0dG9uICk7XHJcbiAgICAgIHJldHVybiBidXR0b247XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGNoZWNrQnV0dG9uID0gY3JlYXRlR2FtZUJ1dHRvbiggY2hlY2tTdHJpbmcsICgpID0+IHtcclxuICAgICAgbW9kZWwuY2hlY2soKTtcclxuICAgIH0sIG1vZGVsLmFsbG93Q2hlY2tpbmdQcm9wZXJ0eSApO1xyXG5cclxuICAgIGNvbnN0IHRyeUFnYWluQnV0dG9uID0gY3JlYXRlR2FtZUJ1dHRvbiggdHJ5QWdhaW5TdHJpbmcsICgpID0+IHtcclxuICAgICAgbW9kZWwudHJ5QWdhaW4oKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBuZXh0QnV0dG9uID0gY3JlYXRlR2FtZUJ1dHRvbiggbmV4dFN0cmluZywgKCkgPT4ge1xyXG4gICAgICBtb2RlbC5uZXh0KCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc2hvd0Fuc3dlckJ1dHRvbiA9IGNyZWF0ZUdhbWVCdXR0b24oIHNob3dBbnN3ZXJTdHJpbmcsICgpID0+IHtcclxuICAgICAgbW9kZWwuc2hvd0Fuc3dlcigpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGxldCBjaGVhdEJ1dHRvbiA9IG51bGw7XHJcblxyXG4gICAgLy8gQ2hlYXQgYnV0dG9uLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FyZWEtbW9kZWwtY29tbW9uL2lzc3Vlcy8xMTYgYW5kXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXJlYS1tb2RlbC1jb21tb24vaXNzdWVzLzE2M1xyXG4gICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnNob3dBbnN3ZXJzICkge1xyXG4gICAgICBjaGVhdEJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgICAgICBjb250ZW50OiBuZXcgRmFjZU5vZGUoIDQwICksXHJcbiAgICAgICAgdG9wOiBzaG93QW5zd2VyQnV0dG9uLmJvdHRvbSArIDEwLFxyXG4gICAgICAgIGNlbnRlclg6IHNob3dBbnN3ZXJCdXR0b24uY2VudGVyWCxcclxuICAgICAgICBsaXN0ZW5lcjogKCkgPT4gbW9kZWwuY2hlYXQoKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIGNoZWF0QnV0dG9uICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZmFjZVNjb3JlTm9kZSA9IG5ldyBGYWNlV2l0aFBvaW50c05vZGUoIHtcclxuICAgICAgZmFjZURpYW1ldGVyOiA5MCxcclxuICAgICAgcG9pbnRzQWxpZ25tZW50OiAncmlnaHRCb3R0b20nLFxyXG4gICAgICBwb2ludHNGb250OiBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuU0NPUkVfSU5DUkVBU0VfRk9OVCxcclxuICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgIGNlbnRlclg6IHNob3dBbnN3ZXJCdXR0b24uY2VudGVyWCwgLy8gYSBiaXQgdW5jbGVhbiwgc2luY2UgdGhlIHRleHQgaGFzbid0IGJlZW4gcG9zaXRpb25lZCB5ZXQuXHJcbiAgICAgIHRvcDogc2hvd0Fuc3dlckJ1dHRvbi5ib3R0b20gKyAxMFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VMYXllci5hZGRDaGlsZCggZmFjZVNjb3JlTm9kZSApO1xyXG5cclxuICAgIGNvbnN0IGxldmVsQ29tcGxldGVDb250YWluZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VMYXllci5hZGRDaGlsZCggbGV2ZWxDb21wbGV0ZUNvbnRhaW5lciApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtSZXdhcmROb2RlfG51bGx9IC0gV2UgbmVlZCB0byBzdGVwIGl0IHdoZW4gdGhlcmUgaXMgb25lXHJcbiAgICB0aGlzLnJld2FyZE5vZGUgPSBudWxsO1xyXG5cclxuICAgIGNvbnN0IHJld2FyZE5vZGVzID0gUmV3YXJkTm9kZS5jcmVhdGVSYW5kb21Ob2RlcyggW1xyXG4gICAgICBuZXcgRmFjZU5vZGUoIDQwLCB7IGhlYWRTdHJva2U6ICdibGFjaycsIGhlYWRMaW5lV2lkdGg6IDEuNSB9ICksXHJcbiAgICAgIG5ldyBTdGFyTm9kZSgpXHJcbiAgICBdLCAxMDAgKTtcclxuICAgIE9yaWVudGF0aW9uLmVudW1lcmF0aW9uLnZhbHVlcy5mb3JFYWNoKCBvcmllbnRhdGlvbiA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbG9yUHJvcGVydHkgPSBBcmVhTW9kZWxDb21tb25Db2xvcnMuZ2VuZXJpY0NvbG9yUHJvcGVydGllcy5nZXQoIG9yaWVudGF0aW9uICk7XHJcblxyXG4gICAgICBfLnJhbmdlKCAxLCAxMCApLmZvckVhY2goIGRpZ2l0ID0+IHtcclxuICAgICAgICBbIC0xLCAxIF0uZm9yRWFjaCggc2lnbiA9PiB7XHJcbiAgICAgICAgICBjb25zdCBwb3dlcnMgPSBtb2RlbC5oYXNFeHBvbmVudHMgPyBbIDAsIDEsIDIgXSA6IFsgMCwgMCwgMCBdO1xyXG4gICAgICAgICAgcG93ZXJzLmZvckVhY2goIHBvd2VyID0+IHtcclxuICAgICAgICAgICAgcmV3YXJkTm9kZXMucHVzaCggbmV3IFJpY2hUZXh0KCBuZXcgVGVybSggc2lnbiAqIGRpZ2l0LCBwb3dlciApLnRvUmljaFN0cmluZyggZmFsc2UgKSwge1xyXG4gICAgICAgICAgICAgIGZvbnQ6IEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5SRVdBUkRfTk9ERV9GT05ULFxyXG4gICAgICAgICAgICAgIGZpbGw6IGNvbG9yUHJvcGVydHlcclxuICAgICAgICAgICAgfSApICk7XHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgbGV0IGxldmVsQ29tcGxldGVkTm9kZSA9IG51bGw7XHJcblxyXG4gICAgbW9kZWwuc3RhdGVQcm9wZXJ0eS5saW5rKCAoIHN0YXRlLCBvbGRTdGF0ZSApID0+IHtcclxuICAgICAgLy8gV2hlbiB3ZSBzd2l0Y2ggYmFjayB0byBsZXZlbCBzZWxlY3Rpb24sIHRyeSB0byBsZWF2ZSB0aGluZ3MgYXMgdGhleSB3ZXJlLlxyXG4gICAgICBpZiAoIHN0YXRlICE9PSBudWxsICkge1xyXG4gICAgICAgIGdhbWVBcmVhTm9kZS52aXNpYmxlID0gc3RhdGUgIT09IEdhbWVTdGF0ZS5MRVZFTF9DT01QTEVURTtcclxuICAgICAgICBwYW5lbEJveC52aXNpYmxlID0gc3RhdGUgIT09IEdhbWVTdGF0ZS5MRVZFTF9DT01QTEVURTtcclxuICAgICAgICBzdGF0dXNCYXIudmlzaWJsZSA9IHN0YXRlICE9PSBHYW1lU3RhdGUuTEVWRUxfQ09NUExFVEU7XHJcbiAgICAgICAgcHJvbXB0VGV4dC52aXNpYmxlID0gc3RhdGUgIT09IEdhbWVTdGF0ZS5MRVZFTF9DT01QTEVURTtcclxuICAgICAgICBsZXZlbENvbXBsZXRlQ29udGFpbmVyLnZpc2libGUgPSBzdGF0ZSA9PT0gR2FtZVN0YXRlLkxFVkVMX0NPTVBMRVRFO1xyXG4gICAgICAgIGNoZWNrQnV0dG9uLnZpc2libGUgPSBzdGF0ZSA9PT0gR2FtZVN0YXRlLkZJUlNUX0FUVEVNUFQgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgPT09IEdhbWVTdGF0ZS5TRUNPTkRfQVRURU1QVDtcclxuICAgICAgICB0cnlBZ2FpbkJ1dHRvbi52aXNpYmxlID0gc3RhdGUgPT09IEdhbWVTdGF0ZS5XUk9OR19GSVJTVF9BTlNXRVI7XHJcbiAgICAgICAgbmV4dEJ1dHRvbi52aXNpYmxlID0gc3RhdGUgPT09IEdhbWVTdGF0ZS5DT1JSRUNUX0FOU1dFUiB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlID09PSBHYW1lU3RhdGUuU0hPV19TT0xVVElPTjtcclxuICAgICAgICBzaG93QW5zd2VyQnV0dG9uLnZpc2libGUgPSBzdGF0ZSA9PT0gR2FtZVN0YXRlLldST05HX1NFQ09ORF9BTlNXRVI7XHJcbiAgICAgICAgZmFjZVNjb3JlTm9kZS52aXNpYmxlID0gc3RhdGUgPT09IEdhbWVTdGF0ZS5DT1JSRUNUX0FOU1dFUiB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlID09PSBHYW1lU3RhdGUuV1JPTkdfRklSU1RfQU5TV0VSIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgPT09IEdhbWVTdGF0ZS5XUk9OR19TRUNPTkRfQU5TV0VSO1xyXG4gICAgICAgIGlmICggY2hlYXRCdXR0b24gKSB7XHJcbiAgICAgICAgICBjaGVhdEJ1dHRvbi52aXNpYmxlID0gc3RhdGUgPT09IEdhbWVTdGF0ZS5GSVJTVF9BVFRFTVBUIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgPT09IEdhbWVTdGF0ZS5TRUNPTkRfQVRURU1QVDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBzdGF0ZSA9PT0gR2FtZVN0YXRlLkNPUlJFQ1RfQU5TV0VSICkge1xyXG4gICAgICAgIGZhY2VTY29yZU5vZGUuc21pbGUoKTtcclxuICAgICAgICBmYWNlU2NvcmVOb2RlLnNldFBvaW50cyggb2xkU3RhdGUgPT09IEdhbWVTdGF0ZS5GSVJTVF9BVFRFTVBUID8gMiA6IDEgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggc3RhdGUgPT09IEdhbWVTdGF0ZS5XUk9OR19GSVJTVF9BTlNXRVIgfHwgc3RhdGUgPT09IEdhbWVTdGF0ZS5XUk9OR19TRUNPTkRfQU5TV0VSICkge1xyXG4gICAgICAgIGZhY2VTY29yZU5vZGUuZnJvd24oKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHN0YXRlID09PSBHYW1lU3RhdGUuTEVWRUxfQ09NUExFVEUgKSB7XHJcbiAgICAgICAgY29uc3QgbGV2ZWwgPSBtb2RlbC5jdXJyZW50TGV2ZWxQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgICAgbGV2ZWxDb21wbGV0ZWROb2RlICYmIGxldmVsQ29tcGxldGVkTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgICAgbGV2ZWxDb21wbGV0ZWROb2RlID0gbmV3IExldmVsQ29tcGxldGVkTm9kZShcclxuICAgICAgICAgIGxldmVsLm51bWJlcixcclxuICAgICAgICAgIGxldmVsLnNjb3JlUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgICBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuUEVSRkVDVF9TQ09SRSxcclxuICAgICAgICAgIEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5OVU1fQ0hBTExFTkdFUyxcclxuICAgICAgICAgIGZhbHNlLCAwLCAwLCAwLFxyXG4gICAgICAgICAgKCkgPT4gbW9kZWwubW92ZVRvTGV2ZWxTZWxlY3Rpb24oKSwge1xyXG4gICAgICAgICAgICBjb3JuZXJSYWRpdXM6IDgsXHJcbiAgICAgICAgICAgIGNlbnRlcjogdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyLFxyXG4gICAgICAgICAgICBmaWxsOiBsZXZlbC5jb2xvclByb3BlcnR5LFxyXG4gICAgICAgICAgICBjb250ZW50TWF4V2lkdGg6IDQwMFxyXG4gICAgICAgICAgfSApO1xyXG5cclxuICAgICAgICBsZXZlbENvbXBsZXRlQ29udGFpbmVyLmNoaWxkcmVuID0gW1xyXG4gICAgICAgICAgbGV2ZWxDb21wbGV0ZWROb2RlXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgaWYgKCBsZXZlbC5zY29yZVByb3BlcnR5LnZhbHVlID09PSBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuUEVSRkVDVF9TQ09SRSApIHtcclxuICAgICAgICAgIHRoaXMucmV3YXJkTm9kZSA9IG5ldyBSZXdhcmROb2RlKCB7XHJcbiAgICAgICAgICAgIG5vZGVzOiByZXdhcmROb2Rlc1xyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgICAgbGV2ZWxDb21wbGV0ZUNvbnRhaW5lci5pbnNlcnRDaGlsZCggMCwgdGhpcy5yZXdhcmROb2RlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICggdGhpcy5yZXdhcmROb2RlICkge1xyXG4gICAgICAgICAgdGhpcy5yZXdhcmROb2RlLmRldGFjaCgpO1xyXG4gICAgICAgICAgdGhpcy5yZXdhcmROb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgICAgIHRoaXMucmV3YXJkTm9kZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgcGFuZWwgaW50ZXJpb3Igd2l0aCB0aGUgdGl0bGUgbGVmdC1hbGlnbmVkLCBhbmQgdGhlIGNvbnRlbnQgc29tZXdoYXQgb2Zmc2V0IGZyb20gdGhlIGxlZnQgd2l0aCBhXHJcbiAgICogZ3VhcmFudGVlZCBtYXJnaW4uXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZVN0cmluZ1xyXG4gICAqIEBwYXJhbSB7QWxpZ25Hcm91cH0gcGFuZWxBbGlnbkdyb3VwXHJcbiAgICogQHBhcmFtIHtOb2RlfSBjb250ZW50XHJcbiAgICovXHJcbiAgY3JlYXRlUGFuZWwoIHRpdGxlU3RyaW5nLCBwYW5lbEFsaWduR3JvdXAsIGNvbnRlbnQgKSB7XHJcbiAgICBjb25zdCBwYW5lbENvbnRlbnQgPSBuZXcgVkJveCgge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBBbGlnbkJveCggbmV3IFRleHQoIHRpdGxlU3RyaW5nLCB7XHJcbiAgICAgICAgICBmb250OiBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuVElUTEVfRk9OVCxcclxuICAgICAgICAgIG1heFdpZHRoOiBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuUEFORUxfSU5URVJJT1JfTUFYXHJcbiAgICAgICAgfSApLCB7XHJcbiAgICAgICAgICBncm91cDogcGFuZWxBbGlnbkdyb3VwLFxyXG4gICAgICAgICAgeEFsaWduOiAnbGVmdCdcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgbmV3IEFsaWduQm94KCBjb250ZW50LCB7XHJcbiAgICAgICAgICBncm91cDogcGFuZWxBbGlnbkdyb3VwLFxyXG4gICAgICAgICAgeEFsaWduOiAnY2VudGVyJ1xyXG4gICAgICAgIH0gKVxyXG4gICAgICBdLFxyXG4gICAgICBzcGFjaW5nOiAxMFxyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIG5ldyBQYW5lbCggcGFuZWxDb250ZW50LCB7XHJcbiAgICAgIHhNYXJnaW46IDE1LFxyXG4gICAgICB5TWFyZ2luOiAxMCxcclxuICAgICAgZmlsbDogQXJlYU1vZGVsQ29tbW9uQ29sb3JzLnBhbmVsQmFja2dyb3VuZFByb3BlcnR5LFxyXG4gICAgICBzdHJva2U6IEFyZWFNb2RlbENvbW1vbkNvbG9ycy5wYW5lbEJvcmRlclByb3BlcnR5LFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5QQU5FTF9DT1JORVJfUkFESVVTXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwcyBmb3J3YXJkIGluIHRpbWUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25Ob2RlLnN0ZXAoIGR0ICk7XHJcblxyXG4gICAgdGhpcy5yZXdhcmROb2RlICYmIHRoaXMucmV3YXJkTm9kZS5zdGVwKCBkdCApO1xyXG4gIH1cclxufVxyXG5cclxuYXJlYU1vZGVsQ29tbW9uLnJlZ2lzdGVyKCAnR2FtZUFyZWFTY3JlZW5WaWV3JywgR2FtZUFyZWFTY3JlZW5WaWV3ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHYW1lQXJlYVNjcmVlblZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLFVBQVUsTUFBTSxvQ0FBb0M7QUFDM0QsT0FBT0MsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxjQUFjLE1BQU0sdURBQXVEO0FBQ2xGLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0Msa0JBQWtCLE1BQU0sbURBQW1EO0FBQ2xGLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxRQUFRLEVBQUVDLElBQUksRUFBRUMsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLFFBQVEsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3JHLE9BQU9DLHFCQUFxQixNQUFN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