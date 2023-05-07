// Copyright 2014-2021, University of Colorado Boulder

/**
 * This is the base class for the objects that directly change the state of the molecules within the multi-particle
 * simulation.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

import dotRandom from '../../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import statesOfMatter from '../../../statesOfMatter.js';
import PhaseStateEnum from '../../PhaseStateEnum.js';
import SOMConstants from '../../SOMConstants.js';

// constants
const MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE = 1.5;
const MAX_PLACEMENT_ATTEMPTS = 500; // for random placement of particles
const MIN_INITIAL_GAS_PARTICLE_DISTANCE = 1.1; // empirically determined

class AbstractPhaseStateChanger {
  /**
   * @param { MultipleParticleModel } multipleParticleModel of the simulation
   * @public
   */
  constructor(multipleParticleModel) {
    // @private
    this.multipleParticleModel = multipleParticleModel;
    this.moleculePosition = new Vector2(0, 0);
    this.random = dotRandom;
    this.reusableVector = new Vector2(0, 0);
  }

  /**
   * Set the phase based on the specified ID.  This often needs to be overridden in descendant classes to do more
   * specific activities.
   * @param {PhaseStateEnum} phaseID
   * @public
   */
  setPhase(phaseID) {
    switch (phaseID) {
      case PhaseStateEnum.SOLID:
        this.setPhaseSolid();
        break;
      case PhaseStateEnum.LIQUID:
        this.setPhaseLiquid();
        break;
      case PhaseStateEnum.GAS:
        this.setPhaseGas();
        break;
      default:
        throw new Error(`invalid phaseID: ${phaseID}`);
    }
  }

  /**
   * Set the positions and velocities of the particles without setting the model temperature.
   * @param {PhaseStateEnum} phaseID
   * @public
   */
  setParticleConfigurationForPhase(phaseID) {
    switch (phaseID) {
      case PhaseStateEnum.SOLID:
        this.setParticleConfigurationSolid();
        break;
      case PhaseStateEnum.LIQUID:
        this.setParticleConfigurationLiquid();
        break;
      case PhaseStateEnum.GAS:
        this.setParticleConfigurationGas();
        break;
      default:
        throw new Error(`invalid phaseID: ${phaseID}`);
    }
  }

  /**
   * Set the model temperature for the specified phase.
   * @param {PhaseStateEnum} phaseID
   * @public
   */
  setTemperatureForPhase(phaseID) {
    switch (phaseID) {
      case PhaseStateEnum.SOLID:
        this.multipleParticleModel.setTemperature(SOMConstants.SOLID_TEMPERATURE);
        break;
      case PhaseStateEnum.LIQUID:
        this.multipleParticleModel.setTemperature(SOMConstants.LIQUID_TEMPERATURE);
        break;
      case PhaseStateEnum.GAS:
        this.multipleParticleModel.setTemperature(SOMConstants.GAS_TEMPERATURE);
        break;
      default:
        throw new Error(`invalid phaseID: ${phaseID}`);
    }
  }

  /**
   * set the phase to solid
   * @protected
   */
  setPhaseSolid() {
    this.setTemperatureForPhase(PhaseStateEnum.SOLID);
    this.setParticleConfigurationSolid();
  }

  /**
   * set the phase to liquid
   * @protected
   */
  setPhaseLiquid() {
    this.setTemperatureForPhase(PhaseStateEnum.LIQUID);
    this.setParticleConfigurationLiquid();
  }

  /**
   * set the phase to gas
   * @protected
   */
  setPhaseGas() {
    this.setTemperatureForPhase(PhaseStateEnum.GAS);
    this.setParticleConfigurationGas();
  }

  /**
   * Do a linear search for a position that is suitably far away enough from all other molecules.  This is generally
   * used when the attempt to place a molecule at a random position fails.  This is expensive in terms of
   * computational power, and should thus be used sparingly.
   * @returns {Vector2}
   * @private
   */
  findOpenMoleculePosition() {
    let posX;
    let posY;
    const moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
    const moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
    const minInitialInterParticleDistance = 1.2; // empirically chosen
    const rangeX = this.multipleParticleModel.normalizedContainerWidth - 2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE;
    const rangeY = this.multipleParticleModel.normalizedContainerHeight - 2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE;
    for (let i = 0; i < rangeX / minInitialInterParticleDistance; i++) {
      for (let j = 0; j < rangeY / minInitialInterParticleDistance; j++) {
        posX = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + i * minInitialInterParticleDistance;
        posY = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + j * minInitialInterParticleDistance;

        // See if this position is available.
        let positionAvailable = true;
        for (let k = 0; k < moleculeDataSet.getNumberOfMolecules(); k++) {
          if (moleculeCenterOfMassPositions[k].distanceXY(posX, posY) < minInitialInterParticleDistance) {
            positionAvailable = false;
            break;
          }
        }
        if (positionAvailable) {
          // We found an open position.
          this.moleculePosition.setXY(posX, posY);
          return this.moleculePosition;
        }
      }
    }

    // no open position found, return null
    return null;
  }

  /**
   * form the molecules into a crystal, which is essentially a cube shape
   * @param {number} moleculesPerLayer
   * @param {number} xSpacing
   * @param {number} ySpacing
   * @param {number} alternateRowOffset
   * @param {number} bottomY
   * @param {boolean} randomizeRotationalAngle
   * @protected
   */
  formCrystal(moleculesPerLayer, xSpacing, ySpacing, alternateRowOffset, bottomY, randomizeRotationalAngle) {
    // Get references to the various elements of the data set.
    const moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
    const numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
    const moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
    const moleculeVelocities = moleculeDataSet.moleculeVelocities;
    const moleculeRotationAngles = moleculeDataSet.moleculeRotationAngles;
    const moleculesInsideContainer = this.multipleParticleModel.moleculeDataSet.insideContainer;

    // Set up other variables needed to do the job.
    const temperatureSqrt = Math.sqrt(this.multipleParticleModel.temperatureSetPointProperty.get());
    const crystalWidth = moleculesPerLayer * xSpacing;
    const startingPosX = this.multipleParticleModel.normalizedContainerWidth / 2 - crystalWidth / 2;

    // Place the molecules by placing their centers of mass.
    let moleculesPlaced = 0;
    let xPos;
    let yPos;
    this.reusableVector.setXY(0, 0);
    for (let i = 0; i < numberOfMolecules; i++) {
      // Position one layer of molecules.
      for (let j = 0; j < moleculesPerLayer && moleculesPlaced < numberOfMolecules; j++) {
        xPos = startingPosX + j * xSpacing;
        if (i % 2 !== 0) {
          // Every other row is shifted a little.
          xPos += alternateRowOffset;
        }
        yPos = bottomY + i * ySpacing;
        const moleculeIndex = i * moleculesPerLayer + j;
        moleculeCenterOfMassPositions[moleculeIndex].setXY(xPos, yPos);
        moleculeRotationAngles[moleculeIndex] = 0;
        moleculesPlaced++;

        // Assign each molecule an initial velocity.
        const xVel = temperatureSqrt * this.random.nextGaussian();
        const yVel = temperatureSqrt * this.random.nextGaussian();
        moleculeVelocities[moleculeIndex].setXY(xVel, yVel);

        // Track total velocity in the X direction.
        this.reusableVector.addXY(xVel, yVel);

        // Assign an initial rotational angle (has no effect for single-atom data sets)
        moleculeRotationAngles[moleculeIndex] = randomizeRotationalAngle ? this.random.nextDouble() * 2 * Math.PI : 0;

        // Mark the molecule as being in the container.
        moleculesInsideContainer[i] = true;
      }
    }
    this.zeroOutCollectiveVelocity();
  }

  /**
   * Set the particle configuration for gas.  This can be generalized more than the liquid and solid phases, hence it
   * can be defined in the base class.
   * @protected
   */
  setParticleConfigurationGas() {
    // Get references to the various elements of the data set.
    const moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
    const moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
    const moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
    const moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
    const moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
    const moleculesInsideContainer = this.multipleParticleModel.moleculeDataSet.insideContainer;

    // Set up other variables needed to do the job.
    const temperatureSqrt = Math.sqrt(this.multipleParticleModel.temperatureSetPointProperty.get());
    const numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
    for (let i = 0; i < numberOfMolecules; i++) {
      // Temporarily position the molecules at (0,0).
      moleculeCenterOfMassPositions[i].setXY(0, 0);

      // Assign each molecule an initial velocity.
      moleculeVelocities[i].setXY(temperatureSqrt * this.random.nextGaussian(), temperatureSqrt * this.random.nextGaussian());

      // Assign each molecule an initial rotational angle and rate.  This isn't used in the monatomic case, but it
      // doesn't hurt anything to set the values.
      moleculeRotationAngles[i] = this.random.nextDouble() * Math.PI * 2;
      moleculeRotationRates[i] = (this.random.nextDouble() * 2 - 1) * temperatureSqrt * Math.PI * 2;

      // Mark each molecule as in the container.
      moleculesInsideContainer[i] = true;
    }

    // Redistribute the molecules randomly around the container, but make sure that they are not too close together or
    // they end up with a disproportionate amount of kinetic energy.
    let newPosX;
    let newPosY;
    const rangeX = this.multipleParticleModel.normalizedContainerWidth - 2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE;
    const rangeY = this.multipleParticleModel.normalizedContainerHeight - 2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE;
    for (let i = 0; i < numberOfMolecules; i++) {
      for (let j = 0; j < MAX_PLACEMENT_ATTEMPTS; j++) {
        // Pick a random position.
        newPosX = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + this.random.nextDouble() * rangeX;
        newPosY = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + this.random.nextDouble() * rangeY;
        let positionAvailable = true;

        // See if this position is available.
        for (let k = 0; k < i; k++) {
          if (moleculeCenterOfMassPositions[k].distanceXY(newPosX, newPosY) < MIN_INITIAL_GAS_PARTICLE_DISTANCE) {
            positionAvailable = false;
            break;
          }
        }
        if (positionAvailable || j === MAX_PLACEMENT_ATTEMPTS - 1) {
          // We found an open position or we've done all the searching we can.
          moleculeCenterOfMassPositions[i].setXY(newPosX, newPosY);
          break;
        } else if (j === MAX_PLACEMENT_ATTEMPTS - 2) {
          // This is the second to last attempt, so try a linear search for a usable spot.
          const openPoint = this.findOpenMoleculePosition();
          if (openPoint !== null) {
            moleculeCenterOfMassPositions[i].set(openPoint);
            break;
          }
        }
      }
    }
  }

  /**
   * zero out the collective velocity of the substance, generally used to help prevent drift after changing phase
   * @protected
   */
  zeroOutCollectiveVelocity() {
    const moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
    const numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
    const moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
    this.reusableVector.setXY(0, 0);
    let i;
    for (i = 0; i < numberOfMolecules; i++) {
      this.reusableVector.add(moleculeVelocities[i]);
    }
    const xAdjustment = -this.reusableVector.x / numberOfMolecules;
    const yAdjustment = -this.reusableVector.y / numberOfMolecules;
    for (i = 0; i < numberOfMolecules; i++) {
      moleculeVelocities[i].addXY(xAdjustment, yAdjustment);
    }
  }

  /**
   * Load previously saved position and motion state, does NOT load forces state
   * @protected
   */
  loadSavedState(savedState) {
    assert && assert(this.multipleParticleModel.moleculeDataSet.numberOfMolecules === savedState.numberOfMolecules, 'unexpected number of particles in saved data set');

    // Set the initial velocity for each of the atoms based on the new temperature.
    const numberOfMolecules = this.multipleParticleModel.moleculeDataSet.numberOfMolecules;
    const moleculeCenterOfMassPositions = this.multipleParticleModel.moleculeDataSet.moleculeCenterOfMassPositions;
    const moleculeVelocities = this.multipleParticleModel.moleculeDataSet.moleculeVelocities;
    const moleculeRotationAngles = this.multipleParticleModel.moleculeDataSet.moleculeRotationAngles;
    const moleculeRotationRates = this.multipleParticleModel.moleculeDataSet.moleculeRotationRates;
    const moleculesInsideContainer = this.multipleParticleModel.moleculeDataSet.insideContainer;

    // for ( var i = 0; i < numberOfMolecules; i++ ) {
    for (let i = 0; i < numberOfMolecules; i++) {
      moleculeCenterOfMassPositions[i].setXY(savedState.moleculeCenterOfMassPositions[i].x, savedState.moleculeCenterOfMassPositions[i].y);
      moleculeVelocities[i].setXY(savedState.moleculeVelocities[i].x, savedState.moleculeVelocities[i].y);
      if (savedState.moleculeRotationAngles) {
        moleculeRotationAngles[i] = savedState.moleculeRotationAngles[i];
      }
      if (savedState.moleculeRotationAngles) {
        moleculeRotationRates[i] = savedState.moleculeRotationRates[i];
      }
      moleculesInsideContainer[i] = true;
    }
  }
}

