// Copyright 2013-2023, University of Colorado Boulder
// Copyright 2016, OCAD University

/**
 * Scenery display object (scene graph node) for an appendage in this sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Vasily Shakhov (Mlearner)
 * @author Justin Obara
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { DragListener, FocusHighlightPath, Image, Node, Rectangle } from '../../../../scenery/js/imports.js';
import AccessibleSlider from '../../../../sun/js/accessibility/AccessibleSlider.js';
import johnTravoltage from '../../johnTravoltage.js';
class AppendageNode extends AccessibleSlider(Node, 0) {
  /**
   * @param {Appendage} appendage the body part to display
   * @param {Image} image
   * @param {number} dx
   * @param {number} dy
   * @param {number} angleOffset the angle about which to rotate
   * @param {Array} rangeMap - an array of objects of the format {range: {max: Number, min: Number}, text: String}. This
   *                           is used to map a position value to text to use for the valueText of the related slider.
   * @param {LinearFunction} angleToPDOMValueFunction - maps the angle for the appendage to the value that is
   *                                                    represented by that angle in the PDOM, converting radians
   *                                                    into a more user friendly value range.
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @mixes AccessibleSlider
   */
  constructor(appendage, image, dx, dy, angleOffset, rangeMap, angleToPDOMValueFunction, tandem, options) {
    const appendageNodeHelper = new AppendageNodeHelper(rangeMap, angleToPDOMValueFunction);
    options = merge({
      cursor: 'pointer',
      // {function} - Extra callback with functionality for the end of drag for the AppendageNode
      onDragEnd: () => {},
      // {function(number):number} - Called during drag, constrains the angle of rotation during mouse dragging
      limitRotation: angle => angle,
      // pdom
      labelTagName: 'label',
      appendLabel: true,
      containerTagName: 'div',
      labelContent: null,
      // the range of motion is mapped around these values
      pdomRange: new Range(-15, 15),
      // voicing
      voicingNameResponse: null
    }, options);
    options = merge({
      keyboardStep: 1,
      shiftKeyboardStep: 1,
      pageKeyboardStep: 2,
      constrainValue: newValue => {
        lastAngle = currentAngle;
        currentAngle = appendageNodeHelper.a11yPositionToAngle(newValue);
        return newValue;
      },
      startDrag: () => {
        appendage.borderVisibleProperty.set(false);
        appendage.isDraggingProperty.set(true);
      },
      endDrag: () => {
        appendage.isDraggingProperty.set(false);

        // optional callback on end of drag
        options.onDragEnd();
      },
      a11yCreateAriaValueText: (formattedValue, sliderValue, oldSliderValue) => appendageNodeHelper.createAriaValueText(sliderValue, oldSliderValue),
      roundToStepSize: true
    }, options);

    // @protected - set up a bidirectional Property to handle updates to angle and slider position
    const sliderProperty = new DynamicProperty(new Property(appendage.angleProperty), {
      bidirectional: true,
      map: angle => appendageNodeHelper.a11yAngleToPosition(angle),
      inverseMap: position => appendageNodeHelper.a11yPositionToAngle(position)
    });
    const pdomValueMin = Utils.toFixedNumber(angleToPDOMValueFunction.evaluate(appendage.angleProperty.range.min), 0);
    const pdomValueMax = Utils.toFixedNumber(angleToPDOMValueFunction.evaluate(appendage.angleProperty.range.max), 0);
    const sliderMin = Math.min(pdomValueMin, pdomValueMax);
    const sliderMax = Math.max(pdomValueMin, pdomValueMax);
    options.valueProperty = sliderProperty;
    options.enabledRangeProperty = new Property(new Range(sliderMin, sliderMax));
    const boundsRequiredOptionKeys = _.pick(options, Node.REQUIRES_BOUNDS_OPTION_KEYS);
    options = _.omit(options, Node.REQUIRES_BOUNDS_OPTION_KEYS);
    super(options);

    // @private
    this.model = appendage;
    this.rangeMap = rangeMap;

    // @private {LinearFunction}
    this.angleToPDOMValueFunction = angleToPDOMValueFunction;

    // @public (a11y) - {Object} arm region when a discharge starts
    this.regionAtDischarge = null;
    this.appendageNodeHelper = appendageNodeHelper;

    // when the model is reset, reset the flags that track previous interactions with the appendage and reset
    // descriptions, no need to dispose this listener since appendages exist for life of sim
    this.model.appendageResetEmitter.addListener(() => {
      // now reset aria-valuetext (not including change in direction)
      this.resetAriaValueText();
    });

    // @private add the image
    this.imageNode = new Image(image, {
      tandem: tandem.createTandem('imageNode')
    });
    this.addChild(this.imageNode);
    let lastAngle = appendage.angleProperty.get();
    let currentAngle = appendage.angleProperty.get();

    // no need for dispose - exists for life of sim
    let angle = 0;
    this.imageNode.addInputListener(new DragListener({
      tandem: tandem.createTandem('dragListener'),
      allowTouchSnag: true,
      start: event => {
        appendage.isDraggingProperty.set(true);
        appendage.borderVisibleProperty.set(false);

        // voicing - on down speak the name and interaction hint
        this.voicingSpeakFullResponse();
      },
      drag: event => {
        // in full screen mode, the borders will sometimes not be made invisible in IE11 from
        // the start handler, so make sure it goes away here
        if (appendage.borderVisibleProperty.get()) {
          appendage.borderVisibleProperty.set(false);
        }
        lastAngle = currentAngle;
        const globalPoint = this.imageNode.globalToParentPoint(event.pointer.point);
        angle = globalPoint.minus(new Vector2(appendage.position.x, appendage.position.y)).angle;

        // optionally limit rotation of the appendage
        angle = options.limitRotation(angle);

        // if clamped at one of the upper angles, only allow the right direction of movement to change the angle, so it won't skip halfway around
        // Use 3d cross products to compute direction
        // Inline the vector creations and dot product for performance
        const z = Math.cos(currentAngle) * Math.sin(lastAngle) - Math.sin(currentAngle) * Math.cos(lastAngle);
        if (appendage.angleProperty.get() === Math.PI && z < 0) {
          // noop, at the left side
        } else if (appendage.angleProperty.get() === 0 && z > 0) {
          // noop, at the right side
        } else if (AppendageNode.distanceBetweenAngles(appendage.angleProperty.get(), angle) > Math.PI / 3 && (appendage.angleProperty.get() === 0 || appendage.angleProperty.get() === Math.PI)) {
          //noop, too big a leap, may correspond to the user reversing direction after a leg is stuck against threshold
        } else {
          angle = this.wrapAngle(angle);
          currentAngle = angle;
          appendage.angleProperty.set(angle);
        }
      },
      end: () => {
        // when we are done dragging with the mouse, place back in traversal order
        this.focusable = true;
        appendage.isDraggingProperty.set(false);

        // optional callback on end of drag
        options.onDragEnd();
      }
    }));

    // changes visual position
    appendage.angleProperty.link(angle => {
      this.imageNode.resetTransform();
      this.imageNode.translate(appendage.position.x - dx, appendage.position.y - dy);
      this.imageNode.rotateAround(appendage.position.plus(new Vector2(0, 0)), angle - angleOffset);
    });

    // @public
    this.border = new Rectangle(this.bounds.minX, this.bounds.minY, this.width, this.height, 10, 10, {
      stroke: 'green',
      lineWidth: 2,
      lineDash: [10, 10],
      pickable: false,
      tandem: tandem.createTandem('border')
    });
    this.addChild(this.border);

    // link node visibility to Property - no need to dispose
    appendage.borderVisibleProperty.linkAttribute(this.border, 'visible');

    // pdom
    this.focusHighlight = new FocusHighlightPath(Shape.circle(0, 0, this.imageNode.width / 2), {
      tandem: tandem.createTandem('focusCircle')
    });
    this.addInputListener({
      // prevent user from manipulating with both keybaord and mouse at the same time
      // no need to dispose, listener AppendageNodes should exist for life of sim
      blur: event => {
        // now reset aria-valuetext (not including change in direction)
        this.resetAriaValueText();
      }
    });

    // @protected - set up a bidirectional Property to handle updates to angle and slider position
    this.sliderProperty = sliderProperty;

    // update the center of the focus highlight when
    appendage.angleProperty.link(angle => {
      this.focusHighlight.center = this.imageNode.center;
    });
    this.sliderProperty.link((value, previousValue) => {
      // the Voicing object response is the same as the aria-valuetext, but we calculate it directly here rather than
      // using the ariaValuetext getter of AccessibleValueHandler to avoid a dependency on listener order on the
      // sliderProperty which is used to generate the aria-valuetext itself.
      this.voicingObjectResponse = this.appendageNodeHelper.createAriaValueText(value, previousValue);
    });
    this.mutate(boundsRequiredOptionKeys);
  }

  /**
   * Get the mapped a11y position from the current model Property tracking the angle.
   * @returns {number} - integer value
   * @public
   */
  a11yAngleToPosition(angle) {
    return this.appendageNodeHelper.a11yAngleToPosition(angle);
  }

  /**
   * Reset the aria-valuetext independently of the changing value - useful when setting the value text on blur
   * or reset. If the AccessibleSlider Property changes after calling this, beware that it will override what is
   * set here.
   *
   * @private
   */
  resetAriaValueText() {
    const sliderValue = this.a11yAngleToPosition(this.model.angleProperty.get());
    this.ariaValueText = this.appendageNodeHelper.createAriaValueText(sliderValue, sliderValue);
  }

  /**
   * Wrap the angle around the range for the angleProperty - useful because
   * the arm can go around in a full circle.
   * @public
   *
   * @param {number} angle
   * @returns {number}
   */
  wrapAngle(angle) {
    let wrappedAngle = angle;
    if (!this.model.angleProperty.range.contains(angle)) {
      const max = this.model.angleProperty.range.max;
      const min = this.model.angleProperty.range.min;
      if (wrappedAngle < min) {
        wrappedAngle = max - Math.abs(min - wrappedAngle);
      } else if (wrappedAngle > max) {
        wrappedAngle = min + Math.abs(max - wrappedAngle);
      }
    }
    return wrappedAngle;
  }

  /**
   * Compute the distance (in radians) between angles a and b.
   * @param {number} a - first angle (radians)
   * @param {number} b - second angle (radians)
   * @private
   * @static
   */
  static distanceBetweenAngles(a, b) {
    const diff = Math.abs(a - b) % (Math.PI * 2);
    return Math.min(Math.abs(diff - Math.PI * 2), diff);
  }

  /**
   * Determines the position description based on where the position falls in the supplied rangeMap.
   * @a11y
   * @private
   * @static
   *
   * @param {number} position - input value for the accessible input
   * @param {Object} [rangeMap] - a map that will determine the correct description from a provided input value
   * @returns {Object} region - {range, text}
   */
  static getRegion(position, rangeMap) {
    let region;
    _.forEach(rangeMap, map => {
      if (position >= map.range.min && position <= map.range.max) {
        region = map;
      }
    });
    return region;
  }

  /**
   * Get a description of the appendage that can be used in multiple places, something like
   * "close to doorknob" or
   * "very far from doorknob"
   *
   * @public
   * @static
   * @a11y
   *
   * @param  {number} position - integer position of the appendage, mapped from angle
   * @param  {Object} rangeMap - a map that will provide the correct description from the provided input value
   * @returns {string} - a lower case string, generally to be inserted into another context
   */
  static getPositionDescription(position, rangeMap) {
    const newRegion = AppendageNode.getRegion(Utils.roundSymmetric(position), rangeMap);
    return newRegion.text.toLowerCase();
  }

  /**
   * If the appendage is at a critical position, returns a 'landmark' description that will always be read to the user.
   * Otherwise, return an empty string.
   * @static
   * @private
   * @a11y
   *
   * @param  {number} position
   * @param  {Object} landmarkMap {value, text}
   * @returns {string}
   */
  static getLandmarkDescription(position, landmarkMap) {
    let message = '';
    _.forEach(landmarkMap, landmark => {
      if (position === landmark.value) {
        message = landmark.text;
      }
    });
    return message;
  }
}
class AppendageNodeHelper {
  constructor(rangeMap, angleToPDOMValueFunction) {
    this.rangeMap = rangeMap;
    this.angleToPDOMValueFunction = angleToPDOMValueFunction;
  }

