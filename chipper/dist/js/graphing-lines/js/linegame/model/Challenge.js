// Copyright 2013-2023, University of Colorado Boulder

/**
 * Base class for game challenges.
 * In all challenges, the user is trying to match a given line.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Graph from '../../common/model/Graph.js';
import Line from '../../common/model/Line.js';
import PointTool from '../../common/model/PointTool.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
import LineGameConstants from '../LineGameConstants.js';
// eslint-disable-line no-view-imported-from-model

import ManipulationMode from './ManipulationMode.js';
import NotALine from './NotALine.js';
export default class Challenge {
  // The user's current guess, NotALine if it's not a valid line. We're not using null for "not a line" because
  // we want to know that the user's guess has changed, so a new object instance is required to trigger notifications.
  // See also NotALine.ts.

  // title that is visible to the user

  // brief description of the challenge, visible in dev versions

  // the correct answer

  // form of the equation for the challenge

  // indicates which properties of a line the user is able to change

  // model-view transform, created in the model because each challenge subclass may have its own transform

  constructor(title, description, answer, equationForm, manipulationMode, xRange, yRange) {
    this.guessProperty = new Property(createInitialGuess(answer, manipulationMode, xRange, yRange));
    this.title = title;
    this.description = description;
    this.answer = answer.withColor(LineGameConstants.ANSWER_COLOR);
    this.equationForm = equationForm;
    this.manipulationMode = manipulationMode;
    this.answerVisible = false;
    const modelViewTransformScale = LineGameConstants.GRAPH_WIDTH / xRange.getLength(); // view units / model units
    this.modelViewTransform = ModelViewTransform2.createOffsetXYScaleMapping(LineGameConstants.ORIGIN_OFFSET, modelViewTransformScale, -modelViewTransformScale); // graph on right, y inverted

    this.graph = new Graph(xRange, yRange);
    this.pointTool1 = new PointTool(new Vector2(1.5, -10.5), 'up', this.graph.lines, new Bounds2(-15, -11, 11, 13));
    this.pointTool2 = new PointTool(new Vector2(7, -13), 'down', this.graph.lines, new Bounds2(-15, -14, 11, 11));

    // When the guess changes, update the lines that are 'seen' by the point tools.
    // unlink unnecessary because Challenge owns this Property.
    this.guessProperty.link(this.updateGraphLines.bind(this));
  }

  /**
   * Creates the view component for the challenge.
   * @param model - the game model
   * @param challengeSize - dimensions of the view rectangle that is available for rendering the challenge
   * @param audioPlayer - the audio player, for providing audio feedback during game play
   */

  /**
   * Updates the collection of lines that are 'seen' by the point tools.
   */

  // Resets the challenge
  reset() {
    this.guessProperty.reset();
    this.pointTool1.reset();
    this.pointTool2.reset();
    this.setAnswerVisible(false);
  }

  // Visibility of the answer affects what is 'seen' by the point tools.
  setAnswerVisible(visible) {
    this.answerVisible = visible;
    this.updateGraphLines();
  }

  // True if the guess and answer are descriptions of the same line.
  isCorrect() {
    const guess = this.guessProperty.value; // {Line | NotALine}
    return guess instanceof Line && this.answer.same(guess);
  }

  // For debugging, do not rely on format.
  toString() {
    return `${this.constructor.name}[` + ` title=${this.title} answer=${this.answer.toString()} equationForm=${this.equationForm.name} manipulationMode=${this.manipulationMode} ]`;
  }

  /*
   * Creates a standard title for the challenge, based on what the user can manipulate.
   */
  static createTitle(defaultTitle, manipulationMode) {
    if (manipulationMode === ManipulationMode.SLOPE) {
      return GraphingLinesStrings.setTheSlope;
    } else if (manipulationMode === ManipulationMode.INTERCEPT) {
      return GraphingLinesStrings.setTheYIntercept;
    } else if (manipulationMode === ManipulationMode.POINT) {
      return GraphingLinesStrings.setThePoint;
    } else if (manipulationMode === ManipulationMode.THREE_POINTS) {
      return GraphingLinesStrings.putPointsOnLine;
    } else {
      return defaultTitle;
    }
  }
}

