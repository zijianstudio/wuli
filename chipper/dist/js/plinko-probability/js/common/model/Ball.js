// Copyright 2014-2021, University of Colorado Boulder

/**
 * Model for Ball in Plinko Probability
 *
 * @author Martin Veillette (Berea College)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import plinkoProbability from '../../plinkoProbability.js';
import PlinkoProbabilityConstants from '../PlinkoProbabilityConstants.js';
import BallPhase from './BallPhase.js';
import GaltonBoard from './GaltonBoard.js';
class Ball {
  /**
   * @param {number} probability - number ranging from 0 to 1
   * @param {number} numberOfRows - an integer
   * @param {Array.<Object>} bins
   */
  constructor(probability, numberOfRows, bins) {
    // position vector
    this.position = new Vector2(0, 0); // @public (read-only)

    this.probability = probability; // @private (read-only)
    this.numberOfRows = numberOfRows; // @private (read-only)

    this.pegSeparation = GaltonBoard.getPegSpacing(numberOfRows); // @public (read-only)

    this.ballRadius = this.pegSeparation * PlinkoProbabilityConstants.BALL_SIZE_FRACTION; // @public (read-only)

    this.phase = BallPhase.INITIAL; // @public (read-only), see BallPhase

    // @public
    this.ballHittingPegEmitter = new Emitter({
      parameters: [{
        validValues: ['left', 'right']
      }]
    });
    this.ballOutOfPegsEmitter = new Emitter();
    this.ballCollectedEmitter = new Emitter();

    // rows and column
    /*
     * the pegs are assigned a row and column ( the columns are left aligned)
     * the row and column numbers start at zero
     * they are arranged in the following manner
     *
     *   X
     *   X X
     *   X X X
     *   X X X X
     */

    // 0 is the topmost
    this.row = 0; // @private

    // the direction in which the ball is going 'left','right'
    this.direction = 'left'; // @public (read-only)

    // 0 is the top of the current peg, 1 is the top of the next peg
    this.fallenRatio = 0; // @private

    // contains the pegs which the ball will touch
    this.pegHistory = []; // @public (read-only) {Array.<Object>}

    this.finalBinHorizontalOffset = 0; // @public describes final horizontal offset of ball within a bin {number}
    this.finalBinVerticalOffset = 0; // @public describes final vertical offset of ball within a bin {number}

    let direction; // 'left', 'right'
    let rowNumber;
    let columnNumber = 0;
    let peg; // {Object}

    // the path of the balls through the pegs of the galton board  is determined
    for (rowNumber = 0; rowNumber <= numberOfRows; rowNumber++) {
      direction = dotRandom.nextDouble() > probability ? 'left' : 'right';
      peg = {
        rowNumber: rowNumber,
        // an integer starting at zero
        positionX: getPegPositionX(rowNumber, columnNumber, numberOfRows),
        positionY: getPegPositionY(rowNumber, columnNumber, numberOfRows),
        direction: direction // direction to the next peg
      };

      this.pegHistory.push(peg);

      // increment the column number of the next row, but not for the last row
      if (rowNumber < numberOfRows) {
        columnNumber += direction === 'left' ? 0 : 1;
      }
    }

    // @public (read-only)
    // bin position of the ball {number}
    this.binIndex = columnNumber;

    // @public (read-only)
    // binCount {number} indicates the number of balls in a specific cylinder
    this.binCount = bins[columnNumber].binCount;

    // increment the number of balls in this index by one
    this.binCount++;
  }

  /**
   * @param {number} dt - time interval
   * @returns {boolean} true if the ball moved, false if it didn't move
   * @public
   */
  step(dt) {
    return this.ballStep(dt);
  }

  /**
   * Updates the peg information (rowNumber, columnNumber, and position) used for determining ball position
   * check and changes the phase of the ball.
   * Plays a sounds when the ball hits a peg
   * Emits when the ball has exited so that it can be added to statistics
   * Emits when the ball has landed so that it doesn't get painted when it doesn't need to
   * updates the position of the ball
   *
   * @param {number} df - fraction of falling between pegs
   * @returns {boolean} true if the ball moved, false if it didn't move
   * @private
   */
  ballStep(df) {
    if (this.phase === BallPhase.COLLECTED) {
      // do nothing, the ball is at rest in a bin
      return false;
    } else if (this.phase === BallPhase.INITIAL) {
      // balls is leaving the hopper
      if (df + this.fallenRatio < 1) {
        // if the ball has not gotten to the first peg
        this.initializePegPosition(); // get the initial peg information
        this.fallenRatio += df; // fall some more
      } else {
        this.phase = BallPhase.FALLING; // switch the phase
        this.fallenRatio = 0; // reset the ratio
        this.updatePegPosition(); // update the peg position information
        this.ballHittingPegEmitter.emit(this.direction); // can play a sound when ball hits peg;
      }
    } else if (this.phase === BallPhase.FALLING) {
      //ball is falling between pegs
      if (df + this.fallenRatio < 1) {
        // if ball has not reached the next peg
        this.fallenRatio += df; // fall some more
      } else {
        // the ball has reached the top of the next peg
        this.fallenRatio = 0; // reset the fallen ratio

        if (this.pegHistory.length > 1) {
          // if it is not the last peg
          this.updatePegPosition(); // update the next to last peg information
          this.ballHittingPegEmitter.emit(this.direction); // can play a sound when ball hits peg;
        } else {
          // ball is at the top of the last peg
          this.phase = BallPhase.EXITED; // switch phases
          this.updatePegPosition(); // update the last peg information
          this.ballOutOfPegsEmitter.emit();
        }
      }
    } else if (this.phase === BallPhase.EXITED) {
      // the ball has exited and it is making its way to the bin
      // the position at which the balls will eventually land
      const finalPosition = this.finalBinVerticalOffset + this.pegSeparation * PlinkoProbabilityConstants.PEG_HEIGHT_FRACTION_OFFSET;
      if (this.position.y > finalPosition) {
        // if it has not fallen to its final position

        // The change in the fallen ratio needs to be scaled by the peg separation so that it matches the speed everywhere else.
        // Multiply by 2 to make the balls fall a bit faster once they've entered the bins, see #63
        this.fallenRatio += 2 * df * this.pegSeparation;
      } else {
        this.phase = BallPhase.COLLECTED; // switch phases
        this.ballCollectedEmitter.emit(); // mark the ball for removal
      }
    }

    // update the position of the ball
    this.updatePosition();
    return true;
  }

  /**
   * Updates the position of the ball depending on the phase.
   * @private
   */
  updatePosition() {
    switch (this.phase) {
      // ball left the hopper
      case BallPhase.INITIAL:
        // we only want this to move one peg distance down
        // set the position be at some point between the hopper and the first peg
        this.position.setXY(0, 1 - this.fallenRatio);

        // scale it so that it does not move too much
        this.position.multiplyScalar(this.pegSeparation);

        // add the position of the first peg
        this.position.addXY(this.pegPositionX, this.pegPositionY);
        break;

      // ball is falling through the pegs
      case BallPhase.FALLING:
        {
          // steer the ball to the left or right depending on this.direction
          const shift = this.direction === 'left' ? -0.5 : 0.5;

          // mimic the fall as a parabolic motion
          this.position.setXY(shift * this.fallenRatio, -this.fallenRatio * this.fallenRatio);

          // get the ball aligned with its final x position in the bin.
          this.position.multiplyScalar(this.pegSeparation); // scale the vector by the peg separation

          // exit from the last row with the correct alignment with the bin
          if (this.row === this.numberOfRows - 1) {
            // transition
            this.position.addXY(this.finalBinHorizontalOffset * this.fallenRatio, 0);
          }
          this.position.addXY(this.pegPositionX, this.pegPositionY);
          break;
        }

      // the ball is exiting the pegs and making its way to the bin
      case BallPhase.EXITED:
        this.position.setXY(this.finalBinHorizontalOffset, -this.fallenRatio);
        this.position.addXY(this.pegPositionX, this.pegPositionY);
        break;

      // the ball has landed to its final position
      case BallPhase.COLLECTED:
        this.position.setXY(this.finalBinHorizontalOffset, this.finalBinVerticalOffset);
        this.position.addXY(this.pegPositionX, 0);
        break;
      default:
        throw new Error(`invalid phase: ${this.phase}`);
    }

    // add a vertical offset, such that the balls do not reach the pegs but are over the pegs.
    this.position.addXY(0, this.pegSeparation * PlinkoProbabilityConstants.PEG_HEIGHT_FRACTION_OFFSET);
  }

  /**
   * Sends the trigger to update statistics and land.
   * If the ball phase is BallPhase.INITIAL it does nothing.
   * Otherwise notifies observers and changes the phase to BallPhase.COLLECTED to make sure the triggers only get sent once.
   * The ball will not be stepped through the other intermediate phases.
   *
   * @public
   */
  updateStatisticsAndLand() {
    if (this.phase === BallPhase.INITIAL) {
      // send triggers
      this.ballOutOfPegsEmitter.emit();
      this.ballCollectedEmitter.emit();

      // change phase to indicate that ball has landed in bin
      this.phase = BallPhase.COLLECTED;
    }
  }

  /**
   * Initializes the peg position.
   * @private
   */
  initializePegPosition() {
    const peg = this.pegHistory[0]; // get the first peg from the peg history
    this.row = peg.rowNumber; // 0 is the left most
    this.pegPositionX = peg.positionX; // x position of the peg based on the column, row, and number of of rows
    this.pegPositionY = peg.positionY; // y position of the peg based on the column, row, and number of of rows
  }

  /**
   * Updates the peg position.
   * @private
   */
  updatePegPosition() {
    const peg = this.pegHistory.shift();
    this.row = peg.rowNumber; // 0 is the leftmost
    this.pegPositionX = peg.positionX; // x position of the peg based on the column, row, and number of of rows
    this.pegPositionY = peg.positionY; // y position of the peg based on the column, row, and number of of rows
    this.direction = peg.direction; // whether the ball went left or right
  }
}

