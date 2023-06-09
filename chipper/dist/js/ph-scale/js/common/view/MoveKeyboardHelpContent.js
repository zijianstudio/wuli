// Copyright 2022-2023, University of Colorado Boulder

/**
 * MoveKeyboardHelpContent is the keyboard-help section that describes how to move things that are draggable.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import PhScaleStrings from '../../PhScaleStrings.js';
import phScale from '../../phScale.js';
export default class MoveKeyboardHelpContent extends KeyboardHelpSection {
  constructor(titleProperty) {
    // Icons, which must be disposed
    const arrowOrWasdKeysIcon = KeyboardHelpIconFactory.arrowOrWasdKeysRowIcon();
    const arrowKeysIcon = KeyboardHelpIconFactory.arrowKeysRowIcon();
    const wasdKeysIcon = KeyboardHelpIconFactory.wasdRowIcon();
    const shiftPlusArrowKeysIcon = KeyboardHelpIconFactory.shiftPlusIcon(arrowKeysIcon);
    const shiftPlusWASDKeysIcon = KeyboardHelpIconFactory.shiftPlusIcon(wasdKeysIcon);
    const icons = [arrowOrWasdKeysIcon, arrowKeysIcon, wasdKeysIcon, shiftPlusArrowKeysIcon, shiftPlusWASDKeysIcon];

    // Rows, which must be disposed
    const rows = [
    // arrows or WASD, for normal speed
    KeyboardHelpSectionRow.labelWithIcon(PhScaleStrings.keyboardHelpDialog.moveStringProperty, arrowOrWasdKeysIcon),
    // Shift+arrows or Shift+WASD, for slower speed
    KeyboardHelpSectionRow.labelWithIconList(PhScaleStrings.keyboardHelpDialog.moveSlowerStringProperty, [shiftPlusArrowKeysIcon, shiftPlusWASDKeysIcon])];
    super(titleProperty, rows);
    this.disposeMoveKeyboardHelpContent = () => {
      icons.forEach(icon => icon.dispose());
      rows.forEach(row => row.dispose());
    };
  }
  dispose() {
    this.disposeMoveKeyboardHelpContent();
    super.dispose();
  }
}
phScale.register('MoveKeyboardHelpContent', MoveKeyboardHelpContent);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLZXlib2FyZEhlbHBJY29uRmFjdG9yeSIsIktleWJvYXJkSGVscFNlY3Rpb24iLCJLZXlib2FyZEhlbHBTZWN0aW9uUm93IiwiUGhTY2FsZVN0cmluZ3MiLCJwaFNjYWxlIiwiTW92ZUtleWJvYXJkSGVscENvbnRlbnQiLCJjb25zdHJ1Y3RvciIsInRpdGxlUHJvcGVydHkiLCJhcnJvd09yV2FzZEtleXNJY29uIiwiYXJyb3dPcldhc2RLZXlzUm93SWNvbiIsImFycm93S2V5c0ljb24iLCJhcnJvd0tleXNSb3dJY29uIiwid2FzZEtleXNJY29uIiwid2FzZFJvd0ljb24iLCJzaGlmdFBsdXNBcnJvd0tleXNJY29uIiwic2hpZnRQbHVzSWNvbiIsInNoaWZ0UGx1c1dBU0RLZXlzSWNvbiIsImljb25zIiwicm93cyIsImxhYmVsV2l0aEljb24iLCJrZXlib2FyZEhlbHBEaWFsb2ciLCJtb3ZlU3RyaW5nUHJvcGVydHkiLCJsYWJlbFdpdGhJY29uTGlzdCIsIm1vdmVTbG93ZXJTdHJpbmdQcm9wZXJ0eSIsImRpc3Bvc2VNb3ZlS2V5Ym9hcmRIZWxwQ29udGVudCIsImZvckVhY2giLCJpY29uIiwiZGlzcG9zZSIsInJvdyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTW92ZUtleWJvYXJkSGVscENvbnRlbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW92ZUtleWJvYXJkSGVscENvbnRlbnQgaXMgdGhlIGtleWJvYXJkLWhlbHAgc2VjdGlvbiB0aGF0IGRlc2NyaWJlcyBob3cgdG8gbW92ZSB0aGluZ3MgdGhhdCBhcmUgZHJhZ2dhYmxlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IEtleWJvYXJkSGVscEljb25GYWN0b3J5IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9oZWxwL0tleWJvYXJkSGVscEljb25GYWN0b3J5LmpzJztcclxuaW1wb3J0IEtleWJvYXJkSGVscFNlY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2tleWJvYXJkL2hlbHAvS2V5Ym9hcmRIZWxwU2VjdGlvbi5qcyc7XHJcbmltcG9ydCBLZXlib2FyZEhlbHBTZWN0aW9uUm93IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9oZWxwL0tleWJvYXJkSGVscFNlY3Rpb25Sb3cuanMnO1xyXG5pbXBvcnQgUGhTY2FsZVN0cmluZ3MgZnJvbSAnLi4vLi4vUGhTY2FsZVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgcGhTY2FsZSBmcm9tICcuLi8uLi9waFNjYWxlLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vdmVLZXlib2FyZEhlbHBDb250ZW50IGV4dGVuZHMgS2V5Ym9hcmRIZWxwU2VjdGlvbiB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZU1vdmVLZXlib2FyZEhlbHBDb250ZW50OiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRpdGxlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4gKSB7XHJcblxyXG4gICAgLy8gSWNvbnMsIHdoaWNoIG11c3QgYmUgZGlzcG9zZWRcclxuICAgIGNvbnN0IGFycm93T3JXYXNkS2V5c0ljb24gPSBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5hcnJvd09yV2FzZEtleXNSb3dJY29uKCk7XHJcbiAgICBjb25zdCBhcnJvd0tleXNJY29uID0gS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuYXJyb3dLZXlzUm93SWNvbigpO1xyXG4gICAgY29uc3Qgd2FzZEtleXNJY29uID0gS2V5Ym9hcmRIZWxwSWNvbkZhY3Rvcnkud2FzZFJvd0ljb24oKTtcclxuICAgIGNvbnN0IHNoaWZ0UGx1c0Fycm93S2V5c0ljb24gPSBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5zaGlmdFBsdXNJY29uKCBhcnJvd0tleXNJY29uICk7XHJcbiAgICBjb25zdCBzaGlmdFBsdXNXQVNES2V5c0ljb24gPSBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5zaGlmdFBsdXNJY29uKCB3YXNkS2V5c0ljb24gKTtcclxuICAgIGNvbnN0IGljb25zID0gWyBhcnJvd09yV2FzZEtleXNJY29uLCBhcnJvd0tleXNJY29uLCB3YXNkS2V5c0ljb24sIHNoaWZ0UGx1c0Fycm93S2V5c0ljb24sIHNoaWZ0UGx1c1dBU0RLZXlzSWNvbiBdO1xyXG5cclxuICAgIC8vIFJvd3MsIHdoaWNoIG11c3QgYmUgZGlzcG9zZWRcclxuICAgIGNvbnN0IHJvd3MgPSBbXHJcblxyXG4gICAgICAvLyBhcnJvd3Mgb3IgV0FTRCwgZm9yIG5vcm1hbCBzcGVlZFxyXG4gICAgICBLZXlib2FyZEhlbHBTZWN0aW9uUm93LmxhYmVsV2l0aEljb24oIFBoU2NhbGVTdHJpbmdzLmtleWJvYXJkSGVscERpYWxvZy5tb3ZlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgYXJyb3dPcldhc2RLZXlzSWNvbiApLFxyXG5cclxuICAgICAgLy8gU2hpZnQrYXJyb3dzIG9yIFNoaWZ0K1dBU0QsIGZvciBzbG93ZXIgc3BlZWRcclxuICAgICAgS2V5Ym9hcmRIZWxwU2VjdGlvblJvdy5sYWJlbFdpdGhJY29uTGlzdCggUGhTY2FsZVN0cmluZ3Mua2V5Ym9hcmRIZWxwRGlhbG9nLm1vdmVTbG93ZXJTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICBbIHNoaWZ0UGx1c0Fycm93S2V5c0ljb24sIHNoaWZ0UGx1c1dBU0RLZXlzSWNvbiBdIClcclxuICAgIF07XHJcblxyXG4gICAgc3VwZXIoIHRpdGxlUHJvcGVydHksIHJvd3MgKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VNb3ZlS2V5Ym9hcmRIZWxwQ29udGVudCA9ICgpID0+IHtcclxuICAgICAgaWNvbnMuZm9yRWFjaCggaWNvbiA9PiBpY29uLmRpc3Bvc2UoKSApO1xyXG4gICAgICByb3dzLmZvckVhY2goIHJvdyA9PiByb3cuZGlzcG9zZSgpICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VNb3ZlS2V5Ym9hcmRIZWxwQ29udGVudCgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxucGhTY2FsZS5yZWdpc3RlciggJ01vdmVLZXlib2FyZEhlbHBDb250ZW50JywgTW92ZUtleWJvYXJkSGVscENvbnRlbnQgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsdUJBQXVCLE1BQU0sc0VBQXNFO0FBQzFHLE9BQU9DLG1CQUFtQixNQUFNLGtFQUFrRTtBQUNsRyxPQUFPQyxzQkFBc0IsTUFBTSxxRUFBcUU7QUFDeEcsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUNwRCxPQUFPQyxPQUFPLE1BQU0sa0JBQWtCO0FBRXRDLGVBQWUsTUFBTUMsdUJBQXVCLFNBQVNKLG1CQUFtQixDQUFDO0VBSWhFSyxXQUFXQSxDQUFFQyxhQUF3QyxFQUFHO0lBRTdEO0lBQ0EsTUFBTUMsbUJBQW1CLEdBQUdSLHVCQUF1QixDQUFDUyxzQkFBc0IsQ0FBQyxDQUFDO0lBQzVFLE1BQU1DLGFBQWEsR0FBR1YsdUJBQXVCLENBQUNXLGdCQUFnQixDQUFDLENBQUM7SUFDaEUsTUFBTUMsWUFBWSxHQUFHWix1QkFBdUIsQ0FBQ2EsV0FBVyxDQUFDLENBQUM7SUFDMUQsTUFBTUMsc0JBQXNCLEdBQUdkLHVCQUF1QixDQUFDZSxhQUFhLENBQUVMLGFBQWMsQ0FBQztJQUNyRixNQUFNTSxxQkFBcUIsR0FBR2hCLHVCQUF1QixDQUFDZSxhQUFhLENBQUVILFlBQWEsQ0FBQztJQUNuRixNQUFNSyxLQUFLLEdBQUcsQ0FBRVQsbUJBQW1CLEVBQUVFLGFBQWEsRUFBRUUsWUFBWSxFQUFFRSxzQkFBc0IsRUFBRUUscUJBQXFCLENBQUU7O0lBRWpIO0lBQ0EsTUFBTUUsSUFBSSxHQUFHO0lBRVg7SUFDQWhCLHNCQUFzQixDQUFDaUIsYUFBYSxDQUFFaEIsY0FBYyxDQUFDaUIsa0JBQWtCLENBQUNDLGtCQUFrQixFQUN4RmIsbUJBQW9CLENBQUM7SUFFdkI7SUFDQU4sc0JBQXNCLENBQUNvQixpQkFBaUIsQ0FBRW5CLGNBQWMsQ0FBQ2lCLGtCQUFrQixDQUFDRyx3QkFBd0IsRUFDbEcsQ0FBRVQsc0JBQXNCLEVBQUVFLHFCQUFxQixDQUFHLENBQUMsQ0FDdEQ7SUFFRCxLQUFLLENBQUVULGFBQWEsRUFBRVcsSUFBSyxDQUFDO0lBRTVCLElBQUksQ0FBQ00sOEJBQThCLEdBQUcsTUFBTTtNQUMxQ1AsS0FBSyxDQUFDUSxPQUFPLENBQUVDLElBQUksSUFBSUEsSUFBSSxDQUFDQyxPQUFPLENBQUMsQ0FBRSxDQUFDO01BQ3ZDVCxJQUFJLENBQUNPLE9BQU8sQ0FBRUcsR0FBRyxJQUFJQSxHQUFHLENBQUNELE9BQU8sQ0FBQyxDQUFFLENBQUM7SUFDdEMsQ0FBQztFQUNIO0VBRWdCQSxPQUFPQSxDQUFBLEVBQVM7SUFDOUIsSUFBSSxDQUFDSCw4QkFBOEIsQ0FBQyxDQUFDO0lBQ3JDLEtBQUssQ0FBQ0csT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBdkIsT0FBTyxDQUFDeUIsUUFBUSxDQUFFLHlCQUF5QixFQUFFeEIsdUJBQXdCLENBQUMifQ==