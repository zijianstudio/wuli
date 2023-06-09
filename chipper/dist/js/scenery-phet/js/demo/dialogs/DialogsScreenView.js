// Copyright 2018-2022, University of Colorado Boulder

/**
 * Demonstration of scenery-phet dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import { Image, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Dialog from '../../../../sun/js/Dialog.js';
import batteryDCell_png from '../../../images/batteryDCell_png.js';
import CanvasWarningNode from '../../CanvasWarningNode.js';
import ContextLossFailureDialog from '../../ContextLossFailureDialog.js';
import OopsDialog from '../../OopsDialog.js';
import PhetFont from '../../PhetFont.js';
import sceneryPhet from '../../sceneryPhet.js';

// constants
const TEXT_OPTIONS = {
  font: new PhetFont(20)
};
export default class DialogsScreenView extends ScreenView {
  constructor(providedOptions) {
    super(providedOptions);

    // Context Loss Failure
    let contextLossFailureDialog = null;
    const contextLossFailureButton = new RectangularPushButton({
      content: new Text('Context Loss Failure', TEXT_OPTIONS),
      listener: () => {
        if (!contextLossFailureDialog) {
          contextLossFailureDialog = new ContextLossFailureDialog({
            // So that we don't cause problems with automated testing.
            // See https://github.com/phetsims/scenery-phet/issues/375
            reload: function () {
              console.log('Reload');
            }
          });
        }
        contextLossFailureDialog.show();
      }
    });

    // Canvas Warning
    let canvasWarningDialog = null;
    const canvasWarningButton = new RectangularPushButton({
      content: new Text('Canvas Warning', TEXT_OPTIONS),
      listener: () => {
        if (!canvasWarningDialog) {
          canvasWarningDialog = new Dialog(new CanvasWarningNode());
        }
        canvasWarningDialog.show();
      }
    });

    // Oops!
    let oopsDialog = null;
    const oopsButton = new RectangularPushButton({
      content: new Text('OopsDialog', TEXT_OPTIONS),
      listener: () => {
        if (!oopsDialog) {
          oopsDialog = new OopsDialog('Oops!<br><br>Your battery appears to be dead.', {
            iconNode: new Image(batteryDCell_png, {
              rotation: -Math.PI / 2
            })
          });
        }
        oopsDialog.show();
      }
    });
    this.addChild(new VBox({
      children: [contextLossFailureButton, canvasWarningButton, oopsButton],
      spacing: 20,
      center: this.layoutBounds.center
    }));
  }
}
sceneryPhet.register('DialogsScreenView', DialogsScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW5WaWV3IiwiSW1hZ2UiLCJUZXh0IiwiVkJveCIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIkRpYWxvZyIsImJhdHRlcnlEQ2VsbF9wbmciLCJDYW52YXNXYXJuaW5nTm9kZSIsIkNvbnRleHRMb3NzRmFpbHVyZURpYWxvZyIsIk9vcHNEaWFsb2ciLCJQaGV0Rm9udCIsInNjZW5lcnlQaGV0IiwiVEVYVF9PUFRJT05TIiwiZm9udCIsIkRpYWxvZ3NTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJjb250ZXh0TG9zc0ZhaWx1cmVEaWFsb2ciLCJjb250ZXh0TG9zc0ZhaWx1cmVCdXR0b24iLCJjb250ZW50IiwibGlzdGVuZXIiLCJyZWxvYWQiLCJjb25zb2xlIiwibG9nIiwic2hvdyIsImNhbnZhc1dhcm5pbmdEaWFsb2ciLCJjYW52YXNXYXJuaW5nQnV0dG9uIiwib29wc0RpYWxvZyIsIm9vcHNCdXR0b24iLCJpY29uTm9kZSIsInJvdGF0aW9uIiwiTWF0aCIsIlBJIiwiYWRkQ2hpbGQiLCJjaGlsZHJlbiIsInNwYWNpbmciLCJjZW50ZXIiLCJsYXlvdXRCb3VuZHMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkRpYWxvZ3NTY3JlZW5WaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERlbW9uc3RyYXRpb24gb2Ygc2NlbmVyeS1waGV0IGRpYWxvZ3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFNjcmVlblZpZXcsIHsgU2NyZWVuVmlld09wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgeyBJbWFnZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IERpYWxvZyBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvRGlhbG9nLmpzJztcclxuaW1wb3J0IGJhdHRlcnlEQ2VsbF9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2JhdHRlcnlEQ2VsbF9wbmcuanMnO1xyXG5pbXBvcnQgQ2FudmFzV2FybmluZ05vZGUgZnJvbSAnLi4vLi4vQ2FudmFzV2FybmluZ05vZGUuanMnO1xyXG5pbXBvcnQgQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nIGZyb20gJy4uLy4uL0NvbnRleHRMb3NzRmFpbHVyZURpYWxvZy5qcyc7XHJcbmltcG9ydCBPb3BzRGlhbG9nIGZyb20gJy4uLy4uL09vcHNEaWFsb2cuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vLi4vc2NlbmVyeVBoZXQuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRFWFRfT1BUSU9OUyA9IHtcclxuICBmb250OiBuZXcgUGhldEZvbnQoIDIwIClcclxufTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG50eXBlIERpYWxvZ3NTY3JlZW5WaWV3T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPFNjcmVlblZpZXdPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaWFsb2dzU2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBEaWFsb2dzU2NyZWVuVmlld09wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENvbnRleHQgTG9zcyBGYWlsdXJlXHJcbiAgICBsZXQgY29udGV4dExvc3NGYWlsdXJlRGlhbG9nOiBEaWFsb2cgfCBudWxsID0gbnVsbDtcclxuICAgIGNvbnN0IGNvbnRleHRMb3NzRmFpbHVyZUJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgICAgY29udGVudDogbmV3IFRleHQoICdDb250ZXh0IExvc3MgRmFpbHVyZScsIFRFWFRfT1BUSU9OUyApLFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIGlmICggIWNvbnRleHRMb3NzRmFpbHVyZURpYWxvZyApIHtcclxuICAgICAgICAgIGNvbnRleHRMb3NzRmFpbHVyZURpYWxvZyA9IG5ldyBDb250ZXh0TG9zc0ZhaWx1cmVEaWFsb2coIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFNvIHRoYXQgd2UgZG9uJ3QgY2F1c2UgcHJvYmxlbXMgd2l0aCBhdXRvbWF0ZWQgdGVzdGluZy5cclxuICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzM3NVxyXG4gICAgICAgICAgICByZWxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnUmVsb2FkJyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnRleHRMb3NzRmFpbHVyZURpYWxvZy5zaG93KCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDYW52YXMgV2FybmluZ1xyXG4gICAgbGV0IGNhbnZhc1dhcm5pbmdEaWFsb2c6IERpYWxvZyB8IG51bGwgPSBudWxsO1xyXG4gICAgY29uc3QgY2FudmFzV2FybmluZ0J1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgICAgY29udGVudDogbmV3IFRleHQoICdDYW52YXMgV2FybmluZycsIFRFWFRfT1BUSU9OUyApLFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIGlmICggIWNhbnZhc1dhcm5pbmdEaWFsb2cgKSB7XHJcbiAgICAgICAgICBjYW52YXNXYXJuaW5nRGlhbG9nID0gbmV3IERpYWxvZyggbmV3IENhbnZhc1dhcm5pbmdOb2RlKCkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FudmFzV2FybmluZ0RpYWxvZy5zaG93KCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBPb3BzIVxyXG4gICAgbGV0IG9vcHNEaWFsb2c6IERpYWxvZyB8IG51bGwgPSBudWxsO1xyXG4gICAgY29uc3Qgb29wc0J1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgICAgY29udGVudDogbmV3IFRleHQoICdPb3BzRGlhbG9nJywgVEVYVF9PUFRJT05TICksXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCAhb29wc0RpYWxvZyApIHtcclxuICAgICAgICAgIG9vcHNEaWFsb2cgPSBuZXcgT29wc0RpYWxvZyggJ09vcHMhPGJyPjxicj5Zb3VyIGJhdHRlcnkgYXBwZWFycyB0byBiZSBkZWFkLicsIHtcclxuICAgICAgICAgICAgaWNvbk5vZGU6IG5ldyBJbWFnZSggYmF0dGVyeURDZWxsX3BuZywgeyByb3RhdGlvbjogLU1hdGguUEkgLyAyIH0gKVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvb3BzRGlhbG9nLnNob3coKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgY29udGV4dExvc3NGYWlsdXJlQnV0dG9uLFxyXG4gICAgICAgIGNhbnZhc1dhcm5pbmdCdXR0b24sXHJcbiAgICAgICAgb29wc0J1dHRvblxyXG4gICAgICBdLFxyXG4gICAgICBzcGFjaW5nOiAyMCxcclxuICAgICAgY2VudGVyOiB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJcclxuICAgIH0gKSApO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdEaWFsb2dzU2NyZWVuVmlldycsIERpYWxvZ3NTY3JlZW5WaWV3ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBNkIsb0NBQW9DO0FBR2xGLFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3JFLE9BQU9DLHFCQUFxQixNQUFNLHFEQUFxRDtBQUN2RixPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLGdCQUFnQixNQUFNLHFDQUFxQztBQUNsRSxPQUFPQyxpQkFBaUIsTUFBTSw0QkFBNEI7QUFDMUQsT0FBT0Msd0JBQXdCLE1BQU0sbUNBQW1DO0FBQ3hFLE9BQU9DLFVBQVUsTUFBTSxxQkFBcUI7QUFDNUMsT0FBT0MsUUFBUSxNQUFNLG1CQUFtQjtBQUN4QyxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCOztBQUU5QztBQUNBLE1BQU1DLFlBQVksR0FBRztFQUNuQkMsSUFBSSxFQUFFLElBQUlILFFBQVEsQ0FBRSxFQUFHO0FBQ3pCLENBQUM7QUFLRCxlQUFlLE1BQU1JLGlCQUFpQixTQUFTZCxVQUFVLENBQUM7RUFDakRlLFdBQVdBLENBQUVDLGVBQXlDLEVBQUc7SUFFOUQsS0FBSyxDQUFFQSxlQUFnQixDQUFDOztJQUV4QjtJQUNBLElBQUlDLHdCQUF1QyxHQUFHLElBQUk7SUFDbEQsTUFBTUMsd0JBQXdCLEdBQUcsSUFBSWQscUJBQXFCLENBQUU7TUFDMURlLE9BQU8sRUFBRSxJQUFJakIsSUFBSSxDQUFFLHNCQUFzQixFQUFFVSxZQUFhLENBQUM7TUFDekRRLFFBQVEsRUFBRUEsQ0FBQSxLQUFNO1FBQ2QsSUFBSyxDQUFDSCx3QkFBd0IsRUFBRztVQUMvQkEsd0JBQXdCLEdBQUcsSUFBSVQsd0JBQXdCLENBQUU7WUFFdkQ7WUFDQTtZQUNBYSxNQUFNLEVBQUUsU0FBQUEsQ0FBQSxFQUFXO2NBQ2pCQyxPQUFPLENBQUNDLEdBQUcsQ0FBRSxRQUFTLENBQUM7WUFDekI7VUFDRixDQUFFLENBQUM7UUFDTDtRQUNBTix3QkFBd0IsQ0FBQ08sSUFBSSxDQUFDLENBQUM7TUFDakM7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJQyxtQkFBa0MsR0FBRyxJQUFJO0lBQzdDLE1BQU1DLG1CQUFtQixHQUFHLElBQUl0QixxQkFBcUIsQ0FBRTtNQUNyRGUsT0FBTyxFQUFFLElBQUlqQixJQUFJLENBQUUsZ0JBQWdCLEVBQUVVLFlBQWEsQ0FBQztNQUNuRFEsUUFBUSxFQUFFQSxDQUFBLEtBQU07UUFDZCxJQUFLLENBQUNLLG1CQUFtQixFQUFHO1VBQzFCQSxtQkFBbUIsR0FBRyxJQUFJcEIsTUFBTSxDQUFFLElBQUlFLGlCQUFpQixDQUFDLENBQUUsQ0FBQztRQUM3RDtRQUNBa0IsbUJBQW1CLENBQUNELElBQUksQ0FBQyxDQUFDO01BQzVCO0lBQ0YsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSUcsVUFBeUIsR0FBRyxJQUFJO0lBQ3BDLE1BQU1DLFVBQVUsR0FBRyxJQUFJeEIscUJBQXFCLENBQUU7TUFDNUNlLE9BQU8sRUFBRSxJQUFJakIsSUFBSSxDQUFFLFlBQVksRUFBRVUsWUFBYSxDQUFDO01BQy9DUSxRQUFRLEVBQUVBLENBQUEsS0FBTTtRQUNkLElBQUssQ0FBQ08sVUFBVSxFQUFHO1VBQ2pCQSxVQUFVLEdBQUcsSUFBSWxCLFVBQVUsQ0FBRSwrQ0FBK0MsRUFBRTtZQUM1RW9CLFFBQVEsRUFBRSxJQUFJNUIsS0FBSyxDQUFFSyxnQkFBZ0IsRUFBRTtjQUFFd0IsUUFBUSxFQUFFLENBQUNDLElBQUksQ0FBQ0MsRUFBRSxHQUFHO1lBQUUsQ0FBRTtVQUNwRSxDQUFFLENBQUM7UUFDTDtRQUNBTCxVQUFVLENBQUNILElBQUksQ0FBQyxDQUFDO01BQ25CO0lBQ0YsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDUyxRQUFRLENBQUUsSUFBSTlCLElBQUksQ0FBRTtNQUN2QitCLFFBQVEsRUFBRSxDQUNSaEIsd0JBQXdCLEVBQ3hCUSxtQkFBbUIsRUFDbkJFLFVBQVUsQ0FDWDtNQUNETyxPQUFPLEVBQUUsRUFBRTtNQUNYQyxNQUFNLEVBQUUsSUFBSSxDQUFDQyxZQUFZLENBQUNEO0lBQzVCLENBQUUsQ0FBRSxDQUFDO0VBQ1A7QUFDRjtBQUVBekIsV0FBVyxDQUFDMkIsUUFBUSxDQUFFLG1CQUFtQixFQUFFeEIsaUJBQWtCLENBQUMifQ==