// Copyright 2013-2023, University of Colorado Boulder

/**
 * Renderer for slope equations.
 * General form is m = (y2 - y1) / (x2 - x1) = rise/run
 *
 * x1, y1, x2, and y2 are all interactive.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import MinusNode from '../../../../scenery-phet/js/MinusNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line as SceneryLine, Node, RichText, Text } from '../../../../scenery/js/imports.js';
import GLColors from '../../common/GLColors.js';
import GLConstants from '../../common/GLConstants.js';
import GLSymbols from '../../common/GLSymbols.js';
import Line from '../../common/model/Line.js';
import EquationNode from '../../common/view/EquationNode.js';
import NumberBackgroundNode from '../../common/view/NumberBackgroundNode.js';
import CoordinatePicker from '../../common/view/picker/CoordinatePicker.js';
import UndefinedSlopeIndicator from '../../common/view/UndefinedSlopeIndicator.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
export default class SlopeEquationNode extends EquationNode {
  /**
   * Creates an interactive equation. x1, y1, x2 and y2 are interactive.
   */
  constructor(lineProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      x1RangeProperty: new Property(GLConstants.X_AXIS_RANGE),
      x2RangeProperty: new Property(GLConstants.X_AXIS_RANGE),
      y1RangeProperty: new Property(GLConstants.Y_AXIS_RANGE),
      y2RangeProperty: new Property(GLConstants.Y_AXIS_RANGE),
      fontSize: GLConstants.INTERACTIVE_EQUATION_FONT_SIZE,
      staticColor: 'black'
    }, providedOptions);
    super(options); // call first, because supertype constructor computes various layout metrics

    const interactiveFont = new PhetFont({
      size: options.fontSize,
      weight: GLConstants.EQUATION_FONT_WEIGHT
    });
    const staticFont = new PhetFont({
      size: options.fontSize,
      weight: GLConstants.EQUATION_FONT_WEIGHT
    });
    const staticOptions = {
      font: staticFont,
      fill: options.staticColor
    };
    const fractionLineOptions = {
      stroke: options.staticColor,
      lineWidth: this.fractionLineThickness
    };
    const numberPropertyOptions = {
      numberType: 'Integer'
    };

    // internal Properties that are connected to pickers
    const x1Property = new NumberProperty(lineProperty.value.x1, numberPropertyOptions);
    const y1Property = new NumberProperty(lineProperty.value.y1, numberPropertyOptions);
    const x2Property = new NumberProperty(lineProperty.value.x2, numberPropertyOptions);
    const y2Property = new NumberProperty(lineProperty.value.y2, numberPropertyOptions);

    // internal Properties that are connected to number displays
    const riseProperty = new NumberProperty(lineProperty.value.rise, numberPropertyOptions);
    const runProperty = new NumberProperty(lineProperty.value.run, numberPropertyOptions);

    /*
     * Flag that allows us to update all controls atomically when the model changes.
     * When a picker's value changes, it results in the creation of a new Line.
     * So if you don't change the pickers atomically to match a new Line instance,
     * the new Line will be inadvertently replaced with an incorrect line.
     */
    let updatingControls = false;

    // Nodes that could appear is all possible ways to write the equation
    // m =
    const mNode = new RichText(GLSymbols.m, staticOptions);
    const interactiveEqualsNode = new Text(MathSymbols.EQUAL_TO, staticOptions);
    // y2 - y1
    const y2Node = new CoordinatePicker(y2Property, x2Property, y1Property, x1Property, options.y2RangeProperty, {
      font: interactiveFont,
      color: GLColors.POINT_X2_Y2
    });
    const numeratorOperatorNode = new MinusNode(combineOptions({
      size: this.operatorLineSize
    }, staticOptions));
    const y1Node = new CoordinatePicker(y1Property, x1Property, y2Property, x2Property, options.y1RangeProperty, {
      font: interactiveFont,
      color: GLColors.POINT_X1_Y1
    });
    // fraction line, correct length will be set later
    const interactiveFractionLineNode = new SceneryLine(0, 0, 1, 0, fractionLineOptions);
    // x2 - x1
    const x2Node = new CoordinatePicker(x2Property, y2Property, x1Property, y1Property, options.x2RangeProperty, {
      font: interactiveFont,
      color: GLColors.POINT_X2_Y2
    });
    const denominatorOperatorNode = new MinusNode(combineOptions({
      size: this.operatorLineSize
    }, staticOptions));
    const x1Node = new CoordinatePicker(x1Property, y1Property, x2Property, y2Property, options.x1RangeProperty, {
      font: interactiveFont,
      color: GLColors.POINT_X1_Y1
    });
    // = unsimplified value
    const unsimplifiedSlopeOptions = {
      font: staticFont,
      decimalPlaces: 0,
      backgroundFill: GLColors.SLOPE,
      minWidth: y2Node.width,
      minHeight: y2Node.height - 20
    };
    const unsimplifiedEqualsNode = new RichText(MathSymbols.EQUAL_TO, staticOptions);
    const unsimplifiedRiseNode = new NumberBackgroundNode(riseProperty, unsimplifiedSlopeOptions);
    const unsimplifiedRunNode = new NumberBackgroundNode(runProperty, unsimplifiedSlopeOptions);
    const unsimplifiedFractionLineNode = new SceneryLine(0, 0, 1, 0, fractionLineOptions); // correct length will be set later

    const undefinedSlopeIndicator = new UndefinedSlopeIndicator(1, 1);

    // rendering order
    const parentNode = new Node();
    this.addChild(parentNode);
    this.addChild(undefinedSlopeIndicator);

    // m =
    parentNode.addChild(mNode);
    parentNode.addChild(interactiveEqualsNode);
    // y2 - y1
    parentNode.addChild(y2Node);
    parentNode.addChild(numeratorOperatorNode);
    parentNode.addChild(y1Node);
    // fraction line
    parentNode.addChild(interactiveFractionLineNode);
    // x2 - x1
    parentNode.addChild(x2Node);
    parentNode.addChild(denominatorOperatorNode);
    parentNode.addChild(x1Node);
    // = rise/run
    parentNode.addChild(unsimplifiedEqualsNode);
    parentNode.addChild(unsimplifiedRiseNode);
    parentNode.addChild(unsimplifiedFractionLineNode);
    parentNode.addChild(unsimplifiedRunNode);

    // sync the model with the controls, unmultilink in dispose
    const controlsMultilink = Multilink.lazyMultilink([x1Property, y1Property, x2Property, y2Property], (x1, y1, x2, y2) => {
      if (!updatingControls) {
        lineProperty.value = new Line(x1, y1, x2, y2, lineProperty.value.color);
      }
    });

    // sync the controls and layout with the model
    const lineObserver = line => {
      // Synchronize the controls atomically.
      updatingControls = true;
      {
        x1Property.value = line.x1;
        y1Property.value = line.y1;
        x2Property.value = line.x2;
        y2Property.value = line.y2;
      }
      updatingControls = false;

      // Update the unsimplified slope
      riseProperty.value = line.rise;
      runProperty.value = line.run;

      // fraction line length
      const unsimplifiedFractionLineLength = Math.max(unsimplifiedRiseNode.width, unsimplifiedRunNode.width);
      unsimplifiedFractionLineNode.setLine(0, 0, unsimplifiedFractionLineLength, 0);

      // undefined-slope indicator
      undefinedSlopeIndicator.visible = line.undefinedSlope();
    };
    lineProperty.link(lineObserver); // unlink in dispose

    // layout, after registering observers
    // m =
    mNode.x = 0;
    mNode.y = 0;
    interactiveEqualsNode.left = mNode.right + this.relationalOperatorXSpacing;
    interactiveEqualsNode.y = mNode.y;
    // fraction line
    interactiveFractionLineNode.left = interactiveEqualsNode.right + this.relationalOperatorXSpacing;
    interactiveFractionLineNode.centerY = interactiveEqualsNode.centerY + this.fractionLineYFudgeFactor;
    // y2 - y1
    y2Node.left = interactiveFractionLineNode.left;
    y2Node.bottom = interactiveFractionLineNode.top - this.pickersYSpacing;
    numeratorOperatorNode.left = y2Node.right + this.operatorXSpacing;
    numeratorOperatorNode.centerY = y2Node.centerY;
    y1Node.left = numeratorOperatorNode.right + this.operatorXSpacing;
    y1Node.y = y2Node.y;
    // fix fraction line length
    const fractionLineLength = y1Node.right - y2Node.left;
    interactiveFractionLineNode.setLine(0, 0, fractionLineLength, 0);
    // x2 - x1
    x2Node.left = y2Node.left;
    x2Node.top = interactiveFractionLineNode.bottom + this.pickersYSpacing;
    denominatorOperatorNode.left = x2Node.right + this.operatorXSpacing;
    denominatorOperatorNode.centerY = x2Node.centerY;
    x1Node.left = denominatorOperatorNode.right + this.operatorXSpacing;
    x1Node.y = x2Node.y;
    // = rise/run
    unsimplifiedEqualsNode.left = interactiveFractionLineNode.right + this.relationalOperatorXSpacing;
    unsimplifiedEqualsNode.y = interactiveEqualsNode.y;
    unsimplifiedFractionLineNode.left = unsimplifiedEqualsNode.right + this.relationalOperatorXSpacing;
    unsimplifiedFractionLineNode.y = interactiveFractionLineNode.y;
    // horizontally center rise and run above fraction line
    unsimplifiedRiseNode.centerX = unsimplifiedFractionLineNode.centerX;
    unsimplifiedRiseNode.bottom = unsimplifiedFractionLineNode.top - this.slopeYSpacing;
    unsimplifiedRunNode.centerX = unsimplifiedFractionLineNode.centerX;
    unsimplifiedRunNode.top = unsimplifiedFractionLineNode.bottom + this.slopeYSpacing;

    // set up undefined-slope indicator last
    undefinedSlopeIndicator.setSize(parentNode.getWidth(), parentNode.getHeight());
    undefinedSlopeIndicator.centerX = parentNode.centerX;
    undefinedSlopeIndicator.centerY = parentNode.centerY + this.undefinedSlopeYFudgeFactor;
    this.mutate(options);
    this.disposeSlopeEquationNode = () => {
      x1Node.dispose();
      x2Node.dispose();
      y1Node.dispose();
      y2Node.dispose();
      unsimplifiedRiseNode.dispose();
      unsimplifiedRunNode.dispose();
      lineProperty.unlink(lineObserver);
      Multilink.unmultilink(controlsMultilink);
    };
  }
  dispose() {
    this.disposeSlopeEquationNode();
    super.dispose();
  }

  /**
   * Creates a node that displays the general form of the slope equation: m = (y2-y1)/(x2-x1)
   */
  static createGeneralFormNode() {
    const options = {
      pickable: false,
      fontSize: 20,
      fontWeight: GLConstants.EQUATION_FONT_WEIGHT,
      fill: 'black',
      maxWidth: 300
    };
    const font = new PhetFont({
      size: options.fontSize,
      weight: options.fontWeight
    });

    // Slope m =
    const leftSideText = StringUtils.fillIn(`{{slope}}    {{m}} ${MathSymbols.EQUAL_TO}`, {
      slope: GraphingLinesStrings.slope,
      m: GLSymbols.m
    });
    const leftSideNode = new RichText(leftSideText, {
      font: font,
      fill: options.fill,
      maxWidth: 125 // i18n, determined empirically
    });

    // pattern for numerator and denominator
    const pattern = `{{symbol}}<sub>2</sub> ${MathSymbols.MINUS} {{symbol}}<sub>1</sub>`;

    // y2 - y1
    const numeratorText = StringUtils.fillIn(pattern, {
      symbol: GLSymbols.y
    });
    const numeratorNode = new RichText(numeratorText, {
      font: font,
      fill: options.fill
    });

    // x2 - x1
    const denominatorText = StringUtils.fillIn(pattern, {
      symbol: GLSymbols.x
    });
    const denominatorNode = new RichText(denominatorText, {
      font: font,
      fill: options.fill
    });

    // fraction line
    const length = Math.max(numeratorNode.width, denominatorNode.width);
    const fractionLineNode = new SceneryLine(0, 0, length, 0, {
      stroke: options.fill,
      lineWidth: 0.06 * options.fontSize
    });

    // rendering order
    const parent = new Node({
      children: [leftSideNode, fractionLineNode, numeratorNode, denominatorNode]
    });

    // layout
    leftSideNode.x = 0;
    leftSideNode.y = 0;
    fractionLineNode.left = leftSideNode.right + 5;
    fractionLineNode.centerY = leftSideNode.centerY;
    numeratorNode.centerX = fractionLineNode.centerX;
    numeratorNode.bottom = fractionLineNode.top - 5;
    denominatorNode.centerX = fractionLineNode.centerX;
    denominatorNode.top = fractionLineNode.bottom + 1;
    return parent;
  }

  /**
   * Creates a non-interactive equation, used to label a dynamic line.
   */
  static createDynamicLabel(lineProperty, providedOptions) {
    const options = combineOptions({
      pickable: false,
      maxWidth: 200
    }, providedOptions);
    return new DynamicLabelNode(lineProperty, options);
  }
}

