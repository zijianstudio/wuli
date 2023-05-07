// Copyright 2016-2023, University of Colorado Boulder

/**
 * View for the dataProbe, which can be dragged to change position.
 *
 * @author Andrea Lin (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { Circle, DragListener, HBox, Node, Path, RadialGradient, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import projectileMotion from '../../projectileMotion.js';
import ProjectileMotionStrings from '../../ProjectileMotionStrings.js';
import ProjectileMotionConstants from '../ProjectileMotionConstants.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
const heightString = ProjectileMotionStrings.height;
const mString = ProjectileMotionStrings.m;
const pattern0Value1UnitsWithSpaceString = ProjectileMotionStrings.pattern0Value1UnitsWithSpace;
const rangeString = ProjectileMotionStrings.range;
const sString = ProjectileMotionStrings.s;
const timeString = ProjectileMotionStrings.time;
const noValueString = MathSymbols.NO_VALUE;

// constants
const CIRCLE_AROUND_CROSSHAIR_RADIUS = 15; // view units, will not be transformed
const OPAQUE_BLUE = 'rgb( 41, 66, 150 )';
const TRANSPARENT_WHITE = 'rgba( 255, 255, 255, 0.2 )';
const SPACING = 4; // {number} x and y spacing and margins
const TIME_PER_MAJOR_DOT = ProjectileMotionConstants.TIME_PER_MAJOR_DOT;
const LABEL_OPTIONS = merge({}, ProjectileMotionConstants.LABEL_TEXT_OPTIONS, {
  fill: 'white'
});
const SMALL_HALO_RADIUS = ProjectileMotionConstants.SMALL_DOT_RADIUS * 5;
const LARGE_HALO_RADIUS = ProjectileMotionConstants.LARGE_DOT_RADIUS * 5;
const YELLOW_HALO_COLOR = 'rgba( 255, 255, 0, 0.8 )';
const YELLOW_HALO_EDGE_COLOR = 'rgba( 255, 255, 0, 0 )';
const YELLOW_HALO_FILL_SMALL = new RadialGradient(0, 0, 0, 0, 0, SMALL_HALO_RADIUS).addColorStop(0, 'black').addColorStop(0.2, 'black').addColorStop(0.2, YELLOW_HALO_COLOR).addColorStop(0.4, YELLOW_HALO_COLOR).addColorStop(1, YELLOW_HALO_EDGE_COLOR);
const YELLOW_HALO_FILL_LARGE = new RadialGradient(0, 0, 0, 0, 0, LARGE_HALO_RADIUS).addColorStop(0, 'black').addColorStop(0.2, 'black').addColorStop(0.2, YELLOW_HALO_COLOR).addColorStop(0.4, YELLOW_HALO_COLOR).addColorStop(1, YELLOW_HALO_EDGE_COLOR);
const GREEN_HALO_COLOR = 'rgba( 50, 255, 50, 0.8 )';
const GREEN_HALO_EDGE_COLOR = 'rgba( 50, 255, 50, 0 )';
const GREEN_HALO_FILL = new RadialGradient(0, 0, 0, 0, 0, SMALL_HALO_RADIUS).addColorStop(0, 'black').addColorStop(0.2, 'black').addColorStop(0.2, GREEN_HALO_COLOR).addColorStop(0.4, GREEN_HALO_COLOR).addColorStop(1, GREEN_HALO_EDGE_COLOR);
const DATA_PROBE_CONTENT_WIDTH = 155;
const RIGHT_SIDE_PADDING = 6;
const READOUT_X_MARGIN = ProjectileMotionConstants.RIGHTSIDE_PANEL_OPTIONS.readoutXMargin;
class DataProbeNode extends Node {
  // is this being handled by user?

  // where the crosshairs cross
  // so events can be forwarded to it by ToolboxPanel
  constructor(dataProbe, transformProperty, screenView, providedOptions) {
    const options = optionize()({
      cursor: 'pointer',
      tandem: Tandem.REQUIRED
    }, providedOptions);
    super();
    this.isUserControlledProperty = new BooleanProperty(false);
    this.dataProbe = dataProbe; // model
    this.probeOrigin = Vector2.pool.create(0, 0);

    // draggable node
    const rectangle = new Rectangle(0, 0, DATA_PROBE_CONTENT_WIDTH + RIGHT_SIDE_PADDING, 95, {
      cornerRadius: 8,
      fill: OPAQUE_BLUE,
      stroke: 'gray',
      lineWidth: 4,
      opacity: 0.8
    });
    this.rectangle = rectangle;
    rectangle.setMouseArea(rectangle.bounds.dilatedXY(10, 2));
    rectangle.setTouchArea(rectangle.bounds.dilatedXY(15, 6));

    // shift the dataProbe drag bounds so that it can only be dragged until the center reaches the left or right side
    // of the screen
    const dragBoundsShift = -DATA_PROBE_CONTENT_WIDTH / 2 + RIGHT_SIDE_PADDING;

    // crosshair view
    const crosshairShape = new Shape().moveTo(-CIRCLE_AROUND_CROSSHAIR_RADIUS, 0).lineTo(CIRCLE_AROUND_CROSSHAIR_RADIUS, 0).moveTo(0, -CIRCLE_AROUND_CROSSHAIR_RADIUS).lineTo(0, CIRCLE_AROUND_CROSSHAIR_RADIUS);
    const crosshair = new Path(crosshairShape, {
      stroke: 'black'
    });
    const circle = new Circle(CIRCLE_AROUND_CROSSHAIR_RADIUS, {
      lineWidth: 2,
      stroke: 'black',
      fill: TRANSPARENT_WHITE
    });

    // Create the base of the crosshair
    const crosshairMount = new Rectangle(0, 0, 0.4 * CIRCLE_AROUND_CROSSHAIR_RADIUS, 0.4 * CIRCLE_AROUND_CROSSHAIR_RADIUS, {
      fill: 'gray'
    });
    const dragBoundsProperty = new Property(screenView.visibleBoundsProperty.get().shiftedX(dragBoundsShift));
    this.dragListener = new DragListener({
      positionProperty: dataProbe.positionProperty,
      transform: transformProperty,
      dragBoundsProperty: dragBoundsProperty,
      useParentOffset: true,
      start: () => this.isUserControlledProperty.set(true),
      end: () => this.isUserControlledProperty.set(false),
      tandem: options.tandem.createTandem('dragListener')
    });

    // label and values readouts
    const timeReadoutProperty = new StringProperty(noValueString);
    const rangeReadoutProperty = new StringProperty(noValueString);
    const heightReadoutProperty = new StringProperty(noValueString);
    const timeBox = createInformationBox(DATA_PROBE_CONTENT_WIDTH, timeString, timeReadoutProperty);
    const rangeBox = createInformationBox(DATA_PROBE_CONTENT_WIDTH, rangeString, rangeReadoutProperty);
    const heightBox = createInformationBox(DATA_PROBE_CONTENT_WIDTH, heightString, heightReadoutProperty);
    const textBox = new VBox({
      align: 'left',
      spacing: SPACING,
      children: [timeBox, rangeBox, heightBox]
    });

    // halo node for highlighting the dataPoint whose information is shown in the dataProbe tool
    const smallHaloShape = Shape.circle(0, 0, SMALL_HALO_RADIUS);
    const largeHaloShape = Shape.circle(0, 0, LARGE_HALO_RADIUS);
    const haloNode = new Path(smallHaloShape, {
      pickable: false
    });

    // Listen for when time, range, and height change, and update the readouts.
    dataProbe.dataPointProperty.link(point => {
      if (point !== null) {
        timeReadoutProperty.set(StringUtils.fillIn(pattern0Value1UnitsWithSpaceString, {
          value: Utils.toFixedNumber(point.time, 2),
          units: sString
        }));
        rangeReadoutProperty.set(StringUtils.fillIn(pattern0Value1UnitsWithSpaceString, {
          value: Utils.toFixedNumber(point.position.x, 2),
          units: mString
        }));
        heightReadoutProperty.set(StringUtils.fillIn(pattern0Value1UnitsWithSpaceString, {
          value: Utils.toFixedNumber(point.position.y, 2),
          units: mString
        }));
        haloNode.centerX = transformProperty.get().modelToViewX(point.position.x);
        haloNode.centerY = transformProperty.get().modelToViewY(point.position.y);
        haloNode.visible = true;
        haloNode.shape = null;
        if (point.apex) {
          haloNode.shape = smallHaloShape;
          haloNode.fill = GREEN_HALO_FILL;
        } else if (Utils.toFixedNumber(point.time * 1000, 0) % TIME_PER_MAJOR_DOT === 0) {
          haloNode.shape = largeHaloShape;
          haloNode.fill = YELLOW_HALO_FILL_LARGE;
        } else {
          haloNode.shape = smallHaloShape;
          haloNode.fill = YELLOW_HALO_FILL_SMALL;
        }
      } else {
        timeReadoutProperty.set(noValueString);
        rangeReadoutProperty.set(noValueString);
        heightReadoutProperty.set(noValueString);
        haloNode.visible = false;
      }
    });

    // function align positions, and update model.
    const updatePosition = position => {
      this.probeOrigin.set(transformProperty.get().modelToViewPosition(position));
      crosshair.center = this.probeOrigin;
      circle.center = this.probeOrigin;
      crosshairMount.left = this.probeOrigin.x + CIRCLE_AROUND_CROSSHAIR_RADIUS;
      crosshairMount.centerY = this.probeOrigin.y;
      rectangle.left = crosshairMount.right;
      rectangle.centerY = this.probeOrigin.y;
      textBox.left = rectangle.left + 2 * SPACING;
      textBox.top = rectangle.top + 2 * SPACING;
      const dataPoint = dataProbe.dataPointProperty.get();
      if (dataPoint) {
        haloNode.centerX = transformProperty.get().modelToViewX(dataPoint.position.x);
        haloNode.centerY = transformProperty.get().modelToViewY(dataPoint.position.y);
      }
    };

    // Observe changes in the modelViewTransform and update/adjust positions accordingly
    transformProperty.link(transform => {
      dragBoundsProperty.value = transform.viewToModelBounds(screenView.visibleBoundsProperty.get().shiftedX(dragBoundsShift));
      updatePosition(dataProbe.positionProperty.get());
    });

    // Observe changes in the visible bounds and update drag bounds and adjust positions accordingly
    screenView.visibleBoundsProperty.link(() => {
      dragBoundsProperty.value = transformProperty.get().viewToModelBounds(screenView.visibleBoundsProperty.get().shiftedX(dragBoundsShift));
      updatePosition(dataProbe.positionProperty.get());
    });

    // Listen for position changes, align positions, and update model.
    dataProbe.positionProperty.link(position => {
      updatePosition(position);
      this.dataProbe.updateData();
    });

    // Rendering order
    assert && assert(!options.children, 'this type sets its own children');
    options.children = [haloNode, crosshairMount, rectangle, circle, crosshair, textBox];
    this.mutate(options);

    // When dragging, move the dataProbe tool
    this.addInputListener(this.dragListener);

    // visibility of the dataProbe
    dataProbe.isActiveProperty.link(active => {
      this.visible = active;
    });

    // DataProbeNode lasts for the lifetime of the sim, so links don't need to be disposed.
  }

  /**
   * Get the bounds of just the dataProbe, excluding the halo node
   */
  getJustDataProbeBounds() {
    const dataProbeBounds = Bounds2.point(this.probeOrigin.x, this.probeOrigin.y);

    // include every child except for the halo in the calculations of dataProbe bounds
    for (let i = 1; i < this.children.length; i++) {
      dataProbeBounds.includeBounds(this.globalToParentBounds(this.children[i].getGlobalBounds()));
    }
    return dataProbeBounds;
  }

  /**
   * Create icon of DataProbe node
   */
  static createIcon(tandem) {
    const rectangle = new Rectangle(0, 0, DATA_PROBE_CONTENT_WIDTH, 95, {
      cornerRadius: 8,
      fill: OPAQUE_BLUE,
      stroke: 'gray',
      lineWidth: 4,
      opacity: 0.8,
      cursor: 'pointer'
    });

    // crosshair view
    const crosshairShape = new Shape().moveTo(-CIRCLE_AROUND_CROSSHAIR_RADIUS, 0).lineTo(CIRCLE_AROUND_CROSSHAIR_RADIUS, 0).moveTo(0, -CIRCLE_AROUND_CROSSHAIR_RADIUS).lineTo(0, CIRCLE_AROUND_CROSSHAIR_RADIUS);
    const crosshair = new Path(crosshairShape, {
      stroke: 'black'
    });
    const circle = new Circle(CIRCLE_AROUND_CROSSHAIR_RADIUS, {
      lineWidth: 2,
      stroke: 'black',
      fill: TRANSPARENT_WHITE
    });

    // Create the base of the crosshair
    const crosshairMount = new Rectangle(0, 0, 0.4 * CIRCLE_AROUND_CROSSHAIR_RADIUS, 0.4 * CIRCLE_AROUND_CROSSHAIR_RADIUS, {
      fill: 'gray'
    });
    const timeBox = createInformationBox(DATA_PROBE_CONTENT_WIDTH, timeString, new Property(noValueString));
    const rangeBox = createInformationBox(DATA_PROBE_CONTENT_WIDTH, rangeString, new Property(noValueString));
    const heightBox = createInformationBox(DATA_PROBE_CONTENT_WIDTH, heightString, new Property(noValueString));
    const textBox = new VBox({
      align: 'left',
      spacing: SPACING,
      children: [timeBox, rangeBox, heightBox]
    });
    const probeOrigin = Vector2.pool.create(0, 0);
    crosshair.center = probeOrigin;
    circle.center = probeOrigin;
    crosshairMount.left = probeOrigin.x + CIRCLE_AROUND_CROSSHAIR_RADIUS;
    crosshairMount.centerY = probeOrigin.y;
    rectangle.left = crosshairMount.right;
    rectangle.centerY = probeOrigin.y;
    textBox.left = rectangle.left + 2 * SPACING;
    textBox.top = rectangle.top + 2 * SPACING;
    probeOrigin.freeToPool();
    return new Node({
      children: [crosshairMount, rectangle, circle, crosshair, textBox],
      tandem: tandem,
      phetioDocumentation: 'the icon for the DataProbeNode, this is not interactive'
    });
  }
}
projectileMotion.register('DataProbeNode', DataProbeNode);

