// Copyright 2020-2022, University of Colorado Boulder

/**
 * ReturnBallsButton is RectangularPushButton sub-type that displays 'Return returnBalls'. It appears when the
 * 'Reflecting Border' checkbox is unchecked and all of the Balls in the system have escaped from within the
 * PlayArea's bounds.
 *
 * Pressing the ReturnBallsButton returns the Balls to their most recent saved state. ReturnBallsButtons are created
 * at the start of the sim and are never disposed, so no dispose method is necessary and internal links are left as-is.
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import { Text } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
class ReturnBallsButton extends RectangularPushButton {
  /**
   * @param {ReadOnlyProperty.<boolean>} ballsNotInsidePlayAreaProperty - indicates if all of the Balls in the system are NOT
   *                                                              inside the PlayArea's bounds.
   * @param {Object} [options]
   */
  constructor(ballsNotInsidePlayAreaProperty, options) {
    assert && AssertUtils.assertAbstractPropertyOf(ballsNotInsidePlayAreaProperty, 'boolean');
    options = merge({
      // {Font} - font for the label Text instance.
      labelFont: CollisionLabConstants.CONTROL_FONT,
      // super-class options
      baseColor: CollisionLabColors.RETURN_BALLS_BUTTON,
      touchAreaXDilation: 5,
      touchAreaYDilation: 5
    }, options);

    //----------------------------------------------------------------------------------------

    assert && assert(!options.content, 'ReturnBallsButton sets content');
    options.content = new Text(CollisionLabStrings.returnBalls, {
      font: options.labelFont,
      maxWidth: 150 // constrain width for i18n. determined empirically
    });

    super(options);

    //----------------------------------------------------------------------------------------

    // Observe when the ballsNotInsidePlayAreaProperty changes and update the visibility of this Button, which
    // is only visible once all of the balls have escaped the PlayArea. Listener is never unlinked since
    // ReturnBallsButtons are never disposed.
    ballsNotInsidePlayAreaProperty.linkAttribute(this, 'visible');
  }
}
collisionLab.register('ReturnBallsButton', ReturnBallsButton);
export default ReturnBallsButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkFzc2VydFV0aWxzIiwiVGV4dCIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsImNvbGxpc2lvbkxhYiIsIkNvbGxpc2lvbkxhYlN0cmluZ3MiLCJDb2xsaXNpb25MYWJDb2xvcnMiLCJDb2xsaXNpb25MYWJDb25zdGFudHMiLCJSZXR1cm5CYWxsc0J1dHRvbiIsImNvbnN0cnVjdG9yIiwiYmFsbHNOb3RJbnNpZGVQbGF5QXJlYVByb3BlcnR5Iiwib3B0aW9ucyIsImFzc2VydCIsImFzc2VydEFic3RyYWN0UHJvcGVydHlPZiIsImxhYmVsRm9udCIsIkNPTlRST0xfRk9OVCIsImJhc2VDb2xvciIsIlJFVFVSTl9CQUxMU19CVVRUT04iLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJjb250ZW50IiwicmV0dXJuQmFsbHMiLCJmb250IiwibWF4V2lkdGgiLCJsaW5rQXR0cmlidXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJSZXR1cm5CYWxsc0J1dHRvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5CYWxsc0J1dHRvbiBpcyBSZWN0YW5ndWxhclB1c2hCdXR0b24gc3ViLXR5cGUgdGhhdCBkaXNwbGF5cyAnUmV0dXJuIHJldHVybkJhbGxzJy4gSXQgYXBwZWFycyB3aGVuIHRoZVxyXG4gKiAnUmVmbGVjdGluZyBCb3JkZXInIGNoZWNrYm94IGlzIHVuY2hlY2tlZCBhbmQgYWxsIG9mIHRoZSBCYWxscyBpbiB0aGUgc3lzdGVtIGhhdmUgZXNjYXBlZCBmcm9tIHdpdGhpbiB0aGVcclxuICogUGxheUFyZWEncyBib3VuZHMuXHJcbiAqXHJcbiAqIFByZXNzaW5nIHRoZSBSZXR1cm5CYWxsc0J1dHRvbiByZXR1cm5zIHRoZSBCYWxscyB0byB0aGVpciBtb3N0IHJlY2VudCBzYXZlZCBzdGF0ZS4gUmV0dXJuQmFsbHNCdXR0b25zIGFyZSBjcmVhdGVkXHJcbiAqIGF0IHRoZSBzdGFydCBvZiB0aGUgc2ltIGFuZCBhcmUgbmV2ZXIgZGlzcG9zZWQsIHNvIG5vIGRpc3Bvc2UgbWV0aG9kIGlzIG5lY2Vzc2FyeSBhbmQgaW50ZXJuYWwgbGlua3MgYXJlIGxlZnQgYXMtaXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgQXNzZXJ0VXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9Bc3NlcnRVdGlscy5qcyc7XHJcbmltcG9ydCB7IFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBjb2xsaXNpb25MYWIgZnJvbSAnLi4vLi4vY29sbGlzaW9uTGFiLmpzJztcclxuaW1wb3J0IENvbGxpc2lvbkxhYlN0cmluZ3MgZnJvbSAnLi4vLi4vQ29sbGlzaW9uTGFiU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJDb2xvcnMgZnJvbSAnLi4vQ29sbGlzaW9uTGFiQ29sb3JzLmpzJztcclxuaW1wb3J0IENvbGxpc2lvbkxhYkNvbnN0YW50cyBmcm9tICcuLi9Db2xsaXNpb25MYWJDb25zdGFudHMuanMnO1xyXG5cclxuY2xhc3MgUmV0dXJuQmFsbHNCdXR0b24gZXh0ZW5kcyBSZWN0YW5ndWxhclB1c2hCdXR0b24ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1JlYWRPbmx5UHJvcGVydHkuPGJvb2xlYW4+fSBiYWxsc05vdEluc2lkZVBsYXlBcmVhUHJvcGVydHkgLSBpbmRpY2F0ZXMgaWYgYWxsIG9mIHRoZSBCYWxscyBpbiB0aGUgc3lzdGVtIGFyZSBOT1RcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zaWRlIHRoZSBQbGF5QXJlYSdzIGJvdW5kcy5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGJhbGxzTm90SW5zaWRlUGxheUFyZWFQcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRBYnN0cmFjdFByb3BlcnR5T2YoIGJhbGxzTm90SW5zaWRlUGxheUFyZWFQcm9wZXJ0eSwgJ2Jvb2xlYW4nICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyB7Rm9udH0gLSBmb250IGZvciB0aGUgbGFiZWwgVGV4dCBpbnN0YW5jZS5cclxuICAgICAgbGFiZWxGb250OiBDb2xsaXNpb25MYWJDb25zdGFudHMuQ09OVFJPTF9GT05ULFxyXG5cclxuICAgICAgLy8gc3VwZXItY2xhc3Mgb3B0aW9uc1xyXG4gICAgICBiYXNlQ29sb3I6IENvbGxpc2lvbkxhYkNvbG9ycy5SRVRVUk5fQkFMTFNfQlVUVE9OLFxyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDUsXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogNVxyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5jb250ZW50LCAnUmV0dXJuQmFsbHNCdXR0b24gc2V0cyBjb250ZW50JyApO1xyXG4gICAgb3B0aW9ucy5jb250ZW50ID0gbmV3IFRleHQoIENvbGxpc2lvbkxhYlN0cmluZ3MucmV0dXJuQmFsbHMsIHtcclxuICAgICAgZm9udDogb3B0aW9ucy5sYWJlbEZvbnQsXHJcbiAgICAgIG1heFdpZHRoOiAxNTAgLy8gY29uc3RyYWluIHdpZHRoIGZvciBpMThuLiBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBPYnNlcnZlIHdoZW4gdGhlIGJhbGxzTm90SW5zaWRlUGxheUFyZWFQcm9wZXJ0eSBjaGFuZ2VzIGFuZCB1cGRhdGUgdGhlIHZpc2liaWxpdHkgb2YgdGhpcyBCdXR0b24sIHdoaWNoXHJcbiAgICAvLyBpcyBvbmx5IHZpc2libGUgb25jZSBhbGwgb2YgdGhlIGJhbGxzIGhhdmUgZXNjYXBlZCB0aGUgUGxheUFyZWEuIExpc3RlbmVyIGlzIG5ldmVyIHVubGlua2VkIHNpbmNlXHJcbiAgICAvLyBSZXR1cm5CYWxsc0J1dHRvbnMgYXJlIG5ldmVyIGRpc3Bvc2VkLlxyXG4gICAgYmFsbHNOb3RJbnNpZGVQbGF5QXJlYVByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHRoaXMsICd2aXNpYmxlJyApO1xyXG4gIH1cclxufVxyXG5cclxuY29sbGlzaW9uTGFiLnJlZ2lzdGVyKCAnUmV0dXJuQmFsbHNCdXR0b24nLCBSZXR1cm5CYWxsc0J1dHRvbiApO1xyXG5leHBvcnQgZGVmYXVsdCBSZXR1cm5CYWxsc0J1dHRvbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLDBDQUEwQztBQUNsRSxTQUFTQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLHFCQUFxQixNQUFNLHFEQUFxRDtBQUN2RixPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBQ2hELE9BQU9DLG1CQUFtQixNQUFNLDhCQUE4QjtBQUM5RCxPQUFPQyxrQkFBa0IsTUFBTSwwQkFBMEI7QUFDekQsT0FBT0MscUJBQXFCLE1BQU0sNkJBQTZCO0FBRS9ELE1BQU1DLGlCQUFpQixTQUFTTCxxQkFBcUIsQ0FBQztFQUVwRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VNLFdBQVdBLENBQUVDLDhCQUE4QixFQUFFQyxPQUFPLEVBQUc7SUFDckRDLE1BQU0sSUFBSVgsV0FBVyxDQUFDWSx3QkFBd0IsQ0FBRUgsOEJBQThCLEVBQUUsU0FBVSxDQUFDO0lBRTNGQyxPQUFPLEdBQUdYLEtBQUssQ0FBRTtNQUVmO01BQ0FjLFNBQVMsRUFBRVAscUJBQXFCLENBQUNRLFlBQVk7TUFFN0M7TUFDQUMsU0FBUyxFQUFFVixrQkFBa0IsQ0FBQ1csbUJBQW1CO01BQ2pEQyxrQkFBa0IsRUFBRSxDQUFDO01BQ3JCQyxrQkFBa0IsRUFBRTtJQUV0QixDQUFDLEVBQUVSLE9BQVEsQ0FBQzs7SUFFWjs7SUFFQUMsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQ0QsT0FBTyxDQUFDUyxPQUFPLEVBQUUsZ0NBQWlDLENBQUM7SUFDdEVULE9BQU8sQ0FBQ1MsT0FBTyxHQUFHLElBQUlsQixJQUFJLENBQUVHLG1CQUFtQixDQUFDZ0IsV0FBVyxFQUFFO01BQzNEQyxJQUFJLEVBQUVYLE9BQU8sQ0FBQ0csU0FBUztNQUN2QlMsUUFBUSxFQUFFLEdBQUcsQ0FBQztJQUNoQixDQUFFLENBQUM7O0lBRUgsS0FBSyxDQUFFWixPQUFRLENBQUM7O0lBRWhCOztJQUVBO0lBQ0E7SUFDQTtJQUNBRCw4QkFBOEIsQ0FBQ2MsYUFBYSxDQUFFLElBQUksRUFBRSxTQUFVLENBQUM7RUFDakU7QUFDRjtBQUVBcEIsWUFBWSxDQUFDcUIsUUFBUSxDQUFFLG1CQUFtQixFQUFFakIsaUJBQWtCLENBQUM7QUFDL0QsZUFBZUEsaUJBQWlCIn0=