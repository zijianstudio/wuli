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
const COMPARISON_STATEMENT_FONT = new PhetFont( 26 );
const COMPARISON_STATEMENT_SPACING = 6; // in screen coords
const NUMBER_BACKGROUND_DILATION_AMOUNT = 3;
const NUMBER_BACKGROUND_LINE_WIDTH = 2;
const BUTTON_TOUCH_DILATION = 8;
const GREATER_THAN_STRING = MathSymbols.GREATER_THAN;
const LESS_THAN_STRING = MathSymbols.LESS_THAN;
const DEFAULT_COMPARISON_SELECTOR_FONT = new PhetFont( { size: 20, weight: 'bold' } );
const SELECTED_OPERATOR_TEXT_COLOR = '#000000';
const SELECTED_OPERATOR_BACKGROUND_COLOR = '#d3d3d3';
const UNSELECTED_OPERATOR_TEXT_COLOR = '#949494';
const UNSELECTED_OPERATOR_BACKGROUND_COLOR = '#ffffff';

class ComparisonStatementNode extends Node {

  /**
   * @param {NumberLine} numberLine - the number line whose point values are being depicted
   * @public
   */
  constructor( numberLine ) {

    super();

    // @public - controls what comparison operator is used
    this.selectedOperatorProperty = new StringProperty( LESS_THAN_STRING, {
      validValues: [ GREATER_THAN_STRING, LESS_THAN_STRING ]
    } );

    // comparison statement root node
    const comparisonStatementRoot = new Node();
    this.addChild( comparisonStatementRoot );

    // The comparison statement has numbers and operators that reside on different root nodes for easier manipulation.
    const numberNodesLayer = new Node();
    comparisonStatementRoot.addChild( numberNodesLayer );
    const operatorAndZeroNodesLayer = new Node();
    comparisonStatementRoot.addChild( operatorAndZeroNodesLayer );

    // operator selector node - allows the user to choose between greater than or less than
    const operatorSelectionNode = new OperatorSelectorNode( this.selectedOperatorProperty, {
      bottom: 4 // empirically determined to align vertically with the comparison statement
    } );
    this.addChild( operatorSelectionNode );

    // Keep track of the previous number node array, used to help with sorting.
    let previousNumberNodes = [];

    // Create a node that indicates a zero, but has a background like the other numbers so that its height is the same.
    const zeroTextNode = new Text( '0', { font: COMPARISON_STATEMENT_FONT } );
    const zeroNode = new Rectangle( {
      rectBounds: zeroTextNode.localBounds.dilated( NUMBER_BACKGROUND_DILATION_AMOUNT ),
      children: [ zeroTextNode ],
      fill: Color.TRANSPARENT,
      stroke: Color.TRANSPARENT,
      lineWidth: NUMBER_BACKGROUND_LINE_WIDTH
    } );
    operatorAndZeroNodesLayer.addChild( zeroNode );

    // Create and add the nodes that will be used to depict the comparison operators.
    const comparisonOperatorNodes = [];
    _.times( 2, () => {

      // Give these an arbitrary value to start with, they will be updated later.
      const comparisonOperatorNode = new Text( GREATER_THAN_STRING, {
        font: COMPARISON_STATEMENT_FONT
      } );
      operatorAndZeroNodesLayer.addChild( comparisonOperatorNode );
      comparisonOperatorNodes.push( comparisonOperatorNode );
    } );

    // Define a function to update the comparison statement, including its layout.
    const updateComparisonStatement = () => {

      const numPoints = numberLine.residentPoints.length;

      // Verify that this function isn't being asked to handle more points than it is designed for.
      assert && assert( numPoints <= 3, 'too many points on number line' );

      const comparisonOperator = this.selectedOperatorProperty.value;

      // Hide operators and zeros for now, will be made visible as needed by the code below.
      zeroNode.visible = false;
      comparisonOperatorNodes.forEach( comparisonOperatorNode => {
        comparisonOperatorNode.visible = false;

        // Position this so that it won't affect the overall bounds if it is not being used.
        comparisonOperatorNode.left = 0;
      } );

      // list of all nodes that will depict numbers, including zero nodes that don't correspond to a point
      const numberNodes = [];

      // NOTE: In order for the code below to make sense, it's important to understand that the numberNodesLayer is
      // populated with number nodes elsewhere in this file whenever points are added to or removed from the
      // corresponding number line.

      if ( numberNodesLayer.getChildrenCount() === 0 ) {

        // If there are no points on the number line, just show a zero.
        zeroNode.visible = false;
        numberNodes.push( zeroNode );
      }
      else if ( numberNodesLayer.getChildrenCount() === 1 ) {

        // There is only one number node, so show it compared to zero.
        const pointValueNode = numberNodesLayer.getChildAt( 0 );
        zeroNode.visible = true;

        // Add nodes to the list in ascending order.
        if ( pointValueNode.point.valueProperty.value < 0 ) {
          numberNodes.push( pointValueNode );
          numberNodes.push( zeroNode );
        }
        else if ( pointValueNode.point.valueProperty.value > 0 ) {
          numberNodes.push( zeroNode );
          numberNodes.push( pointValueNode );
        }
        else {

          // The node value is equal to zero, so sort it based on the previous position.
          const previousPositionInArray = previousNumberNodes.indexOf( pointValueNode );
          if ( previousPositionInArray === 0 ) {
            numberNodes.push( pointValueNode );
            numberNodes.push( zeroNode );
          }
          else {
            numberNodes.push( zeroNode );
            numberNodes.push( pointValueNode );
          }
        }
      }
      else {

        // There are two or more number values being displayed.  Get a list of number nodes and sort them based on
        // their values.  If the values are equal, use the previous position in the order array.
        const orderedNumberNodes = numberNodesLayer.getChildren().sort( ( p1node, p2node ) => {
          let result;
          if ( p1node.point.valueProperty.value !== p2node.point.valueProperty.value ) {
            result = p1node.point.valueProperty.value - p2node.point.valueProperty.value;
          }
          else {

            // The current values are equal, so use the previous position in the ordered array.
            const prevP1NodePosition = previousNumberNodes.indexOf( p1node );
            const prevP2NodePosition = previousNumberNodes.indexOf( p2node );
            if ( prevP1NodePosition > -1 && prevP2NodePosition > -1 ) {
              result = prevP1NodePosition - prevP2NodePosition;
            }
            else {

              // One of the points must have just been added right on top of the other, so call them equal.
              result = 0;
            }
          }
          return result;
        } );

        // Add the nodes in order to the list of value nodes.
        orderedNumberNodes.forEach( node => { numberNodes.push( node ); } );
      }

      // Save the ordered list in case we need it for comparison purposes the next time we order them.
      previousNumberNodes = numberNodes.slice();

      // Above, the nodes are sorted in ascending order, so they need to be reversed if using the '>' operator.
      if ( comparisonOperator === GREATER_THAN_STRING ) {
        numberNodes.reverse();
      }

      // At this point we should have an ordered list of number nodes, so set their positions.
      let currentXPos = 0;
      for ( let i = 0; i < numberNodes.length; i++ ) {

        const currentNode = numberNodes[ i ];
        currentNode.left = currentXPos;
        currentXPos = currentNode.right + COMPARISON_STATEMENT_SPACING;

        // If this isn't the last number node a comparison operator will be needed.
        if ( i < numberNodes.length - 1 ) {
          let comparisonCharacter = comparisonOperator;
          const currentNodeValue = currentNode.point ? currentNode.point.valueProperty.value : 0;
          const nextNodeValue = numberNodes[ i + 1 ].point ? numberNodes[ i + 1 ].point.valueProperty.value : 0;
          if ( currentNodeValue === nextNodeValue ) {

            // The values are equal, so we need to use less-than-or-equal or greater-than-or-equal comparison operator.
            comparisonCharacter = comparisonOperator === LESS_THAN_STRING ?
                                  MathSymbols.LESS_THAN_OR_EQUAL :
                                  MathSymbols.GREATER_THAN_OR_EQUAL;
          }
          const comparisonOperatorNode = comparisonOperatorNodes[ i ];
          comparisonOperatorNode.visible = true;
          if ( comparisonOperatorNode.string !== comparisonCharacter ) {

            // optimization - only set the string if it's not correct, saves time reevaluating bounds
            if ( comparisonOperatorNode.string !== comparisonCharacter ) {
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
    numberLine.residentPoints.forEach( point => {
      numberNodesLayer.addChild( new PointValueNode( point ) );
      point.valueProperty.lazyLink( updateComparisonStatement );
    } );
    numberLine.residentPoints.addItemAddedListener( addedPoint => {
      numberNodesLayer.addChild( new PointValueNode( addedPoint ) );
      addedPoint.valueProperty.link( updateComparisonStatement );
    } );
    numberLine.residentPoints.addItemRemovedListener( removedPoint => {
      removedPoint.valueProperty.unlink( updateComparisonStatement );
      numberNodesLayer.getChildren().forEach( childNode => {
        if ( childNode.point === removedPoint ) {
          numberNodesLayer.removeChild( childNode );
          childNode.dispose();
        }
      } );
      updateComparisonStatement();
    } );

    // Update the comparison statement of the chosen operator changes, this also does the initial update.
    this.selectedOperatorProperty.link( updateComparisonStatement );
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
  constructor( selectedOperatorProperty, options ) {

    options = merge( {
      selectorWidth: 25,
      selectorHeight: 25,
      font: DEFAULT_COMPARISON_SELECTOR_FONT,
      roundedCornerRadius: 5
    }, options );

    super();

    // Create the button for selecting the "less than" operator.
    const lessThanSelectorShape = Shape.roundedRectangleWithRadii(
      -options.selectorWidth,
      -options.selectorHeight / 2,
      options.selectorWidth,
      options.selectorHeight,
      { topLeft: options.roundedCornerRadius, bottomLeft: options.roundedCornerRadius }
    );
    const lessThanOperatorSelectorNode = new Path( lessThanSelectorShape, {
      stroke: 'black',
      cursor: 'pointer'
    } );
    const lessThanText = new Text( LESS_THAN_STRING, {
      font: options.font,
      centerX: lessThanOperatorSelectorNode.centerX,
      centerY: 0
    } );
    lessThanOperatorSelectorNode.addChild( lessThanText );
    lessThanOperatorSelectorNode.touchArea = lessThanOperatorSelectorNode.bounds.withOffsets(
      BUTTON_TOUCH_DILATION, BUTTON_TOUCH_DILATION, 0, BUTTON_TOUCH_DILATION
    );
    lessThanOperatorSelectorNode.addInputListener( new FireListener( {
      fire: () => {
        selectedOperatorProperty.value = LESS_THAN_STRING;
      }
    } ) );
    this.addChild( lessThanOperatorSelectorNode );

    // Create the button for selecting the "greater than" operator.
    const greaterThanSelectorShape = Shape.roundedRectangleWithRadii(
      0,
      -options.selectorHeight / 2,
      options.selectorWidth,
      options.selectorHeight,
      { topRight: options.roundedCornerRadius, bottomRight: options.roundedCornerRadius }
    );
    const greaterThanOperatorSelectorNode = new Path( greaterThanSelectorShape, {
      stroke: 'black',
      cursor: 'pointer'
    } );
    const greaterThanText = new Text( GREATER_THAN_STRING, {
      font: options.font,
      centerX: greaterThanOperatorSelectorNode.centerX,
      centerY: 0
    } );
    greaterThanOperatorSelectorNode.addChild( greaterThanText );
    greaterThanOperatorSelectorNode.touchArea = greaterThanOperatorSelectorNode.bounds.withOffsets(
      0, BUTTON_TOUCH_DILATION, BUTTON_TOUCH_DILATION, BUTTON_TOUCH_DILATION
    );
    greaterThanOperatorSelectorNode.addInputListener( new FireListener( {
      fire: () => {
        selectedOperatorProperty.value = GREATER_THAN_STRING;
      }
    } ) );
    this.addChild( greaterThanOperatorSelectorNode );

    // Control the appearance of each selector based on the current selection state.
    selectedOperatorProperty.link( selection => {
      if ( selection === LESS_THAN_STRING ) {
        lessThanText.fill = SELECTED_OPERATOR_TEXT_COLOR;
        lessThanOperatorSelectorNode.fill = SELECTED_OPERATOR_BACKGROUND_COLOR;
        greaterThanText.fill = UNSELECTED_OPERATOR_TEXT_COLOR;
        greaterThanOperatorSelectorNode.fill = UNSELECTED_OPERATOR_BACKGROUND_COLOR;
      }
      else {
        lessThanText.fill = UNSELECTED_OPERATOR_TEXT_COLOR;
        lessThanOperatorSelectorNode.fill = UNSELECTED_OPERATOR_BACKGROUND_COLOR;
        greaterThanText.fill = SELECTED_OPERATOR_TEXT_COLOR;
        greaterThanOperatorSelectorNode.fill = SELECTED_OPERATOR_BACKGROUND_COLOR;
      }
    } );

    this.mutate( options );
  }
}

// inner class that is used to portray the numerical value of a number line point
class PointValueNode extends Node {

  /**
   * @param {NumberLinePoint} point
   * @public
   */
  constructor( point ) {

    super();

    // @public (read-only) {NumberLinePoint}
    this.point = point;

    // background - Initial size and coloring is arbitrary, it will be updated in function linked below.
    const background = new Rectangle( 0, 0, 1, 1, 2, 2, {
      lineWidth: NUMBER_BACKGROUND_LINE_WIDTH,
      visible: false // initially invisible, activated (made visible) when user interacts with the point
    } );
    this.addChild( background );

    // the node that represents the value
    const numberText = new Text( '', { font: COMPARISON_STATEMENT_FONT } );
    this.addChild( numberText );

    // Update appearance as the value changes.
    const handleValueChange = value => {
      numberText.string = value;
      background.setRectBounds( numberText.bounds.dilated( NUMBER_BACKGROUND_DILATION_AMOUNT ) );
    };
    point.valueProperty.link( handleValueChange );
    const handleColorChange = color => {
      background.fill = color.colorUtilsBrighter( 0.75 );
      background.stroke = color;
    };
    point.colorProperty.link( handleColorChange );

    // An animation is used to made the background when the user stops dragging the point.
    let backgroundFadeAnimation = null;

    // Update the highlight state as the point is dragged.
    const handleDragStateChange = dragging => {

      if ( dragging ) {
        if ( backgroundFadeAnimation ) {
          backgroundFadeAnimation.stop();
        }
        background.visible = true;
        background.opacity = 1;
      }
      else if ( !backgroundFadeAnimation ) {

        // Start or restart the fade animation.
        backgroundFadeAnimation = new Animation( {
          duration: 0.75,
          easing: Easing.CUBIC_OUT,
          setValue: value => { background.opacity = value; },
          from: 1,
          to: 0
        } );
        backgroundFadeAnimation.start();
        backgroundFadeAnimation.endedEmitter.addListener( () => {
          backgroundFadeAnimation = null;
          background.visible = false;
        } );
      }
    };
    point.isDraggingProperty.link( handleDragStateChange );

    // @private {function}
    this.disposeNumberWithColorNode = () => {
      point.valueProperty.unlink( handleValueChange );
      point.isDraggingProperty.unlink( handleDragStateChange );
      point.colorProperty.unlink( handleColorChange );
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

numberLineIntegers.register( 'ComparisonStatementNode', ComparisonStatementNode );
export default ComparisonStatementNode;