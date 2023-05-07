// Copyright 2022-2023, University of Colorado Boulder

/**
 * NumberPicker is a UI component for picking a number value from a range.
 * This is actually a number spinner, but PhET refers to it as a 'picker', so that's what this class is named.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StringUnionProperty from '../../axon/js/StringUnionProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import Property from '../../axon/js/Property.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import Utils from '../../dot/js/Utils.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import { Color, FireListener, FocusHighlightPath, LinearGradient, Node, PaintColorProperty, Path, Rectangle, SceneryConstants, Text } from '../../scenery/js/imports.js';
import AccessibleNumberSpinner from '../../sun/js/accessibility/AccessibleNumberSpinner.js';
import generalBoundaryBoopSoundPlayer from '../../tambo/js/shared-sound-players/generalBoundaryBoopSoundPlayer.js';
import generalSoftClickSoundPlayer from '../../tambo/js/shared-sound-players/generalSoftClickSoundPlayer.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import sun from './sun.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import MathSymbols from '../../scenery-phet/js/MathSymbols.js';
const ButtonStateValues = ['up', 'down', 'over', 'out'];

// options to NumberPicker.createIcon

export default class NumberPicker extends AccessibleNumberSpinner(Node, 0) {
  /**
   * @param valueProperty
   * @param rangeProperty - If the range is anticipated to change, it's best to have the range Property contain the
   * (maximum) union of all potential changes, so that NumberPicker can iterate through all possible values and compute
   * the bounds of the labels.
   * @param [providedOptions]
   */
  constructor(valueProperty, rangeProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      color: new Color(0, 0, 255),
      backgroundColor: 'white',
      cornerRadius: 6,
      xMargin: 3,
      yMargin: 3,
      decimalPlaces: 0,
      font: new PhetFont(24),
      incrementFunction: value => value + 1,
      decrementFunction: value => value - 1,
      timerDelay: 400,
      timerInterval: 100,
      noValueString: MathSymbols.NO_VALUE,
      align: 'center',
      touchAreaXDilation: 10,
      touchAreaYDilation: 10,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 5,
      backgroundStroke: 'gray',
      backgroundLineWidth: 0.5,
      arrowHeight: 6,
      arrowYSpacing: 3,
      arrowStroke: 'black',
      arrowLineWidth: 0.25,
      valueMaxWidth: null,
      onInput: _.noop,
      incrementEnabledFunction: (value, range) => value !== null && value !== undefined && value < range.max,
      decrementEnabledFunction: (value, range) => value !== null && value !== undefined && value > range.min,
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,
      valueChangedSoundPlayer: generalSoftClickSoundPlayer,
      boundarySoundPlayer: generalBoundaryBoopSoundPlayer,
      // ParentOptions
      cursor: 'pointer',
      valueProperty: valueProperty,
      enabledRangeProperty: rangeProperty,
      pageKeyboardStep: 2,
      voicingObjectResponse: () => valueProperty.value,
      // by default, just speak the value

      // phet-io
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Picker',
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly,
      visiblePropertyOptions: {
        phetioFeatured: true
      },
      phetioEnabledPropertyInstrumented: true
    }, providedOptions);
    if (!options.formatValue) {
      options.formatValue = value => Utils.toFixed(value, options.decimalPlaces);
    }

    // Color of arrows and top/bottom gradient when pressed
    let colorProperty = null;
    if (options.pressedColor === undefined) {
      colorProperty = new PaintColorProperty(options.color); // dispose required!

      // No reference needs to be kept, since we dispose its dependency.
      options.pressedColor = new DerivedProperty([colorProperty], color => color.darkerColor());
    }
    let previousValue = valueProperty.value;

    // Overwrite the passed-in onInput listener to make sure that sound implementation can't be blown away in the
    // defaults.
    const providedOnInputListener = options.onInput;
    options.onInput = () => {
      providedOnInputListener();

      // The onInput listener may be called when no change to the value has actually happened, see
      // https://github.com/phetsims/sun/issues/760.  We do some checks here to make sure the sound is only generated
      // when a change occurs.
      if (valueProperty.value !== previousValue) {
        // Play the boundary sound If the value is at min or max, otherwise play the default sound.
        if (valueProperty.value === rangeProperty.get().max || valueProperty.value === rangeProperty.get().min) {
          options.boundarySoundPlayer.play();
        } else {
          options.valueChangedSoundPlayer.play();
        }
      }
      previousValue = valueProperty.value;
    };
    assert && assert(!options.keyboardStep, 'NumberPicker sets its own keyboardStep');
    assert && assert(!options.shiftKeyboardStep, 'NumberPicker sets its own shiftKeyboardStep');

    // AccessibleNumberSpinner options that depend on other options.
    // Initialize accessibility features. This must reach into incrementFunction to get the delta.
    // Both normal arrow and shift arrow keys use the delta computed with incrementFunction.
    const keyboardStep = options.incrementFunction(valueProperty.get()) - valueProperty.get();
    options.keyboardStep = keyboardStep;
    options.shiftKeyboardStep = keyboardStep;
    const boundsRequiredOptionKeys = _.pick(options, Node.REQUIRES_BOUNDS_OPTION_KEYS);
    super(_.omit(options, Node.REQUIRES_BOUNDS_OPTION_KEYS));

    //------------------------------------------------------------
    // Properties

    const incrementButtonStateProperty = new StringUnionProperty('up', {
      validValues: ButtonStateValues
    });
    const decrementButtonStateProperty = new StringUnionProperty('down', {
      validValues: ButtonStateValues
    });

    // must be disposed
    const incrementEnabledProperty = new DerivedProperty([valueProperty, rangeProperty], options.incrementEnabledFunction);

    // must be disposed
    const decrementEnabledProperty = new DerivedProperty([valueProperty, rangeProperty], options.decrementEnabledFunction);

    //------------------------------------------------------------
    // Nodes

    // displays the value
    const valueNode = new Text('', {
      font: options.font,
      pickable: false
    });

    // compute max width of text based on the width of all possible values.
    // See https://github.com/phetsims/area-model-common/issues/5
    let currentSampleValue = rangeProperty.get().min;
    const sampleValues = [];
    while (currentSampleValue <= rangeProperty.get().max) {
      sampleValues.push(currentSampleValue);
      currentSampleValue = options.incrementFunction(currentSampleValue);
      assert && assert(sampleValues.length < 500000, 'Don\'t infinite loop here');
    }
    let maxWidth = Math.max.apply(null, sampleValues.map(value => {
      valueNode.string = options.formatValue(value);
      return valueNode.width;
    }));
    // Cap the maxWidth if valueMaxWidth is provided, see https://github.com/phetsims/scenery-phet/issues/297
    if (options.valueMaxWidth !== null) {
      maxWidth = Math.min(maxWidth, options.valueMaxWidth);
    }

    // compute shape of the background behind the numeric value
    const backgroundWidth = maxWidth + 2 * options.xMargin;
    const backgroundHeight = valueNode.height + 2 * options.yMargin;
    const backgroundOverlap = 1;
    const backgroundCornerRadius = options.cornerRadius;

    // Apply the max-width AFTER computing the backgroundHeight, so it doesn't shrink vertically
    valueNode.maxWidth = maxWidth;

    // Top half of the background. Pressing here will increment the value.
    // Shape computed starting at upper-left, going clockwise.
    const incrementBackgroundNode = new Path(new Shape().arc(backgroundCornerRadius, backgroundCornerRadius, backgroundCornerRadius, Math.PI, Math.PI * 3 / 2, false).arc(backgroundWidth - backgroundCornerRadius, backgroundCornerRadius, backgroundCornerRadius, -Math.PI / 2, 0, false).lineTo(backgroundWidth, backgroundHeight / 2 + backgroundOverlap).lineTo(0, backgroundHeight / 2 + backgroundOverlap).close(), {
      pickable: false
    });

    // Bottom half of the background. Pressing here will decrement the value.
    // Shape computed starting at bottom-right, going clockwise.
    const decrementBackgroundNode = new Path(new Shape().arc(backgroundWidth - backgroundCornerRadius, backgroundHeight - backgroundCornerRadius, backgroundCornerRadius, 0, Math.PI / 2, false).arc(backgroundCornerRadius, backgroundHeight - backgroundCornerRadius, backgroundCornerRadius, Math.PI / 2, Math.PI, false).lineTo(0, backgroundHeight / 2).lineTo(backgroundWidth, backgroundHeight / 2).close(), {
      pickable: false
    });

    // separate rectangle for stroke around value background
    const strokedBackground = new Rectangle(0, 0, backgroundWidth, backgroundHeight, backgroundCornerRadius, backgroundCornerRadius, {
      pickable: false,
      stroke: options.backgroundStroke,
      lineWidth: options.backgroundLineWidth
    });

    // compute size of arrows
    const arrowButtonSize = new Dimension2(0.5 * backgroundWidth, options.arrowHeight);
    const arrowOptions = {
      stroke: options.arrowStroke,
      lineWidth: options.arrowLineWidth,
      pickable: false
    };

    // increment arrow, pointing up, described clockwise from tip
    this.incrementArrow = new Path(new Shape().moveTo(arrowButtonSize.width / 2, 0).lineTo(arrowButtonSize.width, arrowButtonSize.height).lineTo(0, arrowButtonSize.height).close(), arrowOptions);
    this.incrementArrow.centerX = incrementBackgroundNode.centerX;
    this.incrementArrow.bottom = incrementBackgroundNode.top - options.arrowYSpacing;

    // decrement arrow, pointing down, described clockwise from the tip
    this.decrementArrow = new Path(new Shape().moveTo(arrowButtonSize.width / 2, arrowButtonSize.height).lineTo(0, 0).lineTo(arrowButtonSize.width, 0).close(), arrowOptions);
    this.decrementArrow.centerX = decrementBackgroundNode.centerX;
    this.decrementArrow.top = decrementBackgroundNode.bottom + options.arrowYSpacing;

    // parents for increment and decrement components
    const incrementParent = new Node({
      children: [incrementBackgroundNode, this.incrementArrow]
    });
    incrementParent.addChild(new Rectangle(incrementParent.localBounds)); // invisible overlay
    const decrementParent = new Node({
      children: [decrementBackgroundNode, this.decrementArrow]
    });
    decrementParent.addChild(new Rectangle(decrementParent.localBounds)); // invisible overlay

    // rendering order
    this.addChild(incrementParent);
    this.addChild(decrementParent);
    this.addChild(strokedBackground);
    this.addChild(valueNode);

    //------------------------------------------------------------
    // Pointer areas

    // touch areas
    incrementParent.touchArea = Shape.rectangle(incrementParent.left - options.touchAreaXDilation / 2, incrementParent.top - options.touchAreaYDilation, incrementParent.width + options.touchAreaXDilation, incrementParent.height + options.touchAreaYDilation);
    decrementParent.touchArea = Shape.rectangle(decrementParent.left - options.touchAreaXDilation / 2, decrementParent.top, decrementParent.width + options.touchAreaXDilation, decrementParent.height + options.touchAreaYDilation);

    // mouse areas
    incrementParent.mouseArea = Shape.rectangle(incrementParent.left - options.mouseAreaXDilation / 2, incrementParent.top - options.mouseAreaYDilation, incrementParent.width + options.mouseAreaXDilation, incrementParent.height + options.mouseAreaYDilation);
    decrementParent.mouseArea = Shape.rectangle(decrementParent.left - options.mouseAreaXDilation / 2, decrementParent.top, decrementParent.width + options.mouseAreaXDilation, decrementParent.height + options.mouseAreaYDilation);

    //------------------------------------------------------------
    // Colors

    // arrow colors, corresponding to ButtonState and incrementEnabledProperty/decrementEnabledProperty
    const arrowColors = {
      up: options.color,
      over: options.color,
      down: options.pressedColor,
      out: options.color,
      disabled: 'rgb(176,176,176)'
    };

    // background colors, corresponding to ButtonState and enabledProperty.value
    const highlightGradient = createVerticalGradient(options.color, options.backgroundColor, options.color, backgroundHeight);
    const pressedGradient = createVerticalGradient(options.pressedColor, options.backgroundColor, options.pressedColor, backgroundHeight);
    const backgroundColors = {
      up: options.backgroundColor,
      over: highlightGradient,
      down: pressedGradient,
      out: pressedGradient,
      disabled: options.backgroundColor
    };

    //------------------------------------------------------------
    // Observers and InputListeners

    const inputListenerOptions = {
      fireOnHold: true,
      fireOnHoldDelay: options.timerDelay,
      fireOnHoldInterval: options.timerInterval
    };
    this.incrementInputListener = new NumberPickerInputListener(incrementButtonStateProperty, combineOptions({
      tandem: options.tandem.createTandem('incrementInputListener'),
      fire: event => {
        valueProperty.set(Math.min(options.incrementFunction(valueProperty.get()), rangeProperty.get().max));
        options.onInput(event);

        // voicing - speak the object/context responses on value change from user input
        this.voicingSpeakFullResponse({
          nameResponse: null,
          hintResponse: null
        });
      }
    }, inputListenerOptions));
    incrementParent.addInputListener(this.incrementInputListener);
    this.decrementInputListener = new NumberPickerInputListener(decrementButtonStateProperty, combineOptions({
      tandem: options.tandem.createTandem('decrementInputListener'),
      fire: event => {
        valueProperty.set(Math.max(options.decrementFunction(valueProperty.get()), rangeProperty.get().min));
        options.onInput(event);

        // voicing - speak the object/context responses on value change from user input
        this.voicingSpeakFullResponse({
          nameResponse: null,
          hintResponse: null
        });
      }
    }, inputListenerOptions));
    decrementParent.addInputListener(this.decrementInputListener);

    // enable/disable listeners and interaction: unlink unnecessary, Properties are owned by this instance
    incrementEnabledProperty.link(enabled => {
      !enabled && this.incrementInputListener.interrupt();
      incrementParent.pickable = enabled;
    });
    decrementEnabledProperty.link(enabled => {
      !enabled && this.decrementInputListener.interrupt();
      decrementParent.pickable = enabled;
    });

    // Update text to match the value
    const valueObserver = value => {
      if (value === null || value === undefined) {
        valueNode.string = options.noValueString;
        valueNode.x = (backgroundWidth - valueNode.width) / 2; // horizontally centered
      } else {
        valueNode.string = options.formatValue(value);
        if (options.align === 'center') {
          valueNode.centerX = incrementBackgroundNode.centerX;
        } else if (options.align === 'right') {
          valueNode.right = incrementBackgroundNode.right - options.xMargin;
        } else if (options.align === 'left') {
          valueNode.left = incrementBackgroundNode.left + options.xMargin;
        } else {
          throw new Error(`unsupported value for options.align: ${options.align}`);
        }
      }
      valueNode.centerY = backgroundHeight / 2;
    };
    valueProperty.link(valueObserver); // must be unlinked in dispose

    // Update colors for increment components.  No dispose is needed since dependencies are locally owned.
    Multilink.multilink([incrementButtonStateProperty, incrementEnabledProperty], (state, enabled) => {
      updateColors(state, enabled, incrementBackgroundNode, this.incrementArrow, backgroundColors, arrowColors);
    });

    // Update colors for decrement components.  No dispose is needed since dependencies are locally owned.
    Multilink.multilink([decrementButtonStateProperty, decrementEnabledProperty], (state, enabled) => {
      updateColors(state, enabled, decrementBackgroundNode, this.decrementArrow, backgroundColors, arrowColors);
    });

    // Dilate based on consistent technique which brings into account transform of this node.
    const focusBounds = this.localBounds.dilated(FocusHighlightPath.getDilationCoefficient(this));

    // pdom - custom focus highlight that matches rounded background behind the numeric value
    this.focusHighlight = new FocusHighlightPath(Shape.roundedRectangleWithRadii(focusBounds.minX, focusBounds.minY, focusBounds.width, focusBounds.height, {
      topLeft: options.cornerRadius,
      topRight: options.cornerRadius,
      bottomLeft: options.cornerRadius,
      bottomRight: options.cornerRadius
    }));

    // update style with keyboard input, Emitters owned by this instance and disposed in AccessibleNumberSpinner
    this.incrementDownEmitter.addListener(isDown => {
      incrementButtonStateProperty.value = isDown ? 'down' : 'up';
    });
    this.decrementDownEmitter.addListener(isDown => {
      decrementButtonStateProperty.value = isDown ? 'down' : 'up';
    });
    this.addLinkedElement(valueProperty, {
      tandem: options.tandem.createTandem('valueProperty')
    });

    // Mutate options that require bounds after we have children
    this.mutate(boundsRequiredOptionKeys);
    this.disposeNumberPicker = () => {
      colorProperty && colorProperty.dispose();
      incrementEnabledProperty.dispose();
      decrementEnabledProperty.dispose();
      if (valueProperty.hasListener(valueObserver)) {
        valueProperty.unlink(valueObserver);
      }
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('scenery-phet', 'NumberPicker', this);
  }
  static createIcon(value, providedOptions) {
    const options = optionize()({
      // Highlight the increment button
      highlightIncrement: false,
      // Highlight the decrement button
      highlightDecrement: false,
      range: new Range(value - 1, value + 1),
      numberPickerOptions: {
        pickable: false,
        // phet-io
        tandem: Tandem.OPT_OUT // by default, icons don't need instrumentation
      }
    }, providedOptions);
    const numberPicker = new NumberPicker(new NumberProperty(value), new Property(options.range), options.numberPickerOptions);

    // we don't want this icon to have keyboard navigation, or description in the PDOM.
    numberPicker.removeFromPDOM();
    if (options.highlightDecrement) {
      numberPicker.decrementInputListener.isOverProperty.value = true;
    }
    if (options.highlightIncrement) {
      numberPicker.incrementInputListener.isOverProperty.value = true;
    }
    return numberPicker;
  }
  dispose() {
    this.disposeNumberPicker();
    super.dispose();
  }

  /**
   * Sets visibility of the arrows.
   */
  setArrowsVisible(visible) {
    if (!visible) {
      this.incrementInputListener.interrupt();
      this.decrementInputListener.interrupt();
    }
    this.incrementArrow.visible = visible;
    this.decrementArrow.visible = visible;
  }
}
/**
 * Converts FireListener events to state changes.
 */
