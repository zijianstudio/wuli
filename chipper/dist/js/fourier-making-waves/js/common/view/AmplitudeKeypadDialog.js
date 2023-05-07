// Copyright 2020-2023, University of Colorado Boulder

/**
 * AmplitudeKeypadDialog is a Dialog that provides a keypad for entering an amplitude value.
 * Pressing the Enter button calls options.enterCallback, provided by the client.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import Keypad from '../../../../scenery-phet/js/keypad/Keypad.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Dialog from '../../../../sun/js/Dialog.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import FourierMakingWavesStrings from '../../FourierMakingWavesStrings.js';
import FMWConstants from '../FMWConstants.js';
import FMWSymbols from '../FMWSymbols.js';

// constants
const TITLE_FONT = new PhetFont(18);
const BUTTON_FONT = new PhetFont(16);
const VALUE_FONT = new PhetFont(14);
const VALID_VALUE_FILL = 'black';
const INVALID_VALUE_FILL = 'red';
const KEYPAD_DISPLAY_FONT = new PhetFont(12);
const ALIGN_VALUE_VALUES = ['left', 'center', 'right'];
export default class AmplitudeKeypadDialog extends Dialog {
  /**
   * @param {Range} amplitudeRange
   * @param {Object} [options]
   */
  constructor(amplitudeRange, options) {
    assert && assert(amplitudeRange instanceof Range);
    options = merge({
      // Number of decimal places that can be entered for values.
      decimalPlaces: FMWConstants.DISCRETE_AMPLITUDE_DECIMAL_PLACES,
      // Dialog options
      closeButtonLength: 12,
      cornerRadius: FMWConstants.PANEL_CORNER_RADIUS,
      layoutStrategy: (dialog, simBounds, screenBounds, scale) => {
        assert && assert(dialog.layoutBounds);

        // a little below center, so that it does not overlap the Amplitudes chart
        dialog.centerX = dialog.layoutBounds.centerX;
        dialog.centerY = dialog.layoutBounds.centerY + 50;
      },
      // phet-io
      phetioReadOnly: true
    }, options);

    // Compute the maximum number of digits that can be entered on the keypad.
    const maxDigits = Math.max(Utils.toFixed(amplitudeRange.min, options.decimalPlaces).replace(/[^0-9]/g, '').length, Utils.toFixed(amplitudeRange.max, options.decimalPlaces).replace(/[^0-9]/g, '').length);
    const keypad = new Keypad(Keypad.PositiveAndNegativeFloatingPointLayout, {
      accumulatorOptions: {
        maxDigits: maxDigits,
        maxDigitsRightOfMantissa: options.decimalPlaces
      },
      buttonWidth: 25,
      buttonHeight: 25,
      buttonFont: BUTTON_FONT
    });
    const orderProperty = new NumberProperty(1, {
      numberType: 'Integer',
      isValidValue: value => value > 0
    });

    // Title indicates which amplitude we're editing, e.g. A<sub>2</sub>.
    const titleStringProperty = new DerivedProperty([FMWSymbols.AStringProperty, orderProperty], (A, order) => `${A}<sub>${order}</sub>`);
    const titleNode = new RichText(titleStringProperty, {
      font: TITLE_FONT,
      maxWidth: keypad.width
    });

    // Range of valid values is shown
    const rangeStringProperty = new PatternStringProperty(FourierMakingWavesStrings.minToMaxStringProperty, {
      min: Utils.toFixedNumber(amplitudeRange.min, options.decimalPlaces),
      max: Utils.toFixedNumber(amplitudeRange.max, options.decimalPlaces)
    });
    const rangeNode = new Text(rangeStringProperty, {
      font: VALUE_FONT,
      maxWidth: keypad.width
    });

    // Displays what has been entered on the keypad. We cannot use NumberDisplay because it displays numbers,
    // and is not capable of displaying partial numeric input like '1.'
    const stringDisplay = new KeypadStringDisplay(keypad.stringProperty, {
      width: keypad.width,
      height: 28,
      // determined empirically
      rectangleOptions: {
        cornerRadius: 2
      },
      textOptions: {
        font: VALUE_FONT
      }
    });

    // Enter button, processes what has been entered on the keypad
    const enterButton = new RectangularPushButton({
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      content: new Text(FourierMakingWavesStrings.enterStringProperty, {
        font: BUTTON_FONT,
        maxWidth: keypad.width
      })
    });

    // Vertical layout
    const content = new VBox({
      spacing: 10,
      align: 'center',
      children: [titleNode, rangeNode, stringDisplay, keypad, enterButton]
    });
    super(content, options);

    // @private
    this.keypad = keypad; // {KeyPad}
    this.titleNode = titleNode; // {RichText}
    this.orderProperty = orderProperty;

    // @private {function(amplitude:number)|null} called when the Enter button fires
    this.enterCallback = null;

    // @private {function|null} called when the dialog has been closed
    this.closeCallback = null;

    // When the Enter button fires...
    enterButton.addListener(() => {
      const value = this.keypad.valueProperty.value;
      if (value === null) {

        // Nothing was entered, so do nothing.
      } else if (amplitudeRange.contains(value)) {
        // A valid value was entered. Provide the value to the client and close the dialog.
        this.enterCallback(value);
        this.hide();
      } else {
        // An invalid value was entered, indicate by highlighting the value and range.
        stringDisplay.setTextFill(INVALID_VALUE_FILL);
        rangeNode.fill = INVALID_VALUE_FILL;
      }
    });

    // When any key is pressed, restore colors.
    keypad.accumulatedKeysProperty.link(() => {
      stringDisplay.setTextFill(VALID_VALUE_FILL);
      rangeNode.fill = VALID_VALUE_FILL;
    });
  }

  /**
   * Shows the dialog.
   * @param {number} order - the order of the harmonic
   * @param {function(amplitude:number)} enterCallback - called when the Enter button fires
   * @param {function} closeCallback - called when the dialog has been closed
   * @public
   * @override
   */
  show(order, enterCallback, closeCallback) {
    assert && AssertUtils.assertPositiveInteger(order);
    assert && assert(typeof enterCallback === 'function');
    assert && assert(typeof closeCallback === 'function');
    this.orderProperty.value = order; // causes titleNode to update
    this.enterCallback = enterCallback;
    this.closeCallback = closeCallback;
    this.keypad.clear();
    super.show();
  }

  /**
   * Hides the dialog.
   * @public
   * @override
   */
  hide() {
    super.hide();
    this.interruptSubtreeInput();
    this.closeCallback();
    this.enterCallback = null;
    this.closeCallback = null;
    this.keypad.clear();
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}

