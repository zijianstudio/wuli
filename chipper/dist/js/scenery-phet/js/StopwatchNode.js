// Copyright 2014-2023, University of Colorado Boulder

/**
 * Shows a readout of the elapsed time, with play and pause buttons.  By default there are no units (which could be used
 * if all of a simulations time units are in 'seconds'), or you can specify a selection of units to choose from.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Anton Ulyanov (Mlearner)
 */

import Bounds2 from '../../dot/js/Bounds2.js';
import Utils from '../../dot/js/Utils.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import { Circle, DragListener, HBox, InteractiveHighlighting, Node, Path, VBox } from '../../scenery/js/imports.js';
import BooleanRectangularToggleButton from '../../sun/js/buttons/BooleanRectangularToggleButton.js';
import RectangularPushButton from '../../sun/js/buttons/RectangularPushButton.js';
import Tandem from '../../tandem/js/Tandem.js';
import DragBoundsProperty from './DragBoundsProperty.js';
import NumberDisplay from './NumberDisplay.js';
import PauseIconShape from './PauseIconShape.js';
import PhetFont from './PhetFont.js';
import PlayIconShape from './PlayIconShape.js';
import sceneryPhet from './sceneryPhet.js';
import SceneryPhetStrings from './SceneryPhetStrings.js';
import ShadedRectangle from './ShadedRectangle.js';
import Stopwatch from './Stopwatch.js';
import UTurnArrowShape from './UTurnArrowShape.js';
export default class StopwatchNode extends InteractiveHighlighting(Node) {
  // options propagated to the NumberDisplay

  // Non-null if draggable. Can be used for forwarding press events when dragging out of a toolbox.

  // We used to use Lucida Console, Arial, but Arial has smaller number width for "11" and hence was causing jitter.
  // Neither Trebuchet MS and Lucida Grande is a monospace font, but the digits all appear to be monospace.
  // Use Trebuchet first, since it has broader cross-platform support.
  // Another advantage of using a non-monospace font (with monospace digits) is that the : and . symbols aren't as
  // wide as the numerals. @ariel-phet and @samreid tested this combination of families on Mac/Chrome and Windows/Chrome
  // and it seemed to work nicely, with no jitter.
  static NUMBER_FONT_FAMILY = '"Trebuchet MS", "Lucida Grande", monospace';
  static DEFAULT_FONT = new PhetFont({
    size: 20,
    family: StopwatchNode.NUMBER_FONT_FAMILY
  });

  /**
   * A value for options.numberDisplayOptions.numberFormatter where time is interpreted as minutes and seconds.
   * The format is MM:SS.CC, where M=minutes, S=seconds, C=centiseconds. The returned string is plain text, so all
   * digits will be the same size, and the client is responsible for setting the font size.
   */
  static PLAIN_TEXT_MINUTES_AND_SECONDS = time => {
    const minutesAndSeconds = toMinutesAndSeconds(time);
    const centiseconds = StopwatchNode.getDecimalPlaces(time, 2);
    return minutesAndSeconds + centiseconds;
  };

  /**
   * A value for options.numberDisplayOptions.numberFormatter where time is interpreted as minutes and seconds.
   * The format is format MM:SS.cc, where M=minutes, S=seconds, c=centiseconds. The string returned is in RichText
   * format, with the 'c' digits in a smaller font.
   */
  static RICH_TEXT_MINUTES_AND_SECONDS = StopwatchNode.createRichTextNumberFormatter({
    showAsMinutesAndSeconds: true,
    numberOfDecimalPlaces: 2
  });
  constructor(stopwatch, providedOptions) {
    const options = optionize()({
      // SelfOptions
      cursor: 'pointer',
      numberDisplayRange: Stopwatch.ZERO_TO_ALMOST_SIXTY,
      // sized for 59:59.99 (mm:ss) or 3599.99 (decimal)
      iconHeight: 10,
      iconFill: 'black',
      iconLineWidth: 1,
      backgroundBaseColor: 'rgb( 80, 130, 230 )',
      buttonBaseColor: '#DFE0E1',
      xSpacing: 6,
      // horizontal space between the buttons
      ySpacing: 6,
      // vertical space between readout and buttons
      xMargin: 8,
      yMargin: 8,
      numberDisplayOptions: {
        numberFormatter: StopwatchNode.RICH_TEXT_MINUTES_AND_SECONDS,
        useRichText: true,
        textOptions: {
          font: StopwatchNode.DEFAULT_FONT
        },
        align: 'right',
        cornerRadius: 4,
        xMargin: 4,
        yMargin: 2,
        pickable: false // allow dragging by the number display
      },

      dragBoundsProperty: null,
      dragListenerOptions: {
        start: _.noop
      },
      // highlight will only be visible if the component is interactive (provide dragBoundsProperty)
      interactiveHighlightEnabled: false,
      // Tandem is required to make sure the buttons are instrumented
      tandem: Tandem.REQUIRED
    }, providedOptions);
    assert && assert(!options.hasOwnProperty('maxValue'), 'options.maxValue no longer supported');
    assert && assert(options.xSpacing >= 0, 'Buttons cannot overlap');
    assert && assert(options.ySpacing >= 0, 'Buttons cannot overlap the readout');
    const numberDisplay = new NumberDisplay(stopwatch.timeProperty, options.numberDisplayRange, options.numberDisplayOptions);

    // Buttons ----------------------------------------------------------------------------

    const resetPath = new Path(new UTurnArrowShape(options.iconHeight), {
      fill: options.iconFill
    });
    const playIconHeight = resetPath.height;
    const playIconWidth = 0.8 * playIconHeight;
    const playPath = new Path(new PlayIconShape(playIconWidth, playIconHeight), {
      fill: options.iconFill
    });
    const pausePath = new Path(new PauseIconShape(0.75 * playIconWidth, playIconHeight), {
      fill: options.iconFill
    });
    const playPauseButton = new BooleanRectangularToggleButton(stopwatch.isRunningProperty, pausePath, playPath, {
      baseColor: options.buttonBaseColor,
      touchAreaXDilation: 5,
      touchAreaXShift: 5,
      touchAreaYDilation: 8,
      tandem: options.tandem.createTandem('playPauseButton')
    });
    const resetButton = new RectangularPushButton({
      listener: () => {
        stopwatch.isRunningProperty.set(false);
        stopwatch.timeProperty.set(0);
      },
      touchAreaXDilation: 5,
      touchAreaXShift: -5,
      touchAreaYDilation: 8,
      content: resetPath,
      baseColor: options.buttonBaseColor,
      tandem: options.tandem.createTandem('resetButton')
    });
    const contents = new VBox({
      spacing: options.ySpacing,
      children: [numberDisplay, new HBox({
        spacing: options.xSpacing,
        children: [resetButton, playPauseButton]
      })]
    });

    // Background panel ----------------------------------------------------------------------------

    const backgroundNode = new ShadedRectangle(new Bounds2(0, 0, contents.width + 2 * options.xMargin, contents.height + 2 * options.yMargin), {
      baseColor: options.backgroundBaseColor
    });
    contents.center = backgroundNode.center;
    options.children = [backgroundNode, contents];
    super(options);

    // Disable the reset button when time is zero, and enable the play/pause button when not at the max time
    const timeListener = time => {
      resetButton.enabled = time > 0;
      playPauseButton.enabled = time < stopwatch.timeProperty.range.max;
    };
    stopwatch.timeProperty.link(timeListener);

    // Put a red dot at the origin, for debugging layout.
    if (phet.chipper.queryParameters.dev) {
      this.addChild(new Circle(3, {
        fill: 'red'
      }));
    }
    const stopwatchVisibleListener = visible => {
      this.visible = visible;
      if (visible) {
        this.moveToFront();
      } else {
        // interrupt user interactions when the stopwatch is made invisible
        this.interruptSubtreeInput();
      }
    };
    stopwatch.isVisibleProperty.link(stopwatchVisibleListener);

    // Move to the stopwatch's position
    const stopwatchPositionListener = position => this.setTranslation(position);
    stopwatch.positionProperty.link(stopwatchPositionListener);
    this.dragListener = null;
    let adjustedDragBoundsProperty = null;
    if (options.dragBoundsProperty) {
      // interactive highlights - adding a DragListener to make this interactive, enable highlights for mouse and touch
      this.interactiveHighlightEnabled = true;

      // drag bounds, adjusted to keep this entire Node inside visible bounds
      adjustedDragBoundsProperty = new DragBoundsProperty(this, options.dragBoundsProperty);

      // interrupt user interactions when the visible bounds changes, such as a device orientation change or window resize
      options.dragBoundsProperty.link(() => this.interruptSubtreeInput());

      // If the stopwatch is outside the drag bounds, move it inside.
      adjustedDragBoundsProperty.link(dragBounds => {
        if (!dragBounds.containsPoint(stopwatch.positionProperty.value)) {
          stopwatch.positionProperty.value = dragBounds.closestPointTo(stopwatch.positionProperty.value);
        }
      });

      // dragging, added to background so that other UI components get input events on touch devices
      const dragListenerOptions = combineOptions({
        targetNode: this,
        positionProperty: stopwatch.positionProperty,
        dragBoundsProperty: adjustedDragBoundsProperty,
        tandem: options.tandem.createTandem('dragListener')
      }, options.dragListenerOptions);

      // Add moveToFront to any start function that the client provided.
      const optionsStart = dragListenerOptions.start;
      dragListenerOptions.start = (event, listener) => {
        this.moveToFront();
        optionsStart(event, listener);
      };

      // Dragging, added to background so that other UI components get input events on touch devices.
      // If added to 'this', touchSnag will lock out listeners for other UI components.
      this.dragListener = new DragListener(dragListenerOptions);
      backgroundNode.addInputListener(this.dragListener);

      // Move to front on pointer down, anywhere on this Node, including interactive subcomponents.
      this.addInputListener({
        down: () => this.moveToFront()
      });
    }
    this.addLinkedElement(stopwatch, {
      tandem: options.tandem.createTandem('stopwatch')
    });
    this.disposeStopwatchNode = () => {
      stopwatch.isVisibleProperty.unlink(stopwatchVisibleListener);
      stopwatch.timeProperty.unlink(timeListener);
      stopwatch.positionProperty.unlink(stopwatchPositionListener);
      numberDisplay.dispose();
      resetButton.dispose();
      playPauseButton.dispose();
      if (this.dragListener) {
        backgroundNode.removeInputListener(this.dragListener);
        this.dragListener.dispose();
      }
      adjustedDragBoundsProperty && adjustedDragBoundsProperty.dispose();
    };
    this.numberDisplay = numberDisplay;

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('scenery-phet', 'StopwatchNode', this);
  }

