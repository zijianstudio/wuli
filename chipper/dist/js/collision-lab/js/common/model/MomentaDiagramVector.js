// Copyright 2020, University of Colorado Boulder

/**
 * A model for a single Vector that appears in the 'Momenta Diagram' accordion box. This model is intended to be used by
 * both the Momenta Vectors of the Balls and the total Momenta Vector.
 *
 * Responsible for:
 *   - Keeping track of the tail position of the Vector
 *   - Keeping track of the tip position of the Vector
 *   - Convenience methods for setting the tail, tip, components.
 *
 * MomentaDiagramVectors should only be positioned in MomentaDiagram.js. Since Balls are never disposed,
 * MomentaDiagramVectors are also never disposed, even when they are removed from the system. See MomentaDiagram.js.
 *
 * @author Brandon Li
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
class MomentaDiagramVector {
  constructor() {
    // @public {Property.<Vector2>} - the tail position of the Vector, in kg*(m/s). Initialized at the origin and to be
    //                                updated later in MomentaDiagram.js
    this.tailPositionProperty = new Vector2Property(Vector2.ZERO);

    // @public {Property.<Vector2>} - the Momentum Vector's components, which are its x and y scalar values. Initialized
    //                                at zero and to be updated later in MomentaDiagram.js
    this.componentsProperty = new Vector2Property(Vector2.ZERO);

    // @public {Property.<Vector2>} - the tip position of the Vector. Never disposed since MomentaDiagramVectors
    //                                are never disposed.
    this.tipPositionProperty = new DerivedProperty([this.tailPositionProperty, this.componentsProperty], (tailPosition, components) => tailPosition.plus(components), {
      valueType: Vector2
    });
  }

  /**
   * Resets the Vector. Called when the reset-all button is pressed.
   * @public
   *
   * Technically, since the tail and tip are set externally, which depends on the Ball's momentums, this method isn't
   * needed. However, the PhET convention is to completely reset when the reset all button is pressed, so we follow that
   * here.
   */
  reset() {
    this.tailPositionProperty.reset();
    this.componentsProperty.reset();
  }

  /*----------------------------------------------------------------------------*
   * Convenience setters/getters.
   *----------------------------------------------------------------------------*/

  /**
   * Gets the center position of the Vector.
   * @public
   *
   * @returns {Vector2} - in kg*(m/s).
   */
  get center() {
    return this.componentsProperty.value.times(0.5).add(this.tailPositionProperty.value);
  }

  /**
   * Gets the magnitude of the MomentaDiagramVector, which is always positive.
   * @public
   *
   * @returns {number} - in kg*(m/s).
   */
  get magnitude() {
    return this.componentsProperty.value.magnitude;
  }

  /**
   * Gets the angle of the MomentaDiagramVector in radians, measured clockwise from the horizontal. Null when the
   * vector has 0 magnitude.
   * @public
   *
   * @returns {number|null} - in radians.
   */
  get angle() {
    return this.magnitude <= CollisionLabConstants.ZERO_THRESHOLD ? null : this.componentsProperty.value.angle;
  }
}
collisionLab.register('MomentaDiagramVector', MomentaDiagramVector);
export default MomentaDiagramVector;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5IiwiY29sbGlzaW9uTGFiIiwiQ29sbGlzaW9uTGFiQ29uc3RhbnRzIiwiTW9tZW50YURpYWdyYW1WZWN0b3IiLCJjb25zdHJ1Y3RvciIsInRhaWxQb3NpdGlvblByb3BlcnR5IiwiWkVSTyIsImNvbXBvbmVudHNQcm9wZXJ0eSIsInRpcFBvc2l0aW9uUHJvcGVydHkiLCJ0YWlsUG9zaXRpb24iLCJjb21wb25lbnRzIiwicGx1cyIsInZhbHVlVHlwZSIsInJlc2V0IiwiY2VudGVyIiwidmFsdWUiLCJ0aW1lcyIsImFkZCIsIm1hZ25pdHVkZSIsImFuZ2xlIiwiWkVST19USFJFU0hPTEQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1vbWVudGFEaWFncmFtVmVjdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIG1vZGVsIGZvciBhIHNpbmdsZSBWZWN0b3IgdGhhdCBhcHBlYXJzIGluIHRoZSAnTW9tZW50YSBEaWFncmFtJyBhY2NvcmRpb24gYm94LiBUaGlzIG1vZGVsIGlzIGludGVuZGVkIHRvIGJlIHVzZWQgYnlcclxuICogYm90aCB0aGUgTW9tZW50YSBWZWN0b3JzIG9mIHRoZSBCYWxscyBhbmQgdGhlIHRvdGFsIE1vbWVudGEgVmVjdG9yLlxyXG4gKlxyXG4gKiBSZXNwb25zaWJsZSBmb3I6XHJcbiAqICAgLSBLZWVwaW5nIHRyYWNrIG9mIHRoZSB0YWlsIHBvc2l0aW9uIG9mIHRoZSBWZWN0b3JcclxuICogICAtIEtlZXBpbmcgdHJhY2sgb2YgdGhlIHRpcCBwb3NpdGlvbiBvZiB0aGUgVmVjdG9yXHJcbiAqICAgLSBDb252ZW5pZW5jZSBtZXRob2RzIGZvciBzZXR0aW5nIHRoZSB0YWlsLCB0aXAsIGNvbXBvbmVudHMuXHJcbiAqXHJcbiAqIE1vbWVudGFEaWFncmFtVmVjdG9ycyBzaG91bGQgb25seSBiZSBwb3NpdGlvbmVkIGluIE1vbWVudGFEaWFncmFtLmpzLiBTaW5jZSBCYWxscyBhcmUgbmV2ZXIgZGlzcG9zZWQsXHJcbiAqIE1vbWVudGFEaWFncmFtVmVjdG9ycyBhcmUgYWxzbyBuZXZlciBkaXNwb3NlZCwgZXZlbiB3aGVuIHRoZXkgYXJlIHJlbW92ZWQgZnJvbSB0aGUgc3lzdGVtLiBTZWUgTW9tZW50YURpYWdyYW0uanMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBjb2xsaXNpb25MYWIgZnJvbSAnLi4vLi4vY29sbGlzaW9uTGFiLmpzJztcclxuaW1wb3J0IENvbGxpc2lvbkxhYkNvbnN0YW50cyBmcm9tICcuLi9Db2xsaXNpb25MYWJDb25zdGFudHMuanMnO1xyXG5cclxuY2xhc3MgTW9tZW50YURpYWdyYW1WZWN0b3Ige1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48VmVjdG9yMj59IC0gdGhlIHRhaWwgcG9zaXRpb24gb2YgdGhlIFZlY3RvciwgaW4ga2cqKG0vcykuIEluaXRpYWxpemVkIGF0IHRoZSBvcmlnaW4gYW5kIHRvIGJlXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZCBsYXRlciBpbiBNb21lbnRhRGlhZ3JhbS5qc1xyXG4gICAgdGhpcy50YWlsUG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxWZWN0b3IyPn0gLSB0aGUgTW9tZW50dW0gVmVjdG9yJ3MgY29tcG9uZW50cywgd2hpY2ggYXJlIGl0cyB4IGFuZCB5IHNjYWxhciB2YWx1ZXMuIEluaXRpYWxpemVkXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXQgemVybyBhbmQgdG8gYmUgdXBkYXRlZCBsYXRlciBpbiBNb21lbnRhRGlhZ3JhbS5qc1xyXG4gICAgdGhpcy5jb21wb25lbnRzUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBWZWN0b3IyLlpFUk8gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48VmVjdG9yMj59IC0gdGhlIHRpcCBwb3NpdGlvbiBvZiB0aGUgVmVjdG9yLiBOZXZlciBkaXNwb3NlZCBzaW5jZSBNb21lbnRhRGlhZ3JhbVZlY3RvcnNcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmUgbmV2ZXIgZGlzcG9zZWQuXHJcbiAgICB0aGlzLnRpcFBvc2l0aW9uUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMudGFpbFBvc2l0aW9uUHJvcGVydHksIHRoaXMuY29tcG9uZW50c1Byb3BlcnR5IF0sXHJcbiAgICAgICggdGFpbFBvc2l0aW9uLCBjb21wb25lbnRzICkgPT4gdGFpbFBvc2l0aW9uLnBsdXMoIGNvbXBvbmVudHMgKSwge1xyXG4gICAgICAgIHZhbHVlVHlwZTogVmVjdG9yMlxyXG4gICAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIFZlY3Rvci4gQ2FsbGVkIHdoZW4gdGhlIHJlc2V0LWFsbCBidXR0b24gaXMgcHJlc3NlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUZWNobmljYWxseSwgc2luY2UgdGhlIHRhaWwgYW5kIHRpcCBhcmUgc2V0IGV4dGVybmFsbHksIHdoaWNoIGRlcGVuZHMgb24gdGhlIEJhbGwncyBtb21lbnR1bXMsIHRoaXMgbWV0aG9kIGlzbid0XHJcbiAgICogbmVlZGVkLiBIb3dldmVyLCB0aGUgUGhFVCBjb252ZW50aW9uIGlzIHRvIGNvbXBsZXRlbHkgcmVzZXQgd2hlbiB0aGUgcmVzZXQgYWxsIGJ1dHRvbiBpcyBwcmVzc2VkLCBzbyB3ZSBmb2xsb3cgdGhhdFxyXG4gICAqIGhlcmUuXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnRhaWxQb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmNvbXBvbmVudHNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIENvbnZlbmllbmNlIHNldHRlcnMvZ2V0dGVycy5cclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBjZW50ZXIgcG9zaXRpb24gb2YgdGhlIFZlY3Rvci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn0gLSBpbiBrZyoobS9zKS5cclxuICAgKi9cclxuICBnZXQgY2VudGVyKCkgeyByZXR1cm4gdGhpcy5jb21wb25lbnRzUHJvcGVydHkudmFsdWUudGltZXMoIDAuNSApLmFkZCggdGhpcy50YWlsUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG1hZ25pdHVkZSBvZiB0aGUgTW9tZW50YURpYWdyYW1WZWN0b3IsIHdoaWNoIGlzIGFsd2F5cyBwb3NpdGl2ZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIGluIGtnKihtL3MpLlxyXG4gICAqL1xyXG4gIGdldCBtYWduaXR1ZGUoKSB7IHJldHVybiB0aGlzLmNvbXBvbmVudHNQcm9wZXJ0eS52YWx1ZS5tYWduaXR1ZGU7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgYW5nbGUgb2YgdGhlIE1vbWVudGFEaWFncmFtVmVjdG9yIGluIHJhZGlhbnMsIG1lYXN1cmVkIGNsb2Nrd2lzZSBmcm9tIHRoZSBob3Jpem9udGFsLiBOdWxsIHdoZW4gdGhlXHJcbiAgICogdmVjdG9yIGhhcyAwIG1hZ25pdHVkZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfG51bGx9IC0gaW4gcmFkaWFucy5cclxuICAgKi9cclxuICBnZXQgYW5nbGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYWduaXR1ZGUgPD0gQ29sbGlzaW9uTGFiQ29uc3RhbnRzLlpFUk9fVEhSRVNIT0xEID8gbnVsbCA6IHRoaXMuY29tcG9uZW50c1Byb3BlcnR5LnZhbHVlLmFuZ2xlO1xyXG4gIH1cclxufVxyXG5cclxuY29sbGlzaW9uTGFiLnJlZ2lzdGVyKCAnTW9tZW50YURpYWdyYW1WZWN0b3InLCBNb21lbnRhRGlhZ3JhbVZlY3RvciApO1xyXG5leHBvcnQgZGVmYXVsdCBNb21lbnRhRGlhZ3JhbVZlY3RvcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MsWUFBWSxNQUFNLHVCQUF1QjtBQUNoRCxPQUFPQyxxQkFBcUIsTUFBTSw2QkFBNkI7QUFFL0QsTUFBTUMsb0JBQW9CLENBQUM7RUFFekJDLFdBQVdBLENBQUEsRUFBRztJQUVaO0lBQ0E7SUFDQSxJQUFJLENBQUNDLG9CQUFvQixHQUFHLElBQUlMLGVBQWUsQ0FBRUQsT0FBTyxDQUFDTyxJQUFLLENBQUM7O0lBRS9EO0lBQ0E7SUFDQSxJQUFJLENBQUNDLGtCQUFrQixHQUFHLElBQUlQLGVBQWUsQ0FBRUQsT0FBTyxDQUFDTyxJQUFLLENBQUM7O0lBRTdEO0lBQ0E7SUFDQSxJQUFJLENBQUNFLG1CQUFtQixHQUFHLElBQUlWLGVBQWUsQ0FBRSxDQUFFLElBQUksQ0FBQ08sb0JBQW9CLEVBQUUsSUFBSSxDQUFDRSxrQkFBa0IsQ0FBRSxFQUNwRyxDQUFFRSxZQUFZLEVBQUVDLFVBQVUsS0FBTUQsWUFBWSxDQUFDRSxJQUFJLENBQUVELFVBQVcsQ0FBQyxFQUFFO01BQy9ERSxTQUFTLEVBQUViO0lBQ2IsQ0FBRSxDQUFDO0VBQ1A7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFYyxLQUFLQSxDQUFBLEVBQUc7SUFDTixJQUFJLENBQUNSLG9CQUFvQixDQUFDUSxLQUFLLENBQUMsQ0FBQztJQUNqQyxJQUFJLENBQUNOLGtCQUFrQixDQUFDTSxLQUFLLENBQUMsQ0FBQztFQUNqQzs7RUFFQTtBQUNGO0FBQ0E7O0VBRUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsSUFBSUMsTUFBTUEsQ0FBQSxFQUFHO0lBQUUsT0FBTyxJQUFJLENBQUNQLGtCQUFrQixDQUFDUSxLQUFLLENBQUNDLEtBQUssQ0FBRSxHQUFJLENBQUMsQ0FBQ0MsR0FBRyxDQUFFLElBQUksQ0FBQ1osb0JBQW9CLENBQUNVLEtBQU0sQ0FBQztFQUFFOztFQUV6RztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxJQUFJRyxTQUFTQSxDQUFBLEVBQUc7SUFBRSxPQUFPLElBQUksQ0FBQ1gsa0JBQWtCLENBQUNRLEtBQUssQ0FBQ0csU0FBUztFQUFFOztFQUVsRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLElBQUlDLEtBQUtBLENBQUEsRUFBRztJQUNWLE9BQU8sSUFBSSxDQUFDRCxTQUFTLElBQUloQixxQkFBcUIsQ0FBQ2tCLGNBQWMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDYixrQkFBa0IsQ0FBQ1EsS0FBSyxDQUFDSSxLQUFLO0VBQzVHO0FBQ0Y7QUFFQWxCLFlBQVksQ0FBQ29CLFFBQVEsQ0FBRSxzQkFBc0IsRUFBRWxCLG9CQUFxQixDQUFDO0FBQ3JFLGVBQWVBLG9CQUFvQiJ9