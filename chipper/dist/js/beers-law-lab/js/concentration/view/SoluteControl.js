// Copyright 2013-2023, University of Colorado Boulder

/**
 * Combo box for choosing a solute.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Rectangle, RichText, Text } from '../../../../scenery/js/imports.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import beersLawLab from '../../beersLawLab.js';
import BeersLawLabStrings from '../../BeersLawLabStrings.js';
export default class SoluteControl extends HBox {
  constructor(selectedSoluteProperty, solutes, soluteListParent, providedOptions) {
    const options = optionize()({
      spacing: 10,
      comboBoxOptions: {
        // ComboBoxOptions
        listPosition: 'below',
        xMargin: 12,
        yMargin: 12,
        highlightFill: 'rgb( 218, 255, 255 )',
        cornerRadius: 8,
        tandem: Tandem.REQUIRED
      }
    }, providedOptions);
    const labelTextTandem = options.comboBoxOptions.tandem.createTandem('labelText');
    const stringProperty = new DerivedProperty([BeersLawLabStrings.pattern['0labelStringProperty'], BeersLawLabStrings.soluteStringProperty], (pattern, soluteString) => StringUtils.format(pattern, soluteString), {
      tandem: labelTextTandem.createTandem(Text.STRING_PROPERTY_TANDEM_NAME),
      phetioValueType: StringIO
    });

    // items
    const items = solutes.map(createItem);
    options.children = [new Text(stringProperty, {
      font: new PhetFont(22),
      maxWidth: 75,
      tandem: labelTextTandem
    }), new ComboBox(selectedSoluteProperty, items, soluteListParent, options.comboBoxOptions)];
    super(options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}

/**
 * Creates an item for the combo box.
 */