  /**
   * Retrieve the accurate text for a11y display based on the slider property values.
   *
   * @private
   * @param  {Number} position         the new slider input value
   * @param  {Number} previousPosition the old slider input value
   * @returns {String}                  the generated text for the slider
   */
  getTextFromPosition(position, previousPosition) {
    let valueDescription;

    // generate descriptions that could be used depending on movement
    const newRegion = AppendageNode.getRegion(position, this.rangeMap.regions);
    const landmarkDescription = AppendageNode.getLandmarkDescription(position, this.rangeMap.landmarks);
    if (landmarkDescription) {
      // if we are ever on a critical landmark, that description should take priority
      valueDescription = landmarkDescription;
    } else if (newRegion) {
      // fall back to default region description
      valueDescription = newRegion.text;
    }
    return valueDescription;
  }

  /**
   * Get a description of the value of the hand position, with an associated numerical value.
   * @param position
   * @param previousPosition
   * @returns {string}
   * @public
   */
  createAriaValueText(position, previousPosition) {
    return this.getTextFromPosition(position, previousPosition);
  }

  /**
   * Get the mapped a11y position from the current model Property tracking the angle.
   * @returns {number} - integer value
   * @public
   */
  a11yAngleToPosition(angle) {
    return Utils.roundSymmetric(this.angleToPDOMValueFunction.evaluate(angle));
  }

