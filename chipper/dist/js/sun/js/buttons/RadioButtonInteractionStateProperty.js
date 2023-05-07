// Copyright 2014-2022, University of Colorado Boulder

/**
 * A DerivedProperty that maps ButtonModel states to the states needed by the radio button view.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import { DerivedProperty5 } from '../../../axon/js/DerivedProperty.js';
import sun from '../sun.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';
export default class RadioButtonInteractionStateProperty extends DerivedProperty5 {
  /**
   * @param buttonModel
   * @param property - the axon Property set by the button
   * @param value - the value set by the button
   */
  constructor(buttonModel, property, value) {
    super([buttonModel.focusedProperty, buttonModel.overProperty, buttonModel.looksOverProperty, buttonModel.looksPressedProperty, property], (focused, over, looksOver, looksPressed, propertyValue) => {
      const isSelected = propertyValue === value;
      return looksOver && !(looksPressed || isSelected) ? RadioButtonInteractionState.OVER : (over || focused) && looksPressed ? RadioButtonInteractionState.PRESSED : isSelected ? RadioButtonInteractionState.SELECTED : RadioButtonInteractionState.DESELECTED;
    }, {
      valueType: RadioButtonInteractionState
    });
  }
}
sun.register('RadioButtonInteractionStateProperty', RadioButtonInteractionStateProperty);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHk1Iiwic3VuIiwiUmFkaW9CdXR0b25JbnRlcmFjdGlvblN0YXRlIiwiUmFkaW9CdXR0b25JbnRlcmFjdGlvblN0YXRlUHJvcGVydHkiLCJjb25zdHJ1Y3RvciIsImJ1dHRvbk1vZGVsIiwicHJvcGVydHkiLCJ2YWx1ZSIsImZvY3VzZWRQcm9wZXJ0eSIsIm92ZXJQcm9wZXJ0eSIsImxvb2tzT3ZlclByb3BlcnR5IiwibG9va3NQcmVzc2VkUHJvcGVydHkiLCJmb2N1c2VkIiwib3ZlciIsImxvb2tzT3ZlciIsImxvb2tzUHJlc3NlZCIsInByb3BlcnR5VmFsdWUiLCJpc1NlbGVjdGVkIiwiT1ZFUiIsIlBSRVNTRUQiLCJTRUxFQ1RFRCIsIkRFU0VMRUNURUQiLCJ2YWx1ZVR5cGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJhZGlvQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgRGVyaXZlZFByb3BlcnR5IHRoYXQgbWFwcyBCdXR0b25Nb2RlbCBzdGF0ZXMgdG8gdGhlIHN0YXRlcyBuZWVkZWQgYnkgdGhlIHJhZGlvIGJ1dHRvbiB2aWV3LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFhcm9uIERhdmlzIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IERlcml2ZWRQcm9wZXJ0eTUgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBzdW4gZnJvbSAnLi4vc3VuLmpzJztcclxuaW1wb3J0IFJhZGlvQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZSBmcm9tICcuL1JhZGlvQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQnV0dG9uTW9kZWwgZnJvbSAnLi9CdXR0b25Nb2RlbC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSYWRpb0J1dHRvbkludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eTxUPiBleHRlbmRzIERlcml2ZWRQcm9wZXJ0eTU8UmFkaW9CdXR0b25JbnRlcmFjdGlvblN0YXRlLCBib29sZWFuLCBib29sZWFuLCBib29sZWFuLCBib29sZWFuLCBUPiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBidXR0b25Nb2RlbFxyXG4gICAqIEBwYXJhbSBwcm9wZXJ0eSAtIHRoZSBheG9uIFByb3BlcnR5IHNldCBieSB0aGUgYnV0dG9uXHJcbiAgICogQHBhcmFtIHZhbHVlIC0gdGhlIHZhbHVlIHNldCBieSB0aGUgYnV0dG9uXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBidXR0b25Nb2RlbDogQnV0dG9uTW9kZWwsIHByb3BlcnR5OiBUUHJvcGVydHk8VD4sIHZhbHVlOiBUICkge1xyXG4gICAgc3VwZXIoXHJcbiAgICAgIFsgYnV0dG9uTW9kZWwuZm9jdXNlZFByb3BlcnR5LCBidXR0b25Nb2RlbC5vdmVyUHJvcGVydHksIGJ1dHRvbk1vZGVsLmxvb2tzT3ZlclByb3BlcnR5LCBidXR0b25Nb2RlbC5sb29rc1ByZXNzZWRQcm9wZXJ0eSwgcHJvcGVydHkgXSxcclxuICAgICAgKCBmb2N1c2VkLCBvdmVyLCBsb29rc092ZXIsIGxvb2tzUHJlc3NlZCwgcHJvcGVydHlWYWx1ZSApID0+IHtcclxuICAgICAgICBjb25zdCBpc1NlbGVjdGVkID0gKCBwcm9wZXJ0eVZhbHVlID09PSB2YWx1ZSApO1xyXG4gICAgICAgIHJldHVybiBsb29rc092ZXIgJiYgISggbG9va3NQcmVzc2VkIHx8IGlzU2VsZWN0ZWQgKSA/IFJhZGlvQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5PVkVSIDpcclxuICAgICAgICAgICAgICAgKCBvdmVyIHx8IGZvY3VzZWQgKSAmJiBsb29rc1ByZXNzZWQgPyBSYWRpb0J1dHRvbkludGVyYWN0aW9uU3RhdGUuUFJFU1NFRCA6XHJcbiAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQgPyBSYWRpb0J1dHRvbkludGVyYWN0aW9uU3RhdGUuU0VMRUNURUQgOlxyXG4gICAgICAgICAgICAgICBSYWRpb0J1dHRvbkludGVyYWN0aW9uU3RhdGUuREVTRUxFQ1RFRDtcclxuICAgICAgfSxcclxuICAgICAgeyB2YWx1ZVR5cGU6IFJhZGlvQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZSB9XHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuc3VuLnJlZ2lzdGVyKCAnUmFkaW9CdXR0b25JbnRlcmFjdGlvblN0YXRlUHJvcGVydHknLCBSYWRpb0J1dHRvbkludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxnQkFBZ0IsUUFBUSxxQ0FBcUM7QUFDdEUsT0FBT0MsR0FBRyxNQUFNLFdBQVc7QUFDM0IsT0FBT0MsMkJBQTJCLE1BQU0sa0NBQWtDO0FBSTFFLGVBQWUsTUFBTUMsbUNBQW1DLFNBQVlILGdCQUFnQixDQUFxRTtFQUV2SjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ1NJLFdBQVdBLENBQUVDLFdBQXdCLEVBQUVDLFFBQXNCLEVBQUVDLEtBQVEsRUFBRztJQUMvRSxLQUFLLENBQ0gsQ0FBRUYsV0FBVyxDQUFDRyxlQUFlLEVBQUVILFdBQVcsQ0FBQ0ksWUFBWSxFQUFFSixXQUFXLENBQUNLLGlCQUFpQixFQUFFTCxXQUFXLENBQUNNLG9CQUFvQixFQUFFTCxRQUFRLENBQUUsRUFDcEksQ0FBRU0sT0FBTyxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsWUFBWSxFQUFFQyxhQUFhLEtBQU07TUFDM0QsTUFBTUMsVUFBVSxHQUFLRCxhQUFhLEtBQUtULEtBQU87TUFDOUMsT0FBT08sU0FBUyxJQUFJLEVBQUdDLFlBQVksSUFBSUUsVUFBVSxDQUFFLEdBQUdmLDJCQUEyQixDQUFDZ0IsSUFBSSxHQUMvRSxDQUFFTCxJQUFJLElBQUlELE9BQU8sS0FBTUcsWUFBWSxHQUFHYiwyQkFBMkIsQ0FBQ2lCLE9BQU8sR0FDekVGLFVBQVUsR0FBR2YsMkJBQTJCLENBQUNrQixRQUFRLEdBQ2pEbEIsMkJBQTJCLENBQUNtQixVQUFVO0lBQy9DLENBQUMsRUFDRDtNQUFFQyxTQUFTLEVBQUVwQjtJQUE0QixDQUMzQyxDQUFDO0VBQ0g7QUFDRjtBQUVBRCxHQUFHLENBQUNzQixRQUFRLENBQUUscUNBQXFDLEVBQUVwQixtQ0FBb0MsQ0FBQyJ9