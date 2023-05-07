// Copyright 2014-2022, University of Colorado Boulder

/**
 * A static object that contains methods for redistributing a set of energy chunks within a shape in order to make them
 * spread out fairly evenly in a way that looks dynamic and realistic.  The basic approach is to simulate a set of
 * small spheres embedded in a fluid, and each one is changes such that it repels all others as well as the edges of the
 * container(s).  The repulsion algorithm is based on Coulomb's law.
 *
 * Reuse Notes: This could probably be generalized fairly easily to distribute any number items within a container of
 * arbitrary size.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EFACQueryParameters from '../EFACQueryParameters.js';

// constants
const OUTSIDE_SLICE_FORCE = 0.01; // In Newtons, empirically determined.

// width of an energy chunk in the view, used to keep them in bounds
const ENERGY_CHUNK_VIEW_TO_MODEL_WIDTH = 0.012;

// parameters that can be adjusted to change the nature of the repulsive redistribution algorithm
const MAX_TIME_STEP = 1 / 60 / 3; // in seconds, for algorithm that moves the points, best if a multiple of nominal frame rate
const ENERGY_CHUNK_MASS = 0.00035; // in kilograms, mass of a bb, which seems about right
const FLUID_DENSITY = 8000; // in kg / m ^ 3 - for reference, water is 1000, molten lead is around 10000
const ENERGY_CHUNK_DIAMETER = 0.0044; // in meters, this is the diameter of a bb, which seems about right

// charge of an energy chunk in Coulombs, about 1/100th of what a charged balloon would be
const ENERGY_CHUNK_CHARGE = 1E-9;

// charge of the wall, used to calculate repulsion of energy chunks
const WALL_CHARGE = ENERGY_CHUNK_CHARGE;

// for drag, treat energy chunk as if it is shaped like a sphere
const ENERGY_CHUNK_CROSS_SECTIONAL_AREA = Math.PI * Math.pow(ENERGY_CHUNK_DIAMETER, 2);
const DRAG_COEFFICIENT = 0.48; // unitless, this is what Wikipedia says is the value for a rough sphere

// Threshold for deciding whether or not to perform redistribution. Lower values finish the redistribution more
// quickly but not as thoroughly, higher values are thorough but more computationally intensive.  The value here was
// empirically determined to work well for the EFAC sim.
const REDISTRIBUTION_THRESHOLD_ENERGY = 3E-6; // in joules (I think)

// max number of energy chunk slices that can be handled per call to update positions, adjust as needed
const MAX_SLICES = 6;

// max number of energy chunks per slice that can be redistributed per call, adjust as needed
const MAX_ENERGY_CHUNKS_PER_SLICE = 25;

// speed used when positioning ECs using deterministic algorithms, in meters per second
const EC_SPEED_DETERMINISTIC = 0.1;

// Coulomb's constant, used to calculate repulsive forces, from Wikipedia
const COULOMBS_CONSTANT = 9E9;

// pre-calculated factors based on the above values, used to save time in the computations below
const DRAG_MULTIPLIER = 0.5 * FLUID_DENSITY * DRAG_COEFFICIENT * ENERGY_CHUNK_CROSS_SECTIONAL_AREA;
const WALL_REPULSION_FACTOR = -COULOMBS_CONSTANT * ENERGY_CHUNK_CHARGE * WALL_CHARGE; // based on Coulomb's law
const EC_REPULSION_FACTOR = -COULOMBS_CONSTANT * ENERGY_CHUNK_CHARGE * ENERGY_CHUNK_CHARGE; // based on Coulomb's law

//-------------------------------------------------------------------------------------------------------------------
// reusable variables and array intended to reduce garbage collection and thus improve performance
//-------------------------------------------------------------------------------------------------------------------

// a reusable 2D array of the energy chunks being redistributed, indexed by [sliceNum][ecNum]
const energyChunks = new Array(MAX_SLICES);

// a reusable 2D array of the force vectors for the energy chunks, indexed by [sliceNum][ecNum]
const energyChunkForces = new Array(MAX_SLICES);

// initialize the reusable arrays
_.times(MAX_SLICES, sliceIndex => {
  energyChunks[sliceIndex] = new Array(MAX_ENERGY_CHUNKS_PER_SLICE);
  energyChunkForces[sliceIndex] = new Array(MAX_ENERGY_CHUNKS_PER_SLICE);
  _.times(MAX_ENERGY_CHUNKS_PER_SLICE, ecIndex => {
    energyChunkForces[sliceIndex][ecIndex] = new Vector2(0, 0);
  });
});

// a reusable vector for calculating drag force
const reusableDragForceVector = new Vector2(0, 0);
const compositeSliceBounds = Bounds2.NOTHING.copy();

// the main singleton object definition
const energyChunkDistributor = {
  /**
   * Redistribute a set of energy chunks that are contained in energy chunk slices using an algorithm where the
   * chunks are repelled by each other and by the edges of the slice.  The distribution is done taking all nearby
   * slices into account so that the chunks can be distributed in a way that minimizes overlap.
   * @param {EnergyChunkContainerSlice[]} slices - set of slices that contain energy chunks
   * @param {number} dt - change in time
   * @returns {boolean} - a value indicating whether redistribution was done, false can occur if the energy chunks are
   * already well distributed
   * @private
   */
  updatePositionsRepulsive(slices, dt) {
    // determine a rectangle that bounds all of the slices
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    // determine the collective bounds of all the slices
    slices.forEach(slice => {
      minX = Math.min(slice.bounds.minX, minX);
      maxX = Math.max(slice.bounds.maxX, maxX);
      minY = Math.min(slice.bounds.minY, minY);
      maxY = Math.max(slice.bounds.maxY, maxY);
    });
    compositeSliceBounds.setMinMax(minX, minY, maxX, maxY);

    // reusable iterator values and loop variables
    let sliceIndex;
    let ecIndex;
    let slice;

    // initialize the list of energy chunks and forces acting upon them
    let totalNumEnergyChunks = 0;
    for (sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
      slice = slices[sliceIndex];

      // make sure the pre-allocated arrays for energy chunks and their forces are big enough
      assert && assert(slice.energyChunkList.length <= MAX_ENERGY_CHUNKS_PER_SLICE, 'pre-allocated array too small, please adjust');

      // put each energy chunk on the list of those to be processed
      for (ecIndex = 0; ecIndex < slices[sliceIndex].energyChunkList.length; ecIndex++) {
        energyChunks[sliceIndex][ecIndex] = slices[sliceIndex].energyChunkList.get(ecIndex);
        totalNumEnergyChunks++;
      }
    }

    // make sure that there is actually something to distribute
    if (totalNumEnergyChunks === 0) {
      return false; // nothing to do - bail out
    }

    // divide the time step up into the largest value known to work consistently for the algorithm
    let particlesRedistributed = false;
    const numberOfUpdateSteps = Math.floor(dt / MAX_TIME_STEP);
    const extraTime = dt - numberOfUpdateSteps * MAX_TIME_STEP;
    for (let forceCalcStep = 0; forceCalcStep <= numberOfUpdateSteps; forceCalcStep++) {
      const timeStep = forceCalcStep < numberOfUpdateSteps ? MAX_TIME_STEP : extraTime;
      assert && assert(timeStep <= MAX_TIME_STEP);

      // update the forces acting on the energy chunk due to its bounding container, other energy chunks, and drag
      for (sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
        slice = slices[sliceIndex];
        const containerShapeBounds = slice.bounds;

        // determine forces on each energy chunk
        for (ecIndex = 0; ecIndex < slice.energyChunkList.length; ecIndex++) {
          const ec = energyChunks[sliceIndex][ecIndex];
          energyChunkForces[sliceIndex][ecIndex].setXY(0, 0);
          if (containerShapeBounds.containsPoint(ec.positionProperty.value)) {
            // compute forces from the edges of the slice boundary
            this.updateEdgeForces(ec.positionProperty.value, energyChunkForces[sliceIndex][ecIndex], containerShapeBounds);

            // compute forces from other energy chunks
            this.updateEnergyChunkForces(ec, energyChunkForces[sliceIndex][ecIndex], energyChunks, slices);

            // update drag force
            this.updateDragForce(ec.velocity, energyChunkForces[sliceIndex][ecIndex], timeStep);
          } else {
            // point is outside container, move it towards center of shape
            energyChunkForces[sliceIndex][ecIndex].setXY(containerShapeBounds.centerX - ec.positionProperty.value.x, containerShapeBounds.centerY - ec.positionProperty.value.y).setMagnitude(OUTSIDE_SLICE_FORCE);
          }
        }
      }
      const maxEnergy = this.updateVelocities(slices, energyChunks, energyChunkForces, timeStep);
      particlesRedistributed = maxEnergy > REDISTRIBUTION_THRESHOLD_ENERGY;
      if (particlesRedistributed) {
        this.updateEnergyChunkPositions(slices, timeStep);
      }
    }
    return particlesRedistributed;
  },
  /**
   * compute the force on an energy chunk based on the edges of the container in which it resides
   * @param {Vector2} position
   * @param {Vector2} ecForce
   * @param {Bounds2} containerBounds
   * @private
   */
  updateEdgeForces: function (position, ecForce, containerBounds) {
    // this should only be called for chunks that are inside a container
    assert && assert(containerBounds.containsPoint(position));

    // the minimum distance from the wall is one EC radius
    const minDistance = ENERGY_CHUNK_DIAMETER / 2;

    // get the distance to the four different edges
    const distanceFromRightSide = Math.max(containerBounds.maxX - position.x, minDistance);
    const distanceFromBottom = Math.max(position.y - containerBounds.minY, minDistance);
    const distanceFromLeftSide = Math.max(position.x - containerBounds.minX, minDistance);
    const distanceFromTop = Math.max(containerBounds.maxY - position.y, minDistance);

    // apply the forces
    ecForce.addXY(WALL_REPULSION_FACTOR / Math.pow(distanceFromRightSide, 2), 0); // force from right edge
    ecForce.addXY(0, -WALL_REPULSION_FACTOR / Math.pow(distanceFromBottom, 2)); // force from bottom edge
    ecForce.addXY(-WALL_REPULSION_FACTOR / Math.pow(distanceFromLeftSide, 2), 0); // force from left edge
    ecForce.addXY(0, WALL_REPULSION_FACTOR / Math.pow(distanceFromTop, 2)); // force from top edge
  },

  /**
   * compute the force on an energy chunk based on the drag that it is experiencing
   * @param {Vector2} velocity
   * @param {Vector2} ecForce
   * @param {number} timeStep - length of time step, in seconds
   * @private
   */
  updateDragForce: function (velocity, ecForce, timeStep) {
    const velocityMagnitude = velocity.magnitude;
    const velocityMagnitudeSquared = Math.pow(velocityMagnitude, 2);
    assert && assert(velocityMagnitudeSquared !== Infinity && !_.isNaN(velocityMagnitudeSquared) && typeof velocityMagnitudeSquared === 'number', `velocity^2 is ${velocityMagnitudeSquared}`);

    // calculate the drag based on the velocity and the nature of the fluid that it's in, see
    // https://en.wikipedia.org/wiki/Drag_equation
    let dragForceMagnitude = DRAG_MULTIPLIER * velocityMagnitudeSquared;
    if (dragForceMagnitude > 0) {
      // limit the drag force vector such that it can't reverse the current velocity, since that is unphysical
      if (dragForceMagnitude / ENERGY_CHUNK_MASS * timeStep > velocityMagnitude) {
        dragForceMagnitude = velocityMagnitude * ENERGY_CHUNK_MASS / timeStep;
      }

      // calculate the drag force vector
      reusableDragForceVector.setXY(-velocity.x, -velocity.y);
      reusableDragForceVector.setMagnitude(dragForceMagnitude);

      // add the drag force to the total force acting on this energy chunk
      ecForce.addXY(reusableDragForceVector.x, reusableDragForceVector.y);
    }
  },
  /**
   * update the forces acting on the provided energy chunk due to all the other energy chunks
   * @param {EnergyChunk} ec
   * @param {Vector2} ecForce - the force vector acting on the energy chunk being evaluated
   * @param {EnergyChunk[]} energyChunks
   * @param {EnergyChunkContainerSlice[]} slices
   * @private
   */
  updateEnergyChunkForces: function (ec, ecForce, energyChunks, slices) {
    // allocate reusable vectors to improve performance
    let vectorFromOther = Vector2.pool.fetch();
    const forceFromOther = Vector2.pool.fetch();

    // the minimum distance between two chunks is 2 times the radius of each, or 1x the diameter
    const minDistance = ENERGY_CHUNK_DIAMETER / 2;

    // apply the force from each of the other energy chunks, but set some limits on the max force that can be applied
    for (let sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
      for (let ecIndex = 0; ecIndex < slices[sliceIndex].energyChunkList.length; ecIndex++) {
        const otherEnergyChunk = energyChunks[sliceIndex][ecIndex];

        // skip self
        if (otherEnergyChunk === ec) {
          continue;
        }

        // calculate force vector, but handle cases where too close
        vectorFromOther.setXY(ec.positionProperty.value.x - otherEnergyChunk.positionProperty.value.x, ec.positionProperty.value.y - otherEnergyChunk.positionProperty.value.y);
        if (vectorFromOther.magnitude < minDistance) {
          if (vectorFromOther.setMagnitude(0)) {
            // create a random vector of min distance
            const randomAngle = dotRandom.nextDouble() * Math.PI * 2;
            vectorFromOther.setXY(minDistance * Math.cos(randomAngle), minDistance * Math.sin(randomAngle));
          } else {
            vectorFromOther = vectorFromOther.setMagnitude(minDistance);
          }
        }
        forceFromOther.setXY(vectorFromOther.x, vectorFromOther.y);
        forceFromOther.setMagnitude(-EC_REPULSION_FACTOR / vectorFromOther.magnitudeSquared);

        // add the force to the accumulated forces on this energy chunk
        ecForce.setXY(ecForce.x + forceFromOther.x, ecForce.y + forceFromOther.y);
      }
    }

    // free allocations
    vectorFromOther.freeToPool();
    forceFromOther.freeToPool();
  },
  /**
   * update energy chunk velocities, returning max energy found
   * @param  {EnergyChunkContainerSlice[]} slices
   * @param  {EnergyChunk[][]} energyChunks
   * @param  {Vector2[][]} energyChunkForces
   * @param {number} dt - time step
   * @returns {number} - the energy in the most energetic energy chunk
   * @private
   */
  updateVelocities: function (slices, energyChunks, energyChunkForces, dt) {
    let energyInMostEnergeticEC = 0;

    // loop through the slices, and then the energy chunks therein, and update their velocities
    for (let sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
      const numberOfEnergyChunksInSlice = slices[sliceIndex].energyChunkList.length;
      for (let ecIndex = 0; ecIndex < numberOfEnergyChunksInSlice; ecIndex++) {
        // force on this chunk
        const force = energyChunkForces[sliceIndex][ecIndex];
        assert && assert(!_.isNaN(force.x) && !_.isNaN(force.y), 'force contains NaN value');

        // current velocity
        const velocity = energyChunks[sliceIndex][ecIndex].velocity;
        assert && assert(!_.isNaN(velocity.x) && !_.isNaN(velocity.y), 'velocity contains NaN value');

        // velocity change is based on the formula v = (F/m)* t, so pre-compute the t/m part for later use
        const forceMultiplier = dt / ENERGY_CHUNK_MASS;

        // update velocity based on the sum of forces acting on the energy chunk
        velocity.addXY(force.x * forceMultiplier, force.y * forceMultiplier);
        assert && assert(!_.isNaN(velocity.x) && !_.isNaN(velocity.y), 'New velocity contains NaN value');

        // update max energy
        const totalParticleEnergy = 0.5 * ENERGY_CHUNK_MASS * velocity.magnitudeSquared + force.magnitude * Math.PI / 2;
        energyInMostEnergeticEC = Math.max(totalParticleEnergy, energyInMostEnergeticEC);
      }
    }
    return energyInMostEnergeticEC;
  },
  /**
   * update the energy chunk positions based on their velocity and a time step
   * @param  {EnergyChunkContainerSlice[]} slices
   * @param  {number} dt - time step in seconds
   * @public
   */
  updateEnergyChunkPositions: function (slices, dt) {
    slices.forEach(slice => {
      slice.energyChunkList.forEach(ec => {
        const v = ec.velocity;
        const position = ec.positionProperty.value;
        ec.setPositionXY(position.x + v.x * dt, position.y + v.y * dt);
      });
    });
  },
  /**
   * An order-N algorithm for distributing the energy chunks based on an Archimedean spiral.  This was created from
   * first thinking about using concentric circles, then figuring that a spiral is perhaps and easier way to get a
   * similar effect.  Many of the values used were arrived at through trial and error.
   * @param {EnergyChunkContainerSlice[]} slices
   * @param {number} dt - time step
   * @returns {boolean} - true if any energy chunks needed to be moved, false if not
   * @private
   */
  updatePositionsSpiral(slices, dt) {
    let ecMoved = false;
    const ecDestination = new Vector2(0, 0); // reusable vector to minimize garbage collection

    // loop through each slice, updating the energy chunk positions for each
    for (let sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
      const sliceBounds = slices[sliceIndex].bounds;
      const sliceCenter = sliceBounds.getCenter();
      const numberOfEnergyChunksInSlice = slices[sliceIndex].energyChunkList.length;
      if (numberOfEnergyChunksInSlice === 0) {
        // bail out now if there are no energy chunks to distribute in this slice
        continue;
      }

      // number of turns of the spiral
      const numberOfTurns = 3;
      const maxAngle = numberOfTurns * Math.PI * 2;
      const a = 1 / maxAngle; // the equation for the spiral is generally written as r = a * theta, this is the 'a'

      // Define the angular span over which energy chunks will be placed.  This will grow as the number of energy
      // chunks grows.
      let angularSpan;
      if (numberOfEnergyChunksInSlice <= 6) {
        angularSpan = 2 * Math.PI * (1 - 1 / numberOfEnergyChunksInSlice);
      } else {
        angularSpan = Math.min(Math.max(numberOfEnergyChunksInSlice / 19 * maxAngle, 2 * Math.PI), maxAngle);
      }

      // The offset faction defined below controls how weighted the algorithm is towards placing chunks towards the
      // end of the spiral versus the beginning.  We always want to be somewhat weighted towards the end since there
      // is more space at the end, but this gets more important as the number of slices increases because we need to
      // avoid overlap of energy chunks in the middle of the model element.
      const offsetFactor = -1 / Math.pow(slices.length, 1.75) + 1;
      const startAngle = offsetFactor * (maxAngle - angularSpan);

      // Define a value that will be used to offset the spiral rotation in the different slices so that energy chunks
      // are less likely to line up across slices.
      const spiralAngleOffset = 2 * Math.PI / slices.length + Math.PI;

      // loop through each energy chunk in this slice and set its position
      for (let ecIndex = 0; ecIndex < numberOfEnergyChunksInSlice; ecIndex++) {
        const ec = slices[sliceIndex].energyChunkList.get(ecIndex);

        // calculate the angle to feed into the spiral formula
        let angle;
        if (numberOfEnergyChunksInSlice <= 1) {
          angle = startAngle;
        } else {
          angle = startAngle + Math.pow(ecIndex / (numberOfEnergyChunksInSlice - 1), 0.75) * angularSpan;
        }

        // calculate a radius value within the "normalized spiral", where the radius is 1 at the max angle
        const normalizedRadius = a * Math.abs(angle);
        assert && assert(normalizedRadius <= 1, 'normalized length must be 1 or smaller');

        // Rotate the spiral in each set of two slices to minimize overlap between slices.  This works in conjunction
        // with the code that reverses the winding direction below so that the same spiral is never used for any two
        // slices.
        let adjustedAngle = angle + spiralAngleOffset * sliceIndex;

        // Determine the max possible radius for the current angle, which is basically the distance from the center to
        // the closest edge.  This must be reduced a bit to account for the fact that energy chunks have some width in
        // the view.
        const maxRadius = getCenterToEdgeDistance(sliceBounds, adjustedAngle) - ENERGY_CHUNK_VIEW_TO_MODEL_WIDTH / 2;

        // determine the radius to use as a function of the value from the normalized spiral and the max value
        const radius = maxRadius * normalizedRadius;

        // Reverse the angle on every other slice to get more spread between slices and a more random appearance when
        // chunks are added (because they don't all wind in the same direction).
        if (sliceIndex % 2 === 0) {
          adjustedAngle = -adjustedAngle;
        }

        // calculate the desired position using polar coordinates
        ecDestination.setPolar(radius, adjustedAngle);
        ecDestination.add(sliceCenter);

        // animate the energy chunk towards its destination if it isn't there already
        if (!ec.positionProperty.value.equals(ecDestination)) {
          moveECTowardsDestination(ec, ecDestination, dt);
          ecMoved = true;
        }
      }
    }
    return ecMoved;
  },
  /**
   * Super simple alternative energy chunk distribution algorithm - just puts all energy chunks in center of slice.
   * This is useful for debugging since it positions the chunks as quickly as possible.
   * @param {EnergyChunkContainerSlice[]} slices
   * @param {number} dt - time step
   * @returns {boolean} - true if any energy chunks needed to be moved, false if not
   * @private
   */
  updatePositionsSimple(slices, dt) {
    let ecMoved = false;
    const ecDestination = new Vector2(0, 0); // reusable vector to minimze garbage collection

    // update the positions of the energy chunks
    slices.forEach(slice => {
      slice.energyChunkList.forEach(energyChunk => {
        ecDestination.setXY(slice.bounds.centerX, slice.bounds.centerY);

        // animate the energy chunk towards its destination if it isn't there already
        if (!energyChunk.positionProperty.value.equals(ecDestination)) {
          moveECTowardsDestination(energyChunk, ecDestination, dt);
          ecMoved = true;
        }
      });
    });
    return ecMoved;
  },
  /**
   * Set the algorithm to use in the "updatePositions" method.  This is generally done only during initialization so
   * that users don't see noticeable changes in the energy chunk motion.  The tradeoffs between the different
   * algorithms are generally based on how good it looks and how much computational power it requires.
   * @param {string} algorithmName
   * @public
   */
  setDistributionAlgorithm(algorithmName) {
    if (algorithmName === 'repulsive') {
      this.updatePositions = this.updatePositionsRepulsive;
    } else if (algorithmName === 'spiral') {
      this.updatePositions = this.updatePositionsSpiral;
    } else if (algorithmName === 'simple') {
      this.updatePositions = this.updatePositionsSimple;
    } else {
      assert && assert(false, `unknown distribution algorithm specified: ${algorithmName}`);
    }
  }
};

