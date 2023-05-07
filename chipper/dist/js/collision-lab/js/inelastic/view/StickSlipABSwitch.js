// Copyright 2020-2022, University of Colorado Boulder

/**
 * StickSlipABSwitch is a ABSwitch sub-type that allows the user to the different InelasticCollisionTypes. It
 * appears only on the bottom-center of the control panel in the 'Inelastic' screen. See InelasticCollisionType.js for
 * more context.
 *
 * StickSlipABSwitch is never disposed and exists for the entire simulation.
 *
 * @author Brandon Li
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import { AlignGroup, Text } from '../../../../scenery/js/imports.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import InelasticCollisionType from '../model/InelasticCollisionType.js';
class StickSlipABSwitch extends ABSwitch {
  /**
   * @param {Property.<InelasticCollisionType>} inelasticCollisionTypeProperty
   * @param {Object} [options]
   */
  constructor(inelasticCollisionTypeProperty, options) {
    assert && AssertUtils.assertEnumerationDeprecatedPropertyOf(inelasticCollisionTypeProperty, InelasticCollisionType);
    options = merge({
      // {Object} - passed to the labels of the ABSwitch.
      textOptions: {
        font: CollisionLabConstants.CONTROL_FONT,
        maxWidth: 70 // constrain width for i18n, determined empirically
      },

      // super-class options
      toggleSwitchOptions: {
        size: new Dimension2(28, 12)
      }
    }, options);

    //----------------------------------------------------------------------------------------

    // Create an AlignGroup for the Text Nodes to match their widths.
    const labelAlignGroup = new AlignGroup({
      matchHorizontal: true,
      matchVertical: false
    });

    // Create the Labels of the ABSwitch.
    const stickLabel = labelAlignGroup.createBox(new Text(CollisionLabStrings.stick, options.textOptions));
    const slipLabel = labelAlignGroup.createBox(new Text(CollisionLabStrings.slip, options.textOptions));

    // Create the 'Stick' vs 'Slip' ABSwitch.
    super(inelasticCollisionTypeProperty, InelasticCollisionType.STICK, stickLabel, InelasticCollisionType.SLIP, slipLabel, options);
  }
}
collisionLab.register('StickSlipABSwitch', StickSlipABSwitch);
export default StickSlipABSwitch;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwibWVyZ2UiLCJBc3NlcnRVdGlscyIsIkFsaWduR3JvdXAiLCJUZXh0IiwiQUJTd2l0Y2giLCJjb2xsaXNpb25MYWIiLCJDb2xsaXNpb25MYWJTdHJpbmdzIiwiQ29sbGlzaW9uTGFiQ29uc3RhbnRzIiwiSW5lbGFzdGljQ29sbGlzaW9uVHlwZSIsIlN0aWNrU2xpcEFCU3dpdGNoIiwiY29uc3RydWN0b3IiLCJpbmVsYXN0aWNDb2xsaXNpb25UeXBlUHJvcGVydHkiLCJvcHRpb25zIiwiYXNzZXJ0IiwiYXNzZXJ0RW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHlPZiIsInRleHRPcHRpb25zIiwiZm9udCIsIkNPTlRST0xfRk9OVCIsIm1heFdpZHRoIiwidG9nZ2xlU3dpdGNoT3B0aW9ucyIsInNpemUiLCJsYWJlbEFsaWduR3JvdXAiLCJtYXRjaEhvcml6b250YWwiLCJtYXRjaFZlcnRpY2FsIiwic3RpY2tMYWJlbCIsImNyZWF0ZUJveCIsInN0aWNrIiwic2xpcExhYmVsIiwic2xpcCIsIlNUSUNLIiwiU0xJUCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3RpY2tTbGlwQUJTd2l0Y2guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU3RpY2tTbGlwQUJTd2l0Y2ggaXMgYSBBQlN3aXRjaCBzdWItdHlwZSB0aGF0IGFsbG93cyB0aGUgdXNlciB0byB0aGUgZGlmZmVyZW50IEluZWxhc3RpY0NvbGxpc2lvblR5cGVzLiBJdFxyXG4gKiBhcHBlYXJzIG9ubHkgb24gdGhlIGJvdHRvbS1jZW50ZXIgb2YgdGhlIGNvbnRyb2wgcGFuZWwgaW4gdGhlICdJbmVsYXN0aWMnIHNjcmVlbi4gU2VlIEluZWxhc3RpY0NvbGxpc2lvblR5cGUuanMgZm9yXHJcbiAqIG1vcmUgY29udGV4dC5cclxuICpcclxuICogU3RpY2tTbGlwQUJTd2l0Y2ggaXMgbmV2ZXIgZGlzcG9zZWQgYW5kIGV4aXN0cyBmb3IgdGhlIGVudGlyZSBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEJyYW5kb24gTGlcclxuICovXHJcblxyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgQXNzZXJ0VXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9Bc3NlcnRVdGlscy5qcyc7XHJcbmltcG9ydCB7IEFsaWduR3JvdXAsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQUJTd2l0Y2ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0FCU3dpdGNoLmpzJztcclxuaW1wb3J0IGNvbGxpc2lvbkxhYiBmcm9tICcuLi8uLi9jb2xsaXNpb25MYWIuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiU3RyaW5ncyBmcm9tICcuLi8uLi9Db2xsaXNpb25MYWJTdHJpbmdzLmpzJztcclxuaW1wb3J0IENvbGxpc2lvbkxhYkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQ29sbGlzaW9uTGFiQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEluZWxhc3RpY0NvbGxpc2lvblR5cGUgZnJvbSAnLi4vbW9kZWwvSW5lbGFzdGljQ29sbGlzaW9uVHlwZS5qcyc7XHJcblxyXG5jbGFzcyBTdGlja1NsaXBBQlN3aXRjaCBleHRlbmRzIEFCU3dpdGNoIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48SW5lbGFzdGljQ29sbGlzaW9uVHlwZT59IGluZWxhc3RpY0NvbGxpc2lvblR5cGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaW5lbGFzdGljQ29sbGlzaW9uVHlwZVByb3BlcnR5LCBvcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5T2YoIGluZWxhc3RpY0NvbGxpc2lvblR5cGVQcm9wZXJ0eSwgSW5lbGFzdGljQ29sbGlzaW9uVHlwZSApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8ge09iamVjdH0gLSBwYXNzZWQgdG8gdGhlIGxhYmVscyBvZiB0aGUgQUJTd2l0Y2guXHJcbiAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgZm9udDogQ29sbGlzaW9uTGFiQ29uc3RhbnRzLkNPTlRST0xfRk9OVCxcclxuICAgICAgICBtYXhXaWR0aDogNzAgLy8gY29uc3RyYWluIHdpZHRoIGZvciBpMThuLCBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBzdXBlci1jbGFzcyBvcHRpb25zXHJcbiAgICAgIHRvZ2dsZVN3aXRjaE9wdGlvbnM6IHtcclxuICAgICAgICBzaXplOiBuZXcgRGltZW5zaW9uMiggMjgsIDEyIClcclxuICAgICAgfVxyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBDcmVhdGUgYW4gQWxpZ25Hcm91cCBmb3IgdGhlIFRleHQgTm9kZXMgdG8gbWF0Y2ggdGhlaXIgd2lkdGhzLlxyXG4gICAgY29uc3QgbGFiZWxBbGlnbkdyb3VwID0gbmV3IEFsaWduR3JvdXAoIHsgbWF0Y2hIb3Jpem9udGFsOiB0cnVlLCBtYXRjaFZlcnRpY2FsOiBmYWxzZSB9ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBMYWJlbHMgb2YgdGhlIEFCU3dpdGNoLlxyXG4gICAgY29uc3Qgc3RpY2tMYWJlbCA9IGxhYmVsQWxpZ25Hcm91cC5jcmVhdGVCb3goIG5ldyBUZXh0KCBDb2xsaXNpb25MYWJTdHJpbmdzLnN0aWNrLCBvcHRpb25zLnRleHRPcHRpb25zICkgKTtcclxuICAgIGNvbnN0IHNsaXBMYWJlbCA9IGxhYmVsQWxpZ25Hcm91cC5jcmVhdGVCb3goIG5ldyBUZXh0KCBDb2xsaXNpb25MYWJTdHJpbmdzLnNsaXAsIG9wdGlvbnMudGV4dE9wdGlvbnMgKSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgJ1N0aWNrJyB2cyAnU2xpcCcgQUJTd2l0Y2guXHJcbiAgICBzdXBlciggaW5lbGFzdGljQ29sbGlzaW9uVHlwZVByb3BlcnR5LFxyXG4gICAgICBJbmVsYXN0aWNDb2xsaXNpb25UeXBlLlNUSUNLLCBzdGlja0xhYmVsLFxyXG4gICAgICBJbmVsYXN0aWNDb2xsaXNpb25UeXBlLlNMSVAsIHNsaXBMYWJlbCxcclxuICAgICAgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuY29sbGlzaW9uTGFiLnJlZ2lzdGVyKCAnU3RpY2tTbGlwQUJTd2l0Y2gnLCBTdGlja1NsaXBBQlN3aXRjaCApO1xyXG5leHBvcnQgZGVmYXVsdCBTdGlja1NsaXBBQlN3aXRjaDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLDBDQUEwQztBQUNsRSxTQUFTQyxVQUFVLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDcEUsT0FBT0MsUUFBUSxNQUFNLGdDQUFnQztBQUNyRCxPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBQ2hELE9BQU9DLG1CQUFtQixNQUFNLDhCQUE4QjtBQUM5RCxPQUFPQyxxQkFBcUIsTUFBTSx1Q0FBdUM7QUFDekUsT0FBT0Msc0JBQXNCLE1BQU0sb0NBQW9DO0FBRXZFLE1BQU1DLGlCQUFpQixTQUFTTCxRQUFRLENBQUM7RUFFdkM7QUFDRjtBQUNBO0FBQ0E7RUFDRU0sV0FBV0EsQ0FBRUMsOEJBQThCLEVBQUVDLE9BQU8sRUFBRztJQUNyREMsTUFBTSxJQUFJWixXQUFXLENBQUNhLHFDQUFxQyxDQUFFSCw4QkFBOEIsRUFBRUgsc0JBQXVCLENBQUM7SUFFckhJLE9BQU8sR0FBR1osS0FBSyxDQUFFO01BRWY7TUFDQWUsV0FBVyxFQUFFO1FBQ1hDLElBQUksRUFBRVQscUJBQXFCLENBQUNVLFlBQVk7UUFDeENDLFFBQVEsRUFBRSxFQUFFLENBQUM7TUFDZixDQUFDOztNQUVEO01BQ0FDLG1CQUFtQixFQUFFO1FBQ25CQyxJQUFJLEVBQUUsSUFBSXJCLFVBQVUsQ0FBRSxFQUFFLEVBQUUsRUFBRztNQUMvQjtJQUVGLENBQUMsRUFBRWEsT0FBUSxDQUFDOztJQUVaOztJQUVBO0lBQ0EsTUFBTVMsZUFBZSxHQUFHLElBQUluQixVQUFVLENBQUU7TUFBRW9CLGVBQWUsRUFBRSxJQUFJO01BQUVDLGFBQWEsRUFBRTtJQUFNLENBQUUsQ0FBQzs7SUFFekY7SUFDQSxNQUFNQyxVQUFVLEdBQUdILGVBQWUsQ0FBQ0ksU0FBUyxDQUFFLElBQUl0QixJQUFJLENBQUVHLG1CQUFtQixDQUFDb0IsS0FBSyxFQUFFZCxPQUFPLENBQUNHLFdBQVksQ0FBRSxDQUFDO0lBQzFHLE1BQU1ZLFNBQVMsR0FBR04sZUFBZSxDQUFDSSxTQUFTLENBQUUsSUFBSXRCLElBQUksQ0FBRUcsbUJBQW1CLENBQUNzQixJQUFJLEVBQUVoQixPQUFPLENBQUNHLFdBQVksQ0FBRSxDQUFDOztJQUV4RztJQUNBLEtBQUssQ0FBRUosOEJBQThCLEVBQ25DSCxzQkFBc0IsQ0FBQ3FCLEtBQUssRUFBRUwsVUFBVSxFQUN4Q2hCLHNCQUFzQixDQUFDc0IsSUFBSSxFQUFFSCxTQUFTLEVBQ3RDZixPQUFRLENBQUM7RUFDYjtBQUNGO0FBRUFQLFlBQVksQ0FBQzBCLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRXRCLGlCQUFrQixDQUFDO0FBQy9ELGVBQWVBLGlCQUFpQiJ9