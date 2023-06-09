// Copyright 2013-2022, University of Colorado Boulder

/**
 * View representation for the attachment bar which goes from the pivot point
 * to the bottom center of the plank.
 *
 * @author John Blanco
 */

import { Circle, Node, Rectangle } from '../../../../scenery/js/imports.js';
import balancingAct from '../../balancingAct.js';

// constants
const PIVOT_RADIUS = 5;
const ATTACHMENT_BAR_WIDTH = PIVOT_RADIUS * 1.5;
class AttachmentBarNode extends Node {
  /**
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Plank} plank
   */
  constructor(modelViewTransform, plank) {
    super();
    const pivotPointPosInView = modelViewTransform.modelToViewPosition(plank.pivotPoint);

    // Add the bar, which goes from the pivot point to the bottom of the plank.
    const attachmentBarLength = modelViewTransform.modelToViewDeltaY(plank.bottomCenterPositionProperty.get().y - plank.pivotPoint.y);
    const attachmentBar = new Rectangle(pivotPointPosInView.x - ATTACHMENT_BAR_WIDTH / 2, pivotPointPosInView.y, ATTACHMENT_BAR_WIDTH, attachmentBarLength, 0, 0, {
      fill: 'rgb( 200, 200, 200 )',
      stroke: 'rgb( 50, 50, 50 )'
    });
    this.addChild(attachmentBar);

    // Rotate the bar as the plank tilts.
    let nodeRotation = 0;
    plank.tiltAngleProperty.link(angle => {
      attachmentBar.rotateAround(pivotPointPosInView, nodeRotation - angle);
      nodeRotation = angle;
    });

    // Add the pivot point, which is represented as a circle with a point in the middle.
    this.addChild(new Circle(PIVOT_RADIUS, {
      fill: 'rgb( 220, 220, 220 )',
      stroke: 'black',
      lineWidth: 1,
      center: pivotPointPosInView
    }));
    this.addChild(new Circle(1, {
      fill: 'black',
      center: pivotPointPosInView
    }));
  }
}
balancingAct.register('AttachmentBarNode', AttachmentBarNode);
export default AttachmentBarNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaXJjbGUiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiYmFsYW5jaW5nQWN0IiwiUElWT1RfUkFESVVTIiwiQVRUQUNITUVOVF9CQVJfV0lEVEgiLCJBdHRhY2htZW50QmFyTm9kZSIsImNvbnN0cnVjdG9yIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwicGxhbmsiLCJwaXZvdFBvaW50UG9zSW5WaWV3IiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsInBpdm90UG9pbnQiLCJhdHRhY2htZW50QmFyTGVuZ3RoIiwibW9kZWxUb1ZpZXdEZWx0YVkiLCJib3R0b21DZW50ZXJQb3NpdGlvblByb3BlcnR5IiwiZ2V0IiwieSIsImF0dGFjaG1lbnRCYXIiLCJ4IiwiZmlsbCIsInN0cm9rZSIsImFkZENoaWxkIiwibm9kZVJvdGF0aW9uIiwidGlsdEFuZ2xlUHJvcGVydHkiLCJsaW5rIiwiYW5nbGUiLCJyb3RhdGVBcm91bmQiLCJsaW5lV2lkdGgiLCJjZW50ZXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkF0dGFjaG1lbnRCYXJOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZpZXcgcmVwcmVzZW50YXRpb24gZm9yIHRoZSBhdHRhY2htZW50IGJhciB3aGljaCBnb2VzIGZyb20gdGhlIHBpdm90IHBvaW50XHJcbiAqIHRvIHRoZSBib3R0b20gY2VudGVyIG9mIHRoZSBwbGFuay5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCB7IENpcmNsZSwgTm9kZSwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGJhbGFuY2luZ0FjdCBmcm9tICcuLi8uLi9iYWxhbmNpbmdBY3QuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFBJVk9UX1JBRElVUyA9IDU7XHJcbmNvbnN0IEFUVEFDSE1FTlRfQkFSX1dJRFRIID0gUElWT1RfUkFESVVTICogMS41O1xyXG5cclxuY2xhc3MgQXR0YWNobWVudEJhck5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge1BsYW5rfSBwbGFua1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHBsYW5rICkge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIGNvbnN0IHBpdm90UG9pbnRQb3NJblZpZXcgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggcGxhbmsucGl2b3RQb2ludCApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgYmFyLCB3aGljaCBnb2VzIGZyb20gdGhlIHBpdm90IHBvaW50IHRvIHRoZSBib3R0b20gb2YgdGhlIHBsYW5rLlxyXG4gICAgY29uc3QgYXR0YWNobWVudEJhckxlbmd0aCA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWShcclxuICAgICAgcGxhbmsuYm90dG9tQ2VudGVyUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55IC0gcGxhbmsucGl2b3RQb2ludC55XHJcbiAgICApO1xyXG4gICAgY29uc3QgYXR0YWNobWVudEJhciA9IG5ldyBSZWN0YW5nbGUoIHBpdm90UG9pbnRQb3NJblZpZXcueCAtIEFUVEFDSE1FTlRfQkFSX1dJRFRIIC8gMiwgcGl2b3RQb2ludFBvc0luVmlldy55LCBBVFRBQ0hNRU5UX0JBUl9XSURUSCxcclxuICAgICAgYXR0YWNobWVudEJhckxlbmd0aCwgMCwgMCwgeyBmaWxsOiAncmdiKCAyMDAsIDIwMCwgMjAwICknLCBzdHJva2U6ICdyZ2IoIDUwLCA1MCwgNTAgKScgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYXR0YWNobWVudEJhciApO1xyXG5cclxuICAgIC8vIFJvdGF0ZSB0aGUgYmFyIGFzIHRoZSBwbGFuayB0aWx0cy5cclxuICAgIGxldCBub2RlUm90YXRpb24gPSAwO1xyXG4gICAgcGxhbmsudGlsdEFuZ2xlUHJvcGVydHkubGluayggYW5nbGUgPT4ge1xyXG4gICAgICBhdHRhY2htZW50QmFyLnJvdGF0ZUFyb3VuZCggcGl2b3RQb2ludFBvc0luVmlldywgbm9kZVJvdGF0aW9uIC0gYW5nbGUgKTtcclxuICAgICAgbm9kZVJvdGF0aW9uID0gYW5nbGU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBwaXZvdCBwb2ludCwgd2hpY2ggaXMgcmVwcmVzZW50ZWQgYXMgYSBjaXJjbGUgd2l0aCBhIHBvaW50IGluIHRoZSBtaWRkbGUuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgQ2lyY2xlKCBQSVZPVF9SQURJVVMsXHJcbiAgICAgIHtcclxuICAgICAgICBmaWxsOiAncmdiKCAyMjAsIDIyMCwgMjIwICknLFxyXG4gICAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgICAgY2VudGVyOiBwaXZvdFBvaW50UG9zSW5WaWV3XHJcbiAgICAgIH0gKSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IENpcmNsZSggMSxcclxuICAgICAge1xyXG4gICAgICAgIGZpbGw6ICdibGFjaycsXHJcbiAgICAgICAgY2VudGVyOiBwaXZvdFBvaW50UG9zSW5WaWV3XHJcbiAgICAgIH0gKSApO1xyXG4gIH1cclxufVxyXG5cclxuYmFsYW5jaW5nQWN0LnJlZ2lzdGVyKCAnQXR0YWNobWVudEJhck5vZGUnLCBBdHRhY2htZW50QmFyTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXR0YWNobWVudEJhck5vZGU7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxTQUFTLFFBQVEsbUNBQW1DO0FBQzNFLE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7O0FBRWhEO0FBQ0EsTUFBTUMsWUFBWSxHQUFHLENBQUM7QUFDdEIsTUFBTUMsb0JBQW9CLEdBQUdELFlBQVksR0FBRyxHQUFHO0FBRS9DLE1BQU1FLGlCQUFpQixTQUFTTCxJQUFJLENBQUM7RUFFbkM7QUFDRjtBQUNBO0FBQ0E7RUFDRU0sV0FBV0EsQ0FBRUMsa0JBQWtCLEVBQUVDLEtBQUssRUFBRztJQUN2QyxLQUFLLENBQUMsQ0FBQztJQUNQLE1BQU1DLG1CQUFtQixHQUFHRixrQkFBa0IsQ0FBQ0csbUJBQW1CLENBQUVGLEtBQUssQ0FBQ0csVUFBVyxDQUFDOztJQUV0RjtJQUNBLE1BQU1DLG1CQUFtQixHQUFHTCxrQkFBa0IsQ0FBQ00saUJBQWlCLENBQzlETCxLQUFLLENBQUNNLDRCQUE0QixDQUFDQyxHQUFHLENBQUMsQ0FBQyxDQUFDQyxDQUFDLEdBQUdSLEtBQUssQ0FBQ0csVUFBVSxDQUFDSyxDQUNoRSxDQUFDO0lBQ0QsTUFBTUMsYUFBYSxHQUFHLElBQUloQixTQUFTLENBQUVRLG1CQUFtQixDQUFDUyxDQUFDLEdBQUdkLG9CQUFvQixHQUFHLENBQUMsRUFBRUssbUJBQW1CLENBQUNPLENBQUMsRUFBRVosb0JBQW9CLEVBQ2hJUSxtQkFBbUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO01BQUVPLElBQUksRUFBRSxzQkFBc0I7TUFBRUMsTUFBTSxFQUFFO0lBQW9CLENBQUUsQ0FBQztJQUM1RixJQUFJLENBQUNDLFFBQVEsQ0FBRUosYUFBYyxDQUFDOztJQUU5QjtJQUNBLElBQUlLLFlBQVksR0FBRyxDQUFDO0lBQ3BCZCxLQUFLLENBQUNlLGlCQUFpQixDQUFDQyxJQUFJLENBQUVDLEtBQUssSUFBSTtNQUNyQ1IsYUFBYSxDQUFDUyxZQUFZLENBQUVqQixtQkFBbUIsRUFBRWEsWUFBWSxHQUFHRyxLQUFNLENBQUM7TUFDdkVILFlBQVksR0FBR0csS0FBSztJQUN0QixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNKLFFBQVEsQ0FBRSxJQUFJdEIsTUFBTSxDQUFFSSxZQUFZLEVBQ3JDO01BQ0VnQixJQUFJLEVBQUUsc0JBQXNCO01BQzVCQyxNQUFNLEVBQUUsT0FBTztNQUNmTyxTQUFTLEVBQUUsQ0FBQztNQUNaQyxNQUFNLEVBQUVuQjtJQUNWLENBQUUsQ0FBRSxDQUFDO0lBQ1AsSUFBSSxDQUFDWSxRQUFRLENBQUUsSUFBSXRCLE1BQU0sQ0FBRSxDQUFDLEVBQzFCO01BQ0VvQixJQUFJLEVBQUUsT0FBTztNQUNiUyxNQUFNLEVBQUVuQjtJQUNWLENBQUUsQ0FBRSxDQUFDO0VBQ1Q7QUFDRjtBQUVBUCxZQUFZLENBQUMyQixRQUFRLENBQUUsbUJBQW1CLEVBQUV4QixpQkFBa0IsQ0FBQztBQUUvRCxlQUFlQSxpQkFBaUIifQ==