// Copyright 2019-2023, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */

import Multilink from '../../../../../axon/js/Multilink.js';
import ScreenView from '../../../../../joist/js/ScreenView.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../../scenery/js/imports.js';
import BooleanRectangularStickyToggleButton from '../../../../../sun/js/buttons/BooleanRectangularStickyToggleButton.js';
import ComboBox from '../../../../../sun/js/ComboBox.js';
import tappi from '../../../tappi.js';
import vibrationManager from '../../../vibrationManager.js';
import VibrationChart from '../../../view/VibrationChart.js';
import PatternsModel from '../model/PatternsModel.js';
import EffectsScene from './EffectsScene.js';
import PulseScene from './PulseScene.js';
import TunesScene from './TunesScene.js';

// constants
const LIST_ITEM_FONT = new PhetFont(30);
class PatternsScreenView extends ScreenView {
  /**
   * @param {TappiModel} model
   */
  constructor(model) {
    super();

    // different scenes demonstrate different applications
    const sceneCenterBottom = this.layoutBounds.centerBottom.minusXY(0, 15);
    const pulseScene = new PulseScene(model.activePatternProperty, {
      centerBottom: sceneCenterBottom
    });
    const effectsScene = new EffectsScene(model.activePatternProperty, {
      centerBottom: sceneCenterBottom
    });
    const tunesScene = new TunesScene(model.activePatternProperty, {
      centerBottom: sceneCenterBottom
    });
    const comboBoxItems = [{
      value: PatternsModel.PatternSet.PULSES,
      createNode: () => new Text('Pulses', {
        font: LIST_ITEM_FONT
      })
    }, {
      value: PatternsModel.PatternSet.EFFECTS,
      createNode: () => new Text('Effects', {
        font: LIST_ITEM_FONT
      })
    }, {
      value: PatternsModel.PatternSet.TUNES,
      createNode: () => new Text('Tunes', {
        font: LIST_ITEM_FONT
      })
    }];
    const comboBox = new ComboBox(model.activePatternSetProperty, comboBoxItems, this, {
      listPosition: 'above',
      highlightFill: 'rgb( 200, 200, 200 )',
      leftBottom: this.layoutBounds.leftBottom.plusXY(15, -15)
    });
    const limitPatternsButton = new BooleanRectangularStickyToggleButton(model.limitPatternsProperty, {
      content: new Text('Limit Time', {
        font: LIST_ITEM_FONT
      }),
      minWidth: comboBox.width,
      leftBottom: comboBox.leftTop.minusXY(0, 5)
    });

    // @private {VibrationChart}
    this.vibrationChart = new VibrationChart(vibrationManager.vibratingProperty, this.layoutBounds.width * 0.85, this.layoutBounds.height / 3, {
      centerTop: this.layoutBounds.centerTop
    });
    this.addChild(this.vibrationChart);
    this.addChild(pulseScene);
    this.addChild(effectsScene);
    this.addChild(tunesScene);
    this.addChild(limitPatternsButton);
    this.addChild(comboBox);

    // scene visibility changes with model Property
    model.activePatternSetProperty.link(activePattern => {
      pulseScene.visible = activePattern === PatternsModel.PatternSet.PULSES;
      effectsScene.visible = activePattern === PatternsModel.PatternSet.EFFECTS;
      tunesScene.visible = activePattern === PatternsModel.PatternSet.TUNES;
    });
    Multilink.multilink([model.activePatternProperty, model.limitPatternsProperty], (activePattern, limit) => {
      if (activePattern === null) {
        vibrationManager.stopVibrate();
      } else if (limit) {
        vibrationManager.startTimedVibrate(2000, activePattern);
      } else {
        vibrationManager.startVibrate(activePattern);
      }
    });
  }

