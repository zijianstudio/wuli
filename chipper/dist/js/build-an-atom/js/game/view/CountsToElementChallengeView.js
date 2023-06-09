// Copyright 2013-2021, University of Colorado Boulder

/**
 * Challenge where the user is presented with a set of counts for protons,
 * neutrons, and electrons, and must find the represented element on a
 * periodic table.
 *
 * @author John Blanco
 */

import buildAnAtom from '../../buildAnAtom.js';
import ParticleCountsNode from './ParticleCountsNode.js';
import ToElementChallengeView from './ToElementChallengeView.js';
class CountsToElementChallengeView extends ToElementChallengeView {
  /**
   * @param {CountsToElementChallenge} countsToElementChallenge
   * @param {Bounds2} layoutBounds
   * @param {Tandem} tandem
   */
  constructor(countsToElementChallenge, layoutBounds, tandem) {
    super(countsToElementChallenge, layoutBounds, tandem);

    // Particle counts
    const particleCountsNode = new ParticleCountsNode(countsToElementChallenge.answerAtom);
    this.challengePresentationNode.addChild(particleCountsNode);

    // Layout
    particleCountsNode.centerX = this.periodicTable.left / 2;
    particleCountsNode.centerY = this.periodicTable.centerY;
  }
}
buildAnAtom.register('CountsToElementChallengeView', CountsToElementChallengeView);
export default CountsToElementChallengeView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJidWlsZEFuQXRvbSIsIlBhcnRpY2xlQ291bnRzTm9kZSIsIlRvRWxlbWVudENoYWxsZW5nZVZpZXciLCJDb3VudHNUb0VsZW1lbnRDaGFsbGVuZ2VWaWV3IiwiY29uc3RydWN0b3IiLCJjb3VudHNUb0VsZW1lbnRDaGFsbGVuZ2UiLCJsYXlvdXRCb3VuZHMiLCJ0YW5kZW0iLCJwYXJ0aWNsZUNvdW50c05vZGUiLCJhbnN3ZXJBdG9tIiwiY2hhbGxlbmdlUHJlc2VudGF0aW9uTm9kZSIsImFkZENoaWxkIiwiY2VudGVyWCIsInBlcmlvZGljVGFibGUiLCJsZWZ0IiwiY2VudGVyWSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ291bnRzVG9FbGVtZW50Q2hhbGxlbmdlVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDaGFsbGVuZ2Ugd2hlcmUgdGhlIHVzZXIgaXMgcHJlc2VudGVkIHdpdGggYSBzZXQgb2YgY291bnRzIGZvciBwcm90b25zLFxyXG4gKiBuZXV0cm9ucywgYW5kIGVsZWN0cm9ucywgYW5kIG11c3QgZmluZCB0aGUgcmVwcmVzZW50ZWQgZWxlbWVudCBvbiBhXHJcbiAqIHBlcmlvZGljIHRhYmxlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IGJ1aWxkQW5BdG9tIGZyb20gJy4uLy4uL2J1aWxkQW5BdG9tLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlQ291bnRzTm9kZSBmcm9tICcuL1BhcnRpY2xlQ291bnRzTm9kZS5qcyc7XHJcbmltcG9ydCBUb0VsZW1lbnRDaGFsbGVuZ2VWaWV3IGZyb20gJy4vVG9FbGVtZW50Q2hhbGxlbmdlVmlldy5qcyc7XHJcblxyXG5jbGFzcyBDb3VudHNUb0VsZW1lbnRDaGFsbGVuZ2VWaWV3IGV4dGVuZHMgVG9FbGVtZW50Q2hhbGxlbmdlVmlldyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Q291bnRzVG9FbGVtZW50Q2hhbGxlbmdlfSBjb3VudHNUb0VsZW1lbnRDaGFsbGVuZ2VcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGxheW91dEJvdW5kc1xyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY291bnRzVG9FbGVtZW50Q2hhbGxlbmdlLCBsYXlvdXRCb3VuZHMsIHRhbmRlbSApIHtcclxuICAgIHN1cGVyKCBjb3VudHNUb0VsZW1lbnRDaGFsbGVuZ2UsIGxheW91dEJvdW5kcywgdGFuZGVtICk7XHJcblxyXG4gICAgLy8gUGFydGljbGUgY291bnRzXHJcbiAgICBjb25zdCBwYXJ0aWNsZUNvdW50c05vZGUgPSBuZXcgUGFydGljbGVDb3VudHNOb2RlKCBjb3VudHNUb0VsZW1lbnRDaGFsbGVuZ2UuYW5zd2VyQXRvbSApO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VQcmVzZW50YXRpb25Ob2RlLmFkZENoaWxkKCBwYXJ0aWNsZUNvdW50c05vZGUgKTtcclxuXHJcbiAgICAvLyBMYXlvdXRcclxuICAgIHBhcnRpY2xlQ291bnRzTm9kZS5jZW50ZXJYID0gdGhpcy5wZXJpb2RpY1RhYmxlLmxlZnQgLyAyO1xyXG4gICAgcGFydGljbGVDb3VudHNOb2RlLmNlbnRlclkgPSB0aGlzLnBlcmlvZGljVGFibGUuY2VudGVyWTtcclxuICB9XHJcbn1cclxuXHJcbmJ1aWxkQW5BdG9tLnJlZ2lzdGVyKCAnQ291bnRzVG9FbGVtZW50Q2hhbGxlbmdlVmlldycsIENvdW50c1RvRWxlbWVudENoYWxsZW5nZVZpZXcgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvdW50c1RvRWxlbWVudENoYWxsZW5nZVZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLGtCQUFrQixNQUFNLHlCQUF5QjtBQUN4RCxPQUFPQyxzQkFBc0IsTUFBTSw2QkFBNkI7QUFFaEUsTUFBTUMsNEJBQTRCLFNBQVNELHNCQUFzQixDQUFDO0VBRWhFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsV0FBV0EsQ0FBRUMsd0JBQXdCLEVBQUVDLFlBQVksRUFBRUMsTUFBTSxFQUFHO0lBQzVELEtBQUssQ0FBRUYsd0JBQXdCLEVBQUVDLFlBQVksRUFBRUMsTUFBTyxDQUFDOztJQUV2RDtJQUNBLE1BQU1DLGtCQUFrQixHQUFHLElBQUlQLGtCQUFrQixDQUFFSSx3QkFBd0IsQ0FBQ0ksVUFBVyxDQUFDO0lBQ3hGLElBQUksQ0FBQ0MseUJBQXlCLENBQUNDLFFBQVEsQ0FBRUgsa0JBQW1CLENBQUM7O0lBRTdEO0lBQ0FBLGtCQUFrQixDQUFDSSxPQUFPLEdBQUcsSUFBSSxDQUFDQyxhQUFhLENBQUNDLElBQUksR0FBRyxDQUFDO0lBQ3hETixrQkFBa0IsQ0FBQ08sT0FBTyxHQUFHLElBQUksQ0FBQ0YsYUFBYSxDQUFDRSxPQUFPO0VBQ3pEO0FBQ0Y7QUFFQWYsV0FBVyxDQUFDZ0IsUUFBUSxDQUFFLDhCQUE4QixFQUFFYiw0QkFBNkIsQ0FBQztBQUVwRixlQUFlQSw0QkFBNEIifQ==