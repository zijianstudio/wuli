// Copyright 2013-2023, University of Colorado Boulder

/**
 * Base type view for all challenges.
 * Provides the view components that are common to all challenges.
 *
 * Subtypes are responsible for:
 * - providing the nodes for graph and equations
 * - positioning faceNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import FaceWithPointsNode from '../../../../scenery-phet/js/FaceWithPointsNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import PointToolNode from '../../common/view/PointToolNode.js';
import graphingLines from '../../graphingLines.js';
import PointSlopeEquationNode from '../../pointslope/view/PointSlopeEquationNode.js';
import SlopeInterceptEquationNode from '../../slopeintercept/view/SlopeInterceptEquationNode.js';
import LineGameConstants from '../LineGameConstants.js';
import EquationForm from '../model/EquationForm.js';
import PlayState from '../model/PlayState.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';

// strings
const checkStringProperty = VegasStrings.checkStringProperty;
const nextStringProperty = VegasStrings.nextStringProperty;
const showAnswerStringProperty = VegasStrings.showAnswerStringProperty;
const tryAgainStringProperty = VegasStrings.tryAgainStringProperty;
export default class ChallengeNode extends Node {
  // subclasses should add children to this node, to preserve rendering order

  /**
   * @param challenge - the challenge
   * @param model - the game model
   * @param challengeSize - dimensions of the view rectangle that is available for rendering the challenge
   * @param audioPlayer - the audio player, for providing audio feedback during game play
   */
  constructor(challenge, model, challengeSize, audioPlayer) {
    super();
    this.subtypeParent = new Node();
    this.faceNode = new FaceWithPointsNode({
      faceDiameter: LineGameConstants.FACE_DIAMETER,
      faceOpacity: 1,
      pointsAlignment: 'rightCenter'
    });

    // buttons
    const buttonOptions = {
      font: LineGameConstants.BUTTON_FONT,
      baseColor: LineGameConstants.BUTTON_COLOR,
      xMargin: 20,
      yMargin: 5,
      centerX: 0 // center aligned
    };

    const checkButton = new TextPushButton(checkStringProperty, buttonOptions);
    const tryAgainButton = new TextPushButton(tryAgainStringProperty, buttonOptions);
    const showAnswerButton = new TextPushButton(showAnswerStringProperty, buttonOptions);
    const nextButton = new TextPushButton(nextStringProperty, buttonOptions);
    this.buttonsParent = new Node({
      children: [checkButton, tryAgainButton, showAnswerButton, nextButton],
      maxWidth: 400 // determined empirically
    });

    // point tools
    const linesVisibleProperty = new BooleanProperty(true);
    const pointToolNode1 = new PointToolNode(challenge.pointTool1, challenge.modelViewTransform, challenge.graph, linesVisibleProperty, {
      scale: LineGameConstants.POINT_TOOL_SCALE
    });
    const pointToolNode2 = new PointToolNode(challenge.pointTool2, challenge.modelViewTransform, challenge.graph, linesVisibleProperty, {
      scale: LineGameConstants.POINT_TOOL_SCALE
    });

    // Point tools moveToFront when dragged, so we give them a common parent to preserve rendering order of the reset of the scenegraph.
    const pointToolParent = new Node();
    pointToolParent.addChild(pointToolNode1);
    pointToolParent.addChild(pointToolNode2);

    // rendering order
    this.addChild(this.subtypeParent);
    this.addChild(this.buttonsParent);
    this.addChild(pointToolParent);
    this.addChild(this.faceNode);

    // buttons at center-bottom
    this.buttonsParent.centerX = challenge.modelViewTransform.modelToViewX(challenge.graph.xRange.min); // centered on left edge of graph
    this.buttonsParent.bottom = challengeSize.height - 20;

    // debugging controls
    let skipButton;
    let replayButton;
    if (phet.chipper.queryParameters.showAnswers) {
      // description at leftTop
      const descriptionNode = new Text(challenge.description, {
        font: new PhetFont(16),
        fill: 'black'
      });
      descriptionNode.left = 10;
      descriptionNode.top = 10;
      this.addChild(descriptionNode);

      // developer buttons (no i18n) to right of main buttons
      const devButtonOptions = {
        font: new PhetFont(20),
        baseColor: 'red',
        textFill: 'white'
      };

      // skips the current challenge.
      skipButton = new TextPushButton('Skip', devButtonOptions);
      skipButton.addListener(() => model.skipCurrentChallenge());

      // replays the current challenge.
      replayButton = new TextPushButton('Replay', devButtonOptions);
      replayButton.addListener(() => model.replayCurrentChallenge());
      const devButtonsParent = new Node({
        children: [skipButton, replayButton]
      });
      devButtonsParent.left = this.buttonsParent.right + 15;
      devButtonsParent.centerY = this.buttonsParent.centerY;
      this.addChild(devButtonsParent);
      devButtonsParent.moveToBack();
    }

    // 'Check' button
    checkButton.addListener(() => {
      if (challenge.isCorrect()) {
        this.faceNode.smile();
        audioPlayer.correctAnswer();
        const points = model.computePoints(model.playStateProperty.value === PlayState.FIRST_CHECK ? 1 : 2 /* number of attempts */);

        // Prevent score from exceeding perfect score, in case we replay challenges with ?gameDebug query parameter.
        // See https://github.com/phetsims/graphing-lines/issues/70
        model.scoreProperty.value = Math.min(model.scoreProperty.value + points, model.getPerfectScore());
        this.faceNode.setPoints(points);
        model.playStateProperty.value = PlayState.NEXT;
      } else {
        this.faceNode.frown();
        this.faceNode.setPoints(0);
        audioPlayer.wrongAnswer();
        if (model.playStateProperty.value === PlayState.FIRST_CHECK) {
          model.playStateProperty.value = PlayState.TRY_AGAIN;
        } else {
          model.playStateProperty.value = PlayState.SHOW_ANSWER;
        }
      }
    });

    // 'Try Again' button
    tryAgainButton.addListener(() => {
      model.playStateProperty.value = PlayState.SECOND_CHECK;
    });

    // 'Show Answer' button
    showAnswerButton.addListener(() => {
      model.playStateProperty.value = PlayState.NEXT;
    });

    // 'Next' button
    nextButton.addListener(() => {
      model.playStateProperty.value = PlayState.FIRST_CHECK;
    });

    // play-state changes
    const playStateObserver = state => {
      // visibility of face
      this.faceNode.visible = state === PlayState.TRY_AGAIN || state === PlayState.SHOW_ANSWER || state === PlayState.NEXT && challenge.isCorrect();

      // visibility of buttons
      checkButton.visible = state === PlayState.FIRST_CHECK || state === PlayState.SECOND_CHECK;
      tryAgainButton.visible = state === PlayState.TRY_AGAIN;
      showAnswerButton.visible = state === PlayState.SHOW_ANSWER;
      nextButton.visible = state === PlayState.NEXT;

      // dev buttons
      if (replayButton && skipButton) {
        replayButton.visible = state === PlayState.NEXT;
        skipButton.visible = !replayButton.visible;
      }
    };
    model.playStateProperty.link(playStateObserver); // unlink in dispose

    // Move from "Try Again" to "Check" state when the user changes their guess, see graphing-lines#47.
    const guessObserver = guess => {
      if (model.playStateProperty.value === PlayState.TRY_AGAIN) {
        model.playStateProperty.value = PlayState.SECOND_CHECK;
      }
    };
    challenge.guessProperty.link(guessObserver); // unlink in dispose

    this.disposeChallengeNode = () => {
      pointToolNode1.dispose();
      pointToolNode2.dispose();
      model.playStateProperty.unlink(playStateObserver);
      challenge.guessProperty.unlink(guessObserver);
    };
  }
  dispose() {
    this.disposeChallengeNode();
    super.dispose();
  }

  /**
   * Creates a non-interactive equation, used to label the specified line.
   */
  static createEquationNode(lineProperty, equationForm, providedOptions) {
    const options = combineOptions({
      fontSize: 18,
      slopeUndefinedVisible: true
    }, providedOptions);
    if (equationForm === EquationForm.SLOPE_INTERCEPT) {
      return SlopeInterceptEquationNode.createDynamicLabel(lineProperty, options);
    } else if (equationForm === EquationForm.POINT_SLOPE) {
      return PointSlopeEquationNode.createDynamicLabel(lineProperty, options);
    } else {
      throw new Error(`unsupported equation form: ${equationForm.name}`);
    }
  }
}
graphingLines.register('ChallengeNode', ChallengeNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJGYWNlV2l0aFBvaW50c05vZGUiLCJQaGV0Rm9udCIsIk5vZGUiLCJUZXh0IiwiVGV4dFB1c2hCdXR0b24iLCJWZWdhc1N0cmluZ3MiLCJQb2ludFRvb2xOb2RlIiwiZ3JhcGhpbmdMaW5lcyIsIlBvaW50U2xvcGVFcXVhdGlvbk5vZGUiLCJTbG9wZUludGVyY2VwdEVxdWF0aW9uTm9kZSIsIkxpbmVHYW1lQ29uc3RhbnRzIiwiRXF1YXRpb25Gb3JtIiwiUGxheVN0YXRlIiwiY29tYmluZU9wdGlvbnMiLCJjaGVja1N0cmluZ1Byb3BlcnR5IiwibmV4dFN0cmluZ1Byb3BlcnR5Iiwic2hvd0Fuc3dlclN0cmluZ1Byb3BlcnR5IiwidHJ5QWdhaW5TdHJpbmdQcm9wZXJ0eSIsIkNoYWxsZW5nZU5vZGUiLCJjb25zdHJ1Y3RvciIsImNoYWxsZW5nZSIsIm1vZGVsIiwiY2hhbGxlbmdlU2l6ZSIsImF1ZGlvUGxheWVyIiwic3VidHlwZVBhcmVudCIsImZhY2VOb2RlIiwiZmFjZURpYW1ldGVyIiwiRkFDRV9ESUFNRVRFUiIsImZhY2VPcGFjaXR5IiwicG9pbnRzQWxpZ25tZW50IiwiYnV0dG9uT3B0aW9ucyIsImZvbnQiLCJCVVRUT05fRk9OVCIsImJhc2VDb2xvciIsIkJVVFRPTl9DT0xPUiIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiY2VudGVyWCIsImNoZWNrQnV0dG9uIiwidHJ5QWdhaW5CdXR0b24iLCJzaG93QW5zd2VyQnV0dG9uIiwibmV4dEJ1dHRvbiIsImJ1dHRvbnNQYXJlbnQiLCJjaGlsZHJlbiIsIm1heFdpZHRoIiwibGluZXNWaXNpYmxlUHJvcGVydHkiLCJwb2ludFRvb2xOb2RlMSIsInBvaW50VG9vbDEiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJncmFwaCIsInNjYWxlIiwiUE9JTlRfVE9PTF9TQ0FMRSIsInBvaW50VG9vbE5vZGUyIiwicG9pbnRUb29sMiIsInBvaW50VG9vbFBhcmVudCIsImFkZENoaWxkIiwibW9kZWxUb1ZpZXdYIiwieFJhbmdlIiwibWluIiwiYm90dG9tIiwiaGVpZ2h0Iiwic2tpcEJ1dHRvbiIsInJlcGxheUJ1dHRvbiIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwic2hvd0Fuc3dlcnMiLCJkZXNjcmlwdGlvbk5vZGUiLCJkZXNjcmlwdGlvbiIsImZpbGwiLCJsZWZ0IiwidG9wIiwiZGV2QnV0dG9uT3B0aW9ucyIsInRleHRGaWxsIiwiYWRkTGlzdGVuZXIiLCJza2lwQ3VycmVudENoYWxsZW5nZSIsInJlcGxheUN1cnJlbnRDaGFsbGVuZ2UiLCJkZXZCdXR0b25zUGFyZW50IiwicmlnaHQiLCJjZW50ZXJZIiwibW92ZVRvQmFjayIsImlzQ29ycmVjdCIsInNtaWxlIiwiY29ycmVjdEFuc3dlciIsInBvaW50cyIsImNvbXB1dGVQb2ludHMiLCJwbGF5U3RhdGVQcm9wZXJ0eSIsInZhbHVlIiwiRklSU1RfQ0hFQ0siLCJzY29yZVByb3BlcnR5IiwiTWF0aCIsImdldFBlcmZlY3RTY29yZSIsInNldFBvaW50cyIsIk5FWFQiLCJmcm93biIsIndyb25nQW5zd2VyIiwiVFJZX0FHQUlOIiwiU0hPV19BTlNXRVIiLCJTRUNPTkRfQ0hFQ0siLCJwbGF5U3RhdGVPYnNlcnZlciIsInN0YXRlIiwidmlzaWJsZSIsImxpbmsiLCJndWVzc09ic2VydmVyIiwiZ3Vlc3MiLCJndWVzc1Byb3BlcnR5IiwiZGlzcG9zZUNoYWxsZW5nZU5vZGUiLCJkaXNwb3NlIiwidW5saW5rIiwiY3JlYXRlRXF1YXRpb25Ob2RlIiwibGluZVByb3BlcnR5IiwiZXF1YXRpb25Gb3JtIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImZvbnRTaXplIiwic2xvcGVVbmRlZmluZWRWaXNpYmxlIiwiU0xPUEVfSU5URVJDRVBUIiwiY3JlYXRlRHluYW1pY0xhYmVsIiwiUE9JTlRfU0xPUEUiLCJFcnJvciIsIm5hbWUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNoYWxsZW5nZU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQmFzZSB0eXBlIHZpZXcgZm9yIGFsbCBjaGFsbGVuZ2VzLlxyXG4gKiBQcm92aWRlcyB0aGUgdmlldyBjb21wb25lbnRzIHRoYXQgYXJlIGNvbW1vbiB0byBhbGwgY2hhbGxlbmdlcy5cclxuICpcclxuICogU3VidHlwZXMgYXJlIHJlc3BvbnNpYmxlIGZvcjpcclxuICogLSBwcm92aWRpbmcgdGhlIG5vZGVzIGZvciBncmFwaCBhbmQgZXF1YXRpb25zXHJcbiAqIC0gcG9zaXRpb25pbmcgZmFjZU5vZGVcclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRmFjZVdpdGhQb2ludHNOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9GYWNlV2l0aFBvaW50c05vZGUuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRleHRQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1RleHRQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IFZlZ2FzU3RyaW5ncyBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9WZWdhc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgR2FtZUF1ZGlvUGxheWVyIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0dhbWVBdWRpb1BsYXllci5qcyc7XHJcbmltcG9ydCBQb2ludFRvb2xOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1BvaW50VG9vbE5vZGUuanMnO1xyXG5pbXBvcnQgZ3JhcGhpbmdMaW5lcyBmcm9tICcuLi8uLi9ncmFwaGluZ0xpbmVzLmpzJztcclxuaW1wb3J0IFBvaW50U2xvcGVFcXVhdGlvbk5vZGUgZnJvbSAnLi4vLi4vcG9pbnRzbG9wZS92aWV3L1BvaW50U2xvcGVFcXVhdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgU2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGUgZnJvbSAnLi4vLi4vc2xvcGVpbnRlcmNlcHQvdmlldy9TbG9wZUludGVyY2VwdEVxdWF0aW9uTm9kZS5qcyc7XHJcbmltcG9ydCBMaW5lR2FtZUNvbnN0YW50cyBmcm9tICcuLi9MaW5lR2FtZUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBFcXVhdGlvbkZvcm0gZnJvbSAnLi4vbW9kZWwvRXF1YXRpb25Gb3JtLmpzJztcclxuaW1wb3J0IFBsYXlTdGF0ZSBmcm9tICcuLi9tb2RlbC9QbGF5U3RhdGUuanMnO1xyXG5pbXBvcnQgQ2hhbGxlbmdlIGZyb20gJy4uL21vZGVsL0NoYWxsZW5nZS5qcyc7XHJcbmltcG9ydCBMaW5lR2FtZU1vZGVsIGZyb20gJy4uL21vZGVsL0xpbmVHYW1lTW9kZWwuanMnO1xyXG5pbXBvcnQgTGluZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvTGluZS5qcyc7XHJcbmltcG9ydCBOb3RBTGluZSBmcm9tICcuLi9tb2RlbC9Ob3RBTGluZS5qcyc7XHJcbmltcG9ydCB7IENyZWF0ZUR5bmFtaWNMYWJlbE9wdGlvbnMgfSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9MaW5lTm9kZS5qcyc7XHJcbmltcG9ydCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcblxyXG4vLyBzdHJpbmdzXHJcbmNvbnN0IGNoZWNrU3RyaW5nUHJvcGVydHkgPSBWZWdhc1N0cmluZ3MuY2hlY2tTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgbmV4dFN0cmluZ1Byb3BlcnR5ID0gVmVnYXNTdHJpbmdzLm5leHRTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc2hvd0Fuc3dlclN0cmluZ1Byb3BlcnR5ID0gVmVnYXNTdHJpbmdzLnNob3dBbnN3ZXJTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgdHJ5QWdhaW5TdHJpbmdQcm9wZXJ0eSA9IFZlZ2FzU3RyaW5ncy50cnlBZ2FpblN0cmluZ1Byb3BlcnR5O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hhbGxlbmdlTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvLyBzdWJjbGFzc2VzIHNob3VsZCBhZGQgY2hpbGRyZW4gdG8gdGhpcyBub2RlLCB0byBwcmVzZXJ2ZSByZW5kZXJpbmcgb3JkZXJcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgc3VidHlwZVBhcmVudDogTm9kZTtcclxuXHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGJ1dHRvbnNQYXJlbnQ6IE5vZGU7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGZhY2VOb2RlOiBGYWNlV2l0aFBvaW50c05vZGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlQ2hhbGxlbmdlTm9kZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGNoYWxsZW5nZSAtIHRoZSBjaGFsbGVuZ2VcclxuICAgKiBAcGFyYW0gbW9kZWwgLSB0aGUgZ2FtZSBtb2RlbFxyXG4gICAqIEBwYXJhbSBjaGFsbGVuZ2VTaXplIC0gZGltZW5zaW9ucyBvZiB0aGUgdmlldyByZWN0YW5nbGUgdGhhdCBpcyBhdmFpbGFibGUgZm9yIHJlbmRlcmluZyB0aGUgY2hhbGxlbmdlXHJcbiAgICogQHBhcmFtIGF1ZGlvUGxheWVyIC0gdGhlIGF1ZGlvIHBsYXllciwgZm9yIHByb3ZpZGluZyBhdWRpbyBmZWVkYmFjayBkdXJpbmcgZ2FtZSBwbGF5XHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCBjaGFsbGVuZ2U6IENoYWxsZW5nZSwgbW9kZWw6IExpbmVHYW1lTW9kZWwsIGNoYWxsZW5nZVNpemU6IERpbWVuc2lvbjIsIGF1ZGlvUGxheWVyOiBHYW1lQXVkaW9QbGF5ZXIgKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICB0aGlzLnN1YnR5cGVQYXJlbnQgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIHRoaXMuZmFjZU5vZGUgPSBuZXcgRmFjZVdpdGhQb2ludHNOb2RlKCB7XHJcbiAgICAgIGZhY2VEaWFtZXRlcjogTGluZUdhbWVDb25zdGFudHMuRkFDRV9ESUFNRVRFUixcclxuICAgICAgZmFjZU9wYWNpdHk6IDEsXHJcbiAgICAgIHBvaW50c0FsaWdubWVudDogJ3JpZ2h0Q2VudGVyJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGJ1dHRvbnNcclxuICAgIGNvbnN0IGJ1dHRvbk9wdGlvbnMgPSB7XHJcbiAgICAgIGZvbnQ6IExpbmVHYW1lQ29uc3RhbnRzLkJVVFRPTl9GT05ULFxyXG4gICAgICBiYXNlQ29sb3I6IExpbmVHYW1lQ29uc3RhbnRzLkJVVFRPTl9DT0xPUixcclxuICAgICAgeE1hcmdpbjogMjAsXHJcbiAgICAgIHlNYXJnaW46IDUsXHJcbiAgICAgIGNlbnRlclg6IDAgLy8gY2VudGVyIGFsaWduZWRcclxuICAgIH07XHJcbiAgICBjb25zdCBjaGVja0J1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggY2hlY2tTdHJpbmdQcm9wZXJ0eSwgYnV0dG9uT3B0aW9ucyApO1xyXG4gICAgY29uc3QgdHJ5QWdhaW5CdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oIHRyeUFnYWluU3RyaW5nUHJvcGVydHksIGJ1dHRvbk9wdGlvbnMgKTtcclxuICAgIGNvbnN0IHNob3dBbnN3ZXJCdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oIHNob3dBbnN3ZXJTdHJpbmdQcm9wZXJ0eSwgYnV0dG9uT3B0aW9ucyApO1xyXG4gICAgY29uc3QgbmV4dEJ1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggbmV4dFN0cmluZ1Byb3BlcnR5LCBidXR0b25PcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5idXR0b25zUGFyZW50ID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgY2hlY2tCdXR0b24sIHRyeUFnYWluQnV0dG9uLCBzaG93QW5zd2VyQnV0dG9uLCBuZXh0QnV0dG9uIF0sXHJcbiAgICAgIG1heFdpZHRoOiA0MDAgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHBvaW50IHRvb2xzXHJcbiAgICBjb25zdCBsaW5lc1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuICAgIGNvbnN0IHBvaW50VG9vbE5vZGUxID0gbmV3IFBvaW50VG9vbE5vZGUoIGNoYWxsZW5nZS5wb2ludFRvb2wxLCBjaGFsbGVuZ2UubW9kZWxWaWV3VHJhbnNmb3JtLCBjaGFsbGVuZ2UuZ3JhcGgsIGxpbmVzVmlzaWJsZVByb3BlcnR5LCB7IHNjYWxlOiBMaW5lR2FtZUNvbnN0YW50cy5QT0lOVF9UT09MX1NDQUxFIH0gKTtcclxuICAgIGNvbnN0IHBvaW50VG9vbE5vZGUyID0gbmV3IFBvaW50VG9vbE5vZGUoIGNoYWxsZW5nZS5wb2ludFRvb2wyLCBjaGFsbGVuZ2UubW9kZWxWaWV3VHJhbnNmb3JtLCBjaGFsbGVuZ2UuZ3JhcGgsIGxpbmVzVmlzaWJsZVByb3BlcnR5LCB7IHNjYWxlOiBMaW5lR2FtZUNvbnN0YW50cy5QT0lOVF9UT09MX1NDQUxFIH0gKTtcclxuXHJcbiAgICAvLyBQb2ludCB0b29scyBtb3ZlVG9Gcm9udCB3aGVuIGRyYWdnZWQsIHNvIHdlIGdpdmUgdGhlbSBhIGNvbW1vbiBwYXJlbnQgdG8gcHJlc2VydmUgcmVuZGVyaW5nIG9yZGVyIG9mIHRoZSByZXNldCBvZiB0aGUgc2NlbmVncmFwaC5cclxuICAgIGNvbnN0IHBvaW50VG9vbFBhcmVudCA9IG5ldyBOb2RlKCk7XHJcbiAgICBwb2ludFRvb2xQYXJlbnQuYWRkQ2hpbGQoIHBvaW50VG9vbE5vZGUxICk7XHJcbiAgICBwb2ludFRvb2xQYXJlbnQuYWRkQ2hpbGQoIHBvaW50VG9vbE5vZGUyICk7XHJcblxyXG4gICAgLy8gcmVuZGVyaW5nIG9yZGVyXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnN1YnR5cGVQYXJlbnQgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuYnV0dG9uc1BhcmVudCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcG9pbnRUb29sUGFyZW50ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmZhY2VOb2RlICk7XHJcblxyXG4gICAgLy8gYnV0dG9ucyBhdCBjZW50ZXItYm90dG9tXHJcbiAgICB0aGlzLmJ1dHRvbnNQYXJlbnQuY2VudGVyWCA9IGNoYWxsZW5nZS5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBjaGFsbGVuZ2UuZ3JhcGgueFJhbmdlLm1pbiApOyAvLyBjZW50ZXJlZCBvbiBsZWZ0IGVkZ2Ugb2YgZ3JhcGhcclxuICAgIHRoaXMuYnV0dG9uc1BhcmVudC5ib3R0b20gPSBjaGFsbGVuZ2VTaXplLmhlaWdodCAtIDIwO1xyXG5cclxuICAgIC8vIGRlYnVnZ2luZyBjb250cm9sc1xyXG4gICAgbGV0IHNraXBCdXR0b246IFRleHRQdXNoQnV0dG9uO1xyXG4gICAgbGV0IHJlcGxheUJ1dHRvbjogVGV4dFB1c2hCdXR0b247XHJcbiAgICBpZiAoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuc2hvd0Fuc3dlcnMgKSB7XHJcblxyXG4gICAgICAvLyBkZXNjcmlwdGlvbiBhdCBsZWZ0VG9wXHJcbiAgICAgIGNvbnN0IGRlc2NyaXB0aW9uTm9kZSA9IG5ldyBUZXh0KCBjaGFsbGVuZ2UuZGVzY3JpcHRpb24sIHtcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE2ICksXHJcbiAgICAgICAgZmlsbDogJ2JsYWNrJ1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGRlc2NyaXB0aW9uTm9kZS5sZWZ0ID0gMTA7XHJcbiAgICAgIGRlc2NyaXB0aW9uTm9kZS50b3AgPSAxMDtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggZGVzY3JpcHRpb25Ob2RlICk7XHJcblxyXG4gICAgICAvLyBkZXZlbG9wZXIgYnV0dG9ucyAobm8gaTE4bikgdG8gcmlnaHQgb2YgbWFpbiBidXR0b25zXHJcbiAgICAgIGNvbnN0IGRldkJ1dHRvbk9wdGlvbnMgPSB7XHJcbiAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyMCApLFxyXG4gICAgICAgIGJhc2VDb2xvcjogJ3JlZCcsXHJcbiAgICAgICAgdGV4dEZpbGw6ICd3aGl0ZSdcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIHNraXBzIHRoZSBjdXJyZW50IGNoYWxsZW5nZS5cclxuICAgICAgc2tpcEJ1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggJ1NraXAnLCBkZXZCdXR0b25PcHRpb25zICk7XHJcbiAgICAgIHNraXBCdXR0b24uYWRkTGlzdGVuZXIoICgpID0+IG1vZGVsLnNraXBDdXJyZW50Q2hhbGxlbmdlKCkgKTtcclxuXHJcbiAgICAgIC8vIHJlcGxheXMgdGhlIGN1cnJlbnQgY2hhbGxlbmdlLlxyXG4gICAgICByZXBsYXlCdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oICdSZXBsYXknLCBkZXZCdXR0b25PcHRpb25zICk7XHJcbiAgICAgIHJlcGxheUJ1dHRvbi5hZGRMaXN0ZW5lciggKCkgPT4gbW9kZWwucmVwbGF5Q3VycmVudENoYWxsZW5nZSgpICk7XHJcblxyXG4gICAgICBjb25zdCBkZXZCdXR0b25zUGFyZW50ID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgc2tpcEJ1dHRvbiwgcmVwbGF5QnV0dG9uIF0gfSApO1xyXG4gICAgICBkZXZCdXR0b25zUGFyZW50LmxlZnQgPSB0aGlzLmJ1dHRvbnNQYXJlbnQucmlnaHQgKyAxNTtcclxuICAgICAgZGV2QnV0dG9uc1BhcmVudC5jZW50ZXJZID0gdGhpcy5idXR0b25zUGFyZW50LmNlbnRlclk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIGRldkJ1dHRvbnNQYXJlbnQgKTtcclxuICAgICAgZGV2QnV0dG9uc1BhcmVudC5tb3ZlVG9CYWNrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gJ0NoZWNrJyBidXR0b25cclxuICAgIGNoZWNrQnV0dG9uLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIGlmICggY2hhbGxlbmdlLmlzQ29ycmVjdCgpICkge1xyXG4gICAgICAgIHRoaXMuZmFjZU5vZGUuc21pbGUoKTtcclxuICAgICAgICBhdWRpb1BsYXllci5jb3JyZWN0QW5zd2VyKCk7XHJcbiAgICAgICAgY29uc3QgcG9pbnRzID0gbW9kZWwuY29tcHV0ZVBvaW50cyggbW9kZWwucGxheVN0YXRlUHJvcGVydHkudmFsdWUgPT09IFBsYXlTdGF0ZS5GSVJTVF9DSEVDSyA/IDEgOiAyIC8qIG51bWJlciBvZiBhdHRlbXB0cyAqLyApO1xyXG5cclxuICAgICAgICAvLyBQcmV2ZW50IHNjb3JlIGZyb20gZXhjZWVkaW5nIHBlcmZlY3Qgc2NvcmUsIGluIGNhc2Ugd2UgcmVwbGF5IGNoYWxsZW5nZXMgd2l0aCA/Z2FtZURlYnVnIHF1ZXJ5IHBhcmFtZXRlci5cclxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXBoaW5nLWxpbmVzL2lzc3Vlcy83MFxyXG4gICAgICAgIG1vZGVsLnNjb3JlUHJvcGVydHkudmFsdWUgPSBNYXRoLm1pbiggbW9kZWwuc2NvcmVQcm9wZXJ0eS52YWx1ZSArIHBvaW50cywgbW9kZWwuZ2V0UGVyZmVjdFNjb3JlKCkgKTtcclxuICAgICAgICB0aGlzLmZhY2VOb2RlLnNldFBvaW50cyggcG9pbnRzICk7XHJcbiAgICAgICAgbW9kZWwucGxheVN0YXRlUHJvcGVydHkudmFsdWUgPSBQbGF5U3RhdGUuTkVYVDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmZhY2VOb2RlLmZyb3duKCk7XHJcbiAgICAgICAgdGhpcy5mYWNlTm9kZS5zZXRQb2ludHMoIDAgKTtcclxuICAgICAgICBhdWRpb1BsYXllci53cm9uZ0Fuc3dlcigpO1xyXG4gICAgICAgIGlmICggbW9kZWwucGxheVN0YXRlUHJvcGVydHkudmFsdWUgPT09IFBsYXlTdGF0ZS5GSVJTVF9DSEVDSyApIHtcclxuICAgICAgICAgIG1vZGVsLnBsYXlTdGF0ZVByb3BlcnR5LnZhbHVlID0gUGxheVN0YXRlLlRSWV9BR0FJTjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBtb2RlbC5wbGF5U3RhdGVQcm9wZXJ0eS52YWx1ZSA9IFBsYXlTdGF0ZS5TSE9XX0FOU1dFUjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyAnVHJ5IEFnYWluJyBidXR0b25cclxuICAgIHRyeUFnYWluQnV0dG9uLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIG1vZGVsLnBsYXlTdGF0ZVByb3BlcnR5LnZhbHVlID0gUGxheVN0YXRlLlNFQ09ORF9DSEVDSztcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyAnU2hvdyBBbnN3ZXInIGJ1dHRvblxyXG4gICAgc2hvd0Fuc3dlckJ1dHRvbi5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICBtb2RlbC5wbGF5U3RhdGVQcm9wZXJ0eS52YWx1ZSA9IFBsYXlTdGF0ZS5ORVhUO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vICdOZXh0JyBidXR0b25cclxuICAgIG5leHRCdXR0b24uYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgbW9kZWwucGxheVN0YXRlUHJvcGVydHkudmFsdWUgPSBQbGF5U3RhdGUuRklSU1RfQ0hFQ0s7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcGxheS1zdGF0ZSBjaGFuZ2VzXHJcbiAgICBjb25zdCBwbGF5U3RhdGVPYnNlcnZlciA9ICggc3RhdGU6IFBsYXlTdGF0ZSApID0+IHtcclxuXHJcbiAgICAgIC8vIHZpc2liaWxpdHkgb2YgZmFjZVxyXG4gICAgICB0aGlzLmZhY2VOb2RlLnZpc2libGUgPSAoIHN0YXRlID09PSBQbGF5U3RhdGUuVFJZX0FHQUlOIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgPT09IFBsYXlTdGF0ZS5TSE9XX0FOU1dFUiB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggc3RhdGUgPT09IFBsYXlTdGF0ZS5ORVhUICYmIGNoYWxsZW5nZS5pc0NvcnJlY3QoKSApICk7XHJcblxyXG4gICAgICAvLyB2aXNpYmlsaXR5IG9mIGJ1dHRvbnNcclxuICAgICAgY2hlY2tCdXR0b24udmlzaWJsZSA9ICggc3RhdGUgPT09IFBsYXlTdGF0ZS5GSVJTVF9DSEVDSyB8fCBzdGF0ZSA9PT0gUGxheVN0YXRlLlNFQ09ORF9DSEVDSyApO1xyXG4gICAgICB0cnlBZ2FpbkJ1dHRvbi52aXNpYmxlID0gKCBzdGF0ZSA9PT0gUGxheVN0YXRlLlRSWV9BR0FJTiApO1xyXG4gICAgICBzaG93QW5zd2VyQnV0dG9uLnZpc2libGUgPSAoIHN0YXRlID09PSBQbGF5U3RhdGUuU0hPV19BTlNXRVIgKTtcclxuICAgICAgbmV4dEJ1dHRvbi52aXNpYmxlID0gKCBzdGF0ZSA9PT0gUGxheVN0YXRlLk5FWFQgKTtcclxuXHJcbiAgICAgIC8vIGRldiBidXR0b25zXHJcbiAgICAgIGlmICggcmVwbGF5QnV0dG9uICYmIHNraXBCdXR0b24gKSB7XHJcbiAgICAgICAgcmVwbGF5QnV0dG9uLnZpc2libGUgPSAoIHN0YXRlID09PSBQbGF5U3RhdGUuTkVYVCApO1xyXG4gICAgICAgIHNraXBCdXR0b24udmlzaWJsZSA9ICFyZXBsYXlCdXR0b24udmlzaWJsZTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIG1vZGVsLnBsYXlTdGF0ZVByb3BlcnR5LmxpbmsoIHBsYXlTdGF0ZU9ic2VydmVyICk7IC8vIHVubGluayBpbiBkaXNwb3NlXHJcblxyXG4gICAgLy8gTW92ZSBmcm9tIFwiVHJ5IEFnYWluXCIgdG8gXCJDaGVja1wiIHN0YXRlIHdoZW4gdGhlIHVzZXIgY2hhbmdlcyB0aGVpciBndWVzcywgc2VlIGdyYXBoaW5nLWxpbmVzIzQ3LlxyXG4gICAgY29uc3QgZ3Vlc3NPYnNlcnZlciA9ICggZ3Vlc3M6IExpbmUgfCBOb3RBTGluZSApID0+IHtcclxuICAgICAgaWYgKCBtb2RlbC5wbGF5U3RhdGVQcm9wZXJ0eS52YWx1ZSA9PT0gUGxheVN0YXRlLlRSWV9BR0FJTiApIHtcclxuICAgICAgICBtb2RlbC5wbGF5U3RhdGVQcm9wZXJ0eS52YWx1ZSA9IFBsYXlTdGF0ZS5TRUNPTkRfQ0hFQ0s7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBjaGFsbGVuZ2UuZ3Vlc3NQcm9wZXJ0eS5saW5rKCBndWVzc09ic2VydmVyICk7IC8vIHVubGluayBpbiBkaXNwb3NlXHJcblxyXG4gICAgdGhpcy5kaXNwb3NlQ2hhbGxlbmdlTm9kZSA9ICgpID0+IHtcclxuICAgICAgcG9pbnRUb29sTm9kZTEuZGlzcG9zZSgpO1xyXG4gICAgICBwb2ludFRvb2xOb2RlMi5kaXNwb3NlKCk7XHJcbiAgICAgIG1vZGVsLnBsYXlTdGF0ZVByb3BlcnR5LnVubGluayggcGxheVN0YXRlT2JzZXJ2ZXIgKTtcclxuICAgICAgY2hhbGxlbmdlLmd1ZXNzUHJvcGVydHkudW5saW5rKCBndWVzc09ic2VydmVyICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VDaGFsbGVuZ2VOb2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbm9uLWludGVyYWN0aXZlIGVxdWF0aW9uLCB1c2VkIHRvIGxhYmVsIHRoZSBzcGVjaWZpZWQgbGluZS5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUVxdWF0aW9uTm9kZSggbGluZVByb3BlcnR5OiBQcm9wZXJ0eTxMaW5lPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXF1YXRpb25Gb3JtOiBFcXVhdGlvbkZvcm0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IENyZWF0ZUR5bmFtaWNMYWJlbE9wdGlvbnMgKTogTm9kZSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPENyZWF0ZUR5bmFtaWNMYWJlbE9wdGlvbnM+KCB7XHJcbiAgICAgIGZvbnRTaXplOiAxOCxcclxuICAgICAgc2xvcGVVbmRlZmluZWRWaXNpYmxlOiB0cnVlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBpZiAoIGVxdWF0aW9uRm9ybSA9PT0gRXF1YXRpb25Gb3JtLlNMT1BFX0lOVEVSQ0VQVCApIHtcclxuICAgICAgcmV0dXJuIFNsb3BlSW50ZXJjZXB0RXF1YXRpb25Ob2RlLmNyZWF0ZUR5bmFtaWNMYWJlbCggbGluZVByb3BlcnR5LCBvcHRpb25zICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggZXF1YXRpb25Gb3JtID09PSBFcXVhdGlvbkZvcm0uUE9JTlRfU0xPUEUgKSB7XHJcbiAgICAgIHJldHVybiBQb2ludFNsb3BlRXF1YXRpb25Ob2RlLmNyZWF0ZUR5bmFtaWNMYWJlbCggbGluZVByb3BlcnR5LCBvcHRpb25zICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdW5zdXBwb3J0ZWQgZXF1YXRpb24gZm9ybTogJHtlcXVhdGlvbkZvcm0ubmFtZX1gICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5ncmFwaGluZ0xpbmVzLnJlZ2lzdGVyKCAnQ2hhbGxlbmdlTm9kZScsIENoYWxsZW5nZU5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0Msa0JBQWtCLE1BQU0sbURBQW1EO0FBRWxGLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlELE9BQU9DLGNBQWMsTUFBTSw4Q0FBOEM7QUFDekUsT0FBT0MsWUFBWSxNQUFNLHNDQUFzQztBQUUvRCxPQUFPQyxhQUFhLE1BQU0sb0NBQW9DO0FBQzlELE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFDbEQsT0FBT0Msc0JBQXNCLE1BQU0saURBQWlEO0FBQ3BGLE9BQU9DLDBCQUEwQixNQUFNLHlEQUF5RDtBQUNoRyxPQUFPQyxpQkFBaUIsTUFBTSx5QkFBeUI7QUFDdkQsT0FBT0MsWUFBWSxNQUFNLDBCQUEwQjtBQUNuRCxPQUFPQyxTQUFTLE1BQU0sdUJBQXVCO0FBTTdDLFNBQVNDLGNBQWMsUUFBUSx1Q0FBdUM7O0FBRXRFO0FBQ0EsTUFBTUMsbUJBQW1CLEdBQUdULFlBQVksQ0FBQ1MsbUJBQW1CO0FBQzVELE1BQU1DLGtCQUFrQixHQUFHVixZQUFZLENBQUNVLGtCQUFrQjtBQUMxRCxNQUFNQyx3QkFBd0IsR0FBR1gsWUFBWSxDQUFDVyx3QkFBd0I7QUFDdEUsTUFBTUMsc0JBQXNCLEdBQUdaLFlBQVksQ0FBQ1ksc0JBQXNCO0FBRWxFLGVBQWUsTUFBTUMsYUFBYSxTQUFTaEIsSUFBSSxDQUFDO0VBRTlDOztFQU9BO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNZaUIsV0FBV0EsQ0FBRUMsU0FBb0IsRUFBRUMsS0FBb0IsRUFBRUMsYUFBeUIsRUFBRUMsV0FBNEIsRUFBRztJQUUz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