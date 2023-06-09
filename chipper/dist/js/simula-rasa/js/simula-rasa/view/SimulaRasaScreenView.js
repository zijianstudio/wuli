// Copyright 2014-2023, University of Colorado Boulder

/**
 * TODO Describe this class and its responsibilities.
 *
 * @author {{AUTHOR}}
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import SimulaRasaConstants from '../../common/SimulaRasaConstants.js';
import simulaRasa from '../../simulaRasa.js';
import optionize from '../../../../phet-core/js/optionize.js';
export default class SimulaRasaScreenView extends ScreenView {
  constructor(model, providedOptions) {
    const options = optionize()({

      //TODO add default values for optional SelfOptions here

      //TODO add default values for optional ScreenViewOptions here
    }, providedOptions);
    super(options);
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - SimulaRasaConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - SimulaRasaConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem('resetAllButton')
    });
    this.addChild(resetAllButton);
  }

  /**
   * Resets the view.
   */
  reset() {
    //TODO
  }

  /**
   * Steps the view.
   * @param dt - time step, in seconds
   */
  step(dt) {
    //TODO
  }
}
simulaRasa.register('SimulaRasaScreenView', SimulaRasaScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW5WaWV3IiwiUmVzZXRBbGxCdXR0b24iLCJTaW11bGFSYXNhQ29uc3RhbnRzIiwic2ltdWxhUmFzYSIsIm9wdGlvbml6ZSIsIlNpbXVsYVJhc2FTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJyZXNldEFsbEJ1dHRvbiIsImxpc3RlbmVyIiwiaW50ZXJydXB0U3VidHJlZUlucHV0IiwicmVzZXQiLCJyaWdodCIsImxheW91dEJvdW5kcyIsIm1heFgiLCJTQ1JFRU5fVklFV19YX01BUkdJTiIsImJvdHRvbSIsIm1heFkiLCJTQ1JFRU5fVklFV19ZX01BUkdJTiIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImFkZENoaWxkIiwic3RlcCIsImR0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTaW11bGFSYXNhU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUT0RPIERlc2NyaWJlIHRoaXMgY2xhc3MgYW5kIGl0cyByZXNwb25zaWJpbGl0aWVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIHt7QVVUSE9SfX1cclxuICovXHJcblxyXG5pbXBvcnQgU2NyZWVuVmlldywgeyBTY3JlZW5WaWV3T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xyXG5pbXBvcnQgU2ltdWxhUmFzYUNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vU2ltdWxhUmFzYUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBzaW11bGFSYXNhIGZyb20gJy4uLy4uL3NpbXVsYVJhc2EuanMnO1xyXG5pbXBvcnQgU2ltdWxhUmFzYU1vZGVsIGZyb20gJy4uL21vZGVsL1NpbXVsYVJhc2FNb2RlbC5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gLy9UT0RPIGFkZCBvcHRpb25zIHRoYXQgYXJlIHNwZWNpZmljIHRvIFNpbXVsYVJhc2FTY3JlZW5WaWV3IGhlcmVcclxufTtcclxuXHJcbnR5cGUgU2ltdWxhUmFzYVNjcmVlblZpZXdPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTY3JlZW5WaWV3T3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbXVsYVJhc2FTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IFNpbXVsYVJhc2FNb2RlbCwgcHJvdmlkZWRPcHRpb25zOiBTaW11bGFSYXNhU2NyZWVuVmlld09wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTaW11bGFSYXNhU2NyZWVuVmlld09wdGlvbnMsIFNlbGZPcHRpb25zLCBTY3JlZW5WaWV3T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy9UT0RPIGFkZCBkZWZhdWx0IHZhbHVlcyBmb3Igb3B0aW9uYWwgU2VsZk9wdGlvbnMgaGVyZVxyXG5cclxuICAgICAgLy9UT0RPIGFkZCBkZWZhdWx0IHZhbHVlcyBmb3Igb3B0aW9uYWwgU2NyZWVuVmlld09wdGlvbnMgaGVyZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7IC8vIGNhbmNlbCBpbnRlcmFjdGlvbnMgdGhhdCBtYXkgYmUgaW4gcHJvZ3Jlc3NcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgICAgfSxcclxuICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLm1heFggLSBTaW11bGFSYXNhQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1hfTUFSR0lOLFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSBTaW11bGFSYXNhQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1lfTUFSR0lOLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jlc2V0QWxsQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCByZXNldEFsbEJ1dHRvbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSB2aWV3LlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIC8vVE9ET1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcHMgdGhlIHZpZXcuXHJcbiAgICogQHBhcmFtIGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIHN0ZXAoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICAvL1RPRE9cclxuICB9XHJcbn1cclxuXHJcbnNpbXVsYVJhc2EucmVnaXN0ZXIoICdTaW11bGFSYXNhU2NyZWVuVmlldycsIFNpbXVsYVJhc2FTY3JlZW5WaWV3ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBNkIsb0NBQW9DO0FBQ2xGLE9BQU9DLGNBQWMsTUFBTSx1REFBdUQ7QUFDbEYsT0FBT0MsbUJBQW1CLE1BQU0scUNBQXFDO0FBQ3JFLE9BQU9DLFVBQVUsTUFBTSxxQkFBcUI7QUFFNUMsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQVE3RCxlQUFlLE1BQU1DLG9CQUFvQixTQUFTTCxVQUFVLENBQUM7RUFFcERNLFdBQVdBLENBQUVDLEtBQXNCLEVBQUVDLGVBQTRDLEVBQUc7SUFFekYsTUFBTUMsT0FBTyxHQUFHTCxTQUFTLENBQThELENBQUMsQ0FBRTs7TUFFeEY7O01BRUE7SUFBQSxDQUNELEVBQUVJLGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUFFQyxPQUFRLENBQUM7SUFFaEIsTUFBTUMsY0FBYyxHQUFHLElBQUlULGNBQWMsQ0FBRTtNQUN6Q1UsUUFBUSxFQUFFQSxDQUFBLEtBQU07UUFDZCxJQUFJLENBQUNDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlCTCxLQUFLLENBQUNNLEtBQUssQ0FBQyxDQUFDO1FBQ2IsSUFBSSxDQUFDQSxLQUFLLENBQUMsQ0FBQztNQUNkLENBQUM7TUFDREMsS0FBSyxFQUFFLElBQUksQ0FBQ0MsWUFBWSxDQUFDQyxJQUFJLEdBQUdkLG1CQUFtQixDQUFDZSxvQkFBb0I7TUFDeEVDLE1BQU0sRUFBRSxJQUFJLENBQUNILFlBQVksQ0FBQ0ksSUFBSSxHQUFHakIsbUJBQW1CLENBQUNrQixvQkFBb0I7TUFDekVDLE1BQU0sRUFBRVosT0FBTyxDQUFDWSxNQUFNLENBQUNDLFlBQVksQ0FBRSxnQkFBaUI7SUFDeEQsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDQyxRQUFRLENBQUViLGNBQWUsQ0FBQztFQUNqQzs7RUFFQTtBQUNGO0FBQ0E7RUFDU0csS0FBS0EsQ0FBQSxFQUFTO0lBQ25CO0VBQUE7O0VBR0Y7QUFDRjtBQUNBO0FBQ0E7RUFDa0JXLElBQUlBLENBQUVDLEVBQVUsRUFBUztJQUN2QztFQUFBO0FBRUo7QUFFQXRCLFVBQVUsQ0FBQ3VCLFFBQVEsQ0FBRSxzQkFBc0IsRUFBRXJCLG9CQUFxQixDQUFDIn0=