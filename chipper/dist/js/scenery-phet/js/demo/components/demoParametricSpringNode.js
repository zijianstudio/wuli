// Copyright 2015-2022, University of Colorado Boulder

/**
 * Demo for ParametricSpringNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { HBox, Node, Rectangle, Text, VBox, VSeparator } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import NumberControl from '../../NumberControl.js';
import ParametricSpringNode from '../../ParametricSpringNode.js';
import PhetFont from '../../PhetFont.js';
import ResetAllButton from '../../buttons/ResetAllButton.js';
export default function demoParametricSpringNode(layoutBounds) {
  return new DemoNode(layoutBounds);
}
class DemoNode extends Node {
  constructor(layoutBounds) {
    // A 200-unit vertical "wall", for comparison with the spring size
    const wallNode = new Rectangle(0, 0, 25, 200, {
      fill: 'rgb( 180, 180, 180 )',
      stroke: 'black',
      left: 20,
      centerY: 200
    });

    // Ranges for the various properties of ParametricSpringNode
    const ranges = {
      loopsRange: new RangeWithValue(4, 15, 10),
      radiusRange: new RangeWithValue(5, 70, 10),
      aspectRatioRange: new RangeWithValue(0.5, 10, 4),
      pointsPerLoopRange: new RangeWithValue(10, 100, 30),
      lineWidthRange: new RangeWithValue(1, 10, 3),
      phaseRange: new RangeWithValue(0, 2 * Math.PI, Math.PI),
      // radians
      deltaPhaseRange: new RangeWithValue(0, 2 * Math.PI, Math.PI / 2),
      // radians
      xScaleRange: new RangeWithValue(0.5, 11, 2.5)
    };

    // spring
    const springNode = new ParametricSpringNode({
      // initial values for Properties
      loops: ranges.loopsRange.defaultValue,
      radius: ranges.radiusRange.defaultValue,
      aspectRatio: ranges.aspectRatioRange.defaultValue,
      pointsPerLoop: ranges.pointsPerLoopRange.defaultValue,
      lineWidth: ranges.lineWidthRange.defaultValue,
      phase: ranges.phaseRange.defaultValue,
      deltaPhase: ranges.deltaPhaseRange.defaultValue,
      xScale: ranges.xScaleRange.defaultValue,
      // initial values for static fields
      frontColor: 'rgb( 150, 150, 255 )',
      middleColor: 'rgb( 0, 0, 255 )',
      backColor: 'rgb( 0, 0, 200 )',
      // use x,y exclusively for layout, because we're using boundsMethod:'none'
      x: wallNode.right,
      y: wallNode.centerY
    });

    // control panel, scaled to fit across the bottom
    const controlPanel = new ControlPanel(springNode, ranges);
    controlPanel.setScaleMagnitude(Math.min(1, layoutBounds.width / controlPanel.width));
    controlPanel.bottom = layoutBounds.bottom;
    controlPanel.centerX = layoutBounds.centerX;
    const resetAllButton = new ResetAllButton({
      listener: function () {
        springNode.reset();
      },
      right: layoutBounds.maxX - 15,
      bottom: controlPanel.top - 10
    });
    super({
      children: [springNode, wallNode, controlPanel, resetAllButton]
    });
    this.disposeDemoNode = () => {
      wallNode.dispose();
      springNode.dispose();
      controlPanel.dispose();
      resetAllButton.dispose();
    };
  }
  dispose() {
    this.disposeDemoNode();
    super.dispose();
  }
}

/**
 * Controls for experimenting with a ParametricSpring.
 * Sliders with 'black' thumbs are parameters that result in instantiation of Vector2s and Shapes.
 * Sliders with 'green' thumbs are parameters that result in mutation of Vector2s and Shapes.
 */