function createItem(solute) {
  const colorNode = new Rectangle(0, 0, 20, 20, {
    fill: solute.colorScheme.maxColor,
    stroke: solute.colorScheme.maxColor.darkerColor()
  });
  const textNode = new RichText(solute.nameProperty, {
    font: new PhetFont(20),
    maxWidth: 230 // determined empirically, so that English strings are not scaled down
    // No PhET-iO instrumentation is desired.
  });

  const hBox = new HBox({
    spacing: 5,
    children: [colorNode, textNode]
  });
  return {
    value: solute,
    createNode: () => hBox,
    tandemName: `${solute.tandemName}${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
  };
}
beersLawLab.register('SoluteControl', SoluteControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJvcHRpb25pemUiLCJTdHJpbmdVdGlscyIsIlBoZXRGb250IiwiSEJveCIsIlJlY3RhbmdsZSIsIlJpY2hUZXh0IiwiVGV4dCIsIkNvbWJvQm94IiwiVGFuZGVtIiwiU3RyaW5nSU8iLCJiZWVyc0xhd0xhYiIsIkJlZXJzTGF3TGFiU3RyaW5ncyIsIlNvbHV0ZUNvbnRyb2wiLCJjb25zdHJ1Y3RvciIsInNlbGVjdGVkU29sdXRlUHJvcGVydHkiLCJzb2x1dGVzIiwic29sdXRlTGlzdFBhcmVudCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJzcGFjaW5nIiwiY29tYm9Cb3hPcHRpb25zIiwibGlzdFBvc2l0aW9uIiwieE1hcmdpbiIsInlNYXJnaW4iLCJoaWdobGlnaHRGaWxsIiwiY29ybmVyUmFkaXVzIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJsYWJlbFRleHRUYW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJzdHJpbmdQcm9wZXJ0eSIsInBhdHRlcm4iLCJzb2x1dGVTdHJpbmdQcm9wZXJ0eSIsInNvbHV0ZVN0cmluZyIsImZvcm1hdCIsIlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSIsInBoZXRpb1ZhbHVlVHlwZSIsIml0ZW1zIiwibWFwIiwiY3JlYXRlSXRlbSIsImNoaWxkcmVuIiwiZm9udCIsIm1heFdpZHRoIiwiZGlzcG9zZSIsImFzc2VydCIsInNvbHV0ZSIsImNvbG9yTm9kZSIsImZpbGwiLCJjb2xvclNjaGVtZSIsIm1heENvbG9yIiwic3Ryb2tlIiwiZGFya2VyQ29sb3IiLCJ0ZXh0Tm9kZSIsIm5hbWVQcm9wZXJ0eSIsImhCb3giLCJ2YWx1ZSIsImNyZWF0ZU5vZGUiLCJ0YW5kZW1OYW1lIiwiSVRFTV9UQU5ERU1fTkFNRV9TVUZGSVgiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNvbHV0ZUNvbnRyb2wudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29tYm8gYm94IGZvciBjaG9vc2luZyBhIHNvbHV0ZS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBXaXRoUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1dpdGhSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgSEJveCwgSEJveE9wdGlvbnMsIE5vZGUsIFJlY3RhbmdsZSwgUmljaFRleHQsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQ29tYm9Cb3gsIHsgQ29tYm9Cb3hJdGVtLCBDb21ib0JveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ29tYm9Cb3guanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgU3RyaW5nSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0cmluZ0lPLmpzJztcclxuaW1wb3J0IGJlZXJzTGF3TGFiIGZyb20gJy4uLy4uL2JlZXJzTGF3TGFiLmpzJztcclxuaW1wb3J0IEJlZXJzTGF3TGFiU3RyaW5ncyBmcm9tICcuLi8uLi9CZWVyc0xhd0xhYlN0cmluZ3MuanMnO1xyXG5pbXBvcnQgU29sdXRlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Tb2x1dGUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBjb21ib0JveE9wdGlvbnM/OiBXaXRoUmVxdWlyZWQ8Q29tYm9Cb3hPcHRpb25zLCAndGFuZGVtJz47XHJcbn07XHJcblxyXG50eXBlIFNvbHV0ZUNvbWJvQm94T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxIQm94T3B0aW9ucywgJ2NoaWxkcmVuJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb2x1dGVDb250cm9sIGV4dGVuZHMgSEJveCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2VsZWN0ZWRTb2x1dGVQcm9wZXJ0eTogUHJvcGVydHk8U29sdXRlPiwgc29sdXRlczogU29sdXRlW10sIHNvbHV0ZUxpc3RQYXJlbnQ6IE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IFNvbHV0ZUNvbWJvQm94T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNvbHV0ZUNvbWJvQm94T3B0aW9ucywgU2VsZk9wdGlvbnMsIEhCb3hPcHRpb25zPigpKCB7XHJcbiAgICAgIHNwYWNpbmc6IDEwLFxyXG5cclxuICAgICAgY29tYm9Cb3hPcHRpb25zOiB7XHJcbiAgICAgICAgLy8gQ29tYm9Cb3hPcHRpb25zXHJcbiAgICAgICAgbGlzdFBvc2l0aW9uOiAnYmVsb3cnLFxyXG4gICAgICAgIHhNYXJnaW46IDEyLFxyXG4gICAgICAgIHlNYXJnaW46IDEyLFxyXG4gICAgICAgIGhpZ2hsaWdodEZpbGw6ICdyZ2IoIDIxOCwgMjU1LCAyNTUgKScsXHJcbiAgICAgICAgY29ybmVyUmFkaXVzOiA4LFxyXG4gICAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICAgIH1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGxhYmVsVGV4dFRhbmRlbSA9IG9wdGlvbnMuY29tYm9Cb3hPcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYWJlbFRleHQnICk7XHJcblxyXG4gICAgY29uc3Qgc3RyaW5nUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIEJlZXJzTGF3TGFiU3RyaW5ncy5wYXR0ZXJuWyAnMGxhYmVsU3RyaW5nUHJvcGVydHknIF0sIEJlZXJzTGF3TGFiU3RyaW5ncy5zb2x1dGVTdHJpbmdQcm9wZXJ0eSBdLFxyXG4gICAgICAoIHBhdHRlcm4sIHNvbHV0ZVN0cmluZyApID0+IFN0cmluZ1V0aWxzLmZvcm1hdCggcGF0dGVybiwgc29sdXRlU3RyaW5nICksIHtcclxuICAgICAgICB0YW5kZW06IGxhYmVsVGV4dFRhbmRlbS5jcmVhdGVUYW5kZW0oIFRleHQuU1RSSU5HX1BST1BFUlRZX1RBTkRFTV9OQU1FICksXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBTdHJpbmdJT1xyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIGl0ZW1zXHJcbiAgICBjb25zdCBpdGVtcyA9IHNvbHV0ZXMubWFwKCBjcmVhdGVJdGVtICk7XHJcblxyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFtcclxuICAgICAgbmV3IFRleHQoIHN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyMiApLFxyXG4gICAgICAgIG1heFdpZHRoOiA3NSxcclxuICAgICAgICB0YW5kZW06IGxhYmVsVGV4dFRhbmRlbVxyXG4gICAgICB9ICksXHJcbiAgICAgIG5ldyBDb21ib0JveCggc2VsZWN0ZWRTb2x1dGVQcm9wZXJ0eSwgaXRlbXMsIHNvbHV0ZUxpc3RQYXJlbnQsIG9wdGlvbnMuY29tYm9Cb3hPcHRpb25zIClcclxuICAgIF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhbiBpdGVtIGZvciB0aGUgY29tYm8gYm94LlxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlSXRlbSggc29sdXRlOiBTb2x1dGUgKTogQ29tYm9Cb3hJdGVtPFNvbHV0ZT4ge1xyXG5cclxuICBjb25zdCBjb2xvck5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAyMCwgMjAsIHtcclxuICAgIGZpbGw6IHNvbHV0ZS5jb2xvclNjaGVtZS5tYXhDb2xvcixcclxuICAgIHN0cm9rZTogc29sdXRlLmNvbG9yU2NoZW1lLm1heENvbG9yLmRhcmtlckNvbG9yKClcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IHRleHROb2RlID0gbmV3IFJpY2hUZXh0KCBzb2x1dGUubmFtZVByb3BlcnR5LCB7XHJcbiAgICBmb250OiBuZXcgUGhldEZvbnQoIDIwICksXHJcbiAgICBtYXhXaWR0aDogMjMwIC8vIGRldGVybWluZWQgZW1waXJpY2FsbHksIHNvIHRoYXQgRW5nbGlzaCBzdHJpbmdzIGFyZSBub3Qgc2NhbGVkIGRvd25cclxuICAgIC8vIE5vIFBoRVQtaU8gaW5zdHJ1bWVudGF0aW9uIGlzIGRlc2lyZWQuXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBoQm94ID0gbmV3IEhCb3goIHtcclxuICAgIHNwYWNpbmc6IDUsXHJcbiAgICBjaGlsZHJlbjogWyBjb2xvck5vZGUsIHRleHROb2RlIF1cclxuICB9ICk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICB2YWx1ZTogc29sdXRlLFxyXG4gICAgY3JlYXRlTm9kZTogKCkgPT4gaEJveCxcclxuICAgIHRhbmRlbU5hbWU6IGAke3NvbHV0ZS50YW5kZW1OYW1lfSR7Q29tYm9Cb3guSVRFTV9UQU5ERU1fTkFNRV9TVUZGSVh9YFxyXG4gIH07XHJcbn1cclxuXHJcbmJlZXJzTGF3TGFiLnJlZ2lzdGVyKCAnU29sdXRlQ29udHJvbCcsIFNvbHV0ZUNvbnRyb2wgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUVwRSxPQUFPQyxTQUFTLE1BQU0sdUNBQXVDO0FBRzdELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQXFCQyxTQUFTLEVBQUVDLFFBQVEsRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUN0RyxPQUFPQyxRQUFRLE1BQXlDLGdDQUFnQztBQUN4RixPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFTNUQsZUFBZSxNQUFNQyxhQUFhLFNBQVNULElBQUksQ0FBQztFQUV2Q1UsV0FBV0EsQ0FBRUMsc0JBQXdDLEVBQUVDLE9BQWlCLEVBQUVDLGdCQUFzQixFQUNuRkMsZUFBc0MsRUFBRztJQUUzRCxNQUFNQyxPQUFPLEdBQUdsQixTQUFTLENBQWtELENBQUMsQ0FBRTtNQUM1RW1CLE9BQU8sRUFBRSxFQUFFO01BRVhDLGVBQWUsRUFBRTtRQUNmO1FBQ0FDLFlBQVksRUFBRSxPQUFPO1FBQ3JCQyxPQUFPLEVBQUUsRUFBRTtRQUNYQyxPQUFPLEVB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