// Copyright 2013-2023, University of Colorado Boulder

/**
 * Picker for changing a component of slope.
 * Avoids creating an undefined line with slope=0/0.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberPicker from '../../../../../sun/js/NumberPicker.js';
import graphingLines from '../../../graphingLines.js';
import GLColors from '../../GLColors.js';
import GLConstants from '../../GLConstants.js';
import { optionize4 } from '../../../../../phet-core/js/optionize.js';
export default class SlopePicker extends NumberPicker {
  /**
   * @param variableComponentProperty - the part of the slope we're manipulating
   * @param fixedComponentProperty - the part of the slope we're not manipulating
   * @param variableRangeProperty - the range of variableComponentProperty
   * @param [providedOptions]
   */
  constructor(variableComponentProperty, fixedComponentProperty, variableRangeProperty, providedOptions) {
    const options = optionize4()({}, GLConstants.NUMBER_PICKER_OPTIONS, {
      // NumberPickerOptions
      color: GLColors.SLOPE
    }, providedOptions);

    // increment function, skips over undefined line condition (slope=0/0) - not changeable by clients
    options.incrementFunction = variable => {
      return variable === -1 && fixedComponentProperty.value === 0 ? 1 : variable + 1;
    };

    // decrement function, skips over undefined line condition (slope=0/0) - not changeable by clients
    options.decrementFunction = variable => {
      return variable === 1 && fixedComponentProperty.value === 0 ? -1 : variable - 1;
    };
    super(variableComponentProperty, variableRangeProperty, options);
  }
}
graphingLines.register('SlopePicker', SlopePicker);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQaWNrZXIiLCJncmFwaGluZ0xpbmVzIiwiR0xDb2xvcnMiLCJHTENvbnN0YW50cyIsIm9wdGlvbml6ZTQiLCJTbG9wZVBpY2tlciIsImNvbnN0cnVjdG9yIiwidmFyaWFibGVDb21wb25lbnRQcm9wZXJ0eSIsImZpeGVkQ29tcG9uZW50UHJvcGVydHkiLCJ2YXJpYWJsZVJhbmdlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiTlVNQkVSX1BJQ0tFUl9PUFRJT05TIiwiY29sb3IiLCJTTE9QRSIsImluY3JlbWVudEZ1bmN0aW9uIiwidmFyaWFibGUiLCJ2YWx1ZSIsImRlY3JlbWVudEZ1bmN0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTbG9wZVBpY2tlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQaWNrZXIgZm9yIGNoYW5naW5nIGEgY29tcG9uZW50IG9mIHNsb3BlLlxyXG4gKiBBdm9pZHMgY3JlYXRpbmcgYW4gdW5kZWZpbmVkIGxpbmUgd2l0aCBzbG9wZT0wLzAuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xyXG5pbXBvcnQgTnVtYmVyUGlja2VyLCB7IE51bWJlclBpY2tlck9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvTnVtYmVyUGlja2VyLmpzJztcclxuaW1wb3J0IGdyYXBoaW5nTGluZXMgZnJvbSAnLi4vLi4vLi4vZ3JhcGhpbmdMaW5lcy5qcyc7XHJcbmltcG9ydCBHTENvbG9ycyBmcm9tICcuLi8uLi9HTENvbG9ycy5qcyc7XHJcbmltcG9ydCBHTENvbnN0YW50cyBmcm9tICcuLi8uLi9HTENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCB7IEVtcHR5U2VsZk9wdGlvbnMsIG9wdGlvbml6ZTQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBTbG9wZVBpY2tlck9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tPcHRpb25hbDxOdW1iZXJQaWNrZXJPcHRpb25zLCAnZm9udCcgfCAnY29sb3InIHwgJ2RlY2ltYWxQbGFjZXMnPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNsb3BlUGlja2VyIGV4dGVuZHMgTnVtYmVyUGlja2VyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHZhcmlhYmxlQ29tcG9uZW50UHJvcGVydHkgLSB0aGUgcGFydCBvZiB0aGUgc2xvcGUgd2UncmUgbWFuaXB1bGF0aW5nXHJcbiAgICogQHBhcmFtIGZpeGVkQ29tcG9uZW50UHJvcGVydHkgLSB0aGUgcGFydCBvZiB0aGUgc2xvcGUgd2UncmUgbm90IG1hbmlwdWxhdGluZ1xyXG4gICAqIEBwYXJhbSB2YXJpYWJsZVJhbmdlUHJvcGVydHkgLSB0aGUgcmFuZ2Ugb2YgdmFyaWFibGVDb21wb25lbnRQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdmFyaWFibGVDb21wb25lbnRQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgICAgICAgIGZpeGVkQ29tcG9uZW50UHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZVJhbmdlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFJhbmdlPixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IFNsb3BlUGlja2VyT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplNDxTbG9wZVBpY2tlck9wdGlvbnMsIFNlbGZPcHRpb25zLCBOdW1iZXJQaWNrZXJPcHRpb25zPigpKCB7fSwgR0xDb25zdGFudHMuTlVNQkVSX1BJQ0tFUl9PUFRJT05TLCB7XHJcblxyXG4gICAgICAvLyBOdW1iZXJQaWNrZXJPcHRpb25zXHJcbiAgICAgIGNvbG9yOiBHTENvbG9ycy5TTE9QRVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gaW5jcmVtZW50IGZ1bmN0aW9uLCBza2lwcyBvdmVyIHVuZGVmaW5lZCBsaW5lIGNvbmRpdGlvbiAoc2xvcGU9MC8wKSAtIG5vdCBjaGFuZ2VhYmxlIGJ5IGNsaWVudHNcclxuICAgIG9wdGlvbnMuaW5jcmVtZW50RnVuY3Rpb24gPSB2YXJpYWJsZSA9PiB7XHJcbiAgICAgIHJldHVybiAoIHZhcmlhYmxlID09PSAtMSAmJiBmaXhlZENvbXBvbmVudFByb3BlcnR5LnZhbHVlID09PSAwICkgPyAxIDogdmFyaWFibGUgKyAxO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBkZWNyZW1lbnQgZnVuY3Rpb24sIHNraXBzIG92ZXIgdW5kZWZpbmVkIGxpbmUgY29uZGl0aW9uIChzbG9wZT0wLzApIC0gbm90IGNoYW5nZWFibGUgYnkgY2xpZW50c1xyXG4gICAgb3B0aW9ucy5kZWNyZW1lbnRGdW5jdGlvbiA9IHZhcmlhYmxlID0+IHtcclxuICAgICAgcmV0dXJuICggdmFyaWFibGUgPT09IDEgJiYgZml4ZWRDb21wb25lbnRQcm9wZXJ0eS52YWx1ZSA9PT0gMCApID8gLTEgOiB2YXJpYWJsZSAtIDE7XHJcbiAgICB9O1xyXG5cclxuICAgIHN1cGVyKCB2YXJpYWJsZUNvbXBvbmVudFByb3BlcnR5LCB2YXJpYWJsZVJhbmdlUHJvcGVydHksIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmdyYXBoaW5nTGluZXMucmVnaXN0ZXIoICdTbG9wZVBpY2tlcicsIFNsb3BlUGlja2VyICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBTUEsT0FBT0EsWUFBWSxNQUErQix1Q0FBdUM7QUFDekYsT0FBT0MsYUFBYSxNQUFNLDJCQUEyQjtBQUNyRCxPQUFPQyxRQUFRLE1BQU0sbUJBQW1CO0FBQ3hDLE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsU0FBMkJDLFVBQVUsUUFBUSwwQ0FBMEM7QUFNdkYsZUFBZSxNQUFNQyxXQUFXLFNBQVNMLFlBQVksQ0FBQztFQUVwRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU00sV0FBV0EsQ0FBRUMseUJBQTJDLEVBQzNDQyxzQkFBaUQsRUFDakRDLHFCQUErQyxFQUMvQ0MsZUFBb0MsRUFBRztJQUV6RCxNQUFNQyxPQUFPLEdBQUdQLFVBQVUsQ0FBdUQsQ0FBQyxDQUFFLENBQUMsQ0FBQyxFQUFFRCxXQUFXLENBQUNTLHFCQUFxQixFQUFFO01BRXpIO01BQ0FDLEtBQUssRUFBRVgsUUFBUSxDQUFDWTtJQUNsQixDQUFDLEVBQUVKLGVBQWdCLENBQUM7O0lBRXBCO0lBQ0FDLE9BQU8sQ0FBQ0ksaUJBQWlCLEdBQUdDLFFBQVEsSUFBSTtNQUN0QyxPQUFTQSxRQUFRLEtBQUssQ0FBQyxDQUFDLElBQUlSLHNCQUFzQixDQUFDUyxLQUFLLEtBQUssQ0FBQyxHQUFLLENBQUMsR0FBR0QsUUFBUSxHQUFHLENBQUM7SUFDckYsQ0FBQzs7SUFFRDtJQUNBTCxPQUFPLENBQUNPLGlCQUFpQixHQUFHRixRQUFRLElBQUk7TUFDdEMsT0FBU0EsUUFBUSxLQUFLLENBQUMsSUFBSVIsc0JBQXNCLENBQUNTLEtBQUssS0FBSyxDQUFDLEdBQUssQ0FBQyxDQUFDLEdBQUdELFFBQVEsR0FBRyxDQUFDO0lBQ3JGLENBQUM7SUFFRCxLQUFLLENBQUVULHlCQUF5QixFQUFFRSxxQkFBcUIsRUFBRUUsT0FBUSxDQUFDO0VBQ3BFO0FBQ0Y7QUFFQVYsYUFBYSxDQUFDa0IsUUFBUSxDQUFFLGFBQWEsRUFBRWQsV0FBWSxDQUFDIn0=