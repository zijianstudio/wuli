// Copyright 2013-2021, University of Colorado Boulder

/**
 * A pair of electrons in VSEPR, which are either an atom (the electrons are constrained by the bond) or a lone pair.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import Element from '../../../../nitroglycerin/js/Element.js';
import merge from '../../../../phet-core/js/merge.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import moleculeShapes from '../../moleculeShapes.js';
let nextId = 0;
class PairGroup {
  /**
   * @param {Vector3} position - Initial position
   * @param {boolean} isLonePair - True for a lone pair, false for an atom
   * @param {Object} [options] - See in the constructor for more information
   */
  constructor(position, isLonePair, options) {
    options = merge({
      // {Element|null} - The NITROGLYCERIN element if applicable (e.g. real model), or null if there is no element.
      element: null
    }, options);

    // @public {number} - Unique identifier.
    this.id = nextId++;

    // @public {Property.<Vector3>}
    this.positionProperty = new Property(position);

    // @public {Property.<Vector3>}
    this.velocityProperty = new Property(Vector3.ZERO);

    // @public {Property.<boolean>} - Whether the user is directly manipulating the position currently.
    this.userControlledProperty = new BooleanProperty(false);

    // @public (read-only) {Vector3} - Normalized position (unit vector).
    this.orientation = new Vector3(0, 0, 0);
    this.positionProperty.link(position => {
      this.orientation.set(position);
      if (position.magnitude > 0) {
        this.orientation.normalize();
      }
    });

    // @public {boolean}
    this.isLonePair = isLonePair;

    // @public {boolean} - Might be overridden to true by Molecule.addCentralAtom().
    this.isCentralAtom = false;

    // @public {Element|undefined} - undefined for VSEPR pair group
    this.element = options.element;
    if (assert) {
      this.positionProperty.lazyLink((newValue, oldValue) => {
        assert && assert(!isNaN(newValue.x), 'NaN detected in position!');
      });
      this.velocityProperty.lazyLink((newValue, oldValue) => {
        assert && assert(!isNaN(newValue.x), 'NaN detected in velocity!');
      });
    }
  }

  /**
   * Applies a damped spring-like system to move this pair group towards the "ideal" distance from its parent atom.
   * @public
   *
   * @param {number} timeElapsed - Amount of time the attraction is to be applied over
   * @param {number} oldDistance - Previous distance from the pair group to its parent atom
   * @param {Bond} bond - Bond to the parent atom
   */
  attractToIdealDistance(timeElapsed, oldDistance, bond) {
    if (this.userControlledProperty.value) {
      // don't process if being dragged
      return;
    }
    const origin = bond.getOtherAtom(this).positionProperty.value;
    const isTerminalLonePair = !origin.equals(Vector3.ZERO);
    const idealDistanceFromCenter = bond.length;

    /*---------------------------------------------------------------------------*
     * prevent movement away from our ideal distance
     *----------------------------------------------------------------------------*/
    const currentError = Math.abs(this.positionProperty.value.minus(origin).magnitude - idealDistanceFromCenter);
    const oldError = Math.abs(oldDistance - idealDistanceFromCenter);
    if (currentError > oldError) {
      // our error is getting worse! for now, don't let us slide AWAY from the ideal distance ever
      // set our distance to the old one, so it is easier to process
      this.positionProperty.value = this.orientation.times(oldDistance).plus(origin);
    }

    /*---------------------------------------------------------------------------*
     * use damped movement towards our ideal distance
     *----------------------------------------------------------------------------*/
    const toCenter = this.positionProperty.value.minus(origin);
    const distance = toCenter.magnitude;
    if (distance !== 0) {
      const directionToCenter = toCenter.normalized();
      const offset = idealDistanceFromCenter - distance;

      // just modify position for now so we don't get any oscillations
      let ratioOfMovement = Math.min(0.1 * timeElapsed / 0.016, 1);
      if (isTerminalLonePair) {
        ratioOfMovement = 1;
      }
      this.positionProperty.value = this.positionProperty.value.plus(directionToCenter.times(ratioOfMovement * offset));
    }
  }

  /**
   * Returns the repulsion impulse (force * time) for the repulsion applied to this pair from FROM the provided
   * pair group.
   * @public
   *
   * @param {PairGroup} other - The pair group whose force on this object we want
   * @param {number} timeElapsed - Time elapsed (thus we return an impulse instead of a force)
   * @param {number} trueLengthsRatioOverride - From 0 to 1. If 0, lone pairs will behave the same as bonds. If 1, lone pair
   *                                            distance will be taken into account
   * @returns Repulsion force on this pair group, from the other pair group
   */
  getRepulsionImpulse(other, timeElapsed, trueLengthsRatioOverride) {
    // only handle the force on this object for now

    // If the positions overlap, just let the attraction take care of things. See https://github.com/phetsims/molecule-shapes/issues/136
    if (this.positionProperty.value.equalsEpsilon(other.positionProperty.value, 1e-6)) {
      return new Vector3(0, 0, 0);
    }

    /*---------------------------------------------------------------------------*
     * adjust the logical positions when the repulsion modifier is less than 1
     *
     * (this allows us to get the "VSEPR" correct geometry even with lone pairs.
     * since lone pairs are closer in, an actual Coulomb model would diverge from
     * the VSEPR model angles. Here, we converge to the model VSEPR behavior, but
     * allow correct Coulomb calculations at greater distances
     *----------------------------------------------------------------------------*/

    // adjusted distances from the center atom
    const adjustedMagnitude = interpolate(PairGroup.BONDED_PAIR_DISTANCE, this.positionProperty.value.magnitude, trueLengthsRatioOverride);
    const adjustedOtherMagnitude = interpolate(PairGroup.BONDED_PAIR_DISTANCE, other.positionProperty.value.magnitude, trueLengthsRatioOverride);

    // adjusted positions
    const adjustedPosition = this.orientation.times(adjustedMagnitude);
    const adjustedOtherPosition = other.positionProperty.value.magnitude === 0 ? new Vector3(0, 0, 0) : other.orientation.times(adjustedOtherMagnitude);

    // from other => this (adjusted)
    const delta = adjustedPosition.minus(adjustedOtherPosition);

    /*---------------------------------------------------------------------------*
     * coulomb repulsion
     *----------------------------------------------------------------------------*/

    // mimic Coulomb's Law
    const coulombVelocityDelta = delta.withMagnitude(timeElapsed * PairGroup.ELECTRON_PAIR_REPULSION_SCALE / (delta.magnitude * delta.magnitude));

    // apply a nonphysical reduction on coulomb's law when the frame-rate is low, so we can avoid oscillation
    const coulombDowngrade = PairGroup.getTimescaleImpulseFactor(timeElapsed);
    return coulombVelocityDelta.times(coulombDowngrade);
  }

  /**
   * Applies a repulsive force from another PairGroup to this PairGroup.
   * @public
   *
   * @param {PairGroup} other - The pair group whose force on this object we want
   * @param {number} timeElapsed - Time elapsed (thus we return an impulse instead of a force)
   * @param {number} trueLengthsRatioOverride - From 0 to 1. If 0, lone pairs will behave the same as bonds. If 1, lone pair
   *                                            distance will be taken into account
   */
  repulseFrom(other, timeElapsed, trueLengthsRatioOverride) {
    this.addVelocity(this.getRepulsionImpulse(other, timeElapsed, trueLengthsRatioOverride));
  }

  /**
   * Adds a change to our position if this PairGroup can have non-user-controlled changes.
   * @public
   *
   * @param {Vector3} positionChange
   */
  addPosition(positionChange) {
    // don't allow velocity changes if we are dragging it, OR if it is an atom at the origin
    if (!this.userControlledProperty.value && !this.isCentralAtom) {
      this.positionProperty.value = this.positionProperty.value.plus(positionChange);
    }
  }

  /**
   * Adds a change to our velocity if this PairGroup can have non-user-controlled changes.
   * @public
   *
   * @param {Vector3} velocityChange
   */
  addVelocity(velocityChange) {
    // don't allow velocity changes if we are dragging it, OR if it is an atom at the origin
    if (!this.userControlledProperty.value && !this.isCentralAtom) {
      this.velocityProperty.value = this.velocityProperty.value.plus(velocityChange);
    }
  }

  /**
   * Steps this pair group forward in time (moving in the direction of its velocity), and slowly damps the velocity.
   * @public
   *
   * @param {number} timeElapsed
   */
  stepForward(timeElapsed) {
    if (this.userControlledProperty.value) {
      return;
    }

    // velocity changes so that it doesn't point at all towards or away from the origin
    const velocityMagnitudeOutwards = this.velocityProperty.value.dot(this.orientation);
    if (this.positionProperty.value.magnitude > 0) {
      this.velocityProperty.value = this.velocityProperty.value.minus(this.orientation.times(velocityMagnitudeOutwards)); // subtract the outwards-component out
    }

    // move position forward by scaled velocity
    this.positionProperty.value = this.positionProperty.value.plus(this.velocityProperty.value.times(timeElapsed));

    // add in damping so we don't get the kind of oscillation that we are seeing
    let damping = 1 - PairGroup.DAMPING_FACTOR;
    damping = Math.pow(damping, timeElapsed / 0.017); // based so that we have no modification at 0.017
    this.velocityProperty.value = this.velocityProperty.value.times(damping);
  }

  /**
   * Sets the position and zeros the velocity.
   * @public
   *
   * @param {Vector3} vector
   */
  dragToPosition(vector) {
    this.positionProperty.value = vector;

    // stop any velocity that was moving the pair
    this.velocityProperty.value = new Vector3(0, 0, 0);
  }

  /**
   * @public
   *
   * @param {PairGroup} centralAtom
   * @returns {Object}
   */
  toStateObject(centralAtom) {
    return {
      position: this.positionProperty.value.toStateObject(),
      velocity: this.velocityProperty.value.toStateObject(),
      isLonePair: this.isLonePair,
      element: this.element === null ? null : this.element.symbol,
      isCentralAtom: this === centralAtom
    };
  }

  /**
   * @public
   *
   * @param {Object} obj
   * @returns {PairGroup}
   */
  static fromStateObject(obj) {
    const position = Vector3.fromStateObject(obj.position);
    const velocity = Vector3.fromStateObject(obj.velocity);
    const isLonePair = obj.isLonePair;
    const element = obj.element === null ? null : Element.getElementBySymbol(obj.element);
    const pairGroup = new PairGroup(position, isLonePair, {
      element: element
    });
    pairGroup.isCentralAtom = obj.isCentralAtom;
    pairGroup.velocityProperty.value = velocity;
    return pairGroup;
  }

  /**
   * Returns a multiplicative factor based on the time elapsed, so that we can avoid oscillation when the frame-rate is
   * low, due to how the damping is implemented.
   * @public
   *
   * @param {number} timeElapsed
   * @returns {number}
   */
  static getTimescaleImpulseFactor(timeElapsed) {
    return Math.sqrt(timeElapsed > 0.017 ? 0.017 / timeElapsed : 1);
  }
}
moleculeShapes.register('PairGroup', PairGroup);

