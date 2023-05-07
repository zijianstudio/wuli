// Copyright 2018-2022, University of Colorado Boulder

/**
 * HoldConstantControl is the control for selecting which quantity should be held constant.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import AquaRadioButtonGroup from '../../../../sun/js/AquaRadioButtonGroup.js';
import GasPropertiesColors from '../../common/GasPropertiesColors.js';
import GasPropertiesConstants from '../../common/GasPropertiesConstants.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesStrings from '../../GasPropertiesStrings.js';

// constants
const TEXT_OPTIONS = {
  font: GasPropertiesConstants.CONTROL_FONT,
  fill: GasPropertiesColors.textFillProperty,
  maxWidth: 175 // determined empirically
};

const SPACING = 12;
export default class HoldConstantControl extends VBox {
  constructor(holdConstantProperty, numberOfParticlesProperty, pressureProperty, isContainerOpenProperty, providedOptions) {
    const options = optionize()({
      // VBoxOptions
      align: 'left',
      spacing: SPACING
    }, providedOptions);
    const titleText = new Text(GasPropertiesStrings.holdConstant.titleStringProperty, {
      font: GasPropertiesConstants.TITLE_FONT,
      fill: GasPropertiesColors.textFillProperty,
      maxWidth: 200,
      // determined empirically
      tandem: options.tandem.createTandem('titleText')
    });
    const items = [{
      value: 'nothing',
      createNode: tandem => new Text(GasPropertiesStrings.holdConstant.nothingStringProperty, TEXT_OPTIONS),
      tandemName: `nothing${AquaRadioButton.TANDEM_NAME_SUFFIX}`
    }, {
      value: 'volume',
      createNode: tandem => new Text(GasPropertiesStrings.holdConstant.volumeStringProperty, TEXT_OPTIONS),
      tandemName: `volume${AquaRadioButton.TANDEM_NAME_SUFFIX}`
    }, {
      value: 'temperature',
      createNode: tandem => new Text(GasPropertiesStrings.holdConstant.temperatureStringProperty, TEXT_OPTIONS),
      tandemName: `temperature${AquaRadioButton.TANDEM_NAME_SUFFIX}`
    }, {
      value: 'pressureV',
      createNode: tandem => new Text(GasPropertiesStrings.holdConstant.pressureVStringProperty, TEXT_OPTIONS),
      tandemName: `pressureV${AquaRadioButton.TANDEM_NAME_SUFFIX}`
    }, {
      value: 'pressureT',
      createNode: tandem => new Text(GasPropertiesStrings.holdConstant.pressureTStringProperty, TEXT_OPTIONS),
      tandemName: `pressureT${AquaRadioButton.TANDEM_NAME_SUFFIX}`
    }];
    const radioButtonGroup = new AquaRadioButtonGroup(holdConstantProperty, items, {
      radioButtonOptions: GasPropertiesConstants.AQUA_RADIO_BUTTON_OPTIONS,
      orientation: 'vertical',
      align: 'left',
      spacing: SPACING,
      tandem: options.tandem.createTandem('radioButtonGroup')
    });
    options.children = [titleText, radioButtonGroup];
    super(options);

    // Disable "Temperature (T)" radio button for conditions that are not possible.
    const temperatureRadioButton = radioButtonGroup.getButton('temperature');
    Multilink.multilink([numberOfParticlesProperty, isContainerOpenProperty], (numberOfParticles, isContainerOpen) => {
      temperatureRadioButton.enabledProperty.value = numberOfParticles !== 0 && !isContainerOpen;
    });

    // Disable radio buttons for selections that are not possible with zero pressure.
    const pressureVRadioButton = radioButtonGroup.getButton('pressureV');
    const pressureTRadioButton = radioButtonGroup.getButton('pressureT');
    pressureProperty.link(pressure => {
      pressureVRadioButton.enabledProperty.value = pressure !== 0;
      pressureTRadioButton.enabledProperty.value = pressure !== 0;
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
gasProperties.register('HoldConstantControl', HoldConstantControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJvcHRpb25pemUiLCJUZXh0IiwiVkJveCIsIkFxdWFSYWRpb0J1dHRvbiIsIkFxdWFSYWRpb0J1dHRvbkdyb3VwIiwiR2FzUHJvcGVydGllc0NvbG9ycyIsIkdhc1Byb3BlcnRpZXNDb25zdGFudHMiLCJnYXNQcm9wZXJ0aWVzIiwiR2FzUHJvcGVydGllc1N0cmluZ3MiLCJURVhUX09QVElPTlMiLCJmb250IiwiQ09OVFJPTF9GT05UIiwiZmlsbCIsInRleHRGaWxsUHJvcGVydHkiLCJtYXhXaWR0aCIsIlNQQUNJTkciLCJIb2xkQ29uc3RhbnRDb250cm9sIiwiY29uc3RydWN0b3IiLCJob2xkQ29uc3RhbnRQcm9wZXJ0eSIsIm51bWJlck9mUGFydGljbGVzUHJvcGVydHkiLCJwcmVzc3VyZVByb3BlcnR5IiwiaXNDb250YWluZXJPcGVuUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiYWxpZ24iLCJzcGFjaW5nIiwidGl0bGVUZXh0IiwiaG9sZENvbnN0YW50IiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsIlRJVExFX0ZPTlQiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJpdGVtcyIsInZhbHVlIiwiY3JlYXRlTm9kZSIsIm5vdGhpbmdTdHJpbmdQcm9wZXJ0eSIsInRhbmRlbU5hbWUiLCJUQU5ERU1fTkFNRV9TVUZGSVgiLCJ2b2x1bWVTdHJpbmdQcm9wZXJ0eSIsInRlbXBlcmF0dXJlU3RyaW5nUHJvcGVydHkiLCJwcmVzc3VyZVZTdHJpbmdQcm9wZXJ0eSIsInByZXNzdXJlVFN0cmluZ1Byb3BlcnR5IiwicmFkaW9CdXR0b25Hcm91cCIsInJhZGlvQnV0dG9uT3B0aW9ucyIsIkFRVUFfUkFESU9fQlVUVE9OX09QVElPTlMiLCJvcmllbnRhdGlvbiIsImNoaWxkcmVuIiwidGVtcGVyYXR1cmVSYWRpb0J1dHRvbiIsImdldEJ1dHRvbiIsIm11bHRpbGluayIsIm51bWJlck9mUGFydGljbGVzIiwiaXNDb250YWluZXJPcGVuIiwiZW5hYmxlZFByb3BlcnR5IiwicHJlc3N1cmVWUmFkaW9CdXR0b24iLCJwcmVzc3VyZVRSYWRpb0J1dHRvbiIsImxpbmsiLCJwcmVzc3VyZSIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkhvbGRDb25zdGFudENvbnRyb2wudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSG9sZENvbnN0YW50Q29udHJvbCBpcyB0aGUgY29udHJvbCBmb3Igc2VsZWN0aW5nIHdoaWNoIHF1YW50aXR5IHNob3VsZCBiZSBoZWxkIGNvbnN0YW50LlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgU3RyaW5nVW5pb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1N0cmluZ1VuaW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgeyBUZXh0LCBUZXh0T3B0aW9ucywgVkJveCwgVkJveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQXF1YVJhZGlvQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BcXVhUmFkaW9CdXR0b24uanMnO1xyXG5pbXBvcnQgQXF1YVJhZGlvQnV0dG9uR3JvdXAsIHsgQXF1YVJhZGlvQnV0dG9uR3JvdXBJdGVtIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0FxdWFSYWRpb0J1dHRvbkdyb3VwLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEdhc1Byb3BlcnRpZXNDb2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL0dhc1Byb3BlcnRpZXNDb2xvcnMuanMnO1xyXG5pbXBvcnQgR2FzUHJvcGVydGllc0NvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vR2FzUHJvcGVydGllc0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCB7IEhvbGRDb25zdGFudCB9IGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Ib2xkQ29uc3RhbnQuanMnO1xyXG5pbXBvcnQgZ2FzUHJvcGVydGllcyBmcm9tICcuLi8uLi9nYXNQcm9wZXJ0aWVzLmpzJztcclxuaW1wb3J0IEdhc1Byb3BlcnRpZXNTdHJpbmdzIGZyb20gJy4uLy4uL0dhc1Byb3BlcnRpZXNTdHJpbmdzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBURVhUX09QVElPTlM6IFRleHRPcHRpb25zID0ge1xyXG4gIGZvbnQ6IEdhc1Byb3BlcnRpZXNDb25zdGFudHMuQ09OVFJPTF9GT05ULFxyXG4gIGZpbGw6IEdhc1Byb3BlcnRpZXNDb2xvcnMudGV4dEZpbGxQcm9wZXJ0eSxcclxuICBtYXhXaWR0aDogMTc1IC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxufTtcclxuY29uc3QgU1BBQ0lORyA9IDEyO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIEhvbGRDb25zdGFudENvbnRyb2xPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrT3B0aW9uYWw8VkJveE9wdGlvbnMsICdtYXhXaWR0aCc+ICYgUGlja1JlcXVpcmVkPFZCb3hPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb2xkQ29uc3RhbnRDb250cm9sIGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaG9sZENvbnN0YW50UHJvcGVydHk6IFN0cmluZ1VuaW9uUHJvcGVydHk8SG9sZENvbnN0YW50PixcclxuICAgICAgICAgICAgICAgICAgICAgIG51bWJlck9mUGFydGljbGVzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcmVzc3VyZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgaXNDb250YWluZXJPcGVuUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBIb2xkQ29uc3RhbnRDb250cm9sT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEhvbGRDb25zdGFudENvbnRyb2xPcHRpb25zLCBTZWxmT3B0aW9ucywgVkJveE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFZCb3hPcHRpb25zXHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIHNwYWNpbmc6IFNQQUNJTkdcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHRpdGxlVGV4dCA9IG5ldyBUZXh0KCBHYXNQcm9wZXJ0aWVzU3RyaW5ncy5ob2xkQ29uc3RhbnQudGl0bGVTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBHYXNQcm9wZXJ0aWVzQ29uc3RhbnRzLlRJVExFX0ZPTlQsXHJcbiAgICAgIGZpbGw6IEdhc1Byb3BlcnRpZXNDb2xvcnMudGV4dEZpbGxQcm9wZXJ0eSxcclxuICAgICAgbWF4V2lkdGg6IDIwMCwgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpdGxlVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGl0ZW1zOiBBcXVhUmFkaW9CdXR0b25Hcm91cEl0ZW08SG9sZENvbnN0YW50PltdID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgdmFsdWU6ICdub3RoaW5nJyxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoIEdhc1Byb3BlcnRpZXNTdHJpbmdzLmhvbGRDb25zdGFudC5ub3RoaW5nU3RyaW5nUHJvcGVydHksIFRFWFRfT1BUSU9OUyApLFxyXG4gICAgICAgIHRhbmRlbU5hbWU6IGBub3RoaW5nJHtBcXVhUmFkaW9CdXR0b24uVEFOREVNX05BTUVfU1VGRklYfWBcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHZhbHVlOiAndm9sdW1lJyxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoIEdhc1Byb3BlcnRpZXNTdHJpbmdzLmhvbGRDb25zdGFudC52b2x1bWVTdHJpbmdQcm9wZXJ0eSwgVEVYVF9PUFRJT05TICksXHJcbiAgICAgICAgdGFuZGVtTmFtZTogYHZvbHVtZSR7QXF1YVJhZGlvQnV0dG9uLlRBTkRFTV9OQU1FX1NVRkZJWH1gXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB2YWx1ZTogJ3RlbXBlcmF0dXJlJyxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoIEdhc1Byb3BlcnRpZXNTdHJpbmdzLmhvbGRDb25zdGFudC50ZW1wZXJhdHVyZVN0cmluZ1Byb3BlcnR5LCBURVhUX09QVElPTlMgKSxcclxuICAgICAgICB0YW5kZW1OYW1lOiBgdGVtcGVyYXR1cmUke0FxdWFSYWRpb0J1dHRvbi5UQU5ERU1fTkFNRV9TVUZGSVh9YFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdmFsdWU6ICdwcmVzc3VyZVYnLFxyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICggdGFuZGVtOiBUYW5kZW0gKSA9PiBuZXcgVGV4dCggR2FzUHJvcGVydGllc1N0cmluZ3MuaG9sZENvbnN0YW50LnByZXNzdXJlVlN0cmluZ1Byb3BlcnR5LCBURVhUX09QVElPTlMgKSxcclxuICAgICAgICB0YW5kZW1OYW1lOiBgcHJlc3N1cmVWJHtBcXVhUmFkaW9CdXR0b24uVEFOREVNX05BTUVfU1VGRklYfWBcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHZhbHVlOiAncHJlc3N1cmVUJyxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoIEdhc1Byb3BlcnRpZXNTdHJpbmdzLmhvbGRDb25zdGFudC5wcmVzc3VyZVRTdHJpbmdQcm9wZXJ0eSwgVEVYVF9PUFRJT05TICksXHJcbiAgICAgICAgdGFuZGVtTmFtZTogYHByZXNzdXJlVCR7QXF1YVJhZGlvQnV0dG9uLlRBTkRFTV9OQU1FX1NVRkZJWH1gXHJcbiAgICAgIH1cclxuICAgIF07XHJcblxyXG4gICAgY29uc3QgcmFkaW9CdXR0b25Hcm91cCA9IG5ldyBBcXVhUmFkaW9CdXR0b25Hcm91cCggaG9sZENvbnN0YW50UHJvcGVydHksIGl0ZW1zLCB7XHJcbiAgICAgIHJhZGlvQnV0dG9uT3B0aW9uczogR2FzUHJvcGVydGllc0NvbnN0YW50cy5BUVVBX1JBRElPX0JVVFRPTl9PUFRJT05TLFxyXG4gICAgICBvcmllbnRhdGlvbjogJ3ZlcnRpY2FsJyxcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgc3BhY2luZzogU1BBQ0lORyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyYWRpb0J1dHRvbkdyb3VwJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgdGl0bGVUZXh0LCByYWRpb0J1dHRvbkdyb3VwIF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBEaXNhYmxlIFwiVGVtcGVyYXR1cmUgKFQpXCIgcmFkaW8gYnV0dG9uIGZvciBjb25kaXRpb25zIHRoYXQgYXJlIG5vdCBwb3NzaWJsZS5cclxuICAgIGNvbnN0IHRlbXBlcmF0dXJlUmFkaW9CdXR0b24gPSByYWRpb0J1dHRvbkdyb3VwLmdldEJ1dHRvbiggJ3RlbXBlcmF0dXJlJyApO1xyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgWyBudW1iZXJPZlBhcnRpY2xlc1Byb3BlcnR5LCBpc0NvbnRhaW5lck9wZW5Qcm9wZXJ0eSBdLFxyXG4gICAgICAoIG51bWJlck9mUGFydGljbGVzLCBpc0NvbnRhaW5lck9wZW4gKSA9PiB7XHJcbiAgICAgICAgdGVtcGVyYXR1cmVSYWRpb0J1dHRvbi5lbmFibGVkUHJvcGVydHkudmFsdWUgPSAoIG51bWJlck9mUGFydGljbGVzICE9PSAwICkgJiYgIWlzQ29udGFpbmVyT3BlbjtcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIERpc2FibGUgcmFkaW8gYnV0dG9ucyBmb3Igc2VsZWN0aW9ucyB0aGF0IGFyZSBub3QgcG9zc2libGUgd2l0aCB6ZXJvIHByZXNzdXJlLlxyXG4gICAgY29uc3QgcHJlc3N1cmVWUmFkaW9CdXR0b24gPSByYWRpb0J1dHRvbkdyb3VwLmdldEJ1dHRvbiggJ3ByZXNzdXJlVicgKTtcclxuICAgIGNvbnN0IHByZXNzdXJlVFJhZGlvQnV0dG9uID0gcmFkaW9CdXR0b25Hcm91cC5nZXRCdXR0b24oICdwcmVzc3VyZVQnICk7XHJcbiAgICBwcmVzc3VyZVByb3BlcnR5LmxpbmsoIHByZXNzdXJlID0+IHtcclxuICAgICAgcHJlc3N1cmVWUmFkaW9CdXR0b24uZW5hYmxlZFByb3BlcnR5LnZhbHVlID0gKCBwcmVzc3VyZSAhPT0gMCApO1xyXG4gICAgICBwcmVzc3VyZVRSYWRpb0J1dHRvbi5lbmFibGVkUHJvcGVydHkudmFsdWUgPSAoIHByZXNzdXJlICE9PSAwICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuZ2FzUHJvcGVydGllcy5yZWdpc3RlciggJ0hvbGRDb25zdGFudENvbnRyb2wnLCBIb2xkQ29uc3RhbnRDb250cm9sICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxrQ0FBa0M7QUFHeEQsT0FBT0MsU0FBUyxNQUE0Qix1Q0FBdUM7QUFHbkYsU0FBU0MsSUFBSSxFQUFlQyxJQUFJLFFBQXFCLG1DQUFtQztBQUN4RixPQUFPQyxlQUFlLE1BQU0sdUNBQXVDO0FBQ25FLE9BQU9DLG9CQUFvQixNQUFvQyw0Q0FBNEM7QUFFM0csT0FBT0MsbUJBQW1CLE1BQU0scUNBQXFDO0FBQ3JFLE9BQU9DLHNCQUFzQixNQUFNLHdDQUF3QztBQUUzRSxPQUFPQyxhQUFhLE1BQU0sd0JBQXdCO0FBQ2xELE9BQU9DLG9CQUFvQixNQUFNLCtCQUErQjs7QUFFaEU7QUFDQSxNQUFNQyxZQUF5QixHQUFHO0VBQ2hDQyxJQUFJLEVBQUVKLHNCQUFzQixDQUFDSyxZQUFZO0VBQ3pDQyxJQUFJLEVBQUVQLG1CQUFtQixDQUFDUSxnQkFBZ0I7RUFDMUNDLFFBQVEs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