class NumberPickerInputListener extends FireListener {
  constructor(buttonStateProperty, options) {
    super(options);

    // Update the button state.  No dispose is needed because the parent class disposes the dependencies.
    Multilink.multilink([this.isOverProperty, this.isPressedProperty], (isOver, isPressed) => {
      buttonStateProperty.set(isOver && !isPressed ? 'over' : isOver && isPressed ? 'down' : !isOver && !isPressed ? 'up' : 'out');
    });
  }
}

/**
 * Creates a vertical gradient.
 */
function createVerticalGradient(topColor, centerColor, bottomColor, height) {
  return new LinearGradient(0, 0, 0, height).addColorStop(0, topColor).addColorStop(0.5, centerColor).addColorStop(1, bottomColor);
}

/**
 * Updates arrow and background colors
 */
function updateColors(buttonState, enabled, backgroundNode, arrowNode, backgroundColors, arrowColors) {
  if (enabled) {
    arrowNode.stroke = 'black';
    if (buttonState === 'up') {
      backgroundNode.fill = backgroundColors.up;
      arrowNode.fill = arrowColors.up;
    } else if (buttonState === 'over') {
      backgroundNode.fill = backgroundColors.over;
      arrowNode.fill = arrowColors.over;
    } else if (buttonState === 'down') {
      backgroundNode.fill = backgroundColors.down;
      arrowNode.fill = arrowColors.down;
    } else if (buttonState === 'out') {
      backgroundNode.fill = backgroundColors.out;
      arrowNode.fill = arrowColors.out;
    } else {
      throw new Error(`unsupported buttonState: ${buttonState}`);
    }
  } else {
    backgroundNode.fill = backgroundColors.disabled;
    arrowNode.fill = arrowColors.disabled;
    arrowNode.stroke = arrowColors.disabled; // stroke so that arrow size will look the same when it's enabled/disabled
  }
}