/**
 * Displays a Keypad's stringProperty value, showing what keys the user has 'typed'.
 */
class KeypadStringDisplay extends Node {
  /**
   * @param {ReadOnlyProperty.<string>} stringProperty
   * @param {Object} [options]
   */
  constructor(stringProperty, options) {
    assert && AssertUtils.assertAbstractPropertyOf(stringProperty, 'string');
    options = merge({
      // StringDisplay options
      align: 'center',
      width: 100,
      height: 50,
      xMargin: 0,
      yMargin: 0,
      stringFormat: string => string,
      // Rectangle options
      rectangleOptions: {
        cornerRadius: 0,
        fill: 'white',
        stroke: 'black'
      },
      // Text options
      textOptions: {
        fill: 'black',
        font: KEYPAD_DISPLAY_FONT
      }
    }, options);
    assert && assert(ALIGN_VALUE_VALUES.includes(options.align), `invalid align: ${options.align}`);
    const rectangle = new Rectangle(0, 0, options.width, options.height, options.rectangleOptions);
    const textNode = new RichText('', merge({
      maxWidth: rectangle.width - 2 * options.xMargin,
      maxHeight: rectangle.height - 2 * options.yMargin
    }, options.textOptions));
    assert && assert(!options.children, 'StringDisplay sets children');
    options.children = [rectangle, textNode];
    super(options);

    // Display the string value. unlink is required on dispose.
    const stringListener = string => {
      textNode.string = options.stringFormat(string);
    };
    stringProperty.link(stringListener);

    // Keep the text centered in the background. unlink is not required.
    textNode.boundsProperty.link(() => {
      textNode.center = rectangle.center;
    });

    // @private
    this.textNode = textNode; // {RichText}

    // @private
    this.disposeStringDisplay = () => {
      stringProperty.unlink(stringListener);
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeStringDisplay();
    super.dispose();
  }

  /**
   * Sets the fill for the text.
   * @param {string} fill
   * @public
   */
  setTextFill(fill) {
    this.textNode.fill = fill;
  }
}
fourierMakingWaves.register('AmplitudeKeypadDialog', AmplitudeKeypadDialog);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsIlJhbmdlIiwiVXRpbHMiLCJtZXJnZSIsIkFzc2VydFV0aWxzIiwiS2V5cGFkIiwiUGhldENvbG9yU2NoZW1lIiwiUGhldEZvbnQiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiUmljaFRleHQiLCJUZXh0IiwiVkJveCIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIkRpYWxvZyIsImZvdXJpZXJNYWtpbmdXYXZlcyIsIkZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MiLCJGTVdDb25zdGFudHMiLCJGTVdTeW1ib2xzIiwiVElUTEVfRk9OVCIsIkJVVFRPTl9GT05UIiwiVkFMVUVfRk9OVCIsIlZBTElEX1ZBTFVFX0ZJTEwiLCJJTlZBTElEX1ZBTFVFX0ZJTEwiLCJLRVlQQURfRElTUExBWV9GT05UIiwiQUxJR05fVkFMVUVfVkFMVUVTIiwiQW1wbGl0dWRlS2V5cGFkRGlhbG9nIiwiY29uc3RydWN0b3IiLCJhbXBsaXR1ZGVSYW5nZSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJkZWNpbWFsUGxhY2VzIiwiRElTQ1JFVEVfQU1QTElUVURFX0RFQ0lNQUxfUExBQ0VTIiwiY2xvc2VCdXR0b25MZW5ndGgiLCJjb3JuZXJSYWRpdXMiLCJQQU5FTF9DT1JORVJfUkFESVVTIiwibGF5b3V0U3RyYXRlZ3kiLCJkaWFsb2ciLCJzaW1Cb3VuZHMiLCJzY3JlZW5Cb3VuZHMiLCJzY2FsZSIsImxheW91dEJvdW5kcyIsImNlbnRlclgiLCJjZW50ZXJZIiwicGhldGlvUmVhZE9ubHkiLCJtYXhEaWdpdHMiLCJNYXRoIiwibWF4IiwidG9GaXhlZCIsIm1pbiIsInJlcGxhY2UiLCJsZW5ndGgiLCJrZXlwYWQiLCJQb3NpdGl2ZUFuZE5lZ2F0aXZlRmxvYXRpbmdQb2ludExheW91dCIsImFjY3VtdWxhdG9yT3B0aW9ucyIsIm1heERpZ2l0c1JpZ2h0T2ZNYW50aXNzYSIsImJ1dHRvbldpZHRoIiwiYnV0dG9uSGVpZ2h0IiwiYnV0dG9uRm9udCIsIm9yZGVyUHJvcGVydHkiLCJudW1iZXJUeXBlIiwiaXNWYWxpZFZhbHVlIiwidmFsdWUiLCJ0aXRsZVN0cmluZ1Byb3BlcnR5IiwiQVN0cmluZ1Byb3BlcnR5IiwiQSIsIm9yZGVyIiwidGl0bGVOb2RlIiwiZm9udCIsIm1heFdpZHRoIiwid2lkdGgiLCJyYW5nZVN0cmluZ1Byb3BlcnR5IiwibWluVG9NYXhTdHJpbmdQcm9wZXJ0eSIsInRvRml4ZWROdW1iZXIiLCJyYW5nZU5vZGUiLCJzdHJpbmdEaXNwbGF5IiwiS2V5cGFkU3RyaW5nRGlzcGxheSIsInN0cmluZ1Byb3BlcnR5IiwiaGVpZ2h0IiwicmVjdGFuZ2xlT3B0aW9ucyIsInRleHRPcHRpb25zIiwiZW50ZXJCdXR0b24iLCJiYXNlQ29sb3IiLCJCVVRUT05fWUVMTE9XIiwiY29udGVudCIsImVudGVyU3RyaW5nUHJvcGVydHkiLCJzcGFjaW5nIiwiYWxpZ24iLCJjaGlsZHJlbiIsImVudGVyQ2FsbGJhY2siLCJjbG9zZUNhbGxiYWNrIiwiYWRkTGlzdGVuZXIiLCJ2YWx1ZVByb3BlcnR5IiwiY29udGFpbnMiLCJoaWRlIiwic2V0VGV4dEZpbGwiLCJmaWxsIiwiYWNjdW11bGF0ZWRLZXlzUHJvcGVydHkiLCJsaW5rIiwic2hvdyIsImFzc2VydFBvc2l0aXZlSW50ZWdlciIsImNsZWFyIiwiaW50ZXJydXB0U3VidHJlZUlucHV0IiwiZGlzcG9zZSIsImFzc2VydEFic3RyYWN0UHJvcGVydHlPZiIsInhNYXJnaW4iLCJ5TWFyZ2luIiwic3RyaW5nRm9ybWF0Iiwic3RyaW5nIiwic3Ryb2tlIiwiaW5jbHVkZXMiLCJyZWN0YW5nbGUiLCJ0ZXh0Tm9kZSIsIm1heEhlaWdodCIsInN0cmluZ0xpc3RlbmVyIiwiYm91bmRzUHJvcGVydHkiLCJjZW50ZXIiLCJkaXNwb3NlU3RyaW5nRGlzcGxheSIsInVubGluayIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQW1wbGl0dWRlS2V5cGFkRGlhbG9nLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFtcGxpdHVkZUtleXBhZERpYWxvZyBpcyBhIERpYWxvZyB0aGF0IHByb3ZpZGVzIGEga2V5cGFkIGZvciBlbnRlcmluZyBhbiBhbXBsaXR1ZGUgdmFsdWUuXHJcbiAqIFByZXNzaW5nIHRoZSBFbnRlciBidXR0b24gY2FsbHMgb3B0aW9ucy5lbnRlckNhbGxiYWNrLCBwcm92aWRlZCBieSB0aGUgY2xpZW50LlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQYXR0ZXJuU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9QYXR0ZXJuU3RyaW5nUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgQXNzZXJ0VXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9Bc3NlcnRVdGlscy5qcyc7XHJcbmltcG9ydCBLZXlwYWQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2tleXBhZC9LZXlwYWQuanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUmVjdGFuZ2xlLCBSaWNoVGV4dCwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IERpYWxvZyBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvRGlhbG9nLmpzJztcclxuaW1wb3J0IGZvdXJpZXJNYWtpbmdXYXZlcyBmcm9tICcuLi8uLi9mb3VyaWVyTWFraW5nV2F2ZXMuanMnO1xyXG5pbXBvcnQgRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncyBmcm9tICcuLi8uLi9Gb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IEZNV0NvbnN0YW50cyBmcm9tICcuLi9GTVdDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRk1XU3ltYm9scyBmcm9tICcuLi9GTVdTeW1ib2xzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBUSVRMRV9GT05UID0gbmV3IFBoZXRGb250KCAxOCApO1xyXG5jb25zdCBCVVRUT05fRk9OVCA9IG5ldyBQaGV0Rm9udCggMTYgKTtcclxuY29uc3QgVkFMVUVfRk9OVCA9IG5ldyBQaGV0Rm9udCggMTQgKTtcclxuY29uc3QgVkFMSURfVkFMVUVfRklMTCA9ICdibGFjayc7XHJcbmNvbnN0IElOVkFMSURfVkFMVUVfRklMTCA9ICdyZWQnO1xyXG5jb25zdCBLRVlQQURfRElTUExBWV9GT05UID0gbmV3IFBoZXRGb250KCAxMiApO1xyXG5jb25zdCBBTElHTl9WQUxVRV9WQUxVRVMgPSBbICdsZWZ0JywgJ2NlbnRlcicsICdyaWdodCcgXTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFtcGxpdHVkZUtleXBhZERpYWxvZyBleHRlbmRzIERpYWxvZyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UmFuZ2V9IGFtcGxpdHVkZVJhbmdlXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBhbXBsaXR1ZGVSYW5nZSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhbXBsaXR1ZGVSYW5nZSBpbnN0YW5jZW9mIFJhbmdlICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBOdW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgdGhhdCBjYW4gYmUgZW50ZXJlZCBmb3IgdmFsdWVzLlxyXG4gICAgICBkZWNpbWFsUGxhY2VzOiBGTVdDb25zdGFudHMuRElTQ1JFVEVfQU1QTElUVURFX0RFQ0lNQUxfUExBQ0VTLFxyXG5cclxuICAgICAgLy8gRGlhbG9nIG9wdGlvbnNcclxuICAgICAgY2xvc2VCdXR0b25MZW5ndGg6IDEyLFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IEZNV0NvbnN0YW50cy5QQU5FTF9DT1JORVJfUkFESVVTLFxyXG4gICAgICBsYXlvdXRTdHJhdGVneTogKCBkaWFsb2csIHNpbUJvdW5kcywgc2NyZWVuQm91bmRzLCBzY2FsZSApID0+IHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkaWFsb2cubGF5b3V0Qm91bmRzICk7XHJcblxyXG4gICAgICAgIC8vIGEgbGl0dGxlIGJlbG93IGNlbnRlciwgc28gdGhhdCBpdCBkb2VzIG5vdCBvdmVybGFwIHRoZSBBbXBsaXR1ZGVzIGNoYXJ0XHJcbiAgICAgICAgZGlhbG9nLmNlbnRlclggPSBkaWFsb2cubGF5b3V0Qm91bmRzLmNlbnRlclg7XHJcbiAgICAgICAgZGlhbG9nLmNlbnRlclkgPSBkaWFsb2cubGF5b3V0Qm91bmRzLmNlbnRlclkgKyA1MDtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWVcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBDb21wdXRlIHRoZSBtYXhpbXVtIG51bWJlciBvZiBkaWdpdHMgdGhhdCBjYW4gYmUgZW50ZXJlZCBvbiB0aGUga2V5cGFkLlxyXG4gICAgY29uc3QgbWF4RGlnaXRzID0gTWF0aC5tYXgoXHJcbiAgICAgIFV0aWxzLnRvRml4ZWQoIGFtcGxpdHVkZVJhbmdlLm1pbiwgb3B0aW9ucy5kZWNpbWFsUGxhY2VzICkucmVwbGFjZSggL1teMC05XS9nLCAnJyApLmxlbmd0aCxcclxuICAgICAgVXRpbHMudG9GaXhlZCggYW1wbGl0dWRlUmFuZ2UubWF4LCBvcHRpb25zLmRlY2ltYWxQbGFjZXMgKS5yZXBsYWNlKCAvW14wLTldL2csICcnICkubGVuZ3RoXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGtleXBhZCA9IG5ldyBLZXlwYWQoIEtleXBhZC5Qb3NpdGl2ZUFuZE5lZ2F0aXZlRmxvYXRpbmdQb2ludExheW91dCwge1xyXG4gICAgICBhY2N1bXVsYXRvck9wdGlvbnM6IHtcclxuICAgICAgICBtYXhEaWdpdHM6IG1heERpZ2l0cyxcclxuICAgICAgICBtYXhEaWdpdHNSaWdodE9mTWFudGlzc2E6IG9wdGlvbnMuZGVjaW1hbFBsYWNlc1xyXG4gICAgICB9LFxyXG4gICAgICBidXR0b25XaWR0aDogMjUsXHJcbiAgICAgIGJ1dHRvbkhlaWdodDogMjUsXHJcbiAgICAgIGJ1dHRvbkZvbnQ6IEJVVFRPTl9GT05UXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgb3JkZXJQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMSwge1xyXG4gICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXHJcbiAgICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gKCB2YWx1ZSA+IDAgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRpdGxlIGluZGljYXRlcyB3aGljaCBhbXBsaXR1ZGUgd2UncmUgZWRpdGluZywgZS5nLiBBPHN1Yj4yPC9zdWI+LlxyXG4gICAgY29uc3QgdGl0bGVTdHJpbmdQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgRk1XU3ltYm9scy5BU3RyaW5nUHJvcGVydHksIG9yZGVyUHJvcGVydHkgXSxcclxuICAgICAgKCBBLCBvcmRlciApID0+IGAke0F9PHN1Yj4ke29yZGVyfTwvc3ViPmAgKTtcclxuICAgIGNvbnN0IHRpdGxlTm9kZSA9IG5ldyBSaWNoVGV4dCggdGl0bGVTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBUSVRMRV9GT05ULFxyXG4gICAgICBtYXhXaWR0aDoga2V5cGFkLndpZHRoXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUmFuZ2Ugb2YgdmFsaWQgdmFsdWVzIGlzIHNob3duXHJcbiAgICBjb25zdCByYW5nZVN0cmluZ1Byb3BlcnR5ID0gbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5taW5Ub01heFN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIG1pbjogVXRpbHMudG9GaXhlZE51bWJlciggYW1wbGl0dWRlUmFuZ2UubWluLCBvcHRpb25zLmRlY2ltYWxQbGFjZXMgKSxcclxuICAgICAgbWF4OiBVdGlscy50b0ZpeGVkTnVtYmVyKCBhbXBsaXR1ZGVSYW5nZS5tYXgsIG9wdGlvbnMuZGVjaW1hbFBsYWNlcyApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCByYW5nZU5vZGUgPSBuZXcgVGV4dCggcmFuZ2VTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBWQUxVRV9GT05ULFxyXG4gICAgICBtYXhXaWR0aDoga2V5cGFkLndpZHRoXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRGlzcGxheXMgd2hhdCBoYXMgYmVlbiBlbnRlcmVkIG9uIHRoZSBrZXlwYWQuIFdlIGNhbm5vdCB1c2UgTnVtYmVyRGlzcGxheSBiZWNhdXNlIGl0IGRpc3BsYXlzIG51bWJlcnMsXHJcbiAgICAvLyBhbmQgaXMgbm90IGNhcGFibGUgb2YgZGlzcGxheWluZyBwYXJ0aWFsIG51bWVyaWMgaW5wdXQgbGlrZSAnMS4nXHJcbiAgICBjb25zdCBzdHJpbmdEaXNwbGF5ID0gbmV3IEtleXBhZFN0cmluZ0Rpc3BsYXkoIGtleXBhZC5zdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICB3aWR0aDoga2V5cGFkLndpZHRoLFxyXG4gICAgICBoZWlnaHQ6IDI4LCAvLyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgIHJlY3RhbmdsZU9wdGlvbnM6IHtcclxuICAgICAgICBjb3JuZXJSYWRpdXM6IDJcclxuICAgICAgfSxcclxuICAgICAgdGV4dE9wdGlvbnM6IHtcclxuICAgICAgICBmb250OiBWQUxVRV9GT05UXHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBFbnRlciBidXR0b24sIHByb2Nlc3NlcyB3aGF0IGhhcyBiZWVuIGVudGVyZWQgb24gdGhlIGtleXBhZFxyXG4gICAgY29uc3QgZW50ZXJCdXR0b24gPSBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCB7XHJcbiAgICAgIGJhc2VDb2xvcjogUGhldENvbG9yU2NoZW1lLkJVVFRPTl9ZRUxMT1csXHJcbiAgICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLmVudGVyU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICBmb250OiBCVVRUT05fRk9OVCxcclxuICAgICAgICBtYXhXaWR0aDoga2V5cGFkLndpZHRoXHJcbiAgICAgIH0gKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFZlcnRpY2FsIGxheW91dFxyXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgIGNoaWxkcmVuOiBbIHRpdGxlTm9kZSwgcmFuZ2VOb2RlLCBzdHJpbmdEaXNwbGF5LCBrZXlwYWQsIGVudGVyQnV0dG9uIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggY29udGVudCwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmtleXBhZCA9IGtleXBhZDsgLy8ge0tleVBhZH1cclxuICAgIHRoaXMudGl0bGVOb2RlID0gdGl0bGVOb2RlOyAvLyB7UmljaFRleHR9XHJcbiAgICB0aGlzLm9yZGVyUHJvcGVydHkgPSBvcmRlclByb3BlcnR5O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbihhbXBsaXR1ZGU6bnVtYmVyKXxudWxsfSBjYWxsZWQgd2hlbiB0aGUgRW50ZXIgYnV0dG9uIGZpcmVzXHJcbiAgICB0aGlzLmVudGVyQ2FsbGJhY2sgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbnxudWxsfSBjYWxsZWQgd2hlbiB0aGUgZGlhbG9nIGhhcyBiZWVuIGNsb3NlZFxyXG4gICAgdGhpcy5jbG9zZUNhbGxiYWNrID0gbnVsbDtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSBFbnRlciBidXR0b24gZmlyZXMuLi5cclxuICAgIGVudGVyQnV0dG9uLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5rZXlwYWQudmFsdWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgaWYgKCB2YWx1ZSA9PT0gbnVsbCApIHtcclxuXHJcbiAgICAgICAgLy8gTm90aGluZyB3YXMgZW50ZXJlZCwgc28gZG8gbm90aGluZy5cclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggYW1wbGl0dWRlUmFuZ2UuY29udGFpbnMoIHZhbHVlICkgKSB7XHJcblxyXG4gICAgICAgIC8vIEEgdmFsaWQgdmFsdWUgd2FzIGVudGVyZWQuIFByb3ZpZGUgdGhlIHZhbHVlIHRvIHRoZSBjbGllbnQgYW5kIGNsb3NlIHRoZSBkaWFsb2cuXHJcbiAgICAgICAgdGhpcy5lbnRlckNhbGxiYWNrKCB2YWx1ZSApO1xyXG4gICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBBbiBpbnZhbGlkIHZhbHVlIHdhcyBlbnRlcmVkLCBpbmRpY2F0ZSBieSBoaWdobGlnaHRpbmcgdGhlIHZhbHVlIGFuZCByYW5nZS5cclxuICAgICAgICBzdHJpbmdEaXNwbGF5LnNldFRleHRGaWxsKCBJTlZBTElEX1ZBTFVFX0ZJTEwgKTtcclxuICAgICAgICByYW5nZU5vZGUuZmlsbCA9IElOVkFMSURfVkFMVUVfRklMTDtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdoZW4gYW55IGtleSBpcyBwcmVzc2VkLCByZXN0b3JlIGNvbG9ycy5cclxuICAgIGtleXBhZC5hY2N1bXVsYXRlZEtleXNQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIHN0cmluZ0Rpc3BsYXkuc2V0VGV4dEZpbGwoIFZBTElEX1ZBTFVFX0ZJTEwgKTtcclxuICAgICAgcmFuZ2VOb2RlLmZpbGwgPSBWQUxJRF9WQUxVRV9GSUxMO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2hvd3MgdGhlIGRpYWxvZy5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gb3JkZXIgLSB0aGUgb3JkZXIgb2YgdGhlIGhhcm1vbmljXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbihhbXBsaXR1ZGU6bnVtYmVyKX0gZW50ZXJDYWxsYmFjayAtIGNhbGxlZCB3aGVuIHRoZSBFbnRlciBidXR0b24gZmlyZXNcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjbG9zZUNhbGxiYWNrIC0gY2FsbGVkIHdoZW4gdGhlIGRpYWxvZyBoYXMgYmVlbiBjbG9zZWRcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgc2hvdyggb3JkZXIsIGVudGVyQ2FsbGJhY2ssIGNsb3NlQ2FsbGJhY2sgKSB7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UG9zaXRpdmVJbnRlZ2VyKCBvcmRlciApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGVudGVyQ2FsbGJhY2sgPT09ICdmdW5jdGlvbicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBjbG9zZUNhbGxiYWNrID09PSAnZnVuY3Rpb24nICk7XHJcblxyXG4gICAgdGhpcy5vcmRlclByb3BlcnR5LnZhbHVlID0gb3JkZXI7IC8vIGNhdXNlcyB0aXRsZU5vZGUgdG8gdXBkYXRlXHJcbiAgICB0aGlzLmVudGVyQ2FsbGJhY2sgPSBlbnRlckNhbGxiYWNrO1xyXG4gICAgdGhpcy5jbG9zZUNhbGxiYWNrID0gY2xvc2VDYWxsYmFjaztcclxuICAgIHRoaXMua2V5cGFkLmNsZWFyKCk7XHJcblxyXG4gICAgc3VwZXIuc2hvdygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGlkZXMgdGhlIGRpYWxvZy5cclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgaGlkZSgpIHtcclxuICAgIHN1cGVyLmhpZGUoKTtcclxuXHJcbiAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xyXG4gICAgdGhpcy5jbG9zZUNhbGxiYWNrKCk7XHJcbiAgICB0aGlzLmVudGVyQ2FsbGJhY2sgPSBudWxsO1xyXG4gICAgdGhpcy5jbG9zZUNhbGxiYWNrID0gbnVsbDtcclxuICAgIHRoaXMua2V5cGFkLmNsZWFyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIERpc3BsYXlzIGEgS2V5cGFkJ3Mgc3RyaW5nUHJvcGVydHkgdmFsdWUsIHNob3dpbmcgd2hhdCBrZXlzIHRoZSB1c2VyIGhhcyAndHlwZWQnLlxyXG4gKi9cclxuY2xhc3MgS2V5cGFkU3RyaW5nRGlzcGxheSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1JlYWRPbmx5UHJvcGVydHkuPHN0cmluZz59IHN0cmluZ1Byb3BlcnR5XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBzdHJpbmdQcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0QWJzdHJhY3RQcm9wZXJ0eU9mKCBzdHJpbmdQcm9wZXJ0eSwgJ3N0cmluZycgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIFN0cmluZ0Rpc3BsYXkgb3B0aW9uc1xyXG4gICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgIHdpZHRoOiAxMDAsXHJcbiAgICAgIGhlaWdodDogNTAsXHJcbiAgICAgIHhNYXJnaW46IDAsXHJcbiAgICAgIHlNYXJnaW46IDAsXHJcbiAgICAgIHN0cmluZ0Zvcm1hdDogc3RyaW5nID0+IHN0cmluZyxcclxuXHJcbiAgICAgIC8vIFJlY3RhbmdsZSBvcHRpb25zXHJcbiAgICAgIHJlY3RhbmdsZU9wdGlvbnM6IHtcclxuICAgICAgICBjb3JuZXJSYWRpdXM6IDAsXHJcbiAgICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgICBzdHJva2U6ICdibGFjaydcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFRleHQgb3B0aW9uc1xyXG4gICAgICB0ZXh0T3B0aW9uczoge1xyXG4gICAgICAgIGZpbGw6ICdibGFjaycsXHJcbiAgICAgICAgZm9udDogS0VZUEFEX0RJU1BMQVlfRk9OVFxyXG4gICAgICB9XHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQUxJR05fVkFMVUVfVkFMVUVTLmluY2x1ZGVzKCBvcHRpb25zLmFsaWduICksIGBpbnZhbGlkIGFsaWduOiAke29wdGlvbnMuYWxpZ259YCApO1xyXG5cclxuICAgIGNvbnN0IHJlY3RhbmdsZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIG9wdGlvbnMud2lkdGgsIG9wdGlvbnMuaGVpZ2h0LCBvcHRpb25zLnJlY3RhbmdsZU9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCB0ZXh0Tm9kZSA9IG5ldyBSaWNoVGV4dCggJycsIG1lcmdlKCB7XHJcbiAgICAgIG1heFdpZHRoOiByZWN0YW5nbGUud2lkdGggLSAyICogb3B0aW9ucy54TWFyZ2luLFxyXG4gICAgICBtYXhIZWlnaHQ6IHJlY3RhbmdsZS5oZWlnaHQgLSAyICogb3B0aW9ucy55TWFyZ2luXHJcbiAgICB9LCBvcHRpb25zLnRleHRPcHRpb25zICkgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5jaGlsZHJlbiwgJ1N0cmluZ0Rpc3BsYXkgc2V0cyBjaGlsZHJlbicgKTtcclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIHJlY3RhbmdsZSwgdGV4dE5vZGUgXTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIERpc3BsYXkgdGhlIHN0cmluZyB2YWx1ZS4gdW5saW5rIGlzIHJlcXVpcmVkIG9uIGRpc3Bvc2UuXHJcbiAgICBjb25zdCBzdHJpbmdMaXN0ZW5lciA9IHN0cmluZyA9PiB7IHRleHROb2RlLnN0cmluZyA9IG9wdGlvbnMuc3RyaW5nRm9ybWF0KCBzdHJpbmcgKTsgfTtcclxuICAgIHN0cmluZ1Byb3BlcnR5LmxpbmsoIHN0cmluZ0xpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gS2VlcCB0aGUgdGV4dCBjZW50ZXJlZCBpbiB0aGUgYmFja2dyb3VuZC4gdW5saW5rIGlzIG5vdCByZXF1aXJlZC5cclxuICAgIHRleHROb2RlLmJvdW5kc1Byb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgdGV4dE5vZGUuY2VudGVyID0gcmVjdGFuZ2xlLmNlbnRlcjtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy50ZXh0Tm9kZSA9IHRleHROb2RlOyAvLyB7UmljaFRleHR9XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZGlzcG9zZVN0cmluZ0Rpc3BsYXkgPSAoKSA9PiB7XHJcbiAgICAgIHN0cmluZ1Byb3BlcnR5LnVubGluayggc3RyaW5nTGlzdGVuZXIgKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGlzcG9zZVN0cmluZ0Rpc3BsYXkoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGZpbGwgZm9yIHRoZSB0ZXh0LlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxsXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFRleHRGaWxsKCBmaWxsICkge1xyXG4gICAgdGhpcy50ZXh0Tm9kZS5maWxsID0gZmlsbDtcclxuICB9XHJcbn1cclxuXHJcbmZvdXJpZXJNYWtpbmdXYXZlcy5yZWdpc3RlciggJ0FtcGxpdHVkZUtleXBhZERpYWxvZycsIEFtcGxpdHVkZUtleXBhZERpYWxvZyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxxQkFBcUIsTUFBTSw4Q0FBOEM7QUFDaEYsT0FBT0MsS0FBSyxNQUFNLDZC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