  /**
   * Sets the formatter for the NumberDisplay.
   */
  setNumberFormatter(numberFormatter) {
    this.numberDisplay.setNumberFormatter(numberFormatter);
  }

  // Redraw the text when something other than the numberProperty changes (such as units, formatter, etc).
  redrawNumberDisplay() {
    this.numberDisplay.recomputeText();
  }
  dispose() {
    this.disposeStopwatchNode();
    super.dispose();
  }

  /**
   * Gets the centiseconds (hundredths-of-a-second) string for a time value.
   */
  static getDecimalPlaces(time, numberDecimalPlaces) {
    const max = Math.pow(10, numberDecimalPlaces);

    // Round to the nearest centisecond, see https://github.com/phetsims/masses-and-springs/issues/156
    time = Utils.roundSymmetric(time * max) / max;

    // Rounding after mod, in case there is floating-point error
    let decimalValue = `${Utils.roundSymmetric(time % 1 * max)}`;
    while (decimalValue.length < numberDecimalPlaces) {
      decimalValue = `0${decimalValue}`;
    }
    return `.${decimalValue}`;
  }

  /**
   * Creates a custom value for options.numberDisplayOptions.numberFormatter, passed to NumberDisplay.
   *
   * TODO https://github.com/phetsims/scenery-phet/issues/781
   * Because this is called by NumberDisplay when its valueProperty changes, there's no way to make
   * this API update immediately when options.valueUnitsPattern or options.units changes. The NumberDisplay
   * will not show changes to those strings until the value changes. If this is a problem, we'll need to
   * come up with a new API for updating the NumberDisplay when associated StringProperties change.
   */
  static createRichTextNumberFormatter(providedOptions) {
    const options = optionize()({
      // If true, the time value is converted to minutes and seconds, and the format looks like 59:59.00.
      // If false, time is formatted as a decimal value, like 123.45
      showAsMinutesAndSeconds: true,
      numberOfDecimalPlaces: 2,
      bigNumberFont: 20,
      smallNumberFont: 14,
      unitsFont: 14,
      units: '',
      // Units cannot be baked into the i18n string because they can change independently
      valueUnitsPattern: SceneryPhetStrings.stopwatchValueUnitsPatternStringProperty
    }, providedOptions);
    return time => {
      const minutesAndSeconds = options.showAsMinutesAndSeconds ? toMinutesAndSeconds(time) : Math.floor(time);
      const centiseconds = StopwatchNode.getDecimalPlaces(time, options.numberOfDecimalPlaces);
      const units = typeof options.units === 'string' ? options.units : options.units.value;

      // Single quotes around CSS style so the double-quotes in the CSS font family work. Himalaya doesn't like &quot;
      // See https://github.com/phetsims/collision-lab/issues/140.
      return StringUtils.fillIn(options.valueUnitsPattern, {
        value: `<span style='font-size: ${options.bigNumberFont}px; font-family:${StopwatchNode.NUMBER_FONT_FAMILY};'>${minutesAndSeconds}</span><span style='font-size: ${options.smallNumberFont}px;font-family:${StopwatchNode.NUMBER_FONT_FAMILY};'>${centiseconds}</span>`,
        units: `<span style='font-size: ${options.unitsFont}px; font-family:${StopwatchNode.NUMBER_FONT_FAMILY};'>${units}</span>`
      });
    };
  }
}

/**
 * Converts a time to a string in {{minutes}}:{{seconds}} format.
 */
