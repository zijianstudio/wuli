// Copyright 2016-2022, University of Colorado Boulder

/**
 * base type for an object that accumulates key presses, works in conjunction with the common-code keypad
 *
 * @author John Blanco
 * @author Aadish Gupta
 */

import Property from '../../../axon/js/Property.js';
import sceneryPhet from '../sceneryPhet.js';
import KeyID from './KeyID.js';
class AbstractKeyAccumulator {
  // string representation of the keys entered by the user

  // numerical value of the keys entered by the user

  // Property that tracks the accumulated key presses as an array
  accumulatedKeysProperty = new Property([]);

  // When true, the next key press (expect backspace) will clear the accumulated value
  _clearOnNextKeyPress = false;
  constructor(validators) {
    this.validators = validators;
  }
  get clearOnNextKeyPress() {
    return this.getClearOnNextKeyPress();
  }
  set clearOnNextKeyPress(value) {
    this.setClearOnNextKeyPress(value);
  }

  /**
   * Clears the accumulated keys.
   */
  clear() {
    this.accumulatedKeysProperty.reset();
  }

  /**
   * Sets/clears the flag that determines whether pressing a key (except for backspace) will clear the accumulated keys.
   */
  setClearOnNextKeyPress(clearOnNextKeyPress) {
    this._clearOnNextKeyPress = clearOnNextKeyPress;
  }

  /**
   * Gets the value of the flag determines whether pressing a key (except for backspace) will clear the accumulated keys.
   */
  getClearOnNextKeyPress() {
    return this._clearOnNextKeyPress;
  }

  /**
   * validates a proposed set of keys and (if valid) update the property that represents the accumulated keys
   * @param proposedKeys - the proposed set of keys, to be validated
   *
   * @returns boolean
   */
  validateKeys(proposedKeys) {
    // Ensures that proposedKeys exist before validation
    let valid = !!proposedKeys;

    // If any validator returns false then the proposedKey is not valid
    this.validators.forEach(validator => {
      valid = valid && validator(proposedKeys);
    });
    return valid;
  }

  /**
   * update the property that represents the accumulated keys
   * @param proposedKeys - the proposed set of keys
   */
  updateKeys(proposedKeys) {
    this.accumulatedKeysProperty.set(proposedKeys);
  }

  /**
   * Called by the key accumulator when this key is pressed.
   */