/**
 * A non-interactive equation, used to label a dynamic line.
 * This takes the form 'Slope is rise/run', which is different than the interactive equation form.
 * Note that while this is a sentence, it's order is not localized, due to the fact that it is
 * composed of multiple phet.scenery.Text nodes.
 */
class DynamicLabelNode extends EquationNode {
  constructor(lineProperty, providedOptions) {
    const options = combineOptions({
      fontSize: 18
    }, providedOptions);
    super(options);
    const textOptions = {
      font: new PhetFont({
        size: options.fontSize,
        weight: GLConstants.EQUATION_FONT_WEIGHT
      })
    };

    // allocate nodes needed to represent all simplified forms
    const slopeIsNode = new Text(GraphingLinesStrings.slopeIs, textOptions);
    const minusSignNode = new MinusNode({
      size: this.signLineSize
    });
    const riseNode = new Text('?', textOptions);
    const runNode = new Text('?', textOptions);
    const fractionLineNode = new SceneryLine(0, 0, 1, 0, {
      lineWidth: this.fractionLineThickness
    });

    // add all nodes, we'll set which ones are visible bases on desired simplification
    assert && assert(this.getChildrenCount() === 0, 'supertype has unexpected children');
    this.children = [slopeIsNode, minusSignNode, riseNode, runNode, fractionLineNode];

    // update visibility, layout and properties of nodes to match the current line
    const update = line => {
      const lineColor = line.color;

      // start with all children invisible
      const len = this.children.length;
      for (let i = 0; i < len; i++) {
        this.children[i].visible = false;
      }

      // 'Slope is'
      slopeIsNode.visible = true;
      slopeIsNode.fill = lineColor;
      if (line.undefinedSlope()) {
        // 'undefined'
        riseNode.visible = true;
        riseNode.string = GraphingLinesStrings.undefined;
        riseNode.fill = lineColor;
        riseNode.left = slopeIsNode.right + this.relationalOperatorXSpacing;
        riseNode.y = slopeIsNode.y;
      } else if (line.getSlope() === 0) {
        // 0
        riseNode.visible = true;
        riseNode.string = '0';
        riseNode.fill = lineColor;
        riseNode.left = slopeIsNode.right + this.relationalOperatorXSpacing;
        riseNode.y = slopeIsNode.y;
      } else {
        let nextXOffset;
        if (line.getSlope() < 0) {
          // minus sign
          minusSignNode.visible = true;
          minusSignNode.fill = lineColor;
          minusSignNode.left = slopeIsNode.right + this.relationalOperatorXSpacing;
          minusSignNode.centerY = slopeIsNode.centerY + this.slopeSignYFudgeFactor + this.slopeSignYOffset;
          nextXOffset = minusSignNode.right + this.fractionalSlopeXSpacing;
        } else {
          // no sign
          nextXOffset = slopeIsNode.right + this.relationalOperatorXSpacing;
        }
        if (Number.isInteger(line.getSlope())) {
          // integer slope (rise/1)
          riseNode.visible = true;
          riseNode.string = Utils.toFixed(Math.abs(line.getSlope()), 0);
          riseNode.fill = lineColor;
          riseNode.left = nextXOffset;
          riseNode.y = slopeIsNode.y;
        } else {
          // fractional slope
          riseNode.visible = runNode.visible = fractionLineNode.visible = true;
          riseNode.string = Utils.toFixed(Math.abs(line.getSimplifiedRise()), 0);
          runNode.string = Utils.toFixed(Math.abs(line.getSimplifiedRun()), 0);
          fractionLineNode.setLine(0, 0, Math.max(riseNode.width, runNode.width), 0);
          riseNode.fill = runNode.fill = fractionLineNode.stroke = lineColor;

          // layout, values horizontally centered
          fractionLineNode.left = nextXOffset;
          fractionLineNode.centerY = slopeIsNode.centerY + this.fractionLineYFudgeFactor;
          riseNode.centerX = fractionLineNode.centerX;
          riseNode.bottom = fractionLineNode.top - this.ySpacing;
          runNode.centerX = fractionLineNode.centerX;
          runNode.top = fractionLineNode.bottom + this.ySpacing;
        }
      }
    };
    const lineObserver = line => update(line);
    lineProperty.link(lineObserver); // unlink in dispose

    this.disposeDynamicLabelNode = () => {
      lineProperty.unlink(lineObserver);
    };
    this.mutate(options);
  }
  dispose() {
    this.disposeDynamicLabelNode();
    super.dispose();
  }
}
graphingLines.register('SlopeEquationNode', SlopeEquationNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiVXRpbHMiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIlN0cmluZ1V0aWxzIiwiTWF0aFN5bWJvbHMiLCJNaW51c05vZGUiLCJQaGV0Rm9udCIsIkxpbmUiLCJTY2VuZXJ5TGluZSIsIk5vZGUiLCJSaWNoVGV4dCIsIlRleHQiLCJHTENvbG9ycyIsIkdMQ29uc3RhbnRzIiwiR0xTeW1ib2xzIiwiRXF1YXRpb25Ob2RlIiwiTnVtYmVyQmFja2dyb3VuZE5vZGUiLCJDb29yZGluYXRlUGlja2VyIiwiVW5kZWZpbmVkU2xvcGVJbmRpY2F0b3IiLCJncmFwaGluZ0xpbmVzIiwiR3JhcGhpbmdMaW5lc1N0cmluZ3MiLCJTbG9wZUVxdWF0aW9uTm9kZSIsImNvbnN0cnVjdG9yIiwibGluZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIngxUmFuZ2VQcm9wZXJ0eSIsIlhfQVhJU19SQU5HRSIsIngyUmFuZ2VQcm9wZXJ0eSIsInkxUmFuZ2VQcm9wZXJ0eSIsIllfQVhJU19SQU5HRSIsInkyUmFuZ2VQcm9wZXJ0eSIsImZvbnRTaXplIiwiSU5URVJBQ1RJVkVfRVFVQVRJT05fRk9OVF9TSVpFIiwic3RhdGljQ29sb3IiLCJpbnRlcmFjdGl2ZUZvbnQiLCJzaXplIiwid2VpZ2h0IiwiRVFVQVRJT05fRk9OVF9XRUlHSFQiLCJzdGF0aWNGb250Iiwic3RhdGljT3B0aW9ucyIsImZvbnQiLCJmaWxsIiwiZnJhY3Rpb25MaW5lT3B0aW9ucyIsInN0cm9rZSIsImxpbmVXaWR0aCIsImZyYWN0aW9uTGluZVRoaWNrbmVzcyIsIm51bWJlclByb3BlcnR5T3B0aW9ucyIsIm51bWJlclR5cGUiLCJ4MVByb3BlcnR5IiwidmFsdWUiLCJ4MSIsInkxUHJvcGVydHkiLCJ5MSIsIngyUHJvcGVydHkiLCJ4MiIsInkyUHJvcGVydHkiLCJ5MiIsInJpc2VQcm9wZXJ0eSIsInJpc2UiLCJydW5Qcm9wZXJ0eSIsInJ1biIsInVwZGF0aW5nQ29udHJvbHMiLCJtTm9kZSIsIm0iLCJpbnRlcmFjdGl2ZUVxdWFsc05vZGUiLCJFUVVBTF9UTyIsInkyTm9kZSIsImNvbG9yIiwiUE9JTlRfWDJfWTIiLCJudW1lcmF0b3JPcGVyYXRvck5vZGUiLCJvcGVyYXRvckxpbmVTaXplIiwieTFOb2RlIiwiUE9JTlRfWDFfWTEiLCJpbnRlcmFjdGl2ZUZyYWN0aW9uTGluZU5vZGUiLCJ4Mk5vZGUiLCJkZW5vbWluYXRvck9wZXJhdG9yTm9kZSIsIngxTm9kZSIsInVuc2ltcGxpZmllZFNsb3BlT3B0aW9ucyIsImRlY2ltYWxQbGFjZXMiLCJiYWNrZ3JvdW5kRmlsbCIsIlNMT1BFIiwibWluV2lkdGgiLCJ3aWR0aCIsIm1pbkhlaWdodCIsImhlaWdodCIsInVuc2ltcGxpZmllZEVxdWFsc05vZGUiLCJ1bnNpbXBsaWZpZWRSaXNlTm9kZSIsInVuc2ltcGxpZmllZFJ1bk5vZGUiLCJ1bnNpbXBsaWZpZWRGcmFjdGlvbkxpbmVOb2RlIiwidW5kZWZpbmVkU2xvcGVJbmRpY2F0b3IiLCJwYXJlbnROb2RlIiwiYWRkQ2hpbGQiLCJjb250cm9sc011bHRpbGluayIsImxhenlNdWx0aWxpbmsiLCJsaW5lT2JzZXJ2ZXIiLCJsaW5lIiwidW5zaW1wbGlmaWVkRnJhY3Rpb25MaW5lTGVuZ3RoIiwiTWF0aCIsIm1heCIsInNldExpbmUiLCJ2aXNpYmxlIiwidW5kZWZpbmVkU2xvcGUiLCJsaW5rIiwieCIsInkiLCJsZWZ0IiwicmlnaHQiLCJyZWxhdGlvbmFsT3BlcmF0b3JYU3BhY2luZyIsImNlbnRlclkiLCJmcmFjdGlvbkxpbmVZRnVkZ2VGYWN0b3IiLCJib3R0b20iLCJ0b3AiLCJwaWNrZXJzWVNwYWNpbmciLCJvcGVyYXRvclhTcGFjaW5nIiwiZnJhY3Rpb25MaW5lTGVuZ3RoIiwiY2VudGVyWCIsInNsb3BlWVNwYWNpbmciLCJzZXRTaXplIiwiZ2V0V2lkdGgiLCJnZXRIZWlnaHQiLCJ1bmRlZmluZWRTbG9wZVlGdWRnZUZhY3RvciIsIm11dGF0ZSIsImRpc3Bvc2VTbG9wZUVxdWF0aW9uTm9kZSIsImRpc3Bvc2UiLCJ1bmxpbmsiLCJ1bm11bHRpbGluayIsImNyZWF0ZUdlbmVyYWxGb3JtTm9kZSIsInBpY2thYmxlIiwiZm9udFdlaWdodCIsIm1heFdpZHRoIiwibGVmdFNpZGVUZXh0IiwiZmlsbEluIiwic2xvcGUiLCJsZWZ0U2lkZU5vZGUiLCJwYXR0ZXJuIiwiTUlOVVMiLCJudW1lcmF0b3JUZXh0Iiwic3ltYm9sIiwibnVtZXJhdG9yTm9kZSIsImRlbm9taW5hdG9yVGV4dCIsImRlbm9taW5hdG9yTm9kZSIsImxlbmd0aCIsImZyYWN0aW9uTGluZU5vZGUiLCJwYXJlbnQiLCJjaGlsZHJlbiIsImNyZWF0ZUR5bmFtaWNMYWJlbCIsIkR5bmFtaWNMYWJlbE5vZGUiLCJ0ZXh0T3B0aW9ucyIsInNsb3BlSXNOb2RlIiwic2xvcGVJcyIsIm1pbnVzU2lnbk5vZGUiLCJzaWduTGluZVNpemUiLCJyaXNlTm9kZSIsInJ1bk5vZGUiLCJhc3NlcnQiLCJnZXRDaGlsZHJlbkNvdW50IiwidXBkYXRlIiwibGluZUNvbG9yIiwibGVuIiwiaSIsInN0cmluZyIsInVuZGVmaW5lZCIsImdldFNsb3BlIiwibmV4dFhPZmZzZXQiLCJzbG9wZVNpZ25ZRnVkZ2VGYWN0b3IiLCJzbG9wZVNpZ25ZT2Zmc2V0IiwiZnJhY3Rpb25hbFNsb3BlWFNwYWNpbmciLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJ0b0ZpeGVkIiwiYWJzIiwiZ2V0U2ltcGxpZmllZFJpc2UiLCJnZXRTaW1wbGlmaWVkUnVuIiwieVNwYWNpbmciLCJkaXNwb3NlRHluYW1pY0xhYmVsTm9kZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2xvcGVFcXVhdGlvbk5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmVuZGVyZXIgZm9yIHNsb3BlIGVxdWF0aW9ucy5cclxuICogR2VuZXJhbCBmb3JtIGlzIG0gPSAoeTIgLSB5MSkgLyAoeDIgLSB4MSkgPSByaXNlL3J1blxyXG4gKlxyXG4gKiB4MSwgeTEsIHgyLCBhbmQgeTIgYXJlIGFsbCBpbnRlcmFjdGl2ZS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5LCB7IE51bWJlclByb3BlcnR5T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IE1hdGhTeW1ib2xzIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRoU3ltYm9scy5qcyc7XHJcbmltcG9ydCBNaW51c05vZGUsIHsgTWludXNOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NaW51c05vZGUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTGluZSBhcyBTY2VuZXJ5TGluZSwgTm9kZSwgUmljaFRleHQsIFRDb2xvciwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBHTENvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vR0xDb2xvcnMuanMnO1xyXG5pbXBvcnQgR0xDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0dMQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEdMU3ltYm9scyBmcm9tICcuLi8uLi9jb21tb24vR0xTeW1ib2xzLmpzJztcclxuaW1wb3J0IExpbmUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0xpbmUuanMnO1xyXG5pbXBvcnQgRXF1YXRpb25Ob2RlLCB7IEVxdWF0aW9uTm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9FcXVhdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgTnVtYmVyQmFja2dyb3VuZE5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvTnVtYmVyQmFja2dyb3VuZE5vZGUuanMnO1xyXG5pbXBvcnQgQ29vcmRpbmF0ZVBpY2tlciBmcm9tICcuLi8uLi9jb21tb24vdmlldy9waWNrZXIvQ29vcmRpbmF0ZVBpY2tlci5qcyc7XHJcbmltcG9ydCBVbmRlZmluZWRTbG9wZUluZGljYXRvciBmcm9tICcuLi8uLi9jb21tb24vdmlldy9VbmRlZmluZWRTbG9wZUluZGljYXRvci5qcyc7XHJcbmltcG9ydCBncmFwaGluZ0xpbmVzIGZyb20gJy4uLy4uL2dyYXBoaW5nTGluZXMuanMnO1xyXG5pbXBvcnQgR3JhcGhpbmdMaW5lc1N0cmluZ3MgZnJvbSAnLi4vLi4vR3JhcGhpbmdMaW5lc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgeyBDcmVhdGVEeW5hbWljTGFiZWxPcHRpb25zIH0gZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvTGluZU5vZGUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gUmFuZ2VzIGZvciB0aGUgTnVtYmVyUGlja2Vyc1xyXG4gIHgxUmFuZ2VQcm9wZXJ0eT86IFByb3BlcnR5PFJhbmdlPjtcclxuICB4MlJhbmdlUHJvcGVydHk/OiBQcm9wZXJ0eTxSYW5nZT47XHJcbiAgeTFSYW5nZVByb3BlcnR5PzogUHJvcGVydHk8UmFuZ2U+O1xyXG4gIHkyUmFuZ2VQcm9wZXJ0eT86IFByb3BlcnR5PFJhbmdlPjtcclxuXHJcbiAgLy8gZm9udCBzaXplIGZvciBhbGwgZWxlbWVudHNcclxuICBmb250U2l6ZT86IG51bWJlcjtcclxuXHJcbiAgLy8gQ29sb3Igb2Ygc3RhdGljIGVsZW1lbnRzXHJcbiAgc3RhdGljQ29sb3I/OiBUQ29sb3I7XHJcbn07XHJcblxyXG50eXBlIFNsb3BlRXF1YXRpb25Ob2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgRXF1YXRpb25Ob2RlT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNsb3BlRXF1YXRpb25Ob2RlIGV4dGVuZHMgRXF1YXRpb25Ob2RlIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlU2xvcGVFcXVhdGlvbk5vZGU6ICgpID0+IHZvaWQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYW4gaW50ZXJhY3RpdmUgZXF1YXRpb24uIHgxLCB5MSwgeDIgYW5kIHkyIGFyZSBpbnRlcmFjdGl2ZS5cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxpbmVQcm9wZXJ0eTogUHJvcGVydHk8TGluZT4sIHByb3ZpZGVkT3B0aW9ucz86IFNsb3BlRXF1YXRpb25Ob2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNsb3BlRXF1YXRpb25Ob2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIEVxdWF0aW9uTm9kZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIHgxUmFuZ2VQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBHTENvbnN0YW50cy5YX0FYSVNfUkFOR0UgKSxcclxuICAgICAgeDJSYW5nZVByb3BlcnR5OiBuZXcgUHJvcGVydHkoIEdMQ29uc3RhbnRzLlhfQVhJU19SQU5HRSApLFxyXG4gICAgICB5MVJhbmdlUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggR0xDb25zdGFudHMuWV9BWElTX1JBTkdFICksXHJcbiAgICAgIHkyUmFuZ2VQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBHTENvbnN0YW50cy5ZX0FYSVNfUkFOR0UgKSxcclxuICAgICAgZm9udFNpemU6IEdMQ29uc3RhbnRzLklOVEVSQUNUSVZFX0VRVUFUSU9OX0ZPTlRfU0laRSxcclxuICAgICAgc3RhdGljQ29sb3I6ICdibGFjaydcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7IC8vIGNhbGwgZmlyc3QsIGJlY2F1c2Ugc3VwZXJ0eXBlIGNvbnN0cnVjdG9yIGNvbXB1dGVzIHZhcmlvdXMgbGF5b3V0IG1ldHJpY3NcclxuXHJcbiAgICBjb25zdCBpbnRlcmFjdGl2ZUZvbnQgPSBuZXcgUGhldEZvbnQoIHtcclxuICAgICAgc2l6ZTogb3B0aW9ucy5mb250U2l6ZSxcclxuICAgICAgd2VpZ2h0OiBHTENvbnN0YW50cy5FUVVBVElPTl9GT05UX1dFSUdIVFxyXG4gICAgfSApO1xyXG4gICAgY29uc3Qgc3RhdGljRm9udCA9IG5ldyBQaGV0Rm9udCgge1xyXG4gICAgICBzaXplOiBvcHRpb25zLmZvbnRTaXplLFxyXG4gICAgICB3ZWlnaHQ6IEdMQ29uc3RhbnRzLkVRVUFUSU9OX0ZPTlRfV0VJR0hUXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc3RhdGljT3B0aW9ucyA9IHtcclxuICAgICAgZm9udDogc3RhdGljRm9udCxcclxuICAgICAgZmlsbDogb3B0aW9ucy5zdGF0aWNDb2xvclxyXG4gICAgfTtcclxuICAgIGNvbnN0IGZyYWN0aW9uTGluZU9wdGlvbnMgPSB7XHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5zdGF0aWNDb2xvcixcclxuICAgICAgbGluZVdpZHRoOiB0aGlzLmZyYWN0aW9uTGluZVRoaWNrbmVzc1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBudW1iZXJQcm9wZXJ0eU9wdGlvbnM6IE51bWJlclByb3BlcnR5T3B0aW9ucyA9IHtcclxuICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGludGVybmFsIFByb3BlcnRpZXMgdGhhdCBhcmUgY29ubmVjdGVkIHRvIHBpY2tlcnNcclxuICAgIGNvbnN0IHgxUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIGxpbmVQcm9wZXJ0eS52YWx1ZS54MSwgbnVtYmVyUHJvcGVydHlPcHRpb25zICk7XHJcbiAgICBjb25zdCB5MVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBsaW5lUHJvcGVydHkudmFsdWUueTEsIG51bWJlclByb3BlcnR5T3B0aW9ucyApO1xyXG4gICAgY29uc3QgeDJQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggbGluZVByb3BlcnR5LnZhbHVlLngyLCBudW1iZXJQcm9wZXJ0eU9wdGlvbnMgKTtcclxuICAgIGNvbnN0IHkyUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIGxpbmVQcm9wZXJ0eS52YWx1ZS55MiwgbnVtYmVyUHJvcGVydHlPcHRpb25zICk7XHJcblxyXG4gICAgLy8gaW50ZXJuYWwgUHJvcGVydGllcyB0aGF0IGFyZSBjb25uZWN0ZWQgdG8gbnVtYmVyIGRpc3BsYXlzXHJcbiAgICBjb25zdCByaXNlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIGxpbmVQcm9wZXJ0eS52YWx1ZS5yaXNlLCBudW1iZXJQcm9wZXJ0eU9wdGlvbnMgKTtcclxuICAgIGNvbnN0IHJ1blByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBsaW5lUHJvcGVydHkudmFsdWUucnVuLCBudW1iZXJQcm9wZXJ0eU9wdGlvbnMgKTtcclxuXHJcbiAgICAvKlxyXG4gICAgICogRmxhZyB0aGF0IGFsbG93cyB1cyB0byB1cGRhdGUgYWxsIGNvbnRyb2xzIGF0b21pY2FsbHkgd2hlbiB0aGUgbW9kZWwgY2hhbmdlcy5cclxuICAgICAqIFdoZW4gYSBwaWNrZXIncyB2YWx1ZSBjaGFuZ2VzLCBpdCByZXN1bHRzIGluIHRoZSBjcmVhdGlvbiBvZiBhIG5ldyBMaW5lLlxyXG4gICAgICogU28gaWYgeW91IGRvbid0IGNoYW5nZSB0aGUgcGlja2VycyBhdG9taWNhbGx5IHRvIG1hdGNoIGEgbmV3IExpbmUgaW5zdGFuY2UsXHJcbiAgICAgKiB0aGUgbmV3IExpbmUgd2lsbCBiZSBpbmFkdmVydGVudGx5IHJlcGxhY2VkIHdpdGggYW4gaW5jb3JyZWN0IGxpbmUuXHJcbiAgICAgKi9cclxuICAgIGxldCB1cGRhdGluZ0NvbnRyb2xzID0gZmFsc2U7XHJcblxyXG4gICAgLy8gTm9kZXMgdGhhdCBjb3VsZCBhcHBlYXIgaXMgYWxsIHBvc3NpYmxlIHdheXMgdG8gd3JpdGUgdGhlIGVxdWF0aW9uXHJcbiAgICAvLyBtID1cclxuICAgIGNvbnN0IG1Ob2RlID0gbmV3IFJpY2hUZXh0KCBHTFN5bWJvbHMubSwgc3RhdGljT3B0aW9ucyApO1xyXG4gICAgY29uc3QgaW50ZXJhY3RpdmVFcXVhbHNOb2RlID0gbmV3IFRleHQoIE1hdGhTeW1ib2xzLkVRVUFMX1RPLCBzdGF0aWNPcHRpb25zICk7XHJcbiAgICAvLyB5MiAtIHkxXHJcbiAgICBjb25zdCB5Mk5vZGUgPSBuZXcgQ29vcmRpbmF0ZVBpY2tlciggeTJQcm9wZXJ0eSwgeDJQcm9wZXJ0eSwgeTFQcm9wZXJ0eSwgeDFQcm9wZXJ0eSwgb3B0aW9ucy55MlJhbmdlUHJvcGVydHksIHtcclxuICAgICAgZm9udDogaW50ZXJhY3RpdmVGb250LFxyXG4gICAgICBjb2xvcjogR0xDb2xvcnMuUE9JTlRfWDJfWTJcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IG51bWVyYXRvck9wZXJhdG9yTm9kZSA9IG5ldyBNaW51c05vZGUoIGNvbWJpbmVPcHRpb25zPE1pbnVzTm9kZU9wdGlvbnM+KCB7XHJcbiAgICAgIHNpemU6IHRoaXMub3BlcmF0b3JMaW5lU2l6ZVxyXG4gICAgfSwgc3RhdGljT3B0aW9ucyApICk7XHJcbiAgICBjb25zdCB5MU5vZGUgPSBuZXcgQ29vcmRpbmF0ZVBpY2tlciggeTFQcm9wZXJ0eSwgeDFQcm9wZXJ0eSwgeTJQcm9wZXJ0eSwgeDJQcm9wZXJ0eSwgb3B0aW9ucy55MVJhbmdlUHJvcGVydHksIHtcclxuICAgICAgZm9udDogaW50ZXJhY3RpdmVGb250LFxyXG4gICAgICBjb2xvcjogR0xDb2xvcnMuUE9JTlRfWDFfWTFcclxuICAgIH0gKTtcclxuICAgIC8vIGZyYWN0aW9uIGxpbmUsIGNvcnJlY3QgbGVuZ3RoIHdpbGwgYmUgc2V0IGxhdGVyXHJcbiAgICBjb25zdCBpbnRlcmFjdGl2ZUZyYWN0aW9uTGluZU5vZGUgPSBuZXcgU2NlbmVyeUxpbmUoIDAsIDAsIDEsIDAsIGZyYWN0aW9uTGluZU9wdGlvbnMgKTtcclxuICAgIC8vIHgyIC0geDFcclxuICAgIGNvbnN0IHgyTm9kZSA9IG5ldyBDb29yZGluYXRlUGlja2VyKCB4MlByb3BlcnR5LCB5MlByb3BlcnR5LCB4MVByb3BlcnR5LCB5MVByb3BlcnR5LCBvcHRpb25zLngyUmFuZ2VQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBpbnRlcmFjdGl2ZUZvbnQsXHJcbiAgICAgIGNvbG9yOiBHTENvbG9ycy5QT0lOVF9YMl9ZMlxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgZGVub21pbmF0b3JPcGVyYXRvck5vZGUgPSBuZXcgTWludXNOb2RlKCBjb21iaW5lT3B0aW9uczxNaW51c05vZGVPcHRpb25zPigge1xyXG4gICAgICBzaXplOiB0aGlzLm9wZXJhdG9yTGluZVNpemVcclxuICAgIH0sIHN0YXRpY09wdGlvbnMgKSApO1xyXG4gICAgY29uc3QgeDFOb2RlID0gbmV3IENvb3JkaW5hdGVQaWNrZXIoIHgxUHJvcGVydHksIHkxUHJvcGVydHksIHgyUHJvcGVydHksIHkyUHJvcGVydHksIG9wdGlvbnMueDFSYW5nZVByb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IGludGVyYWN0aXZlRm9udCxcclxuICAgICAgY29sb3I6IEdMQ29sb3JzLlBPSU5UX1gxX1kxXHJcbiAgICB9ICk7XHJcbiAgICAvLyA9IHVuc2ltcGxpZmllZCB2YWx1ZVxyXG4gICAgY29uc3QgdW5zaW1wbGlmaWVkU2xvcGVPcHRpb25zID0ge1xyXG4gICAgICBmb250OiBzdGF0aWNGb250LFxyXG4gICAgICBkZWNpbWFsUGxhY2VzOiAwLFxyXG4gICAgICBiYWNrZ3JvdW5kRmlsbDogR0xDb2xvcnMuU0xPUEUsXHJcbiAgICAgIG1pbldpZHRoOiB5Mk5vZGUud2lkdGgsXHJcbiAgICAgIG1pbkhlaWdodDogeTJOb2RlLmhlaWdodCAtIDIwXHJcbiAgICB9O1xyXG4gICAgY29uc3QgdW5zaW1wbGlmaWVkRXF1YWxzTm9kZSA9IG5ldyBSaWNoVGV4dCggTWF0aFN5bWJvbHMuRVFVQUxfVE8sIHN0YXRpY09wdGlvbnMgKTtcclxuICAgIGNvbnN0IHVuc2ltcGxpZmllZFJpc2VOb2RlID0gbmV3IE51bWJlckJhY2tncm91bmROb2RlKCByaXNlUHJvcGVydHksIHVuc2ltcGxpZmllZFNsb3BlT3B0aW9ucyApO1xyXG4gICAgY29uc3QgdW5zaW1wbGlmaWVkUnVuTm9kZSA9IG5ldyBOdW1iZXJCYWNrZ3JvdW5kTm9kZSggcnVuUHJvcGVydHksIHVuc2ltcGxpZmllZFNsb3BlT3B0aW9ucyApO1xyXG4gICAgY29uc3QgdW5zaW1wbGlmaWVkRnJhY3Rpb25MaW5lTm9kZSA9IG5ldyBTY2VuZXJ5TGluZSggMCwgMCwgMSwgMCwgZnJhY3Rpb25MaW5lT3B0aW9ucyApOyAvLyBjb3JyZWN0IGxlbmd0aCB3aWxsIGJlIHNldCBsYXRlclxyXG5cclxuICAgIGNvbnN0IHVuZGVmaW5lZFNsb3BlSW5kaWNhdG9yID0gbmV3IFVuZGVmaW5lZFNsb3BlSW5kaWNhdG9yKCAxLCAxICk7XHJcblxyXG4gICAgLy8gcmVuZGVyaW5nIG9yZGVyXHJcbiAgICBjb25zdCBwYXJlbnROb2RlID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHBhcmVudE5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHVuZGVmaW5lZFNsb3BlSW5kaWNhdG9yICk7XHJcblxyXG4gICAgLy8gbSA9XHJcbiAgICBwYXJlbnROb2RlLmFkZENoaWxkKCBtTm9kZSApO1xyXG4gICAgcGFyZW50Tm9kZS5hZGRDaGlsZCggaW50ZXJhY3RpdmVFcXVhbHNOb2RlICk7XHJcbiAgICAvLyB5MiAtIHkxXHJcbiAgICBwYXJlbnROb2RlLmFkZENoaWxkKCB5Mk5vZGUgKTtcclxuICAgIHBhcmVudE5vZGUuYWRkQ2hpbGQoIG51bWVyYXRvck9wZXJhdG9yTm9kZSApO1xyXG4gICAgcGFyZW50Tm9kZS5hZGRDaGlsZCggeTFOb2RlICk7XHJcbiAgICAvLyBmcmFjdGlvbiBsaW5lXHJcbiAgICBwYXJlbnROb2RlLmFkZENoaWxkKCBpbnRlcmFjdGl2ZUZyYWN0aW9uTGluZU5vZGUgKTtcclxuICAgIC8vIHgyIC0geDFcclxuICAgIHBhcmVudE5vZGUuYWRkQ2hpbGQoIHgyTm9kZSApO1xyXG4gICAgcGFyZW50Tm9kZS5hZGRDaGlsZCggZGVub21pbmF0b3JPcGVyYXRvck5vZGUgKTtcclxuICAgIHBhcmVudE5vZGUuYWRkQ2hpbGQoIHgxTm9kZSApO1xyXG4gICAgLy8gPSByaXNlL3J1blxyXG4gICAgcGFyZW50Tm9kZS5hZGRDaGlsZCggdW5zaW1wbGlmaWVkRXF1YWxzTm9kZSApO1xyXG4gICAgcGFyZW50Tm9kZS5hZGRDaGlsZCggdW5zaW1wbGlmaWVkUmlzZU5vZGUgKTtcclxuICAgIHBhcmVudE5vZGUuYWRkQ2hpbGQoIHVuc2ltcGxpZmllZEZyYWN0aW9uTGluZU5vZGUgKTtcclxuICAgIHBhcmVudE5vZGUuYWRkQ2hpbGQoIHVuc2ltcGxpZmllZFJ1bk5vZGUgKTtcclxuXHJcbiAgICAvLyBzeW5jIHRoZSBtb2RlbCB3aXRoIHRoZSBjb250cm9scywgdW5tdWx0aWxpbmsgaW4gZGlzcG9zZVxyXG4gICAgY29uc3QgY29udHJvbHNNdWx0aWxpbmsgPSBNdWx0aWxpbmsubGF6eU11bHRpbGluayhcclxuICAgICAgWyB4MVByb3BlcnR5LCB5MVByb3BlcnR5LCB4MlByb3BlcnR5LCB5MlByb3BlcnR5IF0sXHJcbiAgICAgICggeDEsIHkxLCB4MiwgeTIgKSA9PiB7XHJcbiAgICAgICAgaWYgKCAhdXBkYXRpbmdDb250cm9scyApIHtcclxuICAgICAgICAgIGxpbmVQcm9wZXJ0eS52YWx1ZSA9IG5ldyBMaW5lKCB4MSwgeTEsIHgyLCB5MiwgbGluZVByb3BlcnR5LnZhbHVlLmNvbG9yICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIHN5bmMgdGhlIGNvbnRyb2xzIGFuZCBsYXlvdXQgd2l0aCB0aGUgbW9kZWxcclxuICAgIGNvbnN0IGxpbmVPYnNlcnZlciA9ICggbGluZTogTGluZSApID0+IHtcclxuXHJcbiAgICAgIC8vIFN5bmNocm9uaXplIHRoZSBjb250cm9scyBhdG9taWNhbGx5LlxyXG4gICAgICB1cGRhdGluZ0NvbnRyb2xzID0gdHJ1ZTtcclxuICAgICAge1xyXG4gICAgICAgIHgxUHJvcGVydHkudmFsdWUgPSBsaW5lLngxO1xyXG4gICAgICAgIHkxUHJvcGVydHkudmFsdWUgPSBsaW5lLnkxO1xyXG4gICAgICAgIHgyUHJvcGVydHkudmFsdWUgPSBsaW5lLngyO1xyXG4gICAgICAgIHkyUHJvcGVydHkudmFsdWUgPSBsaW5lLnkyO1xyXG4gICAgICB9XHJcbiAgICAgIHVwZGF0aW5nQ29udHJvbHMgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUgdW5zaW1wbGlmaWVkIHNsb3BlXHJcbiAgICAgIHJpc2VQcm9wZXJ0eS52YWx1ZSA9IGxpbmUucmlzZTtcclxuICAgICAgcnVuUHJvcGVydHkudmFsdWUgPSBsaW5lLnJ1bjtcclxuXHJcbiAgICAgIC8vIGZyYWN0aW9uIGxpbmUgbGVuZ3RoXHJcbiAgICAgIGNvbnN0IHVuc2ltcGxpZmllZEZyYWN0aW9uTGluZUxlbmd0aCA9IE1hdGgubWF4KCB1bnNpbXBsaWZpZWRSaXNlTm9kZS53aWR0aCwgdW5zaW1wbGlmaWVkUnVuTm9kZS53aWR0aCApO1xyXG4gICAgICB1bnNpbXBsaWZpZWRGcmFjdGlvbkxpbmVOb2RlLnNldExpbmUoIDAsIDAsIHVuc2ltcGxpZmllZEZyYWN0aW9uTGluZUxlbmd0aCwgMCApO1xyXG5cclxuICAgICAgLy8gdW5kZWZpbmVkLXNsb3BlIGluZGljYXRvclxyXG4gICAgICB1bmRlZmluZWRTbG9wZUluZGljYXRvci52aXNpYmxlID0gbGluZS51bmRlZmluZWRTbG9wZSgpO1xyXG4gICAgfTtcclxuICAgIGxpbmVQcm9wZXJ0eS5saW5rKCBsaW5lT2JzZXJ2ZXIgKTsgLy8gdW5saW5rIGluIGRpc3Bvc2VcclxuXHJcbiAgICAvLyBsYXlvdXQsIGFmdGVyIHJlZ2lzdGVyaW5nIG9ic2VydmVyc1xyXG4gICAgLy8gbSA9XHJcbiAgICBtTm9kZS54ID0gMDtcclxuICAgIG1Ob2RlLnkgPSAwO1xyXG4gICAgaW50ZXJhY3RpdmVFcXVhbHNOb2RlLmxlZnQgPSBtTm9kZS5yaWdodCArIHRoaXMucmVsYXRpb25hbE9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICBpbnRlcmFjdGl2ZUVxdWFsc05vZGUueSA9IG1Ob2RlLnk7XHJcbiAgICAvLyBmcmFjdGlvbiBsaW5lXHJcbiAgICBpbnRlcmFjdGl2ZUZyYWN0aW9uTGluZU5vZGUubGVmdCA9IGludGVyYWN0aXZlRXF1YWxzTm9kZS5yaWdodCArIHRoaXMucmVsYXRpb25hbE9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICBpbnRlcmFjdGl2ZUZyYWN0aW9uTGluZU5vZGUuY2VudGVyWSA9IGludGVyYWN0aXZlRXF1YWxzTm9kZS5jZW50ZXJZICsgdGhpcy5mcmFjdGlvbkxpbmVZRnVkZ2VGYWN0b3I7XHJcbiAgICAvLyB5MiAtIHkxXHJcbiAgICB5Mk5vZGUubGVmdCA9IGludGVyYWN0aXZlRnJhY3Rpb25MaW5lTm9kZS5sZWZ0O1xyXG4gICAgeTJOb2RlLmJvdHRvbSA9IGludGVyYWN0aXZlRnJhY3Rpb25MaW5lTm9kZS50b3AgLSB0aGlzLnBpY2tlcnNZU3BhY2luZztcclxuICAgIG51bWVyYXRvck9wZXJhdG9yTm9kZS5sZWZ0ID0geTJOb2RlLnJpZ2h0ICsgdGhpcy5vcGVyYXRvclhTcGFjaW5nO1xyXG4gICAgbnVtZXJhdG9yT3BlcmF0b3JOb2RlLmNlbnRlclkgPSB5Mk5vZGUuY2VudGVyWTtcclxuICAgIHkxTm9kZS5sZWZ0ID0gbnVtZXJhdG9yT3BlcmF0b3JOb2RlLnJpZ2h0ICsgdGhpcy5vcGVyYXRvclhTcGFjaW5nO1xyXG4gICAgeTFOb2RlLnkgPSB5Mk5vZGUueTtcclxuICAgIC8vIGZpeCBmcmFjdGlvbiBsaW5lIGxlbmd0aFxyXG4gICAgY29uc3QgZnJhY3Rpb25MaW5lTGVuZ3RoID0geTFOb2RlLnJpZ2h0IC0geTJOb2RlLmxlZnQ7XHJcbiAgICBpbnRlcmFjdGl2ZUZyYWN0aW9uTGluZU5vZGUuc2V0TGluZSggMCwgMCwgZnJhY3Rpb25MaW5lTGVuZ3RoLCAwICk7XHJcbiAgICAvLyB4MiAtIHgxXHJcbiAgICB4Mk5vZGUubGVmdCA9IHkyTm9kZS5sZWZ0O1xyXG4gICAgeDJOb2RlLnRvcCA9IGludGVyYWN0aXZlRnJhY3Rpb25MaW5lTm9kZS5ib3R0b20gKyB0aGlzLnBpY2tlcnNZU3BhY2luZztcclxuICAgIGRlbm9taW5hdG9yT3BlcmF0b3JOb2RlLmxlZnQgPSB4Mk5vZGUucmlnaHQgKyB0aGlzLm9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICBkZW5vbWluYXRvck9wZXJhdG9yTm9kZS5jZW50ZXJZID0geDJOb2RlLmNlbnRlclk7XHJcbiAgICB4MU5vZGUubGVmdCA9IGRlbm9taW5hdG9yT3BlcmF0b3JOb2RlLnJpZ2h0ICsgdGhpcy5vcGVyYXRvclhTcGFjaW5nO1xyXG4gICAgeDFOb2RlLnkgPSB4Mk5vZGUueTtcclxuICAgIC8vID0gcmlzZS9ydW5cclxuICAgIHVuc2ltcGxpZmllZEVxdWFsc05vZGUubGVmdCA9IGludGVyYWN0aXZlRnJhY3Rpb25MaW5lTm9kZS5yaWdodCArIHRoaXMucmVsYXRpb25hbE9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICB1bnNpbXBsaWZpZWRFcXVhbHNOb2RlLnkgPSBpbnRlcmFjdGl2ZUVxdWFsc05vZGUueTtcclxuICAgIHVuc2ltcGxpZmllZEZyYWN0aW9uTGluZU5vZGUubGVmdCA9IHVuc2ltcGxpZmllZEVxdWFsc05vZGUucmlnaHQgKyB0aGlzLnJlbGF0aW9uYWxPcGVyYXRvclhTcGFjaW5nO1xyXG4gICAgdW5zaW1wbGlmaWVkRnJhY3Rpb25MaW5lTm9kZS55ID0gaW50ZXJhY3RpdmVGcmFjdGlvbkxpbmVOb2RlLnk7XHJcbiAgICAvLyBob3Jpem9udGFsbHkgY2VudGVyIHJpc2UgYW5kIHJ1biBhYm92ZSBmcmFjdGlvbiBsaW5lXHJcbiAgICB1bnNpbXBsaWZpZWRSaXNlTm9kZS5jZW50ZXJYID0gdW5zaW1wbGlmaWVkRnJhY3Rpb25MaW5lTm9kZS5jZW50ZXJYO1xyXG4gICAgdW5zaW1wbGlmaWVkUmlzZU5vZGUuYm90dG9tID0gdW5zaW1wbGlmaWVkRnJhY3Rpb25MaW5lTm9kZS50b3AgLSB0aGlzLnNsb3BlWVNwYWNpbmc7XHJcbiAgICB1bnNpbXBsaWZpZWRSdW5Ob2RlLmNlbnRlclggPSB1bnNpbXBsaWZpZWRGcmFjdGlvbkxpbmVOb2RlLmNlbnRlclg7XHJcbiAgICB1bnNpbXBsaWZpZWRSdW5Ob2RlLnRvcCA9IHVuc2ltcGxpZmllZEZyYWN0aW9uTGluZU5vZGUuYm90dG9tICsgdGhpcy5zbG9wZVlTcGFjaW5nO1xyXG5cclxuICAgIC8vIHNldCB1cCB1bmRlZmluZWQtc2xvcGUgaW5kaWNhdG9yIGxhc3RcclxuICAgIHVuZGVmaW5lZFNsb3BlSW5kaWNhdG9yLnNldFNpemUoIHBhcmVudE5vZGUuZ2V0V2lkdGgoKSwgcGFyZW50Tm9kZS5nZXRIZWlnaHQoKSApO1xyXG4gICAgdW5kZWZpbmVkU2xvcGVJbmRpY2F0b3IuY2VudGVyWCA9IHBhcmVudE5vZGUuY2VudGVyWDtcclxuICAgIHVuZGVmaW5lZFNsb3BlSW5kaWNhdG9yLmNlbnRlclkgPSBwYXJlbnROb2RlLmNlbnRlclkgKyB0aGlzLnVuZGVmaW5lZFNsb3BlWUZ1ZGdlRmFjdG9yO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlU2xvcGVFcXVhdGlvbk5vZGUgPSAoKSA9PiB7XHJcbiAgICAgIHgxTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIHgyTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIHkxTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIHkyTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIHVuc2ltcGxpZmllZFJpc2VOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgdW5zaW1wbGlmaWVkUnVuTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIGxpbmVQcm9wZXJ0eS51bmxpbmsoIGxpbmVPYnNlcnZlciApO1xyXG4gICAgICBNdWx0aWxpbmsudW5tdWx0aWxpbmsoIGNvbnRyb2xzTXVsdGlsaW5rICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VTbG9wZUVxdWF0aW9uTm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5vZGUgdGhhdCBkaXNwbGF5cyB0aGUgZ2VuZXJhbCBmb3JtIG9mIHRoZSBzbG9wZSBlcXVhdGlvbjogbSA9ICh5Mi15MSkvKHgyLXgxKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlR2VuZXJhbEZvcm1Ob2RlKCk6IE5vZGUge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgZm9udFNpemU6IDIwLFxyXG4gICAgICBmb250V2VpZ2h0OiBHTENvbnN0YW50cy5FUVVBVElPTl9GT05UX1dFSUdIVCxcclxuICAgICAgZmlsbDogJ2JsYWNrJyxcclxuICAgICAgbWF4V2lkdGg6IDMwMFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBmb250ID0gbmV3IFBoZXRGb250KCB7IHNpemU6IG9wdGlvbnMuZm9udFNpemUsIHdlaWdodDogb3B0aW9ucy5mb250V2VpZ2h0IH0gKTtcclxuXHJcbiAgICAvLyBTbG9wZSBtID1cclxuICAgIGNvbnN0IGxlZnRTaWRlVGV4dCA9IFN0cmluZ1V0aWxzLmZpbGxJbiggYHt7c2xvcGV9fSAgICB7e219fSAke01hdGhTeW1ib2xzLkVRVUFMX1RPfWAsIHtcclxuICAgICAgc2xvcGU6IEdyYXBoaW5nTGluZXNTdHJpbmdzLnNsb3BlLFxyXG4gICAgICBtOiBHTFN5bWJvbHMubVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgbGVmdFNpZGVOb2RlID0gbmV3IFJpY2hUZXh0KCBsZWZ0U2lkZVRleHQsIHtcclxuICAgICAgZm9udDogZm9udCxcclxuICAgICAgZmlsbDogb3B0aW9ucy5maWxsLFxyXG4gICAgICBtYXhXaWR0aDogMTI1IC8vIGkxOG4sIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBwYXR0ZXJuIGZvciBudW1lcmF0b3IgYW5kIGRlbm9taW5hdG9yXHJcbiAgICBjb25zdCBwYXR0ZXJuID0gYHt7c3ltYm9sfX08c3ViPjI8L3N1Yj4gJHtNYXRoU3ltYm9scy5NSU5VU30ge3tzeW1ib2x9fTxzdWI+MTwvc3ViPmA7XHJcblxyXG4gICAgLy8geTIgLSB5MVxyXG4gICAgY29uc3QgbnVtZXJhdG9yVGV4dCA9IFN0cmluZ1V0aWxzLmZpbGxJbiggcGF0dGVybiwgeyBzeW1ib2w6IEdMU3ltYm9scy55IH0gKTtcclxuICAgIGNvbnN0IG51bWVyYXRvck5vZGUgPSBuZXcgUmljaFRleHQoIG51bWVyYXRvclRleHQsIHtcclxuICAgICAgZm9udDogZm9udCxcclxuICAgICAgZmlsbDogb3B0aW9ucy5maWxsXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8geDIgLSB4MVxyXG4gICAgY29uc3QgZGVub21pbmF0b3JUZXh0ID0gU3RyaW5nVXRpbHMuZmlsbEluKCBwYXR0ZXJuLCB7IHN5bWJvbDogR0xTeW1ib2xzLnggfSApO1xyXG4gICAgY29uc3QgZGVub21pbmF0b3JOb2RlID0gbmV3IFJpY2hUZXh0KCBkZW5vbWluYXRvclRleHQsIHtcclxuICAgICAgZm9udDogZm9udCxcclxuICAgICAgZmlsbDogb3B0aW9ucy5maWxsXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gZnJhY3Rpb24gbGluZVxyXG4gICAgY29uc3QgbGVuZ3RoID0gTWF0aC5tYXgoIG51bWVyYXRvck5vZGUud2lkdGgsIGRlbm9taW5hdG9yTm9kZS53aWR0aCApO1xyXG4gICAgY29uc3QgZnJhY3Rpb25MaW5lTm9kZSA9IG5ldyBTY2VuZXJ5TGluZSggMCwgMCwgbGVuZ3RoLCAwLCB7XHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5maWxsLFxyXG4gICAgICBsaW5lV2lkdGg6IDAuMDYgKiBvcHRpb25zLmZvbnRTaXplXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcmVuZGVyaW5nIG9yZGVyXHJcbiAgICBjb25zdCBwYXJlbnQgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyBsZWZ0U2lkZU5vZGUsIGZyYWN0aW9uTGluZU5vZGUsIG51bWVyYXRvck5vZGUsIGRlbm9taW5hdG9yTm9kZSBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbGF5b3V0XHJcbiAgICBsZWZ0U2lkZU5vZGUueCA9IDA7XHJcbiAgICBsZWZ0U2lkZU5vZGUueSA9IDA7XHJcbiAgICBmcmFjdGlvbkxpbmVOb2RlLmxlZnQgPSBsZWZ0U2lkZU5vZGUucmlnaHQgKyA1O1xyXG4gICAgZnJhY3Rpb25MaW5lTm9kZS5jZW50ZXJZID0gbGVmdFNpZGVOb2RlLmNlbnRlclk7XHJcbiAgICBudW1lcmF0b3JOb2RlLmNlbnRlclggPSBmcmFjdGlvbkxpbmVOb2RlLmNlbnRlclg7XHJcbiAgICBudW1lcmF0b3JOb2RlLmJvdHRvbSA9IGZyYWN0aW9uTGluZU5vZGUudG9wIC0gNTtcclxuICAgIGRlbm9taW5hdG9yTm9kZS5jZW50ZXJYID0gZnJhY3Rpb25MaW5lTm9kZS5jZW50ZXJYO1xyXG4gICAgZGVub21pbmF0b3JOb2RlLnRvcCA9IGZyYWN0aW9uTGluZU5vZGUuYm90dG9tICsgMTtcclxuXHJcbiAgICByZXR1cm4gcGFyZW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5vbi1pbnRlcmFjdGl2ZSBlcXVhdGlvbiwgdXNlZCB0byBsYWJlbCBhIGR5bmFtaWMgbGluZS5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUR5bmFtaWNMYWJlbCggbGluZVByb3BlcnR5OiBQcm9wZXJ0eTxMaW5lPiwgcHJvdmlkZWRPcHRpb25zPzogQ3JlYXRlRHluYW1pY0xhYmVsT3B0aW9ucyApOiBOb2RlIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gY29tYmluZU9wdGlvbnM8Q3JlYXRlRHluYW1pY0xhYmVsT3B0aW9ucz4oIHtcclxuICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG4gICAgICBtYXhXaWR0aDogMjAwXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IER5bmFtaWNMYWJlbE5vZGUoIGxpbmVQcm9wZXJ0eSwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEEgbm9uLWludGVyYWN0aXZlIGVxdWF0aW9uLCB1c2VkIHRvIGxhYmVsIGEgZHluYW1pYyBsaW5lLlxyXG4gKiBUaGlzIHRha2VzIHRoZSBmb3JtICdTbG9wZSBpcyByaXNlL3J1bicsIHdoaWNoIGlzIGRpZmZlcmVudCB0aGFuIHRoZSBpbnRlcmFjdGl2ZSBlcXVhdGlvbiBmb3JtLlxyXG4gKiBOb3RlIHRoYXQgd2hpbGUgdGhpcyBpcyBhIHNlbnRlbmNlLCBpdCdzIG9yZGVyIGlzIG5vdCBsb2NhbGl6ZWQsIGR1ZSB0byB0aGUgZmFjdCB0aGF0IGl0IGlzXHJcbiAqIGNvbXBvc2VkIG9mIG11bHRpcGxlIHBoZXQuc2NlbmVyeS5UZXh0IG5vZGVzLlxyXG4gKi9cclxuY2xhc3MgRHluYW1pY0xhYmVsTm9kZSBleHRlbmRzIEVxdWF0aW9uTm9kZSB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUR5bmFtaWNMYWJlbE5vZGU6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGluZVByb3BlcnR5OiBQcm9wZXJ0eTxMaW5lPiwgcHJvdmlkZWRPcHRpb25zPzogQ3JlYXRlRHluYW1pY0xhYmVsT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gY29tYmluZU9wdGlvbnM8Q3JlYXRlRHluYW1pY0xhYmVsT3B0aW9ucz4oIHtcclxuICAgICAgZm9udFNpemU6IDE4XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHRleHRPcHRpb25zID0ge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogb3B0aW9ucy5mb250U2l6ZSwgd2VpZ2h0OiBHTENvbnN0YW50cy5FUVVBVElPTl9GT05UX1dFSUdIVCB9IClcclxuICAgIH07XHJcblxyXG4gICAgLy8gYWxsb2NhdGUgbm9kZXMgbmVlZGVkIHRvIHJlcHJlc2VudCBhbGwgc2ltcGxpZmllZCBmb3Jtc1xyXG4gICAgY29uc3Qgc2xvcGVJc05vZGUgPSBuZXcgVGV4dCggR3JhcGhpbmdMaW5lc1N0cmluZ3Muc2xvcGVJcywgdGV4dE9wdGlvbnMgKTtcclxuICAgIGNvbnN0IG1pbnVzU2lnbk5vZGUgPSBuZXcgTWludXNOb2RlKCB7IHNpemU6IHRoaXMuc2lnbkxpbmVTaXplIH0gKTtcclxuICAgIGNvbnN0IHJpc2VOb2RlID0gbmV3IFRleHQoICc/JywgdGV4dE9wdGlvbnMgKTtcclxuICAgIGNvbnN0IHJ1bk5vZGUgPSBuZXcgVGV4dCggJz8nLCB0ZXh0T3B0aW9ucyApO1xyXG4gICAgY29uc3QgZnJhY3Rpb25MaW5lTm9kZSA9IG5ldyBTY2VuZXJ5TGluZSggMCwgMCwgMSwgMCwgeyBsaW5lV2lkdGg6IHRoaXMuZnJhY3Rpb25MaW5lVGhpY2tuZXNzIH0gKTtcclxuXHJcbiAgICAvLyBhZGQgYWxsIG5vZGVzLCB3ZSdsbCBzZXQgd2hpY2ggb25lcyBhcmUgdmlzaWJsZSBiYXNlcyBvbiBkZXNpcmVkIHNpbXBsaWZpY2F0aW9uXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmdldENoaWxkcmVuQ291bnQoKSA9PT0gMCwgJ3N1cGVydHlwZSBoYXMgdW5leHBlY3RlZCBjaGlsZHJlbicgKTtcclxuICAgIHRoaXMuY2hpbGRyZW4gPSBbIHNsb3BlSXNOb2RlLCBtaW51c1NpZ25Ob2RlLCByaXNlTm9kZSwgcnVuTm9kZSwgZnJhY3Rpb25MaW5lTm9kZSBdO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB2aXNpYmlsaXR5LCBsYXlvdXQgYW5kIHByb3BlcnRpZXMgb2Ygbm9kZXMgdG8gbWF0Y2ggdGhlIGN1cnJlbnQgbGluZVxyXG4gICAgY29uc3QgdXBkYXRlID0gKCBsaW5lOiBMaW5lICkgPT4ge1xyXG5cclxuICAgICAgY29uc3QgbGluZUNvbG9yID0gbGluZS5jb2xvcjtcclxuXHJcbiAgICAgIC8vIHN0YXJ0IHdpdGggYWxsIGNoaWxkcmVuIGludmlzaWJsZVxyXG4gICAgICBjb25zdCBsZW4gPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlblsgaSBdLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gJ1Nsb3BlIGlzJ1xyXG4gICAgICBzbG9wZUlzTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgc2xvcGVJc05vZGUuZmlsbCA9IGxpbmVDb2xvcjtcclxuXHJcbiAgICAgIGlmICggbGluZS51bmRlZmluZWRTbG9wZSgpICkge1xyXG4gICAgICAgIC8vICd1bmRlZmluZWQnXHJcbiAgICAgICAgcmlzZU5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgcmlzZU5vZGUuc3RyaW5nID0gR3JhcGhpbmdMaW5lc1N0cmluZ3MudW5kZWZpbmVkO1xyXG4gICAgICAgIHJpc2VOb2RlLmZpbGwgPSBsaW5lQ29sb3I7XHJcbiAgICAgICAgcmlzZU5vZGUubGVmdCA9IHNsb3BlSXNOb2RlLnJpZ2h0ICsgdGhpcy5yZWxhdGlvbmFsT3BlcmF0b3JYU3BhY2luZztcclxuICAgICAgICByaXNlTm9kZS55ID0gc2xvcGVJc05vZGUueTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggbGluZS5nZXRTbG9wZSgpID09PSAwICkge1xyXG4gICAgICAgIC8vIDBcclxuICAgICAgICByaXNlTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICByaXNlTm9kZS5zdHJpbmcgPSAnMCc7XHJcbiAgICAgICAgcmlzZU5vZGUuZmlsbCA9IGxpbmVDb2xvcjtcclxuICAgICAgICByaXNlTm9kZS5sZWZ0ID0gc2xvcGVJc05vZGUucmlnaHQgKyB0aGlzLnJlbGF0aW9uYWxPcGVyYXRvclhTcGFjaW5nO1xyXG4gICAgICAgIHJpc2VOb2RlLnkgPSBzbG9wZUlzTm9kZS55O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGxldCBuZXh0WE9mZnNldDtcclxuICAgICAgICBpZiAoIGxpbmUuZ2V0U2xvcGUoKSA8IDAgKSB7XHJcbiAgICAgICAgICAvLyBtaW51cyBzaWduXHJcbiAgICAgICAgICBtaW51c1NpZ25Ob2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgbWludXNTaWduTm9kZS5maWxsID0gbGluZUNvbG9yO1xyXG4gICAgICAgICAgbWludXNTaWduTm9kZS5sZWZ0ID0gc2xvcGVJc05vZGUucmlnaHQgKyB0aGlzLnJlbGF0aW9uYWxPcGVyYXRvclhTcGFjaW5nO1xyXG4gICAgICAgICAgbWludXNTaWduTm9kZS5jZW50ZXJZID0gc2xvcGVJc05vZGUuY2VudGVyWSArIHRoaXMuc2xvcGVTaWduWUZ1ZGdlRmFjdG9yICsgdGhpcy5zbG9wZVNpZ25ZT2Zmc2V0O1xyXG4gICAgICAgICAgbmV4dFhPZmZzZXQgPSBtaW51c1NpZ25Ob2RlLnJpZ2h0ICsgdGhpcy5mcmFjdGlvbmFsU2xvcGVYU3BhY2luZztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyBubyBzaWduXHJcbiAgICAgICAgICBuZXh0WE9mZnNldCA9IHNsb3BlSXNOb2RlLnJpZ2h0ICsgdGhpcy5yZWxhdGlvbmFsT3BlcmF0b3JYU3BhY2luZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICggTnVtYmVyLmlzSW50ZWdlciggbGluZS5nZXRTbG9wZSgpICkgKSB7XHJcbiAgICAgICAgICAvLyBpbnRlZ2VyIHNsb3BlIChyaXNlLzEpXHJcbiAgICAgICAgICByaXNlTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHJpc2VOb2RlLnN0cmluZyA9IFV0aWxzLnRvRml4ZWQoIE1hdGguYWJzKCBsaW5lLmdldFNsb3BlKCkgKSwgMCApO1xyXG4gICAgICAgICAgcmlzZU5vZGUuZmlsbCA9IGxpbmVDb2xvcjtcclxuICAgICAgICAgIHJpc2VOb2RlLmxlZnQgPSBuZXh0WE9mZnNldDtcclxuICAgICAgICAgIHJpc2VOb2RlLnkgPSBzbG9wZUlzTm9kZS55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIGZyYWN0aW9uYWwgc2xvcGVcclxuICAgICAgICAgIHJpc2VOb2RlLnZpc2libGUgPSBydW5Ob2RlLnZpc2libGUgPSBmcmFjdGlvbkxpbmVOb2RlLnZpc2libGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgIHJpc2VOb2RlLnN0cmluZyA9IFV0aWxzLnRvRml4ZWQoIE1hdGguYWJzKCBsaW5lLmdldFNpbXBsaWZpZWRSaXNlKCkgKSwgMCApO1xyXG4gICAgICAgICAgcnVuTm9kZS5zdHJpbmcgPSBVdGlscy50b0ZpeGVkKCBNYXRoLmFicyggbGluZS5nZXRTaW1wbGlmaWVkUnVuKCkgKSwgMCApO1xyXG4gICAgICAgICAgZnJhY3Rpb25MaW5lTm9kZS5zZXRMaW5lKCAwLCAwLCBNYXRoLm1heCggcmlzZU5vZGUud2lkdGgsIHJ1bk5vZGUud2lkdGggKSwgMCApO1xyXG4gICAgICAgICAgcmlzZU5vZGUuZmlsbCA9IHJ1bk5vZGUuZmlsbCA9IGZyYWN0aW9uTGluZU5vZGUuc3Ryb2tlID0gbGluZUNvbG9yO1xyXG5cclxuICAgICAgICAgIC8vIGxheW91dCwgdmFsdWVzIGhvcml6b250YWxseSBjZW50ZXJlZFxyXG4gICAgICAgICAgZnJhY3Rpb25MaW5lTm9kZS5sZWZ0ID0gbmV4dFhPZmZzZXQ7XHJcbiAgICAgICAgICBmcmFjdGlvbkxpbmVOb2RlLmNlbnRlclkgPSBzbG9wZUlzTm9kZS5jZW50ZXJZICsgdGhpcy5mcmFjdGlvbkxpbmVZRnVkZ2VGYWN0b3I7XHJcbiAgICAgICAgICByaXNlTm9kZS5jZW50ZXJYID0gZnJhY3Rpb25MaW5lTm9kZS5jZW50ZXJYO1xyXG4gICAgICAgICAgcmlzZU5vZGUuYm90dG9tID0gZnJhY3Rpb25MaW5lTm9kZS50b3AgLSB0aGlzLnlTcGFjaW5nO1xyXG4gICAgICAgICAgcnVuTm9kZS5jZW50ZXJYID0gZnJhY3Rpb25MaW5lTm9kZS5jZW50ZXJYO1xyXG4gICAgICAgICAgcnVuTm9kZS50b3AgPSBmcmFjdGlvbkxpbmVOb2RlLmJvdHRvbSArIHRoaXMueVNwYWNpbmc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGxpbmVPYnNlcnZlciA9ICggbGluZTogTGluZSApID0+IHVwZGF0ZSggbGluZSApO1xyXG4gICAgbGluZVByb3BlcnR5LmxpbmsoIGxpbmVPYnNlcnZlciApOyAvLyB1bmxpbmsgaW4gZGlzcG9zZVxyXG5cclxuICAgIHRoaXMuZGlzcG9zZUR5bmFtaWNMYWJlbE5vZGUgPSAoKSA9PiB7XHJcbiAgICAgIGxpbmVQcm9wZXJ0eS51bmxpbmsoIGxpbmVPYnNlcnZlciApO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VEeW5hbWljTGFiZWxOb2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmFwaGluZ0xpbmVzLnJlZ2lzdGVyKCAnU2xvcGVFcXVhdGlvbk5vZGUnLCBTbG9wZUVxdWF0aW9uTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLGNBQWMsTUFBaUMsdUNBQXVDO0FBQzdGLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFFdEQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxTQUFTLElBQUlDLGNBQWMsUUFBUSx1Q0FBdUM7QUFDakYsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxXQUFXLE1BQU0sNENBQTRDO0FBQ3BFLE9BQU9DLFNBQVMsTUFBNEIsMENBQTBDO0FBQ3RGLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxJQUFJQyxXQUFXLEVBQUVDLElBQUksRUFBRUMsUUFBUSxFQUFVQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3JHLE9BQU9DLFFBQVEsTUFBTSwwQkFBMEI7QUFDL0MsT0FBT0MsV0FBVyxNQUFNLDZCQUE2QjtBQUNyRCxPQUFPQyxTQUFTLE1B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