/*---------------------------------------------------------------------------*
 * constants
 *----------------------------------------------------------------------------*/

// @public {number} - Ideal distance from atom to atom (model screen).
PairGroup.BONDED_PAIR_DISTANCE = 10.0;

// @public {number} - Ideal distance from atom to lone pair (both screens).
PairGroup.LONE_PAIR_DISTANCE = 7.0;

// @public {number} - Control on Coulomb effect. Tuned for stability and aesthetic.
PairGroup.ELECTRON_PAIR_REPULSION_SCALE = 30000;

// @public {number} - Tuned control of fake force to push angles between pair groups to their ideal.
PairGroup.ANGLE_REPULSION_SCALE = 3;

// @public {number} - Tuned control for force to jitter positions of atoms (planar cases otherwise stable)
PairGroup.JITTER_SCALE = 0.001;

// @public {number} - Tuned control to reduce velocity, in order to ensure stability.
PairGroup.DAMPING_FACTOR = 0.1;
function interpolate(a, b, ratio) {
  return a * (1 - ratio) + b * ratio;
}

// @public {IOType}
PairGroup.PairGroupIO = new IOType('PairGroupIO', {
  valueType: PairGroup,
  stateSchema: {
    position: Vector3.Vector3IO,
    velocity: Vector3.Vector3IO,
    isLonePair: BooleanIO,
    element: NullableIO(StringIO),
    isCentralAtom: BooleanIO
  }
});
export default PairGroup;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlZlY3RvcjMiLCJFbGVtZW50IiwibWVyZ2UiLCJCb29sZWFuSU8iLCJJT1R5cGUiLCJOdWxsYWJsZUlPIiwiU3RyaW5nSU8iLCJtb2xlY3VsZVNoYXBlcyIsIm5leHRJZCIsIlBhaXJHcm91cCIsImNvbnN0cnVjdG9yIiwicG9zaXRpb24iLCJpc0xvbmVQYWlyIiwib3B0aW9ucyIsImVsZW1lbnQiLCJpZCIsInBvc2l0aW9uUHJvcGVydHkiLCJ2ZWxvY2l0eVByb3BlcnR5IiwiWkVSTyIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJvcmllbnRhdGlvbiIsImxpbmsiLCJzZXQiLCJtYWduaXR1ZGUiLCJub3JtYWxpemUiLCJpc0NlbnRyYWxBdG9tIiwiYXNzZXJ0IiwibGF6eUxpbmsiLCJuZXdWYWx1ZSIsIm9sZFZhbHVlIiwiaXNOYU4iLCJ4IiwiYXR0cmFjdFRvSWRlYWxEaXN0YW5jZSIsInRpbWVFbGFwc2VkIiwib2xkRGlzdGFuY2UiLCJib25kIiwidmFsdWUiLCJvcmlnaW4iLCJnZXRPdGhlckF0b20iLCJpc1Rlcm1pbmFsTG9uZVBhaXIiLCJlcXVhbHMiLCJpZGVhbERpc3RhbmNlRnJvbUNlbnRlciIsImxlbmd0aCIsImN1cnJlbnRFcnJvciIsIk1hdGgiLCJhYnMiLCJtaW51cyIsIm9sZEVycm9yIiwidGltZXMiLCJwbHVzIiwidG9DZW50ZXIiLCJkaXN0YW5jZSIsImRpcmVjdGlvblRvQ2VudGVyIiwibm9ybWFsaXplZCIsIm9mZnNldCIsInJhdGlvT2ZNb3ZlbWVudCIsIm1pbiIsImdldFJlcHVsc2lvbkltcHVsc2UiLCJvdGhlciIsInRydWVMZW5ndGhzUmF0aW9PdmVycmlkZSIsImVxdWFsc0Vwc2lsb24iLCJhZGp1c3RlZE1hZ25pdHVkZSIsImludGVycG9sYXRlIiwiQk9OREVEX1BBSVJfRElTVEFOQ0UiLCJhZGp1c3RlZE90aGVyTWFnbml0dWRlIiwiYWRqdXN0ZWRQb3NpdGlvbiIsImFkanVzdGVkT3RoZXJQb3NpdGlvbiIsImRlbHRhIiwiY291bG9tYlZlbG9jaXR5RGVsdGEiLCJ3aXRoTWFnbml0dWRlIiwiRUxFQ1RST05fUEFJUl9SRVBVTFNJT05fU0NBTEUiLCJjb3Vsb21iRG93bmdyYWRlIiwiZ2V0VGltZXNjYWxlSW1wdWxzZUZhY3RvciIsInJlcHVsc2VGcm9tIiwiYWRkVmVsb2NpdHkiLCJhZGRQb3NpdGlvbiIsInBvc2l0aW9uQ2hhbmdlIiwidmVsb2NpdHlDaGFuZ2UiLCJzdGVwRm9yd2FyZCIsInZlbG9jaXR5TWFnbml0dWRlT3V0d2FyZHMiLCJkb3QiLCJkYW1waW5nIiwiREFNUElOR19GQUNUT1IiLCJwb3ciLCJkcmFnVG9Qb3NpdGlvbiIsInZlY3RvciIsInRvU3RhdGVPYmplY3QiLCJjZW50cmFsQXRvbSIsInZlbG9jaXR5Iiwic3ltYm9sIiwiZnJvbVN0YXRlT2JqZWN0Iiwib2JqIiwiZ2V0RWxlbWVudEJ5U3ltYm9sIiwicGFpckdyb3VwIiwic3FydCIsInJlZ2lzdGVyIiwiTE9ORV9QQUlSX0RJU1RBTkNFIiwiQU5HTEVfUkVQVUxTSU9OX1NDQUxFIiwiSklUVEVSX1NDQUxFIiwiYSIsImIiLCJyYXRpbyIsIlBhaXJHcm91cElPIiwidmFsdWVUeXBlIiwic3RhdGVTY2hlbWEiLCJWZWN0b3IzSU8iXSwic291cmNlcyI6WyJQYWlyR3JvdXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBwYWlyIG9mIGVsZWN0cm9ucyBpbiBWU0VQUiwgd2hpY2ggYXJlIGVpdGhlciBhbiBhdG9tICh0aGUgZWxlY3Ryb25zIGFyZSBjb25zdHJhaW5lZCBieSB0aGUgYm9uZCkgb3IgYSBsb25lIHBhaXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMy5qcyc7XHJcbmltcG9ydCBFbGVtZW50IGZyb20gJy4uLy4uLy4uLy4uL25pdHJvZ2x5Y2VyaW4vanMvRWxlbWVudC5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgQm9vbGVhbklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9Cb29sZWFuSU8uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XHJcbmltcG9ydCBTdHJpbmdJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvU3RyaW5nSU8uanMnO1xyXG5pbXBvcnQgbW9sZWN1bGVTaGFwZXMgZnJvbSAnLi4vLi4vbW9sZWN1bGVTaGFwZXMuanMnO1xyXG5cclxubGV0IG5leHRJZCA9IDA7XHJcblxyXG5jbGFzcyBQYWlyR3JvdXAge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gcG9zaXRpb24gLSBJbml0aWFsIHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0xvbmVQYWlyIC0gVHJ1ZSBmb3IgYSBsb25lIHBhaXIsIGZhbHNlIGZvciBhbiBhdG9tXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIFNlZSBpbiB0aGUgY29uc3RydWN0b3IgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcG9zaXRpb24sIGlzTG9uZVBhaXIsIG9wdGlvbnMgKSB7XHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgLy8ge0VsZW1lbnR8bnVsbH0gLSBUaGUgTklUUk9HTFlDRVJJTiBlbGVtZW50IGlmIGFwcGxpY2FibGUgKGUuZy4gcmVhbCBtb2RlbCksIG9yIG51bGwgaWYgdGhlcmUgaXMgbm8gZWxlbWVudC5cclxuICAgICAgZWxlbWVudDogbnVsbFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn0gLSBVbmlxdWUgaWRlbnRpZmllci5cclxuICAgIHRoaXMuaWQgPSBuZXh0SWQrKztcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48VmVjdG9yMz59XHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHBvc2l0aW9uICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPFZlY3RvcjM+fVxyXG4gICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBWZWN0b3IzLlpFUk8gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IC0gV2hldGhlciB0aGUgdXNlciBpcyBkaXJlY3RseSBtYW5pcHVsYXRpbmcgdGhlIHBvc2l0aW9uIGN1cnJlbnRseS5cclxuICAgIHRoaXMudXNlckNvbnRyb2xsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7VmVjdG9yM30gLSBOb3JtYWxpemVkIHBvc2l0aW9uICh1bml0IHZlY3RvcikuXHJcbiAgICB0aGlzLm9yaWVudGF0aW9uID0gbmV3IFZlY3RvcjMoIDAsIDAsIDAgKTtcclxuXHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xyXG4gICAgICB0aGlzLm9yaWVudGF0aW9uLnNldCggcG9zaXRpb24gKTtcclxuXHJcbiAgICAgIGlmICggcG9zaXRpb24ubWFnbml0dWRlID4gMCApIHtcclxuICAgICAgICB0aGlzLm9yaWVudGF0aW9uLm5vcm1hbGl6ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn1cclxuICAgIHRoaXMuaXNMb25lUGFpciA9IGlzTG9uZVBhaXI7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn0gLSBNaWdodCBiZSBvdmVycmlkZGVuIHRvIHRydWUgYnkgTW9sZWN1bGUuYWRkQ2VudHJhbEF0b20oKS5cclxuICAgIHRoaXMuaXNDZW50cmFsQXRvbSA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0VsZW1lbnR8dW5kZWZpbmVkfSAtIHVuZGVmaW5lZCBmb3IgVlNFUFIgcGFpciBncm91cFxyXG4gICAgdGhpcy5lbGVtZW50ID0gb3B0aW9ucy5lbGVtZW50O1xyXG5cclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkubGF6eUxpbmsoICggbmV3VmFsdWUsIG9sZFZhbHVlICkgPT4ge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFpc05hTiggbmV3VmFsdWUueCApLCAnTmFOIGRldGVjdGVkIGluIHBvc2l0aW9uIScgKTtcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLnZlbG9jaXR5UHJvcGVydHkubGF6eUxpbmsoICggbmV3VmFsdWUsIG9sZFZhbHVlICkgPT4ge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFpc05hTiggbmV3VmFsdWUueCApLCAnTmFOIGRldGVjdGVkIGluIHZlbG9jaXR5IScgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXBwbGllcyBhIGRhbXBlZCBzcHJpbmctbGlrZSBzeXN0ZW0gdG8gbW92ZSB0aGlzIHBhaXIgZ3JvdXAgdG93YXJkcyB0aGUgXCJpZGVhbFwiIGRpc3RhbmNlIGZyb20gaXRzIHBhcmVudCBhdG9tLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lRWxhcHNlZCAtIEFtb3VudCBvZiB0aW1lIHRoZSBhdHRyYWN0aW9uIGlzIHRvIGJlIGFwcGxpZWQgb3ZlclxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvbGREaXN0YW5jZSAtIFByZXZpb3VzIGRpc3RhbmNlIGZyb20gdGhlIHBhaXIgZ3JvdXAgdG8gaXRzIHBhcmVudCBhdG9tXHJcbiAgICogQHBhcmFtIHtCb25kfSBib25kIC0gQm9uZCB0byB0aGUgcGFyZW50IGF0b21cclxuICAgKi9cclxuICBhdHRyYWN0VG9JZGVhbERpc3RhbmNlKCB0aW1lRWxhcHNlZCwgb2xkRGlzdGFuY2UsIGJvbmQgKSB7XHJcbiAgICBpZiAoIHRoaXMudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgLy8gZG9uJ3QgcHJvY2VzcyBpZiBiZWluZyBkcmFnZ2VkXHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IG9yaWdpbiA9IGJvbmQuZ2V0T3RoZXJBdG9tKCB0aGlzICkucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICBjb25zdCBpc1Rlcm1pbmFsTG9uZVBhaXIgPSAhb3JpZ2luLmVxdWFscyggVmVjdG9yMy5aRVJPICk7XHJcblxyXG4gICAgY29uc3QgaWRlYWxEaXN0YW5jZUZyb21DZW50ZXIgPSBib25kLmxlbmd0aDtcclxuXHJcbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgICAqIHByZXZlbnQgbW92ZW1lbnQgYXdheSBmcm9tIG91ciBpZGVhbCBkaXN0YW5jZVxyXG4gICAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuICAgIGNvbnN0IGN1cnJlbnRFcnJvciA9IE1hdGguYWJzKCAoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5taW51cyggb3JpZ2luICkgKS5tYWduaXR1ZGUgLSBpZGVhbERpc3RhbmNlRnJvbUNlbnRlciApO1xyXG4gICAgY29uc3Qgb2xkRXJyb3IgPSBNYXRoLmFicyggb2xkRGlzdGFuY2UgLSBpZGVhbERpc3RhbmNlRnJvbUNlbnRlciApO1xyXG4gICAgaWYgKCBjdXJyZW50RXJyb3IgPiBvbGRFcnJvciApIHtcclxuICAgICAgLy8gb3VyIGVycm9yIGlzIGdldHRpbmcgd29yc2UhIGZvciBub3csIGRvbid0IGxldCB1cyBzbGlkZSBBV0FZIGZyb20gdGhlIGlkZWFsIGRpc3RhbmNlIGV2ZXJcclxuICAgICAgLy8gc2V0IG91ciBkaXN0YW5jZSB0byB0aGUgb2xkIG9uZSwgc28gaXQgaXMgZWFzaWVyIHRvIHByb2Nlc3NcclxuICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gdGhpcy5vcmllbnRhdGlvbi50aW1lcyggb2xkRGlzdGFuY2UgKS5wbHVzKCBvcmlnaW4gKTtcclxuICAgIH1cclxuXHJcbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgICAqIHVzZSBkYW1wZWQgbW92ZW1lbnQgdG93YXJkcyBvdXIgaWRlYWwgZGlzdGFuY2VcclxuICAgICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbiAgICBjb25zdCB0b0NlbnRlciA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5taW51cyggb3JpZ2luICk7XHJcblxyXG4gICAgY29uc3QgZGlzdGFuY2UgPSB0b0NlbnRlci5tYWduaXR1ZGU7XHJcbiAgICBpZiAoIGRpc3RhbmNlICE9PSAwICkge1xyXG4gICAgICBjb25zdCBkaXJlY3Rpb25Ub0NlbnRlciA9IHRvQ2VudGVyLm5vcm1hbGl6ZWQoKTtcclxuXHJcbiAgICAgIGNvbnN0IG9mZnNldCA9IGlkZWFsRGlzdGFuY2VGcm9tQ2VudGVyIC0gZGlzdGFuY2U7XHJcblxyXG4gICAgICAvLyBqdXN0IG1vZGlmeSBwb3NpdGlvbiBmb3Igbm93IHNvIHdlIGRvbid0IGdldCBhbnkgb3NjaWxsYXRpb25zXHJcbiAgICAgIGxldCByYXRpb09mTW92ZW1lbnQgPSBNYXRoLm1pbiggMC4xICogdGltZUVsYXBzZWQgLyAwLjAxNiwgMSApO1xyXG4gICAgICBpZiAoIGlzVGVybWluYWxMb25lUGFpciApIHtcclxuICAgICAgICByYXRpb09mTW92ZW1lbnQgPSAxO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCBkaXJlY3Rpb25Ub0NlbnRlci50aW1lcyggcmF0aW9PZk1vdmVtZW50ICogb2Zmc2V0ICkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHJlcHVsc2lvbiBpbXB1bHNlIChmb3JjZSAqIHRpbWUpIGZvciB0aGUgcmVwdWxzaW9uIGFwcGxpZWQgdG8gdGhpcyBwYWlyIGZyb20gRlJPTSB0aGUgcHJvdmlkZWRcclxuICAgKiBwYWlyIGdyb3VwLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UGFpckdyb3VwfSBvdGhlciAtIFRoZSBwYWlyIGdyb3VwIHdob3NlIGZvcmNlIG9uIHRoaXMgb2JqZWN0IHdlIHdhbnRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdGltZUVsYXBzZWQgLSBUaW1lIGVsYXBzZWQgKHRodXMgd2UgcmV0dXJuIGFuIGltcHVsc2UgaW5zdGVhZCBvZiBhIGZvcmNlKVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0cnVlTGVuZ3Roc1JhdGlvT3ZlcnJpZGUgLSBGcm9tIDAgdG8gMS4gSWYgMCwgbG9uZSBwYWlycyB3aWxsIGJlaGF2ZSB0aGUgc2FtZSBhcyBib25kcy4gSWYgMSwgbG9uZSBwYWlyXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlIHdpbGwgYmUgdGFrZW4gaW50byBhY2NvdW50XHJcbiAgICogQHJldHVybnMgUmVwdWxzaW9uIGZvcmNlIG9uIHRoaXMgcGFpciBncm91cCwgZnJvbSB0aGUgb3RoZXIgcGFpciBncm91cFxyXG4gICAqL1xyXG4gIGdldFJlcHVsc2lvbkltcHVsc2UoIG90aGVyLCB0aW1lRWxhcHNlZCwgdHJ1ZUxlbmd0aHNSYXRpb092ZXJyaWRlICkge1xyXG4gICAgLy8gb25seSBoYW5kbGUgdGhlIGZvcmNlIG9uIHRoaXMgb2JqZWN0IGZvciBub3dcclxuXHJcbiAgICAvLyBJZiB0aGUgcG9zaXRpb25zIG92ZXJsYXAsIGp1c3QgbGV0IHRoZSBhdHRyYWN0aW9uIHRha2UgY2FyZSBvZiB0aGluZ3MuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbW9sZWN1bGUtc2hhcGVzL2lzc3Vlcy8xMzZcclxuICAgIGlmICggdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLmVxdWFsc0Vwc2lsb24oIG90aGVyLnBvc2l0aW9uUHJvcGVydHkudmFsdWUsIDFlLTYgKSApIHtcclxuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IzKCAwLCAwLCAwICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICAgKiBhZGp1c3QgdGhlIGxvZ2ljYWwgcG9zaXRpb25zIHdoZW4gdGhlIHJlcHVsc2lvbiBtb2RpZmllciBpcyBsZXNzIHRoYW4gMVxyXG4gICAgICpcclxuICAgICAqICh0aGlzIGFsbG93cyB1cyB0byBnZXQgdGhlIFwiVlNFUFJcIiBjb3JyZWN0IGdlb21ldHJ5IGV2ZW4gd2l0aCBsb25lIHBhaXJzLlxyXG4gICAgICogc2luY2UgbG9uZSBwYWlycyBhcmUgY2xvc2VyIGluLCBhbiBhY3R1YWwgQ291bG9tYiBtb2RlbCB3b3VsZCBkaXZlcmdlIGZyb21cclxuICAgICAqIHRoZSBWU0VQUiBtb2RlbCBhbmdsZXMuIEhlcmUsIHdlIGNvbnZlcmdlIHRvIHRoZSBtb2RlbCBWU0VQUiBiZWhhdmlvciwgYnV0XHJcbiAgICAgKiBhbGxvdyBjb3JyZWN0IENvdWxvbWIgY2FsY3VsYXRpb25zIGF0IGdyZWF0ZXIgZGlzdGFuY2VzXHJcbiAgICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAgIC8vIGFkanVzdGVkIGRpc3RhbmNlcyBmcm9tIHRoZSBjZW50ZXIgYXRvbVxyXG4gICAgY29uc3QgYWRqdXN0ZWRNYWduaXR1ZGUgPSBpbnRlcnBvbGF0ZSggUGFpckdyb3VwLkJPTkRFRF9QQUlSX0RJU1RBTkNFLCB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUubWFnbml0dWRlLCB0cnVlTGVuZ3Roc1JhdGlvT3ZlcnJpZGUgKTtcclxuICAgIGNvbnN0IGFkanVzdGVkT3RoZXJNYWduaXR1ZGUgPSBpbnRlcnBvbGF0ZSggUGFpckdyb3VwLkJPTkRFRF9QQUlSX0RJU1RBTkNFLCBvdGhlci5wb3NpdGlvblByb3BlcnR5LnZhbHVlLm1hZ25pdHVkZSwgdHJ1ZUxlbmd0aHNSYXRpb092ZXJyaWRlICk7XHJcblxyXG4gICAgLy8gYWRqdXN0ZWQgcG9zaXRpb25zXHJcbiAgICBjb25zdCBhZGp1c3RlZFBvc2l0aW9uID0gdGhpcy5vcmllbnRhdGlvbi50aW1lcyggYWRqdXN0ZWRNYWduaXR1ZGUgKTtcclxuICAgIGNvbnN0IGFkanVzdGVkT3RoZXJQb3NpdGlvbiA9IG90aGVyLnBvc2l0aW9uUHJvcGVydHkudmFsdWUubWFnbml0dWRlID09PSAwID8gbmV3IFZlY3RvcjMoIDAsIDAsIDAgKSA6IG90aGVyLm9yaWVudGF0aW9uLnRpbWVzKCBhZGp1c3RlZE90aGVyTWFnbml0dWRlICk7XHJcblxyXG4gICAgLy8gZnJvbSBvdGhlciA9PiB0aGlzIChhZGp1c3RlZClcclxuICAgIGNvbnN0IGRlbHRhID0gYWRqdXN0ZWRQb3NpdGlvbi5taW51cyggYWRqdXN0ZWRPdGhlclBvc2l0aW9uICk7XHJcblxyXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICAgKiBjb3Vsb21iIHJlcHVsc2lvblxyXG4gICAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgICAvLyBtaW1pYyBDb3Vsb21iJ3MgTGF3XHJcbiAgICBjb25zdCBjb3Vsb21iVmVsb2NpdHlEZWx0YSA9IGRlbHRhLndpdGhNYWduaXR1ZGUoIHRpbWVFbGFwc2VkICogUGFpckdyb3VwLkVMRUNUUk9OX1BBSVJfUkVQVUxTSU9OX1NDQUxFIC8gKCBkZWx0YS5tYWduaXR1ZGUgKiBkZWx0YS5tYWduaXR1ZGUgKSApO1xyXG5cclxuICAgIC8vIGFwcGx5IGEgbm9ucGh5c2ljYWwgcmVkdWN0aW9uIG9uIGNvdWxvbWIncyBsYXcgd2hlbiB0aGUgZnJhbWUtcmF0ZSBpcyBsb3csIHNvIHdlIGNhbiBhdm9pZCBvc2NpbGxhdGlvblxyXG4gICAgY29uc3QgY291bG9tYkRvd25ncmFkZSA9IFBhaXJHcm91cC5nZXRUaW1lc2NhbGVJbXB1bHNlRmFjdG9yKCB0aW1lRWxhcHNlZCApO1xyXG4gICAgcmV0dXJuIGNvdWxvbWJWZWxvY2l0eURlbHRhLnRpbWVzKCBjb3Vsb21iRG93bmdyYWRlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBsaWVzIGEgcmVwdWxzaXZlIGZvcmNlIGZyb20gYW5vdGhlciBQYWlyR3JvdXAgdG8gdGhpcyBQYWlyR3JvdXAuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQYWlyR3JvdXB9IG90aGVyIC0gVGhlIHBhaXIgZ3JvdXAgd2hvc2UgZm9yY2Ugb24gdGhpcyBvYmplY3Qgd2Ugd2FudFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lRWxhcHNlZCAtIFRpbWUgZWxhcHNlZCAodGh1cyB3ZSByZXR1cm4gYW4gaW1wdWxzZSBpbnN0ZWFkIG9mIGEgZm9yY2UpXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRydWVMZW5ndGhzUmF0aW9PdmVycmlkZSAtIEZyb20gMCB0byAxLiBJZiAwLCBsb25lIHBhaXJzIHdpbGwgYmVoYXZlIHRoZSBzYW1lIGFzIGJvbmRzLiBJZiAxLCBsb25lIHBhaXJcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2Ugd2lsbCBiZSB0YWtlbiBpbnRvIGFjY291bnRcclxuICAgKi9cclxuICByZXB1bHNlRnJvbSggb3RoZXIsIHRpbWVFbGFwc2VkLCB0cnVlTGVuZ3Roc1JhdGlvT3ZlcnJpZGUgKSB7XHJcbiAgICB0aGlzLmFkZFZlbG9jaXR5KCB0aGlzLmdldFJlcHVsc2lvbkltcHVsc2UoIG90aGVyLCB0aW1lRWxhcHNlZCwgdHJ1ZUxlbmd0aHNSYXRpb092ZXJyaWRlICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBjaGFuZ2UgdG8gb3VyIHBvc2l0aW9uIGlmIHRoaXMgUGFpckdyb3VwIGNhbiBoYXZlIG5vbi11c2VyLWNvbnRyb2xsZWQgY2hhbmdlcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IHBvc2l0aW9uQ2hhbmdlXHJcbiAgICovXHJcbiAgYWRkUG9zaXRpb24oIHBvc2l0aW9uQ2hhbmdlICkge1xyXG4gICAgLy8gZG9uJ3QgYWxsb3cgdmVsb2NpdHkgY2hhbmdlcyBpZiB3ZSBhcmUgZHJhZ2dpbmcgaXQsIE9SIGlmIGl0IGlzIGFuIGF0b20gYXQgdGhlIG9yaWdpblxyXG4gICAgaWYgKCAhdGhpcy51c2VyQ29udHJvbGxlZFByb3BlcnR5LnZhbHVlICYmICF0aGlzLmlzQ2VudHJhbEF0b20gKSB7XHJcbiAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCBwb3NpdGlvbkNoYW5nZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIGNoYW5nZSB0byBvdXIgdmVsb2NpdHkgaWYgdGhpcyBQYWlyR3JvdXAgY2FuIGhhdmUgbm9uLXVzZXItY29udHJvbGxlZCBjaGFuZ2VzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gdmVsb2NpdHlDaGFuZ2VcclxuICAgKi9cclxuICBhZGRWZWxvY2l0eSggdmVsb2NpdHlDaGFuZ2UgKSB7XHJcbiAgICAvLyBkb24ndCBhbGxvdyB2ZWxvY2l0eSBjaGFuZ2VzIGlmIHdlIGFyZSBkcmFnZ2luZyBpdCwgT1IgaWYgaXQgaXMgYW4gYXRvbSBhdCB0aGUgb3JpZ2luXHJcbiAgICBpZiAoICF0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgJiYgIXRoaXMuaXNDZW50cmFsQXRvbSApIHtcclxuICAgICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5LnZhbHVlID0gdGhpcy52ZWxvY2l0eVByb3BlcnR5LnZhbHVlLnBsdXMoIHZlbG9jaXR5Q2hhbmdlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwcyB0aGlzIHBhaXIgZ3JvdXAgZm9yd2FyZCBpbiB0aW1lIChtb3ZpbmcgaW4gdGhlIGRpcmVjdGlvbiBvZiBpdHMgdmVsb2NpdHkpLCBhbmQgc2xvd2x5IGRhbXBzIHRoZSB2ZWxvY2l0eS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdGltZUVsYXBzZWRcclxuICAgKi9cclxuICBzdGVwRm9yd2FyZCggdGltZUVsYXBzZWQgKSB7XHJcbiAgICBpZiAoIHRoaXMudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSApIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgLy8gdmVsb2NpdHkgY2hhbmdlcyBzbyB0aGF0IGl0IGRvZXNuJ3QgcG9pbnQgYXQgYWxsIHRvd2FyZHMgb3IgYXdheSBmcm9tIHRoZSBvcmlnaW5cclxuICAgIGNvbnN0IHZlbG9jaXR5TWFnbml0dWRlT3V0d2FyZHMgPSB0aGlzLnZlbG9jaXR5UHJvcGVydHkudmFsdWUuZG90KCB0aGlzLm9yaWVudGF0aW9uICk7XHJcbiAgICBpZiAoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5tYWduaXR1ZGUgPiAwICkge1xyXG4gICAgICB0aGlzLnZlbG9jaXR5UHJvcGVydHkudmFsdWUgPSB0aGlzLnZlbG9jaXR5UHJvcGVydHkudmFsdWUubWludXMoIHRoaXMub3JpZW50YXRpb24udGltZXMoIHZlbG9jaXR5TWFnbml0dWRlT3V0d2FyZHMgKSApOyAvLyBzdWJ0cmFjdCB0aGUgb3V0d2FyZHMtY29tcG9uZW50IG91dFxyXG4gICAgfVxyXG5cclxuICAgIC8vIG1vdmUgcG9zaXRpb24gZm9yd2FyZCBieSBzY2FsZWQgdmVsb2NpdHlcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCB0aGlzLnZlbG9jaXR5UHJvcGVydHkudmFsdWUudGltZXMoIHRpbWVFbGFwc2VkICkgKTtcclxuXHJcbiAgICAvLyBhZGQgaW4gZGFtcGluZyBzbyB3ZSBkb24ndCBnZXQgdGhlIGtpbmQgb2Ygb3NjaWxsYXRpb24gdGhhdCB3ZSBhcmUgc2VlaW5nXHJcbiAgICBsZXQgZGFtcGluZyA9IDEgLSBQYWlyR3JvdXAuREFNUElOR19GQUNUT1I7XHJcbiAgICBkYW1waW5nID0gTWF0aC5wb3coIGRhbXBpbmcsIHRpbWVFbGFwc2VkIC8gMC4wMTcgKTsgLy8gYmFzZWQgc28gdGhhdCB3ZSBoYXZlIG5vIG1vZGlmaWNhdGlvbiBhdCAwLjAxN1xyXG4gICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5LnZhbHVlID0gdGhpcy52ZWxvY2l0eVByb3BlcnR5LnZhbHVlLnRpbWVzKCBkYW1waW5nICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBhbmQgemVyb3MgdGhlIHZlbG9jaXR5LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gdmVjdG9yXHJcbiAgICovXHJcbiAgZHJhZ1RvUG9zaXRpb24oIHZlY3RvciApIHtcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHZlY3RvcjtcclxuXHJcbiAgICAvLyBzdG9wIGFueSB2ZWxvY2l0eSB0aGF0IHdhcyBtb3ZpbmcgdGhlIHBhaXJcclxuICAgIHRoaXMudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSA9IG5ldyBWZWN0b3IzKCAwLCAwLCAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BhaXJHcm91cH0gY2VudHJhbEF0b21cclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxyXG4gICAqL1xyXG4gIHRvU3RhdGVPYmplY3QoIGNlbnRyYWxBdG9tICkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcG9zaXRpb246IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS50b1N0YXRlT2JqZWN0KCksXHJcbiAgICAgIHZlbG9jaXR5OiB0aGlzLnZlbG9jaXR5UHJvcGVydHkudmFsdWUudG9TdGF0ZU9iamVjdCgpLFxyXG4gICAgICBpc0xvbmVQYWlyOiB0aGlzLmlzTG9uZVBhaXIsXHJcbiAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCA9PT0gbnVsbCA/IG51bGwgOiB0aGlzLmVsZW1lbnQuc3ltYm9sLFxyXG4gICAgICBpc0NlbnRyYWxBdG9tOiB0aGlzID09PSBjZW50cmFsQXRvbVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcclxuICAgKiBAcmV0dXJucyB7UGFpckdyb3VwfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBmcm9tU3RhdGVPYmplY3QoIG9iaiApIHtcclxuICAgIGNvbnN0IHBvc2l0aW9uID0gVmVjdG9yMy5mcm9tU3RhdGVPYmplY3QoIG9iai5wb3NpdGlvbiApO1xyXG4gICAgY29uc3QgdmVsb2NpdHkgPSBWZWN0b3IzLmZyb21TdGF0ZU9iamVjdCggb2JqLnZlbG9jaXR5ICk7XHJcbiAgICBjb25zdCBpc0xvbmVQYWlyID0gb2JqLmlzTG9uZVBhaXI7XHJcbiAgICBjb25zdCBlbGVtZW50ID0gb2JqLmVsZW1lbnQgPT09IG51bGwgPyBudWxsIDogRWxlbWVudC5nZXRFbGVtZW50QnlTeW1ib2woIG9iai5lbGVtZW50ICk7XHJcblxyXG4gICAgY29uc3QgcGFpckdyb3VwID0gbmV3IFBhaXJHcm91cCggcG9zaXRpb24sIGlzTG9uZVBhaXIsIHtcclxuICAgICAgZWxlbWVudDogZWxlbWVudFxyXG4gICAgfSApO1xyXG4gICAgcGFpckdyb3VwLmlzQ2VudHJhbEF0b20gPSBvYmouaXNDZW50cmFsQXRvbTtcclxuICAgIHBhaXJHcm91cC52ZWxvY2l0eVByb3BlcnR5LnZhbHVlID0gdmVsb2NpdHk7XHJcbiAgICByZXR1cm4gcGFpckdyb3VwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG11bHRpcGxpY2F0aXZlIGZhY3RvciBiYXNlZCBvbiB0aGUgdGltZSBlbGFwc2VkLCBzbyB0aGF0IHdlIGNhbiBhdm9pZCBvc2NpbGxhdGlvbiB3aGVuIHRoZSBmcmFtZS1yYXRlIGlzXHJcbiAgICogbG93LCBkdWUgdG8gaG93IHRoZSBkYW1waW5nIGlzIGltcGxlbWVudGVkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lRWxhcHNlZFxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldFRpbWVzY2FsZUltcHVsc2VGYWN0b3IoIHRpbWVFbGFwc2VkICkge1xyXG4gICAgcmV0dXJuIE1hdGguc3FydCggKCB0aW1lRWxhcHNlZCA+IDAuMDE3ICkgPyAwLjAxNyAvIHRpbWVFbGFwc2VkIDogMSApO1xyXG4gIH1cclxufVxyXG5cclxubW9sZWN1bGVTaGFwZXMucmVnaXN0ZXIoICdQYWlyR3JvdXAnLCBQYWlyR3JvdXAgKTtcclxuXHJcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gKiBjb25zdGFudHNcclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbi8vIEBwdWJsaWMge251bWJlcn0gLSBJZGVhbCBkaXN0YW5jZSBmcm9tIGF0b20gdG8gYXRvbSAobW9kZWwgc2NyZWVuKS5cclxuUGFpckdyb3VwLkJPTkRFRF9QQUlSX0RJU1RBTkNFID0gMTAuMDtcclxuXHJcbi8vIEBwdWJsaWMge251bWJlcn0gLSBJZGVhbCBkaXN0YW5jZSBmcm9tIGF0b20gdG8gbG9uZSBwYWlyIChib3RoIHNjcmVlbnMpLlxyXG5QYWlyR3JvdXAuTE9ORV9QQUlSX0RJU1RBTkNFID0gNy4wO1xyXG5cclxuLy8gQHB1YmxpYyB7bnVtYmVyfSAtIENvbnRyb2wgb24gQ291bG9tYiBlZmZlY3QuIFR1bmVkIGZvciBzdGFiaWxpdHkgYW5kIGFlc3RoZXRpYy5cclxuUGFpckdyb3VwLkVMRUNUUk9OX1BBSVJfUkVQVUxTSU9OX1NDQUxFID0gMzAwMDA7XHJcblxyXG4vLyBAcHVibGljIHtudW1iZXJ9IC0gVHVuZWQgY29udHJvbCBvZiBmYWtlIGZvcmNlIHRvIHB1c2ggYW5nbGVzIGJldHdlZW4gcGFpciBncm91cHMgdG8gdGhlaXIgaWRlYWwuXHJcblBhaXJHcm91cC5BTkdMRV9SRVBVTFNJT05fU0NBTEUgPSAzO1xyXG5cclxuLy8gQHB1YmxpYyB7bnVtYmVyfSAtIFR1bmVkIGNvbnRyb2wgZm9yIGZvcmNlIHRvIGppdHRlciBwb3NpdGlvbnMgb2YgYXRvbXMgKHBsYW5hciBjYXNlcyBvdGhlcndpc2Ugc3RhYmxlKVxyXG5QYWlyR3JvdXAuSklUVEVSX1NDQUxFID0gMC4wMDE7XHJcblxyXG4vLyBAcHVibGljIHtudW1iZXJ9IC0gVHVuZWQgY29udHJvbCB0byByZWR1Y2UgdmVsb2NpdHksIGluIG9yZGVyIHRvIGVuc3VyZSBzdGFiaWxpdHkuXHJcblBhaXJHcm91cC5EQU1QSU5HX0ZBQ1RPUiA9IDAuMTtcclxuXHJcbmZ1bmN0aW9uIGludGVycG9sYXRlKCBhLCBiLCByYXRpbyApIHtcclxuICByZXR1cm4gYSAqICggMSAtIHJhdGlvICkgKyBiICogcmF0aW87XHJcbn1cclxuXHJcbi8vIEBwdWJsaWMge0lPVHlwZX1cclxuUGFpckdyb3VwLlBhaXJHcm91cElPID0gbmV3IElPVHlwZSggJ1BhaXJHcm91cElPJywge1xyXG4gIHZhbHVlVHlwZTogUGFpckdyb3VwLFxyXG4gIHN0YXRlU2NoZW1hOiB7XHJcbiAgICBwb3NpdGlvbjogVmVjdG9yMy5WZWN0b3IzSU8sXHJcbiAgICB2ZWxvY2l0eTogVmVjdG9yMy5WZWN0b3IzSU8sXHJcbiAgICBpc0xvbmVQYWlyOiBCb29sZWFuSU8sXHJcbiAgICBlbGVtZW50OiBOdWxsYWJsZUlPKCBTdHJpbmdJTyApLFxyXG4gICAgaXNDZW50cmFsQXRvbTogQm9vbGVhbklPXHJcbiAgfVxyXG59ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQYWlyR3JvdXA7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