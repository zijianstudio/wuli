// Copyright 2014-2022, University of Colorado Boulder

/**
 * Arrow control panel node in 'Pendulum Lab' simulation.
 * Contains checkbox buttons to control visibility of velocity and acceleration arrows.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { AlignBox, AlignGroup, HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import PendulumLabConstants from '../../common/PendulumLabConstants.js';
import pendulumLab from '../../pendulumLab.js';
import PendulumLabStrings from '../../PendulumLabStrings.js';
const accelerationString = PendulumLabStrings.acceleration;
const velocityString = PendulumLabStrings.velocity;
class ArrowVisibilityPanel extends Panel {
  /**
   * @param {Property.<boolean>} isVelocityVisibleProperty - Visibility of velocity arrows.
   * @param {Property.<boolean>} isAccelerationVisibleProperty - Visibility of acceleration arrows.
   * @param {Object} [options]
   */
  constructor(isVelocityVisibleProperty, isAccelerationVisibleProperty, options) {
    options = merge({}, PendulumLabConstants.PANEL_OPTIONS, options);
    const textOptions = {
      font: PendulumLabConstants.TITLE_FONT,
      maxWidth: 80
    };
    const textHeight = new Text('not visible', textOptions).height;
    const textGroup = new AlignGroup();
    function createCheckboxContent(labelString, color) {
      return new HBox({
        children: [new AlignBox(new Text(labelString, textOptions), {
          group: textGroup,
          xAlign: 'left'
        }), new ArrowNode(0, 0, 22, 0, {
          fill: color,
          centerY: 0,
          tailWidth: 6,
          headWidth: 12
        })],
        pickable: false
      });
    }

    // We'll dynamically adjust the spacings in these, so that the full Checkbox expands to the desired size.
    const velocityContent = createCheckboxContent(velocityString, PendulumLabConstants.VELOCITY_ARROW_COLOR);
    const accelerationContent = createCheckboxContent(accelerationString, PendulumLabConstants.ACCELERATION_ARROW_COLOR);

    // Currently no better way to handle the fluid layout with checkboxes than to determine the amount of additional
    // space it takes up when it has no spacing (and then add spacing to fit).
    const tmpCheckbox = new Checkbox(new Property(true), velocityContent, {
      boxWidth: textHeight
    });
    const widthWithoutSpacing = tmpCheckbox.width;
    tmpCheckbox.dispose();
    const content = new VBox({
      spacing: PendulumLabConstants.CHECK_RADIO_SPACING
    });

    // Whenever the amount of width available changes, we need to recreate the checkboxes
    PendulumLabConstants.LEFT_CONTENT_ALIGN_GROUP.maxWidthProperty.link(width => {
      // Properly remove any old checkboxes
      content.children.forEach(child => {
        child.dispose();
      });
      const spacing = width - widthWithoutSpacing;

      // Create new checkboxes with the proper spacing. Checkbox currently doesn't support resizing content.
      velocityContent.spacing = spacing;
      content.addChild(new Checkbox(isVelocityVisibleProperty, velocityContent, {
        boxWidth: textHeight
      }));
      accelerationContent.spacing = spacing;
      content.addChild(new Checkbox(isAccelerationVisibleProperty, accelerationContent, {
        boxWidth: textHeight
      }));
    });
    super(content, options);
  }
}
pendulumLab.register('ArrowVisibilityPanel', ArrowVisibilityPanel);
export default ArrowVisibilityPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIm1lcmdlIiwiQXJyb3dOb2RlIiwiQWxpZ25Cb3giLCJBbGlnbkdyb3VwIiwiSEJveCIsIlRleHQiLCJWQm94IiwiQ2hlY2tib3giLCJQYW5lbCIsIlBlbmR1bHVtTGFiQ29uc3RhbnRzIiwicGVuZHVsdW1MYWIiLCJQZW5kdWx1bUxhYlN0cmluZ3MiLCJhY2NlbGVyYXRpb25TdHJpbmciLCJhY2NlbGVyYXRpb24iLCJ2ZWxvY2l0eVN0cmluZyIsInZlbG9jaXR5IiwiQXJyb3dWaXNpYmlsaXR5UGFuZWwiLCJjb25zdHJ1Y3RvciIsImlzVmVsb2NpdHlWaXNpYmxlUHJvcGVydHkiLCJpc0FjY2VsZXJhdGlvblZpc2libGVQcm9wZXJ0eSIsIm9wdGlvbnMiLCJQQU5FTF9PUFRJT05TIiwidGV4dE9wdGlvbnMiLCJmb250IiwiVElUTEVfRk9OVCIsIm1heFdpZHRoIiwidGV4dEhlaWdodCIsImhlaWdodCIsInRleHRHcm91cCIsImNyZWF0ZUNoZWNrYm94Q29udGVudCIsImxhYmVsU3RyaW5nIiwiY29sb3IiLCJjaGlsZHJlbiIsImdyb3VwIiwieEFsaWduIiwiZmlsbCIsImNlbnRlclkiLCJ0YWlsV2lkdGgiLCJoZWFkV2lkdGgiLCJwaWNrYWJsZSIsInZlbG9jaXR5Q29udGVudCIsIlZFTE9DSVRZX0FSUk9XX0NPTE9SIiwiYWNjZWxlcmF0aW9uQ29udGVudCIsIkFDQ0VMRVJBVElPTl9BUlJPV19DT0xPUiIsInRtcENoZWNrYm94IiwiYm94V2lkdGgiLCJ3aWR0aFdpdGhvdXRTcGFjaW5nIiwid2lkdGgiLCJkaXNwb3NlIiwiY29udGVudCIsInNwYWNpbmciLCJDSEVDS19SQURJT19TUEFDSU5HIiwiTEVGVF9DT05URU5UX0FMSUdOX0dST1VQIiwibWF4V2lkdGhQcm9wZXJ0eSIsImxpbmsiLCJmb3JFYWNoIiwiY2hpbGQiLCJhZGRDaGlsZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQXJyb3dWaXNpYmlsaXR5UGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQXJyb3cgY29udHJvbCBwYW5lbCBub2RlIGluICdQZW5kdWx1bSBMYWInIHNpbXVsYXRpb24uXHJcbiAqIENvbnRhaW5zIGNoZWNrYm94IGJ1dHRvbnMgdG8gY29udHJvbCB2aXNpYmlsaXR5IG9mIHZlbG9jaXR5IGFuZCBhY2NlbGVyYXRpb24gYXJyb3dzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFuZHJleSBaZWxlbmtvdiAoTWxlYXJuZXIpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEFycm93Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IHsgQWxpZ25Cb3gsIEFsaWduR3JvdXAsIEhCb3gsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBQZW5kdWx1bUxhYkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vUGVuZHVsdW1MYWJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgcGVuZHVsdW1MYWIgZnJvbSAnLi4vLi4vcGVuZHVsdW1MYWIuanMnO1xyXG5pbXBvcnQgUGVuZHVsdW1MYWJTdHJpbmdzIGZyb20gJy4uLy4uL1BlbmR1bHVtTGFiU3RyaW5ncy5qcyc7XHJcblxyXG5jb25zdCBhY2NlbGVyYXRpb25TdHJpbmcgPSBQZW5kdWx1bUxhYlN0cmluZ3MuYWNjZWxlcmF0aW9uO1xyXG5jb25zdCB2ZWxvY2l0eVN0cmluZyA9IFBlbmR1bHVtTGFiU3RyaW5ncy52ZWxvY2l0eTtcclxuXHJcbmNsYXNzIEFycm93VmlzaWJpbGl0eVBhbmVsIGV4dGVuZHMgUGFuZWwge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gaXNWZWxvY2l0eVZpc2libGVQcm9wZXJ0eSAtIFZpc2liaWxpdHkgb2YgdmVsb2NpdHkgYXJyb3dzLlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBpc0FjY2VsZXJhdGlvblZpc2libGVQcm9wZXJ0eSAtIFZpc2liaWxpdHkgb2YgYWNjZWxlcmF0aW9uIGFycm93cy5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGlzVmVsb2NpdHlWaXNpYmxlUHJvcGVydHksIGlzQWNjZWxlcmF0aW9uVmlzaWJsZVByb3BlcnR5LCBvcHRpb25zICkge1xyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7fSwgUGVuZHVsdW1MYWJDb25zdGFudHMuUEFORUxfT1BUSU9OUywgb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHRleHRPcHRpb25zID0ge1xyXG4gICAgICBmb250OiBQZW5kdWx1bUxhYkNvbnN0YW50cy5USVRMRV9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogODBcclxuICAgIH07XHJcbiAgICBjb25zdCB0ZXh0SGVpZ2h0ID0gbmV3IFRleHQoICdub3QgdmlzaWJsZScsIHRleHRPcHRpb25zICkuaGVpZ2h0O1xyXG5cclxuICAgIGNvbnN0IHRleHRHcm91cCA9IG5ldyBBbGlnbkdyb3VwKCk7XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlQ2hlY2tib3hDb250ZW50KCBsYWJlbFN0cmluZywgY29sb3IgKSB7XHJcbiAgICAgIHJldHVybiBuZXcgSEJveCgge1xyXG4gICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICBuZXcgQWxpZ25Cb3goIG5ldyBUZXh0KCBsYWJlbFN0cmluZywgdGV4dE9wdGlvbnMgKSwgeyBncm91cDogdGV4dEdyb3VwLCB4QWxpZ246ICdsZWZ0JyB9ICksXHJcbiAgICAgICAgICBuZXcgQXJyb3dOb2RlKCAwLCAwLCAyMiwgMCwge1xyXG4gICAgICAgICAgICBmaWxsOiBjb2xvcixcclxuICAgICAgICAgICAgY2VudGVyWTogMCxcclxuICAgICAgICAgICAgdGFpbFdpZHRoOiA2LFxyXG4gICAgICAgICAgICBoZWFkV2lkdGg6IDEyXHJcbiAgICAgICAgICB9IClcclxuICAgICAgICBdLFxyXG4gICAgICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2UnbGwgZHluYW1pY2FsbHkgYWRqdXN0IHRoZSBzcGFjaW5ncyBpbiB0aGVzZSwgc28gdGhhdCB0aGUgZnVsbCBDaGVja2JveCBleHBhbmRzIHRvIHRoZSBkZXNpcmVkIHNpemUuXHJcbiAgICBjb25zdCB2ZWxvY2l0eUNvbnRlbnQgPSBjcmVhdGVDaGVja2JveENvbnRlbnQoIHZlbG9jaXR5U3RyaW5nLCBQZW5kdWx1bUxhYkNvbnN0YW50cy5WRUxPQ0lUWV9BUlJPV19DT0xPUiApO1xyXG4gICAgY29uc3QgYWNjZWxlcmF0aW9uQ29udGVudCA9IGNyZWF0ZUNoZWNrYm94Q29udGVudCggYWNjZWxlcmF0aW9uU3RyaW5nLCBQZW5kdWx1bUxhYkNvbnN0YW50cy5BQ0NFTEVSQVRJT05fQVJST1dfQ09MT1IgKTtcclxuXHJcbiAgICAvLyBDdXJyZW50bHkgbm8gYmV0dGVyIHdheSB0byBoYW5kbGUgdGhlIGZsdWlkIGxheW91dCB3aXRoIGNoZWNrYm94ZXMgdGhhbiB0byBkZXRlcm1pbmUgdGhlIGFtb3VudCBvZiBhZGRpdGlvbmFsXHJcbiAgICAvLyBzcGFjZSBpdCB0YWtlcyB1cCB3aGVuIGl0IGhhcyBubyBzcGFjaW5nIChhbmQgdGhlbiBhZGQgc3BhY2luZyB0byBmaXQpLlxyXG4gICAgY29uc3QgdG1wQ2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIG5ldyBQcm9wZXJ0eSggdHJ1ZSApLCB2ZWxvY2l0eUNvbnRlbnQsIHtcclxuICAgICAgYm94V2lkdGg6IHRleHRIZWlnaHRcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHdpZHRoV2l0aG91dFNwYWNpbmcgPSB0bXBDaGVja2JveC53aWR0aDtcclxuICAgIHRtcENoZWNrYm94LmRpc3Bvc2UoKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IFZCb3goIHtcclxuICAgICAgc3BhY2luZzogUGVuZHVsdW1MYWJDb25zdGFudHMuQ0hFQ0tfUkFESU9fU1BBQ0lOR1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdoZW5ldmVyIHRoZSBhbW91bnQgb2Ygd2lkdGggYXZhaWxhYmxlIGNoYW5nZXMsIHdlIG5lZWQgdG8gcmVjcmVhdGUgdGhlIGNoZWNrYm94ZXNcclxuICAgIFBlbmR1bHVtTGFiQ29uc3RhbnRzLkxFRlRfQ09OVEVOVF9BTElHTl9HUk9VUC5tYXhXaWR0aFByb3BlcnR5LmxpbmsoIHdpZHRoID0+IHtcclxuICAgICAgLy8gUHJvcGVybHkgcmVtb3ZlIGFueSBvbGQgY2hlY2tib3hlc1xyXG4gICAgICBjb250ZW50LmNoaWxkcmVuLmZvckVhY2goIGNoaWxkID0+IHtcclxuICAgICAgICBjaGlsZC5kaXNwb3NlKCk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGNvbnN0IHNwYWNpbmcgPSB3aWR0aCAtIHdpZHRoV2l0aG91dFNwYWNpbmc7XHJcblxyXG4gICAgICAvLyBDcmVhdGUgbmV3IGNoZWNrYm94ZXMgd2l0aCB0aGUgcHJvcGVyIHNwYWNpbmcuIENoZWNrYm94IGN1cnJlbnRseSBkb2Vzbid0IHN1cHBvcnQgcmVzaXppbmcgY29udGVudC5cclxuICAgICAgdmVsb2NpdHlDb250ZW50LnNwYWNpbmcgPSBzcGFjaW5nO1xyXG4gICAgICBjb250ZW50LmFkZENoaWxkKCBuZXcgQ2hlY2tib3goIGlzVmVsb2NpdHlWaXNpYmxlUHJvcGVydHksIHZlbG9jaXR5Q29udGVudCwge1xyXG4gICAgICAgIGJveFdpZHRoOiB0ZXh0SGVpZ2h0XHJcbiAgICAgIH0gKSApO1xyXG5cclxuICAgICAgYWNjZWxlcmF0aW9uQ29udGVudC5zcGFjaW5nID0gc3BhY2luZztcclxuICAgICAgY29udGVudC5hZGRDaGlsZCggbmV3IENoZWNrYm94KCBpc0FjY2VsZXJhdGlvblZpc2libGVQcm9wZXJ0eSwgYWNjZWxlcmF0aW9uQ29udGVudCwge1xyXG4gICAgICAgIGJveFdpZHRoOiB0ZXh0SGVpZ2h0XHJcbiAgICAgIH0gKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBjb250ZW50LCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5wZW5kdWx1bUxhYi5yZWdpc3RlciggJ0Fycm93VmlzaWJpbGl0eVBhbmVsJywgQXJyb3dWaXNpYmlsaXR5UGFuZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgQXJyb3dWaXNpYmlsaXR5UGFuZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsU0FBU0MsUUFBUSxFQUFFQyxVQUFVLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzFGLE9BQU9DLFFBQVEsTUFBTSxnQ0FBZ0M7QUFDckQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxvQkFBb0IsTUFBTSxzQ0FBc0M7QUFDdkUsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFFNUQsTUFBTUMsa0JBQWtCLEdBQUdELGtCQUFrQixDQUFDRSxZQUFZO0FBQzFELE1BQU1DLGNB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