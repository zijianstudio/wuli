// Copyright 2014-2023, University of Colorado Boulder

/**
 * type that represents a chunk of energy in the view
 *
 * @author John Blanco
 */

import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import EventType from '../../../../tandem/js/EventType.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyType from './EnergyType.js';

// static data
let instanceCount = 0; // counter for creating unique IDs

class EnergyChunk extends PhetioObject {
  /**
   * @param {EnergyType} initialEnergyType
   * @param {Vector2} initialPosition
   * @param {Vector2} initialVelocity
   * @param {BooleanProperty} visibleProperty
   * @param {Object} [options]
   */
  constructor(initialEnergyType, initialPosition, initialVelocity, visibleProperty, options) {
    options = merge({
      // {number} - The unique id of the chunk. Most often EnergyChunk set's it own. This should only be specified by
      // PhET-iO, to support PhET-iO state recreating exact instances.
      id: null,
      // phet-io
      tandem: Tandem.REQUIRED,
      phetioType: EnergyChunk.EnergyChunkIO,
      phetioDynamicElement: true
    }, options);
    super(options);

    // @public
    this.positionProperty = new Vector2Property(initialPosition, {
      valueComparisonStrategy: 'equalsFunction',
      tandem: options.tandem.createTandem('positionProperty'),
      phetioEventType: EventType.OPT_OUT
    });

    // @public - for simple 3D layering effects
    this.zPositionProperty = new NumberProperty(0, {
      tandem: options.tandem.createTandem('zPositionProperty')
    });

    // @public
    this.energyTypeProperty = new EnumerationDeprecatedProperty(EnergyType, initialEnergyType, {
      tandem: options.tandem.createTandem('energyTypeProperty')
    });

    // @public
    this.visibleProperty = visibleProperty;
    assert && Tandem.VALIDATION && this.isPhetioInstrumented() && assert(this.visibleProperty.isPhetioInstrumented(), 'if this EnergyChunk is instrumented, then the visibleProperty should be too');

    // @public (read-only) {number} - an ID that will be used to track this energy chunk
    this.id = options.id || instanceCount++;

    // @public (read-only) {Vector2} - for performance reasons, this is allocated once and should never be overwritten
    this.velocity = new Vector2(initialVelocity.x, initialVelocity.y);
  }

  // @public (EnergyChunkIO)
  toStateObject() {
    return {
      id: this.id,
      velocity: Vector2.Vector2IO.toStateObject(this.velocity),
      visiblePropertyReference: ReferenceIO(Property.PropertyIO(BooleanIO)).toStateObject(this.visibleProperty)
    };
  }

  // @public (EnergyChunkIO)
  static stateToArgsForConstructor(stateObject) {
    const visibleProperty = ReferenceIO(Property.PropertyIO(BooleanIO)).fromStateObject(stateObject.visiblePropertyReference);
    return [EnergyType.HIDDEN, Vector2.ZERO, Vector2.Vector2IO.fromStateObject(stateObject.velocity), visibleProperty, {
      id: stateObject.id
    }];
  }

  /**
   * set the position
   * @param {number} x
   * @param {number} y
   * @public
   */
  setPositionXY(x, y) {
    this.positionProperty.set(new Vector2(x, y));
  }

  /**
   * translate the energy chunk by amount specified
   * @param {number} x
   * @param {number} y
   * @public
   */
  translate(x, y) {
    this.positionProperty.set(this.positionProperty.get().plusXY(x, y));
  }

