// Copyright 2014-2020, University of Colorado Boulder

/**
 * Common model (base type) for Plinko Probability
 *
 * @author Martin Veillette (Berea College)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import plinkoProbability from '../../plinkoProbability.js';
import PlinkoProbabilityConstants from '../PlinkoProbabilityConstants.js';
import GaltonBoard from './GaltonBoard.js';
import Histogram from './Histogram.js';

// constants
const BALL_MODE_VALUES = ['oneBall', 'tenBalls', 'maxBalls', 'continuous']; // values for ballModeProperty
const HOPPER_MODE_VALUES = ['ball', 'path', 'none']; // values for hopperModeProperty

class PlinkoProbabilityCommonModel {
  /**
   */
  constructor() {
    // @public {number} this can be a number between 0 and 1
    this.probabilityProperty = new NumberProperty(PlinkoProbabilityConstants.BINARY_PROBABILITY_RANGE.defaultValue, {
      range: PlinkoProbabilityConstants.BINARY_PROBABILITY_RANGE
    });

    // @public {string} controls how many balls are dispensed when the 'play' button is pressed
    this.ballModeProperty = new StringProperty('oneBall', {
      validValues: BALL_MODE_VALUES
    });

    // {string} controls what comes out of the hopper above the Galton board
    this.hopperModeProperty = new StringProperty('ball', {
      validValues: HOPPER_MODE_VALUES
    });

    // {boolean} is the maximum number of balls reached?
    this.isBallCapReachedProperty = new BooleanProperty(false);

    // {number} number of rows in the Galton board
    this.numberOfRowsProperty = new NumberProperty(PlinkoProbabilityConstants.ROWS_RANGE.defaultValue, {
      range: PlinkoProbabilityConstants.ROWS_RANGE,
      numberType: 'Integer'
    });
    this.ballCreationTimeElapsed = 0; // @public {number} - time elapsed since last ball creation
    this.balls = createObservableArray(); // @public
    this.galtonBoard = new GaltonBoard(this.numberOfRowsProperty); // @public
    this.histogram = new Histogram(this.numberOfRowsProperty); // @public

    // @public Fires when one or more balls moves.
    // See https://github.com/phetsims/plinko-probability/issues/62 for details.
    this.ballsMovedEmitter = new Emitter();
    const eraseThis = this.erase.bind(this);
    this.probabilityProperty.link(eraseThis);
    this.numberOfRowsProperty.link(eraseThis);
  }

  /**
   * Called when the 'Reset All' button is pressed.
   *
   * @override
   * @public
   */
  reset() {
    this.probabilityProperty.reset();
    this.ballModeProperty.reset();
    this.hopperModeProperty.reset();
    this.isBallCapReachedProperty.reset();
    this.numberOfRowsProperty.reset();
    this.erase();
  }

  /**
   * Called when the erase button is pressed.
   *
   * @public
   */
  erase() {
    this.balls.clear(); // clear the balls on the galton board
    this.histogram.reset(); // reset the histogram statistics
    this.isBallCapReachedProperty.set(false);
    this.ballsMovedEmitter.emit();
  }
}
plinkoProbability.register('PlinkoProbabilityCommonModel', PlinkoProbabilityCommonModel);
export default PlinkoProbabilityCommonModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJTdHJpbmdQcm9wZXJ0eSIsInBsaW5rb1Byb2JhYmlsaXR5IiwiUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMiLCJHYWx0b25Cb2FyZCIsIkhpc3RvZ3JhbSIsIkJBTExfTU9ERV9WQUxVRVMiLCJIT1BQRVJfTU9ERV9WQUxVRVMiLCJQbGlua29Qcm9iYWJpbGl0eUNvbW1vbk1vZGVsIiwiY29uc3RydWN0b3IiLCJwcm9iYWJpbGl0eVByb3BlcnR5IiwiQklOQVJZX1BST0JBQklMSVRZX1JBTkdFIiwiZGVmYXVsdFZhbHVlIiwicmFuZ2UiLCJiYWxsTW9kZVByb3BlcnR5IiwidmFsaWRWYWx1ZXMiLCJob3BwZXJNb2RlUHJvcGVydHkiLCJpc0JhbGxDYXBSZWFjaGVkUHJvcGVydHkiLCJudW1iZXJPZlJvd3NQcm9wZXJ0eSIsIlJPV1NfUkFOR0UiLCJudW1iZXJUeXBlIiwiYmFsbENyZWF0aW9uVGltZUVsYXBzZWQiLCJiYWxscyIsImdhbHRvbkJvYXJkIiwiaGlzdG9ncmFtIiwiYmFsbHNNb3ZlZEVtaXR0ZXIiLCJlcmFzZVRoaXMiLCJlcmFzZSIsImJpbmQiLCJsaW5rIiwicmVzZXQiLCJjbGVhciIsInNldCIsImVtaXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBsaW5rb1Byb2JhYmlsaXR5Q29tbW9uTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29tbW9uIG1vZGVsIChiYXNlIHR5cGUpIGZvciBQbGlua28gUHJvYmFiaWxpdHlcclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlIChCZXJlYSBDb2xsZWdlKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBwbGlua29Qcm9iYWJpbGl0eSBmcm9tICcuLi8uLi9wbGlua29Qcm9iYWJpbGl0eS5qcyc7XHJcbmltcG9ydCBQbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cyBmcm9tICcuLi9QbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBHYWx0b25Cb2FyZCBmcm9tICcuL0dhbHRvbkJvYXJkLmpzJztcclxuaW1wb3J0IEhpc3RvZ3JhbSBmcm9tICcuL0hpc3RvZ3JhbS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQkFMTF9NT0RFX1ZBTFVFUyA9IFsgJ29uZUJhbGwnLCAndGVuQmFsbHMnLCAnbWF4QmFsbHMnLCAnY29udGludW91cycgXTsgLy8gdmFsdWVzIGZvciBiYWxsTW9kZVByb3BlcnR5XHJcbmNvbnN0IEhPUFBFUl9NT0RFX1ZBTFVFUyA9IFsgJ2JhbGwnLCAncGF0aCcsICdub25lJyBdOyAvLyB2YWx1ZXMgZm9yIGhvcHBlck1vZGVQcm9wZXJ0eVxyXG5cclxuY2xhc3MgUGxpbmtvUHJvYmFiaWxpdHlDb21tb25Nb2RlbCB7XHJcbiAgLyoqXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSB0aGlzIGNhbiBiZSBhIG51bWJlciBiZXR3ZWVuIDAgYW5kIDFcclxuICAgIHRoaXMucHJvYmFiaWxpdHlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuQklOQVJZX1BST0JBQklMSVRZX1JBTkdFLmRlZmF1bHRWYWx1ZSwge1xyXG4gICAgICByYW5nZTogUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuQklOQVJZX1BST0JBQklMSVRZX1JBTkdFXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7c3RyaW5nfSBjb250cm9scyBob3cgbWFueSBiYWxscyBhcmUgZGlzcGVuc2VkIHdoZW4gdGhlICdwbGF5JyBidXR0b24gaXMgcHJlc3NlZFxyXG4gICAgdGhpcy5iYWxsTW9kZVByb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCAnb25lQmFsbCcsIHtcclxuICAgICAgdmFsaWRWYWx1ZXM6IEJBTExfTU9ERV9WQUxVRVNcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB7c3RyaW5nfSBjb250cm9scyB3aGF0IGNvbWVzIG91dCBvZiB0aGUgaG9wcGVyIGFib3ZlIHRoZSBHYWx0b24gYm9hcmRcclxuICAgIHRoaXMuaG9wcGVyTW9kZVByb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCAnYmFsbCcsIHtcclxuICAgICAgdmFsaWRWYWx1ZXM6IEhPUFBFUl9NT0RFX1ZBTFVFU1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHtib29sZWFufSBpcyB0aGUgbWF4aW11bSBudW1iZXIgb2YgYmFsbHMgcmVhY2hlZD9cclxuICAgIHRoaXMuaXNCYWxsQ2FwUmVhY2hlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyB7bnVtYmVyfSBudW1iZXIgb2Ygcm93cyBpbiB0aGUgR2FsdG9uIGJvYXJkXHJcbiAgICB0aGlzLm51bWJlck9mUm93c1Byb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBQbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cy5ST1dTX1JBTkdFLmRlZmF1bHRWYWx1ZSwge1xyXG4gICAgICByYW5nZTogUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuUk9XU19SQU5HRSxcclxuICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5iYWxsQ3JlYXRpb25UaW1lRWxhcHNlZCA9IDA7IC8vIEBwdWJsaWMge251bWJlcn0gLSB0aW1lIGVsYXBzZWQgc2luY2UgbGFzdCBiYWxsIGNyZWF0aW9uXHJcbiAgICB0aGlzLmJhbGxzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7IC8vIEBwdWJsaWNcclxuICAgIHRoaXMuZ2FsdG9uQm9hcmQgPSBuZXcgR2FsdG9uQm9hcmQoIHRoaXMubnVtYmVyT2ZSb3dzUHJvcGVydHkgKTsgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5oaXN0b2dyYW0gPSBuZXcgSGlzdG9ncmFtKCB0aGlzLm51bWJlck9mUm93c1Byb3BlcnR5ICk7IC8vIEBwdWJsaWNcclxuXHJcbiAgICAvLyBAcHVibGljIEZpcmVzIHdoZW4gb25lIG9yIG1vcmUgYmFsbHMgbW92ZXMuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BsaW5rby1wcm9iYWJpbGl0eS9pc3N1ZXMvNjIgZm9yIGRldGFpbHMuXHJcbiAgICB0aGlzLmJhbGxzTW92ZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICBjb25zdCBlcmFzZVRoaXMgPSB0aGlzLmVyYXNlLmJpbmQoIHRoaXMgKTtcclxuICAgIHRoaXMucHJvYmFiaWxpdHlQcm9wZXJ0eS5saW5rKCBlcmFzZVRoaXMgKTtcclxuICAgIHRoaXMubnVtYmVyT2ZSb3dzUHJvcGVydHkubGluayggZXJhc2VUaGlzICk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlICdSZXNldCBBbGwnIGJ1dHRvbiBpcyBwcmVzc2VkLlxyXG4gICAqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5wcm9iYWJpbGl0eVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmJhbGxNb2RlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaG9wcGVyTW9kZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmlzQmFsbENhcFJlYWNoZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5udW1iZXJPZlJvd3NQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5lcmFzZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGVyYXNlIGJ1dHRvbiBpcyBwcmVzc2VkLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGVyYXNlKCkge1xyXG4gICAgdGhpcy5iYWxscy5jbGVhcigpOyAvLyBjbGVhciB0aGUgYmFsbHMgb24gdGhlIGdhbHRvbiBib2FyZFxyXG4gICAgdGhpcy5oaXN0b2dyYW0ucmVzZXQoKTsgLy8gcmVzZXQgdGhlIGhpc3RvZ3JhbSBzdGF0aXN0aWNzXHJcbiAgICB0aGlzLmlzQmFsbENhcFJlYWNoZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICB0aGlzLmJhbGxzTW92ZWRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcbn1cclxuXHJcbnBsaW5rb1Byb2JhYmlsaXR5LnJlZ2lzdGVyKCAnUGxpbmtvUHJvYmFiaWxpdHlDb21tb25Nb2RlbCcsIFBsaW5rb1Byb2JhYmlsaXR5Q29tbW9uTW9kZWwgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBsaW5rb1Byb2JhYmlsaXR5Q29tbW9uTW9kZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MscUJBQXFCLE1BQU0sOENBQThD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