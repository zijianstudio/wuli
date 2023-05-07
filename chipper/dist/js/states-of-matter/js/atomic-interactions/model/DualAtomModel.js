// Copyright 2015-2022, University of Colorado Boulder

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import AtomType from '../../common/model/AtomType.js';
import InteractionStrengthTable from '../../common/model/InteractionStrengthTable.js';
import LjPotentialCalculator from '../../common/model/LjPotentialCalculator.js';
import SigmaTable from '../../common/model/SigmaTable.js';
import SOMConstants from '../../common/SOMConstants.js';
import statesOfMatter from '../../statesOfMatter.js';
import AtomPair from './AtomPair.js';
import ForceDisplayMode from './ForceDisplayMode.js';
import MotionAtom from './MotionAtom.js';

//---------------------------------------------------------------------------------------------------------------------
// constants
//---------------------------------------------------------------------------------------------------------------------

// Using normal dt values results in motion that is a bit slow, these multipliers are used to adjust that.
const NORMAL_MOTION_TIME_MULTIPLIER = 2;
const SLOW_MOTION_TIME_MULTIPLIER = 0.5;

// The maximum time step was empirically determined to be as large as possible while still making sure that energy
// is conserved in all interaction cases.  See https://github.com/phetsims/states-of-matter/issues/53 for more info.
const MAX_TIME_STEP = 0.005; // in seconds

// valid values in reduced usage scenario
const VALID_ATOM_PAIRS_FOR_REDUCED = [AtomPair.NEON_NEON, AtomPair.ARGON_ARGON, AtomPair.ADJUSTABLE];

// threshold used for limiting force to zero to prevent jitter, empirically determined
const MIN_FORCE_JITTER_THRESHOLD = 1e-30;