function toMinutesAndSeconds(time) {
  // Round to the nearest centi-part (if time is in seconds, this would be centiseconds)
  // see https://github.com/phetsims/masses-and-springs/issues/156
  time = Utils.roundSymmetric(time * 100) / 100;

  // When showing units, don't show the "00:" prefix, see https://github.com/phetsims/scenery-phet/issues/378
  const timeInSeconds = time;

  // If no units are provided, then we assume the time is in seconds, and should be shown in mm:ss.cs
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds) % 60;
  const minutesString = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${minutesString}:${secondsString}`;
}
sceneryPhet.register('StopwatchNode', StopwatchNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVXRpbHMiLCJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJTdHJpbmdVdGlscyIsIkNpcmNsZSIsIkRyYWdMaXN0ZW5lciIsIkhCb3giLCJJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyIsIk5vZGUiLCJQYXRoIiwiVkJveCIsIkJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbiIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIlRhbmRlbSIsIkRyYWdCb3VuZHNQcm9wZXJ0eSIsIk51bWJlckRpc3BsYXkiLCJQYXVzZUljb25TaGFwZSIsIlBoZXRGb250IiwiUGxheUljb25TaGFwZSIsInNjZW5lcnlQaGV0IiwiU2NlbmVyeVBoZXRTdHJpbmdzIiwiU2hhZGVkUmVjdGFuZ2xlIiwiU3RvcHdhdGNoIiwiVVR1cm5BcnJvd1NoYXBlIiwiU3RvcHdhdGNoTm9kZSIsIk5VTUJFUl9GT05UX0ZBTUlMWSIsIkRFRkFVTFRfRk9OVCIsInNpemUiLCJmYW1pbHkiLCJQTEFJTl9URVhUX01JTlVURVNfQU5EX1NFQ09ORFMiLCJ0aW1lIiwibWludXRlc0FuZFNlY29uZHMiLCJ0b01pbnV0ZXNBbmRTZWNvbmRzIiwiY2VudGlzZWNvbmRzIiwiZ2V0RGVjaW1hbFBsYWNlcyIsIlJJQ0hfVEVYVF9NSU5VVEVTX0FORF9TRUNPTkRTIiwiY3JlYXRlUmljaFRleHROdW1iZXJGb3JtYXR0ZXIiLCJzaG93QXNNaW51dGVzQW5kU2Vjb25kcyIsIm51bWJlck9mRGVjaW1hbFBsYWNlcyIsImNvbnN0cnVjdG9yIiwic3RvcHdhdGNoIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImN1cnNvciIsIm51bWJlckRpc3BsYXlSYW5nZSIsIlpFUk9fVE9fQUxNT1NUX1NJWFRZIiwiaWNvbkhlaWdodCIsImljb25GaWxsIiwiaWNvbkxpbmVXaWR0aCIsImJhY2tncm91bmRCYXNlQ29sb3IiLCJidXR0b25CYXNlQ29sb3IiLCJ4U3BhY2luZyIsInlTcGFjaW5nIiwieE1hcmdpbiIsInlNYXJnaW4iLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsIm51bWJlckZvcm1hdHRlciIsInVzZVJpY2hUZXh0IiwidGV4dE9wdGlvbnMiLCJmb250IiwiYWxpZ24iLCJjb3JuZXJSYWRpdXMiLCJwaWNrYWJsZSIsImRyYWdCb3VuZHNQcm9wZXJ0eSIsImRyYWdMaXN0ZW5lck9wdGlvbnMiLCJzdGFydCIsIl8iLCJub29wIiwiaW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJhc3NlcnQiLCJoYXNPd25Qcm9wZXJ0eSIsIm51bWJlckRpc3BsYXkiLCJ0aW1lUHJvcGVydHkiLCJyZXNldFBhdGgiLCJmaWxsIiwicGxheUljb25IZWlnaHQiLCJoZWlnaHQiLCJwbGF5SWNvbldpZHRoIiwicGxheVBhdGgiLCJwYXVzZVBhdGgiLCJwbGF5UGF1c2VCdXR0b24iLCJpc1J1bm5pbmdQcm9wZXJ0eSIsImJhc2VDb2xvciIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVhTaGlmdCIsInRvdWNoQXJlYVlEaWxhdGlvbiIsImNyZWF0ZVRhbmRlbSIsInJlc2V0QnV0dG9uIiwibGlzdGVuZXIiLCJzZXQiLCJjb250ZW50IiwiY29udGVudHMiLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJiYWNrZ3JvdW5kTm9kZSIsIndpZHRoIiwiY2VudGVyIiwidGltZUxpc3RlbmVyIiwiZW5hYmxlZCIsInJhbmdlIiwibWF4IiwibGluayIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiZGV2IiwiYWRkQ2hpbGQiLCJzdG9wd2F0Y2hWaXNpYmxlTGlzdGVuZXIiLCJ2aXNpYmxlIiwibW92ZVRvRnJvbnQiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJpc1Zpc2libGVQcm9wZXJ0eSIsInN0b3B3YXRjaFBvc2l0aW9uTGlzdGVuZXIiLCJwb3NpdGlvbiIsInNldFRyYW5zbGF0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsImRyYWdMaXN0ZW5lciIsImFkanVzdGVkRHJhZ0JvdW5kc1Byb3BlcnR5IiwiZHJhZ0JvdW5kcyIsImNvbnRhaW5zUG9pbnQiLCJ2YWx1ZSIsImNsb3Nlc3RQb2ludFRvIiwidGFyZ2V0Tm9kZSIsIm9wdGlvbnNTdGFydCIsImV2ZW50IiwiYWRkSW5wdXRMaXN0ZW5lciIsImRvd24iLCJhZGRMaW5rZWRFbGVtZW50IiwiZGlzcG9zZVN0b3B3YXRjaE5vZGUiLCJ1bmxpbmsiLCJkaXNwb3NlIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsInNldE51bWJlckZvcm1hdHRlciIsInJlZHJhd051bWJlckRpc3BsYXkiLCJyZWNvbXB1dGVUZXh0IiwibnVtYmVyRGVjaW1hbFBsYWNlcyIsIk1hdGgiLCJwb3ciLCJyb3VuZFN5bW1ldHJpYyIsImRlY2ltYWxWYWx1ZSIsImxlbmd0aCIsImJpZ051bWJlckZvbnQiLCJzbWFsbE51bWJlckZvbnQiLCJ1bml0c0ZvbnQiLCJ1bml0cyIsInZhbHVlVW5pdHNQYXR0ZXJuIiwic3RvcHdhdGNoVmFsdWVVbml0c1BhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsImZsb29yIiwiZmlsbEluIiwidGltZUluU2Vjb25kcyIsIm1pbnV0ZXMiLCJzZWNvbmRzIiwibWludXRlc1N0cmluZyIsInNlY29uZHNTdHJpbmciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN0b3B3YXRjaE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2hvd3MgYSByZWFkb3V0IG9mIHRoZSBlbGFwc2VkIHRpbWUsIHdpdGggcGxheSBhbmQgcGF1c2UgYnV0dG9ucy4gIEJ5IGRlZmF1bHQgdGhlcmUgYXJlIG5vIHVuaXRzICh3aGljaCBjb3VsZCBiZSB1c2VkXHJcbiAqIGlmIGFsbCBvZiBhIHNpbXVsYXRpb25zIHRpbWUgdW5pdHMgYXJlIGluICdzZWNvbmRzJyksIG9yIHlvdSBjYW4gc3BlY2lmeSBhIHNlbGVjdGlvbiBvZiB1bml0cyB0byBjaG9vc2UgZnJvbS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEFudG9uIFVseWFub3YgKE1sZWFybmVyKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBEcmFnTGlzdGVuZXIsIERyYWdMaXN0ZW5lck9wdGlvbnMsIEhCb3gsIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nLCBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ09wdGlvbnMsIE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoLCBQcmVzc2VkRHJhZ0xpc3RlbmVyLCBQcmVzc0xpc3RlbmVyRXZlbnQsIFRDb2xvciwgVkJveCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBCb29sZWFuUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b24gZnJvbSAnLi4vLi4vc3VuL2pzL2J1dHRvbnMvQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiBmcm9tICcuLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgRHJhZ0JvdW5kc1Byb3BlcnR5IGZyb20gJy4vRHJhZ0JvdW5kc1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlckRpc3BsYXksIHsgTnVtYmVyRGlzcGxheU9wdGlvbnMgfSBmcm9tICcuL051bWJlckRpc3BsYXkuanMnO1xyXG5pbXBvcnQgUGF1c2VJY29uU2hhcGUgZnJvbSAnLi9QYXVzZUljb25TaGFwZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuL1BoZXRGb250LmpzJztcclxuaW1wb3J0IFBsYXlJY29uU2hhcGUgZnJvbSAnLi9QbGF5SWNvblNoYXBlLmpzJztcclxuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xyXG5pbXBvcnQgU2NlbmVyeVBoZXRTdHJpbmdzIGZyb20gJy4vU2NlbmVyeVBoZXRTdHJpbmdzLmpzJztcclxuaW1wb3J0IFNoYWRlZFJlY3RhbmdsZSBmcm9tICcuL1NoYWRlZFJlY3RhbmdsZS5qcyc7XHJcbmltcG9ydCBTdG9wd2F0Y2ggZnJvbSAnLi9TdG9wd2F0Y2guanMnO1xyXG5pbXBvcnQgVVR1cm5BcnJvd1NoYXBlIGZyb20gJy4vVVR1cm5BcnJvd1NoYXBlLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgY3Vyc29yPzogc3RyaW5nO1xyXG4gIG51bWJlckRpc3BsYXlSYW5nZT86IFJhbmdlOyAvLyB1c2VkIHRvIHNpemUgdGhlIE51bWJlckRpc3BsYXlcclxuICBpY29uSGVpZ2h0PzogbnVtYmVyO1xyXG4gIGljb25GaWxsPzogVENvbG9yO1xyXG4gIGljb25MaW5lV2lkdGg/OiBudW1iZXI7XHJcbiAgYmFja2dyb3VuZEJhc2VDb2xvcj86IFRDb2xvcjtcclxuICBidXR0b25CYXNlQ29sb3I/OiBUQ29sb3I7XHJcbiAgeFNwYWNpbmc/OiBudW1iZXI7IC8vIGhvcml6b250YWwgc3BhY2UgYmV0d2VlbiB0aGUgYnV0dG9uc1xyXG4gIHlTcGFjaW5nPzogbnVtYmVyOyAvLyB2ZXJ0aWNhbCBzcGFjZSBiZXR3ZWVuIHJlYWRvdXQgYW5kIGJ1dHRvbnNcclxuICB4TWFyZ2luPzogbnVtYmVyO1xyXG4gIHlNYXJnaW4/OiBudW1iZXI7XHJcblxyXG4gIG51bWJlckRpc3BsYXlPcHRpb25zPzogTnVtYmVyRGlzcGxheU9wdGlvbnM7XHJcblxyXG4gIC8vIElmIHByb3ZpZGVkLCB0aGUgc3RvcHdhdGNoIGlzIGRyYWdnYWJsZSB3aXRoaW4gdGhlIGJvdW5kcy4gSWYgbnVsbCwgdGhlIHN0b3B3YXRjaCBpcyBub3QgZHJhZ2dhYmxlLlxyXG4gIGRyYWdCb3VuZHNQcm9wZXJ0eT86IFByb3BlcnR5PEJvdW5kczI+IHwgbnVsbDtcclxuXHJcbiAgLy8gb3B0aW9ucyBwcm9wYWdhdGVkIHRvIHRoZSBEcmFnTGlzdGVuZXJcclxuICBkcmFnTGlzdGVuZXJPcHRpb25zPzogRHJhZ0xpc3RlbmVyT3B0aW9uczxQcmVzc2VkRHJhZ0xpc3RlbmVyPjtcclxufTtcclxuXHJcbnR5cGUgUGFyZW50T3B0aW9ucyA9IEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nT3B0aW9ucyAmIE5vZGVPcHRpb25zO1xyXG5leHBvcnQgdHlwZSBTdG9wd2F0Y2hOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxQYXJlbnRPcHRpb25zLCAnY2hpbGRyZW4nIHwgJ2ludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZCc+O1xyXG5cclxudHlwZSBGb3JtYXR0ZXJPcHRpb25zID0ge1xyXG5cclxuICAvLyBJZiB0cnVlLCB0aGUgdGltZSB2YWx1ZSBpcyBjb252ZXJ0ZWQgdG8gbWludXRlcyBhbmQgc2Vjb25kcywgYW5kIHRoZSBmb3JtYXQgbG9va3MgbGlrZSA1OTo1OS4wMC5cclxuICAvLyBJZiBmYWxzZSwgdGltZSBpcyBmb3JtYXR0ZWQgYXMgYSBkZWNpbWFsIHZhbHVlLCBsaWtlIDEyMy40NVxyXG4gIHNob3dBc01pbnV0ZXNBbmRTZWNvbmRzPzogYm9vbGVhbjtcclxuICBudW1iZXJPZkRlY2ltYWxQbGFjZXM/OiBudW1iZXI7XHJcbiAgYmlnTnVtYmVyRm9udD86IG51bWJlcjtcclxuICBzbWFsbE51bWJlckZvbnQ/OiBudW1iZXI7XHJcbiAgdW5pdHNGb250PzogbnVtYmVyO1xyXG4gIHVuaXRzPzogc3RyaW5nIHwgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcclxuICB2YWx1ZVVuaXRzUGF0dGVybj86IHN0cmluZyB8IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz47XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdG9wd2F0Y2hOb2RlIGV4dGVuZHMgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcoIE5vZGUgKSB7XHJcblxyXG4gIC8vIG9wdGlvbnMgcHJvcGFnYXRlZCB0byB0aGUgTnVtYmVyRGlzcGxheVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbnVtYmVyRGlzcGxheTogTnVtYmVyRGlzcGxheTtcclxuXHJcbiAgLy8gTm9uLW51bGwgaWYgZHJhZ2dhYmxlLiBDYW4gYmUgdXNlZCBmb3IgZm9yd2FyZGluZyBwcmVzcyBldmVudHMgd2hlbiBkcmFnZ2luZyBvdXQgb2YgYSB0b29sYm94LlxyXG4gIHB1YmxpYyByZWFkb25seSBkcmFnTGlzdGVuZXI6IERyYWdMaXN0ZW5lciB8IG51bGw7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVN0b3B3YXRjaE5vZGU6ICgpID0+IHZvaWQ7XHJcblxyXG4gIC8vIFdlIHVzZWQgdG8gdXNlIEx1Y2lkYSBDb25zb2xlLCBBcmlhbCwgYnV0IEFyaWFsIGhhcyBzbWFsbGVyIG51bWJlciB3aWR0aCBmb3IgXCIxMVwiIGFuZCBoZW5jZSB3YXMgY2F1c2luZyBqaXR0ZXIuXHJcbiAgLy8gTmVpdGhlciBUcmVidWNoZXQgTVMgYW5kIEx1Y2lkYSBHcmFuZGUgaXMgYSBtb25vc3BhY2UgZm9udCwgYnV0IHRoZSBkaWdpdHMgYWxsIGFwcGVhciB0byBiZSBtb25vc3BhY2UuXHJcbiAgLy8gVXNlIFRyZWJ1Y2hldCBmaXJzdCwgc2luY2UgaXQgaGFzIGJyb2FkZXIgY3Jvc3MtcGxhdGZvcm0gc3VwcG9ydC5cclxuICAvLyBBbm90aGVyIGFkdmFudGFnZSBvZiB1c2luZyBhIG5vbi1tb25vc3BhY2UgZm9udCAod2l0aCBtb25vc3BhY2UgZGlnaXRzKSBpcyB0aGF0IHRoZSA6IGFuZCAuIHN5bWJvbHMgYXJlbid0IGFzXHJcbiAgLy8gd2lkZSBhcyB0aGUgbnVtZXJhbHMuIEBhcmllbC1waGV0IGFuZCBAc2FtcmVpZCB0ZXN0ZWQgdGhpcyBjb21iaW5hdGlvbiBvZiBmYW1pbGllcyBvbiBNYWMvQ2hyb21lIGFuZCBXaW5kb3dzL0Nocm9tZVxyXG4gIC8vIGFuZCBpdCBzZWVtZWQgdG8gd29yayBuaWNlbHksIHdpdGggbm8gaml0dGVyLlxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTlVNQkVSX0ZPTlRfRkFNSUxZID0gJ1wiVHJlYnVjaGV0IE1TXCIsIFwiTHVjaWRhIEdyYW5kZVwiLCBtb25vc3BhY2UnO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IERFRkFVTFRfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyMCwgZmFtaWx5OiBTdG9wd2F0Y2hOb2RlLk5VTUJFUl9GT05UX0ZBTUlMWSB9ICk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgdmFsdWUgZm9yIG9wdGlvbnMubnVtYmVyRGlzcGxheU9wdGlvbnMubnVtYmVyRm9ybWF0dGVyIHdoZXJlIHRpbWUgaXMgaW50ZXJwcmV0ZWQgYXMgbWludXRlcyBhbmQgc2Vjb25kcy5cclxuICAgKiBUaGUgZm9ybWF0IGlzIE1NOlNTLkNDLCB3aGVyZSBNPW1pbnV0ZXMsIFM9c2Vjb25kcywgQz1jZW50aXNlY29uZHMuIFRoZSByZXR1cm5lZCBzdHJpbmcgaXMgcGxhaW4gdGV4dCwgc28gYWxsXHJcbiAgICogZGlnaXRzIHdpbGwgYmUgdGhlIHNhbWUgc2l6ZSwgYW5kIHRoZSBjbGllbnQgaXMgcmVzcG9uc2libGUgZm9yIHNldHRpbmcgdGhlIGZvbnQgc2l6ZS5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFBMQUlOX1RFWFRfTUlOVVRFU19BTkRfU0VDT05EUyA9ICggdGltZTogbnVtYmVyICk6IHN0cmluZyA9PiB7XHJcbiAgICBjb25zdCBtaW51dGVzQW5kU2Vjb25kcyA9IHRvTWludXRlc0FuZFNlY29uZHMoIHRpbWUgKTtcclxuICAgIGNvbnN0IGNlbnRpc2Vjb25kcyA9IFN0b3B3YXRjaE5vZGUuZ2V0RGVjaW1hbFBsYWNlcyggdGltZSwgMiApO1xyXG4gICAgcmV0dXJuIG1pbnV0ZXNBbmRTZWNvbmRzICsgY2VudGlzZWNvbmRzO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgdmFsdWUgZm9yIG9wdGlvbnMubnVtYmVyRGlzcGxheU9wdGlvbnMubnVtYmVyRm9ybWF0dGVyIHdoZXJlIHRpbWUgaXMgaW50ZXJwcmV0ZWQgYXMgbWludXRlcyBhbmQgc2Vjb25kcy5cclxuICAgKiBUaGUgZm9ybWF0IGlzIGZvcm1hdCBNTTpTUy5jYywgd2hlcmUgTT1taW51dGVzLCBTPXNlY29uZHMsIGM9Y2VudGlzZWNvbmRzLiBUaGUgc3RyaW5nIHJldHVybmVkIGlzIGluIFJpY2hUZXh0XHJcbiAgICogZm9ybWF0LCB3aXRoIHRoZSAnYycgZGlnaXRzIGluIGEgc21hbGxlciBmb250LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUklDSF9URVhUX01JTlVURVNfQU5EX1NFQ09ORFMgPSBTdG9wd2F0Y2hOb2RlLmNyZWF0ZVJpY2hUZXh0TnVtYmVyRm9ybWF0dGVyKCB7XHJcbiAgICBzaG93QXNNaW51dGVzQW5kU2Vjb25kczogdHJ1ZSxcclxuICAgIG51bWJlck9mRGVjaW1hbFBsYWNlczogMlxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzdG9wd2F0Y2g6IFN0b3B3YXRjaCwgcHJvdmlkZWRPcHRpb25zPzogU3RvcHdhdGNoTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTdG9wd2F0Y2hOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICBudW1iZXJEaXNwbGF5UmFuZ2U6IFN0b3B3YXRjaC5aRVJPX1RPX0FMTU9TVF9TSVhUWSwgLy8gc2l6ZWQgZm9yIDU5OjU5Ljk5IChtbTpzcykgb3IgMzU5OS45OSAoZGVjaW1hbClcclxuICAgICAgaWNvbkhlaWdodDogMTAsXHJcbiAgICAgIGljb25GaWxsOiAnYmxhY2snLFxyXG4gICAgICBpY29uTGluZVdpZHRoOiAxLFxyXG4gICAgICBiYWNrZ3JvdW5kQmFzZUNvbG9yOiAncmdiKCA4MCwgMTMwLCAyMzAgKScsXHJcbiAgICAgIGJ1dHRvbkJhc2VDb2xvcjogJyNERkUwRTEnLFxyXG4gICAgICB4U3BhY2luZzogNiwgLy8gaG9yaXpvbnRhbCBzcGFjZSBiZXR3ZWVuIHRoZSBidXR0b25zXHJcbiAgICAgIHlTcGFjaW5nOiA2LCAvLyB2ZXJ0aWNhbCBzcGFjZSBiZXR3ZWVuIHJlYWRvdXQgYW5kIGJ1dHRvbnNcclxuICAgICAgeE1hcmdpbjogOCxcclxuICAgICAgeU1hcmdpbjogOCxcclxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICBudW1iZXJGb3JtYXR0ZXI6IFN0b3B3YXRjaE5vZGUuUklDSF9URVhUX01JTlVURVNfQU5EX1NFQ09ORFMsXHJcbiAgICAgICAgdXNlUmljaFRleHQ6IHRydWUsXHJcbiAgICAgICAgdGV4dE9wdGlvbnM6IHtcclxuICAgICAgICAgIGZvbnQ6IFN0b3B3YXRjaE5vZGUuREVGQVVMVF9GT05UXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcclxuICAgICAgICBjb3JuZXJSYWRpdXM6IDQsXHJcbiAgICAgICAgeE1hcmdpbjogNCxcclxuICAgICAgICB5TWFyZ2luOiAyLFxyXG4gICAgICAgIHBpY2thYmxlOiBmYWxzZSAvLyBhbGxvdyBkcmFnZ2luZyBieSB0aGUgbnVtYmVyIGRpc3BsYXlcclxuICAgICAgfSxcclxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiBudWxsLFxyXG4gICAgICBkcmFnTGlzdGVuZXJPcHRpb25zOiB7XHJcbiAgICAgICAgc3RhcnQ6IF8ubm9vcFxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gaGlnaGxpZ2h0IHdpbGwgb25seSBiZSB2aXNpYmxlIGlmIHRoZSBjb21wb25lbnQgaXMgaW50ZXJhY3RpdmUgKHByb3ZpZGUgZHJhZ0JvdW5kc1Byb3BlcnR5KVxyXG4gICAgICBpbnRlcmFjdGl2ZUhpZ2hsaWdodEVuYWJsZWQ6IGZhbHNlLFxyXG5cclxuICAgICAgLy8gVGFuZGVtIGlzIHJlcXVpcmVkIHRvIG1ha2Ugc3VyZSB0aGUgYnV0dG9ucyBhcmUgaW5zdHJ1bWVudGVkXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmhhc093blByb3BlcnR5KCAnbWF4VmFsdWUnICksICdvcHRpb25zLm1heFZhbHVlIG5vIGxvbmdlciBzdXBwb3J0ZWQnICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy54U3BhY2luZyA+PSAwLCAnQnV0dG9ucyBjYW5ub3Qgb3ZlcmxhcCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMueVNwYWNpbmcgPj0gMCwgJ0J1dHRvbnMgY2Fubm90IG92ZXJsYXAgdGhlIHJlYWRvdXQnICk7XHJcblxyXG4gICAgY29uc3QgbnVtYmVyRGlzcGxheSA9IG5ldyBOdW1iZXJEaXNwbGF5KCBzdG9wd2F0Y2gudGltZVByb3BlcnR5LCBvcHRpb25zLm51bWJlckRpc3BsYXlSYW5nZSwgb3B0aW9ucy5udW1iZXJEaXNwbGF5T3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEJ1dHRvbnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNvbnN0IHJlc2V0UGF0aCA9IG5ldyBQYXRoKCBuZXcgVVR1cm5BcnJvd1NoYXBlKCBvcHRpb25zLmljb25IZWlnaHQgKSwge1xyXG4gICAgICBmaWxsOiBvcHRpb25zLmljb25GaWxsXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcGxheUljb25IZWlnaHQgPSByZXNldFBhdGguaGVpZ2h0O1xyXG4gICAgY29uc3QgcGxheUljb25XaWR0aCA9IDAuOCAqIHBsYXlJY29uSGVpZ2h0O1xyXG4gICAgY29uc3QgcGxheVBhdGggPSBuZXcgUGF0aCggbmV3IFBsYXlJY29uU2hhcGUoIHBsYXlJY29uV2lkdGgsIHBsYXlJY29uSGVpZ2h0ICksIHtcclxuICAgICAgZmlsbDogb3B0aW9ucy5pY29uRmlsbFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHBhdXNlUGF0aCA9IG5ldyBQYXRoKCBuZXcgUGF1c2VJY29uU2hhcGUoIDAuNzUgKiBwbGF5SWNvbldpZHRoLCBwbGF5SWNvbkhlaWdodCApLCB7XHJcbiAgICAgIGZpbGw6IG9wdGlvbnMuaWNvbkZpbGxcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBwbGF5UGF1c2VCdXR0b24gPSBuZXcgQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uKCBzdG9wd2F0Y2guaXNSdW5uaW5nUHJvcGVydHksIHBhdXNlUGF0aCwgcGxheVBhdGgsIHtcclxuICAgICAgYmFzZUNvbG9yOiBvcHRpb25zLmJ1dHRvbkJhc2VDb2xvcixcclxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiA1LFxyXG4gICAgICB0b3VjaEFyZWFYU2hpZnQ6IDUsXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogOCxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwbGF5UGF1c2VCdXR0b24nIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCByZXNldEJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBzdG9wd2F0Y2guaXNSdW5uaW5nUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgICAgIHN0b3B3YXRjaC50aW1lUHJvcGVydHkuc2V0KCAwICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogNSxcclxuICAgICAgdG91Y2hBcmVhWFNoaWZ0OiAtNSxcclxuICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiA4LFxyXG4gICAgICBjb250ZW50OiByZXNldFBhdGgsXHJcbiAgICAgIGJhc2VDb2xvcjogb3B0aW9ucy5idXR0b25CYXNlQ29sb3IsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVzZXRCdXR0b24nIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50cyA9IG5ldyBWQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IG9wdGlvbnMueVNwYWNpbmcsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbnVtYmVyRGlzcGxheSxcclxuICAgICAgICBuZXcgSEJveCgge1xyXG4gICAgICAgICAgc3BhY2luZzogb3B0aW9ucy54U3BhY2luZyxcclxuICAgICAgICAgIGNoaWxkcmVuOiBbIHJlc2V0QnV0dG9uLCBwbGF5UGF1c2VCdXR0b24gXVxyXG4gICAgICAgIH0gKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQmFja2dyb3VuZCBwYW5lbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY29uc3QgYmFja2dyb3VuZE5vZGUgPSBuZXcgU2hhZGVkUmVjdGFuZ2xlKCBuZXcgQm91bmRzMiggMCwgMCxcclxuICAgICAgY29udGVudHMud2lkdGggKyAyICogb3B0aW9ucy54TWFyZ2luLCBjb250ZW50cy5oZWlnaHQgKyAyICogb3B0aW9ucy55TWFyZ2luICksIHtcclxuICAgICAgYmFzZUNvbG9yOiBvcHRpb25zLmJhY2tncm91bmRCYXNlQ29sb3JcclxuICAgIH0gKTtcclxuICAgIGNvbnRlbnRzLmNlbnRlciA9IGJhY2tncm91bmROb2RlLmNlbnRlcjtcclxuXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBiYWNrZ3JvdW5kTm9kZSwgY29udGVudHMgXTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIERpc2FibGUgdGhlIHJlc2V0IGJ1dHRvbiB3aGVuIHRpbWUgaXMgemVybywgYW5kIGVuYWJsZSB0aGUgcGxheS9wYXVzZSBidXR0b24gd2hlbiBub3QgYXQgdGhlIG1heCB0aW1lXHJcbiAgICBjb25zdCB0aW1lTGlzdGVuZXIgPSAoIHRpbWU6IG51bWJlciApID0+IHtcclxuICAgICAgcmVzZXRCdXR0b24uZW5hYmxlZCA9ICggdGltZSA+IDAgKTtcclxuICAgICAgcGxheVBhdXNlQnV0dG9uLmVuYWJsZWQgPSAoIHRpbWUgPCBzdG9wd2F0Y2gudGltZVByb3BlcnR5LnJhbmdlLm1heCApO1xyXG4gICAgfTtcclxuICAgIHN0b3B3YXRjaC50aW1lUHJvcGVydHkubGluayggdGltZUxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gUHV0IGEgcmVkIGRvdCBhdCB0aGUgb3JpZ2luLCBmb3IgZGVidWdnaW5nIGxheW91dC5cclxuICAgIGlmICggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5kZXYgKSB7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBDaXJjbGUoIDMsIHsgZmlsbDogJ3JlZCcgfSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3RvcHdhdGNoVmlzaWJsZUxpc3RlbmVyID0gKCB2aXNpYmxlOiBib29sZWFuICkgPT4ge1xyXG4gICAgICB0aGlzLnZpc2libGUgPSB2aXNpYmxlO1xyXG4gICAgICBpZiAoIHZpc2libGUgKSB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG9Gcm9udCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBpbnRlcnJ1cHQgdXNlciBpbnRlcmFjdGlvbnMgd2hlbiB0aGUgc3RvcHdhdGNoIGlzIG1hZGUgaW52aXNpYmxlXHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHN0b3B3YXRjaC5pc1Zpc2libGVQcm9wZXJ0eS5saW5rKCBzdG9wd2F0Y2hWaXNpYmxlTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBNb3ZlIHRvIHRoZSBzdG9wd2F0Y2gncyBwb3NpdGlvblxyXG4gICAgY29uc3Qgc3RvcHdhdGNoUG9zaXRpb25MaXN0ZW5lciA9ICggcG9zaXRpb246IFZlY3RvcjIgKSA9PiB0aGlzLnNldFRyYW5zbGF0aW9uKCBwb3NpdGlvbiApO1xyXG4gICAgc3RvcHdhdGNoLnBvc2l0aW9uUHJvcGVydHkubGluayggc3RvcHdhdGNoUG9zaXRpb25MaXN0ZW5lciApO1xyXG5cclxuICAgIHRoaXMuZHJhZ0xpc3RlbmVyID0gbnVsbDtcclxuXHJcbiAgICBsZXQgYWRqdXN0ZWREcmFnQm91bmRzUHJvcGVydHk6IERyYWdCb3VuZHNQcm9wZXJ0eSB8IG51bGwgPSBudWxsO1xyXG4gICAgaWYgKCBvcHRpb25zLmRyYWdCb3VuZHNQcm9wZXJ0eSApIHtcclxuXHJcbiAgICAgIC8vIGludGVyYWN0aXZlIGhpZ2hsaWdodHMgLSBhZGRpbmcgYSBEcmFnTGlzdGVuZXIgdG8gbWFrZSB0aGlzIGludGVyYWN0aXZlLCBlbmFibGUgaGlnaGxpZ2h0cyBmb3IgbW91c2UgYW5kIHRvdWNoXHJcbiAgICAgIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIGRyYWcgYm91bmRzLCBhZGp1c3RlZCB0byBrZWVwIHRoaXMgZW50aXJlIE5vZGUgaW5zaWRlIHZpc2libGUgYm91bmRzXHJcbiAgICAgIGFkanVzdGVkRHJhZ0JvdW5kc1Byb3BlcnR5ID0gbmV3IERyYWdCb3VuZHNQcm9wZXJ0eSggdGhpcywgb3B0aW9ucy5kcmFnQm91bmRzUHJvcGVydHkgKTtcclxuXHJcbiAgICAgIC8vIGludGVycnVwdCB1c2VyIGludGVyYWN0aW9ucyB3aGVuIHRoZSB2aXNpYmxlIGJvdW5kcyBjaGFuZ2VzLCBzdWNoIGFzIGEgZGV2aWNlIG9yaWVudGF0aW9uIGNoYW5nZSBvciB3aW5kb3cgcmVzaXplXHJcbiAgICAgIG9wdGlvbnMuZHJhZ0JvdW5kc1Byb3BlcnR5LmxpbmsoICgpID0+IHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCkgKTtcclxuXHJcbiAgICAgIC8vIElmIHRoZSBzdG9wd2F0Y2ggaXMgb3V0c2lkZSB0aGUgZHJhZyBib3VuZHMsIG1vdmUgaXQgaW5zaWRlLlxyXG4gICAgICBhZGp1c3RlZERyYWdCb3VuZHNQcm9wZXJ0eS5saW5rKCBkcmFnQm91bmRzID0+IHtcclxuICAgICAgICBpZiAoICFkcmFnQm91bmRzLmNvbnRhaW5zUG9pbnQoIHN0b3B3YXRjaC5wb3NpdGlvblByb3BlcnR5LnZhbHVlICkgKSB7XHJcbiAgICAgICAgICBzdG9wd2F0Y2gucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IGRyYWdCb3VuZHMuY2xvc2VzdFBvaW50VG8oIHN0b3B3YXRjaC5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBkcmFnZ2luZywgYWRkZWQgdG8gYmFja2dyb3VuZCBzbyB0aGF0IG90aGVyIFVJIGNvbXBvbmVudHMgZ2V0IGlucHV0IGV2ZW50cyBvbiB0b3VjaCBkZXZpY2VzXHJcbiAgICAgIGNvbnN0IGRyYWdMaXN0ZW5lck9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxEcmFnTGlzdGVuZXJPcHRpb25zPFByZXNzZWREcmFnTGlzdGVuZXI+Pigge1xyXG4gICAgICAgIHRhcmdldE5vZGU6IHRoaXMsXHJcbiAgICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogc3RvcHdhdGNoLnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiBhZGp1c3RlZERyYWdCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdMaXN0ZW5lcicgKVxyXG4gICAgICB9LCBvcHRpb25zLmRyYWdMaXN0ZW5lck9wdGlvbnMgKTtcclxuXHJcbiAgICAgIC8vIEFkZCBtb3ZlVG9Gcm9udCB0byBhbnkgc3RhcnQgZnVuY3Rpb24gdGhhdCB0aGUgY2xpZW50IHByb3ZpZGVkLlxyXG4gICAgICBjb25zdCBvcHRpb25zU3RhcnQgPSBkcmFnTGlzdGVuZXJPcHRpb25zLnN0YXJ0ITtcclxuICAgICAgZHJhZ0xpc3RlbmVyT3B0aW9ucy5zdGFydCA9ICggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCwgbGlzdGVuZXI6IFByZXNzZWREcmFnTGlzdGVuZXIgKSA9PiB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG9Gcm9udCgpO1xyXG4gICAgICAgIG9wdGlvbnNTdGFydCggZXZlbnQsIGxpc3RlbmVyICk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBEcmFnZ2luZywgYWRkZWQgdG8gYmFja2dyb3VuZCBzbyB0aGF0IG90aGVyIFVJIGNvbXBvbmVudHMgZ2V0IGlucHV0IGV2ZW50cyBvbiB0b3VjaCBkZXZpY2VzLlxyXG4gICAgICAvLyBJZiBhZGRlZCB0byAndGhpcycsIHRvdWNoU25hZyB3aWxsIGxvY2sgb3V0IGxpc3RlbmVycyBmb3Igb3RoZXIgVUkgY29tcG9uZW50cy5cclxuICAgICAgdGhpcy5kcmFnTGlzdGVuZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCBkcmFnTGlzdGVuZXJPcHRpb25zICk7XHJcbiAgICAgIGJhY2tncm91bmROb2RlLmFkZElucHV0TGlzdGVuZXIoIHRoaXMuZHJhZ0xpc3RlbmVyICk7XHJcblxyXG4gICAgICAvLyBNb3ZlIHRvIGZyb250IG9uIHBvaW50ZXIgZG93biwgYW55d2hlcmUgb24gdGhpcyBOb2RlLCBpbmNsdWRpbmcgaW50ZXJhY3RpdmUgc3ViY29tcG9uZW50cy5cclxuICAgICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCB7XHJcbiAgICAgICAgZG93bjogKCkgPT4gdGhpcy5tb3ZlVG9Gcm9udCgpXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmFkZExpbmtlZEVsZW1lbnQoIHN0b3B3YXRjaCwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N0b3B3YXRjaCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZVN0b3B3YXRjaE5vZGUgPSAoKSA9PiB7XHJcbiAgICAgIHN0b3B3YXRjaC5pc1Zpc2libGVQcm9wZXJ0eS51bmxpbmsoIHN0b3B3YXRjaFZpc2libGVMaXN0ZW5lciApO1xyXG4gICAgICBzdG9wd2F0Y2gudGltZVByb3BlcnR5LnVubGluayggdGltZUxpc3RlbmVyICk7XHJcbiAgICAgIHN0b3B3YXRjaC5wb3NpdGlvblByb3BlcnR5LnVubGluayggc3RvcHdhdGNoUG9zaXRpb25MaXN0ZW5lciApO1xyXG5cclxuICAgICAgbnVtYmVyRGlzcGxheS5kaXNwb3NlKCk7XHJcbiAgICAgIHJlc2V0QnV0dG9uLmRpc3Bvc2UoKTtcclxuICAgICAgcGxheVBhdXNlQnV0dG9uLmRpc3Bvc2UoKTtcclxuXHJcbiAgICAgIGlmICggdGhpcy5kcmFnTGlzdGVuZXIgKSB7XHJcbiAgICAgICAgYmFja2dyb3VuZE5vZGUucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5kcmFnTGlzdGVuZXIgKTtcclxuICAgICAgICB0aGlzLmRyYWdMaXN0ZW5lci5kaXNwb3NlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFkanVzdGVkRHJhZ0JvdW5kc1Byb3BlcnR5ICYmIGFkanVzdGVkRHJhZ0JvdW5kc1Byb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5udW1iZXJEaXNwbGF5ID0gbnVtYmVyRGlzcGxheTtcclxuXHJcbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcclxuICAgIGFzc2VydCAmJiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3NjZW5lcnktcGhldCcsICdTdG9wd2F0Y2hOb2RlJywgdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgZm9ybWF0dGVyIGZvciB0aGUgTnVtYmVyRGlzcGxheS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0TnVtYmVyRm9ybWF0dGVyKCBudW1iZXJGb3JtYXR0ZXI6ICggbjogbnVtYmVyICkgPT4gc3RyaW5nICk6IHZvaWQge1xyXG4gICAgdGhpcy5udW1iZXJEaXNwbGF5LnNldE51bWJlckZvcm1hdHRlciggbnVtYmVyRm9ybWF0dGVyICk7XHJcbiAgfVxyXG5cclxuICAvLyBSZWRyYXcgdGhlIHRleHQgd2hlbiBzb21ldGhpbmcgb3RoZXIgdGhhbiB0aGUgbnVtYmVyUHJvcGVydHkgY2hhbmdlcyAoc3VjaCBhcyB1bml0cywgZm9ybWF0dGVyLCBldGMpLlxyXG4gIHB1YmxpYyByZWRyYXdOdW1iZXJEaXNwbGF5KCk6IHZvaWQge1xyXG4gICAgdGhpcy5udW1iZXJEaXNwbGF5LnJlY29tcHV0ZVRleHQoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlU3RvcHdhdGNoTm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgY2VudGlzZWNvbmRzIChodW5kcmVkdGhzLW9mLWEtc2Vjb25kKSBzdHJpbmcgZm9yIGEgdGltZSB2YWx1ZS5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGdldERlY2ltYWxQbGFjZXMoIHRpbWU6IG51bWJlciwgbnVtYmVyRGVjaW1hbFBsYWNlczogbnVtYmVyICk6IHN0cmluZyB7XHJcblxyXG4gICAgY29uc3QgbWF4ID0gTWF0aC5wb3coIDEwLCBudW1iZXJEZWNpbWFsUGxhY2VzICk7XHJcblxyXG4gICAgLy8gUm91bmQgdG8gdGhlIG5lYXJlc3QgY2VudGlzZWNvbmQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbWFzc2VzLWFuZC1zcHJpbmdzL2lzc3Vlcy8xNTZcclxuICAgIHRpbWUgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggdGltZSAqIG1heCApIC8gbWF4O1xyXG5cclxuICAgIC8vIFJvdW5kaW5nIGFmdGVyIG1vZCwgaW4gY2FzZSB0aGVyZSBpcyBmbG9hdGluZy1wb2ludCBlcnJvclxyXG4gICAgbGV0IGRlY2ltYWxWYWx1ZSA9IGAke1V0aWxzLnJvdW5kU3ltbWV0cmljKCB0aW1lICUgMSAqIG1heCApfWA7XHJcbiAgICB3aGlsZSAoIGRlY2ltYWxWYWx1ZS5sZW5ndGggPCBudW1iZXJEZWNpbWFsUGxhY2VzICkge1xyXG4gICAgICBkZWNpbWFsVmFsdWUgPSBgMCR7ZGVjaW1hbFZhbHVlfWA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYC4ke2RlY2ltYWxWYWx1ZX1gO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGN1c3RvbSB2YWx1ZSBmb3Igb3B0aW9ucy5udW1iZXJEaXNwbGF5T3B0aW9ucy5udW1iZXJGb3JtYXR0ZXIsIHBhc3NlZCB0byBOdW1iZXJEaXNwbGF5LlxyXG4gICAqXHJcbiAgICogVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy83ODFcclxuICAgKiBCZWNhdXNlIHRoaXMgaXMgY2FsbGVkIGJ5IE51bWJlckRpc3BsYXkgd2hlbiBpdHMgdmFsdWVQcm9wZXJ0eSBjaGFuZ2VzLCB0aGVyZSdzIG5vIHdheSB0byBtYWtlXHJcbiAgICogdGhpcyBBUEkgdXBkYXRlIGltbWVkaWF0ZWx5IHdoZW4gb3B0aW9ucy52YWx1ZVVuaXRzUGF0dGVybiBvciBvcHRpb25zLnVuaXRzIGNoYW5nZXMuIFRoZSBOdW1iZXJEaXNwbGF5XHJcbiAgICogd2lsbCBub3Qgc2hvdyBjaGFuZ2VzIHRvIHRob3NlIHN0cmluZ3MgdW50aWwgdGhlIHZhbHVlIGNoYW5nZXMuIElmIHRoaXMgaXMgYSBwcm9ibGVtLCB3ZSdsbCBuZWVkIHRvXHJcbiAgICogY29tZSB1cCB3aXRoIGEgbmV3IEFQSSBmb3IgdXBkYXRpbmcgdGhlIE51bWJlckRpc3BsYXkgd2hlbiBhc3NvY2lhdGVkIFN0cmluZ1Byb3BlcnRpZXMgY2hhbmdlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlUmljaFRleHROdW1iZXJGb3JtYXR0ZXIoIHByb3ZpZGVkT3B0aW9ucz86IEZvcm1hdHRlck9wdGlvbnMgKTogKCB0aW1lOiBudW1iZXIgKSA9PiBzdHJpbmcge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Rm9ybWF0dGVyT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gSWYgdHJ1ZSwgdGhlIHRpbWUgdmFsdWUgaXMgY29udmVydGVkIHRvIG1pbnV0ZXMgYW5kIHNlY29uZHMsIGFuZCB0aGUgZm9ybWF0IGxvb2tzIGxpa2UgNTk6NTkuMDAuXHJcbiAgICAgIC8vIElmIGZhbHNlLCB0aW1lIGlzIGZvcm1hdHRlZCBhcyBhIGRlY2ltYWwgdmFsdWUsIGxpa2UgMTIzLjQ1XHJcbiAgICAgIHNob3dBc01pbnV0ZXNBbmRTZWNvbmRzOiB0cnVlLFxyXG4gICAgICBudW1iZXJPZkRlY2ltYWxQbGFjZXM6IDIsXHJcbiAgICAgIGJpZ051bWJlckZvbnQ6IDIwLFxyXG4gICAgICBzbWFsbE51bWJlckZvbnQ6IDE0LFxyXG4gICAgICB1bml0c0ZvbnQ6IDE0LFxyXG4gICAgICB1bml0czogJycsXHJcblxyXG4gICAgICAvLyBVbml0cyBjYW5ub3QgYmUgYmFrZWQgaW50byB0aGUgaTE4biBzdHJpbmcgYmVjYXVzZSB0aGV5IGNhbiBjaGFuZ2UgaW5kZXBlbmRlbnRseVxyXG4gICAgICB2YWx1ZVVuaXRzUGF0dGVybjogU2NlbmVyeVBoZXRTdHJpbmdzLnN0b3B3YXRjaFZhbHVlVW5pdHNQYXR0ZXJuU3RyaW5nUHJvcGVydHlcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHJldHVybiAoIHRpbWU6IG51bWJlciApID0+IHtcclxuICAgICAgY29uc3QgbWludXRlc0FuZFNlY29uZHMgPSBvcHRpb25zLnNob3dBc01pbnV0ZXNBbmRTZWNvbmRzID8gdG9NaW51dGVzQW5kU2Vjb25kcyggdGltZSApIDogTWF0aC5mbG9vciggdGltZSApO1xyXG4gICAgICBjb25zdCBjZW50aXNlY29uZHMgPSBTdG9wd2F0Y2hOb2RlLmdldERlY2ltYWxQbGFjZXMoIHRpbWUsIG9wdGlvbnMubnVtYmVyT2ZEZWNpbWFsUGxhY2VzICk7XHJcbiAgICAgIGNvbnN0IHVuaXRzID0gKCB0eXBlb2Ygb3B0aW9ucy51bml0cyA9PT0gJ3N0cmluZycgKSA/IG9wdGlvbnMudW5pdHMgOiBvcHRpb25zLnVuaXRzLnZhbHVlO1xyXG5cclxuICAgICAgLy8gU2luZ2xlIHF1b3RlcyBhcm91bmQgQ1NTIHN0eWxlIHNvIHRoZSBkb3VibGUtcXVvdGVzIGluIHRoZSBDU1MgZm9udCBmYW1pbHkgd29yay4gSGltYWxheWEgZG9lc24ndCBsaWtlICZxdW90O1xyXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NvbGxpc2lvbi1sYWIvaXNzdWVzLzE0MC5cclxuICAgICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggb3B0aW9ucy52YWx1ZVVuaXRzUGF0dGVybiwge1xyXG4gICAgICAgIHZhbHVlOiBgPHNwYW4gc3R5bGU9J2ZvbnQtc2l6ZTogJHtvcHRpb25zLmJpZ051bWJlckZvbnR9cHg7IGZvbnQtZmFtaWx5OiR7U3RvcHdhdGNoTm9kZS5OVU1CRVJfRk9OVF9GQU1JTFl9Oyc+JHttaW51dGVzQW5kU2Vjb25kc308L3NwYW4+PHNwYW4gc3R5bGU9J2ZvbnQtc2l6ZTogJHtvcHRpb25zLnNtYWxsTnVtYmVyRm9udH1weDtmb250LWZhbWlseToke1N0b3B3YXRjaE5vZGUuTlVNQkVSX0ZPTlRfRkFNSUxZfTsnPiR7Y2VudGlzZWNvbmRzfTwvc3Bhbj5gLFxyXG4gICAgICAgIHVuaXRzOiBgPHNwYW4gc3R5bGU9J2ZvbnQtc2l6ZTogJHtvcHRpb25zLnVuaXRzRm9udH1weDsgZm9udC1mYW1pbHk6JHtTdG9wd2F0Y2hOb2RlLk5VTUJFUl9GT05UX0ZBTUlMWX07Jz4ke3VuaXRzfTwvc3Bhbj5gXHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ29udmVydHMgYSB0aW1lIHRvIGEgc3RyaW5nIGluIHt7bWludXRlc319Ont7c2Vjb25kc319IGZvcm1hdC5cclxuICovXHJcbmZ1bmN0aW9uIHRvTWludXRlc0FuZFNlY29uZHMoIHRpbWU6IG51bWJlciApOiBzdHJpbmcge1xyXG5cclxuICAvLyBSb3VuZCB0byB0aGUgbmVhcmVzdCBjZW50aS1wYXJ0IChpZiB0aW1lIGlzIGluIHNlY29uZHMsIHRoaXMgd291bGQgYmUgY2VudGlzZWNvbmRzKVxyXG4gIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbWFzc2VzLWFuZC1zcHJpbmdzL2lzc3Vlcy8xNTZcclxuICB0aW1lID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIHRpbWUgKiAxMDAgKSAvIDEwMDtcclxuXHJcbiAgLy8gV2hlbiBzaG93aW5nIHVuaXRzLCBkb24ndCBzaG93IHRoZSBcIjAwOlwiIHByZWZpeCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzM3OFxyXG4gIGNvbnN0IHRpbWVJblNlY29uZHMgPSB0aW1lO1xyXG5cclxuICAvLyBJZiBubyB1bml0cyBhcmUgcHJvdmlkZWQsIHRoZW4gd2UgYXNzdW1lIHRoZSB0aW1lIGlzIGluIHNlY29uZHMsIGFuZCBzaG91bGQgYmUgc2hvd24gaW4gbW06c3MuY3NcclxuICBjb25zdCBtaW51dGVzID0gTWF0aC5mbG9vciggdGltZUluU2Vjb25kcyAvIDYwICk7XHJcbiAgY29uc3Qgc2Vjb25kcyA9IE1hdGguZmxvb3IoIHRpbWVJblNlY29uZHMgKSAlIDYwO1xyXG5cclxuICBjb25zdCBtaW51dGVzU3RyaW5nID0gKCBtaW51dGVzIDwgMTAgKSA/IGAwJHttaW51dGVzfWAgOiBgJHttaW51dGVzfWA7XHJcbiAgY29uc3Qgc2Vjb25kc1N0cmluZyA9ICggc2Vjb25kcyA8IDEwICkgPyBgMCR7c2Vjb25kc31gIDogYCR7c2Vjb25kc31gO1xyXG4gIHJldHVybiBgJHttaW51dGVzU3RyaW5nfToke3NlY29uZHNTdHJpbmd9YDtcclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdTdG9wd2F0Y2hOb2RlJywgU3RvcHdhdGNoTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFLQSxPQUFPQSxPQUFPLE1BQU0seUJBQXlCO0FBQzdDLE9BQU9DLEtBQUssTUFBTSx1QkFBdUI7QUFFekMsT0FBT0MsZ0JBQWdCLE1BQU0sc0RBQXNEO0FBQ25GLE9BQU9DLFNBQVMsSUFBSUMsY0FBYyxRQUFRLGlDQUFpQztBQUMzRSxPQUFPQyxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLFNBQVNDLE1BQU0sRUFBRUMsWUFBWSxFQUF1QkMsSUFBSSxFQUFFQyx1QkFBdUIsRUFBa0NDLElBQUksRUFBZUMsSUFBSSxFQUFtREMsSUFBSSxRQUFRLDZCQUE2QjtBQUN0TyxPQUFPQyw4QkFBOEIsTUFBTSx3REFBd0Q7QUFDbkcsT0FBT0MscUJBQXFCLE1BQU0sK0NBQStDO0FBQ2pGLE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0Msa0JBQWtCLE1BQU0seUJBQXlCO0FBQ3hELE9BQU9DLGFBQWEsTUFBZ0Msb0JBQW9CO0FBQ3hFLE9BQU9DLGNBQWMsTUFBTSxxQkFBcUI7QUFDaEQsT0FBT0MsUUFBUSxNQUFNLGVBQWU7QUFDcEMsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUM5QyxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBQzFDLE9BQU9DLGtCQUFrQixNQUFNLHlCQUF5QjtBQUN4RCxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBQ2xELE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFDdEMsT0FBT0MsZUFBZSxNQUFNLHNCQUFzQjtBQTBDbEQsZUFBZSxNQUFNQyxhQUFhLFNBQVNqQix1QkFBdUIsQ0FBRUMs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