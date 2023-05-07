// Copyright 2023, University of Colorado Boulder

/**
 * A button that will send values representing the model to a parent frame for the "p5 serial connection"
 * prototype.
 *
 * See QuadrilateralSerialMessageSender for more information about this prototype and how it works.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import TextPushButton from '../../../../../sun/js/buttons/TextPushButton.js';
import QuadrilateralColors from '../../../QuadrilateralColors.js';
import QuadrilateralConstants from '../../../QuadrilateralConstants.js';
import quadrilateral from '../../../quadrilateral.js';
import QuadrilateralSerialMessageSender from './QuadrilateralSerialMessageSender.js';
export default class QuadrilateralSerialConnectionButton extends TextPushButton {
  constructor(tangibleConnectionModel) {
    const sender = new QuadrilateralSerialMessageSender(tangibleConnectionModel);
    super('Send Values', {
      textNodeOptions: QuadrilateralConstants.SCREEN_TEXT_OPTIONS,
      baseColor: QuadrilateralColors.screenViewButtonColorProperty
    });
    this.addListener(() => {
      sender.sendModelValuesString();
    });
  }
}
quadrilateral.register('QuadrilateralSerialConnectionButton', QuadrilateralSerialConnectionButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZXh0UHVzaEJ1dHRvbiIsIlF1YWRyaWxhdGVyYWxDb2xvcnMiLCJRdWFkcmlsYXRlcmFsQ29uc3RhbnRzIiwicXVhZHJpbGF0ZXJhbCIsIlF1YWRyaWxhdGVyYWxTZXJpYWxNZXNzYWdlU2VuZGVyIiwiUXVhZHJpbGF0ZXJhbFNlcmlhbENvbm5lY3Rpb25CdXR0b24iLCJjb25zdHJ1Y3RvciIsInRhbmdpYmxlQ29ubmVjdGlvbk1vZGVsIiwic2VuZGVyIiwidGV4dE5vZGVPcHRpb25zIiwiU0NSRUVOX1RFWFRfT1BUSU9OUyIsImJhc2VDb2xvciIsInNjcmVlblZpZXdCdXR0b25Db2xvclByb3BlcnR5IiwiYWRkTGlzdGVuZXIiLCJzZW5kTW9kZWxWYWx1ZXNTdHJpbmciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlF1YWRyaWxhdGVyYWxTZXJpYWxDb25uZWN0aW9uQnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIGJ1dHRvbiB0aGF0IHdpbGwgc2VuZCB2YWx1ZXMgcmVwcmVzZW50aW5nIHRoZSBtb2RlbCB0byBhIHBhcmVudCBmcmFtZSBmb3IgdGhlIFwicDUgc2VyaWFsIGNvbm5lY3Rpb25cIlxyXG4gKiBwcm90b3R5cGUuXHJcbiAqXHJcbiAqIFNlZSBRdWFkcmlsYXRlcmFsU2VyaWFsTWVzc2FnZVNlbmRlciBmb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIHByb3RvdHlwZSBhbmQgaG93IGl0IHdvcmtzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgVGV4dFB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvVGV4dFB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgUXVhZHJpbGF0ZXJhbENvbG9ycyBmcm9tICcuLi8uLi8uLi9RdWFkcmlsYXRlcmFsQ29sb3JzLmpzJztcclxuaW1wb3J0IFF1YWRyaWxhdGVyYWxDb25zdGFudHMgZnJvbSAnLi4vLi4vLi4vUXVhZHJpbGF0ZXJhbENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBxdWFkcmlsYXRlcmFsIGZyb20gJy4uLy4uLy4uL3F1YWRyaWxhdGVyYWwuanMnO1xyXG5pbXBvcnQgVGFuZ2libGVDb25uZWN0aW9uTW9kZWwgZnJvbSAnLi4vLi4vbW9kZWwvcHJvdG90eXBlL1RhbmdpYmxlQ29ubmVjdGlvbk1vZGVsLmpzJztcclxuaW1wb3J0IFF1YWRyaWxhdGVyYWxTZXJpYWxNZXNzYWdlU2VuZGVyIGZyb20gJy4vUXVhZHJpbGF0ZXJhbFNlcmlhbE1lc3NhZ2VTZW5kZXIuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUXVhZHJpbGF0ZXJhbFNlcmlhbENvbm5lY3Rpb25CdXR0b24gZXh0ZW5kcyBUZXh0UHVzaEJ1dHRvbiB7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0YW5naWJsZUNvbm5lY3Rpb25Nb2RlbDogVGFuZ2libGVDb25uZWN0aW9uTW9kZWwgKSB7XHJcblxyXG4gICAgY29uc3Qgc2VuZGVyID0gbmV3IFF1YWRyaWxhdGVyYWxTZXJpYWxNZXNzYWdlU2VuZGVyKCB0YW5naWJsZUNvbm5lY3Rpb25Nb2RlbCApO1xyXG5cclxuICAgIHN1cGVyKCAnU2VuZCBWYWx1ZXMnLCB7XHJcbiAgICAgIHRleHROb2RlT3B0aW9uczogUXVhZHJpbGF0ZXJhbENvbnN0YW50cy5TQ1JFRU5fVEVYVF9PUFRJT05TLFxyXG4gICAgICBiYXNlQ29sb3I6IFF1YWRyaWxhdGVyYWxDb2xvcnMuc2NyZWVuVmlld0J1dHRvbkNvbG9yUHJvcGVydHlcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHNlbmRlci5zZW5kTW9kZWxWYWx1ZXNTdHJpbmcoKTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbnF1YWRyaWxhdGVyYWwucmVnaXN0ZXIoICdRdWFkcmlsYXRlcmFsU2VyaWFsQ29ubmVjdGlvbkJ1dHRvbicsIFF1YWRyaWxhdGVyYWxTZXJpYWxDb25uZWN0aW9uQnV0dG9uICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0saURBQWlEO0FBQzVFLE9BQU9DLG1CQUFtQixNQUFNLGlDQUFpQztBQUNqRSxPQUFPQyxzQkFBc0IsTUFBTSxvQ0FBb0M7QUFDdkUsT0FBT0MsYUFBYSxNQUFNLDJCQUEyQjtBQUVyRCxPQUFPQyxnQ0FBZ0MsTUFBTSx1Q0FBdUM7QUFFcEYsZUFBZSxNQUFNQyxtQ0FBbUMsU0FBU0wsY0FBYyxDQUFDO0VBQ3ZFTSxXQUFXQSxDQUFFQyx1QkFBZ0QsRUFBRztJQUVyRSxNQUFNQyxNQUFNLEdBQUcsSUFBSUosZ0NBQWdDLENBQUVHLHVCQUF3QixDQUFDO0lBRTlFLEtBQUssQ0FBRSxhQUFhLEVBQUU7TUFDcEJFLGVBQWUsRUFBRVAsc0JBQXNCLENBQUNRLG1CQUFtQjtNQUMzREMsU0FBUyxFQUFFVixtQkFBbUIsQ0FBQ1c7SUFDakMsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDQyxXQUFXLENBQUUsTUFBTTtNQUN0QkwsTUFBTSxDQUFDTSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ2hDLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQVgsYUFBYSxDQUFDWSxRQUFRLENBQUUscUNBQXFDLEVBQUVWLG1DQUFvQyxDQUFDIn0=