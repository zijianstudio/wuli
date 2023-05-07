// Copyright 2016-2023, University of Colorado Boulder

/**
 * Displays an equation in "helpful" format. See HelpfulEquation for backstory on name and specification.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../../phet-core/js/merge.js';
import { Line, Node, Text } from '../../../../../scenery/js/imports.js';
import functionBuilder from '../../../functionBuilder.js';
import FBConstants from '../../FBConstants.js';
import FBSymbols from '../../FBSymbols.js';
import HelpfulEquation from '../../model/equations/HelpfulEquation.js';
import RationalNumber from '../../model/RationalNumber.js';
import CardNode from '../cards/CardNode.js';
import RationalNumberNode from '../RationalNumberNode.js';
export default class HelpfulEquationNode extends Node {
  /**
   * @param {HelpfulEquation} equation
   * @param {Object} [options] - see FBConstants.EQUATION_OPTIONS
   */
  constructor(equation, options) {
    assert && assert(equation instanceof HelpfulEquation);
    phet.log && phet.log(`HelpfulEquation=${equation.toString()}`);
    options = merge({}, FBConstants.EQUATION_OPTIONS, {
      fractionScale: 0.67 // {number} how much to scale fractions
    }, options);
    assert && assert(!options.children, 'decoration not supported');
    options.children = [];
    const mathFunctions = equation.mathFunctions; // {MathFunction[]}
    let i = 0; // {number} for loop index
    let xNode = null; // {Node}

    // y
    let yNode = new Text(options.ySymbol, {
      fill: options.yColor,
      font: options.xyFont,
      maxWidth: options.xyMaxWidth
    });
    if (options.xyAsCards) {
      yNode = CardNode.createEquationXYNode(yNode);
    }

    // =
    const equalToNode = new Text(FBSymbols.EQUAL_TO, {
      fill: options.color,
      font: options.symbolFont,
      left: yNode.right + options.equalsXSpacing,
      centerY: yNode.centerY
    });

    // Create the left-hand side nodes to simplify layout, but add them only if requested
    if (options.showLeftHandSide) {
      options.children.push(yNode, equalToNode);
    }
    const RATIONAL_NUMBER_OPTIONS = {
      fill: options.color,
      mixedNumber: false,
      // display as an improper fraction
      fractionYSpacing: options.fractionYSpacing,
      signXSpacing: options.signXSpacing,
      signFont: options.signFont,
      wholeNumberFont: options.wholeNumberFont,
      fractionFont: options.fractionFont
    };
    if (mathFunctions.length === 0) {
      // y = x
      xNode = new Text(options.xSymbol, {
        fill: options.xColor,
        font: options.xyFont,
        maxWidth: options.xyMaxWidth,
        left: equalToNode.right + options.equalsXSpacing
      });
      if (options.xyAsCards) {
        xNode = CardNode.createEquationXYNode(xNode);
      }
      xNode.left = equalToNode.right + options.equalsXSpacing;
      xNode.centerY = equalToNode.centerY;
      options.children.push(xNode);
    } else {
      // local vars to improve readability
      let currentFunction = null; // {MathFunction}
      let currentOperator = null; // {string}
      let currentOperand = null; // {number}
      let previousOperator = null; // {string}

      let operatorNode = null; // {Node}
      let operandNode = null; // {Node}
      let nextLeft = 0; // {number} left position of next Node added to equation
      let nextCenterY = 0; // {number} centerY position of next Node added to equation

      // parent node for right-hand side (rhs) of the equation
      let rhsNode = new Node();

      // x
      xNode = new Text(options.xSymbol, {
        fill: options.xColor,
        font: options.xyFont,
        maxWidth: options.xyMaxWidth
      });
      if (options.xyAsCards) {
        xNode = CardNode.createEquationXYNode(xNode);
      }
      rhsNode.addChild(xNode);
      nextLeft = xNode.right + options.operatorXSpacing;
      nextCenterY = equalToNode.centerY;
      for (i = 0; i < mathFunctions.length; i++) {
        currentFunction = mathFunctions[i];
        currentOperator = currentFunction.operator;
        currentOperand = currentFunction.operandProperty.get().valueOf();
        if (currentOperator === FBSymbols.PLUS) {
          // PLUS ----------------------------------------------------------------------------

          assert && assert(!previousOperator || previousOperator !== FBSymbols.PLUS && previousOperator !== FBSymbols.MINUS, `adjacent plus and minus should have been collapsed: ${equation.toString()}`);

          // eg: x + 3
          operatorNode = new Text(currentOperand >= 0 ? FBSymbols.PLUS : FBSymbols.MINUS, {
            font: options.symbolFont,
            left: nextLeft,
            centerY: nextCenterY
          });
          rhsNode.addChild(operatorNode);
          operandNode = new Text(Math.abs(currentOperand), {
            font: options.wholeNumberFont,
            left: operatorNode.right + options.operatorXSpacing,
            centerY: operatorNode.centerY
          });
          rhsNode.addChild(operandNode);
          nextLeft = operandNode.right + options.operatorXSpacing;
          nextCenterY = operandNode.centerY;
        } else if (currentOperator === FBSymbols.MINUS) {
          // MINUS ----------------------------------------------------------------------------

          assert && assert(!previousOperator || previousOperator !== FBSymbols.PLUS && previousOperator !== FBSymbols.MINUS, `adjacent plus and minus should have been collapsed: ${equation.toString()}`);

          // eg: x - 3
          operatorNode = new Text(currentOperand >= 0 ? FBSymbols.MINUS : FBSymbols.PLUS, {
            font: options.symbolFont,
            left: nextLeft,
            centerY: nextCenterY
          });
          rhsNode.addChild(operatorNode);
          operandNode = new Text(Math.abs(currentOperand), {
            font: options.wholeNumberFont,
            left: operatorNode.right + options.operatorXSpacing,
            centerY: operatorNode.centerY
          });
          rhsNode.addChild(operandNode);
          nextLeft = operandNode.right + options.operatorXSpacing;
          nextCenterY = operandNode.centerY;
        } else if (currentOperator === FBSymbols.TIMES) {
          // TIMES ----------------------------------------------------------------------------

          assert && assert(!previousOperator || previousOperator !== FBSymbols.TIMES, `adjacent times should have been collapsed: ${equation.toString()}`);

          // parentheses around term, eg: 2(x + 2)
          if (i !== 0) {
            const leftParenthesisNode = new Text('(', {
              font: options.parenthesesFont,
              right: rhsNode.left - options.parenthesesXSpacing,
              centerY: nextCenterY
            });
            const rightParenthesisNode = new Text(')', {
              font: options.parenthesesFont,
              left: rhsNode.right + options.parenthesesXSpacing,
              centerY: leftParenthesisNode.centerY
            });

            // scale to fit around term, handling x & y dimensions independently so that parenthesis don't get too heavy
            const parenthesesScaleX = 1;
            const parenthesesScaleY = rhsNode.height / leftParenthesisNode.height;
            leftParenthesisNode.setScaleMagnitude(parenthesesScaleX, parenthesesScaleY);
            rightParenthesisNode.setScaleMagnitude(parenthesesScaleX, parenthesesScaleY);
            rhsNode.addChild(leftParenthesisNode);
            rhsNode.addChild(rightParenthesisNode);
            nextLeft = rightParenthesisNode.right + options.operatorXSpacing;
            nextCenterY = rightParenthesisNode.centerY;
          }

          // multiplier in front of term, eg: 2x or 2(x + 2), use RationalNumberNode so that sign is rendered consistently
          operandNode = new RationalNumberNode(RationalNumber.withInteger(currentOperand), merge({}, RATIONAL_NUMBER_OPTIONS, {
            right: rhsNode.left - options.multiplierXSpacing,
            centerY: nextCenterY
          }));
          rhsNode.addChild(operandNode);
        } else if (currentOperator === FBSymbols.DIVIDE) {
          // DIVIDE ----------------------------------------------------------------------------

          assert && assert(currentOperand !== 0, `divide by zero is not supported: ${equation.toString()}`);
          assert && assert(!previousOperator || previousOperator !== FBSymbols.DIVIDE, `adjacent divide should have been collapsed: ${equation.toString()}`);

          // what we've built so far becomes the numerator
          const numeratorNode = rhsNode;

          // denominator, use RationalNumberNode so that sign is rendered consistently
          const denominatorNode = new RationalNumberNode(RationalNumber.withInteger(currentOperand), merge({}, RATIONAL_NUMBER_OPTIONS, {
            font: options.wholeNumberFont
          }));

          // line dividing numerator and denominator
          const fractionLineLength = Math.max(numeratorNode.width, denominatorNode.width);
          const fractionLineNode = new Line(0, 0, fractionLineLength, 0, {
            stroke: options.color,
            centerX: rhsNode.centerX,
            top: numeratorNode.bottom + options.fractionYSpacing
          });

          // fraction layout
          numeratorNode.centerX = fractionLineNode.centerX;
          numeratorNode.bottom = fractionLineNode.top - options.fractionYSpacing;
          denominatorNode.centerX = fractionLineNode.centerX;
          denominatorNode.top = fractionLineNode.bottom + options.fractionYSpacing;

          // fraction
          const fractionNode = new Node({
            children: [numeratorNode, fractionLineNode, denominatorNode],
            scale: options.fractionScale
          });

          // new right-hand side
          rhsNode = new Node({
            children: [fractionNode]
          });
          nextLeft = rhsNode.right + options.operatorXSpacing;
          nextCenterY = rhsNode.centerY;
        } else {
          // oops! ----------------------------------------------------------------------------

          throw new Error(`invalid operator=${currentOperator}, equation=${equation.toString()}`);
        }
        previousOperator = currentOperator;
      }
      options.children.push(rhsNode);
      rhsNode.left = equalToNode.right + options.equalsXSpacing;
      rhsNode.centerY = equalToNode.centerY;
    }
    super(options);
  }
}
functionBuilder.register('HelpfulEquationNode', HelpfulEquationNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkxpbmUiLCJOb2RlIiwiVGV4dCIsImZ1bmN0aW9uQnVpbGRlciIsIkZCQ29uc3RhbnRzIiwiRkJTeW1ib2xzIiwiSGVscGZ1bEVxdWF0aW9uIiwiUmF0aW9uYWxOdW1iZXIiLCJDYXJkTm9kZSIsIlJhdGlvbmFsTnVtYmVyTm9kZSIsIkhlbHBmdWxFcXVhdGlvbk5vZGUiLCJjb25zdHJ1Y3RvciIsImVxdWF0aW9uIiwib3B0aW9ucyIsImFzc2VydCIsInBoZXQiLCJsb2ciLCJ0b1N0cmluZyIsIkVRVUFUSU9OX09QVElPTlMiLCJmcmFjdGlvblNjYWxlIiwiY2hpbGRyZW4iLCJtYXRoRnVuY3Rpb25zIiwiaSIsInhOb2RlIiwieU5vZGUiLCJ5U3ltYm9sIiwiZmlsbCIsInlDb2xvciIsImZvbnQiLCJ4eUZvbnQiLCJtYXhXaWR0aCIsInh5TWF4V2lkdGgiLCJ4eUFzQ2FyZHMiLCJjcmVhdGVFcXVhdGlvblhZTm9kZSIsImVxdWFsVG9Ob2RlIiwiRVFVQUxfVE8iLCJjb2xvciIsInN5bWJvbEZvbnQiLCJsZWZ0IiwicmlnaHQiLCJlcXVhbHNYU3BhY2luZyIsImNlbnRlclkiLCJzaG93TGVmdEhhbmRTaWRlIiwicHVzaCIsIlJBVElPTkFMX05VTUJFUl9PUFRJT05TIiwibWl4ZWROdW1iZXIiLCJmcmFjdGlvbllTcGFjaW5nIiwic2lnblhTcGFjaW5nIiwic2lnbkZvbnQiLCJ3aG9sZU51bWJlckZvbnQiLCJmcmFjdGlvbkZvbnQiLCJsZW5ndGgiLCJ4U3ltYm9sIiwieENvbG9yIiwiY3VycmVudEZ1bmN0aW9uIiwiY3VycmVudE9wZXJhdG9yIiwiY3VycmVudE9wZXJhbmQiLCJwcmV2aW91c09wZXJhdG9yIiwib3BlcmF0b3JOb2RlIiwib3BlcmFuZE5vZGUiLCJuZXh0TGVmdCIsIm5leHRDZW50ZXJZIiwicmhzTm9kZSIsImFkZENoaWxkIiwib3BlcmF0b3JYU3BhY2luZyIsIm9wZXJhdG9yIiwib3BlcmFuZFByb3BlcnR5IiwiZ2V0IiwidmFsdWVPZiIsIlBMVVMiLCJNSU5VUyIsIk1hdGgiLCJhYnMiLCJUSU1FUyIsImxlZnRQYXJlbnRoZXNpc05vZGUiLCJwYXJlbnRoZXNlc0ZvbnQiLCJwYXJlbnRoZXNlc1hTcGFjaW5nIiwicmlnaHRQYXJlbnRoZXNpc05vZGUiLCJwYXJlbnRoZXNlc1NjYWxlWCIsInBhcmVudGhlc2VzU2NhbGVZIiwiaGVpZ2h0Iiwic2V0U2NhbGVNYWduaXR1ZGUiLCJ3aXRoSW50ZWdlciIsIm11bHRpcGxpZXJYU3BhY2luZyIsIkRJVklERSIsIm51bWVyYXRvck5vZGUiLCJkZW5vbWluYXRvck5vZGUiLCJmcmFjdGlvbkxpbmVMZW5ndGgiLCJtYXgiLCJ3aWR0aCIsImZyYWN0aW9uTGluZU5vZGUiLCJzdHJva2UiLCJjZW50ZXJYIiwidG9wIiwiYm90dG9tIiwiZnJhY3Rpb25Ob2RlIiwic2NhbGUiLCJFcnJvciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSGVscGZ1bEVxdWF0aW9uTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEaXNwbGF5cyBhbiBlcXVhdGlvbiBpbiBcImhlbHBmdWxcIiBmb3JtYXQuIFNlZSBIZWxwZnVsRXF1YXRpb24gZm9yIGJhY2tzdG9yeSBvbiBuYW1lIGFuZCBzcGVjaWZpY2F0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBMaW5lLCBOb2RlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGZ1bmN0aW9uQnVpbGRlciBmcm9tICcuLi8uLi8uLi9mdW5jdGlvbkJ1aWxkZXIuanMnO1xyXG5pbXBvcnQgRkJDb25zdGFudHMgZnJvbSAnLi4vLi4vRkJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRkJTeW1ib2xzIGZyb20gJy4uLy4uL0ZCU3ltYm9scy5qcyc7XHJcbmltcG9ydCBIZWxwZnVsRXF1YXRpb24gZnJvbSAnLi4vLi4vbW9kZWwvZXF1YXRpb25zL0hlbHBmdWxFcXVhdGlvbi5qcyc7XHJcbmltcG9ydCBSYXRpb25hbE51bWJlciBmcm9tICcuLi8uLi9tb2RlbC9SYXRpb25hbE51bWJlci5qcyc7XHJcbmltcG9ydCBDYXJkTm9kZSBmcm9tICcuLi9jYXJkcy9DYXJkTm9kZS5qcyc7XHJcbmltcG9ydCBSYXRpb25hbE51bWJlck5vZGUgZnJvbSAnLi4vUmF0aW9uYWxOdW1iZXJOb2RlLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhlbHBmdWxFcXVhdGlvbk5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtIZWxwZnVsRXF1YXRpb259IGVxdWF0aW9uXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIHNlZSBGQkNvbnN0YW50cy5FUVVBVElPTl9PUFRJT05TXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGVxdWF0aW9uLCBvcHRpb25zICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVxdWF0aW9uIGluc3RhbmNlb2YgSGVscGZ1bEVxdWF0aW9uICk7XHJcbiAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggYEhlbHBmdWxFcXVhdGlvbj0ke2VxdWF0aW9uLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge30sIEZCQ29uc3RhbnRzLkVRVUFUSU9OX09QVElPTlMsIHtcclxuICAgICAgZnJhY3Rpb25TY2FsZTogMC42NyAvLyB7bnVtYmVyfSBob3cgbXVjaCB0byBzY2FsZSBmcmFjdGlvbnNcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5jaGlsZHJlbiwgJ2RlY29yYXRpb24gbm90IHN1cHBvcnRlZCcgKTtcclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbXTtcclxuXHJcbiAgICBjb25zdCBtYXRoRnVuY3Rpb25zID0gZXF1YXRpb24ubWF0aEZ1bmN0aW9uczsgLy8ge01hdGhGdW5jdGlvbltdfVxyXG4gICAgbGV0IGkgPSAwOyAvLyB7bnVtYmVyfSBmb3IgbG9vcCBpbmRleFxyXG4gICAgbGV0IHhOb2RlID0gbnVsbDsgLy8ge05vZGV9XHJcblxyXG4gICAgLy8geVxyXG4gICAgbGV0IHlOb2RlID0gbmV3IFRleHQoIG9wdGlvbnMueVN5bWJvbCwge1xyXG4gICAgICBmaWxsOiBvcHRpb25zLnlDb2xvcixcclxuICAgICAgZm9udDogb3B0aW9ucy54eUZvbnQsXHJcbiAgICAgIG1heFdpZHRoOiBvcHRpb25zLnh5TWF4V2lkdGhcclxuICAgIH0gKTtcclxuICAgIGlmICggb3B0aW9ucy54eUFzQ2FyZHMgKSB7XHJcbiAgICAgIHlOb2RlID0gQ2FyZE5vZGUuY3JlYXRlRXF1YXRpb25YWU5vZGUoIHlOb2RlICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gPVxyXG4gICAgY29uc3QgZXF1YWxUb05vZGUgPSBuZXcgVGV4dCggRkJTeW1ib2xzLkVRVUFMX1RPLCB7XHJcbiAgICAgIGZpbGw6IG9wdGlvbnMuY29sb3IsXHJcbiAgICAgIGZvbnQ6IG9wdGlvbnMuc3ltYm9sRm9udCxcclxuICAgICAgbGVmdDogeU5vZGUucmlnaHQgKyBvcHRpb25zLmVxdWFsc1hTcGFjaW5nLFxyXG4gICAgICBjZW50ZXJZOiB5Tm9kZS5jZW50ZXJZXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBsZWZ0LWhhbmQgc2lkZSBub2RlcyB0byBzaW1wbGlmeSBsYXlvdXQsIGJ1dCBhZGQgdGhlbSBvbmx5IGlmIHJlcXVlc3RlZFxyXG4gICAgaWYgKCBvcHRpb25zLnNob3dMZWZ0SGFuZFNpZGUgKSB7XHJcbiAgICAgIG9wdGlvbnMuY2hpbGRyZW4ucHVzaCggeU5vZGUsIGVxdWFsVG9Ob2RlICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgUkFUSU9OQUxfTlVNQkVSX09QVElPTlMgPSB7XHJcbiAgICAgIGZpbGw6IG9wdGlvbnMuY29sb3IsXHJcbiAgICAgIG1peGVkTnVtYmVyOiBmYWxzZSwgLy8gZGlzcGxheSBhcyBhbiBpbXByb3BlciBmcmFjdGlvblxyXG4gICAgICBmcmFjdGlvbllTcGFjaW5nOiBvcHRpb25zLmZyYWN0aW9uWVNwYWNpbmcsXHJcbiAgICAgIHNpZ25YU3BhY2luZzogb3B0aW9ucy5zaWduWFNwYWNpbmcsXHJcbiAgICAgIHNpZ25Gb250OiBvcHRpb25zLnNpZ25Gb250LFxyXG4gICAgICB3aG9sZU51bWJlckZvbnQ6IG9wdGlvbnMud2hvbGVOdW1iZXJGb250LFxyXG4gICAgICBmcmFjdGlvbkZvbnQ6IG9wdGlvbnMuZnJhY3Rpb25Gb250XHJcbiAgICB9O1xyXG5cclxuICAgIGlmICggbWF0aEZ1bmN0aW9ucy5sZW5ndGggPT09IDAgKSB7XHJcblxyXG4gICAgICAvLyB5ID0geFxyXG4gICAgICB4Tm9kZSA9IG5ldyBUZXh0KCBvcHRpb25zLnhTeW1ib2wsIHtcclxuICAgICAgICBmaWxsOiBvcHRpb25zLnhDb2xvcixcclxuICAgICAgICBmb250OiBvcHRpb25zLnh5Rm9udCxcclxuICAgICAgICBtYXhXaWR0aDogb3B0aW9ucy54eU1heFdpZHRoLFxyXG4gICAgICAgIGxlZnQ6IGVxdWFsVG9Ob2RlLnJpZ2h0ICsgb3B0aW9ucy5lcXVhbHNYU3BhY2luZ1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGlmICggb3B0aW9ucy54eUFzQ2FyZHMgKSB7XHJcbiAgICAgICAgeE5vZGUgPSBDYXJkTm9kZS5jcmVhdGVFcXVhdGlvblhZTm9kZSggeE5vZGUgKTtcclxuICAgICAgfVxyXG4gICAgICB4Tm9kZS5sZWZ0ID0gZXF1YWxUb05vZGUucmlnaHQgKyBvcHRpb25zLmVxdWFsc1hTcGFjaW5nO1xyXG4gICAgICB4Tm9kZS5jZW50ZXJZID0gZXF1YWxUb05vZGUuY2VudGVyWTtcclxuICAgICAgb3B0aW9ucy5jaGlsZHJlbi5wdXNoKCB4Tm9kZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBsb2NhbCB2YXJzIHRvIGltcHJvdmUgcmVhZGFiaWxpdHlcclxuICAgICAgbGV0IGN1cnJlbnRGdW5jdGlvbiA9IG51bGw7IC8vIHtNYXRoRnVuY3Rpb259XHJcbiAgICAgIGxldCBjdXJyZW50T3BlcmF0b3IgPSBudWxsOyAvLyB7c3RyaW5nfVxyXG4gICAgICBsZXQgY3VycmVudE9wZXJhbmQgPSBudWxsOyAvLyB7bnVtYmVyfVxyXG4gICAgICBsZXQgcHJldmlvdXNPcGVyYXRvciA9IG51bGw7IC8vIHtzdHJpbmd9XHJcblxyXG4gICAgICBsZXQgb3BlcmF0b3JOb2RlID0gbnVsbDsgLy8ge05vZGV9XHJcbiAgICAgIGxldCBvcGVyYW5kTm9kZSA9IG51bGw7IC8vIHtOb2RlfVxyXG4gICAgICBsZXQgbmV4dExlZnQgPSAwOyAvLyB7bnVtYmVyfSBsZWZ0IHBvc2l0aW9uIG9mIG5leHQgTm9kZSBhZGRlZCB0byBlcXVhdGlvblxyXG4gICAgICBsZXQgbmV4dENlbnRlclkgPSAwOyAvLyB7bnVtYmVyfSBjZW50ZXJZIHBvc2l0aW9uIG9mIG5leHQgTm9kZSBhZGRlZCB0byBlcXVhdGlvblxyXG5cclxuICAgICAgLy8gcGFyZW50IG5vZGUgZm9yIHJpZ2h0LWhhbmQgc2lkZSAocmhzKSBvZiB0aGUgZXF1YXRpb25cclxuICAgICAgbGV0IHJoc05vZGUgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgICAgLy8geFxyXG4gICAgICB4Tm9kZSA9IG5ldyBUZXh0KCBvcHRpb25zLnhTeW1ib2wsIHtcclxuICAgICAgICBmaWxsOiBvcHRpb25zLnhDb2xvcixcclxuICAgICAgICBmb250OiBvcHRpb25zLnh5Rm9udCxcclxuICAgICAgICBtYXhXaWR0aDogb3B0aW9ucy54eU1heFdpZHRoXHJcbiAgICAgIH0gKTtcclxuICAgICAgaWYgKCBvcHRpb25zLnh5QXNDYXJkcyApIHtcclxuICAgICAgICB4Tm9kZSA9IENhcmROb2RlLmNyZWF0ZUVxdWF0aW9uWFlOb2RlKCB4Tm9kZSApO1xyXG4gICAgICB9XHJcbiAgICAgIHJoc05vZGUuYWRkQ2hpbGQoIHhOb2RlICk7XHJcbiAgICAgIG5leHRMZWZ0ID0geE5vZGUucmlnaHQgKyBvcHRpb25zLm9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgIG5leHRDZW50ZXJZID0gZXF1YWxUb05vZGUuY2VudGVyWTtcclxuXHJcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgbWF0aEZ1bmN0aW9ucy5sZW5ndGg7IGkrKyApIHtcclxuXHJcbiAgICAgICAgY3VycmVudEZ1bmN0aW9uID0gbWF0aEZ1bmN0aW9uc1sgaSBdO1xyXG4gICAgICAgIGN1cnJlbnRPcGVyYXRvciA9IGN1cnJlbnRGdW5jdGlvbi5vcGVyYXRvcjtcclxuICAgICAgICBjdXJyZW50T3BlcmFuZCA9IGN1cnJlbnRGdW5jdGlvbi5vcGVyYW5kUHJvcGVydHkuZ2V0KCkudmFsdWVPZigpO1xyXG5cclxuICAgICAgICBpZiAoIGN1cnJlbnRPcGVyYXRvciA9PT0gRkJTeW1ib2xzLlBMVVMgKSB7XHJcblxyXG4gICAgICAgICAgLy8gUExVUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgICAgICAgICAgIXByZXZpb3VzT3BlcmF0b3IgfHwgKCBwcmV2aW91c09wZXJhdG9yICE9PSBGQlN5bWJvbHMuUExVUyAmJiBwcmV2aW91c09wZXJhdG9yICE9PSBGQlN5bWJvbHMuTUlOVVMgKSxcclxuICAgICAgICAgICAgYGFkamFjZW50IHBsdXMgYW5kIG1pbnVzIHNob3VsZCBoYXZlIGJlZW4gY29sbGFwc2VkOiAke2VxdWF0aW9uLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgICAgICAgIC8vIGVnOiB4ICsgM1xyXG4gICAgICAgICAgb3BlcmF0b3JOb2RlID0gbmV3IFRleHQoIGN1cnJlbnRPcGVyYW5kID49IDAgPyBGQlN5bWJvbHMuUExVUyA6IEZCU3ltYm9scy5NSU5VUywge1xyXG4gICAgICAgICAgICBmb250OiBvcHRpb25zLnN5bWJvbEZvbnQsXHJcbiAgICAgICAgICAgIGxlZnQ6IG5leHRMZWZ0LFxyXG4gICAgICAgICAgICBjZW50ZXJZOiBuZXh0Q2VudGVyWVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgICAgcmhzTm9kZS5hZGRDaGlsZCggb3BlcmF0b3JOb2RlICk7XHJcblxyXG4gICAgICAgICAgb3BlcmFuZE5vZGUgPSBuZXcgVGV4dCggTWF0aC5hYnMoIGN1cnJlbnRPcGVyYW5kICksIHtcclxuICAgICAgICAgICAgZm9udDogb3B0aW9ucy53aG9sZU51bWJlckZvbnQsXHJcbiAgICAgICAgICAgIGxlZnQ6IG9wZXJhdG9yTm9kZS5yaWdodCArIG9wdGlvbnMub3BlcmF0b3JYU3BhY2luZyxcclxuICAgICAgICAgICAgY2VudGVyWTogb3BlcmF0b3JOb2RlLmNlbnRlcllcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIHJoc05vZGUuYWRkQ2hpbGQoIG9wZXJhbmROb2RlICk7XHJcblxyXG4gICAgICAgICAgbmV4dExlZnQgPSBvcGVyYW5kTm9kZS5yaWdodCArIG9wdGlvbnMub3BlcmF0b3JYU3BhY2luZztcclxuICAgICAgICAgIG5leHRDZW50ZXJZID0gb3BlcmFuZE5vZGUuY2VudGVyWTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGN1cnJlbnRPcGVyYXRvciA9PT0gRkJTeW1ib2xzLk1JTlVTICkge1xyXG5cclxuICAgICAgICAgIC8vIE1JTlVTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgICAgICAgICAhcHJldmlvdXNPcGVyYXRvciB8fCAoIHByZXZpb3VzT3BlcmF0b3IgIT09IEZCU3ltYm9scy5QTFVTICYmIHByZXZpb3VzT3BlcmF0b3IgIT09IEZCU3ltYm9scy5NSU5VUyApLFxyXG4gICAgICAgICAgICBgYWRqYWNlbnQgcGx1cyBhbmQgbWludXMgc2hvdWxkIGhhdmUgYmVlbiBjb2xsYXBzZWQ6ICR7ZXF1YXRpb24udG9TdHJpbmcoKX1gICk7XHJcblxyXG4gICAgICAgICAgLy8gZWc6IHggLSAzXHJcbiAgICAgICAgICBvcGVyYXRvck5vZGUgPSBuZXcgVGV4dCggY3VycmVudE9wZXJhbmQgPj0gMCA/IEZCU3ltYm9scy5NSU5VUyA6IEZCU3ltYm9scy5QTFVTLCB7XHJcbiAgICAgICAgICAgIGZvbnQ6IG9wdGlvbnMuc3ltYm9sRm9udCxcclxuICAgICAgICAgICAgbGVmdDogbmV4dExlZnQsXHJcbiAgICAgICAgICAgIGNlbnRlclk6IG5leHRDZW50ZXJZXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICByaHNOb2RlLmFkZENoaWxkKCBvcGVyYXRvck5vZGUgKTtcclxuXHJcbiAgICAgICAgICBvcGVyYW5kTm9kZSA9IG5ldyBUZXh0KCBNYXRoLmFicyggY3VycmVudE9wZXJhbmQgKSwge1xyXG4gICAgICAgICAgICBmb250OiBvcHRpb25zLndob2xlTnVtYmVyRm9udCxcclxuICAgICAgICAgICAgbGVmdDogb3BlcmF0b3JOb2RlLnJpZ2h0ICsgb3B0aW9ucy5vcGVyYXRvclhTcGFjaW5nLFxyXG4gICAgICAgICAgICBjZW50ZXJZOiBvcGVyYXRvck5vZGUuY2VudGVyWVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgICAgcmhzTm9kZS5hZGRDaGlsZCggb3BlcmFuZE5vZGUgKTtcclxuXHJcbiAgICAgICAgICBuZXh0TGVmdCA9IG9wZXJhbmROb2RlLnJpZ2h0ICsgb3B0aW9ucy5vcGVyYXRvclhTcGFjaW5nO1xyXG4gICAgICAgICAgbmV4dENlbnRlclkgPSBvcGVyYW5kTm9kZS5jZW50ZXJZO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggY3VycmVudE9wZXJhdG9yID09PSBGQlN5bWJvbHMuVElNRVMgKSB7XHJcblxyXG4gICAgICAgICAgLy8gVElNRVMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFwcmV2aW91c09wZXJhdG9yIHx8IHByZXZpb3VzT3BlcmF0b3IgIT09IEZCU3ltYm9scy5USU1FUyxcclxuICAgICAgICAgICAgYGFkamFjZW50IHRpbWVzIHNob3VsZCBoYXZlIGJlZW4gY29sbGFwc2VkOiAke2VxdWF0aW9uLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgICAgICAgIC8vIHBhcmVudGhlc2VzIGFyb3VuZCB0ZXJtLCBlZzogMih4ICsgMilcclxuICAgICAgICAgIGlmICggaSAhPT0gMCApIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxlZnRQYXJlbnRoZXNpc05vZGUgPSBuZXcgVGV4dCggJygnLCB7XHJcbiAgICAgICAgICAgICAgZm9udDogb3B0aW9ucy5wYXJlbnRoZXNlc0ZvbnQsXHJcbiAgICAgICAgICAgICAgcmlnaHQ6IHJoc05vZGUubGVmdCAtIG9wdGlvbnMucGFyZW50aGVzZXNYU3BhY2luZyxcclxuICAgICAgICAgICAgICBjZW50ZXJZOiBuZXh0Q2VudGVyWVxyXG4gICAgICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCByaWdodFBhcmVudGhlc2lzTm9kZSA9IG5ldyBUZXh0KCAnKScsIHtcclxuICAgICAgICAgICAgICBmb250OiBvcHRpb25zLnBhcmVudGhlc2VzRm9udCxcclxuICAgICAgICAgICAgICBsZWZ0OiByaHNOb2RlLnJpZ2h0ICsgb3B0aW9ucy5wYXJlbnRoZXNlc1hTcGFjaW5nLFxyXG4gICAgICAgICAgICAgIGNlbnRlclk6IGxlZnRQYXJlbnRoZXNpc05vZGUuY2VudGVyWVxyXG4gICAgICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgICAgICAvLyBzY2FsZSB0byBmaXQgYXJvdW5kIHRlcm0sIGhhbmRsaW5nIHggJiB5IGRpbWVuc2lvbnMgaW5kZXBlbmRlbnRseSBzbyB0aGF0IHBhcmVudGhlc2lzIGRvbid0IGdldCB0b28gaGVhdnlcclxuICAgICAgICAgICAgY29uc3QgcGFyZW50aGVzZXNTY2FsZVggPSAxO1xyXG4gICAgICAgICAgICBjb25zdCBwYXJlbnRoZXNlc1NjYWxlWSA9IHJoc05vZGUuaGVpZ2h0IC8gbGVmdFBhcmVudGhlc2lzTm9kZS5oZWlnaHQ7XHJcbiAgICAgICAgICAgIGxlZnRQYXJlbnRoZXNpc05vZGUuc2V0U2NhbGVNYWduaXR1ZGUoIHBhcmVudGhlc2VzU2NhbGVYLCBwYXJlbnRoZXNlc1NjYWxlWSApO1xyXG4gICAgICAgICAgICByaWdodFBhcmVudGhlc2lzTm9kZS5zZXRTY2FsZU1hZ25pdHVkZSggcGFyZW50aGVzZXNTY2FsZVgsIHBhcmVudGhlc2VzU2NhbGVZICk7XHJcblxyXG4gICAgICAgICAgICByaHNOb2RlLmFkZENoaWxkKCBsZWZ0UGFyZW50aGVzaXNOb2RlICk7XHJcbiAgICAgICAgICAgIHJoc05vZGUuYWRkQ2hpbGQoIHJpZ2h0UGFyZW50aGVzaXNOb2RlICk7XHJcblxyXG4gICAgICAgICAgICBuZXh0TGVmdCA9IHJpZ2h0UGFyZW50aGVzaXNOb2RlLnJpZ2h0ICsgb3B0aW9ucy5vcGVyYXRvclhTcGFjaW5nO1xyXG4gICAgICAgICAgICBuZXh0Q2VudGVyWSA9IHJpZ2h0UGFyZW50aGVzaXNOb2RlLmNlbnRlclk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gbXVsdGlwbGllciBpbiBmcm9udCBvZiB0ZXJtLCBlZzogMnggb3IgMih4ICsgMiksIHVzZSBSYXRpb25hbE51bWJlck5vZGUgc28gdGhhdCBzaWduIGlzIHJlbmRlcmVkIGNvbnNpc3RlbnRseVxyXG4gICAgICAgICAgb3BlcmFuZE5vZGUgPSBuZXcgUmF0aW9uYWxOdW1iZXJOb2RlKCBSYXRpb25hbE51bWJlci53aXRoSW50ZWdlciggY3VycmVudE9wZXJhbmQgKSxcclxuICAgICAgICAgICAgbWVyZ2UoIHt9LCBSQVRJT05BTF9OVU1CRVJfT1BUSU9OUywge1xyXG4gICAgICAgICAgICAgIHJpZ2h0OiByaHNOb2RlLmxlZnQgLSBvcHRpb25zLm11bHRpcGxpZXJYU3BhY2luZyxcclxuICAgICAgICAgICAgICBjZW50ZXJZOiBuZXh0Q2VudGVyWVxyXG4gICAgICAgICAgICB9ICkgKTtcclxuICAgICAgICAgIHJoc05vZGUuYWRkQ2hpbGQoIG9wZXJhbmROb2RlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBjdXJyZW50T3BlcmF0b3IgPT09IEZCU3ltYm9scy5ESVZJREUgKSB7XHJcblxyXG4gICAgICAgICAgLy8gRElWSURFIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjdXJyZW50T3BlcmFuZCAhPT0gMCxcclxuICAgICAgICAgICAgYGRpdmlkZSBieSB6ZXJvIGlzIG5vdCBzdXBwb3J0ZWQ6ICR7ZXF1YXRpb24udG9TdHJpbmcoKX1gICk7XHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhcHJldmlvdXNPcGVyYXRvciB8fCBwcmV2aW91c09wZXJhdG9yICE9PSBGQlN5bWJvbHMuRElWSURFLFxyXG4gICAgICAgICAgICBgYWRqYWNlbnQgZGl2aWRlIHNob3VsZCBoYXZlIGJlZW4gY29sbGFwc2VkOiAke2VxdWF0aW9uLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgICAgICAgIC8vIHdoYXQgd2UndmUgYnVpbHQgc28gZmFyIGJlY29tZXMgdGhlIG51bWVyYXRvclxyXG4gICAgICAgICAgY29uc3QgbnVtZXJhdG9yTm9kZSA9IHJoc05vZGU7XHJcblxyXG4gICAgICAgICAgLy8gZGVub21pbmF0b3IsIHVzZSBSYXRpb25hbE51bWJlck5vZGUgc28gdGhhdCBzaWduIGlzIHJlbmRlcmVkIGNvbnNpc3RlbnRseVxyXG4gICAgICAgICAgY29uc3QgZGVub21pbmF0b3JOb2RlID0gbmV3IFJhdGlvbmFsTnVtYmVyTm9kZSggUmF0aW9uYWxOdW1iZXIud2l0aEludGVnZXIoIGN1cnJlbnRPcGVyYW5kICksXHJcbiAgICAgICAgICAgIG1lcmdlKCB7fSwgUkFUSU9OQUxfTlVNQkVSX09QVElPTlMsIHtcclxuICAgICAgICAgICAgICBmb250OiBvcHRpb25zLndob2xlTnVtYmVyRm9udFxyXG4gICAgICAgICAgICB9ICkgKTtcclxuXHJcbiAgICAgICAgICAvLyBsaW5lIGRpdmlkaW5nIG51bWVyYXRvciBhbmQgZGVub21pbmF0b3JcclxuICAgICAgICAgIGNvbnN0IGZyYWN0aW9uTGluZUxlbmd0aCA9IE1hdGgubWF4KCBudW1lcmF0b3JOb2RlLndpZHRoLCBkZW5vbWluYXRvck5vZGUud2lkdGggKTtcclxuICAgICAgICAgIGNvbnN0IGZyYWN0aW9uTGluZU5vZGUgPSBuZXcgTGluZSggMCwgMCwgZnJhY3Rpb25MaW5lTGVuZ3RoLCAwLCB7XHJcbiAgICAgICAgICAgIHN0cm9rZTogb3B0aW9ucy5jb2xvcixcclxuICAgICAgICAgICAgY2VudGVyWDogcmhzTm9kZS5jZW50ZXJYLFxyXG4gICAgICAgICAgICB0b3A6IG51bWVyYXRvck5vZGUuYm90dG9tICsgb3B0aW9ucy5mcmFjdGlvbllTcGFjaW5nXHJcbiAgICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgICAgLy8gZnJhY3Rpb24gbGF5b3V0XHJcbiAgICAgICAgICBudW1lcmF0b3JOb2RlLmNlbnRlclggPSBmcmFjdGlvbkxpbmVOb2RlLmNlbnRlclg7XHJcbiAgICAgICAgICBudW1lcmF0b3JOb2RlLmJvdHRvbSA9IGZyYWN0aW9uTGluZU5vZGUudG9wIC0gb3B0aW9ucy5mcmFjdGlvbllTcGFjaW5nO1xyXG4gICAgICAgICAgZGVub21pbmF0b3JOb2RlLmNlbnRlclggPSBmcmFjdGlvbkxpbmVOb2RlLmNlbnRlclg7XHJcbiAgICAgICAgICBkZW5vbWluYXRvck5vZGUudG9wID0gZnJhY3Rpb25MaW5lTm9kZS5ib3R0b20gKyBvcHRpb25zLmZyYWN0aW9uWVNwYWNpbmc7XHJcblxyXG4gICAgICAgICAgLy8gZnJhY3Rpb25cclxuICAgICAgICAgIGNvbnN0IGZyYWN0aW9uTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbIG51bWVyYXRvck5vZGUsIGZyYWN0aW9uTGluZU5vZGUsIGRlbm9taW5hdG9yTm9kZSBdLFxyXG4gICAgICAgICAgICBzY2FsZTogb3B0aW9ucy5mcmFjdGlvblNjYWxlXHJcbiAgICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgICAgLy8gbmV3IHJpZ2h0LWhhbmQgc2lkZVxyXG4gICAgICAgICAgcmhzTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbIGZyYWN0aW9uTm9kZSBdXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICBuZXh0TGVmdCA9IHJoc05vZGUucmlnaHQgKyBvcHRpb25zLm9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgICAgICBuZXh0Q2VudGVyWSA9IHJoc05vZGUuY2VudGVyWTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gb29wcyEgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggYGludmFsaWQgb3BlcmF0b3I9JHtjdXJyZW50T3BlcmF0b3J9LCBlcXVhdGlvbj0ke2VxdWF0aW9uLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJldmlvdXNPcGVyYXRvciA9IGN1cnJlbnRPcGVyYXRvcjtcclxuICAgICAgfVxyXG5cclxuICAgICAgb3B0aW9ucy5jaGlsZHJlbi5wdXNoKCByaHNOb2RlICk7XHJcbiAgICAgIHJoc05vZGUubGVmdCA9IGVxdWFsVG9Ob2RlLnJpZ2h0ICsgb3B0aW9ucy5lcXVhbHNYU3BhY2luZztcclxuICAgICAgcmhzTm9kZS5jZW50ZXJZID0gZXF1YWxUb05vZGUuY2VudGVyWTtcclxuICAgIH1cclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb25CdWlsZGVyLnJlZ2lzdGVyKCAnSGVscGZ1bEVxdWF0aW9uTm9kZScsIEhlbHBmdWxFcXVhdGlvbk5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLHNDQUFzQztBQUN4RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLHNDQUFzQztBQUN2RSxPQUFPQyxlQUFlLE1BQU0sNkJBQTZCO0FBQ3pELE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0MsU0FBUyxNQUFNLG9CQUFvQjtBQUMxQyxPQUFPQyxlQUFlLE1BQU0sMENBQTBDO0FBQ3RFLE9BQU9DLGNBQWMsTUFBTSwrQkFBK0I7QUFDMUQsT0FBT0MsUUFBUSxNQUFNLHNCQUFzQjtBQUMzQyxPQUFPQyxrQkFBa0IsTUFBTSwwQkFBMEI7QUFFekQsZUFBZSxNQUFNQyxtQkFBbUIsU0FBU1QsSUFBSSxDQUFDO0VBRXBEO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VVLFdBQVdBLENBQUVDLFFBQVEsRUFBRUMsT0FBTyxFQUFHO0lBRS9CQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUYsUUFBUSxZQUFZTixlQUFnQixDQUFDO0lBQ3ZE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