// Copyright 2019-2022, University of Colorado Boulder

/**
 * BohrModel is a predictive model of the hydrogen atom.
 *
 * Physical representation:
 * Electron orbiting a proton. Each orbit corresponds to a different electron state. See createOrbitRadii for details
 * on how orbit radii are calculated.
 *
 * Collision behavior:
 * Photons may be absorbed if they collide with the electron.
 *
 * Absorption behavior:
 * Photons that match the transition wavelength of the electron's state are absorbed with some probability. Other
 * photons are not absorbed or affected.
 *
 * Emission behavior:
 * Spontaneous emission of a photon takes the electron to a lower state, and the photon emitted has the transition
 * wavelength that corresponds to the current and new state. Transition to each lower state is equally likely.
 * Stimulated emission of a photon occurs when a photon hits the electron, and the photon's wavelength corresponds
 * to a wavelength that could have been absorbed in a lower state.  In this case, the colliding photon is not absorbed,
 * but a new photon is emitted with the same wavelength, and the electron moves to the lower state.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import bohrButton_png from '../../../images/bohrButton_png.js';
import optionize from '../../../../phet-core/js/optionize.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import ModelsOfTheHydrogenAtomStrings from '../../ModelsOfTheHydrogenAtomStrings.js';
import HydrogenAtom from './HydrogenAtom.js';
import Utils from '../../../../dot/js/Utils.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import MOTHAUtils from '../MOTHAUtils.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Electron from './Electron.js';
import Proton from './Proton.js';
import Photon from './Photon.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import MOTHAConstants from '../MOTHAConstants.js';

// Radius of each electron orbit, ordered by increasing electron state number.
// These values are distorted to fit in zoomedInBox, and are specific to MOTHAConstants.ZOOMED_IN_BOX_MODEL_SIZE.
const ORBIT_RADII = [15, 44, 81, 124, 174, 233];

// Probability that a photon will be absorbed, [0,1]
const PHOTON_ABSORPTION_PROBABILITY = 1.0;

// Probability that a photon will cause stimulated emission, [0,1]
const PHOTON_STIMULATED_EMISSION_PROBABILITY = PHOTON_ABSORPTION_PROBABILITY;

// Probability that a photon will be emitted, [0,1]
const PHOTON_SPONTANEOUS_EMISSION_PROBABILITY = 0.5;

// Wavelengths must be less than this close to be considered equal
const WAVELENGTH_CLOSENESS_THRESHOLD = 0.5;

// How close an emitted photon is placed to the photon that causes stimulated emission
const STIMULATED_EMISSION_X_OFFSET = 10;
export default class BohrModel extends HydrogenAtom {
  // electron state number

  // time that the electron has been in its current state

  // current angle of electron

  // offset of the electron from the atom's center

  // minimum time (in sec) that electron stays in a state before emission can occur
  static MIN_TIME_IN_STATE = 1;

  // Change in orbit angle per dt for ground state orbit
  static ELECTRON_ANGLE_DELTA = Utils.toRadians(480);
  constructor(zoomedInBox, providedOptions) {
    const options = optionize()({
      // HydrogenAtomOptions
      displayNameProperty: ModelsOfTheHydrogenAtomStrings.bohrStringProperty,
      iconHTMLImageElement: bohrButton_png,
      hasTransitionWavelengths: true
    }, providedOptions);
    super(zoomedInBox, options);
    this.proton = new Proton({
      position: this.position,
      tandem: options.tandem.createTandem('proton')
    });
    this.electron = new Electron({
      //TODO position is not properly initialized
      tandem: options.tandem.createTandem('electron')
    });
    this.electronStateProperty = new NumberProperty(MOTHAConstants.GROUND_STATE, {
      numberType: 'Integer',
      range: new Range(MOTHAConstants.GROUND_STATE, MOTHAConstants.GROUND_STATE + ORBIT_RADII.length),
      tandem: options.tandem.createTandem('electronStateProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'primary electron state (n)'
    });
    this.timeInStateProperty = new NumberProperty(0, {
      tandem: options.tandem.createTandem('timeInStateProperty'),
      phetioReadOnly: true
    });

    // When the electron changes state, reset timeInStateProperty.
    //TODO this is an ordering problem for restoring PhET-iO state
    this.electronStateProperty.link(electronState => {
      this.timeInStateProperty.value = 0;
    });

    //TODO we want this to start at a different angle each time reset, but that conflicts with PhET-iO
    this.electronAngleProperty = new NumberProperty(MOTHAUtils.nextAngle(), {
      tandem: options.tandem.createTandem('electronAngleProperty'),
      phetioReadOnly: true
    });

    //TODO make this go away, just set electron.positionProperty directly
    this.electronOffsetProperty = new DerivedProperty([this.electronStateProperty, this.electronAngleProperty], (state, angle) => {
      const radius = this.getElectronOrbitRadius(state);
      return MOTHAUtils.polarToCartesian(radius, angle);
    }, {
      tandem: options.tandem.createTandem('electronOffsetProperty'),
      phetioValueType: Vector2.Vector2IO
    });
    this.electronOffsetProperty.link(electronOffset => {
      this.electron.positionProperty.value = this.position.plus(electronOffset);
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  reset() {
    this.proton.reset();
    this.electron.reset();
    this.electronStateProperty.reset();
    this.timeInStateProperty.reset();
    this.electronAngleProperty.reset();
    super.reset();
  }
  step(dt) {
    // Keep track of how long the electron has been in its current state.
    this.timeInStateProperty.value += dt;

    // Advance the electron along its orbit
    this.electronAngleProperty.value = this.calculateNewElectronAngle(dt);

    // Attempt to emit a photon
    this.attemptSpontaneousEmission();
  }

  //TODO normalize the return value to [0,2*Math.PI]
  /**
   * Calculates the new electron angle for some time step.
   * Subclasses may override this to produce different oscillation behavior.
   */
  calculateNewElectronAngle(dt) {
    const electronState = this.electronStateProperty.value;
    const deltaAngle = dt * (BohrModel.ELECTRON_ANGLE_DELTA / (electronState * electronState));
    return this.electronAngleProperty.value - deltaAngle; //TODO clockwise
  }

  movePhoton(photon, dt) {
    const absorbed = this.attemptAbsorption(photon);
    if (!absorbed) {
      this.attemptStimulatedEmission(photon);
      photon.move(dt);
    }
  }

  /**
   * Gets the number of electron states that the model supports.
   * This is the same as the number of orbits.
   */
  static getNumberOfStates() {
    return ORBIT_RADII.length;
  }

  /**
   * Gets the maximum electron state number.
   */
  static getMaxElectronState() {
    return MOTHAConstants.GROUND_STATE + BohrModel.getNumberOfStates() - 1;
  }
  setElectronState(n) {
    assert && assert(Number.isInteger(n));
    assert && assert(n >= MOTHAConstants.GROUND_STATE && n <= MOTHAConstants.GROUND_STATE + BohrModel.getNumberOfStates() - 1);
    if (n !== this.electronStateProperty.value) {
      this.electronStateProperty.value = n;
      this.timeInStateProperty.value = 0;
    }
  }
  getElectronState() {
    return this.electronStateProperty.value;
  }
  getElectronStateProperty() {
    return this.electronStateProperty;
  }

  //--------------------------------------------------------------------------------------------------------------------
  // Orbit methods
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * Gets the radius of the electron's orbit when it's in a specified state.
   */
  getElectronOrbitRadius(state) {
    return ORBIT_RADII[state - MOTHAConstants.GROUND_STATE];
  }

  /**
   * Gets the maximum radius of the electron's orbit.
   */
  getMaxElectronOrbitRadius() {
    return ORBIT_RADII[ORBIT_RADII.length - 1];
  }

  //--------------------------------------------------------------------------------------------------------------------
  // Wavelength methods
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * Gets the wavelength that must be absorbed for the electron to transition from state oldState to state newState,
   * where oldState < newState. This algorithm assumes that the ground state is 1.
   */
  static getWavelengthAbsorbed(oldState, newState) {
    assert && assert(Number.isInteger(oldState) && Number.isInteger(newState));
    assert && assert(MOTHAConstants.GROUND_STATE === 1);
    assert && assert(oldState >= MOTHAConstants.GROUND_STATE, `oldState=${oldState}`);
    assert && assert(oldState < newState, `oldState=${oldState} newState=${newState}`);
    assert && assert(newState <= MOTHAConstants.GROUND_STATE + BohrModel.getNumberOfStates(), `newState=${newState}`);
    return 1240.0 / (13.6 * (1.0 / (oldState * oldState) - 1.0 / (newState * newState)));
  }

  /**
   * Gets the wavelength that is emitted when the electron transitions from oldState to newState,
   * where newNew < oldState.
   */
  static getWavelengthEmitted(oldState, newState) {
    return BohrModel.getWavelengthAbsorbed(newState, oldState);
  }

  /**
   * Gets the wavelength that causes a transition between 2 specified states.
   */
  static getTransitionWavelength(oldState, newState) {
    assert && assert(oldState !== newState);
    if (newState < oldState) {
      return this.getWavelengthEmitted(oldState, newState);
    } else {
      return this.getWavelengthAbsorbed(oldState, newState);
    }
  }

  /**
   * Determines if two wavelengths are "close enough" for the purposes of absorption and emission.
   */
  closeEnough(wavelength1, wavelength2) {
    return Math.abs(wavelength1 - wavelength2) < WAVELENGTH_CLOSENESS_THRESHOLD;
  }

  /**
   * Gets the set of wavelengths that cause a state transition. With white light, the light prefers to fire
   * these wavelengths so that the probability of seeing a photon absorbed is higher.
   */
  static getTransitionWavelengths(minWavelength, maxWavelength) {
    assert && assert(minWavelength < maxWavelength);

    // Create the set of wavelengths, include only those between min and max.
    const wavelengths = [];
    const n = BohrModel.getNumberOfStates();
    const g = MOTHAConstants.GROUND_STATE;
    for (let i = g; i < g + n - 1; i++) {
      for (let j = i + 1; j < g + n; j++) {
        const wavelength = this.getWavelengthAbsorbed(i, j);
        if (wavelength >= minWavelength && wavelength <= maxWavelength) {
          wavelengths.push(wavelength);
        }
      }
    }
    return wavelengths;
  }

  //--------------------------------------------------------------------------------------------------------------------
  // Collision detection
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * Determines whether a photon collides with this atom. In this case, we treat the photon and electron as points,
   * and see if the points are close enough to cause a collision.
   */
  collides(photon) {
    const electronPosition = this.electron.positionProperty.value;
    const photonPosition = photon.positionProperty.value;
    const collisionCloseness = photon.radius + this.electron.radius;
    return this.pointsCollide(electronPosition, photonPosition, collisionCloseness);
  }

  //--------------------------------------------------------------------------------------------------------------------
  // Photon Absorption
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * Attempts to absorb a specified photon.
   */
  attemptAbsorption(photon) {
    let success = false;
    const currentState = this.electronStateProperty.value;

    // Has the electron been in this state long enough? And was this photon produced by the light?
    if (this.timeInStateProperty.value >= BohrModel.MIN_TIME_IN_STATE && !photon.wasEmitted) {
      // Do the photon and electron collide?
      const collide = this.collides(photon);
      if (collide) {
        // Is the photon absorbable, does it have a transition wavelength?
        let canAbsorb = false;
        let newState = 0;
        const maxState = MOTHAConstants.GROUND_STATE + BohrModel.getNumberOfStates() - 1;
        for (let n = currentState + 1; n <= maxState && !canAbsorb; n++) {
          const transitionWavelength = BohrModel.getWavelengthAbsorbed(currentState, n);
          if (this.closeEnough(photon.wavelength, transitionWavelength)) {
            canAbsorb = true;
            newState = n;
          }
        }

        // Is the transition that would occur allowed?
        if (!this.absorptionIsAllowed(currentState, newState)) {
          return false;
        }

        // Absorb the photon with some probability...
        if (canAbsorb && this.absorptionIsCertain()) {
          // absorb photon
          success = true;
          this.photonAbsorbedEmitter.emit(photon);

          // move electron to new state
          this.electronStateProperty.value = newState;
          this.timeInStateProperty.value = 0;
        }
      }
    }
    return success;
  }

  /**
   * Probabilistically determines whether to absorb a photon.
   */
  absorptionIsCertain() {
    return dotRandom.nextDouble() < PHOTON_ABSORPTION_PROBABILITY;
  }

  /**
   * Determines if a proposed state transition caused by absorption is legal. Always true for Bohr.
   */
  absorptionIsAllowed(oldState, newState) {
    return true;
  }

  //--------------------------------------------------------------------------------------------------------------------
  // Photon Stimulated Emission
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * Attempts to stimulate emission with a specified photon.
   *
   * Definition of stimulated emission, for state m < n:
   * If an electron in state n gets hit by a photon whose absorption
   * would cause a transition from state m to n, then the electron
   * should drop to state m and emit a photon.  The emitted photon
   * should be the same wavelength and be traveling alongside the
   * original photon.
   */
  attemptStimulatedEmission(photon) {
    let success = false;
    const currentState = this.electronStateProperty.value;

    // Are we in some state other than the ground state?
    // Has the electron been in this state long enough?
    // Was this photon produced by the light?
    if (currentState > MOTHAConstants.GROUND_STATE && this.timeInStateProperty.value >= BohrModel.MIN_TIME_IN_STATE && !photon.wasEmitted) {
      // Do the photon and electron collide?
      const collide = this.collides(photon);
      if (collide) {
        // Can this photon stimulate emission, does it have a transition wavelength?
        let canStimulateEmission = false;
        let newState = 0;
        for (let state = MOTHAConstants.GROUND_STATE; state < currentState && !canStimulateEmission; state++) {
          const transitionWavelength = BohrModel.getWavelengthAbsorbed(state, currentState);
          if (this.closeEnough(photon.wavelength, transitionWavelength)) {
            canStimulateEmission = true;
            newState = state;
          }
        }

        // Is the transition that would occur allowed?
        if (!this.stimulatedEmissionIsAllowed(currentState, newState)) {
          return false;
        }

        // Emit a photon with some probability...
        if (canStimulateEmission && this.stimulatedEmissionIsCertain()) {
          // This algorithm assumes that photons are moving vertically from bottom to top.
          assert && assert(photon.directionProperty.value === Math.PI / 2);

          // Create and emit a photon
          success = true;
          this.photonEmittedEmitter.emit(new Photon({
            wavelength: photon.wavelength,
            position: photon.positionProperty.value.plusXY(STIMULATED_EMISSION_X_OFFSET, 0),
            direction: photon.directionProperty.value,
            wasEmitted: true,
            tandem: Tandem.OPT_OUT //TODO create via PhetioGroup
          }));

          // move electron to new state
          this.electronStateProperty.value = newState;
        }
      }
    }
    return success;
  }

  /**
   * Probabilistically determines whether the atom will emit a photon via stimulated emission.
   */
  stimulatedEmissionIsCertain() {
    return dotRandom.nextDouble() < PHOTON_STIMULATED_EMISSION_PROBABILITY;
  }

  /**
   * Determines if a proposed state transition caused by stimulated emission is legal.
   * A Bohr transition is legal if the 2 states are different and newState >= ground state.
   */
  stimulatedEmissionIsAllowed(oldState, newState) {
    return oldState !== newState && newState >= MOTHAConstants.GROUND_STATE;
  }

  //--------------------------------------------------------------------------------------------------------------------
  // Photon Spontaneous Emission
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * Attempts to emit a photon from the electron's location, in a random direction.
   */
  attemptSpontaneousEmission() {
    let success = false;
    const currentState = this.electronStateProperty.value;

    // Are we in some state other than the ground state?
    // Has the electron been in this state long enough?
    if (currentState > MOTHAConstants.GROUND_STATE && this.timeInStateProperty.value >= BohrModel.MIN_TIME_IN_STATE) {
      //  Emit a photon with some probability...
      if (this.spontaneousEmissionIsCertain()) {
        const newState = this.chooseLowerElectronState();
        if (newState === -1) {
          // For some subclasses, there may be no valid transition.
          return false;
        }

        // Create and emit a photon
        success = true;
        this.photonEmittedEmitter.emit(new Photon({
          wavelength: BohrModel.getWavelengthEmitted(currentState, newState),
          position: this.getSpontaneousEmissionPosition(),
          direction: MOTHAUtils.nextAngle(),
          // in a random direction
          wasEmitted: true,
          tandem: Tandem.OPT_OUT //TODO create via PhetioGroup
        }));

        // move electron to new state
        this.electronStateProperty.value = newState;
      }
    }
    return success;
  }

  /**
   * Probabilistically determines whether the atom will spontaneously emit a photon.
   */
  spontaneousEmissionIsCertain() {
    return dotRandom.nextDouble() < PHOTON_SPONTANEOUS_EMISSION_PROBABILITY;
  }

  /**
   * Chooses a new state for the electron. The state chosen is a lower state. This is used when moving to
   * a lower state, during spontaneous emission. Each lower state has the same probability of being chosen.
   * @returns positive state number, -1 if there is no lower state
   */
  chooseLowerElectronState() {
    const currentState = this.electronStateProperty.value;
    if (currentState === MOTHAConstants.GROUND_STATE) {
      return -1;
    } else {
      return dotRandom.nextIntBetween(MOTHAConstants.GROUND_STATE, currentState - MOTHAConstants.GROUND_STATE);
    }
  }

  /**
   * Gets the position of a photon created via spontaneous emission.
   * The default behavior is to create the photon at the electron's position.
   */
  getSpontaneousEmissionPosition() {
    return this.electron.positionProperty.value;
  }
}
modelsOfTheHydrogenAtom.register('BohrModel', BohrModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2hyQnV0dG9uX3BuZyIsIm9wdGlvbml6ZSIsIm1vZGVsc09mVGhlSHlkcm9nZW5BdG9tIiwiTW9kZWxzT2ZUaGVIeWRyb2dlbkF0b21TdHJpbmdzIiwiSHlkcm9nZW5BdG9tIiwiVXRpbHMiLCJOdW1iZXJQcm9wZXJ0eSIsIk1PVEhBVXRpbHMiLCJSYW5nZSIsIlZlY3RvcjIiLCJFbGVjdHJvbiIsIlByb3RvbiIsIlBob3RvbiIsIkRlcml2ZWRQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIlRhbmRlbSIsIk1PVEhBQ29uc3RhbnRzIiwiT1JCSVRfUkFESUkiLCJQSE9UT05fQUJTT1JQVElPTl9QUk9CQUJJTElUWSIsIlBIT1RPTl9TVElNVUxBVEVEX0VNSVNTSU9OX1BST0JBQklMSVRZIiwiUEhPVE9OX1NQT05UQU5FT1VTX0VNSVNTSU9OX1BST0JBQklMSVRZIiwiV0FWRUxFTkdUSF9DTE9TRU5FU1NfVEhSRVNIT0xEIiwiU1RJTVVMQVRFRF9FTUlTU0lPTl9YX09GRlNFVCIsIkJvaHJNb2RlbCIsIk1JTl9USU1FX0lOX1NUQVRFIiwiRUxFQ1RST05fQU5HTEVfREVMVEEiLCJ0b1JhZGlhbnMiLCJjb25zdHJ1Y3RvciIsInpvb21lZEluQm94IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImRpc3BsYXlOYW1lUHJvcGVydHkiLCJib2hyU3RyaW5nUHJvcGVydHkiLCJpY29uSFRNTEltYWdlRWxlbWVudCIsImhhc1RyYW5zaXRpb25XYXZlbGVuZ3RocyIsInByb3RvbiIsInBvc2l0aW9uIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiZWxlY3Ryb24iLCJlbGVjdHJvblN0YXRlUHJvcGVydHkiLCJHUk9VTkRfU1RBVEUiLCJudW1iZXJUeXBlIiwicmFuZ2UiLCJsZW5ndGgiLCJwaGV0aW9SZWFkT25seSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJ0aW1lSW5TdGF0ZVByb3BlcnR5IiwibGluayIsImVsZWN0cm9uU3RhdGUiLCJ2YWx1ZSIsImVsZWN0cm9uQW5nbGVQcm9wZXJ0eSIsIm5leHRBbmdsZSIsImVsZWN0cm9uT2Zmc2V0UHJvcGVydHkiLCJzdGF0ZSIsImFuZ2xlIiwicmFkaXVzIiwiZ2V0RWxlY3Ryb25PcmJpdFJhZGl1cyIsInBvbGFyVG9DYXJ0ZXNpYW4iLCJwaGV0aW9WYWx1ZVR5cGUiLCJWZWN0b3IySU8iLCJlbGVjdHJvbk9mZnNldCIsInBvc2l0aW9uUHJvcGVydHkiLCJwbHVzIiwiZGlzcG9zZSIsImFzc2VydCIsInJlc2V0Iiwic3RlcCIsImR0IiwiY2FsY3VsYXRlTmV3RWxlY3Ryb25BbmdsZSIsImF0dGVtcHRTcG9udGFuZW91c0VtaXNzaW9uIiwiZGVsdGFBbmdsZSIsIm1vdmVQaG90b24iLCJwaG90b24iLCJhYnNvcmJlZCIsImF0dGVtcHRBYnNvcnB0aW9uIiwiYXR0ZW1wdFN0aW11bGF0ZWRFbWlzc2lvbiIsIm1vdmUiLCJnZXROdW1iZXJPZlN0YXRlcyIsImdldE1heEVsZWN0cm9uU3RhdGUiLCJzZXRFbGVjdHJvblN0YXRlIiwibiIsIk51bWJlciIsImlzSW50ZWdlciIsImdldEVsZWN0cm9uU3RhdGUiLCJnZXRFbGVjdHJvblN0YXRlUHJvcGVydHkiLCJnZXRNYXhFbGVjdHJvbk9yYml0UmFkaXVzIiwiZ2V0V2F2ZWxlbmd0aEFic29yYmVkIiwib2xkU3RhdGUiLCJuZXdTdGF0ZSIsImdldFdhdmVsZW5ndGhFbWl0dGVkIiwiZ2V0VHJhbnNpdGlvbldhdmVsZW5ndGgiLCJjbG9zZUVub3VnaCIsIndhdmVsZW5ndGgxIiwid2F2ZWxlbmd0aDIiLCJNYXRoIiwiYWJzIiwiZ2V0VHJhbnNpdGlvbldhdmVsZW5ndGhzIiwibWluV2F2ZWxlbmd0aCIsIm1heFdhdmVsZW5ndGgiLCJ3YXZlbGVuZ3RocyIsImciLCJpIiwiaiIsIndhdmVsZW5ndGgiLCJwdXNoIiwiY29sbGlkZXMiLCJlbGVjdHJvblBvc2l0aW9uIiwicGhvdG9uUG9zaXRpb24iLCJjb2xsaXNpb25DbG9zZW5lc3MiLCJwb2ludHNDb2xsaWRlIiwic3VjY2VzcyIsImN1cnJlbnRTdGF0ZSIsIndhc0VtaXR0ZWQiLCJjb2xsaWRlIiwiY2FuQWJzb3JiIiwibWF4U3RhdGUiLCJ0cmFuc2l0aW9uV2F2ZWxlbmd0aCIsImFic29ycHRpb25Jc0FsbG93ZWQiLCJhYnNvcnB0aW9uSXNDZXJ0YWluIiwicGhvdG9uQWJzb3JiZWRFbWl0dGVyIiwiZW1pdCIsIm5leHREb3VibGUiLCJjYW5TdGltdWxhdGVFbWlzc2lvbiIsInN0aW11bGF0ZWRFbWlzc2lvbklzQWxsb3dlZCIsInN0aW11bGF0ZWRFbWlzc2lvbklzQ2VydGFpbiIsImRpcmVjdGlvblByb3BlcnR5IiwiUEkiLCJwaG90b25FbWl0dGVkRW1pdHRlciIsInBsdXNYWSIsImRpcmVjdGlvbiIsIk9QVF9PVVQiLCJzcG9udGFuZW91c0VtaXNzaW9uSXNDZXJ0YWluIiwiY2hvb3NlTG93ZXJFbGVjdHJvblN0YXRlIiwiZ2V0U3BvbnRhbmVvdXNFbWlzc2lvblBvc2l0aW9uIiwibmV4dEludEJldHdlZW4iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJvaHJNb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCb2hyTW9kZWwgaXMgYSBwcmVkaWN0aXZlIG1vZGVsIG9mIHRoZSBoeWRyb2dlbiBhdG9tLlxyXG4gKlxyXG4gKiBQaHlzaWNhbCByZXByZXNlbnRhdGlvbjpcclxuICogRWxlY3Ryb24gb3JiaXRpbmcgYSBwcm90b24uIEVhY2ggb3JiaXQgY29ycmVzcG9uZHMgdG8gYSBkaWZmZXJlbnQgZWxlY3Ryb24gc3RhdGUuIFNlZSBjcmVhdGVPcmJpdFJhZGlpIGZvciBkZXRhaWxzXHJcbiAqIG9uIGhvdyBvcmJpdCByYWRpaSBhcmUgY2FsY3VsYXRlZC5cclxuICpcclxuICogQ29sbGlzaW9uIGJlaGF2aW9yOlxyXG4gKiBQaG90b25zIG1heSBiZSBhYnNvcmJlZCBpZiB0aGV5IGNvbGxpZGUgd2l0aCB0aGUgZWxlY3Ryb24uXHJcbiAqXHJcbiAqIEFic29ycHRpb24gYmVoYXZpb3I6XHJcbiAqIFBob3RvbnMgdGhhdCBtYXRjaCB0aGUgdHJhbnNpdGlvbiB3YXZlbGVuZ3RoIG9mIHRoZSBlbGVjdHJvbidzIHN0YXRlIGFyZSBhYnNvcmJlZCB3aXRoIHNvbWUgcHJvYmFiaWxpdHkuIE90aGVyXHJcbiAqIHBob3RvbnMgYXJlIG5vdCBhYnNvcmJlZCBvciBhZmZlY3RlZC5cclxuICpcclxuICogRW1pc3Npb24gYmVoYXZpb3I6XHJcbiAqIFNwb250YW5lb3VzIGVtaXNzaW9uIG9mIGEgcGhvdG9uIHRha2VzIHRoZSBlbGVjdHJvbiB0byBhIGxvd2VyIHN0YXRlLCBhbmQgdGhlIHBob3RvbiBlbWl0dGVkIGhhcyB0aGUgdHJhbnNpdGlvblxyXG4gKiB3YXZlbGVuZ3RoIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIGN1cnJlbnQgYW5kIG5ldyBzdGF0ZS4gVHJhbnNpdGlvbiB0byBlYWNoIGxvd2VyIHN0YXRlIGlzIGVxdWFsbHkgbGlrZWx5LlxyXG4gKiBTdGltdWxhdGVkIGVtaXNzaW9uIG9mIGEgcGhvdG9uIG9jY3VycyB3aGVuIGEgcGhvdG9uIGhpdHMgdGhlIGVsZWN0cm9uLCBhbmQgdGhlIHBob3RvbidzIHdhdmVsZW5ndGggY29ycmVzcG9uZHNcclxuICogdG8gYSB3YXZlbGVuZ3RoIHRoYXQgY291bGQgaGF2ZSBiZWVuIGFic29yYmVkIGluIGEgbG93ZXIgc3RhdGUuICBJbiB0aGlzIGNhc2UsIHRoZSBjb2xsaWRpbmcgcGhvdG9uIGlzIG5vdCBhYnNvcmJlZCxcclxuICogYnV0IGEgbmV3IHBob3RvbiBpcyBlbWl0dGVkIHdpdGggdGhlIHNhbWUgd2F2ZWxlbmd0aCwgYW5kIHRoZSBlbGVjdHJvbiBtb3ZlcyB0byB0aGUgbG93ZXIgc3RhdGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IGJvaHJCdXR0b25fcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9ib2hyQnV0dG9uX3BuZy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20gZnJvbSAnLi4vLi4vbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20uanMnO1xyXG5pbXBvcnQgTW9kZWxzT2ZUaGVIeWRyb2dlbkF0b21TdHJpbmdzIGZyb20gJy4uLy4uL01vZGVsc09mVGhlSHlkcm9nZW5BdG9tU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBIeWRyb2dlbkF0b20sIHsgSHlkcm9nZW5BdG9tT3B0aW9ucyB9IGZyb20gJy4vSHlkcm9nZW5BdG9tLmpzJztcclxuaW1wb3J0IFpvb21lZEluQm94IGZyb20gJy4vWm9vbWVkSW5Cb3guanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IE1PVEhBVXRpbHMgZnJvbSAnLi4vTU9USEFVdGlscy5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBFbGVjdHJvbiBmcm9tICcuL0VsZWN0cm9uLmpzJztcclxuaW1wb3J0IFByb3RvbiBmcm9tICcuL1Byb3Rvbi5qcyc7XHJcbmltcG9ydCBQaG90b24gZnJvbSAnLi9QaG90b24uanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IFBpY2tPcHRpb25hbCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja09wdGlvbmFsLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IE1PVEhBQ29uc3RhbnRzIGZyb20gJy4uL01PVEhBQ29uc3RhbnRzLmpzJztcclxuXHJcbi8vIFJhZGl1cyBvZiBlYWNoIGVsZWN0cm9uIG9yYml0LCBvcmRlcmVkIGJ5IGluY3JlYXNpbmcgZWxlY3Ryb24gc3RhdGUgbnVtYmVyLlxyXG4vLyBUaGVzZSB2YWx1ZXMgYXJlIGRpc3RvcnRlZCB0byBmaXQgaW4gem9vbWVkSW5Cb3gsIGFuZCBhcmUgc3BlY2lmaWMgdG8gTU9USEFDb25zdGFudHMuWk9PTUVEX0lOX0JPWF9NT0RFTF9TSVpFLlxyXG5jb25zdCBPUkJJVF9SQURJSSA9IFsgMTUsIDQ0LCA4MSwgMTI0LCAxNzQsIDIzMyBdO1xyXG5cclxuLy8gUHJvYmFiaWxpdHkgdGhhdCBhIHBob3RvbiB3aWxsIGJlIGFic29yYmVkLCBbMCwxXVxyXG5jb25zdCBQSE9UT05fQUJTT1JQVElPTl9QUk9CQUJJTElUWSA9IDEuMDtcclxuXHJcbi8vIFByb2JhYmlsaXR5IHRoYXQgYSBwaG90b24gd2lsbCBjYXVzZSBzdGltdWxhdGVkIGVtaXNzaW9uLCBbMCwxXVxyXG5jb25zdCBQSE9UT05fU1RJTVVMQVRFRF9FTUlTU0lPTl9QUk9CQUJJTElUWSA9IFBIT1RPTl9BQlNPUlBUSU9OX1BST0JBQklMSVRZO1xyXG5cclxuLy8gUHJvYmFiaWxpdHkgdGhhdCBhIHBob3RvbiB3aWxsIGJlIGVtaXR0ZWQsIFswLDFdXHJcbmNvbnN0IFBIT1RPTl9TUE9OVEFORU9VU19FTUlTU0lPTl9QUk9CQUJJTElUWSA9IDAuNTtcclxuXHJcbi8vIFdhdmVsZW5ndGhzIG11c3QgYmUgbGVzcyB0aGFuIHRoaXMgY2xvc2UgdG8gYmUgY29uc2lkZXJlZCBlcXVhbFxyXG5jb25zdCBXQVZFTEVOR1RIX0NMT1NFTkVTU19USFJFU0hPTEQgPSAwLjU7XHJcblxyXG4vLyBIb3cgY2xvc2UgYW4gZW1pdHRlZCBwaG90b24gaXMgcGxhY2VkIHRvIHRoZSBwaG90b24gdGhhdCBjYXVzZXMgc3RpbXVsYXRlZCBlbWlzc2lvblxyXG5jb25zdCBTVElNVUxBVEVEX0VNSVNTSU9OX1hfT0ZGU0VUID0gMTA7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbmV4cG9ydCB0eXBlIEJvaHJNb2RlbE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmXHJcbiAgUGlja09wdGlvbmFsPEh5ZHJvZ2VuQXRvbU9wdGlvbnMsICdkaXNwbGF5TmFtZVByb3BlcnR5JyB8ICdpY29uSFRNTEltYWdlRWxlbWVudCc+ICZcclxuICBQaWNrUmVxdWlyZWQ8SHlkcm9nZW5BdG9tT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQm9ock1vZGVsIGV4dGVuZHMgSHlkcm9nZW5BdG9tIHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHByb3RvbjogUHJvdG9uO1xyXG4gIHB1YmxpYyByZWFkb25seSBlbGVjdHJvbjogRWxlY3Ryb247XHJcblxyXG4gIC8vIGVsZWN0cm9uIHN0YXRlIG51bWJlclxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZWxlY3Ryb25TdGF0ZVByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuXHJcbiAgLy8gdGltZSB0aGF0IHRoZSBlbGVjdHJvbiBoYXMgYmVlbiBpbiBpdHMgY3VycmVudCBzdGF0ZVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgdGltZUluU3RhdGVQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjtcclxuXHJcbiAgLy8gY3VycmVudCBhbmdsZSBvZiBlbGVjdHJvblxyXG4gIHB1YmxpYyByZWFkb25seSBlbGVjdHJvbkFuZ2xlUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj47XHJcblxyXG4gIC8vIG9mZnNldCBvZiB0aGUgZWxlY3Ryb24gZnJvbSB0aGUgYXRvbSdzIGNlbnRlclxyXG4gIHByb3RlY3RlZCByZWFkb25seSBlbGVjdHJvbk9mZnNldFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxWZWN0b3IyPjtcclxuXHJcbiAgLy8gbWluaW11bSB0aW1lIChpbiBzZWMpIHRoYXQgZWxlY3Ryb24gc3RheXMgaW4gYSBzdGF0ZSBiZWZvcmUgZW1pc3Npb24gY2FuIG9jY3VyXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBNSU5fVElNRV9JTl9TVEFURSA9IDE7XHJcblxyXG4gIC8vIENoYW5nZSBpbiBvcmJpdCBhbmdsZSBwZXIgZHQgZm9yIGdyb3VuZCBzdGF0ZSBvcmJpdFxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgRUxFQ1RST05fQU5HTEVfREVMVEEgPSBVdGlscy50b1JhZGlhbnMoIDQ4MCApO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHpvb21lZEluQm94OiBab29tZWRJbkJveCwgcHJvdmlkZWRPcHRpb25zOiBCb2hyTW9kZWxPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Qm9ock1vZGVsT3B0aW9ucywgU2VsZk9wdGlvbnMsIEh5ZHJvZ2VuQXRvbU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIEh5ZHJvZ2VuQXRvbU9wdGlvbnNcclxuICAgICAgZGlzcGxheU5hbWVQcm9wZXJ0eTogTW9kZWxzT2ZUaGVIeWRyb2dlbkF0b21TdHJpbmdzLmJvaHJTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgaWNvbkhUTUxJbWFnZUVsZW1lbnQ6IGJvaHJCdXR0b25fcG5nLFxyXG4gICAgICBoYXNUcmFuc2l0aW9uV2F2ZWxlbmd0aHM6IHRydWVcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCB6b29tZWRJbkJveCwgb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMucHJvdG9uID0gbmV3IFByb3Rvbigge1xyXG4gICAgICBwb3NpdGlvbjogdGhpcy5wb3NpdGlvbixcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwcm90b24nIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmVsZWN0cm9uID0gbmV3IEVsZWN0cm9uKCB7XHJcbiAgICAgIC8vVE9ETyBwb3NpdGlvbiBpcyBub3QgcHJvcGVybHkgaW5pdGlhbGl6ZWRcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJvbicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZWxlY3Ryb25TdGF0ZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBNT1RIQUNvbnN0YW50cy5HUk9VTkRfU1RBVEUsIHtcclxuICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInLFxyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCBNT1RIQUNvbnN0YW50cy5HUk9VTkRfU1RBVEUsIE1PVEhBQ29uc3RhbnRzLkdST1VORF9TVEFURSArIE9SQklUX1JBRElJLmxlbmd0aCApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VsZWN0cm9uU3RhdGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdwcmltYXJ5IGVsZWN0cm9uIHN0YXRlIChuKSdcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnRpbWVJblN0YXRlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aW1lSW5TdGF0ZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIGVsZWN0cm9uIGNoYW5nZXMgc3RhdGUsIHJlc2V0IHRpbWVJblN0YXRlUHJvcGVydHkuXHJcbiAgICAvL1RPRE8gdGhpcyBpcyBhbiBvcmRlcmluZyBwcm9ibGVtIGZvciByZXN0b3JpbmcgUGhFVC1pTyBzdGF0ZVxyXG4gICAgdGhpcy5lbGVjdHJvblN0YXRlUHJvcGVydHkubGluayggZWxlY3Ryb25TdGF0ZSA9PiB7XHJcbiAgICAgIHRoaXMudGltZUluU3RhdGVQcm9wZXJ0eS52YWx1ZSA9IDA7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy9UT0RPIHdlIHdhbnQgdGhpcyB0byBzdGFydCBhdCBhIGRpZmZlcmVudCBhbmdsZSBlYWNoIHRpbWUgcmVzZXQsIGJ1dCB0aGF0IGNvbmZsaWN0cyB3aXRoIFBoRVQtaU9cclxuICAgIHRoaXMuZWxlY3Ryb25BbmdsZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBNT1RIQVV0aWxzLm5leHRBbmdsZSgpLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZWxlY3Ryb25BbmdsZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vVE9ETyBtYWtlIHRoaXMgZ28gYXdheSwganVzdCBzZXQgZWxlY3Ryb24ucG9zaXRpb25Qcm9wZXJ0eSBkaXJlY3RseVxyXG4gICAgdGhpcy5lbGVjdHJvbk9mZnNldFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB0aGlzLmVsZWN0cm9uU3RhdGVQcm9wZXJ0eSwgdGhpcy5lbGVjdHJvbkFuZ2xlUHJvcGVydHkgXSxcclxuICAgICAgKCBzdGF0ZSwgYW5nbGUgKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcmFkaXVzID0gdGhpcy5nZXRFbGVjdHJvbk9yYml0UmFkaXVzKCBzdGF0ZSApO1xyXG4gICAgICAgIHJldHVybiBNT1RIQVV0aWxzLnBvbGFyVG9DYXJ0ZXNpYW4oIHJhZGl1cywgYW5nbGUgKTtcclxuICAgICAgfSwge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZWxlY3Ryb25PZmZzZXRQcm9wZXJ0eScgKSxcclxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IFZlY3RvcjIuVmVjdG9yMklPXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmVsZWN0cm9uT2Zmc2V0UHJvcGVydHkubGluayggZWxlY3Ryb25PZmZzZXQgPT4ge1xyXG4gICAgICB0aGlzLmVsZWN0cm9uLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSB0aGlzLnBvc2l0aW9uLnBsdXMoIGVsZWN0cm9uT2Zmc2V0ICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5wcm90b24ucmVzZXQoKTtcclxuICAgIHRoaXMuZWxlY3Ryb24ucmVzZXQoKTtcclxuICAgIHRoaXMuZWxlY3Ryb25TdGF0ZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRpbWVJblN0YXRlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZWxlY3Ryb25BbmdsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICBzdXBlci5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIHN0ZXAoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gS2VlcCB0cmFjayBvZiBob3cgbG9uZyB0aGUgZWxlY3Ryb24gaGFzIGJlZW4gaW4gaXRzIGN1cnJlbnQgc3RhdGUuXHJcbiAgICB0aGlzLnRpbWVJblN0YXRlUHJvcGVydHkudmFsdWUgKz0gZHQ7XHJcblxyXG4gICAgLy8gQWR2YW5jZSB0aGUgZWxlY3Ryb24gYWxvbmcgaXRzIG9yYml0XHJcbiAgICB0aGlzLmVsZWN0cm9uQW5nbGVQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuY2FsY3VsYXRlTmV3RWxlY3Ryb25BbmdsZSggZHQgKTtcclxuXHJcbiAgICAvLyBBdHRlbXB0IHRvIGVtaXQgYSBwaG90b25cclxuICAgIHRoaXMuYXR0ZW1wdFNwb250YW5lb3VzRW1pc3Npb24oKTtcclxuICB9XHJcblxyXG4gIC8vVE9ETyBub3JtYWxpemUgdGhlIHJldHVybiB2YWx1ZSB0byBbMCwyKk1hdGguUEldXHJcbiAgLyoqXHJcbiAgICogQ2FsY3VsYXRlcyB0aGUgbmV3IGVsZWN0cm9uIGFuZ2xlIGZvciBzb21lIHRpbWUgc3RlcC5cclxuICAgKiBTdWJjbGFzc2VzIG1heSBvdmVycmlkZSB0aGlzIHRvIHByb2R1Y2UgZGlmZmVyZW50IG9zY2lsbGF0aW9uIGJlaGF2aW9yLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBjYWxjdWxhdGVOZXdFbGVjdHJvbkFuZ2xlKCBkdDogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBjb25zdCBlbGVjdHJvblN0YXRlID0gdGhpcy5lbGVjdHJvblN0YXRlUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBkZWx0YUFuZ2xlID0gZHQgKiAoIEJvaHJNb2RlbC5FTEVDVFJPTl9BTkdMRV9ERUxUQSAvICggZWxlY3Ryb25TdGF0ZSAqIGVsZWN0cm9uU3RhdGUgKSApO1xyXG4gICAgcmV0dXJuIHRoaXMuZWxlY3Ryb25BbmdsZVByb3BlcnR5LnZhbHVlIC0gZGVsdGFBbmdsZTsgLy9UT0RPIGNsb2Nrd2lzZVxyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIG1vdmVQaG90b24oIHBob3RvbjogUGhvdG9uLCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgY29uc3QgYWJzb3JiZWQgPSB0aGlzLmF0dGVtcHRBYnNvcnB0aW9uKCBwaG90b24gKTtcclxuICAgIGlmICggIWFic29yYmVkICkge1xyXG4gICAgICB0aGlzLmF0dGVtcHRTdGltdWxhdGVkRW1pc3Npb24oIHBob3RvbiApO1xyXG4gICAgICBwaG90b24ubW92ZSggZHQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG51bWJlciBvZiBlbGVjdHJvbiBzdGF0ZXMgdGhhdCB0aGUgbW9kZWwgc3VwcG9ydHMuXHJcbiAgICogVGhpcyBpcyB0aGUgc2FtZSBhcyB0aGUgbnVtYmVyIG9mIG9yYml0cy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIG92ZXJyaWRlIGdldE51bWJlck9mU3RhdGVzKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gT1JCSVRfUkFESUkubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgbWF4aW11bSBlbGVjdHJvbiBzdGF0ZSBudW1iZXIuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBnZXRNYXhFbGVjdHJvblN0YXRlKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gTU9USEFDb25zdGFudHMuR1JPVU5EX1NUQVRFICsgQm9ock1vZGVsLmdldE51bWJlck9mU3RhdGVzKCkgLSAxO1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIHNldEVsZWN0cm9uU3RhdGUoIG46IG51bWJlciApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG4gKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbiA+PSBNT1RIQUNvbnN0YW50cy5HUk9VTkRfU1RBVEUgJiYgbiA8PSBNT1RIQUNvbnN0YW50cy5HUk9VTkRfU1RBVEUgKyBCb2hyTW9kZWwuZ2V0TnVtYmVyT2ZTdGF0ZXMoKSAtIDEgKTtcclxuXHJcbiAgICBpZiAoIG4gIT09IHRoaXMuZWxlY3Ryb25TdGF0ZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLmVsZWN0cm9uU3RhdGVQcm9wZXJ0eS52YWx1ZSA9IG47XHJcbiAgICAgIHRoaXMudGltZUluU3RhdGVQcm9wZXJ0eS52YWx1ZSA9IDA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0RWxlY3Ryb25TdGF0ZSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZWxlY3Ryb25TdGF0ZVByb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEVsZWN0cm9uU3RhdGVQcm9wZXJ0eSgpOiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+IHtcclxuICAgIHJldHVybiB0aGlzLmVsZWN0cm9uU3RhdGVQcm9wZXJ0eTtcclxuICB9XHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBPcmJpdCBtZXRob2RzXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSByYWRpdXMgb2YgdGhlIGVsZWN0cm9uJ3Mgb3JiaXQgd2hlbiBpdCdzIGluIGEgc3BlY2lmaWVkIHN0YXRlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRFbGVjdHJvbk9yYml0UmFkaXVzKCBzdGF0ZTogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gT1JCSVRfUkFESUlbIHN0YXRlIC0gTU9USEFDb25zdGFudHMuR1JPVU5EX1NUQVRFIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBtYXhpbXVtIHJhZGl1cyBvZiB0aGUgZWxlY3Ryb24ncyBvcmJpdC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TWF4RWxlY3Ryb25PcmJpdFJhZGl1cygpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIE9SQklUX1JBRElJWyBPUkJJVF9SQURJSS5sZW5ndGggLSAxIF07XHJcbiAgfVxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gV2F2ZWxlbmd0aCBtZXRob2RzXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB3YXZlbGVuZ3RoIHRoYXQgbXVzdCBiZSBhYnNvcmJlZCBmb3IgdGhlIGVsZWN0cm9uIHRvIHRyYW5zaXRpb24gZnJvbSBzdGF0ZSBvbGRTdGF0ZSB0byBzdGF0ZSBuZXdTdGF0ZSxcclxuICAgKiB3aGVyZSBvbGRTdGF0ZSA8IG5ld1N0YXRlLiBUaGlzIGFsZ29yaXRobSBhc3N1bWVzIHRoYXQgdGhlIGdyb3VuZCBzdGF0ZSBpcyAxLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZ2V0V2F2ZWxlbmd0aEFic29yYmVkKCBvbGRTdGF0ZTogbnVtYmVyLCBuZXdTdGF0ZTogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBvbGRTdGF0ZSApICYmIE51bWJlci5pc0ludGVnZXIoIG5ld1N0YXRlICkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE1PVEhBQ29uc3RhbnRzLkdST1VORF9TVEFURSA9PT0gMSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb2xkU3RhdGUgPj0gTU9USEFDb25zdGFudHMuR1JPVU5EX1NUQVRFLCBgb2xkU3RhdGU9JHtvbGRTdGF0ZX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvbGRTdGF0ZSA8IG5ld1N0YXRlLCBgb2xkU3RhdGU9JHtvbGRTdGF0ZX0gbmV3U3RhdGU9JHtuZXdTdGF0ZX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBuZXdTdGF0ZSA8PSBNT1RIQUNvbnN0YW50cy5HUk9VTkRfU1RBVEUgKyBCb2hyTW9kZWwuZ2V0TnVtYmVyT2ZTdGF0ZXMoKSwgYG5ld1N0YXRlPSR7bmV3U3RhdGV9YCApO1xyXG4gICAgcmV0dXJuIDEyNDAuMCAvICggMTMuNiAqICggKCAxLjAgLyAoIG9sZFN0YXRlICogb2xkU3RhdGUgKSApIC0gKCAxLjAgLyAoIG5ld1N0YXRlICogbmV3U3RhdGUgKSApICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHdhdmVsZW5ndGggdGhhdCBpcyBlbWl0dGVkIHdoZW4gdGhlIGVsZWN0cm9uIHRyYW5zaXRpb25zIGZyb20gb2xkU3RhdGUgdG8gbmV3U3RhdGUsXHJcbiAgICogd2hlcmUgbmV3TmV3IDwgb2xkU3RhdGUuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBnZXRXYXZlbGVuZ3RoRW1pdHRlZCggb2xkU3RhdGU6IG51bWJlciwgbmV3U3RhdGU6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIEJvaHJNb2RlbC5nZXRXYXZlbGVuZ3RoQWJzb3JiZWQoIG5ld1N0YXRlLCBvbGRTdGF0ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgd2F2ZWxlbmd0aCB0aGF0IGNhdXNlcyBhIHRyYW5zaXRpb24gYmV0d2VlbiAyIHNwZWNpZmllZCBzdGF0ZXMuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBnZXRUcmFuc2l0aW9uV2F2ZWxlbmd0aCggb2xkU3RhdGU6IG51bWJlciwgbmV3U3RhdGU6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb2xkU3RhdGUgIT09IG5ld1N0YXRlICk7XHJcbiAgICBpZiAoIG5ld1N0YXRlIDwgb2xkU3RhdGUgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmdldFdhdmVsZW5ndGhFbWl0dGVkKCBvbGRTdGF0ZSwgbmV3U3RhdGUgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5nZXRXYXZlbGVuZ3RoQWJzb3JiZWQoIG9sZFN0YXRlLCBuZXdTdGF0ZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyBpZiB0d28gd2F2ZWxlbmd0aHMgYXJlIFwiY2xvc2UgZW5vdWdoXCIgZm9yIHRoZSBwdXJwb3NlcyBvZiBhYnNvcnB0aW9uIGFuZCBlbWlzc2lvbi5cclxuICAgKi9cclxuICBwcml2YXRlIGNsb3NlRW5vdWdoKCB3YXZlbGVuZ3RoMTogbnVtYmVyLCB3YXZlbGVuZ3RoMjogbnVtYmVyICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICggTWF0aC5hYnMoIHdhdmVsZW5ndGgxIC0gd2F2ZWxlbmd0aDIgKSA8IFdBVkVMRU5HVEhfQ0xPU0VORVNTX1RIUkVTSE9MRCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgc2V0IG9mIHdhdmVsZW5ndGhzIHRoYXQgY2F1c2UgYSBzdGF0ZSB0cmFuc2l0aW9uLiBXaXRoIHdoaXRlIGxpZ2h0LCB0aGUgbGlnaHQgcHJlZmVycyB0byBmaXJlXHJcbiAgICogdGhlc2Ugd2F2ZWxlbmd0aHMgc28gdGhhdCB0aGUgcHJvYmFiaWxpdHkgb2Ygc2VlaW5nIGEgcGhvdG9uIGFic29yYmVkIGlzIGhpZ2hlci5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGdldFRyYW5zaXRpb25XYXZlbGVuZ3RocyggbWluV2F2ZWxlbmd0aDogbnVtYmVyLCBtYXhXYXZlbGVuZ3RoOiBudW1iZXIgKTogbnVtYmVyW10ge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWluV2F2ZWxlbmd0aCA8IG1heFdhdmVsZW5ndGggKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIHNldCBvZiB3YXZlbGVuZ3RocywgaW5jbHVkZSBvbmx5IHRob3NlIGJldHdlZW4gbWluIGFuZCBtYXguXHJcbiAgICBjb25zdCB3YXZlbGVuZ3RocyA9IFtdO1xyXG4gICAgY29uc3QgbiA9IEJvaHJNb2RlbC5nZXROdW1iZXJPZlN0YXRlcygpO1xyXG4gICAgY29uc3QgZyA9IE1PVEhBQ29uc3RhbnRzLkdST1VORF9TVEFURTtcclxuICAgIGZvciAoIGxldCBpID0gZzsgaSA8IGcgKyBuIC0gMTsgaSsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IGkgKyAxOyBqIDwgZyArIG47IGorKyApIHtcclxuICAgICAgICBjb25zdCB3YXZlbGVuZ3RoID0gdGhpcy5nZXRXYXZlbGVuZ3RoQWJzb3JiZWQoIGksIGogKTtcclxuICAgICAgICBpZiAoIHdhdmVsZW5ndGggPj0gbWluV2F2ZWxlbmd0aCAmJiB3YXZlbGVuZ3RoIDw9IG1heFdhdmVsZW5ndGggKSB7XHJcbiAgICAgICAgICB3YXZlbGVuZ3Rocy5wdXNoKCB3YXZlbGVuZ3RoICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gd2F2ZWxlbmd0aHM7XHJcbiAgfVxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gQ29sbGlzaW9uIGRldGVjdGlvblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgcGhvdG9uIGNvbGxpZGVzIHdpdGggdGhpcyBhdG9tLiBJbiB0aGlzIGNhc2UsIHdlIHRyZWF0IHRoZSBwaG90b24gYW5kIGVsZWN0cm9uIGFzIHBvaW50cyxcclxuICAgKiBhbmQgc2VlIGlmIHRoZSBwb2ludHMgYXJlIGNsb3NlIGVub3VnaCB0byBjYXVzZSBhIGNvbGxpc2lvbi5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgY29sbGlkZXMoIHBob3RvbjogUGhvdG9uICk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgZWxlY3Ryb25Qb3NpdGlvbiA9IHRoaXMuZWxlY3Ryb24ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IHBob3RvblBvc2l0aW9uID0gcGhvdG9uLnBvc2l0aW9uUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBjb2xsaXNpb25DbG9zZW5lc3MgPSBwaG90b24ucmFkaXVzICsgdGhpcy5lbGVjdHJvbi5yYWRpdXM7XHJcbiAgICByZXR1cm4gdGhpcy5wb2ludHNDb2xsaWRlKCBlbGVjdHJvblBvc2l0aW9uLCBwaG90b25Qb3NpdGlvbiwgY29sbGlzaW9uQ2xvc2VuZXNzICk7XHJcbiAgfVxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gUGhvdG9uIEFic29ycHRpb25cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGVtcHRzIHRvIGFic29yYiBhIHNwZWNpZmllZCBwaG90b24uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhdHRlbXB0QWJzb3JwdGlvbiggcGhvdG9uOiBQaG90b24gKTogYm9vbGVhbiB7XHJcblxyXG4gICAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgIGNvbnN0IGN1cnJlbnRTdGF0ZSA9IHRoaXMuZWxlY3Ryb25TdGF0ZVByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIC8vIEhhcyB0aGUgZWxlY3Ryb24gYmVlbiBpbiB0aGlzIHN0YXRlIGxvbmcgZW5vdWdoPyBBbmQgd2FzIHRoaXMgcGhvdG9uIHByb2R1Y2VkIGJ5IHRoZSBsaWdodD9cclxuICAgIGlmICggdGhpcy50aW1lSW5TdGF0ZVByb3BlcnR5LnZhbHVlID49IEJvaHJNb2RlbC5NSU5fVElNRV9JTl9TVEFURSAmJiAhcGhvdG9uLndhc0VtaXR0ZWQgKSB7XHJcblxyXG4gICAgICAvLyBEbyB0aGUgcGhvdG9uIGFuZCBlbGVjdHJvbiBjb2xsaWRlP1xyXG4gICAgICBjb25zdCBjb2xsaWRlID0gdGhpcy5jb2xsaWRlcyggcGhvdG9uICk7XHJcbiAgICAgIGlmICggY29sbGlkZSApIHtcclxuXHJcbiAgICAgICAgLy8gSXMgdGhlIHBob3RvbiBhYnNvcmJhYmxlLCBkb2VzIGl0IGhhdmUgYSB0cmFuc2l0aW9uIHdhdmVsZW5ndGg/XHJcbiAgICAgICAgbGV0IGNhbkFic29yYiA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBuZXdTdGF0ZSA9IDA7XHJcbiAgICAgICAgY29uc3QgbWF4U3RhdGUgPSBNT1RIQUNvbnN0YW50cy5HUk9VTkRfU1RBVEUgKyBCb2hyTW9kZWwuZ2V0TnVtYmVyT2ZTdGF0ZXMoKSAtIDE7XHJcbiAgICAgICAgZm9yICggbGV0IG4gPSBjdXJyZW50U3RhdGUgKyAxOyBuIDw9IG1heFN0YXRlICYmICFjYW5BYnNvcmI7IG4rKyApIHtcclxuICAgICAgICAgIGNvbnN0IHRyYW5zaXRpb25XYXZlbGVuZ3RoID0gQm9ock1vZGVsLmdldFdhdmVsZW5ndGhBYnNvcmJlZCggY3VycmVudFN0YXRlLCBuICk7XHJcbiAgICAgICAgICBpZiAoIHRoaXMuY2xvc2VFbm91Z2goIHBob3Rvbi53YXZlbGVuZ3RoLCB0cmFuc2l0aW9uV2F2ZWxlbmd0aCApICkge1xyXG4gICAgICAgICAgICBjYW5BYnNvcmIgPSB0cnVlO1xyXG4gICAgICAgICAgICBuZXdTdGF0ZSA9IG47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJcyB0aGUgdHJhbnNpdGlvbiB0aGF0IHdvdWxkIG9jY3VyIGFsbG93ZWQ/XHJcbiAgICAgICAgaWYgKCAhdGhpcy5hYnNvcnB0aW9uSXNBbGxvd2VkKCBjdXJyZW50U3RhdGUsIG5ld1N0YXRlICkgKSB7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBYnNvcmIgdGhlIHBob3RvbiB3aXRoIHNvbWUgcHJvYmFiaWxpdHkuLi5cclxuICAgICAgICBpZiAoIGNhbkFic29yYiAmJiB0aGlzLmFic29ycHRpb25Jc0NlcnRhaW4oKSApIHtcclxuXHJcbiAgICAgICAgICAvLyBhYnNvcmIgcGhvdG9uXHJcbiAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMucGhvdG9uQWJzb3JiZWRFbWl0dGVyLmVtaXQoIHBob3RvbiApO1xyXG5cclxuICAgICAgICAgIC8vIG1vdmUgZWxlY3Ryb24gdG8gbmV3IHN0YXRlXHJcbiAgICAgICAgICB0aGlzLmVsZWN0cm9uU3RhdGVQcm9wZXJ0eS52YWx1ZSA9IG5ld1N0YXRlO1xyXG4gICAgICAgICAgdGhpcy50aW1lSW5TdGF0ZVByb3BlcnR5LnZhbHVlID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc3VjY2VzcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByb2JhYmlsaXN0aWNhbGx5IGRldGVybWluZXMgd2hldGhlciB0byBhYnNvcmIgYSBwaG90b24uXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGFic29ycHRpb25Jc0NlcnRhaW4oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gZG90UmFuZG9tLm5leHREb3VibGUoKSA8IFBIT1RPTl9BQlNPUlBUSU9OX1BST0JBQklMSVRZO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyBpZiBhIHByb3Bvc2VkIHN0YXRlIHRyYW5zaXRpb24gY2F1c2VkIGJ5IGFic29ycHRpb24gaXMgbGVnYWwuIEFsd2F5cyB0cnVlIGZvciBCb2hyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYWJzb3JwdGlvbklzQWxsb3dlZCggb2xkU3RhdGU6IG51bWJlciwgbmV3U3RhdGU6IG51bWJlciApOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIFBob3RvbiBTdGltdWxhdGVkIEVtaXNzaW9uXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvKipcclxuICAgKiBBdHRlbXB0cyB0byBzdGltdWxhdGUgZW1pc3Npb24gd2l0aCBhIHNwZWNpZmllZCBwaG90b24uXHJcbiAgICpcclxuICAgKiBEZWZpbml0aW9uIG9mIHN0aW11bGF0ZWQgZW1pc3Npb24sIGZvciBzdGF0ZSBtIDwgbjpcclxuICAgKiBJZiBhbiBlbGVjdHJvbiBpbiBzdGF0ZSBuIGdldHMgaGl0IGJ5IGEgcGhvdG9uIHdob3NlIGFic29ycHRpb25cclxuICAgKiB3b3VsZCBjYXVzZSBhIHRyYW5zaXRpb24gZnJvbSBzdGF0ZSBtIHRvIG4sIHRoZW4gdGhlIGVsZWN0cm9uXHJcbiAgICogc2hvdWxkIGRyb3AgdG8gc3RhdGUgbSBhbmQgZW1pdCBhIHBob3Rvbi4gIFRoZSBlbWl0dGVkIHBob3RvblxyXG4gICAqIHNob3VsZCBiZSB0aGUgc2FtZSB3YXZlbGVuZ3RoIGFuZCBiZSB0cmF2ZWxpbmcgYWxvbmdzaWRlIHRoZVxyXG4gICAqIG9yaWdpbmFsIHBob3Rvbi5cclxuICAgKi9cclxuICBwcml2YXRlIGF0dGVtcHRTdGltdWxhdGVkRW1pc3Npb24oIHBob3RvbjogUGhvdG9uICk6IGJvb2xlYW4ge1xyXG5cclxuICAgIGxldCBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICBjb25zdCBjdXJyZW50U3RhdGUgPSB0aGlzLmVsZWN0cm9uU3RhdGVQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAvLyBBcmUgd2UgaW4gc29tZSBzdGF0ZSBvdGhlciB0aGFuIHRoZSBncm91bmQgc3RhdGU/XHJcbiAgICAvLyBIYXMgdGhlIGVsZWN0cm9uIGJlZW4gaW4gdGhpcyBzdGF0ZSBsb25nIGVub3VnaD9cclxuICAgIC8vIFdhcyB0aGlzIHBob3RvbiBwcm9kdWNlZCBieSB0aGUgbGlnaHQ/XHJcbiAgICBpZiAoIGN1cnJlbnRTdGF0ZSA+IE1PVEhBQ29uc3RhbnRzLkdST1VORF9TVEFURSAmJlxyXG4gICAgICAgICB0aGlzLnRpbWVJblN0YXRlUHJvcGVydHkudmFsdWUgPj0gQm9ock1vZGVsLk1JTl9USU1FX0lOX1NUQVRFICYmXHJcbiAgICAgICAgICFwaG90b24ud2FzRW1pdHRlZCApIHtcclxuXHJcbiAgICAgIC8vIERvIHRoZSBwaG90b24gYW5kIGVsZWN0cm9uIGNvbGxpZGU/XHJcbiAgICAgIGNvbnN0IGNvbGxpZGUgPSB0aGlzLmNvbGxpZGVzKCBwaG90b24gKTtcclxuICAgICAgaWYgKCBjb2xsaWRlICkge1xyXG5cclxuICAgICAgICAvLyBDYW4gdGhpcyBwaG90b24gc3RpbXVsYXRlIGVtaXNzaW9uLCBkb2VzIGl0IGhhdmUgYSB0cmFuc2l0aW9uIHdhdmVsZW5ndGg/XHJcbiAgICAgICAgbGV0IGNhblN0aW11bGF0ZUVtaXNzaW9uID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IG5ld1N0YXRlID0gMDtcclxuICAgICAgICBmb3IgKCBsZXQgc3RhdGUgPSBNT1RIQUNvbnN0YW50cy5HUk9VTkRfU1RBVEU7IHN0YXRlIDwgY3VycmVudFN0YXRlICYmICFjYW5TdGltdWxhdGVFbWlzc2lvbjsgc3RhdGUrKyApIHtcclxuICAgICAgICAgIGNvbnN0IHRyYW5zaXRpb25XYXZlbGVuZ3RoID0gQm9ock1vZGVsLmdldFdhdmVsZW5ndGhBYnNvcmJlZCggc3RhdGUsIGN1cnJlbnRTdGF0ZSApO1xyXG4gICAgICAgICAgaWYgKCB0aGlzLmNsb3NlRW5vdWdoKCBwaG90b24ud2F2ZWxlbmd0aCwgdHJhbnNpdGlvbldhdmVsZW5ndGggKSApIHtcclxuICAgICAgICAgICAgY2FuU3RpbXVsYXRlRW1pc3Npb24gPSB0cnVlO1xyXG4gICAgICAgICAgICBuZXdTdGF0ZSA9IHN0YXRlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSXMgdGhlIHRyYW5zaXRpb24gdGhhdCB3b3VsZCBvY2N1ciBhbGxvd2VkP1xyXG4gICAgICAgIGlmICggIXRoaXMuc3RpbXVsYXRlZEVtaXNzaW9uSXNBbGxvd2VkKCBjdXJyZW50U3RhdGUsIG5ld1N0YXRlICkgKSB7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFbWl0IGEgcGhvdG9uIHdpdGggc29tZSBwcm9iYWJpbGl0eS4uLlxyXG4gICAgICAgIGlmICggY2FuU3RpbXVsYXRlRW1pc3Npb24gJiYgdGhpcy5zdGltdWxhdGVkRW1pc3Npb25Jc0NlcnRhaW4oKSApIHtcclxuXHJcbiAgICAgICAgICAvLyBUaGlzIGFsZ29yaXRobSBhc3N1bWVzIHRoYXQgcGhvdG9ucyBhcmUgbW92aW5nIHZlcnRpY2FsbHkgZnJvbSBib3R0b20gdG8gdG9wLlxyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGhvdG9uLmRpcmVjdGlvblByb3BlcnR5LnZhbHVlID09PSBNYXRoLlBJIC8gMiApO1xyXG5cclxuICAgICAgICAgIC8vIENyZWF0ZSBhbmQgZW1pdCBhIHBob3RvblxyXG4gICAgICAgICAgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLnBob3RvbkVtaXR0ZWRFbWl0dGVyLmVtaXQoIG5ldyBQaG90b24oIHtcclxuICAgICAgICAgICAgd2F2ZWxlbmd0aDogcGhvdG9uLndhdmVsZW5ndGgsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBwaG90b24ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzWFkoIFNUSU1VTEFURURfRU1JU1NJT05fWF9PRkZTRVQsIDAgKSxcclxuICAgICAgICAgICAgZGlyZWN0aW9uOiBwaG90b24uZGlyZWN0aW9uUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgICAgIHdhc0VtaXR0ZWQ6IHRydWUsXHJcbiAgICAgICAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgLy9UT0RPIGNyZWF0ZSB2aWEgUGhldGlvR3JvdXBcclxuICAgICAgICAgIH0gKSApO1xyXG5cclxuICAgICAgICAgIC8vIG1vdmUgZWxlY3Ryb24gdG8gbmV3IHN0YXRlXHJcbiAgICAgICAgICB0aGlzLmVsZWN0cm9uU3RhdGVQcm9wZXJ0eS52YWx1ZSA9IG5ld1N0YXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzdWNjZXNzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHJvYmFiaWxpc3RpY2FsbHkgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBhdG9tIHdpbGwgZW1pdCBhIHBob3RvbiB2aWEgc3RpbXVsYXRlZCBlbWlzc2lvbi5cclxuICAgKi9cclxuICBwcml2YXRlIHN0aW11bGF0ZWRFbWlzc2lvbklzQ2VydGFpbigpOiBib29sZWFuIHtcclxuICAgIHJldHVybiBkb3RSYW5kb20ubmV4dERvdWJsZSgpIDwgUEhPVE9OX1NUSU1VTEFURURfRU1JU1NJT05fUFJPQkFCSUxJVFk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIGlmIGEgcHJvcG9zZWQgc3RhdGUgdHJhbnNpdGlvbiBjYXVzZWQgYnkgc3RpbXVsYXRlZCBlbWlzc2lvbiBpcyBsZWdhbC5cclxuICAgKiBBIEJvaHIgdHJhbnNpdGlvbiBpcyBsZWdhbCBpZiB0aGUgMiBzdGF0ZXMgYXJlIGRpZmZlcmVudCBhbmQgbmV3U3RhdGUgPj0gZ3JvdW5kIHN0YXRlLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBzdGltdWxhdGVkRW1pc3Npb25Jc0FsbG93ZWQoIG9sZFN0YXRlOiBudW1iZXIsIG5ld1N0YXRlOiBudW1iZXIgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gKCAoIG9sZFN0YXRlICE9PSBuZXdTdGF0ZSApICYmICggbmV3U3RhdGUgPj0gTU9USEFDb25zdGFudHMuR1JPVU5EX1NUQVRFICkgKTtcclxuICB9XHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBQaG90b24gU3BvbnRhbmVvdXMgRW1pc3Npb25cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGVtcHRzIHRvIGVtaXQgYSBwaG90b24gZnJvbSB0aGUgZWxlY3Ryb24ncyBsb2NhdGlvbiwgaW4gYSByYW5kb20gZGlyZWN0aW9uLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXR0ZW1wdFNwb250YW5lb3VzRW1pc3Npb24oKTogYm9vbGVhbiB7XHJcblxyXG4gICAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgIGNvbnN0IGN1cnJlbnRTdGF0ZSA9IHRoaXMuZWxlY3Ryb25TdGF0ZVByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIC8vIEFyZSB3ZSBpbiBzb21lIHN0YXRlIG90aGVyIHRoYW4gdGhlIGdyb3VuZCBzdGF0ZT9cclxuICAgIC8vIEhhcyB0aGUgZWxlY3Ryb24gYmVlbiBpbiB0aGlzIHN0YXRlIGxvbmcgZW5vdWdoP1xyXG4gICAgaWYgKCBjdXJyZW50U3RhdGUgPiBNT1RIQUNvbnN0YW50cy5HUk9VTkRfU1RBVEUgJiZcclxuICAgICAgICAgdGhpcy50aW1lSW5TdGF0ZVByb3BlcnR5LnZhbHVlID49IEJvaHJNb2RlbC5NSU5fVElNRV9JTl9TVEFURSApIHtcclxuXHJcbiAgICAgIC8vICBFbWl0IGEgcGhvdG9uIHdpdGggc29tZSBwcm9iYWJpbGl0eS4uLlxyXG4gICAgICBpZiAoIHRoaXMuc3BvbnRhbmVvdXNFbWlzc2lvbklzQ2VydGFpbigpICkge1xyXG5cclxuICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IHRoaXMuY2hvb3NlTG93ZXJFbGVjdHJvblN0YXRlKCk7XHJcbiAgICAgICAgaWYgKCBuZXdTdGF0ZSA9PT0gLTEgKSB7XHJcbiAgICAgICAgICAvLyBGb3Igc29tZSBzdWJjbGFzc2VzLCB0aGVyZSBtYXkgYmUgbm8gdmFsaWQgdHJhbnNpdGlvbi5cclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhbmQgZW1pdCBhIHBob3RvblxyXG4gICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucGhvdG9uRW1pdHRlZEVtaXR0ZXIuZW1pdCggbmV3IFBob3Rvbigge1xyXG4gICAgICAgICAgd2F2ZWxlbmd0aDogQm9ock1vZGVsLmdldFdhdmVsZW5ndGhFbWl0dGVkKCBjdXJyZW50U3RhdGUsIG5ld1N0YXRlICksXHJcbiAgICAgICAgICBwb3NpdGlvbjogdGhpcy5nZXRTcG9udGFuZW91c0VtaXNzaW9uUG9zaXRpb24oKSxcclxuICAgICAgICAgIGRpcmVjdGlvbjogTU9USEFVdGlscy5uZXh0QW5nbGUoKSwgLy8gaW4gYSByYW5kb20gZGlyZWN0aW9uXHJcbiAgICAgICAgICB3YXNFbWl0dGVkOiB0cnVlLFxyXG4gICAgICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCAvL1RPRE8gY3JlYXRlIHZpYSBQaGV0aW9Hcm91cFxyXG4gICAgICAgIH0gKSApO1xyXG5cclxuICAgICAgICAvLyBtb3ZlIGVsZWN0cm9uIHRvIG5ldyBzdGF0ZVxyXG4gICAgICAgIHRoaXMuZWxlY3Ryb25TdGF0ZVByb3BlcnR5LnZhbHVlID0gbmV3U3RhdGU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc3VjY2VzcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByb2JhYmlsaXN0aWNhbGx5IGRldGVybWluZXMgd2hldGhlciB0aGUgYXRvbSB3aWxsIHNwb250YW5lb3VzbHkgZW1pdCBhIHBob3Rvbi5cclxuICAgKi9cclxuICBwcml2YXRlIHNwb250YW5lb3VzRW1pc3Npb25Jc0NlcnRhaW4oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gZG90UmFuZG9tLm5leHREb3VibGUoKSA8IFBIT1RPTl9TUE9OVEFORU9VU19FTUlTU0lPTl9QUk9CQUJJTElUWTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENob29zZXMgYSBuZXcgc3RhdGUgZm9yIHRoZSBlbGVjdHJvbi4gVGhlIHN0YXRlIGNob3NlbiBpcyBhIGxvd2VyIHN0YXRlLiBUaGlzIGlzIHVzZWQgd2hlbiBtb3ZpbmcgdG9cclxuICAgKiBhIGxvd2VyIHN0YXRlLCBkdXJpbmcgc3BvbnRhbmVvdXMgZW1pc3Npb24uIEVhY2ggbG93ZXIgc3RhdGUgaGFzIHRoZSBzYW1lIHByb2JhYmlsaXR5IG9mIGJlaW5nIGNob3Nlbi5cclxuICAgKiBAcmV0dXJucyBwb3NpdGl2ZSBzdGF0ZSBudW1iZXIsIC0xIGlmIHRoZXJlIGlzIG5vIGxvd2VyIHN0YXRlXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGNob29zZUxvd2VyRWxlY3Ryb25TdGF0ZSgpOiBudW1iZXIge1xyXG4gICAgY29uc3QgY3VycmVudFN0YXRlID0gdGhpcy5lbGVjdHJvblN0YXRlUHJvcGVydHkudmFsdWU7XHJcbiAgICBpZiAoIGN1cnJlbnRTdGF0ZSA9PT0gTU9USEFDb25zdGFudHMuR1JPVU5EX1NUQVRFICkge1xyXG4gICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIGRvdFJhbmRvbS5uZXh0SW50QmV0d2VlbiggTU9USEFDb25zdGFudHMuR1JPVU5EX1NUQVRFLCBjdXJyZW50U3RhdGUgLSBNT1RIQUNvbnN0YW50cy5HUk9VTkRfU1RBVEUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHBvc2l0aW9uIG9mIGEgcGhvdG9uIGNyZWF0ZWQgdmlhIHNwb250YW5lb3VzIGVtaXNzaW9uLlxyXG4gICAqIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGlzIHRvIGNyZWF0ZSB0aGUgcGhvdG9uIGF0IHRoZSBlbGVjdHJvbidzIHBvc2l0aW9uLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBnZXRTcG9udGFuZW91c0VtaXNzaW9uUG9zaXRpb24oKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5lbGVjdHJvbi5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxufVxyXG5cclxubW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20ucmVnaXN0ZXIoICdCb2hyTW9kZWwnLCBCb2hyTW9kZWwgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLG1DQUFtQztBQUM5RCxPQUFPQyxTQUFTLE1BQTRCLHVDQUF1QztBQUNuRixPQUFPQyx1QkFBdUIsTUFBTSxrQ0FBa0M7QUFDdEUsT0FBT0MsOEJBQThCLE1BQU0seUNBQXlDO0FBQ3BGLE9BQU9DLFlBQVksTUFBK0IsbUJBQW1CO0FBRXJFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFHL0MsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxVQUFVLE1BQU0sa0JBQWtCO0FBQ3pDLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxRQUFRLE1BQU0sZUFBZTtBQUNwQyxPQUFPQyxNQUFNLE1BQU0sYUFBYTtBQUNoQyxPQUFPQyxNQUFNLE1BQU0sYUFBYTtBQUNoQyxPQUFPQyxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUdwRCxPQUFPQyxjQUFjLE1BQU0sc0JBQXNCOztBQUVqRDtBQUNBO0FBQ0EsTUFBTUMsV0FBVyxHQUFHLENBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUU7O0FBRWpEO0FBQ0EsTUFBTUMsNkJBQTZCLEdBQUcsR0FBRzs7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