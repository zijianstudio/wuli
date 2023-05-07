// Copyright 2015-2023, University of Colorado Boulder

/**
 * The node for a wire, which can be stretched out by dragging its vertices.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Matrix3 from '../../../dot/js/Matrix3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { LineStyles, Shape } from '../../../kite/js/imports.js';
import { Circle, Color, Line, LinearGradient, Node, Path } from '../../../scenery/js/imports.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import CircuitElementNode from './CircuitElementNode.js';
import CircuitNodeDragListener from './CircuitNodeDragListener.js';
import CCKCColors from './CCKCColors.js';

// constants
const LIFELIKE_LINE_WIDTH = 16; // line width in screen coordinates
const SCHEMATIC_LINE_WIDTH = CCKCConstants.SCHEMATIC_LINE_WIDTH; // line width in screen coordinates

// constants
const MATRIX = new Matrix3(); // The Matrix entries are mutable
const WIRE_RASTER_LENGTH = 100;

// Node used to render the black line for schematic, rasterized so it can render with WebGL
const BLACK_LINE_NODE = new Line(0, 0, WIRE_RASTER_LENGTH, 0, {
  lineWidth: SCHEMATIC_LINE_WIDTH,
  stroke: Color.BLACK
}).rasterized({
  wrap: false
});

// Not displayed, used to get accurate hit bounds for the schematic view.
const SCHEMATIC_BACKGROUND = new Line(0, 0, WIRE_RASTER_LENGTH, 0, {
  lineWidth: LIFELIKE_LINE_WIDTH,
  stroke: Color.BLUE,
  opacity: 0.0
}).rasterized({
  wrap: false
});

/**
 * Create a LinearGradient for the wire, depending on the orientation relative to the shading (light comes from
 * top left)
 * @param colorStops - entries have point: Number, color: Color
 * @param colorStopPointMap - (Vector2) => number, the operation to apply to create color stops
 */
const createGradient = (colorStops, colorStopPointMap) => {
  const gradient = new LinearGradient(0, -LIFELIKE_LINE_WIDTH / 2, 0, LIFELIKE_LINE_WIDTH / 2);
  colorStops.forEach(colorStop => {
    gradient.addColorStop(colorStopPointMap(colorStop.point), colorStop.color);
  });
  return gradient;
};
const colorStops = [{
  point: 0.0,
  color: new Color('#993f35')
}, {
  point: 0.2,
  color: new Color('#cd7767')
}, {
  point: 0.3,
  color: new Color('#f6bda0')
}, {
  point: 1.0,
  color: new Color('#3c0c08')
}];
const normalGradient = createGradient(colorStops, _.identity);
const reverseGradient = createGradient(colorStops.reverse(), e => 1.0 - e);
const lifelikeNodeNormal = new Line(0, 0, WIRE_RASTER_LENGTH, 0, {
  lineWidth: LIFELIKE_LINE_WIDTH,
  stroke: normalGradient
}).rasterized({
  wrap: false
});
const lifelikeNodeReversed = new Line(0, 0, WIRE_RASTER_LENGTH, 0, {
  lineWidth: LIFELIKE_LINE_WIDTH,
  stroke: reverseGradient
}).rasterized({
  wrap: false
});

// Make sure the heights are the same as the wires so they will line up properly, see
// https://github.com/phetsims/circuit-construction-kit-common/issues/390
const lifelikeRoundedCapNormal = new Circle(LIFELIKE_LINE_WIDTH / 2, {
  fill: normalGradient
}).rasterized({
  wrap: false
});
const lifelikeRoundedCapReversed = new Circle(LIFELIKE_LINE_WIDTH / 2, {
  fill: reverseGradient
}).rasterized({
  wrap: false
});
const HIGHLIGHT_STROKE_LINE_STYLES = new LineStyles({
  lineWidth: 26,
  lineCap: 'round',
  lineJoin: 'round'
});
const TOUCH_AREA_LINE_STYLES = new LineStyles({
  lineWidth: 23
});

/**
 * Convenience function that gets the stroked shape for the wire line node with the given style
 */
const getHighlightStrokedShape = wire => {
  const startPoint = wire.startPositionProperty.get();
  const endPoint = wire.endPositionProperty.get();
  return Shape.lineSegment(startPoint.x, startPoint.y, endPoint.x, endPoint.y).getStrokedShape(HIGHLIGHT_STROKE_LINE_STYLES);
};

/**
 * Convenience function that gets the stroked shape for the wire line node with the given style
 */
const getTouchArea = wire => {
  const startPoint = wire.startPositionProperty.get();
  const endPoint = wire.endPositionProperty.get();
  const distance = endPoint.distance(startPoint);
  const vertexInset = 0; // run to the edge of the wire as we do for FixedCircuitElements
  let touchAreaStart = null;
  let touchAreaEnd = null;

  // Extend the touch area from vertex to vertex
  if (distance > vertexInset * 2) {
    touchAreaStart = startPoint.blend(endPoint, vertexInset / distance);
    touchAreaEnd = endPoint.blend(startPoint, vertexInset / distance);
  } else {
    // Not enough room for any touch area for this wire
    touchAreaStart = startPoint.average(endPoint);
    touchAreaEnd = touchAreaStart;
  }
  return Shape.lineSegment(touchAreaStart, touchAreaEnd).getStrokedShape(TOUCH_AREA_LINE_STYLES);
};
export default class WireNode extends CircuitElementNode {
  // Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
  static webglSpriteNodes = [BLACK_LINE_NODE, lifelikeNodeNormal, lifelikeNodeReversed, lifelikeRoundedCapNormal];

  /**
   * @param screenView - the icon is created separately in CircuitElementToolFactory, so (unlike
   *                                    - other CircuitElement types) the screenView is required
   * @param circuitNode
   * @param wire
   * @param viewTypeProperty
   * @param tandem
   */
  constructor(screenView, circuitNode, wire, viewTypeProperty, tandem) {
    const startCapParent = new Node({
      children: [lifelikeRoundedCapNormal]
    });
    const endCapParent = new Node({
      children: [lifelikeRoundedCapNormal]
    });

    // The node that shows the yellow highlight for the node when selected
    const highlightNode = new Path(null, {
      stroke: CCKCColors.highlightStrokeProperty,
      lineWidth: CCKCConstants.HIGHLIGHT_LINE_WIDTH,
      pickable: false,
      visible: false
    });

    // The node that displays the main line (for both schematic and lifelike).  This does not include
    // the rounded caps for the lifelike view
    const lineNode = new Node();
    const lineNodeParent = new Node({
      children: [lineNode],
      cursor: 'pointer'
    });
    const highlightNodeParent = new Node({
      children: [highlightNode]
    });
    circuitNode && circuitNode.highlightLayer.addChild(highlightNodeParent);
    const circuit = circuitNode && circuitNode.circuit;
    super(wire, circuit, {
      children: [startCapParent, endCapParent, lineNodeParent],
      tandem: tandem
    });
    this.viewTypeProperty = viewTypeProperty;
    this.circuitNode = circuitNode;
    this.wire = wire;
    this.startCapParent = startCapParent;
    this.endCapParent = endCapParent;
    this.lineNodeParent = lineNodeParent;
    this.lineNode = lineNode;
    this.highlightNode = highlightNode;

    /**
     * When the view type changes (lifelike vs schematic), update the node
     */
    const markAsDirty = () => {
      if (this.isDisposed) {
        return;
      }
      this.markAsDirty();

      // For the icon, we must update right away since no step() is called
      if (!circuitNode) {
        this.updateRender();
      }
    };
    viewTypeProperty.link(markAsDirty);

    /**
     * Update whether the WireNode is pickable
     */
    const updatePickable = interactive => {
      this.pickable = interactive;
    };
    wire.interactiveProperty.link(updatePickable);

    // When the start vertex changes to a different instance (say when vertices are soldered together), unlink the
    // old one and link to the new one.
    const doUpdateTransform = (newVertex, oldVertex) => {
      oldVertex && oldVertex.positionProperty.unlink(markAsDirty);
      newVertex.positionProperty.link(markAsDirty);
    };
    wire.startVertexProperty.link(doUpdateTransform);
    wire.endVertexProperty.link(doUpdateTransform);

    // Keep track of the start point to see if it was dragged or tapped to be selected
    let initialPoint = null;
    let latestPoint = null;

    // Keep track of whether it was dragged
    let dragged = false;
    if (screenView) {
      assert && assert(circuitNode !== null);

      // Input listener for dragging the body of the wire, to translate it.
      this.dragListener = new CircuitNodeDragListener(circuitNode, [() => wire.startVertexProperty.get(), () => wire.endVertexProperty.get()], {
        tandem: tandem.createTandem('dragListener'),
        start: event => {
          if (wire.interactiveProperty.get()) {
            // Start drag by starting a drag on start and end vertices
            circuitNode.startDragVertex(event.pointer.point, wire.startVertexProperty.get(), this.circuitElement);
            circuitNode.startDragVertex(event.pointer.point, wire.endVertexProperty.get(), this.circuitElement);
            dragged = false;
            initialPoint = event.pointer.point.copy();
            latestPoint = event.pointer.point.copy();
          }
        },
        drag: event => {
          if (wire.interactiveProperty.get()) {
            latestPoint = event.pointer.point.copy();

            // Drag by translating both of the vertices
            circuitNode.dragVertex(event.pointer.point, wire.startVertexProperty.get(), false);
            circuitNode.dragVertex(event.pointer.point, wire.endVertexProperty.get(), false);
            dragged = true;
          }
        },
        end: () => {
          this.endDrag(this, [wire.startVertexProperty.get(), wire.endVertexProperty.get()], screenView, circuitNode, initialPoint, latestPoint, dragged);
        }
      });
      this.addInputListener(this.dragListener);
      circuitNode.circuit.selectionProperty.link(markAsDirty);
    } else {
      this.dragListener = null;
    }

    /**
     * Move the wire element to the back of the view when connected to another circuit element
     */
    const moveToBack = () => {
      // Components outside the black box do not move in back of the overlay
      if (wire.interactiveProperty.get()) {
        // Connected wires should always be behind the solder and circuit elements
        this.moveToBack();
      }
    };
    wire.connectedEmitter.addListener(moveToBack);
    this.disposeWireNode = () => {
      assert && assert(this.dragListener);
      this.dragListener.interrupt();
      this.dragListener.dispose();
      wire.startVertexProperty.unlink(doUpdateTransform);
      wire.endVertexProperty.unlink(doUpdateTransform);
      circuitNode && circuitNode.circuit.selectionProperty.unlink(markAsDirty);
      wire.interactiveProperty.unlink(updatePickable);
      wire.startPositionProperty.unlink(markAsDirty);
      wire.endPositionProperty.unlink(markAsDirty);
      wire.connectedEmitter.removeListener(moveToBack);
      circuitNode && circuitNode.highlightLayer.removeChild(highlightNodeParent);
      viewTypeProperty.unlink(markAsDirty);
      this.lineNode.dispose();
      this.highlightNode.dispose();
      this.lineNodeParent.dispose();
      highlightNodeParent.dispose();
      this.startCapParent.dispose();
      this.endCapParent.dispose();
    };

    // For icons, update the end caps
    !circuitNode && this.updateRender();
  }

