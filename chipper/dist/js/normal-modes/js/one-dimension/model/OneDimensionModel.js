// Copyright 2020-2022, University of Colorado Boulder

/**
 * The model for the 'One Dimension' Screen.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import AmplitudeDirection from '../../common/model/AmplitudeDirection.js';
import Mass from '../../common/model/Mass.js';
import NormalModesModel from '../../common/model/NormalModesModel.js';
import Spring from '../../common/model/Spring.js';
import NormalModesConstants from '../../common/NormalModesConstants.js';
import normalModes from '../../normalModes.js';

// including the 2 virtual stationary masses at wall positions
const MAX_MASSES = NormalModesConstants.MAX_MASSES_PER_ROW + 2;
const MAX_SPRINGS = MAX_MASSES - 1;
class OneDimensionModel extends NormalModesModel {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      tandem: Tandem.REQUIRED
    }, options);
    super(options);

    // @public {Property.<boolean>} determines visibility of the phases sliders
    this.phasesVisibleProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('phasesVisibleProperty')
    });

    // @public {NumberProperty[]} 1-dimensional arrays of Properties for each mode
    this.modeAmplitudeProperties = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
    this.modePhaseProperties = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
    this.modeFrequencyProperties = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
    for (let i = 0; i < NormalModesConstants.MAX_MASSES_PER_ROW; i++) {
      // Use 1-based indexing for the tandem names. See https://github.com/phetsims/normal-modes/issues/55
      const tandemIndex = i + 1;
      this.modeAmplitudeProperties[i] = new NumberProperty(NormalModesConstants.INITIAL_AMPLITUDE, {
        tandem: options.tandem.createTandem(`modeAmplitude${tandemIndex}Property`),
        range: new Range(NormalModesConstants.MIN_AMPLITUDE, Number.POSITIVE_INFINITY)
      });
      this.modePhaseProperties[i] = new NumberProperty(NormalModesConstants.INITIAL_PHASE, {
        tandem: options.tandem.createTandem(`modePhase${tandemIndex}Property`),
        range: new Range(NormalModesConstants.MIN_PHASE, NormalModesConstants.MAX_PHASE)
      });

      // dispose is unnecessary, since this class owns the dependency
      this.modeFrequencyProperties[i] = new DerivedProperty([this.numberOfMassesProperty], numberMasses => {
        const k = NormalModesConstants.SPRING_CONSTANT_VALUE;
        const m = NormalModesConstants.MASSES_MASS_VALUE;
        if (i >= numberMasses) {
          return 0;
        } else {
          return 2 * Math.sqrt(k / m) * Math.sin(Math.PI / 2 * (i + 1) / (numberMasses + 1));
        }
      }, {
        tandem: options.tandem.createTandem(`modeFrequency${tandemIndex}Property`),
        phetioValueType: NumberIO
      });
    }

    // @public {Mass[]} Array that will contain all of the masses.
    this.masses = new Array(MAX_MASSES);
    this.createDefaultMasses(options.tandem);

    // @public {Spring[]} Array that will contain all of the springs.
    this.springs = new Array(MAX_SPRINGS);
    this.createDefaultSprings();

    // @public {Property.<number>} the index of the mass being dragged
    this.draggingMassIndexProperty = new NumberProperty(0, {
      tandem: options.tandem.createTandem('draggingMassIndexProperty')
    });

    // unlink is unnecessary, exists for the lifetime of the sim
    this.numberOfMassesProperty.link(this.changedNumberOfMasses.bind(this));
  }

  /**
   * Relocates all masses to their correct positions.
   * @param {number} numberMasses - the current number of visible masses in the simulation
   * @private
   */
  changedNumberOfMasses(numberMasses) {
    let x = NormalModesConstants.LEFT_WALL_X_POS;
    const xStep = NormalModesConstants.DISTANCE_BETWEEN_X_WALLS / (numberMasses + 1);
    const xFinal = NormalModesConstants.LEFT_WALL_X_POS + NormalModesConstants.DISTANCE_BETWEEN_X_WALLS;
    for (let i = 0; i < MAX_MASSES; i++) {
      const visible = i <= numberMasses;
      this.masses[i].equilibriumPositionProperty.set(new Vector2(x, 0));
      this.masses[i].visibleProperty.set(visible);
      this.masses[i].zeroPosition();
      if (x < xFinal - xStep / 2) {
        x += xStep;
      }
    }
    this.resetNormalModes();
  }

  /**
   * Creates MAX_MASSES masses in the correct positions.
   * @param {Tandem} tandem
   * @private
   */
  createDefaultMasses(tandem) {
    const defaultMassesNumber = this.numberOfMassesProperty.get();
    let x = NormalModesConstants.LEFT_WALL_X_POS;
    const xStep = NormalModesConstants.DISTANCE_BETWEEN_X_WALLS / (defaultMassesNumber + 1);
    const xFinal = NormalModesConstants.LEFT_WALL_X_POS + NormalModesConstants.DISTANCE_BETWEEN_X_WALLS;
    for (let i = 0; i < MAX_MASSES; i++) {
      const visible = i <= defaultMassesNumber;

      // All the masses needed are created at once, and exist for the lifetime of the sim
      this.masses[i] = new Mass(new Vector2(x, 0), visible, tandem.createTandem(`mass${i}`));
      if (x < xFinal) {
        x += xStep;
      }
    }
  }

  /**
   * Creates MAX_SPRINGS springs, connecting to the correct masses.
   * @public
   */
  createDefaultSprings() {
    for (let i = 0; i < MAX_SPRINGS; i++) {
      // All the springs needed are created at once, and exist for the lifetime of the sim
      this.springs[i] = new Spring(this.masses[i], this.masses[i + 1]);
    }
  }

  /**
   * Resets the normal modes' amplitude and phase.
   * @public
   */
  resetNormalModes() {
    for (let i = 0; i < NormalModesConstants.MAX_MASSES_PER_ROW; i++) {
      this.modeAmplitudeProperties[i].reset();
      this.modePhaseProperties[i].reset();
    }
  }

  /**
   * Resets the model.
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.phasesVisibleProperty.reset();
    this.draggingMassIndexProperty.reset();
    this.zeroPositions(); // the amplitudes and phases are reset because of zeroPositions
  }

  /**
   * Returns masses to the initial position. The sim is paused and the time is set to 0.
   * @public
   */
  initialPositions() {
    this.playingProperty.set(false);
    this.timeProperty.reset();
    this.setExactPositions();
  }

  /**
   * Zeroes the masses' positions. The sim is not paused.
   * @public
   */
  zeroPositions() {
    for (let i = 0; i < MAX_MASSES; i++) {
      this.masses[i].zeroPosition();
    }
    this.resetNormalModes();
  }

  /**
   * Steps the model.
   * @param {number} dt - time step, in seconds
   * @public
   */
  step(dt) {
    // If the time step > 0.15, ignore it - it probably means the user returned to the tab after
    // the tab or the browser was hidden for a while.
    dt = Math.min(dt, 0.15);
    if (this.playingProperty.get()) {
      this.dt += dt;
      while (this.dt >= NormalModesConstants.FIXED_DT) {
        this.dt -= NormalModesConstants.FIXED_DT;
        this.singleStep(NormalModesConstants.FIXED_DT);
      }
    } else if (this.draggingMassIndexProperty.get() <= 0) {
      // Even if the sim is paused, changing the amplitude direction or the amplitudes
      // and phases should move the masses

      this.setExactPositions();
    }
  }

  /**
   * Steps the model with a given dt.
   * @param {number} dt - time step, in seconds
   * @public
   */
  singleStep(dt) {
    dt *= this.timeScaleProperty.get();
    this.timeProperty.set(this.timeProperty.get() + dt);
    if (this.draggingMassIndexProperty.get() > 0) {
      this.setVerletPositions(dt);
    } else {
      this.setExactPositions();
    }
  }

  /**
   * Update positions of masses at next time step, using Velocity Verlet algorithm.
   * Needed when user has grabbed mass with mouse, making exact calculation of positions impossible.
   * @param {number} dt - time step, in seconds
   * @private
   */
  setVerletPositions(dt) {
    const N = this.numberOfMassesProperty.get();
    for (let i = 1; i <= N; ++i) {
      if (i !== this.draggingMassIndexProperty.get()) {
        const x = this.masses[i].displacementProperty.get();
        const v = this.masses[i].velocityProperty.get();
        const a = this.masses[i].accelerationProperty.get();
        const displacement = x.plus(v.timesScalar(dt)).add(a.timesScalar(dt * dt / 2));
        this.masses[i].displacementProperty.set(displacement);
        this.masses[i].previousAccelerationProperty.set(a);
      }
    }
    this.recalculateVelocityAndAcceleration(dt);
  }

  /**
   * Update velocity and acceleration.
   * @param {number} dt - time step, in seconds
   * @private
   */
  recalculateVelocityAndAcceleration(dt) {
    const N = this.numberOfMassesProperty.get();
    for (let i = 1; i <= N; ++i) {
      if (i !== this.draggingMassIndexProperty.get()) {
        const k = NormalModesConstants.SPRING_CONSTANT_VALUE;
        const m = NormalModesConstants.MASSES_MASS_VALUE;
        const xLeft = this.masses[i - 1].displacementProperty.get();
        const x = this.masses[i].displacementProperty.get();
        const xRight = this.masses[i + 1].displacementProperty.get();
        this.masses[i].accelerationProperty.set(xLeft.plus(xRight).subtract(x.timesScalar(2)).multiplyScalar(k / m));
        const v = this.masses[i].velocityProperty.get();
        const a = this.masses[i].accelerationProperty.get();
        const aLast = this.masses[i].previousAccelerationProperty.get();
        this.masses[i].velocityProperty.set(v.plus(a.plus(aLast).multiplyScalar(dt / 2)));

        //TODO https://github.com/phetsims/normal-modes/issues/56 these assertions fail in CT
        // if ( assert ) {
        //   const velocity = this.masses[ i ].velocityProperty.get();
        //   const acceleration = this.masses[ i ].accelerationProperty.get();
        //   const prefix = `recalculateVelocityAndAcceleration: N=${N} i=${i}`;
        //   if ( this.amplitudeDirectionProperty.get() === AmplitudeDirection.HORIZONTAL ) {
        //     assert( velocity.y === 0, `${prefix} velocity=${velocity}, expected non-zero x component` );
        //     assert( acceleration.y === 0, `${prefix} acceleration=${acceleration}, expected non-zero x component` );
        //   }
        //   else {
        //     assert( velocity.x === 0, `${prefix} velocity=${velocity}, expected non-zero y component` );
        //     assert( acceleration.x === 0, `${prefix} acceleration.x=${acceleration}, expected non-zero y component` );
        //   }
        // }
      } else {
        this.masses[i].accelerationProperty.set(new Vector2(0, 0));
        this.masses[i].velocityProperty.set(new Vector2(0, 0));
      }
    }
  }

  /**
   * Update positions of masses at next time step, using exact calculation.
   * Only used if no mass is grabbed by mouse.
   * @private
   */
  setExactPositions() {
    const N = this.numberOfMassesProperty.get();
    for (let i = 1; i <= N; ++i) {
      // for each mass

      let displacement = 0;
      let velocity = 0;
      let acceleration = 0;
      for (let r = 1; r <= N; ++r) {
        // for each mode

        const j = r - 1;
        const modeAmplitude = this.modeAmplitudeProperties[j].get();
        const modeFrequency = this.modeFrequencyProperties[j].get();
        const modePhase = this.modePhaseProperties[j].get();
        const displacementSin = Math.sin(i * r * Math.PI / (N + 1));
        const displacementCos = Math.cos(modeFrequency * this.timeProperty.get() - modePhase);
        const velocitySin = Math.sin(modeFrequency * this.timeProperty.get() - modePhase);
        const modeDisplacement = modeAmplitude * displacementSin * displacementCos;
        displacement += modeDisplacement;
        velocity += -modeFrequency * modeAmplitude * displacementSin * velocitySin;
        acceleration += -(modeFrequency ** 2) * modeDisplacement;
      }
      if (this.amplitudeDirectionProperty.get() === AmplitudeDirection.HORIZONTAL) {
        this.masses[i].displacementProperty.set(new Vector2(displacement, 0));
        this.masses[i].velocityProperty.set(new Vector2(velocity, 0));
        this.masses[i].accelerationProperty.set(new Vector2(acceleration, 0));
      } else {
        this.masses[i].displacementProperty.set(new Vector2(0, displacement));
        this.masses[i].velocityProperty.set(new Vector2(0, velocity));
        this.masses[i].accelerationProperty.set(new Vector2(0, acceleration));
      }
    }
  }

  /**
   * Compute mode amplitudes and phases based on current masses displacement and velocity.
   * @private
   */
  computeModeAmplitudesAndPhases() {
    this.timeProperty.reset();
    const N = this.numberOfMassesProperty.get();
    for (let i = 1; i <= N; ++i) {
      // for each mode

      let amplitudeTimesCosPhase = 0;
      let amplitudeTimesSinPhase = 0;
      for (let j = 1; j <= N; ++j) {
        // for each mass

        let massDisplacement = 0;
        let massVelocity = 0;
        if (this.amplitudeDirectionProperty.get() === AmplitudeDirection.HORIZONTAL) {
          massDisplacement = this.masses[j].displacementProperty.get().x;
          massVelocity = this.masses[j].velocityProperty.get().x;
        } else {
          massDisplacement = this.masses[j].displacementProperty.get().y;
          massVelocity = this.masses[j].velocityProperty.get().y;
        }
        const amplitudeSin = Math.sin(i * j * Math.PI / (N + 1));
        const modeFrequency = this.modeFrequencyProperties[i - 1].get();
        amplitudeTimesCosPhase += 2 / (N + 1) * massDisplacement * amplitudeSin;
        amplitudeTimesSinPhase += 2 / (modeFrequency * (N + 1)) * massVelocity * amplitudeSin;
      }
      this.modeAmplitudeProperties[i - 1].set(Math.sqrt(amplitudeTimesCosPhase ** 2 + amplitudeTimesSinPhase ** 2));
      this.modePhaseProperties[i - 1].set(Math.atan2(amplitudeTimesSinPhase, amplitudeTimesCosPhase));
    }
  }
}
normalModes.register('OneDimensionModel', OneDimensionModel);
export default OneDimensionModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiVmVjdG9yMiIsIm1lcmdlIiwiVGFuZGVtIiwiTnVtYmVySU8iLCJBbXBsaXR1ZGVEaXJlY3Rpb24iLCJNYXNzIiwiTm9ybWFsTW9kZXNNb2RlbCIsIlNwcmluZyIsIk5vcm1hbE1vZGVzQ29uc3RhbnRzIiwibm9ybWFsTW9kZXMiLCJNQVhfTUFTU0VTIiwiTUFYX01BU1NFU19QRVJfUk9XIiwiTUFYX1NQUklOR1MiLCJPbmVEaW1lbnNpb25Nb2RlbCIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsInRhbmRlbSIsIlJFUVVJUkVEIiwicGhhc2VzVmlzaWJsZVByb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwibW9kZUFtcGxpdHVkZVByb3BlcnRpZXMiLCJBcnJheSIsIm1vZGVQaGFzZVByb3BlcnRpZXMiLCJtb2RlRnJlcXVlbmN5UHJvcGVydGllcyIsImkiLCJ0YW5kZW1JbmRleCIsIklOSVRJQUxfQU1QTElUVURFIiwicmFuZ2UiLCJNSU5fQU1QTElUVURFIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJJTklUSUFMX1BIQVNFIiwiTUlOX1BIQVNFIiwiTUFYX1BIQVNFIiwibnVtYmVyT2ZNYXNzZXNQcm9wZXJ0eSIsIm51bWJlck1hc3NlcyIsImsiLCJTUFJJTkdfQ09OU1RBTlRfVkFMVUUiLCJtIiwiTUFTU0VTX01BU1NfVkFMVUUiLCJNYXRoIiwic3FydCIsInNpbiIsIlBJIiwicGhldGlvVmFsdWVUeXBlIiwibWFzc2VzIiwiY3JlYXRlRGVmYXVsdE1hc3NlcyIsInNwcmluZ3MiLCJjcmVhdGVEZWZhdWx0U3ByaW5ncyIsImRyYWdnaW5nTWFzc0luZGV4UHJvcGVydHkiLCJsaW5rIiwiY2hhbmdlZE51bWJlck9mTWFzc2VzIiwiYmluZCIsIngiLCJMRUZUX1dBTExfWF9QT1MiLCJ4U3RlcCIsIkRJU1RBTkNFX0JFVFdFRU5fWF9XQUxMUyIsInhGaW5hbCIsInZpc2libGUiLCJlcXVpbGlicml1bVBvc2l0aW9uUHJvcGVydHkiLCJzZXQiLCJ2aXNpYmxlUHJvcGVydHkiLCJ6ZXJvUG9zaXRpb24iLCJyZXNldE5vcm1hbE1vZGVzIiwiZGVmYXVsdE1hc3Nlc051bWJlciIsImdldCIsInJlc2V0IiwiemVyb1Bvc2l0aW9ucyIsImluaXRpYWxQb3NpdGlvbnMiLCJwbGF5aW5nUHJvcGVydHkiLCJ0aW1lUHJvcGVydHkiLCJzZXRFeGFjdFBvc2l0aW9ucyIsInN0ZXAiLCJkdCIsIm1pbiIsIkZJWEVEX0RUIiwic2luZ2xlU3RlcCIsInRpbWVTY2FsZVByb3BlcnR5Iiwic2V0VmVybGV0UG9zaXRpb25zIiwiTiIsImRpc3BsYWNlbWVudFByb3BlcnR5IiwidiIsInZlbG9jaXR5UHJvcGVydHkiLCJhIiwiYWNjZWxlcmF0aW9uUHJvcGVydHkiLCJkaXNwbGFjZW1lbnQiLCJwbHVzIiwidGltZXNTY2FsYXIiLCJhZGQiLCJwcmV2aW91c0FjY2VsZXJhdGlvblByb3BlcnR5IiwicmVjYWxjdWxhdGVWZWxvY2l0eUFuZEFjY2VsZXJhdGlvbiIsInhMZWZ0IiwieFJpZ2h0Iiwic3VidHJhY3QiLCJtdWx0aXBseVNjYWxhciIsImFMYXN0IiwidmVsb2NpdHkiLCJhY2NlbGVyYXRpb24iLCJyIiwiaiIsIm1vZGVBbXBsaXR1ZGUiLCJtb2RlRnJlcXVlbmN5IiwibW9kZVBoYXNlIiwiZGlzcGxhY2VtZW50U2luIiwiZGlzcGxhY2VtZW50Q29zIiwiY29zIiwidmVsb2NpdHlTaW4iLCJtb2RlRGlzcGxhY2VtZW50IiwiYW1wbGl0dWRlRGlyZWN0aW9uUHJvcGVydHkiLCJIT1JJWk9OVEFMIiwiY29tcHV0ZU1vZGVBbXBsaXR1ZGVzQW5kUGhhc2VzIiwiYW1wbGl0dWRlVGltZXNDb3NQaGFzZSIsImFtcGxpdHVkZVRpbWVzU2luUGhhc2UiLCJtYXNzRGlzcGxhY2VtZW50IiwibWFzc1ZlbG9jaXR5IiwieSIsImFtcGxpdHVkZVNpbiIsImF0YW4yIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJPbmVEaW1lbnNpb25Nb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgbW9kZWwgZm9yIHRoZSAnT25lIERpbWVuc2lvbicgU2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFRoaWFnbyBkZSBNZW5kb27Dp2EgTWlsZGVtYmVyZ2VyIChVVEZQUilcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBOdW1iZXJJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVtYmVySU8uanMnO1xyXG5pbXBvcnQgQW1wbGl0dWRlRGlyZWN0aW9uIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9BbXBsaXR1ZGVEaXJlY3Rpb24uanMnO1xyXG5pbXBvcnQgTWFzcyBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvTWFzcy5qcyc7XHJcbmltcG9ydCBOb3JtYWxNb2Rlc01vZGVsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Ob3JtYWxNb2Rlc01vZGVsLmpzJztcclxuaW1wb3J0IFNwcmluZyBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvU3ByaW5nLmpzJztcclxuaW1wb3J0IE5vcm1hbE1vZGVzQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9Ob3JtYWxNb2Rlc0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBub3JtYWxNb2RlcyBmcm9tICcuLi8uLi9ub3JtYWxNb2Rlcy5qcyc7XHJcblxyXG4vLyBpbmNsdWRpbmcgdGhlIDIgdmlydHVhbCBzdGF0aW9uYXJ5IG1hc3NlcyBhdCB3YWxsIHBvc2l0aW9uc1xyXG5jb25zdCBNQVhfTUFTU0VTID0gTm9ybWFsTW9kZXNDb25zdGFudHMuTUFYX01BU1NFU19QRVJfUk9XICsgMjtcclxuY29uc3QgTUFYX1NQUklOR1MgPSBNQVhfTUFTU0VTIC0gMTtcclxuXHJcbmNsYXNzIE9uZURpbWVuc2lvbk1vZGVsIGV4dGVuZHMgTm9ybWFsTW9kZXNNb2RlbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gZGV0ZXJtaW5lcyB2aXNpYmlsaXR5IG9mIHRoZSBwaGFzZXMgc2xpZGVyc1xyXG4gICAgdGhpcy5waGFzZXNWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BoYXNlc1Zpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge051bWJlclByb3BlcnR5W119IDEtZGltZW5zaW9uYWwgYXJyYXlzIG9mIFByb3BlcnRpZXMgZm9yIGVhY2ggbW9kZVxyXG4gICAgdGhpcy5tb2RlQW1wbGl0dWRlUHJvcGVydGllcyA9IG5ldyBBcnJheSggTm9ybWFsTW9kZXNDb25zdGFudHMuTUFYX01BU1NFU19QRVJfUk9XICk7XHJcbiAgICB0aGlzLm1vZGVQaGFzZVByb3BlcnRpZXMgPSBuZXcgQXJyYXkoIE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BWF9NQVNTRVNfUEVSX1JPVyApO1xyXG4gICAgdGhpcy5tb2RlRnJlcXVlbmN5UHJvcGVydGllcyA9IG5ldyBBcnJheSggTm9ybWFsTW9kZXNDb25zdGFudHMuTUFYX01BU1NFU19QRVJfUk9XICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgTm9ybWFsTW9kZXNDb25zdGFudHMuTUFYX01BU1NFU19QRVJfUk9XOyBpKysgKSB7XHJcblxyXG4gICAgICAvLyBVc2UgMS1iYXNlZCBpbmRleGluZyBmb3IgdGhlIHRhbmRlbSBuYW1lcy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9ub3JtYWwtbW9kZXMvaXNzdWVzLzU1XHJcbiAgICAgIGNvbnN0IHRhbmRlbUluZGV4ID0gaSArIDE7XHJcblxyXG4gICAgICB0aGlzLm1vZGVBbXBsaXR1ZGVQcm9wZXJ0aWVzWyBpIF0gPSBuZXcgTnVtYmVyUHJvcGVydHkoIE5vcm1hbE1vZGVzQ29uc3RhbnRzLklOSVRJQUxfQU1QTElUVURFLCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oIGBtb2RlQW1wbGl0dWRlJHt0YW5kZW1JbmRleH1Qcm9wZXJ0eWAgKSxcclxuICAgICAgICByYW5nZTogbmV3IFJhbmdlKCBOb3JtYWxNb2Rlc0NvbnN0YW50cy5NSU5fQU1QTElUVURFLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICB0aGlzLm1vZGVQaGFzZVByb3BlcnRpZXNbIGkgXSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggTm9ybWFsTW9kZXNDb25zdGFudHMuSU5JVElBTF9QSEFTRSwge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCBgbW9kZVBoYXNlJHt0YW5kZW1JbmRleH1Qcm9wZXJ0eWAgKSxcclxuICAgICAgICByYW5nZTogbmV3IFJhbmdlKCBOb3JtYWxNb2Rlc0NvbnN0YW50cy5NSU5fUEhBU0UsIE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BWF9QSEFTRSApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIGRpc3Bvc2UgaXMgdW5uZWNlc3NhcnksIHNpbmNlIHRoaXMgY2xhc3Mgb3ducyB0aGUgZGVwZW5kZW5jeVxyXG4gICAgICB0aGlzLm1vZGVGcmVxdWVuY3lQcm9wZXJ0aWVzWyBpIF0gPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMubnVtYmVyT2ZNYXNzZXNQcm9wZXJ0eSBdLCBudW1iZXJNYXNzZXMgPT4ge1xyXG4gICAgICAgIGNvbnN0IGsgPSBOb3JtYWxNb2Rlc0NvbnN0YW50cy5TUFJJTkdfQ09OU1RBTlRfVkFMVUU7XHJcbiAgICAgICAgY29uc3QgbSA9IE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BU1NFU19NQVNTX1ZBTFVFO1xyXG4gICAgICAgIGlmICggaSA+PSBudW1iZXJNYXNzZXMgKSB7XHJcbiAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gMiAqIE1hdGguc3FydCggayAvIG0gKSAqIE1hdGguc2luKCBNYXRoLlBJIC8gMiAqICggaSArIDEgKSAvICggbnVtYmVyTWFzc2VzICsgMSApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oIGBtb2RlRnJlcXVlbmN5JHt0YW5kZW1JbmRleH1Qcm9wZXJ0eWAgKSxcclxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bWJlcklPXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHVibGljIHtNYXNzW119IEFycmF5IHRoYXQgd2lsbCBjb250YWluIGFsbCBvZiB0aGUgbWFzc2VzLlxyXG4gICAgdGhpcy5tYXNzZXMgPSBuZXcgQXJyYXkoIE1BWF9NQVNTRVMgKTtcclxuICAgIHRoaXMuY3JlYXRlRGVmYXVsdE1hc3Nlcyggb3B0aW9ucy50YW5kZW0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtTcHJpbmdbXX0gQXJyYXkgdGhhdCB3aWxsIGNvbnRhaW4gYWxsIG9mIHRoZSBzcHJpbmdzLlxyXG4gICAgdGhpcy5zcHJpbmdzID0gbmV3IEFycmF5KCBNQVhfU1BSSU5HUyApO1xyXG4gICAgdGhpcy5jcmVhdGVEZWZhdWx0U3ByaW5ncygpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSB0aGUgaW5kZXggb2YgdGhlIG1hc3MgYmVpbmcgZHJhZ2dlZFxyXG4gICAgdGhpcy5kcmFnZ2luZ01hc3NJbmRleFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ2dpbmdNYXNzSW5kZXhQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHVubGluayBpcyB1bm5lY2Vzc2FyeSwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbVxyXG4gICAgdGhpcy5udW1iZXJPZk1hc3Nlc1Byb3BlcnR5LmxpbmsoIHRoaXMuY2hhbmdlZE51bWJlck9mTWFzc2VzLmJpbmQoIHRoaXMgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsb2NhdGVzIGFsbCBtYXNzZXMgdG8gdGhlaXIgY29ycmVjdCBwb3NpdGlvbnMuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bWJlck1hc3NlcyAtIHRoZSBjdXJyZW50IG51bWJlciBvZiB2aXNpYmxlIG1hc3NlcyBpbiB0aGUgc2ltdWxhdGlvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgY2hhbmdlZE51bWJlck9mTWFzc2VzKCBudW1iZXJNYXNzZXMgKSB7XHJcblxyXG4gICAgbGV0IHggPSBOb3JtYWxNb2Rlc0NvbnN0YW50cy5MRUZUX1dBTExfWF9QT1M7XHJcbiAgICBjb25zdCB4U3RlcCA9IE5vcm1hbE1vZGVzQ29uc3RhbnRzLkRJU1RBTkNFX0JFVFdFRU5fWF9XQUxMUyAvICggbnVtYmVyTWFzc2VzICsgMSApO1xyXG4gICAgY29uc3QgeEZpbmFsID0gTm9ybWFsTW9kZXNDb25zdGFudHMuTEVGVF9XQUxMX1hfUE9TICsgTm9ybWFsTW9kZXNDb25zdGFudHMuRElTVEFOQ0VfQkVUV0VFTl9YX1dBTExTO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IE1BWF9NQVNTRVM7IGkrKyApIHtcclxuICAgICAgY29uc3QgdmlzaWJsZSA9ICggaSA8PSBudW1iZXJNYXNzZXMgKTtcclxuXHJcbiAgICAgIHRoaXMubWFzc2VzWyBpIF0uZXF1aWxpYnJpdW1Qb3NpdGlvblByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoIHgsIDAgKSApO1xyXG4gICAgICB0aGlzLm1hc3Nlc1sgaSBdLnZpc2libGVQcm9wZXJ0eS5zZXQoIHZpc2libGUgKTtcclxuICAgICAgdGhpcy5tYXNzZXNbIGkgXS56ZXJvUG9zaXRpb24oKTtcclxuXHJcbiAgICAgIGlmICggeCA8IHhGaW5hbCAtIHhTdGVwIC8gMiApIHtcclxuICAgICAgICB4ICs9IHhTdGVwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZXNldE5vcm1hbE1vZGVzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIE1BWF9NQVNTRVMgbWFzc2VzIGluIHRoZSBjb3JyZWN0IHBvc2l0aW9ucy5cclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjcmVhdGVEZWZhdWx0TWFzc2VzKCB0YW5kZW0gKSB7XHJcbiAgICBjb25zdCBkZWZhdWx0TWFzc2VzTnVtYmVyID0gdGhpcy5udW1iZXJPZk1hc3Nlc1Byb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIGxldCB4ID0gTm9ybWFsTW9kZXNDb25zdGFudHMuTEVGVF9XQUxMX1hfUE9TO1xyXG4gICAgY29uc3QgeFN0ZXAgPSBOb3JtYWxNb2Rlc0NvbnN0YW50cy5ESVNUQU5DRV9CRVRXRUVOX1hfV0FMTFMgLyAoIGRlZmF1bHRNYXNzZXNOdW1iZXIgKyAxICk7XHJcbiAgICBjb25zdCB4RmluYWwgPSBOb3JtYWxNb2Rlc0NvbnN0YW50cy5MRUZUX1dBTExfWF9QT1MgKyBOb3JtYWxNb2Rlc0NvbnN0YW50cy5ESVNUQU5DRV9CRVRXRUVOX1hfV0FMTFM7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgTUFYX01BU1NFUzsgaSsrICkge1xyXG4gICAgICBjb25zdCB2aXNpYmxlID0gKCBpIDw9IGRlZmF1bHRNYXNzZXNOdW1iZXIgKTtcclxuXHJcbiAgICAgIC8vIEFsbCB0aGUgbWFzc2VzIG5lZWRlZCBhcmUgY3JlYXRlZCBhdCBvbmNlLCBhbmQgZXhpc3QgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltXHJcbiAgICAgIHRoaXMubWFzc2VzWyBpIF0gPSBuZXcgTWFzcyggbmV3IFZlY3RvcjIoIHgsIDAgKSwgdmlzaWJsZSwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggYG1hc3Mke2l9YCApICk7XHJcblxyXG4gICAgICBpZiAoIHggPCB4RmluYWwgKSB7XHJcbiAgICAgICAgeCArPSB4U3RlcDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBNQVhfU1BSSU5HUyBzcHJpbmdzLCBjb25uZWN0aW5nIHRvIHRoZSBjb3JyZWN0IG1hc3Nlcy5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY3JlYXRlRGVmYXVsdFNwcmluZ3MoKSB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBNQVhfU1BSSU5HUzsgaSsrICkge1xyXG4gICAgICAvLyBBbGwgdGhlIHNwcmluZ3MgbmVlZGVkIGFyZSBjcmVhdGVkIGF0IG9uY2UsIGFuZCBleGlzdCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW1cclxuICAgICAgdGhpcy5zcHJpbmdzWyBpIF0gPSBuZXcgU3ByaW5nKCB0aGlzLm1hc3Nlc1sgaSBdLCB0aGlzLm1hc3Nlc1sgaSArIDEgXSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSBub3JtYWwgbW9kZXMnIGFtcGxpdHVkZSBhbmQgcGhhc2UuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0Tm9ybWFsTW9kZXMoKSB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBOb3JtYWxNb2Rlc0NvbnN0YW50cy5NQVhfTUFTU0VTX1BFUl9ST1c7IGkrKyApIHtcclxuICAgICAgdGhpcy5tb2RlQW1wbGl0dWRlUHJvcGVydGllc1sgaSBdLnJlc2V0KCk7XHJcbiAgICAgIHRoaXMubW9kZVBoYXNlUHJvcGVydGllc1sgaSBdLnJlc2V0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIG1vZGVsLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgICB0aGlzLnBoYXNlc1Zpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5kcmFnZ2luZ01hc3NJbmRleFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnplcm9Qb3NpdGlvbnMoKTsgLy8gdGhlIGFtcGxpdHVkZXMgYW5kIHBoYXNlcyBhcmUgcmVzZXQgYmVjYXVzZSBvZiB6ZXJvUG9zaXRpb25zXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIG1hc3NlcyB0byB0aGUgaW5pdGlhbCBwb3NpdGlvbi4gVGhlIHNpbSBpcyBwYXVzZWQgYW5kIHRoZSB0aW1lIGlzIHNldCB0byAwLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBpbml0aWFsUG9zaXRpb25zKCkge1xyXG4gICAgdGhpcy5wbGF5aW5nUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgdGhpcy50aW1lUHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICB0aGlzLnNldEV4YWN0UG9zaXRpb25zKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBaZXJvZXMgdGhlIG1hc3NlcycgcG9zaXRpb25zLiBUaGUgc2ltIGlzIG5vdCBwYXVzZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHplcm9Qb3NpdGlvbnMoKSB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBNQVhfTUFTU0VTOyBpKysgKSB7XHJcbiAgICAgIHRoaXMubWFzc2VzWyBpIF0uemVyb1Bvc2l0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZXNldE5vcm1hbE1vZGVzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwcyB0aGUgbW9kZWwuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgLy8gSWYgdGhlIHRpbWUgc3RlcCA+IDAuMTUsIGlnbm9yZSBpdCAtIGl0IHByb2JhYmx5IG1lYW5zIHRoZSB1c2VyIHJldHVybmVkIHRvIHRoZSB0YWIgYWZ0ZXJcclxuICAgIC8vIHRoZSB0YWIgb3IgdGhlIGJyb3dzZXIgd2FzIGhpZGRlbiBmb3IgYSB3aGlsZS5cclxuICAgIGR0ID0gTWF0aC5taW4oIGR0LCAwLjE1ICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLnBsYXlpbmdQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgdGhpcy5kdCArPSBkdDtcclxuXHJcbiAgICAgIHdoaWxlICggdGhpcy5kdCA+PSBOb3JtYWxNb2Rlc0NvbnN0YW50cy5GSVhFRF9EVCApIHtcclxuICAgICAgICB0aGlzLmR0IC09IE5vcm1hbE1vZGVzQ29uc3RhbnRzLkZJWEVEX0RUO1xyXG4gICAgICAgIHRoaXMuc2luZ2xlU3RlcCggTm9ybWFsTW9kZXNDb25zdGFudHMuRklYRURfRFQgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuZHJhZ2dpbmdNYXNzSW5kZXhQcm9wZXJ0eS5nZXQoKSA8PSAwICkge1xyXG4gICAgICAvLyBFdmVuIGlmIHRoZSBzaW0gaXMgcGF1c2VkLCBjaGFuZ2luZyB0aGUgYW1wbGl0dWRlIGRpcmVjdGlvbiBvciB0aGUgYW1wbGl0dWRlc1xyXG4gICAgICAvLyBhbmQgcGhhc2VzIHNob3VsZCBtb3ZlIHRoZSBtYXNzZXNcclxuXHJcbiAgICAgIHRoaXMuc2V0RXhhY3RQb3NpdGlvbnMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIHRoZSBtb2RlbCB3aXRoIGEgZ2l2ZW4gZHQuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNpbmdsZVN0ZXAoIGR0ICkge1xyXG4gICAgZHQgKj0gdGhpcy50aW1lU2NhbGVQcm9wZXJ0eS5nZXQoKTtcclxuICAgIHRoaXMudGltZVByb3BlcnR5LnNldCggdGhpcy50aW1lUHJvcGVydHkuZ2V0KCkgKyBkdCApO1xyXG4gICAgaWYgKCB0aGlzLmRyYWdnaW5nTWFzc0luZGV4UHJvcGVydHkuZ2V0KCkgPiAwICkge1xyXG4gICAgICB0aGlzLnNldFZlcmxldFBvc2l0aW9ucyggZHQgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnNldEV4YWN0UG9zaXRpb25zKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgcG9zaXRpb25zIG9mIG1hc3NlcyBhdCBuZXh0IHRpbWUgc3RlcCwgdXNpbmcgVmVsb2NpdHkgVmVybGV0IGFsZ29yaXRobS5cclxuICAgKiBOZWVkZWQgd2hlbiB1c2VyIGhhcyBncmFiYmVkIG1hc3Mgd2l0aCBtb3VzZSwgbWFraW5nIGV4YWN0IGNhbGN1bGF0aW9uIG9mIHBvc2l0aW9ucyBpbXBvc3NpYmxlLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc2V0VmVybGV0UG9zaXRpb25zKCBkdCApIHtcclxuICAgIGNvbnN0IE4gPSB0aGlzLm51bWJlck9mTWFzc2VzUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPD0gTjsgKytpICkge1xyXG4gICAgICBpZiAoIGkgIT09IHRoaXMuZHJhZ2dpbmdNYXNzSW5kZXhQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgICAgY29uc3QgeCA9IHRoaXMubWFzc2VzWyBpIF0uZGlzcGxhY2VtZW50UHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgY29uc3QgdiA9IHRoaXMubWFzc2VzWyBpIF0udmVsb2NpdHlQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICBjb25zdCBhID0gdGhpcy5tYXNzZXNbIGkgXS5hY2NlbGVyYXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuXHJcbiAgICAgICAgY29uc3QgZGlzcGxhY2VtZW50ID0geC5wbHVzKCB2LnRpbWVzU2NhbGFyKCBkdCApICkuYWRkKCBhLnRpbWVzU2NhbGFyKCBkdCAqIGR0IC8gMiApICk7XHJcbiAgICAgICAgdGhpcy5tYXNzZXNbIGkgXS5kaXNwbGFjZW1lbnRQcm9wZXJ0eS5zZXQoIGRpc3BsYWNlbWVudCApO1xyXG4gICAgICAgIHRoaXMubWFzc2VzWyBpIF0ucHJldmlvdXNBY2NlbGVyYXRpb25Qcm9wZXJ0eS5zZXQoIGEgKTtcclxuXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlY2FsY3VsYXRlVmVsb2NpdHlBbmRBY2NlbGVyYXRpb24oIGR0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdmVsb2NpdHkgYW5kIGFjY2VsZXJhdGlvbi5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSB0aW1lIHN0ZXAsIGluIHNlY29uZHNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHJlY2FsY3VsYXRlVmVsb2NpdHlBbmRBY2NlbGVyYXRpb24oIGR0ICkge1xyXG4gICAgY29uc3QgTiA9IHRoaXMubnVtYmVyT2ZNYXNzZXNQcm9wZXJ0eS5nZXQoKTtcclxuICAgIGZvciAoIGxldCBpID0gMTsgaSA8PSBOOyArK2kgKSB7XHJcbiAgICAgIGlmICggaSAhPT0gdGhpcy5kcmFnZ2luZ01hc3NJbmRleFByb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgICBjb25zdCBrID0gTm9ybWFsTW9kZXNDb25zdGFudHMuU1BSSU5HX0NPTlNUQU5UX1ZBTFVFO1xyXG4gICAgICAgIGNvbnN0IG0gPSBOb3JtYWxNb2Rlc0NvbnN0YW50cy5NQVNTRVNfTUFTU19WQUxVRTtcclxuICAgICAgICBjb25zdCB4TGVmdCA9IHRoaXMubWFzc2VzWyBpIC0gMSBdLmRpc3BsYWNlbWVudFByb3BlcnR5LmdldCgpO1xyXG4gICAgICAgIGNvbnN0IHggPSB0aGlzLm1hc3Nlc1sgaSBdLmRpc3BsYWNlbWVudFByb3BlcnR5LmdldCgpO1xyXG4gICAgICAgIGNvbnN0IHhSaWdodCA9IHRoaXMubWFzc2VzWyBpICsgMSBdLmRpc3BsYWNlbWVudFByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgICAgICB0aGlzLm1hc3Nlc1sgaSBdLmFjY2VsZXJhdGlvblByb3BlcnR5LnNldChcclxuICAgICAgICAgIHhMZWZ0LnBsdXMoIHhSaWdodCApLnN1YnRyYWN0KCB4LnRpbWVzU2NhbGFyKCAyICkgKS5tdWx0aXBseVNjYWxhciggayAvIG0gKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHYgPSB0aGlzLm1hc3Nlc1sgaSBdLnZlbG9jaXR5UHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgY29uc3QgYSA9IHRoaXMubWFzc2VzWyBpIF0uYWNjZWxlcmF0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgY29uc3QgYUxhc3QgPSB0aGlzLm1hc3Nlc1sgaSBdLnByZXZpb3VzQWNjZWxlcmF0aW9uUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgICAgIHRoaXMubWFzc2VzWyBpIF0udmVsb2NpdHlQcm9wZXJ0eS5zZXQoIHYucGx1cyggYS5wbHVzKCBhTGFzdCApLm11bHRpcGx5U2NhbGFyKCBkdCAvIDIgKSApICk7XHJcblxyXG4gICAgICAgIC8vVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbm9ybWFsLW1vZGVzL2lzc3Vlcy81NiB0aGVzZSBhc3NlcnRpb25zIGZhaWwgaW4gQ1RcclxuICAgICAgICAvLyBpZiAoIGFzc2VydCApIHtcclxuICAgICAgICAvLyAgIGNvbnN0IHZlbG9jaXR5ID0gdGhpcy5tYXNzZXNbIGkgXS52ZWxvY2l0eVByb3BlcnR5LmdldCgpO1xyXG4gICAgICAgIC8vICAgY29uc3QgYWNjZWxlcmF0aW9uID0gdGhpcy5tYXNzZXNbIGkgXS5hY2NlbGVyYXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICAvLyAgIGNvbnN0IHByZWZpeCA9IGByZWNhbGN1bGF0ZVZlbG9jaXR5QW5kQWNjZWxlcmF0aW9uOiBOPSR7Tn0gaT0ke2l9YDtcclxuICAgICAgICAvLyAgIGlmICggdGhpcy5hbXBsaXR1ZGVEaXJlY3Rpb25Qcm9wZXJ0eS5nZXQoKSA9PT0gQW1wbGl0dWRlRGlyZWN0aW9uLkhPUklaT05UQUwgKSB7XHJcbiAgICAgICAgLy8gICAgIGFzc2VydCggdmVsb2NpdHkueSA9PT0gMCwgYCR7cHJlZml4fSB2ZWxvY2l0eT0ke3ZlbG9jaXR5fSwgZXhwZWN0ZWQgbm9uLXplcm8geCBjb21wb25lbnRgICk7XHJcbiAgICAgICAgLy8gICAgIGFzc2VydCggYWNjZWxlcmF0aW9uLnkgPT09IDAsIGAke3ByZWZpeH0gYWNjZWxlcmF0aW9uPSR7YWNjZWxlcmF0aW9ufSwgZXhwZWN0ZWQgbm9uLXplcm8geCBjb21wb25lbnRgICk7XHJcbiAgICAgICAgLy8gICB9XHJcbiAgICAgICAgLy8gICBlbHNlIHtcclxuICAgICAgICAvLyAgICAgYXNzZXJ0KCB2ZWxvY2l0eS54ID09PSAwLCBgJHtwcmVmaXh9IHZlbG9jaXR5PSR7dmVsb2NpdHl9LCBleHBlY3RlZCBub24temVybyB5IGNvbXBvbmVudGAgKTtcclxuICAgICAgICAvLyAgICAgYXNzZXJ0KCBhY2NlbGVyYXRpb24ueCA9PT0gMCwgYCR7cHJlZml4fSBhY2NlbGVyYXRpb24ueD0ke2FjY2VsZXJhdGlvbn0sIGV4cGVjdGVkIG5vbi16ZXJvIHkgY29tcG9uZW50YCApO1xyXG4gICAgICAgIC8vICAgfVxyXG4gICAgICAgIC8vIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLm1hc3Nlc1sgaSBdLmFjY2VsZXJhdGlvblByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoIDAsIDAgKSApO1xyXG4gICAgICAgIHRoaXMubWFzc2VzWyBpIF0udmVsb2NpdHlQcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCAwLCAwICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHBvc2l0aW9ucyBvZiBtYXNzZXMgYXQgbmV4dCB0aW1lIHN0ZXAsIHVzaW5nIGV4YWN0IGNhbGN1bGF0aW9uLlxyXG4gICAqIE9ubHkgdXNlZCBpZiBubyBtYXNzIGlzIGdyYWJiZWQgYnkgbW91c2UuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBzZXRFeGFjdFBvc2l0aW9ucygpIHtcclxuICAgIGNvbnN0IE4gPSB0aGlzLm51bWJlck9mTWFzc2VzUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPD0gTjsgKytpICkge1xyXG4gICAgICAvLyBmb3IgZWFjaCBtYXNzXHJcblxyXG4gICAgICBsZXQgZGlzcGxhY2VtZW50ID0gMDtcclxuICAgICAgbGV0IHZlbG9jaXR5ID0gMDtcclxuICAgICAgbGV0IGFjY2VsZXJhdGlvbiA9IDA7XHJcblxyXG4gICAgICBmb3IgKCBsZXQgciA9IDE7IHIgPD0gTjsgKytyICkge1xyXG4gICAgICAgIC8vIGZvciBlYWNoIG1vZGVcclxuXHJcbiAgICAgICAgY29uc3QgaiA9IHIgLSAxO1xyXG4gICAgICAgIGNvbnN0IG1vZGVBbXBsaXR1ZGUgPSB0aGlzLm1vZGVBbXBsaXR1ZGVQcm9wZXJ0aWVzWyBqIF0uZ2V0KCk7XHJcbiAgICAgICAgY29uc3QgbW9kZUZyZXF1ZW5jeSA9IHRoaXMubW9kZUZyZXF1ZW5jeVByb3BlcnRpZXNbIGogXS5nZXQoKTtcclxuICAgICAgICBjb25zdCBtb2RlUGhhc2UgPSB0aGlzLm1vZGVQaGFzZVByb3BlcnRpZXNbIGogXS5nZXQoKTtcclxuXHJcbiAgICAgICAgY29uc3QgZGlzcGxhY2VtZW50U2luID0gTWF0aC5zaW4oIGkgKiByICogTWF0aC5QSSAvICggTiArIDEgKSApO1xyXG4gICAgICAgIGNvbnN0IGRpc3BsYWNlbWVudENvcyA9IE1hdGguY29zKCBtb2RlRnJlcXVlbmN5ICogdGhpcy50aW1lUHJvcGVydHkuZ2V0KCkgLSBtb2RlUGhhc2UgKTtcclxuICAgICAgICBjb25zdCB2ZWxvY2l0eVNpbiA9IE1hdGguc2luKCBtb2RlRnJlcXVlbmN5ICogdGhpcy50aW1lUHJvcGVydHkuZ2V0KCkgLSBtb2RlUGhhc2UgKTtcclxuXHJcbiAgICAgICAgY29uc3QgbW9kZURpc3BsYWNlbWVudCA9IG1vZGVBbXBsaXR1ZGUgKiBkaXNwbGFjZW1lbnRTaW4gKiBkaXNwbGFjZW1lbnRDb3M7XHJcbiAgICAgICAgZGlzcGxhY2VtZW50ICs9IG1vZGVEaXNwbGFjZW1lbnQ7XHJcbiAgICAgICAgdmVsb2NpdHkgKz0gKCAtbW9kZUZyZXF1ZW5jeSApICogbW9kZUFtcGxpdHVkZSAqIGRpc3BsYWNlbWVudFNpbiAqIHZlbG9jaXR5U2luO1xyXG4gICAgICAgIGFjY2VsZXJhdGlvbiArPSAtKCBtb2RlRnJlcXVlbmN5ICoqIDIgKSAqIG1vZGVEaXNwbGFjZW1lbnQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggdGhpcy5hbXBsaXR1ZGVEaXJlY3Rpb25Qcm9wZXJ0eS5nZXQoKSA9PT0gQW1wbGl0dWRlRGlyZWN0aW9uLkhPUklaT05UQUwgKSB7XHJcbiAgICAgICAgdGhpcy5tYXNzZXNbIGkgXS5kaXNwbGFjZW1lbnRQcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCBkaXNwbGFjZW1lbnQsIDAgKSApO1xyXG4gICAgICAgIHRoaXMubWFzc2VzWyBpIF0udmVsb2NpdHlQcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCB2ZWxvY2l0eSwgMCApICk7XHJcbiAgICAgICAgdGhpcy5tYXNzZXNbIGkgXS5hY2NlbGVyYXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCBhY2NlbGVyYXRpb24sIDAgKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMubWFzc2VzWyBpIF0uZGlzcGxhY2VtZW50UHJvcGVydHkuc2V0KCBuZXcgVmVjdG9yMiggMCwgZGlzcGxhY2VtZW50ICkgKTtcclxuICAgICAgICB0aGlzLm1hc3Nlc1sgaSBdLnZlbG9jaXR5UHJvcGVydHkuc2V0KCBuZXcgVmVjdG9yMiggMCwgdmVsb2NpdHkgKSApO1xyXG4gICAgICAgIHRoaXMubWFzc2VzWyBpIF0uYWNjZWxlcmF0aW9uUHJvcGVydHkuc2V0KCBuZXcgVmVjdG9yMiggMCwgYWNjZWxlcmF0aW9uICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZSBtb2RlIGFtcGxpdHVkZXMgYW5kIHBoYXNlcyBiYXNlZCBvbiBjdXJyZW50IG1hc3NlcyBkaXNwbGFjZW1lbnQgYW5kIHZlbG9jaXR5LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgY29tcHV0ZU1vZGVBbXBsaXR1ZGVzQW5kUGhhc2VzKCkge1xyXG4gICAgdGhpcy50aW1lUHJvcGVydHkucmVzZXQoKTtcclxuICAgIGNvbnN0IE4gPSB0aGlzLm51bWJlck9mTWFzc2VzUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPD0gTjsgKytpICkge1xyXG4gICAgICAvLyBmb3IgZWFjaCBtb2RlXHJcblxyXG4gICAgICBsZXQgYW1wbGl0dWRlVGltZXNDb3NQaGFzZSA9IDA7XHJcbiAgICAgIGxldCBhbXBsaXR1ZGVUaW1lc1NpblBoYXNlID0gMDtcclxuICAgICAgZm9yICggbGV0IGogPSAxOyBqIDw9IE47ICsraiApIHtcclxuICAgICAgICAvLyBmb3IgZWFjaCBtYXNzXHJcblxyXG4gICAgICAgIGxldCBtYXNzRGlzcGxhY2VtZW50ID0gMDtcclxuICAgICAgICBsZXQgbWFzc1ZlbG9jaXR5ID0gMDtcclxuICAgICAgICBpZiAoIHRoaXMuYW1wbGl0dWRlRGlyZWN0aW9uUHJvcGVydHkuZ2V0KCkgPT09IEFtcGxpdHVkZURpcmVjdGlvbi5IT1JJWk9OVEFMICkge1xyXG4gICAgICAgICAgbWFzc0Rpc3BsYWNlbWVudCA9IHRoaXMubWFzc2VzWyBqIF0uZGlzcGxhY2VtZW50UHJvcGVydHkuZ2V0KCkueDtcclxuICAgICAgICAgIG1hc3NWZWxvY2l0eSA9IHRoaXMubWFzc2VzWyBqIF0udmVsb2NpdHlQcm9wZXJ0eS5nZXQoKS54O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIG1hc3NEaXNwbGFjZW1lbnQgPSB0aGlzLm1hc3Nlc1sgaiBdLmRpc3BsYWNlbWVudFByb3BlcnR5LmdldCgpLnk7XHJcbiAgICAgICAgICBtYXNzVmVsb2NpdHkgPSB0aGlzLm1hc3Nlc1sgaiBdLnZlbG9jaXR5UHJvcGVydHkuZ2V0KCkueTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGFtcGxpdHVkZVNpbiA9IE1hdGguc2luKCBpICogaiAqIE1hdGguUEkgLyAoIE4gKyAxICkgKTtcclxuICAgICAgICBjb25zdCBtb2RlRnJlcXVlbmN5ID0gdGhpcy5tb2RlRnJlcXVlbmN5UHJvcGVydGllc1sgaSAtIDEgXS5nZXQoKTtcclxuXHJcbiAgICAgICAgYW1wbGl0dWRlVGltZXNDb3NQaGFzZSArPSAoIDIgLyAoIE4gKyAxICkgKSAqIG1hc3NEaXNwbGFjZW1lbnQgKiBhbXBsaXR1ZGVTaW47XHJcbiAgICAgICAgYW1wbGl0dWRlVGltZXNTaW5QaGFzZSArPSAoIDIgLyAoIG1vZGVGcmVxdWVuY3kgKiAoIE4gKyAxICkgKSApICogbWFzc1ZlbG9jaXR5ICogYW1wbGl0dWRlU2luO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLm1vZGVBbXBsaXR1ZGVQcm9wZXJ0aWVzWyBpIC0gMSBdLnNldChcclxuICAgICAgICBNYXRoLnNxcnQoIGFtcGxpdHVkZVRpbWVzQ29zUGhhc2UgKiogMiArIGFtcGxpdHVkZVRpbWVzU2luUGhhc2UgKiogMiApXHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0aGlzLm1vZGVQaGFzZVByb3BlcnRpZXNbIGkgLSAxIF0uc2V0KFxyXG4gICAgICAgIE1hdGguYXRhbjIoIGFtcGxpdHVkZVRpbWVzU2luUGhhc2UsIGFtcGxpdHVkZVRpbWVzQ29zUGhhc2UgKVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxubm9ybWFsTW9kZXMucmVnaXN0ZXIoICdPbmVEaW1lbnNpb25Nb2RlbCcsIE9uZURpbWVuc2lvbk1vZGVsICk7XHJcbmV4cG9ydCBkZWZhdWx0IE9uZURpbWVuc2lvbk1vZGVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxP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