// Set up the distribution algorithm to use based on query parameters.  If no query parameter is specified, we start
// with the repulsive algorithm because it looks best, but may move to spiral if poor performance is detected.
if (EFACQueryParameters.ecDistribution === null) {
  // use the repulsive algorithm by default, which looks the best but is also the most computationally expensive
  energyChunkDistributor.updatePositions = energyChunkDistributor.updatePositionsRepulsive;
} else {
  energyChunkDistributor.setDistributionAlgorithm(EFACQueryParameters.ecDistribution);
}

/**
 * helper function for moving an energy chunk towards a destination, sets the EC's velocity value
 * @param {EnergyChunk} ec
 * @param {Vector2} destination
 * @param {number} dt - delta time, in seconds
 */
const moveECTowardsDestination = (ec, destination, dt) => {
  const ecPosition = ec.positionProperty.value;
  if (!ecPosition.equals(destination)) {
    if (ecPosition.distance(destination) <= EC_SPEED_DETERMINISTIC * dt) {
      // EC is close enough that it should just go to the destination
      ec.positionProperty.set(destination.copy());
    } else {
      const vectorTowardsDestination = destination.minus(ec.positionProperty.value);
      vectorTowardsDestination.setMagnitude(EC_SPEED_DETERMINISTIC);
      ec.velocity.set(vectorTowardsDestination);
      ec.setPositionXY(ecPosition.x + ec.velocity.x * dt, ecPosition.y + ec.velocity.y * dt);
    }
  }
};

/**
 * helper function for getting the distance from the center of the provided bounds to the edge at the given angle
 * @param {Bounds2} bounds
 * @param {number} angle in radians
 * @returns {number}
 */
