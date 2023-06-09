// Copyright 2023, University of Colorado Boulder

/**
 * Class for named items of a Carousel. Text is wrapped in a Rectangle for highlighting and input listeners.
 *
 * TODO: Consider moving to joist and generalizing further, see https://github.com/phetsims/joist/issues/908.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import PreferencesDialog from '../../../../joist/js/preferences/PreferencesDialog.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { Color, FireListener, HighlightOverlay, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
const WIDTH = 200;
const PADDING = 5;
export default class CarouselItemNode extends Rectangle {
  constructor(property, value, name, devName, callback) {
    // Include the locale code when running with ?dev.
    const string = phet.chipper.queryParameters.dev ? `${name} (${devName})` : name;
    const text = new Text(string, {
      font: PreferencesDialog.CONTENT_FONT,
      maxWidth: WIDTH - PADDING * 2
    });
    super({
      rectWidth: WIDTH,
      rectHeight: text.bounds.height + PADDING * 2,
      cursor: 'pointer',
      // So that the item is tab-navigable and can be activated with the FireListener
      tagName: 'button'
    });
    text.center = this.center;
    this.addChild(text);
    const fireListener = new FireListener({
      fire: () => {
        callback();
      },
      // Preferences components are not instrumented, see https://github.com/phetsims/joist/issues/744
      tandem: Tandem.OPT_OUT
    });
    this.addInputListener(fireListener);

    // Will be unlinked with FireListener disposal
    fireListener.isOverProperty.link(isOver => {
      // makes the mouse interactive, keep the same dimensions so the layout will not change
      this.stroke = isOver ? HighlightOverlay.getInnerGroupHighlightColor() : Color.TRANSPARENT;
    });
    const listener = selection => {
      // identifies the selected locale
      this.fill = selection === value ? PhetColorScheme.PHET_LOGO_BLUE : null;
    };
    property.link(listener);
    this.disposeSelectionNode = () => {
      text.dispose();
      property.unlink(listener);
      this.removeInputListener(fireListener);
      fireListener.dispose();
    };
  }
  dispose() {
    this.disposeSelectionNode();
    super.dispose();
  }
}
numberSuiteCommon.register('CarouselItemNode', CarouselItemNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcmVmZXJlbmNlc0RpYWxvZyIsIlBoZXRDb2xvclNjaGVtZSIsIkNvbG9yIiwiRmlyZUxpc3RlbmVyIiwiSGlnaGxpZ2h0T3ZlcmxheSIsIlJlY3RhbmdsZSIsIlRleHQiLCJUYW5kZW0iLCJudW1iZXJTdWl0ZUNvbW1vbiIsIldJRFRIIiwiUEFERElORyIsIkNhcm91c2VsSXRlbU5vZGUiLCJjb25zdHJ1Y3RvciIsInByb3BlcnR5IiwidmFsdWUiLCJuYW1lIiwiZGV2TmFtZSIsImNhbGxiYWNrIiwic3RyaW5nIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJkZXYiLCJ0ZXh0IiwiZm9udCIsIkNPTlRFTlRfRk9OVCIsIm1heFdpZHRoIiwicmVjdFdpZHRoIiwicmVjdEhlaWdodCIsImJvdW5kcyIsImhlaWdodCIsImN1cnNvciIsInRhZ05hbWUiLCJjZW50ZXIiLCJhZGRDaGlsZCIsImZpcmVMaXN0ZW5lciIsImZpcmUiLCJ0YW5kZW0iLCJPUFRfT1VUIiwiYWRkSW5wdXRMaXN0ZW5lciIsImlzT3ZlclByb3BlcnR5IiwibGluayIsImlzT3ZlciIsInN0cm9rZSIsImdldElubmVyR3JvdXBIaWdobGlnaHRDb2xvciIsIlRSQU5TUEFSRU5UIiwibGlzdGVuZXIiLCJzZWxlY3Rpb24iLCJmaWxsIiwiUEhFVF9MT0dPX0JMVUUiLCJkaXNwb3NlU2VsZWN0aW9uTm9kZSIsImRpc3Bvc2UiLCJ1bmxpbmsiLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDYXJvdXNlbEl0ZW1Ob2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDbGFzcyBmb3IgbmFtZWQgaXRlbXMgb2YgYSBDYXJvdXNlbC4gVGV4dCBpcyB3cmFwcGVkIGluIGEgUmVjdGFuZ2xlIGZvciBoaWdobGlnaHRpbmcgYW5kIGlucHV0IGxpc3RlbmVycy5cclxuICpcclxuICogVE9ETzogQ29uc2lkZXIgbW92aW5nIHRvIGpvaXN0IGFuZCBnZW5lcmFsaXppbmcgZnVydGhlciwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvOTA4LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJlZmVyZW5jZXNEaWFsb2cgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvcHJlZmVyZW5jZXMvUHJlZmVyZW5jZXNEaWFsb2cuanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgRmlyZUxpc3RlbmVyLCBIaWdobGlnaHRPdmVybGF5LCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgbnVtYmVyU3VpdGVDb21tb24gZnJvbSAnLi4vLi4vbnVtYmVyU3VpdGVDb21tb24uanMnO1xyXG5cclxuY29uc3QgV0lEVEggPSAyMDA7XHJcbmNvbnN0IFBBRERJTkcgPSA1O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2Fyb3VzZWxJdGVtTm9kZTxUPiBleHRlbmRzIFJlY3RhbmdsZSB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVNlbGVjdGlvbk5vZGU6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvcGVydHk6IFRQcm9wZXJ0eTxUIHwgbnVsbD4sXHJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogVCxcclxuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICAgIGRldk5hbWU6IHN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB2b2lkXHJcbiAgKSB7XHJcblxyXG4gICAgLy8gSW5jbHVkZSB0aGUgbG9jYWxlIGNvZGUgd2hlbiBydW5uaW5nIHdpdGggP2Rldi5cclxuICAgIGNvbnN0IHN0cmluZyA9IHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuZGV2ID8gYCR7bmFtZX0gKCR7ZGV2TmFtZX0pYCA6IG5hbWU7XHJcblxyXG4gICAgY29uc3QgdGV4dCA9IG5ldyBUZXh0KCBzdHJpbmcsIHtcclxuICAgICAgZm9udDogUHJlZmVyZW5jZXNEaWFsb2cuQ09OVEVOVF9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogV0lEVEggLSBQQURESU5HICogMlxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHJlY3RXaWR0aDogV0lEVEgsXHJcbiAgICAgIHJlY3RIZWlnaHQ6IHRleHQuYm91bmRzLmhlaWdodCArIFBBRERJTkcgKiAyLFxyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuXHJcbiAgICAgIC8vIFNvIHRoYXQgdGhlIGl0ZW0gaXMgdGFiLW5hdmlnYWJsZSBhbmQgY2FuIGJlIGFjdGl2YXRlZCB3aXRoIHRoZSBGaXJlTGlzdGVuZXJcclxuICAgICAgdGFnTmFtZTogJ2J1dHRvbidcclxuICAgIH0gKTtcclxuICAgIHRleHQuY2VudGVyID0gdGhpcy5jZW50ZXI7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0ZXh0ICk7XHJcblxyXG4gICAgY29uc3QgZmlyZUxpc3RlbmVyID0gbmV3IEZpcmVMaXN0ZW5lcigge1xyXG4gICAgICBmaXJlOiAoKSA9PiB7XHJcbiAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFByZWZlcmVuY2VzIGNvbXBvbmVudHMgYXJlIG5vdCBpbnN0cnVtZW50ZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzc0NFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIGZpcmVMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIFdpbGwgYmUgdW5saW5rZWQgd2l0aCBGaXJlTGlzdGVuZXIgZGlzcG9zYWxcclxuICAgIGZpcmVMaXN0ZW5lci5pc092ZXJQcm9wZXJ0eS5saW5rKCBpc092ZXIgPT4ge1xyXG5cclxuICAgICAgLy8gbWFrZXMgdGhlIG1vdXNlIGludGVyYWN0aXZlLCBrZWVwIHRoZSBzYW1lIGRpbWVuc2lvbnMgc28gdGhlIGxheW91dCB3aWxsIG5vdCBjaGFuZ2VcclxuICAgICAgdGhpcy5zdHJva2UgPSBpc092ZXIgPyBIaWdobGlnaHRPdmVybGF5LmdldElubmVyR3JvdXBIaWdobGlnaHRDb2xvcigpIDogQ29sb3IuVFJBTlNQQVJFTlQ7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbGlzdGVuZXIgPSAoIHNlbGVjdGlvbjogVCB8IG51bGwgKSA9PiB7XHJcblxyXG4gICAgICAvLyBpZGVudGlmaWVzIHRoZSBzZWxlY3RlZCBsb2NhbGVcclxuICAgICAgdGhpcy5maWxsID0gc2VsZWN0aW9uID09PSB2YWx1ZSA/IFBoZXRDb2xvclNjaGVtZS5QSEVUX0xPR09fQkxVRSA6IG51bGw7XHJcbiAgICB9O1xyXG4gICAgcHJvcGVydHkubGluayggbGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VTZWxlY3Rpb25Ob2RlID0gKCkgPT4ge1xyXG4gICAgICB0ZXh0LmRpc3Bvc2UoKTtcclxuICAgICAgcHJvcGVydHkudW5saW5rKCBsaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLnJlbW92ZUlucHV0TGlzdGVuZXIoIGZpcmVMaXN0ZW5lciApO1xyXG4gICAgICBmaXJlTGlzdGVuZXIuZGlzcG9zZSgpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlU2VsZWN0aW9uTm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxubnVtYmVyU3VpdGVDb21tb24ucmVnaXN0ZXIoICdDYXJvdXNlbEl0ZW1Ob2RlJywgQ2Fyb3VzZWxJdGVtTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxpQkFBaUIsTUFBTSx1REFBdUQ7QUFDckYsT0FBT0MsZUFBZSxNQUFNLGdEQUFnRDtBQUM1RSxTQUFTQyxLQUFLLEVBQUVDLFlBQVksRUFBRUMsZ0JBQWdCLEVBQUVDLFNBQVMsRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUMxRyxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLGlCQUFpQixNQUFNLDRCQUE0QjtBQUUxRCxNQUFNQyxLQUFLLEdBQUcsR0FBRztBQUNqQixNQUFNQyxPQUFPLEdBQUcsQ0FBQztBQUVqQixlQUFlLE1BQU1DLGdCQUFnQixTQUFZTixTQUFTLENBQUM7RUFJbERPLFdBQVdBLENBQUVDLFFBQTZCLEVBQzdCQyxLQUFRLEVBQ1JDLElBQVksRUFDWkMsT0FBZSxFQUNmQyxRQUFvQixFQUN0QztJQUVBO0lBQ0EsTUFBTUMsTUFBTSxHQUFHQyxJQUFJLENBQUNDLE9BQU8sQ0FBQ0MsZUFBZSxDQUFDQyxHQUFHLEdBQUksR0FBRVAsSUFBSyxLQUFJQyxPQUFRLEdBQUUsR0FBR0QsSUFBSTtJQUUvRSxNQUFNUSxJQUFJLEdBQUcsSUFBSWpCLElBQUksQ0FBRVksTUFBTSxFQUFFO01BQzdCTSxJQUFJLEVBQUV4QixpQkFBaUIsQ0FBQ3lCLFlBQVk7TUFDcENDLFFBQVEsRUFBRWpCLEtBQUssR0FBR0MsT0FBTyxHQUFHO0lBQzlCLENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRTtNQUNMaUIsU0FBUyxFQUFFbEIsS0FBSztNQUNoQm1CLFVBQVUsRUFBRUwsSUFBSSxDQUFDTSxNQUFNLENBQUNDLE1BQU0sR0FBR3BCLE9BQU8sR0FBRyxDQUFDO01BQzVDcUIsTUFBTSxFQUFFLFNBQVM7TUFFakI7TUFDQUMsT0FBTyxFQUFFO0lBQ1gsQ0FBRSxDQUFDO0lBQ0hULElBQUksQ0FBQ1UsTUFBTSxHQUFHLElBQUksQ0FBQ0EsTUFBTTtJQUN6QixJQUFJLENBQUNDLFFBQVEsQ0FBRVgsSUFBSyxDQUFDO0lBRXJCLE1BQU1ZLFlBQVksR0FBRyxJQUFJaEMsWUFBWSxDQUFFO01BQ3JDaUMsSUFBSSxFQUFFQSxDQUFBLEtBQU07UUFDVm5CLFFBQVEsQ0FBQyxDQUFDO01BQ1osQ0FBQztNQUVEO01BQ0FvQixNQUFNLEVBQUU5QixNQUFNLENBQUMrQjtJQUNqQixDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNDLGdCQUFnQixDQUFFSixZQUFhLENBQUM7O0lBRXJDO0lBQ0FBLFlBQVksQ0FBQ0ssY0FBYyxDQUFDQyxJQUFJLENBQUVDLE1BQU0sSUFBSTtNQUUxQztNQUNBLElBQUksQ0FBQ0MsTUFBTSxHQUFHRCxNQUFNLEdBQUd0QyxnQkFBZ0IsQ0FBQ3dDLDJCQUEyQixDQUFDLENBQUMsR0FBRzFDLEtBQUssQ0FBQzJDLFdBQVc7SUFDM0YsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsUUFBUSxHQUFLQyxTQUFtQixJQUFNO01BRTFDO01BQ0EsSUFBSSxDQUFDQyxJQUFJLEdBQUdELFNBQVMsS0FBS2pDLEtBQUssR0FBR2IsZUFBZSxDQUFDZ0QsY0FBYyxHQUFHLElBQUk7SUFDekUsQ0FBQztJQUNEcEMsUUFBUSxDQUFDNEIsSUFBSSxDQUFFSyxRQUFTLENBQUM7SUFFekIsSUFBSSxDQUFDSSxvQkFBb0IsR0FBRyxNQUFNO01BQ2hDM0IsSUFBSSxDQUFDNEIsT0FBTyxDQUFDLENBQUM7TUFDZHRDLFFBQVEsQ0FBQ3VDLE1BQU0sQ0FBRU4sUUFBUyxDQUFDO01BQzNCLElBQUksQ0FBQ08sbUJBQW1CLENBQUVsQixZQUFhLENBQUM7TUFDeENBLFlBQVksQ0FBQ2dCLE9BQU8sQ0FBQyxDQUFDO0lBQ3hCLENBQUM7RUFDSDtFQUVnQkEsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCLElBQUksQ0FBQ0Qsb0JBQW9CLENBQUMsQ0FBQztJQUMzQixLQUFLLENBQUNDLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQTNDLGlCQUFpQixDQUFDOEMsUUFBUSxDQUFFLGtCQUFrQixFQUFFM0MsZ0JBQWlCLENBQUMifQ==