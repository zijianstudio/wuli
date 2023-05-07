// Copyright 2013-2022, University of Colorado Boulder

/**
 * Basic button handling.
 *
 * Uses 4 states:
 * up: mouse not over, not pressed
 * over: mouse over, not pressed
 * down: mouse over, pressed
 * out: mouse not over, pressed
 *
 * TODO: offscreen handling
 * TODO: fix enter/exit edge cases for moving nodes or add/remove child, and when touches are created
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import deprecationWarning from '../../../phet-core/js/deprecationWarning.js';
import merge from '../../../phet-core/js/merge.js';
import EventType from '../../../tandem/js/EventType.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import { DownUpListener, scenery } from '../imports.js';

/**
 * @deprecated - please use FireListener for new code (set up for the `fire` callback to be easy, and has Properties
 * that can be checked for the other states or complicated cases)
 */
class ButtonListener extends DownUpListener {
  /**
   * Options for the ButtonListener:
   *
   * mouseButton: 0
   * fireOnDown: false // default is to fire on 'up' after 'down', but passing fireOnDown: true will fire on 'down' instead
   * up: null          // Called on an 'up' state change, as up( event, oldState )
   * over: null        // Called on an 'over' state change, as over( event, oldState )
   * down: null        // Called on an 'down' state change, as down( event, oldState )
   * out: null         // Called on an 'out' state change, as out( event, oldState )
   * fire: null        // Called on a state change to/from 'down' (depending on fireOnDown), as fire( event ). Called after the triggering up/over/down event.
   */
  constructor(options) {
    assert && deprecationWarning('ButtonListener is deprecated, please use FireListener instead');
    options = merge({
      // When running in PhET-iO brand, the tandem must be supplied
      tandem: Tandem.OPTIONAL,
      phetioType: ButtonListener.ButtonListenerIO,
      phetioState: false,
      phetioEventType: EventType.USER
    }, options);

    // TODO: pass through options
    super({
      tandem: options.tandem,
      phetioType: options.phetioType,
      phetioState: options.phetioState,
      mouseButton: options.mouseButton || 0,
      // forward the mouse button, default to 0 (LMB)

      // parameter to DownUpListener, NOT an input listener itself
      down: (event, trail) => {
        this.setButtonState(event, 'down');
      },
      // parameter to DownUpListener, NOT an input listener itself
      up: (event, trail) => {
        this.setButtonState(event, this._overCount > 0 ? 'over' : 'up');
      }
    });

    // @public {string} - 'up', 'over', 'down' or 'out'
    this.buttonState = 'up';

    // @private {number} - how many pointers are over us (track a count, so we can handle multiple pointers gracefully)
    this._overCount = 0;

    // @private {Object} - store the options object so we can call the callbacks
    this._buttonOptions = options;
  }

  /**
   * @public
   *
   * @param {SceneryEvent} event
   * @param {string} state
   */
  setButtonState(event, state) {
    if (state !== this.buttonState) {
      sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent(`ButtonListener state change to ${state} from ${this.buttonState} for ${this.downTrail ? this.downTrail.toString() : this.downTrail}`);
      const oldState = this.buttonState;
      this.buttonState = state;
      if (this._buttonOptions[state]) {
        // Record this event to the phet-io data stream, including all downstream events as nested children
        this.phetioStartEvent(state);

        // Then invoke the callback
        this._buttonOptions[state](event, oldState);
        this.phetioEndEvent();
      }
      if (this._buttonOptions.fire && this._overCount > 0 && !this.interrupted && (this._buttonOptions.fireOnDown ? state === 'down' : oldState === 'down')) {
        // Record this event to the phet-io data stream, including all downstream events as nested children
        this.phetioStartEvent('fire');

        // Then fire the event
        this._buttonOptions.fire(event);
        this.phetioEndEvent();
      }
    }
  }

  /**
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */
  enter(event) {
    sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent(`ButtonListener enter for ${this.downTrail ? this.downTrail.toString() : this.downTrail}`);
    this._overCount++;
    if (this._overCount === 1) {
      this.setButtonState(event, this.isDown ? 'down' : 'over');
    }
  }

