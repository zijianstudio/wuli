// Copyright 2016-2022, University of Colorado Boulder

/**
 * Collection of all control panels in a screen of this sim.  Different scenes in a single
 * scene can have different panels, so the panels can be updated.
 *
 * @author Dave Schmitz (Schmitzware)
 * @author Jesse Greenberg
 */

import merge from '../../../../phet-core/js/merge.js';
import { Node, VBox } from '../../../../scenery/js/imports.js';
import rutherfordScattering from '../../rutherfordScattering.js';
import RSConstants from '../RSConstants.js';
class RSControlPanel extends Node {
  /**
   * Constructor.
   * @param {array.<Panel>} panels
   * @param {Object} [options]
   */
  constructor(panels, options) {
    super();
    const defaultOptions = {
      spacing: RSConstants.PANEL_VERTICAL_MARGIN,
      align: 'left',
      resize: false,
      children: panels
    };
    this.panelOptions = merge(defaultOptions, options); // @private

    // @private - arrange control panels vertically
    const vBox = new VBox(this.panelOptions);
    this.addChild(vBox);
    this.mutate(options);

    // disposal to prevent memory leak - this is important because a new
    // control panel is created every time the scene or color scheme changes
    // @private
    this.disposeRSControlPanel = () => {
      this.panelOptions.children.forEach(panel => {
        panel.dispose();
      });
    };
  }