/**
 * Auxiliary function to create label and number readout for information
 */
function createInformationBox(maxWidth, labelString, readoutProperty) {
  // width of white rectangular background, also used for calculating max width
  const backgroundWidth = 60;

  // label
  const labelText = new Text(labelString, merge({}, LABEL_OPTIONS, {
    maxWidth: maxWidth - backgroundWidth - 25
  }));

  // number
  const numberOptions = merge({}, ProjectileMotionConstants.LABEL_TEXT_OPTIONS, {
    maxWidth: backgroundWidth - 6
  });
  const numberNode = new Text(readoutProperty.get(), numberOptions);
  const backgroundNode = new Rectangle(0, 0, backgroundWidth, numberNode.height + 2 * SPACING, {
    cornerRadius: 4,
    fill: 'white',
    stroke: 'black',
    lineWidth: 0.5
  });

  // update text readout if information changes
  readoutProperty.link(readout => {
    numberNode.setString(readout);
    if (readout === noValueString) {
      numberNode.center = backgroundNode.center;
    } else {
      numberNode.right = backgroundNode.right - READOUT_X_MARGIN;
      numberNode.centerY = backgroundNode.centerY;
    }
  });
  const readoutParent = new Node({
    children: [backgroundNode, numberNode]
  });
  const spacing = maxWidth - labelText.width - readoutParent.width - 4 * SPACING;
  return new HBox({
    spacing: spacing,
    children: [labelText, readoutParent]
  });
}
export default DataProbeNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJVdGlscyIsIlZlY3RvcjIiLCJTaGFwZSIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJNYXRoU3ltYm9scyIsIkNpcmNsZSIsIkRyYWdMaXN0ZW5lciIsIkhCb3giLCJOb2RlIiwiUGF0aCIsIlJhZGlhbEdyYWRpZW50IiwiUmVjdGFuZ2xlIiwiVGV4dCIsIlZCb3giLCJUYW5kZW0iLCJwcm9qZWN0aWxlTW90aW9uIiwiUHJvamVjdGlsZU1vdGlvblN0cmluZ3MiLCJQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzIiwib3B0aW9uaXplIiwiU3RyaW5nUHJvcGVydHkiLCJoZWlnaHRTdHJpbmciLCJoZWlnaHQiLCJtU3RyaW5nIiwibSIsInBhdHRlcm4wVmFsdWUxVW5pdHNXaXRoU3BhY2VTdHJpbmciLCJwYXR0ZXJuMFZhbHVlMVVuaXRzV2l0aFNwYWNlIiwicmFuZ2VTdHJpbmciLCJyYW5nZSIsInNTdHJpbmciLCJzIiwidGltZVN0cmluZyIsInRpbWUiLCJub1ZhbHVlU3RyaW5nIiwiTk9fVkFMVUUiLCJDSVJDTEVfQVJPVU5EX0NST1NTSEFJUl9SQURJVVMiLCJPUEFRVUVfQkxVRSIsIlRSQU5TUEFSRU5UX1dISVRFIiwiU1BBQ0lORyIsIlRJTUVfUEVSX01BSk9SX0RPVCIsIkxBQkVMX09QVElPTlMiLCJMQUJFTF9URVhUX09QVElPTlMiLCJmaWxsIiwiU01BTExfSEFMT19SQURJVVMiLCJTTUFMTF9ET1RfUkFESVVTIiwiTEFSR0VfSEFMT19SQURJVVMiLCJMQVJHRV9ET1RfUkFESVVTIiwiWUVMTE9XX0hBTE9fQ09MT1IiLCJZRUxMT1dfSEFMT19FREdFX0NPTE9SIiwiWUVMTE9XX0hBTE9fRklMTF9TTUFMTCIsImFkZENvbG9yU3RvcCIsIllFTExPV19IQUxPX0ZJTExfTEFSR0UiLCJHUkVFTl9IQUxPX0NPTE9SIiwiR1JFRU5fSEFMT19FREdFX0NPTE9SIiwiR1JFRU5fSEFMT19GSUxMIiwiREFUQV9QUk9CRV9DT05URU5UX1dJRFRIIiwiUklHSFRfU0lERV9QQURESU5HIiwiUkVBRE9VVF9YX01BUkdJTiIsIlJJR0hUU0lERV9QQU5FTF9PUFRJT05TIiwicmVhZG91dFhNYXJnaW4iLCJEYXRhUHJvYmVOb2RlIiwiY29uc3RydWN0b3IiLCJkYXRhUHJvYmUiLCJ0cmFuc2Zvcm1Qcm9wZXJ0eSIsInNjcmVlblZpZXciLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiY3Vyc29yIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJpc1VzZXJDb250cm9sbGVkUHJvcGVydHkiLCJwcm9iZU9yaWdpbiIsInBvb2wiLCJjcmVhdGUiLCJyZWN0YW5nbGUiLCJjb3JuZXJSYWRpdXMiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJvcGFjaXR5Iiwic2V0TW91c2VBcmVhIiwiYm91bmRzIiwiZGlsYXRlZFhZIiwic2V0VG91Y2hBcmVhIiwiZHJhZ0JvdW5kc1NoaWZ0IiwiY3Jvc3NoYWlyU2hhcGUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJjcm9zc2hhaXIiLCJjaXJjbGUiLCJjcm9zc2hhaXJNb3VudCIsImRyYWdCb3VuZHNQcm9wZXJ0eSIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsImdldCIsInNoaWZ0ZWRYIiwiZHJhZ0xpc3RlbmVyIiwicG9zaXRpb25Qcm9wZXJ0eSIsInRyYW5zZm9ybSIsInVzZVBhcmVudE9mZnNldCIsInN0YXJ0Iiwic2V0IiwiZW5kIiwiY3JlYXRlVGFuZGVtIiwidGltZVJlYWRvdXRQcm9wZXJ0eSIsInJhbmdlUmVhZG91dFByb3BlcnR5IiwiaGVpZ2h0UmVhZG91dFByb3BlcnR5IiwidGltZUJveCIsImNyZWF0ZUluZm9ybWF0aW9uQm94IiwicmFuZ2VCb3giLCJoZWlnaHRCb3giLCJ0ZXh0Qm94IiwiYWxpZ24iLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJzbWFsbEhhbG9TaGFwZSIsImxhcmdlSGFsb1NoYXBlIiwiaGFsb05vZGUiLCJwaWNrYWJsZSIsImRhdGFQb2ludFByb3BlcnR5IiwibGluayIsInBvaW50IiwiZmlsbEluIiwidmFsdWUiLCJ0b0ZpeGVkTnVtYmVyIiwidW5pdHMiLCJwb3NpdGlvbiIsIngiLCJ5IiwiY2VudGVyWCIsIm1vZGVsVG9WaWV3WCIsImNlbnRlclkiLCJtb2RlbFRvVmlld1kiLCJ2aXNpYmxlIiwic2hhcGUiLCJhcGV4IiwidXBkYXRlUG9zaXRpb24iLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwiY2VudGVyIiwibGVmdCIsInJpZ2h0IiwidG9wIiwiZGF0YVBvaW50Iiwidmlld1RvTW9kZWxCb3VuZHMiLCJ1cGRhdGVEYXRhIiwiYXNzZXJ0IiwibXV0YXRlIiwiYWRkSW5wdXRMaXN0ZW5lciIsImlzQWN0aXZlUHJvcGVydHkiLCJhY3RpdmUiLCJnZXRKdXN0RGF0YVByb2JlQm91bmRzIiwiZGF0YVByb2JlQm91bmRzIiwiaSIsImxlbmd0aCIsImluY2x1ZGVCb3VuZHMiLCJnbG9iYWxUb1BhcmVudEJvdW5kcyIsImdldEdsb2JhbEJvdW5kcyIsImNyZWF0ZUljb24iLCJmcmVlVG9Qb29sIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInJlZ2lzdGVyIiwibWF4V2lkdGgiLCJsYWJlbFN0cmluZyIsInJlYWRvdXRQcm9wZXJ0eSIsImJhY2tncm91bmRXaWR0aCIsImxhYmVsVGV4dCIsIm51bWJlck9wdGlvbnMiLCJudW1iZXJOb2RlIiwiYmFja2dyb3VuZE5vZGUiLCJyZWFkb3V0Iiwic2V0U3RyaW5nIiwicmVhZG91dFBhcmVudCIsIndpZHRoIl0sInNvdXJjZXMiOlsiRGF0YVByb2JlTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciB0aGUgZGF0YVByb2JlLCB3aGljaCBjYW4gYmUgZHJhZ2dlZCB0byBjaGFuZ2UgcG9zaXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmVhIExpbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBEcmFnTGlzdGVuZXIsIEhCb3gsIE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoLCBSYWRpYWxHcmFkaWVudCwgUmVjdGFuZ2xlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IHByb2plY3RpbGVNb3Rpb24gZnJvbSAnLi4vLi4vcHJvamVjdGlsZU1vdGlvbi5qcyc7XHJcbmltcG9ydCBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncyBmcm9tICcuLi8uLi9Qcm9qZWN0aWxlTW90aW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzIGZyb20gJy4uL1Byb2plY3RpbGVNb3Rpb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgRGF0YVByb2JlIGZyb20gJy4uL21vZGVsL0RhdGFQcm9iZS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcblxyXG5jb25zdCBoZWlnaHRTdHJpbmcgPSBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncy5oZWlnaHQ7XHJcbmNvbnN0IG1TdHJpbmcgPSBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncy5tO1xyXG5jb25zdCBwYXR0ZXJuMFZhbHVlMVVuaXRzV2l0aFNwYWNlU3RyaW5nID0gUHJvamVjdGlsZU1vdGlvblN0cmluZ3MucGF0dGVybjBWYWx1ZTFVbml0c1dpdGhTcGFjZTtcclxuY29uc3QgcmFuZ2VTdHJpbmcgPSBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncy5yYW5nZTtcclxuY29uc3Qgc1N0cmluZyA9IFByb2plY3RpbGVNb3Rpb25TdHJpbmdzLnM7XHJcbmNvbnN0IHRpbWVTdHJpbmcgPSBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncy50aW1lO1xyXG5jb25zdCBub1ZhbHVlU3RyaW5nID0gTWF0aFN5bWJvbHMuTk9fVkFMVUU7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQ0lSQ0xFX0FST1VORF9DUk9TU0hBSVJfUkFESVVTID0gMTU7IC8vIHZpZXcgdW5pdHMsIHdpbGwgbm90IGJlIHRyYW5zZm9ybWVkXHJcbmNvbnN0IE9QQVFVRV9CTFVFID0gJ3JnYiggNDEsIDY2LCAxNTAgKSc7XHJcbmNvbnN0IFRSQU5TUEFSRU5UX1dISVRFID0gJ3JnYmEoIDI1NSwgMjU1LCAyNTUsIDAuMiApJztcclxuY29uc3QgU1BBQ0lORyA9IDQ7IC8vIHtudW1iZXJ9IHggYW5kIHkgc3BhY2luZyBhbmQgbWFyZ2luc1xyXG5jb25zdCBUSU1FX1BFUl9NQUpPUl9ET1QgPSBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzLlRJTUVfUEVSX01BSk9SX0RPVDtcclxuY29uc3QgTEFCRUxfT1BUSU9OUyA9IG1lcmdlKCB7fSwgUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5MQUJFTF9URVhUX09QVElPTlMsIHsgZmlsbDogJ3doaXRlJyB9ICk7XHJcbmNvbnN0IFNNQUxMX0hBTE9fUkFESVVTID0gUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5TTUFMTF9ET1RfUkFESVVTICogNTtcclxuY29uc3QgTEFSR0VfSEFMT19SQURJVVMgPSBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzLkxBUkdFX0RPVF9SQURJVVMgKiA1O1xyXG5jb25zdCBZRUxMT1dfSEFMT19DT0xPUiA9ICdyZ2JhKCAyNTUsIDI1NSwgMCwgMC44ICknO1xyXG5jb25zdCBZRUxMT1dfSEFMT19FREdFX0NPTE9SID0gJ3JnYmEoIDI1NSwgMjU1LCAwLCAwICknO1xyXG5jb25zdCBZRUxMT1dfSEFMT19GSUxMX1NNQUxMID0gbmV3IFJhZGlhbEdyYWRpZW50KCAwLCAwLCAwLCAwLCAwLCBTTUFMTF9IQUxPX1JBRElVUyApXHJcbiAgLmFkZENvbG9yU3RvcCggMCwgJ2JsYWNrJyApXHJcbiAgLmFkZENvbG9yU3RvcCggMC4yLCAnYmxhY2snIClcclxuICAuYWRkQ29sb3JTdG9wKCAwLjIsIFlFTExPV19IQUxPX0NPTE9SIClcclxuICAuYWRkQ29sb3JTdG9wKCAwLjQsIFlFTExPV19IQUxPX0NPTE9SIClcclxuICAuYWRkQ29sb3JTdG9wKCAxLCBZRUxMT1dfSEFMT19FREdFX0NPTE9SICk7XHJcbmNvbnN0IFlFTExPV19IQUxPX0ZJTExfTEFSR0UgPSBuZXcgUmFkaWFsR3JhZGllbnQoIDAsIDAsIDAsIDAsIDAsIExBUkdFX0hBTE9fUkFESVVTIClcclxuICAuYWRkQ29sb3JTdG9wKCAwLCAnYmxhY2snIClcclxuICAuYWRkQ29sb3JTdG9wKCAwLjIsICdibGFjaycgKVxyXG4gIC5hZGRDb2xvclN0b3AoIDAuMiwgWUVMTE9XX0hBTE9fQ09MT1IgKVxyXG4gIC5hZGRDb2xvclN0b3AoIDAuNCwgWUVMTE9XX0hBTE9fQ09MT1IgKVxyXG4gIC5hZGRDb2xvclN0b3AoIDEsIFlFTExPV19IQUxPX0VER0VfQ09MT1IgKTtcclxuY29uc3QgR1JFRU5fSEFMT19DT0xPUiA9ICdyZ2JhKCA1MCwgMjU1LCA1MCwgMC44ICknO1xyXG5jb25zdCBHUkVFTl9IQUxPX0VER0VfQ09MT1IgPSAncmdiYSggNTAsIDI1NSwgNTAsIDAgKSc7XHJcbmNvbnN0IEdSRUVOX0hBTE9fRklMTCA9IG5ldyBSYWRpYWxHcmFkaWVudCggMCwgMCwgMCwgMCwgMCwgU01BTExfSEFMT19SQURJVVMgKVxyXG4gIC5hZGRDb2xvclN0b3AoIDAsICdibGFjaycgKVxyXG4gIC5hZGRDb2xvclN0b3AoIDAuMiwgJ2JsYWNrJyApXHJcbiAgLmFkZENvbG9yU3RvcCggMC4yLCBHUkVFTl9IQUxPX0NPTE9SIClcclxuICAuYWRkQ29sb3JTdG9wKCAwLjQsIEdSRUVOX0hBTE9fQ09MT1IgKVxyXG4gIC5hZGRDb2xvclN0b3AoIDEsIEdSRUVOX0hBTE9fRURHRV9DT0xPUiApO1xyXG5cclxuY29uc3QgREFUQV9QUk9CRV9DT05URU5UX1dJRFRIID0gMTU1O1xyXG5jb25zdCBSSUdIVF9TSURFX1BBRERJTkcgPSA2O1xyXG5jb25zdCBSRUFET1VUX1hfTUFSR0lOID0gUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5SSUdIVFNJREVfUEFORUxfT1BUSU9OUy5yZWFkb3V0WE1hcmdpbjtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG50eXBlIERhdGFQcm9iZU5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcclxuXHJcbmNsYXNzIERhdGFQcm9iZU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICBwdWJsaWMgcmVhZG9ubHkgaXNVc2VyQ29udHJvbGxlZFByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47IC8vIGlzIHRoaXMgYmVpbmcgaGFuZGxlZCBieSB1c2VyP1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGF0YVByb2JlOiBEYXRhUHJvYmU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBwcm9iZU9yaWdpbjogVmVjdG9yMjsgLy8gd2hlcmUgdGhlIGNyb3NzaGFpcnMgY3Jvc3NcclxuXHJcbiAgLy8gc28gZXZlbnRzIGNhbiBiZSBmb3J3YXJkZWQgdG8gaXQgYnkgVG9vbGJveFBhbmVsXHJcbiAgcHVibGljIHJlYWRvbmx5IGRyYWdMaXN0ZW5lcjogRHJhZ0xpc3RlbmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVjdGFuZ2xlOiBSZWN0YW5nbGU7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGF0YVByb2JlOiBEYXRhUHJvYmUsIHRyYW5zZm9ybVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxNb2RlbFZpZXdUcmFuc2Zvcm0yPiwgc2NyZWVuVmlldzogU2NyZWVuVmlldywgcHJvdmlkZWRPcHRpb25zPzogRGF0YVByb2JlTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxEYXRhUHJvYmVOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMuaXNVc2VyQ29udHJvbGxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICB0aGlzLmRhdGFQcm9iZSA9IGRhdGFQcm9iZTsgLy8gbW9kZWxcclxuICAgIHRoaXMucHJvYmVPcmlnaW4gPSBWZWN0b3IyLnBvb2wuY3JlYXRlKCAwLCAwICk7XHJcblxyXG4gICAgLy8gZHJhZ2dhYmxlIG5vZGVcclxuICAgIGNvbnN0IHJlY3RhbmdsZSA9IG5ldyBSZWN0YW5nbGUoXHJcbiAgICAgIDAsXHJcbiAgICAgIDAsXHJcbiAgICAgIERBVEFfUFJPQkVfQ09OVEVOVF9XSURUSCArIFJJR0hUX1NJREVfUEFERElORyxcclxuICAgICAgOTUsIHtcclxuICAgICAgICBjb3JuZXJSYWRpdXM6IDgsXHJcbiAgICAgICAgZmlsbDogT1BBUVVFX0JMVUUsXHJcbiAgICAgICAgc3Ryb2tlOiAnZ3JheScsXHJcbiAgICAgICAgbGluZVdpZHRoOiA0LFxyXG4gICAgICAgIG9wYWNpdHk6IDAuOFxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMucmVjdGFuZ2xlID0gcmVjdGFuZ2xlO1xyXG5cclxuICAgIHJlY3RhbmdsZS5zZXRNb3VzZUFyZWEoIHJlY3RhbmdsZS5ib3VuZHMuZGlsYXRlZFhZKCAxMCwgMiApICk7XHJcbiAgICByZWN0YW5nbGUuc2V0VG91Y2hBcmVhKCByZWN0YW5nbGUuYm91bmRzLmRpbGF0ZWRYWSggMTUsIDYgKSApO1xyXG5cclxuICAgIC8vIHNoaWZ0IHRoZSBkYXRhUHJvYmUgZHJhZyBib3VuZHMgc28gdGhhdCBpdCBjYW4gb25seSBiZSBkcmFnZ2VkIHVudGlsIHRoZSBjZW50ZXIgcmVhY2hlcyB0aGUgbGVmdCBvciByaWdodCBzaWRlXHJcbiAgICAvLyBvZiB0aGUgc2NyZWVuXHJcbiAgICBjb25zdCBkcmFnQm91bmRzU2hpZnQgPSAtREFUQV9QUk9CRV9DT05URU5UX1dJRFRIIC8gMiArIFJJR0hUX1NJREVfUEFERElORztcclxuXHJcbiAgICAvLyBjcm9zc2hhaXIgdmlld1xyXG4gICAgY29uc3QgY3Jvc3NoYWlyU2hhcGUgPSBuZXcgU2hhcGUoKVxyXG4gICAgICAubW92ZVRvKCAtQ0lSQ0xFX0FST1VORF9DUk9TU0hBSVJfUkFESVVTLCAwIClcclxuICAgICAgLmxpbmVUbyggQ0lSQ0xFX0FST1VORF9DUk9TU0hBSVJfUkFESVVTLCAwIClcclxuICAgICAgLm1vdmVUbyggMCwgLUNJUkNMRV9BUk9VTkRfQ1JPU1NIQUlSX1JBRElVUyApXHJcbiAgICAgIC5saW5lVG8oIDAsIENJUkNMRV9BUk9VTkRfQ1JPU1NIQUlSX1JBRElVUyApO1xyXG5cclxuICAgIGNvbnN0IGNyb3NzaGFpciA9IG5ldyBQYXRoKCBjcm9zc2hhaXJTaGFwZSwgeyBzdHJva2U6ICdibGFjaycgfSApO1xyXG4gICAgY29uc3QgY2lyY2xlID0gbmV3IENpcmNsZSggQ0lSQ0xFX0FST1VORF9DUk9TU0hBSVJfUkFESVVTLCB7XHJcbiAgICAgIGxpbmVXaWR0aDogMixcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBmaWxsOiBUUkFOU1BBUkVOVF9XSElURVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgYmFzZSBvZiB0aGUgY3Jvc3NoYWlyXHJcbiAgICBjb25zdCBjcm9zc2hhaXJNb3VudCA9IG5ldyBSZWN0YW5nbGUoXHJcbiAgICAgIDAsXHJcbiAgICAgIDAsXHJcbiAgICAgIDAuNCAqIENJUkNMRV9BUk9VTkRfQ1JPU1NIQUlSX1JBRElVUyxcclxuICAgICAgMC40ICogQ0lSQ0xFX0FST1VORF9DUk9TU0hBSVJfUkFESVVTLFxyXG4gICAgICB7IGZpbGw6ICdncmF5JyB9XHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGRyYWdCb3VuZHNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggc2NyZWVuVmlldy52aXNpYmxlQm91bmRzUHJvcGVydHkuZ2V0KCkuc2hpZnRlZFgoIGRyYWdCb3VuZHNTaGlmdCApICk7XHJcblxyXG4gICAgdGhpcy5kcmFnTGlzdGVuZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIHBvc2l0aW9uUHJvcGVydHk6IGRhdGFQcm9iZS5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybVByb3BlcnR5LFxyXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IGRyYWdCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgdXNlUGFyZW50T2Zmc2V0OiB0cnVlLFxyXG4gICAgICBzdGFydDogKCkgPT4gdGhpcy5pc1VzZXJDb250cm9sbGVkUHJvcGVydHkuc2V0KCB0cnVlICksXHJcbiAgICAgIGVuZDogKCkgPT4gdGhpcy5pc1VzZXJDb250cm9sbGVkUHJvcGVydHkuc2V0KCBmYWxzZSApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdMaXN0ZW5lcicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGxhYmVsIGFuZCB2YWx1ZXMgcmVhZG91dHNcclxuICAgIGNvbnN0IHRpbWVSZWFkb3V0UHJvcGVydHkgPSBuZXcgU3RyaW5nUHJvcGVydHkoIG5vVmFsdWVTdHJpbmcgKTtcclxuICAgIGNvbnN0IHJhbmdlUmVhZG91dFByb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCBub1ZhbHVlU3RyaW5nICk7XHJcbiAgICBjb25zdCBoZWlnaHRSZWFkb3V0UHJvcGVydHkgPSBuZXcgU3RyaW5nUHJvcGVydHkoIG5vVmFsdWVTdHJpbmcgKTtcclxuXHJcbiAgICBjb25zdCB0aW1lQm94ID0gY3JlYXRlSW5mb3JtYXRpb25Cb3goIERBVEFfUFJPQkVfQ09OVEVOVF9XSURUSCwgdGltZVN0cmluZywgdGltZVJlYWRvdXRQcm9wZXJ0eSApO1xyXG4gICAgY29uc3QgcmFuZ2VCb3ggPSBjcmVhdGVJbmZvcm1hdGlvbkJveCggREFUQV9QUk9CRV9DT05URU5UX1dJRFRILCByYW5nZVN0cmluZywgcmFuZ2VSZWFkb3V0UHJvcGVydHkgKTtcclxuICAgIGNvbnN0IGhlaWdodEJveCA9IGNyZWF0ZUluZm9ybWF0aW9uQm94KCBEQVRBX1BST0JFX0NPTlRFTlRfV0lEVEgsIGhlaWdodFN0cmluZywgaGVpZ2h0UmVhZG91dFByb3BlcnR5ICk7XHJcblxyXG4gICAgY29uc3QgdGV4dEJveCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIHNwYWNpbmc6IFNQQUNJTkcsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgdGltZUJveCxcclxuICAgICAgICByYW5nZUJveCxcclxuICAgICAgICBoZWlnaHRCb3hcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGhhbG8gbm9kZSBmb3IgaGlnaGxpZ2h0aW5nIHRoZSBkYXRhUG9pbnQgd2hvc2UgaW5mb3JtYXRpb24gaXMgc2hvd24gaW4gdGhlIGRhdGFQcm9iZSB0b29sXHJcbiAgICBjb25zdCBzbWFsbEhhbG9TaGFwZSA9IFNoYXBlLmNpcmNsZSggMCwgMCwgU01BTExfSEFMT19SQURJVVMgKTtcclxuICAgIGNvbnN0IGxhcmdlSGFsb1NoYXBlID0gU2hhcGUuY2lyY2xlKCAwLCAwLCBMQVJHRV9IQUxPX1JBRElVUyApO1xyXG4gICAgY29uc3QgaGFsb05vZGUgPSBuZXcgUGF0aCggc21hbGxIYWxvU2hhcGUsIHsgcGlja2FibGU6IGZhbHNlIH0gKTtcclxuXHJcbiAgICAvLyBMaXN0ZW4gZm9yIHdoZW4gdGltZSwgcmFuZ2UsIGFuZCBoZWlnaHQgY2hhbmdlLCBhbmQgdXBkYXRlIHRoZSByZWFkb3V0cy5cclxuICAgIGRhdGFQcm9iZS5kYXRhUG9pbnRQcm9wZXJ0eS5saW5rKCBwb2ludCA9PiB7XHJcbiAgICAgIGlmICggcG9pbnQgIT09IG51bGwgKSB7XHJcbiAgICAgICAgdGltZVJlYWRvdXRQcm9wZXJ0eS5zZXQoIFN0cmluZ1V0aWxzLmZpbGxJbiggcGF0dGVybjBWYWx1ZTFVbml0c1dpdGhTcGFjZVN0cmluZywge1xyXG4gICAgICAgICAgdmFsdWU6IFV0aWxzLnRvRml4ZWROdW1iZXIoIHBvaW50LnRpbWUsIDIgKSxcclxuICAgICAgICAgIHVuaXRzOiBzU3RyaW5nXHJcbiAgICAgICAgfSApICk7XHJcbiAgICAgICAgcmFuZ2VSZWFkb3V0UHJvcGVydHkuc2V0KCBTdHJpbmdVdGlscy5maWxsSW4oIHBhdHRlcm4wVmFsdWUxVW5pdHNXaXRoU3BhY2VTdHJpbmcsIHtcclxuICAgICAgICAgIHZhbHVlOiBVdGlscy50b0ZpeGVkTnVtYmVyKCBwb2ludC5wb3NpdGlvbi54LCAyICksXHJcbiAgICAgICAgICB1bml0czogbVN0cmluZ1xyXG4gICAgICAgIH0gKSApO1xyXG4gICAgICAgIGhlaWdodFJlYWRvdXRQcm9wZXJ0eS5zZXQoIFN0cmluZ1V0aWxzLmZpbGxJbiggcGF0dGVybjBWYWx1ZTFVbml0c1dpdGhTcGFjZVN0cmluZywge1xyXG4gICAgICAgICAgdmFsdWU6IFV0aWxzLnRvRml4ZWROdW1iZXIoIHBvaW50LnBvc2l0aW9uLnksIDIgKSxcclxuICAgICAgICAgIHVuaXRzOiBtU3RyaW5nXHJcbiAgICAgICAgfSApICk7XHJcbiAgICAgICAgaGFsb05vZGUuY2VudGVyWCA9IHRyYW5zZm9ybVByb3BlcnR5LmdldCgpLm1vZGVsVG9WaWV3WCggcG9pbnQucG9zaXRpb24ueCApO1xyXG4gICAgICAgIGhhbG9Ob2RlLmNlbnRlclkgPSB0cmFuc2Zvcm1Qcm9wZXJ0eS5nZXQoKS5tb2RlbFRvVmlld1koIHBvaW50LnBvc2l0aW9uLnkgKTtcclxuICAgICAgICBoYWxvTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICBoYWxvTm9kZS5zaGFwZSA9IG51bGw7XHJcbiAgICAgICAgaWYgKCBwb2ludC5hcGV4ICkge1xyXG4gICAgICAgICAgaGFsb05vZGUuc2hhcGUgPSBzbWFsbEhhbG9TaGFwZTtcclxuICAgICAgICAgIGhhbG9Ob2RlLmZpbGwgPSBHUkVFTl9IQUxPX0ZJTEw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBVdGlscy50b0ZpeGVkTnVtYmVyKCBwb2ludC50aW1lICogMTAwMCwgMCApICUgVElNRV9QRVJfTUFKT1JfRE9UID09PSAwICkge1xyXG4gICAgICAgICAgaGFsb05vZGUuc2hhcGUgPSBsYXJnZUhhbG9TaGFwZTtcclxuICAgICAgICAgIGhhbG9Ob2RlLmZpbGwgPSBZRUxMT1dfSEFMT19GSUxMX0xBUkdFO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGhhbG9Ob2RlLnNoYXBlID0gc21hbGxIYWxvU2hhcGU7XHJcbiAgICAgICAgICBoYWxvTm9kZS5maWxsID0gWUVMTE9XX0hBTE9fRklMTF9TTUFMTDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGltZVJlYWRvdXRQcm9wZXJ0eS5zZXQoIG5vVmFsdWVTdHJpbmcgKTtcclxuICAgICAgICByYW5nZVJlYWRvdXRQcm9wZXJ0eS5zZXQoIG5vVmFsdWVTdHJpbmcgKTtcclxuICAgICAgICBoZWlnaHRSZWFkb3V0UHJvcGVydHkuc2V0KCBub1ZhbHVlU3RyaW5nICk7XHJcbiAgICAgICAgaGFsb05vZGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gZnVuY3Rpb24gYWxpZ24gcG9zaXRpb25zLCBhbmQgdXBkYXRlIG1vZGVsLlxyXG4gICAgY29uc3QgdXBkYXRlUG9zaXRpb24gPSAoIHBvc2l0aW9uOiBWZWN0b3IyICkgPT4ge1xyXG4gICAgICB0aGlzLnByb2JlT3JpZ2luLnNldCggdHJhbnNmb3JtUHJvcGVydHkuZ2V0KCkubW9kZWxUb1ZpZXdQb3NpdGlvbiggcG9zaXRpb24gKSApO1xyXG5cclxuICAgICAgY3Jvc3NoYWlyLmNlbnRlciA9IHRoaXMucHJvYmVPcmlnaW47XHJcbiAgICAgIGNpcmNsZS5jZW50ZXIgPSB0aGlzLnByb2JlT3JpZ2luO1xyXG4gICAgICBjcm9zc2hhaXJNb3VudC5sZWZ0ID0gdGhpcy5wcm9iZU9yaWdpbi54ICsgQ0lSQ0xFX0FST1VORF9DUk9TU0hBSVJfUkFESVVTO1xyXG4gICAgICBjcm9zc2hhaXJNb3VudC5jZW50ZXJZID0gdGhpcy5wcm9iZU9yaWdpbi55O1xyXG4gICAgICByZWN0YW5nbGUubGVmdCA9IGNyb3NzaGFpck1vdW50LnJpZ2h0O1xyXG4gICAgICByZWN0YW5nbGUuY2VudGVyWSA9IHRoaXMucHJvYmVPcmlnaW4ueTtcclxuICAgICAgdGV4dEJveC5sZWZ0ID0gcmVjdGFuZ2xlLmxlZnQgKyAyICogU1BBQ0lORztcclxuICAgICAgdGV4dEJveC50b3AgPSByZWN0YW5nbGUudG9wICsgMiAqIFNQQUNJTkc7XHJcblxyXG4gICAgICBjb25zdCBkYXRhUG9pbnQgPSBkYXRhUHJvYmUuZGF0YVBvaW50UHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIGlmICggZGF0YVBvaW50ICkge1xyXG4gICAgICAgIGhhbG9Ob2RlLmNlbnRlclggPSB0cmFuc2Zvcm1Qcm9wZXJ0eS5nZXQoKS5tb2RlbFRvVmlld1goIGRhdGFQb2ludC5wb3NpdGlvbi54ICk7XHJcbiAgICAgICAgaGFsb05vZGUuY2VudGVyWSA9IHRyYW5zZm9ybVByb3BlcnR5LmdldCgpLm1vZGVsVG9WaWV3WSggZGF0YVBvaW50LnBvc2l0aW9uLnkgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBPYnNlcnZlIGNoYW5nZXMgaW4gdGhlIG1vZGVsVmlld1RyYW5zZm9ybSBhbmQgdXBkYXRlL2FkanVzdCBwb3NpdGlvbnMgYWNjb3JkaW5nbHlcclxuICAgIHRyYW5zZm9ybVByb3BlcnR5LmxpbmsoIHRyYW5zZm9ybSA9PiB7XHJcbiAgICAgIGRyYWdCb3VuZHNQcm9wZXJ0eS52YWx1ZSA9IHRyYW5zZm9ybS52aWV3VG9Nb2RlbEJvdW5kcyggc2NyZWVuVmlldy52aXNpYmxlQm91bmRzUHJvcGVydHkuZ2V0KCkuc2hpZnRlZFgoIGRyYWdCb3VuZHNTaGlmdCApICk7XHJcbiAgICAgIHVwZGF0ZVBvc2l0aW9uKCBkYXRhUHJvYmUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIE9ic2VydmUgY2hhbmdlcyBpbiB0aGUgdmlzaWJsZSBib3VuZHMgYW5kIHVwZGF0ZSBkcmFnIGJvdW5kcyBhbmQgYWRqdXN0IHBvc2l0aW9ucyBhY2NvcmRpbmdseVxyXG4gICAgc2NyZWVuVmlldy52aXNpYmxlQm91bmRzUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHkudmFsdWUgPSB0cmFuc2Zvcm1Qcm9wZXJ0eS5nZXQoKS52aWV3VG9Nb2RlbEJvdW5kcyggc2NyZWVuVmlldy52aXNpYmxlQm91bmRzUHJvcGVydHkuZ2V0KCkuc2hpZnRlZFgoIGRyYWdCb3VuZHNTaGlmdCApICk7XHJcbiAgICAgIHVwZGF0ZVBvc2l0aW9uKCBkYXRhUHJvYmUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIExpc3RlbiBmb3IgcG9zaXRpb24gY2hhbmdlcywgYWxpZ24gcG9zaXRpb25zLCBhbmQgdXBkYXRlIG1vZGVsLlxyXG4gICAgZGF0YVByb2JlLnBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xyXG4gICAgICB1cGRhdGVQb3NpdGlvbiggcG9zaXRpb24gKTtcclxuICAgICAgdGhpcy5kYXRhUHJvYmUudXBkYXRlRGF0YSgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFJlbmRlcmluZyBvcmRlclxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY2hpbGRyZW4sICd0aGlzIHR5cGUgc2V0cyBpdHMgb3duIGNoaWxkcmVuJyApO1xyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFtcclxuICAgICAgaGFsb05vZGUsXHJcbiAgICAgIGNyb3NzaGFpck1vdW50LFxyXG4gICAgICByZWN0YW5nbGUsXHJcbiAgICAgIGNpcmNsZSxcclxuICAgICAgY3Jvc3NoYWlyLFxyXG4gICAgICB0ZXh0Qm94XHJcbiAgICBdO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gV2hlbiBkcmFnZ2luZywgbW92ZSB0aGUgZGF0YVByb2JlIHRvb2xcclxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5kcmFnTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyB2aXNpYmlsaXR5IG9mIHRoZSBkYXRhUHJvYmVcclxuICAgIGRhdGFQcm9iZS5pc0FjdGl2ZVByb3BlcnR5LmxpbmsoIGFjdGl2ZSA9PiB7XHJcbiAgICAgIHRoaXMudmlzaWJsZSA9IGFjdGl2ZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBEYXRhUHJvYmVOb2RlIGxhc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbSwgc28gbGlua3MgZG9uJ3QgbmVlZCB0byBiZSBkaXNwb3NlZC5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgYm91bmRzIG9mIGp1c3QgdGhlIGRhdGFQcm9iZSwgZXhjbHVkaW5nIHRoZSBoYWxvIG5vZGVcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0SnVzdERhdGFQcm9iZUJvdW5kcygpOiBCb3VuZHMyIHtcclxuICAgIGNvbnN0IGRhdGFQcm9iZUJvdW5kcyA9IEJvdW5kczIucG9pbnQoIHRoaXMucHJvYmVPcmlnaW4ueCwgdGhpcy5wcm9iZU9yaWdpbi55ICk7XHJcblxyXG4gICAgLy8gaW5jbHVkZSBldmVyeSBjaGlsZCBleGNlcHQgZm9yIHRoZSBoYWxvIGluIHRoZSBjYWxjdWxhdGlvbnMgb2YgZGF0YVByb2JlIGJvdW5kc1xyXG4gICAgZm9yICggbGV0IGkgPSAxOyBpIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgZGF0YVByb2JlQm91bmRzLmluY2x1ZGVCb3VuZHMoIHRoaXMuZ2xvYmFsVG9QYXJlbnRCb3VuZHMoIHRoaXMuY2hpbGRyZW5bIGkgXS5nZXRHbG9iYWxCb3VuZHMoKSApICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGF0YVByb2JlQm91bmRzO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBpY29uIG9mIERhdGFQcm9iZSBub2RlXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVJY29uKCB0YW5kZW06IFRhbmRlbSApOiBOb2RlIHtcclxuICAgIGNvbnN0IHJlY3RhbmdsZSA9IG5ldyBSZWN0YW5nbGUoXHJcbiAgICAgIDAsXHJcbiAgICAgIDAsXHJcbiAgICAgIERBVEFfUFJPQkVfQ09OVEVOVF9XSURUSCxcclxuICAgICAgOTUsIHtcclxuICAgICAgICBjb3JuZXJSYWRpdXM6IDgsXHJcbiAgICAgICAgZmlsbDogT1BBUVVFX0JMVUUsXHJcbiAgICAgICAgc3Ryb2tlOiAnZ3JheScsXHJcbiAgICAgICAgbGluZVdpZHRoOiA0LFxyXG4gICAgICAgIG9wYWNpdHk6IDAuOCxcclxuICAgICAgICBjdXJzb3I6ICdwb2ludGVyJ1xyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIGNyb3NzaGFpciB2aWV3XHJcbiAgICBjb25zdCBjcm9zc2hhaXJTaGFwZSA9IG5ldyBTaGFwZSgpXHJcbiAgICAgIC5tb3ZlVG8oIC1DSVJDTEVfQVJPVU5EX0NST1NTSEFJUl9SQURJVVMsIDAgKVxyXG4gICAgICAubGluZVRvKCBDSVJDTEVfQVJPVU5EX0NST1NTSEFJUl9SQURJVVMsIDAgKVxyXG4gICAgICAubW92ZVRvKCAwLCAtQ0lSQ0xFX0FST1VORF9DUk9TU0hBSVJfUkFESVVTIClcclxuICAgICAgLmxpbmVUbyggMCwgQ0lSQ0xFX0FST1VORF9DUk9TU0hBSVJfUkFESVVTICk7XHJcblxyXG4gICAgY29uc3QgY3Jvc3NoYWlyID0gbmV3IFBhdGgoIGNyb3NzaGFpclNoYXBlLCB7IHN0cm9rZTogJ2JsYWNrJyB9ICk7XHJcbiAgICBjb25zdCBjaXJjbGUgPSBuZXcgQ2lyY2xlKCBDSVJDTEVfQVJPVU5EX0NST1NTSEFJUl9SQURJVVMsIHtcclxuICAgICAgbGluZVdpZHRoOiAyLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGZpbGw6IFRSQU5TUEFSRU5UX1dISVRFXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBiYXNlIG9mIHRoZSBjcm9zc2hhaXJcclxuICAgIGNvbnN0IGNyb3NzaGFpck1vdW50ID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMC40ICogQ0lSQ0xFX0FST1VORF9DUk9TU0hBSVJfUkFESVVTLCAwLjQgKiBDSVJDTEVfQVJPVU5EX0NST1NTSEFJUl9SQURJVVMsIHsgZmlsbDogJ2dyYXknIH0gKTtcclxuICAgIGNvbnN0IHRpbWVCb3ggPSBjcmVhdGVJbmZvcm1hdGlvbkJveCggREFUQV9QUk9CRV9DT05URU5UX1dJRFRILCB0aW1lU3RyaW5nLCBuZXcgUHJvcGVydHkoIG5vVmFsdWVTdHJpbmcgKSApO1xyXG4gICAgY29uc3QgcmFuZ2VCb3ggPSBjcmVhdGVJbmZvcm1hdGlvbkJveCggREFUQV9QUk9CRV9DT05URU5UX1dJRFRILCByYW5nZVN0cmluZywgbmV3IFByb3BlcnR5KCBub1ZhbHVlU3RyaW5nICkgKTtcclxuICAgIGNvbnN0IGhlaWdodEJveCA9IGNyZWF0ZUluZm9ybWF0aW9uQm94KCBEQVRBX1BST0JFX0NPTlRFTlRfV0lEVEgsIGhlaWdodFN0cmluZywgbmV3IFByb3BlcnR5KCBub1ZhbHVlU3RyaW5nICkgKTtcclxuXHJcbiAgICBjb25zdCB0ZXh0Qm94ID0gbmV3IFZCb3goIHtcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgc3BhY2luZzogU1BBQ0lORyxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICB0aW1lQm94LFxyXG4gICAgICAgIHJhbmdlQm94LFxyXG4gICAgICAgIGhlaWdodEJveFxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcHJvYmVPcmlnaW4gPSBWZWN0b3IyLnBvb2wuY3JlYXRlKCAwLCAwICk7XHJcblxyXG4gICAgY3Jvc3NoYWlyLmNlbnRlciA9IHByb2JlT3JpZ2luO1xyXG4gICAgY2lyY2xlLmNlbnRlciA9IHByb2JlT3JpZ2luO1xyXG4gICAgY3Jvc3NoYWlyTW91bnQubGVmdCA9IHByb2JlT3JpZ2luLnggKyBDSVJDTEVfQVJPVU5EX0NST1NTSEFJUl9SQURJVVM7XHJcbiAgICBjcm9zc2hhaXJNb3VudC5jZW50ZXJZID0gcHJvYmVPcmlnaW4ueTtcclxuICAgIHJlY3RhbmdsZS5sZWZ0ID0gY3Jvc3NoYWlyTW91bnQucmlnaHQ7XHJcbiAgICByZWN0YW5nbGUuY2VudGVyWSA9IHByb2JlT3JpZ2luLnk7XHJcbiAgICB0ZXh0Qm94LmxlZnQgPSByZWN0YW5nbGUubGVmdCArIDIgKiBTUEFDSU5HO1xyXG4gICAgdGV4dEJveC50b3AgPSByZWN0YW5nbGUudG9wICsgMiAqIFNQQUNJTkc7XHJcblxyXG4gICAgcHJvYmVPcmlnaW4uZnJlZVRvUG9vbCgpO1xyXG5cclxuICAgIHJldHVybiBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIGNyb3NzaGFpck1vdW50LFxyXG4gICAgICAgIHJlY3RhbmdsZSxcclxuICAgICAgICBjaXJjbGUsXHJcbiAgICAgICAgY3Jvc3NoYWlyLFxyXG4gICAgICAgIHRleHRCb3hcclxuICAgICAgXSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgaWNvbiBmb3IgdGhlIERhdGFQcm9iZU5vZGUsIHRoaXMgaXMgbm90IGludGVyYWN0aXZlJ1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxucHJvamVjdGlsZU1vdGlvbi5yZWdpc3RlciggJ0RhdGFQcm9iZU5vZGUnLCBEYXRhUHJvYmVOb2RlICk7XHJcblxyXG5cclxuLyoqXHJcbiAqIEF1eGlsaWFyeSBmdW5jdGlvbiB0byBjcmVhdGUgbGFiZWwgYW5kIG51bWJlciByZWFkb3V0IGZvciBpbmZvcm1hdGlvblxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlSW5mb3JtYXRpb25Cb3goIG1heFdpZHRoOiBudW1iZXIsIGxhYmVsU3RyaW5nOiBzdHJpbmcsIHJlYWRvdXRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiApOiBOb2RlIHtcclxuXHJcbiAgLy8gd2lkdGggb2Ygd2hpdGUgcmVjdGFuZ3VsYXIgYmFja2dyb3VuZCwgYWxzbyB1c2VkIGZvciBjYWxjdWxhdGluZyBtYXggd2lkdGhcclxuICBjb25zdCBiYWNrZ3JvdW5kV2lkdGggPSA2MDtcclxuXHJcbiAgLy8gbGFiZWxcclxuICBjb25zdCBsYWJlbFRleHQgPSBuZXcgVGV4dCggbGFiZWxTdHJpbmcsIG1lcmdlKCB7fSwgTEFCRUxfT1BUSU9OUywge1xyXG4gICAgbWF4V2lkdGg6IG1heFdpZHRoIC0gYmFja2dyb3VuZFdpZHRoIC0gMjVcclxuICB9ICkgKTtcclxuXHJcbiAgLy8gbnVtYmVyXHJcbiAgY29uc3QgbnVtYmVyT3B0aW9ucyA9IG1lcmdlKCB7fSwgUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5MQUJFTF9URVhUX09QVElPTlMsIHsgbWF4V2lkdGg6IGJhY2tncm91bmRXaWR0aCAtIDYgfSApO1xyXG4gIGNvbnN0IG51bWJlck5vZGUgPSBuZXcgVGV4dCggcmVhZG91dFByb3BlcnR5LmdldCgpLCBudW1iZXJPcHRpb25zICk7XHJcblxyXG4gIGNvbnN0IGJhY2tncm91bmROb2RlID0gbmV3IFJlY3RhbmdsZShcclxuICAgIDAsXHJcbiAgICAwLFxyXG4gICAgYmFja2dyb3VuZFdpZHRoLFxyXG4gICAgbnVtYmVyTm9kZS5oZWlnaHQgKyAyICogU1BBQ0lORywge1xyXG4gICAgICBjb3JuZXJSYWRpdXM6IDQsXHJcbiAgICAgIGZpbGw6ICd3aGl0ZScsXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbGluZVdpZHRoOiAwLjVcclxuICAgIH1cclxuICApO1xyXG5cclxuICAvLyB1cGRhdGUgdGV4dCByZWFkb3V0IGlmIGluZm9ybWF0aW9uIGNoYW5nZXNcclxuICByZWFkb3V0UHJvcGVydHkubGluayggcmVhZG91dCA9PiB7XHJcbiAgICBudW1iZXJOb2RlLnNldFN0cmluZyggcmVhZG91dCApO1xyXG4gICAgaWYgKCByZWFkb3V0ID09PSBub1ZhbHVlU3RyaW5nICkge1xyXG4gICAgICBudW1iZXJOb2RlLmNlbnRlciA9IGJhY2tncm91bmROb2RlLmNlbnRlcjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBudW1iZXJOb2RlLnJpZ2h0ID0gYmFja2dyb3VuZE5vZGUucmlnaHQgLSBSRUFET1VUX1hfTUFSR0lOO1xyXG4gICAgICBudW1iZXJOb2RlLmNlbnRlclkgPSBiYWNrZ3JvdW5kTm9kZS5jZW50ZXJZO1xyXG4gICAgfVxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgcmVhZG91dFBhcmVudCA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGJhY2tncm91bmROb2RlLCBudW1iZXJOb2RlIF0gfSApO1xyXG5cclxuICBjb25zdCBzcGFjaW5nID0gbWF4V2lkdGggLSBsYWJlbFRleHQud2lkdGggLSByZWFkb3V0UGFyZW50LndpZHRoIC0gNCAqIFNQQUNJTkc7XHJcblxyXG4gIHJldHVybiBuZXcgSEJveCggeyBzcGFjaW5nOiBzcGFjaW5nLCBjaGlsZHJlbjogWyBsYWJlbFRleHQsIHJlYWRvdXRQYXJlbnQgXSB9ICk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IERhdGFQcm9iZU5vZGU7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxTQUFTQyxNQUFNLEVBQUVDLFlBQVksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQWVDLElBQUksRUFBRUMsY0FBYyxFQUFFQyxTQUFTLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5SSxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyx1QkFBdUIsTUFBTSxrQ0FBa0M7QUFDdEUsT0FBT0MseUJBQXlCLE1BQU0saUNBQWlDO0FBTXZFLE9BQU9DLFNBQVMsTUFBNEIsdUNBQXVDO0FBQ25GLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFFbEUsTUFBTUMsWUFBWSxHQUFHSix1QkFBdUIsQ0FBQ0ssTUFBTTtBQUNuRCxNQUFNQyxPQUFPLEdBQUdOLHVCQUF1QixDQUFDTyxDQUFDO0FBQ3pDLE1BQU1DLGtDQUFrQyxHQUFHUix1QkFBdUIsQ0FBQ1MsNEJBQTRCO0FBQy9GLE1BQU1DLFdBQVcsR0FBR1YsdUJBQXVCLENBQUNXLEtBQUs7QUFDakQsTUFBTUMsT0FBTyxHQUFHWix1QkFBdUIsQ0FBQ2EsQ0FBQztBQUN6QyxNQUFNQyxVQUFVLEdBQUdkLHVCQUF1QixDQUFDZSxJQUFJO0FBQy9DLE1BQU1DLGFBQWEsR0FBRzVCLFdBQVcsQ0FBQzZCLFFBQVE7O0FBRTFDO0FBQ0EsTUFBTUMsOEJBQThCLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDM0MsTUFBTUMsV0FBVyxHQUFHLG9CQUFvQjtBQUN4QyxNQUFNQyxpQkFBaUIsR0FBRyw0QkFBNEI7QUFDdEQsTUFBTUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ25CLE1BQU1DLGtCQUFrQixHQUFHckIseUJBQXlCLENBQUNxQixrQkFBa0I7QUFDdkUsTUFBTUMsYUFBYSxHQUFHckMsS0FBSyxDQUFFLENBQUMsQ0FBQyxFQUFFZSx5QkFBeUIsQ0FBQ3VCLGtCQUFrQixFQUFFO0VBQUVDLElBQUksRUFBRTtBQUFRLENBQUUsQ0FBQztBQUNsRyxNQUFNQyxpQkFBaUIsR0FBR3pCLHlCQUF5QixDQUFDMEIsZ0JBQWdCLEdBQUcsQ0FBQztBQUN4RSxNQUFNQyxpQkFBaUIsR0FBRzNCLHlCQUF5QixDQUFDNEIsZ0JBQWdCLEdBQUcsQ0FBQztBQUN4RSxNQUFNQyxpQkFBaUIsR0FBRywwQkFBMEI7QUFDcEQsTUFBTUMsc0JBQXNCLEdBQUcsd0JBQXdCO0FBQ3ZELE1BQU1DLHNCQUFzQixHQUFHLElBQUl0QyxjQUFjLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRWdDLGlCQUFrQixDQUFDLENBQ2xGTyxZQUFZLENBQUUsQ0FBQyxFQUFFLE9BQVEsQ0FBQyxDQUMxQkEsWUFBWSxDQUFFLEdBQUcsRUFBRSxPQUFRLENBQUMsQ0FDNUJBLFlBQVksQ0FBRSxHQUFHLEVBQUVILGlCQUFrQixDQUFDLENBQ3RDRyxZQUFZLENBQUUsR0FBRyxFQUFFSCxpQkFBa0IsQ0FBQyxDQUN0Q0csWUFBWSxDQUFFLENBQUMsRUFBRUYsc0JBQXVCLENBQUM7QUFDNUMsTUFBTUcsc0JBQXNCLEdBQUcsSUFBSXhDLGNBQWMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFa0MsaUJBQWtCLENBQUMsQ0FDbEZLLFlBQVksQ0FBRSxDQUFDLEVBQUUsT0FBUSxDQUFDLENBQzFCQSxZQUFZLENBQUUsR0FBRyxFQUFFLE9BQVEsQ0FBQyxDQUM1QkEsWUFBWSxDQUFFLEdBQUcsRUFBRUgsaUJBQWtCLENBQUMsQ0FDdENHLFlBQVksQ0FBRSxHQUFHLEVBQUVILGlCQUFrQixDQUFDLENBQ3RDRyxZQUFZLENBQUUsQ0FBQyxFQUFFRixzQkFBdUIsQ0FBQztBQUM1QyxNQUFNSSxnQkFBZ0IsR0FBRywwQkFBMEI7QUFDbkQsTUFBTUMscUJBQXFCLEdBQUcsd0JBQXdCO0FBQ3RELE1BQU1DLGVBQWUsR0FBRyxJQUFJM0MsY0FBYyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVnQyxpQkFBa0IsQ0FBQyxDQUMzRU8sWUFBWSxDQUFFLENBQUMsRUFBRSxPQUFRLENBQUMsQ0FDMUJBLFlBQVksQ0FBRSxHQUFHLEVBQUUsT0FBUSxDQUFDLENBQzVCQSxZQUFZLENBQUUsR0FBRyxFQUFFRSxnQkFBaUIsQ0FBQyxDQUNyQ0YsWUFBWSxDQUFFLEdBQUcsRUFBRUUsZ0JBQWlCLENBQUMsQ0FDckNGLFlBQVksQ0FBRSxDQUFDLEVBQUVHLHFCQUFzQixDQUFDO0FBRTNDLE1BQU1FLHdCQUF3QixHQUFHLEdBQUc7QUFDcEMsTUFBTUMsa0JBQWtCLEdBQUcsQ0FBQztBQUM1QixNQUFNQyxnQkFBZ0IsR0FBR3ZDLHlCQUF5QixDQUFDd0MsdUJBQXVCLENBQUNDLGNBQWM7QUFLekYsTUFBTUMsYUFBYSxTQUFTbkQsSUFBSSxDQUFDO0VBQytCOztFQUV2QjtFQUV2QztFQUlPb0QsV0FBV0EsQ0FBRUMsU0FBb0IsRUFBRUMsaUJBQXlELEVBQUVDLFVBQXNCLEVBQUVDLGVBQXNDLEVBQUc7SUFFcEssTUFBTUMsT0FBTyxHQUFHL0MsU0FBUyxDQUFpRCxDQUFDLENBQUU7TUFDM0VnRCxNQUFNLEVBQUUsU0FBUztNQUNqQkMsTUFBTSxFQUFFckQsTUFBTSxDQUFDc0Q7SUFDakIsQ0FBQyxFQUFFSixlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBQyxDQUFDO0lBQ1AsSUFBSSxDQUFDSyx3QkFBd0IsR0FBRyxJQUFJekUsZUFBZSxDQUFFLEtBQU0sQ0FBQztJQUU1RCxJQUFJLENBQUNpRSxTQUFTLEdBQUdBLFNBQVMsQ0FBQyxDQUFDO0lBQzVCLElBQUksQ0FBQ1MsV0FBVyxHQUFHdEUsT0FBTyxDQUFDdUUsSUFBSSxDQUFDQyxNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQzs7SUFFOUM7SUFDQSxNQUFNQyxTQUFTLEdBQUcsSUFBSTlELFNBQVMsQ0FDN0IsQ0FBQyxFQUNELENBQUMsRUFDRDJDLHdCQUF3QixHQUFHQyxrQkFBa0IsRUFDN0MsRUFBRSxFQUFFO01BQ0ZtQixZQUFZLEVBQUUsQ0FBQztNQUNmakMsSUFBSSxFQUFFTixXQUFXO01BQ2pCd0MsTUFBTSxFQUFFLE1BQU07TUFDZEMsU0FBUyxFQUFFLENBQUM7TUFDWkMsT0FBTyxFQUFFO0lBQ1gsQ0FDRixDQUFDO0lBRUQsSUFBSSxDQUFDSixTQUFTLEdBQUdBLFNBQVM7SUFFMUJBLFNBQVMsQ0FBQ0ssWUFBWSxDQUFFTCxTQUFTLENBQUNNLE1BQU0sQ0FBQ0MsU0FBUyxDQUFFLEVBQUUsRUFBRSxDQUFFLENBQUUsQ0FBQztJQUM3RFAsU0FBUyxDQUFDUSxZQUFZLENBQUVSLFNBQVMsQ0FBQ00sTUFBTSxDQUFDQyxTQUFTLENBQUUsRUFBRSxFQUFFLENBQUUsQ0FBRSxDQUFDOztJQUU3RDtJQUNBO0lBQ0EsTUFBTUUsZUFBZSxHQUFHLENBQUM1Qix3QkFBd0IsR0FBRyxDQUFDLEdBQUdDLGtCQUFrQjs7SUFFMUU7SUFDQSxNQUFNNEIsY0FBYyxHQUFHLElBQUlsRixLQUFLLENBQUMsQ0FBQyxDQUMvQm1GLE1BQU0sQ0FBRSxDQUFDbEQsOEJBQThCLEVBQUUsQ0FBRSxDQUFDLENBQzVDbUQsTUFBTSxDQUFFbkQsOEJBQThCLEVBQUUsQ0FBRSxDQUFDLENBQzNDa0QsTUFBTSxDQUFFLENBQUMsRUFBRSxDQUFDbEQsOEJBQStCLENBQUMsQ0FDNUNtRCxNQUFNLENBQUUsQ0FBQyxFQUFFbkQsOEJBQStCLENBQUM7SUFFOUMsTUFBTW9ELFNBQVMsR0FBRyxJQUFJN0UsSUFBSSxDQUFFMEUsY0FBYyxFQUFFO01BQUVSLE1BQU0sRUFBRTtJQUFRLENBQUUsQ0FBQztJQUNqRSxNQUFNWSxNQUFNLEdBQUcsSUFBSWxGLE1BQU0sQ0FBRTZCLDhCQUE4QixFQUFFO01BQ3pEMEMsU0FBUyxFQUFFLENBQUM7TUFDWkQsTUFBTSxFQUFFLE9BQU87TUFDZmxDLElBQUksRUFBRUw7SUFDUixDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNb0QsY0FBYyxHQUFHLElBQUk3RSxTQUFTLENBQ2xDLENBQUMsRUFDRCxDQUFDLEVBQ0QsR0FBRyxHQUFHdUIsOEJBQThCLEVBQ3BDLEdBQUcsR0FBR0EsOEJBQThCLEVBQ3BDO01BQUVPLElBQUksRUFBRTtJQUFPLENBQ2pCLENBQUM7SUFFRCxNQUFNZ0Qsa0JBQWtCLEdBQUcsSUFBSTVGLFFBQVEsQ0FBRWtFLFVBQVUsQ0FBQzJCLHFCQUFxQixDQUFDQyxHQUFHLENBQUMsQ0FBQyxDQUFDQyxRQUFRLENBQUVWLGVBQWdCLENBQUUsQ0FBQztJQUU3RyxJQUFJLENBQUNXLFlBQVksR0FBRyxJQUFJdkYsWUFBWSxDQUFFO01BQ3BDd0YsZ0JBQWdCLEVBQUVqQyxTQUFTLENBQUNpQyxnQkFBZ0I7TUFDNUNDLFNBQVMsRUFBRWpDLGlCQUFpQjtNQUM1QjJCLGtCQUFrQixFQUFFQSxrQkFBa0I7TUFDdENPLGVBQWUsRUFBRSxJQUFJO01BQ3JCQyxLQUFLLEVBQUVBLENBQUEsS0FBTSxJQUFJLENBQUM1Qix3QkFBd0IsQ0FBQzZCLEdBQUcsQ0FBRSxJQUFLLENBQUM7TUFDdERDLEdBQUcsRUFBRUEsQ0FBQSxLQUFNLElBQUksQ0FBQzlCLHdCQUF3QixDQUFDNkIsR0FBRyxDQUFFLEtBQU0sQ0FBQztNQUNyRC9CLE1BQU0sRUFBRUYsT0FBTyxDQUFDRSxNQUFNLENBQUNpQyxZQUFZLENBQUUsY0FBZTtJQUN0RCxDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNQyxtQkFBbUIsR0FBRyxJQUFJbEYsY0FBYyxDQUFFYSxhQUFjLENBQUM7SUFDL0QsTUFBTXNFLG9CQUFvQixHQUFHLElBQUluRixjQUFjLENBQUVhLGFBQWMsQ0FBQztJQUNoRSxNQUFNdUUscUJBQXFCLEdBQUcsSUFBSXBGLGNBQWMsQ0FBRWEsYUFBYyxDQUFDO0lBRWpFLE1BQU13RSxPQUFPLEdBQUdDLG9CQUFvQixDQUFFbkQsd0JBQXdCLEVBQUV4QixVQUFVLEVBQUV1RSxtQkFBb0IsQ0FBQztJQUNqRyxNQUFNSyxRQUFRLEdBQUdELG9CQUFvQixDQUFFbkQsd0JBQXdCLEVBQUU1QixXQUFXLEVBQUU0RSxvQkFBcUIsQ0FBQztJQUNwRyxNQUFNSyxTQUFTLEdBQUdGLG9CQUFvQixDQUFFbkQsd0JBQXdCLEVBQUVsQyxZQUFZLEVBQUVtRixxQkFBc0IsQ0FBQztJQUV2RyxNQUFNSyxPQUFPLEdBQUcsSUFBSS9GLElBQUksQ0FBRTtNQUN4QmdHLEtBQUssRUFBRSxNQUFNO01BQ2JDLE9BQU8sRUFBRXpFLE9BQU87TUFDaEIwRSxRQUFRLEVBQUUsQ0FDUlAsT0FBTyxFQUNQRSxRQUFRLEVBQ1JDLFNBQVM7SUFFYixDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNSyxjQUFjLEdBQUcvRyxLQUFLLENBQUNzRixNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTdDLGlCQUFrQixDQUFDO0lBQzlELE1BQU11RSxjQUFjLEdBQUdoSCxLQUFLLENBQUNzRixNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTNDLGlCQUFrQixDQUFDO0lBQzlELE1BQU1zRSxRQUFRLEdBQUcsSUFBSXpHLElBQUksQ0FBRXVHLGNBQWMsRUFBRTtNQUFFRyxRQUFRLEVBQUU7SUFBTSxDQUFFLENBQUM7O0lBRWhFO0lBQ0F0RCxTQUFTLENBQUN1RCxpQkFBaUIsQ0FBQ0MsSUFBSSxDQUFFQyxLQUFLLElBQUk7TUFDekMsSUFBS0EsS0FBSyxLQUFLLElBQUksRUFBRztRQUNwQmpCLG1CQUFtQixDQUFDSCxHQUFHLENBQUUvRixXQUFXLENBQUNvSCxNQUFNLENBQUUvRixrQ0FBa0MsRUFBRTtVQUMvRWdHLEtBQUssRUFBRXpILEtBQUssQ0FBQzBILGFBQWEsQ0FBRUgsS0FBSyxDQUFDdkYsSUFBSSxFQUFFLENBQUUsQ0FBQztVQUMzQzJGLEtBQUssRUFBRTlGO1FBQ1QsQ0FBRSxDQUFFLENBQUM7UUFDTDBFLG9CQUFvQixDQUFDSixHQUFHLENBQUUvRixXQUFXLENBQUNvSCxNQUFNLENBQUUvRixrQ0FBa0MsRUFBRTtVQUNoRmdHLEtBQUssRUFBRXpILEtBQUssQ0FBQzBILGFBQWEsQ0FBRUgsS0FBSyxDQUFDSyxRQUFRLENBQUNDLENBQUMsRUFBRSxDQUFFLENBQUM7VUFDakRGLEtBQUssRUFBRXBHO1FBQ1QsQ0FBRSxDQUFFLENBQUM7UUFDTGlGLHFCQUFxQixDQUFDTCxHQUFHLENBQUUvRixXQUFXLENBQUNvSCxNQUFNLENBQUUvRixrQ0FBa0MsRUFBRTtVQUNqRmdHLEtBQUssRUFBRXpILEtBQUssQ0FBQzBILGFBQWEsQ0FBRUgsS0FBSyxDQUFDSyxRQUFRLENBQUNFLENBQUMsRUFBRSxDQUFFLENBQUM7VUFDakRILEtBQUssRUFBRXBHO1FBQ1QsQ0FBRSxDQUFFLENBQUM7UUFDTDRGLFFBQVEsQ0FBQ1ksT0FBTyxHQUFHaEUsaUJBQWlCLENBQUM2QixHQUFHLENBQUMsQ0FBQyxDQUFDb0MsWUFBWSxDQUFFVCxLQUFLLENBQUNLLFFBQVEsQ0FBQ0MsQ0FBRSxDQUFDO1FBQzNFVixRQUFRLENBQUNjLE9BQU8sR0FBR2xFLGlCQUFpQixDQUFDNkIsR0FBRyxDQUFDLENBQUMsQ0FBQ3NDLFlBQVksQ0FBRVgsS0FBSyxDQUFDSyxRQUFRLENBQUNFLENBQUUsQ0FBQztRQUMzRVgsUUFBUSxDQUFDZ0IsT0FBTyxHQUFHLElBQUk7UUFDdkJoQixRQUFRLENBQUNpQixLQUFLLEdBQUcsSUFBSTtRQUNyQixJQUFLYixLQUFLLENBQUNjLElBQUksRUFBRztVQUNoQmxCLFFBQVEsQ0FBQ2lCLEtBQUssR0FBR25CLGNBQWM7VUFDL0JFLFFBQVEsQ0FBQ3pFLElBQUksR0FBR1ksZUFBZTtRQUNqQyxDQUFDLE1BQ0ksSUFBS3RELEtBQUssQ0FBQzBILGFBQWEsQ0FBRUgsS0FBSyxDQUFDdkYsSUFBSSxHQUFHLElBQUksRUFBRSxDQUFFLENBQUMsR0FBR08sa0JBQWtCLEtBQUssQ0FBQyxFQUFHO1VBQ2pGNEUsUUFBUSxDQUFDaUIsS0FBSyxHQUFHbEIsY0FBYztVQUMvQkMsUUFBUSxDQUFDekUsSUFBSSxHQUFHUyxzQkFBc0I7UUFDeEMsQ0FBQyxNQUNJO1VBQ0hnRSxRQUFRLENBQUNpQixLQUFLLEdBQUduQixjQUFjO1VBQy9CRSxRQUFRLENBQUN6RSxJQUFJLEdBQUdPLHNCQUFzQjtRQUN4QztNQUNGLENBQUMsTUFDSTtRQUNIcUQsbUJBQW1CLENBQUNILEdBQUcsQ0FBRWxFLGFBQWMsQ0FBQztRQUN4Q3NFLG9CQUFvQixDQUFDSixHQUFHLENBQUVsRSxhQUFjLENBQUM7UUFDekN1RSxxQkFBcUIsQ0FBQ0wsR0FBRyxDQUFFbEUsYUFBYyxDQUFDO1FBQzFDa0YsUUFBUSxDQUFDZ0IsT0FBTyxHQUFHLEtBQUs7TUFDMUI7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNRyxjQUFjLEdBQUtWLFFBQWlCLElBQU07TUFDOUMsSUFBSSxDQUFDckQsV0FBVyxDQUFDNEIsR0FBRyxDQUFFcEMsaUJBQWlCLENBQUM2QixHQUFHLENBQUMsQ0FBQyxDQUFDMkMsbUJBQW1CLENBQUVYLFFBQVMsQ0FBRSxDQUFDO01BRS9FckMsU0FBUyxDQUFDaUQsTUFBTSxHQUFHLElBQUksQ0FBQ2pFLFdBQVc7TUFDbkNpQixNQUFNLENBQUNnRCxNQUFNLEdBQUcsSUFBSSxDQUFDakUsV0FBVztNQUNoQ2tCLGNBQWMsQ0FBQ2dELElBQUksR0FBRyxJQUFJLENBQUNsRSxXQUFXLENBQUNzRCxDQUFDLEdBQUcxRiw4QkFBOEI7TUFDekVzRCxjQUFjLENBQUN3QyxPQUFPLEdBQUcsSUFBSSxDQUFDMUQsV0FBVyxDQUFDdUQsQ0FBQztNQUMzQ3BELFNBQVMsQ0FBQytELElBQUksR0FBR2hELGNBQWMsQ0FBQ2lELEtBQUs7TUFDckNoRSxTQUFTLENBQUN1RCxPQUFPLEdBQUcsSUFBSSxDQUFDMUQsV0FBVyxDQUFDdUQsQ0FBQztNQUN0Q2pCLE9BQU8sQ0FBQzRCLElBQUksR0FBRy9ELFNBQVMsQ0FBQytELElBQUksR0FBRyxDQUFDLEdBQUduRyxPQUFPO01BQzNDdUUsT0FBTyxDQUFDOEIsR0FBRyxHQUFHakUsU0FBUyxDQUFDaUUsR0FBRyxHQUFHLENBQUMsR0FBR3JHLE9BQU87TUFFekMsTUFBTXNHLFNBQVMsR0FBRzlFLFNBQVMsQ0FBQ3VELGlCQUFpQixDQUFDekIsR0FBRyxDQUFDLENBQUM7TUFDbkQsSUFBS2dELFNBQVMsRUFBRztRQUNmekIsUUFBUSxDQUFDWSxPQUFPLEdBQUdoRSxpQkFBaUIsQ0FBQzZCLEdBQUcsQ0FBQyxDQUFDLENBQUNvQyxZQUFZLENBQUVZLFNBQVMsQ0FBQ2hCLFFBQVEsQ0FBQ0MsQ0FBRSxDQUFDO1FBQy9FVixRQUFRLENBQUNjLE9BQU8sR0FBR2xFLGlCQUFpQixDQUFDNkIsR0FBRyxDQUFDLENBQUMsQ0FBQ3NDLFlBQVksQ0FBRVUsU0FBUyxDQUFDaEIsUUFBUSxDQUFDRSxDQUFFLENBQUM7TUFDakY7SUFDRixDQUFDOztJQUVEO0lBQ0EvRCxpQkFBaUIsQ0FBQ3VELElBQUksQ0FBRXRCLFNBQVMsSUFBSTtNQUNuQ04sa0JBQWtCLENBQUMrQixLQUFLLEdBQUd6QixTQUFTLENBQUM2QyxpQkFBaUIsQ0FBRTdFLFVBQVUsQ0FBQzJCLHFCQUFxQixDQUFDQyxHQUFHLENBQUMsQ0FBQyxDQUFDQyxRQUFRLENBQUVWLGVBQWdCLENBQUUsQ0FBQztNQUM1SG1ELGNBQWMsQ0FBRXhFLFNBQVMsQ0FBQ2lDLGdCQUFnQixDQUFDSCxHQUFHLENBQUMsQ0FBRSxDQUFDO0lBQ3BELENBQUUsQ0FBQzs7SUFFSDtJQUNBNUIsVUFBVSxDQUFDMkIscUJBQXFCLENBQUMyQixJQUFJLENBQUUsTUFBTTtNQUMzQzVCLGtCQUFrQixDQUFDK0IsS0FBSyxHQUFHMUQsaUJBQWlCLENBQUM2QixHQUFHLENBQUMsQ0FBQyxDQUFDaUQsaUJBQWlCLENBQUU3RSxVQUFVLENBQUMyQixxQkFBcUIsQ0FBQ0MsR0FBRyxDQUFDLENBQUMsQ0FBQ0MsUUFBUSxDQUFFVixlQUFnQixDQUFFLENBQUM7TUFDMUltRCxjQUFjLENBQUV4RSxTQUFTLENBQUNpQyxnQkFBZ0IsQ0FBQ0gsR0FBRyxDQUFDLENBQUUsQ0FBQztJQUNwRCxDQUFFLENBQUM7O0lBRUg7SUFDQTlCLFNBQVMsQ0FBQ2lDLGdCQUFnQixDQUFDdUIsSUFBSSxDQUFFTSxRQUFRLElBQUk7TUFDM0NVLGNBQWMsQ0FBRVYsUUFBUyxDQUFDO01BQzFCLElBQUksQ0FBQzlELFNBQVMsQ0FBQ2dGLFVBQVUsQ0FBQyxDQUFDO0lBQzdCLENBQUUsQ0FBQzs7SUFFSDtJQUNBQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDN0UsT0FBTyxDQUFDOEMsUUFBUSxFQUFFLGlDQUFrQyxDQUFDO0lBQ3hFOUMsT0FBTyxDQUFDOEMsUUFBUSxHQUFHLENBQ2pCRyxRQUFRLEVBQ1IxQixjQUFjLEVBQ2RmLFNBQVMsRUFDVGMsTUFBTSxFQUNORCxTQUFTLEVBQ1RzQixPQUFPLENBQ1I7SUFFRCxJQUFJLENBQUNtQyxNQUFNLENBQUU5RSxPQUFRLENBQUM7O0lBRXRCO0lBQ0EsSUFBSSxDQUFDK0UsZ0JBQWdCLENBQUUsSUFBSSxDQUFDbkQsWUFBYSxDQUFDOztJQUUxQztJQUNBaEMsU0FBUyxDQUFDb0YsZ0JBQWdCLENBQUM1QixJQUFJLENBQUU2QixNQUFNLElBQUk7TUFDekMsSUFBSSxDQUFDaEIsT0FBTyxHQUFHZ0IsTUFBTTtJQUN2QixDQUFFLENBQUM7O0lBRUg7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7RUFDU0Msc0JBQXNCQSxDQUFBLEVBQVk7SUFDdkMsTUFBTUMsZUFBZSxHQUFHdEosT0FBTyxDQUFDd0gsS0FBSyxDQUFFLElBQUksQ0FBQ2hELFdBQVcsQ0FBQ3NELENBQUMsRUFBRSxJQUFJLENBQUN0RCxXQUFXLENBQUN1RCxDQUFFLENBQUM7O0lBRS9FO0lBQ0EsS0FBTSxJQUFJd0IsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ3RDLFFBQVEsQ0FBQ3VDLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUc7TUFDL0NELGVBQWUsQ0FBQ0csYUFBYSxDQUFFLElBQUksQ0FBQ0Msb0JBQW9CLENBQUUsSUFBSSxDQUFDekMsUUFBUSxDQUFFc0MsQ0FBQyxDQUFFLENBQUNJLGVBQWUsQ0FBQyxDQUFFLENBQUUsQ0FBQztJQUNwRztJQUNBLE9BQU9MLGVBQWU7RUFDeEI7O0VBR0E7QUFDRjtBQUNBO0VBQ0UsT0FBY00sVUFBVUEsQ0FBRXZGLE1BQWMsRUFBUztJQUMvQyxNQUFNTSxTQUFTLEdBQUcsSUFBSTlELFNBQVMsQ0FDN0IsQ0FBQyxFQUNELENBQUMsRUFDRDJDLHdCQUF3QixFQUN4QixFQUFFLEVBQUU7TUFDRm9CLFlBQVksRUFBRSxDQUFDO01BQ2ZqQyxJQUFJLEVBQUVOLFdBQVc7TUFDakJ3QyxNQUFNLEVBQUUsTUFBTTtNQUNkQyxTQUFTLEVBQUUsQ0FBQztNQUNaQyxPQUFPLEVBQUUsR0FBRztNQUNaWCxNQUFNLEVBQUU7SUFDVixDQUNGLENBQUM7O0lBRUQ7SUFDQSxNQUFNaUIsY0FBYyxHQUFHLElBQUlsRixLQUFLLENBQUMsQ0FBQyxDQUMvQm1GLE1BQU0sQ0FBRSxDQUFDbEQsOEJBQThCLEVBQUUsQ0FBRSxDQUFDLENBQzVDbUQsTUFBTSxDQUFFbkQsOEJBQThCLEVBQUUsQ0FBRSxDQUFDLENBQzNDa0QsTUFBTSxDQUFFLENBQUMsRUFBRSxDQUFDbEQsOEJBQStCLENBQUMsQ0FDNUNtRCxNQUFNLENBQUUsQ0FBQyxFQUFFbkQsOEJBQStCLENBQUM7SUFFOUMsTUFBTW9ELFNBQVMsR0FBRyxJQUFJN0UsSUFBSSxDQUFFMEUsY0FBYyxFQUFFO01BQUVSLE1BQU0sRUFBRTtJQUFRLENBQUUsQ0FBQztJQUNqRSxNQUFNWSxNQUFNLEdBQUcsSUFBSWxGLE1BQU0sQ0FBRTZCLDhCQUE4QixFQUFFO01BQ3pEMEMsU0FBUyxFQUFFLENBQUM7TUFDWkQsTUFBTSxFQUFFLE9BQU87TUFDZmxDLElBQUksRUFBRUw7SUFDUixDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNb0QsY0FBYyxHQUFHLElBQUk3RSxTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUd1Qiw4QkFBOEIsRUFBRSxHQUFHLEdBQUdBLDhCQUE4QixFQUFFO01BQUVPLElBQUksRUFBRTtJQUFPLENBQUUsQ0FBQztJQUMxSSxNQUFNK0QsT0FBTyxHQUFHQyxvQkFBb0IsQ0FBRW5ELHdCQUF3QixFQUFFeEIsVUFBVSxFQUFFLElBQUlqQyxRQUFRLENBQUVtQyxhQUFjLENBQUUsQ0FBQztJQUMzRyxNQUFNMEUsUUFBUSxHQUFHRCxvQkFBb0IsQ0FBRW5ELHdCQUF3QixFQUFFNUIsV0FBVyxFQUFFLElBQUk3QixRQUFRLENBQUVtQyxhQUFjLENBQUUsQ0FBQztJQUM3RyxNQUFNMkUsU0FBUyxHQUFHRixvQkFBb0IsQ0FBRW5ELHdCQUF3QixFQUFFbEMsWUFBWSxFQUFFLElBQUl2QixRQUFRLENBQUVtQyxhQUFjLENBQUUsQ0FBQztJQUUvRyxNQUFNNEUsT0FBTyxHQUFHLElBQUkvRixJQUFJLENBQUU7TUFDeEJnRyxLQUFLLEVBQUUsTUFBTTtNQUNiQyxPQUFPLEVBQUV6RSxPQUFPO01BQ2hCMEUsUUFBUSxFQUFFLENBQ1JQLE9BQU8sRUFDUEUsUUFBUSxFQUNSQyxTQUFTO0lBRWIsQ0FBRSxDQUFDO0lBRUgsTUFBTXJDLFdBQVcsR0FBR3RFLE9BQU8sQ0FBQ3VFLElBQUksQ0FBQ0MsTUFBTSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7SUFFL0NjLFNBQVMsQ0FBQ2lELE1BQU0sR0FBR2pFLFdBQVc7SUFDOUJpQixNQUFNLENBQUNnRCxNQUFNLEdBQUdqRSxXQUFXO0lBQzNCa0IsY0FBYyxDQUFDZ0QsSUFBSSxHQUFHbEUsV0FBVyxDQUFDc0QsQ0FBQyxHQUFHMUYsOEJBQThCO0lBQ3BFc0QsY0FBYyxDQUFDd0MsT0FBTyxHQUFHMUQsV0FBVyxDQUFDdUQsQ0FBQztJQUN0Q3BELFNBQVMsQ0FBQytELElBQUksR0FBR2hELGNBQWMsQ0FBQ2lELEtBQUs7SUFDckNoRSxTQUFTLENBQUN1RCxPQUFPLEdBQUcxRCxXQUFXLENBQUN1RCxDQUFDO0lBQ2pDakIsT0FBTyxDQUFDNEIsSUFBSSxHQUFHL0QsU0FBUyxDQUFDK0QsSUFBSSxHQUFHLENBQUMsR0FBR25HLE9BQU87SUFDM0N1RSxPQUFPLENBQUM4QixHQUFHLEdBQUdqRSxTQUFTLENBQUNpRSxHQUFHLEdBQUcsQ0FBQyxHQUFHckcsT0FBTztJQUV6Q2lDLFdBQVcsQ0FBQ3FGLFVBQVUsQ0FBQyxDQUFDO0lBRXhCLE9BQU8sSUFBSW5KLElBQUksQ0FBRTtNQUNmdUcsUUFBUSxFQUFFLENBQ1J2QixjQUFjLEVBQ2RmLFNBQVMsRUFDVGMsTUFBTSxFQUNORCxTQUFTLEVBQ1RzQixPQUFPLENBQ1I7TUFDRHpDLE1BQU0sRUFBRUEsTUFBTTtNQUNkeUYsbUJBQW1CLEVBQUU7SUFDdkIsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBN0ksZ0JBQWdCLENBQUM4SSxRQUFRLENBQUUsZUFBZSxFQUFFbEcsYUFBYyxDQUFDOztBQUczRDtBQUNBO0FBQ0E7QUFDQSxTQUFTOEMsb0JBQW9CQSxDQUFFcUQsUUFBZ0IsRUFBRUMsV0FBbUIsRUFBRUMsZUFBMEMsRUFBUztFQUV2SDtFQUNBLE1BQU1DLGVBQWUsR0FBRyxFQUFFOztFQUUxQjtFQUNBLE1BQU1DLFNBQVMsR0FBRyxJQUFJdEosSUFBSSxDQUFFbUosV0FBVyxFQUFFN0osS0FBSyxDQUFFLENBQUMsQ0FBQyxFQUFFcUMsYUFBYSxFQUFFO0lBQ2pFdUgsUUFBUSxFQUFFQSxRQUFRLEdBQUdHLGVBQWUsR0FBRztFQUN6QyxDQUFFLENBQUUsQ0FBQzs7RUFFTDtFQUNBLE1BQU1FLGFBQWEsR0FBR2pLLEtBQUssQ0FBRSxDQUFDLENBQUMsRUFBRWUseUJBQXlCLENBQUN1QixrQkFBa0IsRUFBRTtJQUFFc0gsUUFBUSxFQUFFRyxlQUFlLEdBQUc7RUFBRSxDQUFFLENBQUM7RUFDbEgsTUFBTUcsVUFBVSxHQUFHLElBQUl4SixJQUFJLENBQUVvSixlQUFlLENBQUNyRSxHQUFHLENBQUMsQ0FBQyxFQUFFd0UsYUFBYyxDQUFDO0VBRW5FLE1BQU1FLGNBQWMsR0FBRyxJQUFJMUosU0FBUyxDQUNsQyxDQUFDLEVBQ0QsQ0FBQyxFQUNEc0osZUFBZSxFQUNmRyxVQUFVLENBQUMvSSxNQUFNLEdBQUcsQ0FBQyxHQUFHZ0IsT0FBTyxFQUFFO0lBQy9CcUMsWUFBWSxFQUFFLENBQUM7SUFDZmpDLElBQUksRUFBRSxPQUFPO0lBQ2JrQyxNQUFNLEVBQUUsT0FBTztJQUNmQyxTQUFTLEVBQUU7RUFDYixDQUNGLENBQUM7O0VBRUQ7RUFDQW9GLGVBQWUsQ0FBQzNDLElBQUksQ0FBRWlELE9BQU8sSUFBSTtJQUMvQkYsVUFBVSxDQUFDRyxTQUFTLENBQUVELE9BQVEsQ0FBQztJQUMvQixJQUFLQSxPQUFPLEtBQUt0SSxhQUFhLEVBQUc7TUFDL0JvSSxVQUFVLENBQUM3QixNQUFNLEdBQUc4QixjQUFjLENBQUM5QixNQUFNO0lBQzNDLENBQUMsTUFDSTtNQUNINkIsVUFBVSxDQUFDM0IsS0FBSyxHQUFHNEIsY0FBYyxDQUFDNUIsS0FBSyxHQUFHakYsZ0JBQWdCO01BQzFENEcsVUFBVSxDQUFDcEMsT0FBTyxHQUFHcUMsY0FBYyxDQUFDckMsT0FBTztJQUM3QztFQUNGLENBQUUsQ0FBQztFQUVILE1BQU13QyxhQUFhLEdBQUcsSUFBSWhLLElBQUksQ0FBRTtJQUFFdUcsUUFBUSxFQUFFLENBQUVzRCxjQUFjLEVBQUVELFVBQVU7RUFBRyxDQUFFLENBQUM7RUFFOUUsTUFBTXRELE9BQU8sR0FBR2dELFFBQVEsR0FBR0ksU0FBUyxDQUFDTyxLQUFLLEdBQUdELGFBQWEsQ0FBQ0MsS0FBSyxHQUFHLENBQUMsR0FBR3BJLE9BQU87RUFFOUUsT0FBTyxJQUFJOUIsSUFBSSxDQUFFO0lBQUV1RyxPQUFPLEVBQUVBLE9BQU87SUFBRUMsUUFBUSxFQUFFLENBQUVtRCxTQUFTLEVBQUVNLGFBQWE7RUFBRyxDQUFFLENBQUM7QUFDakY7QUFFQSxlQUFlN0csYUFBYSJ9