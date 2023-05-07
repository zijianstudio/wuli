// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model for 'Make the Equation' challenges.
 * In this challenge, the user is given a graphed line and must make the equation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
import MakeTheEquationNode from '../view/MakeTheEquationNode.js'; // eslint-disable-line no-view-imported-from-model
import Challenge from './Challenge.js';
import Line from '../../common/model/Line.js';
export default class MakeTheEquation extends Challenge {
  /**
   * @param description - brief description of the challenge, visible in dev versions
   * @param answer - the correct answer
   * @param equationForm - specifies the form of the equation
   * @param manipulationMode - indicates which properties of a line the user is able to change
   * @param xRange - range of the graph's x-axis
   * @param yRange - range of the graph's y-axis
   */
  constructor(description, answer, equationForm, manipulationMode, xRange, yRange) {
    super(Challenge.createTitle(GraphingLinesStrings.makeTheEquation, manipulationMode), description, answer, equationForm, manipulationMode, xRange, yRange);
  }

  /**
   * Creates the view for this challenge.
   */
  createView(model, challengeSize, audioPlayer) {
    return new MakeTheEquationNode(this, model, challengeSize, audioPlayer);
  }

  /**
   * Updates the collection of lines that are 'seen' by the point tools.
   * Order is important here! See https://github.com/phetsims/graphing-lines/issues/89
   */
  updateGraphLines() {
    this.graph.lines.clear();
    this.graph.lines.push(this.answer);

    // Account for guesses that might be NotALine (not a valid line).
    const guess = this.guessProperty.value;
    if (this.answerVisible && guess instanceof Line) {
      this.graph.lines.push(guess);
    }
  }
}
graphingLines.register('MakeTheEquation', MakeTheEquation);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJncmFwaGluZ0xpbmVzIiwiR3JhcGhpbmdMaW5lc1N0cmluZ3MiLCJNYWtlVGhlRXF1YXRpb25Ob2RlIiwiQ2hhbGxlbmdlIiwiTGluZSIsIk1ha2VUaGVFcXVhdGlvbiIsImNvbnN0cnVjdG9yIiwiZGVzY3JpcHRpb24iLCJhbnN3ZXIiLCJlcXVhdGlvbkZvcm0iLCJtYW5pcHVsYXRpb25Nb2RlIiwieFJhbmdlIiwieVJhbmdlIiwiY3JlYXRlVGl0bGUiLCJtYWtlVGhlRXF1YXRpb24iLCJjcmVhdGVWaWV3IiwibW9kZWwiLCJjaGFsbGVuZ2VTaXplIiwiYXVkaW9QbGF5ZXIiLCJ1cGRhdGVHcmFwaExpbmVzIiwiZ3JhcGgiLCJsaW5lcyIsImNsZWFyIiwicHVzaCIsImd1ZXNzIiwiZ3Vlc3NQcm9wZXJ0eSIsInZhbHVlIiwiYW5zd2VyVmlzaWJsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTWFrZVRoZUVxdWF0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGZvciAnTWFrZSB0aGUgRXF1YXRpb24nIGNoYWxsZW5nZXMuXHJcbiAqIEluIHRoaXMgY2hhbGxlbmdlLCB0aGUgdXNlciBpcyBnaXZlbiBhIGdyYXBoZWQgbGluZSBhbmQgbXVzdCBtYWtlIHRoZSBlcXVhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IGdyYXBoaW5nTGluZXMgZnJvbSAnLi4vLi4vZ3JhcGhpbmdMaW5lcy5qcyc7XHJcbmltcG9ydCBHcmFwaGluZ0xpbmVzU3RyaW5ncyBmcm9tICcuLi8uLi9HcmFwaGluZ0xpbmVzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBNYWtlVGhlRXF1YXRpb25Ob2RlIGZyb20gJy4uL3ZpZXcvTWFrZVRoZUVxdWF0aW9uTm9kZS5qcyc7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdmlldy1pbXBvcnRlZC1mcm9tLW1vZGVsXHJcbmltcG9ydCBDaGFsbGVuZ2UgZnJvbSAnLi9DaGFsbGVuZ2UuanMnO1xyXG5pbXBvcnQgTGluZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvTGluZS5qcyc7XHJcbmltcG9ydCBFcXVhdGlvbkZvcm0gZnJvbSAnLi9FcXVhdGlvbkZvcm0uanMnO1xyXG5pbXBvcnQgTWFuaXB1bGF0aW9uTW9kZSBmcm9tICcuL01hbmlwdWxhdGlvbk1vZGUuanMnO1xyXG5pbXBvcnQgTGluZUdhbWVNb2RlbCBmcm9tICcuL0xpbmVHYW1lTW9kZWwuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBHYW1lQXVkaW9QbGF5ZXIgZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvR2FtZUF1ZGlvUGxheWVyLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1ha2VUaGVFcXVhdGlvbiBleHRlbmRzIENoYWxsZW5nZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBkZXNjcmlwdGlvbiAtIGJyaWVmIGRlc2NyaXB0aW9uIG9mIHRoZSBjaGFsbGVuZ2UsIHZpc2libGUgaW4gZGV2IHZlcnNpb25zXHJcbiAgICogQHBhcmFtIGFuc3dlciAtIHRoZSBjb3JyZWN0IGFuc3dlclxyXG4gICAqIEBwYXJhbSBlcXVhdGlvbkZvcm0gLSBzcGVjaWZpZXMgdGhlIGZvcm0gb2YgdGhlIGVxdWF0aW9uXHJcbiAgICogQHBhcmFtIG1hbmlwdWxhdGlvbk1vZGUgLSBpbmRpY2F0ZXMgd2hpY2ggcHJvcGVydGllcyBvZiBhIGxpbmUgdGhlIHVzZXIgaXMgYWJsZSB0byBjaGFuZ2VcclxuICAgKiBAcGFyYW0geFJhbmdlIC0gcmFuZ2Ugb2YgdGhlIGdyYXBoJ3MgeC1heGlzXHJcbiAgICogQHBhcmFtIHlSYW5nZSAtIHJhbmdlIG9mIHRoZSBncmFwaCdzIHktYXhpc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGVzY3JpcHRpb246IHN0cmluZywgYW5zd2VyOiBMaW5lLCBlcXVhdGlvbkZvcm06IEVxdWF0aW9uRm9ybSxcclxuICAgICAgICAgICAgICAgICAgICAgIG1hbmlwdWxhdGlvbk1vZGU6IE1hbmlwdWxhdGlvbk1vZGUsIHhSYW5nZTogUmFuZ2UsIHlSYW5nZTogUmFuZ2UgKSB7XHJcbiAgICBzdXBlcihcclxuICAgICAgQ2hhbGxlbmdlLmNyZWF0ZVRpdGxlKCBHcmFwaGluZ0xpbmVzU3RyaW5ncy5tYWtlVGhlRXF1YXRpb24sIG1hbmlwdWxhdGlvbk1vZGUgKSxcclxuICAgICAgZGVzY3JpcHRpb24sXHJcbiAgICAgIGFuc3dlcixcclxuICAgICAgZXF1YXRpb25Gb3JtLFxyXG4gICAgICBtYW5pcHVsYXRpb25Nb2RlLFxyXG4gICAgICB4UmFuZ2UsXHJcbiAgICAgIHlSYW5nZVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIHZpZXcgZm9yIHRoaXMgY2hhbGxlbmdlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBjcmVhdGVWaWV3KCBtb2RlbDogTGluZUdhbWVNb2RlbCwgY2hhbGxlbmdlU2l6ZTogRGltZW5zaW9uMiwgYXVkaW9QbGF5ZXI6IEdhbWVBdWRpb1BsYXllciApOiBNYWtlVGhlRXF1YXRpb25Ob2RlIHtcclxuICAgIHJldHVybiBuZXcgTWFrZVRoZUVxdWF0aW9uTm9kZSggdGhpcywgbW9kZWwsIGNoYWxsZW5nZVNpemUsIGF1ZGlvUGxheWVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIG9mIGxpbmVzIHRoYXQgYXJlICdzZWVuJyBieSB0aGUgcG9pbnQgdG9vbHMuXHJcbiAgICogT3JkZXIgaXMgaW1wb3J0YW50IGhlcmUhIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ3JhcGhpbmctbGluZXMvaXNzdWVzLzg5XHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIHVwZGF0ZUdyYXBoTGluZXMoKTogdm9pZCB7XHJcbiAgICB0aGlzLmdyYXBoLmxpbmVzLmNsZWFyKCk7XHJcbiAgICB0aGlzLmdyYXBoLmxpbmVzLnB1c2goIHRoaXMuYW5zd2VyICk7XHJcblxyXG4gICAgLy8gQWNjb3VudCBmb3IgZ3Vlc3NlcyB0aGF0IG1pZ2h0IGJlIE5vdEFMaW5lIChub3QgYSB2YWxpZCBsaW5lKS5cclxuICAgIGNvbnN0IGd1ZXNzID0gdGhpcy5ndWVzc1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgaWYgKCB0aGlzLmFuc3dlclZpc2libGUgJiYgZ3Vlc3MgaW5zdGFuY2VvZiBMaW5lICkge1xyXG4gICAgICB0aGlzLmdyYXBoLmxpbmVzLnB1c2goIGd1ZXNzICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5ncmFwaGluZ0xpbmVzLnJlZ2lzdGVyKCAnTWFrZVRoZUVxdWF0aW9uJywgTWFrZVRoZUVxdWF0aW9uICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFDaEUsT0FBT0MsbUJBQW1CLE1BQU0sZ0NBQWdDLENBQUMsQ0FBQztBQUNsRSxPQUFPQyxTQUFTLE1BQU0sZ0JBQWdCO0FBQ3RDLE9BQU9DLElBQUksTUFBTSw0QkFBNEI7QUFPN0MsZUFBZSxNQUFNQyxlQUFlLFNBQVNGLFNBQVMsQ0FBQztFQUVyRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NHLFdBQVdBLENBQUVDLFdBQW1CLEVBQUVDLE1BQVksRUFBRUMsWUFBMEIsRUFDN0RDLGdCQUFrQyxFQUFFQyxNQUFhLEVBQUVDLE1BQWEsRUFBRztJQUNyRixLQUFLLENBQ0hULFNBQVMsQ0FBQ1UsV0FBVyxDQUFFWixvQkFBb0IsQ0FBQ2EsZUFBZSxFQUFFSixnQkFBaUIsQ0FBQyxFQUMvRUgsV0FBVyxFQUNYQyxNQUFNLEVBQ05DLFlBQVksRUFDWkMsZ0JBQWdCLEVBQ2hCQyxNQUFNLEVBQ05DLE1BQ0YsQ0FBQztFQUNIOztFQUVBO0FBQ0Y7QUFDQTtFQUNrQkcsVUFBVUEsQ0FBRUMsS0FBb0IsRUFBRUMsYUFBeUIsRUFBRUMsV0FBNEIsRUFBd0I7SUFDL0gsT0FBTyxJQUFJaEIsbUJBQW1CLENBQUUsSUFBSSxFQUFFYyxLQUFLLEVBQUVDLGFBQWEsRUFBRUMsV0FBWSxDQUFDO0VBQzNFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ3FCQyxnQkFBZ0JBLENBQUEsRUFBUztJQUMxQyxJQUFJLENBQUNDLEtBQUssQ0FBQ0MsS0FBSyxDQUFDQyxLQUFLLENBQUMsQ0FBQztJQUN4QixJQUFJLENBQUNGLEtBQUssQ0FBQ0MsS0FBSyxDQUFDRSxJQUFJLENBQUUsSUFBSSxDQUFDZixNQUFPLENBQUM7O0lBRXBDO0lBQ0EsTUFBTWdCLEtBQUssR0FBRyxJQUFJLENBQUNDLGFBQWEsQ0FBQ0MsS0FBSztJQUN0QyxJQUFLLElBQUksQ0FBQ0MsYUFBYSxJQUFJSCxLQUFLLFlBQVlwQixJQUFJLEVBQUc7TUFDakQsSUFBSSxDQUFDZ0IsS0FBSyxDQUFDQyxLQUFLLENBQUNFLElBQUksQ0FBRUMsS0FBTSxDQUFDO0lBQ2hDO0VBQ0Y7QUFDRjtBQUVBeEIsYUFBYSxDQUFDNEIsUUFBUSxDQUFFLGlCQUFpQixFQUFFdkIsZUFBZ0IsQ0FBQyJ9