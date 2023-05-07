// Copyright 2019-2023, University of Colorado Boulder

/**
 * ComparisonStatementNode is a Scenery node that depicts a "comparison statement" between zero to three numerical
 * values, for example, "1 < 5 < 7".  It also includes a selector that allows a user to choose between the greater than
 * or less than comparison operator.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import StringProperty from '../../../../axon/js/StringProperty.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, FireListener, Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import numberLineIntegers from '../../numberLineIntegers.js';

// constants
const COMPARISON_STATEMENT_FONT = new PhetFont(26);
const COMPARISON_STATEMENT_SPACING = 6; // in screen coords
const NUMBER_BACKGROUND_DILATION_AMOUNT = 3;
const NUMBER_BACKGROUND_LINE_WIDTH = 2;
const BUTTON_TOUCH_DILATION = 8;
const GREATER_THAN_STRING = MathSymbols.GREATER_THAN;
const LESS_THAN_STRING = MathSymbols.LESS_THAN;
const DEFAULT_COMPARISON_SELECTOR_FONT = new PhetFont({
  size: 20,
  weight: 'bold'
});
const SELECTED_OPERATOR_TEXT_COLOR = '#000000';
const SELECTED_OPERATOR_BACKGROUND_COLOR = '#d3d3d3';
const UNSELECTED_OPERATOR_TEXT_COLOR = '#949494';
const UNSELECTED_OPERATOR_BACKGROUND_COLOR = '#ffffff';
class ComparisonStatementNode extends Node {
  /**
   * @param {NumberLine} numberLine - the number line whose point values are being depicted
   * @public
   */
  constructor(numberLine) {
    super();

    // @public - controls what comparison operator is used
    this.selectedOperatorProperty = new StringProperty(LESS_THAN_STRING, {
      validValues: [GREATER_THAN_STRING, LESS_THAN_STRING]
    });

    // comparison statement root node
    const comparisonStatementRoot = new Node();
    this.addChild(comparisonStatementRoot);

    // The comparison statement has numbers and operators that reside on different root nodes for easier manipulation.
    const numberNodesLayer = new Node();
    comparisonStatementRoot.addChild(numberNodesLayer);
    const operatorAndZeroNodesLayer = new Node();
    comparisonStatementRoot.addChild(operatorAndZeroNodesLayer);

    // operator selector node - allows the user to choose between greater than or less than
    const operatorSelectionNode = new OperatorSelectorNode(this.selectedOperatorProperty, {
      bottom: 4 // empirically determined to align vertically with the comparison statement
    });

    this.addChild(operatorSelectionNode);

    // Keep track of the previous number node array, used to help with sorting.
    let previousNumberNodes = [];

    // Create a node that indicates a zero, but has a background like the other numbers so that its height is the same.
    const zeroTextNode = new Text('0', {
      font: COMPARISON_STATEMENT_FONT
    });
    const zeroNode = new Rectangle({
      rectBounds: zeroTextNode.localBounds.dilated(NUMBER_BACKGROUND_DILATION_AMOUNT),
      children: [zeroTextNode],
      fill: Color.TRANSPARENT,
      stroke: Color.TRANSPARENT,
      lineWidth: NUMBER_BACKGROUND_LINE_WIDTH
    });
    operatorAndZeroNodesLayer.addChild(zeroNode);

    // Create and add the nodes that will be used to depict the comparison operators.
    const comparisonOperatorNodes = [];
    _.times(2, () => {
      // Give these an arbitrary value to start with, they will be updated later.
      const comparisonOperatorNode = new Text(GREATER_THAN_STRING, {
        font: COMPARISON_STATEMENT_FONT
      });
      operatorAndZeroNodesLayer.addChild(comparisonOperatorNode);
      comparisonOperatorNodes.push(comparisonOperatorNode);
    });

    // Define a function to update the comparison statement, including its layout.
    const updateComparisonStatement = () => {
      const numPoints = numberLine.residentPoints.length;

      // Verify that this function isn't being asked to handle more points than it is designed for.
      assert && assert(numPoints <= 3, 'too many points on number line');
      const comparisonOperator = this.selectedOperatorProperty.value;

      // Hide operators and zeros for now, will be made visible as needed by the code below.
      zeroNode.visible = false;
      comparisonOperatorNodes.forEach(comparisonOperatorNode => {
        comparisonOperatorNode.visible = false;

        // Position this so that it won't affect the overall bounds if it is not being used.
        comparisonOperatorNode.left = 0;
      });

      // list of all nodes that will depict numbers, including zero nodes that don't correspond to a point
      const numberNodes = [];

      // NOTE: In order for the code below to make sense, it's important to understand that the numberNodesLayer is
      // populated with number nodes elsewhere in this file whenever points are added to or removed from the
      // corresponding number line.

      if (numberNodesLayer.getChildrenCount() === 0) {
        // If there are no points on the number line, just show a zero.
        zeroNode.visible = false;
        numberNodes.push(zeroNode);
      } else if (numberNodesLayer.getChildrenCount() === 1) {
        // There is only one number node, so show it compared to zero.
        const pointValueNode = numberNodesLayer.getChildAt(0);
        zeroNode.visible = true;

        // Add nodes to the list in ascending order.
        if (pointValueNode.point.valueProperty.value < 0) {
          numberNodes.push(pointValueNode);
          numberNodes.push(zeroNode);
        } else if (pointValueNode.point.valueProperty.value > 0) {
          numberNodes.push(zeroNode);
          numberNodes.push(pointValueNode);
        } else {
          // The node value is equal to zero, so sort it based on the previous position.
          const previousPositionInArray = previousNumberNodes.indexOf(pointValueNode);
          if (previousPositionInArray === 0) {
            numberNodes.push(pointValueNode);
            numberNodes.push(zeroNode);
          } else {
            numberNodes.push(zeroNode);
            numberNodes.push(pointValueNode);
          }
        }
      } else {
        // There are two or more number values being displayed.  Get a list of number nodes and sort them based on
        // their values.  If the values are equal, use the previous position in the order array.
        const orderedNumberNodes = numberNodesLayer.getChildren().sort((p1node, p2node) => {
          let result;
          if (p1node.point.valueProperty.value !== p2node.point.valueProperty.value) {
            result = p1node.point.valueProperty.value - p2node.point.valueProperty.value;
          } else {
            // The current values are equal, so use the previous position in the ordered array.
            const prevP1NodePosition = previousNumberNodes.indexOf(p1node);
            const prevP2NodePosition = previousNumberNodes.indexOf(p2node);
            if (prevP1NodePosition > -1 && prevP2NodePosition > -1) {
              result = prevP1NodePosition - prevP2NodePosition;
            } else {
              // One of the points must have just been added right on top of the other, so call them equal.
              result = 0;
            }
          }
          return result;
        });

        // Add the nodes in order to the list of value nodes.
        orderedNumberNodes.forEach(node => {
          numberNodes.push(node);
        });
      }

      // Save the ordered list in case we need it for comparison purposes the next time we order them.
      previousNumberNodes = numberNodes.slice();

      // Above, the nodes are sorted in ascending order, so they need to be reversed if using the '>' operator.
      if (comparisonOperator === GREATER_THAN_STRING) {
        numberNodes.reverse();
      }

      // At this point we should have an ordered list of number nodes, so set their positions.
      let currentXPos = 0;
      for (let i = 0; i < numberNodes.length; i++) {
        const currentNode = numberNodes[i];
        currentNode.left = currentXPos;
        currentXPos = currentNode.right + COMPARISON_STATEMENT_SPACING;

        // If this isn't the last number node a comparison operator will be needed.
        if (i < numberNodes.length - 1) {
          let comparisonCharacter = comparisonOperator;
          const currentNodeValue = currentNode.point ? currentNode.point.valueProperty.value : 0;
          const nextNodeValue = numberNodes[i + 1].point ? numberNodes[i + 1].point.valueProperty.value : 0;
          if (currentNodeValue === nextNodeValue) {
            // The values are equal, so we need to use less-than-or-equal or greater-than-or-equal comparison operator.
            comparisonCharacter = comparisonOperator === LESS_THAN_STRING ? MathSymbols.LESS_THAN_OR_EQUAL : MathSymbols.GREATER_THAN_OR_EQUAL;
          }
          const comparisonOperatorNode = comparisonOperatorNodes[i];
          comparisonOperatorNode.visible = true;
          if (comparisonOperatorNode.string !== comparisonCharacter) {
            // optimization - only set the string if it's not correct, saves time reevaluating bounds
            if (comparisonOperatorNode.string !== comparisonCharacter) {
              comparisonOperatorNode.string = comparisonCharacter;
            }
          }
          comparisonOperatorNode.x = currentXPos;
          currentXPos = comparisonOperatorNode.right + COMPARISON_STATEMENT_SPACING;
        }
      }
      comparisonStatementRoot.centerX = 0;
      operatorSelectionNode.left = 120; // empirically determined
    };

    // Add or remove number nodes and otherwise update the comparison statement as points appear, move, and disappear.
    numberLine.residentPoints.forEach(point => {
      numberNodesLayer.addChild(new PointValueNode(point));
      point.valueProperty.lazyLink(updateComparisonStatement);
    });
    numberLine.residentPoints.addItemAddedListener(addedPoint => {
      numberNodesLayer.addChild(new PointValueNode(addedPoint));
      addedPoint.valueProperty.link(updateComparisonStatement);
    });
    numberLine.residentPoints.addItemRemovedListener(removedPoint => {
      removedPoint.valueProperty.unlink(updateComparisonStatement);
      numberNodesLayer.getChildren().forEach(childNode => {
        if (childNode.point === removedPoint) {
          numberNodesLayer.removeChild(childNode);
          childNode.dispose();
        }
      });
      updateComparisonStatement();
    });

    // Update the comparison statement of the chosen operator changes, this also does the initial update.
    this.selectedOperatorProperty.link(updateComparisonStatement);
  }

  /**
   * @public
   */
  reset() {
    this.selectedOperatorProperty.reset();
  }
}

// inner class that defines the operator selector control
class OperatorSelectorNode extends Node {
  /**
   * @param {StringProperty} selectedOperatorProperty - property controlled by this selector node
   * @param {Object} [options]
   * @public
   */
  constructor(selectedOperatorProperty, options) {
    options = merge({
      selectorWidth: 25,
      selectorHeight: 25,
      font: DEFAULT_COMPARISON_SELECTOR_FONT,
      roundedCornerRadius: 5
    }, options);
    super();

    // Create the button for selecting the "less than" operator.
    const lessThanSelectorShape = Shape.roundedRectangleWithRadii(-options.selectorWidth, -options.selectorHeight / 2, options.selectorWidth, options.selectorHeight, {
      topLeft: options.roundedCornerRadius,
      bottomLeft: options.roundedCornerRadius
    });
    const lessThanOperatorSelectorNode = new Path(lessThanSelectorShape, {
      stroke: 'black',
      cursor: 'pointer'
    });
    const lessThanText = new Text(LESS_THAN_STRING, {
      font: options.font,
      centerX: lessThanOperatorSelectorNode.centerX,
      centerY: 0
    });
    lessThanOperatorSelectorNode.addChild(lessThanText);
    lessThanOperatorSelectorNode.touchArea = lessThanOperatorSelectorNode.bounds.withOffsets(BUTTON_TOUCH_DILATION, BUTTON_TOUCH_DILATION, 0, BUTTON_TOUCH_DILATION);
    lessThanOperatorSelectorNode.addInputListener(new FireListener({
      fire: () => {
        selectedOperatorProperty.value = LESS_THAN_STRING;
      }
    }));
    this.addChild(lessThanOperatorSelectorNode);

    // Create the button for selecting the "greater than" operator.
    const greaterThanSelectorShape = Shape.roundedRectangleWithRadii(0, -options.selectorHeight / 2, options.selectorWidth, options.selectorHeight, {
      topRight: options.roundedCornerRadius,
      bottomRight: options.roundedCornerRadius
    });
    const greaterThanOperatorSelectorNode = new Path(greaterThanSelectorShape, {
      stroke: 'black',
      cursor: 'pointer'
    });
    const greaterThanText = new Text(GREATER_THAN_STRING, {
      font: options.font,
      centerX: greaterThanOperatorSelectorNode.centerX,
      centerY: 0
    });
    greaterThanOperatorSelectorNode.addChild(greaterThanText);
    greaterThanOperatorSelectorNode.touchArea = greaterThanOperatorSelectorNode.bounds.withOffsets(0, BUTTON_TOUCH_DILATION, BUTTON_TOUCH_DILATION, BUTTON_TOUCH_DILATION);
    greaterThanOperatorSelectorNode.addInputListener(new FireListener({
      fire: () => {
        selectedOperatorProperty.value = GREATER_THAN_STRING;
      }
    }));
    this.addChild(greaterThanOperatorSelectorNode);

    // Control the appearance of each selector based on the current selection state.
    selectedOperatorProperty.link(selection => {
      if (selection === LESS_THAN_STRING) {
        lessThanText.fill = SELECTED_OPERATOR_TEXT_COLOR;
        lessThanOperatorSelectorNode.fill = SELECTED_OPERATOR_BACKGROUND_COLOR;
        greaterThanText.fill = UNSELECTED_OPERATOR_TEXT_COLOR;
        greaterThanOperatorSelectorNode.fill = UNSELECTED_OPERATOR_BACKGROUND_COLOR;
      } else {
        lessThanText.fill = UNSELECTED_OPERATOR_TEXT_COLOR;
        lessThanOperatorSelectorNode.fill = UNSELECTED_OPERATOR_BACKGROUND_COLOR;
        greaterThanText.fill = SELECTED_OPERATOR_TEXT_COLOR;
        greaterThanOperatorSelectorNode.fill = SELECTED_OPERATOR_BACKGROUND_COLOR;
      }
    });
    this.mutate(options);
  }
}

