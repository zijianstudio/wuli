// Copyright 2013-2022, University of Colorado Boulder

/**
 * pH meter for the 'Macro' screen.
 *
 * The probe registers the concentration of all possible fluids that it may contact, including:
 * - solution in the beaker
 * - output of the water faucet
 * - output of the drain faucet
 * - output of the dropper
 *
 * Rather than trying to model the shapes of all of these fluids, we handle 'probe is in fluid'
 * herein via intersection of node shapes.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ProbeNode from '../../../../scenery-phet/js/ProbeNode.js';
import { DragListener, InteractiveHighlighting, KeyboardDragListener, Line, LinearGradient, Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Water from '../../common/model/Water.js';
import PHScaleColors from '../../common/PHScaleColors.js';
import PHScaleConstants from '../../common/PHScaleConstants.js';
import phScale from '../../phScale.js';
import PhScaleStrings from '../../PhScaleStrings.js';
// constants
const BACKGROUND_ENABLED_FILL = 'rgb( 31, 113, 2 )';
const BACKGROUND_DISABLED_FILL = 'rgb( 178, 178, 178 )';
const SCALE_SIZE = new Dimension2(55, 450);
const SCALE_LABEL_FONT = new PhetFont({
  size: 30,
  weight: 'bold'
});
const TICK_LENGTH = 15;
const TICK_FONT = new PhetFont(22);
const NEUTRAL_TICK_LENGTH = 40;
const TICK_LABEL_X_SPACING = 5;
const CORNER_RADIUS = 12;
export default class MacroPHMeterNode extends Node {
  constructor(meter, solution, dropper, solutionNode, dropperFluidNode, waterFluidNode, drainFluidNode, modelViewTransform, providedOptions) {
    const options = providedOptions;
    super(options);

    // the vertical scale, positioned at the meter 'body' position
    const scaleNode = new ScaleNode({
      size: SCALE_SIZE
    });
    scaleNode.translation = modelViewTransform.modelToViewPosition(meter.bodyPosition);

    // indicator that slides vertically along scale
    const pHIndicatorNode = new PHIndicatorNode(meter.pHProperty, SCALE_SIZE.width, {
      tandem: options.tandem.createTandem('pHIndicatorNode')
    });
    pHIndicatorNode.left = scaleNode.x;

    // interactive probe
    const probeNode = new PHProbeNode(meter.probe, modelViewTransform, solutionNode, dropperFluidNode, waterFluidNode, drainFluidNode, {
      tandem: options.tandem.createTandem('probeNode')
    });

    // wire that connects the probe to the meter
    const wireNode = new WireNode(meter.probe, scaleNode, probeNode);

    // rendering order
    this.children = [wireNode, probeNode, scaleNode, pHIndicatorNode];

    // vertical position of the indicator
    meter.pHProperty.link(pH => {
      pHIndicatorNode.centerY = scaleNode.y + Utils.linear(PHScaleConstants.PH_RANGE.min, PHScaleConstants.PH_RANGE.max, SCALE_SIZE.height, 0, pH || 7);
    });
    const updateValue = () => {
      let pH;
      if (probeNode.isInSolution() || probeNode.isInDrainFluid()) {
        pH = solution.pHProperty.value;
      } else if (probeNode.isInWater()) {
        pH = Water.pH;
      } else if (probeNode.isInDropperSolution()) {
        pH = dropper.soluteProperty.value.pH;
      } else {
        pH = null;
      }
      meter.pHProperty.value = pH;
    };
    Multilink.multilink([meter.probe.positionProperty, solution.soluteProperty, solution.pHProperty, solutionNode.boundsProperty, dropperFluidNode.boundsProperty, waterFluidNode.boundsProperty, drainFluidNode.boundsProperty], () => updateValue());

    // Create a link to pHProperty, so it's easier to find in Studio.
    this.addLinkedElement(meter.pHProperty, {
      tandem: options.tandem.createTandem('pHProperty')
    });
  }
}

/**
 * The meter's vertical scale.
 */

class ScaleNode extends Node {
  constructor(providedOptions) {
    const options = optionize()({
      range: PHScaleConstants.PH_RANGE,
      size: new Dimension2(75, 450)
    }, providedOptions);
    super();

    // gradient background
    this.backgroundStrokeWidth = 2;
    const backgroundNode = new Rectangle(0, 0, options.size.width, options.size.height, {
      fill: new LinearGradient(0, 0, 0, options.size.height).addColorStop(0, PHScaleColors.BASIC).addColorStop(0.5, PHScaleColors.NEUTRAL).addColorStop(1, PHScaleColors.ACIDIC),
      stroke: 'black',
      lineWidth: this.backgroundStrokeWidth
    });
    this.addChild(backgroundNode);

    // 'Acidic' label
    const textOptions = {
      fill: 'white',
      font: SCALE_LABEL_FONT,
      maxWidth: 0.45 * options.size.height
    };
    const acidicText = new Text(PhScaleStrings.acidicStringProperty, textOptions);
    acidicText.rotation = -Math.PI / 2;
    this.addChild(acidicText);
    acidicText.boundsProperty.link(bounds => {
      acidicText.centerX = backgroundNode.centerX;
      acidicText.centerY = 0.75 * backgroundNode.height;
    });

    // 'Basic' label
    const basicText = new Text(PhScaleStrings.basicStringProperty, textOptions);
    basicText.rotation = -Math.PI / 2;
    this.addChild(basicText);
    basicText.boundsProperty.link(bounds => {
      basicText.centerX = backgroundNode.centerX;
      basicText.centerY = 0.25 * backgroundNode.height;
    });

    // tick marks, labeled at 'even' values, skip 7 (neutral)
    let y = options.size.height;
    const dy = -options.size.height / options.range.getLength();
    for (let pH = options.range.min; pH <= options.range.max; pH++) {
      if (pH !== 7) {
        // tick mark
        const lineNode = new Line(0, 0, TICK_LENGTH, 0, {
          stroke: 'black',
          lineWidth: 1
        });
        lineNode.right = backgroundNode.left;
        lineNode.centerY = y;
        this.addChild(lineNode);

        // tick label
        if (pH % 2 === 0) {
          const tickText = new Text(pH, {
            font: TICK_FONT
          });
          tickText.right = lineNode.left - TICK_LABEL_X_SPACING;
          tickText.centerY = lineNode.centerY;
          this.addChild(tickText);
        }
      }
      y += dy;
    }

    // 'Neutral' tick mark
    const neutralLineNode = new Line(0, 0, NEUTRAL_TICK_LENGTH, 0, {
      stroke: 'black',
      lineWidth: 3
    });
    neutralLineNode.right = backgroundNode.left;
    neutralLineNode.centerY = options.size.height / 2;
    this.addChild(neutralLineNode);
    const neutralText = new Text('7', {
      fill: PHScaleColors.NEUTRAL,
      font: new PhetFont({
        family: 'Arial black',
        size: 28,
        weight: 'bold'
      })
    });
    this.addChild(neutralText);
    neutralText.right = neutralLineNode.left - TICK_LABEL_X_SPACING;
    neutralText.centerY = neutralLineNode.centerY;
  }

  // needed for precise positioning of things that point to values on the scale
  getBackgroundStrokeWidth() {
    return this.backgroundStrokeWidth;
  }
}

/**
 * Meter probe, origin at center of crosshairs.
 */

