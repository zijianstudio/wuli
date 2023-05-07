// Copyright 2015-2022, University of Colorado Boulder

/**
 * Graphically depicts a draggable prism.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { DragListener, Image, Node, Path } from '../../../../scenery/js/imports.js';
import knob_png from '../../../images/knob_png.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../../common/BendingLightConstants.js';
class PrismNode extends Node {
  /**
   * @param prismsModel - main model
   * @param modelViewTransform - converts between model and view co-ordinates
   * @param prism
   * @param prismToolboxNode
   * @param prismLayer - layer consisting of prisms in play area
   * @param dragBoundsProperty - bounds that define where the prism may be dragged
   * @param occlusionHandler - function that takes a node and updates it if it would be occluded by a control
   *                                    - panel
   * @param isIcon - true if the prism node is being created to be shown as an icon in the toolbox
   *                         - false if the prism node will be dragged in the play area
   */
  constructor(prismsModel, modelViewTransform, prism, prismToolboxNode, prismLayer, dragBoundsProperty, occlusionHandler, isIcon) {
    super({
      cursor: 'pointer'
    });
    const knobHeight = 15;

    // It looks like a box on the side of the prism
    const knobNode = new Image(knob_png);
    if (prism.shapeProperty.get().getReferencePoint()) {
      this.addChild(knobNode);
    }

    // Prism rotation with knob
    let previousAngle;
    let prismCenterPoint;
    if (!isIcon) {
      knobNode.addInputListener(new DragListener({
        start: event => {
          this.moveToFront();
          const start = knobNode.globalToParentPoint(event.pointer.point);
          prismCenterPoint = prism.getTranslatedShape().getRotationCenter();
          const startX = modelViewTransform.viewToModelX(start.x); // model values
          const startY = modelViewTransform.viewToModelY(start.y); // model values
          previousAngle = Math.atan2(prismCenterPoint.y - startY, prismCenterPoint.x - startX);
        },
        drag: event => {
          const end = knobNode.globalToParentPoint(event.pointer.point);
          prismCenterPoint = prism.getTranslatedShape().getRotationCenter();
          const endX = modelViewTransform.viewToModelX(end.x); // model values
          const endY = modelViewTransform.viewToModelY(end.y); // model values
          const angle = Math.atan2(prismCenterPoint.y - endY, prismCenterPoint.x - endX);
          prism.rotate(angle - previousAngle);
          previousAngle = angle;
        },
        // A Prism cannot be put back into the toolbox by rotating it.
        end: _.noop
      }));
      knobNode.touchArea = Shape.circle(0, 10, 40);
    }
    const prismPathNode = new Path(modelViewTransform.modelToViewShape(prism.getTranslatedShape().shape), {
      stroke: 'gray'
    });
    this.addChild(prismPathNode);

    // When the window reshapes, make sure no prism is left outside of the play area
    // TODO: Broken, see https://github.com/phetsims/bending-light/issues/372
    dragBoundsProperty.link(dragBounds => {
      const center = prism.shapeProperty.get().centroid;
      const inBounds = modelViewTransform.viewToModelBounds(dragBounds).getClosestPoint(center.x, center.y);
      prism.translate(inBounds.x - center.x, inBounds.y - center.y);
    });
    this.dragListener = new DragListener({
      useParentOffset: true,
      positionProperty: prism.positionProperty,
      // TODO: Was previously //     newPosition = modelViewTransform.viewToModelBounds( dragBoundsProperty.value ).closestPointTo( newPosition );
      // TODO: Do we need to transform the bounds?
      // dragBoundsProperty: dragBoundsProperty, // TODO: get this working, see https://github.com/phetsims/bending-light/issues/372
      transform: modelViewTransform,
      end: () => {
        occlusionHandler(this);
        if (prismToolboxNode.visibleBounds.containsCoordinates(this.getCenterX(), this.getCenterY())) {
          if (prismLayer.hasChild(this)) {
            prismsModel.removePrism(prism);
            prism.shapeProperty.unlink(this.updatePrismShape);
            prismsModel.prismMediumProperty.unlink(this.updatePrismColor);
            prismLayer.removeChild(this);
          }
          prismsModel.dirty = true;
        }
      }
    });
    if (!isIcon) {
      prismPathNode.addInputListener(this.dragListener);
    }
    const knobCenterPoint = new Vector2(-knobNode.getWidth() - 7, -knobNode.getHeight() / 2 - 8);

    // also used in PrismToolboxNode
    this.updatePrismShape = () => {
      prismsModel.clear();
      prismsModel.updateModel();
      prismsModel.dirty = true;
      const delta = prism.positionProperty.value;
      prismPathNode.setShape(modelViewTransform.modelToViewShape(prism.shapeProperty.get().getTranslatedInstance(delta.x, delta.y).shape));
      const prismReferencePoint = prism.getTranslatedShape().getReferencePoint();
      if (prismReferencePoint) {
        const prismShapeCenter = prism.getTranslatedShape().getRotationCenter();
        knobNode.resetTransform();
        knobNode.setScaleMagnitude(knobHeight / knobNode.height);
        const prismReferenceXPosition = modelViewTransform.modelToViewX(prismReferencePoint.x);
        const prismReferenceYPosition = modelViewTransform.modelToViewY(prismReferencePoint.y);
        const prismCenterX = modelViewTransform.modelToViewX(prismShapeCenter.x);
        const prismCenterY = modelViewTransform.modelToViewY(prismShapeCenter.y);

        // Calculate angle
        const angle = Math.atan2(prismCenterY - prismReferenceYPosition, prismCenterX - prismReferenceXPosition);
        knobCenterPoint.x = -knobNode.getWidth() - 7;
        knobCenterPoint.y = -knobNode.getHeight() / 2 - 8;
        knobNode.rotateAround(knobCenterPoint, angle);
        knobNode.setTranslation(prismReferenceXPosition, prismReferenceYPosition);
        knobNode.translate(knobCenterPoint);
      }
    };
    prism.shapeProperty.link(this.updatePrismShape);
    prism.positionProperty.link(this.updatePrismShape);

    // used in PrismToolboxNode
    this.updatePrismColor = () => {
      const indexOfRefraction = prismsModel.prismMediumProperty.value.substance.indexOfRefractionForRedLight;
      prismPathNode.fill = prismsModel.mediumColorFactory.getColor(indexOfRefraction).withAlpha(BendingLightConstants.PRISM_NODE_ALPHA);
    };
    prismsModel.mediumColorFactory.lightTypeProperty.link(this.updatePrismColor);
    prismsModel.prismMediumProperty.link(this.updatePrismColor);

    /**
     * Called from the occlusion handler.  Translates the view by the specified amount by translating the corresponding
     * model
     */
    this.translateViewXY = (x, y) => {
      const delta = modelViewTransform.viewToModelDeltaXY(x, y);
      prism.translate(delta.x, delta.y);
    };
  }
}
bendingLight.register('PrismNode', PrismNode);
export default PrismNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2hhcGUiLCJEcmFnTGlzdGVuZXIiLCJJbWFnZSIsIk5vZGUiLCJQYXRoIiwia25vYl9wbmciLCJiZW5kaW5nTGlnaHQiLCJCZW5kaW5nTGlnaHRDb25zdGFudHMiLCJQcmlzbU5vZGUiLCJjb25zdHJ1Y3RvciIsInByaXNtc01vZGVsIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwicHJpc20iLCJwcmlzbVRvb2xib3hOb2RlIiwicHJpc21MYXllciIsImRyYWdCb3VuZHNQcm9wZXJ0eSIsIm9jY2x1c2lvbkhhbmRsZXIiLCJpc0ljb24iLCJjdXJzb3IiLCJrbm9iSGVpZ2h0Iiwia25vYk5vZGUiLCJzaGFwZVByb3BlcnR5IiwiZ2V0IiwiZ2V0UmVmZXJlbmNlUG9pbnQiLCJhZGRDaGlsZCIsInByZXZpb3VzQW5nbGUiLCJwcmlzbUNlbnRlclBvaW50IiwiYWRkSW5wdXRMaXN0ZW5lciIsInN0YXJ0IiwiZXZlbnQiLCJtb3ZlVG9Gcm9udCIsImdsb2JhbFRvUGFyZW50UG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJnZXRUcmFuc2xhdGVkU2hhcGUiLCJnZXRSb3RhdGlvbkNlbnRlciIsInN0YXJ0WCIsInZpZXdUb01vZGVsWCIsIngiLCJzdGFydFkiLCJ2aWV3VG9Nb2RlbFkiLCJ5IiwiTWF0aCIsImF0YW4yIiwiZHJhZyIsImVuZCIsImVuZFgiLCJlbmRZIiwiYW5nbGUiLCJyb3RhdGUiLCJfIiwibm9vcCIsInRvdWNoQXJlYSIsImNpcmNsZSIsInByaXNtUGF0aE5vZGUiLCJtb2RlbFRvVmlld1NoYXBlIiwic2hhcGUiLCJzdHJva2UiLCJsaW5rIiwiZHJhZ0JvdW5kcyIsImNlbnRlciIsImNlbnRyb2lkIiwiaW5Cb3VuZHMiLCJ2aWV3VG9Nb2RlbEJvdW5kcyIsImdldENsb3Nlc3RQb2ludCIsInRyYW5zbGF0ZSIsImRyYWdMaXN0ZW5lciIsInVzZVBhcmVudE9mZnNldCIsInBvc2l0aW9uUHJvcGVydHkiLCJ0cmFuc2Zvcm0iLCJ2aXNpYmxlQm91bmRzIiwiY29udGFpbnNDb29yZGluYXRlcyIsImdldENlbnRlclgiLCJnZXRDZW50ZXJZIiwiaGFzQ2hpbGQiLCJyZW1vdmVQcmlzbSIsInVubGluayIsInVwZGF0ZVByaXNtU2hhcGUiLCJwcmlzbU1lZGl1bVByb3BlcnR5IiwidXBkYXRlUHJpc21Db2xvciIsInJlbW92ZUNoaWxkIiwiZGlydHkiLCJrbm9iQ2VudGVyUG9pbnQiLCJnZXRXaWR0aCIsImdldEhlaWdodCIsImNsZWFyIiwidXBkYXRlTW9kZWwiLCJkZWx0YSIsInZhbHVlIiwic2V0U2hhcGUiLCJnZXRUcmFuc2xhdGVkSW5zdGFuY2UiLCJwcmlzbVJlZmVyZW5jZVBvaW50IiwicHJpc21TaGFwZUNlbnRlciIsInJlc2V0VHJhbnNmb3JtIiwic2V0U2NhbGVNYWduaXR1ZGUiLCJoZWlnaHQiLCJwcmlzbVJlZmVyZW5jZVhQb3NpdGlvbiIsIm1vZGVsVG9WaWV3WCIsInByaXNtUmVmZXJlbmNlWVBvc2l0aW9uIiwibW9kZWxUb1ZpZXdZIiwicHJpc21DZW50ZXJYIiwicHJpc21DZW50ZXJZIiwicm90YXRlQXJvdW5kIiwic2V0VHJhbnNsYXRpb24iLCJpbmRleE9mUmVmcmFjdGlvbiIsInN1YnN0YW5jZSIsImluZGV4T2ZSZWZyYWN0aW9uRm9yUmVkTGlnaHQiLCJmaWxsIiwibWVkaXVtQ29sb3JGYWN0b3J5IiwiZ2V0Q29sb3IiLCJ3aXRoQWxwaGEiLCJQUklTTV9OT0RFX0FMUEhBIiwibGlnaHRUeXBlUHJvcGVydHkiLCJ0cmFuc2xhdGVWaWV3WFkiLCJ2aWV3VG9Nb2RlbERlbHRhWFkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlByaXNtTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBHcmFwaGljYWxseSBkZXBpY3RzIGEgZHJhZ2dhYmxlIHByaXNtLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENoYW5kcmFzaGVrYXIgQmVtYWdvbmkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IHsgRHJhZ0xpc3RlbmVyLCBJbWFnZSwgTm9kZSwgUGF0aCwgU2NlbmVyeUV2ZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGtub2JfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9rbm9iX3BuZy5qcyc7XHJcbmltcG9ydCBiZW5kaW5nTGlnaHQgZnJvbSAnLi4vLi4vYmVuZGluZ0xpZ2h0LmpzJztcclxuaW1wb3J0IEJlbmRpbmdMaWdodENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQmVuZGluZ0xpZ2h0Q29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFByaXNtIGZyb20gJy4uL21vZGVsL1ByaXNtLmpzJztcclxuaW1wb3J0IFByaXNtc01vZGVsIGZyb20gJy4uL21vZGVsL1ByaXNtc01vZGVsLmpzJztcclxuXHJcbmNsYXNzIFByaXNtTm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIHByaXZhdGUgZHJhZ0xpc3RlbmVyOiBEcmFnTGlzdGVuZXI7XHJcbiAgcHJpdmF0ZSB1cGRhdGVQcmlzbVNoYXBlOiAoKSA9PiB2b2lkO1xyXG4gIHByaXZhdGUgdXBkYXRlUHJpc21Db2xvcjogKCkgPT4gdm9pZDtcclxuICBwcml2YXRlIHRyYW5zbGF0ZVZpZXdYWTogKCB4OiBudW1iZXIsIHk6IG51bWJlciApID0+IHZvaWQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBwcmlzbXNNb2RlbCAtIG1haW4gbW9kZWxcclxuICAgKiBAcGFyYW0gbW9kZWxWaWV3VHJhbnNmb3JtIC0gY29udmVydHMgYmV0d2VlbiBtb2RlbCBhbmQgdmlldyBjby1vcmRpbmF0ZXNcclxuICAgKiBAcGFyYW0gcHJpc21cclxuICAgKiBAcGFyYW0gcHJpc21Ub29sYm94Tm9kZVxyXG4gICAqIEBwYXJhbSBwcmlzbUxheWVyIC0gbGF5ZXIgY29uc2lzdGluZyBvZiBwcmlzbXMgaW4gcGxheSBhcmVhXHJcbiAgICogQHBhcmFtIGRyYWdCb3VuZHNQcm9wZXJ0eSAtIGJvdW5kcyB0aGF0IGRlZmluZSB3aGVyZSB0aGUgcHJpc20gbWF5IGJlIGRyYWdnZWRcclxuICAgKiBAcGFyYW0gb2NjbHVzaW9uSGFuZGxlciAtIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBub2RlIGFuZCB1cGRhdGVzIGl0IGlmIGl0IHdvdWxkIGJlIG9jY2x1ZGVkIGJ5IGEgY29udHJvbFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBwYW5lbFxyXG4gICAqIEBwYXJhbSBpc0ljb24gLSB0cnVlIGlmIHRoZSBwcmlzbSBub2RlIGlzIGJlaW5nIGNyZWF0ZWQgdG8gYmUgc2hvd24gYXMgYW4gaWNvbiBpbiB0aGUgdG9vbGJveFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgIC0gZmFsc2UgaWYgdGhlIHByaXNtIG5vZGUgd2lsbCBiZSBkcmFnZ2VkIGluIHRoZSBwbGF5IGFyZWFcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByaXNtc01vZGVsOiBQcmlzbXNNb2RlbCwgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLCBwcmlzbTogUHJpc20sIHByaXNtVG9vbGJveE5vZGU6IE5vZGUsIHByaXNtTGF5ZXI6IE5vZGUsIGRyYWdCb3VuZHNQcm9wZXJ0eTogUHJvcGVydHk8Qm91bmRzMj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBvY2NsdXNpb25IYW5kbGVyOiAoIHByaXNtTm9kZTogUHJpc21Ob2RlICkgPT4gdm9pZCwgaXNJY29uOiBib29sZWFuICkge1xyXG5cclxuICAgIHN1cGVyKCB7IGN1cnNvcjogJ3BvaW50ZXInIH0gKTtcclxuICAgIGNvbnN0IGtub2JIZWlnaHQgPSAxNTtcclxuXHJcbiAgICAvLyBJdCBsb29rcyBsaWtlIGEgYm94IG9uIHRoZSBzaWRlIG9mIHRoZSBwcmlzbVxyXG4gICAgY29uc3Qga25vYk5vZGUgPSBuZXcgSW1hZ2UoIGtub2JfcG5nICk7XHJcbiAgICBpZiAoIHByaXNtLnNoYXBlUHJvcGVydHkuZ2V0KCkuZ2V0UmVmZXJlbmNlUG9pbnQoKSApIHtcclxuICAgICAgdGhpcy5hZGRDaGlsZCgga25vYk5vZGUgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcmlzbSByb3RhdGlvbiB3aXRoIGtub2JcclxuICAgIGxldCBwcmV2aW91c0FuZ2xlOiBudW1iZXI7XHJcbiAgICBsZXQgcHJpc21DZW50ZXJQb2ludDtcclxuICAgIGlmICggIWlzSWNvbiApIHtcclxuICAgICAga25vYk5vZGUuYWRkSW5wdXRMaXN0ZW5lciggbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICAgIHN0YXJ0OiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm1vdmVUb0Zyb250KCk7XHJcbiAgICAgICAgICBjb25zdCBzdGFydCA9IGtub2JOb2RlLmdsb2JhbFRvUGFyZW50UG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKTtcclxuICAgICAgICAgIHByaXNtQ2VudGVyUG9pbnQgPSBwcmlzbS5nZXRUcmFuc2xhdGVkU2hhcGUoKS5nZXRSb3RhdGlvbkNlbnRlcigpO1xyXG4gICAgICAgICAgY29uc3Qgc3RhcnRYID0gbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsWCggc3RhcnQueCApOy8vIG1vZGVsIHZhbHVlc1xyXG4gICAgICAgICAgY29uc3Qgc3RhcnRZID0gbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsWSggc3RhcnQueSApOy8vIG1vZGVsIHZhbHVlc1xyXG4gICAgICAgICAgcHJldmlvdXNBbmdsZSA9IE1hdGguYXRhbjIoICggcHJpc21DZW50ZXJQb2ludC55IC0gc3RhcnRZICksICggcHJpc21DZW50ZXJQb2ludC54IC0gc3RhcnRYICkgKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRyYWc6ICggZXZlbnQ6IFNjZW5lcnlFdmVudCApID0+IHtcclxuICAgICAgICAgIGNvbnN0IGVuZCA9IGtub2JOb2RlLmdsb2JhbFRvUGFyZW50UG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKTtcclxuICAgICAgICAgIHByaXNtQ2VudGVyUG9pbnQgPSBwcmlzbS5nZXRUcmFuc2xhdGVkU2hhcGUoKS5nZXRSb3RhdGlvbkNlbnRlcigpO1xyXG4gICAgICAgICAgY29uc3QgZW5kWCA9IG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbFgoIGVuZC54ICk7Ly8gbW9kZWwgdmFsdWVzXHJcbiAgICAgICAgICBjb25zdCBlbmRZID0gbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsWSggZW5kLnkgKTsvLyBtb2RlbCB2YWx1ZXNcclxuICAgICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMiggKCBwcmlzbUNlbnRlclBvaW50LnkgLSBlbmRZICksICggcHJpc21DZW50ZXJQb2ludC54IC0gZW5kWCApICk7XHJcbiAgICAgICAgICBwcmlzbS5yb3RhdGUoIGFuZ2xlIC0gcHJldmlvdXNBbmdsZSApO1xyXG4gICAgICAgICAgcHJldmlvdXNBbmdsZSA9IGFuZ2xlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8vIEEgUHJpc20gY2Fubm90IGJlIHB1dCBiYWNrIGludG8gdGhlIHRvb2xib3ggYnkgcm90YXRpbmcgaXQuXHJcbiAgICAgICAgZW5kOiBfLm5vb3BcclxuICAgICAgfSApICk7XHJcbiAgICAgIGtub2JOb2RlLnRvdWNoQXJlYSA9IFNoYXBlLmNpcmNsZSggMCwgMTAsIDQwICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcHJpc21QYXRoTm9kZSA9IG5ldyBQYXRoKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdTaGFwZSggcHJpc20uZ2V0VHJhbnNsYXRlZFNoYXBlKCkuc2hhcGUgKSwge1xyXG4gICAgICBzdHJva2U6ICdncmF5J1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcHJpc21QYXRoTm9kZSApO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIHdpbmRvdyByZXNoYXBlcywgbWFrZSBzdXJlIG5vIHByaXNtIGlzIGxlZnQgb3V0c2lkZSBvZiB0aGUgcGxheSBhcmVhXHJcbiAgICAvLyBUT0RPOiBCcm9rZW4sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYmVuZGluZy1saWdodC9pc3N1ZXMvMzcyXHJcbiAgICBkcmFnQm91bmRzUHJvcGVydHkubGluayggZHJhZ0JvdW5kcyA9PiB7XHJcbiAgICAgIGNvbnN0IGNlbnRlciA9IHByaXNtLnNoYXBlUHJvcGVydHkuZ2V0KCkuY2VudHJvaWQ7XHJcbiAgICAgIGNvbnN0IGluQm91bmRzID0gbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsQm91bmRzKCBkcmFnQm91bmRzICkuZ2V0Q2xvc2VzdFBvaW50KCBjZW50ZXIueCwgY2VudGVyLnkgKTtcclxuICAgICAgcHJpc20udHJhbnNsYXRlKCBpbkJvdW5kcy54IC0gY2VudGVyLngsIGluQm91bmRzLnkgLSBjZW50ZXIueSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZHJhZ0xpc3RlbmVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICB1c2VQYXJlbnRPZmZzZXQ6IHRydWUsXHJcbiAgICAgIHBvc2l0aW9uUHJvcGVydHk6IHByaXNtLnBvc2l0aW9uUHJvcGVydHksXHJcblxyXG4gICAgICAvLyBUT0RPOiBXYXMgcHJldmlvdXNseSAvLyAgICAgbmV3UG9zaXRpb24gPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxCb3VuZHMoIGRyYWdCb3VuZHNQcm9wZXJ0eS52YWx1ZSApLmNsb3Nlc3RQb2ludFRvKCBuZXdQb3NpdGlvbiApO1xyXG4gICAgICAvLyBUT0RPOiBEbyB3ZSBuZWVkIHRvIHRyYW5zZm9ybSB0aGUgYm91bmRzP1xyXG4gICAgICAvLyBkcmFnQm91bmRzUHJvcGVydHk6IGRyYWdCb3VuZHNQcm9wZXJ0eSwgLy8gVE9ETzogZ2V0IHRoaXMgd29ya2luZywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iZW5kaW5nLWxpZ2h0L2lzc3Vlcy8zNzJcclxuICAgICAgdHJhbnNmb3JtOiBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIGVuZDogKCkgPT4ge1xyXG4gICAgICAgIG9jY2x1c2lvbkhhbmRsZXIoIHRoaXMgKTtcclxuICAgICAgICBpZiAoIHByaXNtVG9vbGJveE5vZGUudmlzaWJsZUJvdW5kcy5jb250YWluc0Nvb3JkaW5hdGVzKCB0aGlzLmdldENlbnRlclgoKSwgdGhpcy5nZXRDZW50ZXJZKCkgKSApIHtcclxuICAgICAgICAgIGlmICggcHJpc21MYXllci5oYXNDaGlsZCggdGhpcyApICkge1xyXG4gICAgICAgICAgICBwcmlzbXNNb2RlbC5yZW1vdmVQcmlzbSggcHJpc20gKTtcclxuICAgICAgICAgICAgcHJpc20uc2hhcGVQcm9wZXJ0eS51bmxpbmsoIHRoaXMudXBkYXRlUHJpc21TaGFwZSApO1xyXG4gICAgICAgICAgICBwcmlzbXNNb2RlbC5wcmlzbU1lZGl1bVByb3BlcnR5LnVubGluayggdGhpcy51cGRhdGVQcmlzbUNvbG9yICk7XHJcbiAgICAgICAgICAgIHByaXNtTGF5ZXIucmVtb3ZlQ2hpbGQoIHRoaXMgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHByaXNtc01vZGVsLmRpcnR5ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBpZiAoICFpc0ljb24gKSB7XHJcbiAgICAgIHByaXNtUGF0aE5vZGUuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5kcmFnTGlzdGVuZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBrbm9iQ2VudGVyUG9pbnQgPSBuZXcgVmVjdG9yMiggLWtub2JOb2RlLmdldFdpZHRoKCkgLSA3LCAta25vYk5vZGUuZ2V0SGVpZ2h0KCkgLyAyIC0gOCApO1xyXG5cclxuICAgIC8vIGFsc28gdXNlZCBpbiBQcmlzbVRvb2xib3hOb2RlXHJcbiAgICB0aGlzLnVwZGF0ZVByaXNtU2hhcGUgPSAoKSA9PiB7XHJcbiAgICAgIHByaXNtc01vZGVsLmNsZWFyKCk7XHJcbiAgICAgIHByaXNtc01vZGVsLnVwZGF0ZU1vZGVsKCk7XHJcbiAgICAgIHByaXNtc01vZGVsLmRpcnR5ID0gdHJ1ZTtcclxuICAgICAgY29uc3QgZGVsdGEgPSBwcmlzbS5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gICAgICBwcmlzbVBhdGhOb2RlLnNldFNoYXBlKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdTaGFwZSggcHJpc20uc2hhcGVQcm9wZXJ0eS5nZXQoKS5nZXRUcmFuc2xhdGVkSW5zdGFuY2UoIGRlbHRhLngsIGRlbHRhLnkgKS5zaGFwZSApICk7XHJcblxyXG4gICAgICBjb25zdCBwcmlzbVJlZmVyZW5jZVBvaW50ID0gcHJpc20uZ2V0VHJhbnNsYXRlZFNoYXBlKCkuZ2V0UmVmZXJlbmNlUG9pbnQoKTtcclxuICAgICAgaWYgKCBwcmlzbVJlZmVyZW5jZVBvaW50ICkge1xyXG4gICAgICAgIGNvbnN0IHByaXNtU2hhcGVDZW50ZXIgPSBwcmlzbS5nZXRUcmFuc2xhdGVkU2hhcGUoKS5nZXRSb3RhdGlvbkNlbnRlcigpO1xyXG4gICAgICAgIGtub2JOb2RlLnJlc2V0VHJhbnNmb3JtKCk7XHJcblxyXG4gICAgICAgIGtub2JOb2RlLnNldFNjYWxlTWFnbml0dWRlKCBrbm9iSGVpZ2h0IC8ga25vYk5vZGUuaGVpZ2h0ICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHByaXNtUmVmZXJlbmNlWFBvc2l0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggcHJpc21SZWZlcmVuY2VQb2ludC54ICk7XHJcbiAgICAgICAgY29uc3QgcHJpc21SZWZlcmVuY2VZUG9zaXRpb24gPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBwcmlzbVJlZmVyZW5jZVBvaW50LnkgKTtcclxuICAgICAgICBjb25zdCBwcmlzbUNlbnRlclggPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBwcmlzbVNoYXBlQ2VudGVyLnggKTtcclxuICAgICAgICBjb25zdCBwcmlzbUNlbnRlclkgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBwcmlzbVNoYXBlQ2VudGVyLnkgKTtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGFuZ2xlXHJcbiAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKCAoIHByaXNtQ2VudGVyWSAtIHByaXNtUmVmZXJlbmNlWVBvc2l0aW9uICksICggcHJpc21DZW50ZXJYIC0gcHJpc21SZWZlcmVuY2VYUG9zaXRpb24gKSApO1xyXG4gICAgICAgIGtub2JDZW50ZXJQb2ludC54ID0gLWtub2JOb2RlLmdldFdpZHRoKCkgLSA3O1xyXG4gICAgICAgIGtub2JDZW50ZXJQb2ludC55ID0gLWtub2JOb2RlLmdldEhlaWdodCgpIC8gMiAtIDg7XHJcbiAgICAgICAga25vYk5vZGUucm90YXRlQXJvdW5kKCBrbm9iQ2VudGVyUG9pbnQsIGFuZ2xlICk7XHJcbiAgICAgICAga25vYk5vZGUuc2V0VHJhbnNsYXRpb24oIHByaXNtUmVmZXJlbmNlWFBvc2l0aW9uLCBwcmlzbVJlZmVyZW5jZVlQb3NpdGlvbiApO1xyXG5cclxuICAgICAgICBrbm9iTm9kZS50cmFuc2xhdGUoIGtub2JDZW50ZXJQb2ludCApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgcHJpc20uc2hhcGVQcm9wZXJ0eS5saW5rKCB0aGlzLnVwZGF0ZVByaXNtU2hhcGUgKTtcclxuICAgIHByaXNtLnBvc2l0aW9uUHJvcGVydHkubGluayggdGhpcy51cGRhdGVQcmlzbVNoYXBlICk7XHJcblxyXG4gICAgLy8gdXNlZCBpbiBQcmlzbVRvb2xib3hOb2RlXHJcbiAgICB0aGlzLnVwZGF0ZVByaXNtQ29sb3IgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGluZGV4T2ZSZWZyYWN0aW9uID0gcHJpc21zTW9kZWwucHJpc21NZWRpdW1Qcm9wZXJ0eS52YWx1ZS5zdWJzdGFuY2UuaW5kZXhPZlJlZnJhY3Rpb25Gb3JSZWRMaWdodDtcclxuXHJcbiAgICAgIHByaXNtUGF0aE5vZGUuZmlsbCA9IHByaXNtc01vZGVsLm1lZGl1bUNvbG9yRmFjdG9yeS5nZXRDb2xvciggaW5kZXhPZlJlZnJhY3Rpb24gKVxyXG4gICAgICAgIC53aXRoQWxwaGEoIEJlbmRpbmdMaWdodENvbnN0YW50cy5QUklTTV9OT0RFX0FMUEhBICk7XHJcbiAgICB9O1xyXG5cclxuICAgIHByaXNtc01vZGVsLm1lZGl1bUNvbG9yRmFjdG9yeS5saWdodFR5cGVQcm9wZXJ0eS5saW5rKCB0aGlzLnVwZGF0ZVByaXNtQ29sb3IgKTtcclxuICAgIHByaXNtc01vZGVsLnByaXNtTWVkaXVtUHJvcGVydHkubGluayggdGhpcy51cGRhdGVQcmlzbUNvbG9yICk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgZnJvbSB0aGUgb2NjbHVzaW9uIGhhbmRsZXIuICBUcmFuc2xhdGVzIHRoZSB2aWV3IGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50IGJ5IHRyYW5zbGF0aW5nIHRoZSBjb3JyZXNwb25kaW5nXHJcbiAgICAgKiBtb2RlbFxyXG4gICAgICovXHJcbiAgICB0aGlzLnRyYW5zbGF0ZVZpZXdYWSA9ICggeCwgeSApID0+IHtcclxuICAgICAgY29uc3QgZGVsdGEgPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxEZWx0YVhZKCB4LCB5ICk7XHJcbiAgICAgIHByaXNtLnRyYW5zbGF0ZSggZGVsdGEueCwgZGVsdGEueSApO1xyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbmJlbmRpbmdMaWdodC5yZWdpc3RlciggJ1ByaXNtTm9kZScsIFByaXNtTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUHJpc21Ob2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUV0RCxTQUFTQyxZQUFZLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQXNCLG1DQUFtQztBQUNqRyxPQUFPQyxRQUFRLE1BQU0sNkJBQTZCO0FBQ2xELE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MscUJBQXFCLE1BQU0sdUNBQXVDO0FBSXpFLE1BQU1DLFNBQVMsU0FBU0wsSUFBSSxDQUFDO0VBTTNCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTTSxXQUFXQSxDQUFFQyxXQUF3QixFQUFFQyxrQkFBdUMsRUFBRUMsS0FBWSxFQUFFQyxnQkFBc0IsRUFBRUMsVUFBZ0IsRUFBRUMsa0JBQXFDLEVBQ2hLQyxnQkFBa0QsRUFBRUMsTUFBZSxFQUFHO0lBRXhGLEtBQUssQ0FBRTtNQUFFQyxNQUFNLEVBQUU7SUFBVSxDQUFFLENBQUM7SUFDOUIsTUFBTUMsVUFBVSxHQUFHLEVBQUU7O0lBRXJCO0lBQ0EsTUFBTUMsUUFBUSxHQUFHLElBQUlsQixLQUFL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