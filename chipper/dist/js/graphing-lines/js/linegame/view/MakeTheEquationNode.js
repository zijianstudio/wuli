// Copyright 2013-2023, University of Colorado Boulder

/**
 * View for 'Make the Equation' challenges.
 * User manipulates an equation on the right, graph is displayed on the left.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import { Text } from '../../../../scenery/js/imports.js';
import GLConstants from '../../common/GLConstants.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
import PointSlopeEquationNode from '../../pointslope/view/PointSlopeEquationNode.js';
import SlopeInterceptEquationNode from '../../slopeintercept/view/SlopeInterceptEquationNode.js';
import LineGameConstants from '../LineGameConstants.js';
import EquationForm from '../model/EquationForm.js';
import ManipulationMode from '../model/ManipulationMode.js';
import PlayState from '../model/PlayState.js';
import ChallengeGraphNode from './ChallengeGraphNode.js';
import ChallengeNode from './ChallengeNode.js';
import EquationBoxNode from './EquationBoxNode.js';
export default class MakeTheEquationNode extends ChallengeNode {
  constructor(challenge, model, challengeSize, audioPlayer) {
    super(challenge, model, challengeSize, audioPlayer);
    const boxSize = new Dimension2(0.4 * challengeSize.width, 0.3 * challengeSize.height);

    // title, possibly scaled for i18n
    const titleNode = new Text(challenge.title, {
      font: LineGameConstants.TITLE_FONT,
      fill: LineGameConstants.TITLE_COLOR,
      maxWidth: boxSize.width
    });

    // Answer
    const answerBoxNode = new EquationBoxNode(GraphingLinesStrings.aCorrectEquation, challenge.answer.color, boxSize, ChallengeNode.createEquationNode(new Property(challenge.answer), challenge.equationForm, {
      fontSize: LineGameConstants.STATIC_EQUATION_FONT_SIZE
    }));
    answerBoxNode.visible = false;

    // Guess
    // @ts-expect-error guessProperty is Property<Line | NotALine>
    const guessColor = challenge.guessProperty.value.color;
    // @ts-expect-error guessProperty is Property<Line | NotALine>
    const guessEquationNode = createInteractiveEquationNode(challenge.equationForm, challenge.manipulationMode, challenge.guessProperty, challenge.graph, GLConstants.INTERACTIVE_EQUATION_FONT_SIZE, guessColor);
    const guessBoxNode = new EquationBoxNode(GraphingLinesStrings.yourEquation, guessColor, boxSize, guessEquationNode);

    // Graph
    const graphNode = new ChallengeGraphNode(challenge, {
      answerLineVisible: true
    });

    // rendering order
    this.subtypeParent.addChild(titleNode);
    this.subtypeParent.addChild(graphNode);
    this.subtypeParent.addChild(answerBoxNode);
    this.subtypeParent.addChild(guessBoxNode);

    // layout
    {
      // graphNode is positioned automatically based on modelViewTransform's origin offset.

      // left align the title and boxes, centered in space to left of graph
      guessBoxNode.centerX = challenge.modelViewTransform.modelToViewX(challenge.graph.xRange.min) / 2;
      answerBoxNode.left = guessBoxNode.left;
      titleNode.left = guessBoxNode.left;

      // stack title and boxes vertically, title top-aligned with graph's grid
      const ySpacing = 30;
      titleNode.top = challenge.modelViewTransform.modelToViewY(challenge.graph.yRange.max);
      guessBoxNode.top = titleNode.bottom + ySpacing;
      answerBoxNode.top = guessBoxNode.bottom + ySpacing;

      // face centered below boxes, bottom-aligned with buttons
      this.faceNode.centerX = guessBoxNode.centerX;
      this.faceNode.bottom = this.buttonsParent.bottom;
    }

    // To reduce brain damage during development, show the answer equation in translucent gray.
    if (phet.chipper.queryParameters.showAnswers) {
      const devAnswerNode = ChallengeNode.createEquationNode(new Property(challenge.answer), challenge.equationForm, {
        fontSize: 14,
        maxWidth: boxSize.width
      });
      devAnswerNode.left = answerBoxNode.left;
      devAnswerNode.centerY = answerBoxNode.centerY;
      this.addChild(devAnswerNode);
      devAnswerNode.moveToBack();
    }

    // Update visibility of the correct/incorrect icons.
    const updateIcons = () => {
      const playState = model.playStateProperty.value;
      answerBoxNode.setCorrectIconVisible(playState === PlayState.NEXT);
      guessBoxNode.setCorrectIconVisible(playState === PlayState.NEXT && challenge.isCorrect());
      guessBoxNode.setIncorrectIconVisible(playState === PlayState.NEXT && !challenge.isCorrect());
    };

    // sync with guess
    const guessObserver = () => updateIcons();
    challenge.guessProperty.link(guessObserver); // unlink in dispose

    // sync with game state
    const playStateObserver = playState => {
      // No-op if dispose has been called, see https://github.com/phetsims/graphing-lines/issues/133
      if (!this.isDisposed) {
        // states in which the equation is interactive
        guessBoxNode.pickable = playState === PlayState.FIRST_CHECK || playState === PlayState.SECOND_CHECK || playState === PlayState.TRY_AGAIN || playState === PlayState.NEXT && !challenge.isCorrect();

        // Graph the guess line at the end of the challenge.
        graphNode.setGuessLineVisible(playState === PlayState.NEXT);

        // show stuff when the user got the challenge wrong
        if (playState === PlayState.NEXT && !challenge.isCorrect()) {
          answerBoxNode.setVisible(true);
          graphNode.setAnswerPointVisible(true);
          graphNode.setGuessPointVisible(true);
          graphNode.setSlopeToolVisible(true);
        }

        // visibility of correct/incorrect icons
        updateIcons();
      }
    };
    model.playStateProperty.link(playStateObserver); // unlink in dispose

    this.disposeMakeTheEquationNode = () => {
      challenge.guessProperty.unlink(guessObserver);
      model.playStateProperty.unlink(playStateObserver);
      guessEquationNode.dispose();
      graphNode.dispose();
    };
  }
  dispose() {
    this.disposeMakeTheEquationNode();
    super.dispose();
  }
}

/**
 * Creates an interactive equation.
 */
