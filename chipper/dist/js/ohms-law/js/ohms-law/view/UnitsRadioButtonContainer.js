// Copyright 2020-2023, University of Colorado Boulder

/**
 * Radio button group with heading to control current units
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ohmsLaw from '../../ohmsLaw.js';
import OhmsLawStrings from '../../OhmsLawStrings.js';
import CurrentUnit from '../model/CurrentUnit.js';
import OhmsLawA11yStrings from '../OhmsLawA11yStrings.js';
const ampsAString = OhmsLawStrings.ampsA;
const milliampsMAString = OhmsLawStrings.milliampsMA;
const unitsString = OhmsLawStrings.units;
const chooseUnitForCurrentString = OhmsLawA11yStrings.chooseUnitForCurrent.value;

// constants
const MAX_WIDTH = 250;
const RADIO_BUTTON_TEXT_OPTIONS = {
  font: new PhetFont(20),
  maxWidth: MAX_WIDTH
};
class UnitsRadioButtonContainer extends VBox {
  /**
   * @param {Property.<CurrentUnit>}currentUnitsProperty
   * @param {Object} [options] - not passed to supertype
   */
  constructor(currentUnitsProperty, options) {
    merge({
      tandem: Tandem.REQUIRED,
      tagName: 'div'
    }, options);
    const unitsHeading = new RichText(unitsString, {
      font: new PhetFont({
        size: 22,
        weight: 'bold'
      }),
      maxWidth: MAX_WIDTH
    });
    const currentUnitRadioButtonGroup = new VerticalAquaRadioButtonGroup(currentUnitsProperty, [{
      createNode: () => new Text(milliampsMAString, RADIO_BUTTON_TEXT_OPTIONS),
      value: CurrentUnit.MILLIAMPS,
      tandemName: 'milliampsRadioButton',
      labelContent: milliampsMAString
    }, {
      createNode: () => new Text(ampsAString, RADIO_BUTTON_TEXT_OPTIONS),
      value: CurrentUnit.AMPS,
      tandemName: 'ampsRadioButton',
      labelContent: ampsAString
    }], {
      labelContent: unitsString,
      descriptionContent: chooseUnitForCurrentString,
      tandem: options.tandem.createTandem('currentUnitRadioButtonGroup')
    });
    super({
      children: [unitsHeading, currentUnitRadioButtonGroup],
      align: 'left',
      spacing: 10
    });
  }
}
ohmsLaw.register('UnitsRadioButtonContainer', UnitsRadioButtonContainer);
export default UnitsRadioButtonContainer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlBoZXRGb250IiwiUmljaFRleHQiLCJUZXh0IiwiVkJveCIsIlZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXAiLCJUYW5kZW0iLCJvaG1zTGF3IiwiT2htc0xhd1N0cmluZ3MiLCJDdXJyZW50VW5pdCIsIk9obXNMYXdBMTF5U3RyaW5ncyIsImFtcHNBU3RyaW5nIiwiYW1wc0EiLCJtaWxsaWFtcHNNQVN0cmluZyIsIm1pbGxpYW1wc01BIiwidW5pdHNTdHJpbmciLCJ1bml0cyIsImNob29zZVVuaXRGb3JDdXJyZW50U3RyaW5nIiwiY2hvb3NlVW5pdEZvckN1cnJlbnQiLCJ2YWx1ZSIsIk1BWF9XSURUSCIsIlJBRElPX0JVVFRPTl9URVhUX09QVElPTlMiLCJmb250IiwibWF4V2lkdGgiLCJVbml0c1JhZGlvQnV0dG9uQ29udGFpbmVyIiwiY29uc3RydWN0b3IiLCJjdXJyZW50VW5pdHNQcm9wZXJ0eSIsIm9wdGlvbnMiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInRhZ05hbWUiLCJ1bml0c0hlYWRpbmciLCJzaXplIiwid2VpZ2h0IiwiY3VycmVudFVuaXRSYWRpb0J1dHRvbkdyb3VwIiwiY3JlYXRlTm9kZSIsIk1JTExJQU1QUyIsInRhbmRlbU5hbWUiLCJsYWJlbENvbnRlbnQiLCJBTVBTIiwiZGVzY3JpcHRpb25Db250ZW50IiwiY3JlYXRlVGFuZGVtIiwiY2hpbGRyZW4iLCJhbGlnbiIsInNwYWNpbmciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlVuaXRzUmFkaW9CdXR0b25Db250YWluZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmFkaW8gYnV0dG9uIGdyb3VwIHdpdGggaGVhZGluZyB0byBjb250cm9sIGN1cnJlbnQgdW5pdHNcclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgUmljaFRleHQsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVmVydGljYWxBcXVhUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvVmVydGljYWxBcXVhUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBvaG1zTGF3IGZyb20gJy4uLy4uL29obXNMYXcuanMnO1xyXG5pbXBvcnQgT2htc0xhd1N0cmluZ3MgZnJvbSAnLi4vLi4vT2htc0xhd1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgQ3VycmVudFVuaXQgZnJvbSAnLi4vbW9kZWwvQ3VycmVudFVuaXQuanMnO1xyXG5pbXBvcnQgT2htc0xhd0ExMXlTdHJpbmdzIGZyb20gJy4uL09obXNMYXdBMTF5U3RyaW5ncy5qcyc7XHJcblxyXG5jb25zdCBhbXBzQVN0cmluZyA9IE9obXNMYXdTdHJpbmdzLmFtcHNBO1xyXG5jb25zdCBtaWxsaWFtcHNNQVN0cmluZyA9IE9obXNMYXdTdHJpbmdzLm1pbGxpYW1wc01BO1xyXG5jb25zdCB1bml0c1N0cmluZyA9IE9obXNMYXdTdHJpbmdzLnVuaXRzO1xyXG5cclxuY29uc3QgY2hvb3NlVW5pdEZvckN1cnJlbnRTdHJpbmcgPSBPaG1zTGF3QTExeVN0cmluZ3MuY2hvb3NlVW5pdEZvckN1cnJlbnQudmFsdWU7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTUFYX1dJRFRIID0gMjUwO1xyXG5jb25zdCBSQURJT19CVVRUT05fVEVYVF9PUFRJT05TID0geyBmb250OiBuZXcgUGhldEZvbnQoIDIwICksIG1heFdpZHRoOiBNQVhfV0lEVEggfTtcclxuXHJcbmNsYXNzIFVuaXRzUmFkaW9CdXR0b25Db250YWluZXIgZXh0ZW5kcyBWQm94IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Q3VycmVudFVuaXQ+fWN1cnJlbnRVbml0c1Byb3BlcnR5XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIG5vdCBwYXNzZWQgdG8gc3VwZXJ0eXBlXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGN1cnJlbnRVbml0c1Byb3BlcnR5LCBvcHRpb25zICkge1xyXG5cclxuICAgIG1lcmdlKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxyXG4gICAgICB0YWdOYW1lOiAnZGl2J1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHVuaXRzSGVhZGluZyA9IG5ldyBSaWNoVGV4dCggdW5pdHNTdHJpbmcsIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7XHJcbiAgICAgICAgc2l6ZTogMjIsXHJcbiAgICAgICAgd2VpZ2h0OiAnYm9sZCdcclxuICAgICAgfSApLFxyXG4gICAgICBtYXhXaWR0aDogTUFYX1dJRFRIXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY3VycmVudFVuaXRSYWRpb0J1dHRvbkdyb3VwID0gbmV3IFZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXAoIGN1cnJlbnRVbml0c1Byb3BlcnR5LCBbXHJcbiAgICAgIHtcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggbWlsbGlhbXBzTUFTdHJpbmcsIFJBRElPX0JVVFRPTl9URVhUX09QVElPTlMgKSxcclxuICAgICAgICB2YWx1ZTogQ3VycmVudFVuaXQuTUlMTElBTVBTLFxyXG4gICAgICAgIHRhbmRlbU5hbWU6ICdtaWxsaWFtcHNSYWRpb0J1dHRvbicsXHJcbiAgICAgICAgbGFiZWxDb250ZW50OiBtaWxsaWFtcHNNQVN0cmluZ1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoIGFtcHNBU3RyaW5nLCBSQURJT19CVVRUT05fVEVYVF9PUFRJT05TICksXHJcbiAgICAgICAgdmFsdWU6IEN1cnJlbnRVbml0LkFNUFMsXHJcbiAgICAgICAgdGFuZGVtTmFtZTogJ2FtcHNSYWRpb0J1dHRvbicsXHJcbiAgICAgICAgbGFiZWxDb250ZW50OiBhbXBzQVN0cmluZ1xyXG4gICAgICB9IF0sIHtcclxuICAgICAgbGFiZWxDb250ZW50OiB1bml0c1N0cmluZyxcclxuICAgICAgZGVzY3JpcHRpb25Db250ZW50OiBjaG9vc2VVbml0Rm9yQ3VycmVudFN0cmluZyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjdXJyZW50VW5pdFJhZGlvQnV0dG9uR3JvdXAnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBjaGlsZHJlbjogWyB1bml0c0hlYWRpbmcsIGN1cnJlbnRVbml0UmFkaW9CdXR0b25Hcm91cCBdLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBzcGFjaW5nOiAxMFxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxub2htc0xhdy5yZWdpc3RlciggJ1VuaXRzUmFkaW9CdXR0b25Db250YWluZXInLCBVbml0c1JhZGlvQnV0dG9uQ29udGFpbmVyICk7XHJcbmV4cG9ydCBkZWZhdWx0IFVuaXRzUmFkaW9CdXR0b25Db250YWluZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxRQUFRLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1D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