// Copyright 2013-2023, University of Colorado Boulder

/**
 * PointToolNode is a tool that displays the (x,y) coordinates of a grid-point on the graph.
 * If it's not on the graph, it will display '( ?, ? )'.
 * Origin is at the tip of the tool (bottom center.)
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { DragListener, Node } from '../../../../scenery/js/imports.js';
import graphingLines from '../../graphingLines.js';
import PointToolBodyNode from './PointToolBodyNode.js';
import PointToolProbeNode from './PointToolProbeNode.js';
export default class PointToolNode extends Node {
  constructor(pointTool, modelViewTransform, graph, linesVisibleProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      backgroundNormalColor: 'white',
      foregroundNormalColor: 'black',
      foregroundHighlightColor: 'white',
      // NodeOptions
      cursor: 'pointer'
    }, providedOptions);
    super();

    // coordinatesProperty is null when the tool is not on the graph.
    const coordinatesProperty = new DerivedProperty([pointTool.positionProperty], position => graph.contains(position) ? position : null, {
      valueType: [Vector2, null]
    });
    const bodyNode = new PointToolBodyNode(coordinatesProperty, {
      coordinatesSide: 'left',
      decimals: 0,
      backgroundFill: options.backgroundNormalColor,
      textFill: options.foregroundNormalColor
    });

    /*
     * The probe is a pointy triangle, separate from the body and not pickable.
     * Because picking bounds are rectangular, making the tip pickable made it difficult
     * to pick a line manipulator when the tip and manipulator were on the same grid point.
     * Making the tip non-pickable was determined to be an acceptable and 'natural feeling' solution.
     */
    const probeNode = new PointToolProbeNode({
      pickable: false
    });

    // orientation
    if (pointTool.orientation === 'down') {
      probeNode.centerX = 0;
      probeNode.bottom = 0;
      bodyNode.left = probeNode.left - 0.1 * bodyNode.width;
      bodyNode.bottom = probeNode.top + 2; // overlap
    } else if (pointTool.orientation === 'up') {
      probeNode.setScaleMagnitude(1, -1); // reflect around x-axis, so that lighting will be correct
      probeNode.centerX = 0;
      probeNode.top = 0;
      bodyNode.left = probeNode.left - 0.1 * bodyNode.width;
      bodyNode.top = probeNode.bottom - 2; // overlap
    } else {
      throw new Error(`unsupported point tool orientation: ${pointTool.orientation}`);
    }
    options.children = [probeNode, bodyNode];
    this.mutate(options);

    // position and display
    const updateMultilink = Multilink.multilink([pointTool.positionProperty, pointTool.onLineProperty, linesVisibleProperty], (position, onLine, linesVisible) => {
      // move to position
      this.translation = modelViewTransform.modelToViewPosition(position);

      // display value and highlighting
      if (graph.contains(position) && onLine && linesVisible) {
        // use the line's color to highlight
        bodyNode.setBackgroundFill(onLine.color);
        bodyNode.setTextFill(options.foregroundHighlightColor);
      } else {
        bodyNode.setBackgroundFill(options.backgroundNormalColor);
        bodyNode.setTextFill(options.foregroundNormalColor);
      }
    });

    // interactivity
    this.addInputListener(new PointToolDragListener(this, pointTool, modelViewTransform, graph));
    this.disposePointToolNode = () => {
      Multilink.unmultilink(updateMultilink);
      bodyNode.dispose();
      coordinatesProperty.dispose();
    };
  }
  dispose() {
    this.disposePointToolNode();
    super.dispose();
  }
}

/**
 * Drag listener for the point tool.
 */
