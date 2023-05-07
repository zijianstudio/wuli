// Copyright 2020-2022, University of Colorado Boulder

/**
 * A ComboBox with a label for the EnergySkateParkControlPanel. The layout of this type is meant to match
 * other controls in the EnergySkateParkControlPanel, and so layout is set with matchLayout(). See that
 * function for more information.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { Node, Spacer, Text, VBox } from '../../../../scenery/js/imports.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';
class LabelledComboBox extends VBox {
  /**
   * @param {ComboBox} comboBox - the ComboBox to be labelled
   * @param {string} titleString
   * @param {Tandem} tandem
   */
  constructor(comboBox, titleString, tandem) {
    super({
      spacing: 5
    });

    // @private {ComboBox}
    this.comboBox = comboBox;

    // @private {Text}
    this.titleNode = new Text(titleString, {
      font: EnergySkateParkConstants.CONTROL_TITLE_FONT,
      maxWidth: this.comboBox.width / 2
    });

    // initial children, but layout probably needs to be specified with matchLayout()
    this.children = [this.titleNode, this.comboBox];
  }

  /**
   * Adjust the layout of the ComboBox and title to match the layout of other controls in the
   * EnergySkateParkControlPanel. The title will be left aligned with extra spacing to the right so
   * that the title aligns with other controls. The ComboBox remains center aligned.
   * @public
   *
   * @param {number} width - width of other controls to match, so that titleNode can align with other controls.
   */
  matchLayout(width) {
    const spacer = new Spacer(width - this.titleNode.width, 0);
    spacer.leftCenter = this.titleNode.rightCenter;
    const titleWithSpacer = new Node({
      children: [this.titleNode, spacer]
    });
    this.children = [titleWithSpacer, this.comboBox];
  }
}
energySkatePark.register('LabelledComboBox', LabelledComboBox);
export default LabelledComboBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb2RlIiwiU3BhY2VyIiwiVGV4dCIsIlZCb3giLCJlbmVyZ3lTa2F0ZVBhcmsiLCJFbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMiLCJMYWJlbGxlZENvbWJvQm94IiwiY29uc3RydWN0b3IiLCJjb21ib0JveCIsInRpdGxlU3RyaW5nIiwidGFuZGVtIiwic3BhY2luZyIsInRpdGxlTm9kZSIsImZvbnQiLCJDT05UUk9MX1RJVExFX0ZPTlQiLCJtYXhXaWR0aCIsIndpZHRoIiwiY2hpbGRyZW4iLCJtYXRjaExheW91dCIsInNwYWNlciIsImxlZnRDZW50ZXIiLCJyaWdodENlbnRlciIsInRpdGxlV2l0aFNwYWNlciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGFiZWxsZWRDb21ib0JveC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIENvbWJvQm94IHdpdGggYSBsYWJlbCBmb3IgdGhlIEVuZXJneVNrYXRlUGFya0NvbnRyb2xQYW5lbC4gVGhlIGxheW91dCBvZiB0aGlzIHR5cGUgaXMgbWVhbnQgdG8gbWF0Y2hcclxuICogb3RoZXIgY29udHJvbHMgaW4gdGhlIEVuZXJneVNrYXRlUGFya0NvbnRyb2xQYW5lbCwgYW5kIHNvIGxheW91dCBpcyBzZXQgd2l0aCBtYXRjaExheW91dCgpLiBTZWUgdGhhdFxyXG4gKiBmdW5jdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgTm9kZSwgU3BhY2VyLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGVuZXJneVNrYXRlUGFyayBmcm9tICcuLi8uLi9lbmVyZ3lTa2F0ZVBhcmsuanMnO1xyXG5pbXBvcnQgRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzIGZyb20gJy4uL0VuZXJneVNrYXRlUGFya0NvbnN0YW50cy5qcyc7XHJcblxyXG5jbGFzcyBMYWJlbGxlZENvbWJvQm94IGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Q29tYm9Cb3h9IGNvbWJvQm94IC0gdGhlIENvbWJvQm94IHRvIGJlIGxhYmVsbGVkXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlU3RyaW5nXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjb21ib0JveCwgdGl0bGVTdHJpbmcsIHRhbmRlbSApIHtcclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHNwYWNpbmc6IDVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Q29tYm9Cb3h9XHJcbiAgICB0aGlzLmNvbWJvQm94ID0gY29tYm9Cb3g7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1RleHR9XHJcbiAgICB0aGlzLnRpdGxlTm9kZSA9IG5ldyBUZXh0KCB0aXRsZVN0cmluZywge1xyXG4gICAgICBmb250OiBFbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMuQ09OVFJPTF9USVRMRV9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogdGhpcy5jb21ib0JveC53aWR0aCAvIDJcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBpbml0aWFsIGNoaWxkcmVuLCBidXQgbGF5b3V0IHByb2JhYmx5IG5lZWRzIHRvIGJlIHNwZWNpZmllZCB3aXRoIG1hdGNoTGF5b3V0KClcclxuICAgIHRoaXMuY2hpbGRyZW4gPSBbIHRoaXMudGl0bGVOb2RlLCB0aGlzLmNvbWJvQm94IF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGp1c3QgdGhlIGxheW91dCBvZiB0aGUgQ29tYm9Cb3ggYW5kIHRpdGxlIHRvIG1hdGNoIHRoZSBsYXlvdXQgb2Ygb3RoZXIgY29udHJvbHMgaW4gdGhlXHJcbiAgICogRW5lcmd5U2thdGVQYXJrQ29udHJvbFBhbmVsLiBUaGUgdGl0bGUgd2lsbCBiZSBsZWZ0IGFsaWduZWQgd2l0aCBleHRyYSBzcGFjaW5nIHRvIHRoZSByaWdodCBzb1xyXG4gICAqIHRoYXQgdGhlIHRpdGxlIGFsaWducyB3aXRoIG90aGVyIGNvbnRyb2xzLiBUaGUgQ29tYm9Cb3ggcmVtYWlucyBjZW50ZXIgYWxpZ25lZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSB3aWR0aCBvZiBvdGhlciBjb250cm9scyB0byBtYXRjaCwgc28gdGhhdCB0aXRsZU5vZGUgY2FuIGFsaWduIHdpdGggb3RoZXIgY29udHJvbHMuXHJcbiAgICovXHJcbiAgbWF0Y2hMYXlvdXQoIHdpZHRoICkge1xyXG4gICAgY29uc3Qgc3BhY2VyID0gbmV3IFNwYWNlciggd2lkdGggLSB0aGlzLnRpdGxlTm9kZS53aWR0aCwgMCApO1xyXG4gICAgc3BhY2VyLmxlZnRDZW50ZXIgPSB0aGlzLnRpdGxlTm9kZS5yaWdodENlbnRlcjtcclxuICAgIGNvbnN0IHRpdGxlV2l0aFNwYWNlciA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIHRoaXMudGl0bGVOb2RlLCBzcGFjZXIgXSB9ICk7XHJcblxyXG4gICAgdGhpcy5jaGlsZHJlbiA9IFsgdGl0bGVXaXRoU3BhY2VyLCB0aGlzLmNvbWJvQm94IF07XHJcbiAgfVxyXG59XHJcblxyXG5lbmVyZ3lTa2F0ZVBhcmsucmVnaXN0ZXIoICdMYWJlbGxlZENvbWJvQm94JywgTGFiZWxsZWRDb21ib0JveCApO1xyXG5leHBvcnQgZGVmYXVsdCBMYWJlbGxlZENvbWJvQm94OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsSUFBSSxFQUFFQyxNQUFNLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM1RSxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLHdCQUF3QixNQUFNLGdDQUFnQztBQUVyRSxNQUFNQyxnQkFBZ0IsU0FBU0gsSUFBSSxDQUFDO0VBRWxDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUksV0FBV0EsQ0FBRUMsUUFBUSxFQUFFQyxXQUFXLEVBQUVDLE1BQU0sRUFBRztJQUMzQyxLQUFLLENBQUU7TUFDTEMsT0FBTyxFQUFFO0lBQ1gsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDSCxRQUFRLEdBQUdBLFFBQVE7O0lBRXhCO0lBQ0EsSUFBSSxDQUFDSSxTQUFTLEdBQUcsSUFBSVYsSUFBSSxDQUFFTyxXQUFXLEVBQUU7TUFDdENJLElBQUksRUFBRVIsd0JBQXdCLENBQUNTLGtCQUFrQjtNQUNqREMsUUFBUSxFQUFFLElBQUksQ0FBQ1AsUUFBUSxDQUFDUSxLQUFLLEdBQUc7SUFDbEMsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDQyxRQUFRLEdBQUcsQ0FBRSxJQUFJLENBQUNMLFNBQVMsRUFBRSxJQUFJLENBQUNKLFFBQVEsQ0FBRTtFQUNuRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VVLFdBQVdBLENBQUVGLEtBQUssRUFBRztJQUNuQixNQUFNRyxNQUFNLEdBQUcsSUFBSWxCLE1BQU0sQ0FBRWUsS0FBSyxHQUFHLElBQUksQ0FBQ0osU0FBUyxDQUFDSSxLQUFLLEVBQUUsQ0FBRSxDQUFDO0lBQzVERyxNQUFNLENBQUNDLFVBQVUsR0FBRyxJQUFJLENBQUNSLFNBQVMsQ0FBQ1MsV0FBVztJQUM5QyxNQUFNQyxlQUFlLEdBQUcsSUFBSXRCLElBQUksQ0FBRTtNQUFFaUIsUUFBUSxFQUFFLENBQUUsSUFBSSxDQUFDTCxTQUFTLEVBQUVPLE1BQU07SUFBRyxDQUFFLENBQUM7SUFFNUUsSUFBSSxDQUFDRixRQUFRLEdBQUcsQ0FBRUssZUFBZSxFQUFFLElBQUksQ0FBQ2QsUUFBUSxDQUFFO0VBQ3BEO0FBQ0Y7QUFFQUosZUFBZSxDQUFDbUIsUUFBUSxDQUFFLGtCQUFrQixFQUFFakIsZ0JBQWlCLENBQUM7QUFDaEUsZUFBZUEsZ0JBQWdCIn0=