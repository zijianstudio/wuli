// Copyright 2017-2023, University of Colorado Boulder

/**
 * The 'universal operation' control (as it's referred to in the design document)
 * allows the user to apply an operation to both sides of the scale and equation.
 *
 * Since some combinations of operator and operand are not supported (specifically division by zero, and
 * multiplication or division by variable terms) the UX for this control is complex, and potentially confusing.
 *
 * For historical discussion and specifications, see:
 * https://github.com/phetsims/equality-explorer/issues/45
 * https://github.com/phetsims/equality-explorer/issues/77
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { HBox, Path } from '../../../../scenery/js/imports.js';
import levelDownAltSolidShape from '../../../../sherpa/js/fontawesome-5/levelDownAltSolidShape.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import RoundPushButton from '../../../../sun/js/buttons/RoundPushButton.js';
import equalityExplorer from '../../equalityExplorer.js';
import ConstantTerm from '../model/ConstantTerm.js';
import UniversalOperation from '../model/UniversalOperation.js';
import VariableTerm from '../model/VariableTerm.js';
import ObjectPicker from './ObjectPicker.js';
import TranslateThenFade from './TranslateThenFade.js';
import UniversalOperationNode from './UniversalOperationNode.js';
import Range from '../../../../dot/js/Range.js';
import UniversalOperator from '../model/UniversalOperator.js';
import RectangularRadioButton from '../../../../sun/js/buttons/RectangularRadioButton.js';
export default class UniversalOperationControl extends HBox {
  // Tween animations that are running

  constructor(scene, animationLayer, providedOptions) {
    const options = optionize()({
      // SelfOptions
      timesZeroEnabled: true,
      // HBoxOptions
      spacing: 15
    }, providedOptions);

    // items for the radio buttons that are used to choose the operator
    const operatorItems = [];
    for (let i = 0; i < scene.operators.length; i++) {
      const operator = scene.operators[i];
      operatorItems.push({
        value: operator,
        createNode: () => UniversalOperationNode.createOperatorNode(operator),
        tandemName: `${operator.tandemName}${RectangularRadioButton.TANDEM_NAME_SUFFIX}`
      });
    }

    // radio buttons for selecting the operator
    const operatorRadioButtonGroup = new RectangularRadioButtonGroup(scene.operatorProperty, operatorItems, {
      orientation: 'horizontal',
      spacing: 2,
      touchAreaXDilation: 0,
      touchAreaYDilation: 15,
      radioButtonOptions: {
        baseColor: 'white',
        xMargin: 8,
        yMargin: 3,
        buttonAppearanceStrategyOptions: {
          selectedLineWidth: 2
        }
      },
      tandem: options.tandem.createTandem('operatorRadioButtonGroup')
    });

    /*
     * Adjusts the operand if it's not appropriate for a specified operator.
     */
    const operatorListener = operator => {
      const currentOperand = scene.operandProperty.value;
      if (isDivideByZero(operator, currentOperand) || !options.timesZeroEnabled && isTimesZero(operator, currentOperand)) {
        // If the operator would result in division or multiplication by zero, change the operand to 1.
        const adjustedOperand = _.find(scene.operands, operand => operand instanceof ConstantTerm && operand.constantValue.getValue() === 1);
        assert && assert(adjustedOperand, 'expected to find constant 1');
        scene.operandProperty.value = adjustedOperand;
      } else if (isUnsupportedVariableTermOperation(operator, currentOperand)) {
        // If the operator is not supported for a variable term operand, change the operand to
        // a constant term that has the same value as the variable term's coefficient.
        // E.g. if the operand is '5x', change the operand to '5'.
        assert && assert(currentOperand instanceof VariableTerm); // eslint-disable-line no-simple-type-checking-assertions
        const currentCoefficient = currentOperand.coefficient;
        const adjustedOperand = _.find(scene.operands, operand => operand instanceof ConstantTerm && operand.constantValue.equals(currentCoefficient));
        assert && assert(adjustedOperand, `expected to find constant ${currentCoefficient}`);
        scene.operandProperty.value = adjustedOperand;
      }
    };
    scene.operatorProperty.lazyLink(operatorListener);

    // items for the operand picker
    const operandItems = [];
    for (let i = 0; i < scene.operands.length; i++) {
      const operand = scene.operands[i];
      operandItems.push({
        value: operand,
        node: UniversalOperationNode.createOperandNode(operand)
      });
    }
    const operandPickerTandem = options.tandem.createTandem('operandPicker');

    // Take control of enabling up/down arrows for operand picker
    const incrementEnabledProperty = new BooleanProperty(true, {
      tandem: operandPickerTandem.createTandem('incrementEnabledProperty'),
      phetioReadOnly: true
    });
    const decrementEnabledProperty = new BooleanProperty(true, {
      tandem: operandPickerTandem.createTandem('decrementEnabledProperty'),
      phetioReadOnly: true
    });

    // picker for choosing operand
    const operandPicker = new ObjectPicker(scene.operandProperty, operandItems, {
      arrowsColor: 'black',
      gradientColor: 'rgb( 150, 150, 150 )',
      xMargin: 6,
      touchAreaXDilation: 0,
      touchAreaYDilation: 15,
      // Providing these Properties means that we're responsible for up/down enabled state
      incrementEnabledProperty: incrementEnabledProperty,
      decrementEnabledProperty: decrementEnabledProperty,
      // When the increment button is pressed, skip operands that are inappropriate for the operation
      incrementFunction: index => {
        let nextOperandIndex = index + 1;
        const operator = scene.operatorProperty.value;
        while (!isSupportedOperation(operator, scene.operands[nextOperandIndex], options.timesZeroEnabled)) {
          nextOperandIndex++;
          assert && assert(nextOperandIndex < scene.operands.length, `nextOperandIndex out of range: ${nextOperandIndex}`);
        }
        return nextOperandIndex;
      },
      // When the decrement button is pressed, skip operands that are inappropriate for the operation
      decrementFunction: index => {
        let nextOperandIndex = index - 1;
        const operator = scene.operatorProperty.value;
        while (!isSupportedOperation(operator, scene.operands[nextOperandIndex], options.timesZeroEnabled)) {
          nextOperandIndex--;
          assert && assert(nextOperandIndex >= 0, `nextOperandIndex out of range: ${nextOperandIndex}`);
        }
        return nextOperandIndex;
      },
      tandem: operandPickerTandem
    });

    // 'go' button, applies the operation
    const goButtonIcon = new Path(levelDownAltSolidShape, {
      fill: 'black',
      maxHeight: 0.5 * operandPicker.height // scale relative to the pickers
    });

    const goButton = new RoundPushButton({
      content: goButtonIcon,
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      xMargin: 10,
      yMargin: 10,
      touchAreaDilation: 5,
      tandem: options.tandem.createTandem('goButton')
    });
    assert && assert(!options.children, 'UniversalOperationControl sets children');
    options.children = [operatorRadioButtonGroup, operandPicker, goButton];
    super(options);

    // Adjust the enabled state of the operand picker's increment/decrement arrows.
    Multilink.multilink([scene.operatorProperty, scene.operandProperty], (operator, operand) => {
      const operandIndex = scene.operands.indexOf(operand);
      assert && assert(operandIndex !== -1, `operand not found: ${operand}`);
      if (operator === UniversalOperator.TIMES || operator === UniversalOperator.DIVIDE) {
        assert && assert(operand instanceof ConstantTerm, `unexpected operand type: ${operand}`); // eslint-disable-line no-simple-type-checking-assertions

        // increment arrow is enabled if there are any constant term operands above the current selection
        let incrementEnabled = false;
        for (let i = operandIndex + 1; i < scene.operands.length && !incrementEnabled; i++) {
          incrementEnabled = scene.operands[i] instanceof ConstantTerm;
        }
        incrementEnabledProperty.value = incrementEnabled;

        // down arrow is enabled if there are any constant term operands below the current selection
        let decrementEnabled = false;
        for (let i = operandIndex - 1; i >= 0 && !decrementEnabled; i--) {
          decrementEnabled = scene.operands[i] instanceof ConstantTerm;
        }
        decrementEnabledProperty.value = decrementEnabled;
      } else {
        // other operators are supported for all operands
        incrementEnabledProperty.value = operandIndex < operandItems.length - 1;
        decrementEnabledProperty.value = operandIndex > 0;
      }
    });
    this.animations = [];

    // Clean up when an animation completes or is stopped.
    const animationCleanup = (animation, operationNode) => {
      this.animations.splice(this.animations.indexOf(animation), 1);
      !operationNode.isDisposed && operationNode.dispose();
      goButton.enabled = true;
    };

    // When the 'go' button is pressed, animate operations, then apply operations to terms.
    const goButtonListener = () => {
      // Go button is disabled until the animation completes, so that students don't press the button rapid-fire.
      // See https://github.com/phetsims/equality-explorer/issues/48
      goButton.enabled = false;
      const operation = new UniversalOperation(scene.operatorProperty.value, scene.operandProperty.value); //TODO https://github.com/phetsims/equality-explorer/issues/200 dynamic
      phet.log && phet.log(`Go ${operation.toLogString()}`);

      // operation on left side
      const leftOperationNode = new UniversalOperationNode(operation, {
        //TODO https://github.com/phetsims/equality-explorer/issues/200 dynamic
        centerX: scene.scale.leftPlate.positionProperty.value.x,
        centerY: this.centerY
      });
      animationLayer.addChild(leftOperationNode);

      // operation on right side
      const rightOperationNode = new UniversalOperationNode(operation, {
        //TODO https://github.com/phetsims/equality-explorer/issues/200 dynamic
        centerX: scene.scale.rightPlate.positionProperty.value.x,
        centerY: this.centerY
      });
      animationLayer.addChild(rightOperationNode);

      // Apply the operation when both animations have completed.
      const numberOfAnimationsCompletedProperty = new NumberProperty(0, {
        //TODO https://github.com/phetsims/equality-explorer/issues/197 stateful animation?
        numberType: 'Integer',
        range: new Range(0, 2)
      });
      numberOfAnimationsCompletedProperty.lazyLink(numberOfAnimationsCompleted => {
        if (numberOfAnimationsCompleted === 2) {
          scene.applyOperation(operation);
        }
      });

      // animation on left side of the scale
      const leftAnimation = new TranslateThenFade(leftOperationNode, {
        //TODO https://github.com/phetsims/equality-explorer/issues/197 stateful animation?
        destination: new Vector2(leftOperationNode.x, scene.scale.leftPlate.getGridTop() - leftOperationNode.height),
        onComplete: () => {
          numberOfAnimationsCompletedProperty.value++;
          animationCleanup(leftAnimation, leftOperationNode);
        },
        onStop: () => {
          animationCleanup(leftAnimation, leftOperationNode);
        }
      });
      this.animations.push(leftAnimation);

      // animation on right side of the scale
      const rightAnimation = new TranslateThenFade(rightOperationNode, {
        //TODO https://github.com/phetsims/equality-explorer/issues/197 stateful animation?
        destination: new Vector2(rightOperationNode.x, scene.scale.rightPlate.getGridTop() - rightOperationNode.height),
        onComplete: () => {
          numberOfAnimationsCompletedProperty.value++;
          animationCleanup(rightAnimation, rightOperationNode);
        },
        onStop: () => {
          animationCleanup(rightAnimation, rightOperationNode);
        }
      });
      this.animations.push(rightAnimation);

      // start the animations
      leftAnimation.start();
      rightAnimation.start();
    };
    goButton.addListener(goButtonListener);

    // If the maxInteger limit is exceeded, stop all universal operations that are in progress
    const maxIntegerExceededListener = () => this.stopAnimations();
    scene.allTermCreators.forEach(termCreator => termCreator.maxIntegerExceededEmitter.addListener(maxIntegerExceededListener));
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }

  /**
   * Steps the animations.
   * @param dt - time step, in seconds
   */
  step(dt) {
    const animationsCopy = this.animations; // operate on a copy because step may modify the array
    animationsCopy.forEach(animation => animation.step(dt));
  }
  reset() {
    this.stopAnimations();
  }

  /**
   * Stops all animations that are in progress.
   */
  stopAnimations() {
    // Operate on a copy of the array, since animations remove themselves from the array when stopped.
    const arrayCopy = this.animations.slice(0);
    for (let i = 0; i < arrayCopy.length; i++) {
      arrayCopy[i].stop();
    }
  }
}

