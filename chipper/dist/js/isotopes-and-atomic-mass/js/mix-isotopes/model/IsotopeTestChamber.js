// Copyright 2015-2021, University of Colorado Boulder

/**
 * Class that represents a "test chamber" where multiple isotopes can be placed. The test chamber calculates the
 * average atomic mass and the proportions of the various isotopes. It is intended to be contained in the
 * main model class.
 *
 * @author John Blanco
 * @author James Smith
 * @author Aadish Gupta
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';

// constants

// Size of the "test chamber", which is the area in model space into which the isotopes can be dragged in order to
// contribute to the current average atomic weight.
const SIZE = new Dimension2(450, 280); // In picometers.

// Rectangle that defines the position of the test chamber. This is set up so that the center of the test chamber is
// at (0, 0) in model space.
const TEST_CHAMBER_RECT = new Rectangle(-SIZE.width / 2, -SIZE.height / 2, SIZE.width, SIZE.height);
const BUFFER = 1; // isotopes stroke doesn't cross the wall, empirically determined

/**
 * Utility Function that contains the state of the isotope test chamber, and can be used for saving and later restoring
 * the state.
 *
 * @param {IsotopeTestChamber} isotopeTestChamber
 */
function State(isotopeTestChamber) {
  this.containedIsotopes = createObservableArray();
  isotopeTestChamber.containedIsotopes.forEach(isotope => {
    this.containedIsotopes.add(isotope);
  });
}
class IsotopeTestChamber {
  /**
   * @param {MixIsotopesModel} model
   */
  constructor(model) {
    // @private {MixIsotopesModel} - model that contains this test chamber
    this.model = model;

    // @public - {ObservableArrayDef.<MovableAtom>} - isotopes that are in this test chamber
    this.containedIsotopes = createObservableArray();

    // @public {Read-Only}
    this.isotopeCountProperty = new Property(0);
    this.averageAtomicMassProperty = new Property(0);
  }

  /**
   * Get the number of isotopes currently in the chamber that match the specified configuration.
   * @param {NumberAtom} isotopeConfig
   * @returns {number} isotopeCount
   * @public
   */
  getIsotopeCount(isotopeConfig) {
    assert && assert(isotopeConfig.protonCountProperty.get() === isotopeConfig.electronCountProperty.get()); // Should always be neutral atom.
    let isotopeCount = 0;
    this.containedIsotopes.forEach(isotope => {
      if (isotope.atomConfiguration.equals(isotopeConfig)) {
        isotopeCount++;
      }
    });
    return isotopeCount;
  }

  /**
   * @returns {Rectangle} TEST_CHAMBER_RECT
   * @public
   */
  getTestChamberRect() {
    return TEST_CHAMBER_RECT;
  }

  /**
   * Test whether an isotope is within the chamber. This is strictly a 2D test that looks as the isotopes center
   * position and determines if it is within the bounds of the chamber rectangle.
   * @param {MovableAtom} isotope
   * @returns {boolean}
   * @public
   */
  isIsotopePositionedOverChamber(isotope) {
    return TEST_CHAMBER_RECT.containsPoint(isotope.positionProperty.get());
  }

  /**
   * Add the specified isotope to the chamber. This method requires that the position of the isotope be within the
   * chamber rectangle, or the isotope will not be added.
   *
   * In cases where an isotope is in a position where the center is within the chamber but the edges are not, the
   * isotope will be moved so that it is fully contained within the chamber.
   *
   * @param {MovableAtom} isotope
   * @param {boolean} performUpdates - Flag that can be set be used to suppress updates.
   * @public
   */
  addIsotopeToChamber(isotope, performUpdates) {
    if (this.isIsotopePositionedOverChamber(isotope)) {
      this.containedIsotopes.push(isotope);
      const isotopeRemovedListener = userControlled => {
        if (userControlled && this.containedIsotopes.includes(isotope)) {
          this.removeIsotopeFromChamber(isotope);
        }
        isotope.userControlledProperty.unlink(isotopeRemovedListener);
      };
      isotope.userControlledProperty.lazyLink(isotopeRemovedListener);

      // If the edges of the isotope are outside of the container, move it to be fully inside.
      let protrusion = isotope.positionProperty.get().x + isotope.radiusProperty.get() - TEST_CHAMBER_RECT.maxX + BUFFER;
      if (protrusion >= 0) {
        isotope.setPositionAndDestination(new Vector2(isotope.positionProperty.get().x - protrusion, isotope.positionProperty.get().y));
      } else {
        protrusion = TEST_CHAMBER_RECT.minX + BUFFER - (isotope.positionProperty.get().x - isotope.radiusProperty.get());
        if (protrusion >= 0) {
          isotope.setPositionAndDestination(new Vector2(isotope.positionProperty.get().x + protrusion, isotope.positionProperty.get().y));
        }
      }
      protrusion = isotope.positionProperty.get().y + isotope.radiusProperty.get() - TEST_CHAMBER_RECT.maxY + BUFFER;
      if (protrusion >= 0) {
        isotope.setPositionAndDestination(new Vector2(isotope.positionProperty.get().x, isotope.positionProperty.get().y - protrusion));
      } else {
        protrusion = TEST_CHAMBER_RECT.minY + BUFFER - (isotope.positionProperty.get().y - isotope.radiusProperty.get());
        if (protrusion >= 0) {
          isotope.setPositionAndDestination(new Vector2(isotope.positionProperty.get().x, isotope.positionProperty.get().y + protrusion));
        }
      }
      if (performUpdates) {
        // Update the isotope count.
        this.updateCountProperty();
        // Update the average atomic mass.
        this.averageAtomicMassProperty.set((this.averageAtomicMassProperty.get() * (this.isotopeCountProperty.get() - 1) + isotope.atomConfiguration.getIsotopeAtomicMass()) / this.isotopeCountProperty.get());
      }
    } else {
      // This isotope is not positioned correctly.
      assert && assert(false, 'Ignoring attempt to add incorrectly located isotope to test chamber.');
    }
  }

  /**
   * Adds a list of isotopes to the test chamber. Same restrictions as above.
   * @param {MovableAtom[]} isotopeList
   * @public
   */
  bulkAddIsotopesToChamber(isotopeList) {
    isotopeList.forEach(isotope => {
      this.addIsotopeToChamber(isotope, false);
    });
    this.updateCountProperty();
    this.updateAverageAtomicMassProperty();
  }

  /**
   * Convenience function to set the isotopeCount property equal to the number of isotopes contained in this test chamber.
   * @private
   */
  updateCountProperty() {
    this.isotopeCountProperty.set(this.containedIsotopes.length);
  }

  // @private
  updateAverageAtomicMassProperty() {
    if (this.containedIsotopes.length > 0) {
      let totalMass = 0;
      this.containedIsotopes.forEach(isotope => {
        totalMass += isotope.atomConfiguration.getIsotopeAtomicMass();
      });
      this.averageAtomicMassProperty.set(totalMass / this.containedIsotopes.length);
    } else {
      this.averageAtomicMassProperty.set(0);
    }
  }

  /**
   * @param {MovableAtom} isotope
   * @public
   */
  removeIsotopeFromChamber(isotope) {
    this.containedIsotopes.remove(isotope);
    this.updateCountProperty();

    // Update the average atomic mass.
    if (this.isotopeCountProperty.get() > 0) {
      this.averageAtomicMassProperty.set((this.averageAtomicMassProperty.get() * (this.isotopeCountProperty.get() + 1) - isotope.atomConfiguration.getIsotopeAtomicMass()) / this.isotopeCountProperty.get());
    } else {
      this.averageAtomicMassProperty.set(0);
    }
  }

