// Copyright 2014-2021, University of Colorado Boulder

/**
 * This is the main model base class for sims that support recording and playing back.  This is done by recording
 * discrete states, then being able to set re-apply them to the model.  This library does not currently provide support
 * for interpolation between states.
 *
 * This mixture of side-effects and state capturing seems to simplify graphics updating of normal model updating,
 * though it can create additional complexity during playback.
 *
 * @author Sharfudeen Ashraf
 * @author Sam Reid (PhET Interactive Simulations)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import neuron from '../../neuron.js';
import Live from './Live.js';
import Playback from './Playback.js';
import Record from './Record.js';
class RecordAndPlaybackModel {
  constructor(maxRecordPoints) {
    this.playingProperty = new Property(true); // True if playing, false if paused
    this.timeProperty = new Property(0); // Current time of recording or playback
    this.historyRemainderClearedProperty = new Property(false);
    this.historyClearedProperty = new Property(false);
    this.modeProperty = new Property(null); // The current operational mode, valid values are playback, record or live

    this.maxRecordPoints = maxRecordPoints;

    // @private - the history of data points that have been recorded from the model.
    this.recordHistory = createObservableArray();
    this.recordMode = new Record(this); // @private - samples data from the mode and stores it
    this.playbackMode = new Playback(this); // @private - plays back recorded data
    this.liveMode = new Live(this); // @private - runs the model without recording it

    this.timeProperty.lazyLink(() => {
      this.updateRecordPlayBack();
    });
  }

  /**
   * Update the simulation model (should cause side effects to update the view), returning a snapshot of the state after the update.
   * The returned state could be ignored if the simulation is not in record mode.
   * @public
   * @abstract
   * @param {number} dt - the amount of time to update the simulation (in whatever units the simulation model is using).
   * @returns the updated state, which can be used to restore the model during playback
   */
  stepInTime(dt) {
    throw new Error('stepInTime should be implemented in descendant classes.');
  }

  /**
   * Called by the Animation Loop
   * @public
   * @param {number} dt
   */
  step(dt) {
    if (this.playingProperty.get()) {
      this.stepMode(dt);
    }
  }

  /**
   * Steps the currently active mode by the specified amount of time.
   * @private
   * @param {number} dt - the amount of time to step the current mode
   */
  stepMode(dt) {
    this.modeProperty.get().step(dt);
  }

  /**
   * @public
   * @returns {boolean}
   */
  isPlayback() {
    return this.modeProperty.get() === this.playbackMode;
  }

  /**
   * @abstract
   * @protected
   */
  updateRecordPlayBack() {
    throw new Error('updateRecordPlayBack should be implemented in descendant classes.');
  }

  /**
   * @public
   * @returns {boolean}
   */
  isRecord() {
    return this.modeProperty.get() === this.recordMode;
  }

  /**
   * @protected
   * @returns {boolean}
   */
  isLive() {
    return this.modeProperty.get() === this.liveMode;
  }

  /**
   * @public
   * @param {boolean} playing
   */
  setPlaying(playing) {
    this.playingProperty.set(playing);
  }

  /**
   * @public
   * @returns {boolean}
   */
  isRecordingFull() {
    return this.recordHistory.length >= this.getMaxRecordPoints();
  }

  /**
   * @public
   * @returns {number}
   */
  getRecordedTimeRange() {
    if (this.recordHistory.length === 0) {
      return 0;
    }
    return this.recordHistory.get(this.recordHistory.length - 1).getTime() - this.recordHistory.get(0).getTime();
  }

  /**
   * @public
   * @returns {number}
   */
  getTime() {
    return this.timeProperty.get();
  }

  /**
   * @public
   * @returns {number}
   */
  getMaxRecordedTime() {
    if (this.recordHistory.length === 0) {
      return 0.0;
    }
    return this.recordHistory.get(this.recordHistory.length - 1).getTime();
  }

  /**
   * @public
   * @returns {number}
   */
  getMinRecordedTime() {
    if (this.recordHistory.length === 0) {
      return 0.0;
    }
    return this.recordHistory.get(0).getTime();
  }

  /**
   * @public
   * @param {Mode} mode
   */
  setMode(mode) {
    this.modeProperty.set(mode);
  }

  /**
   * @public
   */
  setModeLive() {
    this.setMode(this.liveMode);
  }

  /**
   * @public
   */
  setModeRecord() {
    this.setMode(this.recordMode);
  }

  /**
   * @public
   */
  setModePlayback() {
    this.setMode(this.playbackMode);
  }

  /**
   * @public
   * @param {number} t
   */
  setTime(t) {
    this.timeProperty.set(t);
    const isPlayBackVal = this.isPlayback();
    const recordPtsLength = this.getNumRecordedPoints();
    if (isPlayBackVal && recordPtsLength > 0) {
      // Only restore state if during playback and state has been recorded
      this.setPlaybackState(this.getPlaybackState().getState()); // Sets the model state to reflect the current playback index
    }
  }

  /**
   * This method should populate the model + view of the application with the data from the specified state.
   * This state was obtained through playing back or stepping the recorded history.
   * @private
   * @param {Object} state - the state to display
   */
  setPlaybackState(state) {
    throw new Error('setPlaybackState should be implemented in descendant classes.');
  }

  /**
   * @private
   * @returns {number}
   */
  getNumRecordedPoints() {
    return this.recordHistory.length;
  }

  /**
   * @public
   */
  startRecording() {
    this.setModeRecord();
    this.setPlaying(true);
  }

  /**
   * @public
   */
  clearHistory() {
    this.recordHistory.clear();
    this.setTime(0.0); // for some reason, time has to be reset to 0.0 here, or charts don't clear in motion-series on first press of clear button
    this.historyClearedProperty.set(!this.historyClearedProperty.get());
  }

  /**
   * Empty function handle, which can be overridden to provide custom functionality when record was pressed
   * during playback.  This is useful since many sims have other data (or charts) that must be cleared when
   * record is pressed during playback.
   * @abstract
   * @public
   */
  handleRecordStartedDuringPlayback() {}

  /**
   * Look up a recorded state based on the specified time
   * @private
   */
  getPlaybackState() {
    const sortedHistory = this.recordHistory.slice();
    sortedHistory.sort((o1, o2) => compare(Math.abs(o1.getTime() - this.timeProperty.get()), Math.abs(o2.getTime() - this.timeProperty.get())));
    function compare(d1, d2) {
      if (d1 < d2) {
        return -1;
      }
      if (d1 > d2) {
        return 1;
      }
      return 0;
    }
    return sortedHistory[0];
  }

  /**
   * @private
   * @returns {number}
   */
  getPlaybackDT() {
    if (this.getNumRecordedPoints() === 0) {
      return 0;
    } else if (this.getNumRecordedPoints() === 1) {
      return this.recordHistory.get(0).getTime();
    } else {
      return (this.recordHistory.get(this.recordHistory.length - 1).getTime() - this.recordHistory.get(0).getTime()) / this.recordHistory.length;
    }
  }

  /**
   * Switches to playback mode.  This is a no-op if already in that mode.
   * @public
   */
  setPlayback() {
    this.setRecord(false);
  }

  /**
   * @public
   */
  rewind() {
    this.setTime(this.getMinRecordedTime());
  }

  /**
   * @public
   * @param {DataPoint} point
   */
  addRecordedPoint(point) {
    this.recordHistory.add(point);
  }

  /**
   * @public
   * @param {number} point index of the item to be removed
   */
  removeHistoryPoint(point) {
    this.recordHistory.remove(this.recordHistory[point]);
  }

  /**
   * @public
   * @param {boolean} rec
   * use setmode
   */
  setRecord(rec) {
    if (rec && this.modeProperty.get() !== this.recordMode) {
      this.clearHistoryRemainder();
      this.handleRecordStartedDuringPlayback();
      this.modeProperty.set(this.recordMode);
    } else if (!rec && this.modeProperty.get() !== this.playbackMode) {
      this.modeProperty.set(this.playbackMode);
    }
  }

  /**
   * @private
   */
  clearHistoryRemainder() {
    this.historyRemainderClearedProperty.set(false);
    const keep = [];
    this.recordHistory.forEach(dataPoint => {
      if (dataPoint.getTime() < this.timeProperty.get()) {
        keep.push(dataPoint);
      }
    });
    this.recordHistory.clear();
    this.recordHistory.addAll(keep.slice());
    this.historyRemainderClearedProperty.set(true);
  }

  /**
   * @public
   */
  resetAll() {
    this.playingProperty.reset();
    this.timeProperty.reset();
    this.historyRemainderClearedProperty.reset();
    this.historyClearedProperty.reset();
    this.modeProperty.reset();
    this.clearHistory();
    this.setTime(0.0);
    this.setRecord(true);
    this.setPlaying(false);
  }
}
neuron.register('RecordAndPlaybackModel', RecordAndPlaybackModel);
export default RecordAndPlaybackModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJQcm9wZXJ0eSIsIm5ldXJvbiIsIkxpdmUiLCJQbGF5YmFjayIsIlJlY29yZCIsIlJlY29yZEFuZFBsYXliYWNrTW9kZWwiLCJjb25zdHJ1Y3RvciIsIm1heFJlY29yZFBvaW50cyIsInBsYXlpbmdQcm9wZXJ0eSIsInRpbWVQcm9wZXJ0eSIsImhpc3RvcnlSZW1haW5kZXJDbGVhcmVkUHJvcGVydHkiLCJoaXN0b3J5Q2xlYXJlZFByb3BlcnR5IiwibW9kZVByb3BlcnR5IiwicmVjb3JkSGlzdG9yeSIsInJlY29yZE1vZGUiLCJwbGF5YmFja01vZGUiLCJsaXZlTW9kZSIsImxhenlMaW5rIiwidXBkYXRlUmVjb3JkUGxheUJhY2siLCJzdGVwSW5UaW1lIiwiZHQiLCJFcnJvciIsInN0ZXAiLCJnZXQiLCJzdGVwTW9kZSIsImlzUGxheWJhY2siLCJpc1JlY29yZCIsImlzTGl2ZSIsInNldFBsYXlpbmciLCJwbGF5aW5nIiwic2V0IiwiaXNSZWNvcmRpbmdGdWxsIiwibGVuZ3RoIiwiZ2V0TWF4UmVjb3JkUG9pbnRzIiwiZ2V0UmVjb3JkZWRUaW1lUmFuZ2UiLCJnZXRUaW1lIiwiZ2V0TWF4UmVjb3JkZWRUaW1lIiwiZ2V0TWluUmVjb3JkZWRUaW1lIiwic2V0TW9kZSIsIm1vZGUiLCJzZXRNb2RlTGl2ZSIsInNldE1vZGVSZWNvcmQiLCJzZXRNb2RlUGxheWJhY2siLCJzZXRUaW1lIiwidCIsImlzUGxheUJhY2tWYWwiLCJyZWNvcmRQdHNMZW5ndGgiLCJnZXROdW1SZWNvcmRlZFBvaW50cyIsInNldFBsYXliYWNrU3RhdGUiLCJnZXRQbGF5YmFja1N0YXRlIiwiZ2V0U3RhdGUiLCJzdGF0ZSIsInN0YXJ0UmVjb3JkaW5nIiwiY2xlYXJIaXN0b3J5IiwiY2xlYXIiLCJoYW5kbGVSZWNvcmRTdGFydGVkRHVyaW5nUGxheWJhY2siLCJzb3J0ZWRIaXN0b3J5Iiwic2xpY2UiLCJzb3J0IiwibzEiLCJvMiIsImNvbXBhcmUiLCJNYXRoIiwiYWJzIiwiZDEiLCJkMiIsImdldFBsYXliYWNrRFQiLCJzZXRQbGF5YmFjayIsInNldFJlY29yZCIsInJld2luZCIsImFkZFJlY29yZGVkUG9pbnQiLCJwb2ludCIsImFkZCIsInJlbW92ZUhpc3RvcnlQb2ludCIsInJlbW92ZSIsInJlYyIsImNsZWFySGlzdG9yeVJlbWFpbmRlciIsImtlZXAiLCJmb3JFYWNoIiwiZGF0YVBvaW50IiwicHVzaCIsImFkZEFsbCIsInJlc2V0QWxsIiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJlY29yZEFuZFBsYXliYWNrTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhpcyBpcyB0aGUgbWFpbiBtb2RlbCBiYXNlIGNsYXNzIGZvciBzaW1zIHRoYXQgc3VwcG9ydCByZWNvcmRpbmcgYW5kIHBsYXlpbmcgYmFjay4gIFRoaXMgaXMgZG9uZSBieSByZWNvcmRpbmdcclxuICogZGlzY3JldGUgc3RhdGVzLCB0aGVuIGJlaW5nIGFibGUgdG8gc2V0IHJlLWFwcGx5IHRoZW0gdG8gdGhlIG1vZGVsLiAgVGhpcyBsaWJyYXJ5IGRvZXMgbm90IGN1cnJlbnRseSBwcm92aWRlIHN1cHBvcnRcclxuICogZm9yIGludGVycG9sYXRpb24gYmV0d2VlbiBzdGF0ZXMuXHJcbiAqXHJcbiAqIFRoaXMgbWl4dHVyZSBvZiBzaWRlLWVmZmVjdHMgYW5kIHN0YXRlIGNhcHR1cmluZyBzZWVtcyB0byBzaW1wbGlmeSBncmFwaGljcyB1cGRhdGluZyBvZiBub3JtYWwgbW9kZWwgdXBkYXRpbmcsXHJcbiAqIHRob3VnaCBpdCBjYW4gY3JlYXRlIGFkZGl0aW9uYWwgY29tcGxleGl0eSBkdXJpbmcgcGxheWJhY2suXHJcbiAqXHJcbiAqIEBhdXRob3IgU2hhcmZ1ZGVlbiBBc2hyYWZcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgbmV1cm9uIGZyb20gJy4uLy4uL25ldXJvbi5qcyc7XHJcbmltcG9ydCBMaXZlIGZyb20gJy4vTGl2ZS5qcyc7XHJcbmltcG9ydCBQbGF5YmFjayBmcm9tICcuL1BsYXliYWNrLmpzJztcclxuaW1wb3J0IFJlY29yZCBmcm9tICcuL1JlY29yZC5qcyc7XHJcblxyXG5jbGFzcyBSZWNvcmRBbmRQbGF5YmFja01vZGVsIHtcclxuXHJcbiAgY29uc3RydWN0b3IoIG1heFJlY29yZFBvaW50cyApIHtcclxuXHJcbiAgICB0aGlzLnBsYXlpbmdQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggdHJ1ZSApOyAvLyBUcnVlIGlmIHBsYXlpbmcsIGZhbHNlIGlmIHBhdXNlZFxyXG4gICAgdGhpcy50aW1lUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAgKTsgLy8gQ3VycmVudCB0aW1lIG9mIHJlY29yZGluZyBvciBwbGF5YmFja1xyXG4gICAgdGhpcy5oaXN0b3J5UmVtYWluZGVyQ2xlYXJlZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAgdGhpcy5oaXN0b3J5Q2xlYXJlZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAgdGhpcy5tb2RlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwgKTsgLy8gVGhlIGN1cnJlbnQgb3BlcmF0aW9uYWwgbW9kZSwgdmFsaWQgdmFsdWVzIGFyZSBwbGF5YmFjaywgcmVjb3JkIG9yIGxpdmVcclxuXHJcbiAgICB0aGlzLm1heFJlY29yZFBvaW50cyA9IG1heFJlY29yZFBvaW50cztcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHRoZSBoaXN0b3J5IG9mIGRhdGEgcG9pbnRzIHRoYXQgaGF2ZSBiZWVuIHJlY29yZGVkIGZyb20gdGhlIG1vZGVsLlxyXG4gICAgdGhpcy5yZWNvcmRIaXN0b3J5ID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcblxyXG4gICAgdGhpcy5yZWNvcmRNb2RlID0gbmV3IFJlY29yZCggdGhpcyApOyAvLyBAcHJpdmF0ZSAtIHNhbXBsZXMgZGF0YSBmcm9tIHRoZSBtb2RlIGFuZCBzdG9yZXMgaXRcclxuICAgIHRoaXMucGxheWJhY2tNb2RlID0gbmV3IFBsYXliYWNrKCB0aGlzICk7IC8vIEBwcml2YXRlIC0gcGxheXMgYmFjayByZWNvcmRlZCBkYXRhXHJcbiAgICB0aGlzLmxpdmVNb2RlID0gbmV3IExpdmUoIHRoaXMgKTsgLy8gQHByaXZhdGUgLSBydW5zIHRoZSBtb2RlbCB3aXRob3V0IHJlY29yZGluZyBpdFxyXG5cclxuICAgIHRoaXMudGltZVByb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMudXBkYXRlUmVjb3JkUGxheUJhY2soKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgc2ltdWxhdGlvbiBtb2RlbCAoc2hvdWxkIGNhdXNlIHNpZGUgZWZmZWN0cyB0byB1cGRhdGUgdGhlIHZpZXcpLCByZXR1cm5pbmcgYSBzbmFwc2hvdCBvZiB0aGUgc3RhdGUgYWZ0ZXIgdGhlIHVwZGF0ZS5cclxuICAgKiBUaGUgcmV0dXJuZWQgc3RhdGUgY291bGQgYmUgaWdub3JlZCBpZiB0aGUgc2ltdWxhdGlvbiBpcyBub3QgaW4gcmVjb3JkIG1vZGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBhYnN0cmFjdFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRoZSBhbW91bnQgb2YgdGltZSB0byB1cGRhdGUgdGhlIHNpbXVsYXRpb24gKGluIHdoYXRldmVyIHVuaXRzIHRoZSBzaW11bGF0aW9uIG1vZGVsIGlzIHVzaW5nKS5cclxuICAgKiBAcmV0dXJucyB0aGUgdXBkYXRlZCBzdGF0ZSwgd2hpY2ggY2FuIGJlIHVzZWQgdG8gcmVzdG9yZSB0aGUgbW9kZWwgZHVyaW5nIHBsYXliYWNrXHJcbiAgICovXHJcbiAgc3RlcEluVGltZSggZHQgKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdzdGVwSW5UaW1lIHNob3VsZCBiZSBpbXBsZW1lbnRlZCBpbiBkZXNjZW5kYW50IGNsYXNzZXMuJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGJ5IHRoZSBBbmltYXRpb24gTG9vcFxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIGlmICggdGhpcy5wbGF5aW5nUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIHRoaXMuc3RlcE1vZGUoIGR0ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwcyB0aGUgY3VycmVudGx5IGFjdGl2ZSBtb2RlIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50IG9mIHRpbWUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSB0aGUgYW1vdW50IG9mIHRpbWUgdG8gc3RlcCB0aGUgY3VycmVudCBtb2RlXHJcbiAgICovXHJcbiAgc3RlcE1vZGUoIGR0ICkge1xyXG4gICAgdGhpcy5tb2RlUHJvcGVydHkuZ2V0KCkuc3RlcCggZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc1BsYXliYWNrKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZVByb3BlcnR5LmdldCgpID09PSB0aGlzLnBsYXliYWNrTW9kZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBhYnN0cmFjdFxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICB1cGRhdGVSZWNvcmRQbGF5QmFjaygpIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ3VwZGF0ZVJlY29yZFBsYXlCYWNrIHNob3VsZCBiZSBpbXBsZW1lbnRlZCBpbiBkZXNjZW5kYW50IGNsYXNzZXMuJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzUmVjb3JkKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZVByb3BlcnR5LmdldCgpID09PSB0aGlzLnJlY29yZE1vZGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNMaXZlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZVByb3BlcnR5LmdldCgpID09PSB0aGlzLmxpdmVNb2RlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gcGxheWluZ1xyXG4gICAqL1xyXG4gIHNldFBsYXlpbmcoIHBsYXlpbmcgKSB7XHJcbiAgICB0aGlzLnBsYXlpbmdQcm9wZXJ0eS5zZXQoIHBsYXlpbmcgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc1JlY29yZGluZ0Z1bGwoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5yZWNvcmRIaXN0b3J5Lmxlbmd0aCA+PSB0aGlzLmdldE1heFJlY29yZFBvaW50cygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0UmVjb3JkZWRUaW1lUmFuZ2UoKSB7XHJcbiAgICBpZiAoIHRoaXMucmVjb3JkSGlzdG9yeS5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMucmVjb3JkSGlzdG9yeS5nZXQoIHRoaXMucmVjb3JkSGlzdG9yeS5sZW5ndGggLSAxICkuZ2V0VGltZSgpIC0gdGhpcy5yZWNvcmRIaXN0b3J5LmdldCggMCApLmdldFRpbWUoKTtcclxuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRUaW1lKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudGltZVByb3BlcnR5LmdldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0TWF4UmVjb3JkZWRUaW1lKCkge1xyXG4gICAgaWYgKCB0aGlzLnJlY29yZEhpc3RvcnkubGVuZ3RoID09PSAwICkgeyByZXR1cm4gMC4wOyB9XHJcbiAgICByZXR1cm4gdGhpcy5yZWNvcmRIaXN0b3J5LmdldCggdGhpcy5yZWNvcmRIaXN0b3J5Lmxlbmd0aCAtIDEgKS5nZXRUaW1lKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRNaW5SZWNvcmRlZFRpbWUoKSB7XHJcbiAgICBpZiAoIHRoaXMucmVjb3JkSGlzdG9yeS5sZW5ndGggPT09IDAgKSB7IHJldHVybiAwLjA7IH1cclxuICAgIHJldHVybiB0aGlzLnJlY29yZEhpc3RvcnkuZ2V0KCAwICkuZ2V0VGltZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7TW9kZX0gbW9kZVxyXG4gICAqL1xyXG4gIHNldE1vZGUoIG1vZGUgKSB7XHJcbiAgICB0aGlzLm1vZGVQcm9wZXJ0eS5zZXQoIG1vZGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRNb2RlTGl2ZSgpIHtcclxuICAgIHRoaXMuc2V0TW9kZSggdGhpcy5saXZlTW9kZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldE1vZGVSZWNvcmQoKSB7XHJcbiAgICB0aGlzLnNldE1vZGUoIHRoaXMucmVjb3JkTW9kZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldE1vZGVQbGF5YmFjaygpIHtcclxuICAgIHRoaXMuc2V0TW9kZSggdGhpcy5wbGF5YmFja01vZGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdFxyXG4gICAqL1xyXG4gIHNldFRpbWUoIHQgKSB7XHJcbiAgICB0aGlzLnRpbWVQcm9wZXJ0eS5zZXQoIHQgKTtcclxuICAgIGNvbnN0IGlzUGxheUJhY2tWYWwgPSB0aGlzLmlzUGxheWJhY2soKTtcclxuICAgIGNvbnN0IHJlY29yZFB0c0xlbmd0aCA9IHRoaXMuZ2V0TnVtUmVjb3JkZWRQb2ludHMoKTtcclxuICAgIGlmICggaXNQbGF5QmFja1ZhbCAmJiAoIHJlY29yZFB0c0xlbmd0aCA+IDAgKSApIHsgLy8gT25seSByZXN0b3JlIHN0YXRlIGlmIGR1cmluZyBwbGF5YmFjayBhbmQgc3RhdGUgaGFzIGJlZW4gcmVjb3JkZWRcclxuICAgICAgdGhpcy5zZXRQbGF5YmFja1N0YXRlKCB0aGlzLmdldFBsYXliYWNrU3RhdGUoKS5nZXRTdGF0ZSgpICk7IC8vIFNldHMgdGhlIG1vZGVsIHN0YXRlIHRvIHJlZmxlY3QgdGhlIGN1cnJlbnQgcGxheWJhY2sgaW5kZXhcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoaXMgbWV0aG9kIHNob3VsZCBwb3B1bGF0ZSB0aGUgbW9kZWwgKyB2aWV3IG9mIHRoZSBhcHBsaWNhdGlvbiB3aXRoIHRoZSBkYXRhIGZyb20gdGhlIHNwZWNpZmllZCBzdGF0ZS5cclxuICAgKiBUaGlzIHN0YXRlIHdhcyBvYnRhaW5lZCB0aHJvdWdoIHBsYXlpbmcgYmFjayBvciBzdGVwcGluZyB0aGUgcmVjb3JkZWQgaGlzdG9yeS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZSAtIHRoZSBzdGF0ZSB0byBkaXNwbGF5XHJcbiAgICovXHJcbiAgc2V0UGxheWJhY2tTdGF0ZSggc3RhdGUgKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdzZXRQbGF5YmFja1N0YXRlIHNob3VsZCBiZSBpbXBsZW1lbnRlZCBpbiBkZXNjZW5kYW50IGNsYXNzZXMuJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldE51bVJlY29yZGVkUG9pbnRzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucmVjb3JkSGlzdG9yeS5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RhcnRSZWNvcmRpbmcoKSB7XHJcbiAgICB0aGlzLnNldE1vZGVSZWNvcmQoKTtcclxuICAgIHRoaXMuc2V0UGxheWluZyggdHJ1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNsZWFySGlzdG9yeSgpIHtcclxuICAgIHRoaXMucmVjb3JkSGlzdG9yeS5jbGVhcigpO1xyXG4gICAgdGhpcy5zZXRUaW1lKCAwLjAgKTsvLyBmb3Igc29tZSByZWFzb24sIHRpbWUgaGFzIHRvIGJlIHJlc2V0IHRvIDAuMCBoZXJlLCBvciBjaGFydHMgZG9uJ3QgY2xlYXIgaW4gbW90aW9uLXNlcmllcyBvbiBmaXJzdCBwcmVzcyBvZiBjbGVhciBidXR0b25cclxuICAgIHRoaXMuaGlzdG9yeUNsZWFyZWRQcm9wZXJ0eS5zZXQoICF0aGlzLmhpc3RvcnlDbGVhcmVkUHJvcGVydHkuZ2V0KCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEVtcHR5IGZ1bmN0aW9uIGhhbmRsZSwgd2hpY2ggY2FuIGJlIG92ZXJyaWRkZW4gdG8gcHJvdmlkZSBjdXN0b20gZnVuY3Rpb25hbGl0eSB3aGVuIHJlY29yZCB3YXMgcHJlc3NlZFxyXG4gICAqIGR1cmluZyBwbGF5YmFjay4gIFRoaXMgaXMgdXNlZnVsIHNpbmNlIG1hbnkgc2ltcyBoYXZlIG90aGVyIGRhdGEgKG9yIGNoYXJ0cykgdGhhdCBtdXN0IGJlIGNsZWFyZWQgd2hlblxyXG4gICAqIHJlY29yZCBpcyBwcmVzc2VkIGR1cmluZyBwbGF5YmFjay5cclxuICAgKiBAYWJzdHJhY3RcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgaGFuZGxlUmVjb3JkU3RhcnRlZER1cmluZ1BsYXliYWNrKCkge1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTG9vayB1cCBhIHJlY29yZGVkIHN0YXRlIGJhc2VkIG9uIHRoZSBzcGVjaWZpZWQgdGltZVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0UGxheWJhY2tTdGF0ZSgpIHtcclxuICAgIGNvbnN0IHNvcnRlZEhpc3RvcnkgPSB0aGlzLnJlY29yZEhpc3Rvcnkuc2xpY2UoKTtcclxuXHJcbiAgICBzb3J0ZWRIaXN0b3J5LnNvcnQoICggbzEsIG8yICkgPT4gY29tcGFyZSggTWF0aC5hYnMoIG8xLmdldFRpbWUoKSAtIHRoaXMudGltZVByb3BlcnR5LmdldCgpICksIE1hdGguYWJzKCBvMi5nZXRUaW1lKCkgLSB0aGlzLnRpbWVQcm9wZXJ0eS5nZXQoKSApICkgKTtcclxuXHJcbiAgICBmdW5jdGlvbiBjb21wYXJlKCBkMSwgZDIgKSB7XHJcbiAgICAgIGlmICggZDEgPCBkMiApIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBkMSA+IGQyICkge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzb3J0ZWRIaXN0b3J5WyAwIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0UGxheWJhY2tEVCgpIHtcclxuICAgIGlmICggdGhpcy5nZXROdW1SZWNvcmRlZFBvaW50cygpID09PSAwICkgeyByZXR1cm4gMDsgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuZ2V0TnVtUmVjb3JkZWRQb2ludHMoKSA9PT0gMSApIHsgcmV0dXJuIHRoaXMucmVjb3JkSGlzdG9yeS5nZXQoIDAgKS5nZXRUaW1lKCk7IH1cclxuICAgIGVsc2UgeyByZXR1cm4gKCB0aGlzLnJlY29yZEhpc3RvcnkuZ2V0KCB0aGlzLnJlY29yZEhpc3RvcnkubGVuZ3RoIC0gMSApLmdldFRpbWUoKSAtIHRoaXMucmVjb3JkSGlzdG9yeS5nZXQoIDAgKS5nZXRUaW1lKCkgKSAvIHRoaXMucmVjb3JkSGlzdG9yeS5sZW5ndGg7IH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN3aXRjaGVzIHRvIHBsYXliYWNrIG1vZGUuICBUaGlzIGlzIGEgbm8tb3AgaWYgYWxyZWFkeSBpbiB0aGF0IG1vZGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFBsYXliYWNrKCkge1xyXG4gICAgdGhpcy5zZXRSZWNvcmQoIGZhbHNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmV3aW5kKCkge1xyXG4gICAgdGhpcy5zZXRUaW1lKCB0aGlzLmdldE1pblJlY29yZGVkVGltZSgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtEYXRhUG9pbnR9IHBvaW50XHJcbiAgICovXHJcbiAgYWRkUmVjb3JkZWRQb2ludCggcG9pbnQgKSB7XHJcbiAgICB0aGlzLnJlY29yZEhpc3RvcnkuYWRkKCBwb2ludCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwb2ludCBpbmRleCBvZiB0aGUgaXRlbSB0byBiZSByZW1vdmVkXHJcbiAgICovXHJcbiAgcmVtb3ZlSGlzdG9yeVBvaW50KCBwb2ludCApIHtcclxuICAgIHRoaXMucmVjb3JkSGlzdG9yeS5yZW1vdmUoIHRoaXMucmVjb3JkSGlzdG9yeVsgcG9pbnQgXSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVjXHJcbiAgICogdXNlIHNldG1vZGVcclxuICAgKi9cclxuICBzZXRSZWNvcmQoIHJlYyApIHtcclxuICAgIGlmICggcmVjICYmIHRoaXMubW9kZVByb3BlcnR5LmdldCgpICE9PSB0aGlzLnJlY29yZE1vZGUgKSB7XHJcbiAgICAgIHRoaXMuY2xlYXJIaXN0b3J5UmVtYWluZGVyKCk7XHJcbiAgICAgIHRoaXMuaGFuZGxlUmVjb3JkU3RhcnRlZER1cmluZ1BsYXliYWNrKCk7XHJcbiAgICAgIHRoaXMubW9kZVByb3BlcnR5LnNldCggdGhpcy5yZWNvcmRNb2RlICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggIXJlYyAmJiB0aGlzLm1vZGVQcm9wZXJ0eS5nZXQoKSAhPT0gdGhpcy5wbGF5YmFja01vZGUgKSB7XHJcbiAgICAgIHRoaXMubW9kZVByb3BlcnR5LnNldCggdGhpcy5wbGF5YmFja01vZGUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgY2xlYXJIaXN0b3J5UmVtYWluZGVyKCkge1xyXG4gICAgdGhpcy5oaXN0b3J5UmVtYWluZGVyQ2xlYXJlZFByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgIGNvbnN0IGtlZXAgPSBbXTtcclxuICAgIHRoaXMucmVjb3JkSGlzdG9yeS5mb3JFYWNoKCBkYXRhUG9pbnQgPT4ge1xyXG4gICAgICBpZiAoIGRhdGFQb2ludC5nZXRUaW1lKCkgPCB0aGlzLnRpbWVQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICBrZWVwLnB1c2goIGRhdGFQb2ludCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5yZWNvcmRIaXN0b3J5LmNsZWFyKCk7XHJcbiAgICB0aGlzLnJlY29yZEhpc3RvcnkuYWRkQWxsKCBrZWVwLnNsaWNlKCkgKTtcclxuICAgIHRoaXMuaGlzdG9yeVJlbWFpbmRlckNsZWFyZWRQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldEFsbCgpIHtcclxuICAgIHRoaXMucGxheWluZ1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRpbWVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5oaXN0b3J5UmVtYWluZGVyQ2xlYXJlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmhpc3RvcnlDbGVhcmVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubW9kZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmNsZWFySGlzdG9yeSgpO1xyXG4gICAgdGhpcy5zZXRUaW1lKCAwLjAgKTtcclxuICAgIHRoaXMuc2V0UmVjb3JkKCB0cnVlICk7XHJcbiAgICB0aGlzLnNldFBsYXlpbmcoIGZhbHNlICk7XHJcbiAgfVxyXG59XHJcblxyXG5uZXVyb24ucmVnaXN0ZXIoICdSZWNvcmRBbmRQbGF5YmFja01vZGVsJywgUmVjb3JkQW5kUGxheWJhY2tNb2RlbCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUmVjb3JkQW5kUGxheWJhY2tNb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFC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