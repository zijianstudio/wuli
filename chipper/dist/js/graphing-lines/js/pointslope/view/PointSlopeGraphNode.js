// Copyright 2013-2023, University of Colorado Boulder

/**
 * Graph that provides direct manipulation of a line in point-slope form.
 * Extends the base type by adding manipulators for point and slope.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import LineFormsGraphNode from '../../common/view/LineFormsGraphNode.js';
import SlopeManipulator from '../../common/view/manipulator/SlopeManipulator.js';
import X1Y1Manipulator from '../../common/view/manipulator/X1Y1Manipulator.js';
import graphingLines from '../../graphingLines.js';
import PointSlopeEquationNode from './PointSlopeEquationNode.js';
export default class PointSlopeGraphNode extends LineFormsGraphNode {
  constructor(model, viewProperties) {
    super(model, viewProperties, PointSlopeEquationNode.createDynamicLabel);
    const manipulatorRadius = model.modelViewTransform.modelToViewDeltaX(model.manipulatorRadius);

    // (x1,y1) point manipulator
    const x1y1Manipulator = new X1Y1Manipulator(manipulatorRadius, model.interactiveLineProperty, model.x1RangeProperty, model.y1RangeProperty, model.modelViewTransform, true /* constantSlope */);

    // slope manipulator
    const slopeManipulator = new SlopeManipulator(manipulatorRadius, model.interactiveLineProperty, model.riseRangeProperty, model.runRangeProperty, model.modelViewTransform);

    // rendering order
    this.addChild(x1y1Manipulator);
    this.addChild(slopeManipulator);

    // visibility of manipulators
    // unlink unnecessary because PointSlopeGraphNode exists for the lifetime of the sim.
    viewProperties.linesVisibleProperty.link(linesVisible => {
      x1y1Manipulator.visible = slopeManipulator.visible = linesVisible;
    });
  }
}
graphingLines.register('PointSlopeGraphNode', PointSlopeGraphNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5lRm9ybXNHcmFwaE5vZGUiLCJTbG9wZU1hbmlwdWxhdG9yIiwiWDFZMU1hbmlwdWxhdG9yIiwiZ3JhcGhpbmdMaW5lcyIsIlBvaW50U2xvcGVFcXVhdGlvbk5vZGUiLCJQb2ludFNsb3BlR3JhcGhOb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInZpZXdQcm9wZXJ0aWVzIiwiY3JlYXRlRHluYW1pY0xhYmVsIiwibWFuaXB1bGF0b3JSYWRpdXMiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJtb2RlbFRvVmlld0RlbHRhWCIsIngxeTFNYW5pcHVsYXRvciIsImludGVyYWN0aXZlTGluZVByb3BlcnR5IiwieDFSYW5nZVByb3BlcnR5IiwieTFSYW5nZVByb3BlcnR5Iiwic2xvcGVNYW5pcHVsYXRvciIsInJpc2VSYW5nZVByb3BlcnR5IiwicnVuUmFuZ2VQcm9wZXJ0eSIsImFkZENoaWxkIiwibGluZXNWaXNpYmxlUHJvcGVydHkiLCJsaW5rIiwibGluZXNWaXNpYmxlIiwidmlzaWJsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUG9pbnRTbG9wZUdyYXBoTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBHcmFwaCB0aGF0IHByb3ZpZGVzIGRpcmVjdCBtYW5pcHVsYXRpb24gb2YgYSBsaW5lIGluIHBvaW50LXNsb3BlIGZvcm0uXHJcbiAqIEV4dGVuZHMgdGhlIGJhc2UgdHlwZSBieSBhZGRpbmcgbWFuaXB1bGF0b3JzIGZvciBwb2ludCBhbmQgc2xvcGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IExpbmVGb3Jtc0dyYXBoTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9MaW5lRm9ybXNHcmFwaE5vZGUuanMnO1xyXG5pbXBvcnQgU2xvcGVNYW5pcHVsYXRvciBmcm9tICcuLi8uLi9jb21tb24vdmlldy9tYW5pcHVsYXRvci9TbG9wZU1hbmlwdWxhdG9yLmpzJztcclxuaW1wb3J0IFgxWTFNYW5pcHVsYXRvciBmcm9tICcuLi8uLi9jb21tb24vdmlldy9tYW5pcHVsYXRvci9YMVkxTWFuaXB1bGF0b3IuanMnO1xyXG5pbXBvcnQgZ3JhcGhpbmdMaW5lcyBmcm9tICcuLi8uLi9ncmFwaGluZ0xpbmVzLmpzJztcclxuaW1wb3J0IFBvaW50U2xvcGVFcXVhdGlvbk5vZGUgZnJvbSAnLi9Qb2ludFNsb3BlRXF1YXRpb25Ob2RlLmpzJztcclxuaW1wb3J0IFBvaW50U2xvcGVNb2RlbCBmcm9tICcuLi9tb2RlbC9Qb2ludFNsb3BlTW9kZWwuanMnO1xyXG5pbXBvcnQgTGluZUZvcm1zVmlld1Byb3BlcnRpZXMgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvTGluZUZvcm1zVmlld1Byb3BlcnRpZXMuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9pbnRTbG9wZUdyYXBoTm9kZSBleHRlbmRzIExpbmVGb3Jtc0dyYXBoTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IFBvaW50U2xvcGVNb2RlbCwgdmlld1Byb3BlcnRpZXM6IExpbmVGb3Jtc1ZpZXdQcm9wZXJ0aWVzICkge1xyXG5cclxuICAgIHN1cGVyKCBtb2RlbCwgdmlld1Byb3BlcnRpZXMsIFBvaW50U2xvcGVFcXVhdGlvbk5vZGUuY3JlYXRlRHluYW1pY0xhYmVsICk7XHJcblxyXG4gICAgY29uc3QgbWFuaXB1bGF0b3JSYWRpdXMgPSBtb2RlbC5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVgoIG1vZGVsLm1hbmlwdWxhdG9yUmFkaXVzICk7XHJcblxyXG4gICAgLy8gKHgxLHkxKSBwb2ludCBtYW5pcHVsYXRvclxyXG4gICAgY29uc3QgeDF5MU1hbmlwdWxhdG9yID0gbmV3IFgxWTFNYW5pcHVsYXRvcihcclxuICAgICAgbWFuaXB1bGF0b3JSYWRpdXMsIG1vZGVsLmludGVyYWN0aXZlTGluZVByb3BlcnR5LCBtb2RlbC54MVJhbmdlUHJvcGVydHksIG1vZGVsLnkxUmFuZ2VQcm9wZXJ0eSwgbW9kZWwubW9kZWxWaWV3VHJhbnNmb3JtLCB0cnVlIC8qIGNvbnN0YW50U2xvcGUgKi8gKTtcclxuXHJcbiAgICAvLyBzbG9wZSBtYW5pcHVsYXRvclxyXG4gICAgY29uc3Qgc2xvcGVNYW5pcHVsYXRvciA9IG5ldyBTbG9wZU1hbmlwdWxhdG9yKFxyXG4gICAgICBtYW5pcHVsYXRvclJhZGl1cywgbW9kZWwuaW50ZXJhY3RpdmVMaW5lUHJvcGVydHksIG1vZGVsLnJpc2VSYW5nZVByb3BlcnR5LCBtb2RlbC5ydW5SYW5nZVByb3BlcnR5LCBtb2RlbC5tb2RlbFZpZXdUcmFuc2Zvcm0gKTtcclxuXHJcbiAgICAvLyByZW5kZXJpbmcgb3JkZXJcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHgxeTFNYW5pcHVsYXRvciApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggc2xvcGVNYW5pcHVsYXRvciApO1xyXG5cclxuICAgIC8vIHZpc2liaWxpdHkgb2YgbWFuaXB1bGF0b3JzXHJcbiAgICAvLyB1bmxpbmsgdW5uZWNlc3NhcnkgYmVjYXVzZSBQb2ludFNsb3BlR3JhcGhOb2RlIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0uXHJcbiAgICB2aWV3UHJvcGVydGllcy5saW5lc1Zpc2libGVQcm9wZXJ0eS5saW5rKCBsaW5lc1Zpc2libGUgPT4ge1xyXG4gICAgICB4MXkxTWFuaXB1bGF0b3IudmlzaWJsZSA9IHNsb3BlTWFuaXB1bGF0b3IudmlzaWJsZSA9IGxpbmVzVmlzaWJsZTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmdyYXBoaW5nTGluZXMucmVnaXN0ZXIoICdQb2ludFNsb3BlR3JhcGhOb2RlJywgUG9pbnRTbG9wZUdyYXBoTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGtCQUFrQixNQUFNLHlDQUF5QztBQUN4RSxPQUFPQyxnQkFBZ0IsTUFBTSxtREFBbUQ7QUFDaEYsT0FBT0MsZUFBZSxNQUFNLGtEQUFrRDtBQUM5RSxPQUFPQyxhQUFhLE1BQU0sd0JBQXdCO0FBQ2xELE9BQU9DLHNCQUFzQixNQUFNLDZCQUE2QjtBQUloRSxlQUFlLE1BQU1DLG1CQUFtQixTQUFTTCxrQkFBa0IsQ0FBQztFQUUzRE0sV0FBV0EsQ0FBRUMsS0FBc0IsRUFBRUMsY0FBdUMsRUFBRztJQUVwRixLQUFLLENBQUVELEtBQUssRUFBRUMsY0FBYyxFQUFFSixzQkFBc0IsQ0FBQ0ssa0JBQW1CLENBQUM7SUFFekUsTUFBTUMsaUJBQWlCLEdBQUdILEtBQUssQ0FBQ0ksa0JBQWtCLENBQUNDLGlCQUFpQixDQUFFTCxLQUFLLENBQUNHLGlCQUFrQixDQUFDOztJQUUvRjtJQUNBLE1BQU1HLGVBQWUsR0FBRyxJQUFJWCxlQUFlLENBQ3pDUSxpQkFBaUIsRUFBRUgsS0FBSyxDQUFDTyx1QkFBdUIsRUFBRVAsS0FBSyxDQUFDUSxlQUFlLEVBQUVSLEtBQUssQ0FBQ1MsZUFBZSxFQUFFVCxLQUFLLENBQUNJLGtCQUFrQixFQUFFLElBQUksQ0FBQyxtQkFBb0IsQ0FBQzs7SUFFdEo7SUFDQSxNQUFNTSxnQkFBZ0IsR0FBRyxJQUFJaEIsZ0JBQWdCLENBQzNDUyxpQkFBaUIsRUFBRUgsS0FBSyxDQUFDTyx1QkFBdUIsRUFBRVAsS0FBSyxDQUFDVyxpQkFBaUIsRUFBRVgsS0FBSyxDQUFDWSxnQkFBZ0IsRUFBRVosS0FBSyxDQUFDSSxrQkFBbUIsQ0FBQzs7SUFFL0g7SUFDQSxJQUFJLENBQUNTLFFBQVEsQ0FBRVAsZUFBZ0IsQ0FBQztJQUNoQyxJQUFJLENBQUNPLFFBQVEsQ0FBRUgsZ0JBQWlCLENBQUM7O0lBRWpDO0lBQ0E7SUFDQVQsY0FBYyxDQUFDYSxvQkFBb0IsQ0FBQ0MsSUFBSSxDQUFFQyxZQUFZLElBQUk7TUFDeERWLGVBQWUsQ0FBQ1csT0FBTyxHQUFHUCxnQkFBZ0IsQ0FBQ08sT0FBTyxHQUFHRCxZQUFZO0lBQ25FLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQXBCLGFBQWEsQ0FBQ3NCLFFBQVEsQ0FBRSxxQkFBcUIsRUFBRXBCLG1CQUFvQixDQUFDIn0=