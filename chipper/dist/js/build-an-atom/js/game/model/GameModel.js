// Copyright 2013-2022, University of Colorado Boulder

/**
 * Primary model class for the Build an Atom Game tab.
 *
 * @author John Blanco
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import NumberAtom from '../../../../shred/js/model/NumberAtom.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ObjectLiteralIO from '../../../../tandem/js/types/ObjectLiteralIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import VoidIO from '../../../../tandem/js/types/VoidIO.js';
import buildAnAtom from '../../buildAnAtom.js';
import BAAQueryParameters from '../../common/BAAQueryParameters.js';
import BAAGameChallenge from './BAAGameChallenge.js';
import BAAGameState from './BAAGameState.js';
import ChallengeSetFactory from './ChallengeSetFactory.js';

// constants
const CHALLENGES_PER_LEVEL = BAAQueryParameters.challengesPerLevel;
const POSSIBLE_POINTS_PER_CHALLENGE = 2;
const MAX_POINTS_PER_GAME_LEVEL = CHALLENGES_PER_LEVEL * POSSIBLE_POINTS_PER_CHALLENGE;
class GameModel extends PhetioObject {
  /**
   * {Tandem} tandem
   */
  constructor(tandem) {
    super({
      phetioType: GameModel.GameModelIO,
      tandem: tandem,
      phetioState: false
    });

    // @private (phet-io), phet-io can set this value to customize which levels are presented
    this.allowedChallengeTypesByLevel = [['schematic-to-element', 'counts-to-element'], ['counts-to-charge', 'counts-to-mass', 'schematic-to-charge', 'schematic-to-mass'], ['schematic-to-symbol-charge', 'schematic-to-symbol-mass-number', 'schematic-to-symbol-proton-count', 'counts-to-symbol-charge', 'counts-to-symbol-mass'], ['schematic-to-symbol-all', 'symbol-to-schematic', 'symbol-to-counts', 'counts-to-symbol-all']];

    // @public {Property.<BAAGameState>} - current state, each challenge is a unique state
    this.stateProperty = new Property(BAAGameState.CHOOSING_LEVEL, {
      phetioValueType: BAAGameState.BAAGameStateIO,
      tandem: tandem.createTandem('stateProperty')
    });

    // @public {Property.<boolean>}
    this.timerEnabledProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('timerEnabledProperty')
    });

    // @public (read-only) {Property.<number>}
    this.levelProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('levelProperty'),
      numberType: 'Integer',
      phetioReadOnly: true
    });

    // @public (read-only) {Property.<Array.<BAAGameChallenge>>}
    this.challengeSetProperty = new Property([], {
      tandem: tandem.createTandem('challengeSetProperty'),
      phetioValueType: ArrayIO(BAAGameChallenge.BAAGameChallengeIO)
    });

    // @public (read-only) {Property.<number>}
    this.challengeIndexProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('challengeIndexProperty')
    });

    // @public (read-only) {NumberProperty}
    this.scoreProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('scoreProperty')
    }); // Score on current game level.

    // @public (read-only) {Property.<number>}
    this.elapsedTimeProperty = new Property(0);

    // @public (phet-io) {Property.<boolean>} - enables a mode where no feedback is provided during the game
    this.provideFeedbackProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('provideFeedbackProperty')
    });

    // @private, set of external functions that the model will step
    this.stepListeners = [];

    // @private
    this.levelCompletedEmitter = new Emitter({
      tandem: tandem.createTandem('levelCompletedEmitter'),
      parameters: [{
        name: 'results',
        phetioType: ObjectLiteralIO
      }]
    });
    this.bestScores = []; // Properties that track progress on each game level.
    this.scores = []; // Properties that track score at each game level
    this.bestTimeVisible = []; // Properties that track whether to show best time at each game level
    this.bestTimes = []; // Best times at each level.
    _.times(ShredConstants.LEVEL_NAMES.length, () => {
      this.bestScores.push(new Property(0));
      this.scores.push(new Property(0));
      this.bestTimes.push(new Property(null));
      this.bestTimeVisible.push(new Property(false));
    });
    this.timerEnabledProperty.lazyLink(timerEnabled => {
      for (let i = 0; i < ShredConstants.LEVEL_NAMES.length; i++) {
        this.bestTimeVisible[i].value = timerEnabled && this.scores[i].value === MAX_POINTS_PER_GAME_LEVEL;
      }
    });

    // Flag set to indicate new best time, cleared each time a level is started.
    this.newBestTime = false;
    this.checkAnswerEmitter = new Emitter({
      tandem: tandem.createTandem('checkAnswerEmitter'),
      parameters: [{
        name: 'result',
        phetioType: ObjectLiteralIO
      }]
    });

    // @private
    this.challengeSetGroupTandem = Tandem.OPT_OUT;

    // @private {GroupTandem}
    this.numberAtomGroupTandem = Tandem.OPT_OUT;

    // @private (phet-io) {Array.<Array.<BAAGameChallenge>} - when set by the PhET-iO API, these challenges will be
    // used instead of randomly generated
    this.predeterminedChallenges = [];
    // @private (phet-io) {Array.<Array.<BAAGameChallenge>} - when set by the PhET-iO API, these challenges will
    // be used instead of randomly generated
    this.predeterminedChallenges = [];
  }

  // @public - time stepping function, called by the framework
  step(dt) {
    // Increment the game timer if running.  Note that this assumes that dt is not clamped, because we want it to
    // essentially continue running if the user switches tabs or hides the browser.
    if (this.timerEnabledProperty.get() && this.stateProperty.get() !== BAAGameState.CHOOSING_LEVEL && this.stateProperty.get() !== BAAGameState.LEVEL_COMPLETED) {
      this.elapsedTimeProperty.set(this.elapsedTimeProperty.get() + dt);
    }

    // Step the current challenge if it has any time-driven behavior.
    this.stateProperty.get().step(dt);

    // Step any external functions that need it.
    this.stepListeners.forEach(stepListener => {
      stepListener(dt);
    });
  }

  // Start a new game.
  // @private (StartGameLevelNode.js, phet-io)
  startGameLevel(levelName) {
    this.levelProperty.set(ShredConstants.MAP_LEVEL_NAME_TO_NUMBER(levelName));
    this.challengeIndexProperty.set(0);

    // TODO: Commented out due to problems related to phet-io, see https://github.com/phetsims/build-an-atom/issues/185
    // assert && assert( this.challengeSetProperty.get().length === 0, 'challenges should be cleared before starting a new game' );

    // Use the predetermined challenges (if specified by phet-io) or generate a random challenge for the given level
    const challengeSet = this.predeterminedChallenges[this.levelProperty.get()] || ChallengeSetFactory.generate(this.levelProperty.get(), CHALLENGES_PER_LEVEL, this, this.allowedChallengeTypesByLevel, Tandem.OPT_OUT);
    this.challengeSetProperty.set(challengeSet);
    this.scoreProperty.set(0);
    this.newBestTime = false;
    this.bestTimeVisible[this.levelProperty.get()].value = false;
    this.elapsedTimeProperty.reset();
    if (this.challengeSetProperty.get().length > 0) {
      this.stateProperty.set(this.challengeSetProperty.get()[0]);
    } else {
      this.stateProperty.set(BAAGameState.LEVEL_COMPLETED);
    }
  }

  // @public - go to the level selection dialog and allow the user to start a new game
  newGame() {
    this.stateProperty.set(BAAGameState.CHOOSING_LEVEL);
    this.scoreProperty.set(0);

    // (phet-io) Dispose old challenges before setting the property again.
    this.challengeSetProperty.get().forEach(challenge => {
      !challenge.isDisposed && challenge.dispose();
    });
    this.challengeSetProperty.get().length = 0;
  }

  // @public - advance to the next challenge or to the 'game over' screen if all challenges finished
  next() {
    const level = this.levelProperty.get();
    if (this.challengeSetProperty.get().length > this.challengeIndexProperty.get() + 1) {
      // Next challenge.
      this.challengeIndexProperty.set(this.challengeIndexProperty.get() + 1);
      this.stateProperty.set(this.challengeSetProperty.get()[this.challengeIndexProperty.get()]);
    } else {
      // Game level completed - update score and state.
      if (this.scoreProperty.get() > this.bestScores[level].value) {
        this.bestScores[level].value = this.scoreProperty.get();
      }
      if (this.timerEnabledProperty.get() && this.scoreProperty.get() === MAX_POINTS_PER_GAME_LEVEL && (this.bestTimes[level].value === null || this.elapsedTimeProperty.get() < this.bestTimes[level].value)) {
        this.newBestTime = this.bestTimes[level].value !== null; // Don't set this flag for the first 'best time', only when the time improves.
        this.bestTimes[level].value = this.elapsedTimeProperty.get();
      }
      if (this.scoreProperty.get() === MAX_POINTS_PER_GAME_LEVEL && this.timerEnabledProperty.get()) {
        this.bestTimeVisible[level].value = true;
      }
      this.scores[level].value = this.scoreProperty.get();

      // When the game is complete, send notification that can be used by phet-io
      this.levelCompletedEmitter.emit({
        level: level,
        maxPoints: MAX_POINTS_PER_GAME_LEVEL,
        challenges: CHALLENGES_PER_LEVEL,
        timerEnabled: this.timerEnabledProperty.get(),
        elapsedTime: this.elapsedTimeProperty.get(),
        bestTimes: this.bestTimes[level],
        newBestTime: this.newBestTime
      });
      this.stateProperty.set(BAAGameState.LEVEL_COMPLETED);
    }
  }

  // @public
  reset() {
    this.stateProperty.reset();
    this.timerEnabledProperty.reset();
    this.levelProperty.reset();
    this.challengeSetProperty.reset();
    this.challengeIndexProperty.reset();
    this.scoreProperty.reset();
    this.elapsedTimeProperty.reset();
    this.bestScores.forEach(bestScoreProperty => {
      bestScoreProperty.reset();
    });
    this.scores.forEach(scoreProperty => {
      scoreProperty.reset();
    });
    this.bestTimes.forEach(bestTimeProperty => {
      bestTimeProperty.reset();
    });
    this.bestTimeVisible.push(bestTimeVisibleProperty => {
      bestTimeVisibleProperty.reset();
    });
  }

  // @public
  addStepListener(stepListener) {
    this.stepListeners.push(stepListener);
  }

  // @public
  removeStepListener(stepListener) {
    this.stepListeners = _.without(this.stepListeners, stepListener);
  }

  // Set the allowed challenge types to customize for phet-io
  // @private (phet-io)
  setAllowedChallengeTypesByLevel(allowedChallengeTypesByLevel) {
    this.allowedChallengeTypesByLevel = allowedChallengeTypesByLevel;
  }

  /**
   * Specify exact challenges (and ordering) for each level.
   * @param {Array.<Array.<Object>>} challengeSpecsForLevels
   * @public (phet-io)
   */
  setChallenges(challengeSpecsForLevels) {
    this.predeterminedChallenges = challengeSpecsForLevels.map(levelSpec => levelSpec.map(challengeSpec => ChallengeSetFactory.createChallenge(this, challengeSpec.challengeType, new NumberAtom({
      protonCount: challengeSpec.numberAtom.protonCount,
      neutronCount: challengeSpec.numberAtom.neutronCount,
      electronCount: challengeSpec.numberAtom.electronCount,
      tandem: Tandem.OPT_OUT
    }), Tandem.OPT_OUT)));
  }

  // @public
  emitCheckAnswer(isCorrect, points, answerAtom, submittedAtom, extension) {
    const arg = {
      isCorrect: isCorrect,
      correctProtonCount: answerAtom.protonCountProperty.get(),
      correctNeutronCount: answerAtom.neutronCountProperty.get(),
      correctElectronCount: answerAtom.electronCountProperty.get(),
      submittedProtonCount: submittedAtom.protonCountProperty.get(),
      submittedNeutronCount: submittedAtom.neutronCountProperty.get(),
      submittedElectronCount: submittedAtom.electronCountProperty.get(),
      points: points
    };
    this.checkAnswerEmitter.emit(merge(arg, extension));
  }
}