  /**
   * Get the angle from the a11y position of the slider, converting the integer to some floating angle
   * @returns {number}
   * @public
   */
  a11yPositionToAngle(position) {
    return this.angleToPDOMValueFunction.inverse(position);
  }
}
johnTravoltage.register('AppendageNode', AppendageNode);
export default AppendageNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEeW5hbWljUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlJhbmdlIiwiVXRpbHMiLCJWZWN0b3IyIiwiU2hhcGUiLCJtZXJnZSIsIkRyYWdMaXN0ZW5lciIsIkZvY3VzSGlnaGxpZ2h0UGF0aCIsIkltYWdlIiwiTm9kZSIsIlJlY3RhbmdsZSIsIkFjY2Vzc2libGVTbGlkZXIiLCJqb2huVHJhdm9sdGFnZSIsIkFwcGVuZGFnZU5vZGUiLCJjb25zdHJ1Y3RvciIsImFwcGVuZGFnZSIsImltYWdlIiwiZHgiLCJkeSIsImFuZ2xlT2Zmc2V0IiwicmFuZ2VNYXAiLCJhbmdsZVRvUERPTVZhbHVlRnVuY3Rpb24iLCJ0YW5kZW0iLCJvcHRpb25zIiwiYXBwZW5kYWdlTm9kZUhlbHBlciIsIkFwcGVuZGFnZU5vZGVIZWxwZXIiLCJjdXJzb3IiLCJvbkRyYWdFbmQiLCJsaW1pdFJvdGF0aW9uIiwiYW5nbGUiLCJsYWJlbFRhZ05hbWUiLCJhcHBlbmRMYWJlbCIsImNvbnRhaW5lclRhZ05hbWUiLCJsYWJlbENvbnRlbnQiLCJwZG9tUmFuZ2UiLCJ2b2ljaW5nTmFtZVJlc3BvbnNlIiwia2V5Ym9hcmRTdGVwIiwic2hpZnRLZXlib2FyZFN0ZXAiLCJwYWdlS2V5Ym9hcmRTdGVwIiwiY29uc3RyYWluVmFsdWUiLCJuZXdWYWx1ZSIsImxhc3RBbmdsZSIsImN1cnJlbnRBbmdsZSIsImExMXlQb3NpdGlvblRvQW5nbGUiLCJzdGFydERyYWciLCJib3JkZXJWaXNpYmxlUHJvcGVydHkiLCJzZXQiLCJpc0RyYWdnaW5nUHJvcGVydHkiLCJlbmREcmFnIiwiYTExeUNyZWF0ZUFyaWFWYWx1ZVRleHQiLCJmb3JtYXR0ZWRWYWx1ZSIsInNsaWRlclZhbHVlIiwib2xkU2xpZGVyVmFsdWUiLCJjcmVhdGVBcmlhVmFsdWVUZXh0Iiwicm91bmRUb1N0ZXBTaXplIiwic2xpZGVyUHJvcGVydHkiLCJhbmdsZVByb3BlcnR5IiwiYmlkaXJlY3Rpb25hbCIsIm1hcCIsImExMXlBbmdsZVRvUG9zaXRpb24iLCJpbnZlcnNlTWFwIiwicG9zaXRpb24iLCJwZG9tVmFsdWVNaW4iLCJ0b0ZpeGVkTnVtYmVyIiwiZXZhbHVhdGUiLCJyYW5nZSIsIm1pbiIsInBkb21WYWx1ZU1heCIsIm1heCIsInNsaWRlck1pbiIsIk1hdGgiLCJzbGlkZXJNYXgiLCJ2YWx1ZVByb3BlcnR5IiwiZW5hYmxlZFJhbmdlUHJvcGVydHkiLCJib3VuZHNSZXF1aXJlZE9wdGlvbktleXMiLCJfIiwicGljayIsIlJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZUyIsIm9taXQiLCJtb2RlbCIsInJlZ2lvbkF0RGlzY2hhcmdlIiwiYXBwZW5kYWdlUmVzZXRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJyZXNldEFyaWFWYWx1ZVRleHQiLCJpbWFnZU5vZGUiLCJjcmVhdGVUYW5kZW0iLCJhZGRDaGlsZCIsImdldCIsImFkZElucHV0TGlzdGVuZXIiLCJhbGxvd1RvdWNoU25hZyIsInN0YXJ0IiwiZXZlbnQiLCJ2b2ljaW5nU3BlYWtGdWxsUmVzcG9uc2UiLCJkcmFnIiwiZ2xvYmFsUG9pbnQiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwicG9pbnRlciIsInBvaW50IiwibWludXMiLCJ4IiwieSIsInoiLCJjb3MiLCJzaW4iLCJQSSIsImRpc3RhbmNlQmV0d2VlbkFuZ2xlcyIsIndyYXBBbmdsZSIsImVuZCIsImZvY3VzYWJsZSIsImxpbmsiLCJyZXNldFRyYW5zZm9ybSIsInRyYW5zbGF0ZSIsInJvdGF0ZUFyb3VuZCIsInBsdXMiLCJib3JkZXIiLCJib3VuZHMiLCJtaW5YIiwibWluWSIsIndpZHRoIiwiaGVpZ2h0Iiwic3Ryb2tlIiwibGluZVdpZHRoIiwibGluZURhc2giLCJwaWNrYWJsZSIsImxpbmtBdHRyaWJ1dGUiLCJmb2N1c0hpZ2hsaWdodCIsImNpcmNsZSIsImJsdXIiLCJjZW50ZXIiLCJ2YWx1ZSIsInByZXZpb3VzVmFsdWUiLCJ2b2ljaW5nT2JqZWN0UmVzcG9uc2UiLCJtdXRhdGUiLCJhcmlhVmFsdWVUZXh0Iiwid3JhcHBlZEFuZ2xlIiwiY29udGFpbnMiLCJhYnMiLCJhIiwiYiIsImRpZmYiLCJnZXRSZWdpb24iLCJyZWdpb24iLCJmb3JFYWNoIiwiZ2V0UG9zaXRpb25EZXNjcmlwdGlvbiIsIm5ld1JlZ2lvbiIsInJvdW5kU3ltbWV0cmljIiwidGV4dCIsInRvTG93ZXJDYXNlIiwiZ2V0TGFuZG1hcmtEZXNjcmlwdGlvbiIsImxhbmRtYXJrTWFwIiwibWVzc2FnZSIsImxhbmRtYXJrIiwiZ2V0VGV4dEZyb21Qb3NpdGlvbiIsInByZXZpb3VzUG9zaXRpb24iLCJ2YWx1ZURlc2NyaXB0aW9uIiwicmVnaW9ucyIsImxhbmRtYXJrRGVzY3JpcHRpb24iLCJsYW5kbWFya3MiLCJpbnZlcnNlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBcHBlbmRhZ2VOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vLyBDb3B5cmlnaHQgMjAxNiwgT0NBRCBVbml2ZXJzaXR5XHJcblxyXG4vKipcclxuICogU2NlbmVyeSBkaXNwbGF5IG9iamVjdCAoc2NlbmUgZ3JhcGggbm9kZSkgZm9yIGFuIGFwcGVuZGFnZSBpbiB0aGlzIHNpbS5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBWYXNpbHkgU2hha2hvdiAoTWxlYXJuZXIpXHJcbiAqIEBhdXRob3IgSnVzdGluIE9iYXJhXHJcbiAqL1xyXG5cclxuaW1wb3J0IER5bmFtaWNQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0R5bmFtaWNQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IERyYWdMaXN0ZW5lciwgRm9jdXNIaWdobGlnaHRQYXRoLCBJbWFnZSwgTm9kZSwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEFjY2Vzc2libGVTbGlkZXIgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2FjY2Vzc2liaWxpdHkvQWNjZXNzaWJsZVNsaWRlci5qcyc7XHJcbmltcG9ydCBqb2huVHJhdm9sdGFnZSBmcm9tICcuLi8uLi9qb2huVHJhdm9sdGFnZS5qcyc7XHJcblxyXG5cclxuY2xhc3MgQXBwZW5kYWdlTm9kZSBleHRlbmRzIEFjY2Vzc2libGVTbGlkZXIoIE5vZGUsIDAgKSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QXBwZW5kYWdlfSBhcHBlbmRhZ2UgdGhlIGJvZHkgcGFydCB0byBkaXNwbGF5XHJcbiAgICogQHBhcmFtIHtJbWFnZX0gaW1hZ2VcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGVPZmZzZXQgdGhlIGFuZ2xlIGFib3V0IHdoaWNoIHRvIHJvdGF0ZVxyXG4gICAqIEBwYXJhbSB7QXJyYXl9IHJhbmdlTWFwIC0gYW4gYXJyYXkgb2Ygb2JqZWN0cyBvZiB0aGUgZm9ybWF0IHtyYW5nZToge21heDogTnVtYmVyLCBtaW46IE51bWJlcn0sIHRleHQ6IFN0cmluZ30uIFRoaXNcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzIHVzZWQgdG8gbWFwIGEgcG9zaXRpb24gdmFsdWUgdG8gdGV4dCB0byB1c2UgZm9yIHRoZSB2YWx1ZVRleHQgb2YgdGhlIHJlbGF0ZWQgc2xpZGVyLlxyXG4gICAqIEBwYXJhbSB7TGluZWFyRnVuY3Rpb259IGFuZ2xlVG9QRE9NVmFsdWVGdW5jdGlvbiAtIG1hcHMgdGhlIGFuZ2xlIGZvciB0aGUgYXBwZW5kYWdlIHRvIHRoZSB2YWx1ZSB0aGF0IGlzXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwcmVzZW50ZWQgYnkgdGhhdCBhbmdsZSBpbiB0aGUgUERPTSwgY29udmVydGluZyByYWRpYW5zXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50byBhIG1vcmUgdXNlciBmcmllbmRseSB2YWx1ZSByYW5nZS5cclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqIEBtaXhlcyBBY2Nlc3NpYmxlU2xpZGVyXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGFwcGVuZGFnZSwgaW1hZ2UsIGR4LCBkeSwgYW5nbGVPZmZzZXQsIHJhbmdlTWFwLCBhbmdsZVRvUERPTVZhbHVlRnVuY3Rpb24sIHRhbmRlbSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBhcHBlbmRhZ2VOb2RlSGVscGVyID0gbmV3IEFwcGVuZGFnZU5vZGVIZWxwZXIoIHJhbmdlTWFwLCBhbmdsZVRvUERPTVZhbHVlRnVuY3Rpb24gKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcblxyXG4gICAgICAvLyB7ZnVuY3Rpb259IC0gRXh0cmEgY2FsbGJhY2sgd2l0aCBmdW5jdGlvbmFsaXR5IGZvciB0aGUgZW5kIG9mIGRyYWcgZm9yIHRoZSBBcHBlbmRhZ2VOb2RlXHJcbiAgICAgIG9uRHJhZ0VuZDogKCkgPT4ge30sXHJcblxyXG4gICAgICAvLyB7ZnVuY3Rpb24obnVtYmVyKTpudW1iZXJ9IC0gQ2FsbGVkIGR1cmluZyBkcmFnLCBjb25zdHJhaW5zIHRoZSBhbmdsZSBvZiByb3RhdGlvbiBkdXJpbmcgbW91c2UgZHJhZ2dpbmdcclxuICAgICAgbGltaXRSb3RhdGlvbjogYW5nbGUgPT4gYW5nbGUsXHJcblxyXG4gICAgICAvLyBwZG9tXHJcbiAgICAgIGxhYmVsVGFnTmFtZTogJ2xhYmVsJyxcclxuICAgICAgYXBwZW5kTGFiZWw6IHRydWUsXHJcbiAgICAgIGNvbnRhaW5lclRhZ05hbWU6ICdkaXYnLFxyXG4gICAgICBsYWJlbENvbnRlbnQ6IG51bGwsXHJcblxyXG4gICAgICAvLyB0aGUgcmFuZ2Ugb2YgbW90aW9uIGlzIG1hcHBlZCBhcm91bmQgdGhlc2UgdmFsdWVzXHJcbiAgICAgIHBkb21SYW5nZTogbmV3IFJhbmdlKCAtMTUsIDE1ICksXHJcblxyXG4gICAgICAvLyB2b2ljaW5nXHJcbiAgICAgIHZvaWNpbmdOYW1lUmVzcG9uc2U6IG51bGxcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAga2V5Ym9hcmRTdGVwOiAxLFxyXG4gICAgICBzaGlmdEtleWJvYXJkU3RlcDogMSxcclxuICAgICAgcGFnZUtleWJvYXJkU3RlcDogMixcclxuICAgICAgY29uc3RyYWluVmFsdWU6IG5ld1ZhbHVlID0+IHtcclxuICAgICAgICBsYXN0QW5nbGUgPSBjdXJyZW50QW5nbGU7XHJcblxyXG4gICAgICAgIGN1cnJlbnRBbmdsZSA9IGFwcGVuZGFnZU5vZGVIZWxwZXIuYTExeVBvc2l0aW9uVG9BbmdsZSggbmV3VmFsdWUgKTtcclxuICAgICAgICByZXR1cm4gbmV3VmFsdWU7XHJcbiAgICAgIH0sXHJcbiAgICAgIHN0YXJ0RHJhZzogKCkgPT4ge1xyXG5cclxuICAgICAgICBhcHBlbmRhZ2UuYm9yZGVyVmlzaWJsZVByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuXHJcbiAgICAgICAgYXBwZW5kYWdlLmlzRHJhZ2dpbmdQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgICAgfSxcclxuICAgICAgZW5kRHJhZzogKCkgPT4ge1xyXG5cclxuICAgICAgICBhcHBlbmRhZ2UuaXNEcmFnZ2luZ1Byb3BlcnR5LnNldCggZmFsc2UgKTtcclxuXHJcbiAgICAgICAgLy8gb3B0aW9uYWwgY2FsbGJhY2sgb24gZW5kIG9mIGRyYWdcclxuICAgICAgICBvcHRpb25zLm9uRHJhZ0VuZCgpO1xyXG4gICAgICB9LFxyXG4gICAgICBhMTF5Q3JlYXRlQXJpYVZhbHVlVGV4dDogKCBmb3JtYXR0ZWRWYWx1ZSwgc2xpZGVyVmFsdWUsIG9sZFNsaWRlclZhbHVlICkgPT4gYXBwZW5kYWdlTm9kZUhlbHBlci5jcmVhdGVBcmlhVmFsdWVUZXh0KCBzbGlkZXJWYWx1ZSwgb2xkU2xpZGVyVmFsdWUgKSxcclxuICAgICAgcm91bmRUb1N0ZXBTaXplOiB0cnVlXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZCAtIHNldCB1cCBhIGJpZGlyZWN0aW9uYWwgUHJvcGVydHkgdG8gaGFuZGxlIHVwZGF0ZXMgdG8gYW5nbGUgYW5kIHNsaWRlciBwb3NpdGlvblxyXG4gICAgY29uc3Qgc2xpZGVyUHJvcGVydHkgPSBuZXcgRHluYW1pY1Byb3BlcnR5KCBuZXcgUHJvcGVydHkoIGFwcGVuZGFnZS5hbmdsZVByb3BlcnR5ICksIHtcclxuICAgICAgYmlkaXJlY3Rpb25hbDogdHJ1ZSxcclxuXHJcbiAgICAgIG1hcDogYW5nbGUgPT4gYXBwZW5kYWdlTm9kZUhlbHBlci5hMTF5QW5nbGVUb1Bvc2l0aW9uKCBhbmdsZSApLFxyXG4gICAgICBpbnZlcnNlTWFwOiBwb3NpdGlvbiA9PiBhcHBlbmRhZ2VOb2RlSGVscGVyLmExMXlQb3NpdGlvblRvQW5nbGUoIHBvc2l0aW9uIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBwZG9tVmFsdWVNaW4gPSBVdGlscy50b0ZpeGVkTnVtYmVyKCBhbmdsZVRvUERPTVZhbHVlRnVuY3Rpb24uZXZhbHVhdGUoIGFwcGVuZGFnZS5hbmdsZVByb3BlcnR5LnJhbmdlLm1pbiApLCAwICk7XHJcbiAgICBjb25zdCBwZG9tVmFsdWVNYXggPSBVdGlscy50b0ZpeGVkTnVtYmVyKCBhbmdsZVRvUERPTVZhbHVlRnVuY3Rpb24uZXZhbHVhdGUoIGFwcGVuZGFnZS5hbmdsZVByb3BlcnR5LnJhbmdlLm1heCApLCAwICk7XHJcbiAgICBjb25zdCBzbGlkZXJNaW4gPSBNYXRoLm1pbiggcGRvbVZhbHVlTWluLCBwZG9tVmFsdWVNYXggKTtcclxuICAgIGNvbnN0IHNsaWRlck1heCA9IE1hdGgubWF4KCBwZG9tVmFsdWVNaW4sIHBkb21WYWx1ZU1heCApO1xyXG5cclxuICAgIG9wdGlvbnMudmFsdWVQcm9wZXJ0eSA9IHNsaWRlclByb3BlcnR5O1xyXG4gICAgb3B0aW9ucy5lbmFibGVkUmFuZ2VQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbmV3IFJhbmdlKCBzbGlkZXJNaW4sIHNsaWRlck1heCApICk7XHJcblxyXG4gICAgY29uc3QgYm91bmRzUmVxdWlyZWRPcHRpb25LZXlzID0gXy5waWNrKCBvcHRpb25zLCBOb2RlLlJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZUyApO1xyXG4gICAgb3B0aW9ucyA9IF8ub21pdCggb3B0aW9ucywgTm9kZS5SRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLm1vZGVsID0gYXBwZW5kYWdlO1xyXG4gICAgdGhpcy5yYW5nZU1hcCA9IHJhbmdlTWFwO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtMaW5lYXJGdW5jdGlvbn1cclxuICAgIHRoaXMuYW5nbGVUb1BET01WYWx1ZUZ1bmN0aW9uID0gYW5nbGVUb1BET01WYWx1ZUZ1bmN0aW9uO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKGExMXkpIC0ge09iamVjdH0gYXJtIHJlZ2lvbiB3aGVuIGEgZGlzY2hhcmdlIHN0YXJ0c1xyXG4gICAgdGhpcy5yZWdpb25BdERpc2NoYXJnZSA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5hcHBlbmRhZ2VOb2RlSGVscGVyID0gYXBwZW5kYWdlTm9kZUhlbHBlcjtcclxuXHJcbiAgICAvLyB3aGVuIHRoZSBtb2RlbCBpcyByZXNldCwgcmVzZXQgdGhlIGZsYWdzIHRoYXQgdHJhY2sgcHJldmlvdXMgaW50ZXJhY3Rpb25zIHdpdGggdGhlIGFwcGVuZGFnZSBhbmQgcmVzZXRcclxuICAgIC8vIGRlc2NyaXB0aW9ucywgbm8gbmVlZCB0byBkaXNwb3NlIHRoaXMgbGlzdGVuZXIgc2luY2UgYXBwZW5kYWdlcyBleGlzdCBmb3IgbGlmZSBvZiBzaW1cclxuICAgIHRoaXMubW9kZWwuYXBwZW5kYWdlUmVzZXRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcblxyXG4gICAgICAvLyBub3cgcmVzZXQgYXJpYS12YWx1ZXRleHQgKG5vdCBpbmNsdWRpbmcgY2hhbmdlIGluIGRpcmVjdGlvbilcclxuICAgICAgdGhpcy5yZXNldEFyaWFWYWx1ZVRleHQoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSBhZGQgdGhlIGltYWdlXHJcbiAgICB0aGlzLmltYWdlTm9kZSA9IG5ldyBJbWFnZSggaW1hZ2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW1hZ2VOb2RlJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5pbWFnZU5vZGUgKTtcclxuXHJcbiAgICBsZXQgbGFzdEFuZ2xlID0gYXBwZW5kYWdlLmFuZ2xlUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBsZXQgY3VycmVudEFuZ2xlID0gYXBwZW5kYWdlLmFuZ2xlUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgLy8gbm8gbmVlZCBmb3IgZGlzcG9zZSAtIGV4aXN0cyBmb3IgbGlmZSBvZiBzaW1cclxuICAgIGxldCBhbmdsZSA9IDA7XHJcbiAgICB0aGlzLmltYWdlTm9kZS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdMaXN0ZW5lcicgKSxcclxuICAgICAgYWxsb3dUb3VjaFNuYWc6IHRydWUsXHJcbiAgICAgIHN0YXJ0OiBldmVudCA9PiB7XHJcbiAgICAgICAgYXBwZW5kYWdlLmlzRHJhZ2dpbmdQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgICAgICBhcHBlbmRhZ2UuYm9yZGVyVmlzaWJsZVByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuXHJcbiAgICAgICAgLy8gdm9pY2luZyAtIG9uIGRvd24gc3BlYWsgdGhlIG5hbWUgYW5kIGludGVyYWN0aW9uIGhpbnRcclxuICAgICAgICB0aGlzLnZvaWNpbmdTcGVha0Z1bGxSZXNwb25zZSgpO1xyXG4gICAgICB9LFxyXG4gICAgICBkcmFnOiBldmVudCA9PiB7XHJcblxyXG4gICAgICAgIC8vIGluIGZ1bGwgc2NyZWVuIG1vZGUsIHRoZSBib3JkZXJzIHdpbGwgc29tZXRpbWVzIG5vdCBiZSBtYWRlIGludmlzaWJsZSBpbiBJRTExIGZyb21cclxuICAgICAgICAvLyB0aGUgc3RhcnQgaGFuZGxlciwgc28gbWFrZSBzdXJlIGl0IGdvZXMgYXdheSBoZXJlXHJcbiAgICAgICAgaWYgKCBhcHBlbmRhZ2UuYm9yZGVyVmlzaWJsZVByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgICAgYXBwZW5kYWdlLmJvcmRlclZpc2libGVQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsYXN0QW5nbGUgPSBjdXJyZW50QW5nbGU7XHJcbiAgICAgICAgY29uc3QgZ2xvYmFsUG9pbnQgPSB0aGlzLmltYWdlTm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICk7XHJcbiAgICAgICAgYW5nbGUgPSBnbG9iYWxQb2ludC5taW51cyggbmV3IFZlY3RvcjIoIGFwcGVuZGFnZS5wb3NpdGlvbi54LCBhcHBlbmRhZ2UucG9zaXRpb24ueSApICkuYW5nbGU7XHJcblxyXG4gICAgICAgIC8vIG9wdGlvbmFsbHkgbGltaXQgcm90YXRpb24gb2YgdGhlIGFwcGVuZGFnZVxyXG4gICAgICAgIGFuZ2xlID0gb3B0aW9ucy5saW1pdFJvdGF0aW9uKCBhbmdsZSApO1xyXG5cclxuICAgICAgICAvLyBpZiBjbGFtcGVkIGF0IG9uZSBvZiB0aGUgdXBwZXIgYW5nbGVzLCBvbmx5IGFsbG93IHRoZSByaWdodCBkaXJlY3Rpb24gb2YgbW92ZW1lbnQgdG8gY2hhbmdlIHRoZSBhbmdsZSwgc28gaXQgd29uJ3Qgc2tpcCBoYWxmd2F5IGFyb3VuZFxyXG4gICAgICAgIC8vIFVzZSAzZCBjcm9zcyBwcm9kdWN0cyB0byBjb21wdXRlIGRpcmVjdGlvblxyXG4gICAgICAgIC8vIElubGluZSB0aGUgdmVjdG9yIGNyZWF0aW9ucyBhbmQgZG90IHByb2R1Y3QgZm9yIHBlcmZvcm1hbmNlXHJcbiAgICAgICAgY29uc3QgeiA9IE1hdGguY29zKCBjdXJyZW50QW5nbGUgKSAqIE1hdGguc2luKCBsYXN0QW5nbGUgKSAtIE1hdGguc2luKCBjdXJyZW50QW5nbGUgKSAqIE1hdGguY29zKCBsYXN0QW5nbGUgKTtcclxuXHJcbiAgICAgICAgaWYgKCBhcHBlbmRhZ2UuYW5nbGVQcm9wZXJ0eS5nZXQoKSA9PT0gTWF0aC5QSSAmJiB6IDwgMCApIHtcclxuICAgICAgICAgIC8vIG5vb3AsIGF0IHRoZSBsZWZ0IHNpZGVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGFwcGVuZGFnZS5hbmdsZVByb3BlcnR5LmdldCgpID09PSAwICYmIHogPiAwICkge1xyXG4gICAgICAgICAgLy8gbm9vcCwgYXQgdGhlIHJpZ2h0IHNpZGVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIEFwcGVuZGFnZU5vZGUuZGlzdGFuY2VCZXR3ZWVuQW5nbGVzKCBhcHBlbmRhZ2UuYW5nbGVQcm9wZXJ0eS5nZXQoKSwgYW5nbGUgKSA+IE1hdGguUEkgLyAzICYmICggYXBwZW5kYWdlLmFuZ2xlUHJvcGVydHkuZ2V0KCkgPT09IDAgfHwgYXBwZW5kYWdlLmFuZ2xlUHJvcGVydHkuZ2V0KCkgPT09IE1hdGguUEkgKSApIHtcclxuICAgICAgICAgIC8vbm9vcCwgdG9vIGJpZyBhIGxlYXAsIG1heSBjb3JyZXNwb25kIHRvIHRoZSB1c2VyIHJldmVyc2luZyBkaXJlY3Rpb24gYWZ0ZXIgYSBsZWcgaXMgc3R1Y2sgYWdhaW5zdCB0aHJlc2hvbGRcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBhbmdsZSA9IHRoaXMud3JhcEFuZ2xlKCBhbmdsZSApO1xyXG4gICAgICAgICAgY3VycmVudEFuZ2xlID0gYW5nbGU7XHJcbiAgICAgICAgICBhcHBlbmRhZ2UuYW5nbGVQcm9wZXJ0eS5zZXQoIGFuZ2xlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBlbmQ6ICgpID0+IHtcclxuXHJcbiAgICAgICAgLy8gd2hlbiB3ZSBhcmUgZG9uZSBkcmFnZ2luZyB3aXRoIHRoZSBtb3VzZSwgcGxhY2UgYmFjayBpbiB0cmF2ZXJzYWwgb3JkZXJcclxuICAgICAgICB0aGlzLmZvY3VzYWJsZSA9IHRydWU7XHJcblxyXG4gICAgICAgIGFwcGVuZGFnZS5pc0RyYWdnaW5nUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG5cclxuICAgICAgICAvLyBvcHRpb25hbCBjYWxsYmFjayBvbiBlbmQgb2YgZHJhZ1xyXG4gICAgICAgIG9wdGlvbnMub25EcmFnRW5kKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIGNoYW5nZXMgdmlzdWFsIHBvc2l0aW9uXHJcbiAgICBhcHBlbmRhZ2UuYW5nbGVQcm9wZXJ0eS5saW5rKCBhbmdsZSA9PiB7XHJcbiAgICAgIHRoaXMuaW1hZ2VOb2RlLnJlc2V0VHJhbnNmb3JtKCk7XHJcbiAgICAgIHRoaXMuaW1hZ2VOb2RlLnRyYW5zbGF0ZSggYXBwZW5kYWdlLnBvc2l0aW9uLnggLSBkeCwgYXBwZW5kYWdlLnBvc2l0aW9uLnkgLSBkeSApO1xyXG4gICAgICB0aGlzLmltYWdlTm9kZS5yb3RhdGVBcm91bmQoIGFwcGVuZGFnZS5wb3NpdGlvbi5wbHVzKCBuZXcgVmVjdG9yMiggMCwgMCApICksIGFuZ2xlIC0gYW5nbGVPZmZzZXQgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLmJvcmRlciA9IG5ldyBSZWN0YW5nbGUoIHRoaXMuYm91bmRzLm1pblgsIHRoaXMuYm91bmRzLm1pblksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAxMCwgMTAsIHtcclxuICAgICAgc3Ryb2tlOiAnZ3JlZW4nLFxyXG4gICAgICBsaW5lV2lkdGg6IDIsXHJcbiAgICAgIGxpbmVEYXNoOiBbIDEwLCAxMCBdLFxyXG4gICAgICBwaWNrYWJsZTogZmFsc2UsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2JvcmRlcicgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5ib3JkZXIgKTtcclxuXHJcbiAgICAvLyBsaW5rIG5vZGUgdmlzaWJpbGl0eSB0byBQcm9wZXJ0eSAtIG5vIG5lZWQgdG8gZGlzcG9zZVxyXG4gICAgYXBwZW5kYWdlLmJvcmRlclZpc2libGVQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCB0aGlzLmJvcmRlciwgJ3Zpc2libGUnICk7XHJcblxyXG4gICAgLy8gcGRvbVxyXG4gICAgdGhpcy5mb2N1c0hpZ2hsaWdodCA9IG5ldyBGb2N1c0hpZ2hsaWdodFBhdGgoIFNoYXBlLmNpcmNsZSggMCwgMCwgdGhpcy5pbWFnZU5vZGUud2lkdGggLyAyICksIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZm9jdXNDaXJjbGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIHtcclxuXHJcbiAgICAgIC8vIHByZXZlbnQgdXNlciBmcm9tIG1hbmlwdWxhdGluZyB3aXRoIGJvdGgga2V5YmFvcmQgYW5kIG1vdXNlIGF0IHRoZSBzYW1lIHRpbWVcclxuICAgICAgLy8gbm8gbmVlZCB0byBkaXNwb3NlLCBsaXN0ZW5lciBBcHBlbmRhZ2VOb2RlcyBzaG91bGQgZXhpc3QgZm9yIGxpZmUgb2Ygc2ltXHJcbiAgICAgIGJsdXI6IGV2ZW50ID0+IHtcclxuXHJcbiAgICAgICAgLy8gbm93IHJlc2V0IGFyaWEtdmFsdWV0ZXh0IChub3QgaW5jbHVkaW5nIGNoYW5nZSBpbiBkaXJlY3Rpb24pXHJcbiAgICAgICAgdGhpcy5yZXNldEFyaWFWYWx1ZVRleHQoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQgLSBzZXQgdXAgYSBiaWRpcmVjdGlvbmFsIFByb3BlcnR5IHRvIGhhbmRsZSB1cGRhdGVzIHRvIGFuZ2xlIGFuZCBzbGlkZXIgcG9zaXRpb25cclxuICAgIHRoaXMuc2xpZGVyUHJvcGVydHkgPSBzbGlkZXJQcm9wZXJ0eTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIGNlbnRlciBvZiB0aGUgZm9jdXMgaGlnaGxpZ2h0IHdoZW5cclxuICAgIGFwcGVuZGFnZS5hbmdsZVByb3BlcnR5LmxpbmsoIGFuZ2xlID0+IHtcclxuICAgICAgdGhpcy5mb2N1c0hpZ2hsaWdodC5jZW50ZXIgPSB0aGlzLmltYWdlTm9kZS5jZW50ZXI7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zbGlkZXJQcm9wZXJ0eS5saW5rKCAoIHZhbHVlLCBwcmV2aW91c1ZhbHVlICkgPT4ge1xyXG5cclxuICAgICAgLy8gdGhlIFZvaWNpbmcgb2JqZWN0IHJlc3BvbnNlIGlzIHRoZSBzYW1lIGFzIHRoZSBhcmlhLXZhbHVldGV4dCwgYnV0IHdlIGNhbGN1bGF0ZSBpdCBkaXJlY3RseSBoZXJlIHJhdGhlciB0aGFuXHJcbiAgICAgIC8vIHVzaW5nIHRoZSBhcmlhVmFsdWV0ZXh0IGdldHRlciBvZiBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyIHRvIGF2b2lkIGEgZGVwZW5kZW5jeSBvbiBsaXN0ZW5lciBvcmRlciBvbiB0aGVcclxuICAgICAgLy8gc2xpZGVyUHJvcGVydHkgd2hpY2ggaXMgdXNlZCB0byBnZW5lcmF0ZSB0aGUgYXJpYS12YWx1ZXRleHQgaXRzZWxmLlxyXG4gICAgICB0aGlzLnZvaWNpbmdPYmplY3RSZXNwb25zZSA9IHRoaXMuYXBwZW5kYWdlTm9kZUhlbHBlci5jcmVhdGVBcmlhVmFsdWVUZXh0KCB2YWx1ZSwgcHJldmlvdXNWYWx1ZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBib3VuZHNSZXF1aXJlZE9wdGlvbktleXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgbWFwcGVkIGExMXkgcG9zaXRpb24gZnJvbSB0aGUgY3VycmVudCBtb2RlbCBQcm9wZXJ0eSB0cmFja2luZyB0aGUgYW5nbGUuXHJcbiAgICogQHJldHVybnMge251bWJlcn0gLSBpbnRlZ2VyIHZhbHVlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGExMXlBbmdsZVRvUG9zaXRpb24oIGFuZ2xlICkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXBwZW5kYWdlTm9kZUhlbHBlci5hMTF5QW5nbGVUb1Bvc2l0aW9uKCBhbmdsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgdGhlIGFyaWEtdmFsdWV0ZXh0IGluZGVwZW5kZW50bHkgb2YgdGhlIGNoYW5naW5nIHZhbHVlIC0gdXNlZnVsIHdoZW4gc2V0dGluZyB0aGUgdmFsdWUgdGV4dCBvbiBibHVyXHJcbiAgICogb3IgcmVzZXQuIElmIHRoZSBBY2Nlc3NpYmxlU2xpZGVyIFByb3BlcnR5IGNoYW5nZXMgYWZ0ZXIgY2FsbGluZyB0aGlzLCBiZXdhcmUgdGhhdCBpdCB3aWxsIG92ZXJyaWRlIHdoYXQgaXNcclxuICAgKiBzZXQgaGVyZS5cclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcmVzZXRBcmlhVmFsdWVUZXh0KCkge1xyXG4gICAgY29uc3Qgc2xpZGVyVmFsdWUgPSB0aGlzLmExMXlBbmdsZVRvUG9zaXRpb24oIHRoaXMubW9kZWwuYW5nbGVQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgdGhpcy5hcmlhVmFsdWVUZXh0ID0gdGhpcy5hcHBlbmRhZ2VOb2RlSGVscGVyLmNyZWF0ZUFyaWFWYWx1ZVRleHQoIHNsaWRlclZhbHVlLCBzbGlkZXJWYWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV3JhcCB0aGUgYW5nbGUgYXJvdW5kIHRoZSByYW5nZSBmb3IgdGhlIGFuZ2xlUHJvcGVydHkgLSB1c2VmdWwgYmVjYXVzZVxyXG4gICAqIHRoZSBhcm0gY2FuIGdvIGFyb3VuZCBpbiBhIGZ1bGwgY2lyY2xlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgd3JhcEFuZ2xlKCBhbmdsZSApIHtcclxuICAgIGxldCB3cmFwcGVkQW5nbGUgPSBhbmdsZTtcclxuXHJcbiAgICBpZiAoICF0aGlzLm1vZGVsLmFuZ2xlUHJvcGVydHkucmFuZ2UuY29udGFpbnMoIGFuZ2xlICkgKSB7XHJcbiAgICAgIGNvbnN0IG1heCA9IHRoaXMubW9kZWwuYW5nbGVQcm9wZXJ0eS5yYW5nZS5tYXg7XHJcbiAgICAgIGNvbnN0IG1pbiA9IHRoaXMubW9kZWwuYW5nbGVQcm9wZXJ0eS5yYW5nZS5taW47XHJcblxyXG4gICAgICBpZiAoIHdyYXBwZWRBbmdsZSA8IG1pbiApIHtcclxuICAgICAgICB3cmFwcGVkQW5nbGUgPSBtYXggLSBNYXRoLmFicyggbWluIC0gd3JhcHBlZEFuZ2xlICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHdyYXBwZWRBbmdsZSA+IG1heCApIHtcclxuICAgICAgICB3cmFwcGVkQW5nbGUgPSBtaW4gKyBNYXRoLmFicyggbWF4IC0gd3JhcHBlZEFuZ2xlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gd3JhcHBlZEFuZ2xlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZSB0aGUgZGlzdGFuY2UgKGluIHJhZGlhbnMpIGJldHdlZW4gYW5nbGVzIGEgYW5kIGIuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGEgLSBmaXJzdCBhbmdsZSAocmFkaWFucylcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYiAtIHNlY29uZCBhbmdsZSAocmFkaWFucylcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBzdGF0aWNcclxuICAgKi9cclxuICBzdGF0aWMgZGlzdGFuY2VCZXR3ZWVuQW5nbGVzKCBhLCBiICkge1xyXG4gICAgY29uc3QgZGlmZiA9IE1hdGguYWJzKCBhIC0gYiApICUgKCBNYXRoLlBJICogMiApO1xyXG4gICAgcmV0dXJuIE1hdGgubWluKCBNYXRoLmFicyggZGlmZiAtIE1hdGguUEkgKiAyICksIGRpZmYgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgdGhlIHBvc2l0aW9uIGRlc2NyaXB0aW9uIGJhc2VkIG9uIHdoZXJlIHRoZSBwb3NpdGlvbiBmYWxscyBpbiB0aGUgc3VwcGxpZWQgcmFuZ2VNYXAuXHJcbiAgICogQGExMXlcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBzdGF0aWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwb3NpdGlvbiAtIGlucHV0IHZhbHVlIGZvciB0aGUgYWNjZXNzaWJsZSBpbnB1dFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcmFuZ2VNYXBdIC0gYSBtYXAgdGhhdCB3aWxsIGRldGVybWluZSB0aGUgY29ycmVjdCBkZXNjcmlwdGlvbiBmcm9tIGEgcHJvdmlkZWQgaW5wdXQgdmFsdWVcclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSByZWdpb24gLSB7cmFuZ2UsIHRleHR9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldFJlZ2lvbiggcG9zaXRpb24sIHJhbmdlTWFwICkge1xyXG4gICAgbGV0IHJlZ2lvbjtcclxuXHJcbiAgICBfLmZvckVhY2goIHJhbmdlTWFwLCBtYXAgPT4ge1xyXG4gICAgICBpZiAoIHBvc2l0aW9uID49IG1hcC5yYW5nZS5taW4gJiYgcG9zaXRpb24gPD0gbWFwLnJhbmdlLm1heCApIHtcclxuICAgICAgICByZWdpb24gPSBtYXA7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gcmVnaW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZGVzY3JpcHRpb24gb2YgdGhlIGFwcGVuZGFnZSB0aGF0IGNhbiBiZSB1c2VkIGluIG11bHRpcGxlIHBsYWNlcywgc29tZXRoaW5nIGxpa2VcclxuICAgKiBcImNsb3NlIHRvIGRvb3Jrbm9iXCIgb3JcclxuICAgKiBcInZlcnkgZmFyIGZyb20gZG9vcmtub2JcIlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBzdGF0aWNcclxuICAgKiBAYTExeVxyXG4gICAqXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBwb3NpdGlvbiAtIGludGVnZXIgcG9zaXRpb24gb2YgdGhlIGFwcGVuZGFnZSwgbWFwcGVkIGZyb20gYW5nbGVcclxuICAgKiBAcGFyYW0gIHtPYmplY3R9IHJhbmdlTWFwIC0gYSBtYXAgdGhhdCB3aWxsIHByb3ZpZGUgdGhlIGNvcnJlY3QgZGVzY3JpcHRpb24gZnJvbSB0aGUgcHJvdmlkZWQgaW5wdXQgdmFsdWVcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIGEgbG93ZXIgY2FzZSBzdHJpbmcsIGdlbmVyYWxseSB0byBiZSBpbnNlcnRlZCBpbnRvIGFub3RoZXIgY29udGV4dFxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRQb3NpdGlvbkRlc2NyaXB0aW9uKCBwb3NpdGlvbiwgcmFuZ2VNYXAgKSB7XHJcbiAgICBjb25zdCBuZXdSZWdpb24gPSBBcHBlbmRhZ2VOb2RlLmdldFJlZ2lvbiggVXRpbHMucm91bmRTeW1tZXRyaWMoIHBvc2l0aW9uICksIHJhbmdlTWFwICk7XHJcbiAgICByZXR1cm4gbmV3UmVnaW9uLnRleHQudG9Mb3dlckNhc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElmIHRoZSBhcHBlbmRhZ2UgaXMgYXQgYSBjcml0aWNhbCBwb3NpdGlvbiwgcmV0dXJucyBhICdsYW5kbWFyaycgZGVzY3JpcHRpb24gdGhhdCB3aWxsIGFsd2F5cyBiZSByZWFkIHRvIHRoZSB1c2VyLlxyXG4gICAqIE90aGVyd2lzZSwgcmV0dXJuIGFuIGVtcHR5IHN0cmluZy5cclxuICAgKiBAc3RhdGljXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAYTExeVxyXG4gICAqXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSAge09iamVjdH0gbGFuZG1hcmtNYXAge3ZhbHVlLCB0ZXh0fVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldExhbmRtYXJrRGVzY3JpcHRpb24oIHBvc2l0aW9uLCBsYW5kbWFya01hcCApIHtcclxuICAgIGxldCBtZXNzYWdlID0gJyc7XHJcblxyXG4gICAgXy5mb3JFYWNoKCBsYW5kbWFya01hcCwgbGFuZG1hcmsgPT4ge1xyXG4gICAgICBpZiAoIHBvc2l0aW9uID09PSBsYW5kbWFyay52YWx1ZSApIHtcclxuICAgICAgICBtZXNzYWdlID0gbGFuZG1hcmsudGV4dDtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBtZXNzYWdlO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgQXBwZW5kYWdlTm9kZUhlbHBlciB7XHJcbiAgY29uc3RydWN0b3IoIHJhbmdlTWFwLCBhbmdsZVRvUERPTVZhbHVlRnVuY3Rpb24gKSB7XHJcbiAgICB0aGlzLnJhbmdlTWFwID0gcmFuZ2VNYXA7XHJcbiAgICB0aGlzLmFuZ2xlVG9QRE9NVmFsdWVGdW5jdGlvbiA9IGFuZ2xlVG9QRE9NVmFsdWVGdW5jdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlIHRoZSBhY2N1cmF0ZSB0ZXh0IGZvciBhMTF5IGRpc3BsYXkgYmFzZWQgb24gdGhlIHNsaWRlciBwcm9wZXJ0eSB2YWx1ZXMuXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSAge051bWJlcn0gcG9zaXRpb24gICAgICAgICB0aGUgbmV3IHNsaWRlciBpbnB1dCB2YWx1ZVxyXG4gICAqIEBwYXJhbSAge051bWJlcn0gcHJldmlvdXNQb3NpdGlvbiB0aGUgb2xkIHNsaWRlciBpbnB1dCB2YWx1ZVxyXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9ICAgICAgICAgICAgICAgICAgdGhlIGdlbmVyYXRlZCB0ZXh0IGZvciB0aGUgc2xpZGVyXHJcbiAgICovXHJcbiAgZ2V0VGV4dEZyb21Qb3NpdGlvbiggcG9zaXRpb24sIHByZXZpb3VzUG9zaXRpb24gKSB7XHJcbiAgICBsZXQgdmFsdWVEZXNjcmlwdGlvbjtcclxuXHJcbiAgICAvLyBnZW5lcmF0ZSBkZXNjcmlwdGlvbnMgdGhhdCBjb3VsZCBiZSB1c2VkIGRlcGVuZGluZyBvbiBtb3ZlbWVudFxyXG4gICAgY29uc3QgbmV3UmVnaW9uID0gQXBwZW5kYWdlTm9kZS5nZXRSZWdpb24oIHBvc2l0aW9uLCB0aGlzLnJhbmdlTWFwLnJlZ2lvbnMgKTtcclxuICAgIGNvbnN0IGxhbmRtYXJrRGVzY3JpcHRpb24gPSBBcHBlbmRhZ2VOb2RlLmdldExhbmRtYXJrRGVzY3JpcHRpb24oIHBvc2l0aW9uLCB0aGlzLnJhbmdlTWFwLmxhbmRtYXJrcyApO1xyXG5cclxuICAgIGlmICggbGFuZG1hcmtEZXNjcmlwdGlvbiApIHtcclxuXHJcbiAgICAgIC8vIGlmIHdlIGFyZSBldmVyIG9uIGEgY3JpdGljYWwgbGFuZG1hcmssIHRoYXQgZGVzY3JpcHRpb24gc2hvdWxkIHRha2UgcHJpb3JpdHlcclxuICAgICAgdmFsdWVEZXNjcmlwdGlvbiA9IGxhbmRtYXJrRGVzY3JpcHRpb247XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggbmV3UmVnaW9uICkge1xyXG5cclxuICAgICAgLy8gZmFsbCBiYWNrIHRvIGRlZmF1bHQgcmVnaW9uIGRlc2NyaXB0aW9uXHJcbiAgICAgIHZhbHVlRGVzY3JpcHRpb24gPSBuZXdSZWdpb24udGV4dDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdmFsdWVEZXNjcmlwdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGRlc2NyaXB0aW9uIG9mIHRoZSB2YWx1ZSBvZiB0aGUgaGFuZCBwb3NpdGlvbiwgd2l0aCBhbiBhc3NvY2lhdGVkIG51bWVyaWNhbCB2YWx1ZS5cclxuICAgKiBAcGFyYW0gcG9zaXRpb25cclxuICAgKiBAcGFyYW0gcHJldmlvdXNQb3NpdGlvblxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNyZWF0ZUFyaWFWYWx1ZVRleHQoIHBvc2l0aW9uLCBwcmV2aW91c1Bvc2l0aW9uICkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VGV4dEZyb21Qb3NpdGlvbiggcG9zaXRpb24sIHByZXZpb3VzUG9zaXRpb24gKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIG1hcHBlZCBhMTF5IHBvc2l0aW9uIGZyb20gdGhlIGN1cnJlbnQgbW9kZWwgUHJvcGVydHkgdHJhY2tpbmcgdGhlIGFuZ2xlLlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gaW50ZWdlciB2YWx1ZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhMTF5QW5nbGVUb1Bvc2l0aW9uKCBhbmdsZSApIHtcclxuICAgIHJldHVybiBVdGlscy5yb3VuZFN5bW1ldHJpYyggdGhpcy5hbmdsZVRvUERPTVZhbHVlRnVuY3Rpb24uZXZhbHVhdGUoIGFuZ2xlICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgYW5nbGUgZnJvbSB0aGUgYTExeSBwb3NpdGlvbiBvZiB0aGUgc2xpZGVyLCBjb252ZXJ0aW5nIHRoZSBpbnRlZ2VyIHRvIHNvbWUgZmxvYXRpbmcgYW5nbGVcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhMTF5UG9zaXRpb25Ub0FuZ2xlKCBwb3NpdGlvbiApIHtcclxuICAgIHJldHVybiB0aGlzLmFuZ2xlVG9QRE9NVmFsdWVGdW5jdGlvbi5pbnZlcnNlKCBwb3NpdGlvbiApO1xyXG4gIH1cclxufVxyXG5cclxuam9oblRyYXZvbHRhZ2UucmVnaXN0ZXIoICdBcHBlbmRhZ2VOb2RlJywgQXBwZW5kYWdlTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXBwZW5kYWdlTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxZQUFZLEVBQUVDLGtCQUFrQixFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsU0FBUyxRQUFRLG1DQUFtQztBQUM1RyxPQUFPQyxnQkFBZ0IsTUFBTSxzREFBc0Q7QUFDbkYsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUdwRCxNQUFNQyxhQUFhLFNBQVNGLGdCQUFnQixDQUFFRixJQUFJ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