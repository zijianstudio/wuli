// Copyright 2016-2023, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * One scene focuses on one black box, and has a separate model + view because scenes are independent.
 * TODO: Combine this class with BlackBoxSceneView.  It will simplify usage in BlackBoxScreenView.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import { RichText } from '../../../../scenery/js/imports.js';
import circuitConstructionKitBlackBoxStudy from '../../circuitConstructionKitBlackBoxStudy.js';
import BlackBoxSceneView from './BlackBoxSceneView.js';
class WarmUpSceneView extends BlackBoxSceneView {
  /**
   * @param {number} blackBoxWidth
   * @param {number} blackBoxHeight
   * @param {BlackBoxSceneModel} blackBoxSceneModel
   * @param {Property.<string>} sceneProperty - for switching screens
   */
  constructor(blackBoxWidth, blackBoxHeight, blackBoxSceneModel, sceneProperty, tandem) {
    super(blackBoxWidth, blackBoxHeight, blackBoxSceneModel, sceneProperty, tandem);
    const textOptions = {
      fontSize: 34
    };

    // TODO: i18n
    const questionText = new RichText('What circuit is<br>in the black box?', merge({
      align: 'center',
      centerX: ScreenView.DEFAULT_LAYOUT_BOUNDS.width / 2,
      top: ScreenView.DEFAULT_LAYOUT_BOUNDS.height / 6
    }, textOptions));
    Multilink.multilink([blackBoxSceneModel.modeProperty, blackBoxSceneModel.revealingProperty], (mode, revealing) => {
      questionText.visible = !revealing && mode === 'explore';
    });

    // TODO: i18n
    const tryToText = new RichText('Build a circuit that<n>behaves the same way.', merge({
      align: 'center',
      centerX: ScreenView.DEFAULT_LAYOUT_BOUNDS.width / 2,
      top: ScreenView.DEFAULT_LAYOUT_BOUNDS.height / 6
    }, textOptions));
    blackBoxSceneModel.modeProperty.link(mode => {
      tryToText.visible = mode === 'test';
    });
    this.addChild(questionText);
    this.addChild(tryToText);

    // Let the circuit elements move in front of the text
    tryToText.moveToBack();
    questionText.moveToBack();
  }
}
circuitConstructionKitBlackBoxStudy.register('WarmUpSceneView', WarmUpSceneView);
export default WarmUpSceneView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJTY3JlZW5WaWV3IiwibWVyZ2UiLCJSaWNoVGV4dCIsImNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRCbGFja0JveFN0dWR5IiwiQmxhY2tCb3hTY2VuZVZpZXciLCJXYXJtVXBTY2VuZVZpZXciLCJjb25zdHJ1Y3RvciIsImJsYWNrQm94V2lkdGgiLCJibGFja0JveEhlaWdodCIsImJsYWNrQm94U2NlbmVNb2RlbCIsInNjZW5lUHJvcGVydHkiLCJ0YW5kZW0iLCJ0ZXh0T3B0aW9ucyIsImZvbnRTaXplIiwicXVlc3Rpb25UZXh0IiwiYWxpZ24iLCJjZW50ZXJYIiwiREVGQVVMVF9MQVlPVVRfQk9VTkRTIiwid2lkdGgiLCJ0b3AiLCJoZWlnaHQiLCJtdWx0aWxpbmsiLCJtb2RlUHJvcGVydHkiLCJyZXZlYWxpbmdQcm9wZXJ0eSIsIm1vZGUiLCJyZXZlYWxpbmciLCJ2aXNpYmxlIiwidHJ5VG9UZXh0IiwibGluayIsImFkZENoaWxkIiwibW92ZVRvQmFjayIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2FybVVwU2NlbmVWaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vLyBUT0RPOiBSZXZpZXcsIGRvY3VtZW50LCBhbm5vdGF0ZSwgaTE4biwgYnJpbmcgdXAgdG8gc3RhbmRhcmRzXHJcblxyXG4vKipcclxuICogT25lIHNjZW5lIGZvY3VzZXMgb24gb25lIGJsYWNrIGJveCwgYW5kIGhhcyBhIHNlcGFyYXRlIG1vZGVsICsgdmlldyBiZWNhdXNlIHNjZW5lcyBhcmUgaW5kZXBlbmRlbnQuXHJcbiAqIFRPRE86IENvbWJpbmUgdGhpcyBjbGFzcyB3aXRoIEJsYWNrQm94U2NlbmVWaWV3LiAgSXQgd2lsbCBzaW1wbGlmeSB1c2FnZSBpbiBCbGFja0JveFNjcmVlblZpZXcuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgUmljaFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY2lyY3VpdENvbnN0cnVjdGlvbktpdEJsYWNrQm94U3R1ZHkgZnJvbSAnLi4vLi4vY2lyY3VpdENvbnN0cnVjdGlvbktpdEJsYWNrQm94U3R1ZHkuanMnO1xyXG5pbXBvcnQgQmxhY2tCb3hTY2VuZVZpZXcgZnJvbSAnLi9CbGFja0JveFNjZW5lVmlldy5qcyc7XHJcblxyXG5jbGFzcyBXYXJtVXBTY2VuZVZpZXcgZXh0ZW5kcyBCbGFja0JveFNjZW5lVmlldyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBibGFja0JveFdpZHRoXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJsYWNrQm94SGVpZ2h0XHJcbiAgICogQHBhcmFtIHtCbGFja0JveFNjZW5lTW9kZWx9IGJsYWNrQm94U2NlbmVNb2RlbFxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPHN0cmluZz59IHNjZW5lUHJvcGVydHkgLSBmb3Igc3dpdGNoaW5nIHNjcmVlbnNcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggYmxhY2tCb3hXaWR0aCwgYmxhY2tCb3hIZWlnaHQsIGJsYWNrQm94U2NlbmVNb2RlbCwgc2NlbmVQcm9wZXJ0eSwgdGFuZGVtICkge1xyXG4gICAgc3VwZXIoIGJsYWNrQm94V2lkdGgsIGJsYWNrQm94SGVpZ2h0LCBibGFja0JveFNjZW5lTW9kZWwsIHNjZW5lUHJvcGVydHksIHRhbmRlbSApO1xyXG4gICAgY29uc3QgdGV4dE9wdGlvbnMgPSB7XHJcbiAgICAgIGZvbnRTaXplOiAzNFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBUT0RPOiBpMThuXHJcbiAgICBjb25zdCBxdWVzdGlvblRleHQgPSBuZXcgUmljaFRleHQoICdXaGF0IGNpcmN1aXQgaXM8YnI+aW4gdGhlIGJsYWNrIGJveD8nLCBtZXJnZSgge1xyXG4gICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgIGNlbnRlclg6IFNjcmVlblZpZXcuREVGQVVMVF9MQVlPVVRfQk9VTkRTLndpZHRoIC8gMixcclxuICAgICAgdG9wOiBTY3JlZW5WaWV3LkRFRkFVTFRfTEFZT1VUX0JPVU5EUy5oZWlnaHQgLyA2XHJcbiAgICB9LCB0ZXh0T3B0aW9ucyApICk7XHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIGJsYWNrQm94U2NlbmVNb2RlbC5tb2RlUHJvcGVydHksIGJsYWNrQm94U2NlbmVNb2RlbC5yZXZlYWxpbmdQcm9wZXJ0eSBdLCAoIG1vZGUsIHJldmVhbGluZyApID0+IHtcclxuICAgICAgcXVlc3Rpb25UZXh0LnZpc2libGUgPSAhcmV2ZWFsaW5nICYmIG1vZGUgPT09ICdleHBsb3JlJztcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBUT0RPOiBpMThuXHJcbiAgICBjb25zdCB0cnlUb1RleHQgPSBuZXcgUmljaFRleHQoICdCdWlsZCBhIGNpcmN1aXQgdGhhdDxuPmJlaGF2ZXMgdGhlIHNhbWUgd2F5LicsIG1lcmdlKCB7XHJcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgY2VudGVyWDogU2NyZWVuVmlldy5ERUZBVUxUX0xBWU9VVF9CT1VORFMud2lkdGggLyAyLFxyXG4gICAgICB0b3A6IFNjcmVlblZpZXcuREVGQVVMVF9MQVlPVVRfQk9VTkRTLmhlaWdodCAvIDZcclxuICAgIH0sIHRleHRPcHRpb25zICkgKTtcclxuICAgIGJsYWNrQm94U2NlbmVNb2RlbC5tb2RlUHJvcGVydHkubGluayggbW9kZSA9PiB7XHJcbiAgICAgIHRyeVRvVGV4dC52aXNpYmxlID0gbW9kZSA9PT0gJ3Rlc3QnO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHF1ZXN0aW9uVGV4dCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdHJ5VG9UZXh0ICk7XHJcblxyXG4gICAgLy8gTGV0IHRoZSBjaXJjdWl0IGVsZW1lbnRzIG1vdmUgaW4gZnJvbnQgb2YgdGhlIHRleHRcclxuICAgIHRyeVRvVGV4dC5tb3ZlVG9CYWNrKCk7XHJcbiAgICBxdWVzdGlvblRleHQubW92ZVRvQmFjaygpO1xyXG4gIH1cclxufVxyXG5cclxuY2lyY3VpdENvbnN0cnVjdGlvbktpdEJsYWNrQm94U3R1ZHkucmVnaXN0ZXIoICdXYXJtVXBTY2VuZVZpZXcnLCBXYXJtVXBTY2VuZVZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgV2FybVVwU2NlbmVWaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsU0FBU0MsUUFBUSxRQUFRLG1DQUFtQztBQUM1RCxPQUFPQyxtQ0FBbUMsTUFBTSw4Q0FBOEM7QUFDOUYsT0FBT0MsaUJBQWlCLE1BQU0sd0JBQXdCO0FBRXRELE1BQU1DLGVBQWUsU0FBU0QsaUJBQWlCLENBQUM7RUFFOUM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLFdBQVdBLENBQUVDLGFBQWEsRUFBRUMsY0FBYyxFQUFFQyxrQkFBa0IsRUFBRUMsYUFBYSxFQUFFQyxNQUFNLEVBQUc7SUFDdEYsS0FBSyxDQUFFSixhQUFhLEVBQUVDLGNBQWMsRUFBRUMsa0JBQWtCLEVBQUVDLGFBQWEsRUFBRUMsTUFBTyxDQUFDO0lBQ2pGLE1BQU1DLFdBQVcsR0FBRztNQUNsQkMsUUFBUSxFQUFFO0lBQ1osQ0FBQzs7SUFFRDtJQUNBLE1BQU1DLFlBQVksR0FBRyxJQUFJWixRQUFRLENBQUUsc0NBQXNDLEVBQUVELEtBQUssQ0FBRTtNQUNoRmMsS0FBSyxFQUFFLFFBQVE7TUFDZkMsT0FBTyxFQUFFaEIsVUFBVSxDQUFDaUIscUJBQXFCLENBQUNDLEtBQUssR0FBRyxDQUFDO01BQ25EQyxHQUFHLEVBQUVuQixVQUFVLENBQUNpQixxQkFBcUIsQ0FBQ0csTUFBTSxHQUFHO0lBQ2pELENBQUMsRUFBRVIsV0FBWSxDQUFFLENBQUM7SUFDbEJiLFNBQVMsQ0FBQ3NCLFNBQVMsQ0FBRSxDQUFFWixrQkFBa0IsQ0FBQ2EsWUFBWSxFQUFFYixrQkFBa0IsQ0FBQ2MsaUJBQWlCLENBQUUsRUFBRSxDQUFFQyxJQUFJLEVBQUVDLFNBQVMsS0FBTTtNQUNySFgsWUFBWSxDQUFDWSxPQUFPLEdBQUcsQ0FBQ0QsU0FBUyxJQUFJRCxJQUFJLEtBQUssU0FBUztJQUN6RCxDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNRyxTQUFTLEdBQUcsSUFBSXpCLFFBQVEsQ0FBRSw4Q0FBOEMsRUFBRUQsS0FBSyxDQUFFO01BQ3JGYyxLQUFLLEVBQUUsUUFBUTtNQUNmQyxPQUFPLEVBQUVoQixVQUFVLENBQUNpQixxQkFBcUIsQ0FBQ0MsS0FBSyxHQUFHLENBQUM7TUFDbkRDLEdBQUcsRUFBRW5CLFVBQVUsQ0FBQ2lCLHFCQUFxQixDQUFDRyxNQUFNLEdBQUc7SUFDakQsQ0FBQyxFQUFFUixXQUFZLENBQUUsQ0FBQztJQUNsQkgsa0JBQWtCLENBQUNhLFlBQVksQ0FBQ00sSUFBSSxDQUFFSixJQUFJLElBQUk7TUFDNUNHLFNBQVMsQ0FBQ0QsT0FBTyxHQUFHRixJQUFJLEtBQUssTUFBTTtJQUNyQyxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNLLFFBQVEsQ0FBRWYsWUFBYSxDQUFDO0lBQzdCLElBQUksQ0FBQ2UsUUFBUSxDQUFFRixTQUFVLENBQUM7O0lBRTFCO0lBQ0FBLFNBQVMsQ0FBQ0csVUFBVSxDQUFDLENBQUM7SUFDdEJoQixZQUFZLENBQUNnQixVQUFVLENBQUMsQ0FBQztFQUMzQjtBQUNGO0FBRUEzQixtQ0FBbUMsQ0FBQzRCLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRTFCLGVBQWdCLENBQUM7QUFDbEYsZUFBZUEsZUFBZSJ9