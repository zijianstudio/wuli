// Copyright 2013-2023, University of Colorado Boulder

/**
 * Renderer for point-slope equations, with optional interactivity of point and slope.
 * General point-slope form is: (y - y1) = m(x - x1)
 *
 * Point and/or slope may be interactive.
 * Pickers are used to increment/decrement parts of the equation that are specified as being interactive.
 * Non-interactive parts of the equation are expressed in a form that is typical of how the equation
 * would normally be written. For example, if the slope is -1, then only the sign is written, not '-1'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import MinusNode from '../../../../scenery-phet/js/MinusNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PlusNode from '../../../../scenery-phet/js/PlusNode.js';
import { Line as SceneryLine, RichText, Text } from '../../../../scenery/js/imports.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import GLColors from '../../common/GLColors.js';
import GLConstants from '../../common/GLConstants.js';
import GLSymbols from '../../common/GLSymbols.js';
import Line from '../../common/model/Line.js';
import DynamicValueNode from '../../common/view/DynamicValueNode.js';
import EquationNode from '../../common/view/EquationNode.js';
import SlopePicker from '../../common/view/picker/SlopePicker.js';
import UndefinedSlopeIndicator from '../../common/view/UndefinedSlopeIndicator.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
export default class PointSlopeEquationNode extends EquationNode {
  constructor(lineProperty, providedOptions) {
    const options = optionize()({
      // Whether to show 'slope undefined' after non-interactive equations with undefined slope, for example
      // 'x = 3' versus 'x = 3 (slope undefined)'.
      // See https://github.com/phetsims/graphing-slope-intercept/issues/7
      slopeUndefinedVisible: true,
      // components that can be interactive
      interactivePoint: true,
      interactiveSlope: true,
      // dynamic range of components
      x1RangeProperty: new Property(GLConstants.X_AXIS_RANGE),
      y1RangeProperty: new Property(GLConstants.Y_AXIS_RANGE),
      riseRangeProperty: new Property(GLConstants.Y_AXIS_RANGE),
      runRangeProperty: new Property(GLConstants.X_AXIS_RANGE),
      // style
      fontSize: GLConstants.INTERACTIVE_EQUATION_FONT_SIZE,
      staticColor: 'black'
    }, providedOptions);
    super(options); // call first, because super computes various layout metrics

    const fullyInteractive = options.interactivePoint && options.interactiveSlope;
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

    // internal properties that are connected to pickers
    const x1Property = new NumberProperty(lineProperty.value.x1, numberPropertyOptions);
    const y1Property = new NumberProperty(lineProperty.value.y1, numberPropertyOptions);
    const riseProperty = new NumberProperty(lineProperty.value.rise, numberPropertyOptions);
    const runProperty = new NumberProperty(lineProperty.value.run, numberPropertyOptions);

    /*
     * Flag that allows us to update all controls atomically when the model changes.
     * When a picker's value changes, it results in the creation of a new Line.
     * So if you don't change the pickers atomically to match a new Line instance,
     * the new Line will be inadvertently replaced with an incorrect line.
     */
    let updatingControls = false;

    // Determine the max width of the rise and run pickers.
    const maxSlopePickerWidth = EquationNode.computeMaxSlopePickerWidth(options.riseRangeProperty, options.runRangeProperty, interactiveFont, this.decimalPlaces);

    // Nodes that appear in all possible forms of the equation: (y-y1) = rise/run (x-x1)
    const yLeftParenNode = new Text('(', staticOptions);
    const yNode = new RichText(GLSymbols.y, staticOptions);
    const yPlusNode = new PlusNode(combineOptions({
      size: this.operatorLineSize
    }, staticOptions));
    const yMinusNode = new MinusNode(combineOptions({
      size: this.operatorLineSize
    }, staticOptions));
    let y1Node;
    if (options.interactivePoint) {
      y1Node = new NumberPicker(y1Property, options.y1RangeProperty, combineOptions({}, GLConstants.NUMBER_PICKER_OPTIONS, {
        color: GLColors.POINT_X1_Y1,
        font: interactiveFont
      }));
    } else {
      y1Node = new DynamicValueNode(y1Property, combineOptions({
        absoluteValue: true
      }, staticOptions));
    }
    const yRightParenNode = new Text(')', staticOptions);
    const y1MinusSignNode = new MinusNode(combineOptions({
      size: this.signLineSize
    }, staticOptions)); // for y=-y1 case
    const equalsNode = new Text('=', staticOptions);
    const slopeMinusSignNode = new MinusNode(combineOptions({
      size: this.signLineSize
    }, staticOptions));
    let riseNode;
    let runNode;
    if (options.interactiveSlope) {
      riseNode = new SlopePicker(riseProperty, runProperty, options.riseRangeProperty, {
        font: interactiveFont
      });
      runNode = new SlopePicker(runProperty, riseProperty, options.runRangeProperty, {
        font: interactiveFont
      });
    } else {
      riseNode = new DynamicValueNode(riseProperty, combineOptions({
        absoluteValue: true
      }, staticOptions));
      runNode = new DynamicValueNode(runProperty, combineOptions({
        absoluteValue: true
      }, staticOptions));
    }
    const fractionLineNode = new SceneryLine(0, 0, maxSlopePickerWidth, 0, fractionLineOptions);
    const xLeftParenNode = new Text('(', staticOptions);
    const xNode = new RichText(GLSymbols.x, staticOptions);
    const xPlusNode = new PlusNode(combineOptions({
      size: this.operatorLineSize
    }, staticOptions));
    const xMinusNode = new MinusNode(combineOptions({
      size: this.operatorLineSize
    }, staticOptions));
    let x1Node;
    if (options.interactivePoint) {
      x1Node = new NumberPicker(x1Property, options.x1RangeProperty, combineOptions({}, GLConstants.NUMBER_PICKER_OPTIONS, {
        color: GLColors.POINT_X1_Y1,
        font: interactiveFont
      }));
    } else {
      x1Node = new DynamicValueNode(x1Property, combineOptions({
        absoluteValue: true
      }, staticOptions));
    }
    const xRightParenNode = new Text(')', staticOptions);
    const slopeUndefinedNode = new RichText('?', staticOptions);

    // add all nodes, we'll set which ones are visible bases on desired simplification
    this.children = [yLeftParenNode, yNode, yPlusNode, yMinusNode, y1Node, yRightParenNode, y1MinusSignNode, equalsNode, slopeMinusSignNode, riseNode, runNode, fractionLineNode, xLeftParenNode, xNode, xPlusNode, xMinusNode, x1Node, xRightParenNode, slopeUndefinedNode];

    /*
     * Updates the layout to match the desired form of the equation.
     * This is based on which parts of the equation are interactive, and what the
     * non-interactive parts of the equation should look like when written in simplified form.
     */
    const updateLayout = line => {
      const interactive = options.interactivePoint || options.interactiveSlope;
      const lineColor = line.color;

      // Start with all children invisible and at x=0.
      // See https://github.com/phetsims/graphing-lines/issues/120
      const len = this.children.length;
      for (let i = 0; i < len; i++) {
        this.children[i].visible = false;
        this.children[i].x = 0;
      }
      slopeUndefinedNode.string = ''; // workaround for #114 and #117

      if (line.undefinedSlope() && !interactive) {
        // slope is undefined and nothing is interactive
        slopeUndefinedNode.visible = true;
        slopeUndefinedNode.fill = lineColor;
        slopeUndefinedNode.string = options.slopeUndefinedVisible ? StringUtils.format(GraphingLinesStrings.slopeUndefined, GLSymbols.x, line.x1) : StringUtils.fillIn(`{{x}} ${MathSymbols.EQUAL_TO} {{value}}`, {
          x: GLSymbols.x,
          value: line.x1
        });
        return;
      } else if (!interactive && line.same(Line.Y_EQUALS_X_LINE)) {
        // use slope-intercept form for y=x
        yNode.visible = equalsNode.visible = xNode.visible = true;
        yNode.fill = equalsNode.fill = xNode.fill = lineColor;
        equalsNode.left = yNode.right + this.relationalOperatorXSpacing;
        xNode.left = equalsNode.right + this.relationalOperatorXSpacing;
        return;
      } else if (!interactive && line.same(Line.Y_EQUALS_NEGATIVE_X_LINE)) {
        // use slope-intercept form for y=-x
        yNode.visible = equalsNode.visible = slopeMinusSignNode.visible = xNode.visible = true;
        yNode.fill = equalsNode.fill = slopeMinusSignNode.fill = xNode.fill = lineColor;
        equalsNode.left = yNode.right + this.relationalOperatorXSpacing;
        slopeMinusSignNode.left = equalsNode.right + this.relationalOperatorXSpacing;
        slopeMinusSignNode.centerY = equalsNode.centerY + this.operatorYFudgeFactor;
        xNode.left = slopeMinusSignNode.right + this.integerSignXSpacing;
        return;
      }

      // Select the operators based on the signs of x1 and y1.
      const xOperatorNode = options.interactivePoint || line.x1 >= 0 ? xMinusNode : xPlusNode;
      const yOperatorNode = options.interactivePoint || line.y1 >= 0 ? yMinusNode : yPlusNode;
      if (line.rise === 0 && !options.interactiveSlope && !options.interactivePoint) {
        // y1 is on the right side of the equation
        yNode.visible = equalsNode.visible = y1Node.visible = true;
        yNode.fill = equalsNode.fill = lineColor;
        if (y1Node instanceof DynamicValueNode) {
          y1Node.fill = lineColor;
        }
        equalsNode.left = yNode.right + this.relationalOperatorXSpacing;
        if (options.interactivePoint || line.y1 >= 0) {
          // y = y1
          y1Node.left = equalsNode.right + this.relationalOperatorXSpacing;
          y1Node.y = yNode.y;
        } else {
          // y = -y1
          y1MinusSignNode.visible = true;
          y1MinusSignNode.fill = lineColor;
          y1MinusSignNode.left = equalsNode.right + this.relationalOperatorXSpacing;
          y1MinusSignNode.centerY = equalsNode.centerY + this.operatorYFudgeFactor;
          y1Node.left = y1MinusSignNode.right + this.integerSignXSpacing;
          y1Node.y = yNode.y;
        }
      } else {
        // y1 is on the left side of the equation

        let previousNode;
        if (!options.interactivePoint && line.y1 === 0) {
          // y
          yNode.x = 0;
          yNode.y = 0;
          yNode.fill = lineColor;
          yNode.visible = true;
          previousNode = yNode;
        } else if (!interactive) {
          // y - y1
          yNode.visible = yOperatorNode.visible = y1Node.visible = true;
          yNode.fill = yOperatorNode.fill = lineColor;
          if (y1Node instanceof DynamicValueNode) {
            y1Node.fill = lineColor;
          }
          yNode.x = 0;
          yNode.y = 0;
          yOperatorNode.left = yNode.right + this.operatorXSpacing;
          yOperatorNode.centerY = yNode.centerY + this.operatorYFudgeFactor;
          y1Node.left = yOperatorNode.right + this.operatorXSpacing;
          y1Node.centerY = yNode.centerY;
          previousNode = y1Node;
        } else {
          // (y - y1)
          yLeftParenNode.visible = yNode.visible = yOperatorNode.visible = y1Node.visible = yRightParenNode.visible = true;
          yLeftParenNode.fill = yNode.fill = yOperatorNode.fill = yRightParenNode.fill = lineColor;
          if (y1Node instanceof DynamicValueNode) {
            y1Node.fill = lineColor;
          }
          yLeftParenNode.x = 0;
          yLeftParenNode.y = 0;
          yNode.left = yLeftParenNode.right + this.parenXSpacing;
          yNode.y = yLeftParenNode.y;
          yOperatorNode.left = yNode.right + this.operatorXSpacing;
          yOperatorNode.centerY = yNode.centerY + this.operatorYFudgeFactor;
          y1Node.left = yOperatorNode.right + this.operatorXSpacing;
          y1Node.centerY = yNode.centerY;
          yRightParenNode.left = y1Node.right + this.parenXSpacing;
          yRightParenNode.y = yNode.y;
          previousNode = yRightParenNode;
        }

        // =
        equalsNode.visible = true;
        equalsNode.fill = lineColor;
        equalsNode.left = previousNode.right + this.relationalOperatorXSpacing;
        equalsNode.y = yNode.y + this.equalsSignFudgeFactor;

        // slope
        let previousXOffset;
        if (options.interactiveSlope) {
          // (rise/run), where rise and run are pickers, and the sign is integrated into the pickers
          riseNode.visible = runNode.visible = fractionLineNode.visible = true;
          if (riseNode instanceof DynamicValueNode) {
            riseNode.fill = lineColor;
          }
          if (runNode instanceof DynamicValueNode) {
            runNode.fill = lineColor;
          }
          fractionLineNode.fill = lineColor;
          fractionLineNode.left = equalsNode.right + this.relationalOperatorXSpacing;
          fractionLineNode.centerY = equalsNode.centerY;
          riseNode.centerX = fractionLineNode.centerX;
          riseNode.bottom = fractionLineNode.top - this.pickersYSpacing;
          runNode.centerX = fractionLineNode.centerX;
          runNode.top = fractionLineNode.bottom + this.pickersYSpacing;
          previousNode = fractionLineNode;
          previousXOffset = this.fractionalSlopeXSpacing;
        } else {
          // slope is not interactive, so here we put it in the desired form

          // slope properties, used to determine correct form
          const slope = line.getSlope();
          const zeroSlope = slope === 0;
          const unitySlope = Math.abs(slope) === 1;
          const integerSlope = Number.isInteger(slope);
          const positiveSlope = slope > 0;
          const fractionalSlope = !zeroSlope && !unitySlope && !integerSlope;

          // adjust fraction line width, use max width of rise or run
          const lineWidth = Math.max(riseNode.width, runNode.width);
          fractionLineNode.setLine(0, 0, lineWidth, 0);

          // decide whether to include the slope minus sign
          if (positiveSlope || zeroSlope) {
            // no sign
            previousNode = equalsNode;
            previousXOffset = this.relationalOperatorXSpacing;
          } else {
            // -
            slopeMinusSignNode.visible = true;
            slopeMinusSignNode.fill = lineColor;
            slopeMinusSignNode.left = equalsNode.right + this.relationalOperatorXSpacing;
            slopeMinusSignNode.centerY = equalsNode.centerY + this.slopeSignYFudgeFactor + this.slopeSignYOffset;
            previousNode = slopeMinusSignNode;
            previousXOffset = fractionalSlope ? this.fractionSignXSpacing : this.integerSignXSpacing;
          }
          if (line.undefinedSlope() || fractionalSlope) {
            // rise/run
            riseNode.visible = runNode.visible = fractionLineNode.visible = true;
            if (riseNode instanceof DynamicValueNode) {
              riseNode.fill = lineColor;
            }
            if (runNode instanceof DynamicValueNode) {
              runNode.fill = lineColor;
            }
            fractionLineNode.stroke = lineColor;
            fractionLineNode.left = previousNode.right + previousXOffset;
            fractionLineNode.centerY = equalsNode.centerY;
            riseNode.centerX = fractionLineNode.centerX;
            riseNode.bottom = fractionLineNode.top - this.ySpacing;
            runNode.centerX = fractionLineNode.centerX;
            runNode.top = fractionLineNode.bottom + this.ySpacing;
            previousNode = fractionLineNode;
            previousXOffset = this.fractionalSlopeXSpacing;
          } else if (zeroSlope) {
            // 0
            riseNode.visible = true;
            if (riseNode instanceof DynamicValueNode) {
              riseNode.fill = lineColor;
            }
            riseNode.left = equalsNode.right + this.relationalOperatorXSpacing;
            riseNode.y = yNode.y;
            previousNode = riseNode;
            previousXOffset = this.integerSlopeXSpacing;
          } else if (unitySlope) {
            // no slope term
            previousXOffset = this.relationalOperatorXSpacing;
          } else if (integerSlope) {
            // N
            riseNode.visible = true;
            if (riseNode instanceof DynamicValueNode) {
              riseNode.fill = lineColor;
            }
            riseNode.left = previousNode.right + previousXOffset;
            riseNode.y = yNode.y;
            previousNode = riseNode;
            previousXOffset = this.integerSlopeXSpacing;
          } else {
            throw new Error('programming error, forgot to handle some slope case');
          }
        }

        // x term
        if (interactive || line.x1 !== 0 && line.getSlope() !== 0 && line.getSlope() !== 1) {
          // (x - x1)
          xLeftParenNode.visible = xNode.visible = xOperatorNode.visible = x1Node.visible = xRightParenNode.visible = true;
          xLeftParenNode.fill = xNode.fill = xOperatorNode.fill = xRightParenNode.fill = lineColor;
          if (x1Node instanceof DynamicValueNode) {
            x1Node.fill = lineColor;
          }
          xLeftParenNode.left = previousNode.right + previousXOffset;
          xLeftParenNode.y = yNode.y;
          xNode.left = xLeftParenNode.right + this.parenXSpacing;
          xNode.y = yNode.y;
          xOperatorNode.left = xNode.right + this.operatorXSpacing;
          xOperatorNode.centerY = xNode.centerY + this.operatorYFudgeFactor;
          x1Node.left = xOperatorNode.right + this.operatorXSpacing;
          x1Node.centerY = yNode.centerY;
          xRightParenNode.left = x1Node.right + this.parenXSpacing;
          xRightParenNode.y = yNode.y;
        } else if (line.getSlope() === 1 && line.x1 !== 0) {
          // x - x1
          xNode.visible = xOperatorNode.visible = x1Node.visible = true;
          xNode.fill = xOperatorNode.fill = lineColor;
          if (x1Node instanceof DynamicValueNode) {
            x1Node.fill = lineColor;
          }
          xNode.left = previousNode.right + previousXOffset;
          xNode.y = yNode.y;
          xOperatorNode.left = xNode.right + this.operatorXSpacing;
          xOperatorNode.centerY = xNode.centerY + this.operatorYFudgeFactor;
          x1Node.left = xOperatorNode.right + this.operatorXSpacing;
          x1Node.centerY = yNode.centerY;
        } else if (line.x1 === 0) {
          // x
          xNode.visible = true;
          xNode.fill = lineColor;
          xNode.left = previousNode.right + previousXOffset;
          xNode.centerY = yNode.centerY;
        } else {
          throw new Error('programming error, forgot to handle some x-term case');
        }
      }
    };

    // sync the model with the controls, unmultilink in dispose
    const controlsMultilink = Multilink.lazyMultilink([x1Property, y1Property, riseProperty, runProperty], () => {
      if (!updatingControls) {
        lineProperty.value = Line.createPointSlope(x1Property.value, y1Property.value, riseProperty.value, runProperty.value, lineProperty.value.color);
      }
    });

    // sync the controls and layout with the model
    const lineObserver = line => {
      // Synchronize the controls atomically.
      updatingControls = true;
      {
        x1Property.value = line.x1;
        y1Property.value = line.y1;
        riseProperty.value = options.interactiveSlope ? line.rise : line.getSimplifiedRise();
        runProperty.value = options.interactiveSlope ? line.run : line.getSimplifiedRun();
      }
      updatingControls = false;

      // Fully-interactive equations have a constant form, no need to update layout when line changes.
      if (!fullyInteractive) {
        updateLayout(line);
      }
    };
    lineProperty.link(lineObserver); // unlink in dispose

    // For fully-interactive equations ...
    let undefinedSlopeUpdater;
    if (fullyInteractive) {
      // update layout once
      updateLayout(lineProperty.value);

      // add undefinedSlopeIndicator
      const undefinedSlopeIndicator = new UndefinedSlopeIndicator(this.width, this.height);
      this.addChild(undefinedSlopeIndicator);
      undefinedSlopeIndicator.centerX = this.centerX;
      undefinedSlopeIndicator.centerY = fractionLineNode.centerY - this.undefinedSlopeYFudgeFactor;
      undefinedSlopeUpdater = line => {
        undefinedSlopeIndicator.visible = line.undefinedSlope();
      };
      lineProperty.link(undefinedSlopeUpdater); // unlink in dispose
    }

    this.mutate(options);
    this.disposePointSlopeEquationNode = () => {
      x1Node.dispose();
      y1Node.dispose();
      riseNode.dispose();
      runNode.dispose();
      Multilink.unmultilink(controlsMultilink);
      lineProperty.unlink(lineObserver);
      undefinedSlopeUpdater && lineProperty.unlink(undefinedSlopeUpdater);
    };
  }
  dispose() {
    this.disposePointSlopeEquationNode();
    super.dispose();
  }

  /**
   * Creates a node that displays the general form of this equation: (y - y1) = m(x - x1)
   */
  static createGeneralFormNode() {
    // (y - y1) = m(x - x1)
    const string = StringUtils.fillIn(`({{y}} ${MathSymbols.MINUS} {{y}}<sub>1</sub>) ${MathSymbols.EQUAL_TO} {{m}}({{x}} ${MathSymbols.MINUS} {{x}}<sub>1</sub>)`, {
      y: GLSymbols.y,
      m: GLSymbols.m,
      x: GLSymbols.x
    });
    return new RichText(string, {
      pickable: false,
      font: new PhetFont({
        size: 20,
        weight: GLConstants.EQUATION_FONT_WEIGHT
      }),
      maxWidth: 300
    });
  }

  /**
   * Creates a non-interactive equation, used to label a dynamic line.
   */
  static createDynamicLabel(lineProperty, providedOptions) {
    const options = combineOptions({
      pickable: false,
      interactivePoint: false,
      interactiveSlope: false,
      fontSize: 18,
      maxWidth: 200
    }, providedOptions);
    return new PointSlopeEquationNode(lineProperty, options);
  }
}
graphingLines.register('PointSlopeEquationNode', PointSlopeEquationNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5Iiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJTdHJpbmdVdGlscyIsIk1hdGhTeW1ib2xzIiwiTWludXNOb2RlIiwiUGhldEZvbnQiLCJQbHVzTm9kZSIsIkxpbmUiLCJTY2VuZXJ5TGluZSIsIlJpY2hUZXh0IiwiVGV4dCIsIk51bWJlclBpY2tlciIsIkdMQ29sb3JzIiwiR0xDb25zdGFudHMiLCJHTFN5bWJvbHMiLCJEeW5hbWljVmFsdWVOb2RlIiwiRXF1YXRpb25Ob2RlIiwiU2xvcGVQaWNrZXIiLCJVbmRlZmluZWRTbG9wZUluZGljYXRvciIsImdyYXBoaW5nTGluZXMiLCJHcmFwaGluZ0xpbmVzU3RyaW5ncyIsIlBvaW50U2xvcGVFcXVhdGlvbk5vZGUiLCJjb25zdHJ1Y3RvciIsImxpbmVQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJzbG9wZVVuZGVmaW5lZFZpc2libGUiLCJpbnRlcmFjdGl2ZVBvaW50IiwiaW50ZXJhY3RpdmVTbG9wZSIsIngxUmFuZ2VQcm9wZXJ0eSIsIlhfQVhJU19SQU5HRSIsInkxUmFuZ2VQcm9wZXJ0eSIsIllfQVhJU19SQU5HRSIsInJpc2VSYW5nZVByb3BlcnR5IiwicnVuUmFuZ2VQcm9wZXJ0eSIsImZvbnRTaXplIiwiSU5URVJBQ1RJVkVfRVFVQVRJT05fRk9OVF9TSVpFIiwic3RhdGljQ29sb3IiLCJmdWxseUludGVyYWN0aXZlIiwiaW50ZXJhY3RpdmVGb250Iiwic2l6ZSIsIndlaWdodCIsIkVRVUFUSU9OX0ZPTlRfV0VJR0hUIiwic3RhdGljRm9udCIsInN0YXRpY09wdGlvbnMiLCJmb250IiwiZmlsbCIsImZyYWN0aW9uTGluZU9wdGlvbnMiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJmcmFjdGlvbkxpbmVUaGlja25lc3MiLCJudW1iZXJQcm9wZXJ0eU9wdGlvbnMiLCJudW1iZXJUeXBlIiwieDFQcm9wZXJ0eSIsInZhbHVlIiwieDEiLCJ5MVByb3BlcnR5IiwieTEiLCJyaXNlUHJvcGVydHkiLCJyaXNlIiwicnVuUHJvcGVydHkiLCJydW4iLCJ1cGRhdGluZ0NvbnRyb2xzIiwibWF4U2xvcGVQaWNrZXJXaWR0aCIsImNvbXB1dGVNYXhTbG9wZVBpY2tlcldpZHRoIiwiZGVjaW1hbFBsYWNlcyIsInlMZWZ0UGFyZW5Ob2RlIiwieU5vZGUiLCJ5IiwieVBsdXNOb2RlIiwib3BlcmF0b3JMaW5lU2l6ZSIsInlNaW51c05vZGUiLCJ5MU5vZGUiLCJOVU1CRVJfUElDS0VSX09QVElPTlMiLCJjb2xvciIsIlBPSU5UX1gxX1kxIiwiYWJzb2x1dGVWYWx1ZSIsInlSaWdodFBhcmVuTm9kZSIsInkxTWludXNTaWduTm9kZSIsInNpZ25MaW5lU2l6ZSIsImVxdWFsc05vZGUiLCJzbG9wZU1pbnVzU2lnbk5vZGUiLCJyaXNlTm9kZSIsInJ1bk5vZGUiLCJmcmFjdGlvbkxpbmVOb2RlIiwieExlZnRQYXJlbk5vZGUiLCJ4Tm9kZSIsIngiLCJ4UGx1c05vZGUiLCJ4TWludXNOb2RlIiwieDFOb2RlIiwieFJpZ2h0UGFyZW5Ob2RlIiwic2xvcGVVbmRlZmluZWROb2RlIiwiY2hpbGRyZW4iLCJ1cGRhdGVMYXlvdXQiLCJsaW5lIiwiaW50ZXJhY3RpdmUiLCJsaW5lQ29sb3IiLCJsZW4iLCJsZW5ndGgiLCJpIiwidmlzaWJsZSIsInN0cmluZyIsInVuZGVmaW5lZFNsb3BlIiwiZm9ybWF0Iiwic2xvcGVVbmRlZmluZWQiLCJmaWxsSW4iLCJFUVVBTF9UTyIsInNhbWUiLCJZX0VRVUFMU19YX0xJTkUiLCJsZWZ0IiwicmlnaHQiLCJyZWxhdGlvbmFsT3BlcmF0b3JYU3BhY2luZyIsIllfRVFVQUxTX05FR0FUSVZFX1hfTElORSIsImNlbnRlclkiLCJvcGVyYXRvcllGdWRnZUZhY3RvciIsImludGVnZXJTaWduWFNwYWNpbmciLCJ4T3BlcmF0b3JOb2RlIiwieU9wZXJhdG9yTm9kZSIsInByZXZpb3VzTm9kZSIsIm9wZXJhdG9yWFNwYWNpbmciLCJwYXJlblhTcGFjaW5nIiwiZXF1YWxzU2lnbkZ1ZGdlRmFjdG9yIiwicHJldmlvdXNYT2Zmc2V0IiwiY2VudGVyWCIsImJvdHRvbSIsInRvcCIsInBpY2tlcnNZU3BhY2luZyIsImZyYWN0aW9uYWxTbG9wZVhTcGFjaW5nIiwic2xvcGUiLCJnZXRTbG9wZSIsInplcm9TbG9wZSIsInVuaXR5U2xvcGUiLCJNYXRoIiwiYWJzIiwiaW50ZWdlclNsb3BlIiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwicG9zaXRpdmVTbG9wZSIsImZyYWN0aW9uYWxTbG9wZSIsIm1heCIsIndpZHRoIiwic2V0TGluZSIsInNsb3BlU2lnbllGdWRnZUZhY3RvciIsInNsb3BlU2lnbllPZmZzZXQiLCJmcmFjdGlvblNpZ25YU3BhY2luZyIsInlTcGFjaW5nIiwiaW50ZWdlclNsb3BlWFNwYWNpbmciLCJFcnJvciIsImNvbnRyb2xzTXVsdGlsaW5rIiwibGF6eU11bHRpbGluayIsImNyZWF0ZVBvaW50U2xvcGUiLCJsaW5lT2JzZXJ2ZXIiLCJnZXRTaW1wbGlmaWVkUmlzZSIsImdldFNpbXBsaWZpZWRSdW4iLCJsaW5rIiwidW5kZWZpbmVkU2xvcGVVcGRhdGVyIiwidW5kZWZpbmVkU2xvcGVJbmRpY2F0b3IiLCJoZWlnaHQiLCJhZGRDaGlsZCIsInVuZGVmaW5lZFNsb3BlWUZ1ZGdlRmFjdG9yIiwibXV0YXRlIiwiZGlzcG9zZVBvaW50U2xvcGVFcXVhdGlvbk5vZGUiLCJkaXNwb3NlIiwidW5tdWx0aWxpbmsiLCJ1bmxpbmsiLCJjcmVhdGVHZW5lcmFsRm9ybU5vZGUiLCJNSU5VUyIsIm0iLCJwaWNrYWJsZSIsIm1heFdpZHRoIiwiY3JlYXRlRHluYW1pY0xhYmVsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQb2ludFNsb3BlRXF1YXRpb25Ob2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlbmRlcmVyIGZvciBwb2ludC1zbG9wZSBlcXVhdGlvbnMsIHdpdGggb3B0aW9uYWwgaW50ZXJhY3Rpdml0eSBvZiBwb2ludCBhbmQgc2xvcGUuXHJcbiAqIEdlbmVyYWwgcG9pbnQtc2xvcGUgZm9ybSBpczogKHkgLSB5MSkgPSBtKHggLSB4MSlcclxuICpcclxuICogUG9pbnQgYW5kL29yIHNsb3BlIG1heSBiZSBpbnRlcmFjdGl2ZS5cclxuICogUGlja2VycyBhcmUgdXNlZCB0byBpbmNyZW1lbnQvZGVjcmVtZW50IHBhcnRzIG9mIHRoZSBlcXVhdGlvbiB0aGF0IGFyZSBzcGVjaWZpZWQgYXMgYmVpbmcgaW50ZXJhY3RpdmUuXHJcbiAqIE5vbi1pbnRlcmFjdGl2ZSBwYXJ0cyBvZiB0aGUgZXF1YXRpb24gYXJlIGV4cHJlc3NlZCBpbiBhIGZvcm0gdGhhdCBpcyB0eXBpY2FsIG9mIGhvdyB0aGUgZXF1YXRpb25cclxuICogd291bGQgbm9ybWFsbHkgYmUgd3JpdHRlbi4gRm9yIGV4YW1wbGUsIGlmIHRoZSBzbG9wZSBpcyAtMSwgdGhlbiBvbmx5IHRoZSBzaWduIGlzIHdyaXR0ZW4sIG5vdCAnLTEnLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHksIHsgTnVtYmVyUHJvcGVydHlPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbHMuanMnO1xyXG5pbXBvcnQgTWludXNOb2RlLCB7IE1pbnVzTm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWludXNOb2RlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBQbHVzTm9kZSwgeyBQbHVzTm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGx1c05vZGUuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgTGluZSBhcyBTY2VuZXJ5TGluZSwgTm9kZSwgUmljaFRleHQsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTnVtYmVyUGlja2VyLCB7IE51bWJlclBpY2tlck9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvTnVtYmVyUGlja2VyLmpzJztcclxuaW1wb3J0IEdMQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9HTENvbG9ycy5qcyc7XHJcbmltcG9ydCBHTENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vR0xDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgR0xTeW1ib2xzIGZyb20gJy4uLy4uL2NvbW1vbi9HTFN5bWJvbHMuanMnO1xyXG5pbXBvcnQgTGluZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvTGluZS5qcyc7XHJcbmltcG9ydCBEeW5hbWljVmFsdWVOb2RlLCB7IER5bmFtaWNWYWx1ZU5vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRHluYW1pY1ZhbHVlTm9kZS5qcyc7XHJcbmltcG9ydCBFcXVhdGlvbk5vZGUsIHsgRXF1YXRpb25Ob2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0VxdWF0aW9uTm9kZS5qcyc7XHJcbmltcG9ydCBTbG9wZVBpY2tlciBmcm9tICcuLi8uLi9jb21tb24vdmlldy9waWNrZXIvU2xvcGVQaWNrZXIuanMnO1xyXG5pbXBvcnQgVW5kZWZpbmVkU2xvcGVJbmRpY2F0b3IgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvVW5kZWZpbmVkU2xvcGVJbmRpY2F0b3IuanMnO1xyXG5pbXBvcnQgZ3JhcGhpbmdMaW5lcyBmcm9tICcuLi8uLi9ncmFwaGluZ0xpbmVzLmpzJztcclxuaW1wb3J0IEdyYXBoaW5nTGluZXNTdHJpbmdzIGZyb20gJy4uLy4uL0dyYXBoaW5nTGluZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IHsgQ3JlYXRlRHluYW1pY0xhYmVsT3B0aW9ucyB9IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0xpbmVOb2RlLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIFdoZXRoZXIgdG8gc2hvdyAnc2xvcGUgdW5kZWZpbmVkJyBhZnRlciBub24taW50ZXJhY3RpdmUgZXF1YXRpb25zIHdpdGggdW5kZWZpbmVkIHNsb3BlLCBmb3IgZXhhbXBsZVxyXG4gIC8vICd4ID0gMycgdmVyc3VzICd4ID0gMyAoc2xvcGUgdW5kZWZpbmVkKScuXHJcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9ncmFwaGluZy1zbG9wZS1pbnRlcmNlcHQvaXNzdWVzLzdcclxuICBzbG9wZVVuZGVmaW5lZFZpc2libGU/OiBib29sZWFuO1xyXG5cclxuICAvLyBjb21wb25lbnRzIHRoYXQgY2FuIGJlIGludGVyYWN0aXZlXHJcbiAgaW50ZXJhY3RpdmVQb2ludD86IGJvb2xlYW47XHJcbiAgaW50ZXJhY3RpdmVTbG9wZT86IGJvb2xlYW47XHJcblxyXG4gIC8vIGR5bmFtaWMgcmFuZ2Ugb2YgY29tcG9uZW50c1xyXG4gIHgxUmFuZ2VQcm9wZXJ0eT86IFByb3BlcnR5PFJhbmdlPjtcclxuICB5MVJhbmdlUHJvcGVydHk/OiBQcm9wZXJ0eTxSYW5nZT47XHJcbiAgcmlzZVJhbmdlUHJvcGVydHk/OiBQcm9wZXJ0eTxSYW5nZT47XHJcbiAgcnVuUmFuZ2VQcm9wZXJ0eT86IFByb3BlcnR5PFJhbmdlPjtcclxuXHJcbiAgc3RhdGljQ29sb3I/OiBDb2xvciB8IHN0cmluZztcclxufTtcclxuXHJcbnR5cGUgUG9pbnRTbG9wZUVxdWF0aW9uTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIEVxdWF0aW9uTm9kZU9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb2ludFNsb3BlRXF1YXRpb25Ob2RlIGV4dGVuZHMgRXF1YXRpb25Ob2RlIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlUG9pbnRTbG9wZUVxdWF0aW9uTm9kZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsaW5lUHJvcGVydHk6IFByb3BlcnR5PExpbmU+LCBwcm92aWRlZE9wdGlvbnM/OiBQb2ludFNsb3BlRXF1YXRpb25Ob2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFBvaW50U2xvcGVFcXVhdGlvbk5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgRXF1YXRpb25Ob2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gV2hldGhlciB0byBzaG93ICdzbG9wZSB1bmRlZmluZWQnIGFmdGVyIG5vbi1pbnRlcmFjdGl2ZSBlcXVhdGlvbnMgd2l0aCB1bmRlZmluZWQgc2xvcGUsIGZvciBleGFtcGxlXHJcbiAgICAgIC8vICd4ID0gMycgdmVyc3VzICd4ID0gMyAoc2xvcGUgdW5kZWZpbmVkKScuXHJcbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ3JhcGhpbmctc2xvcGUtaW50ZXJjZXB0L2lzc3Vlcy83XHJcbiAgICAgIHNsb3BlVW5kZWZpbmVkVmlzaWJsZTogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIGNvbXBvbmVudHMgdGhhdCBjYW4gYmUgaW50ZXJhY3RpdmVcclxuICAgICAgaW50ZXJhY3RpdmVQb2ludDogdHJ1ZSxcclxuICAgICAgaW50ZXJhY3RpdmVTbG9wZTogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIGR5bmFtaWMgcmFuZ2Ugb2YgY29tcG9uZW50c1xyXG4gICAgICB4MVJhbmdlUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggR0xDb25zdGFudHMuWF9BWElTX1JBTkdFICksXHJcbiAgICAgIHkxUmFuZ2VQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBHTENvbnN0YW50cy5ZX0FYSVNfUkFOR0UgKSxcclxuICAgICAgcmlzZVJhbmdlUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggR0xDb25zdGFudHMuWV9BWElTX1JBTkdFICksXHJcbiAgICAgIHJ1blJhbmdlUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggR0xDb25zdGFudHMuWF9BWElTX1JBTkdFICksXHJcblxyXG4gICAgICAvLyBzdHlsZVxyXG4gICAgICBmb250U2l6ZTogR0xDb25zdGFudHMuSU5URVJBQ1RJVkVfRVFVQVRJT05fRk9OVF9TSVpFLFxyXG4gICAgICBzdGF0aWNDb2xvcjogJ2JsYWNrJ1xyXG5cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7IC8vIGNhbGwgZmlyc3QsIGJlY2F1c2Ugc3VwZXIgY29tcHV0ZXMgdmFyaW91cyBsYXlvdXQgbWV0cmljc1xyXG5cclxuICAgIGNvbnN0IGZ1bGx5SW50ZXJhY3RpdmUgPSAoIG9wdGlvbnMuaW50ZXJhY3RpdmVQb2ludCAmJiBvcHRpb25zLmludGVyYWN0aXZlU2xvcGUgKTtcclxuICAgIGNvbnN0IGludGVyYWN0aXZlRm9udCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiBvcHRpb25zLmZvbnRTaXplLCB3ZWlnaHQ6IEdMQ29uc3RhbnRzLkVRVUFUSU9OX0ZPTlRfV0VJR0hUIH0gKTtcclxuICAgIGNvbnN0IHN0YXRpY0ZvbnQgPSBuZXcgUGhldEZvbnQoIHsgc2l6ZTogb3B0aW9ucy5mb250U2l6ZSwgd2VpZ2h0OiBHTENvbnN0YW50cy5FUVVBVElPTl9GT05UX1dFSUdIVCB9ICk7XHJcbiAgICBjb25zdCBzdGF0aWNPcHRpb25zID0geyBmb250OiBzdGF0aWNGb250LCBmaWxsOiBvcHRpb25zLnN0YXRpY0NvbG9yIH07XHJcbiAgICBjb25zdCBmcmFjdGlvbkxpbmVPcHRpb25zID0geyBzdHJva2U6IG9wdGlvbnMuc3RhdGljQ29sb3IsIGxpbmVXaWR0aDogdGhpcy5mcmFjdGlvbkxpbmVUaGlja25lc3MgfTtcclxuXHJcbiAgICBjb25zdCBudW1iZXJQcm9wZXJ0eU9wdGlvbnM6IE51bWJlclByb3BlcnR5T3B0aW9ucyA9IHtcclxuICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGludGVybmFsIHByb3BlcnRpZXMgdGhhdCBhcmUgY29ubmVjdGVkIHRvIHBpY2tlcnNcclxuICAgIGNvbnN0IHgxUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIGxpbmVQcm9wZXJ0eS52YWx1ZS54MSwgbnVtYmVyUHJvcGVydHlPcHRpb25zICk7XHJcbiAgICBjb25zdCB5MVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBsaW5lUHJvcGVydHkudmFsdWUueTEsIG51bWJlclByb3BlcnR5T3B0aW9ucyApO1xyXG4gICAgY29uc3QgcmlzZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBsaW5lUHJvcGVydHkudmFsdWUucmlzZSwgbnVtYmVyUHJvcGVydHlPcHRpb25zICk7XHJcbiAgICBjb25zdCBydW5Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggbGluZVByb3BlcnR5LnZhbHVlLnJ1biwgbnVtYmVyUHJvcGVydHlPcHRpb25zICk7XHJcblxyXG4gICAgLypcclxuICAgICAqIEZsYWcgdGhhdCBhbGxvd3MgdXMgdG8gdXBkYXRlIGFsbCBjb250cm9scyBhdG9taWNhbGx5IHdoZW4gdGhlIG1vZGVsIGNoYW5nZXMuXHJcbiAgICAgKiBXaGVuIGEgcGlja2VyJ3MgdmFsdWUgY2hhbmdlcywgaXQgcmVzdWx0cyBpbiB0aGUgY3JlYXRpb24gb2YgYSBuZXcgTGluZS5cclxuICAgICAqIFNvIGlmIHlvdSBkb24ndCBjaGFuZ2UgdGhlIHBpY2tlcnMgYXRvbWljYWxseSB0byBtYXRjaCBhIG5ldyBMaW5lIGluc3RhbmNlLFxyXG4gICAgICogdGhlIG5ldyBMaW5lIHdpbGwgYmUgaW5hZHZlcnRlbnRseSByZXBsYWNlZCB3aXRoIGFuIGluY29ycmVjdCBsaW5lLlxyXG4gICAgICovXHJcbiAgICBsZXQgdXBkYXRpbmdDb250cm9scyA9IGZhbHNlO1xyXG5cclxuICAgIC8vIERldGVybWluZSB0aGUgbWF4IHdpZHRoIG9mIHRoZSByaXNlIGFuZCBydW4gcGlja2Vycy5cclxuICAgIGNvbnN0IG1heFNsb3BlUGlja2VyV2lkdGggPSBFcXVhdGlvbk5vZGUuY29tcHV0ZU1heFNsb3BlUGlja2VyV2lkdGgoIG9wdGlvbnMucmlzZVJhbmdlUHJvcGVydHksXHJcbiAgICAgIG9wdGlvbnMucnVuUmFuZ2VQcm9wZXJ0eSwgaW50ZXJhY3RpdmVGb250LCB0aGlzLmRlY2ltYWxQbGFjZXMgKTtcclxuXHJcbiAgICAvLyBOb2RlcyB0aGF0IGFwcGVhciBpbiBhbGwgcG9zc2libGUgZm9ybXMgb2YgdGhlIGVxdWF0aW9uOiAoeS15MSkgPSByaXNlL3J1biAoeC14MSlcclxuICAgIGNvbnN0IHlMZWZ0UGFyZW5Ob2RlID0gbmV3IFRleHQoICcoJywgc3RhdGljT3B0aW9ucyApO1xyXG4gICAgY29uc3QgeU5vZGUgPSBuZXcgUmljaFRleHQoIEdMU3ltYm9scy55LCBzdGF0aWNPcHRpb25zICk7XHJcbiAgICBjb25zdCB5UGx1c05vZGUgPSBuZXcgUGx1c05vZGUoIGNvbWJpbmVPcHRpb25zPFBsdXNOb2RlT3B0aW9ucz4oIHsgc2l6ZTogdGhpcy5vcGVyYXRvckxpbmVTaXplIH0sIHN0YXRpY09wdGlvbnMgKSApO1xyXG4gICAgY29uc3QgeU1pbnVzTm9kZSA9IG5ldyBNaW51c05vZGUoIGNvbWJpbmVPcHRpb25zPE1pbnVzTm9kZU9wdGlvbnM+KCB7IHNpemU6IHRoaXMub3BlcmF0b3JMaW5lU2l6ZSB9LCBzdGF0aWNPcHRpb25zICkgKTtcclxuICAgIGxldCB5MU5vZGU6IE51bWJlclBpY2tlciB8IER5bmFtaWNWYWx1ZU5vZGU7XHJcbiAgICBpZiAoIG9wdGlvbnMuaW50ZXJhY3RpdmVQb2ludCApIHtcclxuICAgICAgeTFOb2RlID0gbmV3IE51bWJlclBpY2tlciggeTFQcm9wZXJ0eSwgb3B0aW9ucy55MVJhbmdlUHJvcGVydHksXHJcbiAgICAgICAgY29tYmluZU9wdGlvbnM8TnVtYmVyUGlja2VyT3B0aW9ucz4oIHt9LCBHTENvbnN0YW50cy5OVU1CRVJfUElDS0VSX09QVElPTlMsIHtcclxuICAgICAgICAgIGNvbG9yOiBHTENvbG9ycy5QT0lOVF9YMV9ZMSxcclxuICAgICAgICAgIGZvbnQ6IGludGVyYWN0aXZlRm9udFxyXG4gICAgICAgIH0gKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHkxTm9kZSA9IG5ldyBEeW5hbWljVmFsdWVOb2RlKCB5MVByb3BlcnR5LCBjb21iaW5lT3B0aW9uczxEeW5hbWljVmFsdWVOb2RlT3B0aW9ucz4oIHsgYWJzb2x1dGVWYWx1ZTogdHJ1ZSB9LCBzdGF0aWNPcHRpb25zICkgKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHlSaWdodFBhcmVuTm9kZSA9IG5ldyBUZXh0KCAnKScsIHN0YXRpY09wdGlvbnMgKTtcclxuICAgIGNvbnN0IHkxTWludXNTaWduTm9kZSA9IG5ldyBNaW51c05vZGUoIGNvbWJpbmVPcHRpb25zPE1pbnVzTm9kZU9wdGlvbnM+KCB7IHNpemU6IHRoaXMuc2lnbkxpbmVTaXplIH0sIHN0YXRpY09wdGlvbnMgKSApOyAvLyBmb3IgeT0teTEgY2FzZVxyXG4gICAgY29uc3QgZXF1YWxzTm9kZSA9IG5ldyBUZXh0KCAnPScsIHN0YXRpY09wdGlvbnMgKTtcclxuICAgIGNvbnN0IHNsb3BlTWludXNTaWduTm9kZSA9IG5ldyBNaW51c05vZGUoIGNvbWJpbmVPcHRpb25zPE1pbnVzTm9kZU9wdGlvbnM+KCB7IHNpemU6IHRoaXMuc2lnbkxpbmVTaXplIH0sIHN0YXRpY09wdGlvbnMgKSApO1xyXG4gICAgbGV0IHJpc2VOb2RlOiBTbG9wZVBpY2tlciB8IER5bmFtaWNWYWx1ZU5vZGU7XHJcbiAgICBsZXQgcnVuTm9kZTogU2xvcGVQaWNrZXIgfCBEeW5hbWljVmFsdWVOb2RlO1xyXG4gICAgaWYgKCBvcHRpb25zLmludGVyYWN0aXZlU2xvcGUgKSB7XHJcbiAgICAgIHJpc2VOb2RlID0gbmV3IFNsb3BlUGlja2VyKCByaXNlUHJvcGVydHksIHJ1blByb3BlcnR5LCBvcHRpb25zLnJpc2VSYW5nZVByb3BlcnR5LCB7IGZvbnQ6IGludGVyYWN0aXZlRm9udCB9ICk7XHJcbiAgICAgIHJ1bk5vZGUgPSBuZXcgU2xvcGVQaWNrZXIoIHJ1blByb3BlcnR5LCByaXNlUHJvcGVydHksIG9wdGlvbnMucnVuUmFuZ2VQcm9wZXJ0eSwgeyBmb250OiBpbnRlcmFjdGl2ZUZvbnQgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJpc2VOb2RlID0gbmV3IER5bmFtaWNWYWx1ZU5vZGUoIHJpc2VQcm9wZXJ0eSwgY29tYmluZU9wdGlvbnM8RHluYW1pY1ZhbHVlTm9kZU9wdGlvbnM+KCB7IGFic29sdXRlVmFsdWU6IHRydWUgfSwgc3RhdGljT3B0aW9ucyApICk7XHJcbiAgICAgIHJ1bk5vZGUgPSBuZXcgRHluYW1pY1ZhbHVlTm9kZSggcnVuUHJvcGVydHksIGNvbWJpbmVPcHRpb25zPER5bmFtaWNWYWx1ZU5vZGVPcHRpb25zPiggeyBhYnNvbHV0ZVZhbHVlOiB0cnVlIH0sIHN0YXRpY09wdGlvbnMgKSApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZnJhY3Rpb25MaW5lTm9kZSA9IG5ldyBTY2VuZXJ5TGluZSggMCwgMCwgbWF4U2xvcGVQaWNrZXJXaWR0aCwgMCwgZnJhY3Rpb25MaW5lT3B0aW9ucyApO1xyXG4gICAgY29uc3QgeExlZnRQYXJlbk5vZGUgPSBuZXcgVGV4dCggJygnLCBzdGF0aWNPcHRpb25zICk7XHJcbiAgICBjb25zdCB4Tm9kZSA9IG5ldyBSaWNoVGV4dCggR0xTeW1ib2xzLngsIHN0YXRpY09wdGlvbnMgKTtcclxuICAgIGNvbnN0IHhQbHVzTm9kZSA9IG5ldyBQbHVzTm9kZSggY29tYmluZU9wdGlvbnM8UGx1c05vZGVPcHRpb25zPiggeyBzaXplOiB0aGlzLm9wZXJhdG9yTGluZVNpemUgfSwgc3RhdGljT3B0aW9ucyApICk7XHJcbiAgICBjb25zdCB4TWludXNOb2RlID0gbmV3IE1pbnVzTm9kZSggY29tYmluZU9wdGlvbnM8TWludXNOb2RlT3B0aW9ucz4oIHsgc2l6ZTogdGhpcy5vcGVyYXRvckxpbmVTaXplIH0sIHN0YXRpY09wdGlvbnMgKSApO1xyXG4gICAgbGV0IHgxTm9kZTogTnVtYmVyUGlja2VyIHwgRHluYW1pY1ZhbHVlTm9kZTtcclxuICAgIGlmICggb3B0aW9ucy5pbnRlcmFjdGl2ZVBvaW50ICkge1xyXG4gICAgICB4MU5vZGUgPSBuZXcgTnVtYmVyUGlja2VyKCB4MVByb3BlcnR5LCBvcHRpb25zLngxUmFuZ2VQcm9wZXJ0eSxcclxuICAgICAgICBjb21iaW5lT3B0aW9uczxOdW1iZXJQaWNrZXJPcHRpb25zPigge30sIEdMQ29uc3RhbnRzLk5VTUJFUl9QSUNLRVJfT1BUSU9OUywge1xyXG4gICAgICAgICAgY29sb3I6IEdMQ29sb3JzLlBPSU5UX1gxX1kxLFxyXG4gICAgICAgICAgZm9udDogaW50ZXJhY3RpdmVGb250XHJcbiAgICAgICAgfSApICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgeDFOb2RlID0gbmV3IER5bmFtaWNWYWx1ZU5vZGUoIHgxUHJvcGVydHksIGNvbWJpbmVPcHRpb25zPER5bmFtaWNWYWx1ZU5vZGVPcHRpb25zPiggeyBhYnNvbHV0ZVZhbHVlOiB0cnVlIH0sIHN0YXRpY09wdGlvbnMgKSApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgeFJpZ2h0UGFyZW5Ob2RlID0gbmV3IFRleHQoICcpJywgc3RhdGljT3B0aW9ucyApO1xyXG4gICAgY29uc3Qgc2xvcGVVbmRlZmluZWROb2RlID0gbmV3IFJpY2hUZXh0KCAnPycsIHN0YXRpY09wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBhZGQgYWxsIG5vZGVzLCB3ZSdsbCBzZXQgd2hpY2ggb25lcyBhcmUgdmlzaWJsZSBiYXNlcyBvbiBkZXNpcmVkIHNpbXBsaWZpY2F0aW9uXHJcbiAgICB0aGlzLmNoaWxkcmVuID0gW1xyXG4gICAgICB5TGVmdFBhcmVuTm9kZSwgeU5vZGUsIHlQbHVzTm9kZSwgeU1pbnVzTm9kZSwgeTFOb2RlLCB5UmlnaHRQYXJlbk5vZGUsIHkxTWludXNTaWduTm9kZSwgZXF1YWxzTm9kZSxcclxuICAgICAgc2xvcGVNaW51c1NpZ25Ob2RlLCByaXNlTm9kZSwgcnVuTm9kZSwgZnJhY3Rpb25MaW5lTm9kZSwgeExlZnRQYXJlbk5vZGUsIHhOb2RlLCB4UGx1c05vZGUsIHhNaW51c05vZGUsIHgxTm9kZSwgeFJpZ2h0UGFyZW5Ob2RlLFxyXG4gICAgICBzbG9wZVVuZGVmaW5lZE5vZGVcclxuICAgIF07XHJcblxyXG4gICAgLypcclxuICAgICAqIFVwZGF0ZXMgdGhlIGxheW91dCB0byBtYXRjaCB0aGUgZGVzaXJlZCBmb3JtIG9mIHRoZSBlcXVhdGlvbi5cclxuICAgICAqIFRoaXMgaXMgYmFzZWQgb24gd2hpY2ggcGFydHMgb2YgdGhlIGVxdWF0aW9uIGFyZSBpbnRlcmFjdGl2ZSwgYW5kIHdoYXQgdGhlXHJcbiAgICAgKiBub24taW50ZXJhY3RpdmUgcGFydHMgb2YgdGhlIGVxdWF0aW9uIHNob3VsZCBsb29rIGxpa2Ugd2hlbiB3cml0dGVuIGluIHNpbXBsaWZpZWQgZm9ybS5cclxuICAgICAqL1xyXG4gICAgY29uc3QgdXBkYXRlTGF5b3V0ID0gKCBsaW5lOiBMaW5lICkgPT4ge1xyXG5cclxuICAgICAgY29uc3QgaW50ZXJhY3RpdmUgPSBvcHRpb25zLmludGVyYWN0aXZlUG9pbnQgfHwgb3B0aW9ucy5pbnRlcmFjdGl2ZVNsb3BlO1xyXG4gICAgICBjb25zdCBsaW5lQ29sb3IgPSBsaW5lLmNvbG9yO1xyXG5cclxuICAgICAgLy8gU3RhcnQgd2l0aCBhbGwgY2hpbGRyZW4gaW52aXNpYmxlIGFuZCBhdCB4PTAuXHJcbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ3JhcGhpbmctbGluZXMvaXNzdWVzLzEyMFxyXG4gICAgICBjb25zdCBsZW4gPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlblsgaSBdLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuWyBpIF0ueCA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgc2xvcGVVbmRlZmluZWROb2RlLnN0cmluZyA9ICcnOyAvLyB3b3JrYXJvdW5kIGZvciAjMTE0IGFuZCAjMTE3XHJcblxyXG4gICAgICBpZiAoIGxpbmUudW5kZWZpbmVkU2xvcGUoKSAmJiAhaW50ZXJhY3RpdmUgKSB7XHJcbiAgICAgICAgLy8gc2xvcGUgaXMgdW5kZWZpbmVkIGFuZCBub3RoaW5nIGlzIGludGVyYWN0aXZlXHJcbiAgICAgICAgc2xvcGVVbmRlZmluZWROb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHNsb3BlVW5kZWZpbmVkTm9kZS5maWxsID0gbGluZUNvbG9yO1xyXG4gICAgICAgIHNsb3BlVW5kZWZpbmVkTm9kZS5zdHJpbmcgPSAoIG9wdGlvbnMuc2xvcGVVbmRlZmluZWRWaXNpYmxlICkgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmdVdGlscy5mb3JtYXQoIEdyYXBoaW5nTGluZXNTdHJpbmdzLnNsb3BlVW5kZWZpbmVkLCBHTFN5bWJvbHMueCwgbGluZS54MSApIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RyaW5nVXRpbHMuZmlsbEluKCBge3t4fX0gJHtNYXRoU3ltYm9scy5FUVVBTF9UT30ge3t2YWx1ZX19YCwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IEdMU3ltYm9scy54LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBsaW5lLngxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoICFpbnRlcmFjdGl2ZSAmJiBsaW5lLnNhbWUoIExpbmUuWV9FUVVBTFNfWF9MSU5FICkgKSB7XHJcbiAgICAgICAgLy8gdXNlIHNsb3BlLWludGVyY2VwdCBmb3JtIGZvciB5PXhcclxuICAgICAgICB5Tm9kZS52aXNpYmxlID0gZXF1YWxzTm9kZS52aXNpYmxlID0geE5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgeU5vZGUuZmlsbCA9IGVxdWFsc05vZGUuZmlsbCA9IHhOb2RlLmZpbGwgPSBsaW5lQ29sb3I7XHJcbiAgICAgICAgZXF1YWxzTm9kZS5sZWZ0ID0geU5vZGUucmlnaHQgKyB0aGlzLnJlbGF0aW9uYWxPcGVyYXRvclhTcGFjaW5nO1xyXG4gICAgICAgIHhOb2RlLmxlZnQgPSBlcXVhbHNOb2RlLnJpZ2h0ICsgdGhpcy5yZWxhdGlvbmFsT3BlcmF0b3JYU3BhY2luZztcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoICFpbnRlcmFjdGl2ZSAmJiBsaW5lLnNhbWUoIExpbmUuWV9FUVVBTFNfTkVHQVRJVkVfWF9MSU5FICkgKSB7XHJcbiAgICAgICAgLy8gdXNlIHNsb3BlLWludGVyY2VwdCBmb3JtIGZvciB5PS14XHJcbiAgICAgICAgeU5vZGUudmlzaWJsZSA9IGVxdWFsc05vZGUudmlzaWJsZSA9IHNsb3BlTWludXNTaWduTm9kZS52aXNpYmxlID0geE5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgeU5vZGUuZmlsbCA9IGVxdWFsc05vZGUuZmlsbCA9IHNsb3BlTWludXNTaWduTm9kZS5maWxsID0geE5vZGUuZmlsbCA9IGxpbmVDb2xvcjtcclxuICAgICAgICBlcXVhbHNOb2RlLmxlZnQgPSB5Tm9kZS5yaWdodCArIHRoaXMucmVsYXRpb25hbE9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgICAgc2xvcGVNaW51c1NpZ25Ob2RlLmxlZnQgPSBlcXVhbHNOb2RlLnJpZ2h0ICsgdGhpcy5yZWxhdGlvbmFsT3BlcmF0b3JYU3BhY2luZztcclxuICAgICAgICBzbG9wZU1pbnVzU2lnbk5vZGUuY2VudGVyWSA9IGVxdWFsc05vZGUuY2VudGVyWSArIHRoaXMub3BlcmF0b3JZRnVkZ2VGYWN0b3I7XHJcbiAgICAgICAgeE5vZGUubGVmdCA9IHNsb3BlTWludXNTaWduTm9kZS5yaWdodCArIHRoaXMuaW50ZWdlclNpZ25YU3BhY2luZztcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNlbGVjdCB0aGUgb3BlcmF0b3JzIGJhc2VkIG9uIHRoZSBzaWducyBvZiB4MSBhbmQgeTEuXHJcbiAgICAgIGNvbnN0IHhPcGVyYXRvck5vZGUgPSAoIG9wdGlvbnMuaW50ZXJhY3RpdmVQb2ludCB8fCBsaW5lLngxID49IDAgKSA/IHhNaW51c05vZGUgOiB4UGx1c05vZGU7XHJcbiAgICAgIGNvbnN0IHlPcGVyYXRvck5vZGUgPSAoIG9wdGlvbnMuaW50ZXJhY3RpdmVQb2ludCB8fCBsaW5lLnkxID49IDAgKSA/IHlNaW51c05vZGUgOiB5UGx1c05vZGU7XHJcblxyXG4gICAgICBpZiAoIGxpbmUucmlzZSA9PT0gMCAmJiAhb3B0aW9ucy5pbnRlcmFjdGl2ZVNsb3BlICYmICFvcHRpb25zLmludGVyYWN0aXZlUG9pbnQgKSB7XHJcbiAgICAgICAgLy8geTEgaXMgb24gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGVxdWF0aW9uXHJcbiAgICAgICAgeU5vZGUudmlzaWJsZSA9IGVxdWFsc05vZGUudmlzaWJsZSA9IHkxTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB5Tm9kZS5maWxsID0gZXF1YWxzTm9kZS5maWxsID0gbGluZUNvbG9yO1xyXG4gICAgICAgIGlmICggeTFOb2RlIGluc3RhbmNlb2YgRHluYW1pY1ZhbHVlTm9kZSApIHtcclxuICAgICAgICAgIHkxTm9kZS5maWxsID0gbGluZUNvbG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlcXVhbHNOb2RlLmxlZnQgPSB5Tm9kZS5yaWdodCArIHRoaXMucmVsYXRpb25hbE9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgICAgaWYgKCBvcHRpb25zLmludGVyYWN0aXZlUG9pbnQgfHwgbGluZS55MSA+PSAwICkge1xyXG4gICAgICAgICAgLy8geSA9IHkxXHJcbiAgICAgICAgICB5MU5vZGUubGVmdCA9IGVxdWFsc05vZGUucmlnaHQgKyB0aGlzLnJlbGF0aW9uYWxPcGVyYXRvclhTcGFjaW5nO1xyXG4gICAgICAgICAgeTFOb2RlLnkgPSB5Tm9kZS55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIHkgPSAteTFcclxuICAgICAgICAgIHkxTWludXNTaWduTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHkxTWludXNTaWduTm9kZS5maWxsID0gbGluZUNvbG9yO1xyXG4gICAgICAgICAgeTFNaW51c1NpZ25Ob2RlLmxlZnQgPSBlcXVhbHNOb2RlLnJpZ2h0ICsgdGhpcy5yZWxhdGlvbmFsT3BlcmF0b3JYU3BhY2luZztcclxuICAgICAgICAgIHkxTWludXNTaWduTm9kZS5jZW50ZXJZID0gZXF1YWxzTm9kZS5jZW50ZXJZICsgdGhpcy5vcGVyYXRvcllGdWRnZUZhY3RvcjtcclxuICAgICAgICAgIHkxTm9kZS5sZWZ0ID0geTFNaW51c1NpZ25Ob2RlLnJpZ2h0ICsgdGhpcy5pbnRlZ2VyU2lnblhTcGFjaW5nO1xyXG4gICAgICAgICAgeTFOb2RlLnkgPSB5Tm9kZS55O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHsgIC8vIHkxIGlzIG9uIHRoZSBsZWZ0IHNpZGUgb2YgdGhlIGVxdWF0aW9uXHJcblxyXG4gICAgICAgIGxldCBwcmV2aW91c05vZGU7XHJcblxyXG4gICAgICAgIGlmICggIW9wdGlvbnMuaW50ZXJhY3RpdmVQb2ludCAmJiBsaW5lLnkxID09PSAwICkge1xyXG4gICAgICAgICAgLy8geVxyXG4gICAgICAgICAgeU5vZGUueCA9IDA7XHJcbiAgICAgICAgICB5Tm9kZS55ID0gMDtcclxuICAgICAgICAgIHlOb2RlLmZpbGwgPSBsaW5lQ29sb3I7XHJcbiAgICAgICAgICB5Tm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHByZXZpb3VzTm9kZSA9IHlOb2RlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggIWludGVyYWN0aXZlICkge1xyXG4gICAgICAgICAgLy8geSAtIHkxXHJcbiAgICAgICAgICB5Tm9kZS52aXNpYmxlID0geU9wZXJhdG9yTm9kZS52aXNpYmxlID0geTFOb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgeU5vZGUuZmlsbCA9IHlPcGVyYXRvck5vZGUuZmlsbCA9IGxpbmVDb2xvcjtcclxuICAgICAgICAgIGlmICggeTFOb2RlIGluc3RhbmNlb2YgRHluYW1pY1ZhbHVlTm9kZSApIHtcclxuICAgICAgICAgICAgeTFOb2RlLmZpbGwgPSBsaW5lQ29sb3I7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB5Tm9kZS54ID0gMDtcclxuICAgICAgICAgIHlOb2RlLnkgPSAwO1xyXG4gICAgICAgICAgeU9wZXJhdG9yTm9kZS5sZWZ0ID0geU5vZGUucmlnaHQgKyB0aGlzLm9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgICAgICB5T3BlcmF0b3JOb2RlLmNlbnRlclkgPSB5Tm9kZS5jZW50ZXJZICsgdGhpcy5vcGVyYXRvcllGdWRnZUZhY3RvcjtcclxuICAgICAgICAgIHkxTm9kZS5sZWZ0ID0geU9wZXJhdG9yTm9kZS5yaWdodCArIHRoaXMub3BlcmF0b3JYU3BhY2luZztcclxuICAgICAgICAgIHkxTm9kZS5jZW50ZXJZID0geU5vZGUuY2VudGVyWTtcclxuICAgICAgICAgIHByZXZpb3VzTm9kZSA9IHkxTm9kZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyAoeSAtIHkxKVxyXG4gICAgICAgICAgeUxlZnRQYXJlbk5vZGUudmlzaWJsZSA9IHlOb2RlLnZpc2libGUgPSB5T3BlcmF0b3JOb2RlLnZpc2libGUgPSB5MU5vZGUudmlzaWJsZSA9IHlSaWdodFBhcmVuTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHlMZWZ0UGFyZW5Ob2RlLmZpbGwgPSB5Tm9kZS5maWxsID0geU9wZXJhdG9yTm9kZS5maWxsID0geVJpZ2h0UGFyZW5Ob2RlLmZpbGwgPSBsaW5lQ29sb3I7XHJcbiAgICAgICAgICBpZiAoIHkxTm9kZSBpbnN0YW5jZW9mIER5bmFtaWNWYWx1ZU5vZGUgKSB7XHJcbiAgICAgICAgICAgIHkxTm9kZS5maWxsID0gbGluZUNvbG9yO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgeUxlZnRQYXJlbk5vZGUueCA9IDA7XHJcbiAgICAgICAgICB5TGVmdFBhcmVuTm9kZS55ID0gMDtcclxuICAgICAgICAgIHlOb2RlLmxlZnQgPSB5TGVmdFBhcmVuTm9kZS5yaWdodCArIHRoaXMucGFyZW5YU3BhY2luZztcclxuICAgICAgICAgIHlOb2RlLnkgPSB5TGVmdFBhcmVuTm9kZS55O1xyXG4gICAgICAgICAgeU9wZXJhdG9yTm9kZS5sZWZ0ID0geU5vZGUucmlnaHQgKyB0aGlzLm9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgICAgICB5T3BlcmF0b3JOb2RlLmNlbnRlclkgPSB5Tm9kZS5jZW50ZXJZICsgdGhpcy5vcGVyYXRvcllGdWRnZUZhY3RvcjtcclxuICAgICAgICAgIHkxTm9kZS5sZWZ0ID0geU9wZXJhdG9yTm9kZS5yaWdodCArIHRoaXMub3BlcmF0b3JYU3BhY2luZztcclxuICAgICAgICAgIHkxTm9kZS5jZW50ZXJZID0geU5vZGUuY2VudGVyWTtcclxuICAgICAgICAgIHlSaWdodFBhcmVuTm9kZS5sZWZ0ID0geTFOb2RlLnJpZ2h0ICsgdGhpcy5wYXJlblhTcGFjaW5nO1xyXG4gICAgICAgICAgeVJpZ2h0UGFyZW5Ob2RlLnkgPSB5Tm9kZS55O1xyXG4gICAgICAgICAgcHJldmlvdXNOb2RlID0geVJpZ2h0UGFyZW5Ob2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gPVxyXG4gICAgICAgIGVxdWFsc05vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgZXF1YWxzTm9kZS5maWxsID0gbGluZUNvbG9yO1xyXG4gICAgICAgIGVxdWFsc05vZGUubGVmdCA9IHByZXZpb3VzTm9kZS5yaWdodCArIHRoaXMucmVsYXRpb25hbE9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgICAgZXF1YWxzTm9kZS55ID0geU5vZGUueSArIHRoaXMuZXF1YWxzU2lnbkZ1ZGdlRmFjdG9yO1xyXG5cclxuICAgICAgICAvLyBzbG9wZVxyXG4gICAgICAgIGxldCBwcmV2aW91c1hPZmZzZXQ7XHJcbiAgICAgICAgaWYgKCBvcHRpb25zLmludGVyYWN0aXZlU2xvcGUgKSB7XHJcbiAgICAgICAgICAvLyAocmlzZS9ydW4pLCB3aGVyZSByaXNlIGFuZCBydW4gYXJlIHBpY2tlcnMsIGFuZCB0aGUgc2lnbiBpcyBpbnRlZ3JhdGVkIGludG8gdGhlIHBpY2tlcnNcclxuICAgICAgICAgIHJpc2VOb2RlLnZpc2libGUgPSBydW5Ob2RlLnZpc2libGUgPSBmcmFjdGlvbkxpbmVOb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgaWYgKCByaXNlTm9kZSBpbnN0YW5jZW9mIER5bmFtaWNWYWx1ZU5vZGUgKSB7XHJcbiAgICAgICAgICAgIHJpc2VOb2RlLmZpbGwgPSBsaW5lQ29sb3I7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoIHJ1bk5vZGUgaW5zdGFuY2VvZiBEeW5hbWljVmFsdWVOb2RlICkge1xyXG4gICAgICAgICAgICBydW5Ob2RlLmZpbGwgPSBsaW5lQ29sb3I7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmcmFjdGlvbkxpbmVOb2RlLmZpbGwgPSBsaW5lQ29sb3I7XHJcbiAgICAgICAgICBmcmFjdGlvbkxpbmVOb2RlLmxlZnQgPSBlcXVhbHNOb2RlLnJpZ2h0ICsgdGhpcy5yZWxhdGlvbmFsT3BlcmF0b3JYU3BhY2luZztcclxuICAgICAgICAgIGZyYWN0aW9uTGluZU5vZGUuY2VudGVyWSA9IGVxdWFsc05vZGUuY2VudGVyWTtcclxuICAgICAgICAgIHJpc2VOb2RlLmNlbnRlclggPSBmcmFjdGlvbkxpbmVOb2RlLmNlbnRlclg7XHJcbiAgICAgICAgICByaXNlTm9kZS5ib3R0b20gPSBmcmFjdGlvbkxpbmVOb2RlLnRvcCAtIHRoaXMucGlja2Vyc1lTcGFjaW5nO1xyXG4gICAgICAgICAgcnVuTm9kZS5jZW50ZXJYID0gZnJhY3Rpb25MaW5lTm9kZS5jZW50ZXJYO1xyXG4gICAgICAgICAgcnVuTm9kZS50b3AgPSBmcmFjdGlvbkxpbmVOb2RlLmJvdHRvbSArIHRoaXMucGlja2Vyc1lTcGFjaW5nO1xyXG4gICAgICAgICAgcHJldmlvdXNOb2RlID0gZnJhY3Rpb25MaW5lTm9kZTtcclxuICAgICAgICAgIHByZXZpb3VzWE9mZnNldCA9IHRoaXMuZnJhY3Rpb25hbFNsb3BlWFNwYWNpbmc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgLy8gc2xvcGUgaXMgbm90IGludGVyYWN0aXZlLCBzbyBoZXJlIHdlIHB1dCBpdCBpbiB0aGUgZGVzaXJlZCBmb3JtXHJcblxyXG4gICAgICAgICAgLy8gc2xvcGUgcHJvcGVydGllcywgdXNlZCB0byBkZXRlcm1pbmUgY29ycmVjdCBmb3JtXHJcbiAgICAgICAgICBjb25zdCBzbG9wZSA9IGxpbmUuZ2V0U2xvcGUoKTtcclxuICAgICAgICAgIGNvbnN0IHplcm9TbG9wZSA9ICggc2xvcGUgPT09IDAgKTtcclxuICAgICAgICAgIGNvbnN0IHVuaXR5U2xvcGUgPSAoIE1hdGguYWJzKCBzbG9wZSApID09PSAxICk7XHJcbiAgICAgICAgICBjb25zdCBpbnRlZ2VyU2xvcGUgPSBOdW1iZXIuaXNJbnRlZ2VyKCBzbG9wZSApO1xyXG4gICAgICAgICAgY29uc3QgcG9zaXRpdmVTbG9wZSA9ICggc2xvcGUgPiAwICk7XHJcbiAgICAgICAgICBjb25zdCBmcmFjdGlvbmFsU2xvcGUgPSAoICF6ZXJvU2xvcGUgJiYgIXVuaXR5U2xvcGUgJiYgIWludGVnZXJTbG9wZSApO1xyXG5cclxuICAgICAgICAgIC8vIGFkanVzdCBmcmFjdGlvbiBsaW5lIHdpZHRoLCB1c2UgbWF4IHdpZHRoIG9mIHJpc2Ugb3IgcnVuXHJcbiAgICAgICAgICBjb25zdCBsaW5lV2lkdGggPSBNYXRoLm1heCggcmlzZU5vZGUud2lkdGgsIHJ1bk5vZGUud2lkdGggKTtcclxuICAgICAgICAgIGZyYWN0aW9uTGluZU5vZGUuc2V0TGluZSggMCwgMCwgbGluZVdpZHRoLCAwICk7XHJcblxyXG4gICAgICAgICAgLy8gZGVjaWRlIHdoZXRoZXIgdG8gaW5jbHVkZSB0aGUgc2xvcGUgbWludXMgc2lnblxyXG4gICAgICAgICAgaWYgKCBwb3NpdGl2ZVNsb3BlIHx8IHplcm9TbG9wZSApIHtcclxuICAgICAgICAgICAgLy8gbm8gc2lnblxyXG4gICAgICAgICAgICBwcmV2aW91c05vZGUgPSBlcXVhbHNOb2RlO1xyXG4gICAgICAgICAgICBwcmV2aW91c1hPZmZzZXQgPSB0aGlzLnJlbGF0aW9uYWxPcGVyYXRvclhTcGFjaW5nO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIC1cclxuICAgICAgICAgICAgc2xvcGVNaW51c1NpZ25Ob2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICBzbG9wZU1pbnVzU2lnbk5vZGUuZmlsbCA9IGxpbmVDb2xvcjtcclxuICAgICAgICAgICAgc2xvcGVNaW51c1NpZ25Ob2RlLmxlZnQgPSBlcXVhbHNOb2RlLnJpZ2h0ICsgdGhpcy5yZWxhdGlvbmFsT3BlcmF0b3JYU3BhY2luZztcclxuICAgICAgICAgICAgc2xvcGVNaW51c1NpZ25Ob2RlLmNlbnRlclkgPSBlcXVhbHNOb2RlLmNlbnRlclkgKyB0aGlzLnNsb3BlU2lnbllGdWRnZUZhY3RvciArIHRoaXMuc2xvcGVTaWduWU9mZnNldDtcclxuICAgICAgICAgICAgcHJldmlvdXNOb2RlID0gc2xvcGVNaW51c1NpZ25Ob2RlO1xyXG4gICAgICAgICAgICBwcmV2aW91c1hPZmZzZXQgPSAoIGZyYWN0aW9uYWxTbG9wZSA/IHRoaXMuZnJhY3Rpb25TaWduWFNwYWNpbmcgOiB0aGlzLmludGVnZXJTaWduWFNwYWNpbmcgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoIGxpbmUudW5kZWZpbmVkU2xvcGUoKSB8fCBmcmFjdGlvbmFsU2xvcGUgKSB7XHJcbiAgICAgICAgICAgIC8vIHJpc2UvcnVuXHJcbiAgICAgICAgICAgIHJpc2VOb2RlLnZpc2libGUgPSBydW5Ob2RlLnZpc2libGUgPSBmcmFjdGlvbkxpbmVOb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAoIHJpc2VOb2RlIGluc3RhbmNlb2YgRHluYW1pY1ZhbHVlTm9kZSApIHtcclxuICAgICAgICAgICAgICByaXNlTm9kZS5maWxsID0gbGluZUNvbG9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICggcnVuTm9kZSBpbnN0YW5jZW9mIER5bmFtaWNWYWx1ZU5vZGUgKSB7XHJcbiAgICAgICAgICAgICAgcnVuTm9kZS5maWxsID0gbGluZUNvbG9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZyYWN0aW9uTGluZU5vZGUuc3Ryb2tlID0gbGluZUNvbG9yO1xyXG4gICAgICAgICAgICBmcmFjdGlvbkxpbmVOb2RlLmxlZnQgPSBwcmV2aW91c05vZGUucmlnaHQgKyBwcmV2aW91c1hPZmZzZXQ7XHJcbiAgICAgICAgICAgIGZyYWN0aW9uTGluZU5vZGUuY2VudGVyWSA9IGVxdWFsc05vZGUuY2VudGVyWTtcclxuICAgICAgICAgICAgcmlzZU5vZGUuY2VudGVyWCA9IGZyYWN0aW9uTGluZU5vZGUuY2VudGVyWDtcclxuICAgICAgICAgICAgcmlzZU5vZGUuYm90dG9tID0gZnJhY3Rpb25MaW5lTm9kZS50b3AgLSB0aGlzLnlTcGFjaW5nO1xyXG4gICAgICAgICAgICBydW5Ob2RlLmNlbnRlclggPSBmcmFjdGlvbkxpbmVOb2RlLmNlbnRlclg7XHJcbiAgICAgICAgICAgIHJ1bk5vZGUudG9wID0gZnJhY3Rpb25MaW5lTm9kZS5ib3R0b20gKyB0aGlzLnlTcGFjaW5nO1xyXG4gICAgICAgICAgICBwcmV2aW91c05vZGUgPSBmcmFjdGlvbkxpbmVOb2RlO1xyXG4gICAgICAgICAgICBwcmV2aW91c1hPZmZzZXQgPSB0aGlzLmZyYWN0aW9uYWxTbG9wZVhTcGFjaW5nO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIHplcm9TbG9wZSApIHtcclxuICAgICAgICAgICAgLy8gMFxyXG4gICAgICAgICAgICByaXNlTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYgKCByaXNlTm9kZSBpbnN0YW5jZW9mIER5bmFtaWNWYWx1ZU5vZGUgKSB7XHJcbiAgICAgICAgICAgICAgcmlzZU5vZGUuZmlsbCA9IGxpbmVDb2xvcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByaXNlTm9kZS5sZWZ0ID0gZXF1YWxzTm9kZS5yaWdodCArIHRoaXMucmVsYXRpb25hbE9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgICAgICAgIHJpc2VOb2RlLnkgPSB5Tm9kZS55O1xyXG4gICAgICAgICAgICBwcmV2aW91c05vZGUgPSByaXNlTm9kZTtcclxuICAgICAgICAgICAgcHJldmlvdXNYT2Zmc2V0ID0gdGhpcy5pbnRlZ2VyU2xvcGVYU3BhY2luZztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCB1bml0eVNsb3BlICkge1xyXG4gICAgICAgICAgICAvLyBubyBzbG9wZSB0ZXJtXHJcbiAgICAgICAgICAgIHByZXZpb3VzWE9mZnNldCA9IHRoaXMucmVsYXRpb25hbE9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggaW50ZWdlclNsb3BlICkge1xyXG4gICAgICAgICAgICAvLyBOXHJcbiAgICAgICAgICAgIHJpc2VOb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAoIHJpc2VOb2RlIGluc3RhbmNlb2YgRHluYW1pY1ZhbHVlTm9kZSApIHtcclxuICAgICAgICAgICAgICByaXNlTm9kZS5maWxsID0gbGluZUNvbG9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJpc2VOb2RlLmxlZnQgPSBwcmV2aW91c05vZGUucmlnaHQgKyBwcmV2aW91c1hPZmZzZXQ7XHJcbiAgICAgICAgICAgIHJpc2VOb2RlLnkgPSB5Tm9kZS55O1xyXG4gICAgICAgICAgICBwcmV2aW91c05vZGUgPSByaXNlTm9kZTtcclxuICAgICAgICAgICAgcHJldmlvdXNYT2Zmc2V0ID0gdGhpcy5pbnRlZ2VyU2xvcGVYU3BhY2luZztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdwcm9ncmFtbWluZyBlcnJvciwgZm9yZ290IHRvIGhhbmRsZSBzb21lIHNsb3BlIGNhc2UnICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB4IHRlcm1cclxuICAgICAgICBpZiAoIGludGVyYWN0aXZlIHx8ICggbGluZS54MSAhPT0gMCAmJiBsaW5lLmdldFNsb3BlKCkgIT09IDAgJiYgbGluZS5nZXRTbG9wZSgpICE9PSAxICkgKSB7XHJcbiAgICAgICAgICAvLyAoeCAtIHgxKVxyXG4gICAgICAgICAgeExlZnRQYXJlbk5vZGUudmlzaWJsZSA9IHhOb2RlLnZpc2libGUgPSB4T3BlcmF0b3JOb2RlLnZpc2libGUgPSB4MU5vZGUudmlzaWJsZSA9IHhSaWdodFBhcmVuTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHhMZWZ0UGFyZW5Ob2RlLmZpbGwgPSB4Tm9kZS5maWxsID0geE9wZXJhdG9yTm9kZS5maWxsID0geFJpZ2h0UGFyZW5Ob2RlLmZpbGwgPSBsaW5lQ29sb3I7XHJcbiAgICAgICAgICBpZiAoIHgxTm9kZSBpbnN0YW5jZW9mIER5bmFtaWNWYWx1ZU5vZGUgKSB7XHJcbiAgICAgICAgICAgIHgxTm9kZS5maWxsID0gbGluZUNvbG9yO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgeExlZnRQYXJlbk5vZGUubGVmdCA9IHByZXZpb3VzTm9kZS5yaWdodCArIHByZXZpb3VzWE9mZnNldDtcclxuICAgICAgICAgIHhMZWZ0UGFyZW5Ob2RlLnkgPSB5Tm9kZS55O1xyXG4gICAgICAgICAgeE5vZGUubGVmdCA9IHhMZWZ0UGFyZW5Ob2RlLnJpZ2h0ICsgdGhpcy5wYXJlblhTcGFjaW5nO1xyXG4gICAgICAgICAgeE5vZGUueSA9IHlOb2RlLnk7XHJcbiAgICAgICAgICB4T3BlcmF0b3JOb2RlLmxlZnQgPSB4Tm9kZS5yaWdodCArIHRoaXMub3BlcmF0b3JYU3BhY2luZztcclxuICAgICAgICAgIHhPcGVyYXRvck5vZGUuY2VudGVyWSA9IHhOb2RlLmNlbnRlclkgKyB0aGlzLm9wZXJhdG9yWUZ1ZGdlRmFjdG9yO1xyXG4gICAgICAgICAgeDFOb2RlLmxlZnQgPSB4T3BlcmF0b3JOb2RlLnJpZ2h0ICsgdGhpcy5vcGVyYXRvclhTcGFjaW5nO1xyXG4gICAgICAgICAgeDFOb2RlLmNlbnRlclkgPSB5Tm9kZS5jZW50ZXJZO1xyXG4gICAgICAgICAgeFJpZ2h0UGFyZW5Ob2RlLmxlZnQgPSB4MU5vZGUucmlnaHQgKyB0aGlzLnBhcmVuWFNwYWNpbmc7XHJcbiAgICAgICAgICB4UmlnaHRQYXJlbk5vZGUueSA9IHlOb2RlLnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBsaW5lLmdldFNsb3BlKCkgPT09IDEgJiYgbGluZS54MSAhPT0gMCApIHtcclxuICAgICAgICAgIC8vIHggLSB4MVxyXG4gICAgICAgICAgeE5vZGUudmlzaWJsZSA9IHhPcGVyYXRvck5vZGUudmlzaWJsZSA9IHgxTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHhOb2RlLmZpbGwgPSB4T3BlcmF0b3JOb2RlLmZpbGwgPSBsaW5lQ29sb3I7XHJcbiAgICAgICAgICBpZiAoIHgxTm9kZSBpbnN0YW5jZW9mIER5bmFtaWNWYWx1ZU5vZGUgKSB7XHJcbiAgICAgICAgICAgIHgxTm9kZS5maWxsID0gbGluZUNvbG9yO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgeE5vZGUubGVmdCA9IHByZXZpb3VzTm9kZS5yaWdodCArIHByZXZpb3VzWE9mZnNldDtcclxuICAgICAgICAgIHhOb2RlLnkgPSB5Tm9kZS55O1xyXG4gICAgICAgICAgeE9wZXJhdG9yTm9kZS5sZWZ0ID0geE5vZGUucmlnaHQgKyB0aGlzLm9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgICAgICB4T3BlcmF0b3JOb2RlLmNlbnRlclkgPSB4Tm9kZS5jZW50ZXJZICsgdGhpcy5vcGVyYXRvcllGdWRnZUZhY3RvcjtcclxuICAgICAgICAgIHgxTm9kZS5sZWZ0ID0geE9wZXJhdG9yTm9kZS5yaWdodCArIHRoaXMub3BlcmF0b3JYU3BhY2luZztcclxuICAgICAgICAgIHgxTm9kZS5jZW50ZXJZID0geU5vZGUuY2VudGVyWTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGxpbmUueDEgPT09IDAgKSB7XHJcbiAgICAgICAgICAvLyB4XHJcbiAgICAgICAgICB4Tm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHhOb2RlLmZpbGwgPSBsaW5lQ29sb3I7XHJcbiAgICAgICAgICB4Tm9kZS5sZWZ0ID0gcHJldmlvdXNOb2RlLnJpZ2h0ICsgcHJldmlvdXNYT2Zmc2V0O1xyXG4gICAgICAgICAgeE5vZGUuY2VudGVyWSA9IHlOb2RlLmNlbnRlclk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAncHJvZ3JhbW1pbmcgZXJyb3IsIGZvcmdvdCB0byBoYW5kbGUgc29tZSB4LXRlcm0gY2FzZScgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gc3luYyB0aGUgbW9kZWwgd2l0aCB0aGUgY29udHJvbHMsIHVubXVsdGlsaW5rIGluIGRpc3Bvc2VcclxuICAgIGNvbnN0IGNvbnRyb2xzTXVsdGlsaW5rID0gTXVsdGlsaW5rLmxhenlNdWx0aWxpbmsoIFsgeDFQcm9wZXJ0eSwgeTFQcm9wZXJ0eSwgcmlzZVByb3BlcnR5LCBydW5Qcm9wZXJ0eSBdLFxyXG4gICAgICAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCAhdXBkYXRpbmdDb250cm9scyApIHtcclxuICAgICAgICAgIGxpbmVQcm9wZXJ0eS52YWx1ZSA9IExpbmUuY3JlYXRlUG9pbnRTbG9wZSggeDFQcm9wZXJ0eS52YWx1ZSwgeTFQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICAgICAgcmlzZVByb3BlcnR5LnZhbHVlLCBydW5Qcm9wZXJ0eS52YWx1ZSwgbGluZVByb3BlcnR5LnZhbHVlLmNvbG9yICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIHN5bmMgdGhlIGNvbnRyb2xzIGFuZCBsYXlvdXQgd2l0aCB0aGUgbW9kZWxcclxuICAgIGNvbnN0IGxpbmVPYnNlcnZlciA9ICggbGluZTogTGluZSApID0+IHtcclxuXHJcbiAgICAgIC8vIFN5bmNocm9uaXplIHRoZSBjb250cm9scyBhdG9taWNhbGx5LlxyXG4gICAgICB1cGRhdGluZ0NvbnRyb2xzID0gdHJ1ZTtcclxuICAgICAge1xyXG4gICAgICAgIHgxUHJvcGVydHkudmFsdWUgPSBsaW5lLngxO1xyXG4gICAgICAgIHkxUHJvcGVydHkudmFsdWUgPSBsaW5lLnkxO1xyXG4gICAgICAgIHJpc2VQcm9wZXJ0eS52YWx1ZSA9IG9wdGlvbnMuaW50ZXJhY3RpdmVTbG9wZSA/IGxpbmUucmlzZSA6IGxpbmUuZ2V0U2ltcGxpZmllZFJpc2UoKTtcclxuICAgICAgICBydW5Qcm9wZXJ0eS52YWx1ZSA9IG9wdGlvbnMuaW50ZXJhY3RpdmVTbG9wZSA/IGxpbmUucnVuIDogbGluZS5nZXRTaW1wbGlmaWVkUnVuKCk7XHJcbiAgICAgIH1cclxuICAgICAgdXBkYXRpbmdDb250cm9scyA9IGZhbHNlO1xyXG5cclxuICAgICAgLy8gRnVsbHktaW50ZXJhY3RpdmUgZXF1YXRpb25zIGhhdmUgYSBjb25zdGFudCBmb3JtLCBubyBuZWVkIHRvIHVwZGF0ZSBsYXlvdXQgd2hlbiBsaW5lIGNoYW5nZXMuXHJcbiAgICAgIGlmICggIWZ1bGx5SW50ZXJhY3RpdmUgKSB7IHVwZGF0ZUxheW91dCggbGluZSApOyB9XHJcbiAgICB9O1xyXG4gICAgbGluZVByb3BlcnR5LmxpbmsoIGxpbmVPYnNlcnZlciApOyAvLyB1bmxpbmsgaW4gZGlzcG9zZVxyXG5cclxuICAgIC8vIEZvciBmdWxseS1pbnRlcmFjdGl2ZSBlcXVhdGlvbnMgLi4uXHJcbiAgICBsZXQgdW5kZWZpbmVkU2xvcGVVcGRhdGVyOiAoIGxpbmU6IExpbmUgKSA9PiB2b2lkO1xyXG4gICAgaWYgKCBmdWxseUludGVyYWN0aXZlICkge1xyXG5cclxuICAgICAgLy8gdXBkYXRlIGxheW91dCBvbmNlXHJcbiAgICAgIHVwZGF0ZUxheW91dCggbGluZVByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgICAvLyBhZGQgdW5kZWZpbmVkU2xvcGVJbmRpY2F0b3JcclxuICAgICAgY29uc3QgdW5kZWZpbmVkU2xvcGVJbmRpY2F0b3IgPSBuZXcgVW5kZWZpbmVkU2xvcGVJbmRpY2F0b3IoIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0ICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHVuZGVmaW5lZFNsb3BlSW5kaWNhdG9yICk7XHJcbiAgICAgIHVuZGVmaW5lZFNsb3BlSW5kaWNhdG9yLmNlbnRlclggPSB0aGlzLmNlbnRlclg7XHJcbiAgICAgIHVuZGVmaW5lZFNsb3BlSW5kaWNhdG9yLmNlbnRlclkgPSBmcmFjdGlvbkxpbmVOb2RlLmNlbnRlclkgLSB0aGlzLnVuZGVmaW5lZFNsb3BlWUZ1ZGdlRmFjdG9yO1xyXG5cclxuICAgICAgdW5kZWZpbmVkU2xvcGVVcGRhdGVyID0gKCBsaW5lOiBMaW5lICkgPT4ge1xyXG4gICAgICAgIHVuZGVmaW5lZFNsb3BlSW5kaWNhdG9yLnZpc2libGUgPSBsaW5lLnVuZGVmaW5lZFNsb3BlKCk7XHJcbiAgICAgIH07XHJcbiAgICAgIGxpbmVQcm9wZXJ0eS5saW5rKCB1bmRlZmluZWRTbG9wZVVwZGF0ZXIgKTsgLy8gdW5saW5rIGluIGRpc3Bvc2VcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZVBvaW50U2xvcGVFcXVhdGlvbk5vZGUgPSAoKSA9PiB7XHJcbiAgICAgIHgxTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIHkxTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIHJpc2VOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgcnVuTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIE11bHRpbGluay51bm11bHRpbGluayggY29udHJvbHNNdWx0aWxpbmsgKTtcclxuICAgICAgbGluZVByb3BlcnR5LnVubGluayggbGluZU9ic2VydmVyICk7XHJcbiAgICAgIHVuZGVmaW5lZFNsb3BlVXBkYXRlciAmJiBsaW5lUHJvcGVydHkudW5saW5rKCB1bmRlZmluZWRTbG9wZVVwZGF0ZXIgKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZVBvaW50U2xvcGVFcXVhdGlvbk5vZGUoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBub2RlIHRoYXQgZGlzcGxheXMgdGhlIGdlbmVyYWwgZm9ybSBvZiB0aGlzIGVxdWF0aW9uOiAoeSAtIHkxKSA9IG0oeCAtIHgxKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlR2VuZXJhbEZvcm1Ob2RlKCk6IE5vZGUge1xyXG5cclxuICAgIC8vICh5IC0geTEpID0gbSh4IC0geDEpXHJcbiAgICBjb25zdCBzdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oXHJcbiAgICAgIGAoe3t5fX0gJHtNYXRoU3ltYm9scy5NSU5VU30ge3t5fX08c3ViPjE8L3N1Yj4pICR7TWF0aFN5bWJvbHMuRVFVQUxfVE99IHt7bX19KHt7eH19ICR7TWF0aFN5bWJvbHMuTUlOVVN9IHt7eH19PHN1Yj4xPC9zdWI+KWAsIHtcclxuICAgICAgICB5OiBHTFN5bWJvbHMueSxcclxuICAgICAgICBtOiBHTFN5bWJvbHMubSxcclxuICAgICAgICB4OiBHTFN5bWJvbHMueFxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBSaWNoVGV4dCggc3RyaW5nLCB7XHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDIwLCB3ZWlnaHQ6IEdMQ29uc3RhbnRzLkVRVUFUSU9OX0ZPTlRfV0VJR0hUIH0gKSxcclxuICAgICAgbWF4V2lkdGg6IDMwMFxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5vbi1pbnRlcmFjdGl2ZSBlcXVhdGlvbiwgdXNlZCB0byBsYWJlbCBhIGR5bmFtaWMgbGluZS5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUR5bmFtaWNMYWJlbCggbGluZVByb3BlcnR5OiBQcm9wZXJ0eTxMaW5lPiwgcHJvdmlkZWRPcHRpb25zPzogQ3JlYXRlRHluYW1pY0xhYmVsT3B0aW9ucyApOiBOb2RlIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gY29tYmluZU9wdGlvbnM8Q3JlYXRlRHluYW1pY0xhYmVsT3B0aW9ucz4oIHtcclxuICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG4gICAgICBpbnRlcmFjdGl2ZVBvaW50OiBmYWxzZSxcclxuICAgICAgaW50ZXJhY3RpdmVTbG9wZTogZmFsc2UsXHJcbiAgICAgIGZvbnRTaXplOiAxOCxcclxuICAgICAgbWF4V2lkdGg6IDIwMFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBQb2ludFNsb3BlRXF1YXRpb25Ob2RlKCBsaW5lUHJvcGVydHksIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmdyYXBoaW5nTGluZXMucmVnaXN0ZXIoICdQb2ludFNsb3BlRXF1YXRpb25Ob2RlJywgUG9pbnRTbG9wZUVxdWF0aW9uTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLGNBQWMsTUFBaUMsdUNBQXVDO0FBQzdGLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFFdEQsT0FBT0MsU0FBUyxJQUFJ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