/**
 * model for two atoms interacting with a Lennard-Jones interaction potential
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
class DualAtomModel {
  /**
   * @param {Tandem} tandem
   * @param {boolean} enableHeterogeneousMolecules
   */
  constructor(tandem, enableHeterogeneousMolecules = true) {
    //-----------------------------------------------------------------------------------------------------------------
    // observable model properties
    //-----------------------------------------------------------------------------------------------------------------

    // @public (read-write) - epsilon/k-Boltzmann is in Kelvin.
    this.adjustableAtomInteractionStrengthProperty = new NumberProperty(100, {
      tandem: tandem.createTandem('adjustableAtomInteractionStrengthProperty'),
      phetioReadOnly: true,
      units: 'K',
      phetioDocumentation: 'intermolecular potential for the "Adjustable Attraction" atoms - this is a parameter in the Lennard-Jones potential equation'
    });

    // @public (read-write) - indicates when motion is paused due to user interaction with the movable atom
    this.motionPausedProperty = new BooleanProperty(false);

    // @public (read-write)
    this.atomPairProperty = new EnumerationDeprecatedProperty(AtomPair, AtomPair.NEON_NEON, {
      validValues: enableHeterogeneousMolecules ? AtomPair.VALUES : VALID_ATOM_PAIRS_FOR_REDUCED,
      tandem: tandem.createTandem('atomPairProperty')
    });

    // @public (read-write) - paused or playing
    this.isPlayingProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('isPlayingProperty')
    });

    // @public (read-write) - speed at which the model is running
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL, {
      validValues: [TimeSpeed.NORMAL, TimeSpeed.SLOW],
      tandem: tandem.createTandem('timeSpeedProperty')
    });

    // @public (read-write) - diameter of the adjustable atoms
    this.adjustableAtomDiameterProperty = new NumberProperty(SOMConstants.ADJUSTABLE_ATTRACTION_DEFAULT_RADIUS * 2, {
      units: 'pm',
      tandem: tandem.createTandem('adjustableAtomDiameterProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'Diameter of the adjustable atom, in picometers'
    });

    // @public (read-write)
    this.forcesDisplayModeProperty = new EnumerationDeprecatedProperty(ForceDisplayMode, ForceDisplayMode.HIDDEN, {
      tandem: tandem.createTandem('forcesDisplayModeProperty')
    });

    // @public (read-write)
    this.forcesExpandedProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('forcesExpandedProperty')
    });

    // @public (read-write)
    this.movementHintVisibleProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('movementHintVisibleProperty')
    });

    //-----------------------------------------------------------------------------------------------------------------
    // other model attributes
    //-----------------------------------------------------------------------------------------------------------------

    // @public, read only
    this.fixedAtom = new MotionAtom(AtomType.NEON, 0, 0, tandem.createTandem('fixedAtom'));
    this.movableAtom = new MotionAtom(AtomType.NEON, 0, 0, tandem.createTandem('movableAtom'));
    this.attractiveForce = 0;
    this.repulsiveForce = 0;

    // @private
    this.ljPotentialCalculator = new LjPotentialCalculator(SOMConstants.MIN_SIGMA, SOMConstants.MIN_EPSILON);
    this.residualTime = 0; // accumulates dt values not yet applied to model

    //-----------------------------------------------------------------------------------------------------------------
    // other initialization
    //-----------------------------------------------------------------------------------------------------------------

    // update the atom pair when the atom pair property is set
    this.atomPairProperty.link(atomPair => {
      this.fixedAtom.atomTypeProperty.set(atomPair.fixedAtomType);
      this.movableAtom.atomTypeProperty.set(atomPair.movableAtomType);
      this.ljPotentialCalculator.setSigma(SigmaTable.getSigma(this.fixedAtom.getType(), this.movableAtom.getType()));

      // update the value of epsilon
      this.ljPotentialCalculator.setEpsilon(InteractionStrengthTable.getInteractionPotential(this.fixedAtom.getType(), this.movableAtom.getType()));

      // reset other initial state variables
      if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
        // only reset position if this is not a phet-io state update, otherwise this overwrites particle position
        this.resetMovableAtomPos();
      }
      this.updateForces();
    });

    // update the LJ potential parameters when the adjustable attraction atom is in use
    Multilink.multilink([this.atomPairProperty, this.adjustableAtomInteractionStrengthProperty, this.adjustableAtomDiameterProperty], (atomPair, interactionStrength, atomDiameter) => {
      if (atomPair === AtomPair.ADJUSTABLE) {
        this.setEpsilon(interactionStrength);
        this.setAdjustableAtomSigma(atomDiameter);
      }
      this.updateForces();
    });

    // update the forces acting on the atoms when the movable atom changes position
    this.movableAtom.positionProperty.link(this.updateForces.bind(this));
  }

  /**
   * Set the sigma value, a.k.a. the Atomic Diameter Parameter, for the adjustable atom.  This is one of the two
   * parameters that are used for calculating the Lennard-Jones potential. If an attempt is made to set this value
   * when the adjustable atom is not selected, it is ignored.
   * @param {number}sigma - distance parameter
   * @public
   */
  setAdjustableAtomSigma(sigma) {
    if (this.fixedAtom.getType() === AtomType.ADJUSTABLE && this.movableAtom.getType() === AtomType.ADJUSTABLE && sigma !== this.ljPotentialCalculator.getSigma()) {
      if (sigma > SOMConstants.MAX_SIGMA) {
        sigma = SOMConstants.MAX_SIGMA;
      } else if (sigma < SOMConstants.MIN_SIGMA) {
        sigma = SOMConstants.MIN_SIGMA;
      }
      this.ljPotentialCalculator.setSigma(sigma);
      this.fixedAtom.radiusProperty.set(sigma / 2);
      this.movableAtom.radiusProperty.set(sigma / 2);

      // move the atom to the minimum force distance from the fixed atom (but not if this is a phet-io state update)
      if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
        this.movableAtom.setPosition(this.ljPotentialCalculator.getMinimumForceDistance(), 0);
      }
    }
  }

  /**
   * Get the value of the sigma parameter that is being used for the motion calculations.  If the atoms are the same,
   * it will be the diameter of one atom.  If they are not, it will be a function of the diameters.
   * @returns {number}
   * @public
   */
  getSigma() {
    return this.ljPotentialCalculator.getSigma();
  }

  /**
   * Set the epsilon value, a.k.a. the Interaction Strength Parameter, which is one of the two parameters that
   * describes the Lennard-Jones potential.
   * @param {number}epsilon - interaction strength parameter
   * @public
   */
  setEpsilon(epsilon) {
    if (epsilon < SOMConstants.MIN_EPSILON) {
      epsilon = SOMConstants.MIN_EPSILON;
    } else if (epsilon > SOMConstants.MAX_EPSILON) {
      epsilon = SOMConstants.MAX_EPSILON;
    }
    if (this.fixedAtom.getType() === AtomType.ADJUSTABLE && this.movableAtom.getType() === AtomType.ADJUSTABLE) {
      this.ljPotentialCalculator.setEpsilon(epsilon);
    }
  }

  /**
   * Get the epsilon value, a.k.a. the Interaction Strength Parameter, which is one of the two parameters that
   * describes the Lennard-Jones potential.
   * @returns {number}
   * @public
   */
  getEpsilon() {
    return this.ljPotentialCalculator.getEpsilon();
  }

  /**
   * @param {boolean} paused - is to set particle motion
   * @public
   */
  setMotionPaused(paused) {
    this.motionPausedProperty.set(paused);
    this.movableAtom.setVx(0);
  }

  /**
   * @override
   * @public
   */
  reset() {
    // reset the observable properties
    this.adjustableAtomInteractionStrengthProperty.reset();
    this.motionPausedProperty.reset();
    this.atomPairProperty.reset();
    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();
    this.adjustableAtomDiameterProperty.reset();
    this.forcesDisplayModeProperty.reset();
    this.forcesExpandedProperty.reset();
    this.movementHintVisibleProperty.reset();
    this.fixedAtom.reset();
    this.movableAtom.reset();
    this.resetMovableAtomPos();
  }

  /**
   * Put the movable atom back to the position where the force is minimized, and reset the velocity and
   * acceleration to 0.
   * @public
   */
  resetMovableAtomPos() {
    this.movableAtom.setPosition(this.ljPotentialCalculator.getMinimumForceDistance(), 0);
    this.movableAtom.setVx(0);
    this.movableAtom.setAx(0);
  }

  /**
   * Called by the animation loop.
   * @param {number} dt - time in seconds
   * @public
   */
  step(dt) {
    if (this.isPlayingProperty.get()) {
      // Using real world time for this results in the atoms moving a little slowly, so the time step is adjusted here.
      // The multipliers were empirically determined.
      let adjustedTimeStep;
      if (this.timeSpeedProperty.value === TimeSpeed.SLOW) {
        adjustedTimeStep = dt * SLOW_MOTION_TIME_MULTIPLIER;
      } else {
        adjustedTimeStep = dt * NORMAL_MOTION_TIME_MULTIPLIER;
      }
      this.stepInternal(adjustedTimeStep);
    }
  }

  /**
   * @param {number} dt -- time in seconds
   * @public
   */
  stepInternal(dt) {
    let numInternalModelIterations = 1;
    let modelTimeStep = dt;

    // if the time step is bigger than the max allowed, set up multiple iterations of the model
    if (dt > MAX_TIME_STEP) {
      numInternalModelIterations = dt / MAX_TIME_STEP;
      this.residualTime += dt - numInternalModelIterations * MAX_TIME_STEP;
      modelTimeStep = MAX_TIME_STEP;
    }

    // If residual time has accumulated enough, add an iteration.
    if (this.residualTime > modelTimeStep) {
      numInternalModelIterations++;
      this.residualTime -= modelTimeStep;
    }

    // update the motion of the movable atom
    for (let i = 0; i < numInternalModelIterations; i++) {
      this.updateAtomMotion(modelTimeStep);
    }
  }

  /**
   * @private
   */
  updateForces() {
    let distance = this.movableAtom.positionProperty.value.distance(Vector2.ZERO);
    if (distance < (this.fixedAtom.radius + this.movableAtom.radius) / 8) {
      // The atoms are too close together, and calculating the force will cause unusable levels of speed later, so
      // we limit it.
      distance = (this.fixedAtom.radius + this.movableAtom.radius) / 8;
    }

    // Calculate the force.  The result should be in newtons.
    this.attractiveForce = this.ljPotentialCalculator.getAttractiveLjForce(distance);
    this.repulsiveForce = this.ljPotentialCalculator.getRepulsiveLjForce(distance);

    // The movable atom can end up showing a tiny but non-zero velocity in phet-io when intended to be at the minimum
    // potential threshold, so do some thresholding if this is the case, see
    // https://github.com/phetsims/states-of-matter/issues/282.
    if (Math.abs(this.movableAtom.velocityProperty.value.x) === 0) {
      if (Math.abs(distance - this.ljPotentialCalculator.getMinimumForceDistance()) < this.movableAtom.radiusProperty.value) {
        const totalForceMagnitude = Math.abs(this.attractiveForce - this.repulsiveForce);
        if (totalForceMagnitude > 0 && totalForceMagnitude < MIN_FORCE_JITTER_THRESHOLD) {
          // Split the difference and make the attractive and repulsive forces equal.
          const averageForce = (this.attractiveForce + this.repulsiveForce) / 2;
          this.attractiveForce = averageForce;
          this.repulsiveForce = averageForce;
        }
      }
    }
  }

  /**
   * Update the position, velocity, and acceleration of the dummy movable atom.
   * @private
   */
  updateAtomMotion(dt) {
    const mass = this.movableAtom.mass * 1.6605402E-27; // Convert mass to kilograms.
    const acceleration = (this.repulsiveForce - this.attractiveForce) / mass;

    // Update the acceleration for the movable atom.  We do this regardless of whether movement is paused so that
    // the force vectors can be shown appropriately if the user moves the atoms.
    this.movableAtom.setAx(acceleration);
    if (!this.motionPausedProperty.get()) {
      // Calculate tne new velocity.
      const newVelocity = this.movableAtom.getVx() + acceleration * dt;

      // Update the position and velocity of the atom.
      this.movableAtom.setVx(newVelocity);
      const xPos = this.movableAtom.getX() + this.movableAtom.getVx() * dt;
      this.movableAtom.setPosition(xPos, 0);
    }
  }
}

