// Copyright 2014-2022, University of Colorado Boulder

/**
 * Demonstrates UI components that typically appear in a game level that has an infinite number of challenges.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { HBox, Text } from '../../../scenery/js/imports.js';
import HSlider from '../../../sun/js/HSlider.js';
import InfiniteStatusBar from '../InfiniteStatusBar.js';
import StatusBar from '../../../scenery-phet/js/StatusBar.js';
import vegas from '../vegas.js';
import Tandem from '../../../tandem/js/Tandem.js';
import RewardDialog from '../RewardDialog.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
export default class InfiniteChallengesScreenView extends ScreenView {
  constructor() {
    super({
      tandem: Tandem.OPT_OUT
    });
    const scoreProperty = new NumberProperty(0, {
      range: new Range(0, 1000)
    });

    // bar across the top
    const messageNode = new Text('Your message goes here', {
      font: StatusBar.DEFAULT_FONT
    });
    const statusBar = new InfiniteStatusBar(this.layoutBounds, this.visibleBoundsProperty, messageNode, scoreProperty, {
      backButtonListener: () => console.log('back'),
      tandem: Tandem.OPT_OUT
    });

    // slider for testing score changes
    const scoreSlider = new HBox({
      right: this.layoutBounds.right - 20,
      top: statusBar.bottom + 30,
      children: [new Text('Score: ', {
        font: new PhetFont(20)
      }), new HSlider(scoreProperty, scoreProperty.range)]
    });
    const openButton = new RectangularPushButton({
      content: new Text('open RewardDialog', {
        font: new PhetFont(20)
      }),
      listener: function () {
        const rewardDialog = new RewardDialog(10, {
          keepGoingButtonListener: () => {
            console.log('Keep Going button');
            rewardDialog.dispose();
          },
          newLevelButtonListener: () => {
            console.log('New Level button');
            rewardDialog.dispose();
          }
        });
        rewardDialog.show();
      },
      center: this.layoutBounds.center
    });
    this.children = [statusBar, scoreSlider, openButton];
  }
}
vegas.register('InfiniteChallengesScreenView', InfiniteChallengesScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIlNjcmVlblZpZXciLCJQaGV0Rm9udCIsIkhCb3giLCJUZXh0IiwiSFNsaWRlciIsIkluZmluaXRlU3RhdHVzQmFyIiwiU3RhdHVzQmFyIiwidmVnYXMiLCJUYW5kZW0iLCJSZXdhcmREaWFsb2ciLCJSZWN0YW5ndWxhclB1c2hCdXR0b24iLCJOdW1iZXJQcm9wZXJ0eSIsIkluZmluaXRlQ2hhbGxlbmdlc1NjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsIk9QVF9PVVQiLCJzY29yZVByb3BlcnR5IiwicmFuZ2UiLCJtZXNzYWdlTm9kZSIsImZvbnQiLCJERUZBVUxUX0ZPTlQiLCJzdGF0dXNCYXIiLCJsYXlvdXRCb3VuZHMiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJiYWNrQnV0dG9uTGlzdGVuZXIiLCJjb25zb2xlIiwibG9nIiwic2NvcmVTbGlkZXIiLCJyaWdodCIsInRvcCIsImJvdHRvbSIsImNoaWxkcmVuIiwib3BlbkJ1dHRvbiIsImNvbnRlbnQiLCJsaXN0ZW5lciIsInJld2FyZERpYWxvZyIsImtlZXBHb2luZ0J1dHRvbkxpc3RlbmVyIiwiZGlzcG9zZSIsIm5ld0xldmVsQnV0dG9uTGlzdGVuZXIiLCJzaG93IiwiY2VudGVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbmZpbml0ZUNoYWxsZW5nZXNTY3JlZW5WaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERlbW9uc3RyYXRlcyBVSSBjb21wb25lbnRzIHRoYXQgdHlwaWNhbGx5IGFwcGVhciBpbiBhIGdhbWUgbGV2ZWwgdGhhdCBoYXMgYW4gaW5maW5pdGUgbnVtYmVyIG9mIGNoYWxsZW5nZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgSEJveCwgVGV4dCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBIU2xpZGVyIGZyb20gJy4uLy4uLy4uL3N1bi9qcy9IU2xpZGVyLmpzJztcclxuaW1wb3J0IEluZmluaXRlU3RhdHVzQmFyIGZyb20gJy4uL0luZmluaXRlU3RhdHVzQmFyLmpzJztcclxuaW1wb3J0IFN0YXR1c0JhciBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU3RhdHVzQmFyLmpzJztcclxuaW1wb3J0IHZlZ2FzIGZyb20gJy4uL3ZlZ2FzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IFJld2FyZERpYWxvZyBmcm9tICcuLi9SZXdhcmREaWFsb2cuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluZmluaXRlQ2hhbGxlbmdlc1NjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBzY29yZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDEwMDAgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGJhciBhY3Jvc3MgdGhlIHRvcFxyXG4gICAgY29uc3QgbWVzc2FnZU5vZGUgPSBuZXcgVGV4dCggJ1lvdXIgbWVzc2FnZSBnb2VzIGhlcmUnLCB7XHJcbiAgICAgIGZvbnQ6IFN0YXR1c0Jhci5ERUZBVUxUX0ZPTlRcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHN0YXR1c0JhciA9IG5ldyBJbmZpbml0ZVN0YXR1c0JhciggdGhpcy5sYXlvdXRCb3VuZHMsIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LCBtZXNzYWdlTm9kZSwgc2NvcmVQcm9wZXJ0eSwge1xyXG4gICAgICBiYWNrQnV0dG9uTGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnYmFjaycgKSxcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHNsaWRlciBmb3IgdGVzdGluZyBzY29yZSBjaGFuZ2VzXHJcbiAgICBjb25zdCBzY29yZVNsaWRlciA9IG5ldyBIQm94KCB7XHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5yaWdodCAtIDIwLFxyXG4gICAgICB0b3A6IHN0YXR1c0Jhci5ib3R0b20gKyAzMCxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgVGV4dCggJ1Njb3JlOiAnLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMjAgKSB9ICksXHJcbiAgICAgICAgbmV3IEhTbGlkZXIoIHNjb3JlUHJvcGVydHksIHNjb3JlUHJvcGVydHkucmFuZ2UgKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgb3BlbkJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgICAgY29udGVudDogbmV3IFRleHQoICdvcGVuIFJld2FyZERpYWxvZycsIHsgZm9udDogbmV3IFBoZXRGb250KCAyMCApIH0gKSxcclxuICAgICAgbGlzdGVuZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNvbnN0IHJld2FyZERpYWxvZyA9IG5ldyBSZXdhcmREaWFsb2coIDEwLCB7XHJcbiAgICAgICAgICBrZWVwR29pbmdCdXR0b25MaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyggJ0tlZXAgR29pbmcgYnV0dG9uJyApO1xyXG4gICAgICAgICAgICByZXdhcmREaWFsb2cuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG5ld0xldmVsQnV0dG9uTGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coICdOZXcgTGV2ZWwgYnV0dG9uJyApO1xyXG4gICAgICAgICAgICByZXdhcmREaWFsb2cuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICByZXdhcmREaWFsb2cuc2hvdygpO1xyXG4gICAgICB9LFxyXG4gICAgICBjZW50ZXI6IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY2hpbGRyZW4gPSBbXHJcbiAgICAgIHN0YXR1c0JhcixcclxuICAgICAgc2NvcmVTbGlkZXIsXHJcbiAgICAgIG9wZW5CdXR0b25cclxuICAgIF07XHJcbiAgfVxyXG59XHJcblxyXG52ZWdhcy5yZWdpc3RlciggJ0luZmluaXRlQ2hhbGxlbmdlc1NjcmVlblZpZXcnLCBJbmZpbml0ZUNoYWxsZW5nZXNTY3JlZW5WaWV3ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxPQUFPQyxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELFNBQVNDLElBQUksRUFBRUMsSUFBSSxR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