// Copyright 2020-2023, University of Colorado Boulder

/**
 * OperationEntryControl is a control that allows users to add operations to a number line.  Operation can be either
 * addition or subtraction, and have a value associated with them, and this control allows the user to set those
 * attributes and commit the operation to the number line, and also alter it after it has been added.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Range from '../../../../dot/js/Range.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, HBox, Path, Text } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import RoundPushButton from '../../../../sun/js/buttons/RoundPushButton.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import Operation from '../../common/model/Operation.js';
import numberLineOperations from '../../numberLineOperations.js';

// constants
const MATH_SYMBOL_OPTIONS = {
  font: new PhetFont(32)
};

// This is a normalized version of the enter arrow shape, pointing in the downward direction.  The upper left corner is
// at 0,0 and the height is 1.
const NORMALIZED_ENTER_ARROW_SHAPE = new Shape().lineTo(0.45, 0).lineTo(0.45, 0.5).lineTo(0.65, 0.5).lineTo(0.35, 1).lineTo(0.05, 0.5).lineTo(0.25, 0.5).lineTo(0.25, 0.2).lineTo(0, 0.2).lineTo(0, 0);
const FULL_SIZE_ARROW_SHAPE = NORMALIZED_ENTER_ARROW_SHAPE.transformed(Matrix3.scale(28)); // scale empirically chosen

class OperationEntryControl extends HBox {
  /**
   * @param {NumberLineOperation} controlledOperation - the number line operation that is controlled
   * @param {Object} [options]
   * @public
   */
  constructor(controlledOperation, options) {
    options = merge({
      spacing: 15,
      increment: 100,
      buttonBaseColor: Color.BLUE,
      // {String} - specifies the way the arrow should point, valid values are 'up' and 'down'
      arrowDirection: 'down',
      numberPickerRangeProperty: new Property(new Range(-200, 200)),
      // options that are passed through to the number picker
      numberPickerOptions: {
        yMargin: 10,
        arrowHeight: 10,
        color: Color.BLACK,
        font: new PhetFont(26),
        timerDelay: 300,
        timerInterval: 30
      }
    }, options);

    // options checking
    assert && assert(options.arrowDirection === 'up' || options.arrowDirection === 'down');

    // plus/minus operation selector
    const interButtonSpacing = 5;
    const operationSelectorRadioButtonGroup = new RectangularRadioButtonGroup(controlledOperation.operationTypeProperty, [{
      value: Operation.ADDITION,
      createNode: () => new Text(MathSymbols.PLUS, MATH_SYMBOL_OPTIONS)
    }, {
      value: Operation.SUBTRACTION,
      createNode: () => new Text(MathSymbols.MINUS, MATH_SYMBOL_OPTIONS)
    }], {
      orientation: 'vertical',
      spacing: interButtonSpacing,
      touchAreaXDilation: 4,
      touchAreaYDilation: interButtonSpacing / 2,
      radioButtonOptions: {
        baseColor: Color.WHITE,
        xMargin: 8,
        yMargin: 0,
        buttonAppearanceStrategyOptions: {
          selectedLineWidth: 2.5
        }
      }
    });

    // amount selector
    const operationAmountPicker = new NumberPicker(controlledOperation.amountProperty, options.numberPickerRangeProperty, merge({
      incrementFunction: value => value + options.increment,
      decrementFunction: value => value - options.increment
    }, options.numberPickerOptions));

    // enter button
    let enterArrowShape;
    if (options.arrowDirection === 'down') {
      enterArrowShape = FULL_SIZE_ARROW_SHAPE;
    } else {
      enterArrowShape = FULL_SIZE_ARROW_SHAPE.transformed(Matrix3.scale(1, -1));
    }
    const enterArrowNode = new Path(enterArrowShape, {
      fill: Color.BLACK
    });
    const enterButton = new RoundPushButton({
      enabledProperty: DerivedProperty.not(controlledOperation.isActiveProperty),
      listener: () => {
        controlledOperation.isActiveProperty.set(true);
      },
      content: enterArrowNode,
      radius: 30,
      xMargin: 16,
      yMargin: 16,
      baseColor: options.buttonBaseColor
    });
    super(merge({
      children: [operationSelectorRadioButtonGroup, operationAmountPicker, enterButton]
    }, options));

    // @private - now that the constructor has been called, make the controlled operation available to the methods
    this.controlledOperation = controlledOperation;
  }

  /**
   * @public
   */
  reset() {
    this.controlledOperation.reset();
  }
}
numberLineOperations.register('OperationEntryControl', OperationEntryControl);
export default OperationEntryControl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIk1hdHJpeDMiLCJSYW5nZSIsIlNoYXBlIiwibWVyZ2UiLCJNYXRoU3ltYm9scyIsIlBoZXRGb250IiwiQ29sb3IiLCJIQm94IiwiUGF0aCIsIlRleHQiLCJSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAiLCJSb3VuZFB1c2hCdXR0b24iLCJOdW1iZXJQaWNrZXIiLCJPcGVyYXRpb24iLCJudW1iZXJMaW5lT3BlcmF0aW9ucyIsIk1BVEhfU1lNQk9MX09QVElPTlMiLCJmb250IiwiTk9STUFMSVpFRF9FTlRFUl9BUlJPV19TSEFQRSIsImxpbmVUbyIsIkZVTExfU0laRV9BUlJPV19TSEFQRSIsInRyYW5zZm9ybWVkIiwic2NhbGUiLCJPcGVyYXRpb25FbnRyeUNvbnRyb2wiLCJjb25zdHJ1Y3RvciIsImNvbnRyb2xsZWRPcGVyYXRpb24iLCJvcHRpb25zIiwic3BhY2luZyIsImluY3JlbWVudCIsImJ1dHRvbkJhc2VDb2xvciIsIkJMVUUiLCJhcnJvd0RpcmVjdGlvbiIsIm51bWJlclBpY2tlclJhbmdlUHJvcGVydHkiLCJudW1iZXJQaWNrZXJPcHRpb25zIiwieU1hcmdpbiIsImFycm93SGVpZ2h0IiwiY29sb3IiLCJCTEFDSyIsInRpbWVyRGVsYXkiLCJ0aW1lckludGVydmFsIiwiYXNzZXJ0IiwiaW50ZXJCdXR0b25TcGFjaW5nIiwib3BlcmF0aW9uU2VsZWN0b3JSYWRpb0J1dHRvbkdyb3VwIiwib3BlcmF0aW9uVHlwZVByb3BlcnR5IiwidmFsdWUiLCJBRERJVElPTiIsImNyZWF0ZU5vZGUiLCJQTFVTIiwiU1VCVFJBQ1RJT04iLCJNSU5VUyIsIm9yaWVudGF0aW9uIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwicmFkaW9CdXR0b25PcHRpb25zIiwiYmFzZUNvbG9yIiwiV0hJVEUiLCJ4TWFyZ2luIiwiYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9ucyIsInNlbGVjdGVkTGluZVdpZHRoIiwib3BlcmF0aW9uQW1vdW50UGlja2VyIiwiYW1vdW50UHJvcGVydHkiLCJpbmNyZW1lbnRGdW5jdGlvbiIsImRlY3JlbWVudEZ1bmN0aW9uIiwiZW50ZXJBcnJvd1NoYXBlIiwiZW50ZXJBcnJvd05vZGUiLCJmaWxsIiwiZW50ZXJCdXR0b24iLCJlbmFibGVkUHJvcGVydHkiLCJub3QiLCJpc0FjdGl2ZVByb3BlcnR5IiwibGlzdGVuZXIiLCJzZXQiLCJjb250ZW50IiwicmFkaXVzIiwiY2hpbGRyZW4iLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiT3BlcmF0aW9uRW50cnlDb250cm9sLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE9wZXJhdGlvbkVudHJ5Q29udHJvbCBpcyBhIGNvbnRyb2wgdGhhdCBhbGxvd3MgdXNlcnMgdG8gYWRkIG9wZXJhdGlvbnMgdG8gYSBudW1iZXIgbGluZS4gIE9wZXJhdGlvbiBjYW4gYmUgZWl0aGVyXHJcbiAqIGFkZGl0aW9uIG9yIHN1YnRyYWN0aW9uLCBhbmQgaGF2ZSBhIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGVtLCBhbmQgdGhpcyBjb250cm9sIGFsbG93cyB0aGUgdXNlciB0byBzZXQgdGhvc2VcclxuICogYXR0cmlidXRlcyBhbmQgY29tbWl0IHRoZSBvcGVyYXRpb24gdG8gdGhlIG51bWJlciBsaW5lLCBhbmQgYWxzbyBhbHRlciBpdCBhZnRlciBpdCBoYXMgYmVlbiBhZGRlZC5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBIQm94LCBQYXRoLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgUm91bmRQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JvdW5kUHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBOdW1iZXJQaWNrZXIgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL051bWJlclBpY2tlci5qcyc7XHJcbmltcG9ydCBPcGVyYXRpb24gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL09wZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBudW1iZXJMaW5lT3BlcmF0aW9ucyBmcm9tICcuLi8uLi9udW1iZXJMaW5lT3BlcmF0aW9ucy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTUFUSF9TWU1CT0xfT1BUSU9OUyA9IHtcclxuICBmb250OiBuZXcgUGhldEZvbnQoIDMyIClcclxufTtcclxuXHJcbi8vIFRoaXMgaXMgYSBub3JtYWxpemVkIHZlcnNpb24gb2YgdGhlIGVudGVyIGFycm93IHNoYXBlLCBwb2ludGluZyBpbiB0aGUgZG93bndhcmQgZGlyZWN0aW9uLiAgVGhlIHVwcGVyIGxlZnQgY29ybmVyIGlzXHJcbi8vIGF0IDAsMCBhbmQgdGhlIGhlaWdodCBpcyAxLlxyXG5jb25zdCBOT1JNQUxJWkVEX0VOVEVSX0FSUk9XX1NIQVBFID0gbmV3IFNoYXBlKClcclxuICAubGluZVRvKCAwLjQ1LCAwIClcclxuICAubGluZVRvKCAwLjQ1LCAwLjUgKVxyXG4gIC5saW5lVG8oIDAuNjUsIDAuNSApXHJcbiAgLmxpbmVUbyggMC4zNSwgMSApXHJcbiAgLmxpbmVUbyggMC4wNSwgMC41IClcclxuICAubGluZVRvKCAwLjI1LCAwLjUgKVxyXG4gIC5saW5lVG8oIDAuMjUsIDAuMiApXHJcbiAgLmxpbmVUbyggMCwgMC4yIClcclxuICAubGluZVRvKCAwLCAwICk7XHJcbmNvbnN0IEZVTExfU0laRV9BUlJPV19TSEFQRSA9IE5PUk1BTElaRURfRU5URVJfQVJST1dfU0hBUEUudHJhbnNmb3JtZWQoIE1hdHJpeDMuc2NhbGUoIDI4ICkgKTsgLy8gc2NhbGUgZW1waXJpY2FsbHkgY2hvc2VuXHJcblxyXG5jbGFzcyBPcGVyYXRpb25FbnRyeUNvbnRyb2wgZXh0ZW5kcyBIQm94IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJMaW5lT3BlcmF0aW9ufSBjb250cm9sbGVkT3BlcmF0aW9uIC0gdGhlIG51bWJlciBsaW5lIG9wZXJhdGlvbiB0aGF0IGlzIGNvbnRyb2xsZWRcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjb250cm9sbGVkT3BlcmF0aW9uLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBzcGFjaW5nOiAxNSxcclxuICAgICAgaW5jcmVtZW50OiAxMDAsXHJcbiAgICAgIGJ1dHRvbkJhc2VDb2xvcjogQ29sb3IuQkxVRSxcclxuXHJcbiAgICAgIC8vIHtTdHJpbmd9IC0gc3BlY2lmaWVzIHRoZSB3YXkgdGhlIGFycm93IHNob3VsZCBwb2ludCwgdmFsaWQgdmFsdWVzIGFyZSAndXAnIGFuZCAnZG93bidcclxuICAgICAgYXJyb3dEaXJlY3Rpb246ICdkb3duJyxcclxuXHJcbiAgICAgIG51bWJlclBpY2tlclJhbmdlUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggbmV3IFJhbmdlKCAtMjAwLCAyMDAgKSApLFxyXG5cclxuICAgICAgLy8gb3B0aW9ucyB0aGF0IGFyZSBwYXNzZWQgdGhyb3VnaCB0byB0aGUgbnVtYmVyIHBpY2tlclxyXG4gICAgICBudW1iZXJQaWNrZXJPcHRpb25zOiB7XHJcbiAgICAgICAgeU1hcmdpbjogMTAsXHJcbiAgICAgICAgYXJyb3dIZWlnaHQ6IDEwLFxyXG4gICAgICAgIGNvbG9yOiBDb2xvci5CTEFDSyxcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDI2ICksXHJcbiAgICAgICAgdGltZXJEZWxheTogMzAwLFxyXG4gICAgICAgIHRpbWVySW50ZXJ2YWw6IDMwXHJcbiAgICAgIH1cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBvcHRpb25zIGNoZWNraW5nXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmFycm93RGlyZWN0aW9uID09PSAndXAnIHx8IG9wdGlvbnMuYXJyb3dEaXJlY3Rpb24gPT09ICdkb3duJyApO1xyXG5cclxuICAgIC8vIHBsdXMvbWludXMgb3BlcmF0aW9uIHNlbGVjdG9yXHJcbiAgICBjb25zdCBpbnRlckJ1dHRvblNwYWNpbmcgPSA1O1xyXG4gICAgY29uc3Qgb3BlcmF0aW9uU2VsZWN0b3JSYWRpb0J1dHRvbkdyb3VwID0gbmV3IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cChcclxuICAgICAgY29udHJvbGxlZE9wZXJhdGlvbi5vcGVyYXRpb25UeXBlUHJvcGVydHksXHJcbiAgICAgIFtcclxuICAgICAgICB7IHZhbHVlOiBPcGVyYXRpb24uQURESVRJT04sIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCBNYXRoU3ltYm9scy5QTFVTLCBNQVRIX1NZTUJPTF9PUFRJT05TICkgfSxcclxuICAgICAgICB7IHZhbHVlOiBPcGVyYXRpb24uU1VCVFJBQ1RJT04sIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCBNYXRoU3ltYm9scy5NSU5VUywgTUFUSF9TWU1CT0xfT1BUSU9OUyApIH1cclxuICAgICAgXSxcclxuICAgICAge1xyXG4gICAgICAgIG9yaWVudGF0aW9uOiAndmVydGljYWwnLFxyXG4gICAgICAgIHNwYWNpbmc6IGludGVyQnV0dG9uU3BhY2luZyxcclxuICAgICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDQsXHJcbiAgICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiBpbnRlckJ1dHRvblNwYWNpbmcgLyAyLFxyXG4gICAgICAgIHJhZGlvQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgICAgYmFzZUNvbG9yOiBDb2xvci5XSElURSxcclxuICAgICAgICAgIHhNYXJnaW46IDgsXHJcbiAgICAgICAgICB5TWFyZ2luOiAwLFxyXG4gICAgICAgICAgYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9uczoge1xyXG4gICAgICAgICAgICBzZWxlY3RlZExpbmVXaWR0aDogMi41XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIGFtb3VudCBzZWxlY3RvclxyXG4gICAgY29uc3Qgb3BlcmF0aW9uQW1vdW50UGlja2VyID0gbmV3IE51bWJlclBpY2tlcihcclxuICAgICAgY29udHJvbGxlZE9wZXJhdGlvbi5hbW91bnRQcm9wZXJ0eSxcclxuICAgICAgb3B0aW9ucy5udW1iZXJQaWNrZXJSYW5nZVByb3BlcnR5LFxyXG4gICAgICBtZXJnZSgge1xyXG4gICAgICAgIGluY3JlbWVudEZ1bmN0aW9uOiB2YWx1ZSA9PiB2YWx1ZSArIG9wdGlvbnMuaW5jcmVtZW50LFxyXG4gICAgICAgIGRlY3JlbWVudEZ1bmN0aW9uOiB2YWx1ZSA9PiB2YWx1ZSAtIG9wdGlvbnMuaW5jcmVtZW50XHJcbiAgICAgIH0sIG9wdGlvbnMubnVtYmVyUGlja2VyT3B0aW9ucyApXHJcbiAgICApO1xyXG5cclxuICAgIC8vIGVudGVyIGJ1dHRvblxyXG4gICAgbGV0IGVudGVyQXJyb3dTaGFwZTtcclxuICAgIGlmICggb3B0aW9ucy5hcnJvd0RpcmVjdGlvbiA9PT0gJ2Rvd24nICkge1xyXG4gICAgICBlbnRlckFycm93U2hhcGUgPSBGVUxMX1NJWkVfQVJST1dfU0hBUEU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgZW50ZXJBcnJvd1NoYXBlID0gRlVMTF9TSVpFX0FSUk9XX1NIQVBFLnRyYW5zZm9ybWVkKCBNYXRyaXgzLnNjYWxlKCAxLCAtMSApICk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBlbnRlckFycm93Tm9kZSA9IG5ldyBQYXRoKCBlbnRlckFycm93U2hhcGUsIHsgZmlsbDogQ29sb3IuQkxBQ0sgfSApO1xyXG4gICAgY29uc3QgZW50ZXJCdXR0b24gPSBuZXcgUm91bmRQdXNoQnV0dG9uKCB7XHJcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eTogRGVyaXZlZFByb3BlcnR5Lm5vdCggY29udHJvbGxlZE9wZXJhdGlvbi5pc0FjdGl2ZVByb3BlcnR5ICksXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgY29udHJvbGxlZE9wZXJhdGlvbi5pc0FjdGl2ZVByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgICB9LFxyXG4gICAgICBjb250ZW50OiBlbnRlckFycm93Tm9kZSxcclxuICAgICAgcmFkaXVzOiAzMCxcclxuICAgICAgeE1hcmdpbjogMTYsXHJcbiAgICAgIHlNYXJnaW46IDE2LFxyXG4gICAgICBiYXNlQ29sb3I6IG9wdGlvbnMuYnV0dG9uQmFzZUNvbG9yXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIG1lcmdlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIG9wZXJhdGlvblNlbGVjdG9yUmFkaW9CdXR0b25Hcm91cCwgb3BlcmF0aW9uQW1vdW50UGlja2VyLCBlbnRlckJ1dHRvbiBdXHJcbiAgICB9LCBvcHRpb25zICkgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIG5vdyB0aGF0IHRoZSBjb25zdHJ1Y3RvciBoYXMgYmVlbiBjYWxsZWQsIG1ha2UgdGhlIGNvbnRyb2xsZWQgb3BlcmF0aW9uIGF2YWlsYWJsZSB0byB0aGUgbWV0aG9kc1xyXG4gICAgdGhpcy5jb250cm9sbGVkT3BlcmF0aW9uID0gY29udHJvbGxlZE9wZXJhdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuY29udHJvbGxlZE9wZXJhdGlvbi5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxubnVtYmVyTGluZU9wZXJhdGlvbnMucmVnaXN0ZXIoICdPcGVyYXRpb25FbnRyeUNvbnRyb2wnLCBPcGVyYXRpb25FbnRyeUNvbnRyb2wgKTtcclxuZXhwb3J0IGRlZmF1bHQgT3BlcmF0aW9uRW50cnlDb250cm9sOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxP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