// Copyright 2018-2023, University of Colorado Boulder

/**
 * PointToolNode is a tool displays the (x,y) coordinates of a point on the graph.
 * If it's sufficiently close to a curve, it will snap to that curve.
 * If it's not on the graph, it will display '( ?, ? )'.
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import PointToolBodyNode from '../../../../graphing-lines/js/common/view/PointToolBodyNode.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Circle, DragListener, Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQConstants from '../GQConstants.js';
import GQQueryParameters from '../GQQueryParameters.js';
const PROBE_RADIUS = 15;
const PROBE_STROKE = 'black';
export default class PointToolNode extends Node {
  constructor(pointTool, modelViewTransform, graph, graphContentsVisibleProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      backgroundNormalColor: 'white',
      foregroundNormalColor: 'black',
      foregroundHighlightColor: 'white',
      // NodeOptions
      cursor: 'pointer',
      phetioDocumentation: Tandem.PHET_IO_ENABLED ? pointTool.phetioDocumentation : '',
      phetioInputEnabledPropertyInstrumented: true
    }, providedOptions);

    // coordinatesProperty is null when the tool is not on the graph.
    const coordinatesProperty = new DerivedProperty([pointTool.positionProperty], position => graph.contains(position) ? position : null, {
      valueType: [Vector2, null]
    });
    const bodyNode = new PointToolBodyNode(coordinatesProperty, {
      backgroundWidth: 86,
      coordinatesSide: pointTool.probeSide,
      decimals: GQConstants.POINT_TOOL_DECIMALS
    });
    const probeNode = new ProbeNode();

    // Put probe on correct side of body. Move the body, since the probe establishes the origin.
    if (pointTool.probeSide === 'left') {
      bodyNode.left = probeNode.right - 1; // -1 for overlap, so you don't see a gap
    } else {
      probeNode.setScaleMagnitude(-1, 1); // reflect about the y axis
      bodyNode.right = probeNode.left + 1; // +1 for overlap, so you don't see a gap
    }

    bodyNode.centerY = probeNode.centerY;
    options.children = [bodyNode, probeNode];
    super(options);
    Multilink.multilink([pointTool.positionProperty, pointTool.quadraticProperty, graphContentsVisibleProperty], (position, onQuadratic, graphContentsVisible) => {
      // move to position
      this.translation = modelViewTransform.modelToViewPosition(position);

      // update colors
      if (graph.contains(position) && onQuadratic && graphContentsVisible) {
        // color code the display to onQuadratic
        bodyNode.setTextFill(options.foregroundHighlightColor);
        bodyNode.setBackgroundFill(onQuadratic.color);
      } else {
        bodyNode.setTextFill(options.foregroundNormalColor);
        bodyNode.setBackgroundFill(options.backgroundNormalColor);
      }
    });

    // add the drag listener
    this.addInputListener(new PointToolDragListener(this, pointTool, modelViewTransform, graph, graphContentsVisibleProperty, {
      tandem: options.tandem.createTandem('dragListener')
    }));

    // put a red dot at the origin, for debugging positioning
    if (GQQueryParameters.showOrigin) {
      this.addChild(new Circle(3, {
        fill: 'red'
      }));
    }
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}

/**
 * The probe that is attached to the side of the point tool. Drawn for attachment to left side.
 */

