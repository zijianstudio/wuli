// Copyright 2018-2023, University of Colorado Boulder

/**
 * Displays the axis of symmetry for a quadratic.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { Line, Node } from '../../../../scenery/js/imports.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQColors from '../GQColors.js';
import GQConstants from '../GQConstants.js';
import GQEquationNode from '../../common/view/GQEquationNode.js';
import GQEquationFactory from './GQEquationFactory.js';
export default class AxisOfSymmetryNode extends Node {
  constructor(quadraticProperty, graph, modelViewTransform, axisOfSymmetryVisibleProperty, equationsVisibleProperty) {
    // vertical line
    const lineNode = new Line(0, 0, 0, 1, {
      stroke: GQColors.AXIS_OF_SYMMETRY,
      lineWidth: GQConstants.AXIS_OF_SYMMETRY_LINE_WIDTH,
      lineDash: GQConstants.AXIS_OF_SYMMETRY_LINE_DASH
    });

    // equation on a translucent background
    const equationNode = new GQEquationNode({
      textOptions: {
        fill: GQColors.AXIS_OF_SYMMETRY,
        rotation: Math.PI / 2
      },
      visibleProperty: equationsVisibleProperty,
      maxHeight: 100 // maxHeight because equation is rotated, determined empirically
    });

    // endpoints of the line in model coordinates, note that y is inverted
    const minY = modelViewTransform.modelToViewY(graph.yRange.max);
    const maxY = modelViewTransform.modelToViewY(graph.yRange.min);
    super({
      children: [lineNode, equationNode],
      visibleProperty: new DerivedProperty([axisOfSymmetryVisibleProperty, quadraticProperty], (axisOfSymmetryVisible, quadratic) => axisOfSymmetryVisible &&
      // the Axis of Symmetry checkbox is checked
      quadratic.isaParabola() && quadratic.axisOfSymmetry !== undefined &&
      // the quadratic is a parabola, so has an axis of symmetry
      graph.xRange.contains(quadratic.axisOfSymmetry) // the axis of symmetry (x=N) is on the graph
      )
    });

    // update if the interactive quadratic is a parabola, and therefore has an axis of symmetry
    quadraticProperty.link(quadratic => {
      if (quadratic.isaParabola()) {
        const axisOfSymmetry = quadratic.axisOfSymmetry;
        assert && assert(axisOfSymmetry !== undefined);
        const vertex = quadratic.vertex;
        assert && assert(vertex !== undefined);

        // update the vertical line
        const x = modelViewTransform.modelToViewX(axisOfSymmetry);
        lineNode.setLine(x, minY, x, maxY);

        // update the equation's text
        equationNode.setTextString(GQEquationFactory.createAxisOfSymmetry(axisOfSymmetry));

        // position the equation to avoid overlapping vertex and y axis
        if (axisOfSymmetry > graph.yRange.max - GQConstants.EQUATION_Y_MARGIN) {
          // axis is at far right of graph, so put equation on left of axis
          equationNode.right = lineNode.left - GQConstants.EQUATION_CURVE_SPACING;
        } else if (axisOfSymmetry < graph.yRange.min + GQConstants.EQUATION_Y_MARGIN) {
          // axis is at far left of graph, so put equation on right of axis
          equationNode.left = lineNode.right + GQConstants.EQUATION_CURVE_SPACING;
        } else if (axisOfSymmetry >= 0) {
          // axis is at or to right of origin, so put equation on left of axis
          equationNode.left = lineNode.right + GQConstants.EQUATION_CURVE_SPACING;
        } else {
          // axis is to left of origin, os put equation on right of axis
          equationNode.right = lineNode.left - GQConstants.EQUATION_CURVE_SPACING;
        }

        // space between the equation and axis
        if (vertex.y >= 0) {
          equationNode.bottom = modelViewTransform.modelToViewY(graph.yRange.min + 1);
        } else {
          equationNode.top = modelViewTransform.modelToViewY(graph.yRange.max - 1);
        }
      }
    });
  }
}
graphingQuadratics.register('AxisOfSymmetryNode', AxisOfSymmetryNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJMaW5lIiwiTm9kZSIsImdyYXBoaW5nUXVhZHJhdGljcyIsIkdRQ29sb3JzIiwiR1FDb25zdGFudHMiLCJHUUVxdWF0aW9uTm9kZSIsIkdRRXF1YXRpb25GYWN0b3J5IiwiQXhpc09mU3ltbWV0cnlOb2RlIiwiY29uc3RydWN0b3IiLCJxdWFkcmF0aWNQcm9wZXJ0eSIsImdyYXBoIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiYXhpc09mU3ltbWV0cnlWaXNpYmxlUHJvcGVydHkiLCJlcXVhdGlvbnNWaXNpYmxlUHJvcGVydHkiLCJsaW5lTm9kZSIsInN0cm9rZSIsIkFYSVNfT0ZfU1lNTUVUUlkiLCJsaW5lV2lkdGgiLCJBWElTX09GX1NZTU1FVFJZX0xJTkVfV0lEVEgiLCJsaW5lRGFzaCIsIkFYSVNfT0ZfU1lNTUVUUllfTElORV9EQVNIIiwiZXF1YXRpb25Ob2RlIiwidGV4dE9wdGlvbnMiLCJmaWxsIiwicm90YXRpb24iLCJNYXRoIiwiUEkiLCJ2aXNpYmxlUHJvcGVydHkiLCJtYXhIZWlnaHQiLCJtaW5ZIiwibW9kZWxUb1ZpZXdZIiwieVJhbmdlIiwibWF4IiwibWF4WSIsIm1pbiIsImNoaWxkcmVuIiwiYXhpc09mU3ltbWV0cnlWaXNpYmxlIiwicXVhZHJhdGljIiwiaXNhUGFyYWJvbGEiLCJheGlzT2ZTeW1tZXRyeSIsInVuZGVmaW5lZCIsInhSYW5nZSIsImNvbnRhaW5zIiwibGluayIsImFzc2VydCIsInZlcnRleCIsIngiLCJtb2RlbFRvVmlld1giLCJzZXRMaW5lIiwic2V0VGV4dFN0cmluZyIsImNyZWF0ZUF4aXNPZlN5bW1ldHJ5IiwiRVFVQVRJT05fWV9NQVJHSU4iLCJyaWdodCIsImxlZnQiLCJFUVVBVElPTl9DVVJWRV9TUEFDSU5HIiwieSIsImJvdHRvbSIsInRvcCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQXhpc09mU3ltbWV0cnlOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERpc3BsYXlzIHRoZSBheGlzIG9mIHN5bW1ldHJ5IGZvciBhIHF1YWRyYXRpYy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEdyYXBoIGZyb20gJy4uLy4uLy4uLy4uL2dyYXBoaW5nLWxpbmVzL2pzL2NvbW1vbi9tb2RlbC9HcmFwaC5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IHsgTGluZSwgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBncmFwaGluZ1F1YWRyYXRpY3MgZnJvbSAnLi4vLi4vZ3JhcGhpbmdRdWFkcmF0aWNzLmpzJztcclxuaW1wb3J0IEdRQ29sb3JzIGZyb20gJy4uL0dRQ29sb3JzLmpzJztcclxuaW1wb3J0IEdRQ29uc3RhbnRzIGZyb20gJy4uL0dRQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFF1YWRyYXRpYyBmcm9tICcuLi9tb2RlbC9RdWFkcmF0aWMuanMnO1xyXG5pbXBvcnQgR1FFcXVhdGlvbk5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvR1FFcXVhdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgR1FFcXVhdGlvbkZhY3RvcnkgZnJvbSAnLi9HUUVxdWF0aW9uRmFjdG9yeS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF4aXNPZlN5bW1ldHJ5Tm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHF1YWRyYXRpY1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxRdWFkcmF0aWM+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhcGg6IEdyYXBoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgYXhpc09mU3ltbWV0cnlWaXNpYmxlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgZXF1YXRpb25zVmlzaWJsZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiApIHtcclxuXHJcbiAgICAvLyB2ZXJ0aWNhbCBsaW5lXHJcbiAgICBjb25zdCBsaW5lTm9kZSA9IG5ldyBMaW5lKCAwLCAwLCAwLCAxLCB7XHJcbiAgICAgIHN0cm9rZTogR1FDb2xvcnMuQVhJU19PRl9TWU1NRVRSWSxcclxuICAgICAgbGluZVdpZHRoOiBHUUNvbnN0YW50cy5BWElTX09GX1NZTU1FVFJZX0xJTkVfV0lEVEgsXHJcbiAgICAgIGxpbmVEYXNoOiBHUUNvbnN0YW50cy5BWElTX09GX1NZTU1FVFJZX0xJTkVfREFTSFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGVxdWF0aW9uIG9uIGEgdHJhbnNsdWNlbnQgYmFja2dyb3VuZFxyXG4gICAgY29uc3QgZXF1YXRpb25Ob2RlID0gbmV3IEdRRXF1YXRpb25Ob2RlKCB7XHJcbiAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgZmlsbDogR1FDb2xvcnMuQVhJU19PRl9TWU1NRVRSWSxcclxuICAgICAgICByb3RhdGlvbjogTWF0aC5QSSAvIDJcclxuICAgICAgfSxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBlcXVhdGlvbnNWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIG1heEhlaWdodDogMTAwIC8vIG1heEhlaWdodCBiZWNhdXNlIGVxdWF0aW9uIGlzIHJvdGF0ZWQsIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBlbmRwb2ludHMgb2YgdGhlIGxpbmUgaW4gbW9kZWwgY29vcmRpbmF0ZXMsIG5vdGUgdGhhdCB5IGlzIGludmVydGVkXHJcbiAgICBjb25zdCBtaW5ZID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggZ3JhcGgueVJhbmdlLm1heCApO1xyXG4gICAgY29uc3QgbWF4WSA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIGdyYXBoLnlSYW5nZS5taW4gKTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBjaGlsZHJlbjogWyBsaW5lTm9kZSwgZXF1YXRpb25Ob2RlIF0sXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgICBbIGF4aXNPZlN5bW1ldHJ5VmlzaWJsZVByb3BlcnR5LCBxdWFkcmF0aWNQcm9wZXJ0eSBdLFxyXG4gICAgICAgICggYXhpc09mU3ltbWV0cnlWaXNpYmxlLCBxdWFkcmF0aWMgKSA9PlxyXG4gICAgICAgICAgYXhpc09mU3ltbWV0cnlWaXNpYmxlICYmIC8vIHRoZSBBeGlzIG9mIFN5bW1ldHJ5IGNoZWNrYm94IGlzIGNoZWNrZWRcclxuICAgICAgICAgIHF1YWRyYXRpYy5pc2FQYXJhYm9sYSgpICYmICggcXVhZHJhdGljLmF4aXNPZlN5bW1ldHJ5ICE9PSB1bmRlZmluZWQgKSAmJiAvLyB0aGUgcXVhZHJhdGljIGlzIGEgcGFyYWJvbGEsIHNvIGhhcyBhbiBheGlzIG9mIHN5bW1ldHJ5XHJcbiAgICAgICAgICBncmFwaC54UmFuZ2UuY29udGFpbnMoIHF1YWRyYXRpYy5heGlzT2ZTeW1tZXRyeSApIC8vIHRoZSBheGlzIG9mIHN5bW1ldHJ5ICh4PU4pIGlzIG9uIHRoZSBncmFwaFxyXG4gICAgICApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIGlmIHRoZSBpbnRlcmFjdGl2ZSBxdWFkcmF0aWMgaXMgYSBwYXJhYm9sYSwgYW5kIHRoZXJlZm9yZSBoYXMgYW4gYXhpcyBvZiBzeW1tZXRyeVxyXG4gICAgcXVhZHJhdGljUHJvcGVydHkubGluayggcXVhZHJhdGljID0+IHtcclxuXHJcbiAgICAgIGlmICggcXVhZHJhdGljLmlzYVBhcmFib2xhKCkgKSB7XHJcbiAgICAgICAgY29uc3QgYXhpc09mU3ltbWV0cnkgPSBxdWFkcmF0aWMuYXhpc09mU3ltbWV0cnkhO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGF4aXNPZlN5bW1ldHJ5ICE9PSB1bmRlZmluZWQgKTtcclxuICAgICAgICBjb25zdCB2ZXJ0ZXggPSBxdWFkcmF0aWMudmVydGV4ITtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZXJ0ZXggIT09IHVuZGVmaW5lZCApO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgdGhlIHZlcnRpY2FsIGxpbmVcclxuICAgICAgICBjb25zdCB4ID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggYXhpc09mU3ltbWV0cnkgKTtcclxuICAgICAgICBsaW5lTm9kZS5zZXRMaW5lKCB4LCBtaW5ZLCB4LCBtYXhZICk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgZXF1YXRpb24ncyB0ZXh0XHJcbiAgICAgICAgZXF1YXRpb25Ob2RlLnNldFRleHRTdHJpbmcoIEdRRXF1YXRpb25GYWN0b3J5LmNyZWF0ZUF4aXNPZlN5bW1ldHJ5KCBheGlzT2ZTeW1tZXRyeSApICk7XHJcblxyXG4gICAgICAgIC8vIHBvc2l0aW9uIHRoZSBlcXVhdGlvbiB0byBhdm9pZCBvdmVybGFwcGluZyB2ZXJ0ZXggYW5kIHkgYXhpc1xyXG4gICAgICAgIGlmICggYXhpc09mU3ltbWV0cnkgPiBncmFwaC55UmFuZ2UubWF4IC0gR1FDb25zdGFudHMuRVFVQVRJT05fWV9NQVJHSU4gKSB7XHJcblxyXG4gICAgICAgICAgLy8gYXhpcyBpcyBhdCBmYXIgcmlnaHQgb2YgZ3JhcGgsIHNvIHB1dCBlcXVhdGlvbiBvbiBsZWZ0IG9mIGF4aXNcclxuICAgICAgICAgIGVxdWF0aW9uTm9kZS5yaWdodCA9IGxpbmVOb2RlLmxlZnQgLSBHUUNvbnN0YW50cy5FUVVBVElPTl9DVVJWRV9TUEFDSU5HO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggYXhpc09mU3ltbWV0cnkgPCBncmFwaC55UmFuZ2UubWluICsgR1FDb25zdGFudHMuRVFVQVRJT05fWV9NQVJHSU4gKSB7XHJcblxyXG4gICAgICAgICAgLy8gYXhpcyBpcyBhdCBmYXIgbGVmdCBvZiBncmFwaCwgc28gcHV0IGVxdWF0aW9uIG9uIHJpZ2h0IG9mIGF4aXNcclxuICAgICAgICAgIGVxdWF0aW9uTm9kZS5sZWZ0ID0gbGluZU5vZGUucmlnaHQgKyBHUUNvbnN0YW50cy5FUVVBVElPTl9DVVJWRV9TUEFDSU5HO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggYXhpc09mU3ltbWV0cnkgPj0gMCApIHtcclxuXHJcbiAgICAgICAgICAvLyBheGlzIGlzIGF0IG9yIHRvIHJpZ2h0IG9mIG9yaWdpbiwgc28gcHV0IGVxdWF0aW9uIG9uIGxlZnQgb2YgYXhpc1xyXG4gICAgICAgICAgZXF1YXRpb25Ob2RlLmxlZnQgPSBsaW5lTm9kZS5yaWdodCArIEdRQ29uc3RhbnRzLkVRVUFUSU9OX0NVUlZFX1NQQUNJTkc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIGF4aXMgaXMgdG8gbGVmdCBvZiBvcmlnaW4sIG9zIHB1dCBlcXVhdGlvbiBvbiByaWdodCBvZiBheGlzXHJcbiAgICAgICAgICBlcXVhdGlvbk5vZGUucmlnaHQgPSBsaW5lTm9kZS5sZWZ0IC0gR1FDb25zdGFudHMuRVFVQVRJT05fQ1VSVkVfU1BBQ0lORztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHNwYWNlIGJldHdlZW4gdGhlIGVxdWF0aW9uIGFuZCBheGlzXHJcbiAgICAgICAgaWYgKCB2ZXJ0ZXgueSA+PSAwICkge1xyXG4gICAgICAgICAgZXF1YXRpb25Ob2RlLmJvdHRvbSA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIGdyYXBoLnlSYW5nZS5taW4gKyAxICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgZXF1YXRpb25Ob2RlLnRvcCA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIGdyYXBoLnlSYW5nZS5tYXggLSAxICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmFwaGluZ1F1YWRyYXRpY3MucmVnaXN0ZXIoICdBeGlzT2ZTeW1tZXRyeU5vZGUnLCBBeGlzT2ZTeW1tZXRyeU5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUdwRSxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDOUQsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLFFBQVEsTUFBTSxnQkFBZ0I7QUFDckMsT0FBT0MsV0FBVyxNQUFNLG1CQUFtQjtBQUUzQyxPQUFPQyxjQUFjLE1BQU0scUNBQXFDO0FBQ2hFLE9BQU9DLGlCQUFpQixNQUFNLHdCQUF3QjtBQUd0RCxlQUFlLE1BQU1DLGtCQUFrQixTQUFTTixJQUFJLENBQUM7RUFFNUNPLFdBQVdBLENBQUVDLGlCQUErQyxFQUMvQ0MsS0FBWSxFQUNaQyxrQkFBdUMsRUFDdkNDLDZCQUF5RCxFQUN6REMsd0JBQW9ELEVBQUc7SUFFekU7SUFDQSxNQUFNQyxRQUFRLEdBQUcsSUFBSWQsSUFBSSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFB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