class PointToolDragListener extends DragListener {
  constructor(targetNode, pointTool, modelViewTransform, graph) {
    let startOffset; // where the drag started, relative to the tool's origin, in parent view coordinates

    const constrainBounds = (point, bounds) => {
      if (!bounds || bounds.containsPoint(point)) {
        return point;
      } else {
        return new Vector2(Utils.clamp(point.x, bounds.minX, bounds.maxX), Utils.clamp(point.y, bounds.minY, bounds.maxY));
      }
    };
    super({
      allowTouchSnag: true,
      // note where the drag started
      start: event => {
        // Note the mouse-click offset when dragging starts.
        const position = modelViewTransform.modelToViewPosition(pointTool.positionProperty.value);
        startOffset = targetNode.globalToParentPoint(event.pointer.point).minus(position);
        // Move the tool that we're dragging to the foreground.
        targetNode.moveToFront();
      },
      drag: event => {
        const parentPoint = targetNode.globalToParentPoint(event.pointer.point).minus(startOffset);
        let position = modelViewTransform.viewToModelPosition(parentPoint);
        position = constrainBounds(position, pointTool.dragBounds);
        if (graph.contains(position)) {
          // snap to the graph's grid
          position = new Vector2(Utils.toFixedNumber(position.x, 0), Utils.toFixedNumber(position.y, 0));
        }
        pointTool.positionProperty.value = position;
      }
    });
  }
}
graphingLines.register('PointToolNode', PointToolNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJVdGlscyIsIlZlY3RvcjIiLCJvcHRpb25pemUiLCJEcmFnTGlzdGVuZXIiLCJOb2RlIiwiZ3JhcGhpbmdMaW5lcyIsIlBvaW50VG9vbEJvZHlOb2RlIiwiUG9pbnRUb29sUHJvYmVOb2RlIiwiUG9pbnRUb29sTm9kZSIsImNvbnN0cnVjdG9yIiwicG9pbnRUb29sIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiZ3JhcGgiLCJsaW5lc1Zpc2libGVQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJiYWNrZ3JvdW5kTm9ybWFsQ29sb3IiLCJmb3JlZ3JvdW5kTm9ybWFsQ29sb3IiLCJmb3JlZ3JvdW5kSGlnaGxpZ2h0Q29sb3IiLCJjdXJzb3IiLCJjb29yZGluYXRlc1Byb3BlcnR5IiwicG9zaXRpb25Qcm9wZXJ0eSIsInBvc2l0aW9uIiwiY29udGFpbnMiLCJ2YWx1ZVR5cGUiLCJib2R5Tm9kZSIsImNvb3JkaW5hdGVzU2lkZSIsImRlY2ltYWxzIiwiYmFja2dyb3VuZEZpbGwiLCJ0ZXh0RmlsbCIsInByb2JlTm9kZSIsInBpY2thYmxlIiwib3JpZW50YXRpb24iLCJjZW50ZXJYIiwiYm90dG9tIiwibGVmdCIsIndpZHRoIiwidG9wIiwic2V0U2NhbGVNYWduaXR1ZGUiLCJFcnJvciIsImNoaWxkcmVuIiwibXV0YXRlIiwidXBkYXRlTXVsdGlsaW5rIiwibXVsdGlsaW5rIiwib25MaW5lUHJvcGVydHkiLCJvbkxpbmUiLCJsaW5lc1Zpc2libGUiLCJ0cmFuc2xhdGlvbiIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJzZXRCYWNrZ3JvdW5kRmlsbCIsImNvbG9yIiwic2V0VGV4dEZpbGwiLCJhZGRJbnB1dExpc3RlbmVyIiwiUG9pbnRUb29sRHJhZ0xpc3RlbmVyIiwiZGlzcG9zZVBvaW50VG9vbE5vZGUiLCJ1bm11bHRpbGluayIsImRpc3Bvc2UiLCJ0YXJnZXROb2RlIiwic3RhcnRPZmZzZXQiLCJjb25zdHJhaW5Cb3VuZHMiLCJwb2ludCIsImJvdW5kcyIsImNvbnRhaW5zUG9pbnQiLCJjbGFtcCIsIngiLCJtaW5YIiwibWF4WCIsInkiLCJtaW5ZIiwibWF4WSIsImFsbG93VG91Y2hTbmFnIiwic3RhcnQiLCJldmVudCIsInZhbHVlIiwiZ2xvYmFsVG9QYXJlbnRQb2ludCIsInBvaW50ZXIiLCJtaW51cyIsIm1vdmVUb0Zyb250IiwiZHJhZyIsInBhcmVudFBvaW50Iiwidmlld1RvTW9kZWxQb3NpdGlvbiIsImRyYWdCb3VuZHMiLCJ0b0ZpeGVkTnVtYmVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQb2ludFRvb2xOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBvaW50VG9vbE5vZGUgaXMgYSB0b29sIHRoYXQgZGlzcGxheXMgdGhlICh4LHkpIGNvb3JkaW5hdGVzIG9mIGEgZ3JpZC1wb2ludCBvbiB0aGUgZ3JhcGguXHJcbiAqIElmIGl0J3Mgbm90IG9uIHRoZSBncmFwaCwgaXQgd2lsbCBkaXNwbGF5ICcoID8sID8gKScuXHJcbiAqIE9yaWdpbiBpcyBhdCB0aGUgdGlwIG9mIHRoZSB0b29sIChib3R0b20gY2VudGVyLilcclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCB7IERyYWdMaXN0ZW5lciwgTm9kZSwgTm9kZU9wdGlvbnMsIFRDb2xvciB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBncmFwaGluZ0xpbmVzIGZyb20gJy4uLy4uL2dyYXBoaW5nTGluZXMuanMnO1xyXG5pbXBvcnQgR3JhcGggZnJvbSAnLi4vbW9kZWwvR3JhcGguanMnO1xyXG5pbXBvcnQgUG9pbnRUb29sIGZyb20gJy4uL21vZGVsL1BvaW50VG9vbC5qcyc7XHJcbmltcG9ydCBQb2ludFRvb2xCb2R5Tm9kZSBmcm9tICcuL1BvaW50VG9vbEJvZHlOb2RlLmpzJztcclxuaW1wb3J0IFBvaW50VG9vbFByb2JlTm9kZSBmcm9tICcuL1BvaW50VG9vbFByb2JlTm9kZS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGJhY2tncm91bmROb3JtYWxDb2xvcj86IFRDb2xvcjtcclxuICBmb3JlZ3JvdW5kTm9ybWFsQ29sb3I/OiBUQ29sb3I7XHJcbiAgZm9yZWdyb3VuZEhpZ2hsaWdodENvbG9yPzogVENvbG9yO1xyXG59O1xyXG5cclxudHlwZSBQb2ludFRvb2xOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja09wdGlvbmFsPE5vZGVPcHRpb25zLCAnc2NhbGUnPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvaW50VG9vbE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlUG9pbnRUb29sTm9kZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwb2ludFRvb2w6IFBvaW50VG9vbCwgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLCBncmFwaDogR3JhcGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICBsaW5lc1Zpc2libGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sIHByb3ZpZGVkT3B0aW9ucz86IFBvaW50VG9vbE5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UG9pbnRUb29sTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgYmFja2dyb3VuZE5vcm1hbENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICBmb3JlZ3JvdW5kTm9ybWFsQ29sb3I6ICdibGFjaycsXHJcbiAgICAgIGZvcmVncm91bmRIaWdobGlnaHRDb2xvcjogJ3doaXRlJyxcclxuXHJcbiAgICAgIC8vIE5vZGVPcHRpb25zXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIGNvb3JkaW5hdGVzUHJvcGVydHkgaXMgbnVsbCB3aGVuIHRoZSB0b29sIGlzIG5vdCBvbiB0aGUgZ3JhcGguXHJcbiAgICBjb25zdCBjb29yZGluYXRlc1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBwb2ludFRvb2wucG9zaXRpb25Qcm9wZXJ0eSBdLFxyXG4gICAgICBwb3NpdGlvbiA9PiAoIGdyYXBoLmNvbnRhaW5zKCBwb3NpdGlvbiApID8gcG9zaXRpb24gOiBudWxsICksIHtcclxuICAgICAgICB2YWx1ZVR5cGU6IFsgVmVjdG9yMiwgbnVsbCBdXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBib2R5Tm9kZSA9IG5ldyBQb2ludFRvb2xCb2R5Tm9kZSggY29vcmRpbmF0ZXNQcm9wZXJ0eSwge1xyXG4gICAgICBjb29yZGluYXRlc1NpZGU6ICdsZWZ0JyxcclxuICAgICAgZGVjaW1hbHM6IDAsXHJcbiAgICAgIGJhY2tncm91bmRGaWxsOiBvcHRpb25zLmJhY2tncm91bmROb3JtYWxDb2xvcixcclxuICAgICAgdGV4dEZpbGw6IG9wdGlvbnMuZm9yZWdyb3VuZE5vcm1hbENvbG9yXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBwcm9iZSBpcyBhIHBvaW50eSB0cmlhbmdsZSwgc2VwYXJhdGUgZnJvbSB0aGUgYm9keSBhbmQgbm90IHBpY2thYmxlLlxyXG4gICAgICogQmVjYXVzZSBwaWNraW5nIGJvdW5kcyBhcmUgcmVjdGFuZ3VsYXIsIG1ha2luZyB0aGUgdGlwIHBpY2thYmxlIG1hZGUgaXQgZGlmZmljdWx0XHJcbiAgICAgKiB0byBwaWNrIGEgbGluZSBtYW5pcHVsYXRvciB3aGVuIHRoZSB0aXAgYW5kIG1hbmlwdWxhdG9yIHdlcmUgb24gdGhlIHNhbWUgZ3JpZCBwb2ludC5cclxuICAgICAqIE1ha2luZyB0aGUgdGlwIG5vbi1waWNrYWJsZSB3YXMgZGV0ZXJtaW5lZCB0byBiZSBhbiBhY2NlcHRhYmxlIGFuZCAnbmF0dXJhbCBmZWVsaW5nJyBzb2x1dGlvbi5cclxuICAgICAqL1xyXG4gICAgY29uc3QgcHJvYmVOb2RlID0gbmV3IFBvaW50VG9vbFByb2JlTm9kZSgge1xyXG4gICAgICBwaWNrYWJsZTogZmFsc2VcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBvcmllbnRhdGlvblxyXG4gICAgaWYgKCBwb2ludFRvb2wub3JpZW50YXRpb24gPT09ICdkb3duJyApIHtcclxuICAgICAgcHJvYmVOb2RlLmNlbnRlclggPSAwO1xyXG4gICAgICBwcm9iZU5vZGUuYm90dG9tID0gMDtcclxuICAgICAgYm9keU5vZGUubGVmdCA9IHByb2JlTm9kZS5sZWZ0IC0gKCAwLjEgKiBib2R5Tm9kZS53aWR0aCApO1xyXG4gICAgICBib2R5Tm9kZS5ib3R0b20gPSBwcm9iZU5vZGUudG9wICsgMjsgLy8gb3ZlcmxhcFxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHBvaW50VG9vbC5vcmllbnRhdGlvbiA9PT0gJ3VwJyApIHtcclxuICAgICAgcHJvYmVOb2RlLnNldFNjYWxlTWFnbml0dWRlKCAxLCAtMSApOyAvLyByZWZsZWN0IGFyb3VuZCB4LWF4aXMsIHNvIHRoYXQgbGlnaHRpbmcgd2lsbCBiZSBjb3JyZWN0XHJcbiAgICAgIHByb2JlTm9kZS5jZW50ZXJYID0gMDtcclxuICAgICAgcHJvYmVOb2RlLnRvcCA9IDA7XHJcbiAgICAgIGJvZHlOb2RlLmxlZnQgPSBwcm9iZU5vZGUubGVmdCAtICggMC4xICogYm9keU5vZGUud2lkdGggKTtcclxuICAgICAgYm9keU5vZGUudG9wID0gcHJvYmVOb2RlLmJvdHRvbSAtIDI7IC8vIG92ZXJsYXBcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGB1bnN1cHBvcnRlZCBwb2ludCB0b29sIG9yaWVudGF0aW9uOiAke3BvaW50VG9vbC5vcmllbnRhdGlvbn1gICk7XHJcbiAgICB9XHJcblxyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgcHJvYmVOb2RlLCBib2R5Tm9kZSBdO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gcG9zaXRpb24gYW5kIGRpc3BsYXlcclxuICAgIGNvbnN0IHVwZGF0ZU11bHRpbGluayA9IE11bHRpbGluay5tdWx0aWxpbmsoXHJcbiAgICAgIFsgcG9pbnRUb29sLnBvc2l0aW9uUHJvcGVydHksIHBvaW50VG9vbC5vbkxpbmVQcm9wZXJ0eSwgbGluZXNWaXNpYmxlUHJvcGVydHkgXSxcclxuICAgICAgKCBwb3NpdGlvbiwgb25MaW5lLCBsaW5lc1Zpc2libGUgKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIG1vdmUgdG8gcG9zaXRpb25cclxuICAgICAgICB0aGlzLnRyYW5zbGF0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHBvc2l0aW9uICk7XHJcblxyXG4gICAgICAgIC8vIGRpc3BsYXkgdmFsdWUgYW5kIGhpZ2hsaWdodGluZ1xyXG4gICAgICAgIGlmICggZ3JhcGguY29udGFpbnMoIHBvc2l0aW9uICkgJiYgb25MaW5lICYmIGxpbmVzVmlzaWJsZSApIHtcclxuXHJcbiAgICAgICAgICAvLyB1c2UgdGhlIGxpbmUncyBjb2xvciB0byBoaWdobGlnaHRcclxuICAgICAgICAgIGJvZHlOb2RlLnNldEJhY2tncm91bmRGaWxsKCBvbkxpbmUuY29sb3IgKTtcclxuICAgICAgICAgIGJvZHlOb2RlLnNldFRleHRGaWxsKCBvcHRpb25zLmZvcmVncm91bmRIaWdobGlnaHRDb2xvciApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGJvZHlOb2RlLnNldEJhY2tncm91bmRGaWxsKCBvcHRpb25zLmJhY2tncm91bmROb3JtYWxDb2xvciApO1xyXG4gICAgICAgICAgYm9keU5vZGUuc2V0VGV4dEZpbGwoIG9wdGlvbnMuZm9yZWdyb3VuZE5vcm1hbENvbG9yICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gaW50ZXJhY3Rpdml0eVxyXG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBuZXcgUG9pbnRUb29sRHJhZ0xpc3RlbmVyKCB0aGlzLCBwb2ludFRvb2wsIG1vZGVsVmlld1RyYW5zZm9ybSwgZ3JhcGggKSApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZVBvaW50VG9vbE5vZGUgPSAoKSA9PiB7XHJcbiAgICAgIE11bHRpbGluay51bm11bHRpbGluayggdXBkYXRlTXVsdGlsaW5rICk7XHJcbiAgICAgIGJvZHlOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgY29vcmRpbmF0ZXNQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VQb2ludFRvb2xOb2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRHJhZyBsaXN0ZW5lciBmb3IgdGhlIHBvaW50IHRvb2wuXHJcbiAqL1xyXG5jbGFzcyBQb2ludFRvb2xEcmFnTGlzdGVuZXIgZXh0ZW5kcyBEcmFnTGlzdGVuZXIge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhcmdldE5vZGU6IE5vZGUsIHBvaW50VG9vbDogUG9pbnRUb29sLCBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsIGdyYXBoOiBHcmFwaCApIHtcclxuXHJcbiAgICBsZXQgc3RhcnRPZmZzZXQ6IFZlY3RvcjI7IC8vIHdoZXJlIHRoZSBkcmFnIHN0YXJ0ZWQsIHJlbGF0aXZlIHRvIHRoZSB0b29sJ3Mgb3JpZ2luLCBpbiBwYXJlbnQgdmlldyBjb29yZGluYXRlc1xyXG5cclxuICAgIGNvbnN0IGNvbnN0cmFpbkJvdW5kcyA9ICggcG9pbnQ6IFZlY3RvcjIsIGJvdW5kczogQm91bmRzMiApID0+IHtcclxuICAgICAgaWYgKCAhYm91bmRzIHx8IGJvdW5kcy5jb250YWluc1BvaW50KCBwb2ludCApICkge1xyXG4gICAgICAgIHJldHVybiBwb2ludDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlY3RvcjIoIFV0aWxzLmNsYW1wKCBwb2ludC54LCBib3VuZHMubWluWCwgYm91bmRzLm1heFggKSwgVXRpbHMuY2xhbXAoIHBvaW50LnksIGJvdW5kcy5taW5ZLCBib3VuZHMubWF4WSApICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgc3VwZXIoIHtcclxuXHJcbiAgICAgIGFsbG93VG91Y2hTbmFnOiB0cnVlLFxyXG5cclxuICAgICAgLy8gbm90ZSB3aGVyZSB0aGUgZHJhZyBzdGFydGVkXHJcbiAgICAgIHN0YXJ0OiBldmVudCA9PiB7XHJcbiAgICAgICAgLy8gTm90ZSB0aGUgbW91c2UtY2xpY2sgb2Zmc2V0IHdoZW4gZHJhZ2dpbmcgc3RhcnRzLlxyXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHBvaW50VG9vbC5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgICAgc3RhcnRPZmZzZXQgPSB0YXJnZXROb2RlLmdsb2JhbFRvUGFyZW50UG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKS5taW51cyggcG9zaXRpb24gKTtcclxuICAgICAgICAvLyBNb3ZlIHRoZSB0b29sIHRoYXQgd2UncmUgZHJhZ2dpbmcgdG8gdGhlIGZvcmVncm91bmQuXHJcbiAgICAgICAgdGFyZ2V0Tm9kZS5tb3ZlVG9Gcm9udCgpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgZHJhZzogZXZlbnQgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBhcmVudFBvaW50ID0gdGFyZ2V0Tm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkubWludXMoIHN0YXJ0T2Zmc2V0ICk7XHJcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsUG9zaXRpb24oIHBhcmVudFBvaW50ICk7XHJcbiAgICAgICAgcG9zaXRpb24gPSBjb25zdHJhaW5Cb3VuZHMoIHBvc2l0aW9uLCBwb2ludFRvb2wuZHJhZ0JvdW5kcyApO1xyXG4gICAgICAgIGlmICggZ3JhcGguY29udGFpbnMoIHBvc2l0aW9uICkgKSB7XHJcbiAgICAgICAgICAvLyBzbmFwIHRvIHRoZSBncmFwaCdzIGdyaWRcclxuICAgICAgICAgIHBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIFV0aWxzLnRvRml4ZWROdW1iZXIoIHBvc2l0aW9uLngsIDAgKSwgVXRpbHMudG9GaXhlZE51bWJlciggcG9zaXRpb24ueSwgMCApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBvaW50VG9vbC5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gcG9zaXRpb247XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmdyYXBoaW5nTGluZXMucmVnaXN0ZXIoICdQb2ludFRvb2xOb2RlJywgUG9pbnRUb29sTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBR3hELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxTQUFTLE1BQU0sdUNBQXVDO0FBRzdELFNBQVNDLFlBQVksRUFBRUMsSUFBSSxRQUE2QixtQ0FBbUM7QUFDM0YsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUdsRCxPQUFPQyxpQkFBaUIsTUFBTSx3QkFBd0I7QUFDdEQsT0FBT0Msa0JBQWtCLE1BQU0seUJBQXlCO0FBVXhELGVBQWUsTUFBTUMsYUFBYSxTQUFTSixJQUFJLENBQUM7RUFJdkNLLFdBQVdBLENBQUVDLFNBQW9CLEVBQUVDLGtCQUF1QyxFQUFFQyxLQUFZLEVBQzNFQyxvQkFBZ0QsRUFBRUMsZUFBc0MsRUFBRztJQUU3RyxNQUFNQyxPQUFPLEdBQUdiLFNBQVMsQ0FBaUQsQ0FBQyxDQUFFO01BRTNFO01BQ0FjLHFCQUFxQixFQUFFLE9BQU87TUFDOUJDLHFC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