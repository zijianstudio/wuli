// Copyright 2023, University of Colorado Boulder

/**
 * Help content for the KeyboardHelpDialog describing how to change the shape by moving sides and vertices.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import quadrilateral from '../../quadrilateral.js';
import QuadrilateralStrings from '../../QuadrilateralStrings.js';
import { Text } from '../../../../scenery/js/imports.js';
import QuadrilateralKeyboardHelpContent from './QuadrilateralKeyboardHelpContent.js';

// constants - Voicing strings not translatable
const moveShapeDescriptionStringProperty = QuadrilateralStrings.a11y.keyboardHelpDialog.moveShapeDescriptionStringProperty;
const smallerStepsDescriptionStringProperty = QuadrilateralStrings.a11y.keyboardHelpDialog.smallerStepsDescriptionStringProperty;
const moveACornerOrSideStringProperty = QuadrilateralStrings.keyboardHelpDialog.moveCornerOrSideStringProperty;
const moveInSmallerStepsStringProperty = QuadrilateralStrings.keyboardHelpDialog.moveInSmallerStepsStringProperty;
const mouseStringProperty = QuadrilateralStrings.keyboardHelpDialog.mouseStringProperty;
const moveCornersOrSidesStringProperty = QuadrilateralStrings.keyboardHelpDialog.moveCornersOrSidesStringProperty;
export default class MoveShapeHelpSection extends KeyboardHelpSection {
  constructor() {
    // basic movement
    const basicMovementRow = KeyboardHelpSectionRow.labelWithIcon(moveACornerOrSideStringProperty, KeyboardHelpIconFactory.arrowOrWasdKeysRowIcon(), {
      labelInnerContent: moveShapeDescriptionStringProperty
    });

    // fine-grained movement
    const fineMovementRow = KeyboardHelpSectionRow.labelWithIconList(moveInSmallerStepsStringProperty, [KeyboardHelpIconFactory.shiftPlusIcon(KeyboardHelpIconFactory.arrowKeysRowIcon()), KeyboardHelpIconFactory.shiftPlusIcon(KeyboardHelpIconFactory.wasdRowIcon()), KeyboardHelpIconFactory.shiftPlusIcon(new Text(mouseStringProperty, {
      font: KeyboardHelpSectionRow.LABEL_FONT,
      maxWidth: 100 // by inspection
    }))], {
      labelOptions: {
        lineWrap: QuadrilateralKeyboardHelpContent.LABEL_LINE_WRAP
      },
      labelInnerContent: smallerStepsDescriptionStringProperty
    });
    const rows = [basicMovementRow, fineMovementRow];
    super(moveCornersOrSidesStringProperty, rows);
    this.disposeEmitter.addListener(() => rows.forEach(row => row.dispose()));
  }
}
quadrilateral.register('MoveShapeHelpSection', MoveShapeHelpSection);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLZXlib2FyZEhlbHBJY29uRmFjdG9yeSIsIktleWJvYXJkSGVscFNlY3Rpb24iLCJLZXlib2FyZEhlbHBTZWN0aW9uUm93IiwicXVhZHJpbGF0ZXJhbCIsIlF1YWRyaWxhdGVyYWxTdHJpbmdzIiwiVGV4dCIsIlF1YWRyaWxhdGVyYWxLZXlib2FyZEhlbHBDb250ZW50IiwibW92ZVNoYXBlRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsImExMXkiLCJrZXlib2FyZEhlbHBEaWFsb2ciLCJzbWFsbGVyU3RlcHNEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5IiwibW92ZUFDb3JuZXJPclNpZGVTdHJpbmdQcm9wZXJ0eSIsIm1vdmVDb3JuZXJPclNpZGVTdHJpbmdQcm9wZXJ0eSIsIm1vdmVJblNtYWxsZXJTdGVwc1N0cmluZ1Byb3BlcnR5IiwibW91c2VTdHJpbmdQcm9wZXJ0eSIsIm1vdmVDb3JuZXJzT3JTaWRlc1N0cmluZ1Byb3BlcnR5IiwiTW92ZVNoYXBlSGVscFNlY3Rpb24iLCJjb25zdHJ1Y3RvciIsImJhc2ljTW92ZW1lbnRSb3ciLCJsYWJlbFdpdGhJY29uIiwiYXJyb3dPcldhc2RLZXlzUm93SWNvbiIsImxhYmVsSW5uZXJDb250ZW50IiwiZmluZU1vdmVtZW50Um93IiwibGFiZWxXaXRoSWNvbkxpc3QiLCJzaGlmdFBsdXNJY29uIiwiYXJyb3dLZXlzUm93SWNvbiIsIndhc2RSb3dJY29uIiwiZm9udCIsIkxBQkVMX0ZPTlQiLCJtYXhXaWR0aCIsImxhYmVsT3B0aW9ucyIsImxpbmVXcmFwIiwiTEFCRUxfTElORV9XUkFQIiwicm93cyIsImRpc3Bvc2VFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJmb3JFYWNoIiwicm93IiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTW92ZVNoYXBlSGVscFNlY3Rpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEhlbHAgY29udGVudCBmb3IgdGhlIEtleWJvYXJkSGVscERpYWxvZyBkZXNjcmliaW5nIGhvdyB0byBjaGFuZ2UgdGhlIHNoYXBlIGJ5IG1vdmluZyBzaWRlcyBhbmQgdmVydGljZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBLZXlib2FyZEhlbHBJY29uRmFjdG9yeSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMva2V5Ym9hcmQvaGVscC9LZXlib2FyZEhlbHBJY29uRmFjdG9yeS5qcyc7XHJcbmltcG9ydCBLZXlib2FyZEhlbHBTZWN0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9oZWxwL0tleWJvYXJkSGVscFNlY3Rpb24uanMnO1xyXG5pbXBvcnQgS2V5Ym9hcmRIZWxwU2VjdGlvblJvdyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMva2V5Ym9hcmQvaGVscC9LZXlib2FyZEhlbHBTZWN0aW9uUm93LmpzJztcclxuaW1wb3J0IHF1YWRyaWxhdGVyYWwgZnJvbSAnLi4vLi4vcXVhZHJpbGF0ZXJhbC5qcyc7XHJcbmltcG9ydCBRdWFkcmlsYXRlcmFsU3RyaW5ncyBmcm9tICcuLi8uLi9RdWFkcmlsYXRlcmFsU3RyaW5ncy5qcyc7XHJcbmltcG9ydCB7IFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUXVhZHJpbGF0ZXJhbEtleWJvYXJkSGVscENvbnRlbnQgZnJvbSAnLi9RdWFkcmlsYXRlcmFsS2V5Ym9hcmRIZWxwQ29udGVudC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHMgLSBWb2ljaW5nIHN0cmluZ3Mgbm90IHRyYW5zbGF0YWJsZVxyXG5jb25zdCBtb3ZlU2hhcGVEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5ID0gUXVhZHJpbGF0ZXJhbFN0cmluZ3MuYTExeS5rZXlib2FyZEhlbHBEaWFsb2cubW92ZVNoYXBlRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc21hbGxlclN0ZXBzRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSA9IFF1YWRyaWxhdGVyYWxTdHJpbmdzLmExMXkua2V5Ym9hcmRIZWxwRGlhbG9nLnNtYWxsZXJTdGVwc0Rlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IG1vdmVBQ29ybmVyT3JTaWRlU3RyaW5nUHJvcGVydHkgPSBRdWFkcmlsYXRlcmFsU3RyaW5ncy5rZXlib2FyZEhlbHBEaWFsb2cubW92ZUNvcm5lck9yU2lkZVN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBtb3ZlSW5TbWFsbGVyU3RlcHNTdHJpbmdQcm9wZXJ0eSA9IFF1YWRyaWxhdGVyYWxTdHJpbmdzLmtleWJvYXJkSGVscERpYWxvZy5tb3ZlSW5TbWFsbGVyU3RlcHNTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgbW91c2VTdHJpbmdQcm9wZXJ0eSA9IFF1YWRyaWxhdGVyYWxTdHJpbmdzLmtleWJvYXJkSGVscERpYWxvZy5tb3VzZVN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBtb3ZlQ29ybmVyc09yU2lkZXNTdHJpbmdQcm9wZXJ0eSA9IFF1YWRyaWxhdGVyYWxTdHJpbmdzLmtleWJvYXJkSGVscERpYWxvZy5tb3ZlQ29ybmVyc09yU2lkZXNTdHJpbmdQcm9wZXJ0eTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vdmVTaGFwZUhlbHBTZWN0aW9uIGV4dGVuZHMgS2V5Ym9hcmRIZWxwU2VjdGlvbiB7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIC8vIGJhc2ljIG1vdmVtZW50XHJcbiAgICBjb25zdCBiYXNpY01vdmVtZW50Um93ID0gS2V5Ym9hcmRIZWxwU2VjdGlvblJvdy5sYWJlbFdpdGhJY29uKFxyXG4gICAgICBtb3ZlQUNvcm5lck9yU2lkZVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5hcnJvd09yV2FzZEtleXNSb3dJY29uKCksXHJcbiAgICAgIHtcclxuICAgICAgICBsYWJlbElubmVyQ29udGVudDogbW92ZVNoYXBlRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eVxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIGZpbmUtZ3JhaW5lZCBtb3ZlbWVudFxyXG4gICAgY29uc3QgZmluZU1vdmVtZW50Um93ID0gS2V5Ym9hcmRIZWxwU2VjdGlvblJvdy5sYWJlbFdpdGhJY29uTGlzdChcclxuICAgICAgbW92ZUluU21hbGxlclN0ZXBzU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIFtcclxuICAgICAgICBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5zaGlmdFBsdXNJY29uKCBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5hcnJvd0tleXNSb3dJY29uKCkgKSxcclxuICAgICAgICBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5zaGlmdFBsdXNJY29uKCBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS53YXNkUm93SWNvbigpICksXHJcbiAgICAgICAgS2V5Ym9hcmRIZWxwSWNvbkZhY3Rvcnkuc2hpZnRQbHVzSWNvbiggbmV3IFRleHQoIG1vdXNlU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICAgIGZvbnQ6IEtleWJvYXJkSGVscFNlY3Rpb25Sb3cuTEFCRUxfRk9OVCxcclxuICAgICAgICAgIG1heFdpZHRoOiAxMDAgLy8gYnkgaW5zcGVjdGlvblxyXG4gICAgICAgIH0gKSApXHJcbiAgICAgIF0sIHtcclxuICAgICAgICBsYWJlbE9wdGlvbnM6IHtcclxuICAgICAgICAgIGxpbmVXcmFwOiBRdWFkcmlsYXRlcmFsS2V5Ym9hcmRIZWxwQ29udGVudC5MQUJFTF9MSU5FX1dSQVBcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxhYmVsSW5uZXJDb250ZW50OiBzbWFsbGVyU3RlcHNEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5XHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgY29uc3Qgcm93cyA9IFsgYmFzaWNNb3ZlbWVudFJvdywgZmluZU1vdmVtZW50Um93IF07XHJcbiAgICBzdXBlciggbW92ZUNvcm5lcnNPclNpZGVzU3RyaW5nUHJvcGVydHksIHJvd3MgKTtcclxuICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHJvd3MuZm9yRWFjaCggcm93ID0+IHJvdy5kaXNwb3NlKCkgKSApO1xyXG5cclxuICB9XHJcbn1cclxuXHJcbnF1YWRyaWxhdGVyYWwucmVnaXN0ZXIoICdNb3ZlU2hhcGVIZWxwU2VjdGlvbicsIE1vdmVTaGFwZUhlbHBTZWN0aW9uICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSx1QkFBdUIsTUFBTSxzRUFBc0U7QUFDMUcsT0FBT0MsbUJBQW1CLE1BQU0sa0VBQWtFO0FBQ2xHLE9BQU9DLHNCQUFzQixNQUFNLHFFQUFxRTtBQUN4RyxPQUFPQyxhQUFhLE1BQU0sd0JBQXdCO0FBQ2xELE9BQU9DLG9CQUFvQixNQUFNLCtCQUErQjtBQUNoRSxTQUFTQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLGdDQUFnQyxNQUFNLHVDQUF1Qzs7QUFFcEY7QUFDQSxNQUFNQyxrQ0FBa0MsR0FBR0gsb0JBQW9CLENBQUNJLElBQUksQ0FBQ0Msa0JBQWtCLENBQUNGLGtDQUFrQztBQUMxSCxNQUFNRyxxQ0FBcUMsR0FBR04sb0JBQW9CLENBQUNJLElBQUksQ0FBQ0Msa0JBQWtCLENBQUNDLHFDQUFxQztBQUNoSSxNQUFNQywrQkFBK0IsR0FBR1Asb0JBQW9CLENBQUNLLGtCQUFrQixDQUFDRyw4QkFBOEI7QUFDOUcsTUFBTUMsZ0NBQWdDLEdBQUdULG9CQUFvQixDQUFDSyxrQkFBa0IsQ0FBQ0ksZ0NBQWdDO0FBQ2pILE1BQU1DLG1CQUFtQixHQUFHVixvQkFBb0IsQ0FBQ0ssa0JBQWtCLENBQUNLLG1CQUFtQjtBQUN2RixNQUFNQyxnQ0FBZ0MsR0FBR1gsb0JBQW9CLENBQUNLLGtCQUFrQixDQUFDTSxnQ0FBZ0M7QUFFakgsZUFBZSxNQUFNQyxvQkFBb0IsU0FBU2YsbUJBQW1CLENBQUM7RUFDN0RnQixXQUFXQSxDQUFBLEVBQUc7SUFFbkI7SUFDQSxNQUFNQyxnQkFBZ0IsR0FBR2hCLHNCQUFzQixDQUFDaUIsYUFBYSxDQUMzRFIsK0JBQStCLEVBQy9CWCx1QkFBdUIsQ0FBQ29CLHNCQUFzQixDQUFDLENBQUMsRUFDaEQ7TUFDRUMsaUJBQWlCLEVBQUVkO0lBQ3JCLENBQ0YsQ0FBQzs7SUFFRDtJQUNBLE1BQU1lLGVBQWUsR0FBR3BCLHNCQUFzQixDQUFDcUIsaUJBQWlCLENBQzlEVixnQ0FBZ0MsRUFDaEMsQ0FDRWIsdUJBQXVCLENBQUN3QixhQUFhLENBQUV4Qix1QkFBdUIsQ0FBQ3lCLGdCQUFnQixDQUFDLENBQUUsQ0FBQyxFQUNuRnpCLHVCQUF1QixDQUFDd0IsYUFBYSxDQUFFeEIsdUJBQXVCLENBQUMwQixXQUFXLENBQUMsQ0FBRSxDQUFDLEVBQzlFMUIsdUJBQXVCLENBQUN3QixhQUFhLENBQUUsSUFBSW5CLElBQUksQ0FBRVMsbUJBQW1CLEVBQUU7TUFDcEVhLElBQUksRUFBRXpCLHNCQUFzQixDQUFDMEIsVUFBVTtNQUN2Q0MsUUFBUSxFQUFFLEdBQUcsQ0FBQztJQUNoQixDQUFFLENBQUUsQ0FBQyxDQUNOLEVBQUU7TUFDREMsWUFBWSxFQUFFO1FBQ1pDLFFBQVEsRUFBRXpCLGdDQUFnQyxDQUFDMEI7TUFDN0MsQ0FBQztNQUNEWCxpQkFBaUIsRUFBRVg7SUFDckIsQ0FDRixDQUFDO0lBRUQsTUFBTXVCLElBQUksR0FBRyxDQUFFZixnQkFBZ0IsRUFBRUksZUFBZSxDQUFFO0lBQ2xELEtBQUssQ0FBRVAsZ0NBQWdDLEVBQUVrQixJQUFLLENBQUM7SUFDL0MsSUFBSSxDQUFDQyxjQUFjLENBQUNDLFdBQVcsQ0FBRSxNQUFNRixJQUFJLENBQUNHLE9BQU8sQ0FBRUMsR0FBRyxJQUFJQSxHQUFHLENBQUNDLE9BQU8sQ0FBQyxDQUFFLENBQUUsQ0FBQztFQUUvRTtBQUNGO0FBRUFuQyxhQUFhLENBQUNvQyxRQUFRLENBQUUsc0JBQXNCLEVBQUV2QixvQkFBcUIsQ0FBQyJ9