// statics
GameModel.MAX_POINTS_PER_GAME_LEVEL = MAX_POINTS_PER_GAME_LEVEL;
GameModel.CHALLENGES_PER_LEVEL = CHALLENGES_PER_LEVEL;
buildAnAtom.register('GameModel', GameModel);
GameModel.GameModelIO = new IOType('GameModelIO', {
  valueType: GameModel,
  documentation: 'The model for the Game',
  methods: {
    startGameLevel: {
      returnType: VoidIO,
      parameterTypes: [StringIO],
      implementation: function (levelType) {
        this.startGameLevel(levelType);
      },
      documentation: 'Start one of the following games: periodic-table-game, mass-and-charge-game, symbol-game, advanced-symbol-game',
      invocableForReadOnlyElements: false
    },
    setChallenges: {
      returnType: VoidIO,
      parameterTypes: [ArrayIO(ArrayIO(ObjectLiteralIO))],
      implementation: function (challenges) {
        this.setChallenges(challenges);
      },
      documentation: 'Specify exact challenges',
      invocableForReadOnlyElements: false
    },
    setAllowedChallengeTypesByLevel: {
      returnType: VoidIO,
      parameterTypes: [ArrayIO(ArrayIO(StringIO))],
      // TODO: change this to take index as 1st argument (for level index)
      implementation: function (allowedChallengeTypesByLevel) {
        this.setAllowedChallengeTypesByLevel(allowedChallengeTypesByLevel);
      },
      documentation: 'Specify which challenge types may be presented to the user for each level.',
      invocableForReadOnlyElements: false
      // The default value is [
      //    [ 'schematic-to-element', 'counts-to-element' ],
      //    [ 'counts-to-charge', 'counts-to-mass', 'schematic-to-charge', 'schematic-to-mass' ],
      //    [ 'schematic-to-symbol-charge', 'schematic-to-symbol-mass-number', 'schematic-to-symbol-proton-count', 'counts-to-symbol-charge', 'counts-to-symbol-mass' ],
      //    [ 'schematic-to-symbol-all', 'symbol-to-schematic', 'symbol-to-counts', 'counts-to-symbol-all' ]
      //  ]
    }
  }
});