  /**
   * creates an empty array if clearOnNextKeyPress is true, the behavior differs if Backspace key is pressed
   */
  handleClearOnNextKeyPress(keyIdentifier) {
    let proposedArray;
    if (!this.getClearOnNextKeyPress() || keyIdentifier === KeyID.BACKSPACE) {
      proposedArray = _.clone(this.accumulatedKeysProperty.get());
    } else {
      proposedArray = [];
    }
    this.setClearOnNextKeyPress(false);
    return proposedArray;
  }
  dispose() {
    this.accumulatedKeysProperty.dispose();
  }
}
sceneryPhet.register('AbstractKeyAccumulator', AbstractKeyAccumulator);
export default AbstractKeyAccumulator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsInNjZW5lcnlQaGV0IiwiS2V5SUQiLCJBYnN0cmFjdEtleUFjY3VtdWxhdG9yIiwiYWNjdW11bGF0ZWRLZXlzUHJvcGVydHkiLCJfY2xlYXJPbk5leHRLZXlQcmVzcyIsImNvbnN0cnVjdG9yIiwidmFsaWRhdG9ycyIsImNsZWFyT25OZXh0S2V5UHJlc3MiLCJnZXRDbGVhck9uTmV4dEtleVByZXNzIiwidmFsdWUiLCJzZXRDbGVhck9uTmV4dEtleVByZXNzIiwiY2xlYXIiLCJyZXNldCIsInZhbGlkYXRlS2V5cyIsInByb3Bvc2VkS2V5cyIsInZhbGlkIiwiZm9yRWFjaCIsInZhbGlkYXRvciIsInVwZGF0ZUtleXMiLCJzZXQiLCJoYW5kbGVDbGVhck9uTmV4dEtleVByZXNzIiwia2V5SWRlbnRpZmllciIsInByb3Bvc2VkQXJyYXkiLCJCQUNLU1BBQ0UiLCJfIiwiY2xvbmUiLCJnZXQiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBYnN0cmFjdEtleUFjY3VtdWxhdG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIGJhc2UgdHlwZSBmb3IgYW4gb2JqZWN0IHRoYXQgYWNjdW11bGF0ZXMga2V5IHByZXNzZXMsIHdvcmtzIGluIGNvbmp1bmN0aW9uIHdpdGggdGhlIGNvbW1vbi1jb2RlIGtleXBhZFxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgQWFkaXNoIEd1cHRhXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vc2NlbmVyeVBoZXQuanMnO1xyXG5pbXBvcnQgS2V5SUQsIHsgS2V5SURWYWx1ZSB9IGZyb20gJy4vS2V5SUQuanMnO1xyXG5cclxuYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RLZXlBY2N1bXVsYXRvciB7XHJcblxyXG4gIC8vIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUga2V5cyBlbnRlcmVkIGJ5IHRoZSB1c2VyXHJcbiAgcHVibGljIGFic3RyYWN0IHJlYWRvbmx5IHN0cmluZ1Byb3BlcnR5OiBSZWFkT25seVByb3BlcnR5PHN0cmluZz47XHJcblxyXG4gIC8vIG51bWVyaWNhbCB2YWx1ZSBvZiB0aGUga2V5cyBlbnRlcmVkIGJ5IHRoZSB1c2VyXHJcbiAgcHVibGljIGFic3RyYWN0IHJlYWRvbmx5IHZhbHVlUHJvcGVydHk6IFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyIHwgbnVsbD47XHJcblxyXG4gIC8vIFByb3BlcnR5IHRoYXQgdHJhY2tzIHRoZSBhY2N1bXVsYXRlZCBrZXkgcHJlc3NlcyBhcyBhbiBhcnJheVxyXG4gIHB1YmxpYyByZWFkb25seSBhY2N1bXVsYXRlZEtleXNQcm9wZXJ0eTogUHJvcGVydHk8S2V5SURWYWx1ZVtdPiA9IG5ldyBQcm9wZXJ0eTxLZXlJRFZhbHVlW10+KCBbXSApO1xyXG5cclxuICAvLyBXaGVuIHRydWUsIHRoZSBuZXh0IGtleSBwcmVzcyAoZXhwZWN0IGJhY2tzcGFjZSkgd2lsbCBjbGVhciB0aGUgYWNjdW11bGF0ZWQgdmFsdWVcclxuICBwdWJsaWMgX2NsZWFyT25OZXh0S2V5UHJlc3MgPSBmYWxzZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm90ZWN0ZWQgcmVhZG9ubHkgdmFsaWRhdG9yczogKCAoIGtleXM6IEtleUlEVmFsdWVbXSApID0+IGJvb2xlYW4gKVtdICkge1xyXG5cclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgY2xlYXJPbk5leHRLZXlQcmVzcygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0Q2xlYXJPbk5leHRLZXlQcmVzcygpOyB9XHJcblxyXG4gIHB1YmxpYyBzZXQgY2xlYXJPbk5leHRLZXlQcmVzcyggdmFsdWU6IGJvb2xlYW4gKSB7IHRoaXMuc2V0Q2xlYXJPbk5leHRLZXlQcmVzcyggdmFsdWUgKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhcnMgdGhlIGFjY3VtdWxhdGVkIGtleXMuXHJcbiAgICovXHJcbiAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgdGhpcy5hY2N1bXVsYXRlZEtleXNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cy9jbGVhcnMgdGhlIGZsYWcgdGhhdCBkZXRlcm1pbmVzIHdoZXRoZXIgcHJlc3NpbmcgYSBrZXkgKGV4Y2VwdCBmb3IgYmFja3NwYWNlKSB3aWxsIGNsZWFyIHRoZSBhY2N1bXVsYXRlZCBrZXlzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRDbGVhck9uTmV4dEtleVByZXNzKCBjbGVhck9uTmV4dEtleVByZXNzOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgdGhpcy5fY2xlYXJPbk5leHRLZXlQcmVzcyA9IGNsZWFyT25OZXh0S2V5UHJlc3M7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiB0aGUgZmxhZyBkZXRlcm1pbmVzIHdoZXRoZXIgcHJlc3NpbmcgYSBrZXkgKGV4Y2VwdCBmb3IgYmFja3NwYWNlKSB3aWxsIGNsZWFyIHRoZSBhY2N1bXVsYXRlZCBrZXlzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDbGVhck9uTmV4dEtleVByZXNzKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NsZWFyT25OZXh0S2V5UHJlc3M7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiB2YWxpZGF0ZXMgYSBwcm9wb3NlZCBzZXQgb2Yga2V5cyBhbmQgKGlmIHZhbGlkKSB1cGRhdGUgdGhlIHByb3BlcnR5IHRoYXQgcmVwcmVzZW50cyB0aGUgYWNjdW11bGF0ZWQga2V5c1xyXG4gICAqIEBwYXJhbSBwcm9wb3NlZEtleXMgLSB0aGUgcHJvcG9zZWQgc2V0IG9mIGtleXMsIHRvIGJlIHZhbGlkYXRlZFxyXG4gICAqXHJcbiAgICogQHJldHVybnMgYm9vbGVhblxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCB2YWxpZGF0ZUtleXMoIHByb3Bvc2VkS2V5czogS2V5SURWYWx1ZVtdICk6IGJvb2xlYW4ge1xyXG5cclxuICAgIC8vIEVuc3VyZXMgdGhhdCBwcm9wb3NlZEtleXMgZXhpc3QgYmVmb3JlIHZhbGlkYXRpb25cclxuICAgIGxldCB2YWxpZCA9ICEhcHJvcG9zZWRLZXlzO1xyXG5cclxuICAgIC8vIElmIGFueSB2YWxpZGF0b3IgcmV0dXJucyBmYWxzZSB0aGVuIHRoZSBwcm9wb3NlZEtleSBpcyBub3QgdmFsaWRcclxuICAgIHRoaXMudmFsaWRhdG9ycy5mb3JFYWNoKCB2YWxpZGF0b3IgPT4ge1xyXG4gICAgICB2YWxpZCA9IHZhbGlkICYmIHZhbGlkYXRvciggcHJvcG9zZWRLZXlzICk7XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gdmFsaWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiB1cGRhdGUgdGhlIHByb3BlcnR5IHRoYXQgcmVwcmVzZW50cyB0aGUgYWNjdW11bGF0ZWQga2V5c1xyXG4gICAqIEBwYXJhbSBwcm9wb3NlZEtleXMgLSB0aGUgcHJvcG9zZWQgc2V0IG9mIGtleXNcclxuICAgKi9cclxuICBwcm90ZWN0ZWQgdXBkYXRlS2V5cyggcHJvcG9zZWRLZXlzOiBLZXlJRFZhbHVlW10gKTogdm9pZCB7XHJcbiAgICB0aGlzLmFjY3VtdWxhdGVkS2V5c1Byb3BlcnR5LnNldCggcHJvcG9zZWRLZXlzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgYnkgdGhlIGtleSBhY2N1bXVsYXRvciB3aGVuIHRoaXMga2V5IGlzIHByZXNzZWQuXHJcbiAgICovXHJcbiAgcHVibGljIGFic3RyYWN0IGhhbmRsZUtleVByZXNzZWQoIGtleUlkZW50aWZpZXI6IEtleUlEVmFsdWUgKTogdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogY3JlYXRlcyBhbiBlbXB0eSBhcnJheSBpZiBjbGVhck9uTmV4dEtleVByZXNzIGlzIHRydWUsIHRoZSBiZWhhdmlvciBkaWZmZXJzIGlmIEJhY2tzcGFjZSBrZXkgaXMgcHJlc3NlZFxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBoYW5kbGVDbGVhck9uTmV4dEtleVByZXNzKCBrZXlJZGVudGlmaWVyOiBLZXlJRFZhbHVlICk6IEtleUlEVmFsdWVbXSB7XHJcbiAgICBsZXQgcHJvcG9zZWRBcnJheTogS2V5SURWYWx1ZVtdO1xyXG4gICAgaWYgKCAhdGhpcy5nZXRDbGVhck9uTmV4dEtleVByZXNzKCkgfHwga2V5SWRlbnRpZmllciA9PT0gS2V5SUQuQkFDS1NQQUNFICkge1xyXG4gICAgICBwcm9wb3NlZEFycmF5ID0gXy5jbG9uZSggdGhpcy5hY2N1bXVsYXRlZEtleXNQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHByb3Bvc2VkQXJyYXkgPSBbXTtcclxuICAgIH1cclxuICAgIHRoaXMuc2V0Q2xlYXJPbk5leHRLZXlQcmVzcyggZmFsc2UgKTtcclxuICAgIHJldHVybiBwcm9wb3NlZEFycmF5O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmFjY3VtdWxhdGVkS2V5c1Byb3BlcnR5LmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnQWJzdHJhY3RLZXlBY2N1bXVsYXRvcicsIEFic3RyYWN0S2V5QWNjdW11bGF0b3IgKTtcclxuZXhwb3J0IGRlZmF1bHQgQWJzdHJhY3RLZXlBY2N1bXVsYXRvcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBRW5E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