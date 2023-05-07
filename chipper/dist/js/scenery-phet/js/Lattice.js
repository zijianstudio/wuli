// Copyright 2017-2022, University of Colorado Boulder

/**
 * The lattice is a 2D grid with a value in each cell that represents the wave amplitude at that point.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Emitter from '../../axon/js/Emitter.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Matrix from '../../dot/js/Matrix.js';
import sceneryPhet from './sceneryPhet.js';

// constants

// The wave speed in the coordinate frame of the lattice, see http://www.mtnmath.com/whatth/node47.html. We tried
// different values, but they do not have the properer emergent behavior.  WAVE_SPEED=1 propagates out as a diamond
// rather than a circle, and WAVE_SPEED=0.1 is too slow and throws off the frequency of light.
const WAVE_SPEED = 0.5;
const WAVE_SPEED_SQUARED = WAVE_SPEED * WAVE_SPEED; // precompute to avoid work in the inner loop
const NUMBER_OF_MATRICES = 3; // The discretized wave equation algorithm requires current value + 2 history points

// This is the threshold for the wave value that determines if the light has visited.  If the value is higher,
// it will track the wavefront of the light more accurately (and hence could be used for more accurate computation of
// the speed of light), but will generate more artifacts in the initial wave.  If the value is lower, it will generate
// fewer artifacts in the initial propagation, but will lead the initial wavefront by too far and make it seem like
// light is faster than it should be measured (based on the propagation of wavefronts).
const LIGHT_VISIT_THRESHOLD = 1E-3;
class Lattice {
  // matrices for current value, previous value and value before previous
  matrices = [];

  // keeps track of which cells have been visited by the wave

  // tracks which cells could have been activated by an source disturbance, as opposed to a numerical
  // artifact or reflection.  See TemporalMask.  Initialize to 1 to support plane waves, which is never masked.
  // indicates the current matrix. Previous matrix is one higher (with correct modulus)
  currentMatrixIndex = 0;

  // sends a notification each time the lattice updates.
  changedEmitter = new Emitter();

  // Determines how far we have animated between the "last" and "current" matrices, so that we
  // can use getInterpolatedValue to update the view at 60fps even though the model is running at a slower rate.
  // See EventTimer.getRatio for more about this value.
  interpolationRatio = 0;

  // a Bounds2 representing the visible (non-damping) region of the lattice.

  static WAVE_SPEED = WAVE_SPEED;

  /**
   * @param width - width of the lattice (includes damping regions)
   * @param height - height of the lattice (includes damping regions)
   * @param dampX - number of cells on the left and again on the right to use for damping
   * @param dampY - number of cells on the top and again on the bottom to use for damping
   */
  constructor(width, height, dampX, dampY) {
    this.width = width;
    this.height = height;
    this.dampX = dampX;
    this.dampY = dampY;
    for (let i = 0; i < NUMBER_OF_MATRICES; i++) {
      this.matrices.push(new Matrix(width, height));
    }
    this.visitedMatrix = new Matrix(width, height);
    this.allowedMask = new Matrix(width, height, 1);
    this.width = width;
    this.height = height;
    this.visibleBounds = new Bounds2(this.dampX, this.dampY, this.width - this.dampX, this.height - this.dampY);
  }

  /**
   * Gets a Bounds2 representing the full region of the lattice, including damping regions.
   */
  getBounds() {
    return new Bounds2(0, 0, this.width, this.height);
  }

  /**
   * Returns true if the visible bounds contains the lattice coordinate
   * @param i - integer for the horizontal coordinate
   * @param j - integer for the vertical coordinate
   */
  visibleBoundsContains(i, j) {
    const b = this.visibleBounds;

    // Note this differs from the standard Bounds2.containsCoordinate because we must exclude right and bottom edge
    // from reading one cell off the visible lattice, see https://github.com/phetsims/wave-interference/issues/86
    return b.minX <= i && i < b.maxX && b.minY <= j && j < b.maxY;
  }

  /**
   * Returns true if the given coordinate is within the lattice
   * @param i - integer for the horizontal coordinate
   * @param j - integer for the vertical coordinate
   */
  contains(i, j) {
    return i >= 0 && i < this.width && j >= 0 && j < this.height;
  }

  /**
   * Read the values on the center line of the lattice (omits the out-of-bounds damping regions), for display in the
   * WaveAreaGraphNode
   * @param array - array to fill with the values for performance/memory, will be resized if necessary
   */
  getCenterLineValues(array) {
    const samplingWidth = this.width - this.dampX * 2;

    // Resize array if necessary
    if (array.length !== samplingWidth) {
      array.length = 0;
    }
    const samplingVerticalPosition = Math.floor(this.height / 2); // 50.5 is the center, but we want 50.0
    for (let i = 0; i < this.width - this.dampX * 2; i++) {
      array[i] = this.getCurrentValue(i + this.dampX, samplingVerticalPosition);
    }
  }

  /**
   * Returns the current value in the given cell, masked by the allowedMask.
   * @param i - horizontal integer coordinate
   * @param j - vertical integer coordinate
   */
  getCurrentValue(i, j) {
    return this.allowedMask.get(i, j) === 1 ? this.matrices[this.currentMatrixIndex].get(i, j) : 0;
  }

  /**
   * Returns the interpolated value of the given cell, masked by the allowedMask.
   * @param i - horizontal integer coordinate
   * @param j - vertical integer coordinate
   */
  getInterpolatedValue(i, j) {
    if (this.allowedMask.get(i, j) === 1) {
      const currentValue = this.getCurrentValue(i, j);
      const lastValue = this.getLastValue(i, j);
      return currentValue * this.interpolationRatio + lastValue * (1 - this.interpolationRatio);
    } else {
      return 0;
    }
  }

  /**
   * Sets the current value in the given cell
   * @param i - horizontal integer coordinate
   * @param j - vertical integer coordinate
   * @param value
   */
  setCurrentValue(i, j, value) {
    this.matrices[this.currentMatrixIndex].set(i, j, value);
  }

  /**
   * Returns the previous value in the given cell
   * @param i - horizontal integer coordinate
   * @param j - vertical integer coordinate
   */
  getLastValue(i, j) {
    return this.matrices[(this.currentMatrixIndex + 1) % this.matrices.length].get(i, j);
  }

  /**
   * Sets the previous value in the given cell
   * @param i - horizontal integer coordinate
   * @param j - vertical integer coordinate
   * @param value
   */
  setLastValue(i, j, value) {
    this.matrices[(this.currentMatrixIndex + 1) % this.matrices.length].set(i, j, value);
  }

  /**
   * In order to prevent numerical artifacts in the point source scenes, we use TemporalMask to identify which cells
   * have a value because of the source oscillation.
   * @param i
   * @param j
   * @param allowed - true if the temporal mask indicates that the value could have been caused by sources
   */
  setAllowed(i, j, allowed) {
    this.allowedMask.set(i, j, allowed ? 1 : 0);
  }

  /**
   * Determines whether the incoming wave has reached the cell.
   * @param i - horizontal coordinate to check
   * @param j - vertical coordinate to check
   */
  hasCellBeenVisited(i, j) {
    return this.visitedMatrix.get(i, j) === 1 && this.allowedMask.get(i, j) === 1;
  }

  /**
   * Resets all of the wave values to 0.
   */
  clear() {
    this.clearRight(0);
  }

  /**
   * Clear everything at and to the right of the specified column.
   * @param column - integer index of the column to start clearing at.
   */
  clearRight(column) {
    for (let i = column; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        for (let k = 0; k < this.matrices.length; k++) {
          this.matrices[k].set(i, j, 0);
        }
        this.visitedMatrix.set(i, j, 0);
        this.allowedMask.set(i, j, 1); // Initialize to 1 to support plane waves, which is never masked.
      }
    }

    this.changedEmitter.emit();
  }

  /**
   * Gets the values on the right hand side of the wave (before the damping region), for determining intensity.
   */
  getOutputColumn() {
    // This could be implemented in garbage-free from by require preallocating the entire intensitySample matrix and
    // using an index pointer like a circular array.  However, profiling in Mac Chrome did not show a significant
    // amount of time spent in this function, hence we use the simpler implementation.
    const column = [];
    for (let j = this.dampY; j < this.height - this.dampY; j++) {
      const a = this.getCurrentValue(this.width - this.dampX - 1, j);
      const b = this.getCurrentValue(this.width - this.dampX - 2, j);
      const v = (a + b) / 2;
      column.push(v);
    }
    return column;
  }

  /**
   * Propagates the wave by one step.  This is a discrete algorithm and cannot use dt.
   */
  step() {
    // Move to the next matrix
    this.currentMatrixIndex = (this.currentMatrixIndex - 1 + this.matrices.length) % this.matrices.length;
    const matrix0 = this.matrices[(this.currentMatrixIndex + 0) % this.matrices.length];
    const matrix1 = this.matrices[(this.currentMatrixIndex + 1) % this.matrices.length];
    const matrix2 = this.matrices[(this.currentMatrixIndex + 2) % this.matrices.length];
    const width = matrix0.getRowDimension();
    const height = matrix0.getColumnDimension();

    // Main loop, doesn't update cells on the edges
    for (let i = 1; i < width - 1; i++) {
      for (let j = 1; j < height - 1; j++) {
        const neighborSum = matrix1.get(i + 1, j) + matrix1.get(i - 1, j) + matrix1.get(i, j + 1) + matrix1.get(i, j - 1);
        const m1ij = matrix1.get(i, j);
        const value = m1ij * 2 - matrix2.get(i, j) + WAVE_SPEED_SQUARED * (neighborSum + m1ij * -4);
        matrix0.set(i, j, value);
        if (Math.abs(value) > LIGHT_VISIT_THRESHOLD) {
          this.visitedMatrix.set(i, j, 1);
        }
      }
    }

    // Numerical computation of absorbing boundary conditions, under the assumption that the wave is perpendicular
    // to the edge, see https://www.phy.ornl.gov/csep/sw/node22.html.  This assumption does not hold everywhere, but
    // it is a helpful approximation.
    // Note there is a Fortran error on the top boundary and in the equations, replace:
    // u2 => matrix1.get
    // u1 => matrix2.get
    // cb => WAVE_SPEED

    // Left edge
    let i = 0;
    for (let j = 0; j < height; j++) {
      const sum = matrix1.get(i, j) + matrix1.get(i + 1, j) - matrix2.get(i + 1, j) + WAVE_SPEED * (matrix1.get(i + 1, j) - matrix1.get(i, j) + matrix2.get(i + 1, j) - matrix2.get(i + 2, j));
      matrix0.set(i, j, sum);
    }

    // Right edge
    i = width - 1;
    for (let j = 0; j < height; j++) {
      const sum = matrix1.get(i, j) + matrix1.get(i - 1, j) - matrix2.get(i - 1, j) + WAVE_SPEED * (matrix1.get(i - 1, j) - matrix1.get(i, j) + matrix2.get(i - 1, j) - matrix2.get(i - 2, j));
      matrix0.set(i, j, sum);
    }

    // Top edge
    let j = 0;
    for (let i = 0; i < width; i++) {
      const sum = matrix1.get(i, j) + matrix1.get(i, j + 1) - matrix2.get(i, j + 1) + WAVE_SPEED * (matrix1.get(i, j + 1) - matrix1.get(i, j) + matrix2.get(i, j + 1) - matrix2.get(i, j + 2));
      matrix0.set(i, j, sum);
    }

    // Bottom edge
    j = height - 1;
    for (let i = 0; i < width; i++) {
      const sum = matrix1.get(i, j) + matrix1.get(i, j - 1) - matrix2.get(i, j - 1) + WAVE_SPEED * (matrix1.get(i, j - 1) - matrix1.get(i, j) + matrix2.get(i, j - 1) - matrix2.get(i, j - 2));
      matrix0.set(i, j, sum);
    }
  }
}
sceneryPhet.register('Lattice', Lattice);
export default Lattice;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiQm91bmRzMiIsIk1hdHJpeCIsInNjZW5lcnlQaGV0IiwiV0FWRV9TUEVFRCIsIldBVkVfU1BFRURfU1FVQVJFRCIsIk5VTUJFUl9PRl9NQVRSSUNFUyIsIkxJR0hUX1ZJU0lUX1RIUkVTSE9MRCIsIkxhdHRpY2UiLCJtYXRyaWNlcyIsImN1cnJlbnRNYXRyaXhJbmRleCIsImNoYW5nZWRFbWl0dGVyIiwiaW50ZXJwb2xhdGlvblJhdGlvIiwiY29uc3RydWN0b3IiLCJ3aWR0aCIsImhlaWdodCIsImRhbXBYIiwiZGFtcFkiLCJpIiwicHVzaCIsInZpc2l0ZWRNYXRyaXgiLCJhbGxvd2VkTWFzayIsInZpc2libGVCb3VuZHMiLCJnZXRCb3VuZHMiLCJ2aXNpYmxlQm91bmRzQ29udGFpbnMiLCJqIiwiYiIsIm1pblgiLCJtYXhYIiwibWluWSIsIm1heFkiLCJjb250YWlucyIsImdldENlbnRlckxpbmVWYWx1ZXMiLCJhcnJheSIsInNhbXBsaW5nV2lkdGgiLCJsZW5ndGgiLCJzYW1wbGluZ1ZlcnRpY2FsUG9zaXRpb24iLCJNYXRoIiwiZmxvb3IiLCJnZXRDdXJyZW50VmFsdWUiLCJnZXQiLCJnZXRJbnRlcnBvbGF0ZWRWYWx1ZSIsImN1cnJlbnRWYWx1ZSIsImxhc3RWYWx1ZSIsImdldExhc3RWYWx1ZSIsInNldEN1cnJlbnRWYWx1ZSIsInZhbHVlIiwic2V0Iiwic2V0TGFzdFZhbHVlIiwic2V0QWxsb3dlZCIsImFsbG93ZWQiLCJoYXNDZWxsQmVlblZpc2l0ZWQiLCJjbGVhciIsImNsZWFyUmlnaHQiLCJjb2x1bW4iLCJrIiwiZW1pdCIsImdldE91dHB1dENvbHVtbiIsImEiLCJ2Iiwic3RlcCIsIm1hdHJpeDAiLCJtYXRyaXgxIiwibWF0cml4MiIsImdldFJvd0RpbWVuc2lvbiIsImdldENvbHVtbkRpbWVuc2lvbiIsIm5laWdoYm9yU3VtIiwibTFpaiIsImFicyIsInN1bSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGF0dGljZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgbGF0dGljZSBpcyBhIDJEIGdyaWQgd2l0aCBhIHZhbHVlIGluIGVhY2ggY2VsbCB0aGF0IHJlcHJlc2VudHMgdGhlIHdhdmUgYW1wbGl0dWRlIGF0IHRoYXQgcG9pbnQuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgTWF0cml4IGZyb20gJy4uLy4uL2RvdC9qcy9NYXRyaXguanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuXHJcbi8vIFRoZSB3YXZlIHNwZWVkIGluIHRoZSBjb29yZGluYXRlIGZyYW1lIG9mIHRoZSBsYXR0aWNlLCBzZWUgaHR0cDovL3d3dy5tdG5tYXRoLmNvbS93aGF0dGgvbm9kZTQ3Lmh0bWwuIFdlIHRyaWVkXHJcbi8vIGRpZmZlcmVudCB2YWx1ZXMsIGJ1dCB0aGV5IGRvIG5vdCBoYXZlIHRoZSBwcm9wZXJlciBlbWVyZ2VudCBiZWhhdmlvci4gIFdBVkVfU1BFRUQ9MSBwcm9wYWdhdGVzIG91dCBhcyBhIGRpYW1vbmRcclxuLy8gcmF0aGVyIHRoYW4gYSBjaXJjbGUsIGFuZCBXQVZFX1NQRUVEPTAuMSBpcyB0b28gc2xvdyBhbmQgdGhyb3dzIG9mZiB0aGUgZnJlcXVlbmN5IG9mIGxpZ2h0LlxyXG5jb25zdCBXQVZFX1NQRUVEID0gMC41O1xyXG5jb25zdCBXQVZFX1NQRUVEX1NRVUFSRUQgPSBXQVZFX1NQRUVEICogV0FWRV9TUEVFRDsgLy8gcHJlY29tcHV0ZSB0byBhdm9pZCB3b3JrIGluIHRoZSBpbm5lciBsb29wXHJcbmNvbnN0IE5VTUJFUl9PRl9NQVRSSUNFUyA9IDM7IC8vIFRoZSBkaXNjcmV0aXplZCB3YXZlIGVxdWF0aW9uIGFsZ29yaXRobSByZXF1aXJlcyBjdXJyZW50IHZhbHVlICsgMiBoaXN0b3J5IHBvaW50c1xyXG5cclxuLy8gVGhpcyBpcyB0aGUgdGhyZXNob2xkIGZvciB0aGUgd2F2ZSB2YWx1ZSB0aGF0IGRldGVybWluZXMgaWYgdGhlIGxpZ2h0IGhhcyB2aXNpdGVkLiAgSWYgdGhlIHZhbHVlIGlzIGhpZ2hlcixcclxuLy8gaXQgd2lsbCB0cmFjayB0aGUgd2F2ZWZyb250IG9mIHRoZSBsaWdodCBtb3JlIGFjY3VyYXRlbHkgKGFuZCBoZW5jZSBjb3VsZCBiZSB1c2VkIGZvciBtb3JlIGFjY3VyYXRlIGNvbXB1dGF0aW9uIG9mXHJcbi8vIHRoZSBzcGVlZCBvZiBsaWdodCksIGJ1dCB3aWxsIGdlbmVyYXRlIG1vcmUgYXJ0aWZhY3RzIGluIHRoZSBpbml0aWFsIHdhdmUuICBJZiB0aGUgdmFsdWUgaXMgbG93ZXIsIGl0IHdpbGwgZ2VuZXJhdGVcclxuLy8gZmV3ZXIgYXJ0aWZhY3RzIGluIHRoZSBpbml0aWFsIHByb3BhZ2F0aW9uLCBidXQgd2lsbCBsZWFkIHRoZSBpbml0aWFsIHdhdmVmcm9udCBieSB0b28gZmFyIGFuZCBtYWtlIGl0IHNlZW0gbGlrZVxyXG4vLyBsaWdodCBpcyBmYXN0ZXIgdGhhbiBpdCBzaG91bGQgYmUgbWVhc3VyZWQgKGJhc2VkIG9uIHRoZSBwcm9wYWdhdGlvbiBvZiB3YXZlZnJvbnRzKS5cclxuY29uc3QgTElHSFRfVklTSVRfVEhSRVNIT0xEID0gMUUtMztcclxuXHJcbmNsYXNzIExhdHRpY2Uge1xyXG5cclxuICAvLyBtYXRyaWNlcyBmb3IgY3VycmVudCB2YWx1ZSwgcHJldmlvdXMgdmFsdWUgYW5kIHZhbHVlIGJlZm9yZSBwcmV2aW91c1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbWF0cmljZXM6IE1hdHJpeFtdID0gW107XHJcblxyXG4gIC8vIGtlZXBzIHRyYWNrIG9mIHdoaWNoIGNlbGxzIGhhdmUgYmVlbiB2aXNpdGVkIGJ5IHRoZSB3YXZlXHJcbiAgcHJpdmF0ZSByZWFkb25seSB2aXNpdGVkTWF0cml4OiBNYXRyaXg7XHJcblxyXG4gIC8vIHRyYWNrcyB3aGljaCBjZWxscyBjb3VsZCBoYXZlIGJlZW4gYWN0aXZhdGVkIGJ5IGFuIHNvdXJjZSBkaXN0dXJiYW5jZSwgYXMgb3Bwb3NlZCB0byBhIG51bWVyaWNhbFxyXG4gIC8vIGFydGlmYWN0IG9yIHJlZmxlY3Rpb24uICBTZWUgVGVtcG9yYWxNYXNrLiAgSW5pdGlhbGl6ZSB0byAxIHRvIHN1cHBvcnQgcGxhbmUgd2F2ZXMsIHdoaWNoIGlzIG5ldmVyIG1hc2tlZC5cclxuICBwcml2YXRlIHJlYWRvbmx5IGFsbG93ZWRNYXNrOiBNYXRyaXg7XHJcblxyXG4gIC8vIGluZGljYXRlcyB0aGUgY3VycmVudCBtYXRyaXguIFByZXZpb3VzIG1hdHJpeCBpcyBvbmUgaGlnaGVyICh3aXRoIGNvcnJlY3QgbW9kdWx1cylcclxuICBwcml2YXRlIGN1cnJlbnRNYXRyaXhJbmRleCA9IDA7XHJcblxyXG4gIC8vIHNlbmRzIGEgbm90aWZpY2F0aW9uIGVhY2ggdGltZSB0aGUgbGF0dGljZSB1cGRhdGVzLlxyXG4gIHB1YmxpYyByZWFkb25seSBjaGFuZ2VkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gIC8vIERldGVybWluZXMgaG93IGZhciB3ZSBoYXZlIGFuaW1hdGVkIGJldHdlZW4gdGhlIFwibGFzdFwiIGFuZCBcImN1cnJlbnRcIiBtYXRyaWNlcywgc28gdGhhdCB3ZVxyXG4gIC8vIGNhbiB1c2UgZ2V0SW50ZXJwb2xhdGVkVmFsdWUgdG8gdXBkYXRlIHRoZSB2aWV3IGF0IDYwZnBzIGV2ZW4gdGhvdWdoIHRoZSBtb2RlbCBpcyBydW5uaW5nIGF0IGEgc2xvd2VyIHJhdGUuXHJcbiAgLy8gU2VlIEV2ZW50VGltZXIuZ2V0UmF0aW8gZm9yIG1vcmUgYWJvdXQgdGhpcyB2YWx1ZS5cclxuICBwdWJsaWMgaW50ZXJwb2xhdGlvblJhdGlvID0gMDtcclxuXHJcbiAgLy8gYSBCb3VuZHMyIHJlcHJlc2VudGluZyB0aGUgdmlzaWJsZSAobm9uLWRhbXBpbmcpIHJlZ2lvbiBvZiB0aGUgbGF0dGljZS5cclxuICBwdWJsaWMgcmVhZG9ubHkgdmlzaWJsZUJvdW5kczogQm91bmRzMjtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBXQVZFX1NQRUVEID0gV0FWRV9TUEVFRDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHdpZHRoIC0gd2lkdGggb2YgdGhlIGxhdHRpY2UgKGluY2x1ZGVzIGRhbXBpbmcgcmVnaW9ucylcclxuICAgKiBAcGFyYW0gaGVpZ2h0IC0gaGVpZ2h0IG9mIHRoZSBsYXR0aWNlIChpbmNsdWRlcyBkYW1waW5nIHJlZ2lvbnMpXHJcbiAgICogQHBhcmFtIGRhbXBYIC0gbnVtYmVyIG9mIGNlbGxzIG9uIHRoZSBsZWZ0IGFuZCBhZ2FpbiBvbiB0aGUgcmlnaHQgdG8gdXNlIGZvciBkYW1waW5nXHJcbiAgICogQHBhcmFtIGRhbXBZIC0gbnVtYmVyIG9mIGNlbGxzIG9uIHRoZSB0b3AgYW5kIGFnYWluIG9uIHRoZSBib3R0b20gdG8gdXNlIGZvciBkYW1waW5nXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwdWJsaWMgcmVhZG9ubHkgd2lkdGg6IG51bWJlciwgcHVibGljIHJlYWRvbmx5IGhlaWdodDogbnVtYmVyLCBwdWJsaWMgcmVhZG9ubHkgZGFtcFg6IG51bWJlciwgcHVibGljIHJlYWRvbmx5IGRhbXBZOiBudW1iZXIgKSB7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgTlVNQkVSX09GX01BVFJJQ0VTOyBpKysgKSB7XHJcbiAgICAgIHRoaXMubWF0cmljZXMucHVzaCggbmV3IE1hdHJpeCggd2lkdGgsIGhlaWdodCApICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnZpc2l0ZWRNYXRyaXggPSBuZXcgTWF0cml4KCB3aWR0aCwgaGVpZ2h0ICk7XHJcbiAgICB0aGlzLmFsbG93ZWRNYXNrID0gbmV3IE1hdHJpeCggd2lkdGgsIGhlaWdodCwgMSApO1xyXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICB0aGlzLnZpc2libGVCb3VuZHMgPSBuZXcgQm91bmRzMiggdGhpcy5kYW1wWCwgdGhpcy5kYW1wWSwgdGhpcy53aWR0aCAtIHRoaXMuZGFtcFgsIHRoaXMuaGVpZ2h0IC0gdGhpcy5kYW1wWSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBhIEJvdW5kczIgcmVwcmVzZW50aW5nIHRoZSBmdWxsIHJlZ2lvbiBvZiB0aGUgbGF0dGljZSwgaW5jbHVkaW5nIGRhbXBpbmcgcmVnaW9ucy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Qm91bmRzKCk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIG5ldyBCb3VuZHMyKCAwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSB2aXNpYmxlIGJvdW5kcyBjb250YWlucyB0aGUgbGF0dGljZSBjb29yZGluYXRlXHJcbiAgICogQHBhcmFtIGkgLSBpbnRlZ2VyIGZvciB0aGUgaG9yaXpvbnRhbCBjb29yZGluYXRlXHJcbiAgICogQHBhcmFtIGogLSBpbnRlZ2VyIGZvciB0aGUgdmVydGljYWwgY29vcmRpbmF0ZVxyXG4gICAqL1xyXG4gIHB1YmxpYyB2aXNpYmxlQm91bmRzQ29udGFpbnMoIGk6IG51bWJlciwgajogbnVtYmVyICk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgYiA9IHRoaXMudmlzaWJsZUJvdW5kcztcclxuXHJcbiAgICAvLyBOb3RlIHRoaXMgZGlmZmVycyBmcm9tIHRoZSBzdGFuZGFyZCBCb3VuZHMyLmNvbnRhaW5zQ29vcmRpbmF0ZSBiZWNhdXNlIHdlIG11c3QgZXhjbHVkZSByaWdodCBhbmQgYm90dG9tIGVkZ2VcclxuICAgIC8vIGZyb20gcmVhZGluZyBvbmUgY2VsbCBvZmYgdGhlIHZpc2libGUgbGF0dGljZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93YXZlLWludGVyZmVyZW5jZS9pc3N1ZXMvODZcclxuICAgIHJldHVybiBiLm1pblggPD0gaSAmJiBpIDwgYi5tYXhYICYmIGIubWluWSA8PSBqICYmIGogPCBiLm1heFk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIGNvb3JkaW5hdGUgaXMgd2l0aGluIHRoZSBsYXR0aWNlXHJcbiAgICogQHBhcmFtIGkgLSBpbnRlZ2VyIGZvciB0aGUgaG9yaXpvbnRhbCBjb29yZGluYXRlXHJcbiAgICogQHBhcmFtIGogLSBpbnRlZ2VyIGZvciB0aGUgdmVydGljYWwgY29vcmRpbmF0ZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb250YWlucyggaTogbnVtYmVyLCBqOiBudW1iZXIgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gaSA+PSAwICYmIGkgPCB0aGlzLndpZHRoICYmIGogPj0gMCAmJiBqIDwgdGhpcy5oZWlnaHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWFkIHRoZSB2YWx1ZXMgb24gdGhlIGNlbnRlciBsaW5lIG9mIHRoZSBsYXR0aWNlIChvbWl0cyB0aGUgb3V0LW9mLWJvdW5kcyBkYW1waW5nIHJlZ2lvbnMpLCBmb3IgZGlzcGxheSBpbiB0aGVcclxuICAgKiBXYXZlQXJlYUdyYXBoTm9kZVxyXG4gICAqIEBwYXJhbSBhcnJheSAtIGFycmF5IHRvIGZpbGwgd2l0aCB0aGUgdmFsdWVzIGZvciBwZXJmb3JtYW5jZS9tZW1vcnksIHdpbGwgYmUgcmVzaXplZCBpZiBuZWNlc3NhcnlcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q2VudGVyTGluZVZhbHVlcyggYXJyYXk6IG51bWJlcltdICk6IHZvaWQge1xyXG4gICAgY29uc3Qgc2FtcGxpbmdXaWR0aCA9IHRoaXMud2lkdGggLSB0aGlzLmRhbXBYICogMjtcclxuXHJcbiAgICAvLyBSZXNpemUgYXJyYXkgaWYgbmVjZXNzYXJ5XHJcbiAgICBpZiAoIGFycmF5Lmxlbmd0aCAhPT0gc2FtcGxpbmdXaWR0aCApIHtcclxuICAgICAgYXJyYXkubGVuZ3RoID0gMDtcclxuICAgIH1cclxuICAgIGNvbnN0IHNhbXBsaW5nVmVydGljYWxQb3NpdGlvbiA9IE1hdGguZmxvb3IoIHRoaXMuaGVpZ2h0IC8gMiApOyAvLyA1MC41IGlzIHRoZSBjZW50ZXIsIGJ1dCB3ZSB3YW50IDUwLjBcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMud2lkdGggLSB0aGlzLmRhbXBYICogMjsgaSsrICkge1xyXG4gICAgICBhcnJheVsgaSBdID0gdGhpcy5nZXRDdXJyZW50VmFsdWUoIGkgKyB0aGlzLmRhbXBYLCBzYW1wbGluZ1ZlcnRpY2FsUG9zaXRpb24gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGN1cnJlbnQgdmFsdWUgaW4gdGhlIGdpdmVuIGNlbGwsIG1hc2tlZCBieSB0aGUgYWxsb3dlZE1hc2suXHJcbiAgICogQHBhcmFtIGkgLSBob3Jpem9udGFsIGludGVnZXIgY29vcmRpbmF0ZVxyXG4gICAqIEBwYXJhbSBqIC0gdmVydGljYWwgaW50ZWdlciBjb29yZGluYXRlXHJcbiAgICovXHJcbiAgcHVibGljIGdldEN1cnJlbnRWYWx1ZSggaTogbnVtYmVyLCBqOiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmFsbG93ZWRNYXNrLmdldCggaSwgaiApID09PSAxID8gdGhpcy5tYXRyaWNlc1sgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggXS5nZXQoIGksIGogKSA6IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBpbnRlcnBvbGF0ZWQgdmFsdWUgb2YgdGhlIGdpdmVuIGNlbGwsIG1hc2tlZCBieSB0aGUgYWxsb3dlZE1hc2suXHJcbiAgICogQHBhcmFtIGkgLSBob3Jpem9udGFsIGludGVnZXIgY29vcmRpbmF0ZVxyXG4gICAqIEBwYXJhbSBqIC0gdmVydGljYWwgaW50ZWdlciBjb29yZGluYXRlXHJcbiAgICovXHJcbiAgcHVibGljIGdldEludGVycG9sYXRlZFZhbHVlKCBpOiBudW1iZXIsIGo6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgaWYgKCB0aGlzLmFsbG93ZWRNYXNrLmdldCggaSwgaiApID09PSAxICkge1xyXG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSB0aGlzLmdldEN1cnJlbnRWYWx1ZSggaSwgaiApO1xyXG4gICAgICBjb25zdCBsYXN0VmFsdWUgPSB0aGlzLmdldExhc3RWYWx1ZSggaSwgaiApO1xyXG4gICAgICByZXR1cm4gY3VycmVudFZhbHVlICogdGhpcy5pbnRlcnBvbGF0aW9uUmF0aW8gKyBsYXN0VmFsdWUgKiAoIDEgLSB0aGlzLmludGVycG9sYXRpb25SYXRpbyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgY3VycmVudCB2YWx1ZSBpbiB0aGUgZ2l2ZW4gY2VsbFxyXG4gICAqIEBwYXJhbSBpIC0gaG9yaXpvbnRhbCBpbnRlZ2VyIGNvb3JkaW5hdGVcclxuICAgKiBAcGFyYW0gaiAtIHZlcnRpY2FsIGludGVnZXIgY29vcmRpbmF0ZVxyXG4gICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRDdXJyZW50VmFsdWUoIGk6IG51bWJlciwgajogbnVtYmVyLCB2YWx1ZTogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgdGhpcy5tYXRyaWNlc1sgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggXS5zZXQoIGksIGosIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBwcmV2aW91cyB2YWx1ZSBpbiB0aGUgZ2l2ZW4gY2VsbFxyXG4gICAqIEBwYXJhbSBpIC0gaG9yaXpvbnRhbCBpbnRlZ2VyIGNvb3JkaW5hdGVcclxuICAgKiBAcGFyYW0gaiAtIHZlcnRpY2FsIGludGVnZXIgY29vcmRpbmF0ZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0TGFzdFZhbHVlKCBpOiBudW1iZXIsIGo6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMubWF0cmljZXNbICggdGhpcy5jdXJyZW50TWF0cml4SW5kZXggKyAxICkgJSB0aGlzLm1hdHJpY2VzLmxlbmd0aCBdLmdldCggaSwgaiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgcHJldmlvdXMgdmFsdWUgaW4gdGhlIGdpdmVuIGNlbGxcclxuICAgKiBAcGFyYW0gaSAtIGhvcml6b250YWwgaW50ZWdlciBjb29yZGluYXRlXHJcbiAgICogQHBhcmFtIGogLSB2ZXJ0aWNhbCBpbnRlZ2VyIGNvb3JkaW5hdGVcclxuICAgKiBAcGFyYW0gdmFsdWVcclxuICAgKi9cclxuICBwcml2YXRlIHNldExhc3RWYWx1ZSggaTogbnVtYmVyLCBqOiBudW1iZXIsIHZhbHVlOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICB0aGlzLm1hdHJpY2VzWyAoIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ICsgMSApICUgdGhpcy5tYXRyaWNlcy5sZW5ndGggXS5zZXQoIGksIGosIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbiBvcmRlciB0byBwcmV2ZW50IG51bWVyaWNhbCBhcnRpZmFjdHMgaW4gdGhlIHBvaW50IHNvdXJjZSBzY2VuZXMsIHdlIHVzZSBUZW1wb3JhbE1hc2sgdG8gaWRlbnRpZnkgd2hpY2ggY2VsbHNcclxuICAgKiBoYXZlIGEgdmFsdWUgYmVjYXVzZSBvZiB0aGUgc291cmNlIG9zY2lsbGF0aW9uLlxyXG4gICAqIEBwYXJhbSBpXHJcbiAgICogQHBhcmFtIGpcclxuICAgKiBAcGFyYW0gYWxsb3dlZCAtIHRydWUgaWYgdGhlIHRlbXBvcmFsIG1hc2sgaW5kaWNhdGVzIHRoYXQgdGhlIHZhbHVlIGNvdWxkIGhhdmUgYmVlbiBjYXVzZWQgYnkgc291cmNlc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRBbGxvd2VkKCBpOiBudW1iZXIsIGo6IG51bWJlciwgYWxsb3dlZDogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIHRoaXMuYWxsb3dlZE1hc2suc2V0KCBpLCBqLCBhbGxvd2VkID8gMSA6IDAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciB0aGUgaW5jb21pbmcgd2F2ZSBoYXMgcmVhY2hlZCB0aGUgY2VsbC5cclxuICAgKiBAcGFyYW0gaSAtIGhvcml6b250YWwgY29vcmRpbmF0ZSB0byBjaGVja1xyXG4gICAqIEBwYXJhbSBqIC0gdmVydGljYWwgY29vcmRpbmF0ZSB0byBjaGVja1xyXG4gICAqL1xyXG4gIHB1YmxpYyBoYXNDZWxsQmVlblZpc2l0ZWQoIGk6IG51bWJlciwgajogbnVtYmVyICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMudmlzaXRlZE1hdHJpeC5nZXQoIGksIGogKSA9PT0gMSAmJiB0aGlzLmFsbG93ZWRNYXNrLmdldCggaSwgaiApID09PSAxO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIGFsbCBvZiB0aGUgd2F2ZSB2YWx1ZXMgdG8gMC5cclxuICAgKi9cclxuICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XHJcbiAgICB0aGlzLmNsZWFyUmlnaHQoIDAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFyIGV2ZXJ5dGhpbmcgYXQgYW5kIHRvIHRoZSByaWdodCBvZiB0aGUgc3BlY2lmaWVkIGNvbHVtbi5cclxuICAgKiBAcGFyYW0gY29sdW1uIC0gaW50ZWdlciBpbmRleCBvZiB0aGUgY29sdW1uIHRvIHN0YXJ0IGNsZWFyaW5nIGF0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjbGVhclJpZ2h0KCBjb2x1bW46IG51bWJlciApOiB2b2lkIHtcclxuICAgIGZvciAoIGxldCBpID0gY29sdW1uOyBpIDwgdGhpcy53aWR0aDsgaSsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLmhlaWdodDsgaisrICkge1xyXG4gICAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IHRoaXMubWF0cmljZXMubGVuZ3RoOyBrKysgKSB7XHJcbiAgICAgICAgICB0aGlzLm1hdHJpY2VzWyBrIF0uc2V0KCBpLCBqLCAwICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudmlzaXRlZE1hdHJpeC5zZXQoIGksIGosIDAgKTtcclxuICAgICAgICB0aGlzLmFsbG93ZWRNYXNrLnNldCggaSwgaiwgMSApOyAvLyBJbml0aWFsaXplIHRvIDEgdG8gc3VwcG9ydCBwbGFuZSB3YXZlcywgd2hpY2ggaXMgbmV2ZXIgbWFza2VkLlxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHZhbHVlcyBvbiB0aGUgcmlnaHQgaGFuZCBzaWRlIG9mIHRoZSB3YXZlIChiZWZvcmUgdGhlIGRhbXBpbmcgcmVnaW9uKSwgZm9yIGRldGVybWluaW5nIGludGVuc2l0eS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0T3V0cHV0Q29sdW1uKCk6IG51bWJlcltdIHtcclxuXHJcbiAgICAvLyBUaGlzIGNvdWxkIGJlIGltcGxlbWVudGVkIGluIGdhcmJhZ2UtZnJlZSBmcm9tIGJ5IHJlcXVpcmUgcHJlYWxsb2NhdGluZyB0aGUgZW50aXJlIGludGVuc2l0eVNhbXBsZSBtYXRyaXggYW5kXHJcbiAgICAvLyB1c2luZyBhbiBpbmRleCBwb2ludGVyIGxpa2UgYSBjaXJjdWxhciBhcnJheS4gIEhvd2V2ZXIsIHByb2ZpbGluZyBpbiBNYWMgQ2hyb21lIGRpZCBub3Qgc2hvdyBhIHNpZ25pZmljYW50XHJcbiAgICAvLyBhbW91bnQgb2YgdGltZSBzcGVudCBpbiB0aGlzIGZ1bmN0aW9uLCBoZW5jZSB3ZSB1c2UgdGhlIHNpbXBsZXIgaW1wbGVtZW50YXRpb24uXHJcbiAgICBjb25zdCBjb2x1bW4gPSBbXTtcclxuICAgIGZvciAoIGxldCBqID0gdGhpcy5kYW1wWTsgaiA8IHRoaXMuaGVpZ2h0IC0gdGhpcy5kYW1wWTsgaisrICkge1xyXG4gICAgICBjb25zdCBhID0gdGhpcy5nZXRDdXJyZW50VmFsdWUoIHRoaXMud2lkdGggLSB0aGlzLmRhbXBYIC0gMSwgaiApO1xyXG4gICAgICBjb25zdCBiID0gdGhpcy5nZXRDdXJyZW50VmFsdWUoIHRoaXMud2lkdGggLSB0aGlzLmRhbXBYIC0gMiwgaiApO1xyXG4gICAgICBjb25zdCB2ID0gKCBhICsgYiApIC8gMjtcclxuICAgICAgY29sdW1uLnB1c2goIHYgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBjb2x1bW47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQcm9wYWdhdGVzIHRoZSB3YXZlIGJ5IG9uZSBzdGVwLiAgVGhpcyBpcyBhIGRpc2NyZXRlIGFsZ29yaXRobSBhbmQgY2Fubm90IHVzZSBkdC5cclxuICAgKi9cclxuICBwdWJsaWMgc3RlcCgpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBNb3ZlIHRvIHRoZSBuZXh0IG1hdHJpeFxyXG4gICAgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggPSAoIHRoaXMuY3VycmVudE1hdHJpeEluZGV4IC0gMSArIHRoaXMubWF0cmljZXMubGVuZ3RoICkgJSB0aGlzLm1hdHJpY2VzLmxlbmd0aDtcclxuXHJcbiAgICBjb25zdCBtYXRyaXgwID0gdGhpcy5tYXRyaWNlc1sgKCB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCArIDAgKSAlIHRoaXMubWF0cmljZXMubGVuZ3RoIF07XHJcbiAgICBjb25zdCBtYXRyaXgxID0gdGhpcy5tYXRyaWNlc1sgKCB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCArIDEgKSAlIHRoaXMubWF0cmljZXMubGVuZ3RoIF07XHJcbiAgICBjb25zdCBtYXRyaXgyID0gdGhpcy5tYXRyaWNlc1sgKCB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCArIDIgKSAlIHRoaXMubWF0cmljZXMubGVuZ3RoIF07XHJcbiAgICBjb25zdCB3aWR0aCA9IG1hdHJpeDAuZ2V0Um93RGltZW5zaW9uKCk7XHJcbiAgICBjb25zdCBoZWlnaHQgPSBtYXRyaXgwLmdldENvbHVtbkRpbWVuc2lvbigpO1xyXG5cclxuICAgIC8vIE1haW4gbG9vcCwgZG9lc24ndCB1cGRhdGUgY2VsbHMgb24gdGhlIGVkZ2VzXHJcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCB3aWR0aCAtIDE7IGkrKyApIHtcclxuICAgICAgZm9yICggbGV0IGogPSAxOyBqIDwgaGVpZ2h0IC0gMTsgaisrICkge1xyXG4gICAgICAgIGNvbnN0IG5laWdoYm9yU3VtID0gbWF0cml4MS5nZXQoIGkgKyAxLCBqICkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0cml4MS5nZXQoIGkgLSAxLCBqICkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0cml4MS5nZXQoIGksIGogKyAxICkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0cml4MS5nZXQoIGksIGogLSAxICk7XHJcbiAgICAgICAgY29uc3QgbTFpaiA9IG1hdHJpeDEuZ2V0KCBpLCBqICk7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSBtMWlqICogMiAtIG1hdHJpeDIuZ2V0KCBpLCBqICkgKyBXQVZFX1NQRUVEX1NRVUFSRUQgKiAoIG5laWdoYm9yU3VtICsgbTFpaiAqIC00ICk7XHJcbiAgICAgICAgbWF0cml4MC5zZXQoIGksIGosIHZhbHVlICk7XHJcblxyXG4gICAgICAgIGlmICggTWF0aC5hYnMoIHZhbHVlICkgPiBMSUdIVF9WSVNJVF9USFJFU0hPTEQgKSB7XHJcbiAgICAgICAgICB0aGlzLnZpc2l0ZWRNYXRyaXguc2V0KCBpLCBqLCAxICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTnVtZXJpY2FsIGNvbXB1dGF0aW9uIG9mIGFic29yYmluZyBib3VuZGFyeSBjb25kaXRpb25zLCB1bmRlciB0aGUgYXNzdW1wdGlvbiB0aGF0IHRoZSB3YXZlIGlzIHBlcnBlbmRpY3VsYXJcclxuICAgIC8vIHRvIHRoZSBlZGdlLCBzZWUgaHR0cHM6Ly93d3cucGh5Lm9ybmwuZ292L2NzZXAvc3cvbm9kZTIyLmh0bWwuICBUaGlzIGFzc3VtcHRpb24gZG9lcyBub3QgaG9sZCBldmVyeXdoZXJlLCBidXRcclxuICAgIC8vIGl0IGlzIGEgaGVscGZ1bCBhcHByb3hpbWF0aW9uLlxyXG4gICAgLy8gTm90ZSB0aGVyZSBpcyBhIEZvcnRyYW4gZXJyb3Igb24gdGhlIHRvcCBib3VuZGFyeSBhbmQgaW4gdGhlIGVxdWF0aW9ucywgcmVwbGFjZTpcclxuICAgIC8vIHUyID0+IG1hdHJpeDEuZ2V0XHJcbiAgICAvLyB1MSA9PiBtYXRyaXgyLmdldFxyXG4gICAgLy8gY2IgPT4gV0FWRV9TUEVFRFxyXG5cclxuICAgIC8vIExlZnQgZWRnZVxyXG4gICAgbGV0IGkgPSAwO1xyXG4gICAgZm9yICggbGV0IGogPSAwOyBqIDwgaGVpZ2h0OyBqKysgKSB7XHJcbiAgICAgIGNvbnN0IHN1bSA9IG1hdHJpeDEuZ2V0KCBpLCBqICkgKyBtYXRyaXgxLmdldCggaSArIDEsIGogKSAtIG1hdHJpeDIuZ2V0KCBpICsgMSwgaiApICsgV0FWRV9TUEVFRCAqXHJcbiAgICAgICAgICAgICAgICAgICggbWF0cml4MS5nZXQoIGkgKyAxLCBqICkgLSBtYXRyaXgxLmdldCggaSwgaiApICsgbWF0cml4Mi5nZXQoIGkgKyAxLCBqICkgLSBtYXRyaXgyLmdldCggaSArIDIsIGogKSApO1xyXG4gICAgICBtYXRyaXgwLnNldCggaSwgaiwgc3VtICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmlnaHQgZWRnZVxyXG4gICAgaSA9IHdpZHRoIC0gMTtcclxuICAgIGZvciAoIGxldCBqID0gMDsgaiA8IGhlaWdodDsgaisrICkge1xyXG4gICAgICBjb25zdCBzdW0gPSBtYXRyaXgxLmdldCggaSwgaiApICsgbWF0cml4MS5nZXQoIGkgLSAxLCBqICkgLSBtYXRyaXgyLmdldCggaSAtIDEsIGogKSArIFdBVkVfU1BFRUQgKlxyXG4gICAgICAgICAgICAgICAgICAoIG1hdHJpeDEuZ2V0KCBpIC0gMSwgaiApIC0gbWF0cml4MS5nZXQoIGksIGogKSArIG1hdHJpeDIuZ2V0KCBpIC0gMSwgaiApIC0gbWF0cml4Mi5nZXQoIGkgLSAyLCBqICkgKTtcclxuICAgICAgbWF0cml4MC5zZXQoIGksIGosIHN1bSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRvcCBlZGdlXHJcbiAgICBsZXQgaiA9IDA7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB3aWR0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBzdW0gPSBtYXRyaXgxLmdldCggaSwgaiApICsgbWF0cml4MS5nZXQoIGksIGogKyAxICkgLSBtYXRyaXgyLmdldCggaSwgaiArIDEgKSArIFdBVkVfU1BFRUQgKlxyXG4gICAgICAgICAgICAgICAgICAoIG1hdHJpeDEuZ2V0KCBpLCBqICsgMSApIC0gbWF0cml4MS5nZXQoIGksIGogKSArIG1hdHJpeDIuZ2V0KCBpLCBqICsgMSApIC0gbWF0cml4Mi5nZXQoIGksIGogKyAyICkgKTtcclxuICAgICAgbWF0cml4MC5zZXQoIGksIGosIHN1bSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEJvdHRvbSBlZGdlXHJcbiAgICBqID0gaGVpZ2h0IC0gMTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHdpZHRoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHN1bSA9IG1hdHJpeDEuZ2V0KCBpLCBqICkgKyBtYXRyaXgxLmdldCggaSwgaiAtIDEgKSAtIG1hdHJpeDIuZ2V0KCBpLCBqIC0gMSApICsgV0FWRV9TUEVFRCAqXHJcbiAgICAgICAgICAgICAgICAgICggbWF0cml4MS5nZXQoIGksIGogLSAxICkgLSBtYXRyaXgxLmdldCggaSwgaiApICsgbWF0cml4Mi5nZXQoIGksIGogLSAxICkgLSBtYXRyaXgyLmdldCggaSwgaiAtIDIgKSApO1xyXG4gICAgICBtYXRyaXgwLnNldCggaSwgaiwgc3VtICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0xhdHRpY2UnLCBMYXR0aWNlICk7XHJcbmV4cG9ydCBkZWZhdWx0IExhdHRpY2U7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sMEJBQTBCO0FBQzlDLE9BQU9DLE9BQU8sTUFBTSx5QkFBeUI7QUFDN0MsT0FBT0MsTUFBTSxNQUFNLHdCQUF3QjtBQUMzQyxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCOztBQUUxQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQyxVQUFVLEdBQUcsR0FBRztBQUN0QixNQUFNQyxrQkFBa0IsR0FBR0QsVUFBVSxHQUFHQSxVQUFVLENBQUMsQ0FBQztBQUNwRCxNQUFNRSxrQkFBa0IsR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLHFCQUFxQixHQUFHLElBQUk7QUFFbEMsTUFBTUMsT0FBTyxDQUFDO0VBRVo7RUFDaUJDLFFBQVEsR0FBYSxFQUFFOztFQUV4Qzs7RUFHQTtFQUNBO0VBR0E7RUFDUUMsa0JBQWtCLEdBQUcsQ0FBQzs7RUFFOUI7RUFDZ0JDLGNBQWMsR0FBRyxJQUFJWCxPQUFPLENBQUMsQ0FBQzs7RUFFOUM7RUFDQTtFQUNBO0VBQ09ZLGtCQUFrQixHQUFHLENBQUM7O0VBRTdCOztFQUdBLE9BQXVCUixVQUFVLEdBQUdBLFVBQVU7O0VBRTlDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTUyxXQUFXQSxDQUFrQkMsS0FBYSxFQUFrQkMsTUFB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