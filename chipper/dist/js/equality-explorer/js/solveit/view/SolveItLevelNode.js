// Copyright 2018-2023, University of Colorado Boulder

/**
 * SolveItLevelNode displays a level of the 'Solve It!' game screen. This shares several UI components with the
 * Operations screen, but there are too many differences to extend OperationsSceneNode.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Node, RichText, Text } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import InfiniteStatusBar from '../../../../vegas/js/InfiniteStatusBar.js';
import RewardDialog from '../../../../vegas/js/RewardDialog.js';
import EqualityExplorerConstants from '../../common/EqualityExplorerConstants.js';
import BalanceScaleNode from '../../common/view/BalanceScaleNode.js';
import EqualityExplorerSceneNode from '../../common/view/EqualityExplorerSceneNode.js';
import EquationPanel from '../../common/view/EquationPanel.js';
import SnapshotsAccordionBox from '../../common/view/SnapshotsAccordionBox.js';
import UniversalOperationControl from '../../common/view/UniversalOperationControl.js';
import equalityExplorer from '../../equalityExplorer.js';
import EqualityExplorerStrings from '../../EqualityExplorerStrings.js';
import ChallengeDerivationText from './ChallengeDerivationText.js';
import SolveItRewardNode from './SolveItRewardNode.js';
import SumToZeroNode from '../../common/view/SumToZeroNode.js';
import Range from '../../../../dot/js/Range.js';
import SolveForXText from './SolveForXText.js';

// constants
const LEVEL_FONT = new PhetFont(20);
const NEXT_BUTTON_FONT = new PhetFont(30);
const EQUATION_PANEL_OPTIONS = {
  contentWidth: 360,
  xMargin: 10,
  yMargin: 0
};
export default class SolveItLevelNode extends EqualityExplorerSceneNode {
  // animation that fades out the smiley face

  // reward shown while rewardDialog is open

  // control for applying a universal operation to the terms that are on the scale

  constructor(level, levelProperty, rewardScoreProperty, layoutBounds, visibleBoundsProperty, snapshotsAccordionBoxExpandedProperty, gameAudioPlayer, providedOptions) {
    const options = optionize()({
      // empty optionize because we're setting options.children below
    }, providedOptions);
    const statusBarTandem = options.tandem.createTandem('statusBar');

    // Level description, displayed in the status bar
    const levelDescriptionText = new RichText(level.descriptionProperty, {
      font: LEVEL_FONT,
      maxWidth: 650,
      // determined empirically
      tandem: statusBarTandem.createTandem('levelDescriptionText')
    });
    const backButtonListener = () => {
      universalOperationControl.stopAnimations(); // stop any operations that are in progress
      levelProperty.value = null; // back to the SettingsNode, where no level is selected
    };

    // Bar across the top of the screen
    const statusBar = new InfiniteStatusBar(layoutBounds, visibleBoundsProperty, levelDescriptionText, level.scoreProperty, {
      floatToTop: true,
      // see https://github.com/phetsims/equality-explorer/issues/144
      spacing: 20,
      barFill: 'rgb( 252, 150, 152 )',
      backButtonListener: backButtonListener,
      tandem: statusBarTandem,
      phetioVisiblePropertyInstrumented: false
    });

    // Equation for the challenge
    const challengeEquationNode = new EquationPanel(level.leftTermCreators, level.rightTermCreators, combineOptions({}, EQUATION_PANEL_OPTIONS, {
      fill: Color.WHITE.withAlpha(0.5),
      stroke: Color.BLACK.withAlpha(0.5),
      equationNodeOptions: {
        relationalOperatorFontWeight: 'normal',
        updateEnabled: false // static equation, to display the challenge
      },

      centerX: level.scale.position.x,
      top: statusBar.bottom + 15,
      tandem: options.tandem.createTandem('challengeEquationNode'),
      phetioDocumentation: 'Displays the equation for the current game challenge.'
    }));

    // Equation that reflects what is currently on the balance scale
    const balanceScaleEquationNode = new EquationPanel(level.leftTermCreators, level.rightTermCreators, combineOptions({}, EQUATION_PANEL_OPTIONS, {
      fill: 'white',
      stroke: 'black',
      equationNodeOptions: {
        relationalOperatorFontWeight: 'normal'
      },
      centerX: challengeEquationNode.centerX,
      top: challengeEquationNode.bottom + 10,
      tandem: options.tandem.createTandem('balanceScaleEquationNode'),
      phetioDocumentation: 'Displays the equation that matches what is currently on the balance scale.'
    }));

    // Layer when universal operation animation occurs
    const operationAnimationLayer = new Node();

    // Universal Operation control
    const universalOperationControl = new UniversalOperationControl(level, operationAnimationLayer, {
      timesZeroEnabled: false,
      // disable multiplication by zero, see phetsims/equality-explorer#72
      tandem: options.tandem.createTandem('universalOperationControl')
    });
    universalOperationControl.boundsProperty.link(bounds => {
      universalOperationControl.centerX = level.scale.position.x; // centered on the scale
      universalOperationControl.top = balanceScaleEquationNode.bottom + 15;
    });

    // 'Solve for x'
    const solveForXText = new SolveForXText({
      font: new PhetFont({
        size: 24,
        weight: 'bold'
      }),
      maxWidth: challengeEquationNode.left - layoutBounds.minX - EqualityExplorerConstants.SCREEN_VIEW_X_MARGIN,
      tandem: options.tandem.createTandem('solveForXText')
    });

    // To the left of the challenge equation
    solveForXText.boundsProperty.link(bounds => {
      solveForXText.right = challengeEquationNode.left - 10;
      solveForXText.centerY = challengeEquationNode.centerY;
    });

    // Scale
    const balanceScaleNode = new BalanceScaleNode(level.scale, {
      clearScaleButtonVisible: false,
      organizeButtonVisible: false,
      disposeTermsNotOnScale: level.disposeTermsNotOnScale.bind(level)
      // No PhET-iO instrumentation is desired..
    });

    // Snapshots
    const snapshotsAccordionBox = new SnapshotsAccordionBox(level, {
      fixedWidth: layoutBounds.right - balanceScaleNode.right - EqualityExplorerConstants.SCREEN_VIEW_X_MARGIN - 15,
      expandedProperty: snapshotsAccordionBoxExpandedProperty,
      right: layoutBounds.right - EqualityExplorerConstants.SCREEN_VIEW_X_MARGIN,
      top: statusBar.bottom + 20,
      tandem: options.tandem.createTandem('snapshotsAccordionBox')
    });

    // Refresh button, generates a new challenge, effectively skipping the current challenge
    const refreshButton = new RefreshButton({
      iconHeight: 23,
      xMargin: 14,
      yMargin: 7,
      left: challengeEquationNode.right + 10,
      centerY: challengeEquationNode.centerY,
      listener: () => {
        phet.log && phet.log('Refresh button pressed');
        level.nextChallenge();
      },
      tandem: options.tandem.createTandem('refreshButton'),
      phetioDocumentation: 'Pressing this button generates a new challenge.'
    });

    // Next button, takes us to the next challenge
    const nextButton = new RectangularPushButton({
      content: new Text(EqualityExplorerStrings.nextStringProperty, {
        font: NEXT_BUTTON_FONT,
        maxWidth: 100 // determined empirically
      }),

      baseColor: PhetColorScheme.BUTTON_YELLOW,
      xMargin: 12,
      yMargin: 8,
      centerX: level.scale.position.x,
      top: universalOperationControl.bottom + 30,
      // determined empirically
      listener: () => {
        phet.log && phet.log('Next button pressed');
        level.nextChallenge();
      },
      tandem: options.tandem.createTandem('nextButton'),
      phetioDocumentation: 'This button appears when the current challenge has been solved. Pressing it advances to a new challenge.',
      visiblePropertyOptions: {
        phetioReadOnly: true
      } // so that PhET-iO client can see whether its visible
    });

    // Smiley face, displayed when the challenge has been solved
    const faceNode = new FaceNode(225, {
      centerX: balanceScaleNode.centerX,
      top: universalOperationControl.bottom + 25,
      tandem: options.tandem.createTandem('faceNode'),
      visiblePropertyOptions: {
        phetioReadOnly: true
      } // so that PhET-iO client can see whether its visible
    });

    // Animated opacity of smiley face.
    const faceOpacityProperty = new NumberProperty(faceNode.opacity, {
      //TODO https://github.com/phetsims/equality-explorer/issues/197 stateful animation?
      range: new Range(0, 1)
    });
    faceOpacityProperty.link(faceOpacity => {
      faceNode.opacity = faceOpacity;
    });

    // terms live in this layer
    const termsLayer = new Node({
      pickable: false // terms are not interactive, all interaction is with the universal operation control
    });

    const children = [statusBar, challengeEquationNode, solveForXText, balanceScaleEquationNode, balanceScaleNode, snapshotsAccordionBox, refreshButton, nextButton, universalOperationControl, termsLayer,
    // terms in from of all of the above
    operationAnimationLayer,
    // operations in front of terms
    faceNode // face in front of everything
    ];

    // Show Answer button, for debugging.
    // Note that this is conditional, so is not (and should be) instrumented for PhET-iO.
    let showAnswerButton;
    if (phet.chipper.queryParameters.showAnswers) {
      // shows how the current challenge was derived
      children.push(new ChallengeDerivationText(level.challengeProperty, {
        left: snapshotsAccordionBox.left,
        top: snapshotsAccordionBox.bottom + 5
      }));

      // button that takes you directly to the answer. debug only, i18n not needed.
      showAnswerButton = new RectangularPushButton({
        content: new Text('Show Answer', {
          font: new PhetFont(16),
          fill: 'white'
        }),
        baseColor: 'red',
        centerX: balanceScaleNode.centerX,
        bottom: balanceScaleNode.bottom - 5,
        listener: () => level.showAnswer()
      });
      children.push(showAnswerButton);
    }
    assert && assert(!options.children, 'SolveItLevelNode sets children');
    options.children = children;
    super(level, snapshotsAccordionBox, termsLayer, options);
    this.universalOperationControl = universalOperationControl;
    this.faceAnimation = null;
    this.rewardNode = null;

    // Reused each time the
    const rewardDialog = new RewardDialog(level.scoreProperty, {
      // Display the dialog in a position that does not obscure the challenge solution.
      // See https://github.com/phetsims/equality-explorer/issues/104
      layoutStrategy: (dialog, simBounds, screenBounds, scale) => {
        // center horizontally on the screen
        const dialogLayoutBounds = dialog.layoutBounds;
        assert && assert(dialogLayoutBounds);
        dialog.centerX = dialogLayoutBounds.centerX;

        // top of dialog below balanceScaleEquationNode, so the solution is not obscured
        dialog.top = balanceScaleEquationNode.bottom + 10;
      },
      // 'Keep Going' hides the dialog
      keepGoingButtonListener: () => rewardDialog.hide(),
      // 'New Level' has the same effect as the back button in the status bar
      newLevelButtonListener: () => {
        rewardDialog.hide();
        backButtonListener();
      },
      // When the dialog is shown, show the reward
      showCallback: () => {
        assert && assert(!this.rewardNode, 'rewardNode is not supposed to exist');
        this.rewardNode = new SolveItRewardNode(level.levelNumber); //TODO https://github.com/phetsims/equality-explorer/issues/197 stateful animation?
        this.addChild(this.rewardNode);
      },
      // When the dialog is hidden, dispose of the reward
      hideCallback: () => {
        const rewardNode = this.rewardNode;
        assert && assert(rewardNode, 'rewardNode is supposed to exist');
        this.removeChild(rewardNode);
        rewardNode.dispose();
        this.rewardNode = null;
      }
    });
    level.scoreProperty.lazyLink((score, oldScore) => {
      // do nothing when the score is reset
      if (score < oldScore) {
        return;
      }
      refreshButton.visible = false;
      showAnswerButton && (showAnswerButton.visible = false);

      // When the score reaches a magic number, display the reward.
      if (score === rewardScoreProperty.value) {
        gameAudioPlayer.gameOverPerfectScore();
        nextButton.visible = true;

        // show the reward dialog
        rewardDialog.show();
      } else {
        // ding!
        gameAudioPlayer.correctAnswer();

        // Show smiley face, fade it out, then show the Next button.
        faceOpacityProperty.value = 0.8;
        faceNode.visible = true;
        this.faceAnimation = new Animation({
          //TODO https://github.com/phetsims/equality-explorer/issues/197 stateful animation?
          stepEmitter: null,
          // via step function
          delay: 1,
          duration: 0.8,
          targets: [{
            property: faceOpacityProperty,
            easing: Easing.LINEAR,
            to: 0
          }]
        });
        this.faceAnimation.finishEmitter.addListener(() => {
          faceNode.visible = false;
          nextButton.visible = true;
          this.faceAnimation = null;
        });
        this.faceAnimation.start();
      }
    });

    // When the challenge changes...
    level.challengeProperty.link(challenge => {
      // cancel operation animations
      this.universalOperationControl.reset();

      // Because we created challengeEquationNode with updateEnabled: false, the equation does not automatically
      // synchronize with what's on the balance scale, and we need to explicitly request an update.
      challengeEquationNode.updateEquation();

      // visibility of other UI elements
      refreshButton.visible = true;
      nextButton.visible = false;
      faceNode.visible = false;
      showAnswerButton && (showAnswerButton.visible = true);
    });

    // Perform sum-to-zero animation for any terms that became zero as the result of a universal operation.
    level.sumToZeroEmitter.addListener(termCreators => SumToZeroNode.animateSumToZero(termCreators, this.termsLayer));
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  reset() {
    this.universalOperationControl.reset();
    super.reset();
  }

  /**
   * @param dt - elapsed time, in seconds
   */
  step(dt) {
    this.universalOperationControl.step(dt);
    this.faceAnimation && this.faceAnimation.step(dt);
    this.rewardNode && this.rewardNode.step(dt);
    super.step(dt);
  }
}
equalityExplorer.register('SolveItLevelNode', SolveItLevelNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiUmVmcmVzaEJ1dHRvbiIsIkZhY2VOb2RlIiwiUGhldENvbG9yU2NoZW1lIiwiUGhldEZvbnQiLCJDb2xvciIsIk5vZGUiLCJSaWNoVGV4dCIsIlRleHQiLCJSZWN0YW5ndWxhclB1c2hCdXR0b24iLCJBbmltYXRpb24iLCJFYXNpbmciLCJJbmZpbml0ZVN0YXR1c0JhciIsIlJld2FyZERpYWxvZyIsIkVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMiLCJCYWxhbmNlU2NhbGVOb2RlIiwiRXF1YWxpdHlFeHBsb3JlclNjZW5lTm9kZSIsIkVxdWF0aW9uUGFuZWwiLCJTbmFwc2hvdHNBY2NvcmRpb25Cb3giLCJVbml2ZXJzYWxPcGVyYXRpb25Db250cm9sIiwiZXF1YWxpdHlFeHBsb3JlciIsIkVxdWFsaXR5RXhwbG9yZXJTdHJpbmdzIiwiQ2hhbGxlbmdlRGVyaXZhdGlvblRleHQiLCJTb2x2ZUl0UmV3YXJkTm9kZSIsIlN1bVRvWmVyb05vZGUiLCJSYW5nZSIsIlNvbHZlRm9yWFRleHQiLCJMRVZFTF9GT05UIiwiTkVYVF9CVVRUT05fRk9OVCIsIkVRVUFUSU9OX1BBTkVMX09QVElPTlMiLCJjb250ZW50V2lkdGgiLCJ4TWFyZ2luIiwieU1hcmdpbiIsIlNvbHZlSXRMZXZlbE5vZGUiLCJjb25zdHJ1Y3RvciIsImxldmVsIiwibGV2ZWxQcm9wZXJ0eSIsInJld2FyZFNjb3JlUHJvcGVydHkiLCJsYXlvdXRCb3VuZHMiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJzbmFwc2hvdHNBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5IiwiZ2FtZUF1ZGlvUGxheWVyIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInN0YXR1c0JhclRhbmRlbSIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImxldmVsRGVzY3JpcHRpb25UZXh0IiwiZGVzY3JpcHRpb25Qcm9wZXJ0eSIsImZvbnQiLCJtYXhXaWR0aCIsImJhY2tCdXR0b25MaXN0ZW5lciIsInVuaXZlcnNhbE9wZXJhdGlvbkNvbnRyb2wiLCJzdG9wQW5pbWF0aW9ucyIsInZhbHVlIiwic3RhdHVzQmFyIiwic2NvcmVQcm9wZXJ0eSIsImZsb2F0VG9Ub3AiLCJzcGFjaW5nIiwiYmFyRmlsbCIsInBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCIsImNoYWxsZW5nZUVxdWF0aW9uTm9kZSIsImxlZnRUZXJtQ3JlYXRvcnMiLCJyaWdodFRlcm1DcmVhdG9ycyIsImZpbGwiLCJXSElURSIsIndpdGhBbHBoYSIsInN0cm9rZSIsIkJMQUNLIiwiZXF1YXRpb25Ob2RlT3B0aW9ucyIsInJlbGF0aW9uYWxPcGVyYXRvckZvbnRXZWlnaHQiLCJ1cGRhdGVFbmFibGVkIiwiY2VudGVyWCIsInNjYWxlIiwicG9zaXRpb24iLCJ4IiwidG9wIiwiYm90dG9tIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImJhbGFuY2VTY2FsZUVxdWF0aW9uTm9kZSIsIm9wZXJhdGlvbkFuaW1hdGlvbkxheWVyIiwidGltZXNaZXJvRW5hYmxlZCIsImJvdW5kc1Byb3BlcnR5IiwibGluayIsImJvdW5kcyIsInNvbHZlRm9yWFRleHQiLCJzaXplIiwid2VpZ2h0IiwibGVmdCIsIm1pblgiLCJTQ1JFRU5fVklFV19YX01BUkdJTiIsInJpZ2h0IiwiY2VudGVyWSIsImJhbGFuY2VTY2FsZU5vZGUiLCJjbGVhclNjYWxlQnV0dG9uVmlzaWJsZSIsIm9yZ2FuaXplQnV0dG9uVmlzaWJsZSIsImRpc3Bvc2VUZXJtc05vdE9uU2NhbGUiLCJiaW5kIiwic25hcHNob3RzQWNjb3JkaW9uQm94IiwiZml4ZWRXaWR0aCIsImV4cGFuZGVkUHJvcGVydHkiLCJyZWZyZXNoQnV0dG9uIiwiaWNvbkhlaWdodCIsImxpc3RlbmVyIiwicGhldCIsImxvZyIsIm5leHRDaGFsbGVuZ2UiLCJuZXh0QnV0dG9uIiwiY29udGVudCIsIm5leHRTdHJpbmdQcm9wZXJ0eSIsImJhc2VDb2xvciIsIkJVVFRPTl9ZRUxMT1ciLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvUmVhZE9ubHkiLCJmYWNlTm9kZSIsImZhY2VPcGFjaXR5UHJvcGVydHkiLCJvcGFjaXR5IiwicmFuZ2UiLCJmYWNlT3BhY2l0eSIsInRlcm1zTGF5ZXIiLCJwaWNrYWJsZSIsImNoaWxkcmVuIiwic2hvd0Fuc3dlckJ1dHRvbiIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJzaG93QW5zd2VycyIsInB1c2giLCJjaGFsbGVuZ2VQcm9wZXJ0eSIsInNob3dBbnN3ZXIiLCJhc3NlcnQiLCJmYWNlQW5pbWF0aW9uIiwicmV3YXJkTm9kZSIsInJld2FyZERpYWxvZyIsImxheW91dFN0cmF0ZWd5IiwiZGlhbG9nIiwic2ltQm91bmRzIiwic2NyZWVuQm91bmRzIiwiZGlhbG9nTGF5b3V0Qm91bmRzIiwia2VlcEdvaW5nQnV0dG9uTGlzdGVuZXIiLCJoaWRlIiwibmV3TGV2ZWxCdXR0b25MaXN0ZW5lciIsInNob3dDYWxsYmFjayIsImxldmVsTnVtYmVyIiwiYWRkQ2hpbGQiLCJoaWRlQ2FsbGJhY2siLCJyZW1vdmVDaGlsZCIsImRpc3Bvc2UiLCJsYXp5TGluayIsInNjb3JlIiwib2xkU2NvcmUiLCJ2aXNpYmxlIiwiZ2FtZU92ZXJQZXJmZWN0U2NvcmUiLCJzaG93IiwiY29ycmVjdEFuc3dlciIsInN0ZXBFbWl0dGVyIiwiZGVsYXkiLCJkdXJhdGlvbiIsInRhcmdldHMiLCJwcm9wZXJ0eSIsImVhc2luZyIsIkxJTkVBUiIsInRvIiwiZmluaXNoRW1pdHRlciIsImFkZExpc3RlbmVyIiwic3RhcnQiLCJjaGFsbGVuZ2UiLCJyZXNldCIsInVwZGF0ZUVxdWF0aW9uIiwic3VtVG9aZXJvRW1pdHRlciIsInRlcm1DcmVhdG9ycyIsImFuaW1hdGVTdW1Ub1plcm8iLCJzdGVwIiwiZHQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNvbHZlSXRMZXZlbE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU29sdmVJdExldmVsTm9kZSBkaXNwbGF5cyBhIGxldmVsIG9mIHRoZSAnU29sdmUgSXQhJyBnYW1lIHNjcmVlbi4gVGhpcyBzaGFyZXMgc2V2ZXJhbCBVSSBjb21wb25lbnRzIHdpdGggdGhlXHJcbiAqIE9wZXJhdGlvbnMgc2NyZWVuLCBidXQgdGhlcmUgYXJlIHRvbyBtYW55IGRpZmZlcmVuY2VzIHRvIGV4dGVuZCBPcGVyYXRpb25zU2NlbmVOb2RlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUmVmcmVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZWZyZXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IEZhY2VOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9GYWNlTm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgTm9kZSwgUmljaFRleHQsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBBbmltYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvQW5pbWF0aW9uLmpzJztcclxuaW1wb3J0IEVhc2luZyBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9FYXNpbmcuanMnO1xyXG5pbXBvcnQgR2FtZUF1ZGlvUGxheWVyIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0dhbWVBdWRpb1BsYXllci5qcyc7XHJcbmltcG9ydCBJbmZpbml0ZVN0YXR1c0JhciBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9JbmZpbml0ZVN0YXR1c0Jhci5qcyc7XHJcbmltcG9ydCBSZXdhcmREaWFsb2cgZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvUmV3YXJkRGlhbG9nLmpzJztcclxuaW1wb3J0IEVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0VxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQmFsYW5jZVNjYWxlTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9CYWxhbmNlU2NhbGVOb2RlLmpzJztcclxuaW1wb3J0IEVxdWFsaXR5RXhwbG9yZXJTY2VuZU5vZGUsIHsgRXF1YWxpdHlFeHBsb3JlclNjZW5lTm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9FcXVhbGl0eUV4cGxvcmVyU2NlbmVOb2RlLmpzJztcclxuaW1wb3J0IEVxdWF0aW9uUGFuZWwsIHsgRXF1YXRpb25QYW5lbE9wdGlvbnMgfSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9FcXVhdGlvblBhbmVsLmpzJztcclxuaW1wb3J0IFNuYXBzaG90c0FjY29yZGlvbkJveCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9TbmFwc2hvdHNBY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgVW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Vbml2ZXJzYWxPcGVyYXRpb25Db250cm9sLmpzJztcclxuaW1wb3J0IGVxdWFsaXR5RXhwbG9yZXIgZnJvbSAnLi4vLi4vZXF1YWxpdHlFeHBsb3Jlci5qcyc7XHJcbmltcG9ydCBFcXVhbGl0eUV4cGxvcmVyU3RyaW5ncyBmcm9tICcuLi8uLi9FcXVhbGl0eUV4cGxvcmVyU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBTb2x2ZUl0TGV2ZWwgZnJvbSAnLi4vbW9kZWwvU29sdmVJdExldmVsLmpzJztcclxuaW1wb3J0IENoYWxsZW5nZURlcml2YXRpb25UZXh0IGZyb20gJy4vQ2hhbGxlbmdlRGVyaXZhdGlvblRleHQuanMnO1xyXG5pbXBvcnQgU29sdmVJdFJld2FyZE5vZGUgZnJvbSAnLi9Tb2x2ZUl0UmV3YXJkTm9kZS5qcyc7XHJcbmltcG9ydCBTdW1Ub1plcm9Ob2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1N1bVRvWmVyb05vZGUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFNvbHZlRm9yWFRleHQgZnJvbSAnLi9Tb2x2ZUZvclhUZXh0LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBMRVZFTF9GT05UID0gbmV3IFBoZXRGb250KCAyMCApO1xyXG5jb25zdCBORVhUX0JVVFRPTl9GT05UID0gbmV3IFBoZXRGb250KCAzMCApO1xyXG5jb25zdCBFUVVBVElPTl9QQU5FTF9PUFRJT05TID0ge1xyXG4gIGNvbnRlbnRXaWR0aDogMzYwLFxyXG4gIHhNYXJnaW46IDEwLFxyXG4gIHlNYXJnaW46IDBcclxufTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBTb2x2ZUl0TGV2ZWxOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICZcclxuICBQaWNrUmVxdWlyZWQ8RXF1YWxpdHlFeHBsb3JlclNjZW5lTm9kZU9wdGlvbnMsICd0YW5kZW0nIHwgJ3Zpc2libGVQcm9wZXJ0eSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU29sdmVJdExldmVsTm9kZSBleHRlbmRzIEVxdWFsaXR5RXhwbG9yZXJTY2VuZU5vZGUge1xyXG5cclxuICAvLyBhbmltYXRpb24gdGhhdCBmYWRlcyBvdXQgdGhlIHNtaWxleSBmYWNlXHJcbiAgcHJpdmF0ZSBmYWNlQW5pbWF0aW9uOiBBbmltYXRpb24gfCBudWxsO1xyXG5cclxuICAvLyByZXdhcmQgc2hvd24gd2hpbGUgcmV3YXJkRGlhbG9nIGlzIG9wZW5cclxuICBwcml2YXRlIHJld2FyZE5vZGU6IFNvbHZlSXRSZXdhcmROb2RlIHwgbnVsbDtcclxuXHJcbiAgLy8gY29udHJvbCBmb3IgYXBwbHlpbmcgYSB1bml2ZXJzYWwgb3BlcmF0aW9uIHRvIHRoZSB0ZXJtcyB0aGF0IGFyZSBvbiB0aGUgc2NhbGVcclxuICBwcml2YXRlIHJlYWRvbmx5IHVuaXZlcnNhbE9wZXJhdGlvbkNvbnRyb2w6IFVuaXZlcnNhbE9wZXJhdGlvbkNvbnRyb2w7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGV2ZWw6IFNvbHZlSXRMZXZlbCxcclxuICAgICAgICAgICAgICAgICAgICAgIGxldmVsUHJvcGVydHk6IFByb3BlcnR5PFNvbHZlSXRMZXZlbCB8IG51bGw+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcmV3YXJkU2NvcmVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgICAgICAgIGxheW91dEJvdW5kczogQm91bmRzMixcclxuICAgICAgICAgICAgICAgICAgICAgIHZpc2libGVCb3VuZHNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Qm91bmRzMj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBzbmFwc2hvdHNBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIGdhbWVBdWRpb1BsYXllcjogR2FtZUF1ZGlvUGxheWVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBTb2x2ZUl0TGV2ZWxOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNvbHZlSXRMZXZlbE5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgRXF1YWxpdHlFeHBsb3JlclNjZW5lTm9kZU9wdGlvbnM+KCkoIHtcclxuICAgICAgLy8gZW1wdHkgb3B0aW9uaXplIGJlY2F1c2Ugd2UncmUgc2V0dGluZyBvcHRpb25zLmNoaWxkcmVuIGJlbG93XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBzdGF0dXNCYXJUYW5kZW0gPSBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzdGF0dXNCYXInICk7XHJcblxyXG4gICAgLy8gTGV2ZWwgZGVzY3JpcHRpb24sIGRpc3BsYXllZCBpbiB0aGUgc3RhdHVzIGJhclxyXG4gICAgY29uc3QgbGV2ZWxEZXNjcmlwdGlvblRleHQgPSBuZXcgUmljaFRleHQoIGxldmVsLmRlc2NyaXB0aW9uUHJvcGVydHksIHtcclxuICAgICAgZm9udDogTEVWRUxfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDY1MCwgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgICB0YW5kZW06IHN0YXR1c0JhclRhbmRlbS5jcmVhdGVUYW5kZW0oICdsZXZlbERlc2NyaXB0aW9uVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGJhY2tCdXR0b25MaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgdW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbC5zdG9wQW5pbWF0aW9ucygpOyAvLyBzdG9wIGFueSBvcGVyYXRpb25zIHRoYXQgYXJlIGluIHByb2dyZXNzXHJcbiAgICAgIGxldmVsUHJvcGVydHkudmFsdWUgPSBudWxsOyAvLyBiYWNrIHRvIHRoZSBTZXR0aW5nc05vZGUsIHdoZXJlIG5vIGxldmVsIGlzIHNlbGVjdGVkXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEJhciBhY3Jvc3MgdGhlIHRvcCBvZiB0aGUgc2NyZWVuXHJcbiAgICBjb25zdCBzdGF0dXNCYXIgPSBuZXcgSW5maW5pdGVTdGF0dXNCYXIoIGxheW91dEJvdW5kcywgdmlzaWJsZUJvdW5kc1Byb3BlcnR5LCBsZXZlbERlc2NyaXB0aW9uVGV4dCxcclxuICAgICAgbGV2ZWwuc2NvcmVQcm9wZXJ0eSwge1xyXG4gICAgICAgIGZsb2F0VG9Ub3A6IHRydWUsIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzE0NFxyXG4gICAgICAgIHNwYWNpbmc6IDIwLFxyXG4gICAgICAgIGJhckZpbGw6ICdyZ2IoIDI1MiwgMTUwLCAxNTIgKScsXHJcbiAgICAgICAgYmFja0J1dHRvbkxpc3RlbmVyOiBiYWNrQnV0dG9uTGlzdGVuZXIsXHJcbiAgICAgICAgdGFuZGVtOiBzdGF0dXNCYXJUYW5kZW0sXHJcbiAgICAgICAgcGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gRXF1YXRpb24gZm9yIHRoZSBjaGFsbGVuZ2VcclxuICAgIGNvbnN0IGNoYWxsZW5nZUVxdWF0aW9uTm9kZSA9IG5ldyBFcXVhdGlvblBhbmVsKCBsZXZlbC5sZWZ0VGVybUNyZWF0b3JzLCBsZXZlbC5yaWdodFRlcm1DcmVhdG9ycyxcclxuICAgICAgY29tYmluZU9wdGlvbnM8RXF1YXRpb25QYW5lbE9wdGlvbnM+KCB7fSwgRVFVQVRJT05fUEFORUxfT1BUSU9OUywge1xyXG4gICAgICAgIGZpbGw6IENvbG9yLldISVRFLndpdGhBbHBoYSggMC41ICksXHJcbiAgICAgICAgc3Ryb2tlOiBDb2xvci5CTEFDSy53aXRoQWxwaGEoIDAuNSApLFxyXG4gICAgICAgIGVxdWF0aW9uTm9kZU9wdGlvbnM6IHtcclxuICAgICAgICAgIHJlbGF0aW9uYWxPcGVyYXRvckZvbnRXZWlnaHQ6ICdub3JtYWwnLFxyXG4gICAgICAgICAgdXBkYXRlRW5hYmxlZDogZmFsc2UgLy8gc3RhdGljIGVxdWF0aW9uLCB0byBkaXNwbGF5IHRoZSBjaGFsbGVuZ2VcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNlbnRlclg6IGxldmVsLnNjYWxlLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdG9wOiBzdGF0dXNCYXIuYm90dG9tICsgMTUsXHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjaGFsbGVuZ2VFcXVhdGlvbk5vZGUnICksXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0Rpc3BsYXlzIHRoZSBlcXVhdGlvbiBmb3IgdGhlIGN1cnJlbnQgZ2FtZSBjaGFsbGVuZ2UuJ1xyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBFcXVhdGlvbiB0aGF0IHJlZmxlY3RzIHdoYXQgaXMgY3VycmVudGx5IG9uIHRoZSBiYWxhbmNlIHNjYWxlXHJcbiAgICBjb25zdCBiYWxhbmNlU2NhbGVFcXVhdGlvbk5vZGUgPSBuZXcgRXF1YXRpb25QYW5lbCggbGV2ZWwubGVmdFRlcm1DcmVhdG9ycywgbGV2ZWwucmlnaHRUZXJtQ3JlYXRvcnMsXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPEVxdWF0aW9uUGFuZWxPcHRpb25zPigge30sIEVRVUFUSU9OX1BBTkVMX09QVElPTlMsIHtcclxuICAgICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgICBlcXVhdGlvbk5vZGVPcHRpb25zOiB7XHJcbiAgICAgICAgICByZWxhdGlvbmFsT3BlcmF0b3JGb250V2VpZ2h0OiAnbm9ybWFsJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2VudGVyWDogY2hhbGxlbmdlRXF1YXRpb25Ob2RlLmNlbnRlclgsXHJcbiAgICAgICAgdG9wOiBjaGFsbGVuZ2VFcXVhdGlvbk5vZGUuYm90dG9tICsgMTAsXHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdiYWxhbmNlU2NhbGVFcXVhdGlvbk5vZGUnICksXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0Rpc3BsYXlzIHRoZSBlcXVhdGlvbiB0aGF0IG1hdGNoZXMgd2hhdCBpcyBjdXJyZW50bHkgb24gdGhlIGJhbGFuY2Ugc2NhbGUuJ1xyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBMYXllciB3aGVuIHVuaXZlcnNhbCBvcGVyYXRpb24gYW5pbWF0aW9uIG9jY3Vyc1xyXG4gICAgY29uc3Qgb3BlcmF0aW9uQW5pbWF0aW9uTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIC8vIFVuaXZlcnNhbCBPcGVyYXRpb24gY29udHJvbFxyXG4gICAgY29uc3QgdW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbCA9IG5ldyBVbml2ZXJzYWxPcGVyYXRpb25Db250cm9sKCBsZXZlbCwgb3BlcmF0aW9uQW5pbWF0aW9uTGF5ZXIsIHtcclxuICAgICAgdGltZXNaZXJvRW5hYmxlZDogZmFsc2UsIC8vIGRpc2FibGUgbXVsdGlwbGljYXRpb24gYnkgemVybywgc2VlIHBoZXRzaW1zL2VxdWFsaXR5LWV4cGxvcmVyIzcyXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbCcgKVxyXG4gICAgfSApO1xyXG4gICAgdW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbC5ib3VuZHNQcm9wZXJ0eS5saW5rKCBib3VuZHMgPT4ge1xyXG4gICAgICB1bml2ZXJzYWxPcGVyYXRpb25Db250cm9sLmNlbnRlclggPSBsZXZlbC5zY2FsZS5wb3NpdGlvbi54OyAvLyBjZW50ZXJlZCBvbiB0aGUgc2NhbGVcclxuICAgICAgdW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbC50b3AgPSBiYWxhbmNlU2NhbGVFcXVhdGlvbk5vZGUuYm90dG9tICsgMTU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gJ1NvbHZlIGZvciB4J1xyXG4gICAgY29uc3Qgc29sdmVGb3JYVGV4dCA9IG5ldyBTb2x2ZUZvclhUZXh0KCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyNCwgd2VpZ2h0OiAnYm9sZCcgfSApLFxyXG4gICAgICBtYXhXaWR0aDogY2hhbGxlbmdlRXF1YXRpb25Ob2RlLmxlZnQgLSBsYXlvdXRCb3VuZHMubWluWCAtIEVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMuU0NSRUVOX1ZJRVdfWF9NQVJHSU4sXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc29sdmVGb3JYVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRvIHRoZSBsZWZ0IG9mIHRoZSBjaGFsbGVuZ2UgZXF1YXRpb25cclxuICAgIHNvbHZlRm9yWFRleHQuYm91bmRzUHJvcGVydHkubGluayggYm91bmRzID0+IHtcclxuICAgICAgc29sdmVGb3JYVGV4dC5yaWdodCA9IGNoYWxsZW5nZUVxdWF0aW9uTm9kZS5sZWZ0IC0gMTA7XHJcbiAgICAgIHNvbHZlRm9yWFRleHQuY2VudGVyWSA9IGNoYWxsZW5nZUVxdWF0aW9uTm9kZS5jZW50ZXJZO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFNjYWxlXHJcbiAgICBjb25zdCBiYWxhbmNlU2NhbGVOb2RlID0gbmV3IEJhbGFuY2VTY2FsZU5vZGUoIGxldmVsLnNjYWxlLCB7XHJcbiAgICAgIGNsZWFyU2NhbGVCdXR0b25WaXNpYmxlOiBmYWxzZSxcclxuICAgICAgb3JnYW5pemVCdXR0b25WaXNpYmxlOiBmYWxzZSxcclxuICAgICAgZGlzcG9zZVRlcm1zTm90T25TY2FsZTogbGV2ZWwuZGlzcG9zZVRlcm1zTm90T25TY2FsZS5iaW5kKCBsZXZlbCApXHJcbiAgICAgIC8vIE5vIFBoRVQtaU8gaW5zdHJ1bWVudGF0aW9uIGlzIGRlc2lyZWQuLlxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFNuYXBzaG90c1xyXG4gICAgY29uc3Qgc25hcHNob3RzQWNjb3JkaW9uQm94ID0gbmV3IFNuYXBzaG90c0FjY29yZGlvbkJveCggbGV2ZWwsIHtcclxuICAgICAgZml4ZWRXaWR0aDogKCBsYXlvdXRCb3VuZHMucmlnaHQgLSBiYWxhbmNlU2NhbGVOb2RlLnJpZ2h0ICkgLSBFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1hfTUFSR0lOIC0gMTUsXHJcbiAgICAgIGV4cGFuZGVkUHJvcGVydHk6IHNuYXBzaG90c0FjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHksXHJcbiAgICAgIHJpZ2h0OiBsYXlvdXRCb3VuZHMucmlnaHQgLSBFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1hfTUFSR0lOLFxyXG4gICAgICB0b3A6IHN0YXR1c0Jhci5ib3R0b20gKyAyMCxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzbmFwc2hvdHNBY2NvcmRpb25Cb3gnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBSZWZyZXNoIGJ1dHRvbiwgZ2VuZXJhdGVzIGEgbmV3IGNoYWxsZW5nZSwgZWZmZWN0aXZlbHkgc2tpcHBpbmcgdGhlIGN1cnJlbnQgY2hhbGxlbmdlXHJcbiAgICBjb25zdCByZWZyZXNoQnV0dG9uID0gbmV3IFJlZnJlc2hCdXR0b24oIHtcclxuICAgICAgaWNvbkhlaWdodDogMjMsXHJcbiAgICAgIHhNYXJnaW46IDE0LFxyXG4gICAgICB5TWFyZ2luOiA3LFxyXG4gICAgICBsZWZ0OiBjaGFsbGVuZ2VFcXVhdGlvbk5vZGUucmlnaHQgKyAxMCxcclxuICAgICAgY2VudGVyWTogY2hhbGxlbmdlRXF1YXRpb25Ob2RlLmNlbnRlclksXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgcGhldC5sb2cgJiYgcGhldC5sb2coICdSZWZyZXNoIGJ1dHRvbiBwcmVzc2VkJyApO1xyXG4gICAgICAgIGxldmVsLm5leHRDaGFsbGVuZ2UoKTtcclxuICAgICAgfSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZWZyZXNoQnV0dG9uJyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnUHJlc3NpbmcgdGhpcyBidXR0b24gZ2VuZXJhdGVzIGEgbmV3IGNoYWxsZW5nZS4nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gTmV4dCBidXR0b24sIHRha2VzIHVzIHRvIHRoZSBuZXh0IGNoYWxsZW5nZVxyXG4gICAgY29uc3QgbmV4dEJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgICAgY29udGVudDogbmV3IFRleHQoIEVxdWFsaXR5RXhwbG9yZXJTdHJpbmdzLm5leHRTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICAgIGZvbnQ6IE5FWFRfQlVUVE9OX0ZPTlQsXHJcbiAgICAgICAgbWF4V2lkdGg6IDEwMCAvLyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgIH0gKSxcclxuICAgICAgYmFzZUNvbG9yOiBQaGV0Q29sb3JTY2hlbWUuQlVUVE9OX1lFTExPVyxcclxuICAgICAgeE1hcmdpbjogMTIsXHJcbiAgICAgIHlNYXJnaW46IDgsXHJcbiAgICAgIGNlbnRlclg6IGxldmVsLnNjYWxlLnBvc2l0aW9uLngsXHJcbiAgICAgIHRvcDogdW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbC5ib3R0b20gKyAzMCwgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHBoZXQubG9nICYmIHBoZXQubG9nKCAnTmV4dCBidXR0b24gcHJlc3NlZCcgKTtcclxuICAgICAgICBsZXZlbC5uZXh0Q2hhbGxlbmdlKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbmV4dEJ1dHRvbicgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoaXMgYnV0dG9uIGFwcGVhcnMgd2hlbiB0aGUgY3VycmVudCBjaGFsbGVuZ2UgaGFzIGJlZW4gc29sdmVkLiBQcmVzc2luZyBpdCBhZHZhbmNlcyB0byBhIG5ldyBjaGFsbGVuZ2UuJyxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9SZWFkT25seTogdHJ1ZSB9IC8vIHNvIHRoYXQgUGhFVC1pTyBjbGllbnQgY2FuIHNlZSB3aGV0aGVyIGl0cyB2aXNpYmxlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU21pbGV5IGZhY2UsIGRpc3BsYXllZCB3aGVuIHRoZSBjaGFsbGVuZ2UgaGFzIGJlZW4gc29sdmVkXHJcbiAgICBjb25zdCBmYWNlTm9kZSA9IG5ldyBGYWNlTm9kZSggMjI1LCB7XHJcbiAgICAgIGNlbnRlclg6IGJhbGFuY2VTY2FsZU5vZGUuY2VudGVyWCxcclxuICAgICAgdG9wOiB1bml2ZXJzYWxPcGVyYXRpb25Db250cm9sLmJvdHRvbSArIDI1LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZhY2VOb2RlJyApLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7IHBoZXRpb1JlYWRPbmx5OiB0cnVlIH0gLy8gc28gdGhhdCBQaEVULWlPIGNsaWVudCBjYW4gc2VlIHdoZXRoZXIgaXRzIHZpc2libGVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBbmltYXRlZCBvcGFjaXR5IG9mIHNtaWxleSBmYWNlLlxyXG4gICAgY29uc3QgZmFjZU9wYWNpdHlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggZmFjZU5vZGUub3BhY2l0eSwgeyAvL1RPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VxdWFsaXR5LWV4cGxvcmVyL2lzc3Vlcy8xOTcgc3RhdGVmdWwgYW5pbWF0aW9uP1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCAxIClcclxuICAgIH0gKTtcclxuICAgIGZhY2VPcGFjaXR5UHJvcGVydHkubGluayggZmFjZU9wYWNpdHkgPT4ge1xyXG4gICAgICBmYWNlTm9kZS5vcGFjaXR5ID0gZmFjZU9wYWNpdHk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdGVybXMgbGl2ZSBpbiB0aGlzIGxheWVyXHJcbiAgICBjb25zdCB0ZXJtc0xheWVyID0gbmV3IE5vZGUoIHtcclxuICAgICAgcGlja2FibGU6IGZhbHNlIC8vIHRlcm1zIGFyZSBub3QgaW50ZXJhY3RpdmUsIGFsbCBpbnRlcmFjdGlvbiBpcyB3aXRoIHRoZSB1bml2ZXJzYWwgb3BlcmF0aW9uIGNvbnRyb2xcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjaGlsZHJlbiA9IFtcclxuICAgICAgc3RhdHVzQmFyLFxyXG4gICAgICBjaGFsbGVuZ2VFcXVhdGlvbk5vZGUsXHJcbiAgICAgIHNvbHZlRm9yWFRleHQsXHJcbiAgICAgIGJhbGFuY2VTY2FsZUVxdWF0aW9uTm9kZSxcclxuICAgICAgYmFsYW5jZVNjYWxlTm9kZSxcclxuICAgICAgc25hcHNob3RzQWNjb3JkaW9uQm94LFxyXG4gICAgICByZWZyZXNoQnV0dG9uLFxyXG4gICAgICBuZXh0QnV0dG9uLFxyXG4gICAgICB1bml2ZXJzYWxPcGVyYXRpb25Db250cm9sLFxyXG4gICAgICB0ZXJtc0xheWVyLCAvLyB0ZXJtcyBpbiBmcm9tIG9mIGFsbCBvZiB0aGUgYWJvdmVcclxuICAgICAgb3BlcmF0aW9uQW5pbWF0aW9uTGF5ZXIsIC8vIG9wZXJhdGlvbnMgaW4gZnJvbnQgb2YgdGVybXNcclxuICAgICAgZmFjZU5vZGUgLy8gZmFjZSBpbiBmcm9udCBvZiBldmVyeXRoaW5nXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIFNob3cgQW5zd2VyIGJ1dHRvbiwgZm9yIGRlYnVnZ2luZy5cclxuICAgIC8vIE5vdGUgdGhhdCB0aGlzIGlzIGNvbmRpdGlvbmFsLCBzbyBpcyBub3QgKGFuZCBzaG91bGQgYmUpIGluc3RydW1lbnRlZCBmb3IgUGhFVC1pTy5cclxuICAgIGxldCBzaG93QW5zd2VyQnV0dG9uOiBOb2RlO1xyXG4gICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnNob3dBbnN3ZXJzICkge1xyXG5cclxuICAgICAgLy8gc2hvd3MgaG93IHRoZSBjdXJyZW50IGNoYWxsZW5nZSB3YXMgZGVyaXZlZFxyXG4gICAgICBjaGlsZHJlbi5wdXNoKCBuZXcgQ2hhbGxlbmdlRGVyaXZhdGlvblRleHQoIGxldmVsLmNoYWxsZW5nZVByb3BlcnR5LCB7XHJcbiAgICAgICAgbGVmdDogc25hcHNob3RzQWNjb3JkaW9uQm94LmxlZnQsXHJcbiAgICAgICAgdG9wOiBzbmFwc2hvdHNBY2NvcmRpb25Cb3guYm90dG9tICsgNVxyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICAgIC8vIGJ1dHRvbiB0aGF0IHRha2VzIHlvdSBkaXJlY3RseSB0byB0aGUgYW5zd2VyLiBkZWJ1ZyBvbmx5LCBpMThuIG5vdCBuZWVkZWQuXHJcbiAgICAgIHNob3dBbnN3ZXJCdXR0b24gPSBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCB7XHJcbiAgICAgICAgY29udGVudDogbmV3IFRleHQoICdTaG93IEFuc3dlcicsIHtcclxuICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTYgKSxcclxuICAgICAgICAgIGZpbGw6ICd3aGl0ZSdcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgYmFzZUNvbG9yOiAncmVkJyxcclxuICAgICAgICBjZW50ZXJYOiBiYWxhbmNlU2NhbGVOb2RlLmNlbnRlclgsXHJcbiAgICAgICAgYm90dG9tOiBiYWxhbmNlU2NhbGVOb2RlLmJvdHRvbSAtIDUsXHJcbiAgICAgICAgbGlzdGVuZXI6ICgpID0+IGxldmVsLnNob3dBbnN3ZXIoKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIGNoaWxkcmVuLnB1c2goIHNob3dBbnN3ZXJCdXR0b24gKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5jaGlsZHJlbiwgJ1NvbHZlSXRMZXZlbE5vZGUgc2V0cyBjaGlsZHJlbicgKTtcclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuXHJcbiAgICBzdXBlciggbGV2ZWwsIHNuYXBzaG90c0FjY29yZGlvbkJveCwgdGVybXNMYXllciwgb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMudW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbCA9IHVuaXZlcnNhbE9wZXJhdGlvbkNvbnRyb2w7XHJcbiAgICB0aGlzLmZhY2VBbmltYXRpb24gPSBudWxsO1xyXG4gICAgdGhpcy5yZXdhcmROb2RlID0gbnVsbDtcclxuXHJcbiAgICAvLyBSZXVzZWQgZWFjaCB0aW1lIHRoZVxyXG4gICAgY29uc3QgcmV3YXJkRGlhbG9nOiBSZXdhcmREaWFsb2cgPSBuZXcgUmV3YXJkRGlhbG9nKCBsZXZlbC5zY29yZVByb3BlcnR5LCB7XHJcblxyXG4gICAgICAvLyBEaXNwbGF5IHRoZSBkaWFsb2cgaW4gYSBwb3NpdGlvbiB0aGF0IGRvZXMgbm90IG9ic2N1cmUgdGhlIGNoYWxsZW5nZSBzb2x1dGlvbi5cclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lcXVhbGl0eS1leHBsb3Jlci9pc3N1ZXMvMTA0XHJcbiAgICAgIGxheW91dFN0cmF0ZWd5OiAoIGRpYWxvZywgc2ltQm91bmRzLCBzY3JlZW5Cb3VuZHMsIHNjYWxlICkgPT4ge1xyXG5cclxuICAgICAgICAvLyBjZW50ZXIgaG9yaXpvbnRhbGx5IG9uIHRoZSBzY3JlZW5cclxuICAgICAgICBjb25zdCBkaWFsb2dMYXlvdXRCb3VuZHMgPSBkaWFsb2cubGF5b3V0Qm91bmRzITtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkaWFsb2dMYXlvdXRCb3VuZHMgKTtcclxuICAgICAgICBkaWFsb2cuY2VudGVyWCA9IGRpYWxvZ0xheW91dEJvdW5kcy5jZW50ZXJYO1xyXG5cclxuICAgICAgICAvLyB0b3Agb2YgZGlhbG9nIGJlbG93IGJhbGFuY2VTY2FsZUVxdWF0aW9uTm9kZSwgc28gdGhlIHNvbHV0aW9uIGlzIG5vdCBvYnNjdXJlZFxyXG4gICAgICAgIGRpYWxvZy50b3AgPSBiYWxhbmNlU2NhbGVFcXVhdGlvbk5vZGUuYm90dG9tICsgMTA7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyAnS2VlcCBHb2luZycgaGlkZXMgdGhlIGRpYWxvZ1xyXG4gICAgICBrZWVwR29pbmdCdXR0b25MaXN0ZW5lcjogKCkgPT4gcmV3YXJkRGlhbG9nLmhpZGUoKSxcclxuXHJcbiAgICAgIC8vICdOZXcgTGV2ZWwnIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXMgdGhlIGJhY2sgYnV0dG9uIGluIHRoZSBzdGF0dXMgYmFyXHJcbiAgICAgIG5ld0xldmVsQnV0dG9uTGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICByZXdhcmREaWFsb2cuaGlkZSgpO1xyXG4gICAgICAgIGJhY2tCdXR0b25MaXN0ZW5lcigpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gV2hlbiB0aGUgZGlhbG9nIGlzIHNob3duLCBzaG93IHRoZSByZXdhcmRcclxuICAgICAgc2hvd0NhbGxiYWNrOiAoKSA9PiB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMucmV3YXJkTm9kZSwgJ3Jld2FyZE5vZGUgaXMgbm90IHN1cHBvc2VkIHRvIGV4aXN0JyApO1xyXG4gICAgICAgIHRoaXMucmV3YXJkTm9kZSA9IG5ldyBTb2x2ZUl0UmV3YXJkTm9kZSggbGV2ZWwubGV2ZWxOdW1iZXIgKTsgLy9UT0RPIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lcXVhbGl0eS1leHBsb3Jlci9pc3N1ZXMvMTk3IHN0YXRlZnVsIGFuaW1hdGlvbj9cclxuICAgICAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnJld2FyZE5vZGUgKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFdoZW4gdGhlIGRpYWxvZyBpcyBoaWRkZW4sIGRpc3Bvc2Ugb2YgdGhlIHJld2FyZFxyXG4gICAgICBoaWRlQ2FsbGJhY2s6ICgpID0+IHtcclxuICAgICAgICBjb25zdCByZXdhcmROb2RlID0gdGhpcy5yZXdhcmROb2RlITtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZXdhcmROb2RlLCAncmV3YXJkTm9kZSBpcyBzdXBwb3NlZCB0byBleGlzdCcgKTtcclxuICAgICAgICB0aGlzLnJlbW92ZUNoaWxkKCByZXdhcmROb2RlICk7XHJcbiAgICAgICAgcmV3YXJkTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgICAgdGhpcy5yZXdhcmROb2RlID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGxldmVsLnNjb3JlUHJvcGVydHkubGF6eUxpbmsoICggc2NvcmUsIG9sZFNjb3JlICkgPT4ge1xyXG5cclxuICAgICAgLy8gZG8gbm90aGluZyB3aGVuIHRoZSBzY29yZSBpcyByZXNldFxyXG4gICAgICBpZiAoIHNjb3JlIDwgb2xkU2NvcmUgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZWZyZXNoQnV0dG9uLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgc2hvd0Fuc3dlckJ1dHRvbiAmJiAoIHNob3dBbnN3ZXJCdXR0b24udmlzaWJsZSA9IGZhbHNlICk7XHJcblxyXG4gICAgICAvLyBXaGVuIHRoZSBzY29yZSByZWFjaGVzIGEgbWFnaWMgbnVtYmVyLCBkaXNwbGF5IHRoZSByZXdhcmQuXHJcbiAgICAgIGlmICggc2NvcmUgPT09IHJld2FyZFNjb3JlUHJvcGVydHkudmFsdWUgKSB7XHJcblxyXG4gICAgICAgIGdhbWVBdWRpb1BsYXllci5nYW1lT3ZlclBlcmZlY3RTY29yZSgpO1xyXG5cclxuICAgICAgICBuZXh0QnV0dG9uLnZpc2libGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBzaG93IHRoZSByZXdhcmQgZGlhbG9nXHJcbiAgICAgICAgcmV3YXJkRGlhbG9nLnNob3coKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gZGluZyFcclxuICAgICAgICBnYW1lQXVkaW9QbGF5ZXIuY29ycmVjdEFuc3dlcigpO1xyXG5cclxuICAgICAgICAvLyBTaG93IHNtaWxleSBmYWNlLCBmYWRlIGl0IG91dCwgdGhlbiBzaG93IHRoZSBOZXh0IGJ1dHRvbi5cclxuICAgICAgICBmYWNlT3BhY2l0eVByb3BlcnR5LnZhbHVlID0gMC44O1xyXG4gICAgICAgIGZhY2VOb2RlLnZpc2libGUgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmZhY2VBbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7IC8vVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzE5NyBzdGF0ZWZ1bCBhbmltYXRpb24/XHJcbiAgICAgICAgICBzdGVwRW1pdHRlcjogbnVsbCwgLy8gdmlhIHN0ZXAgZnVuY3Rpb25cclxuICAgICAgICAgIGRlbGF5OiAxLFxyXG4gICAgICAgICAgZHVyYXRpb246IDAuOCxcclxuICAgICAgICAgIHRhcmdldHM6IFsge1xyXG4gICAgICAgICAgICBwcm9wZXJ0eTogZmFjZU9wYWNpdHlQcm9wZXJ0eSxcclxuICAgICAgICAgICAgZWFzaW5nOiBFYXNpbmcuTElORUFSLFxyXG4gICAgICAgICAgICB0bzogMFxyXG4gICAgICAgICAgfSBdXHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICB0aGlzLmZhY2VBbmltYXRpb24uZmluaXNoRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgICAgZmFjZU5vZGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgbmV4dEJ1dHRvbi52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMuZmFjZUFuaW1hdGlvbiA9IG51bGw7XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICB0aGlzLmZhY2VBbmltYXRpb24uc3RhcnQoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIGNoYWxsZW5nZSBjaGFuZ2VzLi4uXHJcbiAgICBsZXZlbC5jaGFsbGVuZ2VQcm9wZXJ0eS5saW5rKCBjaGFsbGVuZ2UgPT4ge1xyXG5cclxuICAgICAgLy8gY2FuY2VsIG9wZXJhdGlvbiBhbmltYXRpb25zXHJcbiAgICAgIHRoaXMudW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbC5yZXNldCgpO1xyXG5cclxuICAgICAgLy8gQmVjYXVzZSB3ZSBjcmVhdGVkIGNoYWxsZW5nZUVxdWF0aW9uTm9kZSB3aXRoIHVwZGF0ZUVuYWJsZWQ6IGZhbHNlLCB0aGUgZXF1YXRpb24gZG9lcyBub3QgYXV0b21hdGljYWxseVxyXG4gICAgICAvLyBzeW5jaHJvbml6ZSB3aXRoIHdoYXQncyBvbiB0aGUgYmFsYW5jZSBzY2FsZSwgYW5kIHdlIG5lZWQgdG8gZXhwbGljaXRseSByZXF1ZXN0IGFuIHVwZGF0ZS5cclxuICAgICAgY2hhbGxlbmdlRXF1YXRpb25Ob2RlLnVwZGF0ZUVxdWF0aW9uKCk7XHJcblxyXG4gICAgICAvLyB2aXNpYmlsaXR5IG9mIG90aGVyIFVJIGVsZW1lbnRzXHJcbiAgICAgIHJlZnJlc2hCdXR0b24udmlzaWJsZSA9IHRydWU7XHJcbiAgICAgIG5leHRCdXR0b24udmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICBmYWNlTm9kZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIHNob3dBbnN3ZXJCdXR0b24gJiYgKCBzaG93QW5zd2VyQnV0dG9uLnZpc2libGUgPSB0cnVlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUGVyZm9ybSBzdW0tdG8temVybyBhbmltYXRpb24gZm9yIGFueSB0ZXJtcyB0aGF0IGJlY2FtZSB6ZXJvIGFzIHRoZSByZXN1bHQgb2YgYSB1bml2ZXJzYWwgb3BlcmF0aW9uLlxyXG4gICAgbGV2ZWwuc3VtVG9aZXJvRW1pdHRlci5hZGRMaXN0ZW5lciggdGVybUNyZWF0b3JzID0+IFN1bVRvWmVyb05vZGUuYW5pbWF0ZVN1bVRvWmVybyggdGVybUNyZWF0b3JzLCB0aGlzLnRlcm1zTGF5ZXIgKSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMudW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbC5yZXNldCgpO1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBkdCAtIGVsYXBzZWQgdGltZSwgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgdGhpcy51bml2ZXJzYWxPcGVyYXRpb25Db250cm9sLnN0ZXAoIGR0ICk7XHJcbiAgICB0aGlzLmZhY2VBbmltYXRpb24gJiYgdGhpcy5mYWNlQW5pbWF0aW9uLnN0ZXAoIGR0ICk7XHJcbiAgICB0aGlzLnJld2FyZE5vZGUgJiYgdGhpcy5yZXdhcmROb2RlLnN0ZXAoIGR0ICk7XHJcbiAgICBzdXBlci5zdGVwKCBkdCApO1xyXG4gIH1cclxufVxyXG5cclxuZXF1YWxpdHlFeHBsb3Jlci5yZWdpc3RlciggJ1NvbHZlSXRMZXZlbE5vZGUnLCBTb2x2ZUl0TGV2ZWxOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHVDQUF1QztBQUlsRSxPQUFPQyxTQUFTLElBQUlDLGNBQWMsUUFBMEIsdUNBQXVDO0FBQ25HLE9BQU9DLGFBQWEsTUFBTSxzREFBc0Q7QUFDaEYsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxlQUFlLE1BQU0sZ0RBQWdEO0FBQzVFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLFFBQVEsRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUMvRSxPQUFPQyxxQkFBcUIsTUFBTSxxREFBcUQ7QUFDdkYsT0FBT0MsU0FBUyxNQUFNLG1DQUFtQztBQUN6RCxPQUFPQyxNQUFNLE1BQU0sZ0NBQWdDO0FBRW5ELE9BQU9DLGlCQUFpQixNQUFNLDJDQUEyQztBQUN6RSxPQUFPQyxZQUFZLE1BQU0sc0NBQXNDO0FBQy9ELE9BQU9DLHlCQUF5QixNQUFNLDJDQUEyQztBQUNqRixPQUFPQyxnQkFBZ0IsTUFBTSx1Q0FBdUM7QUFDcEUsT0FBT0MseUJBQXlCLE1BQTRDLGdEQUFnRDtBQUM1SCxPQUFPQyxhQUFhLE1BQWdDLG9DQUFvQztBQUN4RixPQUFPQyxxQkFBcUIsTUFBTSw0Q0FBNEM7QUFDOUUsT0FBT0MseUJBQXlCLE1BQU0sZ0RBQWdEO0FBQ3RGLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyx1QkFBdUIsTUFBTSxrQ0FBa0M7QUFFdEUsT0FBT0MsdUJBQXVCLE1BQU0sOEJBQThCO0FBQ2xFLE9BQU9DLGlC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