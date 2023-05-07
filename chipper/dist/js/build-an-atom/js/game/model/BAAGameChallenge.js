// Copyright 2013-2022, University of Colorado Boulder

/**
 * Base class (or base type) for the challenges used in the Build an Atom game.
 * The general approach is that an atom is presented in some way to the user,
 * and the user must submit a correct guess about the atom's configuration.
 *
 * @author John Blanco
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import Range from '../../../../dot/js/Range.js';
import NumberAtom from '../../../../shred/js/model/NumberAtom.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import buildAnAtom from '../../buildAnAtom.js';
import BAASharedConstants from '../../common/BAASharedConstants.js';
import BAAChallengeState from './BAAChallengeState.js';
import BAAGameState from './BAAGameState.js';
class BAAGameChallenge extends BAAGameState {
  /**
   * @param {GameModel} buildAnAtomGameModel
   * @param {NumberAtom} answerAtom
   * @param {string} challengeType
   * @param {Tandem} tandem
   */
  constructor(buildAnAtomGameModel, answerAtom, challengeType, tandem) {
    // TODO: Consider either having all the subclasses define a name, or just getting rid of the name altogether.
    super('challenge', {
      tandem: tandem,
      phetioState: false,
      phetioType: BAAGameChallenge.BAAGameChallengeIO
    });

    // TODO why not an Enum?
    this.challengeStateProperty = new StringProperty(BAAChallengeState.PRESENTING_CHALLENGE, {
      tandem: tandem.createTandem('challengeStateProperty'),
      phetioReadOnly: true,
      phetioState: false,
      validValues: _.values(BAAChallengeState)
    });
    this.numSubmissionsProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('numSubmissionsProperty'),
      range: new Range(0, BAASharedConstants.MAX_CHALLENGE_ATTEMPTS),
      phetioReadOnly: true,
      phetioState: false
    });
    this.answerAtom = answerAtom; // @public (phet-io)
    this.pointValue = 0; // @public (phet-io)
    this.model = buildAnAtomGameModel; // @public (phet-io)
    this.challengeType = challengeType; // @public (phet-io)
  }

  /**
   * @public - release resources when no longer used
   */
  dispose() {
    this.challengeStateProperty.dispose();
    this.numSubmissionsProperty.dispose();
    super.dispose();
  }

  /**
   * @public - presence of this method will trigger disposal when game state changes
   */
  disposeState() {
    this.dispose();
  }

  /**
   * @public
   * @override
   */
  handleEvaluatedAnswer(submittedAtom, isCorrect, emitMessageOptions) {
    this.numSubmissionsProperty.set(this.numSubmissionsProperty.get() + 1);
    const pointsIfCorrect = this.numSubmissionsProperty.get() === 1 ? 2 : 1;
    this.pointValue = isCorrect ? pointsIfCorrect : 0;
    this.model.scoreProperty.set(this.model.scoreProperty.get() + this.pointValue);
    this.model.emitCheckAnswer(isCorrect, this.pointValue, this.answerAtom, submittedAtom, emitMessageOptions);
    if (this.model.provideFeedbackProperty.get()) {
      if (isCorrect) {
        // Move to the next state.
        this.challengeStateProperty.set(BAAChallengeState.CHALLENGE_SOLVED_CORRECTLY);
      } else {
        // Handle incorrect answer.
        if (this.numSubmissionsProperty.get() < BAASharedConstants.MAX_CHALLENGE_ATTEMPTS) {
          // Give the user another chance.
          this.challengeStateProperty.set(BAAChallengeState.PRESENTING_TRY_AGAIN);
        } else {
          // User has exhausted their attempts.
          this.challengeStateProperty.set(BAAChallengeState.ATTEMPTS_EXHAUSTED);
        }
      }
    } else {
      // don't provide any feedback - just go to the next challenge
      this.next();
    }
  }

  /**
   * @override
   * @public
   */
  checkAnswer(submittedAtom) {
    // Verify that the current state is as expected.
    assert && assert(this.challengeStateProperty.get() === BAAChallengeState.PRESENTING_CHALLENGE, `Unexpected challenge state: ${this.challengeStateProperty.get()}`);
    const isCorrect = this.answerAtom.equals(submittedAtom);
    this.handleEvaluatedAnswer(submittedAtom, isCorrect);
  }

  /**
   * @override
   * @public
   */
  tryAgain() {
    this.challengeStateProperty.set(BAAChallengeState.PRESENTING_CHALLENGE);
  }

  /**
   * @override
   * @public
   */
  next() {
    // This event is basically handled by the model, which will remove this challenge and do whatever should happen
    // next.
    this.model.next();
  }

  /**
   * @override
   * @public
   */
  displayCorrectAnswer() {
    this.challengeStateProperty.set(BAAChallengeState.DISPLAYING_CORRECT_ANSWER);
  }
}
buildAnAtom.register('BAAGameChallenge', BAAGameChallenge);
BAAGameChallenge.BAAGameChallengeIO = new IOType('BAAGameChallengeIO', {
  valueType: BAAGameChallenge,
  documentation: 'A challenge for the Game',
  toStateObject: baaGameChallenge => ({
    pointValue: baaGameChallenge.pointValue,
    answerAtom: NumberAtom.NumberAtomIO.toStateObject(baaGameChallenge.answerAtom),
    modelPhetioID: baaGameChallenge.model.tandem.phetioID,
    challengeType: baaGameChallenge.challengeType,
    phetioID: baaGameChallenge.tandem.phetioID,
    name: baaGameChallenge.name
  }),
  fromStateObject: stateObject => {
    const phetioEngine = phet.phetio.phetioEngine;

    // This may have been deserialized from the instance itself or from the array it was contained in (which
    // is instrumented as ArrayIO), so check to see if it is already deserialized before deserializing.
    // TODO: is there a better way to do this, or at least factor it out?
    const instance = phetioEngine.hasPhetioObject(stateObject.phetioID);
    if (instance) {
      return phetioEngine.getPhetioObject(stateObject.phetioID);
    }
    const model = phetioEngine.getPhetioObject(stateObject.modelPhetioID);
    const answerAtom = new phet.shred.NumberAtom({
      protonCount: stateObject.answerAtom.protonCount,
      neutronCount: stateObject.answerAtom.neutronCount,
      electronCount: stateObject.answerAtom.electronCount
    });
    const tandem = new phet.tandem.Tandem(stateObject.phetioID);
    return phet.buildAnAtom.ChallengeSetFactory.createChallenge(model, stateObject.challengeType, answerAtom, tandem);
  }
});
export default BAAGameChallenge;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlN0cmluZ1Byb3BlcnR5IiwiUmFuZ2UiLCJOdW1iZXJBdG9tIiwiSU9UeXBlIiwiYnVpbGRBbkF0b20iLCJCQUFTaGFyZWRDb25zdGFudHMiLCJCQUFDaGFsbGVuZ2VTdGF0ZSIsIkJBQUdhbWVTdGF0ZSIsIkJBQUdhbWVDaGFsbGVuZ2UiLCJjb25zdHJ1Y3RvciIsImJ1aWxkQW5BdG9tR2FtZU1vZGVsIiwiYW5zd2VyQXRvbSIsImNoYWxsZW5nZVR5cGUiLCJ0YW5kZW0iLCJwaGV0aW9TdGF0ZSIsInBoZXRpb1R5cGUiLCJCQUFHYW1lQ2hhbGxlbmdlSU8iLCJjaGFsbGVuZ2VTdGF0ZVByb3BlcnR5IiwiUFJFU0VOVElOR19DSEFMTEVOR0UiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9SZWFkT25seSIsInZhbGlkVmFsdWVzIiwiXyIsInZhbHVlcyIsIm51bVN1Ym1pc3Npb25zUHJvcGVydHkiLCJyYW5nZSIsIk1BWF9DSEFMTEVOR0VfQVRURU1QVFMiLCJwb2ludFZhbHVlIiwibW9kZWwiLCJkaXNwb3NlIiwiZGlzcG9zZVN0YXRlIiwiaGFuZGxlRXZhbHVhdGVkQW5zd2VyIiwic3VibWl0dGVkQXRvbSIsImlzQ29ycmVjdCIsImVtaXRNZXNzYWdlT3B0aW9ucyIsInNldCIsImdldCIsInBvaW50c0lmQ29ycmVjdCIsInNjb3JlUHJvcGVydHkiLCJlbWl0Q2hlY2tBbnN3ZXIiLCJwcm92aWRlRmVlZGJhY2tQcm9wZXJ0eSIsIkNIQUxMRU5HRV9TT0xWRURfQ09SUkVDVExZIiwiUFJFU0VOVElOR19UUllfQUdBSU4iLCJBVFRFTVBUU19FWEhBVVNURUQiLCJuZXh0IiwiY2hlY2tBbnN3ZXIiLCJhc3NlcnQiLCJlcXVhbHMiLCJ0cnlBZ2FpbiIsImRpc3BsYXlDb3JyZWN0QW5zd2VyIiwiRElTUExBWUlOR19DT1JSRUNUX0FOU1dFUiIsInJlZ2lzdGVyIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsInRvU3RhdGVPYmplY3QiLCJiYWFHYW1lQ2hhbGxlbmdlIiwiTnVtYmVyQXRvbUlPIiwibW9kZWxQaGV0aW9JRCIsInBoZXRpb0lEIiwibmFtZSIsImZyb21TdGF0ZU9iamVjdCIsInN0YXRlT2JqZWN0IiwicGhldGlvRW5naW5lIiwicGhldCIsInBoZXRpbyIsImluc3RhbmNlIiwiaGFzUGhldGlvT2JqZWN0IiwiZ2V0UGhldGlvT2JqZWN0Iiwic2hyZWQiLCJwcm90b25Db3VudCIsIm5ldXRyb25Db3VudCIsImVsZWN0cm9uQ291bnQiLCJUYW5kZW0iLCJDaGFsbGVuZ2VTZXRGYWN0b3J5IiwiY3JlYXRlQ2hhbGxlbmdlIl0sInNvdXJjZXMiOlsiQkFBR2FtZUNoYWxsZW5nZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYXNlIGNsYXNzIChvciBiYXNlIHR5cGUpIGZvciB0aGUgY2hhbGxlbmdlcyB1c2VkIGluIHRoZSBCdWlsZCBhbiBBdG9tIGdhbWUuXHJcbiAqIFRoZSBnZW5lcmFsIGFwcHJvYWNoIGlzIHRoYXQgYW4gYXRvbSBpcyBwcmVzZW50ZWQgaW4gc29tZSB3YXkgdG8gdGhlIHVzZXIsXHJcbiAqIGFuZCB0aGUgdXNlciBtdXN0IHN1Ym1pdCBhIGNvcnJlY3QgZ3Vlc3MgYWJvdXQgdGhlIGF0b20ncyBjb25maWd1cmF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgTnVtYmVyQXRvbSBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy9tb2RlbC9OdW1iZXJBdG9tLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IGJ1aWxkQW5BdG9tIGZyb20gJy4uLy4uL2J1aWxkQW5BdG9tLmpzJztcclxuaW1wb3J0IEJBQVNoYXJlZENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQkFBU2hhcmVkQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEJBQUNoYWxsZW5nZVN0YXRlIGZyb20gJy4vQkFBQ2hhbGxlbmdlU3RhdGUuanMnO1xyXG5pbXBvcnQgQkFBR2FtZVN0YXRlIGZyb20gJy4vQkFBR2FtZVN0YXRlLmpzJztcclxuXHJcbmNsYXNzIEJBQUdhbWVDaGFsbGVuZ2UgZXh0ZW5kcyBCQUFHYW1lU3RhdGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0dhbWVNb2RlbH0gYnVpbGRBbkF0b21HYW1lTW9kZWxcclxuICAgKiBAcGFyYW0ge051bWJlckF0b219IGFuc3dlckF0b21cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhbGxlbmdlVHlwZVxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggYnVpbGRBbkF0b21HYW1lTW9kZWwsIGFuc3dlckF0b20sIGNoYWxsZW5nZVR5cGUsIHRhbmRlbSApIHtcclxuXHJcbiAgICAvLyBUT0RPOiBDb25zaWRlciBlaXRoZXIgaGF2aW5nIGFsbCB0aGUgc3ViY2xhc3NlcyBkZWZpbmUgYSBuYW1lLCBvciBqdXN0IGdldHRpbmcgcmlkIG9mIHRoZSBuYW1lIGFsdG9nZXRoZXIuXHJcbiAgICBzdXBlciggJ2NoYWxsZW5nZScsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZSxcclxuICAgICAgcGhldGlvVHlwZTogQkFBR2FtZUNoYWxsZW5nZS5CQUFHYW1lQ2hhbGxlbmdlSU9cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBUT0RPIHdoeSBub3QgYW4gRW51bT9cclxuICAgIHRoaXMuY2hhbGxlbmdlU3RhdGVQcm9wZXJ0eSA9IG5ldyBTdHJpbmdQcm9wZXJ0eSggQkFBQ2hhbGxlbmdlU3RhdGUuUFJFU0VOVElOR19DSEFMTEVOR0UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2hhbGxlbmdlU3RhdGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZSxcclxuICAgICAgdmFsaWRWYWx1ZXM6IF8udmFsdWVzKCBCQUFDaGFsbGVuZ2VTdGF0ZSApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLm51bVN1Ym1pc3Npb25zUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbnVtU3VibWlzc2lvbnNQcm9wZXJ0eScgKSxcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgQkFBU2hhcmVkQ29uc3RhbnRzLk1BWF9DSEFMTEVOR0VfQVRURU1QVFMgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hbnN3ZXJBdG9tID0gYW5zd2VyQXRvbTsgLy8gQHB1YmxpYyAocGhldC1pbylcclxuICAgIHRoaXMucG9pbnRWYWx1ZSA9IDA7IC8vIEBwdWJsaWMgKHBoZXQtaW8pXHJcbiAgICB0aGlzLm1vZGVsID0gYnVpbGRBbkF0b21HYW1lTW9kZWw7IC8vIEBwdWJsaWMgKHBoZXQtaW8pXHJcbiAgICB0aGlzLmNoYWxsZW5nZVR5cGUgPSBjaGFsbGVuZ2VUeXBlOyAvLyBAcHVibGljIChwaGV0LWlvKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpYyAtIHJlbGVhc2UgcmVzb3VyY2VzIHdoZW4gbm8gbG9uZ2VyIHVzZWRcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VTdGF0ZVByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMubnVtU3VibWlzc2lvbnNQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcblxyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpYyAtIHByZXNlbmNlIG9mIHRoaXMgbWV0aG9kIHdpbGwgdHJpZ2dlciBkaXNwb3NhbCB3aGVuIGdhbWUgc3RhdGUgY2hhbmdlc1xyXG4gICAqL1xyXG4gIGRpc3Bvc2VTdGF0ZSgpIHtcclxuICAgIHRoaXMuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGhhbmRsZUV2YWx1YXRlZEFuc3dlciggc3VibWl0dGVkQXRvbSwgaXNDb3JyZWN0LCBlbWl0TWVzc2FnZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgdGhpcy5udW1TdWJtaXNzaW9uc1Byb3BlcnR5LnNldCggdGhpcy5udW1TdWJtaXNzaW9uc1Byb3BlcnR5LmdldCgpICsgMSApO1xyXG4gICAgY29uc3QgcG9pbnRzSWZDb3JyZWN0ID0gdGhpcy5udW1TdWJtaXNzaW9uc1Byb3BlcnR5LmdldCgpID09PSAxID8gMiA6IDE7XHJcbiAgICB0aGlzLnBvaW50VmFsdWUgPSBpc0NvcnJlY3QgPyBwb2ludHNJZkNvcnJlY3QgOiAwO1xyXG4gICAgdGhpcy5tb2RlbC5zY29yZVByb3BlcnR5LnNldCggdGhpcy5tb2RlbC5zY29yZVByb3BlcnR5LmdldCgpICsgdGhpcy5wb2ludFZhbHVlICk7XHJcbiAgICB0aGlzLm1vZGVsLmVtaXRDaGVja0Fuc3dlciggaXNDb3JyZWN0LCB0aGlzLnBvaW50VmFsdWUsIHRoaXMuYW5zd2VyQXRvbSwgc3VibWl0dGVkQXRvbSwgZW1pdE1lc3NhZ2VPcHRpb25zICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLm1vZGVsLnByb3ZpZGVGZWVkYmFja1Byb3BlcnR5LmdldCgpICkge1xyXG4gICAgICBpZiAoIGlzQ29ycmVjdCApIHtcclxuXHJcbiAgICAgICAgLy8gTW92ZSB0byB0aGUgbmV4dCBzdGF0ZS5cclxuICAgICAgICB0aGlzLmNoYWxsZW5nZVN0YXRlUHJvcGVydHkuc2V0KCBCQUFDaGFsbGVuZ2VTdGF0ZS5DSEFMTEVOR0VfU09MVkVEX0NPUlJFQ1RMWSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBIYW5kbGUgaW5jb3JyZWN0IGFuc3dlci5cclxuICAgICAgICBpZiAoIHRoaXMubnVtU3VibWlzc2lvbnNQcm9wZXJ0eS5nZXQoKSA8IEJBQVNoYXJlZENvbnN0YW50cy5NQVhfQ0hBTExFTkdFX0FUVEVNUFRTICkge1xyXG5cclxuICAgICAgICAgIC8vIEdpdmUgdGhlIHVzZXIgYW5vdGhlciBjaGFuY2UuXHJcbiAgICAgICAgICB0aGlzLmNoYWxsZW5nZVN0YXRlUHJvcGVydHkuc2V0KCBCQUFDaGFsbGVuZ2VTdGF0ZS5QUkVTRU5USU5HX1RSWV9BR0FJTiApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBVc2VyIGhhcyBleGhhdXN0ZWQgdGhlaXIgYXR0ZW1wdHMuXHJcbiAgICAgICAgICB0aGlzLmNoYWxsZW5nZVN0YXRlUHJvcGVydHkuc2V0KCBCQUFDaGFsbGVuZ2VTdGF0ZS5BVFRFTVBUU19FWEhBVVNURUQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gZG9uJ3QgcHJvdmlkZSBhbnkgZmVlZGJhY2sgLSBqdXN0IGdvIHRvIHRoZSBuZXh0IGNoYWxsZW5nZVxyXG4gICAgICB0aGlzLm5leHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjaGVja0Fuc3dlciggc3VibWl0dGVkQXRvbSApIHtcclxuXHJcbiAgICAvLyBWZXJpZnkgdGhhdCB0aGUgY3VycmVudCBzdGF0ZSBpcyBhcyBleHBlY3RlZC5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlU3RhdGVQcm9wZXJ0eS5nZXQoKSA9PT0gQkFBQ2hhbGxlbmdlU3RhdGUuUFJFU0VOVElOR19DSEFMTEVOR0UsXHJcbiAgICAgIGBVbmV4cGVjdGVkIGNoYWxsZW5nZSBzdGF0ZTogJHt0aGlzLmNoYWxsZW5nZVN0YXRlUHJvcGVydHkuZ2V0KCl9YFxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBpc0NvcnJlY3QgPSB0aGlzLmFuc3dlckF0b20uZXF1YWxzKCBzdWJtaXR0ZWRBdG9tICk7XHJcbiAgICB0aGlzLmhhbmRsZUV2YWx1YXRlZEFuc3dlciggc3VibWl0dGVkQXRvbSwgaXNDb3JyZWN0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdHJ5QWdhaW4oKSB7XHJcbiAgICB0aGlzLmNoYWxsZW5nZVN0YXRlUHJvcGVydHkuc2V0KCBCQUFDaGFsbGVuZ2VTdGF0ZS5QUkVTRU5USU5HX0NIQUxMRU5HRSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIG5leHQoKSB7XHJcbiAgICAvLyBUaGlzIGV2ZW50IGlzIGJhc2ljYWxseSBoYW5kbGVkIGJ5IHRoZSBtb2RlbCwgd2hpY2ggd2lsbCByZW1vdmUgdGhpcyBjaGFsbGVuZ2UgYW5kIGRvIHdoYXRldmVyIHNob3VsZCBoYXBwZW5cclxuICAgIC8vIG5leHQuXHJcbiAgICB0aGlzLm1vZGVsLm5leHQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwbGF5Q29ycmVjdEFuc3dlcigpIHtcclxuICAgIHRoaXMuY2hhbGxlbmdlU3RhdGVQcm9wZXJ0eS5zZXQoIEJBQUNoYWxsZW5nZVN0YXRlLkRJU1BMQVlJTkdfQ09SUkVDVF9BTlNXRVIgKTtcclxuICB9XHJcbn1cclxuXHJcbmJ1aWxkQW5BdG9tLnJlZ2lzdGVyKCAnQkFBR2FtZUNoYWxsZW5nZScsIEJBQUdhbWVDaGFsbGVuZ2UgKTtcclxuXHJcbkJBQUdhbWVDaGFsbGVuZ2UuQkFBR2FtZUNoYWxsZW5nZUlPID0gbmV3IElPVHlwZSggJ0JBQUdhbWVDaGFsbGVuZ2VJTycsIHtcclxuICB2YWx1ZVR5cGU6IEJBQUdhbWVDaGFsbGVuZ2UsXHJcbiAgZG9jdW1lbnRhdGlvbjogJ0EgY2hhbGxlbmdlIGZvciB0aGUgR2FtZScsXHJcbiAgdG9TdGF0ZU9iamVjdDogYmFhR2FtZUNoYWxsZW5nZSA9PiAoIHtcclxuICAgIHBvaW50VmFsdWU6IGJhYUdhbWVDaGFsbGVuZ2UucG9pbnRWYWx1ZSxcclxuICAgIGFuc3dlckF0b206IE51bWJlckF0b20uTnVtYmVyQXRvbUlPLnRvU3RhdGVPYmplY3QoIGJhYUdhbWVDaGFsbGVuZ2UuYW5zd2VyQXRvbSApLFxyXG4gICAgbW9kZWxQaGV0aW9JRDogYmFhR2FtZUNoYWxsZW5nZS5tb2RlbC50YW5kZW0ucGhldGlvSUQsXHJcbiAgICBjaGFsbGVuZ2VUeXBlOiBiYWFHYW1lQ2hhbGxlbmdlLmNoYWxsZW5nZVR5cGUsXHJcbiAgICBwaGV0aW9JRDogYmFhR2FtZUNoYWxsZW5nZS50YW5kZW0ucGhldGlvSUQsXHJcbiAgICBuYW1lOiBiYWFHYW1lQ2hhbGxlbmdlLm5hbWVcclxuICB9ICksXHJcbiAgZnJvbVN0YXRlT2JqZWN0OiBzdGF0ZU9iamVjdCA9PiB7XHJcbiAgICBjb25zdCBwaGV0aW9FbmdpbmUgPSBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmU7XHJcblxyXG4gICAgLy8gVGhpcyBtYXkgaGF2ZSBiZWVuIGRlc2VyaWFsaXplZCBmcm9tIHRoZSBpbnN0YW5jZSBpdHNlbGYgb3IgZnJvbSB0aGUgYXJyYXkgaXQgd2FzIGNvbnRhaW5lZCBpbiAod2hpY2hcclxuICAgIC8vIGlzIGluc3RydW1lbnRlZCBhcyBBcnJheUlPKSwgc28gY2hlY2sgdG8gc2VlIGlmIGl0IGlzIGFscmVhZHkgZGVzZXJpYWxpemVkIGJlZm9yZSBkZXNlcmlhbGl6aW5nLlxyXG4gICAgLy8gVE9ETzogaXMgdGhlcmUgYSBiZXR0ZXIgd2F5IHRvIGRvIHRoaXMsIG9yIGF0IGxlYXN0IGZhY3RvciBpdCBvdXQ/XHJcbiAgICBjb25zdCBpbnN0YW5jZSA9IHBoZXRpb0VuZ2luZS5oYXNQaGV0aW9PYmplY3QoIHN0YXRlT2JqZWN0LnBoZXRpb0lEICk7XHJcbiAgICBpZiAoIGluc3RhbmNlICkge1xyXG4gICAgICByZXR1cm4gcGhldGlvRW5naW5lLmdldFBoZXRpb09iamVjdCggc3RhdGVPYmplY3QucGhldGlvSUQgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtb2RlbCA9IHBoZXRpb0VuZ2luZS5nZXRQaGV0aW9PYmplY3QoIHN0YXRlT2JqZWN0Lm1vZGVsUGhldGlvSUQgKTtcclxuXHJcbiAgICBjb25zdCBhbnN3ZXJBdG9tID0gbmV3IHBoZXQuc2hyZWQuTnVtYmVyQXRvbSgge1xyXG4gICAgICBwcm90b25Db3VudDogc3RhdGVPYmplY3QuYW5zd2VyQXRvbS5wcm90b25Db3VudCxcclxuICAgICAgbmV1dHJvbkNvdW50OiBzdGF0ZU9iamVjdC5hbnN3ZXJBdG9tLm5ldXRyb25Db3VudCxcclxuICAgICAgZWxlY3Ryb25Db3VudDogc3RhdGVPYmplY3QuYW5zd2VyQXRvbS5lbGVjdHJvbkNvdW50XHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCB0YW5kZW0gPSBuZXcgcGhldC50YW5kZW0uVGFuZGVtKCBzdGF0ZU9iamVjdC5waGV0aW9JRCApO1xyXG5cclxuICAgIHJldHVybiBwaGV0LmJ1aWxkQW5BdG9tLkNoYWxsZW5nZVNldEZhY3RvcnkuY3JlYXRlQ2hhbGxlbmdlKCBtb2RlbCwgc3RhdGVPYmplY3QuY2hhbGxlbmdlVHlwZSwgYW5zd2VyQXRvbSwgdGFuZGVtICk7XHJcbiAgfVxyXG59ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCQUFHYW1lQ2hhbGxlbmdlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsVUFBVSxNQUFNLDBDQUEwQztBQUNqRSxPQUFPQyxNQUFNLE1BQU0sdUNBQXVDO0FBQzFELE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0Msa0JBQWtCLE1BQU0sb0NBQW9DO0FBQ25FLE9BQU9DLGlCQUFpQixNQUFNLHdCQUF3QjtBQUN0RCxPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBRTVDLE1BQU1DLGdCQUFnQixTQUFTRCxZQUFZLENBQUM7RUFFMUM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLFdBQVdBLENBQUVDLG9CQUFvQixFQUFFQyxVQUFVLEVBQUVDLGFBQWEsRUFBRUMsTUFBTSxFQUFHO0lBRXJFO0lBQ0EsS0FBSyxDQUFFLFdBQVcsRUFBRTtNQUNsQkEsTUFBTSxFQUFFQSxNQUFNO01BQ2RDLFdBQVcsRUFBRSxLQUFLO01BQ2xCQyxVQUFVLEVBQUVQLGdCQUFnQixDQUFDUTtJQUMvQixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNDLHNCQUFzQixHQUFHLElBQUlqQixjQUFjLENBQUVNLGlCQUFpQixDQUFDWSxvQkFBb0IsRUFBRTtNQUN4RkwsTUFBTSxFQUFFQSxNQUFNLENBQUNNLFlBQVksQ0FBRSx3QkFBeUIsQ0FBQztNQUN2REMsY0FBYyxFQUFFLElBQUk7TUFDcEJOLFdBQVcsRUFBRSxLQUFLO01BQ2xCTyxXQUFXLEVBQUVDLENB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