plinkoProbability.register('Ball', Ball);

/**
 * Function that returns the X position of a peg with index rowNumber and column Number
 * The position is given in the model view (with respect to the galton board)
 *
 * @param {number} rowNumber
 * @param {number} columnNumber
 * @param {number} numberOfRows
 * @returns {number}
 * @public
 */
const getPegPositionX = (rowNumber, columnNumber, numberOfRows) => (-rowNumber / 2 + columnNumber) / (numberOfRows + 1);

/**
 * Function that returns the Y position of a peg with index rowNumber and column Number
 * The position is given in the model view (with respect to the galton board)
 *
 * @param {number} rowNumber
 * @param {number} columnNumber
 * @param {number} numberOfRows
 * @returns {number}
 * @public
 */
const getPegPositionY = (rowNumber, columnNumber, numberOfRows) => (-rowNumber - 2 * PlinkoProbabilityConstants.PEG_HEIGHT_FRACTION_OFFSET) / (numberOfRows + 1);
export default Ball;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiZG90UmFuZG9tIiwiVmVjdG9yMiIsInBsaW5rb1Byb2JhYmlsaXR5IiwiUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMiLCJCYWxsUGhhc2UiLCJHYWx0b25Cb2FyZCIsIkJhbGwiLCJjb25zdHJ1Y3RvciIsInByb2JhYmlsaXR5IiwibnVtYmVyT2ZSb3dzIiwiYmlucyIsInBvc2l0aW9uIiwicGVnU2VwYXJhdGlvbiIsImdldFBlZ1NwYWNpbmciLCJiYWxsUmFkaXVzIiwiQkFMTF9TSVpFX0ZSQUNUSU9OIiwicGhhc2UiLCJJTklUSUFMIiwiYmFsbEhpdHRpbmdQZWdFbWl0dGVyIiwicGFyYW1ldGVycyIsInZhbGlkVmFsdWVzIiwiYmFsbE91dE9mUGVnc0VtaXR0ZXIiLCJiYWxsQ29sbGVjdGVkRW1pdHRlciIsInJvdyIsImRpcmVjdGlvbiIsImZhbGxlblJhdGlvIiwicGVnSGlzdG9yeSIsImZpbmFsQmluSG9yaXpvbnRhbE9mZnNldCIsImZpbmFsQmluVmVydGljYWxPZmZzZXQiLCJyb3dOdW1iZXIiLCJjb2x1bW5OdW1iZXIiLCJwZWciLCJuZXh0RG91YmxlIiwicG9zaXRpb25YIiwiZ2V0UGVnUG9zaXRpb25YIiwicG9zaXRpb25ZIiwiZ2V0UGVnUG9zaXRpb25ZIiwicHVzaCIsImJpbkluZGV4IiwiYmluQ291bnQiLCJzdGVwIiwiZHQiLCJiYWxsU3RlcCIsImRmIiwiQ09MTEVDVEVEIiwiaW5pdGlhbGl6ZVBlZ1Bvc2l0aW9uIiwiRkFMTElORyIsInVwZGF0ZVBlZ1Bvc2l0aW9uIiwiZW1pdCIsImxlbmd0aCIsIkVYSVRFRCIsImZpbmFsUG9zaXRpb24iLCJQRUdfSEVJR0hUX0ZSQUNUSU9OX09GRlNFVCIsInkiLCJ1cGRhdGVQb3NpdGlvbiIsInNldFhZIiwibXVsdGlwbHlTY2FsYXIiLCJhZGRYWSIsInBlZ1Bvc2l0aW9uWCIsInBlZ1Bvc2l0aW9uWSIsInNoaWZ0IiwiRXJyb3IiLCJ1cGRhdGVTdGF0aXN0aWNzQW5kTGFuZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmFsbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgQmFsbCBpbiBQbGlua28gUHJvYmFiaWxpdHlcclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlIChCZXJlYSBDb2xsZWdlKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHBsaW5rb1Byb2JhYmlsaXR5IGZyb20gJy4uLy4uL3BsaW5rb1Byb2JhYmlsaXR5LmpzJztcclxuaW1wb3J0IFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzIGZyb20gJy4uL1BsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEJhbGxQaGFzZSBmcm9tICcuL0JhbGxQaGFzZS5qcyc7XHJcbmltcG9ydCBHYWx0b25Cb2FyZCBmcm9tICcuL0dhbHRvbkJvYXJkLmpzJztcclxuXHJcbmNsYXNzIEJhbGwge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwcm9iYWJpbGl0eSAtIG51bWJlciByYW5naW5nIGZyb20gMCB0byAxXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bWJlck9mUm93cyAtIGFuIGludGVnZXJcclxuICAgKiBAcGFyYW0ge0FycmF5LjxPYmplY3Q+fSBiaW5zXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHByb2JhYmlsaXR5LCBudW1iZXJPZlJvd3MsIGJpbnMgKSB7XHJcblxyXG4gICAgLy8gcG9zaXRpb24gdmVjdG9yXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIDAsIDAgKTsgLy8gQHB1YmxpYyAocmVhZC1vbmx5KVxyXG5cclxuICAgIHRoaXMucHJvYmFiaWxpdHkgPSBwcm9iYWJpbGl0eTsgLy8gQHByaXZhdGUgKHJlYWQtb25seSlcclxuICAgIHRoaXMubnVtYmVyT2ZSb3dzID0gbnVtYmVyT2ZSb3dzOyAvLyBAcHJpdmF0ZSAocmVhZC1vbmx5KVxyXG5cclxuICAgIHRoaXMucGVnU2VwYXJhdGlvbiA9IEdhbHRvbkJvYXJkLmdldFBlZ1NwYWNpbmcoIG51bWJlck9mUm93cyApOyAvLyBAcHVibGljIChyZWFkLW9ubHkpXHJcblxyXG4gICAgdGhpcy5iYWxsUmFkaXVzID0gdGhpcy5wZWdTZXBhcmF0aW9uICogUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuQkFMTF9TSVpFX0ZSQUNUSU9OOyAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KVxyXG5cclxuICAgIHRoaXMucGhhc2UgPSBCYWxsUGhhc2UuSU5JVElBTDsgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSwgc2VlIEJhbGxQaGFzZVxyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMuYmFsbEhpdHRpbmdQZWdFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHtcclxuICAgICAgcGFyYW1ldGVyczogWyB7IHZhbGlkVmFsdWVzOiBbICdsZWZ0JywgJ3JpZ2h0JyBdIH0gXVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5iYWxsT3V0T2ZQZWdzRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICB0aGlzLmJhbGxDb2xsZWN0ZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICAvLyByb3dzIGFuZCBjb2x1bW5cclxuICAgIC8qXHJcbiAgICAgKiB0aGUgcGVncyBhcmUgYXNzaWduZWQgYSByb3cgYW5kIGNvbHVtbiAoIHRoZSBjb2x1bW5zIGFyZSBsZWZ0IGFsaWduZWQpXHJcbiAgICAgKiB0aGUgcm93IGFuZCBjb2x1bW4gbnVtYmVycyBzdGFydCBhdCB6ZXJvXHJcbiAgICAgKiB0aGV5IGFyZSBhcnJhbmdlZCBpbiB0aGUgZm9sbG93aW5nIG1hbm5lclxyXG4gICAgICpcclxuICAgICAqICAgWFxyXG4gICAgICogICBYIFhcclxuICAgICAqICAgWCBYIFhcclxuICAgICAqICAgWCBYIFggWFxyXG4gICAgICovXHJcblxyXG4gICAgLy8gMCBpcyB0aGUgdG9wbW9zdFxyXG4gICAgdGhpcy5yb3cgPSAwOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIC8vIHRoZSBkaXJlY3Rpb24gaW4gd2hpY2ggdGhlIGJhbGwgaXMgZ29pbmcgJ2xlZnQnLCdyaWdodCdcclxuICAgIHRoaXMuZGlyZWN0aW9uID0gJ2xlZnQnOyAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KVxyXG5cclxuICAgIC8vIDAgaXMgdGhlIHRvcCBvZiB0aGUgY3VycmVudCBwZWcsIDEgaXMgdGhlIHRvcCBvZiB0aGUgbmV4dCBwZWdcclxuICAgIHRoaXMuZmFsbGVuUmF0aW8gPSAwOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIC8vIGNvbnRhaW5zIHRoZSBwZWdzIHdoaWNoIHRoZSBiYWxsIHdpbGwgdG91Y2hcclxuICAgIHRoaXMucGVnSGlzdG9yeSA9IFtdOyAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtBcnJheS48T2JqZWN0Pn1cclxuXHJcbiAgICB0aGlzLmZpbmFsQmluSG9yaXpvbnRhbE9mZnNldCA9IDA7IC8vIEBwdWJsaWMgZGVzY3JpYmVzIGZpbmFsIGhvcml6b250YWwgb2Zmc2V0IG9mIGJhbGwgd2l0aGluIGEgYmluIHtudW1iZXJ9XHJcbiAgICB0aGlzLmZpbmFsQmluVmVydGljYWxPZmZzZXQgPSAwOyAgLy8gQHB1YmxpYyBkZXNjcmliZXMgZmluYWwgdmVydGljYWwgb2Zmc2V0IG9mIGJhbGwgd2l0aGluIGEgYmluIHtudW1iZXJ9XHJcblxyXG4gICAgbGV0IGRpcmVjdGlvbjsgIC8vICdsZWZ0JywgJ3JpZ2h0J1xyXG4gICAgbGV0IHJvd051bWJlcjtcclxuICAgIGxldCBjb2x1bW5OdW1iZXIgPSAwO1xyXG4gICAgbGV0IHBlZzsgLy8ge09iamVjdH1cclxuXHJcbiAgICAvLyB0aGUgcGF0aCBvZiB0aGUgYmFsbHMgdGhyb3VnaCB0aGUgcGVncyBvZiB0aGUgZ2FsdG9uIGJvYXJkICBpcyBkZXRlcm1pbmVkXHJcbiAgICBmb3IgKCByb3dOdW1iZXIgPSAwOyByb3dOdW1iZXIgPD0gbnVtYmVyT2ZSb3dzOyByb3dOdW1iZXIrKyApIHtcclxuICAgICAgZGlyZWN0aW9uID0gKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpID4gcHJvYmFiaWxpdHkgKSA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcbiAgICAgIHBlZyA9IHtcclxuICAgICAgICByb3dOdW1iZXI6IHJvd051bWJlciwgLy8gYW4gaW50ZWdlciBzdGFydGluZyBhdCB6ZXJvXHJcbiAgICAgICAgcG9zaXRpb25YOiBnZXRQZWdQb3NpdGlvblgoIHJvd051bWJlciwgY29sdW1uTnVtYmVyLCBudW1iZXJPZlJvd3MgKSxcclxuICAgICAgICBwb3NpdGlvblk6IGdldFBlZ1Bvc2l0aW9uWSggcm93TnVtYmVyLCBjb2x1bW5OdW1iZXIsIG51bWJlck9mUm93cyApLFxyXG4gICAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9uIC8vIGRpcmVjdGlvbiB0byB0aGUgbmV4dCBwZWdcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRoaXMucGVnSGlzdG9yeS5wdXNoKCBwZWcgKTtcclxuXHJcbiAgICAgIC8vIGluY3JlbWVudCB0aGUgY29sdW1uIG51bWJlciBvZiB0aGUgbmV4dCByb3csIGJ1dCBub3QgZm9yIHRoZSBsYXN0IHJvd1xyXG4gICAgICBpZiAoIHJvd051bWJlciA8IG51bWJlck9mUm93cyApIHtcclxuICAgICAgICBjb2x1bW5OdW1iZXIgKz0gKCBkaXJlY3Rpb24gPT09ICdsZWZ0JyApID8gMCA6IDE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpXHJcbiAgICAvLyBiaW4gcG9zaXRpb24gb2YgdGhlIGJhbGwge251bWJlcn1cclxuICAgIHRoaXMuYmluSW5kZXggPSBjb2x1bW5OdW1iZXI7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KVxyXG4gICAgLy8gYmluQ291bnQge251bWJlcn0gaW5kaWNhdGVzIHRoZSBudW1iZXIgb2YgYmFsbHMgaW4gYSBzcGVjaWZpYyBjeWxpbmRlclxyXG4gICAgdGhpcy5iaW5Db3VudCA9IGJpbnNbIGNvbHVtbk51bWJlciBdLmJpbkNvdW50O1xyXG5cclxuICAgIC8vIGluY3JlbWVudCB0aGUgbnVtYmVyIG9mIGJhbGxzIGluIHRoaXMgaW5kZXggYnkgb25lXHJcbiAgICB0aGlzLmJpbkNvdW50Kys7XHJcblxyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRpbWUgaW50ZXJ2YWxcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgYmFsbCBtb3ZlZCwgZmFsc2UgaWYgaXQgZGlkbid0IG1vdmVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5iYWxsU3RlcCggZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIHBlZyBpbmZvcm1hdGlvbiAocm93TnVtYmVyLCBjb2x1bW5OdW1iZXIsIGFuZCBwb3NpdGlvbikgdXNlZCBmb3IgZGV0ZXJtaW5pbmcgYmFsbCBwb3NpdGlvblxyXG4gICAqIGNoZWNrIGFuZCBjaGFuZ2VzIHRoZSBwaGFzZSBvZiB0aGUgYmFsbC5cclxuICAgKiBQbGF5cyBhIHNvdW5kcyB3aGVuIHRoZSBiYWxsIGhpdHMgYSBwZWdcclxuICAgKiBFbWl0cyB3aGVuIHRoZSBiYWxsIGhhcyBleGl0ZWQgc28gdGhhdCBpdCBjYW4gYmUgYWRkZWQgdG8gc3RhdGlzdGljc1xyXG4gICAqIEVtaXRzIHdoZW4gdGhlIGJhbGwgaGFzIGxhbmRlZCBzbyB0aGF0IGl0IGRvZXNuJ3QgZ2V0IHBhaW50ZWQgd2hlbiBpdCBkb2Vzbid0IG5lZWQgdG9cclxuICAgKiB1cGRhdGVzIHRoZSBwb3NpdGlvbiBvZiB0aGUgYmFsbFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRmIC0gZnJhY3Rpb24gb2YgZmFsbGluZyBiZXR3ZWVuIHBlZ3NcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgYmFsbCBtb3ZlZCwgZmFsc2UgaWYgaXQgZGlkbid0IG1vdmVcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGJhbGxTdGVwKCBkZiApIHtcclxuXHJcbiAgICBpZiAoIHRoaXMucGhhc2UgPT09IEJhbGxQaGFzZS5DT0xMRUNURUQgKSB7XHJcbiAgICAgIC8vIGRvIG5vdGhpbmcsIHRoZSBiYWxsIGlzIGF0IHJlc3QgaW4gYSBiaW5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMucGhhc2UgPT09IEJhbGxQaGFzZS5JTklUSUFMICkgeyAvLyBiYWxscyBpcyBsZWF2aW5nIHRoZSBob3BwZXJcclxuICAgICAgaWYgKCBkZiArIHRoaXMuZmFsbGVuUmF0aW8gPCAxICkgeyAvLyBpZiB0aGUgYmFsbCBoYXMgbm90IGdvdHRlbiB0byB0aGUgZmlyc3QgcGVnXHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplUGVnUG9zaXRpb24oKTsgLy8gZ2V0IHRoZSBpbml0aWFsIHBlZyBpbmZvcm1hdGlvblxyXG4gICAgICAgIHRoaXMuZmFsbGVuUmF0aW8gKz0gZGY7IC8vIGZhbGwgc29tZSBtb3JlXHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5waGFzZSA9IEJhbGxQaGFzZS5GQUxMSU5HOyAvLyBzd2l0Y2ggdGhlIHBoYXNlXHJcbiAgICAgICAgdGhpcy5mYWxsZW5SYXRpbyA9IDA7IC8vIHJlc2V0IHRoZSByYXRpb1xyXG4gICAgICAgIHRoaXMudXBkYXRlUGVnUG9zaXRpb24oKTsgLy8gdXBkYXRlIHRoZSBwZWcgcG9zaXRpb24gaW5mb3JtYXRpb25cclxuICAgICAgICB0aGlzLmJhbGxIaXR0aW5nUGVnRW1pdHRlci5lbWl0KCB0aGlzLmRpcmVjdGlvbiApOyAvLyBjYW4gcGxheSBhIHNvdW5kIHdoZW4gYmFsbCBoaXRzIHBlZztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMucGhhc2UgPT09IEJhbGxQaGFzZS5GQUxMSU5HICkgeyAvL2JhbGwgaXMgZmFsbGluZyBiZXR3ZWVuIHBlZ3NcclxuICAgICAgaWYgKCBkZiArIHRoaXMuZmFsbGVuUmF0aW8gPCAxICkgeyAvLyBpZiBiYWxsIGhhcyBub3QgcmVhY2hlZCB0aGUgbmV4dCBwZWdcclxuICAgICAgICB0aGlzLmZhbGxlblJhdGlvICs9IGRmOyAvLyBmYWxsIHNvbWUgbW9yZVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgeyAvLyB0aGUgYmFsbCBoYXMgcmVhY2hlZCB0aGUgdG9wIG9mIHRoZSBuZXh0IHBlZ1xyXG4gICAgICAgIHRoaXMuZmFsbGVuUmF0aW8gPSAwOyAvLyByZXNldCB0aGUgZmFsbGVuIHJhdGlvXHJcblxyXG4gICAgICAgIGlmICggdGhpcy5wZWdIaXN0b3J5Lmxlbmd0aCA+IDEgKSB7IC8vIGlmIGl0IGlzIG5vdCB0aGUgbGFzdCBwZWdcclxuICAgICAgICAgIHRoaXMudXBkYXRlUGVnUG9zaXRpb24oKTsgLy8gdXBkYXRlIHRoZSBuZXh0IHRvIGxhc3QgcGVnIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICB0aGlzLmJhbGxIaXR0aW5nUGVnRW1pdHRlci5lbWl0KCB0aGlzLmRpcmVjdGlvbiApOyAvLyBjYW4gcGxheSBhIHNvdW5kIHdoZW4gYmFsbCBoaXRzIHBlZztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7IC8vIGJhbGwgaXMgYXQgdGhlIHRvcCBvZiB0aGUgbGFzdCBwZWdcclxuICAgICAgICAgIHRoaXMucGhhc2UgPSBCYWxsUGhhc2UuRVhJVEVEOyAvLyBzd2l0Y2ggcGhhc2VzXHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVBlZ1Bvc2l0aW9uKCk7IC8vIHVwZGF0ZSB0aGUgbGFzdCBwZWcgaW5mb3JtYXRpb25cclxuICAgICAgICAgIHRoaXMuYmFsbE91dE9mUGVnc0VtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMucGhhc2UgPT09IEJhbGxQaGFzZS5FWElURUQgKSB7IC8vIHRoZSBiYWxsIGhhcyBleGl0ZWQgYW5kIGl0IGlzIG1ha2luZyBpdHMgd2F5IHRvIHRoZSBiaW5cclxuICAgICAgLy8gdGhlIHBvc2l0aW9uIGF0IHdoaWNoIHRoZSBiYWxscyB3aWxsIGV2ZW50dWFsbHkgbGFuZFxyXG4gICAgICBjb25zdCBmaW5hbFBvc2l0aW9uID0gdGhpcy5maW5hbEJpblZlcnRpY2FsT2Zmc2V0ICsgdGhpcy5wZWdTZXBhcmF0aW9uICogUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuUEVHX0hFSUdIVF9GUkFDVElPTl9PRkZTRVQ7XHJcbiAgICAgIGlmICggdGhpcy5wb3NpdGlvbi55ID4gZmluYWxQb3NpdGlvbiApIHsgLy8gaWYgaXQgaGFzIG5vdCBmYWxsZW4gdG8gaXRzIGZpbmFsIHBvc2l0aW9uXHJcblxyXG4gICAgICAgIC8vIFRoZSBjaGFuZ2UgaW4gdGhlIGZhbGxlbiByYXRpbyBuZWVkcyB0byBiZSBzY2FsZWQgYnkgdGhlIHBlZyBzZXBhcmF0aW9uIHNvIHRoYXQgaXQgbWF0Y2hlcyB0aGUgc3BlZWQgZXZlcnl3aGVyZSBlbHNlLlxyXG4gICAgICAgIC8vIE11bHRpcGx5IGJ5IDIgdG8gbWFrZSB0aGUgYmFsbHMgZmFsbCBhIGJpdCBmYXN0ZXIgb25jZSB0aGV5J3ZlIGVudGVyZWQgdGhlIGJpbnMsIHNlZSAjNjNcclxuICAgICAgICB0aGlzLmZhbGxlblJhdGlvICs9IDIgKiBkZiAqIHRoaXMucGVnU2VwYXJhdGlvbjtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnBoYXNlID0gQmFsbFBoYXNlLkNPTExFQ1RFRDsgLy8gc3dpdGNoIHBoYXNlc1xyXG4gICAgICAgIHRoaXMuYmFsbENvbGxlY3RlZEVtaXR0ZXIuZW1pdCgpOyAvLyBtYXJrIHRoZSBiYWxsIGZvciByZW1vdmFsXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIHBvc2l0aW9uIG9mIHRoZSBiYWxsXHJcbiAgICB0aGlzLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIHBvc2l0aW9uIG9mIHRoZSBiYWxsIGRlcGVuZGluZyBvbiB0aGUgcGhhc2UuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVQb3NpdGlvbigpIHtcclxuICAgIHN3aXRjaCggdGhpcy5waGFzZSApIHtcclxuXHJcbiAgICAgIC8vIGJhbGwgbGVmdCB0aGUgaG9wcGVyXHJcbiAgICAgIGNhc2UgQmFsbFBoYXNlLklOSVRJQUw6XHJcblxyXG4gICAgICAgIC8vIHdlIG9ubHkgd2FudCB0aGlzIHRvIG1vdmUgb25lIHBlZyBkaXN0YW5jZSBkb3duXHJcbiAgICAgICAgLy8gc2V0IHRoZSBwb3NpdGlvbiBiZSBhdCBzb21lIHBvaW50IGJldHdlZW4gdGhlIGhvcHBlciBhbmQgdGhlIGZpcnN0IHBlZ1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24uc2V0WFkoIDAsICggMSAtIHRoaXMuZmFsbGVuUmF0aW8gKSApO1xyXG5cclxuICAgICAgICAvLyBzY2FsZSBpdCBzbyB0aGF0IGl0IGRvZXMgbm90IG1vdmUgdG9vIG11Y2hcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLm11bHRpcGx5U2NhbGFyKCB0aGlzLnBlZ1NlcGFyYXRpb24gKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIHRoZSBwb3NpdGlvbiBvZiB0aGUgZmlyc3QgcGVnXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGRYWSggdGhpcy5wZWdQb3NpdGlvblgsIHRoaXMucGVnUG9zaXRpb25ZICk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAvLyBiYWxsIGlzIGZhbGxpbmcgdGhyb3VnaCB0aGUgcGVnc1xyXG4gICAgICBjYXNlIEJhbGxQaGFzZS5GQUxMSU5HOiB7XHJcblxyXG4gICAgICAgIC8vIHN0ZWVyIHRoZSBiYWxsIHRvIHRoZSBsZWZ0IG9yIHJpZ2h0IGRlcGVuZGluZyBvbiB0aGlzLmRpcmVjdGlvblxyXG4gICAgICAgIGNvbnN0IHNoaWZ0ID0gKCB0aGlzLmRpcmVjdGlvbiA9PT0gJ2xlZnQnICkgPyAtMC41IDogMC41O1xyXG5cclxuICAgICAgICAvLyBtaW1pYyB0aGUgZmFsbCBhcyBhIHBhcmFib2xpYyBtb3Rpb25cclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnNldFhZKCBzaGlmdCAqIHRoaXMuZmFsbGVuUmF0aW8sIC10aGlzLmZhbGxlblJhdGlvICogdGhpcy5mYWxsZW5SYXRpbyApO1xyXG5cclxuICAgICAgICAvLyBnZXQgdGhlIGJhbGwgYWxpZ25lZCB3aXRoIGl0cyBmaW5hbCB4IHBvc2l0aW9uIGluIHRoZSBiaW4uXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5tdWx0aXBseVNjYWxhciggdGhpcy5wZWdTZXBhcmF0aW9uICk7IC8vIHNjYWxlIHRoZSB2ZWN0b3IgYnkgdGhlIHBlZyBzZXBhcmF0aW9uXHJcblxyXG4gICAgICAgIC8vIGV4aXQgZnJvbSB0aGUgbGFzdCByb3cgd2l0aCB0aGUgY29ycmVjdCBhbGlnbm1lbnQgd2l0aCB0aGUgYmluXHJcbiAgICAgICAgaWYgKCB0aGlzLnJvdyA9PT0gdGhpcy5udW1iZXJPZlJvd3MgLSAxICkge1xyXG4gICAgICAgICAgLy8gdHJhbnNpdGlvblxyXG4gICAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGRYWSggdGhpcy5maW5hbEJpbkhvcml6b250YWxPZmZzZXQgKiB0aGlzLmZhbGxlblJhdGlvLCAwICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucG9zaXRpb24uYWRkWFkoIHRoaXMucGVnUG9zaXRpb25YLCB0aGlzLnBlZ1Bvc2l0aW9uWSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0aGUgYmFsbCBpcyBleGl0aW5nIHRoZSBwZWdzIGFuZCBtYWtpbmcgaXRzIHdheSB0byB0aGUgYmluXHJcbiAgICAgIGNhc2UgQmFsbFBoYXNlLkVYSVRFRDpcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnNldFhZKCB0aGlzLmZpbmFsQmluSG9yaXpvbnRhbE9mZnNldCwgLXRoaXMuZmFsbGVuUmF0aW8gKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZFhZKCB0aGlzLnBlZ1Bvc2l0aW9uWCwgdGhpcy5wZWdQb3NpdGlvblkgKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIC8vIHRoZSBiYWxsIGhhcyBsYW5kZWQgdG8gaXRzIGZpbmFsIHBvc2l0aW9uXHJcbiAgICAgIGNhc2UgQmFsbFBoYXNlLkNPTExFQ1RFRDpcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnNldFhZKCB0aGlzLmZpbmFsQmluSG9yaXpvbnRhbE9mZnNldCwgdGhpcy5maW5hbEJpblZlcnRpY2FsT2Zmc2V0ICk7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGRYWSggdGhpcy5wZWdQb3NpdGlvblgsIDAgKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgaW52YWxpZCBwaGFzZTogJHt0aGlzLnBoYXNlfWAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhZGQgYSB2ZXJ0aWNhbCBvZmZzZXQsIHN1Y2ggdGhhdCB0aGUgYmFsbHMgZG8gbm90IHJlYWNoIHRoZSBwZWdzIGJ1dCBhcmUgb3ZlciB0aGUgcGVncy5cclxuICAgIHRoaXMucG9zaXRpb24uYWRkWFkoIDAsIHRoaXMucGVnU2VwYXJhdGlvbiAqIFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLlBFR19IRUlHSFRfRlJBQ1RJT05fT0ZGU0VUICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZW5kcyB0aGUgdHJpZ2dlciB0byB1cGRhdGUgc3RhdGlzdGljcyBhbmQgbGFuZC5cclxuICAgKiBJZiB0aGUgYmFsbCBwaGFzZSBpcyBCYWxsUGhhc2UuSU5JVElBTCBpdCBkb2VzIG5vdGhpbmcuXHJcbiAgICogT3RoZXJ3aXNlIG5vdGlmaWVzIG9ic2VydmVycyBhbmQgY2hhbmdlcyB0aGUgcGhhc2UgdG8gQmFsbFBoYXNlLkNPTExFQ1RFRCB0byBtYWtlIHN1cmUgdGhlIHRyaWdnZXJzIG9ubHkgZ2V0IHNlbnQgb25jZS5cclxuICAgKiBUaGUgYmFsbCB3aWxsIG5vdCBiZSBzdGVwcGVkIHRocm91Z2ggdGhlIG90aGVyIGludGVybWVkaWF0ZSBwaGFzZXMuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdXBkYXRlU3RhdGlzdGljc0FuZExhbmQoKSB7XHJcbiAgICBpZiAoIHRoaXMucGhhc2UgPT09IEJhbGxQaGFzZS5JTklUSUFMICkge1xyXG5cclxuICAgICAgLy8gc2VuZCB0cmlnZ2Vyc1xyXG4gICAgICB0aGlzLmJhbGxPdXRPZlBlZ3NFbWl0dGVyLmVtaXQoKTtcclxuICAgICAgdGhpcy5iYWxsQ29sbGVjdGVkRW1pdHRlci5lbWl0KCk7XHJcblxyXG4gICAgICAvLyBjaGFuZ2UgcGhhc2UgdG8gaW5kaWNhdGUgdGhhdCBiYWxsIGhhcyBsYW5kZWQgaW4gYmluXHJcbiAgICAgIHRoaXMucGhhc2UgPSBCYWxsUGhhc2UuQ09MTEVDVEVEO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHBlZyBwb3NpdGlvbi5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGluaXRpYWxpemVQZWdQb3NpdGlvbigpIHtcclxuICAgIGNvbnN0IHBlZyA9IHRoaXMucGVnSGlzdG9yeVsgMCBdOyAvLyBnZXQgdGhlIGZpcnN0IHBlZyBmcm9tIHRoZSBwZWcgaGlzdG9yeVxyXG4gICAgdGhpcy5yb3cgPSBwZWcucm93TnVtYmVyOyAvLyAwIGlzIHRoZSBsZWZ0IG1vc3RcclxuICAgIHRoaXMucGVnUG9zaXRpb25YID0gcGVnLnBvc2l0aW9uWDsgLy8geCBwb3NpdGlvbiBvZiB0aGUgcGVnIGJhc2VkIG9uIHRoZSBjb2x1bW4sIHJvdywgYW5kIG51bWJlciBvZiBvZiByb3dzXHJcbiAgICB0aGlzLnBlZ1Bvc2l0aW9uWSA9IHBlZy5wb3NpdGlvblk7IC8vIHkgcG9zaXRpb24gb2YgdGhlIHBlZyBiYXNlZCBvbiB0aGUgY29sdW1uLCByb3csIGFuZCBudW1iZXIgb2Ygb2Ygcm93c1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgcGVnIHBvc2l0aW9uLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlUGVnUG9zaXRpb24oKSB7XHJcbiAgICBjb25zdCBwZWcgPSB0aGlzLnBlZ0hpc3Rvcnkuc2hpZnQoKTtcclxuICAgIHRoaXMucm93ID0gcGVnLnJvd051bWJlcjsgLy8gMCBpcyB0aGUgbGVmdG1vc3RcclxuICAgIHRoaXMucGVnUG9zaXRpb25YID0gcGVnLnBvc2l0aW9uWDsgLy8geCBwb3NpdGlvbiBvZiB0aGUgcGVnIGJhc2VkIG9uIHRoZSBjb2x1bW4sIHJvdywgYW5kIG51bWJlciBvZiBvZiByb3dzXHJcbiAgICB0aGlzLnBlZ1Bvc2l0aW9uWSA9IHBlZy5wb3NpdGlvblk7IC8vIHkgcG9zaXRpb24gb2YgdGhlIHBlZyBiYXNlZCBvbiB0aGUgY29sdW1uLCByb3csIGFuZCBudW1iZXIgb2Ygb2Ygcm93c1xyXG4gICAgdGhpcy5kaXJlY3Rpb24gPSBwZWcuZGlyZWN0aW9uOyAvLyB3aGV0aGVyIHRoZSBiYWxsIHdlbnQgbGVmdCBvciByaWdodFxyXG4gIH1cclxufVxyXG5cclxucGxpbmtvUHJvYmFiaWxpdHkucmVnaXN0ZXIoICdCYWxsJywgQmFsbCApO1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgWCBwb3NpdGlvbiBvZiBhIHBlZyB3aXRoIGluZGV4IHJvd051bWJlciBhbmQgY29sdW1uIE51bWJlclxyXG4gKiBUaGUgcG9zaXRpb24gaXMgZ2l2ZW4gaW4gdGhlIG1vZGVsIHZpZXcgKHdpdGggcmVzcGVjdCB0byB0aGUgZ2FsdG9uIGJvYXJkKVxyXG4gKlxyXG4gKiBAcGFyYW0ge251bWJlcn0gcm93TnVtYmVyXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2x1bW5OdW1iZXJcclxuICogQHBhcmFtIHtudW1iZXJ9IG51bWJlck9mUm93c1xyXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gKiBAcHVibGljXHJcbiAqL1xyXG5jb25zdCBnZXRQZWdQb3NpdGlvblggPSAoIHJvd051bWJlciwgY29sdW1uTnVtYmVyLCBudW1iZXJPZlJvd3MgKSA9PiAoIC1yb3dOdW1iZXIgLyAyICsgY29sdW1uTnVtYmVyICkgLyAoIG51bWJlck9mUm93cyArIDEgKTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIFkgcG9zaXRpb24gb2YgYSBwZWcgd2l0aCBpbmRleCByb3dOdW1iZXIgYW5kIGNvbHVtbiBOdW1iZXJcclxuICogVGhlIHBvc2l0aW9uIGlzIGdpdmVuIGluIHRoZSBtb2RlbCB2aWV3ICh3aXRoIHJlc3BlY3QgdG8gdGhlIGdhbHRvbiBib2FyZClcclxuICpcclxuICogQHBhcmFtIHtudW1iZXJ9IHJvd051bWJlclxyXG4gKiBAcGFyYW0ge251bWJlcn0gY29sdW1uTnVtYmVyXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXJPZlJvd3NcclxuICogQHJldHVybnMge251bWJlcn1cclxuICogQHB1YmxpY1xyXG4gKi9cclxuY29uc3QgZ2V0UGVnUG9zaXRpb25ZID0gKCByb3dOdW1iZXIsIGNvbHVtbk51bWJlciwgbnVtYmVyT2ZSb3dzICkgPT4gKCAtcm93TnVtYmVyIC0gMiAqIFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLlBFR19IRUlHSFRfRlJBQ1RJT05fT0ZGU0VUICkgLyAoIG51bWJlck9mUm93cyArIDEgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJhbGw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGlCQUFpQixNQUFNLDRCQUE0QjtBQUMxRCxPQUFPQywwQkFBMEIsTUFBTSxrQ0FBa0M7QUFDekUsT0FBT0MsU0FBUyxNQUFNLGdCQUFnQjtBQUN0QyxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBRTFDLE1BQU1DLElBQUksQ0FBQztFQUNUO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsV0FBVyxFQUFFQyxZQUFZLEVBQUVDLElBQUksRUFBRztJQUU3QztJQUNBLElBQUksQ0FBQ0MsUUFBUSxHQUFHLElBQUlWLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQUMsQ0FBQzs7SUFFckMsSUFBSSxDQUFDTyxXQUFXLEdBQUdBLFdBQVcsQ0FBQyxDQUFDO0lBQ2hDLElBQUksQ0FBQ0MsWUFBWSxHQUFHQSxZQUFZLENBQUMsQ0FBQzs7SUFFbEMsSUFBSSxDQUFDRyxhQUFhLEdBQUdQLFdBQVcsQ0FBQ1EsYUFBYSxDQUFFSixZQUFhLENBQUMsQ0FBQyxDQUFDOztJQUVoRSxJQUFJLENBQUNLLFVBQVUsR0FBRyxJQUFJLENBQUNGLGFBQWEsR0FBR1QsMEJBQTBCLENBQUNZLGtCQUFrQixDQUFDLENBQUU7O0lBRXZGLElBQUksQ0FBQ0MsS0FBSyxHQUFHWixTQUFTLENBQUNhLE9BQU8sQ0FBQyxDQUFDOztJQUVoQztJQUNBLElBQUksQ0FBQ0MscUJBQXFCLEdBQUcsSUFBSW5CLE9BQU8sQ0FBRTtN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