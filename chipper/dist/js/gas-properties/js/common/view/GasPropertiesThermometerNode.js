// Copyright 2018-2022, University of Colorado Boulder

/**
 * ThermometerNode displays a thermometer, temperature value, and control for selecting temperature units.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ThermometerNode from '../../../../scenery-phet/js/ThermometerNode.js';
import { VBox } from '../../../../scenery/js/imports.js';
import gasProperties from '../../gasProperties.js';
import TemperatureDisplay from './TemperatureDisplay.js';
export default class GasPropertiesThermometerNode extends VBox {
  constructor(thermometer, listboxParent, providedOptions) {
    const options = optionize()({
      // VBoxOptions
      spacing: 5,
      align: 'center'
    }, providedOptions);

    // temperatureProperty is null when there are no particles in the container.
    // Map null to zero, since ThermometerNode doesn't support null values.
    const temperatureNumberProperty = new DerivedProperty([thermometer.temperatureKelvinProperty], temperature => temperature === null ? 0 : temperature, {
      valueType: 'number'
    });
    const thermometerNode = new ThermometerNode(temperatureNumberProperty, thermometer.range.min, thermometer.range.max, {
      backgroundFill: 'white',
      bulbDiameter: 30,
      tubeHeight: 100,
      tubeWidth: 20,
      glassThickness: 3,
      tickSpacing: 6,
      majorTickLength: 10,
      minorTickLength: 6,
      lineWidth: 1
    });

    // ComboBox that displays dynamic temperature for various units, centered above the thermometer
    const comboBox = new TemperatureDisplay(thermometer, listboxParent, {
      maxWidth: 4 * thermometerNode.width,
      tandem: options.tandem.createTandem('comboBox')
    });
    options.children = [comboBox, thermometerNode];
    super(options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
gasProperties.register('GasPropertiesThermometerNode', GasPropertiesThermometerNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJvcHRpb25pemUiLCJUaGVybW9tZXRlck5vZGUiLCJWQm94IiwiZ2FzUHJvcGVydGllcyIsIlRlbXBlcmF0dXJlRGlzcGxheSIsIkdhc1Byb3BlcnRpZXNUaGVybW9tZXRlck5vZGUiLCJjb25zdHJ1Y3RvciIsInRoZXJtb21ldGVyIiwibGlzdGJveFBhcmVudCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJzcGFjaW5nIiwiYWxpZ24iLCJ0ZW1wZXJhdHVyZU51bWJlclByb3BlcnR5IiwidGVtcGVyYXR1cmVLZWx2aW5Qcm9wZXJ0eSIsInRlbXBlcmF0dXJlIiwidmFsdWVUeXBlIiwidGhlcm1vbWV0ZXJOb2RlIiwicmFuZ2UiLCJtaW4iLCJtYXgiLCJiYWNrZ3JvdW5kRmlsbCIsImJ1bGJEaWFtZXRlciIsInR1YmVIZWlnaHQiLCJ0dWJlV2lkdGgiLCJnbGFzc1RoaWNrbmVzcyIsInRpY2tTcGFjaW5nIiwibWFqb3JUaWNrTGVuZ3RoIiwibWlub3JUaWNrTGVuZ3RoIiwibGluZVdpZHRoIiwiY29tYm9Cb3giLCJtYXhXaWR0aCIsIndpZHRoIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiY2hpbGRyZW4iLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHYXNQcm9wZXJ0aWVzVGhlcm1vbWV0ZXJOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZXJtb21ldGVyTm9kZSBkaXNwbGF5cyBhIHRoZXJtb21ldGVyLCB0ZW1wZXJhdHVyZSB2YWx1ZSwgYW5kIGNvbnRyb2wgZm9yIHNlbGVjdGluZyB0ZW1wZXJhdHVyZSB1bml0cy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBUaGVybW9tZXRlck5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1RoZXJtb21ldGVyTm9kZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFZCb3gsIFZCb3hPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGdhc1Byb3BlcnRpZXMgZnJvbSAnLi4vLi4vZ2FzUHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBUaGVybW9tZXRlciBmcm9tICcuLi9tb2RlbC9UaGVybW9tZXRlci5qcyc7XHJcbmltcG9ydCBUZW1wZXJhdHVyZURpc3BsYXkgZnJvbSAnLi9UZW1wZXJhdHVyZURpc3BsYXkuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIEdhc1Byb3BlcnRpZXNUaGVybW9tZXRlck5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8VkJveE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhc1Byb3BlcnRpZXNUaGVybW9tZXRlck5vZGUgZXh0ZW5kcyBWQm94IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0aGVybW9tZXRlcjogVGhlcm1vbWV0ZXIsIGxpc3Rib3hQYXJlbnQ6IE5vZGUsIHByb3ZpZGVkT3B0aW9uczogR2FzUHJvcGVydGllc1RoZXJtb21ldGVyTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxHYXNQcm9wZXJ0aWVzVGhlcm1vbWV0ZXJOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIFZCb3hPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBWQm94T3B0aW9uc1xyXG4gICAgICBzcGFjaW5nOiA1LFxyXG4gICAgICBhbGlnbjogJ2NlbnRlcidcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHRlbXBlcmF0dXJlUHJvcGVydHkgaXMgbnVsbCB3aGVuIHRoZXJlIGFyZSBubyBwYXJ0aWNsZXMgaW4gdGhlIGNvbnRhaW5lci5cclxuICAgIC8vIE1hcCBudWxsIHRvIHplcm8sIHNpbmNlIFRoZXJtb21ldGVyTm9kZSBkb2Vzbid0IHN1cHBvcnQgbnVsbCB2YWx1ZXMuXHJcbiAgICBjb25zdCB0ZW1wZXJhdHVyZU51bWJlclByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB0aGVybW9tZXRlci50ZW1wZXJhdHVyZUtlbHZpblByb3BlcnR5IF0sXHJcbiAgICAgIHRlbXBlcmF0dXJlID0+ICggdGVtcGVyYXR1cmUgPT09IG51bGwgKSA/IDAgOiB0ZW1wZXJhdHVyZSwge1xyXG4gICAgICAgIHZhbHVlVHlwZTogJ251bWJlcidcclxuICAgICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHRoZXJtb21ldGVyTm9kZSA9IG5ldyBUaGVybW9tZXRlck5vZGUoIHRlbXBlcmF0dXJlTnVtYmVyUHJvcGVydHksIHRoZXJtb21ldGVyLnJhbmdlLm1pbiwgdGhlcm1vbWV0ZXIucmFuZ2UubWF4LCB7XHJcbiAgICAgIGJhY2tncm91bmRGaWxsOiAnd2hpdGUnLFxyXG4gICAgICBidWxiRGlhbWV0ZXI6IDMwLFxyXG4gICAgICB0dWJlSGVpZ2h0OiAxMDAsXHJcbiAgICAgIHR1YmVXaWR0aDogMjAsXHJcbiAgICAgIGdsYXNzVGhpY2tuZXNzOiAzLFxyXG4gICAgICB0aWNrU3BhY2luZzogNixcclxuICAgICAgbWFqb3JUaWNrTGVuZ3RoOiAxMCxcclxuICAgICAgbWlub3JUaWNrTGVuZ3RoOiA2LFxyXG4gICAgICBsaW5lV2lkdGg6IDFcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDb21ib0JveCB0aGF0IGRpc3BsYXlzIGR5bmFtaWMgdGVtcGVyYXR1cmUgZm9yIHZhcmlvdXMgdW5pdHMsIGNlbnRlcmVkIGFib3ZlIHRoZSB0aGVybW9tZXRlclxyXG4gICAgY29uc3QgY29tYm9Cb3ggPSBuZXcgVGVtcGVyYXR1cmVEaXNwbGF5KCB0aGVybW9tZXRlciwgbGlzdGJveFBhcmVudCwge1xyXG4gICAgICBtYXhXaWR0aDogNCAqIHRoZXJtb21ldGVyTm9kZS53aWR0aCxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb21ib0JveCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIGNvbWJvQm94LCB0aGVybW9tZXRlck5vZGUgXTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmdhc1Byb3BlcnRpZXMucmVnaXN0ZXIoICdHYXNQcm9wZXJ0aWVzVGhlcm1vbWV0ZXJOb2RlJywgR2FzUHJvcGVydGllc1RoZXJtb21ldGVyTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFNBQVMsTUFBNEIsdUNBQXVDO0FBRW5GLE9BQU9DLGVBQWUsTUFBTSxnREFBZ0Q7QUFDNUUsU0FBZUMsSUFBSSxRQUFxQixtQ0FBbUM7QUFDM0UsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUVsRCxPQUFPQyxrQkFBa0IsTUFBTSx5QkFBeUI7QUFNeEQsZUFBZSxNQUFNQyw0QkFBNEIsU0FBU0gsSUFBSSxDQUFDO0VBRXRESSxXQUFXQSxDQUFFQyxXQUF3QixFQUFFQyxhQUFtQixFQUFFQyxlQUFvRCxFQUFHO0lBRXhILE1BQU1DLE9BQU8sR0FBR1YsU0FBUyxDQUFnRSxDQUFDLENBQUU7TUFFMUY7TUFDQVcsT0FBTyxFQUFFLENBQUM7TUFDVkMsS0FBSyxFQUFFO0lBQ1QsQ0FBQyxFQUFFSCxlQUFnQixDQUFDOztJQUVwQjtJQUNBO0lBQ0EsTUFBTUkseUJBQXlCLEdBQUcsSUFBSWQsZUFBZSxDQUNuRCxDQUFFUSxXQUFXLENBQUNPLHlCQUF5QixDQUFFLEVBQ3pDQyxXQUFXLElBQU1BLFdBQVcsS0FBSyxJQUFJLEdBQUssQ0FBQyxHQUFHQSxXQUFXLEVBQUU7TUFDekRDLFNBQVMsRUFBRTtJQUNiLENBQUUsQ0FBQztJQUVMLE1BQU1DLGVBQWUsR0FBRyxJQUFJaEIsZUFBZSxDQUFFWSx5QkFBeUIsRUFBRU4sV0FBVyxDQUFDVyxLQUFLLENBQUNDLEdBQUcsRUFBRVosV0FBVyxDQUFDVyxLQUFLLENBQUNFLEdBQUcsRUFBRTtNQUNwSEMsY0FBYyxFQUFFLE9BQU87TUFDdkJDLFlBQVksRUFBRSxFQUFFO01BQ2hCQyxVQUFVLEVBQUUsR0FBRztNQUNmQyxTQUFTLEVBQUUsRUFBRTtNQUNiQyxjQUFjLEVBQUUsQ0FBQztNQUNqQkMsV0FBVyxFQUFFLENBQUM7TUFDZEMsZUFBZSxFQUFFLEVBQUU7TUFDbkJDLGVBQWUsRUFBRSxDQUFDO01BQ2xCQyxTQUFTLEVBQUU7SUFDYixDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNQyxRQUFRLEdBQUcsSUFBSTFCLGtCQUFrQixDQUFFRyxXQUFXLEVBQUVDLGFBQWEsRUFBRTtNQUNuRXVCLFFBQVEsRUFBRSxDQUFDLEdBQUdkLGVBQWUsQ0FBQ2UsS0FBSztNQUNuQ0MsTUFBTSxFQUFFdkIsT0FBTyxDQUFDdUIsTUFBTSxDQUFDQyxZQUFZLENBQUUsVUFBVztJQUNsRCxDQUFFLENBQUM7SUFFSHhCLE9BQU8sQ0FBQ3lCLFFBQVEsR0FBRyxDQUFFTCxRQUFRLEVBQUViLGVBQWUsQ0FBRTtJQUVoRCxLQUFLLENBQUVQLE9BQVEsQ0FBQztFQUNsQjtFQUVnQjBCLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBakMsYUFBYSxDQUFDbUMsUUFBUSxDQUFFLDhCQUE4QixFQUFFakMsNEJBQTZCLENBQUMifQ==