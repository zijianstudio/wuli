// Copyright 2022, University of Colorado Boulder

/**
 * FluxSensor is a two-dimensional sensor which is modeled as a rectangle that is parallel to the ground and measures
 * the amount of electromagnetic energy that passes through it.
 *
 * Because of the nature of the Greenhouse Effect model, the X position of the sensor doesn't really matter in terms of
 * how much energy is sensed.
 *
 * @author John Blanco
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import EnergyDirection from './EnergyDirection.js';
import EnergyRateTracker from './EnergyRateTracker.js';
import LayersModel from './LayersModel.js';

// types

// TODO: How do I require a tandem nowadays?
// constants
const DEFAULT_INITIAL_POSITION = Vector2.ZERO;
class FluxSensor extends PhetioObject {
  // sensor width, in meters

  // The altitude of the sensor in the atmosphere, in meters.

  // The X position of the sensor, which never changes.

  // energy rate trackers for the various directions and light frequencies

  // The proportion of the energy to be absorbed from the energy packets.  This is based on the size of the flux sensor
  // relative to the total simulated area in the model.
  // tracks whether this sensor is being dragged in the view
  isDraggingProperty = new BooleanProperty(false);

  /**
   * @param size - The 2D size of this sensor, in meters.  The width dimension is the same as the X direction in the
   *               model.  The height dimension is in the Z direction in model space, and the sensor as a whole is
   *               modeled as being parallel to the ground.
   * @param [providedOptions]
   */
  constructor(size, providedOptions) {
    // parameter checking
    assert && assert(size.width <= LayersModel.SUNLIGHT_SPAN.width, 'width to too large');
    assert && assert(size.height <= LayersModel.SUNLIGHT_SPAN.height, 'height to too large');
    const options = optionize()({
      initialPosition: DEFAULT_INITIAL_POSITION,
      // temporarily marking phet-io state to be false until serialization is added
      phetioState: false
    }, providedOptions);
    super(options);
    this.size = size;
    this.xPosition = options.initialPosition.x;
    this.altitudeProperty = new NumberProperty(options.initialPosition.y, {
      tandem: options.tandem.createTandem('altitudeProperty'),
      units: 'm',
      phetioDocumentation: 'The altitude of the flux sensor in the atmosphere.'
    });

    // Create the energy rate trackers.
    this.visibleLightDownEnergyRateTracker = new EnergyRateTracker({
      tandem: options.tandem?.createTandem('visibleLightDownEnergyRateTracker')
    });
    this.visibleLightUpEnergyRateTracker = new EnergyRateTracker({
      tandem: options.tandem?.createTandem('visibleLightUpEnergyRateTracker')
    });
    this.infraredLightDownEnergyRateTracker = new EnergyRateTracker({
      tandem: options.tandem?.createTandem('infraredLightDownEnergyRateTracker')
    });
    this.infraredLightUpEnergyRateTracker = new EnergyRateTracker({
      tandem: options.tandem?.createTandem('infraredLightUpEnergyRateTracker')
    });

    // Calculate the proportion of energy to absorb based on the sensor size.
    this.proportionOfEnergyToAbsorb = size.width * size.height / (LayersModel.SUNLIGHT_SPAN.width * LayersModel.SUNLIGHT_SPAN.height);
  }

  /**
   * Measure the amount of energy passing through the sensor and accumulate it.  This method should be stepped
   * regularly with the model, even if there are no energy packets present, so that the measurement can average out.
   */
  measureEnergyPacketFlux(energyPackets, dt) {
    let totalVisibleLightEnergyCrossingDownward = 0;
    let totalVisibleLightEnergyCrossingUpward = 0;
    let totalInfraredLightEnergyCrossingDownward = 0;
    let totalInfraredLightEnergyCrossingUpward = 0;

    // Go through each energy packet and determine if it has moved through the sensor and, if so, measure it.
    energyPackets.forEach(energyPacket => {
      if (this.energyPacketCrossedAltitude(energyPacket)) {
        if (energyPacket.direction === EnergyDirection.DOWN) {
          assert && assert(energyPacket.isVisible || energyPacket.isInfrared, 'energy packet must be visible or IR');
          if (energyPacket.isVisible) {
            totalVisibleLightEnergyCrossingDownward += energyPacket.energy;
          } else {
            totalInfraredLightEnergyCrossingDownward += energyPacket.energy;
          }
        } else {
          assert && assert(energyPacket.direction === EnergyDirection.UP, 'unexpected energy direction');
          if (energyPacket.isVisible) {
            totalVisibleLightEnergyCrossingUpward += energyPacket.energy;
          } else {
            totalInfraredLightEnergyCrossingUpward += energyPacket.energy;
          }
        }
      }
    });

    // In the code below, the amount of energy that has crossed the flux sensor is scaled by a multiplier that was
    // calculated during construction.  This multiplier represents the proportion of the 2D model size that is taken up
    // by this sensor.  This is necessary because in the Greenhouse Effect model, all energy is modelled with altitude
    // only, and no X position, so the multiplier is used to determine how much of that total energy is considered to
    // have passed through the sensor.
    this.visibleLightDownEnergyRateTracker.addEnergyInfo(totalVisibleLightEnergyCrossingDownward * this.proportionOfEnergyToAbsorb, dt);
    this.visibleLightUpEnergyRateTracker.addEnergyInfo(totalVisibleLightEnergyCrossingUpward * this.proportionOfEnergyToAbsorb, dt);
    this.infraredLightDownEnergyRateTracker.addEnergyInfo(totalInfraredLightEnergyCrossingDownward * this.proportionOfEnergyToAbsorb, dt);
    this.infraredLightUpEnergyRateTracker.addEnergyInfo(totalInfraredLightEnergyCrossingUpward * this.proportionOfEnergyToAbsorb, dt);
  }

  /**
   * Clear the values in all energy trackers.
   */
  clearEnergyTrackers() {
    this.visibleLightDownEnergyRateTracker.reset();
    this.visibleLightUpEnergyRateTracker.reset();
    this.infraredLightDownEnergyRateTracker.reset();
    this.infraredLightUpEnergyRateTracker.reset();
  }

  /**
   * Restore initial state.
   */
  reset() {
    this.clearEnergyTrackers();
    this.altitudeProperty.reset();
  }

  /**
   * Returns true if the provided energy packet passed through the altitude at which this sensor resides.
   */
  energyPacketCrossedAltitude(energyPacket) {
    const altitude = this.altitudeProperty.value;
    return energyPacket.previousAltitude > altitude && energyPacket.altitude <= altitude || energyPacket.previousAltitude < altitude && energyPacket.altitude >= altitude;
  }
}
greenhouseEffect.register('FluxSensor', FluxSensor);
export default FluxSensor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJvcHRpb25pemUiLCJQaGV0aW9PYmplY3QiLCJncmVlbmhvdXNlRWZmZWN0IiwiRW5lcmd5RGlyZWN0aW9uIiwiRW5lcmd5UmF0ZVRyYWNrZXIiLCJMYXllcnNNb2RlbCIsIkRFRkFVTFRfSU5JVElBTF9QT1NJVElPTiIsIlpFUk8iLCJGbHV4U2Vuc29yIiwiaXNEcmFnZ2luZ1Byb3BlcnR5IiwiY29uc3RydWN0b3IiLCJzaXplIiwicHJvdmlkZWRPcHRpb25zIiwiYXNzZXJ0Iiwid2lkdGgiLCJTVU5MSUdIVF9TUEFOIiwiaGVpZ2h0Iiwib3B0aW9ucyIsImluaXRpYWxQb3NpdGlvbiIsInBoZXRpb1N0YXRlIiwieFBvc2l0aW9uIiwieCIsImFsdGl0dWRlUHJvcGVydHkiLCJ5IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwidW5pdHMiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwidmlzaWJsZUxpZ2h0RG93bkVuZXJneVJhdGVUcmFja2VyIiwidmlzaWJsZUxpZ2h0VXBFbmVyZ3lSYXRlVHJhY2tlciIsImluZnJhcmVkTGlnaHREb3duRW5lcmd5UmF0ZVRyYWNrZXIiLCJpbmZyYXJlZExpZ2h0VXBFbmVyZ3lSYXRlVHJhY2tlciIsInByb3BvcnRpb25PZkVuZXJneVRvQWJzb3JiIiwibWVhc3VyZUVuZXJneVBhY2tldEZsdXgiLCJlbmVyZ3lQYWNrZXRzIiwiZHQiLCJ0b3RhbFZpc2libGVMaWdodEVuZXJneUNyb3NzaW5nRG93bndhcmQiLCJ0b3RhbFZpc2libGVMaWdodEVuZXJneUNyb3NzaW5nVXB3YXJkIiwidG90YWxJbmZyYXJlZExpZ2h0RW5lcmd5Q3Jvc3NpbmdEb3dud2FyZCIsInRvdGFsSW5mcmFyZWRMaWdodEVuZXJneUNyb3NzaW5nVXB3YXJkIiwiZm9yRWFjaCIsImVuZXJneVBhY2tldCIsImVuZXJneVBhY2tldENyb3NzZWRBbHRpdHVkZSIsImRpcmVjdGlvbiIsIkRPV04iLCJpc1Zpc2libGUiLCJpc0luZnJhcmVkIiwiZW5lcmd5IiwiVVAiLCJhZGRFbmVyZ3lJbmZvIiwiY2xlYXJFbmVyZ3lUcmFja2VycyIsInJlc2V0IiwiYWx0aXR1ZGUiLCJ2YWx1ZSIsInByZXZpb3VzQWx0aXR1ZGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkZsdXhTZW5zb3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEZsdXhTZW5zb3IgaXMgYSB0d28tZGltZW5zaW9uYWwgc2Vuc29yIHdoaWNoIGlzIG1vZGVsZWQgYXMgYSByZWN0YW5nbGUgdGhhdCBpcyBwYXJhbGxlbCB0byB0aGUgZ3JvdW5kIGFuZCBtZWFzdXJlc1xyXG4gKiB0aGUgYW1vdW50IG9mIGVsZWN0cm9tYWduZXRpYyBlbmVyZ3kgdGhhdCBwYXNzZXMgdGhyb3VnaCBpdC5cclxuICpcclxuICogQmVjYXVzZSBvZiB0aGUgbmF0dXJlIG9mIHRoZSBHcmVlbmhvdXNlIEVmZmVjdCBtb2RlbCwgdGhlIFggcG9zaXRpb24gb2YgdGhlIHNlbnNvciBkb2Vzbid0IHJlYWxseSBtYXR0ZXIgaW4gdGVybXMgb2ZcclxuICogaG93IG11Y2ggZW5lcmd5IGlzIHNlbnNlZC5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0LCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IGdyZWVuaG91c2VFZmZlY3QgZnJvbSAnLi4vLi4vZ3JlZW5ob3VzZUVmZmVjdC5qcyc7XHJcbmltcG9ydCBFTUVuZXJneVBhY2tldCBmcm9tICcuL0VNRW5lcmd5UGFja2V0LmpzJztcclxuaW1wb3J0IEVuZXJneURpcmVjdGlvbiBmcm9tICcuL0VuZXJneURpcmVjdGlvbi5qcyc7XHJcbmltcG9ydCBFbmVyZ3lSYXRlVHJhY2tlciBmcm9tICcuL0VuZXJneVJhdGVUcmFja2VyLmpzJztcclxuaW1wb3J0IExheWVyc01vZGVsIGZyb20gJy4vTGF5ZXJzTW9kZWwuanMnO1xyXG5cclxuLy8gdHlwZXNcclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBpbml0aWFsUG9zaXRpb24/OiBWZWN0b3IyO1xyXG59O1xyXG5leHBvcnQgdHlwZSBGbHV4U2Vuc29yT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGhldGlvT2JqZWN0T3B0aW9ucztcclxuXHJcbi8vIFRPRE86IEhvdyBkbyBJIHJlcXVpcmUgYSB0YW5kZW0gbm93YWRheXM/XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgREVGQVVMVF9JTklUSUFMX1BPU0lUSU9OID0gVmVjdG9yMi5aRVJPO1xyXG5cclxuY2xhc3MgRmx1eFNlbnNvciBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIC8vIHNlbnNvciB3aWR0aCwgaW4gbWV0ZXJzXHJcbiAgcHVibGljIHJlYWRvbmx5IHNpemU6IERpbWVuc2lvbjI7XHJcblxyXG4gIC8vIFRoZSBhbHRpdHVkZSBvZiB0aGUgc2Vuc29yIGluIHRoZSBhdG1vc3BoZXJlLCBpbiBtZXRlcnMuXHJcbiAgcHVibGljIHJlYWRvbmx5IGFsdGl0dWRlUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG5cclxuICAvLyBUaGUgWCBwb3NpdGlvbiBvZiB0aGUgc2Vuc29yLCB3aGljaCBuZXZlciBjaGFuZ2VzLlxyXG4gIHB1YmxpYyByZWFkb25seSB4UG9zaXRpb246IG51bWJlcjtcclxuXHJcbiAgLy8gZW5lcmd5IHJhdGUgdHJhY2tlcnMgZm9yIHRoZSB2YXJpb3VzIGRpcmVjdGlvbnMgYW5kIGxpZ2h0IGZyZXF1ZW5jaWVzXHJcbiAgcHVibGljIHJlYWRvbmx5IHZpc2libGVMaWdodERvd25FbmVyZ3lSYXRlVHJhY2tlcjogRW5lcmd5UmF0ZVRyYWNrZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHZpc2libGVMaWdodFVwRW5lcmd5UmF0ZVRyYWNrZXI6IEVuZXJneVJhdGVUcmFja2VyO1xyXG4gIHB1YmxpYyByZWFkb25seSBpbmZyYXJlZExpZ2h0RG93bkVuZXJneVJhdGVUcmFja2VyOiBFbmVyZ3lSYXRlVHJhY2tlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgaW5mcmFyZWRMaWdodFVwRW5lcmd5UmF0ZVRyYWNrZXI6IEVuZXJneVJhdGVUcmFja2VyO1xyXG5cclxuICAvLyBUaGUgcHJvcG9ydGlvbiBvZiB0aGUgZW5lcmd5IHRvIGJlIGFic29yYmVkIGZyb20gdGhlIGVuZXJneSBwYWNrZXRzLiAgVGhpcyBpcyBiYXNlZCBvbiB0aGUgc2l6ZSBvZiB0aGUgZmx1eCBzZW5zb3JcclxuICAvLyByZWxhdGl2ZSB0byB0aGUgdG90YWwgc2ltdWxhdGVkIGFyZWEgaW4gdGhlIG1vZGVsLlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcHJvcG9ydGlvbk9mRW5lcmd5VG9BYnNvcmI6IG51bWJlcjtcclxuXHJcbiAgLy8gdHJhY2tzIHdoZXRoZXIgdGhpcyBzZW5zb3IgaXMgYmVpbmcgZHJhZ2dlZCBpbiB0aGUgdmlld1xyXG4gIHB1YmxpYyByZWFkb25seSBpc0RyYWdnaW5nUHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBzaXplIC0gVGhlIDJEIHNpemUgb2YgdGhpcyBzZW5zb3IsIGluIG1ldGVycy4gIFRoZSB3aWR0aCBkaW1lbnNpb24gaXMgdGhlIHNhbWUgYXMgdGhlIFggZGlyZWN0aW9uIGluIHRoZVxyXG4gICAqICAgICAgICAgICAgICAgbW9kZWwuICBUaGUgaGVpZ2h0IGRpbWVuc2lvbiBpcyBpbiB0aGUgWiBkaXJlY3Rpb24gaW4gbW9kZWwgc3BhY2UsIGFuZCB0aGUgc2Vuc29yIGFzIGEgd2hvbGUgaXNcclxuICAgKiAgICAgICAgICAgICAgIG1vZGVsZWQgYXMgYmVpbmcgcGFyYWxsZWwgdG8gdGhlIGdyb3VuZC5cclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNpemU6IERpbWVuc2lvbjIsIHByb3ZpZGVkT3B0aW9uczogRmx1eFNlbnNvck9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gcGFyYW1ldGVyIGNoZWNraW5nXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzaXplLndpZHRoIDw9IExheWVyc01vZGVsLlNVTkxJR0hUX1NQQU4ud2lkdGgsICd3aWR0aCB0byB0b28gbGFyZ2UnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzaXplLmhlaWdodCA8PSBMYXllcnNNb2RlbC5TVU5MSUdIVF9TUEFOLmhlaWdodCwgJ2hlaWdodCB0byB0b28gbGFyZ2UnICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxGbHV4U2Vuc29yT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcclxuICAgICAgaW5pdGlhbFBvc2l0aW9uOiBERUZBVUxUX0lOSVRJQUxfUE9TSVRJT04sXHJcblxyXG4gICAgICAvLyB0ZW1wb3JhcmlseSBtYXJraW5nIHBoZXQtaW8gc3RhdGUgdG8gYmUgZmFsc2UgdW50aWwgc2VyaWFsaXphdGlvbiBpcyBhZGRlZFxyXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2VcclxuXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuc2l6ZSA9IHNpemU7XHJcblxyXG4gICAgdGhpcy54UG9zaXRpb24gPSBvcHRpb25zLmluaXRpYWxQb3NpdGlvbi54O1xyXG4gICAgdGhpcy5hbHRpdHVkZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBvcHRpb25zLmluaXRpYWxQb3NpdGlvbi55LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYWx0aXR1ZGVQcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICdtJyxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSBhbHRpdHVkZSBvZiB0aGUgZmx1eCBzZW5zb3IgaW4gdGhlIGF0bW9zcGhlcmUuJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgZW5lcmd5IHJhdGUgdHJhY2tlcnMuXHJcbiAgICB0aGlzLnZpc2libGVMaWdodERvd25FbmVyZ3lSYXRlVHJhY2tlciA9IG5ldyBFbmVyZ3lSYXRlVHJhY2tlcigge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICd2aXNpYmxlTGlnaHREb3duRW5lcmd5UmF0ZVRyYWNrZXInIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMudmlzaWJsZUxpZ2h0VXBFbmVyZ3lSYXRlVHJhY2tlciA9IG5ldyBFbmVyZ3lSYXRlVHJhY2tlcigge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICd2aXNpYmxlTGlnaHRVcEVuZXJneVJhdGVUcmFja2VyJyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmluZnJhcmVkTGlnaHREb3duRW5lcmd5UmF0ZVRyYWNrZXIgPSBuZXcgRW5lcmd5UmF0ZVRyYWNrZXIoIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnaW5mcmFyZWRMaWdodERvd25FbmVyZ3lSYXRlVHJhY2tlcicgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5pbmZyYXJlZExpZ2h0VXBFbmVyZ3lSYXRlVHJhY2tlciA9IG5ldyBFbmVyZ3lSYXRlVHJhY2tlcigge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICdpbmZyYXJlZExpZ2h0VXBFbmVyZ3lSYXRlVHJhY2tlcicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSB0aGUgcHJvcG9ydGlvbiBvZiBlbmVyZ3kgdG8gYWJzb3JiIGJhc2VkIG9uIHRoZSBzZW5zb3Igc2l6ZS5cclxuICAgIHRoaXMucHJvcG9ydGlvbk9mRW5lcmd5VG9BYnNvcmIgPSAoIHNpemUud2lkdGggKiBzaXplLmhlaWdodCApIC9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIExheWVyc01vZGVsLlNVTkxJR0hUX1NQQU4ud2lkdGggKiBMYXllcnNNb2RlbC5TVU5MSUdIVF9TUEFOLmhlaWdodCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWVhc3VyZSB0aGUgYW1vdW50IG9mIGVuZXJneSBwYXNzaW5nIHRocm91Z2ggdGhlIHNlbnNvciBhbmQgYWNjdW11bGF0ZSBpdC4gIFRoaXMgbWV0aG9kIHNob3VsZCBiZSBzdGVwcGVkXHJcbiAgICogcmVndWxhcmx5IHdpdGggdGhlIG1vZGVsLCBldmVuIGlmIHRoZXJlIGFyZSBubyBlbmVyZ3kgcGFja2V0cyBwcmVzZW50LCBzbyB0aGF0IHRoZSBtZWFzdXJlbWVudCBjYW4gYXZlcmFnZSBvdXQuXHJcbiAgICovXHJcbiAgcHVibGljIG1lYXN1cmVFbmVyZ3lQYWNrZXRGbHV4KCBlbmVyZ3lQYWNrZXRzOiBFTUVuZXJneVBhY2tldFtdLCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIGxldCB0b3RhbFZpc2libGVMaWdodEVuZXJneUNyb3NzaW5nRG93bndhcmQgPSAwO1xyXG4gICAgbGV0IHRvdGFsVmlzaWJsZUxpZ2h0RW5lcmd5Q3Jvc3NpbmdVcHdhcmQgPSAwO1xyXG4gICAgbGV0IHRvdGFsSW5mcmFyZWRMaWdodEVuZXJneUNyb3NzaW5nRG93bndhcmQgPSAwO1xyXG4gICAgbGV0IHRvdGFsSW5mcmFyZWRMaWdodEVuZXJneUNyb3NzaW5nVXB3YXJkID0gMDtcclxuXHJcbiAgICAvLyBHbyB0aHJvdWdoIGVhY2ggZW5lcmd5IHBhY2tldCBhbmQgZGV0ZXJtaW5lIGlmIGl0IGhhcyBtb3ZlZCB0aHJvdWdoIHRoZSBzZW5zb3IgYW5kLCBpZiBzbywgbWVhc3VyZSBpdC5cclxuICAgIGVuZXJneVBhY2tldHMuZm9yRWFjaCggZW5lcmd5UGFja2V0ID0+IHtcclxuICAgICAgaWYgKCB0aGlzLmVuZXJneVBhY2tldENyb3NzZWRBbHRpdHVkZSggZW5lcmd5UGFja2V0ICkgKSB7XHJcbiAgICAgICAgaWYgKCBlbmVyZ3lQYWNrZXQuZGlyZWN0aW9uID09PSBFbmVyZ3lEaXJlY3Rpb24uRE9XTiApIHtcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGVuZXJneVBhY2tldC5pc1Zpc2libGUgfHwgZW5lcmd5UGFja2V0LmlzSW5mcmFyZWQsICdlbmVyZ3kgcGFja2V0IG11c3QgYmUgdmlzaWJsZSBvciBJUicgKTtcclxuICAgICAgICAgIGlmICggZW5lcmd5UGFja2V0LmlzVmlzaWJsZSApIHtcclxuICAgICAgICAgICAgdG90YWxWaXNpYmxlTGlnaHRFbmVyZ3lDcm9zc2luZ0Rvd253YXJkICs9IGVuZXJneVBhY2tldC5lbmVyZ3k7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdG90YWxJbmZyYXJlZExpZ2h0RW5lcmd5Q3Jvc3NpbmdEb3dud2FyZCArPSBlbmVyZ3lQYWNrZXQuZW5lcmd5O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGVuZXJneVBhY2tldC5kaXJlY3Rpb24gPT09IEVuZXJneURpcmVjdGlvbi5VUCwgJ3VuZXhwZWN0ZWQgZW5lcmd5IGRpcmVjdGlvbicgKTtcclxuICAgICAgICAgIGlmICggZW5lcmd5UGFja2V0LmlzVmlzaWJsZSApIHtcclxuICAgICAgICAgICAgdG90YWxWaXNpYmxlTGlnaHRFbmVyZ3lDcm9zc2luZ1Vwd2FyZCArPSBlbmVyZ3lQYWNrZXQuZW5lcmd5O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRvdGFsSW5mcmFyZWRMaWdodEVuZXJneUNyb3NzaW5nVXB3YXJkICs9IGVuZXJneVBhY2tldC5lbmVyZ3k7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSW4gdGhlIGNvZGUgYmVsb3csIHRoZSBhbW91bnQgb2YgZW5lcmd5IHRoYXQgaGFzIGNyb3NzZWQgdGhlIGZsdXggc2Vuc29yIGlzIHNjYWxlZCBieSBhIG11bHRpcGxpZXIgdGhhdCB3YXNcclxuICAgIC8vIGNhbGN1bGF0ZWQgZHVyaW5nIGNvbnN0cnVjdGlvbi4gIFRoaXMgbXVsdGlwbGllciByZXByZXNlbnRzIHRoZSBwcm9wb3J0aW9uIG9mIHRoZSAyRCBtb2RlbCBzaXplIHRoYXQgaXMgdGFrZW4gdXBcclxuICAgIC8vIGJ5IHRoaXMgc2Vuc29yLiAgVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBpbiB0aGUgR3JlZW5ob3VzZSBFZmZlY3QgbW9kZWwsIGFsbCBlbmVyZ3kgaXMgbW9kZWxsZWQgd2l0aCBhbHRpdHVkZVxyXG4gICAgLy8gb25seSwgYW5kIG5vIFggcG9zaXRpb24sIHNvIHRoZSBtdWx0aXBsaWVyIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIGhvdyBtdWNoIG9mIHRoYXQgdG90YWwgZW5lcmd5IGlzIGNvbnNpZGVyZWQgdG9cclxuICAgIC8vIGhhdmUgcGFzc2VkIHRocm91Z2ggdGhlIHNlbnNvci5cclxuICAgIHRoaXMudmlzaWJsZUxpZ2h0RG93bkVuZXJneVJhdGVUcmFja2VyLmFkZEVuZXJneUluZm8oXHJcbiAgICAgIHRvdGFsVmlzaWJsZUxpZ2h0RW5lcmd5Q3Jvc3NpbmdEb3dud2FyZCAqIHRoaXMucHJvcG9ydGlvbk9mRW5lcmd5VG9BYnNvcmIsIGR0XHJcbiAgICApO1xyXG4gICAgdGhpcy52aXNpYmxlTGlnaHRVcEVuZXJneVJhdGVUcmFja2VyLmFkZEVuZXJneUluZm8oXHJcbiAgICAgIHRvdGFsVmlzaWJsZUxpZ2h0RW5lcmd5Q3Jvc3NpbmdVcHdhcmQgKiB0aGlzLnByb3BvcnRpb25PZkVuZXJneVRvQWJzb3JiLCBkdFxyXG4gICAgKTtcclxuICAgIHRoaXMuaW5mcmFyZWRMaWdodERvd25FbmVyZ3lSYXRlVHJhY2tlci5hZGRFbmVyZ3lJbmZvKFxyXG4gICAgICB0b3RhbEluZnJhcmVkTGlnaHRFbmVyZ3lDcm9zc2luZ0Rvd253YXJkICogdGhpcy5wcm9wb3J0aW9uT2ZFbmVyZ3lUb0Fic29yYiwgZHRcclxuICAgICk7XHJcbiAgICB0aGlzLmluZnJhcmVkTGlnaHRVcEVuZXJneVJhdGVUcmFja2VyLmFkZEVuZXJneUluZm8oXHJcbiAgICAgIHRvdGFsSW5mcmFyZWRMaWdodEVuZXJneUNyb3NzaW5nVXB3YXJkICogdGhpcy5wcm9wb3J0aW9uT2ZFbmVyZ3lUb0Fic29yYiwgZHRcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhciB0aGUgdmFsdWVzIGluIGFsbCBlbmVyZ3kgdHJhY2tlcnMuXHJcbiAgICovXHJcbiAgcHVibGljIGNsZWFyRW5lcmd5VHJhY2tlcnMoKTogdm9pZCB7XHJcbiAgICB0aGlzLnZpc2libGVMaWdodERvd25FbmVyZ3lSYXRlVHJhY2tlci5yZXNldCgpO1xyXG4gICAgdGhpcy52aXNpYmxlTGlnaHRVcEVuZXJneVJhdGVUcmFja2VyLnJlc2V0KCk7XHJcbiAgICB0aGlzLmluZnJhcmVkTGlnaHREb3duRW5lcmd5UmF0ZVRyYWNrZXIucmVzZXQoKTtcclxuICAgIHRoaXMuaW5mcmFyZWRMaWdodFVwRW5lcmd5UmF0ZVRyYWNrZXIucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3RvcmUgaW5pdGlhbCBzdGF0ZS5cclxuICAgKi9cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmNsZWFyRW5lcmd5VHJhY2tlcnMoKTtcclxuICAgIHRoaXMuYWx0aXR1ZGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBwcm92aWRlZCBlbmVyZ3kgcGFja2V0IHBhc3NlZCB0aHJvdWdoIHRoZSBhbHRpdHVkZSBhdCB3aGljaCB0aGlzIHNlbnNvciByZXNpZGVzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZW5lcmd5UGFja2V0Q3Jvc3NlZEFsdGl0dWRlKCBlbmVyZ3lQYWNrZXQ6IEVNRW5lcmd5UGFja2V0ICk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgYWx0aXR1ZGUgPSB0aGlzLmFsdGl0dWRlUHJvcGVydHkudmFsdWU7XHJcbiAgICByZXR1cm4gKCBlbmVyZ3lQYWNrZXQucHJldmlvdXNBbHRpdHVkZSA+IGFsdGl0dWRlICYmIGVuZXJneVBhY2tldC5hbHRpdHVkZSA8PSBhbHRpdHVkZSApIHx8XHJcbiAgICAgICAgICAgKCBlbmVyZ3lQYWNrZXQucHJldmlvdXNBbHRpdHVkZSA8IGFsdGl0dWRlICYmIGVuZXJneVBhY2tldC5hbHRpdHVkZSA+PSBhbHRpdHVkZSApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JlZW5ob3VzZUVmZmVjdC5yZWdpc3RlciggJ0ZsdXhTZW5zb3InLCBGbHV4U2Vuc29yICk7XHJcbmV4cG9ydCBkZWZhdWx0IEZsdXhTZW5zb3I7Il0sIm1hcHBp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