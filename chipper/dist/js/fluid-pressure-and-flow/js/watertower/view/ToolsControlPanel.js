// Copyright 2014-2022, University of Colorado Boulder

/**
 * Control panel that contains various tools (measuring tape, ruler, hose).
 *
 * @author Siddhartha Chinthapally (ActualConcepts)
 */

import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import measuringTape_png from '../../../../scenery-phet/images/measuringTape_png.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import RulerNode from '../../../../scenery-phet/js/RulerNode.js';
import { HBox, HStrut, Image, Path, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import nozzle_png from '../../../images/nozzle_png.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
import FluidPressureAndFlowStrings from '../../FluidPressureAndFlowStrings.js';
const hoseString = FluidPressureAndFlowStrings.hose;
const measuringTapeString = FluidPressureAndFlowStrings.measuringTape;
const rulerString = FluidPressureAndFlowStrings.ruler;
class ToolsControlPanel extends Panel {
  /**
   * @param {WaterTowerModel} waterTowerModel of the simulation
   * @param {Object} [options]
   */
  constructor(waterTowerModel, options) {
    options = merge({
      xMargin: 10,
      yMargin: 10,
      fill: '#f2fa6a ',
      stroke: 'gray',
      lineWidth: 1,
      resize: false,
      scale: 0.9
    }, options);
    const textOptions = {
      font: new PhetFont(14)
    };

    // itemSpec describes the pieces that make up an item in the control panel, conforms to the contract: { label: {Node}, icon: {Node} }
    const ruler = {
      label: new Text(rulerString, textOptions),
      icon: createRulerIcon()
    };
    const measuringTape = {
      label: new Text(measuringTapeString, textOptions),
      icon: createMeasuringTapeIcon()
    };
    const hose = {
      label: new Text(hoseString, textOptions),
      icon: createHoseIcon()
    };

    // compute the maximum item width
    const widestItemSpec = _.maxBy([ruler, measuringTape, hose], item => item.label.width + item.icon.width);
    const maxWidth = widestItemSpec.label.width + widestItemSpec.icon.width;

    // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
    function createItem(itemSpec) {
      const strutWidth = maxWidth - itemSpec.label.width - itemSpec.icon.width + 5;
      return new HBox({
        children: [itemSpec.label, new HStrut(strutWidth), itemSpec.icon]
      });
    }
    const checkboxOptions = {
      boxWidth: 18,
      spacing: 5
    };

    // pad all the rows so the text nodes are left aligned and the icons is right aligned
    const checkboxChildren = [new Checkbox(waterTowerModel.isRulerVisibleProperty, createItem(ruler), checkboxOptions), new Checkbox(waterTowerModel.isMeasuringTapeVisibleProperty, createItem(measuringTape), checkboxOptions), new Checkbox(waterTowerModel.isHoseVisibleProperty, createItem(hose), checkboxOptions)];
    const checkboxes = new VBox({
      align: 'left',
      spacing: 10,
      children: checkboxChildren
    });
    super(checkboxes, options);
  }
}

// Create an icon for the ruler checkbox
function createRulerIcon() {
  return new RulerNode(30, 20, 15, ['0', '1', '2'], '', {
    insetsWidth: 7,
    minorTicksPerMajorTick: 4,
    majorTickFont: new PhetFont(12),
    clipArea: Shape.rect(-1, -1, 44, 22)
  });
}

// Create an icon for the hose
function createHoseIcon() {
  const icon = new Path(new Shape().moveTo(0, 0).arc(-16, 8, 8, -Math.PI / 2, Math.PI / 2, true).lineTo(10, 16).lineTo(10, 0).lineTo(0, 0), {
    stroke: 'grey',
    lineWidth: 1,
    fill: '#00FF00'
  });
  icon.addChild(new Image(nozzle_png, {
    cursor: 'pointer',
    rotation: Math.PI / 2,
    scale: 0.8,
    left: icon.right,
    bottom: icon.bottom + 3
  }));
  return icon;
}

// Create an icon for the measuring tape
function createMeasuringTapeIcon() {
  const icon = new Image(measuringTape_png, {
    cursor: 'pointer',
    scale: 0.6
  });
  const size = 5;
  icon.addChild(new Path(new Shape().moveTo(-size, 0).lineTo(size, 0).moveTo(0, -size).lineTo(0, size), {
    stroke: '#E05F20',
    lineWidth: 2,
    left: icon.right + 12,
    top: icon.bottom + 12
  }));
  return icon;
}
fluidPressureAndFlow.register('ToolsControlPanel', ToolsControlPanel);
export default ToolsControlPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIm1lcmdlIiwibWVhc3VyaW5nVGFwZV9wbmciLCJQaGV0Rm9udCIsIlJ1bGVyTm9kZSIsIkhCb3giLCJIU3RydXQiLCJJbWFnZSIsIlBhdGgiLCJUZXh0IiwiVkJveCIsIkNoZWNrYm94IiwiUGFuZWwiLCJub3p6bGVfcG5nIiwiZmx1aWRQcmVzc3VyZUFuZEZsb3ciLCJGbHVpZFByZXNzdXJlQW5kRmxvd1N0cmluZ3MiLCJob3NlU3RyaW5nIiwiaG9zZSIsIm1lYXN1cmluZ1RhcGVTdHJpbmciLCJtZWFzdXJpbmdUYXBlIiwicnVsZXJTdHJpbmciLCJydWxlciIsIlRvb2xzQ29udHJvbFBhbmVsIiwiY29uc3RydWN0b3IiLCJ3YXRlclRvd2VyTW9kZWwiLCJvcHRpb25zIiwieE1hcmdpbiIsInlNYXJnaW4iLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwicmVzaXplIiwic2NhbGUiLCJ0ZXh0T3B0aW9ucyIsImZvbnQiLCJsYWJlbCIsImljb24iLCJjcmVhdGVSdWxlckljb24iLCJjcmVhdGVNZWFzdXJpbmdUYXBlSWNvbiIsImNyZWF0ZUhvc2VJY29uIiwid2lkZXN0SXRlbVNwZWMiLCJfIiwibWF4QnkiLCJpdGVtIiwid2lkdGgiLCJtYXhXaWR0aCIsImNyZWF0ZUl0ZW0iLCJpdGVtU3BlYyIsInN0cnV0V2lkdGgiLCJjaGlsZHJlbiIsImNoZWNrYm94T3B0aW9ucyIsImJveFdpZHRoIiwic3BhY2luZyIsImNoZWNrYm94Q2hpbGRyZW4iLCJpc1J1bGVyVmlzaWJsZVByb3BlcnR5IiwiaXNNZWFzdXJpbmdUYXBlVmlzaWJsZVByb3BlcnR5IiwiaXNIb3NlVmlzaWJsZVByb3BlcnR5IiwiY2hlY2tib3hlcyIsImFsaWduIiwiaW5zZXRzV2lkdGgiLCJtaW5vclRpY2tzUGVyTWFqb3JUaWNrIiwibWFqb3JUaWNrRm9udCIsImNsaXBBcmVhIiwicmVjdCIsIm1vdmVUbyIsImFyYyIsIk1hdGgiLCJQSSIsImxpbmVUbyIsImFkZENoaWxkIiwiY3Vyc29yIiwicm90YXRpb24iLCJsZWZ0IiwicmlnaHQiLCJib3R0b20iLCJzaXplIiwidG9wIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUb29sc0NvbnRyb2xQYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250cm9sIHBhbmVsIHRoYXQgY29udGFpbnMgdmFyaW91cyB0b29scyAobWVhc3VyaW5nIHRhcGUsIHJ1bGVyLCBob3NlKS5cclxuICpcclxuICogQGF1dGhvciBTaWRkaGFydGhhIENoaW50aGFwYWxseSAoQWN0dWFsQ29uY2VwdHMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IG1lYXN1cmluZ1RhcGVfcG5nIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9pbWFnZXMvbWVhc3VyaW5nVGFwZV9wbmcuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IFJ1bGVyTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUnVsZXJOb2RlLmpzJztcclxuaW1wb3J0IHsgSEJveCwgSFN0cnV0LCBJbWFnZSwgUGF0aCwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDaGVja2JveCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IG5venpsZV9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL25venpsZV9wbmcuanMnO1xyXG5pbXBvcnQgZmx1aWRQcmVzc3VyZUFuZEZsb3cgZnJvbSAnLi4vLi4vZmx1aWRQcmVzc3VyZUFuZEZsb3cuanMnO1xyXG5pbXBvcnQgRmx1aWRQcmVzc3VyZUFuZEZsb3dTdHJpbmdzIGZyb20gJy4uLy4uL0ZsdWlkUHJlc3N1cmVBbmRGbG93U3RyaW5ncy5qcyc7XHJcblxyXG5jb25zdCBob3NlU3RyaW5nID0gRmx1aWRQcmVzc3VyZUFuZEZsb3dTdHJpbmdzLmhvc2U7XHJcbmNvbnN0IG1lYXN1cmluZ1RhcGVTdHJpbmcgPSBGbHVpZFByZXNzdXJlQW5kRmxvd1N0cmluZ3MubWVhc3VyaW5nVGFwZTtcclxuY29uc3QgcnVsZXJTdHJpbmcgPSBGbHVpZFByZXNzdXJlQW5kRmxvd1N0cmluZ3MucnVsZXI7XHJcblxyXG5cclxuY2xhc3MgVG9vbHNDb250cm9sUGFuZWwgZXh0ZW5kcyBQYW5lbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7V2F0ZXJUb3dlck1vZGVsfSB3YXRlclRvd2VyTW9kZWwgb2YgdGhlIHNpbXVsYXRpb25cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHdhdGVyVG93ZXJNb2RlbCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgeE1hcmdpbjogMTAsXHJcbiAgICAgIHlNYXJnaW46IDEwLFxyXG4gICAgICBmaWxsOiAnI2YyZmE2YSAnLFxyXG4gICAgICBzdHJva2U6ICdncmF5JyxcclxuICAgICAgbGluZVdpZHRoOiAxLFxyXG4gICAgICByZXNpemU6IGZhbHNlLFxyXG4gICAgICBzY2FsZTogMC45XHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgdGV4dE9wdGlvbnMgPSB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMTQgKSB9O1xyXG5cclxuICAgIC8vIGl0ZW1TcGVjIGRlc2NyaWJlcyB0aGUgcGllY2VzIHRoYXQgbWFrZSB1cCBhbiBpdGVtIGluIHRoZSBjb250cm9sIHBhbmVsLCBjb25mb3JtcyB0byB0aGUgY29udHJhY3Q6IHsgbGFiZWw6IHtOb2RlfSwgaWNvbjoge05vZGV9IH1cclxuICAgIGNvbnN0IHJ1bGVyID0geyBsYWJlbDogbmV3IFRleHQoIHJ1bGVyU3RyaW5nLCB0ZXh0T3B0aW9ucyApLCBpY29uOiBjcmVhdGVSdWxlckljb24oKSB9O1xyXG4gICAgY29uc3QgbWVhc3VyaW5nVGFwZSA9IHsgbGFiZWw6IG5ldyBUZXh0KCBtZWFzdXJpbmdUYXBlU3RyaW5nLCB0ZXh0T3B0aW9ucyApLCBpY29uOiBjcmVhdGVNZWFzdXJpbmdUYXBlSWNvbigpIH07XHJcbiAgICBjb25zdCBob3NlID0geyBsYWJlbDogbmV3IFRleHQoIGhvc2VTdHJpbmcsIHRleHRPcHRpb25zICksIGljb246IGNyZWF0ZUhvc2VJY29uKCkgfTtcclxuXHJcbiAgICAvLyBjb21wdXRlIHRoZSBtYXhpbXVtIGl0ZW0gd2lkdGhcclxuICAgIGNvbnN0IHdpZGVzdEl0ZW1TcGVjID0gXy5tYXhCeSggWyBydWxlciwgbWVhc3VyaW5nVGFwZSwgaG9zZSBdLFxyXG4gICAgICBpdGVtID0+IGl0ZW0ubGFiZWwud2lkdGggKyBpdGVtLmljb24ud2lkdGggKTtcclxuICAgIGNvbnN0IG1heFdpZHRoID0gd2lkZXN0SXRlbVNwZWMubGFiZWwud2lkdGggKyB3aWRlc3RJdGVtU3BlYy5pY29uLndpZHRoO1xyXG5cclxuICAgIC8vIHBhZCBpbnNlcnRzIGEgc3BhY2luZyBub2RlIChIU3RydXQpIHNvIHRoYXQgdGhlIHRleHQsIHNwYWNlIGFuZCBpbWFnZSB0b2dldGhlciBvY2N1cHkgYSBjZXJ0YWluIGZpeGVkIHdpZHRoLlxyXG4gICAgZnVuY3Rpb24gY3JlYXRlSXRlbSggaXRlbVNwZWMgKSB7XHJcbiAgICAgIGNvbnN0IHN0cnV0V2lkdGggPSBtYXhXaWR0aCAtIGl0ZW1TcGVjLmxhYmVsLndpZHRoIC0gaXRlbVNwZWMuaWNvbi53aWR0aCArIDU7XHJcbiAgICAgIHJldHVybiBuZXcgSEJveCggeyBjaGlsZHJlbjogWyBpdGVtU3BlYy5sYWJlbCwgbmV3IEhTdHJ1dCggc3RydXRXaWR0aCApLCBpdGVtU3BlYy5pY29uIF0gfSApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNoZWNrYm94T3B0aW9ucyA9IHtcclxuICAgICAgYm94V2lkdGg6IDE4LFxyXG4gICAgICBzcGFjaW5nOiA1XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIHBhZCBhbGwgdGhlIHJvd3Mgc28gdGhlIHRleHQgbm9kZXMgYXJlIGxlZnQgYWxpZ25lZCBhbmQgdGhlIGljb25zIGlzIHJpZ2h0IGFsaWduZWRcclxuICAgIGNvbnN0IGNoZWNrYm94Q2hpbGRyZW4gPSBbXHJcbiAgICAgIG5ldyBDaGVja2JveCggd2F0ZXJUb3dlck1vZGVsLmlzUnVsZXJWaXNpYmxlUHJvcGVydHksIGNyZWF0ZUl0ZW0oIHJ1bGVyICksIGNoZWNrYm94T3B0aW9ucyApLFxyXG4gICAgICBuZXcgQ2hlY2tib3goIHdhdGVyVG93ZXJNb2RlbC5pc01lYXN1cmluZ1RhcGVWaXNpYmxlUHJvcGVydHksIGNyZWF0ZUl0ZW0oIG1lYXN1cmluZ1RhcGUgKSwgY2hlY2tib3hPcHRpb25zICksXHJcbiAgICAgIG5ldyBDaGVja2JveCggd2F0ZXJUb3dlck1vZGVsLmlzSG9zZVZpc2libGVQcm9wZXJ0eSwgY3JlYXRlSXRlbSggaG9zZSApLCBjaGVja2JveE9wdGlvbnMgKVxyXG4gICAgXTtcclxuICAgIGNvbnN0IGNoZWNrYm94ZXMgPSBuZXcgVkJveCggeyBhbGlnbjogJ2xlZnQnLCBzcGFjaW5nOiAxMCwgY2hpbGRyZW46IGNoZWNrYm94Q2hpbGRyZW4gfSApO1xyXG5cclxuICAgIHN1cGVyKCBjaGVja2JveGVzLCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBDcmVhdGUgYW4gaWNvbiBmb3IgdGhlIHJ1bGVyIGNoZWNrYm94XHJcbmZ1bmN0aW9uIGNyZWF0ZVJ1bGVySWNvbigpIHtcclxuICByZXR1cm4gbmV3IFJ1bGVyTm9kZSggMzAsIDIwLCAxNSwgWyAnMCcsICcxJywgJzInIF0sICcnLCB7XHJcbiAgICBpbnNldHNXaWR0aDogNyxcclxuICAgIG1pbm9yVGlja3NQZXJNYWpvclRpY2s6IDQsXHJcbiAgICBtYWpvclRpY2tGb250OiBuZXcgUGhldEZvbnQoIDEyICksXHJcbiAgICBjbGlwQXJlYTogU2hhcGUucmVjdCggLTEsIC0xLCA0NCwgMjIgKVxyXG4gIH0gKTtcclxufVxyXG5cclxuLy8gQ3JlYXRlIGFuIGljb24gZm9yIHRoZSBob3NlXHJcbmZ1bmN0aW9uIGNyZWF0ZUhvc2VJY29uKCkge1xyXG4gIGNvbnN0IGljb24gPSBuZXcgUGF0aCggbmV3IFNoYXBlKCkubW92ZVRvKCAwLCAwICkuYXJjKCAtMTYsIDgsIDgsIC1NYXRoLlBJIC8gMiwgTWF0aC5QSSAvIDIsIHRydWUgKS5saW5lVG8oIDEwLCAxNiApLmxpbmVUbyggMTAsIDAgKS5saW5lVG8oIDAsIDAgKSwge1xyXG4gICAgc3Ryb2tlOiAnZ3JleScsXHJcbiAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICBmaWxsOiAnIzAwRkYwMCdcclxuICB9ICk7XHJcbiAgaWNvbi5hZGRDaGlsZCggbmV3IEltYWdlKCBub3p6bGVfcG5nLCB7XHJcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgIHJvdGF0aW9uOiBNYXRoLlBJIC8gMixcclxuICAgIHNjYWxlOiAwLjgsXHJcbiAgICBsZWZ0OiBpY29uLnJpZ2h0LFxyXG4gICAgYm90dG9tOiBpY29uLmJvdHRvbSArIDNcclxuICB9ICkgKTtcclxuICByZXR1cm4gaWNvbjtcclxufVxyXG5cclxuLy8gQ3JlYXRlIGFuIGljb24gZm9yIHRoZSBtZWFzdXJpbmcgdGFwZVxyXG5mdW5jdGlvbiBjcmVhdGVNZWFzdXJpbmdUYXBlSWNvbigpIHtcclxuICBjb25zdCBpY29uID0gbmV3IEltYWdlKCBtZWFzdXJpbmdUYXBlX3BuZywgeyBjdXJzb3I6ICdwb2ludGVyJywgc2NhbGU6IDAuNiB9ICk7XHJcbiAgY29uc3Qgc2l6ZSA9IDU7XHJcbiAgaWNvbi5hZGRDaGlsZCggbmV3IFBhdGgoIG5ldyBTaGFwZSgpLm1vdmVUbyggLXNpemUsIDAgKS5saW5lVG8oIHNpemUsIDAgKS5tb3ZlVG8oIDAsIC1zaXplICkubGluZVRvKCAwLCBzaXplICksIHtcclxuICAgIHN0cm9rZTogJyNFMDVGMjAnLFxyXG4gICAgbGluZVdpZHRoOiAyLFxyXG4gICAgbGVmdDogaWNvbi5yaWdodCArIDEyLFxyXG4gICAgdG9wOiBpY29uLmJvdHRvbSArIDEyXHJcbiAgfSApICk7XHJcbiAgcmV0dXJuIGljb247XHJcbn1cclxuXHJcbmZsdWlkUHJlc3N1cmVBbmRGbG93LnJlZ2lzdGVyKCAnVG9vbHNDb250cm9sUGFuZWwnLCBUb29sc0NvbnRyb2xQYW5lbCApO1xyXG5leHBvcnQgZGVmYXVsdCBUb29sc0NvbnRyb2xQYW5lbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLGlCQUFpQixNQUFNLHNEQUFzRDtBQUNwRixPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsU0FBU0MsSUFBSSxFQUFFQyxNQUFNLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDekYsT0FBT0MsUUFBUSxNQUFNLGdDQUFnQztBQUNyRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLFVBQVUsTUFBTSwrQkFBK0I7QUFDdEQsT0FBT0Msb0JBQW9CLE1BQU0sK0JBQStCO0FBQ2hFLE9BQU9DLDJCQUEyQixNQUFNLHNDQUFzQztBQUU5RSxNQUFNQyxVQUFVLEdBQUdELDJCQUEyQixDQUFD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