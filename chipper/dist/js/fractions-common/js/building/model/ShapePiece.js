// Copyright 2018-2022, University of Colorado Boulder

/**
 * A movable shape "piece" that can be combined/placed into groups.
 *
 * NOTE: The coordinate frame of pieces are always where the origin of this piece is at its centroid.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import DampedHarmonic from '../../../../dot/js/DampedHarmonic.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import Animator from '../../common/model/Animator.js';
import fractionsCommon from '../../fractionsCommon.js';
import BuildingRepresentation from './BuildingRepresentation.js';

// globals
// Used for unique identifiers for every ShapePiece (so we can efficiently store a map from piece ID to other objects.
let globalID = 0;
class ShapePiece {
  /**
   * @param {Fraction} fraction
   * @param {BuildingRepresentation} representation
   * @param {ColorDef} color
   */
  constructor(fraction, representation, color) {
    assert && assert(fraction instanceof Fraction);
    assert && assert(BuildingRepresentation.VALUES.includes(representation));
    assert && assert(color instanceof Property);
    this.id = globalID++;

    // @public {Fraction}
    this.fraction = fraction;

    // @public {BuildingRepresentation}
    this.representation = representation;

    // @public {ColorDef}
    this.color = color;

    // @public - Applies only while out in the play area (being animated or dragged)
    this.positionProperty = new Vector2Property(Vector2.ZERO);

    // @public {Property.<number>} - Applies only while out in the play area (being animated or dragged)
    this.rotationProperty = new NumberProperty(0);

    // @public {Property.<number>} - Applies only while out in the play area (being animated or dragged)
    this.scaleProperty = new NumberProperty(1);

    // @public {Property.<number>} - Applies only while out in the play area (being animated or dragged). Will be
    // inclusively between 0 (no shadow shown, directly behind) and 1 (largest shadow offset).
    this.shadowProperty = new NumberProperty(0);

    // @public {Property.<boolean>}
    this.isUserControlledProperty = new BooleanProperty(false);

    // @public {Property.<boolean>} - NOTE: The shape piece can rotate when this is false (e.g. when the user is
    // dragging it). It just means that the position/rotation/scale/shadow are controlled by animation.
    this.isAnimatingProperty = new BooleanProperty(false);

    // @public {Animator}
    this.animator = new Animator({
      positionProperty: this.positionProperty,
      rotationProperty: this.rotationProperty,
      scaleProperty: this.scaleProperty,
      shadowProperty: this.shadowProperty,
      isAnimatingProperty: this.isAnimatingProperty
    });

    // @private {Property.<number>}
    this.angularVelocityProperty = new NumberProperty(0);
    this.targetRotationProperty = new NumberProperty(0);

    // @private {DampedHarmonic|null} - For rotational animation
    this.dampedHarmonic = null;

    // @private {number}
    this.dampedHarmonicTimeElapsed = 0;
    this.trueTargetRotation = 0;

    // No need to unlink, as we own the given Property
    this.isUserControlledProperty.link(isUserControlled => {
      if (isUserControlled) {
        this.shadowProperty.value = 1;
      }
    });

    // Handle rotational animation towards a target (if any)
    // No need to unlink, as we own the given Properties
    Multilink.multilink([this.isUserControlledProperty, this.targetRotationProperty], (isUserControlled, targetRotation) => {
      if (isUserControlled) {
        const currentRotation = this.rotationProperty.value;
        this.trueTargetRotation = Animator.modifiedEndAngle(currentRotation, this.targetRotationProperty.value);

        // Constants tweaked to give the damped harmonic a pleasing behavior.
        const damping = 1;
        const force = 50;
        this.dampedHarmonicTimeElapsed = 0;
        this.dampedHarmonic = new DampedHarmonic(1, Math.sqrt(4 * force) * damping, force, currentRotation - this.trueTargetRotation, this.angularVelocityProperty.value);
      } else {
        this.dampedHarmonic = null;
      }
    });
  }

  /**
   * Clears some associated temporary properties (that isn't a full reset), particularly before it is pulled from a
   * stack.
   * @public
   */
  clear() {
    this.scaleProperty.reset();
    this.rotationProperty.reset();
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step(dt) {
    this.animator.step(dt);
  }

  /**
   * Rotates the piece so that it is closer to having the desired orientation for the shape container.
   * @public
   *
   * @param {ShapeContainer} closestContainer
   * @param {number} dt
   */
  orientTowardsContainer(closestContainer, dt) {
    this.targetRotationProperty.value = -2 * Math.PI * closestContainer.totalFractionProperty.value.value;
    this.dampedHarmonicTimeElapsed += dt;
    this.rotationProperty.value = this.trueTargetRotation + this.dampedHarmonic.getValue(this.dampedHarmonicTimeElapsed);
    this.angularVelocityProperty.value = this.dampedHarmonic.getDerivative(this.dampedHarmonicTimeElapsed);
  }

  /**
   * Returns the centroid of a swept (circular arc) piece (without any rotation).
   * @public
   *
   * @param {Fraction} fraction
   * @returns {Vector2}
   */
  static getSweptCentroid(fraction) {
    if (fraction.value === 1) {
      return Vector2.ZERO;
    } else {
      const positiveAngle = fraction.value * 2 * Math.PI;

      // Compute the centroid for a circular sector
      const radius = FractionsCommonConstants.SHAPE_SIZE / 2;
      const distanceFromCenter = 4 / 3 * radius * Math.sin(positiveAngle / 2) / positiveAngle;
      return Vector2.createPolar(distanceFromCenter, -positiveAngle / 2);
    }
  }
}
fractionsCommon.register('ShapePiece', ShapePiece);