class PHProbeNode extends InteractiveHighlighting(ProbeNode) {
  constructor(probe, modelViewTransform, solutionNode, dropperFluidNode, waterFluidNode, drainFluidNode, providedOptions) {
    const options = optionize()({
      sensorTypeFunction: ProbeNode.crosshairs({
        intersectionRadius: 6
      }),
      radius: 34,
      innerRadius: 26,
      handleWidth: 30,
      handleHeight: 25,
      handleCornerRadius: 12,
      lightAngle: 0.85 * Math.PI,
      color: 'rgb( 35, 129, 0 )',
      rotation: Math.PI / 2,
      cursor: 'pointer',
      tagName: 'div',
      focusable: true,
      visiblePropertyOptions: {
        phetioReadOnly: true
      },
      phetioInputEnabledPropertyInstrumented: true
    }, providedOptions);
    super(options);

    // probe position
    probe.positionProperty.link(position => {
      this.translation = modelViewTransform.modelToViewPosition(position);
    });

    // touch area
    this.touchArea = this.localBounds.dilated(20);
    const dragBoundsProperty = new Property(probe.dragBounds);

    // drag listener
    this.addInputListener(new DragListener({
      positionProperty: probe.positionProperty,
      dragBoundsProperty: dragBoundsProperty,
      transform: modelViewTransform,
      tandem: options.tandem.createTandem('dragListener')
    }));
    this.addInputListener(new KeyboardDragListener({
      dragVelocity: 300,
      // velocity of the Node being dragged, in view coordinates per second
      shiftDragVelocity: 20,
      // velocity with the Shift key pressed, typically slower than dragVelocity
      positionProperty: probe.positionProperty,
      dragBoundsProperty: dragBoundsProperty,
      transform: modelViewTransform,
      tandem: providedOptions.tandem.createTandem('keyboardDragListener')
    }));
    const isInNode = node => node.getBounds().containsPoint(probe.positionProperty.value);
    this.isInSolution = () => isInNode(solutionNode);
    this.isInWater = () => isInNode(waterFluidNode);
    this.isInDrainFluid = () => isInNode(drainFluidNode);
    this.isInDropperSolution = () => isInNode(dropperFluidNode);
  }
}

/**
 * Wire that connects the body and probe.
 */
class WireNode extends Path {
  constructor(probe, bodyNode, probeNode) {
    super(new Shape(), {
      stroke: 'rgb( 80, 80, 80 )',
      lineWidth: 8,
      lineCap: 'square',
      lineJoin: 'round',
      pickable: false // no need to drag the wire, and we don't want to do cubic-curve intersection here, or have it get in the way
    });

    const updateCurve = () => {
      const scaleCenterX = bodyNode.x + SCALE_SIZE.width / 2;

      // Connect bottom-center of body to right-center of probe.
      const bodyConnectionPoint = new Vector2(scaleCenterX, bodyNode.bottom - 10);
      const probeConnectionPoint = new Vector2(probeNode.left, probeNode.centerY);

      // control points
      // The y coordinate of the body's control point varies with the x distance between the body and probe.
      const c1Offset = new Vector2(0, Utils.linear(0, 800, 0, 300, probeNode.left - scaleCenterX)); // x distance -> y coordinate
      const c2Offset = new Vector2(-50, 0);
      const c1 = new Vector2(bodyConnectionPoint.x + c1Offset.x, bodyConnectionPoint.y + c1Offset.y);
      const c2 = new Vector2(probeConnectionPoint.x + c2Offset.x, probeConnectionPoint.y + c2Offset.y);
      this.shape = new Shape().moveTo(bodyConnectionPoint.x, bodyConnectionPoint.y).cubicCurveTo(c1.x, c1.y, c2.x, c2.y, probeConnectionPoint.x, probeConnectionPoint.y);
    };
    probe.positionProperty.link(updateCurve);
  }
}

/**
 * pH indicator that slides vertically along scale.
 * When there is no pH value, it points to 'neutral' but does not display a value.
 */

