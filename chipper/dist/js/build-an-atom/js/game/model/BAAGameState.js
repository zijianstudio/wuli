// Copyright 2017-2022, University of Colorado Boulder

/**
 * Base type for Build and Atom game states.  These states use the Object Oriented state pattern, please see
 * https://en.wikipedia.org/wiki/State_pattern.  It is also described in the book "Design Patterns: Elements of Reusable
 * Object-Oriented Software" by Gamma et al.  The basic idea here is that the game challenges act as the state of the
 * game model, and stimuli from the user, such as submitting an answer, are submitted to the states via the API
 * defined below.
 *
 * If your game state needs to be disposed, then implement the disposeState() function, otherwise there will be no cleanup
 * on state change.
 *
 * @author John Blanco
 */

import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import buildAnAtom from '../../buildAnAtom.js';
import BAAGameChallenge from './BAAGameChallenge.js';
class BAAGameState extends PhetioObject {
  /**
   * @param {String} name
   */
  constructor(name, options) {
    super(options);
    this.name = name;
  }

  //-----------------------------------------------------------------------------------------------------------------
  // The following functions comprise the API used by the challenge view to send user events to the challenge.
  //-----------------------------------------------------------------------------------------------------------------

  /**
   * update score and state based on whether the user submitted a correct or incorrect answer
   * @param {NumberAtom} submittedAtom
   * @param {boolean} isCorrect
   * @param {Object} emitMessageOptions
   * @public
   */
  handleEvaluatedAnswer(submittedAtom, isCorrect, emitMessageOptions) {
    throw new Error('handleEvaluatedAnswer should never be called in base class');
  }

  /**
   * Process the answer submitted by the user.  This is the most basic check, and more elaborate ways of verifying
   * can be implemented in sub-classes.
   * @param {NumberAtom} submittedAtom
   * @public
   */
  checkAnswer(submittedAtom) {
    throw new Error('checkAnswer should never be called in base class');
  }

  /**
   * allow the user to try again to correctly answer the question
   * @public
   */
  tryAgain() {
    throw new Error('tryAgain should never be called in base class');
  }

  /**
   * advance to the next question or finish the level
   * @public
   */
  next() {
    throw new Error('next should never be called in base class');
  }

  /**
   * display the correct answer to the user
   * @public
   */
  displayCorrectAnswer() {
    throw new Error('displayCorrectAnswer should never be called in base class');
  }

  /**
   * step the challenge in time, override in any states/challenges that have time-dependent behavior
   * @param dt
   * @public
   */
  step(dt) {
    // stubbed in base class
  }
}
buildAnAtom.register('BAAGameState', BAAGameState);

