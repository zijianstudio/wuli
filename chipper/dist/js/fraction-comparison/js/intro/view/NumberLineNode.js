// Copyright 2013-2022, University of Colorado Boulder

/**
 * The horizontal number line that shows the values
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import fractionComparison from '../../fractionComparison.js';
import FractionNode from './FractionNode.js';
class NumberLineNode extends Node {
  /**
   * @param {FractionModel} leftFractionModel
   * @param {FractionModel} rightFractionModel
   * @param {Property.<boolean>} visibleProperty
   * @param {Object} [options]
   */
  constructor(leftFractionModel, rightFractionModel, visibleProperty, options) {
    super();
    const leftFractionProperty = leftFractionModel.fractionProperty;
    const rightFractionProperty = rightFractionModel.fractionProperty;
    const width = 300;
    const line = new Line(0, 0, width, 0, {
      lineWidth: 2,
      stroke: 'black'
    });
    this.addChild(line);
    const leftFill = '#61c9e4';
    const rightFill = '#dc528d';
    const leftRectangle = new Rectangle(0, -20, width, 20, {
      fill: leftFill,
      lineWidth: 1,
      stroke: 'black'
    });
    this.addChild(leftRectangle);
    const rightRectangle = new Rectangle(0, -40, width, 20, {
      fill: rightFill,
      lineWidth: 1,
      stroke: 'black'
    });
    this.addChild(rightRectangle);
    new DerivedProperty([leftFractionProperty], leftFraction => leftFraction * width).linkAttribute(leftRectangle, 'rectWidth');
    new DerivedProperty([rightFractionProperty], rightFraction => rightFraction * width).linkAttribute(rightRectangle, 'rectWidth');
    const linesNode = new Node({
      pickable: false
    });
    this.addChild(linesNode);

    //Create the fraction nodes, and size them to be about the same size as the 0/1 labels.  Cannot use maths to get the scaling exactly right since the font bounds are wonky, so just use a heuristic scale factor
    const fractionNodeScale = 0.22;
    const fractionTop = 14;
    const leftFractionNode = new FractionNode(leftFractionModel.numeratorProperty, leftFractionModel.denominatorProperty, {
      interactive: false,
      scale: fractionNodeScale,
      fill: leftFill,
      top: fractionTop
    });
    this.addChild(leftFractionNode);
    const coloredTickStroke = 2;
    const leftFractionNodeTickMark = new Line(0, 0, 0, 0, {
      lineWidth: coloredTickStroke,
      stroke: leftFill
    });
    this.addChild(leftFractionNodeTickMark);
    const rightFractionNode = new FractionNode(rightFractionModel.numeratorProperty, rightFractionModel.denominatorProperty, {
      interactive: false,
      scale: fractionNodeScale,
      fill: rightFill,
      top: fractionTop
    });
    this.addChild(rightFractionNode);
    const rightFractionNodeTickMark = new Line(0, 0, 0, 0, {
      lineWidth: coloredTickStroke,
      stroke: rightFill
    });
    this.addChild(rightFractionNodeTickMark);

    //When tick spacing or labeled ticks change, update the ticks
    //TODO: Could be redesigned so that the black ticks aren't changing when the numerators change, if it is a performance problem
    Multilink.multilink([visibleProperty, leftFractionModel.numeratorProperty, leftFractionModel.denominatorProperty, rightFractionModel.numeratorProperty, rightFractionModel.denominatorProperty], (visible, leftNumerator, leftDenominator, rightNumerator, rightDenominator) => {
      const lineHeight = 16;
      const leastCommonDenominator = NumberLineNode.leastCommonDenominator(leftDenominator, rightDenominator);
      const lines = [];
      const maxTickIndex = leastCommonDenominator;
      for (let i = 0; i <= maxTickIndex; i++) {
        const distance = i / maxTickIndex * width;
        if (visible || i === 0 || i === maxTickIndex) {
          lines.push(new Line(distance, -lineHeight / 2, distance, lineHeight / 2, {
            lineWidth: 1.5,
            stroke: 'black'
          }));
        }
      }
      linesNode.children = lines;

      //Update the left/right fraction nodes for the fraction value and the colored tick mark
      const leftXOffset = leftNumerator === 0 || leftNumerator === leftDenominator ? lineHeight : Math.abs(leftNumerator / leftDenominator - rightNumerator / rightDenominator) < 1E-6 ? lineHeight * 0.8 : 0;
      const leftCenterX = width * leftNumerator / leftDenominator - leftXOffset;
      leftFractionNode.centerX = leftCenterX;
      leftFractionNodeTickMark.setLine(leftCenterX, leftFractionNode.top, width * leftNumerator / leftDenominator, leftFractionNode.top - fractionTop);
      const rightXOffset = rightNumerator === 0 || rightNumerator === rightDenominator ? lineHeight : Math.abs(rightNumerator / rightDenominator - leftNumerator / leftDenominator) < 1E-6 ? lineHeight * 0.8 : 0;
      const rightCenterX = width * rightNumerator / rightDenominator + rightXOffset;
      rightFractionNode.centerX = rightCenterX;
      rightFractionNodeTickMark.setLine(rightCenterX, rightFractionNode.top, width * rightNumerator / rightDenominator, rightFractionNode.top - fractionTop);

      //Handle overlapping number labels, see https://github.com/phetsims/fraction-comparison/issues/31
      if (leftFractionNode.bounds.intersectsBounds(rightFractionNode.bounds) && Math.abs(rightNumerator / rightDenominator - leftNumerator / leftDenominator) > 1E-6) {
        const overlapAmount = leftFractionModel.fraction > rightFractionModel.fraction ? leftFractionNode.bounds.minX - rightFractionNode.bounds.maxX + 2 : leftFractionNode.bounds.maxX - rightFractionNode.bounds.minX + 2;
        leftFractionNode.translate(-overlapAmount / 2 / fractionNodeScale, 0);
        rightFractionNode.translate(+overlapAmount / 2 / fractionNodeScale, 0);
      }
    });
    const labelTop = linesNode.children[0].bounds.maxY;
    const zeroLabel = new Text('0', {
      centerX: linesNode.children[0].centerX,
      top: labelTop,
      font: new PhetFont({
        size: 26
      })
    });
    const oneLabel = new Text('1', {
      centerX: linesNode.children[linesNode.children.length - 1].centerX,
      top: labelTop,
      font: new PhetFont({
        size: 26
      })
    });
    this.addChild(zeroLabel);
    this.addChild(oneLabel);

    //Only show certain properties when the number line checkbox is selected
    visibleProperty.linkAttribute(leftRectangle, 'visible');
    visibleProperty.linkAttribute(rightRectangle, 'visible');
    visibleProperty.linkAttribute(leftFractionNode, 'visible');
    visibleProperty.linkAttribute(rightFractionNode, 'visible');
    visibleProperty.linkAttribute(leftFractionNodeTickMark, 'visible');
    visibleProperty.linkAttribute(rightFractionNodeTickMark, 'visible');
    this.mutate(options);
  }

  /**
   * Returns the least common denominator of a and b
   * @param {number} a
   * @param {number} b
   * @returns {number}
   * @public
   */
  static leastCommonDenominator(a, b) {
    return a * b / NumberLineNode.greatestCommonDenominator(a, b);
  }

  /**
   * Returns the greatest common denominator of a and b
   * @param {number} a
   * @param {number} b
   * @returns {number}
   * @public
   */
  static greatestCommonDenominator(a, b) {
    assert && assert(Number.isInteger(a) && Number.isInteger(b));
    return b ? NumberLineNode.greatestCommonDenominator(b, a % b) : Math.abs(a);
  }
}
fractionComparison.register('NumberLineNode', NumberLineNode);
export default NumberLineNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJQaGV0Rm9udCIsIkxpbmUiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiVGV4dCIsImZyYWN0aW9uQ29tcGFyaXNvbiIsIkZyYWN0aW9uTm9kZSIsIk51bWJlckxpbmVOb2RlIiwiY29uc3RydWN0b3IiLCJsZWZ0RnJhY3Rpb25Nb2RlbCIsInJpZ2h0RnJhY3Rpb25Nb2RlbCIsInZpc2libGVQcm9wZXJ0eSIsIm9wdGlvbnMiLCJsZWZ0RnJhY3Rpb25Qcm9wZXJ0eSIsImZyYWN0aW9uUHJvcGVydHkiLCJyaWdodEZyYWN0aW9uUHJvcGVydHkiLCJ3aWR0aCIsImxpbmUiLCJsaW5lV2lkdGgiLCJzdHJva2UiLCJhZGRDaGlsZCIsImxlZnRGaWxsIiwicmlnaHRGaWxsIiwibGVmdFJlY3RhbmdsZSIsImZpbGwiLCJyaWdodFJlY3RhbmdsZSIsImxlZnRGcmFjdGlvbiIsImxpbmtBdHRyaWJ1dGUiLCJyaWdodEZyYWN0aW9uIiwibGluZXNOb2RlIiwicGlja2FibGUiLCJmcmFjdGlvbk5vZGVTY2FsZSIsImZyYWN0aW9uVG9wIiwibGVmdEZyYWN0aW9uTm9kZSIsIm51bWVyYXRvclByb3BlcnR5IiwiZGVub21pbmF0b3JQcm9wZXJ0eSIsImludGVyYWN0aXZlIiwic2NhbGUiLCJ0b3AiLCJjb2xvcmVkVGlja1N0cm9rZSIsImxlZnRGcmFjdGlvbk5vZGVUaWNrTWFyayIsInJpZ2h0RnJhY3Rpb25Ob2RlIiwicmlnaHRGcmFjdGlvbk5vZGVUaWNrTWFyayIsIm11bHRpbGluayIsInZpc2libGUiLCJsZWZ0TnVtZXJhdG9yIiwibGVmdERlbm9taW5hdG9yIiwicmlnaHROdW1lcmF0b3IiLCJyaWdodERlbm9taW5hdG9yIiwibGluZUhlaWdodCIsImxlYXN0Q29tbW9uRGVub21pbmF0b3IiLCJsaW5lcyIsIm1heFRpY2tJbmRleCIsImkiLCJkaXN0YW5jZSIsInB1c2giLCJjaGlsZHJlbiIsImxlZnRYT2Zmc2V0IiwiTWF0aCIsImFicyIsImxlZnRDZW50ZXJYIiwiY2VudGVyWCIsInNldExpbmUiLCJyaWdodFhPZmZzZXQiLCJyaWdodENlbnRlclgiLCJib3VuZHMiLCJpbnRlcnNlY3RzQm91bmRzIiwib3ZlcmxhcEFtb3VudCIsImZyYWN0aW9uIiwibWluWCIsIm1heFgiLCJ0cmFuc2xhdGUiLCJsYWJlbFRvcCIsIm1heFkiLCJ6ZXJvTGFiZWwiLCJmb250Iiwic2l6ZSIsIm9uZUxhYmVsIiwibGVuZ3RoIiwibXV0YXRlIiwiYSIsImIiLCJncmVhdGVzdENvbW1vbkRlbm9taW5hdG9yIiwiYXNzZXJ0IiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOdW1iZXJMaW5lTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgaG9yaXpvbnRhbCBudW1iZXIgbGluZSB0aGF0IHNob3dzIHRoZSB2YWx1ZXNcclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBMaW5lLCBOb2RlLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZnJhY3Rpb25Db21wYXJpc29uIGZyb20gJy4uLy4uL2ZyYWN0aW9uQ29tcGFyaXNvbi5qcyc7XHJcbmltcG9ydCBGcmFjdGlvbk5vZGUgZnJvbSAnLi9GcmFjdGlvbk5vZGUuanMnO1xyXG5cclxuY2xhc3MgTnVtYmVyTGluZU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge0ZyYWN0aW9uTW9kZWx9IGxlZnRGcmFjdGlvbk1vZGVsXHJcbiAgICogQHBhcmFtIHtGcmFjdGlvbk1vZGVsfSByaWdodEZyYWN0aW9uTW9kZWxcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gdmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBsZWZ0RnJhY3Rpb25Nb2RlbCwgcmlnaHRGcmFjdGlvbk1vZGVsLCB2aXNpYmxlUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIGNvbnN0IGxlZnRGcmFjdGlvblByb3BlcnR5ID0gbGVmdEZyYWN0aW9uTW9kZWwuZnJhY3Rpb25Qcm9wZXJ0eTtcclxuICAgIGNvbnN0IHJpZ2h0RnJhY3Rpb25Qcm9wZXJ0eSA9IHJpZ2h0RnJhY3Rpb25Nb2RlbC5mcmFjdGlvblByb3BlcnR5O1xyXG5cclxuICAgIGNvbnN0IHdpZHRoID0gMzAwO1xyXG4gICAgY29uc3QgbGluZSA9IG5ldyBMaW5lKCAwLCAwLCB3aWR0aCwgMCwgeyBsaW5lV2lkdGg6IDIsIHN0cm9rZTogJ2JsYWNrJyB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbGluZSApO1xyXG5cclxuICAgIGNvbnN0IGxlZnRGaWxsID0gJyM2MWM5ZTQnO1xyXG4gICAgY29uc3QgcmlnaHRGaWxsID0gJyNkYzUyOGQnO1xyXG4gICAgY29uc3QgbGVmdFJlY3RhbmdsZSA9IG5ldyBSZWN0YW5nbGUoIDAsIC0yMCwgd2lkdGgsIDIwLCB7IGZpbGw6IGxlZnRGaWxsLCBsaW5lV2lkdGg6IDEsIHN0cm9rZTogJ2JsYWNrJyB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBsZWZ0UmVjdGFuZ2xlICk7XHJcbiAgICBjb25zdCByaWdodFJlY3RhbmdsZSA9IG5ldyBSZWN0YW5nbGUoIDAsIC00MCwgd2lkdGgsIDIwLCB7IGZpbGw6IHJpZ2h0RmlsbCwgbGluZVdpZHRoOiAxLCBzdHJva2U6ICdibGFjaycgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcmlnaHRSZWN0YW5nbGUgKTtcclxuXHJcbiAgICBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIGxlZnRGcmFjdGlvblByb3BlcnR5IF0sIGxlZnRGcmFjdGlvbiA9PiBsZWZ0RnJhY3Rpb24gKiB3aWR0aCApLmxpbmtBdHRyaWJ1dGUoIGxlZnRSZWN0YW5nbGUsICdyZWN0V2lkdGgnICk7XHJcblxyXG4gICAgbmV3IERlcml2ZWRQcm9wZXJ0eSggWyByaWdodEZyYWN0aW9uUHJvcGVydHkgXSwgcmlnaHRGcmFjdGlvbiA9PiByaWdodEZyYWN0aW9uICogd2lkdGggKS5saW5rQXR0cmlidXRlKCByaWdodFJlY3RhbmdsZSwgJ3JlY3RXaWR0aCcgKTtcclxuXHJcbiAgICBjb25zdCBsaW5lc05vZGUgPSBuZXcgTm9kZSggeyBwaWNrYWJsZTogZmFsc2UgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbGluZXNOb2RlICk7XHJcblxyXG4gICAgLy9DcmVhdGUgdGhlIGZyYWN0aW9uIG5vZGVzLCBhbmQgc2l6ZSB0aGVtIHRvIGJlIGFib3V0IHRoZSBzYW1lIHNpemUgYXMgdGhlIDAvMSBsYWJlbHMuICBDYW5ub3QgdXNlIG1hdGhzIHRvIGdldCB0aGUgc2NhbGluZyBleGFjdGx5IHJpZ2h0IHNpbmNlIHRoZSBmb250IGJvdW5kcyBhcmUgd29ua3ksIHNvIGp1c3QgdXNlIGEgaGV1cmlzdGljIHNjYWxlIGZhY3RvclxyXG4gICAgY29uc3QgZnJhY3Rpb25Ob2RlU2NhbGUgPSAwLjIyO1xyXG4gICAgY29uc3QgZnJhY3Rpb25Ub3AgPSAxNDtcclxuICAgIGNvbnN0IGxlZnRGcmFjdGlvbk5vZGUgPSBuZXcgRnJhY3Rpb25Ob2RlKCBsZWZ0RnJhY3Rpb25Nb2RlbC5udW1lcmF0b3JQcm9wZXJ0eSwgbGVmdEZyYWN0aW9uTW9kZWwuZGVub21pbmF0b3JQcm9wZXJ0eSwge1xyXG4gICAgICBpbnRlcmFjdGl2ZTogZmFsc2UsXHJcbiAgICAgIHNjYWxlOiBmcmFjdGlvbk5vZGVTY2FsZSxcclxuICAgICAgZmlsbDogbGVmdEZpbGwsXHJcbiAgICAgIHRvcDogZnJhY3Rpb25Ub3BcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGxlZnRGcmFjdGlvbk5vZGUgKTtcclxuICAgIGNvbnN0IGNvbG9yZWRUaWNrU3Ryb2tlID0gMjtcclxuICAgIGNvbnN0IGxlZnRGcmFjdGlvbk5vZGVUaWNrTWFyayA9IG5ldyBMaW5lKCAwLCAwLCAwLCAwLCB7IGxpbmVXaWR0aDogY29sb3JlZFRpY2tTdHJva2UsIHN0cm9rZTogbGVmdEZpbGwgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbGVmdEZyYWN0aW9uTm9kZVRpY2tNYXJrICk7XHJcblxyXG4gICAgY29uc3QgcmlnaHRGcmFjdGlvbk5vZGUgPSBuZXcgRnJhY3Rpb25Ob2RlKCByaWdodEZyYWN0aW9uTW9kZWwubnVtZXJhdG9yUHJvcGVydHksIHJpZ2h0RnJhY3Rpb25Nb2RlbC5kZW5vbWluYXRvclByb3BlcnR5LCB7XHJcbiAgICAgIGludGVyYWN0aXZlOiBmYWxzZSxcclxuICAgICAgc2NhbGU6IGZyYWN0aW9uTm9kZVNjYWxlLFxyXG4gICAgICBmaWxsOiByaWdodEZpbGwsXHJcbiAgICAgIHRvcDogZnJhY3Rpb25Ub3BcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJpZ2h0RnJhY3Rpb25Ob2RlICk7XHJcbiAgICBjb25zdCByaWdodEZyYWN0aW9uTm9kZVRpY2tNYXJrID0gbmV3IExpbmUoIDAsIDAsIDAsIDAsIHsgbGluZVdpZHRoOiBjb2xvcmVkVGlja1N0cm9rZSwgc3Ryb2tlOiByaWdodEZpbGwgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcmlnaHRGcmFjdGlvbk5vZGVUaWNrTWFyayApO1xyXG5cclxuICAgIC8vV2hlbiB0aWNrIHNwYWNpbmcgb3IgbGFiZWxlZCB0aWNrcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgdGlja3NcclxuICAgIC8vVE9ETzogQ291bGQgYmUgcmVkZXNpZ25lZCBzbyB0aGF0IHRoZSBibGFjayB0aWNrcyBhcmVuJ3QgY2hhbmdpbmcgd2hlbiB0aGUgbnVtZXJhdG9ycyBjaGFuZ2UsIGlmIGl0IGlzIGEgcGVyZm9ybWFuY2UgcHJvYmxlbVxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyB2aXNpYmxlUHJvcGVydHksXHJcbiAgICAgICAgbGVmdEZyYWN0aW9uTW9kZWwubnVtZXJhdG9yUHJvcGVydHksXHJcbiAgICAgICAgbGVmdEZyYWN0aW9uTW9kZWwuZGVub21pbmF0b3JQcm9wZXJ0eSxcclxuICAgICAgICByaWdodEZyYWN0aW9uTW9kZWwubnVtZXJhdG9yUHJvcGVydHksXHJcbiAgICAgICAgcmlnaHRGcmFjdGlvbk1vZGVsLmRlbm9taW5hdG9yUHJvcGVydHkgXSxcclxuICAgICAgKCB2aXNpYmxlLCBsZWZ0TnVtZXJhdG9yLCBsZWZ0RGVub21pbmF0b3IsIHJpZ2h0TnVtZXJhdG9yLCByaWdodERlbm9taW5hdG9yICkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGxpbmVIZWlnaHQgPSAxNjtcclxuICAgICAgICBjb25zdCBsZWFzdENvbW1vbkRlbm9taW5hdG9yID0gTnVtYmVyTGluZU5vZGUubGVhc3RDb21tb25EZW5vbWluYXRvciggbGVmdERlbm9taW5hdG9yLCByaWdodERlbm9taW5hdG9yICk7XHJcbiAgICAgICAgY29uc3QgbGluZXMgPSBbXTtcclxuICAgICAgICBjb25zdCBtYXhUaWNrSW5kZXggPSBsZWFzdENvbW1vbkRlbm9taW5hdG9yO1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8PSBtYXhUaWNrSW5kZXg7IGkrKyApIHtcclxuICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gaSAvIG1heFRpY2tJbmRleCAqIHdpZHRoO1xyXG5cclxuICAgICAgICAgIGlmICggdmlzaWJsZSB8fCBpID09PSAwIHx8IGkgPT09IG1heFRpY2tJbmRleCApIHtcclxuICAgICAgICAgICAgbGluZXMucHVzaCggbmV3IExpbmUoIGRpc3RhbmNlLCAtbGluZUhlaWdodCAvIDIsIGRpc3RhbmNlLCBsaW5lSGVpZ2h0IC8gMiwge1xyXG4gICAgICAgICAgICAgIGxpbmVXaWR0aDogMS41LFxyXG4gICAgICAgICAgICAgIHN0cm9rZTogJ2JsYWNrJ1xyXG4gICAgICAgICAgICB9ICkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbGluZXNOb2RlLmNoaWxkcmVuID0gbGluZXM7XHJcblxyXG4gICAgICAgIC8vVXBkYXRlIHRoZSBsZWZ0L3JpZ2h0IGZyYWN0aW9uIG5vZGVzIGZvciB0aGUgZnJhY3Rpb24gdmFsdWUgYW5kIHRoZSBjb2xvcmVkIHRpY2sgbWFya1xyXG4gICAgICAgIGNvbnN0IGxlZnRYT2Zmc2V0ID0gKCBsZWZ0TnVtZXJhdG9yID09PSAwIHx8IGxlZnROdW1lcmF0b3IgPT09IGxlZnREZW5vbWluYXRvciApID8gbGluZUhlaWdodCA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmFicyggbGVmdE51bWVyYXRvciAvIGxlZnREZW5vbWluYXRvciAtIHJpZ2h0TnVtZXJhdG9yIC8gcmlnaHREZW5vbWluYXRvciApIDwgMUUtNiA/IGxpbmVIZWlnaHQgKiAwLjggOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMDtcclxuICAgICAgICBjb25zdCBsZWZ0Q2VudGVyWCA9IHdpZHRoICogbGVmdE51bWVyYXRvciAvIGxlZnREZW5vbWluYXRvciAtIGxlZnRYT2Zmc2V0O1xyXG4gICAgICAgIGxlZnRGcmFjdGlvbk5vZGUuY2VudGVyWCA9IGxlZnRDZW50ZXJYO1xyXG4gICAgICAgIGxlZnRGcmFjdGlvbk5vZGVUaWNrTWFyay5zZXRMaW5lKCBsZWZ0Q2VudGVyWCwgbGVmdEZyYWN0aW9uTm9kZS50b3AsIHdpZHRoICogbGVmdE51bWVyYXRvciAvIGxlZnREZW5vbWluYXRvciwgbGVmdEZyYWN0aW9uTm9kZS50b3AgLSBmcmFjdGlvblRvcCApO1xyXG5cclxuICAgICAgICBjb25zdCByaWdodFhPZmZzZXQgPSAoIHJpZ2h0TnVtZXJhdG9yID09PSAwIHx8IHJpZ2h0TnVtZXJhdG9yID09PSByaWdodERlbm9taW5hdG9yICkgPyBsaW5lSGVpZ2h0IDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmFicyggcmlnaHROdW1lcmF0b3IgLyByaWdodERlbm9taW5hdG9yIC0gbGVmdE51bWVyYXRvciAvIGxlZnREZW5vbWluYXRvciApIDwgMUUtNiA/IGxpbmVIZWlnaHQgKiAwLjggOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDA7XHJcbiAgICAgICAgY29uc3QgcmlnaHRDZW50ZXJYID0gd2lkdGggKiByaWdodE51bWVyYXRvciAvIHJpZ2h0RGVub21pbmF0b3IgKyByaWdodFhPZmZzZXQ7XHJcbiAgICAgICAgcmlnaHRGcmFjdGlvbk5vZGUuY2VudGVyWCA9IHJpZ2h0Q2VudGVyWDtcclxuICAgICAgICByaWdodEZyYWN0aW9uTm9kZVRpY2tNYXJrLnNldExpbmUoIHJpZ2h0Q2VudGVyWCwgcmlnaHRGcmFjdGlvbk5vZGUudG9wLCB3aWR0aCAqIHJpZ2h0TnVtZXJhdG9yIC8gcmlnaHREZW5vbWluYXRvciwgcmlnaHRGcmFjdGlvbk5vZGUudG9wIC0gZnJhY3Rpb25Ub3AgKTtcclxuXHJcbiAgICAgICAgLy9IYW5kbGUgb3ZlcmxhcHBpbmcgbnVtYmVyIGxhYmVscywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mcmFjdGlvbi1jb21wYXJpc29uL2lzc3Vlcy8zMVxyXG4gICAgICAgIGlmICggbGVmdEZyYWN0aW9uTm9kZS5ib3VuZHMuaW50ZXJzZWN0c0JvdW5kcyggcmlnaHRGcmFjdGlvbk5vZGUuYm91bmRzICkgJiYgTWF0aC5hYnMoIHJpZ2h0TnVtZXJhdG9yIC8gcmlnaHREZW5vbWluYXRvciAtIGxlZnROdW1lcmF0b3IgLyBsZWZ0RGVub21pbmF0b3IgKSA+IDFFLTYgKSB7XHJcbiAgICAgICAgICBjb25zdCBvdmVybGFwQW1vdW50ID0gKCBsZWZ0RnJhY3Rpb25Nb2RlbC5mcmFjdGlvbiA+IHJpZ2h0RnJhY3Rpb25Nb2RlbC5mcmFjdGlvbiApID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0RnJhY3Rpb25Ob2RlLmJvdW5kcy5taW5YIC0gcmlnaHRGcmFjdGlvbk5vZGUuYm91bmRzLm1heFggKyAyIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0RnJhY3Rpb25Ob2RlLmJvdW5kcy5tYXhYIC0gcmlnaHRGcmFjdGlvbk5vZGUuYm91bmRzLm1pblggKyAyO1xyXG5cclxuICAgICAgICAgIGxlZnRGcmFjdGlvbk5vZGUudHJhbnNsYXRlKCAtb3ZlcmxhcEFtb3VudCAvIDIgLyBmcmFjdGlvbk5vZGVTY2FsZSwgMCApO1xyXG4gICAgICAgICAgcmlnaHRGcmFjdGlvbk5vZGUudHJhbnNsYXRlKCArb3ZlcmxhcEFtb3VudCAvIDIgLyBmcmFjdGlvbk5vZGVTY2FsZSwgMCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGxhYmVsVG9wID0gbGluZXNOb2RlLmNoaWxkcmVuWyAwIF0uYm91bmRzLm1heFk7XHJcblxyXG4gICAgY29uc3QgemVyb0xhYmVsID0gbmV3IFRleHQoICcwJywge1xyXG4gICAgICBjZW50ZXJYOiBsaW5lc05vZGUuY2hpbGRyZW5bIDAgXS5jZW50ZXJYLFxyXG4gICAgICB0b3A6IGxhYmVsVG9wLFxyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMjYgfSApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBvbmVMYWJlbCA9IG5ldyBUZXh0KCAnMScsIHtcclxuICAgICAgY2VudGVyWDogbGluZXNOb2RlLmNoaWxkcmVuWyBsaW5lc05vZGUuY2hpbGRyZW4ubGVuZ3RoIC0gMSBdLmNlbnRlclgsXHJcbiAgICAgIHRvcDogbGFiZWxUb3AsXHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyNiB9IClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB6ZXJvTGFiZWwgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG9uZUxhYmVsICk7XHJcblxyXG4gICAgLy9Pbmx5IHNob3cgY2VydGFpbiBwcm9wZXJ0aWVzIHdoZW4gdGhlIG51bWJlciBsaW5lIGNoZWNrYm94IGlzIHNlbGVjdGVkXHJcbiAgICB2aXNpYmxlUHJvcGVydHkubGlua0F0dHJpYnV0ZSggbGVmdFJlY3RhbmdsZSwgJ3Zpc2libGUnICk7XHJcbiAgICB2aXNpYmxlUHJvcGVydHkubGlua0F0dHJpYnV0ZSggcmlnaHRSZWN0YW5nbGUsICd2aXNpYmxlJyApO1xyXG4gICAgdmlzaWJsZVByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIGxlZnRGcmFjdGlvbk5vZGUsICd2aXNpYmxlJyApO1xyXG4gICAgdmlzaWJsZVByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHJpZ2h0RnJhY3Rpb25Ob2RlLCAndmlzaWJsZScgKTtcclxuICAgIHZpc2libGVQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCBsZWZ0RnJhY3Rpb25Ob2RlVGlja01hcmssICd2aXNpYmxlJyApO1xyXG4gICAgdmlzaWJsZVByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHJpZ2h0RnJhY3Rpb25Ob2RlVGlja01hcmssICd2aXNpYmxlJyApO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBsZWFzdCBjb21tb24gZGVub21pbmF0b3Igb2YgYSBhbmQgYlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGF0aWMgbGVhc3RDb21tb25EZW5vbWluYXRvciggYSwgYiApIHtcclxuICAgIHJldHVybiBhICogYiAvIE51bWJlckxpbmVOb2RlLmdyZWF0ZXN0Q29tbW9uRGVub21pbmF0b3IoIGEsIGIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGdyZWF0ZXN0IGNvbW1vbiBkZW5vbWluYXRvciBvZiBhIGFuZCBiXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0YXRpYyBncmVhdGVzdENvbW1vbkRlbm9taW5hdG9yKCBhLCBiICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggYSApICYmIE51bWJlci5pc0ludGVnZXIoIGIgKSApO1xyXG4gICAgcmV0dXJuIGIgPyBOdW1iZXJMaW5lTm9kZS5ncmVhdGVzdENvbW1vbkRlbm9taW5hdG9yKCBiLCBhICUgYiApIDogTWF0aC5hYnMoIGEgKTtcclxuICB9XHJcbn1cclxuXHJcbmZyYWN0aW9uQ29tcGFyaXNvbi5yZWdpc3RlciggJ051bWJlckxpbmVOb2RlJywgTnVtYmVyTGluZU5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE51bWJlckxpbmVOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQy9FLE9BQU9DLGtCQUFrQixNQUFN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