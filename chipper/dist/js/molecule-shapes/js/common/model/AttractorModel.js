// Copyright 2013-2022, University of Colorado Boulder

/**
 * Contains the logic for applying an "attractor" force to a molecule that first:
 * (1) finds the closest VSEPR configuration (with rotation) to our current positions, and
 * (2) pushes the electron pairs towards those positions.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Matrix from '../../../../dot/js/Matrix.js';
import MatrixOps3 from '../../../../dot/js/MatrixOps3.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import pairs from '../../../../phet-core/js/pairs.js';
import moleculeShapes from '../../moleculeShapes.js';
import PairGroup from './PairGroup.js';

// just static calls, so just create an empty object
const AttractorModel = {};
moleculeShapes.register('AttractorModel', AttractorModel);

/**
 * Apply an attraction to the closest ideal position, with the given time elapsed
 * @public
 *
 * @param {Array.<PairGroup>} groups - An ordered list of pair groups that should be considered, along with the relevant permutations
 * @param {number} timeElapsed - Time elapsed (seconds)
 * @param {Array.<Vector3>} idealOrientations - An ideal position, that may be rotated.
 * @param {Array.<Permutation>} allowablePermutations - The un-rotated stable position that we are attracted towards
 * @param {Vector3} center - The point that the groups should be rotated around. Usually a central atom that all of the groups connect to
 * @returns {mapping: ResultMapping, error: number} A measure of total error (least squares-style)
 */
AttractorModel.applyAttractorForces = (groups, timeElapsed, idealOrientations, allowablePermutations, center, angleRepulsion, lastPermutation) => {
  const currentOrientations = _.map(groups, group => group.positionProperty.value.minus(center).normalized());
  const mapping = AttractorModel.findClosestMatchingConfiguration(currentOrientations, idealOrientations, allowablePermutations, lastPermutation);
  const aroundCenterAtom = center.equals(Vector3.ZERO);
  let totalDeltaMagnitude = 0;
  let i;

  // for each electron pair, push it towards its computed target
  for (i = 0; i < groups.length; i++) {
    const pair = groups[i];
    const targetOrientation = mapping.target.extractVector3(i);
    const currentMagnitude = pair.positionProperty.value.minus(center).magnitude;
    const targetPosition = targetOrientation.times(currentMagnitude).plus(center);
    const delta = targetPosition.minus(pair.positionProperty.value);
    totalDeltaMagnitude += delta.magnitude * delta.magnitude;

    /*
     * NOTE: adding delta here effectively is squaring the distance, thus more force when far from the target,
     * and less force when close to the target. This is important, since we want more force in a potentially
     * otherwise-stable position, and less force where our coulomb-like repulsion will settle it into a stable
     * position
     */
    const strength = timeElapsed * 3 * delta.magnitude;

    // change the velocity of all of the pairs, unless it is an atom at the origin!
    if (pair.isLonePair || !pair.isCentralAtom) {
      if (aroundCenterAtom) {
        pair.addVelocity(delta.times(strength));
      }
    }

    // position movement for faster convergence
    if (!pair.isCentralAtom && aroundCenterAtom) {
      // TODO: better way of not moving the center atom?
      pair.addPosition(delta.times(2.0 * timeElapsed));
    }

    // if we are a terminal lone pair, move us just with this but much more quickly
    if (!pair.isCentralAtom && !aroundCenterAtom) {
      pair.addPosition(delta.times(Math.min(20.0 * timeElapsed, 1)));
    }
  }
  const error = Math.sqrt(totalDeltaMagnitude);

  // angle-based repulsion
  if (angleRepulsion && aroundCenterAtom) {
    const pairIndexList = pairs(Utils.rangeInclusive(0, groups.length - 1));
    for (i = 0; i < pairIndexList.length; i++) {
      const pairIndices = pairIndexList[i];
      const aIndex = pairIndices[0];
      const bIndex = pairIndices[1];
      const a = groups[aIndex];
      const b = groups[bIndex];

      // current orientations w.r.t. the center
      const aOrientation = a.positionProperty.value.minus(center).normalized();
      const bOrientation = b.positionProperty.value.minus(center).normalized();

      // desired orientations
      const aTarget = mapping.target.extractVector3(aIndex).normalized();
      const bTarget = mapping.target.extractVector3(bIndex).normalized();
      const targetAngle = Math.acos(Utils.clamp(aTarget.dot(bTarget), -1, 1));
      const currentAngle = Math.acos(Utils.clamp(aOrientation.dot(bOrientation), -1, 1));
      const angleDifference = targetAngle - currentAngle;
      const dirTowardsA = a.positionProperty.value.minus(b.positionProperty.value).normalized();
      const timeFactor = PairGroup.getTimescaleImpulseFactor(timeElapsed);

      // Dampen our push if we switched permutations, see https://github.com/phetsims/molecule-shapes/issues/203
      const oscillationPreventionFactor = lastPermutation && !lastPermutation.equals(mapping.permutation) ? 0.5 : 1;
      const extraClosePushFactor = Utils.clamp(3 * Math.pow(Math.PI - currentAngle, 2) / (Math.PI * Math.PI), 1, 3);
      const push = dirTowardsA.times(oscillationPreventionFactor * timeFactor * angleDifference * PairGroup.ANGLE_REPULSION_SCALE * (currentAngle < targetAngle ? 2.0 : 0.5) * extraClosePushFactor);
      a.addVelocity(push);
      b.addVelocity(push.negated());
    }
  }
  return {
    mapping: mapping,
    error: error
  };
};

// maximum size of most computations is 3x6
const scratchXArray = new MatrixOps3.Array(18);
const scratchYArray = new MatrixOps3.Array(18);
const scratchIdealsArray = new MatrixOps3.Array(18);

/**
 * Find the closest VSEPR configuration for a particular molecule. Conceptually, we iterate through
 * each possible valid 1-to-1 mapping from electron pair to direction in our VSEPR geometry. For each
 * mapping, we calculate the rotation that makes the best match, and then calculate the error. We return
 * a result for the mapping (permutation) with the lowest error.
 * @public
 *
 * This uses a slightly modified rotation computation from http://igl.ethz.ch/projects/ARAP/svd_rot.pdf
 * (Least-Squares Rigid Motion Using SVD). Basically, we ignore the centroid and translation computations,
 * since we want everything to be rotated around the origin. We also don't weight the individual electron
 * pairs.
 *
 * Of note, the lower-index slots in the VSEPRConfiguration (Geometry) are for higher-repulsion
 * pair groups (the order is triple > double > lone pair > single). We need to iterate through all permutations,
 * but with the repulsion-ordering constraint (no single bond will be assigned a lower-index slot than a lone pair)
 * so we end up splitting the potential slots into bins for each repulsion type and iterating over all of the permutations.
 *
 * @param {Array.<Vector3>} currentOrientations - An ordered list of orientations (normalized) that should be considered, along with the relevant permutations
 * @param {Array.<Vector3>} idealOrientations - The un-rotated stable position that we are attracted towards
 * @param {Array.<Permutation>} allowablePermutations - A list of permutations that map stable positions to pair groups in order.
 * @param {Permutation} [lastPermutation]
 * @returns {ResultMapping} (see docs there)
 */
