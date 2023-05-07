// Copyright 2014-2023, University of Colorado Boulder

/**
 * A scenery node that is used to represent a draggable Measuring Tape. It contains a tip and a base that can be dragged
 * separately, with a text indicating the measurement. The motion of the measuring tape can be confined by drag bounds.
 * The position of the measuring tape should be set via the basePosition and tipPosition rather than the scenery
 * coordinates
 *
 * @author Vasily Shakhov (Mlearner)
 * @author Siddhartha Chinthapally (ActualConcepts)
 * @author Aaron Davis (PhET Interactive Simulations)
 * @author Martin Veillette (Berea College)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import Property from '../../axon/js/Property.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Utils from '../../dot/js/Utils.js';
import Vector2 from '../../dot/js/Vector2.js';
import Vector2Property from '../../dot/js/Vector2Property.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../phetcommon/js/view/ModelViewTransform2.js';
import { Circle, DragListener, Image, InteractiveHighlightingNode, KeyboardDragListener, Line, Node, Path, Rectangle, Text } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import StringIO from '../../tandem/js/types/StringIO.js';
import measuringTape_png from '../images/measuringTape_png.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
import SceneryPhetStrings from './SceneryPhetStrings.js';
// motion when using a keyboard, in view coordinates per second
const KEYBOARD_DRAG_VELOCITY = 600;

/**
 * NOTE: NodeTranslationOptions are omitted because you must use basePositionProperty and tipPositionProperty to
 * position this Node.
 */

class MeasuringTapeNode extends Node {
  // the distance measured by the tape

  // parent that displays the text and its background

  constructor(unitsProperty, providedOptions) {
    const options = optionize()({
      // base Position in model coordinate reference frame (rightBottom position of the measuring tape image)
      basePositionProperty: new Vector2Property(new Vector2(0, 0)),
      // tip Position in model coordinate reference frame (center position of the tip)
      tipPositionProperty: new Vector2Property(new Vector2(1, 0)),
      // use this to omit the value and units displayed below the tape measure, useful with createIcon
      hasValue: true,
      // bounds for the measuring tape (in model coordinate reference frame), default value is everything,
      // effectively no bounds
      dragBounds: Bounds2.EVERYTHING,
      textPosition: new Vector2(0, 30),
      // position of the text relative to center of the base image in view units
      modelViewTransform: ModelViewTransform2.createIdentity(),
      significantFigures: 1,
      // number of significant figures in the length measurement
      textColor: 'white',
      // {ColorDef} color of the length measurement and unit
      textBackgroundColor: null,
      // {ColorDef} fill color of the text background
      textBackgroundXMargin: 4,
      textBackgroundYMargin: 2,
      textBackgroundCornerRadius: 2,
      textMaxWidth: 200,
      textFont: new PhetFont({
        size: 16,
        weight: 'bold'
      }),
      // font for the measurement text
      baseScale: 0.8,
      // control the size of the measuring tape Image (the base)
      lineColor: 'gray',
      // color of the tapeline itself
      tapeLineWidth: 2,
      // lineWidth of the tape line
      tipCircleColor: 'rgba(0,0,0,0.1)',
      // color of the circle at the tip
      tipCircleRadius: 10,
      // radius of the circle on the tip
      crosshairColor: 'rgb(224, 95, 32)',
      // orange, color of the two crosshairs
      crosshairSize: 5,
      // size of the crosshairs in scenery coordinates ( measured from center)
      crosshairLineWidth: 2,
      // linewidth of the crosshairs
      isBaseCrosshairRotating: true,
      // do crosshairs rotate around their own axis to line up with the tapeline
      isTipCrosshairRotating: true,
      // do crosshairs rotate around their own axis to line up with the tapeline
      isTipDragBounded: true,
      // is the tip subject to dragBounds
      interactive: true,
      // specifies whether the node adds its own input listeners. Setting this to false may be helpful in creating an icon.
      baseDragStarted: _.noop,
      // called when the base drag starts
      baseDragEnded: _.noop,
      // called when the base drag ends, for testing whether it has dropped into the toolbox
      tandem: Tandem.OPTIONAL
    }, providedOptions);
    super();
    assert && assert(Math.abs(options.modelViewTransform.modelToViewDeltaX(1)) === Math.abs(options.modelViewTransform.modelToViewDeltaY(1)), 'The y and x scale factor are not identical');
    this.unitsProperty = unitsProperty;
    this.significantFigures = options.significantFigures;
    this.dragBoundsProperty = new Property(options.dragBounds);
    this.modelViewTransformProperty = new Property(options.modelViewTransform);
    this.isTipDragBounded = options.isTipDragBounded;
    this.basePositionProperty = options.basePositionProperty;
    this.tipPositionProperty = options.tipPositionProperty;

    // private Property and its public read-only interface
    this._isTipUserControlledProperty = new Property(false);
    this.isTipUserControlledProperty = this._isTipUserControlledProperty;

    // private Property and its public read-only interface
    this._isBaseUserControlledProperty = new Property(false);
    this.isBaseUserControlledProperty = this._isBaseUserControlledProperty;
    assert && assert(this.basePositionProperty.units === this.tipPositionProperty.units, 'units should match');
    this.measuredDistanceProperty = new DerivedProperty([this.basePositionProperty, this.tipPositionProperty], (basePosition, tipPosition) => basePosition.distance(tipPosition), {
      tandem: options.tandem.createTandem('measuredDistanceProperty'),
      phetioDocumentation: 'The distance measured by the measuring tape',
      phetioValueType: NumberIO,
      units: this.basePositionProperty.units
    });
    const crosshairShape = new Shape().moveTo(-options.crosshairSize, 0).moveTo(-options.crosshairSize, 0).lineTo(options.crosshairSize, 0).moveTo(0, -options.crosshairSize).lineTo(0, options.crosshairSize);
    const baseCrosshair = new Path(crosshairShape, {
      stroke: options.crosshairColor,
      lineWidth: options.crosshairLineWidth
    });
    const tipCrosshair = new Path(crosshairShape, {
      stroke: options.crosshairColor,
      lineWidth: options.crosshairLineWidth
    });
    const tipCircle = new Circle(options.tipCircleRadius, {
      fill: options.tipCircleColor
    });
    const baseImageParent = new InteractiveHighlightingNode({
      // will only be enabled if interactive
      interactiveHighlightEnabled: false
    });
    this.baseImage = new Image(measuringTape_png, {
      scale: options.baseScale,
      cursor: 'pointer',
      // pdom
      tagName: 'div',
      focusable: true,
      ariaRole: 'application',
      innerContent: SceneryPhetStrings.a11y.measuringTapeStringProperty,
      ariaLabel: SceneryPhetStrings.a11y.measuringTapeStringProperty
    });
    baseImageParent.addChild(this.baseImage);

    // create tapeline (running from one crosshair to the other)
    const tapeLine = new Line(this.basePositionProperty.value, this.tipPositionProperty.value, {
      stroke: options.lineColor,
      lineWidth: options.tapeLineWidth
    });

    // add tipCrosshair and tipCircle to the tip
    const tip = new InteractiveHighlightingNode({
      children: [tipCircle, tipCrosshair],
      cursor: 'pointer',
      // interactive highlights - will only be enabled when interactive
      interactiveHighlightEnabled: false,
      // pdom
      tagName: 'div',
      focusable: true,
      ariaRole: 'application',
      innerContent: SceneryPhetStrings.a11y.measuringTapeTipStringProperty,
      ariaLabel: SceneryPhetStrings.a11y.measuringTapeTipStringProperty
    });
    const readoutStringProperty = new DerivedProperty([this.unitsProperty, this.measuredDistanceProperty, SceneryPhetStrings.measuringTapeReadoutPatternStringProperty], (units, measuredDistance, measuringTapeReadoutPattern) => {
      const distance = Utils.toFixed(units.multiplier * measuredDistance, this.significantFigures);
      return StringUtils.fillIn(measuringTapeReadoutPattern, {
        distance: distance,
        units: units.name
      });
    }, {
      tandem: options.tandem.createTandem('readoutStringProperty'),
      phetioValueType: StringIO,
      phetioDocumentation: 'The text content of the readout on the measuring tape'
    });
    this.valueNode = new Text(readoutStringProperty, {
      font: options.textFont,
      fill: options.textColor,
      maxWidth: options.textMaxWidth
    });
    this.valueBackgroundNode = new Rectangle(0, 0, 1, 1, {
      cornerRadius: options.textBackgroundCornerRadius,
      fill: options.textBackgroundColor
    });

    // Resizes the value background and centers it on the value
    const updateValueBackgroundNode = () => {
      const valueBackgroundWidth = this.valueNode.width + 2 * options.textBackgroundXMargin;
      const valueBackgroundHeight = this.valueNode.height + 2 * options.textBackgroundYMargin;
      this.valueBackgroundNode.setRect(0, 0, valueBackgroundWidth, valueBackgroundHeight);
      this.valueBackgroundNode.center = this.valueNode.center;
    };
    this.valueNode.boundsProperty.lazyLink(updateValueBackgroundNode);
    updateValueBackgroundNode();

    // expand the area for touch
    tip.touchArea = tip.localBounds.dilated(15);
    this.baseImage.touchArea = this.baseImage.localBounds.dilated(20);
    this.baseImage.mouseArea = this.baseImage.localBounds.dilated(10);
    this.addChild(tapeLine); // tapeline going from one crosshair to the other
    this.addChild(baseCrosshair); // crosshair near the base, (set at basePosition)
    this.addChild(baseImageParent); // base of the measuring tape

    this.valueContainer = new Node({
      children: [this.valueBackgroundNode, this.valueNode]
    });
    if (options.hasValue) {
      this.addChild(this.valueContainer);
    }
    this.addChild(tip); // crosshair and circle at the tip (set at tipPosition)

    let baseStartOffset;
    this.baseDragListener = null;
    if (options.interactive) {
      // interactive highlights - highlights are enabled only when the component is interactive
      baseImageParent.interactiveHighlightEnabled = true;
      tip.interactiveHighlightEnabled = true;
      const baseStart = () => {
        this.moveToFront();
        options.baseDragStarted();
        this._isBaseUserControlledProperty.value = true;
      };
      const baseEnd = () => {
        this._isBaseUserControlledProperty.value = false;
        options.baseDragEnded();
      };
      const handleTipOnBaseDrag = delta => {
        // translate the position of the tip if it is not being dragged
        // when the user is not holding onto the tip, dragging the body will also drag the tip
        if (!this.isTipUserControlledProperty.value) {
          const unconstrainedTipPosition = delta.plus(this.tipPositionProperty.value);
          if (options.isTipDragBounded) {
            const constrainedTipPosition = this.dragBoundsProperty.value.closestPointTo(unconstrainedTipPosition);
            // translation of the tipPosition (subject to the constraining drag bounds)
            this.tipPositionProperty.set(constrainedTipPosition);
          } else {
            this.tipPositionProperty.set(unconstrainedTipPosition);
          }
        }
      };

      // Drag listener for base
      this.baseDragListener = new DragListener({
        tandem: options.tandem.createTandem('baseDragListener'),
        start: event => {
          baseStart();
          const position = this.modelViewTransformProperty.value.modelToViewPosition(this.basePositionProperty.value);
          baseStartOffset = event.currentTarget.globalToParentPoint(event.pointer.point).minus(position);
        },
        drag: (event, listener) => {
          const parentPoint = listener.currentTarget.globalToParentPoint(event.pointer.point).minus(baseStartOffset);
          const unconstrainedBasePosition = this.modelViewTransformProperty.value.viewToModelPosition(parentPoint);
          const constrainedBasePosition = this.dragBoundsProperty.value.closestPointTo(unconstrainedBasePosition);

          // the basePosition value has not been updated yet, hence it is the old value of the basePosition;
          const translationDelta = constrainedBasePosition.minus(this.basePositionProperty.value); // in model reference frame

          // translation of the basePosition (subject to the constraining drag bounds)
          this.basePositionProperty.set(constrainedBasePosition);
          handleTipOnBaseDrag(translationDelta);
        },
        end: baseEnd
      });
      this.baseImage.addInputListener(this.baseDragListener);

      // Drag listener for base
      const baseKeyboardDragListener = new KeyboardDragListener({
        tandem: options.tandem.createTandem('baseKeyboardDragListener'),
        positionProperty: this.basePositionProperty,
        transform: this.modelViewTransformProperty,
        dragBoundsProperty: this.dragBoundsProperty,
        dragVelocity: KEYBOARD_DRAG_VELOCITY,
        shiftDragVelocity: 300,
        start: baseStart,
        drag: handleTipOnBaseDrag,
        end: baseEnd
      });
      this.baseImage.addInputListener(baseKeyboardDragListener);
      const tipEnd = () => {
        this._isTipUserControlledProperty.value = false;
      };
      let tipStartOffset;

      // Drag listener for tip
      const tipDragListener = new DragListener({
        tandem: options.tandem.createTandem('tipDragListener'),
        start: event => {
          this.moveToFront();
          this._isTipUserControlledProperty.value = true;
          const position = this.modelViewTransformProperty.value.modelToViewPosition(this.tipPositionProperty.value);
          tipStartOffset = event.currentTarget.globalToParentPoint(event.pointer.point).minus(position);
        },
        drag: (event, listener) => {
          const parentPoint = listener.currentTarget.globalToParentPoint(event.pointer.point).minus(tipStartOffset);
          const unconstrainedTipPosition = this.modelViewTransformProperty.value.viewToModelPosition(parentPoint);
          if (options.isTipDragBounded) {
            // translation of the tipPosition (subject to the constraining drag bounds)
            this.tipPositionProperty.value = this.dragBoundsProperty.value.closestPointTo(unconstrainedTipPosition);
          } else {
            this.tipPositionProperty.value = unconstrainedTipPosition;
          }
        },
        end: tipEnd
      });
      tip.addInputListener(tipDragListener);
      const tipKeyboardDragListener = new KeyboardDragListener({
        tandem: options.tandem.createTandem('tipKeyboardDragListener'),
        positionProperty: this.tipPositionProperty,
        dragBoundsProperty: options.isTipDragBounded ? this.dragBoundsProperty : null,
        dragVelocity: KEYBOARD_DRAG_VELOCITY,
        transform: this.modelViewTransformProperty,
        shiftDragVelocity: 150,
        start: () => {
          this.moveToFront();
          this._isTipUserControlledProperty.value = true;
        },
        end: tipEnd
      });
      tip.addInputListener(tipKeyboardDragListener);
    }
    const updateTextReadout = () => {
      this.valueNode.centerTop = this.baseImage.center.plus(options.textPosition.times(options.baseScale));
    };
    readoutStringProperty.link(updateTextReadout);

    // link the positions of base and tip to the measuring tape to the scenery update function.
    // Must be disposed.
    const multilink = Multilink.multilink([this.measuredDistanceProperty, unitsProperty, this.modelViewTransformProperty, this.tipPositionProperty, this.basePositionProperty], (measuredDistance, units, modelViewTransform, tipPosition, basePosition) => {
      const viewTipPosition = modelViewTransform.modelToViewPosition(tipPosition);
      const viewBasePosition = modelViewTransform.modelToViewPosition(basePosition);

      // calculate the orientation and change of orientation of the Measuring tape
      const oldAngle = this.baseImage.getRotation();
      const angle = Math.atan2(viewTipPosition.y - viewBasePosition.y, viewTipPosition.x - viewBasePosition.x);
      const deltaAngle = angle - oldAngle;

      // set position of the tip and the base crosshair
      baseCrosshair.center = viewBasePosition;
      tip.center = viewTipPosition;

      // in order to avoid all kind of geometrical issues with position,
      // let's reset the baseImage upright and then set its position and rotation
      this.baseImage.setRotation(0);
      this.baseImage.rightBottom = viewBasePosition;
      this.baseImage.rotateAround(this.baseImage.rightBottom, angle);

      // reposition the tapeline
      tapeLine.setLine(viewBasePosition.x, viewBasePosition.y, viewTipPosition.x, viewTipPosition.y);

      // rotate the crosshairs
      if (options.isTipCrosshairRotating) {
        tip.rotateAround(viewTipPosition, deltaAngle);
      }
      if (options.isBaseCrosshairRotating) {
        baseCrosshair.rotateAround(viewBasePosition, deltaAngle);
      }
      updateTextReadout();
    });
    this.disposeMeasuringTapeNode = () => {
      multilink.dispose();
      readoutStringProperty.dispose();

      // interactive highlighting related listeners require disposal
      baseImageParent.dispose();
      tip.dispose();
    };
    this.mutate(options);

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('scenery-phet', 'MeasuringTapeNode', this);
  }
  reset() {
    this.basePositionProperty.reset();
    this.tipPositionProperty.reset();
  }
  dispose() {
    this.disposeMeasuringTapeNode();
    super.dispose();
  }