  /**
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */
  exit(event) {
    sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent(`ButtonListener exit for ${this.downTrail ? this.downTrail.toString() : this.downTrail}`);
    assert && assert(this._overCount > 0, 'Exit events not matched by an enter');
    this._overCount--;
    if (this._overCount === 0) {
      this.setButtonState(event, this.isDown ? 'out' : 'up');
    }
  }

  /**
   * Called from "focus" events (part of the Scenery listener API). On focus the PDOMPointer is over the node
   * with the attached listener, so add to the over count.
   * @private
   *
   * @param {SceneryEvent} event
   */
  focus(event) {
    this.enter(event);
  }

  /**
   * Called from "blur" events (part of the Scenery listener API). On blur, the PDOMPointer leaves the node
   * with this listener so reduce the over count.
   * @private
   *
   * @param {SceneryEvent} event
   */
  blur(event) {
    this.exit(event);
  }

  /**
   * Called with "click" events (part of the Scenery listener API). Typically will be called from a keyboard
   * or assistive device.
   *
   * There are no `keyup` or `keydown` events when an assistive device is active. So we respond generally
   * to the single `click` event, which indicates a logical activation of this button.
   * TODO: This may change after https://github.com/phetsims/scenery/issues/1117 is done, at which point
   * `click` should likely be replaced by `keydown` and `keyup` listeners.
   * @private
   *
   * @param {SceneryEvent} event
   */
  click(event) {
    this.setButtonState(event, 'down');
    this.setButtonState(event, 'up');
  }
}
scenery.register('ButtonListener', ButtonListener);
ButtonListener.ButtonListenerIO = new IOType('ButtonListenerIO', {
  valueType: ButtonListener,
  documentation: 'Button listener',
  events: ['up', 'over', 'down', 'out', 'fire']
});
export default ButtonListener;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkZXByZWNhdGlvbldhcm5pbmciLCJtZXJnZSIsIkV2ZW50VHlwZSIsIlRhbmRlbSIsIklPVHlwZSIsIkRvd25VcExpc3RlbmVyIiwic2NlbmVyeSIsIkJ1dHRvbkxpc3RlbmVyIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiYXNzZXJ0IiwidGFuZGVtIiwiT1BUSU9OQUwiLCJwaGV0aW9UeXBlIiwiQnV0dG9uTGlzdGVuZXJJTyIsInBoZXRpb1N0YXRlIiwicGhldGlvRXZlbnRUeXBlIiwiVVNFUiIsIm1vdXNlQnV0dG9uIiwiZG93biIsImV2ZW50IiwidHJhaWwiLCJzZXRCdXR0b25TdGF0ZSIsInVwIiwiX292ZXJDb3VudCIsImJ1dHRvblN0YXRlIiwiX2J1dHRvbk9wdGlvbnMiLCJzdGF0ZSIsInNjZW5lcnlMb2ciLCJJbnB1dEV2ZW50IiwiZG93blRyYWlsIiwidG9TdHJpbmciLCJvbGRTdGF0ZSIsInBoZXRpb1N0YXJ0RXZlbnQiLCJwaGV0aW9FbmRFdmVudCIsImZpcmUiLCJpbnRlcnJ1cHRlZCIsImZpcmVPbkRvd24iLCJlbnRlciIsImlzRG93biIsImV4aXQiLCJmb2N1cyIsImJsdXIiLCJjbGljayIsInJlZ2lzdGVyIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsImV2ZW50cyJdLCJzb3VyY2VzIjpbIkJ1dHRvbkxpc3RlbmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhc2ljIGJ1dHRvbiBoYW5kbGluZy5cclxuICpcclxuICogVXNlcyA0IHN0YXRlczpcclxuICogdXA6IG1vdXNlIG5vdCBvdmVyLCBub3QgcHJlc3NlZFxyXG4gKiBvdmVyOiBtb3VzZSBvdmVyLCBub3QgcHJlc3NlZFxyXG4gKiBkb3duOiBtb3VzZSBvdmVyLCBwcmVzc2VkXHJcbiAqIG91dDogbW91c2Ugbm90IG92ZXIsIHByZXNzZWRcclxuICpcclxuICogVE9ETzogb2Zmc2NyZWVuIGhhbmRsaW5nXHJcbiAqIFRPRE86IGZpeCBlbnRlci9leGl0IGVkZ2UgY2FzZXMgZm9yIG1vdmluZyBub2RlcyBvciBhZGQvcmVtb3ZlIGNoaWxkLCBhbmQgd2hlbiB0b3VjaGVzIGFyZSBjcmVhdGVkXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgZGVwcmVjYXRpb25XYXJuaW5nIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9kZXByZWNhdGlvbldhcm5pbmcuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEV2ZW50VHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvRXZlbnRUeXBlLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IHsgRG93blVwTGlzdGVuZXIsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbi8qKlxyXG4gKiBAZGVwcmVjYXRlZCAtIHBsZWFzZSB1c2UgRmlyZUxpc3RlbmVyIGZvciBuZXcgY29kZSAoc2V0IHVwIGZvciB0aGUgYGZpcmVgIGNhbGxiYWNrIHRvIGJlIGVhc3ksIGFuZCBoYXMgUHJvcGVydGllc1xyXG4gKiB0aGF0IGNhbiBiZSBjaGVja2VkIGZvciB0aGUgb3RoZXIgc3RhdGVzIG9yIGNvbXBsaWNhdGVkIGNhc2VzKVxyXG4gKi9cclxuY2xhc3MgQnV0dG9uTGlzdGVuZXIgZXh0ZW5kcyBEb3duVXBMaXN0ZW5lciB7XHJcbiAgLyoqXHJcbiAgICogT3B0aW9ucyBmb3IgdGhlIEJ1dHRvbkxpc3RlbmVyOlxyXG4gICAqXHJcbiAgICogbW91c2VCdXR0b246IDBcclxuICAgKiBmaXJlT25Eb3duOiBmYWxzZSAvLyBkZWZhdWx0IGlzIHRvIGZpcmUgb24gJ3VwJyBhZnRlciAnZG93bicsIGJ1dCBwYXNzaW5nIGZpcmVPbkRvd246IHRydWUgd2lsbCBmaXJlIG9uICdkb3duJyBpbnN0ZWFkXHJcbiAgICogdXA6IG51bGwgICAgICAgICAgLy8gQ2FsbGVkIG9uIGFuICd1cCcgc3RhdGUgY2hhbmdlLCBhcyB1cCggZXZlbnQsIG9sZFN0YXRlIClcclxuICAgKiBvdmVyOiBudWxsICAgICAgICAvLyBDYWxsZWQgb24gYW4gJ292ZXInIHN0YXRlIGNoYW5nZSwgYXMgb3ZlciggZXZlbnQsIG9sZFN0YXRlIClcclxuICAgKiBkb3duOiBudWxsICAgICAgICAvLyBDYWxsZWQgb24gYW4gJ2Rvd24nIHN0YXRlIGNoYW5nZSwgYXMgZG93biggZXZlbnQsIG9sZFN0YXRlIClcclxuICAgKiBvdXQ6IG51bGwgICAgICAgICAvLyBDYWxsZWQgb24gYW4gJ291dCcgc3RhdGUgY2hhbmdlLCBhcyBvdXQoIGV2ZW50LCBvbGRTdGF0ZSApXHJcbiAgICogZmlyZTogbnVsbCAgICAgICAgLy8gQ2FsbGVkIG9uIGEgc3RhdGUgY2hhbmdlIHRvL2Zyb20gJ2Rvd24nIChkZXBlbmRpbmcgb24gZmlyZU9uRG93biksIGFzIGZpcmUoIGV2ZW50ICkuIENhbGxlZCBhZnRlciB0aGUgdHJpZ2dlcmluZyB1cC9vdmVyL2Rvd24gZXZlbnQuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgZGVwcmVjYXRpb25XYXJuaW5nKCAnQnV0dG9uTGlzdGVuZXIgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBGaXJlTGlzdGVuZXIgaW5zdGVhZCcgKTtcclxuXHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBXaGVuIHJ1bm5pbmcgaW4gUGhFVC1pTyBicmFuZCwgdGhlIHRhbmRlbSBtdXN0IGJlIHN1cHBsaWVkXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVElPTkFMLFxyXG4gICAgICBwaGV0aW9UeXBlOiBCdXR0b25MaXN0ZW5lci5CdXR0b25MaXN0ZW5lcklPLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXHJcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVJcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBUT0RPOiBwYXNzIHRocm91Z2ggb3B0aW9uc1xyXG4gICAgc3VwZXIoIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbSxcclxuICAgICAgcGhldGlvVHlwZTogb3B0aW9ucy5waGV0aW9UeXBlLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogb3B0aW9ucy5waGV0aW9TdGF0ZSxcclxuXHJcbiAgICAgIG1vdXNlQnV0dG9uOiBvcHRpb25zLm1vdXNlQnV0dG9uIHx8IDAsIC8vIGZvcndhcmQgdGhlIG1vdXNlIGJ1dHRvbiwgZGVmYXVsdCB0byAwIChMTUIpXHJcblxyXG4gICAgICAvLyBwYXJhbWV0ZXIgdG8gRG93blVwTGlzdGVuZXIsIE5PVCBhbiBpbnB1dCBsaXN0ZW5lciBpdHNlbGZcclxuICAgICAgZG93bjogKCBldmVudCwgdHJhaWwgKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zZXRCdXR0b25TdGF0ZSggZXZlbnQsICdkb3duJyApO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gcGFyYW1ldGVyIHRvIERvd25VcExpc3RlbmVyLCBOT1QgYW4gaW5wdXQgbGlzdGVuZXIgaXRzZWxmXHJcbiAgICAgIHVwOiAoIGV2ZW50LCB0cmFpbCApID0+IHtcclxuICAgICAgICB0aGlzLnNldEJ1dHRvblN0YXRlKCBldmVudCwgdGhpcy5fb3ZlckNvdW50ID4gMCA/ICdvdmVyJyA6ICd1cCcgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ30gLSAndXAnLCAnb3ZlcicsICdkb3duJyBvciAnb3V0J1xyXG4gICAgdGhpcy5idXR0b25TdGF0ZSA9ICd1cCc7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBob3cgbWFueSBwb2ludGVycyBhcmUgb3ZlciB1cyAodHJhY2sgYSBjb3VudCwgc28gd2UgY2FuIGhhbmRsZSBtdWx0aXBsZSBwb2ludGVycyBncmFjZWZ1bGx5KVxyXG4gICAgdGhpcy5fb3ZlckNvdW50ID0gMDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7T2JqZWN0fSAtIHN0b3JlIHRoZSBvcHRpb25zIG9iamVjdCBzbyB3ZSBjYW4gY2FsbCB0aGUgY2FsbGJhY2tzXHJcbiAgICB0aGlzLl9idXR0b25PcHRpb25zID0gb3B0aW9ucztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2NlbmVyeUV2ZW50fSBldmVudFxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZVxyXG4gICAqL1xyXG4gIHNldEJ1dHRvblN0YXRlKCBldmVudCwgc3RhdGUgKSB7XHJcbiAgICBpZiAoIHN0YXRlICE9PSB0aGlzLmJ1dHRvblN0YXRlICkge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQoXHJcbiAgICAgICAgYEJ1dHRvbkxpc3RlbmVyIHN0YXRlIGNoYW5nZSB0byAke3N0YXRlfSBmcm9tICR7dGhpcy5idXR0b25TdGF0ZX0gZm9yICR7dGhpcy5kb3duVHJhaWwgPyB0aGlzLmRvd25UcmFpbC50b1N0cmluZygpIDogdGhpcy5kb3duVHJhaWx9YCApO1xyXG4gICAgICBjb25zdCBvbGRTdGF0ZSA9IHRoaXMuYnV0dG9uU3RhdGU7XHJcblxyXG4gICAgICB0aGlzLmJ1dHRvblN0YXRlID0gc3RhdGU7XHJcblxyXG4gICAgICBpZiAoIHRoaXMuX2J1dHRvbk9wdGlvbnNbIHN0YXRlIF0gKSB7XHJcblxyXG4gICAgICAgIC8vIFJlY29yZCB0aGlzIGV2ZW50IHRvIHRoZSBwaGV0LWlvIGRhdGEgc3RyZWFtLCBpbmNsdWRpbmcgYWxsIGRvd25zdHJlYW0gZXZlbnRzIGFzIG5lc3RlZCBjaGlsZHJlblxyXG4gICAgICAgIHRoaXMucGhldGlvU3RhcnRFdmVudCggc3RhdGUgKTtcclxuXHJcbiAgICAgICAgLy8gVGhlbiBpbnZva2UgdGhlIGNhbGxiYWNrXHJcbiAgICAgICAgdGhpcy5fYnV0dG9uT3B0aW9uc1sgc3RhdGUgXSggZXZlbnQsIG9sZFN0YXRlICk7XHJcblxyXG4gICAgICAgIHRoaXMucGhldGlvRW5kRXZlbnQoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCB0aGlzLl9idXR0b25PcHRpb25zLmZpcmUgJiZcclxuICAgICAgICAgICB0aGlzLl9vdmVyQ291bnQgPiAwICYmXHJcbiAgICAgICAgICAgIXRoaXMuaW50ZXJydXB0ZWQgJiZcclxuICAgICAgICAgICAoIHRoaXMuX2J1dHRvbk9wdGlvbnMuZmlyZU9uRG93biA/ICggc3RhdGUgPT09ICdkb3duJyApIDogKCBvbGRTdGF0ZSA9PT0gJ2Rvd24nICkgKSApIHtcclxuXHJcbiAgICAgICAgLy8gUmVjb3JkIHRoaXMgZXZlbnQgdG8gdGhlIHBoZXQtaW8gZGF0YSBzdHJlYW0sIGluY2x1ZGluZyBhbGwgZG93bnN0cmVhbSBldmVudHMgYXMgbmVzdGVkIGNoaWxkcmVuXHJcbiAgICAgICAgdGhpcy5waGV0aW9TdGFydEV2ZW50KCAnZmlyZScgKTtcclxuXHJcbiAgICAgICAgLy8gVGhlbiBmaXJlIHRoZSBldmVudFxyXG4gICAgICAgIHRoaXMuX2J1dHRvbk9wdGlvbnMuZmlyZSggZXZlbnQgKTtcclxuXHJcbiAgICAgICAgdGhpcy5waGV0aW9FbmRFdmVudCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTY2VuZXJ5RXZlbnR9IGV2ZW50XHJcbiAgICovXHJcbiAgZW50ZXIoIGV2ZW50ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50KFxyXG4gICAgICBgQnV0dG9uTGlzdGVuZXIgZW50ZXIgZm9yICR7dGhpcy5kb3duVHJhaWwgPyB0aGlzLmRvd25UcmFpbC50b1N0cmluZygpIDogdGhpcy5kb3duVHJhaWx9YCApO1xyXG4gICAgdGhpcy5fb3ZlckNvdW50Kys7XHJcbiAgICBpZiAoIHRoaXMuX292ZXJDb3VudCA9PT0gMSApIHtcclxuICAgICAgdGhpcy5zZXRCdXR0b25TdGF0ZSggZXZlbnQsIHRoaXMuaXNEb3duID8gJ2Rvd24nIDogJ292ZXInICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTY2VuZXJ5RXZlbnR9IGV2ZW50XHJcbiAgICovXHJcbiAgZXhpdCggZXZlbnQgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQoXHJcbiAgICAgIGBCdXR0b25MaXN0ZW5lciBleGl0IGZvciAke3RoaXMuZG93blRyYWlsID8gdGhpcy5kb3duVHJhaWwudG9TdHJpbmcoKSA6IHRoaXMuZG93blRyYWlsfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX292ZXJDb3VudCA+IDAsICdFeGl0IGV2ZW50cyBub3QgbWF0Y2hlZCBieSBhbiBlbnRlcicgKTtcclxuICAgIHRoaXMuX292ZXJDb3VudC0tO1xyXG4gICAgaWYgKCB0aGlzLl9vdmVyQ291bnQgPT09IDAgKSB7XHJcbiAgICAgIHRoaXMuc2V0QnV0dG9uU3RhdGUoIGV2ZW50LCB0aGlzLmlzRG93biA/ICdvdXQnIDogJ3VwJyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGZyb20gXCJmb2N1c1wiIGV2ZW50cyAocGFydCBvZiB0aGUgU2NlbmVyeSBsaXN0ZW5lciBBUEkpLiBPbiBmb2N1cyB0aGUgUERPTVBvaW50ZXIgaXMgb3ZlciB0aGUgbm9kZVxyXG4gICAqIHdpdGggdGhlIGF0dGFjaGVkIGxpc3RlbmVyLCBzbyBhZGQgdG8gdGhlIG92ZXIgY291bnQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2NlbmVyeUV2ZW50fSBldmVudFxyXG4gICAqL1xyXG4gIGZvY3VzKCBldmVudCApIHtcclxuICAgIHRoaXMuZW50ZXIoIGV2ZW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgZnJvbSBcImJsdXJcIiBldmVudHMgKHBhcnQgb2YgdGhlIFNjZW5lcnkgbGlzdGVuZXIgQVBJKS4gT24gYmx1ciwgdGhlIFBET01Qb2ludGVyIGxlYXZlcyB0aGUgbm9kZVxyXG4gICAqIHdpdGggdGhpcyBsaXN0ZW5lciBzbyByZWR1Y2UgdGhlIG92ZXIgY291bnQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2NlbmVyeUV2ZW50fSBldmVudFxyXG4gICAqL1xyXG4gIGJsdXIoIGV2ZW50ICkge1xyXG4gICAgdGhpcy5leGl0KCBldmVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdpdGggXCJjbGlja1wiIGV2ZW50cyAocGFydCBvZiB0aGUgU2NlbmVyeSBsaXN0ZW5lciBBUEkpLiBUeXBpY2FsbHkgd2lsbCBiZSBjYWxsZWQgZnJvbSBhIGtleWJvYXJkXHJcbiAgICogb3IgYXNzaXN0aXZlIGRldmljZS5cclxuICAgKlxyXG4gICAqIFRoZXJlIGFyZSBubyBga2V5dXBgIG9yIGBrZXlkb3duYCBldmVudHMgd2hlbiBhbiBhc3Npc3RpdmUgZGV2aWNlIGlzIGFjdGl2ZS4gU28gd2UgcmVzcG9uZCBnZW5lcmFsbHlcclxuICAgKiB0byB0aGUgc2luZ2xlIGBjbGlja2AgZXZlbnQsIHdoaWNoIGluZGljYXRlcyBhIGxvZ2ljYWwgYWN0aXZhdGlvbiBvZiB0aGlzIGJ1dHRvbi5cclxuICAgKiBUT0RPOiBUaGlzIG1heSBjaGFuZ2UgYWZ0ZXIgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzExMTcgaXMgZG9uZSwgYXQgd2hpY2ggcG9pbnRcclxuICAgKiBgY2xpY2tgIHNob3VsZCBsaWtlbHkgYmUgcmVwbGFjZWQgYnkgYGtleWRvd25gIGFuZCBga2V5dXBgIGxpc3RlbmVycy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTY2VuZXJ5RXZlbnR9IGV2ZW50XHJcbiAgICovXHJcbiAgY2xpY2soIGV2ZW50ICkge1xyXG4gICAgdGhpcy5zZXRCdXR0b25TdGF0ZSggZXZlbnQsICdkb3duJyApO1xyXG4gICAgdGhpcy5zZXRCdXR0b25TdGF0ZSggZXZlbnQsICd1cCcgKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdCdXR0b25MaXN0ZW5lcicsIEJ1dHRvbkxpc3RlbmVyICk7XHJcblxyXG5CdXR0b25MaXN0ZW5lci5CdXR0b25MaXN0ZW5lcklPID0gbmV3IElPVHlwZSggJ0J1dHRvbkxpc3RlbmVySU8nLCB7XHJcbiAgdmFsdWVUeXBlOiBCdXR0b25MaXN0ZW5lcixcclxuICBkb2N1bWVudGF0aW9uOiAnQnV0dG9uIGxpc3RlbmVyJyxcclxuICBldmVudHM6IFsgJ3VwJywgJ292ZXInLCAnZG93bicsICdvdXQnLCAnZmlyZScgXVxyXG59ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCdXR0b25MaXN0ZW5lcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0Esa0JBQWtCLE1BQU0sNkNBQTZDO0FBQzVFLE9BQU9DLEtBQUssTUFB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