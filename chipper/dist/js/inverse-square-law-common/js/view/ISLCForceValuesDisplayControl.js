// Copyright 2019-2022, University of Colorado Boulder

/**
 * Aqua radio buttons with a heading that controls the display type for the force values.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Text, VBox } from '../../../scenery/js/imports.js';
import VerticalAquaRadioButtonGroup from '../../../sun/js/VerticalAquaRadioButtonGroup.js';
import Tandem from '../../../tandem/js/Tandem.js';
import inverseSquareLawCommon from '../inverseSquareLawCommon.js';
import InverseSquareLawCommonStrings from '../InverseSquareLawCommonStrings.js';
import ISLCConstants from '../ISLCConstants.js';
import ForceValuesDisplayEnum from '../model/ForceValuesDisplayEnum.js';

// constants
const decimalNotationString = InverseSquareLawCommonStrings.decimalNotation;
const forceValuesString = InverseSquareLawCommonStrings.forceValues;
const hiddenString = InverseSquareLawCommonStrings.hidden;
const scientificNotationString = InverseSquareLawCommonStrings.scientificNotation;
const forceValuesHelpTextString = InverseSquareLawCommonStrings.a11y.forceValuesHelpText;
const TEXT_TANDEM_NAME = 'labelText';
class ISLCForceValuesDisplayControl extends VBox {
  /**
   * @param {EnumerationDeprecatedProperty.<ForceValuesDisplayEnum>} forceValuesDisplayProperty
   * @param {Object} [options]
   */
  constructor(forceValuesDisplayProperty, options) {
    options = merge({
      align: 'left',
      spacing: 5,
      preventFit: true,
      // workaround for minor pixel changes in https://github.com/phetsims/gravity-force-lab/issues/101
      tandem: Tandem.REQUIRED
    }, options);
    assert && assert(options.children === undefined, 'sets its own children');
    const forceValuesGroupTandem = options.tandem.createTandem('forceValuesRadioButtonGroup');

    // create these "throw away" Tandems in order to have the proper nesting inside the radio button group. This is
    // result of two patterns conflicting: dependency injection for content Nodes and lazy Tandem creation by the
    // component.
    const radioButtonContent = [{
      value: ForceValuesDisplayEnum.DECIMAL,
      createNode: tandem => new Text(decimalNotationString, merge({}, ISLCConstants.UI_TEXT_OPTIONS, {
        tandem: tandem.createTandem(TEXT_TANDEM_NAME)
      })),
      tandemName: 'decimalNotationRadioButton',
      labelContent: decimalNotationString
    }, {
      value: ForceValuesDisplayEnum.SCIENTIFIC,
      createNode: tandem => new Text(scientificNotationString, merge({}, ISLCConstants.UI_TEXT_OPTIONS, {
        tandem: tandem.createTandem(TEXT_TANDEM_NAME)
      })),
      tandemName: 'scientificNotationRadioButton',
      labelContent: scientificNotationString
    }, {
      value: ForceValuesDisplayEnum.HIDDEN,
      createNode: tandem => new Text(hiddenString, merge({}, ISLCConstants.UI_TEXT_OPTIONS, {
        tandem: tandem.createTandem(TEXT_TANDEM_NAME)
      })),
      tandemName: 'hiddenRadioButton',
      labelContent: hiddenString
    }];
    const radioButtonGroup = new VerticalAquaRadioButtonGroup(forceValuesDisplayProperty, radioButtonContent, {
      labelContent: forceValuesString,
      descriptionContent: forceValuesHelpTextString,
      tandem: forceValuesGroupTandem
    });
    options.children = [new Text(forceValuesString, merge({}, ISLCConstants.UI_TEXT_OPTIONS, {
      font: new PhetFont({
        size: 14,
        weight: 'bold'
      }),
      tandem: options.tandem.createTandem('forceValuesText')
    })), radioButtonGroup];
    super(options);
  }
}
inverseSquareLawCommon.register('ISLCForceValuesDisplayControl', ISLCForceValuesDisplayControl);
export default ISLCForceValuesDisplayControl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlBoZXRGb250IiwiVGV4dCIsIlZCb3giLCJWZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwIiwiVGFuZGVtIiwiaW52ZXJzZVNxdWFyZUxhd0NvbW1vbiIsIkludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzIiwiSVNMQ0NvbnN0YW50cyIsIkZvcmNlVmFsdWVzRGlzcGxheUVudW0iLCJkZWNpbWFsTm90YXRpb25TdHJpbmciLCJkZWNpbWFsTm90YXRpb24iLCJmb3JjZVZhbHVlc1N0cmluZyIsImZvcmNlVmFsdWVzIiwiaGlkZGVuU3RyaW5nIiwiaGlkZGVuIiwic2NpZW50aWZpY05vdGF0aW9uU3RyaW5nIiwic2NpZW50aWZpY05vdGF0aW9uIiwiZm9yY2VWYWx1ZXNIZWxwVGV4dFN0cmluZyIsImExMXkiLCJmb3JjZVZhbHVlc0hlbHBUZXh0IiwiVEVYVF9UQU5ERU1fTkFNRSIsIklTTENGb3JjZVZhbHVlc0Rpc3BsYXlDb250cm9sIiwiY29uc3RydWN0b3IiLCJmb3JjZVZhbHVlc0Rpc3BsYXlQcm9wZXJ0eSIsIm9wdGlvbnMiLCJhbGlnbiIsInNwYWNpbmciLCJwcmV2ZW50Rml0IiwidGFuZGVtIiwiUkVRVUlSRUQiLCJhc3NlcnQiLCJjaGlsZHJlbiIsInVuZGVmaW5lZCIsImZvcmNlVmFsdWVzR3JvdXBUYW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJyYWRpb0J1dHRvbkNvbnRlbnQiLCJ2YWx1ZSIsIkRFQ0lNQUwiLCJjcmVhdGVOb2RlIiwiVUlfVEVYVF9PUFRJT05TIiwidGFuZGVtTmFtZSIsImxhYmVsQ29udGVudCIsIlNDSUVOVElGSUMiLCJISURERU4iLCJyYWRpb0J1dHRvbkdyb3VwIiwiZGVzY3JpcHRpb25Db250ZW50IiwiZm9udCIsInNpemUiLCJ3ZWlnaHQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIklTTENGb3JjZVZhbHVlc0Rpc3BsYXlDb250cm9sLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFxdWEgcmFkaW8gYnV0dG9ucyB3aXRoIGEgaGVhZGluZyB0aGF0IGNvbnRyb2xzIHRoZSBkaXNwbGF5IHR5cGUgZm9yIHRoZSBmb3JjZSB2YWx1ZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVmVydGljYWxBcXVhUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi8uLi9zdW4vanMvVmVydGljYWxBcXVhUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBpbnZlcnNlU3F1YXJlTGF3Q29tbW9uIGZyb20gJy4uL2ludmVyc2VTcXVhcmVMYXdDb21tb24uanMnO1xyXG5pbXBvcnQgSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MgZnJvbSAnLi4vSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgSVNMQ0NvbnN0YW50cyBmcm9tICcuLi9JU0xDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEZvcmNlVmFsdWVzRGlzcGxheUVudW0gZnJvbSAnLi4vbW9kZWwvRm9yY2VWYWx1ZXNEaXNwbGF5RW51bS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgZGVjaW1hbE5vdGF0aW9uU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuZGVjaW1hbE5vdGF0aW9uO1xyXG5jb25zdCBmb3JjZVZhbHVlc1N0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmZvcmNlVmFsdWVzO1xyXG5jb25zdCBoaWRkZW5TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5oaWRkZW47XHJcbmNvbnN0IHNjaWVudGlmaWNOb3RhdGlvblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLnNjaWVudGlmaWNOb3RhdGlvbjtcclxuY29uc3QgZm9yY2VWYWx1ZXNIZWxwVGV4dFN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkuZm9yY2VWYWx1ZXNIZWxwVGV4dDtcclxuXHJcbmNvbnN0IFRFWFRfVEFOREVNX05BTUUgPSAnbGFiZWxUZXh0JztcclxuXHJcbmNsYXNzIElTTENGb3JjZVZhbHVlc0Rpc3BsYXlDb250cm9sIGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkuPEZvcmNlVmFsdWVzRGlzcGxheUVudW0+fSBmb3JjZVZhbHVlc0Rpc3BsYXlQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZm9yY2VWYWx1ZXNEaXNwbGF5UHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIHNwYWNpbmc6IDUsXHJcbiAgICAgIHByZXZlbnRGaXQ6IHRydWUsIC8vIHdvcmthcm91bmQgZm9yIG1pbm9yIHBpeGVsIGNoYW5nZXMgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXZpdHktZm9yY2UtbGFiL2lzc3Vlcy8xMDFcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmNoaWxkcmVuID09PSB1bmRlZmluZWQsICdzZXRzIGl0cyBvd24gY2hpbGRyZW4nICk7XHJcblxyXG4gICAgY29uc3QgZm9yY2VWYWx1ZXNHcm91cFRhbmRlbSA9IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZvcmNlVmFsdWVzUmFkaW9CdXR0b25Hcm91cCcgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlc2UgXCJ0aHJvdyBhd2F5XCIgVGFuZGVtcyBpbiBvcmRlciB0byBoYXZlIHRoZSBwcm9wZXIgbmVzdGluZyBpbnNpZGUgdGhlIHJhZGlvIGJ1dHRvbiBncm91cC4gVGhpcyBpc1xyXG4gICAgLy8gcmVzdWx0IG9mIHR3byBwYXR0ZXJucyBjb25mbGljdGluZzogZGVwZW5kZW5jeSBpbmplY3Rpb24gZm9yIGNvbnRlbnQgTm9kZXMgYW5kIGxhenkgVGFuZGVtIGNyZWF0aW9uIGJ5IHRoZVxyXG4gICAgLy8gY29tcG9uZW50LlxyXG4gICAgY29uc3QgcmFkaW9CdXR0b25Db250ZW50ID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgdmFsdWU6IEZvcmNlVmFsdWVzRGlzcGxheUVudW0uREVDSU1BTCxcclxuICAgICAgICBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gbmV3IFRleHQoIGRlY2ltYWxOb3RhdGlvblN0cmluZywgbWVyZ2UoIHt9LCBJU0xDQ29uc3RhbnRzLlVJX1RFWFRfT1BUSU9OUywge1xyXG4gICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCBURVhUX1RBTkRFTV9OQU1FIClcclxuICAgICAgICB9ICkgKSxcclxuICAgICAgICB0YW5kZW1OYW1lOiAnZGVjaW1hbE5vdGF0aW9uUmFkaW9CdXR0b24nLFxyXG4gICAgICAgIGxhYmVsQ29udGVudDogZGVjaW1hbE5vdGF0aW9uU3RyaW5nXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB2YWx1ZTogRm9yY2VWYWx1ZXNEaXNwbGF5RW51bS5TQ0lFTlRJRklDLFxyXG4gICAgICAgIGNyZWF0ZU5vZGU6IHRhbmRlbSA9PiBuZXcgVGV4dCggc2NpZW50aWZpY05vdGF0aW9uU3RyaW5nLCBtZXJnZSgge30sIElTTENDb25zdGFudHMuVUlfVEVYVF9PUFRJT05TLCB7XHJcbiAgICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oIFRFWFRfVEFOREVNX05BTUUgKVxyXG4gICAgICAgIH0gKSApLFxyXG4gICAgICAgIHRhbmRlbU5hbWU6ICdzY2llbnRpZmljTm90YXRpb25SYWRpb0J1dHRvbicsXHJcbiAgICAgICAgbGFiZWxDb250ZW50OiBzY2llbnRpZmljTm90YXRpb25TdHJpbmdcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHZhbHVlOiBGb3JjZVZhbHVlc0Rpc3BsYXlFbnVtLkhJRERFTixcclxuICAgICAgICBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gbmV3IFRleHQoIGhpZGRlblN0cmluZywgbWVyZ2UoIHt9LCBJU0xDQ29uc3RhbnRzLlVJX1RFWFRfT1BUSU9OUywge1xyXG4gICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCBURVhUX1RBTkRFTV9OQU1FIClcclxuICAgICAgICB9ICkgKSxcclxuICAgICAgICB0YW5kZW1OYW1lOiAnaGlkZGVuUmFkaW9CdXR0b24nLFxyXG4gICAgICAgIGxhYmVsQ29udGVudDogaGlkZGVuU3RyaW5nXHJcbiAgICAgIH1cclxuICAgIF07XHJcbiAgICBjb25zdCByYWRpb0J1dHRvbkdyb3VwID0gbmV3IFZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXAoIGZvcmNlVmFsdWVzRGlzcGxheVByb3BlcnR5LCByYWRpb0J1dHRvbkNvbnRlbnQsIHtcclxuICAgICAgbGFiZWxDb250ZW50OiBmb3JjZVZhbHVlc1N0cmluZyxcclxuICAgICAgZGVzY3JpcHRpb25Db250ZW50OiBmb3JjZVZhbHVlc0hlbHBUZXh0U3RyaW5nLFxyXG4gICAgICB0YW5kZW06IGZvcmNlVmFsdWVzR3JvdXBUYW5kZW1cclxuICAgIH0gKTtcclxuXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gW1xyXG4gICAgICBuZXcgVGV4dCggZm9yY2VWYWx1ZXNTdHJpbmcsIG1lcmdlKCB7fSwgSVNMQ0NvbnN0YW50cy5VSV9URVhUX09QVElPTlMsIHtcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTQsIHdlaWdodDogJ2JvbGQnIH0gKSxcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZvcmNlVmFsdWVzVGV4dCcgKVxyXG4gICAgICB9ICkgKSxcclxuICAgICAgcmFkaW9CdXR0b25Hcm91cFxyXG4gICAgXTtcclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5pbnZlcnNlU3F1YXJlTGF3Q29tbW9uLnJlZ2lzdGVyKCAnSVNMQ0ZvcmNlVmFsdWVzRGlzcGxheUNvbnRyb2wnLCBJU0xDRm9yY2VWYWx1ZXNEaXNwbGF5Q29udHJvbCApO1xyXG5leHBvcnQgZGVmYXVsdCBJU0xDRm9yY2VWYWx1ZXNEaXNwbGF5Q29udHJvbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxPQUFPQyxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLGdDQUFnQztBQUMzRCxPQUFPQyw0QkFBNEIsTUFBTSxpREFBaUQ7QUFDMUYsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxzQkFBc0IsTUFBTSw4QkFBOEI7QUFDakUsT0FBT0MsNkJBQTZCLE1BQU0scUNBQXFDO0FBQy9FLE9BQU9DLGFBQWEsTUFBTSxxQkFBcUI7QUFDL0MsT0FBT0Msc0JBQXNCLE1BQU0sb0NBQW9DOztBQUV2RTtBQUNBLE1BQU1DLHFCQUFxQixHQUFH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