AttractorModel.findClosestMatchingConfiguration = (currentOrientations, idealOrientations, allowablePermutations, lastPermutation) => {
  const n = currentOrientations.length; // number of total pairs

  // y == electron pair positions
  const y = scratchYArray;
  MatrixOps3.setVectors3(currentOrientations, y);
  const x = scratchXArray;
  const ideals = scratchIdealsArray;
  MatrixOps3.setVectors3(idealOrientations, ideals);

  // closure over constant variables
  function calculateTarget(permutation) {
    // x == configuration positions
    MatrixOps3.permuteColumns(3, n, ideals, permutation, x);

    // compute the rotation matrix
    const rot = new Matrix(3, 3);
    AttractorModel.computeRotationMatrixWithTranspose(n, x, y, rot.entries);

    // target matrix, same shape as our y (current position) matrix
    const target = new Matrix(3, n);
    MatrixOps3.mult(3, 3, n, rot.entries, x, target.entries); // target = rot * x

    // calculate the error
    let error = 0;
    for (let i = 0; i < n * 3; i++) {
      const diff = y[i] - target.entries[i];
      error += diff * diff;
    }
    return new AttractorModel.ResultMapping(error, target, permutation, rot);
  }
  let bestResult = lastPermutation !== undefined ? calculateTarget(lastPermutation) : null;

  // TODO: log how effective the permutation checking is at removing the search space
  for (let pIndex = 0; pIndex < allowablePermutations.length; pIndex++) {
    const permutation = allowablePermutations[pIndex];
    if (n > 2 && bestResult !== null && bestResult.permutation !== permutation) {
      const permutedOrientation0 = idealOrientations[permutation.indices[0]];
      const permutedOrientation1 = idealOrientations[permutation.indices[1]];
      const errorLowBound = 4 - 4 * Math.cos(Math.abs(Math.acos(Utils.clamp(permutedOrientation0.dot(currentOrientations[0]), -1, 1)) - Math.acos(Utils.clamp(permutedOrientation1.dot(currentOrientations[1]), -1, 1))));

      // throw out results where this arbitrarily-chosen lower bound rules out the entire permutation
      if (bestResult.error < errorLowBound) {
        continue;
      }
    }
    const result = calculateTarget(permutation);
    if (bestResult === null || result.error < bestResult.error) {
      bestResult = result;
    }
  }
  return bestResult;
};

/**
 * Convenience for extracting orientations from an array of PairGroups
 * @public
 *
 * @param {Array.<PairGroup>} groups
 */
AttractorModel.getOrientationsFromOrigin = groups => _.map(groups, group => group.orientation);

// scratch matrices for the SVD calculations
const scratchMatrix = new MatrixOps3.Array(9);
const scratchU = new MatrixOps3.Array(9);
const scratchSigma = new MatrixOps3.Array(9);
const scratchV = new MatrixOps3.Array(9);

/**
 * In 3D, Given n points x_i and n points y_i, determine the rotation matrix that can be applied to the x_i such
 * that it minimizes the least-squares error between each x_i and y_i.
 * @private
 *
 * @param {number} n - Quantity of points
 * @param {MatrixOps3.Array} x - A 3xN MatrixOps3 matrix where each column represents a point x_i
 * @param {MatrixOps3.Array} y - A 3xN MatrixOps3 matrix where each column represents a point y_i
 * @param {MatrixOps3.Array} result - A 3x3 MatrixOps3 matrix where the rotation matrix result will be stored (there is no return value).
 */
AttractorModel.computeRotationMatrixWithTranspose = (n, x, y, result) => {
  // S = X * Y^T, in our case always 3x3
  const s = scratchMatrix;
  MatrixOps3.multRightTranspose(3, n, 3, x, y, s);

  // this code may loop infinitely on NaN, so we want to double-check
  assert && assert(!isNaN(s[0]));

  // Sets U, Sigma, V
  MatrixOps3.svd3(s, 5, scratchU, scratchSigma, scratchV);

  // If last fastSigma entry is negative, a reflection would have been a better match. Consider [1,0,0 0,1,0 0,0,-1]
  // multiplied in-between to reverse if that will help in the future.
  // result = V * U^T
  MatrixOps3.mult3RightTranspose(scratchV, scratchU, result);
};
AttractorModel.ResultMapping = class ResultMapping {
  /**
   * Result mapping between the current positions and ideal positions. Returned as a data object.
   * @public
   *
   * @param {number} error - Total error of this mapping
   * @param {Matrix} target - The positions of ideal pair groups
   * @param {Permutation} permutation - The permutation between current pair groups and ideal pair groups
   * @param {Matrix} rotation - The rotation between the current and ideal
   */
  constructor(error, target, permutation, rotation) {
    this.error = error;
    this.target = target;
    this.permutation = permutation;
    this.rotation = rotation;
  }

  /**
   * Returns a copy of the input vector, rotated from the "current" frame of reference to the "ideal" frame of
   * reference.
   * @public
   *
   * @param {Vector3} v
   */
  rotateVector(v) {
    const x = Matrix.columnVector3(v);
    const rotated = this.rotation.times(x);
    return rotated.extractVector3(0);
  }
};

/**
 * Call the function with each individual permutation of the list elements of "lists"
 * @private
 *
 * @param lists  List of lists. Order of lists will not change, however each possible permutation involving sub-lists will be used
 * @param callback Function to call
 */
AttractorModel.forEachMultiplePermutations = (lists, callback) => {
  if (lists.length === 0) {
    callback(lists);
  } else {
    // make a copy of 'lists'
    const remainder = lists.slice(0);
    const first = remainder[0];
    remainder.splice(0, 1);
    AttractorModel.forEachPermutation(first, [], permutedFirst => {
      AttractorModel.forEachMultiplePermutations(remainder, subLists => {
        const arr = new Array(lists.length);
        arr[0] = permutedFirst;
        for (let i = 0; i < subLists.length; i++) {
          arr[i + 1] = subLists[i];
        }
        callback(arr);
      });
    });
  }
};

/**
 * Call our function with each permutation of the provided list PREFIXED by prefix, in lexicographic order
 * @private
 *
 * @param list   List to generate permutations of
 * @param prefix   Elements that should be inserted at the front of each list before each call
 * @param callback Function to call
 */
AttractorModel.forEachPermutation = (list, prefix, callback) => {
  if (list.length === 0) {
    callback(prefix);
  } else {
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const newList = list.slice();
      newList.splice(newList.indexOf(element), 1);
      const newPrefix = prefix.slice();
      newPrefix.push(element);
      AttractorModel.forEachPermutation(newList, newPrefix, callback);
    }
  }
};

/**
 * Debugging aid for converting an array of arrays to a string.
 * @private
 *
 * @param {Array.<Array.<*>>} lists
 */
AttractorModel.listPrint = lists => {
  let ret = '';
  for (let i = 0; i < lists.length; i++) {
    const list = lists[i];
    ret += ' ';
    for (let j = 0; j < list.length; j++) {
      ret += list[j].toString();
    }
  }
  return ret;
};

/**
 * Testing function for permutations
 * @private
 */
