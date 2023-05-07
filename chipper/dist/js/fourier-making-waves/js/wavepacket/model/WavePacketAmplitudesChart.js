// Copyright 2021-2023, University of Colorado Boulder

/**
 * WavePacketAmplitudesChart is the model for the 'Amplitudes of Fourier Components' chart in
 * the 'Wave Packet' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import FMWConstants from '../../common/FMWConstants.js';
import AxisDescription from '../../common/model/AxisDescription.js';
import DomainChart from '../../common/model/DomainChart.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import WavePacketAxisDescriptions from './WavePacketAxisDescriptions.js';
// constants
const EMPTY_DATA_SET = FMWConstants.EMPTY_DATA_SET;

// AxisDescription for the x-axis contains coefficients of PI, and it's the same for space and time Domains.
const X_AXIS_MULTIPLIER = Math.PI;
export default class WavePacketAmplitudesChart extends DomainChart {
  // Data set for a finite number of Fourier components, EMPTY_DATA_SET if the number of components is infinite.
  // x = wave number, y = amplitude. Points are ordered by increasing x value.
  // Data set for a continuous waveform. This must always be created, because it determines the peak amplitude of
  // the chart, and thus its y-axis scale.
  // Data set for a continuous waveform, displayed when the number of components is infinite, otherwise [].
  // When components are infinite, this is the same data set as that's used for Continuous Waveform, but will be
  // plotted differently.
  // the peak amplitude, used to scale the chart's y-axis.
  // y-axis description that is the best-fit for peakAmplitudeProperty
  // Width that is displayed by the width indicator.  This is identical to the wave packet's width, but we are
  // deriving a Property named widthIndicatorWidthProperty so that all charts have a similar API for width indicators.
  // Position of the width indicator. This is loosely based on the getModelLocation method in WavePacketKWidthPlot.java.
  constructor(wavePacket, domainProperty, widthIndicatorsVisibleProperty, tandem) {
    // {Property.<AxisDescription>}
    // The x-axis has a fixed scale. Use validValues to make this Property essentially a constant.
    const xAxisDescriptionProperty = new Property(WavePacketAxisDescriptions.AMPLITUDES_X_AXIS_DESCRIPTION, {
      validValues: [WavePacketAxisDescriptions.AMPLITUDES_X_AXIS_DESCRIPTION]
    });
    super(domainProperty, xAxisDescriptionProperty, X_AXIS_MULTIPLIER, X_AXIS_MULTIPLIER, tandem);
    this.waveNumberRange = wavePacket.waveNumberRange;
    this.widthIndicatorsVisibleProperty = widthIndicatorsVisibleProperty;
    this.continuousWaveformVisibleProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('continuousWaveformVisibleProperty')
    });
    this.finiteComponentsDataSetProperty = new DerivedProperty([wavePacket.componentsProperty], components => {
      let dataSet = EMPTY_DATA_SET;
      if (components.length > 0) {
        dataSet = components.map(component => new Vector2(component.waveNumber, component.amplitude));
      }
      return dataSet;
    });
    this.continuousWaveformDataSetProperty = new DerivedProperty([wavePacket.componentSpacingProperty, wavePacket.centerProperty, wavePacket.standardDeviationProperty], (componentSpacing, center, standardDeviation) => createContinuousWaveformDataSet(wavePacket));
    this.infiniteComponentsDataSetProperty = new DerivedProperty([wavePacket.componentSpacingProperty, this.continuousWaveformDataSetProperty], (componentSpacing, continuousWaveformDataSet) => {
      let dataSet = EMPTY_DATA_SET;
      if (componentSpacing === 0) {
        dataSet = continuousWaveformDataSet;
      }
      return dataSet;
    });
    this.peakAmplitudeProperty = new DerivedProperty([this.continuousWaveformDataSetProperty], continuousWaveformDataSet => _.maxBy(continuousWaveformDataSet, point => point.y).y);
    this.yAxisDescriptionProperty = new DerivedProperty([this.peakAmplitudeProperty], peakAmplitude => AxisDescription.getBestFit(new Range(0, peakAmplitude), WavePacketAxisDescriptions.AMPLITUDES_Y_AXIS_DESCRIPTIONS), {
      validValues: WavePacketAxisDescriptions.AMPLITUDES_Y_AXIS_DESCRIPTIONS
    });
    this.widthIndicatorWidthProperty = new DerivedProperty([wavePacket.widthProperty], width => width);
    this.widthIndicatorPositionProperty = new DerivedProperty([wavePacket.componentSpacingProperty, wavePacket.centerProperty, wavePacket.standardDeviationProperty], (componentSpacing, center, standardDeviation) => {
      const x = center;
      let y = wavePacket.getComponentAmplitude(center + standardDeviation);
      if (componentSpacing !== 0) {
        y = componentSpacing * y;
      }
      return new Vector2(x, y);
    });
  }
  reset() {
    super.reset();
    this.continuousWaveformVisibleProperty.reset();
  }
}

/**
 * Creates the data set that approximates a continuous waveform. Ordered by increasing wave number.
 * This is loosely based on the updateEnvelope method in D2CAmplitudesView.java.
 * @param wavePacket
 * @returns a Vector2, where x is wave number, y is amplitude
 */
