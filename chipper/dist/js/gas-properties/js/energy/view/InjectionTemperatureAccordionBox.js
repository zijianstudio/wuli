// Copyright 2019-2023, University of Colorado Boulder

/**
 * InjectionTemperatureAccordionBox contains controls related to the temperature used to compute the initial velocity
 * of particles when they are injected into the container.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { optionize4 } from '../../../../phet-core/js/optionize.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import GasPropertiesColors from '../../common/GasPropertiesColors.js';
import GasPropertiesConstants from '../../common/GasPropertiesConstants.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesStrings from '../../GasPropertiesStrings.js';
import InjectionTemperatureControl from './InjectionTemperatureControl.js';

// constants
const TEXT_OPTIONS = {
  font: GasPropertiesConstants.CONTROL_FONT,
  fill: GasPropertiesColors.textFillProperty,
  maxWidth: 175 // determined empirically
};

export default class InjectionTemperatureAccordionBox extends AccordionBox {
  constructor(controlTemperatureEnabledProperty, initialTemperatureProperty, providedOptions) {
    const options = optionize4()({}, GasPropertiesConstants.ACCORDION_BOX_OPTIONS, {
      // SelfOptions
      fixedWidth: 100,
      // AccordionBoxOptions
      contentXMargin: GasPropertiesConstants.ACCORDION_BOX_OPTIONS.contentXMargin,
      titleNode: new Text(GasPropertiesStrings.injectionTemperatureStringProperty, {
        font: GasPropertiesConstants.TITLE_FONT,
        fill: GasPropertiesColors.textFillProperty
      })
    }, providedOptions);

    // Limit width of title
    options.titleNode.maxWidth = 0.75 * options.fixedWidth; // determined empirically

    // Radio buttons
    const radioButtonGroup = new VerticalAquaRadioButtonGroup(controlTemperatureEnabledProperty, [{
      value: false,
      createNode: () => new Text(GasPropertiesStrings.matchContainerStringProperty, TEXT_OPTIONS),
      tandemName: 'matchContainerRadioButton'
    }, {
      value: true,
      createNode: () => new Text(GasPropertiesStrings.setToStringProperty, TEXT_OPTIONS),
      tandemName: 'setToRadioButton'
    }], {
      spacing: 12,
      radioButtonOptions: GasPropertiesConstants.AQUA_RADIO_BUTTON_OPTIONS,
      tandem: options.tandem.createTandem('radioButtonGroup')
    });

    // NumberControl
    const temperatureControl = new InjectionTemperatureControl(initialTemperatureProperty, {
      enabledProperty: controlTemperatureEnabledProperty,
      tandem: options.tandem.createTandem('temperatureControl')
    });
    const contentWidth = options.fixedWidth - 2 * options.contentXMargin;
    const content = new VBox({
      preferredWidth: contentWidth,
      widthSizable: false,
      // so that width will remain preferredWidth
      align: 'left',
      spacing: 12,
      children: [radioButtonGroup, temperatureControl]
    });
    super(content, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
gasProperties.register('InjectionTemperatureAccordionBox', InjectionTemperatureAccordionBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemU0IiwiVGV4dCIsIlZCb3giLCJBY2NvcmRpb25Cb3giLCJWZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwIiwiR2FzUHJvcGVydGllc0NvbG9ycyIsIkdhc1Byb3BlcnRpZXNDb25zdGFudHMiLCJnYXNQcm9wZXJ0aWVzIiwiR2FzUHJvcGVydGllc1N0cmluZ3MiLCJJbmplY3Rpb25UZW1wZXJhdHVyZUNvbnRyb2wiLCJURVhUX09QVElPTlMiLCJmb250IiwiQ09OVFJPTF9GT05UIiwiZmlsbCIsInRleHRGaWxsUHJvcGVydHkiLCJtYXhXaWR0aCIsIkluamVjdGlvblRlbXBlcmF0dXJlQWNjb3JkaW9uQm94IiwiY29uc3RydWN0b3IiLCJjb250cm9sVGVtcGVyYXR1cmVFbmFibGVkUHJvcGVydHkiLCJpbml0aWFsVGVtcGVyYXR1cmVQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJBQ0NPUkRJT05fQk9YX09QVElPTlMiLCJmaXhlZFdpZHRoIiwiY29udGVudFhNYXJnaW4iLCJ0aXRsZU5vZGUiLCJpbmplY3Rpb25UZW1wZXJhdHVyZVN0cmluZ1Byb3BlcnR5IiwiVElUTEVfRk9OVCIsInJhZGlvQnV0dG9uR3JvdXAiLCJ2YWx1ZSIsImNyZWF0ZU5vZGUiLCJtYXRjaENvbnRhaW5lclN0cmluZ1Byb3BlcnR5IiwidGFuZGVtTmFtZSIsInNldFRvU3RyaW5nUHJvcGVydHkiLCJzcGFjaW5nIiwicmFkaW9CdXR0b25PcHRpb25zIiwiQVFVQV9SQURJT19CVVRUT05fT1BUSU9OUyIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInRlbXBlcmF0dXJlQ29udHJvbCIsImVuYWJsZWRQcm9wZXJ0eSIsImNvbnRlbnRXaWR0aCIsImNvbnRlbnQiLCJwcmVmZXJyZWRXaWR0aCIsIndpZHRoU2l6YWJsZSIsImFsaWduIiwiY2hpbGRyZW4iLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbmplY3Rpb25UZW1wZXJhdHVyZUFjY29yZGlvbkJveC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBJbmplY3Rpb25UZW1wZXJhdHVyZUFjY29yZGlvbkJveCBjb250YWlucyBjb250cm9scyByZWxhdGVkIHRvIHRoZSB0ZW1wZXJhdHVyZSB1c2VkIHRvIGNvbXB1dGUgdGhlIGluaXRpYWwgdmVsb2NpdHlcclxuICogb2YgcGFydGljbGVzIHdoZW4gdGhleSBhcmUgaW5qZWN0ZWQgaW50byB0aGUgY29udGFpbmVyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBvcHRpb25pemU0IH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCB7IFRleHQsIFRleHRPcHRpb25zLCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEFjY29yZGlvbkJveCwgeyBBY2NvcmRpb25Cb3hPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0FjY29yZGlvbkJveC5qcyc7XHJcbmltcG9ydCBWZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9WZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwLmpzJztcclxuaW1wb3J0IEdhc1Byb3BlcnRpZXNDb2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL0dhc1Byb3BlcnRpZXNDb2xvcnMuanMnO1xyXG5pbXBvcnQgR2FzUHJvcGVydGllc0NvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vR2FzUHJvcGVydGllc0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBnYXNQcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2dhc1Byb3BlcnRpZXMuanMnO1xyXG5pbXBvcnQgR2FzUHJvcGVydGllc1N0cmluZ3MgZnJvbSAnLi4vLi4vR2FzUHJvcGVydGllc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgSW5qZWN0aW9uVGVtcGVyYXR1cmVDb250cm9sIGZyb20gJy4vSW5qZWN0aW9uVGVtcGVyYXR1cmVDb250cm9sLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBURVhUX09QVElPTlM6IFRleHRPcHRpb25zID0ge1xyXG4gIGZvbnQ6IEdhc1Byb3BlcnRpZXNDb25zdGFudHMuQ09OVFJPTF9GT05ULFxyXG4gIGZpbGw6IEdhc1Byb3BlcnRpZXNDb2xvcnMudGV4dEZpbGxQcm9wZXJ0eSxcclxuICBtYXhXaWR0aDogMTc1IC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxufTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgZml4ZWRXaWR0aD86IG51bWJlcjtcclxufTtcclxuXHJcbnR5cGUgSW5qZWN0aW9uVGVtcGVyYXR1cmVBY2NvcmRpb25Cb3hPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8QWNjb3JkaW9uQm94T3B0aW9ucywgJ2V4cGFuZGVkUHJvcGVydHknIHwgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5qZWN0aW9uVGVtcGVyYXR1cmVBY2NvcmRpb25Cb3ggZXh0ZW5kcyBBY2NvcmRpb25Cb3gge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNvbnRyb2xUZW1wZXJhdHVyZUVuYWJsZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsVGVtcGVyYXR1cmVQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHksXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IEluamVjdGlvblRlbXBlcmF0dXJlQWNjb3JkaW9uQm94T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplNDxJbmplY3Rpb25UZW1wZXJhdHVyZUFjY29yZGlvbkJveE9wdGlvbnMsIFNlbGZPcHRpb25zLCBBY2NvcmRpb25Cb3hPcHRpb25zPigpKFxyXG4gICAgICB7fSwgR2FzUHJvcGVydGllc0NvbnN0YW50cy5BQ0NPUkRJT05fQk9YX09QVElPTlMsIHtcclxuXHJcbiAgICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgICBmaXhlZFdpZHRoOiAxMDAsXHJcblxyXG4gICAgICAgIC8vIEFjY29yZGlvbkJveE9wdGlvbnNcclxuICAgICAgICBjb250ZW50WE1hcmdpbjogR2FzUHJvcGVydGllc0NvbnN0YW50cy5BQ0NPUkRJT05fQk9YX09QVElPTlMuY29udGVudFhNYXJnaW4sXHJcbiAgICAgICAgdGl0bGVOb2RlOiBuZXcgVGV4dCggR2FzUHJvcGVydGllc1N0cmluZ3MuaW5qZWN0aW9uVGVtcGVyYXR1cmVTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgZm9udDogR2FzUHJvcGVydGllc0NvbnN0YW50cy5USVRMRV9GT05ULFxyXG4gICAgICAgICAgZmlsbDogR2FzUHJvcGVydGllc0NvbG9ycy50ZXh0RmlsbFByb3BlcnR5XHJcbiAgICAgICAgfSApXHJcbiAgICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIExpbWl0IHdpZHRoIG9mIHRpdGxlXHJcbiAgICBvcHRpb25zLnRpdGxlTm9kZS5tYXhXaWR0aCA9IDAuNzUgKiBvcHRpb25zLmZpeGVkV2lkdGg7IC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuXHJcbiAgICAvLyBSYWRpbyBidXR0b25zXHJcbiAgICBjb25zdCByYWRpb0J1dHRvbkdyb3VwID0gbmV3IFZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXAoIGNvbnRyb2xUZW1wZXJhdHVyZUVuYWJsZWRQcm9wZXJ0eSwgW1xyXG4gICAgICB7XHJcbiAgICAgICAgdmFsdWU6IGZhbHNlLFxyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCBHYXNQcm9wZXJ0aWVzU3RyaW5ncy5tYXRjaENvbnRhaW5lclN0cmluZ1Byb3BlcnR5LCBURVhUX09QVElPTlMgKSxcclxuICAgICAgICB0YW5kZW1OYW1lOiAnbWF0Y2hDb250YWluZXJSYWRpb0J1dHRvbidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHZhbHVlOiB0cnVlLFxyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCBHYXNQcm9wZXJ0aWVzU3RyaW5ncy5zZXRUb1N0cmluZ1Byb3BlcnR5LCBURVhUX09QVElPTlMgKSxcclxuICAgICAgICB0YW5kZW1OYW1lOiAnc2V0VG9SYWRpb0J1dHRvbidcclxuICAgICAgfVxyXG4gICAgXSwge1xyXG4gICAgICBzcGFjaW5nOiAxMixcclxuICAgICAgcmFkaW9CdXR0b25PcHRpb25zOiBHYXNQcm9wZXJ0aWVzQ29uc3RhbnRzLkFRVUFfUkFESU9fQlVUVE9OX09QVElPTlMsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncmFkaW9CdXR0b25Hcm91cCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIE51bWJlckNvbnRyb2xcclxuICAgIGNvbnN0IHRlbXBlcmF0dXJlQ29udHJvbCA9IG5ldyBJbmplY3Rpb25UZW1wZXJhdHVyZUNvbnRyb2woIGluaXRpYWxUZW1wZXJhdHVyZVByb3BlcnR5LCB7XHJcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eTogY29udHJvbFRlbXBlcmF0dXJlRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RlbXBlcmF0dXJlQ29udHJvbCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGNvbnRlbnRXaWR0aCA9IG9wdGlvbnMuZml4ZWRXaWR0aCAtICggMiAqIG9wdGlvbnMuY29udGVudFhNYXJnaW4gKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IFZCb3goIHtcclxuICAgICAgcHJlZmVycmVkV2lkdGg6IGNvbnRlbnRXaWR0aCxcclxuICAgICAgd2lkdGhTaXphYmxlOiBmYWxzZSwgLy8gc28gdGhhdCB3aWR0aCB3aWxsIHJlbWFpbiBwcmVmZXJyZWRXaWR0aFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBzcGFjaW5nOiAxMixcclxuICAgICAgY2hpbGRyZW46IFsgcmFkaW9CdXR0b25Hcm91cCwgdGVtcGVyYXR1cmVDb250cm9sIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggY29udGVudCwgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmdhc1Byb3BlcnRpZXMucmVnaXN0ZXIoICdJbmplY3Rpb25UZW1wZXJhdHVyZUFjY29yZGlvbkJveCcsIEluamVjdGlvblRlbXBlcmF0dXJlQWNjb3JkaW9uQm94ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBSUEsU0FBU0EsVUFBVSxRQUFRLHVDQUF1QztBQUVsRSxTQUFTQyxJQUFJLEVBQWVDLElBQUksUUFBUSxtQ0FBbUM7QUFD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