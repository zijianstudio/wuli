// Copyright 2017-2022, University of Colorado Boulder

/**
 * Accordion box that allows the student to modify the value of one or more variables.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import optionize, { optionize4 } from '../../../../phet-core/js/optionize.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import equalityExplorer from '../../equalityExplorer.js';
import EqualityExplorerStrings from '../../EqualityExplorerStrings.js';
import EqualityExplorerConstants from '../EqualityExplorerConstants.js';
import VariableNode from './VariableNode.js';
export default class VariablesAccordionBox extends AccordionBox {
  /**
   * @param variables - in the order that they appear in the accordion box, from left to right
   * @param providedOptions
   */
  constructor(variables, providedOptions) {
    assert && assert(variables.length > 0);
    const options = optionize4()({}, EqualityExplorerConstants.ACCORDION_BOX_OPTIONS, {
      // SelfOptions
      titleStringProperty: variables.length > 1 ? EqualityExplorerStrings.variablesStringProperty : EqualityExplorerStrings.variableStringProperty,
      fontSize: 24,
      fixedWidth: 100,
      fixedHeight: 75,
      // AccordionBoxOptions
      showTitleWhenExpanded: false,
      contentXMargin: 20,
      contentYMargin: 4
    }, providedOptions);
    options.maxWidth = options.fixedWidth;
    options.maxHeight = options.fixedHeight;
    const contentWidth = options.fixedWidth - 2 * options.contentXMargin;
    const contentHeight = options.fixedHeight - 2 * options.contentYMargin;
    options.titleNode = new Text(options.titleStringProperty, {
      font: EqualityExplorerConstants.ACCORDION_BOX_TITLE_FONT,
      maxWidth: 0.85 * contentWidth,
      tandem: options.tandem.createTandem('titleText')
    });
    const backgroundNode = new Rectangle(0, 0, contentWidth, contentHeight);

    // Create a labeled picker for each variable
    const children = variables.map(variable => new LabeledPicker(variable, {
      maxWidth: contentWidth,
      maxHeight: contentHeight,
      tandem: options.tandem.createTandem(`${variable.tandem.name}LabeledPicker`)
    }));
    const hBox = new HBox({
      children: children,
      spacing: 25,
      maxWidth: contentWidth
    });
    hBox.boundsProperty.link(bounds => {
      hBox.center = backgroundNode.center;
    });
    const contentNode = new Node({
      children: [backgroundNode, hBox]
    });
    super(contentNode, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}

/**
 * LabeledPicker is a NumberPicker with a label to the left of it.
 */

class LabeledPicker extends HBox {
  constructor(variable, providedOptions) {
    const options = optionize()({
      // LabeledPickerSelfOptions
      fontSize: 24,
      // HBoxOptions
      spacing: 5
    }, providedOptions);
    const variableNode = new VariableNode(variable, {
      iconScale: 0.55,
      fontSize: options.fontSize
    });
    const equalsText = new Text(MathSymbols.EQUAL_TO, {
      font: new PhetFont(options.fontSize)
    });
    const numberPicker = new NumberPicker(variable.valueProperty, new Property(variable.range), {
      color: 'black',
      font: new PhetFont(options.fontSize),
      xMargin: 6,
      touchAreaYDilation: 15,
      tandem: options.tandem.createTandem('numberPicker'),
      phetioVisiblePropertyInstrumented: false
    });
    options.children = [variableNode, equalsText, numberPicker];
    super(options);
  }
}
equalityExplorer.register('VariablesAccordionBox', VariablesAccordionBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsIm9wdGlvbml6ZTQiLCJNYXRoU3ltYm9scyIsIlBoZXRGb250IiwiSEJveCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiQWNjb3JkaW9uQm94IiwiTnVtYmVyUGlja2VyIiwiZXF1YWxpdHlFeHBsb3JlciIsIkVxdWFsaXR5RXhwbG9yZXJTdHJpbmdzIiwiRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cyIsIlZhcmlhYmxlTm9kZSIsIlZhcmlhYmxlc0FjY29yZGlvbkJveCIsImNvbnN0cnVjdG9yIiwidmFyaWFibGVzIiwicHJvdmlkZWRPcHRpb25zIiwiYXNzZXJ0IiwibGVuZ3RoIiwib3B0aW9ucyIsIkFDQ09SRElPTl9CT1hfT1BUSU9OUyIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJ2YXJpYWJsZXNTdHJpbmdQcm9wZXJ0eSIsInZhcmlhYmxlU3RyaW5nUHJvcGVydHkiLCJmb250U2l6ZSIsImZpeGVkV2lkdGgiLCJmaXhlZEhlaWdodCIsInNob3dUaXRsZVdoZW5FeHBhbmRlZCIsImNvbnRlbnRYTWFyZ2luIiwiY29udGVudFlNYXJnaW4iLCJtYXhXaWR0aCIsIm1heEhlaWdodCIsImNvbnRlbnRXaWR0aCIsImNvbnRlbnRIZWlnaHQiLCJ0aXRsZU5vZGUiLCJmb250IiwiQUNDT1JESU9OX0JPWF9USVRMRV9GT05UIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiYmFja2dyb3VuZE5vZGUiLCJjaGlsZHJlbiIsIm1hcCIsInZhcmlhYmxlIiwiTGFiZWxlZFBpY2tlciIsIm5hbWUiLCJoQm94Iiwic3BhY2luZyIsImJvdW5kc1Byb3BlcnR5IiwibGluayIsImJvdW5kcyIsImNlbnRlciIsImNvbnRlbnROb2RlIiwiZGlzcG9zZSIsInZhcmlhYmxlTm9kZSIsImljb25TY2FsZSIsImVxdWFsc1RleHQiLCJFUVVBTF9UTyIsIm51bWJlclBpY2tlciIsInZhbHVlUHJvcGVydHkiLCJyYW5nZSIsImNvbG9yIiwieE1hcmdpbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsInBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVmFyaWFibGVzQWNjb3JkaW9uQm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFjY29yZGlvbiBib3ggdGhhdCBhbGxvd3MgdGhlIHN0dWRlbnQgdG8gbW9kaWZ5IHRoZSB2YWx1ZSBvZiBvbmUgb3IgbW9yZSB2YXJpYWJsZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgb3B0aW9uaXplNCB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIEhCb3hPcHRpb25zLCBOb2RlLCBOb2RlVHJhbnNsYXRpb25PcHRpb25zLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQWNjb3JkaW9uQm94LCB7IEFjY29yZGlvbkJveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQWNjb3JkaW9uQm94LmpzJztcclxuaW1wb3J0IE51bWJlclBpY2tlciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvTnVtYmVyUGlja2VyLmpzJztcclxuaW1wb3J0IGVxdWFsaXR5RXhwbG9yZXIgZnJvbSAnLi4vLi4vZXF1YWxpdHlFeHBsb3Jlci5qcyc7XHJcbmltcG9ydCBFcXVhbGl0eUV4cGxvcmVyU3RyaW5ncyBmcm9tICcuLi8uLi9FcXVhbGl0eUV4cGxvcmVyU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzIGZyb20gJy4uL0VxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgVmFyaWFibGUgZnJvbSAnLi4vbW9kZWwvVmFyaWFibGUuanMnO1xyXG5pbXBvcnQgVmFyaWFibGVOb2RlIGZyb20gJy4vVmFyaWFibGVOb2RlLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgdGl0bGVTdHJpbmdQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz47XHJcbiAgZm9udFNpemU/OiBudW1iZXI7XHJcblxyXG4gIC8vIHRoaXMgYWNjb3JkaW9uIGJveCBpcyBkZXNpZ25lZCB0byBoYXZlIGEgZml4ZWQgc2l6ZSwgcmVnYXJkbGVzcyBvZiBpdHMgY29udGVudFxyXG4gIGZpeGVkV2lkdGg/OiBudW1iZXI7XHJcbiAgZml4ZWRIZWlnaHQ/OiBudW1iZXI7XHJcbn07XHJcblxyXG50eXBlIFZhcmlhYmxlc0FjY29yZGlvbkJveE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMgJlxyXG4gIFBpY2tSZXF1aXJlZDxBY2NvcmRpb25Cb3hPcHRpb25zLCAnZXhwYW5kZWRQcm9wZXJ0eScgfCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWYXJpYWJsZXNBY2NvcmRpb25Cb3ggZXh0ZW5kcyBBY2NvcmRpb25Cb3gge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gdmFyaWFibGVzIC0gaW4gdGhlIG9yZGVyIHRoYXQgdGhleSBhcHBlYXIgaW4gdGhlIGFjY29yZGlvbiBib3gsIGZyb20gbGVmdCB0byByaWdodFxyXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHZhcmlhYmxlczogVmFyaWFibGVbXSwgcHJvdmlkZWRPcHRpb25zOiBWYXJpYWJsZXNBY2NvcmRpb25Cb3hPcHRpb25zICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhcmlhYmxlcy5sZW5ndGggPiAwICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTQ8VmFyaWFibGVzQWNjb3JkaW9uQm94T3B0aW9ucywgU2VsZk9wdGlvbnMsIEFjY29yZGlvbkJveE9wdGlvbnM+KCkoIHt9LFxyXG4gICAgICBFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzLkFDQ09SRElPTl9CT1hfT1BUSU9OUywge1xyXG5cclxuICAgICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICAgIHRpdGxlU3RyaW5nUHJvcGVydHk6ICggdmFyaWFibGVzLmxlbmd0aCA+IDEgKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRXF1YWxpdHlFeHBsb3JlclN0cmluZ3MudmFyaWFibGVzU3RyaW5nUHJvcGVydHkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVxdWFsaXR5RXhwbG9yZXJTdHJpbmdzLnZhcmlhYmxlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgZm9udFNpemU6IDI0LFxyXG4gICAgICAgIGZpeGVkV2lkdGg6IDEwMCxcclxuICAgICAgICBmaXhlZEhlaWdodDogNzUsXHJcblxyXG4gICAgICAgIC8vIEFjY29yZGlvbkJveE9wdGlvbnNcclxuICAgICAgICBzaG93VGl0bGVXaGVuRXhwYW5kZWQ6IGZhbHNlLFxyXG4gICAgICAgIGNvbnRlbnRYTWFyZ2luOiAyMCxcclxuICAgICAgICBjb250ZW50WU1hcmdpbjogNFxyXG4gICAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBvcHRpb25zLm1heFdpZHRoID0gb3B0aW9ucy5maXhlZFdpZHRoO1xyXG4gICAgb3B0aW9ucy5tYXhIZWlnaHQgPSBvcHRpb25zLmZpeGVkSGVpZ2h0O1xyXG5cclxuICAgIGNvbnN0IGNvbnRlbnRXaWR0aCA9IG9wdGlvbnMuZml4ZWRXaWR0aCAtICggMiAqIG9wdGlvbnMuY29udGVudFhNYXJnaW4gKTtcclxuICAgIGNvbnN0IGNvbnRlbnRIZWlnaHQgPSBvcHRpb25zLmZpeGVkSGVpZ2h0IC0gKCAyICogb3B0aW9ucy5jb250ZW50WU1hcmdpbiApO1xyXG5cclxuICAgIG9wdGlvbnMudGl0bGVOb2RlID0gbmV3IFRleHQoIG9wdGlvbnMudGl0bGVTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzLkFDQ09SRElPTl9CT1hfVElUTEVfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDAuODUgKiBjb250ZW50V2lkdGgsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndGl0bGVUZXh0JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYmFja2dyb3VuZE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBjb250ZW50V2lkdGgsIGNvbnRlbnRIZWlnaHQgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBsYWJlbGVkIHBpY2tlciBmb3IgZWFjaCB2YXJpYWJsZVxyXG4gICAgY29uc3QgY2hpbGRyZW4gPSB2YXJpYWJsZXMubWFwKCB2YXJpYWJsZSA9PiBuZXcgTGFiZWxlZFBpY2tlciggdmFyaWFibGUsIHtcclxuICAgICAgbWF4V2lkdGg6IGNvbnRlbnRXaWR0aCxcclxuICAgICAgbWF4SGVpZ2h0OiBjb250ZW50SGVpZ2h0LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggYCR7dmFyaWFibGUudGFuZGVtLm5hbWV9TGFiZWxlZFBpY2tlcmAgKVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgY29uc3QgaEJveCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBjaGlsZHJlbixcclxuICAgICAgc3BhY2luZzogMjUsXHJcbiAgICAgIG1heFdpZHRoOiBjb250ZW50V2lkdGhcclxuICAgIH0gKTtcclxuICAgIGhCb3guYm91bmRzUHJvcGVydHkubGluayggYm91bmRzID0+IHtcclxuICAgICAgaEJveC5jZW50ZXIgPSBiYWNrZ3JvdW5kTm9kZS5jZW50ZXI7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY29udGVudE5vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyBiYWNrZ3JvdW5kTm9kZSwgaEJveCBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGNvbnRlbnROb2RlLCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIExhYmVsZWRQaWNrZXIgaXMgYSBOdW1iZXJQaWNrZXIgd2l0aCBhIGxhYmVsIHRvIHRoZSBsZWZ0IG9mIGl0LlxyXG4gKi9cclxuXHJcbnR5cGUgTGFiZWxlZFBpY2tlclNlbGZPcHRpb25zID0ge1xyXG4gIGZvbnRTaXplPzogbnVtYmVyO1xyXG59O1xyXG5cclxudHlwZSBMYWJlbGVkUGlja2VyT3B0aW9ucyA9IExhYmVsZWRQaWNrZXJTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxIQm94T3B0aW9ucywgJ3RhbmRlbScgfCAnbWF4V2lkdGgnIHwgJ21heEhlaWdodCc+O1xyXG5cclxuY2xhc3MgTGFiZWxlZFBpY2tlciBleHRlbmRzIEhCb3gge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHZhcmlhYmxlOiBWYXJpYWJsZSwgcHJvdmlkZWRPcHRpb25zOiBMYWJlbGVkUGlja2VyT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPExhYmVsZWRQaWNrZXJPcHRpb25zLCBMYWJlbGVkUGlja2VyU2VsZk9wdGlvbnMsIEhCb3hPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBMYWJlbGVkUGlja2VyU2VsZk9wdGlvbnNcclxuICAgICAgZm9udFNpemU6IDI0LFxyXG5cclxuICAgICAgLy8gSEJveE9wdGlvbnNcclxuICAgICAgc3BhY2luZzogNVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgdmFyaWFibGVOb2RlID0gbmV3IFZhcmlhYmxlTm9kZSggdmFyaWFibGUsIHtcclxuICAgICAgaWNvblNjYWxlOiAwLjU1LFxyXG4gICAgICBmb250U2l6ZTogb3B0aW9ucy5mb250U2l6ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGVxdWFsc1RleHQgPSBuZXcgVGV4dCggTWF0aFN5bWJvbHMuRVFVQUxfVE8sIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCBvcHRpb25zLmZvbnRTaXplIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBudW1iZXJQaWNrZXIgPSBuZXcgTnVtYmVyUGlja2VyKCB2YXJpYWJsZS52YWx1ZVByb3BlcnR5LCBuZXcgUHJvcGVydHkoIHZhcmlhYmxlLnJhbmdlICksIHtcclxuICAgICAgY29sb3I6ICdibGFjaycsXHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggb3B0aW9ucy5mb250U2l6ZSApLFxyXG4gICAgICB4TWFyZ2luOiA2LFxyXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDE1LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ251bWJlclBpY2tlcicgKSxcclxuICAgICAgcGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIHZhcmlhYmxlTm9kZSwgZXF1YWxzVGV4dCwgbnVtYmVyUGlja2VyIF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmVxdWFsaXR5RXhwbG9yZXIucmVnaXN0ZXIoICdWYXJpYWJsZXNBY2NvcmRpb25Cb3gnLCBWYXJpYWJsZXNBY2NvcmRpb25Cb3ggKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUV0RCxPQUFPQyxTQUFTLElBQUlDLFVBQVUsUUFBUSx1Q0FBdUM7QUFFN0UsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBZUMsSUFBSSxFQUEwQkMsU0FBUyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3BILE9BQU9DLFlBQVksTUFBK0Isb0NBQW9DO0FBQ3RGLE9BQU9DLFlBQVksTUFBTSxvQ0FBb0M7QUFDN0QsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFPQyx5QkFBeUIsTUFBTSxpQ0FBaUM7QUFFdkUsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQWM1QyxlQUFlLE1BQU1DLHFCQUFxQixTQUFTTixZQUFZLENBQUM7RUFFOUQ7QUFDRjtBQUNBO0FBQ0E7RUFDU08sV0FBV0EsQ0FBRUMsU0FBcUIsRUFBRUMsZUFBNkMsRUFBRztJQUV6RkMsTUFBTSxJQUFJQSxNQUFNLENBQUVGLFNBQVMsQ0FBQ0csTUFBTSxHQUFHLENBQUUsQ0FBQztJQUV4QyxNQUFNQyxPQUFPLEdBQUduQixVQUFVLENBQWlFLENBQUMsQ0FBRSxDQUFDLENBQUMsRUFDOUZXLHlCQUF5QixDQUFDUyxxQkFBcUIsRUFBRTtNQUUvQztNQUNBQyxtQkFBbUIsRUFBSU4sU0FBUyxDQUFDRyxNQUFNLEdBQUcsQ0FBQyxHQUN0QlIsdUJBQXVCLENBQUNZLHVCQUF1QixHQUMvQ1osdUJBQXVCLENBQUNhLHNCQUFzQjtNQUNuRUMsUUFBUSxFQUFFLEVBQUU7TUFDWkMsVUFBVSxFQUFFLEdBQUc7TUFDZkMsV0FBVyxFQUFFLEVBQUU7TUFFZjtNQUNBQyxxQkFBcUIsRUFBRSxLQUFLO01BQzVCQyxjQUFjLEVBQUUsRUFBRTtNQUNsQkMsY0FBYyxFQUFFO0lBQ2xCLENBQUMsRUFBRWIsZUFBZ0IsQ0FBQztJQUV0QkcsT0FBTyxDQUFDVyxRQUFRLEdBQUdYLE9BQU8sQ0FBQ00sVUFBVTtJQUNyQ04sT0FBTyxDQUFDWSxTQUFTLEdBQUdaLE9BQU8sQ0FBQ08sV0FBVztJQUV2QyxNQUFNTSxZQUFZLEdBQUdiLE9BQU8sQ0FBQ00sVUFBVSxHQUFLLENBQUMsR0FBR04sT0FBTyxDQUFDUyxjQUFnQjtJQUN4RSxNQUFNSyxhQUFhLEdBQUdkLE9BQU8sQ0FBQ08sV0FBVyxHQUFLLENBQUMsR0FBR1AsT0FBTyxDQUFDVSxjQUFnQjtJQUUxRVYsT0FBTyxDQUFDZSxTQUFTLEdBQUcsSUFBSTVCLElBQUksQ0FBRWEsT0FBTyxDQUFDRSxtQkFBbUIsRUFBRTtNQUN6RGMsSUFBSSxFQUFFeEIseUJBQXlCLENBQUN5Qix3QkFBd0I7TUFDeEROLFFBQVEsRUFBRSxJQUFJLEdBQUdFLFlBQVk7TUFDN0JLLE1BQU0sRUFBRWxCLE9BQU8sQ0FBQ2tCLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLFdBQVk7SUFDbkQsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsY0FBYyxHQUFHLElBQUlsQyxTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTJCLFlBQVksRUFBRUMsYUFBYyxDQUFDOztJQUV6RTtJQUNBLE1BQU1PLFFBQVEsR0FBR3pCLFNBQVMsQ0FBQzBCLEdBQUcsQ0FBRUMsUUFBUSxJQUFJLElBQUlDLGFBQWEsQ0FBRUQsUUFBUSxFQUFFO01BQ3ZFWixRQUFRLEVBQUVFLFlBQVk7TUFDdEJELFNBQVMsRUFBRUUsYUFBYTtNQUN4QkksTUFBTSxFQUFFbEIsT0FBTyxDQUFDa0IsTUFBTSxDQUFDQyxZQUFZLENBQUcsR0FBRUksUUFBUSxDQUFDTCxNQUFNLENBQUNPLElBQUssZUFBZTtJQUM5RSxDQUFFLENBQUUsQ0FBQztJQUVMLE1BQU1DLElBQUksR0FBRyxJQUFJMUMsSUFBSSxDQUFFO01BQ3JCcUMsUUFBUSxFQUFFQSxRQUFRO01BQ2xCTSxPQUFPLEVBQUUsRUFBRTtNQUNYaEIsUUFBUSxFQUFFRTtJQUNaLENBQUUsQ0FBQztJQUNIYSxJQUFJLENBQUNFLGNBQWMsQ0FBQ0MsSUFBSSxDQUFFQyxNQUFNLElBQUk7TUFDbENKLElBQUksQ0FBQ0ssTUFBTSxHQUFHWCxjQUFjLENBQUNXLE1BQU07SUFDckMsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsV0FBVyxHQUFHLElBQUkvQyxJQUFJLENBQUU7TUFDNUJvQyxRQUFRLEVBQUUsQ0FBRUQsY0FBYyxFQUFFTSxJQUFJO0lBQ2xDLENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRU0sV0FBVyxFQUFFaEMsT0FBUSxDQUFDO0VBQy9CO0VBRWdCaUMsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCbkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ21DLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7O0FBRUE7QUFDQTtBQUNBOztBQVFBLE1BQU1ULGFBQWEsU0FBU3hDLElBQUksQ0FBQztFQUV4QlcsV0FBV0EsQ0FBRTRCLFFBQWtCLEVBQUUxQixlQUFxQyxFQUFHO0lBRTlFLE1BQU1HLE9BQU8sR0FBR3BCLFNBQVMsQ0FBOEQsQ0FBQyxDQUFFO01BRXhGO01BQ0F5QixRQUFRLEVBQUUsRUFBRTtNQUVaO01BQ0FzQixPQUFPLEVBQUU7SUFDWCxDQUFDLEVBQUU5QixlQUFnQixDQUFDO0lBRXBCLE1BQU1xQyxZQUFZLEdBQUcsSUFBSXpDLFlBQVksQ0FBRThCLFFBQVEsRUFBRTtNQUMvQ1ksU0FBUyxFQUFFLElBQUk7TUFDZjlCLFFBQVEsRUFBRUwsT0FBTyxDQUFDSztJQUNwQixDQUFFLENBQUM7SUFFSCxNQUFNK0IsVUFBVSxHQUFHLElBQUlqRCxJQUFJLENBQUVMLFdBQVcsQ0FBQ3VELFFBQVEsRUFBRTtNQUNqRHJCLElBQUksRUFBRSxJQUFJakMsUUFBUSxDQUFFaUIsT0FBTyxDQUFDSyxRQUFTO0lBQ3ZDLENBQUUsQ0FBQztJQUVILE1BQU1pQyxZQUFZLEdBQUcsSUFBSWpELFlBQVksQ0FBRWtDLFFBQVEsQ0FBQ2dCLGFBQWEsRUFBRSxJQUFJNUQsUUFBUSxDQUFFNEMsUUFBUSxDQUFDaUIsS0FBTSxDQUFDLEVBQUU7TUFDN0ZDLEtBQUssRUFBRSxPQUFPO01BQ2R6QixJQUFJLEVBQUUsSUFBSWpDLFFBQVEsQ0FBRWlCLE9BQU8sQ0FBQ0ssUUFBUyxDQUFDO01BQ3RDcUMsT0FBTyxFQUFFLENBQUM7TUFDVkMsa0JBQWtCLEVBQUUsRUFBRTtNQUN0QnpCLE1BQU0sRUFBRWxCLE9BQU8sQ0FBQ2tCLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLGNBQWUsQ0FBQztNQUNyRHlCLGlDQUFpQyxFQUFFO0lBQ3JDLENBQUUsQ0FBQztJQUVINUMsT0FBTyxDQUFDcUIsUUFBUSxHQUFHLENBQUVhLFlBQVksRUFBRUUsVUFBVSxFQUFFRSxZQUFZLENBQUU7SUFFN0QsS0FBSyxDQUFFdEMsT0FBUSxDQUFDO0VBQ2xCO0FBQ0Y7QUFFQVYsZ0JBQWdCLENBQUN1RCxRQUFRLENBQUUsdUJBQXVCLEVBQUVuRCxxQkFBc0IsQ0FBQyJ9