// static
DualAtomModel.NORMAL_MOTION_TIME_MULTIPLIER = NORMAL_MOTION_TIME_MULTIPLIER;
statesOfMatter.register('DualAtomModel', DualAtomModel);
export default DualAtomModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSIsIkVudW1lcmF0aW9uUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJUaW1lU3BlZWQiLCJBdG9tVHlwZSIsIkludGVyYWN0aW9uU3RyZW5ndGhUYWJsZSIsIkxqUG90ZW50aWFsQ2FsY3VsYXRvciIsIlNpZ21hVGFibGUiLCJTT01Db25zdGFudHMiLCJzdGF0ZXNPZk1hdHRlciIsIkF0b21QYWlyIiwiRm9yY2VEaXNwbGF5TW9kZSIsIk1vdGlvbkF0b20iLCJOT1JNQUxfTU9USU9OX1RJTUVfTVVMVElQTElFUiIsIlNMT1dfTU9USU9OX1RJTUVfTVVMVElQTElFUiIsIk1BWF9USU1FX1NURVAiLCJWQUxJRF9BVE9NX1BBSVJTX0ZPUl9SRURVQ0VEIiwiTkVPTl9ORU9OIiwiQVJHT05fQVJHT04iLCJBREpVU1RBQkxFIiwiTUlOX0ZPUkNFX0pJVFRFUl9USFJFU0hPTEQiLCJEdWFsQXRvbU1vZGVsIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJlbmFibGVIZXRlcm9nZW5lb3VzTW9sZWN1bGVzIiwiYWRqdXN0YWJsZUF0b21JbnRlcmFjdGlvblN0cmVuZ3RoUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9SZWFkT25seSIsInVuaXRzIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsIm1vdGlvblBhdXNlZFByb3BlcnR5IiwiYXRvbVBhaXJQcm9wZXJ0eSIsInZhbGlkVmFsdWVzIiwiVkFMVUVTIiwiaXNQbGF5aW5nUHJvcGVydHkiLCJ0aW1lU3BlZWRQcm9wZXJ0eSIsIk5PUk1BTCIsIlNMT1ciLCJhZGp1c3RhYmxlQXRvbURpYW1ldGVyUHJvcGVydHkiLCJBREpVU1RBQkxFX0FUVFJBQ1RJT05fREVGQVVMVF9SQURJVVMiLCJmb3JjZXNEaXNwbGF5TW9kZVByb3BlcnR5IiwiSElEREVOIiwiZm9yY2VzRXhwYW5kZWRQcm9wZXJ0eSIsIm1vdmVtZW50SGludFZpc2libGVQcm9wZXJ0eSIsImZpeGVkQXRvbSIsIk5FT04iLCJtb3ZhYmxlQXRvbSIsImF0dHJhY3RpdmVGb3JjZSIsInJlcHVsc2l2ZUZvcmNlIiwibGpQb3RlbnRpYWxDYWxjdWxhdG9yIiwiTUlOX1NJR01BIiwiTUlOX0VQU0lMT04iLCJyZXNpZHVhbFRpbWUiLCJsaW5rIiwiYXRvbVBhaXIiLCJhdG9tVHlwZVByb3BlcnR5Iiwic2V0IiwiZml4ZWRBdG9tVHlwZSIsIm1vdmFibGVBdG9tVHlwZSIsInNldFNpZ21hIiwiZ2V0U2lnbWEiLCJnZXRUeXBlIiwic2V0RXBzaWxvbiIsImdldEludGVyYWN0aW9uUG90ZW50aWFsIiwicGhldCIsImpvaXN0Iiwic2ltIiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsInZhbHVlIiwicmVzZXRNb3ZhYmxlQXRvbVBvcyIsInVwZGF0ZUZvcmNlcyIsIm11bHRpbGluayIsImludGVyYWN0aW9uU3RyZW5ndGgiLCJhdG9tRGlhbWV0ZXIiLCJzZXRBZGp1c3RhYmxlQXRvbVNpZ21hIiwicG9zaXRpb25Qcm9wZXJ0eSIsImJpbmQiLCJzaWdtYSIsIk1BWF9TSUdNQSIsInJhZGl1c1Byb3BlcnR5Iiwic2V0UG9zaXRpb24iLCJnZXRNaW5pbXVtRm9yY2VEaXN0YW5jZSIsImVwc2lsb24iLCJNQVhfRVBTSUxPTiIsImdldEVwc2lsb24iLCJzZXRNb3Rpb25QYXVzZWQiLCJwYXVzZWQiLCJzZXRWeCIsInJlc2V0Iiwic2V0QXgiLCJzdGVwIiwiZHQiLCJnZXQiLCJhZGp1c3RlZFRpbWVTdGVwIiwic3RlcEludGVybmFsIiwibnVtSW50ZXJuYWxNb2RlbEl0ZXJhdGlvbnMiLCJtb2RlbFRpbWVTdGVwIiwiaSIsInVwZGF0ZUF0b21Nb3Rpb24iLCJkaXN0YW5jZSIsIlpFUk8iLCJyYWRpdXMiLCJnZXRBdHRyYWN0aXZlTGpGb3JjZSIsImdldFJlcHVsc2l2ZUxqRm9yY2UiLCJNYXRoIiwiYWJzIiwidmVsb2NpdHlQcm9wZXJ0eSIsIngiLCJ0b3RhbEZvcmNlTWFnbml0dWRlIiwiYXZlcmFnZUZvcmNlIiwibWFzcyIsImFjY2VsZXJhdGlvbiIsIm5ld1ZlbG9jaXR5IiwiZ2V0VngiLCJ4UG9zIiwiZ2V0WCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRHVhbEF0b21Nb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFRpbWVTcGVlZCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVGltZVNwZWVkLmpzJztcclxuaW1wb3J0IEF0b21UeXBlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9BdG9tVHlwZS5qcyc7XHJcbmltcG9ydCBJbnRlcmFjdGlvblN0cmVuZ3RoVGFibGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0ludGVyYWN0aW9uU3RyZW5ndGhUYWJsZS5qcyc7XHJcbmltcG9ydCBMalBvdGVudGlhbENhbGN1bGF0b3IgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0xqUG90ZW50aWFsQ2FsY3VsYXRvci5qcyc7XHJcbmltcG9ydCBTaWdtYVRhYmxlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9TaWdtYVRhYmxlLmpzJztcclxuaW1wb3J0IFNPTUNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vU09NQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IHN0YXRlc09mTWF0dGVyIGZyb20gJy4uLy4uL3N0YXRlc09mTWF0dGVyLmpzJztcclxuaW1wb3J0IEF0b21QYWlyIGZyb20gJy4vQXRvbVBhaXIuanMnO1xyXG5pbXBvcnQgRm9yY2VEaXNwbGF5TW9kZSBmcm9tICcuL0ZvcmNlRGlzcGxheU1vZGUuanMnO1xyXG5pbXBvcnQgTW90aW9uQXRvbSBmcm9tICcuL01vdGlvbkF0b20uanMnO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gY29uc3RhbnRzXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4vLyBVc2luZyBub3JtYWwgZHQgdmFsdWVzIHJlc3VsdHMgaW4gbW90aW9uIHRoYXQgaXMgYSBiaXQgc2xvdywgdGhlc2UgbXVsdGlwbGllcnMgYXJlIHVzZWQgdG8gYWRqdXN0IHRoYXQuXHJcbmNvbnN0IE5PUk1BTF9NT1RJT05fVElNRV9NVUxUSVBMSUVSID0gMjtcclxuY29uc3QgU0xPV19NT1RJT05fVElNRV9NVUxUSVBMSUVSID0gMC41O1xyXG5cclxuLy8gVGhlIG1heGltdW0gdGltZSBzdGVwIHdhcyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIGJlIGFzIGxhcmdlIGFzIHBvc3NpYmxlIHdoaWxlIHN0aWxsIG1ha2luZyBzdXJlIHRoYXQgZW5lcmd5XHJcbi8vIGlzIGNvbnNlcnZlZCBpbiBhbGwgaW50ZXJhY3Rpb24gY2FzZXMuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N0YXRlcy1vZi1tYXR0ZXIvaXNzdWVzLzUzIGZvciBtb3JlIGluZm8uXHJcbmNvbnN0IE1BWF9USU1FX1NURVAgPSAwLjAwNTsgLy8gaW4gc2Vjb25kc1xyXG5cclxuLy8gdmFsaWQgdmFsdWVzIGluIHJlZHVjZWQgdXNhZ2Ugc2NlbmFyaW9cclxuY29uc3QgVkFMSURfQVRPTV9QQUlSU19GT1JfUkVEVUNFRCA9IFsgQXRvbVBhaXIuTkVPTl9ORU9OLCBBdG9tUGFpci5BUkdPTl9BUkdPTiwgQXRvbVBhaXIuQURKVVNUQUJMRSBdO1xyXG5cclxuLy8gdGhyZXNob2xkIHVzZWQgZm9yIGxpbWl0aW5nIGZvcmNlIHRvIHplcm8gdG8gcHJldmVudCBqaXR0ZXIsIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuY29uc3QgTUlOX0ZPUkNFX0pJVFRFUl9USFJFU0hPTEQgPSAxZS0zMDtcclxuXHJcbi8qKlxyXG4gKiBtb2RlbCBmb3IgdHdvIGF0b21zIGludGVyYWN0aW5nIHdpdGggYSBMZW5uYXJkLUpvbmVzIGludGVyYWN0aW9uIHBvdGVudGlhbFxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgU2lkZGhhcnRoYSBDaGludGhhcGFsbHkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcbmNsYXNzIER1YWxBdG9tTW9kZWwge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBlbmFibGVIZXRlcm9nZW5lb3VzTW9sZWN1bGVzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRhbmRlbSwgZW5hYmxlSGV0ZXJvZ2VuZW91c01vbGVjdWxlcyA9IHRydWUgKSB7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gb2JzZXJ2YWJsZSBtb2RlbCBwcm9wZXJ0aWVzXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC13cml0ZSkgLSBlcHNpbG9uL2stQm9sdHptYW5uIGlzIGluIEtlbHZpbi5cclxuICAgIHRoaXMuYWRqdXN0YWJsZUF0b21JbnRlcmFjdGlvblN0cmVuZ3RoUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDEwMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhZGp1c3RhYmxlQXRvbUludGVyYWN0aW9uU3RyZW5ndGhQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHVuaXRzOiAnSycsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdpbnRlcm1vbGVjdWxhciBwb3RlbnRpYWwgZm9yIHRoZSBcIkFkanVzdGFibGUgQXR0cmFjdGlvblwiIGF0b21zIC0gdGhpcyBpcyBhIHBhcmFtZXRlciBpbiB0aGUgTGVubmFyZC1Kb25lcyBwb3RlbnRpYWwgZXF1YXRpb24nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC13cml0ZSkgLSBpbmRpY2F0ZXMgd2hlbiBtb3Rpb24gaXMgcGF1c2VkIGR1ZSB0byB1c2VyIGludGVyYWN0aW9uIHdpdGggdGhlIG1vdmFibGUgYXRvbVxyXG4gICAgdGhpcy5tb3Rpb25QYXVzZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC13cml0ZSlcclxuICAgIHRoaXMuYXRvbVBhaXJQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSggQXRvbVBhaXIsIEF0b21QYWlyLk5FT05fTkVPTiwge1xyXG4gICAgICB2YWxpZFZhbHVlczogZW5hYmxlSGV0ZXJvZ2VuZW91c01vbGVjdWxlcyA/IEF0b21QYWlyLlZBTFVFUyA6IFZBTElEX0FUT01fUEFJUlNfRk9SX1JFRFVDRUQsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2F0b21QYWlyUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLXdyaXRlKSAtIHBhdXNlZCBvciBwbGF5aW5nXHJcbiAgICB0aGlzLmlzUGxheWluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdpc1BsYXlpbmdQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtd3JpdGUpIC0gc3BlZWQgYXQgd2hpY2ggdGhlIG1vZGVsIGlzIHJ1bm5pbmdcclxuICAgIHRoaXMudGltZVNwZWVkUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25Qcm9wZXJ0eSggVGltZVNwZWVkLk5PUk1BTCwge1xyXG4gICAgICB2YWxpZFZhbHVlczogWyBUaW1lU3BlZWQuTk9STUFMLCBUaW1lU3BlZWQuU0xPVyBdLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aW1lU3BlZWRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtd3JpdGUpIC0gZGlhbWV0ZXIgb2YgdGhlIGFkanVzdGFibGUgYXRvbXNcclxuICAgIHRoaXMuYWRqdXN0YWJsZUF0b21EaWFtZXRlclByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBTT01Db25zdGFudHMuQURKVVNUQUJMRV9BVFRSQUNUSU9OX0RFRkFVTFRfUkFESVVTICogMiwge1xyXG4gICAgICB1bml0czogJ3BtJyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYWRqdXN0YWJsZUF0b21EaWFtZXRlclByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0RpYW1ldGVyIG9mIHRoZSBhZGp1c3RhYmxlIGF0b20sIGluIHBpY29tZXRlcnMnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC13cml0ZSlcclxuICAgIHRoaXMuZm9yY2VzRGlzcGxheU1vZGVQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSggRm9yY2VEaXNwbGF5TW9kZSwgRm9yY2VEaXNwbGF5TW9kZS5ISURERU4sIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZm9yY2VzRGlzcGxheU1vZGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtd3JpdGUpXHJcbiAgICB0aGlzLmZvcmNlc0V4cGFuZGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdmb3JjZXNFeHBhbmRlZFByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC13cml0ZSlcclxuICAgIHRoaXMubW92ZW1lbnRIaW50VmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb3ZlbWVudEhpbnRWaXNpYmxlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBvdGhlciBtb2RlbCBhdHRyaWJ1dGVzXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQHB1YmxpYywgcmVhZCBvbmx5XHJcbiAgICB0aGlzLmZpeGVkQXRvbSA9IG5ldyBNb3Rpb25BdG9tKCBBdG9tVHlwZS5ORU9OLCAwLCAwLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZml4ZWRBdG9tJyApICk7XHJcbiAgICB0aGlzLm1vdmFibGVBdG9tID0gbmV3IE1vdGlvbkF0b20oIEF0b21UeXBlLk5FT04sIDAsIDAsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb3ZhYmxlQXRvbScgKSApO1xyXG4gICAgdGhpcy5hdHRyYWN0aXZlRm9yY2UgPSAwO1xyXG4gICAgdGhpcy5yZXB1bHNpdmVGb3JjZSA9IDA7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMubGpQb3RlbnRpYWxDYWxjdWxhdG9yID0gbmV3IExqUG90ZW50aWFsQ2FsY3VsYXRvciggU09NQ29uc3RhbnRzLk1JTl9TSUdNQSwgU09NQ29uc3RhbnRzLk1JTl9FUFNJTE9OICk7XHJcbiAgICB0aGlzLnJlc2lkdWFsVGltZSA9IDA7IC8vIGFjY3VtdWxhdGVzIGR0IHZhbHVlcyBub3QgeWV0IGFwcGxpZWQgdG8gbW9kZWxcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBvdGhlciBpbml0aWFsaXphdGlvblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgYXRvbSBwYWlyIHdoZW4gdGhlIGF0b20gcGFpciBwcm9wZXJ0eSBpcyBzZXRcclxuICAgIHRoaXMuYXRvbVBhaXJQcm9wZXJ0eS5saW5rKCBhdG9tUGFpciA9PiB7XHJcbiAgICAgIHRoaXMuZml4ZWRBdG9tLmF0b21UeXBlUHJvcGVydHkuc2V0KCBhdG9tUGFpci5maXhlZEF0b21UeXBlICk7XHJcbiAgICAgIHRoaXMubW92YWJsZUF0b20uYXRvbVR5cGVQcm9wZXJ0eS5zZXQoIGF0b21QYWlyLm1vdmFibGVBdG9tVHlwZSApO1xyXG4gICAgICB0aGlzLmxqUG90ZW50aWFsQ2FsY3VsYXRvci5zZXRTaWdtYShcclxuICAgICAgICBTaWdtYVRhYmxlLmdldFNpZ21hKCB0aGlzLmZpeGVkQXRvbS5nZXRUeXBlKCksIHRoaXMubW92YWJsZUF0b20uZ2V0VHlwZSgpIClcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSB0aGUgdmFsdWUgb2YgZXBzaWxvblxyXG4gICAgICB0aGlzLmxqUG90ZW50aWFsQ2FsY3VsYXRvci5zZXRFcHNpbG9uKFxyXG4gICAgICAgIEludGVyYWN0aW9uU3RyZW5ndGhUYWJsZS5nZXRJbnRlcmFjdGlvblBvdGVudGlhbCggdGhpcy5maXhlZEF0b20uZ2V0VHlwZSgpLCB0aGlzLm1vdmFibGVBdG9tLmdldFR5cGUoKSApXHJcbiAgICAgICk7XHJcblxyXG4gICAgICAvLyByZXNldCBvdGhlciBpbml0aWFsIHN0YXRlIHZhcmlhYmxlc1xyXG4gICAgICBpZiAoICFwaGV0LmpvaXN0LnNpbS5pc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgICAvLyBvbmx5IHJlc2V0IHBvc2l0aW9uIGlmIHRoaXMgaXMgbm90IGEgcGhldC1pbyBzdGF0ZSB1cGRhdGUsIG90aGVyd2lzZSB0aGlzIG92ZXJ3cml0ZXMgcGFydGljbGUgcG9zaXRpb25cclxuICAgICAgICB0aGlzLnJlc2V0TW92YWJsZUF0b21Qb3MoKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnVwZGF0ZUZvcmNlcygpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgTEogcG90ZW50aWFsIHBhcmFtZXRlcnMgd2hlbiB0aGUgYWRqdXN0YWJsZSBhdHRyYWN0aW9uIGF0b20gaXMgaW4gdXNlXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbIHRoaXMuYXRvbVBhaXJQcm9wZXJ0eSwgdGhpcy5hZGp1c3RhYmxlQXRvbUludGVyYWN0aW9uU3RyZW5ndGhQcm9wZXJ0eSwgdGhpcy5hZGp1c3RhYmxlQXRvbURpYW1ldGVyUHJvcGVydHkgXSxcclxuICAgICAgKCBhdG9tUGFpciwgaW50ZXJhY3Rpb25TdHJlbmd0aCwgYXRvbURpYW1ldGVyICkgPT4ge1xyXG4gICAgICAgIGlmICggYXRvbVBhaXIgPT09IEF0b21QYWlyLkFESlVTVEFCTEUgKSB7XHJcbiAgICAgICAgICB0aGlzLnNldEVwc2lsb24oIGludGVyYWN0aW9uU3RyZW5ndGggKTtcclxuICAgICAgICAgIHRoaXMuc2V0QWRqdXN0YWJsZUF0b21TaWdtYSggYXRvbURpYW1ldGVyICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudXBkYXRlRm9yY2VzKCk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBmb3JjZXMgYWN0aW5nIG9uIHRoZSBhdG9tcyB3aGVuIHRoZSBtb3ZhYmxlIGF0b20gY2hhbmdlcyBwb3NpdGlvblxyXG4gICAgdGhpcy5tb3ZhYmxlQXRvbS5wb3NpdGlvblByb3BlcnR5LmxpbmsoIHRoaXMudXBkYXRlRm9yY2VzLmJpbmQoIHRoaXMgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBzaWdtYSB2YWx1ZSwgYS5rLmEuIHRoZSBBdG9taWMgRGlhbWV0ZXIgUGFyYW1ldGVyLCBmb3IgdGhlIGFkanVzdGFibGUgYXRvbS4gIFRoaXMgaXMgb25lIG9mIHRoZSB0d29cclxuICAgKiBwYXJhbWV0ZXJzIHRoYXQgYXJlIHVzZWQgZm9yIGNhbGN1bGF0aW5nIHRoZSBMZW5uYXJkLUpvbmVzIHBvdGVudGlhbC4gSWYgYW4gYXR0ZW1wdCBpcyBtYWRlIHRvIHNldCB0aGlzIHZhbHVlXHJcbiAgICogd2hlbiB0aGUgYWRqdXN0YWJsZSBhdG9tIGlzIG5vdCBzZWxlY3RlZCwgaXQgaXMgaWdub3JlZC5cclxuICAgKiBAcGFyYW0ge251bWJlcn1zaWdtYSAtIGRpc3RhbmNlIHBhcmFtZXRlclxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRBZGp1c3RhYmxlQXRvbVNpZ21hKCBzaWdtYSApIHtcclxuICAgIGlmICggKCB0aGlzLmZpeGVkQXRvbS5nZXRUeXBlKCkgPT09IEF0b21UeXBlLkFESlVTVEFCTEUgKSAmJlxyXG4gICAgICAgICAoIHRoaXMubW92YWJsZUF0b20uZ2V0VHlwZSgpID09PSBBdG9tVHlwZS5BREpVU1RBQkxFICkgJiZcclxuICAgICAgICAgKCBzaWdtYSAhPT0gdGhpcy5salBvdGVudGlhbENhbGN1bGF0b3IuZ2V0U2lnbWEoKSApICkge1xyXG5cclxuICAgICAgaWYgKCBzaWdtYSA+IFNPTUNvbnN0YW50cy5NQVhfU0lHTUEgKSB7XHJcbiAgICAgICAgc2lnbWEgPSBTT01Db25zdGFudHMuTUFYX1NJR01BO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBzaWdtYSA8IFNPTUNvbnN0YW50cy5NSU5fU0lHTUEgKSB7XHJcbiAgICAgICAgc2lnbWEgPSBTT01Db25zdGFudHMuTUlOX1NJR01BO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMubGpQb3RlbnRpYWxDYWxjdWxhdG9yLnNldFNpZ21hKCBzaWdtYSApO1xyXG4gICAgICB0aGlzLmZpeGVkQXRvbS5yYWRpdXNQcm9wZXJ0eS5zZXQoIHNpZ21hIC8gMiApO1xyXG4gICAgICB0aGlzLm1vdmFibGVBdG9tLnJhZGl1c1Byb3BlcnR5LnNldCggc2lnbWEgLyAyICk7XHJcblxyXG4gICAgICAvLyBtb3ZlIHRoZSBhdG9tIHRvIHRoZSBtaW5pbXVtIGZvcmNlIGRpc3RhbmNlIGZyb20gdGhlIGZpeGVkIGF0b20gKGJ1dCBub3QgaWYgdGhpcyBpcyBhIHBoZXQtaW8gc3RhdGUgdXBkYXRlKVxyXG4gICAgICBpZiAoICFwaGV0LmpvaXN0LnNpbS5pc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHRoaXMubW92YWJsZUF0b20uc2V0UG9zaXRpb24oIHRoaXMubGpQb3RlbnRpYWxDYWxjdWxhdG9yLmdldE1pbmltdW1Gb3JjZURpc3RhbmNlKCksIDAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSB2YWx1ZSBvZiB0aGUgc2lnbWEgcGFyYW1ldGVyIHRoYXQgaXMgYmVpbmcgdXNlZCBmb3IgdGhlIG1vdGlvbiBjYWxjdWxhdGlvbnMuICBJZiB0aGUgYXRvbXMgYXJlIHRoZSBzYW1lLFxyXG4gICAqIGl0IHdpbGwgYmUgdGhlIGRpYW1ldGVyIG9mIG9uZSBhdG9tLiAgSWYgdGhleSBhcmUgbm90LCBpdCB3aWxsIGJlIGEgZnVuY3Rpb24gb2YgdGhlIGRpYW1ldGVycy5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRTaWdtYSgpIHtcclxuICAgIHJldHVybiB0aGlzLmxqUG90ZW50aWFsQ2FsY3VsYXRvci5nZXRTaWdtYSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBlcHNpbG9uIHZhbHVlLCBhLmsuYS4gdGhlIEludGVyYWN0aW9uIFN0cmVuZ3RoIFBhcmFtZXRlciwgd2hpY2ggaXMgb25lIG9mIHRoZSB0d28gcGFyYW1ldGVycyB0aGF0XHJcbiAgICogZGVzY3JpYmVzIHRoZSBMZW5uYXJkLUpvbmVzIHBvdGVudGlhbC5cclxuICAgKiBAcGFyYW0ge251bWJlcn1lcHNpbG9uIC0gaW50ZXJhY3Rpb24gc3RyZW5ndGggcGFyYW1ldGVyXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldEVwc2lsb24oIGVwc2lsb24gKSB7XHJcblxyXG4gICAgaWYgKCBlcHNpbG9uIDwgU09NQ29uc3RhbnRzLk1JTl9FUFNJTE9OICkge1xyXG4gICAgICBlcHNpbG9uID0gU09NQ29uc3RhbnRzLk1JTl9FUFNJTE9OO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGVwc2lsb24gPiBTT01Db25zdGFudHMuTUFYX0VQU0lMT04gKSB7XHJcbiAgICAgIGVwc2lsb24gPSBTT01Db25zdGFudHMuTUFYX0VQU0lMT047XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCAoIHRoaXMuZml4ZWRBdG9tLmdldFR5cGUoKSA9PT0gQXRvbVR5cGUuQURKVVNUQUJMRSApICYmXHJcbiAgICAgICAgICggdGhpcy5tb3ZhYmxlQXRvbS5nZXRUeXBlKCkgPT09IEF0b21UeXBlLkFESlVTVEFCTEUgKSApIHtcclxuXHJcbiAgICAgIHRoaXMubGpQb3RlbnRpYWxDYWxjdWxhdG9yLnNldEVwc2lsb24oIGVwc2lsb24gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgZXBzaWxvbiB2YWx1ZSwgYS5rLmEuIHRoZSBJbnRlcmFjdGlvbiBTdHJlbmd0aCBQYXJhbWV0ZXIsIHdoaWNoIGlzIG9uZSBvZiB0aGUgdHdvIHBhcmFtZXRlcnMgdGhhdFxyXG4gICAqIGRlc2NyaWJlcyB0aGUgTGVubmFyZC1Kb25lcyBwb3RlbnRpYWwuXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0RXBzaWxvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmxqUG90ZW50aWFsQ2FsY3VsYXRvci5nZXRFcHNpbG9uKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHBhdXNlZCAtIGlzIHRvIHNldCBwYXJ0aWNsZSBtb3Rpb25cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0TW90aW9uUGF1c2VkKCBwYXVzZWQgKSB7XHJcbiAgICB0aGlzLm1vdGlvblBhdXNlZFByb3BlcnR5LnNldCggcGF1c2VkICk7XHJcbiAgICB0aGlzLm1vdmFibGVBdG9tLnNldFZ4KCAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcblxyXG4gICAgLy8gcmVzZXQgdGhlIG9ic2VydmFibGUgcHJvcGVydGllc1xyXG4gICAgdGhpcy5hZGp1c3RhYmxlQXRvbUludGVyYWN0aW9uU3RyZW5ndGhQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5tb3Rpb25QYXVzZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5hdG9tUGFpclByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmlzUGxheWluZ1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRpbWVTcGVlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmFkanVzdGFibGVBdG9tRGlhbWV0ZXJQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5mb3JjZXNEaXNwbGF5TW9kZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmZvcmNlc0V4cGFuZGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubW92ZW1lbnRIaW50VmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmZpeGVkQXRvbS5yZXNldCgpO1xyXG4gICAgdGhpcy5tb3ZhYmxlQXRvbS5yZXNldCgpO1xyXG4gICAgdGhpcy5yZXNldE1vdmFibGVBdG9tUG9zKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQdXQgdGhlIG1vdmFibGUgYXRvbSBiYWNrIHRvIHRoZSBwb3NpdGlvbiB3aGVyZSB0aGUgZm9yY2UgaXMgbWluaW1pemVkLCBhbmQgcmVzZXQgdGhlIHZlbG9jaXR5IGFuZFxyXG4gICAqIGFjY2VsZXJhdGlvbiB0byAwLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldE1vdmFibGVBdG9tUG9zKCkge1xyXG4gICAgdGhpcy5tb3ZhYmxlQXRvbS5zZXRQb3NpdGlvbiggdGhpcy5salBvdGVudGlhbENhbGN1bGF0b3IuZ2V0TWluaW11bUZvcmNlRGlzdGFuY2UoKSwgMCApO1xyXG4gICAgdGhpcy5tb3ZhYmxlQXRvbS5zZXRWeCggMCApO1xyXG4gICAgdGhpcy5tb3ZhYmxlQXRvbS5zZXRBeCggMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGJ5IHRoZSBhbmltYXRpb24gbG9vcC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSB0aW1lIGluIHNlY29uZHNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcblxyXG4gICAgaWYgKCB0aGlzLmlzUGxheWluZ1Byb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgLy8gVXNpbmcgcmVhbCB3b3JsZCB0aW1lIGZvciB0aGlzIHJlc3VsdHMgaW4gdGhlIGF0b21zIG1vdmluZyBhIGxpdHRsZSBzbG93bHksIHNvIHRoZSB0aW1lIHN0ZXAgaXMgYWRqdXN0ZWQgaGVyZS5cclxuICAgICAgLy8gVGhlIG11bHRpcGxpZXJzIHdlcmUgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZC5cclxuICAgICAgbGV0IGFkanVzdGVkVGltZVN0ZXA7XHJcbiAgICAgIGlmICggdGhpcy50aW1lU3BlZWRQcm9wZXJ0eS52YWx1ZSA9PT0gVGltZVNwZWVkLlNMT1cgKSB7XHJcbiAgICAgICAgYWRqdXN0ZWRUaW1lU3RlcCA9IGR0ICogU0xPV19NT1RJT05fVElNRV9NVUxUSVBMSUVSO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGFkanVzdGVkVGltZVN0ZXAgPSBkdCAqIE5PUk1BTF9NT1RJT05fVElNRV9NVUxUSVBMSUVSO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuc3RlcEludGVybmFsKCBhZGp1c3RlZFRpbWVTdGVwICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLS0gdGltZSBpbiBzZWNvbmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXBJbnRlcm5hbCggZHQgKSB7XHJcblxyXG4gICAgbGV0IG51bUludGVybmFsTW9kZWxJdGVyYXRpb25zID0gMTtcclxuICAgIGxldCBtb2RlbFRpbWVTdGVwID0gZHQ7XHJcblxyXG4gICAgLy8gaWYgdGhlIHRpbWUgc3RlcCBpcyBiaWdnZXIgdGhhbiB0aGUgbWF4IGFsbG93ZWQsIHNldCB1cCBtdWx0aXBsZSBpdGVyYXRpb25zIG9mIHRoZSBtb2RlbFxyXG4gICAgaWYgKCBkdCA+IE1BWF9USU1FX1NURVAgKSB7XHJcbiAgICAgIG51bUludGVybmFsTW9kZWxJdGVyYXRpb25zID0gZHQgLyBNQVhfVElNRV9TVEVQO1xyXG4gICAgICB0aGlzLnJlc2lkdWFsVGltZSArPSBkdCAtICggbnVtSW50ZXJuYWxNb2RlbEl0ZXJhdGlvbnMgKiBNQVhfVElNRV9TVEVQICk7XHJcbiAgICAgIG1vZGVsVGltZVN0ZXAgPSBNQVhfVElNRV9TVEVQO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHJlc2lkdWFsIHRpbWUgaGFzIGFjY3VtdWxhdGVkIGVub3VnaCwgYWRkIGFuIGl0ZXJhdGlvbi5cclxuICAgIGlmICggdGhpcy5yZXNpZHVhbFRpbWUgPiBtb2RlbFRpbWVTdGVwICkge1xyXG4gICAgICBudW1JbnRlcm5hbE1vZGVsSXRlcmF0aW9ucysrO1xyXG4gICAgICB0aGlzLnJlc2lkdWFsVGltZSAtPSBtb2RlbFRpbWVTdGVwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgbW90aW9uIG9mIHRoZSBtb3ZhYmxlIGF0b21cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bUludGVybmFsTW9kZWxJdGVyYXRpb25zOyBpKysgKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlQXRvbU1vdGlvbiggbW9kZWxUaW1lU3RlcCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVGb3JjZXMoKSB7XHJcblxyXG4gICAgbGV0IGRpc3RhbmNlID0gdGhpcy5tb3ZhYmxlQXRvbS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLmRpc3RhbmNlKCBWZWN0b3IyLlpFUk8gKTtcclxuXHJcbiAgICBpZiAoIGRpc3RhbmNlIDwgKCB0aGlzLmZpeGVkQXRvbS5yYWRpdXMgKyB0aGlzLm1vdmFibGVBdG9tLnJhZGl1cyApIC8gOCApIHtcclxuXHJcbiAgICAgIC8vIFRoZSBhdG9tcyBhcmUgdG9vIGNsb3NlIHRvZ2V0aGVyLCBhbmQgY2FsY3VsYXRpbmcgdGhlIGZvcmNlIHdpbGwgY2F1c2UgdW51c2FibGUgbGV2ZWxzIG9mIHNwZWVkIGxhdGVyLCBzb1xyXG4gICAgICAvLyB3ZSBsaW1pdCBpdC5cclxuICAgICAgZGlzdGFuY2UgPSAoIHRoaXMuZml4ZWRBdG9tLnJhZGl1cyArIHRoaXMubW92YWJsZUF0b20ucmFkaXVzICkgLyA4O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbGN1bGF0ZSB0aGUgZm9yY2UuICBUaGUgcmVzdWx0IHNob3VsZCBiZSBpbiBuZXd0b25zLlxyXG4gICAgdGhpcy5hdHRyYWN0aXZlRm9yY2UgPSB0aGlzLmxqUG90ZW50aWFsQ2FsY3VsYXRvci5nZXRBdHRyYWN0aXZlTGpGb3JjZSggZGlzdGFuY2UgKTtcclxuICAgIHRoaXMucmVwdWxzaXZlRm9yY2UgPSB0aGlzLmxqUG90ZW50aWFsQ2FsY3VsYXRvci5nZXRSZXB1bHNpdmVMakZvcmNlKCBkaXN0YW5jZSApO1xyXG5cclxuICAgIC8vIFRoZSBtb3ZhYmxlIGF0b20gY2FuIGVuZCB1cCBzaG93aW5nIGEgdGlueSBidXQgbm9uLXplcm8gdmVsb2NpdHkgaW4gcGhldC1pbyB3aGVuIGludGVuZGVkIHRvIGJlIGF0IHRoZSBtaW5pbXVtXHJcbiAgICAvLyBwb3RlbnRpYWwgdGhyZXNob2xkLCBzbyBkbyBzb21lIHRocmVzaG9sZGluZyBpZiB0aGlzIGlzIHRoZSBjYXNlLCBzZWVcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdGF0ZXMtb2YtbWF0dGVyL2lzc3Vlcy8yODIuXHJcbiAgICBpZiAoIE1hdGguYWJzKCB0aGlzLm1vdmFibGVBdG9tLnZlbG9jaXR5UHJvcGVydHkudmFsdWUueCApID09PSAwICkge1xyXG4gICAgICBpZiAoIE1hdGguYWJzKCBkaXN0YW5jZSAtIHRoaXMubGpQb3RlbnRpYWxDYWxjdWxhdG9yLmdldE1pbmltdW1Gb3JjZURpc3RhbmNlKCkgKSA8IHRoaXMubW92YWJsZUF0b20ucmFkaXVzUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgY29uc3QgdG90YWxGb3JjZU1hZ25pdHVkZSA9IE1hdGguYWJzKCB0aGlzLmF0dHJhY3RpdmVGb3JjZSAtIHRoaXMucmVwdWxzaXZlRm9yY2UgKTtcclxuICAgICAgICBpZiAoIHRvdGFsRm9yY2VNYWduaXR1ZGUgPiAwICYmIHRvdGFsRm9yY2VNYWduaXR1ZGUgPCBNSU5fRk9SQ0VfSklUVEVSX1RIUkVTSE9MRCApIHtcclxuXHJcbiAgICAgICAgICAvLyBTcGxpdCB0aGUgZGlmZmVyZW5jZSBhbmQgbWFrZSB0aGUgYXR0cmFjdGl2ZSBhbmQgcmVwdWxzaXZlIGZvcmNlcyBlcXVhbC5cclxuICAgICAgICAgIGNvbnN0IGF2ZXJhZ2VGb3JjZSA9ICggdGhpcy5hdHRyYWN0aXZlRm9yY2UgKyB0aGlzLnJlcHVsc2l2ZUZvcmNlICkgLyAyO1xyXG4gICAgICAgICAgdGhpcy5hdHRyYWN0aXZlRm9yY2UgPSBhdmVyYWdlRm9yY2U7XHJcbiAgICAgICAgICB0aGlzLnJlcHVsc2l2ZUZvcmNlID0gYXZlcmFnZUZvcmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBwb3NpdGlvbiwgdmVsb2NpdHksIGFuZCBhY2NlbGVyYXRpb24gb2YgdGhlIGR1bW15IG1vdmFibGUgYXRvbS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZUF0b21Nb3Rpb24oIGR0ICkge1xyXG5cclxuICAgIGNvbnN0IG1hc3MgPSB0aGlzLm1vdmFibGVBdG9tLm1hc3MgKiAxLjY2MDU0MDJFLTI3OyAgLy8gQ29udmVydCBtYXNzIHRvIGtpbG9ncmFtcy5cclxuICAgIGNvbnN0IGFjY2VsZXJhdGlvbiA9ICggdGhpcy5yZXB1bHNpdmVGb3JjZSAtIHRoaXMuYXR0cmFjdGl2ZUZvcmNlICkgLyBtYXNzO1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgYWNjZWxlcmF0aW9uIGZvciB0aGUgbW92YWJsZSBhdG9tLiAgV2UgZG8gdGhpcyByZWdhcmRsZXNzIG9mIHdoZXRoZXIgbW92ZW1lbnQgaXMgcGF1c2VkIHNvIHRoYXRcclxuICAgIC8vIHRoZSBmb3JjZSB2ZWN0b3JzIGNhbiBiZSBzaG93biBhcHByb3ByaWF0ZWx5IGlmIHRoZSB1c2VyIG1vdmVzIHRoZSBhdG9tcy5cclxuICAgIHRoaXMubW92YWJsZUF0b20uc2V0QXgoIGFjY2VsZXJhdGlvbiApO1xyXG5cclxuICAgIGlmICggIXRoaXMubW90aW9uUGF1c2VkUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGUgdG5lIG5ldyB2ZWxvY2l0eS5cclxuICAgICAgY29uc3QgbmV3VmVsb2NpdHkgPSB0aGlzLm1vdmFibGVBdG9tLmdldFZ4KCkgKyAoIGFjY2VsZXJhdGlvbiAqIGR0ICk7XHJcblxyXG4gICAgICAvLyBVcGRhdGUgdGhlIHBvc2l0aW9uIGFuZCB2ZWxvY2l0eSBvZiB0aGUgYXRvbS5cclxuICAgICAgdGhpcy5tb3ZhYmxlQXRvbS5zZXRWeCggbmV3VmVsb2NpdHkgKTtcclxuICAgICAgY29uc3QgeFBvcyA9IHRoaXMubW92YWJsZUF0b20uZ2V0WCgpICsgKCB0aGlzLm1vdmFibGVBdG9tLmdldFZ4KCkgKiBkdCApO1xyXG4gICAgICB0aGlzLm1vdmFibGVBdG9tLnNldFBvc2l0aW9uKCB4UG9zLCAwICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBzdGF0aWNcclxuRHVhbEF0b21Nb2RlbC5OT1JNQUxfTU9USU9OX1RJTUVfTVVMVElQTElFUiA9IE5PUk1BTF9NT1RJT05fVElNRV9NVUxUSVBMSUVSO1xyXG5cclxuc3RhdGVzT2ZNYXR0ZXIucmVnaXN0ZXIoICdEdWFsQXRvbU1vZGVsJywgRHVhbEF0b21Nb2RlbCApO1xyXG5leHBvcnQgZGVmYXVsdCBEdWFsQXRvbU1vZGVsO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsNkJBQTZCLE1BQU0sc0RBQXNEO0FBQ2hHLE9BQU9DLG1CQUFtQixNQUFNLDRDQUE0QztBQUM1RSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxTQUFTLE1BQU0sMENBQTBDO0FBQ2hFLE9BQU9DLFFBQVEsTUFBTSxnQ0FBZ0M7QUFDckQsT0FBT0Msd0JBQXdCLE1BQU0sZ0RBQWdEO0FBQ3JGLE9BQU9DLHFCQUFxQixNQUFNLDZDQUE2QztBQUMvRSxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLFlBQVksTUFBTSw4QkFB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