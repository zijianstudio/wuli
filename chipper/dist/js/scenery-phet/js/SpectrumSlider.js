// Copyright 2013-2023, University of Colorado Boulder

/**
 * SpectrumSlider is a slider-like control used for choosing a value that corresponds to a displayed color.
 * It is the base class for WavelengthSlider.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import Utils from '../../dot/js/Utils.js';
import { Shape } from '../../kite/js/imports.js';
import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { Color, DragListener, FocusHighlightFromNode, Node, Path, Rectangle, Text } from '../../scenery/js/imports.js';
import AccessibleSlider from '../../sun/js/accessibility/AccessibleSlider.js';
import ArrowButton from '../../sun/js/buttons/ArrowButton.js';
import Tandem from '../../tandem/js/Tandem.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
import SpectrumNode from './SpectrumNode.js';
const DEFAULT_MIN_VALUE = 0;
const DEFAULT_MAX_VALUE = 1;
/**
 * @deprecated use WavelengthNumberControl, or Slider.js with SpectrumSliderTrack and SpectrumSliderTrack,
 *   see https://github.com/phetsims/scenery-phet/issues/729
 */
export default class SpectrumSlider extends AccessibleSlider(Node, 0) {
  /**
   * @param valueProperty
   * @param providedOptions
   */
  constructor(valueProperty, providedOptions) {
    assert && deprecationWarning('SpectrumSlider is deprecated, please use Slider with SpectrumSlideTrack/Thumb instead');
    const enabledRangeMin = providedOptions?.minValue ?? DEFAULT_MIN_VALUE;
    const enabledRangeMax = providedOptions?.maxValue ?? DEFAULT_MAX_VALUE;
    const enabledRangeProperty = new Property(new Range(enabledRangeMin, enabledRangeMax));

    // options that are specific to this type
    const options = optionize()({
      // SelfOptions
      minValue: DEFAULT_MIN_VALUE,
      maxValue: DEFAULT_MAX_VALUE,
      valueToString: value => `${value}`,
      valueToColor: value => new Color(0, 0, 255 * value),
      // track
      trackWidth: 150,
      trackHeight: 30,
      trackOpacity: 1,
      trackBorderStroke: 'black',
      // thumb
      thumbWidth: 35,
      thumbHeight: 45,
      thumbTouchAreaXDilation: 12,
      thumbTouchAreaYDilation: 10,
      thumbMouseAreaXDilation: 0,
      thumbMouseAreaYDilation: 0,
      // value
      valueFont: new PhetFont(20),
      valueFill: 'black',
      valueVisible: true,
      valueYSpacing: 2,
      // {number} space between value and top of track

      // tweakers
      tweakersVisible: true,
      tweakerValueDelta: 1,
      // {number} the amount that value changes when a tweaker button is pressed
      tweakersXSpacing: 8,
      // {number} space between tweakers and track
      maxTweakersHeight: 30,
      tweakersTouchAreaXDilation: 7,
      tweakersTouchAreaYDilation: 7,
      tweakersMouseAreaXDilation: 0,
      tweakersMouseAreaYDilation: 0,
      // cursor, the rectangle than follows the thumb in the track
      cursorVisible: true,
      cursorStroke: 'black',
      // ParentOptions
      valueProperty: valueProperty,
      enabledRangeProperty: enabledRangeProperty,
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Slider'
    }, providedOptions);

    // validate values
    assert && assert(options.minValue < options.maxValue);

    // These options require valid Bounds, and will be applied later via mutate.
    const boundsRequiredOptionKeys = _.pick(options, Node.REQUIRES_BOUNDS_OPTION_KEYS);
    super(_.omit(options, Node.REQUIRES_BOUNDS_OPTION_KEYS));
    const track = new SpectrumNode({
      valueToColor: options.valueToColor,
      size: new Dimension2(options.trackWidth, options.trackHeight),
      minValue: options.minValue,
      maxValue: options.maxValue,
      opacity: options.trackOpacity,
      cursor: 'pointer'
    });

    /*
     * Put a border around the track.
     * We don't stroke the track itself because stroking the track will affect its bounds,
     * and will thus affect the drag handle behavior.
     * Having a separate border also gives subclasses a place to add markings (eg, tick marks)
     * without affecting the track's bounds.
     */
    const trackBorder = new Rectangle(0, 0, track.width, track.height, {
      stroke: options.trackBorderStroke,
      lineWidth: 1,
      pickable: false
    });
    let valueDisplay = null;
    if (options.valueVisible) {
      valueDisplay = new ValueDisplay(valueProperty, options.valueToString, {
        font: options.valueFont,
        fill: options.valueFill,
        bottom: track.top - options.valueYSpacing
      });
    }
    let cursor = null;
    if (options.cursorVisible) {
      cursor = new Cursor(3, track.height, {
        stroke: options.cursorStroke,
        top: track.top
      });
    }
    const thumb = new Thumb(options.thumbWidth, options.thumbHeight, {
      cursor: 'pointer',
      top: track.bottom
    });

    // thumb touchArea
    if (options.thumbTouchAreaXDilation || options.thumbTouchAreaYDilation) {
      thumb.touchArea = thumb.localBounds.dilatedXY(options.thumbTouchAreaXDilation, options.thumbTouchAreaYDilation).shiftedY(options.thumbTouchAreaYDilation);
    }

    // thumb mouseArea
    if (options.thumbMouseAreaXDilation || options.thumbMouseAreaYDilation) {
      thumb.mouseArea = thumb.localBounds.dilatedXY(options.thumbMouseAreaXDilation, options.thumbMouseAreaYDilation).shiftedY(options.thumbMouseAreaYDilation);
    }

    // tweaker buttons for single-unit increments
    let plusButton = null;
    let minusButton = null;
    if (options.tweakersVisible) {
      plusButton = new ArrowButton('right', () => {
        // Increase the value, but keep it in range
        valueProperty.set(Math.min(options.maxValue, valueProperty.get() + options.tweakerValueDelta));
      }, {
        left: track.right + options.tweakersXSpacing,
        centerY: track.centerY,
        maxHeight: options.maxTweakersHeight,
        tandem: options.tandem.createTandem('plusButton')
      });
      minusButton = new ArrowButton('left', () => {
        // Decrease the value, but keep it in range
        valueProperty.set(Math.max(options.minValue, valueProperty.get() - options.tweakerValueDelta));
      }, {
        right: track.left - options.tweakersXSpacing,
        centerY: track.centerY,
        maxHeight: options.maxTweakersHeight,
        tandem: options.tandem.createTandem('minusButton')
      });

      // tweakers touchArea
      plusButton.touchArea = plusButton.localBounds.dilatedXY(options.tweakersTouchAreaXDilation, options.tweakersTouchAreaYDilation).shiftedX(options.tweakersTouchAreaXDilation);
      minusButton.touchArea = minusButton.localBounds.dilatedXY(options.tweakersTouchAreaXDilation, options.tweakersTouchAreaYDilation).shiftedX(-options.tweakersTouchAreaXDilation);

      // tweakers mouseArea
      plusButton.mouseArea = plusButton.localBounds.dilatedXY(options.tweakersMouseAreaXDilation, options.tweakersMouseAreaYDilation).shiftedX(options.tweakersMouseAreaXDilation);
      minusButton.mouseArea = minusButton.localBounds.dilatedXY(options.tweakersMouseAreaXDilation, options.tweakersMouseAreaYDilation).shiftedX(-options.tweakersMouseAreaXDilation);
    }

    // rendering order
    this.addChild(track);
    this.addChild(trackBorder);
    this.addChild(thumb);
    valueDisplay && this.addChild(valueDisplay);
    cursor && this.addChild(cursor);
    plusButton && this.addChild(plusButton);
    minusButton && this.addChild(minusButton);

    // transforms between position and value
    const positionToValue = x => Utils.clamp(Utils.linear(0, track.width, options.minValue, options.maxValue, x), options.minValue, options.maxValue);
    const valueToPosition = value => Utils.clamp(Utils.linear(options.minValue, options.maxValue, 0, track.width, value), 0, track.width);

    // click in the track to change the value, continue dragging if desired
    const handleTrackEvent = event => {
      const x = thumb.globalToParentPoint(event.pointer.point).x;
      const value = positionToValue(x);
      valueProperty.set(value);
    };
    track.addInputListener(new DragListener({
      allowTouchSnag: false,
      start: event => handleTrackEvent(event),
      drag: event => handleTrackEvent(event),
      tandem: options.tandem.createTandem('dragListener')
    }));

    // thumb drag handler
    let clickXOffset = 0; // x-offset between initial click and thumb's origin
    thumb.addInputListener(new DragListener({
      tandem: options.tandem.createTandem('thumbInputListener'),
      start: event => {
        clickXOffset = thumb.globalToParentPoint(event.pointer.point).x - thumb.x;
      },
      drag: event => {
        const x = thumb.globalToParentPoint(event.pointer.point).x - clickXOffset;
        const value = positionToValue(x);
        valueProperty.set(value);
      }
    }));

    // custom focus highlight that surrounds and moves with the thumb
    this.focusHighlight = new FocusHighlightFromNode(thumb);

    // sync with model
    const updateUI = value => {
      // positions
      const x = valueToPosition(value);
      thumb.centerX = x;
      if (cursor) {
        cursor.centerX = x;
      }
      if (valueDisplay) {
        valueDisplay.centerX = x;
      }

      // thumb color
      thumb.fill = options.valueToColor(value);

      // tweaker buttons
      if (plusButton) {
        plusButton.enabled = value < options.maxValue;
      }
      if (minusButton) {
        minusButton.enabled = value > options.minValue;
      }
    };
    const valueListener = value => updateUI(value);
    valueProperty.link(valueListener);

    /*
     * The horizontal bounds of the value control changes as the slider knob is dragged.
     * To prevent this, we determine the extents of the control's bounds at min and max values,
     * then add an invisible horizontal strut.
     */
    // determine bounds at min and max values
    updateUI(options.minValue);
    const minX = this.left;
    updateUI(options.maxValue);
    const maxX = this.right;

    // restore the initial value
    updateUI(valueProperty.get());

    // add a horizontal strut
    const strut = new Rectangle(minX, 0, maxX - minX, 1, {
      pickable: false
    });
    this.addChild(strut);
    strut.moveToBack();
    this.disposeSpectrumSlider = () => {
      valueDisplay && valueDisplay.dispose();
      plusButton && plusButton.dispose();
      minusButton && minusButton.dispose();
      valueProperty.unlink(valueListener);
    };

    // We already set other options via super(). Now that we have valid Bounds, apply these options.
    this.mutate(boundsRequiredOptionKeys);

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('scenery-phet', 'SpectrumSlider', this);
  }
  dispose() {
    this.disposeSpectrumSlider();
    super.dispose();
  }
}

