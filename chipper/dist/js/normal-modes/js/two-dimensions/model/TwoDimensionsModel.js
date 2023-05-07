// Copyright 2020-2022, University of Colorado Boulder

/**
 * The model for the 'Two Dimensions' Screen.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import Mass from '../../common/model/Mass.js';
import NormalModesModel from '../../common/model/NormalModesModel.js';
import Spring from '../../common/model/Spring.js';
import NormalModesConstants from '../../common/NormalModesConstants.js';
import normalModes from '../../normalModes.js';
const MAX_MASSES = NormalModesConstants.MAX_MASSES_PER_ROW + 2;
const MAX_SPRINGS = MAX_MASSES - 1;
class TwoDimensionsModel extends NormalModesModel {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      tandem: Tandem.REQUIRED
    }, options);
    super(options);

    // @public {NumberProperty[][]} 2-dimensional arrays of Properties for each mode
    this.modeXAmplitudeProperties = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
    this.modeYAmplitudeProperties = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
    this.modeXPhaseProperties = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
    this.modeYPhaseProperties = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
    this.modeFrequencyProperties = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
    for (let i = 0; i < NormalModesConstants.MAX_MASSES_PER_ROW; i++) {
      this.modeXAmplitudeProperties[i] = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
      this.modeYAmplitudeProperties[i] = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
      this.modeXPhaseProperties[i] = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
      this.modeYPhaseProperties[i] = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
      this.modeFrequencyProperties[i] = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
      for (let j = 0; j < NormalModesConstants.MAX_MASSES_PER_ROW; ++j) {
        // Use 1-based indexing for the tandem names. See https://github.com/phetsims/normal-modes/issues/55
        const tandemIndex1 = i + 1;
        const tandemIndex2 = j + 1;
        this.modeXAmplitudeProperties[i][j] = new NumberProperty(NormalModesConstants.INITIAL_AMPLITUDE, {
          tandem: options.tandem.createTandem(`modeXAmplitude[${tandemIndex1},${tandemIndex2}]Property`),
          range: new Range(NormalModesConstants.MIN_AMPLITUDE, Number.POSITIVE_INFINITY)
        });
        this.modeYAmplitudeProperties[i][j] = new NumberProperty(NormalModesConstants.INITIAL_AMPLITUDE, {
          tandem: options.tandem.createTandem(`modeYAmplitude[${tandemIndex1},${tandemIndex2}]Property`),
          range: new Range(NormalModesConstants.MIN_AMPLITUDE, Number.POSITIVE_INFINITY)
        });
        this.modeXPhaseProperties[i][j] = new NumberProperty(NormalModesConstants.INITIAL_PHASE, {
          tandem: options.tandem.createTandem(`modeXPhase[${tandemIndex1},${tandemIndex2}]Property`),
          range: new Range(NormalModesConstants.MIN_PHASE, NormalModesConstants.MAX_PHASE)
        });
        this.modeYPhaseProperties[i][j] = new NumberProperty(NormalModesConstants.INITIAL_PHASE, {
          tandem: options.tandem.createTandem(`modeYPhase[${tandemIndex1},${tandemIndex2}]Property`),
          range: new Range(NormalModesConstants.MIN_PHASE, NormalModesConstants.MAX_PHASE)
        });

        // dispose is unnecessary, since this class owns the dependency
        this.modeFrequencyProperties[i][j] = new DerivedProperty([this.numberOfMassesProperty], numberMasses => {
          const k = NormalModesConstants.SPRING_CONSTANT_VALUE;
          const m = NormalModesConstants.MASSES_MASS_VALUE;
          if (i >= numberMasses || j >= numberMasses) {
            return 0;
          } else {
            const omegaI = 2 * Math.sqrt(k / m) * Math.sin(Math.PI / 2 * (i + 1) / (numberMasses + 1));
            const omegaJ = 2 * Math.sqrt(k / m) * Math.sin(Math.PI / 2 * (j + 1) / (numberMasses + 1));
            return Math.sqrt(omegaI ** 2 + omegaJ ** 2);
          }
        }, {
          tandem: options.tandem.createTandem(`modeFrequency[${tandemIndex1},${tandemIndex2}]Property`),
          phetioValueType: NumberIO
        });
      }
    }

    // @public {Mass[][]} 2-dimensional array that will contain all of the masses.
    this.masses = new Array(MAX_MASSES);
    for (let i = 0; i < MAX_MASSES; ++i) {
      this.masses[i] = new Array(MAX_MASSES);
    }
    this.createDefaultMasses(options.tandem);

    // @public {Spring[][]} 2-dimensional array that will contain all of the springs.
    this.springsX = new Array(MAX_SPRINGS);
    this.springsY = new Array(MAX_SPRINGS);
    for (let i = 0; i < MAX_SPRINGS; ++i) {
      this.springsX[i] = new Array(MAX_SPRINGS);
      this.springsY[i] = new Array(MAX_SPRINGS);
    }
    this.createDefaultSprings();

    // @public {Property.<number[]|null>} the indexes of the mass being dragged (an object with and 'i' and a 'j')
    this.draggingMassIndexesProperty = new Property(null, {
      tandem: options.tandem.createTandem('draggingMassIndexesProperty')
    });

    // unlink is unnecessary, exists for the lifetime of the sim
    this.numberOfMassesProperty.link(this.changedNumberOfMasses.bind(this));

    // This is the way the original Flash sim does this.
    // The maximum range will be [0,baseMaxAmplitude] for 1 mass.
    const baseMaxAmplitude = 0.3;
    const maxAmplitudes = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
    for (let i = 0; i < maxAmplitudes.length; i++) {
      const springLength = NormalModesConstants.DISTANCE_BETWEEN_X_WALLS / (i + 2);
      maxAmplitudes[i] = baseMaxAmplitude * springLength;
    }

    // @public
    this.maxAmplitudeProperty = new DerivedProperty([this.numberOfMassesProperty], numberMasses => maxAmplitudes[numberMasses - 1]);
  }

  /**
   * Calculates the sine products.
   * @param {number} numberMasses - the current number of visible masses in the simulation
   * @private
   */
  calculateSineProducts(numberMasses) {
    const N = numberMasses;
    this.sineProduct = [];
    for (let i = 1; i <= N; ++i) {
      this.sineProduct[i] = [];
      for (let j = 1; j <= N; ++j) {
        this.sineProduct[i][j] = [];
        for (let r = 1; r <= N; ++r) {
          this.sineProduct[i][j][r] = [];

          // no need to recalculate this for each 's'
          const sin = Math.sin(j * r * Math.PI / (N + 1));
          for (let s = 1; s <= N; ++s) {
            this.sineProduct[i][j][r][s] = sin * Math.sin(i * s * Math.PI / (N + 1));
          }
        }
      }
    }
  }

  /**
   * Creates MAX_MASSES masses in the correct positions.
   * @param {number} numberMasses - the current number of visible masses in the simulation
   * @private
   */
  changedNumberOfMasses(numberMasses) {
    let x = NormalModesConstants.LEFT_WALL_X_POS;
    const xStep = NormalModesConstants.DISTANCE_BETWEEN_X_WALLS / (numberMasses + 1);
    const xFinal = NormalModesConstants.LEFT_WALL_X_POS + NormalModesConstants.DISTANCE_BETWEEN_X_WALLS;
    let y = NormalModesConstants.TOP_WALL_Y_POS;
    const yStep = NormalModesConstants.DISTANCE_BETWEEN_Y_WALLS / (numberMasses + 1);
    const yFinal = NormalModesConstants.TOP_WALL_Y_POS - NormalModesConstants.DISTANCE_BETWEEN_Y_WALLS;
    for (let i = 0; i < MAX_MASSES; i++) {
      x = NormalModesConstants.LEFT_WALL_X_POS;
      for (let j = 0; j < MAX_MASSES; ++j) {
        const visible = i <= numberMasses && j <= numberMasses;
        this.masses[i][j].equilibriumPositionProperty.set(new Vector2(x, y));
        this.masses[i][j].visibleProperty.set(visible);
        this.masses[i][j].zeroPosition();
        if (x < xFinal - xStep / 2) {
          x += xStep;
        }
      }
      if (y > yFinal + yStep / 2) {
        y -= yStep;
      }
    }
    this.calculateSineProducts(numberMasses);
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
    let y = NormalModesConstants.TOP_WALL_Y_POS;
    const yStep = NormalModesConstants.DISTANCE_BETWEEN_Y_WALLS / (defaultMassesNumber + 1);
    const yFinal = NormalModesConstants.TOP_WALL_Y_POS + NormalModesConstants.DISTANCE_BETWEEN_Y_WALLS;
    for (let i = 0; i < MAX_MASSES; i++) {
      for (let j = 0; j < MAX_MASSES; ++j) {
        const visible = i <= defaultMassesNumber && j <= defaultMassesNumber;

        // All the masses needed are created at once, and exist for the lifetime of the sim.
        // Use 1-based indexing for the tandem names. See https://github.com/phetsims/normal-modes/issues/55
        this.masses[i][j] = new Mass(new Vector2(x, y), visible, tandem.createTandem(`mass[${i + 1},${j + 1}]`));
        if (x < xFinal - xStep / 2) {
          x += xStep;
        }
      }
      if (y < yFinal - yStep / 2) {
        y += yStep;
      }
    }
    this.calculateSineProducts(defaultMassesNumber);
  }

  /**
   * Creates MAX_SPRINGS springs, connecting to the correct masses.
   * @public
   */
  createDefaultSprings() {
    for (let i = 0; i < MAX_SPRINGS; i++) {
      for (let j = 0; j < MAX_SPRINGS; ++j) {
        // All the springs needed are created at once, and exist for the lifetime of the sim
        if (i !== MAX_SPRINGS - 1) {
          this.springsX[i][j] = new Spring(this.masses[i + 1][j], this.masses[i + 1][j + 1]);
        }
        if (j !== MAX_SPRINGS - 1) {
          this.springsY[i][j] = new Spring(this.masses[i][j + 1], this.masses[i + 1][j + 1]);
        }
      }
    }
  }

  /**
   * Resets the normal modes' amplitude and phase.
   * @public
   */
  resetNormalModes() {
    for (let i = 0; i < NormalModesConstants.MAX_MASSES_PER_ROW; i++) {
      for (let j = 0; j < NormalModesConstants.MAX_MASSES_PER_ROW; j++) {
        this.modeXAmplitudeProperties[i][j].reset();
        this.modeYAmplitudeProperties[i][j].reset();
        this.modeXPhaseProperties[i][j].reset();
        this.modeYPhaseProperties[i][j].reset();
      }
    }
  }

  /**
   * Resets the model.
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.draggingMassIndexesProperty.reset();
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
      for (let j = 0; j < MAX_MASSES; j++) {
        this.masses[i][j].zeroPosition();
      }
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
    } else if (this.draggingMassIndexesProperty.get() === null) {
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
    if (this.draggingMassIndexesProperty.get() !== null) {
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
      for (let j = 1; j <= N; ++j) {
        const dragging = this.draggingMassIndexesProperty.get();
        if (!dragging || dragging.i !== i || dragging.j !== j) {
          const x = this.masses[i][j].displacementProperty.get();
          const v = this.masses[i][j].velocityProperty.get();
          const a = this.masses[i][j].accelerationProperty.get();
          const displacement = x.plus(v.timesScalar(dt)).add(a.timesScalar(dt * dt / 2));
          this.masses[i][j].displacementProperty.set(displacement);
          this.masses[i][j].previousAccelerationProperty.set(a);
        }
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
      for (let j = 1; j <= N; ++j) {
        const dragging = this.draggingMassIndexesProperty.get();
        if (!dragging || dragging.i !== i || dragging.j !== j) {
          const k = NormalModesConstants.SPRING_CONSTANT_VALUE;
          const m = NormalModesConstants.MASSES_MASS_VALUE;
          const sLeft = this.masses[i][j - 1].displacementProperty.get();
          const sAbove = this.masses[i - 1][j].displacementProperty.get();
          const s = this.masses[i][j].displacementProperty.get();
          const sRight = this.masses[i][j + 1].displacementProperty.get();
          const sUnder = this.masses[i + 1][j].displacementProperty.get();
          this.masses[i][j].accelerationProperty.set(sLeft.plus(sRight).plus(sAbove).plus(sUnder).subtract(s.timesScalar(4)).multiplyScalar(k / m));
          const v = this.masses[i][j].velocityProperty.get();
          const a = this.masses[i][j].accelerationProperty.get();
          const aLast = this.masses[i][j].previousAccelerationProperty.get();
          this.masses[i][j].velocityProperty.set(v.plus(a.plus(aLast).multiplyScalar(dt / 2)));
        } else {
          this.masses[i][j].accelerationProperty.set(new Vector2(0, 0));
          this.masses[i][j].velocityProperty.set(new Vector2(0, 0));
        }
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

    // The names of these arrays correspond to the formulas used to compute their values
    const amplitudeXTimesCos = [];
    const amplitudeYTimesCos = [];
    const frequencyTimesAmplitudeXTimesSin = [];
    const frequencyTimesAmplitudeYTimesSin = [];
    const frequencySquaredTimesAmplitudeXTimesCos = [];
    const frequencySquaredTimesAmplitudeYTimesCos = [];
    for (let r = 1; r <= N; ++r) {
      amplitudeXTimesCos[r] = [];
      amplitudeYTimesCos[r] = [];
      frequencyTimesAmplitudeXTimesSin[r] = [];
      frequencyTimesAmplitudeYTimesSin[r] = [];
      frequencySquaredTimesAmplitudeXTimesCos[r] = [];
      frequencySquaredTimesAmplitudeYTimesCos[r] = [];
      for (let s = 1; s <= N; ++s) {
        const modeAmplitudeX = this.modeXAmplitudeProperties[r - 1][s - 1].get();
        const modeAmplitudeY = this.modeYAmplitudeProperties[r - 1][s - 1].get();
        const modeFrequency = this.modeFrequencyProperties[r - 1][s - 1].get();
        const modePhaseX = this.modeXPhaseProperties[r - 1][s - 1].get();
        const modePhaseY = this.modeYPhaseProperties[r - 1][s - 1].get();
        const frequencyTimesTime = modeFrequency * this.timeProperty.get();
        const frequencyTimesTimeMinusPhaseX = frequencyTimesTime - modePhaseX;
        const frequencyTimesTimeMinusPhaseY = frequencyTimesTime - modePhaseY;

        // both values are used twice, so it's reasonable to calculate them here
        const frequencyTimesTimeMinusPhaseXCos = Math.cos(frequencyTimesTimeMinusPhaseX);
        const frequencyTimesTimeMinusPhaseYCos = Math.cos(frequencyTimesTimeMinusPhaseY);
        amplitudeXTimesCos[r][s] = modeAmplitudeX * frequencyTimesTimeMinusPhaseXCos;
        amplitudeYTimesCos[r][s] = modeAmplitudeY * frequencyTimesTimeMinusPhaseYCos;
        frequencyTimesAmplitudeXTimesSin[r][s] = -modeFrequency * modeAmplitudeX * Math.sin(frequencyTimesTimeMinusPhaseX);
        frequencyTimesAmplitudeYTimesSin[r][s] = -modeFrequency * modeAmplitudeY * Math.sin(frequencyTimesTimeMinusPhaseY);
        frequencySquaredTimesAmplitudeXTimesCos[r][s] = -(modeFrequency ** 2) * modeAmplitudeX * frequencyTimesTimeMinusPhaseXCos;
        frequencySquaredTimesAmplitudeYTimesCos[r][s] = -(modeFrequency ** 2) * modeAmplitudeY * frequencyTimesTimeMinusPhaseYCos;
      }
    }
    for (let i = 1; i <= N; ++i) {
      for (let j = 1; j <= N; ++j) {
        // for each mass

        const displacement = new Vector2(0, 0);
        const velocity = new Vector2(0, 0);
        const acceleration = new Vector2(0, 0);
        const sineProductMatrix = this.sineProduct[i][j];
        for (let r = 1; r <= N; ++r) {
          const sineProductArray = sineProductMatrix[r];
          for (let s = 1; s <= N; ++s) {
            // for each mode

            const sineProduct = sineProductArray[s];
            displacement.x += sineProduct * amplitudeXTimesCos[r][s];
            displacement.y -= sineProduct * amplitudeYTimesCos[r][s];
            velocity.x += sineProduct * frequencyTimesAmplitudeXTimesSin[r][s];
            velocity.y -= sineProduct * frequencyTimesAmplitudeYTimesSin[r][s];
            acceleration.x += sineProduct * frequencySquaredTimesAmplitudeXTimesCos[r][s];
            acceleration.y -= sineProduct * frequencySquaredTimesAmplitudeYTimesCos[r][s];
          }
        }
        this.masses[i][j].displacementProperty.set(displacement);
        this.masses[i][j].velocityProperty.set(velocity);
        this.masses[i][j].accelerationProperty.set(acceleration);
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
    for (let r = 1; r <= N; ++r) {
      for (let s = 1; s <= N; ++s) {
        // for each mode

        let AmplitudeTimesCosPhaseX = 0;
        let AmplitudeTimesSinPhaseX = 0;
        let AmplitudeTimesCosPhaseY = 0;
        let AmplitudeTimesSinPhaseY = 0;
        for (let i = 1; i <= N; ++i) {
          for (let j = 1; j <= N; ++j) {
            // for each mass

            const massDisplacement = this.masses[i][j].displacementProperty.get();
            const massVelocity = this.masses[i][j].velocityProperty.get();
            const modeFrequency = this.modeFrequencyProperties[r - 1][s - 1].get();
            const constantTimesSineProduct = 4 / ((N + 1) * (N + 1)) * this.sineProduct[i][j][r][s];
            AmplitudeTimesCosPhaseX += constantTimesSineProduct * massDisplacement.x;
            AmplitudeTimesCosPhaseY -= constantTimesSineProduct * massDisplacement.y;
            AmplitudeTimesSinPhaseX += constantTimesSineProduct / modeFrequency * massVelocity.x;
            AmplitudeTimesSinPhaseY -= constantTimesSineProduct / modeFrequency * massVelocity.y;
          }
        }
        this.modeXAmplitudeProperties[r - 1][s - 1].set(Math.sqrt(AmplitudeTimesCosPhaseX ** 2 + AmplitudeTimesSinPhaseX ** 2));
        this.modeYAmplitudeProperties[r - 1][s - 1].set(Math.sqrt(AmplitudeTimesCosPhaseY ** 2 + AmplitudeTimesSinPhaseY ** 2));
        this.modeXPhaseProperties[r - 1][s - 1].set(Math.atan2(AmplitudeTimesSinPhaseX, AmplitudeTimesCosPhaseX));
        this.modeYPhaseProperties[r - 1][s - 1].set(Math.atan2(AmplitudeTimesSinPhaseY, AmplitudeTimesCosPhaseY));
      }
    }
  }

  /**
   * Gets the indexes for a specified mass. This was moved here from MassNode2D.
   * @param {Mass} mass
   * @returns {{i: number, j: number}}
   * @public
   */
  getMassIndexes(mass) {
    let foundIndex = -1;
    let foundArray = null;
    for (let i = 0; i < this.masses.length; i++) {
      const array = this.masses[i];
      foundIndex = array.indexOf(mass);
      if (foundIndex !== -1) {
        foundArray = array;
        break;
      }
    }
    assert && assert(foundIndex !== -1);
    return {
      i: this.masses.indexOf(foundArray),
      j: foundIndex
    };
  }
}
normalModes.register('TwoDimensionsModel', TwoDimensionsModel);
export default TwoDimensionsModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiUmFuZ2UiLCJWZWN0b3IyIiwibWVyZ2UiLCJUYW5kZW0iLCJOdW1iZXJJTyIsIk1hc3MiLCJOb3JtYWxNb2Rlc01vZGVsIiwiU3ByaW5nIiwiTm9ybWFsTW9kZXNDb25zdGFudHMiLCJub3JtYWxNb2RlcyIsIk1BWF9NQVNTRVMiLCJNQVhfTUFTU0VTX1BFUl9ST1ciLCJNQVhfU1BSSU5HUyIsIlR3b0RpbWVuc2lvbnNNb2RlbCIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsInRhbmRlbSIsIlJFUVVJUkVEIiwibW9kZVhBbXBsaXR1ZGVQcm9wZXJ0aWVzIiwiQXJyYXkiLCJtb2RlWUFtcGxpdHVkZVByb3BlcnRpZXMiLCJtb2RlWFBoYXNlUHJvcGVydGllcyIsIm1vZGVZUGhhc2VQcm9wZXJ0aWVzIiwibW9kZUZyZXF1ZW5jeVByb3BlcnRpZXMiLCJpIiwiaiIsInRhbmRlbUluZGV4MSIsInRhbmRlbUluZGV4MiIsIklOSVRJQUxfQU1QTElUVURFIiwiY3JlYXRlVGFuZGVtIiwicmFuZ2UiLCJNSU5fQU1QTElUVURFIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJJTklUSUFMX1BIQVNFIiwiTUlOX1BIQVNFIiwiTUFYX1BIQVNFIiwibnVtYmVyT2ZNYXNzZXNQcm9wZXJ0eSIsIm51bWJlck1hc3NlcyIsImsiLCJTUFJJTkdfQ09OU1RBTlRfVkFMVUUiLCJtIiwiTUFTU0VTX01BU1NfVkFMVUUiLCJvbWVnYUkiLCJNYXRoIiwic3FydCIsInNpbiIsIlBJIiwib21lZ2FKIiwicGhldGlvVmFsdWVUeXBlIiwibWFzc2VzIiwiY3JlYXRlRGVmYXVsdE1hc3NlcyIsInNwcmluZ3NYIiwic3ByaW5nc1kiLCJjcmVhdGVEZWZhdWx0U3ByaW5ncyIsImRyYWdnaW5nTWFzc0luZGV4ZXNQcm9wZXJ0eSIsImxpbmsiLCJjaGFuZ2VkTnVtYmVyT2ZNYXNzZXMiLCJiaW5kIiwiYmFzZU1heEFtcGxpdHVkZSIsIm1heEFtcGxpdHVkZXMiLCJsZW5ndGgiLCJzcHJpbmdMZW5ndGgiLCJESVNUQU5DRV9CRVRXRUVOX1hfV0FMTFMiLCJtYXhBbXBsaXR1ZGVQcm9wZXJ0eSIsImNhbGN1bGF0ZVNpbmVQcm9kdWN0cyIsIk4iLCJzaW5lUHJvZHVjdCIsInIiLCJzIiwieCIsIkxFRlRfV0FMTF9YX1BPUyIsInhTdGVwIiwieEZpbmFsIiwieSIsIlRPUF9XQUxMX1lfUE9TIiwieVN0ZXAiLCJESVNUQU5DRV9CRVRXRUVOX1lfV0FMTFMiLCJ5RmluYWwiLCJ2aXNpYmxlIiwiZXF1aWxpYnJpdW1Qb3NpdGlvblByb3BlcnR5Iiwic2V0IiwidmlzaWJsZVByb3BlcnR5IiwiemVyb1Bvc2l0aW9uIiwicmVzZXROb3JtYWxNb2RlcyIsImRlZmF1bHRNYXNzZXNOdW1iZXIiLCJnZXQiLCJyZXNldCIsInplcm9Qb3NpdGlvbnMiLCJpbml0aWFsUG9zaXRpb25zIiwicGxheWluZ1Byb3BlcnR5IiwidGltZVByb3BlcnR5Iiwic2V0RXhhY3RQb3NpdGlvbnMiLCJzdGVwIiwiZHQiLCJtaW4iLCJGSVhFRF9EVCIsInNpbmdsZVN0ZXAiLCJ0aW1lU2NhbGVQcm9wZXJ0eSIsInNldFZlcmxldFBvc2l0aW9ucyIsImRyYWdnaW5nIiwiZGlzcGxhY2VtZW50UHJvcGVydHkiLCJ2IiwidmVsb2NpdHlQcm9wZXJ0eSIsImEiLCJhY2NlbGVyYXRpb25Qcm9wZXJ0eSIsImRpc3BsYWNlbWVudCIsInBsdXMiLCJ0aW1lc1NjYWxhciIsImFkZCIsInByZXZpb3VzQWNjZWxlcmF0aW9uUHJvcGVydHkiLCJyZWNhbGN1bGF0ZVZlbG9jaXR5QW5kQWNjZWxlcmF0aW9uIiwic0xlZnQiLCJzQWJvdmUiLCJzUmlnaHQiLCJzVW5kZXIiLCJzdWJ0cmFjdCIsIm11bHRpcGx5U2NhbGFyIiwiYUxhc3QiLCJhbXBsaXR1ZGVYVGltZXNDb3MiLCJhbXBsaXR1ZGVZVGltZXNDb3MiLCJmcmVxdWVuY3lUaW1lc0FtcGxpdHVkZVhUaW1lc1NpbiIsImZyZXF1ZW5jeVRpbWVzQW1wbGl0dWRlWVRpbWVzU2luIiwiZnJlcXVlbmN5U3F1YXJlZFRpbWVzQW1wbGl0dWRlWFRpbWVzQ29zIiwiZnJlcXVlbmN5U3F1YXJlZFRpbWVzQW1wbGl0dWRlWVRpbWVzQ29zIiwibW9kZUFtcGxpdHVkZVgiLCJtb2RlQW1wbGl0dWRlWSIsIm1vZGVGcmVxdWVuY3kiLCJtb2RlUGhhc2VYIiwibW9kZVBoYXNlWSIsImZyZXF1ZW5jeVRpbWVzVGltZSIsImZyZXF1ZW5jeVRpbWVzVGltZU1pbnVzUGhhc2VYIiwiZnJlcXVlbmN5VGltZXNUaW1lTWludXNQaGFzZVkiLCJmcmVxdWVuY3lUaW1lc1RpbWVNaW51c1BoYXNlWENvcyIsImNvcyIsImZyZXF1ZW5jeVRpbWVzVGltZU1pbnVzUGhhc2VZQ29zIiwidmVsb2NpdHkiLCJhY2NlbGVyYXRpb24iLCJzaW5lUHJvZHVjdE1hdHJpeCIsInNpbmVQcm9kdWN0QXJyYXkiLCJjb21wdXRlTW9kZUFtcGxpdHVkZXNBbmRQaGFzZXMiLCJBbXBsaXR1ZGVUaW1lc0Nvc1BoYXNlWCIsIkFtcGxpdHVkZVRpbWVzU2luUGhhc2VYIiwiQW1wbGl0dWRlVGltZXNDb3NQaGFzZVkiLCJBbXBsaXR1ZGVUaW1lc1NpblBoYXNlWSIsIm1hc3NEaXNwbGFjZW1lbnQiLCJtYXNzVmVsb2NpdHkiLCJjb25zdGFudFRpbWVzU2luZVByb2R1Y3QiLCJhdGFuMiIsImdldE1hc3NJbmRleGVzIiwibWFzcyIsImZvdW5kSW5kZXgiLCJmb3VuZEFycmF5IiwiYXJyYXkiLCJpbmRleE9mIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUd29EaW1lbnNpb25zTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIG1vZGVsIGZvciB0aGUgJ1R3byBEaW1lbnNpb25zJyBTY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgVGhpYWdvIGRlIE1lbmRvbsOnYSBNaWxkZW1iZXJnZXIgKFVURlBSKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBOdW1iZXJJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVtYmVySU8uanMnO1xyXG5pbXBvcnQgTWFzcyBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvTWFzcy5qcyc7XHJcbmltcG9ydCBOb3JtYWxNb2Rlc01vZGVsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Ob3JtYWxNb2Rlc01vZGVsLmpzJztcclxuaW1wb3J0IFNwcmluZyBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvU3ByaW5nLmpzJztcclxuaW1wb3J0IE5vcm1hbE1vZGVzQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9Ob3JtYWxNb2Rlc0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBub3JtYWxNb2RlcyBmcm9tICcuLi8uLi9ub3JtYWxNb2Rlcy5qcyc7XHJcblxyXG5jb25zdCBNQVhfTUFTU0VTID0gTm9ybWFsTW9kZXNDb25zdGFudHMuTUFYX01BU1NFU19QRVJfUk9XICsgMjtcclxuY29uc3QgTUFYX1NQUklOR1MgPSBNQVhfTUFTU0VTIC0gMTtcclxuXHJcbmNsYXNzIFR3b0RpbWVuc2lvbnNNb2RlbCBleHRlbmRzIE5vcm1hbE1vZGVzTW9kZWwge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtOdW1iZXJQcm9wZXJ0eVtdW119IDItZGltZW5zaW9uYWwgYXJyYXlzIG9mIFByb3BlcnRpZXMgZm9yIGVhY2ggbW9kZVxyXG4gICAgdGhpcy5tb2RlWEFtcGxpdHVkZVByb3BlcnRpZXMgPSBuZXcgQXJyYXkoIE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BWF9NQVNTRVNfUEVSX1JPVyApO1xyXG4gICAgdGhpcy5tb2RlWUFtcGxpdHVkZVByb3BlcnRpZXMgPSBuZXcgQXJyYXkoIE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BWF9NQVNTRVNfUEVSX1JPVyApO1xyXG4gICAgdGhpcy5tb2RlWFBoYXNlUHJvcGVydGllcyA9IG5ldyBBcnJheSggTm9ybWFsTW9kZXNDb25zdGFudHMuTUFYX01BU1NFU19QRVJfUk9XICk7XHJcbiAgICB0aGlzLm1vZGVZUGhhc2VQcm9wZXJ0aWVzID0gbmV3IEFycmF5KCBOb3JtYWxNb2Rlc0NvbnN0YW50cy5NQVhfTUFTU0VTX1BFUl9ST1cgKTtcclxuICAgIHRoaXMubW9kZUZyZXF1ZW5jeVByb3BlcnRpZXMgPSBuZXcgQXJyYXkoIE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BWF9NQVNTRVNfUEVSX1JPVyApO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BWF9NQVNTRVNfUEVSX1JPVzsgaSsrICkge1xyXG5cclxuICAgICAgdGhpcy5tb2RlWEFtcGxpdHVkZVByb3BlcnRpZXNbIGkgXSA9IG5ldyBBcnJheSggTm9ybWFsTW9kZXNDb25zdGFudHMuTUFYX01BU1NFU19QRVJfUk9XICk7XHJcbiAgICAgIHRoaXMubW9kZVlBbXBsaXR1ZGVQcm9wZXJ0aWVzWyBpIF0gPSBuZXcgQXJyYXkoIE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BWF9NQVNTRVNfUEVSX1JPVyApO1xyXG4gICAgICB0aGlzLm1vZGVYUGhhc2VQcm9wZXJ0aWVzWyBpIF0gPSBuZXcgQXJyYXkoIE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BWF9NQVNTRVNfUEVSX1JPVyApO1xyXG4gICAgICB0aGlzLm1vZGVZUGhhc2VQcm9wZXJ0aWVzWyBpIF0gPSBuZXcgQXJyYXkoIE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BWF9NQVNTRVNfUEVSX1JPVyApO1xyXG4gICAgICB0aGlzLm1vZGVGcmVxdWVuY3lQcm9wZXJ0aWVzWyBpIF0gPSBuZXcgQXJyYXkoIE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BWF9NQVNTRVNfUEVSX1JPVyApO1xyXG5cclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgTm9ybWFsTW9kZXNDb25zdGFudHMuTUFYX01BU1NFU19QRVJfUk9XOyArK2ogKSB7XHJcblxyXG4gICAgICAgIC8vIFVzZSAxLWJhc2VkIGluZGV4aW5nIGZvciB0aGUgdGFuZGVtIG5hbWVzLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25vcm1hbC1tb2Rlcy9pc3N1ZXMvNTVcclxuICAgICAgICBjb25zdCB0YW5kZW1JbmRleDEgPSBpICsgMTtcclxuICAgICAgICBjb25zdCB0YW5kZW1JbmRleDIgPSBqICsgMTtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlWEFtcGxpdHVkZVByb3BlcnRpZXNbIGkgXVsgaiBdID0gbmV3IE51bWJlclByb3BlcnR5KCBOb3JtYWxNb2Rlc0NvbnN0YW50cy5JTklUSUFMX0FNUExJVFVERSwge1xyXG4gICAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oIGBtb2RlWEFtcGxpdHVkZVske3RhbmRlbUluZGV4MX0sJHt0YW5kZW1JbmRleDJ9XVByb3BlcnR5YCApLFxyXG4gICAgICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggTm9ybWFsTW9kZXNDb25zdGFudHMuTUlOX0FNUExJVFVERSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIClcclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIHRoaXMubW9kZVlBbXBsaXR1ZGVQcm9wZXJ0aWVzWyBpIF1bIGogXSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggTm9ybWFsTW9kZXNDb25zdGFudHMuSU5JVElBTF9BTVBMSVRVREUsIHtcclxuICAgICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCBgbW9kZVlBbXBsaXR1ZGVbJHt0YW5kZW1JbmRleDF9LCR7dGFuZGVtSW5kZXgyfV1Qcm9wZXJ0eWAgKSxcclxuICAgICAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1JTl9BTVBMSVRVREUsIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSApXHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICB0aGlzLm1vZGVYUGhhc2VQcm9wZXJ0aWVzWyBpIF1bIGogXSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggTm9ybWFsTW9kZXNDb25zdGFudHMuSU5JVElBTF9QSEFTRSwge1xyXG4gICAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oIGBtb2RlWFBoYXNlWyR7dGFuZGVtSW5kZXgxfSwke3RhbmRlbUluZGV4Mn1dUHJvcGVydHlgICksXHJcbiAgICAgICAgICByYW5nZTogbmV3IFJhbmdlKCBOb3JtYWxNb2Rlc0NvbnN0YW50cy5NSU5fUEhBU0UsIE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BWF9QSEFTRSApXHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICB0aGlzLm1vZGVZUGhhc2VQcm9wZXJ0aWVzWyBpIF1bIGogXSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggTm9ybWFsTW9kZXNDb25zdGFudHMuSU5JVElBTF9QSEFTRSwge1xyXG4gICAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oIGBtb2RlWVBoYXNlWyR7dGFuZGVtSW5kZXgxfSwke3RhbmRlbUluZGV4Mn1dUHJvcGVydHlgICksXHJcbiAgICAgICAgICByYW5nZTogbmV3IFJhbmdlKCBOb3JtYWxNb2Rlc0NvbnN0YW50cy5NSU5fUEhBU0UsIE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BWF9QSEFTRSApXHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAvLyBkaXNwb3NlIGlzIHVubmVjZXNzYXJ5LCBzaW5jZSB0aGlzIGNsYXNzIG93bnMgdGhlIGRlcGVuZGVuY3lcclxuICAgICAgICB0aGlzLm1vZGVGcmVxdWVuY3lQcm9wZXJ0aWVzWyBpIF1bIGogXSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5udW1iZXJPZk1hc3Nlc1Byb3BlcnR5IF0sXHJcbiAgICAgICAgICBudW1iZXJNYXNzZXMgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBrID0gTm9ybWFsTW9kZXNDb25zdGFudHMuU1BSSU5HX0NPTlNUQU5UX1ZBTFVFO1xyXG4gICAgICAgICAgICBjb25zdCBtID0gTm9ybWFsTW9kZXNDb25zdGFudHMuTUFTU0VTX01BU1NfVkFMVUU7XHJcbiAgICAgICAgICAgIGlmICggaSA+PSBudW1iZXJNYXNzZXMgfHwgaiA+PSBudW1iZXJNYXNzZXMgKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgY29uc3Qgb21lZ2FJID0gMiAqIE1hdGguc3FydCggayAvIG0gKSAqIE1hdGguc2luKCBNYXRoLlBJIC8gMiAqICggaSArIDEgKSAvICggbnVtYmVyTWFzc2VzICsgMSApICk7XHJcbiAgICAgICAgICAgICAgY29uc3Qgb21lZ2FKID0gMiAqIE1hdGguc3FydCggayAvIG0gKSAqIE1hdGguc2luKCBNYXRoLlBJIC8gMiAqICggaiArIDEgKSAvICggbnVtYmVyTWFzc2VzICsgMSApICk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCggb21lZ2FJICoqIDIgKyBvbWVnYUogKiogMiApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggYG1vZGVGcmVxdWVuY3lbJHt0YW5kZW1JbmRleDF9LCR7dGFuZGVtSW5kZXgyfV1Qcm9wZXJ0eWAgKSxcclxuICAgICAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdW1iZXJJT1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHVibGljIHtNYXNzW11bXX0gMi1kaW1lbnNpb25hbCBhcnJheSB0aGF0IHdpbGwgY29udGFpbiBhbGwgb2YgdGhlIG1hc3Nlcy5cclxuICAgIHRoaXMubWFzc2VzID0gbmV3IEFycmF5KCBNQVhfTUFTU0VTICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBNQVhfTUFTU0VTOyArK2kgKSB7XHJcbiAgICAgIHRoaXMubWFzc2VzWyBpIF0gPSBuZXcgQXJyYXkoIE1BWF9NQVNTRVMgKTtcclxuICAgIH1cclxuICAgIHRoaXMuY3JlYXRlRGVmYXVsdE1hc3Nlcyggb3B0aW9ucy50YW5kZW0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtTcHJpbmdbXVtdfSAyLWRpbWVuc2lvbmFsIGFycmF5IHRoYXQgd2lsbCBjb250YWluIGFsbCBvZiB0aGUgc3ByaW5ncy5cclxuICAgIHRoaXMuc3ByaW5nc1ggPSBuZXcgQXJyYXkoIE1BWF9TUFJJTkdTICk7XHJcbiAgICB0aGlzLnNwcmluZ3NZID0gbmV3IEFycmF5KCBNQVhfU1BSSU5HUyApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgTUFYX1NQUklOR1M7ICsraSApIHtcclxuICAgICAgdGhpcy5zcHJpbmdzWFsgaSBdID0gbmV3IEFycmF5KCBNQVhfU1BSSU5HUyApO1xyXG4gICAgICB0aGlzLnNwcmluZ3NZWyBpIF0gPSBuZXcgQXJyYXkoIE1BWF9TUFJJTkdTICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmNyZWF0ZURlZmF1bHRTcHJpbmdzKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcltdfG51bGw+fSB0aGUgaW5kZXhlcyBvZiB0aGUgbWFzcyBiZWluZyBkcmFnZ2VkIChhbiBvYmplY3Qgd2l0aCBhbmQgJ2knIGFuZCBhICdqJylcclxuICAgIHRoaXMuZHJhZ2dpbmdNYXNzSW5kZXhlc1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBudWxsLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ2dpbmdNYXNzSW5kZXhlc1Byb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdW5saW5rIGlzIHVubmVjZXNzYXJ5LCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltXHJcbiAgICB0aGlzLm51bWJlck9mTWFzc2VzUHJvcGVydHkubGluayggdGhpcy5jaGFuZ2VkTnVtYmVyT2ZNYXNzZXMuYmluZCggdGhpcyApICk7XHJcblxyXG4gICAgLy8gVGhpcyBpcyB0aGUgd2F5IHRoZSBvcmlnaW5hbCBGbGFzaCBzaW0gZG9lcyB0aGlzLlxyXG4gICAgLy8gVGhlIG1heGltdW0gcmFuZ2Ugd2lsbCBiZSBbMCxiYXNlTWF4QW1wbGl0dWRlXSBmb3IgMSBtYXNzLlxyXG4gICAgY29uc3QgYmFzZU1heEFtcGxpdHVkZSA9IDAuMztcclxuICAgIGNvbnN0IG1heEFtcGxpdHVkZXMgPSBuZXcgQXJyYXkoIE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BWF9NQVNTRVNfUEVSX1JPVyApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbWF4QW1wbGl0dWRlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3Qgc3ByaW5nTGVuZ3RoID0gTm9ybWFsTW9kZXNDb25zdGFudHMuRElTVEFOQ0VfQkVUV0VFTl9YX1dBTExTIC8gKCBpICsgMiApO1xyXG4gICAgICBtYXhBbXBsaXR1ZGVzWyBpIF0gPSBiYXNlTWF4QW1wbGl0dWRlICogc3ByaW5nTGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMubWF4QW1wbGl0dWRlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMubnVtYmVyT2ZNYXNzZXNQcm9wZXJ0eSBdLFxyXG4gICAgICBudW1iZXJNYXNzZXMgPT4gbWF4QW1wbGl0dWRlc1sgbnVtYmVyTWFzc2VzIC0gMSBdXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsY3VsYXRlcyB0aGUgc2luZSBwcm9kdWN0cy5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyTWFzc2VzIC0gdGhlIGN1cnJlbnQgbnVtYmVyIG9mIHZpc2libGUgbWFzc2VzIGluIHRoZSBzaW11bGF0aW9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjYWxjdWxhdGVTaW5lUHJvZHVjdHMoIG51bWJlck1hc3NlcyApIHtcclxuICAgIGNvbnN0IE4gPSBudW1iZXJNYXNzZXM7XHJcbiAgICB0aGlzLnNpbmVQcm9kdWN0ID0gW107XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAxOyBpIDw9IE47ICsraSApIHtcclxuICAgICAgdGhpcy5zaW5lUHJvZHVjdFsgaSBdID0gW107XHJcbiAgICAgIGZvciAoIGxldCBqID0gMTsgaiA8PSBOOyArK2ogKSB7XHJcbiAgICAgICAgdGhpcy5zaW5lUHJvZHVjdFsgaSBdWyBqIF0gPSBbXTtcclxuXHJcbiAgICAgICAgZm9yICggbGV0IHIgPSAxOyByIDw9IE47ICsrciApIHtcclxuICAgICAgICAgIHRoaXMuc2luZVByb2R1Y3RbIGkgXVsgaiBdWyByIF0gPSBbXTtcclxuXHJcbiAgICAgICAgICAvLyBubyBuZWVkIHRvIHJlY2FsY3VsYXRlIHRoaXMgZm9yIGVhY2ggJ3MnXHJcbiAgICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbiggaiAqIHIgKiBNYXRoLlBJIC8gKCBOICsgMSApICk7XHJcblxyXG4gICAgICAgICAgZm9yICggbGV0IHMgPSAxOyBzIDw9IE47ICsrcyApIHtcclxuICAgICAgICAgICAgdGhpcy5zaW5lUHJvZHVjdFsgaSBdWyBqIF1bIHIgXVsgcyBdID0gc2luICogTWF0aC5zaW4oIGkgKiBzICogTWF0aC5QSSAvICggTiArIDEgKSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBNQVhfTUFTU0VTIG1hc3NlcyBpbiB0aGUgY29ycmVjdCBwb3NpdGlvbnMuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bWJlck1hc3NlcyAtIHRoZSBjdXJyZW50IG51bWJlciBvZiB2aXNpYmxlIG1hc3NlcyBpbiB0aGUgc2ltdWxhdGlvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgY2hhbmdlZE51bWJlck9mTWFzc2VzKCBudW1iZXJNYXNzZXMgKSB7XHJcblxyXG4gICAgbGV0IHggPSBOb3JtYWxNb2Rlc0NvbnN0YW50cy5MRUZUX1dBTExfWF9QT1M7XHJcbiAgICBjb25zdCB4U3RlcCA9IE5vcm1hbE1vZGVzQ29uc3RhbnRzLkRJU1RBTkNFX0JFVFdFRU5fWF9XQUxMUyAvICggbnVtYmVyTWFzc2VzICsgMSApO1xyXG4gICAgY29uc3QgeEZpbmFsID0gTm9ybWFsTW9kZXNDb25zdGFudHMuTEVGVF9XQUxMX1hfUE9TICsgTm9ybWFsTW9kZXNDb25zdGFudHMuRElTVEFOQ0VfQkVUV0VFTl9YX1dBTExTO1xyXG5cclxuICAgIGxldCB5ID0gTm9ybWFsTW9kZXNDb25zdGFudHMuVE9QX1dBTExfWV9QT1M7XHJcbiAgICBjb25zdCB5U3RlcCA9IE5vcm1hbE1vZGVzQ29uc3RhbnRzLkRJU1RBTkNFX0JFVFdFRU5fWV9XQUxMUyAvICggbnVtYmVyTWFzc2VzICsgMSApO1xyXG4gICAgY29uc3QgeUZpbmFsID0gTm9ybWFsTW9kZXNDb25zdGFudHMuVE9QX1dBTExfWV9QT1MgLSBOb3JtYWxNb2Rlc0NvbnN0YW50cy5ESVNUQU5DRV9CRVRXRUVOX1lfV0FMTFM7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgTUFYX01BU1NFUzsgaSsrICkge1xyXG4gICAgICB4ID0gTm9ybWFsTW9kZXNDb25zdGFudHMuTEVGVF9XQUxMX1hfUE9TO1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBNQVhfTUFTU0VTOyArK2ogKSB7XHJcbiAgICAgICAgY29uc3QgdmlzaWJsZSA9ICggaSA8PSBudW1iZXJNYXNzZXMgJiYgaiA8PSBudW1iZXJNYXNzZXMgKTtcclxuXHJcbiAgICAgICAgdGhpcy5tYXNzZXNbIGkgXVsgaiBdLmVxdWlsaWJyaXVtUG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCB4LCB5ICkgKTtcclxuICAgICAgICB0aGlzLm1hc3Nlc1sgaSBdWyBqIF0udmlzaWJsZVByb3BlcnR5LnNldCggdmlzaWJsZSApO1xyXG4gICAgICAgIHRoaXMubWFzc2VzWyBpIF1bIGogXS56ZXJvUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgaWYgKCB4IDwgeEZpbmFsIC0geFN0ZXAgLyAyICkge1xyXG4gICAgICAgICAgeCArPSB4U3RlcDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcbiAgICAgIGlmICggeSA+IHlGaW5hbCArIHlTdGVwIC8gMiApIHtcclxuICAgICAgICB5IC09IHlTdGVwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jYWxjdWxhdGVTaW5lUHJvZHVjdHMoIG51bWJlck1hc3NlcyApO1xyXG4gICAgdGhpcy5yZXNldE5vcm1hbE1vZGVzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIE1BWF9NQVNTRVMgbWFzc2VzIGluIHRoZSBjb3JyZWN0IHBvc2l0aW9ucy5cclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjcmVhdGVEZWZhdWx0TWFzc2VzKCB0YW5kZW0gKSB7XHJcbiAgICBjb25zdCBkZWZhdWx0TWFzc2VzTnVtYmVyID0gdGhpcy5udW1iZXJPZk1hc3Nlc1Byb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIGxldCB4ID0gTm9ybWFsTW9kZXNDb25zdGFudHMuTEVGVF9XQUxMX1hfUE9TO1xyXG4gICAgY29uc3QgeFN0ZXAgPSBOb3JtYWxNb2Rlc0NvbnN0YW50cy5ESVNUQU5DRV9CRVRXRUVOX1hfV0FMTFMgLyAoIGRlZmF1bHRNYXNzZXNOdW1iZXIgKyAxICk7XHJcbiAgICBjb25zdCB4RmluYWwgPSBOb3JtYWxNb2Rlc0NvbnN0YW50cy5MRUZUX1dBTExfWF9QT1MgKyBOb3JtYWxNb2Rlc0NvbnN0YW50cy5ESVNUQU5DRV9CRVRXRUVOX1hfV0FMTFM7XHJcblxyXG4gICAgbGV0IHkgPSBOb3JtYWxNb2Rlc0NvbnN0YW50cy5UT1BfV0FMTF9ZX1BPUztcclxuICAgIGNvbnN0IHlTdGVwID0gTm9ybWFsTW9kZXNDb25zdGFudHMuRElTVEFOQ0VfQkVUV0VFTl9ZX1dBTExTIC8gKCBkZWZhdWx0TWFzc2VzTnVtYmVyICsgMSApO1xyXG4gICAgY29uc3QgeUZpbmFsID0gTm9ybWFsTW9kZXNDb25zdGFudHMuVE9QX1dBTExfWV9QT1MgKyBOb3JtYWxNb2Rlc0NvbnN0YW50cy5ESVNUQU5DRV9CRVRXRUVOX1lfV0FMTFM7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgTUFYX01BU1NFUzsgaSsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBNQVhfTUFTU0VTOyArK2ogKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpc2libGUgPSAoIGkgPD0gZGVmYXVsdE1hc3Nlc051bWJlciAmJiBqIDw9IGRlZmF1bHRNYXNzZXNOdW1iZXIgKTtcclxuXHJcbiAgICAgICAgLy8gQWxsIHRoZSBtYXNzZXMgbmVlZGVkIGFyZSBjcmVhdGVkIGF0IG9uY2UsIGFuZCBleGlzdCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0uXHJcbiAgICAgICAgLy8gVXNlIDEtYmFzZWQgaW5kZXhpbmcgZm9yIHRoZSB0YW5kZW0gbmFtZXMuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbm9ybWFsLW1vZGVzL2lzc3Vlcy81NVxyXG4gICAgICAgIHRoaXMubWFzc2VzWyBpIF1bIGogXSA9IG5ldyBNYXNzKFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIHgsIHkgKSxcclxuICAgICAgICAgIHZpc2libGUsXHJcbiAgICAgICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCBgbWFzc1ske2kgKyAxfSwke2ogKyAxfV1gIClcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIHggPCB4RmluYWwgLSB4U3RlcCAvIDIgKSB7XHJcbiAgICAgICAgICB4ICs9IHhTdGVwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuICAgICAgaWYgKCB5IDwgeUZpbmFsIC0geVN0ZXAgLyAyICkge1xyXG4gICAgICAgIHkgKz0geVN0ZXA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuY2FsY3VsYXRlU2luZVByb2R1Y3RzKCBkZWZhdWx0TWFzc2VzTnVtYmVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIE1BWF9TUFJJTkdTIHNwcmluZ3MsIGNvbm5lY3RpbmcgdG8gdGhlIGNvcnJlY3QgbWFzc2VzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjcmVhdGVEZWZhdWx0U3ByaW5ncygpIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IE1BWF9TUFJJTkdTOyBpKysgKSB7XHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IE1BWF9TUFJJTkdTOyArK2ogKSB7XHJcblxyXG4gICAgICAgIC8vIEFsbCB0aGUgc3ByaW5ncyBuZWVkZWQgYXJlIGNyZWF0ZWQgYXQgb25jZSwgYW5kIGV4aXN0IGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbVxyXG4gICAgICAgIGlmICggaSAhPT0gTUFYX1NQUklOR1MgLSAxICkge1xyXG4gICAgICAgICAgdGhpcy5zcHJpbmdzWFsgaSBdWyBqIF0gPSBuZXcgU3ByaW5nKCB0aGlzLm1hc3Nlc1sgaSArIDEgXVsgaiBdLCB0aGlzLm1hc3Nlc1sgaSArIDEgXVsgaiArIDEgXSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCBqICE9PSBNQVhfU1BSSU5HUyAtIDEgKSB7XHJcbiAgICAgICAgICB0aGlzLnNwcmluZ3NZWyBpIF1bIGogXSA9IG5ldyBTcHJpbmcoIHRoaXMubWFzc2VzWyBpIF1bIGogKyAxIF0sIHRoaXMubWFzc2VzWyBpICsgMSBdWyBqICsgMSBdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIG5vcm1hbCBtb2RlcycgYW1wbGl0dWRlIGFuZCBwaGFzZS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXROb3JtYWxNb2RlcygpIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BWF9NQVNTRVNfUEVSX1JPVzsgaSsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBOb3JtYWxNb2Rlc0NvbnN0YW50cy5NQVhfTUFTU0VTX1BFUl9ST1c7IGorKyApIHtcclxuICAgICAgICB0aGlzLm1vZGVYQW1wbGl0dWRlUHJvcGVydGllc1sgaSBdWyBqIF0ucmVzZXQoKTtcclxuICAgICAgICB0aGlzLm1vZGVZQW1wbGl0dWRlUHJvcGVydGllc1sgaSBdWyBqIF0ucmVzZXQoKTtcclxuICAgICAgICB0aGlzLm1vZGVYUGhhc2VQcm9wZXJ0aWVzWyBpIF1bIGogXS5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMubW9kZVlQaGFzZVByb3BlcnRpZXNbIGkgXVsgaiBdLnJlc2V0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgbW9kZWwuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuICAgIHRoaXMuZHJhZ2dpbmdNYXNzSW5kZXhlc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnplcm9Qb3NpdGlvbnMoKTsgLy8gdGhlIGFtcGxpdHVkZXMgYW5kIHBoYXNlcyBhcmUgcmVzZXQgYmVjYXVzZSBvZiB6ZXJvUG9zaXRpb25zXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIG1hc3NlcyB0byB0aGUgaW5pdGlhbCBwb3NpdGlvbi4gVGhlIHNpbSBpcyBwYXVzZWQgYW5kIHRoZSB0aW1lIGlzIHNldCB0byAwLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBpbml0aWFsUG9zaXRpb25zKCkge1xyXG4gICAgdGhpcy5wbGF5aW5nUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgdGhpcy50aW1lUHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICB0aGlzLnNldEV4YWN0UG9zaXRpb25zKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBaZXJvZXMgdGhlIG1hc3NlcycgcG9zaXRpb25zLiBUaGUgc2ltIGlzIG5vdCBwYXVzZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHplcm9Qb3NpdGlvbnMoKSB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBNQVhfTUFTU0VTOyBpKysgKSB7XHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IE1BWF9NQVNTRVM7IGorKyApIHtcclxuICAgICAgICB0aGlzLm1hc3Nlc1sgaSBdWyBqIF0uemVyb1Bvc2l0aW9uKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlc2V0Tm9ybWFsTW9kZXMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIHRoZSBtb2RlbC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSB0aW1lIHN0ZXAsIGluIHNlY29uZHNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcbiAgICAvLyBJZiB0aGUgdGltZSBzdGVwID4gMC4xNSwgaWdub3JlIGl0IC0gaXQgcHJvYmFibHkgbWVhbnMgdGhlIHVzZXIgcmV0dXJuZWQgdG8gdGhlIHRhYiBhZnRlclxyXG4gICAgLy8gdGhlIHRhYiBvciB0aGUgYnJvd3NlciB3YXMgaGlkZGVuIGZvciBhIHdoaWxlLlxyXG4gICAgZHQgPSBNYXRoLm1pbiggZHQsIDAuMTUgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMucGxheWluZ1Byb3BlcnR5LmdldCgpICkge1xyXG4gICAgICB0aGlzLmR0ICs9IGR0O1xyXG5cclxuICAgICAgd2hpbGUgKCB0aGlzLmR0ID49IE5vcm1hbE1vZGVzQ29uc3RhbnRzLkZJWEVEX0RUICkge1xyXG4gICAgICAgIHRoaXMuZHQgLT0gTm9ybWFsTW9kZXNDb25zdGFudHMuRklYRURfRFQ7XHJcbiAgICAgICAgdGhpcy5zaW5nbGVTdGVwKCBOb3JtYWxNb2Rlc0NvbnN0YW50cy5GSVhFRF9EVCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5kcmFnZ2luZ01hc3NJbmRleGVzUHJvcGVydHkuZ2V0KCkgPT09IG51bGwgKSB7XHJcbiAgICAgIC8vIEV2ZW4gaWYgdGhlIHNpbSBpcyBwYXVzZWQsIGNoYW5naW5nIHRoZSBhbXBsaXR1ZGUgZGlyZWN0aW9uIG9yIHRoZSBhbXBsaXR1ZGVzXHJcbiAgICAgIC8vIGFuZCBwaGFzZXMgc2hvdWxkIG1vdmUgdGhlIG1hc3Nlc1xyXG5cclxuICAgICAgdGhpcy5zZXRFeGFjdFBvc2l0aW9ucygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcHMgdGhlIG1vZGVsIHdpdGggYSBnaXZlbiBkdC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSB0aW1lIHN0ZXAsIGluIHNlY29uZHNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2luZ2xlU3RlcCggZHQgKSB7XHJcbiAgICBkdCAqPSB0aGlzLnRpbWVTY2FsZVByb3BlcnR5LmdldCgpO1xyXG4gICAgdGhpcy50aW1lUHJvcGVydHkuc2V0KCB0aGlzLnRpbWVQcm9wZXJ0eS5nZXQoKSArIGR0ICk7XHJcbiAgICBpZiAoIHRoaXMuZHJhZ2dpbmdNYXNzSW5kZXhlc1Byb3BlcnR5LmdldCgpICE9PSBudWxsICkge1xyXG4gICAgICB0aGlzLnNldFZlcmxldFBvc2l0aW9ucyggZHQgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnNldEV4YWN0UG9zaXRpb25zKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgcG9zaXRpb25zIG9mIG1hc3NlcyBhdCBuZXh0IHRpbWUgc3RlcCwgdXNpbmcgVmVsb2NpdHkgVmVybGV0IGFsZ29yaXRobS5cclxuICAgKiBOZWVkZWQgd2hlbiB1c2VyIGhhcyBncmFiYmVkIG1hc3Mgd2l0aCBtb3VzZSwgbWFraW5nIGV4YWN0IGNhbGN1bGF0aW9uIG9mIHBvc2l0aW9ucyBpbXBvc3NpYmxlLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc2V0VmVybGV0UG9zaXRpb25zKCBkdCApIHtcclxuICAgIGNvbnN0IE4gPSB0aGlzLm51bWJlck9mTWFzc2VzUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPD0gTjsgKytpICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDE7IGogPD0gTjsgKytqICkge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gdGhpcy5kcmFnZ2luZ01hc3NJbmRleGVzUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgaWYgKCAhZHJhZ2dpbmcgfHwgZHJhZ2dpbmcuaSAhPT0gaSB8fCBkcmFnZ2luZy5qICE9PSBqICkge1xyXG5cclxuICAgICAgICAgIGNvbnN0IHggPSB0aGlzLm1hc3Nlc1sgaSBdWyBqIF0uZGlzcGxhY2VtZW50UHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgICBjb25zdCB2ID0gdGhpcy5tYXNzZXNbIGkgXVsgaiBdLnZlbG9jaXR5UHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgICBjb25zdCBhID0gdGhpcy5tYXNzZXNbIGkgXVsgaiBdLmFjY2VsZXJhdGlvblByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGRpc3BsYWNlbWVudCA9IHgucGx1cyggdi50aW1lc1NjYWxhciggZHQgKSApLmFkZCggYS50aW1lc1NjYWxhciggZHQgKiBkdCAvIDIgKSApO1xyXG4gICAgICAgICAgdGhpcy5tYXNzZXNbIGkgXVsgaiBdLmRpc3BsYWNlbWVudFByb3BlcnR5LnNldCggZGlzcGxhY2VtZW50ICk7XHJcbiAgICAgICAgICB0aGlzLm1hc3Nlc1sgaSBdWyBqIF0ucHJldmlvdXNBY2NlbGVyYXRpb25Qcm9wZXJ0eS5zZXQoIGEgKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZWNhbGN1bGF0ZVZlbG9jaXR5QW5kQWNjZWxlcmF0aW9uKCBkdCApO1xyXG5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB2ZWxvY2l0eSBhbmQgYWNjZWxlcmF0aW9uLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcmVjYWxjdWxhdGVWZWxvY2l0eUFuZEFjY2VsZXJhdGlvbiggZHQgKSB7XHJcbiAgICBjb25zdCBOID0gdGhpcy5udW1iZXJPZk1hc3Nlc1Byb3BlcnR5LmdldCgpO1xyXG4gICAgZm9yICggbGV0IGkgPSAxOyBpIDw9IE47ICsraSApIHtcclxuICAgICAgZm9yICggbGV0IGogPSAxOyBqIDw9IE47ICsraiApIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IHRoaXMuZHJhZ2dpbmdNYXNzSW5kZXhlc1Byb3BlcnR5LmdldCgpO1xyXG4gICAgICAgIGlmICggIWRyYWdnaW5nIHx8IGRyYWdnaW5nLmkgIT09IGkgfHwgZHJhZ2dpbmcuaiAhPT0gaiApIHtcclxuXHJcbiAgICAgICAgICBjb25zdCBrID0gTm9ybWFsTW9kZXNDb25zdGFudHMuU1BSSU5HX0NPTlNUQU5UX1ZBTFVFO1xyXG4gICAgICAgICAgY29uc3QgbSA9IE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BU1NFU19NQVNTX1ZBTFVFO1xyXG4gICAgICAgICAgY29uc3Qgc0xlZnQgPSB0aGlzLm1hc3Nlc1sgaSBdWyBqIC0gMSBdLmRpc3BsYWNlbWVudFByb3BlcnR5LmdldCgpO1xyXG4gICAgICAgICAgY29uc3Qgc0Fib3ZlID0gdGhpcy5tYXNzZXNbIGkgLSAxIF1bIGogXS5kaXNwbGFjZW1lbnRQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLm1hc3Nlc1sgaSBdWyBqIF0uZGlzcGxhY2VtZW50UHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgICBjb25zdCBzUmlnaHQgPSB0aGlzLm1hc3Nlc1sgaSBdWyBqICsgMSBdLmRpc3BsYWNlbWVudFByb3BlcnR5LmdldCgpO1xyXG4gICAgICAgICAgY29uc3Qgc1VuZGVyID0gdGhpcy5tYXNzZXNbIGkgKyAxIF1bIGogXS5kaXNwbGFjZW1lbnRQcm9wZXJ0eS5nZXQoKTtcclxuXHJcbiAgICAgICAgICB0aGlzLm1hc3Nlc1sgaSBdWyBqIF0uYWNjZWxlcmF0aW9uUHJvcGVydHkuc2V0KFxyXG4gICAgICAgICAgICBzTGVmdC5wbHVzKCBzUmlnaHQgKS5wbHVzKCBzQWJvdmUgKS5wbHVzKCBzVW5kZXIgKS5zdWJ0cmFjdCggcy50aW1lc1NjYWxhciggNCApICkubXVsdGlwbHlTY2FsYXIoIGsgLyBtIClcclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgY29uc3QgdiA9IHRoaXMubWFzc2VzWyBpIF1bIGogXS52ZWxvY2l0eVByb3BlcnR5LmdldCgpO1xyXG4gICAgICAgICAgY29uc3QgYSA9IHRoaXMubWFzc2VzWyBpIF1bIGogXS5hY2NlbGVyYXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICAgIGNvbnN0IGFMYXN0ID0gdGhpcy5tYXNzZXNbIGkgXVsgaiBdLnByZXZpb3VzQWNjZWxlcmF0aW9uUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgICAgICAgdGhpcy5tYXNzZXNbIGkgXVsgaiBdLnZlbG9jaXR5UHJvcGVydHkuc2V0KCB2LnBsdXMoIGEucGx1cyggYUxhc3QgKS5tdWx0aXBseVNjYWxhciggZHQgLyAyICkgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMubWFzc2VzWyBpIF1bIGogXS5hY2NlbGVyYXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCAwLCAwICkgKTtcclxuICAgICAgICAgIHRoaXMubWFzc2VzWyBpIF1bIGogXS52ZWxvY2l0eVByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoIDAsIDAgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHBvc2l0aW9ucyBvZiBtYXNzZXMgYXQgbmV4dCB0aW1lIHN0ZXAsIHVzaW5nIGV4YWN0IGNhbGN1bGF0aW9uLlxyXG4gICAqIE9ubHkgdXNlZCBpZiBubyBtYXNzIGlzIGdyYWJiZWQgYnkgbW91c2UuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBzZXRFeGFjdFBvc2l0aW9ucygpIHtcclxuICAgIGNvbnN0IE4gPSB0aGlzLm51bWJlck9mTWFzc2VzUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgLy8gVGhlIG5hbWVzIG9mIHRoZXNlIGFycmF5cyBjb3JyZXNwb25kIHRvIHRoZSBmb3JtdWxhcyB1c2VkIHRvIGNvbXB1dGUgdGhlaXIgdmFsdWVzXHJcbiAgICBjb25zdCBhbXBsaXR1ZGVYVGltZXNDb3MgPSBbXTtcclxuICAgIGNvbnN0IGFtcGxpdHVkZVlUaW1lc0NvcyA9IFtdO1xyXG4gICAgY29uc3QgZnJlcXVlbmN5VGltZXNBbXBsaXR1ZGVYVGltZXNTaW4gPSBbXTtcclxuICAgIGNvbnN0IGZyZXF1ZW5jeVRpbWVzQW1wbGl0dWRlWVRpbWVzU2luID0gW107XHJcbiAgICBjb25zdCBmcmVxdWVuY3lTcXVhcmVkVGltZXNBbXBsaXR1ZGVYVGltZXNDb3MgPSBbXTtcclxuICAgIGNvbnN0IGZyZXF1ZW5jeVNxdWFyZWRUaW1lc0FtcGxpdHVkZVlUaW1lc0NvcyA9IFtdO1xyXG5cclxuICAgIGZvciAoIGxldCByID0gMTsgciA8PSBOOyArK3IgKSB7XHJcbiAgICAgIGFtcGxpdHVkZVhUaW1lc0Nvc1sgciBdID0gW107XHJcbiAgICAgIGFtcGxpdHVkZVlUaW1lc0Nvc1sgciBdID0gW107XHJcbiAgICAgIGZyZXF1ZW5jeVRpbWVzQW1wbGl0dWRlWFRpbWVzU2luWyByIF0gPSBbXTtcclxuICAgICAgZnJlcXVlbmN5VGltZXNBbXBsaXR1ZGVZVGltZXNTaW5bIHIgXSA9IFtdO1xyXG4gICAgICBmcmVxdWVuY3lTcXVhcmVkVGltZXNBbXBsaXR1ZGVYVGltZXNDb3NbIHIgXSA9IFtdO1xyXG4gICAgICBmcmVxdWVuY3lTcXVhcmVkVGltZXNBbXBsaXR1ZGVZVGltZXNDb3NbIHIgXSA9IFtdO1xyXG5cclxuICAgICAgZm9yICggbGV0IHMgPSAxOyBzIDw9IE47ICsrcyApIHtcclxuICAgICAgICBjb25zdCBtb2RlQW1wbGl0dWRlWCA9IHRoaXMubW9kZVhBbXBsaXR1ZGVQcm9wZXJ0aWVzWyByIC0gMSBdWyBzIC0gMSBdLmdldCgpO1xyXG4gICAgICAgIGNvbnN0IG1vZGVBbXBsaXR1ZGVZID0gdGhpcy5tb2RlWUFtcGxpdHVkZVByb3BlcnRpZXNbIHIgLSAxIF1bIHMgLSAxIF0uZ2V0KCk7XHJcbiAgICAgICAgY29uc3QgbW9kZUZyZXF1ZW5jeSA9IHRoaXMubW9kZUZyZXF1ZW5jeVByb3BlcnRpZXNbIHIgLSAxIF1bIHMgLSAxIF0uZ2V0KCk7XHJcbiAgICAgICAgY29uc3QgbW9kZVBoYXNlWCA9IHRoaXMubW9kZVhQaGFzZVByb3BlcnRpZXNbIHIgLSAxIF1bIHMgLSAxIF0uZ2V0KCk7XHJcbiAgICAgICAgY29uc3QgbW9kZVBoYXNlWSA9IHRoaXMubW9kZVlQaGFzZVByb3BlcnRpZXNbIHIgLSAxIF1bIHMgLSAxIF0uZ2V0KCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGZyZXF1ZW5jeVRpbWVzVGltZSA9IG1vZGVGcmVxdWVuY3kgKiB0aGlzLnRpbWVQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICBjb25zdCBmcmVxdWVuY3lUaW1lc1RpbWVNaW51c1BoYXNlWCA9IGZyZXF1ZW5jeVRpbWVzVGltZSAtIG1vZGVQaGFzZVg7XHJcbiAgICAgICAgY29uc3QgZnJlcXVlbmN5VGltZXNUaW1lTWludXNQaGFzZVkgPSBmcmVxdWVuY3lUaW1lc1RpbWUgLSBtb2RlUGhhc2VZO1xyXG5cclxuICAgICAgICAvLyBib3RoIHZhbHVlcyBhcmUgdXNlZCB0d2ljZSwgc28gaXQncyByZWFzb25hYmxlIHRvIGNhbGN1bGF0ZSB0aGVtIGhlcmVcclxuICAgICAgICBjb25zdCBmcmVxdWVuY3lUaW1lc1RpbWVNaW51c1BoYXNlWENvcyA9IE1hdGguY29zKCBmcmVxdWVuY3lUaW1lc1RpbWVNaW51c1BoYXNlWCApO1xyXG4gICAgICAgIGNvbnN0IGZyZXF1ZW5jeVRpbWVzVGltZU1pbnVzUGhhc2VZQ29zID0gTWF0aC5jb3MoIGZyZXF1ZW5jeVRpbWVzVGltZU1pbnVzUGhhc2VZICk7XHJcblxyXG4gICAgICAgIGFtcGxpdHVkZVhUaW1lc0Nvc1sgciBdWyBzIF0gPSBtb2RlQW1wbGl0dWRlWCAqIGZyZXF1ZW5jeVRpbWVzVGltZU1pbnVzUGhhc2VYQ29zO1xyXG4gICAgICAgIGFtcGxpdHVkZVlUaW1lc0Nvc1sgciBdWyBzIF0gPSBtb2RlQW1wbGl0dWRlWSAqIGZyZXF1ZW5jeVRpbWVzVGltZU1pbnVzUGhhc2VZQ29zO1xyXG5cclxuICAgICAgICBmcmVxdWVuY3lUaW1lc0FtcGxpdHVkZVhUaW1lc1NpblsgciBdWyBzIF0gPSAtbW9kZUZyZXF1ZW5jeSAqIG1vZGVBbXBsaXR1ZGVYXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBNYXRoLnNpbiggZnJlcXVlbmN5VGltZXNUaW1lTWludXNQaGFzZVggKTtcclxuXHJcbiAgICAgICAgZnJlcXVlbmN5VGltZXNBbXBsaXR1ZGVZVGltZXNTaW5bIHIgXVsgcyBdID0gLW1vZGVGcmVxdWVuY3kgKiBtb2RlQW1wbGl0dWRlWVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogTWF0aC5zaW4oIGZyZXF1ZW5jeVRpbWVzVGltZU1pbnVzUGhhc2VZICk7XHJcblxyXG4gICAgICAgIGZyZXF1ZW5jeVNxdWFyZWRUaW1lc0FtcGxpdHVkZVhUaW1lc0Nvc1sgciBdWyBzIF0gPSAtKCBtb2RlRnJlcXVlbmN5ICoqIDIgKSAqIG1vZGVBbXBsaXR1ZGVYXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogZnJlcXVlbmN5VGltZXNUaW1lTWludXNQaGFzZVhDb3M7XHJcblxyXG4gICAgICAgIGZyZXF1ZW5jeVNxdWFyZWRUaW1lc0FtcGxpdHVkZVlUaW1lc0Nvc1sgciBdWyBzIF0gPSAtKCBtb2RlRnJlcXVlbmN5ICoqIDIgKSAqIG1vZGVBbXBsaXR1ZGVZXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogZnJlcXVlbmN5VGltZXNUaW1lTWludXNQaGFzZVlDb3M7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGZvciAoIGxldCBpID0gMTsgaSA8PSBOOyArK2kgKSB7XHJcbiAgICAgIGZvciAoIGxldCBqID0gMTsgaiA8PSBOOyArK2ogKSB7XHJcbiAgICAgICAgLy8gZm9yIGVhY2ggbWFzc1xyXG5cclxuICAgICAgICBjb25zdCBkaXNwbGFjZW1lbnQgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgICAgIGNvbnN0IHZlbG9jaXR5ID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgICAgICBjb25zdCBhY2NlbGVyYXRpb24gPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG5cclxuICAgICAgICBjb25zdCBzaW5lUHJvZHVjdE1hdHJpeCA9IHRoaXMuc2luZVByb2R1Y3RbIGkgXVsgaiBdO1xyXG4gICAgICAgIGZvciAoIGxldCByID0gMTsgciA8PSBOOyArK3IgKSB7XHJcbiAgICAgICAgICBjb25zdCBzaW5lUHJvZHVjdEFycmF5ID0gc2luZVByb2R1Y3RNYXRyaXhbIHIgXTtcclxuICAgICAgICAgIGZvciAoIGxldCBzID0gMTsgcyA8PSBOOyArK3MgKSB7XHJcbiAgICAgICAgICAgIC8vIGZvciBlYWNoIG1vZGVcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNpbmVQcm9kdWN0ID0gc2luZVByb2R1Y3RBcnJheVsgcyBdO1xyXG5cclxuICAgICAgICAgICAgZGlzcGxhY2VtZW50LnggKz0gc2luZVByb2R1Y3QgKiBhbXBsaXR1ZGVYVGltZXNDb3NbIHIgXVsgcyBdO1xyXG4gICAgICAgICAgICBkaXNwbGFjZW1lbnQueSAtPSBzaW5lUHJvZHVjdCAqIGFtcGxpdHVkZVlUaW1lc0Nvc1sgciBdWyBzIF07XHJcblxyXG4gICAgICAgICAgICB2ZWxvY2l0eS54ICs9IHNpbmVQcm9kdWN0ICogZnJlcXVlbmN5VGltZXNBbXBsaXR1ZGVYVGltZXNTaW5bIHIgXVsgcyBdO1xyXG4gICAgICAgICAgICB2ZWxvY2l0eS55IC09IHNpbmVQcm9kdWN0ICogZnJlcXVlbmN5VGltZXNBbXBsaXR1ZGVZVGltZXNTaW5bIHIgXVsgcyBdO1xyXG5cclxuICAgICAgICAgICAgYWNjZWxlcmF0aW9uLnggKz0gc2luZVByb2R1Y3QgKiBmcmVxdWVuY3lTcXVhcmVkVGltZXNBbXBsaXR1ZGVYVGltZXNDb3NbIHIgXVsgcyBdO1xyXG4gICAgICAgICAgICBhY2NlbGVyYXRpb24ueSAtPSBzaW5lUHJvZHVjdCAqIGZyZXF1ZW5jeVNxdWFyZWRUaW1lc0FtcGxpdHVkZVlUaW1lc0Nvc1sgciBdWyBzIF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm1hc3Nlc1sgaSBdWyBqIF0uZGlzcGxhY2VtZW50UHJvcGVydHkuc2V0KCBkaXNwbGFjZW1lbnQgKTtcclxuICAgICAgICB0aGlzLm1hc3Nlc1sgaSBdWyBqIF0udmVsb2NpdHlQcm9wZXJ0eS5zZXQoIHZlbG9jaXR5ICk7XHJcbiAgICAgICAgdGhpcy5tYXNzZXNbIGkgXVsgaiBdLmFjY2VsZXJhdGlvblByb3BlcnR5LnNldCggYWNjZWxlcmF0aW9uICk7XHJcblxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wdXRlIG1vZGUgYW1wbGl0dWRlcyBhbmQgcGhhc2VzIGJhc2VkIG9uIGN1cnJlbnQgbWFzc2VzIGRpc3BsYWNlbWVudCBhbmQgdmVsb2NpdHkuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjb21wdXRlTW9kZUFtcGxpdHVkZXNBbmRQaGFzZXMoKSB7XHJcbiAgICB0aGlzLnRpbWVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgY29uc3QgTiA9IHRoaXMubnVtYmVyT2ZNYXNzZXNQcm9wZXJ0eS5nZXQoKTtcclxuICAgIGZvciAoIGxldCByID0gMTsgciA8PSBOOyArK3IgKSB7XHJcbiAgICAgIGZvciAoIGxldCBzID0gMTsgcyA8PSBOOyArK3MgKSB7XHJcbiAgICAgICAgLy8gZm9yIGVhY2ggbW9kZVxyXG5cclxuICAgICAgICBsZXQgQW1wbGl0dWRlVGltZXNDb3NQaGFzZVggPSAwO1xyXG4gICAgICAgIGxldCBBbXBsaXR1ZGVUaW1lc1NpblBoYXNlWCA9IDA7XHJcbiAgICAgICAgbGV0IEFtcGxpdHVkZVRpbWVzQ29zUGhhc2VZID0gMDtcclxuICAgICAgICBsZXQgQW1wbGl0dWRlVGltZXNTaW5QaGFzZVkgPSAwO1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMTsgaSA8PSBOOyArK2kgKSB7XHJcbiAgICAgICAgICBmb3IgKCBsZXQgaiA9IDE7IGogPD0gTjsgKytqICkge1xyXG4gICAgICAgICAgICAvLyBmb3IgZWFjaCBtYXNzXHJcblxyXG4gICAgICAgICAgICBjb25zdCBtYXNzRGlzcGxhY2VtZW50ID0gdGhpcy5tYXNzZXNbIGkgXVsgaiBdLmRpc3BsYWNlbWVudFByb3BlcnR5LmdldCgpO1xyXG4gICAgICAgICAgICBjb25zdCBtYXNzVmVsb2NpdHkgPSB0aGlzLm1hc3Nlc1sgaSBdWyBqIF0udmVsb2NpdHlQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICAgICAgY29uc3QgbW9kZUZyZXF1ZW5jeSA9IHRoaXMubW9kZUZyZXF1ZW5jeVByb3BlcnRpZXNbIHIgLSAxIF1bIHMgLSAxIF0uZ2V0KCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnN0YW50VGltZXNTaW5lUHJvZHVjdCA9ICggNCAvICggKCBOICsgMSApICogKCBOICsgMSApICkgKSAqIHRoaXMuc2luZVByb2R1Y3RbIGkgXVsgaiBdWyByIF1bIHMgXTtcclxuXHJcbiAgICAgICAgICAgIEFtcGxpdHVkZVRpbWVzQ29zUGhhc2VYICs9IGNvbnN0YW50VGltZXNTaW5lUHJvZHVjdCAqIG1hc3NEaXNwbGFjZW1lbnQueDtcclxuICAgICAgICAgICAgQW1wbGl0dWRlVGltZXNDb3NQaGFzZVkgLT0gY29uc3RhbnRUaW1lc1NpbmVQcm9kdWN0ICogbWFzc0Rpc3BsYWNlbWVudC55O1xyXG4gICAgICAgICAgICBBbXBsaXR1ZGVUaW1lc1NpblBoYXNlWCArPSAoIGNvbnN0YW50VGltZXNTaW5lUHJvZHVjdCAvIG1vZGVGcmVxdWVuY3kgKSAqIG1hc3NWZWxvY2l0eS54O1xyXG4gICAgICAgICAgICBBbXBsaXR1ZGVUaW1lc1NpblBoYXNlWSAtPSAoIGNvbnN0YW50VGltZXNTaW5lUHJvZHVjdCAvIG1vZGVGcmVxdWVuY3kgKSAqIG1hc3NWZWxvY2l0eS55O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tb2RlWEFtcGxpdHVkZVByb3BlcnRpZXNbIHIgLSAxIF1bIHMgLSAxIF0uc2V0KFxyXG4gICAgICAgICAgTWF0aC5zcXJ0KCBBbXBsaXR1ZGVUaW1lc0Nvc1BoYXNlWCAqKiAyICsgQW1wbGl0dWRlVGltZXNTaW5QaGFzZVggKiogMiApXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLm1vZGVZQW1wbGl0dWRlUHJvcGVydGllc1sgciAtIDEgXVsgcyAtIDEgXS5zZXQoXHJcbiAgICAgICAgICBNYXRoLnNxcnQoIEFtcGxpdHVkZVRpbWVzQ29zUGhhc2VZICoqIDIgKyBBbXBsaXR1ZGVUaW1lc1NpblBoYXNlWSAqKiAyIClcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLm1vZGVYUGhhc2VQcm9wZXJ0aWVzWyByIC0gMSBdWyBzIC0gMSBdLnNldChcclxuICAgICAgICAgIE1hdGguYXRhbjIoIEFtcGxpdHVkZVRpbWVzU2luUGhhc2VYLCBBbXBsaXR1ZGVUaW1lc0Nvc1BoYXNlWCApXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLm1vZGVZUGhhc2VQcm9wZXJ0aWVzWyByIC0gMSBdWyBzIC0gMSBdLnNldChcclxuICAgICAgICAgIE1hdGguYXRhbjIoIEFtcGxpdHVkZVRpbWVzU2luUGhhc2VZLCBBbXBsaXR1ZGVUaW1lc0Nvc1BoYXNlWSApXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgaW5kZXhlcyBmb3IgYSBzcGVjaWZpZWQgbWFzcy4gVGhpcyB3YXMgbW92ZWQgaGVyZSBmcm9tIE1hc3NOb2RlMkQuXHJcbiAgICogQHBhcmFtIHtNYXNzfSBtYXNzXHJcbiAgICogQHJldHVybnMge3tpOiBudW1iZXIsIGo6IG51bWJlcn19XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE1hc3NJbmRleGVzKCBtYXNzICkge1xyXG4gICAgbGV0IGZvdW5kSW5kZXggPSAtMTtcclxuICAgIGxldCBmb3VuZEFycmF5ID0gbnVsbDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubWFzc2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBhcnJheSA9IHRoaXMubWFzc2VzWyBpIF07XHJcbiAgICAgIGZvdW5kSW5kZXggPSBhcnJheS5pbmRleE9mKCBtYXNzICk7XHJcbiAgICAgIGlmICggZm91bmRJbmRleCAhPT0gLTEgKSB7XHJcbiAgICAgICAgZm91bmRBcnJheSA9IGFycmF5O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmb3VuZEluZGV4ICE9PSAtMSApO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaTogdGhpcy5tYXNzZXMuaW5kZXhPZiggZm91bmRBcnJheSApLFxyXG4gICAgICBqOiBmb3VuZEluZGV4XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxubm9ybWFsTW9kZXMucmVnaXN0ZXIoICdUd29EaW1lbnNpb25zTW9kZWwnLCBUd29EaW1lbnNpb25zTW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgVHdvRGltZW5zaW9uc01vZGVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsSUFBSSxNQUFNLDRCQUE0QjtBQUM3QyxPQUFPQyxnQkFBZ0IsTUFBTSx3Q0FBd0M7QUFDckUsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxvQkFBb0IsTUFBTSxzQ0FBc0M7QUFDdkUsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUU5QyxNQUFNQyxVQUFVLEdBQUdGLG9CQUFvQixDQUFDRyxrQkFBa0IsR0FBRyxDQUFDO0FBQzlELE1BQU1DLFdBQVcsR0FBR0YsVUFBVSxHQUFHLENBQUM7QUFFbEMsTUFBTUcsa0JBQWtCLFNBQVNQLGdCQUFnQixDQUFDO0VBRWhEO0FBQ0Y7QUFDQTtFQUNFUSxXQUFXQSxDQUFFQyxPQUFPLEVBQUc7SUFFckJBLE9BQU8sR0FBR2IsS0FBSyxDQUFFO01BQ2ZjLE1BQU0sRUFBRWIsTUFBTSxDQUFDYztJQUNqQixDQUFDLEVBQUVGLE9BQVEsQ0FBQztJQUVaLEtBQUssQ0FBRUEsT0FBUSxDQUFDOztJQUVoQjtJQUNBLElBQUksQ0FBQ0csd0JBQXdCLEdBQUcsSUFBSUMsS0FBSyxDQUFFWCxvQkFBb0IsQ0FBQ0csa0JBQW1CLENBQUM7SUFDcEYsSUFBSSxDQUFDUyx3QkFBd0IsR0FBRyxJQUFJRCxLQUFLLENBQUVYLG9CQUFvQixDQUFDRyxrQkFBbUIsQ0FBQztJQUNwRixJQUFJLENBQUNVLG9CQUFvQixHQUFHLElBQUlGLEtBQUssQ0FBRVgsb0JBQW9CLENBQUNHLGtCQUFtQixDQUFDO0lBQ2hGLElBQUksQ0FBQ1csb0JBQW9CLEdBQUcsSUFBSUgsS0FBSyxDQUFFWCxvQkFBb0IsQ0FBQ0csa0JBQW1CLENBQUM7SUFDaEYsSUFBSSxDQUFDWSx1QkFBdUIsR0FBRyxJQUFJSixLQUFLLENBQUVYLG9CQUFvQixDQUFDRyxrQkFBbUIsQ0FBQztJQUVuRixLQUFNLElBQUlhLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2hCLG9CQUFvQixDQUFDRyxrQkFBa0IsRUFBRWEsQ0FBQyxFQUFFLEVBQUc7TUFFbEUsSUFBSSxDQUFDTix3QkFBd0IsQ0FBRU0sQ0FBQyxDQUFFLEdBQUcsSUFBSUwsS0FBSyxDQUFFWCxvQkFBb0IsQ0FBQ0csa0JBQW1CLENBQUM7TUFDekYsSUFBSSxDQUFDUyx3QkFBd0IsQ0FBRUksQ0FBQyxDQUFFLEdBQUcsSUFBSUwsS0FBSyxDQUFFWCxvQkFBb0IsQ0FBQ0csa0JBQW1CLENBQUM7TUFDekYsSUFBSSxDQUFDVSxvQkFBb0IsQ0FBRUcsQ0FBQyxDQUFFLEdBQUcsSUFBSUwsS0FBSyxDQUFFWCxvQkFBb0IsQ0FBQ0csa0JBQW1CLENBQUM7TUFDckYsSUFBSSxDQUFDVyxvQkFBb0IsQ0FBRUUsQ0FBQyxDQUFFLEdBQUcsSUFBSUwsS0FBSyxDQUFFWCxvQkFBb0IsQ0FBQ0csa0JBQW1CLENBQUM7TUFDckYsSUFBSSxDQUFDWSx1QkFBdUIsQ0FBRUMsQ0FBQyxDQUFFLEdBQUcsSUFBSUwsS0FBSyxDQUFFWCxvQkFBb0IsQ0FBQ0csa0JBQW1CLENBQUM7TUFFeEYsS0FBTSxJQUFJYyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdqQixvQkFBb0IsQ0FBQ0csa0JBQWtCLEVBQUUsRUFBRWMsQ0FBQyxFQUFHO1FBRWxFO1FBQ0EsTUFBTUMsWUFBWSxHQUFHRixDQUFDLEdBQUcsQ0FBQztRQUMxQixNQUFNRyxZQUFZLEdBQUdGLENBQUMsR0FBRyxDQUFDO1FBRTFCLElBQUksQ0FBQ1Asd0JBQXdCLENBQUVNLENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsR0FBRyxJQUFJM0IsY0FBYyxDQUFFVSxvQkFBb0IsQ0FBQ29CLGlCQUFpQixFQUFFO1VBQ3BHWixNQUFNLEVBQUVELE9BQU8sQ0FBQ0MsTUFBTSxDQUFDYSxZQUFZLENBQUcsa0JBQWlCSCxZQUFhLElBQUdDLFlBQWEsV0FBVyxDQUFDO1VBQ2hHRyxLQUFLLEVBQUUsSUFBSTlCLEtBQUssQ0FBRVEsb0JBQW9CLENBQUN1QixhQUFhLEVBQUVDLE1BQU0sQ0FBQ0MsaUJBQWtCO1FBQ2pGLENBQUUsQ0FBQztRQUVILElBQUksQ0FBQ2Isd0JBQXdCLENBQUVJLENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsR0FBRyxJQUFJM0IsY0FBYyxDQUFFVSxvQkFBb0IsQ0FBQ29CLGlCQUFpQixFQUFFO1VBQ3BHWixNQUFNLEVBQUVELE9BQU8sQ0FBQ0MsTUFBTSxDQUFDYSxZQUFZLENBQUcsa0JBQWlCSCxZQUFhLElBQUdDLFlBQWEsV0FBVyxDQUFDO1VBQ2hHRyxLQUFLLEVBQUUsSUFBSTlCLEtBQUssQ0FBRVEsb0JBQW9CLENBQUN1QixhQUFhLEVBQUVDLE1BQU0sQ0FBQ0MsaUJBQWtCO1FBQ2pGLENBQUUsQ0FBQztRQUVILElBQUksQ0FBQ1osb0JBQW9CLENBQUVHLENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsR0FBRyxJQUFJM0IsY0FBYyxDQUFFVSxvQkFBb0IsQ0FBQzBCLGFBQWEsRUFBRTtVQUM1RmxCLE1BQU0sRUFBRUQsT0FBTyxDQUFDQyxNQUFNLENBQUNhLFlBQVksQ0FBRyxjQUFhSCxZQUFhLElBQUdDLFlBQWEsV0FBVyxDQUFDO1VBQzVGRyxLQUFLLEVBQUUsSUFBSTlCLEtBQUssQ0FBRVEsb0JBQW9CLENBQUMyQixTQUFTLEVBQUUzQixvQkFBb0IsQ0FBQzRCLFNBQVU7UUFDbkYsQ0FBRSxDQUFDO1FBRUgsSUFBSSxDQUFDZCxvQkFBb0IsQ0FBRUUsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRSxHQUFHLElBQUkzQixjQUFjLENBQUVVLG9CQUFvQixDQUFDMEIsYUFBYSxFQUFFO1VBQzVGbEIsTUFBTSxFQUFFRCxPQUFPLENBQUNDLE1BQU0sQ0FBQ2EsWUFBWSxDQUFHLGNBQWFILFlBQWEsSUFBR0MsWUFBYSxXQUFXLENBQUM7VUFDNUZHLEtBQUssRUFBRSxJQUFJOUIsS0FBSyxDQUFFUSxvQkFBb0IsQ0FBQzJCLFNBQVMsRUFBRTNCLG9CQUFvQixDQUFDNEIsU0FBVTtRQUNuRixDQUFFLENBQUM7O1FBRUg7UUFDQSxJQUFJLENBQUNiLHVCQUF1QixDQUFFQyxDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFLEdBQUcsSUFBSTVCLGVBQWUsQ0FBRSxDQUFFLElBQUksQ0FBQ3dDLHNCQUFzQixDQUFFLEVBQzNGQyxZQUFZLElBQUk7VUFDZCxNQUFNQyxDQUFDLEdBQUcvQixvQkFBb0IsQ0FBQ2dDLHFCQUFxQjtVQUNwRCxNQUFNQyxDQUFDLEdBQUdqQyxvQkFBb0IsQ0FBQ2tDLGlCQUFpQjtVQUNoRCxJQUFLbEIsQ0FBQyxJQUFJYyxZQUFZLElBQUliLENBQUMsSUFBSWEsWUFBWSxFQUFHO1lBQzVDLE9BQU8sQ0FBQztVQUNWLENBQUMsTUFDSTtZQUNILE1BQU1LLE1BQU0sR0FBRyxDQUFDLEdBQUdDLElBQUksQ0FBQ0MsSUFBSSxDQUFFTixDQUFDLEdBQUdFLENBQUUsQ0FBQyxHQUFHRyxJQUFJLENBQUNFLEdBQUcsQ0FBRUYsSUFBSSxDQUFDRyxFQUFFLEdBQUcsQ0FBQyxJQUFLdkIsQ0FBQyxHQUFHLENBQUMsQ0FBRSxJQUFLYyxZQUFZLEdBQUcsQ0FBQyxDQUFHLENBQUM7WUFDbEcsTUFBTVUsTUFBTSxHQUFHLENBQUMsR0FBR0osSUFBSSxDQUFDQyxJQUFJLENBQUVOLENBQUMsR0FBR0UsQ0FBRSxDQUFDLEdBQUdHLElBQUksQ0FBQ0UsR0FBRyxDQUFFRixJQUFJLENBQUNHLEVBQUUsR0FBRyxDQUFDLElBQUt0QixDQUFDLEdBQUcsQ0FBQyxDQUFFLElBQUthLFlBQVksR0FBRyxDQUFDLENBQUcsQ0FBQztZQUNsRyxPQUFPTSxJQUFJLENBQUNDLElBQUksQ0FBRUYsTUFBTSxJQUFJLENBQUMsR0FBR0ssTUFBTSxJQUFJLENBQUUsQ0FBQztVQUMvQztRQUNGLENBQUMsRUFDRDtVQUNFaEMsTUFBTSxFQUFFRCxPQUFPLENBQUNDLE1BQU0sQ0FBQ2EsWUFBWSxDQUFHLGlCQUFnQkgsWUFBYSxJQUFHQyxZQUFhLFdBQVcsQ0FBQztVQUMvRnNCLGVBQWUsRUFBRTdDO1FBQ25CLENBQ0YsQ0FBQztNQUNIO0lBQ0Y7O0lBRUE7SUFDQSxJQUFJLENBQUM4QyxNQUFNLEdBQUcsSUFBSS9CLEtBQUssQ0FBRVQsVUFBVyxDQUFDO0lBQ3JDLEtBQU0sSUFBSWMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHZCxVQUFVLEVBQUUsRUFBRWMsQ0FBQyxFQUFHO01BQ3JDLElBQUksQ0FBQzBCLE1BQU0sQ0FBRTFCLENBQUMsQ0FBRSxHQUFHLElBQUlMLEtBQUssQ0FBRVQsVUFBVyxDQUFDO0lBQzVDO0lBQ0EsSUFBSSxDQUFDeUMsbUJBQW1CLENBQUVwQyxPQUFPLENBQUNDLE1BQU8sQ0FBQzs7SUFFMUM7SUFDQSxJQUFJLENBQUNvQyxRQUFRLEdBQUcsSUFBSWpDLEtBQUssQ0FBRVAsV0FBWSxDQUFDO0lBQ3hDLElBQUksQ0FBQ3lDLFFBQVEsR0FBRyxJQUFJbEMsS0FBSyxDQUFFUCxXQUFZLENBQUM7SUFDeEMsS0FBTSxJQUFJWSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdaLFdBQVcsRUFBRSxFQUFFWSxDQUFDLEVBQUc7TUFDdEMsSUFBSSxDQUFDNEIsUUFBUSxDQUFFNUIsQ0FBQyxDQUFFLEdBQUcsSUFBSUwsS0FBSyxDQUFFUCxXQUFZLENBQUM7TUFDN0MsSUFBSSxDQUFDeUMsUUFBUSxDQUFFN0IsQ0FBQyxDQUFFLEdBQUcsSUFBSUwsS0FBSyxDQUFFUCxXQUFZLENBQUM7SUFDL0M7SUFDQSxJQUFJLENBQUMwQyxvQkFBb0IsQ0FBQyxDQUFDOztJQUUzQjtJQUNBLElBQUksQ0FBQ0MsMkJBQTJCLEdBQUcsSUFBSXhELFFBQVEsQ0FBRSxJQUFJLEVBQUU7TUFDckRpQixNQUFNLEVBQUVELE9BQU8sQ0FBQ0MsTUFBTSxDQUFDYSxZQUFZLENBQUUsNkJBQThCO0lBQ3JFLENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQ1Esc0JBQXNCLENBQUNtQixJQUFJLENBQUUsSUFBSSxDQUFDQyxxQkFBcUIsQ0FBQ0MsSUFBSSxDQUFFLElBQUssQ0FBRSxDQUFDOztJQUUzRTtJQUNBO0lBQ0EsTUFBTUMsZ0JBQWdCLEdBQUcsR0FBRztJQUM1QixNQUFNQyxhQUFhLEdBQUcsSUFBSXpDLEtBQUssQ0FBRVgsb0JBQW9CLENBQUNHLGtCQUFtQixDQUFDO0lBQzFFLEtBQU0sSUFBSWEsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHb0MsYUFBYSxDQUFDQyxNQUFNLEVBQUVyQyxDQUFDLEVBQUUsRUFBRztNQUMvQyxNQUFNc0MsWUFBWSxHQUFHdEQsb0JBQW9CLENBQUN1RCx3QkFBd0IsSUFBS3ZDLENBQUMsR0FBRyxDQUFDLENBQUU7TUFDOUVvQyxhQUFhLENBQUVwQyxDQUFDLENBQUUsR0FBR21DLGdCQUFnQixHQUFHRyxZQUFZO0lBQ3REOztJQUVBO0lBQ0EsSUFBSSxDQUFDRSxvQkFBb0IsR0FBRyxJQUFJbkUsZUFBZSxDQUFFLENBQUUsSUFBSSxDQUFDd0Msc0JBQXNCLENBQUUsRUFDOUVDLFlBQVksSUFBSXNCLGFBQWEsQ0FBRXRCLFlBQVksR0FBRyxDQUFDLENBQ2pELENBQUM7RUFDSDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0UyQixxQkFBcUJBLENBQUUzQixZQUFZLEVBQUc7SUFDcEMsTUFBTTRCLENBQUMsR0FBRzVCLFlBQVk7SUFDdEIsSUFBSSxDQUFDNkIsV0FBVyxHQUFHLEVBQUU7SUFFckIsS0FBTSxJQUFJM0MsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxJQUFJMEMsQ0FBQyxFQUFFLEVBQUUxQyxDQUFDLEVBQUc7TUFDN0IsSUFBSSxDQUFDMkMsV0FBVyxDQUFFM0MsQ0FBQyxDQUFFLEdBQUcsRUFBRTtNQUMxQixLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsSUFBSXlDLENBQUMsRUFBRSxFQUFFekMsQ0FBQyxFQUFHO1FBQzdCLElBQUksQ0FBQzBDLFdBQVcsQ0FBRTNDLENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsR0FBRyxFQUFFO1FBRS9CLEtBQU0sSUFBSTJDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsSUFBSUYsQ0FBQyxFQUFFLEVBQUVFLENBQUMsRUFBRztVQUM3QixJQUFJLENBQUNELFdBQVcsQ0FBRTNDLENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsQ0FBRTJDLENBQUMsQ0FBRSxHQUFHLEVBQUU7O1VBRXBDO1VBQ0EsTUFBTXRCLEdBQUcsR0FBR0YsSUFBSSxDQUFDRSxHQUFHLENBQUVyQixDQUFDLEdBQUcyQyxDQUFDLEdBQUd4QixJQUFJLENBQUNHLEVBQUUsSUFBS21CLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQztVQUVuRCxLQUFNLElBQUlHLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsSUFBSUgsQ0FBQyxFQUFFLEVBQUVHLENBQUMsRUFBRztZQUM3QixJQUFJLENBQUNGLFdBQVcsQ0FBRTNDLENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsQ0FBRTJDLENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsR0FBR3ZCLEdBQUcsR0FBR0YsSUFBSSxDQUFDRSxHQUFHLENBQUV0QixDQUFDLEdBQUc2QyxDQUFDLEdBQUd6QixJQUFJLENBQUNHLEVBQUUsSUFBS21CLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQztVQUN0RjtRQUNGO01BQ0Y7SUFDRjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRVQscUJBQXFCQSxDQUFFbkIsWUFBWSxFQUFHO0lBRXBDLElBQUlnQyxDQUFDLEdBQUc5RCxvQkFBb0IsQ0FBQytELGVBQWU7SUFDNUMsTUFBTUMsS0FBSyxHQUFHaEUsb0JBQW9CLENBQUN1RCx3QkFBd0IsSUFBS3pCLFlBQVksR0FBRyxDQUFDLENBQUU7SUFDbEYsTUFBTW1DLE1BQU0sR0FBR2pFLG9CQUFvQixDQUFDK0QsZUFBZSxHQUFHL0Qsb0JBQW9CLENBQUN1RCx3QkFBd0I7SUFFbkcsSUFBSVcsQ0FBQyxHQUFHbEUsb0JBQW9CLENBQUNtRSxjQUFjO0lBQzNDLE1BQU1DLEtBQUssR0FBR3BFLG9CQUFvQixDQUFDcUUsd0JBQXdCLElBQUt2QyxZQUFZLEdBQUcsQ0FBQyxDQUFFO0lBQ2xGLE1BQU13QyxNQUFNLEdBQUd0RSxvQkFBb0IsQ0FBQ21FLGNBQWMsR0FBR25FLG9CQUFvQixDQUFDcUUsd0JBQXdCO0lBRWxHLEtBQU0sSUFBSXJELENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2QsVUFBVSxFQUFFYyxDQUFDLEVBQUUsRUFBRztNQUNyQzhDLENBQUMsR0FBRzlELG9CQUFvQixDQUFDK0QsZUFBZTtNQUN4QyxLQUFNLElBQUk5QyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdmLFVBQVUsRUFBRSxFQUFFZSxDQUFDLEVBQUc7UUFDckMsTUFBTXNELE9BQU8sR0FBS3ZELENBQUMsSUFBSWMsWUFBWSxJQUFJYixDQUFDLElBQUlhLFlBQWM7UUFFMUQsSUFBSSxDQUFDWSxNQUFNLENBQUUxQixDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFLENBQUN1RCwyQkFBMkIsQ0FBQ0MsR0FBRyxDQUFFLElBQUloRixPQUFPLENBQUVxRSxDQUFDLEVBQUVJLENBQUUsQ0FBRSxDQUFDO1FBQzVFLElBQUksQ0FBQ3hCLE1BQU0sQ0FBRTFCLENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsQ0FBQ3lELGVBQWUsQ0FBQ0QsR0FBRyxDQUFFRixPQUFRLENBQUM7UUFDcEQsSUFBSSxDQUFDN0IsTUFBTSxDQUFFMUIsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRSxDQUFDMEQsWUFBWSxDQUFDLENBQUM7UUFFcEMsSUFBS2IsQ0FBQyxHQUFHRyxNQUFNLEdBQUdELEtBQUssR0FBRyxDQUFDLEVBQUc7VUFDNUJGLENBQUMsSUFBSUUsS0FBSztRQUNaO01BRUY7TUFDQSxJQUFLRSxDQUFDLEdBQUdJLE1BQU0sR0FBR0YsS0FBSyxHQUFHLENBQUMsRUFBRztRQUM1QkYsQ0FBQyxJQUFJRSxLQUFLO01BQ1o7SUFDRjtJQUVBLElBQUksQ0FBQ1gscUJBQXFCLENBQUUzQixZQUFhLENBQUM7SUFDMUMsSUFBSSxDQUFDOEMsZ0JBQWdCLENBQUMsQ0FBQztFQUN6Qjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VqQyxtQkFBbUJBLENBQUVuQyxNQUFNLEVBQUc7SUFDNUIsTUFBTXFFLG1CQUFtQixHQUFHLElBQUksQ0FBQ2hELHNCQUFzQixDQUFDaUQsR0FBRyxDQUFDLENBQUM7SUFFN0QsSUFBSWhCLENBQUMsR0FBRzlELG9CQUFvQixDQUFDK0QsZUFBZTtJQUM1QyxNQUFNQyxLQUFLLEdBQUdoRSxvQkFBb0IsQ0FBQ3VELHdCQUF3QixJQUFLc0IsbUJBQW1CLEdBQUcsQ0FBQyxDQUFFO0lBQ3pGLE1BQU1aLE1BQU0sR0FBR2pFLG9CQUFvQixDQUFDK0QsZUFBZSxHQUFHL0Qsb0JBQW9CLENBQUN1RCx3QkFBd0I7SUFFbkcsSUFBSVcsQ0FBQyxHQUFHbEUsb0JBQW9CLENBQUNtRSxjQUFjO0lBQzNDLE1BQU1DLEtBQUssR0FBR3BFLG9CQUFvQixDQUFDcUUsd0JBQXdCLElBQUtRLG1CQUFtQixHQUFHLENBQUMsQ0FBRTtJQUN6RixNQUFNUCxNQUFNLEdBQUd0RSxvQkFBb0IsQ0FBQ21FLGNBQWMsR0FBR25FLG9CQUFvQixDQUFDcUUsd0JBQXdCO0lBRWxHLEtBQU0sSUFBSXJELENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2QsVUFBVSxFQUFFYyxDQUFDLEVBQUUsRUFBRztNQUNyQyxLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2YsVUFBVSxFQUFFLEVBQUVlLENBQUMsRUFBRztRQUVyQyxNQUFNc0QsT0FBTyxHQUFLdkQsQ0FBQyxJQUFJNkQsbUJBQW1CLElBQUk1RCxDQUFDLElBQUk0RCxtQkFBcUI7O1FBRXhFO1FBQ0E7UUFDQSxJQUFJLENBQUNuQyxNQUFNLENBQUUxQixDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFLEdBQUcsSUFBSXBCLElBQUksQ0FDOUIsSUFBSUosT0FBTyxDQUFFcUUsQ0FBQyxFQUFFSSxDQUFFLENBQUMsRUFDbkJLLE9BQU8sRUFDUC9ELE1BQU0sQ0FBQ2EsWUFBWSxDQUFHLFFBQU9MLENBQUMsR0FBRyxDQUFFLElBQUdDLENBQUMsR0FBRyxDQUFFLEdBQUcsQ0FDakQsQ0FBQztRQUVELElBQUs2QyxDQUFDLEdBQUdHLE1BQU0sR0FBR0QsS0FBSyxHQUFHLENBQUMsRUFBRztVQUM1QkYsQ0FBQyxJQUFJRSxLQUFLO1FBQ1o7TUFFRjtNQUNBLElBQUtFLENBQUMsR0FBR0ksTUFBTSxHQUFHRixLQUFLLEdBQUcsQ0FBQyxFQUFHO1FBQzVCRixDQUFDLElBQUlFLEtBQUs7TUFDWjtJQUNGO0lBQ0EsSUFBSSxDQUFDWCxxQkFBcUIsQ0FBRW9CLG1CQUFvQixDQUFDO0VBQ25EOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0UvQixvQkFBb0JBLENBQUEsRUFBRztJQUNyQixLQUFNLElBQUk5QixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdaLFdBQVcsRUFBRVksQ0FBQyxFQUFFLEVBQUc7TUFDdEMsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdiLFdBQVcsRUFBRSxFQUFFYSxDQUFDLEVBQUc7UUFFdEM7UUFDQSxJQUFLRCxDQUFDLEtBQUtaLFdBQVcsR0FBRyxDQUFDLEVBQUc7VUFDM0IsSUFBSSxDQUFDd0MsUUFBUSxDQUFFNUIsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRSxHQUFHLElBQUlsQixNQUFNLENBQUUsSUFBSSxDQUFDMkMsTUFBTSxDQUFFMUIsQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsRUFBRSxJQUFJLENBQUN5QixNQUFNLENBQUUxQixDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUVDLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQztRQUNsRztRQUVBLElBQUtBLENBQUMsS0FBS2IsV0FBVyxHQUFHLENBQUMsRUFBRztVQUMzQixJQUFJLENBQUN5QyxRQUFRLENBQUU3QixDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFLEdBQUcsSUFBSWxCLE1BQU0sQ0FBRSxJQUFJLENBQUMyQyxNQUFNLENBQUUxQixDQUFDLENBQUUsQ0FBRUMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxFQUFFLElBQUksQ0FBQ3lCLE1BQU0sQ0FBRTFCLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBRUMsQ0FBQyxHQUFHLENBQUMsQ0FBRyxDQUFDO1FBQ2xHO01BQ0Y7SUFDRjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0UyRCxnQkFBZ0JBLENBQUEsRUFBRztJQUNqQixLQUFNLElBQUk1RCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdoQixvQkFBb0IsQ0FBQ0csa0JBQWtCLEVBQUVhLENBQUMsRUFBRSxFQUFHO01BQ2xFLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHakIsb0JBQW9CLENBQUNHLGtCQUFrQixFQUFFYyxDQUFDLEVBQUUsRUFBRztRQUNsRSxJQUFJLENBQUNQLHdCQUF3QixDQUFFTSxDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFLENBQUM4RCxLQUFLLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUNuRSx3QkFBd0IsQ0FBRUksQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRSxDQUFDOEQsS0FBSyxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDbEUsb0JBQW9CLENBQUVHLENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsQ0FBQzhELEtBQUssQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQ2pFLG9CQUFvQixDQUFFRSxDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFLENBQUM4RCxLQUFLLENBQUMsQ0FBQztNQUM3QztJQUNGO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQSxLQUFLQSxDQUFBLEVBQUc7SUFDTixLQUFLLENBQUNBLEtBQUssQ0FBQyxDQUFDO0lBQ2IsSUFBSSxDQUFDaEMsMkJBQTJCLENBQUNnQyxLQUFLLENBQUMsQ0FBQztJQUN4QyxJQUFJLENBQUNDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUN4Qjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFQyxnQkFBZ0JBLENBQUEsRUFBRztJQUNqQixJQUFJLENBQUNDLGVBQWUsQ0FBQ1QsR0FBRyxDQUFFLEtBQU0sQ0FBQztJQUNqQyxJQUFJLENBQUNVLFlBQVksQ0FBQ0osS0FBSyxDQUFDLENBQUM7SUFFekIsSUFBSSxDQUFDSyxpQkFBaUIsQ0FBQyxDQUFDO0VBQzFCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VKLGFBQWFBLENBQUEsRUFBRztJQUNkLEtBQU0sSUFBSWhFLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2QsVUFBVSxFQUFFYyxDQUFDLEVBQUUsRUFBRztNQUNyQyxLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2YsVUFBVSxFQUFFZSxDQUFDLEVBQUUsRUFBRztRQUNyQyxJQUFJLENBQUN5QixNQUFNLENBQUUxQixDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFLENBQUMwRCxZQUFZLENBQUMsQ0FBQztNQUN0QztJQUNGO0lBRUEsSUFBSSxDQUFDQyxnQkFBZ0IsQ0FBQyxDQUFDO0VBQ3pCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRVMsSUFBSUEsQ0FBRUMsRUFBRSxFQUFHO0lBQ1Q7SUFDQTtJQUNBQSxFQUFFLEdBQUdsRCxJQUFJLENBQUNtRCxHQUFHLENBQUVELEVBQUUsRUFBRSxJQUFLLENBQUM7SUFFekIsSUFBSyxJQUFJLENBQUNKLGVBQWUsQ0FBQ0osR0FBRyxDQUFDLENBQUMsRUFBRztNQUNoQyxJQUFJLENBQUNRLEVBQUUsSUFBSUEsRUFBRTtNQUViLE9BQVEsSUFBSSxDQUFDQSxFQUFFLElBQUl0RixvQkFBb0IsQ0FBQ3dGLFFBQVEsRUFBRztRQUNqRCxJQUFJLENBQUNGLEVBQUUsSUFBSXRGLG9CQUFvQixDQUFDd0YsUUFBUTtRQUN4QyxJQUFJLENBQUNDLFVBQVUsQ0FBRXpGLG9CQUFvQixDQUFDd0YsUUFBUyxDQUFDO01BQ2xEO0lBQ0YsQ0FBQyxNQUNJLElBQUssSUFBSSxDQUFDekMsMkJBQTJCLENBQUMrQixHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRztNQUMxRDtNQUNBOztNQUVBLElBQUksQ0FBQ00saUJBQWlCLENBQUMsQ0FBQztJQUMxQjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUssVUFBVUEsQ0FBRUgsRUFBRSxFQUFHO0lBQ2ZBLEVBQUUsSUFBSSxJQUFJLENBQUNJLGlCQUFpQixDQUFDWixHQUFHLENBQUMsQ0FBQztJQUNsQyxJQUFJLENBQUNLLFlBQVksQ0FBQ1YsR0FBRyxDQUFFLElBQUksQ0FBQ1UsWUFBWSxDQUFDTCxHQUFHLENBQUMsQ0FBQyxHQUFHUSxFQUFHLENBQUM7SUFDckQsSUFBSyxJQUFJLENBQUN2QywyQkFBMkIsQ0FBQytCLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFHO01BQ3JELElBQUksQ0FBQ2Esa0JBQWtCLENBQUVMLEVBQUcsQ0FBQztJQUMvQixDQUFDLE1BQ0k7TUFDSCxJQUFJLENBQUNGLGlCQUFpQixDQUFDLENBQUM7SUFDMUI7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU8sa0JBQWtCQSxDQUFFTCxFQUFFLEVBQUc7SUFDdkIsTUFBTTVCLENBQUMsR0FBRyxJQUFJLENBQUM3QixzQkFBc0IsQ0FBQ2lELEdBQUcsQ0FBQyxDQUFDO0lBQzNDLEtBQU0sSUFBSTlELENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsSUFBSTBDLENBQUMsRUFBRSxFQUFFMUMsQ0FBQyxFQUFHO01BQzdCLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxJQUFJeUMsQ0FBQyxFQUFFLEVBQUV6QyxDQUFDLEVBQUc7UUFDN0IsTUFBTTJFLFFBQVEsR0FBRyxJQUFJLENBQUM3QywyQkFBMkIsQ0FBQytCLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZELElBQUssQ0FBQ2MsUUFBUSxJQUFJQSxRQUFRLENBQUM1RSxDQUFDLEtBQUtBLENBQUMsSUFBSTRFLFFBQVEsQ0FBQzNFLENBQUMsS0FBS0EsQ0FBQyxFQUFHO1VBRXZELE1BQU02QyxDQUFDLEdBQUcsSUFBSSxDQUFDcEIsTUFBTSxDQUFFMUIsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRSxDQUFDNEUsb0JBQW9CLENBQUNmLEdBQUcsQ0FBQyxDQUFDO1VBQzFELE1BQU1nQixDQUFDLEdBQUcsSUFBSSxDQUFDcEQsTUFBTSxDQUFFMUIsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRSxDQUFDOEUsZ0JBQWdCLENBQUNqQixHQUFHLENBQUMsQ0FBQztVQUN0RCxNQUFNa0IsQ0FBQyxHQUFHLElBQUksQ0FBQ3RELE1BQU0sQ0FBRTFCLENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsQ0FBQ2dGLG9CQUFvQixDQUFDbkIsR0FBRyxDQUFDLENBQUM7VUFFMUQsTUFBTW9CLFlBQVksR0FBR3BDLENBQUMsQ0FBQ3FDLElBQUksQ0FBRUwsQ0FBQyxDQUFDTSxXQUFXLENBQUVkLEVBQUcsQ0FBRSxDQUFDLENBQUNlLEdBQUcsQ0FBRUwsQ0FBQyxDQUFDSSxXQUFXLENBQUVkLEVBQUUsR0FBR0EsRUFBRSxHQUFHLENBQUUsQ0FBRSxDQUFDO1VBQ3RGLElBQUksQ0FBQzVDLE1BQU0sQ0FBRTFCLENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsQ0FBQzRFLG9CQUFvQixDQUFDcEIsR0FBRyxDQUFFeUIsWUFBYSxDQUFDO1VBQzlELElBQUksQ0FBQ3hELE1BQU0sQ0FBRTFCLENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsQ0FBQ3FGLDRCQUE0QixDQUFDN0IsR0FBRyxDQUFFdUIsQ0FBRSxDQUFDO1FBRTdEO01BQ0Y7SUFDRjtJQUVBLElBQUksQ0FBQ08sa0NBQWtDLENBQUVqQixFQUFHLENBQUM7RUFFL0M7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFaUIsa0NBQWtDQSxDQUFFakIsRUFBRSxFQUFHO0lBQ3ZDLE1BQU01QixDQUFDLEdBQUcsSUFBSSxDQUFDN0Isc0JBQXNCLENBQUNpRCxHQUFHLENBQUMsQ0FBQztJQUMzQyxLQUFNLElBQUk5RCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLElBQUkwQyxDQUFDLEVBQUUsRUFBRTFDLENBQUMsRUFBRztNQUM3QixLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsSUFBSXlDLENBQUMsRUFBRSxFQUFFekMsQ0FBQyxFQUFHO1FBQzdCLE1BQU0yRSxRQUFRLEdBQUcsSUFBSSxDQUFDN0MsMkJBQTJCLENBQUMrQixHQUFHLENBQUMsQ0FBQztRQUN2RCxJQUFLLENBQUNjLFFBQVEsSUFBSUEsUUFBUSxDQUFDNUUsQ0FBQyxLQUFLQSxDQUFDLElBQUk0RSxRQUFRLENBQUMzRSxDQUFDLEtBQUtBLENBQUMsRUFBRztVQUV2RCxNQUFNYyxDQUFDLEdBQUcvQixvQkFBb0IsQ0FBQ2dDLHFCQUFxQjtVQUNwRCxNQUFNQyxDQUFDLEdBQUdqQyxvQkFBb0IsQ0FBQ2tDLGlCQUFpQjtVQUNoRCxNQUFNc0UsS0FBSyxHQUFHLElBQUksQ0FBQzlELE1BQU0sQ0FBRTFCLENBQUMsQ0FBRSxDQUFFQyxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUM0RSxvQkFBb0IsQ0FBQ2YsR0FBRyxDQUFDLENBQUM7VUFDbEUsTUFBTTJCLE1BQU0sR0FBRyxJQUFJLENBQUMvRCxNQUFNLENBQUUxQixDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRSxDQUFDNEUsb0JBQW9CLENBQUNmLEdBQUcsQ0FBQyxDQUFDO1VBQ25FLE1BQU1qQixDQUFDLEdBQUcsSUFBSSxDQUFDbkIsTUFBTSxDQUFFMUIsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRSxDQUFDNEUsb0JBQW9CLENBQUNmLEdBQUcsQ0FBQyxDQUFDO1VBQzFELE1BQU00QixNQUFNLEdBQUcsSUFBSSxDQUFDaEUsTUFBTSxDQUFFMUIsQ0FBQyxDQUFFLENBQUVDLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQzRFLG9CQUFvQixDQUFDZixHQUFHLENBQUMsQ0FBQztVQUNuRSxNQUFNNkIsTUFBTSxHQUFHLElBQUksQ0FBQ2pFLE1BQU0sQ0FBRTFCLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFLENBQUM0RSxvQkFBb0IsQ0FBQ2YsR0FBRyxDQUFDLENBQUM7VUFFbkUsSUFBSSxDQUFDcEMsTUFBTSxDQUFFMUIsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRSxDQUFDZ0Ysb0JBQW9CLENBQUN4QixHQUFHLENBQzVDK0IsS0FBSyxDQUFDTCxJQUFJLENBQUVPLE1BQU8sQ0FBQyxDQUFDUCxJQUFJLENBQUVNLE1BQU8sQ0FBQyxDQUFDTixJQUFJLENBQUVRLE1BQU8sQ0FBQyxDQUFDQyxRQUFRLENBQUUvQyxDQUFDLENBQUN1QyxXQUFXLENBQUUsQ0FBRSxDQUFFLENBQUMsQ0FBQ1MsY0FBYyxDQUFFOUUsQ0FBQyxHQUFHRSxDQUFFLENBQzFHLENBQUM7VUFFRCxNQUFNNkQsQ0FBQyxHQUFHLElBQUksQ0FBQ3BELE1BQU0sQ0FBRTFCLENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsQ0FBQzhFLGdCQUFnQixDQUFDakIsR0FBRyxDQUFDLENBQUM7VUFDdEQsTUFBTWtCLENBQUMsR0FBRyxJQUFJLENBQUN0RCxNQUFNLENBQUUxQixDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFLENBQUNnRixvQkFBb0IsQ0FBQ25CLEdBQUcsQ0FBQyxDQUFDO1VBQzFELE1BQU1nQyxLQUFLLEdBQUcsSUFBSSxDQUFDcEUsTUFBTSxDQUFFMUIsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRSxDQUFDcUYsNEJBQTRCLENBQUN4QixHQUFHLENBQUMsQ0FBQztVQUV0RSxJQUFJLENBQUNwQyxNQUFNLENBQUUxQixDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFLENBQUM4RSxnQkFBZ0IsQ0FBQ3RCLEdBQUcsQ0FBRXFCLENBQUMsQ0FBQ0ssSUFBSSxDQUFFSCxDQUFDLENBQUNHLElBQUksQ0FBRVcsS0FBTSxDQUFDLENBQUNELGNBQWMsQ0FBRXZCLEVBQUUsR0FBRyxDQUFFLENBQUUsQ0FBRSxDQUFDO1FBQ2xHLENBQUMsTUFDSTtVQUNILElBQUksQ0FBQzVDLE1BQU0sQ0FBRTFCLENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsQ0FBQ2dGLG9CQUFvQixDQUFDeEIsR0FBRyxDQUFFLElBQUloRixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBRSxDQUFDO1VBQ3JFLElBQUksQ0FBQ2lELE1BQU0sQ0FBRTFCLENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsQ0FBQzhFLGdCQUFnQixDQUFDdEIsR0FBRyxDQUFFLElBQUloRixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBRSxDQUFDO1FBQ25FO01BQ0Y7SUFDRjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRTJGLGlCQUFpQkEsQ0FBQSxFQUFHO0lBQ2xCLE1BQU0xQixDQUFDLEdBQUcsSUFBSSxDQUFDN0Isc0JBQXNCLENBQUNpRCxHQUFHLENBQUMsQ0FBQzs7SUFFM0M7SUFDQSxNQUFNaUMsa0JBQWtCLEdBQUcsRUFBRTtJQUM3QixNQUFNQyxrQkFBa0IsR0FBRyxFQUFFO0lBQzdCLE1BQU1DLGdDQUFnQyxHQUFHLEVBQUU7SUFDM0MsTUFBTUMsZ0NBQWdDLEdBQUcsRUFBRTtJQUMzQyxNQUFNQyx1Q0FBdUMsR0FBRyxFQUFFO0lBQ2xELE1BQU1DLHVDQUF1QyxHQUFHLEVBQUU7SUFFbEQsS0FBTSxJQUFJeEQsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxJQUFJRixDQUFDLEVBQUUsRUFBRUUsQ0FBQyxFQUFHO01BQzdCbUQsa0JBQWtCLENBQUVuRCxDQUFDLENBQUUsR0FBRyxFQUFFO01BQzVCb0Qsa0JBQWtCLENBQUVwRCxDQUFDLENBQUUsR0FBRyxFQUFFO01BQzVCcUQsZ0NBQWdDLENBQUVyRCxDQUFDLENBQUUsR0FBRyxFQUFFO01BQzFDc0QsZ0NBQWdDLENBQUV0RCxDQUFDLENBQUUsR0FBRyxFQUFFO01BQzFDdUQsdUNBQXVDLENBQUV2RCxDQUFDLENBQUUsR0FBRyxFQUFFO01BQ2pEd0QsdUNBQXVDLENBQUV4RCxDQUFDLENBQUUsR0FBRyxFQUFFO01BRWpELEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxJQUFJSCxDQUFDLEVBQUUsRUFBRUcsQ0FBQyxFQUFHO1FBQzdCLE1BQU13RCxjQUFjLEdBQUcsSUFBSSxDQUFDM0csd0JBQXdCLENBQUVrRCxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUVDLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQ2lCLEdBQUcsQ0FBQyxDQUFDO1FBQzVFLE1BQU13QyxjQUFjLEdBQUcsSUFBSSxDQUFDMUcsd0JBQXdCLENBQUVnRCxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUVDLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQ2lCLEdBQUcsQ0FBQyxDQUFDO1FBQzVFLE1BQU15QyxhQUFhLEdBQUcsSUFBSSxDQUFDeEcsdUJBQXVCLENBQUU2QyxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUVDLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQ2lCLEdBQUcsQ0FBQyxDQUFDO1FBQzFFLE1BQU0wQyxVQUFVLEdBQUcsSUFBSSxDQUFDM0csb0JBQW9CLENBQUUrQyxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUVDLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQ2lCLEdBQUcsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0yQyxVQUFVLEdBQUcsSUFBSSxDQUFDM0csb0JBQW9CLENBQUU4QyxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUVDLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQ2lCLEdBQUcsQ0FBQyxDQUFDO1FBRXBFLE1BQU00QyxrQkFBa0IsR0FBR0gsYUFBYSxHQUFHLElBQUksQ0FBQ3BDLFlBQVksQ0FBQ0wsR0FBRyxDQUFDLENBQUM7UUFDbEUsTUFBTTZDLDZCQUE2QixHQUFHRCxrQkFBa0IsR0FBR0YsVUFBVTtRQUNyRSxNQUFNSSw2QkFBNkIsR0FBR0Ysa0JBQWtCLEdBQUdELFVBQVU7O1FBRXJFO1FBQ0EsTUFBTUksZ0NBQWdDLEdBQUd6RixJQUFJLENBQUMwRixHQUFHLENBQUVILDZCQUE4QixDQUFDO1FBQ2xGLE1BQU1JLGdDQUFnQyxHQUFHM0YsSUFBSSxDQUFDMEYsR0FBRyxDQUFFRiw2QkFBOEIsQ0FBQztRQUVsRmIsa0JBQWtCLENBQUVuRCxDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFLEdBQUd3RCxjQUFjLEdBQUdRLGdDQUFnQztRQUNoRmIsa0JBQWtCLENBQUVwRCxDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFLEdBQUd5RCxjQUFjLEdBQUdTLGdDQUFnQztRQUVoRmQsZ0NBQWdDLENBQUVyRCxDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFLEdBQUcsQ0FBQzBELGFBQWEsR0FBR0YsY0FBYyxHQUM3QmpGLElBQUksQ0FBQ0UsR0FBRyxDQUFFcUYsNkJBQThCLENBQUM7UUFFeEZULGdDQUFnQyxDQUFFdEQsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRSxHQUFHLENBQUMwRCxhQUFhLEdBQUdELGNBQWMsR0FDN0JsRixJQUFJLENBQUNFLEdBQUcsQ0FBRXNGLDZCQUE4QixDQUFDO1FBRXhGVCx1Q0FBdUMsQ0FBRXZELENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUUsR0FBRyxFQUFHMEQsYUFBYSxJQUFJLENBQUMsQ0FBRSxHQUFHRixjQUFjLEdBQ3RDUSxnQ0FBZ0M7UUFFdEZULHVDQUF1QyxDQUFFeEQsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRSxHQUFHLEVBQUcwRCxhQUFhLElBQUksQ0FBQyxDQUFFLEdBQUdELGNBQWMsR0FDdENTLGdDQUFnQztNQUN4RjtJQUNGO0lBQ0EsS0FBTSxJQUFJL0csQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxJQUFJMEMsQ0FBQyxFQUFFLEVBQUUxQyxDQUFDLEVBQUc7TUFDN0IsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLElBQUl5QyxDQUFDLEVBQUUsRUFBRXpDLENBQUMsRUFBRztRQUM3Qjs7UUFFQSxNQUFNaUYsWUFBWSxHQUFHLElBQUl6RyxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztRQUN4QyxNQUFNdUksUUFBUSxHQUFHLElBQUl2SSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztRQUNwQyxNQUFNd0ksWUFBWSxHQUFHLElBQUl4SSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztRQUV4QyxNQUFNeUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDdkUsV0FBVyxDQUFFM0MsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRTtRQUNwRCxLQUFNLElBQUkyQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLElBQUlGLENBQUMsRUFBRSxFQUFFRSxDQUFDLEVBQUc7VUFDN0IsTUFBTXVFLGdCQUFnQixHQUFHRCxpQkFBaUIsQ0FBRXRFLENBQUMsQ0FBRTtVQUMvQyxLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsSUFBSUgsQ0FBQyxFQUFFLEVBQUVHLENBQUMsRUFBRztZQUM3Qjs7WUFFQSxNQUFNRixXQUFXLEdBQUd3RSxnQkFBZ0IsQ0FBRXRFLENBQUMsQ0FBRTtZQUV6Q3FDLFlBQVksQ0FBQ3BDLENBQUMsSUFBSUgsV0FBVyxHQUFHb0Qsa0JBQWtCLENBQUVuRCxDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFO1lBQzVEcUMsWUFBWSxDQUFDaEMsQ0FBQyxJQUFJUCxXQUFXLEdBQUdxRCxrQkFBa0IsQ0FBRXBELENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUU7WUFFNURtRSxRQUFRLENBQUNsRSxDQUFDLElBQUlILFdBQVcsR0FBR3NELGdDQUFnQyxDQUFFckQsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRTtZQUN0RW1FLFFBQVEsQ0FBQzlELENBQUMsSUFBSVAsV0FBVyxHQUFHdUQsZ0NBQWdDLENBQUV0RCxDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFO1lBRXRFb0UsWUFBWSxDQUFDbkUsQ0FBQyxJQUFJSCxXQUFXLEdBQUd3RCx1Q0FBdUMsQ0FBRXZELENBQUMsQ0FBRSxDQUFFQyxDQUFDLENBQUU7WUFDakZvRSxZQUFZLENBQUMvRCxDQUFDLElBQUlQLFdBQVcsR0FBR3lELHVDQUF1QyxDQUFFeEQsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRTtVQUNuRjtRQUNGO1FBRUEsSUFBSSxDQUFDbkIsTUFBTSxDQUFFMUIsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRSxDQUFDNEUsb0JBQW9CLENBQUNwQixHQUFHLENBQUV5QixZQUFhLENBQUM7UUFDOUQsSUFBSSxDQUFDeEQsTUFBTSxDQUFFMUIsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRSxDQUFDOEUsZ0JBQWdCLENBQUN0QixHQUFHLENBQUV1RCxRQUFTLENBQUM7UUFDdEQsSUFBSSxDQUFDdEYsTUFBTSxDQUFFMUIsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRSxDQUFDZ0Ysb0JBQW9CLENBQUN4QixHQUFHLENBQUV3RCxZQUFhLENBQUM7TUFFaEU7SUFDRjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VHLDhCQUE4QkEsQ0FBQSxFQUFHO0lBQy9CLElBQUksQ0FBQ2pELFlBQVksQ0FBQ0osS0FBSyxDQUFDLENBQUM7SUFDekIsTUFBTXJCLENBQUMsR0FBRyxJQUFJLENBQUM3QixzQkFBc0IsQ0FBQ2lELEdBQUcsQ0FBQyxDQUFDO0lBQzNDLEtBQU0sSUFBSWxCLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsSUFBSUYsQ0FBQyxFQUFFLEVBQUVFLENBQUMsRUFBRztNQUM3QixLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsSUFBSUgsQ0FBQyxFQUFFLEVBQUVHLENBQUMsRUFBRztRQUM3Qjs7UUFFQSxJQUFJd0UsdUJBQXVCLEdBQUcsQ0FBQztRQUMvQixJQUFJQyx1QkFBdUIsR0FBRyxDQUFDO1FBQy9CLElBQUlDLHVCQUF1QixHQUFHLENBQUM7UUFDL0IsSUFBSUMsdUJBQXVCLEdBQUcsQ0FBQztRQUMvQixLQUFNLElBQUl4SCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLElBQUkwQyxDQUFDLEVBQUUsRUFBRTFDLENBQUMsRUFBRztVQUM3QixLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsSUFBSXlDLENBQUMsRUFBRSxFQUFFekMsQ0FBQyxFQUFHO1lBQzdCOztZQUVBLE1BQU13SCxnQkFBZ0IsR0FBRyxJQUFJLENBQUMvRixNQUFNLENBQUUxQixDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFLENBQUM0RSxvQkFBb0IsQ0FBQ2YsR0FBRyxDQUFDLENBQUM7WUFDekUsTUFBTTRELFlBQVksR0FBRyxJQUFJLENBQUNoRyxNQUFNLENBQUUxQixDQUFDLENBQUUsQ0FBRUMsQ0FBQyxDQUFFLENBQUM4RSxnQkFBZ0IsQ0FBQ2pCLEdBQUcsQ0FBQyxDQUFDO1lBQ2pFLE1BQU15QyxhQUFhLEdBQUcsSUFBSSxDQUFDeEcsdUJBQXVCLENBQUU2QyxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUVDLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQ2lCLEdBQUcsQ0FBQyxDQUFDO1lBQzFFLE1BQU02RCx3QkFBd0IsR0FBSyxDQUFDLElBQUssQ0FBRWpGLENBQUMsR0FBRyxDQUFDLEtBQU9BLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBRSxHQUFLLElBQUksQ0FBQ0MsV0FBVyxDQUFFM0MsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRSxDQUFFMkMsQ0FBQyxDQUFFLENBQUVDLENBQUMsQ0FBRTtZQUV6R3dFLHVCQUF1QixJQUFJTSx3QkFBd0IsR0FBR0YsZ0JBQWdCLENBQUMzRSxDQUFDO1lBQ3hFeUUsdUJBQXVCLElBQUlJLHdCQUF3QixHQUFHRixnQkFBZ0IsQ0FBQ3ZFLENBQUM7WUFDeEVvRSx1QkFBdUIsSUFBTUssd0JBQXdCLEdBQUdwQixhQUFhLEdBQUttQixZQUFZLENBQUM1RSxDQUFDO1lBQ3hGMEUsdUJBQXVCLElBQU1HLHdCQUF3QixHQUFHcEIsYUFBYSxHQUFLbUIsWUFBWSxDQUFDeEUsQ0FBQztVQUMxRjtRQUVGO1FBQ0EsSUFBSSxDQUFDeEQsd0JBQXdCLENBQUVrRCxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUVDLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQ1ksR0FBRyxDQUNqRHJDLElBQUksQ0FBQ0MsSUFBSSxDQUFFZ0csdUJBQXVCLElBQUksQ0FBQyxHQUFHQyx1QkFBdUIsSUFBSSxDQUFFLENBQ3pFLENBQUM7UUFDRCxJQUFJLENBQUMxSCx3QkFBd0IsQ0FBRWdELENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBRUMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFDWSxHQUFHLENBQ2pEckMsSUFBSSxDQUFDQyxJQUFJLENBQUVrRyx1QkFBdUIsSUFBSSxDQUFDLEdBQUdDLHVCQUF1QixJQUFJLENBQUUsQ0FDekUsQ0FBQztRQUVELElBQUksQ0FBQzNILG9CQUFvQixDQUFFK0MsQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFFQyxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUNZLEdBQUcsQ0FDN0NyQyxJQUFJLENBQUN3RyxLQUFLLENBQUVOLHVCQUF1QixFQUFFRCx1QkFBd0IsQ0FDL0QsQ0FBQztRQUNELElBQUksQ0FBQ3ZILG9CQUFvQixDQUFFOEMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFFQyxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUNZLEdBQUcsQ0FDN0NyQyxJQUFJLENBQUN3RyxLQUFLLENBQUVKLHVCQUF1QixFQUFFRCx1QkFBd0IsQ0FDL0QsQ0FBQztNQUNIO0lBQ0Y7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sY0FBY0EsQ0FBRUMsSUFBSSxFQUFHO0lBQ3JCLElBQUlDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDbkIsSUFBSUMsVUFBVSxHQUFHLElBQUk7SUFDckIsS0FBTSxJQUFJaEksQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQzBCLE1BQU0sQ0FBQ1csTUFBTSxFQUFFckMsQ0FBQyxFQUFFLEVBQUc7TUFDN0MsTUFBTWlJLEtBQUssR0FBRyxJQUFJLENBQUN2RyxNQUFNLENBQUUxQixDQUFDLENBQUU7TUFDOUIrSCxVQUFVLEdBQUdFLEtBQUssQ0FBQ0MsT0FBTyxDQUFFSixJQUFLLENBQUM7TUFDbEMsSUFBS0MsVUFBVSxLQUFLLENBQUMsQ0FBQyxFQUFHO1FBQ3ZCQyxVQUFVLEdBQUdDLEtBQUs7UUFDbEI7TUFDRjtJQUNGO0lBQ0FFLE1BQU0sSUFBSUEsTUFBTSxDQUFFSixVQUFVLEtBQUssQ0FBQyxDQUFFLENBQUM7SUFDckMsT0FBTztNQUNML0gsQ0FBQyxFQUFFLElBQUksQ0FBQzBCLE1BQU0sQ0FBQ3dHLE9BQU8sQ0FBRUYsVUFBVyxDQUFDO01BQ3BDL0gsQ0FBQyxFQUFFOEg7SUFDTCxDQUFDO0VBQ0g7QUFDRjtBQUVBOUksV0FBVyxDQUFDbUosUUFBUSxDQUFFLG9CQUFvQixFQUFFL0ksa0JBQW1CLENBQUM7QUFDaEUsZUFBZUEsa0JBQWtCIn0=