// @public {Bounds2}
ShapePiece.VERTICAL_BAR_BOUNDS = Bounds2.point(0, 0).dilatedXY(FractionsCommonConstants.SHAPE_SIZE / 2, FractionsCommonConstants.SHAPE_VERTICAL_BAR_HEIGHT / 2);
export default ShapePiece;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiQm91bmRzMiIsIkRhbXBlZEhhcm1vbmljIiwiVmVjdG9yMiIsIlZlY3RvcjJQcm9wZXJ0eSIsIkZyYWN0aW9uIiwiRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzIiwiQW5pbWF0b3IiLCJmcmFjdGlvbnNDb21tb24iLCJCdWlsZGluZ1JlcHJlc2VudGF0aW9uIiwiZ2xvYmFsSUQiLCJTaGFwZVBpZWNlIiwiY29uc3RydWN0b3IiLCJmcmFjdGlvbiIsInJlcHJlc2VudGF0aW9uIiwiY29sb3IiLCJhc3NlcnQiLCJWQUxVRVMiLCJpbmNsdWRlcyIsImlkIiwicG9zaXRpb25Qcm9wZXJ0eSIsIlpFUk8iLCJyb3RhdGlvblByb3BlcnR5Iiwic2NhbGVQcm9wZXJ0eSIsInNoYWRvd1Byb3BlcnR5IiwiaXNVc2VyQ29udHJvbGxlZFByb3BlcnR5IiwiaXNBbmltYXRpbmdQcm9wZXJ0eSIsImFuaW1hdG9yIiwiYW5ndWxhclZlbG9jaXR5UHJvcGVydHkiLCJ0YXJnZXRSb3RhdGlvblByb3BlcnR5IiwiZGFtcGVkSGFybW9uaWMiLCJkYW1wZWRIYXJtb25pY1RpbWVFbGFwc2VkIiwidHJ1ZVRhcmdldFJvdGF0aW9uIiwibGluayIsImlzVXNlckNvbnRyb2xsZWQiLCJ2YWx1ZSIsIm11bHRpbGluayIsInRhcmdldFJvdGF0aW9uIiwiY3VycmVudFJvdGF0aW9uIiwibW9kaWZpZWRFbmRBbmdsZSIsImRhbXBpbmciLCJmb3JjZSIsIk1hdGgiLCJzcXJ0IiwiY2xlYXIiLCJyZXNldCIsInN0ZXAiLCJkdCIsIm9yaWVudFRvd2FyZHNDb250YWluZXIiLCJjbG9zZXN0Q29udGFpbmVyIiwiUEkiLCJ0b3RhbEZyYWN0aW9uUHJvcGVydHkiLCJnZXRWYWx1ZSIsImdldERlcml2YXRpdmUiLCJnZXRTd2VwdENlbnRyb2lkIiwicG9zaXRpdmVBbmdsZSIsInJhZGl1cyIsIlNIQVBFX1NJWkUiLCJkaXN0YW5jZUZyb21DZW50ZXIiLCJzaW4iLCJjcmVhdGVQb2xhciIsInJlZ2lzdGVyIiwiVkVSVElDQUxfQkFSX0JPVU5EUyIsInBvaW50IiwiZGlsYXRlZFhZIiwiU0hBUEVfVkVSVElDQUxfQkFSX0hFSUdIVCJdLCJzb3VyY2VzIjpbIlNoYXBlUGllY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBtb3ZhYmxlIHNoYXBlIFwicGllY2VcIiB0aGF0IGNhbiBiZSBjb21iaW5lZC9wbGFjZWQgaW50byBncm91cHMuXHJcbiAqXHJcbiAqIE5PVEU6IFRoZSBjb29yZGluYXRlIGZyYW1lIG9mIHBpZWNlcyBhcmUgYWx3YXlzIHdoZXJlIHRoZSBvcmlnaW4gb2YgdGhpcyBwaWVjZSBpcyBhdCBpdHMgY2VudHJvaWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBEYW1wZWRIYXJtb25pYyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGFtcGVkSGFybW9uaWMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBGcmFjdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL21vZGVsL0ZyYWN0aW9uLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEFuaW1hdG9yIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9BbmltYXRvci5qcyc7XHJcbmltcG9ydCBmcmFjdGlvbnNDb21tb24gZnJvbSAnLi4vLi4vZnJhY3Rpb25zQ29tbW9uLmpzJztcclxuaW1wb3J0IEJ1aWxkaW5nUmVwcmVzZW50YXRpb24gZnJvbSAnLi9CdWlsZGluZ1JlcHJlc2VudGF0aW9uLmpzJztcclxuXHJcbi8vIGdsb2JhbHNcclxuLy8gVXNlZCBmb3IgdW5pcXVlIGlkZW50aWZpZXJzIGZvciBldmVyeSBTaGFwZVBpZWNlIChzbyB3ZSBjYW4gZWZmaWNpZW50bHkgc3RvcmUgYSBtYXAgZnJvbSBwaWVjZSBJRCB0byBvdGhlciBvYmplY3RzLlxyXG5sZXQgZ2xvYmFsSUQgPSAwO1xyXG5cclxuY2xhc3MgU2hhcGVQaWVjZSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtGcmFjdGlvbn0gZnJhY3Rpb25cclxuICAgKiBAcGFyYW0ge0J1aWxkaW5nUmVwcmVzZW50YXRpb259IHJlcHJlc2VudGF0aW9uXHJcbiAgICogQHBhcmFtIHtDb2xvckRlZn0gY29sb3JcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZnJhY3Rpb24sIHJlcHJlc2VudGF0aW9uLCBjb2xvciApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZyYWN0aW9uIGluc3RhbmNlb2YgRnJhY3Rpb24gKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIEJ1aWxkaW5nUmVwcmVzZW50YXRpb24uVkFMVUVTLmluY2x1ZGVzKCByZXByZXNlbnRhdGlvbiApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb2xvciBpbnN0YW5jZW9mIFByb3BlcnR5ICk7XHJcblxyXG4gICAgdGhpcy5pZCA9IGdsb2JhbElEKys7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RnJhY3Rpb259XHJcbiAgICB0aGlzLmZyYWN0aW9uID0gZnJhY3Rpb247XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QnVpbGRpbmdSZXByZXNlbnRhdGlvbn1cclxuICAgIHRoaXMucmVwcmVzZW50YXRpb24gPSByZXByZXNlbnRhdGlvbjtcclxuXHJcbiAgICAvLyBAcHVibGljIHtDb2xvckRlZn1cclxuICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gQXBwbGllcyBvbmx5IHdoaWxlIG91dCBpbiB0aGUgcGxheSBhcmVhIChiZWluZyBhbmltYXRlZCBvciBkcmFnZ2VkKVxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggVmVjdG9yMi5aRVJPICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IC0gQXBwbGllcyBvbmx5IHdoaWxlIG91dCBpbiB0aGUgcGxheSBhcmVhIChiZWluZyBhbmltYXRlZCBvciBkcmFnZ2VkKVxyXG4gICAgdGhpcy5yb3RhdGlvblByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IC0gQXBwbGllcyBvbmx5IHdoaWxlIG91dCBpbiB0aGUgcGxheSBhcmVhIChiZWluZyBhbmltYXRlZCBvciBkcmFnZ2VkKVxyXG4gICAgdGhpcy5zY2FsZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IC0gQXBwbGllcyBvbmx5IHdoaWxlIG91dCBpbiB0aGUgcGxheSBhcmVhIChiZWluZyBhbmltYXRlZCBvciBkcmFnZ2VkKS4gV2lsbCBiZVxyXG4gICAgLy8gaW5jbHVzaXZlbHkgYmV0d2VlbiAwIChubyBzaGFkb3cgc2hvd24sIGRpcmVjdGx5IGJlaGluZCkgYW5kIDEgKGxhcmdlc3Qgc2hhZG93IG9mZnNldCkuXHJcbiAgICB0aGlzLnNoYWRvd1Byb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fVxyXG4gICAgdGhpcy5pc1VzZXJDb250cm9sbGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gLSBOT1RFOiBUaGUgc2hhcGUgcGllY2UgY2FuIHJvdGF0ZSB3aGVuIHRoaXMgaXMgZmFsc2UgKGUuZy4gd2hlbiB0aGUgdXNlciBpc1xyXG4gICAgLy8gZHJhZ2dpbmcgaXQpLiBJdCBqdXN0IG1lYW5zIHRoYXQgdGhlIHBvc2l0aW9uL3JvdGF0aW9uL3NjYWxlL3NoYWRvdyBhcmUgY29udHJvbGxlZCBieSBhbmltYXRpb24uXHJcbiAgICB0aGlzLmlzQW5pbWF0aW5nUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FuaW1hdG9yfVxyXG4gICAgdGhpcy5hbmltYXRvciA9IG5ldyBBbmltYXRvcigge1xyXG4gICAgICBwb3NpdGlvblByb3BlcnR5OiB0aGlzLnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIHJvdGF0aW9uUHJvcGVydHk6IHRoaXMucm90YXRpb25Qcm9wZXJ0eSxcclxuICAgICAgc2NhbGVQcm9wZXJ0eTogdGhpcy5zY2FsZVByb3BlcnR5LFxyXG4gICAgICBzaGFkb3dQcm9wZXJ0eTogdGhpcy5zaGFkb3dQcm9wZXJ0eSxcclxuICAgICAgaXNBbmltYXRpbmdQcm9wZXJ0eTogdGhpcy5pc0FuaW1hdGluZ1Byb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1Byb3BlcnR5LjxudW1iZXI+fVxyXG4gICAgdGhpcy5hbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG4gICAgdGhpcy50YXJnZXRSb3RhdGlvblByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0RhbXBlZEhhcm1vbmljfG51bGx9IC0gRm9yIHJvdGF0aW9uYWwgYW5pbWF0aW9uXHJcbiAgICB0aGlzLmRhbXBlZEhhcm1vbmljID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfVxyXG4gICAgdGhpcy5kYW1wZWRIYXJtb25pY1RpbWVFbGFwc2VkID0gMDtcclxuICAgIHRoaXMudHJ1ZVRhcmdldFJvdGF0aW9uID0gMDtcclxuXHJcbiAgICAvLyBObyBuZWVkIHRvIHVubGluaywgYXMgd2Ugb3duIHRoZSBnaXZlbiBQcm9wZXJ0eVxyXG4gICAgdGhpcy5pc1VzZXJDb250cm9sbGVkUHJvcGVydHkubGluayggaXNVc2VyQ29udHJvbGxlZCA9PiB7XHJcbiAgICAgIGlmICggaXNVc2VyQ29udHJvbGxlZCApIHtcclxuICAgICAgICB0aGlzLnNoYWRvd1Byb3BlcnR5LnZhbHVlID0gMTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEhhbmRsZSByb3RhdGlvbmFsIGFuaW1hdGlvbiB0b3dhcmRzIGEgdGFyZ2V0IChpZiBhbnkpXHJcbiAgICAvLyBObyBuZWVkIHRvIHVubGluaywgYXMgd2Ugb3duIHRoZSBnaXZlbiBQcm9wZXJ0aWVzXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHRoaXMuaXNVc2VyQ29udHJvbGxlZFByb3BlcnR5LCB0aGlzLnRhcmdldFJvdGF0aW9uUHJvcGVydHkgXSwgKCBpc1VzZXJDb250cm9sbGVkLCB0YXJnZXRSb3RhdGlvbiApID0+IHtcclxuICAgICAgaWYgKCBpc1VzZXJDb250cm9sbGVkICkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRSb3RhdGlvbiA9IHRoaXMucm90YXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICB0aGlzLnRydWVUYXJnZXRSb3RhdGlvbiA9IEFuaW1hdG9yLm1vZGlmaWVkRW5kQW5nbGUoIGN1cnJlbnRSb3RhdGlvbiwgdGhpcy50YXJnZXRSb3RhdGlvblByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgICAgIC8vIENvbnN0YW50cyB0d2Vha2VkIHRvIGdpdmUgdGhlIGRhbXBlZCBoYXJtb25pYyBhIHBsZWFzaW5nIGJlaGF2aW9yLlxyXG4gICAgICAgIGNvbnN0IGRhbXBpbmcgPSAxO1xyXG4gICAgICAgIGNvbnN0IGZvcmNlID0gNTA7XHJcbiAgICAgICAgdGhpcy5kYW1wZWRIYXJtb25pY1RpbWVFbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLmRhbXBlZEhhcm1vbmljID0gbmV3IERhbXBlZEhhcm1vbmljKCAxLCBNYXRoLnNxcnQoIDQgKiBmb3JjZSApICogZGFtcGluZywgZm9yY2UsIGN1cnJlbnRSb3RhdGlvbiAtIHRoaXMudHJ1ZVRhcmdldFJvdGF0aW9uLCB0aGlzLmFuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5kYW1wZWRIYXJtb25pYyA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFycyBzb21lIGFzc29jaWF0ZWQgdGVtcG9yYXJ5IHByb3BlcnRpZXMgKHRoYXQgaXNuJ3QgYSBmdWxsIHJlc2V0KSwgcGFydGljdWxhcmx5IGJlZm9yZSBpdCBpcyBwdWxsZWQgZnJvbSBhXHJcbiAgICogc3RhY2suXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNsZWFyKCkge1xyXG4gICAgdGhpcy5zY2FsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnJvdGF0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIGZvcndhcmQgaW4gdGltZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMuYW5pbWF0b3Iuc3RlcCggZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJvdGF0ZXMgdGhlIHBpZWNlIHNvIHRoYXQgaXQgaXMgY2xvc2VyIHRvIGhhdmluZyB0aGUgZGVzaXJlZCBvcmllbnRhdGlvbiBmb3IgdGhlIHNoYXBlIGNvbnRhaW5lci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NoYXBlQ29udGFpbmVyfSBjbG9zZXN0Q29udGFpbmVyXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICovXHJcbiAgb3JpZW50VG93YXJkc0NvbnRhaW5lciggY2xvc2VzdENvbnRhaW5lciwgZHQgKSB7XHJcbiAgICB0aGlzLnRhcmdldFJvdGF0aW9uUHJvcGVydHkudmFsdWUgPSAtMiAqIE1hdGguUEkgKiBjbG9zZXN0Q29udGFpbmVyLnRvdGFsRnJhY3Rpb25Qcm9wZXJ0eS52YWx1ZS52YWx1ZTtcclxuXHJcbiAgICB0aGlzLmRhbXBlZEhhcm1vbmljVGltZUVsYXBzZWQgKz0gZHQ7XHJcbiAgICB0aGlzLnJvdGF0aW9uUHJvcGVydHkudmFsdWUgPSB0aGlzLnRydWVUYXJnZXRSb3RhdGlvbiArIHRoaXMuZGFtcGVkSGFybW9uaWMuZ2V0VmFsdWUoIHRoaXMuZGFtcGVkSGFybW9uaWNUaW1lRWxhcHNlZCApO1xyXG4gICAgdGhpcy5hbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuZGFtcGVkSGFybW9uaWMuZ2V0RGVyaXZhdGl2ZSggdGhpcy5kYW1wZWRIYXJtb25pY1RpbWVFbGFwc2VkICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjZW50cm9pZCBvZiBhIHN3ZXB0IChjaXJjdWxhciBhcmMpIHBpZWNlICh3aXRob3V0IGFueSByb3RhdGlvbikuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtGcmFjdGlvbn0gZnJhY3Rpb25cclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0U3dlcHRDZW50cm9pZCggZnJhY3Rpb24gKSB7XHJcbiAgICBpZiAoIGZyYWN0aW9uLnZhbHVlID09PSAxICkge1xyXG4gICAgICByZXR1cm4gVmVjdG9yMi5aRVJPO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvbnN0IHBvc2l0aXZlQW5nbGUgPSBmcmFjdGlvbi52YWx1ZSAqIDIgKiBNYXRoLlBJO1xyXG5cclxuICAgICAgLy8gQ29tcHV0ZSB0aGUgY2VudHJvaWQgZm9yIGEgY2lyY3VsYXIgc2VjdG9yXHJcbiAgICAgIGNvbnN0IHJhZGl1cyA9IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5TSEFQRV9TSVpFIC8gMjtcclxuICAgICAgY29uc3QgZGlzdGFuY2VGcm9tQ2VudGVyID0gNCAvIDMgKiByYWRpdXMgKiBNYXRoLnNpbiggcG9zaXRpdmVBbmdsZSAvIDIgKSAvIHBvc2l0aXZlQW5nbGU7XHJcbiAgICAgIHJldHVybiBWZWN0b3IyLmNyZWF0ZVBvbGFyKCBkaXN0YW5jZUZyb21DZW50ZXIsIC1wb3NpdGl2ZUFuZ2xlIC8gMiApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnJhY3Rpb25zQ29tbW9uLnJlZ2lzdGVyKCAnU2hhcGVQaWVjZScsIFNoYXBlUGllY2UgKTtcclxuXHJcbi8vIEBwdWJsaWMge0JvdW5kczJ9XHJcblNoYXBlUGllY2UuVkVSVElDQUxfQkFSX0JPVU5EUyA9IEJvdW5kczIucG9pbnQoIDAsIDAgKS5kaWxhdGVkWFkoXHJcbiAgRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLlNIQVBFX1NJWkUgLyAyLFxyXG4gIEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5TSEFQRV9WRVJUSUNBTF9CQVJfSEVJR0hUIC8gMlxyXG4pO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2hhcGVQaWVjZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxjQUFjLE1BQU0sc0NBQXNDO0FBQ2pFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxRQUFRLE1BQU0sNkNBQTZDO0FBQ2xFLE9BQU9DLHdCQUF3QixNQUFNLDBDQUEwQztBQUMvRSxPQUFPQyxRQUFRLE1BQU0sZ0NBQWdDO0FBQ3JELE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0Msc0JBQXNCLE1BQU0sNkJBQTZCOztBQUVoRTtBQUNBO0FBQ0EsSUFBSUMsUUFBUSxHQUFHLENBQUM7QUFFaEIsTUFBTUMsVUFBVSxDQUFDO0VBQ2Y7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxRQUFRLEVBQUVDLGNBQWMsRUFBRUMsS0FBSyxFQUFHO0lBQzdDQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUgsUUFBUSxZQUFZUixRQUFTLENBQUM7SUFDaERXLE1BQU0sSUFBSUEsTUFBTSxDQUFFUCxzQkFBc0IsQ0FBQ1EsTUFBTSxDQUFDQyxRQUFRLENBQUVKLGNBQWUsQ0FBRSxDQUFDO0lBQzVFRSxNQUFNLElBQUlBLE1BQU0s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