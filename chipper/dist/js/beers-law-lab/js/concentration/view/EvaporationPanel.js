// Copyright 2013-2023, University of Colorado Boulder

/**
 * Evaporation control panel.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Text } from '../../../../scenery/js/imports.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import beersLawLab from '../../beersLawLab.js';
import BeersLawLabStrings from '../../BeersLawLabStrings.js';
export default class EvaporationPanel extends Panel {
  constructor(evaporator, providedOptions) {
    const options = optionize()({
      // PanelOptions
      fill: '#F0F0F0',
      stroke: 'gray',
      xMargin: 15,
      yMargin: 8
    }, providedOptions);
    const labelTextTandem = options.tandem.createTandem('labelText');
    const stringProperty = new DerivedProperty([BeersLawLabStrings.pattern['0labelStringProperty'], BeersLawLabStrings.evaporationStringProperty], (pattern, evaporationString) => StringUtils.format(pattern, evaporationString), {
      tandem: labelTextTandem.createTandem(Text.STRING_PROPERTY_TANDEM_NAME),
      phetioValueType: StringIO
    });
    const labelText = new Text(stringProperty, {
      font: new PhetFont(22),
      maxWidth: 130,
      tandem: labelTextTandem
    });
    const sliderTandem = options.tandem.createTandem('slider');
    const slider = new HSlider(evaporator.evaporationRateProperty, evaporator.evaporationRateProperty.range, {
      trackSize: new Dimension2(150, 6),
      thumbSize: new Dimension2(22, 45),
      enabledProperty: evaporator.enabledProperty,
      // at end of drag, snap evaporation rate back to zero
      endDrag: () => {
        evaporator.evaporationRateProperty.value = 0;
      },
      tandem: sliderTandem
    });

    // Tick marks
    const tickOptions = {
      font: new PhetFont(16),
      maxWidth: 50
    };
    slider.addMajorTick(0, new Text(BeersLawLabStrings.noneStringProperty, combineOptions({
      tandem: sliderTandem.createTandem('minTickLabelText')
    }, tickOptions)));
    slider.addMajorTick(evaporator.maxEvaporationRate, new Text(BeersLawLabStrings.lotsStringProperty, combineOptions({
      tandem: sliderTandem.createTandem('maxTickLabelText')
    }, tickOptions)));
    const content = new HBox({
      children: [labelText, slider],
      spacing: 10
    });
    super(content, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
beersLawLab.register('EvaporationPanel', EvaporationPanel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJEaW1lbnNpb24yIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJTdHJpbmdVdGlscyIsIlBoZXRGb250IiwiSEJveCIsIlRleHQiLCJIU2xpZGVyIiwiUGFuZWwiLCJTdHJpbmdJTyIsImJlZXJzTGF3TGFiIiwiQmVlcnNMYXdMYWJTdHJpbmdzIiwiRXZhcG9yYXRpb25QYW5lbCIsImNvbnN0cnVjdG9yIiwiZXZhcG9yYXRvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJmaWxsIiwic3Ryb2tlIiwieE1hcmdpbiIsInlNYXJnaW4iLCJsYWJlbFRleHRUYW5kZW0iLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJzdHJpbmdQcm9wZXJ0eSIsInBhdHRlcm4iLCJldmFwb3JhdGlvblN0cmluZ1Byb3BlcnR5IiwiZXZhcG9yYXRpb25TdHJpbmciLCJmb3JtYXQiLCJTVFJJTkdfUFJPUEVSVFlfVEFOREVNX05BTUUiLCJwaGV0aW9WYWx1ZVR5cGUiLCJsYWJlbFRleHQiLCJmb250IiwibWF4V2lkdGgiLCJzbGlkZXJUYW5kZW0iLCJzbGlkZXIiLCJldmFwb3JhdGlvblJhdGVQcm9wZXJ0eSIsInJhbmdlIiwidHJhY2tTaXplIiwidGh1bWJTaXplIiwiZW5hYmxlZFByb3BlcnR5IiwiZW5kRHJhZyIsInZhbHVlIiwidGlja09wdGlvbnMiLCJhZGRNYWpvclRpY2siLCJub25lU3RyaW5nUHJvcGVydHkiLCJtYXhFdmFwb3JhdGlvblJhdGUiLCJsb3RzU3RyaW5nUHJvcGVydHkiLCJjb250ZW50IiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRXZhcG9yYXRpb25QYW5lbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBFdmFwb3JhdGlvbiBjb250cm9sIHBhbmVsLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBUZXh0LCBUZXh0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBIU2xpZGVyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9IU2xpZGVyLmpzJztcclxuaW1wb3J0IFBhbmVsLCB7IFBhbmVsT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBTdHJpbmdJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvU3RyaW5nSU8uanMnO1xyXG5pbXBvcnQgYmVlcnNMYXdMYWIgZnJvbSAnLi4vLi4vYmVlcnNMYXdMYWIuanMnO1xyXG5pbXBvcnQgQmVlcnNMYXdMYWJTdHJpbmdzIGZyb20gJy4uLy4uL0JlZXJzTGF3TGFiU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBFdmFwb3JhdG9yIGZyb20gJy4uL21vZGVsL0V2YXBvcmF0b3IuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIEV2YXBvcmF0aW9uUGFuZWxPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8UGFuZWxPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmFwb3JhdGlvblBhbmVsIGV4dGVuZHMgUGFuZWwge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGV2YXBvcmF0b3I6IEV2YXBvcmF0b3IsIHByb3ZpZGVkT3B0aW9uczogRXZhcG9yYXRpb25QYW5lbE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxFdmFwb3JhdGlvblBhbmVsT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBhbmVsT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gUGFuZWxPcHRpb25zXHJcbiAgICAgIGZpbGw6ICcjRjBGMEYwJyxcclxuICAgICAgc3Ryb2tlOiAnZ3JheScsXHJcbiAgICAgIHhNYXJnaW46IDE1LFxyXG4gICAgICB5TWFyZ2luOiA4XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBsYWJlbFRleHRUYW5kZW0gPSBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYWJlbFRleHQnICk7XHJcblxyXG4gICAgY29uc3Qgc3RyaW5nUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIEJlZXJzTGF3TGFiU3RyaW5ncy5wYXR0ZXJuWyAnMGxhYmVsU3RyaW5nUHJvcGVydHknIF0sIEJlZXJzTGF3TGFiU3RyaW5ncy5ldmFwb3JhdGlvblN0cmluZ1Byb3BlcnR5IF0sXHJcbiAgICAgICggcGF0dGVybiwgZXZhcG9yYXRpb25TdHJpbmcgKSA9PiBTdHJpbmdVdGlscy5mb3JtYXQoIHBhdHRlcm4sIGV2YXBvcmF0aW9uU3RyaW5nICksIHtcclxuICAgICAgICB0YW5kZW06IGxhYmVsVGV4dFRhbmRlbS5jcmVhdGVUYW5kZW0oIFRleHQuU1RSSU5HX1BST1BFUlRZX1RBTkRFTV9OQU1FICksXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBTdHJpbmdJT1xyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGxhYmVsVGV4dCA9IG5ldyBUZXh0KCBzdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDIyICksXHJcbiAgICAgIG1heFdpZHRoOiAxMzAsXHJcbiAgICAgIHRhbmRlbTogbGFiZWxUZXh0VGFuZGVtXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc2xpZGVyVGFuZGVtID0gb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2xpZGVyJyApO1xyXG5cclxuICAgIGNvbnN0IHNsaWRlciA9IG5ldyBIU2xpZGVyKCBldmFwb3JhdG9yLmV2YXBvcmF0aW9uUmF0ZVByb3BlcnR5LCBldmFwb3JhdG9yLmV2YXBvcmF0aW9uUmF0ZVByb3BlcnR5LnJhbmdlLCB7XHJcbiAgICAgIHRyYWNrU2l6ZTogbmV3IERpbWVuc2lvbjIoIDE1MCwgNiApLFxyXG4gICAgICB0aHVtYlNpemU6IG5ldyBEaW1lbnNpb24yKCAyMiwgNDUgKSxcclxuICAgICAgZW5hYmxlZFByb3BlcnR5OiBldmFwb3JhdG9yLmVuYWJsZWRQcm9wZXJ0eSxcclxuXHJcbiAgICAgIC8vIGF0IGVuZCBvZiBkcmFnLCBzbmFwIGV2YXBvcmF0aW9uIHJhdGUgYmFjayB0byB6ZXJvXHJcbiAgICAgIGVuZERyYWc6ICgpID0+IHtcclxuICAgICAgICBldmFwb3JhdG9yLmV2YXBvcmF0aW9uUmF0ZVByb3BlcnR5LnZhbHVlID0gMDtcclxuICAgICAgfSxcclxuICAgICAgdGFuZGVtOiBzbGlkZXJUYW5kZW1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBUaWNrIG1hcmtzXHJcbiAgICBjb25zdCB0aWNrT3B0aW9ucyA9IHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxNiApLFxyXG4gICAgICBtYXhXaWR0aDogNTBcclxuICAgIH07XHJcbiAgICBzbGlkZXIuYWRkTWFqb3JUaWNrKCAwLCBuZXcgVGV4dCggQmVlcnNMYXdMYWJTdHJpbmdzLm5vbmVTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgY29tYmluZU9wdGlvbnM8VGV4dE9wdGlvbnM+KCB7XHJcbiAgICAgICAgdGFuZGVtOiBzbGlkZXJUYW5kZW0uY3JlYXRlVGFuZGVtKCAnbWluVGlja0xhYmVsVGV4dCcgKVxyXG4gICAgICB9LCB0aWNrT3B0aW9ucyApICkgKTtcclxuICAgIHNsaWRlci5hZGRNYWpvclRpY2soIGV2YXBvcmF0b3IubWF4RXZhcG9yYXRpb25SYXRlLCBuZXcgVGV4dCggQmVlcnNMYXdMYWJTdHJpbmdzLmxvdHNTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgY29tYmluZU9wdGlvbnM8VGV4dE9wdGlvbnM+KCB7XHJcbiAgICAgICAgdGFuZGVtOiBzbGlkZXJUYW5kZW0uY3JlYXRlVGFuZGVtKCAnbWF4VGlja0xhYmVsVGV4dCcgKVxyXG4gICAgICB9LCB0aWNrT3B0aW9ucyApICkgKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgbGFiZWxUZXh0LCBzbGlkZXIgXSxcclxuICAgICAgc3BhY2luZzogMTBcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggY29udGVudCwgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmJlZXJzTGF3TGFiLnJlZ2lzdGVyKCAnRXZhcG9yYXRpb25QYW5lbCcsIEV2YXBvcmF0aW9uUGFuZWwgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLFNBQVMsSUFBSUMsY0FBYyxRQUEwQix1Q0FBdUM7QUFFbkcsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFxQixtQ0FBbUM7QUFDM0UsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQXdCLDZCQUE2QjtBQUNqRSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBTzVELGVBQWUsTUFBTUMsZ0JBQWdCLFNBQVNKLEtBQUssQ0FBQztFQUUzQ0ssV0FBV0EsQ0FBRUMsVUFBc0IsRUFBRUMsZUFBd0MsRUFBRztJQUVyRixNQUFNQyxPQUFPLEdBQUdmLFNBQVMsQ0FBcUQsQ0FBQyxDQUFFO01BRS9FO01BQ0FnQixJQUFJLEVBQUUsU0FBUztNQUNmQyxNQUFNLEVBQUUsTUFBTTtNQUNkQyxPQUFPLEVBQUUsRUFBRTtNQUNYQyxPQUFPLEVBQUU7SUFDWCxDQUFDLEVBQUVMLGVBQWdCLENBQUM7SUFFcEIsTUFBTU0sZUFBZSxHQUFHTCxPQUFPLENBQUNNLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLFdBQVksQ0FBQztJQUVsRSxNQUFNQyxjQUFjLEdBQUcsSUFBSXpCLGVBQWUsQ0FDeEMsQ0FBRVksa0JBQWtCLENBQUNjLE9BQU8sQ0FBRSxzQkFBc0IsQ0FBRSxFQUFFZCxrQkFBa0IsQ0FBQ2UseUJB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