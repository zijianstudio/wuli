// Copyright 2022, University of Colorado Boulder

/**
 * The content for the "Overview" panel of the Preferences dialog. It includes an introduction blurb
 * about features available in Preferences. This panel is always present in the dialog.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import { VBox, VoicingRichText } from '../../../scenery/js/imports.js';
import isLeftToRightProperty from '../i18n/isLeftToRightProperty.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanel from './PreferencesPanel.js';
import PreferencesType from './PreferencesType.js';
class OverviewPreferencesPanel extends PreferencesPanel {
  constructor(selectedTabProperty, tabVisibleProperty) {
    super(PreferencesType.OVERVIEW, selectedTabProperty, tabVisibleProperty);
    const introTextOptions = merge({}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
      // using lineWrap instead of default maxWidth for content
      maxWidth: null,
      lineWrap: 600,
      maxHeight: 600,
      tagName: 'p'
    });
    const introParagraphsTexts = [
    // These string keys go through preferences.tabs.general because they used to
    // live in that tab. But now we cannot rename the string keys.
    new VoicingRichText(JoistStrings.preferences.tabs.general.accessibilityIntroStringProperty, introTextOptions), new VoicingRichText(JoistStrings.preferences.tabs.general.moreAccessibilityStringProperty, introTextOptions)];
    const panelContent = new VBox({
      spacing: 10,
      children: introParagraphsTexts
    });
    this.addChild(panelContent);
    const leftToRightListener = isLTR => {
      introParagraphsTexts.forEach(text => {
        const align = isLTR ? 'left' : 'right';
        text.align = align;
        panelContent.align = align;
      });
    };
    isLeftToRightProperty.link(leftToRightListener);
    this.disposeOverviewPreferencesPanel = () => {
      isLeftToRightProperty.unlink(leftToRightListener);
      panelContent.dispose();
      introParagraphsTexts.forEach(introParagraphsText => introParagraphsText.dispose());
    };
  }
  dispose() {
    this.disposeOverviewPreferencesPanel();
    super.dispose();
  }
}
joist.register('OverviewPreferencesPanel', OverviewPreferencesPanel);
export default OverviewPreferencesPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlZCb3giLCJWb2ljaW5nUmljaFRleHQiLCJpc0xlZnRUb1JpZ2h0UHJvcGVydHkiLCJqb2lzdCIsIkpvaXN0U3RyaW5ncyIsIlByZWZlcmVuY2VzRGlhbG9nIiwiUHJlZmVyZW5jZXNQYW5lbCIsIlByZWZlcmVuY2VzVHlwZSIsIk92ZXJ2aWV3UHJlZmVyZW5jZXNQYW5lbCIsImNvbnN0cnVjdG9yIiwic2VsZWN0ZWRUYWJQcm9wZXJ0eSIsInRhYlZpc2libGVQcm9wZXJ0eSIsIk9WRVJWSUVXIiwiaW50cm9UZXh0T3B0aW9ucyIsIlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TIiwibWF4V2lkdGgiLCJsaW5lV3JhcCIsIm1heEhlaWdodCIsInRhZ05hbWUiLCJpbnRyb1BhcmFncmFwaHNUZXh0cyIsInByZWZlcmVuY2VzIiwidGFicyIsImdlbmVyYWwiLCJhY2Nlc3NpYmlsaXR5SW50cm9TdHJpbmdQcm9wZXJ0eSIsIm1vcmVBY2Nlc3NpYmlsaXR5U3RyaW5nUHJvcGVydHkiLCJwYW5lbENvbnRlbnQiLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJhZGRDaGlsZCIsImxlZnRUb1JpZ2h0TGlzdGVuZXIiLCJpc0xUUiIsImZvckVhY2giLCJ0ZXh0IiwiYWxpZ24iLCJsaW5rIiwiZGlzcG9zZU92ZXJ2aWV3UHJlZmVyZW5jZXNQYW5lbCIsInVubGluayIsImRpc3Bvc2UiLCJpbnRyb1BhcmFncmFwaHNUZXh0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJPdmVydmlld1ByZWZlcmVuY2VzUGFuZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBjb250ZW50IGZvciB0aGUgXCJPdmVydmlld1wiIHBhbmVsIG9mIHRoZSBQcmVmZXJlbmNlcyBkaWFsb2cuIEl0IGluY2x1ZGVzIGFuIGludHJvZHVjdGlvbiBibHVyYlxyXG4gKiBhYm91dCBmZWF0dXJlcyBhdmFpbGFibGUgaW4gUHJlZmVyZW5jZXMuIFRoaXMgcGFuZWwgaXMgYWx3YXlzIHByZXNlbnQgaW4gdGhlIGRpYWxvZy5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgVkJveCwgVm9pY2luZ1JpY2hUZXh0IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGlzTGVmdFRvUmlnaHRQcm9wZXJ0eSBmcm9tICcuLi9pMThuL2lzTGVmdFRvUmlnaHRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBqb2lzdCBmcm9tICcuLi9qb2lzdC5qcyc7XHJcbmltcG9ydCBKb2lzdFN0cmluZ3MgZnJvbSAnLi4vSm9pc3RTdHJpbmdzLmpzJztcclxuaW1wb3J0IFByZWZlcmVuY2VzRGlhbG9nIGZyb20gJy4vUHJlZmVyZW5jZXNEaWFsb2cuanMnO1xyXG5pbXBvcnQgUHJlZmVyZW5jZXNQYW5lbCBmcm9tICcuL1ByZWZlcmVuY2VzUGFuZWwuanMnO1xyXG5pbXBvcnQgUHJlZmVyZW5jZXNUeXBlIGZyb20gJy4vUHJlZmVyZW5jZXNUeXBlLmpzJztcclxuXHJcbmNsYXNzIE92ZXJ2aWV3UHJlZmVyZW5jZXNQYW5lbCBleHRlbmRzIFByZWZlcmVuY2VzUGFuZWwge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZU92ZXJ2aWV3UHJlZmVyZW5jZXNQYW5lbDogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzZWxlY3RlZFRhYlByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxQcmVmZXJlbmNlc1R5cGU+LCB0YWJWaXNpYmxlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+ICkge1xyXG4gICAgc3VwZXIoIFByZWZlcmVuY2VzVHlwZS5PVkVSVklFVywgc2VsZWN0ZWRUYWJQcm9wZXJ0eSwgdGFiVmlzaWJsZVByb3BlcnR5ICk7XHJcblxyXG4gICAgY29uc3QgaW50cm9UZXh0T3B0aW9ucyA9IG1lcmdlKCB7fSwgUHJlZmVyZW5jZXNEaWFsb2cuUEFORUxfU0VDVElPTl9DT05URU5UX09QVElPTlMsIHtcclxuXHJcbiAgICAgIC8vIHVzaW5nIGxpbmVXcmFwIGluc3RlYWQgb2YgZGVmYXVsdCBtYXhXaWR0aCBmb3IgY29udGVudFxyXG4gICAgICBtYXhXaWR0aDogbnVsbCxcclxuICAgICAgbGluZVdyYXA6IDYwMCxcclxuICAgICAgbWF4SGVpZ2h0OiA2MDAsXHJcbiAgICAgIHRhZ05hbWU6ICdwJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGludHJvUGFyYWdyYXBoc1RleHRzID0gW1xyXG5cclxuICAgICAgLy8gVGhlc2Ugc3RyaW5nIGtleXMgZ28gdGhyb3VnaCBwcmVmZXJlbmNlcy50YWJzLmdlbmVyYWwgYmVjYXVzZSB0aGV5IHVzZWQgdG9cclxuICAgICAgLy8gbGl2ZSBpbiB0aGF0IHRhYi4gQnV0IG5vdyB3ZSBjYW5ub3QgcmVuYW1lIHRoZSBzdHJpbmcga2V5cy5cclxuICAgICAgbmV3IFZvaWNpbmdSaWNoVGV4dCggSm9pc3RTdHJpbmdzLnByZWZlcmVuY2VzLnRhYnMuZ2VuZXJhbC5hY2Nlc3NpYmlsaXR5SW50cm9TdHJpbmdQcm9wZXJ0eSwgaW50cm9UZXh0T3B0aW9ucyApLFxyXG4gICAgICBuZXcgVm9pY2luZ1JpY2hUZXh0KCBKb2lzdFN0cmluZ3MucHJlZmVyZW5jZXMudGFicy5nZW5lcmFsLm1vcmVBY2Nlc3NpYmlsaXR5U3RyaW5nUHJvcGVydHksIGludHJvVGV4dE9wdGlvbnMgKVxyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdCBwYW5lbENvbnRlbnQgPSBuZXcgVkJveCggeyBzcGFjaW5nOiAxMCwgY2hpbGRyZW46IGludHJvUGFyYWdyYXBoc1RleHRzIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHBhbmVsQ29udGVudCApO1xyXG5cclxuICAgIGNvbnN0IGxlZnRUb1JpZ2h0TGlzdGVuZXIgPSAoIGlzTFRSOiBib29sZWFuICkgPT4ge1xyXG4gICAgICBpbnRyb1BhcmFncmFwaHNUZXh0cy5mb3JFYWNoKCB0ZXh0ID0+IHtcclxuICAgICAgICBjb25zdCBhbGlnbiA9IGlzTFRSID8gJ2xlZnQnIDogJ3JpZ2h0JztcclxuICAgICAgICB0ZXh0LmFsaWduID0gYWxpZ247XHJcbiAgICAgICAgcGFuZWxDb250ZW50LmFsaWduID0gYWxpZ247XHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcbiAgICBpc0xlZnRUb1JpZ2h0UHJvcGVydHkubGluayggbGVmdFRvUmlnaHRMaXN0ZW5lciApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZU92ZXJ2aWV3UHJlZmVyZW5jZXNQYW5lbCA9ICgpID0+IHtcclxuICAgICAgaXNMZWZ0VG9SaWdodFByb3BlcnR5LnVubGluayggbGVmdFRvUmlnaHRMaXN0ZW5lciApO1xyXG4gICAgICBwYW5lbENvbnRlbnQuZGlzcG9zZSgpO1xyXG4gICAgICBpbnRyb1BhcmFncmFwaHNUZXh0cy5mb3JFYWNoKCBpbnRyb1BhcmFncmFwaHNUZXh0ID0+IGludHJvUGFyYWdyYXBoc1RleHQuZGlzcG9zZSgpICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VPdmVydmlld1ByZWZlcmVuY2VzUGFuZWwoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmpvaXN0LnJlZ2lzdGVyKCAnT3ZlcnZpZXdQcmVmZXJlbmNlc1BhbmVsJywgT3ZlcnZpZXdQcmVmZXJlbmNlc1BhbmVsICk7XHJcbmV4cG9ydCBkZWZhdWx0IE92ZXJ2aWV3UHJlZmVyZW5jZXNQYW5lbDtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxTQUFTQyxJQUFJLEVBQUVDLGVBQWUsUUFBUSxnQ0FBZ0M7QUFDdEUsT0FBT0MscUJBQXFCLE1BQU0sa0NBQWtDO0FBQ3BFLE9BQU9DLEtBQUssTUFBTSxhQUFhO0FBQy9CLE9BQU9DLFlBQVksTUFBTSxvQkFBb0I7QUFDN0MsT0FBT0MsaUJBQWlCLE1BQU0sd0JBQXdCO0FBQ3RELE9BQU9DLGdCQUFnQixNQUFNLHVCQUF1QjtBQUNwRCxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBRWxELE1BQU1DLHdCQUF3QixTQUFTRixnQkFBZ0IsQ0FBQztFQUcvQ0csV0FBV0EsQ0FBRUMsbUJBQXVELEVBQUVDLGtCQUE4QyxFQUFHO0lBQzVILEtBQUssQ0FBRUosZUFBZSxDQUFDSyxRQUFRLEVBQUVGLG1CQUFtQixFQUFFQyxrQkFBbUIsQ0FBQztJQUUxRSxNQUFNRSxnQkFBZ0IsR0FBR2QsS0FBSyxDQUFFLENBQUMsQ0FBQyxFQUFFTSxpQkFBaUIsQ0FBQ1MsNkJBQTZCLEVBQUU7TUFFbkY7TUFDQUMsUUFBUSxFQUFFLElBQUk7TUFDZEMsUUFBUSxFQUFFLEdBQUc7TUFDYkMsU0FBUyxFQUFFLEdBQUc7TUFDZEMsT0FBTyxFQUFFO0lBQ1gsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsb0JBQW9CLEdBQUc7SUFFM0I7SUFDQTtJQUNBLElBQUlsQixlQUFlLENBQUVHLFlBQVksQ0FBQ2dCLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxPQUFPLENBQUNDLGdDQUFnQyxFQUFFVixnQkFBaUIsQ0FBQyxFQUMvRyxJQUFJWixlQUFlLENBQUVHLFlBQVksQ0FBQ2dCLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxPQUFPLENBQUNFLCtCQUErQixFQUFFWCxnQkFBaUIsQ0FBQyxDQUMvRztJQUVELE1BQU1ZLFlBQVksR0FBRyxJQUFJekIsSUFBSSxDQUFFO01BQUUwQixPQUFPLEVBQUUsRUFBRTtNQUFFQyxRQUFRLEVBQUVSO0lBQXFCLENBQUUsQ0FBQztJQUNoRixJQUFJLENBQUNTLFFBQVEsQ0FBRUgsWUFBYSxDQUFDO0lBRTdCLE1BQU1JLG1CQUFtQixHQUFLQyxLQUFjLElBQU07TUFDaERYLG9CQUFvQixDQUFDWSxPQUFPLENBQUVDLElBQUksSUFBSTtRQUNwQyxNQUFNQyxLQUFLLEdBQUdILEtBQUssR0FBRyxNQUFNLEdBQUcsT0FBTztRQUN0Q0UsSUFBSSxDQUFDQyxLQUFLLEdBQUdBLEtBQUs7UUFDbEJSLFlBQVksQ0FBQ1EsS0FBSyxHQUFHQSxLQUFLO01BQzVCLENBQUUsQ0FBQztJQUNMLENBQUM7SUFDRC9CLHFCQUFxQixDQUFDZ0MsSUFBSSxDQUFFTCxtQkFBb0IsQ0FBQztJQUVqRCxJQUFJLENBQUNNLCtCQUErQixHQUFHLE1BQU07TUFDM0NqQyxxQkFBcUIsQ0FBQ2tDLE1BQU0sQ0FBRVAsbUJBQW9CLENBQUM7TUFDbkRKLFlBQVksQ0FBQ1ksT0FBTyxDQUFDLENBQUM7TUFDdEJsQixvQkFBb0IsQ0FBQ1ksT0FBTyxDQUFFTyxtQkFBbUIsSUFBSUEsbUJBQW1CLENBQUNELE9BQU8sQ0FBQyxDQUFFLENBQUM7SUFDdEYsQ0FBQztFQUNIO0VBRWdCQSxPQUFPQSxDQUFBLEVBQVM7SUFDOUIsSUFBSSxDQUFDRiwrQkFBK0IsQ0FBQyxDQUFDO0lBQ3RDLEtBQUssQ0FBQ0UsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBbEMsS0FBSyxDQUFDb0MsUUFBUSxDQUFFLDBCQUEwQixFQUFFL0Isd0JBQXlCLENBQUM7QUFDdEUsZUFBZUEsd0JBQXdCIn0=