AttractorModel.testMe = () => {
  /*
   Testing of permuting each individual list. Output:
   AB C DEF
   AB C DFE
   AB C EDF
   AB C EFD
   AB C FDE
   AB C FED
   BA C DEF
   BA C DFE
   BA C EDF
   BA C EFD
   BA C FDE
   BA C FED
   */

  const arr = [['A', 'B'], ['C'], ['D', 'E', 'F']];
  AttractorModel.forEachMultiplePermutations(arr, lists => {
    console.log(AttractorModel.listPrint(lists));
  });
};
export default AttractorModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXgiLCJNYXRyaXhPcHMzIiwiVXRpbHMiLCJWZWN0b3IzIiwicGFpcnMiLCJtb2xlY3VsZVNoYXBlcyIsIlBhaXJHcm91cCIsIkF0dHJhY3Rvck1vZGVsIiwicmVnaXN0ZXIiLCJhcHBseUF0dHJhY3RvckZvcmNlcyIsImdyb3VwcyIsInRpbWVFbGFwc2VkIiwiaWRlYWxPcmllbnRhdGlvbnMiLCJhbGxvd2FibGVQZXJtdXRhdGlvbnMiLCJjZW50ZXIiLCJhbmdsZVJlcHVsc2lvbiIsImxhc3RQZXJtdXRhdGlvbiIsImN1cnJlbnRPcmllbnRhdGlvbnMiLCJfIiwibWFwIiwiZ3JvdXAiLCJwb3NpdGlvblByb3BlcnR5IiwidmFsdWUiLCJtaW51cyIsIm5vcm1hbGl6ZWQiLCJtYXBwaW5nIiwiZmluZENsb3Nlc3RNYXRjaGluZ0NvbmZpZ3VyYXRpb24iLCJhcm91bmRDZW50ZXJBdG9tIiwiZXF1YWxzIiwiWkVSTyIsInRvdGFsRGVsdGFNYWduaXR1ZGUiLCJpIiwibGVuZ3RoIiwicGFpciIsInRhcmdldE9yaWVudGF0aW9uIiwidGFyZ2V0IiwiZXh0cmFjdFZlY3RvcjMiLCJjdXJyZW50TWFnbml0dWRlIiwibWFnbml0dWRlIiwidGFyZ2V0UG9zaXRpb24iLCJ0aW1lcyIsInBsdXMiLCJkZWx0YSIsInN0cmVuZ3RoIiwiaXNMb25lUGFpciIsImlzQ2VudHJhbEF0b20iLCJhZGRWZWxvY2l0eSIsImFkZFBvc2l0aW9uIiwiTWF0aCIsIm1pbiIsImVycm9yIiwic3FydCIsInBhaXJJbmRleExpc3QiLCJyYW5nZUluY2x1c2l2ZSIsInBhaXJJbmRpY2VzIiwiYUluZGV4IiwiYkluZGV4IiwiYSIsImIiLCJhT3JpZW50YXRpb24iLCJiT3JpZW50YXRpb24iLCJhVGFyZ2V0IiwiYlRhcmdldCIsInRhcmdldEFuZ2xlIiwiYWNvcyIsImNsYW1wIiwiZG90IiwiY3VycmVudEFuZ2xlIiwiYW5nbGVEaWZmZXJlbmNlIiwiZGlyVG93YXJkc0EiLCJ0aW1lRmFjdG9yIiwiZ2V0VGltZXNjYWxlSW1wdWxzZUZhY3RvciIsIm9zY2lsbGF0aW9uUHJldmVudGlvbkZhY3RvciIsInBlcm11dGF0aW9uIiwiZXh0cmFDbG9zZVB1c2hGYWN0b3IiLCJwb3ciLCJQSSIsInB1c2giLCJBTkdMRV9SRVBVTFNJT05fU0NBTEUiLCJuZWdhdGVkIiwic2NyYXRjaFhBcnJheSIsIkFycmF5Iiwic2NyYXRjaFlBcnJheSIsInNjcmF0Y2hJZGVhbHNBcnJheSIsIm4iLCJ5Iiwic2V0VmVjdG9yczMiLCJ4IiwiaWRlYWxzIiwiY2FsY3VsYXRlVGFyZ2V0IiwicGVybXV0ZUNvbHVtbnMiLCJyb3QiLCJjb21wdXRlUm90YXRpb25NYXRyaXhXaXRoVHJhbnNwb3NlIiwiZW50cmllcyIsIm11bHQiLCJkaWZmIiwiUmVzdWx0TWFwcGluZyIsImJlc3RSZXN1bHQiLCJ1bmRlZmluZWQiLCJwSW5kZXgiLCJwZXJtdXRlZE9yaWVudGF0aW9uMCIsImluZGljZXMiLCJwZXJtdXRlZE9yaWVudGF0aW9uMSIsImVycm9yTG93Qm91bmQiLCJjb3MiLCJhYnMiLCJyZXN1bHQiLCJnZXRPcmllbnRhdGlvbnNGcm9tT3JpZ2luIiwib3JpZW50YXRpb24iLCJzY3JhdGNoTWF0cml4Iiwic2NyYXRjaFUiLCJzY3JhdGNoU2lnbWEiLCJzY3JhdGNoViIsInMiLCJtdWx0UmlnaHRUcmFuc3Bvc2UiLCJhc3NlcnQiLCJpc05hTiIsInN2ZDMiLCJtdWx0M1JpZ2h0VHJhbnNwb3NlIiwiY29uc3RydWN0b3IiLCJyb3RhdGlvbiIsInJvdGF0ZVZlY3RvciIsInYiLCJjb2x1bW5WZWN0b3IzIiwicm90YXRlZCIsImZvckVhY2hNdWx0aXBsZVBlcm11dGF0aW9ucyIsImxpc3RzIiwiY2FsbGJhY2siLCJyZW1haW5kZXIiLCJzbGljZSIsImZpcnN0Iiwic3BsaWNlIiwiZm9yRWFjaFBlcm11dGF0aW9uIiwicGVybXV0ZWRGaXJzdCIsInN1Ykxpc3RzIiwiYXJyIiwibGlzdCIsInByZWZpeCIsImVsZW1lbnQiLCJuZXdMaXN0IiwiaW5kZXhPZiIsIm5ld1ByZWZpeCIsImxpc3RQcmludCIsInJldCIsImoiLCJ0b1N0cmluZyIsInRlc3RNZSIsImNvbnNvbGUiLCJsb2ciXSwic291cmNlcyI6WyJBdHRyYWN0b3JNb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250YWlucyB0aGUgbG9naWMgZm9yIGFwcGx5aW5nIGFuIFwiYXR0cmFjdG9yXCIgZm9yY2UgdG8gYSBtb2xlY3VsZSB0aGF0IGZpcnN0OlxyXG4gKiAoMSkgZmluZHMgdGhlIGNsb3Nlc3QgVlNFUFIgY29uZmlndXJhdGlvbiAod2l0aCByb3RhdGlvbikgdG8gb3VyIGN1cnJlbnQgcG9zaXRpb25zLCBhbmRcclxuICogKDIpIHB1c2hlcyB0aGUgZWxlY3Ryb24gcGFpcnMgdG93YXJkcyB0aG9zZSBwb3NpdGlvbnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgTWF0cml4IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXguanMnO1xyXG5pbXBvcnQgTWF0cml4T3BzMyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvTWF0cml4T3BzMy5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMy5qcyc7XHJcbmltcG9ydCBwYWlycyBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvcGFpcnMuanMnO1xyXG5pbXBvcnQgbW9sZWN1bGVTaGFwZXMgZnJvbSAnLi4vLi4vbW9sZWN1bGVTaGFwZXMuanMnO1xyXG5pbXBvcnQgUGFpckdyb3VwIGZyb20gJy4vUGFpckdyb3VwLmpzJztcclxuXHJcbi8vIGp1c3Qgc3RhdGljIGNhbGxzLCBzbyBqdXN0IGNyZWF0ZSBhbiBlbXB0eSBvYmplY3RcclxuY29uc3QgQXR0cmFjdG9yTW9kZWwgPSB7fTtcclxubW9sZWN1bGVTaGFwZXMucmVnaXN0ZXIoICdBdHRyYWN0b3JNb2RlbCcsIEF0dHJhY3Rvck1vZGVsICk7XHJcblxyXG4vKipcclxuICogQXBwbHkgYW4gYXR0cmFjdGlvbiB0byB0aGUgY2xvc2VzdCBpZGVhbCBwb3NpdGlvbiwgd2l0aCB0aGUgZ2l2ZW4gdGltZSBlbGFwc2VkXHJcbiAqIEBwdWJsaWNcclxuICpcclxuICogQHBhcmFtIHtBcnJheS48UGFpckdyb3VwPn0gZ3JvdXBzIC0gQW4gb3JkZXJlZCBsaXN0IG9mIHBhaXIgZ3JvdXBzIHRoYXQgc2hvdWxkIGJlIGNvbnNpZGVyZWQsIGFsb25nIHdpdGggdGhlIHJlbGV2YW50IHBlcm11dGF0aW9uc1xyXG4gKiBAcGFyYW0ge251bWJlcn0gdGltZUVsYXBzZWQgLSBUaW1lIGVsYXBzZWQgKHNlY29uZHMpXHJcbiAqIEBwYXJhbSB7QXJyYXkuPFZlY3RvcjM+fSBpZGVhbE9yaWVudGF0aW9ucyAtIEFuIGlkZWFsIHBvc2l0aW9uLCB0aGF0IG1heSBiZSByb3RhdGVkLlxyXG4gKiBAcGFyYW0ge0FycmF5LjxQZXJtdXRhdGlvbj59IGFsbG93YWJsZVBlcm11dGF0aW9ucyAtIFRoZSB1bi1yb3RhdGVkIHN0YWJsZSBwb3NpdGlvbiB0aGF0IHdlIGFyZSBhdHRyYWN0ZWQgdG93YXJkc1xyXG4gKiBAcGFyYW0ge1ZlY3RvcjN9IGNlbnRlciAtIFRoZSBwb2ludCB0aGF0IHRoZSBncm91cHMgc2hvdWxkIGJlIHJvdGF0ZWQgYXJvdW5kLiBVc3VhbGx5IGEgY2VudHJhbCBhdG9tIHRoYXQgYWxsIG9mIHRoZSBncm91cHMgY29ubmVjdCB0b1xyXG4gKiBAcmV0dXJucyB7bWFwcGluZzogUmVzdWx0TWFwcGluZywgZXJyb3I6IG51bWJlcn0gQSBtZWFzdXJlIG9mIHRvdGFsIGVycm9yIChsZWFzdCBzcXVhcmVzLXN0eWxlKVxyXG4gKi9cclxuQXR0cmFjdG9yTW9kZWwuYXBwbHlBdHRyYWN0b3JGb3JjZXMgPSAoIGdyb3VwcywgdGltZUVsYXBzZWQsIGlkZWFsT3JpZW50YXRpb25zLCBhbGxvd2FibGVQZXJtdXRhdGlvbnMsIGNlbnRlciwgYW5nbGVSZXB1bHNpb24sIGxhc3RQZXJtdXRhdGlvbiApID0+IHtcclxuICBjb25zdCBjdXJyZW50T3JpZW50YXRpb25zID0gXy5tYXAoIGdyb3VwcywgZ3JvdXAgPT4gZ3JvdXAucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5taW51cyggY2VudGVyICkubm9ybWFsaXplZCgpICk7XHJcbiAgY29uc3QgbWFwcGluZyA9IEF0dHJhY3Rvck1vZGVsLmZpbmRDbG9zZXN0TWF0Y2hpbmdDb25maWd1cmF0aW9uKCBjdXJyZW50T3JpZW50YXRpb25zLCBpZGVhbE9yaWVudGF0aW9ucywgYWxsb3dhYmxlUGVybXV0YXRpb25zLCBsYXN0UGVybXV0YXRpb24gKTtcclxuXHJcbiAgY29uc3QgYXJvdW5kQ2VudGVyQXRvbSA9IGNlbnRlci5lcXVhbHMoIFZlY3RvcjMuWkVSTyApO1xyXG5cclxuICBsZXQgdG90YWxEZWx0YU1hZ25pdHVkZSA9IDA7XHJcbiAgbGV0IGk7XHJcblxyXG4gIC8vIGZvciBlYWNoIGVsZWN0cm9uIHBhaXIsIHB1c2ggaXQgdG93YXJkcyBpdHMgY29tcHV0ZWQgdGFyZ2V0XHJcbiAgZm9yICggaSA9IDA7IGkgPCBncm91cHMubGVuZ3RoOyBpKysgKSB7XHJcblxyXG4gICAgY29uc3QgcGFpciA9IGdyb3Vwc1sgaSBdO1xyXG5cclxuICAgIGNvbnN0IHRhcmdldE9yaWVudGF0aW9uID0gbWFwcGluZy50YXJnZXQuZXh0cmFjdFZlY3RvcjMoIGkgKTtcclxuICAgIGNvbnN0IGN1cnJlbnRNYWduaXR1ZGUgPSAoIHBhaXIucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5taW51cyggY2VudGVyICkgKS5tYWduaXR1ZGU7XHJcbiAgICBjb25zdCB0YXJnZXRQb3NpdGlvbiA9IHRhcmdldE9yaWVudGF0aW9uLnRpbWVzKCBjdXJyZW50TWFnbml0dWRlICkucGx1cyggY2VudGVyICk7XHJcblxyXG4gICAgY29uc3QgZGVsdGEgPSB0YXJnZXRQb3NpdGlvbi5taW51cyggcGFpci5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICB0b3RhbERlbHRhTWFnbml0dWRlICs9IGRlbHRhLm1hZ25pdHVkZSAqIGRlbHRhLm1hZ25pdHVkZTtcclxuXHJcbiAgICAvKlxyXG4gICAgICogTk9URTogYWRkaW5nIGRlbHRhIGhlcmUgZWZmZWN0aXZlbHkgaXMgc3F1YXJpbmcgdGhlIGRpc3RhbmNlLCB0aHVzIG1vcmUgZm9yY2Ugd2hlbiBmYXIgZnJvbSB0aGUgdGFyZ2V0LFxyXG4gICAgICogYW5kIGxlc3MgZm9yY2Ugd2hlbiBjbG9zZSB0byB0aGUgdGFyZ2V0LiBUaGlzIGlzIGltcG9ydGFudCwgc2luY2Ugd2Ugd2FudCBtb3JlIGZvcmNlIGluIGEgcG90ZW50aWFsbHlcclxuICAgICAqIG90aGVyd2lzZS1zdGFibGUgcG9zaXRpb24sIGFuZCBsZXNzIGZvcmNlIHdoZXJlIG91ciBjb3Vsb21iLWxpa2UgcmVwdWxzaW9uIHdpbGwgc2V0dGxlIGl0IGludG8gYSBzdGFibGVcclxuICAgICAqIHBvc2l0aW9uXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IHN0cmVuZ3RoID0gdGltZUVsYXBzZWQgKiAzICogZGVsdGEubWFnbml0dWRlO1xyXG5cclxuICAgIC8vIGNoYW5nZSB0aGUgdmVsb2NpdHkgb2YgYWxsIG9mIHRoZSBwYWlycywgdW5sZXNzIGl0IGlzIGFuIGF0b20gYXQgdGhlIG9yaWdpbiFcclxuICAgIGlmICggcGFpci5pc0xvbmVQYWlyIHx8ICFwYWlyLmlzQ2VudHJhbEF0b20gKSB7XHJcbiAgICAgIGlmICggYXJvdW5kQ2VudGVyQXRvbSApIHtcclxuICAgICAgICBwYWlyLmFkZFZlbG9jaXR5KCBkZWx0YS50aW1lcyggc3RyZW5ndGggKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcG9zaXRpb24gbW92ZW1lbnQgZm9yIGZhc3RlciBjb252ZXJnZW5jZVxyXG4gICAgaWYgKCAhcGFpci5pc0NlbnRyYWxBdG9tICYmIGFyb3VuZENlbnRlckF0b20gKSB7IC8vIFRPRE86IGJldHRlciB3YXkgb2Ygbm90IG1vdmluZyB0aGUgY2VudGVyIGF0b20/XHJcbiAgICAgIHBhaXIuYWRkUG9zaXRpb24oIGRlbHRhLnRpbWVzKCAyLjAgKiB0aW1lRWxhcHNlZCApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgd2UgYXJlIGEgdGVybWluYWwgbG9uZSBwYWlyLCBtb3ZlIHVzIGp1c3Qgd2l0aCB0aGlzIGJ1dCBtdWNoIG1vcmUgcXVpY2tseVxyXG4gICAgaWYgKCAhcGFpci5pc0NlbnRyYWxBdG9tICYmICFhcm91bmRDZW50ZXJBdG9tICkge1xyXG4gICAgICBwYWlyLmFkZFBvc2l0aW9uKCBkZWx0YS50aW1lcyggTWF0aC5taW4oIDIwLjAgKiB0aW1lRWxhcHNlZCwgMSApICkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IGVycm9yID0gTWF0aC5zcXJ0KCB0b3RhbERlbHRhTWFnbml0dWRlICk7XHJcblxyXG4gIC8vIGFuZ2xlLWJhc2VkIHJlcHVsc2lvblxyXG4gIGlmICggYW5nbGVSZXB1bHNpb24gJiYgYXJvdW5kQ2VudGVyQXRvbSApIHtcclxuICAgIGNvbnN0IHBhaXJJbmRleExpc3QgPSBwYWlycyggVXRpbHMucmFuZ2VJbmNsdXNpdmUoIDAsIGdyb3Vwcy5sZW5ndGggLSAxICkgKTtcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgcGFpckluZGV4TGlzdC5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgcGFpckluZGljZXMgPSBwYWlySW5kZXhMaXN0WyBpIF07XHJcbiAgICAgIGNvbnN0IGFJbmRleCA9IHBhaXJJbmRpY2VzWyAwIF07XHJcbiAgICAgIGNvbnN0IGJJbmRleCA9IHBhaXJJbmRpY2VzWyAxIF07XHJcbiAgICAgIGNvbnN0IGEgPSBncm91cHNbIGFJbmRleCBdO1xyXG4gICAgICBjb25zdCBiID0gZ3JvdXBzWyBiSW5kZXggXTtcclxuXHJcbiAgICAgIC8vIGN1cnJlbnQgb3JpZW50YXRpb25zIHcuci50LiB0aGUgY2VudGVyXHJcbiAgICAgIGNvbnN0IGFPcmllbnRhdGlvbiA9IGEucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5taW51cyggY2VudGVyICkubm9ybWFsaXplZCgpO1xyXG4gICAgICBjb25zdCBiT3JpZW50YXRpb24gPSBiLnBvc2l0aW9uUHJvcGVydHkudmFsdWUubWludXMoIGNlbnRlciApLm5vcm1hbGl6ZWQoKTtcclxuXHJcbiAgICAgIC8vIGRlc2lyZWQgb3JpZW50YXRpb25zXHJcbiAgICAgIGNvbnN0IGFUYXJnZXQgPSBtYXBwaW5nLnRhcmdldC5leHRyYWN0VmVjdG9yMyggYUluZGV4ICkubm9ybWFsaXplZCgpO1xyXG4gICAgICBjb25zdCBiVGFyZ2V0ID0gbWFwcGluZy50YXJnZXQuZXh0cmFjdFZlY3RvcjMoIGJJbmRleCApLm5vcm1hbGl6ZWQoKTtcclxuICAgICAgY29uc3QgdGFyZ2V0QW5nbGUgPSBNYXRoLmFjb3MoIFV0aWxzLmNsYW1wKCBhVGFyZ2V0LmRvdCggYlRhcmdldCApLCAtMSwgMSApICk7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRBbmdsZSA9IE1hdGguYWNvcyggVXRpbHMuY2xhbXAoIGFPcmllbnRhdGlvbi5kb3QoIGJPcmllbnRhdGlvbiApLCAtMSwgMSApICk7XHJcbiAgICAgIGNvbnN0IGFuZ2xlRGlmZmVyZW5jZSA9ICggdGFyZ2V0QW5nbGUgLSBjdXJyZW50QW5nbGUgKTtcclxuXHJcbiAgICAgIGNvbnN0IGRpclRvd2FyZHNBID0gYS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLm1pbnVzKCBiLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKS5ub3JtYWxpemVkKCk7XHJcbiAgICAgIGNvbnN0IHRpbWVGYWN0b3IgPSBQYWlyR3JvdXAuZ2V0VGltZXNjYWxlSW1wdWxzZUZhY3RvciggdGltZUVsYXBzZWQgKTtcclxuXHJcbiAgICAgIC8vIERhbXBlbiBvdXIgcHVzaCBpZiB3ZSBzd2l0Y2hlZCBwZXJtdXRhdGlvbnMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbW9sZWN1bGUtc2hhcGVzL2lzc3Vlcy8yMDNcclxuICAgICAgY29uc3Qgb3NjaWxsYXRpb25QcmV2ZW50aW9uRmFjdG9yID0gKCBsYXN0UGVybXV0YXRpb24gJiYgIWxhc3RQZXJtdXRhdGlvbi5lcXVhbHMoIG1hcHBpbmcucGVybXV0YXRpb24gKSApID8gMC41IDogMTtcclxuXHJcbiAgICAgIGNvbnN0IGV4dHJhQ2xvc2VQdXNoRmFjdG9yID0gVXRpbHMuY2xhbXAoIDMgKiBNYXRoLnBvdyggTWF0aC5QSSAtIGN1cnJlbnRBbmdsZSwgMiApIC8gKCBNYXRoLlBJICogTWF0aC5QSSApLCAxLCAzICk7XHJcblxyXG4gICAgICBjb25zdCBwdXNoID0gZGlyVG93YXJkc0EudGltZXMoIG9zY2lsbGF0aW9uUHJldmVudGlvbkZhY3RvciAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZUZhY3RvciAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5nbGVEaWZmZXJlbmNlICpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQYWlyR3JvdXAuQU5HTEVfUkVQVUxTSU9OX1NDQUxFICpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIGN1cnJlbnRBbmdsZSA8IHRhcmdldEFuZ2xlID8gMi4wIDogMC41ICkgKlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhQ2xvc2VQdXNoRmFjdG9yICk7XHJcbiAgICAgIGEuYWRkVmVsb2NpdHkoIHB1c2ggKTtcclxuICAgICAgYi5hZGRWZWxvY2l0eSggcHVzaC5uZWdhdGVkKCkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7IG1hcHBpbmc6IG1hcHBpbmcsIGVycm9yOiBlcnJvciB9O1xyXG59O1xyXG5cclxuLy8gbWF4aW11bSBzaXplIG9mIG1vc3QgY29tcHV0YXRpb25zIGlzIDN4NlxyXG5jb25zdCBzY3JhdGNoWEFycmF5ID0gbmV3IE1hdHJpeE9wczMuQXJyYXkoIDE4ICk7XHJcbmNvbnN0IHNjcmF0Y2hZQXJyYXkgPSBuZXcgTWF0cml4T3BzMy5BcnJheSggMTggKTtcclxuY29uc3Qgc2NyYXRjaElkZWFsc0FycmF5ID0gbmV3IE1hdHJpeE9wczMuQXJyYXkoIDE4ICk7XHJcblxyXG4vKipcclxuICogRmluZCB0aGUgY2xvc2VzdCBWU0VQUiBjb25maWd1cmF0aW9uIGZvciBhIHBhcnRpY3VsYXIgbW9sZWN1bGUuIENvbmNlcHR1YWxseSwgd2UgaXRlcmF0ZSB0aHJvdWdoXHJcbiAqIGVhY2ggcG9zc2libGUgdmFsaWQgMS10by0xIG1hcHBpbmcgZnJvbSBlbGVjdHJvbiBwYWlyIHRvIGRpcmVjdGlvbiBpbiBvdXIgVlNFUFIgZ2VvbWV0cnkuIEZvciBlYWNoXHJcbiAqIG1hcHBpbmcsIHdlIGNhbGN1bGF0ZSB0aGUgcm90YXRpb24gdGhhdCBtYWtlcyB0aGUgYmVzdCBtYXRjaCwgYW5kIHRoZW4gY2FsY3VsYXRlIHRoZSBlcnJvci4gV2UgcmV0dXJuXHJcbiAqIGEgcmVzdWx0IGZvciB0aGUgbWFwcGluZyAocGVybXV0YXRpb24pIHdpdGggdGhlIGxvd2VzdCBlcnJvci5cclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBUaGlzIHVzZXMgYSBzbGlnaHRseSBtb2RpZmllZCByb3RhdGlvbiBjb21wdXRhdGlvbiBmcm9tIGh0dHA6Ly9pZ2wuZXRoei5jaC9wcm9qZWN0cy9BUkFQL3N2ZF9yb3QucGRmXHJcbiAqIChMZWFzdC1TcXVhcmVzIFJpZ2lkIE1vdGlvbiBVc2luZyBTVkQpLiBCYXNpY2FsbHksIHdlIGlnbm9yZSB0aGUgY2VudHJvaWQgYW5kIHRyYW5zbGF0aW9uIGNvbXB1dGF0aW9ucyxcclxuICogc2luY2Ugd2Ugd2FudCBldmVyeXRoaW5nIHRvIGJlIHJvdGF0ZWQgYXJvdW5kIHRoZSBvcmlnaW4uIFdlIGFsc28gZG9uJ3Qgd2VpZ2h0IHRoZSBpbmRpdmlkdWFsIGVsZWN0cm9uXHJcbiAqIHBhaXJzLlxyXG4gKlxyXG4gKiBPZiBub3RlLCB0aGUgbG93ZXItaW5kZXggc2xvdHMgaW4gdGhlIFZTRVBSQ29uZmlndXJhdGlvbiAoR2VvbWV0cnkpIGFyZSBmb3IgaGlnaGVyLXJlcHVsc2lvblxyXG4gKiBwYWlyIGdyb3VwcyAodGhlIG9yZGVyIGlzIHRyaXBsZSA+IGRvdWJsZSA+IGxvbmUgcGFpciA+IHNpbmdsZSkuIFdlIG5lZWQgdG8gaXRlcmF0ZSB0aHJvdWdoIGFsbCBwZXJtdXRhdGlvbnMsXHJcbiAqIGJ1dCB3aXRoIHRoZSByZXB1bHNpb24tb3JkZXJpbmcgY29uc3RyYWludCAobm8gc2luZ2xlIGJvbmQgd2lsbCBiZSBhc3NpZ25lZCBhIGxvd2VyLWluZGV4IHNsb3QgdGhhbiBhIGxvbmUgcGFpcilcclxuICogc28gd2UgZW5kIHVwIHNwbGl0dGluZyB0aGUgcG90ZW50aWFsIHNsb3RzIGludG8gYmlucyBmb3IgZWFjaCByZXB1bHNpb24gdHlwZSBhbmQgaXRlcmF0aW5nIG92ZXIgYWxsIG9mIHRoZSBwZXJtdXRhdGlvbnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXkuPFZlY3RvcjM+fSBjdXJyZW50T3JpZW50YXRpb25zIC0gQW4gb3JkZXJlZCBsaXN0IG9mIG9yaWVudGF0aW9ucyAobm9ybWFsaXplZCkgdGhhdCBzaG91bGQgYmUgY29uc2lkZXJlZCwgYWxvbmcgd2l0aCB0aGUgcmVsZXZhbnQgcGVybXV0YXRpb25zXHJcbiAqIEBwYXJhbSB7QXJyYXkuPFZlY3RvcjM+fSBpZGVhbE9yaWVudGF0aW9ucyAtIFRoZSB1bi1yb3RhdGVkIHN0YWJsZSBwb3NpdGlvbiB0aGF0IHdlIGFyZSBhdHRyYWN0ZWQgdG93YXJkc1xyXG4gKiBAcGFyYW0ge0FycmF5LjxQZXJtdXRhdGlvbj59IGFsbG93YWJsZVBlcm11dGF0aW9ucyAtIEEgbGlzdCBvZiBwZXJtdXRhdGlvbnMgdGhhdCBtYXAgc3RhYmxlIHBvc2l0aW9ucyB0byBwYWlyIGdyb3VwcyBpbiBvcmRlci5cclxuICogQHBhcmFtIHtQZXJtdXRhdGlvbn0gW2xhc3RQZXJtdXRhdGlvbl1cclxuICogQHJldHVybnMge1Jlc3VsdE1hcHBpbmd9IChzZWUgZG9jcyB0aGVyZSlcclxuICovXHJcbkF0dHJhY3Rvck1vZGVsLmZpbmRDbG9zZXN0TWF0Y2hpbmdDb25maWd1cmF0aW9uID0gKCBjdXJyZW50T3JpZW50YXRpb25zLCBpZGVhbE9yaWVudGF0aW9ucywgYWxsb3dhYmxlUGVybXV0YXRpb25zLCBsYXN0UGVybXV0YXRpb24gKSA9PiB7XHJcbiAgY29uc3QgbiA9IGN1cnJlbnRPcmllbnRhdGlvbnMubGVuZ3RoOyAvLyBudW1iZXIgb2YgdG90YWwgcGFpcnNcclxuXHJcbiAgLy8geSA9PSBlbGVjdHJvbiBwYWlyIHBvc2l0aW9uc1xyXG4gIGNvbnN0IHkgPSBzY3JhdGNoWUFycmF5O1xyXG4gIE1hdHJpeE9wczMuc2V0VmVjdG9yczMoIGN1cnJlbnRPcmllbnRhdGlvbnMsIHkgKTtcclxuXHJcbiAgY29uc3QgeCA9IHNjcmF0Y2hYQXJyYXk7XHJcblxyXG4gIGNvbnN0IGlkZWFscyA9IHNjcmF0Y2hJZGVhbHNBcnJheTtcclxuICBNYXRyaXhPcHMzLnNldFZlY3RvcnMzKCBpZGVhbE9yaWVudGF0aW9ucywgaWRlYWxzICk7XHJcblxyXG5cclxuICAvLyBjbG9zdXJlIG92ZXIgY29uc3RhbnQgdmFyaWFibGVzXHJcbiAgZnVuY3Rpb24gY2FsY3VsYXRlVGFyZ2V0KCBwZXJtdXRhdGlvbiApIHtcclxuICAgIC8vIHggPT0gY29uZmlndXJhdGlvbiBwb3NpdGlvbnNcclxuICAgIE1hdHJpeE9wczMucGVybXV0ZUNvbHVtbnMoIDMsIG4sIGlkZWFscywgcGVybXV0YXRpb24sIHggKTtcclxuXHJcbiAgICAvLyBjb21wdXRlIHRoZSByb3RhdGlvbiBtYXRyaXhcclxuICAgIGNvbnN0IHJvdCA9IG5ldyBNYXRyaXgoIDMsIDMgKTtcclxuICAgIEF0dHJhY3Rvck1vZGVsLmNvbXB1dGVSb3RhdGlvbk1hdHJpeFdpdGhUcmFuc3Bvc2UoIG4sIHgsIHksIHJvdC5lbnRyaWVzICk7XHJcblxyXG4gICAgLy8gdGFyZ2V0IG1hdHJpeCwgc2FtZSBzaGFwZSBhcyBvdXIgeSAoY3VycmVudCBwb3NpdGlvbikgbWF0cml4XHJcbiAgICBjb25zdCB0YXJnZXQgPSBuZXcgTWF0cml4KCAzLCBuICk7XHJcbiAgICBNYXRyaXhPcHMzLm11bHQoIDMsIDMsIG4sIHJvdC5lbnRyaWVzLCB4LCB0YXJnZXQuZW50cmllcyApOyAvLyB0YXJnZXQgPSByb3QgKiB4XHJcblxyXG4gICAgLy8gY2FsY3VsYXRlIHRoZSBlcnJvclxyXG4gICAgbGV0IGVycm9yID0gMDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG4gKiAzOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGRpZmYgPSB5WyBpIF0gLSB0YXJnZXQuZW50cmllc1sgaSBdO1xyXG4gICAgICBlcnJvciArPSBkaWZmICogZGlmZjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IEF0dHJhY3Rvck1vZGVsLlJlc3VsdE1hcHBpbmcoIGVycm9yLCB0YXJnZXQsIHBlcm11dGF0aW9uLCByb3QgKTtcclxuICB9XHJcblxyXG4gIGxldCBiZXN0UmVzdWx0ID0gbGFzdFBlcm11dGF0aW9uICE9PSB1bmRlZmluZWQgPyBjYWxjdWxhdGVUYXJnZXQoIGxhc3RQZXJtdXRhdGlvbiApIDogbnVsbDtcclxuXHJcbiAgLy8gVE9ETzogbG9nIGhvdyBlZmZlY3RpdmUgdGhlIHBlcm11dGF0aW9uIGNoZWNraW5nIGlzIGF0IHJlbW92aW5nIHRoZSBzZWFyY2ggc3BhY2VcclxuICBmb3IgKCBsZXQgcEluZGV4ID0gMDsgcEluZGV4IDwgYWxsb3dhYmxlUGVybXV0YXRpb25zLmxlbmd0aDsgcEluZGV4KysgKSB7XHJcbiAgICBjb25zdCBwZXJtdXRhdGlvbiA9IGFsbG93YWJsZVBlcm11dGF0aW9uc1sgcEluZGV4IF07XHJcblxyXG4gICAgaWYgKCBuID4gMiAmJiBiZXN0UmVzdWx0ICE9PSBudWxsICYmIGJlc3RSZXN1bHQucGVybXV0YXRpb24gIT09IHBlcm11dGF0aW9uICkge1xyXG4gICAgICBjb25zdCBwZXJtdXRlZE9yaWVudGF0aW9uMCA9IGlkZWFsT3JpZW50YXRpb25zWyBwZXJtdXRhdGlvbi5pbmRpY2VzWyAwIF0gXTtcclxuICAgICAgY29uc3QgcGVybXV0ZWRPcmllbnRhdGlvbjEgPSBpZGVhbE9yaWVudGF0aW9uc1sgcGVybXV0YXRpb24uaW5kaWNlc1sgMSBdIF07XHJcbiAgICAgIGNvbnN0IGVycm9yTG93Qm91bmQgPSA0IC0gNCAqIE1hdGguY29zKCBNYXRoLmFicyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguYWNvcyggVXRpbHMuY2xhbXAoIHBlcm11dGVkT3JpZW50YXRpb24wLmRvdCggY3VycmVudE9yaWVudGF0aW9uc1sgMCBdICksIC0xLCAxICkgKSAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmFjb3MoIFV0aWxzLmNsYW1wKCBwZXJtdXRlZE9yaWVudGF0aW9uMS5kb3QoIGN1cnJlbnRPcmllbnRhdGlvbnNbIDEgXSApLCAtMSwgMSApIClcclxuICAgICAgKSApO1xyXG5cclxuICAgICAgLy8gdGhyb3cgb3V0IHJlc3VsdHMgd2hlcmUgdGhpcyBhcmJpdHJhcmlseS1jaG9zZW4gbG93ZXIgYm91bmQgcnVsZXMgb3V0IHRoZSBlbnRpcmUgcGVybXV0YXRpb25cclxuICAgICAgaWYgKCBiZXN0UmVzdWx0LmVycm9yIDwgZXJyb3JMb3dCb3VuZCApIHtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IGNhbGN1bGF0ZVRhcmdldCggcGVybXV0YXRpb24gKTtcclxuXHJcbiAgICBpZiAoIGJlc3RSZXN1bHQgPT09IG51bGwgfHwgcmVzdWx0LmVycm9yIDwgYmVzdFJlc3VsdC5lcnJvciApIHtcclxuICAgICAgYmVzdFJlc3VsdCA9IHJlc3VsdDtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGJlc3RSZXN1bHQ7XHJcbn07XHJcblxyXG4vKipcclxuICogQ29udmVuaWVuY2UgZm9yIGV4dHJhY3Rpbmcgb3JpZW50YXRpb25zIGZyb20gYW4gYXJyYXkgb2YgUGFpckdyb3Vwc1xyXG4gKiBAcHVibGljXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXkuPFBhaXJHcm91cD59IGdyb3Vwc1xyXG4gKi9cclxuQXR0cmFjdG9yTW9kZWwuZ2V0T3JpZW50YXRpb25zRnJvbU9yaWdpbiA9IGdyb3VwcyA9PiBfLm1hcCggZ3JvdXBzLCBncm91cCA9PiBncm91cC5vcmllbnRhdGlvbiApO1xyXG5cclxuLy8gc2NyYXRjaCBtYXRyaWNlcyBmb3IgdGhlIFNWRCBjYWxjdWxhdGlvbnNcclxuY29uc3Qgc2NyYXRjaE1hdHJpeCA9IG5ldyBNYXRyaXhPcHMzLkFycmF5KCA5ICk7XHJcbmNvbnN0IHNjcmF0Y2hVID0gbmV3IE1hdHJpeE9wczMuQXJyYXkoIDkgKTtcclxuY29uc3Qgc2NyYXRjaFNpZ21hID0gbmV3IE1hdHJpeE9wczMuQXJyYXkoIDkgKTtcclxuY29uc3Qgc2NyYXRjaFYgPSBuZXcgTWF0cml4T3BzMy5BcnJheSggOSApO1xyXG5cclxuLyoqXHJcbiAqIEluIDNELCBHaXZlbiBuIHBvaW50cyB4X2kgYW5kIG4gcG9pbnRzIHlfaSwgZGV0ZXJtaW5lIHRoZSByb3RhdGlvbiBtYXRyaXggdGhhdCBjYW4gYmUgYXBwbGllZCB0byB0aGUgeF9pIHN1Y2hcclxuICogdGhhdCBpdCBtaW5pbWl6ZXMgdGhlIGxlYXN0LXNxdWFyZXMgZXJyb3IgYmV0d2VlbiBlYWNoIHhfaSBhbmQgeV9pLlxyXG4gKiBAcHJpdmF0ZVxyXG4gKlxyXG4gKiBAcGFyYW0ge251bWJlcn0gbiAtIFF1YW50aXR5IG9mIHBvaW50c1xyXG4gKiBAcGFyYW0ge01hdHJpeE9wczMuQXJyYXl9IHggLSBBIDN4TiBNYXRyaXhPcHMzIG1hdHJpeCB3aGVyZSBlYWNoIGNvbHVtbiByZXByZXNlbnRzIGEgcG9pbnQgeF9pXHJcbiAqIEBwYXJhbSB7TWF0cml4T3BzMy5BcnJheX0geSAtIEEgM3hOIE1hdHJpeE9wczMgbWF0cml4IHdoZXJlIGVhY2ggY29sdW1uIHJlcHJlc2VudHMgYSBwb2ludCB5X2lcclxuICogQHBhcmFtIHtNYXRyaXhPcHMzLkFycmF5fSByZXN1bHQgLSBBIDN4MyBNYXRyaXhPcHMzIG1hdHJpeCB3aGVyZSB0aGUgcm90YXRpb24gbWF0cml4IHJlc3VsdCB3aWxsIGJlIHN0b3JlZCAodGhlcmUgaXMgbm8gcmV0dXJuIHZhbHVlKS5cclxuICovXHJcbkF0dHJhY3Rvck1vZGVsLmNvbXB1dGVSb3RhdGlvbk1hdHJpeFdpdGhUcmFuc3Bvc2UgPSAoIG4sIHgsIHksIHJlc3VsdCApID0+IHtcclxuICAvLyBTID0gWCAqIFleVCwgaW4gb3VyIGNhc2UgYWx3YXlzIDN4M1xyXG4gIGNvbnN0IHMgPSBzY3JhdGNoTWF0cml4O1xyXG4gIE1hdHJpeE9wczMubXVsdFJpZ2h0VHJhbnNwb3NlKCAzLCBuLCAzLCB4LCB5LCBzICk7XHJcblxyXG4gIC8vIHRoaXMgY29kZSBtYXkgbG9vcCBpbmZpbml0ZWx5IG9uIE5hTiwgc28gd2Ugd2FudCB0byBkb3VibGUtY2hlY2tcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCAhaXNOYU4oIHNbIDAgXSApICk7XHJcblxyXG4gIC8vIFNldHMgVSwgU2lnbWEsIFZcclxuICBNYXRyaXhPcHMzLnN2ZDMoIHMsIDUsIHNjcmF0Y2hVLCBzY3JhdGNoU2lnbWEsIHNjcmF0Y2hWICk7XHJcblxyXG4gIC8vIElmIGxhc3QgZmFzdFNpZ21hIGVudHJ5IGlzIG5lZ2F0aXZlLCBhIHJlZmxlY3Rpb24gd291bGQgaGF2ZSBiZWVuIGEgYmV0dGVyIG1hdGNoLiBDb25zaWRlciBbMSwwLDAgMCwxLDAgMCwwLC0xXVxyXG4gIC8vIG11bHRpcGxpZWQgaW4tYmV0d2VlbiB0byByZXZlcnNlIGlmIHRoYXQgd2lsbCBoZWxwIGluIHRoZSBmdXR1cmUuXHJcbiAgLy8gcmVzdWx0ID0gViAqIFVeVFxyXG4gIE1hdHJpeE9wczMubXVsdDNSaWdodFRyYW5zcG9zZSggc2NyYXRjaFYsIHNjcmF0Y2hVLCByZXN1bHQgKTtcclxufTtcclxuXHJcbkF0dHJhY3Rvck1vZGVsLlJlc3VsdE1hcHBpbmcgPSBjbGFzcyBSZXN1bHRNYXBwaW5nIHtcclxuICAvKipcclxuICAgKiBSZXN1bHQgbWFwcGluZyBiZXR3ZWVuIHRoZSBjdXJyZW50IHBvc2l0aW9ucyBhbmQgaWRlYWwgcG9zaXRpb25zLiBSZXR1cm5lZCBhcyBhIGRhdGEgb2JqZWN0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlcnJvciAtIFRvdGFsIGVycm9yIG9mIHRoaXMgbWFwcGluZ1xyXG4gICAqIEBwYXJhbSB7TWF0cml4fSB0YXJnZXQgLSBUaGUgcG9zaXRpb25zIG9mIGlkZWFsIHBhaXIgZ3JvdXBzXHJcbiAgICogQHBhcmFtIHtQZXJtdXRhdGlvbn0gcGVybXV0YXRpb24gLSBUaGUgcGVybXV0YXRpb24gYmV0d2VlbiBjdXJyZW50IHBhaXIgZ3JvdXBzIGFuZCBpZGVhbCBwYWlyIGdyb3Vwc1xyXG4gICAqIEBwYXJhbSB7TWF0cml4fSByb3RhdGlvbiAtIFRoZSByb3RhdGlvbiBiZXR3ZWVuIHRoZSBjdXJyZW50IGFuZCBpZGVhbFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBlcnJvciwgdGFyZ2V0LCBwZXJtdXRhdGlvbiwgcm90YXRpb24gKSB7XHJcbiAgICB0aGlzLmVycm9yID0gZXJyb3I7XHJcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuICAgIHRoaXMucGVybXV0YXRpb24gPSBwZXJtdXRhdGlvbjtcclxuICAgIHRoaXMucm90YXRpb24gPSByb3RhdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBjb3B5IG9mIHRoZSBpbnB1dCB2ZWN0b3IsIHJvdGF0ZWQgZnJvbSB0aGUgXCJjdXJyZW50XCIgZnJhbWUgb2YgcmVmZXJlbmNlIHRvIHRoZSBcImlkZWFsXCIgZnJhbWUgb2ZcclxuICAgKiByZWZlcmVuY2UuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IzfSB2XHJcbiAgICovXHJcbiAgcm90YXRlVmVjdG9yKCB2ICkge1xyXG4gICAgY29uc3QgeCA9IE1hdHJpeC5jb2x1bW5WZWN0b3IzKCB2ICk7XHJcbiAgICBjb25zdCByb3RhdGVkID0gdGhpcy5yb3RhdGlvbi50aW1lcyggeCApO1xyXG4gICAgcmV0dXJuIHJvdGF0ZWQuZXh0cmFjdFZlY3RvcjMoIDAgKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogQ2FsbCB0aGUgZnVuY3Rpb24gd2l0aCBlYWNoIGluZGl2aWR1YWwgcGVybXV0YXRpb24gb2YgdGhlIGxpc3QgZWxlbWVudHMgb2YgXCJsaXN0c1wiXHJcbiAqIEBwcml2YXRlXHJcbiAqXHJcbiAqIEBwYXJhbSBsaXN0cyAgTGlzdCBvZiBsaXN0cy4gT3JkZXIgb2YgbGlzdHMgd2lsbCBub3QgY2hhbmdlLCBob3dldmVyIGVhY2ggcG9zc2libGUgcGVybXV0YXRpb24gaW52b2x2aW5nIHN1Yi1saXN0cyB3aWxsIGJlIHVzZWRcclxuICogQHBhcmFtIGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGNhbGxcclxuICovXHJcbkF0dHJhY3Rvck1vZGVsLmZvckVhY2hNdWx0aXBsZVBlcm11dGF0aW9ucyA9ICggbGlzdHMsIGNhbGxiYWNrICkgPT4ge1xyXG4gIGlmICggbGlzdHMubGVuZ3RoID09PSAwICkge1xyXG4gICAgY2FsbGJhY2soIGxpc3RzICk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgLy8gbWFrZSBhIGNvcHkgb2YgJ2xpc3RzJ1xyXG4gICAgY29uc3QgcmVtYWluZGVyID0gbGlzdHMuc2xpY2UoIDAgKTtcclxuICAgIGNvbnN0IGZpcnN0ID0gcmVtYWluZGVyWyAwIF07XHJcblxyXG4gICAgcmVtYWluZGVyLnNwbGljZSggMCwgMSApO1xyXG5cclxuICAgIEF0dHJhY3Rvck1vZGVsLmZvckVhY2hQZXJtdXRhdGlvbiggZmlyc3QsIFtdLCBwZXJtdXRlZEZpcnN0ID0+IHtcclxuICAgICAgQXR0cmFjdG9yTW9kZWwuZm9yRWFjaE11bHRpcGxlUGVybXV0YXRpb25zKCByZW1haW5kZXIsIHN1Ykxpc3RzID0+IHtcclxuICAgICAgICBjb25zdCBhcnIgPSBuZXcgQXJyYXkoIGxpc3RzLmxlbmd0aCApO1xyXG4gICAgICAgIGFyclsgMCBdID0gcGVybXV0ZWRGaXJzdDtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdWJMaXN0cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgIGFyclsgaSArIDEgXSA9IHN1Ykxpc3RzWyBpIF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhbGxiYWNrKCBhcnIgKTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBDYWxsIG91ciBmdW5jdGlvbiB3aXRoIGVhY2ggcGVybXV0YXRpb24gb2YgdGhlIHByb3ZpZGVkIGxpc3QgUFJFRklYRUQgYnkgcHJlZml4LCBpbiBsZXhpY29ncmFwaGljIG9yZGVyXHJcbiAqIEBwcml2YXRlXHJcbiAqXHJcbiAqIEBwYXJhbSBsaXN0ICAgTGlzdCB0byBnZW5lcmF0ZSBwZXJtdXRhdGlvbnMgb2ZcclxuICogQHBhcmFtIHByZWZpeCAgIEVsZW1lbnRzIHRoYXQgc2hvdWxkIGJlIGluc2VydGVkIGF0IHRoZSBmcm9udCBvZiBlYWNoIGxpc3QgYmVmb3JlIGVhY2ggY2FsbFxyXG4gKiBAcGFyYW0gY2FsbGJhY2sgRnVuY3Rpb24gdG8gY2FsbFxyXG4gKi9cclxuQXR0cmFjdG9yTW9kZWwuZm9yRWFjaFBlcm11dGF0aW9uID0gKCBsaXN0LCBwcmVmaXgsIGNhbGxiYWNrICkgPT4ge1xyXG4gIGlmICggbGlzdC5sZW5ndGggPT09IDAgKSB7XHJcbiAgICBjYWxsYmFjayggcHJlZml4ICk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgZWxlbWVudCA9IGxpc3RbIGkgXTtcclxuXHJcbiAgICAgIGNvbnN0IG5ld0xpc3QgPSBsaXN0LnNsaWNlKCk7XHJcbiAgICAgIG5ld0xpc3Quc3BsaWNlKCBuZXdMaXN0LmluZGV4T2YoIGVsZW1lbnQgKSwgMSApO1xyXG5cclxuICAgICAgY29uc3QgbmV3UHJlZml4ID0gcHJlZml4LnNsaWNlKCk7XHJcbiAgICAgIG5ld1ByZWZpeC5wdXNoKCBlbGVtZW50ICk7XHJcblxyXG4gICAgICBBdHRyYWN0b3JNb2RlbC5mb3JFYWNoUGVybXV0YXRpb24oIG5ld0xpc3QsIG5ld1ByZWZpeCwgY2FsbGJhY2sgKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRGVidWdnaW5nIGFpZCBmb3IgY29udmVydGluZyBhbiBhcnJheSBvZiBhcnJheXMgdG8gYSBzdHJpbmcuXHJcbiAqIEBwcml2YXRlXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXkuPEFycmF5LjwqPj59IGxpc3RzXHJcbiAqL1xyXG5BdHRyYWN0b3JNb2RlbC5saXN0UHJpbnQgPSBsaXN0cyA9PiB7XHJcbiAgbGV0IHJldCA9ICcnO1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGxpc3RzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgY29uc3QgbGlzdCA9IGxpc3RzWyBpIF07XHJcbiAgICByZXQgKz0gJyAnO1xyXG4gICAgZm9yICggbGV0IGogPSAwOyBqIDwgbGlzdC5sZW5ndGg7IGorKyApIHtcclxuICAgICAgcmV0ICs9IGxpc3RbIGogXS50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRlc3RpbmcgZnVuY3Rpb24gZm9yIHBlcm11dGF0aW9uc1xyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuQXR0cmFjdG9yTW9kZWwudGVzdE1lID0gKCkgPT4ge1xyXG4gIC8qXHJcbiAgIFRlc3Rpbmcgb2YgcGVybXV0aW5nIGVhY2ggaW5kaXZpZHVhbCBsaXN0LiBPdXRwdXQ6XHJcbiAgIEFCIEMgREVGXHJcbiAgIEFCIEMgREZFXHJcbiAgIEFCIEMgRURGXHJcbiAgIEFCIEMgRUZEXHJcbiAgIEFCIEMgRkRFXHJcbiAgIEFCIEMgRkVEXHJcbiAgIEJBIEMgREVGXHJcbiAgIEJBIEMgREZFXHJcbiAgIEJBIEMgRURGXHJcbiAgIEJBIEMgRUZEXHJcbiAgIEJBIEMgRkRFXHJcbiAgIEJBIEMgRkVEXHJcbiAgICovXHJcblxyXG4gIGNvbnN0IGFyciA9IFtcclxuICAgIFsgJ0EnLCAnQicgXSxcclxuICAgIFsgJ0MnIF0sXHJcbiAgICBbICdEJywgJ0UnLCAnRicgXVxyXG4gIF07XHJcblxyXG4gIEF0dHJhY3Rvck1vZGVsLmZvckVhY2hNdWx0aXBsZVBlcm11dGF0aW9ucyggYXJyLCBsaXN0cyA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyggQXR0cmFjdG9yTW9kZWwubGlzdFByaW50KCBsaXN0cyApICk7XHJcbiAgfSApO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXR0cmFjdG9yTW9kZWw7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MsU0FBUyxNQUFN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