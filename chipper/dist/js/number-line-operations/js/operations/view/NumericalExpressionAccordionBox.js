// Copyright 2020-2023, University of Colorado Boulder

/**
 * NumericalExpressionAccordionBox is an accordion box that contains a mathematical description of the operations on a
 * number line.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import NLCConstants from '../../../../number-line-common/js/common/NLCConstants.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import RectangularMomentaryButton from '../../../../sun/js/buttons/RectangularMomentaryButton.js';
import Operation from '../../common/model/Operation.js';
import NLOConstants from '../../common/NLOConstants.js';
import numberLineOperations from '../../numberLineOperations.js';
import NumberLineOperationsStrings from '../../NumberLineOperationsStrings.js';

// constants
const CONTENT_DIMENSIONS = new Dimension2(280, 70); // size based on design doc
const MOMENTARY_BUTTON_BASE_COLOR = new Color(0xfdfd96);
const MOMENTARY_BUTTON_TOUCH_AREA_DILATION = 8;
class NumericalExpressionAccordionBox extends AccordionBox {
  /**
   * @param {OperationTrackingNumberLine} numberLine
   * @param {Object} [options]
   * @public
   */
  constructor(numberLine, options) {
    // The horizontal margin for the content needs to be bigger if the title is showing in order to make sure the
    // overall width of the accordion box is the same whether or not the title is showing.  The amount was empirically
    // determined.  See https://github.com/phetsims/number-line-operations/issues/44 for some history if needed.
    const contentXMargin = options.showTitleWhenExpanded ? 22 : 15;
    options = merge({
      contentXMargin: contentXMargin,
      titleNode: new Text(NLOConstants.NET_WORTH_WITH_CURRENCY_STRING, {
        font: new PhetFont(18),
        maxWidth: CONTENT_DIMENSIONS.width * 0.9
      }),
      // options that are passed through to the numerical expression
      numericalExpressionOptions: {
        top: 0,
        maxWidth: CONTENT_DIMENSIONS.width
      }
    }, NLCConstants.ACCORDION_BOX_COMMON_OPTIONS, options);
    assert && assert(numberLine.operations.length === 2, 'this indicator is designed to work with exactly two operations');

    // Create a transparent background that will serve as the root node.  Everything should be made to fit within this.
    const contentRoot = new Rectangle(0, 0, CONTENT_DIMENSIONS.width, CONTENT_DIMENSIONS.height, 5, 5, {
      fill: Color.TRANSPARENT
    });

    // Create a DerivedProperty that is true when there are negative values in the expression, which means that
    // simplification is possible.  This will be used as the enabled Property for the simplify button.
    const simplificationPossibleProperty = new DerivedProperty([numberLine.operations[0].isActiveProperty, numberLine.operations[0].amountProperty, numberLine.operations[1].isActiveProperty, numberLine.operations[1].amountProperty], (firstOperationIsActive, firstOperationValue, secondOperationIsActive, secondOperationValue) => {
      return firstOperationIsActive && firstOperationValue < 0 || secondOperationIsActive && secondOperationValue < 0;
    });

    // simplify button
    const simplifyProperty = new BooleanProperty(false);
    const simplifyButton = new RectangularMomentaryButton(simplifyProperty, false, true, {
      content: new Text(NumberLineOperationsStrings.simplify, {
        font: new PhetFont(16),
        maxWidth: 200
      }),
      baseColor: MOMENTARY_BUTTON_BASE_COLOR,
      enabledProperty: simplificationPossibleProperty,
      xMargin: 5,
      yMargin: 3.5,
      touchAreaXDilation: MOMENTARY_BUTTON_TOUCH_AREA_DILATION,
      touchAreaYDilation: MOMENTARY_BUTTON_TOUCH_AREA_DILATION
    });

    // Create a DerivedProperty that is true when there are one or more active operations.  This will be used as the
    // enabled Property for the evaluate button.
    const evaluationPossibleProperty = new DerivedProperty([numberLine.operations[0].isActiveProperty, numberLine.operations[1].isActiveProperty], (firstOperationIsActive, secondOperationIsActive) => {
      return firstOperationIsActive || secondOperationIsActive;
    });

    // evaluate button
    const evaluateProperty = new BooleanProperty(false);
    const evaluateButton = new RectangularMomentaryButton(evaluateProperty, false, true, {
      content: new Text(MathSymbols.EQUAL_TO, {
        font: new PhetFont(20)
      }),
      baseColor: MOMENTARY_BUTTON_BASE_COLOR,
      enabledProperty: evaluationPossibleProperty,
      xMargin: 5,
      yMargin: 1,
      touchAreaXDilation: MOMENTARY_BUTTON_TOUCH_AREA_DILATION,
      touchAreaYDilation: MOMENTARY_BUTTON_TOUCH_AREA_DILATION
    });

    // Position the buttons so that they are collectively centered under the equation.
    simplifyButton.x = 0;
    evaluateButton.left = simplifyButton.width + 20;
    const buttonsNode = new Node({
      children: [simplifyButton, evaluateButton],
      centerX: CONTENT_DIMENSIONS.width / 2,
      bottom: CONTENT_DIMENSIONS.height
    });
    contentRoot.addChild(buttonsNode);

    // numerical expression
    const numericalExpression = new NumericalExpression(numberLine, simplifyProperty, evaluateProperty, options.numericalExpressionOptions);
    contentRoot.addChild(numericalExpression);

    // Keep the numerical expression centered.
    const centerNumericalExpression = () => {
      numericalExpression.centerX = CONTENT_DIMENSIONS.width / 2;
      numericalExpression.top = 0;
    };
    centerNumericalExpression();
    numericalExpression.updatedEmitter.addListener(centerNumericalExpression);
    super(contentRoot, options);

    // @private - make this available so it can be reset
    this.simplifyProperty = simplifyProperty;
  }

  /**
   * Restore initial state.
   * @public
   */
  reset() {
    this.simplifyProperty.reset();
    this.expandedProperty.reset();
  }
}

