// Copyright 2021-2023, University of Colorado Boulder

/**
 * LockNode shows a padlock that is either open or closed, depending on the state of a boolean Property.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { AlignBox, AlignGroup, HBox, HStrut, Image } from '../../scenery/js/imports.js';
import BooleanToggleNode from '../../sun/js/BooleanToggleNode.js';
import lockClosed_png from '../images/lockClosed_png.js';
import lockOpened_png from '../images/lockOpened_png.js';
import sceneryPhet from './sceneryPhet.js';
export default class LockNode extends BooleanToggleNode {
  /**
   * @param isLockedProperty - true=lock closed, false=lock open
   * @param providedOptions
   */
  constructor(isLockedProperty, providedOptions) {
    const alignBoxOptions = {
      // To make both icons have the same effective dimensions
      group: new AlignGroup(),
      xAlign: 'center',
      yAlign: 'bottom'
    };
    const lockClosedImage = new Image(lockClosed_png);
    const lockClosedNode = new AlignBox(lockClosedImage, alignBoxOptions);

    // For the 'open' icon, add a strut to the left, so that the lock body is in the center of lockOpenedNode.
    const lockOpenedImage = new Image(lockOpened_png);
    const lockOpenedNode = new AlignBox(new HBox({
      children: [new HStrut(lockOpenedImage.width - lockClosedImage.width), lockOpenedImage],
      spacing: 0
    }), alignBoxOptions);
    super(isLockedProperty, lockClosedNode, lockOpenedNode, providedOptions);
  }
}
sceneryPhet.register('LockNode', LockNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBbGlnbkJveCIsIkFsaWduR3JvdXAiLCJIQm94IiwiSFN0cnV0IiwiSW1hZ2UiLCJCb29sZWFuVG9nZ2xlTm9kZSIsImxvY2tDbG9zZWRfcG5nIiwibG9ja09wZW5lZF9wbmciLCJzY2VuZXJ5UGhldCIsIkxvY2tOb2RlIiwiY29uc3RydWN0b3IiLCJpc0xvY2tlZFByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwiYWxpZ25Cb3hPcHRpb25zIiwiZ3JvdXAiLCJ4QWxpZ24iLCJ5QWxpZ24iLCJsb2NrQ2xvc2VkSW1hZ2UiLCJsb2NrQ2xvc2VkTm9kZSIsImxvY2tPcGVuZWRJbWFnZSIsImxvY2tPcGVuZWROb2RlIiwiY2hpbGRyZW4iLCJ3aWR0aCIsInNwYWNpbmciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxvY2tOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIExvY2tOb2RlIHNob3dzIGEgcGFkbG9jayB0aGF0IGlzIGVpdGhlciBvcGVuIG9yIGNsb3NlZCwgZGVwZW5kaW5nIG9uIHRoZSBzdGF0ZSBvZiBhIGJvb2xlYW4gUHJvcGVydHkuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgQWxpZ25Cb3gsIEFsaWduQm94T3B0aW9ucywgQWxpZ25Hcm91cCwgSEJveCwgSFN0cnV0LCBJbWFnZSB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBCb29sZWFuVG9nZ2xlTm9kZSwgeyBCb29sZWFuVG9nZ2xlTm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9zdW4vanMvQm9vbGVhblRvZ2dsZU5vZGUuanMnO1xyXG5pbXBvcnQgbG9ja0Nsb3NlZF9wbmcgZnJvbSAnLi4vaW1hZ2VzL2xvY2tDbG9zZWRfcG5nLmpzJztcclxuaW1wb3J0IGxvY2tPcGVuZWRfcG5nIGZyb20gJy4uL2ltYWdlcy9sb2NrT3BlbmVkX3BuZy5qcyc7XHJcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxuZXhwb3J0IHR5cGUgTG9ja05vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBCb29sZWFuVG9nZ2xlTm9kZU9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2NrTm9kZSBleHRlbmRzIEJvb2xlYW5Ub2dnbGVOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGlzTG9ja2VkUHJvcGVydHkgLSB0cnVlPWxvY2sgY2xvc2VkLCBmYWxzZT1sb2NrIG9wZW5cclxuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBpc0xvY2tlZFByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj4sIHByb3ZpZGVkT3B0aW9ucz86IExvY2tOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBhbGlnbkJveE9wdGlvbnM6IEFsaWduQm94T3B0aW9ucyA9IHtcclxuXHJcbiAgICAgIC8vIFRvIG1ha2UgYm90aCBpY29ucyBoYXZlIHRoZSBzYW1lIGVmZmVjdGl2ZSBkaW1lbnNpb25zXHJcbiAgICAgIGdyb3VwOiBuZXcgQWxpZ25Hcm91cCgpLFxyXG5cclxuICAgICAgeEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgeUFsaWduOiAnYm90dG9tJ1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBsb2NrQ2xvc2VkSW1hZ2UgPSBuZXcgSW1hZ2UoIGxvY2tDbG9zZWRfcG5nICk7XHJcbiAgICBjb25zdCBsb2NrQ2xvc2VkTm9kZSA9IG5ldyBBbGlnbkJveCggbG9ja0Nsb3NlZEltYWdlLCBhbGlnbkJveE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBGb3IgdGhlICdvcGVuJyBpY29uLCBhZGQgYSBzdHJ1dCB0byB0aGUgbGVmdCwgc28gdGhhdCB0aGUgbG9jayBib2R5IGlzIGluIHRoZSBjZW50ZXIgb2YgbG9ja09wZW5lZE5vZGUuXHJcbiAgICBjb25zdCBsb2NrT3BlbmVkSW1hZ2UgPSBuZXcgSW1hZ2UoIGxvY2tPcGVuZWRfcG5nICk7XHJcbiAgICBjb25zdCBsb2NrT3BlbmVkTm9kZSA9IG5ldyBBbGlnbkJveCggbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgSFN0cnV0KCBsb2NrT3BlbmVkSW1hZ2Uud2lkdGggLSBsb2NrQ2xvc2VkSW1hZ2Uud2lkdGggKSxcclxuICAgICAgICBsb2NrT3BlbmVkSW1hZ2VcclxuICAgICAgXSxcclxuICAgICAgc3BhY2luZzogMFxyXG4gICAgfSApLCBhbGlnbkJveE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggaXNMb2NrZWRQcm9wZXJ0eSwgbG9ja0Nsb3NlZE5vZGUsIGxvY2tPcGVuZWROb2RlLCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnTG9ja05vZGUnLCBMb2NrTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFJQSxTQUFTQSxRQUFRLEVBQW1CQyxVQUFVLEVBQUVDLElBQUksRUFBRUMsTUFBTSxFQUFFQyxLQUFLLFFBQVEsNkJBQTZCO0FBQ3hHLE9BQU9DLGlCQUFpQixNQUFvQyxtQ0FBbUM7QUFDL0YsT0FBT0MsY0FBYyxNQUFNLDZCQUE2QjtBQUN4RCxPQUFPQyxjQUFjLE1BQU0sNkJBQTZCO0FBQ3hELE9BQU9DLFdBQVcsTUFBTSxrQkFBa0I7QUFNMUMsZUFBZSxNQUFNQyxRQUFRLFNBQVNKLGlCQUFpQixDQUFDO0VBRXREO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NLLFdBQVdBLENBQUVDLGdCQUFvQyxFQUFFQyxlQUFpQyxFQUFHO0lBRTVGLE1BQU1DLGVBQWdDLEdBQUc7TUFFdkM7TUFDQUMsS0FBSyxFQUFFLElBQUliLFVBQVUsQ0FBQyxDQUFDO01BRXZCYyxNQUFNLEVBQUUsUUFBUTtNQUNoQkMsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUVELE1BQU1DLGVBQWUsR0FBRyxJQUFJYixLQUFLLENBQUVFLGNBQWUsQ0FBQztJQUNuRCxNQUFNWSxjQUFjLEdBQUcsSUFBSWxCLFFBQVEsQ0FBRWlCLGVBQWUsRUFBRUosZUFBZ0IsQ0FBQzs7SUFFdkU7SUFDQSxNQUFNTSxlQUFlLEdBQUcsSUFBSWYsS0FBSyxDQUFFRyxjQUFlLENBQUM7SUFDbkQsTUFBTWEsY0FBYyxHQUFHLElBQUlwQixRQUFRLENBQUUsSUFBSUUsSUFBSSxDQUFFO01BQzdDbUIsUUFBUSxFQUFFLENBQ1IsSUFBSWxCLE1BQU0sQ0FBRWdCLGVBQWUsQ0FBQ0csS0FBSyxHQUFHTCxlQUFlLENBQUNLLEtBQU0sQ0FBQyxFQUMzREgsZUFBZSxDQUNoQjtNQUNESSxPQUFPLEVBQUU7SUFDWCxDQUFFLENBQUMsRUFBRVYsZUFBZ0IsQ0FBQztJQUV0QixLQUFLLENBQUVGLGdCQUFnQixFQUFFTyxjQUFjLEVBQUVFLGNBQWMsRUFBRVIsZUFBZ0IsQ0FBQztFQUM1RTtBQUNGO0FBRUFKLFdBQVcsQ0FBQ2dCLFFBQVEsQ0FBRSxVQUFVLEVBQUVmLFFBQVMsQ0FBQyJ9