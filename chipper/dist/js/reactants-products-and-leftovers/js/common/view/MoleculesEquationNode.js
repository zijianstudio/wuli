// Copyright 2014-2023, University of Colorado Boulder

/**
 * Equation for the 'Molecules' and 'Game' screens. Coefficients are immutable and molecule symbols are displayed.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PlusNode from '../../../../scenery-phet/js/PlusNode.js';
import { Node, RichText, Text } from '../../../../scenery/js/imports.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import RightArrowNode from './RightArrowNode.js';
export default class MoleculesEquationNode extends Node {
  // needed for aligning arrows in Game layout

  constructor(reaction, providedOptions) {
    const options = optionize()({
      // SelfOptions
      fill: 'white',
      font: new PhetFont(28),
      coefficientXSpacing: 8,
      plusXSpacing: 15,
      arrowXSpacing: 15
    }, providedOptions);

    // left-hand side (reactants)
    const reactantsNode = new ExpressionNode(reaction.reactants, options.font, options.fill, options.plusXSpacing, options.coefficientXSpacing);
    const coefficientHeight = new Text('1', {
      font: options.font,
      fill: options.fill
    }).height;

    // right arrow
    const arrowNode = new RightArrowNode({
      fill: options.fill,
      stroke: null,
      scale: 0.65,
      left: reactantsNode.right + options.arrowXSpacing,
      centerY: reactantsNode.top + coefficientHeight / 2
    });

    // right-hand side (products)
    const productsNode = new ExpressionNode(reaction.products, options.font, options.fill, options.plusXSpacing, options.coefficientXSpacing);
    productsNode.left = arrowNode.right + options.arrowXSpacing;
    options.children = [reactantsNode, arrowNode, productsNode];
    super(options);
    this.arrowCenterX = arrowNode.centerX;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}

/**
 * ExpressionNode is one side of a reaction equation.
 */
