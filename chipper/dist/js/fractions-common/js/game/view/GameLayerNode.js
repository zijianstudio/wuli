// Copyright 2018-2020, University of Colorado Boulder

/**
 * Layer implementation for the game screens (contains views for groups and pieces)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BuildingType from '../../building/model/BuildingType.js';
import BuildingLayerNode from '../../building/view/BuildingLayerNode.js';
import fractionsCommon from '../../fractionsCommon.js';
class GameLayerNode extends BuildingLayerNode {
  /**
   * @param {BuildingModel} model
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} shapeDragBoundsProperty
   * @param {Property.<Bounds2>} numberDragBoundsProperty
   * @param {Node} targetsContainer
   * @param {Node} panel
   * @param {Emitter} incorrectAttemptEmitter
   */
  constructor(model, modelViewTransform, shapeDragBoundsProperty, numberDragBoundsProperty, targetsContainer, panel, incorrectAttemptEmitter) {
    super(model, modelViewTransform, shapeDragBoundsProperty, numberDragBoundsProperty, targetsContainer, panel);

    // @private {Node}
    this.targetsContainer = targetsContainer;
    this.panel = panel;

    // @private {Emitter}
    this.incorrectAttemptEmitter = incorrectAttemptEmitter;
    this.initialize();
  }

  /**
   * Utility function for when a Group is dragged
   * @private
   *
   * @param {Group} group
   */
  onGroupDrag(group) {
    const modelPoints = group.centerPoints;
    const viewPoints = modelPoints.map(modelPoint => this.modelViewTransform.modelToViewPosition(modelPoint));
    const targetBounds = this.targetsContainer.bounds.dilated(10);
    if (_.some(viewPoints, viewPoint => targetBounds.containsPoint(viewPoint))) {
      const closestTarget = this.model.findClosestTarget(modelPoints);
      group.hoveringTargetProperty.value = closestTarget;
    } else {
      group.hoveringTargetProperty.value = null;
    }
  }

  /**
   * Utility function for when a Group is dropped
   * @private
   *
   * @param {Group} group
   */
  onGroupDrop(group) {
    group.hoveringTargetProperty.value = null;
    const modelPoints = group.centerPoints;
    const viewPoints = modelPoints.map(modelPoint => this.modelViewTransform.modelToViewPosition(modelPoint));
    const targetBounds = this.targetsContainer.bounds.dilated(10);
    const panelBounds = this.panel.bounds.dilated(10);
    if (_.some(viewPoints, viewPoint => targetBounds.containsPoint(viewPoint))) {
      const closestTarget = this.model.findClosestTarget(modelPoints);
      const isOpen = closestTarget.groupProperty.value === null;
      const isMatch = group.totalFraction.reduced().equals(closestTarget.fraction.reduced());
      if (isOpen) {
        if (isMatch) {
          if (group.type === BuildingType.SHAPE) {
            this.model.collectShapeGroup(group, closestTarget);
          } else {
            this.model.collectNumberGroup(group, closestTarget);
          }
          group.hoveringTargetProperty.value = null;
        } else {
          this.incorrectAttemptEmitter.emit();
        }
      }
      if (!isOpen || !isMatch) {
        this.model.centerGroup(group);
      }
    } else if (_.some(viewPoints, viewPoints => panelBounds.containsPoint(viewPoints))) {
      if (group.type === BuildingType.SHAPE) {
        this.model.returnShapeGroup(group);
      } else {
        this.model.returnNumberGroup(group);
      }
    }
  }

  /**
   * Called when a ShapeGroup is dragged.
   * @protected
   * @override
   *
   * @param {ShapeGroup} shapeGroup
   */
  onShapeGroupDrag(shapeGroup) {
    super.onShapeGroupDrag(shapeGroup);
    this.onGroupDrag(shapeGroup);
  }

  /**
   * Called when a ShapeGroup is dropped.
   * @protected
   * @override
   *
   * @param {ShapeGroup} shapeGroup
   */
  onShapeGroupDrop(shapeGroup) {
    super.onShapeGroupDrop(shapeGroup);
    this.onGroupDrop(shapeGroup);
  }

  /**
   * Called when a NumberGroup is dragged.
   * @protected
   * @override
   *
   * @param {NumberGroup} numberGroup
   */
  onNumberGroupDrag(numberGroup) {
    super.onNumberGroupDrag(numberGroup);
    this.onGroupDrag(numberGroup);
  }

  /**
   * Called when a NumberGroup is dropped.
   * @protected
   * @override
   *
   * @param {NumberGroup} numberGroup
   */
  onNumberGroupDrop(numberGroup) {
    super.onNumberGroupDrop(numberGroup);
    this.onGroupDrop(numberGroup);
  }
}
fractionsCommon.register('GameLayerNode', GameLayerNode);
export default GameLayerNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdWlsZGluZ1R5cGUiLCJCdWlsZGluZ0xheWVyTm9kZSIsImZyYWN0aW9uc0NvbW1vbiIsIkdhbWVMYXllck5vZGUiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwic2hhcGVEcmFnQm91bmRzUHJvcGVydHkiLCJudW1iZXJEcmFnQm91bmRzUHJvcGVydHkiLCJ0YXJnZXRzQ29udGFpbmVyIiwicGFuZWwiLCJpbmNvcnJlY3RBdHRlbXB0RW1pdHRlciIsImluaXRpYWxpemUiLCJvbkdyb3VwRHJhZyIsImdyb3VwIiwibW9kZWxQb2ludHMiLCJjZW50ZXJQb2ludHMiLCJ2aWV3UG9pbnRzIiwibWFwIiwibW9kZWxQb2ludCIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJ0YXJnZXRCb3VuZHMiLCJib3VuZHMiLCJkaWxhdGVkIiwiXyIsInNvbWUiLCJ2aWV3UG9pbnQiLCJjb250YWluc1BvaW50IiwiY2xvc2VzdFRhcmdldCIsImZpbmRDbG9zZXN0VGFyZ2V0IiwiaG92ZXJpbmdUYXJnZXRQcm9wZXJ0eSIsInZhbHVlIiwib25Hcm91cERyb3AiLCJwYW5lbEJvdW5kcyIsImlzT3BlbiIsImdyb3VwUHJvcGVydHkiLCJpc01hdGNoIiwidG90YWxGcmFjdGlvbiIsInJlZHVjZWQiLCJlcXVhbHMiLCJmcmFjdGlvbiIsInR5cGUiLCJTSEFQRSIsImNvbGxlY3RTaGFwZUdyb3VwIiwiY29sbGVjdE51bWJlckdyb3VwIiwiZW1pdCIsImNlbnRlckdyb3VwIiwicmV0dXJuU2hhcGVHcm91cCIsInJldHVybk51bWJlckdyb3VwIiwib25TaGFwZUdyb3VwRHJhZyIsInNoYXBlR3JvdXAiLCJvblNoYXBlR3JvdXBEcm9wIiwib25OdW1iZXJHcm91cERyYWciLCJudW1iZXJHcm91cCIsIm9uTnVtYmVyR3JvdXBEcm9wIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHYW1lTGF5ZXJOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIExheWVyIGltcGxlbWVudGF0aW9uIGZvciB0aGUgZ2FtZSBzY3JlZW5zIChjb250YWlucyB2aWV3cyBmb3IgZ3JvdXBzIGFuZCBwaWVjZXMpXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgQnVpbGRpbmdUeXBlIGZyb20gJy4uLy4uL2J1aWxkaW5nL21vZGVsL0J1aWxkaW5nVHlwZS5qcyc7XHJcbmltcG9ydCBCdWlsZGluZ0xheWVyTm9kZSBmcm9tICcuLi8uLi9idWlsZGluZy92aWV3L0J1aWxkaW5nTGF5ZXJOb2RlLmpzJztcclxuaW1wb3J0IGZyYWN0aW9uc0NvbW1vbiBmcm9tICcuLi8uLi9mcmFjdGlvbnNDb21tb24uanMnO1xyXG5cclxuY2xhc3MgR2FtZUxheWVyTm9kZSBleHRlbmRzIEJ1aWxkaW5nTGF5ZXJOb2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge0J1aWxkaW5nTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxCb3VuZHMyPn0gc2hhcGVEcmFnQm91bmRzUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxCb3VuZHMyPn0gbnVtYmVyRHJhZ0JvdW5kc1Byb3BlcnR5XHJcbiAgICogQHBhcmFtIHtOb2RlfSB0YXJnZXRzQ29udGFpbmVyXHJcbiAgICogQHBhcmFtIHtOb2RlfSBwYW5lbFxyXG4gICAqIEBwYXJhbSB7RW1pdHRlcn0gaW5jb3JyZWN0QXR0ZW1wdEVtaXR0ZXJcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIG1vZGVsVmlld1RyYW5zZm9ybSwgc2hhcGVEcmFnQm91bmRzUHJvcGVydHksIG51bWJlckRyYWdCb3VuZHNQcm9wZXJ0eSwgdGFyZ2V0c0NvbnRhaW5lciwgcGFuZWwsIGluY29ycmVjdEF0dGVtcHRFbWl0dGVyICkge1xyXG4gICAgc3VwZXIoIG1vZGVsLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHNoYXBlRHJhZ0JvdW5kc1Byb3BlcnR5LCBudW1iZXJEcmFnQm91bmRzUHJvcGVydHksIHRhcmdldHNDb250YWluZXIsIHBhbmVsICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge05vZGV9XHJcbiAgICB0aGlzLnRhcmdldHNDb250YWluZXIgPSB0YXJnZXRzQ29udGFpbmVyO1xyXG4gICAgdGhpcy5wYW5lbCA9IHBhbmVsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtFbWl0dGVyfVxyXG4gICAgdGhpcy5pbmNvcnJlY3RBdHRlbXB0RW1pdHRlciA9IGluY29ycmVjdEF0dGVtcHRFbWl0dGVyO1xyXG5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXRpbGl0eSBmdW5jdGlvbiBmb3Igd2hlbiBhIEdyb3VwIGlzIGRyYWdnZWRcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtHcm91cH0gZ3JvdXBcclxuICAgKi9cclxuICBvbkdyb3VwRHJhZyggZ3JvdXAgKSB7XHJcbiAgICBjb25zdCBtb2RlbFBvaW50cyA9IGdyb3VwLmNlbnRlclBvaW50cztcclxuICAgIGNvbnN0IHZpZXdQb2ludHMgPSBtb2RlbFBvaW50cy5tYXAoIG1vZGVsUG9pbnQgPT4gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggbW9kZWxQb2ludCApICk7XHJcbiAgICBjb25zdCB0YXJnZXRCb3VuZHMgPSB0aGlzLnRhcmdldHNDb250YWluZXIuYm91bmRzLmRpbGF0ZWQoIDEwICk7XHJcbiAgICBpZiAoIF8uc29tZSggdmlld1BvaW50cywgdmlld1BvaW50ID0+IHRhcmdldEJvdW5kcy5jb250YWluc1BvaW50KCB2aWV3UG9pbnQgKSApICkge1xyXG4gICAgICBjb25zdCBjbG9zZXN0VGFyZ2V0ID0gdGhpcy5tb2RlbC5maW5kQ2xvc2VzdFRhcmdldCggbW9kZWxQb2ludHMgKTtcclxuICAgICAgZ3JvdXAuaG92ZXJpbmdUYXJnZXRQcm9wZXJ0eS52YWx1ZSA9IGNsb3Nlc3RUYXJnZXQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgZ3JvdXAuaG92ZXJpbmdUYXJnZXRQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVdGlsaXR5IGZ1bmN0aW9uIGZvciB3aGVuIGEgR3JvdXAgaXMgZHJvcHBlZFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0dyb3VwfSBncm91cFxyXG4gICAqL1xyXG4gIG9uR3JvdXBEcm9wKCBncm91cCApIHtcclxuICAgIGdyb3VwLmhvdmVyaW5nVGFyZ2V0UHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG5cclxuICAgIGNvbnN0IG1vZGVsUG9pbnRzID0gZ3JvdXAuY2VudGVyUG9pbnRzO1xyXG4gICAgY29uc3Qgdmlld1BvaW50cyA9IG1vZGVsUG9pbnRzLm1hcCggbW9kZWxQb2ludCA9PiB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBtb2RlbFBvaW50ICkgKTtcclxuICAgIGNvbnN0IHRhcmdldEJvdW5kcyA9IHRoaXMudGFyZ2V0c0NvbnRhaW5lci5ib3VuZHMuZGlsYXRlZCggMTAgKTtcclxuICAgIGNvbnN0IHBhbmVsQm91bmRzID0gdGhpcy5wYW5lbC5ib3VuZHMuZGlsYXRlZCggMTAgKTtcclxuXHJcbiAgICBpZiAoIF8uc29tZSggdmlld1BvaW50cywgdmlld1BvaW50ID0+IHRhcmdldEJvdW5kcy5jb250YWluc1BvaW50KCB2aWV3UG9pbnQgKSApICkge1xyXG4gICAgICBjb25zdCBjbG9zZXN0VGFyZ2V0ID0gdGhpcy5tb2RlbC5maW5kQ2xvc2VzdFRhcmdldCggbW9kZWxQb2ludHMgKTtcclxuICAgICAgY29uc3QgaXNPcGVuID0gY2xvc2VzdFRhcmdldC5ncm91cFByb3BlcnR5LnZhbHVlID09PSBudWxsO1xyXG4gICAgICBjb25zdCBpc01hdGNoID0gZ3JvdXAudG90YWxGcmFjdGlvbi5yZWR1Y2VkKCkuZXF1YWxzKCBjbG9zZXN0VGFyZ2V0LmZyYWN0aW9uLnJlZHVjZWQoKSApO1xyXG5cclxuICAgICAgaWYgKCBpc09wZW4gKSB7XHJcbiAgICAgICAgaWYgKCBpc01hdGNoICkge1xyXG4gICAgICAgICAgaWYgKCBncm91cC50eXBlID09PSBCdWlsZGluZ1R5cGUuU0hBUEUgKSB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuY29sbGVjdFNoYXBlR3JvdXAoIGdyb3VwLCBjbG9zZXN0VGFyZ2V0ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5jb2xsZWN0TnVtYmVyR3JvdXAoIGdyb3VwLCBjbG9zZXN0VGFyZ2V0ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBncm91cC5ob3ZlcmluZ1RhcmdldFByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmluY29ycmVjdEF0dGVtcHRFbWl0dGVyLmVtaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggIWlzT3BlbiB8fCAhaXNNYXRjaCApIHtcclxuICAgICAgICB0aGlzLm1vZGVsLmNlbnRlckdyb3VwKCBncm91cCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggXy5zb21lKCB2aWV3UG9pbnRzLCB2aWV3UG9pbnRzID0+IHBhbmVsQm91bmRzLmNvbnRhaW5zUG9pbnQoIHZpZXdQb2ludHMgKSApICkge1xyXG4gICAgICBpZiAoIGdyb3VwLnR5cGUgPT09IEJ1aWxkaW5nVHlwZS5TSEFQRSApIHtcclxuICAgICAgICB0aGlzLm1vZGVsLnJldHVyblNoYXBlR3JvdXAoIGdyb3VwICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5yZXR1cm5OdW1iZXJHcm91cCggZ3JvdXAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gYSBTaGFwZUdyb3VwIGlzIGRyYWdnZWQuXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTaGFwZUdyb3VwfSBzaGFwZUdyb3VwXHJcbiAgICovXHJcbiAgb25TaGFwZUdyb3VwRHJhZyggc2hhcGVHcm91cCApIHtcclxuICAgIHN1cGVyLm9uU2hhcGVHcm91cERyYWcoIHNoYXBlR3JvdXAgKTtcclxuXHJcbiAgICB0aGlzLm9uR3JvdXBEcmFnKCBzaGFwZUdyb3VwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIFNoYXBlR3JvdXAgaXMgZHJvcHBlZC5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NoYXBlR3JvdXB9IHNoYXBlR3JvdXBcclxuICAgKi9cclxuICBvblNoYXBlR3JvdXBEcm9wKCBzaGFwZUdyb3VwICkge1xyXG4gICAgc3VwZXIub25TaGFwZUdyb3VwRHJvcCggc2hhcGVHcm91cCApO1xyXG5cclxuICAgIHRoaXMub25Hcm91cERyb3AoIHNoYXBlR3JvdXAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGEgTnVtYmVyR3JvdXAgaXMgZHJhZ2dlZC5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlckdyb3VwfSBudW1iZXJHcm91cFxyXG4gICAqL1xyXG4gIG9uTnVtYmVyR3JvdXBEcmFnKCBudW1iZXJHcm91cCApIHtcclxuICAgIHN1cGVyLm9uTnVtYmVyR3JvdXBEcmFnKCBudW1iZXJHcm91cCApO1xyXG5cclxuICAgIHRoaXMub25Hcm91cERyYWcoIG51bWJlckdyb3VwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIE51bWJlckdyb3VwIGlzIGRyb3BwZWQuXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJHcm91cH0gbnVtYmVyR3JvdXBcclxuICAgKi9cclxuICBvbk51bWJlckdyb3VwRHJvcCggbnVtYmVyR3JvdXAgKSB7XHJcbiAgICBzdXBlci5vbk51bWJlckdyb3VwRHJvcCggbnVtYmVyR3JvdXAgKTtcclxuXHJcbiAgICB0aGlzLm9uR3JvdXBEcm9wKCBudW1iZXJHcm91cCApO1xyXG4gIH1cclxufVxyXG5cclxuZnJhY3Rpb25zQ29tbW9uLnJlZ2lzdGVyKCAnR2FtZUxheWVyTm9kZScsIEdhbWVMYXllck5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgR2FtZUxheWVyTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsWUFBWSxNQUFNLHNDQUFzQztBQUMvRCxPQUFPQyxpQkFBaUIsTUFBTSwwQ0FBMEM7QUFDeEUsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUV0RCxNQUFNQyxhQUFhLFNBQVNGLGlCQUFpQixDQUFDO0VBQzVDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLGtCQUFrQixFQUFFQyx1QkFBdUIsRUFBRUMsd0JBQXdCLEVBQUVDLGdCQUFnQixFQUFFQyxLQUFLLEVBQUVDLHVCQUF1QixFQUFHO0lBQzVJLEtBQUssQ0FBRU4sS0FBSyxFQUFFQyxrQkFBa0IsRUFBRUMsdUJBQXVCLEVBQUVDLHdCQUF3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