  /**
   * Dispose the control panel.  A new control panel is created every time the color scheme
   * and scene property changes so it is important to dispose of all elements.
   * @public
   */
  dispose() {
    this.disposeRSControlPanel();
    super.dispose();
  }
}
rutherfordScattering.register('RSControlPanel', RSControlPanel);
export default RSControlPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIk5vZGUiLCJWQm94IiwicnV0aGVyZm9yZFNjYXR0ZXJpbmciLCJSU0NvbnN0YW50cyIsIlJTQ29udHJvbFBhbmVsIiwiY29uc3RydWN0b3IiLCJwYW5lbHMiLCJvcHRpb25zIiwiZGVmYXVsdE9wdGlvbnMiLCJzcGFjaW5nIiwiUEFORUxfVkVSVElDQUxfTUFSR0lOIiwiYWxpZ24iLCJyZXNpemUiLCJjaGlsZHJlbiIsInBhbmVsT3B0aW9ucyIsInZCb3giLCJhZGRDaGlsZCIsIm11dGF0ZSIsImRpc3Bvc2VSU0NvbnRyb2xQYW5lbCIsImZvckVhY2giLCJwYW5lbCIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJTQ29udHJvbFBhbmVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbGxlY3Rpb24gb2YgYWxsIGNvbnRyb2wgcGFuZWxzIGluIGEgc2NyZWVuIG9mIHRoaXMgc2ltLiAgRGlmZmVyZW50IHNjZW5lcyBpbiBhIHNpbmdsZVxyXG4gKiBzY2VuZSBjYW4gaGF2ZSBkaWZmZXJlbnQgcGFuZWxzLCBzbyB0aGUgcGFuZWxzIGNhbiBiZSB1cGRhdGVkLlxyXG4gKlxyXG4gKiBAYXV0aG9yIERhdmUgU2NobWl0eiAoU2NobWl0endhcmUpXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgcnV0aGVyZm9yZFNjYXR0ZXJpbmcgZnJvbSAnLi4vLi4vcnV0aGVyZm9yZFNjYXR0ZXJpbmcuanMnO1xyXG5pbXBvcnQgUlNDb25zdGFudHMgZnJvbSAnLi4vUlNDb25zdGFudHMuanMnO1xyXG5cclxuY2xhc3MgUlNDb250cm9sUGFuZWwgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0b3IuXHJcbiAgICogQHBhcmFtIHthcnJheS48UGFuZWw+fSBwYW5lbHNcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHBhbmVscywgb3B0aW9ucyApIHtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xyXG4gICAgICBzcGFjaW5nOiBSU0NvbnN0YW50cy5QQU5FTF9WRVJUSUNBTF9NQVJHSU4sXHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIHJlc2l6ZTogZmFsc2UsXHJcbiAgICAgIGNoaWxkcmVuOiBwYW5lbHNcclxuICAgIH07XHJcbiAgICB0aGlzLnBhbmVsT3B0aW9ucyA9IG1lcmdlKCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyApOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gYXJyYW5nZSBjb250cm9sIHBhbmVscyB2ZXJ0aWNhbGx5XHJcbiAgICBjb25zdCB2Qm94ID0gbmV3IFZCb3goIHRoaXMucGFuZWxPcHRpb25zICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB2Qm94ICk7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBkaXNwb3NhbCB0byBwcmV2ZW50IG1lbW9yeSBsZWFrIC0gdGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSBhIG5ld1xyXG4gICAgLy8gY29udHJvbCBwYW5lbCBpcyBjcmVhdGVkIGV2ZXJ5IHRpbWUgdGhlIHNjZW5lIG9yIGNvbG9yIHNjaGVtZSBjaGFuZ2VzXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5kaXNwb3NlUlNDb250cm9sUGFuZWwgPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMucGFuZWxPcHRpb25zLmNoaWxkcmVuLmZvckVhY2goIHBhbmVsID0+IHtcclxuICAgICAgICBwYW5lbC5kaXNwb3NlKCk7XHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcG9zZSB0aGUgY29udHJvbCBwYW5lbC4gIEEgbmV3IGNvbnRyb2wgcGFuZWwgaXMgY3JlYXRlZCBldmVyeSB0aW1lIHRoZSBjb2xvciBzY2hlbWVcclxuICAgKiBhbmQgc2NlbmUgcHJvcGVydHkgY2hhbmdlcyBzbyBpdCBpcyBpbXBvcnRhbnQgdG8gZGlzcG9zZSBvZiBhbGwgZWxlbWVudHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmRpc3Bvc2VSU0NvbnRyb2xQYW5lbCgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxucnV0aGVyZm9yZFNjYXR0ZXJpbmcucmVnaXN0ZXIoICdSU0NvbnRyb2xQYW5lbCcsIFJTQ29udHJvbFBhbmVsICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSU0NvbnRyb2xQYW5lbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlELE9BQU9DLG9CQUFvQixNQUFNLCtCQUErQjtBQUNoRSxPQUFPQyxXQUFXLE1BQU0sbUJBQW1CO0FBRTNDLE1BQU1DLGNBQWMsU0FBU0osSUFBSSxDQUFDO0VBRWhDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUssV0FBV0EsQ0FBRUMsTUFBTSxFQUFFQyxPQUFPLEVBQUc7SUFFN0IsS0FBSyxDQUFDLENBQUM7SUFFUCxNQUFNQyxjQUFjLEdBQUc7TUFDckJDLE9BQU8sRUFBRU4sV0FBVyxDQUFDTyxxQkFBcUI7TUFDMUNDLEtBQUssRUFBRSxNQUFNO01BQ2JDLE1BQU0sRUFBRSxLQUFLO01BQ2JDLFFBQVEsRUFBRVA7SUFDWixDQUFDO0lBQ0QsSUFBSSxDQUFDUSxZQUFZLEdBQUdmLEtBQUssQ0FBRVMsY0FBYyxFQUFFRCxPQUFRLENBQUMsQ0FBQyxDQUFDOztJQUV0RDtJQUNBLE1BQU1RLElBQUksR0FBRyxJQUFJZCxJQUFJLENBQUUsSUFBSSxDQUFDYSxZQUFhLENBQUM7SUFDMUMsSUFBSSxDQUFDRSxRQUFRLENBQUVELElBQUssQ0FBQztJQUVyQixJQUFJLENBQUNFLE1BQU0sQ0FBRVYsT0FBUSxDQUFDOztJQUV0QjtJQUNBO0lBQ0E7SUFDQSxJQUFJLENBQUNXLHFCQUFxQixHQUFHLE1BQU07TUFDakMsSUFBSSxDQUFDSixZQUFZLENBQUNELFFBQVEsQ0FBQ00sT0FBTyxDQUFFQyxLQUFLLElBQUk7UUFDM0NBLEtBQUssQ0FBQ0MsT0FBTyxDQUFDLENBQUM7TUFDakIsQ0FBRSxDQUFDO0lBQ0wsQ0FBQztFQUNIOztFQUdBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUEsT0FBT0EsQ0FBQSxFQUFHO0lBQ1IsSUFBSSxDQUFDSCxxQkFBcUIsQ0FBQyxDQUFDO0lBQzVCLEtBQUssQ0FBQ0csT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBbkIsb0JBQW9CLENBQUNvQixRQUFRLENBQUUsZ0JBQWdCLEVBQUVsQixjQUFlLENBQUM7QUFFakUsZUFBZUEsY0FBYyJ9