export default GameModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIm1lcmdlIiwiTnVtYmVyQXRvbSIsIlNocmVkQ29uc3RhbnRzIiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwiQXJyYXlJTyIsIklPVHlwZSIsIk9iamVjdExpdGVyYWxJTyIsIlN0cmluZ0lPIiwiVm9pZElPIiwiYnVpbGRBbkF0b20iLCJCQUFRdWVyeVBhcmFtZXRlcnMiLCJCQUFHYW1lQ2hhbGxlbmdlIiwiQkFBR2FtZVN0YXRlIiwiQ2hhbGxlbmdlU2V0RmFjdG9yeSIsIkNIQUxMRU5HRVNfUEVSX0xFVkVMIiwiY2hhbGxlbmdlc1BlckxldmVsIiwiUE9TU0lCTEVfUE9JTlRTX1BFUl9DSEFMTEVOR0UiLCJNQVhfUE9JTlRTX1BFUl9HQU1FX0xFVkVMIiwiR2FtZU1vZGVsIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJwaGV0aW9UeXBlIiwiR2FtZU1vZGVsSU8iLCJwaGV0aW9TdGF0ZSIsImFsbG93ZWRDaGFsbGVuZ2VUeXBlc0J5TGV2ZWwiLCJzdGF0ZVByb3BlcnR5IiwiQ0hPT1NJTkdfTEVWRUwiLCJwaGV0aW9WYWx1ZVR5cGUiLCJCQUFHYW1lU3RhdGVJTyIsImNyZWF0ZVRhbmRlbSIsInRpbWVyRW5hYmxlZFByb3BlcnR5IiwibGV2ZWxQcm9wZXJ0eSIsIm51bWJlclR5cGUiLCJwaGV0aW9SZWFkT25seSIsImNoYWxsZW5nZVNldFByb3BlcnR5IiwiQkFBR2FtZUNoYWxsZW5nZUlPIiwiY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eSIsInNjb3JlUHJvcGVydHkiLCJlbGFwc2VkVGltZVByb3BlcnR5IiwicHJvdmlkZUZlZWRiYWNrUHJvcGVydHkiLCJzdGVwTGlzdGVuZXJzIiwibGV2ZWxDb21wbGV0ZWRFbWl0dGVyIiwicGFyYW1ldGVycyIsIm5hbWUiLCJiZXN0U2NvcmVzIiwic2NvcmVzIiwiYmVzdFRpbWVWaXNpYmxlIiwiYmVzdFRpbWVzIiwiXyIsInRpbWVzIiwiTEVWRUxfTkFNRVMiLCJsZW5ndGgiLCJwdXNoIiwibGF6eUxpbmsiLCJ0aW1lckVuYWJsZWQiLCJpIiwidmFsdWUiLCJuZXdCZXN0VGltZSIsImNoZWNrQW5zd2VyRW1pdHRlciIsImNoYWxsZW5nZVNldEdyb3VwVGFuZGVtIiwiT1BUX09VVCIsIm51bWJlckF0b21Hcm91cFRhbmRlbSIsInByZWRldGVybWluZWRDaGFsbGVuZ2VzIiwic3RlcCIsImR0IiwiZ2V0IiwiTEVWRUxfQ09NUExFVEVEIiwic2V0IiwiZm9yRWFjaCIsInN0ZXBMaXN0ZW5lciIsInN0YXJ0R2FtZUxldmVsIiwibGV2ZWxOYW1lIiwiTUFQX0xFVkVMX05BTUVfVE9fTlVNQkVSIiwiY2hhbGxlbmdlU2V0IiwiZ2VuZXJhdGUiLCJyZXNldCIsIm5ld0dhbWUiLCJjaGFsbGVuZ2UiLCJpc0Rpc3Bvc2VkIiwiZGlzcG9zZSIsIm5leHQiLCJsZXZlbCIsImVtaXQiLCJtYXhQb2ludHMiLCJjaGFsbGVuZ2VzIiwiZWxhcHNlZFRpbWUiLCJiZXN0U2NvcmVQcm9wZXJ0eSIsImJlc3RUaW1lUHJvcGVydHkiLCJiZXN0VGltZVZpc2libGVQcm9wZXJ0eSIsImFkZFN0ZXBMaXN0ZW5lciIsInJlbW92ZVN0ZXBMaXN0ZW5lciIsIndpdGhvdXQiLCJzZXRBbGxvd2VkQ2hhbGxlbmdlVHlwZXNCeUxldmVsIiwic2V0Q2hhbGxlbmdlcyIsImNoYWxsZW5nZVNwZWNzRm9yTGV2ZWxzIiwibWFwIiwibGV2ZWxTcGVjIiwiY2hhbGxlbmdlU3BlYyIsImNyZWF0ZUNoYWxsZW5nZSIsImNoYWxsZW5nZVR5cGUiLCJwcm90b25Db3VudCIsIm51bWJlckF0b20iLCJuZXV0cm9uQ291bnQiLCJlbGVjdHJvbkNvdW50IiwiZW1pdENoZWNrQW5zd2VyIiwiaXNDb3JyZWN0IiwicG9pbnRzIiwiYW5zd2VyQXRvbSIsInN1Ym1pdHRlZEF0b20iLCJleHRlbnNpb24iLCJhcmciLCJjb3JyZWN0UHJvdG9uQ291bnQiLCJwcm90b25Db3VudFByb3BlcnR5IiwiY29ycmVjdE5ldXRyb25Db3VudCIsIm5ldXRyb25Db3VudFByb3BlcnR5IiwiY29ycmVjdEVsZWN0cm9uQ291bnQiLCJlbGVjdHJvbkNvdW50UHJvcGVydHkiLCJzdWJtaXR0ZWRQcm90b25Db3VudCIsInN1Ym1pdHRlZE5ldXRyb25Db3VudCIsInN1Ym1pdHRlZEVsZWN0cm9uQ291bnQiLCJyZWdpc3RlciIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJtZXRob2RzIiwicmV0dXJuVHlwZSIsInBhcmFtZXRlclR5cGVzIiwiaW1wbGVtZW50YXRpb24iLCJsZXZlbFR5cGUiLCJpbnZvY2FibGVGb3JSZWFkT25seUVsZW1lbnRzIl0sInNvdXJjZXMiOlsiR2FtZU1vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFByaW1hcnkgbW9kZWwgY2xhc3MgZm9yIHRoZSBCdWlsZCBhbiBBdG9tIEdhbWUgdGFiLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IE51bWJlckF0b20gZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvbW9kZWwvTnVtYmVyQXRvbS5qcyc7XHJcbmltcG9ydCBTaHJlZENvbnN0YW50cyBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy9TaHJlZENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBBcnJheUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9BcnJheUlPLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IE9iamVjdExpdGVyYWxJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvT2JqZWN0TGl0ZXJhbElPLmpzJztcclxuaW1wb3J0IFN0cmluZ0lPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9TdHJpbmdJTy5qcyc7XHJcbmltcG9ydCBWb2lkSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1ZvaWRJTy5qcyc7XHJcbmltcG9ydCBidWlsZEFuQXRvbSBmcm9tICcuLi8uLi9idWlsZEFuQXRvbS5qcyc7XHJcbmltcG9ydCBCQUFRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vLi4vY29tbW9uL0JBQVF1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBCQUFHYW1lQ2hhbGxlbmdlIGZyb20gJy4vQkFBR2FtZUNoYWxsZW5nZS5qcyc7XHJcbmltcG9ydCBCQUFHYW1lU3RhdGUgZnJvbSAnLi9CQUFHYW1lU3RhdGUuanMnO1xyXG5pbXBvcnQgQ2hhbGxlbmdlU2V0RmFjdG9yeSBmcm9tICcuL0NoYWxsZW5nZVNldEZhY3RvcnkuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IENIQUxMRU5HRVNfUEVSX0xFVkVMID0gQkFBUXVlcnlQYXJhbWV0ZXJzLmNoYWxsZW5nZXNQZXJMZXZlbDtcclxuY29uc3QgUE9TU0lCTEVfUE9JTlRTX1BFUl9DSEFMTEVOR0UgPSAyO1xyXG5jb25zdCBNQVhfUE9JTlRTX1BFUl9HQU1FX0xFVkVMID0gQ0hBTExFTkdFU19QRVJfTEVWRUwgKiBQT1NTSUJMRV9QT0lOVFNfUEVSX0NIQUxMRU5HRTtcclxuXHJcbmNsYXNzIEdhbWVNb2RlbCBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0YW5kZW0gKSB7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgcGhldGlvVHlwZTogR2FtZU1vZGVsLkdhbWVNb2RlbElPLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgKHBoZXQtaW8pLCBwaGV0LWlvIGNhbiBzZXQgdGhpcyB2YWx1ZSB0byBjdXN0b21pemUgd2hpY2ggbGV2ZWxzIGFyZSBwcmVzZW50ZWRcclxuICAgIHRoaXMuYWxsb3dlZENoYWxsZW5nZVR5cGVzQnlMZXZlbCA9IFtcclxuICAgICAgWyAnc2NoZW1hdGljLXRvLWVsZW1lbnQnLCAnY291bnRzLXRvLWVsZW1lbnQnIF0sXHJcbiAgICAgIFsgJ2NvdW50cy10by1jaGFyZ2UnLCAnY291bnRzLXRvLW1hc3MnLCAnc2NoZW1hdGljLXRvLWNoYXJnZScsICdzY2hlbWF0aWMtdG8tbWFzcycgXSxcclxuICAgICAgWyAnc2NoZW1hdGljLXRvLXN5bWJvbC1jaGFyZ2UnLCAnc2NoZW1hdGljLXRvLXN5bWJvbC1tYXNzLW51bWJlcicsICdzY2hlbWF0aWMtdG8tc3ltYm9sLXByb3Rvbi1jb3VudCcsICdjb3VudHMtdG8tc3ltYm9sLWNoYXJnZScsICdjb3VudHMtdG8tc3ltYm9sLW1hc3MnIF0sXHJcbiAgICAgIFsgJ3NjaGVtYXRpYy10by1zeW1ib2wtYWxsJywgJ3N5bWJvbC10by1zY2hlbWF0aWMnLCAnc3ltYm9sLXRvLWNvdW50cycsICdjb3VudHMtdG8tc3ltYm9sLWFsbCcgXVxyXG4gICAgXTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48QkFBR2FtZVN0YXRlPn0gLSBjdXJyZW50IHN0YXRlLCBlYWNoIGNoYWxsZW5nZSBpcyBhIHVuaXF1ZSBzdGF0ZVxyXG4gICAgdGhpcy5zdGF0ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBCQUFHYW1lU3RhdGUuQ0hPT1NJTkdfTEVWRUwsIHtcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBCQUFHYW1lU3RhdGUuQkFBR2FtZVN0YXRlSU8sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N0YXRlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59XHJcbiAgICB0aGlzLnRpbWVyRW5hYmxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGltZXJFbmFibGVkUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtQcm9wZXJ0eS48bnVtYmVyPn1cclxuICAgIHRoaXMubGV2ZWxQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsZXZlbFByb3BlcnR5JyApLFxyXG4gICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7UHJvcGVydHkuPEFycmF5LjxCQUFHYW1lQ2hhbGxlbmdlPj59XHJcbiAgICB0aGlzLmNoYWxsZW5nZVNldFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBbXSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjaGFsbGVuZ2VTZXRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBBcnJheUlPKCBCQUFHYW1lQ2hhbGxlbmdlLkJBQUdhbWVDaGFsbGVuZ2VJTyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7UHJvcGVydHkuPG51bWJlcj59XHJcbiAgICB0aGlzLmNoYWxsZW5nZUluZGV4UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge051bWJlclByb3BlcnR5fVxyXG4gICAgdGhpcy5zY29yZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Njb3JlUHJvcGVydHknIClcclxuICAgIH0gKTsgLy8gU2NvcmUgb24gY3VycmVudCBnYW1lIGxldmVsLlxyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1Byb3BlcnR5LjxudW1iZXI+fVxyXG4gICAgdGhpcy5lbGFwc2VkVGltZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocGhldC1pbykge1Byb3BlcnR5Ljxib29sZWFuPn0gLSBlbmFibGVzIGEgbW9kZSB3aGVyZSBubyBmZWVkYmFjayBpcyBwcm92aWRlZCBkdXJpbmcgdGhlIGdhbWVcclxuICAgIHRoaXMucHJvdmlkZUZlZWRiYWNrUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Byb3ZpZGVGZWVkYmFja1Byb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUsIHNldCBvZiBleHRlcm5hbCBmdW5jdGlvbnMgdGhhdCB0aGUgbW9kZWwgd2lsbCBzdGVwXHJcbiAgICB0aGlzLnN0ZXBMaXN0ZW5lcnMgPSBbXTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5sZXZlbENvbXBsZXRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsZXZlbENvbXBsZXRlZEVtaXR0ZXInICksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFsgeyBuYW1lOiAncmVzdWx0cycsIHBoZXRpb1R5cGU6IE9iamVjdExpdGVyYWxJTyB9IF1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmJlc3RTY29yZXMgPSBbXTsgLy8gUHJvcGVydGllcyB0aGF0IHRyYWNrIHByb2dyZXNzIG9uIGVhY2ggZ2FtZSBsZXZlbC5cclxuICAgIHRoaXMuc2NvcmVzID0gW107IC8vIFByb3BlcnRpZXMgdGhhdCB0cmFjayBzY29yZSBhdCBlYWNoIGdhbWUgbGV2ZWxcclxuICAgIHRoaXMuYmVzdFRpbWVWaXNpYmxlID0gW107IC8vIFByb3BlcnRpZXMgdGhhdCB0cmFjayB3aGV0aGVyIHRvIHNob3cgYmVzdCB0aW1lIGF0IGVhY2ggZ2FtZSBsZXZlbFxyXG4gICAgdGhpcy5iZXN0VGltZXMgPSBbXTsgLy8gQmVzdCB0aW1lcyBhdCBlYWNoIGxldmVsLlxyXG4gICAgXy50aW1lcyggU2hyZWRDb25zdGFudHMuTEVWRUxfTkFNRVMubGVuZ3RoLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuYmVzdFNjb3Jlcy5wdXNoKCBuZXcgUHJvcGVydHkoIDAgKSApO1xyXG4gICAgICB0aGlzLnNjb3Jlcy5wdXNoKCBuZXcgUHJvcGVydHkoIDAgKSApO1xyXG4gICAgICB0aGlzLmJlc3RUaW1lcy5wdXNoKCBuZXcgUHJvcGVydHkoIG51bGwgKSApO1xyXG4gICAgICB0aGlzLmJlc3RUaW1lVmlzaWJsZS5wdXNoKCBuZXcgUHJvcGVydHkoIGZhbHNlICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnRpbWVyRW5hYmxlZFByb3BlcnR5LmxhenlMaW5rKCB0aW1lckVuYWJsZWQgPT4ge1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBTaHJlZENvbnN0YW50cy5MRVZFTF9OQU1FUy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICB0aGlzLmJlc3RUaW1lVmlzaWJsZVsgaSBdLnZhbHVlID0gdGltZXJFbmFibGVkICYmIHRoaXMuc2NvcmVzWyBpIF0udmFsdWUgPT09IE1BWF9QT0lOVFNfUEVSX0dBTUVfTEVWRUw7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBGbGFnIHNldCB0byBpbmRpY2F0ZSBuZXcgYmVzdCB0aW1lLCBjbGVhcmVkIGVhY2ggdGltZSBhIGxldmVsIGlzIHN0YXJ0ZWQuXHJcbiAgICB0aGlzLm5ld0Jlc3RUaW1lID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5jaGVja0Fuc3dlckVtaXR0ZXIgPSBuZXcgRW1pdHRlcigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjaGVja0Fuc3dlckVtaXR0ZXInICksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFsgeyBuYW1lOiAncmVzdWx0JywgcGhldGlvVHlwZTogT2JqZWN0TGl0ZXJhbElPIH0gXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmNoYWxsZW5nZVNldEdyb3VwVGFuZGVtID0gVGFuZGVtLk9QVF9PVVQ7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0dyb3VwVGFuZGVtfVxyXG4gICAgdGhpcy5udW1iZXJBdG9tR3JvdXBUYW5kZW0gPSBUYW5kZW0uT1BUX09VVDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAocGhldC1pbykge0FycmF5LjxBcnJheS48QkFBR2FtZUNoYWxsZW5nZT59IC0gd2hlbiBzZXQgYnkgdGhlIFBoRVQtaU8gQVBJLCB0aGVzZSBjaGFsbGVuZ2VzIHdpbGwgYmVcclxuICAgIC8vIHVzZWQgaW5zdGVhZCBvZiByYW5kb21seSBnZW5lcmF0ZWRcclxuICAgIHRoaXMucHJlZGV0ZXJtaW5lZENoYWxsZW5nZXMgPSBbXTtcclxuICAgIC8vIEBwcml2YXRlIChwaGV0LWlvKSB7QXJyYXkuPEFycmF5LjxCQUFHYW1lQ2hhbGxlbmdlPn0gLSB3aGVuIHNldCBieSB0aGUgUGhFVC1pTyBBUEksIHRoZXNlIGNoYWxsZW5nZXMgd2lsbFxyXG4gICAgLy8gYmUgdXNlZCBpbnN0ZWFkIG9mIHJhbmRvbWx5IGdlbmVyYXRlZFxyXG4gICAgdGhpcy5wcmVkZXRlcm1pbmVkQ2hhbGxlbmdlcyA9IFtdO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpYyAtIHRpbWUgc3RlcHBpbmcgZnVuY3Rpb24sIGNhbGxlZCBieSB0aGUgZnJhbWV3b3JrXHJcbiAgc3RlcCggZHQgKSB7XHJcblxyXG4gICAgLy8gSW5jcmVtZW50IHRoZSBnYW1lIHRpbWVyIGlmIHJ1bm5pbmcuICBOb3RlIHRoYXQgdGhpcyBhc3N1bWVzIHRoYXQgZHQgaXMgbm90IGNsYW1wZWQsIGJlY2F1c2Ugd2Ugd2FudCBpdCB0b1xyXG4gICAgLy8gZXNzZW50aWFsbHkgY29udGludWUgcnVubmluZyBpZiB0aGUgdXNlciBzd2l0Y2hlcyB0YWJzIG9yIGhpZGVzIHRoZSBicm93c2VyLlxyXG4gICAgaWYgKCB0aGlzLnRpbWVyRW5hYmxlZFByb3BlcnR5LmdldCgpICYmXHJcbiAgICAgICAgIHRoaXMuc3RhdGVQcm9wZXJ0eS5nZXQoKSAhPT0gQkFBR2FtZVN0YXRlLkNIT09TSU5HX0xFVkVMICYmXHJcbiAgICAgICAgIHRoaXMuc3RhdGVQcm9wZXJ0eS5nZXQoKSAhPT0gQkFBR2FtZVN0YXRlLkxFVkVMX0NPTVBMRVRFRCApIHtcclxuXHJcbiAgICAgIHRoaXMuZWxhcHNlZFRpbWVQcm9wZXJ0eS5zZXQoIHRoaXMuZWxhcHNlZFRpbWVQcm9wZXJ0eS5nZXQoKSArIGR0ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3RlcCB0aGUgY3VycmVudCBjaGFsbGVuZ2UgaWYgaXQgaGFzIGFueSB0aW1lLWRyaXZlbiBiZWhhdmlvci5cclxuICAgIHRoaXMuc3RhdGVQcm9wZXJ0eS5nZXQoKS5zdGVwKCBkdCApO1xyXG5cclxuICAgIC8vIFN0ZXAgYW55IGV4dGVybmFsIGZ1bmN0aW9ucyB0aGF0IG5lZWQgaXQuXHJcbiAgICB0aGlzLnN0ZXBMaXN0ZW5lcnMuZm9yRWFjaCggc3RlcExpc3RlbmVyID0+IHsgc3RlcExpc3RlbmVyKCBkdCApOyB9ICk7XHJcbiAgfVxyXG5cclxuICAvLyBTdGFydCBhIG5ldyBnYW1lLlxyXG4gIC8vIEBwcml2YXRlIChTdGFydEdhbWVMZXZlbE5vZGUuanMsIHBoZXQtaW8pXHJcbiAgc3RhcnRHYW1lTGV2ZWwoIGxldmVsTmFtZSApIHtcclxuICAgIHRoaXMubGV2ZWxQcm9wZXJ0eS5zZXQoIFNocmVkQ29uc3RhbnRzLk1BUF9MRVZFTF9OQU1FX1RPX05VTUJFUiggbGV2ZWxOYW1lICkgKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eS5zZXQoIDAgKTtcclxuXHJcbiAgICAvLyBUT0RPOiBDb21tZW50ZWQgb3V0IGR1ZSB0byBwcm9ibGVtcyByZWxhdGVkIHRvIHBoZXQtaW8sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYnVpbGQtYW4tYXRvbS9pc3N1ZXMvMTg1XHJcbiAgICAvLyBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNoYWxsZW5nZVNldFByb3BlcnR5LmdldCgpLmxlbmd0aCA9PT0gMCwgJ2NoYWxsZW5nZXMgc2hvdWxkIGJlIGNsZWFyZWQgYmVmb3JlIHN0YXJ0aW5nIGEgbmV3IGdhbWUnICk7XHJcblxyXG4gICAgLy8gVXNlIHRoZSBwcmVkZXRlcm1pbmVkIGNoYWxsZW5nZXMgKGlmIHNwZWNpZmllZCBieSBwaGV0LWlvKSBvciBnZW5lcmF0ZSBhIHJhbmRvbSBjaGFsbGVuZ2UgZm9yIHRoZSBnaXZlbiBsZXZlbFxyXG4gICAgY29uc3QgY2hhbGxlbmdlU2V0ID0gdGhpcy5wcmVkZXRlcm1pbmVkQ2hhbGxlbmdlc1sgdGhpcy5sZXZlbFByb3BlcnR5LmdldCgpIF0gfHwgQ2hhbGxlbmdlU2V0RmFjdG9yeS5nZW5lcmF0ZShcclxuICAgICAgdGhpcy5sZXZlbFByb3BlcnR5LmdldCgpLFxyXG4gICAgICBDSEFMTEVOR0VTX1BFUl9MRVZFTCxcclxuICAgICAgdGhpcyxcclxuICAgICAgdGhpcy5hbGxvd2VkQ2hhbGxlbmdlVHlwZXNCeUxldmVsLFxyXG4gICAgICBUYW5kZW0uT1BUX09VVFxyXG4gICAgKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlU2V0UHJvcGVydHkuc2V0KCBjaGFsbGVuZ2VTZXQgKTtcclxuICAgIHRoaXMuc2NvcmVQcm9wZXJ0eS5zZXQoIDAgKTtcclxuICAgIHRoaXMubmV3QmVzdFRpbWUgPSBmYWxzZTtcclxuICAgIHRoaXMuYmVzdFRpbWVWaXNpYmxlWyB0aGlzLmxldmVsUHJvcGVydHkuZ2V0KCkgXS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5lbGFwc2VkVGltZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICBpZiAoIHRoaXMuY2hhbGxlbmdlU2V0UHJvcGVydHkuZ2V0KCkubGVuZ3RoID4gMCApIHtcclxuICAgICAgdGhpcy5zdGF0ZVByb3BlcnR5LnNldCggdGhpcy5jaGFsbGVuZ2VTZXRQcm9wZXJ0eS5nZXQoKVsgMCBdICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5zdGF0ZVByb3BlcnR5LnNldCggQkFBR2FtZVN0YXRlLkxFVkVMX0NPTVBMRVRFRCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpYyAtIGdvIHRvIHRoZSBsZXZlbCBzZWxlY3Rpb24gZGlhbG9nIGFuZCBhbGxvdyB0aGUgdXNlciB0byBzdGFydCBhIG5ldyBnYW1lXHJcbiAgbmV3R2FtZSgpIHtcclxuICAgIHRoaXMuc3RhdGVQcm9wZXJ0eS5zZXQoIEJBQUdhbWVTdGF0ZS5DSE9PU0lOR19MRVZFTCApO1xyXG4gICAgdGhpcy5zY29yZVByb3BlcnR5LnNldCggMCApO1xyXG5cclxuICAgIC8vIChwaGV0LWlvKSBEaXNwb3NlIG9sZCBjaGFsbGVuZ2VzIGJlZm9yZSBzZXR0aW5nIHRoZSBwcm9wZXJ0eSBhZ2Fpbi5cclxuICAgIHRoaXMuY2hhbGxlbmdlU2V0UHJvcGVydHkuZ2V0KCkuZm9yRWFjaCggY2hhbGxlbmdlID0+IHtcclxuICAgICAgKCAhY2hhbGxlbmdlLmlzRGlzcG9zZWQgKSAmJiBjaGFsbGVuZ2UuZGlzcG9zZSgpO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VTZXRQcm9wZXJ0eS5nZXQoKS5sZW5ndGggPSAwO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpYyAtIGFkdmFuY2UgdG8gdGhlIG5leHQgY2hhbGxlbmdlIG9yIHRvIHRoZSAnZ2FtZSBvdmVyJyBzY3JlZW4gaWYgYWxsIGNoYWxsZW5nZXMgZmluaXNoZWRcclxuICBuZXh0KCkge1xyXG4gICAgY29uc3QgbGV2ZWwgPSB0aGlzLmxldmVsUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBpZiAoIHRoaXMuY2hhbGxlbmdlU2V0UHJvcGVydHkuZ2V0KCkubGVuZ3RoID4gdGhpcy5jaGFsbGVuZ2VJbmRleFByb3BlcnR5LmdldCgpICsgMSApIHtcclxuICAgICAgLy8gTmV4dCBjaGFsbGVuZ2UuXHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eS5zZXQoIHRoaXMuY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eS5nZXQoKSArIDEgKTtcclxuICAgICAgdGhpcy5zdGF0ZVByb3BlcnR5LnNldCggdGhpcy5jaGFsbGVuZ2VTZXRQcm9wZXJ0eS5nZXQoKVsgdGhpcy5jaGFsbGVuZ2VJbmRleFByb3BlcnR5LmdldCgpIF0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBHYW1lIGxldmVsIGNvbXBsZXRlZCAtIHVwZGF0ZSBzY29yZSBhbmQgc3RhdGUuXHJcbiAgICAgIGlmICggdGhpcy5zY29yZVByb3BlcnR5LmdldCgpID4gdGhpcy5iZXN0U2NvcmVzWyBsZXZlbCBdLnZhbHVlICkge1xyXG4gICAgICAgIHRoaXMuYmVzdFNjb3Jlc1sgbGV2ZWwgXS52YWx1ZSA9IHRoaXMuc2NvcmVQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHRoaXMudGltZXJFbmFibGVkUHJvcGVydHkuZ2V0KCkgJiYgdGhpcy5zY29yZVByb3BlcnR5LmdldCgpID09PSBNQVhfUE9JTlRTX1BFUl9HQU1FX0xFVkVMICYmXHJcbiAgICAgICAgICAgKCB0aGlzLmJlc3RUaW1lc1sgbGV2ZWwgXS52YWx1ZSA9PT0gbnVsbCB8fCB0aGlzLmVsYXBzZWRUaW1lUHJvcGVydHkuZ2V0KCkgPCB0aGlzLmJlc3RUaW1lc1sgbGV2ZWwgXS52YWx1ZSApICkge1xyXG4gICAgICAgIHRoaXMubmV3QmVzdFRpbWUgPSB0aGlzLmJlc3RUaW1lc1sgbGV2ZWwgXS52YWx1ZSAhPT0gbnVsbDsgLy8gRG9uJ3Qgc2V0IHRoaXMgZmxhZyBmb3IgdGhlIGZpcnN0ICdiZXN0IHRpbWUnLCBvbmx5IHdoZW4gdGhlIHRpbWUgaW1wcm92ZXMuXHJcbiAgICAgICAgdGhpcy5iZXN0VGltZXNbIGxldmVsIF0udmFsdWUgPSB0aGlzLmVsYXBzZWRUaW1lUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggdGhpcy5zY29yZVByb3BlcnR5LmdldCgpID09PSBNQVhfUE9JTlRTX1BFUl9HQU1FX0xFVkVMICYmIHRoaXMudGltZXJFbmFibGVkUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgICAgdGhpcy5iZXN0VGltZVZpc2libGVbIGxldmVsIF0udmFsdWUgPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnNjb3Jlc1sgbGV2ZWwgXS52YWx1ZSA9IHRoaXMuc2NvcmVQcm9wZXJ0eS5nZXQoKTtcclxuXHJcbiAgICAgIC8vIFdoZW4gdGhlIGdhbWUgaXMgY29tcGxldGUsIHNlbmQgbm90aWZpY2F0aW9uIHRoYXQgY2FuIGJlIHVzZWQgYnkgcGhldC1pb1xyXG4gICAgICB0aGlzLmxldmVsQ29tcGxldGVkRW1pdHRlci5lbWl0KCB7XHJcbiAgICAgICAgbGV2ZWw6IGxldmVsLFxyXG4gICAgICAgIG1heFBvaW50czogTUFYX1BPSU5UU19QRVJfR0FNRV9MRVZFTCxcclxuICAgICAgICBjaGFsbGVuZ2VzOiBDSEFMTEVOR0VTX1BFUl9MRVZFTCxcclxuICAgICAgICB0aW1lckVuYWJsZWQ6IHRoaXMudGltZXJFbmFibGVkUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgZWxhcHNlZFRpbWU6IHRoaXMuZWxhcHNlZFRpbWVQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgICBiZXN0VGltZXM6IHRoaXMuYmVzdFRpbWVzWyBsZXZlbCBdLFxyXG4gICAgICAgIG5ld0Jlc3RUaW1lOiB0aGlzLm5ld0Jlc3RUaW1lXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMuc3RhdGVQcm9wZXJ0eS5zZXQoIEJBQUdhbWVTdGF0ZS5MRVZFTF9DT01QTEVURUQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuc3RhdGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy50aW1lckVuYWJsZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5sZXZlbFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmNoYWxsZW5nZVNldFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmNoYWxsZW5nZUluZGV4UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc2NvcmVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5lbGFwc2VkVGltZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmJlc3RTY29yZXMuZm9yRWFjaCggYmVzdFNjb3JlUHJvcGVydHkgPT4geyBiZXN0U2NvcmVQcm9wZXJ0eS5yZXNldCgpOyB9ICk7XHJcbiAgICB0aGlzLnNjb3Jlcy5mb3JFYWNoKCBzY29yZVByb3BlcnR5ID0+IHsgc2NvcmVQcm9wZXJ0eS5yZXNldCgpOyB9ICk7XHJcbiAgICB0aGlzLmJlc3RUaW1lcy5mb3JFYWNoKCBiZXN0VGltZVByb3BlcnR5ID0+IHsgYmVzdFRpbWVQcm9wZXJ0eS5yZXNldCgpOyB9ICk7XHJcbiAgICB0aGlzLmJlc3RUaW1lVmlzaWJsZS5wdXNoKCBiZXN0VGltZVZpc2libGVQcm9wZXJ0eSA9PiB7IGJlc3RUaW1lVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7IH0gKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBhZGRTdGVwTGlzdGVuZXIoIHN0ZXBMaXN0ZW5lciApIHtcclxuICAgIHRoaXMuc3RlcExpc3RlbmVycy5wdXNoKCBzdGVwTGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICByZW1vdmVTdGVwTGlzdGVuZXIoIHN0ZXBMaXN0ZW5lciApIHtcclxuICAgIHRoaXMuc3RlcExpc3RlbmVycyA9IF8ud2l0aG91dCggdGhpcy5zdGVwTGlzdGVuZXJzLCBzdGVwTGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8vIFNldCB0aGUgYWxsb3dlZCBjaGFsbGVuZ2UgdHlwZXMgdG8gY3VzdG9taXplIGZvciBwaGV0LWlvXHJcbiAgLy8gQHByaXZhdGUgKHBoZXQtaW8pXHJcbiAgc2V0QWxsb3dlZENoYWxsZW5nZVR5cGVzQnlMZXZlbCggYWxsb3dlZENoYWxsZW5nZVR5cGVzQnlMZXZlbCApIHtcclxuICAgIHRoaXMuYWxsb3dlZENoYWxsZW5nZVR5cGVzQnlMZXZlbCA9IGFsbG93ZWRDaGFsbGVuZ2VUeXBlc0J5TGV2ZWw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTcGVjaWZ5IGV4YWN0IGNoYWxsZW5nZXMgKGFuZCBvcmRlcmluZykgZm9yIGVhY2ggbGV2ZWwuXHJcbiAgICogQHBhcmFtIHtBcnJheS48QXJyYXkuPE9iamVjdD4+fSBjaGFsbGVuZ2VTcGVjc0ZvckxldmVsc1xyXG4gICAqIEBwdWJsaWMgKHBoZXQtaW8pXHJcbiAgICovXHJcbiAgc2V0Q2hhbGxlbmdlcyggY2hhbGxlbmdlU3BlY3NGb3JMZXZlbHMgKSB7XHJcbiAgICB0aGlzLnByZWRldGVybWluZWRDaGFsbGVuZ2VzID0gY2hhbGxlbmdlU3BlY3NGb3JMZXZlbHMubWFwKCBsZXZlbFNwZWMgPT4gbGV2ZWxTcGVjLm1hcCggY2hhbGxlbmdlU3BlYyA9PiBDaGFsbGVuZ2VTZXRGYWN0b3J5LmNyZWF0ZUNoYWxsZW5nZSggdGhpcywgY2hhbGxlbmdlU3BlYy5jaGFsbGVuZ2VUeXBlLCBuZXcgTnVtYmVyQXRvbSgge1xyXG4gICAgICBwcm90b25Db3VudDogY2hhbGxlbmdlU3BlYy5udW1iZXJBdG9tLnByb3RvbkNvdW50LFxyXG4gICAgICBuZXV0cm9uQ291bnQ6IGNoYWxsZW5nZVNwZWMubnVtYmVyQXRvbS5uZXV0cm9uQ291bnQsXHJcbiAgICAgIGVsZWN0cm9uQ291bnQ6IGNoYWxsZW5nZVNwZWMubnVtYmVyQXRvbS5lbGVjdHJvbkNvdW50LFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICB9ICksIFRhbmRlbS5PUFRfT1VUICkgKSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGVtaXRDaGVja0Fuc3dlciggaXNDb3JyZWN0LCBwb2ludHMsIGFuc3dlckF0b20sIHN1Ym1pdHRlZEF0b20sIGV4dGVuc2lvbiApIHtcclxuICAgIGNvbnN0IGFyZyA9IHtcclxuICAgICAgaXNDb3JyZWN0OiBpc0NvcnJlY3QsXHJcblxyXG4gICAgICBjb3JyZWN0UHJvdG9uQ291bnQ6IGFuc3dlckF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgY29ycmVjdE5ldXRyb25Db3VudDogYW5zd2VyQXRvbS5uZXV0cm9uQ291bnRQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgY29ycmVjdEVsZWN0cm9uQ291bnQ6IGFuc3dlckF0b20uZWxlY3Ryb25Db3VudFByb3BlcnR5LmdldCgpLFxyXG5cclxuICAgICAgc3VibWl0dGVkUHJvdG9uQ291bnQ6IHN1Ym1pdHRlZEF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgc3VibWl0dGVkTmV1dHJvbkNvdW50OiBzdWJtaXR0ZWRBdG9tLm5ldXRyb25Db3VudFByb3BlcnR5LmdldCgpLFxyXG4gICAgICBzdWJtaXR0ZWRFbGVjdHJvbkNvdW50OiBzdWJtaXR0ZWRBdG9tLmVsZWN0cm9uQ291bnRQcm9wZXJ0eS5nZXQoKSxcclxuXHJcbiAgICAgIHBvaW50czogcG9pbnRzXHJcbiAgICB9O1xyXG4gICAgdGhpcy5jaGVja0Fuc3dlckVtaXR0ZXIuZW1pdCggbWVyZ2UoIGFyZywgZXh0ZW5zaW9uICkgKTtcclxuICB9XHJcblxyXG59XHJcblxyXG5cclxuLy8gc3RhdGljc1xyXG5HYW1lTW9kZWwuTUFYX1BPSU5UU19QRVJfR0FNRV9MRVZFTCA9IE1BWF9QT0lOVFNfUEVSX0dBTUVfTEVWRUw7XHJcbkdhbWVNb2RlbC5DSEFMTEVOR0VTX1BFUl9MRVZFTCA9IENIQUxMRU5HRVNfUEVSX0xFVkVMO1xyXG5cclxuYnVpbGRBbkF0b20ucmVnaXN0ZXIoICdHYW1lTW9kZWwnLCBHYW1lTW9kZWwgKTtcclxuXHJcbkdhbWVNb2RlbC5HYW1lTW9kZWxJTyA9IG5ldyBJT1R5cGUoICdHYW1lTW9kZWxJTycsIHtcclxuICB2YWx1ZVR5cGU6IEdhbWVNb2RlbCxcclxuICBkb2N1bWVudGF0aW9uOiAnVGhlIG1vZGVsIGZvciB0aGUgR2FtZScsXHJcbiAgbWV0aG9kczoge1xyXG5cclxuICAgIHN0YXJ0R2FtZUxldmVsOiB7XHJcbiAgICAgIHJldHVyblR5cGU6IFZvaWRJTyxcclxuICAgICAgcGFyYW1ldGVyVHlwZXM6IFsgU3RyaW5nSU8gXSxcclxuICAgICAgaW1wbGVtZW50YXRpb246IGZ1bmN0aW9uKCBsZXZlbFR5cGUgKSB7XHJcbiAgICAgICAgdGhpcy5zdGFydEdhbWVMZXZlbCggbGV2ZWxUeXBlICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGRvY3VtZW50YXRpb246ICdTdGFydCBvbmUgb2YgdGhlIGZvbGxvd2luZyBnYW1lczogcGVyaW9kaWMtdGFibGUtZ2FtZSwgbWFzcy1hbmQtY2hhcmdlLWdhbWUsIHN5bWJvbC1nYW1lLCBhZHZhbmNlZC1zeW1ib2wtZ2FtZScsXHJcbiAgICAgIGludm9jYWJsZUZvclJlYWRPbmx5RWxlbWVudHM6IGZhbHNlXHJcbiAgICB9LFxyXG5cclxuICAgIHNldENoYWxsZW5nZXM6IHtcclxuICAgICAgcmV0dXJuVHlwZTogVm9pZElPLFxyXG4gICAgICBwYXJhbWV0ZXJUeXBlczogWyBBcnJheUlPKCBBcnJheUlPKCBPYmplY3RMaXRlcmFsSU8gKSApIF0sXHJcbiAgICAgIGltcGxlbWVudGF0aW9uOiBmdW5jdGlvbiggY2hhbGxlbmdlcyApIHtcclxuICAgICAgICB0aGlzLnNldENoYWxsZW5nZXMoIGNoYWxsZW5nZXMgKTtcclxuICAgICAgfSxcclxuICAgICAgZG9jdW1lbnRhdGlvbjogJ1NwZWNpZnkgZXhhY3QgY2hhbGxlbmdlcycsXHJcbiAgICAgIGludm9jYWJsZUZvclJlYWRPbmx5RWxlbWVudHM6IGZhbHNlXHJcbiAgICB9LFxyXG5cclxuICAgIHNldEFsbG93ZWRDaGFsbGVuZ2VUeXBlc0J5TGV2ZWw6IHtcclxuICAgICAgcmV0dXJuVHlwZTogVm9pZElPLFxyXG4gICAgICBwYXJhbWV0ZXJUeXBlczogWyBBcnJheUlPKCBBcnJheUlPKCBTdHJpbmdJTyApICkgXSxcclxuXHJcbiAgICAgIC8vIFRPRE86IGNoYW5nZSB0aGlzIHRvIHRha2UgaW5kZXggYXMgMXN0IGFyZ3VtZW50IChmb3IgbGV2ZWwgaW5kZXgpXHJcbiAgICAgIGltcGxlbWVudGF0aW9uOiBmdW5jdGlvbiggYWxsb3dlZENoYWxsZW5nZVR5cGVzQnlMZXZlbCApIHtcclxuICAgICAgICB0aGlzLnNldEFsbG93ZWRDaGFsbGVuZ2VUeXBlc0J5TGV2ZWwoIGFsbG93ZWRDaGFsbGVuZ2VUeXBlc0J5TGV2ZWwgKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGRvY3VtZW50YXRpb246ICdTcGVjaWZ5IHdoaWNoIGNoYWxsZW5nZSB0eXBlcyBtYXkgYmUgcHJlc2VudGVkIHRvIHRoZSB1c2VyIGZvciBlYWNoIGxldmVsLicsXHJcbiAgICAgIGludm9jYWJsZUZvclJlYWRPbmx5RWxlbWVudHM6IGZhbHNlXHJcbiAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlIGlzIFtcclxuICAgICAgLy8gICAgWyAnc2NoZW1hdGljLXRvLWVsZW1lbnQnLCAnY291bnRzLXRvLWVsZW1lbnQnIF0sXHJcbiAgICAgIC8vICAgIFsgJ2NvdW50cy10by1jaGFyZ2UnLCAnY291bnRzLXRvLW1hc3MnLCAnc2NoZW1hdGljLXRvLWNoYXJnZScsICdzY2hlbWF0aWMtdG8tbWFzcycgXSxcclxuICAgICAgLy8gICAgWyAnc2NoZW1hdGljLXRvLXN5bWJvbC1jaGFyZ2UnLCAnc2NoZW1hdGljLXRvLXN5bWJvbC1tYXNzLW51bWJlcicsICdzY2hlbWF0aWMtdG8tc3ltYm9sLXByb3Rvbi1jb3VudCcsICdjb3VudHMtdG8tc3ltYm9sLWNoYXJnZScsICdjb3VudHMtdG8tc3ltYm9sLW1hc3MnIF0sXHJcbiAgICAgIC8vICAgIFsgJ3NjaGVtYXRpYy10by1zeW1ib2wtYWxsJywgJ3N5bWJvbC10by1zY2hlbWF0aWMnLCAnc3ltYm9sLXRvLWNvdW50cycsICdjb3VudHMtdG8tc3ltYm9sLWFsbCcgXVxyXG4gICAgICAvLyAgXVxyXG4gICAgfVxyXG4gIH1cclxufSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgR2FtZU1vZGVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFB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