class PHIndicatorNode extends Node {
  constructor(pHProperty, scaleWidth, providedOptions) {
    const options = optionize()({}, providedOptions);

    // dashed line that extends across the scale
    const lineNode = new Line(0, 0, scaleWidth, 0, {
      stroke: 'black',
      lineDash: [5, 5],
      lineWidth: 2
    });

    // pH display
    const numberDisplay = new NumberDisplay(pHProperty, PHScaleConstants.PH_RANGE, {
      decimalPlaces: PHScaleConstants.PH_METER_DECIMAL_PLACES,
      align: 'right',
      noValueAlign: 'center',
      cornerRadius: CORNER_RADIUS,
      xMargin: 8,
      yMargin: 5,
      textOptions: {
        font: new PhetFont(28),
        stringPropertyOptions: {
          phetioHighFrequency: true
        }
      },
      tandem: options.tandem.createTandem('numberDisplay')
    });

    // label above the value
    const pHText = new Text(PhScaleStrings.pHStringProperty, {
      fill: 'white',
      font: new PhetFont({
        size: 28,
        weight: 'bold'
      }),
      maxWidth: 100
    });

    // background
    const backgroundXMargin = 14;
    const backgroundYMargin = 10;
    const backgroundYSpacing = 6;
    const backgroundWidth = Math.max(pHText.width, numberDisplay.width) + 2 * backgroundXMargin;
    const backgroundHeight = pHText.height + numberDisplay.height + backgroundYSpacing + 2 * backgroundYMargin;
    const backgroundRectangle = new Rectangle(0, 0, backgroundWidth, backgroundHeight, {
      cornerRadius: CORNER_RADIUS,
      fill: BACKGROUND_ENABLED_FILL
    });

    // highlight around the background
    const highlightLineWidth = 3;
    const outerHighlight = new Rectangle(0, 0, backgroundWidth, backgroundHeight, {
      cornerRadius: CORNER_RADIUS,
      stroke: 'black',
      lineWidth: highlightLineWidth
    });
    const innerHighlight = new Rectangle(highlightLineWidth, highlightLineWidth, backgroundWidth - 2 * highlightLineWidth, backgroundHeight - 2 * highlightLineWidth, {
      cornerRadius: CORNER_RADIUS,
      stroke: 'white',
      lineWidth: highlightLineWidth
    });
    const highlight = new Node({
      children: [innerHighlight, outerHighlight],
      visible: false
    });

    // arrow head pointing at the scale
    const arrowSize = new Dimension2(21, 28);
    const arrowShape = new Shape().moveTo(0, 0).lineTo(arrowSize.width, -arrowSize.height / 2).lineTo(arrowSize.width, arrowSize.height / 2).close();
    const arrowNode = new Path(arrowShape, {
      fill: 'black'
    });

    // layout, origin at arrow tip
    lineNode.left = 0;
    lineNode.centerY = 0;
    arrowNode.left = lineNode.right;
    arrowNode.centerY = lineNode.centerY;
    backgroundRectangle.left = arrowNode.right - 1; // overlap to hide seam
    backgroundRectangle.centerY = arrowNode.centerY;
    highlight.center = backgroundRectangle.center;
    options.children = [arrowNode, backgroundRectangle, highlight, pHText, numberDisplay, lineNode];
    super(options);
    pHText.boundsProperty.link(bounds => {
      pHText.centerX = backgroundRectangle.centerX;
      pHText.top = backgroundRectangle.top + backgroundYMargin;
    });
    numberDisplay.centerX = backgroundRectangle.centerX;
    numberDisplay.top = pHText.bottom + backgroundYSpacing;
    pHProperty.link(pH => {
      // make the indicator look enabled or disabled
      const enabled = pH !== null;
      backgroundRectangle.fill = enabled ? BACKGROUND_ENABLED_FILL : BACKGROUND_DISABLED_FILL;
      arrowNode.visible = lineNode.visible = enabled;

      // Highlight the indicator when displayed pH === 7
      highlight.visible = pH !== null && Utils.toFixedNumber(pH, PHScaleConstants.PH_METER_DECIMAL_PLACES) === 7;
    });
  }
}
phScale.register('MacroPHMeterNode', MacroPHMeterNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJVdGlscyIsIlZlY3RvcjIiLCJTaGFwZSIsIm9wdGlvbml6ZSIsIk51bWJlckRpc3BsYXkiLCJQaGV0Rm9udCIsIlByb2JlTm9kZSIsIkRyYWdMaXN0ZW5lciIsIkludGVyYWN0aXZlSGlnaGxpZ2h0aW5nIiwiS2V5Ym9hcmREcmFnTGlzdGVuZXIiLCJMaW5lIiwiTGluZWFyR3JhZGllbnQiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlRleHQiLCJXYXRlciIsIlBIU2NhbGVDb2xvcnMiLCJQSFNjYWxlQ29uc3RhbnRzIiwicGhTY2FsZSIsIlBoU2NhbGVTdHJpbmdzIiwiQkFDS0dST1VORF9FTkFCTEVEX0ZJTEwiLCJCQUNLR1JPVU5EX0RJU0FCTEVEX0ZJTEwiLCJTQ0FMRV9TSVpFIiwiU0NBTEVfTEFCRUxfRk9OVCIsInNpemUiLCJ3ZWlnaHQiLCJUSUNLX0xFTkdUSCIsIlRJQ0tfRk9OVCIsIk5FVVRSQUxfVElDS19MRU5HVEgiLCJUSUNLX0xBQkVMX1hfU1BBQ0lORyIsIkNPUk5FUl9SQURJVVMiLCJNYWNyb1BITWV0ZXJOb2RlIiwiY29uc3RydWN0b3IiLCJtZXRlciIsInNvbHV0aW9uIiwiZHJvcHBlciIsInNvbHV0aW9uTm9kZSIsImRyb3BwZXJGbHVpZE5vZGUiLCJ3YXRlckZsdWlkTm9kZSIsImRyYWluRmx1aWROb2RlIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInNjYWxlTm9kZSIsIlNjYWxlTm9kZSIsInRyYW5zbGF0aW9uIiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsImJvZHlQb3NpdGlvbiIsInBISW5kaWNhdG9yTm9kZSIsIlBISW5kaWNhdG9yTm9kZSIsInBIUHJvcGVydHkiLCJ3aWR0aCIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImxlZnQiLCJ4IiwicHJvYmVOb2RlIiwiUEhQcm9iZU5vZGUiLCJwcm9iZSIsIndpcmVOb2RlIiwiV2lyZU5vZGUiLCJjaGlsZHJlbiIsImxpbmsiLCJwSCIsImNlbnRlclkiLCJ5IiwibGluZWFyIiwiUEhfUkFOR0UiLCJtaW4iLCJtYXgiLCJoZWlnaHQiLCJ1cGRhdGVWYWx1ZSIsImlzSW5Tb2x1dGlvbiIsImlzSW5EcmFpbkZsdWlkIiwidmFsdWUiLCJpc0luV2F0ZXIiLCJpc0luRHJvcHBlclNvbHV0aW9uIiwic29sdXRlUHJvcGVydHkiLCJtdWx0aWxpbmsiLCJwb3NpdGlvblByb3BlcnR5IiwiYm91bmRzUHJvcGVydHkiLCJhZGRMaW5rZWRFbGVtZW50IiwicmFuZ2UiLCJiYWNrZ3JvdW5kU3Ryb2tlV2lkdGgiLCJiYWNrZ3JvdW5kTm9kZSIsImZpbGwiLCJhZGRDb2xvclN0b3AiLCJCQVNJQyIsIk5FVVRSQUwiLCJBQ0lESUMiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJhZGRDaGlsZCIsInRleHRPcHRpb25zIiwiZm9udCIsIm1heFdpZHRoIiwiYWNpZGljVGV4dCIsImFjaWRpY1N0cmluZ1Byb3BlcnR5Iiwicm90YXRpb24iLCJNYXRoIiwiUEkiLCJib3VuZHMiLCJjZW50ZXJYIiwiYmFzaWNUZXh0IiwiYmFzaWNTdHJpbmdQcm9wZXJ0eSIsImR5IiwiZ2V0TGVuZ3RoIiwibGluZU5vZGUiLCJyaWdodCIsInRpY2tUZXh0IiwibmV1dHJhbExpbmVOb2RlIiwibmV1dHJhbFRleHQiLCJmYW1pbHkiLCJnZXRCYWNrZ3JvdW5kU3Ryb2tlV2lkdGgiLCJzZW5zb3JUeXBlRnVuY3Rpb24iLCJjcm9zc2hhaXJzIiwiaW50ZXJzZWN0aW9uUmFkaXVzIiwicmFkaXVzIiwiaW5uZXJSYWRpdXMiLCJoYW5kbGVXaWR0aCIsImhhbmRsZUhlaWdodCIsImhhbmRsZUNvcm5lclJhZGl1cyIsImxpZ2h0QW5nbGUiLCJjb2xvciIsImN1cnNvciIsInRhZ05hbWUiLCJmb2N1c2FibGUiLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsInBvc2l0aW9uIiwidG91Y2hBcmVhIiwibG9jYWxCb3VuZHMiLCJkaWxhdGVkIiwiZHJhZ0JvdW5kc1Byb3BlcnR5IiwiZHJhZ0JvdW5kcyIsImFkZElucHV0TGlzdGVuZXIiLCJ0cmFuc2Zvcm0iLCJkcmFnVmVsb2NpdHkiLCJzaGlmdERyYWdWZWxvY2l0eSIsImlzSW5Ob2RlIiwibm9kZSIsImdldEJvdW5kcyIsImNvbnRhaW5zUG9pbnQiLCJib2R5Tm9kZSIsImxpbmVDYXAiLCJsaW5lSm9pbiIsInBpY2thYmxlIiwidXBkYXRlQ3VydmUiLCJzY2FsZUNlbnRlclgiLCJib2R5Q29ubmVjdGlvblBvaW50IiwiYm90dG9tIiwicHJvYmVDb25uZWN0aW9uUG9pbnQiLCJjMU9mZnNldCIsImMyT2Zmc2V0IiwiYzEiLCJjMiIsInNoYXBlIiwibW92ZVRvIiwiY3ViaWNDdXJ2ZVRvIiwic2NhbGVXaWR0aCIsImxpbmVEYXNoIiwibnVtYmVyRGlzcGxheSIsImRlY2ltYWxQbGFjZXMiLCJQSF9NRVRFUl9ERUNJTUFMX1BMQUNFUyIsImFsaWduIiwibm9WYWx1ZUFsaWduIiwiY29ybmVyUmFkaXVzIiwieE1hcmdpbiIsInlNYXJnaW4iLCJzdHJpbmdQcm9wZXJ0eU9wdGlvbnMiLCJwaGV0aW9IaWdoRnJlcXVlbmN5IiwicEhUZXh0IiwicEhTdHJpbmdQcm9wZXJ0eSIsImJhY2tncm91bmRYTWFyZ2luIiwiYmFja2dyb3VuZFlNYXJnaW4iLCJiYWNrZ3JvdW5kWVNwYWNpbmciLCJiYWNrZ3JvdW5kV2lkdGgiLCJiYWNrZ3JvdW5kSGVpZ2h0IiwiYmFja2dyb3VuZFJlY3RhbmdsZSIsImhpZ2hsaWdodExpbmVXaWR0aCIsIm91dGVySGlnaGxpZ2h0IiwiaW5uZXJIaWdobGlnaHQiLCJoaWdobGlnaHQiLCJ2aXNpYmxlIiwiYXJyb3dTaXplIiwiYXJyb3dTaGFwZSIsImxpbmVUbyIsImNsb3NlIiwiYXJyb3dOb2RlIiwiY2VudGVyIiwidG9wIiwiZW5hYmxlZCIsInRvRml4ZWROdW1iZXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1hY3JvUEhNZXRlck5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogcEggbWV0ZXIgZm9yIHRoZSAnTWFjcm8nIHNjcmVlbi5cclxuICpcclxuICogVGhlIHByb2JlIHJlZ2lzdGVycyB0aGUgY29uY2VudHJhdGlvbiBvZiBhbGwgcG9zc2libGUgZmx1aWRzIHRoYXQgaXQgbWF5IGNvbnRhY3QsIGluY2x1ZGluZzpcclxuICogLSBzb2x1dGlvbiBpbiB0aGUgYmVha2VyXHJcbiAqIC0gb3V0cHV0IG9mIHRoZSB3YXRlciBmYXVjZXRcclxuICogLSBvdXRwdXQgb2YgdGhlIGRyYWluIGZhdWNldFxyXG4gKiAtIG91dHB1dCBvZiB0aGUgZHJvcHBlclxyXG4gKlxyXG4gKiBSYXRoZXIgdGhhbiB0cnlpbmcgdG8gbW9kZWwgdGhlIHNoYXBlcyBvZiBhbGwgb2YgdGhlc2UgZmx1aWRzLCB3ZSBoYW5kbGUgJ3Byb2JlIGlzIGluIGZsdWlkJ1xyXG4gKiBoZXJlaW4gdmlhIGludGVyc2VjdGlvbiBvZiBub2RlIHNoYXBlcy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBOdW1iZXJEaXNwbGF5IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJEaXNwbGF5LmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBQcm9iZU5vZGUsIHsgUHJvYmVOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9Qcm9iZU5vZGUuanMnO1xyXG5pbXBvcnQgeyBEcmFnTGlzdGVuZXIsIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nLCBLZXlib2FyZERyYWdMaXN0ZW5lciwgTGluZSwgTGluZWFyR3JhZGllbnQsIE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgRHJvcHBlciBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRHJvcHBlci5qcyc7XHJcbmltcG9ydCBXYXRlciBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvV2F0ZXIuanMnO1xyXG5pbXBvcnQgUEhTY2FsZUNvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vUEhTY2FsZUNvbG9ycy5qcyc7XHJcbmltcG9ydCBQSFNjYWxlQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9QSFNjYWxlQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IHBoU2NhbGUgZnJvbSAnLi4vLi4vcGhTY2FsZS5qcyc7XHJcbmltcG9ydCBQaFNjYWxlU3RyaW5ncyBmcm9tICcuLi8uLi9QaFNjYWxlU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBNYWNyb1BITWV0ZXIgZnJvbSAnLi4vbW9kZWwvTWFjcm9QSE1ldGVyLmpzJztcclxuaW1wb3J0IFNvbHV0aW9uIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Tb2x1dGlvbi5qcyc7XHJcbmltcG9ydCB7IFBIVmFsdWUgfSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUEhNb2RlbC5qcyc7XHJcbmltcG9ydCBQSE1vdmFibGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1BITW92YWJsZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQkFDS0dST1VORF9FTkFCTEVEX0ZJTEwgPSAncmdiKCAzMSwgMTEzLCAyICknO1xyXG5jb25zdCBCQUNLR1JPVU5EX0RJU0FCTEVEX0ZJTEwgPSAncmdiKCAxNzgsIDE3OCwgMTc4ICknO1xyXG5jb25zdCBTQ0FMRV9TSVpFID0gbmV3IERpbWVuc2lvbjIoIDU1LCA0NTAgKTtcclxuY29uc3QgU0NBTEVfTEFCRUxfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAzMCwgd2VpZ2h0OiAnYm9sZCcgfSApO1xyXG5jb25zdCBUSUNLX0xFTkdUSCA9IDE1O1xyXG5jb25zdCBUSUNLX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDIyICk7XHJcbmNvbnN0IE5FVVRSQUxfVElDS19MRU5HVEggPSA0MDtcclxuY29uc3QgVElDS19MQUJFTF9YX1NQQUNJTkcgPSA1O1xyXG5jb25zdCBDT1JORVJfUkFESVVTID0gMTI7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgTWFjcm9QSE1ldGVyTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxOb2RlT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFjcm9QSE1ldGVyTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1ldGVyOiBNYWNyb1BITWV0ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBzb2x1dGlvbjogU29sdXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICBkcm9wcGVyOiBEcm9wcGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgc29sdXRpb25Ob2RlOiBOb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgZHJvcHBlckZsdWlkTm9kZTogTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgIHdhdGVyRmx1aWROb2RlOiBOb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgZHJhaW5GbHVpZE5vZGU6IE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IE1hY3JvUEhNZXRlck5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBwcm92aWRlZE9wdGlvbnM7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyB0aGUgdmVydGljYWwgc2NhbGUsIHBvc2l0aW9uZWQgYXQgdGhlIG1ldGVyICdib2R5JyBwb3NpdGlvblxyXG4gICAgY29uc3Qgc2NhbGVOb2RlID0gbmV3IFNjYWxlTm9kZSggeyBzaXplOiBTQ0FMRV9TSVpFIH0gKTtcclxuICAgIHNjYWxlTm9kZS50cmFuc2xhdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBtZXRlci5ib2R5UG9zaXRpb24gKTtcclxuXHJcbiAgICAvLyBpbmRpY2F0b3IgdGhhdCBzbGlkZXMgdmVydGljYWxseSBhbG9uZyBzY2FsZVxyXG4gICAgY29uc3QgcEhJbmRpY2F0b3JOb2RlID0gbmV3IFBISW5kaWNhdG9yTm9kZSggbWV0ZXIucEhQcm9wZXJ0eSwgU0NBTEVfU0laRS53aWR0aCwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BISW5kaWNhdG9yTm9kZScgKVxyXG4gICAgfSApO1xyXG4gICAgcEhJbmRpY2F0b3JOb2RlLmxlZnQgPSBzY2FsZU5vZGUueDtcclxuXHJcbiAgICAvLyBpbnRlcmFjdGl2ZSBwcm9iZVxyXG4gICAgY29uc3QgcHJvYmVOb2RlID0gbmV3IFBIUHJvYmVOb2RlKCBtZXRlci5wcm9iZSwgbW9kZWxWaWV3VHJhbnNmb3JtLCBzb2x1dGlvbk5vZGUsIGRyb3BwZXJGbHVpZE5vZGUsXHJcbiAgICAgIHdhdGVyRmx1aWROb2RlLCBkcmFpbkZsdWlkTm9kZSwge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJvYmVOb2RlJyApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyB3aXJlIHRoYXQgY29ubmVjdHMgdGhlIHByb2JlIHRvIHRoZSBtZXRlclxyXG4gICAgY29uc3Qgd2lyZU5vZGUgPSBuZXcgV2lyZU5vZGUoIG1ldGVyLnByb2JlLCBzY2FsZU5vZGUsIHByb2JlTm9kZSApO1xyXG5cclxuICAgIC8vIHJlbmRlcmluZyBvcmRlclxyXG4gICAgdGhpcy5jaGlsZHJlbiA9IFsgd2lyZU5vZGUsIHByb2JlTm9kZSwgc2NhbGVOb2RlLCBwSEluZGljYXRvck5vZGUgXTtcclxuXHJcbiAgICAvLyB2ZXJ0aWNhbCBwb3NpdGlvbiBvZiB0aGUgaW5kaWNhdG9yXHJcbiAgICBtZXRlci5wSFByb3BlcnR5LmxpbmsoIHBIID0+IHtcclxuICAgICAgcEhJbmRpY2F0b3JOb2RlLmNlbnRlclkgPSBzY2FsZU5vZGUueSArIFV0aWxzLmxpbmVhciggUEhTY2FsZUNvbnN0YW50cy5QSF9SQU5HRS5taW4sIFBIU2NhbGVDb25zdGFudHMuUEhfUkFOR0UubWF4LCBTQ0FMRV9TSVpFLmhlaWdodCwgMCwgcEggfHwgNyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHVwZGF0ZVZhbHVlID0gKCkgPT4ge1xyXG4gICAgICBsZXQgcEg7XHJcbiAgICAgIGlmICggcHJvYmVOb2RlLmlzSW5Tb2x1dGlvbigpIHx8IHByb2JlTm9kZS5pc0luRHJhaW5GbHVpZCgpICkge1xyXG4gICAgICAgIHBIID0gc29sdXRpb24ucEhQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggcHJvYmVOb2RlLmlzSW5XYXRlcigpICkge1xyXG4gICAgICAgIHBIID0gV2F0ZXIucEg7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHByb2JlTm9kZS5pc0luRHJvcHBlclNvbHV0aW9uKCkgKSB7XHJcbiAgICAgICAgcEggPSBkcm9wcGVyLnNvbHV0ZVByb3BlcnR5LnZhbHVlLnBIO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHBIID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBtZXRlci5wSFByb3BlcnR5LnZhbHVlID0gcEg7XHJcbiAgICB9O1xyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggW1xyXG4gICAgICBtZXRlci5wcm9iZS5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBzb2x1dGlvbi5zb2x1dGVQcm9wZXJ0eSxcclxuICAgICAgc29sdXRpb24ucEhQcm9wZXJ0eSxcclxuICAgICAgc29sdXRpb25Ob2RlLmJvdW5kc1Byb3BlcnR5LFxyXG4gICAgICBkcm9wcGVyRmx1aWROb2RlLmJvdW5kc1Byb3BlcnR5LFxyXG4gICAgICB3YXRlckZsdWlkTm9kZS5ib3VuZHNQcm9wZXJ0eSxcclxuICAgICAgZHJhaW5GbHVpZE5vZGUuYm91bmRzUHJvcGVydHlcclxuICAgIF0sICgpID0+IHVwZGF0ZVZhbHVlKCkgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBsaW5rIHRvIHBIUHJvcGVydHksIHNvIGl0J3MgZWFzaWVyIHRvIGZpbmQgaW4gU3R1ZGlvLlxyXG4gICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBtZXRlci5wSFByb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncEhQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBtZXRlcidzIHZlcnRpY2FsIHNjYWxlLlxyXG4gKi9cclxudHlwZSBTY2FsZU5vZGVTZWxmT3B0aW9ucyA9IHtcclxuICByYW5nZT86IFJhbmdlO1xyXG4gIHNpemU/OiBEaW1lbnNpb24yO1xyXG59O1xyXG50eXBlIFNjYWxlTm9kZU9wdGlvbnMgPSBTY2FsZU5vZGVTZWxmT3B0aW9ucztcclxuXHJcbmNsYXNzIFNjYWxlTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGJhY2tncm91bmRTdHJva2VXaWR0aDogbnVtYmVyO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IFNjYWxlTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTY2FsZU5vZGVPcHRpb25zLCBTY2FsZU5vZGVTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuICAgICAgcmFuZ2U6IFBIU2NhbGVDb25zdGFudHMuUEhfUkFOR0UsXHJcbiAgICAgIHNpemU6IG5ldyBEaW1lbnNpb24yKCA3NSwgNDUwIClcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gZ3JhZGllbnQgYmFja2dyb3VuZFxyXG4gICAgdGhpcy5iYWNrZ3JvdW5kU3Ryb2tlV2lkdGggPSAyO1xyXG4gICAgY29uc3QgYmFja2dyb3VuZE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBvcHRpb25zLnNpemUud2lkdGgsIG9wdGlvbnMuc2l6ZS5oZWlnaHQsIHtcclxuICAgICAgZmlsbDogbmV3IExpbmVhckdyYWRpZW50KCAwLCAwLCAwLCBvcHRpb25zLnNpemUuaGVpZ2h0IClcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLCBQSFNjYWxlQ29sb3JzLkJBU0lDIClcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjUsIFBIU2NhbGVDb2xvcnMuTkVVVFJBTCApXHJcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMSwgUEhTY2FsZUNvbG9ycy5BQ0lESUMgKSxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsaW5lV2lkdGg6IHRoaXMuYmFja2dyb3VuZFN0cm9rZVdpZHRoXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBiYWNrZ3JvdW5kTm9kZSApO1xyXG5cclxuICAgIC8vICdBY2lkaWMnIGxhYmVsXHJcbiAgICBjb25zdCB0ZXh0T3B0aW9ucyA9IHsgZmlsbDogJ3doaXRlJywgZm9udDogU0NBTEVfTEFCRUxfRk9OVCwgbWF4V2lkdGg6IDAuNDUgKiBvcHRpb25zLnNpemUuaGVpZ2h0IH07XHJcbiAgICBjb25zdCBhY2lkaWNUZXh0ID0gbmV3IFRleHQoIFBoU2NhbGVTdHJpbmdzLmFjaWRpY1N0cmluZ1Byb3BlcnR5LCB0ZXh0T3B0aW9ucyApO1xyXG4gICAgYWNpZGljVGV4dC5yb3RhdGlvbiA9IC1NYXRoLlBJIC8gMjtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGFjaWRpY1RleHQgKTtcclxuICAgIGFjaWRpY1RleHQuYm91bmRzUHJvcGVydHkubGluayggYm91bmRzID0+IHtcclxuICAgICAgYWNpZGljVGV4dC5jZW50ZXJYID0gYmFja2dyb3VuZE5vZGUuY2VudGVyWDtcclxuICAgICAgYWNpZGljVGV4dC5jZW50ZXJZID0gMC43NSAqIGJhY2tncm91bmROb2RlLmhlaWdodDtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyAnQmFzaWMnIGxhYmVsXHJcbiAgICBjb25zdCBiYXNpY1RleHQgPSBuZXcgVGV4dCggUGhTY2FsZVN0cmluZ3MuYmFzaWNTdHJpbmdQcm9wZXJ0eSwgdGV4dE9wdGlvbnMgKTtcclxuICAgIGJhc2ljVGV4dC5yb3RhdGlvbiA9IC1NYXRoLlBJIC8gMjtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJhc2ljVGV4dCApO1xyXG4gICAgYmFzaWNUZXh0LmJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XHJcbiAgICAgIGJhc2ljVGV4dC5jZW50ZXJYID0gYmFja2dyb3VuZE5vZGUuY2VudGVyWDtcclxuICAgICAgYmFzaWNUZXh0LmNlbnRlclkgPSAwLjI1ICogYmFja2dyb3VuZE5vZGUuaGVpZ2h0O1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHRpY2sgbWFya3MsIGxhYmVsZWQgYXQgJ2V2ZW4nIHZhbHVlcywgc2tpcCA3IChuZXV0cmFsKVxyXG4gICAgbGV0IHkgPSBvcHRpb25zLnNpemUuaGVpZ2h0O1xyXG4gICAgY29uc3QgZHkgPSAtb3B0aW9ucy5zaXplLmhlaWdodCAvIG9wdGlvbnMucmFuZ2UuZ2V0TGVuZ3RoKCk7XHJcbiAgICBmb3IgKCBsZXQgcEggPSBvcHRpb25zLnJhbmdlLm1pbjsgcEggPD0gb3B0aW9ucy5yYW5nZS5tYXg7IHBIKysgKSB7XHJcbiAgICAgIGlmICggcEggIT09IDcgKSB7XHJcbiAgICAgICAgLy8gdGljayBtYXJrXHJcbiAgICAgICAgY29uc3QgbGluZU5vZGUgPSBuZXcgTGluZSggMCwgMCwgVElDS19MRU5HVEgsIDAsIHsgc3Ryb2tlOiAnYmxhY2snLCBsaW5lV2lkdGg6IDEgfSApO1xyXG4gICAgICAgIGxpbmVOb2RlLnJpZ2h0ID0gYmFja2dyb3VuZE5vZGUubGVmdDtcclxuICAgICAgICBsaW5lTm9kZS5jZW50ZXJZID0geTtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKCBsaW5lTm9kZSApO1xyXG5cclxuICAgICAgICAvLyB0aWNrIGxhYmVsXHJcbiAgICAgICAgaWYgKCBwSCAlIDIgPT09IDAgKSB7XHJcbiAgICAgICAgICBjb25zdCB0aWNrVGV4dCA9IG5ldyBUZXh0KCBwSCwgeyBmb250OiBUSUNLX0ZPTlQgfSApO1xyXG4gICAgICAgICAgdGlja1RleHQucmlnaHQgPSBsaW5lTm9kZS5sZWZ0IC0gVElDS19MQUJFTF9YX1NQQUNJTkc7XHJcbiAgICAgICAgICB0aWNrVGV4dC5jZW50ZXJZID0gbGluZU5vZGUuY2VudGVyWTtcclxuICAgICAgICAgIHRoaXMuYWRkQ2hpbGQoIHRpY2tUZXh0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHkgKz0gZHk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gJ05ldXRyYWwnIHRpY2sgbWFya1xyXG4gICAgY29uc3QgbmV1dHJhbExpbmVOb2RlID0gbmV3IExpbmUoIDAsIDAsIE5FVVRSQUxfVElDS19MRU5HVEgsIDAsIHsgc3Ryb2tlOiAnYmxhY2snLCBsaW5lV2lkdGg6IDMgfSApO1xyXG4gICAgbmV1dHJhbExpbmVOb2RlLnJpZ2h0ID0gYmFja2dyb3VuZE5vZGUubGVmdDtcclxuICAgIG5ldXRyYWxMaW5lTm9kZS5jZW50ZXJZID0gb3B0aW9ucy5zaXplLmhlaWdodCAvIDI7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXV0cmFsTGluZU5vZGUgKTtcclxuICAgIGNvbnN0IG5ldXRyYWxUZXh0ID0gbmV3IFRleHQoICc3Jywge1xyXG4gICAgICBmaWxsOiBQSFNjYWxlQ29sb3JzLk5FVVRSQUwsXHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBmYW1pbHk6ICdBcmlhbCBibGFjaycsIHNpemU6IDI4LCB3ZWlnaHQ6ICdib2xkJyB9IClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldXRyYWxUZXh0ICk7XHJcbiAgICBuZXV0cmFsVGV4dC5yaWdodCA9IG5ldXRyYWxMaW5lTm9kZS5sZWZ0IC0gVElDS19MQUJFTF9YX1NQQUNJTkc7XHJcbiAgICBuZXV0cmFsVGV4dC5jZW50ZXJZID0gbmV1dHJhbExpbmVOb2RlLmNlbnRlclk7XHJcbiAgfVxyXG5cclxuICAvLyBuZWVkZWQgZm9yIHByZWNpc2UgcG9zaXRpb25pbmcgb2YgdGhpbmdzIHRoYXQgcG9pbnQgdG8gdmFsdWVzIG9uIHRoZSBzY2FsZVxyXG4gIHB1YmxpYyBnZXRCYWNrZ3JvdW5kU3Ryb2tlV2lkdGgoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmJhY2tncm91bmRTdHJva2VXaWR0aDtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNZXRlciBwcm9iZSwgb3JpZ2luIGF0IGNlbnRlciBvZiBjcm9zc2hhaXJzLlxyXG4gKi9cclxudHlwZSBQSFByb2JlTm9kZVNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxudHlwZSBQSFByb2JlTm9kZU9wdGlvbnMgPSBQSFByb2JlTm9kZVNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPFByb2JlTm9kZU9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmNsYXNzIFBIUHJvYmVOb2RlIGV4dGVuZHMgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcoIFByb2JlTm9kZSApIHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IGlzSW5Tb2x1dGlvbjogKCkgPT4gYm9vbGVhbjtcclxuICBwdWJsaWMgcmVhZG9ubHkgaXNJbldhdGVyOiAoKSA9PiBib29sZWFuO1xyXG4gIHB1YmxpYyByZWFkb25seSBpc0luRHJhaW5GbHVpZDogKCkgPT4gYm9vbGVhbjtcclxuICBwdWJsaWMgcmVhZG9ubHkgaXNJbkRyb3BwZXJTb2x1dGlvbjogKCkgPT4gYm9vbGVhbjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm9iZTogUEhNb3ZhYmxlLCBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsIHNvbHV0aW9uTm9kZTogTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgIGRyb3BwZXJGbHVpZE5vZGU6IE5vZGUsIHdhdGVyRmx1aWROb2RlOiBOb2RlLCBkcmFpbkZsdWlkTm9kZTogTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9uczogUEhQcm9iZU5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UEhQcm9iZU5vZGVPcHRpb25zLCBQSFByb2JlTm9kZVNlbGZPcHRpb25zLCBQcm9iZU5vZGVPcHRpb25zPigpKCB7XHJcbiAgICAgIHNlbnNvclR5cGVGdW5jdGlvbjogUHJvYmVOb2RlLmNyb3NzaGFpcnMoIHtcclxuICAgICAgICBpbnRlcnNlY3Rpb25SYWRpdXM6IDZcclxuICAgICAgfSApLFxyXG4gICAgICByYWRpdXM6IDM0LFxyXG4gICAgICBpbm5lclJhZGl1czogMjYsXHJcbiAgICAgIGhhbmRsZVdpZHRoOiAzMCxcclxuICAgICAgaGFuZGxlSGVpZ2h0OiAyNSxcclxuICAgICAgaGFuZGxlQ29ybmVyUmFkaXVzOiAxMixcclxuICAgICAgbGlnaHRBbmdsZTogMC44NSAqIE1hdGguUEksXHJcbiAgICAgIGNvbG9yOiAncmdiKCAzNSwgMTI5LCAwICknLFxyXG4gICAgICByb3RhdGlvbjogTWF0aC5QSSAvIDIsXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICB0YWdOYW1lOiAnZGl2JyxcclxuICAgICAgZm9jdXNhYmxlOiB0cnVlLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7XHJcbiAgICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWVcclxuICAgICAgfSxcclxuICAgICAgcGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IHRydWVcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gcHJvYmUgcG9zaXRpb25cclxuICAgIHByb2JlLnBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xyXG4gICAgICB0aGlzLnRyYW5zbGF0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHBvc2l0aW9uICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdG91Y2ggYXJlYVxyXG4gICAgdGhpcy50b3VjaEFyZWEgPSB0aGlzLmxvY2FsQm91bmRzLmRpbGF0ZWQoIDIwICk7XHJcblxyXG4gICAgY29uc3QgZHJhZ0JvdW5kc1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBwcm9iZS5kcmFnQm91bmRzICk7XHJcblxyXG4gICAgLy8gZHJhZyBsaXN0ZW5lclxyXG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIHBvc2l0aW9uUHJvcGVydHk6IHByb2JlLnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIGRyYWdCb3VuZHNQcm9wZXJ0eTogZHJhZ0JvdW5kc1Byb3BlcnR5LFxyXG4gICAgICB0cmFuc2Zvcm06IG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkcmFnTGlzdGVuZXInIClcclxuICAgIH0gKSApO1xyXG5cclxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggbmV3IEtleWJvYXJkRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIGRyYWdWZWxvY2l0eTogMzAwLCAvLyB2ZWxvY2l0eSBvZiB0aGUgTm9kZSBiZWluZyBkcmFnZ2VkLCBpbiB2aWV3IGNvb3JkaW5hdGVzIHBlciBzZWNvbmRcclxuICAgICAgc2hpZnREcmFnVmVsb2NpdHk6IDIwLCAvLyB2ZWxvY2l0eSB3aXRoIHRoZSBTaGlmdCBrZXkgcHJlc3NlZCwgdHlwaWNhbGx5IHNsb3dlciB0aGFuIGRyYWdWZWxvY2l0eVxyXG4gICAgICBwb3NpdGlvblByb3BlcnR5OiBwcm9iZS5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IGRyYWdCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgdHJhbnNmb3JtOiBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIHRhbmRlbTogcHJvdmlkZWRPcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdrZXlib2FyZERyYWdMaXN0ZW5lcicgKVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgY29uc3QgaXNJbk5vZGUgPSAoIG5vZGU6IE5vZGUgKSA9PiBub2RlLmdldEJvdW5kcygpLmNvbnRhaW5zUG9pbnQoIHByb2JlLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgIHRoaXMuaXNJblNvbHV0aW9uID0gKCkgPT4gaXNJbk5vZGUoIHNvbHV0aW9uTm9kZSApO1xyXG4gICAgdGhpcy5pc0luV2F0ZXIgPSAoKSA9PiBpc0luTm9kZSggd2F0ZXJGbHVpZE5vZGUgKTtcclxuICAgIHRoaXMuaXNJbkRyYWluRmx1aWQgPSAoKSA9PiBpc0luTm9kZSggZHJhaW5GbHVpZE5vZGUgKTtcclxuICAgIHRoaXMuaXNJbkRyb3BwZXJTb2x1dGlvbiA9ICgpID0+IGlzSW5Ob2RlKCBkcm9wcGVyRmx1aWROb2RlICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogV2lyZSB0aGF0IGNvbm5lY3RzIHRoZSBib2R5IGFuZCBwcm9iZS5cclxuICovXHJcbmNsYXNzIFdpcmVOb2RlIGV4dGVuZHMgUGF0aCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvYmU6IFBITW92YWJsZSwgYm9keU5vZGU6IE5vZGUsIHByb2JlTm9kZTogTm9kZSApIHtcclxuXHJcbiAgICBzdXBlciggbmV3IFNoYXBlKCksIHtcclxuICAgICAgc3Ryb2tlOiAncmdiKCA4MCwgODAsIDgwICknLFxyXG4gICAgICBsaW5lV2lkdGg6IDgsXHJcbiAgICAgIGxpbmVDYXA6ICdzcXVhcmUnLFxyXG4gICAgICBsaW5lSm9pbjogJ3JvdW5kJyxcclxuICAgICAgcGlja2FibGU6IGZhbHNlIC8vIG5vIG5lZWQgdG8gZHJhZyB0aGUgd2lyZSwgYW5kIHdlIGRvbid0IHdhbnQgdG8gZG8gY3ViaWMtY3VydmUgaW50ZXJzZWN0aW9uIGhlcmUsIG9yIGhhdmUgaXQgZ2V0IGluIHRoZSB3YXlcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCB1cGRhdGVDdXJ2ZSA9ICgpID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IHNjYWxlQ2VudGVyWCA9IGJvZHlOb2RlLnggKyAoIFNDQUxFX1NJWkUud2lkdGggLyAyICk7XHJcblxyXG4gICAgICAvLyBDb25uZWN0IGJvdHRvbS1jZW50ZXIgb2YgYm9keSB0byByaWdodC1jZW50ZXIgb2YgcHJvYmUuXHJcbiAgICAgIGNvbnN0IGJvZHlDb25uZWN0aW9uUG9pbnQgPSBuZXcgVmVjdG9yMiggc2NhbGVDZW50ZXJYLCBib2R5Tm9kZS5ib3R0b20gLSAxMCApO1xyXG4gICAgICBjb25zdCBwcm9iZUNvbm5lY3Rpb25Qb2ludCA9IG5ldyBWZWN0b3IyKCBwcm9iZU5vZGUubGVmdCwgcHJvYmVOb2RlLmNlbnRlclkgKTtcclxuXHJcbiAgICAgIC8vIGNvbnRyb2wgcG9pbnRzXHJcbiAgICAgIC8vIFRoZSB5IGNvb3JkaW5hdGUgb2YgdGhlIGJvZHkncyBjb250cm9sIHBvaW50IHZhcmllcyB3aXRoIHRoZSB4IGRpc3RhbmNlIGJldHdlZW4gdGhlIGJvZHkgYW5kIHByb2JlLlxyXG4gICAgICBjb25zdCBjMU9mZnNldCA9IG5ldyBWZWN0b3IyKCAwLCBVdGlscy5saW5lYXIoIDAsIDgwMCwgMCwgMzAwLCBwcm9iZU5vZGUubGVmdCAtIHNjYWxlQ2VudGVyWCApICk7IC8vIHggZGlzdGFuY2UgLT4geSBjb29yZGluYXRlXHJcbiAgICAgIGNvbnN0IGMyT2Zmc2V0ID0gbmV3IFZlY3RvcjIoIC01MCwgMCApO1xyXG4gICAgICBjb25zdCBjMSA9IG5ldyBWZWN0b3IyKCBib2R5Q29ubmVjdGlvblBvaW50LnggKyBjMU9mZnNldC54LCBib2R5Q29ubmVjdGlvblBvaW50LnkgKyBjMU9mZnNldC55ICk7XHJcbiAgICAgIGNvbnN0IGMyID0gbmV3IFZlY3RvcjIoIHByb2JlQ29ubmVjdGlvblBvaW50LnggKyBjMk9mZnNldC54LCBwcm9iZUNvbm5lY3Rpb25Qb2ludC55ICsgYzJPZmZzZXQueSApO1xyXG5cclxuICAgICAgdGhpcy5zaGFwZSA9IG5ldyBTaGFwZSgpXHJcbiAgICAgICAgLm1vdmVUbyggYm9keUNvbm5lY3Rpb25Qb2ludC54LCBib2R5Q29ubmVjdGlvblBvaW50LnkgKVxyXG4gICAgICAgIC5jdWJpY0N1cnZlVG8oIGMxLngsIGMxLnksIGMyLngsIGMyLnksIHByb2JlQ29ubmVjdGlvblBvaW50LngsIHByb2JlQ29ubmVjdGlvblBvaW50LnkgKTtcclxuICAgIH07XHJcbiAgICBwcm9iZS5wb3NpdGlvblByb3BlcnR5LmxpbmsoIHVwZGF0ZUN1cnZlICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogcEggaW5kaWNhdG9yIHRoYXQgc2xpZGVzIHZlcnRpY2FsbHkgYWxvbmcgc2NhbGUuXHJcbiAqIFdoZW4gdGhlcmUgaXMgbm8gcEggdmFsdWUsIGl0IHBvaW50cyB0byAnbmV1dHJhbCcgYnV0IGRvZXMgbm90IGRpc3BsYXkgYSB2YWx1ZS5cclxuICovXHJcbnR5cGUgUEhJbmRpY2F0b3JOb2RlU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG50eXBlIFBISW5kaWNhdG9yTm9kZU9wdGlvbnMgPSBQSEluZGljYXRvck5vZGVTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxOb2RlT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuY2xhc3MgUEhJbmRpY2F0b3JOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcEhQcm9wZXJ0eTogUHJvcGVydHk8UEhWYWx1ZT4sIHNjYWxlV2lkdGg6IG51bWJlciwgcHJvdmlkZWRPcHRpb25zOiBQSEluZGljYXRvck5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UEhJbmRpY2F0b3JOb2RlT3B0aW9ucywgUEhJbmRpY2F0b3JOb2RlU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7fSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gZGFzaGVkIGxpbmUgdGhhdCBleHRlbmRzIGFjcm9zcyB0aGUgc2NhbGVcclxuICAgIGNvbnN0IGxpbmVOb2RlID0gbmV3IExpbmUoIDAsIDAsIHNjYWxlV2lkdGgsIDAsIHtcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsaW5lRGFzaDogWyA1LCA1IF0sXHJcbiAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHBIIGRpc3BsYXlcclxuICAgIGNvbnN0IG51bWJlckRpc3BsYXkgPSBuZXcgTnVtYmVyRGlzcGxheSggcEhQcm9wZXJ0eSwgUEhTY2FsZUNvbnN0YW50cy5QSF9SQU5HRSwge1xyXG4gICAgICBkZWNpbWFsUGxhY2VzOiBQSFNjYWxlQ29uc3RhbnRzLlBIX01FVEVSX0RFQ0lNQUxfUExBQ0VTLFxyXG4gICAgICBhbGlnbjogJ3JpZ2h0JyxcclxuICAgICAgbm9WYWx1ZUFsaWduOiAnY2VudGVyJyxcclxuICAgICAgY29ybmVyUmFkaXVzOiBDT1JORVJfUkFESVVTLFxyXG4gICAgICB4TWFyZ2luOiA4LFxyXG4gICAgICB5TWFyZ2luOiA1LFxyXG4gICAgICB0ZXh0T3B0aW9uczoge1xyXG4gICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMjggKSxcclxuICAgICAgICBzdHJpbmdQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZSB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbnVtYmVyRGlzcGxheScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGxhYmVsIGFib3ZlIHRoZSB2YWx1ZVxyXG4gICAgY29uc3QgcEhUZXh0ID0gbmV3IFRleHQoIFBoU2NhbGVTdHJpbmdzLnBIU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDI4LCB3ZWlnaHQ6ICdib2xkJyB9ICksXHJcbiAgICAgIG1heFdpZHRoOiAxMDBcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBiYWNrZ3JvdW5kXHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kWE1hcmdpbiA9IDE0O1xyXG4gICAgY29uc3QgYmFja2dyb3VuZFlNYXJnaW4gPSAxMDtcclxuICAgIGNvbnN0IGJhY2tncm91bmRZU3BhY2luZyA9IDY7XHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kV2lkdGggPSBNYXRoLm1heCggcEhUZXh0LndpZHRoLCBudW1iZXJEaXNwbGF5LndpZHRoICkgKyAoIDIgKiBiYWNrZ3JvdW5kWE1hcmdpbiApO1xyXG4gICAgY29uc3QgYmFja2dyb3VuZEhlaWdodCA9IHBIVGV4dC5oZWlnaHQgKyBudW1iZXJEaXNwbGF5LmhlaWdodCArIGJhY2tncm91bmRZU3BhY2luZyArICggMiAqIGJhY2tncm91bmRZTWFyZ2luICk7XHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kUmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgYmFja2dyb3VuZFdpZHRoLCBiYWNrZ3JvdW5kSGVpZ2h0LCB7XHJcbiAgICAgIGNvcm5lclJhZGl1czogQ09STkVSX1JBRElVUyxcclxuICAgICAgZmlsbDogQkFDS0dST1VORF9FTkFCTEVEX0ZJTExcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBoaWdobGlnaHQgYXJvdW5kIHRoZSBiYWNrZ3JvdW5kXHJcbiAgICBjb25zdCBoaWdobGlnaHRMaW5lV2lkdGggPSAzO1xyXG4gICAgY29uc3Qgb3V0ZXJIaWdobGlnaHQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBiYWNrZ3JvdW5kV2lkdGgsIGJhY2tncm91bmRIZWlnaHQsIHtcclxuICAgICAgY29ybmVyUmFkaXVzOiBDT1JORVJfUkFESVVTLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGxpbmVXaWR0aDogaGlnaGxpZ2h0TGluZVdpZHRoXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBpbm5lckhpZ2hsaWdodCA9IG5ldyBSZWN0YW5nbGUoIGhpZ2hsaWdodExpbmVXaWR0aCwgaGlnaGxpZ2h0TGluZVdpZHRoLFxyXG4gICAgICBiYWNrZ3JvdW5kV2lkdGggLSAoIDIgKiBoaWdobGlnaHRMaW5lV2lkdGggKSwgYmFja2dyb3VuZEhlaWdodCAtICggMiAqIGhpZ2hsaWdodExpbmVXaWR0aCApLCB7XHJcbiAgICAgICAgY29ybmVyUmFkaXVzOiBDT1JORVJfUkFESVVTLFxyXG4gICAgICAgIHN0cm9rZTogJ3doaXRlJywgbGluZVdpZHRoOiBoaWdobGlnaHRMaW5lV2lkdGhcclxuICAgICAgfSApO1xyXG4gICAgY29uc3QgaGlnaGxpZ2h0ID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgaW5uZXJIaWdobGlnaHQsIG91dGVySGlnaGxpZ2h0IF0sXHJcbiAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYXJyb3cgaGVhZCBwb2ludGluZyBhdCB0aGUgc2NhbGVcclxuICAgIGNvbnN0IGFycm93U2l6ZSA9IG5ldyBEaW1lbnNpb24yKCAyMSwgMjggKTtcclxuICAgIGNvbnN0IGFycm93U2hhcGUgPSBuZXcgU2hhcGUoKVxyXG4gICAgICAubW92ZVRvKCAwLCAwIClcclxuICAgICAgLmxpbmVUbyggYXJyb3dTaXplLndpZHRoLCAtYXJyb3dTaXplLmhlaWdodCAvIDIgKVxyXG4gICAgICAubGluZVRvKCBhcnJvd1NpemUud2lkdGgsIGFycm93U2l6ZS5oZWlnaHQgLyAyIClcclxuICAgICAgLmNsb3NlKCk7XHJcbiAgICBjb25zdCBhcnJvd05vZGUgPSBuZXcgUGF0aCggYXJyb3dTaGFwZSwgeyBmaWxsOiAnYmxhY2snIH0gKTtcclxuXHJcbiAgICAvLyBsYXlvdXQsIG9yaWdpbiBhdCBhcnJvdyB0aXBcclxuICAgIGxpbmVOb2RlLmxlZnQgPSAwO1xyXG4gICAgbGluZU5vZGUuY2VudGVyWSA9IDA7XHJcbiAgICBhcnJvd05vZGUubGVmdCA9IGxpbmVOb2RlLnJpZ2h0O1xyXG4gICAgYXJyb3dOb2RlLmNlbnRlclkgPSBsaW5lTm9kZS5jZW50ZXJZO1xyXG4gICAgYmFja2dyb3VuZFJlY3RhbmdsZS5sZWZ0ID0gYXJyb3dOb2RlLnJpZ2h0IC0gMTsgLy8gb3ZlcmxhcCB0byBoaWRlIHNlYW1cclxuICAgIGJhY2tncm91bmRSZWN0YW5nbGUuY2VudGVyWSA9IGFycm93Tm9kZS5jZW50ZXJZO1xyXG4gICAgaGlnaGxpZ2h0LmNlbnRlciA9IGJhY2tncm91bmRSZWN0YW5nbGUuY2VudGVyO1xyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbXHJcbiAgICAgIGFycm93Tm9kZSxcclxuICAgICAgYmFja2dyb3VuZFJlY3RhbmdsZSxcclxuICAgICAgaGlnaGxpZ2h0LFxyXG4gICAgICBwSFRleHQsXHJcbiAgICAgIG51bWJlckRpc3BsYXksXHJcbiAgICAgIGxpbmVOb2RlXHJcbiAgICBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgcEhUZXh0LmJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XHJcbiAgICAgIHBIVGV4dC5jZW50ZXJYID0gYmFja2dyb3VuZFJlY3RhbmdsZS5jZW50ZXJYO1xyXG4gICAgICBwSFRleHQudG9wID0gYmFja2dyb3VuZFJlY3RhbmdsZS50b3AgKyBiYWNrZ3JvdW5kWU1hcmdpbjtcclxuICAgIH0gKTtcclxuXHJcbiAgICBudW1iZXJEaXNwbGF5LmNlbnRlclggPSBiYWNrZ3JvdW5kUmVjdGFuZ2xlLmNlbnRlclg7XHJcbiAgICBudW1iZXJEaXNwbGF5LnRvcCA9IHBIVGV4dC5ib3R0b20gKyBiYWNrZ3JvdW5kWVNwYWNpbmc7XHJcblxyXG4gICAgcEhQcm9wZXJ0eS5saW5rKCBwSCA9PiB7XHJcblxyXG4gICAgICAvLyBtYWtlIHRoZSBpbmRpY2F0b3IgbG9vayBlbmFibGVkIG9yIGRpc2FibGVkXHJcbiAgICAgIGNvbnN0IGVuYWJsZWQgPSAoIHBIICE9PSBudWxsICk7XHJcbiAgICAgIGJhY2tncm91bmRSZWN0YW5nbGUuZmlsbCA9IGVuYWJsZWQgPyBCQUNLR1JPVU5EX0VOQUJMRURfRklMTCA6IEJBQ0tHUk9VTkRfRElTQUJMRURfRklMTDtcclxuICAgICAgYXJyb3dOb2RlLnZpc2libGUgPSBsaW5lTm9kZS52aXNpYmxlID0gZW5hYmxlZDtcclxuXHJcbiAgICAgIC8vIEhpZ2hsaWdodCB0aGUgaW5kaWNhdG9yIHdoZW4gZGlzcGxheWVkIHBIID09PSA3XHJcbiAgICAgIGhpZ2hsaWdodC52aXNpYmxlID0gKCBwSCAhPT0gbnVsbCApICYmICggVXRpbHMudG9GaXhlZE51bWJlciggcEgsIFBIU2NhbGVDb25zdGFudHMuUEhfTUVURVJfREVDSU1BTF9QTEFDRVMgKSA9PT0gNyApO1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxucGhTY2FsZS5yZWdpc3RlciggJ01hY3JvUEhNZXRlck5vZGUnLCBNYWNyb1BITWV0ZXJOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBRXpELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLFNBQVMsTUFBNEIsdUNBQXVDO0FBR25GLE9BQU9DLGFBQWEsTUFB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