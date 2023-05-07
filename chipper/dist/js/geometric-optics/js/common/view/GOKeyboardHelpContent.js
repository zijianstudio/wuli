// Copyright 2021-2023, University of Colorado Boulder

/**
 * GOKeyboardHelpContent is the content for the keyboard-help dialog in all screens.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BasicActionsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import ComboBoxKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/ComboBoxKeyboardHelpSection.js';
import SliderControlsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/SliderControlsKeyboardHelpSection.js';
import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import geometricOptics from '../../geometricOptics.js';
import GeometricOpticsStrings from '../../GeometricOpticsStrings.js';
import MoveDraggableItemsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/MoveDraggableItemsKeyboardHelpSection.js';
import { RulerAndMarkerControlsSection } from './RulerAndMarkerControlsSection.js';
export default class GOKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  constructor() {
    // Sections in the left column. They need to be disposed.
    const leftSections = [
    // Move Draggable Items
    new MoveDraggableItemsKeyboardHelpSection(),
    // Ruler and Marker Controls
    new RulerAndMarkerControlsSection(),
    // Choose an Object
    new ComboBoxKeyboardHelpSection({
      headingString: GeometricOpticsStrings.keyboardHelpDialog.chooseAnObjectStringProperty,
      thingAsLowerCaseSingular: GeometricOpticsStrings.keyboardHelpDialog.objectStringProperty,
      thingAsLowerCasePlural: GeometricOpticsStrings.keyboardHelpDialog.objectsStringProperty
    })];

    // Sections in the right column. They need to be disposed.
    const rightSections = [
    // Slider Controls
    new SliderControlsKeyboardHelpSection(),
    // Basic Actions
    new BasicActionsKeyboardHelpSection({
      withCheckboxContent: true
    })];
    super(leftSections, rightSections);
    this.disposeGOKeyboardHelpContent = () => {
      leftSections.forEach(section => section.dispose());
      rightSections.forEach(section => section.dispose());
    };
  }
  dispose() {
    this.disposeGOKeyboardHelpContent();
    super.dispose();
  }
}
geometricOptics.register('GOKeyboardHelpContent', GOKeyboardHelpContent);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCYXNpY0FjdGlvbnNLZXlib2FyZEhlbHBTZWN0aW9uIiwiQ29tYm9Cb3hLZXlib2FyZEhlbHBTZWN0aW9uIiwiU2xpZGVyQ29udHJvbHNLZXlib2FyZEhlbHBTZWN0aW9uIiwiVHdvQ29sdW1uS2V5Ym9hcmRIZWxwQ29udGVudCIsImdlb21ldHJpY09wdGljcyIsIkdlb21ldHJpY09wdGljc1N0cmluZ3MiLCJNb3ZlRHJhZ2dhYmxlSXRlbXNLZXlib2FyZEhlbHBTZWN0aW9uIiwiUnVsZXJBbmRNYXJrZXJDb250cm9sc1NlY3Rpb24iLCJHT0tleWJvYXJkSGVscENvbnRlbnQiLCJjb25zdHJ1Y3RvciIsImxlZnRTZWN0aW9ucyIsImhlYWRpbmdTdHJpbmciLCJrZXlib2FyZEhlbHBEaWFsb2ciLCJjaG9vc2VBbk9iamVjdFN0cmluZ1Byb3BlcnR5IiwidGhpbmdBc0xvd2VyQ2FzZVNpbmd1bGFyIiwib2JqZWN0U3RyaW5nUHJvcGVydHkiLCJ0aGluZ0FzTG93ZXJDYXNlUGx1cmFsIiwib2JqZWN0c1N0cmluZ1Byb3BlcnR5IiwicmlnaHRTZWN0aW9ucyIsIndpdGhDaGVja2JveENvbnRlbnQiLCJkaXNwb3NlR09LZXlib2FyZEhlbHBDb250ZW50IiwiZm9yRWFjaCIsInNlY3Rpb24iLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHT0tleWJvYXJkSGVscENvbnRlbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR09LZXlib2FyZEhlbHBDb250ZW50IGlzIHRoZSBjb250ZW50IGZvciB0aGUga2V5Ym9hcmQtaGVscCBkaWFsb2cgaW4gYWxsIHNjcmVlbnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJhc2ljQWN0aW9uc0tleWJvYXJkSGVscFNlY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2tleWJvYXJkL2hlbHAvQmFzaWNBY3Rpb25zS2V5Ym9hcmRIZWxwU2VjdGlvbi5qcyc7XHJcbmltcG9ydCBDb21ib0JveEtleWJvYXJkSGVscFNlY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2tleWJvYXJkL2hlbHAvQ29tYm9Cb3hLZXlib2FyZEhlbHBTZWN0aW9uLmpzJztcclxuaW1wb3J0IFNsaWRlckNvbnRyb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMva2V5Ym9hcmQvaGVscC9TbGlkZXJDb250cm9sc0tleWJvYXJkSGVscFNlY3Rpb24uanMnO1xyXG5pbXBvcnQgVHdvQ29sdW1uS2V5Ym9hcmRIZWxwQ29udGVudCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMva2V5Ym9hcmQvaGVscC9Ud29Db2x1bW5LZXlib2FyZEhlbHBDb250ZW50LmpzJztcclxuaW1wb3J0IGdlb21ldHJpY09wdGljcyBmcm9tICcuLi8uLi9nZW9tZXRyaWNPcHRpY3MuanMnO1xyXG5pbXBvcnQgR2VvbWV0cmljT3B0aWNzU3RyaW5ncyBmcm9tICcuLi8uLi9HZW9tZXRyaWNPcHRpY3NTdHJpbmdzLmpzJztcclxuaW1wb3J0IE1vdmVEcmFnZ2FibGVJdGVtc0tleWJvYXJkSGVscFNlY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2tleWJvYXJkL2hlbHAvTW92ZURyYWdnYWJsZUl0ZW1zS2V5Ym9hcmRIZWxwU2VjdGlvbi5qcyc7XHJcbmltcG9ydCB7IFJ1bGVyQW5kTWFya2VyQ29udHJvbHNTZWN0aW9uIH0gZnJvbSAnLi9SdWxlckFuZE1hcmtlckNvbnRyb2xzU2VjdGlvbi5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHT0tleWJvYXJkSGVscENvbnRlbnQgZXh0ZW5kcyBUd29Db2x1bW5LZXlib2FyZEhlbHBDb250ZW50IHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlR09LZXlib2FyZEhlbHBDb250ZW50OiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgLy8gU2VjdGlvbnMgaW4gdGhlIGxlZnQgY29sdW1uLiBUaGV5IG5lZWQgdG8gYmUgZGlzcG9zZWQuXHJcbiAgICBjb25zdCBsZWZ0U2VjdGlvbnMgPSBbXHJcblxyXG4gICAgICAvLyBNb3ZlIERyYWdnYWJsZSBJdGVtc1xyXG4gICAgICBuZXcgTW92ZURyYWdnYWJsZUl0ZW1zS2V5Ym9hcmRIZWxwU2VjdGlvbigpLFxyXG5cclxuICAgICAgLy8gUnVsZXIgYW5kIE1hcmtlciBDb250cm9sc1xyXG4gICAgICBuZXcgUnVsZXJBbmRNYXJrZXJDb250cm9sc1NlY3Rpb24oKSxcclxuXHJcbiAgICAgIC8vIENob29zZSBhbiBPYmplY3RcclxuICAgICAgbmV3IENvbWJvQm94S2V5Ym9hcmRIZWxwU2VjdGlvbigge1xyXG4gICAgICAgIGhlYWRpbmdTdHJpbmc6IEdlb21ldHJpY09wdGljc1N0cmluZ3Mua2V5Ym9hcmRIZWxwRGlhbG9nLmNob29zZUFuT2JqZWN0U3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgdGhpbmdBc0xvd2VyQ2FzZVNpbmd1bGFyOiBHZW9tZXRyaWNPcHRpY3NTdHJpbmdzLmtleWJvYXJkSGVscERpYWxvZy5vYmplY3RTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICB0aGluZ0FzTG93ZXJDYXNlUGx1cmFsOiBHZW9tZXRyaWNPcHRpY3NTdHJpbmdzLmtleWJvYXJkSGVscERpYWxvZy5vYmplY3RzU3RyaW5nUHJvcGVydHlcclxuICAgICAgfSApXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIFNlY3Rpb25zIGluIHRoZSByaWdodCBjb2x1bW4uIFRoZXkgbmVlZCB0byBiZSBkaXNwb3NlZC5cclxuICAgIGNvbnN0IHJpZ2h0U2VjdGlvbnMgPSBbXHJcblxyXG4gICAgICAvLyBTbGlkZXIgQ29udHJvbHNcclxuICAgICAgbmV3IFNsaWRlckNvbnRyb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbigpLFxyXG5cclxuICAgICAgLy8gQmFzaWMgQWN0aW9uc1xyXG4gICAgICBuZXcgQmFzaWNBY3Rpb25zS2V5Ym9hcmRIZWxwU2VjdGlvbigge1xyXG4gICAgICAgIHdpdGhDaGVja2JveENvbnRlbnQ6IHRydWVcclxuICAgICAgfSApXHJcbiAgICBdO1xyXG5cclxuICAgIHN1cGVyKCBsZWZ0U2VjdGlvbnMsIHJpZ2h0U2VjdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VHT0tleWJvYXJkSGVscENvbnRlbnQgPSAoKSA9PiB7XHJcbiAgICAgIGxlZnRTZWN0aW9ucy5mb3JFYWNoKCBzZWN0aW9uID0+IHNlY3Rpb24uZGlzcG9zZSgpICk7XHJcbiAgICAgIHJpZ2h0U2VjdGlvbnMuZm9yRWFjaCggc2VjdGlvbiA9PiBzZWN0aW9uLmRpc3Bvc2UoKSApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlR09LZXlib2FyZEhlbHBDb250ZW50KCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5nZW9tZXRyaWNPcHRpY3MucmVnaXN0ZXIoICdHT0tleWJvYXJkSGVscENvbnRlbnQnLCBHT0tleWJvYXJkSGVscENvbnRlbnQgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsK0JBQStCLE1BQU0sOEVBQThFO0FBQzFILE9BQU9DLDJCQUEyQixNQUFNLDBFQUEwRTtBQUNsSCxPQUFPQyxpQ0FBaUMsTUFBTSxnRkFBZ0Y7QUFDOUgsT0FBT0MsNEJBQTRCLE1BQU0sMkVBQTJFO0FBQ3BILE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0Msc0JBQXNCLE1BQU0saUNBQWlDO0FBQ3BFLE9BQU9DLHFDQUFxQyxNQUFNLG9GQUFvRjtBQUN0SSxTQUFTQyw2QkFBNkIsUUFBUSxvQ0FBb0M7QUFFbEYsZUFBZSxNQUFNQyxxQkFBcUIsU0FBU0wsNEJBQTRCLENBQUM7RUFJdkVNLFdBQVdBLENBQUEsRUFBRztJQUVuQjtJQUNBLE1BQU1DLFlBQVksR0FBRztJQUVuQjtJQUNBLElBQUlKLHFDQUFxQyxDQUFDLENBQUM7SUFFM0M7SUFDQSxJQUFJQyw2QkFBNkIsQ0FBQyxDQUFDO0lBRW5DO0lBQ0EsSUFBSU4sMkJBQTJCLENBQUU7TUFDL0JVLGFBQWEsRUFBRU4sc0JBQXNCLENBQUNPLGtCQUFrQixDQUFDQyw0QkFBNEI7TUFDckZDLHdCQUF3QixFQUFFVCxzQkFBc0IsQ0FBQ08sa0JBQWtCLENBQUNHLG9CQUFvQjtNQUN4RkMsc0JBQXNCLEVBQUVYLHNCQUFzQixDQUFDTyxrQkFBa0IsQ0FBQ0s7SUFDcEUsQ0FBRSxDQUFDLENBQ0o7O0lBRUQ7SUFDQSxNQUFNQyxhQUFhLEdBQUc7SUFFcEI7SUFDQSxJQUFJaEIsaUNBQWlDLENBQUMsQ0FBQztJQUV2QztJQUNBLElBQUlGLCtCQUErQixDQUFFO01BQ25DbUIsbUJBQW1CLEVBQUU7SUFDdkIsQ0FBRSxDQUFDLENBQ0o7SUFFRCxLQUFLLENBQUVULFlBQVksRUFBRVEsYUFBYyxDQUFDO0lBRXBDLElBQUksQ0FBQ0UsNEJBQTRCLEdBQUcsTUFBTTtNQUN4Q1YsWUFBWSxDQUFDVyxPQUFPLENBQUVDLE9BQU8sSUFBSUEsT0FBTyxDQUFDQyxPQUFPLENBQUMsQ0FBRSxDQUFDO01BQ3BETCxhQUFhLENBQUNHLE9BQU8sQ0FBRUMsT0FBTyxJQUFJQSxPQUFPLENBQUNDLE9BQU8sQ0FBQyxDQUFFLENBQUM7SUFDdkQsQ0FBQztFQUNIO0VBRWdCQSxPQUFPQSxDQUFBLEVBQVM7SUFDOUIsSUFBSSxDQUFDSCw0QkFBNEIsQ0FBQyxDQUFDO0lBQ25DLEtBQUssQ0FBQ0csT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBbkIsZUFBZSxDQUFDb0IsUUFBUSxDQUFFLHVCQUF1QixFQUFFaEIscUJBQXNCLENBQUMifQ==