/**
 * Does this operation result in division by zero?
 */
function isDivideByZero(operator, operand) {
  return operator.symbol === MathSymbols.DIVIDE && operand instanceof ConstantTerm && operand.constantValue.getValue() === 0;
}

/**
 * Does this operation result in multiplication by zero?
 */
function isTimesZero(operator, operand) {
  return operator.symbol === MathSymbols.TIMES && operand instanceof ConstantTerm && operand.constantValue.getValue() === 0;
}

/**
 * Is the operation an attempt to do something that is unsupported with a variable term operand?
 * Times and divide are unsupported for variable term operands.
 */
function isUnsupportedVariableTermOperation(operator, operand) {
  return (operator.symbol === MathSymbols.TIMES || operator.symbol === MathSymbols.DIVIDE) && operand instanceof VariableTerm;
}

/**
 * Are the specified operator and operand a supported combination?
 * @param operator
 * @param operand
 * @param timesZeroEnabled - whether 'times 0' is a supported operation
 */
function isSupportedOperation(operator, operand, timesZeroEnabled) {
  return !isDivideByZero(operator, operand) && (timesZeroEnabled || !isTimesZero(operator, operand)) && !isUnsupportedVariableTermOperation(operator, operand);
}
equalityExplorer.register('UniversalOperationControl', UniversalOperationControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJvcHRpb25pemUiLCJNYXRoU3ltYm9scyIsIlBoZXRDb2xvclNjaGVtZSIsIkhCb3giLCJQYXRoIiwibGV2ZWxEb3duQWx0U29saWRTaGFwZSIsIlJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCIsIlJvdW5kUHVzaEJ1dHRvbiIsImVxdWFsaXR5RXhwbG9yZXIiLCJDb25zdGFudFRlcm0iLCJVbml2ZXJzYWxPcGVyYXRpb24iLCJWYXJpYWJsZVRlcm0iLCJPYmplY3RQaWNrZXIiLCJUcmFuc2xhdGVUaGVuRmFkZSIsIlVuaXZlcnNhbE9wZXJhdGlvbk5vZGUiLCJSYW5nZSIsIlVuaXZlcnNhbE9wZXJhdG9yIiwiUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbiIsIlVuaXZlcnNhbE9wZXJhdGlvbkNvbnRyb2wiLCJjb25zdHJ1Y3RvciIsInNjZW5lIiwiYW5pbWF0aW9uTGF5ZXIiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwidGltZXNaZXJvRW5hYmxlZCIsInNwYWNpbmciLCJvcGVyYXRvckl0ZW1zIiwiaSIsIm9wZXJhdG9ycyIsImxlbmd0aCIsIm9wZXJhdG9yIiwicHVzaCIsInZhbHVlIiwiY3JlYXRlTm9kZSIsImNyZWF0ZU9wZXJhdG9yTm9kZSIsInRhbmRlbU5hbWUiLCJUQU5ERU1fTkFNRV9TVUZGSVgiLCJvcGVyYXRvclJhZGlvQnV0dG9uR3JvdXAiLCJvcGVyYXRvclByb3BlcnR5Iiwib3JpZW50YXRpb24iLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJyYWRpb0J1dHRvbk9wdGlvbnMiLCJiYXNlQ29sb3IiLCJ4TWFyZ2luIiwieU1hcmdpbiIsImJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneU9wdGlvbnMiLCJzZWxlY3RlZExpbmVXaWR0aCIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsIm9wZXJhdG9yTGlzdGVuZXIiLCJjdXJyZW50T3BlcmFuZCIsIm9wZXJhbmRQcm9wZXJ0eSIsImlzRGl2aWRlQnlaZXJvIiwiaXNUaW1lc1plcm8iLCJhZGp1c3RlZE9wZXJhbmQiLCJfIiwiZmluZCIsIm9wZXJhbmRzIiwib3BlcmFuZCIsImNvbnN0YW50VmFsdWUiLCJnZXRWYWx1ZSIsImFzc2VydCIsImlzVW5zdXBwb3J0ZWRWYXJpYWJsZVRlcm1PcGVyYXRpb24iLCJjdXJyZW50Q29lZmZpY2llbnQiLCJjb2VmZmljaWVudCIsImVxdWFscyIsImxhenlMaW5rIiwib3BlcmFuZEl0ZW1zIiwibm9kZSIsImNyZWF0ZU9wZXJhbmROb2RlIiwib3BlcmFuZFBpY2tlclRhbmRlbSIsImluY3JlbWVudEVuYWJsZWRQcm9wZXJ0eSIsInBoZXRpb1JlYWRPbmx5IiwiZGVjcmVtZW50RW5hYmxlZFByb3BlcnR5Iiwib3BlcmFuZFBpY2tlciIsImFycm93c0NvbG9yIiwiZ3JhZGllbnRDb2xvciIsImluY3JlbWVudEZ1bmN0aW9uIiwiaW5kZXgiLCJuZXh0T3BlcmFuZEluZGV4IiwiaXNTdXBwb3J0ZWRPcGVyYXRpb24iLCJkZWNyZW1lbnRGdW5jdGlvbiIsImdvQnV0dG9uSWNvbiIsImZpbGwiLCJtYXhIZWlnaHQiLCJoZWlnaHQiLCJnb0J1dHRvbiIsImNvbnRlbnQiLCJCVVRUT05fWUVMTE9XIiwidG91Y2hBcmVhRGlsYXRpb24iLCJjaGlsZHJlbiIsIm11bHRpbGluayIsIm9wZXJhbmRJbmRleCIsImluZGV4T2YiLCJUSU1FUyIsIkRJVklERSIsImluY3JlbWVudEVuYWJsZWQiLCJkZWNyZW1lbnRFbmFibGVkIiwiYW5pbWF0aW9ucyIsImFuaW1hdGlvbkNsZWFudXAiLCJhbmltYXRpb24iLCJvcGVyYXRpb25Ob2RlIiwic3BsaWNlIiwiaXNEaXNwb3NlZCIsImRpc3Bvc2UiLCJlbmFibGVkIiwiZ29CdXR0b25MaXN0ZW5lciIsIm9wZXJhdGlvbiIsInBoZXQiLCJsb2ciLCJ0b0xvZ1N0cmluZyIsImxlZnRPcGVyYXRpb25Ob2RlIiwiY2VudGVyWCIsInNjYWxlIiwibGVmdFBsYXRlIiwicG9zaXRpb25Qcm9wZXJ0eSIsIngiLCJjZW50ZXJZIiwiYWRkQ2hpbGQiLCJyaWdodE9wZXJhdGlvbk5vZGUiLCJyaWdodFBsYXRlIiwibnVtYmVyT2ZBbmltYXRpb25zQ29tcGxldGVkUHJvcGVydHkiLCJudW1iZXJUeXBlIiwicmFuZ2UiLCJudW1iZXJPZkFuaW1hdGlvbnNDb21wbGV0ZWQiLCJhcHBseU9wZXJhdGlvbiIsImxlZnRBbmltYXRpb24iLCJkZXN0aW5hdGlvbiIsImdldEdyaWRUb3AiLCJvbkNvbXBsZXRlIiwib25TdG9wIiwicmlnaHRBbmltYXRpb24iLCJzdGFydCIsImFkZExpc3RlbmVyIiwibWF4SW50ZWdlckV4Y2VlZGVkTGlzdGVuZXIiLCJzdG9wQW5pbWF0aW9ucyIsImFsbFRlcm1DcmVhdG9ycyIsImZvckVhY2giLCJ0ZXJtQ3JlYXRvciIsIm1heEludGVnZXJFeGNlZWRlZEVtaXR0ZXIiLCJzdGVwIiwiZHQiLCJhbmltYXRpb25zQ29weSIsInJlc2V0IiwiYXJyYXlDb3B5Iiwic2xpY2UiLCJzdG9wIiwic3ltYm9sIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJVbml2ZXJzYWxPcGVyYXRpb25Db250cm9sLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSAndW5pdmVyc2FsIG9wZXJhdGlvbicgY29udHJvbCAoYXMgaXQncyByZWZlcnJlZCB0byBpbiB0aGUgZGVzaWduIGRvY3VtZW50KVxyXG4gKiBhbGxvd3MgdGhlIHVzZXIgdG8gYXBwbHkgYW4gb3BlcmF0aW9uIHRvIGJvdGggc2lkZXMgb2YgdGhlIHNjYWxlIGFuZCBlcXVhdGlvbi5cclxuICpcclxuICogU2luY2Ugc29tZSBjb21iaW5hdGlvbnMgb2Ygb3BlcmF0b3IgYW5kIG9wZXJhbmQgYXJlIG5vdCBzdXBwb3J0ZWQgKHNwZWNpZmljYWxseSBkaXZpc2lvbiBieSB6ZXJvLCBhbmRcclxuICogbXVsdGlwbGljYXRpb24gb3IgZGl2aXNpb24gYnkgdmFyaWFibGUgdGVybXMpIHRoZSBVWCBmb3IgdGhpcyBjb250cm9sIGlzIGNvbXBsZXgsIGFuZCBwb3RlbnRpYWxseSBjb25mdXNpbmcuXHJcbiAqXHJcbiAqIEZvciBoaXN0b3JpY2FsIGRpc2N1c3Npb24gYW5kIHNwZWNpZmljYXRpb25zLCBzZWU6XHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lcXVhbGl0eS1leHBsb3Jlci9pc3N1ZXMvNDVcclxuICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VxdWFsaXR5LWV4cGxvcmVyL2lzc3Vlcy83N1xyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbHMuanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBIQm94T3B0aW9ucywgTm9kZSwgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBsZXZlbERvd25BbHRTb2xpZFNoYXBlIGZyb20gJy4uLy4uLy4uLy4uL3NoZXJwYS9qcy9mb250YXdlc29tZS01L2xldmVsRG93bkFsdFNvbGlkU2hhcGUuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwLCB7IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cEl0ZW0gfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgUm91bmRQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JvdW5kUHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBlcXVhbGl0eUV4cGxvcmVyIGZyb20gJy4uLy4uL2VxdWFsaXR5RXhwbG9yZXIuanMnO1xyXG5pbXBvcnQgT3BlcmF0aW9uc1NjZW5lIGZyb20gJy4uLy4uL29wZXJhdGlvbnMvbW9kZWwvT3BlcmF0aW9uc1NjZW5lLmpzJztcclxuaW1wb3J0IENvbnN0YW50VGVybSBmcm9tICcuLi9tb2RlbC9Db25zdGFudFRlcm0uanMnO1xyXG5pbXBvcnQgVGVybSBmcm9tICcuLi9tb2RlbC9UZXJtLmpzJztcclxuaW1wb3J0IFVuaXZlcnNhbE9wZXJhdGlvbiwgeyBVbml2ZXJzYWxPcGVyYW5kIH0gZnJvbSAnLi4vbW9kZWwvVW5pdmVyc2FsT3BlcmF0aW9uLmpzJztcclxuaW1wb3J0IFZhcmlhYmxlVGVybSBmcm9tICcuLi9tb2RlbC9WYXJpYWJsZVRlcm0uanMnO1xyXG5pbXBvcnQgT2JqZWN0UGlja2VyLCB7IE9iamVjdFBpY2tlckl0ZW0gfSBmcm9tICcuL09iamVjdFBpY2tlci5qcyc7XHJcbmltcG9ydCBUcmFuc2xhdGVUaGVuRmFkZSBmcm9tICcuL1RyYW5zbGF0ZVRoZW5GYWRlLmpzJztcclxuaW1wb3J0IFVuaXZlcnNhbE9wZXJhdGlvbk5vZGUgZnJvbSAnLi9Vbml2ZXJzYWxPcGVyYXRpb25Ob2RlLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVbml2ZXJzYWxPcGVyYXRvciBmcm9tICcuLi9tb2RlbC9Vbml2ZXJzYWxPcGVyYXRvci5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclJhZGlvQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUmFkaW9CdXR0b24uanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICB0aW1lc1plcm9FbmFibGVkPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBpbmNsdWRlICd0aW1lcyAwJyBhcyBvbmUgb2YgdGhlIG9wZXJhdGlvbnNcclxufTtcclxuXHJcbnR5cGUgVW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxIQm94T3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbCBleHRlbmRzIEhCb3gge1xyXG5cclxuICAvLyBUd2VlbiBhbmltYXRpb25zIHRoYXQgYXJlIHJ1bm5pbmdcclxuICBwcml2YXRlIHJlYWRvbmx5IGFuaW1hdGlvbnM6IFRyYW5zbGF0ZVRoZW5GYWRlW107XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2NlbmU6IE9wZXJhdGlvbnNTY2VuZSwgYW5pbWF0aW9uTGF5ZXI6IE5vZGUsIHByb3ZpZGVkT3B0aW9ucz86IFVuaXZlcnNhbE9wZXJhdGlvbkNvbnRyb2xPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8VW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbE9wdGlvbnMsIFNlbGZPcHRpb25zLCBIQm94T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgdGltZXNaZXJvRW5hYmxlZDogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIEhCb3hPcHRpb25zXHJcbiAgICAgIHNwYWNpbmc6IDE1XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBpdGVtcyBmb3IgdGhlIHJhZGlvIGJ1dHRvbnMgdGhhdCBhcmUgdXNlZCB0byBjaG9vc2UgdGhlIG9wZXJhdG9yXHJcbiAgICBjb25zdCBvcGVyYXRvckl0ZW1zOiBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXBJdGVtPFVuaXZlcnNhbE9wZXJhdG9yPltdID0gW107XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzY2VuZS5vcGVyYXRvcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IG9wZXJhdG9yID0gc2NlbmUub3BlcmF0b3JzWyBpIF07XHJcbiAgICAgIG9wZXJhdG9ySXRlbXMucHVzaCgge1xyXG4gICAgICAgIHZhbHVlOiBvcGVyYXRvcixcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBVbml2ZXJzYWxPcGVyYXRpb25Ob2RlLmNyZWF0ZU9wZXJhdG9yTm9kZSggb3BlcmF0b3IgKSxcclxuICAgICAgICB0YW5kZW1OYW1lOiBgJHtvcGVyYXRvci50YW5kZW1OYW1lfSR7UmVjdGFuZ3VsYXJSYWRpb0J1dHRvbi5UQU5ERU1fTkFNRV9TVUZGSVh9YFxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmFkaW8gYnV0dG9ucyBmb3Igc2VsZWN0aW5nIHRoZSBvcGVyYXRvclxyXG4gICAgY29uc3Qgb3BlcmF0b3JSYWRpb0J1dHRvbkdyb3VwID0gbmV3IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCggc2NlbmUub3BlcmF0b3JQcm9wZXJ0eSwgb3BlcmF0b3JJdGVtcywge1xyXG4gICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxyXG4gICAgICBzcGFjaW5nOiAyLFxyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDAsXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMTUsXHJcbiAgICAgIHJhZGlvQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIGJhc2VDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICB4TWFyZ2luOiA4LFxyXG4gICAgICAgIHlNYXJnaW46IDMsXHJcbiAgICAgICAgYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9uczoge1xyXG4gICAgICAgICAgc2VsZWN0ZWRMaW5lV2lkdGg6IDJcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnb3BlcmF0b3JSYWRpb0J1dHRvbkdyb3VwJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLypcclxuICAgICAqIEFkanVzdHMgdGhlIG9wZXJhbmQgaWYgaXQncyBub3QgYXBwcm9wcmlhdGUgZm9yIGEgc3BlY2lmaWVkIG9wZXJhdG9yLlxyXG4gICAgICovXHJcbiAgICBjb25zdCBvcGVyYXRvckxpc3RlbmVyID0gKCBvcGVyYXRvcjogVW5pdmVyc2FsT3BlcmF0b3IgKSA9PiB7XHJcblxyXG4gICAgICBjb25zdCBjdXJyZW50T3BlcmFuZCA9IHNjZW5lLm9wZXJhbmRQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgIGlmICggaXNEaXZpZGVCeVplcm8oIG9wZXJhdG9yLCBjdXJyZW50T3BlcmFuZCApIHx8XHJcbiAgICAgICAgICAgKCAhb3B0aW9ucy50aW1lc1plcm9FbmFibGVkICYmIGlzVGltZXNaZXJvKCBvcGVyYXRvciwgY3VycmVudE9wZXJhbmQgKSApICkge1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgb3BlcmF0b3Igd291bGQgcmVzdWx0IGluIGRpdmlzaW9uIG9yIG11bHRpcGxpY2F0aW9uIGJ5IHplcm8sIGNoYW5nZSB0aGUgb3BlcmFuZCB0byAxLlxyXG4gICAgICAgIGNvbnN0IGFkanVzdGVkT3BlcmFuZCA9IF8uZmluZCggc2NlbmUub3BlcmFuZHMsXHJcbiAgICAgICAgICBvcGVyYW5kID0+ICggb3BlcmFuZCBpbnN0YW5jZW9mIENvbnN0YW50VGVybSApICYmICggb3BlcmFuZC5jb25zdGFudFZhbHVlLmdldFZhbHVlKCkgPT09IDEgKSApITtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhZGp1c3RlZE9wZXJhbmQsICdleHBlY3RlZCB0byBmaW5kIGNvbnN0YW50IDEnICk7XHJcbiAgICAgICAgc2NlbmUub3BlcmFuZFByb3BlcnR5LnZhbHVlID0gYWRqdXN0ZWRPcGVyYW5kO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBpc1Vuc3VwcG9ydGVkVmFyaWFibGVUZXJtT3BlcmF0aW9uKCBvcGVyYXRvciwgY3VycmVudE9wZXJhbmQgKSApIHtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIG9wZXJhdG9yIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIGEgdmFyaWFibGUgdGVybSBvcGVyYW5kLCBjaGFuZ2UgdGhlIG9wZXJhbmQgdG9cclxuICAgICAgICAvLyBhIGNvbnN0YW50IHRlcm0gdGhhdCBoYXMgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIHZhcmlhYmxlIHRlcm0ncyBjb2VmZmljaWVudC5cclxuICAgICAgICAvLyBFLmcuIGlmIHRoZSBvcGVyYW5kIGlzICc1eCcsIGNoYW5nZSB0aGUgb3BlcmFuZCB0byAnNScuXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggY3VycmVudE9wZXJhbmQgaW5zdGFuY2VvZiBWYXJpYWJsZVRlcm0gKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zaW1wbGUtdHlwZS1jaGVja2luZy1hc3NlcnRpb25zXHJcbiAgICAgICAgY29uc3QgY3VycmVudENvZWZmaWNpZW50ID0gKCBjdXJyZW50T3BlcmFuZCBhcyBWYXJpYWJsZVRlcm0gKS5jb2VmZmljaWVudDtcclxuICAgICAgICBjb25zdCBhZGp1c3RlZE9wZXJhbmQgPSBfLmZpbmQoIHNjZW5lLm9wZXJhbmRzLFxyXG4gICAgICAgICAgb3BlcmFuZCA9PiAoIG9wZXJhbmQgaW5zdGFuY2VvZiBDb25zdGFudFRlcm0gKSAmJiBvcGVyYW5kLmNvbnN0YW50VmFsdWUuZXF1YWxzKCBjdXJyZW50Q29lZmZpY2llbnQgKSApITtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhZGp1c3RlZE9wZXJhbmQsIGBleHBlY3RlZCB0byBmaW5kIGNvbnN0YW50ICR7Y3VycmVudENvZWZmaWNpZW50fWAgKTtcclxuICAgICAgICBzY2VuZS5vcGVyYW5kUHJvcGVydHkudmFsdWUgPSBhZGp1c3RlZE9wZXJhbmQ7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgc2NlbmUub3BlcmF0b3JQcm9wZXJ0eS5sYXp5TGluayggb3BlcmF0b3JMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIGl0ZW1zIGZvciB0aGUgb3BlcmFuZCBwaWNrZXJcclxuICAgIGNvbnN0IG9wZXJhbmRJdGVtczogT2JqZWN0UGlja2VySXRlbTxVbml2ZXJzYWxPcGVyYW5kPltdID0gW107XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzY2VuZS5vcGVyYW5kcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3Qgb3BlcmFuZCA9IHNjZW5lLm9wZXJhbmRzWyBpIF07XHJcbiAgICAgIG9wZXJhbmRJdGVtcy5wdXNoKCB7XHJcbiAgICAgICAgdmFsdWU6IG9wZXJhbmQsXHJcbiAgICAgICAgbm9kZTogVW5pdmVyc2FsT3BlcmF0aW9uTm9kZS5jcmVhdGVPcGVyYW5kTm9kZSggb3BlcmFuZCApXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBvcGVyYW5kUGlja2VyVGFuZGVtID0gb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnb3BlcmFuZFBpY2tlcicgKTtcclxuXHJcbiAgICAvLyBUYWtlIGNvbnRyb2wgb2YgZW5hYmxpbmcgdXAvZG93biBhcnJvd3MgZm9yIG9wZXJhbmQgcGlja2VyXHJcbiAgICBjb25zdCBpbmNyZW1lbnRFbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogb3BlcmFuZFBpY2tlclRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbmNyZW1lbnRFbmFibGVkUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBkZWNyZW1lbnRFbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogb3BlcmFuZFBpY2tlclRhbmRlbS5jcmVhdGVUYW5kZW0oICdkZWNyZW1lbnRFbmFibGVkUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcGlja2VyIGZvciBjaG9vc2luZyBvcGVyYW5kXHJcbiAgICBjb25zdCBvcGVyYW5kUGlja2VyID0gbmV3IE9iamVjdFBpY2tlciggc2NlbmUub3BlcmFuZFByb3BlcnR5LCBvcGVyYW5kSXRlbXMsIHtcclxuICAgICAgYXJyb3dzQ29sb3I6ICdibGFjaycsXHJcbiAgICAgIGdyYWRpZW50Q29sb3I6ICdyZ2IoIDE1MCwgMTUwLCAxNTAgKScsXHJcbiAgICAgIHhNYXJnaW46IDYsXHJcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMCxcclxuICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiAxNSxcclxuXHJcbiAgICAgIC8vIFByb3ZpZGluZyB0aGVzZSBQcm9wZXJ0aWVzIG1lYW5zIHRoYXQgd2UncmUgcmVzcG9uc2libGUgZm9yIHVwL2Rvd24gZW5hYmxlZCBzdGF0ZVxyXG4gICAgICBpbmNyZW1lbnRFbmFibGVkUHJvcGVydHk6IGluY3JlbWVudEVuYWJsZWRQcm9wZXJ0eSxcclxuICAgICAgZGVjcmVtZW50RW5hYmxlZFByb3BlcnR5OiBkZWNyZW1lbnRFbmFibGVkUHJvcGVydHksXHJcblxyXG4gICAgICAvLyBXaGVuIHRoZSBpbmNyZW1lbnQgYnV0dG9uIGlzIHByZXNzZWQsIHNraXAgb3BlcmFuZHMgdGhhdCBhcmUgaW5hcHByb3ByaWF0ZSBmb3IgdGhlIG9wZXJhdGlvblxyXG4gICAgICBpbmNyZW1lbnRGdW5jdGlvbjogaW5kZXggPT4ge1xyXG4gICAgICAgIGxldCBuZXh0T3BlcmFuZEluZGV4ID0gaW5kZXggKyAxO1xyXG4gICAgICAgIGNvbnN0IG9wZXJhdG9yID0gc2NlbmUub3BlcmF0b3JQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICB3aGlsZSAoICFpc1N1cHBvcnRlZE9wZXJhdGlvbiggb3BlcmF0b3IsIHNjZW5lLm9wZXJhbmRzWyBuZXh0T3BlcmFuZEluZGV4IF0sIG9wdGlvbnMudGltZXNaZXJvRW5hYmxlZCApICkge1xyXG4gICAgICAgICAgbmV4dE9wZXJhbmRJbmRleCsrO1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbmV4dE9wZXJhbmRJbmRleCA8IHNjZW5lLm9wZXJhbmRzLmxlbmd0aCxcclxuICAgICAgICAgICAgYG5leHRPcGVyYW5kSW5kZXggb3V0IG9mIHJhbmdlOiAke25leHRPcGVyYW5kSW5kZXh9YCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV4dE9wZXJhbmRJbmRleDtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFdoZW4gdGhlIGRlY3JlbWVudCBidXR0b24gaXMgcHJlc3NlZCwgc2tpcCBvcGVyYW5kcyB0aGF0IGFyZSBpbmFwcHJvcHJpYXRlIGZvciB0aGUgb3BlcmF0aW9uXHJcbiAgICAgIGRlY3JlbWVudEZ1bmN0aW9uOiBpbmRleCA9PiB7XHJcbiAgICAgICAgbGV0IG5leHRPcGVyYW5kSW5kZXggPSBpbmRleCAtIDE7XHJcbiAgICAgICAgY29uc3Qgb3BlcmF0b3IgPSBzY2VuZS5vcGVyYXRvclByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgIHdoaWxlICggIWlzU3VwcG9ydGVkT3BlcmF0aW9uKCBvcGVyYXRvciwgc2NlbmUub3BlcmFuZHNbIG5leHRPcGVyYW5kSW5kZXggXSwgb3B0aW9ucy50aW1lc1plcm9FbmFibGVkICkgKSB7XHJcbiAgICAgICAgICBuZXh0T3BlcmFuZEluZGV4LS07XHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBuZXh0T3BlcmFuZEluZGV4ID49IDAsIGBuZXh0T3BlcmFuZEluZGV4IG91dCBvZiByYW5nZTogJHtuZXh0T3BlcmFuZEluZGV4fWAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5leHRPcGVyYW5kSW5kZXg7XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogb3BlcmFuZFBpY2tlclRhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vICdnbycgYnV0dG9uLCBhcHBsaWVzIHRoZSBvcGVyYXRpb25cclxuICAgIGNvbnN0IGdvQnV0dG9uSWNvbiA9IG5ldyBQYXRoKCBsZXZlbERvd25BbHRTb2xpZFNoYXBlLCB7XHJcbiAgICAgIGZpbGw6ICdibGFjaycsXHJcbiAgICAgIG1heEhlaWdodDogMC41ICogb3BlcmFuZFBpY2tlci5oZWlnaHQgLy8gc2NhbGUgcmVsYXRpdmUgdG8gdGhlIHBpY2tlcnNcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGdvQnV0dG9uID0gbmV3IFJvdW5kUHVzaEJ1dHRvbigge1xyXG4gICAgICBjb250ZW50OiBnb0J1dHRvbkljb24sXHJcbiAgICAgIGJhc2VDb2xvcjogUGhldENvbG9yU2NoZW1lLkJVVFRPTl9ZRUxMT1csXHJcbiAgICAgIHhNYXJnaW46IDEwLFxyXG4gICAgICB5TWFyZ2luOiAxMCxcclxuICAgICAgdG91Y2hBcmVhRGlsYXRpb246IDUsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZ29CdXR0b24nIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5jaGlsZHJlbiwgJ1VuaXZlcnNhbE9wZXJhdGlvbkNvbnRyb2wgc2V0cyBjaGlsZHJlbicgKTtcclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIG9wZXJhdG9yUmFkaW9CdXR0b25Hcm91cCwgb3BlcmFuZFBpY2tlciwgZ29CdXR0b24gXTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEFkanVzdCB0aGUgZW5hYmxlZCBzdGF0ZSBvZiB0aGUgb3BlcmFuZCBwaWNrZXIncyBpbmNyZW1lbnQvZGVjcmVtZW50IGFycm93cy5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgc2NlbmUub3BlcmF0b3JQcm9wZXJ0eSwgc2NlbmUub3BlcmFuZFByb3BlcnR5IF0sXHJcbiAgICAgICggb3BlcmF0b3IsIG9wZXJhbmQgKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IG9wZXJhbmRJbmRleCA9IHNjZW5lLm9wZXJhbmRzLmluZGV4T2YoIG9wZXJhbmQgKTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcGVyYW5kSW5kZXggIT09IC0xLCBgb3BlcmFuZCBub3QgZm91bmQ6ICR7b3BlcmFuZH1gICk7XHJcblxyXG4gICAgICAgIGlmICggKCBvcGVyYXRvciA9PT0gVW5pdmVyc2FsT3BlcmF0b3IuVElNRVMgfHwgb3BlcmF0b3IgPT09IFVuaXZlcnNhbE9wZXJhdG9yLkRJVklERSApICkge1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3BlcmFuZCBpbnN0YW5jZW9mIENvbnN0YW50VGVybSwgYHVuZXhwZWN0ZWQgb3BlcmFuZCB0eXBlOiAke29wZXJhbmR9YCApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNpbXBsZS10eXBlLWNoZWNraW5nLWFzc2VydGlvbnNcclxuXHJcbiAgICAgICAgICAvLyBpbmNyZW1lbnQgYXJyb3cgaXMgZW5hYmxlZCBpZiB0aGVyZSBhcmUgYW55IGNvbnN0YW50IHRlcm0gb3BlcmFuZHMgYWJvdmUgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXHJcbiAgICAgICAgICBsZXQgaW5jcmVtZW50RW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgZm9yICggbGV0IGkgPSBvcGVyYW5kSW5kZXggKyAxOyBpIDwgc2NlbmUub3BlcmFuZHMubGVuZ3RoICYmICFpbmNyZW1lbnRFbmFibGVkOyBpKysgKSB7XHJcbiAgICAgICAgICAgIGluY3JlbWVudEVuYWJsZWQgPSAoIHNjZW5lLm9wZXJhbmRzWyBpIF0gaW5zdGFuY2VvZiBDb25zdGFudFRlcm0gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGluY3JlbWVudEVuYWJsZWRQcm9wZXJ0eS52YWx1ZSA9IGluY3JlbWVudEVuYWJsZWQ7XHJcblxyXG4gICAgICAgICAgLy8gZG93biBhcnJvdyBpcyBlbmFibGVkIGlmIHRoZXJlIGFyZSBhbnkgY29uc3RhbnQgdGVybSBvcGVyYW5kcyBiZWxvdyB0aGUgY3VycmVudCBzZWxlY3Rpb25cclxuICAgICAgICAgIGxldCBkZWNyZW1lbnRFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICBmb3IgKCBsZXQgaSA9IG9wZXJhbmRJbmRleCAtIDE7IGkgPj0gMCAmJiAhZGVjcmVtZW50RW5hYmxlZDsgaS0tICkge1xyXG4gICAgICAgICAgICBkZWNyZW1lbnRFbmFibGVkID0gKCBzY2VuZS5vcGVyYW5kc1sgaSBdIGluc3RhbmNlb2YgQ29uc3RhbnRUZXJtICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBkZWNyZW1lbnRFbmFibGVkUHJvcGVydHkudmFsdWUgPSBkZWNyZW1lbnRFbmFibGVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBvdGhlciBvcGVyYXRvcnMgYXJlIHN1cHBvcnRlZCBmb3IgYWxsIG9wZXJhbmRzXHJcbiAgICAgICAgICBpbmNyZW1lbnRFbmFibGVkUHJvcGVydHkudmFsdWUgPSAoIG9wZXJhbmRJbmRleCA8IG9wZXJhbmRJdGVtcy5sZW5ndGggLSAxICk7XHJcbiAgICAgICAgICBkZWNyZW1lbnRFbmFibGVkUHJvcGVydHkudmFsdWUgPSAoIG9wZXJhbmRJbmRleCA+IDAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFuaW1hdGlvbnMgPSBbXTtcclxuXHJcbiAgICAvLyBDbGVhbiB1cCB3aGVuIGFuIGFuaW1hdGlvbiBjb21wbGV0ZXMgb3IgaXMgc3RvcHBlZC5cclxuICAgIGNvbnN0IGFuaW1hdGlvbkNsZWFudXAgPSAoIGFuaW1hdGlvbjogVHJhbnNsYXRlVGhlbkZhZGUsIG9wZXJhdGlvbk5vZGU6IFVuaXZlcnNhbE9wZXJhdGlvbk5vZGUgKSA9PiB7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9ucy5zcGxpY2UoIHRoaXMuYW5pbWF0aW9ucy5pbmRleE9mKCBhbmltYXRpb24gKSwgMSApO1xyXG4gICAgICAhb3BlcmF0aW9uTm9kZS5pc0Rpc3Bvc2VkICYmIG9wZXJhdGlvbk5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICBnb0J1dHRvbi5lbmFibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgJ2dvJyBidXR0b24gaXMgcHJlc3NlZCwgYW5pbWF0ZSBvcGVyYXRpb25zLCB0aGVuIGFwcGx5IG9wZXJhdGlvbnMgdG8gdGVybXMuXHJcbiAgICBjb25zdCBnb0J1dHRvbkxpc3RlbmVyID0gKCkgPT4ge1xyXG5cclxuICAgICAgLy8gR28gYnV0dG9uIGlzIGRpc2FibGVkIHVudGlsIHRoZSBhbmltYXRpb24gY29tcGxldGVzLCBzbyB0aGF0IHN0dWRlbnRzIGRvbid0IHByZXNzIHRoZSBidXR0b24gcmFwaWQtZmlyZS5cclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lcXVhbGl0eS1leHBsb3Jlci9pc3N1ZXMvNDhcclxuICAgICAgZ29CdXR0b24uZW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgY29uc3Qgb3BlcmF0aW9uID0gbmV3IFVuaXZlcnNhbE9wZXJhdGlvbiggc2NlbmUub3BlcmF0b3JQcm9wZXJ0eS52YWx1ZSwgc2NlbmUub3BlcmFuZFByb3BlcnR5LnZhbHVlICk7IC8vVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzIwMCBkeW5hbWljXHJcbiAgICAgIHBoZXQubG9nICYmIHBoZXQubG9nKCBgR28gJHtvcGVyYXRpb24udG9Mb2dTdHJpbmcoKX1gICk7XHJcblxyXG4gICAgICAvLyBvcGVyYXRpb24gb24gbGVmdCBzaWRlXHJcbiAgICAgIGNvbnN0IGxlZnRPcGVyYXRpb25Ob2RlID0gbmV3IFVuaXZlcnNhbE9wZXJhdGlvbk5vZGUoIG9wZXJhdGlvbiwgeyAvL1RPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VxdWFsaXR5LWV4cGxvcmVyL2lzc3Vlcy8yMDAgZHluYW1pY1xyXG4gICAgICAgIGNlbnRlclg6IHNjZW5lLnNjYWxlLmxlZnRQbGF0ZS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLngsXHJcbiAgICAgICAgY2VudGVyWTogdGhpcy5jZW50ZXJZXHJcbiAgICAgIH0gKTtcclxuICAgICAgYW5pbWF0aW9uTGF5ZXIuYWRkQ2hpbGQoIGxlZnRPcGVyYXRpb25Ob2RlICk7XHJcblxyXG4gICAgICAvLyBvcGVyYXRpb24gb24gcmlnaHQgc2lkZVxyXG4gICAgICBjb25zdCByaWdodE9wZXJhdGlvbk5vZGUgPSBuZXcgVW5pdmVyc2FsT3BlcmF0aW9uTm9kZSggb3BlcmF0aW9uLCB7IC8vVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzIwMCBkeW5hbWljXHJcbiAgICAgICAgY2VudGVyWDogc2NlbmUuc2NhbGUucmlnaHRQbGF0ZS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLngsXHJcbiAgICAgICAgY2VudGVyWTogdGhpcy5jZW50ZXJZXHJcbiAgICAgIH0gKTtcclxuICAgICAgYW5pbWF0aW9uTGF5ZXIuYWRkQ2hpbGQoIHJpZ2h0T3BlcmF0aW9uTm9kZSApO1xyXG5cclxuICAgICAgLy8gQXBwbHkgdGhlIG9wZXJhdGlvbiB3aGVuIGJvdGggYW5pbWF0aW9ucyBoYXZlIGNvbXBsZXRlZC5cclxuICAgICAgY29uc3QgbnVtYmVyT2ZBbmltYXRpb25zQ29tcGxldGVkUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHsgLy9UT0RPIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lcXVhbGl0eS1leHBsb3Jlci9pc3N1ZXMvMTk3IHN0YXRlZnVsIGFuaW1hdGlvbj9cclxuICAgICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXHJcbiAgICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMiApXHJcbiAgICAgIH0gKTtcclxuICAgICAgbnVtYmVyT2ZBbmltYXRpb25zQ29tcGxldGVkUHJvcGVydHkubGF6eUxpbmsoIG51bWJlck9mQW5pbWF0aW9uc0NvbXBsZXRlZCA9PiB7XHJcbiAgICAgICAgaWYgKCBudW1iZXJPZkFuaW1hdGlvbnNDb21wbGV0ZWQgPT09IDIgKSB7XHJcbiAgICAgICAgICBzY2VuZS5hcHBseU9wZXJhdGlvbiggb3BlcmF0aW9uICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBhbmltYXRpb24gb24gbGVmdCBzaWRlIG9mIHRoZSBzY2FsZVxyXG4gICAgICBjb25zdCBsZWZ0QW5pbWF0aW9uID0gbmV3IFRyYW5zbGF0ZVRoZW5GYWRlKCBsZWZ0T3BlcmF0aW9uTm9kZSwgeyAvL1RPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VxdWFsaXR5LWV4cGxvcmVyL2lzc3Vlcy8xOTcgc3RhdGVmdWwgYW5pbWF0aW9uP1xyXG4gICAgICAgIGRlc3RpbmF0aW9uOiBuZXcgVmVjdG9yMiggbGVmdE9wZXJhdGlvbk5vZGUueCwgc2NlbmUuc2NhbGUubGVmdFBsYXRlLmdldEdyaWRUb3AoKSAtIGxlZnRPcGVyYXRpb25Ob2RlLmhlaWdodCApLFxyXG4gICAgICAgIG9uQ29tcGxldGU6ICgpID0+IHtcclxuICAgICAgICAgIG51bWJlck9mQW5pbWF0aW9uc0NvbXBsZXRlZFByb3BlcnR5LnZhbHVlKys7XHJcbiAgICAgICAgICBhbmltYXRpb25DbGVhbnVwKCBsZWZ0QW5pbWF0aW9uLCBsZWZ0T3BlcmF0aW9uTm9kZSApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25TdG9wOiAoKSA9PiB7XHJcbiAgICAgICAgICBhbmltYXRpb25DbGVhbnVwKCBsZWZ0QW5pbWF0aW9uLCBsZWZ0T3BlcmF0aW9uTm9kZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFuaW1hdGlvbnMucHVzaCggbGVmdEFuaW1hdGlvbiApO1xyXG5cclxuICAgICAgLy8gYW5pbWF0aW9uIG9uIHJpZ2h0IHNpZGUgb2YgdGhlIHNjYWxlXHJcbiAgICAgIGNvbnN0IHJpZ2h0QW5pbWF0aW9uID0gbmV3IFRyYW5zbGF0ZVRoZW5GYWRlKCByaWdodE9wZXJhdGlvbk5vZGUsIHsgLy9UT0RPIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lcXVhbGl0eS1leHBsb3Jlci9pc3N1ZXMvMTk3IHN0YXRlZnVsIGFuaW1hdGlvbj9cclxuICAgICAgICBkZXN0aW5hdGlvbjogbmV3IFZlY3RvcjIoIHJpZ2h0T3BlcmF0aW9uTm9kZS54LCBzY2VuZS5zY2FsZS5yaWdodFBsYXRlLmdldEdyaWRUb3AoKSAtIHJpZ2h0T3BlcmF0aW9uTm9kZS5oZWlnaHQgKSxcclxuICAgICAgICBvbkNvbXBsZXRlOiAoKSA9PiB7XHJcbiAgICAgICAgICBudW1iZXJPZkFuaW1hdGlvbnNDb21wbGV0ZWRQcm9wZXJ0eS52YWx1ZSsrO1xyXG4gICAgICAgICAgYW5pbWF0aW9uQ2xlYW51cCggcmlnaHRBbmltYXRpb24sIHJpZ2h0T3BlcmF0aW9uTm9kZSApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25TdG9wOiAoKSA9PiB7XHJcbiAgICAgICAgICBhbmltYXRpb25DbGVhbnVwKCByaWdodEFuaW1hdGlvbiwgcmlnaHRPcGVyYXRpb25Ob2RlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9ucy5wdXNoKCByaWdodEFuaW1hdGlvbiApO1xyXG5cclxuICAgICAgLy8gc3RhcnQgdGhlIGFuaW1hdGlvbnNcclxuICAgICAgbGVmdEFuaW1hdGlvbi5zdGFydCgpO1xyXG4gICAgICByaWdodEFuaW1hdGlvbi5zdGFydCgpO1xyXG4gICAgfTtcclxuICAgIGdvQnV0dG9uLmFkZExpc3RlbmVyKCBnb0J1dHRvbkxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gSWYgdGhlIG1heEludGVnZXIgbGltaXQgaXMgZXhjZWVkZWQsIHN0b3AgYWxsIHVuaXZlcnNhbCBvcGVyYXRpb25zIHRoYXQgYXJlIGluIHByb2dyZXNzXHJcbiAgICBjb25zdCBtYXhJbnRlZ2VyRXhjZWVkZWRMaXN0ZW5lciA9ICgpID0+IHRoaXMuc3RvcEFuaW1hdGlvbnMoKTtcclxuICAgIHNjZW5lLmFsbFRlcm1DcmVhdG9ycy5mb3JFYWNoKCB0ZXJtQ3JlYXRvciA9PlxyXG4gICAgICB0ZXJtQ3JlYXRvci5tYXhJbnRlZ2VyRXhjZWVkZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBtYXhJbnRlZ2VyRXhjZWVkZWRMaXN0ZW5lciApICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcHMgdGhlIGFuaW1hdGlvbnMuXHJcbiAgICogQHBhcmFtIGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgcHVibGljIHN0ZXAoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBjb25zdCBhbmltYXRpb25zQ29weSA9IHRoaXMuYW5pbWF0aW9uczsgLy8gb3BlcmF0ZSBvbiBhIGNvcHkgYmVjYXVzZSBzdGVwIG1heSBtb2RpZnkgdGhlIGFycmF5XHJcbiAgICBhbmltYXRpb25zQ29weS5mb3JFYWNoKCBhbmltYXRpb24gPT4gYW5pbWF0aW9uLnN0ZXAoIGR0ICkgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuc3RvcEFuaW1hdGlvbnMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0b3BzIGFsbCBhbmltYXRpb25zIHRoYXQgYXJlIGluIHByb2dyZXNzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdG9wQW5pbWF0aW9ucygpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBPcGVyYXRlIG9uIGEgY29weSBvZiB0aGUgYXJyYXksIHNpbmNlIGFuaW1hdGlvbnMgcmVtb3ZlIHRoZW1zZWx2ZXMgZnJvbSB0aGUgYXJyYXkgd2hlbiBzdG9wcGVkLlxyXG4gICAgY29uc3QgYXJyYXlDb3B5ID0gdGhpcy5hbmltYXRpb25zLnNsaWNlKCAwICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhcnJheUNvcHkubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGFycmF5Q29weVsgaSBdLnN0b3AoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEb2VzIHRoaXMgb3BlcmF0aW9uIHJlc3VsdCBpbiBkaXZpc2lvbiBieSB6ZXJvP1xyXG4gKi9cclxuZnVuY3Rpb24gaXNEaXZpZGVCeVplcm8oIG9wZXJhdG9yOiBVbml2ZXJzYWxPcGVyYXRvciwgb3BlcmFuZDogVGVybSApOiBib29sZWFuIHtcclxuICByZXR1cm4gKCBvcGVyYXRvci5zeW1ib2wgPT09IE1hdGhTeW1ib2xzLkRJVklERSApICYmXHJcbiAgICAgICAgICggb3BlcmFuZCBpbnN0YW5jZW9mIENvbnN0YW50VGVybSAmJiBvcGVyYW5kLmNvbnN0YW50VmFsdWUuZ2V0VmFsdWUoKSA9PT0gMCApO1xyXG59XHJcblxyXG4vKipcclxuICogRG9lcyB0aGlzIG9wZXJhdGlvbiByZXN1bHQgaW4gbXVsdGlwbGljYXRpb24gYnkgemVybz9cclxuICovXHJcbmZ1bmN0aW9uIGlzVGltZXNaZXJvKCBvcGVyYXRvcjogVW5pdmVyc2FsT3BlcmF0b3IsIG9wZXJhbmQ6IFRlcm0gKTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuICggb3BlcmF0b3Iuc3ltYm9sID09PSBNYXRoU3ltYm9scy5USU1FUyApICYmXHJcbiAgICAgICAgICggb3BlcmFuZCBpbnN0YW5jZW9mIENvbnN0YW50VGVybSAmJiBvcGVyYW5kLmNvbnN0YW50VmFsdWUuZ2V0VmFsdWUoKSA9PT0gMCApO1xyXG59XHJcblxyXG4vKipcclxuICogSXMgdGhlIG9wZXJhdGlvbiBhbiBhdHRlbXB0IHRvIGRvIHNvbWV0aGluZyB0aGF0IGlzIHVuc3VwcG9ydGVkIHdpdGggYSB2YXJpYWJsZSB0ZXJtIG9wZXJhbmQ/XHJcbiAqIFRpbWVzIGFuZCBkaXZpZGUgYXJlIHVuc3VwcG9ydGVkIGZvciB2YXJpYWJsZSB0ZXJtIG9wZXJhbmRzLlxyXG4gKi9cclxuZnVuY3Rpb24gaXNVbnN1cHBvcnRlZFZhcmlhYmxlVGVybU9wZXJhdGlvbiggb3BlcmF0b3I6IFVuaXZlcnNhbE9wZXJhdG9yLCBvcGVyYW5kOiBUZXJtICk6IGJvb2xlYW4ge1xyXG4gIHJldHVybiAoIG9wZXJhdG9yLnN5bWJvbCA9PT0gTWF0aFN5bWJvbHMuVElNRVMgfHwgb3BlcmF0b3Iuc3ltYm9sID09PSBNYXRoU3ltYm9scy5ESVZJREUgKSAmJlxyXG4gICAgICAgICAoIG9wZXJhbmQgaW5zdGFuY2VvZiBWYXJpYWJsZVRlcm0gKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFyZSB0aGUgc3BlY2lmaWVkIG9wZXJhdG9yIGFuZCBvcGVyYW5kIGEgc3VwcG9ydGVkIGNvbWJpbmF0aW9uP1xyXG4gKiBAcGFyYW0gb3BlcmF0b3JcclxuICogQHBhcmFtIG9wZXJhbmRcclxuICogQHBhcmFtIHRpbWVzWmVyb0VuYWJsZWQgLSB3aGV0aGVyICd0aW1lcyAwJyBpcyBhIHN1cHBvcnRlZCBvcGVyYXRpb25cclxuICovXHJcbmZ1bmN0aW9uIGlzU3VwcG9ydGVkT3BlcmF0aW9uKCBvcGVyYXRvcjogVW5pdmVyc2FsT3BlcmF0b3IsIG9wZXJhbmQ6IFRlcm0sIHRpbWVzWmVyb0VuYWJsZWQ6IGJvb2xlYW4gKTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuICFpc0RpdmlkZUJ5WmVybyggb3BlcmF0b3IsIG9wZXJhbmQgKSAmJlxyXG4gICAgICAgICAoIHRpbWVzWmVyb0VuYWJsZWQgfHwgIWlzVGltZXNaZXJvKCBvcGVyYXRvciwgb3BlcmFuZCApICkgJiZcclxuICAgICAgICAgIWlzVW5zdXBwb3J0ZWRWYXJpYWJsZVRlcm1PcGVyYXRpb24oIG9wZXJhdG9yLCBvcGVyYW5kICk7XHJcbn1cclxuXHJcbmVxdWFsaXR5RXhwbG9yZXIucmVnaXN0ZXIoICdVbml2ZXJzYWxPcGVyYXRpb25Db250cm9sJywgVW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxTQUFTLE1BQU0sdUNBQXVDO0FBRTdELE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLGdEQUFnRDtBQUM1RSxTQUFTQyxJQUFJLEVBQXFCQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ2pGLE9BQU9D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