function createContinuousWaveformDataSet(wavePacket) {
  const componentSpacing = wavePacket.componentSpacingProperty.value;
  const step = Math.PI / 10; // chosen empirically, so that the plot looks smooth
  const maxWaveNumber = wavePacket.waveNumberRange.max + step; // one more point than we need

  const dataSet = []; // {Vector2[]}
  let waveNumber = wavePacket.waveNumberRange.min;
  while (waveNumber <= maxWaveNumber) {
    let amplitude = wavePacket.getComponentAmplitude(waveNumber);
    if (componentSpacing !== 0) {
      amplitude *= componentSpacing;
    }
    dataSet.push(new Vector2(waveNumber, amplitude));
    waveNumber += step;
  }
  return dataSet;
}
fourierMakingWaves.register('WavePacketAmplitudesChart', WavePacketAmplitudesChart);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlJhbmdlIiwiVmVjdG9yMiIsIkZNV0NvbnN0YW50cyIsIkF4aXNEZXNjcmlwdGlvbiIsIkRvbWFpbkNoYXJ0IiwiZm91cmllck1ha2luZ1dhdmVzIiwiV2F2ZVBhY2tldEF4aXNEZXNjcmlwdGlvbnMiLCJFTVBUWV9EQVRBX1NFVCIsIlhfQVhJU19NVUxUSVBMSUVSIiwiTWF0aCIsIlBJIiwiV2F2ZVBhY2tldEFtcGxpdHVkZXNDaGFydCIsImNvbnN0cnVjdG9yIiwid2F2ZVBhY2tldCIsImRvbWFpblByb3BlcnR5Iiwid2lkdGhJbmRpY2F0b3JzVmlzaWJsZVByb3BlcnR5IiwidGFuZGVtIiwieEF4aXNEZXNjcmlwdGlvblByb3BlcnR5IiwiQU1QTElUVURFU19YX0FYSVNfREVTQ1JJUFRJT04iLCJ2YWxpZFZhbHVlcyIsIndhdmVOdW1iZXJSYW5nZSIsImNvbnRpbnVvdXNXYXZlZm9ybVZpc2libGVQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsImZpbml0ZUNvbXBvbmVudHNEYXRhU2V0UHJvcGVydHkiLCJjb21wb25lbnRzUHJvcGVydHkiLCJjb21wb25lbnRzIiwiZGF0YVNldCIsImxlbmd0aCIsIm1hcCIsImNvbXBvbmVudCIsIndhdmVOdW1iZXIiLCJhbXBsaXR1ZGUiLCJjb250aW51b3VzV2F2ZWZvcm1EYXRhU2V0UHJvcGVydHkiLCJjb21wb25lbnRTcGFjaW5nUHJvcGVydHkiLCJjZW50ZXJQcm9wZXJ0eSIsInN0YW5kYXJkRGV2aWF0aW9uUHJvcGVydHkiLCJjb21wb25lbnRTcGFjaW5nIiwiY2VudGVyIiwic3RhbmRhcmREZXZpYXRpb24iLCJjcmVhdGVDb250aW51b3VzV2F2ZWZvcm1EYXRhU2V0IiwiaW5maW5pdGVDb21wb25lbnRzRGF0YVNldFByb3BlcnR5IiwiY29udGludW91c1dhdmVmb3JtRGF0YVNldCIsInBlYWtBbXBsaXR1ZGVQcm9wZXJ0eSIsIl8iLCJtYXhCeSIsInBvaW50IiwieSIsInlBeGlzRGVzY3JpcHRpb25Qcm9wZXJ0eSIsInBlYWtBbXBsaXR1ZGUiLCJnZXRCZXN0Rml0IiwiQU1QTElUVURFU19ZX0FYSVNfREVTQ1JJUFRJT05TIiwid2lkdGhJbmRpY2F0b3JXaWR0aFByb3BlcnR5Iiwid2lkdGhQcm9wZXJ0eSIsIndpZHRoIiwid2lkdGhJbmRpY2F0b3JQb3NpdGlvblByb3BlcnR5IiwieCIsImdldENvbXBvbmVudEFtcGxpdHVkZSIsInJlc2V0IiwidmFsdWUiLCJzdGVwIiwibWF4V2F2ZU51bWJlciIsIm1heCIsIm1pbiIsInB1c2giLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIldhdmVQYWNrZXRBbXBsaXR1ZGVzQ2hhcnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogV2F2ZVBhY2tldEFtcGxpdHVkZXNDaGFydCBpcyB0aGUgbW9kZWwgZm9yIHRoZSAnQW1wbGl0dWRlcyBvZiBGb3VyaWVyIENvbXBvbmVudHMnIGNoYXJ0IGluXHJcbiAqIHRoZSAnV2F2ZSBQYWNrZXQnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgRk1XQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9GTVdDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQXhpc0Rlc2NyaXB0aW9uIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9BeGlzRGVzY3JpcHRpb24uanMnO1xyXG5pbXBvcnQgRG9tYWluQ2hhcnQgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0RvbWFpbkNoYXJ0LmpzJztcclxuaW1wb3J0IGZvdXJpZXJNYWtpbmdXYXZlcyBmcm9tICcuLi8uLi9mb3VyaWVyTWFraW5nV2F2ZXMuanMnO1xyXG5pbXBvcnQgV2F2ZVBhY2tldCBmcm9tICcuL1dhdmVQYWNrZXQuanMnO1xyXG5pbXBvcnQgV2F2ZVBhY2tldEF4aXNEZXNjcmlwdGlvbnMgZnJvbSAnLi9XYXZlUGFja2V0QXhpc0Rlc2NyaXB0aW9ucy5qcyc7XHJcbmltcG9ydCBEb21haW4gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0RvbWFpbi5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgRU1QVFlfREFUQV9TRVQgPSBGTVdDb25zdGFudHMuRU1QVFlfREFUQV9TRVQ7XHJcblxyXG4vLyBBeGlzRGVzY3JpcHRpb24gZm9yIHRoZSB4LWF4aXMgY29udGFpbnMgY29lZmZpY2llbnRzIG9mIFBJLCBhbmQgaXQncyB0aGUgc2FtZSBmb3Igc3BhY2UgYW5kIHRpbWUgRG9tYWlucy5cclxuY29uc3QgWF9BWElTX01VTFRJUExJRVIgPSBNYXRoLlBJO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2F2ZVBhY2tldEFtcGxpdHVkZXNDaGFydCBleHRlbmRzIERvbWFpbkNoYXJ0IHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHdhdmVOdW1iZXJSYW5nZTogUmFuZ2U7XHJcbiAgcHVibGljIHJlYWRvbmx5IHdpZHRoSW5kaWNhdG9yc1Zpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcHVibGljIHJlYWRvbmx5IGNvbnRpbnVvdXNXYXZlZm9ybVZpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIERhdGEgc2V0IGZvciBhIGZpbml0ZSBudW1iZXIgb2YgRm91cmllciBjb21wb25lbnRzLCBFTVBUWV9EQVRBX1NFVCBpZiB0aGUgbnVtYmVyIG9mIGNvbXBvbmVudHMgaXMgaW5maW5pdGUuXHJcbiAgLy8geCA9IHdhdmUgbnVtYmVyLCB5ID0gYW1wbGl0dWRlLiBQb2ludHMgYXJlIG9yZGVyZWQgYnkgaW5jcmVhc2luZyB4IHZhbHVlLlxyXG4gIHB1YmxpYyByZWFkb25seSBmaW5pdGVDb21wb25lbnRzRGF0YVNldFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxWZWN0b3IyW10+O1xyXG5cclxuICAvLyBEYXRhIHNldCBmb3IgYSBjb250aW51b3VzIHdhdmVmb3JtLiBUaGlzIG11c3QgYWx3YXlzIGJlIGNyZWF0ZWQsIGJlY2F1c2UgaXQgZGV0ZXJtaW5lcyB0aGUgcGVhayBhbXBsaXR1ZGUgb2ZcclxuICAvLyB0aGUgY2hhcnQsIGFuZCB0aHVzIGl0cyB5LWF4aXMgc2NhbGUuXHJcbiAgcHVibGljIHJlYWRvbmx5IGNvbnRpbnVvdXNXYXZlZm9ybURhdGFTZXRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8VmVjdG9yMltdPjtcclxuXHJcbiAgLy8gRGF0YSBzZXQgZm9yIGEgY29udGludW91cyB3YXZlZm9ybSwgZGlzcGxheWVkIHdoZW4gdGhlIG51bWJlciBvZiBjb21wb25lbnRzIGlzIGluZmluaXRlLCBvdGhlcndpc2UgW10uXHJcbiAgLy8gV2hlbiBjb21wb25lbnRzIGFyZSBpbmZpbml0ZSwgdGhpcyBpcyB0aGUgc2FtZSBkYXRhIHNldCBhcyB0aGF0J3MgdXNlZCBmb3IgQ29udGludW91cyBXYXZlZm9ybSwgYnV0IHdpbGwgYmVcclxuICAvLyBwbG90dGVkIGRpZmZlcmVudGx5LlxyXG4gIHB1YmxpYyByZWFkb25seSBpbmZpbml0ZUNvbXBvbmVudHNEYXRhU2V0UHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFZlY3RvcjJbXT47XHJcblxyXG4gIC8vIHRoZSBwZWFrIGFtcGxpdHVkZSwgdXNlZCB0byBzY2FsZSB0aGUgY2hhcnQncyB5LWF4aXMuXHJcbiAgcHVibGljIHJlYWRvbmx5IHBlYWtBbXBsaXR1ZGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPjtcclxuXHJcbiAgLy8geS1heGlzIGRlc2NyaXB0aW9uIHRoYXQgaXMgdGhlIGJlc3QtZml0IGZvciBwZWFrQW1wbGl0dWRlUHJvcGVydHlcclxuICBwdWJsaWMgcmVhZG9ubHkgeUF4aXNEZXNjcmlwdGlvblByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxBeGlzRGVzY3JpcHRpb24+O1xyXG5cclxuICAvLyBXaWR0aCB0aGF0IGlzIGRpc3BsYXllZCBieSB0aGUgd2lkdGggaW5kaWNhdG9yLiAgVGhpcyBpcyBpZGVudGljYWwgdG8gdGhlIHdhdmUgcGFja2V0J3Mgd2lkdGgsIGJ1dCB3ZSBhcmVcclxuICAvLyBkZXJpdmluZyBhIFByb3BlcnR5IG5hbWVkIHdpZHRoSW5kaWNhdG9yV2lkdGhQcm9wZXJ0eSBzbyB0aGF0IGFsbCBjaGFydHMgaGF2ZSBhIHNpbWlsYXIgQVBJIGZvciB3aWR0aCBpbmRpY2F0b3JzLlxyXG4gIHB1YmxpYyByZWFkb25seSB3aWR0aEluZGljYXRvcldpZHRoUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj47XHJcblxyXG4gIC8vIFBvc2l0aW9uIG9mIHRoZSB3aWR0aCBpbmRpY2F0b3IuIFRoaXMgaXMgbG9vc2VseSBiYXNlZCBvbiB0aGUgZ2V0TW9kZWxMb2NhdGlvbiBtZXRob2QgaW4gV2F2ZVBhY2tldEtXaWR0aFBsb3QuamF2YS5cclxuICBwdWJsaWMgcmVhZG9ubHkgd2lkdGhJbmRpY2F0b3JQb3NpdGlvblByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxWZWN0b3IyPjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB3YXZlUGFja2V0OiBXYXZlUGFja2V0LCBkb21haW5Qcm9wZXJ0eTogRW51bWVyYXRpb25Qcm9wZXJ0eTxEb21haW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgd2lkdGhJbmRpY2F0b3JzVmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiwgdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgLy8ge1Byb3BlcnR5LjxBeGlzRGVzY3JpcHRpb24+fVxyXG4gICAgLy8gVGhlIHgtYXhpcyBoYXMgYSBmaXhlZCBzY2FsZS4gVXNlIHZhbGlkVmFsdWVzIHRvIG1ha2UgdGhpcyBQcm9wZXJ0eSBlc3NlbnRpYWxseSBhIGNvbnN0YW50LlxyXG4gICAgY29uc3QgeEF4aXNEZXNjcmlwdGlvblByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBXYXZlUGFja2V0QXhpc0Rlc2NyaXB0aW9ucy5BTVBMSVRVREVTX1hfQVhJU19ERVNDUklQVElPTiwge1xyXG4gICAgICB2YWxpZFZhbHVlczogWyBXYXZlUGFja2V0QXhpc0Rlc2NyaXB0aW9ucy5BTVBMSVRVREVTX1hfQVhJU19ERVNDUklQVElPTiBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGRvbWFpblByb3BlcnR5LCB4QXhpc0Rlc2NyaXB0aW9uUHJvcGVydHksIFhfQVhJU19NVUxUSVBMSUVSLCBYX0FYSVNfTVVMVElQTElFUiwgdGFuZGVtICk7XHJcblxyXG4gICAgdGhpcy53YXZlTnVtYmVyUmFuZ2UgPSB3YXZlUGFja2V0LndhdmVOdW1iZXJSYW5nZTtcclxuICAgIHRoaXMud2lkdGhJbmRpY2F0b3JzVmlzaWJsZVByb3BlcnR5ID0gd2lkdGhJbmRpY2F0b3JzVmlzaWJsZVByb3BlcnR5O1xyXG5cclxuICAgIHRoaXMuY29udGludW91c1dhdmVmb3JtVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb250aW51b3VzV2F2ZWZvcm1WaXNpYmxlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmZpbml0ZUNvbXBvbmVudHNEYXRhU2V0UHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHdhdmVQYWNrZXQuY29tcG9uZW50c1Byb3BlcnR5IF0sXHJcbiAgICAgIGNvbXBvbmVudHMgPT4ge1xyXG4gICAgICAgIGxldCBkYXRhU2V0OiBWZWN0b3IyW10gPSBFTVBUWV9EQVRBX1NFVDtcclxuICAgICAgICBpZiAoIGNvbXBvbmVudHMubGVuZ3RoID4gMCApIHtcclxuICAgICAgICAgIGRhdGFTZXQgPSBjb21wb25lbnRzLm1hcCggY29tcG9uZW50ID0+IG5ldyBWZWN0b3IyKCBjb21wb25lbnQud2F2ZU51bWJlciwgY29tcG9uZW50LmFtcGxpdHVkZSApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhU2V0O1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5jb250aW51b3VzV2F2ZWZvcm1EYXRhU2V0UHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHdhdmVQYWNrZXQuY29tcG9uZW50U3BhY2luZ1Byb3BlcnR5LCB3YXZlUGFja2V0LmNlbnRlclByb3BlcnR5LCB3YXZlUGFja2V0LnN0YW5kYXJkRGV2aWF0aW9uUHJvcGVydHkgXSxcclxuICAgICAgKCBjb21wb25lbnRTcGFjaW5nLCBjZW50ZXIsIHN0YW5kYXJkRGV2aWF0aW9uICkgPT4gY3JlYXRlQ29udGludW91c1dhdmVmb3JtRGF0YVNldCggd2F2ZVBhY2tldCApXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuaW5maW5pdGVDb21wb25lbnRzRGF0YVNldFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB3YXZlUGFja2V0LmNvbXBvbmVudFNwYWNpbmdQcm9wZXJ0eSwgdGhpcy5jb250aW51b3VzV2F2ZWZvcm1EYXRhU2V0UHJvcGVydHkgXSxcclxuICAgICAgKCBjb21wb25lbnRTcGFjaW5nLCBjb250aW51b3VzV2F2ZWZvcm1EYXRhU2V0ICkgPT4ge1xyXG4gICAgICAgIGxldCBkYXRhU2V0OiBWZWN0b3IyW10gPSBFTVBUWV9EQVRBX1NFVDtcclxuICAgICAgICBpZiAoIGNvbXBvbmVudFNwYWNpbmcgPT09IDAgKSB7XHJcbiAgICAgICAgICBkYXRhU2V0ID0gY29udGludW91c1dhdmVmb3JtRGF0YVNldDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGFTZXQ7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnBlYWtBbXBsaXR1ZGVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgdGhpcy5jb250aW51b3VzV2F2ZWZvcm1EYXRhU2V0UHJvcGVydHkgXSxcclxuICAgICAgY29udGludW91c1dhdmVmb3JtRGF0YVNldCA9PiBfLm1heEJ5KCBjb250aW51b3VzV2F2ZWZvcm1EYXRhU2V0LCBwb2ludCA9PiBwb2ludC55ICkhLnlcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy55QXhpc0Rlc2NyaXB0aW9uUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHRoaXMucGVha0FtcGxpdHVkZVByb3BlcnR5IF0sXHJcbiAgICAgIHBlYWtBbXBsaXR1ZGUgPT5cclxuICAgICAgICBBeGlzRGVzY3JpcHRpb24uZ2V0QmVzdEZpdCggbmV3IFJhbmdlKCAwLCBwZWFrQW1wbGl0dWRlICksIFdhdmVQYWNrZXRBeGlzRGVzY3JpcHRpb25zLkFNUExJVFVERVNfWV9BWElTX0RFU0NSSVBUSU9OUyApLCB7XHJcbiAgICAgICAgdmFsaWRWYWx1ZXM6IFdhdmVQYWNrZXRBeGlzRGVzY3JpcHRpb25zLkFNUExJVFVERVNfWV9BWElTX0RFU0NSSVBUSU9OU1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy53aWR0aEluZGljYXRvcldpZHRoUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHdhdmVQYWNrZXQud2lkdGhQcm9wZXJ0eSBdLCB3aWR0aCA9PiB3aWR0aCApO1xyXG5cclxuICAgIHRoaXMud2lkdGhJbmRpY2F0b3JQb3NpdGlvblByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB3YXZlUGFja2V0LmNvbXBvbmVudFNwYWNpbmdQcm9wZXJ0eSwgd2F2ZVBhY2tldC5jZW50ZXJQcm9wZXJ0eSwgd2F2ZVBhY2tldC5zdGFuZGFyZERldmlhdGlvblByb3BlcnR5IF0sXHJcbiAgICAgICggY29tcG9uZW50U3BhY2luZywgY2VudGVyLCBzdGFuZGFyZERldmlhdGlvbiApID0+IHtcclxuICAgICAgICBjb25zdCB4ID0gY2VudGVyO1xyXG4gICAgICAgIGxldCB5ID0gd2F2ZVBhY2tldC5nZXRDb21wb25lbnRBbXBsaXR1ZGUoIGNlbnRlciArIHN0YW5kYXJkRGV2aWF0aW9uICk7XHJcbiAgICAgICAgaWYgKCBjb21wb25lbnRTcGFjaW5nICE9PSAwICkge1xyXG4gICAgICAgICAgeSA9IGNvbXBvbmVudFNwYWNpbmcgKiB5O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlY3RvcjIoIHgsIHkgKTtcclxuICAgICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuICAgIHRoaXMuY29udGludW91c1dhdmVmb3JtVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyB0aGUgZGF0YSBzZXQgdGhhdCBhcHByb3hpbWF0ZXMgYSBjb250aW51b3VzIHdhdmVmb3JtLiBPcmRlcmVkIGJ5IGluY3JlYXNpbmcgd2F2ZSBudW1iZXIuXHJcbiAqIFRoaXMgaXMgbG9vc2VseSBiYXNlZCBvbiB0aGUgdXBkYXRlRW52ZWxvcGUgbWV0aG9kIGluIEQyQ0FtcGxpdHVkZXNWaWV3LmphdmEuXHJcbiAqIEBwYXJhbSB3YXZlUGFja2V0XHJcbiAqIEByZXR1cm5zIGEgVmVjdG9yMiwgd2hlcmUgeCBpcyB3YXZlIG51bWJlciwgeSBpcyBhbXBsaXR1ZGVcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUNvbnRpbnVvdXNXYXZlZm9ybURhdGFTZXQoIHdhdmVQYWNrZXQ6IFdhdmVQYWNrZXQgKTogVmVjdG9yMltdIHtcclxuXHJcbiAgY29uc3QgY29tcG9uZW50U3BhY2luZyA9IHdhdmVQYWNrZXQuY29tcG9uZW50U3BhY2luZ1Byb3BlcnR5LnZhbHVlO1xyXG4gIGNvbnN0IHN0ZXAgPSBNYXRoLlBJIC8gMTA7IC8vIGNob3NlbiBlbXBpcmljYWxseSwgc28gdGhhdCB0aGUgcGxvdCBsb29rcyBzbW9vdGhcclxuICBjb25zdCBtYXhXYXZlTnVtYmVyID0gd2F2ZVBhY2tldC53YXZlTnVtYmVyUmFuZ2UubWF4ICsgc3RlcDsgLy8gb25lIG1vcmUgcG9pbnQgdGhhbiB3ZSBuZWVkXHJcblxyXG4gIGNvbnN0IGRhdGFTZXQgPSBbXTsgLy8ge1ZlY3RvcjJbXX1cclxuICBsZXQgd2F2ZU51bWJlciA9IHdhdmVQYWNrZXQud2F2ZU51bWJlclJhbmdlLm1pbjtcclxuICB3aGlsZSAoIHdhdmVOdW1iZXIgPD0gbWF4V2F2ZU51bWJlciApIHtcclxuICAgIGxldCBhbXBsaXR1ZGUgPSB3YXZlUGFja2V0LmdldENvbXBvbmVudEFtcGxpdHVkZSggd2F2ZU51bWJlciApO1xyXG4gICAgaWYgKCBjb21wb25lbnRTcGFjaW5nICE9PSAwICkge1xyXG4gICAgICBhbXBsaXR1ZGUgKj0gY29tcG9uZW50U3BhY2luZztcclxuICAgIH1cclxuICAgIGRhdGFTZXQucHVzaCggbmV3IFZlY3RvcjIoIHdhdmVOdW1iZXIsIGFtcGxpdHVkZSApICk7XHJcbiAgICB3YXZlTnVtYmVyICs9IHN0ZXA7XHJcbiAgfVxyXG4gIHJldHVybiBkYXRhU2V0O1xyXG59XHJcblxyXG5mb3VyaWVyTWFraW5nV2F2ZXMucmVnaXN0ZXIoICdXYXZlUGFja2V0QW1wbGl0dWRlc0NoYXJ0JywgV2F2ZVBhY2tldEFtcGxpdHVkZXNDaGFydCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUVwRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBRXRELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUVuRCxPQUFPQyxZQUFZLE1BQU0sOEJBQThCO0FBQ3ZELE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MsV0FBVyxNQUFNLG1DQUFtQztBQUMzRCxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFFNUQsT0FBT0MsMEJBQTBCLE1BQU0saUNBQWlDO0FBR3hFO0FBQ0EsTUFBTUMsY0FBYyxHQUFHTCxZQUFZLENBQUNLLGNBQWM7O0FBRWxEO0FBQ0EsTUFBTUMsaUJBQWlCLEdBQUdDLElBQUksQ0FBQ0MsRUFBRTtBQUVqQyxlQUFlLE1BQU1DLHlCQUF5QixTQUFTUCxXQUFXLENBQUM7RUFNakU7RUFDQTtFQUdBO0VBQ0E7RUFHQTtFQUNBO0VBQ0E7RUFHQTtFQUdBO0VBR0E7RUFDQTtFQUdBO0VBR09RLFdBQVdBLENBQUVDLFVBQXNCLEVBQUVDLGNBQTJDLEVBQ25FQyw4QkFBaUQsRUFBRUMsTUFBYyxFQUFHO0lBRXRGO0lBQ0E7SUFDQSxNQUFNQyx3QkFB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