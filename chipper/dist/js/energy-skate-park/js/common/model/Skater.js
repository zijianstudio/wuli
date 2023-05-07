// Copyright 2013-2022, University of Colorado Boulder

/**
 * Model for the skater in Energy Skate Park, including position, velocity, energy, etc..
 * All units are in meters.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';
import SkaterMasses from '../SkaterMasses.js';
import Track from './Track.js';
class Skater {
  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(tandem, options) {
    options = merge({
      // {number} - initial mass for the Skater, in kg
      defaultMass: SkaterMasses.SKATER_1_MASS,
      // {Range} - range for the Skater mass, in kg
      massRange: SkaterMasses.MASS_RANGE,
      // {Range} - Range for the reference height, in meters
      referenceHeightRange: EnergySkateParkConstants.REFERENCE_HEIGHT_RANGE
    }, options);
    assert && assert(options.referenceHeightRange.min === 0, 'reference height range needs to start from ground');

    // @private {Range}
    this.massRange = options.massRange;

    // @public - The track the skater is on, or null if free-falling
    this.trackProperty = new Property(null, {
      tandem: tandem.createTandem('trackProperty'),
      phetioValueType: NullableIO(ReferenceIO(Track.TrackIO))
    });

    // @public {number} - Parameter along the parametric spline, unitless since it is in parametric space
    this.parametricPositionProperty = new Property(0, {
      tandem: tandem.createTandem('parametricPositionProperty'),
      phetioValueType: NullableIO(NumberIO)
    });

    // @public {number} - Speed along the parametric spline dimension, formally 'u dot', indicating speed and direction
    // (+/-) along the track spline in meters per second.  Not technically the derivative of 'u' since it is the
    // euclidean speed.
    this.parametricSpeedProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('parametricSpeedProperty'),
      phetioReadOnly: true
    });

    // @public - True if the skater is pointing up on the track, false if attached to underside of track
    this.onTopSideOfTrackProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('onTopSideOfTrackProperty')
    });

    // @public {number} - Gravity magnitude, without direction, which is easier to set with controls (like sliders) because
    // conceptual minimum value is less than maximum value.
    this.gravityMagnitudeProperty = new NumberProperty(9.8, {
      tandem: tandem.createTandem('gravityMagnitudeProperty'),
      units: 'm/s/s',
      range: new Range(Math.abs(EnergySkateParkConstants.MIN_GRAVITY), Math.abs(EnergySkateParkConstants.MAX_GRAVITY))
    });

    // @public {number} - Gravity magnitude and sign
    this.gravityProperty = new DerivedProperty([this.gravityMagnitudeProperty], gravity => {
      const gravityWithSign = -gravity;
      assert && assert(gravityWithSign <= 0, 'this sim only supports negative or 0 gravity');
      return gravityWithSign;
    }, {
      units: 'm/s/s',
      range: new Range(EnergySkateParkConstants.MAX_GRAVITY, EnergySkateParkConstants.MIN_GRAVITY) // MAX_GRAVITY < MIN_GRAVITY due to sign
    });

    // @public {number} - reference height for potential energy, 0 is at the ground
    this.referenceHeightProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('referenceHeightProperty'),
      units: 'm',
      range: options.referenceHeightRange
    });

    // @public {Vector2} - the position of the skater
    this.positionProperty = new Vector2Property(new Vector2(3.5, 0), {
      tandem: tandem.createTandem('positionProperty')
    });

    // @private {number} - Start in the middle of the mass PhysicalControl range
    this.massProperty = new NumberProperty(options.defaultMass, {
      range: options.massRange,
      tandem: tandem.createTandem('massProperty'),
      units: 'kg'
    });

    // @public {string} - Which way the skater is facing, right or left.  Coded as strings instead of boolean in case
    // we add other states later like 'forward'
    this.directionProperty = new EnumerationDeprecatedProperty(Skater.Direction, Skater.Direction.LEFT, {
      tandem: tandem.createTandem('directionProperty')
    });

    // @public {Vector2}
    this.velocityProperty = new Vector2Property(new Vector2(0, 0), {
      tandem: tandem.createTandem('velocityProperty')
    });

    // @public {boolean} - True if the user is dragging the skater with a pointer
    this.draggingProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('draggingProperty')
    });

    // @public {number} - Energies are in Joules
    this.kineticEnergyProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('kineticEnergyProperty'),
      units: 'J',
      J: true
    });

    // @public {number}
    this.potentialEnergyProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('potentialEnergyProperty'),
      units: 'J',
      phetioReadOnly: true
    });

    // @public {number}
    this.thermalEnergyProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('thermalEnergyProperty'),
      units: 'J',
      phetioReadOnly: true
    });

    // @public {number}
    this.totalEnergyProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('totalEnergyProperty'),
      units: 'J',
      phetioReadOnly: true
    });

    // @public {number} - The skater's angle (about the pivot point at the bottom center), in radians
    this.angleProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('angleProperty'),
      units: 'radians',
      phetioReadOnly: true
    });

    // @public {Vector2} - Returns to this point when pressing "return skater"
    this.startingPositionProperty = new Vector2Property(new Vector2(3.5, 0), {
      tandem: tandem.createTandem('startingPositionProperty')
    });

    // @public {number} - Returns to this parametric position along the track when pressing "return skater"
    this.startingUProperty = new Property(0, {
      tandem: tandem.createTandem('startingUProperty'),
      phetioValueType: NullableIO(NumberIO)
    });

    // @private {boolean} - Tracks whether or not the skater is above or below the track when it is released
    this.startingUpProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('startingUpProperty')
    });

    // @public {Property.<Track|null>} - Returns to this track when pressing "return skater"
    this.startingTrackProperty = new Property(null, {
      valueType: [null, Track]
    });

    // @public {Vector2} - Position of the skater's head, for positioning the pie chart.
    this.headPositionProperty = new Vector2Property(this.getHeadPosition(), {
      tandem: tandem.createTandem('headPositionProperty'),
      phetioReadOnly: true
    });

    // @public
    this.updatedEmitter = new Emitter();
    this.energyChangedEmitter = new Emitter();

    // @public - emits an event when the skater is returned to a previous position
    this.returnedEmitter = new Emitter();

    // @public {number}
    this.speedProperty = new DerivedProperty([this.velocityProperty], velocity => velocity.magnitude, {
      tandem: tandem.createTandem('speedProperty'),
      units: 'm/s',
      phetioValueType: NumberIO
    });

    // Derived - Zero the kinetic energy when draggingDerived, see #22
    this.draggingProperty.link(dragging => {
      if (dragging) {
        this.velocityProperty.value = new Vector2(0, 0);
      }
    });
    this.parametricSpeedProperty.link(parametricSpeed => {
      // Require the skater to overcome a speed threshold so he won't toggle back and forth rapidly at the bottom of a
      // well with friction, see #51
      const speedThreshold = 0.01;
      if (parametricSpeed > speedThreshold) {
        this.directionProperty.value = this.onTopSideOfTrackProperty.value ? Skater.Direction.RIGHT : Skater.Direction.LEFT;
      } else if (parametricSpeed < -speedThreshold) {
        this.directionProperty.value = this.onTopSideOfTrackProperty.value ? Skater.Direction.LEFT : Skater.Direction.RIGHT;
      } else {
        // Keep the same direction
      }
    });

    // @public - Boolean flag that indicates whether the skater has moved from his initial position, and hence can be 'returned',
    // For making the 'return skater' button enabled/disabled
    // If this is a performance concern, perhaps it could just be dropped as a feature
    this.movedProperty = new DerivedProperty([this.positionProperty, this.startingPositionProperty, this.draggingProperty], (x, x0, dragging) => {
      return !dragging && (x.x !== x0.x || x.y !== x0.y);
    }, {
      tandem: tandem.createTandem('movedProperty'),
      phetioValueType: BooleanIO
    });

    // update energies whenever mass, gravity, or height changes so that energy distribution updates while the sim is paused
    Multilink.multilink([this.massProperty, this.referenceHeightProperty, this.gravityProperty], (mass, referenceHeight, gravity) => {
      this.updateEnergy();
    });
    this.updateEnergy();
    this.updatedEmitter.addListener(() => {
      this.updateHeadPosition();
    });

    // @public - Enable the "Clear Thermal" buttons but only if the thermal energy exceeds a tiny threshold, so there
    // aren't visual "false positives", see #306
    this.allowClearingThermalEnergyProperty = new DerivedProperty([this.thermalEnergyProperty], thermalEnergy => {
      return thermalEnergy > 1E-2;
    }, {
      tandem: tandem.createTandem('allowClearingThermalEnergyProperty'),
      phetioValueType: BooleanIO
    });

    // In the state wrapper, when the state changes, we must update the skater node
    Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.phetioStateEngine.stateSetEmitter.addListener(() => {
      this.updatedEmitter.emit();
    });
  }

  // Get the vector from feet to head, so that when tracks are joined we can make sure he is still pointing up
  // @public
  get upVector() {
    return this.headPositionProperty.value.minus(this.positionProperty.value);
  }

  /**
   * Zero the thermal energy, and update energy distribution accordingly.
   * @public
   */
  clearThermal() {
    this.thermalEnergyProperty.value = 0.0;
    this.updateEnergy();
  }

  /**
   * Fully reset this skater.
   * @public
   */
  reset() {
    this.resetEverythingExceptGravityMassAndReferenceHeight();
    this.referenceHeightProperty.reset();
    this.massProperty.reset();
    this.gravityMagnitudeProperty.reset();
    this.updateEnergy();

    // Notify the graphics to re-render.  See #223
    this.updatedEmitter.emit();
  }

  /**
   * Move the skater to her initial position, but leave the reference height, friction, and mass, and
   * gravity the same, see #237 and #188
   * @public
   */
  resetPosition() {
    this.resetEverythingExceptGravityMassAndReferenceHeight();

    // Notify the graphics to re-render.  See #223
    this.updateEnergy();
    this.updatedEmitter.emit();
  }

  /**
   * Reset all Properties of the Skater except for reference height and mass. Useful when resetting skater position
   * only, but reused in a few places when resetting Skater (to be surrounded by resetting mass or reference height).
   * After calling this, be sure to signify updates with this.updateEnergy() and this.updatedEmitter.emit().
   * @private
   */
  resetEverythingExceptGravityMassAndReferenceHeight() {
    // set the angle to zero first so that the optimization for SkaterNode.updatePosition is maintained, without
    // showing the skater at the wrong angle
    this.angleProperty.value = 0;
    this.trackProperty.reset();
    this.parametricPositionProperty.reset();
    this.parametricSpeedProperty.reset();
    this.onTopSideOfTrackProperty.reset();
    this.positionProperty.reset();
    this.directionProperty.reset();
    this.velocityProperty.reset();
    this.draggingProperty.reset();
    this.kineticEnergyProperty.reset();
    this.potentialEnergyProperty.reset();
    this.thermalEnergyProperty.reset();
    this.totalEnergyProperty.reset();
    this.angleProperty.reset();
    this.startingPositionProperty.reset();
    this.startingUProperty.reset();
    this.startingUpProperty.reset();
    this.startingTrackProperty.reset();
    this.headPositionProperty.reset();
  }

  /**
   * Return the skater to the last position it was released by the user (or its starting position), including the
   * position on a track (if any).
   * @public
   */
  returnSkater() {
    // If the user is on the same track as where he began (and the track hasn't changed), remain on the track,
    // see #143 and #144
    if (this.startingTrackProperty.value && this.trackProperty.value === this.startingTrackProperty.value && _.isEqual(this.trackProperty.value.copyControlPointSources(), this.startingTrackControlPointSources)) {
      this.parametricPositionProperty.value = this.startingUProperty.value;
      this.angleProperty.value = this.startingAngle;
      this.onTopSideOfTrackProperty.value = this.startingUpProperty.value;
      this.parametricSpeedProperty.value = 0;
    } else {
      this.trackProperty.value = null;
      this.angleProperty.value = this.startingAngle;
    }
    this.positionProperty.set(this.startingPositionProperty.value.copy());
    this.velocityProperty.value = new Vector2(0, 0);
    this.clearThermal();
    this.updateEnergy();
    this.updatedEmitter.emit();
    this.returnedEmitter.emit();
  }

  /**
   * Update the energies as a batch. This is an explicit method instead of linked to all dependencies so that it can
   * be called in a controlled fashion when multiple dependencies have changed, for performance.
   * @public
   */
  updateEnergy() {
    this.kineticEnergyProperty.value = 0.5 * this.massProperty.value * this.velocityProperty.value.magnitudeSquared;
    this.potentialEnergyProperty.value = -this.massProperty.value * (this.positionProperty.value.y - this.referenceHeightProperty.value) * this.gravityProperty.value;
    this.totalEnergyProperty.value = this.kineticEnergyProperty.value + this.potentialEnergyProperty.value + this.thermalEnergyProperty.value;

    // Signal that energies have changed for coarse-grained listeners like PieChartNode that should not get updated
    // 3-4 times per times step
    this.energyChangedEmitter.emit();
  }

  /**
   * Get the position of the skater head from the "point" mass, taking into account the size of the skater
   * from its mass value.
   * @public
   *
   * @returns {Vector2}
   */
  getHeadPosition() {
    // Center pie chart over skater's head not his feet so it doesn't look awkward when skating in a parabola
    // Note this has been tuned independently of SkaterNode.massToScale, which also accounts for the image dimensions
    const skaterHeight = Utils.linear(this.massRange.min, this.massRange.max, 1.65, 2.4, this.massProperty.value);
    const vectorX = skaterHeight * Math.cos(this.angleProperty.value - Math.PI / 2);
    const vectorY = skaterHeight * Math.sin(this.angleProperty.value - Math.PI / 2);
    return new Vector2(this.positionProperty.value.x + vectorX, this.positionProperty.value.y - vectorY);
  }

  /**
   * Update the head position for showing the pie chart. Doesn't depend on "up" because it already depends on the
   * angle of the skater. Would be better if headPosition were a derived property, but created too many allocations,
   * see #50
   *
   * @private
   */
  updateHeadPosition() {
    const headPosition = this.getHeadPosition();

    // Manually trigger notifications to avoid allocations, see #50
    this.headPositionProperty.value.x = headPosition.x;
    this.headPositionProperty.value.y = headPosition.y;
    this.headPositionProperty.notifyListenersStatic();
  }

  /**
   * If the skater is released, store the initial conditions for when the skater is returned.
   * @private
   *
   * @param {Track} targetTrack - The track to start on (if any)
   * @param {number} targetU - The parametric position along the track to start on (if any)
   */
  released(targetTrack, targetU) {
    this.draggingProperty.value = false;
    this.velocityProperty.value = new Vector2(0, 0);
    this.parametricSpeedProperty.value = 0;
    this.trackProperty.value = targetTrack;
    this.parametricPositionProperty.value = targetU;
    if (targetTrack) {
      this.positionProperty.value = targetTrack.getPoint(this.parametricPositionProperty.value);
    }
    this.startingPositionProperty.value = this.positionProperty.value.copy();
    this.startingUProperty.value = targetU;
    this.startingUpProperty.value = this.onTopSideOfTrackProperty.value;
    this.startingTrackProperty.value = targetTrack;

    // Record the starting track control points to make sure the track hasn't changed during return this.
    this.startingTrackControlPointSources = targetTrack ? targetTrack.copyControlPointSources() : [];
    this.startingAngle = this.angleProperty.value;

    // Update the energy on skater release so it won't try to move to a different height to make up for the delta
    this.updateEnergy();
    this.updatedEmitter.emit();
  }
}