// strings - no need for i18n since this is a developer-only demo
const aspectRatioString = 'aspect ratio:';
const deltaPhaseString = 'delta phase:';
const lineWidthString = 'line width:';
const loopsString = 'loops:';
const phaseString = 'phase:';
const pointsPerLoopString = 'points per loop:';
const radiusString = 'radius:';
const xScaleString = 'x scale:';
const CONTROL_FONT = new PhetFont(18);
const TICK_LABEL_FONT = new PhetFont(14);
class ControlPanel extends Panel {
  constructor(springNode, providedOptions) {
    const options = optionize()({
      // PanelOptions
      fill: 'rgb( 243, 243, 243 )',
      stroke: 'rgb( 125, 125, 125 )',
      xMargin: 20,
      yMargin: 10
    }, providedOptions);

    // controls, options tweaked empirically to match ranges
    const loopsControl = NumberControl.withMinMaxTicks(loopsString, springNode.loopsProperty, options.loopsRange, {
      delta: 1,
      titleNodeOptions: {
        font: CONTROL_FONT
      },
      numberDisplayOptions: {
        textOptions: {
          font: CONTROL_FONT
        },
        decimalPlaces: 0
      },
      sliderOptions: {
        thumbFill: 'black',
        minorTickSpacing: 1
      }
    });
    const pointsPerLoopControl = NumberControl.withMinMaxTicks(pointsPerLoopString, springNode.pointsPerLoopProperty, options.pointsPerLoopRange, {
      delta: 1,
      titleNodeOptions: {
        font: CONTROL_FONT
      },
      numberDisplayOptions: {
        textOptions: {
          font: CONTROL_FONT
        },
        decimalPlaces: 0
      },
      sliderOptions: {
        minorTickSpacing: 10,
        thumbFill: 'black'
      }
    });
    const radiusControl = NumberControl.withMinMaxTicks(radiusString, springNode.radiusProperty, options.radiusRange, {
      delta: 1,
      titleNodeOptions: {
        font: CONTROL_FONT
      },
      numberDisplayOptions: {
        textOptions: {
          font: CONTROL_FONT
        },
        decimalPlaces: 0
      },
      sliderOptions: {
        minorTickSpacing: 5,
        thumbFill: 'green'
      }
    });
    const aspectRatioControl = NumberControl.withMinMaxTicks(aspectRatioString, springNode.aspectRatioProperty, options.aspectRatioRange, {
      delta: 0.1,
      titleNodeOptions: {
        font: CONTROL_FONT
      },
      numberDisplayOptions: {
        textOptions: {
          font: CONTROL_FONT
        },
        decimalPlaces: 1
      },
      sliderOptions: {
        minorTickSpacing: 0.5,
        thumbFill: 'black'
      }
    });
    assert && assert(options.phaseRange.min === 0 && options.phaseRange.max === 2 * Math.PI);
    const phaseControl = new NumberControl(phaseString, springNode.phaseProperty, options.phaseRange, {
      delta: 0.1,
      titleNodeOptions: {
        font: CONTROL_FONT
      },
      numberDisplayOptions: {
        textOptions: {
          font: CONTROL_FONT
        },
        decimalPlaces: 1
      },
      sliderOptions: {
        minorTickSpacing: 1,
        thumbFill: 'black',
        majorTicks: [{
          value: options.phaseRange.min,
          label: new Text('0', {
            font: TICK_LABEL_FONT
          })
        }, {
          value: options.phaseRange.getCenter(),
          label: new Text('\u03c0', {
            font: TICK_LABEL_FONT
          })
        }, {
          value: options.phaseRange.max,
          label: new Text('2\u03c0', {
            font: TICK_LABEL_FONT
          })
        }]
      }
    });
    assert && assert(options.deltaPhaseRange.min === 0 && options.deltaPhaseRange.max === 2 * Math.PI);
    const deltaPhaseControl = new NumberControl(deltaPhaseString, springNode.deltaPhaseProperty, options.deltaPhaseRange, {
      delta: 0.1,
      titleNodeOptions: {
        font: CONTROL_FONT
      },
      numberDisplayOptions: {
        textOptions: {
          font: CONTROL_FONT
        },
        decimalPlaces: 1
      },
      sliderOptions: {
        minorTickSpacing: 1,
        thumbFill: 'black',
        majorTicks: [{
          value: options.deltaPhaseRange.min,
          label: new Text('0', {
            font: TICK_LABEL_FONT
          })
        }, {
          value: options.deltaPhaseRange.getCenter(),
          label: new Text('\u03c0', {
            font: TICK_LABEL_FONT
          })
        }, {
          value: options.deltaPhaseRange.max,
          label: new Text('2\u03c0', {
            font: TICK_LABEL_FONT
          })
        }]
      }
    });
    const lineWidthControl = NumberControl.withMinMaxTicks(lineWidthString, springNode.lineWidthProperty, options.lineWidthRange, {
      delta: 0.1,
      titleNodeOptions: {
        font: CONTROL_FONT
      },
      numberDisplayOptions: {
        textOptions: {
          font: CONTROL_FONT
        },
        decimalPlaces: 1
      },
      sliderOptions: {
        minorTickSpacing: 1,
        thumbFill: 'green'
      }
    });
    const xScaleControl = NumberControl.withMinMaxTicks(xScaleString, springNode.xScaleProperty, options.xScaleRange, {
      delta: 0.1,
      titleNodeOptions: {
        font: CONTROL_FONT
      },
      numberDisplayOptions: {
        textOptions: {
          font: CONTROL_FONT
        },
        decimalPlaces: 1
      },
      sliderOptions: {
        minorTickSpacing: 0.5,
        thumbFill: 'green'
      }
    });

    // layout
    const xSpacing = 25;
    const ySpacing = 30;
    const content = new HBox({
      children: [new VBox({
        children: [loopsControl, pointsPerLoopControl],
        spacing: ySpacing
      }), new VBox({
        children: [radiusControl, aspectRatioControl],
        spacing: ySpacing
      }), new VBox({
        children: [phaseControl, deltaPhaseControl],
        spacing: ySpacing
      }), new VSeparator({
        stroke: 'rgb( 125, 125, 125 )'
      }), new VBox({
        children: [lineWidthControl, xScaleControl],
        spacing: ySpacing
      })],
      spacing: xSpacing,
      align: 'top'
    });
    super(content, options);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJIQm94IiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJWQm94IiwiVlNlcGFyYXRvciIsIlBhbmVsIiwiUmFuZ2VXaXRoVmFsdWUiLCJOdW1iZXJDb250cm9sIiwiUGFyYW1ldHJpY1NwcmluZ05vZGUiLCJQaGV0Rm9udCIsIlJlc2V0QWxsQnV0dG9uIiwiZGVtb1BhcmFtZXRyaWNTcHJpbmdOb2RlIiwibGF5b3V0Qm91bmRzIiwiRGVtb05vZGUiLCJjb25zdHJ1Y3RvciIsIndhbGxOb2RlIiwiZmlsbCIsInN0cm9rZSIsImxlZnQiLCJjZW50ZXJZIiwicmFuZ2VzIiwibG9vcHNSYW5nZSIsInJhZGl1c1JhbmdlIiwiYXNwZWN0UmF0aW9SYW5nZSIsInBvaW50c1Blckxvb3BSYW5nZSIsImxpbmVXaWR0aFJhbmdlIiwicGhhc2VSYW5nZSIsIk1hdGgiLCJQSSIsImRlbHRhUGhhc2VSYW5nZSIsInhTY2FsZVJhbmdlIiwic3ByaW5nTm9kZSIsImxvb3BzIiwiZGVmYXVsdFZhbHVlIiwicmFkaXVzIiwiYXNwZWN0UmF0aW8iLCJwb2ludHNQZXJMb29wIiwibGluZVdpZHRoIiwicGhhc2UiLCJkZWx0YVBoYXNlIiwieFNjYWxlIiwiZnJvbnRDb2xvciIsIm1pZGRsZUNvbG9yIiwiYmFja0NvbG9yIiwieCIsInJpZ2h0IiwieSIsImNvbnRyb2xQYW5lbCIsIkNvbnRyb2xQYW5lbCIsInNldFNjYWxlTWFnbml0dWRlIiwibWluIiwid2lkdGgiLCJib3R0b20iLCJjZW50ZXJYIiwicmVzZXRBbGxCdXR0b24iLCJsaXN0ZW5lciIsInJlc2V0IiwibWF4WCIsInRvcCIsImNoaWxkcmVuIiwiZGlzcG9zZURlbW9Ob2RlIiwiZGlzcG9zZSIsImFzcGVjdFJhdGlvU3RyaW5nIiwiZGVsdGFQaGFzZVN0cmluZyIsImxpbmVXaWR0aFN0cmluZyIsImxvb3BzU3RyaW5nIiwicGhhc2VTdHJpbmciLCJwb2ludHNQZXJMb29wU3RyaW5nIiwicmFkaXVzU3RyaW5nIiwieFNjYWxlU3RyaW5nIiwiQ09OVFJPTF9GT05UIiwiVElDS19MQUJFTF9GT05UIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwibG9vcHNDb250cm9sIiwid2l0aE1pbk1heFRpY2tzIiwibG9vcHNQcm9wZXJ0eSIsImRlbHRhIiwidGl0bGVOb2RlT3B0aW9ucyIsImZvbnQiLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsInRleHRPcHRpb25zIiwiZGVjaW1hbFBsYWNlcyIsInNsaWRlck9wdGlvbnMiLCJ0aHVtYkZpbGwiLCJtaW5vclRpY2tTcGFjaW5nIiwicG9pbnRzUGVyTG9vcENvbnRyb2wiLCJwb2ludHNQZXJMb29wUHJvcGVydHkiLCJyYWRpdXNDb250cm9sIiwicmFkaXVzUHJvcGVydHkiLCJhc3BlY3RSYXRpb0NvbnRyb2wiLCJhc3BlY3RSYXRpb1Byb3BlcnR5IiwiYXNzZXJ0IiwibWF4IiwicGhhc2VDb250cm9sIiwicGhhc2VQcm9wZXJ0eSIsIm1ham9yVGlja3MiLCJ2YWx1ZSIsImxhYmVsIiwiZ2V0Q2VudGVyIiwiZGVsdGFQaGFzZUNvbnRyb2wiLCJkZWx0YVBoYXNlUHJvcGVydHkiLCJsaW5lV2lkdGhDb250cm9sIiwibGluZVdpZHRoUHJvcGVydHkiLCJ4U2NhbGVDb250cm9sIiwieFNjYWxlUHJvcGVydHkiLCJ4U3BhY2luZyIsInlTcGFjaW5nIiwiY29udGVudCIsInNwYWNpbmciLCJhbGlnbiJdLCJzb3VyY2VzIjpbImRlbW9QYXJhbWV0cmljU3ByaW5nTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEZW1vIGZvciBQYXJhbWV0cmljU3ByaW5nTm9kZVxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIE5vZGUsIFJlY3RhbmdsZSwgVGV4dCwgVkJveCwgVlNlcGFyYXRvciB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQYW5lbCwgeyBQYW5lbE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFJhbmdlV2l0aFZhbHVlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZVdpdGhWYWx1ZS5qcyc7XHJcbmltcG9ydCBOdW1iZXJDb250cm9sIGZyb20gJy4uLy4uL051bWJlckNvbnRyb2wuanMnO1xyXG5pbXBvcnQgUGFyYW1ldHJpY1NwcmluZ05vZGUgZnJvbSAnLi4vLi4vUGFyYW1ldHJpY1NwcmluZ05vZGUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9QYXJhbWV0cmljU3ByaW5nTm9kZSggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xyXG4gIHJldHVybiBuZXcgRGVtb05vZGUoIGxheW91dEJvdW5kcyApO1xyXG59XHJcblxyXG5jbGFzcyBEZW1vTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VEZW1vTm9kZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKSB7XHJcblxyXG4gICAgLy8gQSAyMDAtdW5pdCB2ZXJ0aWNhbCBcIndhbGxcIiwgZm9yIGNvbXBhcmlzb24gd2l0aCB0aGUgc3ByaW5nIHNpemVcclxuICAgIGNvbnN0IHdhbGxOb2RlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMjUsIDIwMCwge1xyXG4gICAgICBmaWxsOiAncmdiKCAxODAsIDE4MCwgMTgwICknLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGxlZnQ6IDIwLFxyXG4gICAgICBjZW50ZXJZOiAyMDBcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBSYW5nZXMgZm9yIHRoZSB2YXJpb3VzIHByb3BlcnRpZXMgb2YgUGFyYW1ldHJpY1NwcmluZ05vZGVcclxuICAgIGNvbnN0IHJhbmdlcyA9IHtcclxuICAgICAgbG9vcHNSYW5nZTogbmV3IFJhbmdlV2l0aFZhbHVlKCA0LCAxNSwgMTAgKSxcclxuICAgICAgcmFkaXVzUmFuZ2U6IG5ldyBSYW5nZVdpdGhWYWx1ZSggNSwgNzAsIDEwICksXHJcbiAgICAgIGFzcGVjdFJhdGlvUmFuZ2U6IG5ldyBSYW5nZVdpdGhWYWx1ZSggMC41LCAxMCwgNCApLFxyXG4gICAgICBwb2ludHNQZXJMb29wUmFuZ2U6IG5ldyBSYW5nZVdpdGhWYWx1ZSggMTAsIDEwMCwgMzAgKSxcclxuICAgICAgbGluZVdpZHRoUmFuZ2U6IG5ldyBSYW5nZVdpdGhWYWx1ZSggMSwgMTAsIDMgKSxcclxuICAgICAgcGhhc2VSYW5nZTogbmV3IFJhbmdlV2l0aFZhbHVlKCAwLCAyICogTWF0aC5QSSwgTWF0aC5QSSApLCAvLyByYWRpYW5zXHJcbiAgICAgIGRlbHRhUGhhc2VSYW5nZTogbmV3IFJhbmdlV2l0aFZhbHVlKCAwLCAyICogTWF0aC5QSSwgTWF0aC5QSSAvIDIgKSwgLy8gcmFkaWFuc1xyXG4gICAgICB4U2NhbGVSYW5nZTogbmV3IFJhbmdlV2l0aFZhbHVlKCAwLjUsIDExLCAyLjUgKVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBzcHJpbmdcclxuICAgIGNvbnN0IHNwcmluZ05vZGUgPSBuZXcgUGFyYW1ldHJpY1NwcmluZ05vZGUoIHtcclxuXHJcbiAgICAgIC8vIGluaXRpYWwgdmFsdWVzIGZvciBQcm9wZXJ0aWVzXHJcbiAgICAgIGxvb3BzOiByYW5nZXMubG9vcHNSYW5nZS5kZWZhdWx0VmFsdWUsXHJcbiAgICAgIHJhZGl1czogcmFuZ2VzLnJhZGl1c1JhbmdlLmRlZmF1bHRWYWx1ZSxcclxuICAgICAgYXNwZWN0UmF0aW86IHJhbmdlcy5hc3BlY3RSYXRpb1JhbmdlLmRlZmF1bHRWYWx1ZSxcclxuICAgICAgcG9pbnRzUGVyTG9vcDogcmFuZ2VzLnBvaW50c1Blckxvb3BSYW5nZS5kZWZhdWx0VmFsdWUsXHJcbiAgICAgIGxpbmVXaWR0aDogcmFuZ2VzLmxpbmVXaWR0aFJhbmdlLmRlZmF1bHRWYWx1ZSxcclxuICAgICAgcGhhc2U6IHJhbmdlcy5waGFzZVJhbmdlLmRlZmF1bHRWYWx1ZSxcclxuICAgICAgZGVsdGFQaGFzZTogcmFuZ2VzLmRlbHRhUGhhc2VSYW5nZS5kZWZhdWx0VmFsdWUsXHJcbiAgICAgIHhTY2FsZTogcmFuZ2VzLnhTY2FsZVJhbmdlLmRlZmF1bHRWYWx1ZSxcclxuXHJcbiAgICAgIC8vIGluaXRpYWwgdmFsdWVzIGZvciBzdGF0aWMgZmllbGRzXHJcbiAgICAgIGZyb250Q29sb3I6ICdyZ2IoIDE1MCwgMTUwLCAyNTUgKScsXHJcbiAgICAgIG1pZGRsZUNvbG9yOiAncmdiKCAwLCAwLCAyNTUgKScsXHJcbiAgICAgIGJhY2tDb2xvcjogJ3JnYiggMCwgMCwgMjAwICknLFxyXG5cclxuICAgICAgLy8gdXNlIHgseSBleGNsdXNpdmVseSBmb3IgbGF5b3V0LCBiZWNhdXNlIHdlJ3JlIHVzaW5nIGJvdW5kc01ldGhvZDonbm9uZSdcclxuICAgICAgeDogd2FsbE5vZGUucmlnaHQsXHJcbiAgICAgIHk6IHdhbGxOb2RlLmNlbnRlcllcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjb250cm9sIHBhbmVsLCBzY2FsZWQgdG8gZml0IGFjcm9zcyB0aGUgYm90dG9tXHJcbiAgICBjb25zdCBjb250cm9sUGFuZWwgPSBuZXcgQ29udHJvbFBhbmVsKCBzcHJpbmdOb2RlLCByYW5nZXMgKTtcclxuICAgIGNvbnRyb2xQYW5lbC5zZXRTY2FsZU1hZ25pdHVkZSggTWF0aC5taW4oIDEsIGxheW91dEJvdW5kcy53aWR0aCAvIGNvbnRyb2xQYW5lbC53aWR0aCApICk7XHJcbiAgICBjb250cm9sUGFuZWwuYm90dG9tID0gbGF5b3V0Qm91bmRzLmJvdHRvbTtcclxuICAgIGNvbnRyb2xQYW5lbC5jZW50ZXJYID0gbGF5b3V0Qm91bmRzLmNlbnRlclg7XHJcblxyXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHNwcmluZ05vZGUucmVzZXQoKTtcclxuICAgICAgfSxcclxuICAgICAgcmlnaHQ6IGxheW91dEJvdW5kcy5tYXhYIC0gMTUsXHJcbiAgICAgIGJvdHRvbTogY29udHJvbFBhbmVsLnRvcCAtIDEwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgY2hpbGRyZW46IFsgc3ByaW5nTm9kZSwgd2FsbE5vZGUsIGNvbnRyb2xQYW5lbCwgcmVzZXRBbGxCdXR0b24gXVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZURlbW9Ob2RlID0gKCkgPT4ge1xyXG4gICAgICB3YWxsTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIHNwcmluZ05vZGUuZGlzcG9zZSgpO1xyXG4gICAgICBjb250cm9sUGFuZWwuZGlzcG9zZSgpO1xyXG4gICAgICByZXNldEFsbEJ1dHRvbi5kaXNwb3NlKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VEZW1vTm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnRyb2xzIGZvciBleHBlcmltZW50aW5nIHdpdGggYSBQYXJhbWV0cmljU3ByaW5nLlxyXG4gKiBTbGlkZXJzIHdpdGggJ2JsYWNrJyB0aHVtYnMgYXJlIHBhcmFtZXRlcnMgdGhhdCByZXN1bHQgaW4gaW5zdGFudGlhdGlvbiBvZiBWZWN0b3IycyBhbmQgU2hhcGVzLlxyXG4gKiBTbGlkZXJzIHdpdGggJ2dyZWVuJyB0aHVtYnMgYXJlIHBhcmFtZXRlcnMgdGhhdCByZXN1bHQgaW4gbXV0YXRpb24gb2YgVmVjdG9yMnMgYW5kIFNoYXBlcy5cclxuICovXHJcblxyXG4vLyBzdHJpbmdzIC0gbm8gbmVlZCBmb3IgaTE4biBzaW5jZSB0aGlzIGlzIGEgZGV2ZWxvcGVyLW9ubHkgZGVtb1xyXG5jb25zdCBhc3BlY3RSYXRpb1N0cmluZyA9ICdhc3BlY3QgcmF0aW86JztcclxuY29uc3QgZGVsdGFQaGFzZVN0cmluZyA9ICdkZWx0YSBwaGFzZTonO1xyXG5jb25zdCBsaW5lV2lkdGhTdHJpbmcgPSAnbGluZSB3aWR0aDonO1xyXG5jb25zdCBsb29wc1N0cmluZyA9ICdsb29wczonO1xyXG5jb25zdCBwaGFzZVN0cmluZyA9ICdwaGFzZTonO1xyXG5jb25zdCBwb2ludHNQZXJMb29wU3RyaW5nID0gJ3BvaW50cyBwZXIgbG9vcDonO1xyXG5jb25zdCByYWRpdXNTdHJpbmcgPSAncmFkaXVzOic7XHJcbmNvbnN0IHhTY2FsZVN0cmluZyA9ICd4IHNjYWxlOic7XHJcblxyXG5jb25zdCBDT05UUk9MX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE4ICk7XHJcbmNvbnN0IFRJQ0tfTEFCRUxfRk9OVCA9IG5ldyBQaGV0Rm9udCggMTQgKTtcclxuXHJcbnR5cGUgQ29udHJvbFBhbmVsU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIHJhbmdlcyBmb3IgZWFjaCBzcHJpbmcgcGFyYW1ldGVyXHJcbiAgbG9vcHNSYW5nZTogUmFuZ2U7XHJcbiAgcmFkaXVzUmFuZ2U6IFJhbmdlO1xyXG4gIGFzcGVjdFJhdGlvUmFuZ2U6IFJhbmdlO1xyXG4gIHBvaW50c1Blckxvb3BSYW5nZTogUmFuZ2U7XHJcbiAgbGluZVdpZHRoUmFuZ2U6IFJhbmdlO1xyXG4gIHBoYXNlUmFuZ2U6IFJhbmdlO1xyXG4gIGRlbHRhUGhhc2VSYW5nZTogUmFuZ2U7XHJcbiAgeFNjYWxlUmFuZ2U6IFJhbmdlO1xyXG59O1xyXG5leHBvcnQgdHlwZSBDb250cm9sUGFuZWxPcHRpb25zID0gQ29udHJvbFBhbmVsU2VsZk9wdGlvbnMgJiBQYW5lbE9wdGlvbnM7XHJcblxyXG5jbGFzcyBDb250cm9sUGFuZWwgZXh0ZW5kcyBQYW5lbCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3ByaW5nTm9kZTogUGFyYW1ldHJpY1NwcmluZ05vZGUsIHByb3ZpZGVkT3B0aW9uczogQ29udHJvbFBhbmVsT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPENvbnRyb2xQYW5lbE9wdGlvbnMsIENvbnRyb2xQYW5lbFNlbGZPcHRpb25zLCBQYW5lbE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFBhbmVsT3B0aW9uc1xyXG4gICAgICBmaWxsOiAncmdiKCAyNDMsIDI0MywgMjQzICknLFxyXG4gICAgICBzdHJva2U6ICdyZ2IoIDEyNSwgMTI1LCAxMjUgKScsXHJcbiAgICAgIHhNYXJnaW46IDIwLFxyXG4gICAgICB5TWFyZ2luOiAxMFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gY29udHJvbHMsIG9wdGlvbnMgdHdlYWtlZCBlbXBpcmljYWxseSB0byBtYXRjaCByYW5nZXNcclxuICAgIGNvbnN0IGxvb3BzQ29udHJvbCA9IE51bWJlckNvbnRyb2wud2l0aE1pbk1heFRpY2tzKCBsb29wc1N0cmluZywgc3ByaW5nTm9kZS5sb29wc1Byb3BlcnR5LCBvcHRpb25zLmxvb3BzUmFuZ2UsIHtcclxuICAgICAgZGVsdGE6IDEsXHJcbiAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IHsgZm9udDogQ09OVFJPTF9GT05UIH0sXHJcbiAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgdGV4dE9wdGlvbnM6IHtcclxuICAgICAgICAgIGZvbnQ6IENPTlRST0xfRk9OVFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVjaW1hbFBsYWNlczogMFxyXG4gICAgICB9LFxyXG4gICAgICBzbGlkZXJPcHRpb25zOiB7XHJcbiAgICAgICAgdGh1bWJGaWxsOiAnYmxhY2snLFxyXG4gICAgICAgIG1pbm9yVGlja1NwYWNpbmc6IDFcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHBvaW50c1Blckxvb3BDb250cm9sID0gTnVtYmVyQ29udHJvbC53aXRoTWluTWF4VGlja3MoIHBvaW50c1Blckxvb3BTdHJpbmcsIHNwcmluZ05vZGUucG9pbnRzUGVyTG9vcFByb3BlcnR5LFxyXG4gICAgICBvcHRpb25zLnBvaW50c1Blckxvb3BSYW5nZSwge1xyXG4gICAgICAgIGRlbHRhOiAxLFxyXG4gICAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IHsgZm9udDogQ09OVFJPTF9GT05UIH0sXHJcbiAgICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGZvbnQ6IENPTlRST0xfRk9OVFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGRlY2ltYWxQbGFjZXM6IDBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNsaWRlck9wdGlvbnM6IHtcclxuICAgICAgICAgIG1pbm9yVGlja1NwYWNpbmc6IDEwLFxyXG4gICAgICAgICAgdGh1bWJGaWxsOiAnYmxhY2snXHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcmFkaXVzQ29udHJvbCA9IE51bWJlckNvbnRyb2wud2l0aE1pbk1heFRpY2tzKCByYWRpdXNTdHJpbmcsIHNwcmluZ05vZGUucmFkaXVzUHJvcGVydHksIG9wdGlvbnMucmFkaXVzUmFuZ2UsIHtcclxuICAgICAgZGVsdGE6IDEsXHJcbiAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IHsgZm9udDogQ09OVFJPTF9GT05UIH0sXHJcbiAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgdGV4dE9wdGlvbnM6IHtcclxuICAgICAgICAgIGZvbnQ6IENPTlRST0xfRk9OVFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVjaW1hbFBsYWNlczogMFxyXG4gICAgICB9LFxyXG4gICAgICBzbGlkZXJPcHRpb25zOiB7XHJcbiAgICAgICAgbWlub3JUaWNrU3BhY2luZzogNSxcclxuICAgICAgICB0aHVtYkZpbGw6ICdncmVlbidcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGFzcGVjdFJhdGlvQ29udHJvbCA9IE51bWJlckNvbnRyb2wud2l0aE1pbk1heFRpY2tzKCBhc3BlY3RSYXRpb1N0cmluZywgc3ByaW5nTm9kZS5hc3BlY3RSYXRpb1Byb3BlcnR5LFxyXG4gICAgICBvcHRpb25zLmFzcGVjdFJhdGlvUmFuZ2UsIHtcclxuICAgICAgICBkZWx0YTogMC4xLFxyXG4gICAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IHsgZm9udDogQ09OVFJPTF9GT05UIH0sXHJcbiAgICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGZvbnQ6IENPTlRST0xfRk9OVFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGRlY2ltYWxQbGFjZXM6IDFcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNsaWRlck9wdGlvbnM6IHtcclxuICAgICAgICAgIG1pbm9yVGlja1NwYWNpbmc6IDAuNSxcclxuICAgICAgICAgIHRodW1iRmlsbDogJ2JsYWNrJ1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMucGhhc2VSYW5nZS5taW4gPT09IDAgJiYgb3B0aW9ucy5waGFzZVJhbmdlLm1heCA9PT0gMiAqIE1hdGguUEkgKTtcclxuICAgIGNvbnN0IHBoYXNlQ29udHJvbCA9IG5ldyBOdW1iZXJDb250cm9sKCBwaGFzZVN0cmluZywgc3ByaW5nTm9kZS5waGFzZVByb3BlcnR5LCBvcHRpb25zLnBoYXNlUmFuZ2UsIHtcclxuICAgICAgZGVsdGE6IDAuMSxcclxuICAgICAgdGl0bGVOb2RlT3B0aW9uczogeyBmb250OiBDT05UUk9MX0ZPTlQgfSxcclxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICB0ZXh0T3B0aW9uczoge1xyXG4gICAgICAgICAgZm9udDogQ09OVFJPTF9GT05UXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZWNpbWFsUGxhY2VzOiAxXHJcbiAgICAgIH0sXHJcbiAgICAgIHNsaWRlck9wdGlvbnM6IHtcclxuICAgICAgICBtaW5vclRpY2tTcGFjaW5nOiAxLFxyXG4gICAgICAgIHRodW1iRmlsbDogJ2JsYWNrJyxcclxuICAgICAgICBtYWpvclRpY2tzOiBbXHJcbiAgICAgICAgICB7IHZhbHVlOiBvcHRpb25zLnBoYXNlUmFuZ2UubWluLCBsYWJlbDogbmV3IFRleHQoICcwJywgeyBmb250OiBUSUNLX0xBQkVMX0ZPTlQgfSApIH0sXHJcbiAgICAgICAgICB7IHZhbHVlOiBvcHRpb25zLnBoYXNlUmFuZ2UuZ2V0Q2VudGVyKCksIGxhYmVsOiBuZXcgVGV4dCggJ1xcdTAzYzAnLCB7IGZvbnQ6IFRJQ0tfTEFCRUxfRk9OVCB9ICkgfSxcclxuICAgICAgICAgIHsgdmFsdWU6IG9wdGlvbnMucGhhc2VSYW5nZS5tYXgsIGxhYmVsOiBuZXcgVGV4dCggJzJcXHUwM2MwJywgeyBmb250OiBUSUNLX0xBQkVMX0ZPTlQgfSApIH1cclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmRlbHRhUGhhc2VSYW5nZS5taW4gPT09IDAgJiYgb3B0aW9ucy5kZWx0YVBoYXNlUmFuZ2UubWF4ID09PSAyICogTWF0aC5QSSApO1xyXG4gICAgY29uc3QgZGVsdGFQaGFzZUNvbnRyb2wgPSBuZXcgTnVtYmVyQ29udHJvbCggZGVsdGFQaGFzZVN0cmluZywgc3ByaW5nTm9kZS5kZWx0YVBoYXNlUHJvcGVydHksIG9wdGlvbnMuZGVsdGFQaGFzZVJhbmdlLCB7XHJcbiAgICAgIGRlbHRhOiAwLjEsXHJcbiAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IHsgZm9udDogQ09OVFJPTF9GT05UIH0sXHJcbiAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgdGV4dE9wdGlvbnM6IHtcclxuICAgICAgICAgIGZvbnQ6IENPTlRST0xfRk9OVFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVjaW1hbFBsYWNlczogMVxyXG4gICAgICB9LFxyXG4gICAgICBzbGlkZXJPcHRpb25zOiB7XHJcbiAgICAgICAgbWlub3JUaWNrU3BhY2luZzogMSxcclxuICAgICAgICB0aHVtYkZpbGw6ICdibGFjaycsXHJcbiAgICAgICAgbWFqb3JUaWNrczogW1xyXG4gICAgICAgICAgeyB2YWx1ZTogb3B0aW9ucy5kZWx0YVBoYXNlUmFuZ2UubWluLCBsYWJlbDogbmV3IFRleHQoICcwJywgeyBmb250OiBUSUNLX0xBQkVMX0ZPTlQgfSApIH0sXHJcbiAgICAgICAgICB7IHZhbHVlOiBvcHRpb25zLmRlbHRhUGhhc2VSYW5nZS5nZXRDZW50ZXIoKSwgbGFiZWw6IG5ldyBUZXh0KCAnXFx1MDNjMCcsIHsgZm9udDogVElDS19MQUJFTF9GT05UIH0gKSB9LFxyXG4gICAgICAgICAgeyB2YWx1ZTogb3B0aW9ucy5kZWx0YVBoYXNlUmFuZ2UubWF4LCBsYWJlbDogbmV3IFRleHQoICcyXFx1MDNjMCcsIHsgZm9udDogVElDS19MQUJFTF9GT05UIH0gKSB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbGluZVdpZHRoQ29udHJvbCA9IE51bWJlckNvbnRyb2wud2l0aE1pbk1heFRpY2tzKCBsaW5lV2lkdGhTdHJpbmcsIHNwcmluZ05vZGUubGluZVdpZHRoUHJvcGVydHksIG9wdGlvbnMubGluZVdpZHRoUmFuZ2UsIHtcclxuICAgICAgZGVsdGE6IDAuMSxcclxuICAgICAgdGl0bGVOb2RlT3B0aW9uczogeyBmb250OiBDT05UUk9MX0ZPTlQgfSxcclxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICB0ZXh0T3B0aW9uczoge1xyXG4gICAgICAgICAgZm9udDogQ09OVFJPTF9GT05UXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZWNpbWFsUGxhY2VzOiAxXHJcbiAgICAgIH0sXHJcbiAgICAgIHNsaWRlck9wdGlvbnM6IHtcclxuICAgICAgICBtaW5vclRpY2tTcGFjaW5nOiAxLFxyXG4gICAgICAgIHRodW1iRmlsbDogJ2dyZWVuJ1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgeFNjYWxlQ29udHJvbCA9IE51bWJlckNvbnRyb2wud2l0aE1pbk1heFRpY2tzKCB4U2NhbGVTdHJpbmcsIHNwcmluZ05vZGUueFNjYWxlUHJvcGVydHksIG9wdGlvbnMueFNjYWxlUmFuZ2UsIHtcclxuICAgICAgZGVsdGE6IDAuMSxcclxuICAgICAgdGl0bGVOb2RlT3B0aW9uczogeyBmb250OiBDT05UUk9MX0ZPTlQgfSxcclxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICB0ZXh0T3B0aW9uczoge1xyXG4gICAgICAgICAgZm9udDogQ09OVFJPTF9GT05UXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZWNpbWFsUGxhY2VzOiAxXHJcbiAgICAgIH0sXHJcbiAgICAgIHNsaWRlck9wdGlvbnM6IHtcclxuICAgICAgICBtaW5vclRpY2tTcGFjaW5nOiAwLjUsXHJcbiAgICAgICAgdGh1bWJGaWxsOiAnZ3JlZW4nXHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBsYXlvdXRcclxuICAgIGNvbnN0IHhTcGFjaW5nID0gMjU7XHJcbiAgICBjb25zdCB5U3BhY2luZyA9IDMwO1xyXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFZCb3goIHsgY2hpbGRyZW46IFsgbG9vcHNDb250cm9sLCBwb2ludHNQZXJMb29wQ29udHJvbCBdLCBzcGFjaW5nOiB5U3BhY2luZyB9ICksXHJcbiAgICAgICAgbmV3IFZCb3goIHsgY2hpbGRyZW46IFsgcmFkaXVzQ29udHJvbCwgYXNwZWN0UmF0aW9Db250cm9sIF0sIHNwYWNpbmc6IHlTcGFjaW5nIH0gKSxcclxuICAgICAgICBuZXcgVkJveCggeyBjaGlsZHJlbjogWyBwaGFzZUNvbnRyb2wsIGRlbHRhUGhhc2VDb250cm9sIF0sIHNwYWNpbmc6IHlTcGFjaW5nIH0gKSxcclxuICAgICAgICBuZXcgVlNlcGFyYXRvciggeyBzdHJva2U6ICdyZ2IoIDEyNSwgMTI1LCAxMjUgKScgfSApLFxyXG4gICAgICAgIG5ldyBWQm94KCB7IGNoaWxkcmVuOiBbIGxpbmVXaWR0aENvbnRyb2wsIHhTY2FsZUNvbnRyb2wgXSwgc3BhY2luZzogeVNwYWNpbmcgfSApXHJcbiAgICAgIF0sXHJcbiAgICAgIHNwYWNpbmc6IHhTcGFjaW5nLFxyXG4gICAgICBhbGlnbjogJ3RvcCdcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggY29udGVudCwgb3B0aW9ucyApO1xyXG4gIH1cclxufSJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sdUNBQXVDO0FBQzdELFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxVQUFVLFFBQVEsbUNBQW1DO0FBQ2pHLE9BQU9DLEtBQUssTUFBd0IsNkJBQTZCO0FBRWpFLE9BQU9DLGNBQWMsTUFBTSxzQ0FBc0M7QUFDakUsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFDaEUsT0FBT0MsUUFBUSxNQUFNLG1CQUFtQjtBQUV4QyxPQUFPQyxjQUFjLE1BQU0saUNBQWlDO0FBRTVELGVBQWUsU0FBU0Msd0JBQXdCQSxDQUFFQyxZQUFxQixFQUFTO0VBQzlFLE9BQU8sSUFBSUMsUUFBUSxDQUFFRCxZQUFhLENBQUM7QUFDckM7QUFFQSxNQUFNQyxRQUFRLFNBQVNiLElBQUksQ0FBQztFQUluQmMsV0FBV0EsQ0FBRUYsWUFBcUIsRUFBRztJQUUxQztJQUNBLE1BQU1HLFFBQVEsR0FBRyxJQUFJZCxTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFO01BQzdDZSxJQUFJLEVBQUUsc0JBQXNCO01BQzVCQyxNQUFNLEVBQUUsT0FBTztNQUNmQyxJQUFJLEVBQUUsRUFBRTtNQUNSQyxPQUFPLEVBQUU7SUFDWCxDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNQyxNQUFNLEdBQUc7TUFDYkMsVUFBVSxFQUFFLElBQUlmLGNBQWMsQ0FBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQztNQUMzQ2dCLFdBQVcsRUFBRSxJQUFJaEIsY0FBYyxDQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRyxDQUFDO01BQzVDaUIsZ0JBQWdCLEVBQUUsSUFBSWpCLGNBQWMsQ0FBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUUsQ0FBQztNQUNsRGtCLGtCQUFrQixFQUFFLElBQUlsQixjQUFjLENBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFHLENBQUM7TUFDckRtQixjQUFjLEVBQUUsSUFBSW5CLGNBQWMsQ0FBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUUsQ0FBQztNQUM5Q29CLFVBQVUsRUFBRSxJQUFJcEIsY0FBYyxDQUFFLENBQUMsRUFBRSxDQUFDLEdBQUdxQixJQUFJLENBQUNDLEVBQUUsRUFBRUQsSUFBSSxDQUFDQyxFQUFHLENBQUM7TUFBRTtNQUMzREMsZUFBZSxFQUFFLElBQUl2QixjQUFjLENBQUUsQ0FBQyxFQUFFLENBQUMsR0FBR3FCLElBQUksQ0FBQ0MsRUFBRSxFQUFFRCxJQUFJLENBQUNDLEVBQUUsR0FBRyxDQUFFLENBQUM7TUFBRTtNQUNwRUUsV0FBVyxFQUFFLElBQUl4QixjQUFjLENBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFJO0lBQ2hELENBQUM7O0lBRUQ7SUFDQSxNQUFNeUIsVUFBVSxHQUFHLElBQUl2QixvQkFBb0IsQ0FBRTtNQUUzQztNQUNBd0IsS0FBSyxFQUFFWixNQUFNLENBQUNDLFVBQVUsQ0FBQ1ksWUFBWTtNQUNyQ0MsTUFBTSxFQUFFZCxNQUFNLENBQUNFLFdBQVcsQ0FBQ1csWUFBWTtNQUN2Q0UsV0FBVyxFQUFFZixNQUFNLENBQUNHLGdCQUFnQixDQUFDVSxZQUFZO01BQ2pERyxhQUFhLEVBQUVoQixNQUFNLENBQUNJLGtCQUFrQixDQUFDUyxZQUFZO01BQ3JESSxTQUFTLEVBQUVqQixNQUFNLENBQUNLLGNBQWMsQ0FBQ1EsWUFBWTtNQUM3Q0ssS0FBSyxFQUFFbEIsTUFBTSxDQUFDTSxVQUFVLENBQUNPLFlBQVk7TUFDckNNLFVBQVUsRUFBRW5CLE1BQU0sQ0FBQ1MsZUFBZSxDQUFDSSxZQUFZO01BQy9DTyxNQUFNLEVBQUVwQixNQUFNLENBQUNVLFdBQVcsQ0FBQ0csWUFBWTtNQUV2QztNQUNBUSxVQUFVLEVBQUUsc0JBQXNCO01BQ2xDQyxXQUFXLEVBQUUsa0JBQWtCO01BQy9CQyxTQUFTLEVBQUUsa0JBQWtCO01BRTdCO01BQ0FDLENBQUMsRUFBRTdCLFFBQVEsQ0FBQzhCLEtBQUs7TUFDakJDLENBQUMsRUFBRS9CLFFBQVEsQ0FBQ0k7SUFDZCxDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNNEIsWUFBWSxHQUFHLElBQUlDLFlBQVksQ0FBRWpCLFVBQVUsRUFBRVgsTUFBTyxDQUFDO0lBQzNEMkIsWUFBWSxDQUFDRSxpQkFBaUIsQ0FBRXRCLElBQUksQ0FBQ3VCLEdBQUcsQ0FBRSxDQUFDLEVBQUV0QyxZQUFZLENBQUN1QyxLQUFLLEdBQUdKLFlBQVksQ0FBQ0ksS0FBTSxDQUFFLENBQUM7SUFDeEZKLFlBQVksQ0FBQ0ssTUFBTSxHQUFHeEMsWUFBWSxDQUFDd0MsTUFBTTtJQUN6Q0wsWUFBWSxDQUFDTSxPQUFPLEdBQUd6QyxZQUFZLENBQUN5QyxPQUFPO0lBRTNDLE1BQU1DLGNBQWMsR0FBRyxJQUFJNUMsY0FBYyxDQUFFO01BQ3pDNkMsUUFBUSxFQUFFLFNBQUFBLENBQUEsRUFBVztRQUNuQnhCLFVBQVUsQ0FBQ3lCLEtBQUssQ0FBQyxDQUFDO01BQ3BCLENBQUM7TUFDRFgsS0FBSyxFQUFFakMsWUFBWSxDQUFDNkMsSUFBSSxHQUFHLEVBQUU7TUFDN0JMLE1BQU0sRUFBRUwsWUFBWSxDQUFDVyxHQUFHLEdBQUc7SUFDN0IsQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFO01BQ0xDLFFBQVEsRUFBRSxDQUFFNUIsVUFBVSxFQUFFaEIsUUFBUSxFQUFFZ0MsWUFBWSxFQUFFTyxjQUFjO0lBQ2hFLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ00sZUFBZSxHQUFHLE1BQU07TUFDM0I3QyxRQUFRLENBQUM4QyxPQUFPLENBQUMsQ0FBQztNQUNsQjlCLFVBQVUsQ0FBQzhCLE9BQU8sQ0FBQyxDQUFDO01BQ3BCZCxZQUFZLENBQUNjLE9BQU8sQ0FBQyxDQUFDO01BQ3RCUCxjQUFjLENBQUNPLE9BQU8sQ0FBQyxDQUFDO0lBQzFCLENBQUM7RUFDSDtFQUVnQkEsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCLElBQUksQ0FBQ0QsZUFBZSxDQUFDLENBQUM7SUFDdEIsS0FBSyxDQUFDQyxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFNQyxpQkFBaUIsR0FBRyxlQUFlO0FBQ3pDLE1BQU1DLGdCQUFnQixHQUFHLGNBQWM7QUFDdkMsTUFBTUMsZUFBZSxHQUFHLGFBQWE7QUFDckMsTUFBTUMsV0FBVyxHQUFHLFFBQVE7QUFDNUIsTUFBTUMsV0FBVyxHQUFHLFFBQVE7QUFDNUIsTUFBTUMsbUJBQW1CLEdBQUcsa0JBQWtCO0FBQzlDLE1BQU1DLFlBQVksR0FBRyxTQUFTO0FBQzlCLE1BQU1DLFlBQVksR0FBRyxVQUFVO0FBRS9CLE1BQU1DLFlBQVksR0FBRyxJQUFJN0QsUUFBUSxDQUFFLEVBQUcsQ0FBQztBQUN2QyxNQUFNOEQsZUFBZSxHQUFHLElBQUk5RCxRQUFRLENBQUUsRUFBRyxDQUFDO0FBZ0IxQyxNQUFNdUMsWUFBWSxTQUFTM0MsS0FBSyxDQUFDO0VBRXhCUyxXQUFXQSxDQUFFaUIsVUFBZ0MsRUFBRXlDLGVBQW9DLEVBQUc7SUFFM0YsTUFBTUMsT0FBTyxHQUFHM0UsU0FBUyxDQUE2RCxDQUFDLENBQUU7TUFFdkY7TUFDQWtCLElBQUksRUFBRSxzQkFBc0I7TUFDNUJDLE1BQU0sRUFBRSxzQkFBc0I7TUFDOUJ5RCxPQUFPLEVBQUUsRUFBRTtNQUNYQyxPQUFPLEVBQUU7SUFDWCxDQUFDLEVBQUVILGVBQWdCLENBQUM7O0lBRXBCO0lBQ0EsTUFBTUksWUFBWSxHQUFHckUsYUFBYSxDQUFDc0UsZUFBZSxDQUFFWixXQUFXLEVBQUVsQyxVQUFVLENBQUMrQyxhQUFhLEVBQUVMLE9BQU8sQ0FBQ3BELFVBQVUsRUFBRTtNQUM3RzBELEtBQUssRUFBRSxDQUFDO01BQ1JDLGdCQUFnQixFQUFFO1FBQUVDLElBQUksRUFBRVg7TUFBYSxDQUFDO01BQ3hDWSxvQkFBb0IsRUFBRTtRQUNwQkMsV0FBVyxFQUFFO1VBQ1hGLElBQUksRUFBRVg7UUFDUixDQUFDO1FBQ0RjLGFBQWEsRUFBRTtNQUNqQixDQUFDO01BQ0RDLGFBQWEsRUFBRTtRQUNiQyxTQUFTLEVBQUUsT0FBTztRQUNsQkMsZ0JBQWdCLEVBQUU7TUFDcEI7SUFDRixDQUFFLENBQUM7SUFFSCxNQUFNQyxvQkFBb0IsR0FBR2pGLGFBQWEsQ0FBQ3NFLGVBQWUsQ0FBRVYsbUJBQW1CLEVBQUVwQyxVQUFVLENBQUMwRCxxQkFBcUIsRUFDL0doQixPQUFPLENBQUNqRCxrQkFBa0IsRUFBRTtNQUMxQnVELEtBQUssRUFBRSxDQUFDO01BQ1JDLGdCQUFnQixFQUFFO1FBQUVDLElBQUksRUFBRVg7TUFBYSxDQUFDO01BQ3hDWSxvQkFBb0IsRUFBRTtRQUNwQkMsV0FBVyxFQUFFO1VBQ1hGLElBQUksRUFBRVg7UUFDUixDQUFDO1FBQ0RjLGFBQWEsRUFBRTtNQUNqQixDQUFDO01BQ0RDLGFBQWEsRUFBRTtRQUNiRSxnQkFBZ0IsRUFBRSxFQUFFO1FBQ3BCRCxTQUFTLEVBQUU7TUFDYjtJQUNGLENBQUUsQ0FBQztJQUVMLE1BQU1JLGFBQWEsR0FBR25GLGFBQWEsQ0FBQ3NFLGVBQWUsQ0FBRVQsWUFBWSxFQUFFckMsVUFBVSxDQUFDNEQsY0FBYyxFQUFFbEIsT0FBTyxDQUFDbkQsV0FBVyxFQUFFO01BQ2pIeUQsS0FBSyxFQUFFLENBQUM7TUFDUkMsZ0JBQWdCLEVBQUU7UUFBRUMsSUFBSSxFQUFFWDtNQUFhLENBQUM7TUFDeENZLG9CQUFvQixFQUFFO1FBQ3BCQyxXQUFXLEVBQUU7VUFDWEYsSUFBSSxFQUFFWDtRQUNSLENBQUM7UUFDRGMsYUFBYSxFQUFFO01BQ2pCLENBQUM7TUFDREMsYUFBYSxFQUFFO1FBQ2JFLGdCQUFnQixFQUFFLENBQUM7UUFDbkJELFNBQVMsRUFBRTtNQUNiO0lBQ0YsQ0FBRSxDQUFDO0lBRUgsTUFBTU0sa0JBQWtCLEdBQUdyRixhQUFhLENBQUNzRSxlQUFlLENBQUVmLGlCQUFpQixFQUFFL0IsVUFBVSxDQUFDOEQsbUJBQW1CLEVBQ3pHcEIsT0FBTyxDQUFDbEQsZ0JBQWdCLEVBQUU7TUFDeEJ3RCxLQUFLLEVBQUUsR0FBRztNQUNWQyxnQkFBZ0IsRUFBRTtRQUFFQyxJQUFJLEVBQUVYO01BQWEsQ0FBQztNQUN4Q1ksb0JBQW9CLEVBQUU7UUFDcEJDLFdBQVcsRUFBRTtVQUNYRixJQUFJLEVBQUVYO1FBQ1IsQ0FBQztRQUNEYyxhQUFhLEVBQUU7TUFDakIsQ0FBQztNQUNEQyxhQUFhLEVBQUU7UUFDYkUsZ0JBQWdCLEVBQUUsR0FBRztRQUNyQkQsU0FBUyxFQUFFO01BQ2I7SUFDRixDQUFFLENBQUM7SUFFTFEsTUFBTSxJQUFJQSxNQUFNLENBQUVyQixPQUFPLENBQUMvQyxVQUFVLENBQUN3QixHQUFHLEtBQUssQ0FBQyxJQUFJdUIsT0FBTyxDQUFDL0MsVUFBVSxDQUFDcUUsR0FBRyxLQUFLLENBQUMsR0FBR3BFLElBQUksQ0FBQ0MsRUFBRyxDQUFDO0lBQzFGLE1BQU1vRSxZQUFZLEdBQUcsSUFBSXpGLGFBQWEsQ0FBRTJELFdBQVcsRUFBRW5DLFVBQVUsQ0FBQ2tFLGFBQWEsRUFBRXhCLE9BQU8sQ0FBQy9DLFVBQVUsRUFBRTtNQUNqR3FELEtBQUssRUFBRSxHQUFHO01BQ1ZDLGdCQUFnQixFQUFFO1FBQUVDLElBQUksRUFBRVg7TUFBYSxDQUFDO01BQ3hDWSxvQkFBb0IsRUFBRTtRQUNwQkMsV0FBVyxFQUFFO1VBQ1hGLElBQUksRUFBRVg7UUFDUixDQUFDO1FBQ0RjLGFBQWEsRUFBRTtNQUNqQixDQUFDO01BQ0RDLGFBQWEsRUFBRTtRQUNiRSxnQkFBZ0IsRUFBRSxDQUFDO1FBQ25CRCxTQUFTLEVBQUUsT0FBTztRQUNsQlksVUFBVSxFQUFFLENBQ1Y7VUFBRUMsS0FBSyxFQUFFMUIsT0FBTyxDQUFDL0MsVUFBVSxDQUFDd0IsR0FBRztVQUFFa0QsS0FBSyxFQUFFLElBQUlsRyxJQUFJLENBQUUsR0FBRyxFQUFFO1lBQUUrRSxJQUFJLEVBQUVWO1VBQWdCLENBQUU7UUFBRSxDQUFDLEVBQ3BGO1VBQUU0QixLQUFLLEVBQUUxQixPQUFPLENBQUMvQyxVQUFVLENBQUMyRSxTQUFTLENBQUMsQ0FBQztVQUFFRCxLQUFLLEVBQUUsSUFBSWxHLElBQUksQ0FBRSxRQUFRLEVBQUU7WUFBRStFLElBQUksRUFBRVY7VUFBZ0IsQ0FBRTtRQUFFLENBQUMsRUFDakc7VUFBRTRCLEtBQUssRUFBRTFCLE9BQU8sQ0FBQy9DLFVBQVUsQ0FBQ3FFLEdBQUc7VUFBRUssS0FBSyxFQUFFLElBQUlsRyxJQUFJLENBQUUsU0FBUyxFQUFFO1lBQUUrRSxJQUFJLEVBQUVWO1VBQWdCLENBQUU7UUFBRSxDQUFDO01BRTlGO0lBQ0YsQ0FBRSxDQUFDO0lBRUh1QixNQUFNLElBQUlBLE1BQU0sQ0FBRXJCLE9BQU8sQ0FBQzVDLGVBQWUsQ0FBQ3FCLEdBQUcsS0FBSyxDQUFDLElBQUl1QixPQUFPLENBQUM1QyxlQUFlLENBQUNrRSxHQUFHLEtBQUssQ0FBQyxHQUFHcEUsSUFBSSxDQUFDQyxFQUFHLENBQUM7SUFDcEcsTUFBTTBFLGlCQUFpQixHQUFHLElBQUkvRixhQUFhLENBQUV3RCxnQkFBZ0IsRUFBRWhDLFVBQVUsQ0FBQ3dFLGtCQUFrQixFQUFFOUIsT0FBTyxDQUFDNUMsZUFBZSxFQUFFO01BQ3JIa0QsS0FBSyxFQUFFLEdBQUc7TUFDVkMsZ0JBQWdCLEVBQUU7UUFBRUMsSUFBSSxFQUFFWDtNQUFhLENBQUM7TUFDeENZLG9CQUFvQixFQUFFO1FBQ3BCQyxXQUFXLEVBQUU7VUFDWEYsSUFBSSxFQUFFWDtRQUNSLENBQUM7UUFDRGMsYUFBYSxFQUFFO01BQ2pCLENBQUM7TUFDREMsYUFBYSxFQUFFO1FBQ2JFLGdCQUFnQixFQUFFLENBQUM7UUFDbkJELFNBQVMsRUFBRSxPQUFPO1FBQ2xCWSxVQUFVLEVBQUUsQ0FDVjtVQUFFQyxLQUFLLEVBQUUxQixPQUFPLENBQUM1QyxlQUFlLENBQUNxQixHQUFHO1VBQUVrRCxLQUFLLEVBQUUsSUFBSWxHLElBQUksQ0FBRSxHQUFHLEVBQUU7WUFBRStFLElBQUksRUFBRVY7VUFBZ0IsQ0FBRTtRQUFFLENBQUMsRUFDekY7VUFBRTRCLEtBQUssRUFBRTFCLE9BQU8sQ0FBQzVDLGVBQWUsQ0FBQ3dFLFNBQVMsQ0FBQyxDQUFDO1VBQUVELEtBQUssRUFBRSxJQUFJbEcsSUFBSSxDQUFFLFFBQVEsRUFBRTtZQUFFK0UsSUFBSSxFQUFFVjtVQUFnQixDQUFFO1FBQUUsQ0FBQyxFQUN0RztVQUFFNEIsS0FBSyxFQUFFMUIsT0FBTyxDQUFDNUMsZUFBZSxDQUFDa0UsR0FBRztVQUFFSyxLQUFLLEVBQUUsSUFBSWxHLElBQUksQ0FBRSxTQUFTLEVBQUU7WUFBRStFLElBQUksRUFBRVY7VUFBZ0IsQ0FBRTtRQUFFLENBQUM7TUFFbkc7SUFDRixDQUFFLENBQUM7SUFFSCxNQUFNaUMsZ0JBQWdCLEdBQUdqRyxhQUFhLENBQUNzRSxlQUFlLENBQUViLGVBQWUsRUFBRWpDLFVBQVUsQ0FBQzBFLGlCQUFpQixFQUFFaEMsT0FBTyxDQUFDaEQsY0FBYyxFQUFFO01BQzdIc0QsS0FBSyxFQUFFLEdBQUc7TUFDVkMsZ0JBQWdCLEVBQUU7UUFBRUMsSUFBSSxFQUFFWDtNQUFhLENBQUM7TUFDeENZLG9CQUFvQixFQUFFO1FBQ3BCQyxXQUFXLEVBQUU7VUFDWEYsSUFBSSxFQUFFWDtRQUNSLENBQUM7UUFDRGMsYUFBYSxFQUFFO01BQ2pCLENBQUM7TUFDREMsYUFBYSxFQUFFO1FBQ2JFLGdCQUFnQixFQUFFLENBQUM7UUFDbkJELFNBQVMsRUFBRTtNQUNiO0lBQ0YsQ0FBRSxDQUFDO0lBRUgsTUFBTW9CLGFBQWEsR0FBR25HLGFBQWEsQ0FBQ3NFLGVBQWUsQ0FBRVIsWUFBWSxFQUFFdEMsVUFBVSxDQUFDNEUsY0FBYyxFQUFFbEMsT0FBTyxDQUFDM0MsV0FBVyxFQUFFO01BQ2pIaUQsS0FBSyxFQUFFLEdBQUc7TUFDVkMsZ0JBQWdCLEVBQUU7UUFBRUMsSUFBSSxFQUFFWDtNQUFhLENBQUM7TUFDeENZLG9CQUFvQixFQUFFO1FBQ3BCQyxXQUFXLEVBQUU7VUFDWEYsSUFBSSxFQUFFWDtRQUNSLENBQUM7UUFDRGMsYUFBYSxFQUFFO01BQ2pCLENBQUM7TUFDREMsYUFBYSxFQUFFO1FBQ2JFLGdCQUFnQixFQUFFLEdBQUc7UUFDckJELFNBQVMsRUFBRTtNQUNiO0lBQ0YsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTXNCLFFBQVEsR0FBRyxFQUFFO0lBQ25CLE1BQU1DLFFBQVEsR0FBRyxFQUFFO0lBQ25CLE1BQU1DLE9BQU8sR0FBRyxJQUFJL0csSUFBSSxDQUFFO01BQ3hCNEQsUUFBUSxFQUFFLENBQ1IsSUFBSXhELElBQUksQ0FBRTtRQUFFd0QsUUFBUSxFQUFFLENBQUVpQixZQUFZLEVBQUVZLG9CQUFvQixDQUFFO1FBQUV1QixPQUFPLEVBQUVGO01BQVMsQ0FBRSxDQUFDLEVBQ25GLElBQUkxRyxJQUFJLENBQUU7UUFBRXdELFFBQVEsRUFBRSxDQUFFK0IsYUFBYSxFQUFFRSxrQkFBa0IsQ0FBRTtRQUFFbUIsT0FBTyxFQUFFRjtNQUFTLENBQUUsQ0FBQyxFQUNsRixJQUFJMUcsSUFBSSxDQUFFO1FBQUV3RCxRQUFRLEVBQUUsQ0FBRXFDLFlBQVksRUFBRU0saUJBQWlCLENBQUU7UUFBRVMsT0FBTyxFQUFFRjtNQUFTLENBQUUsQ0FBQyxFQUNoRixJQUFJekcsVUFBVSxDQUFFO1FBQUVhLE1BQU0sRUFBRTtNQUF1QixDQUFFLENBQUMsRUFDcEQsSUFBSWQsSUFBSSxDQUFFO1FBQUV3RCxRQUFRLEVBQUUsQ0FBRTZDLGdCQUFnQixFQUFFRSxhQUFhLENBQUU7UUFBRUssT0FBTyxFQUFFRjtNQUFTLENBQUUsQ0FBQyxDQUNqRjtNQUNERSxPQUFPLEVBQUVILFFBQVE7TUFDakJJLEtBQUssRUFBRTtJQUNULENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRUYsT0FBTyxFQUFFckMsT0FBUSxDQUFDO0VBQzNCO0FBQ0YifQ==