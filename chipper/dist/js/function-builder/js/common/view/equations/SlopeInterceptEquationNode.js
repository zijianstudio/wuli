// Copyright 2016-2023, University of Colorado Boulder

/**
 * Equation in slope-intercept form, y = mx + b
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../../phet-core/js/merge.js';
import { Node, Text } from '../../../../../scenery/js/imports.js';
import functionBuilder from '../../../functionBuilder.js';
import FBConstants from '../../FBConstants.js';
import FBSymbols from '../../FBSymbols.js';
import RationalNumber from '../../model/RationalNumber.js';
import CardNode from '../cards/CardNode.js';
import RationalNumberNode from '../RationalNumberNode.js';
export default class SlopeInterceptEquationNode extends Node {
  /**
   * @param {RationalNumber} slope
   * @param {RationalNumber} intercept
   * @param {Object} [options] - see FBConstants.EQUATION_OPTIONS
   */
  constructor(slope, intercept, options) {
    assert && assert(slope instanceof RationalNumber);
    assert && assert(intercept instanceof RationalNumber);
    options = merge({}, FBConstants.EQUATION_OPTIONS, options);
    assert && assert(!options.children, 'decoration not supported');
    options.children = [];

    // y
    let yNode = new Text(options.ySymbol, {
      fill: options.yColor,
      font: options.xyFont,
      maxWidth: options.xyMaxWidth
    });
    if (options.xyAsCards) {
      yNode = CardNode.createEquationXYNode(yNode);
    }
    yNode.y = options.xyYOffset;

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
    if (slope.valueOf() === 0 && intercept.valueOf() === 0) {
      // y = 0
      const zeroNode = new Text('0', {
        fill: options.yColor,
        font: options.wholeNumberFont,
        left: equalToNode.right + options.equalsXSpacing,
        centerY: yNode.centerY
      });
      options.children.push(zeroNode);
    } else {
      // y = mx + b

      // horizontal layout positions, adjusted as the equation is built
      let xLeft = 0;
      let operatorLeft = 0;
      let interceptLeft = 0;

      // slope
      if (slope.valueOf() !== 0) {
        if (slope.valueOf() === 1) {
          // omit slope if value is 1, so we have 'x' instead of '1x'
          xLeft = equalToNode.right + options.equalsXSpacing;
        } else if (slope.valueOf() === -1) {
          // omit 1 if value is -1, so we have '-x' instead of '-1x'
          const signNode = new Text(FBSymbols.MINUS, {
            fill: options.color,
            font: options.signFont,
            left: equalToNode.right + options.equalsXSpacing,
            centerY: equalToNode.centerY
          });
          options.children.push(signNode);
          xLeft = signNode.right + options.signXSpacing;
        } else {
          // whole number or fractional slope
          const slopeNode = new RationalNumberNode(slope, {
            fill: options.color,
            mixedNumber: false,
            // display as an improper fraction
            fractionYSpacing: options.fractionYSpacing,
            signXSpacing: options.signXSpacing,
            signFont: options.signFont,
            wholeNumberFont: options.wholeNumberFont,
            fractionFont: options.fractionFont,
            left: equalToNode.right + options.equalsXSpacing,
            centerY: equalToNode.centerY + options.slopeYOffset
          });
          options.children.push(slopeNode);
          if (slope.isInteger()) {
            xLeft = slopeNode.right + options.integerSlopeXSpacing;
          } else {
            xLeft = slopeNode.right + options.fractionSlopeXSpacing;
          }
        }
      }

      // x
      if (slope.valueOf() !== 0) {
        let xNode = new Text(options.xSymbol, {
          fill: options.xColor,
          font: options.xyFont,
          maxWidth: options.xyMaxWidth
        });
        if (options.xyAsCards) {
          xNode = CardNode.createEquationXYNode(xNode);
        }
        xNode.left = xLeft;
        xNode.centerY = equalToNode.centerY + options.xyYOffset;
        options.children.push(xNode);
        operatorLeft = xNode.right + options.operatorXSpacing;
      }

      // operator (+, -)
      if (intercept.valueOf() !== 0 && slope.valueOf() !== 0) {
        const operator = intercept.valueOf() > 0 ? FBSymbols.PLUS : FBSymbols.MINUS;
        const operatorNode = new Text(operator, {
          fill: options.color,
          font: options.symbolFont,
          left: operatorLeft,
          centerY: equalToNode.centerY + options.operatorYOffset
        });
        options.children.push(operatorNode);
        interceptLeft = operatorNode.right + options.operatorXSpacing;
      } else {
        // no operator, intercept follows equals sign
        interceptLeft = equalToNode.right + options.equalsXSpacing;
      }

      // intercept
      if (intercept.valueOf() !== 0) {
        const interceptNode = new RationalNumberNode(slope.valueOf() === 0 ? intercept : intercept.abs(), {
          fill: options.color,
          mixedNumber: false,
          // display as an improper fraction
          fractionYSpacing: options.fractionYSpacing,
          signXSpacing: options.signXSpacing,
          signFont: options.signFont,
          wholeNumberFont: options.wholeNumberFont,
          fractionFont: options.fractionFont,
          left: interceptLeft,
          centerY: equalToNode.centerY + options.interceptYOffset
        });
        options.children.push(interceptNode);
      }
    }
    super(options);
  }
}
functionBuilder.register('SlopeInterceptEquationNode', SlopeInterceptEquationNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIk5vZGUiLCJUZXh0IiwiZnVuY3Rpb25CdWlsZGVyIiwiRkJDb25zdGFudHMiLCJGQlN5bWJvbHMiLCJSYXRpb25hbE51bWJlciIsIkNhcmROb2RlIiwiUmF0aW9uYWxOdW1iZXJOb2RlIiwiU2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGUiLCJjb25zdHJ1Y3RvciIsInNsb3BlIiwiaW50ZXJjZXB0Iiwib3B0aW9ucyIsImFzc2VydCIsIkVRVUFUSU9OX09QVElPTlMiLCJjaGlsZHJlbiIsInlOb2RlIiwieVN5bWJvbCIsImZpbGwiLCJ5Q29sb3IiLCJmb250IiwieHlGb250IiwibWF4V2lkdGgiLCJ4eU1heFdpZHRoIiwieHlBc0NhcmRzIiwiY3JlYXRlRXF1YXRpb25YWU5vZGUiLCJ5IiwieHlZT2Zmc2V0IiwiZXF1YWxUb05vZGUiLCJFUVVBTF9UTyIsImNvbG9yIiwic3ltYm9sRm9udCIsImxlZnQiLCJyaWdodCIsImVxdWFsc1hTcGFjaW5nIiwiY2VudGVyWSIsInNob3dMZWZ0SGFuZFNpZGUiLCJwdXNoIiwidmFsdWVPZiIsInplcm9Ob2RlIiwid2hvbGVOdW1iZXJGb250IiwieExlZnQiLCJvcGVyYXRvckxlZnQiLCJpbnRlcmNlcHRMZWZ0Iiwic2lnbk5vZGUiLCJNSU5VUyIsInNpZ25Gb250Iiwic2lnblhTcGFjaW5nIiwic2xvcGVOb2RlIiwibWl4ZWROdW1iZXIiLCJmcmFjdGlvbllTcGFjaW5nIiwiZnJhY3Rpb25Gb250Iiwic2xvcGVZT2Zmc2V0IiwiaXNJbnRlZ2VyIiwiaW50ZWdlclNsb3BlWFNwYWNpbmciLCJmcmFjdGlvblNsb3BlWFNwYWNpbmciLCJ4Tm9kZSIsInhTeW1ib2wiLCJ4Q29sb3IiLCJvcGVyYXRvclhTcGFjaW5nIiwib3BlcmF0b3IiLCJQTFVTIiwib3BlcmF0b3JOb2RlIiwib3BlcmF0b3JZT2Zmc2V0IiwiaW50ZXJjZXB0Tm9kZSIsImFicyIsImludGVyY2VwdFlPZmZzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNsb3BlSW50ZXJjZXB0RXF1YXRpb25Ob2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEVxdWF0aW9uIGluIHNsb3BlLWludGVyY2VwdCBmb3JtLCB5ID0gbXggKyBiXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZnVuY3Rpb25CdWlsZGVyIGZyb20gJy4uLy4uLy4uL2Z1bmN0aW9uQnVpbGRlci5qcyc7XHJcbmltcG9ydCBGQkNvbnN0YW50cyBmcm9tICcuLi8uLi9GQkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBGQlN5bWJvbHMgZnJvbSAnLi4vLi4vRkJTeW1ib2xzLmpzJztcclxuaW1wb3J0IFJhdGlvbmFsTnVtYmVyIGZyb20gJy4uLy4uL21vZGVsL1JhdGlvbmFsTnVtYmVyLmpzJztcclxuaW1wb3J0IENhcmROb2RlIGZyb20gJy4uL2NhcmRzL0NhcmROb2RlLmpzJztcclxuaW1wb3J0IFJhdGlvbmFsTnVtYmVyTm9kZSBmcm9tICcuLi9SYXRpb25hbE51bWJlck5vZGUuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtSYXRpb25hbE51bWJlcn0gc2xvcGVcclxuICAgKiBAcGFyYW0ge1JhdGlvbmFsTnVtYmVyfSBpbnRlcmNlcHRcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gc2VlIEZCQ29uc3RhbnRzLkVRVUFUSU9OX09QVElPTlNcclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2xvcGUsIGludGVyY2VwdCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzbG9wZSBpbnN0YW5jZW9mIFJhdGlvbmFsTnVtYmVyICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbnRlcmNlcHQgaW5zdGFuY2VvZiBSYXRpb25hbE51bWJlciApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge30sIEZCQ29uc3RhbnRzLkVRVUFUSU9OX09QVElPTlMsIG9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5jaGlsZHJlbiwgJ2RlY29yYXRpb24gbm90IHN1cHBvcnRlZCcgKTtcclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbXTtcclxuXHJcbiAgICAvLyB5XHJcbiAgICBsZXQgeU5vZGUgPSBuZXcgVGV4dCggb3B0aW9ucy55U3ltYm9sLCB7XHJcbiAgICAgIGZpbGw6IG9wdGlvbnMueUNvbG9yLFxyXG4gICAgICBmb250OiBvcHRpb25zLnh5Rm9udCxcclxuICAgICAgbWF4V2lkdGg6IG9wdGlvbnMueHlNYXhXaWR0aFxyXG4gICAgfSApO1xyXG4gICAgaWYgKCBvcHRpb25zLnh5QXNDYXJkcyApIHtcclxuICAgICAgeU5vZGUgPSBDYXJkTm9kZS5jcmVhdGVFcXVhdGlvblhZTm9kZSggeU5vZGUgKTtcclxuICAgIH1cclxuICAgIHlOb2RlLnkgPSBvcHRpb25zLnh5WU9mZnNldDtcclxuXHJcbiAgICAvLyA9XHJcbiAgICBjb25zdCBlcXVhbFRvTm9kZSA9IG5ldyBUZXh0KCBGQlN5bWJvbHMuRVFVQUxfVE8sIHtcclxuICAgICAgZmlsbDogb3B0aW9ucy5jb2xvcixcclxuICAgICAgZm9udDogb3B0aW9ucy5zeW1ib2xGb250LFxyXG4gICAgICBsZWZ0OiB5Tm9kZS5yaWdodCArIG9wdGlvbnMuZXF1YWxzWFNwYWNpbmcsXHJcbiAgICAgIGNlbnRlclk6IHlOb2RlLmNlbnRlcllcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGxlZnQtaGFuZCBzaWRlIG5vZGVzIHRvIHNpbXBsaWZ5IGxheW91dCwgYnV0IGFkZCB0aGVtIG9ubHkgaWYgcmVxdWVzdGVkXHJcbiAgICBpZiAoIG9wdGlvbnMuc2hvd0xlZnRIYW5kU2lkZSApIHtcclxuICAgICAgb3B0aW9ucy5jaGlsZHJlbi5wdXNoKCB5Tm9kZSwgZXF1YWxUb05vZGUgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHNsb3BlLnZhbHVlT2YoKSA9PT0gMCAmJiBpbnRlcmNlcHQudmFsdWVPZigpID09PSAwICkge1xyXG5cclxuICAgICAgLy8geSA9IDBcclxuICAgICAgY29uc3QgemVyb05vZGUgPSBuZXcgVGV4dCggJzAnLCB7XHJcbiAgICAgICAgZmlsbDogb3B0aW9ucy55Q29sb3IsXHJcbiAgICAgICAgZm9udDogb3B0aW9ucy53aG9sZU51bWJlckZvbnQsXHJcbiAgICAgICAgbGVmdDogZXF1YWxUb05vZGUucmlnaHQgKyBvcHRpb25zLmVxdWFsc1hTcGFjaW5nLFxyXG4gICAgICAgIGNlbnRlclk6IHlOb2RlLmNlbnRlcllcclxuICAgICAgfSApO1xyXG4gICAgICBvcHRpb25zLmNoaWxkcmVuLnB1c2goIHplcm9Ob2RlICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIHkgPSBteCArIGJcclxuXHJcbiAgICAgIC8vIGhvcml6b250YWwgbGF5b3V0IHBvc2l0aW9ucywgYWRqdXN0ZWQgYXMgdGhlIGVxdWF0aW9uIGlzIGJ1aWx0XHJcbiAgICAgIGxldCB4TGVmdCA9IDA7XHJcbiAgICAgIGxldCBvcGVyYXRvckxlZnQgPSAwO1xyXG4gICAgICBsZXQgaW50ZXJjZXB0TGVmdCA9IDA7XHJcblxyXG4gICAgICAvLyBzbG9wZVxyXG4gICAgICBpZiAoIHNsb3BlLnZhbHVlT2YoKSAhPT0gMCApIHtcclxuXHJcbiAgICAgICAgaWYgKCBzbG9wZS52YWx1ZU9mKCkgPT09IDEgKSB7XHJcblxyXG4gICAgICAgICAgLy8gb21pdCBzbG9wZSBpZiB2YWx1ZSBpcyAxLCBzbyB3ZSBoYXZlICd4JyBpbnN0ZWFkIG9mICcxeCdcclxuICAgICAgICAgIHhMZWZ0ID0gZXF1YWxUb05vZGUucmlnaHQgKyBvcHRpb25zLmVxdWFsc1hTcGFjaW5nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggc2xvcGUudmFsdWVPZigpID09PSAtMSApIHtcclxuXHJcbiAgICAgICAgICAvLyBvbWl0IDEgaWYgdmFsdWUgaXMgLTEsIHNvIHdlIGhhdmUgJy14JyBpbnN0ZWFkIG9mICctMXgnXHJcbiAgICAgICAgICBjb25zdCBzaWduTm9kZSA9IG5ldyBUZXh0KCBGQlN5bWJvbHMuTUlOVVMsIHtcclxuICAgICAgICAgICAgZmlsbDogb3B0aW9ucy5jb2xvcixcclxuICAgICAgICAgICAgZm9udDogb3B0aW9ucy5zaWduRm9udCxcclxuICAgICAgICAgICAgbGVmdDogZXF1YWxUb05vZGUucmlnaHQgKyBvcHRpb25zLmVxdWFsc1hTcGFjaW5nLFxyXG4gICAgICAgICAgICBjZW50ZXJZOiBlcXVhbFRvTm9kZS5jZW50ZXJZXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICBvcHRpb25zLmNoaWxkcmVuLnB1c2goIHNpZ25Ob2RlICk7XHJcblxyXG4gICAgICAgICAgeExlZnQgPSBzaWduTm9kZS5yaWdodCArIG9wdGlvbnMuc2lnblhTcGFjaW5nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyB3aG9sZSBudW1iZXIgb3IgZnJhY3Rpb25hbCBzbG9wZVxyXG4gICAgICAgICAgY29uc3Qgc2xvcGVOb2RlID0gbmV3IFJhdGlvbmFsTnVtYmVyTm9kZSggc2xvcGUsIHtcclxuICAgICAgICAgICAgZmlsbDogb3B0aW9ucy5jb2xvcixcclxuICAgICAgICAgICAgbWl4ZWROdW1iZXI6IGZhbHNlLCAvLyBkaXNwbGF5IGFzIGFuIGltcHJvcGVyIGZyYWN0aW9uXHJcbiAgICAgICAgICAgIGZyYWN0aW9uWVNwYWNpbmc6IG9wdGlvbnMuZnJhY3Rpb25ZU3BhY2luZyxcclxuICAgICAgICAgICAgc2lnblhTcGFjaW5nOiBvcHRpb25zLnNpZ25YU3BhY2luZyxcclxuICAgICAgICAgICAgc2lnbkZvbnQ6IG9wdGlvbnMuc2lnbkZvbnQsXHJcbiAgICAgICAgICAgIHdob2xlTnVtYmVyRm9udDogb3B0aW9ucy53aG9sZU51bWJlckZvbnQsXHJcbiAgICAgICAgICAgIGZyYWN0aW9uRm9udDogb3B0aW9ucy5mcmFjdGlvbkZvbnQsXHJcbiAgICAgICAgICAgIGxlZnQ6IGVxdWFsVG9Ob2RlLnJpZ2h0ICsgb3B0aW9ucy5lcXVhbHNYU3BhY2luZyxcclxuICAgICAgICAgICAgY2VudGVyWTogZXF1YWxUb05vZGUuY2VudGVyWSArIG9wdGlvbnMuc2xvcGVZT2Zmc2V0XHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICBvcHRpb25zLmNoaWxkcmVuLnB1c2goIHNsb3BlTm9kZSApO1xyXG5cclxuICAgICAgICAgIGlmICggc2xvcGUuaXNJbnRlZ2VyKCkgKSB7XHJcbiAgICAgICAgICAgIHhMZWZ0ID0gc2xvcGVOb2RlLnJpZ2h0ICsgb3B0aW9ucy5pbnRlZ2VyU2xvcGVYU3BhY2luZztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB4TGVmdCA9IHNsb3BlTm9kZS5yaWdodCArIG9wdGlvbnMuZnJhY3Rpb25TbG9wZVhTcGFjaW5nO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8geFxyXG4gICAgICBpZiAoIHNsb3BlLnZhbHVlT2YoKSAhPT0gMCApIHtcclxuXHJcbiAgICAgICAgbGV0IHhOb2RlID0gbmV3IFRleHQoIG9wdGlvbnMueFN5bWJvbCwge1xyXG4gICAgICAgICAgZmlsbDogb3B0aW9ucy54Q29sb3IsXHJcbiAgICAgICAgICBmb250OiBvcHRpb25zLnh5Rm9udCxcclxuICAgICAgICAgIG1heFdpZHRoOiBvcHRpb25zLnh5TWF4V2lkdGhcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgaWYgKCBvcHRpb25zLnh5QXNDYXJkcyApIHtcclxuICAgICAgICAgIHhOb2RlID0gQ2FyZE5vZGUuY3JlYXRlRXF1YXRpb25YWU5vZGUoIHhOb2RlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHhOb2RlLmxlZnQgPSB4TGVmdDtcclxuICAgICAgICB4Tm9kZS5jZW50ZXJZID0gZXF1YWxUb05vZGUuY2VudGVyWSArIG9wdGlvbnMueHlZT2Zmc2V0O1xyXG5cclxuICAgICAgICBvcHRpb25zLmNoaWxkcmVuLnB1c2goIHhOb2RlICk7XHJcbiAgICAgICAgb3BlcmF0b3JMZWZ0ID0geE5vZGUucmlnaHQgKyBvcHRpb25zLm9wZXJhdG9yWFNwYWNpbmc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG9wZXJhdG9yICgrLCAtKVxyXG4gICAgICBpZiAoICggaW50ZXJjZXB0LnZhbHVlT2YoKSAhPT0gMCApICYmICggc2xvcGUudmFsdWVPZigpICE9PSAwICkgKSB7XHJcbiAgICAgICAgY29uc3Qgb3BlcmF0b3IgPSAoIGludGVyY2VwdC52YWx1ZU9mKCkgPiAwICkgPyBGQlN5bWJvbHMuUExVUyA6IEZCU3ltYm9scy5NSU5VUztcclxuICAgICAgICBjb25zdCBvcGVyYXRvck5vZGUgPSBuZXcgVGV4dCggb3BlcmF0b3IsIHtcclxuICAgICAgICAgIGZpbGw6IG9wdGlvbnMuY29sb3IsXHJcbiAgICAgICAgICBmb250OiBvcHRpb25zLnN5bWJvbEZvbnQsXHJcbiAgICAgICAgICBsZWZ0OiBvcGVyYXRvckxlZnQsXHJcbiAgICAgICAgICBjZW50ZXJZOiBlcXVhbFRvTm9kZS5jZW50ZXJZICsgb3B0aW9ucy5vcGVyYXRvcllPZmZzZXRcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgb3B0aW9ucy5jaGlsZHJlbi5wdXNoKCBvcGVyYXRvck5vZGUgKTtcclxuICAgICAgICBpbnRlcmNlcHRMZWZ0ID0gb3BlcmF0b3JOb2RlLnJpZ2h0ICsgb3B0aW9ucy5vcGVyYXRvclhTcGFjaW5nO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBubyBvcGVyYXRvciwgaW50ZXJjZXB0IGZvbGxvd3MgZXF1YWxzIHNpZ25cclxuICAgICAgICBpbnRlcmNlcHRMZWZ0ID0gZXF1YWxUb05vZGUucmlnaHQgKyBvcHRpb25zLmVxdWFsc1hTcGFjaW5nO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBpbnRlcmNlcHRcclxuICAgICAgaWYgKCBpbnRlcmNlcHQudmFsdWVPZigpICE9PSAwICkge1xyXG4gICAgICAgIGNvbnN0IGludGVyY2VwdE5vZGUgPSBuZXcgUmF0aW9uYWxOdW1iZXJOb2RlKCAoIHNsb3BlLnZhbHVlT2YoKSA9PT0gMCApID8gaW50ZXJjZXB0IDogaW50ZXJjZXB0LmFicygpLCB7XHJcbiAgICAgICAgICBmaWxsOiBvcHRpb25zLmNvbG9yLFxyXG4gICAgICAgICAgbWl4ZWROdW1iZXI6IGZhbHNlLCAvLyBkaXNwbGF5IGFzIGFuIGltcHJvcGVyIGZyYWN0aW9uXHJcbiAgICAgICAgICBmcmFjdGlvbllTcGFjaW5nOiBvcHRpb25zLmZyYWN0aW9uWVNwYWNpbmcsXHJcbiAgICAgICAgICBzaWduWFNwYWNpbmc6IG9wdGlvbnMuc2lnblhTcGFjaW5nLFxyXG4gICAgICAgICAgc2lnbkZvbnQ6IG9wdGlvbnMuc2lnbkZvbnQsXHJcbiAgICAgICAgICB3aG9sZU51bWJlckZvbnQ6IG9wdGlvbnMud2hvbGVOdW1iZXJGb250LFxyXG4gICAgICAgICAgZnJhY3Rpb25Gb250OiBvcHRpb25zLmZyYWN0aW9uRm9udCxcclxuICAgICAgICAgIGxlZnQ6IGludGVyY2VwdExlZnQsXHJcbiAgICAgICAgICBjZW50ZXJZOiBlcXVhbFRvTm9kZS5jZW50ZXJZICsgb3B0aW9ucy5pbnRlcmNlcHRZT2Zmc2V0XHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIG9wdGlvbnMuY2hpbGRyZW4ucHVzaCggaW50ZXJjZXB0Tm9kZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uQnVpbGRlci5yZWdpc3RlciggJ1Nsb3BlSW50ZXJjZXB0RXF1YXRpb25Ob2RlJywgU2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLHNDQUFzQztBQUN4RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxzQ0FBc0M7QUFDakUsT0FBT0MsZUFBZSxNQUFNLDZCQUE2QjtBQUN6RCxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLFNBQVMsTUFBTSxvQkFBb0I7QUFDMUMsT0FBT0MsY0FBYyxNQUFNLCtCQUErQjtBQUMxRCxPQUFPQyxRQUFRLE1BQU0sc0JBQXNCO0FBQzNDLE9BQU9DLGtCQUFrQixNQUFNLDBCQUEwQjtBQUV6RCxlQUFlLE1BQU1DLDBCQUEwQixTQUFTUixJQUFJLENBQUM7RUFFM0Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFUyxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxFQUFHO0lBRXZDQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUgsS0FBSyxZQUFZTCxjQUFlLENBQUM7SUFDbkRRLE1BQU0sSUFBSUEsTUFBTSxDQUFFRixTQUFTLFlBQVlOLGNBQWUsQ0FBQztJQUV2RE8sT0FBTyxHQUFHYixLQUFLLENBQUUsQ0FBQyxDQUFDLEVBQUVJLFdBQVcsQ0FBQ1csZ0JBQWdCLEVBQUVGLE9BQVEsQ0FBQztJQUU1REMsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQ0QsT0FBTyxDQUFDRyxRQUFRLEVBQUUsMEJBQTJCLENBQUM7SUFDakVI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