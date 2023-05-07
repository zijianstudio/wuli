// Copyright 2016-2022, University of Colorado Boulder

/**
 * Content for the "Keyboard Shortcuts" dialog that can be brought up from the sim navigation bar.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BasicActionsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import johnTravoltage from '../../johnTravoltage.js';
import JohnTravoltageStrings from '../../JohnTravoltageStrings.js';
const handOrFootString = JohnTravoltageStrings.handOrFoot;
const moveFootString = JohnTravoltageStrings.moveFoot;
const moveHandString = JohnTravoltageStrings.moveHand;
const moveFootDescriptionString = JohnTravoltageStrings.a11y.keyboardHelpDialog.moveFootDescription;
const moveHandDescriptionString = JohnTravoltageStrings.a11y.keyboardHelpDialog.moveHandDescription;
class JohnTravoltageKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  constructor() {
    // help sections specific to john-travoltage, moving the arm and leg
    const appendageHelpSection = new KeyboardHelpSection(handOrFootString, [KeyboardHelpSectionRow.labelWithIcon(moveFootString, KeyboardHelpIconFactory.leftRightArrowKeysRowIcon(), {
      labelInnerContent: moveFootDescriptionString
    }), KeyboardHelpSectionRow.labelWithIcon(moveHandString, KeyboardHelpIconFactory.upDownArrowKeysRowIcon(), {
      labelInnerContent: moveHandDescriptionString
    })]);

    // section for general content to interacti with common components
    const basicActionsHelpSection = new BasicActionsKeyboardHelpSection();
    super([appendageHelpSection], [basicActionsHelpSection]);
  }
}
johnTravoltage.register('JohnTravoltageKeyboardHelpContent', JohnTravoltageKeyboardHelpContent);
export default JohnTravoltageKeyboardHelpContent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCYXNpY0FjdGlvbnNLZXlib2FyZEhlbHBTZWN0aW9uIiwiS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkiLCJLZXlib2FyZEhlbHBTZWN0aW9uIiwiS2V5Ym9hcmRIZWxwU2VjdGlvblJvdyIsIlR3b0NvbHVtbktleWJvYXJkSGVscENvbnRlbnQiLCJqb2huVHJhdm9sdGFnZSIsIkpvaG5UcmF2b2x0YWdlU3RyaW5ncyIsImhhbmRPckZvb3RTdHJpbmciLCJoYW5kT3JGb290IiwibW92ZUZvb3RTdHJpbmciLCJtb3ZlRm9vdCIsIm1vdmVIYW5kU3RyaW5nIiwibW92ZUhhbmQiLCJtb3ZlRm9vdERlc2NyaXB0aW9uU3RyaW5nIiwiYTExeSIsImtleWJvYXJkSGVscERpYWxvZyIsIm1vdmVGb290RGVzY3JpcHRpb24iLCJtb3ZlSGFuZERlc2NyaXB0aW9uU3RyaW5nIiwibW92ZUhhbmREZXNjcmlwdGlvbiIsIkpvaG5UcmF2b2x0YWdlS2V5Ym9hcmRIZWxwQ29udGVudCIsImNvbnN0cnVjdG9yIiwiYXBwZW5kYWdlSGVscFNlY3Rpb24iLCJsYWJlbFdpdGhJY29uIiwibGVmdFJpZ2h0QXJyb3dLZXlzUm93SWNvbiIsImxhYmVsSW5uZXJDb250ZW50IiwidXBEb3duQXJyb3dLZXlzUm93SWNvbiIsImJhc2ljQWN0aW9uc0hlbHBTZWN0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJKb2huVHJhdm9sdGFnZUtleWJvYXJkSGVscENvbnRlbnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29udGVudCBmb3IgdGhlIFwiS2V5Ym9hcmQgU2hvcnRjdXRzXCIgZGlhbG9nIHRoYXQgY2FuIGJlIGJyb3VnaHQgdXAgZnJvbSB0aGUgc2ltIG5hdmlnYXRpb24gYmFyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQmFzaWNBY3Rpb25zS2V5Ym9hcmRIZWxwU2VjdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMva2V5Ym9hcmQvaGVscC9CYXNpY0FjdGlvbnNLZXlib2FyZEhlbHBTZWN0aW9uLmpzJztcclxuaW1wb3J0IEtleWJvYXJkSGVscEljb25GYWN0b3J5IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9oZWxwL0tleWJvYXJkSGVscEljb25GYWN0b3J5LmpzJztcclxuaW1wb3J0IEtleWJvYXJkSGVscFNlY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2tleWJvYXJkL2hlbHAvS2V5Ym9hcmRIZWxwU2VjdGlvbi5qcyc7XHJcbmltcG9ydCBLZXlib2FyZEhlbHBTZWN0aW9uUm93IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9oZWxwL0tleWJvYXJkSGVscFNlY3Rpb25Sb3cuanMnO1xyXG5pbXBvcnQgVHdvQ29sdW1uS2V5Ym9hcmRIZWxwQ29udGVudCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMva2V5Ym9hcmQvaGVscC9Ud29Db2x1bW5LZXlib2FyZEhlbHBDb250ZW50LmpzJztcclxuaW1wb3J0IGpvaG5UcmF2b2x0YWdlIGZyb20gJy4uLy4uL2pvaG5UcmF2b2x0YWdlLmpzJztcclxuaW1wb3J0IEpvaG5UcmF2b2x0YWdlU3RyaW5ncyBmcm9tICcuLi8uLi9Kb2huVHJhdm9sdGFnZVN0cmluZ3MuanMnO1xyXG5cclxuY29uc3QgaGFuZE9yRm9vdFN0cmluZyA9IEpvaG5UcmF2b2x0YWdlU3RyaW5ncy5oYW5kT3JGb290O1xyXG5jb25zdCBtb3ZlRm9vdFN0cmluZyA9IEpvaG5UcmF2b2x0YWdlU3RyaW5ncy5tb3ZlRm9vdDtcclxuY29uc3QgbW92ZUhhbmRTdHJpbmcgPSBKb2huVHJhdm9sdGFnZVN0cmluZ3MubW92ZUhhbmQ7XHJcblxyXG5jb25zdCBtb3ZlRm9vdERlc2NyaXB0aW9uU3RyaW5nID0gSm9oblRyYXZvbHRhZ2VTdHJpbmdzLmExMXkua2V5Ym9hcmRIZWxwRGlhbG9nLm1vdmVGb290RGVzY3JpcHRpb247XHJcbmNvbnN0IG1vdmVIYW5kRGVzY3JpcHRpb25TdHJpbmcgPSBKb2huVHJhdm9sdGFnZVN0cmluZ3MuYTExeS5rZXlib2FyZEhlbHBEaWFsb2cubW92ZUhhbmREZXNjcmlwdGlvbjtcclxuXHJcbmNsYXNzIEpvaG5UcmF2b2x0YWdlS2V5Ym9hcmRIZWxwQ29udGVudCBleHRlbmRzIFR3b0NvbHVtbktleWJvYXJkSGVscENvbnRlbnQge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIC8vIGhlbHAgc2VjdGlvbnMgc3BlY2lmaWMgdG8gam9obi10cmF2b2x0YWdlLCBtb3ZpbmcgdGhlIGFybSBhbmQgbGVnXHJcbiAgICBjb25zdCBhcHBlbmRhZ2VIZWxwU2VjdGlvbiA9IG5ldyBLZXlib2FyZEhlbHBTZWN0aW9uKCBoYW5kT3JGb290U3RyaW5nLCBbXHJcbiAgICAgIEtleWJvYXJkSGVscFNlY3Rpb25Sb3cubGFiZWxXaXRoSWNvbihcclxuICAgICAgICBtb3ZlRm9vdFN0cmluZyxcclxuICAgICAgICBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5sZWZ0UmlnaHRBcnJvd0tleXNSb3dJY29uKCksIHtcclxuICAgICAgICAgIGxhYmVsSW5uZXJDb250ZW50OiBtb3ZlRm9vdERlc2NyaXB0aW9uU3RyaW5nXHJcbiAgICAgICAgfVxyXG4gICAgICApLFxyXG4gICAgICBLZXlib2FyZEhlbHBTZWN0aW9uUm93LmxhYmVsV2l0aEljb24oXHJcbiAgICAgICAgbW92ZUhhbmRTdHJpbmcsXHJcbiAgICAgICAgS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkudXBEb3duQXJyb3dLZXlzUm93SWNvbigpLCB7XHJcbiAgICAgICAgICBsYWJlbElubmVyQ29udGVudDogbW92ZUhhbmREZXNjcmlwdGlvblN0cmluZ1xyXG4gICAgICAgIH1cclxuICAgICAgKVxyXG4gICAgXSApO1xyXG5cclxuICAgIC8vIHNlY3Rpb24gZm9yIGdlbmVyYWwgY29udGVudCB0byBpbnRlcmFjdGkgd2l0aCBjb21tb24gY29tcG9uZW50c1xyXG4gICAgY29uc3QgYmFzaWNBY3Rpb25zSGVscFNlY3Rpb24gPSBuZXcgQmFzaWNBY3Rpb25zS2V5Ym9hcmRIZWxwU2VjdGlvbigpO1xyXG5cclxuICAgIHN1cGVyKCBbIGFwcGVuZGFnZUhlbHBTZWN0aW9uIF0sIFsgYmFzaWNBY3Rpb25zSGVscFNlY3Rpb24gXSApO1xyXG4gIH1cclxufVxyXG5cclxuam9oblRyYXZvbHRhZ2UucmVnaXN0ZXIoICdKb2huVHJhdm9sdGFnZUtleWJvYXJkSGVscENvbnRlbnQnLCBKb2huVHJhdm9sdGFnZUtleWJvYXJkSGVscENvbnRlbnQgKTtcclxuZXhwb3J0IGRlZmF1bHQgSm9oblRyYXZvbHRhZ2VLZXlib2FyZEhlbHBDb250ZW50OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSwrQkFBK0IsTUFBTSw4RUFBOEU7QUFDMUgsT0FBT0MsdUJBQXVCLE1BQU0sc0VBQXNFO0FBQzFHLE9BQU9DLG1CQUFtQixNQUFNLGtFQUFrRTtBQUNsRyxPQUFPQyxzQkFBc0IsTUFBTSxxRUFBcUU7QUFDeEcsT0FBT0MsNEJBQTRCLE1BQU0sMkVBQTJFO0FBQ3BILE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBRWxFLE1BQU1DLGdCQUFnQixHQUFHRCxxQkFBcUIsQ0FBQ0UsVUFBVTtBQUN6RCxNQUFNQyxjQUFjLEdBQUdILHFCQUFxQixDQUFDSSxRQUFRO0FBQ3JELE1BQU1DLGNBQWMsR0FBR0wscUJBQXFCLENBQUNNLFFBQVE7QUFFckQsTUFBTUMseUJBQXlCLEdBQUdQLHFCQUFxQixDQUFDUSxJQUFJLENBQUNDLGtCQUFrQixDQUFDQyxtQkFBbUI7QUFDbkcsTUFBTUMseUJBQXlCLEdBQUdYLHFCQUFxQixDQUFDUSxJQUFJLENBQUNDLGtCQUFrQixDQUFDRyxtQkFBbUI7QUFFbkcsTUFBTUMsaUNBQWlDLFNBQVNmLDRCQUE0QixDQUFDO0VBQzNFZ0IsV0FBV0EsQ0FBQSxFQUFHO0lBRVo7SUFDQSxNQUFNQyxvQkFBb0IsR0FBRyxJQUFJbkIsbUJBQW1CLENBQUVLLGdCQUFnQixFQUFFLENBQ3RFSixzQkFBc0IsQ0FBQ21CLGFBQWEsQ0FDbENiLGNBQWMsRUFDZFIsdUJBQXVCLENBQUNzQix5QkFBeUIsQ0FBQyxDQUFDLEVBQUU7TUFDbkRDLGlCQUFpQixFQUFFWDtJQUNyQixDQUNGLENBQUMsRUFDRFYsc0JBQXNCLENBQUNtQixhQUFhLENBQ2xDWCxjQUFjLEVBQ2RWLHVCQUF1QixDQUFDd0Isc0JBQXNCLENBQUMsQ0FBQyxFQUFFO01BQ2hERCxpQkFBaUIsRUFBRVA7SUFDckIsQ0FDRixDQUFDLENBQ0QsQ0FBQzs7SUFFSDtJQUNBLE1BQU1TLHVCQUF1QixHQUFHLElBQUkxQiwrQkFBK0IsQ0FBQyxDQUFDO0lBRXJFLEtBQUssQ0FBRSxDQUFFcUIsb0JBQW9CLENBQUUsRUFBRSxDQUFFSyx1QkFBdUIsQ0FBRyxDQUFDO0VBQ2hFO0FBQ0Y7QUFFQXJCLGNBQWMsQ0FBQ3NCLFFBQVEsQ0FBRSxtQ0FBbUMsRUFBRVIsaUNBQWtDLENBQUM7QUFDakcsZUFBZUEsaUNBQWlDIn0=