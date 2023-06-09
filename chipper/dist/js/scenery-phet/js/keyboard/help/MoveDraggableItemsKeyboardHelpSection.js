// Copyright 2023, University of Colorado Boulder

/**
 * MoveDraggableItemsKeyboardHelpSection is the keyboard-help section that describes 2-d draggable items.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import sceneryPhet from '../../sceneryPhet.js';
import KeyboardHelpSection from './KeyboardHelpSection.js';
import KeyboardHelpSectionRow from './KeyboardHelpSectionRow.js';
import SceneryPhetStrings from '../../SceneryPhetStrings.js';
import KeyboardHelpIconFactory from './KeyboardHelpIconFactory.js';

/**
 * MoveDraggableItemsKeyboardHelpSection is the keyboard-help section that describes 2-d draggable items.
 *
 */
class MoveDraggableItemsKeyboardHelpSection extends KeyboardHelpSection {
  constructor() {
    // arrows or WASD
    const wasdOrArrowsIcon = KeyboardHelpIconFactory.arrowOrWasdKeysRowIcon();
    const normalRow = KeyboardHelpSectionRow.labelWithIcon(SceneryPhetStrings.keyboardHelpDialog.moveStringProperty, wasdOrArrowsIcon, {
      labelInnerContent: SceneryPhetStrings.a11y.keyboardHelpDialog.draggableItems.moveDescriptionStringProperty
    });

    // Shift+arrows or Shift+WASD
    const arrowKeysIcon = KeyboardHelpIconFactory.arrowKeysRowIcon();
    const wasdKeysIcon = KeyboardHelpIconFactory.wasdRowIcon();
    const shiftPlusWasdKeysIcon = KeyboardHelpIconFactory.shiftPlusIcon(wasdKeysIcon);
    const shiftPluArrowKeysIcon = KeyboardHelpIconFactory.shiftPlusIcon(arrowKeysIcon);
    const slowerRow = KeyboardHelpSectionRow.labelWithIconList(SceneryPhetStrings.keyboardHelpDialog.moveSlowerStringProperty, [shiftPluArrowKeysIcon, shiftPlusWasdKeysIcon], {
      labelInnerContent: SceneryPhetStrings.a11y.keyboardHelpDialog.draggableItems.moveSlowerDescriptionStringProperty
    });
    super(SceneryPhetStrings.keyboardHelpDialog.moveDraggableItemsStringProperty, [normalRow, slowerRow]);
    this.disposeEmitter.addListener(() => {
      normalRow.dispose();
      slowerRow.dispose();
      wasdOrArrowsIcon.dispose();
      arrowKeysIcon.dispose();
      wasdKeysIcon.dispose();
      shiftPlusWasdKeysIcon.dispose();
      shiftPluArrowKeysIcon.dispose();
    });
  }
}
sceneryPhet.register('MoveDraggableItemsKeyboardHelpSection', MoveDraggableItemsKeyboardHelpSection);
export default MoveDraggableItemsKeyboardHelpSection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzY2VuZXJ5UGhldCIsIktleWJvYXJkSGVscFNlY3Rpb24iLCJLZXlib2FyZEhlbHBTZWN0aW9uUm93IiwiU2NlbmVyeVBoZXRTdHJpbmdzIiwiS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkiLCJNb3ZlRHJhZ2dhYmxlSXRlbXNLZXlib2FyZEhlbHBTZWN0aW9uIiwiY29uc3RydWN0b3IiLCJ3YXNkT3JBcnJvd3NJY29uIiwiYXJyb3dPcldhc2RLZXlzUm93SWNvbiIsIm5vcm1hbFJvdyIsImxhYmVsV2l0aEljb24iLCJrZXlib2FyZEhlbHBEaWFsb2ciLCJtb3ZlU3RyaW5nUHJvcGVydHkiLCJsYWJlbElubmVyQ29udGVudCIsImExMXkiLCJkcmFnZ2FibGVJdGVtcyIsIm1vdmVEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5IiwiYXJyb3dLZXlzSWNvbiIsImFycm93S2V5c1Jvd0ljb24iLCJ3YXNkS2V5c0ljb24iLCJ3YXNkUm93SWNvbiIsInNoaWZ0UGx1c1dhc2RLZXlzSWNvbiIsInNoaWZ0UGx1c0ljb24iLCJzaGlmdFBsdUFycm93S2V5c0ljb24iLCJzbG93ZXJSb3ciLCJsYWJlbFdpdGhJY29uTGlzdCIsIm1vdmVTbG93ZXJTdHJpbmdQcm9wZXJ0eSIsIm1vdmVTbG93ZXJEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5IiwibW92ZURyYWdnYWJsZUl0ZW1zU3RyaW5nUHJvcGVydHkiLCJkaXNwb3NlRW1pdHRlciIsImFkZExpc3RlbmVyIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTW92ZURyYWdnYWJsZUl0ZW1zS2V5Ym9hcmRIZWxwU2VjdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW92ZURyYWdnYWJsZUl0ZW1zS2V5Ym9hcmRIZWxwU2VjdGlvbiBpcyB0aGUga2V5Ym9hcmQtaGVscCBzZWN0aW9uIHRoYXQgZGVzY3JpYmVzIDItZCBkcmFnZ2FibGUgaXRlbXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vLi4vc2NlbmVyeVBoZXQuanMnO1xyXG5pbXBvcnQgS2V5Ym9hcmRIZWxwU2VjdGlvbiBmcm9tICcuL0tleWJvYXJkSGVscFNlY3Rpb24uanMnO1xyXG5pbXBvcnQgS2V5Ym9hcmRIZWxwU2VjdGlvblJvdyBmcm9tICcuL0tleWJvYXJkSGVscFNlY3Rpb25Sb3cuanMnO1xyXG5pbXBvcnQgU2NlbmVyeVBoZXRTdHJpbmdzIGZyb20gJy4uLy4uL1NjZW5lcnlQaGV0U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBLZXlib2FyZEhlbHBJY29uRmFjdG9yeSBmcm9tICcuL0tleWJvYXJkSGVscEljb25GYWN0b3J5LmpzJztcclxuXHJcbi8qKlxyXG4gKiBNb3ZlRHJhZ2dhYmxlSXRlbXNLZXlib2FyZEhlbHBTZWN0aW9uIGlzIHRoZSBrZXlib2FyZC1oZWxwIHNlY3Rpb24gdGhhdCBkZXNjcmliZXMgMi1kIGRyYWdnYWJsZSBpdGVtcy5cclxuICpcclxuICovXHJcbmNsYXNzIE1vdmVEcmFnZ2FibGVJdGVtc0tleWJvYXJkSGVscFNlY3Rpb24gZXh0ZW5kcyBLZXlib2FyZEhlbHBTZWN0aW9uIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIC8vIGFycm93cyBvciBXQVNEXHJcbiAgICBjb25zdCB3YXNkT3JBcnJvd3NJY29uID0gS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuYXJyb3dPcldhc2RLZXlzUm93SWNvbigpO1xyXG4gICAgY29uc3Qgbm9ybWFsUm93ID0gS2V5Ym9hcmRIZWxwU2VjdGlvblJvdy5sYWJlbFdpdGhJY29uKCBTY2VuZXJ5UGhldFN0cmluZ3Mua2V5Ym9hcmRIZWxwRGlhbG9nLm1vdmVTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgd2FzZE9yQXJyb3dzSWNvbiwge1xyXG4gICAgICAgIGxhYmVsSW5uZXJDb250ZW50OiBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5rZXlib2FyZEhlbHBEaWFsb2cuZHJhZ2dhYmxlSXRlbXMubW92ZURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHlcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIFNoaWZ0K2Fycm93cyBvciBTaGlmdCtXQVNEXHJcbiAgICBjb25zdCBhcnJvd0tleXNJY29uID0gS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuYXJyb3dLZXlzUm93SWNvbigpO1xyXG4gICAgY29uc3Qgd2FzZEtleXNJY29uID0gS2V5Ym9hcmRIZWxwSWNvbkZhY3Rvcnkud2FzZFJvd0ljb24oKTtcclxuICAgIGNvbnN0IHNoaWZ0UGx1c1dhc2RLZXlzSWNvbiA9IEtleWJvYXJkSGVscEljb25GYWN0b3J5LnNoaWZ0UGx1c0ljb24oIHdhc2RLZXlzSWNvbiApO1xyXG4gICAgY29uc3Qgc2hpZnRQbHVBcnJvd0tleXNJY29uID0gS2V5Ym9hcmRIZWxwSWNvbkZhY3Rvcnkuc2hpZnRQbHVzSWNvbiggYXJyb3dLZXlzSWNvbiApO1xyXG4gICAgY29uc3Qgc2xvd2VyUm93ID0gS2V5Ym9hcmRIZWxwU2VjdGlvblJvdy5sYWJlbFdpdGhJY29uTGlzdCggU2NlbmVyeVBoZXRTdHJpbmdzLmtleWJvYXJkSGVscERpYWxvZy5tb3ZlU2xvd2VyU3RyaW5nUHJvcGVydHksIFtcclxuICAgICAgc2hpZnRQbHVBcnJvd0tleXNJY29uLFxyXG4gICAgICBzaGlmdFBsdXNXYXNkS2V5c0ljb25cclxuICAgIF0sIHtcclxuICAgICAgbGFiZWxJbm5lckNvbnRlbnQ6IFNjZW5lcnlQaGV0U3RyaW5ncy5hMTF5LmtleWJvYXJkSGVscERpYWxvZy5kcmFnZ2FibGVJdGVtcy5tb3ZlU2xvd2VyRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBTY2VuZXJ5UGhldFN0cmluZ3Mua2V5Ym9hcmRIZWxwRGlhbG9nLm1vdmVEcmFnZ2FibGVJdGVtc1N0cmluZ1Byb3BlcnR5LCBbIG5vcm1hbFJvdywgc2xvd2VyUm93IF0gKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIG5vcm1hbFJvdy5kaXNwb3NlKCk7XHJcbiAgICAgIHNsb3dlclJvdy5kaXNwb3NlKCk7XHJcbiAgICAgIHdhc2RPckFycm93c0ljb24uZGlzcG9zZSgpO1xyXG4gICAgICBhcnJvd0tleXNJY29uLmRpc3Bvc2UoKTtcclxuICAgICAgd2FzZEtleXNJY29uLmRpc3Bvc2UoKTtcclxuICAgICAgc2hpZnRQbHVzV2FzZEtleXNJY29uLmRpc3Bvc2UoKTtcclxuICAgICAgc2hpZnRQbHVBcnJvd0tleXNJY29uLmRpc3Bvc2UoKTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnTW92ZURyYWdnYWJsZUl0ZW1zS2V5Ym9hcmRIZWxwU2VjdGlvbicsIE1vdmVEcmFnZ2FibGVJdGVtc0tleWJvYXJkSGVscFNlY3Rpb24gKTtcclxuZXhwb3J0IGRlZmF1bHQgTW92ZURyYWdnYWJsZUl0ZW1zS2V5Ym9hcmRIZWxwU2VjdGlvbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQyxtQkFBbUIsTUFBTSwwQkFBMEI7QUFDMUQsT0FBT0Msc0JBQXNCLE1BQU0sNkJBQTZCO0FBQ2hFLE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyx1QkFBdUIsTUFBTSw4QkFBOEI7O0FBRWxFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTUMscUNBQXFDLFNBQVNKLG1CQUFtQixDQUFDO0VBRS9ESyxXQUFXQSxDQUFBLEVBQUc7SUFFbkI7SUFDQSxNQUFNQyxnQkFBZ0IsR0FBR0gsdUJBQXVCLENBQUNJLHNCQUFzQixDQUFDLENBQUM7SUFDekUsTUFBTUMsU0FBUyxHQUFHUCxzQkFBc0IsQ0FBQ1EsYUFBYSxDQUFFUCxrQkFBa0IsQ0FBQ1Esa0JBQWtCLENBQUNDLGtCQUFrQixFQUM5R0wsZ0JBQWdCLEVBQUU7TUFDaEJNLGlCQUFpQixFQUFFVixrQkFBa0IsQ0FBQ1csSUFBSSxDQUFDSCxrQkFBa0IsQ0FBQ0ksY0FBYyxDQUFDQztJQUMvRSxDQUFFLENBQUM7O0lBRUw7SUFDQSxNQUFNQyxhQUFhLEdBQUdiLHVCQUF1QixDQUFDYyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2hFLE1BQU1DLFlBQVksR0FBR2YsdUJBQXVCLENBQUNnQixXQUFXLENBQUMsQ0FBQztJQUMxRCxNQUFNQyxxQkFBcUIsR0FBR2pCLHVCQUF1QixDQUFDa0IsYUFBYSxDQUFFSCxZQUFhLENBQUM7SUFDbkYsTUFBTUkscUJBQXFCLEdBQUduQix1QkFBdUIsQ0FBQ2tCLGFBQWEsQ0FBRUwsYUFBYyxDQUFDO0lBQ3BGLE1BQU1PLFNBQVMsR0FBR3RCLHNCQUFzQixDQUFDdUIsaUJBQWlCLENBQUV0QixrQkFBa0IsQ0FBQ1Esa0JBQWtCLENBQUNlLHdCQUF3QixFQUFFLENBQzFISCxxQkFBcUIsRUFDckJGLHFCQUFxQixDQUN0QixFQUFFO01BQ0RSLGlCQUFpQixFQUFFVixrQkFBa0IsQ0FBQ1csSUFBSSxDQUFDSCxrQkFBa0IsQ0FBQ0ksY0FBYyxDQUFDWTtJQUMvRSxDQUFFLENBQUM7SUFFSCxLQUFLLENBQUV4QixrQkFBa0IsQ0FBQ1Esa0JBQWtCLENBQUNpQixnQ0FBZ0MsRUFBRSxDQUFFbkIsU0FBUyxFQUFFZSxTQUFTLENBQUcsQ0FBQztJQUV6RyxJQUFJLENBQUNLLGNBQWMsQ0FBQ0MsV0FBVyxDQUFFLE1BQU07TUFDckNyQixTQUFTLENBQUNzQixPQUFPLENBQUMsQ0FBQztNQUNuQlAsU0FBUyxDQUFDTyxPQUFPLENBQUMsQ0FBQztNQUNuQnhCLGdCQUFnQixDQUFDd0IsT0FBTyxDQUFDLENBQUM7TUFDMUJkLGFBQWEsQ0FBQ2MsT0FBTyxDQUFDLENBQUM7TUFDdkJaLFlBQVksQ0FBQ1ksT0FBTyxDQUFDLENBQUM7TUFDdEJWLHFCQUFxQixDQUFDVSxPQUFPLENBQUMsQ0FBQztNQUMvQlIscUJBQXFCLENBQUNRLE9BQU8sQ0FBQyxDQUFDO0lBQ2pDLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQS9CLFdBQVcsQ0FBQ2dDLFFBQVEsQ0FBRSx1Q0FBdUMsRUFBRTNCLHFDQUFzQyxDQUFDO0FBQ3RHLGVBQWVBLHFDQUFxQyJ9