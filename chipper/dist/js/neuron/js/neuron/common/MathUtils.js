// Copyright 2014-2020, University of Colorado Boulder

/**
 * A utility class, contains methods to do certain math operations without creating new Vector2 instances
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import neuron from '../../neuron.js';

// These vectors are used as temporary objects for calculating distance without creating new Vector2 instances, see
// the createTraversalPoint method.
const distanceCalculatorVectorLHS = new Vector2(0, 0);
const distanceCalculatorVectorRHS = new Vector2(0, 0);
const MathUtils = {
  /**
   * A method to calculate distance by reusing vector instances. This method is created to reduce Vector2 instance
   * allocation during distance calculation.
   * @param {number} posX
   * @param {number} posY
   * @param {number} otherPosX
   * @param {number} otherPosY
   * @returns {number}
   * @public
   */
  distanceBetween(posX, posY, otherPosX, otherPosY) {
    distanceCalculatorVectorLHS.x = posX;
    distanceCalculatorVectorLHS.y = posY;
    distanceCalculatorVectorRHS.x = otherPosX;
    distanceCalculatorVectorRHS.y = otherPosY;
    return distanceCalculatorVectorLHS.distance(distanceCalculatorVectorRHS);
  },
  /**
   * Rounds to a specific number of places
   * @param {number} val
   * @param {number} places
   * @returns {number}
   * @public
   */
  round(val, places) {
    const factor = Math.pow(10, places);

    // Shift the decimal the correct number of places
    // to the right.
    val = val * factor;

    // Round to the nearest integer.
    const tmp = Utils.roundSymmetric(val);

    // Shift the decimal the correct number of places
    // back to the left.
    return tmp / factor;
  }
};
neuron.register('MathUtils', MathUtils);
export default MathUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlZlY3RvcjIiLCJuZXVyb24iLCJkaXN0YW5jZUNhbGN1bGF0b3JWZWN0b3JMSFMiLCJkaXN0YW5jZUNhbGN1bGF0b3JWZWN0b3JSSFMiLCJNYXRoVXRpbHMiLCJkaXN0YW5jZUJldHdlZW4iLCJwb3NYIiwicG9zWSIsIm90aGVyUG9zWCIsIm90aGVyUG9zWSIsIngiLCJ5IiwiZGlzdGFuY2UiLCJyb3VuZCIsInZhbCIsInBsYWNlcyIsImZhY3RvciIsIk1hdGgiLCJwb3ciLCJ0bXAiLCJyb3VuZFN5bW1ldHJpYyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTWF0aFV0aWxzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgdXRpbGl0eSBjbGFzcywgY29udGFpbnMgbWV0aG9kcyB0byBkbyBjZXJ0YWluIG1hdGggb3BlcmF0aW9ucyB3aXRob3V0IGNyZWF0aW5nIG5ldyBWZWN0b3IyIGluc3RhbmNlc1xyXG4gKlxyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmIChmb3IgR2hlbnQgVW5pdmVyc2l0eSlcclxuICovXHJcblxyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbmV1cm9uIGZyb20gJy4uLy4uL25ldXJvbi5qcyc7XHJcblxyXG4vLyBUaGVzZSB2ZWN0b3JzIGFyZSB1c2VkIGFzIHRlbXBvcmFyeSBvYmplY3RzIGZvciBjYWxjdWxhdGluZyBkaXN0YW5jZSB3aXRob3V0IGNyZWF0aW5nIG5ldyBWZWN0b3IyIGluc3RhbmNlcywgc2VlXHJcbi8vIHRoZSBjcmVhdGVUcmF2ZXJzYWxQb2ludCBtZXRob2QuXHJcbmNvbnN0IGRpc3RhbmNlQ2FsY3VsYXRvclZlY3RvckxIUyA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbmNvbnN0IGRpc3RhbmNlQ2FsY3VsYXRvclZlY3RvclJIUyA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcblxyXG5jb25zdCBNYXRoVXRpbHMgPSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgbWV0aG9kIHRvIGNhbGN1bGF0ZSBkaXN0YW5jZSBieSByZXVzaW5nIHZlY3RvciBpbnN0YW5jZXMuIFRoaXMgbWV0aG9kIGlzIGNyZWF0ZWQgdG8gcmVkdWNlIFZlY3RvcjIgaW5zdGFuY2VcclxuICAgKiBhbGxvY2F0aW9uIGR1cmluZyBkaXN0YW5jZSBjYWxjdWxhdGlvbi5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gcG9zWFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwb3NZXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG90aGVyUG9zWFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvdGhlclBvc1lcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXN0YW5jZUJldHdlZW4oIHBvc1gsIHBvc1ksIG90aGVyUG9zWCwgb3RoZXJQb3NZICkge1xyXG4gICAgZGlzdGFuY2VDYWxjdWxhdG9yVmVjdG9yTEhTLnggPSBwb3NYO1xyXG4gICAgZGlzdGFuY2VDYWxjdWxhdG9yVmVjdG9yTEhTLnkgPSBwb3NZO1xyXG4gICAgZGlzdGFuY2VDYWxjdWxhdG9yVmVjdG9yUkhTLnggPSBvdGhlclBvc1g7XHJcbiAgICBkaXN0YW5jZUNhbGN1bGF0b3JWZWN0b3JSSFMueSA9IG90aGVyUG9zWTtcclxuICAgIHJldHVybiBkaXN0YW5jZUNhbGN1bGF0b3JWZWN0b3JMSFMuZGlzdGFuY2UoIGRpc3RhbmNlQ2FsY3VsYXRvclZlY3RvclJIUyApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJvdW5kcyB0byBhIHNwZWNpZmljIG51bWJlciBvZiBwbGFjZXNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBsYWNlc1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJvdW5kKCB2YWwsIHBsYWNlcyApIHtcclxuICAgIGNvbnN0IGZhY3RvciA9IE1hdGgucG93KCAxMCwgcGxhY2VzICk7XHJcblxyXG4gICAgLy8gU2hpZnQgdGhlIGRlY2ltYWwgdGhlIGNvcnJlY3QgbnVtYmVyIG9mIHBsYWNlc1xyXG4gICAgLy8gdG8gdGhlIHJpZ2h0LlxyXG4gICAgdmFsID0gdmFsICogZmFjdG9yO1xyXG5cclxuICAgIC8vIFJvdW5kIHRvIHRoZSBuZWFyZXN0IGludGVnZXIuXHJcbiAgICBjb25zdCB0bXAgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggdmFsICk7XHJcblxyXG4gICAgLy8gU2hpZnQgdGhlIGRlY2ltYWwgdGhlIGNvcnJlY3QgbnVtYmVyIG9mIHBsYWNlc1xyXG4gICAgLy8gYmFjayB0byB0aGUgbGVmdC5cclxuICAgIHJldHVybiB0bXAgLyBmYWN0b3I7XHJcbiAgfVxyXG59O1xyXG5cclxubmV1cm9uLnJlZ2lzdGVyKCAnTWF0aFV0aWxzJywgTWF0aFV0aWxzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNYXRoVXRpbHM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxNQUFNLE1BQU0saUJBQWlCOztBQUVwQztBQUNBO0FBQ0EsTUFBTUMsMkJBQTJCLEdBQUcsSUFBSUYsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7QUFDdkQsTUFBTUcsMkJBQTJCLEdBQUcsSUFBSUgsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7QUFFdkQsTUFBTUksU0FBUyxHQUFHO0VBRWhCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLGVBQWVBLENBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBRztJQUNsRFAsMkJBQTJCLENBQUNRLENBQUMsR0FBR0osSUFBSTtJQUNwQ0osMkJBQTJCLENBQUNTLENBQUMsR0FBR0osSUFBSTtJQUNwQ0osMkJBQTJCLENBQUNPLENBQUMsR0FBR0YsU0FBUztJQUN6Q0wsMkJBQTJCLENBQUNRLENBQUMsR0FBR0YsU0FBUztJQUN6QyxPQUFPUCwyQkFBMkIsQ0FBQ1UsUUFBUSxDQUFFVCwyQkFBNEIsQ0FBQztFQUM1RSxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVUsS0FBS0EsQ0FBRUMsR0FBRyxFQUFFQyxNQUFNLEVBQUc7SUFDbkIsTUFBTUMsTUFBTSxHQUFHQyxJQUFJLENBQUNDLEdBQUcsQ0FBRSxFQUFFLEVBQUVILE1BQU8sQ0FBQzs7SUFFckM7SUFDQTtJQUNBRCxHQUFHLEdBQUdBLEdBQUcsR0FBR0UsTUFBTTs7SUFFbEI7SUFDQSxNQUFNRyxHQUFHLEdBQUdwQixLQUFLLENBQUNxQixjQUFjLENBQUVOLEdBQUksQ0FBQzs7SUFFdkM7SUFDQTtJQUNBLE9BQU9LLEdBQUcsR0FBR0gsTUFBTTtFQUNyQjtBQUNGLENBQUM7QUFFRGYsTUFBTSxDQUFDb0IsUUFBUSxDQUFFLFdBQVcsRUFBRWpCLFNBQVUsQ0FBQztBQUV6QyxlQUFlQSxTQUFTIn0=