  /**
   * Remove an isotope from the chamber that matches the specified atom configuration. Note that electrons are ignored.
   * @param {NumberAtom} isotopeConfig
   * @returns {MovableAtom} removedIsotope
   * @public
   */
  removeIsotopeMatchingConfig(isotopeConfig) {
    assert && assert(isotopeConfig.protonCountProperty.get() - isotopeConfig.electronCountProperty.get() === 0);

    // Locate and remove a matching isotope.
    let removedIsotope = null;
    this.containedIsotopes.forEach(isotope => {
      if (isotope.atomConfiguration.equals(isotopeConfig)) {
        removedIsotope = isotope;
      }
    });
    this.removeIsotopeFromChamber(removedIsotope);
    return removedIsotope;
  }

  /**
   * Removes all isotopes
   * @public
   */
  removeAllIsotopes() {
    this.containedIsotopes.clear();
    this.updateCountProperty();
    this.averageAtomicMassProperty.set(0);
  }

  /**
   * Returns the containedIsotopes.
   * @returns {ObservableArrayDef}
   * @public
   */
  getContainedIsotopes() {
    return this.containedIsotopes;
  }

  /**
   * Get a count of the total number of isotopes in the chamber.
   * @returns {number}
   * @public
   */
  getTotalIsotopeCount() {
    return this.isotopeCountProperty.get();
  }

  /**
   * Get the proportion of isotopes currently within the chamber that match the specified configuration.
   * @param {NumberAtom} isotopeConfig
   * @returns {number} isotopeProportion
   * @public
   */
  getIsotopeProportion(isotopeConfig) {
    // Calculates charge to ensure that isotopes are neutral.
    assert && assert(isotopeConfig.protonCountProperty.get() - isotopeConfig.electronCountProperty.get() === 0);
    let isotopeCount = 0;
    this.containedIsotopes.forEach(isotope => {
      if (isotopeConfig.equals(isotope.atomConfiguration)) {
        isotopeCount++;
      }
    });
    return isotopeCount / this.containedIsotopes.length;
  }

  /**
   * Move all the particles in the chamber such that they don't overlap. This is intended for usage where there are not
   * a lot of particles in the chamber. Using it in cases where there are a lost of particles could take a very long time.
   * @public
   */
  adjustForOverlap() {
    // Bounds checking.  The threshold is pretty much arbitrary.
    assert && assert(this.getTotalIsotopeCount() <= 100, 'Ignoring request to adjust for overlap - too many particles in the chamber for that');

    // Check for overlap and adjust particle positions until none exists.
    const maxIterations = 10000; // empirically determined
    for (let i = 0; this.checkForParticleOverlap() && i < maxIterations; i++) {
      // Adjustment factors for the repositioning algorithm, these can be changed for different behaviour.
      const interParticleForceConst = 200;
      const wallForceConst = interParticleForceConst * 10;
      const minInterParticleDistance = 5;
      const mapIsotopesToForces = {};
      const mapIsotopesIDToIsotope = {};
      this.containedIsotopes.forEach(isotope1 => {
        const totalForce = new Vector2(0, 0);

        // Calculate the force due to other isotopes.
        for (let j = 0; j < this.containedIsotopes.length; j++) {
          const isotope2 = this.containedIsotopes.get(j);
          if (isotope1 === isotope2) {
            continue;
          }
          const forceFromIsotope = new Vector2(0, 0);
          const distanceBetweenIsotopes = isotope1.positionProperty.get().distance(isotope2.positionProperty.get());
          if (distanceBetweenIsotopes === 0) {
            // These isotopes are sitting right on top of one another.  Add the max amount of inter-particle force in a
            // random direction.
            forceFromIsotope.setPolar(interParticleForceConst / (minInterParticleDistance * minInterParticleDistance), dotRandom.nextDouble() * 2 * Math.PI);
          } else if (distanceBetweenIsotopes < isotope1.radiusProperty.get() + isotope2.radiusProperty.get()) {
            // calculate the repulsive force based on the distance.
            forceFromIsotope.x = isotope1.positionProperty.get().x - isotope2.positionProperty.get().x;
            forceFromIsotope.y = isotope1.positionProperty.get().y - isotope2.positionProperty.get().y;
            const distance = Math.max(forceFromIsotope.magnitude, minInterParticleDistance);
            forceFromIsotope.normalize();
            forceFromIsotope.multiply(interParticleForceConst / (distance * distance));
          }
          totalForce.add(forceFromIsotope);
        }

        // Calculate the force due to the walls. This prevents particles from being pushed out of the bounds of the chamber.
        if (isotope1.positionProperty.get().x + isotope1.radiusProperty.get() >= TEST_CHAMBER_RECT.maxX) {
          const distanceFromRightWall = TEST_CHAMBER_RECT.maxX - isotope1.positionProperty.get().x;
          totalForce.add(new Vector2(-wallForceConst / (distanceFromRightWall * distanceFromRightWall), 0));
        } else if (isotope1.positionProperty.get().x - isotope1.radius <= TEST_CHAMBER_RECT.minX) {
          const distanceFromLeftWall = isotope1.positionProperty.get().x - TEST_CHAMBER_RECT.minX;
          totalForce.add(new Vector2(wallForceConst / (distanceFromLeftWall * distanceFromLeftWall), 0));
        }
        if (isotope1.positionProperty.get().y + isotope1.radiusProperty.get() >= TEST_CHAMBER_RECT.maxY) {
          const distanceFromTopWall = TEST_CHAMBER_RECT.maxY - isotope1.positionProperty.get().y;
          totalForce.add(new Vector2(0, -wallForceConst / (distanceFromTopWall * distanceFromTopWall)));
        } else if (isotope1.positionProperty.get().y - isotope1.radiusProperty.get() <= TEST_CHAMBER_RECT.minY) {
          const distanceFromBottomWall = isotope1.positionProperty.get().y - TEST_CHAMBER_RECT.minY;
          totalForce.add(new Vector2(0, wallForceConst / (distanceFromBottomWall * distanceFromBottomWall)));
        }
        // Put the calculated repulsive force into the map.
        mapIsotopesToForces[isotope1.instanceCount] = totalForce;
        mapIsotopesIDToIsotope[isotope1.instanceCount] = isotope1;
      });

      // Adjust the particle positions based on forces.
      for (const isotopeID in mapIsotopesToForces) {
        if (mapIsotopesToForces.hasOwnProperty(isotopeID)) {
          // Sets the position of the isotope to the corresponding Vector2 from mapIsotopesToForces
          mapIsotopesIDToIsotope[isotopeID].setPositionAndDestination(mapIsotopesToForces[isotopeID].add(mapIsotopesIDToIsotope[isotopeID].positionProperty.get()));
        }
      }
    }
  }

  /**
   * Checks to ensure that particles are not overlapped.
   * @returns {boolean}
   * @private
   */
  checkForParticleOverlap() {
    let overlapExists = false;
    for (let i = 0; i < this.containedIsotopes.length && !overlapExists; i++) {
      const isotope1 = this.containedIsotopes.get(i);
      for (let j = 0; j < this.containedIsotopes.length && !overlapExists; j++) {
        const isotope2 = this.containedIsotopes.get(j);
        if (isotope1 === isotope2) {
          // Same isotope, so skip it.
          continue;
        }
        const distance = isotope1.positionProperty.get().distance(isotope2.positionProperty.get());
        if (distance < isotope1.radiusProperty.get() + isotope2.radiusProperty.get()) {
          overlapExists = true;
        }
      }
    }
    return overlapExists;
  }

  /**
   * Generate a random position within the test chamber.
   * @returns {Vector2}
   * @public
   */
  generateRandomPosition() {
    return new Vector2(TEST_CHAMBER_RECT.minX + dotRandom.nextDouble() * TEST_CHAMBER_RECT.width, TEST_CHAMBER_RECT.minY + dotRandom.nextDouble() * TEST_CHAMBER_RECT.height);
  }