// statics
AbstractPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE;
AbstractPhaseStateChanger.DISTANCE_BETWEEN_PARTICLES_IN_CRYSTAL = 0.12; // in particle diameters
AbstractPhaseStateChanger.MAX_PLACEMENT_ATTEMPTS = MAX_PLACEMENT_ATTEMPTS; // for random placement of particles

statesOfMatter.register('AbstractPhaseStateChanger', AbstractPhaseStateChanger);
export default AbstractPhaseStateChanger;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJWZWN0b3IyIiwic3RhdGVzT2ZNYXR0ZXIiLCJQaGFzZVN0YXRlRW51bSIsIlNPTUNvbnN0YW50cyIsIk1JTl9JTklUSUFMX1BBUlRJQ0xFX1RPX1dBTExfRElTVEFOQ0UiLCJNQVhfUExBQ0VNRU5UX0FUVEVNUFRTIiwiTUlOX0lOSVRJQUxfR0FTX1BBUlRJQ0xFX0RJU1RBTkNFIiwiQWJzdHJhY3RQaGFzZVN0YXRlQ2hhbmdlciIsImNvbnN0cnVjdG9yIiwibXVsdGlwbGVQYXJ0aWNsZU1vZGVsIiwibW9sZWN1bGVQb3NpdGlvbiIsInJhbmRvbSIsInJldXNhYmxlVmVjdG9yIiwic2V0UGhhc2UiLCJwaGFzZUlEIiwiU09MSUQiLCJzZXRQaGFzZVNvbGlkIiwiTElRVUlEIiwic2V0UGhhc2VMaXF1aWQiLCJHQVMiLCJzZXRQaGFzZUdhcyIsIkVycm9yIiwic2V0UGFydGljbGVDb25maWd1cmF0aW9uRm9yUGhhc2UiLCJzZXRQYXJ0aWNsZUNvbmZpZ3VyYXRpb25Tb2xpZCIsInNldFBhcnRpY2xlQ29uZmlndXJhdGlvbkxpcXVpZCIsInNldFBhcnRpY2xlQ29uZmlndXJhdGlvbkdhcyIsInNldFRlbXBlcmF0dXJlRm9yUGhhc2UiLCJzZXRUZW1wZXJhdHVyZSIsIlNPTElEX1RFTVBFUkFUVVJFIiwiTElRVUlEX1RFTVBFUkFUVVJFIiwiR0FTX1RFTVBFUkFUVVJFIiwiZmluZE9wZW5Nb2xlY3VsZVBvc2l0aW9uIiwicG9zWCIsInBvc1kiLCJtb2xlY3VsZURhdGFTZXQiLCJtb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9ucyIsIm1pbkluaXRpYWxJbnRlclBhcnRpY2xlRGlzdGFuY2UiLCJyYW5nZVgiLCJub3JtYWxpemVkQ29udGFpbmVyV2lkdGgiLCJyYW5nZVkiLCJub3JtYWxpemVkQ29udGFpbmVySGVpZ2h0IiwiaSIsImoiLCJwb3NpdGlvbkF2YWlsYWJsZSIsImsiLCJnZXROdW1iZXJPZk1vbGVjdWxlcyIsImRpc3RhbmNlWFkiLCJzZXRYWSIsImZvcm1DcnlzdGFsIiwibW9sZWN1bGVzUGVyTGF5ZXIiLCJ4U3BhY2luZyIsInlTcGFjaW5nIiwiYWx0ZXJuYXRlUm93T2Zmc2V0IiwiYm90dG9tWSIsInJhbmRvbWl6ZVJvdGF0aW9uYWxBbmdsZSIsIm51bWJlck9mTW9sZWN1bGVzIiwibW9sZWN1bGVWZWxvY2l0aWVzIiwibW9sZWN1bGVSb3RhdGlvbkFuZ2xlcyIsIm1vbGVjdWxlc0luc2lkZUNvbnRhaW5lciIsImluc2lkZUNvbnRhaW5lciIsInRlbXBlcmF0dXJlU3FydCIsIk1hdGgiLCJzcXJ0IiwidGVtcGVyYXR1cmVTZXRQb2ludFByb3BlcnR5IiwiZ2V0IiwiY3J5c3RhbFdpZHRoIiwic3RhcnRpbmdQb3NYIiwibW9sZWN1bGVzUGxhY2VkIiwieFBvcyIsInlQb3MiLCJtb2xlY3VsZUluZGV4IiwieFZlbCIsIm5leHRHYXVzc2lhbiIsInlWZWwiLCJhZGRYWSIsIm5leHREb3VibGUiLCJQSSIsInplcm9PdXRDb2xsZWN0aXZlVmVsb2NpdHkiLCJnZXRNb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9ucyIsImdldE1vbGVjdWxlVmVsb2NpdGllcyIsImdldE1vbGVjdWxlUm90YXRpb25BbmdsZXMiLCJtb2xlY3VsZVJvdGF0aW9uUmF0ZXMiLCJnZXRNb2xlY3VsZVJvdGF0aW9uUmF0ZXMiLCJuZXdQb3NYIiwibmV3UG9zWSIsIm9wZW5Qb2ludCIsInNldCIsImFkZCIsInhBZGp1c3RtZW50IiwieCIsInlBZGp1c3RtZW50IiwieSIsImxvYWRTYXZlZFN0YXRlIiwic2F2ZWRTdGF0ZSIsImFzc2VydCIsIkRJU1RBTkNFX0JFVFdFRU5fUEFSVElDTEVTX0lOX0NSWVNUQUwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFic3RyYWN0UGhhc2VTdGF0ZUNoYW5nZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhpcyBpcyB0aGUgYmFzZSBjbGFzcyBmb3IgdGhlIG9iamVjdHMgdGhhdCBkaXJlY3RseSBjaGFuZ2UgdGhlIHN0YXRlIG9mIHRoZSBtb2xlY3VsZXMgd2l0aGluIHRoZSBtdWx0aS1wYXJ0aWNsZVxyXG4gKiBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgQWFyb24gRGF2aXNcclxuICovXHJcblxyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBzdGF0ZXNPZk1hdHRlciBmcm9tICcuLi8uLi8uLi9zdGF0ZXNPZk1hdHRlci5qcyc7XHJcbmltcG9ydCBQaGFzZVN0YXRlRW51bSBmcm9tICcuLi8uLi9QaGFzZVN0YXRlRW51bS5qcyc7XHJcbmltcG9ydCBTT01Db25zdGFudHMgZnJvbSAnLi4vLi4vU09NQ29uc3RhbnRzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNSU5fSU5JVElBTF9QQVJUSUNMRV9UT19XQUxMX0RJU1RBTkNFID0gMS41O1xyXG5jb25zdCBNQVhfUExBQ0VNRU5UX0FUVEVNUFRTID0gNTAwOyAvLyBmb3IgcmFuZG9tIHBsYWNlbWVudCBvZiBwYXJ0aWNsZXNcclxuY29uc3QgTUlOX0lOSVRJQUxfR0FTX1BBUlRJQ0xFX0RJU1RBTkNFID0gMS4xOyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcblxyXG5jbGFzcyBBYnN0cmFjdFBoYXNlU3RhdGVDaGFuZ2VyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHsgTXVsdGlwbGVQYXJ0aWNsZU1vZGVsIH0gbXVsdGlwbGVQYXJ0aWNsZU1vZGVsIG9mIHRoZSBzaW11bGF0aW9uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtdWx0aXBsZVBhcnRpY2xlTW9kZWwgKSB7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMubXVsdGlwbGVQYXJ0aWNsZU1vZGVsID0gbXVsdGlwbGVQYXJ0aWNsZU1vZGVsO1xyXG4gICAgdGhpcy5tb2xlY3VsZVBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIHRoaXMucmFuZG9tID0gZG90UmFuZG9tO1xyXG4gICAgdGhpcy5yZXVzYWJsZVZlY3RvciA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIHBoYXNlIGJhc2VkIG9uIHRoZSBzcGVjaWZpZWQgSUQuICBUaGlzIG9mdGVuIG5lZWRzIHRvIGJlIG92ZXJyaWRkZW4gaW4gZGVzY2VuZGFudCBjbGFzc2VzIHRvIGRvIG1vcmVcclxuICAgKiBzcGVjaWZpYyBhY3Rpdml0aWVzLlxyXG4gICAqIEBwYXJhbSB7UGhhc2VTdGF0ZUVudW19IHBoYXNlSURcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0UGhhc2UoIHBoYXNlSUQgKSB7XHJcbiAgICBzd2l0Y2goIHBoYXNlSUQgKSB7XHJcbiAgICAgIGNhc2UgUGhhc2VTdGF0ZUVudW0uU09MSUQ6XHJcbiAgICAgICAgdGhpcy5zZXRQaGFzZVNvbGlkKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgUGhhc2VTdGF0ZUVudW0uTElRVUlEOlxyXG4gICAgICAgIHRoaXMuc2V0UGhhc2VMaXF1aWQoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBQaGFzZVN0YXRlRW51bS5HQVM6XHJcbiAgICAgICAgdGhpcy5zZXRQaGFzZUdhcygpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvciggYGludmFsaWQgcGhhc2VJRDogJHtwaGFzZUlEfWAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgcG9zaXRpb25zIGFuZCB2ZWxvY2l0aWVzIG9mIHRoZSBwYXJ0aWNsZXMgd2l0aG91dCBzZXR0aW5nIHRoZSBtb2RlbCB0ZW1wZXJhdHVyZS5cclxuICAgKiBAcGFyYW0ge1BoYXNlU3RhdGVFbnVtfSBwaGFzZUlEXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFBhcnRpY2xlQ29uZmlndXJhdGlvbkZvclBoYXNlKCBwaGFzZUlEICkge1xyXG4gICAgc3dpdGNoKCBwaGFzZUlEICkge1xyXG4gICAgICBjYXNlIFBoYXNlU3RhdGVFbnVtLlNPTElEOlxyXG4gICAgICAgIHRoaXMuc2V0UGFydGljbGVDb25maWd1cmF0aW9uU29saWQoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBQaGFzZVN0YXRlRW51bS5MSVFVSUQ6XHJcbiAgICAgICAgdGhpcy5zZXRQYXJ0aWNsZUNvbmZpZ3VyYXRpb25MaXF1aWQoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBQaGFzZVN0YXRlRW51bS5HQVM6XHJcbiAgICAgICAgdGhpcy5zZXRQYXJ0aWNsZUNvbmZpZ3VyYXRpb25HYXMoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBpbnZhbGlkIHBoYXNlSUQ6ICR7cGhhc2VJRH1gICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIG1vZGVsIHRlbXBlcmF0dXJlIGZvciB0aGUgc3BlY2lmaWVkIHBoYXNlLlxyXG4gICAqIEBwYXJhbSB7UGhhc2VTdGF0ZUVudW19IHBoYXNlSURcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0VGVtcGVyYXR1cmVGb3JQaGFzZSggcGhhc2VJRCApIHtcclxuICAgIHN3aXRjaCggcGhhc2VJRCApIHtcclxuICAgICAgY2FzZSBQaGFzZVN0YXRlRW51bS5TT0xJRDpcclxuICAgICAgICB0aGlzLm11bHRpcGxlUGFydGljbGVNb2RlbC5zZXRUZW1wZXJhdHVyZSggU09NQ29uc3RhbnRzLlNPTElEX1RFTVBFUkFUVVJFICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgUGhhc2VTdGF0ZUVudW0uTElRVUlEOlxyXG4gICAgICAgIHRoaXMubXVsdGlwbGVQYXJ0aWNsZU1vZGVsLnNldFRlbXBlcmF0dXJlKCBTT01Db25zdGFudHMuTElRVUlEX1RFTVBFUkFUVVJFICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgUGhhc2VTdGF0ZUVudW0uR0FTOlxyXG4gICAgICAgIHRoaXMubXVsdGlwbGVQYXJ0aWNsZU1vZGVsLnNldFRlbXBlcmF0dXJlKCBTT01Db25zdGFudHMuR0FTX1RFTVBFUkFUVVJFICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgaW52YWxpZCBwaGFzZUlEOiAke3BoYXNlSUR9YCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc2V0IHRoZSBwaGFzZSB0byBzb2xpZFxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICBzZXRQaGFzZVNvbGlkKCkge1xyXG4gICAgdGhpcy5zZXRUZW1wZXJhdHVyZUZvclBoYXNlKCBQaGFzZVN0YXRlRW51bS5TT0xJRCApO1xyXG4gICAgdGhpcy5zZXRQYXJ0aWNsZUNvbmZpZ3VyYXRpb25Tb2xpZCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc2V0IHRoZSBwaGFzZSB0byBsaXF1aWRcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgc2V0UGhhc2VMaXF1aWQoKSB7XHJcbiAgICB0aGlzLnNldFRlbXBlcmF0dXJlRm9yUGhhc2UoIFBoYXNlU3RhdGVFbnVtLkxJUVVJRCApO1xyXG4gICAgdGhpcy5zZXRQYXJ0aWNsZUNvbmZpZ3VyYXRpb25MaXF1aWQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHNldCB0aGUgcGhhc2UgdG8gZ2FzXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqL1xyXG4gIHNldFBoYXNlR2FzKCkge1xyXG4gICAgdGhpcy5zZXRUZW1wZXJhdHVyZUZvclBoYXNlKCBQaGFzZVN0YXRlRW51bS5HQVMgKTtcclxuICAgIHRoaXMuc2V0UGFydGljbGVDb25maWd1cmF0aW9uR2FzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEbyBhIGxpbmVhciBzZWFyY2ggZm9yIGEgcG9zaXRpb24gdGhhdCBpcyBzdWl0YWJseSBmYXIgYXdheSBlbm91Z2ggZnJvbSBhbGwgb3RoZXIgbW9sZWN1bGVzLiAgVGhpcyBpcyBnZW5lcmFsbHlcclxuICAgKiB1c2VkIHdoZW4gdGhlIGF0dGVtcHQgdG8gcGxhY2UgYSBtb2xlY3VsZSBhdCBhIHJhbmRvbSBwb3NpdGlvbiBmYWlscy4gIFRoaXMgaXMgZXhwZW5zaXZlIGluIHRlcm1zIG9mXHJcbiAgICogY29tcHV0YXRpb25hbCBwb3dlciwgYW5kIHNob3VsZCB0aHVzIGJlIHVzZWQgc3BhcmluZ2x5LlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZmluZE9wZW5Nb2xlY3VsZVBvc2l0aW9uKCkge1xyXG5cclxuICAgIGxldCBwb3NYO1xyXG4gICAgbGV0IHBvc1k7XHJcbiAgICBjb25zdCBtb2xlY3VsZURhdGFTZXQgPSB0aGlzLm11bHRpcGxlUGFydGljbGVNb2RlbC5tb2xlY3VsZURhdGFTZXQ7XHJcbiAgICBjb25zdCBtb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9ucyA9IG1vbGVjdWxlRGF0YVNldC5tb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9ucztcclxuXHJcbiAgICBjb25zdCBtaW5Jbml0aWFsSW50ZXJQYXJ0aWNsZURpc3RhbmNlID0gMS4yOyAvLyBlbXBpcmljYWxseSBjaG9zZW5cclxuICAgIGNvbnN0IHJhbmdlWCA9IHRoaXMubXVsdGlwbGVQYXJ0aWNsZU1vZGVsLm5vcm1hbGl6ZWRDb250YWluZXJXaWR0aCAtICggMiAqIE1JTl9JTklUSUFMX1BBUlRJQ0xFX1RPX1dBTExfRElTVEFOQ0UgKTtcclxuICAgIGNvbnN0IHJhbmdlWSA9IHRoaXMubXVsdGlwbGVQYXJ0aWNsZU1vZGVsLm5vcm1hbGl6ZWRDb250YWluZXJIZWlnaHQgLSAoIDIgKiBNSU5fSU5JVElBTF9QQVJUSUNMRV9UT19XQUxMX0RJU1RBTkNFICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCByYW5nZVggLyBtaW5Jbml0aWFsSW50ZXJQYXJ0aWNsZURpc3RhbmNlOyBpKysgKSB7XHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHJhbmdlWSAvIG1pbkluaXRpYWxJbnRlclBhcnRpY2xlRGlzdGFuY2U7IGorKyApIHtcclxuICAgICAgICBwb3NYID0gTUlOX0lOSVRJQUxfUEFSVElDTEVfVE9fV0FMTF9ESVNUQU5DRSArICggaSAqIG1pbkluaXRpYWxJbnRlclBhcnRpY2xlRGlzdGFuY2UgKTtcclxuICAgICAgICBwb3NZID0gTUlOX0lOSVRJQUxfUEFSVElDTEVfVE9fV0FMTF9ESVNUQU5DRSArICggaiAqIG1pbkluaXRpYWxJbnRlclBhcnRpY2xlRGlzdGFuY2UgKTtcclxuXHJcbiAgICAgICAgLy8gU2VlIGlmIHRoaXMgcG9zaXRpb24gaXMgYXZhaWxhYmxlLlxyXG4gICAgICAgIGxldCBwb3NpdGlvbkF2YWlsYWJsZSA9IHRydWU7XHJcbiAgICAgICAgZm9yICggbGV0IGsgPSAwOyBrIDwgbW9sZWN1bGVEYXRhU2V0LmdldE51bWJlck9mTW9sZWN1bGVzKCk7IGsrKyApIHtcclxuICAgICAgICAgIGlmICggbW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbnNbIGsgXS5kaXN0YW5jZVhZKCBwb3NYLCBwb3NZICkgPCBtaW5Jbml0aWFsSW50ZXJQYXJ0aWNsZURpc3RhbmNlICkge1xyXG4gICAgICAgICAgICBwb3NpdGlvbkF2YWlsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBwb3NpdGlvbkF2YWlsYWJsZSApIHtcclxuXHJcbiAgICAgICAgICAvLyBXZSBmb3VuZCBhbiBvcGVuIHBvc2l0aW9uLlxyXG4gICAgICAgICAgdGhpcy5tb2xlY3VsZVBvc2l0aW9uLnNldFhZKCBwb3NYLCBwb3NZICk7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5tb2xlY3VsZVBvc2l0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIG5vIG9wZW4gcG9zaXRpb24gZm91bmQsIHJldHVybiBudWxsXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGZvcm0gdGhlIG1vbGVjdWxlcyBpbnRvIGEgY3J5c3RhbCwgd2hpY2ggaXMgZXNzZW50aWFsbHkgYSBjdWJlIHNoYXBlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1vbGVjdWxlc1BlckxheWVyXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhTcGFjaW5nXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlTcGFjaW5nXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFsdGVybmF0ZVJvd09mZnNldFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b21ZXHJcbiAgICogQHBhcmFtIHtib29sZWFufSByYW5kb21pemVSb3RhdGlvbmFsQW5nbGVcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgZm9ybUNyeXN0YWwoIG1vbGVjdWxlc1BlckxheWVyLCB4U3BhY2luZywgeVNwYWNpbmcsIGFsdGVybmF0ZVJvd09mZnNldCwgYm90dG9tWSwgcmFuZG9taXplUm90YXRpb25hbEFuZ2xlICkge1xyXG5cclxuICAgIC8vIEdldCByZWZlcmVuY2VzIHRvIHRoZSB2YXJpb3VzIGVsZW1lbnRzIG9mIHRoZSBkYXRhIHNldC5cclxuICAgIGNvbnN0IG1vbGVjdWxlRGF0YVNldCA9IHRoaXMubXVsdGlwbGVQYXJ0aWNsZU1vZGVsLm1vbGVjdWxlRGF0YVNldDtcclxuICAgIGNvbnN0IG51bWJlck9mTW9sZWN1bGVzID0gbW9sZWN1bGVEYXRhU2V0LmdldE51bWJlck9mTW9sZWN1bGVzKCk7XHJcbiAgICBjb25zdCBtb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9ucyA9IG1vbGVjdWxlRGF0YVNldC5tb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9ucztcclxuICAgIGNvbnN0IG1vbGVjdWxlVmVsb2NpdGllcyA9IG1vbGVjdWxlRGF0YVNldC5tb2xlY3VsZVZlbG9jaXRpZXM7XHJcbiAgICBjb25zdCBtb2xlY3VsZVJvdGF0aW9uQW5nbGVzID0gbW9sZWN1bGVEYXRhU2V0Lm1vbGVjdWxlUm90YXRpb25BbmdsZXM7XHJcbiAgICBjb25zdCBtb2xlY3VsZXNJbnNpZGVDb250YWluZXIgPSB0aGlzLm11bHRpcGxlUGFydGljbGVNb2RlbC5tb2xlY3VsZURhdGFTZXQuaW5zaWRlQ29udGFpbmVyO1xyXG5cclxuICAgIC8vIFNldCB1cCBvdGhlciB2YXJpYWJsZXMgbmVlZGVkIHRvIGRvIHRoZSBqb2IuXHJcbiAgICBjb25zdCB0ZW1wZXJhdHVyZVNxcnQgPSBNYXRoLnNxcnQoIHRoaXMubXVsdGlwbGVQYXJ0aWNsZU1vZGVsLnRlbXBlcmF0dXJlU2V0UG9pbnRQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgY29uc3QgY3J5c3RhbFdpZHRoID0gbW9sZWN1bGVzUGVyTGF5ZXIgKiB4U3BhY2luZztcclxuICAgIGNvbnN0IHN0YXJ0aW5nUG9zWCA9ICggdGhpcy5tdWx0aXBsZVBhcnRpY2xlTW9kZWwubm9ybWFsaXplZENvbnRhaW5lcldpZHRoIC8gMiApIC0gKCBjcnlzdGFsV2lkdGggLyAyICk7XHJcblxyXG4gICAgLy8gUGxhY2UgdGhlIG1vbGVjdWxlcyBieSBwbGFjaW5nIHRoZWlyIGNlbnRlcnMgb2YgbWFzcy5cclxuICAgIGxldCBtb2xlY3VsZXNQbGFjZWQgPSAwO1xyXG4gICAgbGV0IHhQb3M7XHJcbiAgICBsZXQgeVBvcztcclxuICAgIHRoaXMucmV1c2FibGVWZWN0b3Iuc2V0WFkoIDAsIDAgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mTW9sZWN1bGVzOyBpKysgKSB7XHJcblxyXG4gICAgICAvLyBQb3NpdGlvbiBvbmUgbGF5ZXIgb2YgbW9sZWN1bGVzLlxyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7ICggaiA8IG1vbGVjdWxlc1BlckxheWVyICkgJiYgKCBtb2xlY3VsZXNQbGFjZWQgPCBudW1iZXJPZk1vbGVjdWxlcyApOyBqKysgKSB7XHJcbiAgICAgICAgeFBvcyA9IHN0YXJ0aW5nUG9zWCArICggaiAqIHhTcGFjaW5nICk7XHJcbiAgICAgICAgaWYgKCBpICUgMiAhPT0gMCApIHtcclxuXHJcbiAgICAgICAgICAvLyBFdmVyeSBvdGhlciByb3cgaXMgc2hpZnRlZCBhIGxpdHRsZS5cclxuICAgICAgICAgIHhQb3MgKz0gYWx0ZXJuYXRlUm93T2Zmc2V0O1xyXG4gICAgICAgIH1cclxuICAgICAgICB5UG9zID0gYm90dG9tWSArICggaSAqIHlTcGFjaW5nICk7XHJcbiAgICAgICAgY29uc3QgbW9sZWN1bGVJbmRleCA9ICggaSAqIG1vbGVjdWxlc1BlckxheWVyICkgKyBqO1xyXG4gICAgICAgIG1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb25zWyBtb2xlY3VsZUluZGV4IF0uc2V0WFkoIHhQb3MsIHlQb3MgKTtcclxuICAgICAgICBtb2xlY3VsZVJvdGF0aW9uQW5nbGVzWyBtb2xlY3VsZUluZGV4IF0gPSAwO1xyXG4gICAgICAgIG1vbGVjdWxlc1BsYWNlZCsrO1xyXG5cclxuICAgICAgICAvLyBBc3NpZ24gZWFjaCBtb2xlY3VsZSBhbiBpbml0aWFsIHZlbG9jaXR5LlxyXG4gICAgICAgIGNvbnN0IHhWZWwgPSB0ZW1wZXJhdHVyZVNxcnQgKiB0aGlzLnJhbmRvbS5uZXh0R2F1c3NpYW4oKTtcclxuICAgICAgICBjb25zdCB5VmVsID0gdGVtcGVyYXR1cmVTcXJ0ICogdGhpcy5yYW5kb20ubmV4dEdhdXNzaWFuKCk7XHJcbiAgICAgICAgbW9sZWN1bGVWZWxvY2l0aWVzWyBtb2xlY3VsZUluZGV4IF0uc2V0WFkoIHhWZWwsIHlWZWwgKTtcclxuXHJcbiAgICAgICAgLy8gVHJhY2sgdG90YWwgdmVsb2NpdHkgaW4gdGhlIFggZGlyZWN0aW9uLlxyXG4gICAgICAgIHRoaXMucmV1c2FibGVWZWN0b3IuYWRkWFkoIHhWZWwsIHlWZWwgKTtcclxuXHJcbiAgICAgICAgLy8gQXNzaWduIGFuIGluaXRpYWwgcm90YXRpb25hbCBhbmdsZSAoaGFzIG5vIGVmZmVjdCBmb3Igc2luZ2xlLWF0b20gZGF0YSBzZXRzKVxyXG4gICAgICAgIG1vbGVjdWxlUm90YXRpb25BbmdsZXNbIG1vbGVjdWxlSW5kZXggXSA9IHJhbmRvbWl6ZVJvdGF0aW9uYWxBbmdsZSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yYW5kb20ubmV4dERvdWJsZSgpICogMiAqIE1hdGguUEkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDA7XHJcblxyXG4gICAgICAgIC8vIE1hcmsgdGhlIG1vbGVjdWxlIGFzIGJlaW5nIGluIHRoZSBjb250YWluZXIuXHJcbiAgICAgICAgbW9sZWN1bGVzSW5zaWRlQ29udGFpbmVyWyBpIF0gPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy56ZXJvT3V0Q29sbGVjdGl2ZVZlbG9jaXR5KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIHBhcnRpY2xlIGNvbmZpZ3VyYXRpb24gZm9yIGdhcy4gIFRoaXMgY2FuIGJlIGdlbmVyYWxpemVkIG1vcmUgdGhhbiB0aGUgbGlxdWlkIGFuZCBzb2xpZCBwaGFzZXMsIGhlbmNlIGl0XHJcbiAgICogY2FuIGJlIGRlZmluZWQgaW4gdGhlIGJhc2UgY2xhc3MuXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqL1xyXG4gIHNldFBhcnRpY2xlQ29uZmlndXJhdGlvbkdhcygpIHtcclxuXHJcbiAgICAvLyBHZXQgcmVmZXJlbmNlcyB0byB0aGUgdmFyaW91cyBlbGVtZW50cyBvZiB0aGUgZGF0YSBzZXQuXHJcbiAgICBjb25zdCBtb2xlY3VsZURhdGFTZXQgPSB0aGlzLm11bHRpcGxlUGFydGljbGVNb2RlbC5tb2xlY3VsZURhdGFTZXQ7XHJcbiAgICBjb25zdCBtb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9ucyA9IG1vbGVjdWxlRGF0YVNldC5nZXRNb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9ucygpO1xyXG4gICAgY29uc3QgbW9sZWN1bGVWZWxvY2l0aWVzID0gbW9sZWN1bGVEYXRhU2V0LmdldE1vbGVjdWxlVmVsb2NpdGllcygpO1xyXG4gICAgY29uc3QgbW9sZWN1bGVSb3RhdGlvbkFuZ2xlcyA9IG1vbGVjdWxlRGF0YVNldC5nZXRNb2xlY3VsZVJvdGF0aW9uQW5nbGVzKCk7XHJcbiAgICBjb25zdCBtb2xlY3VsZVJvdGF0aW9uUmF0ZXMgPSBtb2xlY3VsZURhdGFTZXQuZ2V0TW9sZWN1bGVSb3RhdGlvblJhdGVzKCk7XHJcbiAgICBjb25zdCBtb2xlY3VsZXNJbnNpZGVDb250YWluZXIgPSB0aGlzLm11bHRpcGxlUGFydGljbGVNb2RlbC5tb2xlY3VsZURhdGFTZXQuaW5zaWRlQ29udGFpbmVyO1xyXG5cclxuICAgIC8vIFNldCB1cCBvdGhlciB2YXJpYWJsZXMgbmVlZGVkIHRvIGRvIHRoZSBqb2IuXHJcbiAgICBjb25zdCB0ZW1wZXJhdHVyZVNxcnQgPSBNYXRoLnNxcnQoIHRoaXMubXVsdGlwbGVQYXJ0aWNsZU1vZGVsLnRlbXBlcmF0dXJlU2V0UG9pbnRQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgY29uc3QgbnVtYmVyT2ZNb2xlY3VsZXMgPSBtb2xlY3VsZURhdGFTZXQuZ2V0TnVtYmVyT2ZNb2xlY3VsZXMoKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1iZXJPZk1vbGVjdWxlczsgaSsrICkge1xyXG5cclxuICAgICAgLy8gVGVtcG9yYXJpbHkgcG9zaXRpb24gdGhlIG1vbGVjdWxlcyBhdCAoMCwwKS5cclxuICAgICAgbW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbnNbIGkgXS5zZXRYWSggMCwgMCApO1xyXG5cclxuICAgICAgLy8gQXNzaWduIGVhY2ggbW9sZWN1bGUgYW4gaW5pdGlhbCB2ZWxvY2l0eS5cclxuICAgICAgbW9sZWN1bGVWZWxvY2l0aWVzWyBpIF0uc2V0WFkoXHJcbiAgICAgICAgdGVtcGVyYXR1cmVTcXJ0ICogdGhpcy5yYW5kb20ubmV4dEdhdXNzaWFuKCksXHJcbiAgICAgICAgdGVtcGVyYXR1cmVTcXJ0ICogdGhpcy5yYW5kb20ubmV4dEdhdXNzaWFuKClcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIEFzc2lnbiBlYWNoIG1vbGVjdWxlIGFuIGluaXRpYWwgcm90YXRpb25hbCBhbmdsZSBhbmQgcmF0ZS4gIFRoaXMgaXNuJ3QgdXNlZCBpbiB0aGUgbW9uYXRvbWljIGNhc2UsIGJ1dCBpdFxyXG4gICAgICAvLyBkb2Vzbid0IGh1cnQgYW55dGhpbmcgdG8gc2V0IHRoZSB2YWx1ZXMuXHJcbiAgICAgIG1vbGVjdWxlUm90YXRpb25BbmdsZXNbIGkgXSA9IHRoaXMucmFuZG9tLm5leHREb3VibGUoKSAqIE1hdGguUEkgKiAyO1xyXG4gICAgICBtb2xlY3VsZVJvdGF0aW9uUmF0ZXNbIGkgXSA9ICggdGhpcy5yYW5kb20ubmV4dERvdWJsZSgpICogMiAtIDEgKSAqIHRlbXBlcmF0dXJlU3FydCAqIE1hdGguUEkgKiAyO1xyXG5cclxuICAgICAgLy8gTWFyayBlYWNoIG1vbGVjdWxlIGFzIGluIHRoZSBjb250YWluZXIuXHJcbiAgICAgIG1vbGVjdWxlc0luc2lkZUNvbnRhaW5lclsgaSBdID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZWRpc3RyaWJ1dGUgdGhlIG1vbGVjdWxlcyByYW5kb21seSBhcm91bmQgdGhlIGNvbnRhaW5lciwgYnV0IG1ha2Ugc3VyZSB0aGF0IHRoZXkgYXJlIG5vdCB0b28gY2xvc2UgdG9nZXRoZXIgb3JcclxuICAgIC8vIHRoZXkgZW5kIHVwIHdpdGggYSBkaXNwcm9wb3J0aW9uYXRlIGFtb3VudCBvZiBraW5ldGljIGVuZXJneS5cclxuICAgIGxldCBuZXdQb3NYO1xyXG4gICAgbGV0IG5ld1Bvc1k7XHJcbiAgICBjb25zdCByYW5nZVggPSB0aGlzLm11bHRpcGxlUGFydGljbGVNb2RlbC5ub3JtYWxpemVkQ29udGFpbmVyV2lkdGggLSAoIDIgKiBNSU5fSU5JVElBTF9QQVJUSUNMRV9UT19XQUxMX0RJU1RBTkNFICk7XHJcbiAgICBjb25zdCByYW5nZVkgPSB0aGlzLm11bHRpcGxlUGFydGljbGVNb2RlbC5ub3JtYWxpemVkQ29udGFpbmVySGVpZ2h0IC0gKCAyICogTUlOX0lOSVRJQUxfUEFSVElDTEVfVE9fV0FMTF9ESVNUQU5DRSApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZNb2xlY3VsZXM7IGkrKyApIHtcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgTUFYX1BMQUNFTUVOVF9BVFRFTVBUUzsgaisrICkge1xyXG5cclxuICAgICAgICAvLyBQaWNrIGEgcmFuZG9tIHBvc2l0aW9uLlxyXG4gICAgICAgIG5ld1Bvc1ggPSBNSU5fSU5JVElBTF9QQVJUSUNMRV9UT19XQUxMX0RJU1RBTkNFICsgKCB0aGlzLnJhbmRvbS5uZXh0RG91YmxlKCkgKiByYW5nZVggKTtcclxuICAgICAgICBuZXdQb3NZID0gTUlOX0lOSVRJQUxfUEFSVElDTEVfVE9fV0FMTF9ESVNUQU5DRSArICggdGhpcy5yYW5kb20ubmV4dERvdWJsZSgpICogcmFuZ2VZICk7XHJcbiAgICAgICAgbGV0IHBvc2l0aW9uQXZhaWxhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gU2VlIGlmIHRoaXMgcG9zaXRpb24gaXMgYXZhaWxhYmxlLlxyXG4gICAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IGk7IGsrKyApIHtcclxuICAgICAgICAgIGlmICggbW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbnNbIGsgXS5kaXN0YW5jZVhZKCBuZXdQb3NYLCBuZXdQb3NZICkgPCBNSU5fSU5JVElBTF9HQVNfUEFSVElDTEVfRElTVEFOQ0UgKSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uQXZhaWxhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHBvc2l0aW9uQXZhaWxhYmxlIHx8IGogPT09IE1BWF9QTEFDRU1FTlRfQVRURU1QVFMgLSAxICkge1xyXG5cclxuICAgICAgICAgIC8vIFdlIGZvdW5kIGFuIG9wZW4gcG9zaXRpb24gb3Igd2UndmUgZG9uZSBhbGwgdGhlIHNlYXJjaGluZyB3ZSBjYW4uXHJcbiAgICAgICAgICBtb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9uc1sgaSBdLnNldFhZKCBuZXdQb3NYLCBuZXdQb3NZICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGogPT09IE1BWF9QTEFDRU1FTlRfQVRURU1QVFMgLSAyICkge1xyXG5cclxuICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIHNlY29uZCB0byBsYXN0IGF0dGVtcHQsIHNvIHRyeSBhIGxpbmVhciBzZWFyY2ggZm9yIGEgdXNhYmxlIHNwb3QuXHJcbiAgICAgICAgICBjb25zdCBvcGVuUG9pbnQgPSB0aGlzLmZpbmRPcGVuTW9sZWN1bGVQb3NpdGlvbigpO1xyXG4gICAgICAgICAgaWYgKCBvcGVuUG9pbnQgIT09IG51bGwgKSB7XHJcbiAgICAgICAgICAgIG1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb25zWyBpIF0uc2V0KCBvcGVuUG9pbnQgKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiB6ZXJvIG91dCB0aGUgY29sbGVjdGl2ZSB2ZWxvY2l0eSBvZiB0aGUgc3Vic3RhbmNlLCBnZW5lcmFsbHkgdXNlZCB0byBoZWxwIHByZXZlbnQgZHJpZnQgYWZ0ZXIgY2hhbmdpbmcgcGhhc2VcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgemVyb091dENvbGxlY3RpdmVWZWxvY2l0eSgpIHtcclxuXHJcbiAgICBjb25zdCBtb2xlY3VsZURhdGFTZXQgPSB0aGlzLm11bHRpcGxlUGFydGljbGVNb2RlbC5tb2xlY3VsZURhdGFTZXQ7XHJcbiAgICBjb25zdCBudW1iZXJPZk1vbGVjdWxlcyA9IG1vbGVjdWxlRGF0YVNldC5nZXROdW1iZXJPZk1vbGVjdWxlcygpO1xyXG4gICAgY29uc3QgbW9sZWN1bGVWZWxvY2l0aWVzID0gbW9sZWN1bGVEYXRhU2V0LmdldE1vbGVjdWxlVmVsb2NpdGllcygpO1xyXG4gICAgdGhpcy5yZXVzYWJsZVZlY3Rvci5zZXRYWSggMCwgMCApO1xyXG4gICAgbGV0IGk7XHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IG51bWJlck9mTW9sZWN1bGVzOyBpKysgKSB7XHJcbiAgICAgIHRoaXMucmV1c2FibGVWZWN0b3IuYWRkKCBtb2xlY3VsZVZlbG9jaXRpZXNbIGkgXSApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgeEFkanVzdG1lbnQgPSAtdGhpcy5yZXVzYWJsZVZlY3Rvci54IC8gbnVtYmVyT2ZNb2xlY3VsZXM7XHJcbiAgICBjb25zdCB5QWRqdXN0bWVudCA9IC10aGlzLnJldXNhYmxlVmVjdG9yLnkgLyBudW1iZXJPZk1vbGVjdWxlcztcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgbnVtYmVyT2ZNb2xlY3VsZXM7IGkrKyApIHtcclxuICAgICAgbW9sZWN1bGVWZWxvY2l0aWVzWyBpIF0uYWRkWFkoIHhBZGp1c3RtZW50LCB5QWRqdXN0bWVudCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTG9hZCBwcmV2aW91c2x5IHNhdmVkIHBvc2l0aW9uIGFuZCBtb3Rpb24gc3RhdGUsIGRvZXMgTk9UIGxvYWQgZm9yY2VzIHN0YXRlXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqL1xyXG4gIGxvYWRTYXZlZFN0YXRlKCBzYXZlZFN0YXRlICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgIHRoaXMubXVsdGlwbGVQYXJ0aWNsZU1vZGVsLm1vbGVjdWxlRGF0YVNldC5udW1iZXJPZk1vbGVjdWxlcyA9PT0gc2F2ZWRTdGF0ZS5udW1iZXJPZk1vbGVjdWxlcyxcclxuICAgICAgJ3VuZXhwZWN0ZWQgbnVtYmVyIG9mIHBhcnRpY2xlcyBpbiBzYXZlZCBkYXRhIHNldCdcclxuICAgICk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBpbml0aWFsIHZlbG9jaXR5IGZvciBlYWNoIG9mIHRoZSBhdG9tcyBiYXNlZCBvbiB0aGUgbmV3IHRlbXBlcmF0dXJlLlxyXG4gICAgY29uc3QgbnVtYmVyT2ZNb2xlY3VsZXMgPSB0aGlzLm11bHRpcGxlUGFydGljbGVNb2RlbC5tb2xlY3VsZURhdGFTZXQubnVtYmVyT2ZNb2xlY3VsZXM7XHJcbiAgICBjb25zdCBtb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9ucyA9IHRoaXMubXVsdGlwbGVQYXJ0aWNsZU1vZGVsLm1vbGVjdWxlRGF0YVNldC5tb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9ucztcclxuICAgIGNvbnN0IG1vbGVjdWxlVmVsb2NpdGllcyA9IHRoaXMubXVsdGlwbGVQYXJ0aWNsZU1vZGVsLm1vbGVjdWxlRGF0YVNldC5tb2xlY3VsZVZlbG9jaXRpZXM7XHJcbiAgICBjb25zdCBtb2xlY3VsZVJvdGF0aW9uQW5nbGVzID0gdGhpcy5tdWx0aXBsZVBhcnRpY2xlTW9kZWwubW9sZWN1bGVEYXRhU2V0Lm1vbGVjdWxlUm90YXRpb25BbmdsZXM7XHJcbiAgICBjb25zdCBtb2xlY3VsZVJvdGF0aW9uUmF0ZXMgPSB0aGlzLm11bHRpcGxlUGFydGljbGVNb2RlbC5tb2xlY3VsZURhdGFTZXQubW9sZWN1bGVSb3RhdGlvblJhdGVzO1xyXG4gICAgY29uc3QgbW9sZWN1bGVzSW5zaWRlQ29udGFpbmVyID0gdGhpcy5tdWx0aXBsZVBhcnRpY2xlTW9kZWwubW9sZWN1bGVEYXRhU2V0Lmluc2lkZUNvbnRhaW5lcjtcclxuXHJcbiAgICAvLyBmb3IgKCB2YXIgaSA9IDA7IGkgPCBudW1iZXJPZk1vbGVjdWxlczsgaSsrICkge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZNb2xlY3VsZXM7IGkrKyApIHtcclxuICAgICAgbW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbnNbIGkgXS5zZXRYWShcclxuICAgICAgICBzYXZlZFN0YXRlLm1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb25zWyBpIF0ueCxcclxuICAgICAgICBzYXZlZFN0YXRlLm1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb25zWyBpIF0ueVxyXG4gICAgICApO1xyXG4gICAgICBtb2xlY3VsZVZlbG9jaXRpZXNbIGkgXS5zZXRYWShcclxuICAgICAgICBzYXZlZFN0YXRlLm1vbGVjdWxlVmVsb2NpdGllc1sgaSBdLngsXHJcbiAgICAgICAgc2F2ZWRTdGF0ZS5tb2xlY3VsZVZlbG9jaXRpZXNbIGkgXS55XHJcbiAgICAgICk7XHJcbiAgICAgIGlmICggc2F2ZWRTdGF0ZS5tb2xlY3VsZVJvdGF0aW9uQW5nbGVzICkge1xyXG4gICAgICAgIG1vbGVjdWxlUm90YXRpb25BbmdsZXNbIGkgXSA9IHNhdmVkU3RhdGUubW9sZWN1bGVSb3RhdGlvbkFuZ2xlc1sgaSBdO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggc2F2ZWRTdGF0ZS5tb2xlY3VsZVJvdGF0aW9uQW5nbGVzICkge1xyXG4gICAgICAgIG1vbGVjdWxlUm90YXRpb25SYXRlc1sgaSBdID0gc2F2ZWRTdGF0ZS5tb2xlY3VsZVJvdGF0aW9uUmF0ZXNbIGkgXTtcclxuICAgICAgfVxyXG4gICAgICBtb2xlY3VsZXNJbnNpZGVDb250YWluZXJbIGkgXSA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBzdGF0aWNzXHJcbkFic3RyYWN0UGhhc2VTdGF0ZUNoYW5nZXIuTUlOX0lOSVRJQUxfUEFSVElDTEVfVE9fV0FMTF9ESVNUQU5DRSA9IE1JTl9JTklUSUFMX1BBUlRJQ0xFX1RPX1dBTExfRElTVEFOQ0U7XHJcbkFic3RyYWN0UGhhc2VTdGF0ZUNoYW5nZXIuRElTVEFOQ0VfQkVUV0VFTl9QQVJUSUNMRVNfSU5fQ1JZU1RBTCA9IDAuMTI7IC8vIGluIHBhcnRpY2xlIGRpYW1ldGVyc1xyXG5BYnN0cmFjdFBoYXNlU3RhdGVDaGFuZ2VyLk1BWF9QTEFDRU1FTlRfQVRURU1QVFMgPSBNQVhfUExBQ0VNRU5UX0FUVEVNUFRTOyAvLyBmb3IgcmFuZG9tIHBsYWNlbWVudCBvZiBwYXJ0aWNsZXNcclxuXHJcbnN0YXRlc09mTWF0dGVyLnJlZ2lzdGVyKCAnQWJzdHJhY3RQaGFzZVN0YXRlQ2hhbmdlcicsIEFic3RyYWN0UGhhc2VTdGF0ZUNoYW5nZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgQWJzdHJhY3RQaGFzZVN0YXRlQ2hhbmdlcjtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sb0NBQW9DO0FBQzFELE9BQU9DLE9BQU8sTUFBTSxrQ0FBa0M7QUFDdEQsT0FBT0MsY0FBYyxNQUFNLDRCQUE0QjtBQUN2RCxPQUFPQyxjQUFjLE1BQU0seUJBQXlCO0FBQ3BELE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7O0FBRWhEO0FBQ0EsTUFBTUMscUNBQXFDLEdBQUcsR0FBRztBQUNqRCxNQUFNQyxzQkFBc0IsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNwQyxNQUFNQyxpQ0FBaUMsR0FBRyxHQUFHLENBQUMsQ0FBQzs7QUFFL0MsTUFBTUMseUJB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