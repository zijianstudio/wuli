// Copyright 2015-2022, University of Colorado Boulder

/**
 * Drag handler for the switch node.  The circuit switch can be dragged between connection points, and is also limited
 * to the region in between the possible connection points.
 *
 * The user can drag the switch anywhere within the limiting bounds of the circuit switch.
 * On drag end, the switch snaps to the cloest connection point.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import Range from '../../../../../dot/js/Range.js';
import Utils from '../../../../../dot/js/Utils.js';
import { DragListener } from '../../../../../scenery/js/imports.js';
import capacitorLabBasics from '../../../capacitorLabBasics.js';
import CLBQueryParameters from '../../CLBQueryParameters.js';
import CircuitState from '../../model/CircuitState.js';
class CircuitSwitchDragHandler extends DragListener {
  /**
   * @param {SwitchNode} switchNode
   * @param {Property.<boolean>} switchLockedProperty
   * @param {Property.<boolean>} userControlledProperty
   * @param {Tandem} tandem
   */
  constructor(switchNode, switchLockedProperty, userControlledProperty, tandem) {
    const circuitSwitch = switchNode.circuitSwitch; // for readability

    let angle = 0;

    // Customization for PhET-iO applications
    const twoStateSwitch = CLBQueryParameters.switch === 'twoState';

    // @private
    let snapRange = {
      right: new Range(0, 3 * Math.PI / 8),
      center: new Range(3 * Math.PI / 8, 5 * Math.PI / 8),
      left: new Range(5 * Math.PI / 8, Math.PI)
    };
    if (twoStateSwitch) {
      snapRange = {
        right: new Range(0, Math.PI / 2),
        center: new Range(Math.PI / 2, Math.PI / 2),
        left: new Range(Math.PI / 2, Math.PI)
      };
    }
    super({
      tandem: tandem,
      start: event => {
        switchLockedProperty.value = true;
        userControlledProperty.value = true;
        circuitSwitch.circuitConnectionProperty.set(CircuitState.SWITCH_IN_TRANSIT);
      },
      drag: event => {
        // mouse in view coordinates
        const pMouse = switchNode.globalToParentPoint(event.pointer.point);

        // mouse in model coordinates
        const transformedPMouse = switchNode.modelViewTransform.viewToModelPosition(pMouse).toVector2();
        const hingePoint = circuitSwitch.hingePoint.toVector2(); // in model coordinates
        angle = transformedPMouse.minus(hingePoint).angle;
        const leftLimitAngle = circuitSwitch.getLeftLimitAngle();
        const rightLimitAngle = circuitSwitch.getRightLimitAngle();

        // get the max and min angles, which depend on circuit switch orientation
        const maxAngle = Math.max(leftLimitAngle, rightLimitAngle);
        const minAngle = Math.min(leftLimitAngle, rightLimitAngle);
        const middleAngle = (maxAngle + minAngle) / 2;

        // Spread the angle out around our min/max, so that clamping makes sense.
        // Restrict the angle so that it cannot be dragged beyond limits
        // If the user's cursor is on the opposite side of the hinge point, flip our angle.
        if (angle * leftLimitAngle < 0) {
          angle = -angle;
        }
        angle = Utils.moduloBetweenDown(angle, middleAngle - Math.PI, middleAngle + Math.PI);
        angle = Utils.clamp(angle, minAngle, maxAngle);
        circuitSwitch.angleProperty.set(angle);
      },
      end: () => {
        switchLockedProperty.value = false;
        userControlledProperty.value = false;

        // snap the switch to the nearest connection point and set the active connection
        const absAngle = Math.abs(circuitSwitch.angleProperty.value);
        let connection = null;
        if (snapRange.right.contains(absAngle)) {
          connection = CircuitState.LIGHT_BULB_CONNECTED;
        } else if (snapRange.center.contains(absAngle)) {
          connection = CircuitState.OPEN_CIRCUIT;
        } else if (snapRange.left.contains(absAngle)) {
          connection = CircuitState.BATTERY_CONNECTED;
        }
        assert && assert(connection, `No snap region found for switch angle: ${absAngle}`);
        circuitSwitch.circuitConnectionProperty.set(connection);
      }
    });
  }
}
capacitorLabBasics.register('CircuitSwitchDragHandler', CircuitSwitchDragHandler);
export default CircuitSwitchDragHandler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIlV0aWxzIiwiRHJhZ0xpc3RlbmVyIiwiY2FwYWNpdG9yTGFiQmFzaWNzIiwiQ0xCUXVlcnlQYXJhbWV0ZXJzIiwiQ2lyY3VpdFN0YXRlIiwiQ2lyY3VpdFN3aXRjaERyYWdIYW5kbGVyIiwiY29uc3RydWN0b3IiLCJzd2l0Y2hOb2RlIiwic3dpdGNoTG9ja2VkUHJvcGVydHkiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5IiwidGFuZGVtIiwiY2lyY3VpdFN3aXRjaCIsImFuZ2xlIiwidHdvU3RhdGVTd2l0Y2giLCJzd2l0Y2giLCJzbmFwUmFuZ2UiLCJyaWdodCIsIk1hdGgiLCJQSSIsImNlbnRlciIsImxlZnQiLCJzdGFydCIsImV2ZW50IiwidmFsdWUiLCJjaXJjdWl0Q29ubmVjdGlvblByb3BlcnR5Iiwic2V0IiwiU1dJVENIX0lOX1RSQU5TSVQiLCJkcmFnIiwicE1vdXNlIiwiZ2xvYmFsVG9QYXJlbnRQb2ludCIsInBvaW50ZXIiLCJwb2ludCIsInRyYW5zZm9ybWVkUE1vdXNlIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwidmlld1RvTW9kZWxQb3NpdGlvbiIsInRvVmVjdG9yMiIsImhpbmdlUG9pbnQiLCJtaW51cyIsImxlZnRMaW1pdEFuZ2xlIiwiZ2V0TGVmdExpbWl0QW5nbGUiLCJyaWdodExpbWl0QW5nbGUiLCJnZXRSaWdodExpbWl0QW5nbGUiLCJtYXhBbmdsZSIsIm1heCIsIm1pbkFuZ2xlIiwibWluIiwibWlkZGxlQW5nbGUiLCJtb2R1bG9CZXR3ZWVuRG93biIsImNsYW1wIiwiYW5nbGVQcm9wZXJ0eSIsImVuZCIsImFic0FuZ2xlIiwiYWJzIiwiY29ubmVjdGlvbiIsImNvbnRhaW5zIiwiTElHSFRfQlVMQl9DT05ORUNURUQiLCJPUEVOX0NJUkNVSVQiLCJCQVRURVJZX0NPTk5FQ1RFRCIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2lyY3VpdFN3aXRjaERyYWdIYW5kbGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERyYWcgaGFuZGxlciBmb3IgdGhlIHN3aXRjaCBub2RlLiAgVGhlIGNpcmN1aXQgc3dpdGNoIGNhbiBiZSBkcmFnZ2VkIGJldHdlZW4gY29ubmVjdGlvbiBwb2ludHMsIGFuZCBpcyBhbHNvIGxpbWl0ZWRcclxuICogdG8gdGhlIHJlZ2lvbiBpbiBiZXR3ZWVuIHRoZSBwb3NzaWJsZSBjb25uZWN0aW9uIHBvaW50cy5cclxuICpcclxuICogVGhlIHVzZXIgY2FuIGRyYWcgdGhlIHN3aXRjaCBhbnl3aGVyZSB3aXRoaW4gdGhlIGxpbWl0aW5nIGJvdW5kcyBvZiB0aGUgY2lyY3VpdCBzd2l0Y2guXHJcbiAqIE9uIGRyYWcgZW5kLCB0aGUgc3dpdGNoIHNuYXBzIHRvIHRoZSBjbG9lc3QgY29ubmVjdGlvbiBwb2ludC5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQW5kcmV3IEFkYXJlIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IHsgRHJhZ0xpc3RlbmVyIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGNhcGFjaXRvckxhYkJhc2ljcyBmcm9tICcuLi8uLi8uLi9jYXBhY2l0b3JMYWJCYXNpY3MuanMnO1xyXG5pbXBvcnQgQ0xCUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uLy4uL0NMQlF1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBDaXJjdWl0U3RhdGUgZnJvbSAnLi4vLi4vbW9kZWwvQ2lyY3VpdFN0YXRlLmpzJztcclxuXHJcbmNsYXNzIENpcmN1aXRTd2l0Y2hEcmFnSGFuZGxlciBleHRlbmRzIERyYWdMaXN0ZW5lciB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtTd2l0Y2hOb2RlfSBzd2l0Y2hOb2RlXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHN3aXRjaExvY2tlZFByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHVzZXJDb250cm9sbGVkUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHN3aXRjaE5vZGUsIHN3aXRjaExvY2tlZFByb3BlcnR5LCB1c2VyQ29udHJvbGxlZFByb3BlcnR5LCB0YW5kZW0gKSB7XHJcblxyXG4gICAgY29uc3QgY2lyY3VpdFN3aXRjaCA9IHN3aXRjaE5vZGUuY2lyY3VpdFN3aXRjaDsgLy8gZm9yIHJlYWRhYmlsaXR5XHJcblxyXG4gICAgbGV0IGFuZ2xlID0gMDtcclxuXHJcbiAgICAvLyBDdXN0b21pemF0aW9uIGZvciBQaEVULWlPIGFwcGxpY2F0aW9uc1xyXG4gICAgY29uc3QgdHdvU3RhdGVTd2l0Y2ggPSBDTEJRdWVyeVBhcmFtZXRlcnMuc3dpdGNoID09PSAndHdvU3RhdGUnO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICBsZXQgc25hcFJhbmdlID0ge1xyXG4gICAgICByaWdodDogbmV3IFJhbmdlKCAwLCAzICogTWF0aC5QSSAvIDggKSxcclxuICAgICAgY2VudGVyOiBuZXcgUmFuZ2UoIDMgKiBNYXRoLlBJIC8gOCwgNSAqIE1hdGguUEkgLyA4ICksXHJcbiAgICAgIGxlZnQ6IG5ldyBSYW5nZSggNSAqIE1hdGguUEkgLyA4LCBNYXRoLlBJIClcclxuICAgIH07XHJcblxyXG4gICAgaWYgKCB0d29TdGF0ZVN3aXRjaCApIHtcclxuICAgICAgc25hcFJhbmdlID0ge1xyXG4gICAgICAgIHJpZ2h0OiBuZXcgUmFuZ2UoIDAsIE1hdGguUEkgLyAyICksXHJcbiAgICAgICAgY2VudGVyOiBuZXcgUmFuZ2UoIE1hdGguUEkgLyAyLCBNYXRoLlBJIC8gMiApLFxyXG4gICAgICAgIGxlZnQ6IG5ldyBSYW5nZSggTWF0aC5QSSAvIDIsIE1hdGguUEkgKVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLFxyXG5cclxuICAgICAgc3RhcnQ6IGV2ZW50ID0+IHtcclxuICAgICAgICBzd2l0Y2hMb2NrZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgdXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIGNpcmN1aXRTd2l0Y2guY2lyY3VpdENvbm5lY3Rpb25Qcm9wZXJ0eS5zZXQoIENpcmN1aXRTdGF0ZS5TV0lUQ0hfSU5fVFJBTlNJVCApO1xyXG5cclxuICAgICAgfSxcclxuICAgICAgZHJhZzogZXZlbnQgPT4ge1xyXG5cclxuICAgICAgICAvLyBtb3VzZSBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcbiAgICAgICAgY29uc3QgcE1vdXNlID0gc3dpdGNoTm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICk7XHJcblxyXG4gICAgICAgIC8vIG1vdXNlIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRQTW91c2UgPSBzd2l0Y2hOb2RlLm1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbFBvc2l0aW9uKCBwTW91c2UgKS50b1ZlY3RvcjIoKTtcclxuXHJcbiAgICAgICAgY29uc3QgaGluZ2VQb2ludCA9IGNpcmN1aXRTd2l0Y2guaGluZ2VQb2ludC50b1ZlY3RvcjIoKTsgLy8gaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgICAgICBhbmdsZSA9IHRyYW5zZm9ybWVkUE1vdXNlLm1pbnVzKCBoaW5nZVBvaW50ICkuYW5nbGU7XHJcblxyXG4gICAgICAgIGNvbnN0IGxlZnRMaW1pdEFuZ2xlID0gY2lyY3VpdFN3aXRjaC5nZXRMZWZ0TGltaXRBbmdsZSgpO1xyXG4gICAgICAgIGNvbnN0IHJpZ2h0TGltaXRBbmdsZSA9IGNpcmN1aXRTd2l0Y2guZ2V0UmlnaHRMaW1pdEFuZ2xlKCk7XHJcblxyXG4gICAgICAgIC8vIGdldCB0aGUgbWF4IGFuZCBtaW4gYW5nbGVzLCB3aGljaCBkZXBlbmQgb24gY2lyY3VpdCBzd2l0Y2ggb3JpZW50YXRpb25cclxuICAgICAgICBjb25zdCBtYXhBbmdsZSA9IE1hdGgubWF4KCBsZWZ0TGltaXRBbmdsZSwgcmlnaHRMaW1pdEFuZ2xlICk7XHJcbiAgICAgICAgY29uc3QgbWluQW5nbGUgPSBNYXRoLm1pbiggbGVmdExpbWl0QW5nbGUsIHJpZ2h0TGltaXRBbmdsZSApO1xyXG4gICAgICAgIGNvbnN0IG1pZGRsZUFuZ2xlID0gKCBtYXhBbmdsZSArIG1pbkFuZ2xlICkgLyAyO1xyXG5cclxuICAgICAgICAvLyBTcHJlYWQgdGhlIGFuZ2xlIG91dCBhcm91bmQgb3VyIG1pbi9tYXgsIHNvIHRoYXQgY2xhbXBpbmcgbWFrZXMgc2Vuc2UuXHJcbiAgICAgICAgLy8gUmVzdHJpY3QgdGhlIGFuZ2xlIHNvIHRoYXQgaXQgY2Fubm90IGJlIGRyYWdnZWQgYmV5b25kIGxpbWl0c1xyXG4gICAgICAgIC8vIElmIHRoZSB1c2VyJ3MgY3Vyc29yIGlzIG9uIHRoZSBvcHBvc2l0ZSBzaWRlIG9mIHRoZSBoaW5nZSBwb2ludCwgZmxpcCBvdXIgYW5nbGUuXHJcbiAgICAgICAgaWYgKCBhbmdsZSAqIGxlZnRMaW1pdEFuZ2xlIDwgMCApIHtcclxuICAgICAgICAgIGFuZ2xlID0gLWFuZ2xlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhbmdsZSA9IFV0aWxzLm1vZHVsb0JldHdlZW5Eb3duKCBhbmdsZSwgbWlkZGxlQW5nbGUgLSBNYXRoLlBJLCBtaWRkbGVBbmdsZSArIE1hdGguUEkgKTtcclxuICAgICAgICBhbmdsZSA9IFV0aWxzLmNsYW1wKCBhbmdsZSwgbWluQW5nbGUsIG1heEFuZ2xlICk7XHJcblxyXG4gICAgICAgIGNpcmN1aXRTd2l0Y2guYW5nbGVQcm9wZXJ0eS5zZXQoIGFuZ2xlICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGVuZDogKCkgPT4ge1xyXG4gICAgICAgIHN3aXRjaExvY2tlZFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgdXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBzbmFwIHRoZSBzd2l0Y2ggdG8gdGhlIG5lYXJlc3QgY29ubmVjdGlvbiBwb2ludCBhbmQgc2V0IHRoZSBhY3RpdmUgY29ubmVjdGlvblxyXG4gICAgICAgIGNvbnN0IGFic0FuZ2xlID0gTWF0aC5hYnMoIGNpcmN1aXRTd2l0Y2guYW5nbGVQcm9wZXJ0eS52YWx1ZSApO1xyXG5cclxuICAgICAgICBsZXQgY29ubmVjdGlvbiA9IG51bGw7XHJcbiAgICAgICAgaWYgKCBzbmFwUmFuZ2UucmlnaHQuY29udGFpbnMoIGFic0FuZ2xlICkgKSB7XHJcbiAgICAgICAgICBjb25uZWN0aW9uID0gQ2lyY3VpdFN0YXRlLkxJR0hUX0JVTEJfQ09OTkVDVEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggc25hcFJhbmdlLmNlbnRlci5jb250YWlucyggYWJzQW5nbGUgKSApIHtcclxuICAgICAgICAgIGNvbm5lY3Rpb24gPSBDaXJjdWl0U3RhdGUuT1BFTl9DSVJDVUlUO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggc25hcFJhbmdlLmxlZnQuY29udGFpbnMoIGFic0FuZ2xlICkgKSB7XHJcbiAgICAgICAgICBjb25uZWN0aW9uID0gQ2lyY3VpdFN0YXRlLkJBVFRFUllfQ09OTkVDVEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb25uZWN0aW9uLCBgTm8gc25hcCByZWdpb24gZm91bmQgZm9yIHN3aXRjaCBhbmdsZTogJHthYnNBbmdsZX1gICk7XHJcblxyXG4gICAgICAgIGNpcmN1aXRTd2l0Y2guY2lyY3VpdENvbm5lY3Rpb25Qcm9wZXJ0eS5zZXQoIGNvbm5lY3Rpb24gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuY2FwYWNpdG9yTGFiQmFzaWNzLnJlZ2lzdGVyKCAnQ2lyY3VpdFN3aXRjaERyYWdIYW5kbGVyJywgQ2lyY3VpdFN3aXRjaERyYWdIYW5kbGVyICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDaXJjdWl0U3dpdGNoRHJhZ0hhbmRsZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sZ0NBQWdDO0FBQ2xELE9BQU9DLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsU0FBU0MsWUFBWSxRQUFRLHNDQUFzQztBQUNuRSxPQUFPQyxrQkFBa0IsTUFBTSxnQ0FBZ0M7QUFDL0QsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLFlBQVksTUFBTSw2QkFBNkI7QUFFdEQsTUFBTUMsd0JBQXdCLFNBQVNKLFlBQVksQ0FBQztFQUNsRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUssV0FBV0EsQ0FBRUMsVUFBVSxFQUFFQyxvQkFBb0IsRUFBRUMsc0JBQXNCLEVBQUVDLE1BQU0sRUFBRztJQUU5RSxNQUFNQyxhQUFhLEdBQUdKLFVBQVUsQ0FBQ0ksYUFBYSxDQUFDLENBQUM7O0lBRWhELElBQUlDLEtBQUssR0FBRyxDQUFDOztJQUViO0lBQ0EsTUFBTUMsY0FBYyxHQUFHVixrQkFBa0IsQ0FBQ1csTUFBTSxLQUFLLFVBQVU7O0lBRS9EO0lBQ0EsSUFBSUMsU0FBUyxHQUFHO01BQ2RDLEtBQUssRUFBRSxJQUFJakIsS0FBSyxDQUFFLENBQUMsRUFBRSxDQUFDLEdBQUdrQixJQUFJ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