  // @public
  getState() {
    return new State(this);
  }

  /**
   * Restore a previously captured state.
   * @param {State} state
   * @public
   */
  setState(state) {
    this.removeAllIsotopes(true);
    this.bulkAddIsotopesToChamber(state.containedIsotopes);
  }
}
isotopesAndAtomicMass.register('IsotopeTestChamber', IsotopeTestChamber);
export default IsotopeTestChamber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJkb3RSYW5kb20iLCJSZWN0YW5nbGUiLCJWZWN0b3IyIiwiaXNvdG9wZXNBbmRBdG9taWNNYXNzIiwiU0laRSIsIlRFU1RfQ0hBTUJFUl9SRUNUIiwid2lkdGgiLCJoZWlnaHQiLCJCVUZGRVIiLCJTdGF0ZSIsImlzb3RvcGVUZXN0Q2hhbWJlciIsImNvbnRhaW5lZElzb3RvcGVzIiwiZm9yRWFjaCIsImlzb3RvcGUiLCJhZGQiLCJJc290b3BlVGVzdENoYW1iZXIiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwiaXNvdG9wZUNvdW50UHJvcGVydHkiLCJhdmVyYWdlQXRvbWljTWFzc1Byb3BlcnR5IiwiZ2V0SXNvdG9wZUNvdW50IiwiaXNvdG9wZUNvbmZpZyIsImFzc2VydCIsInByb3RvbkNvdW50UHJvcGVydHkiLCJnZXQiLCJlbGVjdHJvbkNvdW50UHJvcGVydHkiLCJpc290b3BlQ291bnQiLCJhdG9tQ29uZmlndXJhdGlvbiIsImVxdWFscyIsImdldFRlc3RDaGFtYmVyUmVjdCIsImlzSXNvdG9wZVBvc2l0aW9uZWRPdmVyQ2hhbWJlciIsImNvbnRhaW5zUG9pbnQiLCJwb3NpdGlvblByb3BlcnR5IiwiYWRkSXNvdG9wZVRvQ2hhbWJlciIsInBlcmZvcm1VcGRhdGVzIiwicHVzaCIsImlzb3RvcGVSZW1vdmVkTGlzdGVuZXIiLCJ1c2VyQ29udHJvbGxlZCIsImluY2x1ZGVzIiwicmVtb3ZlSXNvdG9wZUZyb21DaGFtYmVyIiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsInVubGluayIsImxhenlMaW5rIiwicHJvdHJ1c2lvbiIsIngiLCJyYWRpdXNQcm9wZXJ0eSIsIm1heFgiLCJzZXRQb3NpdGlvbkFuZERlc3RpbmF0aW9uIiwieSIsIm1pblgiLCJtYXhZIiwibWluWSIsInVwZGF0ZUNvdW50UHJvcGVydHkiLCJzZXQiLCJnZXRJc290b3BlQXRvbWljTWFzcyIsImJ1bGtBZGRJc290b3Blc1RvQ2hhbWJlciIsImlzb3RvcGVMaXN0IiwidXBkYXRlQXZlcmFnZUF0b21pY01hc3NQcm9wZXJ0eSIsImxlbmd0aCIsInRvdGFsTWFzcyIsInJlbW92ZSIsInJlbW92ZUlzb3RvcGVNYXRjaGluZ0NvbmZpZyIsInJlbW92ZWRJc290b3BlIiwicmVtb3ZlQWxsSXNvdG9wZXMiLCJjbGVhciIsImdldENvbnRhaW5lZElzb3RvcGVzIiwiZ2V0VG90YWxJc290b3BlQ291bnQiLCJnZXRJc290b3BlUHJvcG9ydGlvbiIsImFkanVzdEZvck92ZXJsYXAiLCJtYXhJdGVyYXRpb25zIiwiaSIsImNoZWNrRm9yUGFydGljbGVPdmVybGFwIiwiaW50ZXJQYXJ0aWNsZUZvcmNlQ29uc3QiLCJ3YWxsRm9yY2VDb25zdCIsIm1pbkludGVyUGFydGljbGVEaXN0YW5jZSIsIm1hcElzb3RvcGVzVG9Gb3JjZXMiLCJtYXBJc290b3Blc0lEVG9Jc290b3BlIiwiaXNvdG9wZTEiLCJ0b3RhbEZvcmNlIiwiaiIsImlzb3RvcGUyIiwiZm9yY2VGcm9tSXNvdG9wZSIsImRpc3RhbmNlQmV0d2Vlbklzb3RvcGVzIiwiZGlzdGFuY2UiLCJzZXRQb2xhciIsIm5leHREb3VibGUiLCJNYXRoIiwiUEkiLCJtYXgiLCJtYWduaXR1ZGUiLCJub3JtYWxpemUiLCJtdWx0aXBseSIsImRpc3RhbmNlRnJvbVJpZ2h0V2FsbCIsInJhZGl1cyIsImRpc3RhbmNlRnJvbUxlZnRXYWxsIiwiZGlzdGFuY2VGcm9tVG9wV2FsbCIsImRpc3RhbmNlRnJvbUJvdHRvbVdhbGwiLCJpbnN0YW5jZUNvdW50IiwiaXNvdG9wZUlEIiwiaGFzT3duUHJvcGVydHkiLCJvdmVybGFwRXhpc3RzIiwiZ2VuZXJhdGVSYW5kb21Qb3NpdGlvbiIsImdldFN0YXRlIiwic2V0U3RhdGUiLCJzdGF0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSXNvdG9wZVRlc3RDaGFtYmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENsYXNzIHRoYXQgcmVwcmVzZW50cyBhIFwidGVzdCBjaGFtYmVyXCIgd2hlcmUgbXVsdGlwbGUgaXNvdG9wZXMgY2FuIGJlIHBsYWNlZC4gVGhlIHRlc3QgY2hhbWJlciBjYWxjdWxhdGVzIHRoZVxyXG4gKiBhdmVyYWdlIGF0b21pYyBtYXNzIGFuZCB0aGUgcHJvcG9ydGlvbnMgb2YgdGhlIHZhcmlvdXMgaXNvdG9wZXMuIEl0IGlzIGludGVuZGVkIHRvIGJlIGNvbnRhaW5lZCBpbiB0aGVcclxuICogbWFpbiBtb2RlbCBjbGFzcy5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEphbWVzIFNtaXRoXHJcbiAqIEBhdXRob3IgQWFkaXNoIEd1cHRhXHJcbiAqL1xyXG5cclxuaW1wb3J0IGNyZWF0ZU9ic2VydmFibGVBcnJheSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgUmVjdGFuZ2xlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SZWN0YW5nbGUuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBpc290b3Blc0FuZEF0b21pY01hc3MgZnJvbSAnLi4vLi4vaXNvdG9wZXNBbmRBdG9taWNNYXNzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5cclxuLy8gU2l6ZSBvZiB0aGUgXCJ0ZXN0IGNoYW1iZXJcIiwgd2hpY2ggaXMgdGhlIGFyZWEgaW4gbW9kZWwgc3BhY2UgaW50byB3aGljaCB0aGUgaXNvdG9wZXMgY2FuIGJlIGRyYWdnZWQgaW4gb3JkZXIgdG9cclxuLy8gY29udHJpYnV0ZSB0byB0aGUgY3VycmVudCBhdmVyYWdlIGF0b21pYyB3ZWlnaHQuXHJcbmNvbnN0IFNJWkUgPSBuZXcgRGltZW5zaW9uMiggNDUwLCAyODAgKTsgLy8gSW4gcGljb21ldGVycy5cclxuXHJcbi8vIFJlY3RhbmdsZSB0aGF0IGRlZmluZXMgdGhlIHBvc2l0aW9uIG9mIHRoZSB0ZXN0IGNoYW1iZXIuIFRoaXMgaXMgc2V0IHVwIHNvIHRoYXQgdGhlIGNlbnRlciBvZiB0aGUgdGVzdCBjaGFtYmVyIGlzXHJcbi8vIGF0ICgwLCAwKSBpbiBtb2RlbCBzcGFjZS5cclxuY29uc3QgVEVTVF9DSEFNQkVSX1JFQ1QgPSBuZXcgUmVjdGFuZ2xlKCAtU0laRS53aWR0aCAvIDIsIC1TSVpFLmhlaWdodCAvIDIsIFNJWkUud2lkdGgsIFNJWkUuaGVpZ2h0ICk7XHJcbmNvbnN0IEJVRkZFUiA9IDE7IC8vIGlzb3RvcGVzIHN0cm9rZSBkb2Vzbid0IGNyb3NzIHRoZSB3YWxsLCBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcblxyXG4vKipcclxuICogVXRpbGl0eSBGdW5jdGlvbiB0aGF0IGNvbnRhaW5zIHRoZSBzdGF0ZSBvZiB0aGUgaXNvdG9wZSB0ZXN0IGNoYW1iZXIsIGFuZCBjYW4gYmUgdXNlZCBmb3Igc2F2aW5nIGFuZCBsYXRlciByZXN0b3JpbmdcclxuICogdGhlIHN0YXRlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0lzb3RvcGVUZXN0Q2hhbWJlcn0gaXNvdG9wZVRlc3RDaGFtYmVyXHJcbiAqL1xyXG5mdW5jdGlvbiBTdGF0ZSggaXNvdG9wZVRlc3RDaGFtYmVyICkge1xyXG4gIHRoaXMuY29udGFpbmVkSXNvdG9wZXMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuICBpc290b3BlVGVzdENoYW1iZXIuY29udGFpbmVkSXNvdG9wZXMuZm9yRWFjaCggaXNvdG9wZSA9PiB7XHJcbiAgICB0aGlzLmNvbnRhaW5lZElzb3RvcGVzLmFkZCggaXNvdG9wZSApO1xyXG4gIH0gKTtcclxufVxyXG5cclxuY2xhc3MgSXNvdG9wZVRlc3RDaGFtYmVyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNaXhJc290b3Blc01vZGVsfSBtb2RlbFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCApIHtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7TWl4SXNvdG9wZXNNb2RlbH0gLSBtb2RlbCB0aGF0IGNvbnRhaW5zIHRoaXMgdGVzdCBjaGFtYmVyXHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIHtPYnNlcnZhYmxlQXJyYXlEZWYuPE1vdmFibGVBdG9tPn0gLSBpc290b3BlcyB0aGF0IGFyZSBpbiB0aGlzIHRlc3QgY2hhbWJlclxyXG4gICAgdGhpcy5jb250YWluZWRJc290b3BlcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1JlYWQtT25seX1cclxuICAgIHRoaXMuaXNvdG9wZUNvdW50UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAgKTtcclxuICAgIHRoaXMuYXZlcmFnZUF0b21pY01hc3NQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBudW1iZXIgb2YgaXNvdG9wZXMgY3VycmVudGx5IGluIHRoZSBjaGFtYmVyIHRoYXQgbWF0Y2ggdGhlIHNwZWNpZmllZCBjb25maWd1cmF0aW9uLlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyQXRvbX0gaXNvdG9wZUNvbmZpZ1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IGlzb3RvcGVDb3VudFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRJc290b3BlQ291bnQoIGlzb3RvcGVDb25maWcgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc290b3BlQ29uZmlnLnByb3RvbkNvdW50UHJvcGVydHkuZ2V0KCkgPT09IGlzb3RvcGVDb25maWcuZWxlY3Ryb25Db3VudFByb3BlcnR5LmdldCgpICk7IC8vIFNob3VsZCBhbHdheXMgYmUgbmV1dHJhbCBhdG9tLlxyXG4gICAgbGV0IGlzb3RvcGVDb3VudCA9IDA7XHJcbiAgICB0aGlzLmNvbnRhaW5lZElzb3RvcGVzLmZvckVhY2goIGlzb3RvcGUgPT4ge1xyXG4gICAgICBpZiAoIGlzb3RvcGUuYXRvbUNvbmZpZ3VyYXRpb24uZXF1YWxzKCBpc290b3BlQ29uZmlnICkgKSB7XHJcbiAgICAgICAgaXNvdG9wZUNvdW50Kys7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHJldHVybiBpc290b3BlQ291bnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7UmVjdGFuZ2xlfSBURVNUX0NIQU1CRVJfUkVDVFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRUZXN0Q2hhbWJlclJlY3QoKSB7XHJcbiAgICByZXR1cm4gVEVTVF9DSEFNQkVSX1JFQ1Q7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUZXN0IHdoZXRoZXIgYW4gaXNvdG9wZSBpcyB3aXRoaW4gdGhlIGNoYW1iZXIuIFRoaXMgaXMgc3RyaWN0bHkgYSAyRCB0ZXN0IHRoYXQgbG9va3MgYXMgdGhlIGlzb3RvcGVzIGNlbnRlclxyXG4gICAqIHBvc2l0aW9uIGFuZCBkZXRlcm1pbmVzIGlmIGl0IGlzIHdpdGhpbiB0aGUgYm91bmRzIG9mIHRoZSBjaGFtYmVyIHJlY3RhbmdsZS5cclxuICAgKiBAcGFyYW0ge01vdmFibGVBdG9tfSBpc290b3BlXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGlzSXNvdG9wZVBvc2l0aW9uZWRPdmVyQ2hhbWJlciggaXNvdG9wZSApIHtcclxuICAgIHJldHVybiBURVNUX0NIQU1CRVJfUkVDVC5jb250YWluc1BvaW50KCBpc290b3BlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCB0aGUgc3BlY2lmaWVkIGlzb3RvcGUgdG8gdGhlIGNoYW1iZXIuIFRoaXMgbWV0aG9kIHJlcXVpcmVzIHRoYXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBpc290b3BlIGJlIHdpdGhpbiB0aGVcclxuICAgKiBjaGFtYmVyIHJlY3RhbmdsZSwgb3IgdGhlIGlzb3RvcGUgd2lsbCBub3QgYmUgYWRkZWQuXHJcbiAgICpcclxuICAgKiBJbiBjYXNlcyB3aGVyZSBhbiBpc290b3BlIGlzIGluIGEgcG9zaXRpb24gd2hlcmUgdGhlIGNlbnRlciBpcyB3aXRoaW4gdGhlIGNoYW1iZXIgYnV0IHRoZSBlZGdlcyBhcmUgbm90LCB0aGVcclxuICAgKiBpc290b3BlIHdpbGwgYmUgbW92ZWQgc28gdGhhdCBpdCBpcyBmdWxseSBjb250YWluZWQgd2l0aGluIHRoZSBjaGFtYmVyLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNb3ZhYmxlQXRvbX0gaXNvdG9wZVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gcGVyZm9ybVVwZGF0ZXMgLSBGbGFnIHRoYXQgY2FuIGJlIHNldCBiZSB1c2VkIHRvIHN1cHByZXNzIHVwZGF0ZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkZElzb3RvcGVUb0NoYW1iZXIoIGlzb3RvcGUsIHBlcmZvcm1VcGRhdGVzICkge1xyXG4gICAgaWYgKCB0aGlzLmlzSXNvdG9wZVBvc2l0aW9uZWRPdmVyQ2hhbWJlciggaXNvdG9wZSApICkge1xyXG4gICAgICB0aGlzLmNvbnRhaW5lZElzb3RvcGVzLnB1c2goIGlzb3RvcGUgKTtcclxuXHJcbiAgICAgIGNvbnN0IGlzb3RvcGVSZW1vdmVkTGlzdGVuZXIgPSB1c2VyQ29udHJvbGxlZCA9PiB7XHJcbiAgICAgICAgaWYgKCB1c2VyQ29udHJvbGxlZCAmJiB0aGlzLmNvbnRhaW5lZElzb3RvcGVzLmluY2x1ZGVzKCBpc290b3BlICkgKSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZUlzb3RvcGVGcm9tQ2hhbWJlciggaXNvdG9wZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpc290b3BlLnVzZXJDb250cm9sbGVkUHJvcGVydHkudW5saW5rKCBpc290b3BlUmVtb3ZlZExpc3RlbmVyICk7XHJcbiAgICAgIH07XHJcbiAgICAgIGlzb3RvcGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5sYXp5TGluayggaXNvdG9wZVJlbW92ZWRMaXN0ZW5lciApO1xyXG5cclxuICAgICAgLy8gSWYgdGhlIGVkZ2VzIG9mIHRoZSBpc290b3BlIGFyZSBvdXRzaWRlIG9mIHRoZSBjb250YWluZXIsIG1vdmUgaXQgdG8gYmUgZnVsbHkgaW5zaWRlLlxyXG4gICAgICBsZXQgcHJvdHJ1c2lvbiA9IGlzb3RvcGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ICsgaXNvdG9wZS5yYWRpdXNQcm9wZXJ0eS5nZXQoKSAtIFRFU1RfQ0hBTUJFUl9SRUNULm1heFggKyBCVUZGRVI7XHJcbiAgICAgIGlmICggcHJvdHJ1c2lvbiA+PSAwICkge1xyXG4gICAgICAgIGlzb3RvcGUuc2V0UG9zaXRpb25BbmREZXN0aW5hdGlvbiggbmV3IFZlY3RvcjIoIGlzb3RvcGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54IC0gcHJvdHJ1c2lvbixcclxuICAgICAgICAgIGlzb3RvcGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55ICkgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBwcm90cnVzaW9uID0gVEVTVF9DSEFNQkVSX1JFQ1QubWluWCArIEJVRkZFUiAtICggaXNvdG9wZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLnggLSBpc290b3BlLnJhZGl1c1Byb3BlcnR5LmdldCgpICk7XHJcbiAgICAgICAgaWYgKCBwcm90cnVzaW9uID49IDAgKSB7XHJcbiAgICAgICAgICBpc290b3BlLnNldFBvc2l0aW9uQW5kRGVzdGluYXRpb24oIG5ldyBWZWN0b3IyKCBpc290b3BlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCArIHByb3RydXNpb24sXHJcbiAgICAgICAgICAgIGlzb3RvcGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcHJvdHJ1c2lvbiA9IGlzb3RvcGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55ICsgaXNvdG9wZS5yYWRpdXNQcm9wZXJ0eS5nZXQoKSAtIFRFU1RfQ0hBTUJFUl9SRUNULm1heFkgKyBCVUZGRVI7XHJcbiAgICAgIGlmICggcHJvdHJ1c2lvbiA+PSAwICkge1xyXG4gICAgICAgIGlzb3RvcGUuc2V0UG9zaXRpb25BbmREZXN0aW5hdGlvbiggbmV3IFZlY3RvcjIoIGlzb3RvcGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54LFxyXG4gICAgICAgICAgaXNvdG9wZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLnkgLSBwcm90cnVzaW9uICkgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBwcm90cnVzaW9uID0gVEVTVF9DSEFNQkVSX1JFQ1QubWluWSArIEJVRkZFUiAtICggaXNvdG9wZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLnkgLSBpc290b3BlLnJhZGl1c1Byb3BlcnR5LmdldCgpICk7XHJcbiAgICAgICAgaWYgKCBwcm90cnVzaW9uID49IDAgKSB7XHJcbiAgICAgICAgICBpc290b3BlLnNldFBvc2l0aW9uQW5kRGVzdGluYXRpb24oIG5ldyBWZWN0b3IyKCBpc290b3BlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCxcclxuICAgICAgICAgICAgaXNvdG9wZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLnkgKyBwcm90cnVzaW9uICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBwZXJmb3JtVXBkYXRlcyApIHtcclxuICAgICAgICAvLyBVcGRhdGUgdGhlIGlzb3RvcGUgY291bnQuXHJcbiAgICAgICAgdGhpcy51cGRhdGVDb3VudFByb3BlcnR5KCk7XHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBhdmVyYWdlIGF0b21pYyBtYXNzLlxyXG4gICAgICAgIHRoaXMuYXZlcmFnZUF0b21pY01hc3NQcm9wZXJ0eS5zZXQoICggKCB0aGlzLmF2ZXJhZ2VBdG9taWNNYXNzUHJvcGVydHkuZ2V0KCkgKlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIHRoaXMuaXNvdG9wZUNvdW50UHJvcGVydHkuZ2V0KCkgLSAxICkgKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc290b3BlLmF0b21Db25maWd1cmF0aW9uLmdldElzb3RvcGVBdG9taWNNYXNzKCkgKSAvIHRoaXMuaXNvdG9wZUNvdW50UHJvcGVydHkuZ2V0KCkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIFRoaXMgaXNvdG9wZSBpcyBub3QgcG9zaXRpb25lZCBjb3JyZWN0bHkuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnSWdub3JpbmcgYXR0ZW1wdCB0byBhZGQgaW5jb3JyZWN0bHkgbG9jYXRlZCBpc290b3BlIHRvIHRlc3QgY2hhbWJlci4nICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgbGlzdCBvZiBpc290b3BlcyB0byB0aGUgdGVzdCBjaGFtYmVyLiBTYW1lIHJlc3RyaWN0aW9ucyBhcyBhYm92ZS5cclxuICAgKiBAcGFyYW0ge01vdmFibGVBdG9tW119IGlzb3RvcGVMaXN0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGJ1bGtBZGRJc290b3Blc1RvQ2hhbWJlciggaXNvdG9wZUxpc3QgKSB7XHJcbiAgICBpc290b3BlTGlzdC5mb3JFYWNoKCBpc290b3BlID0+IHtcclxuICAgICAgdGhpcy5hZGRJc290b3BlVG9DaGFtYmVyKCBpc290b3BlLCBmYWxzZSApO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy51cGRhdGVDb3VudFByb3BlcnR5KCk7XHJcbiAgICB0aGlzLnVwZGF0ZUF2ZXJhZ2VBdG9taWNNYXNzUHJvcGVydHkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlbmllbmNlIGZ1bmN0aW9uIHRvIHNldCB0aGUgaXNvdG9wZUNvdW50IHByb3BlcnR5IGVxdWFsIHRvIHRoZSBudW1iZXIgb2YgaXNvdG9wZXMgY29udGFpbmVkIGluIHRoaXMgdGVzdCBjaGFtYmVyLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlQ291bnRQcm9wZXJ0eSgpIHtcclxuICAgIHRoaXMuaXNvdG9wZUNvdW50UHJvcGVydHkuc2V0KCB0aGlzLmNvbnRhaW5lZElzb3RvcGVzLmxlbmd0aCApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICB1cGRhdGVBdmVyYWdlQXRvbWljTWFzc1Byb3BlcnR5KCkge1xyXG4gICAgaWYgKCB0aGlzLmNvbnRhaW5lZElzb3RvcGVzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgIGxldCB0b3RhbE1hc3MgPSAwO1xyXG4gICAgICB0aGlzLmNvbnRhaW5lZElzb3RvcGVzLmZvckVhY2goIGlzb3RvcGUgPT4ge1xyXG4gICAgICAgIHRvdGFsTWFzcyArPSBpc290b3BlLmF0b21Db25maWd1cmF0aW9uLmdldElzb3RvcGVBdG9taWNNYXNzKCk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMuYXZlcmFnZUF0b21pY01hc3NQcm9wZXJ0eS5zZXQoIHRvdGFsTWFzcyAvIHRoaXMuY29udGFpbmVkSXNvdG9wZXMubGVuZ3RoICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5hdmVyYWdlQXRvbWljTWFzc1Byb3BlcnR5LnNldCggMCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNb3ZhYmxlQXRvbX0gaXNvdG9wZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZW1vdmVJc290b3BlRnJvbUNoYW1iZXIoIGlzb3RvcGUgKSB7XHJcbiAgICB0aGlzLmNvbnRhaW5lZElzb3RvcGVzLnJlbW92ZSggaXNvdG9wZSApO1xyXG4gICAgdGhpcy51cGRhdGVDb3VudFByb3BlcnR5KCk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBhdmVyYWdlIGF0b21pYyBtYXNzLlxyXG4gICAgaWYgKCB0aGlzLmlzb3RvcGVDb3VudFByb3BlcnR5LmdldCgpID4gMCApIHtcclxuICAgICAgdGhpcy5hdmVyYWdlQXRvbWljTWFzc1Byb3BlcnR5LnNldCggKCB0aGlzLmF2ZXJhZ2VBdG9taWNNYXNzUHJvcGVydHkuZ2V0KCkgKiAoIHRoaXMuaXNvdG9wZUNvdW50UHJvcGVydHkuZ2V0KCkgKyAxICkgLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzb3RvcGUuYXRvbUNvbmZpZ3VyYXRpb24uZ2V0SXNvdG9wZUF0b21pY01hc3MoKSApIC8gdGhpcy5pc290b3BlQ291bnRQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuYXZlcmFnZUF0b21pY01hc3NQcm9wZXJ0eS5zZXQoIDAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBhbiBpc290b3BlIGZyb20gdGhlIGNoYW1iZXIgdGhhdCBtYXRjaGVzIHRoZSBzcGVjaWZpZWQgYXRvbSBjb25maWd1cmF0aW9uLiBOb3RlIHRoYXQgZWxlY3Ryb25zIGFyZSBpZ25vcmVkLlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyQXRvbX0gaXNvdG9wZUNvbmZpZ1xyXG4gICAqIEByZXR1cm5zIHtNb3ZhYmxlQXRvbX0gcmVtb3ZlZElzb3RvcGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVtb3ZlSXNvdG9wZU1hdGNoaW5nQ29uZmlnKCBpc290b3BlQ29uZmlnICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggKCBpc290b3BlQ29uZmlnLnByb3RvbkNvdW50UHJvcGVydHkuZ2V0KCkgLSBpc290b3BlQ29uZmlnLmVsZWN0cm9uQ291bnRQcm9wZXJ0eS5nZXQoKSApID09PSAwICk7XHJcblxyXG4gICAgLy8gTG9jYXRlIGFuZCByZW1vdmUgYSBtYXRjaGluZyBpc290b3BlLlxyXG4gICAgbGV0IHJlbW92ZWRJc290b3BlID0gbnVsbDtcclxuICAgIHRoaXMuY29udGFpbmVkSXNvdG9wZXMuZm9yRWFjaCggaXNvdG9wZSA9PiB7XHJcbiAgICAgIGlmICggaXNvdG9wZS5hdG9tQ29uZmlndXJhdGlvbi5lcXVhbHMoIGlzb3RvcGVDb25maWcgKSApIHtcclxuICAgICAgICByZW1vdmVkSXNvdG9wZSA9IGlzb3RvcGU7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHRoaXMucmVtb3ZlSXNvdG9wZUZyb21DaGFtYmVyKCByZW1vdmVkSXNvdG9wZSApO1xyXG4gICAgcmV0dXJuIHJlbW92ZWRJc290b3BlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhbGwgaXNvdG9wZXNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVtb3ZlQWxsSXNvdG9wZXMoKSB7XHJcbiAgICB0aGlzLmNvbnRhaW5lZElzb3RvcGVzLmNsZWFyKCk7XHJcbiAgICB0aGlzLnVwZGF0ZUNvdW50UHJvcGVydHkoKTtcclxuICAgIHRoaXMuYXZlcmFnZUF0b21pY01hc3NQcm9wZXJ0eS5zZXQoIDAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGNvbnRhaW5lZElzb3RvcGVzLlxyXG4gICAqIEByZXR1cm5zIHtPYnNlcnZhYmxlQXJyYXlEZWZ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldENvbnRhaW5lZElzb3RvcGVzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY29udGFpbmVkSXNvdG9wZXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBjb3VudCBvZiB0aGUgdG90YWwgbnVtYmVyIG9mIGlzb3RvcGVzIGluIHRoZSBjaGFtYmVyLlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFRvdGFsSXNvdG9wZUNvdW50KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNvdG9wZUNvdW50UHJvcGVydHkuZ2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHByb3BvcnRpb24gb2YgaXNvdG9wZXMgY3VycmVudGx5IHdpdGhpbiB0aGUgY2hhbWJlciB0aGF0IG1hdGNoIHRoZSBzcGVjaWZpZWQgY29uZmlndXJhdGlvbi5cclxuICAgKiBAcGFyYW0ge051bWJlckF0b219IGlzb3RvcGVDb25maWdcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBpc290b3BlUHJvcG9ydGlvblxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRJc290b3BlUHJvcG9ydGlvbiggaXNvdG9wZUNvbmZpZyApIHtcclxuICAgIC8vIENhbGN1bGF0ZXMgY2hhcmdlIHRvIGVuc3VyZSB0aGF0IGlzb3RvcGVzIGFyZSBuZXV0cmFsLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNvdG9wZUNvbmZpZy5wcm90b25Db3VudFByb3BlcnR5LmdldCgpIC0gaXNvdG9wZUNvbmZpZy5lbGVjdHJvbkNvdW50UHJvcGVydHkuZ2V0KCkgPT09IDAgKTtcclxuICAgIGxldCBpc290b3BlQ291bnQgPSAwO1xyXG5cclxuICAgIHRoaXMuY29udGFpbmVkSXNvdG9wZXMuZm9yRWFjaCggaXNvdG9wZSA9PiB7XHJcbiAgICAgIGlmICggaXNvdG9wZUNvbmZpZy5lcXVhbHMoIGlzb3RvcGUuYXRvbUNvbmZpZ3VyYXRpb24gKSApIHtcclxuICAgICAgICBpc290b3BlQ291bnQrKztcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBpc290b3BlQ291bnQgLyB0aGlzLmNvbnRhaW5lZElzb3RvcGVzLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmUgYWxsIHRoZSBwYXJ0aWNsZXMgaW4gdGhlIGNoYW1iZXIgc3VjaCB0aGF0IHRoZXkgZG9uJ3Qgb3ZlcmxhcC4gVGhpcyBpcyBpbnRlbmRlZCBmb3IgdXNhZ2Ugd2hlcmUgdGhlcmUgYXJlIG5vdFxyXG4gICAqIGEgbG90IG9mIHBhcnRpY2xlcyBpbiB0aGUgY2hhbWJlci4gVXNpbmcgaXQgaW4gY2FzZXMgd2hlcmUgdGhlcmUgYXJlIGEgbG9zdCBvZiBwYXJ0aWNsZXMgY291bGQgdGFrZSBhIHZlcnkgbG9uZyB0aW1lLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZGp1c3RGb3JPdmVybGFwKCkge1xyXG5cclxuICAgIC8vIEJvdW5kcyBjaGVja2luZy4gIFRoZSB0aHJlc2hvbGQgaXMgcHJldHR5IG11Y2ggYXJiaXRyYXJ5LlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgICAgdGhpcy5nZXRUb3RhbElzb3RvcGVDb3VudCgpIDw9IDEwMCxcclxuICAgICAgJ0lnbm9yaW5nIHJlcXVlc3QgdG8gYWRqdXN0IGZvciBvdmVybGFwIC0gdG9vIG1hbnkgcGFydGljbGVzIGluIHRoZSBjaGFtYmVyIGZvciB0aGF0J1xyXG4gICAgKTtcclxuXHJcbiAgICAvLyBDaGVjayBmb3Igb3ZlcmxhcCBhbmQgYWRqdXN0IHBhcnRpY2xlIHBvc2l0aW9ucyB1bnRpbCBub25lIGV4aXN0cy5cclxuICAgIGNvbnN0IG1heEl0ZXJhdGlvbnMgPSAxMDAwMDsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgZm9yICggbGV0IGkgPSAwOyB0aGlzLmNoZWNrRm9yUGFydGljbGVPdmVybGFwKCkgJiYgaSA8IG1heEl0ZXJhdGlvbnM7IGkrKyApIHtcclxuXHJcbiAgICAgIC8vIEFkanVzdG1lbnQgZmFjdG9ycyBmb3IgdGhlIHJlcG9zaXRpb25pbmcgYWxnb3JpdGhtLCB0aGVzZSBjYW4gYmUgY2hhbmdlZCBmb3IgZGlmZmVyZW50IGJlaGF2aW91ci5cclxuICAgICAgY29uc3QgaW50ZXJQYXJ0aWNsZUZvcmNlQ29uc3QgPSAyMDA7XHJcbiAgICAgIGNvbnN0IHdhbGxGb3JjZUNvbnN0ID0gaW50ZXJQYXJ0aWNsZUZvcmNlQ29uc3QgKiAxMDtcclxuICAgICAgY29uc3QgbWluSW50ZXJQYXJ0aWNsZURpc3RhbmNlID0gNTtcclxuICAgICAgY29uc3QgbWFwSXNvdG9wZXNUb0ZvcmNlcyA9IHt9O1xyXG4gICAgICBjb25zdCBtYXBJc290b3Blc0lEVG9Jc290b3BlID0ge307XHJcblxyXG4gICAgICB0aGlzLmNvbnRhaW5lZElzb3RvcGVzLmZvckVhY2goIGlzb3RvcGUxID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgdG90YWxGb3JjZSA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgZm9yY2UgZHVlIHRvIG90aGVyIGlzb3RvcGVzLlxyXG4gICAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMuY29udGFpbmVkSXNvdG9wZXMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgICBjb25zdCBpc290b3BlMiA9IHRoaXMuY29udGFpbmVkSXNvdG9wZXMuZ2V0KCBqICk7XHJcbiAgICAgICAgICBpZiAoIGlzb3RvcGUxID09PSBpc290b3BlMiApIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3QgZm9yY2VGcm9tSXNvdG9wZSA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgICAgICAgICBjb25zdCBkaXN0YW5jZUJldHdlZW5Jc290b3BlcyA9IGlzb3RvcGUxLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZGlzdGFuY2UoIGlzb3RvcGUyLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgICAgICAgIGlmICggZGlzdGFuY2VCZXR3ZWVuSXNvdG9wZXMgPT09IDAgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGVzZSBpc290b3BlcyBhcmUgc2l0dGluZyByaWdodCBvbiB0b3Agb2Ygb25lIGFub3RoZXIuICBBZGQgdGhlIG1heCBhbW91bnQgb2YgaW50ZXItcGFydGljbGUgZm9yY2UgaW4gYVxyXG4gICAgICAgICAgICAvLyByYW5kb20gZGlyZWN0aW9uLlxyXG4gICAgICAgICAgICBmb3JjZUZyb21Jc290b3BlLnNldFBvbGFyKCBpbnRlclBhcnRpY2xlRm9yY2VDb25zdCAvICggbWluSW50ZXJQYXJ0aWNsZURpc3RhbmNlICogbWluSW50ZXJQYXJ0aWNsZURpc3RhbmNlICksXHJcbiAgICAgICAgICAgICAgZG90UmFuZG9tLm5leHREb3VibGUoKSAqIDIgKiBNYXRoLlBJICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggZGlzdGFuY2VCZXR3ZWVuSXNvdG9wZXMgPCBpc290b3BlMS5yYWRpdXNQcm9wZXJ0eS5nZXQoKSArIGlzb3RvcGUyLnJhZGl1c1Byb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgdGhlIHJlcHVsc2l2ZSBmb3JjZSBiYXNlZCBvbiB0aGUgZGlzdGFuY2UuXHJcbiAgICAgICAgICAgIGZvcmNlRnJvbUlzb3RvcGUueCA9IGlzb3RvcGUxLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCAtIGlzb3RvcGUyLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueDtcclxuICAgICAgICAgICAgZm9yY2VGcm9tSXNvdG9wZS55ID0gaXNvdG9wZTEucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55IC0gaXNvdG9wZTIucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55O1xyXG4gICAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGgubWF4KCBmb3JjZUZyb21Jc290b3BlLm1hZ25pdHVkZSwgbWluSW50ZXJQYXJ0aWNsZURpc3RhbmNlICk7XHJcbiAgICAgICAgICAgIGZvcmNlRnJvbUlzb3RvcGUubm9ybWFsaXplKCk7XHJcbiAgICAgICAgICAgIGZvcmNlRnJvbUlzb3RvcGUubXVsdGlwbHkoIGludGVyUGFydGljbGVGb3JjZUNvbnN0IC8gKCBkaXN0YW5jZSAqIGRpc3RhbmNlICkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRvdGFsRm9yY2UuYWRkKCBmb3JjZUZyb21Jc290b3BlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGZvcmNlIGR1ZSB0byB0aGUgd2FsbHMuIFRoaXMgcHJldmVudHMgcGFydGljbGVzIGZyb20gYmVpbmcgcHVzaGVkIG91dCBvZiB0aGUgYm91bmRzIG9mIHRoZSBjaGFtYmVyLlxyXG4gICAgICAgIGlmICggaXNvdG9wZTEucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ICsgaXNvdG9wZTEucmFkaXVzUHJvcGVydHkuZ2V0KCkgPj0gVEVTVF9DSEFNQkVSX1JFQ1QubWF4WCApIHtcclxuICAgICAgICAgIGNvbnN0IGRpc3RhbmNlRnJvbVJpZ2h0V2FsbCA9IFRFU1RfQ0hBTUJFUl9SRUNULm1heFggLSBpc290b3BlMS5wb3NpdGlvblByb3BlcnR5LmdldCgpLng7XHJcbiAgICAgICAgICB0b3RhbEZvcmNlLmFkZCggbmV3IFZlY3RvcjIoIC13YWxsRm9yY2VDb25zdCAvICggZGlzdGFuY2VGcm9tUmlnaHRXYWxsICogZGlzdGFuY2VGcm9tUmlnaHRXYWxsICksIDAgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggaXNvdG9wZTEucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54IC0gaXNvdG9wZTEucmFkaXVzIDw9IFRFU1RfQ0hBTUJFUl9SRUNULm1pblggKSB7XHJcbiAgICAgICAgICBjb25zdCBkaXN0YW5jZUZyb21MZWZ0V2FsbCA9IGlzb3RvcGUxLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCAtIFRFU1RfQ0hBTUJFUl9SRUNULm1pblg7XHJcbiAgICAgICAgICB0b3RhbEZvcmNlLmFkZCggbmV3IFZlY3RvcjIoIHdhbGxGb3JjZUNvbnN0IC8gKCBkaXN0YW5jZUZyb21MZWZ0V2FsbCAqIGRpc3RhbmNlRnJvbUxlZnRXYWxsICksIDAgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGlzb3RvcGUxLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueSArIGlzb3RvcGUxLnJhZGl1c1Byb3BlcnR5LmdldCgpID49IFRFU1RfQ0hBTUJFUl9SRUNULm1heFkgKSB7XHJcbiAgICAgICAgICBjb25zdCBkaXN0YW5jZUZyb21Ub3BXYWxsID0gVEVTVF9DSEFNQkVSX1JFQ1QubWF4WSAtIGlzb3RvcGUxLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueTtcclxuICAgICAgICAgIHRvdGFsRm9yY2UuYWRkKCBuZXcgVmVjdG9yMiggMCwgLXdhbGxGb3JjZUNvbnN0IC8gKCBkaXN0YW5jZUZyb21Ub3BXYWxsICogZGlzdGFuY2VGcm9tVG9wV2FsbCApICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGlzb3RvcGUxLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueSAtIGlzb3RvcGUxLnJhZGl1c1Byb3BlcnR5LmdldCgpIDw9IFRFU1RfQ0hBTUJFUl9SRUNULm1pblkgKSB7XHJcbiAgICAgICAgICBjb25zdCBkaXN0YW5jZUZyb21Cb3R0b21XYWxsID0gaXNvdG9wZTEucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55IC0gVEVTVF9DSEFNQkVSX1JFQ1QubWluWTtcclxuICAgICAgICAgIHRvdGFsRm9yY2UuYWRkKCBuZXcgVmVjdG9yMiggMCwgd2FsbEZvcmNlQ29uc3QgLyAoIGRpc3RhbmNlRnJvbUJvdHRvbVdhbGwgKiBkaXN0YW5jZUZyb21Cb3R0b21XYWxsICkgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBQdXQgdGhlIGNhbGN1bGF0ZWQgcmVwdWxzaXZlIGZvcmNlIGludG8gdGhlIG1hcC5cclxuICAgICAgICBtYXBJc290b3Blc1RvRm9yY2VzWyBpc290b3BlMS5pbnN0YW5jZUNvdW50IF0gPSB0b3RhbEZvcmNlO1xyXG4gICAgICAgIG1hcElzb3RvcGVzSURUb0lzb3RvcGVbIGlzb3RvcGUxLmluc3RhbmNlQ291bnQgXSA9IGlzb3RvcGUxO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBBZGp1c3QgdGhlIHBhcnRpY2xlIHBvc2l0aW9ucyBiYXNlZCBvbiBmb3JjZXMuXHJcbiAgICAgIGZvciAoIGNvbnN0IGlzb3RvcGVJRCBpbiBtYXBJc290b3Blc1RvRm9yY2VzICkge1xyXG4gICAgICAgIGlmICggbWFwSXNvdG9wZXNUb0ZvcmNlcy5oYXNPd25Qcm9wZXJ0eSggaXNvdG9wZUlEICkgKSB7XHJcbiAgICAgICAgICAvLyBTZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgaXNvdG9wZSB0byB0aGUgY29ycmVzcG9uZGluZyBWZWN0b3IyIGZyb20gbWFwSXNvdG9wZXNUb0ZvcmNlc1xyXG4gICAgICAgICAgbWFwSXNvdG9wZXNJRFRvSXNvdG9wZVsgaXNvdG9wZUlEIF1cclxuICAgICAgICAgICAgLnNldFBvc2l0aW9uQW5kRGVzdGluYXRpb24oIG1hcElzb3RvcGVzVG9Gb3JjZXNbIGlzb3RvcGVJRCBdLmFkZCggbWFwSXNvdG9wZXNJRFRvSXNvdG9wZVsgaXNvdG9wZUlEIF0ucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHRvIGVuc3VyZSB0aGF0IHBhcnRpY2xlcyBhcmUgbm90IG92ZXJsYXBwZWQuXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjaGVja0ZvclBhcnRpY2xlT3ZlcmxhcCgpIHtcclxuICAgIGxldCBvdmVybGFwRXhpc3RzID0gZmFsc2U7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5jb250YWluZWRJc290b3Blcy5sZW5ndGggJiYgIW92ZXJsYXBFeGlzdHM7IGkrKyApIHtcclxuICAgICAgY29uc3QgaXNvdG9wZTEgPSB0aGlzLmNvbnRhaW5lZElzb3RvcGVzLmdldCggaSApO1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLmNvbnRhaW5lZElzb3RvcGVzLmxlbmd0aCAmJiAhb3ZlcmxhcEV4aXN0czsgaisrICkge1xyXG4gICAgICAgIGNvbnN0IGlzb3RvcGUyID0gdGhpcy5jb250YWluZWRJc290b3Blcy5nZXQoIGogKTtcclxuICAgICAgICBpZiAoIGlzb3RvcGUxID09PSBpc290b3BlMiApIHtcclxuXHJcbiAgICAgICAgICAvLyBTYW1lIGlzb3RvcGUsIHNvIHNraXAgaXQuXHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gaXNvdG9wZTEucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5kaXN0YW5jZSggaXNvdG9wZTIucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgICAgIGlmICggZGlzdGFuY2UgPCBpc290b3BlMS5yYWRpdXNQcm9wZXJ0eS5nZXQoKSArIGlzb3RvcGUyLnJhZGl1c1Byb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgICAgb3ZlcmxhcEV4aXN0cyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG92ZXJsYXBFeGlzdHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZW5lcmF0ZSBhIHJhbmRvbSBwb3NpdGlvbiB3aXRoaW4gdGhlIHRlc3QgY2hhbWJlci5cclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2VuZXJhdGVSYW5kb21Qb3NpdGlvbigpIHtcclxuICAgIHJldHVybiBuZXcgVmVjdG9yMihcclxuICAgICAgVEVTVF9DSEFNQkVSX1JFQ1QubWluWCArIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgKiBURVNUX0NIQU1CRVJfUkVDVC53aWR0aCxcclxuICAgICAgVEVTVF9DSEFNQkVSX1JFQ1QubWluWSArIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgKiBURVNUX0NIQU1CRVJfUkVDVC5oZWlnaHQgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBnZXRTdGF0ZSgpIHtcclxuICAgIHJldHVybiBuZXcgU3RhdGUoIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3RvcmUgYSBwcmV2aW91c2x5IGNhcHR1cmVkIHN0YXRlLlxyXG4gICAqIEBwYXJhbSB7U3RhdGV9IHN0YXRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFN0YXRlKCBzdGF0ZSApIHtcclxuICAgIHRoaXMucmVtb3ZlQWxsSXNvdG9wZXMoIHRydWUgKTtcclxuICAgIHRoaXMuYnVsa0FkZElzb3RvcGVzVG9DaGFtYmVyKCBzdGF0ZS5jb250YWluZWRJc290b3BlcyApO1xyXG4gIH1cclxufVxyXG5cclxuaXNvdG9wZXNBbmRBdG9taWNNYXNzLnJlZ2lzdGVyKCAnSXNvdG9wZVRlc3RDaGFtYmVyJywgSXNvdG9wZVRlc3RDaGFtYmVyICk7XHJcbmV4cG9ydCBkZWZhdWx0IElzb3RvcGVUZXN0Q2hhbWJlcjtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFCLE1BQU0sOENBQThDO0FBQ2hGLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxxQkFBcUIsTUFBTSxnQ0FBZ0M7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