sun.register('NumberPicker', NumberPicker);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdVbmlvblByb3BlcnR5IiwiRGVyaXZlZFByb3BlcnR5IiwiTXVsdGlsaW5rIiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJSYW5nZSIsIlV0aWxzIiwiU2hhcGUiLCJJbnN0YW5jZVJlZ2lzdHJ5IiwiQ29sb3IiLCJGaXJlTGlzdGVuZXIiLCJGb2N1c0hpZ2hsaWdodFBhdGgiLCJMaW5lYXJHcmFkaWVudCIsIk5vZGUiLCJQYWludENvbG9yUHJvcGVydHkiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiU2NlbmVyeUNvbnN0YW50cyIsIlRleHQiLCJBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lciIsImdlbmVyYWxCb3VuZGFyeUJvb3BTb3VuZFBsYXllciIsImdlbmVyYWxTb2Z0Q2xpY2tTb3VuZFBsYXllciIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwic3VuIiwiUGhldEZvbnQiLCJNYXRoU3ltYm9scyIsIkJ1dHRvblN0YXRlVmFsdWVzIiwiTnVtYmVyUGlja2VyIiwiY29uc3RydWN0b3IiLCJ2YWx1ZVByb3BlcnR5IiwicmFuZ2VQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJjb2xvciIsImJhY2tncm91bmRDb2xvciIsImNvcm5lclJhZGl1cyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiZGVjaW1hbFBsYWNlcyIsImZvbnQiLCJpbmNyZW1lbnRGdW5jdGlvbiIsInZhbHVlIiwiZGVjcmVtZW50RnVuY3Rpb24iLCJ0aW1lckRlbGF5IiwidGltZXJJbnRlcnZhbCIsIm5vVmFsdWVTdHJpbmciLCJOT19WQUxVRSIsImFsaWduIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwibW91c2VBcmVhWERpbGF0aW9uIiwibW91c2VBcmVhWURpbGF0aW9uIiwiYmFja2dyb3VuZFN0cm9rZSIsImJhY2tncm91bmRMaW5lV2lkdGgiLCJhcnJvd0hlaWdodCIsImFycm93WVNwYWNpbmciLCJhcnJvd1N0cm9rZSIsImFycm93TGluZVdpZHRoIiwidmFsdWVNYXhXaWR0aCIsIm9uSW5wdXQiLCJfIiwibm9vcCIsImluY3JlbWVudEVuYWJsZWRGdW5jdGlvbiIsInJhbmdlIiwidW5kZWZpbmVkIiwibWF4IiwiZGVjcmVtZW50RW5hYmxlZEZ1bmN0aW9uIiwibWluIiwiZGlzYWJsZWRPcGFjaXR5IiwiRElTQUJMRURfT1BBQ0lUWSIsInZhbHVlQ2hhbmdlZFNvdW5kUGxheWVyIiwiYm91bmRhcnlTb3VuZFBsYXllciIsImN1cnNvciIsImVuYWJsZWRSYW5nZVByb3BlcnR5IiwicGFnZUtleWJvYXJkU3RlcCIsInZvaWNpbmdPYmplY3RSZXNwb25zZSIsInRhbmRlbSIsIlJFUVVJUkVEIiwidGFuZGVtTmFtZVN1ZmZpeCIsInBoZXRpb1JlYWRPbmx5IiwiREVGQVVMVF9PUFRJT05TIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb0ZlYXR1cmVkIiwicGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwiZm9ybWF0VmFsdWUiLCJ0b0ZpeGVkIiwiY29sb3JQcm9wZXJ0eSIsInByZXNzZWRDb2xvciIsImRhcmtlckNvbG9yIiwicHJldmlvdXNWYWx1ZSIsInByb3ZpZGVkT25JbnB1dExpc3RlbmVyIiwiZ2V0IiwicGxheSIsImFzc2VydCIsImtleWJvYXJkU3RlcCIsInNoaWZ0S2V5Ym9hcmRTdGVwIiwiYm91bmRzUmVxdWlyZWRPcHRpb25LZXlzIiwicGljayIsIlJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZUyIsIm9taXQiLCJpbmNyZW1lbnRCdXR0b25TdGF0ZVByb3BlcnR5IiwidmFsaWRWYWx1ZXMiLCJkZWNyZW1lbnRCdXR0b25TdGF0ZVByb3BlcnR5IiwiaW5jcmVtZW50RW5hYmxlZFByb3BlcnR5IiwiZGVjcmVtZW50RW5hYmxlZFByb3BlcnR5IiwidmFsdWVOb2RlIiwicGlja2FibGUiLCJjdXJyZW50U2FtcGxlVmFsdWUiLCJzYW1wbGVWYWx1ZXMiLCJwdXNoIiwibGVuZ3RoIiwibWF4V2lkdGgiLCJNYXRoIiwiYXBwbHkiLCJtYXAiLCJzdHJpbmciLCJ3aWR0aCIsImJhY2tncm91bmRXaWR0aCIsImJhY2tncm91bmRIZWlnaHQiLCJoZWlnaHQiLCJiYWNrZ3JvdW5kT3ZlcmxhcCIsImJhY2tncm91bmRDb3JuZXJSYWRpdXMiLCJpbmNyZW1lbnRCYWNrZ3JvdW5kTm9kZSIsImFyYyIsIlBJIiwibGluZVRvIiwiY2xvc2UiLCJkZWNyZW1lbnRCYWNrZ3JvdW5kTm9kZSIsInN0cm9rZWRCYWNrZ3JvdW5kIiwic3Ryb2tlIiwibGluZVdpZHRoIiwiYXJyb3dCdXR0b25TaXplIiwiYXJyb3dPcHRpb25zIiwiaW5jcmVtZW50QXJyb3ciLCJtb3ZlVG8iLCJjZW50ZXJYIiwiYm90dG9tIiwidG9wIiwiZGVjcmVtZW50QXJyb3ciLCJpbmNyZW1lbnRQYXJlbnQiLCJjaGlsZHJlbiIsImFkZENoaWxkIiwibG9jYWxCb3VuZHMiLCJkZWNyZW1lbnRQYXJlbnQiLCJ0b3VjaEFyZWEiLCJyZWN0YW5nbGUiLCJsZWZ0IiwibW91c2VBcmVhIiwiYXJyb3dDb2xvcnMiLCJ1cCIsIm92ZXIiLCJkb3duIiwib3V0IiwiZGlzYWJsZWQiLCJoaWdobGlnaHRHcmFkaWVudCIsImNyZWF0ZVZlcnRpY2FsR3JhZGllbnQiLCJwcmVzc2VkR3JhZGllbnQiLCJiYWNrZ3JvdW5kQ29sb3JzIiwiaW5wdXRMaXN0ZW5lck9wdGlvbnMiLCJmaXJlT25Ib2xkIiwiZmlyZU9uSG9sZERlbGF5IiwiZmlyZU9uSG9sZEludGVydmFsIiwiaW5jcmVtZW50SW5wdXRMaXN0ZW5lciIsIk51bWJlclBpY2tlcklucHV0TGlzdGVuZXIiLCJjcmVhdGVUYW5kZW0iLCJmaXJlIiwiZXZlbnQiLCJzZXQiLCJ2b2ljaW5nU3BlYWtGdWxsUmVzcG9uc2UiLCJuYW1lUmVzcG9uc2UiLCJoaW50UmVzcG9uc2UiLCJhZGRJbnB1dExpc3RlbmVyIiwiZGVjcmVtZW50SW5wdXRMaXN0ZW5lciIsImxpbmsiLCJlbmFibGVkIiwiaW50ZXJydXB0IiwidmFsdWVPYnNlcnZlciIsIngiLCJyaWdodCIsIkVycm9yIiwiY2VudGVyWSIsIm11bHRpbGluayIsInN0YXRlIiwidXBkYXRlQ29sb3JzIiwiZm9jdXNCb3VuZHMiLCJkaWxhdGVkIiwiZ2V0RGlsYXRpb25Db2VmZmljaWVudCIsImZvY3VzSGlnaGxpZ2h0Iiwicm91bmRlZFJlY3RhbmdsZVdpdGhSYWRpaSIsIm1pblgiLCJtaW5ZIiwidG9wTGVmdCIsInRvcFJpZ2h0IiwiYm90dG9tTGVmdCIsImJvdHRvbVJpZ2h0IiwiaW5jcmVtZW50RG93bkVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImlzRG93biIsImRlY3JlbWVudERvd25FbWl0dGVyIiwiYWRkTGlua2VkRWxlbWVudCIsIm11dGF0ZSIsImRpc3Bvc2VOdW1iZXJQaWNrZXIiLCJkaXNwb3NlIiwiaGFzTGlzdGVuZXIiLCJ1bmxpbmsiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsImNyZWF0ZUljb24iLCJoaWdobGlnaHRJbmNyZW1lbnQiLCJoaWdobGlnaHREZWNyZW1lbnQiLCJudW1iZXJQaWNrZXJPcHRpb25zIiwiT1BUX09VVCIsIm51bWJlclBpY2tlciIsInJlbW92ZUZyb21QRE9NIiwiaXNPdmVyUHJvcGVydHkiLCJzZXRBcnJvd3NWaXNpYmxlIiwidmlzaWJsZSIsImJ1dHRvblN0YXRlUHJvcGVydHkiLCJpc1ByZXNzZWRQcm9wZXJ0eSIsImlzT3ZlciIsImlzUHJlc3NlZCIsInRvcENvbG9yIiwiY2VudGVyQ29sb3IiLCJib3R0b21Db2xvciIsImFkZENvbG9yU3RvcCIsImJ1dHRvblN0YXRlIiwiYmFja2dyb3VuZE5vZGUiLCJhcnJvd05vZGUiLCJmaWxsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOdW1iZXJQaWNrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTnVtYmVyUGlja2VyIGlzIGEgVUkgY29tcG9uZW50IGZvciBwaWNraW5nIGEgbnVtYmVyIHZhbHVlIGZyb20gYSByYW5nZS5cclxuICogVGhpcyBpcyBhY3R1YWxseSBhIG51bWJlciBzcGlubmVyLCBidXQgUGhFVCByZWZlcnMgdG8gaXQgYXMgYSAncGlja2VyJywgc28gdGhhdCdzIHdoYXQgdGhpcyBjbGFzcyBpcyBuYW1lZC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgU3RyaW5nVW5pb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1N0cmluZ1VuaW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIEZpcmVMaXN0ZW5lciwgRmlyZUxpc3RlbmVyT3B0aW9ucywgRm9jdXNIaWdobGlnaHRQYXRoLCBGb250LCBUQ29sb3IsIExpbmVhckdyYWRpZW50LCBOb2RlLCBOb2RlT3B0aW9ucywgUGFpbnRDb2xvclByb3BlcnR5LCBQYXRoLCBSZWN0YW5nbGUsIFNjZW5lcnlDb25zdGFudHMsIFNjZW5lcnlFdmVudCwgVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lciwgeyBBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lck9wdGlvbnMgfSBmcm9tICcuLi8uLi9zdW4vanMvYWNjZXNzaWJpbGl0eS9BY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lci5qcyc7XHJcbmltcG9ydCBnZW5lcmFsQm91bmRhcnlCb29wU291bmRQbGF5ZXIgZnJvbSAnLi4vLi4vdGFtYm8vanMvc2hhcmVkLXNvdW5kLXBsYXllcnMvZ2VuZXJhbEJvdW5kYXJ5Qm9vcFNvdW5kUGxheWVyLmpzJztcclxuaW1wb3J0IGdlbmVyYWxTb2Z0Q2xpY2tTb3VuZFBsYXllciBmcm9tICcuLi8uLi90YW1iby9qcy9zaGFyZWQtc291bmQtcGxheWVycy9nZW5lcmFsU29mdENsaWNrU291bmRQbGF5ZXIuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0IGZyb20gJy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUU291bmRQbGF5ZXIgZnJvbSAnLi4vLi4vdGFtYm8vanMvVFNvdW5kUGxheWVyLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBzdW4gZnJvbSAnLi9zdW4uanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IE1hdGhTeW1ib2xzIGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRoU3ltYm9scy5qcyc7XHJcblxyXG5jb25zdCBCdXR0b25TdGF0ZVZhbHVlcyA9IFsgJ3VwJywgJ2Rvd24nLCAnb3ZlcicsICdvdXQnIF0gYXMgY29uc3Q7XHJcbnR5cGUgQnV0dG9uU3RhdGUgPSAoIHR5cGVvZiBCdXR0b25TdGF0ZVZhbHVlcyApW251bWJlcl07XHJcblxyXG50eXBlIEFsaWduID0gJ2NlbnRlcicgfCAnbGVmdCcgfCAncmlnaHQnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBjb2xvcj86IFRDb2xvcjsgLy8gY29sb3Igb2YgYXJyb3dzIGFuZCB0b3AvYm90dG9tIGdyYWRpZW50IG9uIHBvaW50ZXIgb3ZlclxyXG4gIHByZXNzZWRDb2xvcj86IFRDb2xvcjsgLy8gY29sb3Igb2YgYXJyb3dzIGFuZCB0b3AvYm90dG9tIGdyYWRpZW50IHdoZW4gcHJlc3NlZCwgZGVyaXZlZCBpZiBub3QgcHJvdmlkZWRcclxuICBiYWNrZ3JvdW5kQ29sb3I/OiBUQ29sb3I7IC8vIGNvbG9yIG9mIHRoZSBiYWNrZ3JvdW5kIHdoZW4gcG9pbnRlciBpcyBub3Qgb3ZlciBpdFxyXG4gIGNvcm5lclJhZGl1cz86IG51bWJlcjtcclxuICB4TWFyZ2luPzogbnVtYmVyO1xyXG4gIHlNYXJnaW4/OiBudW1iZXI7XHJcbiAgZGVjaW1hbFBsYWNlcz86IG51bWJlcjtcclxuICBmb250PzogRm9udDtcclxuICBpbmNyZW1lbnRGdW5jdGlvbj86ICggdmFsdWU6IG51bWJlciApID0+IG51bWJlcjtcclxuICBkZWNyZW1lbnRGdW5jdGlvbj86ICggdmFsdWU6IG51bWJlciApID0+IG51bWJlcjtcclxuICB0aW1lckRlbGF5PzogbnVtYmVyOyAvLyBzdGFydCB0byBmaXJlIGNvbnRpbnVvdXNseSBhZnRlciBwcmVzc2luZyBmb3IgdGhpcyBsb25nIChtaWxsaXNlY29uZHMpXHJcbiAgdGltZXJJbnRlcnZhbD86IG51bWJlcjsgLy8gZmlyZSBjb250aW51b3VzbHkgYXQgdGhpcyBmcmVxdWVuY3kgKG1pbGxpc2Vjb25kcyksXHJcbiAgbm9WYWx1ZVN0cmluZz86IHN0cmluZzsgLy8gc3RyaW5nIHRvIGRpc3BsYXkgaWYgdmFsdWVQcm9wZXJ0eS5nZXQgaXMgbnVsbCBvciB1bmRlZmluZWRcclxuICBhbGlnbj86IEFsaWduOyAvLyBob3Jpem9udGFsIGFsaWdubWVudCBvZiB0aGUgdmFsdWVcclxuICB0b3VjaEFyZWFYRGlsYXRpb24/OiBudW1iZXI7XHJcbiAgdG91Y2hBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xyXG4gIG1vdXNlQXJlYVhEaWxhdGlvbj86IG51bWJlcjtcclxuICBtb3VzZUFyZWFZRGlsYXRpb24/OiBudW1iZXI7XHJcbiAgYmFja2dyb3VuZFN0cm9rZT86IFRDb2xvcjtcclxuICBiYWNrZ3JvdW5kTGluZVdpZHRoPzogbnVtYmVyO1xyXG4gIGFycm93SGVpZ2h0PzogbnVtYmVyO1xyXG4gIGFycm93WVNwYWNpbmc/OiBudW1iZXI7XHJcbiAgYXJyb3dTdHJva2U/OiBUQ29sb3I7XHJcbiAgYXJyb3dMaW5lV2lkdGg/OiBudW1iZXI7XHJcbiAgdmFsdWVNYXhXaWR0aD86IG51bWJlciB8IG51bGw7IC8vIElmIG5vbi1udWxsLCBpdCB3aWxsIGNhcCB0aGUgdmFsdWUncyBtYXhXaWR0aCB0byB0aGlzIHZhbHVlXHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIGEgdmFsdWUgdG8gYSBzdHJpbmcgdG8gYmUgZGlzcGxheWVkIGluIGEgVGV4dCBub2RlLiBOT1RFOiBJZiB0aGlzIGZ1bmN0aW9uIGNhbiBnaXZlIGRpZmZlcmVudCBzdHJpbmdzXHJcbiAgICogdG8gdGhlIHNhbWUgdmFsdWUgZGVwZW5kaW5nIG9uIGV4dGVybmFsIHN0YXRlLCBpdCBpcyByZWNvbW1lbmRlZCB0byByZWJ1aWxkIHRoZSBOdW1iZXJQaWNrZXIgd2hlbiB0aGF0IHN0YXRlXHJcbiAgICogY2hhbmdlcyAoYXMgaXQgdXNlcyBmb3JtYXRWYWx1ZSBvdmVyIHRoZSBpbml0aWFsIHJhbmdlIHRvIGRldGVybWluZSB0aGUgYm91bmRzIHRoYXQgbGFiZWxzIGNhbiB0YWtlKS5cclxuICAgKi9cclxuICBmb3JtYXRWYWx1ZT86ICggdmFsdWU6IG51bWJlciApID0+IHN0cmluZztcclxuXHJcbiAgLy8gTGlzdGVuZXIgdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgTnVtYmVyUGlja2VyIGhhcyBpbnB1dCBvbiBpdCBkdWUgdG8gdXNlciBpbnRlcmFjdGlvbi5cclxuICBvbklucHV0PzogKCkgPT4gdm9pZDtcclxuXHJcbiAgLy8gRGV0ZXJtaW5lcyB3aGVuIHRoZSBpbmNyZW1lbnQgYXJyb3cgaXMgZW5hYmxlZC5cclxuICBpbmNyZW1lbnRFbmFibGVkRnVuY3Rpb24/OiAoIHZhbHVlOiBudW1iZXIsIHJhbmdlOiBSYW5nZSApID0+IGJvb2xlYW47XHJcblxyXG4gIC8vIERldGVybWluZXMgd2hlbiB0aGUgZGVjcmVtZW50IGFycm93IGlzIGVuYWJsZWQuXHJcbiAgZGVjcmVtZW50RW5hYmxlZEZ1bmN0aW9uPzogKCB2YWx1ZTogbnVtYmVyLCByYW5nZTogUmFuZ2UgKSA9PiBib29sZWFuO1xyXG5cclxuICAvLyBPcGFjaXR5IHVzZWQgdG8gaW5kaWNhdGUgZGlzYWJsZWQsIFswLDFdIGV4Y2x1c2l2ZVxyXG4gIGRpc2FibGVkT3BhY2l0eT86IG51bWJlcjtcclxuXHJcbiAgLy8gU291bmQgZ2VuZXJhdG9ycyBmb3Igd2hlbiB0aGUgTnVtYmVyUGlja2VyJ3MgdmFsdWUgY2hhbmdlcywgYW5kIHdoZW4gaXQgaGl0cyByYW5nZSBleHRyZW1pdGllcy5cclxuICAvLyBVc2UgbnVsbFNvdW5kUGxheWVyIHRvIGRpc2FibGUuXHJcbiAgdmFsdWVDaGFuZ2VkU291bmRQbGF5ZXI/OiBUU291bmRQbGF5ZXI7XHJcbiAgYm91bmRhcnlTb3VuZFBsYXllcj86IFRTb3VuZFBsYXllcjtcclxufTtcclxuXHJcbnR5cGUgUGFyZW50T3B0aW9ucyA9IEFjY2Vzc2libGVOdW1iZXJTcGlubmVyT3B0aW9ucyAmIE5vZGVPcHRpb25zO1xyXG5cclxuZXhwb3J0IHR5cGUgTnVtYmVyUGlja2VyT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxQYXJlbnRPcHRpb25zLCAndmFsdWVQcm9wZXJ0eScgfCAnZW5hYmxlZFJhbmdlUHJvcGVydHknPjtcclxuXHJcbi8vIG9wdGlvbnMgdG8gTnVtYmVyUGlja2VyLmNyZWF0ZUljb25cclxudHlwZSBDcmVhdGVJY29uT3B0aW9ucyA9IHtcclxuICBoaWdobGlnaHRJbmNyZW1lbnQ/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGhpZ2hsaWdodCB0aGUgaW5jcmVtZW50IGJ1dHRvblxyXG4gIGhpZ2hsaWdodERlY3JlbWVudD86IGZhbHNlOyAvLyB3aGV0aGVyIHRvIGhpZ2hsaWdodCB0aGUgZGVjcmVtZW50IGJ1dHRvblxyXG4gIHJhbmdlPzogUmFuZ2U7IC8vIHJhbmdlIHNob3duIG9uIHRoZSBpY29uXHJcbiAgbnVtYmVyUGlja2VyT3B0aW9ucz86IE51bWJlclBpY2tlck9wdGlvbnM7XHJcbn07XHJcblxyXG50eXBlIEFycm93Q29sb3JzID0ge1xyXG4gIHVwOiBUQ29sb3I7XHJcbiAgb3ZlcjogVENvbG9yO1xyXG4gIGRvd246IFRDb2xvcjtcclxuICBvdXQ6IFRDb2xvcjtcclxuICBkaXNhYmxlZDogVENvbG9yO1xyXG59O1xyXG5cclxudHlwZSBCYWNrZ3JvdW5kQ29sb3JzID0ge1xyXG4gIHVwOiBUQ29sb3I7XHJcbiAgb3ZlcjogTGluZWFyR3JhZGllbnQ7XHJcbiAgZG93bjogTGluZWFyR3JhZGllbnQ7XHJcbiAgb3V0OiBMaW5lYXJHcmFkaWVudDtcclxuICBkaXNhYmxlZDogVENvbG9yO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTnVtYmVyUGlja2VyIGV4dGVuZHMgQWNjZXNzaWJsZU51bWJlclNwaW5uZXIoIE5vZGUsIDAgKSB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgaW5jcmVtZW50QXJyb3c6IFBhdGg7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkZWNyZW1lbnRBcnJvdzogUGF0aDtcclxuICBwcml2YXRlIHJlYWRvbmx5IGluY3JlbWVudElucHV0TGlzdGVuZXI6IE51bWJlclBpY2tlcklucHV0TGlzdGVuZXI7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkZWNyZW1lbnRJbnB1dExpc3RlbmVyOiBOdW1iZXJQaWNrZXJJbnB1dExpc3RlbmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZU51bWJlclBpY2tlcjogKCkgPT4gdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHZhbHVlUHJvcGVydHlcclxuICAgKiBAcGFyYW0gcmFuZ2VQcm9wZXJ0eSAtIElmIHRoZSByYW5nZSBpcyBhbnRpY2lwYXRlZCB0byBjaGFuZ2UsIGl0J3MgYmVzdCB0byBoYXZlIHRoZSByYW5nZSBQcm9wZXJ0eSBjb250YWluIHRoZVxyXG4gICAqIChtYXhpbXVtKSB1bmlvbiBvZiBhbGwgcG90ZW50aWFsIGNoYW5nZXMsIHNvIHRoYXQgTnVtYmVyUGlja2VyIGNhbiBpdGVyYXRlIHRocm91Z2ggYWxsIHBvc3NpYmxlIHZhbHVlcyBhbmQgY29tcHV0ZVxyXG4gICAqIHRoZSBib3VuZHMgb2YgdGhlIGxhYmVscy5cclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHZhbHVlUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj4sIHJhbmdlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFJhbmdlPixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IE51bWJlclBpY2tlck9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxOdW1iZXJQaWNrZXJPcHRpb25zLCBTdHJpY3RPbWl0PFNlbGZPcHRpb25zLCAncHJlc3NlZENvbG9yJyB8ICdmb3JtYXRWYWx1ZSc+LCBQYXJlbnRPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICBjb2xvcjogbmV3IENvbG9yKCAwLCAwLCAyNTUgKSxcclxuICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IDYsXHJcbiAgICAgIHhNYXJnaW46IDMsXHJcbiAgICAgIHlNYXJnaW46IDMsXHJcbiAgICAgIGRlY2ltYWxQbGFjZXM6IDAsXHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMjQgKSxcclxuICAgICAgaW5jcmVtZW50RnVuY3Rpb246ICggdmFsdWU6IG51bWJlciApID0+IHZhbHVlICsgMSxcclxuICAgICAgZGVjcmVtZW50RnVuY3Rpb246ICggdmFsdWU6IG51bWJlciApID0+IHZhbHVlIC0gMSxcclxuICAgICAgdGltZXJEZWxheTogNDAwLFxyXG4gICAgICB0aW1lckludGVydmFsOiAxMDAsXHJcbiAgICAgIG5vVmFsdWVTdHJpbmc6IE1hdGhTeW1ib2xzLk5PX1ZBTFVFLFxyXG4gICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMTAsXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMTAsXHJcbiAgICAgIG1vdXNlQXJlYVhEaWxhdGlvbjogMCxcclxuICAgICAgbW91c2VBcmVhWURpbGF0aW9uOiA1LFxyXG4gICAgICBiYWNrZ3JvdW5kU3Ryb2tlOiAnZ3JheScsXHJcbiAgICAgIGJhY2tncm91bmRMaW5lV2lkdGg6IDAuNSxcclxuICAgICAgYXJyb3dIZWlnaHQ6IDYsXHJcbiAgICAgIGFycm93WVNwYWNpbmc6IDMsXHJcbiAgICAgIGFycm93U3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBhcnJvd0xpbmVXaWR0aDogMC4yNSxcclxuICAgICAgdmFsdWVNYXhXaWR0aDogbnVsbCxcclxuICAgICAgb25JbnB1dDogXy5ub29wLFxyXG4gICAgICBpbmNyZW1lbnRFbmFibGVkRnVuY3Rpb246ICggdmFsdWU6IG51bWJlciwgcmFuZ2U6IFJhbmdlICkgPT4gKCB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlIDwgcmFuZ2UubWF4ICksXHJcbiAgICAgIGRlY3JlbWVudEVuYWJsZWRGdW5jdGlvbjogKCB2YWx1ZTogbnVtYmVyLCByYW5nZTogUmFuZ2UgKSA9PiAoIHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgPiByYW5nZS5taW4gKSxcclxuICAgICAgZGlzYWJsZWRPcGFjaXR5OiBTY2VuZXJ5Q29uc3RhbnRzLkRJU0FCTEVEX09QQUNJVFksXHJcbiAgICAgIHZhbHVlQ2hhbmdlZFNvdW5kUGxheWVyOiBnZW5lcmFsU29mdENsaWNrU291bmRQbGF5ZXIsXHJcbiAgICAgIGJvdW5kYXJ5U291bmRQbGF5ZXI6IGdlbmVyYWxCb3VuZGFyeUJvb3BTb3VuZFBsYXllcixcclxuXHJcbiAgICAgIC8vIFBhcmVudE9wdGlvbnNcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgIHZhbHVlUHJvcGVydHk6IHZhbHVlUHJvcGVydHksXHJcbiAgICAgIGVuYWJsZWRSYW5nZVByb3BlcnR5OiByYW5nZVByb3BlcnR5LFxyXG4gICAgICBwYWdlS2V5Ym9hcmRTdGVwOiAyLFxyXG4gICAgICB2b2ljaW5nT2JqZWN0UmVzcG9uc2U6ICgpID0+IHZhbHVlUHJvcGVydHkudmFsdWUsIC8vIGJ5IGRlZmF1bHQsIGp1c3Qgc3BlYWsgdGhlIHZhbHVlXHJcblxyXG4gICAgICAvLyBwaGV0LWlvXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxyXG4gICAgICB0YW5kZW1OYW1lU3VmZml4OiAnUGlja2VyJyxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IFBoZXRpb09iamVjdC5ERUZBVUxUX09QVElPTlMucGhldGlvUmVhZE9ubHksXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvRmVhdHVyZWQ6IHRydWUgfSxcclxuICAgICAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiB0cnVlXHJcblxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgaWYgKCAhb3B0aW9ucy5mb3JtYXRWYWx1ZSApIHtcclxuICAgICAgb3B0aW9ucy5mb3JtYXRWYWx1ZSA9ICggdmFsdWU6IG51bWJlciApID0+IFV0aWxzLnRvRml4ZWQoIHZhbHVlLCBvcHRpb25zLmRlY2ltYWxQbGFjZXMgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDb2xvciBvZiBhcnJvd3MgYW5kIHRvcC9ib3R0b20gZ3JhZGllbnQgd2hlbiBwcmVzc2VkXHJcbiAgICBsZXQgY29sb3JQcm9wZXJ0eTogUGFpbnRDb2xvclByb3BlcnR5IHwgbnVsbCA9IG51bGw7XHJcbiAgICBpZiAoIG9wdGlvbnMucHJlc3NlZENvbG9yID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgIGNvbG9yUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBvcHRpb25zLmNvbG9yICk7IC8vIGRpc3Bvc2UgcmVxdWlyZWQhXHJcblxyXG4gICAgICAvLyBObyByZWZlcmVuY2UgbmVlZHMgdG8gYmUga2VwdCwgc2luY2Ugd2UgZGlzcG9zZSBpdHMgZGVwZW5kZW5jeS5cclxuICAgICAgb3B0aW9ucy5wcmVzc2VkQ29sb3IgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIGNvbG9yUHJvcGVydHkgXSwgY29sb3IgPT4gY29sb3IuZGFya2VyQ29sb3IoKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBwcmV2aW91c1ZhbHVlID0gdmFsdWVQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAvLyBPdmVyd3JpdGUgdGhlIHBhc3NlZC1pbiBvbklucHV0IGxpc3RlbmVyIHRvIG1ha2Ugc3VyZSB0aGF0IHNvdW5kIGltcGxlbWVudGF0aW9uIGNhbid0IGJlIGJsb3duIGF3YXkgaW4gdGhlXHJcbiAgICAvLyBkZWZhdWx0cy5cclxuICAgIGNvbnN0IHByb3ZpZGVkT25JbnB1dExpc3RlbmVyID0gb3B0aW9ucy5vbklucHV0O1xyXG4gICAgb3B0aW9ucy5vbklucHV0ID0gKCkgPT4ge1xyXG4gICAgICBwcm92aWRlZE9uSW5wdXRMaXN0ZW5lcigpO1xyXG5cclxuICAgICAgLy8gVGhlIG9uSW5wdXQgbGlzdGVuZXIgbWF5IGJlIGNhbGxlZCB3aGVuIG5vIGNoYW5nZSB0byB0aGUgdmFsdWUgaGFzIGFjdHVhbGx5IGhhcHBlbmVkLCBzZWVcclxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNzYwLiAgV2UgZG8gc29tZSBjaGVja3MgaGVyZSB0byBtYWtlIHN1cmUgdGhlIHNvdW5kIGlzIG9ubHkgZ2VuZXJhdGVkXHJcbiAgICAgIC8vIHdoZW4gYSBjaGFuZ2Ugb2NjdXJzLlxyXG4gICAgICBpZiAoIHZhbHVlUHJvcGVydHkudmFsdWUgIT09IHByZXZpb3VzVmFsdWUgKSB7XHJcblxyXG4gICAgICAgIC8vIFBsYXkgdGhlIGJvdW5kYXJ5IHNvdW5kIElmIHRoZSB2YWx1ZSBpcyBhdCBtaW4gb3IgbWF4LCBvdGhlcndpc2UgcGxheSB0aGUgZGVmYXVsdCBzb3VuZC5cclxuICAgICAgICBpZiAoIHZhbHVlUHJvcGVydHkudmFsdWUgPT09IHJhbmdlUHJvcGVydHkuZ2V0KCkubWF4IHx8IHZhbHVlUHJvcGVydHkudmFsdWUgPT09IHJhbmdlUHJvcGVydHkuZ2V0KCkubWluICkge1xyXG4gICAgICAgICAgb3B0aW9ucy5ib3VuZGFyeVNvdW5kUGxheWVyLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBvcHRpb25zLnZhbHVlQ2hhbmdlZFNvdW5kUGxheWVyLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHByZXZpb3VzVmFsdWUgPSB2YWx1ZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgfTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5rZXlib2FyZFN0ZXAsICdOdW1iZXJQaWNrZXIgc2V0cyBpdHMgb3duIGtleWJvYXJkU3RlcCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLnNoaWZ0S2V5Ym9hcmRTdGVwLCAnTnVtYmVyUGlja2VyIHNldHMgaXRzIG93biBzaGlmdEtleWJvYXJkU3RlcCcgKTtcclxuXHJcbiAgICAvLyBBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lciBvcHRpb25zIHRoYXQgZGVwZW5kIG9uIG90aGVyIG9wdGlvbnMuXHJcbiAgICAvLyBJbml0aWFsaXplIGFjY2Vzc2liaWxpdHkgZmVhdHVyZXMuIFRoaXMgbXVzdCByZWFjaCBpbnRvIGluY3JlbWVudEZ1bmN0aW9uIHRvIGdldCB0aGUgZGVsdGEuXHJcbiAgICAvLyBCb3RoIG5vcm1hbCBhcnJvdyBhbmQgc2hpZnQgYXJyb3cga2V5cyB1c2UgdGhlIGRlbHRhIGNvbXB1dGVkIHdpdGggaW5jcmVtZW50RnVuY3Rpb24uXHJcbiAgICBjb25zdCBrZXlib2FyZFN0ZXAgPSBvcHRpb25zLmluY3JlbWVudEZ1bmN0aW9uKCB2YWx1ZVByb3BlcnR5LmdldCgpICkgLSB2YWx1ZVByb3BlcnR5LmdldCgpO1xyXG4gICAgb3B0aW9ucy5rZXlib2FyZFN0ZXAgPSBrZXlib2FyZFN0ZXA7XHJcbiAgICBvcHRpb25zLnNoaWZ0S2V5Ym9hcmRTdGVwID0ga2V5Ym9hcmRTdGVwO1xyXG5cclxuICAgIGNvbnN0IGJvdW5kc1JlcXVpcmVkT3B0aW9uS2V5cyA9IF8ucGljayggb3B0aW9ucywgTm9kZS5SRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVMgKTtcclxuICAgIHN1cGVyKCBfLm9taXQoIG9wdGlvbnMsIE5vZGUuUkVRVUlSRVNfQk9VTkRTX09QVElPTl9LRVlTICkgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gUHJvcGVydGllc1xyXG5cclxuICAgIGNvbnN0IGluY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHkgPSBuZXcgU3RyaW5nVW5pb25Qcm9wZXJ0eSggJ3VwJywge1xyXG4gICAgICB2YWxpZFZhbHVlczogQnV0dG9uU3RhdGVWYWx1ZXNcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGRlY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHkgPSBuZXcgU3RyaW5nVW5pb25Qcm9wZXJ0eSggJ2Rvd24nLCB7XHJcbiAgICAgIHZhbGlkVmFsdWVzOiBCdXR0b25TdGF0ZVZhbHVlc1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIG11c3QgYmUgZGlzcG9zZWRcclxuICAgIGNvbnN0IGluY3JlbWVudEVuYWJsZWRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4gPVxyXG4gICAgICBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHZhbHVlUHJvcGVydHksIHJhbmdlUHJvcGVydHkgXSwgb3B0aW9ucy5pbmNyZW1lbnRFbmFibGVkRnVuY3Rpb24gKTtcclxuXHJcbiAgICAvLyBtdXN0IGJlIGRpc3Bvc2VkXHJcbiAgICBjb25zdCBkZWNyZW1lbnRFbmFibGVkUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+ID1cclxuICAgICAgbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB2YWx1ZVByb3BlcnR5LCByYW5nZVByb3BlcnR5IF0sIG9wdGlvbnMuZGVjcmVtZW50RW5hYmxlZEZ1bmN0aW9uICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIE5vZGVzXHJcblxyXG4gICAgLy8gZGlzcGxheXMgdGhlIHZhbHVlXHJcbiAgICBjb25zdCB2YWx1ZU5vZGUgPSBuZXcgVGV4dCggJycsIHsgZm9udDogb3B0aW9ucy5mb250LCBwaWNrYWJsZTogZmFsc2UgfSApO1xyXG5cclxuICAgIC8vIGNvbXB1dGUgbWF4IHdpZHRoIG9mIHRleHQgYmFzZWQgb24gdGhlIHdpZHRoIG9mIGFsbCBwb3NzaWJsZSB2YWx1ZXMuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FyZWEtbW9kZWwtY29tbW9uL2lzc3Vlcy81XHJcbiAgICBsZXQgY3VycmVudFNhbXBsZVZhbHVlID0gcmFuZ2VQcm9wZXJ0eS5nZXQoKS5taW47XHJcbiAgICBjb25zdCBzYW1wbGVWYWx1ZXMgPSBbXTtcclxuICAgIHdoaWxlICggY3VycmVudFNhbXBsZVZhbHVlIDw9IHJhbmdlUHJvcGVydHkuZ2V0KCkubWF4ICkge1xyXG4gICAgICBzYW1wbGVWYWx1ZXMucHVzaCggY3VycmVudFNhbXBsZVZhbHVlICk7XHJcbiAgICAgIGN1cnJlbnRTYW1wbGVWYWx1ZSA9IG9wdGlvbnMuaW5jcmVtZW50RnVuY3Rpb24oIGN1cnJlbnRTYW1wbGVWYWx1ZSApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzYW1wbGVWYWx1ZXMubGVuZ3RoIDwgNTAwMDAwLCAnRG9uXFwndCBpbmZpbml0ZSBsb29wIGhlcmUnICk7XHJcbiAgICB9XHJcbiAgICBsZXQgbWF4V2lkdGggPSBNYXRoLm1heC5hcHBseSggbnVsbCwgc2FtcGxlVmFsdWVzLm1hcCggdmFsdWUgPT4ge1xyXG4gICAgICB2YWx1ZU5vZGUuc3RyaW5nID0gb3B0aW9ucy5mb3JtYXRWYWx1ZSEoIHZhbHVlICk7XHJcbiAgICAgIHJldHVybiB2YWx1ZU5vZGUud2lkdGg7XHJcbiAgICB9ICkgKTtcclxuICAgIC8vIENhcCB0aGUgbWF4V2lkdGggaWYgdmFsdWVNYXhXaWR0aCBpcyBwcm92aWRlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzI5N1xyXG4gICAgaWYgKCBvcHRpb25zLnZhbHVlTWF4V2lkdGggIT09IG51bGwgKSB7XHJcbiAgICAgIG1heFdpZHRoID0gTWF0aC5taW4oIG1heFdpZHRoLCBvcHRpb25zLnZhbHVlTWF4V2lkdGggKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjb21wdXRlIHNoYXBlIG9mIHRoZSBiYWNrZ3JvdW5kIGJlaGluZCB0aGUgbnVtZXJpYyB2YWx1ZVxyXG4gICAgY29uc3QgYmFja2dyb3VuZFdpZHRoID0gbWF4V2lkdGggKyAoIDIgKiBvcHRpb25zLnhNYXJnaW4gKTtcclxuICAgIGNvbnN0IGJhY2tncm91bmRIZWlnaHQgPSB2YWx1ZU5vZGUuaGVpZ2h0ICsgKCAyICogb3B0aW9ucy55TWFyZ2luICk7XHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kT3ZlcmxhcCA9IDE7XHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kQ29ybmVyUmFkaXVzID0gb3B0aW9ucy5jb3JuZXJSYWRpdXM7XHJcblxyXG4gICAgLy8gQXBwbHkgdGhlIG1heC13aWR0aCBBRlRFUiBjb21wdXRpbmcgdGhlIGJhY2tncm91bmRIZWlnaHQsIHNvIGl0IGRvZXNuJ3Qgc2hyaW5rIHZlcnRpY2FsbHlcclxuICAgIHZhbHVlTm9kZS5tYXhXaWR0aCA9IG1heFdpZHRoO1xyXG5cclxuICAgIC8vIFRvcCBoYWxmIG9mIHRoZSBiYWNrZ3JvdW5kLiBQcmVzc2luZyBoZXJlIHdpbGwgaW5jcmVtZW50IHRoZSB2YWx1ZS5cclxuICAgIC8vIFNoYXBlIGNvbXB1dGVkIHN0YXJ0aW5nIGF0IHVwcGVyLWxlZnQsIGdvaW5nIGNsb2Nrd2lzZS5cclxuICAgIGNvbnN0IGluY3JlbWVudEJhY2tncm91bmROb2RlID0gbmV3IFBhdGgoIG5ldyBTaGFwZSgpXHJcbiAgICAgICAgLmFyYyggYmFja2dyb3VuZENvcm5lclJhZGl1cywgYmFja2dyb3VuZENvcm5lclJhZGl1cywgYmFja2dyb3VuZENvcm5lclJhZGl1cywgTWF0aC5QSSwgTWF0aC5QSSAqIDMgLyAyLCBmYWxzZSApXHJcbiAgICAgICAgLmFyYyggYmFja2dyb3VuZFdpZHRoIC0gYmFja2dyb3VuZENvcm5lclJhZGl1cywgYmFja2dyb3VuZENvcm5lclJhZGl1cywgYmFja2dyb3VuZENvcm5lclJhZGl1cywgLU1hdGguUEkgLyAyLCAwLCBmYWxzZSApXHJcbiAgICAgICAgLmxpbmVUbyggYmFja2dyb3VuZFdpZHRoLCAoIGJhY2tncm91bmRIZWlnaHQgLyAyICkgKyBiYWNrZ3JvdW5kT3ZlcmxhcCApXHJcbiAgICAgICAgLmxpbmVUbyggMCwgKCBiYWNrZ3JvdW5kSGVpZ2h0IC8gMiApICsgYmFja2dyb3VuZE92ZXJsYXAgKVxyXG4gICAgICAgIC5jbG9zZSgpLFxyXG4gICAgICB7IHBpY2thYmxlOiBmYWxzZSB9ICk7XHJcblxyXG4gICAgLy8gQm90dG9tIGhhbGYgb2YgdGhlIGJhY2tncm91bmQuIFByZXNzaW5nIGhlcmUgd2lsbCBkZWNyZW1lbnQgdGhlIHZhbHVlLlxyXG4gICAgLy8gU2hhcGUgY29tcHV0ZWQgc3RhcnRpbmcgYXQgYm90dG9tLXJpZ2h0LCBnb2luZyBjbG9ja3dpc2UuXHJcbiAgICBjb25zdCBkZWNyZW1lbnRCYWNrZ3JvdW5kTm9kZSA9IG5ldyBQYXRoKCBuZXcgU2hhcGUoKVxyXG4gICAgICAgIC5hcmMoIGJhY2tncm91bmRXaWR0aCAtIGJhY2tncm91bmRDb3JuZXJSYWRpdXMsIGJhY2tncm91bmRIZWlnaHQgLSBiYWNrZ3JvdW5kQ29ybmVyUmFkaXVzLCBiYWNrZ3JvdW5kQ29ybmVyUmFkaXVzLCAwLCBNYXRoLlBJIC8gMiwgZmFsc2UgKVxyXG4gICAgICAgIC5hcmMoIGJhY2tncm91bmRDb3JuZXJSYWRpdXMsIGJhY2tncm91bmRIZWlnaHQgLSBiYWNrZ3JvdW5kQ29ybmVyUmFkaXVzLCBiYWNrZ3JvdW5kQ29ybmVyUmFkaXVzLCBNYXRoLlBJIC8gMiwgTWF0aC5QSSwgZmFsc2UgKVxyXG4gICAgICAgIC5saW5lVG8oIDAsIGJhY2tncm91bmRIZWlnaHQgLyAyIClcclxuICAgICAgICAubGluZVRvKCBiYWNrZ3JvdW5kV2lkdGgsIGJhY2tncm91bmRIZWlnaHQgLyAyIClcclxuICAgICAgICAuY2xvc2UoKSxcclxuICAgICAgeyBwaWNrYWJsZTogZmFsc2UgfSApO1xyXG5cclxuICAgIC8vIHNlcGFyYXRlIHJlY3RhbmdsZSBmb3Igc3Ryb2tlIGFyb3VuZCB2YWx1ZSBiYWNrZ3JvdW5kXHJcbiAgICBjb25zdCBzdHJva2VkQmFja2dyb3VuZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIGJhY2tncm91bmRXaWR0aCwgYmFja2dyb3VuZEhlaWdodCwgYmFja2dyb3VuZENvcm5lclJhZGl1cywgYmFja2dyb3VuZENvcm5lclJhZGl1cywge1xyXG4gICAgICBwaWNrYWJsZTogZmFsc2UsXHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5iYWNrZ3JvdW5kU3Ryb2tlLFxyXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMuYmFja2dyb3VuZExpbmVXaWR0aFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNvbXB1dGUgc2l6ZSBvZiBhcnJvd3NcclxuICAgIGNvbnN0IGFycm93QnV0dG9uU2l6ZSA9IG5ldyBEaW1lbnNpb24yKCAwLjUgKiBiYWNrZ3JvdW5kV2lkdGgsIG9wdGlvbnMuYXJyb3dIZWlnaHQgKTtcclxuXHJcbiAgICBjb25zdCBhcnJvd09wdGlvbnMgPSB7XHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5hcnJvd1N0cm9rZSxcclxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmFycm93TGluZVdpZHRoLFxyXG4gICAgICBwaWNrYWJsZTogZmFsc2VcclxuICAgIH07XHJcblxyXG4gICAgLy8gaW5jcmVtZW50IGFycm93LCBwb2ludGluZyB1cCwgZGVzY3JpYmVkIGNsb2Nrd2lzZSBmcm9tIHRpcFxyXG4gICAgdGhpcy5pbmNyZW1lbnRBcnJvdyA9IG5ldyBQYXRoKCBuZXcgU2hhcGUoKVxyXG4gICAgICAgIC5tb3ZlVG8oIGFycm93QnV0dG9uU2l6ZS53aWR0aCAvIDIsIDAgKVxyXG4gICAgICAgIC5saW5lVG8oIGFycm93QnV0dG9uU2l6ZS53aWR0aCwgYXJyb3dCdXR0b25TaXplLmhlaWdodCApXHJcbiAgICAgICAgLmxpbmVUbyggMCwgYXJyb3dCdXR0b25TaXplLmhlaWdodCApXHJcbiAgICAgICAgLmNsb3NlKCksXHJcbiAgICAgIGFycm93T3B0aW9ucyApO1xyXG4gICAgdGhpcy5pbmNyZW1lbnRBcnJvdy5jZW50ZXJYID0gaW5jcmVtZW50QmFja2dyb3VuZE5vZGUuY2VudGVyWDtcclxuICAgIHRoaXMuaW5jcmVtZW50QXJyb3cuYm90dG9tID0gaW5jcmVtZW50QmFja2dyb3VuZE5vZGUudG9wIC0gb3B0aW9ucy5hcnJvd1lTcGFjaW5nO1xyXG5cclxuICAgIC8vIGRlY3JlbWVudCBhcnJvdywgcG9pbnRpbmcgZG93biwgZGVzY3JpYmVkIGNsb2Nrd2lzZSBmcm9tIHRoZSB0aXBcclxuICAgIHRoaXMuZGVjcmVtZW50QXJyb3cgPSBuZXcgUGF0aCggbmV3IFNoYXBlKClcclxuICAgICAgICAubW92ZVRvKCBhcnJvd0J1dHRvblNpemUud2lkdGggLyAyLCBhcnJvd0J1dHRvblNpemUuaGVpZ2h0IClcclxuICAgICAgICAubGluZVRvKCAwLCAwIClcclxuICAgICAgICAubGluZVRvKCBhcnJvd0J1dHRvblNpemUud2lkdGgsIDAgKVxyXG4gICAgICAgIC5jbG9zZSgpLFxyXG4gICAgICBhcnJvd09wdGlvbnMgKTtcclxuICAgIHRoaXMuZGVjcmVtZW50QXJyb3cuY2VudGVyWCA9IGRlY3JlbWVudEJhY2tncm91bmROb2RlLmNlbnRlclg7XHJcbiAgICB0aGlzLmRlY3JlbWVudEFycm93LnRvcCA9IGRlY3JlbWVudEJhY2tncm91bmROb2RlLmJvdHRvbSArIG9wdGlvbnMuYXJyb3dZU3BhY2luZztcclxuXHJcbiAgICAvLyBwYXJlbnRzIGZvciBpbmNyZW1lbnQgYW5kIGRlY3JlbWVudCBjb21wb25lbnRzXHJcbiAgICBjb25zdCBpbmNyZW1lbnRQYXJlbnQgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBpbmNyZW1lbnRCYWNrZ3JvdW5kTm9kZSwgdGhpcy5pbmNyZW1lbnRBcnJvdyBdIH0gKTtcclxuICAgIGluY3JlbWVudFBhcmVudC5hZGRDaGlsZCggbmV3IFJlY3RhbmdsZSggaW5jcmVtZW50UGFyZW50LmxvY2FsQm91bmRzICkgKTsgLy8gaW52aXNpYmxlIG92ZXJsYXlcclxuICAgIGNvbnN0IGRlY3JlbWVudFBhcmVudCA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGRlY3JlbWVudEJhY2tncm91bmROb2RlLCB0aGlzLmRlY3JlbWVudEFycm93IF0gfSApO1xyXG4gICAgZGVjcmVtZW50UGFyZW50LmFkZENoaWxkKCBuZXcgUmVjdGFuZ2xlKCBkZWNyZW1lbnRQYXJlbnQubG9jYWxCb3VuZHMgKSApOyAvLyBpbnZpc2libGUgb3ZlcmxheVxyXG5cclxuICAgIC8vIHJlbmRlcmluZyBvcmRlclxyXG4gICAgdGhpcy5hZGRDaGlsZCggaW5jcmVtZW50UGFyZW50ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBkZWNyZW1lbnRQYXJlbnQgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHN0cm9rZWRCYWNrZ3JvdW5kICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB2YWx1ZU5vZGUgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gUG9pbnRlciBhcmVhc1xyXG5cclxuICAgIC8vIHRvdWNoIGFyZWFzXHJcbiAgICBpbmNyZW1lbnRQYXJlbnQudG91Y2hBcmVhID0gU2hhcGUucmVjdGFuZ2xlKFxyXG4gICAgICBpbmNyZW1lbnRQYXJlbnQubGVmdCAtICggb3B0aW9ucy50b3VjaEFyZWFYRGlsYXRpb24gLyAyICksIGluY3JlbWVudFBhcmVudC50b3AgLSBvcHRpb25zLnRvdWNoQXJlYVlEaWxhdGlvbixcclxuICAgICAgaW5jcmVtZW50UGFyZW50LndpZHRoICsgb3B0aW9ucy50b3VjaEFyZWFYRGlsYXRpb24sIGluY3JlbWVudFBhcmVudC5oZWlnaHQgKyBvcHRpb25zLnRvdWNoQXJlYVlEaWxhdGlvbiApO1xyXG4gICAgZGVjcmVtZW50UGFyZW50LnRvdWNoQXJlYSA9IFNoYXBlLnJlY3RhbmdsZShcclxuICAgICAgZGVjcmVtZW50UGFyZW50LmxlZnQgLSAoIG9wdGlvbnMudG91Y2hBcmVhWERpbGF0aW9uIC8gMiApLCBkZWNyZW1lbnRQYXJlbnQudG9wLFxyXG4gICAgICBkZWNyZW1lbnRQYXJlbnQud2lkdGggKyBvcHRpb25zLnRvdWNoQXJlYVhEaWxhdGlvbiwgZGVjcmVtZW50UGFyZW50LmhlaWdodCArIG9wdGlvbnMudG91Y2hBcmVhWURpbGF0aW9uICk7XHJcblxyXG4gICAgLy8gbW91c2UgYXJlYXNcclxuICAgIGluY3JlbWVudFBhcmVudC5tb3VzZUFyZWEgPSBTaGFwZS5yZWN0YW5nbGUoXHJcbiAgICAgIGluY3JlbWVudFBhcmVudC5sZWZ0IC0gKCBvcHRpb25zLm1vdXNlQXJlYVhEaWxhdGlvbiAvIDIgKSwgaW5jcmVtZW50UGFyZW50LnRvcCAtIG9wdGlvbnMubW91c2VBcmVhWURpbGF0aW9uLFxyXG4gICAgICBpbmNyZW1lbnRQYXJlbnQud2lkdGggKyBvcHRpb25zLm1vdXNlQXJlYVhEaWxhdGlvbiwgaW5jcmVtZW50UGFyZW50LmhlaWdodCArIG9wdGlvbnMubW91c2VBcmVhWURpbGF0aW9uICk7XHJcbiAgICBkZWNyZW1lbnRQYXJlbnQubW91c2VBcmVhID0gU2hhcGUucmVjdGFuZ2xlKFxyXG4gICAgICBkZWNyZW1lbnRQYXJlbnQubGVmdCAtICggb3B0aW9ucy5tb3VzZUFyZWFYRGlsYXRpb24gLyAyICksIGRlY3JlbWVudFBhcmVudC50b3AsXHJcbiAgICAgIGRlY3JlbWVudFBhcmVudC53aWR0aCArIG9wdGlvbnMubW91c2VBcmVhWERpbGF0aW9uLCBkZWNyZW1lbnRQYXJlbnQuaGVpZ2h0ICsgb3B0aW9ucy5tb3VzZUFyZWFZRGlsYXRpb24gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gQ29sb3JzXHJcblxyXG4gICAgLy8gYXJyb3cgY29sb3JzLCBjb3JyZXNwb25kaW5nIHRvIEJ1dHRvblN0YXRlIGFuZCBpbmNyZW1lbnRFbmFibGVkUHJvcGVydHkvZGVjcmVtZW50RW5hYmxlZFByb3BlcnR5XHJcbiAgICBjb25zdCBhcnJvd0NvbG9yczogQXJyb3dDb2xvcnMgPSB7XHJcbiAgICAgIHVwOiBvcHRpb25zLmNvbG9yLFxyXG4gICAgICBvdmVyOiBvcHRpb25zLmNvbG9yLFxyXG4gICAgICBkb3duOiBvcHRpb25zLnByZXNzZWRDb2xvcixcclxuICAgICAgb3V0OiBvcHRpb25zLmNvbG9yLFxyXG4gICAgICBkaXNhYmxlZDogJ3JnYigxNzYsMTc2LDE3NiknXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGJhY2tncm91bmQgY29sb3JzLCBjb3JyZXNwb25kaW5nIHRvIEJ1dHRvblN0YXRlIGFuZCBlbmFibGVkUHJvcGVydHkudmFsdWVcclxuICAgIGNvbnN0IGhpZ2hsaWdodEdyYWRpZW50ID0gY3JlYXRlVmVydGljYWxHcmFkaWVudCggb3B0aW9ucy5jb2xvciwgb3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3IsIG9wdGlvbnMuY29sb3IsIGJhY2tncm91bmRIZWlnaHQgKTtcclxuICAgIGNvbnN0IHByZXNzZWRHcmFkaWVudCA9IGNyZWF0ZVZlcnRpY2FsR3JhZGllbnQoIG9wdGlvbnMucHJlc3NlZENvbG9yLCBvcHRpb25zLmJhY2tncm91bmRDb2xvciwgb3B0aW9ucy5wcmVzc2VkQ29sb3IsIGJhY2tncm91bmRIZWlnaHQgKTtcclxuICAgIGNvbnN0IGJhY2tncm91bmRDb2xvcnM6IEJhY2tncm91bmRDb2xvcnMgPSB7XHJcbiAgICAgIHVwOiBvcHRpb25zLmJhY2tncm91bmRDb2xvcixcclxuICAgICAgb3ZlcjogaGlnaGxpZ2h0R3JhZGllbnQsXHJcbiAgICAgIGRvd246IHByZXNzZWRHcmFkaWVudCxcclxuICAgICAgb3V0OiBwcmVzc2VkR3JhZGllbnQsXHJcbiAgICAgIGRpc2FibGVkOiBvcHRpb25zLmJhY2tncm91bmRDb2xvclxyXG4gICAgfTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gT2JzZXJ2ZXJzIGFuZCBJbnB1dExpc3RlbmVyc1xyXG5cclxuICAgIGNvbnN0IGlucHV0TGlzdGVuZXJPcHRpb25zID0ge1xyXG4gICAgICBmaXJlT25Ib2xkOiB0cnVlLFxyXG4gICAgICBmaXJlT25Ib2xkRGVsYXk6IG9wdGlvbnMudGltZXJEZWxheSxcclxuICAgICAgZmlyZU9uSG9sZEludGVydmFsOiBvcHRpb25zLnRpbWVySW50ZXJ2YWxcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5pbmNyZW1lbnRJbnB1dExpc3RlbmVyID0gbmV3IE51bWJlclBpY2tlcklucHV0TGlzdGVuZXIoIGluY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHksXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPE51bWJlclBpY2tlcklucHV0TGlzdGVuZXJPcHRpb25zPigge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW5jcmVtZW50SW5wdXRMaXN0ZW5lcicgKSxcclxuICAgICAgICBmaXJlOiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKSA9PiB7XHJcbiAgICAgICAgICB2YWx1ZVByb3BlcnR5LnNldCggTWF0aC5taW4oIG9wdGlvbnMuaW5jcmVtZW50RnVuY3Rpb24oIHZhbHVlUHJvcGVydHkuZ2V0KCkgKSwgcmFuZ2VQcm9wZXJ0eS5nZXQoKS5tYXggKSApO1xyXG4gICAgICAgICAgb3B0aW9ucy5vbklucHV0KCBldmVudCApO1xyXG5cclxuICAgICAgICAgIC8vIHZvaWNpbmcgLSBzcGVhayB0aGUgb2JqZWN0L2NvbnRleHQgcmVzcG9uc2VzIG9uIHZhbHVlIGNoYW5nZSBmcm9tIHVzZXIgaW5wdXRcclxuICAgICAgICAgIHRoaXMudm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlKCB7IG5hbWVSZXNwb25zZTogbnVsbCwgaGludFJlc3BvbnNlOiBudWxsIH0gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sIGlucHV0TGlzdGVuZXJPcHRpb25zICkgKTtcclxuICAgIGluY3JlbWVudFBhcmVudC5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLmluY3JlbWVudElucHV0TGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLmRlY3JlbWVudElucHV0TGlzdGVuZXIgPSBuZXcgTnVtYmVyUGlja2VySW5wdXRMaXN0ZW5lciggZGVjcmVtZW50QnV0dG9uU3RhdGVQcm9wZXJ0eSxcclxuICAgICAgY29tYmluZU9wdGlvbnM8TnVtYmVyUGlja2VySW5wdXRMaXN0ZW5lck9wdGlvbnM+KCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkZWNyZW1lbnRJbnB1dExpc3RlbmVyJyApLFxyXG4gICAgICAgIGZpcmU6ICggZXZlbnQ6IFNjZW5lcnlFdmVudCApID0+IHtcclxuICAgICAgICAgIHZhbHVlUHJvcGVydHkuc2V0KCBNYXRoLm1heCggb3B0aW9ucy5kZWNyZW1lbnRGdW5jdGlvbiggdmFsdWVQcm9wZXJ0eS5nZXQoKSApLCByYW5nZVByb3BlcnR5LmdldCgpLm1pbiApICk7XHJcbiAgICAgICAgICBvcHRpb25zLm9uSW5wdXQoIGV2ZW50ICk7XHJcblxyXG4gICAgICAgICAgLy8gdm9pY2luZyAtIHNwZWFrIHRoZSBvYmplY3QvY29udGV4dCByZXNwb25zZXMgb24gdmFsdWUgY2hhbmdlIGZyb20gdXNlciBpbnB1dFxyXG4gICAgICAgICAgdGhpcy52b2ljaW5nU3BlYWtGdWxsUmVzcG9uc2UoIHsgbmFtZVJlc3BvbnNlOiBudWxsLCBoaW50UmVzcG9uc2U6IG51bGwgfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSwgaW5wdXRMaXN0ZW5lck9wdGlvbnMgKSApO1xyXG4gICAgZGVjcmVtZW50UGFyZW50LmFkZElucHV0TGlzdGVuZXIoIHRoaXMuZGVjcmVtZW50SW5wdXRMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIGVuYWJsZS9kaXNhYmxlIGxpc3RlbmVycyBhbmQgaW50ZXJhY3Rpb246IHVubGluayB1bm5lY2Vzc2FyeSwgUHJvcGVydGllcyBhcmUgb3duZWQgYnkgdGhpcyBpbnN0YW5jZVxyXG4gICAgaW5jcmVtZW50RW5hYmxlZFByb3BlcnR5LmxpbmsoIGVuYWJsZWQgPT4ge1xyXG4gICAgICAhZW5hYmxlZCAmJiB0aGlzLmluY3JlbWVudElucHV0TGlzdGVuZXIuaW50ZXJydXB0KCk7XHJcbiAgICAgIGluY3JlbWVudFBhcmVudC5waWNrYWJsZSA9IGVuYWJsZWQ7XHJcbiAgICB9ICk7XHJcbiAgICBkZWNyZW1lbnRFbmFibGVkUHJvcGVydHkubGluayggZW5hYmxlZCA9PiB7XHJcbiAgICAgICFlbmFibGVkICYmIHRoaXMuZGVjcmVtZW50SW5wdXRMaXN0ZW5lci5pbnRlcnJ1cHQoKTtcclxuICAgICAgZGVjcmVtZW50UGFyZW50LnBpY2thYmxlID0gZW5hYmxlZDtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGV4dCB0byBtYXRjaCB0aGUgdmFsdWVcclxuICAgIGNvbnN0IHZhbHVlT2JzZXJ2ZXIgPSAoIHZhbHVlOiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkICkgPT4ge1xyXG4gICAgICBpZiAoIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgdmFsdWVOb2RlLnN0cmluZyA9IG9wdGlvbnMubm9WYWx1ZVN0cmluZztcclxuICAgICAgICB2YWx1ZU5vZGUueCA9ICggYmFja2dyb3VuZFdpZHRoIC0gdmFsdWVOb2RlLndpZHRoICkgLyAyOyAvLyBob3Jpem9udGFsbHkgY2VudGVyZWRcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB2YWx1ZU5vZGUuc3RyaW5nID0gb3B0aW9ucy5mb3JtYXRWYWx1ZSEoIHZhbHVlICk7XHJcbiAgICAgICAgaWYgKCBvcHRpb25zLmFsaWduID09PSAnY2VudGVyJyApIHtcclxuICAgICAgICAgIHZhbHVlTm9kZS5jZW50ZXJYID0gaW5jcmVtZW50QmFja2dyb3VuZE5vZGUuY2VudGVyWDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIG9wdGlvbnMuYWxpZ24gPT09ICdyaWdodCcgKSB7XHJcbiAgICAgICAgICB2YWx1ZU5vZGUucmlnaHQgPSBpbmNyZW1lbnRCYWNrZ3JvdW5kTm9kZS5yaWdodCAtIG9wdGlvbnMueE1hcmdpbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIG9wdGlvbnMuYWxpZ24gPT09ICdsZWZ0JyApIHtcclxuICAgICAgICAgIHZhbHVlTm9kZS5sZWZ0ID0gaW5jcmVtZW50QmFja2dyb3VuZE5vZGUubGVmdCArIG9wdGlvbnMueE1hcmdpbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGB1bnN1cHBvcnRlZCB2YWx1ZSBmb3Igb3B0aW9ucy5hbGlnbjogJHtvcHRpb25zLmFsaWdufWAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdmFsdWVOb2RlLmNlbnRlclkgPSBiYWNrZ3JvdW5kSGVpZ2h0IC8gMjtcclxuICAgIH07XHJcbiAgICB2YWx1ZVByb3BlcnR5LmxpbmsoIHZhbHVlT2JzZXJ2ZXIgKTsgLy8gbXVzdCBiZSB1bmxpbmtlZCBpbiBkaXNwb3NlXHJcblxyXG4gICAgLy8gVXBkYXRlIGNvbG9ycyBmb3IgaW5jcmVtZW50IGNvbXBvbmVudHMuICBObyBkaXNwb3NlIGlzIG5lZWRlZCBzaW5jZSBkZXBlbmRlbmNpZXMgYXJlIGxvY2FsbHkgb3duZWQuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIGluY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHksIGluY3JlbWVudEVuYWJsZWRQcm9wZXJ0eSBdLCAoIHN0YXRlLCBlbmFibGVkICkgPT4ge1xyXG4gICAgICB1cGRhdGVDb2xvcnMoIHN0YXRlLCBlbmFibGVkLCBpbmNyZW1lbnRCYWNrZ3JvdW5kTm9kZSwgdGhpcy5pbmNyZW1lbnRBcnJvdywgYmFja2dyb3VuZENvbG9ycywgYXJyb3dDb2xvcnMgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgY29sb3JzIGZvciBkZWNyZW1lbnQgY29tcG9uZW50cy4gIE5vIGRpc3Bvc2UgaXMgbmVlZGVkIHNpbmNlIGRlcGVuZGVuY2llcyBhcmUgbG9jYWxseSBvd25lZC5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgZGVjcmVtZW50QnV0dG9uU3RhdGVQcm9wZXJ0eSwgZGVjcmVtZW50RW5hYmxlZFByb3BlcnR5IF0sICggc3RhdGUsIGVuYWJsZWQgKSA9PiB7XHJcbiAgICAgIHVwZGF0ZUNvbG9ycyggc3RhdGUsIGVuYWJsZWQsIGRlY3JlbWVudEJhY2tncm91bmROb2RlLCB0aGlzLmRlY3JlbWVudEFycm93LCBiYWNrZ3JvdW5kQ29sb3JzLCBhcnJvd0NvbG9ycyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIERpbGF0ZSBiYXNlZCBvbiBjb25zaXN0ZW50IHRlY2huaXF1ZSB3aGljaCBicmluZ3MgaW50byBhY2NvdW50IHRyYW5zZm9ybSBvZiB0aGlzIG5vZGUuXHJcbiAgICBjb25zdCBmb2N1c0JvdW5kcyA9IHRoaXMubG9jYWxCb3VuZHMuZGlsYXRlZCggRm9jdXNIaWdobGlnaHRQYXRoLmdldERpbGF0aW9uQ29lZmZpY2llbnQoIHRoaXMgKSApO1xyXG5cclxuICAgIC8vIHBkb20gLSBjdXN0b20gZm9jdXMgaGlnaGxpZ2h0IHRoYXQgbWF0Y2hlcyByb3VuZGVkIGJhY2tncm91bmQgYmVoaW5kIHRoZSBudW1lcmljIHZhbHVlXHJcbiAgICB0aGlzLmZvY3VzSGlnaGxpZ2h0ID0gbmV3IEZvY3VzSGlnaGxpZ2h0UGF0aCggU2hhcGUucm91bmRlZFJlY3RhbmdsZVdpdGhSYWRpaShcclxuICAgICAgZm9jdXNCb3VuZHMubWluWCxcclxuICAgICAgZm9jdXNCb3VuZHMubWluWSxcclxuICAgICAgZm9jdXNCb3VuZHMud2lkdGgsXHJcbiAgICAgIGZvY3VzQm91bmRzLmhlaWdodCwge1xyXG4gICAgICAgIHRvcExlZnQ6IG9wdGlvbnMuY29ybmVyUmFkaXVzLFxyXG4gICAgICAgIHRvcFJpZ2h0OiBvcHRpb25zLmNvcm5lclJhZGl1cyxcclxuICAgICAgICBib3R0b21MZWZ0OiBvcHRpb25zLmNvcm5lclJhZGl1cyxcclxuICAgICAgICBib3R0b21SaWdodDogb3B0aW9ucy5jb3JuZXJSYWRpdXNcclxuICAgICAgfSApXHJcbiAgICApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSBzdHlsZSB3aXRoIGtleWJvYXJkIGlucHV0LCBFbWl0dGVycyBvd25lZCBieSB0aGlzIGluc3RhbmNlIGFuZCBkaXNwb3NlZCBpbiBBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lclxyXG4gICAgdGhpcy5pbmNyZW1lbnREb3duRW1pdHRlci5hZGRMaXN0ZW5lciggaXNEb3duID0+IHtcclxuICAgICAgaW5jcmVtZW50QnV0dG9uU3RhdGVQcm9wZXJ0eS52YWx1ZSA9ICggaXNEb3duID8gJ2Rvd24nIDogJ3VwJyApO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5kZWNyZW1lbnREb3duRW1pdHRlci5hZGRMaXN0ZW5lciggaXNEb3duID0+IHtcclxuICAgICAgZGVjcmVtZW50QnV0dG9uU3RhdGVQcm9wZXJ0eS52YWx1ZSA9ICggaXNEb3duID8gJ2Rvd24nIDogJ3VwJyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkTGlua2VkRWxlbWVudCggdmFsdWVQcm9wZXJ0eSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZhbHVlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBNdXRhdGUgb3B0aW9ucyB0aGF0IHJlcXVpcmUgYm91bmRzIGFmdGVyIHdlIGhhdmUgY2hpbGRyZW5cclxuICAgIHRoaXMubXV0YXRlKCBib3VuZHNSZXF1aXJlZE9wdGlvbktleXMgKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VOdW1iZXJQaWNrZXIgPSAoKSA9PiB7XHJcblxyXG4gICAgICBjb2xvclByb3BlcnR5ICYmIGNvbG9yUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgICBpbmNyZW1lbnRFbmFibGVkUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgICBkZWNyZW1lbnRFbmFibGVkUHJvcGVydHkuZGlzcG9zZSgpO1xyXG5cclxuICAgICAgaWYgKCB2YWx1ZVByb3BlcnR5Lmhhc0xpc3RlbmVyKCB2YWx1ZU9ic2VydmVyICkgKSB7XHJcbiAgICAgICAgdmFsdWVQcm9wZXJ0eS51bmxpbmsoIHZhbHVlT2JzZXJ2ZXIgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcclxuICAgIGFzc2VydCAmJiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3NjZW5lcnktcGhldCcsICdOdW1iZXJQaWNrZXInLCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUljb24oIHZhbHVlOiBudW1iZXIsIHByb3ZpZGVkT3B0aW9ucz86IENyZWF0ZUljb25PcHRpb25zICk6IE5vZGUge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q3JlYXRlSWNvbk9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIENyZWF0ZUljb25PcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBIaWdobGlnaHQgdGhlIGluY3JlbWVudCBidXR0b25cclxuICAgICAgaGlnaGxpZ2h0SW5jcmVtZW50OiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIEhpZ2hsaWdodCB0aGUgZGVjcmVtZW50IGJ1dHRvblxyXG4gICAgICBoaWdobGlnaHREZWNyZW1lbnQ6IGZhbHNlLFxyXG5cclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggdmFsdWUgLSAxLCB2YWx1ZSArIDEgKSxcclxuICAgICAgbnVtYmVyUGlja2VyT3B0aW9uczoge1xyXG4gICAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuXHJcbiAgICAgICAgLy8gcGhldC1pb1xyXG4gICAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgLy8gYnkgZGVmYXVsdCwgaWNvbnMgZG9uJ3QgbmVlZCBpbnN0cnVtZW50YXRpb25cclxuICAgICAgfVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgbnVtYmVyUGlja2VyID0gbmV3IE51bWJlclBpY2tlciggbmV3IE51bWJlclByb3BlcnR5KCB2YWx1ZSApLCBuZXcgUHJvcGVydHkoIG9wdGlvbnMucmFuZ2UgKSwgb3B0aW9ucy5udW1iZXJQaWNrZXJPcHRpb25zICk7XHJcblxyXG4gICAgLy8gd2UgZG9uJ3Qgd2FudCB0aGlzIGljb24gdG8gaGF2ZSBrZXlib2FyZCBuYXZpZ2F0aW9uLCBvciBkZXNjcmlwdGlvbiBpbiB0aGUgUERPTS5cclxuICAgIG51bWJlclBpY2tlci5yZW1vdmVGcm9tUERPTSgpO1xyXG5cclxuICAgIGlmICggb3B0aW9ucy5oaWdobGlnaHREZWNyZW1lbnQgKSB7XHJcbiAgICAgIG51bWJlclBpY2tlci5kZWNyZW1lbnRJbnB1dExpc3RlbmVyLmlzT3ZlclByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGlmICggb3B0aW9ucy5oaWdobGlnaHRJbmNyZW1lbnQgKSB7XHJcbiAgICAgIG51bWJlclBpY2tlci5pbmNyZW1lbnRJbnB1dExpc3RlbmVyLmlzT3ZlclByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBudW1iZXJQaWNrZXI7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZU51bWJlclBpY2tlcigpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB2aXNpYmlsaXR5IG9mIHRoZSBhcnJvd3MuXHJcbiAgICovXHJcbiAgcHVibGljIHNldEFycm93c1Zpc2libGUoIHZpc2libGU6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBpZiAoICF2aXNpYmxlICkge1xyXG4gICAgICB0aGlzLmluY3JlbWVudElucHV0TGlzdGVuZXIuaW50ZXJydXB0KCk7XHJcbiAgICAgIHRoaXMuZGVjcmVtZW50SW5wdXRMaXN0ZW5lci5pbnRlcnJ1cHQoKTtcclxuICAgIH1cclxuICAgIHRoaXMuaW5jcmVtZW50QXJyb3cudmlzaWJsZSA9IHZpc2libGU7XHJcbiAgICB0aGlzLmRlY3JlbWVudEFycm93LnZpc2libGUgPSB2aXNpYmxlO1xyXG4gIH1cclxufVxyXG5cclxudHlwZSBOdW1iZXJQaWNrZXJJbnB1dExpc3RlbmVyU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG50eXBlIE51bWJlclBpY2tlcklucHV0TGlzdGVuZXJPcHRpb25zID0gTnVtYmVyUGlja2VySW5wdXRMaXN0ZW5lclNlbGZPcHRpb25zICYgRmlyZUxpc3RlbmVyT3B0aW9uczxGaXJlTGlzdGVuZXI+O1xyXG5cclxuLyoqXHJcbiAqIENvbnZlcnRzIEZpcmVMaXN0ZW5lciBldmVudHMgdG8gc3RhdGUgY2hhbmdlcy5cclxuICovXHJcbmNsYXNzIE51bWJlclBpY2tlcklucHV0TGlzdGVuZXIgZXh0ZW5kcyBGaXJlTGlzdGVuZXIge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGJ1dHRvblN0YXRlUHJvcGVydHk6IFN0cmluZ1VuaW9uUHJvcGVydHk8QnV0dG9uU3RhdGU+LCBvcHRpb25zOiBOdW1iZXJQaWNrZXJJbnB1dExpc3RlbmVyT3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBidXR0b24gc3RhdGUuICBObyBkaXNwb3NlIGlzIG5lZWRlZCBiZWNhdXNlIHRoZSBwYXJlbnQgY2xhc3MgZGlzcG9zZXMgdGhlIGRlcGVuZGVuY2llcy5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoXHJcbiAgICAgIFsgdGhpcy5pc092ZXJQcm9wZXJ0eSwgdGhpcy5pc1ByZXNzZWRQcm9wZXJ0eSBdLFxyXG4gICAgICAoIGlzT3ZlciwgaXNQcmVzc2VkICkgPT4ge1xyXG4gICAgICAgIGJ1dHRvblN0YXRlUHJvcGVydHkuc2V0KFxyXG4gICAgICAgICAgaXNPdmVyICYmICFpc1ByZXNzZWQgPyAnb3ZlcicgOlxyXG4gICAgICAgICAgaXNPdmVyICYmIGlzUHJlc3NlZCA/ICdkb3duJyA6XHJcbiAgICAgICAgICAhaXNPdmVyICYmICFpc1ByZXNzZWQgPyAndXAnIDpcclxuICAgICAgICAgICdvdXQnXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgdmVydGljYWwgZ3JhZGllbnQuXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVWZXJ0aWNhbEdyYWRpZW50KCB0b3BDb2xvcjogVENvbG9yLCBjZW50ZXJDb2xvcjogVENvbG9yLCBib3R0b21Db2xvcjogVENvbG9yLCBoZWlnaHQ6IG51bWJlciApOiBMaW5lYXJHcmFkaWVudCB7XHJcbiAgcmV0dXJuIG5ldyBMaW5lYXJHcmFkaWVudCggMCwgMCwgMCwgaGVpZ2h0IClcclxuICAgIC5hZGRDb2xvclN0b3AoIDAsIHRvcENvbG9yIClcclxuICAgIC5hZGRDb2xvclN0b3AoIDAuNSwgY2VudGVyQ29sb3IgKVxyXG4gICAgLmFkZENvbG9yU3RvcCggMSwgYm90dG9tQ29sb3IgKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZXMgYXJyb3cgYW5kIGJhY2tncm91bmQgY29sb3JzXHJcbiAqL1xyXG5mdW5jdGlvbiB1cGRhdGVDb2xvcnMoIGJ1dHRvblN0YXRlOiBCdXR0b25TdGF0ZSwgZW5hYmxlZDogYm9vbGVhbiwgYmFja2dyb3VuZE5vZGU6IFBhdGgsIGFycm93Tm9kZTogUGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3JzOiBCYWNrZ3JvdW5kQ29sb3JzLCBhcnJvd0NvbG9yczogQXJyb3dDb2xvcnMgKTogdm9pZCB7XHJcbiAgaWYgKCBlbmFibGVkICkge1xyXG4gICAgYXJyb3dOb2RlLnN0cm9rZSA9ICdibGFjayc7XHJcbiAgICBpZiAoIGJ1dHRvblN0YXRlID09PSAndXAnICkge1xyXG4gICAgICBiYWNrZ3JvdW5kTm9kZS5maWxsID0gYmFja2dyb3VuZENvbG9ycy51cDtcclxuICAgICAgYXJyb3dOb2RlLmZpbGwgPSBhcnJvd0NvbG9ycy51cDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBidXR0b25TdGF0ZSA9PT0gJ292ZXInICkge1xyXG4gICAgICBiYWNrZ3JvdW5kTm9kZS5maWxsID0gYmFja2dyb3VuZENvbG9ycy5vdmVyO1xyXG4gICAgICBhcnJvd05vZGUuZmlsbCA9IGFycm93Q29sb3JzLm92ZXI7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggYnV0dG9uU3RhdGUgPT09ICdkb3duJyApIHtcclxuICAgICAgYmFja2dyb3VuZE5vZGUuZmlsbCA9IGJhY2tncm91bmRDb2xvcnMuZG93bjtcclxuICAgICAgYXJyb3dOb2RlLmZpbGwgPSBhcnJvd0NvbG9ycy5kb3duO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGJ1dHRvblN0YXRlID09PSAnb3V0JyApIHtcclxuICAgICAgYmFja2dyb3VuZE5vZGUuZmlsbCA9IGJhY2tncm91bmRDb2xvcnMub3V0O1xyXG4gICAgICBhcnJvd05vZGUuZmlsbCA9IGFycm93Q29sb3JzLm91dDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGB1bnN1cHBvcnRlZCBidXR0b25TdGF0ZTogJHtidXR0b25TdGF0ZX1gICk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgYmFja2dyb3VuZE5vZGUuZmlsbCA9IGJhY2tncm91bmRDb2xvcnMuZGlzYWJsZWQ7XHJcbiAgICBhcnJvd05vZGUuZmlsbCA9IGFycm93Q29sb3JzLmRpc2FibGVkO1xyXG4gICAgYXJyb3dOb2RlLnN0cm9rZSA9IGFycm93Q29sb3JzLmRpc2FibGVkOyAvLyBzdHJva2Ugc28gdGhhdCBhcnJvdyBzaXplIHdpbGwgbG9vayB0aGUgc2FtZSB3aGVuIGl0J3MgZW5hYmxlZC9kaXNhYmxlZFxyXG4gIH1cclxufVxyXG5cclxuc3VuLnJlZ2lzdGVyKCAnTnVtYmVyUGlja2VyJywgTnVtYmVyUGlja2VyICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsbUJBQW1CLE1BQU0sc0NBQXNDO0FBQ3RFLE9BQU9DLGVBQWUsTUFBTSxrQ0FBa0M7QUFDOUQsT0FBT0MsU0FBUyxNQUFNLDRCQUE0QjtBQUNsRCxPQUFPQyxjQUFjLE1BQU0saUNBQWlDO0FBQzVELE9BQU9DLFFBQVEsTUFBTSwyQkFBMkI7QUFDaEQsT0FBT0MsVUFBVSxNQUFNLDRCQUE0QjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sdUJBQXVCO0FBQ3pDLE9BQU9DLEtBQUssTUFBTSx1QkFBdUI7QUFDekMsU0FBU0Ms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