// static instance of game states
BAAGameState.CHOOSING_LEVEL = new BAAGameState('choosingLevel');
BAAGameState.LEVEL_COMPLETED = new BAAGameState('levelCompleted');
BAAGameState.BAAGameStateIO = new IOType('BAAGameStateIO', {
  valueType: BAAGameState,
  documentation: 'A state for the game',
  toStateObject: baaGameState => {
    if (baaGameState instanceof phet.buildAnAtom.BAAGameChallenge) {
      return BAAGameChallenge.BAAGameChallengeIO.toStateObject(baaGameState);
    } else {
      return {
        name: baaGameState.name
      };
    }
  },
  fromStateObject: stateObject => {
    if (stateObject.name === 'choosingLevel') {
      return BAAGameState.CHOOSING_LEVEL;
    } else if (stateObject.name === 'levelCompleted') {
      return BAAGameState.LEVEL_COMPLETED;
    } else if (stateObject.name === 'challenge') {
      return BAAGameChallenge.BAAGameChallengeIO.fromStateObject(stateObject);
    } else {
      throw new Error(`unknown game state: ${stateObject}`);
    }
  }
});
export default BAAGameState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0aW9PYmplY3QiLCJJT1R5cGUiLCJidWlsZEFuQXRvbSIsIkJBQUdhbWVDaGFsbGVuZ2UiLCJCQUFHYW1lU3RhdGUiLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJvcHRpb25zIiwiaGFuZGxlRXZhbHVhdGVkQW5zd2VyIiwic3VibWl0dGVkQXRvbSIsImlzQ29ycmVjdCIsImVtaXRNZXNzYWdlT3B0aW9ucyIsIkVycm9yIiwiY2hlY2tBbnN3ZXIiLCJ0cnlBZ2FpbiIsIm5leHQiLCJkaXNwbGF5Q29ycmVjdEFuc3dlciIsInN0ZXAiLCJkdCIsInJlZ2lzdGVyIiwiQ0hPT1NJTkdfTEVWRUwiLCJMRVZFTF9DT01QTEVURUQiLCJCQUFHYW1lU3RhdGVJTyIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJ0b1N0YXRlT2JqZWN0IiwiYmFhR2FtZVN0YXRlIiwicGhldCIsIkJBQUdhbWVDaGFsbGVuZ2VJTyIsImZyb21TdGF0ZU9iamVjdCIsInN0YXRlT2JqZWN0Il0sInNvdXJjZXMiOlsiQkFBR2FtZVN0YXRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhc2UgdHlwZSBmb3IgQnVpbGQgYW5kIEF0b20gZ2FtZSBzdGF0ZXMuICBUaGVzZSBzdGF0ZXMgdXNlIHRoZSBPYmplY3QgT3JpZW50ZWQgc3RhdGUgcGF0dGVybiwgcGxlYXNlIHNlZVxyXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TdGF0ZV9wYXR0ZXJuLiAgSXQgaXMgYWxzbyBkZXNjcmliZWQgaW4gdGhlIGJvb2sgXCJEZXNpZ24gUGF0dGVybnM6IEVsZW1lbnRzIG9mIFJldXNhYmxlXHJcbiAqIE9iamVjdC1PcmllbnRlZCBTb2Z0d2FyZVwiIGJ5IEdhbW1hIGV0IGFsLiAgVGhlIGJhc2ljIGlkZWEgaGVyZSBpcyB0aGF0IHRoZSBnYW1lIGNoYWxsZW5nZXMgYWN0IGFzIHRoZSBzdGF0ZSBvZiB0aGVcclxuICogZ2FtZSBtb2RlbCwgYW5kIHN0aW11bGkgZnJvbSB0aGUgdXNlciwgc3VjaCBhcyBzdWJtaXR0aW5nIGFuIGFuc3dlciwgYXJlIHN1Ym1pdHRlZCB0byB0aGUgc3RhdGVzIHZpYSB0aGUgQVBJXHJcbiAqIGRlZmluZWQgYmVsb3cuXHJcbiAqXHJcbiAqIElmIHlvdXIgZ2FtZSBzdGF0ZSBuZWVkcyB0byBiZSBkaXNwb3NlZCwgdGhlbiBpbXBsZW1lbnQgdGhlIGRpc3Bvc2VTdGF0ZSgpIGZ1bmN0aW9uLCBvdGhlcndpc2UgdGhlcmUgd2lsbCBiZSBubyBjbGVhbnVwXHJcbiAqIG9uIHN0YXRlIGNoYW5nZS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBidWlsZEFuQXRvbSBmcm9tICcuLi8uLi9idWlsZEFuQXRvbS5qcyc7XHJcbmltcG9ydCBCQUFHYW1lQ2hhbGxlbmdlIGZyb20gJy4vQkFBR2FtZUNoYWxsZW5nZS5qcyc7XHJcblxyXG5jbGFzcyBCQUFHYW1lU3RhdGUgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBuYW1lLCBvcHRpb25zICkge1xyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgfVxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gVGhlIGZvbGxvd2luZyBmdW5jdGlvbnMgY29tcHJpc2UgdGhlIEFQSSB1c2VkIGJ5IHRoZSBjaGFsbGVuZ2UgdmlldyB0byBzZW5kIHVzZXIgZXZlbnRzIHRvIHRoZSBjaGFsbGVuZ2UuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvKipcclxuICAgKiB1cGRhdGUgc2NvcmUgYW5kIHN0YXRlIGJhc2VkIG9uIHdoZXRoZXIgdGhlIHVzZXIgc3VibWl0dGVkIGEgY29ycmVjdCBvciBpbmNvcnJlY3QgYW5zd2VyXHJcbiAgICogQHBhcmFtIHtOdW1iZXJBdG9tfSBzdWJtaXR0ZWRBdG9tXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0NvcnJlY3RcclxuICAgKiBAcGFyYW0ge09iamVjdH0gZW1pdE1lc3NhZ2VPcHRpb25zXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGhhbmRsZUV2YWx1YXRlZEFuc3dlciggc3VibWl0dGVkQXRvbSwgaXNDb3JyZWN0LCBlbWl0TWVzc2FnZU9wdGlvbnMgKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdoYW5kbGVFdmFsdWF0ZWRBbnN3ZXIgc2hvdWxkIG5ldmVyIGJlIGNhbGxlZCBpbiBiYXNlIGNsYXNzJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHJvY2VzcyB0aGUgYW5zd2VyIHN1Ym1pdHRlZCBieSB0aGUgdXNlci4gIFRoaXMgaXMgdGhlIG1vc3QgYmFzaWMgY2hlY2ssIGFuZCBtb3JlIGVsYWJvcmF0ZSB3YXlzIG9mIHZlcmlmeWluZ1xyXG4gICAqIGNhbiBiZSBpbXBsZW1lbnRlZCBpbiBzdWItY2xhc3Nlcy5cclxuICAgKiBAcGFyYW0ge051bWJlckF0b219IHN1Ym1pdHRlZEF0b21cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY2hlY2tBbnN3ZXIoIHN1Ym1pdHRlZEF0b20gKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdjaGVja0Fuc3dlciBzaG91bGQgbmV2ZXIgYmUgY2FsbGVkIGluIGJhc2UgY2xhc3MnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBhbGxvdyB0aGUgdXNlciB0byB0cnkgYWdhaW4gdG8gY29ycmVjdGx5IGFuc3dlciB0aGUgcXVlc3Rpb25cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdHJ5QWdhaW4oKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoICd0cnlBZ2FpbiBzaG91bGQgbmV2ZXIgYmUgY2FsbGVkIGluIGJhc2UgY2xhc3MnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBhZHZhbmNlIHRvIHRoZSBuZXh0IHF1ZXN0aW9uIG9yIGZpbmlzaCB0aGUgbGV2ZWxcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbmV4dCgpIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ25leHQgc2hvdWxkIG5ldmVyIGJlIGNhbGxlZCBpbiBiYXNlIGNsYXNzJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZGlzcGxheSB0aGUgY29ycmVjdCBhbnN3ZXIgdG8gdGhlIHVzZXJcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcGxheUNvcnJlY3RBbnN3ZXIoKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdkaXNwbGF5Q29ycmVjdEFuc3dlciBzaG91bGQgbmV2ZXIgYmUgY2FsbGVkIGluIGJhc2UgY2xhc3MnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzdGVwIHRoZSBjaGFsbGVuZ2UgaW4gdGltZSwgb3ZlcnJpZGUgaW4gYW55IHN0YXRlcy9jaGFsbGVuZ2VzIHRoYXQgaGF2ZSB0aW1lLWRlcGVuZGVudCBiZWhhdmlvclxyXG4gICAqIEBwYXJhbSBkdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIC8vIHN0dWJiZWQgaW4gYmFzZSBjbGFzc1xyXG4gIH1cclxufVxyXG5cclxuYnVpbGRBbkF0b20ucmVnaXN0ZXIoICdCQUFHYW1lU3RhdGUnLCBCQUFHYW1lU3RhdGUgKTtcclxuXHJcbi8vIHN0YXRpYyBpbnN0YW5jZSBvZiBnYW1lIHN0YXRlc1xyXG5CQUFHYW1lU3RhdGUuQ0hPT1NJTkdfTEVWRUwgPSBuZXcgQkFBR2FtZVN0YXRlKCAnY2hvb3NpbmdMZXZlbCcgKTtcclxuQkFBR2FtZVN0YXRlLkxFVkVMX0NPTVBMRVRFRCA9IG5ldyBCQUFHYW1lU3RhdGUoICdsZXZlbENvbXBsZXRlZCcgKTtcclxuXHJcbkJBQUdhbWVTdGF0ZS5CQUFHYW1lU3RhdGVJTyA9IG5ldyBJT1R5cGUoICdCQUFHYW1lU3RhdGVJTycsIHtcclxuICB2YWx1ZVR5cGU6IEJBQUdhbWVTdGF0ZSxcclxuICBkb2N1bWVudGF0aW9uOiAnQSBzdGF0ZSBmb3IgdGhlIGdhbWUnLFxyXG4gIHRvU3RhdGVPYmplY3Q6IGJhYUdhbWVTdGF0ZSA9PiB7XHJcbiAgICBpZiAoIGJhYUdhbWVTdGF0ZSBpbnN0YW5jZW9mIHBoZXQuYnVpbGRBbkF0b20uQkFBR2FtZUNoYWxsZW5nZSApIHtcclxuICAgICAgcmV0dXJuIEJBQUdhbWVDaGFsbGVuZ2UuQkFBR2FtZUNoYWxsZW5nZUlPLnRvU3RhdGVPYmplY3QoIGJhYUdhbWVTdGF0ZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB7IG5hbWU6IGJhYUdhbWVTdGF0ZS5uYW1lIH07XHJcbiAgICB9XHJcbiAgfSxcclxuICBmcm9tU3RhdGVPYmplY3Q6IHN0YXRlT2JqZWN0ID0+IHtcclxuICAgIGlmICggc3RhdGVPYmplY3QubmFtZSA9PT0gJ2Nob29zaW5nTGV2ZWwnICkge1xyXG4gICAgICByZXR1cm4gQkFBR2FtZVN0YXRlLkNIT09TSU5HX0xFVkVMO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHN0YXRlT2JqZWN0Lm5hbWUgPT09ICdsZXZlbENvbXBsZXRlZCcgKSB7XHJcbiAgICAgIHJldHVybiBCQUFHYW1lU3RhdGUuTEVWRUxfQ09NUExFVEVEO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHN0YXRlT2JqZWN0Lm5hbWUgPT09ICdjaGFsbGVuZ2UnICkge1xyXG4gICAgICByZXR1cm4gQkFBR2FtZUNoYWxsZW5nZS5CQUFHYW1lQ2hhbGxlbmdlSU8uZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggYHVua25vd24gZ2FtZSBzdGF0ZTogJHtzdGF0ZU9iamVjdH1gICk7XHJcbiAgICB9XHJcbiAgfVxyXG59ICk7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQkFBR2FtZVN0YXRlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFlBQVksTUFBTSx1Q0FBdUM7QUFDaEUsT0FBT0MsTUFBTSxNQUFNLHVDQUF1QztBQUMxRCxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLGdCQUFnQixNQUFNLHVCQUF1QjtBQUVwRCxNQUFNQyxZQUFZLFNBQVNKLFlBQVksQ0FBQztFQUV0QztBQUNGO0FBQ0E7RUFDRUssV0FBV0EsQ0FBRUMsSUFBSSxFQUFFQyxPQUFPLEVBQUc7SUFDM0IsS0FBSyxDQUFFQSxPQUFRLENBQUM7SUFDaEIsSUFBSSxDQUFDRCxJQUFJLEdBQUdBLElBQUk7RUFDbEI7O0VBRUE7RUFDQTtFQUNBOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLHFCQUFxQkEsQ0FBRUMsYUFBYSxFQUFFQyxTQUFTLEVBQUVDLGtCQUFrQixFQUFHO0lBQ3BFLE1BQU0sSUFBSUMsS0FBSyxDQUFFLDREQUE2RCxDQUFDO0VBQ2pGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFSixhQUFhLEVBQUc7SUFDM0IsTUFBTSxJQUFJRyxLQUFLLENBQUUsa0RBQW1ELENBQUM7RUFDdkU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRUUsUUFBUUEsQ0FBQSxFQUFHO0lBQ1QsTUFBTSxJQUFJRixLQUFLLENBQUUsK0NBQWdELENBQUM7RUFDcEU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRUcsSUFBSUEsQ0FBQSxFQUFHO0lBQ0wsTUFBTSxJQUFJSCxLQUFLLENBQUUsMkNBQTRDLENBQUM7RUFDaEU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRUksb0JBQW9CQSxDQUFBLEVBQUc7SUFDckIsTUFBTSxJQUFJSixLQUFLLENBQUUsMkRBQTRELENBQUM7RUFDaEY7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFSyxJQUFJQSxDQUFFQyxFQUFFLEVBQUc7SUFDVDtFQUFBO0FBRUo7QUFFQWhCLFdBQVcsQ0FBQ2lCLFFBQVEsQ0FBRSxjQUFjLEVBQUVmLFlBQWEsQ0FBQzs7QUFFcEQ7QUFDQUEsWUFBWSxDQUFDZ0IsY0FBYyxHQUFHLElBQUloQixZQUFZLENBQUUsZUFBZ0IsQ0FBQztBQUNqRUEsWUFBWSxDQUFDaUIsZUFBZSxHQUFHLElBQUlqQixZQUFZLENBQUUsZ0JBQWlCLENBQUM7QUFFbkVBLFlBQVksQ0FBQ2tCLGNBQWMsR0FBRyxJQUFJckIsTUFBTSxDQUFFLGdCQUFnQixFQUFFO0VBQzFEc0IsU0FBUyxFQUFFbkIsWUFBWTtFQUN2Qm9CLGFBQWEsRUFBRSxzQkFBc0I7RUFDckNDLGFBQWEsRUFBRUMsWUFBWSxJQUFJO0lBQzdCLElBQUtBLFlBQVksWUFBWUMsSUFBSSxDQUFDekIsV0FBVyxDQUFDQyxnQkFBZ0IsRUFBRztNQUMvRCxPQUFPQSxnQkFBZ0IsQ0FBQ3lCLGtCQUFrQixDQUFDSCxhQUFhLENBQUVDLFlBQWEsQ0FBQztJQUMxRSxDQUFDLE1BQ0k7TUFDSCxPQUFPO1FBQUVwQixJQUFJLEVBQUVvQixZQUFZLENBQUNwQjtNQUFLLENBQUM7SUFDcEM7RUFDRixDQUFDO0VBQ0R1QixlQUFlLEVBQUVDLFdBQVcsSUFBSTtJQUM5QixJQUFLQSxXQUFXLENBQUN4QixJQUFJLEtBQUssZUFBZSxFQUFHO01BQzFDLE9BQU9GLFlBQVksQ0FBQ2dCLGNBQWM7SUFDcEMsQ0FBQyxNQUNJLElBQUtVLFdBQVcsQ0FBQ3hCLElBQUksS0FBSyxnQkFBZ0IsRUFBRztNQUNoRCxPQUFPRixZQUFZLENBQUNpQixlQUFlO0lBQ3JDLENBQUMsTUFDSSxJQUFLUyxXQUFXLENBQUN4QixJQUFJLEtBQUssV0FBVyxFQUFHO01BQzNDLE9BQU9ILGdCQUFnQixDQUFDeUIsa0JBQWtCLENBQUNDLGVBQWUsQ0FBRUMsV0FBWSxDQUFDO0lBQzNFLENBQUMsTUFDSTtNQUNILE1BQU0sSUFBSWxCLEtBQUssQ0FBRyx1QkFBc0JrQixXQUFZLEVBQUUsQ0FBQztJQUN6RDtFQUNGO0FBQ0YsQ0FBRSxDQUFDO0FBR0gsZUFBZTFCLFlBQVkifQ==