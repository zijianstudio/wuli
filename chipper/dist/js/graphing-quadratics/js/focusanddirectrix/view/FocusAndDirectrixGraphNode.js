// Copyright 2018-2023, University of Colorado Boulder

/**
 * FocusAndDirectrixGraphNode is the graph for the 'Focus & Directrix' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import GQGraphNode from '../../common/view/GQGraphNode.js';
import VertexManipulator from '../../common/view/VertexManipulator.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import DirectrixNode from './DirectrixNode.js';
import FocusManipulator from './FocusManipulator.js';
import PointOnParabolaLinesNode from './PointOnParabolaLinesNode.js';
import PointOnParabolaManipulator from './PointOnParabolaManipulator.js';
export default class FocusAndDirectrixGraphNode extends GQGraphNode {
  constructor(model, viewProperties, tandem) {
    const coordinatesVisibleProperty = viewProperties.coordinatesVisibleProperty;
    assert && assert(coordinatesVisibleProperty);
    const vertexVisibleProperty = viewProperties.vertexVisibleProperty;
    assert && assert(vertexVisibleProperty);

    // We do NOT want to instrument the graph, so tandem is not propagated via options
    const options = {};

    // Directrix line
    const directrixNode = new DirectrixNode(model.quadraticProperty, model.graph, model.modelViewTransform, viewProperties.directrixVisibleProperty, viewProperties.equationsVisibleProperty);

    // Vertex manipulator
    const vertexManipulator = new VertexManipulator(model.hProperty, model.kProperty, model.quadraticProperty, model.graph, model.modelViewTransform, vertexVisibleProperty, coordinatesVisibleProperty, {
      tandem: tandem.createTandem('vertexManipulator'),
      phetioDocumentation: 'the manipulator for changing the vertex'
    });

    // Focus manipulator
    const focusManipulator = new FocusManipulator(model.pProperty, model.quadraticProperty, model.graph, model.modelViewTransform, viewProperties.focusVisibleProperty, coordinatesVisibleProperty, {
      tandem: tandem.createTandem('focusManipulator'),
      phetioDocumentation: 'the manipulator for changing the focus'
    });

    // Point on Quadratic manipulator
    const pointOnParabolaManipulator = new PointOnParabolaManipulator(model.pointOnParabolaProperty, model.quadraticProperty, model.graph, model.modelViewTransform, coordinatesVisibleProperty, {
      visibleProperty: viewProperties.pointOnParabolaVisibleProperty,
      tandem: tandem.createTandem('pointOnParabolaManipulator'),
      phetioDocumentation: 'the manipulator for changing the point on the parabola'
    });

    // Lines that connect the point on the parabola to the focus and directrix
    const pointOnParabolaLinesNode = new PointOnParabolaLinesNode(model.quadraticProperty, model.pointOnParabolaProperty, model.modelViewTransform, viewProperties.pointOnParabolaVisibleProperty, viewProperties.focusVisibleProperty, viewProperties.directrixVisibleProperty);
    options.otherCurves = [directrixNode, pointOnParabolaLinesNode]; // rendered in this order
    options.decorations = [vertexManipulator, focusManipulator, pointOnParabolaManipulator]; // rendered in this order

    super(model, viewProperties, options);
  }
}
graphingQuadratics.register('FocusAndDirectrixGraphNode', FocusAndDirectrixGraphNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHUUdyYXBoTm9kZSIsIlZlcnRleE1hbmlwdWxhdG9yIiwiZ3JhcGhpbmdRdWFkcmF0aWNzIiwiRGlyZWN0cml4Tm9kZSIsIkZvY3VzTWFuaXB1bGF0b3IiLCJQb2ludE9uUGFyYWJvbGFMaW5lc05vZGUiLCJQb2ludE9uUGFyYWJvbGFNYW5pcHVsYXRvciIsIkZvY3VzQW5kRGlyZWN0cml4R3JhcGhOb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInZpZXdQcm9wZXJ0aWVzIiwidGFuZGVtIiwiY29vcmRpbmF0ZXNWaXNpYmxlUHJvcGVydHkiLCJhc3NlcnQiLCJ2ZXJ0ZXhWaXNpYmxlUHJvcGVydHkiLCJvcHRpb25zIiwiZGlyZWN0cml4Tm9kZSIsInF1YWRyYXRpY1Byb3BlcnR5IiwiZ3JhcGgiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJkaXJlY3RyaXhWaXNpYmxlUHJvcGVydHkiLCJlcXVhdGlvbnNWaXNpYmxlUHJvcGVydHkiLCJ2ZXJ0ZXhNYW5pcHVsYXRvciIsImhQcm9wZXJ0eSIsImtQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJmb2N1c01hbmlwdWxhdG9yIiwicFByb3BlcnR5IiwiZm9jdXNWaXNpYmxlUHJvcGVydHkiLCJwb2ludE9uUGFyYWJvbGFNYW5pcHVsYXRvciIsInBvaW50T25QYXJhYm9sYVByb3BlcnR5IiwidmlzaWJsZVByb3BlcnR5IiwicG9pbnRPblBhcmFib2xhVmlzaWJsZVByb3BlcnR5IiwicG9pbnRPblBhcmFib2xhTGluZXNOb2RlIiwib3RoZXJDdXJ2ZXMiLCJkZWNvcmF0aW9ucyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRm9jdXNBbmREaXJlY3RyaXhHcmFwaE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRm9jdXNBbmREaXJlY3RyaXhHcmFwaE5vZGUgaXMgdGhlIGdyYXBoIGZvciB0aGUgJ0ZvY3VzICYgRGlyZWN0cml4JyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEdRR3JhcGhOb2RlLCB7IEdRR3JhcGhOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0dRR3JhcGhOb2RlLmpzJztcclxuaW1wb3J0IFZlcnRleE1hbmlwdWxhdG9yIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1ZlcnRleE1hbmlwdWxhdG9yLmpzJztcclxuaW1wb3J0IGdyYXBoaW5nUXVhZHJhdGljcyBmcm9tICcuLi8uLi9ncmFwaGluZ1F1YWRyYXRpY3MuanMnO1xyXG5pbXBvcnQgRm9jdXNBbmREaXJlY3RyaXhNb2RlbCBmcm9tICcuLi9tb2RlbC9Gb2N1c0FuZERpcmVjdHJpeE1vZGVsLmpzJztcclxuaW1wb3J0IERpcmVjdHJpeE5vZGUgZnJvbSAnLi9EaXJlY3RyaXhOb2RlLmpzJztcclxuaW1wb3J0IEZvY3VzQW5kRGlyZWN0cml4Vmlld1Byb3BlcnRpZXMgZnJvbSAnLi9Gb2N1c0FuZERpcmVjdHJpeFZpZXdQcm9wZXJ0aWVzLmpzJztcclxuaW1wb3J0IEZvY3VzTWFuaXB1bGF0b3IgZnJvbSAnLi9Gb2N1c01hbmlwdWxhdG9yLmpzJztcclxuaW1wb3J0IFBvaW50T25QYXJhYm9sYUxpbmVzTm9kZSBmcm9tICcuL1BvaW50T25QYXJhYm9sYUxpbmVzTm9kZS5qcyc7XHJcbmltcG9ydCBQb2ludE9uUGFyYWJvbGFNYW5pcHVsYXRvciBmcm9tICcuL1BvaW50T25QYXJhYm9sYU1hbmlwdWxhdG9yLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZvY3VzQW5kRGlyZWN0cml4R3JhcGhOb2RlIGV4dGVuZHMgR1FHcmFwaE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBGb2N1c0FuZERpcmVjdHJpeE1vZGVsLCB2aWV3UHJvcGVydGllczogRm9jdXNBbmREaXJlY3RyaXhWaWV3UHJvcGVydGllcywgdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgY29uc3QgY29vcmRpbmF0ZXNWaXNpYmxlUHJvcGVydHkgPSB2aWV3UHJvcGVydGllcy5jb29yZGluYXRlc1Zpc2libGVQcm9wZXJ0eSE7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb29yZGluYXRlc1Zpc2libGVQcm9wZXJ0eSApO1xyXG4gICAgY29uc3QgdmVydGV4VmlzaWJsZVByb3BlcnR5ID0gdmlld1Byb3BlcnRpZXMudmVydGV4VmlzaWJsZVByb3BlcnR5ITtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlcnRleFZpc2libGVQcm9wZXJ0eSApO1xyXG5cclxuICAgIC8vIFdlIGRvIE5PVCB3YW50IHRvIGluc3RydW1lbnQgdGhlIGdyYXBoLCBzbyB0YW5kZW0gaXMgbm90IHByb3BhZ2F0ZWQgdmlhIG9wdGlvbnNcclxuICAgIGNvbnN0IG9wdGlvbnM6IEdRR3JhcGhOb2RlT3B0aW9ucyA9IHt9O1xyXG5cclxuICAgIC8vIERpcmVjdHJpeCBsaW5lXHJcbiAgICBjb25zdCBkaXJlY3RyaXhOb2RlID0gbmV3IERpcmVjdHJpeE5vZGUoXHJcbiAgICAgIG1vZGVsLnF1YWRyYXRpY1Byb3BlcnR5LFxyXG4gICAgICBtb2RlbC5ncmFwaCxcclxuICAgICAgbW9kZWwubW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICB2aWV3UHJvcGVydGllcy5kaXJlY3RyaXhWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHZpZXdQcm9wZXJ0aWVzLmVxdWF0aW9uc1Zpc2libGVQcm9wZXJ0eSApO1xyXG5cclxuICAgIC8vIFZlcnRleCBtYW5pcHVsYXRvclxyXG4gICAgY29uc3QgdmVydGV4TWFuaXB1bGF0b3IgPSBuZXcgVmVydGV4TWFuaXB1bGF0b3IoXHJcbiAgICAgIG1vZGVsLmhQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwua1Byb3BlcnR5LFxyXG4gICAgICBtb2RlbC5xdWFkcmF0aWNQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuZ3JhcGgsXHJcbiAgICAgIG1vZGVsLm1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgdmVydGV4VmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBjb29yZGluYXRlc1Zpc2libGVQcm9wZXJ0eSwge1xyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZlcnRleE1hbmlwdWxhdG9yJyApLFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgbWFuaXB1bGF0b3IgZm9yIGNoYW5naW5nIHRoZSB2ZXJ0ZXgnXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBGb2N1cyBtYW5pcHVsYXRvclxyXG4gICAgY29uc3QgZm9jdXNNYW5pcHVsYXRvciA9IG5ldyBGb2N1c01hbmlwdWxhdG9yKFxyXG4gICAgICBtb2RlbC5wUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLnF1YWRyYXRpY1Byb3BlcnR5LFxyXG4gICAgICBtb2RlbC5ncmFwaCxcclxuICAgICAgbW9kZWwubW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICB2aWV3UHJvcGVydGllcy5mb2N1c1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgY29vcmRpbmF0ZXNWaXNpYmxlUHJvcGVydHksIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdmb2N1c01hbmlwdWxhdG9yJyApLFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgbWFuaXB1bGF0b3IgZm9yIGNoYW5naW5nIHRoZSBmb2N1cydcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIFBvaW50IG9uIFF1YWRyYXRpYyBtYW5pcHVsYXRvclxyXG4gICAgY29uc3QgcG9pbnRPblBhcmFib2xhTWFuaXB1bGF0b3IgPSBuZXcgUG9pbnRPblBhcmFib2xhTWFuaXB1bGF0b3IoXHJcbiAgICAgIG1vZGVsLnBvaW50T25QYXJhYm9sYVByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5xdWFkcmF0aWNQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuZ3JhcGgsXHJcbiAgICAgIG1vZGVsLm1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgY29vcmRpbmF0ZXNWaXNpYmxlUHJvcGVydHksIHtcclxuICAgICAgICB2aXNpYmxlUHJvcGVydHk6IHZpZXdQcm9wZXJ0aWVzLnBvaW50T25QYXJhYm9sYVZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwb2ludE9uUGFyYWJvbGFNYW5pcHVsYXRvcicgKSxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGhlIG1hbmlwdWxhdG9yIGZvciBjaGFuZ2luZyB0aGUgcG9pbnQgb24gdGhlIHBhcmFib2xhJ1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gTGluZXMgdGhhdCBjb25uZWN0IHRoZSBwb2ludCBvbiB0aGUgcGFyYWJvbGEgdG8gdGhlIGZvY3VzIGFuZCBkaXJlY3RyaXhcclxuICAgIGNvbnN0IHBvaW50T25QYXJhYm9sYUxpbmVzTm9kZSA9IG5ldyBQb2ludE9uUGFyYWJvbGFMaW5lc05vZGUoXHJcbiAgICAgIG1vZGVsLnF1YWRyYXRpY1Byb3BlcnR5LFxyXG4gICAgICBtb2RlbC5wb2ludE9uUGFyYWJvbGFQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwubW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICB2aWV3UHJvcGVydGllcy5wb2ludE9uUGFyYWJvbGFWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHZpZXdQcm9wZXJ0aWVzLmZvY3VzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICB2aWV3UHJvcGVydGllcy5kaXJlY3RyaXhWaXNpYmxlUHJvcGVydHkgKTtcclxuXHJcbiAgICBvcHRpb25zLm90aGVyQ3VydmVzID0gWyBkaXJlY3RyaXhOb2RlLCBwb2ludE9uUGFyYWJvbGFMaW5lc05vZGUgXTsgLy8gcmVuZGVyZWQgaW4gdGhpcyBvcmRlclxyXG4gICAgb3B0aW9ucy5kZWNvcmF0aW9ucyA9IFsgdmVydGV4TWFuaXB1bGF0b3IsIGZvY3VzTWFuaXB1bGF0b3IsIHBvaW50T25QYXJhYm9sYU1hbmlwdWxhdG9yIF07IC8vIHJlbmRlcmVkIGluIHRoaXMgb3JkZXJcclxuXHJcbiAgICBzdXBlciggbW9kZWwsIHZpZXdQcm9wZXJ0aWVzLCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmFwaGluZ1F1YWRyYXRpY3MucmVnaXN0ZXIoICdGb2N1c0FuZERpcmVjdHJpeEdyYXBoTm9kZScsIEZvY3VzQW5kRGlyZWN0cml4R3JhcGhOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLFdBQVcsTUFBOEIsa0NBQWtDO0FBQ2xGLE9BQU9DLGlCQUFpQixNQUFNLHdDQUF3QztBQUN0RSxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFFNUQsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUU5QyxPQUFPQyxnQkFBZ0IsTUFBTSx1QkFBdUI7QUFDcEQsT0FBT0Msd0JBQXdCLE1BQU0sK0JBQStCO0FBQ3BFLE9BQU9DLDBCQUEwQixNQUFNLGlDQUFpQztBQUV4RSxlQUFlLE1BQU1DLDBCQUEwQixTQUFTUCxXQUFXLENBQUM7RUFFM0RRLFdBQVdBLENBQUVDLEtBQTZCLEVBQUVDLGNBQStDLEVBQUVDLE1BQWMsRUFBRztJQUVuSCxNQUFNQywwQkFBMEIsR0FBR0YsY0FBYyxDQUFDRSwwQkFBMkI7SUFDN0VDLE1BQU0sSUFBSUEsTUFBTSxDQUFFRCwwQkFBMkIsQ0FBQztJQUM5QyxNQUFNRSxxQkFBcUIsR0FBR0osY0FBYyxDQUFDSSxxQkFBc0I7SUFDbkVELE1BQU0sSUFBSUEsTUFBTSxDQUFFQyxxQkFBc0IsQ0FBQzs7SUFFekM7SUFDQSxNQUFNQyxPQUEyQixHQUFHLENBQUMsQ0FBQzs7SUFFdEM7SUFDQSxNQUFNQyxhQUFhLEdBQUcsSUFBSWIsYUFBYSxDQUNyQ00sS0FBSyxDQUFDUSxpQkFBaUIsRUFDdkJSLEtBQUssQ0FBQ1MsS0FBSyxFQUNYVCxLQUFLLENBQUNVLGtCQUFrQixFQUN4QlQsY0FBYyxDQUFDVSx3QkFBd0IsRUFDdkNWLGNBQWMsQ0FBQ1csd0JBQXlCLENBQUM7O0lBRTNDO0lBQ0EsTUFBTUMsaUJBQWlCLEdBQUcsSUFBSXJCLGlCQUFpQixDQUM3Q1EsS0FBSyxDQUFDYyxTQUFTLEVBQ2ZkLEtBQUssQ0FBQ2UsU0FBUyxFQUNmZixLQUFLLENBQUNRLGlCQUFpQixFQUN2QlIsS0FBSyxDQUFDUyxLQUFLLEVBQ1hULEtBQUssQ0FBQ1Usa0JBQWtCLEVBQ3hCTCxxQkFBcUIsRUFDckJGLDBCQUEwQixFQUFFO01BQzFCRCxNQUFNLEVBQUVBLE1BQU0sQ0FBQ2MsWUFBWSxDQUFFLG1CQUFvQixDQUFDO01BQ2xEQyxtQkFBbUIsRUFBRTtJQUN2QixDQUFFLENBQUM7O0lBRUw7SUFDQSxNQUFNQyxnQkFBZ0IsR0FBRyxJQUFJdkIsZ0JBQWdCLENBQzNDSyxLQUFLLENBQUNtQixTQUFTLEVBQ2ZuQixLQUFLLENBQUNRLGlCQUFpQixFQUN2QlIsS0FBSyxDQUFDUyxLQUFLLEVBQ1hULEtBQUssQ0FBQ1Usa0JBQWtCLEVBQ3hCVCxjQUFjLENBQUNtQixvQkFBb0IsRUFDbkNqQiwwQkFBMEIsRUFBRTtNQUMxQkQsTUFBTSxFQUFFQSxNQUFNLENBQUNjLFlBQVksQ0FBRSxrQkFBbUIsQ0FBQztNQUNqREMsbUJBQW1CLEVBQUU7SUFDdkIsQ0FBRSxDQUFDOztJQUVMO0lBQ0EsTUFBTUksMEJBQTBCLEdBQUcsSUFBSXhCLDBCQUEwQixDQUMvREcsS0FBSyxDQUFDc0IsdUJBQXVCLEVBQzdCdEIsS0FBSyxDQUFDUSxpQkFBaUIsRUFDdkJSLEtBQUssQ0FBQ1MsS0FBSyxFQUNYVCxLQUFLLENBQUNVLGtCQUFrQixFQUN4QlAsMEJBQTBCLEVBQUU7TUFDMUJvQixlQUFlLEVBQUV0QixjQUFjLENBQUN1Qiw4QkFBOEI7TUFDOUR0QixNQUFNLEVBQUVBLE1BQU0sQ0FBQ2MsWUFBWSxDQUFFLDRCQUE2QixDQUFDO01BQzNEQyxtQkFBbUIsRUFBRTtJQUN2QixDQUFFLENBQUM7O0lBRUw7SUFDQSxNQUFNUSx3QkFBd0IsR0FBRyxJQUFJN0Isd0JBQXdCLENBQzNESSxLQUFLLENBQUNRLGlCQUFpQixFQUN2QlIsS0FBSyxDQUFDc0IsdUJBQXVCLEVBQzdCdEIsS0FBSyxDQUFDVSxrQkFBa0IsRUFDeEJULGNBQWMsQ0FBQ3VCLDhCQUE4QixFQUM3Q3ZCLGNBQWMsQ0FBQ21CLG9CQUFvQixFQUNuQ25CLGNBQWMsQ0FBQ1Usd0JBQXlCLENBQUM7SUFFM0NMLE9BQU8sQ0FBQ29CLFdBQVcsR0FBRyxDQUFFbkIsYUFBYSxFQUFFa0Isd0JBQXdCLENBQUUsQ0FBQyxDQUFDO0lBQ25FbkIsT0FBTyxDQUFDcUIsV0FBVyxHQUFHLENBQUVkLGlCQUFpQixFQUFFSyxnQkFBZ0IsRUFBRUcsMEJBQTBCLENBQUUsQ0FBQyxDQUFDOztJQUUzRixLQUFLLENBQUVyQixLQUFLLEVBQUVDLGNBQWMsRUFBRUssT0FBUSxDQUFDO0VBQ3pDO0FBQ0Y7QUFFQWIsa0JBQWtCLENBQUNtQyxRQUFRLENBQUUsNEJBQTRCLEVBQUU5QiwwQkFBMkIsQ0FBQyJ9