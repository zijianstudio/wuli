// Copyright 2021-2023, University of Colorado Boulder

/**
 * IndexOfRefractionControl is the control for changing the lens' index of refraction (IOR).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import geometricOptics from '../../geometricOptics.js';
import GeometricOpticsStrings from '../../GeometricOpticsStrings.js';
import GOConstants from '../GOConstants.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
export default class IndexOfRefractionControl extends NumberControl {
  constructor(indexOfRefractionProperty, providedOptions) {
    const range = indexOfRefractionProperty.range;

    // Assemble the defaults for NumberControl, because optionize doesn't support defaults in multiple objects.
    const numberControlDefaults = combineOptions({}, GOConstants.NUMBER_CONTROL_OPTIONS, {
      delta: GOConstants.INDEX_OF_REFRACTION_SPINNER_STEP,
      sliderOptions: {
        constrainValue: value => Utils.roundToInterval(value, GOConstants.INDEX_OF_REFRACTION_SLIDER_STEP),
        keyboardStep: GOConstants.INDEX_OF_REFRACTION_KEYBOARD_STEP,
        // used by all alternative-input devices
        shiftKeyboardStep: GOConstants.INDEX_OF_REFRACTION_SHIFT_KEYBOARD_STEP,
        // finer grain, used by keyboard only
        pageKeyboardStep: GOConstants.INDEX_OF_REFRACTION_PAGE_KEYBOARD_STEP
      },
      numberDisplayOptions: {
        decimalPlaces: GOConstants.INDEX_OF_REFRACTION_DECIMAL_PLACES
      }
    });

    // Now add providedOptions to the defaults.
    const options = optionize()(numberControlDefaults, providedOptions);
    super(GeometricOpticsStrings.indexOfRefractionStringProperty, indexOfRefractionProperty, range, options);
    this.addLinkedElement(indexOfRefractionProperty, {
      tandem: options.tandem.createTandem(indexOfRefractionProperty.tandem.name)
    });
  }
}
geometricOptics.register('IndexOfRefractionControl', IndexOfRefractionControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJDb250cm9sIiwiZ2VvbWV0cmljT3B0aWNzIiwiR2VvbWV0cmljT3B0aWNzU3RyaW5ncyIsIkdPQ29uc3RhbnRzIiwiVXRpbHMiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIkluZGV4T2ZSZWZyYWN0aW9uQ29udHJvbCIsImNvbnN0cnVjdG9yIiwiaW5kZXhPZlJlZnJhY3Rpb25Qcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsInJhbmdlIiwibnVtYmVyQ29udHJvbERlZmF1bHRzIiwiTlVNQkVSX0NPTlRST0xfT1BUSU9OUyIsImRlbHRhIiwiSU5ERVhfT0ZfUkVGUkFDVElPTl9TUElOTkVSX1NURVAiLCJzbGlkZXJPcHRpb25zIiwiY29uc3RyYWluVmFsdWUiLCJ2YWx1ZSIsInJvdW5kVG9JbnRlcnZhbCIsIklOREVYX09GX1JFRlJBQ1RJT05fU0xJREVSX1NURVAiLCJrZXlib2FyZFN0ZXAiLCJJTkRFWF9PRl9SRUZSQUNUSU9OX0tFWUJPQVJEX1NURVAiLCJzaGlmdEtleWJvYXJkU3RlcCIsIklOREVYX09GX1JFRlJBQ1RJT05fU0hJRlRfS0VZQk9BUkRfU1RFUCIsInBhZ2VLZXlib2FyZFN0ZXAiLCJJTkRFWF9PRl9SRUZSQUNUSU9OX1BBR0VfS0VZQk9BUkRfU1RFUCIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwiZGVjaW1hbFBsYWNlcyIsIklOREVYX09GX1JFRlJBQ1RJT05fREVDSU1BTF9QTEFDRVMiLCJvcHRpb25zIiwiaW5kZXhPZlJlZnJhY3Rpb25TdHJpbmdQcm9wZXJ0eSIsImFkZExpbmtlZEVsZW1lbnQiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJuYW1lIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbmRleE9mUmVmcmFjdGlvbkNvbnRyb2wudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSW5kZXhPZlJlZnJhY3Rpb25Db250cm9sIGlzIHRoZSBjb250cm9sIGZvciBjaGFuZ2luZyB0aGUgbGVucycgaW5kZXggb2YgcmVmcmFjdGlvbiAoSU9SKS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyQ29udHJvbCwgeyBOdW1iZXJDb250cm9sT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJDb250cm9sLmpzJztcclxuaW1wb3J0IGdlb21ldHJpY09wdGljcyBmcm9tICcuLi8uLi9nZW9tZXRyaWNPcHRpY3MuanMnO1xyXG5pbXBvcnQgR2VvbWV0cmljT3B0aWNzU3RyaW5ncyBmcm9tICcuLi8uLi9HZW9tZXRyaWNPcHRpY3NTdHJpbmdzLmpzJztcclxuaW1wb3J0IEdPQ29uc3RhbnRzIGZyb20gJy4uL0dPQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgSW5kZXhPZlJlZnJhY3Rpb25Db250cm9sT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPE51bWJlckNvbnRyb2xPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbmRleE9mUmVmcmFjdGlvbkNvbnRyb2wgZXh0ZW5kcyBOdW1iZXJDb250cm9sIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBpbmRleE9mUmVmcmFjdGlvblByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eSwgcHJvdmlkZWRPcHRpb25zOiBJbmRleE9mUmVmcmFjdGlvbkNvbnRyb2xPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IHJhbmdlID0gaW5kZXhPZlJlZnJhY3Rpb25Qcm9wZXJ0eS5yYW5nZTtcclxuXHJcbiAgICAvLyBBc3NlbWJsZSB0aGUgZGVmYXVsdHMgZm9yIE51bWJlckNvbnRyb2wsIGJlY2F1c2Ugb3B0aW9uaXplIGRvZXNuJ3Qgc3VwcG9ydCBkZWZhdWx0cyBpbiBtdWx0aXBsZSBvYmplY3RzLlxyXG4gICAgY29uc3QgbnVtYmVyQ29udHJvbERlZmF1bHRzID0gY29tYmluZU9wdGlvbnM8U3RyaWN0T21pdDxOdW1iZXJDb250cm9sT3B0aW9ucywgJ3RhbmRlbSc+Pigge30sIEdPQ29uc3RhbnRzLk5VTUJFUl9DT05UUk9MX09QVElPTlMsIHtcclxuICAgICAgZGVsdGE6IEdPQ29uc3RhbnRzLklOREVYX09GX1JFRlJBQ1RJT05fU1BJTk5FUl9TVEVQLFxyXG4gICAgICBzbGlkZXJPcHRpb25zOiB7XHJcbiAgICAgICAgY29uc3RyYWluVmFsdWU6ICggdmFsdWU6IG51bWJlciApID0+XHJcbiAgICAgICAgICBVdGlscy5yb3VuZFRvSW50ZXJ2YWwoIHZhbHVlLCBHT0NvbnN0YW50cy5JTkRFWF9PRl9SRUZSQUNUSU9OX1NMSURFUl9TVEVQICksXHJcbiAgICAgICAga2V5Ym9hcmRTdGVwOiBHT0NvbnN0YW50cy5JTkRFWF9PRl9SRUZSQUNUSU9OX0tFWUJPQVJEX1NURVAsIC8vIHVzZWQgYnkgYWxsIGFsdGVybmF0aXZlLWlucHV0IGRldmljZXNcclxuICAgICAgICBzaGlmdEtleWJvYXJkU3RlcDogR09Db25zdGFudHMuSU5ERVhfT0ZfUkVGUkFDVElPTl9TSElGVF9LRVlCT0FSRF9TVEVQLCAvLyBmaW5lciBncmFpbiwgdXNlZCBieSBrZXlib2FyZCBvbmx5XHJcbiAgICAgICAgcGFnZUtleWJvYXJkU3RlcDogR09Db25zdGFudHMuSU5ERVhfT0ZfUkVGUkFDVElPTl9QQUdFX0tFWUJPQVJEX1NURVBcclxuICAgICAgfSxcclxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICBkZWNpbWFsUGxhY2VzOiBHT0NvbnN0YW50cy5JTkRFWF9PRl9SRUZSQUNUSU9OX0RFQ0lNQUxfUExBQ0VTXHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBOb3cgYWRkIHByb3ZpZGVkT3B0aW9ucyB0byB0aGUgZGVmYXVsdHMuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEluZGV4T2ZSZWZyYWN0aW9uQ29udHJvbE9wdGlvbnMsIFNlbGZPcHRpb25zLCBOdW1iZXJDb250cm9sT3B0aW9ucz4oKShcclxuICAgICAgbnVtYmVyQ29udHJvbERlZmF1bHRzLCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggR2VvbWV0cmljT3B0aWNzU3RyaW5ncy5pbmRleE9mUmVmcmFjdGlvblN0cmluZ1Byb3BlcnR5LCBpbmRleE9mUmVmcmFjdGlvblByb3BlcnR5LCByYW5nZSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuYWRkTGlua2VkRWxlbWVudCggaW5kZXhPZlJlZnJhY3Rpb25Qcm9wZXJ0eSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggaW5kZXhPZlJlZnJhY3Rpb25Qcm9wZXJ0eS50YW5kZW0ubmFtZSApXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5nZW9tZXRyaWNPcHRpY3MucmVnaXN0ZXIoICdJbmRleE9mUmVmcmFjdGlvbkNvbnRyb2wnLCBJbmRleE9mUmVmcmFjdGlvbkNvbnRyb2wgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsYUFBYSxNQUFnQyw4Q0FBOEM7QUFDbEcsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyxzQkFBc0IsTUFBTSxpQ0FBaUM7QUFDcEUsT0FBT0MsV0FBVyxNQUFNLG1CQUFtQjtBQUMzQyxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBRy9DLE9BQU9DLFNBQVMsSUFBSUMsY0FBYyxRQUEwQix1Q0FBdUM7QUFPbkcsZUFBZSxNQUFNQyx3QkFBd0IsU0FBU1AsYUFBYSxDQUFDO0VBRTNEUSxXQUFXQSxDQUFFQyx5QkFBeUMsRUFBRUMsZUFBZ0QsRUFBRztJQUVoSCxNQUFNQyxLQUFLLEdBQUdGLHlCQUF5QixDQUFDRSxLQUFLOztJQUU3QztJQUNBLE1BQU1DLHFCQUFxQixHQUFHTixjQUFjLENBQThDLENBQUMsQ0FBQyxFQUFFSCxXQUFXLENBQUNVLHNCQUFzQixFQUFFO01BQ2hJQyxLQUFLLEVBQUVYLFdBQVcsQ0FBQ1ksZ0NBQWdDO01BQ25EQyxhQUFhLEVBQUU7UUFDYkMsY0FBYyxFQUFJQyxLQUFhLElBQzdCZCxLQUFLLENBQUNlLGVBQWUsQ0FBRUQsS0FBSyxFQUFFZixXQUFXLENBQUNpQiwrQkFBZ0MsQ0FBQztRQUM3RUMsWUFBWSxFQUFFbEIsV0FBVyxDQUFDbUIsaUNBQWlDO1FBQUU7UUFDN0RDLGlCQUFpQixFQUFFcEIsV0FBVyxDQUFDcUIsdUNBQXVDO1FBQUU7UUFDeEVDLGdCQUFnQixFQUFFdEIsV0FBVyxDQUFDdUI7TUFDaEMsQ0FBQztNQUNEQyxvQkFBb0IsRUFBRTtRQUNwQkMsYUFBYSxFQUFFekIsV0FBVyxDQUFDMEI7TUFDN0I7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNQyxPQUFPLEdBQUd6QixTQUFTLENBQXFFLENBQUMsQ0FDN0ZPLHFCQUFxQixFQUFFRixlQUFnQixDQUFDO0lBRTFDLEtBQUssQ0FBRVIsc0JBQXNCLENBQUM2QiwrQkFBK0IsRUFBRXRCLHlCQUF5QixFQUFFRSxLQUFLLEVBQUVtQixPQUFRLENBQUM7SUFFMUcsSUFBSSxDQUFDRSxnQkFBZ0IsQ0FBRXZCLHlCQUF5QixFQUFFO01BQ2hEd0IsTUFBTSxFQUFFSCxPQUFPLENBQUNHLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFekIseUJBQXlCLENBQUN3QixNQUFNLENBQUNFLElBQUs7SUFDN0UsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBbEMsZUFBZSxDQUFDbUMsUUFBUSxDQUFFLDBCQUEwQixFQUFFN0Isd0JBQXlCLENBQUMifQ==