/**
 * The slider thumb, origin at top center.
 */
class Thumb extends Path {
  constructor(width, height, providedOptions) {
    const options = combineOptions({
      fill: 'black',
      stroke: 'black',
      lineWidth: 1
    }, providedOptions);

    // Set the radius of the arcs based on the height or width, whichever is smaller.
    const radiusScale = 0.15;
    const radius = width < height ? radiusScale * width : radiusScale * height;

    // Calculate some parameters of the upper triangles of the thumb for getting arc offsets.
    const hypotenuse = Math.sqrt(Math.pow(0.5 * width, 2) + Math.pow(0.3 * height, 2));
    const angle = Math.acos(width * 0.5 / hypotenuse);
    const heightOffset = radius * Math.sin(angle);

    // Draw the thumb shape starting at the right upper corner of the pentagon below the arc,
    // this way we can get the arc coordinates for the arc in this corner from the other side,
    // which will be easier to calculate arcing from bottom to top.
    const shape = new Shape().moveTo(0.5 * width, 0.3 * height + heightOffset).lineTo(0.5 * width, height - radius).arc(0.5 * width - radius, height - radius, radius, 0, Math.PI / 2).lineTo(-0.5 * width + radius, height).arc(-0.5 * width + radius, height - radius, radius, Math.PI / 2, Math.PI).lineTo(-0.5 * width, 0.3 * height + heightOffset).arc(-0.5 * width + radius, 0.3 * height + heightOffset, radius, Math.PI, Math.PI + angle);

    // Save the coordinates for the point above the left side arc, for use on the other side.
    const sideArcPoint = shape.getLastPoint();
    assert && assert(sideArcPoint);
    shape.lineTo(0, 0).lineTo(-sideArcPoint.x, sideArcPoint.y).arc(0.5 * width - radius, 0.3 * height + heightOffset, radius, -angle, 0).close();
    super(shape, options);
  }
}

/**
 * Displays the value and units.
 */
class ValueDisplay extends Text {
  /**
   * @param valueProperty
   * @param valueToString - converts value {number} to text {string} for display
   * @param providedOptions
   */
  constructor(valueProperty, valueToString, providedOptions) {
    super('?', providedOptions);
    const valueObserver = value => {
      this.string = valueToString(value);
    };
    valueProperty.link(valueObserver);
    this.disposeValueDisplay = () => valueProperty.unlink(valueObserver);
  }
  dispose() {
    this.disposeValueDisplay();
    super.dispose();
  }
}

/**
 * Rectangular 'cursor' that appears in the track directly above the thumb. Origin is at top center.
 */