  // @public
  step(dt) {
    this.vibrationChart.step(dt);
  }
}
tappi.register('PatternsScreenView', PatternsScreenView);
export default PatternsScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJTY3JlZW5WaWV3IiwiUGhldEZvbnQiLCJUZXh0IiwiQm9vbGVhblJlY3Rhbmd1bGFyU3RpY2t5VG9nZ2xlQnV0dG9uIiwiQ29tYm9Cb3giLCJ0YXBwaSIsInZpYnJhdGlvbk1hbmFnZXIiLCJWaWJyYXRpb25DaGFydCIsIlBhdHRlcm5zTW9kZWwiLCJFZmZlY3RzU2NlbmUiLCJQdWxzZVNjZW5lIiwiVHVuZXNTY2VuZSIsIkxJU1RfSVRFTV9GT05UIiwiUGF0dGVybnNTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInNjZW5lQ2VudGVyQm90dG9tIiwibGF5b3V0Qm91bmRzIiwiY2VudGVyQm90dG9tIiwibWludXNYWSIsInB1bHNlU2NlbmUiLCJhY3RpdmVQYXR0ZXJuUHJvcGVydHkiLCJlZmZlY3RzU2NlbmUiLCJ0dW5lc1NjZW5lIiwiY29tYm9Cb3hJdGVtcyIsInZhbHVlIiwiUGF0dGVyblNldCIsIlBVTFNFUyIsImNyZWF0ZU5vZGUiLCJmb250IiwiRUZGRUNUUyIsIlRVTkVTIiwiY29tYm9Cb3giLCJhY3RpdmVQYXR0ZXJuU2V0UHJvcGVydHkiLCJsaXN0UG9zaXRpb24iLCJoaWdobGlnaHRGaWxsIiwibGVmdEJvdHRvbSIsInBsdXNYWSIsImxpbWl0UGF0dGVybnNCdXR0b24iLCJsaW1pdFBhdHRlcm5zUHJvcGVydHkiLCJjb250ZW50IiwibWluV2lkdGgiLCJ3aWR0aCIsImxlZnRUb3AiLCJ2aWJyYXRpb25DaGFydCIsInZpYnJhdGluZ1Byb3BlcnR5IiwiaGVpZ2h0IiwiY2VudGVyVG9wIiwiYWRkQ2hpbGQiLCJsaW5rIiwiYWN0aXZlUGF0dGVybiIsInZpc2libGUiLCJtdWx0aWxpbmsiLCJsaW1pdCIsInN0b3BWaWJyYXRlIiwic3RhcnRUaW1lZFZpYnJhdGUiLCJzdGFydFZpYnJhdGUiLCJzdGVwIiwiZHQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBhdHRlcm5zU2NyZWVuVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQm9vbGVhblJlY3Rhbmd1bGFyU3RpY2t5VG9nZ2xlQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL0Jvb2xlYW5SZWN0YW5ndWxhclN0aWNreVRvZ2dsZUJ1dHRvbi5qcyc7XHJcbmltcG9ydCBDb21ib0JveCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvQ29tYm9Cb3guanMnO1xyXG5pbXBvcnQgdGFwcGkgZnJvbSAnLi4vLi4vLi4vdGFwcGkuanMnO1xyXG5pbXBvcnQgdmlicmF0aW9uTWFuYWdlciBmcm9tICcuLi8uLi8uLi92aWJyYXRpb25NYW5hZ2VyLmpzJztcclxuaW1wb3J0IFZpYnJhdGlvbkNoYXJ0IGZyb20gJy4uLy4uLy4uL3ZpZXcvVmlicmF0aW9uQ2hhcnQuanMnO1xyXG5pbXBvcnQgUGF0dGVybnNNb2RlbCBmcm9tICcuLi9tb2RlbC9QYXR0ZXJuc01vZGVsLmpzJztcclxuaW1wb3J0IEVmZmVjdHNTY2VuZSBmcm9tICcuL0VmZmVjdHNTY2VuZS5qcyc7XHJcbmltcG9ydCBQdWxzZVNjZW5lIGZyb20gJy4vUHVsc2VTY2VuZS5qcyc7XHJcbmltcG9ydCBUdW5lc1NjZW5lIGZyb20gJy4vVHVuZXNTY2VuZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTElTVF9JVEVNX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDMwICk7XHJcblxyXG5jbGFzcyBQYXR0ZXJuc1NjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtUYXBwaU1vZGVsfSBtb2RlbFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gZGlmZmVyZW50IHNjZW5lcyBkZW1vbnN0cmF0ZSBkaWZmZXJlbnQgYXBwbGljYXRpb25zXHJcbiAgICBjb25zdCBzY2VuZUNlbnRlckJvdHRvbSA9IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlckJvdHRvbS5taW51c1hZKCAwLCAxNSApO1xyXG4gICAgY29uc3QgcHVsc2VTY2VuZSA9IG5ldyBQdWxzZVNjZW5lKCBtb2RlbC5hY3RpdmVQYXR0ZXJuUHJvcGVydHksIHtcclxuICAgICAgY2VudGVyQm90dG9tOiBzY2VuZUNlbnRlckJvdHRvbVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgZWZmZWN0c1NjZW5lID0gbmV3IEVmZmVjdHNTY2VuZSggbW9kZWwuYWN0aXZlUGF0dGVyblByb3BlcnR5LCB7XHJcbiAgICAgIGNlbnRlckJvdHRvbTogc2NlbmVDZW50ZXJCb3R0b21cclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHR1bmVzU2NlbmUgPSBuZXcgVHVuZXNTY2VuZSggbW9kZWwuYWN0aXZlUGF0dGVyblByb3BlcnR5LCB7XHJcbiAgICAgIGNlbnRlckJvdHRvbTogc2NlbmVDZW50ZXJCb3R0b21cclxuICAgIH0gKTtcclxuXHJcblxyXG4gICAgY29uc3QgY29tYm9Cb3hJdGVtcyA9IFtcclxuICAgICAgeyB2YWx1ZTogUGF0dGVybnNNb2RlbC5QYXR0ZXJuU2V0LlBVTFNFUywgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoICdQdWxzZXMnLCB7IGZvbnQ6IExJU1RfSVRFTV9GT05UIH0gKSB9LFxyXG4gICAgICB7IHZhbHVlOiBQYXR0ZXJuc01vZGVsLlBhdHRlcm5TZXQuRUZGRUNUUywgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoICdFZmZlY3RzJywgeyBmb250OiBMSVNUX0lURU1fRk9OVCB9ICkgfSxcclxuICAgICAgeyB2YWx1ZTogUGF0dGVybnNNb2RlbC5QYXR0ZXJuU2V0LlRVTkVTLCBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggJ1R1bmVzJywgeyBmb250OiBMSVNUX0lURU1fRk9OVCB9ICkgfVxyXG4gICAgXTtcclxuICAgIGNvbnN0IGNvbWJvQm94ID0gbmV3IENvbWJvQm94KCBtb2RlbC5hY3RpdmVQYXR0ZXJuU2V0UHJvcGVydHksIGNvbWJvQm94SXRlbXMsIHRoaXMsIHtcclxuICAgICAgbGlzdFBvc2l0aW9uOiAnYWJvdmUnLFxyXG4gICAgICBoaWdobGlnaHRGaWxsOiAncmdiKCAyMDAsIDIwMCwgMjAwICknLFxyXG4gICAgICBsZWZ0Qm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5sZWZ0Qm90dG9tLnBsdXNYWSggMTUsIC0xNSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbGltaXRQYXR0ZXJuc0J1dHRvbiA9IG5ldyBCb29sZWFuUmVjdGFuZ3VsYXJTdGlja3lUb2dnbGVCdXR0b24oIG1vZGVsLmxpbWl0UGF0dGVybnNQcm9wZXJ0eSwge1xyXG4gICAgICBjb250ZW50OiBuZXcgVGV4dCggJ0xpbWl0IFRpbWUnLCB7IGZvbnQ6IExJU1RfSVRFTV9GT05UIH0gKSxcclxuICAgICAgbWluV2lkdGg6IGNvbWJvQm94LndpZHRoLFxyXG4gICAgICBsZWZ0Qm90dG9tOiBjb21ib0JveC5sZWZ0VG9wLm1pbnVzWFkoIDAsIDUgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtWaWJyYXRpb25DaGFydH1cclxuICAgIHRoaXMudmlicmF0aW9uQ2hhcnQgPSBuZXcgVmlicmF0aW9uQ2hhcnQoIHZpYnJhdGlvbk1hbmFnZXIudmlicmF0aW5nUHJvcGVydHksIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoICogMC44NSwgdGhpcy5sYXlvdXRCb3VuZHMuaGVpZ2h0IC8gMywge1xyXG4gICAgICBjZW50ZXJUb3A6IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclRvcFxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMudmlicmF0aW9uQ2hhcnQgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHB1bHNlU2NlbmUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGVmZmVjdHNTY2VuZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdHVuZXNTY2VuZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbGltaXRQYXR0ZXJuc0J1dHRvbiApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggY29tYm9Cb3ggKTtcclxuXHJcbiAgICAvLyBzY2VuZSB2aXNpYmlsaXR5IGNoYW5nZXMgd2l0aCBtb2RlbCBQcm9wZXJ0eVxyXG4gICAgbW9kZWwuYWN0aXZlUGF0dGVyblNldFByb3BlcnR5LmxpbmsoIGFjdGl2ZVBhdHRlcm4gPT4ge1xyXG4gICAgICBwdWxzZVNjZW5lLnZpc2libGUgPSBhY3RpdmVQYXR0ZXJuID09PSBQYXR0ZXJuc01vZGVsLlBhdHRlcm5TZXQuUFVMU0VTO1xyXG4gICAgICBlZmZlY3RzU2NlbmUudmlzaWJsZSA9IGFjdGl2ZVBhdHRlcm4gPT09IFBhdHRlcm5zTW9kZWwuUGF0dGVyblNldC5FRkZFQ1RTO1xyXG4gICAgICB0dW5lc1NjZW5lLnZpc2libGUgPSBhY3RpdmVQYXR0ZXJuID09PSBQYXR0ZXJuc01vZGVsLlBhdHRlcm5TZXQuVFVORVM7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBtb2RlbC5hY3RpdmVQYXR0ZXJuUHJvcGVydHksIG1vZGVsLmxpbWl0UGF0dGVybnNQcm9wZXJ0eSBdLCAoIGFjdGl2ZVBhdHRlcm4sIGxpbWl0ICkgPT4ge1xyXG4gICAgICBpZiAoIGFjdGl2ZVBhdHRlcm4gPT09IG51bGwgKSB7XHJcbiAgICAgICAgdmlicmF0aW9uTWFuYWdlci5zdG9wVmlicmF0ZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBsaW1pdCApIHtcclxuICAgICAgICB2aWJyYXRpb25NYW5hZ2VyLnN0YXJ0VGltZWRWaWJyYXRlKCAyMDAwLCBhY3RpdmVQYXR0ZXJuICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdmlicmF0aW9uTWFuYWdlci5zdGFydFZpYnJhdGUoIGFjdGl2ZVBhdHRlcm4gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy52aWJyYXRpb25DaGFydC5zdGVwKCBkdCApO1xyXG4gIH1cclxufVxyXG5cclxudGFwcGkucmVnaXN0ZXIoICdQYXR0ZXJuc1NjcmVlblZpZXcnLCBQYXR0ZXJuc1NjcmVlblZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgUGF0dGVybnNTY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxxQ0FBcUM7QUFDM0QsT0FBT0MsVUFBVSxNQUFNLHVDQUF1QztBQUM5RCxPQUFPQyxRQUFRLE1BQU0sNENBQTRDO0FBQ2pFLFNBQVNDLElBQUksUUFBUSxzQ0FBc0M7QUFDM0QsT0FBT0Msb0NBQW9DLE1BQU0sdUVBQXVFO0FBQ3hILE9BQU9DLFFBQVEsTUFBTSxtQ0FBbUM7QUFDeEQsT0FBT0MsS0FBSyxNQUFNLG1CQUFtQjtBQUNyQyxPQUFPQyxnQkFBZ0IsTUFBTSw4QkFBOEI7QUFDM0QsT0FBT0MsY0FBYyxNQUFNLGlDQUFpQztBQUM1RCxPQUFPQyxhQUFhLE1BQU0sMkJBQTJCO0FBQ3JELE9BQU9DLFlBQVksTUFBTSxtQkFBbUI7QUFDNUMsT0FBT0MsVUFBVSxNQUFN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