class ExpressionNode extends Node {
  constructor(terms, font, fill, plusXSpacing, coefficientXSpacing) {
    const textOptions = {
      font: font,
      fill: fill
    };
    const children = [];
    let plusNode;
    const numberOfTerms = terms.length;
    for (let i = 0; i < numberOfTerms; i++) {
      // coefficient
      const coefficientNode = new Text(terms[i].coefficientProperty.value, textOptions);
      coefficientNode.left = plusNode ? plusNode.right + plusXSpacing : 0;
      children.push(coefficientNode);

      // molecule
      const symbolNode = new RichText(StringUtils.wrapLTR(terms[i].symbol), textOptions);
      symbolNode.left = coefficientNode.right + coefficientXSpacing;
      children.push(symbolNode);

      // plus sign between terms
      if (i < numberOfTerms - 1) {
        plusNode = new PlusNode({
          fill: fill
        });
        plusNode.left = symbolNode.right + plusXSpacing;
        plusNode.centerY = coefficientNode.centerY;
        children.push(plusNode);
      }
    }
    super({
      children: children
    });
  }
}
reactantsProductsAndLeftovers.register('MoleculesEquationNode', MoleculesEquationNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJTdHJpbmdVdGlscyIsIlBoZXRGb250IiwiUGx1c05vZGUiLCJOb2RlIiwiUmljaFRleHQiLCJUZXh0IiwicmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnMiLCJSaWdodEFycm93Tm9kZSIsIk1vbGVjdWxlc0VxdWF0aW9uTm9kZSIsImNvbnN0cnVjdG9yIiwicmVhY3Rpb24iLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiZmlsbCIsImZvbnQiLCJjb2VmZmljaWVudFhTcGFjaW5nIiwicGx1c1hTcGFjaW5nIiwiYXJyb3dYU3BhY2luZyIsInJlYWN0YW50c05vZGUiLCJFeHByZXNzaW9uTm9kZSIsInJlYWN0YW50cyIsImNvZWZmaWNpZW50SGVpZ2h0IiwiaGVpZ2h0IiwiYXJyb3dOb2RlIiwic3Ryb2tlIiwic2NhbGUiLCJsZWZ0IiwicmlnaHQiLCJjZW50ZXJZIiwidG9wIiwicHJvZHVjdHNOb2RlIiwicHJvZHVjdHMiLCJjaGlsZHJlbiIsImFycm93Q2VudGVyWCIsImNlbnRlclgiLCJkaXNwb3NlIiwiYXNzZXJ0IiwidGVybXMiLCJ0ZXh0T3B0aW9ucyIsInBsdXNOb2RlIiwibnVtYmVyT2ZUZXJtcyIsImxlbmd0aCIsImkiLCJjb2VmZmljaWVudE5vZGUiLCJjb2VmZmljaWVudFByb3BlcnR5IiwidmFsdWUiLCJwdXNoIiwic3ltYm9sTm9kZSIsIndyYXBMVFIiLCJzeW1ib2wiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1vbGVjdWxlc0VxdWF0aW9uTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBFcXVhdGlvbiBmb3IgdGhlICdNb2xlY3VsZXMnIGFuZCAnR2FtZScgc2NyZWVucy4gQ29lZmZpY2llbnRzIGFyZSBpbW11dGFibGUgYW5kIG1vbGVjdWxlIHN5bWJvbHMgYXJlIGRpc3BsYXllZC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBQbHVzTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGx1c05vZGUuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucywgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucywgUmljaFRleHQsIFRDb2xvciwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCByZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVycyBmcm9tICcuLi8uLi9yZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVycy5qcyc7XHJcbmltcG9ydCBSZWFjdGlvbiBmcm9tICcuLi9tb2RlbC9SZWFjdGlvbi5qcyc7XHJcbmltcG9ydCBTdWJzdGFuY2UgZnJvbSAnLi4vbW9kZWwvU3Vic3RhbmNlLmpzJztcclxuaW1wb3J0IFJpZ2h0QXJyb3dOb2RlIGZyb20gJy4vUmlnaHRBcnJvd05vZGUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBmaWxsPzogVENvbG9yO1xyXG4gIGZvbnQ/OiBQaGV0Rm9udDtcclxuICBjb2VmZmljaWVudFhTcGFjaW5nPzogbnVtYmVyOyAvLyBzcGFjZSBiZXR3ZWVuIGNvZWZmaWNpZW50IGFuZCBub2RlIHRvIGl0cyByaWdodFxyXG4gIHBsdXNYU3BhY2luZz86IG51bWJlcjsgLy8gc3BhY2Ugb24gYm90aCBzaWRlcyBvZiB0aGUgcGx1cyBzaWduc1xyXG4gIGFycm93WFNwYWNpbmc/OiBudW1iZXI7IC8vIHNwYWNlIG9uIGJvdGggc2lkZXMgb2YgYXJyb3dcclxufTtcclxuXHJcbnR5cGUgTW9sZWN1bGVzRXF1YXRpb25Ob2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucyAmIFBpY2tPcHRpb25hbDxOb2RlT3B0aW9ucywgJ3Zpc2libGVQcm9wZXJ0eSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9sZWN1bGVzRXF1YXRpb25Ob2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8vIG5lZWRlZCBmb3IgYWxpZ25pbmcgYXJyb3dzIGluIEdhbWUgbGF5b3V0XHJcbiAgcHVibGljIHJlYWRvbmx5IGFycm93Q2VudGVyWDogbnVtYmVyO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHJlYWN0aW9uOiBSZWFjdGlvbiwgcHJvdmlkZWRPcHRpb25zPzogTW9sZWN1bGVzRXF1YXRpb25Ob2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE1vbGVjdWxlc0VxdWF0aW9uTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyOCApLFxyXG4gICAgICBjb2VmZmljaWVudFhTcGFjaW5nOiA4LFxyXG4gICAgICBwbHVzWFNwYWNpbmc6IDE1LFxyXG4gICAgICBhcnJvd1hTcGFjaW5nOiAxNVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gbGVmdC1oYW5kIHNpZGUgKHJlYWN0YW50cylcclxuICAgIGNvbnN0IHJlYWN0YW50c05vZGUgPSBuZXcgRXhwcmVzc2lvbk5vZGUoIHJlYWN0aW9uLnJlYWN0YW50cywgb3B0aW9ucy5mb250LCBvcHRpb25zLmZpbGwsIG9wdGlvbnMucGx1c1hTcGFjaW5nLCBvcHRpb25zLmNvZWZmaWNpZW50WFNwYWNpbmcgKTtcclxuXHJcbiAgICBjb25zdCBjb2VmZmljaWVudEhlaWdodCA9IG5ldyBUZXh0KCAnMScsIHsgZm9udDogb3B0aW9ucy5mb250LCBmaWxsOiBvcHRpb25zLmZpbGwgfSApLmhlaWdodDtcclxuXHJcbiAgICAvLyByaWdodCBhcnJvd1xyXG4gICAgY29uc3QgYXJyb3dOb2RlID0gbmV3IFJpZ2h0QXJyb3dOb2RlKCB7XHJcbiAgICAgIGZpbGw6IG9wdGlvbnMuZmlsbCxcclxuICAgICAgc3Ryb2tlOiBudWxsLFxyXG4gICAgICBzY2FsZTogMC42NSxcclxuICAgICAgbGVmdDogcmVhY3RhbnRzTm9kZS5yaWdodCArIG9wdGlvbnMuYXJyb3dYU3BhY2luZyxcclxuICAgICAgY2VudGVyWTogcmVhY3RhbnRzTm9kZS50b3AgKyAoIGNvZWZmaWNpZW50SGVpZ2h0IC8gMiApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcmlnaHQtaGFuZCBzaWRlIChwcm9kdWN0cylcclxuICAgIGNvbnN0IHByb2R1Y3RzTm9kZSA9IG5ldyBFeHByZXNzaW9uTm9kZSggcmVhY3Rpb24ucHJvZHVjdHMsIG9wdGlvbnMuZm9udCwgb3B0aW9ucy5maWxsLCBvcHRpb25zLnBsdXNYU3BhY2luZywgb3B0aW9ucy5jb2VmZmljaWVudFhTcGFjaW5nICk7XHJcbiAgICBwcm9kdWN0c05vZGUubGVmdCA9IGFycm93Tm9kZS5yaWdodCArIG9wdGlvbnMuYXJyb3dYU3BhY2luZztcclxuXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyByZWFjdGFudHNOb2RlLCBhcnJvd05vZGUsIHByb2R1Y3RzTm9kZSBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5hcnJvd0NlbnRlclggPSBhcnJvd05vZGUuY2VudGVyWDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRXhwcmVzc2lvbk5vZGUgaXMgb25lIHNpZGUgb2YgYSByZWFjdGlvbiBlcXVhdGlvbi5cclxuICovXHJcbmNsYXNzIEV4cHJlc3Npb25Ob2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGVybXM6IFN1YnN0YW5jZVtdLCBmb250OiBQaGV0Rm9udCwgZmlsbDogVENvbG9yLCBwbHVzWFNwYWNpbmc6IG51bWJlciwgY29lZmZpY2llbnRYU3BhY2luZzogbnVtYmVyICkge1xyXG5cclxuICAgIGNvbnN0IHRleHRPcHRpb25zID0ge1xyXG4gICAgICBmb250OiBmb250LFxyXG4gICAgICBmaWxsOiBmaWxsXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGNoaWxkcmVuOiBOb2RlW10gPSBbXTtcclxuXHJcbiAgICBsZXQgcGx1c05vZGU7XHJcbiAgICBjb25zdCBudW1iZXJPZlRlcm1zID0gdGVybXMubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZUZXJtczsgaSsrICkge1xyXG5cclxuICAgICAgLy8gY29lZmZpY2llbnRcclxuICAgICAgY29uc3QgY29lZmZpY2llbnROb2RlID0gbmV3IFRleHQoIHRlcm1zWyBpIF0uY29lZmZpY2llbnRQcm9wZXJ0eS52YWx1ZSwgdGV4dE9wdGlvbnMgKTtcclxuICAgICAgY29lZmZpY2llbnROb2RlLmxlZnQgPSBwbHVzTm9kZSA/ICggcGx1c05vZGUucmlnaHQgKyBwbHVzWFNwYWNpbmcgKSA6IDA7XHJcbiAgICAgIGNoaWxkcmVuLnB1c2goIGNvZWZmaWNpZW50Tm9kZSApO1xyXG5cclxuICAgICAgLy8gbW9sZWN1bGVcclxuICAgICAgY29uc3Qgc3ltYm9sTm9kZSA9IG5ldyBSaWNoVGV4dCggU3RyaW5nVXRpbHMud3JhcExUUiggdGVybXNbIGkgXS5zeW1ib2wgKSwgdGV4dE9wdGlvbnMgKTtcclxuICAgICAgc3ltYm9sTm9kZS5sZWZ0ID0gY29lZmZpY2llbnROb2RlLnJpZ2h0ICsgY29lZmZpY2llbnRYU3BhY2luZztcclxuICAgICAgY2hpbGRyZW4ucHVzaCggc3ltYm9sTm9kZSApO1xyXG5cclxuICAgICAgLy8gcGx1cyBzaWduIGJldHdlZW4gdGVybXNcclxuICAgICAgaWYgKCBpIDwgbnVtYmVyT2ZUZXJtcyAtIDEgKSB7XHJcbiAgICAgICAgcGx1c05vZGUgPSBuZXcgUGx1c05vZGUoIHsgZmlsbDogZmlsbCB9ICk7XHJcbiAgICAgICAgcGx1c05vZGUubGVmdCA9IHN5bWJvbE5vZGUucmlnaHQgKyBwbHVzWFNwYWNpbmc7XHJcbiAgICAgICAgcGx1c05vZGUuY2VudGVyWSA9IGNvZWZmaWNpZW50Tm9kZS5jZW50ZXJZO1xyXG4gICAgICAgIGNoaWxkcmVuLnB1c2goIHBsdXNOb2RlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBjaGlsZHJlbjogY2hpbGRyZW5cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbnJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzLnJlZ2lzdGVyKCAnTW9sZWN1bGVzRXF1YXRpb25Ob2RlJywgTW9sZWN1bGVzRXF1YXRpb25Ob2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSx1Q0FBdUM7QUFFN0QsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFP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