// inner class that is used to portray the numerical value of a number line point
class PointValueNode extends Node {
  /**
   * @param {NumberLinePoint} point
   * @public
   */
  constructor(point) {
    super();

    // @public (read-only) {NumberLinePoint}
    this.point = point;

    // background - Initial size and coloring is arbitrary, it will be updated in function linked below.
    const background = new Rectangle(0, 0, 1, 1, 2, 2, {
      lineWidth: NUMBER_BACKGROUND_LINE_WIDTH,
      visible: false // initially invisible, activated (made visible) when user interacts with the point
    });

    this.addChild(background);

    // the node that represents the value
    const numberText = new Text('', {
      font: COMPARISON_STATEMENT_FONT
    });
    this.addChild(numberText);

    // Update appearance as the value changes.
    const handleValueChange = value => {
      numberText.string = value;
      background.setRectBounds(numberText.bounds.dilated(NUMBER_BACKGROUND_DILATION_AMOUNT));
    };
    point.valueProperty.link(handleValueChange);
    const handleColorChange = color => {
      background.fill = color.colorUtilsBrighter(0.75);
      background.stroke = color;
    };
    point.colorProperty.link(handleColorChange);

    // An animation is used to made the background when the user stops dragging the point.
    let backgroundFadeAnimation = null;

    // Update the highlight state as the point is dragged.
    const handleDragStateChange = dragging => {
      if (dragging) {
        if (backgroundFadeAnimation) {
          backgroundFadeAnimation.stop();
        }
        background.visible = true;
        background.opacity = 1;
      } else if (!backgroundFadeAnimation) {
        // Start or restart the fade animation.
        backgroundFadeAnimation = new Animation({
          duration: 0.75,
          easing: Easing.CUBIC_OUT,
          setValue: value => {
            background.opacity = value;
          },
          from: 1,
          to: 0
        });
        backgroundFadeAnimation.start();
        backgroundFadeAnimation.endedEmitter.addListener(() => {
          backgroundFadeAnimation = null;
          background.visible = false;
        });
      }
    };
    point.isDraggingProperty.link(handleDragStateChange);

    // @private {function}
    this.disposeNumberWithColorNode = () => {
      point.valueProperty.unlink(handleValueChange);
      point.isDraggingProperty.unlink(handleDragStateChange);
      point.colorProperty.unlink(handleColorChange);
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeNumberWithColorNode();
    super.dispose();
  }
}
numberLineIntegers.register('ComparisonStatementNode', ComparisonStatementNode);
export default ComparisonStatementNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdQcm9wZXJ0eSIsIlNoYXBlIiwibWVyZ2UiLCJNYXRoU3ltYm9scyIsIlBoZXRGb250IiwiQ29sb3IiLCJGaXJlTGlzdGVuZXIiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlRleHQiLCJBbmltYXRpb24iLCJFYXNpbmciLCJudW1iZXJMaW5lSW50ZWdlcnMiLCJDT01QQVJJU09OX1NUQVRFTUVOVF9GT05UIiwiQ09NUEFSSVNPTl9TVEFURU1FTlRfU1BBQ0lORyIsIk5VTUJFUl9CQUNLR1JPVU5EX0RJTEFUSU9OX0FNT1VOVCIsIk5VTUJFUl9CQUNLR1JPVU5EX0xJTkVfV0lEVEgiLCJCVVRUT05fVE9VQ0hfRElMQVRJT04iLCJHUkVBVEVSX1RIQU5fU1RSSU5HIiwiR1JFQVRFUl9USEFOIiwiTEVTU19USEFOX1NUUklORyIsIkxFU1NfVEhBTiIsIkRFRkFVTFRfQ09NUEFSSVNPTl9TRUxFQ1RPUl9GT05UIiwic2l6ZSIsIndlaWdodCIsIlNFTEVDVEVEX09QRVJBVE9SX1RFWFRfQ09MT1IiLCJTRUxFQ1RFRF9PUEVSQVRPUl9CQUNLR1JPVU5EX0NPTE9SIiwiVU5TRUxFQ1RFRF9PUEVSQVRPUl9URVhUX0NPTE9SIiwiVU5TRUxFQ1RFRF9PUEVSQVRPUl9CQUNLR1JPVU5EX0NPTE9SIiwiQ29tcGFyaXNvblN0YXRlbWVudE5vZGUiLCJjb25zdHJ1Y3RvciIsIm51bWJlckxpbmUiLCJzZWxlY3RlZE9wZXJhdG9yUHJvcGVydHkiLCJ2YWxpZFZhbHVlcyIsImNvbXBhcmlzb25TdGF0ZW1lbnRSb290IiwiYWRkQ2hpbGQiLCJudW1iZXJOb2Rlc0xheWVyIiwib3BlcmF0b3JBbmRaZXJvTm9kZXNMYXllciIsIm9wZXJhdG9yU2VsZWN0aW9uTm9kZSIsIk9wZXJhdG9yU2VsZWN0b3JOb2RlIiwiYm90dG9tIiwicHJldmlvdXNOdW1iZXJOb2RlcyIsInplcm9UZXh0Tm9kZSIsImZvbnQiLCJ6ZXJvTm9kZSIsInJlY3RCb3VuZHMiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWQiLCJjaGlsZHJlbiIsImZpbGwiLCJUUkFOU1BBUkVOVCIsInN0cm9rZSIsImxpbmVXaWR0aCIsImNvbXBhcmlzb25PcGVyYXRvck5vZGVzIiwiXyIsInRpbWVzIiwiY29tcGFyaXNvbk9wZXJhdG9yTm9kZSIsInB1c2giLCJ1cGRhdGVDb21wYXJpc29uU3RhdGVtZW50IiwibnVtUG9pbnRzIiwicmVzaWRlbnRQb2ludHMiLCJsZW5ndGgiLCJhc3NlcnQiLCJjb21wYXJpc29uT3BlcmF0b3IiLCJ2YWx1ZSIsInZpc2libGUiLCJmb3JFYWNoIiwibGVmdCIsIm51bWJlck5vZGVzIiwiZ2V0Q2hpbGRyZW5Db3VudCIsInBvaW50VmFsdWVOb2RlIiwiZ2V0Q2hpbGRBdCIsInBvaW50IiwidmFsdWVQcm9wZXJ0eSIsInByZXZpb3VzUG9zaXRpb25JbkFycmF5IiwiaW5kZXhPZiIsIm9yZGVyZWROdW1iZXJOb2RlcyIsImdldENoaWxkcmVuIiwic29ydCIsInAxbm9kZSIsInAybm9kZSIsInJlc3VsdCIsInByZXZQMU5vZGVQb3NpdGlvbiIsInByZXZQMk5vZGVQb3NpdGlvbiIsIm5vZGUiLCJzbGljZSIsInJldmVyc2UiLCJjdXJyZW50WFBvcyIsImkiLCJjdXJyZW50Tm9kZSIsInJpZ2h0IiwiY29tcGFyaXNvbkNoYXJhY3RlciIsImN1cnJlbnROb2RlVmFsdWUiLCJuZXh0Tm9kZVZhbHVlIiwiTEVTU19USEFOX09SX0VRVUFMIiwiR1JFQVRFUl9USEFOX09SX0VRVUFMIiwic3RyaW5nIiwieCIsImNlbnRlclgiLCJQb2ludFZhbHVlTm9kZSIsImxhenlMaW5rIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJhZGRlZFBvaW50IiwibGluayIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJyZW1vdmVkUG9pbnQiLCJ1bmxpbmsiLCJjaGlsZE5vZGUiLCJyZW1vdmVDaGlsZCIsImRpc3Bvc2UiLCJyZXNldCIsIm9wdGlvbnMiLCJzZWxlY3RvcldpZHRoIiwic2VsZWN0b3JIZWlnaHQiLCJyb3VuZGVkQ29ybmVyUmFkaXVzIiwibGVzc1RoYW5TZWxlY3RvclNoYXBlIiwicm91bmRlZFJlY3RhbmdsZVdpdGhSYWRpaSIsInRvcExlZnQiLCJib3R0b21MZWZ0IiwibGVzc1RoYW5PcGVyYXRvclNlbGVjdG9yTm9kZSIsImN1cnNvciIsImxlc3NUaGFuVGV4dCIsImNlbnRlclkiLCJ0b3VjaEFyZWEiLCJib3VuZHMiLCJ3aXRoT2Zmc2V0cyIsImFkZElucHV0TGlzdGVuZXIiLCJmaXJlIiwiZ3JlYXRlclRoYW5TZWxlY3RvclNoYXBlIiwidG9wUmlnaHQiLCJib3R0b21SaWdodCIsImdyZWF0ZXJUaGFuT3BlcmF0b3JTZWxlY3Rvck5vZGUiLCJncmVhdGVyVGhhblRleHQiLCJzZWxlY3Rpb24iLCJtdXRhdGUiLCJiYWNrZ3JvdW5kIiwibnVtYmVyVGV4dCIsImhhbmRsZVZhbHVlQ2hhbmdlIiwic2V0UmVjdEJvdW5kcyIsImhhbmRsZUNvbG9yQ2hhbmdlIiwiY29sb3IiLCJjb2xvclV0aWxzQnJpZ2h0ZXIiLCJjb2xvclByb3BlcnR5IiwiYmFja2dyb3VuZEZhZGVBbmltYXRpb24iLCJoYW5kbGVEcmFnU3RhdGVDaGFuZ2UiLCJkcmFnZ2luZyIsInN0b3AiLCJvcGFjaXR5IiwiZHVyYXRpb24iLCJlYXNpbmciLCJDVUJJQ19PVVQiLCJzZXRWYWx1ZSIsImZyb20iLCJ0byIsInN0YXJ0IiwiZW5kZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJpc0RyYWdnaW5nUHJvcGVydHkiLCJkaXNwb3NlTnVtYmVyV2l0aENvbG9yTm9kZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ29tcGFyaXNvblN0YXRlbWVudE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29tcGFyaXNvblN0YXRlbWVudE5vZGUgaXMgYSBTY2VuZXJ5IG5vZGUgdGhhdCBkZXBpY3RzIGEgXCJjb21wYXJpc29uIHN0YXRlbWVudFwiIGJldHdlZW4gemVybyB0byB0aHJlZSBudW1lcmljYWxcclxuICogdmFsdWVzLCBmb3IgZXhhbXBsZSwgXCIxIDwgNSA8IDdcIi4gIEl0IGFsc28gaW5jbHVkZXMgYSBzZWxlY3RvciB0aGF0IGFsbG93cyBhIHVzZXIgdG8gY2hvb3NlIGJldHdlZW4gdGhlIGdyZWF0ZXIgdGhhblxyXG4gKiBvciBsZXNzIHRoYW4gY29tcGFyaXNvbiBvcGVyYXRvci5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbHMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIEZpcmVMaXN0ZW5lciwgTm9kZSwgUGF0aCwgUmVjdGFuZ2xlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9BbmltYXRpb24uanMnO1xyXG5pbXBvcnQgRWFzaW5nIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0Vhc2luZy5qcyc7XHJcbmltcG9ydCBudW1iZXJMaW5lSW50ZWdlcnMgZnJvbSAnLi4vLi4vbnVtYmVyTGluZUludGVnZXJzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBDT01QQVJJU09OX1NUQVRFTUVOVF9GT05UID0gbmV3IFBoZXRGb250KCAyNiApO1xyXG5jb25zdCBDT01QQVJJU09OX1NUQVRFTUVOVF9TUEFDSU5HID0gNjsgLy8gaW4gc2NyZWVuIGNvb3Jkc1xyXG5jb25zdCBOVU1CRVJfQkFDS0dST1VORF9ESUxBVElPTl9BTU9VTlQgPSAzO1xyXG5jb25zdCBOVU1CRVJfQkFDS0dST1VORF9MSU5FX1dJRFRIID0gMjtcclxuY29uc3QgQlVUVE9OX1RPVUNIX0RJTEFUSU9OID0gODtcclxuY29uc3QgR1JFQVRFUl9USEFOX1NUUklORyA9IE1hdGhTeW1ib2xzLkdSRUFURVJfVEhBTjtcclxuY29uc3QgTEVTU19USEFOX1NUUklORyA9IE1hdGhTeW1ib2xzLkxFU1NfVEhBTjtcclxuY29uc3QgREVGQVVMVF9DT01QQVJJU09OX1NFTEVDVE9SX0ZPTlQgPSBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMjAsIHdlaWdodDogJ2JvbGQnIH0gKTtcclxuY29uc3QgU0VMRUNURURfT1BFUkFUT1JfVEVYVF9DT0xPUiA9ICcjMDAwMDAwJztcclxuY29uc3QgU0VMRUNURURfT1BFUkFUT1JfQkFDS0dST1VORF9DT0xPUiA9ICcjZDNkM2QzJztcclxuY29uc3QgVU5TRUxFQ1RFRF9PUEVSQVRPUl9URVhUX0NPTE9SID0gJyM5NDk0OTQnO1xyXG5jb25zdCBVTlNFTEVDVEVEX09QRVJBVE9SX0JBQ0tHUk9VTkRfQ09MT1IgPSAnI2ZmZmZmZic7XHJcblxyXG5jbGFzcyBDb21wYXJpc29uU3RhdGVtZW50Tm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge051bWJlckxpbmV9IG51bWJlckxpbmUgLSB0aGUgbnVtYmVyIGxpbmUgd2hvc2UgcG9pbnQgdmFsdWVzIGFyZSBiZWluZyBkZXBpY3RlZFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbnVtYmVyTGluZSApIHtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBjb250cm9scyB3aGF0IGNvbXBhcmlzb24gb3BlcmF0b3IgaXMgdXNlZFxyXG4gICAgdGhpcy5zZWxlY3RlZE9wZXJhdG9yUHJvcGVydHkgPSBuZXcgU3RyaW5nUHJvcGVydHkoIExFU1NfVEhBTl9TVFJJTkcsIHtcclxuICAgICAgdmFsaWRWYWx1ZXM6IFsgR1JFQVRFUl9USEFOX1NUUklORywgTEVTU19USEFOX1NUUklORyBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY29tcGFyaXNvbiBzdGF0ZW1lbnQgcm9vdCBub2RlXHJcbiAgICBjb25zdCBjb21wYXJpc29uU3RhdGVtZW50Um9vdCA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBjb21wYXJpc29uU3RhdGVtZW50Um9vdCApO1xyXG5cclxuICAgIC8vIFRoZSBjb21wYXJpc29uIHN0YXRlbWVudCBoYXMgbnVtYmVycyBhbmQgb3BlcmF0b3JzIHRoYXQgcmVzaWRlIG9uIGRpZmZlcmVudCByb290IG5vZGVzIGZvciBlYXNpZXIgbWFuaXB1bGF0aW9uLlxyXG4gICAgY29uc3QgbnVtYmVyTm9kZXNMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICBjb21wYXJpc29uU3RhdGVtZW50Um9vdC5hZGRDaGlsZCggbnVtYmVyTm9kZXNMYXllciApO1xyXG4gICAgY29uc3Qgb3BlcmF0b3JBbmRaZXJvTm9kZXNMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICBjb21wYXJpc29uU3RhdGVtZW50Um9vdC5hZGRDaGlsZCggb3BlcmF0b3JBbmRaZXJvTm9kZXNMYXllciApO1xyXG5cclxuICAgIC8vIG9wZXJhdG9yIHNlbGVjdG9yIG5vZGUgLSBhbGxvd3MgdGhlIHVzZXIgdG8gY2hvb3NlIGJldHdlZW4gZ3JlYXRlciB0aGFuIG9yIGxlc3MgdGhhblxyXG4gICAgY29uc3Qgb3BlcmF0b3JTZWxlY3Rpb25Ob2RlID0gbmV3IE9wZXJhdG9yU2VsZWN0b3JOb2RlKCB0aGlzLnNlbGVjdGVkT3BlcmF0b3JQcm9wZXJ0eSwge1xyXG4gICAgICBib3R0b206IDQgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBhbGlnbiB2ZXJ0aWNhbGx5IHdpdGggdGhlIGNvbXBhcmlzb24gc3RhdGVtZW50XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBvcGVyYXRvclNlbGVjdGlvbk5vZGUgKTtcclxuXHJcbiAgICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBwcmV2aW91cyBudW1iZXIgbm9kZSBhcnJheSwgdXNlZCB0byBoZWxwIHdpdGggc29ydGluZy5cclxuICAgIGxldCBwcmV2aW91c051bWJlck5vZGVzID0gW107XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgbm9kZSB0aGF0IGluZGljYXRlcyBhIHplcm8sIGJ1dCBoYXMgYSBiYWNrZ3JvdW5kIGxpa2UgdGhlIG90aGVyIG51bWJlcnMgc28gdGhhdCBpdHMgaGVpZ2h0IGlzIHRoZSBzYW1lLlxyXG4gICAgY29uc3QgemVyb1RleHROb2RlID0gbmV3IFRleHQoICcwJywgeyBmb250OiBDT01QQVJJU09OX1NUQVRFTUVOVF9GT05UIH0gKTtcclxuICAgIGNvbnN0IHplcm9Ob2RlID0gbmV3IFJlY3RhbmdsZSgge1xyXG4gICAgICByZWN0Qm91bmRzOiB6ZXJvVGV4dE5vZGUubG9jYWxCb3VuZHMuZGlsYXRlZCggTlVNQkVSX0JBQ0tHUk9VTkRfRElMQVRJT05fQU1PVU5UICksXHJcbiAgICAgIGNoaWxkcmVuOiBbIHplcm9UZXh0Tm9kZSBdLFxyXG4gICAgICBmaWxsOiBDb2xvci5UUkFOU1BBUkVOVCxcclxuICAgICAgc3Ryb2tlOiBDb2xvci5UUkFOU1BBUkVOVCxcclxuICAgICAgbGluZVdpZHRoOiBOVU1CRVJfQkFDS0dST1VORF9MSU5FX1dJRFRIXHJcbiAgICB9ICk7XHJcbiAgICBvcGVyYXRvckFuZFplcm9Ob2Rlc0xheWVyLmFkZENoaWxkKCB6ZXJvTm9kZSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSBub2RlcyB0aGF0IHdpbGwgYmUgdXNlZCB0byBkZXBpY3QgdGhlIGNvbXBhcmlzb24gb3BlcmF0b3JzLlxyXG4gICAgY29uc3QgY29tcGFyaXNvbk9wZXJhdG9yTm9kZXMgPSBbXTtcclxuICAgIF8udGltZXMoIDIsICgpID0+IHtcclxuXHJcbiAgICAgIC8vIEdpdmUgdGhlc2UgYW4gYXJiaXRyYXJ5IHZhbHVlIHRvIHN0YXJ0IHdpdGgsIHRoZXkgd2lsbCBiZSB1cGRhdGVkIGxhdGVyLlxyXG4gICAgICBjb25zdCBjb21wYXJpc29uT3BlcmF0b3JOb2RlID0gbmV3IFRleHQoIEdSRUFURVJfVEhBTl9TVFJJTkcsIHtcclxuICAgICAgICBmb250OiBDT01QQVJJU09OX1NUQVRFTUVOVF9GT05UXHJcbiAgICAgIH0gKTtcclxuICAgICAgb3BlcmF0b3JBbmRaZXJvTm9kZXNMYXllci5hZGRDaGlsZCggY29tcGFyaXNvbk9wZXJhdG9yTm9kZSApO1xyXG4gICAgICBjb21wYXJpc29uT3BlcmF0b3JOb2Rlcy5wdXNoKCBjb21wYXJpc29uT3BlcmF0b3JOb2RlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRGVmaW5lIGEgZnVuY3Rpb24gdG8gdXBkYXRlIHRoZSBjb21wYXJpc29uIHN0YXRlbWVudCwgaW5jbHVkaW5nIGl0cyBsYXlvdXQuXHJcbiAgICBjb25zdCB1cGRhdGVDb21wYXJpc29uU3RhdGVtZW50ID0gKCkgPT4ge1xyXG5cclxuICAgICAgY29uc3QgbnVtUG9pbnRzID0gbnVtYmVyTGluZS5yZXNpZGVudFBvaW50cy5sZW5ndGg7XHJcblxyXG4gICAgICAvLyBWZXJpZnkgdGhhdCB0aGlzIGZ1bmN0aW9uIGlzbid0IGJlaW5nIGFza2VkIHRvIGhhbmRsZSBtb3JlIHBvaW50cyB0aGFuIGl0IGlzIGRlc2lnbmVkIGZvci5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbnVtUG9pbnRzIDw9IDMsICd0b28gbWFueSBwb2ludHMgb24gbnVtYmVyIGxpbmUnICk7XHJcblxyXG4gICAgICBjb25zdCBjb21wYXJpc29uT3BlcmF0b3IgPSB0aGlzLnNlbGVjdGVkT3BlcmF0b3JQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgIC8vIEhpZGUgb3BlcmF0b3JzIGFuZCB6ZXJvcyBmb3Igbm93LCB3aWxsIGJlIG1hZGUgdmlzaWJsZSBhcyBuZWVkZWQgYnkgdGhlIGNvZGUgYmVsb3cuXHJcbiAgICAgIHplcm9Ob2RlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgY29tcGFyaXNvbk9wZXJhdG9yTm9kZXMuZm9yRWFjaCggY29tcGFyaXNvbk9wZXJhdG9yTm9kZSA9PiB7XHJcbiAgICAgICAgY29tcGFyaXNvbk9wZXJhdG9yTm9kZS52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIFBvc2l0aW9uIHRoaXMgc28gdGhhdCBpdCB3b24ndCBhZmZlY3QgdGhlIG92ZXJhbGwgYm91bmRzIGlmIGl0IGlzIG5vdCBiZWluZyB1c2VkLlxyXG4gICAgICAgIGNvbXBhcmlzb25PcGVyYXRvck5vZGUubGVmdCA9IDA7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIGxpc3Qgb2YgYWxsIG5vZGVzIHRoYXQgd2lsbCBkZXBpY3QgbnVtYmVycywgaW5jbHVkaW5nIHplcm8gbm9kZXMgdGhhdCBkb24ndCBjb3JyZXNwb25kIHRvIGEgcG9pbnRcclxuICAgICAgY29uc3QgbnVtYmVyTm9kZXMgPSBbXTtcclxuXHJcbiAgICAgIC8vIE5PVEU6IEluIG9yZGVyIGZvciB0aGUgY29kZSBiZWxvdyB0byBtYWtlIHNlbnNlLCBpdCdzIGltcG9ydGFudCB0byB1bmRlcnN0YW5kIHRoYXQgdGhlIG51bWJlck5vZGVzTGF5ZXIgaXNcclxuICAgICAgLy8gcG9wdWxhdGVkIHdpdGggbnVtYmVyIG5vZGVzIGVsc2V3aGVyZSBpbiB0aGlzIGZpbGUgd2hlbmV2ZXIgcG9pbnRzIGFyZSBhZGRlZCB0byBvciByZW1vdmVkIGZyb20gdGhlXHJcbiAgICAgIC8vIGNvcnJlc3BvbmRpbmcgbnVtYmVyIGxpbmUuXHJcblxyXG4gICAgICBpZiAoIG51bWJlck5vZGVzTGF5ZXIuZ2V0Q2hpbGRyZW5Db3VudCgpID09PSAwICkge1xyXG5cclxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gcG9pbnRzIG9uIHRoZSBudW1iZXIgbGluZSwganVzdCBzaG93IGEgemVyby5cclxuICAgICAgICB6ZXJvTm9kZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgbnVtYmVyTm9kZXMucHVzaCggemVyb05vZGUgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggbnVtYmVyTm9kZXNMYXllci5nZXRDaGlsZHJlbkNvdW50KCkgPT09IDEgKSB7XHJcblxyXG4gICAgICAgIC8vIFRoZXJlIGlzIG9ubHkgb25lIG51bWJlciBub2RlLCBzbyBzaG93IGl0IGNvbXBhcmVkIHRvIHplcm8uXHJcbiAgICAgICAgY29uc3QgcG9pbnRWYWx1ZU5vZGUgPSBudW1iZXJOb2Rlc0xheWVyLmdldENoaWxkQXQoIDAgKTtcclxuICAgICAgICB6ZXJvTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gQWRkIG5vZGVzIHRvIHRoZSBsaXN0IGluIGFzY2VuZGluZyBvcmRlci5cclxuICAgICAgICBpZiAoIHBvaW50VmFsdWVOb2RlLnBvaW50LnZhbHVlUHJvcGVydHkudmFsdWUgPCAwICkge1xyXG4gICAgICAgICAgbnVtYmVyTm9kZXMucHVzaCggcG9pbnRWYWx1ZU5vZGUgKTtcclxuICAgICAgICAgIG51bWJlck5vZGVzLnB1c2goIHplcm9Ob2RlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBwb2ludFZhbHVlTm9kZS5wb2ludC52YWx1ZVByb3BlcnR5LnZhbHVlID4gMCApIHtcclxuICAgICAgICAgIG51bWJlck5vZGVzLnB1c2goIHplcm9Ob2RlICk7XHJcbiAgICAgICAgICBudW1iZXJOb2Rlcy5wdXNoKCBwb2ludFZhbHVlTm9kZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBUaGUgbm9kZSB2YWx1ZSBpcyBlcXVhbCB0byB6ZXJvLCBzbyBzb3J0IGl0IGJhc2VkIG9uIHRoZSBwcmV2aW91cyBwb3NpdGlvbi5cclxuICAgICAgICAgIGNvbnN0IHByZXZpb3VzUG9zaXRpb25JbkFycmF5ID0gcHJldmlvdXNOdW1iZXJOb2Rlcy5pbmRleE9mKCBwb2ludFZhbHVlTm9kZSApO1xyXG4gICAgICAgICAgaWYgKCBwcmV2aW91c1Bvc2l0aW9uSW5BcnJheSA9PT0gMCApIHtcclxuICAgICAgICAgICAgbnVtYmVyTm9kZXMucHVzaCggcG9pbnRWYWx1ZU5vZGUgKTtcclxuICAgICAgICAgICAgbnVtYmVyTm9kZXMucHVzaCggemVyb05vZGUgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBudW1iZXJOb2Rlcy5wdXNoKCB6ZXJvTm9kZSApO1xyXG4gICAgICAgICAgICBudW1iZXJOb2Rlcy5wdXNoKCBwb2ludFZhbHVlTm9kZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gVGhlcmUgYXJlIHR3byBvciBtb3JlIG51bWJlciB2YWx1ZXMgYmVpbmcgZGlzcGxheWVkLiAgR2V0IGEgbGlzdCBvZiBudW1iZXIgbm9kZXMgYW5kIHNvcnQgdGhlbSBiYXNlZCBvblxyXG4gICAgICAgIC8vIHRoZWlyIHZhbHVlcy4gIElmIHRoZSB2YWx1ZXMgYXJlIGVxdWFsLCB1c2UgdGhlIHByZXZpb3VzIHBvc2l0aW9uIGluIHRoZSBvcmRlciBhcnJheS5cclxuICAgICAgICBjb25zdCBvcmRlcmVkTnVtYmVyTm9kZXMgPSBudW1iZXJOb2Rlc0xheWVyLmdldENoaWxkcmVuKCkuc29ydCggKCBwMW5vZGUsIHAybm9kZSApID0+IHtcclxuICAgICAgICAgIGxldCByZXN1bHQ7XHJcbiAgICAgICAgICBpZiAoIHAxbm9kZS5wb2ludC52YWx1ZVByb3BlcnR5LnZhbHVlICE9PSBwMm5vZGUucG9pbnQudmFsdWVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcDFub2RlLnBvaW50LnZhbHVlUHJvcGVydHkudmFsdWUgLSBwMm5vZGUucG9pbnQudmFsdWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlIGN1cnJlbnQgdmFsdWVzIGFyZSBlcXVhbCwgc28gdXNlIHRoZSBwcmV2aW91cyBwb3NpdGlvbiBpbiB0aGUgb3JkZXJlZCBhcnJheS5cclxuICAgICAgICAgICAgY29uc3QgcHJldlAxTm9kZVBvc2l0aW9uID0gcHJldmlvdXNOdW1iZXJOb2Rlcy5pbmRleE9mKCBwMW5vZGUgKTtcclxuICAgICAgICAgICAgY29uc3QgcHJldlAyTm9kZVBvc2l0aW9uID0gcHJldmlvdXNOdW1iZXJOb2Rlcy5pbmRleE9mKCBwMm5vZGUgKTtcclxuICAgICAgICAgICAgaWYgKCBwcmV2UDFOb2RlUG9zaXRpb24gPiAtMSAmJiBwcmV2UDJOb2RlUG9zaXRpb24gPiAtMSApIHtcclxuICAgICAgICAgICAgICByZXN1bHQgPSBwcmV2UDFOb2RlUG9zaXRpb24gLSBwcmV2UDJOb2RlUG9zaXRpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIE9uZSBvZiB0aGUgcG9pbnRzIG11c3QgaGF2ZSBqdXN0IGJlZW4gYWRkZWQgcmlnaHQgb24gdG9wIG9mIHRoZSBvdGhlciwgc28gY2FsbCB0aGVtIGVxdWFsLlxyXG4gICAgICAgICAgICAgIHJlc3VsdCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAvLyBBZGQgdGhlIG5vZGVzIGluIG9yZGVyIHRvIHRoZSBsaXN0IG9mIHZhbHVlIG5vZGVzLlxyXG4gICAgICAgIG9yZGVyZWROdW1iZXJOb2Rlcy5mb3JFYWNoKCBub2RlID0+IHsgbnVtYmVyTm9kZXMucHVzaCggbm9kZSApOyB9ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNhdmUgdGhlIG9yZGVyZWQgbGlzdCBpbiBjYXNlIHdlIG5lZWQgaXQgZm9yIGNvbXBhcmlzb24gcHVycG9zZXMgdGhlIG5leHQgdGltZSB3ZSBvcmRlciB0aGVtLlxyXG4gICAgICBwcmV2aW91c051bWJlck5vZGVzID0gbnVtYmVyTm9kZXMuc2xpY2UoKTtcclxuXHJcbiAgICAgIC8vIEFib3ZlLCB0aGUgbm9kZXMgYXJlIHNvcnRlZCBpbiBhc2NlbmRpbmcgb3JkZXIsIHNvIHRoZXkgbmVlZCB0byBiZSByZXZlcnNlZCBpZiB1c2luZyB0aGUgJz4nIG9wZXJhdG9yLlxyXG4gICAgICBpZiAoIGNvbXBhcmlzb25PcGVyYXRvciA9PT0gR1JFQVRFUl9USEFOX1NUUklORyApIHtcclxuICAgICAgICBudW1iZXJOb2Rlcy5yZXZlcnNlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEF0IHRoaXMgcG9pbnQgd2Ugc2hvdWxkIGhhdmUgYW4gb3JkZXJlZCBsaXN0IG9mIG51bWJlciBub2Rlcywgc28gc2V0IHRoZWlyIHBvc2l0aW9ucy5cclxuICAgICAgbGV0IGN1cnJlbnRYUG9zID0gMDtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyTm9kZXMubGVuZ3RoOyBpKysgKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnROb2RlID0gbnVtYmVyTm9kZXNbIGkgXTtcclxuICAgICAgICBjdXJyZW50Tm9kZS5sZWZ0ID0gY3VycmVudFhQb3M7XHJcbiAgICAgICAgY3VycmVudFhQb3MgPSBjdXJyZW50Tm9kZS5yaWdodCArIENPTVBBUklTT05fU1RBVEVNRU5UX1NQQUNJTkc7XHJcblxyXG4gICAgICAgIC8vIElmIHRoaXMgaXNuJ3QgdGhlIGxhc3QgbnVtYmVyIG5vZGUgYSBjb21wYXJpc29uIG9wZXJhdG9yIHdpbGwgYmUgbmVlZGVkLlxyXG4gICAgICAgIGlmICggaSA8IG51bWJlck5vZGVzLmxlbmd0aCAtIDEgKSB7XHJcbiAgICAgICAgICBsZXQgY29tcGFyaXNvbkNoYXJhY3RlciA9IGNvbXBhcmlzb25PcGVyYXRvcjtcclxuICAgICAgICAgIGNvbnN0IGN1cnJlbnROb2RlVmFsdWUgPSBjdXJyZW50Tm9kZS5wb2ludCA/IGN1cnJlbnROb2RlLnBvaW50LnZhbHVlUHJvcGVydHkudmFsdWUgOiAwO1xyXG4gICAgICAgICAgY29uc3QgbmV4dE5vZGVWYWx1ZSA9IG51bWJlck5vZGVzWyBpICsgMSBdLnBvaW50ID8gbnVtYmVyTm9kZXNbIGkgKyAxIF0ucG9pbnQudmFsdWVQcm9wZXJ0eS52YWx1ZSA6IDA7XHJcbiAgICAgICAgICBpZiAoIGN1cnJlbnROb2RlVmFsdWUgPT09IG5leHROb2RlVmFsdWUgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgdmFsdWVzIGFyZSBlcXVhbCwgc28gd2UgbmVlZCB0byB1c2UgbGVzcy10aGFuLW9yLWVxdWFsIG9yIGdyZWF0ZXItdGhhbi1vci1lcXVhbCBjb21wYXJpc29uIG9wZXJhdG9yLlxyXG4gICAgICAgICAgICBjb21wYXJpc29uQ2hhcmFjdGVyID0gY29tcGFyaXNvbk9wZXJhdG9yID09PSBMRVNTX1RIQU5fU1RSSU5HID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGhTeW1ib2xzLkxFU1NfVEhBTl9PUl9FUVVBTCA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoU3ltYm9scy5HUkVBVEVSX1RIQU5fT1JfRVFVQUw7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBjb21wYXJpc29uT3BlcmF0b3JOb2RlID0gY29tcGFyaXNvbk9wZXJhdG9yTm9kZXNbIGkgXTtcclxuICAgICAgICAgIGNvbXBhcmlzb25PcGVyYXRvck5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICBpZiAoIGNvbXBhcmlzb25PcGVyYXRvck5vZGUuc3RyaW5nICE9PSBjb21wYXJpc29uQ2hhcmFjdGVyICkge1xyXG5cclxuICAgICAgICAgICAgLy8gb3B0aW1pemF0aW9uIC0gb25seSBzZXQgdGhlIHN0cmluZyBpZiBpdCdzIG5vdCBjb3JyZWN0LCBzYXZlcyB0aW1lIHJlZXZhbHVhdGluZyBib3VuZHNcclxuICAgICAgICAgICAgaWYgKCBjb21wYXJpc29uT3BlcmF0b3JOb2RlLnN0cmluZyAhPT0gY29tcGFyaXNvbkNoYXJhY3RlciApIHtcclxuICAgICAgICAgICAgICBjb21wYXJpc29uT3BlcmF0b3JOb2RlLnN0cmluZyA9IGNvbXBhcmlzb25DaGFyYWN0ZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbXBhcmlzb25PcGVyYXRvck5vZGUueCA9IGN1cnJlbnRYUG9zO1xyXG4gICAgICAgICAgY3VycmVudFhQb3MgPSBjb21wYXJpc29uT3BlcmF0b3JOb2RlLnJpZ2h0ICsgQ09NUEFSSVNPTl9TVEFURU1FTlRfU1BBQ0lORztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbXBhcmlzb25TdGF0ZW1lbnRSb290LmNlbnRlclggPSAwO1xyXG4gICAgICBvcGVyYXRvclNlbGVjdGlvbk5vZGUubGVmdCA9IDEyMDsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBBZGQgb3IgcmVtb3ZlIG51bWJlciBub2RlcyBhbmQgb3RoZXJ3aXNlIHVwZGF0ZSB0aGUgY29tcGFyaXNvbiBzdGF0ZW1lbnQgYXMgcG9pbnRzIGFwcGVhciwgbW92ZSwgYW5kIGRpc2FwcGVhci5cclxuICAgIG51bWJlckxpbmUucmVzaWRlbnRQb2ludHMuZm9yRWFjaCggcG9pbnQgPT4ge1xyXG4gICAgICBudW1iZXJOb2Rlc0xheWVyLmFkZENoaWxkKCBuZXcgUG9pbnRWYWx1ZU5vZGUoIHBvaW50ICkgKTtcclxuICAgICAgcG9pbnQudmFsdWVQcm9wZXJ0eS5sYXp5TGluayggdXBkYXRlQ29tcGFyaXNvblN0YXRlbWVudCApO1xyXG4gICAgfSApO1xyXG4gICAgbnVtYmVyTGluZS5yZXNpZGVudFBvaW50cy5hZGRJdGVtQWRkZWRMaXN0ZW5lciggYWRkZWRQb2ludCA9PiB7XHJcbiAgICAgIG51bWJlck5vZGVzTGF5ZXIuYWRkQ2hpbGQoIG5ldyBQb2ludFZhbHVlTm9kZSggYWRkZWRQb2ludCApICk7XHJcbiAgICAgIGFkZGVkUG9pbnQudmFsdWVQcm9wZXJ0eS5saW5rKCB1cGRhdGVDb21wYXJpc29uU3RhdGVtZW50ICk7XHJcbiAgICB9ICk7XHJcbiAgICBudW1iZXJMaW5lLnJlc2lkZW50UG9pbnRzLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIHJlbW92ZWRQb2ludCA9PiB7XHJcbiAgICAgIHJlbW92ZWRQb2ludC52YWx1ZVByb3BlcnR5LnVubGluayggdXBkYXRlQ29tcGFyaXNvblN0YXRlbWVudCApO1xyXG4gICAgICBudW1iZXJOb2Rlc0xheWVyLmdldENoaWxkcmVuKCkuZm9yRWFjaCggY2hpbGROb2RlID0+IHtcclxuICAgICAgICBpZiAoIGNoaWxkTm9kZS5wb2ludCA9PT0gcmVtb3ZlZFBvaW50ICkge1xyXG4gICAgICAgICAgbnVtYmVyTm9kZXNMYXllci5yZW1vdmVDaGlsZCggY2hpbGROb2RlICk7XHJcbiAgICAgICAgICBjaGlsZE5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgICB1cGRhdGVDb21wYXJpc29uU3RhdGVtZW50KCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBjb21wYXJpc29uIHN0YXRlbWVudCBvZiB0aGUgY2hvc2VuIG9wZXJhdG9yIGNoYW5nZXMsIHRoaXMgYWxzbyBkb2VzIHRoZSBpbml0aWFsIHVwZGF0ZS5cclxuICAgIHRoaXMuc2VsZWN0ZWRPcGVyYXRvclByb3BlcnR5LmxpbmsoIHVwZGF0ZUNvbXBhcmlzb25TdGF0ZW1lbnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuc2VsZWN0ZWRPcGVyYXRvclByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBpbm5lciBjbGFzcyB0aGF0IGRlZmluZXMgdGhlIG9wZXJhdG9yIHNlbGVjdG9yIGNvbnRyb2xcclxuY2xhc3MgT3BlcmF0b3JTZWxlY3Rvck5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtTdHJpbmdQcm9wZXJ0eX0gc2VsZWN0ZWRPcGVyYXRvclByb3BlcnR5IC0gcHJvcGVydHkgY29udHJvbGxlZCBieSB0aGlzIHNlbGVjdG9yIG5vZGVcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBzZWxlY3RlZE9wZXJhdG9yUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHNlbGVjdG9yV2lkdGg6IDI1LFxyXG4gICAgICBzZWxlY3RvckhlaWdodDogMjUsXHJcbiAgICAgIGZvbnQ6IERFRkFVTFRfQ09NUEFSSVNPTl9TRUxFQ1RPUl9GT05ULFxyXG4gICAgICByb3VuZGVkQ29ybmVyUmFkaXVzOiA1XHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGJ1dHRvbiBmb3Igc2VsZWN0aW5nIHRoZSBcImxlc3MgdGhhblwiIG9wZXJhdG9yLlxyXG4gICAgY29uc3QgbGVzc1RoYW5TZWxlY3RvclNoYXBlID0gU2hhcGUucm91bmRlZFJlY3RhbmdsZVdpdGhSYWRpaShcclxuICAgICAgLW9wdGlvbnMuc2VsZWN0b3JXaWR0aCxcclxuICAgICAgLW9wdGlvbnMuc2VsZWN0b3JIZWlnaHQgLyAyLFxyXG4gICAgICBvcHRpb25zLnNlbGVjdG9yV2lkdGgsXHJcbiAgICAgIG9wdGlvbnMuc2VsZWN0b3JIZWlnaHQsXHJcbiAgICAgIHsgdG9wTGVmdDogb3B0aW9ucy5yb3VuZGVkQ29ybmVyUmFkaXVzLCBib3R0b21MZWZ0OiBvcHRpb25zLnJvdW5kZWRDb3JuZXJSYWRpdXMgfVxyXG4gICAgKTtcclxuICAgIGNvbnN0IGxlc3NUaGFuT3BlcmF0b3JTZWxlY3Rvck5vZGUgPSBuZXcgUGF0aCggbGVzc1RoYW5TZWxlY3RvclNoYXBlLCB7XHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcidcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGxlc3NUaGFuVGV4dCA9IG5ldyBUZXh0KCBMRVNTX1RIQU5fU1RSSU5HLCB7XHJcbiAgICAgIGZvbnQ6IG9wdGlvbnMuZm9udCxcclxuICAgICAgY2VudGVyWDogbGVzc1RoYW5PcGVyYXRvclNlbGVjdG9yTm9kZS5jZW50ZXJYLFxyXG4gICAgICBjZW50ZXJZOiAwXHJcbiAgICB9ICk7XHJcbiAgICBsZXNzVGhhbk9wZXJhdG9yU2VsZWN0b3JOb2RlLmFkZENoaWxkKCBsZXNzVGhhblRleHQgKTtcclxuICAgIGxlc3NUaGFuT3BlcmF0b3JTZWxlY3Rvck5vZGUudG91Y2hBcmVhID0gbGVzc1RoYW5PcGVyYXRvclNlbGVjdG9yTm9kZS5ib3VuZHMud2l0aE9mZnNldHMoXHJcbiAgICAgIEJVVFRPTl9UT1VDSF9ESUxBVElPTiwgQlVUVE9OX1RPVUNIX0RJTEFUSU9OLCAwLCBCVVRUT05fVE9VQ0hfRElMQVRJT05cclxuICAgICk7XHJcbiAgICBsZXNzVGhhbk9wZXJhdG9yU2VsZWN0b3JOb2RlLmFkZElucHV0TGlzdGVuZXIoIG5ldyBGaXJlTGlzdGVuZXIoIHtcclxuICAgICAgZmlyZTogKCkgPT4ge1xyXG4gICAgICAgIHNlbGVjdGVkT3BlcmF0b3JQcm9wZXJ0eS52YWx1ZSA9IExFU1NfVEhBTl9TVFJJTkc7XHJcbiAgICAgIH1cclxuICAgIH0gKSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbGVzc1RoYW5PcGVyYXRvclNlbGVjdG9yTm9kZSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgYnV0dG9uIGZvciBzZWxlY3RpbmcgdGhlIFwiZ3JlYXRlciB0aGFuXCIgb3BlcmF0b3IuXHJcbiAgICBjb25zdCBncmVhdGVyVGhhblNlbGVjdG9yU2hhcGUgPSBTaGFwZS5yb3VuZGVkUmVjdGFuZ2xlV2l0aFJhZGlpKFxyXG4gICAgICAwLFxyXG4gICAgICAtb3B0aW9ucy5zZWxlY3RvckhlaWdodCAvIDIsXHJcbiAgICAgIG9wdGlvbnMuc2VsZWN0b3JXaWR0aCxcclxuICAgICAgb3B0aW9ucy5zZWxlY3RvckhlaWdodCxcclxuICAgICAgeyB0b3BSaWdodDogb3B0aW9ucy5yb3VuZGVkQ29ybmVyUmFkaXVzLCBib3R0b21SaWdodDogb3B0aW9ucy5yb3VuZGVkQ29ybmVyUmFkaXVzIH1cclxuICAgICk7XHJcbiAgICBjb25zdCBncmVhdGVyVGhhbk9wZXJhdG9yU2VsZWN0b3JOb2RlID0gbmV3IFBhdGgoIGdyZWF0ZXJUaGFuU2VsZWN0b3JTaGFwZSwge1xyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBncmVhdGVyVGhhblRleHQgPSBuZXcgVGV4dCggR1JFQVRFUl9USEFOX1NUUklORywge1xyXG4gICAgICBmb250OiBvcHRpb25zLmZvbnQsXHJcbiAgICAgIGNlbnRlclg6IGdyZWF0ZXJUaGFuT3BlcmF0b3JTZWxlY3Rvck5vZGUuY2VudGVyWCxcclxuICAgICAgY2VudGVyWTogMFxyXG4gICAgfSApO1xyXG4gICAgZ3JlYXRlclRoYW5PcGVyYXRvclNlbGVjdG9yTm9kZS5hZGRDaGlsZCggZ3JlYXRlclRoYW5UZXh0ICk7XHJcbiAgICBncmVhdGVyVGhhbk9wZXJhdG9yU2VsZWN0b3JOb2RlLnRvdWNoQXJlYSA9IGdyZWF0ZXJUaGFuT3BlcmF0b3JTZWxlY3Rvck5vZGUuYm91bmRzLndpdGhPZmZzZXRzKFxyXG4gICAgICAwLCBCVVRUT05fVE9VQ0hfRElMQVRJT04sIEJVVFRPTl9UT1VDSF9ESUxBVElPTiwgQlVUVE9OX1RPVUNIX0RJTEFUSU9OXHJcbiAgICApO1xyXG4gICAgZ3JlYXRlclRoYW5PcGVyYXRvclNlbGVjdG9yTm9kZS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRmlyZUxpc3RlbmVyKCB7XHJcbiAgICAgIGZpcmU6ICgpID0+IHtcclxuICAgICAgICBzZWxlY3RlZE9wZXJhdG9yUHJvcGVydHkudmFsdWUgPSBHUkVBVEVSX1RIQU5fU1RSSU5HO1xyXG4gICAgICB9XHJcbiAgICB9ICkgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGdyZWF0ZXJUaGFuT3BlcmF0b3JTZWxlY3Rvck5vZGUgKTtcclxuXHJcbiAgICAvLyBDb250cm9sIHRoZSBhcHBlYXJhbmNlIG9mIGVhY2ggc2VsZWN0b3IgYmFzZWQgb24gdGhlIGN1cnJlbnQgc2VsZWN0aW9uIHN0YXRlLlxyXG4gICAgc2VsZWN0ZWRPcGVyYXRvclByb3BlcnR5LmxpbmsoIHNlbGVjdGlvbiA9PiB7XHJcbiAgICAgIGlmICggc2VsZWN0aW9uID09PSBMRVNTX1RIQU5fU1RSSU5HICkge1xyXG4gICAgICAgIGxlc3NUaGFuVGV4dC5maWxsID0gU0VMRUNURURfT1BFUkFUT1JfVEVYVF9DT0xPUjtcclxuICAgICAgICBsZXNzVGhhbk9wZXJhdG9yU2VsZWN0b3JOb2RlLmZpbGwgPSBTRUxFQ1RFRF9PUEVSQVRPUl9CQUNLR1JPVU5EX0NPTE9SO1xyXG4gICAgICAgIGdyZWF0ZXJUaGFuVGV4dC5maWxsID0gVU5TRUxFQ1RFRF9PUEVSQVRPUl9URVhUX0NPTE9SO1xyXG4gICAgICAgIGdyZWF0ZXJUaGFuT3BlcmF0b3JTZWxlY3Rvck5vZGUuZmlsbCA9IFVOU0VMRUNURURfT1BFUkFUT1JfQkFDS0dST1VORF9DT0xPUjtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBsZXNzVGhhblRleHQuZmlsbCA9IFVOU0VMRUNURURfT1BFUkFUT1JfVEVYVF9DT0xPUjtcclxuICAgICAgICBsZXNzVGhhbk9wZXJhdG9yU2VsZWN0b3JOb2RlLmZpbGwgPSBVTlNFTEVDVEVEX09QRVJBVE9SX0JBQ0tHUk9VTkRfQ09MT1I7XHJcbiAgICAgICAgZ3JlYXRlclRoYW5UZXh0LmZpbGwgPSBTRUxFQ1RFRF9PUEVSQVRPUl9URVhUX0NPTE9SO1xyXG4gICAgICAgIGdyZWF0ZXJUaGFuT3BlcmF0b3JTZWxlY3Rvck5vZGUuZmlsbCA9IFNFTEVDVEVEX09QRVJBVE9SX0JBQ0tHUk9VTkRfQ09MT1I7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gaW5uZXIgY2xhc3MgdGhhdCBpcyB1c2VkIHRvIHBvcnRyYXkgdGhlIG51bWVyaWNhbCB2YWx1ZSBvZiBhIG51bWJlciBsaW5lIHBvaW50XHJcbmNsYXNzIFBvaW50VmFsdWVOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyTGluZVBvaW50fSBwb2ludFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcG9pbnQgKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtOdW1iZXJMaW5lUG9pbnR9XHJcbiAgICB0aGlzLnBvaW50ID0gcG9pbnQ7XHJcblxyXG4gICAgLy8gYmFja2dyb3VuZCAtIEluaXRpYWwgc2l6ZSBhbmQgY29sb3JpbmcgaXMgYXJiaXRyYXJ5LCBpdCB3aWxsIGJlIHVwZGF0ZWQgaW4gZnVuY3Rpb24gbGlua2VkIGJlbG93LlxyXG4gICAgY29uc3QgYmFja2dyb3VuZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEsIDEsIDIsIDIsIHtcclxuICAgICAgbGluZVdpZHRoOiBOVU1CRVJfQkFDS0dST1VORF9MSU5FX1dJRFRILFxyXG4gICAgICB2aXNpYmxlOiBmYWxzZSAvLyBpbml0aWFsbHkgaW52aXNpYmxlLCBhY3RpdmF0ZWQgKG1hZGUgdmlzaWJsZSkgd2hlbiB1c2VyIGludGVyYWN0cyB3aXRoIHRoZSBwb2ludFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYmFja2dyb3VuZCApO1xyXG5cclxuICAgIC8vIHRoZSBub2RlIHRoYXQgcmVwcmVzZW50cyB0aGUgdmFsdWVcclxuICAgIGNvbnN0IG51bWJlclRleHQgPSBuZXcgVGV4dCggJycsIHsgZm9udDogQ09NUEFSSVNPTl9TVEFURU1FTlRfRk9OVCB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBudW1iZXJUZXh0ICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIGFwcGVhcmFuY2UgYXMgdGhlIHZhbHVlIGNoYW5nZXMuXHJcbiAgICBjb25zdCBoYW5kbGVWYWx1ZUNoYW5nZSA9IHZhbHVlID0+IHtcclxuICAgICAgbnVtYmVyVGV4dC5zdHJpbmcgPSB2YWx1ZTtcclxuICAgICAgYmFja2dyb3VuZC5zZXRSZWN0Qm91bmRzKCBudW1iZXJUZXh0LmJvdW5kcy5kaWxhdGVkKCBOVU1CRVJfQkFDS0dST1VORF9ESUxBVElPTl9BTU9VTlQgKSApO1xyXG4gICAgfTtcclxuICAgIHBvaW50LnZhbHVlUHJvcGVydHkubGluayggaGFuZGxlVmFsdWVDaGFuZ2UgKTtcclxuICAgIGNvbnN0IGhhbmRsZUNvbG9yQ2hhbmdlID0gY29sb3IgPT4ge1xyXG4gICAgICBiYWNrZ3JvdW5kLmZpbGwgPSBjb2xvci5jb2xvclV0aWxzQnJpZ2h0ZXIoIDAuNzUgKTtcclxuICAgICAgYmFja2dyb3VuZC5zdHJva2UgPSBjb2xvcjtcclxuICAgIH07XHJcbiAgICBwb2ludC5jb2xvclByb3BlcnR5LmxpbmsoIGhhbmRsZUNvbG9yQ2hhbmdlICk7XHJcblxyXG4gICAgLy8gQW4gYW5pbWF0aW9uIGlzIHVzZWQgdG8gbWFkZSB0aGUgYmFja2dyb3VuZCB3aGVuIHRoZSB1c2VyIHN0b3BzIGRyYWdnaW5nIHRoZSBwb2ludC5cclxuICAgIGxldCBiYWNrZ3JvdW5kRmFkZUFuaW1hdGlvbiA9IG51bGw7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBoaWdobGlnaHQgc3RhdGUgYXMgdGhlIHBvaW50IGlzIGRyYWdnZWQuXHJcbiAgICBjb25zdCBoYW5kbGVEcmFnU3RhdGVDaGFuZ2UgPSBkcmFnZ2luZyA9PiB7XHJcblxyXG4gICAgICBpZiAoIGRyYWdnaW5nICkge1xyXG4gICAgICAgIGlmICggYmFja2dyb3VuZEZhZGVBbmltYXRpb24gKSB7XHJcbiAgICAgICAgICBiYWNrZ3JvdW5kRmFkZUFuaW1hdGlvbi5zdG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJhY2tncm91bmQudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgYmFja2dyb3VuZC5vcGFjaXR5ID0gMTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggIWJhY2tncm91bmRGYWRlQW5pbWF0aW9uICkge1xyXG5cclxuICAgICAgICAvLyBTdGFydCBvciByZXN0YXJ0IHRoZSBmYWRlIGFuaW1hdGlvbi5cclxuICAgICAgICBiYWNrZ3JvdW5kRmFkZUFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oIHtcclxuICAgICAgICAgIGR1cmF0aW9uOiAwLjc1LFxyXG4gICAgICAgICAgZWFzaW5nOiBFYXNpbmcuQ1VCSUNfT1VULFxyXG4gICAgICAgICAgc2V0VmFsdWU6IHZhbHVlID0+IHsgYmFja2dyb3VuZC5vcGFjaXR5ID0gdmFsdWU7IH0sXHJcbiAgICAgICAgICBmcm9tOiAxLFxyXG4gICAgICAgICAgdG86IDBcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgYmFja2dyb3VuZEZhZGVBbmltYXRpb24uc3RhcnQoKTtcclxuICAgICAgICBiYWNrZ3JvdW5kRmFkZUFuaW1hdGlvbi5lbmRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgICAgIGJhY2tncm91bmRGYWRlQW5pbWF0aW9uID0gbnVsbDtcclxuICAgICAgICAgIGJhY2tncm91bmQudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHBvaW50LmlzRHJhZ2dpbmdQcm9wZXJ0eS5saW5rKCBoYW5kbGVEcmFnU3RhdGVDaGFuZ2UgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259XHJcbiAgICB0aGlzLmRpc3Bvc2VOdW1iZXJXaXRoQ29sb3JOb2RlID0gKCkgPT4ge1xyXG4gICAgICBwb2ludC52YWx1ZVByb3BlcnR5LnVubGluayggaGFuZGxlVmFsdWVDaGFuZ2UgKTtcclxuICAgICAgcG9pbnQuaXNEcmFnZ2luZ1Byb3BlcnR5LnVubGluayggaGFuZGxlRHJhZ1N0YXRlQ2hhbmdlICk7XHJcbiAgICAgIHBvaW50LmNvbG9yUHJvcGVydHkudW5saW5rKCBoYW5kbGVDb2xvckNoYW5nZSApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5kaXNwb3NlTnVtYmVyV2l0aENvbG9yTm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxubnVtYmVyTGluZUludGVnZXJzLnJlZ2lzdGVyKCAnQ29tcGFyaXNvblN0YXRlbWVudE5vZGUnLCBDb21wYXJpc29uU3RhdGVtZW50Tm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBDb21wYXJpc29uU3RhdGVtZW50Tm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxLQUFLLEVBQUVDLFlBQVksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUNwRyxPQUFPQyxTQUFTLE1BQU0sbUNBQW1DO0FBQ3pELE9BQU9DLE1BQU0sTUFBTSxnQ0FBZ0M7QUFDbkQsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCOztBQUU1RDtBQUNBLE1BQU1DLHlCQUF5QixHQUFHLElBQUlWLFFBQVEsQ0FBRSxFQUFHLENBQUM7QUFDcEQsTUFBTVcsNEJBQTRCLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDeEMsTUFBTUMsaUNBQWlDLEdBQUcsQ0FBQztBQUMzQyxNQUFNQyw0QkFBNEIsR0FBRyxDQUFDO0FBQ3RDLE1BQU1DLHFCQUFxQixHQUFHLENBQUM7QUFDL0IsTUFBTUMsbUJBQW1CLEdBQUdoQixXQUFXLENBQUNpQixZQUFZO0FBQ3BELE1BQU1DLGdCQUFnQixHQUFHbEIsV0FBVyxDQUFDbUIsU0FBUztBQUM5QyxNQUFNQyxnQ0FBZ0MsR0FBRyxJQUFJbkIsUUFBUSxDQUFFO0VBQUVvQixJQUFJLEVBQUUsRUFBRTtFQUFFQyxNQUFNLEVBQUU7QUFBTyxDQUFFLENBQUM7QUFDckYsTUFBTUMsNEJBQTRCLEdBQUcsU0FBUztBQUM5QyxNQUFNQyxrQ0FBa0MsR0FBRyxTQUFTO0FBQ3BELE1BQU1DLDhCQUE4QixHQUFHLFNBQVM7QUFDaEQsTUFBTUMsb0NBQW9DLEdBQUcsU0FBUztBQUV0RCxNQUFNQyx1QkFBdUIsU0FBU3ZCLElBQUksQ0FBQztFQUV6QztBQUNGO0FBQ0E7QUFDQTtFQUNFd0IsV0FBV0EsQ0FBRUMsVUFBVSxFQUFHO0lBRXhCLEtBQUssQ0FBQyxDQUFDOztJQUVQO0lBQ0EsSUFBSSxDQUFDQyx3QkFBd0IsR0FBRyxJQUFJakMsY0FBYyxDQUFFcUIsZ0JBQWdCLEVBQUU7TUFDcEVhLFdBQVcsRUFBRSxDQUFFZixtQkFBbUIsRUFBRUUsZ0JBQWdCO0lBQ3RELENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1jLHVCQUF1QixHQUFHLElBQUk1QixJQUFJLENBQUMsQ0FBQztJQUMxQyxJQUFJLENBQUM2QixRQUFRLENBQUVELHVCQUF3QixDQUFDOztJQUV4QztJQUNBLE1BQU1FLGdCQUFnQixHQUFHLElBQUk5QixJQUFJLENBQUMsQ0FBQztJQUNuQzRCLHVCQUF1QixDQUFDQyxRQUFRLENBQUVDLGdCQUFpQixDQUFDO0lBQ3BELE1BQU1DLHlCQUF5QixHQUFHLElBQUkvQixJQUFJLENBQUMsQ0FBQztJQUM1QzRCLHVCQUF1QixDQUFDQyxRQUFRLENBQUVFLHlCQUEwQixDQUFDOztJQUU3RDtJQUNBLE1BQU1DLHFCQUFxQixHQUFHLElBQUlDLG9CQUFvQixDQUFFLElBQUksQ0FBQ1Asd0JBQXdCLEVBQUU7TUFDckZRLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDWixDQUFFLENBQUM7O0lBQ0gsSUFBSSxDQUFDTCxRQUFRLENBQUVHLHFCQUFzQixDQUFDOztJQUV0QztJQUNBLElBQUlHLG1CQUFtQixHQUFHLEVBQUU7O0lBRTVCO0lBQ0EsTUFBTUMsWUFBWSxHQUFHLElBQUlqQyxJQUFJLENBQUUsR0FBRyxFQUFFO01BQUVrQyxJQUFJLEVBQUU5QjtJQUEwQixDQUFFLENBQUM7SUFDekUsTUFBTStCLFFBQVEsR0FBRyxJQUFJcEMsU0FBUyxDQUFFO01BQzlCcUMsVUFBVSxFQUFFSCxZQUFZLENBQUNJLFdBQVcsQ0FBQ0MsT0FBTyxDQUFFaEMsaUNBQWtDLENBQUM7TUFDakZpQyxRQUFRLEVBQUUsQ0FBRU4sWUFBWSxDQUFFO01BQzFCTyxJQUFJLEVBQUU3QyxLQUFLLENBQUM4QyxXQUFXO01BQ3ZCQyxNQUFNLEVBQUUvQyxLQUFLLENBQUM4QyxXQUFXO01BQ3pCRSxTQUFTLEVBQUVwQztJQUNiLENBQUUsQ0FBQztJQUNIcUIseUJBQXlCLENBQUNGLFFBQVEsQ0FBRVMsUUFBUyxDQUFDOztJQUU5QztJQUNBLE1BQU1TLHVCQUF1QixHQUFHLEVBQUU7SUFDbENDLENBQUMsQ0FBQ0MsS0FBSyxDQUFFLENBQUMsRUFBRSxNQUFNO01BRWhCO01BQ0EsTUFBTUMsc0JBQXNCLEdBQUcsSUFBSS9DLElBQUksQ0FBRVMsbUJBQW1CLEVBQUU7UUFDNUR5QixJQUFJLEVBQUU5QjtNQUNSLENBQUUsQ0FBQztNQUNId0IseUJBQXlCLENBQUNGLFFBQVEsQ0FBRXFCLHNCQUF1QixDQUFDO01BQzVESCx1QkFBdUIsQ0FBQ0ksSUFBSSxDQUFFRCxzQkFBdUIsQ0FBQztJQUN4RCxDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNRSx5QkFBeUIsR0FBR0EsQ0FBQSxLQUFNO01BRXRDLE1BQU1DLFNBQVMsR0FBRzVCLFVBQVUsQ0FBQzZCLGNBQWMsQ0FBQ0MsTUFBTTs7TUFFbEQ7TUFDQUMsTUFBTSxJQUFJQSxNQUFNLENBQUVILFNBQVMsSUFBSSxDQUFDLEVBQUUsZ0NBQWlDLENBQUM7TUFFcEUsTUFBTUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDL0Isd0JBQXdCLENBQUNnQyxLQUFLOztNQUU5RDtNQUNBcEIsUUFBUSxDQUFDcUIsT0FBTyxHQUFHLEtBQUs7TUFDeEJaLHVCQUF1QixDQUFDYSxPQUFPLENBQUVWLHNCQUFzQixJQUFJO1FBQ3pEQSxzQkFBc0IsQ0FBQ1MsT0FBTyxHQUFHLEtBQUs7O1FBRXRDO1FBQ0FULHNCQUFzQixDQUFDVyxJQUFJLEdBQUcsQ0FBQztNQUNqQyxDQUFFLENBQUM7O01BRUg7TUFDQSxNQUFNQyxXQUFXLEdBQUcsRUFBRTs7TUFFdEI7TUFDQTtNQUNBOztNQUVBLElBQUtoQyxnQkFBZ0IsQ0FBQ2lDLGdCQUFnQixDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUc7UUFFL0M7UUFDQXpCLFFBQVEsQ0FBQ3FCLE9BQU8sR0FBRyxLQUFLO1FBQ3hCRyxXQUFXLENBQUNYLElBQUksQ0FBRWIsUUFBUyxDQUFDO01BQzlCLENBQUMsTUFDSSxJQUFLUixnQkFBZ0IsQ0FBQ2lDLGdCQUFnQixDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUc7UUFFcEQ7UUFDQSxNQUFNQyxjQUFjLEdBQUdsQyxnQkFBZ0IsQ0FBQ21DLFVBQVUsQ0FBRSxDQUFFLENBQUM7UUFDdkQzQixRQUFRLENBQUNxQixPQUFPLEdBQUcsSUFBSTs7UUFFdkI7UUFDQSxJQUFLSyxjQUFjLENBQUNFLEtBQUssQ0FBQ0MsYUFBYSxDQUFDVCxLQUFLLEdBQUcsQ0FBQyxFQUFHO1VBQ2xESSxXQUFXLENBQUNYLElBQUksQ0FBRWEsY0FBZSxDQUFDO1VBQ2xDRixXQUFXLENBQUNYLElBQUksQ0FBRWIsUUFBUyxDQUFDO1FBQzlCLENBQUMsTUFDSSxJQUFLMEIsY0FBYyxDQUFDRSxLQUFLLENBQUNDLGFBQWEsQ0FBQ1QsS0FBSyxHQUFHLENBQUMsRUFBRztVQUN2REksV0FBVyxDQUFDWCxJQUFJLENBQUViLFFBQVMsQ0FBQztVQUM1QndCLFdBQVcsQ0FBQ1gsSUFBSSxDQUFFYSxjQUFlLENBQUM7UUFDcEMsQ0FBQyxNQUNJO1VBRUg7VUFDQSxNQUFNSSx1QkFBdUIsR0FBR2pDLG1CQUFtQixDQUFDa0MsT0FBTyxDQUFFTCxjQUFlLENBQUM7VUFDN0UsSUFBS0ksdUJBQXVCLEtBQUssQ0FBQyxFQUFHO1lBQ25DTixXQUFXLENBQUNYLElBQUksQ0FBRWEsY0FBZSxDQUFDO1lBQ2xDRixXQUFXLENBQUNYLElBQUksQ0FBRWIsUUFBUyxDQUFDO1VBQzlCLENBQUMsTUFDSTtZQUNId0IsV0FBVyxDQUFDWCxJQUFJLENBQUViLFFBQVMsQ0FBQztZQUM1QndCLFdBQVcsQ0FBQ1gsSUFBSSxDQUFFYSxjQUFlLENBQUM7VUFDcEM7UUFDRjtNQUNGLENBQUMsTUFDSTtRQUVIO1FBQ0E7UUFDQSxNQUFNTSxrQkFBa0IsR0FBR3hDLGdCQUFnQixDQUFDeUMsV0FBVyxDQUFDLENBQUMsQ0FBQ0MsSUFBSSxDQUFFLENBQUVDLE1BQU0sRUFBRUMsTUFBTSxLQUFNO1VBQ3BGLElBQUlDLE1BQU07VUFDVixJQUFLRixNQUFNLENBQUNQLEtBQUssQ0FBQ0MsYUFBYSxDQUFDVCxLQUFLLEtBQUtnQixNQUFNLENBQUNSLEtBQUssQ0FBQ0MsYUFBYSxDQUFDVCxLQUFLLEVBQUc7WUFDM0VpQixNQUFNLEdBQUdGLE1BQU0sQ0FBQ1AsS0FBSyxDQUFDQyxhQUFhLENBQUNULEtBQUssR0FBR2dCLE1BQU0sQ0FBQ1IsS0FBSyxDQUFDQyxhQUFhLENBQUNULEtBQUs7VUFDOUUsQ0FBQyxNQUNJO1lBRUg7WUFDQSxNQUFNa0Isa0JBQWtCLEdBQUd6QyxtQkFBbUIsQ0FBQ2tDLE9BQU8sQ0FBRUksTUFBTyxDQUFDO1lBQ2hFLE1BQU1JLGtCQUFrQixHQUFHMUMsbUJBQW1CLENBQUNrQyxPQUFPLENBQUVLLE1BQU8sQ0FBQztZQUNoRSxJQUFLRSxrQkFBa0IsR0FBRyxDQUFDLENBQUMsSUFBSUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLEVBQUc7Y0FDeERGLE1BQU0sR0FBR0Msa0JBQWtCLEdBQUdDLGtCQUFrQjtZQUNsRCxDQUFDLE1BQ0k7Y0FFSDtjQUNBRixNQUFNLEdBQUcsQ0FBQztZQUNaO1VBQ0Y7VUFDQSxPQUFPQSxNQUFNO1FBQ2YsQ0FBRSxDQUFDOztRQUVIO1FBQ0FMLGtCQUFrQixDQUFDVixPQUFPLENBQUVrQixJQUFJLElBQUk7VUFBRWhCLFdBQVcsQ0FBQ1gsSUFBSSxDQUFFMkIsSUFBSyxDQUFDO1FBQUUsQ0FBRSxDQUFDO01BQ3JFOztNQUVBO01BQ0EzQyxtQkFBbUIsR0FBRzJCLFdBQVcsQ0FBQ2lCLEtBQUssQ0FBQyxDQUFDOztNQUV6QztNQUNBLElBQUt0QixrQkFBa0IsS0FBSzdDLG1CQUFtQixFQUFHO1FBQ2hEa0QsV0FBVyxDQUFDa0IsT0FBTyxDQUFDLENBQUM7TUFDdkI7O01BRUE7TUFDQSxJQUFJQyxXQUFXLEdBQUcsQ0FBQztNQUNuQixLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR3BCLFdBQVcsQ0FBQ1AsTUFBTSxFQUFFMkIsQ0FBQyxFQUFFLEVBQUc7UUFFN0MsTUFBTUMsV0FBVyxHQUFHckIsV0FBVyxDQUFFb0IsQ0FBQyxDQUFFO1FBQ3BDQyxXQUFXLENBQUN0QixJQUFJLEdBQUdvQixXQUFXO1FBQzlCQSxXQUFXLEdBQUdFLFdBQVcsQ0FBQ0MsS0FBSyxHQUFHNUUsNEJBQTRCOztRQUU5RDtRQUNBLElBQUswRSxDQUFDLEdBQUdwQixXQUFXLENBQUNQLE1BQU0sR0FBRyxDQUFDLEVBQUc7VUFDaEMsSUFBSThCLG1CQUFtQixHQUFHNUIsa0JBQWtCO1VBQzVDLE1BQU02QixnQkFBZ0IsR0FBR0gsV0FBVyxDQUFDakIsS0FBSyxHQUFHaUIsV0FBVyxDQUFDakIsS0FBSyxDQUFDQyxhQUFhLENBQUNULEtBQUssR0FBRyxDQUFDO1VBQ3RGLE1BQU02QixhQUFhLEdBQUd6QixXQUFXLENBQUVvQixDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUNoQixLQUFLLEdBQUdKLFdBQVcsQ0FBRW9CLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQ2hCLEtBQUssQ0FBQ0MsYUFBYSxDQUFDVCxLQUFLLEdBQUcsQ0FBQztVQUNyRyxJQUFLNEIsZ0JBQWdCLEtBQUtDLGFBQWEsRUFBRztZQUV4QztZQUNBRixtQkFBbUIsR0FBRzVCLGtCQUFrQixLQUFLM0MsZ0JBQWdCLEdBQ3ZDbEIsV0FBVyxDQUFDNEYsa0JBQWtCLEdBQzlCNUYsV0FBVyxDQUFDNkYscUJBQXFCO1VBQ3pEO1VBQ0EsTUFBTXZDLHNCQUFzQixHQUFHSCx1QkFBdUIsQ0FBRW1DLENBQUMsQ0FBRTtVQUMzRGhDLHNCQUFzQixDQUFDUyxPQUFPLEdBQUcsSUFBSTtVQUNyQyxJQUFLVCxzQkFBc0IsQ0FBQ3dDLE1BQU0sS0FBS0wsbUJBQW1CLEVBQUc7WUFFM0Q7WUFDQSxJQUFLbkMsc0JBQXNCLENBQUN3QyxNQUFNLEtBQUtMLG1CQUFtQixFQUFHO2NBQzNEbkMsc0JBQXNCLENBQUN3QyxNQUFNLEdBQUdMLG1CQUFtQjtZQUNyRDtVQUNGO1VBQ0FuQyxzQkFBc0IsQ0FBQ3lDLENBQUMsR0FBR1YsV0FBVztVQUN0Q0EsV0FBVyxHQUFHL0Isc0JBQXNCLENBQUNrQyxLQUFLLEdBQUc1RSw0QkFBNEI7UUFDM0U7TUFDRjtNQUVBb0IsdUJBQXVCLENBQUNnRSxPQUFPLEdBQUcsQ0FBQztNQUNuQzVELHFCQUFxQixDQUFDNkIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7O0lBRUQ7SUFDQXBDLFVBQVUsQ0FBQzZCLGNBQWMsQ0FBQ00sT0FBTyxDQUFFTSxLQUFLLElBQUk7TUFDMUNwQyxnQkFBZ0IsQ0FBQ0QsUUFBUSxDQUFFLElBQUlnRSxjQUFjLENBQUUzQixLQUFNLENBQUUsQ0FBQztNQUN4REEsS0FBSyxDQUFDQyxhQUFhLENBQUMyQixRQUFRLENBQUUxQyx5QkFBMEIsQ0FBQztJQUMzRCxDQUFFLENBQUM7SUFDSDNCLFVBQVUsQ0FBQzZCLGNBQWMsQ0FBQ3lDLG9CQUFvQixDQUFFQyxVQUFVLElBQUk7TUFDNURsRSxnQkFBZ0IsQ0FBQ0QsUUFBUSxDQUFFLElBQUlnRSxjQUFjLENBQUVHLFVBQVcsQ0FBRSxDQUFDO01BQzdEQSxVQUFVLENBQUM3QixhQUFhLENBQUM4QixJQUFJLENBQUU3Qyx5QkFBMEIsQ0FBQztJQUM1RCxDQUFFLENBQUM7SUFDSDNCLFVBQVUsQ0FBQzZCLGNBQWMsQ0FBQzRDLHNCQUFzQixDQUFFQyxZQUFZLElBQUk7TUFDaEVBLFlBQVksQ0FBQ2hDLGFBQWEsQ0FBQ2lDLE1BQU0sQ0FBRWhELHlCQUEwQixDQUFDO01BQzlEdEIsZ0JBQWdCLENBQUN5QyxXQUFXLENBQUMsQ0FBQyxDQUFDWCxPQUFPLENBQUV5QyxTQUFTLElBQUk7UUFDbkQsSUFBS0EsU0FBUyxDQUFDbkMsS0FBSyxLQUFLaUMsWUFBWSxFQUFHO1VBQ3RDckUsZ0JBQWdCLENBQUN3RSxXQUFXLENBQUVELFNBQVUsQ0FBQztVQUN6Q0EsU0FBUyxDQUFDRSxPQUFPLENBQUMsQ0FBQztRQUNyQjtNQUNGLENBQUUsQ0FBQztNQUNIbkQseUJBQXlCLENBQUMsQ0FBQztJQUM3QixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUMxQix3QkFBd0IsQ0FBQ3VFLElBQUksQ0FBRTdDLHlCQUEwQixDQUFDO0VBQ2pFOztFQUVBO0FBQ0Y7QUFDQTtFQUNFb0QsS0FBS0EsQ0FBQSxFQUFHO0lBQ04sSUFBSSxDQUFDOUUsd0JBQXdCLENBQUM4RSxLQUFLLENBQUMsQ0FBQztFQUN2QztBQUNGOztBQUVBO0FBQ0EsTUFBTXZFLG9CQUFvQixTQUFTakMsSUFBSSxDQUFDO0VBRXRDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRXdCLFdBQVdBLENBQUVFLHdCQUF3QixFQUFFK0UsT0FBTyxFQUFHO0lBRS9DQSxPQUFPLEdBQUc5RyxLQUFLLENBQUU7TUFDZitHLGFBQWEsRUFBRSxFQUFFO01BQ2pCQyxjQUFjLEVBQUUsRUFBRTtNQUNsQnRFLElBQUksRUFBRXJCLGdDQUFnQztNQUN0QzRGLG1CQUFtQixFQUFFO0lBQ3ZCLENBQUMsRUFBRUgsT0FBUSxDQUFDO0lBRVosS0FBSyxDQUFDLENBQUM7O0lBRVA7SUFDQSxNQUFNSSxxQkFBcUIsR0FBR25ILEtBQUssQ0FBQ29ILHlCQUF5QixDQUMzRCxDQUFDTCxPQUFPLENBQUNDLGFBQWEsRUFDdEIsQ0FBQ0QsT0FBTyxDQUFDRSxjQUFjLEdBQUcsQ0FBQyxFQUMzQkYsT0FBTyxDQUFDQyxhQUFhLEVBQ3JCRCxPQUFPLENBQUNFLGNBQWMsRUFDdEI7TUFBRUksT0FBTyxFQUFFTixPQUFPLENBQUNHLG1CQUFtQjtNQUFFSSxVQUFVLEVBQUVQLE9BQU8sQ0FBQ0c7SUFBb0IsQ0FDbEYsQ0FBQztJQUNELE1BQU1LLDRCQUE0QixHQUFHLElBQUloSCxJQUFJLENBQUU0RyxxQkFBcUIsRUFBRTtNQUNwRWhFLE1BQU0sRUFBRSxPQUFPO01BQ2ZxRSxNQUFNLEVBQUU7SUFDVixDQUFFLENBQUM7SUFDSCxNQUFNQyxZQUFZLEdBQUcsSUFBSWhILElBQUksQ0FBRVcsZ0JBQWdCLEVBQUU7TUFDL0N1QixJQUFJLEVBQUVvRSxPQUFPLENBQUNwRSxJQUFJO01BQ2xCdUQsT0FBTyxFQUFFcUIsNEJBQTRCLENBQUNyQixPQUFPO01BQzdDd0IsT0FBTyxFQUFFO0lBQ1gsQ0FBRSxDQUFDO0lBQ0hILDRCQUE0QixDQUFDcEYsUUFBUSxDQUFFc0YsWUFBYSxDQUFDO0lBQ3JERiw0QkFBNEIsQ0FBQ0ksU0FBUyxHQUFHSiw0QkFBNEIsQ0FBQ0ssTUFBTSxDQUFDQyxXQUFXLENBQ3RGNUcscUJBQXFCLEVBQUVBLHFCQUFxQixFQUFFLENBQUMsRUFBRUEscUJBQ25ELENBQUM7SUFDRHNHLDRCQUE0QixDQUFDTyxnQkFBZ0IsQ0FBRSxJQUFJekgsWUFBWSxDQUFFO01BQy9EMEgsSUFBSSxFQUFFQSxDQUFBLEtBQU07UUFDVi9GLHdCQUF3QixDQUFDZ0MsS0FBSyxHQUFHNUMsZ0JBQWdCO01BQ25EO0lBQ0YsQ0FBRSxDQUFFLENBQUM7SUFDTCxJQUFJLENBQUNlLFFBQVEsQ0FBRW9GLDRCQUE2QixDQUFDOztJQUU3QztJQUNBLE1BQU1TLHdCQUF3QixHQUFHaEksS0FBSyxDQUFDb0gseUJBQXlCLENBQzlELENBQUMsRUFDRCxDQUFDTCxPQUFPLENBQUNFLGNBQWMsR0FBRyxDQUFDLEVBQzNCRixPQUFPLENBQUNDLGFBQWEsRUFDckJELE9BQU8sQ0FBQ0UsY0FBYyxFQUN0QjtNQUFFZ0IsUUFBUSxFQUFFbEIsT0FBTyxDQUFDRyxtQkFBbUI7TUFBRWdCLFdBQVcsRUFBRW5CLE9BQU8sQ0FBQ0c7SUFBb0IsQ0FDcEYsQ0FBQztJQUNELE1BQU1pQiwrQkFBK0IsR0FBRyxJQUFJNUgsSUFBSSxDQUFFeUgsd0JBQXdCLEVBQUU7TUFDMUU3RSxNQUFNLEVBQUUsT0FBTztNQUNmcUUsTUFBTSxFQUFFO0lBQ1YsQ0FBRSxDQUFDO0lBQ0gsTUFBTVksZUFBZSxHQUFHLElBQUkzSCxJQUFJLENBQUVTLG1CQUFtQixFQUFFO01BQ3JEeUIsSUFBSSxFQUFFb0UsT0FBTyxDQUFDcEUsSUFBSTtNQUNsQnVELE9BQU8sRUFBRWlDLCtCQUErQixDQUFDakMsT0FBTztNQUNoRHdCLE9BQU8sRUFBRTtJQUNYLENBQUUsQ0FBQztJQUNIUywrQkFBK0IsQ0FBQ2hHLFFBQVEsQ0FBRWlHLGVBQWdCLENBQUM7SUFDM0RELCtCQUErQixDQUFDUixTQUFTLEdBQUdRLCtCQUErQixDQUFDUCxNQUFNLENBQUNDLFdBQVcsQ0FDNUYsQ0FBQyxFQUFFNUcscUJBQXFCLEVBQUVBLHFCQUFxQixFQUFFQSxxQkFDbkQsQ0FBQztJQUNEa0gsK0JBQStCLENBQUNMLGdCQUFnQixDQUFFLElBQUl6SCxZQUFZLENBQUU7TUFDbEUwSCxJQUFJLEVBQUVBLENBQUEsS0FBTTtRQUNWL0Ysd0JBQXdCLENBQUNnQyxLQUFLLEdBQUc5QyxtQkFBbUI7TUFDdEQ7SUFDRixDQUFFLENBQUUsQ0FBQztJQUNMLElBQUksQ0FBQ2lCLFFBQVEsQ0FBRWdHLCtCQUFnQyxDQUFDOztJQUVoRDtJQUNBbkcsd0JBQXdCLENBQUN1RSxJQUFJLENBQUU4QixTQUFTLElBQUk7TUFDMUMsSUFBS0EsU0FBUyxLQUFLakgsZ0JBQWdCLEVBQUc7UUFDcENxRyxZQUFZLENBQUN4RSxJQUFJLEdBQUd4Qiw0QkFBNEI7UUFDaEQ4Riw0QkFBNEIsQ0FBQ3RFLElBQUksR0FBR3ZCLGtDQUFrQztRQUN0RTBHLGVBQWUsQ0FBQ25GLElBQUksR0FBR3RCLDhCQUE4QjtRQUNyRHdHLCtCQUErQixDQUFDbEYsSUFBSSxHQUFHckIsb0NBQW9DO01BQzdFLENBQUMsTUFDSTtRQUNINkYsWUFBWSxDQUFDeEUsSUFBSSxHQUFHdEIsOEJBQThCO1FBQ2xENEYsNEJBQTRCLENBQUN0RSxJQUFJLEdBQUdyQixvQ0FBb0M7UUFDeEV3RyxlQUFlLENBQUNuRixJQUFJLEdBQUd4Qiw0QkFBNEI7UUFDbkQwRywrQkFBK0IsQ0FBQ2xGLElBQUksR0FBR3ZCLGtDQUFrQztNQUMzRTtJQUNGLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQzRHLE1BQU0sQ0FBRXZCLE9BQVEsQ0FBQztFQUN4QjtBQUNGOztBQUVBO0FBQ0EsTUFBTVosY0FBYyxTQUFTN0YsSUFBSSxDQUFDO0VBRWhDO0FBQ0Y7QUFDQTtBQUNBO0VBQ0V3QixXQUFXQSxDQUFFMEMsS0FBSyxFQUFHO0lBRW5CLEtBQUssQ0FBQyxDQUFDOztJQUVQO0lBQ0EsSUFBSSxDQUFDQSxLQUFLLEdBQUdBLEtBQUs7O0lBRWxCO0lBQ0EsTUFBTStELFVBQVUsR0FBRyxJQUFJL0gsU0FBUyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO01BQ2xENEMsU0FBUyxFQUFFcEMsNEJBQTRCO01BQ3ZDaUQsT0FBTyxFQUFFLEtBQUssQ0FBQztJQUNqQixDQUFFLENBQUM7O0lBQ0gsSUFBSSxDQUFDOUIsUUFBUSxDQUFFb0csVUFBVyxDQUFDOztJQUUzQjtJQUNBLE1BQU1DLFVBQVUsR0FBRyxJQUFJL0gsSUFBSSxDQUFFLEVBQUUsRUFBRTtNQUFFa0MsSUFBSSxFQUFFOUI7SUFBMEIsQ0FBRSxDQUFDO0lBQ3RFLElBQUksQ0FBQ3NCLFFBQVEsQ0FBRXFHLFVBQVcsQ0FBQzs7SUFFM0I7SUFDQSxNQUFNQyxpQkFBaUIsR0FBR3pFLEtBQUssSUFBSTtNQUNqQ3dFLFVBQVUsQ0FBQ3hDLE1BQU0sR0FBR2hDLEtBQUs7TUFDekJ1RSxVQUFVLENBQUNHLGFBQWEsQ0FBRUYsVUFBVSxDQUFDWixNQUFNLENBQUM3RSxPQUFPLENBQUVoQyxpQ0FBa0MsQ0FBRSxDQUFDO0lBQzVGLENBQUM7SUFDRHlELEtBQUssQ0FBQ0MsYUFBYSxDQUFDOEIsSUFBSSxDQUFFa0MsaUJBQWtCLENBQUM7SUFDN0MsTUFBTUUsaUJBQWlCLEdBQUdDLEtBQUssSUFBSTtNQUNqQ0wsVUFBVSxDQUFDdEYsSUFBSSxHQUFHMkYsS0FBSyxDQUFDQyxrQkFBa0IsQ0FBRSxJQUFLLENBQUM7TUFDbEROLFVBQVUsQ0FBQ3BGLE1BQU0sR0FBR3lGLEtBQUs7SUFDM0IsQ0FBQztJQUNEcEUsS0FBSyxDQUFDc0UsYUFBYSxDQUFDdkMsSUFBSSxDQUFFb0MsaUJBQWtCLENBQUM7O0lBRTdDO0lBQ0EsSUFBSUksdUJBQXVCLEdBQUcsSUFBSTs7SUFFbEM7SUFDQSxNQUFNQyxxQkFBcUIsR0FBR0MsUUFBUSxJQUFJO01BRXhDLElBQUtBLFFBQVEsRUFBRztRQUNkLElBQUtGLHVCQUF1QixFQUFHO1VBQzdCQSx1QkFBdUIsQ0FBQ0csSUFBSSxDQUFDLENBQUM7UUFDaEM7UUFDQVgsVUFBVSxDQUFDdEUsT0FBTyxHQUFHLElBQUk7UUFDekJzRSxVQUFVLENBQUNZLE9BQU8sR0FBRyxDQUFDO01BQ3hCLENBQUMsTUFDSSxJQUFLLENBQUNKLHVCQUF1QixFQUFHO1FBRW5DO1FBQ0FBLHVCQUF1QixHQUFHLElBQUlySSxTQUFTLENBQUU7VUFDdkMwSSxRQUFRLEVBQUUsSUFBSTtVQUNkQyxNQUFNLEVBQUUxSSxNQUFNLENBQUMySSxTQUFTO1VBQ3hCQyxRQUFRLEVBQUV2RixLQUFLLElBQUk7WUFBRXVFLFVBQVUsQ0FBQ1ksT0FBTyxHQUFHbkYsS0FBSztVQUFFLENBQUM7VUFDbER3RixJQUFJLEVBQUUsQ0FBQztVQUNQQyxFQUFFLEVBQUU7UUFDTixDQUFFLENBQUM7UUFDSFYsdUJBQXVCLENBQUNXLEtBQUssQ0FBQyxDQUFDO1FBQy9CWCx1QkFBdUIsQ0FBQ1ksWUFBWSxDQUFDQyxXQUFXLENBQUUsTUFBTTtVQUN0RGIsdUJBQXVCLEdBQUcsSUFBSTtVQUM5QlIsVUFBVSxDQUFDdEUsT0FBTyxHQUFHLEtBQUs7UUFDNUIsQ0FBRSxDQUFDO01BQ0w7SUFDRixDQUFDO0lBQ0RPLEtBQUssQ0FBQ3FGLGtCQUFrQixDQUFDdEQsSUFBSSxDQUFFeUMscUJBQXNCLENBQUM7O0lBRXREO0lBQ0EsSUFBSSxDQUFDYywwQkFBMEIsR0FBRyxNQUFNO01BQ3RDdEYsS0FBSyxDQUFDQyxhQUFhLENBQUNpQyxNQUFNLENBQUUrQixpQkFBa0IsQ0FBQztNQUMvQ2pFLEtBQUssQ0FBQ3FGLGtCQUFrQixDQUFDbkQsTUFBTSxDQUFFc0MscUJBQXNCLENBQUM7TUFDeER4RSxLQUFLLENBQUNzRSxhQUFhLENBQUNwQyxNQUFNLENBQUVpQyxpQkFBa0IsQ0FBQztJQUNqRCxDQUFDO0VBQ0g7O0VBRUE7QUFDRjtBQUNBO0VBQ0U5QixPQUFPQSxDQUFBLEVBQUc7SUFDUixJQUFJLENBQUNpRCwwQkFBMEIsQ0FBQyxDQUFDO0lBQ2pDLEtBQUssQ0FBQ2pELE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQWpHLGtCQUFrQixDQUFDbUosUUFBUSxDQUFFLHlCQUF5QixFQUFFbEksdUJBQXdCLENBQUM7QUFDakYsZUFBZUEsdUJBQXVCIn0=