const getCenterToEdgeDistance = (bounds, angle) => {
  const halfWidth = bounds.width / 2;
  const halfHeight = bounds.height / 2;
  const tangentOfAngle = Math.tan(angle);
  let opposite;
  let adjacent;
  if (Math.abs(halfHeight / tangentOfAngle) < halfWidth) {
    opposite = halfHeight;
    adjacent = opposite / tangentOfAngle;
  } else {
    adjacent = halfWidth;
    opposite = halfWidth * tangentOfAngle;
  }
  return Math.sqrt(opposite * opposite + adjacent * adjacent);
};
energyFormsAndChanges.register('energyChunkDistributor', energyChunkDistributor);
export default energyChunkDistributor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiZG90UmFuZG9tIiwiVmVjdG9yMiIsImVuZXJneUZvcm1zQW5kQ2hhbmdlcyIsIkVGQUNRdWVyeVBhcmFtZXRlcnMiLCJPVVRTSURFX1NMSUNFX0ZPUkNFIiwiRU5FUkdZX0NIVU5LX1ZJRVdfVE9fTU9ERUxfV0lEVEgiLCJNQVhfVElNRV9TVEVQIiwiRU5FUkdZX0NIVU5LX01BU1MiLCJGTFVJRF9ERU5TSVRZIiwiRU5FUkdZX0NIVU5LX0RJQU1FVEVSIiwiRU5FUkdZX0NIVU5LX0NIQVJHRSIsIldBTExfQ0hBUkdFIiwiRU5FUkdZX0NIVU5LX0NST1NTX1NFQ1RJT05BTF9BUkVBIiwiTWF0aCIsIlBJIiwicG93IiwiRFJBR19DT0VGRklDSUVOVCIsIlJFRElTVFJJQlVUSU9OX1RIUkVTSE9MRF9FTkVSR1kiLCJNQVhfU0xJQ0VTIiwiTUFYX0VORVJHWV9DSFVOS1NfUEVSX1NMSUNFIiwiRUNfU1BFRURfREVURVJNSU5JU1RJQyIsIkNPVUxPTUJTX0NPTlNUQU5UIiwiRFJBR19NVUxUSVBMSUVSIiwiV0FMTF9SRVBVTFNJT05fRkFDVE9SIiwiRUNfUkVQVUxTSU9OX0ZBQ1RPUiIsImVuZXJneUNodW5rcyIsIkFycmF5IiwiZW5lcmd5Q2h1bmtGb3JjZXMiLCJfIiwidGltZXMiLCJzbGljZUluZGV4IiwiZWNJbmRleCIsInJldXNhYmxlRHJhZ0ZvcmNlVmVjdG9yIiwiY29tcG9zaXRlU2xpY2VCb3VuZHMiLCJOT1RISU5HIiwiY29weSIsImVuZXJneUNodW5rRGlzdHJpYnV0b3IiLCJ1cGRhdGVQb3NpdGlvbnNSZXB1bHNpdmUiLCJzbGljZXMiLCJkdCIsIm1pblgiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsIm1pblkiLCJtYXhYIiwiTkVHQVRJVkVfSU5GSU5JVFkiLCJtYXhZIiwiZm9yRWFjaCIsInNsaWNlIiwibWluIiwiYm91bmRzIiwibWF4Iiwic2V0TWluTWF4IiwidG90YWxOdW1FbmVyZ3lDaHVua3MiLCJsZW5ndGgiLCJhc3NlcnQiLCJlbmVyZ3lDaHVua0xpc3QiLCJnZXQiLCJwYXJ0aWNsZXNSZWRpc3RyaWJ1dGVkIiwibnVtYmVyT2ZVcGRhdGVTdGVwcyIsImZsb29yIiwiZXh0cmFUaW1lIiwiZm9yY2VDYWxjU3RlcCIsInRpbWVTdGVwIiwiY29udGFpbmVyU2hhcGVCb3VuZHMiLCJlYyIsInNldFhZIiwiY29udGFpbnNQb2ludCIsInBvc2l0aW9uUHJvcGVydHkiLCJ2YWx1ZSIsInVwZGF0ZUVkZ2VGb3JjZXMiLCJ1cGRhdGVFbmVyZ3lDaHVua0ZvcmNlcyIsInVwZGF0ZURyYWdGb3JjZSIsInZlbG9jaXR5IiwiY2VudGVyWCIsIngiLCJjZW50ZXJZIiwieSIsInNldE1hZ25pdHVkZSIsIm1heEVuZXJneSIsInVwZGF0ZVZlbG9jaXRpZXMiLCJ1cGRhdGVFbmVyZ3lDaHVua1Bvc2l0aW9ucyIsInBvc2l0aW9uIiwiZWNGb3JjZSIsImNvbnRhaW5lckJvdW5kcyIsIm1pbkRpc3RhbmNlIiwiZGlzdGFuY2VGcm9tUmlnaHRTaWRlIiwiZGlzdGFuY2VGcm9tQm90dG9tIiwiZGlzdGFuY2VGcm9tTGVmdFNpZGUiLCJkaXN0YW5jZUZyb21Ub3AiLCJhZGRYWSIsInZlbG9jaXR5TWFnbml0dWRlIiwibWFnbml0dWRlIiwidmVsb2NpdHlNYWduaXR1ZGVTcXVhcmVkIiwiSW5maW5pdHkiLCJpc05hTiIsImRyYWdGb3JjZU1hZ25pdHVkZSIsInZlY3RvckZyb21PdGhlciIsInBvb2wiLCJmZXRjaCIsImZvcmNlRnJvbU90aGVyIiwib3RoZXJFbmVyZ3lDaHVuayIsInJhbmRvbUFuZ2xlIiwibmV4dERvdWJsZSIsImNvcyIsInNpbiIsIm1hZ25pdHVkZVNxdWFyZWQiLCJmcmVlVG9Qb29sIiwiZW5lcmd5SW5Nb3N0RW5lcmdldGljRUMiLCJudW1iZXJPZkVuZXJneUNodW5rc0luU2xpY2UiLCJmb3JjZSIsImZvcmNlTXVsdGlwbGllciIsInRvdGFsUGFydGljbGVFbmVyZ3kiLCJ2Iiwic2V0UG9zaXRpb25YWSIsInVwZGF0ZVBvc2l0aW9uc1NwaXJhbCIsImVjTW92ZWQiLCJlY0Rlc3RpbmF0aW9uIiwic2xpY2VCb3VuZHMiLCJzbGljZUNlbnRlciIsImdldENlbnRlciIsIm51bWJlck9mVHVybnMiLCJtYXhBbmdsZSIsImEiLCJhbmd1bGFyU3BhbiIsIm9mZnNldEZhY3RvciIsInN0YXJ0QW5nbGUiLCJzcGlyYWxBbmdsZU9mZnNldCIsImFuZ2xlIiwibm9ybWFsaXplZFJhZGl1cyIsImFicyIsImFkanVzdGVkQW5nbGUiLCJtYXhSYWRpdXMiLCJnZXRDZW50ZXJUb0VkZ2VEaXN0YW5jZSIsInJhZGl1cyIsInNldFBvbGFyIiwiYWRkIiwiZXF1YWxzIiwibW92ZUVDVG93YXJkc0Rlc3RpbmF0aW9uIiwidXBkYXRlUG9zaXRpb25zU2ltcGxlIiwiZW5lcmd5Q2h1bmsiLCJzZXREaXN0cmlidXRpb25BbGdvcml0aG0iLCJhbGdvcml0aG1OYW1lIiwidXBkYXRlUG9zaXRpb25zIiwiZWNEaXN0cmlidXRpb24iLCJkZXN0aW5hdGlvbiIsImVjUG9zaXRpb24iLCJkaXN0YW5jZSIsInNldCIsInZlY3RvclRvd2FyZHNEZXN0aW5hdGlvbiIsIm1pbnVzIiwiaGFsZldpZHRoIiwid2lkdGgiLCJoYWxmSGVpZ2h0IiwiaGVpZ2h0IiwidGFuZ2VudE9mQW5nbGUiLCJ0YW4iLCJvcHBvc2l0ZSIsImFkamFjZW50Iiwic3FydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiZW5lcmd5Q2h1bmtEaXN0cmlidXRvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIHN0YXRpYyBvYmplY3QgdGhhdCBjb250YWlucyBtZXRob2RzIGZvciByZWRpc3RyaWJ1dGluZyBhIHNldCBvZiBlbmVyZ3kgY2h1bmtzIHdpdGhpbiBhIHNoYXBlIGluIG9yZGVyIHRvIG1ha2UgdGhlbVxyXG4gKiBzcHJlYWQgb3V0IGZhaXJseSBldmVubHkgaW4gYSB3YXkgdGhhdCBsb29rcyBkeW5hbWljIGFuZCByZWFsaXN0aWMuICBUaGUgYmFzaWMgYXBwcm9hY2ggaXMgdG8gc2ltdWxhdGUgYSBzZXQgb2ZcclxuICogc21hbGwgc3BoZXJlcyBlbWJlZGRlZCBpbiBhIGZsdWlkLCBhbmQgZWFjaCBvbmUgaXMgY2hhbmdlcyBzdWNoIHRoYXQgaXQgcmVwZWxzIGFsbCBvdGhlcnMgYXMgd2VsbCBhcyB0aGUgZWRnZXMgb2YgdGhlXHJcbiAqIGNvbnRhaW5lcihzKS4gIFRoZSByZXB1bHNpb24gYWxnb3JpdGhtIGlzIGJhc2VkIG9uIENvdWxvbWIncyBsYXcuXHJcbiAqXHJcbiAqIFJldXNlIE5vdGVzOiBUaGlzIGNvdWxkIHByb2JhYmx5IGJlIGdlbmVyYWxpemVkIGZhaXJseSBlYXNpbHkgdG8gZGlzdHJpYnV0ZSBhbnkgbnVtYmVyIGl0ZW1zIHdpdGhpbiBhIGNvbnRhaW5lciBvZlxyXG4gKiBhcmJpdHJhcnkgc2l6ZS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIGZyb20gJy4uLy4uL2VuZXJneUZvcm1zQW5kQ2hhbmdlcy5qcyc7XHJcbmltcG9ydCBFRkFDUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uL0VGQUNRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE9VVFNJREVfU0xJQ0VfRk9SQ0UgPSAwLjAxOyAvLyBJbiBOZXd0b25zLCBlbXBpcmljYWxseSBkZXRlcm1pbmVkLlxyXG5cclxuLy8gd2lkdGggb2YgYW4gZW5lcmd5IGNodW5rIGluIHRoZSB2aWV3LCB1c2VkIHRvIGtlZXAgdGhlbSBpbiBib3VuZHNcclxuY29uc3QgRU5FUkdZX0NIVU5LX1ZJRVdfVE9fTU9ERUxfV0lEVEggPSAwLjAxMjtcclxuXHJcbi8vIHBhcmFtZXRlcnMgdGhhdCBjYW4gYmUgYWRqdXN0ZWQgdG8gY2hhbmdlIHRoZSBuYXR1cmUgb2YgdGhlIHJlcHVsc2l2ZSByZWRpc3RyaWJ1dGlvbiBhbGdvcml0aG1cclxuY29uc3QgTUFYX1RJTUVfU1RFUCA9ICggMSAvIDYwICkgLyAzOyAvLyBpbiBzZWNvbmRzLCBmb3IgYWxnb3JpdGhtIHRoYXQgbW92ZXMgdGhlIHBvaW50cywgYmVzdCBpZiBhIG11bHRpcGxlIG9mIG5vbWluYWwgZnJhbWUgcmF0ZVxyXG5jb25zdCBFTkVSR1lfQ0hVTktfTUFTUyA9IDAuMDAwMzU7IC8vIGluIGtpbG9ncmFtcywgbWFzcyBvZiBhIGJiLCB3aGljaCBzZWVtcyBhYm91dCByaWdodFxyXG5jb25zdCBGTFVJRF9ERU5TSVRZID0gODAwMDsgLy8gaW4ga2cgLyBtIF4gMyAtIGZvciByZWZlcmVuY2UsIHdhdGVyIGlzIDEwMDAsIG1vbHRlbiBsZWFkIGlzIGFyb3VuZCAxMDAwMFxyXG5jb25zdCBFTkVSR1lfQ0hVTktfRElBTUVURVIgPSAwLjAwNDQ7IC8vIGluIG1ldGVycywgdGhpcyBpcyB0aGUgZGlhbWV0ZXIgb2YgYSBiYiwgd2hpY2ggc2VlbXMgYWJvdXQgcmlnaHRcclxuXHJcbi8vIGNoYXJnZSBvZiBhbiBlbmVyZ3kgY2h1bmsgaW4gQ291bG9tYnMsIGFib3V0IDEvMTAwdGggb2Ygd2hhdCBhIGNoYXJnZWQgYmFsbG9vbiB3b3VsZCBiZVxyXG5jb25zdCBFTkVSR1lfQ0hVTktfQ0hBUkdFID0gMUUtOTtcclxuXHJcbi8vIGNoYXJnZSBvZiB0aGUgd2FsbCwgdXNlZCB0byBjYWxjdWxhdGUgcmVwdWxzaW9uIG9mIGVuZXJneSBjaHVua3NcclxuY29uc3QgV0FMTF9DSEFSR0UgPSBFTkVSR1lfQ0hVTktfQ0hBUkdFO1xyXG5cclxuLy8gZm9yIGRyYWcsIHRyZWF0IGVuZXJneSBjaHVuayBhcyBpZiBpdCBpcyBzaGFwZWQgbGlrZSBhIHNwaGVyZVxyXG5jb25zdCBFTkVSR1lfQ0hVTktfQ1JPU1NfU0VDVElPTkFMX0FSRUEgPSBNYXRoLlBJICogTWF0aC5wb3coIEVORVJHWV9DSFVOS19ESUFNRVRFUiwgMiApO1xyXG5jb25zdCBEUkFHX0NPRUZGSUNJRU5UID0gMC40ODsgLy8gdW5pdGxlc3MsIHRoaXMgaXMgd2hhdCBXaWtpcGVkaWEgc2F5cyBpcyB0aGUgdmFsdWUgZm9yIGEgcm91Z2ggc3BoZXJlXHJcblxyXG4vLyBUaHJlc2hvbGQgZm9yIGRlY2lkaW5nIHdoZXRoZXIgb3Igbm90IHRvIHBlcmZvcm0gcmVkaXN0cmlidXRpb24uIExvd2VyIHZhbHVlcyBmaW5pc2ggdGhlIHJlZGlzdHJpYnV0aW9uIG1vcmVcclxuLy8gcXVpY2tseSBidXQgbm90IGFzIHRob3JvdWdobHksIGhpZ2hlciB2YWx1ZXMgYXJlIHRob3JvdWdoIGJ1dCBtb3JlIGNvbXB1dGF0aW9uYWxseSBpbnRlbnNpdmUuICBUaGUgdmFsdWUgaGVyZSB3YXNcclxuLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byB3b3JrIHdlbGwgZm9yIHRoZSBFRkFDIHNpbS5cclxuY29uc3QgUkVESVNUUklCVVRJT05fVEhSRVNIT0xEX0VORVJHWSA9IDNFLTY7IC8vIGluIGpvdWxlcyAoSSB0aGluaylcclxuXHJcbi8vIG1heCBudW1iZXIgb2YgZW5lcmd5IGNodW5rIHNsaWNlcyB0aGF0IGNhbiBiZSBoYW5kbGVkIHBlciBjYWxsIHRvIHVwZGF0ZSBwb3NpdGlvbnMsIGFkanVzdCBhcyBuZWVkZWRcclxuY29uc3QgTUFYX1NMSUNFUyA9IDY7XHJcblxyXG4vLyBtYXggbnVtYmVyIG9mIGVuZXJneSBjaHVua3MgcGVyIHNsaWNlIHRoYXQgY2FuIGJlIHJlZGlzdHJpYnV0ZWQgcGVyIGNhbGwsIGFkanVzdCBhcyBuZWVkZWRcclxuY29uc3QgTUFYX0VORVJHWV9DSFVOS1NfUEVSX1NMSUNFID0gMjU7XHJcblxyXG4vLyBzcGVlZCB1c2VkIHdoZW4gcG9zaXRpb25pbmcgRUNzIHVzaW5nIGRldGVybWluaXN0aWMgYWxnb3JpdGhtcywgaW4gbWV0ZXJzIHBlciBzZWNvbmRcclxuY29uc3QgRUNfU1BFRURfREVURVJNSU5JU1RJQyA9IDAuMTtcclxuXHJcbi8vIENvdWxvbWIncyBjb25zdGFudCwgdXNlZCB0byBjYWxjdWxhdGUgcmVwdWxzaXZlIGZvcmNlcywgZnJvbSBXaWtpcGVkaWFcclxuY29uc3QgQ09VTE9NQlNfQ09OU1RBTlQgPSA5RTk7XHJcblxyXG4vLyBwcmUtY2FsY3VsYXRlZCBmYWN0b3JzIGJhc2VkIG9uIHRoZSBhYm92ZSB2YWx1ZXMsIHVzZWQgdG8gc2F2ZSB0aW1lIGluIHRoZSBjb21wdXRhdGlvbnMgYmVsb3dcclxuY29uc3QgRFJBR19NVUxUSVBMSUVSID0gMC41ICogRkxVSURfREVOU0lUWSAqIERSQUdfQ09FRkZJQ0lFTlQgKiBFTkVSR1lfQ0hVTktfQ1JPU1NfU0VDVElPTkFMX0FSRUE7XHJcbmNvbnN0IFdBTExfUkVQVUxTSU9OX0ZBQ1RPUiA9IC1DT1VMT01CU19DT05TVEFOVCAqIEVORVJHWV9DSFVOS19DSEFSR0UgKiBXQUxMX0NIQVJHRTsgLy8gYmFzZWQgb24gQ291bG9tYidzIGxhd1xyXG5jb25zdCBFQ19SRVBVTFNJT05fRkFDVE9SID0gLUNPVUxPTUJTX0NPTlNUQU5UICogRU5FUkdZX0NIVU5LX0NIQVJHRSAqIEVORVJHWV9DSFVOS19DSEFSR0U7IC8vIGJhc2VkIG9uIENvdWxvbWIncyBsYXdcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyByZXVzYWJsZSB2YXJpYWJsZXMgYW5kIGFycmF5IGludGVuZGVkIHRvIHJlZHVjZSBnYXJiYWdlIGNvbGxlY3Rpb24gYW5kIHRodXMgaW1wcm92ZSBwZXJmb3JtYW5jZVxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8vIGEgcmV1c2FibGUgMkQgYXJyYXkgb2YgdGhlIGVuZXJneSBjaHVua3MgYmVpbmcgcmVkaXN0cmlidXRlZCwgaW5kZXhlZCBieSBbc2xpY2VOdW1dW2VjTnVtXVxyXG5jb25zdCBlbmVyZ3lDaHVua3MgPSBuZXcgQXJyYXkoIE1BWF9TTElDRVMgKTtcclxuXHJcbi8vIGEgcmV1c2FibGUgMkQgYXJyYXkgb2YgdGhlIGZvcmNlIHZlY3RvcnMgZm9yIHRoZSBlbmVyZ3kgY2h1bmtzLCBpbmRleGVkIGJ5IFtzbGljZU51bV1bZWNOdW1dXHJcbmNvbnN0IGVuZXJneUNodW5rRm9yY2VzID0gbmV3IEFycmF5KCBNQVhfU0xJQ0VTICk7XHJcblxyXG4vLyBpbml0aWFsaXplIHRoZSByZXVzYWJsZSBhcnJheXNcclxuXy50aW1lcyggTUFYX1NMSUNFUywgc2xpY2VJbmRleCA9PiB7XHJcbiAgZW5lcmd5Q2h1bmtzWyBzbGljZUluZGV4IF0gPSBuZXcgQXJyYXkoIE1BWF9FTkVSR1lfQ0hVTktTX1BFUl9TTElDRSApO1xyXG4gIGVuZXJneUNodW5rRm9yY2VzWyBzbGljZUluZGV4IF0gPSBuZXcgQXJyYXkoIE1BWF9FTkVSR1lfQ0hVTktTX1BFUl9TTElDRSApO1xyXG4gIF8udGltZXMoIE1BWF9FTkVSR1lfQ0hVTktTX1BFUl9TTElDRSwgZWNJbmRleCA9PiB7XHJcbiAgICBlbmVyZ3lDaHVua0ZvcmNlc1sgc2xpY2VJbmRleCBdWyBlY0luZGV4IF0gPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gIH0gKTtcclxufSApO1xyXG5cclxuLy8gYSByZXVzYWJsZSB2ZWN0b3IgZm9yIGNhbGN1bGF0aW5nIGRyYWcgZm9yY2VcclxuY29uc3QgcmV1c2FibGVEcmFnRm9yY2VWZWN0b3IgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG5cclxuY29uc3QgY29tcG9zaXRlU2xpY2VCb3VuZHMgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpO1xyXG5cclxuLy8gdGhlIG1haW4gc2luZ2xldG9uIG9iamVjdCBkZWZpbml0aW9uXHJcbmNvbnN0IGVuZXJneUNodW5rRGlzdHJpYnV0b3IgPSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlZGlzdHJpYnV0ZSBhIHNldCBvZiBlbmVyZ3kgY2h1bmtzIHRoYXQgYXJlIGNvbnRhaW5lZCBpbiBlbmVyZ3kgY2h1bmsgc2xpY2VzIHVzaW5nIGFuIGFsZ29yaXRobSB3aGVyZSB0aGVcclxuICAgKiBjaHVua3MgYXJlIHJlcGVsbGVkIGJ5IGVhY2ggb3RoZXIgYW5kIGJ5IHRoZSBlZGdlcyBvZiB0aGUgc2xpY2UuICBUaGUgZGlzdHJpYnV0aW9uIGlzIGRvbmUgdGFraW5nIGFsbCBuZWFyYnlcclxuICAgKiBzbGljZXMgaW50byBhY2NvdW50IHNvIHRoYXQgdGhlIGNodW5rcyBjYW4gYmUgZGlzdHJpYnV0ZWQgaW4gYSB3YXkgdGhhdCBtaW5pbWl6ZXMgb3ZlcmxhcC5cclxuICAgKiBAcGFyYW0ge0VuZXJneUNodW5rQ29udGFpbmVyU2xpY2VbXX0gc2xpY2VzIC0gc2V0IG9mIHNsaWNlcyB0aGF0IGNvbnRhaW4gZW5lcmd5IGNodW5rc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIGNoYW5nZSBpbiB0aW1lXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gYSB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgcmVkaXN0cmlidXRpb24gd2FzIGRvbmUsIGZhbHNlIGNhbiBvY2N1ciBpZiB0aGUgZW5lcmd5IGNodW5rcyBhcmVcclxuICAgKiBhbHJlYWR5IHdlbGwgZGlzdHJpYnV0ZWRcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZVBvc2l0aW9uc1JlcHVsc2l2ZSggc2xpY2VzLCBkdCApIHtcclxuXHJcbiAgICAvLyBkZXRlcm1pbmUgYSByZWN0YW5nbGUgdGhhdCBib3VuZHMgYWxsIG9mIHRoZSBzbGljZXNcclxuICAgIGxldCBtaW5YID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgbGV0IG1pblkgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICBsZXQgbWF4WCA9IE51bWJlci5ORUdBVElWRV9JTkZJTklUWTtcclxuICAgIGxldCBtYXhZID0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZO1xyXG5cclxuICAgIC8vIGRldGVybWluZSB0aGUgY29sbGVjdGl2ZSBib3VuZHMgb2YgYWxsIHRoZSBzbGljZXNcclxuICAgIHNsaWNlcy5mb3JFYWNoKCBzbGljZSA9PiB7XHJcbiAgICAgIG1pblggPSBNYXRoLm1pbiggc2xpY2UuYm91bmRzLm1pblgsIG1pblggKTtcclxuICAgICAgbWF4WCA9IE1hdGgubWF4KCBzbGljZS5ib3VuZHMubWF4WCwgbWF4WCApO1xyXG4gICAgICBtaW5ZID0gTWF0aC5taW4oIHNsaWNlLmJvdW5kcy5taW5ZLCBtaW5ZICk7XHJcbiAgICAgIG1heFkgPSBNYXRoLm1heCggc2xpY2UuYm91bmRzLm1heFksIG1heFkgKTtcclxuICAgIH0gKTtcclxuICAgIGNvbXBvc2l0ZVNsaWNlQm91bmRzLnNldE1pbk1heCggbWluWCwgbWluWSwgbWF4WCwgbWF4WSApO1xyXG5cclxuICAgIC8vIHJldXNhYmxlIGl0ZXJhdG9yIHZhbHVlcyBhbmQgbG9vcCB2YXJpYWJsZXNcclxuICAgIGxldCBzbGljZUluZGV4O1xyXG4gICAgbGV0IGVjSW5kZXg7XHJcbiAgICBsZXQgc2xpY2U7XHJcblxyXG4gICAgLy8gaW5pdGlhbGl6ZSB0aGUgbGlzdCBvZiBlbmVyZ3kgY2h1bmtzIGFuZCBmb3JjZXMgYWN0aW5nIHVwb24gdGhlbVxyXG4gICAgbGV0IHRvdGFsTnVtRW5lcmd5Q2h1bmtzID0gMDtcclxuICAgIGZvciAoIHNsaWNlSW5kZXggPSAwOyBzbGljZUluZGV4IDwgc2xpY2VzLmxlbmd0aDsgc2xpY2VJbmRleCsrICkge1xyXG5cclxuICAgICAgc2xpY2UgPSBzbGljZXNbIHNsaWNlSW5kZXggXTtcclxuXHJcbiAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgcHJlLWFsbG9jYXRlZCBhcnJheXMgZm9yIGVuZXJneSBjaHVua3MgYW5kIHRoZWlyIGZvcmNlcyBhcmUgYmlnIGVub3VnaFxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgICAgIHNsaWNlLmVuZXJneUNodW5rTGlzdC5sZW5ndGggPD0gTUFYX0VORVJHWV9DSFVOS1NfUEVSX1NMSUNFLFxyXG4gICAgICAgICdwcmUtYWxsb2NhdGVkIGFycmF5IHRvbyBzbWFsbCwgcGxlYXNlIGFkanVzdCdcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIHB1dCBlYWNoIGVuZXJneSBjaHVuayBvbiB0aGUgbGlzdCBvZiB0aG9zZSB0byBiZSBwcm9jZXNzZWRcclxuICAgICAgZm9yICggZWNJbmRleCA9IDA7IGVjSW5kZXggPCBzbGljZXNbIHNsaWNlSW5kZXggXS5lbmVyZ3lDaHVua0xpc3QubGVuZ3RoOyBlY0luZGV4KysgKSB7XHJcbiAgICAgICAgZW5lcmd5Q2h1bmtzWyBzbGljZUluZGV4IF1bIGVjSW5kZXggXSA9IHNsaWNlc1sgc2xpY2VJbmRleCBdLmVuZXJneUNodW5rTGlzdC5nZXQoIGVjSW5kZXggKTtcclxuICAgICAgICB0b3RhbE51bUVuZXJneUNodW5rcysrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbWFrZSBzdXJlIHRoYXQgdGhlcmUgaXMgYWN0dWFsbHkgc29tZXRoaW5nIHRvIGRpc3RyaWJ1dGVcclxuICAgIGlmICggdG90YWxOdW1FbmVyZ3lDaHVua3MgPT09IDAgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTsgLy8gbm90aGluZyB0byBkbyAtIGJhaWwgb3V0XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGl2aWRlIHRoZSB0aW1lIHN0ZXAgdXAgaW50byB0aGUgbGFyZ2VzdCB2YWx1ZSBrbm93biB0byB3b3JrIGNvbnNpc3RlbnRseSBmb3IgdGhlIGFsZ29yaXRobVxyXG4gICAgbGV0IHBhcnRpY2xlc1JlZGlzdHJpYnV0ZWQgPSBmYWxzZTtcclxuICAgIGNvbnN0IG51bWJlck9mVXBkYXRlU3RlcHMgPSBNYXRoLmZsb29yKCBkdCAvIE1BWF9USU1FX1NURVAgKTtcclxuICAgIGNvbnN0IGV4dHJhVGltZSA9IGR0IC0gbnVtYmVyT2ZVcGRhdGVTdGVwcyAqIE1BWF9USU1FX1NURVA7XHJcbiAgICBmb3IgKCBsZXQgZm9yY2VDYWxjU3RlcCA9IDA7IGZvcmNlQ2FsY1N0ZXAgPD0gbnVtYmVyT2ZVcGRhdGVTdGVwczsgZm9yY2VDYWxjU3RlcCsrICkge1xyXG4gICAgICBjb25zdCB0aW1lU3RlcCA9IGZvcmNlQ2FsY1N0ZXAgPCBudW1iZXJPZlVwZGF0ZVN0ZXBzID8gTUFYX1RJTUVfU1RFUCA6IGV4dHJhVGltZTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGltZVN0ZXAgPD0gTUFYX1RJTUVfU1RFUCApO1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHRoZSBmb3JjZXMgYWN0aW5nIG9uIHRoZSBlbmVyZ3kgY2h1bmsgZHVlIHRvIGl0cyBib3VuZGluZyBjb250YWluZXIsIG90aGVyIGVuZXJneSBjaHVua3MsIGFuZCBkcmFnXHJcbiAgICAgIGZvciAoIHNsaWNlSW5kZXggPSAwOyBzbGljZUluZGV4IDwgc2xpY2VzLmxlbmd0aDsgc2xpY2VJbmRleCsrICkge1xyXG4gICAgICAgIHNsaWNlID0gc2xpY2VzWyBzbGljZUluZGV4IF07XHJcbiAgICAgICAgY29uc3QgY29udGFpbmVyU2hhcGVCb3VuZHMgPSBzbGljZS5ib3VuZHM7XHJcblxyXG4gICAgICAgIC8vIGRldGVybWluZSBmb3JjZXMgb24gZWFjaCBlbmVyZ3kgY2h1bmtcclxuICAgICAgICBmb3IgKCBlY0luZGV4ID0gMDsgZWNJbmRleCA8IHNsaWNlLmVuZXJneUNodW5rTGlzdC5sZW5ndGg7IGVjSW5kZXgrKyApIHtcclxuICAgICAgICAgIGNvbnN0IGVjID0gZW5lcmd5Q2h1bmtzWyBzbGljZUluZGV4IF1bIGVjSW5kZXggXTtcclxuICAgICAgICAgIGVuZXJneUNodW5rRm9yY2VzWyBzbGljZUluZGV4IF1bIGVjSW5kZXggXS5zZXRYWSggMCwgMCApO1xyXG4gICAgICAgICAgaWYgKCBjb250YWluZXJTaGFwZUJvdW5kcy5jb250YWluc1BvaW50KCBlYy5wb3NpdGlvblByb3BlcnR5LnZhbHVlICkgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBjb21wdXRlIGZvcmNlcyBmcm9tIHRoZSBlZGdlcyBvZiB0aGUgc2xpY2UgYm91bmRhcnlcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVFZGdlRm9yY2VzKFxyXG4gICAgICAgICAgICAgIGVjLnBvc2l0aW9uUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgICAgICAgZW5lcmd5Q2h1bmtGb3JjZXNbIHNsaWNlSW5kZXggXVsgZWNJbmRleCBdLFxyXG4gICAgICAgICAgICAgIGNvbnRhaW5lclNoYXBlQm91bmRzXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBjb21wdXRlIGZvcmNlcyBmcm9tIG90aGVyIGVuZXJneSBjaHVua3NcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVFbmVyZ3lDaHVua0ZvcmNlcyhcclxuICAgICAgICAgICAgICBlYyxcclxuICAgICAgICAgICAgICBlbmVyZ3lDaHVua0ZvcmNlc1sgc2xpY2VJbmRleCBdWyBlY0luZGV4IF0sXHJcbiAgICAgICAgICAgICAgZW5lcmd5Q2h1bmtzLFxyXG4gICAgICAgICAgICAgIHNsaWNlc1xyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gdXBkYXRlIGRyYWcgZm9yY2VcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVEcmFnRm9yY2UoIGVjLnZlbG9jaXR5LCBlbmVyZ3lDaHVua0ZvcmNlc1sgc2xpY2VJbmRleCBdWyBlY0luZGV4IF0sIHRpbWVTdGVwICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHBvaW50IGlzIG91dHNpZGUgY29udGFpbmVyLCBtb3ZlIGl0IHRvd2FyZHMgY2VudGVyIG9mIHNoYXBlXHJcbiAgICAgICAgICAgIGVuZXJneUNodW5rRm9yY2VzWyBzbGljZUluZGV4IF1bIGVjSW5kZXggXS5zZXRYWShcclxuICAgICAgICAgICAgICBjb250YWluZXJTaGFwZUJvdW5kcy5jZW50ZXJYIC0gZWMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54LFxyXG4gICAgICAgICAgICAgIGNvbnRhaW5lclNoYXBlQm91bmRzLmNlbnRlclkgLSBlYy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnlcclxuICAgICAgICAgICAgKS5zZXRNYWduaXR1ZGUoIE9VVFNJREVfU0xJQ0VfRk9SQ0UgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IG1heEVuZXJneSA9IHRoaXMudXBkYXRlVmVsb2NpdGllcyggc2xpY2VzLCBlbmVyZ3lDaHVua3MsIGVuZXJneUNodW5rRm9yY2VzLCB0aW1lU3RlcCApO1xyXG5cclxuICAgICAgcGFydGljbGVzUmVkaXN0cmlidXRlZCA9IG1heEVuZXJneSA+IFJFRElTVFJJQlVUSU9OX1RIUkVTSE9MRF9FTkVSR1k7XHJcblxyXG4gICAgICBpZiAoIHBhcnRpY2xlc1JlZGlzdHJpYnV0ZWQgKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVFbmVyZ3lDaHVua1Bvc2l0aW9ucyggc2xpY2VzLCB0aW1lU3RlcCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBhcnRpY2xlc1JlZGlzdHJpYnV0ZWQ7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogY29tcHV0ZSB0aGUgZm9yY2Ugb24gYW4gZW5lcmd5IGNodW5rIGJhc2VkIG9uIHRoZSBlZGdlcyBvZiB0aGUgY29udGFpbmVyIGluIHdoaWNoIGl0IHJlc2lkZXNcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBlY0ZvcmNlXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBjb250YWluZXJCb3VuZHNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZUVkZ2VGb3JjZXM6IGZ1bmN0aW9uKCBwb3NpdGlvbiwgZWNGb3JjZSwgY29udGFpbmVyQm91bmRzICkge1xyXG5cclxuICAgIC8vIHRoaXMgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGZvciBjaHVua3MgdGhhdCBhcmUgaW5zaWRlIGEgY29udGFpbmVyXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb250YWluZXJCb3VuZHMuY29udGFpbnNQb2ludCggcG9zaXRpb24gKSApO1xyXG5cclxuICAgIC8vIHRoZSBtaW5pbXVtIGRpc3RhbmNlIGZyb20gdGhlIHdhbGwgaXMgb25lIEVDIHJhZGl1c1xyXG4gICAgY29uc3QgbWluRGlzdGFuY2UgPSBFTkVSR1lfQ0hVTktfRElBTUVURVIgLyAyO1xyXG5cclxuICAgIC8vIGdldCB0aGUgZGlzdGFuY2UgdG8gdGhlIGZvdXIgZGlmZmVyZW50IGVkZ2VzXHJcbiAgICBjb25zdCBkaXN0YW5jZUZyb21SaWdodFNpZGUgPSBNYXRoLm1heCggY29udGFpbmVyQm91bmRzLm1heFggLSBwb3NpdGlvbi54LCBtaW5EaXN0YW5jZSApO1xyXG4gICAgY29uc3QgZGlzdGFuY2VGcm9tQm90dG9tID0gTWF0aC5tYXgoIHBvc2l0aW9uLnkgLSBjb250YWluZXJCb3VuZHMubWluWSwgbWluRGlzdGFuY2UgKTtcclxuICAgIGNvbnN0IGRpc3RhbmNlRnJvbUxlZnRTaWRlID0gTWF0aC5tYXgoIHBvc2l0aW9uLnggLSBjb250YWluZXJCb3VuZHMubWluWCwgbWluRGlzdGFuY2UgKTtcclxuICAgIGNvbnN0IGRpc3RhbmNlRnJvbVRvcCA9IE1hdGgubWF4KCBjb250YWluZXJCb3VuZHMubWF4WSAtIHBvc2l0aW9uLnksIG1pbkRpc3RhbmNlICk7XHJcblxyXG4gICAgLy8gYXBwbHkgdGhlIGZvcmNlc1xyXG4gICAgZWNGb3JjZS5hZGRYWSggV0FMTF9SRVBVTFNJT05fRkFDVE9SIC8gTWF0aC5wb3coIGRpc3RhbmNlRnJvbVJpZ2h0U2lkZSwgMiApLCAwICk7IC8vIGZvcmNlIGZyb20gcmlnaHQgZWRnZVxyXG4gICAgZWNGb3JjZS5hZGRYWSggMCwgLVdBTExfUkVQVUxTSU9OX0ZBQ1RPUiAvIE1hdGgucG93KCBkaXN0YW5jZUZyb21Cb3R0b20sIDIgKSApOyAvLyBmb3JjZSBmcm9tIGJvdHRvbSBlZGdlXHJcbiAgICBlY0ZvcmNlLmFkZFhZKCAtV0FMTF9SRVBVTFNJT05fRkFDVE9SIC8gTWF0aC5wb3coIGRpc3RhbmNlRnJvbUxlZnRTaWRlLCAyICksIDAgKTsgLy8gZm9yY2UgZnJvbSBsZWZ0IGVkZ2VcclxuICAgIGVjRm9yY2UuYWRkWFkoIDAsIFdBTExfUkVQVUxTSU9OX0ZBQ1RPUiAvIE1hdGgucG93KCBkaXN0YW5jZUZyb21Ub3AsIDIgKSApOyAvLyBmb3JjZSBmcm9tIHRvcCBlZGdlXHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogY29tcHV0ZSB0aGUgZm9yY2Ugb24gYW4gZW5lcmd5IGNodW5rIGJhc2VkIG9uIHRoZSBkcmFnIHRoYXQgaXQgaXMgZXhwZXJpZW5jaW5nXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSB2ZWxvY2l0eVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gZWNGb3JjZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lU3RlcCAtIGxlbmd0aCBvZiB0aW1lIHN0ZXAsIGluIHNlY29uZHNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZURyYWdGb3JjZTogZnVuY3Rpb24oIHZlbG9jaXR5LCBlY0ZvcmNlLCB0aW1lU3RlcCApIHtcclxuXHJcbiAgICBjb25zdCB2ZWxvY2l0eU1hZ25pdHVkZSA9IHZlbG9jaXR5Lm1hZ25pdHVkZTtcclxuICAgIGNvbnN0IHZlbG9jaXR5TWFnbml0dWRlU3F1YXJlZCA9IE1hdGgucG93KCB2ZWxvY2l0eU1hZ25pdHVkZSwgMiApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgIHZlbG9jaXR5TWFnbml0dWRlU3F1YXJlZCAhPT0gSW5maW5pdHkgJiYgIV8uaXNOYU4oIHZlbG9jaXR5TWFnbml0dWRlU3F1YXJlZCApICYmIHR5cGVvZiB2ZWxvY2l0eU1hZ25pdHVkZVNxdWFyZWQgPT09ICdudW1iZXInLFxyXG4gICAgICBgdmVsb2NpdHleMiBpcyAke3ZlbG9jaXR5TWFnbml0dWRlU3F1YXJlZH1gXHJcbiAgICApO1xyXG5cclxuICAgIC8vIGNhbGN1bGF0ZSB0aGUgZHJhZyBiYXNlZCBvbiB0aGUgdmVsb2NpdHkgYW5kIHRoZSBuYXR1cmUgb2YgdGhlIGZsdWlkIHRoYXQgaXQncyBpbiwgc2VlXHJcbiAgICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9EcmFnX2VxdWF0aW9uXHJcbiAgICBsZXQgZHJhZ0ZvcmNlTWFnbml0dWRlID0gRFJBR19NVUxUSVBMSUVSICogdmVsb2NpdHlNYWduaXR1ZGVTcXVhcmVkO1xyXG4gICAgaWYgKCBkcmFnRm9yY2VNYWduaXR1ZGUgPiAwICkge1xyXG5cclxuICAgICAgLy8gbGltaXQgdGhlIGRyYWcgZm9yY2UgdmVjdG9yIHN1Y2ggdGhhdCBpdCBjYW4ndCByZXZlcnNlIHRoZSBjdXJyZW50IHZlbG9jaXR5LCBzaW5jZSB0aGF0IGlzIHVucGh5c2ljYWxcclxuICAgICAgaWYgKCBkcmFnRm9yY2VNYWduaXR1ZGUgLyBFTkVSR1lfQ0hVTktfTUFTUyAqIHRpbWVTdGVwID4gdmVsb2NpdHlNYWduaXR1ZGUgKSB7XHJcbiAgICAgICAgZHJhZ0ZvcmNlTWFnbml0dWRlID0gdmVsb2NpdHlNYWduaXR1ZGUgKiBFTkVSR1lfQ0hVTktfTUFTUyAvIHRpbWVTdGVwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBjYWxjdWxhdGUgdGhlIGRyYWcgZm9yY2UgdmVjdG9yXHJcbiAgICAgIHJldXNhYmxlRHJhZ0ZvcmNlVmVjdG9yLnNldFhZKCAtdmVsb2NpdHkueCwgLXZlbG9jaXR5LnkgKTtcclxuICAgICAgcmV1c2FibGVEcmFnRm9yY2VWZWN0b3Iuc2V0TWFnbml0dWRlKCBkcmFnRm9yY2VNYWduaXR1ZGUgKTtcclxuXHJcbiAgICAgIC8vIGFkZCB0aGUgZHJhZyBmb3JjZSB0byB0aGUgdG90YWwgZm9yY2UgYWN0aW5nIG9uIHRoaXMgZW5lcmd5IGNodW5rXHJcbiAgICAgIGVjRm9yY2UuYWRkWFkoIHJldXNhYmxlRHJhZ0ZvcmNlVmVjdG9yLngsIHJldXNhYmxlRHJhZ0ZvcmNlVmVjdG9yLnkgKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiB1cGRhdGUgdGhlIGZvcmNlcyBhY3Rpbmcgb24gdGhlIHByb3ZpZGVkIGVuZXJneSBjaHVuayBkdWUgdG8gYWxsIHRoZSBvdGhlciBlbmVyZ3kgY2h1bmtzXHJcbiAgICogQHBhcmFtIHtFbmVyZ3lDaHVua30gZWNcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGVjRm9yY2UgLSB0aGUgZm9yY2UgdmVjdG9yIGFjdGluZyBvbiB0aGUgZW5lcmd5IGNodW5rIGJlaW5nIGV2YWx1YXRlZFxyXG4gICAqIEBwYXJhbSB7RW5lcmd5Q2h1bmtbXX0gZW5lcmd5Q2h1bmtzXHJcbiAgICogQHBhcmFtIHtFbmVyZ3lDaHVua0NvbnRhaW5lclNsaWNlW119IHNsaWNlc1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlRW5lcmd5Q2h1bmtGb3JjZXM6IGZ1bmN0aW9uKCBlYywgZWNGb3JjZSwgZW5lcmd5Q2h1bmtzLCBzbGljZXMgKSB7XHJcblxyXG4gICAgLy8gYWxsb2NhdGUgcmV1c2FibGUgdmVjdG9ycyB0byBpbXByb3ZlIHBlcmZvcm1hbmNlXHJcbiAgICBsZXQgdmVjdG9yRnJvbU90aGVyID0gVmVjdG9yMi5wb29sLmZldGNoKCk7XHJcbiAgICBjb25zdCBmb3JjZUZyb21PdGhlciA9IFZlY3RvcjIucG9vbC5mZXRjaCgpO1xyXG5cclxuICAgIC8vIHRoZSBtaW5pbXVtIGRpc3RhbmNlIGJldHdlZW4gdHdvIGNodW5rcyBpcyAyIHRpbWVzIHRoZSByYWRpdXMgb2YgZWFjaCwgb3IgMXggdGhlIGRpYW1ldGVyXHJcbiAgICBjb25zdCBtaW5EaXN0YW5jZSA9IEVORVJHWV9DSFVOS19ESUFNRVRFUiAvIDI7XHJcblxyXG4gICAgLy8gYXBwbHkgdGhlIGZvcmNlIGZyb20gZWFjaCBvZiB0aGUgb3RoZXIgZW5lcmd5IGNodW5rcywgYnV0IHNldCBzb21lIGxpbWl0cyBvbiB0aGUgbWF4IGZvcmNlIHRoYXQgY2FuIGJlIGFwcGxpZWRcclxuICAgIGZvciAoIGxldCBzbGljZUluZGV4ID0gMDsgc2xpY2VJbmRleCA8IHNsaWNlcy5sZW5ndGg7IHNsaWNlSW5kZXgrKyApIHtcclxuICAgICAgZm9yICggbGV0IGVjSW5kZXggPSAwOyBlY0luZGV4IDwgc2xpY2VzWyBzbGljZUluZGV4IF0uZW5lcmd5Q2h1bmtMaXN0Lmxlbmd0aDsgZWNJbmRleCsrICkge1xyXG5cclxuICAgICAgICBjb25zdCBvdGhlckVuZXJneUNodW5rID0gZW5lcmd5Q2h1bmtzWyBzbGljZUluZGV4IF1bIGVjSW5kZXggXTtcclxuXHJcbiAgICAgICAgLy8gc2tpcCBzZWxmXHJcbiAgICAgICAgaWYgKCBvdGhlckVuZXJneUNodW5rID09PSBlYyApIHtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGZvcmNlIHZlY3RvciwgYnV0IGhhbmRsZSBjYXNlcyB3aGVyZSB0b28gY2xvc2VcclxuICAgICAgICB2ZWN0b3JGcm9tT3RoZXIuc2V0WFkoXHJcbiAgICAgICAgICBlYy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnggLSBvdGhlckVuZXJneUNodW5rLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCxcclxuICAgICAgICAgIGVjLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueSAtIG90aGVyRW5lcmd5Q2h1bmsucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55XHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAoIHZlY3RvckZyb21PdGhlci5tYWduaXR1ZGUgPCBtaW5EaXN0YW5jZSApIHtcclxuICAgICAgICAgIGlmICggdmVjdG9yRnJvbU90aGVyLnNldE1hZ25pdHVkZSggMCApICkge1xyXG5cclxuICAgICAgICAgICAgLy8gY3JlYXRlIGEgcmFuZG9tIHZlY3RvciBvZiBtaW4gZGlzdGFuY2VcclxuICAgICAgICAgICAgY29uc3QgcmFuZG9tQW5nbGUgPSBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogTWF0aC5QSSAqIDI7XHJcbiAgICAgICAgICAgIHZlY3RvckZyb21PdGhlci5zZXRYWShcclxuICAgICAgICAgICAgICBtaW5EaXN0YW5jZSAqIE1hdGguY29zKCByYW5kb21BbmdsZSApLFxyXG4gICAgICAgICAgICAgIG1pbkRpc3RhbmNlICogTWF0aC5zaW4oIHJhbmRvbUFuZ2xlIClcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2ZWN0b3JGcm9tT3RoZXIgPSB2ZWN0b3JGcm9tT3RoZXIuc2V0TWFnbml0dWRlKCBtaW5EaXN0YW5jZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yY2VGcm9tT3RoZXIuc2V0WFkoIHZlY3RvckZyb21PdGhlci54LCB2ZWN0b3JGcm9tT3RoZXIueSApO1xyXG4gICAgICAgIGZvcmNlRnJvbU90aGVyLnNldE1hZ25pdHVkZSggLUVDX1JFUFVMU0lPTl9GQUNUT1IgLyB2ZWN0b3JGcm9tT3RoZXIubWFnbml0dWRlU3F1YXJlZCApO1xyXG5cclxuICAgICAgICAvLyBhZGQgdGhlIGZvcmNlIHRvIHRoZSBhY2N1bXVsYXRlZCBmb3JjZXMgb24gdGhpcyBlbmVyZ3kgY2h1bmtcclxuICAgICAgICBlY0ZvcmNlLnNldFhZKCBlY0ZvcmNlLnggKyBmb3JjZUZyb21PdGhlci54LCBlY0ZvcmNlLnkgKyBmb3JjZUZyb21PdGhlci55ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBmcmVlIGFsbG9jYXRpb25zXHJcbiAgICB2ZWN0b3JGcm9tT3RoZXIuZnJlZVRvUG9vbCgpO1xyXG4gICAgZm9yY2VGcm9tT3RoZXIuZnJlZVRvUG9vbCgpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIHVwZGF0ZSBlbmVyZ3kgY2h1bmsgdmVsb2NpdGllcywgcmV0dXJuaW5nIG1heCBlbmVyZ3kgZm91bmRcclxuICAgKiBAcGFyYW0gIHtFbmVyZ3lDaHVua0NvbnRhaW5lclNsaWNlW119IHNsaWNlc1xyXG4gICAqIEBwYXJhbSAge0VuZXJneUNodW5rW11bXX0gZW5lcmd5Q2h1bmtzXHJcbiAgICogQHBhcmFtICB7VmVjdG9yMltdW119IGVuZXJneUNodW5rRm9yY2VzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gdGltZSBzdGVwXHJcbiAgICogQHJldHVybnMge251bWJlcn0gLSB0aGUgZW5lcmd5IGluIHRoZSBtb3N0IGVuZXJnZXRpYyBlbmVyZ3kgY2h1bmtcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZVZlbG9jaXRpZXM6IGZ1bmN0aW9uKCBzbGljZXMsIGVuZXJneUNodW5rcywgZW5lcmd5Q2h1bmtGb3JjZXMsIGR0ICkge1xyXG5cclxuICAgIGxldCBlbmVyZ3lJbk1vc3RFbmVyZ2V0aWNFQyA9IDA7XHJcblxyXG4gICAgLy8gbG9vcCB0aHJvdWdoIHRoZSBzbGljZXMsIGFuZCB0aGVuIHRoZSBlbmVyZ3kgY2h1bmtzIHRoZXJlaW4sIGFuZCB1cGRhdGUgdGhlaXIgdmVsb2NpdGllc1xyXG4gICAgZm9yICggbGV0IHNsaWNlSW5kZXggPSAwOyBzbGljZUluZGV4IDwgc2xpY2VzLmxlbmd0aDsgc2xpY2VJbmRleCsrICkge1xyXG5cclxuICAgICAgY29uc3QgbnVtYmVyT2ZFbmVyZ3lDaHVua3NJblNsaWNlID0gc2xpY2VzWyBzbGljZUluZGV4IF0uZW5lcmd5Q2h1bmtMaXN0Lmxlbmd0aDtcclxuXHJcbiAgICAgIGZvciAoIGxldCBlY0luZGV4ID0gMDsgZWNJbmRleCA8IG51bWJlck9mRW5lcmd5Q2h1bmtzSW5TbGljZTsgZWNJbmRleCsrICkge1xyXG5cclxuICAgICAgICAvLyBmb3JjZSBvbiB0aGlzIGNodW5rXHJcbiAgICAgICAgY29uc3QgZm9yY2UgPSBlbmVyZ3lDaHVua0ZvcmNlc1sgc2xpY2VJbmRleCBdWyBlY0luZGV4IF07XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIV8uaXNOYU4oIGZvcmNlLnggKSAmJiAhXy5pc05hTiggZm9yY2UueSApLCAnZm9yY2UgY29udGFpbnMgTmFOIHZhbHVlJyApO1xyXG5cclxuICAgICAgICAvLyBjdXJyZW50IHZlbG9jaXR5XHJcbiAgICAgICAgY29uc3QgdmVsb2NpdHkgPSBlbmVyZ3lDaHVua3NbIHNsaWNlSW5kZXggXVsgZWNJbmRleCBdLnZlbG9jaXR5O1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFfLmlzTmFOKCB2ZWxvY2l0eS54ICkgJiYgIV8uaXNOYU4oIHZlbG9jaXR5LnkgKSwgJ3ZlbG9jaXR5IGNvbnRhaW5zIE5hTiB2YWx1ZScgKTtcclxuXHJcbiAgICAgICAgLy8gdmVsb2NpdHkgY2hhbmdlIGlzIGJhc2VkIG9uIHRoZSBmb3JtdWxhIHYgPSAoRi9tKSogdCwgc28gcHJlLWNvbXB1dGUgdGhlIHQvbSBwYXJ0IGZvciBsYXRlciB1c2VcclxuICAgICAgICBjb25zdCBmb3JjZU11bHRpcGxpZXIgPSBkdCAvIEVORVJHWV9DSFVOS19NQVNTO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgdmVsb2NpdHkgYmFzZWQgb24gdGhlIHN1bSBvZiBmb3JjZXMgYWN0aW5nIG9uIHRoZSBlbmVyZ3kgY2h1bmtcclxuICAgICAgICB2ZWxvY2l0eS5hZGRYWSggZm9yY2UueCAqIGZvcmNlTXVsdGlwbGllciwgZm9yY2UueSAqIGZvcmNlTXVsdGlwbGllciApO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFfLmlzTmFOKCB2ZWxvY2l0eS54ICkgJiYgIV8uaXNOYU4oIHZlbG9jaXR5LnkgKSwgJ05ldyB2ZWxvY2l0eSBjb250YWlucyBOYU4gdmFsdWUnICk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBtYXggZW5lcmd5XHJcbiAgICAgICAgY29uc3QgdG90YWxQYXJ0aWNsZUVuZXJneSA9IDAuNSAqIEVORVJHWV9DSFVOS19NQVNTICogdmVsb2NpdHkubWFnbml0dWRlU3F1YXJlZCArIGZvcmNlLm1hZ25pdHVkZSAqIE1hdGguUEkgLyAyO1xyXG4gICAgICAgIGVuZXJneUluTW9zdEVuZXJnZXRpY0VDID0gTWF0aC5tYXgoIHRvdGFsUGFydGljbGVFbmVyZ3ksIGVuZXJneUluTW9zdEVuZXJnZXRpY0VDICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZW5lcmd5SW5Nb3N0RW5lcmdldGljRUM7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogdXBkYXRlIHRoZSBlbmVyZ3kgY2h1bmsgcG9zaXRpb25zIGJhc2VkIG9uIHRoZWlyIHZlbG9jaXR5IGFuZCBhIHRpbWUgc3RlcFxyXG4gICAqIEBwYXJhbSAge0VuZXJneUNodW5rQ29udGFpbmVyU2xpY2VbXX0gc2xpY2VzXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBkdCAtIHRpbWUgc3RlcCBpbiBzZWNvbmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHVwZGF0ZUVuZXJneUNodW5rUG9zaXRpb25zOiBmdW5jdGlvbiggc2xpY2VzLCBkdCApIHtcclxuICAgIHNsaWNlcy5mb3JFYWNoKCBzbGljZSA9PiB7XHJcbiAgICAgIHNsaWNlLmVuZXJneUNodW5rTGlzdC5mb3JFYWNoKCBlYyA9PiB7XHJcbiAgICAgICAgY29uc3QgdiA9IGVjLnZlbG9jaXR5O1xyXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gZWMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICBlYy5zZXRQb3NpdGlvblhZKCBwb3NpdGlvbi54ICsgdi54ICogZHQsIHBvc2l0aW9uLnkgKyB2LnkgKiBkdCApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQW4gb3JkZXItTiBhbGdvcml0aG0gZm9yIGRpc3RyaWJ1dGluZyB0aGUgZW5lcmd5IGNodW5rcyBiYXNlZCBvbiBhbiBBcmNoaW1lZGVhbiBzcGlyYWwuICBUaGlzIHdhcyBjcmVhdGVkIGZyb21cclxuICAgKiBmaXJzdCB0aGlua2luZyBhYm91dCB1c2luZyBjb25jZW50cmljIGNpcmNsZXMsIHRoZW4gZmlndXJpbmcgdGhhdCBhIHNwaXJhbCBpcyBwZXJoYXBzIGFuZCBlYXNpZXIgd2F5IHRvIGdldCBhXHJcbiAgICogc2ltaWxhciBlZmZlY3QuICBNYW55IG9mIHRoZSB2YWx1ZXMgdXNlZCB3ZXJlIGFycml2ZWQgYXQgdGhyb3VnaCB0cmlhbCBhbmQgZXJyb3IuXHJcbiAgICogQHBhcmFtIHtFbmVyZ3lDaHVua0NvbnRhaW5lclNsaWNlW119IHNsaWNlc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRpbWUgc3RlcFxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIHRydWUgaWYgYW55IGVuZXJneSBjaHVua3MgbmVlZGVkIHRvIGJlIG1vdmVkLCBmYWxzZSBpZiBub3RcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZVBvc2l0aW9uc1NwaXJhbCggc2xpY2VzLCBkdCApIHtcclxuXHJcbiAgICBsZXQgZWNNb3ZlZCA9IGZhbHNlO1xyXG4gICAgY29uc3QgZWNEZXN0aW5hdGlvbiA9IG5ldyBWZWN0b3IyKCAwLCAwICk7IC8vIHJldXNhYmxlIHZlY3RvciB0byBtaW5pbWl6ZSBnYXJiYWdlIGNvbGxlY3Rpb25cclxuXHJcbiAgICAvLyBsb29wIHRocm91Z2ggZWFjaCBzbGljZSwgdXBkYXRpbmcgdGhlIGVuZXJneSBjaHVuayBwb3NpdGlvbnMgZm9yIGVhY2hcclxuICAgIGZvciAoIGxldCBzbGljZUluZGV4ID0gMDsgc2xpY2VJbmRleCA8IHNsaWNlcy5sZW5ndGg7IHNsaWNlSW5kZXgrKyApIHtcclxuXHJcbiAgICAgIGNvbnN0IHNsaWNlQm91bmRzID0gc2xpY2VzWyBzbGljZUluZGV4IF0uYm91bmRzO1xyXG4gICAgICBjb25zdCBzbGljZUNlbnRlciA9IHNsaWNlQm91bmRzLmdldENlbnRlcigpO1xyXG4gICAgICBjb25zdCBudW1iZXJPZkVuZXJneUNodW5rc0luU2xpY2UgPSBzbGljZXNbIHNsaWNlSW5kZXggXS5lbmVyZ3lDaHVua0xpc3QubGVuZ3RoO1xyXG4gICAgICBpZiAoIG51bWJlck9mRW5lcmd5Q2h1bmtzSW5TbGljZSA9PT0gMCApIHtcclxuXHJcbiAgICAgICAgLy8gYmFpbCBvdXQgbm93IGlmIHRoZXJlIGFyZSBubyBlbmVyZ3kgY2h1bmtzIHRvIGRpc3RyaWJ1dGUgaW4gdGhpcyBzbGljZVxyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBudW1iZXIgb2YgdHVybnMgb2YgdGhlIHNwaXJhbFxyXG4gICAgICBjb25zdCBudW1iZXJPZlR1cm5zID0gMztcclxuXHJcbiAgICAgIGNvbnN0IG1heEFuZ2xlID0gbnVtYmVyT2ZUdXJucyAqIE1hdGguUEkgKiAyO1xyXG4gICAgICBjb25zdCBhID0gMSAvIG1heEFuZ2xlOyAvLyB0aGUgZXF1YXRpb24gZm9yIHRoZSBzcGlyYWwgaXMgZ2VuZXJhbGx5IHdyaXR0ZW4gYXMgciA9IGEgKiB0aGV0YSwgdGhpcyBpcyB0aGUgJ2EnXHJcblxyXG4gICAgICAvLyBEZWZpbmUgdGhlIGFuZ3VsYXIgc3BhbiBvdmVyIHdoaWNoIGVuZXJneSBjaHVua3Mgd2lsbCBiZSBwbGFjZWQuICBUaGlzIHdpbGwgZ3JvdyBhcyB0aGUgbnVtYmVyIG9mIGVuZXJneVxyXG4gICAgICAvLyBjaHVua3MgZ3Jvd3MuXHJcbiAgICAgIGxldCBhbmd1bGFyU3BhbjtcclxuICAgICAgaWYgKCBudW1iZXJPZkVuZXJneUNodW5rc0luU2xpY2UgPD0gNiApIHtcclxuICAgICAgICBhbmd1bGFyU3BhbiA9IDIgKiBNYXRoLlBJICogKCAxIC0gMSAvIG51bWJlck9mRW5lcmd5Q2h1bmtzSW5TbGljZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGFuZ3VsYXJTcGFuID0gTWF0aC5taW4oIE1hdGgubWF4KCBudW1iZXJPZkVuZXJneUNodW5rc0luU2xpY2UgLyAxOSAqIG1heEFuZ2xlLCAyICogTWF0aC5QSSApLCBtYXhBbmdsZSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUaGUgb2Zmc2V0IGZhY3Rpb24gZGVmaW5lZCBiZWxvdyBjb250cm9scyBob3cgd2VpZ2h0ZWQgdGhlIGFsZ29yaXRobSBpcyB0b3dhcmRzIHBsYWNpbmcgY2h1bmtzIHRvd2FyZHMgdGhlXHJcbiAgICAgIC8vIGVuZCBvZiB0aGUgc3BpcmFsIHZlcnN1cyB0aGUgYmVnaW5uaW5nLiAgV2UgYWx3YXlzIHdhbnQgdG8gYmUgc29tZXdoYXQgd2VpZ2h0ZWQgdG93YXJkcyB0aGUgZW5kIHNpbmNlIHRoZXJlXHJcbiAgICAgIC8vIGlzIG1vcmUgc3BhY2UgYXQgdGhlIGVuZCwgYnV0IHRoaXMgZ2V0cyBtb3JlIGltcG9ydGFudCBhcyB0aGUgbnVtYmVyIG9mIHNsaWNlcyBpbmNyZWFzZXMgYmVjYXVzZSB3ZSBuZWVkIHRvXHJcbiAgICAgIC8vIGF2b2lkIG92ZXJsYXAgb2YgZW5lcmd5IGNodW5rcyBpbiB0aGUgbWlkZGxlIG9mIHRoZSBtb2RlbCBlbGVtZW50LlxyXG4gICAgICBjb25zdCBvZmZzZXRGYWN0b3IgPSAoIC0xIC8gTWF0aC5wb3coIHNsaWNlcy5sZW5ndGgsIDEuNzUgKSApICsgMTtcclxuICAgICAgY29uc3Qgc3RhcnRBbmdsZSA9IG9mZnNldEZhY3RvciAqICggbWF4QW5nbGUgLSBhbmd1bGFyU3BhbiApO1xyXG5cclxuICAgICAgLy8gRGVmaW5lIGEgdmFsdWUgdGhhdCB3aWxsIGJlIHVzZWQgdG8gb2Zmc2V0IHRoZSBzcGlyYWwgcm90YXRpb24gaW4gdGhlIGRpZmZlcmVudCBzbGljZXMgc28gdGhhdCBlbmVyZ3kgY2h1bmtzXHJcbiAgICAgIC8vIGFyZSBsZXNzIGxpa2VseSB0byBsaW5lIHVwIGFjcm9zcyBzbGljZXMuXHJcbiAgICAgIGNvbnN0IHNwaXJhbEFuZ2xlT2Zmc2V0ID0gKCAyICogTWF0aC5QSSApIC8gc2xpY2VzLmxlbmd0aCArIE1hdGguUEk7XHJcblxyXG4gICAgICAvLyBsb29wIHRocm91Z2ggZWFjaCBlbmVyZ3kgY2h1bmsgaW4gdGhpcyBzbGljZSBhbmQgc2V0IGl0cyBwb3NpdGlvblxyXG4gICAgICBmb3IgKCBsZXQgZWNJbmRleCA9IDA7IGVjSW5kZXggPCBudW1iZXJPZkVuZXJneUNodW5rc0luU2xpY2U7IGVjSW5kZXgrKyApIHtcclxuICAgICAgICBjb25zdCBlYyA9IHNsaWNlc1sgc2xpY2VJbmRleCBdLmVuZXJneUNodW5rTGlzdC5nZXQoIGVjSW5kZXggKTtcclxuXHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBhbmdsZSB0byBmZWVkIGludG8gdGhlIHNwaXJhbCBmb3JtdWxhXHJcbiAgICAgICAgbGV0IGFuZ2xlO1xyXG4gICAgICAgIGlmICggbnVtYmVyT2ZFbmVyZ3lDaHVua3NJblNsaWNlIDw9IDEgKSB7XHJcbiAgICAgICAgICBhbmdsZSA9IHN0YXJ0QW5nbGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgYW5nbGUgPSBzdGFydEFuZ2xlICsgTWF0aC5wb3coIGVjSW5kZXggLyAoIG51bWJlck9mRW5lcmd5Q2h1bmtzSW5TbGljZSAtIDEgKSwgMC43NSApICogYW5ndWxhclNwYW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjYWxjdWxhdGUgYSByYWRpdXMgdmFsdWUgd2l0aGluIHRoZSBcIm5vcm1hbGl6ZWQgc3BpcmFsXCIsIHdoZXJlIHRoZSByYWRpdXMgaXMgMSBhdCB0aGUgbWF4IGFuZ2xlXHJcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZFJhZGl1cyA9IGEgKiBNYXRoLmFicyggYW5nbGUgKTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub3JtYWxpemVkUmFkaXVzIDw9IDEsICdub3JtYWxpemVkIGxlbmd0aCBtdXN0IGJlIDEgb3Igc21hbGxlcicgKTtcclxuXHJcbiAgICAgICAgLy8gUm90YXRlIHRoZSBzcGlyYWwgaW4gZWFjaCBzZXQgb2YgdHdvIHNsaWNlcyB0byBtaW5pbWl6ZSBvdmVybGFwIGJldHdlZW4gc2xpY2VzLiAgVGhpcyB3b3JrcyBpbiBjb25qdW5jdGlvblxyXG4gICAgICAgIC8vIHdpdGggdGhlIGNvZGUgdGhhdCByZXZlcnNlcyB0aGUgd2luZGluZyBkaXJlY3Rpb24gYmVsb3cgc28gdGhhdCB0aGUgc2FtZSBzcGlyYWwgaXMgbmV2ZXIgdXNlZCBmb3IgYW55IHR3b1xyXG4gICAgICAgIC8vIHNsaWNlcy5cclxuICAgICAgICBsZXQgYWRqdXN0ZWRBbmdsZSA9IGFuZ2xlICsgc3BpcmFsQW5nbGVPZmZzZXQgKiBzbGljZUluZGV4O1xyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgdGhlIG1heCBwb3NzaWJsZSByYWRpdXMgZm9yIHRoZSBjdXJyZW50IGFuZ2xlLCB3aGljaCBpcyBiYXNpY2FsbHkgdGhlIGRpc3RhbmNlIGZyb20gdGhlIGNlbnRlciB0b1xyXG4gICAgICAgIC8vIHRoZSBjbG9zZXN0IGVkZ2UuICBUaGlzIG11c3QgYmUgcmVkdWNlZCBhIGJpdCB0byBhY2NvdW50IGZvciB0aGUgZmFjdCB0aGF0IGVuZXJneSBjaHVua3MgaGF2ZSBzb21lIHdpZHRoIGluXHJcbiAgICAgICAgLy8gdGhlIHZpZXcuXHJcbiAgICAgICAgY29uc3QgbWF4UmFkaXVzID0gZ2V0Q2VudGVyVG9FZGdlRGlzdGFuY2UoIHNsaWNlQm91bmRzLCBhZGp1c3RlZEFuZ2xlICkgLSBFTkVSR1lfQ0hVTktfVklFV19UT19NT0RFTF9XSURUSCAvIDI7XHJcblxyXG4gICAgICAgIC8vIGRldGVybWluZSB0aGUgcmFkaXVzIHRvIHVzZSBhcyBhIGZ1bmN0aW9uIG9mIHRoZSB2YWx1ZSBmcm9tIHRoZSBub3JtYWxpemVkIHNwaXJhbCBhbmQgdGhlIG1heCB2YWx1ZVxyXG4gICAgICAgIGNvbnN0IHJhZGl1cyA9IG1heFJhZGl1cyAqIG5vcm1hbGl6ZWRSYWRpdXM7XHJcblxyXG4gICAgICAgIC8vIFJldmVyc2UgdGhlIGFuZ2xlIG9uIGV2ZXJ5IG90aGVyIHNsaWNlIHRvIGdldCBtb3JlIHNwcmVhZCBiZXR3ZWVuIHNsaWNlcyBhbmQgYSBtb3JlIHJhbmRvbSBhcHBlYXJhbmNlIHdoZW5cclxuICAgICAgICAvLyBjaHVua3MgYXJlIGFkZGVkIChiZWNhdXNlIHRoZXkgZG9uJ3QgYWxsIHdpbmQgaW4gdGhlIHNhbWUgZGlyZWN0aW9uKS5cclxuICAgICAgICBpZiAoIHNsaWNlSW5kZXggJSAyID09PSAwICkge1xyXG4gICAgICAgICAgYWRqdXN0ZWRBbmdsZSA9IC1hZGp1c3RlZEFuZ2xlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBkZXNpcmVkIHBvc2l0aW9uIHVzaW5nIHBvbGFyIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgZWNEZXN0aW5hdGlvbi5zZXRQb2xhciggcmFkaXVzLCBhZGp1c3RlZEFuZ2xlICk7XHJcbiAgICAgICAgZWNEZXN0aW5hdGlvbi5hZGQoIHNsaWNlQ2VudGVyICk7XHJcblxyXG4gICAgICAgIC8vIGFuaW1hdGUgdGhlIGVuZXJneSBjaHVuayB0b3dhcmRzIGl0cyBkZXN0aW5hdGlvbiBpZiBpdCBpc24ndCB0aGVyZSBhbHJlYWR5XHJcbiAgICAgICAgaWYgKCAhZWMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5lcXVhbHMoIGVjRGVzdGluYXRpb24gKSApIHtcclxuICAgICAgICAgIG1vdmVFQ1Rvd2FyZHNEZXN0aW5hdGlvbiggZWMsIGVjRGVzdGluYXRpb24sIGR0ICk7XHJcbiAgICAgICAgICBlY01vdmVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZWNNb3ZlZDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBTdXBlciBzaW1wbGUgYWx0ZXJuYXRpdmUgZW5lcmd5IGNodW5rIGRpc3RyaWJ1dGlvbiBhbGdvcml0aG0gLSBqdXN0IHB1dHMgYWxsIGVuZXJneSBjaHVua3MgaW4gY2VudGVyIG9mIHNsaWNlLlxyXG4gICAqIFRoaXMgaXMgdXNlZnVsIGZvciBkZWJ1Z2dpbmcgc2luY2UgaXQgcG9zaXRpb25zIHRoZSBjaHVua3MgYXMgcXVpY2tseSBhcyBwb3NzaWJsZS5cclxuICAgKiBAcGFyYW0ge0VuZXJneUNodW5rQ29udGFpbmVyU2xpY2VbXX0gc2xpY2VzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gdGltZSBzdGVwXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gdHJ1ZSBpZiBhbnkgZW5lcmd5IGNodW5rcyBuZWVkZWQgdG8gYmUgbW92ZWQsIGZhbHNlIGlmIG5vdFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlUG9zaXRpb25zU2ltcGxlKCBzbGljZXMsIGR0ICkge1xyXG5cclxuICAgIGxldCBlY01vdmVkID0gZmFsc2U7XHJcbiAgICBjb25zdCBlY0Rlc3RpbmF0aW9uID0gbmV3IFZlY3RvcjIoIDAsIDAgKTsgLy8gcmV1c2FibGUgdmVjdG9yIHRvIG1pbmltemUgZ2FyYmFnZSBjb2xsZWN0aW9uXHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBwb3NpdGlvbnMgb2YgdGhlIGVuZXJneSBjaHVua3NcclxuICAgIHNsaWNlcy5mb3JFYWNoKCBzbGljZSA9PiB7XHJcbiAgICAgIHNsaWNlLmVuZXJneUNodW5rTGlzdC5mb3JFYWNoKCBlbmVyZ3lDaHVuayA9PiB7XHJcbiAgICAgICAgZWNEZXN0aW5hdGlvbi5zZXRYWSggc2xpY2UuYm91bmRzLmNlbnRlclgsIHNsaWNlLmJvdW5kcy5jZW50ZXJZICk7XHJcblxyXG4gICAgICAgIC8vIGFuaW1hdGUgdGhlIGVuZXJneSBjaHVuayB0b3dhcmRzIGl0cyBkZXN0aW5hdGlvbiBpZiBpdCBpc24ndCB0aGVyZSBhbHJlYWR5XHJcbiAgICAgICAgaWYgKCAhZW5lcmd5Q2h1bmsucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5lcXVhbHMoIGVjRGVzdGluYXRpb24gKSApIHtcclxuICAgICAgICAgIG1vdmVFQ1Rvd2FyZHNEZXN0aW5hdGlvbiggZW5lcmd5Q2h1bmssIGVjRGVzdGluYXRpb24sIGR0ICk7XHJcbiAgICAgICAgICBlY01vdmVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gZWNNb3ZlZDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGFsZ29yaXRobSB0byB1c2UgaW4gdGhlIFwidXBkYXRlUG9zaXRpb25zXCIgbWV0aG9kLiAgVGhpcyBpcyBnZW5lcmFsbHkgZG9uZSBvbmx5IGR1cmluZyBpbml0aWFsaXphdGlvbiBzb1xyXG4gICAqIHRoYXQgdXNlcnMgZG9uJ3Qgc2VlIG5vdGljZWFibGUgY2hhbmdlcyBpbiB0aGUgZW5lcmd5IGNodW5rIG1vdGlvbi4gIFRoZSB0cmFkZW9mZnMgYmV0d2VlbiB0aGUgZGlmZmVyZW50XHJcbiAgICogYWxnb3JpdGhtcyBhcmUgZ2VuZXJhbGx5IGJhc2VkIG9uIGhvdyBnb29kIGl0IGxvb2tzIGFuZCBob3cgbXVjaCBjb21wdXRhdGlvbmFsIHBvd2VyIGl0IHJlcXVpcmVzLlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhbGdvcml0aG1OYW1lXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldERpc3RyaWJ1dGlvbkFsZ29yaXRobSggYWxnb3JpdGhtTmFtZSApIHtcclxuICAgIGlmICggYWxnb3JpdGhtTmFtZSA9PT0gJ3JlcHVsc2l2ZScgKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlUG9zaXRpb25zID0gdGhpcy51cGRhdGVQb3NpdGlvbnNSZXB1bHNpdmU7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggYWxnb3JpdGhtTmFtZSA9PT0gJ3NwaXJhbCcgKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlUG9zaXRpb25zID0gdGhpcy51cGRhdGVQb3NpdGlvbnNTcGlyYWw7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggYWxnb3JpdGhtTmFtZSA9PT0gJ3NpbXBsZScgKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlUG9zaXRpb25zID0gdGhpcy51cGRhdGVQb3NpdGlvbnNTaW1wbGU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsIGB1bmtub3duIGRpc3RyaWJ1dGlvbiBhbGdvcml0aG0gc3BlY2lmaWVkOiAke2FsZ29yaXRobU5hbWV9YCApO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbi8vIFNldCB1cCB0aGUgZGlzdHJpYnV0aW9uIGFsZ29yaXRobSB0byB1c2UgYmFzZWQgb24gcXVlcnkgcGFyYW1ldGVycy4gIElmIG5vIHF1ZXJ5IHBhcmFtZXRlciBpcyBzcGVjaWZpZWQsIHdlIHN0YXJ0XHJcbi8vIHdpdGggdGhlIHJlcHVsc2l2ZSBhbGdvcml0aG0gYmVjYXVzZSBpdCBsb29rcyBiZXN0LCBidXQgbWF5IG1vdmUgdG8gc3BpcmFsIGlmIHBvb3IgcGVyZm9ybWFuY2UgaXMgZGV0ZWN0ZWQuXHJcbmlmICggRUZBQ1F1ZXJ5UGFyYW1ldGVycy5lY0Rpc3RyaWJ1dGlvbiA9PT0gbnVsbCApIHtcclxuXHJcbiAgLy8gdXNlIHRoZSByZXB1bHNpdmUgYWxnb3JpdGhtIGJ5IGRlZmF1bHQsIHdoaWNoIGxvb2tzIHRoZSBiZXN0IGJ1dCBpcyBhbHNvIHRoZSBtb3N0IGNvbXB1dGF0aW9uYWxseSBleHBlbnNpdmVcclxuICBlbmVyZ3lDaHVua0Rpc3RyaWJ1dG9yLnVwZGF0ZVBvc2l0aW9ucyA9IGVuZXJneUNodW5rRGlzdHJpYnV0b3IudXBkYXRlUG9zaXRpb25zUmVwdWxzaXZlO1xyXG59XHJcbmVsc2Uge1xyXG4gIGVuZXJneUNodW5rRGlzdHJpYnV0b3Iuc2V0RGlzdHJpYnV0aW9uQWxnb3JpdGhtKCBFRkFDUXVlcnlQYXJhbWV0ZXJzLmVjRGlzdHJpYnV0aW9uICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBoZWxwZXIgZnVuY3Rpb24gZm9yIG1vdmluZyBhbiBlbmVyZ3kgY2h1bmsgdG93YXJkcyBhIGRlc3RpbmF0aW9uLCBzZXRzIHRoZSBFQydzIHZlbG9jaXR5IHZhbHVlXHJcbiAqIEBwYXJhbSB7RW5lcmd5Q2h1bmt9IGVjXHJcbiAqIEBwYXJhbSB7VmVjdG9yMn0gZGVzdGluYXRpb25cclxuICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gZGVsdGEgdGltZSwgaW4gc2Vjb25kc1xyXG4gKi9cclxuY29uc3QgbW92ZUVDVG93YXJkc0Rlc3RpbmF0aW9uID0gKCBlYywgZGVzdGluYXRpb24sIGR0ICkgPT4ge1xyXG4gIGNvbnN0IGVjUG9zaXRpb24gPSBlYy5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gIGlmICggIWVjUG9zaXRpb24uZXF1YWxzKCBkZXN0aW5hdGlvbiApICkge1xyXG4gICAgaWYgKCBlY1Bvc2l0aW9uLmRpc3RhbmNlKCBkZXN0aW5hdGlvbiApIDw9IEVDX1NQRUVEX0RFVEVSTUlOSVNUSUMgKiBkdCApIHtcclxuXHJcbiAgICAgIC8vIEVDIGlzIGNsb3NlIGVub3VnaCB0aGF0IGl0IHNob3VsZCBqdXN0IGdvIHRvIHRoZSBkZXN0aW5hdGlvblxyXG4gICAgICBlYy5wb3NpdGlvblByb3BlcnR5LnNldCggZGVzdGluYXRpb24uY29weSgpICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgdmVjdG9yVG93YXJkc0Rlc3RpbmF0aW9uID0gZGVzdGluYXRpb24ubWludXMoIGVjLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgdmVjdG9yVG93YXJkc0Rlc3RpbmF0aW9uLnNldE1hZ25pdHVkZSggRUNfU1BFRURfREVURVJNSU5JU1RJQyApO1xyXG4gICAgICBlYy52ZWxvY2l0eS5zZXQoIHZlY3RvclRvd2FyZHNEZXN0aW5hdGlvbiApO1xyXG4gICAgICBlYy5zZXRQb3NpdGlvblhZKCBlY1Bvc2l0aW9uLnggKyBlYy52ZWxvY2l0eS54ICogZHQsIGVjUG9zaXRpb24ueSArIGVjLnZlbG9jaXR5LnkgKiBkdCApO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBoZWxwZXIgZnVuY3Rpb24gZm9yIGdldHRpbmcgdGhlIGRpc3RhbmNlIGZyb20gdGhlIGNlbnRlciBvZiB0aGUgcHJvdmlkZWQgYm91bmRzIHRvIHRoZSBlZGdlIGF0IHRoZSBnaXZlbiBhbmdsZVxyXG4gKiBAcGFyYW0ge0JvdW5kczJ9IGJvdW5kc1xyXG4gKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgaW4gcmFkaWFuc1xyXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gKi9cclxuY29uc3QgZ2V0Q2VudGVyVG9FZGdlRGlzdGFuY2UgPSAoIGJvdW5kcywgYW5nbGUgKSA9PiB7XHJcbiAgY29uc3QgaGFsZldpZHRoID0gYm91bmRzLndpZHRoIC8gMjtcclxuICBjb25zdCBoYWxmSGVpZ2h0ID0gYm91bmRzLmhlaWdodCAvIDI7XHJcbiAgY29uc3QgdGFuZ2VudE9mQW5nbGUgPSBNYXRoLnRhbiggYW5nbGUgKTtcclxuICBsZXQgb3Bwb3NpdGU7XHJcbiAgbGV0IGFkamFjZW50O1xyXG4gIGlmICggTWF0aC5hYnMoIGhhbGZIZWlnaHQgLyB0YW5nZW50T2ZBbmdsZSApIDwgaGFsZldpZHRoICkge1xyXG4gICAgb3Bwb3NpdGUgPSBoYWxmSGVpZ2h0O1xyXG4gICAgYWRqYWNlbnQgPSBvcHBvc2l0ZSAvIHRhbmdlbnRPZkFuZ2xlO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIGFkamFjZW50ID0gaGFsZldpZHRoO1xyXG4gICAgb3Bwb3NpdGUgPSBoYWxmV2lkdGggKiB0YW5nZW50T2ZBbmdsZTtcclxuICB9XHJcblxyXG4gIHJldHVybiBNYXRoLnNxcnQoIG9wcG9zaXRlICogb3Bwb3NpdGUgKyBhZGphY2VudCAqIGFkamFjZW50ICk7XHJcbn07XHJcblxyXG5lbmVyZ3lGb3Jtc0FuZENoYW5nZXMucmVnaXN0ZXIoICdlbmVyZ3lDaHVua0Rpc3RyaWJ1dG9yJywgZW5lcmd5Q2h1bmtEaXN0cmlidXRvciApO1xyXG5leHBvcnQgZGVmYXVsdCBlbmVyZ3lDaHVua0Rpc3RyaWJ1dG9yOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUNsRSxPQUFPQyxtQkFBbUIsTUFBTSwyQkFBMkI7O0FBRTNEO0FBQ0EsTUFBTUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLENBQUM7O0FBRWxDO0FBQ0EsTUFBTUMsZ0NBQWdDLEdBQUcsS0FBSzs7QUFFOUM7QUFDQSxNQUFNQyxhQUFhLEdBQUssQ0FBQyxHQUFHLEVBQUUsR0FBSyxDQUFDLENBQUMsQ0FBQztBQUN0QyxNQUFNQyxpQkFBaUIsR0FBRyxPQUFPLENBQUMsQ0FBQztBQUNuQyxNQUFNQyxhQUFhLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDNUIsTUFBTUMscUJBQXFCLEdBQUcsTUFBTSxDQUFDLENBQUM7O0FBRXRDO0FBQ0EsTUFBTUMsbUJBQW1CLEdBQUcsSUFBSTs7QUFFaEM7QUFDQSxNQUFNQyxXQUFXLEdBQUdELG1CQUFtQjs7QUFFdkM7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