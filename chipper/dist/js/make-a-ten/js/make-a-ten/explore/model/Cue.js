// Copyright 2016-2022, University of Colorado Boulder

/**
 * Common move/split cue model. The cue represents a visual indicator that sticks to a counting object, and lets the user
 * know they can do an operation. It will fade away when the operation is performed, but will return upon reset all.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Property from '../../../../../axon/js/Property.js';
import makeATen from '../../../makeATen.js';

// constants
const FADE_SPEED = 0.8;

// state enumeration for the cue
const CueState = Object.freeze({
  UNATTACHED: 'UNATTACHED',
  // "not faded, but not visible"
  ATTACHED: 'ATTACHED',
  // "on a number, but not fading"
  FADING: 'FADING',
  // "on a number, but fading"
  FADED: 'FADED' // "faded, will not return until reset all"
});

class Cue {
  constructor() {
    // @public {Property.<CountingObject|null>} - What CountingObject the cue is attached to.
    this.countingObjectProperty = new Property(null);

    // @public {BooleanProperty} - Whether the cue should be visible at all
    this.visibilityProperty = new BooleanProperty(false);

    // @public {NumberProperty} - What the visibility of the cue shoudl be.
    this.opacityProperty = new NumberProperty(1);

    // @private {Property.<CueState>}
    this.stateProperty = new Property(CueState.UNATTACHED);
  }

  /**
   * Step the cue (handle opacity if fading).
   * @public
   *
   * @param {number} dt - Changed model time
   */
  step(dt) {
    if (this.stateProperty.value === CueState.FADING) {
      // Fade
      this.opacityProperty.value = Math.max(0, this.opacityProperty.value - FADE_SPEED * dt);

      // If fully done, change to faded
      if (!this.opacityProperty.value) {
        this.changeToFaded();
      }
    }
  }

  /**
   * Attaches the cue to the number (if it hasn't faded fully).
   * @public
   *
   * @param {CountingObject} countingObject
   */
  attachToNumber(countingObject) {
    if (this.stateProperty.value === CueState.FADED) {
      return;
    }
    this.stateProperty.value = this.stateProperty.value === CueState.FADING ? this.stateProperty.value : CueState.ATTACHED;
    this.countingObjectProperty.value = countingObject;
    this.visibilityProperty.value = true;
  }

  /**
   * Detach from the current counting object, without fading.
   * @public
   */
  detach() {
    if (this.stateProperty.value === CueState.FADED) {
      return;
    }
    if (this.stateProperty.value === CueState.FADING) {
      this.changeToFaded();
    } else {
      this.changeToUnattached();
    }
  }

  /**
   * The cue will start fading if it hasn't started (or completed) fading already.
   * @public
   */
  triggerFade() {
    if (this.stateProperty.value === CueState.ATTACHED) {
      this.stateProperty.value = CueState.FADING;
    } else if (this.stateProperty.value === CueState.UNATTACHED) {
      // If we're not attached, just immediately switch to fully faded.
      this.changeToFaded();
    }
  }

  /**
   * Resets the cue to the initial state.
   * @public
   */
  reset() {
    this.changeToUnattached();
  }

  /**
   * Changes to an unattached state
   * @private
   */
  changeToUnattached() {
    this.stateProperty.value = CueState.UNATTACHED;
    this.visibilityProperty.value = false;
    this.opacityProperty.value = 1;
    this.countingObjectProperty.value = null;
  }

  /**
   * Changes to a fully-faded state
   * @private
   */
  changeToFaded() {
    this.stateProperty.value = CueState.FADED;
    this.visibilityProperty.value = false;
    this.opacityProperty.value = 1;
    this.countingObjectProperty.value = null;
  }
}
makeATen.register('Cue', Cue);
export default Cue;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwibWFrZUFUZW4iLCJGQURFX1NQRUVEIiwiQ3VlU3RhdGUiLCJPYmplY3QiLCJmcmVlemUiLCJVTkFUVEFDSEVEIiwiQVRUQUNIRUQiLCJGQURJTkciLCJGQURFRCIsIkN1ZSIsImNvbnN0cnVjdG9yIiwiY291bnRpbmdPYmplY3RQcm9wZXJ0eSIsInZpc2liaWxpdHlQcm9wZXJ0eSIsIm9wYWNpdHlQcm9wZXJ0eSIsInN0YXRlUHJvcGVydHkiLCJzdGVwIiwiZHQiLCJ2YWx1ZSIsIk1hdGgiLCJtYXgiLCJjaGFuZ2VUb0ZhZGVkIiwiYXR0YWNoVG9OdW1iZXIiLCJjb3VudGluZ09iamVjdCIsImRldGFjaCIsImNoYW5nZVRvVW5hdHRhY2hlZCIsInRyaWdnZXJGYWRlIiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkN1ZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb21tb24gbW92ZS9zcGxpdCBjdWUgbW9kZWwuIFRoZSBjdWUgcmVwcmVzZW50cyBhIHZpc3VhbCBpbmRpY2F0b3IgdGhhdCBzdGlja3MgdG8gYSBjb3VudGluZyBvYmplY3QsIGFuZCBsZXRzIHRoZSB1c2VyXHJcbiAqIGtub3cgdGhleSBjYW4gZG8gYW4gb3BlcmF0aW9uLiBJdCB3aWxsIGZhZGUgYXdheSB3aGVuIHRoZSBvcGVyYXRpb24gaXMgcGVyZm9ybWVkLCBidXQgd2lsbCByZXR1cm4gdXBvbiByZXNldCBhbGwuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtYWtlQVRlbiBmcm9tICcuLi8uLi8uLi9tYWtlQVRlbi5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgRkFERV9TUEVFRCA9IDAuODtcclxuXHJcbi8vIHN0YXRlIGVudW1lcmF0aW9uIGZvciB0aGUgY3VlXHJcbmNvbnN0IEN1ZVN0YXRlID0gT2JqZWN0LmZyZWV6ZSgge1xyXG4gIFVOQVRUQUNIRUQ6ICdVTkFUVEFDSEVEJywgLy8gXCJub3QgZmFkZWQsIGJ1dCBub3QgdmlzaWJsZVwiXHJcbiAgQVRUQUNIRUQ6ICdBVFRBQ0hFRCcsIC8vIFwib24gYSBudW1iZXIsIGJ1dCBub3QgZmFkaW5nXCJcclxuICBGQURJTkc6ICdGQURJTkcnLCAvLyBcIm9uIGEgbnVtYmVyLCBidXQgZmFkaW5nXCJcclxuICBGQURFRDogJ0ZBREVEJyAvLyBcImZhZGVkLCB3aWxsIG5vdCByZXR1cm4gdW50aWwgcmVzZXQgYWxsXCJcclxufSApO1xyXG5cclxuY2xhc3MgQ3VlIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxDb3VudGluZ09iamVjdHxudWxsPn0gLSBXaGF0IENvdW50aW5nT2JqZWN0IHRoZSBjdWUgaXMgYXR0YWNoZWQgdG8uXHJcbiAgICB0aGlzLmNvdW50aW5nT2JqZWN0UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtCb29sZWFuUHJvcGVydHl9IC0gV2hldGhlciB0aGUgY3VlIHNob3VsZCBiZSB2aXNpYmxlIGF0IGFsbFxyXG4gICAgdGhpcy52aXNpYmlsaXR5UHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge051bWJlclByb3BlcnR5fSAtIFdoYXQgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGN1ZSBzaG91ZGwgYmUuXHJcbiAgICB0aGlzLm9wYWNpdHlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtQcm9wZXJ0eS48Q3VlU3RhdGU+fVxyXG4gICAgdGhpcy5zdGF0ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBDdWVTdGF0ZS5VTkFUVEFDSEVEICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwIHRoZSBjdWUgKGhhbmRsZSBvcGFjaXR5IGlmIGZhZGluZykuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gQ2hhbmdlZCBtb2RlbCB0aW1lXHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcbiAgICBpZiAoIHRoaXMuc3RhdGVQcm9wZXJ0eS52YWx1ZSA9PT0gQ3VlU3RhdGUuRkFESU5HICkge1xyXG4gICAgICAvLyBGYWRlXHJcbiAgICAgIHRoaXMub3BhY2l0eVByb3BlcnR5LnZhbHVlID0gTWF0aC5tYXgoIDAsIHRoaXMub3BhY2l0eVByb3BlcnR5LnZhbHVlIC0gRkFERV9TUEVFRCAqIGR0ICk7XHJcblxyXG4gICAgICAvLyBJZiBmdWxseSBkb25lLCBjaGFuZ2UgdG8gZmFkZWRcclxuICAgICAgaWYgKCAhdGhpcy5vcGFjaXR5UHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VUb0ZhZGVkKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGFjaGVzIHRoZSBjdWUgdG8gdGhlIG51bWJlciAoaWYgaXQgaGFzbid0IGZhZGVkIGZ1bGx5KS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NvdW50aW5nT2JqZWN0fSBjb3VudGluZ09iamVjdFxyXG4gICAqL1xyXG4gIGF0dGFjaFRvTnVtYmVyKCBjb3VudGluZ09iamVjdCApIHtcclxuICAgIGlmICggdGhpcy5zdGF0ZVByb3BlcnR5LnZhbHVlID09PSBDdWVTdGF0ZS5GQURFRCApIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgdGhpcy5zdGF0ZVByb3BlcnR5LnZhbHVlID0gKCB0aGlzLnN0YXRlUHJvcGVydHkudmFsdWUgPT09IEN1ZVN0YXRlLkZBRElORyApID8gdGhpcy5zdGF0ZVByb3BlcnR5LnZhbHVlIDogQ3VlU3RhdGUuQVRUQUNIRUQ7XHJcbiAgICB0aGlzLmNvdW50aW5nT2JqZWN0UHJvcGVydHkudmFsdWUgPSBjb3VudGluZ09iamVjdDtcclxuICAgIHRoaXMudmlzaWJpbGl0eVByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGFjaCBmcm9tIHRoZSBjdXJyZW50IGNvdW50aW5nIG9iamVjdCwgd2l0aG91dCBmYWRpbmcuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRldGFjaCgpIHtcclxuICAgIGlmICggdGhpcy5zdGF0ZVByb3BlcnR5LnZhbHVlID09PSBDdWVTdGF0ZS5GQURFRCApIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgaWYgKCB0aGlzLnN0YXRlUHJvcGVydHkudmFsdWUgPT09IEN1ZVN0YXRlLkZBRElORyApIHtcclxuICAgICAgdGhpcy5jaGFuZ2VUb0ZhZGVkKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5jaGFuZ2VUb1VuYXR0YWNoZWQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBjdWUgd2lsbCBzdGFydCBmYWRpbmcgaWYgaXQgaGFzbid0IHN0YXJ0ZWQgKG9yIGNvbXBsZXRlZCkgZmFkaW5nIGFscmVhZHkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHRyaWdnZXJGYWRlKCkge1xyXG4gICAgaWYgKCB0aGlzLnN0YXRlUHJvcGVydHkudmFsdWUgPT09IEN1ZVN0YXRlLkFUVEFDSEVEICkge1xyXG4gICAgICB0aGlzLnN0YXRlUHJvcGVydHkudmFsdWUgPSBDdWVTdGF0ZS5GQURJTkc7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5zdGF0ZVByb3BlcnR5LnZhbHVlID09PSBDdWVTdGF0ZS5VTkFUVEFDSEVEICkge1xyXG4gICAgICAvLyBJZiB3ZSdyZSBub3QgYXR0YWNoZWQsIGp1c3QgaW1tZWRpYXRlbHkgc3dpdGNoIHRvIGZ1bGx5IGZhZGVkLlxyXG4gICAgICB0aGlzLmNoYW5nZVRvRmFkZWQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgY3VlIHRvIHRoZSBpbml0aWFsIHN0YXRlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuY2hhbmdlVG9VbmF0dGFjaGVkKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGFuZ2VzIHRvIGFuIHVuYXR0YWNoZWQgc3RhdGVcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGNoYW5nZVRvVW5hdHRhY2hlZCgpIHtcclxuICAgIHRoaXMuc3RhdGVQcm9wZXJ0eS52YWx1ZSA9IEN1ZVN0YXRlLlVOQVRUQUNIRUQ7XHJcbiAgICB0aGlzLnZpc2liaWxpdHlQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5vcGFjaXR5UHJvcGVydHkudmFsdWUgPSAxO1xyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdFByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoYW5nZXMgdG8gYSBmdWxseS1mYWRlZCBzdGF0ZVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgY2hhbmdlVG9GYWRlZCgpIHtcclxuICAgIHRoaXMuc3RhdGVQcm9wZXJ0eS52YWx1ZSA9IEN1ZVN0YXRlLkZBREVEO1xyXG4gICAgdGhpcy52aXNpYmlsaXR5UHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgIHRoaXMub3BhY2l0eVByb3BlcnR5LnZhbHVlID0gMTtcclxuICAgIHRoaXMuY291bnRpbmdPYmplY3RQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG5tYWtlQVRlbi5yZWdpc3RlciggJ0N1ZScsIEN1ZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ3VlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSwyQ0FBMkM7QUFDdkUsT0FBT0MsY0FBYyxNQUFNLDBDQUEwQztBQUNyRSxPQUFPQyxRQUFRLE1BQU0sb0NBQW9DO0FBQ3pELE9BQU9DLFFBQVEsTUFBTSxzQkFBc0I7O0FBRTNDO0FBQ0EsTUFBTUMsVUFBVSxHQUFHLEdBQUc7O0FBRXRCO0FBQ0EsTUFBTUMsUUFBUSxHQUFHQyxNQUFNLENBQUNDLE1BQU0sQ0FBRTtFQUM5QkMsVUFBVSxFQUFFLFlBQVk7RUFBRTtFQUMxQkMsUUFBUSxFQUFFLFVBQVU7RUFBRTtFQUN0QkMsTUFBTSxFQUFFLFFBQVE7RUFBRTtFQUNsQkMsS0FBSyxFQUFFLE9BQU8sQ0FBQztBQUNqQixDQUFFLENBQUM7O0FBRUgsTUFBTUMsR0FBRyxDQUFDO0VBQ1JDLFdBQVdBLENBQUEsRUFBRztJQUNaO0lBQ0EsSUFBSSxDQUFDQyxzQkFBc0IsR0FBRyxJQUFJWixRQUFRLENBQUUsSUFBSyxDQUFDOztJQUVsRDtJQUNBLElBQUksQ0FBQ2Esa0JBQWtCLEdBQUcsSUFBSWYsZUFBZSxDQUFFLEtBQU0sQ0FBQzs7SUFFdEQ7SUFDQSxJQUFJLENBQUNnQixlQUFlLEdBQUcsSUFBSWYsY0FBYyxDQUFFLENBQUUsQ0FBQzs7SUFFOUM7SUFDQSxJQUFJLENBQUNnQixhQUFhLEdBQUcsSUFBSWYsUUFBUSxDQUFFRyxRQUFRLENBQUNHLFVBQVcsQ0FBQztFQUMxRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVUsSUFBSUEsQ0FBRUMsRUFBRSxFQUFHO0lBQ1QsSUFBSyxJQUFJLENBQUNGLGFBQWEsQ0FBQ0csS0FBSyxLQUFLZixRQUFRLENBQUNLLE1BQU0sRUFBRztNQUNsRDtNQUNBLElBQUksQ0FBQ00sZUFBZSxDQUFDSSxLQUFLLEdBQUdDLElBQUksQ0FBQ0MsR0FBRyxDQUFFLENBQUMsRUFBRSxJQUFJLENBQUNOLGVBQWUsQ0FBQ0ksS0FBSyxHQUFHaEIsVUFBVSxHQUFHZSxFQUFHLENBQUM7O01BRXhGO01BQ0EsSUFBSyxDQUFDLElBQUksQ0FBQ0gsZUFBZSxDQUFDSSxLQUFLLEVBQUc7UUFDakMsSUFBSSxDQUFDRyxhQUFhLENBQUMsQ0FBQztNQUN0QjtJQUNGO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLGNBQWNBLENBQUVDLGNBQWMsRUFBRztJQUMvQixJQUFLLElBQUksQ0FBQ1IsYUFBYSxDQUFDRyxLQUFLLEtBQUtmLFFBQVEsQ0FBQ00sS0FBSyxFQUFHO01BQUU7SUFBUTtJQUU3RCxJQUFJLENBQUNNLGFBQWEsQ0FBQ0csS0FBSyxHQUFLLElBQUksQ0FBQ0gsYUFBYSxDQUFDRyxLQUFLLEtBQUtmLFFBQVEsQ0FBQ0ssTUFBTSxHQUFLLElBQUksQ0FBQ08sYUFBYSxDQUFDRyxLQUFLLEdBQUdmLFFBQVEsQ0FBQ0ksUUFBUTtJQUMxSCxJQUFJLENBQUNLLHNCQUFzQixDQUFDTSxLQUFLLEdBQUdLLGNBQWM7SUFDbEQsSUFBSSxDQUFDVixrQkFBa0IsQ0FBQ0ssS0FBSyxHQUFHLElBQUk7RUFDdEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRU0sTUFBTUEsQ0FBQSxFQUFHO0lBQ1AsSUFBSyxJQUFJLENBQUNULGFBQWEsQ0FBQ0csS0FBSyxLQUFLZixRQUFRLENBQUNNLEtBQUssRUFBRztNQUFFO0lBQVE7SUFFN0QsSUFBSyxJQUFJLENBQUNNLGFBQWEsQ0FBQ0csS0FBSyxLQUFLZixRQUFRLENBQUNLLE1BQU0sRUFBRztNQUNsRCxJQUFJLENBQUNhLGFBQWEsQ0FBQyxDQUFDO0lBQ3RCLENBQUMsTUFDSTtNQUNILElBQUksQ0FBQ0ksa0JBQWtCLENBQUMsQ0FBQztJQUMzQjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLFdBQVdBLENBQUEsRUFBRztJQUNaLElBQUssSUFBSSxDQUFDWCxhQUFhLENBQUNHLEtBQUssS0FBS2YsUUFBUSxDQUFDSSxRQUFRLEVBQUc7TUFDcEQsSUFBSSxDQUFDUSxhQUFhLENBQUNHLEtBQUssR0FBR2YsUUFBUSxDQUFDSyxNQUFNO0lBQzVDLENBQUMsTUFDSSxJQUFLLElBQUksQ0FBQ08sYUFBYSxDQUFDRyxLQUFLLEtBQUtmLFFBQVEsQ0FBQ0csVUFBVSxFQUFHO01BQzNEO01BQ0EsSUFBSSxDQUFDZSxhQUFhLENBQUMsQ0FBQztJQUN0QjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VNLEtBQUtBLENBQUEsRUFBRztJQUNOLElBQUksQ0FBQ0Ysa0JBQWtCLENBQUMsQ0FBQztFQUMzQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFQSxrQkFBa0JBLENBQUEsRUFBRztJQUNuQixJQUFJLENBQUNWLGFBQWEsQ0FBQ0csS0FBSyxHQUFHZixRQUFRLENBQUNHLFVBQVU7SUFDOUMsSUFBSSxDQUFDTyxrQkFBa0IsQ0FBQ0ssS0FBSyxHQUFHLEtBQUs7SUFDckMsSUFBSSxDQUFDSixlQUFlLENBQUNJLEtBQUssR0FBRyxDQUFDO0lBQzlCLElBQUksQ0FBQ04sc0JBQXNCLENBQUNNLEtBQUssR0FBRyxJQUFJO0VBQzFDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VHLGFBQWFBLENBQUEsRUFBRztJQUNkLElBQUksQ0FBQ04sYUFBYSxDQUFDRyxLQUFLLEdBQUdmLFFBQVEsQ0FBQ00sS0FBSztJQUN6QyxJQUFJLENBQUNJLGtCQUFrQixDQUFDSyxLQUFLLEdBQUcsS0FBSztJQUNyQyxJQUFJLENBQUNKLGVBQWUsQ0FBQ0ksS0FBSyxHQUFHLENBQUM7SUFDOUIsSUFBSSxDQUFDTixzQkFBc0IsQ0FBQ00sS0FBSyxHQUFHLElBQUk7RUFDMUM7QUFDRjtBQUVBakIsUUFBUSxDQUFDMkIsUUFBUSxDQUFFLEtBQUssRUFBRWxCLEdBQUksQ0FBQztBQUUvQixlQUFlQSxHQUFHIn0=