function createInteractiveEquationNode(equationForm, manipulationMode, lineProperty, graph, fontSize, staticColor) {
  let interactivePoint;
  let interactiveSlope;
  let interactiveIntercept;
  if (equationForm === EquationForm.SLOPE_INTERCEPT) {
    interactiveSlope = manipulationMode === ManipulationMode.SLOPE || manipulationMode === ManipulationMode.SLOPE_INTERCEPT;
    interactiveIntercept = manipulationMode === ManipulationMode.INTERCEPT || manipulationMode === ManipulationMode.SLOPE_INTERCEPT;
    return new SlopeInterceptEquationNode(lineProperty, {
      interactiveSlope: interactiveSlope,
      interactiveIntercept: interactiveIntercept,
      riseRangeProperty: new Property(graph.yRange),
      runRangeProperty: new Property(graph.xRange),
      yInterceptRangeProperty: new Property(graph.yRange),
      fontSize: fontSize,
      staticColor: staticColor
    });
  } else if (equationForm === EquationForm.POINT_SLOPE) {
    interactivePoint = manipulationMode === ManipulationMode.POINT || manipulationMode === ManipulationMode.POINT_SLOPE;
    interactiveSlope = manipulationMode === ManipulationMode.SLOPE || manipulationMode === ManipulationMode.POINT_SLOPE;
    return new PointSlopeEquationNode(lineProperty, {
      interactivePoint: interactivePoint,
      interactiveSlope: interactiveSlope,
      x1RangeProperty: new Property(graph.xRange),
      y1RangeProperty: new Property(graph.yRange),
      riseRangeProperty: new Property(graph.yRange),
      runRangeProperty: new Property(graph.xRange),
      fontSize: fontSize,
      staticColor: staticColor
    });
  } else {
    throw new Error(`unsupported equation form: ${equationForm.name}`);
  }
}
graphingLines.register('MakeTheEquationNode', MakeTheEquationNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJUZXh0IiwiR0xDb25zdGFudHMiLCJncmFwaGluZ0xpbmVzIiwiR3JhcGhpbmdMaW5lc1N0cmluZ3MiLCJQb2ludFNsb3BlRXF1YXRpb25Ob2RlIiwiU2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGUiLCJMaW5lR2FtZUNvbnN0YW50cyIsIkVxdWF0aW9uRm9ybSIsIk1hbmlwdWxhdGlvbk1vZGUiLCJQbGF5U3RhdGUiLCJDaGFsbGVuZ2VHcmFwaE5vZGUiLCJDaGFsbGVuZ2VOb2RlIiwiRXF1YXRpb25Cb3hOb2RlIiwiTWFrZVRoZUVxdWF0aW9uTm9kZSIsImNvbnN0cnVjdG9yIiwiY2hhbGxlbmdlIiwibW9kZWwiLCJjaGFsbGVuZ2VTaXplIiwiYXVkaW9QbGF5ZXIiLCJib3hTaXplIiwid2lkdGgiLCJoZWlnaHQiLCJ0aXRsZU5vZGUiLCJ0aXRsZSIsImZvbnQiLCJUSVRMRV9GT05UIiwiZmlsbCIsIlRJVExFX0NPTE9SIiwibWF4V2lkdGgiLCJhbnN3ZXJCb3hOb2RlIiwiYUNvcnJlY3RFcXVhdGlvbiIsImFuc3dlciIsImNvbG9yIiwiY3JlYXRlRXF1YXRpb25Ob2RlIiwiZXF1YXRpb25Gb3JtIiwiZm9udFNpemUiLCJTVEFUSUNfRVFVQVRJT05fRk9OVF9TSVpFIiwidmlzaWJsZSIsImd1ZXNzQ29sb3IiLCJndWVzc1Byb3BlcnR5IiwidmFsdWUiLCJndWVzc0VxdWF0aW9uTm9kZSIsImNyZWF0ZUludGVyYWN0aXZlRXF1YXRpb25Ob2RlIiwibWFuaXB1bGF0aW9uTW9kZSIsImdyYXBoIiwiSU5URVJBQ1RJVkVfRVFVQVRJT05fRk9OVF9TSVpFIiwiZ3Vlc3NCb3hOb2RlIiwieW91ckVxdWF0aW9uIiwiZ3JhcGhOb2RlIiwiYW5zd2VyTGluZVZpc2libGUiLCJzdWJ0eXBlUGFyZW50IiwiYWRkQ2hpbGQiLCJjZW50ZXJYIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwibW9kZWxUb1ZpZXdYIiwieFJhbmdlIiwibWluIiwibGVmdCIsInlTcGFjaW5nIiwidG9wIiwibW9kZWxUb1ZpZXdZIiwieVJhbmdlIiwibWF4IiwiYm90dG9tIiwiZmFjZU5vZGUiLCJidXR0b25zUGFyZW50IiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJzaG93QW5zd2VycyIsImRldkFuc3dlck5vZGUiLCJjZW50ZXJZIiwibW92ZVRvQmFjayIsInVwZGF0ZUljb25zIiwicGxheVN0YXRlIiwicGxheVN0YXRlUHJvcGVydHkiLCJzZXRDb3JyZWN0SWNvblZpc2libGUiLCJORVhUIiwiaXNDb3JyZWN0Iiwic2V0SW5jb3JyZWN0SWNvblZpc2libGUiLCJndWVzc09ic2VydmVyIiwibGluayIsInBsYXlTdGF0ZU9ic2VydmVyIiwiaXNEaXNwb3NlZCIsInBpY2thYmxlIiwiRklSU1RfQ0hFQ0siLCJTRUNPTkRfQ0hFQ0siLCJUUllfQUdBSU4iLCJzZXRHdWVzc0xpbmVWaXNpYmxlIiwic2V0VmlzaWJsZSIsInNldEFuc3dlclBvaW50VmlzaWJsZSIsInNldEd1ZXNzUG9pbnRWaXNpYmxlIiwic2V0U2xvcGVUb29sVmlzaWJsZSIsImRpc3Bvc2VNYWtlVGhlRXF1YXRpb25Ob2RlIiwidW5saW5rIiwiZGlzcG9zZSIsImxpbmVQcm9wZXJ0eSIsInN0YXRpY0NvbG9yIiwiaW50ZXJhY3RpdmVQb2ludCIsImludGVyYWN0aXZlU2xvcGUiLCJpbnRlcmFjdGl2ZUludGVyY2VwdCIsIlNMT1BFX0lOVEVSQ0VQVCIsIlNMT1BFIiwiSU5URVJDRVBUIiwicmlzZVJhbmdlUHJvcGVydHkiLCJydW5SYW5nZVByb3BlcnR5IiwieUludGVyY2VwdFJhbmdlUHJvcGVydHkiLCJQT0lOVF9TTE9QRSIsIlBPSU5UIiwieDFSYW5nZVByb3BlcnR5IiwieTFSYW5nZVByb3BlcnR5IiwiRXJyb3IiLCJuYW1lIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNYWtlVGhlRXF1YXRpb25Ob2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZpZXcgZm9yICdNYWtlIHRoZSBFcXVhdGlvbicgY2hhbGxlbmdlcy5cclxuICogVXNlciBtYW5pcHVsYXRlcyBhbiBlcXVhdGlvbiBvbiB0aGUgcmlnaHQsIGdyYXBoIGlzIGRpc3BsYXllZCBvbiB0aGUgbGVmdC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIE5vZGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgR0xDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0dMQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IGdyYXBoaW5nTGluZXMgZnJvbSAnLi4vLi4vZ3JhcGhpbmdMaW5lcy5qcyc7XHJcbmltcG9ydCBHcmFwaGluZ0xpbmVzU3RyaW5ncyBmcm9tICcuLi8uLi9HcmFwaGluZ0xpbmVzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBQb2ludFNsb3BlRXF1YXRpb25Ob2RlIGZyb20gJy4uLy4uL3BvaW50c2xvcGUvdmlldy9Qb2ludFNsb3BlRXF1YXRpb25Ob2RlLmpzJztcclxuaW1wb3J0IFNsb3BlSW50ZXJjZXB0RXF1YXRpb25Ob2RlIGZyb20gJy4uLy4uL3Nsb3BlaW50ZXJjZXB0L3ZpZXcvU2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgTGluZUdhbWVDb25zdGFudHMgZnJvbSAnLi4vTGluZUdhbWVDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRXF1YXRpb25Gb3JtIGZyb20gJy4uL21vZGVsL0VxdWF0aW9uRm9ybS5qcyc7XHJcbmltcG9ydCBNYW5pcHVsYXRpb25Nb2RlIGZyb20gJy4uL21vZGVsL01hbmlwdWxhdGlvbk1vZGUuanMnO1xyXG5pbXBvcnQgUGxheVN0YXRlIGZyb20gJy4uL21vZGVsL1BsYXlTdGF0ZS5qcyc7XHJcbmltcG9ydCBDaGFsbGVuZ2VHcmFwaE5vZGUgZnJvbSAnLi9DaGFsbGVuZ2VHcmFwaE5vZGUuanMnO1xyXG5pbXBvcnQgQ2hhbGxlbmdlTm9kZSBmcm9tICcuL0NoYWxsZW5nZU5vZGUuanMnO1xyXG5pbXBvcnQgRXF1YXRpb25Cb3hOb2RlIGZyb20gJy4vRXF1YXRpb25Cb3hOb2RlLmpzJztcclxuaW1wb3J0IExpbmUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0xpbmUuanMnO1xyXG5pbXBvcnQgTGluZUdhbWVNb2RlbCBmcm9tICcuLi9tb2RlbC9MaW5lR2FtZU1vZGVsLmpzJztcclxuaW1wb3J0IEdhbWVBdWRpb1BsYXllciBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9HYW1lQXVkaW9QbGF5ZXIuanMnO1xyXG5pbXBvcnQgR3JhcGggZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0dyYXBoLmpzJztcclxuaW1wb3J0IE1ha2VUaGVFcXVhdGlvbiBmcm9tICcuLi9tb2RlbC9NYWtlVGhlRXF1YXRpb24uanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFrZVRoZUVxdWF0aW9uTm9kZSBleHRlbmRzIENoYWxsZW5nZU5vZGUge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VNYWtlVGhlRXF1YXRpb25Ob2RlOiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNoYWxsZW5nZTogTWFrZVRoZUVxdWF0aW9uLCBtb2RlbDogTGluZUdhbWVNb2RlbCwgY2hhbGxlbmdlU2l6ZTogRGltZW5zaW9uMiwgYXVkaW9QbGF5ZXI6IEdhbWVBdWRpb1BsYXllciApIHtcclxuXHJcbiAgICBzdXBlciggY2hhbGxlbmdlLCBtb2RlbCwgY2hhbGxlbmdlU2l6ZSwgYXVkaW9QbGF5ZXIgKTtcclxuXHJcbiAgICBjb25zdCBib3hTaXplID0gbmV3IERpbWVuc2lvbjIoIDAuNCAqIGNoYWxsZW5nZVNpemUud2lkdGgsIDAuMyAqIGNoYWxsZW5nZVNpemUuaGVpZ2h0ICk7XHJcblxyXG4gICAgLy8gdGl0bGUsIHBvc3NpYmx5IHNjYWxlZCBmb3IgaTE4blxyXG4gICAgY29uc3QgdGl0bGVOb2RlID0gbmV3IFRleHQoIGNoYWxsZW5nZS50aXRsZSwge1xyXG4gICAgICBmb250OiBMaW5lR2FtZUNvbnN0YW50cy5USVRMRV9GT05ULFxyXG4gICAgICBmaWxsOiBMaW5lR2FtZUNvbnN0YW50cy5USVRMRV9DT0xPUixcclxuICAgICAgbWF4V2lkdGg6IGJveFNpemUud2lkdGhcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBbnN3ZXJcclxuICAgIGNvbnN0IGFuc3dlckJveE5vZGUgPSBuZXcgRXF1YXRpb25Cb3hOb2RlKCBHcmFwaGluZ0xpbmVzU3RyaW5ncy5hQ29ycmVjdEVxdWF0aW9uLCBjaGFsbGVuZ2UuYW5zd2VyLmNvbG9yLCBib3hTaXplLFxyXG4gICAgICBDaGFsbGVuZ2VOb2RlLmNyZWF0ZUVxdWF0aW9uTm9kZSggbmV3IFByb3BlcnR5KCBjaGFsbGVuZ2UuYW5zd2VyICksIGNoYWxsZW5nZS5lcXVhdGlvbkZvcm0sIHtcclxuICAgICAgICBmb250U2l6ZTogTGluZUdhbWVDb25zdGFudHMuU1RBVElDX0VRVUFUSU9OX0ZPTlRfU0laRVxyXG4gICAgICB9ICkgKTtcclxuICAgIGFuc3dlckJveE5vZGUudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEd1ZXNzXHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGd1ZXNzUHJvcGVydHkgaXMgUHJvcGVydHk8TGluZSB8IE5vdEFMaW5lPlxyXG4gICAgY29uc3QgZ3Vlc3NDb2xvcjogQ29sb3IgfCBzdHJpbmcgPSBjaGFsbGVuZ2UuZ3Vlc3NQcm9wZXJ0eS52YWx1ZS5jb2xvcjtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgZ3Vlc3NQcm9wZXJ0eSBpcyBQcm9wZXJ0eTxMaW5lIHwgTm90QUxpbmU+XHJcbiAgICBjb25zdCBndWVzc0VxdWF0aW9uTm9kZSA9IGNyZWF0ZUludGVyYWN0aXZlRXF1YXRpb25Ob2RlKCBjaGFsbGVuZ2UuZXF1YXRpb25Gb3JtLCBjaGFsbGVuZ2UubWFuaXB1bGF0aW9uTW9kZSwgY2hhbGxlbmdlLmd1ZXNzUHJvcGVydHksIGNoYWxsZW5nZS5ncmFwaCxcclxuICAgICAgR0xDb25zdGFudHMuSU5URVJBQ1RJVkVfRVFVQVRJT05fRk9OVF9TSVpFLCBndWVzc0NvbG9yICk7XHJcbiAgICBjb25zdCBndWVzc0JveE5vZGUgPSBuZXcgRXF1YXRpb25Cb3hOb2RlKCBHcmFwaGluZ0xpbmVzU3RyaW5ncy55b3VyRXF1YXRpb24sIGd1ZXNzQ29sb3IsIGJveFNpemUsIGd1ZXNzRXF1YXRpb25Ob2RlICk7XHJcblxyXG4gICAgLy8gR3JhcGhcclxuICAgIGNvbnN0IGdyYXBoTm9kZSA9IG5ldyBDaGFsbGVuZ2VHcmFwaE5vZGUoIGNoYWxsZW5nZSwgeyBhbnN3ZXJMaW5lVmlzaWJsZTogdHJ1ZSB9ICk7XHJcblxyXG4gICAgLy8gcmVuZGVyaW5nIG9yZGVyXHJcbiAgICB0aGlzLnN1YnR5cGVQYXJlbnQuYWRkQ2hpbGQoIHRpdGxlTm9kZSApO1xyXG4gICAgdGhpcy5zdWJ0eXBlUGFyZW50LmFkZENoaWxkKCBncmFwaE5vZGUgKTtcclxuICAgIHRoaXMuc3VidHlwZVBhcmVudC5hZGRDaGlsZCggYW5zd2VyQm94Tm9kZSApO1xyXG4gICAgdGhpcy5zdWJ0eXBlUGFyZW50LmFkZENoaWxkKCBndWVzc0JveE5vZGUgKTtcclxuXHJcbiAgICAvLyBsYXlvdXRcclxuICAgIHtcclxuICAgICAgLy8gZ3JhcGhOb2RlIGlzIHBvc2l0aW9uZWQgYXV0b21hdGljYWxseSBiYXNlZCBvbiBtb2RlbFZpZXdUcmFuc2Zvcm0ncyBvcmlnaW4gb2Zmc2V0LlxyXG5cclxuICAgICAgLy8gbGVmdCBhbGlnbiB0aGUgdGl0bGUgYW5kIGJveGVzLCBjZW50ZXJlZCBpbiBzcGFjZSB0byBsZWZ0IG9mIGdyYXBoXHJcbiAgICAgIGd1ZXNzQm94Tm9kZS5jZW50ZXJYID0gY2hhbGxlbmdlLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIGNoYWxsZW5nZS5ncmFwaC54UmFuZ2UubWluICkgLyAyO1xyXG4gICAgICBhbnN3ZXJCb3hOb2RlLmxlZnQgPSBndWVzc0JveE5vZGUubGVmdDtcclxuICAgICAgdGl0bGVOb2RlLmxlZnQgPSBndWVzc0JveE5vZGUubGVmdDtcclxuXHJcbiAgICAgIC8vIHN0YWNrIHRpdGxlIGFuZCBib3hlcyB2ZXJ0aWNhbGx5LCB0aXRsZSB0b3AtYWxpZ25lZCB3aXRoIGdyYXBoJ3MgZ3JpZFxyXG4gICAgICBjb25zdCB5U3BhY2luZyA9IDMwO1xyXG4gICAgICB0aXRsZU5vZGUudG9wID0gY2hhbGxlbmdlLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIGNoYWxsZW5nZS5ncmFwaC55UmFuZ2UubWF4ICk7XHJcbiAgICAgIGd1ZXNzQm94Tm9kZS50b3AgPSB0aXRsZU5vZGUuYm90dG9tICsgeVNwYWNpbmc7XHJcbiAgICAgIGFuc3dlckJveE5vZGUudG9wID0gZ3Vlc3NCb3hOb2RlLmJvdHRvbSArIHlTcGFjaW5nO1xyXG5cclxuICAgICAgLy8gZmFjZSBjZW50ZXJlZCBiZWxvdyBib3hlcywgYm90dG9tLWFsaWduZWQgd2l0aCBidXR0b25zXHJcbiAgICAgIHRoaXMuZmFjZU5vZGUuY2VudGVyWCA9IGd1ZXNzQm94Tm9kZS5jZW50ZXJYO1xyXG4gICAgICB0aGlzLmZhY2VOb2RlLmJvdHRvbSA9IHRoaXMuYnV0dG9uc1BhcmVudC5ib3R0b207XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVG8gcmVkdWNlIGJyYWluIGRhbWFnZSBkdXJpbmcgZGV2ZWxvcG1lbnQsIHNob3cgdGhlIGFuc3dlciBlcXVhdGlvbiBpbiB0cmFuc2x1Y2VudCBncmF5LlxyXG4gICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnNob3dBbnN3ZXJzICkge1xyXG4gICAgICBjb25zdCBkZXZBbnN3ZXJOb2RlID0gQ2hhbGxlbmdlTm9kZS5jcmVhdGVFcXVhdGlvbk5vZGUoIG5ldyBQcm9wZXJ0eSggY2hhbGxlbmdlLmFuc3dlciApLCBjaGFsbGVuZ2UuZXF1YXRpb25Gb3JtLCB7XHJcbiAgICAgICAgZm9udFNpemU6IDE0LFxyXG4gICAgICAgIG1heFdpZHRoOiBib3hTaXplLndpZHRoXHJcbiAgICAgIH0gKTtcclxuICAgICAgZGV2QW5zd2VyTm9kZS5sZWZ0ID0gYW5zd2VyQm94Tm9kZS5sZWZ0O1xyXG4gICAgICBkZXZBbnN3ZXJOb2RlLmNlbnRlclkgPSBhbnN3ZXJCb3hOb2RlLmNlbnRlclk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIGRldkFuc3dlck5vZGUgKTtcclxuICAgICAgZGV2QW5zd2VyTm9kZS5tb3ZlVG9CYWNrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIHZpc2liaWxpdHkgb2YgdGhlIGNvcnJlY3QvaW5jb3JyZWN0IGljb25zLlxyXG4gICAgY29uc3QgdXBkYXRlSWNvbnMgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHBsYXlTdGF0ZSA9IG1vZGVsLnBsYXlTdGF0ZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICBhbnN3ZXJCb3hOb2RlLnNldENvcnJlY3RJY29uVmlzaWJsZSggcGxheVN0YXRlID09PSBQbGF5U3RhdGUuTkVYVCApO1xyXG4gICAgICBndWVzc0JveE5vZGUuc2V0Q29ycmVjdEljb25WaXNpYmxlKCBwbGF5U3RhdGUgPT09IFBsYXlTdGF0ZS5ORVhUICYmIGNoYWxsZW5nZS5pc0NvcnJlY3QoKSApO1xyXG4gICAgICBndWVzc0JveE5vZGUuc2V0SW5jb3JyZWN0SWNvblZpc2libGUoIHBsYXlTdGF0ZSA9PT0gUGxheVN0YXRlLk5FWFQgJiYgIWNoYWxsZW5nZS5pc0NvcnJlY3QoKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBzeW5jIHdpdGggZ3Vlc3NcclxuICAgIGNvbnN0IGd1ZXNzT2JzZXJ2ZXIgPSAoKSA9PiB1cGRhdGVJY29ucygpO1xyXG4gICAgY2hhbGxlbmdlLmd1ZXNzUHJvcGVydHkubGluayggZ3Vlc3NPYnNlcnZlciApOyAvLyB1bmxpbmsgaW4gZGlzcG9zZVxyXG5cclxuICAgIC8vIHN5bmMgd2l0aCBnYW1lIHN0YXRlXHJcbiAgICBjb25zdCBwbGF5U3RhdGVPYnNlcnZlciA9ICggcGxheVN0YXRlOiBQbGF5U3RhdGUgKSA9PiB7XHJcblxyXG4gICAgICAvLyBOby1vcCBpZiBkaXNwb3NlIGhhcyBiZWVuIGNhbGxlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9ncmFwaGluZy1saW5lcy9pc3N1ZXMvMTMzXHJcbiAgICAgIGlmICggIXRoaXMuaXNEaXNwb3NlZCApIHtcclxuXHJcbiAgICAgICAgLy8gc3RhdGVzIGluIHdoaWNoIHRoZSBlcXVhdGlvbiBpcyBpbnRlcmFjdGl2ZVxyXG4gICAgICAgIGd1ZXNzQm94Tm9kZS5waWNrYWJsZSA9IChcclxuICAgICAgICAgIHBsYXlTdGF0ZSA9PT0gUGxheVN0YXRlLkZJUlNUX0NIRUNLIHx8XHJcbiAgICAgICAgICBwbGF5U3RhdGUgPT09IFBsYXlTdGF0ZS5TRUNPTkRfQ0hFQ0sgfHxcclxuICAgICAgICAgIHBsYXlTdGF0ZSA9PT0gUGxheVN0YXRlLlRSWV9BR0FJTiB8fFxyXG4gICAgICAgICAgKCBwbGF5U3RhdGUgPT09IFBsYXlTdGF0ZS5ORVhUICYmICFjaGFsbGVuZ2UuaXNDb3JyZWN0KCkgKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIEdyYXBoIHRoZSBndWVzcyBsaW5lIGF0IHRoZSBlbmQgb2YgdGhlIGNoYWxsZW5nZS5cclxuICAgICAgICBncmFwaE5vZGUuc2V0R3Vlc3NMaW5lVmlzaWJsZSggcGxheVN0YXRlID09PSBQbGF5U3RhdGUuTkVYVCApO1xyXG5cclxuICAgICAgICAvLyBzaG93IHN0dWZmIHdoZW4gdGhlIHVzZXIgZ290IHRoZSBjaGFsbGVuZ2Ugd3JvbmdcclxuICAgICAgICBpZiAoIHBsYXlTdGF0ZSA9PT0gUGxheVN0YXRlLk5FWFQgJiYgIWNoYWxsZW5nZS5pc0NvcnJlY3QoKSApIHtcclxuICAgICAgICAgIGFuc3dlckJveE5vZGUuc2V0VmlzaWJsZSggdHJ1ZSApO1xyXG4gICAgICAgICAgZ3JhcGhOb2RlLnNldEFuc3dlclBvaW50VmlzaWJsZSggdHJ1ZSApO1xyXG4gICAgICAgICAgZ3JhcGhOb2RlLnNldEd1ZXNzUG9pbnRWaXNpYmxlKCB0cnVlICk7XHJcbiAgICAgICAgICBncmFwaE5vZGUuc2V0U2xvcGVUb29sVmlzaWJsZSggdHJ1ZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdmlzaWJpbGl0eSBvZiBjb3JyZWN0L2luY29ycmVjdCBpY29uc1xyXG4gICAgICAgIHVwZGF0ZUljb25zKCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBtb2RlbC5wbGF5U3RhdGVQcm9wZXJ0eS5saW5rKCBwbGF5U3RhdGVPYnNlcnZlciApOyAvLyB1bmxpbmsgaW4gZGlzcG9zZVxyXG5cclxuICAgIHRoaXMuZGlzcG9zZU1ha2VUaGVFcXVhdGlvbk5vZGUgPSAoKSA9PiB7XHJcbiAgICAgIGNoYWxsZW5nZS5ndWVzc1Byb3BlcnR5LnVubGluayggZ3Vlc3NPYnNlcnZlciApO1xyXG4gICAgICBtb2RlbC5wbGF5U3RhdGVQcm9wZXJ0eS51bmxpbmsoIHBsYXlTdGF0ZU9ic2VydmVyICk7XHJcbiAgICAgIGd1ZXNzRXF1YXRpb25Ob2RlLmRpc3Bvc2UoKTtcclxuICAgICAgZ3JhcGhOb2RlLmRpc3Bvc2UoKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZU1ha2VUaGVFcXVhdGlvbk5vZGUoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGFuIGludGVyYWN0aXZlIGVxdWF0aW9uLlxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlSW50ZXJhY3RpdmVFcXVhdGlvbk5vZGUoIGVxdWF0aW9uRm9ybTogRXF1YXRpb25Gb3JtLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFuaXB1bGF0aW9uTW9kZTogTWFuaXB1bGF0aW9uTW9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVQcm9wZXJ0eTogUHJvcGVydHk8TGluZT4sIGdyYXBoOiBHcmFwaCwgZm9udFNpemU6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRpY0NvbG9yOiBDb2xvciB8IHN0cmluZyApOiBOb2RlIHtcclxuICBsZXQgaW50ZXJhY3RpdmVQb2ludDtcclxuICBsZXQgaW50ZXJhY3RpdmVTbG9wZTtcclxuICBsZXQgaW50ZXJhY3RpdmVJbnRlcmNlcHQ7XHJcbiAgaWYgKCBlcXVhdGlvbkZvcm0gPT09IEVxdWF0aW9uRm9ybS5TTE9QRV9JTlRFUkNFUFQgKSB7XHJcbiAgICBpbnRlcmFjdGl2ZVNsb3BlID0gKCBtYW5pcHVsYXRpb25Nb2RlID09PSBNYW5pcHVsYXRpb25Nb2RlLlNMT1BFICkgfHwgKCBtYW5pcHVsYXRpb25Nb2RlID09PSBNYW5pcHVsYXRpb25Nb2RlLlNMT1BFX0lOVEVSQ0VQVCApO1xyXG4gICAgaW50ZXJhY3RpdmVJbnRlcmNlcHQgPSAoIG1hbmlwdWxhdGlvbk1vZGUgPT09IE1hbmlwdWxhdGlvbk1vZGUuSU5URVJDRVBUICkgfHwgKCBtYW5pcHVsYXRpb25Nb2RlID09PSBNYW5pcHVsYXRpb25Nb2RlLlNMT1BFX0lOVEVSQ0VQVCApO1xyXG4gICAgcmV0dXJuIG5ldyBTbG9wZUludGVyY2VwdEVxdWF0aW9uTm9kZSggbGluZVByb3BlcnR5LCB7XHJcbiAgICAgIGludGVyYWN0aXZlU2xvcGU6IGludGVyYWN0aXZlU2xvcGUsXHJcbiAgICAgIGludGVyYWN0aXZlSW50ZXJjZXB0OiBpbnRlcmFjdGl2ZUludGVyY2VwdCxcclxuICAgICAgcmlzZVJhbmdlUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggZ3JhcGgueVJhbmdlICksXHJcbiAgICAgIHJ1blJhbmdlUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggZ3JhcGgueFJhbmdlICksXHJcbiAgICAgIHlJbnRlcmNlcHRSYW5nZVByb3BlcnR5OiBuZXcgUHJvcGVydHkoIGdyYXBoLnlSYW5nZSApLFxyXG4gICAgICBmb250U2l6ZTogZm9udFNpemUsXHJcbiAgICAgIHN0YXRpY0NvbG9yOiBzdGF0aWNDb2xvclxyXG4gICAgfSApO1xyXG4gIH1cclxuICBlbHNlIGlmICggZXF1YXRpb25Gb3JtID09PSBFcXVhdGlvbkZvcm0uUE9JTlRfU0xPUEUgKSB7XHJcbiAgICBpbnRlcmFjdGl2ZVBvaW50ID0gKCBtYW5pcHVsYXRpb25Nb2RlID09PSBNYW5pcHVsYXRpb25Nb2RlLlBPSU5UICkgfHwgKCBtYW5pcHVsYXRpb25Nb2RlID09PSBNYW5pcHVsYXRpb25Nb2RlLlBPSU5UX1NMT1BFICk7XHJcbiAgICBpbnRlcmFjdGl2ZVNsb3BlID0gKCBtYW5pcHVsYXRpb25Nb2RlID09PSBNYW5pcHVsYXRpb25Nb2RlLlNMT1BFICkgfHwgKCBtYW5pcHVsYXRpb25Nb2RlID09PSBNYW5pcHVsYXRpb25Nb2RlLlBPSU5UX1NMT1BFICk7XHJcbiAgICByZXR1cm4gbmV3IFBvaW50U2xvcGVFcXVhdGlvbk5vZGUoIGxpbmVQcm9wZXJ0eSwge1xyXG4gICAgICBpbnRlcmFjdGl2ZVBvaW50OiBpbnRlcmFjdGl2ZVBvaW50LFxyXG4gICAgICBpbnRlcmFjdGl2ZVNsb3BlOiBpbnRlcmFjdGl2ZVNsb3BlLFxyXG4gICAgICB4MVJhbmdlUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggZ3JhcGgueFJhbmdlICksXHJcbiAgICAgIHkxUmFuZ2VQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBncmFwaC55UmFuZ2UgKSxcclxuICAgICAgcmlzZVJhbmdlUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggZ3JhcGgueVJhbmdlICksXHJcbiAgICAgIHJ1blJhbmdlUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggZ3JhcGgueFJhbmdlICksXHJcbiAgICAgIGZvbnRTaXplOiBmb250U2l6ZSxcclxuICAgICAgc3RhdGljQ29sb3I6IHN0YXRpY0NvbG9yXHJcbiAgICB9ICk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCBgdW5zdXBwb3J0ZWQgZXF1YXRpb24gZm9ybTogJHtlcXVhdGlvbkZvcm0ubmFtZX1gICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmFwaGluZ0xpbmVzLnJlZ2lzdGVyKCAnTWFrZVRoZUVxdWF0aW9uTm9kZScsIE1ha2VUaGVFcXVhdGlvbk5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsU0FBc0JDLElBQUksUUFBUSxtQ0FBbUM7QUFDckUsT0FBT0MsV0FBVyxNQUFNLDZCQUE2QjtBQUNyRCxPQUFPQyxhQUFhLE1BQU0sd0JBQXdCO0FBQ2xELE9BQU9DLG9CQUFvQixNQUFNLCtCQUErQjtBQUNoRSxPQUFPQyxzQkFBc0IsTUFBTSxpREFBaUQ7QUFDcEYsT0FBT0MsMEJBQTBCLE1BQU0seURBQXlEO0FBQ2hHLE9BQU9DLGlCQUFpQixNQUFNLHlCQUF5QjtBQUN2RCxPQUFPQyxZQUFZLE1BQU0sMEJBQTBCO0FBQ25ELE9BQU9DLGdCQUFnQixNQUFNLDhCQUE4QjtBQUMzRCxPQUFPQyxTQUFTLE1BQU0sdUJBQXVCO0FBQzdDLE9BQU9DLGtCQUFrQixNQUFNLHlCQUF5QjtBQUN4RCxPQUFPQyxhQUFhLE1BQU0sb0JBQW9CO0FBQzlDLE9B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