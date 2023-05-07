// Copyright 2013-2023, University of Colorado Boulder

/**
 * Renderer for slope-intercept equations, with optional interactivity of slope and intercept.
 * General slope-intercept form is: y = mx + b
 *
 * Slope and/or intercept may be interactive.
 * Pickers are used to increment/decrement parts of the equation that are specified as being interactive.
 * Non-interactive parts of the equation are expressed in a form that is typical of how the equation
 * would normally be written.  For example, if the slope is -1, then only the sign is written, not '-1'.
 *
 * Note that both m and b may be improper fractions. b may be an improper fraction only if the y-intercept
 * is not interactive.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import MinusNode from '../../../../scenery-phet/js/MinusNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PlusNode from '../../../../scenery-phet/js/PlusNode.js';
import { Line as SceneryLine, RichText } from '../../../../scenery/js/imports.js';
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
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
export default class SlopeInterceptEquationNode extends EquationNode {
  constructor(lineProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      slopeUndefinedVisible: true,
      interactiveSlope: true,
      interactiveIntercept: true,
      riseRangeProperty: new Property(GLConstants.Y_AXIS_RANGE),
      runRangeProperty: new Property(GLConstants.X_AXIS_RANGE),
      yInterceptRangeProperty: new Property(GLConstants.Y_AXIS_RANGE),
      fontSize: GLConstants.INTERACTIVE_EQUATION_FONT_SIZE,
      staticColor: 'black'
    }, providedOptions);
    super(options); // call first, because super computes various layout metrics

    const fullyInteractive = options.interactiveSlope && options.interactiveIntercept;
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
    const riseProperty = new NumberProperty(lineProperty.value.rise, numberPropertyOptions);
    const runProperty = new NumberProperty(lineProperty.value.run, numberPropertyOptions);
    const yInterceptProperty = new NumberProperty(lineProperty.value.y1, numberPropertyOptions);
    const fractionalIntercept = lineProperty.value.getYIntercept();
    const yInterceptNumeratorProperty = new NumberProperty(fractionalIntercept.numerator, numberPropertyOptions);
    const yInterceptDenominatorProperty = new NumberProperty(fractionalIntercept.denominator, numberPropertyOptions);

    /*
     * Flag that allows us to update all controls atomically when the model changes.
     * When a picker's value changes, it results in the creation of a new Line.
     * So if you don't change the pickers atomically to match a new Line instance,
     * the new Line will be inadvertently replaced with an incorrect line.
     */
    let updatingControls = false;

    // Determine the max width of the rise and run pickers.
    const maxSlopePickerWidth = EquationNode.computeMaxSlopePickerWidth(options.riseRangeProperty, options.runRangeProperty, interactiveFont, this.decimalPlaces);

    // Nodes that appear in all possible forms of the equation: y = -(rise/run)x + -b
    const yNode = new RichText(GLSymbols.y, staticOptions);
    const equalsNode = new RichText(MathSymbols.EQUAL_TO, staticOptions);
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
    const slopeFractionLineNode = new SceneryLine(0, 0, maxSlopePickerWidth, 0, fractionLineOptions);
    const xNode = new RichText(GLSymbols.x, staticOptions);
    const plusNode = new PlusNode(combineOptions({
      size: this.operatorLineSize
    }, staticOptions));
    const minusNode = new MinusNode(combineOptions({
      size: this.operatorLineSize
    }, staticOptions));
    const yInterceptMinusSignNode = new MinusNode(combineOptions({
      size: this.signLineSize
    }, staticOptions));
    let yInterceptNumeratorNode; // also used for integer values
    if (options.interactiveIntercept) {
      yInterceptNumeratorNode = new NumberPicker(yInterceptProperty, options.yInterceptRangeProperty, combineOptions({}, GLConstants.NUMBER_PICKER_OPTIONS, {
        color: GLColors.INTERCEPT,
        font: interactiveFont
      }));
    } else {
      yInterceptNumeratorNode = new DynamicValueNode(yInterceptNumeratorProperty, combineOptions({
        absoluteValue: true
      }, staticOptions));
    }
    const yInterceptDenominatorNode = new DynamicValueNode(yInterceptDenominatorProperty, combineOptions({
      absoluteValue: true
    }, staticOptions));
    const yInterceptFractionLineNode = new SceneryLine(0, 0, maxSlopePickerWidth, 0, fractionLineOptions);
    const slopeUndefinedNode = new RichText('?', staticOptions);

    // add all nodes, we'll set which ones are visible bases on desired simplification
    this.children = [yNode, equalsNode, slopeMinusSignNode, riseNode, runNode, slopeFractionLineNode, xNode, plusNode, minusNode, yInterceptMinusSignNode, yInterceptNumeratorNode, yInterceptDenominatorNode, yInterceptFractionLineNode, slopeUndefinedNode];

    /*
     * Updates the layout to match the desired form of the equation.
     * This is based on which parts of the equation are interactive, and what the
     * non-interactive parts of the equation should look like when written in simplified form.
     */
    const updateLayout = line => {
      const interactive = options.interactiveSlope || options.interactiveIntercept;
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
      }

      // slope properties
      const slope = line.getSlope();
      const zeroSlope = slope === 0;
      const unitySlope = Math.abs(slope) === 1;
      const integerSlope = Number.isInteger(slope);
      const positiveSlope = slope > 0;
      const fractionalSlope = !zeroSlope && !unitySlope && !integerSlope;
      let lineWidth;

      // y =
      yNode.visible = equalsNode.visible = true;
      yNode.fill = equalsNode.fill = lineColor;
      equalsNode.left = yNode.right + this.relationalOperatorXSpacing;
      equalsNode.y = yNode.y;

      // Layout the 'mx' part of the equation.
      if (options.interactiveSlope) {
        // slope is interactive, will be displayed as a fraction

        // (rise/run)x
        riseNode.visible = runNode.visible = slopeFractionLineNode.visible = xNode.visible = true;
        slopeFractionLineNode.stroke = xNode.fill = lineColor;
        slopeFractionLineNode.left = equalsNode.right + this.relationalOperatorXSpacing;
        slopeFractionLineNode.centerY = equalsNode.centerY + this.fractionLineYFudgeFactor;
        riseNode.centerX = slopeFractionLineNode.centerX;
        riseNode.bottom = slopeFractionLineNode.top - this.pickersYSpacing;
        runNode.centerX = slopeFractionLineNode.centerX;
        runNode.top = slopeFractionLineNode.bottom + this.pickersYSpacing;
        xNode.left = slopeFractionLineNode.right + this.fractionalSlopeXSpacing;
        xNode.y = yNode.y;
      } else {
        // slope (rise/run) is not interactive, may be displayed as an integer or improper fraction
        const riseDynamicValueNode = riseNode;
        assert && assert(riseDynamicValueNode instanceof DynamicValueNode); // eslint-disable-line no-simple-type-checking-assertions
        const runDynamicValueNode = runNode;
        assert && assert(runDynamicValueNode instanceof DynamicValueNode); // eslint-disable-line no-simple-type-checking-assertions

        // decide whether to include the slope minus sign
        let previousNode;
        let previousXOffset;
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
          // rise/run x
          riseNode.visible = runNode.visible = slopeFractionLineNode.visible = xNode.visible = true;
          riseDynamicValueNode.fill = runDynamicValueNode.fill = slopeFractionLineNode.stroke = xNode.fill = lineColor;
          // adjust fraction line width
          lineWidth = Math.max(riseNode.width, runNode.width);
          slopeFractionLineNode.setLine(0, 0, lineWidth, 0);
          // layout
          slopeFractionLineNode.left = previousNode.right + previousXOffset;
          slopeFractionLineNode.centerY = equalsNode.centerY + this.fractionLineYFudgeFactor;
          riseNode.centerX = slopeFractionLineNode.centerX;
          riseNode.bottom = slopeFractionLineNode.top - this.ySpacing;
          runNode.centerX = slopeFractionLineNode.centerX;
          runNode.top = slopeFractionLineNode.bottom + this.ySpacing;
          xNode.left = slopeFractionLineNode.right + this.fractionalSlopeXSpacing;
          xNode.y = yNode.y;
        } else if (zeroSlope) {
          // no x term
        } else if (unitySlope) {
          // x
          xNode.visible = true;
          xNode.fill = lineColor;
          xNode.left = previousNode.right + previousXOffset;
          xNode.y = yNode.y;
        } else if (integerSlope) {
          // Nx
          riseNode.visible = xNode.visible = true;
          riseDynamicValueNode.fill = xNode.fill = lineColor;
          riseNode.left = previousNode.right + previousXOffset;
          riseNode.y = yNode.y;
          xNode.left = riseNode.right + this.integerSlopeXSpacing;
          xNode.y = yNode.y;
        } else {
          throw new Error('programming error, forgot to handle some slope case');
        }
      }

      // Layout the '+ b' part of the equation.
      if (options.interactiveIntercept) {
        // intercept is interactive and will be an integer
        if (zeroSlope && !options.interactiveSlope) {
          // y = b
          yInterceptNumeratorNode.visible = true;
          yInterceptNumeratorNode.left = equalsNode.right + this.relationalOperatorXSpacing;
          yInterceptNumeratorNode.centerY = yNode.centerY;
        } else {
          // y = (rise/run)x + b
          plusNode.visible = yInterceptNumeratorNode.visible = true;
          minusNode.visible = false;
          plusNode.fill = lineColor;
          plusNode.left = xNode.right + this.operatorXSpacing;
          plusNode.centerY = equalsNode.centerY + this.operatorYFudgeFactor;
          yInterceptNumeratorNode.left = plusNode.right + this.operatorXSpacing;
          yInterceptNumeratorNode.centerY = yNode.centerY;
        }
      } else {
        // intercept is not interactive and may be displayed as an integer or improper fraction
        const yInterceptNumeratorDynamicValueNode = yInterceptNumeratorNode;
        assert && assert(yInterceptNumeratorDynamicValueNode instanceof DynamicValueNode); // eslint-disable-line no-simple-type-checking-assertions

        // y-intercept properties
        const fractionalIntercept = line.getYIntercept();
        const zeroIntercept = fractionalIntercept.getValue() === 0;
        const integerIntercept = fractionalIntercept.isInteger();
        const positiveIntercept = fractionalIntercept.getValue() > 0;
        if (zeroIntercept) {
          if (zeroSlope && !options.interactiveSlope) {
            // y = 0
            yInterceptNumeratorDynamicValueNode.visible = true;
            yInterceptNumeratorDynamicValueNode.fill = lineColor;
            yInterceptNumeratorDynamicValueNode.left = equalsNode.right + this.relationalOperatorXSpacing;
            yInterceptNumeratorDynamicValueNode.centerY = yNode.centerY;
          } else {
            // no intercept
          }
        } else if (positiveIntercept && zeroSlope && !options.interactiveSlope) {
          // y = b
          yInterceptNumeratorDynamicValueNode.visible = true;
          yInterceptNumeratorDynamicValueNode.fill = lineColor;
          yInterceptNumeratorDynamicValueNode.left = equalsNode.right + this.relationalOperatorXSpacing;
          yInterceptNumeratorDynamicValueNode.centerY = yNode.centerY;
        } else if (!positiveIntercept && zeroSlope && !options.interactiveSlope) {
          // y = -b
          yInterceptMinusSignNode.visible = yInterceptNumeratorDynamicValueNode.visible = true;
          yInterceptMinusSignNode.fill = lineColor;
          yInterceptNumeratorDynamicValueNode.fill = lineColor;
          yInterceptMinusSignNode.left = equalsNode.right + this.relationalOperatorXSpacing;
          yInterceptMinusSignNode.centerY = equalsNode.centerY + this.operatorYFudgeFactor;
          yInterceptNumeratorDynamicValueNode.left = yInterceptMinusSignNode.right + this.integerSignXSpacing;
          yInterceptNumeratorDynamicValueNode.centerY = yNode.centerY;
        } else {
          // y = mx +/- b
          const operatorNode = positiveIntercept ? plusNode : minusNode;
          operatorNode.visible = true;
          operatorNode.fill = lineColor;
          operatorNode.left = xNode.right + this.operatorXSpacing;
          operatorNode.centerY = equalsNode.centerY + this.operatorYFudgeFactor;
          if (integerIntercept) {
            // b is an integer
            yInterceptNumeratorDynamicValueNode.visible = true;
            yInterceptNumeratorDynamicValueNode.fill = lineColor;
            yInterceptNumeratorDynamicValueNode.left = operatorNode.right + this.operatorXSpacing;
            yInterceptNumeratorDynamicValueNode.centerY = yNode.centerY;
          } else {
            // b is an improper fraction
            yInterceptNumeratorDynamicValueNode.visible = yInterceptDenominatorNode.visible = yInterceptFractionLineNode.visible = true;
            yInterceptNumeratorDynamicValueNode.fill = lineColor;
            yInterceptDenominatorNode.fill = yInterceptFractionLineNode.stroke = lineColor;
            // adjust fraction line width
            lineWidth = Math.max(yInterceptNumeratorDynamicValueNode.width, yInterceptDenominatorNode.width);
            yInterceptFractionLineNode.setLine(0, 0, lineWidth, 0);
            // layout
            yInterceptFractionLineNode.left = operatorNode.right + this.operatorXSpacing;
            yInterceptFractionLineNode.centerY = equalsNode.centerY + this.fractionLineYFudgeFactor;
            yInterceptNumeratorDynamicValueNode.centerX = yInterceptFractionLineNode.centerX;
            yInterceptNumeratorDynamicValueNode.bottom = yInterceptFractionLineNode.top - this.ySpacing;
            yInterceptDenominatorNode.centerX = yInterceptFractionLineNode.centerX;
            yInterceptDenominatorNode.top = yInterceptFractionLineNode.bottom + this.ySpacing;
          }
        }
      }
    };

    //***************************************************************

    // sync the model with the controls, unmultilink in dispose
    const controlsMultilink = Multilink.lazyMultilink([riseProperty, runProperty, yInterceptProperty], () => {
      if (!updatingControls) {
        if (options.interactiveIntercept) {
          lineProperty.value = Line.createSlopeIntercept(riseProperty.value, runProperty.value, yInterceptProperty.value, lineProperty.value.color);
        } else {
          const line = lineProperty.value;
          lineProperty.value = new Line(line.x1, line.y1, line.x1 + runProperty.value, line.y1 + riseProperty.value, lineProperty.value.color);
        }
      }
    });

    // sync the controls and layout with the model
    const lineObserver = line => {
      // If intercept is interactive, then (x1,y1) must be on a grid line on the y intercept.
      assert && assert(!options.interactiveIntercept || line.x1 === 0 && Number.isInteger(line.y1));

      // Synchronize the controls atomically.
      updatingControls = true;
      {
        riseProperty.value = options.interactiveSlope ? line.rise : line.getSimplifiedRise();
        runProperty.value = options.interactiveSlope ? line.run : line.getSimplifiedRun();
        if (options.interactiveIntercept) {
          yInterceptProperty.value = line.y1;
        } else {
          const fractionalIntercept = lineProperty.value.getYIntercept();
          yInterceptNumeratorProperty.value = fractionalIntercept.numerator;
          yInterceptDenominatorProperty.value = fractionalIntercept.denominator;
        }
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
      undefinedSlopeIndicator.centerY = slopeFractionLineNode.centerY - this.undefinedSlopeYFudgeFactor;
      undefinedSlopeUpdater = line => {
        undefinedSlopeIndicator.visible = line.undefinedSlope();
      };
      lineProperty.link(undefinedSlopeUpdater); // unlink in dispose
    }

    this.mutate(options);
    this.disposeSlopeInterceptEquationNode = () => {
      riseNode.dispose();
      runNode.dispose();
      yInterceptNumeratorNode.dispose();
      yInterceptDenominatorNode.dispose();
      Multilink.unmultilink(controlsMultilink);
      lineProperty.unlink(lineObserver);
      undefinedSlopeUpdater && lineProperty.unlink(undefinedSlopeUpdater);
    };
  }
  dispose() {
    this.disposeSlopeInterceptEquationNode();
    super.dispose();
  }

  /**
   * Creates a node that displays the general form of this equation: y = mx + b
   */
  static createGeneralFormNode() {
    // y = mx + b
    const string = StringUtils.fillIn(`{{y}} ${MathSymbols.EQUAL_TO} {{m}}{{x}} ${MathSymbols.PLUS} {{b}}`, {
      y: GLSymbols.y,
      m: GLSymbols.m,
      x: GLSymbols.x,
      b: GLSymbols.b
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
      interactiveSlope: false,
      interactiveIntercept: false,
      fontSize: 18,
      maxWidth: 200
    }, providedOptions);
    return new SlopeInterceptEquationNode(lineProperty, options);
  }
}
graphingLines.register('SlopeInterceptEquationNode', SlopeInterceptEquationNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiU3RyaW5nVXRpbHMiLCJNYXRoU3ltYm9scyIsIk1pbnVzTm9kZSIsIlBoZXRGb250IiwiUGx1c05vZGUiLCJMaW5lIiwiU2NlbmVyeUxpbmUiLCJSaWNoVGV4dCIsIk51bWJlclBpY2tlciIsIkdMQ29sb3JzIiwiR0xDb25zdGFudHMiLCJHTFN5bWJvbHMiLCJEeW5hbWljVmFsdWVOb2RlIiwiRXF1YXRpb25Ob2RlIiwiU2xvcGVQaWNrZXIiLCJVbmRlZmluZWRTbG9wZUluZGljYXRvciIsImdyYXBoaW5nTGluZXMiLCJHcmFwaGluZ0xpbmVzU3RyaW5ncyIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiU2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGUiLCJjb25zdHJ1Y3RvciIsImxpbmVQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJzbG9wZVVuZGVmaW5lZFZpc2libGUiLCJpbnRlcmFjdGl2ZVNsb3BlIiwiaW50ZXJhY3RpdmVJbnRlcmNlcHQiLCJyaXNlUmFuZ2VQcm9wZXJ0eSIsIllfQVhJU19SQU5HRSIsInJ1blJhbmdlUHJvcGVydHkiLCJYX0FYSVNfUkFOR0UiLCJ5SW50ZXJjZXB0UmFuZ2VQcm9wZXJ0eSIsImZvbnRTaXplIiwiSU5URVJBQ1RJVkVfRVFVQVRJT05fRk9OVF9TSVpFIiwic3RhdGljQ29sb3IiLCJmdWxseUludGVyYWN0aXZlIiwiaW50ZXJhY3RpdmVGb250Iiwic2l6ZSIsIndlaWdodCIsIkVRVUFUSU9OX0ZPTlRfV0VJR0hUIiwic3RhdGljRm9udCIsInN0YXRpY09wdGlvbnMiLCJmb250IiwiZmlsbCIsImZyYWN0aW9uTGluZU9wdGlvbnMiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJmcmFjdGlvbkxpbmVUaGlja25lc3MiLCJudW1iZXJQcm9wZXJ0eU9wdGlvbnMiLCJudW1iZXJUeXBlIiwicmlzZVByb3BlcnR5IiwidmFsdWUiLCJyaXNlIiwicnVuUHJvcGVydHkiLCJydW4iLCJ5SW50ZXJjZXB0UHJvcGVydHkiLCJ5MSIsImZyYWN0aW9uYWxJbnRlcmNlcHQiLCJnZXRZSW50ZXJjZXB0IiwieUludGVyY2VwdE51bWVyYXRvclByb3BlcnR5IiwibnVtZXJhdG9yIiwieUludGVyY2VwdERlbm9taW5hdG9yUHJvcGVydHkiLCJkZW5vbWluYXRvciIsInVwZGF0aW5nQ29udHJvbHMiLCJtYXhTbG9wZVBpY2tlcldpZHRoIiwiY29tcHV0ZU1heFNsb3BlUGlja2VyV2lkdGgiLCJkZWNpbWFsUGxhY2VzIiwieU5vZGUiLCJ5IiwiZXF1YWxzTm9kZSIsIkVRVUFMX1RPIiwic2xvcGVNaW51c1NpZ25Ob2RlIiwic2lnbkxpbmVTaXplIiwicmlzZU5vZGUiLCJydW5Ob2RlIiwiYWJzb2x1dGVWYWx1ZSIsInNsb3BlRnJhY3Rpb25MaW5lTm9kZSIsInhOb2RlIiwieCIsInBsdXNOb2RlIiwib3BlcmF0b3JMaW5lU2l6ZSIsIm1pbnVzTm9kZSIsInlJbnRlcmNlcHRNaW51c1NpZ25Ob2RlIiwieUludGVyY2VwdE51bWVyYXRvck5vZGUiLCJOVU1CRVJfUElDS0VSX09QVElPTlMiLCJjb2xvciIsIklOVEVSQ0VQVCIsInlJbnRlcmNlcHREZW5vbWluYXRvck5vZGUiLCJ5SW50ZXJjZXB0RnJhY3Rpb25MaW5lTm9kZSIsInNsb3BlVW5kZWZpbmVkTm9kZSIsImNoaWxkcmVuIiwidXBkYXRlTGF5b3V0IiwibGluZSIsImludGVyYWN0aXZlIiwibGluZUNvbG9yIiwibGVuIiwibGVuZ3RoIiwiaSIsInZpc2libGUiLCJzdHJpbmciLCJ1bmRlZmluZWRTbG9wZSIsImZvcm1hdCIsInNsb3BlVW5kZWZpbmVkIiwieDEiLCJmaWxsSW4iLCJzbG9wZSIsImdldFNsb3BlIiwiemVyb1Nsb3BlIiwidW5pdHlTbG9wZSIsIk1hdGgiLCJhYnMiLCJpbnRlZ2VyU2xvcGUiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJwb3NpdGl2ZVNsb3BlIiwiZnJhY3Rpb25hbFNsb3BlIiwibGVmdCIsInJpZ2h0IiwicmVsYXRpb25hbE9wZXJhdG9yWFNwYWNpbmciLCJjZW50ZXJZIiwiZnJhY3Rpb25MaW5lWUZ1ZGdlRmFjdG9yIiwiY2VudGVyWCIsImJvdHRvbSIsInRvcCIsInBpY2tlcnNZU3BhY2luZyIsImZyYWN0aW9uYWxTbG9wZVhTcGFjaW5nIiwicmlzZUR5bmFtaWNWYWx1ZU5vZGUiLCJhc3NlcnQiLCJydW5EeW5hbWljVmFsdWVOb2RlIiwicHJldmlvdXNOb2RlIiwicHJldmlvdXNYT2Zmc2V0Iiwic2xvcGVTaWduWUZ1ZGdlRmFjdG9yIiwic2xvcGVTaWduWU9mZnNldCIsImZyYWN0aW9uU2lnblhTcGFjaW5nIiwiaW50ZWdlclNpZ25YU3BhY2luZyIsIm1heCIsIndpZHRoIiwic2V0TGluZSIsInlTcGFjaW5nIiwiaW50ZWdlclNsb3BlWFNwYWNpbmciLCJFcnJvciIsIm9wZXJhdG9yWFNwYWNpbmciLCJvcGVyYXRvcllGdWRnZUZhY3RvciIsInlJbnRlcmNlcHROdW1lcmF0b3JEeW5hbWljVmFsdWVOb2RlIiwiemVyb0ludGVyY2VwdCIsImdldFZhbHVlIiwiaW50ZWdlckludGVyY2VwdCIsInBvc2l0aXZlSW50ZXJjZXB0Iiwib3BlcmF0b3JOb2RlIiwiY29udHJvbHNNdWx0aWxpbmsiLCJsYXp5TXVsdGlsaW5rIiwiY3JlYXRlU2xvcGVJbnRlcmNlcHQiLCJsaW5lT2JzZXJ2ZXIiLCJnZXRTaW1wbGlmaWVkUmlzZSIsImdldFNpbXBsaWZpZWRSdW4iLCJsaW5rIiwidW5kZWZpbmVkU2xvcGVVcGRhdGVyIiwidW5kZWZpbmVkU2xvcGVJbmRpY2F0b3IiLCJoZWlnaHQiLCJhZGRDaGlsZCIsInVuZGVmaW5lZFNsb3BlWUZ1ZGdlRmFjdG9yIiwibXV0YXRlIiwiZGlzcG9zZVNsb3BlSW50ZXJjZXB0RXF1YXRpb25Ob2RlIiwiZGlzcG9zZSIsInVubXVsdGlsaW5rIiwidW5saW5rIiwiY3JlYXRlR2VuZXJhbEZvcm1Ob2RlIiwiUExVUyIsIm0iLCJiIiwicGlja2FibGUiLCJtYXhXaWR0aCIsImNyZWF0ZUR5bmFtaWNMYWJlbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmVuZGVyZXIgZm9yIHNsb3BlLWludGVyY2VwdCBlcXVhdGlvbnMsIHdpdGggb3B0aW9uYWwgaW50ZXJhY3Rpdml0eSBvZiBzbG9wZSBhbmQgaW50ZXJjZXB0LlxyXG4gKiBHZW5lcmFsIHNsb3BlLWludGVyY2VwdCBmb3JtIGlzOiB5ID0gbXggKyBiXHJcbiAqXHJcbiAqIFNsb3BlIGFuZC9vciBpbnRlcmNlcHQgbWF5IGJlIGludGVyYWN0aXZlLlxyXG4gKiBQaWNrZXJzIGFyZSB1c2VkIHRvIGluY3JlbWVudC9kZWNyZW1lbnQgcGFydHMgb2YgdGhlIGVxdWF0aW9uIHRoYXQgYXJlIHNwZWNpZmllZCBhcyBiZWluZyBpbnRlcmFjdGl2ZS5cclxuICogTm9uLWludGVyYWN0aXZlIHBhcnRzIG9mIHRoZSBlcXVhdGlvbiBhcmUgZXhwcmVzc2VkIGluIGEgZm9ybSB0aGF0IGlzIHR5cGljYWwgb2YgaG93IHRoZSBlcXVhdGlvblxyXG4gKiB3b3VsZCBub3JtYWxseSBiZSB3cml0dGVuLiAgRm9yIGV4YW1wbGUsIGlmIHRoZSBzbG9wZSBpcyAtMSwgdGhlbiBvbmx5IHRoZSBzaWduIGlzIHdyaXR0ZW4sIG5vdCAnLTEnLlxyXG4gKlxyXG4gKiBOb3RlIHRoYXQgYm90aCBtIGFuZCBiIG1heSBiZSBpbXByb3BlciBmcmFjdGlvbnMuIGIgbWF5IGJlIGFuIGltcHJvcGVyIGZyYWN0aW9uIG9ubHkgaWYgdGhlIHktaW50ZXJjZXB0XHJcbiAqIGlzIG5vdCBpbnRlcmFjdGl2ZS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSwgeyBOdW1iZXJQcm9wZXJ0eU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IE1hdGhTeW1ib2xzIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRoU3ltYm9scy5qcyc7XHJcbmltcG9ydCBNaW51c05vZGUsIHsgTWludXNOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NaW51c05vZGUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IFBsdXNOb2RlLCB7IFBsdXNOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QbHVzTm9kZS5qcyc7XHJcbmltcG9ydCB7IExpbmUgYXMgU2NlbmVyeUxpbmUsIE5vZGUsIFJpY2hUZXh0LCBUQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTnVtYmVyUGlja2VyLCB7IE51bWJlclBpY2tlck9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvTnVtYmVyUGlja2VyLmpzJztcclxuaW1wb3J0IEdMQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9HTENvbG9ycy5qcyc7XHJcbmltcG9ydCBHTENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vR0xDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgR0xTeW1ib2xzIGZyb20gJy4uLy4uL2NvbW1vbi9HTFN5bWJvbHMuanMnO1xyXG5pbXBvcnQgTGluZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvTGluZS5qcyc7XHJcbmltcG9ydCBEeW5hbWljVmFsdWVOb2RlLCB7IER5bmFtaWNWYWx1ZU5vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRHluYW1pY1ZhbHVlTm9kZS5qcyc7XHJcbmltcG9ydCBFcXVhdGlvbk5vZGUsIHsgRXF1YXRpb25Ob2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0VxdWF0aW9uTm9kZS5qcyc7XHJcbmltcG9ydCBTbG9wZVBpY2tlciBmcm9tICcuLi8uLi9jb21tb24vdmlldy9waWNrZXIvU2xvcGVQaWNrZXIuanMnO1xyXG5pbXBvcnQgVW5kZWZpbmVkU2xvcGVJbmRpY2F0b3IgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvVW5kZWZpbmVkU2xvcGVJbmRpY2F0b3IuanMnO1xyXG5pbXBvcnQgZ3JhcGhpbmdMaW5lcyBmcm9tICcuLi8uLi9ncmFwaGluZ0xpbmVzLmpzJztcclxuaW1wb3J0IEdyYXBoaW5nTGluZXNTdHJpbmdzIGZyb20gJy4uLy4uL0dyYXBoaW5nTGluZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgeyBDcmVhdGVEeW5hbWljTGFiZWxPcHRpb25zIH0gZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvTGluZU5vZGUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gV2hldGhlciB0byBzaG93ICdzbG9wZSB1bmRlZmluZWQnIGFmdGVyIG5vbi1pbnRlcmFjdGl2ZSBlcXVhdGlvbnMgd2l0aCB1bmRlZmluZWQgc2xvcGVcclxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXBoaW5nLXNsb3BlLWludGVyY2VwdC9pc3N1ZXMvN1xyXG4gIHNsb3BlVW5kZWZpbmVkVmlzaWJsZT86IGJvb2xlYW47XHJcblxyXG4gIC8vIGNvbXBvbmVudHMgdGhhdCBjYW4gYmUgaW50ZXJhY3RpdmVcclxuICBpbnRlcmFjdGl2ZVNsb3BlPzogYm9vbGVhbjtcclxuICBpbnRlcmFjdGl2ZUludGVyY2VwdD86IGJvb2xlYW47XHJcblxyXG4gIC8vIGR5bmFtaWMgcmFuZ2Ugb2YgY29tcG9uZW50c1xyXG4gIHJpc2VSYW5nZVByb3BlcnR5PzogUHJvcGVydHk8UmFuZ2U+O1xyXG4gIHJ1blJhbmdlUHJvcGVydHk/OiBQcm9wZXJ0eTxSYW5nZT47XHJcbiAgeUludGVyY2VwdFJhbmdlUHJvcGVydHk/OiBQcm9wZXJ0eTxSYW5nZT47XHJcblxyXG4gIC8vIHN0eWxlXHJcbiAgZm9udFNpemU/OiBudW1iZXI7XHJcbiAgc3RhdGljQ29sb3I/OiBUQ29sb3I7XHJcbn07XHJcblxyXG50eXBlIFNsb3BlSW50ZXJjZXB0RXF1YXRpb25Ob2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgRXF1YXRpb25Ob2RlT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNsb3BlSW50ZXJjZXB0RXF1YXRpb25Ob2RlIGV4dGVuZHMgRXF1YXRpb25Ob2RlIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlU2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGU6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGluZVByb3BlcnR5OiBQcm9wZXJ0eTxMaW5lPiwgcHJvdmlkZWRPcHRpb25zPzogU2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgRXF1YXRpb25Ob2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgc2xvcGVVbmRlZmluZWRWaXNpYmxlOiB0cnVlLFxyXG4gICAgICBpbnRlcmFjdGl2ZVNsb3BlOiB0cnVlLFxyXG4gICAgICBpbnRlcmFjdGl2ZUludGVyY2VwdDogdHJ1ZSxcclxuICAgICAgcmlzZVJhbmdlUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggR0xDb25zdGFudHMuWV9BWElTX1JBTkdFICksXHJcbiAgICAgIHJ1blJhbmdlUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggR0xDb25zdGFudHMuWF9BWElTX1JBTkdFICksXHJcbiAgICAgIHlJbnRlcmNlcHRSYW5nZVByb3BlcnR5OiBuZXcgUHJvcGVydHkoIEdMQ29uc3RhbnRzLllfQVhJU19SQU5HRSApLFxyXG4gICAgICBmb250U2l6ZTogR0xDb25zdGFudHMuSU5URVJBQ1RJVkVfRVFVQVRJT05fRk9OVF9TSVpFLFxyXG4gICAgICBzdGF0aWNDb2xvcjogJ2JsYWNrJ1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTsgLy8gY2FsbCBmaXJzdCwgYmVjYXVzZSBzdXBlciBjb21wdXRlcyB2YXJpb3VzIGxheW91dCBtZXRyaWNzXHJcblxyXG4gICAgY29uc3QgZnVsbHlJbnRlcmFjdGl2ZSA9ICggb3B0aW9ucy5pbnRlcmFjdGl2ZVNsb3BlICYmIG9wdGlvbnMuaW50ZXJhY3RpdmVJbnRlcmNlcHQgKTtcclxuICAgIGNvbnN0IGludGVyYWN0aXZlRm9udCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiBvcHRpb25zLmZvbnRTaXplLCB3ZWlnaHQ6IEdMQ29uc3RhbnRzLkVRVUFUSU9OX0ZPTlRfV0VJR0hUIH0gKTtcclxuICAgIGNvbnN0IHN0YXRpY0ZvbnQgPSBuZXcgUGhldEZvbnQoIHsgc2l6ZTogb3B0aW9ucy5mb250U2l6ZSwgd2VpZ2h0OiBHTENvbnN0YW50cy5FUVVBVElPTl9GT05UX1dFSUdIVCB9ICk7XHJcbiAgICBjb25zdCBzdGF0aWNPcHRpb25zID0geyBmb250OiBzdGF0aWNGb250LCBmaWxsOiBvcHRpb25zLnN0YXRpY0NvbG9yIH07XHJcbiAgICBjb25zdCBmcmFjdGlvbkxpbmVPcHRpb25zID0geyBzdHJva2U6IG9wdGlvbnMuc3RhdGljQ29sb3IsIGxpbmVXaWR0aDogdGhpcy5mcmFjdGlvbkxpbmVUaGlja25lc3MgfTtcclxuXHJcbiAgICBjb25zdCBudW1iZXJQcm9wZXJ0eU9wdGlvbnM6IE51bWJlclByb3BlcnR5T3B0aW9ucyA9IHtcclxuICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGludGVybmFsIFByb3BlcnRpZXMgdGhhdCBhcmUgY29ubmVjdGVkIHRvIHBpY2tlcnNcclxuICAgIGNvbnN0IHJpc2VQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggbGluZVByb3BlcnR5LnZhbHVlLnJpc2UsIG51bWJlclByb3BlcnR5T3B0aW9ucyApO1xyXG4gICAgY29uc3QgcnVuUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIGxpbmVQcm9wZXJ0eS52YWx1ZS5ydW4sIG51bWJlclByb3BlcnR5T3B0aW9ucyApO1xyXG4gICAgY29uc3QgeUludGVyY2VwdFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBsaW5lUHJvcGVydHkudmFsdWUueTEsIG51bWJlclByb3BlcnR5T3B0aW9ucyApO1xyXG4gICAgY29uc3QgZnJhY3Rpb25hbEludGVyY2VwdCA9IGxpbmVQcm9wZXJ0eS52YWx1ZS5nZXRZSW50ZXJjZXB0KCk7XHJcbiAgICBjb25zdCB5SW50ZXJjZXB0TnVtZXJhdG9yUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIGZyYWN0aW9uYWxJbnRlcmNlcHQubnVtZXJhdG9yLCBudW1iZXJQcm9wZXJ0eU9wdGlvbnMgKTtcclxuICAgIGNvbnN0IHlJbnRlcmNlcHREZW5vbWluYXRvclByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBmcmFjdGlvbmFsSW50ZXJjZXB0LmRlbm9taW5hdG9yLCBudW1iZXJQcm9wZXJ0eU9wdGlvbnMgKTtcclxuXHJcbiAgICAvKlxyXG4gICAgICogRmxhZyB0aGF0IGFsbG93cyB1cyB0byB1cGRhdGUgYWxsIGNvbnRyb2xzIGF0b21pY2FsbHkgd2hlbiB0aGUgbW9kZWwgY2hhbmdlcy5cclxuICAgICAqIFdoZW4gYSBwaWNrZXIncyB2YWx1ZSBjaGFuZ2VzLCBpdCByZXN1bHRzIGluIHRoZSBjcmVhdGlvbiBvZiBhIG5ldyBMaW5lLlxyXG4gICAgICogU28gaWYgeW91IGRvbid0IGNoYW5nZSB0aGUgcGlja2VycyBhdG9taWNhbGx5IHRvIG1hdGNoIGEgbmV3IExpbmUgaW5zdGFuY2UsXHJcbiAgICAgKiB0aGUgbmV3IExpbmUgd2lsbCBiZSBpbmFkdmVydGVudGx5IHJlcGxhY2VkIHdpdGggYW4gaW5jb3JyZWN0IGxpbmUuXHJcbiAgICAgKi9cclxuICAgIGxldCB1cGRhdGluZ0NvbnRyb2xzID0gZmFsc2U7XHJcblxyXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBtYXggd2lkdGggb2YgdGhlIHJpc2UgYW5kIHJ1biBwaWNrZXJzLlxyXG4gICAgY29uc3QgbWF4U2xvcGVQaWNrZXJXaWR0aCA9IEVxdWF0aW9uTm9kZS5jb21wdXRlTWF4U2xvcGVQaWNrZXJXaWR0aCggb3B0aW9ucy5yaXNlUmFuZ2VQcm9wZXJ0eSxcclxuICAgICAgb3B0aW9ucy5ydW5SYW5nZVByb3BlcnR5LCBpbnRlcmFjdGl2ZUZvbnQsIHRoaXMuZGVjaW1hbFBsYWNlcyApO1xyXG5cclxuICAgIC8vIE5vZGVzIHRoYXQgYXBwZWFyIGluIGFsbCBwb3NzaWJsZSBmb3JtcyBvZiB0aGUgZXF1YXRpb246IHkgPSAtKHJpc2UvcnVuKXggKyAtYlxyXG4gICAgY29uc3QgeU5vZGUgPSBuZXcgUmljaFRleHQoIEdMU3ltYm9scy55LCBzdGF0aWNPcHRpb25zICk7XHJcbiAgICBjb25zdCBlcXVhbHNOb2RlID0gbmV3IFJpY2hUZXh0KCBNYXRoU3ltYm9scy5FUVVBTF9UTywgc3RhdGljT3B0aW9ucyApO1xyXG4gICAgY29uc3Qgc2xvcGVNaW51c1NpZ25Ob2RlID0gbmV3IE1pbnVzTm9kZSggY29tYmluZU9wdGlvbnM8TWludXNOb2RlT3B0aW9ucz4oIHtcclxuICAgICAgc2l6ZTogdGhpcy5zaWduTGluZVNpemVcclxuICAgIH0sIHN0YXRpY09wdGlvbnMgKSApO1xyXG4gICAgbGV0IHJpc2VOb2RlOiBTbG9wZVBpY2tlciB8IER5bmFtaWNWYWx1ZU5vZGU7XHJcbiAgICBsZXQgcnVuTm9kZTogU2xvcGVQaWNrZXIgfCBEeW5hbWljVmFsdWVOb2RlO1xyXG4gICAgaWYgKCBvcHRpb25zLmludGVyYWN0aXZlU2xvcGUgKSB7XHJcbiAgICAgIHJpc2VOb2RlID0gbmV3IFNsb3BlUGlja2VyKCByaXNlUHJvcGVydHksIHJ1blByb3BlcnR5LCBvcHRpb25zLnJpc2VSYW5nZVByb3BlcnR5LCB7IGZvbnQ6IGludGVyYWN0aXZlRm9udCB9ICk7XHJcbiAgICAgIHJ1bk5vZGUgPSBuZXcgU2xvcGVQaWNrZXIoIHJ1blByb3BlcnR5LCByaXNlUHJvcGVydHksIG9wdGlvbnMucnVuUmFuZ2VQcm9wZXJ0eSwgeyBmb250OiBpbnRlcmFjdGl2ZUZvbnQgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJpc2VOb2RlID0gbmV3IER5bmFtaWNWYWx1ZU5vZGUoIHJpc2VQcm9wZXJ0eSwgY29tYmluZU9wdGlvbnM8RHluYW1pY1ZhbHVlTm9kZU9wdGlvbnM+KCB7XHJcbiAgICAgICAgYWJzb2x1dGVWYWx1ZTogdHJ1ZVxyXG4gICAgICB9LCBzdGF0aWNPcHRpb25zICkgKTtcclxuICAgICAgcnVuTm9kZSA9IG5ldyBEeW5hbWljVmFsdWVOb2RlKCBydW5Qcm9wZXJ0eSwgY29tYmluZU9wdGlvbnM8RHluYW1pY1ZhbHVlTm9kZU9wdGlvbnM+KCB7XHJcbiAgICAgICAgYWJzb2x1dGVWYWx1ZTogdHJ1ZVxyXG4gICAgICB9LCBzdGF0aWNPcHRpb25zICkgKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHNsb3BlRnJhY3Rpb25MaW5lTm9kZSA9IG5ldyBTY2VuZXJ5TGluZSggMCwgMCwgbWF4U2xvcGVQaWNrZXJXaWR0aCwgMCwgZnJhY3Rpb25MaW5lT3B0aW9ucyApO1xyXG4gICAgY29uc3QgeE5vZGUgPSBuZXcgUmljaFRleHQoIEdMU3ltYm9scy54LCBzdGF0aWNPcHRpb25zICk7XHJcbiAgICBjb25zdCBwbHVzTm9kZSA9IG5ldyBQbHVzTm9kZSggY29tYmluZU9wdGlvbnM8UGx1c05vZGVPcHRpb25zPigge1xyXG4gICAgICBzaXplOiB0aGlzLm9wZXJhdG9yTGluZVNpemVcclxuICAgIH0sIHN0YXRpY09wdGlvbnMgKSApO1xyXG4gICAgY29uc3QgbWludXNOb2RlID0gbmV3IE1pbnVzTm9kZSggY29tYmluZU9wdGlvbnM8TWludXNOb2RlT3B0aW9ucz4oIHtcclxuICAgICAgc2l6ZTogdGhpcy5vcGVyYXRvckxpbmVTaXplXHJcbiAgICB9LCBzdGF0aWNPcHRpb25zICkgKTtcclxuICAgIGNvbnN0IHlJbnRlcmNlcHRNaW51c1NpZ25Ob2RlID0gbmV3IE1pbnVzTm9kZSggY29tYmluZU9wdGlvbnM8TWludXNOb2RlT3B0aW9ucz4oIHtcclxuICAgICAgc2l6ZTogdGhpcy5zaWduTGluZVNpemVcclxuICAgIH0sIHN0YXRpY09wdGlvbnMgKSApO1xyXG4gICAgbGV0IHlJbnRlcmNlcHROdW1lcmF0b3JOb2RlOiBOdW1iZXJQaWNrZXIgfCBEeW5hbWljVmFsdWVOb2RlOyAvLyBhbHNvIHVzZWQgZm9yIGludGVnZXIgdmFsdWVzXHJcbiAgICBpZiAoIG9wdGlvbnMuaW50ZXJhY3RpdmVJbnRlcmNlcHQgKSB7XHJcbiAgICAgIHlJbnRlcmNlcHROdW1lcmF0b3JOb2RlID0gbmV3IE51bWJlclBpY2tlciggeUludGVyY2VwdFByb3BlcnR5LCBvcHRpb25zLnlJbnRlcmNlcHRSYW5nZVByb3BlcnR5LFxyXG4gICAgICAgIGNvbWJpbmVPcHRpb25zPE51bWJlclBpY2tlck9wdGlvbnM+KCB7fSwgR0xDb25zdGFudHMuTlVNQkVSX1BJQ0tFUl9PUFRJT05TLCB7XHJcbiAgICAgICAgICBjb2xvcjogR0xDb2xvcnMuSU5URVJDRVBULFxyXG4gICAgICAgICAgZm9udDogaW50ZXJhY3RpdmVGb250XHJcbiAgICAgICAgfSApICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgeUludGVyY2VwdE51bWVyYXRvck5vZGUgPSBuZXcgRHluYW1pY1ZhbHVlTm9kZSggeUludGVyY2VwdE51bWVyYXRvclByb3BlcnR5LFxyXG4gICAgICAgIGNvbWJpbmVPcHRpb25zPER5bmFtaWNWYWx1ZU5vZGVPcHRpb25zPigge1xyXG4gICAgICAgICAgYWJzb2x1dGVWYWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sIHN0YXRpY09wdGlvbnMgKSApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgeUludGVyY2VwdERlbm9taW5hdG9yTm9kZSA9IG5ldyBEeW5hbWljVmFsdWVOb2RlKCB5SW50ZXJjZXB0RGVub21pbmF0b3JQcm9wZXJ0eSxcclxuICAgICAgY29tYmluZU9wdGlvbnM8RHluYW1pY1ZhbHVlTm9kZU9wdGlvbnM+KCB7XHJcbiAgICAgICAgYWJzb2x1dGVWYWx1ZTogdHJ1ZVxyXG4gICAgICB9LCBzdGF0aWNPcHRpb25zICkgKTtcclxuICAgIGNvbnN0IHlJbnRlcmNlcHRGcmFjdGlvbkxpbmVOb2RlID0gbmV3IFNjZW5lcnlMaW5lKCAwLCAwLCBtYXhTbG9wZVBpY2tlcldpZHRoLCAwLCBmcmFjdGlvbkxpbmVPcHRpb25zICk7XHJcbiAgICBjb25zdCBzbG9wZVVuZGVmaW5lZE5vZGUgPSBuZXcgUmljaFRleHQoICc/Jywgc3RhdGljT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGFkZCBhbGwgbm9kZXMsIHdlJ2xsIHNldCB3aGljaCBvbmVzIGFyZSB2aXNpYmxlIGJhc2VzIG9uIGRlc2lyZWQgc2ltcGxpZmljYXRpb25cclxuICAgIHRoaXMuY2hpbGRyZW4gPSBbIHlOb2RlLCBlcXVhbHNOb2RlLCBzbG9wZU1pbnVzU2lnbk5vZGUsIHJpc2VOb2RlLCBydW5Ob2RlLCBzbG9wZUZyYWN0aW9uTGluZU5vZGUsIHhOb2RlLCBwbHVzTm9kZSwgbWludXNOb2RlLFxyXG4gICAgICB5SW50ZXJjZXB0TWludXNTaWduTm9kZSwgeUludGVyY2VwdE51bWVyYXRvck5vZGUsIHlJbnRlcmNlcHREZW5vbWluYXRvck5vZGUsIHlJbnRlcmNlcHRGcmFjdGlvbkxpbmVOb2RlLCBzbG9wZVVuZGVmaW5lZE5vZGUgXTtcclxuXHJcbiAgICAvKlxyXG4gICAgICogVXBkYXRlcyB0aGUgbGF5b3V0IHRvIG1hdGNoIHRoZSBkZXNpcmVkIGZvcm0gb2YgdGhlIGVxdWF0aW9uLlxyXG4gICAgICogVGhpcyBpcyBiYXNlZCBvbiB3aGljaCBwYXJ0cyBvZiB0aGUgZXF1YXRpb24gYXJlIGludGVyYWN0aXZlLCBhbmQgd2hhdCB0aGVcclxuICAgICAqIG5vbi1pbnRlcmFjdGl2ZSBwYXJ0cyBvZiB0aGUgZXF1YXRpb24gc2hvdWxkIGxvb2sgbGlrZSB3aGVuIHdyaXR0ZW4gaW4gc2ltcGxpZmllZCBmb3JtLlxyXG4gICAgICovXHJcbiAgICBjb25zdCB1cGRhdGVMYXlvdXQgPSAoIGxpbmU6IExpbmUgKSA9PiB7XHJcblxyXG4gICAgICBjb25zdCBpbnRlcmFjdGl2ZSA9ICggb3B0aW9ucy5pbnRlcmFjdGl2ZVNsb3BlIHx8IG9wdGlvbnMuaW50ZXJhY3RpdmVJbnRlcmNlcHQgKTtcclxuICAgICAgY29uc3QgbGluZUNvbG9yID0gbGluZS5jb2xvcjtcclxuXHJcbiAgICAgIC8vIFN0YXJ0IHdpdGggYWxsIGNoaWxkcmVuIGludmlzaWJsZSBhbmQgYXQgeD0wLlxyXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXBoaW5nLWxpbmVzL2lzc3Vlcy8xMjBcclxuICAgICAgY29uc3QgbGVuID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbjsgaSsrICkge1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW5bIGkgXS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlblsgaSBdLnggPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIHNsb3BlVW5kZWZpbmVkTm9kZS5zdHJpbmcgPSAnJzsgLy8gd29ya2Fyb3VuZCBmb3IgIzExNCBhbmQgIzExN1xyXG5cclxuICAgICAgaWYgKCBsaW5lLnVuZGVmaW5lZFNsb3BlKCkgJiYgIWludGVyYWN0aXZlICkge1xyXG4gICAgICAgIC8vIHNsb3BlIGlzIHVuZGVmaW5lZCBhbmQgbm90aGluZyBpcyBpbnRlcmFjdGl2ZVxyXG4gICAgICAgIHNsb3BlVW5kZWZpbmVkTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICBzbG9wZVVuZGVmaW5lZE5vZGUuZmlsbCA9IGxpbmVDb2xvcjtcclxuICAgICAgICBzbG9wZVVuZGVmaW5lZE5vZGUuc3RyaW5nID0gKCBvcHRpb25zLnNsb3BlVW5kZWZpbmVkVmlzaWJsZSApID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RyaW5nVXRpbHMuZm9ybWF0KCBHcmFwaGluZ0xpbmVzU3RyaW5ncy5zbG9wZVVuZGVmaW5lZCwgR0xTeW1ib2xzLngsIGxpbmUueDEgKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0cmluZ1V0aWxzLmZpbGxJbiggYHt7eH19ICR7TWF0aFN5bWJvbHMuRVFVQUxfVE99IHt7dmFsdWV9fWAsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBHTFN5bWJvbHMueCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbGluZS54MVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBzbG9wZSBwcm9wZXJ0aWVzXHJcbiAgICAgIGNvbnN0IHNsb3BlID0gbGluZS5nZXRTbG9wZSgpO1xyXG4gICAgICBjb25zdCB6ZXJvU2xvcGUgPSAoIHNsb3BlID09PSAwICk7XHJcbiAgICAgIGNvbnN0IHVuaXR5U2xvcGUgPSAoIE1hdGguYWJzKCBzbG9wZSApID09PSAxICk7XHJcbiAgICAgIGNvbnN0IGludGVnZXJTbG9wZSA9IE51bWJlci5pc0ludGVnZXIoIHNsb3BlICk7XHJcbiAgICAgIGNvbnN0IHBvc2l0aXZlU2xvcGUgPSAoIHNsb3BlID4gMCApO1xyXG4gICAgICBjb25zdCBmcmFjdGlvbmFsU2xvcGUgPSAoICF6ZXJvU2xvcGUgJiYgIXVuaXR5U2xvcGUgJiYgIWludGVnZXJTbG9wZSApO1xyXG5cclxuICAgICAgbGV0IGxpbmVXaWR0aDtcclxuXHJcbiAgICAgIC8vIHkgPVxyXG4gICAgICB5Tm9kZS52aXNpYmxlID0gZXF1YWxzTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgeU5vZGUuZmlsbCA9IGVxdWFsc05vZGUuZmlsbCA9IGxpbmVDb2xvcjtcclxuICAgICAgZXF1YWxzTm9kZS5sZWZ0ID0geU5vZGUucmlnaHQgKyB0aGlzLnJlbGF0aW9uYWxPcGVyYXRvclhTcGFjaW5nO1xyXG4gICAgICBlcXVhbHNOb2RlLnkgPSB5Tm9kZS55O1xyXG5cclxuICAgICAgLy8gTGF5b3V0IHRoZSAnbXgnIHBhcnQgb2YgdGhlIGVxdWF0aW9uLlxyXG4gICAgICBpZiAoIG9wdGlvbnMuaW50ZXJhY3RpdmVTbG9wZSApIHtcclxuXHJcbiAgICAgICAgLy8gc2xvcGUgaXMgaW50ZXJhY3RpdmUsIHdpbGwgYmUgZGlzcGxheWVkIGFzIGEgZnJhY3Rpb25cclxuXHJcbiAgICAgICAgLy8gKHJpc2UvcnVuKXhcclxuICAgICAgICByaXNlTm9kZS52aXNpYmxlID0gcnVuTm9kZS52aXNpYmxlID0gc2xvcGVGcmFjdGlvbkxpbmVOb2RlLnZpc2libGUgPSB4Tm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICBzbG9wZUZyYWN0aW9uTGluZU5vZGUuc3Ryb2tlID0geE5vZGUuZmlsbCA9IGxpbmVDb2xvcjtcclxuICAgICAgICBzbG9wZUZyYWN0aW9uTGluZU5vZGUubGVmdCA9IGVxdWFsc05vZGUucmlnaHQgKyB0aGlzLnJlbGF0aW9uYWxPcGVyYXRvclhTcGFjaW5nO1xyXG4gICAgICAgIHNsb3BlRnJhY3Rpb25MaW5lTm9kZS5jZW50ZXJZID0gZXF1YWxzTm9kZS5jZW50ZXJZICsgdGhpcy5mcmFjdGlvbkxpbmVZRnVkZ2VGYWN0b3I7XHJcbiAgICAgICAgcmlzZU5vZGUuY2VudGVyWCA9IHNsb3BlRnJhY3Rpb25MaW5lTm9kZS5jZW50ZXJYO1xyXG4gICAgICAgIHJpc2VOb2RlLmJvdHRvbSA9IHNsb3BlRnJhY3Rpb25MaW5lTm9kZS50b3AgLSB0aGlzLnBpY2tlcnNZU3BhY2luZztcclxuICAgICAgICBydW5Ob2RlLmNlbnRlclggPSBzbG9wZUZyYWN0aW9uTGluZU5vZGUuY2VudGVyWDtcclxuICAgICAgICBydW5Ob2RlLnRvcCA9IHNsb3BlRnJhY3Rpb25MaW5lTm9kZS5ib3R0b20gKyB0aGlzLnBpY2tlcnNZU3BhY2luZztcclxuICAgICAgICB4Tm9kZS5sZWZ0ID0gc2xvcGVGcmFjdGlvbkxpbmVOb2RlLnJpZ2h0ICsgdGhpcy5mcmFjdGlvbmFsU2xvcGVYU3BhY2luZztcclxuICAgICAgICB4Tm9kZS55ID0geU5vZGUueTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyBzbG9wZSAocmlzZS9ydW4pIGlzIG5vdCBpbnRlcmFjdGl2ZSwgbWF5IGJlIGRpc3BsYXllZCBhcyBhbiBpbnRlZ2VyIG9yIGltcHJvcGVyIGZyYWN0aW9uXHJcbiAgICAgICAgY29uc3QgcmlzZUR5bmFtaWNWYWx1ZU5vZGUgPSByaXNlTm9kZSBhcyBEeW5hbWljVmFsdWVOb2RlO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHJpc2VEeW5hbWljVmFsdWVOb2RlIGluc3RhbmNlb2YgRHluYW1pY1ZhbHVlTm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNpbXBsZS10eXBlLWNoZWNraW5nLWFzc2VydGlvbnNcclxuICAgICAgICBjb25zdCBydW5EeW5hbWljVmFsdWVOb2RlID0gcnVuTm9kZSBhcyBEeW5hbWljVmFsdWVOb2RlO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHJ1bkR5bmFtaWNWYWx1ZU5vZGUgaW5zdGFuY2VvZiBEeW5hbWljVmFsdWVOb2RlICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9uc1xyXG5cclxuICAgICAgICAvLyBkZWNpZGUgd2hldGhlciB0byBpbmNsdWRlIHRoZSBzbG9wZSBtaW51cyBzaWduXHJcbiAgICAgICAgbGV0IHByZXZpb3VzTm9kZTtcclxuICAgICAgICBsZXQgcHJldmlvdXNYT2Zmc2V0O1xyXG4gICAgICAgIGlmICggcG9zaXRpdmVTbG9wZSB8fCB6ZXJvU2xvcGUgKSB7XHJcbiAgICAgICAgICAvLyBubyBzaWduXHJcbiAgICAgICAgICBwcmV2aW91c05vZGUgPSBlcXVhbHNOb2RlO1xyXG4gICAgICAgICAgcHJldmlvdXNYT2Zmc2V0ID0gdGhpcy5yZWxhdGlvbmFsT3BlcmF0b3JYU3BhY2luZztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyAtXHJcbiAgICAgICAgICBzbG9wZU1pbnVzU2lnbk5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICBzbG9wZU1pbnVzU2lnbk5vZGUuZmlsbCA9IGxpbmVDb2xvcjtcclxuICAgICAgICAgIHNsb3BlTWludXNTaWduTm9kZS5sZWZ0ID0gZXF1YWxzTm9kZS5yaWdodCArIHRoaXMucmVsYXRpb25hbE9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgICAgICBzbG9wZU1pbnVzU2lnbk5vZGUuY2VudGVyWSA9IGVxdWFsc05vZGUuY2VudGVyWSArIHRoaXMuc2xvcGVTaWduWUZ1ZGdlRmFjdG9yICsgdGhpcy5zbG9wZVNpZ25ZT2Zmc2V0O1xyXG4gICAgICAgICAgcHJldmlvdXNOb2RlID0gc2xvcGVNaW51c1NpZ25Ob2RlO1xyXG4gICAgICAgICAgcHJldmlvdXNYT2Zmc2V0ID0gKCBmcmFjdGlvbmFsU2xvcGUgPyB0aGlzLmZyYWN0aW9uU2lnblhTcGFjaW5nIDogdGhpcy5pbnRlZ2VyU2lnblhTcGFjaW5nICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIGxpbmUudW5kZWZpbmVkU2xvcGUoKSB8fCBmcmFjdGlvbmFsU2xvcGUgKSB7XHJcbiAgICAgICAgICAvLyByaXNlL3J1biB4XHJcbiAgICAgICAgICByaXNlTm9kZS52aXNpYmxlID0gcnVuTm9kZS52aXNpYmxlID0gc2xvcGVGcmFjdGlvbkxpbmVOb2RlLnZpc2libGUgPSB4Tm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHJpc2VEeW5hbWljVmFsdWVOb2RlLmZpbGwgPSBydW5EeW5hbWljVmFsdWVOb2RlLmZpbGwgPSBzbG9wZUZyYWN0aW9uTGluZU5vZGUuc3Ryb2tlID0geE5vZGUuZmlsbCA9IGxpbmVDb2xvcjtcclxuICAgICAgICAgIC8vIGFkanVzdCBmcmFjdGlvbiBsaW5lIHdpZHRoXHJcbiAgICAgICAgICBsaW5lV2lkdGggPSBNYXRoLm1heCggcmlzZU5vZGUud2lkdGgsIHJ1bk5vZGUud2lkdGggKTtcclxuICAgICAgICAgIHNsb3BlRnJhY3Rpb25MaW5lTm9kZS5zZXRMaW5lKCAwLCAwLCBsaW5lV2lkdGgsIDAgKTtcclxuICAgICAgICAgIC8vIGxheW91dFxyXG4gICAgICAgICAgc2xvcGVGcmFjdGlvbkxpbmVOb2RlLmxlZnQgPSBwcmV2aW91c05vZGUucmlnaHQgKyBwcmV2aW91c1hPZmZzZXQ7XHJcbiAgICAgICAgICBzbG9wZUZyYWN0aW9uTGluZU5vZGUuY2VudGVyWSA9IGVxdWFsc05vZGUuY2VudGVyWSArIHRoaXMuZnJhY3Rpb25MaW5lWUZ1ZGdlRmFjdG9yO1xyXG4gICAgICAgICAgcmlzZU5vZGUuY2VudGVyWCA9IHNsb3BlRnJhY3Rpb25MaW5lTm9kZS5jZW50ZXJYO1xyXG4gICAgICAgICAgcmlzZU5vZGUuYm90dG9tID0gc2xvcGVGcmFjdGlvbkxpbmVOb2RlLnRvcCAtIHRoaXMueVNwYWNpbmc7XHJcbiAgICAgICAgICBydW5Ob2RlLmNlbnRlclggPSBzbG9wZUZyYWN0aW9uTGluZU5vZGUuY2VudGVyWDtcclxuICAgICAgICAgIHJ1bk5vZGUudG9wID0gc2xvcGVGcmFjdGlvbkxpbmVOb2RlLmJvdHRvbSArIHRoaXMueVNwYWNpbmc7XHJcbiAgICAgICAgICB4Tm9kZS5sZWZ0ID0gc2xvcGVGcmFjdGlvbkxpbmVOb2RlLnJpZ2h0ICsgdGhpcy5mcmFjdGlvbmFsU2xvcGVYU3BhY2luZztcclxuICAgICAgICAgIHhOb2RlLnkgPSB5Tm9kZS55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggemVyb1Nsb3BlICkge1xyXG4gICAgICAgICAgLy8gbm8geCB0ZXJtXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCB1bml0eVNsb3BlICkge1xyXG4gICAgICAgICAgLy8geFxyXG4gICAgICAgICAgeE5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICB4Tm9kZS5maWxsID0gbGluZUNvbG9yO1xyXG4gICAgICAgICAgeE5vZGUubGVmdCA9IHByZXZpb3VzTm9kZS5yaWdodCArIHByZXZpb3VzWE9mZnNldDtcclxuICAgICAgICAgIHhOb2RlLnkgPSB5Tm9kZS55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggaW50ZWdlclNsb3BlICkge1xyXG4gICAgICAgICAgLy8gTnhcclxuICAgICAgICAgIHJpc2VOb2RlLnZpc2libGUgPSB4Tm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHJpc2VEeW5hbWljVmFsdWVOb2RlLmZpbGwgPSB4Tm9kZS5maWxsID0gbGluZUNvbG9yO1xyXG4gICAgICAgICAgcmlzZU5vZGUubGVmdCA9IHByZXZpb3VzTm9kZS5yaWdodCArIHByZXZpb3VzWE9mZnNldDtcclxuICAgICAgICAgIHJpc2VOb2RlLnkgPSB5Tm9kZS55O1xyXG4gICAgICAgICAgeE5vZGUubGVmdCA9IHJpc2VOb2RlLnJpZ2h0ICsgdGhpcy5pbnRlZ2VyU2xvcGVYU3BhY2luZztcclxuICAgICAgICAgIHhOb2RlLnkgPSB5Tm9kZS55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ3Byb2dyYW1taW5nIGVycm9yLCBmb3Jnb3QgdG8gaGFuZGxlIHNvbWUgc2xvcGUgY2FzZScgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIExheW91dCB0aGUgJysgYicgcGFydCBvZiB0aGUgZXF1YXRpb24uXHJcbiAgICAgIGlmICggb3B0aW9ucy5pbnRlcmFjdGl2ZUludGVyY2VwdCApIHtcclxuICAgICAgICAvLyBpbnRlcmNlcHQgaXMgaW50ZXJhY3RpdmUgYW5kIHdpbGwgYmUgYW4gaW50ZWdlclxyXG4gICAgICAgIGlmICggemVyb1Nsb3BlICYmICFvcHRpb25zLmludGVyYWN0aXZlU2xvcGUgKSB7XHJcbiAgICAgICAgICAvLyB5ID0gYlxyXG4gICAgICAgICAgeUludGVyY2VwdE51bWVyYXRvck5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICB5SW50ZXJjZXB0TnVtZXJhdG9yTm9kZS5sZWZ0ID0gZXF1YWxzTm9kZS5yaWdodCArIHRoaXMucmVsYXRpb25hbE9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgICAgICB5SW50ZXJjZXB0TnVtZXJhdG9yTm9kZS5jZW50ZXJZID0geU5vZGUuY2VudGVyWTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyB5ID0gKHJpc2UvcnVuKXggKyBiXHJcbiAgICAgICAgICBwbHVzTm9kZS52aXNpYmxlID0geUludGVyY2VwdE51bWVyYXRvck5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICBtaW51c05vZGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgcGx1c05vZGUuZmlsbCA9IGxpbmVDb2xvcjtcclxuICAgICAgICAgIHBsdXNOb2RlLmxlZnQgPSB4Tm9kZS5yaWdodCArIHRoaXMub3BlcmF0b3JYU3BhY2luZztcclxuICAgICAgICAgIHBsdXNOb2RlLmNlbnRlclkgPSBlcXVhbHNOb2RlLmNlbnRlclkgKyB0aGlzLm9wZXJhdG9yWUZ1ZGdlRmFjdG9yO1xyXG4gICAgICAgICAgeUludGVyY2VwdE51bWVyYXRvck5vZGUubGVmdCA9IHBsdXNOb2RlLnJpZ2h0ICsgdGhpcy5vcGVyYXRvclhTcGFjaW5nO1xyXG4gICAgICAgICAgeUludGVyY2VwdE51bWVyYXRvck5vZGUuY2VudGVyWSA9IHlOb2RlLmNlbnRlclk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIGludGVyY2VwdCBpcyBub3QgaW50ZXJhY3RpdmUgYW5kIG1heSBiZSBkaXNwbGF5ZWQgYXMgYW4gaW50ZWdlciBvciBpbXByb3BlciBmcmFjdGlvblxyXG4gICAgICAgIGNvbnN0IHlJbnRlcmNlcHROdW1lcmF0b3JEeW5hbWljVmFsdWVOb2RlID0geUludGVyY2VwdE51bWVyYXRvck5vZGUgYXMgRHluYW1pY1ZhbHVlTm9kZTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB5SW50ZXJjZXB0TnVtZXJhdG9yRHluYW1pY1ZhbHVlTm9kZSBpbnN0YW5jZW9mIER5bmFtaWNWYWx1ZU5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zaW1wbGUtdHlwZS1jaGVja2luZy1hc3NlcnRpb25zXHJcblxyXG4gICAgICAgIC8vIHktaW50ZXJjZXB0IHByb3BlcnRpZXNcclxuICAgICAgICBjb25zdCBmcmFjdGlvbmFsSW50ZXJjZXB0ID0gbGluZS5nZXRZSW50ZXJjZXB0KCk7XHJcbiAgICAgICAgY29uc3QgemVyb0ludGVyY2VwdCA9ICggZnJhY3Rpb25hbEludGVyY2VwdC5nZXRWYWx1ZSgpID09PSAwICk7XHJcbiAgICAgICAgY29uc3QgaW50ZWdlckludGVyY2VwdCA9IGZyYWN0aW9uYWxJbnRlcmNlcHQuaXNJbnRlZ2VyKCk7XHJcbiAgICAgICAgY29uc3QgcG9zaXRpdmVJbnRlcmNlcHQgPSAoIGZyYWN0aW9uYWxJbnRlcmNlcHQuZ2V0VmFsdWUoKSA+IDAgKTtcclxuXHJcbiAgICAgICAgaWYgKCB6ZXJvSW50ZXJjZXB0ICkge1xyXG4gICAgICAgICAgaWYgKCB6ZXJvU2xvcGUgJiYgIW9wdGlvbnMuaW50ZXJhY3RpdmVTbG9wZSApIHtcclxuICAgICAgICAgICAgLy8geSA9IDBcclxuICAgICAgICAgICAgeUludGVyY2VwdE51bWVyYXRvckR5bmFtaWNWYWx1ZU5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHlJbnRlcmNlcHROdW1lcmF0b3JEeW5hbWljVmFsdWVOb2RlLmZpbGwgPSBsaW5lQ29sb3I7XHJcbiAgICAgICAgICAgIHlJbnRlcmNlcHROdW1lcmF0b3JEeW5hbWljVmFsdWVOb2RlLmxlZnQgPSBlcXVhbHNOb2RlLnJpZ2h0ICsgdGhpcy5yZWxhdGlvbmFsT3BlcmF0b3JYU3BhY2luZztcclxuICAgICAgICAgICAgeUludGVyY2VwdE51bWVyYXRvckR5bmFtaWNWYWx1ZU5vZGUuY2VudGVyWSA9IHlOb2RlLmNlbnRlclk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gbm8gaW50ZXJjZXB0XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBwb3NpdGl2ZUludGVyY2VwdCAmJiB6ZXJvU2xvcGUgJiYgIW9wdGlvbnMuaW50ZXJhY3RpdmVTbG9wZSApIHtcclxuICAgICAgICAgIC8vIHkgPSBiXHJcbiAgICAgICAgICB5SW50ZXJjZXB0TnVtZXJhdG9yRHluYW1pY1ZhbHVlTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHlJbnRlcmNlcHROdW1lcmF0b3JEeW5hbWljVmFsdWVOb2RlLmZpbGwgPSBsaW5lQ29sb3I7XHJcbiAgICAgICAgICB5SW50ZXJjZXB0TnVtZXJhdG9yRHluYW1pY1ZhbHVlTm9kZS5sZWZ0ID0gZXF1YWxzTm9kZS5yaWdodCArIHRoaXMucmVsYXRpb25hbE9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgICAgICB5SW50ZXJjZXB0TnVtZXJhdG9yRHluYW1pY1ZhbHVlTm9kZS5jZW50ZXJZID0geU5vZGUuY2VudGVyWTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoICFwb3NpdGl2ZUludGVyY2VwdCAmJiB6ZXJvU2xvcGUgJiYgIW9wdGlvbnMuaW50ZXJhY3RpdmVTbG9wZSApIHtcclxuICAgICAgICAgIC8vIHkgPSAtYlxyXG4gICAgICAgICAgeUludGVyY2VwdE1pbnVzU2lnbk5vZGUudmlzaWJsZSA9IHlJbnRlcmNlcHROdW1lcmF0b3JEeW5hbWljVmFsdWVOb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgeUludGVyY2VwdE1pbnVzU2lnbk5vZGUuZmlsbCA9IGxpbmVDb2xvcjtcclxuICAgICAgICAgIHlJbnRlcmNlcHROdW1lcmF0b3JEeW5hbWljVmFsdWVOb2RlLmZpbGwgPSBsaW5lQ29sb3I7XHJcbiAgICAgICAgICB5SW50ZXJjZXB0TWludXNTaWduTm9kZS5sZWZ0ID0gZXF1YWxzTm9kZS5yaWdodCArIHRoaXMucmVsYXRpb25hbE9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgICAgICB5SW50ZXJjZXB0TWludXNTaWduTm9kZS5jZW50ZXJZID0gZXF1YWxzTm9kZS5jZW50ZXJZICsgdGhpcy5vcGVyYXRvcllGdWRnZUZhY3RvcjtcclxuICAgICAgICAgIHlJbnRlcmNlcHROdW1lcmF0b3JEeW5hbWljVmFsdWVOb2RlLmxlZnQgPSB5SW50ZXJjZXB0TWludXNTaWduTm9kZS5yaWdodCArIHRoaXMuaW50ZWdlclNpZ25YU3BhY2luZztcclxuICAgICAgICAgIHlJbnRlcmNlcHROdW1lcmF0b3JEeW5hbWljVmFsdWVOb2RlLmNlbnRlclkgPSB5Tm9kZS5jZW50ZXJZO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIHkgPSBteCArLy0gYlxyXG4gICAgICAgICAgY29uc3Qgb3BlcmF0b3JOb2RlID0gKCBwb3NpdGl2ZUludGVyY2VwdCApID8gcGx1c05vZGUgOiBtaW51c05vZGU7XHJcbiAgICAgICAgICBvcGVyYXRvck5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICBvcGVyYXRvck5vZGUuZmlsbCA9IGxpbmVDb2xvcjtcclxuICAgICAgICAgIG9wZXJhdG9yTm9kZS5sZWZ0ID0geE5vZGUucmlnaHQgKyB0aGlzLm9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgICAgICBvcGVyYXRvck5vZGUuY2VudGVyWSA9IGVxdWFsc05vZGUuY2VudGVyWSArIHRoaXMub3BlcmF0b3JZRnVkZ2VGYWN0b3I7XHJcblxyXG4gICAgICAgICAgaWYgKCBpbnRlZ2VySW50ZXJjZXB0ICkge1xyXG4gICAgICAgICAgICAvLyBiIGlzIGFuIGludGVnZXJcclxuICAgICAgICAgICAgeUludGVyY2VwdE51bWVyYXRvckR5bmFtaWNWYWx1ZU5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHlJbnRlcmNlcHROdW1lcmF0b3JEeW5hbWljVmFsdWVOb2RlLmZpbGwgPSBsaW5lQ29sb3I7XHJcbiAgICAgICAgICAgIHlJbnRlcmNlcHROdW1lcmF0b3JEeW5hbWljVmFsdWVOb2RlLmxlZnQgPSBvcGVyYXRvck5vZGUucmlnaHQgKyB0aGlzLm9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgICAgICAgIHlJbnRlcmNlcHROdW1lcmF0b3JEeW5hbWljVmFsdWVOb2RlLmNlbnRlclkgPSB5Tm9kZS5jZW50ZXJZO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGIgaXMgYW4gaW1wcm9wZXIgZnJhY3Rpb25cclxuICAgICAgICAgICAgeUludGVyY2VwdE51bWVyYXRvckR5bmFtaWNWYWx1ZU5vZGUudmlzaWJsZSA9IHlJbnRlcmNlcHREZW5vbWluYXRvck5vZGUudmlzaWJsZSA9IHlJbnRlcmNlcHRGcmFjdGlvbkxpbmVOb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB5SW50ZXJjZXB0TnVtZXJhdG9yRHluYW1pY1ZhbHVlTm9kZS5maWxsID0gbGluZUNvbG9yO1xyXG4gICAgICAgICAgICB5SW50ZXJjZXB0RGVub21pbmF0b3JOb2RlLmZpbGwgPSB5SW50ZXJjZXB0RnJhY3Rpb25MaW5lTm9kZS5zdHJva2UgPSBsaW5lQ29sb3I7XHJcbiAgICAgICAgICAgIC8vIGFkanVzdCBmcmFjdGlvbiBsaW5lIHdpZHRoXHJcbiAgICAgICAgICAgIGxpbmVXaWR0aCA9IE1hdGgubWF4KCB5SW50ZXJjZXB0TnVtZXJhdG9yRHluYW1pY1ZhbHVlTm9kZS53aWR0aCwgeUludGVyY2VwdERlbm9taW5hdG9yTm9kZS53aWR0aCApO1xyXG4gICAgICAgICAgICB5SW50ZXJjZXB0RnJhY3Rpb25MaW5lTm9kZS5zZXRMaW5lKCAwLCAwLCBsaW5lV2lkdGgsIDAgKTtcclxuICAgICAgICAgICAgLy8gbGF5b3V0XHJcbiAgICAgICAgICAgIHlJbnRlcmNlcHRGcmFjdGlvbkxpbmVOb2RlLmxlZnQgPSBvcGVyYXRvck5vZGUucmlnaHQgKyB0aGlzLm9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgICAgICAgIHlJbnRlcmNlcHRGcmFjdGlvbkxpbmVOb2RlLmNlbnRlclkgPSBlcXVhbHNOb2RlLmNlbnRlclkgKyB0aGlzLmZyYWN0aW9uTGluZVlGdWRnZUZhY3RvcjtcclxuICAgICAgICAgICAgeUludGVyY2VwdE51bWVyYXRvckR5bmFtaWNWYWx1ZU5vZGUuY2VudGVyWCA9IHlJbnRlcmNlcHRGcmFjdGlvbkxpbmVOb2RlLmNlbnRlclg7XHJcbiAgICAgICAgICAgIHlJbnRlcmNlcHROdW1lcmF0b3JEeW5hbWljVmFsdWVOb2RlLmJvdHRvbSA9IHlJbnRlcmNlcHRGcmFjdGlvbkxpbmVOb2RlLnRvcCAtIHRoaXMueVNwYWNpbmc7XHJcbiAgICAgICAgICAgIHlJbnRlcmNlcHREZW5vbWluYXRvck5vZGUuY2VudGVyWCA9IHlJbnRlcmNlcHRGcmFjdGlvbkxpbmVOb2RlLmNlbnRlclg7XHJcbiAgICAgICAgICAgIHlJbnRlcmNlcHREZW5vbWluYXRvck5vZGUudG9wID0geUludGVyY2VwdEZyYWN0aW9uTGluZU5vZGUuYm90dG9tICsgdGhpcy55U3BhY2luZztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbiAgICAvLyBzeW5jIHRoZSBtb2RlbCB3aXRoIHRoZSBjb250cm9scywgdW5tdWx0aWxpbmsgaW4gZGlzcG9zZVxyXG4gICAgY29uc3QgY29udHJvbHNNdWx0aWxpbmsgPSBNdWx0aWxpbmsubGF6eU11bHRpbGluayggWyByaXNlUHJvcGVydHksIHJ1blByb3BlcnR5LCB5SW50ZXJjZXB0UHJvcGVydHkgXSxcclxuICAgICAgKCkgPT4ge1xyXG4gICAgICAgIGlmICggIXVwZGF0aW5nQ29udHJvbHMgKSB7XHJcbiAgICAgICAgICBpZiAoIG9wdGlvbnMuaW50ZXJhY3RpdmVJbnRlcmNlcHQgKSB7XHJcbiAgICAgICAgICAgIGxpbmVQcm9wZXJ0eS52YWx1ZSA9IExpbmUuY3JlYXRlU2xvcGVJbnRlcmNlcHQoIHJpc2VQcm9wZXJ0eS52YWx1ZSwgcnVuUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgICAgICAgeUludGVyY2VwdFByb3BlcnR5LnZhbHVlLCBsaW5lUHJvcGVydHkudmFsdWUuY29sb3IgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBsaW5lID0gbGluZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgICAgICBsaW5lUHJvcGVydHkudmFsdWUgPSBuZXcgTGluZSggbGluZS54MSwgbGluZS55MSxcclxuICAgICAgICAgICAgICBsaW5lLngxICsgcnVuUHJvcGVydHkudmFsdWUsIGxpbmUueTEgKyByaXNlUHJvcGVydHkudmFsdWUsIGxpbmVQcm9wZXJ0eS52YWx1ZS5jb2xvciApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBzeW5jIHRoZSBjb250cm9scyBhbmQgbGF5b3V0IHdpdGggdGhlIG1vZGVsXHJcbiAgICBjb25zdCBsaW5lT2JzZXJ2ZXIgPSAoIGxpbmU6IExpbmUgKSA9PiB7XHJcblxyXG4gICAgICAvLyBJZiBpbnRlcmNlcHQgaXMgaW50ZXJhY3RpdmUsIHRoZW4gKHgxLHkxKSBtdXN0IGJlIG9uIGEgZ3JpZCBsaW5lIG9uIHRoZSB5IGludGVyY2VwdC5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuaW50ZXJhY3RpdmVJbnRlcmNlcHQgfHwgKCBsaW5lLngxID09PSAwICYmIE51bWJlci5pc0ludGVnZXIoIGxpbmUueTEgKSApICk7XHJcblxyXG4gICAgICAvLyBTeW5jaHJvbml6ZSB0aGUgY29udHJvbHMgYXRvbWljYWxseS5cclxuICAgICAgdXBkYXRpbmdDb250cm9scyA9IHRydWU7XHJcbiAgICAgIHtcclxuICAgICAgICByaXNlUHJvcGVydHkudmFsdWUgPSBvcHRpb25zLmludGVyYWN0aXZlU2xvcGUgPyBsaW5lLnJpc2UgOiBsaW5lLmdldFNpbXBsaWZpZWRSaXNlKCk7XHJcbiAgICAgICAgcnVuUHJvcGVydHkudmFsdWUgPSBvcHRpb25zLmludGVyYWN0aXZlU2xvcGUgPyBsaW5lLnJ1biA6IGxpbmUuZ2V0U2ltcGxpZmllZFJ1bigpO1xyXG5cclxuICAgICAgICBpZiAoIG9wdGlvbnMuaW50ZXJhY3RpdmVJbnRlcmNlcHQgKSB7XHJcbiAgICAgICAgICB5SW50ZXJjZXB0UHJvcGVydHkudmFsdWUgPSBsaW5lLnkxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGNvbnN0IGZyYWN0aW9uYWxJbnRlcmNlcHQgPSBsaW5lUHJvcGVydHkudmFsdWUuZ2V0WUludGVyY2VwdCgpO1xyXG4gICAgICAgICAgeUludGVyY2VwdE51bWVyYXRvclByb3BlcnR5LnZhbHVlID0gZnJhY3Rpb25hbEludGVyY2VwdC5udW1lcmF0b3I7XHJcbiAgICAgICAgICB5SW50ZXJjZXB0RGVub21pbmF0b3JQcm9wZXJ0eS52YWx1ZSA9IGZyYWN0aW9uYWxJbnRlcmNlcHQuZGVub21pbmF0b3I7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHVwZGF0aW5nQ29udHJvbHMgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIEZ1bGx5LWludGVyYWN0aXZlIGVxdWF0aW9ucyBoYXZlIGEgY29uc3RhbnQgZm9ybSwgbm8gbmVlZCB0byB1cGRhdGUgbGF5b3V0IHdoZW4gbGluZSBjaGFuZ2VzLlxyXG4gICAgICBpZiAoICFmdWxseUludGVyYWN0aXZlICkgeyB1cGRhdGVMYXlvdXQoIGxpbmUgKTsgfVxyXG4gICAgfTtcclxuICAgIGxpbmVQcm9wZXJ0eS5saW5rKCBsaW5lT2JzZXJ2ZXIgKTsgLy8gdW5saW5rIGluIGRpc3Bvc2VcclxuXHJcbiAgICAvLyBGb3IgZnVsbHktaW50ZXJhY3RpdmUgZXF1YXRpb25zIC4uLlxyXG4gICAgbGV0IHVuZGVmaW5lZFNsb3BlVXBkYXRlcjogKCBsaW5lOiBMaW5lICkgPT4gdm9pZDtcclxuICAgIGlmICggZnVsbHlJbnRlcmFjdGl2ZSApIHtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSBsYXlvdXQgb25jZVxyXG4gICAgICB1cGRhdGVMYXlvdXQoIGxpbmVQcm9wZXJ0eS52YWx1ZSApO1xyXG5cclxuICAgICAgLy8gYWRkIHVuZGVmaW5lZFNsb3BlSW5kaWNhdG9yXHJcbiAgICAgIGNvbnN0IHVuZGVmaW5lZFNsb3BlSW5kaWNhdG9yID0gbmV3IFVuZGVmaW5lZFNsb3BlSW5kaWNhdG9yKCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCB1bmRlZmluZWRTbG9wZUluZGljYXRvciApO1xyXG4gICAgICB1bmRlZmluZWRTbG9wZUluZGljYXRvci5jZW50ZXJYID0gdGhpcy5jZW50ZXJYO1xyXG4gICAgICB1bmRlZmluZWRTbG9wZUluZGljYXRvci5jZW50ZXJZID0gc2xvcGVGcmFjdGlvbkxpbmVOb2RlLmNlbnRlclkgLSB0aGlzLnVuZGVmaW5lZFNsb3BlWUZ1ZGdlRmFjdG9yO1xyXG5cclxuICAgICAgdW5kZWZpbmVkU2xvcGVVcGRhdGVyID0gbGluZSA9PiB7XHJcbiAgICAgICAgdW5kZWZpbmVkU2xvcGVJbmRpY2F0b3IudmlzaWJsZSA9IGxpbmUudW5kZWZpbmVkU2xvcGUoKTtcclxuICAgICAgfTtcclxuICAgICAgbGluZVByb3BlcnR5LmxpbmsoIHVuZGVmaW5lZFNsb3BlVXBkYXRlciApOyAvLyB1bmxpbmsgaW4gZGlzcG9zZVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlU2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGUgPSAoKSA9PiB7XHJcbiAgICAgIHJpc2VOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgcnVuTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIHlJbnRlcmNlcHROdW1lcmF0b3JOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgeUludGVyY2VwdERlbm9taW5hdG9yTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIE11bHRpbGluay51bm11bHRpbGluayggY29udHJvbHNNdWx0aWxpbmsgKTtcclxuICAgICAgbGluZVByb3BlcnR5LnVubGluayggbGluZU9ic2VydmVyICk7XHJcbiAgICAgIHVuZGVmaW5lZFNsb3BlVXBkYXRlciAmJiBsaW5lUHJvcGVydHkudW5saW5rKCB1bmRlZmluZWRTbG9wZVVwZGF0ZXIgKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZVNsb3BlSW50ZXJjZXB0RXF1YXRpb25Ob2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbm9kZSB0aGF0IGRpc3BsYXlzIHRoZSBnZW5lcmFsIGZvcm0gb2YgdGhpcyBlcXVhdGlvbjogeSA9IG14ICsgYlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlR2VuZXJhbEZvcm1Ob2RlKCk6IE5vZGUge1xyXG5cclxuICAgIC8vIHkgPSBteCArIGJcclxuICAgIGNvbnN0IHN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggYHt7eX19ICR7TWF0aFN5bWJvbHMuRVFVQUxfVE99IHt7bX19e3t4fX0gJHtNYXRoU3ltYm9scy5QTFVTfSB7e2J9fWAsIHtcclxuICAgICAgeTogR0xTeW1ib2xzLnksXHJcbiAgICAgIG06IEdMU3ltYm9scy5tLFxyXG4gICAgICB4OiBHTFN5bWJvbHMueCxcclxuICAgICAgYjogR0xTeW1ib2xzLmJcclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFJpY2hUZXh0KCBzdHJpbmcsIHtcclxuICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMjAsIHdlaWdodDogR0xDb25zdGFudHMuRVFVQVRJT05fRk9OVF9XRUlHSFQgfSApLFxyXG4gICAgICBtYXhXaWR0aDogMzAwXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbm9uLWludGVyYWN0aXZlIGVxdWF0aW9uLCB1c2VkIHRvIGxhYmVsIGEgZHluYW1pYyBsaW5lLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlRHluYW1pY0xhYmVsKCBsaW5lUHJvcGVydHk6IFByb3BlcnR5PExpbmU+LCBwcm92aWRlZE9wdGlvbnM/OiBDcmVhdGVEeW5hbWljTGFiZWxPcHRpb25zICk6IE5vZGUge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxDcmVhdGVEeW5hbWljTGFiZWxPcHRpb25zPigge1xyXG4gICAgICBpbnRlcmFjdGl2ZVNsb3BlOiBmYWxzZSxcclxuICAgICAgaW50ZXJhY3RpdmVJbnRlcmNlcHQ6IGZhbHNlLFxyXG4gICAgICBmb250U2l6ZTogMTgsXHJcbiAgICAgIG1heFdpZHRoOiAyMDBcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHJldHVybiBuZXcgU2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGUoIGxpbmVQcm9wZXJ0eSwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JhcGhpbmdMaW5lcy5yZWdpc3RlciggJ1Nsb3BlSW50ZXJjZXB0RXF1YXRpb25Ob2RlJywgU2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxjQUFjLE1BQWlDLHVDQUF1QztBQUM3RixPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxPQUFPQyxTQUFTLE1BQTRCLDBDQUEwQztB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