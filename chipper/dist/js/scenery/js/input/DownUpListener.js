// Copyright 2013-2023, University of Colorado Boulder

/**
 * Basic down/up pointer handling for a Node, so that it's easy to handle buttons
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import deprecationWarning from '../../../phet-core/js/deprecationWarning.js';
import merge from '../../../phet-core/js/merge.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import { EventContext, Mouse, scenery, SceneryEvent, Trail } from '../imports.js';

/**
 * @deprecated - use PressListener instead
 */
class DownUpListener extends PhetioObject {
  /**
   * The 'trail' parameter passed to down/upInside/upOutside will end with the node to which this DownUpListener has
   * been added.
   *
   * Allowed options: {
   *    mouseButton: 0  // The mouse button to use: left: 0, middle: 1, right: 2, see
   *                    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
   *    down: null      // down( event, trail ) is called when the pointer is pressed down on this node
   *                    // (and another pointer is not already down on it).
   *    up: null        // up( event, trail ) is called after 'down', regardless of the pointer's current location.
   *                    // Additionally, it is called AFTER upInside or upOutside, whichever is relevant
   *    upInside: null  // upInside( event, trail ) is called after 'down', when the pointer is released inside
   *                    // this node (it or a descendant is the top pickable node under the pointer)
   *    upOutside: null // upOutside( event, trail ) is called after 'down', when the pointer is released outside
   *                    // this node (it or a descendant is the not top pickable node under the pointer, even if the
   *                    // same instance is still directly under the pointer)
   * }
   *
   * @param {Object} [options]
   */
  constructor(options) {
    assert && deprecationWarning('DownUpListener is deprecated, please use PressListener instead');
    options = merge({
      mouseButton: 0 // allow a different mouse button
    }, options);
    super(options);

    // @private {Object}
    this.options = options;

    // @public {boolean} - whether this listener is down
    this.isDown = false;

    // @public {Node|null} - 'up' is handled via a pointer lister, which will have null currentTarget, so save the
    // 'down' currentTarget
    this.downCurrentTarget = null;

    // @public {Trail|null}
    this.downTrail = null;

    // @public {Pointer|null}
    this.pointer = null;

    // @public {boolean}
    this.interrupted = false;

    // @private {function} - this listener gets added to the pointer on a 'down'
    this.downListener = {
      // mouse/touch up
      up: event => {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`DownUpListener (pointer) up for ${this.downTrail.toString()}`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        assert && assert(event.pointer === this.pointer);
        if (!(event.pointer instanceof Mouse) || event.domEvent.button === this.options.mouseButton) {
          this.buttonUp(event);
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
      },
      // interruption of this Pointer listener
      interrupt: () => {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`DownUpListener (pointer) interrupt for ${this.downTrail.toString()}`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        this.interrupt();
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
      },
      // touch cancel
      cancel: event => {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`DownUpListener (pointer) cancel for ${this.downTrail.toString()}`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        assert && assert(event.pointer === this.pointer);
        this.buttonUp(event);
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
      }
    };
  }

  /**
   * @private
   *
   * @param {SceneryEvent} event
   */
  buttonDown(event) {
    // already down from another pointer, don't do anything
    if (this.isDown) {
      return;
    }

    // ignore other mouse buttons
    if (event.pointer instanceof Mouse && event.domEvent.button !== this.options.mouseButton) {
      return;
    }
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DownUpListener buttonDown');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();

    // add our listener so we catch the up wherever we are
    event.pointer.addInputListener(this.downListener);
    this.isDown = true;
    this.downCurrentTarget = event.currentTarget;
    this.downTrail = event.trail.subtrailTo(event.currentTarget, false);
    this.pointer = event.pointer;
    if (this.options.down) {
      this.options.down(event, this.downTrail);
    }
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * @private
   *
   * @param {SceneryEvent} event
   */
  buttonUp(event) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DownUpListener buttonUp');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    this.isDown = false;
    this.pointer.removeInputListener(this.downListener);
    const currentTargetSave = event.currentTarget;
    event.currentTarget = this.downCurrentTarget; // up is handled by a pointer listener, so currentTarget would be null.
    if (this.options.upInside || this.options.upOutside) {
      const trailUnderPointer = event.trail;

      // TODO: consider changing this so that it just does a hit check and ignores anything in front?
      const isInside = trailUnderPointer.isExtensionOf(this.downTrail, true) && !this.interrupted;
      if (isInside && this.options.upInside) {
        this.options.upInside(event, this.downTrail);
      } else if (!isInside && this.options.upOutside) {
        this.options.upOutside(event, this.downTrail);
      }
    }
    if (this.options.up) {
      this.options.up(event, this.downTrail);
    }
    event.currentTarget = currentTargetSave; // be polite to other listeners, restore currentTarget

    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /*---------------------------------------------------------------------------*
   * events called from the node input listener
   *----------------------------------------------------------------------------*/

  /**
   * mouse/touch down on this node
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */
  down(event) {
    this.buttonDown(event);
  }

  /**
   * Called when input is interrupted on this listener, see https://github.com/phetsims/scenery/issues/218
   * @public
   */
  interrupt() {
    if (this.isDown) {
      sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DownUpListener interrupt');
      sceneryLog && sceneryLog.InputListener && sceneryLog.push();
      this.interrupted = true;
      const context = EventContext.createSynthetic();

      // We create a synthetic event here, as there is no available event here.
      // Empty trail, so that it for-sure isn't under our downTrail (guaranteeing that isInside will be false).
      const syntheticEvent = new SceneryEvent(new Trail(), 'synthetic', this.pointer, context);
      syntheticEvent.currentTarget = this.downCurrentTarget;
      this.buttonUp(syntheticEvent);
      this.interrupted = false;
      sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
  }
}
scenery.register('DownUpListener', DownUpListener);
export default DownUpListener;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkZXByZWNhdGlvbldhcm5pbmciLCJtZXJnZSIsIlBoZXRpb09iamVjdCIsIkV2ZW50Q29udGV4dCIsIk1vdXNlIiwic2NlbmVyeSIsIlNjZW5lcnlFdmVudCIsIlRyYWlsIiwiRG93blVwTGlzdGVuZXIiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJhc3NlcnQiLCJtb3VzZUJ1dHRvbiIsImlzRG93biIsImRvd25DdXJyZW50VGFyZ2V0IiwiZG93blRyYWlsIiwicG9pbnRlciIsImludGVycnVwdGVkIiwiZG93bkxpc3RlbmVyIiwidXAiLCJldmVudCIsInNjZW5lcnlMb2ciLCJJbnB1dExpc3RlbmVyIiwidG9TdHJpbmciLCJwdXNoIiwiZG9tRXZlbnQiLCJidXR0b24iLCJidXR0b25VcCIsInBvcCIsImludGVycnVwdCIsImNhbmNlbCIsImJ1dHRvbkRvd24iLCJhZGRJbnB1dExpc3RlbmVyIiwiY3VycmVudFRhcmdldCIsInRyYWlsIiwic3VidHJhaWxUbyIsImRvd24iLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwiY3VycmVudFRhcmdldFNhdmUiLCJ1cEluc2lkZSIsInVwT3V0c2lkZSIsInRyYWlsVW5kZXJQb2ludGVyIiwiaXNJbnNpZGUiLCJpc0V4dGVuc2lvbk9mIiwiY29udGV4dCIsImNyZWF0ZVN5bnRoZXRpYyIsInN5bnRoZXRpY0V2ZW50IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEb3duVXBMaXN0ZW5lci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYXNpYyBkb3duL3VwIHBvaW50ZXIgaGFuZGxpbmcgZm9yIGEgTm9kZSwgc28gdGhhdCBpdCdzIGVhc3kgdG8gaGFuZGxlIGJ1dHRvbnNcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBkZXByZWNhdGlvbldhcm5pbmcgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2RlcHJlY2F0aW9uV2FybmluZy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0IGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgeyBFdmVudENvbnRleHQsIE1vdXNlLCBzY2VuZXJ5LCBTY2VuZXJ5RXZlbnQsIFRyYWlsIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG4vKipcclxuICogQGRlcHJlY2F0ZWQgLSB1c2UgUHJlc3NMaXN0ZW5lciBpbnN0ZWFkXHJcbiAqL1xyXG5jbGFzcyBEb3duVXBMaXN0ZW5lciBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcbiAgLyoqXHJcbiAgICogVGhlICd0cmFpbCcgcGFyYW1ldGVyIHBhc3NlZCB0byBkb3duL3VwSW5zaWRlL3VwT3V0c2lkZSB3aWxsIGVuZCB3aXRoIHRoZSBub2RlIHRvIHdoaWNoIHRoaXMgRG93blVwTGlzdGVuZXIgaGFzXHJcbiAgICogYmVlbiBhZGRlZC5cclxuICAgKlxyXG4gICAqIEFsbG93ZWQgb3B0aW9uczoge1xyXG4gICAqICAgIG1vdXNlQnV0dG9uOiAwICAvLyBUaGUgbW91c2UgYnV0dG9uIHRvIHVzZTogbGVmdDogMCwgbWlkZGxlOiAxLCByaWdodDogMiwgc2VlXHJcbiAgICogICAgICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Nb3VzZUV2ZW50XHJcbiAgICogICAgZG93bjogbnVsbCAgICAgIC8vIGRvd24oIGV2ZW50LCB0cmFpbCApIGlzIGNhbGxlZCB3aGVuIHRoZSBwb2ludGVyIGlzIHByZXNzZWQgZG93biBvbiB0aGlzIG5vZGVcclxuICAgKiAgICAgICAgICAgICAgICAgICAgLy8gKGFuZCBhbm90aGVyIHBvaW50ZXIgaXMgbm90IGFscmVhZHkgZG93biBvbiBpdCkuXHJcbiAgICogICAgdXA6IG51bGwgICAgICAgIC8vIHVwKCBldmVudCwgdHJhaWwgKSBpcyBjYWxsZWQgYWZ0ZXIgJ2Rvd24nLCByZWdhcmRsZXNzIG9mIHRoZSBwb2ludGVyJ3MgY3VycmVudCBsb2NhdGlvbi5cclxuICAgKiAgICAgICAgICAgICAgICAgICAgLy8gQWRkaXRpb25hbGx5LCBpdCBpcyBjYWxsZWQgQUZURVIgdXBJbnNpZGUgb3IgdXBPdXRzaWRlLCB3aGljaGV2ZXIgaXMgcmVsZXZhbnRcclxuICAgKiAgICB1cEluc2lkZTogbnVsbCAgLy8gdXBJbnNpZGUoIGV2ZW50LCB0cmFpbCApIGlzIGNhbGxlZCBhZnRlciAnZG93bicsIHdoZW4gdGhlIHBvaW50ZXIgaXMgcmVsZWFzZWQgaW5zaWRlXHJcbiAgICogICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgbm9kZSAoaXQgb3IgYSBkZXNjZW5kYW50IGlzIHRoZSB0b3AgcGlja2FibGUgbm9kZSB1bmRlciB0aGUgcG9pbnRlcilcclxuICAgKiAgICB1cE91dHNpZGU6IG51bGwgLy8gdXBPdXRzaWRlKCBldmVudCwgdHJhaWwgKSBpcyBjYWxsZWQgYWZ0ZXIgJ2Rvd24nLCB3aGVuIHRoZSBwb2ludGVyIGlzIHJlbGVhc2VkIG91dHNpZGVcclxuICAgKiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBub2RlIChpdCBvciBhIGRlc2NlbmRhbnQgaXMgdGhlIG5vdCB0b3AgcGlja2FibGUgbm9kZSB1bmRlciB0aGUgcG9pbnRlciwgZXZlbiBpZiB0aGVcclxuICAgKiAgICAgICAgICAgICAgICAgICAgLy8gc2FtZSBpbnN0YW5jZSBpcyBzdGlsbCBkaXJlY3RseSB1bmRlciB0aGUgcG9pbnRlcilcclxuICAgKiB9XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgZGVwcmVjYXRpb25XYXJuaW5nKCAnRG93blVwTGlzdGVuZXIgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBQcmVzc0xpc3RlbmVyIGluc3RlYWQnICk7XHJcblxyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBtb3VzZUJ1dHRvbjogMCAvLyBhbGxvdyBhIGRpZmZlcmVudCBtb3VzZSBidXR0b25cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtPYmplY3R9XHJcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gd2hldGhlciB0aGlzIGxpc3RlbmVyIGlzIGRvd25cclxuICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Tm9kZXxudWxsfSAtICd1cCcgaXMgaGFuZGxlZCB2aWEgYSBwb2ludGVyIGxpc3Rlciwgd2hpY2ggd2lsbCBoYXZlIG51bGwgY3VycmVudFRhcmdldCwgc28gc2F2ZSB0aGVcclxuICAgIC8vICdkb3duJyBjdXJyZW50VGFyZ2V0XHJcbiAgICB0aGlzLmRvd25DdXJyZW50VGFyZ2V0ID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtUcmFpbHxudWxsfVxyXG4gICAgdGhpcy5kb3duVHJhaWwgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1BvaW50ZXJ8bnVsbH1cclxuICAgIHRoaXMucG9pbnRlciA9IG51bGw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn1cclxuICAgIHRoaXMuaW50ZXJydXB0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259IC0gdGhpcyBsaXN0ZW5lciBnZXRzIGFkZGVkIHRvIHRoZSBwb2ludGVyIG9uIGEgJ2Rvd24nXHJcbiAgICB0aGlzLmRvd25MaXN0ZW5lciA9IHtcclxuICAgICAgLy8gbW91c2UvdG91Y2ggdXBcclxuICAgICAgdXA6IGV2ZW50ID0+IHtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoIGBEb3duVXBMaXN0ZW5lciAocG9pbnRlcikgdXAgZm9yICR7dGhpcy5kb3duVHJhaWwudG9TdHJpbmcoKX1gICk7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGV2ZW50LnBvaW50ZXIgPT09IHRoaXMucG9pbnRlciApO1xyXG4gICAgICAgIGlmICggISggZXZlbnQucG9pbnRlciBpbnN0YW5jZW9mIE1vdXNlICkgfHwgZXZlbnQuZG9tRXZlbnQuYnV0dG9uID09PSB0aGlzLm9wdGlvbnMubW91c2VCdXR0b24gKSB7XHJcbiAgICAgICAgICB0aGlzLmJ1dHRvblVwKCBldmVudCApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIGludGVycnVwdGlvbiBvZiB0aGlzIFBvaW50ZXIgbGlzdGVuZXJcclxuICAgICAgaW50ZXJydXB0OiAoKSA9PiB7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgRG93blVwTGlzdGVuZXIgKHBvaW50ZXIpIGludGVycnVwdCBmb3IgJHt0aGlzLmRvd25UcmFpbC50b1N0cmluZygpfWAgKTtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHQoKTtcclxuXHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIHRvdWNoIGNhbmNlbFxyXG4gICAgICBjYW5jZWw6IGV2ZW50ID0+IHtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoIGBEb3duVXBMaXN0ZW5lciAocG9pbnRlcikgY2FuY2VsIGZvciAke3RoaXMuZG93blRyYWlsLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBldmVudC5wb2ludGVyID09PSB0aGlzLnBvaW50ZXIgKTtcclxuICAgICAgICB0aGlzLmJ1dHRvblVwKCBldmVudCApO1xyXG5cclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2NlbmVyeUV2ZW50fSBldmVudFxyXG4gICAqL1xyXG4gIGJ1dHRvbkRvd24oIGV2ZW50ICkge1xyXG4gICAgLy8gYWxyZWFkeSBkb3duIGZyb20gYW5vdGhlciBwb2ludGVyLCBkb24ndCBkbyBhbnl0aGluZ1xyXG4gICAgaWYgKCB0aGlzLmlzRG93biApIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgLy8gaWdub3JlIG90aGVyIG1vdXNlIGJ1dHRvbnNcclxuICAgIGlmICggZXZlbnQucG9pbnRlciBpbnN0YW5jZW9mIE1vdXNlICYmIGV2ZW50LmRvbUV2ZW50LmJ1dHRvbiAhPT0gdGhpcy5vcHRpb25zLm1vdXNlQnV0dG9uICkgeyByZXR1cm47IH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdEb3duVXBMaXN0ZW5lciBidXR0b25Eb3duJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gYWRkIG91ciBsaXN0ZW5lciBzbyB3ZSBjYXRjaCB0aGUgdXAgd2hlcmV2ZXIgd2UgYXJlXHJcbiAgICBldmVudC5wb2ludGVyLmFkZElucHV0TGlzdGVuZXIoIHRoaXMuZG93bkxpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgdGhpcy5kb3duQ3VycmVudFRhcmdldCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XHJcbiAgICB0aGlzLmRvd25UcmFpbCA9IGV2ZW50LnRyYWlsLnN1YnRyYWlsVG8oIGV2ZW50LmN1cnJlbnRUYXJnZXQsIGZhbHNlICk7XHJcbiAgICB0aGlzLnBvaW50ZXIgPSBldmVudC5wb2ludGVyO1xyXG5cclxuICAgIGlmICggdGhpcy5vcHRpb25zLmRvd24gKSB7XHJcbiAgICAgIHRoaXMub3B0aW9ucy5kb3duKCBldmVudCwgdGhpcy5kb3duVHJhaWwgKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2NlbmVyeUV2ZW50fSBldmVudFxyXG4gICAqL1xyXG4gIGJ1dHRvblVwKCBldmVudCApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ0Rvd25VcExpc3RlbmVyIGJ1dHRvblVwJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgIHRoaXMucG9pbnRlci5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLmRvd25MaXN0ZW5lciApO1xyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRUYXJnZXRTYXZlID0gZXZlbnQuY3VycmVudFRhcmdldDtcclxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQgPSB0aGlzLmRvd25DdXJyZW50VGFyZ2V0OyAvLyB1cCBpcyBoYW5kbGVkIGJ5IGEgcG9pbnRlciBsaXN0ZW5lciwgc28gY3VycmVudFRhcmdldCB3b3VsZCBiZSBudWxsLlxyXG4gICAgaWYgKCB0aGlzLm9wdGlvbnMudXBJbnNpZGUgfHwgdGhpcy5vcHRpb25zLnVwT3V0c2lkZSApIHtcclxuICAgICAgY29uc3QgdHJhaWxVbmRlclBvaW50ZXIgPSBldmVudC50cmFpbDtcclxuXHJcbiAgICAgIC8vIFRPRE86IGNvbnNpZGVyIGNoYW5naW5nIHRoaXMgc28gdGhhdCBpdCBqdXN0IGRvZXMgYSBoaXQgY2hlY2sgYW5kIGlnbm9yZXMgYW55dGhpbmcgaW4gZnJvbnQ/XHJcbiAgICAgIGNvbnN0IGlzSW5zaWRlID0gdHJhaWxVbmRlclBvaW50ZXIuaXNFeHRlbnNpb25PZiggdGhpcy5kb3duVHJhaWwsIHRydWUgKSAmJiAhdGhpcy5pbnRlcnJ1cHRlZDtcclxuXHJcbiAgICAgIGlmICggaXNJbnNpZGUgJiYgdGhpcy5vcHRpb25zLnVwSW5zaWRlICkge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy51cEluc2lkZSggZXZlbnQsIHRoaXMuZG93blRyYWlsICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoICFpc0luc2lkZSAmJiB0aGlzLm9wdGlvbnMudXBPdXRzaWRlICkge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy51cE91dHNpZGUoIGV2ZW50LCB0aGlzLmRvd25UcmFpbCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLm9wdGlvbnMudXAgKSB7XHJcbiAgICAgIHRoaXMub3B0aW9ucy51cCggZXZlbnQsIHRoaXMuZG93blRyYWlsICk7XHJcbiAgICB9XHJcbiAgICBldmVudC5jdXJyZW50VGFyZ2V0ID0gY3VycmVudFRhcmdldFNhdmU7IC8vIGJlIHBvbGl0ZSB0byBvdGhlciBsaXN0ZW5lcnMsIHJlc3RvcmUgY3VycmVudFRhcmdldFxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgKiBldmVudHMgY2FsbGVkIGZyb20gdGhlIG5vZGUgaW5wdXQgbGlzdGVuZXJcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBtb3VzZS90b3VjaCBkb3duIG9uIHRoaXMgbm9kZVxyXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NjZW5lcnlFdmVudH0gZXZlbnRcclxuICAgKi9cclxuICBkb3duKCBldmVudCApIHtcclxuICAgIHRoaXMuYnV0dG9uRG93biggZXZlbnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGlucHV0IGlzIGludGVycnVwdGVkIG9uIHRoaXMgbGlzdGVuZXIsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMjE4XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGludGVycnVwdCgpIHtcclxuICAgIGlmICggdGhpcy5pc0Rvd24gKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ0Rvd25VcExpc3RlbmVyIGludGVycnVwdCcgKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgICB0aGlzLmludGVycnVwdGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBFdmVudENvbnRleHQuY3JlYXRlU3ludGhldGljKCk7XHJcblxyXG4gICAgICAvLyBXZSBjcmVhdGUgYSBzeW50aGV0aWMgZXZlbnQgaGVyZSwgYXMgdGhlcmUgaXMgbm8gYXZhaWxhYmxlIGV2ZW50IGhlcmUuXHJcbiAgICAgIC8vIEVtcHR5IHRyYWlsLCBzbyB0aGF0IGl0IGZvci1zdXJlIGlzbid0IHVuZGVyIG91ciBkb3duVHJhaWwgKGd1YXJhbnRlZWluZyB0aGF0IGlzSW5zaWRlIHdpbGwgYmUgZmFsc2UpLlxyXG4gICAgICBjb25zdCBzeW50aGV0aWNFdmVudCA9IG5ldyBTY2VuZXJ5RXZlbnQoIG5ldyBUcmFpbCgpLCAnc3ludGhldGljJywgdGhpcy5wb2ludGVyLCBjb250ZXh0ICk7XHJcbiAgICAgIHN5bnRoZXRpY0V2ZW50LmN1cnJlbnRUYXJnZXQgPSB0aGlzLmRvd25DdXJyZW50VGFyZ2V0O1xyXG4gICAgICB0aGlzLmJ1dHRvblVwKCBzeW50aGV0aWNFdmVudCApO1xyXG5cclxuICAgICAgdGhpcy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdEb3duVXBMaXN0ZW5lcicsIERvd25VcExpc3RlbmVyICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEb3duVXBMaXN0ZW5lcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0Esa0JBQWtCLE1BQU0sNkNBQTZDO0FBQzVFLE9BQU9DLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsT0FBT0MsWUFBWSxNQUFNLG9DQUFvQztBQUM3RCxTQUFTQyxZQUFZLEVBQUVDLEtBQUssRUFBRUMsT0FBTyxFQUFFQyxZQUFZLEVBQUVDLEtBQUssUUFBUSxlQUFlOztBQUVqRjtBQUNBO0FBQ0E7QUFDQSxNQUFNQyxjQUFjLFNBQVNOLFlBQVksQ0FBQztFQUN4QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VPLFdBQVdBLENBQUVDLE9BQU8sRUFBRztJQUNyQkMsTUFBTSxJQUFJWCxrQkFBa0IsQ0FBRSxnRUFBaUUsQ0FBQztJQUdoR1UsT0FBTyxHQUFHVCxLQUFLLENBQUU7TUFDZlcsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUNqQixDQUFDLEVBQUVGLE9BQVEsQ0FBQztJQUVaLEtBQUssQ0FBRUEsT0FBUSxDQUFDOztJQUVoQjtJQUNBLElBQUksQ0FBQ0EsT0FBTyxHQUFHQSxPQUFPOztJQUV0QjtJQUNBLElBQUksQ0FBQ0csTUFBTSxHQUFHLEtBQUs7O0lBRW5CO0lBQ0E7SUFDQSxJQUFJLENBQUNDLGlCQUFpQixHQUFHLElBQUk7O0lBRTdCO0lBQ0EsSUFBSSxDQUFDQyxTQUFTLEdBQUcsSUFBSTs7SUFFckI7SUFDQSxJQUFJLENBQUNDLE9BQU8sR0FBRyxJQUFJOztJQUVuQjtJQUNBLElBQUksQ0FBQ0MsV0FBVyxHQUFHLEtBQUs7O0lBRXhCO0lBQ0EsSUFBSSxDQUFD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