  /**
   * Sets the dragBounds of the measuring tape.
   * In addition, it forces the tip and base of the measuring tape to be within the new bounds.
   */
  setDragBounds(newDragBounds) {
    const dragBounds = newDragBounds.copy();
    this.dragBoundsProperty.value = dragBounds;

    // sets the base position of the measuring tape, which may have changed if it was outside of the dragBounds
    this.basePositionProperty.value = dragBounds.closestPointTo(this.basePositionProperty.value);

    // sets a new tip position if the tip of the measuring tape is subject to dragBounds
    if (this.isTipDragBounded) {
      this.tipPositionProperty.value = dragBounds.closestPointTo(this.tipPositionProperty.value);
    }
  }

  /**
   * Gets the dragBounds of the measuring tape.
   */
  getDragBounds() {
    return this.dragBoundsProperty.value.copy();
  }

  /**
   * Returns the center of the base in the measuring tape's local coordinate frame.
   */
  getLocalBaseCenter() {
    return new Vector2(-this.baseImage.imageWidth / 2, -this.baseImage.imageHeight / 2);
  }

  /**
   * Returns the bounding box of the measuring tape's base within its local coordinate frame
   */
  getLocalBaseBounds() {
    return this.baseImage.bounds.copy();
  }

  /**
   * Initiates a drag of the base (whole measuring tape) from a Scenery event.
   */
  startBaseDrag(event) {
    this.baseDragListener && this.baseDragListener.press(event);
  }

