// Copyright 2017-2022, University of Colorado Boulder

/**
 * Shows a draggable circle to the lower-right of a proportional area that, when dragged, adjusts the width/height to
 * match.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import { Shape } from '../../../../kite/js/imports.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Circle, DragListener, KeyboardDragListener, Line, Node } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';
const dragHandleString = AreaModelCommonStrings.a11y.dragHandle;
const dragHandleDescriptionPatternString = AreaModelCommonStrings.a11y.dragHandleDescriptionPattern;

// constants
const DRAG_OFFSET = 8;
const DRAG_RADIUS = 10.5;
const CIRCLE_DRAG_OFFSET = DRAG_OFFSET + Math.sqrt(2) / 2 * DRAG_RADIUS;
class ProportionalDragHandle extends Node {
  /**
   * @param {Property.<ProportionalArea>} areaProperty
   * @param {OrientationPair.<Property.<number>>} activeTotalProperties
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty
   */
  constructor(areaProperty, activeTotalProperties, modelViewTransformProperty) {
    // {Property.<boolean>} - Whether this is being dragged (we only apply offsets when dragged)
    const draggedProperty = new BooleanProperty(false);

    // The current view "offset" from where the pointer is compared to the point it is controlling
    const offsetProperty = new Vector2Property(new Vector2(0, 0));
    const line = new Line({
      stroke: AreaModelCommonColors.proportionalDragHandleBorderProperty
    });
    const circle = new Circle(DRAG_RADIUS, {
      touchArea: Shape.circle(0, 0, DRAG_RADIUS * 2),
      focusHighlight: Shape.circle(0, 0, DRAG_RADIUS * 1.5),
      fill: AreaModelCommonColors.proportionalDragHandleBackgroundProperty,
      stroke: AreaModelCommonColors.proportionalDragHandleBorderProperty,
      cursor: 'pointer',
      // pdom
      tagName: 'div',
      innerContent: dragHandleString,
      focusable: true
    });

    // Potential workaround for https://github.com/phetsims/area-model-common/issues/173 (Safari SVG dirty region issue)
    circle.addChild(new Circle(DRAG_RADIUS + 10, {
      pickable: false,
      fill: 'transparent'
    }));
    areaProperty.link(area => {
      circle.descriptionContent = StringUtils.fillIn(dragHandleDescriptionPatternString, {
        width: area.maximumSize,
        height: area.maximumSize
      });
    });
    let initialOffset;
    function updateOffsetProperty(event, listener) {
      const area = areaProperty.value;
      const modelViewTransform = modelViewTransformProperty.value;

      // We use somewhat complicated drag code, since we both snap AND have an offset from where the pointer
      // actually is (and we want it to be efficient).
      const pointerViewPoint = listener.parentPoint;
      const viewPoint = pointerViewPoint.minusScalar(CIRCLE_DRAG_OFFSET).minus(initialOffset);
      const modelPoint = modelViewTransform.viewToModelPosition(viewPoint);
      const snapSizeInverse = 1 / area.snapSize;
      let width = Utils.roundSymmetric(modelPoint.x * snapSizeInverse) / snapSizeInverse;
      let height = Utils.roundSymmetric(modelPoint.y * snapSizeInverse) / snapSizeInverse;
      width = Utils.clamp(width, area.minimumSize, area.maximumSize);
      height = Utils.clamp(height, area.minimumSize, area.maximumSize);
      activeTotalProperties.horizontal.value = width;
      activeTotalProperties.vertical.value = height;
      offsetProperty.value = new Vector2(viewPoint.x - modelViewTransform.modelToViewX(width), viewPoint.y - modelViewTransform.modelToViewY(height));
    }
    super({
      children: [line, circle]
    });
    const dragListener = new DragListener({
      targetNode: this,
      applyOffset: false,
      start: (event, listener) => {
        initialOffset = listener.localPoint.minusScalar(CIRCLE_DRAG_OFFSET);
        updateOffsetProperty(event, listener);
      },
      drag: updateOffsetProperty
    });
    dragListener.isPressedProperty.link(draggedProperty.set.bind(draggedProperty));

    // Interrupt the drag when one of our parameters changes
    areaProperty.lazyLink(dragListener.interrupt.bind(dragListener));
    modelViewTransformProperty.lazyLink(dragListener.interrupt.bind(dragListener));
    circle.addInputListener(dragListener);
    const positionProperty = new Vector2Property(new Vector2(0, 0));
    function updatePositionProperty() {
      positionProperty.value = new Vector2(activeTotalProperties.horizontal.value, activeTotalProperties.vertical.value);
    }
    updatePositionProperty();
    positionProperty.lazyLink(position => {
      activeTotalProperties.horizontal.value = position.x;
      activeTotalProperties.vertical.value = position.y;
    });
    activeTotalProperties.horizontal.lazyLink(updatePositionProperty);
    activeTotalProperties.vertical.lazyLink(updatePositionProperty);
    let keyboardListener;
    Multilink.multilink([areaProperty, modelViewTransformProperty], (area, modelViewTransform) => {
      if (keyboardListener) {
        circle.interruptInput();
        circle.removeInputListener(keyboardListener);
        keyboardListener.dispose();
      }
      keyboardListener = new KeyboardDragListener({
        dragDelta: modelViewTransform.modelToViewDeltaX(area.snapSize),
        shiftDragDelta: modelViewTransform.modelToViewDeltaX(area.snapSize),
        transform: modelViewTransform,
        drag: delta => {
          let width = activeTotalProperties.horizontal.value;
          let height = activeTotalProperties.vertical.value;
          width += delta.x;
          height += delta.y;
          width = Utils.roundToInterval(Utils.clamp(width, area.minimumSize, area.maximumSize), area.snapSize);
          height = Utils.roundToInterval(Utils.clamp(height, area.minimumSize, area.maximumSize), area.snapSize);
          activeTotalProperties.horizontal.value = width;
          activeTotalProperties.vertical.value = height;
        },
        moveOnHoldDelay: 750,
        moveOnHoldInterval: 70
      });
      circle.addInputListener(keyboardListener);
    });

    // Apply offsets while dragging for a smoother experience.
    // See https://github.com/phetsims/area-model-common/issues/3
    Multilink.multilink([draggedProperty, offsetProperty], (dragged, offset) => {
      let combinedOffset = 0;
      if (dragged) {
        // Project to the line y=x, and limit for when the user goes to 1x1 or the max.
        combinedOffset = Utils.clamp((offset.x + offset.y) / 2, -10, 10);
      }
      line.x2 = line.y2 = combinedOffset + DRAG_OFFSET;
      circle.x = circle.y = combinedOffset + CIRCLE_DRAG_OFFSET;
    });

    // Update the offset of the drag handle
    Orientation.enumeration.values.forEach(orientation => {
      Multilink.multilink([activeTotalProperties.get(orientation), modelViewTransformProperty], (value, modelViewTransform) => {
        this[orientation.coordinate] = orientation.modelToView(modelViewTransform, value);
      });
    });
  }
}
areaModelCommon.register('ProportionalDragHandle', ProportionalDragHandle);
export default ProportionalDragHandle;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJVdGlscyIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJTaGFwZSIsIk9yaWVudGF0aW9uIiwiU3RyaW5nVXRpbHMiLCJDaXJjbGUiLCJEcmFnTGlzdGVuZXIiLCJLZXlib2FyZERyYWdMaXN0ZW5lciIsIkxpbmUiLCJOb2RlIiwiYXJlYU1vZGVsQ29tbW9uIiwiQXJlYU1vZGVsQ29tbW9uU3RyaW5ncyIsIkFyZWFNb2RlbENvbW1vbkNvbG9ycyIsImRyYWdIYW5kbGVTdHJpbmciLCJhMTF5IiwiZHJhZ0hhbmRsZSIsImRyYWdIYW5kbGVEZXNjcmlwdGlvblBhdHRlcm5TdHJpbmciLCJkcmFnSGFuZGxlRGVzY3JpcHRpb25QYXR0ZXJuIiwiRFJBR19PRkZTRVQiLCJEUkFHX1JBRElVUyIsIkNJUkNMRV9EUkFHX09GRlNFVCIsIk1hdGgiLCJzcXJ0IiwiUHJvcG9ydGlvbmFsRHJhZ0hhbmRsZSIsImNvbnN0cnVjdG9yIiwiYXJlYVByb3BlcnR5IiwiYWN0aXZlVG90YWxQcm9wZXJ0aWVzIiwibW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkiLCJkcmFnZ2VkUHJvcGVydHkiLCJvZmZzZXRQcm9wZXJ0eSIsImxpbmUiLCJzdHJva2UiLCJwcm9wb3J0aW9uYWxEcmFnSGFuZGxlQm9yZGVyUHJvcGVydHkiLCJjaXJjbGUiLCJ0b3VjaEFyZWEiLCJmb2N1c0hpZ2hsaWdodCIsImZpbGwiLCJwcm9wb3J0aW9uYWxEcmFnSGFuZGxlQmFja2dyb3VuZFByb3BlcnR5IiwiY3Vyc29yIiwidGFnTmFtZSIsImlubmVyQ29udGVudCIsImZvY3VzYWJsZSIsImFkZENoaWxkIiwicGlja2FibGUiLCJsaW5rIiwiYXJlYSIsImRlc2NyaXB0aW9uQ29udGVudCIsImZpbGxJbiIsIndpZHRoIiwibWF4aW11bVNpemUiLCJoZWlnaHQiLCJpbml0aWFsT2Zmc2V0IiwidXBkYXRlT2Zmc2V0UHJvcGVydHkiLCJldmVudCIsImxpc3RlbmVyIiwidmFsdWUiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJwb2ludGVyVmlld1BvaW50IiwicGFyZW50UG9pbnQiLCJ2aWV3UG9pbnQiLCJtaW51c1NjYWxhciIsIm1pbnVzIiwibW9kZWxQb2ludCIsInZpZXdUb01vZGVsUG9zaXRpb24iLCJzbmFwU2l6ZUludmVyc2UiLCJzbmFwU2l6ZSIsInJvdW5kU3ltbWV0cmljIiwieCIsInkiLCJjbGFtcCIsIm1pbmltdW1TaXplIiwiaG9yaXpvbnRhbCIsInZlcnRpY2FsIiwibW9kZWxUb1ZpZXdYIiwibW9kZWxUb1ZpZXdZIiwiY2hpbGRyZW4iLCJkcmFnTGlzdGVuZXIiLCJ0YXJnZXROb2RlIiwiYXBwbHlPZmZzZXQiLCJzdGFydCIsImxvY2FsUG9pbnQiLCJkcmFnIiwiaXNQcmVzc2VkUHJvcGVydHkiLCJzZXQiLCJiaW5kIiwibGF6eUxpbmsiLCJpbnRlcnJ1cHQiLCJhZGRJbnB1dExpc3RlbmVyIiwicG9zaXRpb25Qcm9wZXJ0eSIsInVwZGF0ZVBvc2l0aW9uUHJvcGVydHkiLCJwb3NpdGlvbiIsImtleWJvYXJkTGlzdGVuZXIiLCJtdWx0aWxpbmsiLCJpbnRlcnJ1cHRJbnB1dCIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJkaXNwb3NlIiwiZHJhZ0RlbHRhIiwibW9kZWxUb1ZpZXdEZWx0YVgiLCJzaGlmdERyYWdEZWx0YSIsInRyYW5zZm9ybSIsImRlbHRhIiwicm91bmRUb0ludGVydmFsIiwibW92ZU9uSG9sZERlbGF5IiwibW92ZU9uSG9sZEludGVydmFsIiwiZHJhZ2dlZCIsIm9mZnNldCIsImNvbWJpbmVkT2Zmc2V0IiwieDIiLCJ5MiIsImVudW1lcmF0aW9uIiwidmFsdWVzIiwiZm9yRWFjaCIsIm9yaWVudGF0aW9uIiwiZ2V0IiwiY29vcmRpbmF0ZSIsIm1vZGVsVG9WaWV3IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQcm9wb3J0aW9uYWxEcmFnSGFuZGxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNob3dzIGEgZHJhZ2dhYmxlIGNpcmNsZSB0byB0aGUgbG93ZXItcmlnaHQgb2YgYSBwcm9wb3J0aW9uYWwgYXJlYSB0aGF0LCB3aGVuIGRyYWdnZWQsIGFkanVzdHMgdGhlIHdpZHRoL2hlaWdodCB0b1xyXG4gKiBtYXRjaC5cclxuICpcclxuICogTk9URTogVGhpcyB0eXBlIGlzIGRlc2lnbmVkIHRvIGJlIHBlcnNpc3RlbnQsIGFuZCB3aWxsIG5vdCBuZWVkIHRvIHJlbGVhc2UgcmVmZXJlbmNlcyB0byBhdm9pZCBtZW1vcnkgbGVha3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IE9yaWVudGF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9PcmllbnRhdGlvbi5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBDaXJjbGUsIERyYWdMaXN0ZW5lciwgS2V5Ym9hcmREcmFnTGlzdGVuZXIsIExpbmUsIE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYXJlYU1vZGVsQ29tbW9uIGZyb20gJy4uLy4uL2FyZWFNb2RlbENvbW1vbi5qcyc7XHJcbmltcG9ydCBBcmVhTW9kZWxDb21tb25TdHJpbmdzIGZyb20gJy4uLy4uL0FyZWFNb2RlbENvbW1vblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQXJlYU1vZGVsQ29tbW9uQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0FyZWFNb2RlbENvbW1vbkNvbG9ycy5qcyc7XHJcblxyXG5jb25zdCBkcmFnSGFuZGxlU3RyaW5nID0gQXJlYU1vZGVsQ29tbW9uU3RyaW5ncy5hMTF5LmRyYWdIYW5kbGU7XHJcbmNvbnN0IGRyYWdIYW5kbGVEZXNjcmlwdGlvblBhdHRlcm5TdHJpbmcgPSBBcmVhTW9kZWxDb21tb25TdHJpbmdzLmExMXkuZHJhZ0hhbmRsZURlc2NyaXB0aW9uUGF0dGVybjtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBEUkFHX09GRlNFVCA9IDg7XHJcbmNvbnN0IERSQUdfUkFESVVTID0gMTAuNTtcclxuY29uc3QgQ0lSQ0xFX0RSQUdfT0ZGU0VUID0gRFJBR19PRkZTRVQgKyBNYXRoLnNxcnQoIDIgKSAvIDIgKiBEUkFHX1JBRElVUztcclxuXHJcbmNsYXNzIFByb3BvcnRpb25hbERyYWdIYW5kbGUgZXh0ZW5kcyBOb2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxQcm9wb3J0aW9uYWxBcmVhPn0gYXJlYVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtPcmllbnRhdGlvblBhaXIuPFByb3BlcnR5LjxudW1iZXI+Pn0gYWN0aXZlVG90YWxQcm9wZXJ0aWVzXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48TW9kZWxWaWV3VHJhbnNmb3JtMj59IG1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGFyZWFQcm9wZXJ0eSwgYWN0aXZlVG90YWxQcm9wZXJ0aWVzLCBtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSApIHtcclxuXHJcbiAgICAvLyB7UHJvcGVydHkuPGJvb2xlYW4+fSAtIFdoZXRoZXIgdGhpcyBpcyBiZWluZyBkcmFnZ2VkICh3ZSBvbmx5IGFwcGx5IG9mZnNldHMgd2hlbiBkcmFnZ2VkKVxyXG4gICAgY29uc3QgZHJhZ2dlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBUaGUgY3VycmVudCB2aWV3IFwib2Zmc2V0XCIgZnJvbSB3aGVyZSB0aGUgcG9pbnRlciBpcyBjb21wYXJlZCB0byB0aGUgcG9pbnQgaXQgaXMgY29udHJvbGxpbmdcclxuICAgIGNvbnN0IG9mZnNldFByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIDAsIDAgKSApO1xyXG5cclxuICAgIGNvbnN0IGxpbmUgPSBuZXcgTGluZSgge1xyXG4gICAgICBzdHJva2U6IEFyZWFNb2RlbENvbW1vbkNvbG9ycy5wcm9wb3J0aW9uYWxEcmFnSGFuZGxlQm9yZGVyUHJvcGVydHlcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjaXJjbGUgPSBuZXcgQ2lyY2xlKCBEUkFHX1JBRElVUywge1xyXG4gICAgICB0b3VjaEFyZWE6IFNoYXBlLmNpcmNsZSggMCwgMCwgRFJBR19SQURJVVMgKiAyICksXHJcbiAgICAgIGZvY3VzSGlnaGxpZ2h0OiBTaGFwZS5jaXJjbGUoIDAsIDAsIERSQUdfUkFESVVTICogMS41ICksXHJcbiAgICAgIGZpbGw6IEFyZWFNb2RlbENvbW1vbkNvbG9ycy5wcm9wb3J0aW9uYWxEcmFnSGFuZGxlQmFja2dyb3VuZFByb3BlcnR5LFxyXG4gICAgICBzdHJva2U6IEFyZWFNb2RlbENvbW1vbkNvbG9ycy5wcm9wb3J0aW9uYWxEcmFnSGFuZGxlQm9yZGVyUHJvcGVydHksXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG5cclxuICAgICAgLy8gcGRvbVxyXG4gICAgICB0YWdOYW1lOiAnZGl2JyxcclxuICAgICAgaW5uZXJDb250ZW50OiBkcmFnSGFuZGxlU3RyaW5nLFxyXG4gICAgICBmb2N1c2FibGU6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBQb3RlbnRpYWwgd29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FyZWEtbW9kZWwtY29tbW9uL2lzc3Vlcy8xNzMgKFNhZmFyaSBTVkcgZGlydHkgcmVnaW9uIGlzc3VlKVxyXG4gICAgY2lyY2xlLmFkZENoaWxkKCBuZXcgQ2lyY2xlKCBEUkFHX1JBRElVUyArIDEwLCB7XHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgZmlsbDogJ3RyYW5zcGFyZW50J1xyXG4gICAgfSApICk7XHJcblxyXG4gICAgYXJlYVByb3BlcnR5LmxpbmsoIGFyZWEgPT4ge1xyXG4gICAgICBjaXJjbGUuZGVzY3JpcHRpb25Db250ZW50ID0gU3RyaW5nVXRpbHMuZmlsbEluKCBkcmFnSGFuZGxlRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgd2lkdGg6IGFyZWEubWF4aW11bVNpemUsXHJcbiAgICAgICAgaGVpZ2h0OiBhcmVhLm1heGltdW1TaXplXHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBsZXQgaW5pdGlhbE9mZnNldDtcclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVPZmZzZXRQcm9wZXJ0eSggZXZlbnQsIGxpc3RlbmVyICkge1xyXG4gICAgICBjb25zdCBhcmVhID0gYXJlYVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICBjb25zdCBtb2RlbFZpZXdUcmFuc2Zvcm0gPSBtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgIC8vIFdlIHVzZSBzb21ld2hhdCBjb21wbGljYXRlZCBkcmFnIGNvZGUsIHNpbmNlIHdlIGJvdGggc25hcCBBTkQgaGF2ZSBhbiBvZmZzZXQgZnJvbSB3aGVyZSB0aGUgcG9pbnRlclxyXG4gICAgICAvLyBhY3R1YWxseSBpcyAoYW5kIHdlIHdhbnQgaXQgdG8gYmUgZWZmaWNpZW50KS5cclxuICAgICAgY29uc3QgcG9pbnRlclZpZXdQb2ludCA9IGxpc3RlbmVyLnBhcmVudFBvaW50O1xyXG4gICAgICBjb25zdCB2aWV3UG9pbnQgPSBwb2ludGVyVmlld1BvaW50Lm1pbnVzU2NhbGFyKCBDSVJDTEVfRFJBR19PRkZTRVQgKS5taW51cyggaW5pdGlhbE9mZnNldCApO1xyXG4gICAgICBjb25zdCBtb2RlbFBvaW50ID0gbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsUG9zaXRpb24oIHZpZXdQb2ludCApO1xyXG5cclxuICAgICAgY29uc3Qgc25hcFNpemVJbnZlcnNlID0gMSAvIGFyZWEuc25hcFNpemU7XHJcblxyXG4gICAgICBsZXQgd2lkdGggPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggbW9kZWxQb2ludC54ICogc25hcFNpemVJbnZlcnNlICkgLyBzbmFwU2l6ZUludmVyc2U7XHJcbiAgICAgIGxldCBoZWlnaHQgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggbW9kZWxQb2ludC55ICogc25hcFNpemVJbnZlcnNlICkgLyBzbmFwU2l6ZUludmVyc2U7XHJcblxyXG4gICAgICB3aWR0aCA9IFV0aWxzLmNsYW1wKCB3aWR0aCwgYXJlYS5taW5pbXVtU2l6ZSwgYXJlYS5tYXhpbXVtU2l6ZSApO1xyXG4gICAgICBoZWlnaHQgPSBVdGlscy5jbGFtcCggaGVpZ2h0LCBhcmVhLm1pbmltdW1TaXplLCBhcmVhLm1heGltdW1TaXplICk7XHJcblxyXG4gICAgICBhY3RpdmVUb3RhbFByb3BlcnRpZXMuaG9yaXpvbnRhbC52YWx1ZSA9IHdpZHRoO1xyXG4gICAgICBhY3RpdmVUb3RhbFByb3BlcnRpZXMudmVydGljYWwudmFsdWUgPSBoZWlnaHQ7XHJcblxyXG4gICAgICBvZmZzZXRQcm9wZXJ0eS52YWx1ZSA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgIHZpZXdQb2ludC54IC0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggd2lkdGggKSxcclxuICAgICAgICB2aWV3UG9pbnQueSAtIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIGhlaWdodCApXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBsaW5lLFxyXG4gICAgICAgIGNpcmNsZVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZHJhZ0xpc3RlbmVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICB0YXJnZXROb2RlOiB0aGlzLFxyXG4gICAgICBhcHBseU9mZnNldDogZmFsc2UsXHJcbiAgICAgIHN0YXJ0OiAoIGV2ZW50LCBsaXN0ZW5lciApID0+IHtcclxuICAgICAgICBpbml0aWFsT2Zmc2V0ID0gbGlzdGVuZXIubG9jYWxQb2ludC5taW51c1NjYWxhciggQ0lSQ0xFX0RSQUdfT0ZGU0VUICk7XHJcbiAgICAgICAgdXBkYXRlT2Zmc2V0UHJvcGVydHkoIGV2ZW50LCBsaXN0ZW5lciApO1xyXG4gICAgICB9LFxyXG4gICAgICBkcmFnOiB1cGRhdGVPZmZzZXRQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gICAgZHJhZ0xpc3RlbmVyLmlzUHJlc3NlZFByb3BlcnR5LmxpbmsoIGRyYWdnZWRQcm9wZXJ0eS5zZXQuYmluZCggZHJhZ2dlZFByb3BlcnR5ICkgKTtcclxuXHJcbiAgICAvLyBJbnRlcnJ1cHQgdGhlIGRyYWcgd2hlbiBvbmUgb2Ygb3VyIHBhcmFtZXRlcnMgY2hhbmdlc1xyXG4gICAgYXJlYVByb3BlcnR5LmxhenlMaW5rKCBkcmFnTGlzdGVuZXIuaW50ZXJydXB0LmJpbmQoIGRyYWdMaXN0ZW5lciApICk7XHJcbiAgICBtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS5sYXp5TGluayggZHJhZ0xpc3RlbmVyLmludGVycnVwdC5iaW5kKCBkcmFnTGlzdGVuZXIgKSApO1xyXG4gICAgY2lyY2xlLmFkZElucHV0TGlzdGVuZXIoIGRyYWdMaXN0ZW5lciApO1xyXG5cclxuICAgIGNvbnN0IHBvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggMCwgMCApICk7XHJcblxyXG4gICAgZnVuY3Rpb24gdXBkYXRlUG9zaXRpb25Qcm9wZXJ0eSgpIHtcclxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgIGFjdGl2ZVRvdGFsUHJvcGVydGllcy5ob3Jpem9udGFsLnZhbHVlLFxyXG4gICAgICAgIGFjdGl2ZVRvdGFsUHJvcGVydGllcy52ZXJ0aWNhbC52YWx1ZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVBvc2l0aW9uUHJvcGVydHkoKTtcclxuICAgIHBvc2l0aW9uUHJvcGVydHkubGF6eUxpbmsoIHBvc2l0aW9uID0+IHtcclxuICAgICAgYWN0aXZlVG90YWxQcm9wZXJ0aWVzLmhvcml6b250YWwudmFsdWUgPSBwb3NpdGlvbi54O1xyXG4gICAgICBhY3RpdmVUb3RhbFByb3BlcnRpZXMudmVydGljYWwudmFsdWUgPSBwb3NpdGlvbi55O1xyXG4gICAgfSApO1xyXG4gICAgYWN0aXZlVG90YWxQcm9wZXJ0aWVzLmhvcml6b250YWwubGF6eUxpbmsoIHVwZGF0ZVBvc2l0aW9uUHJvcGVydHkgKTtcclxuICAgIGFjdGl2ZVRvdGFsUHJvcGVydGllcy52ZXJ0aWNhbC5sYXp5TGluayggdXBkYXRlUG9zaXRpb25Qcm9wZXJ0eSApO1xyXG5cclxuICAgIGxldCBrZXlib2FyZExpc3RlbmVyO1xyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBhcmVhUHJvcGVydHksIG1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5IF0sICggYXJlYSwgbW9kZWxWaWV3VHJhbnNmb3JtICkgPT4ge1xyXG4gICAgICBpZiAoIGtleWJvYXJkTGlzdGVuZXIgKSB7XHJcbiAgICAgICAgY2lyY2xlLmludGVycnVwdElucHV0KCk7XHJcbiAgICAgICAgY2lyY2xlLnJlbW92ZUlucHV0TGlzdGVuZXIoIGtleWJvYXJkTGlzdGVuZXIgKTtcclxuICAgICAgICBrZXlib2FyZExpc3RlbmVyLmRpc3Bvc2UoKTtcclxuICAgICAgfVxyXG4gICAgICBrZXlib2FyZExpc3RlbmVyID0gbmV3IEtleWJvYXJkRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgICAgZHJhZ0RlbHRhOiBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVgoIGFyZWEuc25hcFNpemUgKSxcclxuICAgICAgICBzaGlmdERyYWdEZWx0YTogbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBhcmVhLnNuYXBTaXplICksXHJcbiAgICAgICAgdHJhbnNmb3JtOiBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgICAgZHJhZzogZGVsdGEgPT4ge1xyXG4gICAgICAgICAgbGV0IHdpZHRoID0gYWN0aXZlVG90YWxQcm9wZXJ0aWVzLmhvcml6b250YWwudmFsdWU7XHJcbiAgICAgICAgICBsZXQgaGVpZ2h0ID0gYWN0aXZlVG90YWxQcm9wZXJ0aWVzLnZlcnRpY2FsLnZhbHVlO1xyXG5cclxuICAgICAgICAgIHdpZHRoICs9IGRlbHRhLng7XHJcbiAgICAgICAgICBoZWlnaHQgKz0gZGVsdGEueTtcclxuXHJcbiAgICAgICAgICB3aWR0aCA9IFV0aWxzLnJvdW5kVG9JbnRlcnZhbCggVXRpbHMuY2xhbXAoIHdpZHRoLCBhcmVhLm1pbmltdW1TaXplLCBhcmVhLm1heGltdW1TaXplICksIGFyZWEuc25hcFNpemUgKTtcclxuICAgICAgICAgIGhlaWdodCA9IFV0aWxzLnJvdW5kVG9JbnRlcnZhbCggVXRpbHMuY2xhbXAoIGhlaWdodCwgYXJlYS5taW5pbXVtU2l6ZSwgYXJlYS5tYXhpbXVtU2l6ZSApLCBhcmVhLnNuYXBTaXplICk7XHJcblxyXG4gICAgICAgICAgYWN0aXZlVG90YWxQcm9wZXJ0aWVzLmhvcml6b250YWwudmFsdWUgPSB3aWR0aDtcclxuICAgICAgICAgIGFjdGl2ZVRvdGFsUHJvcGVydGllcy52ZXJ0aWNhbC52YWx1ZSA9IGhlaWdodDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1vdmVPbkhvbGREZWxheTogNzUwLFxyXG4gICAgICAgIG1vdmVPbkhvbGRJbnRlcnZhbDogNzBcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgY2lyY2xlLmFkZElucHV0TGlzdGVuZXIoIGtleWJvYXJkTGlzdGVuZXIgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBcHBseSBvZmZzZXRzIHdoaWxlIGRyYWdnaW5nIGZvciBhIHNtb290aGVyIGV4cGVyaWVuY2UuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FyZWEtbW9kZWwtY29tbW9uL2lzc3Vlcy8zXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIGRyYWdnZWRQcm9wZXJ0eSwgb2Zmc2V0UHJvcGVydHkgXSwgKCBkcmFnZ2VkLCBvZmZzZXQgKSA9PiB7XHJcbiAgICAgIGxldCBjb21iaW5lZE9mZnNldCA9IDA7XHJcbiAgICAgIGlmICggZHJhZ2dlZCApIHtcclxuICAgICAgICAvLyBQcm9qZWN0IHRvIHRoZSBsaW5lIHk9eCwgYW5kIGxpbWl0IGZvciB3aGVuIHRoZSB1c2VyIGdvZXMgdG8gMXgxIG9yIHRoZSBtYXguXHJcbiAgICAgICAgY29tYmluZWRPZmZzZXQgPSBVdGlscy5jbGFtcCggKCBvZmZzZXQueCArIG9mZnNldC55ICkgLyAyLCAtMTAsIDEwICk7XHJcbiAgICAgIH1cclxuICAgICAgbGluZS54MiA9IGxpbmUueTIgPSBjb21iaW5lZE9mZnNldCArIERSQUdfT0ZGU0VUO1xyXG4gICAgICBjaXJjbGUueCA9IGNpcmNsZS55ID0gY29tYmluZWRPZmZzZXQgKyBDSVJDTEVfRFJBR19PRkZTRVQ7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBvZmZzZXQgb2YgdGhlIGRyYWcgaGFuZGxlXHJcbiAgICBPcmllbnRhdGlvbi5lbnVtZXJhdGlvbi52YWx1ZXMuZm9yRWFjaCggb3JpZW50YXRpb24gPT4ge1xyXG4gICAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICAgIFsgYWN0aXZlVG90YWxQcm9wZXJ0aWVzLmdldCggb3JpZW50YXRpb24gKSwgbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkgXSxcclxuICAgICAgICAoIHZhbHVlLCBtb2RlbFZpZXdUcmFuc2Zvcm0gKSA9PiB7XHJcbiAgICAgICAgICB0aGlzWyBvcmllbnRhdGlvbi5jb29yZGluYXRlIF0gPSBvcmllbnRhdGlvbi5tb2RlbFRvVmlldyggbW9kZWxWaWV3VHJhbnNmb3JtLCB2YWx1ZSApO1xyXG4gICAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmFyZWFNb2RlbENvbW1vbi5yZWdpc3RlciggJ1Byb3BvcnRpb25hbERyYWdIYW5kbGUnLCBQcm9wb3J0aW9uYWxEcmFnSGFuZGxlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQcm9wb3J0aW9uYWxEcmFnSGFuZGxlO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxlQUFlLE1BQU0sdUNBQXVDO0FBQ25FLFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxXQUFXLE1BQU0sK0NBQStDO0FBQ3ZFLFNBQVNDLE1BQU0sRUFBRUMsWUFB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