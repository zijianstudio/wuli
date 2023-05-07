// Copyright 2020-2023, University of Colorado Boulder

/**
 * The Wave class represents a wave of light in the model.  Light waves are modeled as single lines with a start point
 * and information about the direction of travel.  They propagate through model space over time.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import MapIO from '../../../../tandem/js/types/MapIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import GreenhouseEffectConstants from '../../common/GreenhouseEffectConstants.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import WaveAttenuator from './WaveAttenuator.js';
import WaveIntensityChange from './WaveIntensityChange.js';
import WavesModel from './WavesModel.js';

// constants
const TWO_PI = 2 * Math.PI;
const PHASE_RATE = -Math.PI; // in radians per second

// The minimum distance between two intensity changes on the wave.  This is used to prevent having too many too close
// together, which was found to cause rendering issues.  The value was determined through trial and error.
const MINIMUM_INTER_INTENSITY_CHANGE_DISTANCE = 500;

// The minimum change necessary to warrant adding an intensity change to the wave at its source or at an attenuator.
const MINIMUM_INTENSITY_CHANGE = 0.05;

// This value is used when creating or updating intensity changes in a way that could cause them to end up on top of one
// another.  We generally don't want that to happen, so we "bump" one of them down the wave.  This value is in meters
// and is intended to be small enough to be unnoticeable when rendering.
const INTENSITY_CHANGE_DISTANCE_BUMP = 2;

// To be passed to the group's creator arguments, not the constructor

class Wave extends PhetioObject {
  // wavelength of this wave, in meters

  // The point from which this wave originates.  This is immutable over the lifetime of a wave, and is distinct from the
  // start point, since the start point can move as the wave propagates.
  // a normalized vector the defines the direction in which this wave is traveling
  // The starting point where the wave currently exists in model space.  This will be the same as the origin if the wave
  // is being sourced, or will move if the wave is propagating without being sourced.
  // An altitude past which this wave should not propagate.  This can apply to waves moving either up or down, and is
  // usually either the top of the atmosphere or the ground.
  // the length of this wave from the start point to where it ends
  // the length of time that this wave has existed, in seconds
  // Angle of phase offset, in radians.  This is here primarily in support of the view, but it has to be available in
  // the model in order to coordinate the appearance of reflected and stimulated waves.
  // The intensity value for this wave at its starting point.  This is a normalized value which goes from anything just
  // above 0 (and intensity of 0 is meaningless, so is not allowed by the code) to a max value of 1.
  // Changes in this wave's intensity that can exist at various locations along its length.  This list must remain
  // sorted in order of increasing distance from the start of the wave that it can be correctly rendered by the view.
  // indicates whether this wave is coming from a sourced point (e.g. the ground) or just propagating on its own
  // the wavelength used when rendering the view for this wave
  // A Map that maps model objects to the attenuation that they are currently causing on this wave.  The model objects
  // can be essentially anything, hence the vague "PhetioObject" type spec. Examples of model objects that can cause an
  // attenuation are clouds and atmosphere layers.
  // a string that can be attached to this wave and is used for debugging
  /**
   * @param wavelength - wavelength of this light wave, in meters
   * @param origin - the point from which the wave will originate
   * @param propagationDirection - a normalized vector (i.e. length = 1) that indicates the direction in which
   *                               this wave is propagating
   * @param propagationLimit - the altitude beyond which this wave should not extend or travel, works in either
   *                           direction, in meters
   * @param [providedOptions]
   */
  constructor(wavelength, origin, propagationDirection, propagationLimit, providedOptions) {
    const options = optionize()({
      intensityAtStart: 1,
      initialPhaseOffset: 0,
      debugTag: null,
      // phet-io
      phetioType: Wave.WaveIO,
      phetioDynamicElement: true
    }, providedOptions);

    // options checking
    assert && assert(options.initialPhaseOffset >= 0 && options.initialPhaseOffset <= TWO_PI, 'unexpected initial phase offset');
    super(options);
    this.debugTag = options.debugTag;

    // parameter checking
    assert && assert(Math.abs(propagationDirection.magnitude - 1) < 1E-6, 'propagation vector must be normalized');
    assert && assert(propagationDirection.y !== 0, 'fully horizontal waves are not supported');
    assert && assert(Math.sign(propagationDirection.y) === Math.sign(propagationLimit - origin.y), 'propagation limit does not make sense for provided propagationDirection');
    assert && assert(propagationLimit !== origin.y, 'this wave has no where to go');

    // set initial state
    this.wavelength = wavelength;
    this.origin = origin;
    this.propagationDirection = propagationDirection;
    this.propagationLimit = propagationLimit;
    this.startPoint = origin.copy();
    this.length = 0;
    this.isSourced = true;
    this.existenceTime = 0;
    this.phaseOffsetAtOrigin = options.initialPhaseOffset;
    this.intensityAtStart = options.intensityAtStart;
    this.intensityChanges = [];
    this.modelObjectToAttenuatorMap = new Map();
    this.renderingWavelength = WavesModel.REAL_TO_RENDERING_WAVELENGTH_MAP.get(wavelength);
  }

  /**
   * @param dt - delta time, in seconds
   */
  step(dt) {
    const propagationDistance = GreenhouseEffectConstants.SPEED_OF_LIGHT * dt;

    // If there is a source producing this wave it will continue to emanate from the same origin and will get longer
    // until it reaches an endpoint. If it is not sourced, it will travel through space until it reaches an endpoint,
    // where it will shorten until it disappears.
    if (this.isSourced) {
      // Update the length, while checking if the current change causes this wave to extend beyond its propagation
      // limit.  If so, limit the length of the wave.  Note that the propagation limit is not itself a length - it is an
      // altitude, i.e. a Y value, beyond which a wave should not travel.  This works for waves moving up or down.
      this.length = Math.min(this.length + propagationDistance, (this.propagationLimit - this.startPoint.y) / this.propagationDirection.y);

      // Move the un-anchored intensity changes with the wave.
      this.intensityChanges.forEach(intensityChange => {
        if (!intensityChange.anchoredTo) {
          intensityChange.distanceFromStart += propagationDistance;
        }
      });
    } else {
      // Move the wave forward, being careful not to move the start point beyond the propagation limit.
      let dy = this.propagationDirection.y * propagationDistance;
      if (Math.abs(dy) > Math.abs(this.propagationLimit - this.startPoint.y)) {
        dy = this.propagationLimit - this.startPoint.y;
      }
      this.startPoint.addXY(this.propagationDirection.x * propagationDistance, dy);

      // Check if the change to the start point causes this wave to extend beyond its propagation limit and, if so,
      // limit the length so that it doesn't.
      this.length = Math.min(this.length, (this.propagationLimit - this.startPoint.y) / this.propagationDirection.y);

      // If there are attenuators and anchored intensity changes on this wave, decrease their distance from the start
      // point, since the wave's start point has moved forward and the attenuators don't move with it.
      this.modelObjectToAttenuatorMap.forEach(attenuator => {
        attenuator.distanceFromStart -= propagationDistance;
      });
      this.intensityChanges.forEach(intensityChange => {
        if (intensityChange.anchoredTo) {
          intensityChange.distanceFromStart -= propagationDistance;
        }
      });
    }

    // Remove attenuators and associated intensity changes that are no longer on the wave because the wave has passed
    // entirely through them.
    this.modelObjectToAttenuatorMap.forEach((attenuator, modelElement) => {
      if (attenuator.distanceFromStart <= 0) {
        // Remove the attenuator.
        this.removeAttenuator(modelElement);

        // Set the intensity at the start to be the attenuated value.
        this.intensityAtStart = this.intensityAtStart * (1 - attenuator.attenuation);
      }
    });

    // Adjust the intensity changes based on their relationships with the attenuators.
    this.intensityChanges.forEach(intensityChange => {
      if (intensityChange.anchoredTo) {
        const attenuator = this.modelObjectToAttenuatorMap.get(intensityChange.anchoredTo);

        // state checking
        assert && assert(attenuator, 'There should always be an attenuator for an anchored intensity change.');
        const intensityAtInputToAttenuator = this.getIntensityAtDistance(attenuator.distanceFromStart);
        intensityChange.postChangeIntensity = intensityAtInputToAttenuator * (1 - attenuator.attenuation);
      } else {
        // If this intensity change crossed an attenuator, its output intensity needs to be adjusted.
        const crossedAttenuator = Array.from(this.modelObjectToAttenuatorMap.values()).find(attenuator => intensityChange.distanceFromStart > attenuator.distanceFromStart && intensityChange.distanceFromStart - propagationDistance < attenuator.distanceFromStart);
        if (crossedAttenuator) {
          intensityChange.postChangeIntensity = intensityChange.postChangeIntensity * (1 - crossedAttenuator.attenuation);
        }
      }
    });

    // Adjust each of the intensity changes that is associated with an attenuator based on the attenuation value and
    // the intensity of the incoming wave, which could have changed since the last step.
    this.intensityChanges.filter(intensityChange => intensityChange.anchoredTo).forEach(anchoredIntensityChange => {
      const attenuator = this.modelObjectToAttenuatorMap.get(anchoredIntensityChange.anchoredTo);

      // state checking
      assert && assert(attenuator, 'There should always be an attenuator for an anchored intensity change.');
      const intensityAtInputToAttenuator = this.getIntensityAtDistance(attenuator.distanceFromStart);
      anchoredIntensityChange.postChangeIntensity = intensityAtInputToAttenuator * (1 - attenuator.attenuation);
    });

    // Remove any intensity changes that are now off of the wave.
    this.intensityChanges = this.intensityChanges.filter(intensityChange => intensityChange.distanceFromStart < this.length);

    // Sort the intensity changes.  This is necessary for correct rendering in the view.
    this.sortIntensityChanges();

    // Update other aspects of the wave that evolve over time.
    this.phaseOffsetAtOrigin = this.phaseOffsetAtOrigin + PHASE_RATE * dt;
    if (this.phaseOffsetAtOrigin > TWO_PI) {
      this.phaseOffsetAtOrigin -= TWO_PI;
    } else if (this.phaseOffsetAtOrigin < 0) {
      this.phaseOffsetAtOrigin += TWO_PI;
    }
    this.existenceTime += dt;
  }

  /**
   * Get the altitude at which this wave ends.  This can be used instead of getEndPoint when only the end altitude is
   * needed, since it doesn't allocate a vector and may thus have better performance.  This treats the wave as a line
   * and does not account for any amplitude.
   */
  getEndAltitude() {
    return this.startPoint.y + this.length * this.propagationDirection.y;
  }

  /**
   * Get a vector that represents the end point of this wave.  This does not account for any amplitude of the wave, and
   * just treats it as a line between two points.  If a vector is provided, none is allocated.  This can help to reduce
   * the number of memory allocations.
   */
  getEndPoint(vectorToUse) {
    const endPointVector = vectorToUse || new Vector2(0, 0);
    endPointVector.setXY(this.startPoint.x + this.propagationDirection.x * this.length, this.startPoint.y + this.propagationDirection.y * this.length);
    return endPointVector;
  }

  /**
   * Get the intensity of the wave at the specified distance from the starting point.
   * @param distanceFromStart - in meters
   */
  getIntensityAtDistance(distanceFromStart) {
    let intensity = this.intensityAtStart;

    // Move through the intensity changes and find the last one before the specified distance.  This will provide the
    // intensity value needed.  This is set up to NOT include any intensity changes at the exact provided distance.
    // In other words, intensity changes only take effect AFTER their position, not exactly AT their position.  Also
    // note that this algorithm assumes the intensity changes are ordered by their distance from the waves starting
    // point.
    for (let i = 0; i < this.intensityChanges.length; i++) {
      const intensityChange = this.intensityChanges[i];
      if (intensityChange.distanceFromStart < distanceFromStart) {
        intensity = intensityChange.postChangeIntensity;
      } else {
        // We're done.
        break;
      }
    }
    return intensity;
  }

  /**
   * Get the intensity of this wave at the specified altitude.
   * @param altitude - in meters
   */
  getIntensityAtAltitude(altitude) {
    const distanceFromStart = Math.abs(altitude / Math.sin(this.propagationDirection.getAngle()));
    return this.getIntensityAtDistance(distanceFromStart);
  }

  /**
   * Set the intensity at the start of the wave.
   * @param intensity - a normalized intensity value
   */
  setIntensityAtStart(intensity) {
    // parameter checking
    assert && assert(intensity > 0 && intensity <= 1, 'illegal intensity value');

    // Only pay attention to this request to set the intensity if it is a significant enough change.  This helps to
    // prevent having an excess of intensity changes on the wave, which was found to cause rendering problems, both in
    // appearance and performance.  Small changes are quietly ignored.
    if (Math.abs(this.intensityAtStart - intensity) >= MINIMUM_INTENSITY_CHANGE) {
      // See if there is an intensity change within the max distance for consolidation.
      const firstIntensityChange = this.intensityChanges[0];
      if (firstIntensityChange && firstIntensityChange.distanceFromStart < MINIMUM_INTER_INTENSITY_CHANGE_DISTANCE) {
        // Use this intensity change instead of creating a new one.  This helps to prevent there from being too many
        // intensity changes on the wave, which can cause rendering issues.
        firstIntensityChange.postChangeIntensity = this.intensityAtStart;
      } else {
        // Create a new intensity wave to depict the change in intensity traveling with the wave.
        this.intensityChanges.push(new WaveIntensityChange(this.intensityAtStart, INTENSITY_CHANGE_DISTANCE_BUMP));
      }

      // Set the new intensity value at the start.
      this.intensityAtStart = intensity;
    }
  }

  /**
   * @param distanceFromStart
   * @param attenuationAmount
   * @param causalModelElement - the model element that is causing this attenuation to exist
   */
  addAttenuator(distanceFromStart, attenuationAmount, causalModelElement) {
    // parameter checking
    assert && assert(attenuationAmount >= 0 && attenuationAmount <= 1, 'the attenuation amount must be between zero and one');

    // state checking
    assert && assert(!this.modelObjectToAttenuatorMap.has(causalModelElement), 'this wave already has this attenuator');

    // Create and add the new attenuator.
    this.modelObjectToAttenuatorMap.set(causalModelElement, new WaveAttenuator(attenuationAmount, distanceFromStart));

    // Create the intensity change on the wave that is caused by this new attenuator.  This will be anchored to the
    // model object that is causing the attenuation and will not propagate with the wave.
    this.intensityChanges.push(new WaveIntensityChange(this.getIntensityAtDistance(distanceFromStart) * (1 - attenuationAmount), distanceFromStart, causalModelElement));

    // Create and add the intensity change that represents this wave's intensity beyond the new attenuator.  This one
    // will propagate with the wave.  We don't want this to be at the exact same distance as the intensity change that
    // will be caused by the attenuator, so put it a few meters beyond this current distance.
    this.intensityChanges.push(new WaveIntensityChange(this.getIntensityAtDistance(distanceFromStart), distanceFromStart + INTENSITY_CHANGE_DISTANCE_BUMP));

    // Sort the intensity changes.  This is necessary for correct rendering in the view.
    this.sortIntensityChanges();
  }

  /**
   * Remove the attenuator associated with the provided model element.
   */
  removeAttenuator(causalModelElement) {
    assert && assert(this.modelObjectToAttenuatorMap.has(causalModelElement), 'no attenuator exists for the provided model element');
    const attenuator = this.modelObjectToAttenuatorMap.get(causalModelElement);

    // Remove the attenuator from the map.
    this.modelObjectToAttenuatorMap.delete(causalModelElement);

    // Get the intensity change object associated with this attenuator.
    const associatedIntensityChange = this.intensityChanges.find(intensityChange => intensityChange.anchoredTo === causalModelElement);
    assert && assert(associatedIntensityChange, 'no intensity change found for this model element');

    // If the intensity change is still on the wave, free it to propagate along the wave.  If not, simply remove it.
    if (associatedIntensityChange.distanceFromStart > 0 && associatedIntensityChange.distanceFromStart < this.length) {
      // Before freeing this intensity change, make sure it is at the right value.
      associatedIntensityChange.postChangeIntensity = this.getIntensityAtDistance(attenuator.distanceFromStart) * (1 - attenuator.attenuation);

      // Fly! Be free!
      associatedIntensityChange.anchoredTo = null;
    } else {
      // Remove this intensity change.
      const index = this.intensityChanges.indexOf(associatedIntensityChange);
      if (index > -1) {
        this.intensityChanges.splice(index, 1);
      }
    }
  }

  /**
   * Does the provided model element have an associated attenuator on this wave?
   */
  hasAttenuator(modelElement) {
    return this.modelObjectToAttenuatorMap.has(modelElement);
  }

  /**
   * Set the attenuation value in the attenuator associated with the provided model element.
   */
  setAttenuation(modelElement, attenuation) {
    // state and parameter checking
    assert && assert(this.hasAttenuator(modelElement), 'no attenuator is on this wave for this model element');
    assert && assert(attenuation >= 0 && attenuation <= 1, 'invalid attenuation value');

    // Get the attenuator.
    const attenuator = this.modelObjectToAttenuatorMap.get(modelElement);

    // Only make changes to the wave if the attenuation value is above a threshold.  This helps to prevent too many
    // intensity changes from being on the wave, which can cause issues with the rendering, both in terms of appearance
    // and performance.
    if (attenuator && Math.abs(attenuator.attenuation - attenuation) >= MINIMUM_INTENSITY_CHANGE) {
      // Update the attenuation value.
      attenuator.attenuation = attenuation;

      // Get the intensity change currently associated with this attenuator.
      const associatedIntensityChange = this.intensityChanges.find(intensityChange => intensityChange.anchoredTo === modelElement);
      assert && assert(associatedIntensityChange, 'no intensity change found for this model element');

      // Find the first intensity change that is on the wave after this attenuator.
      const nextIntensityChange = this.intensityChanges.find(intensityChange => intensityChange.distanceFromStart > attenuator.distanceFromStart);

      // If the next intensity change is close enough, don't bother adding another one.  This will help to prevent there
      // from being too many on the wave, since having too many can cause rendering challenges.
      if (!nextIntensityChange || nextIntensityChange.distanceFromStart - associatedIntensityChange.distanceFromStart > MINIMUM_INTER_INTENSITY_CHANGE_DISTANCE) {
        // A new intensity change will be need to represent this change to the attenuation. Free the intensity change
        // currently associated with this attenuator to propagate with the wave, since it already has the correct
        // intensity at its output.
        associatedIntensityChange.anchoredTo = null;

        // Bump this intensity change down the wave a bit so that it won't be on top of the one that is about to be created.
        associatedIntensityChange.distanceFromStart += INTENSITY_CHANGE_DISTANCE_BUMP;

        // Add a new intensity change that is anchored to the model element and is based on the new attenuation value.
        this.intensityChanges.push(new WaveIntensityChange(this.getIntensityAtDistance(attenuator.distanceFromStart) * (1 - attenuator.attenuation), attenuator.distanceFromStart, modelElement));
      } else {
        // Update the existing intensity change based on the new attenuation value.
        associatedIntensityChange.postChangeIntensity = this.getIntensityAtDistance(attenuator.distanceFromStart) * (1 - attenuator.attenuation);
      }

      // Make sure the intensity changes are in the required order.
      this.sortIntensityChanges();
    }
  }

  /**
   * true if the wave has completely propagated and has nothing else to do
   */
  get isCompletelyPropagated() {
    return this.startPoint.y === this.propagationLimit;
  }

  /**
   * convenience method for determining whether this is a visible photon
   */
  get isVisible() {
    return this.wavelength === GreenhouseEffectConstants.VISIBLE_WAVELENGTH;
  }

  /**
   * convenience method for determining whether this is an infrared photon
   */
  get isInfrared() {
    return this.wavelength === GreenhouseEffectConstants.INFRARED_WAVELENGTH;
  }

  /**
   * Get the wave's phase at the specified distance from the origin.
   * @param distanceFromOrigin - in meters
   */
  getPhaseAt(distanceFromOrigin) {
    return (this.phaseOffsetAtOrigin + distanceFromOrigin / this.renderingWavelength * TWO_PI) % TWO_PI;
  }

  /**
   * Get a list of the attenuators that are currently on this wave sorted from closest to the start point to furthest.
   */
  getSortedAttenuators() {
    return Array.from(this.modelObjectToAttenuatorMap.values()).sort((attenuator1, attenuator2) => attenuator1.distanceFromStart - attenuator2.distanceFromStart);
  }

  /**
   * Serializes this Wave instance.
   */
  toStateObject() {
    return {
      wavelength: this.wavelength,
      origin: Vector2.Vector2IO.toStateObject(this.origin),
      propagationDirection: Vector2.Vector2IO.toStateObject(this.propagationDirection),
      propagationLimit: this.propagationLimit,
      startPoint: Vector2.Vector2IO.toStateObject(this.startPoint),
      length: this.length,
      isSourced: this.isSourced,
      existenceTime: this.existenceTime,
      phaseOffsetAtOrigin: this.phaseOffsetAtOrigin,
      intensityAtStart: this.intensityAtStart,
      intensityChanges: ArrayIO(WaveIntensityChange.WaveIntensityChangeIO).toStateObject(this.intensityChanges),
      modelObjectToAttenuatorMap: MapIO(ReferenceIO(IOType.ObjectIO), WaveAttenuator.WaveAttenuatorIO).toStateObject(this.modelObjectToAttenuatorMap),
      renderingWavelength: this.renderingWavelength
    };
  }

  /**
   * Apply the dynamic (non-immutable) portion of the wave state to this instance.
   */
  applyState(stateObject) {
    this.length = stateObject.length;
    this.isSourced = stateObject.isSourced;
    this.startPoint.set(Vector2.Vector2IO.fromStateObject(stateObject.startPoint));
    this.existenceTime = stateObject.existenceTime;
    this.phaseOffsetAtOrigin = stateObject.phaseOffsetAtOrigin;
    this.intensityAtStart = stateObject.intensityAtStart;
    this.intensityChanges = ArrayIO(WaveIntensityChange.WaveIntensityChangeIO).fromStateObject(stateObject.intensityChanges);
    this.modelObjectToAttenuatorMap = MapIO(ReferenceIO(IOType.ObjectIO), WaveAttenuator.WaveAttenuatorIO).fromStateObject(stateObject.modelObjectToAttenuatorMap);
  }

  /**
   * Make sure the intensity changes are ordered from closest to furthest from the start point of the wave.
   */
  sortIntensityChanges() {
    if (this.intensityChanges.length > 1) {
      this.intensityChanges.sort((a, b) => a.distanceFromStart - b.distanceFromStart);
    }
  }

  /**
   * WaveIO handles PhET-iO serialization of Wave. Because serialization involves accessing private members,
   * it delegates to Wave. The methods that WaveIO overrides are typical of 'Dynamic element serialization',
   * as described in the Serialization section of
   * https://github.com/phetsims/phet-io/blob/master/doc/phet-io-instrumentation-technical-guide.md#serialization
   */
  static WaveIO = new IOType('WaveIO', {
    valueType: Wave,
    stateSchema: {
      wavelength: NumberIO,
      origin: Vector2.Vector2IO,
      propagationDirection: Vector2.Vector2IO,
      propagationLimit: NumberIO,
      startPoint: Vector2.Vector2IO,
      length: NumberIO,
      isSourced: BooleanIO,
      existenceTime: NumberIO,
      phaseOffsetAtOrigin: NumberIO,
      intensityAtStart: NumberIO,
      intensityChanges: ArrayIO(WaveIntensityChange.WaveIntensityChangeIO),
      renderingWavelength: NumberIO,
      modelObjectToAttenuatorMap: MapIO(ReferenceIO(IOType.ObjectIO), WaveAttenuator.WaveAttenuatorIO)
    },
    toStateObject: wave => wave.toStateObject(),
    applyState: (wave, stateObject) => wave.applyState(stateObject),
    stateObjectToCreateElementArguments: state => [state.wavelength, Vector2.Vector2IO.fromStateObject(state.origin), Vector2.Vector2IO.fromStateObject(state.propagationDirection), state.propagationLimit, {
      intensityAtStart: state.intensityAtStart,
      initialPhaseOffset: state.phaseOffsetAtOrigin
    }]
  });
}
greenhouseEffect.register('Wave', Wave);
export default Wave;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwib3B0aW9uaXplIiwiUGhldGlvT2JqZWN0IiwiQXJyYXlJTyIsIkJvb2xlYW5JTyIsIklPVHlwZSIsIk1hcElPIiwiTnVtYmVySU8iLCJSZWZlcmVuY2VJTyIsIkdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMiLCJncmVlbmhvdXNlRWZmZWN0IiwiV2F2ZUF0dGVudWF0b3IiLCJXYXZlSW50ZW5zaXR5Q2hhbmdlIiwiV2F2ZXNNb2RlbCIsIlRXT19QSSIsIk1hdGgiLCJQSSIsIlBIQVNFX1JBVEUiLCJNSU5JTVVNX0lOVEVSX0lOVEVOU0lUWV9DSEFOR0VfRElTVEFOQ0UiLCJNSU5JTVVNX0lOVEVOU0lUWV9DSEFOR0UiLCJJTlRFTlNJVFlfQ0hBTkdFX0RJU1RBTkNFX0JVTVAiLCJXYXZlIiwiY29uc3RydWN0b3IiLCJ3YXZlbGVuZ3RoIiwib3JpZ2luIiwicHJvcGFnYXRpb25EaXJlY3Rpb24iLCJwcm9wYWdhdGlvbkxpbWl0IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImludGVuc2l0eUF0U3RhcnQiLCJpbml0aWFsUGhhc2VPZmZzZXQiLCJkZWJ1Z1RhZyIsInBoZXRpb1R5cGUiLCJXYXZlSU8iLCJwaGV0aW9EeW5hbWljRWxlbWVudCIsImFzc2VydCIsImFicyIsIm1hZ25pdHVkZSIsInkiLCJzaWduIiwic3RhcnRQb2ludCIsImNvcHkiLCJsZW5ndGgiLCJpc1NvdXJjZWQiLCJleGlzdGVuY2VUaW1lIiwicGhhc2VPZmZzZXRBdE9yaWdpbiIsImludGVuc2l0eUNoYW5nZXMiLCJtb2RlbE9iamVjdFRvQXR0ZW51YXRvck1hcCIsIk1hcCIsInJlbmRlcmluZ1dhdmVsZW5ndGgiLCJSRUFMX1RPX1JFTkRFUklOR19XQVZFTEVOR1RIX01BUCIsImdldCIsInN0ZXAiLCJkdCIsInByb3BhZ2F0aW9uRGlzdGFuY2UiLCJTUEVFRF9PRl9MSUdIVCIsIm1pbiIsImZvckVhY2giLCJpbnRlbnNpdHlDaGFuZ2UiLCJhbmNob3JlZFRvIiwiZGlzdGFuY2VGcm9tU3RhcnQiLCJkeSIsImFkZFhZIiwieCIsImF0dGVudWF0b3IiLCJtb2RlbEVsZW1lbnQiLCJyZW1vdmVBdHRlbnVhdG9yIiwiYXR0ZW51YXRpb24iLCJpbnRlbnNpdHlBdElucHV0VG9BdHRlbnVhdG9yIiwiZ2V0SW50ZW5zaXR5QXREaXN0YW5jZSIsInBvc3RDaGFuZ2VJbnRlbnNpdHkiLCJjcm9zc2VkQXR0ZW51YXRvciIsIkFycmF5IiwiZnJvbSIsInZhbHVlcyIsImZpbmQiLCJmaWx0ZXIiLCJhbmNob3JlZEludGVuc2l0eUNoYW5nZSIsInNvcnRJbnRlbnNpdHlDaGFuZ2VzIiwiZ2V0RW5kQWx0aXR1ZGUiLCJnZXRFbmRQb2ludCIsInZlY3RvclRvVXNlIiwiZW5kUG9pbnRWZWN0b3IiLCJzZXRYWSIsImludGVuc2l0eSIsImkiLCJnZXRJbnRlbnNpdHlBdEFsdGl0dWRlIiwiYWx0aXR1ZGUiLCJzaW4iLCJnZXRBbmdsZSIsInNldEludGVuc2l0eUF0U3RhcnQiLCJmaXJzdEludGVuc2l0eUNoYW5nZSIsInB1c2giLCJhZGRBdHRlbnVhdG9yIiwiYXR0ZW51YXRpb25BbW91bnQiLCJjYXVzYWxNb2RlbEVsZW1lbnQiLCJoYXMiLCJzZXQiLCJkZWxldGUiLCJhc3NvY2lhdGVkSW50ZW5zaXR5Q2hhbmdlIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwiaGFzQXR0ZW51YXRvciIsInNldEF0dGVudWF0aW9uIiwibmV4dEludGVuc2l0eUNoYW5nZSIsImlzQ29tcGxldGVseVByb3BhZ2F0ZWQiLCJpc1Zpc2libGUiLCJWSVNJQkxFX1dBVkVMRU5HVEgiLCJpc0luZnJhcmVkIiwiSU5GUkFSRURfV0FWRUxFTkdUSCIsImdldFBoYXNlQXQiLCJkaXN0YW5jZUZyb21PcmlnaW4iLCJnZXRTb3J0ZWRBdHRlbnVhdG9ycyIsInNvcnQiLCJhdHRlbnVhdG9yMSIsImF0dGVudWF0b3IyIiwidG9TdGF0ZU9iamVjdCIsIlZlY3RvcjJJTyIsIldhdmVJbnRlbnNpdHlDaGFuZ2VJTyIsIk9iamVjdElPIiwiV2F2ZUF0dGVudWF0b3JJTyIsImFwcGx5U3RhdGUiLCJzdGF0ZU9iamVjdCIsImZyb21TdGF0ZU9iamVjdCIsImEiLCJiIiwidmFsdWVUeXBlIiwic3RhdGVTY2hlbWEiLCJ3YXZlIiwic3RhdGVPYmplY3RUb0NyZWF0ZUVsZW1lbnRBcmd1bWVudHMiLCJzdGF0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2F2ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgV2F2ZSBjbGFzcyByZXByZXNlbnRzIGEgd2F2ZSBvZiBsaWdodCBpbiB0aGUgbW9kZWwuICBMaWdodCB3YXZlcyBhcmUgbW9kZWxlZCBhcyBzaW5nbGUgbGluZXMgd2l0aCBhIHN0YXJ0IHBvaW50XHJcbiAqIGFuZCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZGlyZWN0aW9uIG9mIHRyYXZlbC4gIFRoZXkgcHJvcGFnYXRlIHRocm91Z2ggbW9kZWwgc3BhY2Ugb3ZlciB0aW1lLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuaW1wb3J0IFZlY3RvcjIsIHsgVmVjdG9yMlN0YXRlT2JqZWN0IH0gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgV2l0aE9wdGlvbmFsIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9XaXRoT3B0aW9uYWwuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0LCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IEFycmF5SU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0FycmF5SU8uanMnO1xyXG5pbXBvcnQgQm9vbGVhbklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9Cb29sZWFuSU8uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgTWFwSU8sIHsgTWFwU3RhdGVPYmplY3QgfSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTWFwSU8uanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IFJlZmVyZW5jZUlPLCB7IFJlZmVyZW5jZUlPU3RhdGUgfSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvUmVmZXJlbmNlSU8uanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uLy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5pbXBvcnQgV2F2ZUF0dGVudWF0b3IsIHsgV2F2ZUF0dGVudWF0b3JTdGF0ZU9iamVjdCB9IGZyb20gJy4vV2F2ZUF0dGVudWF0b3IuanMnO1xyXG5pbXBvcnQgV2F2ZUludGVuc2l0eUNoYW5nZSwgeyBXYXZlSW50ZW5zaXR5Q2hhbmdlU3RhdGVPYmplY3QgfSBmcm9tICcuL1dhdmVJbnRlbnNpdHlDaGFuZ2UuanMnO1xyXG5pbXBvcnQgV2F2ZXNNb2RlbCBmcm9tICcuL1dhdmVzTW9kZWwuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRXT19QSSA9IDIgKiBNYXRoLlBJO1xyXG5jb25zdCBQSEFTRV9SQVRFID0gLU1hdGguUEk7IC8vIGluIHJhZGlhbnMgcGVyIHNlY29uZFxyXG5cclxuLy8gVGhlIG1pbmltdW0gZGlzdGFuY2UgYmV0d2VlbiB0d28gaW50ZW5zaXR5IGNoYW5nZXMgb24gdGhlIHdhdmUuICBUaGlzIGlzIHVzZWQgdG8gcHJldmVudCBoYXZpbmcgdG9vIG1hbnkgdG9vIGNsb3NlXHJcbi8vIHRvZ2V0aGVyLCB3aGljaCB3YXMgZm91bmQgdG8gY2F1c2UgcmVuZGVyaW5nIGlzc3Vlcy4gIFRoZSB2YWx1ZSB3YXMgZGV0ZXJtaW5lZCB0aHJvdWdoIHRyaWFsIGFuZCBlcnJvci5cclxuY29uc3QgTUlOSU1VTV9JTlRFUl9JTlRFTlNJVFlfQ0hBTkdFX0RJU1RBTkNFID0gNTAwO1xyXG5cclxuLy8gVGhlIG1pbmltdW0gY2hhbmdlIG5lY2Vzc2FyeSB0byB3YXJyYW50IGFkZGluZyBhbiBpbnRlbnNpdHkgY2hhbmdlIHRvIHRoZSB3YXZlIGF0IGl0cyBzb3VyY2Ugb3IgYXQgYW4gYXR0ZW51YXRvci5cclxuY29uc3QgTUlOSU1VTV9JTlRFTlNJVFlfQ0hBTkdFID0gMC4wNTtcclxuXHJcbi8vIFRoaXMgdmFsdWUgaXMgdXNlZCB3aGVuIGNyZWF0aW5nIG9yIHVwZGF0aW5nIGludGVuc2l0eSBjaGFuZ2VzIGluIGEgd2F5IHRoYXQgY291bGQgY2F1c2UgdGhlbSB0byBlbmQgdXAgb24gdG9wIG9mIG9uZVxyXG4vLyBhbm90aGVyLiAgV2UgZ2VuZXJhbGx5IGRvbid0IHdhbnQgdGhhdCB0byBoYXBwZW4sIHNvIHdlIFwiYnVtcFwiIG9uZSBvZiB0aGVtIGRvd24gdGhlIHdhdmUuICBUaGlzIHZhbHVlIGlzIGluIG1ldGVyc1xyXG4vLyBhbmQgaXMgaW50ZW5kZWQgdG8gYmUgc21hbGwgZW5vdWdoIHRvIGJlIHVubm90aWNlYWJsZSB3aGVuIHJlbmRlcmluZy5cclxuY29uc3QgSU5URU5TSVRZX0NIQU5HRV9ESVNUQU5DRV9CVU1QID0gMjtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIHRoZSBpbnRlbnNpdHkgb2YgdGhpcyB3YXZlIGZyb20gaXRzIHN0YXJ0IHBvaW50LCByYW5nZSBpcyAwIChubyBpbnRlbnNpdHkpIHRvIDEgKG1heCBpbnRlbnNpdHkpXHJcbiAgaW50ZW5zaXR5QXRTdGFydD86IG51bWJlcjtcclxuXHJcbiAgLy8gaW5pdGlhbCBwaGFzZSBvZmZzZXQsIGluIHJhZGlhbnNcclxuICBpbml0aWFsUGhhc2VPZmZzZXQ/OiBudW1iZXI7XHJcblxyXG4gIC8vIGEgc3RyaW5nIHRoYXQgY2FuIGJlIHN0dWNrIG9uIHRoZSBvYmplY3QsIHVzZWZ1bCBmb3IgZGVidWdnaW5nLCBzZWUgdXNhZ2VcclxuICBkZWJ1Z1RhZz86IHN0cmluZyB8IG51bGw7XHJcbn07XHJcbmV4cG9ydCB0eXBlIFdhdmVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaGV0aW9PYmplY3RPcHRpb25zICYgUGlja1JlcXVpcmVkPFBoZXRpb09iamVjdE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbi8vIFRvIGJlIHBhc3NlZCB0byB0aGUgZ3JvdXAncyBjcmVhdG9yIGFyZ3VtZW50cywgbm90IHRoZSBjb25zdHJ1Y3RvclxyXG5leHBvcnQgdHlwZSBXYXZlQ3JlYXRvck9wdGlvbnMgPSBXaXRoT3B0aW9uYWw8V2F2ZU9wdGlvbnMsICd0YW5kZW0nPjtcclxuZXhwb3J0IHR5cGUgV2F2ZUNyZWF0b3JBcmd1bWVudHMgPSBbIG51bWJlciwgVmVjdG9yMiwgVmVjdG9yMiwgbnVtYmVyLCBXYXZlQ3JlYXRvck9wdGlvbnMgXTtcclxuXHJcbmNsYXNzIFdhdmUgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG5cclxuICAvLyB3YXZlbGVuZ3RoIG9mIHRoaXMgd2F2ZSwgaW4gbWV0ZXJzXHJcbiAgcHVibGljIHJlYWRvbmx5IHdhdmVsZW5ndGg6IG51bWJlcjtcclxuXHJcbiAgLy8gVGhlIHBvaW50IGZyb20gd2hpY2ggdGhpcyB3YXZlIG9yaWdpbmF0ZXMuICBUaGlzIGlzIGltbXV0YWJsZSBvdmVyIHRoZSBsaWZldGltZSBvZiBhIHdhdmUsIGFuZCBpcyBkaXN0aW5jdCBmcm9tIHRoZVxyXG4gIC8vIHN0YXJ0IHBvaW50LCBzaW5jZSB0aGUgc3RhcnQgcG9pbnQgY2FuIG1vdmUgYXMgdGhlIHdhdmUgcHJvcGFnYXRlcy5cclxuICBwdWJsaWMgcmVhZG9ubHkgb3JpZ2luOiBWZWN0b3IyO1xyXG5cclxuICAvLyBhIG5vcm1hbGl6ZWQgdmVjdG9yIHRoZSBkZWZpbmVzIHRoZSBkaXJlY3Rpb24gaW4gd2hpY2ggdGhpcyB3YXZlIGlzIHRyYXZlbGluZ1xyXG4gIHB1YmxpYyByZWFkb25seSBwcm9wYWdhdGlvbkRpcmVjdGlvbjogVmVjdG9yMjtcclxuXHJcbiAgLy8gVGhlIHN0YXJ0aW5nIHBvaW50IHdoZXJlIHRoZSB3YXZlIGN1cnJlbnRseSBleGlzdHMgaW4gbW9kZWwgc3BhY2UuICBUaGlzIHdpbGwgYmUgdGhlIHNhbWUgYXMgdGhlIG9yaWdpbiBpZiB0aGUgd2F2ZVxyXG4gIC8vIGlzIGJlaW5nIHNvdXJjZWQsIG9yIHdpbGwgbW92ZSBpZiB0aGUgd2F2ZSBpcyBwcm9wYWdhdGluZyB3aXRob3V0IGJlaW5nIHNvdXJjZWQuXHJcbiAgcHVibGljIHJlYWRvbmx5IHN0YXJ0UG9pbnQ6IFZlY3RvcjI7XHJcblxyXG4gIC8vIEFuIGFsdGl0dWRlIHBhc3Qgd2hpY2ggdGhpcyB3YXZlIHNob3VsZCBub3QgcHJvcGFnYXRlLiAgVGhpcyBjYW4gYXBwbHkgdG8gd2F2ZXMgbW92aW5nIGVpdGhlciB1cCBvciBkb3duLCBhbmQgaXNcclxuICAvLyB1c3VhbGx5IGVpdGhlciB0aGUgdG9wIG9mIHRoZSBhdG1vc3BoZXJlIG9yIHRoZSBncm91bmQuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBwcm9wYWdhdGlvbkxpbWl0OiBudW1iZXI7XHJcblxyXG4gIC8vIHRoZSBsZW5ndGggb2YgdGhpcyB3YXZlIGZyb20gdGhlIHN0YXJ0IHBvaW50IHRvIHdoZXJlIGl0IGVuZHNcclxuICBwdWJsaWMgbGVuZ3RoOiBudW1iZXI7XHJcblxyXG4gIC8vIHRoZSBsZW5ndGggb2YgdGltZSB0aGF0IHRoaXMgd2F2ZSBoYXMgZXhpc3RlZCwgaW4gc2Vjb25kc1xyXG4gIHB1YmxpYyBleGlzdGVuY2VUaW1lOiBudW1iZXI7XHJcblxyXG4gIC8vIEFuZ2xlIG9mIHBoYXNlIG9mZnNldCwgaW4gcmFkaWFucy4gIFRoaXMgaXMgaGVyZSBwcmltYXJpbHkgaW4gc3VwcG9ydCBvZiB0aGUgdmlldywgYnV0IGl0IGhhcyB0byBiZSBhdmFpbGFibGUgaW5cclxuICAvLyB0aGUgbW9kZWwgaW4gb3JkZXIgdG8gY29vcmRpbmF0ZSB0aGUgYXBwZWFyYW5jZSBvZiByZWZsZWN0ZWQgYW5kIHN0aW11bGF0ZWQgd2F2ZXMuXHJcbiAgcHVibGljIHBoYXNlT2Zmc2V0QXRPcmlnaW46IG51bWJlcjtcclxuXHJcbiAgLy8gVGhlIGludGVuc2l0eSB2YWx1ZSBmb3IgdGhpcyB3YXZlIGF0IGl0cyBzdGFydGluZyBwb2ludC4gIFRoaXMgaXMgYSBub3JtYWxpemVkIHZhbHVlIHdoaWNoIGdvZXMgZnJvbSBhbnl0aGluZyBqdXN0XHJcbiAgLy8gYWJvdmUgMCAoYW5kIGludGVuc2l0eSBvZiAwIGlzIG1lYW5pbmdsZXNzLCBzbyBpcyBub3QgYWxsb3dlZCBieSB0aGUgY29kZSkgdG8gYSBtYXggdmFsdWUgb2YgMS5cclxuICBwdWJsaWMgaW50ZW5zaXR5QXRTdGFydDogbnVtYmVyO1xyXG5cclxuICAvLyBDaGFuZ2VzIGluIHRoaXMgd2F2ZSdzIGludGVuc2l0eSB0aGF0IGNhbiBleGlzdCBhdCB2YXJpb3VzIGxvY2F0aW9ucyBhbG9uZyBpdHMgbGVuZ3RoLiAgVGhpcyBsaXN0IG11c3QgcmVtYWluXHJcbiAgLy8gc29ydGVkIGluIG9yZGVyIG9mIGluY3JlYXNpbmcgZGlzdGFuY2UgZnJvbSB0aGUgc3RhcnQgb2YgdGhlIHdhdmUgdGhhdCBpdCBjYW4gYmUgY29ycmVjdGx5IHJlbmRlcmVkIGJ5IHRoZSB2aWV3LlxyXG4gIHB1YmxpYyBpbnRlbnNpdHlDaGFuZ2VzOiBXYXZlSW50ZW5zaXR5Q2hhbmdlW107XHJcblxyXG4gIC8vIGluZGljYXRlcyB3aGV0aGVyIHRoaXMgd2F2ZSBpcyBjb21pbmcgZnJvbSBhIHNvdXJjZWQgcG9pbnQgKGUuZy4gdGhlIGdyb3VuZCkgb3IganVzdCBwcm9wYWdhdGluZyBvbiBpdHMgb3duXHJcbiAgcHVibGljIGlzU291cmNlZDogYm9vbGVhbjtcclxuXHJcbiAgLy8gdGhlIHdhdmVsZW5ndGggdXNlZCB3aGVuIHJlbmRlcmluZyB0aGUgdmlldyBmb3IgdGhpcyB3YXZlXHJcbiAgcHJpdmF0ZSByZWFkb25seSByZW5kZXJpbmdXYXZlbGVuZ3RoOiBudW1iZXI7XHJcblxyXG4gIC8vIEEgTWFwIHRoYXQgbWFwcyBtb2RlbCBvYmplY3RzIHRvIHRoZSBhdHRlbnVhdGlvbiB0aGF0IHRoZXkgYXJlIGN1cnJlbnRseSBjYXVzaW5nIG9uIHRoaXMgd2F2ZS4gIFRoZSBtb2RlbCBvYmplY3RzXHJcbiAgLy8gY2FuIGJlIGVzc2VudGlhbGx5IGFueXRoaW5nLCBoZW5jZSB0aGUgdmFndWUgXCJQaGV0aW9PYmplY3RcIiB0eXBlIHNwZWMuIEV4YW1wbGVzIG9mIG1vZGVsIG9iamVjdHMgdGhhdCBjYW4gY2F1c2UgYW5cclxuICAvLyBhdHRlbnVhdGlvbiBhcmUgY2xvdWRzIGFuZCBhdG1vc3BoZXJlIGxheWVycy5cclxuICBwcml2YXRlIG1vZGVsT2JqZWN0VG9BdHRlbnVhdG9yTWFwOiBNYXA8UGhldGlvT2JqZWN0LCBXYXZlQXR0ZW51YXRvcj47XHJcblxyXG4gIC8vIGEgc3RyaW5nIHRoYXQgY2FuIGJlIGF0dGFjaGVkIHRvIHRoaXMgd2F2ZSBhbmQgaXMgdXNlZCBmb3IgZGVidWdnaW5nXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkZWJ1Z1RhZzogc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHdhdmVsZW5ndGggLSB3YXZlbGVuZ3RoIG9mIHRoaXMgbGlnaHQgd2F2ZSwgaW4gbWV0ZXJzXHJcbiAgICogQHBhcmFtIG9yaWdpbiAtIHRoZSBwb2ludCBmcm9tIHdoaWNoIHRoZSB3YXZlIHdpbGwgb3JpZ2luYXRlXHJcbiAgICogQHBhcmFtIHByb3BhZ2F0aW9uRGlyZWN0aW9uIC0gYSBub3JtYWxpemVkIHZlY3RvciAoaS5lLiBsZW5ndGggPSAxKSB0aGF0IGluZGljYXRlcyB0aGUgZGlyZWN0aW9uIGluIHdoaWNoXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyB3YXZlIGlzIHByb3BhZ2F0aW5nXHJcbiAgICogQHBhcmFtIHByb3BhZ2F0aW9uTGltaXQgLSB0aGUgYWx0aXR1ZGUgYmV5b25kIHdoaWNoIHRoaXMgd2F2ZSBzaG91bGQgbm90IGV4dGVuZCBvciB0cmF2ZWwsIHdvcmtzIGluIGVpdGhlclxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uLCBpbiBtZXRlcnNcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHdhdmVsZW5ndGg6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbjogVmVjdG9yMixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3BhZ2F0aW9uRGlyZWN0aW9uOiBWZWN0b3IyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvcGFnYXRpb25MaW1pdDogbnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zPzogV2F2ZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxXYXZlT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcclxuICAgICAgaW50ZW5zaXR5QXRTdGFydDogMSxcclxuICAgICAgaW5pdGlhbFBoYXNlT2Zmc2V0OiAwLFxyXG4gICAgICBkZWJ1Z1RhZzogbnVsbCxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgcGhldGlvVHlwZTogV2F2ZS5XYXZlSU8sXHJcbiAgICAgIHBoZXRpb0R5bmFtaWNFbGVtZW50OiB0cnVlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBvcHRpb25zIGNoZWNraW5nXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgb3B0aW9ucy5pbml0aWFsUGhhc2VPZmZzZXQgPj0gMCAmJiBvcHRpb25zLmluaXRpYWxQaGFzZU9mZnNldCA8PSBUV09fUEksXHJcbiAgICAgICd1bmV4cGVjdGVkIGluaXRpYWwgcGhhc2Ugb2Zmc2V0J1xyXG4gICAgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuZGVidWdUYWcgPSBvcHRpb25zLmRlYnVnVGFnO1xyXG5cclxuICAgIC8vIHBhcmFtZXRlciBjaGVja2luZ1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTWF0aC5hYnMoIHByb3BhZ2F0aW9uRGlyZWN0aW9uLm1hZ25pdHVkZSAtIDEgKSA8IDFFLTYsICdwcm9wYWdhdGlvbiB2ZWN0b3IgbXVzdCBiZSBub3JtYWxpemVkJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvcGFnYXRpb25EaXJlY3Rpb24ueSAhPT0gMCwgJ2Z1bGx5IGhvcml6b250YWwgd2F2ZXMgYXJlIG5vdCBzdXBwb3J0ZWQnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgICBNYXRoLnNpZ24oIHByb3BhZ2F0aW9uRGlyZWN0aW9uLnkgKSA9PT0gTWF0aC5zaWduKCBwcm9wYWdhdGlvbkxpbWl0IC0gb3JpZ2luLnkgKSxcclxuICAgICAgJ3Byb3BhZ2F0aW9uIGxpbWl0IGRvZXMgbm90IG1ha2Ugc2Vuc2UgZm9yIHByb3ZpZGVkIHByb3BhZ2F0aW9uRGlyZWN0aW9uJ1xyXG4gICAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHByb3BhZ2F0aW9uTGltaXQgIT09IG9yaWdpbi55LCAndGhpcyB3YXZlIGhhcyBubyB3aGVyZSB0byBnbycgKTtcclxuXHJcbiAgICAvLyBzZXQgaW5pdGlhbCBzdGF0ZVxyXG4gICAgdGhpcy53YXZlbGVuZ3RoID0gd2F2ZWxlbmd0aDtcclxuICAgIHRoaXMub3JpZ2luID0gb3JpZ2luO1xyXG4gICAgdGhpcy5wcm9wYWdhdGlvbkRpcmVjdGlvbiA9IHByb3BhZ2F0aW9uRGlyZWN0aW9uO1xyXG4gICAgdGhpcy5wcm9wYWdhdGlvbkxpbWl0ID0gcHJvcGFnYXRpb25MaW1pdDtcclxuICAgIHRoaXMuc3RhcnRQb2ludCA9IG9yaWdpbi5jb3B5KCk7XHJcbiAgICB0aGlzLmxlbmd0aCA9IDA7XHJcbiAgICB0aGlzLmlzU291cmNlZCA9IHRydWU7XHJcbiAgICB0aGlzLmV4aXN0ZW5jZVRpbWUgPSAwO1xyXG4gICAgdGhpcy5waGFzZU9mZnNldEF0T3JpZ2luID0gb3B0aW9ucy5pbml0aWFsUGhhc2VPZmZzZXQ7XHJcbiAgICB0aGlzLmludGVuc2l0eUF0U3RhcnQgPSBvcHRpb25zLmludGVuc2l0eUF0U3RhcnQ7XHJcbiAgICB0aGlzLmludGVuc2l0eUNoYW5nZXMgPSBbXTtcclxuICAgIHRoaXMubW9kZWxPYmplY3RUb0F0dGVudWF0b3JNYXAgPSBuZXcgTWFwPFBoZXRpb09iamVjdCwgV2F2ZUF0dGVudWF0b3I+KCk7XHJcbiAgICB0aGlzLnJlbmRlcmluZ1dhdmVsZW5ndGggPSBXYXZlc01vZGVsLlJFQUxfVE9fUkVOREVSSU5HX1dBVkVMRU5HVEhfTUFQLmdldCggd2F2ZWxlbmd0aCApITtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBkdCAtIGRlbHRhIHRpbWUsIGluIHNlY29uZHNcclxuICAgKi9cclxuICBwdWJsaWMgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBwcm9wYWdhdGlvbkRpc3RhbmNlID0gR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5TUEVFRF9PRl9MSUdIVCAqIGR0O1xyXG5cclxuICAgIC8vIElmIHRoZXJlIGlzIGEgc291cmNlIHByb2R1Y2luZyB0aGlzIHdhdmUgaXQgd2lsbCBjb250aW51ZSB0byBlbWFuYXRlIGZyb20gdGhlIHNhbWUgb3JpZ2luIGFuZCB3aWxsIGdldCBsb25nZXJcclxuICAgIC8vIHVudGlsIGl0IHJlYWNoZXMgYW4gZW5kcG9pbnQuIElmIGl0IGlzIG5vdCBzb3VyY2VkLCBpdCB3aWxsIHRyYXZlbCB0aHJvdWdoIHNwYWNlIHVudGlsIGl0IHJlYWNoZXMgYW4gZW5kcG9pbnQsXHJcbiAgICAvLyB3aGVyZSBpdCB3aWxsIHNob3J0ZW4gdW50aWwgaXQgZGlzYXBwZWFycy5cclxuICAgIGlmICggdGhpcy5pc1NvdXJjZWQgKSB7XHJcblxyXG4gICAgICAvLyBVcGRhdGUgdGhlIGxlbmd0aCwgd2hpbGUgY2hlY2tpbmcgaWYgdGhlIGN1cnJlbnQgY2hhbmdlIGNhdXNlcyB0aGlzIHdhdmUgdG8gZXh0ZW5kIGJleW9uZCBpdHMgcHJvcGFnYXRpb25cclxuICAgICAgLy8gbGltaXQuICBJZiBzbywgbGltaXQgdGhlIGxlbmd0aCBvZiB0aGUgd2F2ZS4gIE5vdGUgdGhhdCB0aGUgcHJvcGFnYXRpb24gbGltaXQgaXMgbm90IGl0c2VsZiBhIGxlbmd0aCAtIGl0IGlzIGFuXHJcbiAgICAgIC8vIGFsdGl0dWRlLCBpLmUuIGEgWSB2YWx1ZSwgYmV5b25kIHdoaWNoIGEgd2F2ZSBzaG91bGQgbm90IHRyYXZlbC4gIFRoaXMgd29ya3MgZm9yIHdhdmVzIG1vdmluZyB1cCBvciBkb3duLlxyXG4gICAgICB0aGlzLmxlbmd0aCA9IE1hdGgubWluKFxyXG4gICAgICAgIHRoaXMubGVuZ3RoICsgcHJvcGFnYXRpb25EaXN0YW5jZSxcclxuICAgICAgICAoIHRoaXMucHJvcGFnYXRpb25MaW1pdCAtIHRoaXMuc3RhcnRQb2ludC55ICkgLyB0aGlzLnByb3BhZ2F0aW9uRGlyZWN0aW9uLnlcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIE1vdmUgdGhlIHVuLWFuY2hvcmVkIGludGVuc2l0eSBjaGFuZ2VzIHdpdGggdGhlIHdhdmUuXHJcbiAgICAgIHRoaXMuaW50ZW5zaXR5Q2hhbmdlcy5mb3JFYWNoKCBpbnRlbnNpdHlDaGFuZ2UgPT4ge1xyXG4gICAgICAgIGlmICggIWludGVuc2l0eUNoYW5nZS5hbmNob3JlZFRvICkge1xyXG4gICAgICAgICAgaW50ZW5zaXR5Q2hhbmdlLmRpc3RhbmNlRnJvbVN0YXJ0ICs9IHByb3BhZ2F0aW9uRGlzdGFuY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIE1vdmUgdGhlIHdhdmUgZm9yd2FyZCwgYmVpbmcgY2FyZWZ1bCBub3QgdG8gbW92ZSB0aGUgc3RhcnQgcG9pbnQgYmV5b25kIHRoZSBwcm9wYWdhdGlvbiBsaW1pdC5cclxuICAgICAgbGV0IGR5ID0gdGhpcy5wcm9wYWdhdGlvbkRpcmVjdGlvbi55ICogcHJvcGFnYXRpb25EaXN0YW5jZTtcclxuICAgICAgaWYgKCBNYXRoLmFicyggZHkgKSA+IE1hdGguYWJzKCB0aGlzLnByb3BhZ2F0aW9uTGltaXQgLSB0aGlzLnN0YXJ0UG9pbnQueSApICkge1xyXG4gICAgICAgIGR5ID0gdGhpcy5wcm9wYWdhdGlvbkxpbWl0IC0gdGhpcy5zdGFydFBvaW50Lnk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5zdGFydFBvaW50LmFkZFhZKCB0aGlzLnByb3BhZ2F0aW9uRGlyZWN0aW9uLnggKiBwcm9wYWdhdGlvbkRpc3RhbmNlLCBkeSApO1xyXG5cclxuICAgICAgLy8gQ2hlY2sgaWYgdGhlIGNoYW5nZSB0byB0aGUgc3RhcnQgcG9pbnQgY2F1c2VzIHRoaXMgd2F2ZSB0byBleHRlbmQgYmV5b25kIGl0cyBwcm9wYWdhdGlvbiBsaW1pdCBhbmQsIGlmIHNvLFxyXG4gICAgICAvLyBsaW1pdCB0aGUgbGVuZ3RoIHNvIHRoYXQgaXQgZG9lc24ndC5cclxuICAgICAgdGhpcy5sZW5ndGggPSBNYXRoLm1pbihcclxuICAgICAgICB0aGlzLmxlbmd0aCxcclxuICAgICAgICAoIHRoaXMucHJvcGFnYXRpb25MaW1pdCAtIHRoaXMuc3RhcnRQb2ludC55ICkgLyB0aGlzLnByb3BhZ2F0aW9uRGlyZWN0aW9uLnlcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIElmIHRoZXJlIGFyZSBhdHRlbnVhdG9ycyBhbmQgYW5jaG9yZWQgaW50ZW5zaXR5IGNoYW5nZXMgb24gdGhpcyB3YXZlLCBkZWNyZWFzZSB0aGVpciBkaXN0YW5jZSBmcm9tIHRoZSBzdGFydFxyXG4gICAgICAvLyBwb2ludCwgc2luY2UgdGhlIHdhdmUncyBzdGFydCBwb2ludCBoYXMgbW92ZWQgZm9yd2FyZCBhbmQgdGhlIGF0dGVudWF0b3JzIGRvbid0IG1vdmUgd2l0aCBpdC5cclxuICAgICAgdGhpcy5tb2RlbE9iamVjdFRvQXR0ZW51YXRvck1hcC5mb3JFYWNoKCBhdHRlbnVhdG9yID0+IHtcclxuICAgICAgICBhdHRlbnVhdG9yLmRpc3RhbmNlRnJvbVN0YXJ0IC09IHByb3BhZ2F0aW9uRGlzdGFuY2U7XHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5pbnRlbnNpdHlDaGFuZ2VzLmZvckVhY2goIGludGVuc2l0eUNoYW5nZSA9PiB7XHJcbiAgICAgICAgaWYgKCBpbnRlbnNpdHlDaGFuZ2UuYW5jaG9yZWRUbyApIHtcclxuICAgICAgICAgIGludGVuc2l0eUNoYW5nZS5kaXN0YW5jZUZyb21TdGFydCAtPSBwcm9wYWdhdGlvbkRpc3RhbmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbW92ZSBhdHRlbnVhdG9ycyBhbmQgYXNzb2NpYXRlZCBpbnRlbnNpdHkgY2hhbmdlcyB0aGF0IGFyZSBubyBsb25nZXIgb24gdGhlIHdhdmUgYmVjYXVzZSB0aGUgd2F2ZSBoYXMgcGFzc2VkXHJcbiAgICAvLyBlbnRpcmVseSB0aHJvdWdoIHRoZW0uXHJcbiAgICB0aGlzLm1vZGVsT2JqZWN0VG9BdHRlbnVhdG9yTWFwLmZvckVhY2goICggYXR0ZW51YXRvciwgbW9kZWxFbGVtZW50ICkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIGF0dGVudWF0b3IuZGlzdGFuY2VGcm9tU3RhcnQgPD0gMCApIHtcclxuXHJcbiAgICAgICAgICAvLyBSZW1vdmUgdGhlIGF0dGVudWF0b3IuXHJcbiAgICAgICAgICB0aGlzLnJlbW92ZUF0dGVudWF0b3IoIG1vZGVsRWxlbWVudCApO1xyXG5cclxuICAgICAgICAgIC8vIFNldCB0aGUgaW50ZW5zaXR5IGF0IHRoZSBzdGFydCB0byBiZSB0aGUgYXR0ZW51YXRlZCB2YWx1ZS5cclxuICAgICAgICAgIHRoaXMuaW50ZW5zaXR5QXRTdGFydCA9IHRoaXMuaW50ZW5zaXR5QXRTdGFydCAqICggMSAtIGF0dGVudWF0b3IuYXR0ZW51YXRpb24gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gQWRqdXN0IHRoZSBpbnRlbnNpdHkgY2hhbmdlcyBiYXNlZCBvbiB0aGVpciByZWxhdGlvbnNoaXBzIHdpdGggdGhlIGF0dGVudWF0b3JzLlxyXG4gICAgdGhpcy5pbnRlbnNpdHlDaGFuZ2VzLmZvckVhY2goIGludGVuc2l0eUNoYW5nZSA9PiB7XHJcblxyXG4gICAgICBpZiAoIGludGVuc2l0eUNoYW5nZS5hbmNob3JlZFRvICkge1xyXG4gICAgICAgIGNvbnN0IGF0dGVudWF0b3IgPSB0aGlzLm1vZGVsT2JqZWN0VG9BdHRlbnVhdG9yTWFwLmdldCggaW50ZW5zaXR5Q2hhbmdlLmFuY2hvcmVkVG8gKTtcclxuXHJcbiAgICAgICAgLy8gc3RhdGUgY2hlY2tpbmdcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhdHRlbnVhdG9yLCAnVGhlcmUgc2hvdWxkIGFsd2F5cyBiZSBhbiBhdHRlbnVhdG9yIGZvciBhbiBhbmNob3JlZCBpbnRlbnNpdHkgY2hhbmdlLicgKTtcclxuXHJcbiAgICAgICAgY29uc3QgaW50ZW5zaXR5QXRJbnB1dFRvQXR0ZW51YXRvciA9IHRoaXMuZ2V0SW50ZW5zaXR5QXREaXN0YW5jZSggYXR0ZW51YXRvciEuZGlzdGFuY2VGcm9tU3RhcnQgKTtcclxuICAgICAgICBpbnRlbnNpdHlDaGFuZ2UucG9zdENoYW5nZUludGVuc2l0eSA9IGludGVuc2l0eUF0SW5wdXRUb0F0dGVudWF0b3IgKiAoIDEgLSBhdHRlbnVhdG9yIS5hdHRlbnVhdGlvbiApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBJZiB0aGlzIGludGVuc2l0eSBjaGFuZ2UgY3Jvc3NlZCBhbiBhdHRlbnVhdG9yLCBpdHMgb3V0cHV0IGludGVuc2l0eSBuZWVkcyB0byBiZSBhZGp1c3RlZC5cclxuICAgICAgICBjb25zdCBjcm9zc2VkQXR0ZW51YXRvciA9IEFycmF5LmZyb20oIHRoaXMubW9kZWxPYmplY3RUb0F0dGVudWF0b3JNYXAudmFsdWVzKCkgKS5maW5kKCBhdHRlbnVhdG9yID0+XHJcbiAgICAgICAgICBpbnRlbnNpdHlDaGFuZ2UuZGlzdGFuY2VGcm9tU3RhcnQgPiBhdHRlbnVhdG9yLmRpc3RhbmNlRnJvbVN0YXJ0ICYmXHJcbiAgICAgICAgICBpbnRlbnNpdHlDaGFuZ2UuZGlzdGFuY2VGcm9tU3RhcnQgLSBwcm9wYWdhdGlvbkRpc3RhbmNlIDwgYXR0ZW51YXRvci5kaXN0YW5jZUZyb21TdGFydFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmICggY3Jvc3NlZEF0dGVudWF0b3IgKSB7XHJcbiAgICAgICAgICBpbnRlbnNpdHlDaGFuZ2UucG9zdENoYW5nZUludGVuc2l0eSA9IGludGVuc2l0eUNoYW5nZS5wb3N0Q2hhbmdlSW50ZW5zaXR5ICpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCAxIC0gY3Jvc3NlZEF0dGVudWF0b3IuYXR0ZW51YXRpb24gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGp1c3QgZWFjaCBvZiB0aGUgaW50ZW5zaXR5IGNoYW5nZXMgdGhhdCBpcyBhc3NvY2lhdGVkIHdpdGggYW4gYXR0ZW51YXRvciBiYXNlZCBvbiB0aGUgYXR0ZW51YXRpb24gdmFsdWUgYW5kXHJcbiAgICAvLyB0aGUgaW50ZW5zaXR5IG9mIHRoZSBpbmNvbWluZyB3YXZlLCB3aGljaCBjb3VsZCBoYXZlIGNoYW5nZWQgc2luY2UgdGhlIGxhc3Qgc3RlcC5cclxuICAgIHRoaXMuaW50ZW5zaXR5Q2hhbmdlcy5maWx0ZXIoIGludGVuc2l0eUNoYW5nZSA9PiBpbnRlbnNpdHlDaGFuZ2UuYW5jaG9yZWRUbyApLmZvckVhY2goIGFuY2hvcmVkSW50ZW5zaXR5Q2hhbmdlID0+IHtcclxuICAgICAgY29uc3QgYXR0ZW51YXRvciA9IHRoaXMubW9kZWxPYmplY3RUb0F0dGVudWF0b3JNYXAuZ2V0KCBhbmNob3JlZEludGVuc2l0eUNoYW5nZS5hbmNob3JlZFRvISApO1xyXG5cclxuICAgICAgLy8gc3RhdGUgY2hlY2tpbmdcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYXR0ZW51YXRvciwgJ1RoZXJlIHNob3VsZCBhbHdheXMgYmUgYW4gYXR0ZW51YXRvciBmb3IgYW4gYW5jaG9yZWQgaW50ZW5zaXR5IGNoYW5nZS4nICk7XHJcblxyXG4gICAgICBjb25zdCBpbnRlbnNpdHlBdElucHV0VG9BdHRlbnVhdG9yID0gdGhpcy5nZXRJbnRlbnNpdHlBdERpc3RhbmNlKCBhdHRlbnVhdG9yIS5kaXN0YW5jZUZyb21TdGFydCApO1xyXG4gICAgICBhbmNob3JlZEludGVuc2l0eUNoYW5nZS5wb3N0Q2hhbmdlSW50ZW5zaXR5ID0gaW50ZW5zaXR5QXRJbnB1dFRvQXR0ZW51YXRvciAqICggMSAtIGF0dGVudWF0b3IhLmF0dGVudWF0aW9uICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUmVtb3ZlIGFueSBpbnRlbnNpdHkgY2hhbmdlcyB0aGF0IGFyZSBub3cgb2ZmIG9mIHRoZSB3YXZlLlxyXG4gICAgdGhpcy5pbnRlbnNpdHlDaGFuZ2VzID0gdGhpcy5pbnRlbnNpdHlDaGFuZ2VzLmZpbHRlcihcclxuICAgICAgaW50ZW5zaXR5Q2hhbmdlID0+IGludGVuc2l0eUNoYW5nZS5kaXN0YW5jZUZyb21TdGFydCA8IHRoaXMubGVuZ3RoXHJcbiAgICApO1xyXG5cclxuICAgIC8vIFNvcnQgdGhlIGludGVuc2l0eSBjaGFuZ2VzLiAgVGhpcyBpcyBuZWNlc3NhcnkgZm9yIGNvcnJlY3QgcmVuZGVyaW5nIGluIHRoZSB2aWV3LlxyXG4gICAgdGhpcy5zb3J0SW50ZW5zaXR5Q2hhbmdlcygpO1xyXG5cclxuICAgIC8vIFVwZGF0ZSBvdGhlciBhc3BlY3RzIG9mIHRoZSB3YXZlIHRoYXQgZXZvbHZlIG92ZXIgdGltZS5cclxuICAgIHRoaXMucGhhc2VPZmZzZXRBdE9yaWdpbiA9IHRoaXMucGhhc2VPZmZzZXRBdE9yaWdpbiArIFBIQVNFX1JBVEUgKiBkdDtcclxuICAgIGlmICggdGhpcy5waGFzZU9mZnNldEF0T3JpZ2luID4gVFdPX1BJICkge1xyXG4gICAgICB0aGlzLnBoYXNlT2Zmc2V0QXRPcmlnaW4gLT0gVFdPX1BJO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMucGhhc2VPZmZzZXRBdE9yaWdpbiA8IDAgKSB7XHJcbiAgICAgIHRoaXMucGhhc2VPZmZzZXRBdE9yaWdpbiArPSBUV09fUEk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmV4aXN0ZW5jZVRpbWUgKz0gZHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGFsdGl0dWRlIGF0IHdoaWNoIHRoaXMgd2F2ZSBlbmRzLiAgVGhpcyBjYW4gYmUgdXNlZCBpbnN0ZWFkIG9mIGdldEVuZFBvaW50IHdoZW4gb25seSB0aGUgZW5kIGFsdGl0dWRlIGlzXHJcbiAgICogbmVlZGVkLCBzaW5jZSBpdCBkb2Vzbid0IGFsbG9jYXRlIGEgdmVjdG9yIGFuZCBtYXkgdGh1cyBoYXZlIGJldHRlciBwZXJmb3JtYW5jZS4gIFRoaXMgdHJlYXRzIHRoZSB3YXZlIGFzIGEgbGluZVxyXG4gICAqIGFuZCBkb2VzIG5vdCBhY2NvdW50IGZvciBhbnkgYW1wbGl0dWRlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRFbmRBbHRpdHVkZSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuc3RhcnRQb2ludC55ICsgdGhpcy5sZW5ndGggKiB0aGlzLnByb3BhZ2F0aW9uRGlyZWN0aW9uLnk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSB2ZWN0b3IgdGhhdCByZXByZXNlbnRzIHRoZSBlbmQgcG9pbnQgb2YgdGhpcyB3YXZlLiAgVGhpcyBkb2VzIG5vdCBhY2NvdW50IGZvciBhbnkgYW1wbGl0dWRlIG9mIHRoZSB3YXZlLCBhbmRcclxuICAgKiBqdXN0IHRyZWF0cyBpdCBhcyBhIGxpbmUgYmV0d2VlbiB0d28gcG9pbnRzLiAgSWYgYSB2ZWN0b3IgaXMgcHJvdmlkZWQsIG5vbmUgaXMgYWxsb2NhdGVkLiAgVGhpcyBjYW4gaGVscCB0byByZWR1Y2VcclxuICAgKiB0aGUgbnVtYmVyIG9mIG1lbW9yeSBhbGxvY2F0aW9ucy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RW5kUG9pbnQoIHZlY3RvclRvVXNlPzogVmVjdG9yMiApOiBWZWN0b3IyIHtcclxuICAgIGNvbnN0IGVuZFBvaW50VmVjdG9yID0gdmVjdG9yVG9Vc2UgfHwgbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIGVuZFBvaW50VmVjdG9yLnNldFhZKFxyXG4gICAgICB0aGlzLnN0YXJ0UG9pbnQueCArIHRoaXMucHJvcGFnYXRpb25EaXJlY3Rpb24ueCAqIHRoaXMubGVuZ3RoLFxyXG4gICAgICB0aGlzLnN0YXJ0UG9pbnQueSArIHRoaXMucHJvcGFnYXRpb25EaXJlY3Rpb24ueSAqIHRoaXMubGVuZ3RoXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIGVuZFBvaW50VmVjdG9yO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBpbnRlbnNpdHkgb2YgdGhlIHdhdmUgYXQgdGhlIHNwZWNpZmllZCBkaXN0YW5jZSBmcm9tIHRoZSBzdGFydGluZyBwb2ludC5cclxuICAgKiBAcGFyYW0gZGlzdGFuY2VGcm9tU3RhcnQgLSBpbiBtZXRlcnNcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0SW50ZW5zaXR5QXREaXN0YW5jZSggZGlzdGFuY2VGcm9tU3RhcnQ6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgbGV0IGludGVuc2l0eSA9IHRoaXMuaW50ZW5zaXR5QXRTdGFydDtcclxuXHJcbiAgICAvLyBNb3ZlIHRocm91Z2ggdGhlIGludGVuc2l0eSBjaGFuZ2VzIGFuZCBmaW5kIHRoZSBsYXN0IG9uZSBiZWZvcmUgdGhlIHNwZWNpZmllZCBkaXN0YW5jZS4gIFRoaXMgd2lsbCBwcm92aWRlIHRoZVxyXG4gICAgLy8gaW50ZW5zaXR5IHZhbHVlIG5lZWRlZC4gIFRoaXMgaXMgc2V0IHVwIHRvIE5PVCBpbmNsdWRlIGFueSBpbnRlbnNpdHkgY2hhbmdlcyBhdCB0aGUgZXhhY3QgcHJvdmlkZWQgZGlzdGFuY2UuXHJcbiAgICAvLyBJbiBvdGhlciB3b3JkcywgaW50ZW5zaXR5IGNoYW5nZXMgb25seSB0YWtlIGVmZmVjdCBBRlRFUiB0aGVpciBwb3NpdGlvbiwgbm90IGV4YWN0bHkgQVQgdGhlaXIgcG9zaXRpb24uICBBbHNvXHJcbiAgICAvLyBub3RlIHRoYXQgdGhpcyBhbGdvcml0aG0gYXNzdW1lcyB0aGUgaW50ZW5zaXR5IGNoYW5nZXMgYXJlIG9yZGVyZWQgYnkgdGhlaXIgZGlzdGFuY2UgZnJvbSB0aGUgd2F2ZXMgc3RhcnRpbmdcclxuICAgIC8vIHBvaW50LlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5pbnRlbnNpdHlDaGFuZ2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBpbnRlbnNpdHlDaGFuZ2UgPSB0aGlzLmludGVuc2l0eUNoYW5nZXNbIGkgXTtcclxuICAgICAgaWYgKCBpbnRlbnNpdHlDaGFuZ2UuZGlzdGFuY2VGcm9tU3RhcnQgPCBkaXN0YW5jZUZyb21TdGFydCApIHtcclxuICAgICAgICBpbnRlbnNpdHkgPSBpbnRlbnNpdHlDaGFuZ2UucG9zdENoYW5nZUludGVuc2l0eTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gV2UncmUgZG9uZS5cclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGludGVuc2l0eTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgaW50ZW5zaXR5IG9mIHRoaXMgd2F2ZSBhdCB0aGUgc3BlY2lmaWVkIGFsdGl0dWRlLlxyXG4gICAqIEBwYXJhbSBhbHRpdHVkZSAtIGluIG1ldGVyc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRJbnRlbnNpdHlBdEFsdGl0dWRlKCBhbHRpdHVkZTogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBjb25zdCBkaXN0YW5jZUZyb21TdGFydCA9IE1hdGguYWJzKCBhbHRpdHVkZSAvIE1hdGguc2luKCB0aGlzLnByb3BhZ2F0aW9uRGlyZWN0aW9uLmdldEFuZ2xlKCkgKSApO1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0SW50ZW5zaXR5QXREaXN0YW5jZSggZGlzdGFuY2VGcm9tU3RhcnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgaW50ZW5zaXR5IGF0IHRoZSBzdGFydCBvZiB0aGUgd2F2ZS5cclxuICAgKiBAcGFyYW0gaW50ZW5zaXR5IC0gYSBub3JtYWxpemVkIGludGVuc2l0eSB2YWx1ZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRJbnRlbnNpdHlBdFN0YXJ0KCBpbnRlbnNpdHk6IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBwYXJhbWV0ZXIgY2hlY2tpbmdcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGludGVuc2l0eSA+IDAgJiYgaW50ZW5zaXR5IDw9IDEsICdpbGxlZ2FsIGludGVuc2l0eSB2YWx1ZScgKTtcclxuXHJcbiAgICAvLyBPbmx5IHBheSBhdHRlbnRpb24gdG8gdGhpcyByZXF1ZXN0IHRvIHNldCB0aGUgaW50ZW5zaXR5IGlmIGl0IGlzIGEgc2lnbmlmaWNhbnQgZW5vdWdoIGNoYW5nZS4gIFRoaXMgaGVscHMgdG9cclxuICAgIC8vIHByZXZlbnQgaGF2aW5nIGFuIGV4Y2VzcyBvZiBpbnRlbnNpdHkgY2hhbmdlcyBvbiB0aGUgd2F2ZSwgd2hpY2ggd2FzIGZvdW5kIHRvIGNhdXNlIHJlbmRlcmluZyBwcm9ibGVtcywgYm90aCBpblxyXG4gICAgLy8gYXBwZWFyYW5jZSBhbmQgcGVyZm9ybWFuY2UuICBTbWFsbCBjaGFuZ2VzIGFyZSBxdWlldGx5IGlnbm9yZWQuXHJcbiAgICBpZiAoIE1hdGguYWJzKCB0aGlzLmludGVuc2l0eUF0U3RhcnQgLSBpbnRlbnNpdHkgKSA+PSBNSU5JTVVNX0lOVEVOU0lUWV9DSEFOR0UgKSB7XHJcblxyXG4gICAgICAvLyBTZWUgaWYgdGhlcmUgaXMgYW4gaW50ZW5zaXR5IGNoYW5nZSB3aXRoaW4gdGhlIG1heCBkaXN0YW5jZSBmb3IgY29uc29saWRhdGlvbi5cclxuICAgICAgY29uc3QgZmlyc3RJbnRlbnNpdHlDaGFuZ2UgPSB0aGlzLmludGVuc2l0eUNoYW5nZXNbIDAgXTtcclxuICAgICAgaWYgKCBmaXJzdEludGVuc2l0eUNoYW5nZSAmJiBmaXJzdEludGVuc2l0eUNoYW5nZS5kaXN0YW5jZUZyb21TdGFydCA8IE1JTklNVU1fSU5URVJfSU5URU5TSVRZX0NIQU5HRV9ESVNUQU5DRSApIHtcclxuXHJcbiAgICAgICAgLy8gVXNlIHRoaXMgaW50ZW5zaXR5IGNoYW5nZSBpbnN0ZWFkIG9mIGNyZWF0aW5nIGEgbmV3IG9uZS4gIFRoaXMgaGVscHMgdG8gcHJldmVudCB0aGVyZSBmcm9tIGJlaW5nIHRvbyBtYW55XHJcbiAgICAgICAgLy8gaW50ZW5zaXR5IGNoYW5nZXMgb24gdGhlIHdhdmUsIHdoaWNoIGNhbiBjYXVzZSByZW5kZXJpbmcgaXNzdWVzLlxyXG4gICAgICAgIGZpcnN0SW50ZW5zaXR5Q2hhbmdlLnBvc3RDaGFuZ2VJbnRlbnNpdHkgPSB0aGlzLmludGVuc2l0eUF0U3RhcnQ7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhIG5ldyBpbnRlbnNpdHkgd2F2ZSB0byBkZXBpY3QgdGhlIGNoYW5nZSBpbiBpbnRlbnNpdHkgdHJhdmVsaW5nIHdpdGggdGhlIHdhdmUuXHJcbiAgICAgICAgdGhpcy5pbnRlbnNpdHlDaGFuZ2VzLnB1c2goIG5ldyBXYXZlSW50ZW5zaXR5Q2hhbmdlKCB0aGlzLmludGVuc2l0eUF0U3RhcnQsIElOVEVOU0lUWV9DSEFOR0VfRElTVEFOQ0VfQlVNUCApICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNldCB0aGUgbmV3IGludGVuc2l0eSB2YWx1ZSBhdCB0aGUgc3RhcnQuXHJcbiAgICAgIHRoaXMuaW50ZW5zaXR5QXRTdGFydCA9IGludGVuc2l0eTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBkaXN0YW5jZUZyb21TdGFydFxyXG4gICAqIEBwYXJhbSBhdHRlbnVhdGlvbkFtb3VudFxyXG4gICAqIEBwYXJhbSBjYXVzYWxNb2RlbEVsZW1lbnQgLSB0aGUgbW9kZWwgZWxlbWVudCB0aGF0IGlzIGNhdXNpbmcgdGhpcyBhdHRlbnVhdGlvbiB0byBleGlzdFxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRBdHRlbnVhdG9yKCBkaXN0YW5jZUZyb21TdGFydDogbnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRlbnVhdGlvbkFtb3VudDogbnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXVzYWxNb2RlbEVsZW1lbnQ6IFBoZXRpb09iamVjdCApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBwYXJhbWV0ZXIgY2hlY2tpbmdcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICBhdHRlbnVhdGlvbkFtb3VudCA+PSAwICYmIGF0dGVudWF0aW9uQW1vdW50IDw9IDEsXHJcbiAgICAgICd0aGUgYXR0ZW51YXRpb24gYW1vdW50IG11c3QgYmUgYmV0d2VlbiB6ZXJvIGFuZCBvbmUnXHJcbiAgICApO1xyXG5cclxuICAgIC8vIHN0YXRlIGNoZWNraW5nXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgICAhdGhpcy5tb2RlbE9iamVjdFRvQXR0ZW51YXRvck1hcC5oYXMoIGNhdXNhbE1vZGVsRWxlbWVudCApLFxyXG4gICAgICAndGhpcyB3YXZlIGFscmVhZHkgaGFzIHRoaXMgYXR0ZW51YXRvcidcclxuICAgICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGFuZCBhZGQgdGhlIG5ldyBhdHRlbnVhdG9yLlxyXG4gICAgdGhpcy5tb2RlbE9iamVjdFRvQXR0ZW51YXRvck1hcC5zZXQoXHJcbiAgICAgIGNhdXNhbE1vZGVsRWxlbWVudCxcclxuICAgICAgbmV3IFdhdmVBdHRlbnVhdG9yKCBhdHRlbnVhdGlvbkFtb3VudCwgZGlzdGFuY2VGcm9tU3RhcnQgKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGludGVuc2l0eSBjaGFuZ2Ugb24gdGhlIHdhdmUgdGhhdCBpcyBjYXVzZWQgYnkgdGhpcyBuZXcgYXR0ZW51YXRvci4gIFRoaXMgd2lsbCBiZSBhbmNob3JlZCB0byB0aGVcclxuICAgIC8vIG1vZGVsIG9iamVjdCB0aGF0IGlzIGNhdXNpbmcgdGhlIGF0dGVudWF0aW9uIGFuZCB3aWxsIG5vdCBwcm9wYWdhdGUgd2l0aCB0aGUgd2F2ZS5cclxuICAgIHRoaXMuaW50ZW5zaXR5Q2hhbmdlcy5wdXNoKCBuZXcgV2F2ZUludGVuc2l0eUNoYW5nZShcclxuICAgICAgdGhpcy5nZXRJbnRlbnNpdHlBdERpc3RhbmNlKCBkaXN0YW5jZUZyb21TdGFydCApICogKCAxIC0gYXR0ZW51YXRpb25BbW91bnQgKSxcclxuICAgICAgZGlzdGFuY2VGcm9tU3RhcnQsXHJcbiAgICAgIGNhdXNhbE1vZGVsRWxlbWVudFxyXG4gICAgKSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSBpbnRlbnNpdHkgY2hhbmdlIHRoYXQgcmVwcmVzZW50cyB0aGlzIHdhdmUncyBpbnRlbnNpdHkgYmV5b25kIHRoZSBuZXcgYXR0ZW51YXRvci4gIFRoaXMgb25lXHJcbiAgICAvLyB3aWxsIHByb3BhZ2F0ZSB3aXRoIHRoZSB3YXZlLiAgV2UgZG9uJ3Qgd2FudCB0aGlzIHRvIGJlIGF0IHRoZSBleGFjdCBzYW1lIGRpc3RhbmNlIGFzIHRoZSBpbnRlbnNpdHkgY2hhbmdlIHRoYXRcclxuICAgIC8vIHdpbGwgYmUgY2F1c2VkIGJ5IHRoZSBhdHRlbnVhdG9yLCBzbyBwdXQgaXQgYSBmZXcgbWV0ZXJzIGJleW9uZCB0aGlzIGN1cnJlbnQgZGlzdGFuY2UuXHJcbiAgICB0aGlzLmludGVuc2l0eUNoYW5nZXMucHVzaCggbmV3IFdhdmVJbnRlbnNpdHlDaGFuZ2UoXHJcbiAgICAgIHRoaXMuZ2V0SW50ZW5zaXR5QXREaXN0YW5jZSggZGlzdGFuY2VGcm9tU3RhcnQgKSxcclxuICAgICAgZGlzdGFuY2VGcm9tU3RhcnQgKyBJTlRFTlNJVFlfQ0hBTkdFX0RJU1RBTkNFX0JVTVBcclxuICAgICkgKTtcclxuXHJcbiAgICAvLyBTb3J0IHRoZSBpbnRlbnNpdHkgY2hhbmdlcy4gIFRoaXMgaXMgbmVjZXNzYXJ5IGZvciBjb3JyZWN0IHJlbmRlcmluZyBpbiB0aGUgdmlldy5cclxuICAgIHRoaXMuc29ydEludGVuc2l0eUNoYW5nZXMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSB0aGUgYXR0ZW51YXRvciBhc3NvY2lhdGVkIHdpdGggdGhlIHByb3ZpZGVkIG1vZGVsIGVsZW1lbnQuXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZUF0dGVudWF0b3IoIGNhdXNhbE1vZGVsRWxlbWVudDogUGhldGlvT2JqZWN0ICk6IHZvaWQge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgIHRoaXMubW9kZWxPYmplY3RUb0F0dGVudWF0b3JNYXAuaGFzKCBjYXVzYWxNb2RlbEVsZW1lbnQgKSxcclxuICAgICAgJ25vIGF0dGVudWF0b3IgZXhpc3RzIGZvciB0aGUgcHJvdmlkZWQgbW9kZWwgZWxlbWVudCdcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgYXR0ZW51YXRvciA9IHRoaXMubW9kZWxPYmplY3RUb0F0dGVudWF0b3JNYXAuZ2V0KCBjYXVzYWxNb2RlbEVsZW1lbnQgKTtcclxuXHJcbiAgICAvLyBSZW1vdmUgdGhlIGF0dGVudWF0b3IgZnJvbSB0aGUgbWFwLlxyXG4gICAgdGhpcy5tb2RlbE9iamVjdFRvQXR0ZW51YXRvck1hcC5kZWxldGUoIGNhdXNhbE1vZGVsRWxlbWVudCApO1xyXG5cclxuICAgIC8vIEdldCB0aGUgaW50ZW5zaXR5IGNoYW5nZSBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoaXMgYXR0ZW51YXRvci5cclxuICAgIGNvbnN0IGFzc29jaWF0ZWRJbnRlbnNpdHlDaGFuZ2UgPSB0aGlzLmludGVuc2l0eUNoYW5nZXMuZmluZChcclxuICAgICAgaW50ZW5zaXR5Q2hhbmdlID0+IGludGVuc2l0eUNoYW5nZS5hbmNob3JlZFRvID09PSBjYXVzYWxNb2RlbEVsZW1lbnRcclxuICAgICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhc3NvY2lhdGVkSW50ZW5zaXR5Q2hhbmdlLCAnbm8gaW50ZW5zaXR5IGNoYW5nZSBmb3VuZCBmb3IgdGhpcyBtb2RlbCBlbGVtZW50JyApO1xyXG5cclxuICAgIC8vIElmIHRoZSBpbnRlbnNpdHkgY2hhbmdlIGlzIHN0aWxsIG9uIHRoZSB3YXZlLCBmcmVlIGl0IHRvIHByb3BhZ2F0ZSBhbG9uZyB0aGUgd2F2ZS4gIElmIG5vdCwgc2ltcGx5IHJlbW92ZSBpdC5cclxuICAgIGlmICggYXNzb2NpYXRlZEludGVuc2l0eUNoYW5nZSEuZGlzdGFuY2VGcm9tU3RhcnQgPiAwICYmIGFzc29jaWF0ZWRJbnRlbnNpdHlDaGFuZ2UhLmRpc3RhbmNlRnJvbVN0YXJ0IDwgdGhpcy5sZW5ndGggKSB7XHJcblxyXG4gICAgICAvLyBCZWZvcmUgZnJlZWluZyB0aGlzIGludGVuc2l0eSBjaGFuZ2UsIG1ha2Ugc3VyZSBpdCBpcyBhdCB0aGUgcmlnaHQgdmFsdWUuXHJcbiAgICAgIGFzc29jaWF0ZWRJbnRlbnNpdHlDaGFuZ2UhLnBvc3RDaGFuZ2VJbnRlbnNpdHkgPSB0aGlzLmdldEludGVuc2l0eUF0RGlzdGFuY2UoIGF0dGVudWF0b3IhLmRpc3RhbmNlRnJvbVN0YXJ0ICkgKlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCAxIC0gYXR0ZW51YXRvciEuYXR0ZW51YXRpb24gKTtcclxuXHJcbiAgICAgIC8vIEZseSEgQmUgZnJlZSFcclxuICAgICAgYXNzb2NpYXRlZEludGVuc2l0eUNoYW5nZSEuYW5jaG9yZWRUbyA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFJlbW92ZSB0aGlzIGludGVuc2l0eSBjaGFuZ2UuXHJcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5pbnRlbnNpdHlDaGFuZ2VzLmluZGV4T2YoIGFzc29jaWF0ZWRJbnRlbnNpdHlDaGFuZ2UhICk7XHJcbiAgICAgIGlmICggaW5kZXggPiAtMSApIHtcclxuICAgICAgICB0aGlzLmludGVuc2l0eUNoYW5nZXMuc3BsaWNlKCBpbmRleCwgMSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEb2VzIHRoZSBwcm92aWRlZCBtb2RlbCBlbGVtZW50IGhhdmUgYW4gYXNzb2NpYXRlZCBhdHRlbnVhdG9yIG9uIHRoaXMgd2F2ZT9cclxuICAgKi9cclxuICBwdWJsaWMgaGFzQXR0ZW51YXRvciggbW9kZWxFbGVtZW50OiBQaGV0aW9PYmplY3QgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbE9iamVjdFRvQXR0ZW51YXRvck1hcC5oYXMoIG1vZGVsRWxlbWVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBhdHRlbnVhdGlvbiB2YWx1ZSBpbiB0aGUgYXR0ZW51YXRvciBhc3NvY2lhdGVkIHdpdGggdGhlIHByb3ZpZGVkIG1vZGVsIGVsZW1lbnQuXHJcbiAgICovXHJcbiAgcHVibGljIHNldEF0dGVudWF0aW9uKCBtb2RlbEVsZW1lbnQ6IFBoZXRpb09iamVjdCwgYXR0ZW51YXRpb246IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBzdGF0ZSBhbmQgcGFyYW1ldGVyIGNoZWNraW5nXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmhhc0F0dGVudWF0b3IoIG1vZGVsRWxlbWVudCApLCAnbm8gYXR0ZW51YXRvciBpcyBvbiB0aGlzIHdhdmUgZm9yIHRoaXMgbW9kZWwgZWxlbWVudCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGF0dGVudWF0aW9uID49IDAgJiYgYXR0ZW51YXRpb24gPD0gMSwgJ2ludmFsaWQgYXR0ZW51YXRpb24gdmFsdWUnICk7XHJcblxyXG4gICAgLy8gR2V0IHRoZSBhdHRlbnVhdG9yLlxyXG4gICAgY29uc3QgYXR0ZW51YXRvciA9IHRoaXMubW9kZWxPYmplY3RUb0F0dGVudWF0b3JNYXAuZ2V0KCBtb2RlbEVsZW1lbnQgKTtcclxuXHJcbiAgICAvLyBPbmx5IG1ha2UgY2hhbmdlcyB0byB0aGUgd2F2ZSBpZiB0aGUgYXR0ZW51YXRpb24gdmFsdWUgaXMgYWJvdmUgYSB0aHJlc2hvbGQuICBUaGlzIGhlbHBzIHRvIHByZXZlbnQgdG9vIG1hbnlcclxuICAgIC8vIGludGVuc2l0eSBjaGFuZ2VzIGZyb20gYmVpbmcgb24gdGhlIHdhdmUsIHdoaWNoIGNhbiBjYXVzZSBpc3N1ZXMgd2l0aCB0aGUgcmVuZGVyaW5nLCBib3RoIGluIHRlcm1zIG9mIGFwcGVhcmFuY2VcclxuICAgIC8vIGFuZCBwZXJmb3JtYW5jZS5cclxuICAgIGlmICggYXR0ZW51YXRvciAmJiBNYXRoLmFicyggYXR0ZW51YXRvci5hdHRlbnVhdGlvbiAtIGF0dGVudWF0aW9uICkgPj0gTUlOSU1VTV9JTlRFTlNJVFlfQ0hBTkdFICkge1xyXG5cclxuICAgICAgLy8gVXBkYXRlIHRoZSBhdHRlbnVhdGlvbiB2YWx1ZS5cclxuICAgICAgYXR0ZW51YXRvci5hdHRlbnVhdGlvbiA9IGF0dGVudWF0aW9uO1xyXG5cclxuICAgICAgLy8gR2V0IHRoZSBpbnRlbnNpdHkgY2hhbmdlIGN1cnJlbnRseSBhc3NvY2lhdGVkIHdpdGggdGhpcyBhdHRlbnVhdG9yLlxyXG4gICAgICBjb25zdCBhc3NvY2lhdGVkSW50ZW5zaXR5Q2hhbmdlID0gdGhpcy5pbnRlbnNpdHlDaGFuZ2VzLmZpbmQoXHJcbiAgICAgICAgaW50ZW5zaXR5Q2hhbmdlID0+IGludGVuc2l0eUNoYW5nZS5hbmNob3JlZFRvID09PSBtb2RlbEVsZW1lbnRcclxuICAgICAgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYXNzb2NpYXRlZEludGVuc2l0eUNoYW5nZSwgJ25vIGludGVuc2l0eSBjaGFuZ2UgZm91bmQgZm9yIHRoaXMgbW9kZWwgZWxlbWVudCcgKTtcclxuXHJcbiAgICAgIC8vIEZpbmQgdGhlIGZpcnN0IGludGVuc2l0eSBjaGFuZ2UgdGhhdCBpcyBvbiB0aGUgd2F2ZSBhZnRlciB0aGlzIGF0dGVudWF0b3IuXHJcbiAgICAgIGNvbnN0IG5leHRJbnRlbnNpdHlDaGFuZ2UgPSB0aGlzLmludGVuc2l0eUNoYW5nZXMuZmluZChcclxuICAgICAgICBpbnRlbnNpdHlDaGFuZ2UgPT4gaW50ZW5zaXR5Q2hhbmdlLmRpc3RhbmNlRnJvbVN0YXJ0ID4gYXR0ZW51YXRvci5kaXN0YW5jZUZyb21TdGFydFxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gSWYgdGhlIG5leHQgaW50ZW5zaXR5IGNoYW5nZSBpcyBjbG9zZSBlbm91Z2gsIGRvbid0IGJvdGhlciBhZGRpbmcgYW5vdGhlciBvbmUuICBUaGlzIHdpbGwgaGVscCB0byBwcmV2ZW50IHRoZXJlXHJcbiAgICAgIC8vIGZyb20gYmVpbmcgdG9vIG1hbnkgb24gdGhlIHdhdmUsIHNpbmNlIGhhdmluZyB0b28gbWFueSBjYW4gY2F1c2UgcmVuZGVyaW5nIGNoYWxsZW5nZXMuXHJcbiAgICAgIGlmICggIW5leHRJbnRlbnNpdHlDaGFuZ2UgfHxcclxuICAgICAgICAgICBuZXh0SW50ZW5zaXR5Q2hhbmdlLmRpc3RhbmNlRnJvbVN0YXJ0IC0gYXNzb2NpYXRlZEludGVuc2l0eUNoYW5nZSEuZGlzdGFuY2VGcm9tU3RhcnQgPiBNSU5JTVVNX0lOVEVSX0lOVEVOU0lUWV9DSEFOR0VfRElTVEFOQ0UgKSB7XHJcblxyXG4gICAgICAgIC8vIEEgbmV3IGludGVuc2l0eSBjaGFuZ2Ugd2lsbCBiZSBuZWVkIHRvIHJlcHJlc2VudCB0aGlzIGNoYW5nZSB0byB0aGUgYXR0ZW51YXRpb24uIEZyZWUgdGhlIGludGVuc2l0eSBjaGFuZ2VcclxuICAgICAgICAvLyBjdXJyZW50bHkgYXNzb2NpYXRlZCB3aXRoIHRoaXMgYXR0ZW51YXRvciB0byBwcm9wYWdhdGUgd2l0aCB0aGUgd2F2ZSwgc2luY2UgaXQgYWxyZWFkeSBoYXMgdGhlIGNvcnJlY3RcclxuICAgICAgICAvLyBpbnRlbnNpdHkgYXQgaXRzIG91dHB1dC5cclxuICAgICAgICBhc3NvY2lhdGVkSW50ZW5zaXR5Q2hhbmdlIS5hbmNob3JlZFRvID0gbnVsbDtcclxuXHJcbiAgICAgICAgLy8gQnVtcCB0aGlzIGludGVuc2l0eSBjaGFuZ2UgZG93biB0aGUgd2F2ZSBhIGJpdCBzbyB0aGF0IGl0IHdvbid0IGJlIG9uIHRvcCBvZiB0aGUgb25lIHRoYXQgaXMgYWJvdXQgdG8gYmUgY3JlYXRlZC5cclxuICAgICAgICBhc3NvY2lhdGVkSW50ZW5zaXR5Q2hhbmdlIS5kaXN0YW5jZUZyb21TdGFydCArPSBJTlRFTlNJVFlfQ0hBTkdFX0RJU1RBTkNFX0JVTVA7XHJcblxyXG4gICAgICAgIC8vIEFkZCBhIG5ldyBpbnRlbnNpdHkgY2hhbmdlIHRoYXQgaXMgYW5jaG9yZWQgdG8gdGhlIG1vZGVsIGVsZW1lbnQgYW5kIGlzIGJhc2VkIG9uIHRoZSBuZXcgYXR0ZW51YXRpb24gdmFsdWUuXHJcbiAgICAgICAgdGhpcy5pbnRlbnNpdHlDaGFuZ2VzLnB1c2goIG5ldyBXYXZlSW50ZW5zaXR5Q2hhbmdlKFxyXG4gICAgICAgICAgdGhpcy5nZXRJbnRlbnNpdHlBdERpc3RhbmNlKCBhdHRlbnVhdG9yLmRpc3RhbmNlRnJvbVN0YXJ0ICkgKiAoIDEgLSBhdHRlbnVhdG9yLmF0dGVudWF0aW9uICksXHJcbiAgICAgICAgICBhdHRlbnVhdG9yLmRpc3RhbmNlRnJvbVN0YXJ0LFxyXG4gICAgICAgICAgbW9kZWxFbGVtZW50XHJcbiAgICAgICAgKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgdGhlIGV4aXN0aW5nIGludGVuc2l0eSBjaGFuZ2UgYmFzZWQgb24gdGhlIG5ldyBhdHRlbnVhdGlvbiB2YWx1ZS5cclxuICAgICAgICBhc3NvY2lhdGVkSW50ZW5zaXR5Q2hhbmdlIS5wb3N0Q2hhbmdlSW50ZW5zaXR5ID0gdGhpcy5nZXRJbnRlbnNpdHlBdERpc3RhbmNlKCBhdHRlbnVhdG9yLmRpc3RhbmNlRnJvbVN0YXJ0ICkgKlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIDEgLSBhdHRlbnVhdG9yLmF0dGVudWF0aW9uICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgaW50ZW5zaXR5IGNoYW5nZXMgYXJlIGluIHRoZSByZXF1aXJlZCBvcmRlci5cclxuICAgICAgdGhpcy5zb3J0SW50ZW5zaXR5Q2hhbmdlcygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogdHJ1ZSBpZiB0aGUgd2F2ZSBoYXMgY29tcGxldGVseSBwcm9wYWdhdGVkIGFuZCBoYXMgbm90aGluZyBlbHNlIHRvIGRvXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBpc0NvbXBsZXRlbHlQcm9wYWdhdGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuc3RhcnRQb2ludC55ID09PSB0aGlzLnByb3BhZ2F0aW9uTGltaXQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGRldGVybWluaW5nIHdoZXRoZXIgdGhpcyBpcyBhIHZpc2libGUgcGhvdG9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBpc1Zpc2libGUoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy53YXZlbGVuZ3RoID09PSBHcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzLlZJU0lCTEVfV0FWRUxFTkdUSDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgZGV0ZXJtaW5pbmcgd2hldGhlciB0aGlzIGlzIGFuIGluZnJhcmVkIHBob3RvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgaXNJbmZyYXJlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLndhdmVsZW5ndGggPT09IEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuSU5GUkFSRURfV0FWRUxFTkdUSDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgd2F2ZSdzIHBoYXNlIGF0IHRoZSBzcGVjaWZpZWQgZGlzdGFuY2UgZnJvbSB0aGUgb3JpZ2luLlxyXG4gICAqIEBwYXJhbSBkaXN0YW5jZUZyb21PcmlnaW4gLSBpbiBtZXRlcnNcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UGhhc2VBdCggZGlzdGFuY2VGcm9tT3JpZ2luOiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIHJldHVybiAoIHRoaXMucGhhc2VPZmZzZXRBdE9yaWdpbiArICggZGlzdGFuY2VGcm9tT3JpZ2luIC8gdGhpcy5yZW5kZXJpbmdXYXZlbGVuZ3RoICkgKiBUV09fUEkgKSAlIFRXT19QSTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGxpc3Qgb2YgdGhlIGF0dGVudWF0b3JzIHRoYXQgYXJlIGN1cnJlbnRseSBvbiB0aGlzIHdhdmUgc29ydGVkIGZyb20gY2xvc2VzdCB0byB0aGUgc3RhcnQgcG9pbnQgdG8gZnVydGhlc3QuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFNvcnRlZEF0dGVudWF0b3JzKCk6IFdhdmVBdHRlbnVhdG9yW10ge1xyXG4gICAgcmV0dXJuIEFycmF5LmZyb20oIHRoaXMubW9kZWxPYmplY3RUb0F0dGVudWF0b3JNYXAudmFsdWVzKCkgKS5zb3J0KCAoIGF0dGVudWF0b3IxLCBhdHRlbnVhdG9yMiApID0+XHJcbiAgICAgIGF0dGVudWF0b3IxLmRpc3RhbmNlRnJvbVN0YXJ0IC0gYXR0ZW51YXRvcjIuZGlzdGFuY2VGcm9tU3RhcnRcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXJpYWxpemVzIHRoaXMgV2F2ZSBpbnN0YW5jZS5cclxuICAgKi9cclxuICBwdWJsaWMgdG9TdGF0ZU9iamVjdCgpOiBXYXZlU3RhdGVPYmplY3Qge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgd2F2ZWxlbmd0aDogdGhpcy53YXZlbGVuZ3RoLFxyXG4gICAgICBvcmlnaW46IFZlY3RvcjIuVmVjdG9yMklPLnRvU3RhdGVPYmplY3QoIHRoaXMub3JpZ2luICksXHJcbiAgICAgIHByb3BhZ2F0aW9uRGlyZWN0aW9uOiBWZWN0b3IyLlZlY3RvcjJJTy50b1N0YXRlT2JqZWN0KCB0aGlzLnByb3BhZ2F0aW9uRGlyZWN0aW9uICksXHJcbiAgICAgIHByb3BhZ2F0aW9uTGltaXQ6IHRoaXMucHJvcGFnYXRpb25MaW1pdCxcclxuICAgICAgc3RhcnRQb2ludDogVmVjdG9yMi5WZWN0b3IySU8udG9TdGF0ZU9iamVjdCggdGhpcy5zdGFydFBvaW50ICksXHJcbiAgICAgIGxlbmd0aDogdGhpcy5sZW5ndGgsXHJcbiAgICAgIGlzU291cmNlZDogdGhpcy5pc1NvdXJjZWQsXHJcbiAgICAgIGV4aXN0ZW5jZVRpbWU6IHRoaXMuZXhpc3RlbmNlVGltZSxcclxuICAgICAgcGhhc2VPZmZzZXRBdE9yaWdpbjogdGhpcy5waGFzZU9mZnNldEF0T3JpZ2luLFxyXG4gICAgICBpbnRlbnNpdHlBdFN0YXJ0OiB0aGlzLmludGVuc2l0eUF0U3RhcnQsXHJcbiAgICAgIGludGVuc2l0eUNoYW5nZXM6IEFycmF5SU8oIFdhdmVJbnRlbnNpdHlDaGFuZ2UuV2F2ZUludGVuc2l0eUNoYW5nZUlPICkudG9TdGF0ZU9iamVjdCggdGhpcy5pbnRlbnNpdHlDaGFuZ2VzICksXHJcbiAgICAgIG1vZGVsT2JqZWN0VG9BdHRlbnVhdG9yTWFwOiBNYXBJTyhcclxuICAgICAgICBSZWZlcmVuY2VJTyggSU9UeXBlLk9iamVjdElPICksXHJcbiAgICAgICAgV2F2ZUF0dGVudWF0b3IuV2F2ZUF0dGVudWF0b3JJTyApLnRvU3RhdGVPYmplY3QoIHRoaXMubW9kZWxPYmplY3RUb0F0dGVudWF0b3JNYXBcclxuICAgICAgKSxcclxuICAgICAgcmVuZGVyaW5nV2F2ZWxlbmd0aDogdGhpcy5yZW5kZXJpbmdXYXZlbGVuZ3RoXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXBwbHkgdGhlIGR5bmFtaWMgKG5vbi1pbW11dGFibGUpIHBvcnRpb24gb2YgdGhlIHdhdmUgc3RhdGUgdG8gdGhpcyBpbnN0YW5jZS5cclxuICAgKi9cclxuICBwdWJsaWMgYXBwbHlTdGF0ZSggc3RhdGVPYmplY3Q6IFdhdmVTdGF0ZU9iamVjdCApOiB2b2lkIHtcclxuICAgIHRoaXMubGVuZ3RoID0gc3RhdGVPYmplY3QubGVuZ3RoO1xyXG4gICAgdGhpcy5pc1NvdXJjZWQgPSBzdGF0ZU9iamVjdC5pc1NvdXJjZWQ7XHJcbiAgICB0aGlzLnN0YXJ0UG9pbnQuc2V0KCBWZWN0b3IyLlZlY3RvcjJJTy5mcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0LnN0YXJ0UG9pbnQgKSApO1xyXG4gICAgdGhpcy5leGlzdGVuY2VUaW1lID0gc3RhdGVPYmplY3QuZXhpc3RlbmNlVGltZTtcclxuICAgIHRoaXMucGhhc2VPZmZzZXRBdE9yaWdpbiA9IHN0YXRlT2JqZWN0LnBoYXNlT2Zmc2V0QXRPcmlnaW47XHJcbiAgICB0aGlzLmludGVuc2l0eUF0U3RhcnQgPSBzdGF0ZU9iamVjdC5pbnRlbnNpdHlBdFN0YXJ0O1xyXG4gICAgdGhpcy5pbnRlbnNpdHlDaGFuZ2VzID0gQXJyYXlJTyggV2F2ZUludGVuc2l0eUNoYW5nZS5XYXZlSW50ZW5zaXR5Q2hhbmdlSU8gKS5mcm9tU3RhdGVPYmplY3QoXHJcbiAgICAgIHN0YXRlT2JqZWN0LmludGVuc2l0eUNoYW5nZXNcclxuICAgICk7XHJcbiAgICB0aGlzLm1vZGVsT2JqZWN0VG9BdHRlbnVhdG9yTWFwID0gTWFwSU8oXHJcbiAgICAgIFJlZmVyZW5jZUlPKCBJT1R5cGUuT2JqZWN0SU8gKSxcclxuICAgICAgV2F2ZUF0dGVudWF0b3IuV2F2ZUF0dGVudWF0b3JJT1xyXG4gICAgKS5mcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0Lm1vZGVsT2JqZWN0VG9BdHRlbnVhdG9yTWFwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYWtlIHN1cmUgdGhlIGludGVuc2l0eSBjaGFuZ2VzIGFyZSBvcmRlcmVkIGZyb20gY2xvc2VzdCB0byBmdXJ0aGVzdCBmcm9tIHRoZSBzdGFydCBwb2ludCBvZiB0aGUgd2F2ZS5cclxuICAgKi9cclxuICBwcml2YXRlIHNvcnRJbnRlbnNpdHlDaGFuZ2VzKCk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLmludGVuc2l0eUNoYW5nZXMubGVuZ3RoID4gMSApIHtcclxuICAgICAgdGhpcy5pbnRlbnNpdHlDaGFuZ2VzLnNvcnQoICggYSwgYiApID0+IGEuZGlzdGFuY2VGcm9tU3RhcnQgLSBiLmRpc3RhbmNlRnJvbVN0YXJ0ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXYXZlSU8gaGFuZGxlcyBQaEVULWlPIHNlcmlhbGl6YXRpb24gb2YgV2F2ZS4gQmVjYXVzZSBzZXJpYWxpemF0aW9uIGludm9sdmVzIGFjY2Vzc2luZyBwcml2YXRlIG1lbWJlcnMsXHJcbiAgICogaXQgZGVsZWdhdGVzIHRvIFdhdmUuIFRoZSBtZXRob2RzIHRoYXQgV2F2ZUlPIG92ZXJyaWRlcyBhcmUgdHlwaWNhbCBvZiAnRHluYW1pYyBlbGVtZW50IHNlcmlhbGl6YXRpb24nLFxyXG4gICAqIGFzIGRlc2NyaWJlZCBpbiB0aGUgU2VyaWFsaXphdGlvbiBzZWN0aW9uIG9mXHJcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vYmxvYi9tYXN0ZXIvZG9jL3BoZXQtaW8taW5zdHJ1bWVudGF0aW9uLXRlY2huaWNhbC1ndWlkZS5tZCNzZXJpYWxpemF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBXYXZlSU8gPSBuZXcgSU9UeXBlPFdhdmUsIFdhdmVTdGF0ZU9iamVjdD4oICdXYXZlSU8nLCB7XHJcbiAgICB2YWx1ZVR5cGU6IFdhdmUsXHJcbiAgICBzdGF0ZVNjaGVtYToge1xyXG4gICAgICB3YXZlbGVuZ3RoOiBOdW1iZXJJTyxcclxuICAgICAgb3JpZ2luOiBWZWN0b3IyLlZlY3RvcjJJTyxcclxuICAgICAgcHJvcGFnYXRpb25EaXJlY3Rpb246IFZlY3RvcjIuVmVjdG9yMklPLFxyXG4gICAgICBwcm9wYWdhdGlvbkxpbWl0OiBOdW1iZXJJTyxcclxuICAgICAgc3RhcnRQb2ludDogVmVjdG9yMi5WZWN0b3IySU8sXHJcbiAgICAgIGxlbmd0aDogTnVtYmVySU8sXHJcbiAgICAgIGlzU291cmNlZDogQm9vbGVhbklPLFxyXG4gICAgICBleGlzdGVuY2VUaW1lOiBOdW1iZXJJTyxcclxuICAgICAgcGhhc2VPZmZzZXRBdE9yaWdpbjogTnVtYmVySU8sXHJcbiAgICAgIGludGVuc2l0eUF0U3RhcnQ6IE51bWJlcklPLFxyXG4gICAgICBpbnRlbnNpdHlDaGFuZ2VzOiBBcnJheUlPKCBXYXZlSW50ZW5zaXR5Q2hhbmdlLldhdmVJbnRlbnNpdHlDaGFuZ2VJTyApLFxyXG4gICAgICByZW5kZXJpbmdXYXZlbGVuZ3RoOiBOdW1iZXJJTyxcclxuICAgICAgbW9kZWxPYmplY3RUb0F0dGVudWF0b3JNYXA6IE1hcElPKCBSZWZlcmVuY2VJTyggSU9UeXBlLk9iamVjdElPICksIFdhdmVBdHRlbnVhdG9yLldhdmVBdHRlbnVhdG9ySU8gKVxyXG4gICAgfSxcclxuICAgIHRvU3RhdGVPYmplY3Q6ICggd2F2ZTogV2F2ZSApID0+IHdhdmUudG9TdGF0ZU9iamVjdCgpLFxyXG4gICAgYXBwbHlTdGF0ZTogKCB3YXZlOiBXYXZlLCBzdGF0ZU9iamVjdDogV2F2ZVN0YXRlT2JqZWN0ICkgPT4gd2F2ZS5hcHBseVN0YXRlKCBzdGF0ZU9iamVjdCApLFxyXG4gICAgc3RhdGVPYmplY3RUb0NyZWF0ZUVsZW1lbnRBcmd1bWVudHM6ICggc3RhdGU6IFdhdmVTdGF0ZU9iamVjdCApID0+IFtcclxuICAgICAgc3RhdGUud2F2ZWxlbmd0aCxcclxuICAgICAgVmVjdG9yMi5WZWN0b3IySU8uZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZS5vcmlnaW4gKSxcclxuICAgICAgVmVjdG9yMi5WZWN0b3IySU8uZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZS5wcm9wYWdhdGlvbkRpcmVjdGlvbiApLFxyXG4gICAgICBzdGF0ZS5wcm9wYWdhdGlvbkxpbWl0LFxyXG4gICAgICB7XHJcbiAgICAgICAgaW50ZW5zaXR5QXRTdGFydDogc3RhdGUuaW50ZW5zaXR5QXRTdGFydCxcclxuICAgICAgICBpbml0aWFsUGhhc2VPZmZzZXQ6IHN0YXRlLnBoYXNlT2Zmc2V0QXRPcmlnaW5cclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH0gKTtcclxufVxyXG5cclxudHlwZSBXYXZlU3RhdGVPYmplY3QgPSB7XHJcbiAgd2F2ZWxlbmd0aDogbnVtYmVyO1xyXG4gIG9yaWdpbjogVmVjdG9yMlN0YXRlT2JqZWN0O1xyXG4gIHByb3BhZ2F0aW9uRGlyZWN0aW9uOiBWZWN0b3IyU3RhdGVPYmplY3Q7XHJcbiAgcHJvcGFnYXRpb25MaW1pdDogbnVtYmVyO1xyXG4gIHN0YXJ0UG9pbnQ6IFZlY3RvcjJTdGF0ZU9iamVjdDtcclxuICBsZW5ndGg6IG51bWJlcjtcclxuICBpc1NvdXJjZWQ6IGJvb2xlYW47XHJcbiAgZXhpc3RlbmNlVGltZTogbnVtYmVyO1xyXG4gIHBoYXNlT2Zmc2V0QXRPcmlnaW46IG51bWJlcjtcclxuICBpbnRlbnNpdHlBdFN0YXJ0OiBudW1iZXI7XHJcbiAgaW50ZW5zaXR5Q2hhbmdlczogV2F2ZUludGVuc2l0eUNoYW5nZVN0YXRlT2JqZWN0W107XHJcbiAgbW9kZWxPYmplY3RUb0F0dGVudWF0b3JNYXA6IE1hcFN0YXRlT2JqZWN0PFJlZmVyZW5jZUlPU3RhdGUsIFdhdmVBdHRlbnVhdG9yU3RhdGVPYmplY3Q+O1xyXG4gIHJlbmRlcmluZ1dhdmVsZW5ndGg6IG51bWJlcjtcclxufTtcclxuXHJcbmdyZWVuaG91c2VFZmZlY3QucmVnaXN0ZXIoICdXYXZlJywgV2F2ZSApO1xyXG5leHBvcnQgZGVmYXVsdCBXYXZlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPQSxPQUFPLE1BQThCLCtCQUErQjtBQUMzRSxPQUFPQyxTQUFTLE1BQU0sdUNBQXVDO0FBRzdELE9BQU9DLFlBQVksTUFBK0IsdUNBQXVDO0FBQ3pGLE9BQU9DLE9BQU8sTUFBTSx3Q0FBd0M7QUFDNUQsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxPQUFPQyxNQUFNLE1BQU0sdUNBQXVDO0FBQzFELE9BQU9DLEtBQUssTUFBMEIsc0NBQXNDO0FBQzVFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQs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