  /**
   * Creates an icon of the measuring tape.
   */
  static createIcon(providedOptions) {
    // See documentation above!
    const options = optionize()({
      tapeLength: 30
    }, providedOptions);

    // Create an actual measuring tape.
    const measuringTapeNode = new MeasuringTapeNode(new Property({
      name: '',
      multiplier: 1
    }), {
      tipPositionProperty: new Vector2Property(new Vector2(options.tapeLength, 0)),
      hasValue: false,
      // no value below the tape
      interactive: false
    });
    options.children = [measuringTapeNode];

    // Create the icon, with measuringTape as its initial child.  This child will be replaced once the image becomes
    // available in the callback to toImage (see below). Since toImage happens asynchronously, this ensures that
    // the icon has initial bounds that will match the icon once the image is available.
    const measuringTapeIcon = new Node(options);

    // Convert measuringTapeNode to an image, and make it the child of measuringTapeIcon.
    measuringTapeNode.toImage(image => measuringTapeIcon.setChildren([new Image(image)]));
    return measuringTapeIcon;
  }
}
sceneryPhet.register('MeasuringTapeNode', MeasuringTapeNode);
export default MeasuringTapeNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJVdGlscyIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJTaGFwZSIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJTdHJpbmdVdGlscyIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJDaXJjbGUiLCJEcmFnTGlzdGVuZXIiLCJJbWFnZSIsIkludGVyYWN0aXZlSGlnaGxpZ2h0aW5nTm9kZSIsIktleWJvYXJkRHJhZ0xpc3RlbmVyIiwiTGluZSIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiVGV4dCIsIlRhbmRlbSIsIk51bWJlcklPIiwiU3RyaW5nSU8iLCJtZWFzdXJpbmdUYXBlX3BuZyIsIlBoZXRGb250Iiwic2NlbmVyeVBoZXQiLCJTY2VuZXJ5UGhldFN0cmluZ3MiLCJLRVlCT0FSRF9EUkFHX1ZFTE9DSVRZIiwiTWVhc3VyaW5nVGFwZU5vZGUiLCJjb25zdHJ1Y3RvciIsInVuaXRzUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiYmFzZVBvc2l0aW9uUHJvcGVydHkiLCJ0aXBQb3NpdGlvblByb3BlcnR5IiwiaGFzVmFsdWUiLCJkcmFnQm91bmRzIiwiRVZFUllUSElORyIsInRleHRQb3NpdGlvbiIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImNyZWF0ZUlkZW50aXR5Iiwic2lnbmlmaWNhbnRGaWd1cmVzIiwidGV4dENvbG9yIiwidGV4dEJhY2tncm91bmRDb2xvciIsInRleHRCYWNrZ3JvdW5kWE1hcmdpbiIsInRleHRCYWNrZ3JvdW5kWU1hcmdpbiIsInRleHRCYWNrZ3JvdW5kQ29ybmVyUmFkaXVzIiwidGV4dE1heFdpZHRoIiwidGV4dEZvbnQiLCJzaXplIiwid2VpZ2h0IiwiYmFzZVNjYWxlIiwibGluZUNvbG9yIiwidGFwZUxpbmVXaWR0aCIsInRpcENpcmNsZUNvbG9yIiwidGlwQ2lyY2xlUmFkaXVzIiwiY3Jvc3NoYWlyQ29sb3IiLCJjcm9zc2hhaXJTaXplIiwiY3Jvc3NoYWlyTGluZVdpZHRoIiwiaXNCYXNlQ3Jvc3NoYWlyUm90YXRpbmciLCJpc1RpcENyb3NzaGFpclJvdGF0aW5nIiwiaXNUaXBEcmFnQm91bmRlZCIsImludGVyYWN0aXZlIiwiYmFzZURyYWdTdGFydGVkIiwiXyIsIm5vb3AiLCJiYXNlRHJhZ0VuZGVkIiwidGFuZGVtIiwiT1BUSU9OQUwiLCJhc3NlcnQiLCJNYXRoIiwiYWJzIiwibW9kZWxUb1ZpZXdEZWx0YVgiLCJtb2RlbFRvVmlld0RlbHRhWSIsImRyYWdCb3VuZHNQcm9wZXJ0eSIsIm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5IiwiX2lzVGlwVXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsImlzVGlwVXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsIl9pc0Jhc2VVc2VyQ29udHJvbGxlZFByb3BlcnR5IiwiaXNCYXNlVXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsInVuaXRzIiwibWVhc3VyZWREaXN0YW5jZVByb3BlcnR5IiwiYmFzZVBvc2l0aW9uIiwidGlwUG9zaXRpb24iLCJkaXN0YW5jZSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJwaGV0aW9WYWx1ZVR5cGUiLCJjcm9zc2hhaXJTaGFwZSIsIm1vdmVUbyIsImxpbmVUbyIsImJhc2VDcm9zc2hhaXIiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJ0aXBDcm9zc2hhaXIiLCJ0aXBDaXJjbGUiLCJmaWxsIiwiYmFzZUltYWdlUGFyZW50IiwiaW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkIiwiYmFzZUltYWdlIiwic2NhbGUiLCJjdXJzb3IiLCJ0YWdOYW1lIiwiZm9jdXNhYmxlIiwiYXJpYVJvbGUiLCJpbm5lckNvbnRlbnQiLCJhMTF5IiwibWVhc3VyaW5nVGFwZVN0cmluZ1Byb3BlcnR5IiwiYXJpYUxhYmVsIiwiYWRkQ2hpbGQiLCJ0YXBlTGluZSIsInZhbHVlIiwidGlwIiwiY2hpbGRyZW4iLCJtZWFzdXJpbmdUYXBlVGlwU3RyaW5nUHJvcGVydHkiLCJyZWFkb3V0U3RyaW5nUHJvcGVydHkiLCJtZWFzdXJpbmdUYXBlUmVhZG91dFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsIm1lYXN1cmVkRGlzdGFuY2UiLCJtZWFzdXJpbmdUYXBlUmVhZG91dFBhdHRlcm4iLCJ0b0ZpeGVkIiwibXVsdGlwbGllciIsImZpbGxJbiIsIm5hbWUiLCJ2YWx1ZU5vZGUiLCJmb250IiwibWF4V2lkdGgiLCJ2YWx1ZUJhY2tncm91bmROb2RlIiwiY29ybmVyUmFkaXVzIiwidXBkYXRlVmFsdWVCYWNrZ3JvdW5kTm9kZSIsInZhbHVlQmFja2dyb3VuZFdpZHRoIiwid2lkdGgiLCJ2YWx1ZUJhY2tncm91bmRIZWlnaHQiLCJoZWlnaHQiLCJzZXRSZWN0IiwiY2VudGVyIiwiYm91bmRzUHJvcGVydHkiLCJsYXp5TGluayIsInRvdWNoQXJlYSIsImxvY2FsQm91bmRzIiwiZGlsYXRlZCIsIm1vdXNlQXJlYSIsInZhbHVlQ29udGFpbmVyIiwiYmFzZVN0YXJ0T2Zmc2V0IiwiYmFzZURyYWdMaXN0ZW5lciIsImJhc2VTdGFydCIsIm1vdmVUb0Zyb250IiwiYmFzZUVuZCIsImhhbmRsZVRpcE9uQmFzZURyYWciLCJkZWx0YSIsInVuY29uc3RyYWluZWRUaXBQb3NpdGlvbiIsInBsdXMiLCJjb25zdHJhaW5lZFRpcFBvc2l0aW9uIiwiY2xvc2VzdFBvaW50VG8iLCJzZXQiLCJzdGFydCIsImV2ZW50IiwicG9zaXRpb24iLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwiY3VycmVudFRhcmdldCIsImdsb2JhbFRvUGFyZW50UG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJtaW51cyIsImRyYWciLCJsaXN0ZW5lciIsInBhcmVudFBvaW50IiwidW5jb25zdHJhaW5lZEJhc2VQb3NpdGlvbiIsInZpZXdUb01vZGVsUG9zaXRpb24iLCJjb25zdHJhaW5lZEJhc2VQb3NpdGlvbiIsInRyYW5zbGF0aW9uRGVsdGEiLCJlbmQiLCJhZGRJbnB1dExpc3RlbmVyIiwiYmFzZUtleWJvYXJkRHJhZ0xpc3RlbmVyIiwicG9zaXRpb25Qcm9wZXJ0eSIsInRyYW5zZm9ybSIsImRyYWdWZWxvY2l0eSIsInNoaWZ0RHJhZ1ZlbG9jaXR5IiwidGlwRW5kIiwidGlwU3RhcnRPZmZzZXQiLCJ0aXBEcmFnTGlzdGVuZXIiLCJ0aXBLZXlib2FyZERyYWdMaXN0ZW5lciIsInVwZGF0ZVRleHRSZWFkb3V0IiwiY2VudGVyVG9wIiwidGltZXMiLCJsaW5rIiwibXVsdGlsaW5rIiwidmlld1RpcFBvc2l0aW9uIiwidmlld0Jhc2VQb3NpdGlvbiIsIm9sZEFuZ2xlIiwiZ2V0Um90YXRpb24iLCJhbmdsZSIsImF0YW4yIiwieSIsIngiLCJkZWx0YUFuZ2xlIiwic2V0Um90YXRpb24iLCJyaWdodEJvdHRvbSIsInJvdGF0ZUFyb3VuZCIsInNldExpbmUiLCJkaXNwb3NlTWVhc3VyaW5nVGFwZU5vZGUiLCJkaXNwb3NlIiwibXV0YXRlIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJyZXNldCIsInNldERyYWdCb3VuZHMiLCJuZXdEcmFnQm91bmRzIiwiY29weSIsImdldERyYWdCb3VuZHMiLCJnZXRMb2NhbEJhc2VDZW50ZXIiLCJpbWFnZVdpZHRoIiwiaW1hZ2VIZWlnaHQiLCJnZXRMb2NhbEJhc2VCb3VuZHMiLCJib3VuZHMiLCJzdGFydEJhc2VEcmFnIiwicHJlc3MiLCJjcmVhdGVJY29uIiwidGFwZUxlbmd0aCIsIm1lYXN1cmluZ1RhcGVOb2RlIiwibWVhc3VyaW5nVGFwZUljb24iLCJ0b0ltYWdlIiwiaW1hZ2UiLCJzZXRDaGlsZHJlbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTWVhc3VyaW5nVGFwZU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBzY2VuZXJ5IG5vZGUgdGhhdCBpcyB1c2VkIHRvIHJlcHJlc2VudCBhIGRyYWdnYWJsZSBNZWFzdXJpbmcgVGFwZS4gSXQgY29udGFpbnMgYSB0aXAgYW5kIGEgYmFzZSB0aGF0IGNhbiBiZSBkcmFnZ2VkXHJcbiAqIHNlcGFyYXRlbHksIHdpdGggYSB0ZXh0IGluZGljYXRpbmcgdGhlIG1lYXN1cmVtZW50LiBUaGUgbW90aW9uIG9mIHRoZSBtZWFzdXJpbmcgdGFwZSBjYW4gYmUgY29uZmluZWQgYnkgZHJhZyBib3VuZHMuXHJcbiAqIFRoZSBwb3NpdGlvbiBvZiB0aGUgbWVhc3VyaW5nIHRhcGUgc2hvdWxkIGJlIHNldCB2aWEgdGhlIGJhc2VQb3NpdGlvbiBhbmQgdGlwUG9zaXRpb24gcmF0aGVyIHRoYW4gdGhlIHNjZW5lcnlcclxuICogY29vcmRpbmF0ZXNcclxuICpcclxuICogQGF1dGhvciBWYXNpbHkgU2hha2hvdiAoTWxlYXJuZXIpXHJcbiAqIEBhdXRob3IgU2lkZGhhcnRoYSBDaGludGhhcGFsbHkgKEFjdHVhbENvbmNlcHRzKVxyXG4gKiBAYXV0aG9yIEFhcm9uIERhdmlzIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGUgKEJlcmVhIENvbGxlZ2UpXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCB7IENpcmNsZSwgRHJhZ0xpc3RlbmVyLCBGb250LCBJbWFnZSwgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmdOb2RlLCBLZXlib2FyZERyYWdMaXN0ZW5lciwgTGluZSwgTm9kZSwgTm9kZU9wdGlvbnMsIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMsIFBhdGgsIFByZXNzTGlzdGVuZXJFdmVudCwgUmVjdGFuZ2xlLCBUQ29sb3IsIFRleHQgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IFN0cmluZ0lPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9TdHJpbmdJTy5qcyc7XHJcbmltcG9ydCBtZWFzdXJpbmdUYXBlX3BuZyBmcm9tICcuLi9pbWFnZXMvbWVhc3VyaW5nVGFwZV9wbmcuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcclxuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuL1NjZW5lcnlQaGV0U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5cclxuZXhwb3J0IHR5cGUgTWVhc3VyaW5nVGFwZVVuaXRzID0ge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICBtdWx0aXBsaWVyOiBudW1iZXI7XHJcbn07XHJcblxyXG4vLyBtb3Rpb24gd2hlbiB1c2luZyBhIGtleWJvYXJkLCBpbiB2aWV3IGNvb3JkaW5hdGVzIHBlciBzZWNvbmRcclxuY29uc3QgS0VZQk9BUkRfRFJBR19WRUxPQ0lUWSA9IDYwMDtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIGJhc2UgUG9zaXRpb24gaW4gbW9kZWwgY29vcmRpbmF0ZSByZWZlcmVuY2UgZnJhbWUgKHJpZ2h0Qm90dG9tIHBvc2l0aW9uIG9mIHRoZSBtZWFzdXJpbmcgdGFwZSBpbWFnZSlcclxuICBiYXNlUG9zaXRpb25Qcm9wZXJ0eT86IFZlY3RvcjJQcm9wZXJ0eTtcclxuXHJcbiAgLy8gdGlwIFBvc2l0aW9uIGluIG1vZGVsIGNvb3JkaW5hdGUgcmVmZXJlbmNlIGZyYW1lIChjZW50ZXIgcG9zaXRpb24gb2YgdGhlIHRpcClcclxuICB0aXBQb3NpdGlvblByb3BlcnR5PzogVmVjdG9yMlByb3BlcnR5O1xyXG5cclxuICAvLyB1c2UgdGhpcyB0byBvbWl0IHRoZSB2YWx1ZSBhbmQgdW5pdHMgZGlzcGxheWVkIGJlbG93IHRoZSB0YXBlIG1lYXN1cmUsIHVzZWZ1bCB3aXRoIGNyZWF0ZUljb25cclxuICBoYXNWYWx1ZT86IGJvb2xlYW47XHJcblxyXG4gIC8vIGJvdW5kcyBmb3IgdGhlIG1lYXN1cmluZyB0YXBlIChpbiBtb2RlbCBjb29yZGluYXRlIHJlZmVyZW5jZSBmcmFtZSksIGRlZmF1bHQgdmFsdWUgaXMgZXZlcnl0aGluZyxcclxuICAvLyBlZmZlY3RpdmVseSBubyBib3VuZHNcclxuICBkcmFnQm91bmRzPzogQm91bmRzMjtcclxuICB0ZXh0UG9zaXRpb24/OiBWZWN0b3IyOyAvLyBwb3NpdGlvbiBvZiB0aGUgdGV4dCByZWxhdGl2ZSB0byBjZW50ZXIgb2YgdGhlIGJhc2UgaW1hZ2UgaW4gdmlldyB1bml0c1xyXG4gIG1vZGVsVmlld1RyYW5zZm9ybT86IE1vZGVsVmlld1RyYW5zZm9ybTI7XHJcbiAgc2lnbmlmaWNhbnRGaWd1cmVzPzogbnVtYmVyOyAvLyBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgZmlndXJlcyBpbiB0aGUgbGVuZ3RoIG1lYXN1cmVtZW50XHJcbiAgdGV4dENvbG9yPzogVENvbG9yOyAvLyB7Q29sb3JEZWZ9IGNvbG9yIG9mIHRoZSBsZW5ndGggbWVhc3VyZW1lbnQgYW5kIHVuaXRcclxuICB0ZXh0QmFja2dyb3VuZENvbG9yPzogVENvbG9yOyAvLyB7Q29sb3JEZWZ9IGZpbGwgY29sb3Igb2YgdGhlIHRleHQgYmFja2dyb3VuZFxyXG4gIHRleHRCYWNrZ3JvdW5kWE1hcmdpbj86IG51bWJlcjtcclxuICB0ZXh0QmFja2dyb3VuZFlNYXJnaW4/OiBudW1iZXI7XHJcbiAgdGV4dEJhY2tncm91bmRDb3JuZXJSYWRpdXM/OiBudW1iZXI7XHJcbiAgdGV4dE1heFdpZHRoPzogbnVtYmVyO1xyXG4gIHRleHRGb250PzogRm9udDsgLy8gZm9udCBmb3IgdGhlIG1lYXN1cmVtZW50IHRleHRcclxuICBiYXNlU2NhbGU/OiBudW1iZXI7IC8vIGNvbnRyb2wgdGhlIHNpemUgb2YgdGhlIG1lYXN1cmluZyB0YXBlIEltYWdlICh0aGUgYmFzZSlcclxuICBsaW5lQ29sb3I/OiBUQ29sb3I7IC8vIGNvbG9yIG9mIHRoZSB0YXBlbGluZSBpdHNlbGZcclxuICB0YXBlTGluZVdpZHRoPzogbnVtYmVyOyAvLyBsaW5lV2lkdGggb2YgdGhlIHRhcGUgbGluZVxyXG4gIHRpcENpcmNsZUNvbG9yPzogVENvbG9yOyAvLyBjb2xvciBvZiB0aGUgY2lyY2xlIGF0IHRoZSB0aXBcclxuICB0aXBDaXJjbGVSYWRpdXM/OiBudW1iZXI7IC8vIHJhZGl1cyBvZiB0aGUgY2lyY2xlIG9uIHRoZSB0aXBcclxuICBjcm9zc2hhaXJDb2xvcj86IFRDb2xvcjsgLy8gb3JhbmdlLCBjb2xvciBvZiB0aGUgdHdvIGNyb3NzaGFpcnNcclxuICBjcm9zc2hhaXJTaXplPzogbnVtYmVyOyAvLyBzaXplIG9mIHRoZSBjcm9zc2hhaXJzIGluIHNjZW5lcnkgY29vcmRpbmF0ZXMgKCBtZWFzdXJlZCBmcm9tIGNlbnRlcilcclxuICBjcm9zc2hhaXJMaW5lV2lkdGg/OiBudW1iZXI7IC8vIGxpbmVXaWR0aCBvZiB0aGUgY3Jvc3NoYWlyc1xyXG4gIGlzQmFzZUNyb3NzaGFpclJvdGF0aW5nPzogYm9vbGVhbjsgLy8gZG8gY3Jvc3NoYWlycyByb3RhdGUgYXJvdW5kIHRoZWlyIG93biBheGlzIHRvIGxpbmUgdXAgd2l0aCB0aGUgdGFwZWxpbmVcclxuICBpc1RpcENyb3NzaGFpclJvdGF0aW5nPzogYm9vbGVhbjsgLy8gZG8gY3Jvc3NoYWlycyByb3RhdGUgYXJvdW5kIHRoZWlyIG93biBheGlzIHRvIGxpbmUgdXAgd2l0aCB0aGUgdGFwZWxpbmVcclxuICBpc1RpcERyYWdCb3VuZGVkPzogYm9vbGVhbjsgLy8gaXMgdGhlIHRpcCBzdWJqZWN0IHRvIGRyYWdCb3VuZHNcclxuICBpbnRlcmFjdGl2ZT86IGJvb2xlYW47IC8vIHNwZWNpZmllcyB3aGV0aGVyIHRoZSBub2RlIGFkZHMgaXRzIG93biBpbnB1dCBsaXN0ZW5lcnMuIFNldHRpbmcgdGhpcyB0byBmYWxzZSBtYXkgYmUgaGVscGZ1bCBpbiBjcmVhdGluZyBhbiBpY29uLlxyXG4gIGJhc2VEcmFnU3RhcnRlZD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIHRoZSBiYXNlIGRyYWcgc3RhcnRzXHJcbiAgYmFzZURyYWdFbmRlZD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIHRoZSBiYXNlIGRyYWcgZW5kcywgZm9yIHRlc3Rpbmcgd2hldGhlciBpdCBoYXMgZHJvcHBlZCBpbnRvIHRoZSB0b29sYm94XHJcbn07XHJcblxyXG4vKipcclxuICogTk9URTogTm9kZVRyYW5zbGF0aW9uT3B0aW9ucyBhcmUgb21pdHRlZCBiZWNhdXNlIHlvdSBtdXN0IHVzZSBiYXNlUG9zaXRpb25Qcm9wZXJ0eSBhbmQgdGlwUG9zaXRpb25Qcm9wZXJ0eSB0b1xyXG4gKiBwb3NpdGlvbiB0aGlzIE5vZGUuXHJcbiAqL1xyXG5leHBvcnQgdHlwZSBNZWFzdXJpbmdUYXBlTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsIGtleW9mIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnM+O1xyXG5cclxudHlwZSBNZWFzdXJpbmdUYXBlSWNvblNlbGZPcHRpb25zID0ge1xyXG4gIHRhcGVMZW5ndGg/OiBudW1iZXI7IC8vIGxlbmd0aCBvZiB0aGUgbWVhc3VyaW5nIHRhcGVcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIE1lYXN1cmluZ1RhcGVJY29uT3B0aW9ucyA9IE1lYXN1cmluZ1RhcGVJY29uU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PE5vZGVPcHRpb25zLCAnY2hpbGRyZW4nPjtcclxuXHJcbmNsYXNzIE1lYXN1cmluZ1RhcGVOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8vIHRoZSBkaXN0YW5jZSBtZWFzdXJlZCBieSB0aGUgdGFwZVxyXG4gIHB1YmxpYyByZWFkb25seSBtZWFzdXJlZERpc3RhbmNlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj47XHJcbiAgcHVibGljIHJlYWRvbmx5IGlzVGlwVXNlckNvbnRyb2xsZWRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcHVibGljIHJlYWRvbmx5IGlzQmFzZVVzZXJDb250cm9sbGVkUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyByZWFkb25seSBiYXNlUG9zaXRpb25Qcm9wZXJ0eTogVmVjdG9yMlByb3BlcnR5O1xyXG4gIHB1YmxpYyByZWFkb25seSB0aXBQb3NpdGlvblByb3BlcnR5OiBWZWN0b3IyUHJvcGVydHk7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5OiBQcm9wZXJ0eTxNb2RlbFZpZXdUcmFuc2Zvcm0yPjtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSB1bml0c1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxNZWFzdXJpbmdUYXBlVW5pdHM+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc2lnbmlmaWNhbnRGaWd1cmVzOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IF9pc1RpcFVzZXJDb250cm9sbGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyByZWFkb25seSBfaXNCYXNlVXNlckNvbnRyb2xsZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkcmFnQm91bmRzUHJvcGVydHk6IFRQcm9wZXJ0eTxCb3VuZHMyPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGlzVGlwRHJhZ0JvdW5kZWQ6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBiYXNlRHJhZ0xpc3RlbmVyOiBEcmFnTGlzdGVuZXIgfCBudWxsO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYmFzZUltYWdlOiBJbWFnZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IHZhbHVlTm9kZTogVGV4dDtcclxuICBwcml2YXRlIHJlYWRvbmx5IHZhbHVlQmFja2dyb3VuZE5vZGU6IFJlY3RhbmdsZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IHZhbHVlQ29udGFpbmVyOiBOb2RlOyAvLyBwYXJlbnQgdGhhdCBkaXNwbGF5cyB0aGUgdGV4dCBhbmQgaXRzIGJhY2tncm91bmRcclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VNZWFzdXJpbmdUYXBlTm9kZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB1bml0c1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxNZWFzdXJpbmdUYXBlVW5pdHM+LCBwcm92aWRlZE9wdGlvbnM/OiBNZWFzdXJpbmdUYXBlTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxNZWFzdXJpbmdUYXBlTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gYmFzZSBQb3NpdGlvbiBpbiBtb2RlbCBjb29yZGluYXRlIHJlZmVyZW5jZSBmcmFtZSAocmlnaHRCb3R0b20gcG9zaXRpb24gb2YgdGhlIG1lYXN1cmluZyB0YXBlIGltYWdlKVxyXG4gICAgICBiYXNlUG9zaXRpb25Qcm9wZXJ0eTogbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIDAsIDAgKSApLFxyXG5cclxuICAgICAgLy8gdGlwIFBvc2l0aW9uIGluIG1vZGVsIGNvb3JkaW5hdGUgcmVmZXJlbmNlIGZyYW1lIChjZW50ZXIgcG9zaXRpb24gb2YgdGhlIHRpcClcclxuICAgICAgdGlwUG9zaXRpb25Qcm9wZXJ0eTogbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIDEsIDAgKSApLFxyXG5cclxuICAgICAgLy8gdXNlIHRoaXMgdG8gb21pdCB0aGUgdmFsdWUgYW5kIHVuaXRzIGRpc3BsYXllZCBiZWxvdyB0aGUgdGFwZSBtZWFzdXJlLCB1c2VmdWwgd2l0aCBjcmVhdGVJY29uXHJcbiAgICAgIGhhc1ZhbHVlOiB0cnVlLFxyXG5cclxuICAgICAgLy8gYm91bmRzIGZvciB0aGUgbWVhc3VyaW5nIHRhcGUgKGluIG1vZGVsIGNvb3JkaW5hdGUgcmVmZXJlbmNlIGZyYW1lKSwgZGVmYXVsdCB2YWx1ZSBpcyBldmVyeXRoaW5nLFxyXG4gICAgICAvLyBlZmZlY3RpdmVseSBubyBib3VuZHNcclxuICAgICAgZHJhZ0JvdW5kczogQm91bmRzMi5FVkVSWVRISU5HLFxyXG4gICAgICB0ZXh0UG9zaXRpb246IG5ldyBWZWN0b3IyKCAwLCAzMCApLCAvLyBwb3NpdGlvbiBvZiB0aGUgdGV4dCByZWxhdGl2ZSB0byBjZW50ZXIgb2YgdGhlIGJhc2UgaW1hZ2UgaW4gdmlldyB1bml0c1xyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlSWRlbnRpdHkoKSxcclxuICAgICAgc2lnbmlmaWNhbnRGaWd1cmVzOiAxLCAvLyBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgZmlndXJlcyBpbiB0aGUgbGVuZ3RoIG1lYXN1cmVtZW50XHJcbiAgICAgIHRleHRDb2xvcjogJ3doaXRlJywgLy8ge0NvbG9yRGVmfSBjb2xvciBvZiB0aGUgbGVuZ3RoIG1lYXN1cmVtZW50IGFuZCB1bml0XHJcbiAgICAgIHRleHRCYWNrZ3JvdW5kQ29sb3I6IG51bGwsIC8vIHtDb2xvckRlZn0gZmlsbCBjb2xvciBvZiB0aGUgdGV4dCBiYWNrZ3JvdW5kXHJcbiAgICAgIHRleHRCYWNrZ3JvdW5kWE1hcmdpbjogNCxcclxuICAgICAgdGV4dEJhY2tncm91bmRZTWFyZ2luOiAyLFxyXG4gICAgICB0ZXh0QmFja2dyb3VuZENvcm5lclJhZGl1czogMixcclxuICAgICAgdGV4dE1heFdpZHRoOiAyMDAsXHJcbiAgICAgIHRleHRGb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTYsIHdlaWdodDogJ2JvbGQnIH0gKSwgLy8gZm9udCBmb3IgdGhlIG1lYXN1cmVtZW50IHRleHRcclxuICAgICAgYmFzZVNjYWxlOiAwLjgsIC8vIGNvbnRyb2wgdGhlIHNpemUgb2YgdGhlIG1lYXN1cmluZyB0YXBlIEltYWdlICh0aGUgYmFzZSlcclxuICAgICAgbGluZUNvbG9yOiAnZ3JheScsIC8vIGNvbG9yIG9mIHRoZSB0YXBlbGluZSBpdHNlbGZcclxuICAgICAgdGFwZUxpbmVXaWR0aDogMiwgLy8gbGluZVdpZHRoIG9mIHRoZSB0YXBlIGxpbmVcclxuICAgICAgdGlwQ2lyY2xlQ29sb3I6ICdyZ2JhKDAsMCwwLDAuMSknLCAvLyBjb2xvciBvZiB0aGUgY2lyY2xlIGF0IHRoZSB0aXBcclxuICAgICAgdGlwQ2lyY2xlUmFkaXVzOiAxMCwgLy8gcmFkaXVzIG9mIHRoZSBjaXJjbGUgb24gdGhlIHRpcFxyXG4gICAgICBjcm9zc2hhaXJDb2xvcjogJ3JnYigyMjQsIDk1LCAzMiknLCAvLyBvcmFuZ2UsIGNvbG9yIG9mIHRoZSB0d28gY3Jvc3NoYWlyc1xyXG4gICAgICBjcm9zc2hhaXJTaXplOiA1LCAvLyBzaXplIG9mIHRoZSBjcm9zc2hhaXJzIGluIHNjZW5lcnkgY29vcmRpbmF0ZXMgKCBtZWFzdXJlZCBmcm9tIGNlbnRlcilcclxuICAgICAgY3Jvc3NoYWlyTGluZVdpZHRoOiAyLCAvLyBsaW5ld2lkdGggb2YgdGhlIGNyb3NzaGFpcnNcclxuICAgICAgaXNCYXNlQ3Jvc3NoYWlyUm90YXRpbmc6IHRydWUsIC8vIGRvIGNyb3NzaGFpcnMgcm90YXRlIGFyb3VuZCB0aGVpciBvd24gYXhpcyB0byBsaW5lIHVwIHdpdGggdGhlIHRhcGVsaW5lXHJcbiAgICAgIGlzVGlwQ3Jvc3NoYWlyUm90YXRpbmc6IHRydWUsIC8vIGRvIGNyb3NzaGFpcnMgcm90YXRlIGFyb3VuZCB0aGVpciBvd24gYXhpcyB0byBsaW5lIHVwIHdpdGggdGhlIHRhcGVsaW5lXHJcbiAgICAgIGlzVGlwRHJhZ0JvdW5kZWQ6IHRydWUsIC8vIGlzIHRoZSB0aXAgc3ViamVjdCB0byBkcmFnQm91bmRzXHJcbiAgICAgIGludGVyYWN0aXZlOiB0cnVlLCAvLyBzcGVjaWZpZXMgd2hldGhlciB0aGUgbm9kZSBhZGRzIGl0cyBvd24gaW5wdXQgbGlzdGVuZXJzLiBTZXR0aW5nIHRoaXMgdG8gZmFsc2UgbWF5IGJlIGhlbHBmdWwgaW4gY3JlYXRpbmcgYW4gaWNvbi5cclxuICAgICAgYmFzZURyYWdTdGFydGVkOiBfLm5vb3AsIC8vIGNhbGxlZCB3aGVuIHRoZSBiYXNlIGRyYWcgc3RhcnRzXHJcbiAgICAgIGJhc2VEcmFnRW5kZWQ6IF8ubm9vcCwgLy8gY2FsbGVkIHdoZW4gdGhlIGJhc2UgZHJhZyBlbmRzLCBmb3IgdGVzdGluZyB3aGV0aGVyIGl0IGhhcyBkcm9wcGVkIGludG8gdGhlIHRvb2xib3hcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUSU9OQUxcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTWF0aC5hYnMoIG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCAxICkgKSA9PT1cclxuICAgICAgICAgICAgICAgICAgICAgIE1hdGguYWJzKCBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWSggMSApICksICdUaGUgeSBhbmQgeCBzY2FsZSBmYWN0b3IgYXJlIG5vdCBpZGVudGljYWwnICk7XHJcblxyXG4gICAgdGhpcy51bml0c1Byb3BlcnR5ID0gdW5pdHNQcm9wZXJ0eTtcclxuICAgIHRoaXMuc2lnbmlmaWNhbnRGaWd1cmVzID0gb3B0aW9ucy5zaWduaWZpY2FudEZpZ3VyZXM7XHJcbiAgICB0aGlzLmRyYWdCb3VuZHNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggb3B0aW9ucy5kcmFnQm91bmRzICk7XHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybSApO1xyXG4gICAgdGhpcy5pc1RpcERyYWdCb3VuZGVkID0gb3B0aW9ucy5pc1RpcERyYWdCb3VuZGVkO1xyXG4gICAgdGhpcy5iYXNlUG9zaXRpb25Qcm9wZXJ0eSA9IG9wdGlvbnMuYmFzZVBvc2l0aW9uUHJvcGVydHk7XHJcbiAgICB0aGlzLnRpcFBvc2l0aW9uUHJvcGVydHkgPSBvcHRpb25zLnRpcFBvc2l0aW9uUHJvcGVydHk7XHJcblxyXG4gICAgLy8gcHJpdmF0ZSBQcm9wZXJ0eSBhbmQgaXRzIHB1YmxpYyByZWFkLW9ubHkgaW50ZXJmYWNlXHJcbiAgICB0aGlzLl9pc1RpcFVzZXJDb250cm9sbGVkUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8Ym9vbGVhbj4oIGZhbHNlICk7XHJcbiAgICB0aGlzLmlzVGlwVXNlckNvbnRyb2xsZWRQcm9wZXJ0eSA9IHRoaXMuX2lzVGlwVXNlckNvbnRyb2xsZWRQcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBwcml2YXRlIFByb3BlcnR5IGFuZCBpdHMgcHVibGljIHJlYWQtb25seSBpbnRlcmZhY2VcclxuICAgIHRoaXMuX2lzQmFzZVVzZXJDb250cm9sbGVkUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8Ym9vbGVhbj4oIGZhbHNlICk7XHJcbiAgICB0aGlzLmlzQmFzZVVzZXJDb250cm9sbGVkUHJvcGVydHkgPSB0aGlzLl9pc0Jhc2VVc2VyQ29udHJvbGxlZFByb3BlcnR5O1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYmFzZVBvc2l0aW9uUHJvcGVydHkudW5pdHMgPT09IHRoaXMudGlwUG9zaXRpb25Qcm9wZXJ0eS51bml0cywgJ3VuaXRzIHNob3VsZCBtYXRjaCcgKTtcclxuXHJcbiAgICB0aGlzLm1lYXN1cmVkRGlzdGFuY2VQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgdGhpcy5iYXNlUG9zaXRpb25Qcm9wZXJ0eSwgdGhpcy50aXBQb3NpdGlvblByb3BlcnR5IF0sXHJcbiAgICAgICggYmFzZVBvc2l0aW9uLCB0aXBQb3NpdGlvbiApID0+IGJhc2VQb3NpdGlvbi5kaXN0YW5jZSggdGlwUG9zaXRpb24gKSwge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWVhc3VyZWREaXN0YW5jZVByb3BlcnR5JyApLFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdUaGUgZGlzdGFuY2UgbWVhc3VyZWQgYnkgdGhlIG1lYXN1cmluZyB0YXBlJyxcclxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bWJlcklPLFxyXG4gICAgICAgIHVuaXRzOiB0aGlzLmJhc2VQb3NpdGlvblByb3BlcnR5LnVuaXRzXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjcm9zc2hhaXJTaGFwZSA9IG5ldyBTaGFwZSgpXHJcbiAgICAgIC5tb3ZlVG8oIC1vcHRpb25zLmNyb3NzaGFpclNpemUsIDAgKVxyXG4gICAgICAubW92ZVRvKCAtb3B0aW9ucy5jcm9zc2hhaXJTaXplLCAwIClcclxuICAgICAgLmxpbmVUbyggb3B0aW9ucy5jcm9zc2hhaXJTaXplLCAwIClcclxuICAgICAgLm1vdmVUbyggMCwgLW9wdGlvbnMuY3Jvc3NoYWlyU2l6ZSApXHJcbiAgICAgIC5saW5lVG8oIDAsIG9wdGlvbnMuY3Jvc3NoYWlyU2l6ZSApO1xyXG5cclxuICAgIGNvbnN0IGJhc2VDcm9zc2hhaXIgPSBuZXcgUGF0aCggY3Jvc3NoYWlyU2hhcGUsIHtcclxuICAgICAgc3Ryb2tlOiBvcHRpb25zLmNyb3NzaGFpckNvbG9yLFxyXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMuY3Jvc3NoYWlyTGluZVdpZHRoXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgdGlwQ3Jvc3NoYWlyID0gbmV3IFBhdGgoIGNyb3NzaGFpclNoYXBlLCB7XHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5jcm9zc2hhaXJDb2xvcixcclxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmNyb3NzaGFpckxpbmVXaWR0aFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHRpcENpcmNsZSA9IG5ldyBDaXJjbGUoIG9wdGlvbnMudGlwQ2lyY2xlUmFkaXVzLCB7IGZpbGw6IG9wdGlvbnMudGlwQ2lyY2xlQ29sb3IgfSApO1xyXG5cclxuICAgIGNvbnN0IGJhc2VJbWFnZVBhcmVudCA9IG5ldyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ05vZGUoIHtcclxuXHJcbiAgICAgIC8vIHdpbGwgb25seSBiZSBlbmFibGVkIGlmIGludGVyYWN0aXZlXHJcbiAgICAgIGludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZDogZmFsc2VcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYmFzZUltYWdlID0gbmV3IEltYWdlKCBtZWFzdXJpbmdUYXBlX3BuZywge1xyXG4gICAgICBzY2FsZTogb3B0aW9ucy5iYXNlU2NhbGUsXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG5cclxuICAgICAgLy8gcGRvbVxyXG4gICAgICB0YWdOYW1lOiAnZGl2JyxcclxuICAgICAgZm9jdXNhYmxlOiB0cnVlLFxyXG4gICAgICBhcmlhUm9sZTogJ2FwcGxpY2F0aW9uJyxcclxuICAgICAgaW5uZXJDb250ZW50OiBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5tZWFzdXJpbmdUYXBlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGFyaWFMYWJlbDogU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkubWVhc3VyaW5nVGFwZVN0cmluZ1Byb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgICBiYXNlSW1hZ2VQYXJlbnQuYWRkQ2hpbGQoIHRoaXMuYmFzZUltYWdlICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRhcGVsaW5lIChydW5uaW5nIGZyb20gb25lIGNyb3NzaGFpciB0byB0aGUgb3RoZXIpXHJcbiAgICBjb25zdCB0YXBlTGluZSA9IG5ldyBMaW5lKCB0aGlzLmJhc2VQb3NpdGlvblByb3BlcnR5LnZhbHVlLCB0aGlzLnRpcFBvc2l0aW9uUHJvcGVydHkudmFsdWUsIHtcclxuICAgICAgc3Ryb2tlOiBvcHRpb25zLmxpbmVDb2xvcixcclxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLnRhcGVMaW5lV2lkdGhcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBhZGQgdGlwQ3Jvc3NoYWlyIGFuZCB0aXBDaXJjbGUgdG8gdGhlIHRpcFxyXG4gICAgY29uc3QgdGlwID0gbmV3IEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyB0aXBDaXJjbGUsIHRpcENyb3NzaGFpciBdLFxyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuXHJcbiAgICAgIC8vIGludGVyYWN0aXZlIGhpZ2hsaWdodHMgLSB3aWxsIG9ubHkgYmUgZW5hYmxlZCB3aGVuIGludGVyYWN0aXZlXHJcbiAgICAgIGludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZDogZmFsc2UsXHJcblxyXG4gICAgICAvLyBwZG9tXHJcbiAgICAgIHRhZ05hbWU6ICdkaXYnLFxyXG4gICAgICBmb2N1c2FibGU6IHRydWUsXHJcbiAgICAgIGFyaWFSb2xlOiAnYXBwbGljYXRpb24nLFxyXG4gICAgICBpbm5lckNvbnRlbnQ6IFNjZW5lcnlQaGV0U3RyaW5ncy5hMTF5Lm1lYXN1cmluZ1RhcGVUaXBTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgYXJpYUxhYmVsOiBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5tZWFzdXJpbmdUYXBlVGlwU3RyaW5nUHJvcGVydHlcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCByZWFkb3V0U3RyaW5nUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHRoaXMudW5pdHNQcm9wZXJ0eSwgdGhpcy5tZWFzdXJlZERpc3RhbmNlUHJvcGVydHksIFNjZW5lcnlQaGV0U3RyaW5ncy5tZWFzdXJpbmdUYXBlUmVhZG91dFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSBdLFxyXG4gICAgICAoIHVuaXRzLCBtZWFzdXJlZERpc3RhbmNlLCBtZWFzdXJpbmdUYXBlUmVhZG91dFBhdHRlcm4gKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBVdGlscy50b0ZpeGVkKCB1bml0cy5tdWx0aXBsaWVyICogbWVhc3VyZWREaXN0YW5jZSwgdGhpcy5zaWduaWZpY2FudEZpZ3VyZXMgKTtcclxuICAgICAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBtZWFzdXJpbmdUYXBlUmVhZG91dFBhdHRlcm4sIHtcclxuICAgICAgICAgIGRpc3RhbmNlOiBkaXN0YW5jZSxcclxuICAgICAgICAgIHVuaXRzOiB1bml0cy5uYW1lXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZWFkb3V0U3RyaW5nUHJvcGVydHknICksXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBTdHJpbmdJTyxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIHRleHQgY29udGVudCBvZiB0aGUgcmVhZG91dCBvbiB0aGUgbWVhc3VyaW5nIHRhcGUnXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnZhbHVlTm9kZSA9IG5ldyBUZXh0KCByZWFkb3V0U3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udDogb3B0aW9ucy50ZXh0Rm9udCxcclxuICAgICAgZmlsbDogb3B0aW9ucy50ZXh0Q29sb3IsXHJcbiAgICAgIG1heFdpZHRoOiBvcHRpb25zLnRleHRNYXhXaWR0aFxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudmFsdWVCYWNrZ3JvdW5kTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEsIDEsIHtcclxuICAgICAgY29ybmVyUmFkaXVzOiBvcHRpb25zLnRleHRCYWNrZ3JvdW5kQ29ybmVyUmFkaXVzLFxyXG4gICAgICBmaWxsOiBvcHRpb25zLnRleHRCYWNrZ3JvdW5kQ29sb3JcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBSZXNpemVzIHRoZSB2YWx1ZSBiYWNrZ3JvdW5kIGFuZCBjZW50ZXJzIGl0IG9uIHRoZSB2YWx1ZVxyXG4gICAgY29uc3QgdXBkYXRlVmFsdWVCYWNrZ3JvdW5kTm9kZSA9ICgpID0+IHtcclxuICAgICAgY29uc3QgdmFsdWVCYWNrZ3JvdW5kV2lkdGggPSB0aGlzLnZhbHVlTm9kZS53aWR0aCArICggMiAqIG9wdGlvbnMudGV4dEJhY2tncm91bmRYTWFyZ2luICk7XHJcbiAgICAgIGNvbnN0IHZhbHVlQmFja2dyb3VuZEhlaWdodCA9IHRoaXMudmFsdWVOb2RlLmhlaWdodCArICggMiAqIG9wdGlvbnMudGV4dEJhY2tncm91bmRZTWFyZ2luICk7XHJcbiAgICAgIHRoaXMudmFsdWVCYWNrZ3JvdW5kTm9kZS5zZXRSZWN0KCAwLCAwLCB2YWx1ZUJhY2tncm91bmRXaWR0aCwgdmFsdWVCYWNrZ3JvdW5kSGVpZ2h0ICk7XHJcbiAgICAgIHRoaXMudmFsdWVCYWNrZ3JvdW5kTm9kZS5jZW50ZXIgPSB0aGlzLnZhbHVlTm9kZS5jZW50ZXI7XHJcbiAgICB9O1xyXG4gICAgdGhpcy52YWx1ZU5vZGUuYm91bmRzUHJvcGVydHkubGF6eUxpbmsoIHVwZGF0ZVZhbHVlQmFja2dyb3VuZE5vZGUgKTtcclxuICAgIHVwZGF0ZVZhbHVlQmFja2dyb3VuZE5vZGUoKTtcclxuXHJcbiAgICAvLyBleHBhbmQgdGhlIGFyZWEgZm9yIHRvdWNoXHJcbiAgICB0aXAudG91Y2hBcmVhID0gdGlwLmxvY2FsQm91bmRzLmRpbGF0ZWQoIDE1ICk7XHJcbiAgICB0aGlzLmJhc2VJbWFnZS50b3VjaEFyZWEgPSB0aGlzLmJhc2VJbWFnZS5sb2NhbEJvdW5kcy5kaWxhdGVkKCAyMCApO1xyXG4gICAgdGhpcy5iYXNlSW1hZ2UubW91c2VBcmVhID0gdGhpcy5iYXNlSW1hZ2UubG9jYWxCb3VuZHMuZGlsYXRlZCggMTAgKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0YXBlTGluZSApOyAvLyB0YXBlbGluZSBnb2luZyBmcm9tIG9uZSBjcm9zc2hhaXIgdG8gdGhlIG90aGVyXHJcbiAgICB0aGlzLmFkZENoaWxkKCBiYXNlQ3Jvc3NoYWlyICk7IC8vIGNyb3NzaGFpciBuZWFyIHRoZSBiYXNlLCAoc2V0IGF0IGJhc2VQb3NpdGlvbilcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJhc2VJbWFnZVBhcmVudCApOyAvLyBiYXNlIG9mIHRoZSBtZWFzdXJpbmcgdGFwZVxyXG5cclxuICAgIHRoaXMudmFsdWVDb250YWluZXIgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyB0aGlzLnZhbHVlQmFja2dyb3VuZE5vZGUsIHRoaXMudmFsdWVOb2RlIF0gfSApO1xyXG4gICAgaWYgKCBvcHRpb25zLmhhc1ZhbHVlICkge1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnZhbHVlQ29udGFpbmVyICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aXAgKTsgLy8gY3Jvc3NoYWlyIGFuZCBjaXJjbGUgYXQgdGhlIHRpcCAoc2V0IGF0IHRpcFBvc2l0aW9uKVxyXG5cclxuICAgIGxldCBiYXNlU3RhcnRPZmZzZXQ6IFZlY3RvcjI7XHJcblxyXG4gICAgdGhpcy5iYXNlRHJhZ0xpc3RlbmVyID0gbnVsbDtcclxuICAgIGlmICggb3B0aW9ucy5pbnRlcmFjdGl2ZSApIHtcclxuXHJcbiAgICAgIC8vIGludGVyYWN0aXZlIGhpZ2hsaWdodHMgLSBoaWdobGlnaHRzIGFyZSBlbmFibGVkIG9ubHkgd2hlbiB0aGUgY29tcG9uZW50IGlzIGludGVyYWN0aXZlXHJcbiAgICAgIGJhc2VJbWFnZVBhcmVudC5pbnRlcmFjdGl2ZUhpZ2hsaWdodEVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICB0aXAuaW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgIGNvbnN0IGJhc2VTdGFydCA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLm1vdmVUb0Zyb250KCk7XHJcbiAgICAgICAgb3B0aW9ucy5iYXNlRHJhZ1N0YXJ0ZWQoKTtcclxuICAgICAgICB0aGlzLl9pc0Jhc2VVc2VyQ29udHJvbGxlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGNvbnN0IGJhc2VFbmQgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5faXNCYXNlVXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgIG9wdGlvbnMuYmFzZURyYWdFbmRlZCgpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgY29uc3QgaGFuZGxlVGlwT25CYXNlRHJhZyA9ICggZGVsdGE6IFZlY3RvcjIgKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIHRyYW5zbGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIHRpcCBpZiBpdCBpcyBub3QgYmVpbmcgZHJhZ2dlZFxyXG4gICAgICAgIC8vIHdoZW4gdGhlIHVzZXIgaXMgbm90IGhvbGRpbmcgb250byB0aGUgdGlwLCBkcmFnZ2luZyB0aGUgYm9keSB3aWxsIGFsc28gZHJhZyB0aGUgdGlwXHJcbiAgICAgICAgaWYgKCAhdGhpcy5pc1RpcFVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICBjb25zdCB1bmNvbnN0cmFpbmVkVGlwUG9zaXRpb24gPSBkZWx0YS5wbHVzKCB0aGlzLnRpcFBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgICAgIGlmICggb3B0aW9ucy5pc1RpcERyYWdCb3VuZGVkICkge1xyXG4gICAgICAgICAgICBjb25zdCBjb25zdHJhaW5lZFRpcFBvc2l0aW9uID0gdGhpcy5kcmFnQm91bmRzUHJvcGVydHkudmFsdWUuY2xvc2VzdFBvaW50VG8oIHVuY29uc3RyYWluZWRUaXBQb3NpdGlvbiApO1xyXG4gICAgICAgICAgICAvLyB0cmFuc2xhdGlvbiBvZiB0aGUgdGlwUG9zaXRpb24gKHN1YmplY3QgdG8gdGhlIGNvbnN0cmFpbmluZyBkcmFnIGJvdW5kcylcclxuICAgICAgICAgICAgdGhpcy50aXBQb3NpdGlvblByb3BlcnR5LnNldCggY29uc3RyYWluZWRUaXBQb3NpdGlvbiApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudGlwUG9zaXRpb25Qcm9wZXJ0eS5zZXQoIHVuY29uc3RyYWluZWRUaXBQb3NpdGlvbiApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIERyYWcgbGlzdGVuZXIgZm9yIGJhc2VcclxuICAgICAgdGhpcy5iYXNlRHJhZ0xpc3RlbmVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmFzZURyYWdMaXN0ZW5lcicgKSxcclxuICAgICAgICBzdGFydDogZXZlbnQgPT4ge1xyXG4gICAgICAgICAgYmFzZVN0YXJ0KCk7XHJcbiAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkudmFsdWUubW9kZWxUb1ZpZXdQb3NpdGlvbiggdGhpcy5iYXNlUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICAgICAgYmFzZVN0YXJ0T2Zmc2V0ID0gZXZlbnQuY3VycmVudFRhcmdldCEuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApLm1pbnVzKCBwb3NpdGlvbiApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZHJhZzogKCBldmVudCwgbGlzdGVuZXIgKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBwYXJlbnRQb2ludCA9IGxpc3RlbmVyLmN1cnJlbnRUYXJnZXQuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApLm1pbnVzKCBiYXNlU3RhcnRPZmZzZXQgKTtcclxuICAgICAgICAgIGNvbnN0IHVuY29uc3RyYWluZWRCYXNlUG9zaXRpb24gPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LnZhbHVlLnZpZXdUb01vZGVsUG9zaXRpb24oIHBhcmVudFBvaW50ICk7XHJcbiAgICAgICAgICBjb25zdCBjb25zdHJhaW5lZEJhc2VQb3NpdGlvbiA9IHRoaXMuZHJhZ0JvdW5kc1Byb3BlcnR5LnZhbHVlLmNsb3Nlc3RQb2ludFRvKCB1bmNvbnN0cmFpbmVkQmFzZVBvc2l0aW9uICk7XHJcblxyXG4gICAgICAgICAgLy8gdGhlIGJhc2VQb3NpdGlvbiB2YWx1ZSBoYXMgbm90IGJlZW4gdXBkYXRlZCB5ZXQsIGhlbmNlIGl0IGlzIHRoZSBvbGQgdmFsdWUgb2YgdGhlIGJhc2VQb3NpdGlvbjtcclxuICAgICAgICAgIGNvbnN0IHRyYW5zbGF0aW9uRGVsdGEgPSBjb25zdHJhaW5lZEJhc2VQb3NpdGlvbi5taW51cyggdGhpcy5iYXNlUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApOyAvLyBpbiBtb2RlbCByZWZlcmVuY2UgZnJhbWVcclxuXHJcbiAgICAgICAgICAvLyB0cmFuc2xhdGlvbiBvZiB0aGUgYmFzZVBvc2l0aW9uIChzdWJqZWN0IHRvIHRoZSBjb25zdHJhaW5pbmcgZHJhZyBib3VuZHMpXHJcbiAgICAgICAgICB0aGlzLmJhc2VQb3NpdGlvblByb3BlcnR5LnNldCggY29uc3RyYWluZWRCYXNlUG9zaXRpb24gKTtcclxuXHJcbiAgICAgICAgICBoYW5kbGVUaXBPbkJhc2VEcmFnKCB0cmFuc2xhdGlvbkRlbHRhICk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbmQ6IGJhc2VFbmRcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmJhc2VJbWFnZS5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLmJhc2VEcmFnTGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIC8vIERyYWcgbGlzdGVuZXIgZm9yIGJhc2VcclxuICAgICAgY29uc3QgYmFzZUtleWJvYXJkRHJhZ0xpc3RlbmVyID0gbmV3IEtleWJvYXJkRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdiYXNlS2V5Ym9hcmREcmFnTGlzdGVuZXInICksXHJcbiAgICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogdGhpcy5iYXNlUG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgICB0cmFuc2Zvcm06IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHksXHJcbiAgICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiB0aGlzLmRyYWdCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgICBkcmFnVmVsb2NpdHk6IEtFWUJPQVJEX0RSQUdfVkVMT0NJVFksXHJcbiAgICAgICAgc2hpZnREcmFnVmVsb2NpdHk6IDMwMCxcclxuICAgICAgICBzdGFydDogYmFzZVN0YXJ0LFxyXG4gICAgICAgIGRyYWc6IGhhbmRsZVRpcE9uQmFzZURyYWcsXHJcbiAgICAgICAgZW5kOiBiYXNlRW5kXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMuYmFzZUltYWdlLmFkZElucHV0TGlzdGVuZXIoIGJhc2VLZXlib2FyZERyYWdMaXN0ZW5lciApO1xyXG5cclxuICAgICAgY29uc3QgdGlwRW5kID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuX2lzVGlwVXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgbGV0IHRpcFN0YXJ0T2Zmc2V0OiBWZWN0b3IyO1xyXG5cclxuICAgICAgLy8gRHJhZyBsaXN0ZW5lciBmb3IgdGlwXHJcbiAgICAgIGNvbnN0IHRpcERyYWdMaXN0ZW5lciA9IG5ldyBEcmFnTGlzdGVuZXIoIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpcERyYWdMaXN0ZW5lcicgKSxcclxuXHJcbiAgICAgICAgc3RhcnQ6IGV2ZW50ID0+IHtcclxuICAgICAgICAgIHRoaXMubW92ZVRvRnJvbnQoKTtcclxuICAgICAgICAgIHRoaXMuX2lzVGlwVXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkudmFsdWUubW9kZWxUb1ZpZXdQb3NpdGlvbiggdGhpcy50aXBQb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgICAgICB0aXBTdGFydE9mZnNldCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQhLmdsb2JhbFRvUGFyZW50UG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKS5taW51cyggcG9zaXRpb24gKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkcmFnOiAoIGV2ZW50LCBsaXN0ZW5lciApID0+IHtcclxuICAgICAgICAgIGNvbnN0IHBhcmVudFBvaW50ID0gbGlzdGVuZXIuY3VycmVudFRhcmdldC5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkubWludXMoIHRpcFN0YXJ0T2Zmc2V0ICk7XHJcbiAgICAgICAgICBjb25zdCB1bmNvbnN0cmFpbmVkVGlwUG9zaXRpb24gPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LnZhbHVlLnZpZXdUb01vZGVsUG9zaXRpb24oIHBhcmVudFBvaW50ICk7XHJcblxyXG4gICAgICAgICAgaWYgKCBvcHRpb25zLmlzVGlwRHJhZ0JvdW5kZWQgKSB7XHJcbiAgICAgICAgICAgIC8vIHRyYW5zbGF0aW9uIG9mIHRoZSB0aXBQb3NpdGlvbiAoc3ViamVjdCB0byB0aGUgY29uc3RyYWluaW5nIGRyYWcgYm91bmRzKVxyXG4gICAgICAgICAgICB0aGlzLnRpcFBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSB0aGlzLmRyYWdCb3VuZHNQcm9wZXJ0eS52YWx1ZS5jbG9zZXN0UG9pbnRUbyggdW5jb25zdHJhaW5lZFRpcFBvc2l0aW9uICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy50aXBQb3NpdGlvblByb3BlcnR5LnZhbHVlID0gdW5jb25zdHJhaW5lZFRpcFBvc2l0aW9uO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGVuZDogdGlwRW5kXHJcbiAgICAgIH0gKTtcclxuICAgICAgdGlwLmFkZElucHV0TGlzdGVuZXIoIHRpcERyYWdMaXN0ZW5lciApO1xyXG5cclxuICAgICAgY29uc3QgdGlwS2V5Ym9hcmREcmFnTGlzdGVuZXIgPSBuZXcgS2V5Ym9hcmREcmFnTGlzdGVuZXIoIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpcEtleWJvYXJkRHJhZ0xpc3RlbmVyJyApLFxyXG4gICAgICAgIHBvc2l0aW9uUHJvcGVydHk6IHRoaXMudGlwUG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgICBkcmFnQm91bmRzUHJvcGVydHk6IG9wdGlvbnMuaXNUaXBEcmFnQm91bmRlZCA/IHRoaXMuZHJhZ0JvdW5kc1Byb3BlcnR5IDogbnVsbCxcclxuICAgICAgICBkcmFnVmVsb2NpdHk6IEtFWUJPQVJEX0RSQUdfVkVMT0NJVFksXHJcbiAgICAgICAgdHJhbnNmb3JtOiB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LFxyXG4gICAgICAgIHNoaWZ0RHJhZ1ZlbG9jaXR5OiAxNTAsXHJcbiAgICAgICAgc3RhcnQ6ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMubW92ZVRvRnJvbnQoKTtcclxuICAgICAgICAgIHRoaXMuX2lzVGlwVXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbmQ6IHRpcEVuZFxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRpcC5hZGRJbnB1dExpc3RlbmVyKCB0aXBLZXlib2FyZERyYWdMaXN0ZW5lciApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHVwZGF0ZVRleHRSZWFkb3V0ID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLnZhbHVlTm9kZS5jZW50ZXJUb3AgPSB0aGlzLmJhc2VJbWFnZS5jZW50ZXIucGx1cyggb3B0aW9ucy50ZXh0UG9zaXRpb24udGltZXMoIG9wdGlvbnMuYmFzZVNjYWxlICkgKTtcclxuICAgIH07XHJcbiAgICByZWFkb3V0U3RyaW5nUHJvcGVydHkubGluayggdXBkYXRlVGV4dFJlYWRvdXQgKTtcclxuXHJcbiAgICAvLyBsaW5rIHRoZSBwb3NpdGlvbnMgb2YgYmFzZSBhbmQgdGlwIHRvIHRoZSBtZWFzdXJpbmcgdGFwZSB0byB0aGUgc2NlbmVyeSB1cGRhdGUgZnVuY3Rpb24uXHJcbiAgICAvLyBNdXN0IGJlIGRpc3Bvc2VkLlxyXG4gICAgY29uc3QgbXVsdGlsaW5rID0gTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgWyB0aGlzLm1lYXN1cmVkRGlzdGFuY2VQcm9wZXJ0eSwgdW5pdHNQcm9wZXJ0eSwgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSwgdGhpcy50aXBQb3NpdGlvblByb3BlcnR5LCB0aGlzLmJhc2VQb3NpdGlvblByb3BlcnR5IF0sIChcclxuICAgICAgICBtZWFzdXJlZERpc3RhbmNlLCB1bml0cywgbW9kZWxWaWV3VHJhbnNmb3JtLCB0aXBQb3NpdGlvbiwgYmFzZVBvc2l0aW9uICkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3VGlwUG9zaXRpb24gPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggdGlwUG9zaXRpb24gKTtcclxuICAgICAgICBjb25zdCB2aWV3QmFzZVBvc2l0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIGJhc2VQb3NpdGlvbiApO1xyXG5cclxuICAgICAgICAvLyBjYWxjdWxhdGUgdGhlIG9yaWVudGF0aW9uIGFuZCBjaGFuZ2Ugb2Ygb3JpZW50YXRpb24gb2YgdGhlIE1lYXN1cmluZyB0YXBlXHJcbiAgICAgICAgY29uc3Qgb2xkQW5nbGUgPSB0aGlzLmJhc2VJbWFnZS5nZXRSb3RhdGlvbigpO1xyXG4gICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMiggdmlld1RpcFBvc2l0aW9uLnkgLSB2aWV3QmFzZVBvc2l0aW9uLnksIHZpZXdUaXBQb3NpdGlvbi54IC0gdmlld0Jhc2VQb3NpdGlvbi54ICk7XHJcbiAgICAgICAgY29uc3QgZGVsdGFBbmdsZSA9IGFuZ2xlIC0gb2xkQW5nbGU7XHJcblxyXG4gICAgICAgIC8vIHNldCBwb3NpdGlvbiBvZiB0aGUgdGlwIGFuZCB0aGUgYmFzZSBjcm9zc2hhaXJcclxuICAgICAgICBiYXNlQ3Jvc3NoYWlyLmNlbnRlciA9IHZpZXdCYXNlUG9zaXRpb247XHJcbiAgICAgICAgdGlwLmNlbnRlciA9IHZpZXdUaXBQb3NpdGlvbjtcclxuXHJcbiAgICAgICAgLy8gaW4gb3JkZXIgdG8gYXZvaWQgYWxsIGtpbmQgb2YgZ2VvbWV0cmljYWwgaXNzdWVzIHdpdGggcG9zaXRpb24sXHJcbiAgICAgICAgLy8gbGV0J3MgcmVzZXQgdGhlIGJhc2VJbWFnZSB1cHJpZ2h0IGFuZCB0aGVuIHNldCBpdHMgcG9zaXRpb24gYW5kIHJvdGF0aW9uXHJcbiAgICAgICAgdGhpcy5iYXNlSW1hZ2Uuc2V0Um90YXRpb24oIDAgKTtcclxuICAgICAgICB0aGlzLmJhc2VJbWFnZS5yaWdodEJvdHRvbSA9IHZpZXdCYXNlUG9zaXRpb247XHJcbiAgICAgICAgdGhpcy5iYXNlSW1hZ2Uucm90YXRlQXJvdW5kKCB0aGlzLmJhc2VJbWFnZS5yaWdodEJvdHRvbSwgYW5nbGUgKTtcclxuXHJcbiAgICAgICAgLy8gcmVwb3NpdGlvbiB0aGUgdGFwZWxpbmVcclxuICAgICAgICB0YXBlTGluZS5zZXRMaW5lKCB2aWV3QmFzZVBvc2l0aW9uLngsIHZpZXdCYXNlUG9zaXRpb24ueSwgdmlld1RpcFBvc2l0aW9uLngsIHZpZXdUaXBQb3NpdGlvbi55ICk7XHJcblxyXG4gICAgICAgIC8vIHJvdGF0ZSB0aGUgY3Jvc3NoYWlyc1xyXG4gICAgICAgIGlmICggb3B0aW9ucy5pc1RpcENyb3NzaGFpclJvdGF0aW5nICkge1xyXG4gICAgICAgICAgdGlwLnJvdGF0ZUFyb3VuZCggdmlld1RpcFBvc2l0aW9uLCBkZWx0YUFuZ2xlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggb3B0aW9ucy5pc0Jhc2VDcm9zc2hhaXJSb3RhdGluZyApIHtcclxuICAgICAgICAgIGJhc2VDcm9zc2hhaXIucm90YXRlQXJvdW5kKCB2aWV3QmFzZVBvc2l0aW9uLCBkZWx0YUFuZ2xlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1cGRhdGVUZXh0UmVhZG91dCgpO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlTWVhc3VyaW5nVGFwZU5vZGUgPSAoKSA9PiB7XHJcbiAgICAgIG11bHRpbGluay5kaXNwb3NlKCk7XHJcbiAgICAgIHJlYWRvdXRTdHJpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcblxyXG4gICAgICAvLyBpbnRlcmFjdGl2ZSBoaWdobGlnaHRpbmcgcmVsYXRlZCBsaXN0ZW5lcnMgcmVxdWlyZSBkaXNwb3NhbFxyXG4gICAgICBiYXNlSW1hZ2VQYXJlbnQuZGlzcG9zZSgpO1xyXG4gICAgICB0aXAuZGlzcG9zZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHN1cHBvcnQgZm9yIGJpbmRlciBkb2N1bWVudGF0aW9uLCBzdHJpcHBlZCBvdXQgaW4gYnVpbGRzIGFuZCBvbmx5IHJ1bnMgd2hlbiA/YmluZGVyIGlzIHNwZWNpZmllZFxyXG4gICAgYXNzZXJ0ICYmIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc2NlbmVyeS1waGV0JywgJ01lYXN1cmluZ1RhcGVOb2RlJywgdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5iYXNlUG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy50aXBQb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZU1lYXN1cmluZ1RhcGVOb2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBkcmFnQm91bmRzIG9mIHRoZSBtZWFzdXJpbmcgdGFwZS5cclxuICAgKiBJbiBhZGRpdGlvbiwgaXQgZm9yY2VzIHRoZSB0aXAgYW5kIGJhc2Ugb2YgdGhlIG1lYXN1cmluZyB0YXBlIHRvIGJlIHdpdGhpbiB0aGUgbmV3IGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0RHJhZ0JvdW5kcyggbmV3RHJhZ0JvdW5kczogQm91bmRzMiApOiB2b2lkIHtcclxuICAgIGNvbnN0IGRyYWdCb3VuZHMgPSBuZXdEcmFnQm91bmRzLmNvcHkoKTtcclxuICAgIHRoaXMuZHJhZ0JvdW5kc1Byb3BlcnR5LnZhbHVlID0gZHJhZ0JvdW5kcztcclxuXHJcbiAgICAvLyBzZXRzIHRoZSBiYXNlIHBvc2l0aW9uIG9mIHRoZSBtZWFzdXJpbmcgdGFwZSwgd2hpY2ggbWF5IGhhdmUgY2hhbmdlZCBpZiBpdCB3YXMgb3V0c2lkZSBvZiB0aGUgZHJhZ0JvdW5kc1xyXG4gICAgdGhpcy5iYXNlUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IGRyYWdCb3VuZHMuY2xvc2VzdFBvaW50VG8oIHRoaXMuYmFzZVBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuXHJcbiAgICAvLyBzZXRzIGEgbmV3IHRpcCBwb3NpdGlvbiBpZiB0aGUgdGlwIG9mIHRoZSBtZWFzdXJpbmcgdGFwZSBpcyBzdWJqZWN0IHRvIGRyYWdCb3VuZHNcclxuICAgIGlmICggdGhpcy5pc1RpcERyYWdCb3VuZGVkICkge1xyXG4gICAgICB0aGlzLnRpcFBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBkcmFnQm91bmRzLmNsb3Nlc3RQb2ludFRvKCB0aGlzLnRpcFBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGRyYWdCb3VuZHMgb2YgdGhlIG1lYXN1cmluZyB0YXBlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXREcmFnQm91bmRzKCk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMuZHJhZ0JvdW5kc1Byb3BlcnR5LnZhbHVlLmNvcHkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGNlbnRlciBvZiB0aGUgYmFzZSBpbiB0aGUgbWVhc3VyaW5nIHRhcGUncyBsb2NhbCBjb29yZGluYXRlIGZyYW1lLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRMb2NhbEJhc2VDZW50ZXIoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIC10aGlzLmJhc2VJbWFnZS5pbWFnZVdpZHRoIC8gMiwgLXRoaXMuYmFzZUltYWdlLmltYWdlSGVpZ2h0IC8gMiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgYm91bmRpbmcgYm94IG9mIHRoZSBtZWFzdXJpbmcgdGFwZSdzIGJhc2Ugd2l0aGluIGl0cyBsb2NhbCBjb29yZGluYXRlIGZyYW1lXHJcbiAgICovXHJcbiAgcHVibGljIGdldExvY2FsQmFzZUJvdW5kcygpOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLmJhc2VJbWFnZS5ib3VuZHMuY29weSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhdGVzIGEgZHJhZyBvZiB0aGUgYmFzZSAod2hvbGUgbWVhc3VyaW5nIHRhcGUpIGZyb20gYSBTY2VuZXJ5IGV2ZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGFydEJhc2VEcmFnKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IHZvaWQge1xyXG4gICAgdGhpcy5iYXNlRHJhZ0xpc3RlbmVyICYmIHRoaXMuYmFzZURyYWdMaXN0ZW5lci5wcmVzcyggZXZlbnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYW4gaWNvbiBvZiB0aGUgbWVhc3VyaW5nIHRhcGUuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVJY29uKCBwcm92aWRlZE9wdGlvbnM/OiBNZWFzdXJpbmdUYXBlSWNvbk9wdGlvbnMgKTogTm9kZSB7XHJcblxyXG4gICAgLy8gU2VlIGRvY3VtZW50YXRpb24gYWJvdmUhXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE1lYXN1cmluZ1RhcGVJY29uT3B0aW9ucywgTWVhc3VyaW5nVGFwZUljb25TZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuICAgICAgdGFwZUxlbmd0aDogMzBcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbiBhY3R1YWwgbWVhc3VyaW5nIHRhcGUuXHJcbiAgICBjb25zdCBtZWFzdXJpbmdUYXBlTm9kZSA9IG5ldyBNZWFzdXJpbmdUYXBlTm9kZSggbmV3IFByb3BlcnR5KCB7IG5hbWU6ICcnLCBtdWx0aXBsaWVyOiAxIH0gKSwge1xyXG4gICAgICB0aXBQb3NpdGlvblByb3BlcnR5OiBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggb3B0aW9ucy50YXBlTGVuZ3RoLCAwICkgKSxcclxuICAgICAgaGFzVmFsdWU6IGZhbHNlLCAvLyBubyB2YWx1ZSBiZWxvdyB0aGUgdGFwZVxyXG4gICAgICBpbnRlcmFjdGl2ZTogZmFsc2VcclxuICAgIH0gKTtcclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIG1lYXN1cmluZ1RhcGVOb2RlIF07XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBpY29uLCB3aXRoIG1lYXN1cmluZ1RhcGUgYXMgaXRzIGluaXRpYWwgY2hpbGQuICBUaGlzIGNoaWxkIHdpbGwgYmUgcmVwbGFjZWQgb25jZSB0aGUgaW1hZ2UgYmVjb21lc1xyXG4gICAgLy8gYXZhaWxhYmxlIGluIHRoZSBjYWxsYmFjayB0byB0b0ltYWdlIChzZWUgYmVsb3cpLiBTaW5jZSB0b0ltYWdlIGhhcHBlbnMgYXN5bmNocm9ub3VzbHksIHRoaXMgZW5zdXJlcyB0aGF0XHJcbiAgICAvLyB0aGUgaWNvbiBoYXMgaW5pdGlhbCBib3VuZHMgdGhhdCB3aWxsIG1hdGNoIHRoZSBpY29uIG9uY2UgdGhlIGltYWdlIGlzIGF2YWlsYWJsZS5cclxuICAgIGNvbnN0IG1lYXN1cmluZ1RhcGVJY29uID0gbmV3IE5vZGUoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBDb252ZXJ0IG1lYXN1cmluZ1RhcGVOb2RlIHRvIGFuIGltYWdlLCBhbmQgbWFrZSBpdCB0aGUgY2hpbGQgb2YgbWVhc3VyaW5nVGFwZUljb24uXHJcbiAgICBtZWFzdXJpbmdUYXBlTm9kZS50b0ltYWdlKCBpbWFnZSA9PiBtZWFzdXJpbmdUYXBlSWNvbi5zZXRDaGlsZHJlbiggWyBuZXcgSW1hZ2UoIGltYWdlICkgXSApICk7XHJcblxyXG4gICAgcmV0dXJuIG1lYXN1cmluZ1RhcGVJY29uO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdNZWFzdXJpbmdUYXBlTm9kZScsIE1lYXN1cmluZ1RhcGVOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNZWFzdXJpbmdUYXBlTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLGtDQUFrQztBQUU5RCxPQUFPQyxTQUFTLE1BQU0sNEJBQTRCO0FBQ2xELE9BQU9DLFFBQVEsTUFBTSwyQkFBMkI7QUFDaEQsT0FBT0MsT0FBTyxNQUFNLHlCQUF5QjtBQUM3QyxPQUFPQyxLQUFLLE1BQU0sdUJBQXVCO0FBQ3pDLE9BQU9DLE9BQU8sTUFBTSx5QkFBeUI7QUFDN0MsT0FBT0MsZUFBZSxN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