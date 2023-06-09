// Copyright 2022, University of Colorado Boulder

/**
 * A UI component that allows you to change language of the simulation at runtime by controlling the localeProperty.
 * It appears in the "Localization" tab of the Preferences dialog.
 *
 * This is a first iteration of this UI component. It may be improved in the future. See
 * https://github.com/phetsims/joist/issues/814 for more history.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import joist from '../joist.js';
import Panel from '../../../sun/js/Panel.js';
import { GridBox } from '../../../scenery/js/imports.js';
import LanguageSelectionNode from './LanguageSelectionNode.js';
class LocalePanel extends Panel {
  constructor(localeProperty) {
    // All available locales aligned into a grid
    const content = new GridBox({
      xMargin: 5,
      xAlign: 'left',
      autoRows: 15,
      // By inspection, safety net in case there are too many languages. Will scale down this panel without
      // the entire PreferencesDialog scaling down.
      maxWidth: 1000,
      // We don't want the GridBox to resize as selection highlights update with input
      resize: false,
      children: localeProperty.validValues.map(locale => {
        return new LanguageSelectionNode(localeProperty, locale);
      })
    });
    super(content);
    this.disposeLocalePanel = () => {
      content.children.forEach(languageSelectionNode => {
        languageSelectionNode.dispose();
      });
      content.dispose();
    };
  }
  dispose() {
    this.disposeLocalePanel();
    super.dispose();
  }
}
joist.register('LocalePanel', LocalePanel);
export default LocalePanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJqb2lzdCIsIlBhbmVsIiwiR3JpZEJveCIsIkxhbmd1YWdlU2VsZWN0aW9uTm9kZSIsIkxvY2FsZVBhbmVsIiwiY29uc3RydWN0b3IiLCJsb2NhbGVQcm9wZXJ0eSIsImNvbnRlbnQiLCJ4TWFyZ2luIiwieEFsaWduIiwiYXV0b1Jvd3MiLCJtYXhXaWR0aCIsInJlc2l6ZSIsImNoaWxkcmVuIiwidmFsaWRWYWx1ZXMiLCJtYXAiLCJsb2NhbGUiLCJkaXNwb3NlTG9jYWxlUGFuZWwiLCJmb3JFYWNoIiwibGFuZ3VhZ2VTZWxlY3Rpb25Ob2RlIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTG9jYWxlUGFuZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgVUkgY29tcG9uZW50IHRoYXQgYWxsb3dzIHlvdSB0byBjaGFuZ2UgbGFuZ3VhZ2Ugb2YgdGhlIHNpbXVsYXRpb24gYXQgcnVudGltZSBieSBjb250cm9sbGluZyB0aGUgbG9jYWxlUHJvcGVydHkuXHJcbiAqIEl0IGFwcGVhcnMgaW4gdGhlIFwiTG9jYWxpemF0aW9uXCIgdGFiIG9mIHRoZSBQcmVmZXJlbmNlcyBkaWFsb2cuXHJcbiAqXHJcbiAqIFRoaXMgaXMgYSBmaXJzdCBpdGVyYXRpb24gb2YgdGhpcyBVSSBjb21wb25lbnQuIEl0IG1heSBiZSBpbXByb3ZlZCBpbiB0aGUgZnV0dXJlLiBTZWVcclxuICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy84MTQgZm9yIG1vcmUgaGlzdG9yeS5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IGpvaXN0IGZyb20gJy4uL2pvaXN0LmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCB7IEdyaWRCb3ggfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBMYW5ndWFnZVNlbGVjdGlvbk5vZGUgZnJvbSAnLi9MYW5ndWFnZVNlbGVjdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgeyBMb2NhbGUgfSBmcm9tICcuLi9pMThuL2xvY2FsZVByb3BlcnR5LmpzJztcclxuXHJcbmNsYXNzIExvY2FsZVBhbmVsIGV4dGVuZHMgUGFuZWwge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUxvY2FsZVBhbmVsOiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxvY2FsZVByb3BlcnR5OiBQcm9wZXJ0eTxMb2NhbGU+ICkge1xyXG5cclxuICAgIC8vIEFsbCBhdmFpbGFibGUgbG9jYWxlcyBhbGlnbmVkIGludG8gYSBncmlkXHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IEdyaWRCb3goIHtcclxuICAgICAgeE1hcmdpbjogNSxcclxuICAgICAgeEFsaWduOiAnbGVmdCcsXHJcbiAgICAgIGF1dG9Sb3dzOiAxNSxcclxuXHJcbiAgICAgIC8vIEJ5IGluc3BlY3Rpb24sIHNhZmV0eSBuZXQgaW4gY2FzZSB0aGVyZSBhcmUgdG9vIG1hbnkgbGFuZ3VhZ2VzLiBXaWxsIHNjYWxlIGRvd24gdGhpcyBwYW5lbCB3aXRob3V0XHJcbiAgICAgIC8vIHRoZSBlbnRpcmUgUHJlZmVyZW5jZXNEaWFsb2cgc2NhbGluZyBkb3duLlxyXG4gICAgICBtYXhXaWR0aDogMTAwMCxcclxuXHJcbiAgICAgIC8vIFdlIGRvbid0IHdhbnQgdGhlIEdyaWRCb3ggdG8gcmVzaXplIGFzIHNlbGVjdGlvbiBoaWdobGlnaHRzIHVwZGF0ZSB3aXRoIGlucHV0XHJcbiAgICAgIHJlc2l6ZTogZmFsc2UsXHJcbiAgICAgIGNoaWxkcmVuOiBsb2NhbGVQcm9wZXJ0eS52YWxpZFZhbHVlcyEubWFwKCBsb2NhbGUgPT4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgTGFuZ3VhZ2VTZWxlY3Rpb25Ob2RlKCBsb2NhbGVQcm9wZXJ0eSwgbG9jYWxlICk7XHJcbiAgICAgIH0gKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBjb250ZW50ICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlTG9jYWxlUGFuZWwgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnRlbnQuY2hpbGRyZW4uZm9yRWFjaCggbGFuZ3VhZ2VTZWxlY3Rpb25Ob2RlID0+IHtcclxuICAgICAgICBsYW5ndWFnZVNlbGVjdGlvbk5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnRlbnQuZGlzcG9zZSgpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlTG9jYWxlUGFuZWwoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmpvaXN0LnJlZ2lzdGVyKCAnTG9jYWxlUGFuZWwnLCBMb2NhbGVQYW5lbCApO1xyXG5leHBvcnQgZGVmYXVsdCBMb2NhbGVQYW5lbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sYUFBYTtBQUMvQixPQUFPQyxLQUFLLE1BQU0sMEJBQTBCO0FBQzVDLFNBQVNDLE9BQU8sUUFBUSxnQ0FBZ0M7QUFFeEQsT0FBT0MscUJBQXFCLE1BQU0sNEJBQTRCO0FBRzlELE1BQU1DLFdBQVcsU0FBU0gsS0FBSyxDQUFDO0VBR3ZCSSxXQUFXQSxDQUFFQyxjQUFnQyxFQUFHO0lBRXJEO0lBQ0EsTUFBTUMsT0FBTyxHQUFHLElBQUlMLE9BQU8sQ0FBRTtNQUMzQk0sT0FBTyxFQUFFLENBQUM7TUFDVkMsTUFBTSxFQUFFLE1BQU07TUFDZEMsUUFBUSxFQUFFLEVBQUU7TUFFWjtNQUNBO01BQ0FDLFFBQVEsRUFBRSxJQUFJO01BRWQ7TUFDQUMsTUFBTSxFQUFFLEtBQUs7TUFDYkMsUUFBUSxFQUFFUCxjQUFjLENBQUNRLFdBQVcsQ0FBRUMsR0FBRyxDQUFFQyxNQUFNLElBQUk7UUFDbkQsT0FBTyxJQUFJYixxQkFBcUIsQ0FBRUcsY0FBYyxFQUFFVSxNQUFPLENBQUM7TUFDNUQsQ0FBRTtJQUNKLENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRVQsT0FBUSxDQUFDO0lBRWhCLElBQUksQ0FBQ1Usa0JBQWtCLEdBQUcsTUFBTTtNQUM5QlYsT0FBTyxDQUFDTSxRQUFRLENBQUNLLE9BQU8sQ0FBRUMscUJBQXFCLElBQUk7UUFDakRBLHFCQUFxQixDQUFDQyxPQUFPLENBQUMsQ0FBQztNQUNqQyxDQUFFLENBQUM7TUFDSGIsT0FBTyxDQUFDYSxPQUFPLENBQUMsQ0FBQztJQUNuQixDQUFDO0VBQ0g7RUFFZ0JBLE9BQU9BLENBQUEsRUFBUztJQUM5QixJQUFJLENBQUNILGtCQUFrQixDQUFDLENBQUM7SUFDekIsS0FBSyxDQUFDRyxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUFwQixLQUFLLENBQUNxQixRQUFRLENBQUUsYUFBYSxFQUFFakIsV0FBWSxDQUFDO0FBQzVDLGVBQWVBLFdBQVcifQ==