// Copyright 2021-2023, University of Colorado Boulder

/**
 * WaveGameLevelNode is the view for a game level.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { globalKeyStateTracker, KeyboardUtils, Node, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import nullSoundPlayer from '../../../../tambo/js/shared-sound-players/nullSoundPlayer.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import InfiniteStatusBar from '../../../../vegas/js/InfiniteStatusBar.js';
import RewardDialog from '../../../../vegas/js/RewardDialog.js';
import FMWColors from '../../common/FMWColors.js';
import FMWConstants from '../../common/FMWConstants.js';
import FMWQueryParameters from '../../common/FMWQueryParameters.js';
import AmplitudeKeypadDialog from '../../common/view/AmplitudeKeypadDialog.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import FourierMakingWavesStrings from '../../FourierMakingWavesStrings.js';
import WaveGameLevel from '../model/WaveGameLevel.js';
import AmplitudeControlsSpinner from './AmplitudeControlsSpinner.js';
import AnswersNode from './AnswersNode.js';
import PointsAwardedNode from './PointsAwardedNode.js';
import WaveGameAmplitudesChartNode from './WaveGameAmplitudesChartNode.js';
import WaveGameHarmonicsChartNode from './WaveGameHarmonicsChartNode.js';
import WaveGameRewardNode from './WaveGameRewardNode.js';
import WaveGameSumChartNode from './WaveGameSumChartNode.js';

// constants
const DEFAULT_FONT = new PhetFont(16);
const BUTTON_TEXT_MAX_WIDTH = 150; // maxWidth for button text, determined empirically
const CHECK_ANSWER_PRESSES = 1; // number of 'Check Answer' button presses required to enabled the 'Show Answers' button
const TITLE_TOP_SPACING = 10; // space above the title of a chart
const TITLE_BOTTOM_SPACING = 10; // space below the title of a chart

export default class WaveGameLevelNode extends Node {
  /**
   * @param {WaveGameLevel} level
   * @param {Property.<WaveGameLevel>} levelProperty
   * @param {Bounds2} layoutBounds
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @param {GameAudioPlayer} gameAudioPlayer
   * @param {WaveGameRewardNode} rewardNode
   * @param {RewardDialog} rewardDialog
   * @param {number} rewardScore
   * @param {Object} [options]
   */
  constructor(level, levelProperty, layoutBounds, visibleBoundsProperty, gameAudioPlayer, rewardNode, rewardDialog, rewardScore, options) {
    assert && assert(level instanceof WaveGameLevel);
    assert && assert(levelProperty instanceof Property);
    assert && assert(layoutBounds instanceof Bounds2);
    assert && AssertUtils.assertPropertyOf(visibleBoundsProperty, Bounds2);
    assert && assert(gameAudioPlayer instanceof GameAudioPlayer);
    assert && assert(rewardNode instanceof WaveGameRewardNode);
    assert && assert(rewardDialog instanceof RewardDialog);
    assert && AssertUtils.assertPositiveInteger(rewardScore);
    options = merge({
      // phet-io options
      tandem: Tandem.REQUIRED,
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    }, options);

    //------------------------------------------------------------------------------------------------------------------
    // Status Bar
    //------------------------------------------------------------------------------------------------------------------

    const statusBarTandem = options.tandem.createTandem('statusBar');

    // Level description, displayed in the status bar
    const levelDescriptionText = new RichText(level.statusBarMessageProperty, {
      font: DEFAULT_FONT,
      maxWidth: 650,
      // determined empirically
      tandem: statusBarTandem.createTandem('levelDescriptionText')
    });

    // Bar across the top of the screen
    const statusBar = new InfiniteStatusBar(layoutBounds, visibleBoundsProperty, levelDescriptionText, level.scoreProperty, {
      floatToTop: false,
      spacing: 20,
      barFill: FMWColors.levelSelectionButtonFillProperty,
      // same as level-selection buttons!
      backButtonListener: () => {
        this.interruptSubtreeInput();
        levelProperty.value = null; // back to the level-selection UI
      },

      tandem: statusBarTandem
    });

    //------------------------------------------------------------------------------------------------------------------
    // Amplitudes chart
    //------------------------------------------------------------------------------------------------------------------

    // Parent tandem for all charts
    const chartsTandem = options.tandem.createTandem('charts');

    // Parent tandem for all elements related to the Amplitudes chart
    const amplitudesTandem = chartsTandem.createTandem('amplitudes');

    // Keypad Dialog, for changing amplitude value
    const amplitudeKeypadDialog = new AmplitudeKeypadDialog(level.guessSeries.amplitudeRange, {
      decimalPlaces: FMWConstants.WAVE_GAME_AMPLITUDE_DECIMAL_PLACES,
      layoutBounds: layoutBounds,
      tandem: amplitudesTandem.createTandem('amplitudeKeypadDialog')
    });
    const amplitudesChartNode = new WaveGameAmplitudesChartNode(level.amplitudesChart, amplitudeKeypadDialog, {
      tandem: amplitudesTandem.createTandem('amplitudesChartNode')
    });

    // Enabled when any amplitude is non-zero.
    const eraserButtonEnabledProperty = new DerivedProperty([level.guessSeries.amplitudesProperty], amplitudes => !!_.find(amplitudes, amplitude => amplitude !== 0));

    // Eraser button sets all of the amplitudes in the guess to zero.
    const eraserButton = new EraserButton(merge({}, FMWConstants.ERASER_BUTTON_OPTIONS, {
      listener: () => {
        this.interruptSubtreeInput();
        level.eraseAmplitudes();
      },
      enabledProperty: eraserButtonEnabledProperty,
      tandem: amplitudesTandem.createTandem('eraserButton')
    }));

    // When the ?showAnswers query parameter is present, show the answer to the current challenge.
    // This Node has very low overhead. So it is added to the scenegraph in all cases so that it gets tested.
    const answersNode = new AnswersNode(amplitudesChartNode.chartTransform, level.answerSeries, {
      visible: phet.chipper.queryParameters.showAnswers
    });

    // All of the elements that should be hidden when chartExpandedProperty is set to false.
    // In this screen, amplitudesChart.chartExpandedProperty can only be changed via PhET-iO.
    const amplitudesParentNode = new Node({
      visibleProperty: level.amplitudesChart.chartExpandedProperty,
      children: [amplitudesChartNode, eraserButton, answersNode]
    });

    //------------------------------------------------------------------------------------------------------------------
    // Harmonics chart
    //------------------------------------------------------------------------------------------------------------------

    // Parent tandem for all elements related to the Harmonics chart
    const harmonicsTandem = chartsTandem.createTandem('harmonics');
    const harmonicsTitleText = new Text(FourierMakingWavesStrings.harmonicsChartStringProperty, {
      font: FMWConstants.TITLE_FONT,
      maxWidth: 150,
      tandem: harmonicsTandem.createTandem('harmonicsTitleText')
    });
    const harmonicsChartNode = new WaveGameHarmonicsChartNode(level.harmonicsChart, {
      tandem: harmonicsTandem.createTandem('harmonicsChartNode')
    });

    // All of the elements that should be hidden when chartExpandedProperty is set to false.
    // In this screen, harmonicsChart.chartExpandedProperty can only be changed via PhET-iO.
    const harmonicsParentNode = new Node({
      visibleProperty: level.harmonicsChart.chartExpandedProperty,
      children: [harmonicsTitleText, harmonicsChartNode]
    });

    //------------------------------------------------------------------------------------------------------------------
    // Sum chart
    //------------------------------------------------------------------------------------------------------------------

    // Parent tandem for all components related to the Sum chart
    const sumTandem = chartsTandem.createTandem('sum');
    const sumTitleNode = new Text(FourierMakingWavesStrings.sumStringProperty, {
      font: FMWConstants.TITLE_FONT,
      maxWidth: FMWConstants.CHART_TITLE_MAX_WIDTH,
      tandem: sumTandem.createTandem('harmonicsTitleText')
    });
    const sumChartNode = new WaveGameSumChartNode(level.sumChart, {
      tandem: sumTandem.createTandem('sumChartNode')
    });

    // All of the elements that should be hidden when chartExpandedProperty is set to false.
    // In this screen, sumChart.chartExpandedProperty can only be changed via PhET-iO.
    const sumParentNode = new Node({
      visibleProperty: level.sumChart.chartExpandedProperty,
      children: [sumTitleNode, sumChartNode]
    });

    //------------------------------------------------------------------------------------------------------------------
    // Controls to the right of the charts
    //------------------------------------------------------------------------------------------------------------------

    // Controls the number of amplitude controls (sliders) visible in the Amplitudes chart.
    const amplitudeControlsSpinner = new AmplitudeControlsSpinner(level.numberOfAmplitudeControlsProperty, {
      textOptions: {
        font: DEFAULT_FONT
      },
      tandem: options.tandem.createTandem('amplitudeControlsSpinner')
    });

    // Parent tandem for all buttons
    const buttonsTandem = options.tandem.createTandem('buttons');

    // Whether the user has changed the guess since the last time that 'Check Answer' button was pressed.
    const guessChangedProperty = new BooleanProperty(false);
    level.guessSeries.amplitudesProperty.lazyLink(() => {
      guessChangedProperty.value = true;
    });

    // The number of times that the 'Check Answer' button has been pressed for the current challenge.
    const numberOfCheckAnswerButtonPressesProperty = new NumberProperty(0, {
      numberType: 'Integer'
    });

    // 'Check Answer' button is enabled when the challenge has not been solved, and the user has
    // changed something about their guess that is checkable.
    const checkAnswerButtonEnabledProperty = new DerivedProperty([level.isSolvedProperty, guessChangedProperty], (isSolved, guessChanged) => !isSolved && guessChanged);
    const checkAnswerListener = () => {
      this.interruptSubtreeInput();
      numberOfCheckAnswerButtonPressesProperty.value++;
      guessChangedProperty.value = false;
      level.checkAnswer();
    };
    const checkAnswerButton = new RectangularPushButton({
      content: new Text(FourierMakingWavesStrings.checkAnswerStringProperty, {
        font: DEFAULT_FONT,
        maxWidth: BUTTON_TEXT_MAX_WIDTH
      }),
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      listener: checkAnswerListener,
      soundPlayer: nullSoundPlayer,
      enabledProperty: checkAnswerButtonEnabledProperty,
      tandem: buttonsTandem.createTandem('checkAnswerButton')
    });

    // Alt+C hotkey support for 'Check Answer'. globalKeyStateTracker listeners always fire, so it's our
    // responsibility to short-circuit this listener if the checkAnswerButton is not in the PDOM, and not enabled.
    globalKeyStateTracker.keydownEmitter.addListener(event => {
      if (checkAnswerButton.pdomDisplayed && checkAnswerButton.enabledProperty.value && globalKeyStateTracker.altKeyDown && KeyboardUtils.isKeyEvent(event, KeyboardUtils.KEY_C)) {
        checkAnswerListener();
      }
    });

    // Smiley face is visible when the waveform is matched.
    const faceVisibleProperty = new DerivedProperty([level.isSolvedProperty, level.isMatchedProperty], (isSolved, isMatched) => isSolved && isMatched);

    // 'Show Answer' button is enabled after the user has tried 'Check Answer'.
    const showAnswerButtonEnabledProperty = new DerivedProperty([numberOfCheckAnswerButtonPressesProperty, level.isSolvedProperty, faceVisibleProperty], (numberOfCheckAnswerButtonPresses, isSolved, faceVisible) => !isSolved && numberOfCheckAnswerButtonPresses >= CHECK_ANSWER_PRESSES || isSolved && !faceVisible);

    // Show Answer button shows the answer to the challenge. Points will NOT be awarded after pressing this button.
    const showAnswerButton = new RectangularPushButton({
      content: new Text(FourierMakingWavesStrings.showAnswerStringProperty, {
        font: DEFAULT_FONT,
        maxWidth: BUTTON_TEXT_MAX_WIDTH
      }),
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      listener: () => {
        this.interruptSubtreeInput();
        level.showAnswer();
      },
      enabledProperty: showAnswerButtonEnabledProperty,
      tandem: buttonsTandem.createTandem('showAnswerButton')
    });

    // Creates a new challenge, a new waveform to match.
    const newWaveform = () => {
      this.interruptSubtreeInput();
      level.newWaveform();
    };

    // New Waveform button loads a new challenge.
    const newWaveformButton = new RectangularPushButton({
      listener: newWaveform,
      content: new Text(FourierMakingWavesStrings.newWaveformStringProperty, {
        font: DEFAULT_FONT,
        maxWidth: BUTTON_TEXT_MAX_WIDTH
      }),
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      tandem: buttonsTandem.createTandem('newWaveformButton')
    });
    const buttonsBox = new VBox({
      spacing: 20,
      children: [checkAnswerButton, showAnswerButton, newWaveformButton],
      tandem: buttonsTandem
    });

    //------------------------------------------------------------------------------------------------------------------
    // Transient UI elements that provide game feedback
    //------------------------------------------------------------------------------------------------------------------

    const feedbackTandem = options.tandem.createTandem('feedback');
    const smileyFaceNode = new FaceNode(125 /* headDiameter */, {
      visibleProperty: faceVisibleProperty,
      tandem: feedbackTandem.createTandem('smileyFaceNode'),
      phetioReadOnly: true
    });

    // Shown when a correct guess is made, then fades out.
    const pointsAwardedNode = new PointsAwardedNode({
      visible: false,
      tandem: feedbackTandem.createTandem('pointsAwardedNode'),
      phetioReadOnly: true
    });

    // Shown when an incorrect guess is made, then fades out.
    const frownyFaceNode = new FaceNode(250 /* headDiameter */, {
      visible: false,
      tandem: feedbackTandem.createTandem('frownyFaceNode'),
      phetioReadOnly: true
    });
    frownyFaceNode.frown();

    //------------------------------------------------------------------------------------------------------------------
    // Rendering order
    //------------------------------------------------------------------------------------------------------------------

    assert && assert(!options.children, 'WaveGameLevelNode sets children');
    options.children = [statusBar, amplitudesParentNode, harmonicsParentNode, sumParentNode, amplitudeControlsSpinner, buttonsBox, smileyFaceNode, pointsAwardedNode, frownyFaceNode];
    super(options);

    //------------------------------------------------------------------------------------------------------------------
    // Layout
    //------------------------------------------------------------------------------------------------------------------

    amplitudesChartNode.x = FMWConstants.X_CHART_RECTANGLES;
    amplitudesChartNode.top = statusBar.bottom + 5;
    const amplitudesChartRectangleLocalBounds = amplitudesChartNode.chartRectangle.boundsTo(this);
    harmonicsTitleText.boundsProperty.link(bounds => {
      harmonicsTitleText.left = layoutBounds.left + FMWConstants.SCREEN_VIEW_X_MARGIN;
      harmonicsTitleText.top = amplitudesChartNode.bottom + TITLE_TOP_SPACING;
    });
    harmonicsChartNode.x = amplitudesChartNode.x;
    harmonicsChartNode.y = harmonicsTitleText.bottom + TITLE_BOTTOM_SPACING;
    const harmonicsChartRectangleLocalBounds = harmonicsChartNode.chartRectangle.boundsTo(this);
    sumTitleNode.boundsProperty.link(bounds => {
      sumTitleNode.left = harmonicsTitleText.left;
      sumTitleNode.top = harmonicsChartNode.bottom + TITLE_TOP_SPACING;
    });
    sumChartNode.x = amplitudesChartNode.x;
    sumChartNode.y = sumTitleNode.bottom + TITLE_BOTTOM_SPACING;
    const sumChartRectangleLocalBounds = sumChartNode.chartRectangle.boundsTo(this);

    // Below the Amplitudes chart
    answersNode.x = amplitudesChartNode.x;
    answersNode.top = amplitudesChartNode.bottom;

    // To the right of the amplitude NumberDisplays
    const amplitudesChartRightTop = amplitudesChartNode.localToGlobalPoint(amplitudesChartNode.chartRectangle.rightTop);
    eraserButton.left = amplitudesChartRightTop.x + 10;
    eraserButton.bottom = amplitudesChartRightTop.y - 10;

    // centered on the Harmonics chart
    frownyFaceNode.centerX = harmonicsChartRectangleLocalBounds.centerX;
    frownyFaceNode.centerY = harmonicsChartRectangleLocalBounds.centerY;

    // Center of the space to the right of the charts
    const controlsCenterX = amplitudesChartNode.right + (layoutBounds.right - amplitudesChartNode.right) / 2;

    // centered on the Amplitudes chart
    amplitudeControlsSpinner.boundsProperty.link(bounds => {
      amplitudeControlsSpinner.centerX = controlsCenterX;
      amplitudeControlsSpinner.centerY = amplitudesChartRectangleLocalBounds.centerY;
    });

    // buttons centered on Harmonics chart
    buttonsBox.boundsProperty.link(bounds => {
      buttonsBox.centerX = controlsCenterX;
      buttonsBox.centerY = harmonicsChartRectangleLocalBounds.centerY;
    });

    // centered on the Sum chart
    smileyFaceNode.centerX = controlsCenterX;
    smileyFaceNode.centerY = sumChartRectangleLocalBounds.centerY;

    //------------------------------------------------------------------------------------------------------------------
    // Misc. listeners related to game flow
    //------------------------------------------------------------------------------------------------------------------

    // When a new waveform (challenge) is presented, reset some things.
    level.newWaveformEmitter.addListener(() => {
      pointsAwardedNode.visible = false;
      frownyFaceNode.visible = false;
      guessChangedProperty.value = false;
      numberOfCheckAnswerButtonPressesProperty.value = 0;
    });

    // When the user's guess is correct, provide feedback.
    level.correctEmitter.addListener(pointsAwarded => {
      // Interrupt any in-progress interactions, since the challenge has been solved.
      // The user is free to resume experimenting with the current challenge after this point.
      this.interruptSubtreeInput();
      if (level.scoreProperty.value === rewardScore || FMWQueryParameters.showReward) {
        // The score has reached the magic number where a reward is display.
        gameAudioPlayer.gameOverPerfectScore();
        rewardDialog.show();
      } else {
        // The score doesn't warrant a reward, so just show the points that were rewarded.
        this.correctFeedback(pointsAwarded);
      }
    });

    // When the user's guess is incorrect, provide feedback.
    level.incorrectEmitter.addListener(() => this.incorrectFeedback());

    //------------------------------------------------------------------------------------------------------------------
    // PDOM
    //------------------------------------------------------------------------------------------------------------------

    // pdom - traversal order
    // See https://github.com/phetsims/fourier-making-waves/issues/53
    this.pDomOrder = [statusBar, amplitudesChartNode, eraserButton, amplitudeControlsSpinner, checkAnswerButton, showAnswerButton, newWaveformButton];

    //------------------------------------------------------------------------------------------------------------------
    // Class fields
    //------------------------------------------------------------------------------------------------------------------

    // @public
    this.level = level; // {WaveGameLevel}

    // @private
    this.layoutBounds = layoutBounds; // {Bounds2}
    this.gameAudioPlayer = gameAudioPlayer; // {GameAudioPlayer}
    this.harmonicsChartRectangleLocalBounds = harmonicsChartRectangleLocalBounds; // {Bounds2}
    this.pointsAwardedNode = pointsAwardedNode; // {PointsAwardedNode}
    this.pointsAwardedAnimation = null; // {Animation|null}
    this.frownyFaceNode = frownyFaceNode; // {FaceNode}
    this.frownyFaceAnimation = null; // {Animation|null}
  }

  /**
   * @param {number} dt - elapsed time, in seconds
   * @public
   */
  step(dt) {
    this.pointsAwardedAnimation && this.pointsAwardedAnimation.step(dt);
    this.frownyFaceAnimation && this.frownyFaceAnimation.step(dt);
  }

  /**
   * Provides feedback when the user has made a correct guess.
   * @param {number} pointsAwarded
   * @private
   */
  correctFeedback(pointsAwarded) {
    assert && AssertUtils.assertPositiveNumber(pointsAwarded);

    // Audio feedback
    this.gameAudioPlayer.correctAnswer();

    // Show points awarded, centered on charts.
    this.pointsAwardedNode.setPoints(pointsAwarded);
    this.pointsAwardedNode.centerX = this.harmonicsChartRectangleLocalBounds.centerX;
    this.pointsAwardedNode.centerY = this.harmonicsChartRectangleLocalBounds.centerY;

    // Animate opacity of pointsAwardedNode, fade it out.
    this.pointsAwardedNode.visible = true;
    this.pointsAwardedNode.opacityProperty.value = 1;
    this.pointsAwardedAnimation = new Animation({
      stepEmitter: null,
      // via step function
      delay: 1,
      duration: 0.8,
      targets: [{
        property: this.pointsAwardedNode.opacityProperty,
        easing: Easing.LINEAR,
        to: 0
      }]
    });
    this.pointsAwardedAnimation.finishEmitter.addListener(() => {
      this.pointsAwardedNode.visible = false;
      this.pointsAwardedAnimation = null;
    });
    this.pointsAwardedAnimation.start();
  }

  /**
   * Provides feedback when the user has made an incorrect guess.
   * @private
   */
  incorrectFeedback() {
    // Audio feedback
    this.gameAudioPlayer.wrongAnswer();

    // Animate opacity of frownyFaceNode, fade it out.
    this.frownyFaceNode.visible = true;
    this.frownyFaceNode.opacityProperty.value = 1;
    this.frownyFaceAnimation = new Animation({
      stepEmitter: null,
      // via step function
      delay: 1,
      duration: 0.8,
      targets: [{
        property: this.frownyFaceNode.opacityProperty,
        easing: Easing.LINEAR,
        to: 0
      }]
    });
    this.frownyFaceAnimation.finishEmitter.addListener(() => {
      this.frownyFaceNode.visible = false;
      this.frownyFaceAnimation = null;
    });
    this.frownyFaceAnimation.start();
  }
}
fourierMakingWaves.register('WaveGameLevelNode', WaveGameLevelNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiQm91bmRzMiIsIm1lcmdlIiwiQXNzZXJ0VXRpbHMiLCJFcmFzZXJCdXR0b24iLCJGYWNlTm9kZSIsIlBoZXRDb2xvclNjaGVtZSIsIlBoZXRGb250IiwiZ2xvYmFsS2V5U3RhdGVUcmFja2VyIiwiS2V5Ym9hcmRVdGlscyIsIk5vZGUiLCJSaWNoVGV4dCIsIlRleHQiLCJWQm94IiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwibnVsbFNvdW5kUGxheWVyIiwiVGFuZGVtIiwiQW5pbWF0aW9uIiwiRWFzaW5nIiwiR2FtZUF1ZGlvUGxheWVyIiwiSW5maW5pdGVTdGF0dXNCYXIiLCJSZXdhcmREaWFsb2ciLCJGTVdDb2xvcnMiLCJGTVdDb25zdGFudHMiLCJGTVdRdWVyeVBhcmFtZXRlcnMiLCJBbXBsaXR1ZGVLZXlwYWREaWFsb2ciLCJmb3VyaWVyTWFraW5nV2F2ZXMiLCJGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzIiwiV2F2ZUdhbWVMZXZlbCIsIkFtcGxpdHVkZUNvbnRyb2xzU3Bpbm5lciIsIkFuc3dlcnNOb2RlIiwiUG9pbnRzQXdhcmRlZE5vZGUiLCJXYXZlR2FtZUFtcGxpdHVkZXNDaGFydE5vZGUiLCJXYXZlR2FtZUhhcm1vbmljc0NoYXJ0Tm9kZSIsIldhdmVHYW1lUmV3YXJkTm9kZSIsIldhdmVHYW1lU3VtQ2hhcnROb2RlIiwiREVGQVVMVF9GT05UIiwiQlVUVE9OX1RFWFRfTUFYX1dJRFRIIiwiQ0hFQ0tfQU5TV0VSX1BSRVNTRVMiLCJUSVRMRV9UT1BfU1BBQ0lORyIsIlRJVExFX0JPVFRPTV9TUEFDSU5HIiwiV2F2ZUdhbWVMZXZlbE5vZGUiLCJjb25zdHJ1Y3RvciIsImxldmVsIiwibGV2ZWxQcm9wZXJ0eSIsImxheW91dEJvdW5kcyIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsImdhbWVBdWRpb1BsYXllciIsInJld2FyZE5vZGUiLCJyZXdhcmREaWFsb2ciLCJyZXdhcmRTY29yZSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJhc3NlcnRQcm9wZXJ0eU9mIiwiYXNzZXJ0UG9zaXRpdmVJbnRlZ2VyIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvUmVhZE9ubHkiLCJzdGF0dXNCYXJUYW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJsZXZlbERlc2NyaXB0aW9uVGV4dCIsInN0YXR1c0Jhck1lc3NhZ2VQcm9wZXJ0eSIsImZvbnQiLCJtYXhXaWR0aCIsInN0YXR1c0JhciIsInNjb3JlUHJvcGVydHkiLCJmbG9hdFRvVG9wIiwic3BhY2luZyIsImJhckZpbGwiLCJsZXZlbFNlbGVjdGlvbkJ1dHRvbkZpbGxQcm9wZXJ0eSIsImJhY2tCdXR0b25MaXN0ZW5lciIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsInZhbHVlIiwiY2hhcnRzVGFuZGVtIiwiYW1wbGl0dWRlc1RhbmRlbSIsImFtcGxpdHVkZUtleXBhZERpYWxvZyIsImd1ZXNzU2VyaWVzIiwiYW1wbGl0dWRlUmFuZ2UiLCJkZWNpbWFsUGxhY2VzIiwiV0FWRV9HQU1FX0FNUExJVFVERV9ERUNJTUFMX1BMQUNFUyIsImFtcGxpdHVkZXNDaGFydE5vZGUiLCJhbXBsaXR1ZGVzQ2hhcnQiLCJlcmFzZXJCdXR0b25FbmFibGVkUHJvcGVydHkiLCJhbXBsaXR1ZGVzUHJvcGVydHkiLCJhbXBsaXR1ZGVzIiwiXyIsImZpbmQiLCJhbXBsaXR1ZGUiLCJlcmFzZXJCdXR0b24iLCJFUkFTRVJfQlVUVE9OX09QVElPTlMiLCJsaXN0ZW5lciIsImVyYXNlQW1wbGl0dWRlcyIsImVuYWJsZWRQcm9wZXJ0eSIsImFuc3dlcnNOb2RlIiwiY2hhcnRUcmFuc2Zvcm0iLCJhbnN3ZXJTZXJpZXMiLCJ2aXNpYmxlIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJzaG93QW5zd2VycyIsImFtcGxpdHVkZXNQYXJlbnROb2RlIiwidmlzaWJsZVByb3BlcnR5IiwiY2hhcnRFeHBhbmRlZFByb3BlcnR5IiwiY2hpbGRyZW4iLCJoYXJtb25pY3NUYW5kZW0iLCJoYXJtb25pY3NUaXRsZVRleHQiLCJoYXJtb25pY3NDaGFydFN0cmluZ1Byb3BlcnR5IiwiVElUTEVfRk9OVCIsImhhcm1vbmljc0NoYXJ0Tm9kZSIsImhhcm1vbmljc0NoYXJ0IiwiaGFybW9uaWNzUGFyZW50Tm9kZSIsInN1bVRhbmRlbSIsInN1bVRpdGxlTm9kZSIsInN1bVN0cmluZ1Byb3BlcnR5IiwiQ0hBUlRfVElUTEVfTUFYX1dJRFRIIiwic3VtQ2hhcnROb2RlIiwic3VtQ2hhcnQiLCJzdW1QYXJlbnROb2RlIiwiYW1wbGl0dWRlQ29udHJvbHNTcGlubmVyIiwibnVtYmVyT2ZBbXBsaXR1ZGVDb250cm9sc1Byb3BlcnR5IiwidGV4dE9wdGlvbnMiLCJidXR0b25zVGFuZGVtIiwiZ3Vlc3NDaGFuZ2VkUHJvcGVydHkiLCJsYXp5TGluayIsIm51bWJlck9mQ2hlY2tBbnN3ZXJCdXR0b25QcmVzc2VzUHJvcGVydHkiLCJudW1iZXJUeXBlIiwiY2hlY2tBbnN3ZXJCdXR0b25FbmFibGVkUHJvcGVydHkiLCJpc1NvbHZlZFByb3BlcnR5IiwiaXNTb2x2ZWQiLCJndWVzc0NoYW5nZWQiLCJjaGVja0Fuc3dlckxpc3RlbmVyIiwiY2hlY2tBbnN3ZXIiLCJjaGVja0Fuc3dlckJ1dHRvbiIsImNvbnRlbnQiLCJjaGVja0Fuc3dlclN0cmluZ1Byb3BlcnR5IiwiYmFzZUNvbG9yIiwiQlVUVE9OX1lFTExPVyIsInNvdW5kUGxheWVyIiwia2V5ZG93bkVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImV2ZW50IiwicGRvbURpc3BsYXllZCIsImFsdEtleURvd24iLCJpc0tleUV2ZW50IiwiS0VZX0MiLCJmYWNlVmlzaWJsZVByb3BlcnR5IiwiaXNNYXRjaGVkUHJvcGVydHkiLCJpc01hdGNoZWQiLCJzaG93QW5zd2VyQnV0dG9uRW5hYmxlZFByb3BlcnR5IiwibnVtYmVyT2ZDaGVja0Fuc3dlckJ1dHRvblByZXNzZXMiLCJmYWNlVmlzaWJsZSIsInNob3dBbnN3ZXJCdXR0b24iLCJzaG93QW5zd2VyU3RyaW5nUHJvcGVydHkiLCJzaG93QW5zd2VyIiwibmV3V2F2ZWZvcm0iLCJuZXdXYXZlZm9ybUJ1dHRvbiIsIm5ld1dhdmVmb3JtU3RyaW5nUHJvcGVydHkiLCJidXR0b25zQm94IiwiZmVlZGJhY2tUYW5kZW0iLCJzbWlsZXlGYWNlTm9kZSIsInBvaW50c0F3YXJkZWROb2RlIiwiZnJvd255RmFjZU5vZGUiLCJmcm93biIsIngiLCJYX0NIQVJUX1JFQ1RBTkdMRVMiLCJ0b3AiLCJib3R0b20iLCJhbXBsaXR1ZGVzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcyIsImNoYXJ0UmVjdGFuZ2xlIiwiYm91bmRzVG8iLCJib3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJib3VuZHMiLCJsZWZ0IiwiU0NSRUVOX1ZJRVdfWF9NQVJHSU4iLCJ5IiwiaGFybW9uaWNzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcyIsInN1bUNoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMiLCJhbXBsaXR1ZGVzQ2hhcnRSaWdodFRvcCIsImxvY2FsVG9HbG9iYWxQb2ludCIsInJpZ2h0VG9wIiwiY2VudGVyWCIsImNlbnRlclkiLCJjb250cm9sc0NlbnRlclgiLCJyaWdodCIsIm5ld1dhdmVmb3JtRW1pdHRlciIsImNvcnJlY3RFbWl0dGVyIiwicG9pbnRzQXdhcmRlZCIsInNob3dSZXdhcmQiLCJnYW1lT3ZlclBlcmZlY3RTY29yZSIsInNob3ciLCJjb3JyZWN0RmVlZGJhY2siLCJpbmNvcnJlY3RFbWl0dGVyIiwiaW5jb3JyZWN0RmVlZGJhY2siLCJwRG9tT3JkZXIiLCJwb2ludHNBd2FyZGVkQW5pbWF0aW9uIiwiZnJvd255RmFjZUFuaW1hdGlvbiIsInN0ZXAiLCJkdCIsImFzc2VydFBvc2l0aXZlTnVtYmVyIiwiY29ycmVjdEFuc3dlciIsInNldFBvaW50cyIsIm9wYWNpdHlQcm9wZXJ0eSIsInN0ZXBFbWl0dGVyIiwiZGVsYXkiLCJkdXJhdGlvbiIsInRhcmdldHMiLCJwcm9wZXJ0eSIsImVhc2luZyIsIkxJTkVBUiIsInRvIiwiZmluaXNoRW1pdHRlciIsInN0YXJ0Iiwid3JvbmdBbnN3ZXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIldhdmVHYW1lTGV2ZWxOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFdhdmVHYW1lTGV2ZWxOb2RlIGlzIHRoZSB2aWV3IGZvciBhIGdhbWUgbGV2ZWwuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEFzc2VydFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvQXNzZXJ0VXRpbHMuanMnO1xyXG5pbXBvcnQgRXJhc2VyQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL0VyYXNlckJ1dHRvbi5qcyc7XHJcbmltcG9ydCBGYWNlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvRmFjZU5vZGUuanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgZ2xvYmFsS2V5U3RhdGVUcmFja2VyLCBLZXlib2FyZFV0aWxzLCBOb2RlLCBSaWNoVGV4dCwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IG51bGxTb3VuZFBsYXllciBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9zaGFyZWQtc291bmQtcGxheWVycy9udWxsU291bmRQbGF5ZXIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0FuaW1hdGlvbi5qcyc7XHJcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcclxuaW1wb3J0IEdhbWVBdWRpb1BsYXllciBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9HYW1lQXVkaW9QbGF5ZXIuanMnO1xyXG5pbXBvcnQgSW5maW5pdGVTdGF0dXNCYXIgZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvSW5maW5pdGVTdGF0dXNCYXIuanMnO1xyXG5pbXBvcnQgUmV3YXJkRGlhbG9nIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL1Jld2FyZERpYWxvZy5qcyc7XHJcbmltcG9ydCBGTVdDb2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL0ZNV0NvbG9ycy5qcyc7XHJcbmltcG9ydCBGTVdDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0ZNV0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBGTVdRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vLi4vY29tbW9uL0ZNV1F1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBBbXBsaXR1ZGVLZXlwYWREaWFsb2cgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQW1wbGl0dWRlS2V5cGFkRGlhbG9nLmpzJztcclxuaW1wb3J0IGZvdXJpZXJNYWtpbmdXYXZlcyBmcm9tICcuLi8uLi9mb3VyaWVyTWFraW5nV2F2ZXMuanMnO1xyXG5pbXBvcnQgRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncyBmcm9tICcuLi8uLi9Gb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IFdhdmVHYW1lTGV2ZWwgZnJvbSAnLi4vbW9kZWwvV2F2ZUdhbWVMZXZlbC5qcyc7XHJcbmltcG9ydCBBbXBsaXR1ZGVDb250cm9sc1NwaW5uZXIgZnJvbSAnLi9BbXBsaXR1ZGVDb250cm9sc1NwaW5uZXIuanMnO1xyXG5pbXBvcnQgQW5zd2Vyc05vZGUgZnJvbSAnLi9BbnN3ZXJzTm9kZS5qcyc7XHJcbmltcG9ydCBQb2ludHNBd2FyZGVkTm9kZSBmcm9tICcuL1BvaW50c0F3YXJkZWROb2RlLmpzJztcclxuaW1wb3J0IFdhdmVHYW1lQW1wbGl0dWRlc0NoYXJ0Tm9kZSBmcm9tICcuL1dhdmVHYW1lQW1wbGl0dWRlc0NoYXJ0Tm9kZS5qcyc7XHJcbmltcG9ydCBXYXZlR2FtZUhhcm1vbmljc0NoYXJ0Tm9kZSBmcm9tICcuL1dhdmVHYW1lSGFybW9uaWNzQ2hhcnROb2RlLmpzJztcclxuaW1wb3J0IFdhdmVHYW1lUmV3YXJkTm9kZSBmcm9tICcuL1dhdmVHYW1lUmV3YXJkTm9kZS5qcyc7XHJcbmltcG9ydCBXYXZlR2FtZVN1bUNoYXJ0Tm9kZSBmcm9tICcuL1dhdmVHYW1lU3VtQ2hhcnROb2RlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBERUZBVUxUX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE2ICk7XHJcbmNvbnN0IEJVVFRPTl9URVhUX01BWF9XSURUSCA9IDE1MDsgLy8gbWF4V2lkdGggZm9yIGJ1dHRvbiB0ZXh0LCBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbmNvbnN0IENIRUNLX0FOU1dFUl9QUkVTU0VTID0gMTsgLy8gbnVtYmVyIG9mICdDaGVjayBBbnN3ZXInIGJ1dHRvbiBwcmVzc2VzIHJlcXVpcmVkIHRvIGVuYWJsZWQgdGhlICdTaG93IEFuc3dlcnMnIGJ1dHRvblxyXG5jb25zdCBUSVRMRV9UT1BfU1BBQ0lORyA9IDEwOyAvLyBzcGFjZSBhYm92ZSB0aGUgdGl0bGUgb2YgYSBjaGFydFxyXG5jb25zdCBUSVRMRV9CT1RUT01fU1BBQ0lORyA9IDEwOyAvLyBzcGFjZSBiZWxvdyB0aGUgdGl0bGUgb2YgYSBjaGFydFxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2F2ZUdhbWVMZXZlbE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtXYXZlR2FtZUxldmVsfSBsZXZlbFxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPFdhdmVHYW1lTGV2ZWw+fSBsZXZlbFByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBsYXlvdXRCb3VuZHNcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxCb3VuZHMyPn0gdmlzaWJsZUJvdW5kc1Byb3BlcnR5XHJcbiAgICogQHBhcmFtIHtHYW1lQXVkaW9QbGF5ZXJ9IGdhbWVBdWRpb1BsYXllclxyXG4gICAqIEBwYXJhbSB7V2F2ZUdhbWVSZXdhcmROb2RlfSByZXdhcmROb2RlXHJcbiAgICogQHBhcmFtIHtSZXdhcmREaWFsb2d9IHJld2FyZERpYWxvZ1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZXdhcmRTY29yZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbGV2ZWwsIGxldmVsUHJvcGVydHksIGxheW91dEJvdW5kcywgdmlzaWJsZUJvdW5kc1Byb3BlcnR5LCBnYW1lQXVkaW9QbGF5ZXIsIHJld2FyZE5vZGUsIHJld2FyZERpYWxvZyxcclxuICAgICAgICAgICAgICAgcmV3YXJkU2NvcmUsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGV2ZWwgaW5zdGFuY2VvZiBXYXZlR2FtZUxldmVsICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZXZlbFByb3BlcnR5IGluc3RhbmNlb2YgUHJvcGVydHkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxheW91dEJvdW5kcyBpbnN0YW5jZW9mIEJvdW5kczIgKTtcclxuICAgIGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRQcm9wZXJ0eU9mKCB2aXNpYmxlQm91bmRzUHJvcGVydHksIEJvdW5kczIgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGdhbWVBdWRpb1BsYXllciBpbnN0YW5jZW9mIEdhbWVBdWRpb1BsYXllciApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmV3YXJkTm9kZSBpbnN0YW5jZW9mIFdhdmVHYW1lUmV3YXJkTm9kZSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmV3YXJkRGlhbG9nIGluc3RhbmNlb2YgUmV3YXJkRGlhbG9nICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UG9zaXRpdmVJbnRlZ2VyKCByZXdhcmRTY29yZSApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8gcGhldC1pbyBvcHRpb25zXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7IHBoZXRpb1JlYWRPbmx5OiB0cnVlIH1cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gU3RhdHVzIEJhclxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjb25zdCBzdGF0dXNCYXJUYW5kZW0gPSBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzdGF0dXNCYXInICk7XHJcblxyXG4gICAgLy8gTGV2ZWwgZGVzY3JpcHRpb24sIGRpc3BsYXllZCBpbiB0aGUgc3RhdHVzIGJhclxyXG4gICAgY29uc3QgbGV2ZWxEZXNjcmlwdGlvblRleHQgPSBuZXcgUmljaFRleHQoIGxldmVsLnN0YXR1c0Jhck1lc3NhZ2VQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBERUZBVUxUX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiA2NTAsIC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgICAgdGFuZGVtOiBzdGF0dXNCYXJUYW5kZW0uY3JlYXRlVGFuZGVtKCAnbGV2ZWxEZXNjcmlwdGlvblRleHQnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBCYXIgYWNyb3NzIHRoZSB0b3Agb2YgdGhlIHNjcmVlblxyXG4gICAgY29uc3Qgc3RhdHVzQmFyID0gbmV3IEluZmluaXRlU3RhdHVzQmFyKCBsYXlvdXRCb3VuZHMsIHZpc2libGVCb3VuZHNQcm9wZXJ0eSwgbGV2ZWxEZXNjcmlwdGlvblRleHQsIGxldmVsLnNjb3JlUHJvcGVydHksIHtcclxuICAgICAgZmxvYXRUb1RvcDogZmFsc2UsXHJcbiAgICAgIHNwYWNpbmc6IDIwLFxyXG4gICAgICBiYXJGaWxsOiBGTVdDb2xvcnMubGV2ZWxTZWxlY3Rpb25CdXR0b25GaWxsUHJvcGVydHksIC8vIHNhbWUgYXMgbGV2ZWwtc2VsZWN0aW9uIGJ1dHRvbnMhXHJcbiAgICAgIGJhY2tCdXR0b25MaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XHJcbiAgICAgICAgbGV2ZWxQcm9wZXJ0eS52YWx1ZSA9IG51bGw7IC8vIGJhY2sgdG8gdGhlIGxldmVsLXNlbGVjdGlvbiBVSVxyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IHN0YXR1c0JhclRhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBBbXBsaXR1ZGVzIGNoYXJ0XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIFBhcmVudCB0YW5kZW0gZm9yIGFsbCBjaGFydHNcclxuICAgIGNvbnN0IGNoYXJ0c1RhbmRlbSA9IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NoYXJ0cycgKTtcclxuXHJcbiAgICAvLyBQYXJlbnQgdGFuZGVtIGZvciBhbGwgZWxlbWVudHMgcmVsYXRlZCB0byB0aGUgQW1wbGl0dWRlcyBjaGFydFxyXG4gICAgY29uc3QgYW1wbGl0dWRlc1RhbmRlbSA9IGNoYXJ0c1RhbmRlbS5jcmVhdGVUYW5kZW0oICdhbXBsaXR1ZGVzJyApO1xyXG5cclxuICAgIC8vIEtleXBhZCBEaWFsb2csIGZvciBjaGFuZ2luZyBhbXBsaXR1ZGUgdmFsdWVcclxuICAgIGNvbnN0IGFtcGxpdHVkZUtleXBhZERpYWxvZyA9IG5ldyBBbXBsaXR1ZGVLZXlwYWREaWFsb2coIGxldmVsLmd1ZXNzU2VyaWVzLmFtcGxpdHVkZVJhbmdlLCB7XHJcbiAgICAgIGRlY2ltYWxQbGFjZXM6IEZNV0NvbnN0YW50cy5XQVZFX0dBTUVfQU1QTElUVURFX0RFQ0lNQUxfUExBQ0VTLFxyXG4gICAgICBsYXlvdXRCb3VuZHM6IGxheW91dEJvdW5kcyxcclxuICAgICAgdGFuZGVtOiBhbXBsaXR1ZGVzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FtcGxpdHVkZUtleXBhZERpYWxvZycgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGFtcGxpdHVkZXNDaGFydE5vZGUgPSBuZXcgV2F2ZUdhbWVBbXBsaXR1ZGVzQ2hhcnROb2RlKCBsZXZlbC5hbXBsaXR1ZGVzQ2hhcnQsIGFtcGxpdHVkZUtleXBhZERpYWxvZywge1xyXG4gICAgICB0YW5kZW06IGFtcGxpdHVkZXNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnYW1wbGl0dWRlc0NoYXJ0Tm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEVuYWJsZWQgd2hlbiBhbnkgYW1wbGl0dWRlIGlzIG5vbi16ZXJvLlxyXG4gICAgY29uc3QgZXJhc2VyQnV0dG9uRW5hYmxlZFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyBsZXZlbC5ndWVzc1Nlcmllcy5hbXBsaXR1ZGVzUHJvcGVydHkgXSxcclxuICAgICAgYW1wbGl0dWRlcyA9PiAhIV8uZmluZCggYW1wbGl0dWRlcywgYW1wbGl0dWRlID0+ICggYW1wbGl0dWRlICE9PSAwICkgKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBFcmFzZXIgYnV0dG9uIHNldHMgYWxsIG9mIHRoZSBhbXBsaXR1ZGVzIGluIHRoZSBndWVzcyB0byB6ZXJvLlxyXG4gICAgY29uc3QgZXJhc2VyQnV0dG9uID0gbmV3IEVyYXNlckJ1dHRvbiggbWVyZ2UoIHt9LCBGTVdDb25zdGFudHMuRVJBU0VSX0JVVFRPTl9PUFRJT05TLCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgICAgICBsZXZlbC5lcmFzZUFtcGxpdHVkZXMoKTtcclxuICAgICAgfSxcclxuICAgICAgZW5hYmxlZFByb3BlcnR5OiBlcmFzZXJCdXR0b25FbmFibGVkUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogYW1wbGl0dWRlc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdlcmFzZXJCdXR0b24nIClcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlID9zaG93QW5zd2VycyBxdWVyeSBwYXJhbWV0ZXIgaXMgcHJlc2VudCwgc2hvdyB0aGUgYW5zd2VyIHRvIHRoZSBjdXJyZW50IGNoYWxsZW5nZS5cclxuICAgIC8vIFRoaXMgTm9kZSBoYXMgdmVyeSBsb3cgb3ZlcmhlYWQuIFNvIGl0IGlzIGFkZGVkIHRvIHRoZSBzY2VuZWdyYXBoIGluIGFsbCBjYXNlcyBzbyB0aGF0IGl0IGdldHMgdGVzdGVkLlxyXG4gICAgY29uc3QgYW5zd2Vyc05vZGUgPSBuZXcgQW5zd2Vyc05vZGUoIGFtcGxpdHVkZXNDaGFydE5vZGUuY2hhcnRUcmFuc2Zvcm0sIGxldmVsLmFuc3dlclNlcmllcywge1xyXG4gICAgICB2aXNpYmxlOiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnNob3dBbnN3ZXJzXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQWxsIG9mIHRoZSBlbGVtZW50cyB0aGF0IHNob3VsZCBiZSBoaWRkZW4gd2hlbiBjaGFydEV4cGFuZGVkUHJvcGVydHkgaXMgc2V0IHRvIGZhbHNlLlxyXG4gICAgLy8gSW4gdGhpcyBzY3JlZW4sIGFtcGxpdHVkZXNDaGFydC5jaGFydEV4cGFuZGVkUHJvcGVydHkgY2FuIG9ubHkgYmUgY2hhbmdlZCB2aWEgUGhFVC1pTy5cclxuICAgIGNvbnN0IGFtcGxpdHVkZXNQYXJlbnROb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBsZXZlbC5hbXBsaXR1ZGVzQ2hhcnQuY2hhcnRFeHBhbmRlZFByb3BlcnR5LFxyXG4gICAgICBjaGlsZHJlbjogWyBhbXBsaXR1ZGVzQ2hhcnROb2RlLCBlcmFzZXJCdXR0b24sIGFuc3dlcnNOb2RlIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gSGFybW9uaWNzIGNoYXJ0XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIFBhcmVudCB0YW5kZW0gZm9yIGFsbCBlbGVtZW50cyByZWxhdGVkIHRvIHRoZSBIYXJtb25pY3MgY2hhcnRcclxuICAgIGNvbnN0IGhhcm1vbmljc1RhbmRlbSA9IGNoYXJ0c1RhbmRlbS5jcmVhdGVUYW5kZW0oICdoYXJtb25pY3MnICk7XHJcblxyXG4gICAgY29uc3QgaGFybW9uaWNzVGl0bGVUZXh0ID0gbmV3IFRleHQoIEZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MuaGFybW9uaWNzQ2hhcnRTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBGTVdDb25zdGFudHMuVElUTEVfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDE1MCxcclxuICAgICAgdGFuZGVtOiBoYXJtb25pY3NUYW5kZW0uY3JlYXRlVGFuZGVtKCAnaGFybW9uaWNzVGl0bGVUZXh0JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgaGFybW9uaWNzQ2hhcnROb2RlID0gbmV3IFdhdmVHYW1lSGFybW9uaWNzQ2hhcnROb2RlKCBsZXZlbC5oYXJtb25pY3NDaGFydCwge1xyXG4gICAgICB0YW5kZW06IGhhcm1vbmljc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdoYXJtb25pY3NDaGFydE5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBbGwgb2YgdGhlIGVsZW1lbnRzIHRoYXQgc2hvdWxkIGJlIGhpZGRlbiB3aGVuIGNoYXJ0RXhwYW5kZWRQcm9wZXJ0eSBpcyBzZXQgdG8gZmFsc2UuXHJcbiAgICAvLyBJbiB0aGlzIHNjcmVlbiwgaGFybW9uaWNzQ2hhcnQuY2hhcnRFeHBhbmRlZFByb3BlcnR5IGNhbiBvbmx5IGJlIGNoYW5nZWQgdmlhIFBoRVQtaU8uXHJcbiAgICBjb25zdCBoYXJtb25pY3NQYXJlbnROb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBsZXZlbC5oYXJtb25pY3NDaGFydC5jaGFydEV4cGFuZGVkUHJvcGVydHksXHJcbiAgICAgIGNoaWxkcmVuOiBbIGhhcm1vbmljc1RpdGxlVGV4dCwgaGFybW9uaWNzQ2hhcnROb2RlIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gU3VtIGNoYXJ0XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIFBhcmVudCB0YW5kZW0gZm9yIGFsbCBjb21wb25lbnRzIHJlbGF0ZWQgdG8gdGhlIFN1bSBjaGFydFxyXG4gICAgY29uc3Qgc3VtVGFuZGVtID0gY2hhcnRzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N1bScgKTtcclxuXHJcbiAgICBjb25zdCBzdW1UaXRsZU5vZGUgPSBuZXcgVGV4dCggRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5zdW1TdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBGTVdDb25zdGFudHMuVElUTEVfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IEZNV0NvbnN0YW50cy5DSEFSVF9USVRMRV9NQVhfV0lEVEgsXHJcbiAgICAgIHRhbmRlbTogc3VtVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2hhcm1vbmljc1RpdGxlVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHN1bUNoYXJ0Tm9kZSA9IG5ldyBXYXZlR2FtZVN1bUNoYXJ0Tm9kZSggbGV2ZWwuc3VtQ2hhcnQsIHtcclxuICAgICAgdGFuZGVtOiBzdW1UYW5kZW0uY3JlYXRlVGFuZGVtKCAnc3VtQ2hhcnROb2RlJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQWxsIG9mIHRoZSBlbGVtZW50cyB0aGF0IHNob3VsZCBiZSBoaWRkZW4gd2hlbiBjaGFydEV4cGFuZGVkUHJvcGVydHkgaXMgc2V0IHRvIGZhbHNlLlxyXG4gICAgLy8gSW4gdGhpcyBzY3JlZW4sIHN1bUNoYXJ0LmNoYXJ0RXhwYW5kZWRQcm9wZXJ0eSBjYW4gb25seSBiZSBjaGFuZ2VkIHZpYSBQaEVULWlPLlxyXG4gICAgY29uc3Qgc3VtUGFyZW50Tm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbGV2ZWwuc3VtQ2hhcnQuY2hhcnRFeHBhbmRlZFByb3BlcnR5LFxyXG4gICAgICBjaGlsZHJlbjogWyBzdW1UaXRsZU5vZGUsIHN1bUNoYXJ0Tm9kZSBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIENvbnRyb2xzIHRvIHRoZSByaWdodCBvZiB0aGUgY2hhcnRzXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIENvbnRyb2xzIHRoZSBudW1iZXIgb2YgYW1wbGl0dWRlIGNvbnRyb2xzIChzbGlkZXJzKSB2aXNpYmxlIGluIHRoZSBBbXBsaXR1ZGVzIGNoYXJ0LlxyXG4gICAgY29uc3QgYW1wbGl0dWRlQ29udHJvbHNTcGlubmVyID0gbmV3IEFtcGxpdHVkZUNvbnRyb2xzU3Bpbm5lciggbGV2ZWwubnVtYmVyT2ZBbXBsaXR1ZGVDb250cm9sc1Byb3BlcnR5LCB7XHJcbiAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgZm9udDogREVGQVVMVF9GT05UXHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYW1wbGl0dWRlQ29udHJvbHNTcGlubmVyJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUGFyZW50IHRhbmRlbSBmb3IgYWxsIGJ1dHRvbnNcclxuICAgIGNvbnN0IGJ1dHRvbnNUYW5kZW0gPSBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdidXR0b25zJyApO1xyXG5cclxuICAgIC8vIFdoZXRoZXIgdGhlIHVzZXIgaGFzIGNoYW5nZWQgdGhlIGd1ZXNzIHNpbmNlIHRoZSBsYXN0IHRpbWUgdGhhdCAnQ2hlY2sgQW5zd2VyJyBidXR0b24gd2FzIHByZXNzZWQuXHJcbiAgICBjb25zdCBndWVzc0NoYW5nZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICBsZXZlbC5ndWVzc1Nlcmllcy5hbXBsaXR1ZGVzUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgZ3Vlc3NDaGFuZ2VkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRoZSBudW1iZXIgb2YgdGltZXMgdGhhdCB0aGUgJ0NoZWNrIEFuc3dlcicgYnV0dG9uIGhhcyBiZWVuIHByZXNzZWQgZm9yIHRoZSBjdXJyZW50IGNoYWxsZW5nZS5cclxuICAgIGNvbnN0IG51bWJlck9mQ2hlY2tBbnN3ZXJCdXR0b25QcmVzc2VzUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gJ0NoZWNrIEFuc3dlcicgYnV0dG9uIGlzIGVuYWJsZWQgd2hlbiB0aGUgY2hhbGxlbmdlIGhhcyBub3QgYmVlbiBzb2x2ZWQsIGFuZCB0aGUgdXNlciBoYXNcclxuICAgIC8vIGNoYW5nZWQgc29tZXRoaW5nIGFib3V0IHRoZWlyIGd1ZXNzIHRoYXQgaXMgY2hlY2thYmxlLlxyXG4gICAgY29uc3QgY2hlY2tBbnN3ZXJCdXR0b25FbmFibGVkUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIGxldmVsLmlzU29sdmVkUHJvcGVydHksIGd1ZXNzQ2hhbmdlZFByb3BlcnR5IF0sXHJcbiAgICAgICggaXNTb2x2ZWQsIGd1ZXNzQ2hhbmdlZCApID0+ICggIWlzU29sdmVkICYmIGd1ZXNzQ2hhbmdlZCApXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGNoZWNrQW5zd2VyTGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XHJcbiAgICAgIG51bWJlck9mQ2hlY2tBbnN3ZXJCdXR0b25QcmVzc2VzUHJvcGVydHkudmFsdWUrKztcclxuICAgICAgZ3Vlc3NDaGFuZ2VkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgbGV2ZWwuY2hlY2tBbnN3ZXIoKTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgY2hlY2tBbnN3ZXJCdXR0b24gPSBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCB7XHJcbiAgICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLmNoZWNrQW5zd2VyU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICBmb250OiBERUZBVUxUX0ZPTlQsXHJcbiAgICAgICAgbWF4V2lkdGg6IEJVVFRPTl9URVhUX01BWF9XSURUSFxyXG4gICAgICB9ICksXHJcbiAgICAgIGJhc2VDb2xvcjogUGhldENvbG9yU2NoZW1lLkJVVFRPTl9ZRUxMT1csXHJcbiAgICAgIGxpc3RlbmVyOiBjaGVja0Fuc3dlckxpc3RlbmVyLFxyXG4gICAgICBzb3VuZFBsYXllcjogbnVsbFNvdW5kUGxheWVyLFxyXG4gICAgICBlbmFibGVkUHJvcGVydHk6IGNoZWNrQW5zd2VyQnV0dG9uRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IGJ1dHRvbnNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnY2hlY2tBbnN3ZXJCdXR0b24nIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBbHQrQyBob3RrZXkgc3VwcG9ydCBmb3IgJ0NoZWNrIEFuc3dlcicuIGdsb2JhbEtleVN0YXRlVHJhY2tlciBsaXN0ZW5lcnMgYWx3YXlzIGZpcmUsIHNvIGl0J3Mgb3VyXHJcbiAgICAvLyByZXNwb25zaWJpbGl0eSB0byBzaG9ydC1jaXJjdWl0IHRoaXMgbGlzdGVuZXIgaWYgdGhlIGNoZWNrQW5zd2VyQnV0dG9uIGlzIG5vdCBpbiB0aGUgUERPTSwgYW5kIG5vdCBlbmFibGVkLlxyXG4gICAgZ2xvYmFsS2V5U3RhdGVUcmFja2VyLmtleWRvd25FbWl0dGVyLmFkZExpc3RlbmVyKCBldmVudCA9PiB7XHJcbiAgICAgIGlmIChcclxuICAgICAgICBjaGVja0Fuc3dlckJ1dHRvbi5wZG9tRGlzcGxheWVkICYmXHJcbiAgICAgICAgY2hlY2tBbnN3ZXJCdXR0b24uZW5hYmxlZFByb3BlcnR5LnZhbHVlICYmXHJcbiAgICAgICAgZ2xvYmFsS2V5U3RhdGVUcmFja2VyLmFsdEtleURvd24gJiZcclxuICAgICAgICBLZXlib2FyZFV0aWxzLmlzS2V5RXZlbnQoIGV2ZW50LCBLZXlib2FyZFV0aWxzLktFWV9DIClcclxuICAgICAgKSB7XHJcbiAgICAgICAgY2hlY2tBbnN3ZXJMaXN0ZW5lcigpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU21pbGV5IGZhY2UgaXMgdmlzaWJsZSB3aGVuIHRoZSB3YXZlZm9ybSBpcyBtYXRjaGVkLlxyXG4gICAgY29uc3QgZmFjZVZpc2libGVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgbGV2ZWwuaXNTb2x2ZWRQcm9wZXJ0eSwgbGV2ZWwuaXNNYXRjaGVkUHJvcGVydHkgXSxcclxuICAgICAgKCBpc1NvbHZlZCwgaXNNYXRjaGVkICkgPT4gaXNTb2x2ZWQgJiYgaXNNYXRjaGVkXHJcbiAgICApO1xyXG5cclxuICAgIC8vICdTaG93IEFuc3dlcicgYnV0dG9uIGlzIGVuYWJsZWQgYWZ0ZXIgdGhlIHVzZXIgaGFzIHRyaWVkICdDaGVjayBBbnN3ZXInLlxyXG4gICAgY29uc3Qgc2hvd0Fuc3dlckJ1dHRvbkVuYWJsZWRQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgbnVtYmVyT2ZDaGVja0Fuc3dlckJ1dHRvblByZXNzZXNQcm9wZXJ0eSwgbGV2ZWwuaXNTb2x2ZWRQcm9wZXJ0eSwgZmFjZVZpc2libGVQcm9wZXJ0eSBdLFxyXG4gICAgICAoIG51bWJlck9mQ2hlY2tBbnN3ZXJCdXR0b25QcmVzc2VzLCBpc1NvbHZlZCwgZmFjZVZpc2libGUgKSA9PlxyXG4gICAgICAgICggIWlzU29sdmVkICYmIG51bWJlck9mQ2hlY2tBbnN3ZXJCdXR0b25QcmVzc2VzID49IENIRUNLX0FOU1dFUl9QUkVTU0VTICkgfHwgKCBpc1NvbHZlZCAmJiAhZmFjZVZpc2libGUgKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBTaG93IEFuc3dlciBidXR0b24gc2hvd3MgdGhlIGFuc3dlciB0byB0aGUgY2hhbGxlbmdlLiBQb2ludHMgd2lsbCBOT1QgYmUgYXdhcmRlZCBhZnRlciBwcmVzc2luZyB0aGlzIGJ1dHRvbi5cclxuICAgIGNvbnN0IHNob3dBbnN3ZXJCdXR0b24gPSBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCB7XHJcbiAgICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLnNob3dBbnN3ZXJTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICAgIGZvbnQ6IERFRkFVTFRfRk9OVCxcclxuICAgICAgICBtYXhXaWR0aDogQlVUVE9OX1RFWFRfTUFYX1dJRFRIXHJcbiAgICAgIH0gKSxcclxuICAgICAgYmFzZUNvbG9yOiBQaGV0Q29sb3JTY2hlbWUuQlVUVE9OX1lFTExPVyxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xyXG4gICAgICAgIGxldmVsLnNob3dBbnN3ZXIoKTtcclxuICAgICAgfSxcclxuICAgICAgZW5hYmxlZFByb3BlcnR5OiBzaG93QW5zd2VyQnV0dG9uRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IGJ1dHRvbnNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnc2hvd0Fuc3dlckJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZXMgYSBuZXcgY2hhbGxlbmdlLCBhIG5ldyB3YXZlZm9ybSB0byBtYXRjaC5cclxuICAgIGNvbnN0IG5ld1dhdmVmb3JtID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xyXG4gICAgICBsZXZlbC5uZXdXYXZlZm9ybSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBOZXcgV2F2ZWZvcm0gYnV0dG9uIGxvYWRzIGEgbmV3IGNoYWxsZW5nZS5cclxuICAgIGNvbnN0IG5ld1dhdmVmb3JtQnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogbmV3V2F2ZWZvcm0sXHJcbiAgICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLm5ld1dhdmVmb3JtU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICBmb250OiBERUZBVUxUX0ZPTlQsXHJcbiAgICAgICAgbWF4V2lkdGg6IEJVVFRPTl9URVhUX01BWF9XSURUSFxyXG4gICAgICB9ICksXHJcbiAgICAgIGJhc2VDb2xvcjogUGhldENvbG9yU2NoZW1lLkJVVFRPTl9ZRUxMT1csXHJcbiAgICAgIHRhbmRlbTogYnV0dG9uc1RhbmRlbS5jcmVhdGVUYW5kZW0oICduZXdXYXZlZm9ybUJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGJ1dHRvbnNCb3ggPSBuZXcgVkJveCgge1xyXG4gICAgICBzcGFjaW5nOiAyMCxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBjaGVja0Fuc3dlckJ1dHRvbixcclxuICAgICAgICBzaG93QW5zd2VyQnV0dG9uLFxyXG4gICAgICAgIG5ld1dhdmVmb3JtQnV0dG9uXHJcbiAgICAgIF0sXHJcbiAgICAgIHRhbmRlbTogYnV0dG9uc1RhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBUcmFuc2llbnQgVUkgZWxlbWVudHMgdGhhdCBwcm92aWRlIGdhbWUgZmVlZGJhY2tcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY29uc3QgZmVlZGJhY2tUYW5kZW0gPSBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdmZWVkYmFjaycgKTtcclxuXHJcbiAgICBjb25zdCBzbWlsZXlGYWNlTm9kZSA9IG5ldyBGYWNlTm9kZSggMTI1IC8qIGhlYWREaWFtZXRlciAqLywge1xyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IGZhY2VWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogZmVlZGJhY2tUYW5kZW0uY3JlYXRlVGFuZGVtKCAnc21pbGV5RmFjZU5vZGUnICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2hvd24gd2hlbiBhIGNvcnJlY3QgZ3Vlc3MgaXMgbWFkZSwgdGhlbiBmYWRlcyBvdXQuXHJcbiAgICBjb25zdCBwb2ludHNBd2FyZGVkTm9kZSA9IG5ldyBQb2ludHNBd2FyZGVkTm9kZSgge1xyXG4gICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgdGFuZGVtOiBmZWVkYmFja1RhbmRlbS5jcmVhdGVUYW5kZW0oICdwb2ludHNBd2FyZGVkTm9kZScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTaG93biB3aGVuIGFuIGluY29ycmVjdCBndWVzcyBpcyBtYWRlLCB0aGVuIGZhZGVzIG91dC5cclxuICAgIGNvbnN0IGZyb3dueUZhY2VOb2RlID0gbmV3IEZhY2VOb2RlKCAyNTAgLyogaGVhZERpYW1ldGVyICovLCB7XHJcbiAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICB0YW5kZW06IGZlZWRiYWNrVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Zyb3dueUZhY2VOb2RlJyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxyXG4gICAgfSApO1xyXG4gICAgZnJvd255RmFjZU5vZGUuZnJvd24oKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gUmVuZGVyaW5nIG9yZGVyXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmNoaWxkcmVuLCAnV2F2ZUdhbWVMZXZlbE5vZGUgc2V0cyBjaGlsZHJlbicgKTtcclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbXHJcbiAgICAgIHN0YXR1c0JhcixcclxuICAgICAgYW1wbGl0dWRlc1BhcmVudE5vZGUsXHJcbiAgICAgIGhhcm1vbmljc1BhcmVudE5vZGUsXHJcbiAgICAgIHN1bVBhcmVudE5vZGUsXHJcbiAgICAgIGFtcGxpdHVkZUNvbnRyb2xzU3Bpbm5lcixcclxuICAgICAgYnV0dG9uc0JveCxcclxuICAgICAgc21pbGV5RmFjZU5vZGUsXHJcbiAgICAgIHBvaW50c0F3YXJkZWROb2RlLFxyXG4gICAgICBmcm93bnlGYWNlTm9kZVxyXG4gICAgXTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBMYXlvdXRcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgYW1wbGl0dWRlc0NoYXJ0Tm9kZS54ID0gRk1XQ29uc3RhbnRzLlhfQ0hBUlRfUkVDVEFOR0xFUztcclxuICAgIGFtcGxpdHVkZXNDaGFydE5vZGUudG9wID0gc3RhdHVzQmFyLmJvdHRvbSArIDU7XHJcbiAgICBjb25zdCBhbXBsaXR1ZGVzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcyA9IGFtcGxpdHVkZXNDaGFydE5vZGUuY2hhcnRSZWN0YW5nbGUuYm91bmRzVG8oIHRoaXMgKTtcclxuXHJcbiAgICBoYXJtb25pY3NUaXRsZVRleHQuYm91bmRzUHJvcGVydHkubGluayggYm91bmRzID0+IHtcclxuICAgICAgaGFybW9uaWNzVGl0bGVUZXh0LmxlZnQgPSBsYXlvdXRCb3VuZHMubGVmdCArIEZNV0NvbnN0YW50cy5TQ1JFRU5fVklFV19YX01BUkdJTjtcclxuICAgICAgaGFybW9uaWNzVGl0bGVUZXh0LnRvcCA9IGFtcGxpdHVkZXNDaGFydE5vZGUuYm90dG9tICsgVElUTEVfVE9QX1NQQUNJTkc7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgaGFybW9uaWNzQ2hhcnROb2RlLnggPSBhbXBsaXR1ZGVzQ2hhcnROb2RlLng7XHJcbiAgICBoYXJtb25pY3NDaGFydE5vZGUueSA9IGhhcm1vbmljc1RpdGxlVGV4dC5ib3R0b20gKyBUSVRMRV9CT1RUT01fU1BBQ0lORztcclxuICAgIGNvbnN0IGhhcm1vbmljc0NoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMgPSBoYXJtb25pY3NDaGFydE5vZGUuY2hhcnRSZWN0YW5nbGUuYm91bmRzVG8oIHRoaXMgKTtcclxuXHJcbiAgICBzdW1UaXRsZU5vZGUuYm91bmRzUHJvcGVydHkubGluayggYm91bmRzID0+IHtcclxuICAgICAgc3VtVGl0bGVOb2RlLmxlZnQgPSBoYXJtb25pY3NUaXRsZVRleHQubGVmdDtcclxuICAgICAgc3VtVGl0bGVOb2RlLnRvcCA9IGhhcm1vbmljc0NoYXJ0Tm9kZS5ib3R0b20gKyBUSVRMRV9UT1BfU1BBQ0lORztcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdW1DaGFydE5vZGUueCA9IGFtcGxpdHVkZXNDaGFydE5vZGUueDtcclxuICAgIHN1bUNoYXJ0Tm9kZS55ID0gc3VtVGl0bGVOb2RlLmJvdHRvbSArIFRJVExFX0JPVFRPTV9TUEFDSU5HO1xyXG4gICAgY29uc3Qgc3VtQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcyA9IHN1bUNoYXJ0Tm9kZS5jaGFydFJlY3RhbmdsZS5ib3VuZHNUbyggdGhpcyApO1xyXG5cclxuICAgIC8vIEJlbG93IHRoZSBBbXBsaXR1ZGVzIGNoYXJ0XHJcbiAgICBhbnN3ZXJzTm9kZS54ID0gYW1wbGl0dWRlc0NoYXJ0Tm9kZS54O1xyXG4gICAgYW5zd2Vyc05vZGUudG9wID0gYW1wbGl0dWRlc0NoYXJ0Tm9kZS5ib3R0b207XHJcblxyXG4gICAgLy8gVG8gdGhlIHJpZ2h0IG9mIHRoZSBhbXBsaXR1ZGUgTnVtYmVyRGlzcGxheXNcclxuICAgIGNvbnN0IGFtcGxpdHVkZXNDaGFydFJpZ2h0VG9wID0gYW1wbGl0dWRlc0NoYXJ0Tm9kZS5sb2NhbFRvR2xvYmFsUG9pbnQoIGFtcGxpdHVkZXNDaGFydE5vZGUuY2hhcnRSZWN0YW5nbGUucmlnaHRUb3AgKTtcclxuICAgIGVyYXNlckJ1dHRvbi5sZWZ0ID0gYW1wbGl0dWRlc0NoYXJ0UmlnaHRUb3AueCArIDEwO1xyXG4gICAgZXJhc2VyQnV0dG9uLmJvdHRvbSA9IGFtcGxpdHVkZXNDaGFydFJpZ2h0VG9wLnkgLSAxMDtcclxuXHJcbiAgICAvLyBjZW50ZXJlZCBvbiB0aGUgSGFybW9uaWNzIGNoYXJ0XHJcbiAgICBmcm93bnlGYWNlTm9kZS5jZW50ZXJYID0gaGFybW9uaWNzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcy5jZW50ZXJYO1xyXG4gICAgZnJvd255RmFjZU5vZGUuY2VudGVyWSA9IGhhcm1vbmljc0NoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMuY2VudGVyWTtcclxuXHJcbiAgICAvLyBDZW50ZXIgb2YgdGhlIHNwYWNlIHRvIHRoZSByaWdodCBvZiB0aGUgY2hhcnRzXHJcbiAgICBjb25zdCBjb250cm9sc0NlbnRlclggPSBhbXBsaXR1ZGVzQ2hhcnROb2RlLnJpZ2h0ICsgKCBsYXlvdXRCb3VuZHMucmlnaHQgLSBhbXBsaXR1ZGVzQ2hhcnROb2RlLnJpZ2h0ICkgLyAyO1xyXG5cclxuICAgIC8vIGNlbnRlcmVkIG9uIHRoZSBBbXBsaXR1ZGVzIGNoYXJ0XHJcbiAgICBhbXBsaXR1ZGVDb250cm9sc1NwaW5uZXIuYm91bmRzUHJvcGVydHkubGluayggYm91bmRzID0+IHtcclxuICAgICAgYW1wbGl0dWRlQ29udHJvbHNTcGlubmVyLmNlbnRlclggPSBjb250cm9sc0NlbnRlclg7XHJcbiAgICAgIGFtcGxpdHVkZUNvbnRyb2xzU3Bpbm5lci5jZW50ZXJZID0gYW1wbGl0dWRlc0NoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMuY2VudGVyWTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBidXR0b25zIGNlbnRlcmVkIG9uIEhhcm1vbmljcyBjaGFydFxyXG4gICAgYnV0dG9uc0JveC5ib3VuZHNQcm9wZXJ0eS5saW5rKCBib3VuZHMgPT4ge1xyXG4gICAgICBidXR0b25zQm94LmNlbnRlclggPSBjb250cm9sc0NlbnRlclg7XHJcbiAgICAgIGJ1dHRvbnNCb3guY2VudGVyWSA9IGhhcm1vbmljc0NoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMuY2VudGVyWTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjZW50ZXJlZCBvbiB0aGUgU3VtIGNoYXJ0XHJcbiAgICBzbWlsZXlGYWNlTm9kZS5jZW50ZXJYID0gY29udHJvbHNDZW50ZXJYO1xyXG4gICAgc21pbGV5RmFjZU5vZGUuY2VudGVyWSA9IHN1bUNoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMuY2VudGVyWTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gTWlzYy4gbGlzdGVuZXJzIHJlbGF0ZWQgdG8gZ2FtZSBmbG93XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIFdoZW4gYSBuZXcgd2F2ZWZvcm0gKGNoYWxsZW5nZSkgaXMgcHJlc2VudGVkLCByZXNldCBzb21lIHRoaW5ncy5cclxuICAgIGxldmVsLm5ld1dhdmVmb3JtRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICBwb2ludHNBd2FyZGVkTm9kZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIGZyb3dueUZhY2VOb2RlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgZ3Vlc3NDaGFuZ2VkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgbnVtYmVyT2ZDaGVja0Fuc3dlckJ1dHRvblByZXNzZXNQcm9wZXJ0eS52YWx1ZSA9IDA7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgdXNlcidzIGd1ZXNzIGlzIGNvcnJlY3QsIHByb3ZpZGUgZmVlZGJhY2suXHJcbiAgICBsZXZlbC5jb3JyZWN0RW1pdHRlci5hZGRMaXN0ZW5lciggcG9pbnRzQXdhcmRlZCA9PiB7XHJcblxyXG4gICAgICAvLyBJbnRlcnJ1cHQgYW55IGluLXByb2dyZXNzIGludGVyYWN0aW9ucywgc2luY2UgdGhlIGNoYWxsZW5nZSBoYXMgYmVlbiBzb2x2ZWQuXHJcbiAgICAgIC8vIFRoZSB1c2VyIGlzIGZyZWUgdG8gcmVzdW1lIGV4cGVyaW1lbnRpbmcgd2l0aCB0aGUgY3VycmVudCBjaGFsbGVuZ2UgYWZ0ZXIgdGhpcyBwb2ludC5cclxuICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuXHJcbiAgICAgIGlmICggbGV2ZWwuc2NvcmVQcm9wZXJ0eS52YWx1ZSA9PT0gcmV3YXJkU2NvcmUgfHwgRk1XUXVlcnlQYXJhbWV0ZXJzLnNob3dSZXdhcmQgKSB7XHJcblxyXG4gICAgICAgIC8vIFRoZSBzY29yZSBoYXMgcmVhY2hlZCB0aGUgbWFnaWMgbnVtYmVyIHdoZXJlIGEgcmV3YXJkIGlzIGRpc3BsYXkuXHJcbiAgICAgICAgZ2FtZUF1ZGlvUGxheWVyLmdhbWVPdmVyUGVyZmVjdFNjb3JlKCk7XHJcbiAgICAgICAgcmV3YXJkRGlhbG9nLnNob3coKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gVGhlIHNjb3JlIGRvZXNuJ3Qgd2FycmFudCBhIHJld2FyZCwgc28ganVzdCBzaG93IHRoZSBwb2ludHMgdGhhdCB3ZXJlIHJld2FyZGVkLlxyXG4gICAgICAgIHRoaXMuY29ycmVjdEZlZWRiYWNrKCBwb2ludHNBd2FyZGVkICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSB1c2VyJ3MgZ3Vlc3MgaXMgaW5jb3JyZWN0LCBwcm92aWRlIGZlZWRiYWNrLlxyXG4gICAgbGV2ZWwuaW5jb3JyZWN0RW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gdGhpcy5pbmNvcnJlY3RGZWVkYmFjaygpICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIFBET01cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gcGRvbSAtIHRyYXZlcnNhbCBvcmRlclxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mb3VyaWVyLW1ha2luZy13YXZlcy9pc3N1ZXMvNTNcclxuICAgIHRoaXMucERvbU9yZGVyID0gW1xyXG4gICAgICBzdGF0dXNCYXIsXHJcbiAgICAgIGFtcGxpdHVkZXNDaGFydE5vZGUsXHJcbiAgICAgIGVyYXNlckJ1dHRvbixcclxuICAgICAgYW1wbGl0dWRlQ29udHJvbHNTcGlubmVyLFxyXG4gICAgICBjaGVja0Fuc3dlckJ1dHRvbixcclxuICAgICAgc2hvd0Fuc3dlckJ1dHRvbixcclxuICAgICAgbmV3V2F2ZWZvcm1CdXR0b25cclxuICAgIF07XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIENsYXNzIGZpZWxkc1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLmxldmVsID0gbGV2ZWw7IC8vIHtXYXZlR2FtZUxldmVsfVxyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmxheW91dEJvdW5kcyA9IGxheW91dEJvdW5kczsgLy8ge0JvdW5kczJ9XHJcbiAgICB0aGlzLmdhbWVBdWRpb1BsYXllciA9IGdhbWVBdWRpb1BsYXllcjsgLy8ge0dhbWVBdWRpb1BsYXllcn1cclxuICAgIHRoaXMuaGFybW9uaWNzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcyA9IGhhcm1vbmljc0NoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHM7IC8vIHtCb3VuZHMyfVxyXG4gICAgdGhpcy5wb2ludHNBd2FyZGVkTm9kZSA9IHBvaW50c0F3YXJkZWROb2RlOyAvLyB7UG9pbnRzQXdhcmRlZE5vZGV9XHJcbiAgICB0aGlzLnBvaW50c0F3YXJkZWRBbmltYXRpb24gPSBudWxsOyAvLyB7QW5pbWF0aW9ufG51bGx9XHJcbiAgICB0aGlzLmZyb3dueUZhY2VOb2RlID0gZnJvd255RmFjZU5vZGU7IC8vIHtGYWNlTm9kZX1cclxuICAgIHRoaXMuZnJvd255RmFjZUFuaW1hdGlvbiA9IG51bGw7IC8vIHtBbmltYXRpb258bnVsbH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIGVsYXBzZWQgdGltZSwgaW4gc2Vjb25kc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMucG9pbnRzQXdhcmRlZEFuaW1hdGlvbiAmJiB0aGlzLnBvaW50c0F3YXJkZWRBbmltYXRpb24uc3RlcCggZHQgKTtcclxuICAgIHRoaXMuZnJvd255RmFjZUFuaW1hdGlvbiAmJiB0aGlzLmZyb3dueUZhY2VBbmltYXRpb24uc3RlcCggZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByb3ZpZGVzIGZlZWRiYWNrIHdoZW4gdGhlIHVzZXIgaGFzIG1hZGUgYSBjb3JyZWN0IGd1ZXNzLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwb2ludHNBd2FyZGVkXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjb3JyZWN0RmVlZGJhY2soIHBvaW50c0F3YXJkZWQgKSB7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UG9zaXRpdmVOdW1iZXIoIHBvaW50c0F3YXJkZWQgKTtcclxuXHJcbiAgICAvLyBBdWRpbyBmZWVkYmFja1xyXG4gICAgdGhpcy5nYW1lQXVkaW9QbGF5ZXIuY29ycmVjdEFuc3dlcigpO1xyXG5cclxuICAgIC8vIFNob3cgcG9pbnRzIGF3YXJkZWQsIGNlbnRlcmVkIG9uIGNoYXJ0cy5cclxuICAgIHRoaXMucG9pbnRzQXdhcmRlZE5vZGUuc2V0UG9pbnRzKCBwb2ludHNBd2FyZGVkICk7XHJcbiAgICB0aGlzLnBvaW50c0F3YXJkZWROb2RlLmNlbnRlclggPSB0aGlzLmhhcm1vbmljc0NoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMuY2VudGVyWDtcclxuICAgIHRoaXMucG9pbnRzQXdhcmRlZE5vZGUuY2VudGVyWSA9IHRoaXMuaGFybW9uaWNzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcy5jZW50ZXJZO1xyXG5cclxuICAgIC8vIEFuaW1hdGUgb3BhY2l0eSBvZiBwb2ludHNBd2FyZGVkTm9kZSwgZmFkZSBpdCBvdXQuXHJcbiAgICB0aGlzLnBvaW50c0F3YXJkZWROb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgdGhpcy5wb2ludHNBd2FyZGVkTm9kZS5vcGFjaXR5UHJvcGVydHkudmFsdWUgPSAxO1xyXG4gICAgdGhpcy5wb2ludHNBd2FyZGVkQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICBzdGVwRW1pdHRlcjogbnVsbCwgLy8gdmlhIHN0ZXAgZnVuY3Rpb25cclxuICAgICAgZGVsYXk6IDEsXHJcbiAgICAgIGR1cmF0aW9uOiAwLjgsXHJcbiAgICAgIHRhcmdldHM6IFsge1xyXG4gICAgICAgIHByb3BlcnR5OiB0aGlzLnBvaW50c0F3YXJkZWROb2RlLm9wYWNpdHlQcm9wZXJ0eSxcclxuICAgICAgICBlYXNpbmc6IEVhc2luZy5MSU5FQVIsXHJcbiAgICAgICAgdG86IDBcclxuICAgICAgfSBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5wb2ludHNBd2FyZGVkQW5pbWF0aW9uLmZpbmlzaEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgdGhpcy5wb2ludHNBd2FyZGVkTm9kZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMucG9pbnRzQXdhcmRlZEFuaW1hdGlvbiA9IG51bGw7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5wb2ludHNBd2FyZGVkQW5pbWF0aW9uLnN0YXJ0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQcm92aWRlcyBmZWVkYmFjayB3aGVuIHRoZSB1c2VyIGhhcyBtYWRlIGFuIGluY29ycmVjdCBndWVzcy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGluY29ycmVjdEZlZWRiYWNrKCkge1xyXG5cclxuICAgIC8vIEF1ZGlvIGZlZWRiYWNrXHJcbiAgICB0aGlzLmdhbWVBdWRpb1BsYXllci53cm9uZ0Fuc3dlcigpO1xyXG5cclxuICAgIC8vIEFuaW1hdGUgb3BhY2l0eSBvZiBmcm93bnlGYWNlTm9kZSwgZmFkZSBpdCBvdXQuXHJcbiAgICB0aGlzLmZyb3dueUZhY2VOb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgdGhpcy5mcm93bnlGYWNlTm9kZS5vcGFjaXR5UHJvcGVydHkudmFsdWUgPSAxO1xyXG4gICAgdGhpcy5mcm93bnlGYWNlQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICBzdGVwRW1pdHRlcjogbnVsbCwgLy8gdmlhIHN0ZXAgZnVuY3Rpb25cclxuICAgICAgZGVsYXk6IDEsXHJcbiAgICAgIGR1cmF0aW9uOiAwLjgsXHJcbiAgICAgIHRhcmdldHM6IFsge1xyXG4gICAgICAgIHByb3BlcnR5OiB0aGlzLmZyb3dueUZhY2VOb2RlLm9wYWNpdHlQcm9wZXJ0eSxcclxuICAgICAgICBlYXNpbmc6IEVhc2luZy5MSU5FQVIsXHJcbiAgICAgICAgdG86IDBcclxuICAgICAgfSBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5mcm93bnlGYWNlQW5pbWF0aW9uLmZpbmlzaEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgdGhpcy5mcm93bnlGYWNlTm9kZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuZnJvd255RmFjZUFuaW1hdGlvbiA9IG51bGw7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5mcm93bnlGYWNlQW5pbWF0aW9uLnN0YXJ0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5mb3VyaWVyTWFraW5nV2F2ZXMucmVnaXN0ZXIoICdXYXZlR2FtZUxldmVsTm9kZScsIFdhdmVHYW1lTGV2ZWxOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwwQ0FBMEM7QUFDbEUsT0FBT0MsWUFBWSxNQUFNLHFEQUFxRDtBQUM5RSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLGVBQWUsTUFBTSxnREFBZ0Q7QUFDNUUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxxQkFBcUIsRUFBRUMsYUFBYSxFQUFFQyxJQUFJLEVBQUVDLFFBQVEsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3BILE9BQU9DLHFCQUFxQixNQUFNLHFEQUFxRDtBQUN2RixPQUFPQyxlQUFlLE1BQU0sOERBQThEO0FBQzFGLE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsU0FBUyxNQUFNLG1DQUFtQztBQUN6RCxPQUFPQyxNQUFNLE1BQU0sZ0NBQWdDO0FBQ25ELE9BQU9DLGVBQWUsTUFBTSx5Q0FBeUM7QUFDckUsT0FBT0MsaUJBQWlCLE1BQU0sMkNBQTJDO0FBQ3pFLE9BQU9DLFlBQVksTUFBTSxzQ0FBc0M7QUFDL0QsT0FBT0MsU0FBUyxNQUFNLDJCQUEyQjtBQUNqRCxPQUFPQyxZQUFZLE1BQU0sOEJBQThCO0FBQ3ZE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