class Cursor extends Rectangle {
  constructor(width, height, providedOptions) {
    super(-width / 2, 0, width, height, providedOptions);
  }
}
sceneryPhet.register('SpectrumSlider', SpectrumSlider);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJSYW5nZSIsIlV0aWxzIiwiU2hhcGUiLCJkZXByZWNhdGlvbldhcm5pbmciLCJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJDb2xvciIsIkRyYWdMaXN0ZW5lciIsIkZvY3VzSGlnaGxpZ2h0RnJvbU5vZGUiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlRleHQiLCJBY2Nlc3NpYmxlU2xpZGVyIiwiQXJyb3dCdXR0b24iLCJUYW5kZW0iLCJQaGV0Rm9udCIsInNjZW5lcnlQaGV0IiwiU3BlY3RydW1Ob2RlIiwiREVGQVVMVF9NSU5fVkFMVUUiLCJERUZBVUxUX01BWF9WQUxVRSIsIlNwZWN0cnVtU2xpZGVyIiwiY29uc3RydWN0b3IiLCJ2YWx1ZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwiYXNzZXJ0IiwiZW5hYmxlZFJhbmdlTWluIiwibWluVmFsdWUiLCJlbmFibGVkUmFuZ2VNYXgiLCJtYXhWYWx1ZSIsImVuYWJsZWRSYW5nZVByb3BlcnR5Iiwib3B0aW9ucyIsInZhbHVlVG9TdHJpbmciLCJ2YWx1ZSIsInZhbHVlVG9Db2xvciIsInRyYWNrV2lkdGgiLCJ0cmFja0hlaWdodCIsInRyYWNrT3BhY2l0eSIsInRyYWNrQm9yZGVyU3Ryb2tlIiwidGh1bWJXaWR0aCIsInRodW1iSGVpZ2h0IiwidGh1bWJUb3VjaEFyZWFYRGlsYXRpb24iLCJ0aHVtYlRvdWNoQXJlYVlEaWxhdGlvbiIsInRodW1iTW91c2VBcmVhWERpbGF0aW9uIiwidGh1bWJNb3VzZUFyZWFZRGlsYXRpb24iLCJ2YWx1ZUZvbnQiLCJ2YWx1ZUZpbGwiLCJ2YWx1ZVZpc2libGUiLCJ2YWx1ZVlTcGFjaW5nIiwidHdlYWtlcnNWaXNpYmxlIiwidHdlYWtlclZhbHVlRGVsdGEiLCJ0d2Vha2Vyc1hTcGFjaW5nIiwibWF4VHdlYWtlcnNIZWlnaHQiLCJ0d2Vha2Vyc1RvdWNoQXJlYVhEaWxhdGlvbiIsInR3ZWFrZXJzVG91Y2hBcmVhWURpbGF0aW9uIiwidHdlYWtlcnNNb3VzZUFyZWFYRGlsYXRpb24iLCJ0d2Vha2Vyc01vdXNlQXJlYVlEaWxhdGlvbiIsImN1cnNvclZpc2libGUiLCJjdXJzb3JTdHJva2UiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInRhbmRlbU5hbWVTdWZmaXgiLCJib3VuZHNSZXF1aXJlZE9wdGlvbktleXMiLCJfIiwicGljayIsIlJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZUyIsIm9taXQiLCJ0cmFjayIsInNpemUiLCJvcGFjaXR5IiwiY3Vyc29yIiwidHJhY2tCb3JkZXIiLCJ3aWR0aCIsImhlaWdodCIsInN0cm9rZSIsImxpbmVXaWR0aCIsInBpY2thYmxlIiwidmFsdWVEaXNwbGF5IiwiVmFsdWVEaXNwbGF5IiwiZm9udCIsImZpbGwiLCJib3R0b20iLCJ0b3AiLCJDdXJzb3IiLCJ0aHVtYiIsIlRodW1iIiwidG91Y2hBcmVhIiwibG9jYWxCb3VuZHMiLCJkaWxhdGVkWFkiLCJzaGlmdGVkWSIsIm1vdXNlQXJlYSIsInBsdXNCdXR0b24iLCJtaW51c0J1dHRvbiIsInNldCIsIk1hdGgiLCJtaW4iLCJnZXQiLCJsZWZ0IiwicmlnaHQiLCJjZW50ZXJZIiwibWF4SGVpZ2h0IiwiY3JlYXRlVGFuZGVtIiwibWF4Iiwic2hpZnRlZFgiLCJhZGRDaGlsZCIsInBvc2l0aW9uVG9WYWx1ZSIsIngiLCJjbGFtcCIsImxpbmVhciIsInZhbHVlVG9Qb3NpdGlvbiIsImhhbmRsZVRyYWNrRXZlbnQiLCJldmVudCIsImdsb2JhbFRvUGFyZW50UG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJhZGRJbnB1dExpc3RlbmVyIiwiYWxsb3dUb3VjaFNuYWciLCJzdGFydCIsImRyYWciLCJjbGlja1hPZmZzZXQiLCJmb2N1c0hpZ2hsaWdodCIsInVwZGF0ZVVJIiwiY2VudGVyWCIsImVuYWJsZWQiLCJ2YWx1ZUxpc3RlbmVyIiwibGluayIsIm1pblgiLCJtYXhYIiwic3RydXQiLCJtb3ZlVG9CYWNrIiwiZGlzcG9zZVNwZWN0cnVtU2xpZGVyIiwiZGlzcG9zZSIsInVubGluayIsIm11dGF0ZSIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiYmluZGVyIiwicmVnaXN0ZXJEYXRhVVJMIiwicmFkaXVzU2NhbGUiLCJyYWRpdXMiLCJoeXBvdGVudXNlIiwic3FydCIsInBvdyIsImFuZ2xlIiwiYWNvcyIsImhlaWdodE9mZnNldCIsInNpbiIsInNoYXBlIiwibW92ZVRvIiwibGluZVRvIiwiYXJjIiwiUEkiLCJzaWRlQXJjUG9pbnQiLCJnZXRMYXN0UG9pbnQiLCJ5IiwiY2xvc2UiLCJ2YWx1ZU9ic2VydmVyIiwic3RyaW5nIiwiZGlzcG9zZVZhbHVlRGlzcGxheSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3BlY3RydW1TbGlkZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU3BlY3RydW1TbGlkZXIgaXMgYSBzbGlkZXItbGlrZSBjb250cm9sIHVzZWQgZm9yIGNob29zaW5nIGEgdmFsdWUgdGhhdCBjb3JyZXNwb25kcyB0byBhIGRpc3BsYXllZCBjb2xvci5cclxuICogSXQgaXMgdGhlIGJhc2UgY2xhc3MgZm9yIFdhdmVsZW5ndGhTbGlkZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBkZXByZWNhdGlvbldhcm5pbmcgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RlcHJlY2F0aW9uV2FybmluZy5qcyc7XHJcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBEcmFnTGlzdGVuZXIsIEZvY3VzSGlnaGxpZ2h0RnJvbU5vZGUsIEZvbnQsIFRDb2xvciwgTm9kZSwgTm9kZU9wdGlvbnMsIFBhdGgsIFBhdGhPcHRpb25zLCBSZWN0YW5nbGUsIFJlY3RhbmdsZU9wdGlvbnMsIFNjZW5lcnlFdmVudCwgVGV4dCwgVGV4dE9wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQWNjZXNzaWJsZVNsaWRlciwgeyBBY2Nlc3NpYmxlU2xpZGVyT3B0aW9ucyB9IGZyb20gJy4uLy4uL3N1bi9qcy9hY2Nlc3NpYmlsaXR5L0FjY2Vzc2libGVTbGlkZXIuanMnO1xyXG5pbXBvcnQgQXJyb3dCdXR0b24gZnJvbSAnLi4vLi4vc3VuL2pzL2J1dHRvbnMvQXJyb3dCdXR0b24uanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcclxuaW1wb3J0IFNwZWN0cnVtTm9kZSBmcm9tICcuL1NwZWN0cnVtTm9kZS5qcyc7XHJcblxyXG5jb25zdCBERUZBVUxUX01JTl9WQUxVRSA9IDA7XHJcbmNvbnN0IERFRkFVTFRfTUFYX1ZBTFVFID0gMTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIFRoZSBtaW5pbXVtIHZhbHVlIHRvIGJlIGRpc3BsYXllZFxyXG4gIG1pblZhbHVlPzogbnVtYmVyO1xyXG5cclxuICAvLyBUaGUgbWF4aW11bSB2YWx1ZSB0byBiZSBkaXNwbGF5ZWRcclxuICBtYXhWYWx1ZT86IG51bWJlcjtcclxuXHJcbiAgLy8gTWFwcyB2YWx1ZSB0byBzdHJpbmcgdGhhdCBpcyBvcHRpb25hbGx5IGRpc3BsYXllZCBieSB0aGUgc2xpZGVyXHJcbiAgdmFsdWVUb1N0cmluZz86ICggdmFsdWU6IG51bWJlciApID0+IHN0cmluZztcclxuXHJcbiAgLy8gTWFwcyB2YWx1ZSB0byBDb2xvciB0aGF0IGlzIHJlbmRlcmVkIGluIHRoZSBzcGVjdHJ1bSBhbmQgaW4gdGhlIHRodW1iXHJcbiAgdmFsdWVUb0NvbG9yPzogKCB2YWx1ZTogbnVtYmVyICkgPT4gQ29sb3I7XHJcblxyXG4gIC8vIHRyYWNrIHByb3BlcnRpZXNcclxuICB0cmFja1dpZHRoPzogbnVtYmVyO1xyXG4gIHRyYWNrSGVpZ2h0PzogbnVtYmVyO1xyXG4gIHRyYWNrT3BhY2l0eT86IG51bWJlcjsgLy8gWzAsMV1cclxuICB0cmFja0JvcmRlclN0cm9rZT86IFRDb2xvcjtcclxuXHJcbiAgLy8gdGh1bWJcclxuICB0aHVtYldpZHRoPzogbnVtYmVyO1xyXG4gIHRodW1iSGVpZ2h0PzogbnVtYmVyO1xyXG4gIHRodW1iVG91Y2hBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xyXG4gIHRodW1iVG91Y2hBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xyXG4gIHRodW1iTW91c2VBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xyXG4gIHRodW1iTW91c2VBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xyXG5cclxuICAvLyB2YWx1ZVxyXG4gIHZhbHVlRm9udD86IEZvbnQ7XHJcbiAgdmFsdWVGaWxsPzogVENvbG9yO1xyXG4gIHZhbHVlVmlzaWJsZT86IGJvb2xlYW47XHJcbiAgdmFsdWVZU3BhY2luZz86IG51bWJlcjsgLy8gc3BhY2UgYmV0d2VlbiB2YWx1ZSBhbmQgdG9wIG9mIHRyYWNrXHJcblxyXG4gIC8vIHR3ZWFrZXJzXHJcbiAgdHdlYWtlcnNWaXNpYmxlPzogYm9vbGVhbjtcclxuICB0d2Vha2VyVmFsdWVEZWx0YT86IG51bWJlcjsgLy8gdGhlIGFtb3VudCB0aGF0IHZhbHVlIGNoYW5nZXMgd2hlbiBhIHR3ZWFrZXIgYnV0dG9uIGlzIHByZXNzZWRcclxuICB0d2Vha2Vyc1hTcGFjaW5nPzogbnVtYmVyOyAvLyBzcGFjZSBiZXR3ZWVuIHR3ZWFrZXJzIGFuZCB0cmFja1xyXG4gIG1heFR3ZWFrZXJzSGVpZ2h0PzogbnVtYmVyO1xyXG4gIHR3ZWFrZXJzVG91Y2hBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xyXG4gIHR3ZWFrZXJzVG91Y2hBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xyXG4gIHR3ZWFrZXJzTW91c2VBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xyXG4gIHR3ZWFrZXJzTW91c2VBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xyXG5cclxuICAvLyBjdXJzb3IsIHRoZSByZWN0YW5nbGUgdGhhbiBmb2xsb3dzIHRoZSB0aHVtYiBpbiB0aGUgdHJhY2tcclxuICBjdXJzb3JWaXNpYmxlPzogYm9vbGVhbjtcclxuICBjdXJzb3JTdHJva2U/OiBUQ29sb3I7XHJcbn07XHJcbnR5cGUgUGFyZW50T3B0aW9ucyA9IEFjY2Vzc2libGVTbGlkZXJPcHRpb25zICYgTm9kZU9wdGlvbnM7XHJcbmV4cG9ydCB0eXBlIFNwZWN0cnVtU2xpZGVyT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxQYXJlbnRPcHRpb25zLCAndmFsdWVQcm9wZXJ0eScgfCAnZW5hYmxlZFJhbmdlUHJvcGVydHknPjtcclxuXHJcbi8qKlxyXG4gKiBAZGVwcmVjYXRlZCB1c2UgV2F2ZWxlbmd0aE51bWJlckNvbnRyb2wsIG9yIFNsaWRlci5qcyB3aXRoIFNwZWN0cnVtU2xpZGVyVHJhY2sgYW5kIFNwZWN0cnVtU2xpZGVyVHJhY2ssXHJcbiAqICAgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzcyOVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BlY3RydW1TbGlkZXIgZXh0ZW5kcyBBY2Nlc3NpYmxlU2xpZGVyKCBOb2RlLCAwICkge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VTcGVjdHJ1bVNsaWRlcjogKCkgPT4gdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHZhbHVlUHJvcGVydHlcclxuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2YWx1ZVByb3BlcnR5OiBUUHJvcGVydHk8bnVtYmVyPiwgcHJvdmlkZWRPcHRpb25zPzogU3BlY3RydW1TbGlkZXJPcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGRlcHJlY2F0aW9uV2FybmluZyggJ1NwZWN0cnVtU2xpZGVyIGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgU2xpZGVyIHdpdGggU3BlY3RydW1TbGlkZVRyYWNrL1RodW1iIGluc3RlYWQnICk7XHJcblxyXG4gICAgY29uc3QgZW5hYmxlZFJhbmdlTWluID0gcHJvdmlkZWRPcHRpb25zPy5taW5WYWx1ZSA/PyBERUZBVUxUX01JTl9WQUxVRTtcclxuICAgIGNvbnN0IGVuYWJsZWRSYW5nZU1heCA9IHByb3ZpZGVkT3B0aW9ucz8ubWF4VmFsdWUgPz8gREVGQVVMVF9NQVhfVkFMVUU7XHJcbiAgICBjb25zdCBlbmFibGVkUmFuZ2VQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbmV3IFJhbmdlKCBlbmFibGVkUmFuZ2VNaW4sIGVuYWJsZWRSYW5nZU1heCApICk7XHJcblxyXG4gICAgLy8gb3B0aW9ucyB0aGF0IGFyZSBzcGVjaWZpYyB0byB0aGlzIHR5cGVcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U3BlY3RydW1TbGlkZXJPcHRpb25zLCBTZWxmT3B0aW9ucywgUGFyZW50T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgbWluVmFsdWU6IERFRkFVTFRfTUlOX1ZBTFVFLFxyXG4gICAgICBtYXhWYWx1ZTogREVGQVVMVF9NQVhfVkFMVUUsXHJcbiAgICAgIHZhbHVlVG9TdHJpbmc6ICggdmFsdWU6IG51bWJlciApID0+IGAke3ZhbHVlfWAsXHJcbiAgICAgIHZhbHVlVG9Db2xvcjogKCB2YWx1ZTogbnVtYmVyICkgPT4gbmV3IENvbG9yKCAwLCAwLCAyNTUgKiB2YWx1ZSApLFxyXG5cclxuICAgICAgLy8gdHJhY2tcclxuICAgICAgdHJhY2tXaWR0aDogMTUwLFxyXG4gICAgICB0cmFja0hlaWdodDogMzAsXHJcbiAgICAgIHRyYWNrT3BhY2l0eTogMSxcclxuICAgICAgdHJhY2tCb3JkZXJTdHJva2U6ICdibGFjaycsXHJcblxyXG4gICAgICAvLyB0aHVtYlxyXG4gICAgICB0aHVtYldpZHRoOiAzNSxcclxuICAgICAgdGh1bWJIZWlnaHQ6IDQ1LFxyXG4gICAgICB0aHVtYlRvdWNoQXJlYVhEaWxhdGlvbjogMTIsXHJcbiAgICAgIHRodW1iVG91Y2hBcmVhWURpbGF0aW9uOiAxMCxcclxuICAgICAgdGh1bWJNb3VzZUFyZWFYRGlsYXRpb246IDAsXHJcbiAgICAgIHRodW1iTW91c2VBcmVhWURpbGF0aW9uOiAwLFxyXG5cclxuICAgICAgLy8gdmFsdWVcclxuICAgICAgdmFsdWVGb250OiBuZXcgUGhldEZvbnQoIDIwICksXHJcbiAgICAgIHZhbHVlRmlsbDogJ2JsYWNrJyxcclxuICAgICAgdmFsdWVWaXNpYmxlOiB0cnVlLFxyXG4gICAgICB2YWx1ZVlTcGFjaW5nOiAyLCAvLyB7bnVtYmVyfSBzcGFjZSBiZXR3ZWVuIHZhbHVlIGFuZCB0b3Agb2YgdHJhY2tcclxuXHJcbiAgICAgIC8vIHR3ZWFrZXJzXHJcbiAgICAgIHR3ZWFrZXJzVmlzaWJsZTogdHJ1ZSxcclxuICAgICAgdHdlYWtlclZhbHVlRGVsdGE6IDEsIC8vIHtudW1iZXJ9IHRoZSBhbW91bnQgdGhhdCB2YWx1ZSBjaGFuZ2VzIHdoZW4gYSB0d2Vha2VyIGJ1dHRvbiBpcyBwcmVzc2VkXHJcbiAgICAgIHR3ZWFrZXJzWFNwYWNpbmc6IDgsIC8vIHtudW1iZXJ9IHNwYWNlIGJldHdlZW4gdHdlYWtlcnMgYW5kIHRyYWNrXHJcbiAgICAgIG1heFR3ZWFrZXJzSGVpZ2h0OiAzMCxcclxuICAgICAgdHdlYWtlcnNUb3VjaEFyZWFYRGlsYXRpb246IDcsXHJcbiAgICAgIHR3ZWFrZXJzVG91Y2hBcmVhWURpbGF0aW9uOiA3LFxyXG4gICAgICB0d2Vha2Vyc01vdXNlQXJlYVhEaWxhdGlvbjogMCxcclxuICAgICAgdHdlYWtlcnNNb3VzZUFyZWFZRGlsYXRpb246IDAsXHJcblxyXG4gICAgICAvLyBjdXJzb3IsIHRoZSByZWN0YW5nbGUgdGhhbiBmb2xsb3dzIHRoZSB0aHVtYiBpbiB0aGUgdHJhY2tcclxuICAgICAgY3Vyc29yVmlzaWJsZTogdHJ1ZSxcclxuICAgICAgY3Vyc29yU3Ryb2tlOiAnYmxhY2snLFxyXG5cclxuICAgICAgLy8gUGFyZW50T3B0aW9uc1xyXG4gICAgICB2YWx1ZVByb3BlcnR5OiB2YWx1ZVByb3BlcnR5LFxyXG4gICAgICBlbmFibGVkUmFuZ2VQcm9wZXJ0eTogZW5hYmxlZFJhbmdlUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxyXG4gICAgICB0YW5kZW1OYW1lU3VmZml4OiAnU2xpZGVyJ1xyXG5cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHZhbGlkYXRlIHZhbHVlc1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5taW5WYWx1ZSA8IG9wdGlvbnMubWF4VmFsdWUgKTtcclxuXHJcbiAgICAvLyBUaGVzZSBvcHRpb25zIHJlcXVpcmUgdmFsaWQgQm91bmRzLCBhbmQgd2lsbCBiZSBhcHBsaWVkIGxhdGVyIHZpYSBtdXRhdGUuXHJcbiAgICBjb25zdCBib3VuZHNSZXF1aXJlZE9wdGlvbktleXMgPSBfLnBpY2soIG9wdGlvbnMsIE5vZGUuUkVRVUlSRVNfQk9VTkRTX09QVElPTl9LRVlTICk7XHJcblxyXG4gICAgc3VwZXIoIF8ub21pdCggb3B0aW9ucywgTm9kZS5SRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVMgKSApO1xyXG5cclxuICAgIGNvbnN0IHRyYWNrID0gbmV3IFNwZWN0cnVtTm9kZSgge1xyXG4gICAgICB2YWx1ZVRvQ29sb3I6IG9wdGlvbnMudmFsdWVUb0NvbG9yLFxyXG4gICAgICBzaXplOiBuZXcgRGltZW5zaW9uMiggb3B0aW9ucy50cmFja1dpZHRoLCBvcHRpb25zLnRyYWNrSGVpZ2h0ICksXHJcbiAgICAgIG1pblZhbHVlOiBvcHRpb25zLm1pblZhbHVlLFxyXG4gICAgICBtYXhWYWx1ZTogb3B0aW9ucy5tYXhWYWx1ZSxcclxuICAgICAgb3BhY2l0eTogb3B0aW9ucy50cmFja09wYWNpdHksXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLypcclxuICAgICAqIFB1dCBhIGJvcmRlciBhcm91bmQgdGhlIHRyYWNrLlxyXG4gICAgICogV2UgZG9uJ3Qgc3Ryb2tlIHRoZSB0cmFjayBpdHNlbGYgYmVjYXVzZSBzdHJva2luZyB0aGUgdHJhY2sgd2lsbCBhZmZlY3QgaXRzIGJvdW5kcyxcclxuICAgICAqIGFuZCB3aWxsIHRodXMgYWZmZWN0IHRoZSBkcmFnIGhhbmRsZSBiZWhhdmlvci5cclxuICAgICAqIEhhdmluZyBhIHNlcGFyYXRlIGJvcmRlciBhbHNvIGdpdmVzIHN1YmNsYXNzZXMgYSBwbGFjZSB0byBhZGQgbWFya2luZ3MgKGVnLCB0aWNrIG1hcmtzKVxyXG4gICAgICogd2l0aG91dCBhZmZlY3RpbmcgdGhlIHRyYWNrJ3MgYm91bmRzLlxyXG4gICAgICovXHJcbiAgICBjb25zdCB0cmFja0JvcmRlciA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIHRyYWNrLndpZHRoLCB0cmFjay5oZWlnaHQsIHtcclxuICAgICAgc3Ryb2tlOiBvcHRpb25zLnRyYWNrQm9yZGVyU3Ryb2tlLFxyXG4gICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIGxldCB2YWx1ZURpc3BsYXk6IE5vZGUgfCBudWxsID0gbnVsbDtcclxuICAgIGlmICggb3B0aW9ucy52YWx1ZVZpc2libGUgKSB7XHJcbiAgICAgIHZhbHVlRGlzcGxheSA9IG5ldyBWYWx1ZURpc3BsYXkoIHZhbHVlUHJvcGVydHksIG9wdGlvbnMudmFsdWVUb1N0cmluZywge1xyXG4gICAgICAgIGZvbnQ6IG9wdGlvbnMudmFsdWVGb250LFxyXG4gICAgICAgIGZpbGw6IG9wdGlvbnMudmFsdWVGaWxsLFxyXG4gICAgICAgIGJvdHRvbTogdHJhY2sudG9wIC0gb3B0aW9ucy52YWx1ZVlTcGFjaW5nXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgY3Vyc29yOiBDdXJzb3IgfCBudWxsID0gbnVsbDtcclxuICAgIGlmICggb3B0aW9ucy5jdXJzb3JWaXNpYmxlICkge1xyXG4gICAgICBjdXJzb3IgPSBuZXcgQ3Vyc29yKCAzLCB0cmFjay5oZWlnaHQsIHtcclxuICAgICAgICBzdHJva2U6IG9wdGlvbnMuY3Vyc29yU3Ryb2tlLFxyXG4gICAgICAgIHRvcDogdHJhY2sudG9wXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0aHVtYiA9IG5ldyBUaHVtYiggb3B0aW9ucy50aHVtYldpZHRoLCBvcHRpb25zLnRodW1iSGVpZ2h0LCB7XHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICB0b3A6IHRyYWNrLmJvdHRvbVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHRodW1iIHRvdWNoQXJlYVxyXG4gICAgaWYgKCBvcHRpb25zLnRodW1iVG91Y2hBcmVhWERpbGF0aW9uIHx8IG9wdGlvbnMudGh1bWJUb3VjaEFyZWFZRGlsYXRpb24gKSB7XHJcbiAgICAgIHRodW1iLnRvdWNoQXJlYSA9IHRodW1iLmxvY2FsQm91bmRzXHJcbiAgICAgICAgLmRpbGF0ZWRYWSggb3B0aW9ucy50aHVtYlRvdWNoQXJlYVhEaWxhdGlvbiwgb3B0aW9ucy50aHVtYlRvdWNoQXJlYVlEaWxhdGlvbiApXHJcbiAgICAgICAgLnNoaWZ0ZWRZKCBvcHRpb25zLnRodW1iVG91Y2hBcmVhWURpbGF0aW9uICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGh1bWIgbW91c2VBcmVhXHJcbiAgICBpZiAoIG9wdGlvbnMudGh1bWJNb3VzZUFyZWFYRGlsYXRpb24gfHwgb3B0aW9ucy50aHVtYk1vdXNlQXJlYVlEaWxhdGlvbiApIHtcclxuICAgICAgdGh1bWIubW91c2VBcmVhID0gdGh1bWIubG9jYWxCb3VuZHNcclxuICAgICAgICAuZGlsYXRlZFhZKCBvcHRpb25zLnRodW1iTW91c2VBcmVhWERpbGF0aW9uLCBvcHRpb25zLnRodW1iTW91c2VBcmVhWURpbGF0aW9uIClcclxuICAgICAgICAuc2hpZnRlZFkoIG9wdGlvbnMudGh1bWJNb3VzZUFyZWFZRGlsYXRpb24gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0d2Vha2VyIGJ1dHRvbnMgZm9yIHNpbmdsZS11bml0IGluY3JlbWVudHNcclxuICAgIGxldCBwbHVzQnV0dG9uOiBOb2RlIHwgbnVsbCA9IG51bGw7XHJcbiAgICBsZXQgbWludXNCdXR0b246IE5vZGUgfCBudWxsID0gbnVsbDtcclxuICAgIGlmICggb3B0aW9ucy50d2Vha2Vyc1Zpc2libGUgKSB7XHJcblxyXG4gICAgICBwbHVzQnV0dG9uID0gbmV3IEFycm93QnV0dG9uKCAncmlnaHQnLCAoICgpID0+IHtcclxuXHJcbiAgICAgICAgLy8gSW5jcmVhc2UgdGhlIHZhbHVlLCBidXQga2VlcCBpdCBpbiByYW5nZVxyXG4gICAgICAgIHZhbHVlUHJvcGVydHkuc2V0KCBNYXRoLm1pbiggb3B0aW9ucy5tYXhWYWx1ZSwgdmFsdWVQcm9wZXJ0eS5nZXQoKSArIG9wdGlvbnMudHdlYWtlclZhbHVlRGVsdGEgKSApO1xyXG4gICAgICB9ICksIHtcclxuICAgICAgICBsZWZ0OiB0cmFjay5yaWdodCArIG9wdGlvbnMudHdlYWtlcnNYU3BhY2luZyxcclxuICAgICAgICBjZW50ZXJZOiB0cmFjay5jZW50ZXJZLFxyXG4gICAgICAgIG1heEhlaWdodDogb3B0aW9ucy5tYXhUd2Vha2Vyc0hlaWdodCxcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BsdXNCdXR0b24nIClcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgbWludXNCdXR0b24gPSBuZXcgQXJyb3dCdXR0b24oICdsZWZ0JywgKCAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIERlY3JlYXNlIHRoZSB2YWx1ZSwgYnV0IGtlZXAgaXQgaW4gcmFuZ2VcclxuICAgICAgICB2YWx1ZVByb3BlcnR5LnNldCggTWF0aC5tYXgoIG9wdGlvbnMubWluVmFsdWUsIHZhbHVlUHJvcGVydHkuZ2V0KCkgLSBvcHRpb25zLnR3ZWFrZXJWYWx1ZURlbHRhICkgKTtcclxuICAgICAgfSApLCB7XHJcbiAgICAgICAgcmlnaHQ6IHRyYWNrLmxlZnQgLSBvcHRpb25zLnR3ZWFrZXJzWFNwYWNpbmcsXHJcbiAgICAgICAgY2VudGVyWTogdHJhY2suY2VudGVyWSxcclxuICAgICAgICBtYXhIZWlnaHQ6IG9wdGlvbnMubWF4VHdlYWtlcnNIZWlnaHQsXHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtaW51c0J1dHRvbicgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyB0d2Vha2VycyB0b3VjaEFyZWFcclxuICAgICAgcGx1c0J1dHRvbi50b3VjaEFyZWEgPSBwbHVzQnV0dG9uLmxvY2FsQm91bmRzXHJcbiAgICAgICAgLmRpbGF0ZWRYWSggb3B0aW9ucy50d2Vha2Vyc1RvdWNoQXJlYVhEaWxhdGlvbiwgb3B0aW9ucy50d2Vha2Vyc1RvdWNoQXJlYVlEaWxhdGlvbiApXHJcbiAgICAgICAgLnNoaWZ0ZWRYKCBvcHRpb25zLnR3ZWFrZXJzVG91Y2hBcmVhWERpbGF0aW9uICk7XHJcbiAgICAgIG1pbnVzQnV0dG9uLnRvdWNoQXJlYSA9IG1pbnVzQnV0dG9uLmxvY2FsQm91bmRzXHJcbiAgICAgICAgLmRpbGF0ZWRYWSggb3B0aW9ucy50d2Vha2Vyc1RvdWNoQXJlYVhEaWxhdGlvbiwgb3B0aW9ucy50d2Vha2Vyc1RvdWNoQXJlYVlEaWxhdGlvbiApXHJcbiAgICAgICAgLnNoaWZ0ZWRYKCAtb3B0aW9ucy50d2Vha2Vyc1RvdWNoQXJlYVhEaWxhdGlvbiApO1xyXG5cclxuICAgICAgLy8gdHdlYWtlcnMgbW91c2VBcmVhXHJcbiAgICAgIHBsdXNCdXR0b24ubW91c2VBcmVhID0gcGx1c0J1dHRvbi5sb2NhbEJvdW5kc1xyXG4gICAgICAgIC5kaWxhdGVkWFkoIG9wdGlvbnMudHdlYWtlcnNNb3VzZUFyZWFYRGlsYXRpb24sIG9wdGlvbnMudHdlYWtlcnNNb3VzZUFyZWFZRGlsYXRpb24gKVxyXG4gICAgICAgIC5zaGlmdGVkWCggb3B0aW9ucy50d2Vha2Vyc01vdXNlQXJlYVhEaWxhdGlvbiApO1xyXG4gICAgICBtaW51c0J1dHRvbi5tb3VzZUFyZWEgPSBtaW51c0J1dHRvbi5sb2NhbEJvdW5kc1xyXG4gICAgICAgIC5kaWxhdGVkWFkoIG9wdGlvbnMudHdlYWtlcnNNb3VzZUFyZWFYRGlsYXRpb24sIG9wdGlvbnMudHdlYWtlcnNNb3VzZUFyZWFZRGlsYXRpb24gKVxyXG4gICAgICAgIC5zaGlmdGVkWCggLW9wdGlvbnMudHdlYWtlcnNNb3VzZUFyZWFYRGlsYXRpb24gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZW5kZXJpbmcgb3JkZXJcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRyYWNrICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0cmFja0JvcmRlciApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGh1bWIgKTtcclxuICAgIHZhbHVlRGlzcGxheSAmJiB0aGlzLmFkZENoaWxkKCB2YWx1ZURpc3BsYXkgKTtcclxuICAgIGN1cnNvciAmJiB0aGlzLmFkZENoaWxkKCBjdXJzb3IgKTtcclxuICAgIHBsdXNCdXR0b24gJiYgdGhpcy5hZGRDaGlsZCggcGx1c0J1dHRvbiApO1xyXG4gICAgbWludXNCdXR0b24gJiYgdGhpcy5hZGRDaGlsZCggbWludXNCdXR0b24gKTtcclxuXHJcbiAgICAvLyB0cmFuc2Zvcm1zIGJldHdlZW4gcG9zaXRpb24gYW5kIHZhbHVlXHJcbiAgICBjb25zdCBwb3NpdGlvblRvVmFsdWUgPSAoIHg6IG51bWJlciApID0+XHJcbiAgICAgIFV0aWxzLmNsYW1wKCBVdGlscy5saW5lYXIoIDAsIHRyYWNrLndpZHRoLCBvcHRpb25zLm1pblZhbHVlLCBvcHRpb25zLm1heFZhbHVlLCB4ICksIG9wdGlvbnMubWluVmFsdWUsIG9wdGlvbnMubWF4VmFsdWUgKTtcclxuICAgIGNvbnN0IHZhbHVlVG9Qb3NpdGlvbiA9ICggdmFsdWU6IG51bWJlciApID0+XHJcbiAgICAgIFV0aWxzLmNsYW1wKCBVdGlscy5saW5lYXIoIG9wdGlvbnMubWluVmFsdWUsIG9wdGlvbnMubWF4VmFsdWUsIDAsIHRyYWNrLndpZHRoLCB2YWx1ZSApLCAwLCB0cmFjay53aWR0aCApO1xyXG5cclxuICAgIC8vIGNsaWNrIGluIHRoZSB0cmFjayB0byBjaGFuZ2UgdGhlIHZhbHVlLCBjb250aW51ZSBkcmFnZ2luZyBpZiBkZXNpcmVkXHJcbiAgICBjb25zdCBoYW5kbGVUcmFja0V2ZW50ID0gKCBldmVudDogU2NlbmVyeUV2ZW50ICkgPT4ge1xyXG4gICAgICBjb25zdCB4ID0gdGh1bWIuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApLng7XHJcbiAgICAgIGNvbnN0IHZhbHVlID0gcG9zaXRpb25Ub1ZhbHVlKCB4ICk7XHJcbiAgICAgIHZhbHVlUHJvcGVydHkuc2V0KCB2YWx1ZSApO1xyXG4gICAgfTtcclxuXHJcbiAgICB0cmFjay5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIGFsbG93VG91Y2hTbmFnOiBmYWxzZSxcclxuICAgICAgc3RhcnQ6IGV2ZW50ID0+IGhhbmRsZVRyYWNrRXZlbnQoIGV2ZW50ICksXHJcbiAgICAgIGRyYWc6IGV2ZW50ID0+IGhhbmRsZVRyYWNrRXZlbnQoIGV2ZW50ICksXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0xpc3RlbmVyJyApXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyB0aHVtYiBkcmFnIGhhbmRsZXJcclxuICAgIGxldCBjbGlja1hPZmZzZXQgPSAwOyAvLyB4LW9mZnNldCBiZXR3ZWVuIGluaXRpYWwgY2xpY2sgYW5kIHRodW1iJ3Mgb3JpZ2luXHJcbiAgICB0aHVtYi5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcblxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RodW1iSW5wdXRMaXN0ZW5lcicgKSxcclxuXHJcbiAgICAgIHN0YXJ0OiBldmVudCA9PiB7XHJcbiAgICAgICAgY2xpY2tYT2Zmc2V0ID0gdGh1bWIuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApLnggLSB0aHVtYi54O1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgZHJhZzogZXZlbnQgPT4ge1xyXG4gICAgICAgIGNvbnN0IHggPSB0aHVtYi5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkueCAtIGNsaWNrWE9mZnNldDtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IHBvc2l0aW9uVG9WYWx1ZSggeCApO1xyXG4gICAgICAgIHZhbHVlUHJvcGVydHkuc2V0KCB2YWx1ZSApO1xyXG4gICAgICB9XHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBjdXN0b20gZm9jdXMgaGlnaGxpZ2h0IHRoYXQgc3Vycm91bmRzIGFuZCBtb3ZlcyB3aXRoIHRoZSB0aHVtYlxyXG4gICAgdGhpcy5mb2N1c0hpZ2hsaWdodCA9IG5ldyBGb2N1c0hpZ2hsaWdodEZyb21Ob2RlKCB0aHVtYiApO1xyXG5cclxuICAgIC8vIHN5bmMgd2l0aCBtb2RlbFxyXG4gICAgY29uc3QgdXBkYXRlVUkgPSAoIHZhbHVlOiBudW1iZXIgKSA9PiB7XHJcblxyXG4gICAgICAvLyBwb3NpdGlvbnNcclxuICAgICAgY29uc3QgeCA9IHZhbHVlVG9Qb3NpdGlvbiggdmFsdWUgKTtcclxuICAgICAgdGh1bWIuY2VudGVyWCA9IHg7XHJcbiAgICAgIGlmICggY3Vyc29yICkgeyBjdXJzb3IuY2VudGVyWCA9IHg7IH1cclxuICAgICAgaWYgKCB2YWx1ZURpc3BsYXkgKSB7IHZhbHVlRGlzcGxheS5jZW50ZXJYID0geDsgfVxyXG5cclxuICAgICAgLy8gdGh1bWIgY29sb3JcclxuICAgICAgdGh1bWIuZmlsbCA9IG9wdGlvbnMudmFsdWVUb0NvbG9yKCB2YWx1ZSApO1xyXG5cclxuICAgICAgLy8gdHdlYWtlciBidXR0b25zXHJcbiAgICAgIGlmICggcGx1c0J1dHRvbiApIHtcclxuICAgICAgICBwbHVzQnV0dG9uLmVuYWJsZWQgPSAoIHZhbHVlIDwgb3B0aW9ucy5tYXhWYWx1ZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggbWludXNCdXR0b24gKSB7XHJcbiAgICAgICAgbWludXNCdXR0b24uZW5hYmxlZCA9ICggdmFsdWUgPiBvcHRpb25zLm1pblZhbHVlICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBjb25zdCB2YWx1ZUxpc3RlbmVyID0gKCB2YWx1ZTogbnVtYmVyICkgPT4gdXBkYXRlVUkoIHZhbHVlICk7XHJcbiAgICB2YWx1ZVByb3BlcnR5LmxpbmsoIHZhbHVlTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGhvcml6b250YWwgYm91bmRzIG9mIHRoZSB2YWx1ZSBjb250cm9sIGNoYW5nZXMgYXMgdGhlIHNsaWRlciBrbm9iIGlzIGRyYWdnZWQuXHJcbiAgICAgKiBUbyBwcmV2ZW50IHRoaXMsIHdlIGRldGVybWluZSB0aGUgZXh0ZW50cyBvZiB0aGUgY29udHJvbCdzIGJvdW5kcyBhdCBtaW4gYW5kIG1heCB2YWx1ZXMsXHJcbiAgICAgKiB0aGVuIGFkZCBhbiBpbnZpc2libGUgaG9yaXpvbnRhbCBzdHJ1dC5cclxuICAgICAqL1xyXG4gICAgLy8gZGV0ZXJtaW5lIGJvdW5kcyBhdCBtaW4gYW5kIG1heCB2YWx1ZXNcclxuICAgIHVwZGF0ZVVJKCBvcHRpb25zLm1pblZhbHVlICk7XHJcbiAgICBjb25zdCBtaW5YID0gdGhpcy5sZWZ0O1xyXG4gICAgdXBkYXRlVUkoIG9wdGlvbnMubWF4VmFsdWUgKTtcclxuICAgIGNvbnN0IG1heFggPSB0aGlzLnJpZ2h0O1xyXG5cclxuICAgIC8vIHJlc3RvcmUgdGhlIGluaXRpYWwgdmFsdWVcclxuICAgIHVwZGF0ZVVJKCB2YWx1ZVByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgLy8gYWRkIGEgaG9yaXpvbnRhbCBzdHJ1dFxyXG4gICAgY29uc3Qgc3RydXQgPSBuZXcgUmVjdGFuZ2xlKCBtaW5YLCAwLCBtYXhYIC0gbWluWCwgMSwgeyBwaWNrYWJsZTogZmFsc2UgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggc3RydXQgKTtcclxuICAgIHN0cnV0Lm1vdmVUb0JhY2soKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VTcGVjdHJ1bVNsaWRlciA9ICgpID0+IHtcclxuICAgICAgdmFsdWVEaXNwbGF5ICYmIHZhbHVlRGlzcGxheS5kaXNwb3NlKCk7XHJcbiAgICAgIHBsdXNCdXR0b24gJiYgcGx1c0J1dHRvbi5kaXNwb3NlKCk7XHJcbiAgICAgIG1pbnVzQnV0dG9uICYmIG1pbnVzQnV0dG9uLmRpc3Bvc2UoKTtcclxuICAgICAgdmFsdWVQcm9wZXJ0eS51bmxpbmsoIHZhbHVlTGlzdGVuZXIgKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gV2UgYWxyZWFkeSBzZXQgb3RoZXIgb3B0aW9ucyB2aWEgc3VwZXIoKS4gTm93IHRoYXQgd2UgaGF2ZSB2YWxpZCBCb3VuZHMsIGFwcGx5IHRoZXNlIG9wdGlvbnMuXHJcbiAgICB0aGlzLm11dGF0ZSggYm91bmRzUmVxdWlyZWRPcHRpb25LZXlzICk7XHJcblxyXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXHJcbiAgICBhc3NlcnQgJiYgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzY2VuZXJ5LXBoZXQnLCAnU3BlY3RydW1TbGlkZXInLCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZVNwZWN0cnVtU2xpZGVyKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogVGhlIHNsaWRlciB0aHVtYiwgb3JpZ2luIGF0IHRvcCBjZW50ZXIuXHJcbiAqL1xyXG5jbGFzcyBUaHVtYiBleHRlbmRzIFBhdGgge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBwcm92aWRlZE9wdGlvbnM/OiBQYXRoT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gY29tYmluZU9wdGlvbnM8UGF0aE9wdGlvbnM+KCB7XHJcbiAgICAgIGZpbGw6ICdibGFjaycsXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbGluZVdpZHRoOiAxXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIHJhZGl1cyBvZiB0aGUgYXJjcyBiYXNlZCBvbiB0aGUgaGVpZ2h0IG9yIHdpZHRoLCB3aGljaGV2ZXIgaXMgc21hbGxlci5cclxuICAgIGNvbnN0IHJhZGl1c1NjYWxlID0gMC4xNTtcclxuICAgIGNvbnN0IHJhZGl1cyA9ICggd2lkdGggPCBoZWlnaHQgKSA/IHJhZGl1c1NjYWxlICogd2lkdGggOiByYWRpdXNTY2FsZSAqIGhlaWdodDtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgc29tZSBwYXJhbWV0ZXJzIG9mIHRoZSB1cHBlciB0cmlhbmdsZXMgb2YgdGhlIHRodW1iIGZvciBnZXR0aW5nIGFyYyBvZmZzZXRzLlxyXG4gICAgY29uc3QgaHlwb3RlbnVzZSA9IE1hdGguc3FydCggTWF0aC5wb3coIDAuNSAqIHdpZHRoLCAyICkgKyBNYXRoLnBvdyggMC4zICogaGVpZ2h0LCAyICkgKTtcclxuICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hY29zKCB3aWR0aCAqIDAuNSAvIGh5cG90ZW51c2UgKTtcclxuICAgIGNvbnN0IGhlaWdodE9mZnNldCA9IHJhZGl1cyAqIE1hdGguc2luKCBhbmdsZSApO1xyXG5cclxuICAgIC8vIERyYXcgdGhlIHRodW1iIHNoYXBlIHN0YXJ0aW5nIGF0IHRoZSByaWdodCB1cHBlciBjb3JuZXIgb2YgdGhlIHBlbnRhZ29uIGJlbG93IHRoZSBhcmMsXHJcbiAgICAvLyB0aGlzIHdheSB3ZSBjYW4gZ2V0IHRoZSBhcmMgY29vcmRpbmF0ZXMgZm9yIHRoZSBhcmMgaW4gdGhpcyBjb3JuZXIgZnJvbSB0aGUgb3RoZXIgc2lkZSxcclxuICAgIC8vIHdoaWNoIHdpbGwgYmUgZWFzaWVyIHRvIGNhbGN1bGF0ZSBhcmNpbmcgZnJvbSBib3R0b20gdG8gdG9wLlxyXG4gICAgY29uc3Qgc2hhcGUgPSBuZXcgU2hhcGUoKVxyXG4gICAgICAubW92ZVRvKCAwLjUgKiB3aWR0aCwgMC4zICogaGVpZ2h0ICsgaGVpZ2h0T2Zmc2V0IClcclxuICAgICAgLmxpbmVUbyggMC41ICogd2lkdGgsIGhlaWdodCAtIHJhZGl1cyApXHJcbiAgICAgIC5hcmMoIDAuNSAqIHdpZHRoIC0gcmFkaXVzLCBoZWlnaHQgLSByYWRpdXMsIHJhZGl1cywgMCwgTWF0aC5QSSAvIDIgKVxyXG4gICAgICAubGluZVRvKCAtMC41ICogd2lkdGggKyByYWRpdXMsIGhlaWdodCApXHJcbiAgICAgIC5hcmMoIC0wLjUgKiB3aWR0aCArIHJhZGl1cywgaGVpZ2h0IC0gcmFkaXVzLCByYWRpdXMsIE1hdGguUEkgLyAyLCBNYXRoLlBJIClcclxuICAgICAgLmxpbmVUbyggLTAuNSAqIHdpZHRoLCAwLjMgKiBoZWlnaHQgKyBoZWlnaHRPZmZzZXQgKVxyXG4gICAgICAuYXJjKCAtMC41ICogd2lkdGggKyByYWRpdXMsIDAuMyAqIGhlaWdodCArIGhlaWdodE9mZnNldCwgcmFkaXVzLCBNYXRoLlBJLCBNYXRoLlBJICsgYW5nbGUgKTtcclxuXHJcbiAgICAvLyBTYXZlIHRoZSBjb29yZGluYXRlcyBmb3IgdGhlIHBvaW50IGFib3ZlIHRoZSBsZWZ0IHNpZGUgYXJjLCBmb3IgdXNlIG9uIHRoZSBvdGhlciBzaWRlLlxyXG4gICAgY29uc3Qgc2lkZUFyY1BvaW50ID0gc2hhcGUuZ2V0TGFzdFBvaW50KCkhO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2lkZUFyY1BvaW50ICk7XHJcblxyXG4gICAgc2hhcGUubGluZVRvKCAwLCAwIClcclxuICAgICAgLmxpbmVUbyggLXNpZGVBcmNQb2ludC54LCBzaWRlQXJjUG9pbnQueSApXHJcbiAgICAgIC5hcmMoIDAuNSAqIHdpZHRoIC0gcmFkaXVzLCAwLjMgKiBoZWlnaHQgKyBoZWlnaHRPZmZzZXQsIHJhZGl1cywgLWFuZ2xlLCAwIClcclxuICAgICAgLmNsb3NlKCk7XHJcblxyXG4gICAgc3VwZXIoIHNoYXBlLCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRGlzcGxheXMgdGhlIHZhbHVlIGFuZCB1bml0cy5cclxuICovXHJcbmNsYXNzIFZhbHVlRGlzcGxheSBleHRlbmRzIFRleHQge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VWYWx1ZURpc3BsYXk6ICgpID0+IHZvaWQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB2YWx1ZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHZhbHVlVG9TdHJpbmcgLSBjb252ZXJ0cyB2YWx1ZSB7bnVtYmVyfSB0byB0ZXh0IHtzdHJpbmd9IGZvciBkaXNwbGF5XHJcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdmFsdWVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlVG9TdHJpbmc6ICggdmFsdWU6IG51bWJlciApID0+IHN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IFRleHRPcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCAnPycsIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHZhbHVlT2JzZXJ2ZXIgPSAoIHZhbHVlOiBudW1iZXIgKSA9PiB7XHJcbiAgICAgIHRoaXMuc3RyaW5nID0gdmFsdWVUb1N0cmluZyggdmFsdWUgKTtcclxuICAgIH07XHJcbiAgICB2YWx1ZVByb3BlcnR5LmxpbmsoIHZhbHVlT2JzZXJ2ZXIgKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VWYWx1ZURpc3BsYXkgPSAoKSA9PiB2YWx1ZVByb3BlcnR5LnVubGluayggdmFsdWVPYnNlcnZlciApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VWYWx1ZURpc3BsYXkoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZWN0YW5ndWxhciAnY3Vyc29yJyB0aGF0IGFwcGVhcnMgaW4gdGhlIHRyYWNrIGRpcmVjdGx5IGFib3ZlIHRoZSB0aHVtYi4gT3JpZ2luIGlzIGF0IHRvcCBjZW50ZXIuXHJcbiAqL1xyXG5jbGFzcyBDdXJzb3IgZXh0ZW5kcyBSZWN0YW5nbGUge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHByb3ZpZGVkT3B0aW9uczogUmVjdGFuZ2xlT3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCAtd2lkdGggLyAyLCAwLCB3aWR0aCwgaGVpZ2h0LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnU3BlY3RydW1TbGlkZXInLCBTcGVjdHJ1bVNsaWRlciApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBS0EsT0FBT0EsUUFBUSxNQUFNLDJCQUEyQjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0sNEJBQTRCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSx1QkFBdUI7QUFDekMsT0FBT0MsS0FBSyxNQUFNLHVCQUF1QjtBQUN6QyxTQUFTQyxLQUFLLFFBQVEsMEJBQTBCO0FBQ2hELE9BQU9DLGtCQUFrQixNQUFNLDBDQUEwQztBQUN6RSxPQUFPQyxnQkFBZ0IsTUFBTSxzREFBc0Q7QUFDbkYsT0FBT0MsU0FBUyxJ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