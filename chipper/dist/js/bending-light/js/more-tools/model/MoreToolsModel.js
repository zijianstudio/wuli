// Copyright 2015-2022, University of Colorado Boulder

/**
 * Model for the "more tools" screen, which adds a wave sensor and a velocity sensor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import bendingLight from '../../bendingLight.js';
import Substance from '../../common/model/Substance.js';
import IntroModel from '../../intro/model/IntroModel.js';
import VelocitySensor from './VelocitySensor.js';
import WaveSensor from './WaveSensor.js';
class MoreToolsModel extends IntroModel {
  constructor(tandem) {
    // On this tab we should start with air and glass as the 2 mediums, since that has a bigger wavelength dependent
    // bend
    super(Substance.GLASS, false, tandem);
    this.velocitySensor = new VelocitySensor(); // (read-only)
    const waveValueGetter = position => this.getWaveValue(position);

    // (read-only)
    this.waveSensor = new WaveSensor(waveValueGetter, waveValueGetter);

    // Update the velocity sensor value when anything relevant in the model changes
    Multilink.multilink([this.laserViewProperty, this.laser.onProperty, this.velocitySensor.positionProperty, this.intensityMeter.sensorPositionProperty, this.topMediumProperty, this.bottomMediumProperty, this.laser.emissionPointProperty, this.laser.wavelengthProperty], () => {
      this.velocitySensor.valueProperty.set(this.getVelocity(this.velocitySensor.positionProperty.get()));
    });
  }

  /**
   */
  reset() {
    super.reset();
    this.velocitySensor.reset();
    this.waveSensor.reset();
  }
}
bendingLight.register('MoreToolsModel', MoreToolsModel);
export default MoreToolsModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJiZW5kaW5nTGlnaHQiLCJTdWJzdGFuY2UiLCJJbnRyb01vZGVsIiwiVmVsb2NpdHlTZW5zb3IiLCJXYXZlU2Vuc29yIiwiTW9yZVRvb2xzTW9kZWwiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsIkdMQVNTIiwidmVsb2NpdHlTZW5zb3IiLCJ3YXZlVmFsdWVHZXR0ZXIiLCJwb3NpdGlvbiIsImdldFdhdmVWYWx1ZSIsIndhdmVTZW5zb3IiLCJtdWx0aWxpbmsiLCJsYXNlclZpZXdQcm9wZXJ0eSIsImxhc2VyIiwib25Qcm9wZXJ0eSIsInBvc2l0aW9uUHJvcGVydHkiLCJpbnRlbnNpdHlNZXRlciIsInNlbnNvclBvc2l0aW9uUHJvcGVydHkiLCJ0b3BNZWRpdW1Qcm9wZXJ0eSIsImJvdHRvbU1lZGl1bVByb3BlcnR5IiwiZW1pc3Npb25Qb2ludFByb3BlcnR5Iiwid2F2ZWxlbmd0aFByb3BlcnR5IiwidmFsdWVQcm9wZXJ0eSIsInNldCIsImdldFZlbG9jaXR5IiwiZ2V0IiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1vcmVUb29sc01vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGZvciB0aGUgXCJtb3JlIHRvb2xzXCIgc2NyZWVuLCB3aGljaCBhZGRzIGEgd2F2ZSBzZW5zb3IgYW5kIGEgdmVsb2NpdHkgc2Vuc29yLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENoYW5kcmFzaGVrYXIgQmVtYWdvbmkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgYmVuZGluZ0xpZ2h0IGZyb20gJy4uLy4uL2JlbmRpbmdMaWdodC5qcyc7XHJcbmltcG9ydCBTdWJzdGFuY2UgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1N1YnN0YW5jZS5qcyc7XHJcbmltcG9ydCBJbnRyb01vZGVsIGZyb20gJy4uLy4uL2ludHJvL21vZGVsL0ludHJvTW9kZWwuanMnO1xyXG5pbXBvcnQgVmVsb2NpdHlTZW5zb3IgZnJvbSAnLi9WZWxvY2l0eVNlbnNvci5qcyc7XHJcbmltcG9ydCBXYXZlU2Vuc29yIGZyb20gJy4vV2F2ZVNlbnNvci5qcyc7XHJcblxyXG5jbGFzcyBNb3JlVG9vbHNNb2RlbCBleHRlbmRzIEludHJvTW9kZWwge1xyXG4gIHB1YmxpYyByZWFkb25seSB2ZWxvY2l0eVNlbnNvcjogVmVsb2NpdHlTZW5zb3I7XHJcbiAgcHVibGljIHJlYWRvbmx5IHdhdmVTZW5zb3I6IFdhdmVTZW5zb3I7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgLy8gT24gdGhpcyB0YWIgd2Ugc2hvdWxkIHN0YXJ0IHdpdGggYWlyIGFuZCBnbGFzcyBhcyB0aGUgMiBtZWRpdW1zLCBzaW5jZSB0aGF0IGhhcyBhIGJpZ2dlciB3YXZlbGVuZ3RoIGRlcGVuZGVudFxyXG4gICAgLy8gYmVuZFxyXG4gICAgc3VwZXIoIFN1YnN0YW5jZS5HTEFTUywgZmFsc2UsIHRhbmRlbSApO1xyXG5cclxuICAgIHRoaXMudmVsb2NpdHlTZW5zb3IgPSBuZXcgVmVsb2NpdHlTZW5zb3IoKTsgLy8gKHJlYWQtb25seSlcclxuICAgIGNvbnN0IHdhdmVWYWx1ZUdldHRlciA9ICggcG9zaXRpb246IFZlY3RvcjIgKSA9PiB0aGlzLmdldFdhdmVWYWx1ZSggcG9zaXRpb24gKTtcclxuXHJcbiAgICAvLyAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy53YXZlU2Vuc29yID0gbmV3IFdhdmVTZW5zb3IoIHdhdmVWYWx1ZUdldHRlciwgd2F2ZVZhbHVlR2V0dGVyICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSB2ZWxvY2l0eSBzZW5zb3IgdmFsdWUgd2hlbiBhbnl0aGluZyByZWxldmFudCBpbiB0aGUgbW9kZWwgY2hhbmdlc1xyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggW1xyXG4gICAgICB0aGlzLmxhc2VyVmlld1Byb3BlcnR5LFxyXG4gICAgICB0aGlzLmxhc2VyLm9uUHJvcGVydHksXHJcbiAgICAgIHRoaXMudmVsb2NpdHlTZW5zb3IucG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgdGhpcy5pbnRlbnNpdHlNZXRlci5zZW5zb3JQb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICB0aGlzLnRvcE1lZGl1bVByb3BlcnR5LFxyXG4gICAgICB0aGlzLmJvdHRvbU1lZGl1bVByb3BlcnR5LFxyXG4gICAgICB0aGlzLmxhc2VyLmVtaXNzaW9uUG9pbnRQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5sYXNlci53YXZlbGVuZ3RoUHJvcGVydHlcclxuICAgIF0sICgpID0+IHtcclxuICAgICAgdGhpcy52ZWxvY2l0eVNlbnNvci52YWx1ZVByb3BlcnR5LnNldChcclxuICAgICAgICB0aGlzLmdldFZlbG9jaXR5KCB0aGlzLnZlbG9jaXR5U2Vuc29yLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuICAgIHRoaXMudmVsb2NpdHlTZW5zb3IucmVzZXQoKTtcclxuICAgIHRoaXMud2F2ZVNlbnNvci5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuYmVuZGluZ0xpZ2h0LnJlZ2lzdGVyKCAnTW9yZVRvb2xzTW9kZWwnLCBNb3JlVG9vbHNNb2RlbCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTW9yZVRvb2xzTW9kZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGtDQUFrQztBQUd4RCxPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBQ2hELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBQ2hELE9BQU9DLFVBQVUsTUFBTSxpQkFBaUI7QUFFeEMsTUFBTUMsY0FBYyxTQUFTSCxVQUFVLENBQUM7RUFJL0JJLFdBQVdBLENBQUVDLE1BQWMsRUFBRztJQUVuQztJQUNBO0lBQ0EsS0FBSyxDQUFFTixTQUFTLENBQUNPLEtBQUssRUFBRSxLQUFLLEVBQUVELE1BQU8sQ0FBQztJQUV2QyxJQUFJLENBQUNFLGNBQWMsR0FBRyxJQUFJTixjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUMsTUFBTU8sZUFBZSxHQUFLQyxRQUFpQixJQUFNLElBQUksQ0FBQ0MsWUFBWSxDQUFFRCxRQUFTLENBQUM7O0lBRTlFO0lBQ0EsSUFBSSxDQUFDRSxVQUFVLEdBQUcsSUFBSVQsVUFBVSxDQUFFTSxlQUFlLEVBQUVBLGVBQWdCLENBQUM7O0lBRXBFO0lBQ0FYLFNBQVMsQ0FBQ2UsU0FBUyxDQUFFLENBQ25CLElBQUksQ0FBQ0MsaUJBQWlCLEVBQ3RCLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxVQUFVLEVBQ3JCLElBQUksQ0FBQ1IsY0FBYyxDQUFDUyxnQkFBZ0IsRUFDcEMsSUFBSSxDQUFDQyxjQUFjLENBQUNDLHNCQUFzQixFQUMxQyxJQUFJLENBQUNDLGlCQUFpQixFQUN0QixJQUFJLENBQUNDLG9CQUFvQixFQUN6QixJQUFJLENBQUNOLEtBQUssQ0FBQ08scUJBQXFCLEVBQ2hDLElBQUksQ0FBQ1AsS0FBSyxDQUFDUSxrQkFBa0IsQ0FDOUIsRUFBRSxNQUFNO01BQ1AsSUFBSSxDQUFDZixjQUFjLENBQUNnQixhQUFhLENBQUNDLEdBQUcsQ0FDbkMsSUFBSSxDQUFDQyxXQUFXLENBQUUsSUFBSSxDQUFDbEIsY0FBYyxDQUFDUyxnQkFBZ0IsQ0FBQ1UsR0FBRyxDQUFDLENBQUUsQ0FBRSxDQUFDO0lBQ3BFLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7RUFDa0JDLEtBQUtBLENBQUEsRUFBUztJQUM1QixLQUFLLENBQUNBLEtBQUssQ0FBQyxDQUFDO0lBQ2IsSUFBSSxDQUFDcEIsY0FBYyxDQUFDb0IsS0FBSyxDQUFDLENBQUM7SUFDM0IsSUFBSSxDQUFDaEIsVUFBVSxDQUFDZ0IsS0FBSyxDQUFDLENBQUM7RUFDekI7QUFDRjtBQUVBN0IsWUFBWSxDQUFDOEIsUUFBUSxDQUFFLGdCQUFnQixFQUFFekIsY0FBZSxDQUFDO0FBRXpELGVBQWVBLGNBQWMifQ==