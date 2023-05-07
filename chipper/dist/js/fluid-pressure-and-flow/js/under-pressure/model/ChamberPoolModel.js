// Copyright 2013-2020, University of Colorado Boulder

/**
 * Model for the Chamber Pool screen of Under Pressure sim.
 * Models the chamber shape and stack of masses that can be dropped in the chamber.
 *
 * @author Vasily Shakhov (Mlearner)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Constants from '../../common/Constants.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
import MassModel from './MassModel.js';

// constants
// empirically determined to match the visual appearance from design document

//The size of the passage between the chambers
const PASSAGE_SIZE = 0.5;

//Width of the right opening to the air
const RIGHT_OPENING_WIDTH = 2.3;

//Width of the left opening to the air
const LEFT_OPENING_WIDTH = 0.5;

//Height of each chamber, physics not working properly to vary these independently
const CHAMBER_HEIGHT = 1.3;

//left chamber start x
const LEFT_CHAMBER_X = 1.55;
const LEFT_CHAMBER_WIDTH = 2.8;

//right(bottom) chamber start x
const RIGHT_CHAMBER_X = 6.27;
const RIGHT_CHAMBER_WIDTH = 1.1;
const MASS_OFFSET = 1.35; // start x-coordinate of first mass
const SEPARATION = 0.03; //separation between masses

const DEFAULT_HEIGHT = 2.3; //meters, without load

//The entire apparatus is this tall
const MAX_HEIGHT = Constants.MAX_POOL_HEIGHT; // meters

class ChamberPoolModel {
  /**
   * @param {UnderPressureModel} underPressureModel
   */
  constructor(underPressureModel) {
    this.leftDisplacementProperty = new Property(0); //displacement from default height
    this.stackMassProperty = new Property(0);

    // @public (read-only)
    this.volumeProperty = new Property(1); // TODO: what should this number be?  Does it even matter?  I don't think it has any bearing on the model.

    this.underPressureModel = underPressureModel;

    //Use the length ratio instead of area ratio because the quadratic factor makes it too hard to see the
    // water move on the right, and decreases the pressure effect too much to see it
    this.lengthRatio = RIGHT_OPENING_WIDTH / LEFT_OPENING_WIDTH; // @public

    //default left opening water height
    this.leftWaterHeight = DEFAULT_HEIGHT - CHAMBER_HEIGHT; // @public

    //masses can't have y-coord more that this, sky height - grass height
    this.maxY = 0.05; // @public

    // @public
    this.poolDimensions = {
      leftChamber: {
        x1: LEFT_CHAMBER_X,
        y1: -(MAX_HEIGHT - CHAMBER_HEIGHT),
        x2: LEFT_CHAMBER_X + LEFT_CHAMBER_WIDTH,
        y2: -MAX_HEIGHT
      },
      rightChamber: {
        x1: RIGHT_CHAMBER_X,
        y1: -(MAX_HEIGHT - CHAMBER_HEIGHT),
        x2: RIGHT_CHAMBER_X + RIGHT_CHAMBER_WIDTH,
        y2: -MAX_HEIGHT
      },
      horizontalPassage: {
        x1: LEFT_CHAMBER_X + LEFT_CHAMBER_WIDTH,
        y1: -(MAX_HEIGHT - PASSAGE_SIZE * 3 / 2),
        x2: RIGHT_CHAMBER_X,
        y2: -(MAX_HEIGHT - PASSAGE_SIZE / 2)
      },
      leftOpening: {
        x1: LEFT_CHAMBER_X + LEFT_CHAMBER_WIDTH / 2 - LEFT_OPENING_WIDTH / 2,
        y1: 0,
        x2: LEFT_CHAMBER_X + LEFT_CHAMBER_WIDTH / 2 + LEFT_OPENING_WIDTH / 2,
        y2: -(MAX_HEIGHT - CHAMBER_HEIGHT)
      },
      rightOpening: {
        x1: RIGHT_CHAMBER_X + RIGHT_CHAMBER_WIDTH / 2 - RIGHT_OPENING_WIDTH / 2,
        y1: 0,
        x2: RIGHT_CHAMBER_X + RIGHT_CHAMBER_WIDTH / 2 + RIGHT_OPENING_WIDTH / 2,
        y2: -(MAX_HEIGHT - CHAMBER_HEIGHT)
      }
    };

    //List of masses that are currently stacked
    this.stack = createObservableArray(); // @public

    // @public
    //List of all available masses
    this.masses = [new MassModel(this, 500, MASS_OFFSET, this.maxY + PASSAGE_SIZE / 2, PASSAGE_SIZE, PASSAGE_SIZE), new MassModel(this, 250, MASS_OFFSET + PASSAGE_SIZE + SEPARATION, this.maxY + PASSAGE_SIZE / 4, PASSAGE_SIZE, PASSAGE_SIZE / 2), new MassModel(this, 250, MASS_OFFSET + 2 * PASSAGE_SIZE + 2 * SEPARATION, this.maxY + PASSAGE_SIZE / 4, PASSAGE_SIZE, PASSAGE_SIZE / 2)];

    //When an item is added to the stack, update the total mass and equalize the mass velocities
    this.stack.addItemAddedListener(massModel => {
      this.stackMassProperty.value = this.stackMassProperty.value + massModel.mass;
      let maxVelocity = 0;

      //must equalize velocity of each mass
      this.stack.forEach(mass => {
        maxVelocity = Math.max(mass.velocity, maxVelocity);
      });
      this.stack.forEach(mass => {
        mass.velocity = maxVelocity;
      });
    });

    //When an item is removed from the stack, update the total mass.
    this.stack.addItemRemovedListener(massModel => {
      this.stackMassProperty.value = this.stackMassProperty.value - massModel.mass;
    });
    this.leftDisplacementProperty.link(() => {
      // update all barometers
      _.each(underPressureModel.barometers, barometer => {
        barometer.updateEmitter.emit();
      });
    });
  }

  // @public
  reset() {
    this.stack.clear();
    this.leftDisplacementProperty.reset();
    this.stackMassProperty.reset();
    this.masses.forEach(mass => {
      mass.reset();
    });
  }

  /**
   * @public
   * Steps the chamber pool dimensions forward in time by dt seconds
   * @param {number} dt -- time in seconds
   */
  step(dt) {
    const nominalDt = 1 / 60;
    dt = Math.min(dt, nominalDt * 3); // Handling large dt so that masses doesn't float upward, empirically determined

    // Update each of the masses
    const steps = 15; // these steps are oly used for masses inside the pool to make sure they reach equilibrium state on iPad
    this.masses.forEach(mass => {
      if (this.stack.includes(mass)) {
        for (let i = 0; i < steps; i++) {
          mass.step(dt / steps);
        }
      } else {
        mass.step(dt);
      }
    });

    // If there are any masses stacked, update the water height
    if (this.stackMassProperty.value) {
      let minY = 0; // some max value
      this.stack.forEach(massModel => {
        minY = Math.min(massModel.positionProperty.value.y - massModel.height / 2, minY);
      });
      this.leftDisplacementProperty.value = Math.max(this.poolDimensions.leftOpening.y2 + this.leftWaterHeight - minY, 0);
    } else {
      //no masses, water must get to equilibrium
      //move back toward zero displacement.  Note, this does not use correct newtonian dynamics, just a simple heuristic
      if (this.leftDisplacementProperty.value >= 0) {
        this.leftDisplacementProperty.value -= this.leftDisplacementProperty.value / 10;
      } else {
        this.leftDisplacementProperty.value = 0;
      }
    }
  }

  /**
   * @public
   * Returns height of the water above the given position
   * @param {number} x - position in meters
   * @param {number} y - position in meters
   * @returns {number} height of the water above the y
   */
  getWaterHeightAboveY(x, y) {
    if (this.poolDimensions.leftOpening.x1 < x && x < this.poolDimensions.leftOpening.x2 && y > this.poolDimensions.leftChamber.y2 + DEFAULT_HEIGHT - this.leftDisplacementProperty.value) {
      return 0;
    } else {
      return this.poolDimensions.leftChamber.y2 + DEFAULT_HEIGHT + this.leftDisplacementProperty.value / this.lengthRatio - y;
    }
  }

  /**
   * @public
   * Returns true if the given point is inside the chamber pool, false otherwise.
   * @param {number} x - position in meters
   * @param {number} y - position in meters
   * @returns {boolean}
   */
  isPointInsidePool(x, y) {
    const keys = _.keys(this.poolDimensions);
    for (let i = 0; i < keys.length; i++) {
      const dimension = this.poolDimensions[keys[i]];
      if (x > dimension.x1 && x < dimension.x2 && y < dimension.y1 && y > dimension.y2) {
        return true;
      }
    }
    return false;
  }
}
fluidPressureAndFlow.register('ChamberPoolModel', ChamberPoolModel);
export default ChamberPoolModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJQcm9wZXJ0eSIsIkNvbnN0YW50cyIsImZsdWlkUHJlc3N1cmVBbmRGbG93IiwiTWFzc01vZGVsIiwiUEFTU0FHRV9TSVpFIiwiUklHSFRfT1BFTklOR19XSURUSCIsIkxFRlRfT1BFTklOR19XSURUSCIsIkNIQU1CRVJfSEVJR0hUIiwiTEVGVF9DSEFNQkVSX1giLCJMRUZUX0NIQU1CRVJfV0lEVEgiLCJSSUdIVF9DSEFNQkVSX1giLCJSSUdIVF9DSEFNQkVSX1dJRFRIIiwiTUFTU19PRkZTRVQiLCJTRVBBUkFUSU9OIiwiREVGQVVMVF9IRUlHSFQiLCJNQVhfSEVJR0hUIiwiTUFYX1BPT0xfSEVJR0hUIiwiQ2hhbWJlclBvb2xNb2RlbCIsImNvbnN0cnVjdG9yIiwidW5kZXJQcmVzc3VyZU1vZGVsIiwibGVmdERpc3BsYWNlbWVudFByb3BlcnR5Iiwic3RhY2tNYXNzUHJvcGVydHkiLCJ2b2x1bWVQcm9wZXJ0eSIsImxlbmd0aFJhdGlvIiwibGVmdFdhdGVySGVpZ2h0IiwibWF4WSIsInBvb2xEaW1lbnNpb25zIiwibGVmdENoYW1iZXIiLCJ4MSIsInkxIiwieDIiLCJ5MiIsInJpZ2h0Q2hhbWJlciIsImhvcml6b250YWxQYXNzYWdlIiwibGVmdE9wZW5pbmciLCJyaWdodE9wZW5pbmciLCJzdGFjayIsIm1hc3NlcyIsImFkZEl0ZW1BZGRlZExpc3RlbmVyIiwibWFzc01vZGVsIiwidmFsdWUiLCJtYXNzIiwibWF4VmVsb2NpdHkiLCJmb3JFYWNoIiwiTWF0aCIsIm1heCIsInZlbG9jaXR5IiwiYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciIsImxpbmsiLCJfIiwiZWFjaCIsImJhcm9tZXRlcnMiLCJiYXJvbWV0ZXIiLCJ1cGRhdGVFbWl0dGVyIiwiZW1pdCIsInJlc2V0IiwiY2xlYXIiLCJzdGVwIiwiZHQiLCJub21pbmFsRHQiLCJtaW4iLCJzdGVwcyIsImluY2x1ZGVzIiwiaSIsIm1pblkiLCJwb3NpdGlvblByb3BlcnR5IiwieSIsImhlaWdodCIsImdldFdhdGVySGVpZ2h0QWJvdmVZIiwieCIsImlzUG9pbnRJbnNpZGVQb29sIiwia2V5cyIsImxlbmd0aCIsImRpbWVuc2lvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2hhbWJlclBvb2xNb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgdGhlIENoYW1iZXIgUG9vbCBzY3JlZW4gb2YgVW5kZXIgUHJlc3N1cmUgc2ltLlxyXG4gKiBNb2RlbHMgdGhlIGNoYW1iZXIgc2hhcGUgYW5kIHN0YWNrIG9mIG1hc3NlcyB0aGF0IGNhbiBiZSBkcm9wcGVkIGluIHRoZSBjaGFtYmVyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFZhc2lseSBTaGFraG92IChNbGVhcm5lcilcclxuICogQGF1dGhvciBTaWRkaGFydGhhIENoaW50aGFwYWxseSAoQWN0dWFsIENvbmNlcHRzKVxyXG4gKi9cclxuXHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBmbHVpZFByZXNzdXJlQW5kRmxvdyBmcm9tICcuLi8uLi9mbHVpZFByZXNzdXJlQW5kRmxvdy5qcyc7XHJcbmltcG9ydCBNYXNzTW9kZWwgZnJvbSAnLi9NYXNzTW9kZWwuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbi8vIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gbWF0Y2ggdGhlIHZpc3VhbCBhcHBlYXJhbmNlIGZyb20gZGVzaWduIGRvY3VtZW50XHJcblxyXG4vL1RoZSBzaXplIG9mIHRoZSBwYXNzYWdlIGJldHdlZW4gdGhlIGNoYW1iZXJzXHJcbmNvbnN0IFBBU1NBR0VfU0laRSA9IDAuNTtcclxuXHJcbi8vV2lkdGggb2YgdGhlIHJpZ2h0IG9wZW5pbmcgdG8gdGhlIGFpclxyXG5jb25zdCBSSUdIVF9PUEVOSU5HX1dJRFRIID0gMi4zO1xyXG5cclxuLy9XaWR0aCBvZiB0aGUgbGVmdCBvcGVuaW5nIHRvIHRoZSBhaXJcclxuY29uc3QgTEVGVF9PUEVOSU5HX1dJRFRIID0gMC41O1xyXG5cclxuLy9IZWlnaHQgb2YgZWFjaCBjaGFtYmVyLCBwaHlzaWNzIG5vdCB3b3JraW5nIHByb3Blcmx5IHRvIHZhcnkgdGhlc2UgaW5kZXBlbmRlbnRseVxyXG5jb25zdCBDSEFNQkVSX0hFSUdIVCA9IDEuMztcclxuXHJcbi8vbGVmdCBjaGFtYmVyIHN0YXJ0IHhcclxuY29uc3QgTEVGVF9DSEFNQkVSX1ggPSAxLjU1O1xyXG5jb25zdCBMRUZUX0NIQU1CRVJfV0lEVEggPSAyLjg7XHJcblxyXG4vL3JpZ2h0KGJvdHRvbSkgY2hhbWJlciBzdGFydCB4XHJcbmNvbnN0IFJJR0hUX0NIQU1CRVJfWCA9IDYuMjc7XHJcbmNvbnN0IFJJR0hUX0NIQU1CRVJfV0lEVEggPSAxLjE7XHJcblxyXG5jb25zdCBNQVNTX09GRlNFVCA9IDEuMzU7IC8vIHN0YXJ0IHgtY29vcmRpbmF0ZSBvZiBmaXJzdCBtYXNzXHJcbmNvbnN0IFNFUEFSQVRJT04gPSAwLjAzOyAvL3NlcGFyYXRpb24gYmV0d2VlbiBtYXNzZXNcclxuXHJcbmNvbnN0IERFRkFVTFRfSEVJR0hUID0gMi4zOyAvL21ldGVycywgd2l0aG91dCBsb2FkXHJcblxyXG4vL1RoZSBlbnRpcmUgYXBwYXJhdHVzIGlzIHRoaXMgdGFsbFxyXG5jb25zdCBNQVhfSEVJR0hUID0gQ29uc3RhbnRzLk1BWF9QT09MX0hFSUdIVDsgLy8gbWV0ZXJzXHJcblxyXG5jbGFzcyBDaGFtYmVyUG9vbE1vZGVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtVbmRlclByZXNzdXJlTW9kZWx9IHVuZGVyUHJlc3N1cmVNb2RlbFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB1bmRlclByZXNzdXJlTW9kZWwgKSB7XHJcblxyXG4gICAgdGhpcy5sZWZ0RGlzcGxhY2VtZW50UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAgKTsgLy9kaXNwbGFjZW1lbnQgZnJvbSBkZWZhdWx0IGhlaWdodFxyXG4gICAgdGhpcy5zdGFja01hc3NQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIHRoaXMudm9sdW1lUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDEgKTsvLyBUT0RPOiB3aGF0IHNob3VsZCB0aGlzIG51bWJlciBiZT8gIERvZXMgaXQgZXZlbiBtYXR0ZXI/ICBJIGRvbid0IHRoaW5rIGl0IGhhcyBhbnkgYmVhcmluZyBvbiB0aGUgbW9kZWwuXHJcblxyXG4gICAgdGhpcy51bmRlclByZXNzdXJlTW9kZWwgPSB1bmRlclByZXNzdXJlTW9kZWw7XHJcblxyXG4gICAgLy9Vc2UgdGhlIGxlbmd0aCByYXRpbyBpbnN0ZWFkIG9mIGFyZWEgcmF0aW8gYmVjYXVzZSB0aGUgcXVhZHJhdGljIGZhY3RvciBtYWtlcyBpdCB0b28gaGFyZCB0byBzZWUgdGhlXHJcbiAgICAvLyB3YXRlciBtb3ZlIG9uIHRoZSByaWdodCwgYW5kIGRlY3JlYXNlcyB0aGUgcHJlc3N1cmUgZWZmZWN0IHRvbyBtdWNoIHRvIHNlZSBpdFxyXG4gICAgdGhpcy5sZW5ndGhSYXRpbyA9IFJJR0hUX09QRU5JTkdfV0lEVEggLyBMRUZUX09QRU5JTkdfV0lEVEg7IC8vIEBwdWJsaWNcclxuXHJcbiAgICAvL2RlZmF1bHQgbGVmdCBvcGVuaW5nIHdhdGVyIGhlaWdodFxyXG4gICAgdGhpcy5sZWZ0V2F0ZXJIZWlnaHQgPSBERUZBVUxUX0hFSUdIVCAtIENIQU1CRVJfSEVJR0hUOyAvLyBAcHVibGljXHJcblxyXG4gICAgLy9tYXNzZXMgY2FuJ3QgaGF2ZSB5LWNvb3JkIG1vcmUgdGhhdCB0aGlzLCBza3kgaGVpZ2h0IC0gZ3Jhc3MgaGVpZ2h0XHJcbiAgICB0aGlzLm1heFkgPSAwLjA1OyAvLyBAcHVibGljXHJcblxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5wb29sRGltZW5zaW9ucyA9IHtcclxuICAgICAgbGVmdENoYW1iZXI6IHtcclxuICAgICAgICB4MTogTEVGVF9DSEFNQkVSX1gsXHJcbiAgICAgICAgeTE6IC0oIE1BWF9IRUlHSFQgLSBDSEFNQkVSX0hFSUdIVCApLFxyXG4gICAgICAgIHgyOiBMRUZUX0NIQU1CRVJfWCArIExFRlRfQ0hBTUJFUl9XSURUSCxcclxuICAgICAgICB5MjogLSggTUFYX0hFSUdIVCApXHJcbiAgICAgIH0sXHJcbiAgICAgIHJpZ2h0Q2hhbWJlcjoge1xyXG4gICAgICAgIHgxOiBSSUdIVF9DSEFNQkVSX1gsXHJcbiAgICAgICAgeTE6IC0oIE1BWF9IRUlHSFQgLSBDSEFNQkVSX0hFSUdIVCApLFxyXG4gICAgICAgIHgyOiBSSUdIVF9DSEFNQkVSX1ggKyBSSUdIVF9DSEFNQkVSX1dJRFRILFxyXG4gICAgICAgIHkyOiAtKCBNQVhfSEVJR0hUIClcclxuICAgICAgfSxcclxuICAgICAgaG9yaXpvbnRhbFBhc3NhZ2U6IHtcclxuICAgICAgICB4MTogTEVGVF9DSEFNQkVSX1ggKyBMRUZUX0NIQU1CRVJfV0lEVEgsXHJcbiAgICAgICAgeTE6IC0oIE1BWF9IRUlHSFQgLSBQQVNTQUdFX1NJWkUgKiAzIC8gMiApLFxyXG4gICAgICAgIHgyOiBSSUdIVF9DSEFNQkVSX1gsXHJcbiAgICAgICAgeTI6IC0oIE1BWF9IRUlHSFQgLSBQQVNTQUdFX1NJWkUgLyAyIClcclxuICAgICAgfSxcclxuICAgICAgbGVmdE9wZW5pbmc6IHtcclxuICAgICAgICB4MTogTEVGVF9DSEFNQkVSX1ggKyBMRUZUX0NIQU1CRVJfV0lEVEggLyAyIC0gTEVGVF9PUEVOSU5HX1dJRFRIIC8gMixcclxuICAgICAgICB5MTogMCxcclxuICAgICAgICB4MjogTEVGVF9DSEFNQkVSX1ggKyBMRUZUX0NIQU1CRVJfV0lEVEggLyAyICsgTEVGVF9PUEVOSU5HX1dJRFRIIC8gMixcclxuICAgICAgICB5MjogLSggTUFYX0hFSUdIVCAtIENIQU1CRVJfSEVJR0hUIClcclxuICAgICAgfSxcclxuICAgICAgcmlnaHRPcGVuaW5nOiB7XHJcbiAgICAgICAgeDE6IFJJR0hUX0NIQU1CRVJfWCArIFJJR0hUX0NIQU1CRVJfV0lEVEggLyAyIC0gUklHSFRfT1BFTklOR19XSURUSCAvIDIsXHJcbiAgICAgICAgeTE6IDAsXHJcbiAgICAgICAgeDI6IFJJR0hUX0NIQU1CRVJfWCArIFJJR0hUX0NIQU1CRVJfV0lEVEggLyAyICsgUklHSFRfT1BFTklOR19XSURUSCAvIDIsXHJcbiAgICAgICAgeTI6IC0oIE1BWF9IRUlHSFQgLSBDSEFNQkVSX0hFSUdIVCApXHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy9MaXN0IG9mIG1hc3NlcyB0aGF0IGFyZSBjdXJyZW50bHkgc3RhY2tlZFxyXG4gICAgdGhpcy5zdGFjayA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpOyAvLyBAcHVibGljXHJcblxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgLy9MaXN0IG9mIGFsbCBhdmFpbGFibGUgbWFzc2VzXHJcbiAgICB0aGlzLm1hc3NlcyA9IFtcclxuICAgICAgbmV3IE1hc3NNb2RlbCggdGhpcywgNTAwLCBNQVNTX09GRlNFVCwgdGhpcy5tYXhZICsgUEFTU0FHRV9TSVpFIC8gMiwgUEFTU0FHRV9TSVpFLFxyXG4gICAgICAgIFBBU1NBR0VfU0laRSApLFxyXG4gICAgICBuZXcgTWFzc01vZGVsKCB0aGlzLCAyNTAsIE1BU1NfT0ZGU0VUICsgUEFTU0FHRV9TSVpFICsgU0VQQVJBVElPTixcclxuICAgICAgICB0aGlzLm1heFkgKyBQQVNTQUdFX1NJWkUgLyA0LCBQQVNTQUdFX1NJWkUsIFBBU1NBR0VfU0laRSAvIDIgKSxcclxuICAgICAgbmV3IE1hc3NNb2RlbCggdGhpcywgMjUwLCBNQVNTX09GRlNFVCArIDIgKiBQQVNTQUdFX1NJWkUgKyAyICogU0VQQVJBVElPTixcclxuICAgICAgICB0aGlzLm1heFkgKyBQQVNTQUdFX1NJWkUgLyA0LCBQQVNTQUdFX1NJWkUsIFBBU1NBR0VfU0laRSAvIDIgKVxyXG4gICAgXTtcclxuXHJcbiAgICAvL1doZW4gYW4gaXRlbSBpcyBhZGRlZCB0byB0aGUgc3RhY2ssIHVwZGF0ZSB0aGUgdG90YWwgbWFzcyBhbmQgZXF1YWxpemUgdGhlIG1hc3MgdmVsb2NpdGllc1xyXG4gICAgdGhpcy5zdGFjay5hZGRJdGVtQWRkZWRMaXN0ZW5lciggbWFzc01vZGVsID0+IHtcclxuICAgICAgdGhpcy5zdGFja01hc3NQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuc3RhY2tNYXNzUHJvcGVydHkudmFsdWUgKyBtYXNzTW9kZWwubWFzcztcclxuXHJcbiAgICAgIGxldCBtYXhWZWxvY2l0eSA9IDA7XHJcblxyXG4gICAgICAvL211c3QgZXF1YWxpemUgdmVsb2NpdHkgb2YgZWFjaCBtYXNzXHJcbiAgICAgIHRoaXMuc3RhY2suZm9yRWFjaCggbWFzcyA9PiB7XHJcbiAgICAgICAgbWF4VmVsb2NpdHkgPSBNYXRoLm1heCggbWFzcy52ZWxvY2l0eSwgbWF4VmVsb2NpdHkgKTtcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLnN0YWNrLmZvckVhY2goIG1hc3MgPT4ge1xyXG4gICAgICAgIG1hc3MudmVsb2NpdHkgPSBtYXhWZWxvY2l0eTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vV2hlbiBhbiBpdGVtIGlzIHJlbW92ZWQgZnJvbSB0aGUgc3RhY2ssIHVwZGF0ZSB0aGUgdG90YWwgbWFzcy5cclxuICAgIHRoaXMuc3RhY2suYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggbWFzc01vZGVsID0+IHtcclxuICAgICAgdGhpcy5zdGFja01hc3NQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuc3RhY2tNYXNzUHJvcGVydHkudmFsdWUgLSBtYXNzTW9kZWwubWFzcztcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmxlZnREaXNwbGFjZW1lbnRQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIC8vIHVwZGF0ZSBhbGwgYmFyb21ldGVyc1xyXG4gICAgICBfLmVhY2goIHVuZGVyUHJlc3N1cmVNb2RlbC5iYXJvbWV0ZXJzLCBiYXJvbWV0ZXIgPT4ge1xyXG4gICAgICAgIGJhcm9tZXRlci51cGRhdGVFbWl0dGVyLmVtaXQoKTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5zdGFjay5jbGVhcigpO1xyXG4gICAgdGhpcy5sZWZ0RGlzcGxhY2VtZW50UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc3RhY2tNYXNzUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubWFzc2VzLmZvckVhY2goIG1hc3MgPT4ge1xyXG4gICAgICBtYXNzLnJlc2V0KCk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogU3RlcHMgdGhlIGNoYW1iZXIgcG9vbCBkaW1lbnNpb25zIGZvcndhcmQgaW4gdGltZSBieSBkdCBzZWNvbmRzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0tIHRpbWUgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG5cclxuICAgIGNvbnN0IG5vbWluYWxEdCA9IDEgLyA2MDtcclxuXHJcbiAgICBkdCA9IE1hdGgubWluKCBkdCwgbm9taW5hbER0ICogMyApOyAvLyBIYW5kbGluZyBsYXJnZSBkdCBzbyB0aGF0IG1hc3NlcyBkb2Vzbid0IGZsb2F0IHVwd2FyZCwgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5cclxuICAgIC8vIFVwZGF0ZSBlYWNoIG9mIHRoZSBtYXNzZXNcclxuICAgIGNvbnN0IHN0ZXBzID0gMTU7IC8vIHRoZXNlIHN0ZXBzIGFyZSBvbHkgdXNlZCBmb3IgbWFzc2VzIGluc2lkZSB0aGUgcG9vbCB0byBtYWtlIHN1cmUgdGhleSByZWFjaCBlcXVpbGlicml1bSBzdGF0ZSBvbiBpUGFkXHJcbiAgICB0aGlzLm1hc3Nlcy5mb3JFYWNoKCBtYXNzID0+IHtcclxuICAgICAgaWYgKCB0aGlzLnN0YWNrLmluY2x1ZGVzKCBtYXNzICkgKSB7XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RlcHM7IGkrKyApIHtcclxuICAgICAgICAgIG1hc3Muc3RlcCggZHQgLyBzdGVwcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBtYXNzLnN0ZXAoIGR0ICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBJZiB0aGVyZSBhcmUgYW55IG1hc3NlcyBzdGFja2VkLCB1cGRhdGUgdGhlIHdhdGVyIGhlaWdodFxyXG4gICAgaWYgKCB0aGlzLnN0YWNrTWFzc1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICBsZXQgbWluWSA9IDA7IC8vIHNvbWUgbWF4IHZhbHVlXHJcbiAgICAgIHRoaXMuc3RhY2suZm9yRWFjaCggbWFzc01vZGVsID0+IHtcclxuICAgICAgICBtaW5ZID0gTWF0aC5taW4oIG1hc3NNb2RlbC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgLSBtYXNzTW9kZWwuaGVpZ2h0IC8gMiwgbWluWSApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMubGVmdERpc3BsYWNlbWVudFByb3BlcnR5LnZhbHVlID0gTWF0aC5tYXgoIHRoaXMucG9vbERpbWVuc2lvbnMubGVmdE9wZW5pbmcueTIgKyB0aGlzLmxlZnRXYXRlckhlaWdodCAtIG1pblksIDAgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvL25vIG1hc3Nlcywgd2F0ZXIgbXVzdCBnZXQgdG8gZXF1aWxpYnJpdW1cclxuICAgICAgLy9tb3ZlIGJhY2sgdG93YXJkIHplcm8gZGlzcGxhY2VtZW50LiAgTm90ZSwgdGhpcyBkb2VzIG5vdCB1c2UgY29ycmVjdCBuZXd0b25pYW4gZHluYW1pY3MsIGp1c3QgYSBzaW1wbGUgaGV1cmlzdGljXHJcbiAgICAgIGlmICggdGhpcy5sZWZ0RGlzcGxhY2VtZW50UHJvcGVydHkudmFsdWUgPj0gMCApIHtcclxuICAgICAgICB0aGlzLmxlZnREaXNwbGFjZW1lbnRQcm9wZXJ0eS52YWx1ZSAtPSB0aGlzLmxlZnREaXNwbGFjZW1lbnRQcm9wZXJ0eS52YWx1ZSAvIDEwO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMubGVmdERpc3BsYWNlbWVudFByb3BlcnR5LnZhbHVlID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIFJldHVybnMgaGVpZ2h0IG9mIHRoZSB3YXRlciBhYm92ZSB0aGUgZ2l2ZW4gcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge251bWJlcn0geCAtIHBvc2l0aW9uIGluIG1ldGVyc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gcG9zaXRpb24gaW4gbWV0ZXJzXHJcbiAgICogQHJldHVybnMge251bWJlcn0gaGVpZ2h0IG9mIHRoZSB3YXRlciBhYm92ZSB0aGUgeVxyXG4gICAqL1xyXG4gIGdldFdhdGVySGVpZ2h0QWJvdmVZKCB4LCB5ICkge1xyXG4gICAgaWYgKCB0aGlzLnBvb2xEaW1lbnNpb25zLmxlZnRPcGVuaW5nLngxIDwgeCAmJiB4IDwgdGhpcy5wb29sRGltZW5zaW9ucy5sZWZ0T3BlbmluZy54MiAmJlxyXG4gICAgICAgICB5ID4gdGhpcy5wb29sRGltZW5zaW9ucy5sZWZ0Q2hhbWJlci55MiArIERFRkFVTFRfSEVJR0hUIC0gdGhpcy5sZWZ0RGlzcGxhY2VtZW50UHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnBvb2xEaW1lbnNpb25zLmxlZnRDaGFtYmVyLnkyICsgREVGQVVMVF9IRUlHSFQgKyB0aGlzLmxlZnREaXNwbGFjZW1lbnRQcm9wZXJ0eS52YWx1ZSAvIHRoaXMubGVuZ3RoUmF0aW8gLSB5O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gcG9pbnQgaXMgaW5zaWRlIHRoZSBjaGFtYmVyIHBvb2wsIGZhbHNlIG90aGVyd2lzZS5cclxuICAgKiBAcGFyYW0ge251bWJlcn0geCAtIHBvc2l0aW9uIGluIG1ldGVyc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gcG9zaXRpb24gaW4gbWV0ZXJzXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNQb2ludEluc2lkZVBvb2woIHgsIHkgKSB7XHJcbiAgICBjb25zdCBrZXlzID0gXy5rZXlzKCB0aGlzLnBvb2xEaW1lbnNpb25zICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBkaW1lbnNpb24gPSB0aGlzLnBvb2xEaW1lbnNpb25zWyBrZXlzWyBpIF0gXTtcclxuICAgICAgaWYgKCB4ID4gZGltZW5zaW9uLngxICYmIHggPCBkaW1lbnNpb24ueDIgJiYgeSA8IGRpbWVuc2lvbi55MSAmJiB5ID4gZGltZW5zaW9uLnkyICkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG5mbHVpZFByZXNzdXJlQW5kRmxvdy5yZWdpc3RlciggJ0NoYW1iZXJQb29sTW9kZWwnLCBDaGFtYmVyUG9vbE1vZGVsICk7XHJcbmV4cG9ydCBkZWZhdWx0IENoYW1iZXJQb29sTW9kZWw7Il0sIm1hcHBpbmdz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