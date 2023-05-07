// Copyright 2019-2022, University of Colorado Boulder

/**
 * NaturalSelectionPanel is a specialization of Panel that provides a more convenient API for creating a
 * fixed-width Panel, and for disabling the Panel's content.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { SceneryConstants } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import naturalSelection from '../../naturalSelection.js';
export default class NaturalSelectionPanel extends Panel {
  constructor(content, providedOptions) {
    const options = optionize()({
      // SelfOptions
      fixedWidth: null
    }, providedOptions);
    assert && assert(options.fixedWidth === null || options.fixedWidth > 0, `invalid fixedWidth: ${options.fixedWidth}`);
    if (options.fixedWidth) {
      options.minWidth = options.fixedWidth;
      options.maxWidth = options.fixedWidth;
    }
    super(content, options);
    this.content = content;
  }

  /**
   * Enable or disable the entire Panel content.
   */
  setContentEnabled(enabled) {
    this.content.pickable = enabled;
    this.content.opacity = enabled ? 1 : SceneryConstants.DISABLED_OPACITY;
  }
}
naturalSelection.register('NaturalSelectionPanel', NaturalSelectionPanel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJTY2VuZXJ5Q29uc3RhbnRzIiwiUGFuZWwiLCJuYXR1cmFsU2VsZWN0aW9uIiwiTmF0dXJhbFNlbGVjdGlvblBhbmVsIiwiY29uc3RydWN0b3IiLCJjb250ZW50IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImZpeGVkV2lkdGgiLCJhc3NlcnQiLCJtaW5XaWR0aCIsIm1heFdpZHRoIiwic2V0Q29udGVudEVuYWJsZWQiLCJlbmFibGVkIiwicGlja2FibGUiLCJvcGFjaXR5IiwiRElTQUJMRURfT1BBQ0lUWSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTmF0dXJhbFNlbGVjdGlvblBhbmVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE5hdHVyYWxTZWxlY3Rpb25QYW5lbCBpcyBhIHNwZWNpYWxpemF0aW9uIG9mIFBhbmVsIHRoYXQgcHJvdmlkZXMgYSBtb3JlIGNvbnZlbmllbnQgQVBJIGZvciBjcmVhdGluZyBhXHJcbiAqIGZpeGVkLXdpZHRoIFBhbmVsLCBhbmQgZm9yIGRpc2FibGluZyB0aGUgUGFuZWwncyBjb250ZW50LlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgU2NlbmVyeUNvbnN0YW50cyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQYW5lbCwgeyBQYW5lbE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xyXG5pbXBvcnQgbmF0dXJhbFNlbGVjdGlvbiBmcm9tICcuLi8uLi9uYXR1cmFsU2VsZWN0aW9uLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgZml4ZWRXaWR0aD86IG51bWJlciB8IG51bGw7IC8vIG9wdGlvbmFsIGZpeGVkIHdpZHRoIG9mIHRoZSBwYW5lbFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgTmF0dXJhbFNlbGVjdGlvblBhbmVsT3B0aW9ucyA9IFNlbGZPcHRpb25zICZcclxuICBTdHJpY3RPbWl0PFBhbmVsT3B0aW9ucywgJ21pbldpZHRoJyB8ICdtYXhXaWR0aCc+ICZcclxuICBQaWNrUmVxdWlyZWQ8UGFuZWxPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOYXR1cmFsU2VsZWN0aW9uUGFuZWwgZXh0ZW5kcyBQYW5lbCB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgY29udGVudDogTm9kZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjb250ZW50OiBOb2RlLCBwcm92aWRlZE9wdGlvbnM6IE5hdHVyYWxTZWxlY3Rpb25QYW5lbE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxOYXR1cmFsU2VsZWN0aW9uUGFuZWxPcHRpb25zLCBTZWxmT3B0aW9ucywgUGFuZWxPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICBmaXhlZFdpZHRoOiBudWxsXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmZpeGVkV2lkdGggPT09IG51bGwgfHwgb3B0aW9ucy5maXhlZFdpZHRoID4gMCxcclxuICAgICAgYGludmFsaWQgZml4ZWRXaWR0aDogJHtvcHRpb25zLmZpeGVkV2lkdGh9YCApO1xyXG5cclxuICAgIGlmICggb3B0aW9ucy5maXhlZFdpZHRoICkge1xyXG4gICAgICBvcHRpb25zLm1pbldpZHRoID0gb3B0aW9ucy5maXhlZFdpZHRoO1xyXG4gICAgICBvcHRpb25zLm1heFdpZHRoID0gb3B0aW9ucy5maXhlZFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKCBjb250ZW50LCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5jb250ZW50ID0gY29udGVudDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEVuYWJsZSBvciBkaXNhYmxlIHRoZSBlbnRpcmUgUGFuZWwgY29udGVudC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q29udGVudEVuYWJsZWQoIGVuYWJsZWQ6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICB0aGlzLmNvbnRlbnQucGlja2FibGUgPSBlbmFibGVkO1xyXG4gICAgdGhpcy5jb250ZW50Lm9wYWNpdHkgPSBlbmFibGVkID8gMSA6IFNjZW5lcnlDb25zdGFudHMuRElTQUJMRURfT1BBQ0lUWTtcclxuICB9XHJcbn1cclxuXHJcbm5hdHVyYWxTZWxlY3Rpb24ucmVnaXN0ZXIoICdOYXR1cmFsU2VsZWN0aW9uUGFuZWwnLCBOYXR1cmFsU2VsZWN0aW9uUGFuZWwgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sdUNBQXVDO0FBRzdELFNBQWVDLGdCQUFnQixRQUFRLG1DQUFtQztBQUMxRSxPQUFPQyxLQUFLLE1BQXdCLDZCQUE2QjtBQUNqRSxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFVeEQsZUFBZSxNQUFNQyxxQkFBcUIsU0FBU0YsS0FBSyxDQUFDO0VBSWhERyxXQUFXQSxDQUFFQyxPQUFhLEVBQUVDLGVBQTZDLEVBQUc7SUFFakYsTUFBTUMsT0FBTyxHQUFHUixTQUFTLENBQTBELENBQUMsQ0FBRTtNQUVwRjtNQUNBUyxVQUFVLEVBQUU7SUFDZCxDQUFDLEVBQUVGLGVBQWdCLENBQUM7SUFFcEJHLE1BQU0sSUFBSUEsTUFBTSxDQUFFRixPQUFPLENBQUNDLFVBQVUsS0FBSyxJQUFJLElBQUlELE9BQU8sQ0FBQ0MsVUFBVSxHQUFHLENBQUMsRUFDcEUsdUJBQXNCRCxPQUFPLENBQUNDLFVBQVcsRUFBRSxDQUFDO0lBRS9DLElBQUtELE9BQU8sQ0FBQ0MsVUFBVSxFQUFHO01BQ3hCRCxPQUFPLENBQUNHLFFBQVEsR0FBR0gsT0FBTyxDQUFDQyxVQUFVO01BQ3JDRCxPQUFPLENBQUNJLFFBQVEsR0FBR0osT0FBTyxDQUFDQyxVQUFVO0lBQ3ZDO0lBRUEsS0FBSyxDQUFFSCxPQUFPLEVBQUVFLE9BQVEsQ0FBQztJQUV6QixJQUFJLENBQUNGLE9BQU8sR0FBR0EsT0FBTztFQUN4Qjs7RUFFQTtBQUNGO0FBQ0E7RUFDU08saUJBQWlCQSxDQUFFQyxPQUFnQixFQUFTO0lBQ2pELElBQUksQ0FBQ1IsT0FBTyxDQUFDUyxRQUFRLEdBQUdELE9BQU87SUFDL0IsSUFBSSxDQUFDUixPQUFPLENBQUNVLE9BQU8sR0FBR0YsT0FBTyxHQUFHLENBQUMsR0FBR2IsZ0JBQWdCLENBQUNnQixnQkFBZ0I7RUFDeEU7QUFDRjtBQUVBZCxnQkFBZ0IsQ0FBQ2UsUUFBUSxDQUFFLHVCQUF1QixFQUFFZCxxQkFBc0IsQ0FBQyJ9