/**
 * NumericalExpression is a Scenery Text Node that represent a numerical expression that describes the operations on the
 * number line, for example "1 + 7 - 2".
 */
class NumericalExpression extends Text {
  /**
   * @param {OperationTrackingNumberLine} numberLine
   * @param {BooleanProperty} simplifyProperty
   * @param {BooleanProperty} evaluateProperty
   * @param {Object} [options]
   * @public
   */
  constructor(numberLine, simplifyProperty, evaluateProperty, options) {
    options = merge({
      font: new PhetFont(30),
      showCurrencyWhenEvaluated: false
    }, options);
    super('', options);

    // @public (listen-only) - used to signal updates, was necessary because listening to bounds changes wasn't working
    this.updatedEmitter = new Emitter();

    // function closure to update the text that defines the expression
    const update = () => {
      const activeOperations = numberLine.getActiveOperations();
      if (evaluateProperty.value || activeOperations.length === 0) {
        const endValue = numberLine.getCurrentEndValue();

        // Use minus sign instead of unary minus, see https://github.com/phetsims/number-line-operations/issues/9.
        const signChar = endValue < 0 ? MathSymbols.MINUS : '';

        // Use currency units if specified when displaying the simplified total.
        if (evaluateProperty.value && options.showCurrencyWhenEvaluated) {
          this.string = StringUtils.fillIn(NumberLineOperationsStrings.currencyValuePattern, {
            sign: signChar,
            currencyUnits: NumberLineOperationsStrings.currencyUnits,
            value: Math.abs(endValue)
          });
        } else {
          this.string = signChar + Math.abs(endValue).toString(10);
        }
      } else {
        // {Array.<number|OperationType>} - a list of all the values and operations needed to create the expression
        const valuesAndOperations = [];

        // Add the starting value.
        valuesAndOperations.push(numberLine.startingValueProperty.value);

        // Go through the operations, adding the values and operation types to the list.
        activeOperations.forEach((operation, index) => {
          // The first operation is a special case - it's not included if the starting value was left off.
          if (index > 0 || valuesAndOperations.length > 0) {
            valuesAndOperations.push(operation.operationTypeProperty.value);
          }
          valuesAndOperations.push(operation.amountProperty.value);
        });
        if (simplifyProperty.value) {
          // If simplifying, replace subtraction of a negative with addition and addition of a negative with
          // subtraction.
          for (let i = 1; i < valuesAndOperations.length; i++) {
            if (typeof valuesAndOperations[i] === 'number' && valuesAndOperations[i] < 0) {
              valuesAndOperations[i] = Math.abs(valuesAndOperations[i]);
              if (valuesAndOperations[i - 1] === Operation.ADDITION) {
                valuesAndOperations[i - 1] = Operation.SUBTRACTION;
              } else {
                valuesAndOperations[i - 1] = Operation.ADDITION;
              }
            }
          }
        }
        let numericalExpressionString = '';
        valuesAndOperations.forEach(valueOrOperation => {
          if (typeof valueOrOperation === 'number') {
            // Use minus sign instead of unary minus, see https://github.com/phetsims/number-line-operations/issues/9.
            if (valueOrOperation < 0) {
              numericalExpressionString += MathSymbols.MINUS;
            }
            numericalExpressionString += Math.abs(valueOrOperation);
          } else {
            const operationChar = valueOrOperation === Operation.ADDITION ? MathSymbols.PLUS : MathSymbols.MINUS;
            numericalExpressionString += ` ${operationChar} `;
          }
        });
        this.string = numericalExpressionString;
      }
      this.updatedEmitter.emit();
    };

    // Hook up the various properties that should trigger an update.  No unlink is needed.
    numberLine.startingValueProperty.link(update);
    numberLine.operations.forEach(operation => {
      Multilink.multilink([operation.isActiveProperty, operation.amountProperty, operation.operationTypeProperty], update);
    });
    evaluateProperty.lazyLink(update);
    simplifyProperty.lazyLink(update);
  }
}
numberLineOperations.register('NumericalExpressionAccordionBox', NumericalExpressionAccordionBox);
export default NumericalExpressionAccordionBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiTXVsdGlsaW5rIiwiRGltZW5zaW9uMiIsIk5MQ0NvbnN0YW50cyIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJNYXRoU3ltYm9scyIsIlBoZXRGb250IiwiQ29sb3IiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiVGV4dCIsIkFjY29yZGlvbkJveCIsIlJlY3Rhbmd1bGFyTW9tZW50YXJ5QnV0dG9uIiwiT3BlcmF0aW9uIiwiTkxPQ29uc3RhbnRzIiwibnVtYmVyTGluZU9wZXJhdGlvbnMiLCJOdW1iZXJMaW5lT3BlcmF0aW9uc1N0cmluZ3MiLCJDT05URU5UX0RJTUVOU0lPTlMiLCJNT01FTlRBUllfQlVUVE9OX0JBU0VfQ09MT1IiLCJNT01FTlRBUllfQlVUVE9OX1RPVUNIX0FSRUFfRElMQVRJT04iLCJOdW1lcmljYWxFeHByZXNzaW9uQWNjb3JkaW9uQm94IiwiY29uc3RydWN0b3IiLCJudW1iZXJMaW5lIiwib3B0aW9ucyIsImNvbnRlbnRYTWFyZ2luIiwic2hvd1RpdGxlV2hlbkV4cGFuZGVkIiwidGl0bGVOb2RlIiwiTkVUX1dPUlRIX1dJVEhfQ1VSUkVOQ1lfU1RSSU5HIiwiZm9udCIsIm1heFdpZHRoIiwid2lkdGgiLCJudW1lcmljYWxFeHByZXNzaW9uT3B0aW9ucyIsInRvcCIsIkFDQ09SRElPTl9CT1hfQ09NTU9OX09QVElPTlMiLCJhc3NlcnQiLCJvcGVyYXRpb25zIiwibGVuZ3RoIiwiY29udGVudFJvb3QiLCJoZWlnaHQiLCJmaWxsIiwiVFJBTlNQQVJFTlQiLCJzaW1wbGlmaWNhdGlvblBvc3NpYmxlUHJvcGVydHkiLCJpc0FjdGl2ZVByb3BlcnR5IiwiYW1vdW50UHJvcGVydHkiLCJmaXJzdE9wZXJhdGlvbklzQWN0aXZlIiwiZmlyc3RPcGVyYXRpb25WYWx1ZSIsInNlY29uZE9wZXJhdGlvbklzQWN0aXZlIiwic2Vjb25kT3BlcmF0aW9uVmFsdWUiLCJzaW1wbGlmeVByb3BlcnR5Iiwic2ltcGxpZnlCdXR0b24iLCJjb250ZW50Iiwic2ltcGxpZnkiLCJiYXNlQ29sb3IiLCJlbmFibGVkUHJvcGVydHkiLCJ4TWFyZ2luIiwieU1hcmdpbiIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsImV2YWx1YXRpb25Qb3NzaWJsZVByb3BlcnR5IiwiZXZhbHVhdGVQcm9wZXJ0eSIsImV2YWx1YXRlQnV0dG9uIiwiRVFVQUxfVE8iLCJ4IiwibGVmdCIsImJ1dHRvbnNOb2RlIiwiY2hpbGRyZW4iLCJjZW50ZXJYIiwiYm90dG9tIiwiYWRkQ2hpbGQiLCJudW1lcmljYWxFeHByZXNzaW9uIiwiTnVtZXJpY2FsRXhwcmVzc2lvbiIsImNlbnRlck51bWVyaWNhbEV4cHJlc3Npb24iLCJ1cGRhdGVkRW1pdHRlciIsImFkZExpc3RlbmVyIiwicmVzZXQiLCJleHBhbmRlZFByb3BlcnR5Iiwic2hvd0N1cnJlbmN5V2hlbkV2YWx1YXRlZCIsInVwZGF0ZSIsImFjdGl2ZU9wZXJhdGlvbnMiLCJnZXRBY3RpdmVPcGVyYXRpb25zIiwidmFsdWUiLCJlbmRWYWx1ZSIsImdldEN1cnJlbnRFbmRWYWx1ZSIsInNpZ25DaGFyIiwiTUlOVVMiLCJzdHJpbmciLCJmaWxsSW4iLCJjdXJyZW5jeVZhbHVlUGF0dGVybiIsInNpZ24iLCJjdXJyZW5jeVVuaXRzIiwiTWF0aCIsImFicyIsInRvU3RyaW5nIiwidmFsdWVzQW5kT3BlcmF0aW9ucyIsInB1c2giLCJzdGFydGluZ1ZhbHVlUHJvcGVydHkiLCJmb3JFYWNoIiwib3BlcmF0aW9uIiwiaW5kZXgiLCJvcGVyYXRpb25UeXBlUHJvcGVydHkiLCJpIiwiQURESVRJT04iLCJTVUJUUkFDVElPTiIsIm51bWVyaWNhbEV4cHJlc3Npb25TdHJpbmciLCJ2YWx1ZU9yT3BlcmF0aW9uIiwib3BlcmF0aW9uQ2hhciIsIlBMVVMiLCJlbWl0IiwibGluayIsIm11bHRpbGluayIsImxhenlMaW5rIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOdW1lcmljYWxFeHByZXNzaW9uQWNjb3JkaW9uQm94LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE51bWVyaWNhbEV4cHJlc3Npb25BY2NvcmRpb25Cb3ggaXMgYW4gYWNjb3JkaW9uIGJveCB0aGF0IGNvbnRhaW5zIGEgbWF0aGVtYXRpY2FsIGRlc2NyaXB0aW9uIG9mIHRoZSBvcGVyYXRpb25zIG9uIGFcclxuICogbnVtYmVyIGxpbmUuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgTkxDQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL251bWJlci1saW5lLWNvbW1vbi9qcy9jb21tb24vTkxDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBOb2RlLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQWNjb3JkaW9uQm94IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJNb21lbnRhcnlCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJNb21lbnRhcnlCdXR0b24uanMnO1xyXG5pbXBvcnQgT3BlcmF0aW9uIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9PcGVyYXRpb24uanMnO1xyXG5pbXBvcnQgTkxPQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9OTE9Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgbnVtYmVyTGluZU9wZXJhdGlvbnMgZnJvbSAnLi4vLi4vbnVtYmVyTGluZU9wZXJhdGlvbnMuanMnO1xyXG5pbXBvcnQgTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzIGZyb20gJy4uLy4uL051bWJlckxpbmVPcGVyYXRpb25zU3RyaW5ncy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQ09OVEVOVF9ESU1FTlNJT05TID0gbmV3IERpbWVuc2lvbjIoIDI4MCwgNzAgKTsgLy8gc2l6ZSBiYXNlZCBvbiBkZXNpZ24gZG9jXHJcbmNvbnN0IE1PTUVOVEFSWV9CVVRUT05fQkFTRV9DT0xPUiA9IG5ldyBDb2xvciggMHhmZGZkOTYgKTtcclxuY29uc3QgTU9NRU5UQVJZX0JVVFRPTl9UT1VDSF9BUkVBX0RJTEFUSU9OID0gODtcclxuXHJcbmNsYXNzIE51bWVyaWNhbEV4cHJlc3Npb25BY2NvcmRpb25Cb3ggZXh0ZW5kcyBBY2NvcmRpb25Cb3gge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09wZXJhdGlvblRyYWNraW5nTnVtYmVyTGluZX0gbnVtYmVyTGluZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG51bWJlckxpbmUsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gVGhlIGhvcml6b250YWwgbWFyZ2luIGZvciB0aGUgY29udGVudCBuZWVkcyB0byBiZSBiaWdnZXIgaWYgdGhlIHRpdGxlIGlzIHNob3dpbmcgaW4gb3JkZXIgdG8gbWFrZSBzdXJlIHRoZVxyXG4gICAgLy8gb3ZlcmFsbCB3aWR0aCBvZiB0aGUgYWNjb3JkaW9uIGJveCBpcyB0aGUgc2FtZSB3aGV0aGVyIG9yIG5vdCB0aGUgdGl0bGUgaXMgc2hvd2luZy4gIFRoZSBhbW91bnQgd2FzIGVtcGlyaWNhbGx5XHJcbiAgICAvLyBkZXRlcm1pbmVkLiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9udW1iZXItbGluZS1vcGVyYXRpb25zL2lzc3Vlcy80NCBmb3Igc29tZSBoaXN0b3J5IGlmIG5lZWRlZC5cclxuICAgIGNvbnN0IGNvbnRlbnRYTWFyZ2luID0gb3B0aW9ucy5zaG93VGl0bGVXaGVuRXhwYW5kZWQgPyAyMiA6IDE1O1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBjb250ZW50WE1hcmdpbjogY29udGVudFhNYXJnaW4sXHJcbiAgICAgIHRpdGxlTm9kZTogbmV3IFRleHQoXHJcbiAgICAgICAgTkxPQ29uc3RhbnRzLk5FVF9XT1JUSF9XSVRIX0NVUlJFTkNZX1NUUklORyxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE4ICksXHJcbiAgICAgICAgICBtYXhXaWR0aDogQ09OVEVOVF9ESU1FTlNJT05TLndpZHRoICogMC45XHJcbiAgICAgICAgfVxyXG4gICAgICApLFxyXG5cclxuICAgICAgLy8gb3B0aW9ucyB0aGF0IGFyZSBwYXNzZWQgdGhyb3VnaCB0byB0aGUgbnVtZXJpY2FsIGV4cHJlc3Npb25cclxuICAgICAgbnVtZXJpY2FsRXhwcmVzc2lvbk9wdGlvbnM6IHtcclxuICAgICAgICB0b3A6IDAsXHJcbiAgICAgICAgbWF4V2lkdGg6IENPTlRFTlRfRElNRU5TSU9OUy53aWR0aFxyXG4gICAgICB9XHJcblxyXG4gICAgfSwgTkxDQ29uc3RhbnRzLkFDQ09SRElPTl9CT1hfQ09NTU9OX09QVElPTlMsIG9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBudW1iZXJMaW5lLm9wZXJhdGlvbnMubGVuZ3RoID09PSAyLCAndGhpcyBpbmRpY2F0b3IgaXMgZGVzaWduZWQgdG8gd29yayB3aXRoIGV4YWN0bHkgdHdvIG9wZXJhdGlvbnMnICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgdHJhbnNwYXJlbnQgYmFja2dyb3VuZCB0aGF0IHdpbGwgc2VydmUgYXMgdGhlIHJvb3Qgbm9kZS4gIEV2ZXJ5dGhpbmcgc2hvdWxkIGJlIG1hZGUgdG8gZml0IHdpdGhpbiB0aGlzLlxyXG4gICAgY29uc3QgY29udGVudFJvb3QgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBDT05URU5UX0RJTUVOU0lPTlMud2lkdGgsIENPTlRFTlRfRElNRU5TSU9OUy5oZWlnaHQsIDUsIDUsIHtcclxuICAgICAgZmlsbDogQ29sb3IuVFJBTlNQQVJFTlRcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBEZXJpdmVkUHJvcGVydHkgdGhhdCBpcyB0cnVlIHdoZW4gdGhlcmUgYXJlIG5lZ2F0aXZlIHZhbHVlcyBpbiB0aGUgZXhwcmVzc2lvbiwgd2hpY2ggbWVhbnMgdGhhdFxyXG4gICAgLy8gc2ltcGxpZmljYXRpb24gaXMgcG9zc2libGUuICBUaGlzIHdpbGwgYmUgdXNlZCBhcyB0aGUgZW5hYmxlZCBQcm9wZXJ0eSBmb3IgdGhlIHNpbXBsaWZ5IGJ1dHRvbi5cclxuICAgIGNvbnN0IHNpbXBsaWZpY2F0aW9uUG9zc2libGVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFtcclxuICAgICAgICBudW1iZXJMaW5lLm9wZXJhdGlvbnNbIDAgXS5pc0FjdGl2ZVByb3BlcnR5LFxyXG4gICAgICAgIG51bWJlckxpbmUub3BlcmF0aW9uc1sgMCBdLmFtb3VudFByb3BlcnR5LFxyXG4gICAgICAgIG51bWJlckxpbmUub3BlcmF0aW9uc1sgMSBdLmlzQWN0aXZlUHJvcGVydHksXHJcbiAgICAgICAgbnVtYmVyTGluZS5vcGVyYXRpb25zWyAxIF0uYW1vdW50UHJvcGVydHlcclxuICAgICAgXSxcclxuICAgICAgKCBmaXJzdE9wZXJhdGlvbklzQWN0aXZlLCBmaXJzdE9wZXJhdGlvblZhbHVlLCBzZWNvbmRPcGVyYXRpb25Jc0FjdGl2ZSwgc2Vjb25kT3BlcmF0aW9uVmFsdWUgKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICggZmlyc3RPcGVyYXRpb25Jc0FjdGl2ZSAmJiBmaXJzdE9wZXJhdGlvblZhbHVlIDwgMCApIHx8XHJcbiAgICAgICAgICAgICAgICggc2Vjb25kT3BlcmF0aW9uSXNBY3RpdmUgJiYgc2Vjb25kT3BlcmF0aW9uVmFsdWUgPCAwICk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gc2ltcGxpZnkgYnV0dG9uXHJcbiAgICBjb25zdCBzaW1wbGlmeVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuICAgIGNvbnN0IHNpbXBsaWZ5QnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyTW9tZW50YXJ5QnV0dG9uKCBzaW1wbGlmeVByb3BlcnR5LCBmYWxzZSwgdHJ1ZSwge1xyXG4gICAgICBjb250ZW50OiBuZXcgVGV4dCggTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLnNpbXBsaWZ5LCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMTYgKSwgbWF4V2lkdGg6IDIwMCB9ICksXHJcbiAgICAgIGJhc2VDb2xvcjogTU9NRU5UQVJZX0JVVFRPTl9CQVNFX0NPTE9SLFxyXG4gICAgICBlbmFibGVkUHJvcGVydHk6IHNpbXBsaWZpY2F0aW9uUG9zc2libGVQcm9wZXJ0eSxcclxuICAgICAgeE1hcmdpbjogNSxcclxuICAgICAgeU1hcmdpbjogMy41LFxyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IE1PTUVOVEFSWV9CVVRUT05fVE9VQ0hfQVJFQV9ESUxBVElPTixcclxuICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiBNT01FTlRBUllfQlVUVE9OX1RPVUNIX0FSRUFfRElMQVRJT05cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBEZXJpdmVkUHJvcGVydHkgdGhhdCBpcyB0cnVlIHdoZW4gdGhlcmUgYXJlIG9uZSBvciBtb3JlIGFjdGl2ZSBvcGVyYXRpb25zLiAgVGhpcyB3aWxsIGJlIHVzZWQgYXMgdGhlXHJcbiAgICAvLyBlbmFibGVkIFByb3BlcnR5IGZvciB0aGUgZXZhbHVhdGUgYnV0dG9uLlxyXG4gICAgY29uc3QgZXZhbHVhdGlvblBvc3NpYmxlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbXHJcbiAgICAgICAgbnVtYmVyTGluZS5vcGVyYXRpb25zWyAwIF0uaXNBY3RpdmVQcm9wZXJ0eSxcclxuICAgICAgICBudW1iZXJMaW5lLm9wZXJhdGlvbnNbIDEgXS5pc0FjdGl2ZVByb3BlcnR5XHJcbiAgICAgIF0sXHJcbiAgICAgICggZmlyc3RPcGVyYXRpb25Jc0FjdGl2ZSwgc2Vjb25kT3BlcmF0aW9uSXNBY3RpdmUgKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGZpcnN0T3BlcmF0aW9uSXNBY3RpdmUgfHwgc2Vjb25kT3BlcmF0aW9uSXNBY3RpdmU7XHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gZXZhbHVhdGUgYnV0dG9uXHJcbiAgICBjb25zdCBldmFsdWF0ZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuICAgIGNvbnN0IGV2YWx1YXRlQnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyTW9tZW50YXJ5QnV0dG9uKCBldmFsdWF0ZVByb3BlcnR5LCBmYWxzZSwgdHJ1ZSwge1xyXG4gICAgICBjb250ZW50OiBuZXcgVGV4dCggTWF0aFN5bWJvbHMuRVFVQUxfVE8sIHsgZm9udDogbmV3IFBoZXRGb250KCAyMCApIH0gKSxcclxuICAgICAgYmFzZUNvbG9yOiBNT01FTlRBUllfQlVUVE9OX0JBU0VfQ09MT1IsXHJcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eTogZXZhbHVhdGlvblBvc3NpYmxlUHJvcGVydHksXHJcbiAgICAgIHhNYXJnaW46IDUsXHJcbiAgICAgIHlNYXJnaW46IDEsXHJcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogTU9NRU5UQVJZX0JVVFRPTl9UT1VDSF9BUkVBX0RJTEFUSU9OLFxyXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IE1PTUVOVEFSWV9CVVRUT05fVE9VQ0hfQVJFQV9ESUxBVElPTlxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFBvc2l0aW9uIHRoZSBidXR0b25zIHNvIHRoYXQgdGhleSBhcmUgY29sbGVjdGl2ZWx5IGNlbnRlcmVkIHVuZGVyIHRoZSBlcXVhdGlvbi5cclxuICAgIHNpbXBsaWZ5QnV0dG9uLnggPSAwO1xyXG4gICAgZXZhbHVhdGVCdXR0b24ubGVmdCA9IHNpbXBsaWZ5QnV0dG9uLndpZHRoICsgMjA7XHJcbiAgICBjb25zdCBidXR0b25zTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHNpbXBsaWZ5QnV0dG9uLCBldmFsdWF0ZUJ1dHRvbiBdLFxyXG4gICAgICBjZW50ZXJYOiBDT05URU5UX0RJTUVOU0lPTlMud2lkdGggLyAyLFxyXG4gICAgICBib3R0b206IENPTlRFTlRfRElNRU5TSU9OUy5oZWlnaHRcclxuICAgIH0gKTtcclxuICAgIGNvbnRlbnRSb290LmFkZENoaWxkKCBidXR0b25zTm9kZSApO1xyXG5cclxuICAgIC8vIG51bWVyaWNhbCBleHByZXNzaW9uXHJcbiAgICBjb25zdCBudW1lcmljYWxFeHByZXNzaW9uID0gbmV3IE51bWVyaWNhbEV4cHJlc3Npb24oXHJcbiAgICAgIG51bWJlckxpbmUsXHJcbiAgICAgIHNpbXBsaWZ5UHJvcGVydHksXHJcbiAgICAgIGV2YWx1YXRlUHJvcGVydHksXHJcbiAgICAgIG9wdGlvbnMubnVtZXJpY2FsRXhwcmVzc2lvbk9wdGlvbnNcclxuICAgICk7XHJcbiAgICBjb250ZW50Um9vdC5hZGRDaGlsZCggbnVtZXJpY2FsRXhwcmVzc2lvbiApO1xyXG5cclxuICAgIC8vIEtlZXAgdGhlIG51bWVyaWNhbCBleHByZXNzaW9uIGNlbnRlcmVkLlxyXG4gICAgY29uc3QgY2VudGVyTnVtZXJpY2FsRXhwcmVzc2lvbiA9ICgpID0+IHtcclxuICAgICAgbnVtZXJpY2FsRXhwcmVzc2lvbi5jZW50ZXJYID0gQ09OVEVOVF9ESU1FTlNJT05TLndpZHRoIC8gMjtcclxuICAgICAgbnVtZXJpY2FsRXhwcmVzc2lvbi50b3AgPSAwO1xyXG4gICAgfTtcclxuICAgIGNlbnRlck51bWVyaWNhbEV4cHJlc3Npb24oKTtcclxuICAgIG51bWVyaWNhbEV4cHJlc3Npb24udXBkYXRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGNlbnRlck51bWVyaWNhbEV4cHJlc3Npb24gKTtcclxuXHJcbiAgICBzdXBlciggY29udGVudFJvb3QsIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIG1ha2UgdGhpcyBhdmFpbGFibGUgc28gaXQgY2FuIGJlIHJlc2V0XHJcbiAgICB0aGlzLnNpbXBsaWZ5UHJvcGVydHkgPSBzaW1wbGlmeVByb3BlcnR5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdG9yZSBpbml0aWFsIHN0YXRlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuc2ltcGxpZnlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5leHBhbmRlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogTnVtZXJpY2FsRXhwcmVzc2lvbiBpcyBhIFNjZW5lcnkgVGV4dCBOb2RlIHRoYXQgcmVwcmVzZW50IGEgbnVtZXJpY2FsIGV4cHJlc3Npb24gdGhhdCBkZXNjcmliZXMgdGhlIG9wZXJhdGlvbnMgb24gdGhlXHJcbiAqIG51bWJlciBsaW5lLCBmb3IgZXhhbXBsZSBcIjEgKyA3IC0gMlwiLlxyXG4gKi9cclxuY2xhc3MgTnVtZXJpY2FsRXhwcmVzc2lvbiBleHRlbmRzIFRleHQge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09wZXJhdGlvblRyYWNraW5nTnVtYmVyTGluZX0gbnVtYmVyTGluZVxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhblByb3BlcnR5fSBzaW1wbGlmeVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtCb29sZWFuUHJvcGVydHl9IGV2YWx1YXRlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBudW1iZXJMaW5lLCBzaW1wbGlmeVByb3BlcnR5LCBldmFsdWF0ZVByb3BlcnR5LCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDMwICksXHJcbiAgICAgIHNob3dDdXJyZW5jeVdoZW5FdmFsdWF0ZWQ6IGZhbHNlXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoICcnLCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAobGlzdGVuLW9ubHkpIC0gdXNlZCB0byBzaWduYWwgdXBkYXRlcywgd2FzIG5lY2Vzc2FyeSBiZWNhdXNlIGxpc3RlbmluZyB0byBib3VuZHMgY2hhbmdlcyB3YXNuJ3Qgd29ya2luZ1xyXG4gICAgdGhpcy51cGRhdGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8gZnVuY3Rpb24gY2xvc3VyZSB0byB1cGRhdGUgdGhlIHRleHQgdGhhdCBkZWZpbmVzIHRoZSBleHByZXNzaW9uXHJcbiAgICBjb25zdCB1cGRhdGUgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFjdGl2ZU9wZXJhdGlvbnMgPSBudW1iZXJMaW5lLmdldEFjdGl2ZU9wZXJhdGlvbnMoKTtcclxuICAgICAgaWYgKCBldmFsdWF0ZVByb3BlcnR5LnZhbHVlIHx8IGFjdGl2ZU9wZXJhdGlvbnMubGVuZ3RoID09PSAwICkge1xyXG5cclxuICAgICAgICBjb25zdCBlbmRWYWx1ZSA9IG51bWJlckxpbmUuZ2V0Q3VycmVudEVuZFZhbHVlKCk7XHJcblxyXG4gICAgICAgIC8vIFVzZSBtaW51cyBzaWduIGluc3RlYWQgb2YgdW5hcnkgbWludXMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbnVtYmVyLWxpbmUtb3BlcmF0aW9ucy9pc3N1ZXMvOS5cclxuICAgICAgICBjb25zdCBzaWduQ2hhciA9IGVuZFZhbHVlIDwgMCA/IE1hdGhTeW1ib2xzLk1JTlVTIDogJyc7XHJcblxyXG4gICAgICAgIC8vIFVzZSBjdXJyZW5jeSB1bml0cyBpZiBzcGVjaWZpZWQgd2hlbiBkaXNwbGF5aW5nIHRoZSBzaW1wbGlmaWVkIHRvdGFsLlxyXG4gICAgICAgIGlmICggZXZhbHVhdGVQcm9wZXJ0eS52YWx1ZSAmJiBvcHRpb25zLnNob3dDdXJyZW5jeVdoZW5FdmFsdWF0ZWQgKSB7XHJcbiAgICAgICAgICB0aGlzLnN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLmN1cnJlbmN5VmFsdWVQYXR0ZXJuLCB7XHJcbiAgICAgICAgICAgIHNpZ246IHNpZ25DaGFyLFxyXG4gICAgICAgICAgICBjdXJyZW5jeVVuaXRzOiBOdW1iZXJMaW5lT3BlcmF0aW9uc1N0cmluZ3MuY3VycmVuY3lVbml0cyxcclxuICAgICAgICAgICAgdmFsdWU6IE1hdGguYWJzKCBlbmRWYWx1ZSApXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5zdHJpbmcgPSBzaWduQ2hhciArIE1hdGguYWJzKCBlbmRWYWx1ZSApLnRvU3RyaW5nKCAxMCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8ge0FycmF5LjxudW1iZXJ8T3BlcmF0aW9uVHlwZT59IC0gYSBsaXN0IG9mIGFsbCB0aGUgdmFsdWVzIGFuZCBvcGVyYXRpb25zIG5lZWRlZCB0byBjcmVhdGUgdGhlIGV4cHJlc3Npb25cclxuICAgICAgICBjb25zdCB2YWx1ZXNBbmRPcGVyYXRpb25zID0gW107XHJcblxyXG4gICAgICAgIC8vIEFkZCB0aGUgc3RhcnRpbmcgdmFsdWUuXHJcbiAgICAgICAgdmFsdWVzQW5kT3BlcmF0aW9ucy5wdXNoKCBudW1iZXJMaW5lLnN0YXJ0aW5nVmFsdWVQcm9wZXJ0eS52YWx1ZSApO1xyXG5cclxuICAgICAgICAvLyBHbyB0aHJvdWdoIHRoZSBvcGVyYXRpb25zLCBhZGRpbmcgdGhlIHZhbHVlcyBhbmQgb3BlcmF0aW9uIHR5cGVzIHRvIHRoZSBsaXN0LlxyXG4gICAgICAgIGFjdGl2ZU9wZXJhdGlvbnMuZm9yRWFjaCggKCBvcGVyYXRpb24sIGluZGV4ICkgPT4ge1xyXG5cclxuICAgICAgICAgIC8vIFRoZSBmaXJzdCBvcGVyYXRpb24gaXMgYSBzcGVjaWFsIGNhc2UgLSBpdCdzIG5vdCBpbmNsdWRlZCBpZiB0aGUgc3RhcnRpbmcgdmFsdWUgd2FzIGxlZnQgb2ZmLlxyXG4gICAgICAgICAgaWYgKCBpbmRleCA+IDAgfHwgdmFsdWVzQW5kT3BlcmF0aW9ucy5sZW5ndGggPiAwICkge1xyXG4gICAgICAgICAgICB2YWx1ZXNBbmRPcGVyYXRpb25zLnB1c2goIG9wZXJhdGlvbi5vcGVyYXRpb25UeXBlUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHZhbHVlc0FuZE9wZXJhdGlvbnMucHVzaCggb3BlcmF0aW9uLmFtb3VudFByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICBpZiAoIHNpbXBsaWZ5UHJvcGVydHkudmFsdWUgKSB7XHJcblxyXG4gICAgICAgICAgLy8gSWYgc2ltcGxpZnlpbmcsIHJlcGxhY2Ugc3VidHJhY3Rpb24gb2YgYSBuZWdhdGl2ZSB3aXRoIGFkZGl0aW9uIGFuZCBhZGRpdGlvbiBvZiBhIG5lZ2F0aXZlIHdpdGhcclxuICAgICAgICAgIC8vIHN1YnRyYWN0aW9uLlxyXG4gICAgICAgICAgZm9yICggbGV0IGkgPSAxOyBpIDwgdmFsdWVzQW5kT3BlcmF0aW9ucy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgICAgaWYgKCB0eXBlb2YgdmFsdWVzQW5kT3BlcmF0aW9uc1sgaSBdID09PSAnbnVtYmVyJyAmJiB2YWx1ZXNBbmRPcGVyYXRpb25zWyBpIF0gPCAwICkge1xyXG4gICAgICAgICAgICAgIHZhbHVlc0FuZE9wZXJhdGlvbnNbIGkgXSA9IE1hdGguYWJzKCB2YWx1ZXNBbmRPcGVyYXRpb25zWyBpIF0gKTtcclxuICAgICAgICAgICAgICBpZiAoIHZhbHVlc0FuZE9wZXJhdGlvbnNbIGkgLSAxIF0gPT09IE9wZXJhdGlvbi5BRERJVElPTiApIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlc0FuZE9wZXJhdGlvbnNbIGkgLSAxIF0gPSBPcGVyYXRpb24uU1VCVFJBQ1RJT047XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFsdWVzQW5kT3BlcmF0aW9uc1sgaSAtIDEgXSA9IE9wZXJhdGlvbi5BRERJVElPTjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBudW1lcmljYWxFeHByZXNzaW9uU3RyaW5nID0gJyc7XHJcbiAgICAgICAgdmFsdWVzQW5kT3BlcmF0aW9ucy5mb3JFYWNoKCB2YWx1ZU9yT3BlcmF0aW9uID0+IHtcclxuICAgICAgICAgIGlmICggdHlwZW9mIHZhbHVlT3JPcGVyYXRpb24gPT09ICdudW1iZXInICkge1xyXG5cclxuICAgICAgICAgICAgLy8gVXNlIG1pbnVzIHNpZ24gaW5zdGVhZCBvZiB1bmFyeSBtaW51cywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9udW1iZXItbGluZS1vcGVyYXRpb25zL2lzc3Vlcy85LlxyXG4gICAgICAgICAgICBpZiAoIHZhbHVlT3JPcGVyYXRpb24gPCAwICkge1xyXG4gICAgICAgICAgICAgIG51bWVyaWNhbEV4cHJlc3Npb25TdHJpbmcgKz0gTWF0aFN5bWJvbHMuTUlOVVM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbnVtZXJpY2FsRXhwcmVzc2lvblN0cmluZyArPSBNYXRoLmFicyggdmFsdWVPck9wZXJhdGlvbiApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbkNoYXIgPSB2YWx1ZU9yT3BlcmF0aW9uID09PSBPcGVyYXRpb24uQURESVRJT04gPyBNYXRoU3ltYm9scy5QTFVTIDogTWF0aFN5bWJvbHMuTUlOVVM7XHJcbiAgICAgICAgICAgIG51bWVyaWNhbEV4cHJlc3Npb25TdHJpbmcgKz0gYCAke29wZXJhdGlvbkNoYXJ9IGA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIHRoaXMuc3RyaW5nID0gbnVtZXJpY2FsRXhwcmVzc2lvblN0cmluZztcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnVwZGF0ZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gSG9vayB1cCB0aGUgdmFyaW91cyBwcm9wZXJ0aWVzIHRoYXQgc2hvdWxkIHRyaWdnZXIgYW4gdXBkYXRlLiAgTm8gdW5saW5rIGlzIG5lZWRlZC5cclxuICAgIG51bWJlckxpbmUuc3RhcnRpbmdWYWx1ZVByb3BlcnR5LmxpbmsoIHVwZGF0ZSApO1xyXG4gICAgbnVtYmVyTGluZS5vcGVyYXRpb25zLmZvckVhY2goIG9wZXJhdGlvbiA9PiB7XHJcbiAgICAgIE11bHRpbGluay5tdWx0aWxpbmsoXHJcbiAgICAgICAgWyBvcGVyYXRpb24uaXNBY3RpdmVQcm9wZXJ0eSwgb3BlcmF0aW9uLmFtb3VudFByb3BlcnR5LCBvcGVyYXRpb24ub3BlcmF0aW9uVHlwZVByb3BlcnR5IF0sXHJcbiAgICAgICAgdXBkYXRlXHJcbiAgICAgICk7XHJcbiAgICB9ICk7XHJcbiAgICBldmFsdWF0ZVByb3BlcnR5LmxhenlMaW5rKCB1cGRhdGUgKTtcclxuICAgIHNpbXBsaWZ5UHJvcGVydHkubGF6eUxpbmsoIHVwZGF0ZSApO1xyXG4gIH1cclxufVxyXG5cclxubnVtYmVyTGluZU9wZXJhdGlvbnMucmVnaXN0ZXIoICdOdW1lcmljYWxFeHByZXNzaW9uQWNjb3JkaW9uQm94JywgTnVtZXJpY2FsRXhwcmVzc2lvbkFjY29yZGlvbkJveCApO1xyXG5leHBvcnQgZGVmYXVsdCBOdW1lcmljYWxFeHByZXNzaW9uQWNjb3JkaW9uQm94O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsT0FBTyxNQUFNLGdDQUFnQztBQUNwRCxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsWUFBWSxNQUFNLDBEQUEwRDtBQUNuRixPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FB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