// @public {EnumerationDeprecated}
// @static
Skater.Direction = EnumerationDeprecated.byKeys(['LEFT', 'RIGHT']);
energySkatePark.register('Skater', Skater);
export default Skater;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiUmFuZ2UiLCJVdGlscyIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJtZXJnZSIsIlRhbmRlbSIsIkJvb2xlYW5JTyIsIk51bGxhYmxlSU8iLCJOdW1iZXJJTyIsIlJlZmVyZW5jZUlPIiwiZW5lcmd5U2thdGVQYXJrIiwiRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzIiwiU2thdGVyTWFzc2VzIiwiVHJhY2siLCJTa2F0ZXIiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsIm9wdGlvbnMiLCJkZWZhdWx0TWFzcyIsIlNLQVRFUl8xX01BU1MiLCJtYXNzUmFuZ2UiLCJNQVNTX1JBTkdFIiwicmVmZXJlbmNlSGVpZ2h0UmFuZ2UiLCJSRUZFUkVOQ0VfSEVJR0hUX1JBTkdFIiwiYXNzZXJ0IiwibWluIiwidHJhY2tQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1ZhbHVlVHlwZSIsIlRyYWNrSU8iLCJwYXJhbWV0cmljUG9zaXRpb25Qcm9wZXJ0eSIsInBhcmFtZXRyaWNTcGVlZFByb3BlcnR5IiwicGhldGlvUmVhZE9ubHkiLCJvblRvcFNpZGVPZlRyYWNrUHJvcGVydHkiLCJncmF2aXR5TWFnbml0dWRlUHJvcGVydHkiLCJ1bml0cyIsInJhbmdlIiwiTWF0aCIsImFicyIsIk1JTl9HUkFWSVRZIiwiTUFYX0dSQVZJVFkiLCJncmF2aXR5UHJvcGVydHkiLCJncmF2aXR5IiwiZ3Jhdml0eVdpdGhTaWduIiwicmVmZXJlbmNlSGVpZ2h0UHJvcGVydHkiLCJwb3NpdGlvblByb3BlcnR5IiwibWFzc1Byb3BlcnR5IiwiZGlyZWN0aW9uUHJvcGVydHkiLCJEaXJlY3Rpb24iLCJMRUZUIiwidmVsb2NpdHlQcm9wZXJ0eSIsImRyYWdnaW5nUHJvcGVydHkiLCJraW5ldGljRW5lcmd5UHJvcGVydHkiLCJKIiwicG90ZW50aWFsRW5lcmd5UHJvcGVydHkiLCJ0aGVybWFsRW5lcmd5UHJvcGVydHkiLCJ0b3RhbEVuZXJneVByb3BlcnR5IiwiYW5nbGVQcm9wZXJ0eSIsInN0YXJ0aW5nUG9zaXRpb25Qcm9wZXJ0eSIsInN0YXJ0aW5nVVByb3BlcnR5Iiwic3RhcnRpbmdVcFByb3BlcnR5Iiwic3RhcnRpbmdUcmFja1Byb3BlcnR5IiwidmFsdWVUeXBlIiwiaGVhZFBvc2l0aW9uUHJvcGVydHkiLCJnZXRIZWFkUG9zaXRpb24iLCJ1cGRhdGVkRW1pdHRlciIsImVuZXJneUNoYW5nZWRFbWl0dGVyIiwicmV0dXJuZWRFbWl0dGVyIiwic3BlZWRQcm9wZXJ0eSIsInZlbG9jaXR5IiwibWFnbml0dWRlIiwibGluayIsImRyYWdnaW5nIiwidmFsdWUiLCJwYXJhbWV0cmljU3BlZWQiLCJzcGVlZFRocmVzaG9sZCIsIlJJR0hUIiwibW92ZWRQcm9wZXJ0eSIsIngiLCJ4MCIsInkiLCJtdWx0aWxpbmsiLCJtYXNzIiwicmVmZXJlbmNlSGVpZ2h0IiwidXBkYXRlRW5lcmd5IiwiYWRkTGlzdGVuZXIiLCJ1cGRhdGVIZWFkUG9zaXRpb24iLCJhbGxvd0NsZWFyaW5nVGhlcm1hbEVuZXJneVByb3BlcnR5IiwidGhlcm1hbEVuZXJneSIsIlBIRVRfSU9fRU5BQkxFRCIsInBoZXQiLCJwaGV0aW8iLCJwaGV0aW9FbmdpbmUiLCJwaGV0aW9TdGF0ZUVuZ2luZSIsInN0YXRlU2V0RW1pdHRlciIsImVtaXQiLCJ1cFZlY3RvciIsIm1pbnVzIiwiY2xlYXJUaGVybWFsIiwicmVzZXQiLCJyZXNldEV2ZXJ5dGhpbmdFeGNlcHRHcmF2aXR5TWFzc0FuZFJlZmVyZW5jZUhlaWdodCIsInJlc2V0UG9zaXRpb24iLCJyZXR1cm5Ta2F0ZXIiLCJfIiwiaXNFcXVhbCIsImNvcHlDb250cm9sUG9pbnRTb3VyY2VzIiwic3RhcnRpbmdUcmFja0NvbnRyb2xQb2ludFNvdXJjZXMiLCJzdGFydGluZ0FuZ2xlIiwic2V0IiwiY29weSIsIm1hZ25pdHVkZVNxdWFyZWQiLCJza2F0ZXJIZWlnaHQiLCJsaW5lYXIiLCJtYXgiLCJ2ZWN0b3JYIiwiY29zIiwiUEkiLCJ2ZWN0b3JZIiwic2luIiwiaGVhZFBvc2l0aW9uIiwibm90aWZ5TGlzdGVuZXJzU3RhdGljIiwicmVsZWFzZWQiLCJ0YXJnZXRUcmFjayIsInRhcmdldFUiLCJnZXRQb2ludCIsImJ5S2V5cyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2thdGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGZvciB0aGUgc2thdGVyIGluIEVuZXJneSBTa2F0ZSBQYXJrLCBpbmNsdWRpbmcgcG9zaXRpb24sIHZlbG9jaXR5LCBlbmVyZ3ksIGV0Yy4uXHJcbiAqIEFsbCB1bml0cyBhcmUgaW4gbWV0ZXJzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25EZXByZWNhdGVkLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBCb29sZWFuSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0Jvb2xlYW5JTy5qcyc7XHJcbmltcG9ydCBOdWxsYWJsZUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdWxsYWJsZUlPLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBSZWZlcmVuY2VJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvUmVmZXJlbmNlSU8uanMnO1xyXG5pbXBvcnQgZW5lcmd5U2thdGVQYXJrIGZyb20gJy4uLy4uL2VuZXJneVNrYXRlUGFyay5qcyc7XHJcbmltcG9ydCBFbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMgZnJvbSAnLi4vRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFNrYXRlck1hc3NlcyBmcm9tICcuLi9Ta2F0ZXJNYXNzZXMuanMnO1xyXG5pbXBvcnQgVHJhY2sgZnJvbSAnLi9UcmFjay5qcyc7XHJcblxyXG5jbGFzcyBTa2F0ZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gaW5pdGlhbCBtYXNzIGZvciB0aGUgU2thdGVyLCBpbiBrZ1xyXG4gICAgICBkZWZhdWx0TWFzczogU2thdGVyTWFzc2VzLlNLQVRFUl8xX01BU1MsXHJcblxyXG4gICAgICAvLyB7UmFuZ2V9IC0gcmFuZ2UgZm9yIHRoZSBTa2F0ZXIgbWFzcywgaW4ga2dcclxuICAgICAgbWFzc1JhbmdlOiBTa2F0ZXJNYXNzZXMuTUFTU19SQU5HRSxcclxuXHJcbiAgICAgIC8vIHtSYW5nZX0gLSBSYW5nZSBmb3IgdGhlIHJlZmVyZW5jZSBoZWlnaHQsIGluIG1ldGVyc1xyXG4gICAgICByZWZlcmVuY2VIZWlnaHRSYW5nZTogRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzLlJFRkVSRU5DRV9IRUlHSFRfUkFOR0VcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnJlZmVyZW5jZUhlaWdodFJhbmdlLm1pbiA9PT0gMCwgJ3JlZmVyZW5jZSBoZWlnaHQgcmFuZ2UgbmVlZHMgdG8gc3RhcnQgZnJvbSBncm91bmQnICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1JhbmdlfVxyXG4gICAgdGhpcy5tYXNzUmFuZ2UgPSBvcHRpb25zLm1hc3NSYW5nZTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gVGhlIHRyYWNrIHRoZSBza2F0ZXIgaXMgb24sIG9yIG51bGwgaWYgZnJlZS1mYWxsaW5nXHJcbiAgICB0aGlzLnRyYWNrUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndHJhY2tQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdWxsYWJsZUlPKCBSZWZlcmVuY2VJTyggVHJhY2suVHJhY2tJTyApIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gUGFyYW1ldGVyIGFsb25nIHRoZSBwYXJhbWV0cmljIHNwbGluZSwgdW5pdGxlc3Mgc2luY2UgaXQgaXMgaW4gcGFyYW1ldHJpYyBzcGFjZVxyXG4gICAgdGhpcy5wYXJhbWV0cmljUG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwYXJhbWV0cmljUG9zaXRpb25Qcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdWxsYWJsZUlPKCBOdW1iZXJJTyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIFNwZWVkIGFsb25nIHRoZSBwYXJhbWV0cmljIHNwbGluZSBkaW1lbnNpb24sIGZvcm1hbGx5ICd1IGRvdCcsIGluZGljYXRpbmcgc3BlZWQgYW5kIGRpcmVjdGlvblxyXG4gICAgLy8gKCsvLSkgYWxvbmcgdGhlIHRyYWNrIHNwbGluZSBpbiBtZXRlcnMgcGVyIHNlY29uZC4gIE5vdCB0ZWNobmljYWxseSB0aGUgZGVyaXZhdGl2ZSBvZiAndScgc2luY2UgaXQgaXMgdGhlXHJcbiAgICAvLyBldWNsaWRlYW4gc3BlZWQuXHJcbiAgICB0aGlzLnBhcmFtZXRyaWNTcGVlZFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BhcmFtZXRyaWNTcGVlZFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBUcnVlIGlmIHRoZSBza2F0ZXIgaXMgcG9pbnRpbmcgdXAgb24gdGhlIHRyYWNrLCBmYWxzZSBpZiBhdHRhY2hlZCB0byB1bmRlcnNpZGUgb2YgdHJhY2tcclxuICAgIHRoaXMub25Ub3BTaWRlT2ZUcmFja1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdvblRvcFNpZGVPZlRyYWNrUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gR3Jhdml0eSBtYWduaXR1ZGUsIHdpdGhvdXQgZGlyZWN0aW9uLCB3aGljaCBpcyBlYXNpZXIgdG8gc2V0IHdpdGggY29udHJvbHMgKGxpa2Ugc2xpZGVycykgYmVjYXVzZVxyXG4gICAgLy8gY29uY2VwdHVhbCBtaW5pbXVtIHZhbHVlIGlzIGxlc3MgdGhhbiBtYXhpbXVtIHZhbHVlLlxyXG4gICAgdGhpcy5ncmF2aXR5TWFnbml0dWRlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDkuOCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmF2aXR5TWFnbml0dWRlUHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnbS9zL3MnLFxyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCBNYXRoLmFicyggRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzLk1JTl9HUkFWSVRZICksIE1hdGguYWJzKCBFbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMuTUFYX0dSQVZJVFkgKSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIEdyYXZpdHkgbWFnbml0dWRlIGFuZCBzaWduXHJcbiAgICB0aGlzLmdyYXZpdHlQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5ncmF2aXR5TWFnbml0dWRlUHJvcGVydHkgXSwgZ3Jhdml0eSA9PiB7XHJcbiAgICAgIGNvbnN0IGdyYXZpdHlXaXRoU2lnbiA9IC1ncmF2aXR5O1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBncmF2aXR5V2l0aFNpZ24gPD0gMCwgJ3RoaXMgc2ltIG9ubHkgc3VwcG9ydHMgbmVnYXRpdmUgb3IgMCBncmF2aXR5JyApO1xyXG4gICAgICByZXR1cm4gZ3Jhdml0eVdpdGhTaWduO1xyXG4gICAgfSwge1xyXG4gICAgICB1bml0czogJ20vcy9zJyxcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzLk1BWF9HUkFWSVRZLCBFbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMuTUlOX0dSQVZJVFkgKSAvLyBNQVhfR1JBVklUWSA8IE1JTl9HUkFWSVRZIGR1ZSB0byBzaWduXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIHJlZmVyZW5jZSBoZWlnaHQgZm9yIHBvdGVudGlhbCBlbmVyZ3ksIDAgaXMgYXQgdGhlIGdyb3VuZFxyXG4gICAgdGhpcy5yZWZlcmVuY2VIZWlnaHRQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZWZlcmVuY2VIZWlnaHRQcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICdtJyxcclxuICAgICAgcmFuZ2U6IG9wdGlvbnMucmVmZXJlbmNlSGVpZ2h0UmFuZ2VcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtWZWN0b3IyfSAtIHRoZSBwb3NpdGlvbiBvZiB0aGUgc2thdGVyXHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggMy41LCAwICksIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncG9zaXRpb25Qcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gU3RhcnQgaW4gdGhlIG1pZGRsZSBvZiB0aGUgbWFzcyBQaHlzaWNhbENvbnRyb2wgcmFuZ2VcclxuICAgIHRoaXMubWFzc1Byb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBvcHRpb25zLmRlZmF1bHRNYXNzLCB7XHJcbiAgICAgIHJhbmdlOiBvcHRpb25zLm1hc3NSYW5nZSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWFzc1Byb3BlcnR5JyApLFxyXG4gICAgICB1bml0czogJ2tnJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ30gLSBXaGljaCB3YXkgdGhlIHNrYXRlciBpcyBmYWNpbmcsIHJpZ2h0IG9yIGxlZnQuICBDb2RlZCBhcyBzdHJpbmdzIGluc3RlYWQgb2YgYm9vbGVhbiBpbiBjYXNlXHJcbiAgICAvLyB3ZSBhZGQgb3RoZXIgc3RhdGVzIGxhdGVyIGxpa2UgJ2ZvcndhcmQnXHJcbiAgICB0aGlzLmRpcmVjdGlvblByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5KCBTa2F0ZXIuRGlyZWN0aW9uLCBTa2F0ZXIuRGlyZWN0aW9uLkxFRlQsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGlyZWN0aW9uUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtWZWN0b3IyfVxyXG4gICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIDAsIDAgKSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2ZWxvY2l0eVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn0gLSBUcnVlIGlmIHRoZSB1c2VyIGlzIGRyYWdnaW5nIHRoZSBza2F0ZXIgd2l0aCBhIHBvaW50ZXJcclxuICAgIHRoaXMuZHJhZ2dpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdnaW5nUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gRW5lcmdpZXMgYXJlIGluIEpvdWxlc1xyXG4gICAgdGhpcy5raW5ldGljRW5lcmd5UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAna2luZXRpY0VuZXJneVByb3BlcnR5JyApLFxyXG4gICAgICB1bml0czogJ0onLFxyXG4gICAgICBKOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5wb3RlbnRpYWxFbmVyZ3lQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwb3RlbnRpYWxFbmVyZ3lQcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICdKJyxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9XHJcbiAgICB0aGlzLnRoZXJtYWxFbmVyZ3lQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aGVybWFsRW5lcmd5UHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnSicsXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy50b3RhbEVuZXJneVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RvdGFsRW5lcmd5UHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnSicsXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIFRoZSBza2F0ZXIncyBhbmdsZSAoYWJvdXQgdGhlIHBpdm90IHBvaW50IGF0IHRoZSBib3R0b20gY2VudGVyKSwgaW4gcmFkaWFuc1xyXG4gICAgdGhpcy5hbmdsZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FuZ2xlUHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAncmFkaWFucycsXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7VmVjdG9yMn0gLSBSZXR1cm5zIHRvIHRoaXMgcG9pbnQgd2hlbiBwcmVzc2luZyBcInJldHVybiBza2F0ZXJcIlxyXG4gICAgdGhpcy5zdGFydGluZ1Bvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggMy41LCAwICksIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3RhcnRpbmdQb3NpdGlvblByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIFJldHVybnMgdG8gdGhpcyBwYXJhbWV0cmljIHBvc2l0aW9uIGFsb25nIHRoZSB0cmFjayB3aGVuIHByZXNzaW5nIFwicmV0dXJuIHNrYXRlclwiXHJcbiAgICB0aGlzLnN0YXJ0aW5nVVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N0YXJ0aW5nVVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bGxhYmxlSU8oIE51bWJlcklPIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBUcmFja3Mgd2hldGhlciBvciBub3QgdGhlIHNrYXRlciBpcyBhYm92ZSBvciBiZWxvdyB0aGUgdHJhY2sgd2hlbiBpdCBpcyByZWxlYXNlZFxyXG4gICAgdGhpcy5zdGFydGluZ1VwUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N0YXJ0aW5nVXBQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxUcmFja3xudWxsPn0gLSBSZXR1cm5zIHRvIHRoaXMgdHJhY2sgd2hlbiBwcmVzc2luZyBcInJldHVybiBza2F0ZXJcIlxyXG4gICAgdGhpcy5zdGFydGluZ1RyYWNrUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwsIHtcclxuICAgICAgdmFsdWVUeXBlOiBbIG51bGwsIFRyYWNrIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtWZWN0b3IyfSAtIFBvc2l0aW9uIG9mIHRoZSBza2F0ZXIncyBoZWFkLCBmb3IgcG9zaXRpb25pbmcgdGhlIHBpZSBjaGFydC5cclxuICAgIHRoaXMuaGVhZFBvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCB0aGlzLmdldEhlYWRQb3NpdGlvbigpLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2hlYWRQb3NpdGlvblByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMudXBkYXRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgdGhpcy5lbmVyZ3lDaGFuZ2VkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIGVtaXRzIGFuIGV2ZW50IHdoZW4gdGhlIHNrYXRlciBpcyByZXR1cm5lZCB0byBhIHByZXZpb3VzIHBvc2l0aW9uXHJcbiAgICB0aGlzLnJldHVybmVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5zcGVlZFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnZlbG9jaXR5UHJvcGVydHkgXSwgdmVsb2NpdHkgPT4gdmVsb2NpdHkubWFnbml0dWRlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NwZWVkUHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnbS9zJyxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdW1iZXJJT1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIERlcml2ZWQgLSBaZXJvIHRoZSBraW5ldGljIGVuZXJneSB3aGVuIGRyYWdnaW5nRGVyaXZlZCwgc2VlICMyMlxyXG4gICAgdGhpcy5kcmFnZ2luZ1Byb3BlcnR5LmxpbmsoIGRyYWdnaW5nID0+IHtcclxuICAgICAgaWYgKCBkcmFnZ2luZyApIHtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5UHJvcGVydHkudmFsdWUgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5wYXJhbWV0cmljU3BlZWRQcm9wZXJ0eS5saW5rKCBwYXJhbWV0cmljU3BlZWQgPT4ge1xyXG5cclxuICAgICAgLy8gUmVxdWlyZSB0aGUgc2thdGVyIHRvIG92ZXJjb21lIGEgc3BlZWQgdGhyZXNob2xkIHNvIGhlIHdvbid0IHRvZ2dsZSBiYWNrIGFuZCBmb3J0aCByYXBpZGx5IGF0IHRoZSBib3R0b20gb2YgYVxyXG4gICAgICAvLyB3ZWxsIHdpdGggZnJpY3Rpb24sIHNlZSAjNTFcclxuICAgICAgY29uc3Qgc3BlZWRUaHJlc2hvbGQgPSAwLjAxO1xyXG5cclxuICAgICAgaWYgKCBwYXJhbWV0cmljU3BlZWQgPiBzcGVlZFRocmVzaG9sZCApIHtcclxuICAgICAgICB0aGlzLmRpcmVjdGlvblByb3BlcnR5LnZhbHVlID0gdGhpcy5vblRvcFNpZGVPZlRyYWNrUHJvcGVydHkudmFsdWUgPyBTa2F0ZXIuRGlyZWN0aW9uLlJJR0hUIDogU2thdGVyLkRpcmVjdGlvbi5MRUZUO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBwYXJhbWV0cmljU3BlZWQgPCAtc3BlZWRUaHJlc2hvbGQgKSB7XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb25Qcm9wZXJ0eS52YWx1ZSA9IHRoaXMub25Ub3BTaWRlT2ZUcmFja1Byb3BlcnR5LnZhbHVlID8gU2thdGVyLkRpcmVjdGlvbi5MRUZUIDogU2thdGVyLkRpcmVjdGlvbi5SSUdIVDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyBLZWVwIHRoZSBzYW1lIGRpcmVjdGlvblxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIEJvb2xlYW4gZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIHRoZSBza2F0ZXIgaGFzIG1vdmVkIGZyb20gaGlzIGluaXRpYWwgcG9zaXRpb24sIGFuZCBoZW5jZSBjYW4gYmUgJ3JldHVybmVkJyxcclxuICAgIC8vIEZvciBtYWtpbmcgdGhlICdyZXR1cm4gc2thdGVyJyBidXR0b24gZW5hYmxlZC9kaXNhYmxlZFxyXG4gICAgLy8gSWYgdGhpcyBpcyBhIHBlcmZvcm1hbmNlIGNvbmNlcm4sIHBlcmhhcHMgaXQgY291bGQganVzdCBiZSBkcm9wcGVkIGFzIGEgZmVhdHVyZVxyXG4gICAgdGhpcy5tb3ZlZFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnBvc2l0aW9uUHJvcGVydHksIHRoaXMuc3RhcnRpbmdQb3NpdGlvblByb3BlcnR5LCB0aGlzLmRyYWdnaW5nUHJvcGVydHkgXSxcclxuICAgICAgKCB4LCB4MCwgZHJhZ2dpbmcgKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICFkcmFnZ2luZyAmJiAoIHgueCAhPT0geDAueCB8fCB4LnkgIT09IHgwLnkgKTtcclxuICAgICAgfSwge1xyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21vdmVkUHJvcGVydHknICksXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBCb29sZWFuSU9cclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSBlbmVyZ2llcyB3aGVuZXZlciBtYXNzLCBncmF2aXR5LCBvciBoZWlnaHQgY2hhbmdlcyBzbyB0aGF0IGVuZXJneSBkaXN0cmlidXRpb24gdXBkYXRlcyB3aGlsZSB0aGUgc2ltIGlzIHBhdXNlZFxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyB0aGlzLm1hc3NQcm9wZXJ0eSwgdGhpcy5yZWZlcmVuY2VIZWlnaHRQcm9wZXJ0eSwgdGhpcy5ncmF2aXR5UHJvcGVydHkgXSwgKCBtYXNzLCByZWZlcmVuY2VIZWlnaHQsIGdyYXZpdHkgKSA9PiB7XHJcbiAgICAgIHRoaXMudXBkYXRlRW5lcmd5KCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVFbmVyZ3koKTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMudXBkYXRlSGVhZFBvc2l0aW9uKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIEVuYWJsZSB0aGUgXCJDbGVhciBUaGVybWFsXCIgYnV0dG9ucyBidXQgb25seSBpZiB0aGUgdGhlcm1hbCBlbmVyZ3kgZXhjZWVkcyBhIHRpbnkgdGhyZXNob2xkLCBzbyB0aGVyZVxyXG4gICAgLy8gYXJlbid0IHZpc3VhbCBcImZhbHNlIHBvc2l0aXZlc1wiLCBzZWUgIzMwNlxyXG4gICAgdGhpcy5hbGxvd0NsZWFyaW5nVGhlcm1hbEVuZXJneVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnRoZXJtYWxFbmVyZ3lQcm9wZXJ0eSBdLFxyXG4gICAgICB0aGVybWFsRW5lcmd5ID0+IHtcclxuICAgICAgICByZXR1cm4gdGhlcm1hbEVuZXJneSA+IDFFLTI7XHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhbGxvd0NsZWFyaW5nVGhlcm1hbEVuZXJneVByb3BlcnR5JyApLFxyXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogQm9vbGVhbklPXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBJbiB0aGUgc3RhdGUgd3JhcHBlciwgd2hlbiB0aGUgc3RhdGUgY2hhbmdlcywgd2UgbXVzdCB1cGRhdGUgdGhlIHNrYXRlciBub2RlXHJcbiAgICBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmIHBoZXQucGhldGlvLnBoZXRpb0VuZ2luZS5waGV0aW9TdGF0ZUVuZ2luZS5zdGF0ZVNldEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgdGhpcy51cGRhdGVkRW1pdHRlci5lbWl0KCk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvLyBHZXQgdGhlIHZlY3RvciBmcm9tIGZlZXQgdG8gaGVhZCwgc28gdGhhdCB3aGVuIHRyYWNrcyBhcmUgam9pbmVkIHdlIGNhbiBtYWtlIHN1cmUgaGUgaXMgc3RpbGwgcG9pbnRpbmcgdXBcclxuICAvLyBAcHVibGljXHJcbiAgZ2V0IHVwVmVjdG9yKCkgeyByZXR1cm4gdGhpcy5oZWFkUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5taW51cyggdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogWmVybyB0aGUgdGhlcm1hbCBlbmVyZ3ksIGFuZCB1cGRhdGUgZW5lcmd5IGRpc3RyaWJ1dGlvbiBhY2NvcmRpbmdseS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY2xlYXJUaGVybWFsKCkge1xyXG4gICAgdGhpcy50aGVybWFsRW5lcmd5UHJvcGVydHkudmFsdWUgPSAwLjA7XHJcbiAgICB0aGlzLnVwZGF0ZUVuZXJneSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVsbHkgcmVzZXQgdGhpcyBza2F0ZXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5yZXNldEV2ZXJ5dGhpbmdFeGNlcHRHcmF2aXR5TWFzc0FuZFJlZmVyZW5jZUhlaWdodCgpO1xyXG5cclxuICAgIHRoaXMucmVmZXJlbmNlSGVpZ2h0UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubWFzc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmdyYXZpdHlNYWduaXR1ZGVQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIHRoaXMudXBkYXRlRW5lcmd5KCk7XHJcblxyXG4gICAgLy8gTm90aWZ5IHRoZSBncmFwaGljcyB0byByZS1yZW5kZXIuICBTZWUgIzIyM1xyXG4gICAgdGhpcy51cGRhdGVkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlIHRoZSBza2F0ZXIgdG8gaGVyIGluaXRpYWwgcG9zaXRpb24sIGJ1dCBsZWF2ZSB0aGUgcmVmZXJlbmNlIGhlaWdodCwgZnJpY3Rpb24sIGFuZCBtYXNzLCBhbmRcclxuICAgKiBncmF2aXR5IHRoZSBzYW1lLCBzZWUgIzIzNyBhbmQgIzE4OFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldFBvc2l0aW9uKCkge1xyXG4gICAgdGhpcy5yZXNldEV2ZXJ5dGhpbmdFeGNlcHRHcmF2aXR5TWFzc0FuZFJlZmVyZW5jZUhlaWdodCgpO1xyXG5cclxuICAgIC8vIE5vdGlmeSB0aGUgZ3JhcGhpY3MgdG8gcmUtcmVuZGVyLiAgU2VlICMyMjNcclxuICAgIHRoaXMudXBkYXRlRW5lcmd5KCk7XHJcbiAgICB0aGlzLnVwZGF0ZWRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IGFsbCBQcm9wZXJ0aWVzIG9mIHRoZSBTa2F0ZXIgZXhjZXB0IGZvciByZWZlcmVuY2UgaGVpZ2h0IGFuZCBtYXNzLiBVc2VmdWwgd2hlbiByZXNldHRpbmcgc2thdGVyIHBvc2l0aW9uXHJcbiAgICogb25seSwgYnV0IHJldXNlZCBpbiBhIGZldyBwbGFjZXMgd2hlbiByZXNldHRpbmcgU2thdGVyICh0byBiZSBzdXJyb3VuZGVkIGJ5IHJlc2V0dGluZyBtYXNzIG9yIHJlZmVyZW5jZSBoZWlnaHQpLlxyXG4gICAqIEFmdGVyIGNhbGxpbmcgdGhpcywgYmUgc3VyZSB0byBzaWduaWZ5IHVwZGF0ZXMgd2l0aCB0aGlzLnVwZGF0ZUVuZXJneSgpIGFuZCB0aGlzLnVwZGF0ZWRFbWl0dGVyLmVtaXQoKS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHJlc2V0RXZlcnl0aGluZ0V4Y2VwdEdyYXZpdHlNYXNzQW5kUmVmZXJlbmNlSGVpZ2h0KCkge1xyXG4gICAgLy8gc2V0IHRoZSBhbmdsZSB0byB6ZXJvIGZpcnN0IHNvIHRoYXQgdGhlIG9wdGltaXphdGlvbiBmb3IgU2thdGVyTm9kZS51cGRhdGVQb3NpdGlvbiBpcyBtYWludGFpbmVkLCB3aXRob3V0XHJcbiAgICAvLyBzaG93aW5nIHRoZSBza2F0ZXIgYXQgdGhlIHdyb25nIGFuZ2xlXHJcbiAgICB0aGlzLmFuZ2xlUHJvcGVydHkudmFsdWUgPSAwO1xyXG5cclxuICAgIHRoaXMudHJhY2tQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wYXJhbWV0cmljUG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wYXJhbWV0cmljU3BlZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5vblRvcFNpZGVPZlRyYWNrUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5kaXJlY3Rpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmRyYWdnaW5nUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMua2luZXRpY0VuZXJneVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnBvdGVudGlhbEVuZXJneVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRoZXJtYWxFbmVyZ3lQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy50b3RhbEVuZXJneVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmFuZ2xlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc3RhcnRpbmdQb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnN0YXJ0aW5nVVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnN0YXJ0aW5nVXBQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zdGFydGluZ1RyYWNrUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaGVhZFBvc2l0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybiB0aGUgc2thdGVyIHRvIHRoZSBsYXN0IHBvc2l0aW9uIGl0IHdhcyByZWxlYXNlZCBieSB0aGUgdXNlciAob3IgaXRzIHN0YXJ0aW5nIHBvc2l0aW9uKSwgaW5jbHVkaW5nIHRoZVxyXG4gICAqIHBvc2l0aW9uIG9uIGEgdHJhY2sgKGlmIGFueSkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJldHVyblNrYXRlcigpIHtcclxuXHJcbiAgICAvLyBJZiB0aGUgdXNlciBpcyBvbiB0aGUgc2FtZSB0cmFjayBhcyB3aGVyZSBoZSBiZWdhbiAoYW5kIHRoZSB0cmFjayBoYXNuJ3QgY2hhbmdlZCksIHJlbWFpbiBvbiB0aGUgdHJhY2ssXHJcbiAgICAvLyBzZWUgIzE0MyBhbmQgIzE0NFxyXG4gICAgaWYgKCB0aGlzLnN0YXJ0aW5nVHJhY2tQcm9wZXJ0eS52YWx1ZSAmJiB0aGlzLnRyYWNrUHJvcGVydHkudmFsdWUgPT09IHRoaXMuc3RhcnRpbmdUcmFja1Byb3BlcnR5LnZhbHVlICYmIF8uaXNFcXVhbCggdGhpcy50cmFja1Byb3BlcnR5LnZhbHVlLmNvcHlDb250cm9sUG9pbnRTb3VyY2VzKCksIHRoaXMuc3RhcnRpbmdUcmFja0NvbnRyb2xQb2ludFNvdXJjZXMgKSApIHtcclxuICAgICAgdGhpcy5wYXJhbWV0cmljUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHRoaXMuc3RhcnRpbmdVUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIHRoaXMuYW5nbGVQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuc3RhcnRpbmdBbmdsZTtcclxuICAgICAgdGhpcy5vblRvcFNpZGVPZlRyYWNrUHJvcGVydHkudmFsdWUgPSB0aGlzLnN0YXJ0aW5nVXBQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgdGhpcy5wYXJhbWV0cmljU3BlZWRQcm9wZXJ0eS52YWx1ZSA9IDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy50cmFja1Byb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgICAgdGhpcy5hbmdsZVByb3BlcnR5LnZhbHVlID0gdGhpcy5zdGFydGluZ0FuZ2xlO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnNldCggdGhpcy5zdGFydGluZ1Bvc2l0aW9uUHJvcGVydHkudmFsdWUuY29weSgpICk7XHJcbiAgICB0aGlzLnZlbG9jaXR5UHJvcGVydHkudmFsdWUgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgdGhpcy5jbGVhclRoZXJtYWwoKTtcclxuICAgIHRoaXMudXBkYXRlRW5lcmd5KCk7XHJcbiAgICB0aGlzLnVwZGF0ZWRFbWl0dGVyLmVtaXQoKTtcclxuXHJcbiAgICB0aGlzLnJldHVybmVkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIGVuZXJnaWVzIGFzIGEgYmF0Y2guIFRoaXMgaXMgYW4gZXhwbGljaXQgbWV0aG9kIGluc3RlYWQgb2YgbGlua2VkIHRvIGFsbCBkZXBlbmRlbmNpZXMgc28gdGhhdCBpdCBjYW5cclxuICAgKiBiZSBjYWxsZWQgaW4gYSBjb250cm9sbGVkIGZhc2hpb24gd2hlbiBtdWx0aXBsZSBkZXBlbmRlbmNpZXMgaGF2ZSBjaGFuZ2VkLCBmb3IgcGVyZm9ybWFuY2UuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHVwZGF0ZUVuZXJneSgpIHtcclxuICAgIHRoaXMua2luZXRpY0VuZXJneVByb3BlcnR5LnZhbHVlID0gMC41ICogdGhpcy5tYXNzUHJvcGVydHkudmFsdWUgKiB0aGlzLnZlbG9jaXR5UHJvcGVydHkudmFsdWUubWFnbml0dWRlU3F1YXJlZDtcclxuICAgIHRoaXMucG90ZW50aWFsRW5lcmd5UHJvcGVydHkudmFsdWUgPSAtdGhpcy5tYXNzUHJvcGVydHkudmFsdWUgKiAoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55IC0gdGhpcy5yZWZlcmVuY2VIZWlnaHRQcm9wZXJ0eS52YWx1ZSApICogdGhpcy5ncmF2aXR5UHJvcGVydHkudmFsdWU7XHJcbiAgICB0aGlzLnRvdGFsRW5lcmd5UHJvcGVydHkudmFsdWUgPSB0aGlzLmtpbmV0aWNFbmVyZ3lQcm9wZXJ0eS52YWx1ZSArIHRoaXMucG90ZW50aWFsRW5lcmd5UHJvcGVydHkudmFsdWUgKyB0aGlzLnRoZXJtYWxFbmVyZ3lQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAvLyBTaWduYWwgdGhhdCBlbmVyZ2llcyBoYXZlIGNoYW5nZWQgZm9yIGNvYXJzZS1ncmFpbmVkIGxpc3RlbmVycyBsaWtlIFBpZUNoYXJ0Tm9kZSB0aGF0IHNob3VsZCBub3QgZ2V0IHVwZGF0ZWRcclxuICAgIC8vIDMtNCB0aW1lcyBwZXIgdGltZXMgc3RlcFxyXG4gICAgdGhpcy5lbmVyZ3lDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBza2F0ZXIgaGVhZCBmcm9tIHRoZSBcInBvaW50XCIgbWFzcywgdGFraW5nIGludG8gYWNjb3VudCB0aGUgc2l6ZSBvZiB0aGUgc2thdGVyXHJcbiAgICogZnJvbSBpdHMgbWFzcyB2YWx1ZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKi9cclxuICBnZXRIZWFkUG9zaXRpb24oKSB7XHJcblxyXG4gICAgLy8gQ2VudGVyIHBpZSBjaGFydCBvdmVyIHNrYXRlcidzIGhlYWQgbm90IGhpcyBmZWV0IHNvIGl0IGRvZXNuJ3QgbG9vayBhd2t3YXJkIHdoZW4gc2thdGluZyBpbiBhIHBhcmFib2xhXHJcbiAgICAvLyBOb3RlIHRoaXMgaGFzIGJlZW4gdHVuZWQgaW5kZXBlbmRlbnRseSBvZiBTa2F0ZXJOb2RlLm1hc3NUb1NjYWxlLCB3aGljaCBhbHNvIGFjY291bnRzIGZvciB0aGUgaW1hZ2UgZGltZW5zaW9uc1xyXG4gICAgY29uc3Qgc2thdGVySGVpZ2h0ID0gVXRpbHMubGluZWFyKCB0aGlzLm1hc3NSYW5nZS5taW4sIHRoaXMubWFzc1JhbmdlLm1heCwgMS42NSwgMi40LCB0aGlzLm1hc3NQcm9wZXJ0eS52YWx1ZSApO1xyXG5cclxuICAgIGNvbnN0IHZlY3RvclggPSBza2F0ZXJIZWlnaHQgKiBNYXRoLmNvcyggdGhpcy5hbmdsZVByb3BlcnR5LnZhbHVlIC0gTWF0aC5QSSAvIDIgKTtcclxuICAgIGNvbnN0IHZlY3RvclkgPSBza2F0ZXJIZWlnaHQgKiBNYXRoLnNpbiggdGhpcy5hbmdsZVByb3BlcnR5LnZhbHVlIC0gTWF0aC5QSSAvIDIgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54ICsgdmVjdG9yWCwgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgLSB2ZWN0b3JZICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIGhlYWQgcG9zaXRpb24gZm9yIHNob3dpbmcgdGhlIHBpZSBjaGFydC4gRG9lc24ndCBkZXBlbmQgb24gXCJ1cFwiIGJlY2F1c2UgaXQgYWxyZWFkeSBkZXBlbmRzIG9uIHRoZVxyXG4gICAqIGFuZ2xlIG9mIHRoZSBza2F0ZXIuIFdvdWxkIGJlIGJldHRlciBpZiBoZWFkUG9zaXRpb24gd2VyZSBhIGRlcml2ZWQgcHJvcGVydHksIGJ1dCBjcmVhdGVkIHRvbyBtYW55IGFsbG9jYXRpb25zLFxyXG4gICAqIHNlZSAjNTBcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlSGVhZFBvc2l0aW9uKCkge1xyXG4gICAgY29uc3QgaGVhZFBvc2l0aW9uID0gdGhpcy5nZXRIZWFkUG9zaXRpb24oKTtcclxuXHJcbiAgICAvLyBNYW51YWxseSB0cmlnZ2VyIG5vdGlmaWNhdGlvbnMgdG8gYXZvaWQgYWxsb2NhdGlvbnMsIHNlZSAjNTBcclxuICAgIHRoaXMuaGVhZFBvc2l0aW9uUHJvcGVydHkudmFsdWUueCA9IGhlYWRQb3NpdGlvbi54O1xyXG4gICAgdGhpcy5oZWFkUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ID0gaGVhZFBvc2l0aW9uLnk7XHJcbiAgICB0aGlzLmhlYWRQb3NpdGlvblByb3BlcnR5Lm5vdGlmeUxpc3RlbmVyc1N0YXRpYygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSWYgdGhlIHNrYXRlciBpcyByZWxlYXNlZCwgc3RvcmUgdGhlIGluaXRpYWwgY29uZGl0aW9ucyBmb3Igd2hlbiB0aGUgc2thdGVyIGlzIHJldHVybmVkLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1RyYWNrfSB0YXJnZXRUcmFjayAtIFRoZSB0cmFjayB0byBzdGFydCBvbiAoaWYgYW55KVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0YXJnZXRVIC0gVGhlIHBhcmFtZXRyaWMgcG9zaXRpb24gYWxvbmcgdGhlIHRyYWNrIHRvIHN0YXJ0IG9uIChpZiBhbnkpXHJcbiAgICovXHJcbiAgcmVsZWFzZWQoIHRhcmdldFRyYWNrLCB0YXJnZXRVICkge1xyXG4gICAgdGhpcy5kcmFnZ2luZ1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICB0aGlzLnZlbG9jaXR5UHJvcGVydHkudmFsdWUgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgdGhpcy5wYXJhbWV0cmljU3BlZWRQcm9wZXJ0eS52YWx1ZSA9IDA7XHJcbiAgICB0aGlzLnRyYWNrUHJvcGVydHkudmFsdWUgPSB0YXJnZXRUcmFjaztcclxuICAgIHRoaXMucGFyYW1ldHJpY1Bvc2l0aW9uUHJvcGVydHkudmFsdWUgPSB0YXJnZXRVO1xyXG4gICAgaWYgKCB0YXJnZXRUcmFjayApIHtcclxuICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gdGFyZ2V0VHJhY2suZ2V0UG9pbnQoIHRoaXMucGFyYW1ldHJpY1Bvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgIH1cclxuICAgIHRoaXMuc3RhcnRpbmdQb3NpdGlvblByb3BlcnR5LnZhbHVlID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLmNvcHkoKTtcclxuICAgIHRoaXMuc3RhcnRpbmdVUHJvcGVydHkudmFsdWUgPSB0YXJnZXRVO1xyXG4gICAgdGhpcy5zdGFydGluZ1VwUHJvcGVydHkudmFsdWUgPSB0aGlzLm9uVG9wU2lkZU9mVHJhY2tQcm9wZXJ0eS52YWx1ZTtcclxuICAgIHRoaXMuc3RhcnRpbmdUcmFja1Byb3BlcnR5LnZhbHVlID0gdGFyZ2V0VHJhY2s7XHJcblxyXG4gICAgLy8gUmVjb3JkIHRoZSBzdGFydGluZyB0cmFjayBjb250cm9sIHBvaW50cyB0byBtYWtlIHN1cmUgdGhlIHRyYWNrIGhhc24ndCBjaGFuZ2VkIGR1cmluZyByZXR1cm4gdGhpcy5cclxuICAgIHRoaXMuc3RhcnRpbmdUcmFja0NvbnRyb2xQb2ludFNvdXJjZXMgPSB0YXJnZXRUcmFjayA/IHRhcmdldFRyYWNrLmNvcHlDb250cm9sUG9pbnRTb3VyY2VzKCkgOiBbXTtcclxuICAgIHRoaXMuc3RhcnRpbmdBbmdsZSA9IHRoaXMuYW5nbGVQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIGVuZXJneSBvbiBza2F0ZXIgcmVsZWFzZSBzbyBpdCB3b24ndCB0cnkgdG8gbW92ZSB0byBhIGRpZmZlcmVudCBoZWlnaHQgdG8gbWFrZSB1cCBmb3IgdGhlIGRlbHRhXHJcbiAgICB0aGlzLnVwZGF0ZUVuZXJneSgpO1xyXG4gICAgdGhpcy51cGRhdGVkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBAcHVibGljIHtFbnVtZXJhdGlvbkRlcHJlY2F0ZWR9XHJcbi8vIEBzdGF0aWNcclxuU2thdGVyLkRpcmVjdGlvbiA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ0xFRlQnLCAnUklHSFQnIF0gKTtcclxuXHJcbmVuZXJneVNrYXRlUGFyay5yZWdpc3RlciggJ1NrYXRlcicsIFNrYXRlciApO1xyXG5leHBvcnQgZGVmYXVsdCBTa2F0ZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsT0FBTyxNQUFNLGdDQUFnQztBQUNwRCxPQUFPQyw2QkFBNkIsTUFBTSxzREFBc0Q7QUFDaEcsT0FBT0MsU0FBUyxN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