/*
 * Creates an initial guess, based on the answer and what the user can manipulate.
 */
function createInitialGuess(answer, manipulationMode, xRange, yRange) {
  if (manipulationMode === ManipulationMode.SLOPE) {
    // slope is variable, so use the answer's point
    return Line.createPointSlope(answer.x1, answer.y1, answer.y1 === yRange.max ? -1 : 1, answer.x1 === xRange.max ? -1 : 1, LineGameConstants.GUESS_COLOR);
  } else if (manipulationMode === ManipulationMode.INTERCEPT) {
    // intercept is variable, so use the answer's slope
    return Line.createSlopeIntercept(answer.rise, answer.run, 0, LineGameConstants.GUESS_COLOR);
  } else if (manipulationMode === ManipulationMode.POINT) {
    // point is variable, so use the answer's slope
    return Line.createPointSlope(0, 0, answer.rise, answer.run, LineGameConstants.GUESS_COLOR);
  } else if (manipulationMode === ManipulationMode.THREE_POINTS) {
    return new NotALine(); // the 3 points don't form a line
  } else {
    // in all other cases, use the standard line y=x
    return Line.Y_EQUALS_X_LINE.withColor(LineGameConstants.GUESS_COLOR);
  }
}
graphingLines.register('Challenge', Challenge);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkJvdW5kczIiLCJWZWN0b3IyIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIkdyYXBoIiwiTGluZSIsIlBvaW50VG9vbCIsImdyYXBoaW5nTGluZXMiLCJHcmFwaGluZ0xpbmVzU3RyaW5ncyIsIkxpbmVHYW1lQ29uc3RhbnRzIiwiTWFuaXB1bGF0aW9uTW9kZSIsIk5vdEFMaW5lIiwiQ2hhbGxlbmdlIiwiY29uc3RydWN0b3IiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiYW5zd2VyIiwiZXF1YXRpb25Gb3JtIiwibWFuaXB1bGF0aW9uTW9kZSIsInhSYW5nZSIsInlSYW5nZSIsImd1ZXNzUHJvcGVydHkiLCJjcmVhdGVJbml0aWFsR3Vlc3MiLCJ3aXRoQ29sb3IiLCJBTlNXRVJfQ09MT1IiLCJhbnN3ZXJWaXNpYmxlIiwibW9kZWxWaWV3VHJhbnNmb3JtU2NhbGUiLCJHUkFQSF9XSURUSCIsImdldExlbmd0aCIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImNyZWF0ZU9mZnNldFhZU2NhbGVNYXBwaW5nIiwiT1JJR0lOX09GRlNFVCIsImdyYXBoIiwicG9pbnRUb29sMSIsImxpbmVzIiwicG9pbnRUb29sMiIsImxpbmsiLCJ1cGRhdGVHcmFwaExpbmVzIiwiYmluZCIsInJlc2V0Iiwic2V0QW5zd2VyVmlzaWJsZSIsInZpc2libGUiLCJpc0NvcnJlY3QiLCJndWVzcyIsInZhbHVlIiwic2FtZSIsInRvU3RyaW5nIiwibmFtZSIsImNyZWF0ZVRpdGxlIiwiZGVmYXVsdFRpdGxlIiwiU0xPUEUiLCJzZXRUaGVTbG9wZSIsIklOVEVSQ0VQVCIsInNldFRoZVlJbnRlcmNlcHQiLCJQT0lOVCIsInNldFRoZVBvaW50IiwiVEhSRUVfUE9JTlRTIiwicHV0UG9pbnRzT25MaW5lIiwiY3JlYXRlUG9pbnRTbG9wZSIsIngxIiwieTEiLCJtYXgiLCJHVUVTU19DT0xPUiIsImNyZWF0ZVNsb3BlSW50ZXJjZXB0IiwicmlzZSIsInJ1biIsIllfRVFVQUxTX1hfTElORSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2hhbGxlbmdlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhc2UgY2xhc3MgZm9yIGdhbWUgY2hhbGxlbmdlcy5cclxuICogSW4gYWxsIGNoYWxsZW5nZXMsIHRoZSB1c2VyIGlzIHRyeWluZyB0byBtYXRjaCBhIGdpdmVuIGxpbmUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgR2FtZUF1ZGlvUGxheWVyIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0dhbWVBdWRpb1BsYXllci5qcyc7XHJcbmltcG9ydCBHcmFwaCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvR3JhcGguanMnO1xyXG5pbXBvcnQgTGluZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvTGluZS5qcyc7XHJcbmltcG9ydCBQb2ludFRvb2wgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1BvaW50VG9vbC5qcyc7XHJcbmltcG9ydCBncmFwaGluZ0xpbmVzIGZyb20gJy4uLy4uL2dyYXBoaW5nTGluZXMuanMnO1xyXG5pbXBvcnQgR3JhcGhpbmdMaW5lc1N0cmluZ3MgZnJvbSAnLi4vLi4vR3JhcGhpbmdMaW5lc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgTGluZUdhbWVDb25zdGFudHMgZnJvbSAnLi4vTGluZUdhbWVDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQ2hhbGxlbmdlTm9kZSBmcm9tICcuLi92aWV3L0NoYWxsZW5nZU5vZGUuanMnOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZpZXctaW1wb3J0ZWQtZnJvbS1tb2RlbFxyXG5pbXBvcnQgRXF1YXRpb25Gb3JtIGZyb20gJy4vRXF1YXRpb25Gb3JtLmpzJztcclxuaW1wb3J0IExpbmVHYW1lTW9kZWwgZnJvbSAnLi9MaW5lR2FtZU1vZGVsLmpzJztcclxuaW1wb3J0IE1hbmlwdWxhdGlvbk1vZGUgZnJvbSAnLi9NYW5pcHVsYXRpb25Nb2RlLmpzJztcclxuaW1wb3J0IE5vdEFMaW5lIGZyb20gJy4vTm90QUxpbmUuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgQ2hhbGxlbmdlIHtcclxuXHJcbiAgLy8gVGhlIHVzZXIncyBjdXJyZW50IGd1ZXNzLCBOb3RBTGluZSBpZiBpdCdzIG5vdCBhIHZhbGlkIGxpbmUuIFdlJ3JlIG5vdCB1c2luZyBudWxsIGZvciBcIm5vdCBhIGxpbmVcIiBiZWNhdXNlXHJcbiAgLy8gd2Ugd2FudCB0byBrbm93IHRoYXQgdGhlIHVzZXIncyBndWVzcyBoYXMgY2hhbmdlZCwgc28gYSBuZXcgb2JqZWN0IGluc3RhbmNlIGlzIHJlcXVpcmVkIHRvIHRyaWdnZXIgbm90aWZpY2F0aW9ucy5cclxuICAvLyBTZWUgYWxzbyBOb3RBTGluZS50cy5cclxuICBwdWJsaWMgcmVhZG9ubHkgZ3Vlc3NQcm9wZXJ0eTogUHJvcGVydHk8TGluZSB8IE5vdEFMaW5lPjtcclxuXHJcbiAgLy8gdGl0bGUgdGhhdCBpcyB2aXNpYmxlIHRvIHRoZSB1c2VyXHJcbiAgcHVibGljIHJlYWRvbmx5IHRpdGxlOiBzdHJpbmc7XHJcblxyXG4gIC8vIGJyaWVmIGRlc2NyaXB0aW9uIG9mIHRoZSBjaGFsbGVuZ2UsIHZpc2libGUgaW4gZGV2IHZlcnNpb25zXHJcbiAgcHVibGljIHJlYWRvbmx5IGRlc2NyaXB0aW9uOiBzdHJpbmc7XHJcblxyXG4gIC8vIHRoZSBjb3JyZWN0IGFuc3dlclxyXG4gIHB1YmxpYyByZWFkb25seSBhbnN3ZXI6IExpbmU7XHJcblxyXG4gIC8vIGZvcm0gb2YgdGhlIGVxdWF0aW9uIGZvciB0aGUgY2hhbGxlbmdlXHJcbiAgcHVibGljIHJlYWRvbmx5IGVxdWF0aW9uRm9ybTogRXF1YXRpb25Gb3JtO1xyXG5cclxuICAvLyBpbmRpY2F0ZXMgd2hpY2ggcHJvcGVydGllcyBvZiBhIGxpbmUgdGhlIHVzZXIgaXMgYWJsZSB0byBjaGFuZ2VcclxuICBwdWJsaWMgcmVhZG9ubHkgbWFuaXB1bGF0aW9uTW9kZTogTWFuaXB1bGF0aW9uTW9kZTtcclxuXHJcbiAgcHVibGljIGFuc3dlclZpc2libGU6IGJvb2xlYW47XHJcblxyXG4gIC8vIG1vZGVsLXZpZXcgdHJhbnNmb3JtLCBjcmVhdGVkIGluIHRoZSBtb2RlbCBiZWNhdXNlIGVhY2ggY2hhbGxlbmdlIHN1YmNsYXNzIG1heSBoYXZlIGl0cyBvd24gdHJhbnNmb3JtXHJcbiAgcHVibGljIHJlYWRvbmx5IG1vZGVsVmlld1RyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMjtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IGdyYXBoOiBHcmFwaDtcclxuICBwdWJsaWMgcmVhZG9ubHkgcG9pbnRUb29sMTogUG9pbnRUb29sO1xyXG4gIHB1YmxpYyByZWFkb25seSBwb2ludFRvb2wyOiBQb2ludFRvb2w7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGl0bGU6IHN0cmluZywgZGVzY3JpcHRpb246IHN0cmluZywgYW5zd2VyOiBMaW5lLCBlcXVhdGlvbkZvcm06IEVxdWF0aW9uRm9ybSxcclxuICAgICAgICAgICAgICAgICAgICAgIG1hbmlwdWxhdGlvbk1vZGU6IE1hbmlwdWxhdGlvbk1vZGUsIHhSYW5nZTogUmFuZ2UsIHlSYW5nZTogUmFuZ2UgKSB7XHJcblxyXG4gICAgdGhpcy5ndWVzc1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBjcmVhdGVJbml0aWFsR3Vlc3MoIGFuc3dlciwgbWFuaXB1bGF0aW9uTW9kZSwgeFJhbmdlLCB5UmFuZ2UgKSApO1xyXG5cclxuICAgIHRoaXMudGl0bGUgPSB0aXRsZTtcclxuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcclxuICAgIHRoaXMuYW5zd2VyID0gYW5zd2VyLndpdGhDb2xvciggTGluZUdhbWVDb25zdGFudHMuQU5TV0VSX0NPTE9SICk7XHJcbiAgICB0aGlzLmVxdWF0aW9uRm9ybSA9IGVxdWF0aW9uRm9ybTtcclxuICAgIHRoaXMubWFuaXB1bGF0aW9uTW9kZSA9IG1hbmlwdWxhdGlvbk1vZGU7XHJcblxyXG4gICAgdGhpcy5hbnN3ZXJWaXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgY29uc3QgbW9kZWxWaWV3VHJhbnNmb3JtU2NhbGUgPSBMaW5lR2FtZUNvbnN0YW50cy5HUkFQSF9XSURUSCAvIHhSYW5nZS5nZXRMZW5ndGgoKTsgLy8gdmlldyB1bml0cyAvIG1vZGVsIHVuaXRzXHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlT2Zmc2V0WFlTY2FsZU1hcHBpbmcoXHJcbiAgICAgIExpbmVHYW1lQ29uc3RhbnRzLk9SSUdJTl9PRkZTRVQsIG1vZGVsVmlld1RyYW5zZm9ybVNjYWxlLCAtbW9kZWxWaWV3VHJhbnNmb3JtU2NhbGUgKTsgLy8gZ3JhcGggb24gcmlnaHQsIHkgaW52ZXJ0ZWRcclxuXHJcbiAgICB0aGlzLmdyYXBoID0gbmV3IEdyYXBoKCB4UmFuZ2UsIHlSYW5nZSApO1xyXG5cclxuICAgIHRoaXMucG9pbnRUb29sMSA9IG5ldyBQb2ludFRvb2woIG5ldyBWZWN0b3IyKCAxLjUsIC0xMC41ICksICd1cCcsIHRoaXMuZ3JhcGgubGluZXMsIG5ldyBCb3VuZHMyKCAtMTUsIC0xMSwgMTEsIDEzICkgKTtcclxuICAgIHRoaXMucG9pbnRUb29sMiA9IG5ldyBQb2ludFRvb2woIG5ldyBWZWN0b3IyKCA3LCAtMTMgKSwgJ2Rvd24nLCB0aGlzLmdyYXBoLmxpbmVzLCBuZXcgQm91bmRzMiggLTE1LCAtMTQsIDExLCAxMSApICk7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgZ3Vlc3MgY2hhbmdlcywgdXBkYXRlIHRoZSBsaW5lcyB0aGF0IGFyZSAnc2VlbicgYnkgdGhlIHBvaW50IHRvb2xzLlxyXG4gICAgLy8gdW5saW5rIHVubmVjZXNzYXJ5IGJlY2F1c2UgQ2hhbGxlbmdlIG93bnMgdGhpcyBQcm9wZXJ0eS5cclxuICAgIHRoaXMuZ3Vlc3NQcm9wZXJ0eS5saW5rKCB0aGlzLnVwZGF0ZUdyYXBoTGluZXMuYmluZCggdGhpcyApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSB2aWV3IGNvbXBvbmVudCBmb3IgdGhlIGNoYWxsZW5nZS5cclxuICAgKiBAcGFyYW0gbW9kZWwgLSB0aGUgZ2FtZSBtb2RlbFxyXG4gICAqIEBwYXJhbSBjaGFsbGVuZ2VTaXplIC0gZGltZW5zaW9ucyBvZiB0aGUgdmlldyByZWN0YW5nbGUgdGhhdCBpcyBhdmFpbGFibGUgZm9yIHJlbmRlcmluZyB0aGUgY2hhbGxlbmdlXHJcbiAgICogQHBhcmFtIGF1ZGlvUGxheWVyIC0gdGhlIGF1ZGlvIHBsYXllciwgZm9yIHByb3ZpZGluZyBhdWRpbyBmZWVkYmFjayBkdXJpbmcgZ2FtZSBwbGF5XHJcbiAgICovXHJcbiAgcHVibGljIGFic3RyYWN0IGNyZWF0ZVZpZXcoIG1vZGVsOiBMaW5lR2FtZU1vZGVsLCBjaGFsbGVuZ2VTaXplOiBEaW1lbnNpb24yLCBhdWRpb1BsYXllcjogR2FtZUF1ZGlvUGxheWVyICk6IENoYWxsZW5nZU5vZGU7XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIGNvbGxlY3Rpb24gb2YgbGluZXMgdGhhdCBhcmUgJ3NlZW4nIGJ5IHRoZSBwb2ludCB0b29scy5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgdXBkYXRlR3JhcGhMaW5lcygpOiB2b2lkO1xyXG5cclxuICAvLyBSZXNldHMgdGhlIGNoYWxsZW5nZVxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuZ3Vlc3NQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wb2ludFRvb2wxLnJlc2V0KCk7XHJcbiAgICB0aGlzLnBvaW50VG9vbDIucmVzZXQoKTtcclxuICAgIHRoaXMuc2V0QW5zd2VyVmlzaWJsZSggZmFsc2UgKTtcclxuICB9XHJcblxyXG4gIC8vIFZpc2liaWxpdHkgb2YgdGhlIGFuc3dlciBhZmZlY3RzIHdoYXQgaXMgJ3NlZW4nIGJ5IHRoZSBwb2ludCB0b29scy5cclxuICBwdWJsaWMgc2V0QW5zd2VyVmlzaWJsZSggdmlzaWJsZTogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIHRoaXMuYW5zd2VyVmlzaWJsZSA9IHZpc2libGU7XHJcbiAgICB0aGlzLnVwZGF0ZUdyYXBoTGluZXMoKTtcclxuICB9XHJcblxyXG4gIC8vIFRydWUgaWYgdGhlIGd1ZXNzIGFuZCBhbnN3ZXIgYXJlIGRlc2NyaXB0aW9ucyBvZiB0aGUgc2FtZSBsaW5lLlxyXG4gIHB1YmxpYyBpc0NvcnJlY3QoKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBndWVzcyA9IHRoaXMuZ3Vlc3NQcm9wZXJ0eS52YWx1ZTsgLy8ge0xpbmUgfCBOb3RBTGluZX1cclxuICAgIHJldHVybiAoIGd1ZXNzIGluc3RhbmNlb2YgTGluZSApICYmIHRoaXMuYW5zd2VyLnNhbWUoIGd1ZXNzICk7XHJcbiAgfVxyXG5cclxuICAvLyBGb3IgZGVidWdnaW5nLCBkbyBub3QgcmVseSBvbiBmb3JtYXQuXHJcbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfVtgICtcclxuICAgICAgICAgICBgIHRpdGxlPSR7dGhpcy50aXRsZVxyXG4gICAgICAgICAgIH0gYW5zd2VyPSR7dGhpcy5hbnN3ZXIudG9TdHJpbmcoKVxyXG4gICAgICAgICAgIH0gZXF1YXRpb25Gb3JtPSR7dGhpcy5lcXVhdGlvbkZvcm0ubmFtZVxyXG4gICAgICAgICAgIH0gbWFuaXB1bGF0aW9uTW9kZT0ke3RoaXMubWFuaXB1bGF0aW9uTW9kZVxyXG4gICAgICAgICAgIH0gXWA7XHJcbiAgfVxyXG5cclxuICAvKlxyXG4gICAqIENyZWF0ZXMgYSBzdGFuZGFyZCB0aXRsZSBmb3IgdGhlIGNoYWxsZW5nZSwgYmFzZWQgb24gd2hhdCB0aGUgdXNlciBjYW4gbWFuaXB1bGF0ZS5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgc3RhdGljIGNyZWF0ZVRpdGxlKCBkZWZhdWx0VGl0bGU6IHN0cmluZywgbWFuaXB1bGF0aW9uTW9kZTogTWFuaXB1bGF0aW9uTW9kZSApOiBzdHJpbmcge1xyXG4gICAgaWYgKCBtYW5pcHVsYXRpb25Nb2RlID09PSBNYW5pcHVsYXRpb25Nb2RlLlNMT1BFICkge1xyXG4gICAgICByZXR1cm4gR3JhcGhpbmdMaW5lc1N0cmluZ3Muc2V0VGhlU2xvcGU7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggbWFuaXB1bGF0aW9uTW9kZSA9PT0gTWFuaXB1bGF0aW9uTW9kZS5JTlRFUkNFUFQgKSB7XHJcbiAgICAgIHJldHVybiBHcmFwaGluZ0xpbmVzU3RyaW5ncy5zZXRUaGVZSW50ZXJjZXB0O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIG1hbmlwdWxhdGlvbk1vZGUgPT09IE1hbmlwdWxhdGlvbk1vZGUuUE9JTlQgKSB7XHJcbiAgICAgIHJldHVybiBHcmFwaGluZ0xpbmVzU3RyaW5ncy5zZXRUaGVQb2ludDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBtYW5pcHVsYXRpb25Nb2RlID09PSBNYW5pcHVsYXRpb25Nb2RlLlRIUkVFX1BPSU5UUyApIHtcclxuICAgICAgcmV0dXJuIEdyYXBoaW5nTGluZXNTdHJpbmdzLnB1dFBvaW50c09uTGluZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gZGVmYXVsdFRpdGxlO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLypcclxuICogQ3JlYXRlcyBhbiBpbml0aWFsIGd1ZXNzLCBiYXNlZCBvbiB0aGUgYW5zd2VyIGFuZCB3aGF0IHRoZSB1c2VyIGNhbiBtYW5pcHVsYXRlLlxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlSW5pdGlhbEd1ZXNzKCBhbnN3ZXI6IExpbmUsIG1hbmlwdWxhdGlvbk1vZGU6IE1hbmlwdWxhdGlvbk1vZGUsIHhSYW5nZTogUmFuZ2UsIHlSYW5nZTogUmFuZ2UgKTogTGluZSB8IE5vdEFMaW5lIHtcclxuICBpZiAoIG1hbmlwdWxhdGlvbk1vZGUgPT09IE1hbmlwdWxhdGlvbk1vZGUuU0xPUEUgKSB7XHJcbiAgICAvLyBzbG9wZSBpcyB2YXJpYWJsZSwgc28gdXNlIHRoZSBhbnN3ZXIncyBwb2ludFxyXG4gICAgcmV0dXJuIExpbmUuY3JlYXRlUG9pbnRTbG9wZSggYW5zd2VyLngxLCBhbnN3ZXIueTEsICggYW5zd2VyLnkxID09PSB5UmFuZ2UubWF4ID8gLTEgOiAxICksXHJcbiAgICAgICggYW5zd2VyLngxID09PSB4UmFuZ2UubWF4ID8gLTEgOiAxICksIExpbmVHYW1lQ29uc3RhbnRzLkdVRVNTX0NPTE9SICk7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCBtYW5pcHVsYXRpb25Nb2RlID09PSBNYW5pcHVsYXRpb25Nb2RlLklOVEVSQ0VQVCApIHtcclxuICAgIC8vIGludGVyY2VwdCBpcyB2YXJpYWJsZSwgc28gdXNlIHRoZSBhbnN3ZXIncyBzbG9wZVxyXG4gICAgcmV0dXJuIExpbmUuY3JlYXRlU2xvcGVJbnRlcmNlcHQoIGFuc3dlci5yaXNlLCBhbnN3ZXIucnVuLCAwLCBMaW5lR2FtZUNvbnN0YW50cy5HVUVTU19DT0xPUiApO1xyXG4gIH1cclxuICBlbHNlIGlmICggbWFuaXB1bGF0aW9uTW9kZSA9PT0gTWFuaXB1bGF0aW9uTW9kZS5QT0lOVCApIHtcclxuICAgIC8vIHBvaW50IGlzIHZhcmlhYmxlLCBzbyB1c2UgdGhlIGFuc3dlcidzIHNsb3BlXHJcbiAgICByZXR1cm4gTGluZS5jcmVhdGVQb2ludFNsb3BlKCAwLCAwLCBhbnN3ZXIucmlzZSwgYW5zd2VyLnJ1biwgTGluZUdhbWVDb25zdGFudHMuR1VFU1NfQ09MT1IgKTtcclxuICB9XHJcbiAgZWxzZSBpZiAoIG1hbmlwdWxhdGlvbk1vZGUgPT09IE1hbmlwdWxhdGlvbk1vZGUuVEhSRUVfUE9JTlRTICkge1xyXG4gICAgcmV0dXJuIG5ldyBOb3RBTGluZSgpOyAvLyB0aGUgMyBwb2ludHMgZG9uJ3QgZm9ybSBhIGxpbmVcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICAvLyBpbiBhbGwgb3RoZXIgY2FzZXMsIHVzZSB0aGUgc3RhbmRhcmQgbGluZSB5PXhcclxuICAgIHJldHVybiBMaW5lLllfRVFVQUxTX1hfTElORS53aXRoQ29sb3IoIExpbmVHYW1lQ29uc3RhbnRzLkdVRVNTX0NPTE9SICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmFwaGluZ0xpbmVzLnJlZ2lzdGVyKCAnQ2hhbGxlbmdlJywgQ2hhbGxlbmdlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBR25ELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsbUJBQW1CLE1BQU0sdURBQXVEO0FBRXZGLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsSUFBSSxNQUFNLDRCQUE0QjtBQUM3QyxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9B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