class ProbeNode extends Node {
  constructor() {
    // circle
    const circle = new Circle(PROBE_RADIUS, {
      lineWidth: 3,
      stroke: PROBE_STROKE,
      fill: 'rgba( 255, 255, 255, 0.2 )',
      // transparent white
      centerX: 0,
      centerY: 0
    });

    // crosshairs
    const crosshairs = new Path(new Shape().moveTo(-PROBE_RADIUS, 0).lineTo(PROBE_RADIUS, 0).moveTo(0, -PROBE_RADIUS).lineTo(0, PROBE_RADIUS), {
      stroke: PROBE_STROKE,
      center: circle.center
    });

    // shaft that connects the probe to the body
    const shaft = new Rectangle(0, 0, 0.5 * PROBE_RADIUS, 4, {
      fill: 'rgb( 144, 144, 144 )',
      left: circle.right,
      centerY: circle.centerY
    });
    super({
      children: [shaft, crosshairs, circle],
      // origin at the center
      x: 0,
      y: 0
    });
  }
}
class PointToolDragListener extends DragListener {
  constructor(targetNode, pointTool, modelViewTransform, graph, graphContentsVisibleProperty, providedOptions) {
    // When the point tool is snapped to a curve, it will also snap to integer x coordinates. This value determines
    // how close the point tool's x coordinate must be in order to snap to the closest integer x coordinate.
    // We decided that the most effective value was the smallest interval that the point tool displays.
    // See https://github.com/phetsims/graphing-quadratics/issues/169.
    const xSnapTolerance = 1 / Math.pow(10, GQConstants.POINT_TOOL_DECIMALS);
    let startOffset; // where the drag started, relative to the tool's origin, in parent view coordinates

    const options = combineOptions({
      allowTouchSnag: true,
      // note where the drag started
      start: (event, listener) => {
        // Note the mouse-click offset when dragging starts.
        const position = modelViewTransform.modelToViewPosition(pointTool.positionProperty.value);
        startOffset = targetNode.globalToParentPoint(event.pointer.point).minus(position);

        // Move the tool that we're dragging to the foreground.
        targetNode.moveToFront();
      },
      drag: (event, listener) => {
        // Convert drag point to model position
        const parentPoint = targetNode.globalToParentPoint(event.pointer.point).minus(startOffset);
        let position = modelViewTransform.viewToModelPosition(parentPoint);

        // constrained to dragBounds
        position = pointTool.dragBounds.closestPointTo(position);

        // If we're on the graph and the contents of the graph are visible...
        if (graph.contains(position) && graphContentsVisibleProperty.value) {
          // If we're close enough to a quadratic, snap to that quadratic.
          const snapQuadratic = pointTool.getQuadraticNear(position, GQQueryParameters.snapOffDistance, GQQueryParameters.snapOnDistance);
          if (snapQuadratic) {
            // Get the closest point that is on the quadratic.
            position = snapQuadratic.getClosestPoint(position);

            // We will be snapping the x value as it will be displayed by the point tool.
            // See See https://github.com/phetsims/graphing-quadratics/issues/169.
            let x = Utils.toFixedNumber(position.x, GQConstants.POINT_TOOL_DECIMALS);

            // If x is close to an integer value, snap to that integer value.
            // See https://github.com/phetsims/graphing-quadratics/issues/169.
            const closestInteger = Utils.toFixedNumber(x, 0);
            if (Math.abs(x - closestInteger) < xSnapTolerance) {
              x = closestInteger;
            }
            const y = snapQuadratic.solveY(x);
            position = new Vector2(x, y);
          }
        }

        // move the point tool
        pointTool.positionProperty.value = position;
      }
    }, providedOptions);
    super(options);
  }
}
graphingQuadratics.register('PointToolNode', PointToolNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJVdGlscyIsIlZlY3RvcjIiLCJQb2ludFRvb2xCb2R5Tm9kZSIsIlNoYXBlIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJDaXJjbGUiLCJEcmFnTGlzdGVuZXIiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlRhbmRlbSIsImdyYXBoaW5nUXVhZHJhdGljcyIsIkdRQ29uc3RhbnRzIiwiR1FRdWVyeVBhcmFtZXRlcnMiLCJQUk9CRV9SQURJVVMiLCJQUk9CRV9TVFJPS0UiLCJQb2ludFRvb2xOb2RlIiwiY29uc3RydWN0b3IiLCJwb2ludFRvb2wiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJncmFwaCIsImdyYXBoQ29udGVudHNWaXNpYmxlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiYmFja2dyb3VuZE5vcm1hbENvbG9yIiwiZm9yZWdyb3VuZE5vcm1hbENvbG9yIiwiZm9yZWdyb3VuZEhpZ2hsaWdodENvbG9yIiwiY3Vyc29yIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsIlBIRVRfSU9fRU5BQkxFRCIsInBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwiY29vcmRpbmF0ZXNQcm9wZXJ0eSIsInBvc2l0aW9uUHJvcGVydHkiLCJwb3NpdGlvbiIsImNvbnRhaW5zIiwidmFsdWVUeXBlIiwiYm9keU5vZGUiLCJiYWNrZ3JvdW5kV2lkdGgiLCJjb29yZGluYXRlc1NpZGUiLCJwcm9iZVNpZGUiLCJkZWNpbWFscyIsIlBPSU5UX1RPT0xfREVDSU1BTFMiLCJwcm9iZU5vZGUiLCJQcm9iZU5vZGUiLCJsZWZ0IiwicmlnaHQiLCJzZXRTY2FsZU1hZ25pdHVkZSIsImNlbnRlclkiLCJjaGlsZHJlbiIsIm11bHRpbGluayIsInF1YWRyYXRpY1Byb3BlcnR5Iiwib25RdWFkcmF0aWMiLCJncmFwaENvbnRlbnRzVmlzaWJsZSIsInRyYW5zbGF0aW9uIiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsInNldFRleHRGaWxsIiwic2V0QmFja2dyb3VuZEZpbGwiLCJjb2xvciIsImFkZElucHV0TGlzdGVuZXIiLCJQb2ludFRvb2xEcmFnTGlzdGVuZXIiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJzaG93T3JpZ2luIiwiYWRkQ2hpbGQiLCJmaWxsIiwiZGlzcG9zZSIsImFzc2VydCIsImNpcmNsZSIsImxpbmVXaWR0aCIsInN0cm9rZSIsImNlbnRlclgiLCJjcm9zc2hhaXJzIiwibW92ZVRvIiwibGluZVRvIiwiY2VudGVyIiwic2hhZnQiLCJ4IiwieSIsInRhcmdldE5vZGUiLCJ4U25hcFRvbGVyYW5jZSIsIk1hdGgiLCJwb3ciLCJzdGFydE9mZnNldCIsImFsbG93VG91Y2hTbmFnIiwic3RhcnQiLCJldmVudCIsImxpc3RlbmVyIiwidmFsdWUiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwicG9pbnRlciIsInBvaW50IiwibWludXMiLCJtb3ZlVG9Gcm9udCIsImRyYWciLCJwYXJlbnRQb2ludCIsInZpZXdUb01vZGVsUG9zaXRpb24iLCJkcmFnQm91bmRzIiwiY2xvc2VzdFBvaW50VG8iLCJzbmFwUXVhZHJhdGljIiwiZ2V0UXVhZHJhdGljTmVhciIsInNuYXBPZmZEaXN0YW5jZSIsInNuYXBPbkRpc3RhbmNlIiwiZ2V0Q2xvc2VzdFBvaW50IiwidG9GaXhlZE51bWJlciIsImNsb3Nlc3RJbnRlZ2VyIiwiYWJzIiwic29sdmVZIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQb2ludFRvb2xOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBvaW50VG9vbE5vZGUgaXMgYSB0b29sIGRpc3BsYXlzIHRoZSAoeCx5KSBjb29yZGluYXRlcyBvZiBhIHBvaW50IG9uIHRoZSBncmFwaC5cclxuICogSWYgaXQncyBzdWZmaWNpZW50bHkgY2xvc2UgdG8gYSBjdXJ2ZSwgaXQgd2lsbCBzbmFwIHRvIHRoYXQgY3VydmUuXHJcbiAqIElmIGl0J3Mgbm90IG9uIHRoZSBncmFwaCwgaXQgd2lsbCBkaXNwbGF5ICcoID8sID8gKScuXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmVhIExpblxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgR3JhcGggZnJvbSAnLi4vLi4vLi4vLi4vZ3JhcGhpbmctbGluZXMvanMvY29tbW9uL21vZGVsL0dyYXBoLmpzJztcclxuaW1wb3J0IFBvaW50VG9vbEJvZHlOb2RlIGZyb20gJy4uLy4uLy4uLy4uL2dyYXBoaW5nLWxpbmVzL2pzL2NvbW1vbi92aWV3L1BvaW50VG9vbEJvZHlOb2RlLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBEcmFnTGlzdGVuZXIsIERyYWdMaXN0ZW5lck9wdGlvbnMsIE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoLCBQcmVzc2VkRHJhZ0xpc3RlbmVyLCBSZWN0YW5nbGUsIFRDb2xvciB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBncmFwaGluZ1F1YWRyYXRpY3MgZnJvbSAnLi4vLi4vZ3JhcGhpbmdRdWFkcmF0aWNzLmpzJztcclxuaW1wb3J0IEdRQ29uc3RhbnRzIGZyb20gJy4uL0dRQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEdRUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uL0dRUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IFBvaW50VG9vbCBmcm9tICcuLi9tb2RlbC9Qb2ludFRvb2wuanMnO1xyXG5cclxuY29uc3QgUFJPQkVfUkFESVVTID0gMTU7XHJcbmNvbnN0IFBST0JFX1NUUk9LRSA9ICdibGFjayc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGJhY2tncm91bmROb3JtYWxDb2xvcj86IFRDb2xvcjtcclxuICBmb3JlZ3JvdW5kTm9ybWFsQ29sb3I/OiBUQ29sb3I7XHJcbiAgZm9yZWdyb3VuZEhpZ2hsaWdodENvbG9yPzogVENvbG9yO1xyXG59O1xyXG5cclxudHlwZSBQb2ludFRvb2xOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPE5vZGVPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb2ludFRvb2xOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcG9pbnRUb29sOiBQb2ludFRvb2wsIG1vZGVsVmlld1RyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMiwgZ3JhcGg6IEdyYXBoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhcGhDb250ZW50c1Zpc2libGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sIHByb3ZpZGVkT3B0aW9uczogUG9pbnRUb29sTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQb2ludFRvb2xOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICBiYWNrZ3JvdW5kTm9ybWFsQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgIGZvcmVncm91bmROb3JtYWxDb2xvcjogJ2JsYWNrJyxcclxuICAgICAgZm9yZWdyb3VuZEhpZ2hsaWdodENvbG9yOiAnd2hpdGUnLFxyXG5cclxuICAgICAgLy8gTm9kZU9wdGlvbnNcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246IFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgPyBwb2ludFRvb2wucGhldGlvRG9jdW1lbnRhdGlvbiA6ICcnLFxyXG4gICAgICBwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gY29vcmRpbmF0ZXNQcm9wZXJ0eSBpcyBudWxsIHdoZW4gdGhlIHRvb2wgaXMgbm90IG9uIHRoZSBncmFwaC5cclxuICAgIGNvbnN0IGNvb3JkaW5hdGVzUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHBvaW50VG9vbC5wb3NpdGlvblByb3BlcnR5IF0sXHJcbiAgICAgIHBvc2l0aW9uID0+ICggZ3JhcGguY29udGFpbnMoIHBvc2l0aW9uICkgPyBwb3NpdGlvbiA6IG51bGwgKSwge1xyXG4gICAgICAgIHZhbHVlVHlwZTogWyBWZWN0b3IyLCBudWxsIF1cclxuICAgICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGJvZHlOb2RlID0gbmV3IFBvaW50VG9vbEJvZHlOb2RlKCBjb29yZGluYXRlc1Byb3BlcnR5LCB7XHJcbiAgICAgIGJhY2tncm91bmRXaWR0aDogODYsXHJcbiAgICAgIGNvb3JkaW5hdGVzU2lkZTogcG9pbnRUb29sLnByb2JlU2lkZSxcclxuICAgICAgZGVjaW1hbHM6IEdRQ29uc3RhbnRzLlBPSU5UX1RPT0xfREVDSU1BTFNcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBwcm9iZU5vZGUgPSBuZXcgUHJvYmVOb2RlKCk7XHJcblxyXG4gICAgLy8gUHV0IHByb2JlIG9uIGNvcnJlY3Qgc2lkZSBvZiBib2R5LiBNb3ZlIHRoZSBib2R5LCBzaW5jZSB0aGUgcHJvYmUgZXN0YWJsaXNoZXMgdGhlIG9yaWdpbi5cclxuICAgIGlmICggcG9pbnRUb29sLnByb2JlU2lkZSA9PT0gJ2xlZnQnICkge1xyXG4gICAgICBib2R5Tm9kZS5sZWZ0ID0gcHJvYmVOb2RlLnJpZ2h0IC0gMTsgLy8gLTEgZm9yIG92ZXJsYXAsIHNvIHlvdSBkb24ndCBzZWUgYSBnYXBcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBwcm9iZU5vZGUuc2V0U2NhbGVNYWduaXR1ZGUoIC0xLCAxICk7IC8vIHJlZmxlY3QgYWJvdXQgdGhlIHkgYXhpc1xyXG4gICAgICBib2R5Tm9kZS5yaWdodCA9IHByb2JlTm9kZS5sZWZ0ICsgMTsgLy8gKzEgZm9yIG92ZXJsYXAsIHNvIHlvdSBkb24ndCBzZWUgYSBnYXBcclxuICAgIH1cclxuICAgIGJvZHlOb2RlLmNlbnRlclkgPSBwcm9iZU5vZGUuY2VudGVyWTtcclxuXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBib2R5Tm9kZSwgcHJvYmVOb2RlIF07XHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgcG9pbnRUb29sLnBvc2l0aW9uUHJvcGVydHksIHBvaW50VG9vbC5xdWFkcmF0aWNQcm9wZXJ0eSwgZ3JhcGhDb250ZW50c1Zpc2libGVQcm9wZXJ0eSBdLFxyXG4gICAgICAoIHBvc2l0aW9uLCBvblF1YWRyYXRpYywgZ3JhcGhDb250ZW50c1Zpc2libGUgKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIG1vdmUgdG8gcG9zaXRpb25cclxuICAgICAgICB0aGlzLnRyYW5zbGF0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHBvc2l0aW9uICk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBjb2xvcnNcclxuICAgICAgICBpZiAoIGdyYXBoLmNvbnRhaW5zKCBwb3NpdGlvbiApICYmIG9uUXVhZHJhdGljICYmIGdyYXBoQ29udGVudHNWaXNpYmxlICkge1xyXG5cclxuICAgICAgICAgIC8vIGNvbG9yIGNvZGUgdGhlIGRpc3BsYXkgdG8gb25RdWFkcmF0aWNcclxuICAgICAgICAgIGJvZHlOb2RlLnNldFRleHRGaWxsKCBvcHRpb25zLmZvcmVncm91bmRIaWdobGlnaHRDb2xvciApO1xyXG4gICAgICAgICAgYm9keU5vZGUuc2V0QmFja2dyb3VuZEZpbGwoIG9uUXVhZHJhdGljLmNvbG9yICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgYm9keU5vZGUuc2V0VGV4dEZpbGwoIG9wdGlvbnMuZm9yZWdyb3VuZE5vcm1hbENvbG9yICk7XHJcbiAgICAgICAgICBib2R5Tm9kZS5zZXRCYWNrZ3JvdW5kRmlsbCggb3B0aW9ucy5iYWNrZ3JvdW5kTm9ybWFsQ29sb3IgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIGRyYWcgbGlzdGVuZXJcclxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggbmV3IFBvaW50VG9vbERyYWdMaXN0ZW5lciggdGhpcywgcG9pbnRUb29sLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIGdyYXBoLFxyXG4gICAgICBncmFwaENvbnRlbnRzVmlzaWJsZVByb3BlcnR5LCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkcmFnTGlzdGVuZXInIClcclxuICAgICAgfSApICk7XHJcblxyXG4gICAgLy8gcHV0IGEgcmVkIGRvdCBhdCB0aGUgb3JpZ2luLCBmb3IgZGVidWdnaW5nIHBvc2l0aW9uaW5nXHJcbiAgICBpZiAoIEdRUXVlcnlQYXJhbWV0ZXJzLnNob3dPcmlnaW4gKSB7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBDaXJjbGUoIDMsIHsgZmlsbDogJ3JlZCcgfSApICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBwcm9iZSB0aGF0IGlzIGF0dGFjaGVkIHRvIHRoZSBzaWRlIG9mIHRoZSBwb2ludCB0b29sLiBEcmF3biBmb3IgYXR0YWNobWVudCB0byBsZWZ0IHNpZGUuXHJcbiAqL1xyXG5cclxuY2xhc3MgUHJvYmVOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAvLyBjaXJjbGVcclxuICAgIGNvbnN0IGNpcmNsZSA9IG5ldyBDaXJjbGUoIFBST0JFX1JBRElVUywge1xyXG4gICAgICBsaW5lV2lkdGg6IDMsXHJcbiAgICAgIHN0cm9rZTogUFJPQkVfU1RST0tFLFxyXG4gICAgICBmaWxsOiAncmdiYSggMjU1LCAyNTUsIDI1NSwgMC4yICknLCAvLyB0cmFuc3BhcmVudCB3aGl0ZVxyXG4gICAgICBjZW50ZXJYOiAwLFxyXG4gICAgICBjZW50ZXJZOiAwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY3Jvc3NoYWlyc1xyXG4gICAgY29uc3QgY3Jvc3NoYWlycyA9IG5ldyBQYXRoKCBuZXcgU2hhcGUoKVxyXG4gICAgICAubW92ZVRvKCAtUFJPQkVfUkFESVVTLCAwIClcclxuICAgICAgLmxpbmVUbyggUFJPQkVfUkFESVVTLCAwIClcclxuICAgICAgLm1vdmVUbyggMCwgLVBST0JFX1JBRElVUyApXHJcbiAgICAgIC5saW5lVG8oIDAsIFBST0JFX1JBRElVUyApLCB7XHJcbiAgICAgIHN0cm9rZTogUFJPQkVfU1RST0tFLFxyXG4gICAgICBjZW50ZXI6IGNpcmNsZS5jZW50ZXJcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBzaGFmdCB0aGF0IGNvbm5lY3RzIHRoZSBwcm9iZSB0byB0aGUgYm9keVxyXG4gICAgY29uc3Qgc2hhZnQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAwLjUgKiBQUk9CRV9SQURJVVMsIDQsIHtcclxuICAgICAgZmlsbDogJ3JnYiggMTQ0LCAxNDQsIDE0NCApJyxcclxuICAgICAgbGVmdDogY2lyY2xlLnJpZ2h0LFxyXG4gICAgICBjZW50ZXJZOiBjaXJjbGUuY2VudGVyWVxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHNoYWZ0LCBjcm9zc2hhaXJzLCBjaXJjbGUgXSxcclxuXHJcbiAgICAgIC8vIG9yaWdpbiBhdCB0aGUgY2VudGVyXHJcbiAgICAgIHg6IDAsXHJcbiAgICAgIHk6IDBcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFBvaW50VG9vbERyYWdMaXN0ZW5lciBleHRlbmRzIERyYWdMaXN0ZW5lciB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGFyZ2V0Tm9kZTogTm9kZSwgcG9pbnRUb29sOiBQb2ludFRvb2wsIG1vZGVsVmlld1RyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMiwgZ3JhcGg6IEdyYXBoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhcGhDb250ZW50c1Zpc2libGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IERyYWdMaXN0ZW5lck9wdGlvbnM8UHJlc3NlZERyYWdMaXN0ZW5lcj4gKSB7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgcG9pbnQgdG9vbCBpcyBzbmFwcGVkIHRvIGEgY3VydmUsIGl0IHdpbGwgYWxzbyBzbmFwIHRvIGludGVnZXIgeCBjb29yZGluYXRlcy4gVGhpcyB2YWx1ZSBkZXRlcm1pbmVzXHJcbiAgICAvLyBob3cgY2xvc2UgdGhlIHBvaW50IHRvb2wncyB4IGNvb3JkaW5hdGUgbXVzdCBiZSBpbiBvcmRlciB0byBzbmFwIHRvIHRoZSBjbG9zZXN0IGludGVnZXIgeCBjb29yZGluYXRlLlxyXG4gICAgLy8gV2UgZGVjaWRlZCB0aGF0IHRoZSBtb3N0IGVmZmVjdGl2ZSB2YWx1ZSB3YXMgdGhlIHNtYWxsZXN0IGludGVydmFsIHRoYXQgdGhlIHBvaW50IHRvb2wgZGlzcGxheXMuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXBoaW5nLXF1YWRyYXRpY3MvaXNzdWVzLzE2OS5cclxuICAgIGNvbnN0IHhTbmFwVG9sZXJhbmNlID0gMSAvIE1hdGgucG93KCAxMCwgR1FDb25zdGFudHMuUE9JTlRfVE9PTF9ERUNJTUFMUyApO1xyXG5cclxuICAgIGxldCBzdGFydE9mZnNldDogVmVjdG9yMjsgLy8gd2hlcmUgdGhlIGRyYWcgc3RhcnRlZCwgcmVsYXRpdmUgdG8gdGhlIHRvb2wncyBvcmlnaW4sIGluIHBhcmVudCB2aWV3IGNvb3JkaW5hdGVzXHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPERyYWdMaXN0ZW5lck9wdGlvbnM8UHJlc3NlZERyYWdMaXN0ZW5lcj4+KCB7XHJcblxyXG4gICAgICBhbGxvd1RvdWNoU25hZzogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIG5vdGUgd2hlcmUgdGhlIGRyYWcgc3RhcnRlZFxyXG4gICAgICBzdGFydDogKCBldmVudCwgbGlzdGVuZXIgKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIE5vdGUgdGhlIG1vdXNlLWNsaWNrIG9mZnNldCB3aGVuIGRyYWdnaW5nIHN0YXJ0cy5cclxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBwb2ludFRvb2wucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICAgIHN0YXJ0T2Zmc2V0ID0gdGFyZ2V0Tm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkubWludXMoIHBvc2l0aW9uICk7XHJcblxyXG4gICAgICAgIC8vIE1vdmUgdGhlIHRvb2wgdGhhdCB3ZSdyZSBkcmFnZ2luZyB0byB0aGUgZm9yZWdyb3VuZC5cclxuICAgICAgICB0YXJnZXROb2RlLm1vdmVUb0Zyb250KCk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBkcmFnOiAoIGV2ZW50LCBsaXN0ZW5lciApID0+IHtcclxuXHJcbiAgICAgICAgLy8gQ29udmVydCBkcmFnIHBvaW50IHRvIG1vZGVsIHBvc2l0aW9uXHJcbiAgICAgICAgY29uc3QgcGFyZW50UG9pbnQgPSB0YXJnZXROb2RlLmdsb2JhbFRvUGFyZW50UG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKS5taW51cyggc3RhcnRPZmZzZXQgKTtcclxuICAgICAgICBsZXQgcG9zaXRpb24gPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxQb3NpdGlvbiggcGFyZW50UG9pbnQgKTtcclxuXHJcbiAgICAgICAgLy8gY29uc3RyYWluZWQgdG8gZHJhZ0JvdW5kc1xyXG4gICAgICAgIHBvc2l0aW9uID0gcG9pbnRUb29sLmRyYWdCb3VuZHMuY2xvc2VzdFBvaW50VG8oIHBvc2l0aW9uICk7XHJcblxyXG4gICAgICAgIC8vIElmIHdlJ3JlIG9uIHRoZSBncmFwaCBhbmQgdGhlIGNvbnRlbnRzIG9mIHRoZSBncmFwaCBhcmUgdmlzaWJsZS4uLlxyXG4gICAgICAgIGlmICggZ3JhcGguY29udGFpbnMoIHBvc2l0aW9uICkgJiYgZ3JhcGhDb250ZW50c1Zpc2libGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuXHJcbiAgICAgICAgICAvLyBJZiB3ZSdyZSBjbG9zZSBlbm91Z2ggdG8gYSBxdWFkcmF0aWMsIHNuYXAgdG8gdGhhdCBxdWFkcmF0aWMuXHJcbiAgICAgICAgICBjb25zdCBzbmFwUXVhZHJhdGljID0gcG9pbnRUb29sLmdldFF1YWRyYXRpY05lYXIoIHBvc2l0aW9uLFxyXG4gICAgICAgICAgICBHUVF1ZXJ5UGFyYW1ldGVycy5zbmFwT2ZmRGlzdGFuY2UsIEdRUXVlcnlQYXJhbWV0ZXJzLnNuYXBPbkRpc3RhbmNlICk7XHJcbiAgICAgICAgICBpZiAoIHNuYXBRdWFkcmF0aWMgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBHZXQgdGhlIGNsb3Nlc3QgcG9pbnQgdGhhdCBpcyBvbiB0aGUgcXVhZHJhdGljLlxyXG4gICAgICAgICAgICBwb3NpdGlvbiA9IHNuYXBRdWFkcmF0aWMuZ2V0Q2xvc2VzdFBvaW50KCBwb3NpdGlvbiApO1xyXG5cclxuICAgICAgICAgICAgLy8gV2Ugd2lsbCBiZSBzbmFwcGluZyB0aGUgeCB2YWx1ZSBhcyBpdCB3aWxsIGJlIGRpc3BsYXllZCBieSB0aGUgcG9pbnQgdG9vbC5cclxuICAgICAgICAgICAgLy8gU2VlIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ3JhcGhpbmctcXVhZHJhdGljcy9pc3N1ZXMvMTY5LlxyXG4gICAgICAgICAgICBsZXQgeCA9IFV0aWxzLnRvRml4ZWROdW1iZXIoIHBvc2l0aW9uLngsIEdRQ29uc3RhbnRzLlBPSU5UX1RPT0xfREVDSU1BTFMgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHggaXMgY2xvc2UgdG8gYW4gaW50ZWdlciB2YWx1ZSwgc25hcCB0byB0aGF0IGludGVnZXIgdmFsdWUuXHJcbiAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ3JhcGhpbmctcXVhZHJhdGljcy9pc3N1ZXMvMTY5LlxyXG4gICAgICAgICAgICBjb25zdCBjbG9zZXN0SW50ZWdlciA9IFV0aWxzLnRvRml4ZWROdW1iZXIoIHgsIDAgKTtcclxuICAgICAgICAgICAgaWYgKCBNYXRoLmFicyggeCAtIGNsb3Nlc3RJbnRlZ2VyICkgPCB4U25hcFRvbGVyYW5jZSApIHtcclxuICAgICAgICAgICAgICB4ID0gY2xvc2VzdEludGVnZXI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBzbmFwUXVhZHJhdGljLnNvbHZlWSggeCApO1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCB4LCB5ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBtb3ZlIHRoZSBwb2ludCB0b29sXHJcbiAgICAgICAgcG9pbnRUb29sLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBwb3NpdGlvbjtcclxuICAgICAgfVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmdyYXBoaW5nUXVhZHJhdGljcy5yZWdpc3RlciggJ1BvaW50VG9vbE5vZGUnLCBQb2ludFRvb2xOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQUV4RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9B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