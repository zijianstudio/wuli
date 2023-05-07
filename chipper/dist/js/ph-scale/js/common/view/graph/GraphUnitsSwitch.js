// Copyright 2020-2022, University of Colorado Boulder

/**
 * GraphScaleSwitch is the control for switching between Concentration and Quantity units for the graphs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import Dimension2 from '../../../../../dot/js/Dimension2.js';
import optionize from '../../../../../phet-core/js/optionize.js';
import { RichText } from '../../../../../scenery/js/imports.js';
import ABSwitch from '../../../../../sun/js/ABSwitch.js';
import StringIO from '../../../../../tandem/js/types/StringIO.js';
import phScale from '../../../phScale.js';
import PhScaleStrings from '../../../PhScaleStrings.js';
import PHScaleConstants from '../../PHScaleConstants.js';
import GraphUnits from './GraphUnits.js';
export default class GraphUnitsSwitch extends ABSwitch {
  constructor(graphUnitsProperty, provideOptions) {
    const options = optionize()({
      // ABSwitchOptions
      toggleSwitchOptions: {
        size: new Dimension2(50, 25)
      },
      centerOnSwitch: true,
      phetioDocumentation: 'A/B switch for switching units'
    }, provideOptions);

    // Concentration (mol/L)
    const concentrationTextTandem = options.tandem.createTandem('concentrationText');
    const concentrationStringProperty = new DerivedProperty([PhScaleStrings.concentrationStringProperty, PhScaleStrings.units.molesPerLiterStringProperty], (concentrationString, molesPerLiterString) => `${concentrationString}<br>(${molesPerLiterString})`, {
      tandem: concentrationTextTandem.createTandem(RichText.STRING_PROPERTY_TANDEM_NAME),
      phetioValueType: StringIO
    });
    const concentrationText = new RichText(concentrationStringProperty, {
      align: 'center',
      font: PHScaleConstants.AB_SWITCH_FONT,
      maxWidth: 125,
      tandem: concentrationTextTandem,
      phetioVisiblePropertyInstrumented: true
    });

    // Quantity (mol)
    const quantityTextTandem = options.tandem.createTandem('quantityText');
    const quantityStringProperty = new DerivedProperty([PhScaleStrings.quantityStringProperty, PhScaleStrings.units.molesStringProperty], (quantityString, molesString) => `${quantityString}<br>(${molesString})`, {
      tandem: quantityTextTandem.createTandem(RichText.STRING_PROPERTY_TANDEM_NAME),
      phetioValueType: StringIO
    });
    const quantityText = new RichText(quantityStringProperty, {
      align: 'center',
      font: PHScaleConstants.AB_SWITCH_FONT,
      maxWidth: 90,
      tandem: quantityTextTandem,
      phetioVisiblePropertyInstrumented: true
    });
    super(graphUnitsProperty, GraphUnits.MOLES_PER_LITER, concentrationText, GraphUnits.MOLES, quantityText, options);
  }
}
phScale.register('GraphUnitsSwitch', GraphUnitsSwitch);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJEaW1lbnNpb24yIiwib3B0aW9uaXplIiwiUmljaFRleHQiLCJBQlN3aXRjaCIsIlN0cmluZ0lPIiwicGhTY2FsZSIsIlBoU2NhbGVTdHJpbmdzIiwiUEhTY2FsZUNvbnN0YW50cyIsIkdyYXBoVW5pdHMiLCJHcmFwaFVuaXRzU3dpdGNoIiwiY29uc3RydWN0b3IiLCJncmFwaFVuaXRzUHJvcGVydHkiLCJwcm92aWRlT3B0aW9ucyIsIm9wdGlvbnMiLCJ0b2dnbGVTd2l0Y2hPcHRpb25zIiwic2l6ZSIsImNlbnRlck9uU3dpdGNoIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImNvbmNlbnRyYXRpb25UZXh0VGFuZGVtIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiY29uY2VudHJhdGlvblN0cmluZ1Byb3BlcnR5IiwidW5pdHMiLCJtb2xlc1BlckxpdGVyU3RyaW5nUHJvcGVydHkiLCJjb25jZW50cmF0aW9uU3RyaW5nIiwibW9sZXNQZXJMaXRlclN0cmluZyIsIlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSIsInBoZXRpb1ZhbHVlVHlwZSIsImNvbmNlbnRyYXRpb25UZXh0IiwiYWxpZ24iLCJmb250IiwiQUJfU1dJVENIX0ZPTlQiLCJtYXhXaWR0aCIsInBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCIsInF1YW50aXR5VGV4dFRhbmRlbSIsInF1YW50aXR5U3RyaW5nUHJvcGVydHkiLCJtb2xlc1N0cmluZ1Byb3BlcnR5IiwicXVhbnRpdHlTdHJpbmciLCJtb2xlc1N0cmluZyIsInF1YW50aXR5VGV4dCIsIk1PTEVTX1BFUl9MSVRFUiIsIk1PTEVTIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHcmFwaFVuaXRzU3dpdGNoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEdyYXBoU2NhbGVTd2l0Y2ggaXMgdGhlIGNvbnRyb2wgZm9yIHN3aXRjaGluZyBiZXR3ZWVuIENvbmNlbnRyYXRpb24gYW5kIFF1YW50aXR5IHVuaXRzIGZvciB0aGUgZ3JhcGhzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgeyBOb2RlVHJhbnNsYXRpb25PcHRpb25zLCBSaWNoVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBQlN3aXRjaCwgeyBBQlN3aXRjaE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvQUJTd2l0Y2guanMnO1xyXG5pbXBvcnQgU3RyaW5nSU8gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0cmluZ0lPLmpzJztcclxuaW1wb3J0IHBoU2NhbGUgZnJvbSAnLi4vLi4vLi4vcGhTY2FsZS5qcyc7XHJcbmltcG9ydCBQaFNjYWxlU3RyaW5ncyBmcm9tICcuLi8uLi8uLi9QaFNjYWxlU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBQSFNjYWxlQ29uc3RhbnRzIGZyb20gJy4uLy4uL1BIU2NhbGVDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgR3JhcGhVbml0cyBmcm9tICcuL0dyYXBoVW5pdHMuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIEdyYXBoVW5pdHNTd2l0Y2hPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlVHJhbnNsYXRpb25PcHRpb25zICYgUGlja1JlcXVpcmVkPEFCU3dpdGNoT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JhcGhVbml0c1N3aXRjaCBleHRlbmRzIEFCU3dpdGNoPEdyYXBoVW5pdHM+IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBncmFwaFVuaXRzUHJvcGVydHk6IEVudW1lcmF0aW9uUHJvcGVydHk8R3JhcGhVbml0cz4sIHByb3ZpZGVPcHRpb25zOiBHcmFwaFVuaXRzU3dpdGNoT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEdyYXBoVW5pdHNTd2l0Y2hPcHRpb25zLCBTZWxmT3B0aW9ucywgQUJTd2l0Y2hPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBBQlN3aXRjaE9wdGlvbnNcclxuICAgICAgdG9nZ2xlU3dpdGNoT3B0aW9uczogeyBzaXplOiBuZXcgRGltZW5zaW9uMiggNTAsIDI1ICkgfSxcclxuICAgICAgY2VudGVyT25Td2l0Y2g6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdBL0Igc3dpdGNoIGZvciBzd2l0Y2hpbmcgdW5pdHMnXHJcbiAgICB9LCBwcm92aWRlT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENvbmNlbnRyYXRpb24gKG1vbC9MKVxyXG4gICAgY29uc3QgY29uY2VudHJhdGlvblRleHRUYW5kZW0gPSBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb25jZW50cmF0aW9uVGV4dCcgKTtcclxuICAgIGNvbnN0IGNvbmNlbnRyYXRpb25TdHJpbmdQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgUGhTY2FsZVN0cmluZ3MuY29uY2VudHJhdGlvblN0cmluZ1Byb3BlcnR5LCBQaFNjYWxlU3RyaW5ncy51bml0cy5tb2xlc1BlckxpdGVyU3RyaW5nUHJvcGVydHkgXSxcclxuICAgICAgKCBjb25jZW50cmF0aW9uU3RyaW5nLCBtb2xlc1BlckxpdGVyU3RyaW5nICkgPT4gYCR7Y29uY2VudHJhdGlvblN0cmluZ308YnI+KCR7bW9sZXNQZXJMaXRlclN0cmluZ30pYCwge1xyXG4gICAgICAgIHRhbmRlbTogY29uY2VudHJhdGlvblRleHRUYW5kZW0uY3JlYXRlVGFuZGVtKCBSaWNoVGV4dC5TVFJJTkdfUFJPUEVSVFlfVEFOREVNX05BTUUgKSxcclxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IFN0cmluZ0lPXHJcbiAgICAgIH0gKTtcclxuICAgIGNvbnN0IGNvbmNlbnRyYXRpb25UZXh0ID0gbmV3IFJpY2hUZXh0KCBjb25jZW50cmF0aW9uU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgYWxpZ246ICdjZW50ZXInLFxyXG4gICAgICBmb250OiBQSFNjYWxlQ29uc3RhbnRzLkFCX1NXSVRDSF9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogMTI1LFxyXG4gICAgICB0YW5kZW06IGNvbmNlbnRyYXRpb25UZXh0VGFuZGVtLFxyXG4gICAgICBwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQ6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBRdWFudGl0eSAobW9sKVxyXG4gICAgY29uc3QgcXVhbnRpdHlUZXh0VGFuZGVtID0gb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncXVhbnRpdHlUZXh0JyApO1xyXG4gICAgY29uc3QgcXVhbnRpdHlTdHJpbmdQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgUGhTY2FsZVN0cmluZ3MucXVhbnRpdHlTdHJpbmdQcm9wZXJ0eSwgUGhTY2FsZVN0cmluZ3MudW5pdHMubW9sZXNTdHJpbmdQcm9wZXJ0eSBdLFxyXG4gICAgICAoIHF1YW50aXR5U3RyaW5nLCBtb2xlc1N0cmluZyApID0+IGAke3F1YW50aXR5U3RyaW5nfTxicj4oJHttb2xlc1N0cmluZ30pYCwge1xyXG4gICAgICAgIHRhbmRlbTogcXVhbnRpdHlUZXh0VGFuZGVtLmNyZWF0ZVRhbmRlbSggUmljaFRleHQuU1RSSU5HX1BST1BFUlRZX1RBTkRFTV9OQU1FICksXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBTdHJpbmdJT1xyXG4gICAgICB9ICk7XHJcbiAgICBjb25zdCBxdWFudGl0eVRleHQgPSBuZXcgUmljaFRleHQoIHF1YW50aXR5U3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgYWxpZ246ICdjZW50ZXInLFxyXG4gICAgICBmb250OiBQSFNjYWxlQ29uc3RhbnRzLkFCX1NXSVRDSF9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogOTAsXHJcbiAgICAgIHRhbmRlbTogcXVhbnRpdHlUZXh0VGFuZGVtLFxyXG4gICAgICBwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQ6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggZ3JhcGhVbml0c1Byb3BlcnR5LCBHcmFwaFVuaXRzLk1PTEVTX1BFUl9MSVRFUiwgY29uY2VudHJhdGlvblRleHQsIEdyYXBoVW5pdHMuTU9MRVMsIHF1YW50aXR5VGV4dCwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxucGhTY2FsZS5yZWdpc3RlciggJ0dyYXBoVW5pdHNTd2l0Y2gnLCBHcmFwaFVuaXRzU3dpdGNoICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSwyQ0FBMkM7QUFFdkUsT0FBT0MsVUFBVSxNQUFNLHFDQUFxQztBQUM1RCxP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