  /**
   * translate the energy chunk based on its velocity
   * @param {number} dt - delta time
   * @public
   */
  translateBasedOnVelocity(dt) {
    // When setting PhET-iO state, the EnergyChunk is already in its correct spot, so don't alter that based on Property
    // listeners, see https://github.com/phetsims/energy-forms-and-changes/issues/362
    if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
      this.translate(this.velocity.x * dt, this.velocity.y * dt);
    }
  }

  /**
   * set the X and Y velocity of the energy chunk
   * @param {number} x
   * @param {number} y
   * @public
   */
  setVelocityXY(x, y) {
    this.velocity.setXY(x, y);
  }

  /**
   * set the velocity of the energy chunk (using a vector)
   * @param {Vector2} newVelocity
   * @public
   */
  setVelocity(newVelocity) {
    this.velocity.set(newVelocity);
  }

  /**
   * @public
   */
  reset() {
    this.positionProperty.reset();
    this.zPositionProperty.reset();
    this.energyTypeProperty.reset();
    this.visibleProperty.reset();
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.positionProperty.dispose();
    this.zPositionProperty.dispose();
    this.energyTypeProperty.dispose();
    super.dispose();
  }
}
EnergyChunk.EnergyChunkIO = new IOType('EnergyChunkIO', {
  valueType: EnergyChunk,
  toStateObject: energyChunk => energyChunk.toStateObject(),
  stateObjectToCreateElementArguments: EnergyChunk.stateObjectToCreateElementArguments,
  stateSchema: {
    id: NumberIO,
    velocity: Vector2.Vector2IO,
    visiblePropertyReference: ReferenceIO(Property.PropertyIO(BooleanIO))
  }
});
energyFormsAndChanges.register('EnergyChunk', EnergyChunk);
export default EnergyChunk;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSIsIk51bWJlclByb3BlcnR5IiwiUHJvcGVydHkiLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5IiwibWVyZ2UiLCJFdmVudFR5cGUiLCJQaGV0aW9PYmplY3QiLCJUYW5kZW0iLCJCb29sZWFuSU8iLCJJT1R5cGUiLCJOdW1iZXJJTyIsIlJlZmVyZW5jZUlPIiwiZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIiwiRW5lcmd5VHlwZSIsImluc3RhbmNlQ291bnQiLCJFbmVyZ3lDaHVuayIsImNvbnN0cnVjdG9yIiwiaW5pdGlhbEVuZXJneVR5cGUiLCJpbml0aWFsUG9zaXRpb24iLCJpbml0aWFsVmVsb2NpdHkiLCJ2aXNpYmxlUHJvcGVydHkiLCJvcHRpb25zIiwiaWQiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInBoZXRpb1R5cGUiLCJFbmVyZ3lDaHVua0lPIiwicGhldGlvRHluYW1pY0VsZW1lbnQiLCJwb3NpdGlvblByb3BlcnR5IiwidmFsdWVDb21wYXJpc29uU3RyYXRlZ3kiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9FdmVudFR5cGUiLCJPUFRfT1VUIiwielBvc2l0aW9uUHJvcGVydHkiLCJlbmVyZ3lUeXBlUHJvcGVydHkiLCJhc3NlcnQiLCJWQUxJREFUSU9OIiwiaXNQaGV0aW9JbnN0cnVtZW50ZWQiLCJ2ZWxvY2l0eSIsIngiLCJ5IiwidG9TdGF0ZU9iamVjdCIsIlZlY3RvcjJJTyIsInZpc2libGVQcm9wZXJ0eVJlZmVyZW5jZSIsIlByb3BlcnR5SU8iLCJzdGF0ZVRvQXJnc0ZvckNvbnN0cnVjdG9yIiwic3RhdGVPYmplY3QiLCJmcm9tU3RhdGVPYmplY3QiLCJISURERU4iLCJaRVJPIiwic2V0UG9zaXRpb25YWSIsInNldCIsInRyYW5zbGF0ZSIsImdldCIsInBsdXNYWSIsInRyYW5zbGF0ZUJhc2VkT25WZWxvY2l0eSIsImR0IiwicGhldCIsImpvaXN0Iiwic2ltIiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsInZhbHVlIiwic2V0VmVsb2NpdHlYWSIsInNldFhZIiwic2V0VmVsb2NpdHkiLCJuZXdWZWxvY2l0eSIsInJlc2V0IiwiZGlzcG9zZSIsInZhbHVlVHlwZSIsImVuZXJneUNodW5rIiwic3RhdGVPYmplY3RUb0NyZWF0ZUVsZW1lbnRBcmd1bWVudHMiLCJzdGF0ZVNjaGVtYSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRW5lcmd5Q2h1bmsuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogdHlwZSB0aGF0IHJlcHJlc2VudHMgYSBjaHVuayBvZiBlbmVyZ3kgaW4gdGhlIHZpZXdcclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBFdmVudFR5cGUgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL0V2ZW50VHlwZS5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBCb29sZWFuSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0Jvb2xlYW5JTy5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBOdW1iZXJJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVtYmVySU8uanMnO1xyXG5pbXBvcnQgUmVmZXJlbmNlSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcclxuaW1wb3J0IGVuZXJneUZvcm1zQW5kQ2hhbmdlcyBmcm9tICcuLi8uLi9lbmVyZ3lGb3Jtc0FuZENoYW5nZXMuanMnO1xyXG5pbXBvcnQgRW5lcmd5VHlwZSBmcm9tICcuL0VuZXJneVR5cGUuanMnO1xyXG5cclxuLy8gc3RhdGljIGRhdGFcclxubGV0IGluc3RhbmNlQ291bnQgPSAwOyAvLyBjb3VudGVyIGZvciBjcmVhdGluZyB1bmlxdWUgSURzXHJcblxyXG5jbGFzcyBFbmVyZ3lDaHVuayBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RW5lcmd5VHlwZX0gaW5pdGlhbEVuZXJneVR5cGVcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGluaXRpYWxQb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gaW5pdGlhbFZlbG9jaXR5XHJcbiAgICogQHBhcmFtIHtCb29sZWFuUHJvcGVydHl9IHZpc2libGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaW5pdGlhbEVuZXJneVR5cGUsIGluaXRpYWxQb3NpdGlvbiwgaW5pdGlhbFZlbG9jaXR5LCB2aXNpYmxlUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyB7bnVtYmVyfSAtIFRoZSB1bmlxdWUgaWQgb2YgdGhlIGNodW5rLiBNb3N0IG9mdGVuIEVuZXJneUNodW5rIHNldCdzIGl0IG93bi4gVGhpcyBzaG91bGQgb25seSBiZSBzcGVjaWZpZWQgYnlcclxuICAgICAgLy8gUGhFVC1pTywgdG8gc3VwcG9ydCBQaEVULWlPIHN0YXRlIHJlY3JlYXRpbmcgZXhhY3QgaW5zdGFuY2VzLlxyXG4gICAgICBpZDogbnVsbCxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXHJcbiAgICAgIHBoZXRpb1R5cGU6IEVuZXJneUNodW5rLkVuZXJneUNodW5rSU8sXHJcbiAgICAgIHBoZXRpb0R5bmFtaWNFbGVtZW50OiB0cnVlXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBpbml0aWFsUG9zaXRpb24sIHtcclxuICAgICAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbicsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncG9zaXRpb25Qcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuT1BUX09VVFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBmb3Igc2ltcGxlIDNEIGxheWVyaW5nIGVmZmVjdHNcclxuICAgIHRoaXMuelBvc2l0aW9uUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd6UG9zaXRpb25Qcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMuZW5lcmd5VHlwZVByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5KCBFbmVyZ3lUeXBlLCBpbml0aWFsRW5lcmd5VHlwZSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VuZXJneVR5cGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMudmlzaWJsZVByb3BlcnR5ID0gdmlzaWJsZVByb3BlcnR5O1xyXG5cclxuICAgIGFzc2VydCAmJiBUYW5kZW0uVkFMSURBVElPTiAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgJiYgYXNzZXJ0KCB0aGlzLnZpc2libGVQcm9wZXJ0eS5pc1BoZXRpb0luc3RydW1lbnRlZCgpLFxyXG4gICAgICAnaWYgdGhpcyBFbmVyZ3lDaHVuayBpcyBpbnN0cnVtZW50ZWQsIHRoZW4gdGhlIHZpc2libGVQcm9wZXJ0eSBzaG91bGQgYmUgdG9vJyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge251bWJlcn0gLSBhbiBJRCB0aGF0IHdpbGwgYmUgdXNlZCB0byB0cmFjayB0aGlzIGVuZXJneSBjaHVua1xyXG4gICAgdGhpcy5pZCA9IG9wdGlvbnMuaWQgfHwgaW5zdGFuY2VDb3VudCsrO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1ZlY3RvcjJ9IC0gZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMsIHRoaXMgaXMgYWxsb2NhdGVkIG9uY2UgYW5kIHNob3VsZCBuZXZlciBiZSBvdmVyd3JpdHRlblxyXG4gICAgdGhpcy52ZWxvY2l0eSA9IG5ldyBWZWN0b3IyKCBpbml0aWFsVmVsb2NpdHkueCwgaW5pdGlhbFZlbG9jaXR5LnkgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWMgKEVuZXJneUNodW5rSU8pXHJcbiAgdG9TdGF0ZU9iamVjdCgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlkOiB0aGlzLmlkLFxyXG4gICAgICB2ZWxvY2l0eTogVmVjdG9yMi5WZWN0b3IySU8udG9TdGF0ZU9iamVjdCggdGhpcy52ZWxvY2l0eSApLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHlSZWZlcmVuY2U6IFJlZmVyZW5jZUlPKCBQcm9wZXJ0eS5Qcm9wZXJ0eUlPKCBCb29sZWFuSU8gKSApLnRvU3RhdGVPYmplY3QoIHRoaXMudmlzaWJsZVByb3BlcnR5IClcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIChFbmVyZ3lDaHVua0lPKVxyXG4gIHN0YXRpYyBzdGF0ZVRvQXJnc0ZvckNvbnN0cnVjdG9yKCBzdGF0ZU9iamVjdCApIHtcclxuICAgIGNvbnN0IHZpc2libGVQcm9wZXJ0eSA9IFJlZmVyZW5jZUlPKCBQcm9wZXJ0eS5Qcm9wZXJ0eUlPKCBCb29sZWFuSU8gKSApLmZyb21TdGF0ZU9iamVjdChcclxuICAgICAgc3RhdGVPYmplY3QudmlzaWJsZVByb3BlcnR5UmVmZXJlbmNlXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgRW5lcmd5VHlwZS5ISURERU4sXHJcbiAgICAgIFZlY3RvcjIuWkVSTyxcclxuICAgICAgVmVjdG9yMi5WZWN0b3IySU8uZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdC52ZWxvY2l0eSApLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHsgaWQ6IHN0YXRlT2JqZWN0LmlkIH1cclxuICAgIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzZXQgdGhlIHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRQb3NpdGlvblhZKCB4LCB5ICkge1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoIHgsIHkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogdHJhbnNsYXRlIHRoZSBlbmVyZ3kgY2h1bmsgYnkgYW1vdW50IHNwZWNpZmllZFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdHJhbnNsYXRlKCB4LCB5ICkge1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnNldCggdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLnBsdXNYWSggeCwgeSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiB0cmFuc2xhdGUgdGhlIGVuZXJneSBjaHVuayBiYXNlZCBvbiBpdHMgdmVsb2NpdHlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSBkZWx0YSB0aW1lXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHRyYW5zbGF0ZUJhc2VkT25WZWxvY2l0eSggZHQgKSB7XHJcblxyXG4gICAgLy8gV2hlbiBzZXR0aW5nIFBoRVQtaU8gc3RhdGUsIHRoZSBFbmVyZ3lDaHVuayBpcyBhbHJlYWR5IGluIGl0cyBjb3JyZWN0IHNwb3QsIHNvIGRvbid0IGFsdGVyIHRoYXQgYmFzZWQgb24gUHJvcGVydHlcclxuICAgIC8vIGxpc3RlbmVycywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lbmVyZ3ktZm9ybXMtYW5kLWNoYW5nZXMvaXNzdWVzLzM2MlxyXG4gICAgaWYgKCAhcGhldC5qb2lzdC5zaW0uaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgdGhpcy50cmFuc2xhdGUoIHRoaXMudmVsb2NpdHkueCAqIGR0LCB0aGlzLnZlbG9jaXR5LnkgKiBkdCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc2V0IHRoZSBYIGFuZCBZIHZlbG9jaXR5IG9mIHRoZSBlbmVyZ3kgY2h1bmtcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFZlbG9jaXR5WFkoIHgsIHkgKSB7XHJcbiAgICB0aGlzLnZlbG9jaXR5LnNldFhZKCB4LCB5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzZXQgdGhlIHZlbG9jaXR5IG9mIHRoZSBlbmVyZ3kgY2h1bmsgKHVzaW5nIGEgdmVjdG9yKVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gbmV3VmVsb2NpdHlcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0VmVsb2NpdHkoIG5ld1ZlbG9jaXR5ICkge1xyXG4gICAgdGhpcy52ZWxvY2l0eS5zZXQoIG5ld1ZlbG9jaXR5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuelBvc2l0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZW5lcmd5VHlwZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnZpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy56UG9zaXRpb25Qcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmVuZXJneVR5cGVQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5FbmVyZ3lDaHVuay5FbmVyZ3lDaHVua0lPID0gbmV3IElPVHlwZSggJ0VuZXJneUNodW5rSU8nLCB7XHJcbiAgdmFsdWVUeXBlOiBFbmVyZ3lDaHVuayxcclxuICB0b1N0YXRlT2JqZWN0OiBlbmVyZ3lDaHVuayA9PiBlbmVyZ3lDaHVuay50b1N0YXRlT2JqZWN0KCksXHJcbiAgc3RhdGVPYmplY3RUb0NyZWF0ZUVsZW1lbnRBcmd1bWVudHM6IEVuZXJneUNodW5rLnN0YXRlT2JqZWN0VG9DcmVhdGVFbGVtZW50QXJndW1lbnRzLFxyXG4gIHN0YXRlU2NoZW1hOiB7XHJcbiAgICBpZDogTnVtYmVySU8sXHJcbiAgICB2ZWxvY2l0eTogVmVjdG9yMi5WZWN0b3IySU8sXHJcbiAgICB2aXNpYmxlUHJvcGVydHlSZWZlcmVuY2U6IFJlZmVyZW5jZUlPKCBQcm9wZXJ0eS5Qcm9wZXJ0eUlPKCBCb29sZWFuSU8gKSApXHJcbiAgfVxyXG59ICk7XHJcblxyXG5lbmVyZ3lGb3Jtc0FuZENoYW5nZXMucmVnaXN0ZXIoICdFbmVyZ3lDaHVuaycsIEVuZXJneUNodW5rICk7XHJcbmV4cG9ydCBkZWZhdWx0IEVuZXJneUNodW5rOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSw2QkFBNkIsTUFBTSxzREFBc0Q7QUFDaEcsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFNBQVMsTUFBTSxvQ0FBb0M7QUFDMUQsT0FBT0MsWUFBWSxNQUFNLHVDQUF1QztBQUNoRSxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsT0FBT0MsTUFBTSxNQUFNLHVDQUF1QztBQUMxRCxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsT0FBT0Ms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