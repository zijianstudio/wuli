// Copyright 2020-2023, University of Colorado Boulder

/**
 * WavePacketModel is the top-level model for the 'Wave Packet' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import Domain from '../../common/model/Domain.js';
import SeriesType from '../../common/model/SeriesType.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import WavePacket from './WavePacket.js';
import WavePacketAmplitudesChart from './WavePacketAmplitudesChart.js';
import WavePacketAxisDescriptions from './WavePacketAxisDescriptions.js';
import WavePacketComponentsChart from './WavePacketComponentsChart.js';
import WavePacketSumChart from './WavePacketSumChart.js';
export default class WavePacketModel {
  constructor(tandem) {
    this.domainProperty = new EnumerationProperty(Domain.SPACE, {
      validValues: [Domain.SPACE, Domain.TIME],
      // Domain SPACE_AND_TIME is not supported in this screen
      tandem: tandem.createTandem('domainProperty')
    });
    this.seriesTypeProperty = new EnumerationProperty(SeriesType.SIN, {
      tandem: tandem.createTandem('seriesTypeProperty')
    });
    this.widthIndicatorsVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('widthIndicatorsVisibleProperty')
    });
    this.wavePacket = new WavePacket(tandem.createTandem('wavePacket'));

    // {Property.<AxisDescription>} the x-axis description shared by the Components and Sum charts
    const xAxisDescriptionProperty = new Property(WavePacketAxisDescriptions.DEFAULT_X_AXIS_DESCRIPTION, {
      validValues: WavePacketAxisDescriptions.X_AXIS_DESCRIPTIONS
    });

    // Parent tandem for all charts
    const chartsTandem = tandem.createTandem('charts');
    this.amplitudesChart = new WavePacketAmplitudesChart(this.wavePacket, this.domainProperty, this.widthIndicatorsVisibleProperty, chartsTandem.createTandem('amplitudesChart'));
    this.componentsChart = new WavePacketComponentsChart(this.wavePacket, this.domainProperty, this.seriesTypeProperty, xAxisDescriptionProperty, chartsTandem.createTandem('componentsChart'));
    this.sumChart = new WavePacketSumChart(this.componentsChart.componentDataSetsProperty, this.wavePacket, this.domainProperty, this.seriesTypeProperty, xAxisDescriptionProperty, this.widthIndicatorsVisibleProperty, chartsTandem.createTandem('sumChart'));
    this.resetWavePacketModel = () => {
      // Properties
      this.domainProperty.reset();
      this.seriesTypeProperty.reset();
      this.widthIndicatorsVisibleProperty.reset();
      xAxisDescriptionProperty.reset();

      // sub-models
      this.wavePacket.reset();
      this.amplitudesChart.reset();
      this.componentsChart.reset();
      this.sumChart.reset();
    };
  }
  reset() {
    this.resetWavePacketModel();
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
}
fourierMakingWaves.register('WavePacketModel', WavePacketModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbnVtZXJhdGlvblByb3BlcnR5IiwiUHJvcGVydHkiLCJEb21haW4iLCJTZXJpZXNUeXBlIiwiZm91cmllck1ha2luZ1dhdmVzIiwiV2F2ZVBhY2tldCIsIldhdmVQYWNrZXRBbXBsaXR1ZGVzQ2hhcnQiLCJXYXZlUGFja2V0QXhpc0Rlc2NyaXB0aW9ucyIsIldhdmVQYWNrZXRDb21wb25lbnRzQ2hhcnQiLCJXYXZlUGFja2V0U3VtQ2hhcnQiLCJXYXZlUGFja2V0TW9kZWwiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsImRvbWFpblByb3BlcnR5IiwiU1BBQ0UiLCJ2YWxpZFZhbHVlcyIsIlRJTUUiLCJjcmVhdGVUYW5kZW0iLCJzZXJpZXNUeXBlUHJvcGVydHkiLCJTSU4iLCJ3aWR0aEluZGljYXRvcnNWaXNpYmxlUHJvcGVydHkiLCJ3YXZlUGFja2V0IiwieEF4aXNEZXNjcmlwdGlvblByb3BlcnR5IiwiREVGQVVMVF9YX0FYSVNfREVTQ1JJUFRJT04iLCJYX0FYSVNfREVTQ1JJUFRJT05TIiwiY2hhcnRzVGFuZGVtIiwiYW1wbGl0dWRlc0NoYXJ0IiwiY29tcG9uZW50c0NoYXJ0Iiwic3VtQ2hhcnQiLCJjb21wb25lbnREYXRhU2V0c1Byb3BlcnR5IiwicmVzZXRXYXZlUGFja2V0TW9kZWwiLCJyZXNldCIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIldhdmVQYWNrZXRNb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBXYXZlUGFja2V0TW9kZWwgaXMgdGhlIHRvcC1sZXZlbCBtb2RlbCBmb3IgdGhlICdXYXZlIFBhY2tldCcgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRNb2RlbCBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9UTW9kZWwuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgRG9tYWluIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Eb21haW4uanMnO1xyXG5pbXBvcnQgU2VyaWVzVHlwZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvU2VyaWVzVHlwZS5qcyc7XHJcbmltcG9ydCBmb3VyaWVyTWFraW5nV2F2ZXMgZnJvbSAnLi4vLi4vZm91cmllck1ha2luZ1dhdmVzLmpzJztcclxuaW1wb3J0IFdhdmVQYWNrZXQgZnJvbSAnLi9XYXZlUGFja2V0LmpzJztcclxuaW1wb3J0IFdhdmVQYWNrZXRBbXBsaXR1ZGVzQ2hhcnQgZnJvbSAnLi9XYXZlUGFja2V0QW1wbGl0dWRlc0NoYXJ0LmpzJztcclxuaW1wb3J0IFdhdmVQYWNrZXRBeGlzRGVzY3JpcHRpb25zIGZyb20gJy4vV2F2ZVBhY2tldEF4aXNEZXNjcmlwdGlvbnMuanMnO1xyXG5pbXBvcnQgV2F2ZVBhY2tldENvbXBvbmVudHNDaGFydCBmcm9tICcuL1dhdmVQYWNrZXRDb21wb25lbnRzQ2hhcnQuanMnO1xyXG5pbXBvcnQgV2F2ZVBhY2tldFN1bUNoYXJ0IGZyb20gJy4vV2F2ZVBhY2tldFN1bUNoYXJ0LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdhdmVQYWNrZXRNb2RlbCBpbXBsZW1lbnRzIFRNb2RlbCB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBkb21haW5Qcm9wZXJ0eTogRW51bWVyYXRpb25Qcm9wZXJ0eTxEb21haW4+O1xyXG4gIHB1YmxpYyByZWFkb25seSBzZXJpZXNUeXBlUHJvcGVydHk6IEVudW1lcmF0aW9uUHJvcGVydHk8U2VyaWVzVHlwZT47XHJcbiAgcHVibGljIHJlYWRvbmx5IHdpZHRoSW5kaWNhdG9yc1Zpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcHVibGljIHJlYWRvbmx5IHdhdmVQYWNrZXQ6IFdhdmVQYWNrZXQ7XHJcbiAgcHVibGljIHJlYWRvbmx5IGFtcGxpdHVkZXNDaGFydDogV2F2ZVBhY2tldEFtcGxpdHVkZXNDaGFydDtcclxuICBwdWJsaWMgcmVhZG9ubHkgY29tcG9uZW50c0NoYXJ0OiBXYXZlUGFja2V0Q29tcG9uZW50c0NoYXJ0O1xyXG4gIHB1YmxpYyByZWFkb25seSBzdW1DaGFydDogV2F2ZVBhY2tldFN1bUNoYXJ0O1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IHJlc2V0V2F2ZVBhY2tldE1vZGVsOiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIHRoaXMuZG9tYWluUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25Qcm9wZXJ0eSggRG9tYWluLlNQQUNFLCB7XHJcbiAgICAgIHZhbGlkVmFsdWVzOiBbIERvbWFpbi5TUEFDRSwgRG9tYWluLlRJTUUgXSwgLy8gRG9tYWluIFNQQUNFX0FORF9USU1FIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBzY3JlZW5cclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZG9tYWluUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNlcmllc1R5cGVQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBTZXJpZXNUeXBlLlNJTiwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzZXJpZXNUeXBlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLndpZHRoSW5kaWNhdG9yc1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3dpZHRoSW5kaWNhdG9yc1Zpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMud2F2ZVBhY2tldCA9IG5ldyBXYXZlUGFja2V0KCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnd2F2ZVBhY2tldCcgKSApO1xyXG5cclxuICAgIC8vIHtQcm9wZXJ0eS48QXhpc0Rlc2NyaXB0aW9uPn0gdGhlIHgtYXhpcyBkZXNjcmlwdGlvbiBzaGFyZWQgYnkgdGhlIENvbXBvbmVudHMgYW5kIFN1bSBjaGFydHNcclxuICAgIGNvbnN0IHhBeGlzRGVzY3JpcHRpb25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggV2F2ZVBhY2tldEF4aXNEZXNjcmlwdGlvbnMuREVGQVVMVF9YX0FYSVNfREVTQ1JJUFRJT04sIHtcclxuICAgICAgdmFsaWRWYWx1ZXM6IFdhdmVQYWNrZXRBeGlzRGVzY3JpcHRpb25zLlhfQVhJU19ERVNDUklQVElPTlNcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBQYXJlbnQgdGFuZGVtIGZvciBhbGwgY2hhcnRzXHJcbiAgICBjb25zdCBjaGFydHNUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2hhcnRzJyApO1xyXG5cclxuICAgIHRoaXMuYW1wbGl0dWRlc0NoYXJ0ID0gbmV3IFdhdmVQYWNrZXRBbXBsaXR1ZGVzQ2hhcnQoIHRoaXMud2F2ZVBhY2tldCwgdGhpcy5kb21haW5Qcm9wZXJ0eSxcclxuICAgICAgdGhpcy53aWR0aEluZGljYXRvcnNWaXNpYmxlUHJvcGVydHksIGNoYXJ0c1RhbmRlbS5jcmVhdGVUYW5kZW0oICdhbXBsaXR1ZGVzQ2hhcnQnICkgKTtcclxuXHJcbiAgICB0aGlzLmNvbXBvbmVudHNDaGFydCA9IG5ldyBXYXZlUGFja2V0Q29tcG9uZW50c0NoYXJ0KCB0aGlzLndhdmVQYWNrZXQsIHRoaXMuZG9tYWluUHJvcGVydHksIHRoaXMuc2VyaWVzVHlwZVByb3BlcnR5LFxyXG4gICAgICB4QXhpc0Rlc2NyaXB0aW9uUHJvcGVydHksIGNoYXJ0c1RhbmRlbS5jcmVhdGVUYW5kZW0oICdjb21wb25lbnRzQ2hhcnQnICkgKTtcclxuXHJcbiAgICB0aGlzLnN1bUNoYXJ0ID0gbmV3IFdhdmVQYWNrZXRTdW1DaGFydCggdGhpcy5jb21wb25lbnRzQ2hhcnQuY29tcG9uZW50RGF0YVNldHNQcm9wZXJ0eSxcclxuICAgICAgdGhpcy53YXZlUGFja2V0LCB0aGlzLmRvbWFpblByb3BlcnR5LCB0aGlzLnNlcmllc1R5cGVQcm9wZXJ0eSwgeEF4aXNEZXNjcmlwdGlvblByb3BlcnR5LFxyXG4gICAgICB0aGlzLndpZHRoSW5kaWNhdG9yc1Zpc2libGVQcm9wZXJ0eSwgY2hhcnRzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N1bUNoYXJ0JyApICk7XHJcblxyXG4gICAgdGhpcy5yZXNldFdhdmVQYWNrZXRNb2RlbCA9ICgpID0+IHtcclxuXHJcbiAgICAgIC8vIFByb3BlcnRpZXNcclxuICAgICAgdGhpcy5kb21haW5Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICB0aGlzLnNlcmllc1R5cGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICB0aGlzLndpZHRoSW5kaWNhdG9yc1Zpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICB4QXhpc0Rlc2NyaXB0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICAgIC8vIHN1Yi1tb2RlbHNcclxuICAgICAgdGhpcy53YXZlUGFja2V0LnJlc2V0KCk7XHJcbiAgICAgIHRoaXMuYW1wbGl0dWRlc0NoYXJ0LnJlc2V0KCk7XHJcbiAgICAgIHRoaXMuY29tcG9uZW50c0NoYXJ0LnJlc2V0KCk7XHJcbiAgICAgIHRoaXMuc3VtQ2hhcnQucmVzZXQoKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlc2V0V2F2ZVBhY2tldE1vZGVsKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gIH1cclxufVxyXG5cclxuZm91cmllck1ha2luZ1dhdmVzLnJlZ2lzdGVyKCAnV2F2ZVBhY2tldE1vZGVsJywgV2F2ZVBhY2tldE1vZGVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsbUJBQW1CLE1BQU0sNENBQTRDO0FBQzVFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFHdEQsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyxVQUFVLE1BQU0saUJBQWlCO0FBQ3hDLE9BQU9DLHlCQUF5QixNQUFNLGdDQUFnQztBQUN0RSxPQUFPQywwQkFBMEIsTUFBTSxpQ0FBaUM7QUFDeEUsT0FBT0MseUJBQXlCLE1BQU0sZ0NBQWdDO0FBQ3RFLE9BQU9DLGtCQUFrQixNQUFNLHlCQUF5QjtBQUV4RCxlQUFlLE1BQU1DLGVBQWUsQ0FBbUI7RUFZOUNDLFdBQVdBLENBQUVDLE1BQWMsRUFBRztJQUVuQyxJQUFJLENBQUNDLGNBQWMsR0FBRyxJQUFJYixtQkFBbUIsQ0FBRUUsTUFBTSxDQUFDWSxLQUFLLEVBQUU7TUFDM0RDLFdBQVcsRUFBRSxDQUFFYixNQUFNLENBQUNZLEtBQUssRUFBRVosTUFBTSxDQUFDYyxJQUFJLENBQUU7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