  /**
   * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
   * CCKCLightBulbNode calls updateRender for its child socket node
   */
  updateRender() {
    const view = this.viewTypeProperty.value;
    if (view === CircuitElementViewType.LIFELIKE) {
      // determine whether to use the forward or reverse gradient based on the angle
      const startPoint = this.wire.startPositionProperty.get();
      const endPoint = this.wire.endPositionProperty.get();
      const lightingDirection = new Vector2(0.916, 0.4); // sampled manually
      const wireVector = endPoint.minus(startPoint);
      const dot = lightingDirection.dot(wireVector);

      // only change children if necessary
      const lineNodeChild = dot < 0 ? lifelikeNodeReversed : lifelikeNodeNormal;
      const capChild = dot < 0 ? lifelikeRoundedCapReversed : lifelikeRoundedCapNormal;
      this.lineNode.getChildAt(0) !== lineNodeChild && this.lineNode.setChildren([lineNodeChild]);
      this.endCapParent.getChildAt(0) !== capChild && this.endCapParent.setChildren([capChild]);
      this.startCapParent.getChildAt(0) !== capChild && this.startCapParent.setChildren([capChild]);
      this.startCapParent.visible = true;
      this.endCapParent.visible = true;
    } else {
      this.lineNode.getChildAt(0) !== SCHEMATIC_BACKGROUND && this.lineNode.setChildren([SCHEMATIC_BACKGROUND, BLACK_LINE_NODE]);
      this.startCapParent.visible = false;
      this.endCapParent.visible = false;
    }
    const startPosition = this.circuitElement.startPositionProperty.get();
    const endPosition = this.circuitElement.endPositionProperty.get();
    const delta = endPosition.minus(startPosition);

    // Prevent the case where a vertex lies on another vertex, particularly for fuzz testing
    const magnitude = Math.max(delta.magnitude, 1E-8);
    const angle = delta.angle;

    // Update the node transform
    this.endCapParent.setMatrix(MATRIX.setToTranslationRotationPoint(endPosition, angle));

    // This transform is done second so the matrix is already in good shape for the scaling step
    this.startCapParent.setMatrix(MATRIX.setToTranslationRotationPoint(startPosition, angle));
    MATRIX.multiplyMatrix(Matrix3.scaling(magnitude / WIRE_RASTER_LENGTH, 1));
    this.lineNodeParent.setMatrix(MATRIX);
    if (this.circuitNode) {
      const selectedCircuitElement = this.circuitNode.circuit.selectionProperty.get();
      const isCurrentlyHighlighted = selectedCircuitElement === this.wire;
      this.highlightNode.visible = isCurrentlyHighlighted;
      if (isCurrentlyHighlighted) {
        this.highlightNode.shape = getHighlightStrokedShape(this.wire);
      }
    }
    this.touchArea = getTouchArea(this.wire);
    this.mouseArea = this.touchArea;
  }
  dispose() {
    this.disposeWireNode();
    super.dispose();
  }
}
circuitConstructionKitCommon.register('WireNode', WireNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXgzIiwiVmVjdG9yMiIsIkxpbmVTdHlsZXMiLCJTaGFwZSIsIkNpcmNsZSIsIkNvbG9yIiwiTGluZSIsIkxpbmVhckdyYWRpZW50IiwiTm9kZSIsIlBhdGgiLCJDQ0tDQ29uc3RhbnRzIiwiY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiIsIkNpcmN1aXRFbGVtZW50Vmlld1R5cGUiLCJDaXJjdWl0RWxlbWVudE5vZGUiLCJDaXJjdWl0Tm9kZURyYWdMaXN0ZW5lciIsIkNDS0NDb2xvcnMiLCJMSUZFTElLRV9MSU5FX1dJRFRIIiwiU0NIRU1BVElDX0xJTkVfV0lEVEgiLCJNQVRSSVgiLCJXSVJFX1JBU1RFUl9MRU5HVEgiLCJCTEFDS19MSU5FX05PREUiLCJsaW5lV2lkdGgiLCJzdHJva2UiLCJCTEFDSyIsInJhc3Rlcml6ZWQiLCJ3cmFwIiwiU0NIRU1BVElDX0JBQ0tHUk9VTkQiLCJCTFVFIiwib3BhY2l0eSIsImNyZWF0ZUdyYWRpZW50IiwiY29sb3JTdG9wcyIsImNvbG9yU3RvcFBvaW50TWFwIiwiZ3JhZGllbnQiLCJmb3JFYWNoIiwiY29sb3JTdG9wIiwiYWRkQ29sb3JTdG9wIiwicG9pbnQiLCJjb2xvciIsIm5vcm1hbEdyYWRpZW50IiwiXyIsImlkZW50aXR5IiwicmV2ZXJzZUdyYWRpZW50IiwicmV2ZXJzZSIsImUiLCJsaWZlbGlrZU5vZGVOb3JtYWwiLCJsaWZlbGlrZU5vZGVSZXZlcnNlZCIsImxpZmVsaWtlUm91bmRlZENhcE5vcm1hbCIsImZpbGwiLCJsaWZlbGlrZVJvdW5kZWRDYXBSZXZlcnNlZCIsIkhJR0hMSUdIVF9TVFJPS0VfTElORV9TVFlMRVMiLCJsaW5lQ2FwIiwibGluZUpvaW4iLCJUT1VDSF9BUkVBX0xJTkVfU1RZTEVTIiwiZ2V0SGlnaGxpZ2h0U3Ryb2tlZFNoYXBlIiwid2lyZSIsInN0YXJ0UG9pbnQiLCJzdGFydFBvc2l0aW9uUHJvcGVydHkiLCJnZXQiLCJlbmRQb2ludCIsImVuZFBvc2l0aW9uUHJvcGVydHkiLCJsaW5lU2VnbWVudCIsIngiLCJ5IiwiZ2V0U3Ryb2tlZFNoYXBlIiwiZ2V0VG91Y2hBcmVhIiwiZGlzdGFuY2UiLCJ2ZXJ0ZXhJbnNldCIsInRvdWNoQXJlYVN0YXJ0IiwidG91Y2hBcmVhRW5kIiwiYmxlbmQiLCJhdmVyYWdlIiwiV2lyZU5vZGUiLCJ3ZWJnbFNwcml0ZU5vZGVzIiwiY29uc3RydWN0b3IiLCJzY3JlZW5WaWV3IiwiY2lyY3VpdE5vZGUiLCJ2aWV3VHlwZVByb3BlcnR5IiwidGFuZGVtIiwic3RhcnRDYXBQYXJlbnQiLCJjaGlsZHJlbiIsImVuZENhcFBhcmVudCIsImhpZ2hsaWdodE5vZGUiLCJoaWdobGlnaHRTdHJva2VQcm9wZXJ0eSIsIkhJR0hMSUdIVF9MSU5FX1dJRFRIIiwicGlja2FibGUiLCJ2aXNpYmxlIiwibGluZU5vZGUiLCJsaW5lTm9kZVBhcmVudCIsImN1cnNvciIsImhpZ2hsaWdodE5vZGVQYXJlbnQiLCJoaWdobGlnaHRMYXllciIsImFkZENoaWxkIiwiY2lyY3VpdCIsIm1hcmtBc0RpcnR5IiwiaXNEaXNwb3NlZCIsInVwZGF0ZVJlbmRlciIsImxpbmsiLCJ1cGRhdGVQaWNrYWJsZSIsImludGVyYWN0aXZlIiwiaW50ZXJhY3RpdmVQcm9wZXJ0eSIsImRvVXBkYXRlVHJhbnNmb3JtIiwibmV3VmVydGV4Iiwib2xkVmVydGV4IiwicG9zaXRpb25Qcm9wZXJ0eSIsInVubGluayIsInN0YXJ0VmVydGV4UHJvcGVydHkiLCJlbmRWZXJ0ZXhQcm9wZXJ0eSIsImluaXRpYWxQb2ludCIsImxhdGVzdFBvaW50IiwiZHJhZ2dlZCIsImFzc2VydCIsImRyYWdMaXN0ZW5lciIsImNyZWF0ZVRhbmRlbSIsInN0YXJ0IiwiZXZlbnQiLCJzdGFydERyYWdWZXJ0ZXgiLCJwb2ludGVyIiwiY2lyY3VpdEVsZW1lbnQiLCJjb3B5IiwiZHJhZyIsImRyYWdWZXJ0ZXgiLCJlbmQiLCJlbmREcmFnIiwiYWRkSW5wdXRMaXN0ZW5lciIsInNlbGVjdGlvblByb3BlcnR5IiwibW92ZVRvQmFjayIsImNvbm5lY3RlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImRpc3Bvc2VXaXJlTm9kZSIsImludGVycnVwdCIsImRpc3Bvc2UiLCJyZW1vdmVMaXN0ZW5lciIsInJlbW92ZUNoaWxkIiwidmlldyIsInZhbHVlIiwiTElGRUxJS0UiLCJsaWdodGluZ0RpcmVjdGlvbiIsIndpcmVWZWN0b3IiLCJtaW51cyIsImRvdCIsImxpbmVOb2RlQ2hpbGQiLCJjYXBDaGlsZCIsImdldENoaWxkQXQiLCJzZXRDaGlsZHJlbiIsInN0YXJ0UG9zaXRpb24iLCJlbmRQb3NpdGlvbiIsImRlbHRhIiwibWFnbml0dWRlIiwiTWF0aCIsIm1heCIsImFuZ2xlIiwic2V0TWF0cml4Iiwic2V0VG9UcmFuc2xhdGlvblJvdGF0aW9uUG9pbnQiLCJtdWx0aXBseU1hdHJpeCIsInNjYWxpbmciLCJzZWxlY3RlZENpcmN1aXRFbGVtZW50IiwiaXNDdXJyZW50bHlIaWdobGlnaHRlZCIsInNoYXBlIiwidG91Y2hBcmVhIiwibW91c2VBcmVhIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJXaXJlTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgbm9kZSBmb3IgYSB3aXJlLCB3aGljaCBjYW4gYmUgc3RyZXRjaGVkIG91dCBieSBkcmFnZ2luZyBpdHMgdmVydGljZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgTGluZVN0eWxlcywgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBDaXJjbGUsIENvbG9yLCBMaW5lLCBMaW5lYXJHcmFkaWVudCwgTm9kZSwgUGF0aCwgU2NlbmVyeUV2ZW50IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IENDS0NDb25zdGFudHMgZnJvbSAnLi4vQ0NLQ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIGZyb20gJy4uL2NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24uanMnO1xyXG5pbXBvcnQgQ2lyY3VpdEVsZW1lbnRWaWV3VHlwZSBmcm9tICcuLi9tb2RlbC9DaXJjdWl0RWxlbWVudFZpZXdUeXBlLmpzJztcclxuaW1wb3J0IFZlcnRleCBmcm9tICcuLi9tb2RlbC9WZXJ0ZXguanMnO1xyXG5pbXBvcnQgV2lyZSBmcm9tICcuLi9tb2RlbC9XaXJlLmpzJztcclxuaW1wb3J0IENDS0NTY3JlZW5WaWV3IGZyb20gJy4vQ0NLQ1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdEVsZW1lbnROb2RlIGZyb20gJy4vQ2lyY3VpdEVsZW1lbnROb2RlLmpzJztcclxuaW1wb3J0IENpcmN1aXROb2RlIGZyb20gJy4vQ2lyY3VpdE5vZGUuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdE5vZGVEcmFnTGlzdGVuZXIgZnJvbSAnLi9DaXJjdWl0Tm9kZURyYWdMaXN0ZW5lci5qcyc7XHJcbmltcG9ydCBDQ0tDQ29sb3JzIGZyb20gJy4vQ0NLQ0NvbG9ycy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTElGRUxJS0VfTElORV9XSURUSCA9IDE2OyAvLyBsaW5lIHdpZHRoIGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG5jb25zdCBTQ0hFTUFUSUNfTElORV9XSURUSCA9IENDS0NDb25zdGFudHMuU0NIRU1BVElDX0xJTkVfV0lEVEg7IC8vIGxpbmUgd2lkdGggaW4gc2NyZWVuIGNvb3JkaW5hdGVzXHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTUFUUklYID0gbmV3IE1hdHJpeDMoKTsgLy8gVGhlIE1hdHJpeCBlbnRyaWVzIGFyZSBtdXRhYmxlXHJcbmNvbnN0IFdJUkVfUkFTVEVSX0xFTkdUSCA9IDEwMDtcclxuXHJcbi8vIE5vZGUgdXNlZCB0byByZW5kZXIgdGhlIGJsYWNrIGxpbmUgZm9yIHNjaGVtYXRpYywgcmFzdGVyaXplZCBzbyBpdCBjYW4gcmVuZGVyIHdpdGggV2ViR0xcclxuY29uc3QgQkxBQ0tfTElORV9OT0RFID0gbmV3IExpbmUoIDAsIDAsIFdJUkVfUkFTVEVSX0xFTkdUSCwgMCwge1xyXG4gIGxpbmVXaWR0aDogU0NIRU1BVElDX0xJTkVfV0lEVEgsXHJcbiAgc3Ryb2tlOiBDb2xvci5CTEFDS1xyXG59ICkucmFzdGVyaXplZCggeyB3cmFwOiBmYWxzZSB9ICk7XHJcblxyXG4vLyBOb3QgZGlzcGxheWVkLCB1c2VkIHRvIGdldCBhY2N1cmF0ZSBoaXQgYm91bmRzIGZvciB0aGUgc2NoZW1hdGljIHZpZXcuXHJcbmNvbnN0IFNDSEVNQVRJQ19CQUNLR1JPVU5EID0gbmV3IExpbmUoIDAsIDAsIFdJUkVfUkFTVEVSX0xFTkdUSCwgMCwge1xyXG4gIGxpbmVXaWR0aDogTElGRUxJS0VfTElORV9XSURUSCxcclxuICBzdHJva2U6IENvbG9yLkJMVUUsXHJcbiAgb3BhY2l0eTogMC4wXHJcbn0gKS5yYXN0ZXJpemVkKCB7IHdyYXA6IGZhbHNlIH0gKTtcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYSBMaW5lYXJHcmFkaWVudCBmb3IgdGhlIHdpcmUsIGRlcGVuZGluZyBvbiB0aGUgb3JpZW50YXRpb24gcmVsYXRpdmUgdG8gdGhlIHNoYWRpbmcgKGxpZ2h0IGNvbWVzIGZyb21cclxuICogdG9wIGxlZnQpXHJcbiAqIEBwYXJhbSBjb2xvclN0b3BzIC0gZW50cmllcyBoYXZlIHBvaW50OiBOdW1iZXIsIGNvbG9yOiBDb2xvclxyXG4gKiBAcGFyYW0gY29sb3JTdG9wUG9pbnRNYXAgLSAoVmVjdG9yMikgPT4gbnVtYmVyLCB0aGUgb3BlcmF0aW9uIHRvIGFwcGx5IHRvIGNyZWF0ZSBjb2xvciBzdG9wc1xyXG4gKi9cclxuY29uc3QgY3JlYXRlR3JhZGllbnQgPSAoIGNvbG9yU3RvcHM6IEFycmF5PHsgcG9pbnQ6IG51bWJlcjsgY29sb3I6IENvbG9yIH0+LCBjb2xvclN0b3BQb2ludE1hcDogKCBuOiBudW1iZXIgKSA9PiBudW1iZXIgKSA9PiB7XHJcbiAgY29uc3QgZ3JhZGllbnQgPSBuZXcgTGluZWFyR3JhZGllbnQoIDAsIC1MSUZFTElLRV9MSU5FX1dJRFRIIC8gMiwgMCwgTElGRUxJS0VfTElORV9XSURUSCAvIDIgKTtcclxuICBjb2xvclN0b3BzLmZvckVhY2goIGNvbG9yU3RvcCA9PiB7XHJcbiAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoIGNvbG9yU3RvcFBvaW50TWFwKCBjb2xvclN0b3AucG9pbnQgKSwgY29sb3JTdG9wLmNvbG9yICk7XHJcbiAgfSApO1xyXG4gIHJldHVybiBncmFkaWVudDtcclxufTtcclxuXHJcbmNvbnN0IGNvbG9yU3RvcHMgPSBbXHJcbiAgeyBwb2ludDogMC4wLCBjb2xvcjogbmV3IENvbG9yKCAnIzk5M2YzNScgKSB9LFxyXG4gIHsgcG9pbnQ6IDAuMiwgY29sb3I6IG5ldyBDb2xvciggJyNjZDc3NjcnICkgfSxcclxuICB7IHBvaW50OiAwLjMsIGNvbG9yOiBuZXcgQ29sb3IoICcjZjZiZGEwJyApIH0sXHJcbiAgeyBwb2ludDogMS4wLCBjb2xvcjogbmV3IENvbG9yKCAnIzNjMGMwOCcgKSB9XHJcbl07XHJcblxyXG5jb25zdCBub3JtYWxHcmFkaWVudCA9IGNyZWF0ZUdyYWRpZW50KCBjb2xvclN0b3BzLCBfLmlkZW50aXR5ICk7XHJcbmNvbnN0IHJldmVyc2VHcmFkaWVudCA9IGNyZWF0ZUdyYWRpZW50KCBjb2xvclN0b3BzLnJldmVyc2UoKSwgKCBlOiBudW1iZXIgKSA9PiAxLjAgLSBlICk7XHJcblxyXG5jb25zdCBsaWZlbGlrZU5vZGVOb3JtYWwgPSBuZXcgTGluZSggMCwgMCwgV0lSRV9SQVNURVJfTEVOR1RILCAwLCB7XHJcbiAgbGluZVdpZHRoOiBMSUZFTElLRV9MSU5FX1dJRFRILFxyXG4gIHN0cm9rZTogbm9ybWFsR3JhZGllbnRcclxufSApLnJhc3Rlcml6ZWQoIHsgd3JhcDogZmFsc2UgfSApO1xyXG5cclxuY29uc3QgbGlmZWxpa2VOb2RlUmV2ZXJzZWQgPSBuZXcgTGluZSggMCwgMCwgV0lSRV9SQVNURVJfTEVOR1RILCAwLCB7XHJcbiAgbGluZVdpZHRoOiBMSUZFTElLRV9MSU5FX1dJRFRILFxyXG4gIHN0cm9rZTogcmV2ZXJzZUdyYWRpZW50XHJcbn0gKS5yYXN0ZXJpemVkKCB7IHdyYXA6IGZhbHNlIH0gKTtcclxuXHJcbi8vIE1ha2Ugc3VyZSB0aGUgaGVpZ2h0cyBhcmUgdGhlIHNhbWUgYXMgdGhlIHdpcmVzIHNvIHRoZXkgd2lsbCBsaW5lIHVwIHByb3Blcmx5LCBzZWVcclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1jb21tb24vaXNzdWVzLzM5MFxyXG5jb25zdCBsaWZlbGlrZVJvdW5kZWRDYXBOb3JtYWwgPSBuZXcgQ2lyY2xlKCBMSUZFTElLRV9MSU5FX1dJRFRIIC8gMiwge1xyXG4gIGZpbGw6IG5vcm1hbEdyYWRpZW50XHJcbn0gKS5yYXN0ZXJpemVkKCB7IHdyYXA6IGZhbHNlIH0gKTtcclxuXHJcbmNvbnN0IGxpZmVsaWtlUm91bmRlZENhcFJldmVyc2VkID0gbmV3IENpcmNsZSggTElGRUxJS0VfTElORV9XSURUSCAvIDIsIHtcclxuICBmaWxsOiByZXZlcnNlR3JhZGllbnRcclxufSApLnJhc3Rlcml6ZWQoIHsgd3JhcDogZmFsc2UgfSApO1xyXG5cclxuY29uc3QgSElHSExJR0hUX1NUUk9LRV9MSU5FX1NUWUxFUyA9IG5ldyBMaW5lU3R5bGVzKCB7XHJcbiAgbGluZVdpZHRoOiAyNixcclxuICBsaW5lQ2FwOiAncm91bmQnLFxyXG4gIGxpbmVKb2luOiAncm91bmQnXHJcbn0gKTtcclxuXHJcbmNvbnN0IFRPVUNIX0FSRUFfTElORV9TVFlMRVMgPSBuZXcgTGluZVN0eWxlcygge1xyXG4gIGxpbmVXaWR0aDogMjNcclxufSApO1xyXG5cclxuLyoqXHJcbiAqIENvbnZlbmllbmNlIGZ1bmN0aW9uIHRoYXQgZ2V0cyB0aGUgc3Ryb2tlZCBzaGFwZSBmb3IgdGhlIHdpcmUgbGluZSBub2RlIHdpdGggdGhlIGdpdmVuIHN0eWxlXHJcbiAqL1xyXG5jb25zdCBnZXRIaWdobGlnaHRTdHJva2VkU2hhcGUgPSAoIHdpcmU6IFdpcmUgKSA9PiB7XHJcbiAgY29uc3Qgc3RhcnRQb2ludCA9IHdpcmUuc3RhcnRQb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gIGNvbnN0IGVuZFBvaW50ID0gd2lyZS5lbmRQb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gIHJldHVybiBTaGFwZS5saW5lU2VnbWVudCggc3RhcnRQb2ludC54LCBzdGFydFBvaW50LnksIGVuZFBvaW50LngsIGVuZFBvaW50LnkgKVxyXG4gICAgLmdldFN0cm9rZWRTaGFwZSggSElHSExJR0hUX1NUUk9LRV9MSU5FX1NUWUxFUyApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENvbnZlbmllbmNlIGZ1bmN0aW9uIHRoYXQgZ2V0cyB0aGUgc3Ryb2tlZCBzaGFwZSBmb3IgdGhlIHdpcmUgbGluZSBub2RlIHdpdGggdGhlIGdpdmVuIHN0eWxlXHJcbiAqL1xyXG5jb25zdCBnZXRUb3VjaEFyZWEgPSAoIHdpcmU6IFdpcmUgKSA9PiB7XHJcbiAgY29uc3Qgc3RhcnRQb2ludCA9IHdpcmUuc3RhcnRQb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gIGNvbnN0IGVuZFBvaW50ID0gd2lyZS5lbmRQb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gIGNvbnN0IGRpc3RhbmNlID0gZW5kUG9pbnQuZGlzdGFuY2UoIHN0YXJ0UG9pbnQgKTtcclxuICBjb25zdCB2ZXJ0ZXhJbnNldCA9IDA7IC8vIHJ1biB0byB0aGUgZWRnZSBvZiB0aGUgd2lyZSBhcyB3ZSBkbyBmb3IgRml4ZWRDaXJjdWl0RWxlbWVudHNcclxuICBsZXQgdG91Y2hBcmVhU3RhcnQgPSBudWxsO1xyXG4gIGxldCB0b3VjaEFyZWFFbmQgPSBudWxsO1xyXG5cclxuICAvLyBFeHRlbmQgdGhlIHRvdWNoIGFyZWEgZnJvbSB2ZXJ0ZXggdG8gdmVydGV4XHJcbiAgaWYgKCBkaXN0YW5jZSA+IHZlcnRleEluc2V0ICogMiApIHtcclxuICAgIHRvdWNoQXJlYVN0YXJ0ID0gc3RhcnRQb2ludC5ibGVuZCggZW5kUG9pbnQsIHZlcnRleEluc2V0IC8gZGlzdGFuY2UgKTtcclxuICAgIHRvdWNoQXJlYUVuZCA9IGVuZFBvaW50LmJsZW5kKCBzdGFydFBvaW50LCB2ZXJ0ZXhJbnNldCAvIGRpc3RhbmNlICk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG5cclxuICAgIC8vIE5vdCBlbm91Z2ggcm9vbSBmb3IgYW55IHRvdWNoIGFyZWEgZm9yIHRoaXMgd2lyZVxyXG4gICAgdG91Y2hBcmVhU3RhcnQgPSBzdGFydFBvaW50LmF2ZXJhZ2UoIGVuZFBvaW50ICk7XHJcbiAgICB0b3VjaEFyZWFFbmQgPSB0b3VjaEFyZWFTdGFydDtcclxuICB9XHJcblxyXG4gIHJldHVybiBTaGFwZS5saW5lU2VnbWVudCggdG91Y2hBcmVhU3RhcnQsIHRvdWNoQXJlYUVuZCApLmdldFN0cm9rZWRTaGFwZSggVE9VQ0hfQVJFQV9MSU5FX1NUWUxFUyApO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2lyZU5vZGUgZXh0ZW5kcyBDaXJjdWl0RWxlbWVudE5vZGUge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdmlld1R5cGVQcm9wZXJ0eTogUHJvcGVydHk8Q2lyY3VpdEVsZW1lbnRWaWV3VHlwZT47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjaXJjdWl0Tm9kZTogQ2lyY3VpdE5vZGUgfCBudWxsO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgd2lyZTogV2lyZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IHN0YXJ0Q2FwUGFyZW50OiBOb2RlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZW5kQ2FwUGFyZW50OiBOb2RlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbGluZU5vZGVQYXJlbnQ6IE5vZGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBsaW5lTm9kZTogTm9kZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGhpZ2hsaWdodE5vZGU6IFBhdGg7XHJcbiAgcHVibGljIHJlYWRvbmx5IGRyYWdMaXN0ZW5lcjogQ2lyY3VpdE5vZGVEcmFnTGlzdGVuZXIgfCBudWxsO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVdpcmVOb2RlOiAoKSA9PiB2b2lkO1xyXG5cclxuICAvLyBJZGVudGlmaWVzIHRoZSBpbWFnZXMgdXNlZCB0byByZW5kZXIgdGhpcyBub2RlIHNvIHRoZXkgY2FuIGJlIHByZXBvcHVsYXRlZCBpbiB0aGUgV2ViR0wgc3ByaXRlIHNoZWV0LlxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgd2ViZ2xTcHJpdGVOb2RlcyA9IFtcclxuICAgIEJMQUNLX0xJTkVfTk9ERSxcclxuICAgIGxpZmVsaWtlTm9kZU5vcm1hbCxcclxuICAgIGxpZmVsaWtlTm9kZVJldmVyc2VkLFxyXG4gICAgbGlmZWxpa2VSb3VuZGVkQ2FwTm9ybWFsXHJcbiAgXTtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHNjcmVlblZpZXcgLSB0aGUgaWNvbiBpcyBjcmVhdGVkIHNlcGFyYXRlbHkgaW4gQ2lyY3VpdEVsZW1lbnRUb29sRmFjdG9yeSwgc28gKHVubGlrZVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBvdGhlciBDaXJjdWl0RWxlbWVudCB0eXBlcykgdGhlIHNjcmVlblZpZXcgaXMgcmVxdWlyZWRcclxuICAgKiBAcGFyYW0gY2lyY3VpdE5vZGVcclxuICAgKiBAcGFyYW0gd2lyZVxyXG4gICAqIEBwYXJhbSB2aWV3VHlwZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHRhbmRlbVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2NyZWVuVmlldzogQ0NLQ1NjcmVlblZpZXcsIGNpcmN1aXROb2RlOiBDaXJjdWl0Tm9kZSB8IG51bGwsIHdpcmU6IFdpcmUsIHZpZXdUeXBlUHJvcGVydHk6IFByb3BlcnR5PENpcmN1aXRFbGVtZW50Vmlld1R5cGU+LCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBjb25zdCBzdGFydENhcFBhcmVudCA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGxpZmVsaWtlUm91bmRlZENhcE5vcm1hbCBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZW5kQ2FwUGFyZW50ID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgbGlmZWxpa2VSb3VuZGVkQ2FwTm9ybWFsIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBUaGUgbm9kZSB0aGF0IHNob3dzIHRoZSB5ZWxsb3cgaGlnaGxpZ2h0IGZvciB0aGUgbm9kZSB3aGVuIHNlbGVjdGVkXHJcbiAgICBjb25zdCBoaWdobGlnaHROb2RlID0gbmV3IFBhdGgoIG51bGwsIHtcclxuICAgICAgc3Ryb2tlOiBDQ0tDQ29sb3JzLmhpZ2hsaWdodFN0cm9rZVByb3BlcnR5LFxyXG4gICAgICBsaW5lV2lkdGg6IENDS0NDb25zdGFudHMuSElHSExJR0hUX0xJTkVfV0lEVEgsXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBUaGUgbm9kZSB0aGF0IGRpc3BsYXlzIHRoZSBtYWluIGxpbmUgKGZvciBib3RoIHNjaGVtYXRpYyBhbmQgbGlmZWxpa2UpLiAgVGhpcyBkb2VzIG5vdCBpbmNsdWRlXHJcbiAgICAvLyB0aGUgcm91bmRlZCBjYXBzIGZvciB0aGUgbGlmZWxpa2Ugdmlld1xyXG4gICAgY29uc3QgbGluZU5vZGUgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIGNvbnN0IGxpbmVOb2RlUGFyZW50ID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgbGluZU5vZGUgXSxcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcidcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGhpZ2hsaWdodE5vZGVQYXJlbnQgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyBoaWdobGlnaHROb2RlIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjaXJjdWl0Tm9kZSAmJiBjaXJjdWl0Tm9kZS5oaWdobGlnaHRMYXllci5hZGRDaGlsZCggaGlnaGxpZ2h0Tm9kZVBhcmVudCApO1xyXG5cclxuICAgIGNvbnN0IGNpcmN1aXQgPSBjaXJjdWl0Tm9kZSAmJiBjaXJjdWl0Tm9kZS5jaXJjdWl0O1xyXG4gICAgc3VwZXIoIHdpcmUsIGNpcmN1aXQsIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBzdGFydENhcFBhcmVudCxcclxuICAgICAgICBlbmRDYXBQYXJlbnQsXHJcbiAgICAgICAgbGluZU5vZGVQYXJlbnRcclxuICAgICAgXSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnZpZXdUeXBlUHJvcGVydHkgPSB2aWV3VHlwZVByb3BlcnR5O1xyXG5cclxuICAgIHRoaXMuY2lyY3VpdE5vZGUgPSBjaXJjdWl0Tm9kZTtcclxuXHJcbiAgICB0aGlzLndpcmUgPSB3aXJlO1xyXG5cclxuICAgIHRoaXMuc3RhcnRDYXBQYXJlbnQgPSBzdGFydENhcFBhcmVudDtcclxuICAgIHRoaXMuZW5kQ2FwUGFyZW50ID0gZW5kQ2FwUGFyZW50O1xyXG4gICAgdGhpcy5saW5lTm9kZVBhcmVudCA9IGxpbmVOb2RlUGFyZW50O1xyXG4gICAgdGhpcy5saW5lTm9kZSA9IGxpbmVOb2RlO1xyXG4gICAgdGhpcy5oaWdobGlnaHROb2RlID0gaGlnaGxpZ2h0Tm9kZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZW4gdGhlIHZpZXcgdHlwZSBjaGFuZ2VzIChsaWZlbGlrZSB2cyBzY2hlbWF0aWMpLCB1cGRhdGUgdGhlIG5vZGVcclxuICAgICAqL1xyXG4gICAgY29uc3QgbWFya0FzRGlydHkgPSAoKSA9PiB7XHJcbiAgICAgIGlmICggdGhpcy5pc0Rpc3Bvc2VkICkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1hcmtBc0RpcnR5KCk7XHJcblxyXG4gICAgICAvLyBGb3IgdGhlIGljb24sIHdlIG11c3QgdXBkYXRlIHJpZ2h0IGF3YXkgc2luY2Ugbm8gc3RlcCgpIGlzIGNhbGxlZFxyXG4gICAgICBpZiAoICFjaXJjdWl0Tm9kZSApIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVJlbmRlcigpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHZpZXdUeXBlUHJvcGVydHkubGluayggbWFya0FzRGlydHkgKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZSB3aGV0aGVyIHRoZSBXaXJlTm9kZSBpcyBwaWNrYWJsZVxyXG4gICAgICovXHJcbiAgICBjb25zdCB1cGRhdGVQaWNrYWJsZSA9ICggaW50ZXJhY3RpdmU6IGJvb2xlYW4gKSA9PiB7XHJcbiAgICAgIHRoaXMucGlja2FibGUgPSBpbnRlcmFjdGl2ZTtcclxuICAgIH07XHJcbiAgICB3aXJlLmludGVyYWN0aXZlUHJvcGVydHkubGluayggdXBkYXRlUGlja2FibGUgKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSBzdGFydCB2ZXJ0ZXggY2hhbmdlcyB0byBhIGRpZmZlcmVudCBpbnN0YW5jZSAoc2F5IHdoZW4gdmVydGljZXMgYXJlIHNvbGRlcmVkIHRvZ2V0aGVyKSwgdW5saW5rIHRoZVxyXG4gICAgLy8gb2xkIG9uZSBhbmQgbGluayB0byB0aGUgbmV3IG9uZS5cclxuICAgIGNvbnN0IGRvVXBkYXRlVHJhbnNmb3JtID0gKCBuZXdWZXJ0ZXg6IFZlcnRleCwgb2xkVmVydGV4OiBWZXJ0ZXggfCBudWxsIHwgdW5kZWZpbmVkICkgPT4ge1xyXG4gICAgICBvbGRWZXJ0ZXggJiYgb2xkVmVydGV4LnBvc2l0aW9uUHJvcGVydHkudW5saW5rKCBtYXJrQXNEaXJ0eSApO1xyXG4gICAgICBuZXdWZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBtYXJrQXNEaXJ0eSApO1xyXG4gICAgfTtcclxuICAgIHdpcmUuc3RhcnRWZXJ0ZXhQcm9wZXJ0eS5saW5rKCBkb1VwZGF0ZVRyYW5zZm9ybSApO1xyXG4gICAgd2lyZS5lbmRWZXJ0ZXhQcm9wZXJ0eS5saW5rKCBkb1VwZGF0ZVRyYW5zZm9ybSApO1xyXG5cclxuICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhlIHN0YXJ0IHBvaW50IHRvIHNlZSBpZiBpdCB3YXMgZHJhZ2dlZCBvciB0YXBwZWQgdG8gYmUgc2VsZWN0ZWRcclxuICAgIGxldCBpbml0aWFsUG9pbnQ6IFZlY3RvcjIgfCBudWxsID0gbnVsbDtcclxuICAgIGxldCBsYXRlc3RQb2ludDogVmVjdG9yMiB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIC8vIEtlZXAgdHJhY2sgb2Ygd2hldGhlciBpdCB3YXMgZHJhZ2dlZFxyXG4gICAgbGV0IGRyYWdnZWQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoIHNjcmVlblZpZXcgKSB7XHJcblxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjaXJjdWl0Tm9kZSAhPT0gbnVsbCApO1xyXG5cclxuICAgICAgLy8gSW5wdXQgbGlzdGVuZXIgZm9yIGRyYWdnaW5nIHRoZSBib2R5IG9mIHRoZSB3aXJlLCB0byB0cmFuc2xhdGUgaXQuXHJcbiAgICAgIHRoaXMuZHJhZ0xpc3RlbmVyID0gbmV3IENpcmN1aXROb2RlRHJhZ0xpc3RlbmVyKCBjaXJjdWl0Tm9kZSEsIFtcclxuICAgICAgICAoKSA9PiB3aXJlLnN0YXJ0VmVydGV4UHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgKCkgPT4gd2lyZS5lbmRWZXJ0ZXhQcm9wZXJ0eS5nZXQoKVxyXG4gICAgICBdLCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0xpc3RlbmVyJyApLFxyXG4gICAgICAgIHN0YXJ0OiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKSA9PiB7XHJcbiAgICAgICAgICBpZiAoIHdpcmUuaW50ZXJhY3RpdmVQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFN0YXJ0IGRyYWcgYnkgc3RhcnRpbmcgYSBkcmFnIG9uIHN0YXJ0IGFuZCBlbmQgdmVydGljZXNcclxuICAgICAgICAgICAgY2lyY3VpdE5vZGUhLnN0YXJ0RHJhZ1ZlcnRleCggZXZlbnQucG9pbnRlci5wb2ludCwgd2lyZS5zdGFydFZlcnRleFByb3BlcnR5LmdldCgpLCB0aGlzLmNpcmN1aXRFbGVtZW50ICk7XHJcbiAgICAgICAgICAgIGNpcmN1aXROb2RlIS5zdGFydERyYWdWZXJ0ZXgoIGV2ZW50LnBvaW50ZXIucG9pbnQsIHdpcmUuZW5kVmVydGV4UHJvcGVydHkuZ2V0KCksIHRoaXMuY2lyY3VpdEVsZW1lbnQgKTtcclxuICAgICAgICAgICAgZHJhZ2dlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpbml0aWFsUG9pbnQgPSBldmVudC5wb2ludGVyLnBvaW50LmNvcHkoKTtcclxuICAgICAgICAgICAgbGF0ZXN0UG9pbnQgPSBldmVudC5wb2ludGVyLnBvaW50LmNvcHkoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGRyYWc6ICggZXZlbnQ6IFNjZW5lcnlFdmVudCApID0+IHtcclxuICAgICAgICAgIGlmICggd2lyZS5pbnRlcmFjdGl2ZVByb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgICAgICAgbGF0ZXN0UG9pbnQgPSBldmVudC5wb2ludGVyLnBvaW50LmNvcHkoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIERyYWcgYnkgdHJhbnNsYXRpbmcgYm90aCBvZiB0aGUgdmVydGljZXNcclxuICAgICAgICAgICAgY2lyY3VpdE5vZGUhLmRyYWdWZXJ0ZXgoIGV2ZW50LnBvaW50ZXIucG9pbnQsIHdpcmUuc3RhcnRWZXJ0ZXhQcm9wZXJ0eS5nZXQoKSwgZmFsc2UgKTtcclxuICAgICAgICAgICAgY2lyY3VpdE5vZGUhLmRyYWdWZXJ0ZXgoIGV2ZW50LnBvaW50ZXIucG9pbnQsIHdpcmUuZW5kVmVydGV4UHJvcGVydHkuZ2V0KCksIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRyYWdnZWQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW5kOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmVuZERyYWcoIHRoaXMsIFtcclxuICAgICAgICAgICAgd2lyZS5zdGFydFZlcnRleFByb3BlcnR5LmdldCgpLFxyXG4gICAgICAgICAgICB3aXJlLmVuZFZlcnRleFByb3BlcnR5LmdldCgpXHJcbiAgICAgICAgICBdLCBzY3JlZW5WaWV3LCBjaXJjdWl0Tm9kZSEsIGluaXRpYWxQb2ludCEsIGxhdGVzdFBvaW50ISwgZHJhZ2dlZCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIHRoaXMuZHJhZ0xpc3RlbmVyICk7XHJcblxyXG4gICAgICBjaXJjdWl0Tm9kZSEuY2lyY3VpdC5zZWxlY3Rpb25Qcm9wZXJ0eS5saW5rKCBtYXJrQXNEaXJ0eSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuZHJhZ0xpc3RlbmVyID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1vdmUgdGhlIHdpcmUgZWxlbWVudCB0byB0aGUgYmFjayBvZiB0aGUgdmlldyB3aGVuIGNvbm5lY3RlZCB0byBhbm90aGVyIGNpcmN1aXQgZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBjb25zdCBtb3ZlVG9CYWNrID0gKCkgPT4ge1xyXG5cclxuICAgICAgLy8gQ29tcG9uZW50cyBvdXRzaWRlIHRoZSBibGFjayBib3ggZG8gbm90IG1vdmUgaW4gYmFjayBvZiB0aGUgb3ZlcmxheVxyXG4gICAgICBpZiAoIHdpcmUuaW50ZXJhY3RpdmVQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgICAgLy8gQ29ubmVjdGVkIHdpcmVzIHNob3VsZCBhbHdheXMgYmUgYmVoaW5kIHRoZSBzb2xkZXIgYW5kIGNpcmN1aXQgZWxlbWVudHNcclxuICAgICAgICB0aGlzLm1vdmVUb0JhY2soKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHdpcmUuY29ubmVjdGVkRW1pdHRlci5hZGRMaXN0ZW5lciggbW92ZVRvQmFjayApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZVdpcmVOb2RlID0gKCkgPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmRyYWdMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLmRyYWdMaXN0ZW5lciEuaW50ZXJydXB0KCk7XHJcbiAgICAgIHRoaXMuZHJhZ0xpc3RlbmVyIS5kaXNwb3NlKCk7XHJcblxyXG4gICAgICB3aXJlLnN0YXJ0VmVydGV4UHJvcGVydHkudW5saW5rKCBkb1VwZGF0ZVRyYW5zZm9ybSApO1xyXG4gICAgICB3aXJlLmVuZFZlcnRleFByb3BlcnR5LnVubGluayggZG9VcGRhdGVUcmFuc2Zvcm0gKTtcclxuXHJcbiAgICAgIGNpcmN1aXROb2RlICYmIGNpcmN1aXROb2RlLmNpcmN1aXQuc2VsZWN0aW9uUHJvcGVydHkudW5saW5rKCBtYXJrQXNEaXJ0eSApO1xyXG4gICAgICB3aXJlLmludGVyYWN0aXZlUHJvcGVydHkudW5saW5rKCB1cGRhdGVQaWNrYWJsZSApO1xyXG5cclxuICAgICAgd2lyZS5zdGFydFBvc2l0aW9uUHJvcGVydHkudW5saW5rKCBtYXJrQXNEaXJ0eSApO1xyXG4gICAgICB3aXJlLmVuZFBvc2l0aW9uUHJvcGVydHkudW5saW5rKCBtYXJrQXNEaXJ0eSApO1xyXG5cclxuICAgICAgd2lyZS5jb25uZWN0ZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBtb3ZlVG9CYWNrICk7XHJcblxyXG4gICAgICBjaXJjdWl0Tm9kZSAmJiBjaXJjdWl0Tm9kZS5oaWdobGlnaHRMYXllci5yZW1vdmVDaGlsZCggaGlnaGxpZ2h0Tm9kZVBhcmVudCApO1xyXG5cclxuICAgICAgdmlld1R5cGVQcm9wZXJ0eS51bmxpbmsoIG1hcmtBc0RpcnR5ICk7XHJcblxyXG4gICAgICB0aGlzLmxpbmVOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgdGhpcy5oaWdobGlnaHROb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgdGhpcy5saW5lTm9kZVBhcmVudC5kaXNwb3NlKCk7XHJcbiAgICAgIGhpZ2hsaWdodE5vZGVQYXJlbnQuZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLnN0YXJ0Q2FwUGFyZW50LmRpc3Bvc2UoKTtcclxuICAgICAgdGhpcy5lbmRDYXBQYXJlbnQuZGlzcG9zZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBGb3IgaWNvbnMsIHVwZGF0ZSB0aGUgZW5kIGNhcHNcclxuICAgICFjaXJjdWl0Tm9kZSAmJiB0aGlzLnVwZGF0ZVJlbmRlcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTXVsdGlwbGUgdXBkYXRlcyBtYXkgaGFwcGVuIHBlciBmcmFtZSwgdGhleSBhcmUgYmF0Y2hlZCBhbmQgdXBkYXRlZCBvbmNlIGluIHRoZSB2aWV3IHN0ZXAgdG8gaW1wcm92ZSBwZXJmb3JtYW5jZS5cclxuICAgKiBDQ0tDTGlnaHRCdWxiTm9kZSBjYWxscyB1cGRhdGVSZW5kZXIgZm9yIGl0cyBjaGlsZCBzb2NrZXQgbm9kZVxyXG4gICAqL1xyXG4gIHB1YmxpYyB1cGRhdGVSZW5kZXIoKTogdm9pZCB7XHJcbiAgICBjb25zdCB2aWV3ID0gdGhpcy52aWV3VHlwZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgaWYgKCB2aWV3ID09PSBDaXJjdWl0RWxlbWVudFZpZXdUeXBlLkxJRkVMSUtFICkge1xyXG5cclxuICAgICAgLy8gZGV0ZXJtaW5lIHdoZXRoZXIgdG8gdXNlIHRoZSBmb3J3YXJkIG9yIHJldmVyc2UgZ3JhZGllbnQgYmFzZWQgb24gdGhlIGFuZ2xlXHJcbiAgICAgIGNvbnN0IHN0YXJ0UG9pbnQgPSB0aGlzLndpcmUuc3RhcnRQb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgICBjb25zdCBlbmRQb2ludCA9IHRoaXMud2lyZS5lbmRQb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgICBjb25zdCBsaWdodGluZ0RpcmVjdGlvbiA9IG5ldyBWZWN0b3IyKCAwLjkxNiwgMC40ICk7IC8vIHNhbXBsZWQgbWFudWFsbHlcclxuICAgICAgY29uc3Qgd2lyZVZlY3RvciA9IGVuZFBvaW50Lm1pbnVzKCBzdGFydFBvaW50ICk7XHJcbiAgICAgIGNvbnN0IGRvdCA9IGxpZ2h0aW5nRGlyZWN0aW9uLmRvdCggd2lyZVZlY3RvciApO1xyXG5cclxuICAgICAgLy8gb25seSBjaGFuZ2UgY2hpbGRyZW4gaWYgbmVjZXNzYXJ5XHJcbiAgICAgIGNvbnN0IGxpbmVOb2RlQ2hpbGQgPSBkb3QgPCAwID8gbGlmZWxpa2VOb2RlUmV2ZXJzZWQgOiBsaWZlbGlrZU5vZGVOb3JtYWw7XHJcbiAgICAgIGNvbnN0IGNhcENoaWxkID0gZG90IDwgMCA/IGxpZmVsaWtlUm91bmRlZENhcFJldmVyc2VkIDogbGlmZWxpa2VSb3VuZGVkQ2FwTm9ybWFsO1xyXG4gICAgICB0aGlzLmxpbmVOb2RlLmdldENoaWxkQXQoIDAgKSAhPT0gbGluZU5vZGVDaGlsZCAmJiB0aGlzLmxpbmVOb2RlLnNldENoaWxkcmVuKCBbIGxpbmVOb2RlQ2hpbGQgXSApO1xyXG4gICAgICB0aGlzLmVuZENhcFBhcmVudC5nZXRDaGlsZEF0KCAwICkgIT09IGNhcENoaWxkICYmIHRoaXMuZW5kQ2FwUGFyZW50LnNldENoaWxkcmVuKCBbIGNhcENoaWxkIF0gKTtcclxuICAgICAgdGhpcy5zdGFydENhcFBhcmVudC5nZXRDaGlsZEF0KCAwICkgIT09IGNhcENoaWxkICYmIHRoaXMuc3RhcnRDYXBQYXJlbnQuc2V0Q2hpbGRyZW4oIFsgY2FwQ2hpbGQgXSApO1xyXG4gICAgICB0aGlzLnN0YXJ0Q2FwUGFyZW50LnZpc2libGUgPSB0cnVlO1xyXG4gICAgICB0aGlzLmVuZENhcFBhcmVudC52aXNpYmxlID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAoIHRoaXMubGluZU5vZGUuZ2V0Q2hpbGRBdCggMCApICE9PSBTQ0hFTUFUSUNfQkFDS0dST1VORCApICYmIHRoaXMubGluZU5vZGUuc2V0Q2hpbGRyZW4oIFsgU0NIRU1BVElDX0JBQ0tHUk9VTkQsIEJMQUNLX0xJTkVfTk9ERSBdICk7XHJcbiAgICAgIHRoaXMuc3RhcnRDYXBQYXJlbnQudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmVuZENhcFBhcmVudC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3RhcnRQb3NpdGlvbiA9IHRoaXMuY2lyY3VpdEVsZW1lbnQuc3RhcnRQb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgY29uc3QgZW5kUG9zaXRpb24gPSB0aGlzLmNpcmN1aXRFbGVtZW50LmVuZFBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBkZWx0YSA9IGVuZFBvc2l0aW9uLm1pbnVzKCBzdGFydFBvc2l0aW9uICk7XHJcblxyXG4gICAgLy8gUHJldmVudCB0aGUgY2FzZSB3aGVyZSBhIHZlcnRleCBsaWVzIG9uIGFub3RoZXIgdmVydGV4LCBwYXJ0aWN1bGFybHkgZm9yIGZ1enogdGVzdGluZ1xyXG4gICAgY29uc3QgbWFnbml0dWRlID0gTWF0aC5tYXgoIGRlbHRhLm1hZ25pdHVkZSwgMUUtOCApO1xyXG4gICAgY29uc3QgYW5nbGUgPSBkZWx0YS5hbmdsZTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIG5vZGUgdHJhbnNmb3JtXHJcbiAgICB0aGlzLmVuZENhcFBhcmVudC5zZXRNYXRyaXgoIE1BVFJJWC5zZXRUb1RyYW5zbGF0aW9uUm90YXRpb25Qb2ludCggZW5kUG9zaXRpb24sIGFuZ2xlICkgKTtcclxuXHJcbiAgICAvLyBUaGlzIHRyYW5zZm9ybSBpcyBkb25lIHNlY29uZCBzbyB0aGUgbWF0cml4IGlzIGFscmVhZHkgaW4gZ29vZCBzaGFwZSBmb3IgdGhlIHNjYWxpbmcgc3RlcFxyXG4gICAgdGhpcy5zdGFydENhcFBhcmVudC5zZXRNYXRyaXgoIE1BVFJJWC5zZXRUb1RyYW5zbGF0aW9uUm90YXRpb25Qb2ludCggc3RhcnRQb3NpdGlvbiwgYW5nbGUgKSApO1xyXG5cclxuICAgIE1BVFJJWC5tdWx0aXBseU1hdHJpeCggTWF0cml4My5zY2FsaW5nKCBtYWduaXR1ZGUgLyBXSVJFX1JBU1RFUl9MRU5HVEgsIDEgKSApO1xyXG4gICAgdGhpcy5saW5lTm9kZVBhcmVudC5zZXRNYXRyaXgoIE1BVFJJWCApO1xyXG5cclxuICAgIGlmICggdGhpcy5jaXJjdWl0Tm9kZSApIHtcclxuICAgICAgY29uc3Qgc2VsZWN0ZWRDaXJjdWl0RWxlbWVudCA9IHRoaXMuY2lyY3VpdE5vZGUuY2lyY3VpdC5zZWxlY3Rpb25Qcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgY29uc3QgaXNDdXJyZW50bHlIaWdobGlnaHRlZCA9IHNlbGVjdGVkQ2lyY3VpdEVsZW1lbnQgPT09IHRoaXMud2lyZTtcclxuICAgICAgdGhpcy5oaWdobGlnaHROb2RlLnZpc2libGUgPSBpc0N1cnJlbnRseUhpZ2hsaWdodGVkO1xyXG4gICAgICBpZiAoIGlzQ3VycmVudGx5SGlnaGxpZ2h0ZWQgKSB7XHJcbiAgICAgICAgdGhpcy5oaWdobGlnaHROb2RlLnNoYXBlID0gZ2V0SGlnaGxpZ2h0U3Ryb2tlZFNoYXBlKCB0aGlzLndpcmUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy50b3VjaEFyZWEgPSBnZXRUb3VjaEFyZWEoIHRoaXMud2lyZSApO1xyXG4gICAgdGhpcy5tb3VzZUFyZWEgPSB0aGlzLnRvdWNoQXJlYTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlV2lyZU5vZGUoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24ucmVnaXN0ZXIoICdXaXJlTm9kZScsIFdpcmVOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxTQUFTQyxVQUFVLEVBQUVDLEtBQUssUUFBUSw2QkFBNkI7QUFDL0QsU0FBU0MsTUFBTSxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsY0FBYyxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBc0IsZ0NBQWdDO0FBRTlHLE9BQU9DLGFBQWEsTUFBTSxxQkFBcUI7QUFDL0MsT0FBT0MsNEJBQTRCLE1BQU0sb0NBQW9DO0FBQzdFLE9BQU9DLHNCQUFzQixNQUFNLG9DQUFvQztBQUl2RSxPQUFPQyxrQkFBa0IsTUFBTSx5QkFBeUI7QUFFeEQsT0FBT0MsdUJBQXVCLE1BQU0sOEJBQThCO0FBQ2xFLE9BQU9DLFVBQVUsTUFBTSxpQkFBaUI7O0FBRXhDO0FBQ0EsTUFBTUMsbUJBQW1CLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDaEMsTUFBTUMsb0JBQW9CLEdBQUdQLGFBQWEsQ0FBQ08sb0JBQW9CLENBQUMsQ0FBQzs7QUFFakU7QUFDQSxNQUFNQyxNQUFNLEdBQUcsSUFBSWxCLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QixNQUFNbUIsa0JBQWtCLEdBQUcsR0FBRzs7QUFFOUI7QUFDQSxNQUFNQyxlQUFlLEdBQUcsSUFBSWQsSUFBSSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVhLGtCQUFrQixFQUFFLENBQUMsRUFBRTtFQUM3REUsU0FBUyxFQUFFSixvQkFBb0I7RUFDL0JLLE1BQU0sRUFBRWpCLEtBQUssQ0FBQ2tCO0FBQ2hCLENBQUUsQ0FBQyxDQUFDQyxVQUFVLENBQUU7RUFBRUMsSUFBSSxFQUFFO0FBQU0sQ0FBRSxDQUFDOztBQUVqQztBQUNBLE1BQU1DLG9CQUFvQixHQUFHLElBQUlwQixJQUFJLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRWEsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFO0VBQ2xFRSxTQUFTLEVBQUVMLG1CQUFtQjtFQUM5Qk0sTUFBTSxFQUFFakIsS0FBSyxDQUFDc0IsSUFBSTtFQUNsQkMsT0FBTyxFQUFFO0FBQ1gsQ0FBRSxDQUFDLENBQUNKLFVBQVUsQ0FBRTtFQUFFQyxJQUFJLEVBQUU7QUFBTSxDQUFFLENBQUM7O0FBRWpDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1JLGNBQWMsR0FBR0EsQ0FBRUMsVUFBa0QsRUFBRUMsaUJBQTBDLEtBQU07RUFDM0gsTUFBTUMsUUFBUSxHQUFHLElBQUl6QixjQUFjLENBQUUsQ0FBQyxFQUFFLENBQUNTLG1CQUFtQixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUVBLG1CQUFtQixHQUFHLENBQUUsQ0FBQztFQUM5RmMsVUFBVSxDQUFDRyxPQUFPLENBQUVDLFNBQVMsSUFBSTtJQUMvQkYsUUFBUSxDQUFDRyxZQUFZLENBQUVKLGlCQUFpQixDQUFFRyxTQUFTLENBQUNFLEtBQU0sQ0FBQyxFQUFFRixTQUFTLENBQUNHLEtBQU0sQ0FBQztFQUNoRixDQUFFLENBQUM7RUFDSCxPQUFPTCxRQUFRO0FBQ2pCLENBQUM7QUFFRCxNQUFNRixVQUFVLEdBQUcsQ0FDakI7RUFBRU0sS0FBSyxFQUFFLEdBQUc7RUFBRUMsS0FBSyxFQUFFLElBQUloQyxLQUFLLENBQUUsU0FBVTtBQUFFLENBQUMsRUFDN0M7RUFBRStCLEtBQUssRUFBRSxHQUFHO0VBQUVDLEtBQUssRUFBRSxJQUFJaEMsS0FBSyxDQUFFLFNBQVU7QUFBRSxDQUFDLEVBQzdDO0VBQUUrQixLQUFLLEVBQUUsR0FBRztFQUFFQyxLQUFLLEVBQUUsSUFBSWhDLEtBQUssQ0FBRSxTQUFVO0FBQUUsQ0FBQyxFQUM3QztFQUFFK0IsS0FBSyxFQUFFLEdBQUc7RUFBRUMsS0FBSyxFQUFFLElBQUloQyxLQUFLLENBQUUsU0FBVTtBQUFFLENBQUMsQ0FDOUM7QUFFRCxNQUFNaUMsY0FBYyxHQUFHVCxjQUFjLENBQUVDLFVBQVUsRUFBRVMsQ0FBQyxDQUFDQyxRQUFTLENBQUM7QUFDL0QsTUFBTUMsZUFBZSxHQUFHWixjQUFjLENBQUVDLFVBQVUsQ0FBQ1ksT0FBTyxDQUFDLENBQUMsRUFBSUMsQ0FBUyxJQUFNLEdBQUcsR0FBR0EsQ0FBRSxDQUFDO0FBRXhGLE1BQU1DLGtCQUFrQixHQUFHLElBQUl0QyxJQUFJLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRWEsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFO0VBQ2hFRSxTQUFTLEVBQUVMLG1CQUFtQjtFQUM5Qk0sTUFBTSxFQUFFZ0I7QUFDVixDQUFFLENBQUMsQ0FBQ2QsVUFBVSxDQUFFO0VBQUVDLElBQUksRUFBRTtBQUFNLENBQUUsQ0FBQztBQUVqQyxNQUFNb0Isb0JBQW9CLEdBQUcsSUFBSXZDLElBQUksQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFYSxrQkFBa0IsRUFBRSxDQUFDLEVBQUU7RUFDbEVFLFNBQVMsRUFBRUwsbUJBQW1CO0VBQzlCTSxNQUFNLEVBQUVtQjtBQUNWLENBQUUsQ0FBQyxDQUFDakIsVUFBVSxDQUFFO0VBQUVDLElBQUksRUFBRTtBQUFNLENBQUUsQ0FBQzs7QUFFakM7QUFDQTtBQUNBLE1BQU1xQix3QkFBd0IsR0FBRyxJQUFJMUMsTUFBTSxDQUFFWSxtQkFBbUIsR0FBRyxDQUFDLEVBQUU7RUFDcEUrQixJQUFJLEVBQUVUO0FBQ1IsQ0FBRSxDQUFDLENBQUNkLFVBQVUsQ0FBRTtFQUFFQyxJQUFJLEVBQUU7QUFBTSxDQUFFLENBQUM7QUFFakMsTUFBTXVCLDBCQUEwQixHQUFHLElBQUk1QyxNQUFNLENBQUVZLG1CQUFtQixHQUFHLENBQUMsRUFBRTtFQUN0RStCLElBQUksRUFBRU47QUFDUixDQUFFLENBQUMsQ0FBQ2pCLFVBQVUsQ0FBRTtFQUFFQyxJQUFJLEVBQUU7QUFBTSxDQUFFLENBQUM7QUFFakMsTUFBTXdCLDRCQUE0QixHQUFHLElBQUkvQyxVQUFVLENBQUU7RUFDbkRtQixTQUFTLEVBQUUsRUFBRTtFQUNiNkIsT0FBTyxFQUFFLE9BQU87RUFDaEJDLFFBQVEsRUFBRTtBQUNaLENBQUUsQ0FBQztBQUVILE1BQU1DLHNCQUFzQixHQUFHLElBQUlsRCxVQUFVLENBQUU7RUFDN0NtQixTQUFTLEVBQUU7QUFDYixDQUFFLENBQUM7O0FBRUg7QUFDQTtBQUNBO0FBQ0EsTUFBTWdDLHdCQUF3QixHQUFLQyxJQUFVLElBQU07RUFDakQsTUFBTUMsVUFBVSxHQUFHRCxJQUFJLENBQUNFLHFCQUFxQixDQUFDQyxHQUFHLENBQUMsQ0FBQztFQUNuRCxNQUFNQyxRQUFRLEdBQUdKLElBQUksQ0FBQ0ssbUJBQW1CLENBQUNGLEdBQUcsQ0FBQyxDQUFDO0VBQy9DLE9BQU90RCxLQUFLLENBQUN5RCxXQUFXLENBQUVMLFVBQVUsQ0FBQ00sQ0FBQyxFQUFFTixVQUFVLENBQUNPLENBQUMsRUFBRUosUUFBUSxDQUFDRyxDQUFDLEVBQUVILFFBQVEsQ0FBQ0ksQ0FBRSxDQUFDLENBQzNFQyxlQUFlLENBQUVkLDRCQUE2QixDQUFDO0FBQ3BELENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsTUFBTWUsWUFBWSxHQUFLVixJQUFVLElBQU07RUFDckMsTUFBTUMsVUFBVSxHQUFHRCxJQUFJLENBQUNFLHFCQUFxQixDQUFDQyxHQUFHLENBQUMsQ0FBQztFQUNuRCxNQUFNQyxRQUFRLEdBQUdKLElBQUksQ0FBQ0ssbUJBQW1CLENBQUNGLEdBQUcsQ0FBQyxDQUFDO0VBQy9DLE1BQU1RLFFBQVEsR0FBR1AsUUFBUSxDQUFDTyxRQUFRLENBQUVWLFVBQVcsQ0FBQztFQUNoRCxNQUFNVyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDdkIsSUFBSUMsY0FBYyxHQUFHLElBQUk7RUFDekIsSUFBSUMsWUFBWSxHQUFHLElBQUk7O0VBRXZCO0VBQ0EsSUFBS0gsUUFBUSxHQUFHQyxXQUFXLEdBQUcsQ0FBQyxFQUFHO0lBQ2hDQyxjQUFjLEdBQUdaLFVBQVUsQ0FBQ2MsS0FBSyxDQUFFWCxRQUFRLEVBQUVRLFdBQVcsR0FBR0QsUUFBUyxDQUFDO0lBQ3JFRyxZQUFZLEdBQUdWLFFBQVEsQ0FBQ1csS0FBSyxDQUFFZCxVQUFVLEVBQUVXLFdBQVcsR0FBR0QsUUFBUyxDQUFDO0VBQ3JFLENBQUMsTUFDSTtJQUVIO0lBQ0FFLGNBQWMsR0FBR1osVUFBVSxDQUFDZSxPQUFPLENBQUVaLFFBQVMsQ0FBQztJQUMvQ1UsWUFBWSxHQUFHRCxjQUFjO0VBQy9CO0VBRUEsT0FBT2hFLEtBQUssQ0FBQ3lELFdBQVcsQ0FBRU8sY0FBYyxFQUFFQyxZQUFhLENBQUMsQ0FBQ0wsZUFBZSxDQUFFWCxzQkFBdUIsQ0FBQztBQUNwRyxDQUFDO0FBRUQsZUFBZSxNQUFNbUIsUUFBUSxTQUFTMUQsa0JBQWtCLENBQUM7RUFZdkQ7RUFDQSxPQUF1QjJELGdCQUFnQixHQUFHLENBQ3hDcEQsZUFBZSxFQUNmd0Isa0JBQWtCLEVBQ2xCQyxvQkFBb0IsRUFDcEJDLHdCQUF3QixDQUN6Qjs7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1MyQixXQUFXQSxDQUFFQyxVQUEwQixFQUFFQyxXQUErQixFQUFFckIsSUFBVSxFQUFFc0IsZ0JBQWtELEVBQUVDLE1BQWMsRUFBRztJQUVoSyxNQUFNQyxjQUFjLEdBQUcsSUFBSXRFLElBQUksQ0FBRTtNQUMvQnVFLFFBQVEsRUFBRSxDQUFFakMsd0JBQXdCO0lBQ3RDLENBQUUsQ0FBQztJQUVILE1BQU1rQyxZQUFZLEdBQUcsSUFBSXhFLElBQUksQ0FBRTtNQUM3QnVFLFFBQVEsRUFBRSxDQUFFakMsd0JBQXdCO0lBQ3RDLENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1tQyxhQUFhLEdBQUcsSUFBSXhFLElBQUksQ0FBRSxJQUFJLEVBQUU7TUFDcENhLE1BQU0sRUFBRVAsVUFBVSxDQUFDbUUsdUJBQXVCO01BQzFDN0QsU0FBUyxFQUFFWCxhQUFhLENBQUN5RSxvQkFBb0I7TUFDN0NDLFFBQVEsRUFBRSxLQUFLO01BQ2ZDLE9BQU8sRUFBRTtJQUNYLENBQUUsQ0FBQzs7SUFFSDtJQUNBO0lBQ0EsTUFBTUMsUUFBUSxHQUFHLElBQUk5RSxJQUFJLENBQUMsQ0FBQztJQUUzQixNQUFNK0UsY0FBYyxHQUFHLElBQUkvRSxJQUFJLENBQUU7TUFDL0J1RSxRQUFRLEVBQUUsQ0FBRU8sUUFBUSxDQUFFO01BQ3RCRSxNQUFNLEVBQUU7SUFDVixDQUFFLENBQUM7SUFDSCxNQUFNQyxtQkFBbUIsR0FBRyxJQUFJakYsSUFBSSxDQUFFO01BQ3BDdUUsUUFBUSxFQUFFLENBQUVFLGFBQWE7SUFDM0IsQ0FBRSxDQUFDO0lBRUhOLFdBQVcsSUFBSUEsV0FBVyxDQUFDZSxjQUFjLENBQUNDLFFBQVEsQ0FBRUYsbUJBQW9CLENBQUM7SUFFekUsTUFBTUcsT0FBTyxHQUFHakIsV0FBVyxJQUFJQSxXQUFXLENBQUNpQixPQUFPO0lBQ2xELEtBQUssQ0FBRXRDLElBQUksRUFBRXNDLE9BQU8sRUFBRTtNQUNwQmIsUUFBUSxFQUFFLENBQ1JELGNBQWMsRUFDZEUsWUFBWSxFQUNaTyxjQUFjLENBQ2Y7TUFDRFYsTUFBTSxFQUFFQTtJQUNWLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0QsZ0JBQWdCLEdBQUdBLGdCQUFnQjtJQUV4QyxJQUFJLENBQUNELFdBQVcsR0FBR0EsV0FBVztJQUU5QixJQUFJLENBQUNyQixJQUFJLEdBQUdBLElBQUk7SUFFaEIsSUFBSSxDQUFDd0IsY0FBYyxHQUFHQSxjQUFjO0lBQ3BDLElBQUksQ0FBQ0UsWUFBWSxHQUFHQSxZQUFZO0lBQ2hDLElBQUksQ0FBQ08sY0FBYyxHQUFHQSxjQUFjO0lBQ3BDLElBQUksQ0FBQ0QsUUFBUSxHQUFHQSxRQUFRO0lBQ3hCLElBQUksQ0FBQ0wsYUFBYSxHQUFHQSxhQUFhOztJQUVsQztBQUNKO0FBQ0E7SUFDSSxNQUFNWSxXQUFXLEdBQUdBLENBQUEsS0FBTTtNQUN4QixJQUFLLElBQUksQ0FBQ0MsVUFBVSxFQUFHO1FBQ3JCO01BQ0Y7TUFDQSxJQUFJLENBQUNELFdBQVcsQ0FBQyxDQUFDOztNQUVsQjtNQUNBLElBQUssQ0FBQ2xCLFdBQVcsRUFBRztRQUNsQixJQUFJLENBQUNvQixZQUFZLENBQUMsQ0FBQztNQUNyQjtJQUNGLENBQUM7SUFFRG5CLGdCQUFnQixDQUFDb0IsSUFBSSxDQUFFSCxXQUFZLENBQUM7O0lBRXBDO0FBQ0o7QUFDQTtJQUNJLE1BQU1JLGNBQWMsR0FBS0MsV0FBb0IsSUFBTTtNQUNqRCxJQUFJLENBQUNkLFFBQVEsR0FBR2MsV0FBVztJQUM3QixDQUFDO0lBQ0Q1QyxJQUFJLENBQUM2QyxtQkFBbUIsQ0FBQ0gsSUFBSSxDQUFFQyxjQUFlLENBQUM7O0lBRS9DO0lBQ0E7SUFDQSxNQUFNRyxpQkFBaUIsR0FBR0EsQ0FBRUMsU0FBaUIsRUFBRUMsU0FBb0MsS0FBTTtNQUN2RkEsU0FBUyxJQUFJQSxTQUFTLENBQUNDLGdCQUFnQixDQUFDQyxNQUFNLENBQUVYLFdBQVksQ0FBQztNQUM3RFEsU0FBUyxDQUFDRSxnQkFBZ0IsQ0FBQ1AsSUFBSSxDQUFFSCxXQUFZLENBQUM7SUFDaEQsQ0FBQztJQUNEdkMsSUFBSSxDQUFDbUQsbUJBQW1CLENBQUNULElBQUksQ0FBRUksaUJBQWtCLENBQUM7SUFDbEQ5QyxJQUFJLENBQUNvRCxpQkFBaUIsQ0FBQ1YsSUFBSSxDQUFFSSxpQkFBa0IsQ0FBQzs7SUFFaEQ7SUFDQSxJQUFJTyxZQUE0QixHQUFHLElBQUk7SUFDdkMsSUFBSUMsV0FBMkIsR0FBRyxJQUFJOztJQUV0QztJQUNBLElBQUlDLE9BQU8sR0FBRyxLQUFLO0lBRW5CLElBQUtuQyxVQUFVLEVBQUc7TUFFaEJvQyxNQUFNLElBQUlBLE1BQU0sQ0FBRW5DLFdBQVcsS0FBSyxJQUFLLENBQUM7O01BRXhDO01BQ0EsSUFBSSxDQUFDb0MsWUFBWSxHQUFHLElBQUlqRyx1QkFBdUIsQ0FBRTZELFdBQVcsRUFBRyxDQUM3RCxNQUFNckIsSUFBSSxDQUFDbUQsbUJBQW1CLENBQUNoRCxHQUFHLENBQUMsQ0FBQyxFQUNwQyxNQUFNSCxJQUFJLENBQUNvRCxpQkFBaUIsQ0FBQ2pELEdBQUcsQ0FBQyxDQUFDLENBQ25DLEVBQUU7UUFDRG9CLE1BQU0sRUFBRUEsTUFBTSxDQUFDbUMsWUFBWSxDQUFFLGNBQWUsQ0FBQztRQUM3Q0MsS0FBSyxFQUFJQyxLQUFtQixJQUFNO1VBQ2hDLElBQUs1RCxJQUFJLENBQUM2QyxtQkFBbUIsQ0FBQzFDLEdBQUcsQ0FBQyxDQUFDLEVBQUc7WUFFcEM7WUFDQWtCLFdBQVcsQ0FBRXdDLGVBQWUsQ0FBRUQsS0FBSyxDQUFDRSxPQUFPLENBQUNoRixLQUFLLEVBQUVrQixJQUFJLENBQUNtRCxtQkFBbUIsQ0FBQ2hELEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDNEQsY0FBZSxDQUFDO1lBQ3hHMUMsV0FBVyxDQUFFd0MsZUFBZSxDQUFFRCxLQUFLLENBQUNFLE9BQU8sQ0FBQ2hGLEtBQUssRUFBRWtCLElBQUksQ0FBQ29ELGlCQUFpQixDQUFDakQsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM0RCxjQUFlLENBQUM7WUFDdEdSLE9BQU8sR0FBRyxLQUFLO1lBQ2ZGLFlBQVksR0FBR08sS0FBSyxDQUFDRSxPQUFPLENBQUNoRixLQUFLLENBQUNrRixJQUFJLENBQUMsQ0FBQztZQUN6Q1YsV0FBVyxHQUFHTSxLQUFLLENBQUNFLE9BQU8sQ0FBQ2hGLEtBQUssQ0FBQ2tGLElBQUksQ0FBQyxDQUFDO1VBQzFDO1FBQ0YsQ0FBQztRQUNEQyxJQUFJLEVBQUlMLEtBQW1CLElBQU07VUFDL0IsSUFBSzVELElBQUksQ0FBQzZDLG1CQUFtQixDQUFDMUMsR0FBRyxDQUFDLENBQUMsRUFBRztZQUVwQ21ELFdBQVcsR0FBR00sS0FBSyxDQUFDRSxPQUFPLENBQUNoRixLQUFLLENBQUNrRixJQUFJLENBQUMsQ0FBQzs7WUFFeEM7WUFDQTNDLFdBQVcsQ0FBRTZDLFVBQVUsQ0FBRU4sS0FBSyxDQUFDRSxPQUFPLENBQUNoRixLQUFLLEVBQUVrQixJQUFJLENBQUNtRCxtQkFBbUIsQ0FBQ2hELEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBTSxDQUFDO1lBQ3JGa0IsV0FBVyxDQUFFNkMsVUFBVSxDQUFFTixLQUFLLENBQUNFLE9BQU8sQ0FBQ2hGLEtBQUssRUFBRWtCLElBQUksQ0FBQ29ELGlCQUFpQixDQUFDakQsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFNLENBQUM7WUFDbkZvRCxPQUFPLEdBQUcsSUFBSTtVQUNoQjtRQUNGLENBQUM7UUFDRFksR0FBRyxFQUFFQSxDQUFBLEtBQU07VUFDVCxJQUFJLENBQUNDLE9BQU8sQ0FBRSxJQUFJLEVBQUUsQ0FDbEJwRSxJQUFJLENBQUNtRCxtQkFBbUIsQ0FBQ2hELEdBQUcsQ0FBQyxDQUFDLEVBQzlCSCxJQUFJLENBQUNvRCxpQkFBaUIsQ0FBQ2pELEdBQUcsQ0FBQyxDQUFDLENBQzdCLEVBQUVpQixVQUFVLEVBQUVDLFdBQVcsRUFBR2dDLFlBQVksRUFBR0MsV0FBVyxFQUFHQyxPQUFRLENBQUM7UUFDckU7TUFDRixDQUFFLENBQUM7TUFDSCxJQUFJLENBQUNjLGdCQUFnQixDQUFFLElBQUksQ0FBQ1osWUFBYSxDQUFDO01BRTFDcEMsV0FBVyxDQUFFaUIsT0FBTyxDQUFDZ0MsaUJBQWlCLENBQUM1QixJQUFJLENBQUVILFdBQVksQ0FBQztJQUM1RCxDQUFDLE1BQ0k7TUFDSCxJQUFJLENBQUNrQixZQUFZLEdBQUcsSUFBSTtJQUMxQjs7SUFFQTtBQUNKO0FBQ0E7SUFDSSxNQUFNYyxVQUFVLEdBQUdBLENBQUEsS0FBTTtNQUV2QjtNQUNBLElBQUt2RSxJQUFJLENBQUM2QyxtQkFBbUIsQ0FBQzFDLEdBQUcsQ0FBQyxDQUFDLEVBQUc7UUFFcEM7UUFDQSxJQUFJLENBQUNvRSxVQUFVLENBQUMsQ0FBQztNQUNuQjtJQUNGLENBQUM7SUFDRHZFLElBQUksQ0FBQ3dFLGdCQUFnQixDQUFDQyxXQUFXLENBQUVGLFVBQVcsQ0FBQztJQUUvQyxJQUFJLENBQUNHLGVBQWUsR0FBRyxNQUFNO01BQzNCbEIsTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDQyxZQUFhLENBQUM7TUFDckMsSUFBSSxDQUFDQSxZQUFZLENBQUVrQixTQUFTLENBQUMsQ0FBQztNQUM5QixJQUFJLENBQUNsQixZQUFZLENBQUVtQixPQUFPLENBQUMsQ0FBQztNQUU1QjVFLElBQUksQ0FBQ21ELG1CQUFtQixDQUFDRCxNQUFNLENBQUVKLGlCQUFrQixDQUFDO01BQ3BEOUMsSUFBSSxDQUFDb0QsaUJBQWlCLENBQUNGLE1BQU0sQ0FBRUosaUJBQWtCLENBQUM7TUFFbER6QixXQUFXLElBQUlBLFdBQVcsQ0FBQ2lCLE9BQU8sQ0FBQ2dDLGlCQUFpQixDQUFDcEIsTUFBTSxDQUFFWCxXQUFZLENBQUM7TUFDMUV2QyxJQUFJLENBQUM2QyxtQkFBbUIsQ0FBQ0ssTUFBTSxDQUFFUCxjQUFlLENBQUM7TUFFakQzQyxJQUFJLENBQUNFLHFCQUFxQixDQUFDZ0QsTUFBTSxDQUFFWCxXQUFZLENBQUM7TUFDaER2QyxJQUFJLENBQUNLLG1CQUFtQixDQUFDNkMsTUFBTSxDQUFFWCxXQUFZLENBQUM7TUFFOUN2QyxJQUFJLENBQUN3RSxnQkFBZ0IsQ0FBQ0ssY0FBYyxDQUFFTixVQUFXLENBQUM7TUFFbERsRCxXQUFXLElBQUlBLFdBQVcsQ0FBQ2UsY0FBYyxDQUFDMEMsV0FBVyxDQUFFM0MsbUJBQW9CLENBQUM7TUFFNUViLGdCQUFnQixDQUFDNEIsTUFBTSxDQUFFWCxXQUFZLENBQUM7TUFFdEMsSUFBSSxDQUFDUCxRQUFRLENBQUM0QyxPQUFPLENBQUMsQ0FBQztNQUN2QixJQUFJLENBQUNqRCxhQUFhLENBQUNpRCxPQUFPLENBQUMsQ0FBQztNQUM1QixJQUFJLENBQUMzQyxjQUFjLENBQUMyQyxPQUFPLENBQUMsQ0FBQztNQUM3QnpDLG1CQUFtQixDQUFDeUMsT0FBTyxDQUFDLENBQUM7TUFDN0IsSUFBSSxDQUFDcEQsY0FBYyxDQUFDb0QsT0FBTyxDQUFDLENBQUM7TUFDN0IsSUFBSSxDQUFDbEQsWUFBWSxDQUFDa0QsT0FBTyxDQUFDLENBQUM7SUFDN0IsQ0FBQzs7SUFFRDtJQUNBLENBQUN2RCxXQUFXLElBQUksSUFBSSxDQUFDb0IsWUFBWSxDQUFDLENBQUM7RUFDckM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDU0EsWUFBWUEsQ0FBQSxFQUFTO0lBQzFCLE1BQU1zQyxJQUFJLEdBQUcsSUFBSSxDQUFDekQsZ0JBQWdCLENBQUMwRCxLQUFLO0lBQ3hDLElBQUtELElBQUksS0FBS3pILHNCQUFzQixDQUFDMkgsUUFBUSxFQUFHO01BRTlDO01BQ0EsTUFBTWhGLFVBQVUsR0FBRyxJQUFJLENBQUNELElBQUksQ0FBQ0UscUJBQXFCLENBQUNDLEdBQUcsQ0FBQyxDQUFDO01BQ3hELE1BQU1DLFFBQVEsR0FBRyxJQUFJLENBQUNKLElBQUksQ0FBQ0ssbUJBQW1CLENBQUNGLEdBQUcsQ0FBQyxDQUFDO01BQ3BELE1BQU0rRSxpQkFBaUIsR0FBRyxJQUFJdkksT0FBTyxDQUFFLEtBQUssRUFBRSxHQUFJLENBQUMsQ0FBQyxDQUFDO01BQ3JELE1BQU13SSxVQUFVLEdBQUcvRSxRQUFRLENBQUNnRixLQUFLLENBQUVuRixVQUFXLENBQUM7TUFDL0MsTUFBTW9GLEdBQUcsR0FBR0gsaUJBQWlCLENBQUNHLEdBQUcsQ0FBRUYsVUFBVyxDQUFDOztNQUUvQztNQUNBLE1BQU1HLGFBQWEsR0FBR0QsR0FBRyxHQUFHLENBQUMsR0FBRzlGLG9CQUFvQixHQUFHRCxrQkFBa0I7TUFDekUsTUFBTWlHLFFBQVEsR0FBR0YsR0FBRyxHQUFHLENBQUMsR0FBRzNGLDBCQUEwQixHQUFHRix3QkFBd0I7TUFDaEYsSUFBSSxDQUFDd0MsUUFBUSxDQUFDd0QsVUFBVSxDQUFFLENBQUUsQ0FBQyxLQUFLRixhQUFhLElBQUksSUFBSSxDQUFDdEQsUUFBUSxDQUFDeUQsV0FBVyxDQUFFLENBQUVILGFBQWEsQ0FBRyxDQUFDO01BQ2pHLElBQUksQ0FBQzVELFlBQVksQ0FBQzhELFVBQVUsQ0FBRSxDQUFFLENBQUMsS0FBS0QsUUFBUSxJQUFJLElBQUksQ0FBQzdELFlBQVksQ0FBQytELFdBQVcsQ0FBRSxDQUFFRixRQUFRLENBQUcsQ0FBQztNQUMvRixJQUFJLENBQUMvRCxjQUFjLENBQUNnRSxVQUFVLENBQUUsQ0FBRSxDQUFDLEtBQUtELFFBQVEsSUFBSSxJQUFJLENBQUMvRCxjQUFjLENBQUNpRSxXQUFXLENBQUUsQ0FBRUYsUUFBUSxDQUFHLENBQUM7TUFDbkcsSUFBSSxDQUFDL0QsY0FBYyxDQUFDTyxPQUFPLEdBQUcsSUFBSTtNQUNsQyxJQUFJLENBQUNMLFlBQVksQ0FBQ0ssT0FBTyxHQUFHLElBQUk7SUFDbEMsQ0FBQyxNQUNJO01BQ0QsSUFBSSxDQUFDQyxRQUFRLENBQUN3RCxVQUFVLENBQUUsQ0FBRSxDQUFDLEtBQUtwSCxvQkFBb0IsSUFBTSxJQUFJLENBQUM0RCxRQUFRLENBQUN5RCxXQUFXLENBQUUsQ0FBRXJILG9CQUFvQixFQUFFTixlQUFlLENBQUcsQ0FBQztNQUNwSSxJQUFJLENBQUMwRCxjQUFjLENBQUNPLE9BQU8sR0FBRyxLQUFLO01BQ25DLElBQUksQ0FBQ0wsWUFBWSxDQUFDSyxPQUFPLEdBQUcsS0FBSztJQUNuQztJQUVBLE1BQU0yRCxhQUFhLEdBQUcsSUFBSSxDQUFDM0IsY0FBYyxDQUFDN0QscUJBQXFCLENBQUNDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JFLE1BQU13RixXQUFXLEdBQUcsSUFBSSxDQUFDNUIsY0FBYyxDQUFDMUQsbUJBQW1CLENBQUNGLEdBQUcsQ0FBQyxDQUFDO0lBQ2pFLE1BQU15RixLQUFLLEdBQUdELFdBQVcsQ0FBQ1AsS0FBSyxDQUFFTSxhQUFjLENBQUM7O0lBRWhEO0lBQ0EsTUFBTUcsU0FBUyxHQUFHQyxJQUFJLENBQUNDLEdBQUcsQ0FBRUgsS0FBSyxDQUFDQyxTQUFTLEVBQUUsSUFBSyxDQUFDO0lBQ25ELE1BQU1HLEtBQUssR0FBR0osS0FBSyxDQUFDSSxLQUFLOztJQUV6QjtJQUNBLElBQUksQ0FBQ3RFLFlBQVksQ0FBQ3VFLFNBQVMsQ0FBRXJJLE1BQU0sQ0FBQ3NJLDZCQUE2QixDQUFFUCxXQUFXLEVBQUVLLEtBQU0sQ0FBRSxDQUFDOztJQUV6RjtJQUNBLElBQUksQ0FBQ3hFLGNBQWMsQ0FBQ3lFLFNBQVMsQ0FBRXJJLE1BQU0sQ0FBQ3NJLDZCQUE2QixDQUFFUixhQUFhLEVBQUVNLEtBQU0sQ0FBRSxDQUFDO0lBRTdGcEksTUFBTSxDQUFDdUksY0FBYyxDQUFFekosT0FBTyxDQUFDMEosT0FBTyxDQUFFUCxTQUFTLEdBQUdoSSxrQkFBa0IsRUFBRSxDQUFFLENBQUUsQ0FBQztJQUM3RSxJQUFJLENBQUNvRSxjQUFjLENBQUNnRSxTQUFTLENBQUVySSxNQUFPLENBQUM7SUFFdkMsSUFBSyxJQUFJLENBQUN5RCxXQUFXLEVBQUc7TUFDdEIsTUFBTWdGLHNCQUFzQixHQUFHLElBQUksQ0FBQ2hGLFdBQVcsQ0FBQ2lCLE9BQU8sQ0FBQ2dDLGlCQUFpQixDQUFDbkUsR0FBRyxDQUFDLENBQUM7TUFDL0UsTUFBTW1HLHNCQUFzQixHQUFHRCxzQkFBc0IsS0FBSyxJQUFJLENBQUNyRyxJQUFJO01BQ25FLElBQUksQ0FBQzJCLGFBQWEsQ0FBQ0ksT0FBTyxHQUFHdUUsc0JBQXNCO01BQ25ELElBQUtBLHNCQUFzQixFQUFHO1FBQzVCLElBQUksQ0FBQzNFLGFBQWEsQ0FBQzRFLEtBQUssR0FBR3hHLHdCQUF3QixDQUFFLElBQUksQ0FBQ0MsSUFBSyxDQUFDO01BQ2xFO0lBQ0Y7SUFDQSxJQUFJLENBQUN3RyxTQUFTLEdBQUc5RixZQUFZLENBQUUsSUFBSSxDQUFDVixJQUFLLENBQUM7SUFDMUMsSUFBSSxDQUFDeUcsU0FBUyxHQUFHLElBQUksQ0FBQ0QsU0FBUztFQUNqQztFQUVnQjVCLE9BQU9BLENBQUEsRUFBUztJQUM5QixJQUFJLENBQUNGLGVBQWUsQ0FBQyxDQUFDO0lBQ3RCLEtBQUssQ0FBQ0UsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBdkgsNEJBQTRCLENBQUNxSixRQUFRLENBQUUsVUFBVSxFQUFFekYsUUFBUyxDQUFDIn0=