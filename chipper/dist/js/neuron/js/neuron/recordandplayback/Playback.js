// Copyright 2014-2021, University of Colorado Boulder

/**
 * Type representing the 'playback' mode within the RecordAndPlaybackModel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import BehaviourModeType from './BehaviourModeType.js';
import Mode from './Mode.js';
class Playback extends Mode {
  /**
   * @param {RecordAndPlaybackModel} recordAndPlaybackModel
   */
  constructor(recordAndPlaybackModel) {
    super();
    this.recordAndPlaybackModel = recordAndPlaybackModel;
  }

  /**
   * @override
   * @public
   * @param {number} simulationTimeChange
   */
  step(simulationTimeChange) {
    if (simulationTimeChange > 0) {
      if (this.recordAndPlaybackModel.getTime() < this.recordAndPlaybackModel.getMaxRecordedTime()) {
        this.recordAndPlaybackModel.setTime(this.recordAndPlaybackModel.timeProperty.get() + simulationTimeChange);
      } else {
        if (BehaviourModeType.recordAtEndOfPlayback) {
          this.recordAndPlaybackModel.setRecord(true);
        } else if (BehaviourModeType.pauseAtEndOfPlayback) {
          this.recordAndPlaybackModel.setPlaying(false);
        }
      }
    } else if (simulationTimeChange < 0) {
      if (this.recordAndPlaybackModel.getTime() > this.recordAndPlaybackModel.getMinRecordedTime()) {
        this.recordAndPlaybackModel.setTime(this.recordAndPlaybackModel.timeProperty.get() + simulationTimeChange);
      }
    }
  }

  /**
   * @override
   * @public
   */
  toString() {
    return 'Playback';
  }
}
neuron.register('Playback', Playback);
export default Playback;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJuZXVyb24iLCJCZWhhdmlvdXJNb2RlVHlwZSIsIk1vZGUiLCJQbGF5YmFjayIsImNvbnN0cnVjdG9yIiwicmVjb3JkQW5kUGxheWJhY2tNb2RlbCIsInN0ZXAiLCJzaW11bGF0aW9uVGltZUNoYW5nZSIsImdldFRpbWUiLCJnZXRNYXhSZWNvcmRlZFRpbWUiLCJzZXRUaW1lIiwidGltZVByb3BlcnR5IiwiZ2V0IiwicmVjb3JkQXRFbmRPZlBsYXliYWNrIiwic2V0UmVjb3JkIiwicGF1c2VBdEVuZE9mUGxheWJhY2siLCJzZXRQbGF5aW5nIiwiZ2V0TWluUmVjb3JkZWRUaW1lIiwidG9TdHJpbmciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBsYXliYWNrLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFR5cGUgcmVwcmVzZW50aW5nIHRoZSAncGxheWJhY2snIG1vZGUgd2l0aGluIHRoZSBSZWNvcmRBbmRQbGF5YmFja01vZGVsLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmIChmb3IgR2hlbnQgVW5pdmVyc2l0eSlcclxuICovXHJcblxyXG5pbXBvcnQgbmV1cm9uIGZyb20gJy4uLy4uL25ldXJvbi5qcyc7XHJcbmltcG9ydCBCZWhhdmlvdXJNb2RlVHlwZSBmcm9tICcuL0JlaGF2aW91ck1vZGVUeXBlLmpzJztcclxuaW1wb3J0IE1vZGUgZnJvbSAnLi9Nb2RlLmpzJztcclxuXHJcbmNsYXNzIFBsYXliYWNrIGV4dGVuZHMgTW9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UmVjb3JkQW5kUGxheWJhY2tNb2RlbH0gcmVjb3JkQW5kUGxheWJhY2tNb2RlbFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCByZWNvcmRBbmRQbGF5YmFja01vZGVsICkge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMucmVjb3JkQW5kUGxheWJhY2tNb2RlbCA9IHJlY29yZEFuZFBsYXliYWNrTW9kZWw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNpbXVsYXRpb25UaW1lQ2hhbmdlXHJcbiAgICovXHJcbiAgc3RlcCggc2ltdWxhdGlvblRpbWVDaGFuZ2UgKSB7XHJcblxyXG4gICAgaWYgKCBzaW11bGF0aW9uVGltZUNoYW5nZSA+IDAgKSB7XHJcbiAgICAgIGlmICggdGhpcy5yZWNvcmRBbmRQbGF5YmFja01vZGVsLmdldFRpbWUoKSA8IHRoaXMucmVjb3JkQW5kUGxheWJhY2tNb2RlbC5nZXRNYXhSZWNvcmRlZFRpbWUoKSApIHtcclxuICAgICAgICB0aGlzLnJlY29yZEFuZFBsYXliYWNrTW9kZWwuc2V0VGltZSggdGhpcy5yZWNvcmRBbmRQbGF5YmFja01vZGVsLnRpbWVQcm9wZXJ0eS5nZXQoKSArIHNpbXVsYXRpb25UaW1lQ2hhbmdlICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgaWYgKCBCZWhhdmlvdXJNb2RlVHlwZS5yZWNvcmRBdEVuZE9mUGxheWJhY2sgKSB7XHJcbiAgICAgICAgICB0aGlzLnJlY29yZEFuZFBsYXliYWNrTW9kZWwuc2V0UmVjb3JkKCB0cnVlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBCZWhhdmlvdXJNb2RlVHlwZS5wYXVzZUF0RW5kT2ZQbGF5YmFjayApIHtcclxuICAgICAgICAgIHRoaXMucmVjb3JkQW5kUGxheWJhY2tNb2RlbC5zZXRQbGF5aW5nKCBmYWxzZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHNpbXVsYXRpb25UaW1lQ2hhbmdlIDwgMCApIHtcclxuICAgICAgaWYgKCB0aGlzLnJlY29yZEFuZFBsYXliYWNrTW9kZWwuZ2V0VGltZSgpID4gdGhpcy5yZWNvcmRBbmRQbGF5YmFja01vZGVsLmdldE1pblJlY29yZGVkVGltZSgpICkge1xyXG4gICAgICAgIHRoaXMucmVjb3JkQW5kUGxheWJhY2tNb2RlbC5zZXRUaW1lKCB0aGlzLnJlY29yZEFuZFBsYXliYWNrTW9kZWwudGltZVByb3BlcnR5LmdldCgpICsgc2ltdWxhdGlvblRpbWVDaGFuZ2UgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHRvU3RyaW5nKCkge1xyXG4gICAgcmV0dXJuICdQbGF5YmFjayc7XHJcbiAgfVxyXG59XHJcblxyXG5uZXVyb24ucmVnaXN0ZXIoICdQbGF5YmFjaycsIFBsYXliYWNrICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQbGF5YmFjazsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0saUJBQWlCO0FBQ3BDLE9BQU9DLGlCQUFpQixNQUFNLHdCQUF3QjtBQUN0RCxPQUFPQyxJQUFJLE1BQU0sV0FBVztBQUU1QixNQUFNQyxRQUFRLFNBQVNELElBQUksQ0FBQztFQUUxQjtBQUNGO0FBQ0E7RUFDRUUsV0FBV0EsQ0FBRUMsc0JBQXNCLEVBQUc7SUFDcEMsS0FBSyxDQUFDLENBQUM7SUFDUCxJQUFJLENBQUNBLHNCQUFzQixHQUFHQSxzQkFBc0I7RUFDdEQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxJQUFJQSxDQUFFQyxvQkFBb0IsRUFBRztJQUUzQixJQUFLQSxvQkFBb0IsR0FBRyxDQUFDLEVBQUc7TUFDOUIsSUFBSyxJQUFJLENBQUNGLHNCQUFzQixDQUFDRyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsc0JBQXNCLENBQUNJLGtCQUFrQixDQUFDLENBQUMsRUFBRztRQUM5RixJQUFJLENBQUNKLHNCQUFzQixDQUFDSyxPQUFPLENBQUUsSUFBSSxDQUFDTCxzQkFBc0IsQ0FBQ00sWUFBWSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxHQUFHTCxvQkFBcUIsQ0FBQztNQUM5RyxDQUFDLE1BQ0k7UUFDSCxJQUFLTixpQkFBaUIsQ0FBQ1kscUJBQXFCLEVBQUc7VUFDN0MsSUFBSSxDQUFDUixzQkFBc0IsQ0FBQ1MsU0FBUyxDQUFFLElBQUssQ0FBQztRQUMvQyxDQUFDLE1BQ0ksSUFBS2IsaUJBQWlCLENBQUNjLG9CQUFvQixFQUFHO1VBQ2pELElBQUksQ0FBQ1Ysc0JBQXNCLENBQUNXLFVBQVUsQ0FBRSxLQUFNLENBQUM7UUFDakQ7TUFDRjtJQUNGLENBQUMsTUFDSSxJQUFLVCxvQkFBb0IsR0FBRyxDQUFDLEVBQUc7TUFDbkMsSUFBSyxJQUFJLENBQUNGLHNCQUFzQixDQUFDRyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsc0JBQXNCLENBQUNZLGtCQUFrQixDQUFDLENBQUMsRUFBRztRQUM5RixJQUFJLENBQUNaLHNCQUFzQixDQUFDSyxPQUFPLENBQUUsSUFBSSxDQUFDTCxzQkFBc0IsQ0FBQ00sWUFBWSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxHQUFHTCxvQkFBcUIsQ0FBQztNQUM5RztJQUNGO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRVcsUUFBUUEsQ0FBQSxFQUFHO0lBQ1QsT0FBTyxVQUFVO0VBQ25CO0FBQ0Y7QUFFQWxCLE1BQU0sQ0FBQ21CLFFBQVEsQ0FBRSxVQUFVLEVBQUVoQixRQUFTLENBQUM7QUFFdkMsZUFBZUEsUUFBUSJ9