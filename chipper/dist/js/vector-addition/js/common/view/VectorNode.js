// Copyright 2019-2023, University of Colorado Boulder

/**
 * View for the vectors that are dragged onto the graph. These vectors are created in VectorCreatorPanelSlot.js and
 * support tip dragging and tail translation dragging as well as removing and animating vector back to the creator.
 *
 * @author Martin Veillette
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Color, DragListener, Path, SceneryEvent } from '../../../../scenery/js/imports.js';
import vectorAddition from '../../vectorAddition.js';
import Graph from '../model/Graph.js';
import Vector from '../model/Vector.js';
import VectorAdditionConstants from '../VectorAdditionConstants.js';
import RootVectorNode from './RootVectorNode.js';
import VectorAngleNode from './VectorAngleNode.js';

// constants

// options for the vector shadow
const SHADOW_OPTIONS = merge({}, VectorAdditionConstants.VECTOR_ARROW_OPTIONS, {
  fill: Color.BLACK,
  opacity: 0.28
});

// offsets for vector shadow in view coordinates
const SHADOW_OFFSET_X = 3.2;
const SHADOW_OFFSET_Y = 2.1;
export default class VectorNode extends RootVectorNode {
  /**
   * @param {Vector} vector- the vector model
   * @param {Graph} graph - the graph the vector belongs to
   * @param {BooleanProperty} valuesVisibleProperty
   * @param {BooleanProperty} angleVisibleProperty
   * @param {Object} [options]
   */
  constructor(vector, graph, valuesVisibleProperty, angleVisibleProperty, options) {
    assert && assert(vector instanceof Vector, `invalid vector: ${vector}`);
    assert && assert(graph instanceof Graph, `invalid graph: ${graph}`);
    assert && assert(valuesVisibleProperty instanceof BooleanProperty, `invalid valuesVisibleProperty: ${valuesVisibleProperty}`);
    assert && assert(angleVisibleProperty instanceof BooleanProperty, `invalid angleVisibleProperty: ${angleVisibleProperty}`);
    assert && assert(!options || Object.getPrototypeOf(options) === Object.prototype, `Extra prototype on options: ${options}`);

    //----------------------------------------------------------------------------------------

    options = merge({
      arrowOptions: merge({}, VectorAdditionConstants.VECTOR_ARROW_OPTIONS, {
        cursor: 'move',
        fill: vector.vectorColorPalette.mainFill,
        stroke: vector.vectorColorPalette.mainStroke
      })
    }, options);
    super(vector, graph.modelViewTransformProperty, valuesVisibleProperty, graph.activeVectorProperty, options);

    // @private
    this.modelViewTransformProperty = graph.modelViewTransformProperty;
    this.vector = vector;

    //----------------------------------------------------------------------------------------
    // Create Nodes
    //----------------------------------------------------------------------------------------

    // Since the tail is (0, 0) for the view, the tip is the delta position of the tip
    const tipDeltaPosition = this.modelViewTransformProperty.value.modelToViewDelta(vector.vectorComponents);

    // Create a scenery node representing the arc of an angle and the numerical display of the angle.
    // dispose is necessary because it observes angleVisibleProperty.
    const angleNode = new VectorAngleNode(vector, angleVisibleProperty, graph.modelViewTransformProperty);

    // Create a shadow for the vector, visible when the vector is being dragged around off the graph.
    const vectorShadowNode = new ArrowNode(0, 0, tipDeltaPosition.x, tipDeltaPosition.y, SHADOW_OPTIONS);

    // Reconfigure scene graph z-layering
    this.setChildren([vectorShadowNode, this.arrowNode, angleNode, this.labelNode]);

    //----------------------------------------------------------------------------------------
    // Handle vector translation
    //----------------------------------------------------------------------------------------

    // Create a Property for the position of the tail of the vector. Used for the tail drag listener.
    const tailPositionProperty = new Vector2Property(this.modelViewTransformProperty.value.modelToViewPosition(vector.tail));

    // @private drag listener for translating the vector
    this.translationDragListener = new DragListener({
      pressCursor: options.arrowOptions.cursor,
      targetNode: this,
      positionProperty: tailPositionProperty,
      start: () => {
        assert && assert(!this.vector.animateBackProperty.value && !this.vector.inProgressAnimation, 'body drag listener should be removed when the vector is animating back.');
        if (vector.isOnGraphProperty.value) {
          graph.activeVectorProperty.value = vector;
        }
      },
      end: () => {
        assert && assert(!this.vector.animateBackProperty.value && !this.vector.inProgressAnimation, 'body drag listener should be removed when the vector is animating back.');

        // Determine whether to drop the vector on the graph, or animate the vector back to the toolbox.
        if (!this.vector.isOnGraphProperty.value) {
          // Get the cursor position as this determines whether the vector is destined for the graph or toolbox.
          // See https://github.com/phetsims/vector-addition/issues/50
          const cursorPosition = this.modelViewTransformProperty.value.viewToModelDelta(this.translationDragListener.localPoint).plus(this.vector.tail);

          // If the cursor is on the graph, drop the vector on the graph
          if (graph.graphModelBounds.containsPoint(cursorPosition)) {
            // Drop the vector where the shadow was positioned
            const shadowOffset = this.modelViewTransformProperty.value.viewToModelDelta(vectorShadowNode.center).minus(vector.vectorComponents.timesScalar(0.5));
            const shadowTailPosition = vector.tail.plus(shadowOffset);
            this.vector.dropOntoGraph(shadowTailPosition);
          } else {
            // otherwise, animate the vector back
            this.vector.animateBackProperty.value = true;
          }
        }
      }
    });

    // The body can be translated by the arrow or the label. removeInputListener is required on dispose.
    this.arrowNode.addInputListener(this.translationDragListener);
    this.labelNode.addInputListener(this.translationDragListener);

    // Translate when the vector's tail position changes. unlink is required on dispose.
    const tailListener = tailPositionView => {
      this.updateTailPosition(tailPositionView);
      if (vector.isRemovable) {
        const tailPositionModel = this.modelViewTransformProperty.value.viewToModelPosition(tailPositionView);
        const cursorPositionModel = this.modelViewTransformProperty.value.viewToModelDelta(this.translationDragListener.localPoint).plus(tailPositionModel);
        if (vector.isOnGraphProperty.value && !graph.graphModelBounds.containsPoint(cursorPositionModel)) {
          vector.popOffOfGraph();
        }
      }
    };
    tailPositionProperty.lazyLink(tailListener);

    // dispose of things related to vector translation
    const disposeTranslate = () => {
      this.arrowNode.removeInputListener(this.translationDragListener);
      this.labelNode.removeInputListener(this.translationDragListener);
      this.translationDragListener.dispose();
      tailPositionProperty.unlink(tailListener);
    };

    //----------------------------------------------------------------------------------------
    // Handle vector scaling & rotation
    //----------------------------------------------------------------------------------------

    let disposeScaleRotate = null;
    if (vector.isTipDraggable) {
      // To improve readability
      const headWidth = options.arrowOptions.headWidth;
      const headHeight = options.arrowOptions.headHeight;
      const headTouchAreaDilation = VectorAdditionConstants.VECTOR_HEAD_TOUCH_AREA_DILATION;
      const headMouseAreaDilation = VectorAdditionConstants.VECTOR_HEAD_MOUSE_AREA_DILATION;

      // Create an invisible triangle at the head of the vector.
      const headShape = new Shape().moveTo(0, 0).lineTo(-headHeight, -headWidth / 2).lineTo(-headHeight, headWidth / 2).close();
      const headNode = new Path(headShape, {
        stroke: phet.chipper.queryParameters.dev ? 'red' : null,
        cursor: 'pointer'
      });
      this.addChild(headNode);

      // Position of the tip of the vector, relative to the tail.
      const tipPositionProperty = new Vector2Property(tipDeltaPosition);

      // Drag listener to scale/rotate the vector, attached to the invisible head.
      const scaleRotateDragListener = new DragListener({
        targetNode: headNode,
        positionProperty: tipPositionProperty,
        start: () => {
          assert && assert(!this.vector.animateBackProperty.value && !this.vector.inProgressAnimation, 'tip drag listener should be removed when the vector is animating back.');
          graph.activeVectorProperty.value = vector;
        }
      });
      headNode.addInputListener(scaleRotateDragListener);

      // Move the tip to match the vector model. unlink is required on dispose.
      const tipListener = tipPosition => {
        this.updateTipPosition(tipPosition);
      };
      tipPositionProperty.lazyLink(tipListener);

      // Pointer area shapes for the head, in 3 different sizes.
      // A pair of these is used, based on the magnitude of the vector and whether its head is scale.
      // See below and https://github.com/phetsims/vector-addition/issues/240#issuecomment-544682818
      const largeMouseAreaShape = headShape.getOffsetShape(headMouseAreaDilation);
      const largeTouchAreaShape = headShape.getOffsetShape(headTouchAreaDilation);
      const mediumMouseAreaShape = createDilatedHead(headWidth, headHeight, headMouseAreaDilation);
      const mediumTouchAreaShape = createDilatedHead(headWidth, headHeight, headTouchAreaDilation);
      const SMALL_HEAD_SCALE = 0.65; // determined empirically
      const smallMouseAreaShape = createDilatedHead(headWidth, SMALL_HEAD_SCALE * headHeight, headMouseAreaDilation);
      const smallTouchAreaShape = createDilatedHead(headWidth, SMALL_HEAD_SCALE * headHeight, headTouchAreaDilation);

      // When the vector changes, transform the head and adjust its pointer areas. unlinked is required when disposed.
      const vectorComponentsListener = vectorComponents => {
        // Adjust pointer areas. See https://github.com/phetsims/vector-addition/issues/240#issuecomment-544682818
        const SHORT_MAGNITUDE = 3;
        if (vectorComponents.magnitude <= SHORT_MAGNITUDE) {
          // We have a 'short' vector, so adjust the head's pointer areas so that the tail can still be grabbed.
          const viewComponents = this.modelViewTransformProperty.value.modelToViewDelta(vector.vectorComponents);
          const viewMagnitude = viewComponents.magnitude;
          const maxHeadHeight = options.arrowOptions.fractionalHeadHeight * viewMagnitude;
          if (headHeight > maxHeadHeight) {
            // head is scaled (see ArrowNode fractionalHeadHeight), use small pointer areas
            headNode.mouseArea = smallMouseAreaShape;
            headNode.touchArea = smallTouchAreaShape;
          } else {
            // head is not scaled, use medium pointer areas
            headNode.mouseArea = mediumMouseAreaShape;
            headNode.touchArea = mediumTouchAreaShape;
          }
        } else {
          // We have a 'long' vector, so use the large pointer areas.
          headNode.mouseArea = largeMouseAreaShape;
          headNode.touchArea = largeTouchAreaShape;
        }

        // Transform the invisible head to match the position and angle of the actual vector.
        headNode.translation = this.modelViewTransformProperty.value.modelToViewDelta(vector.vectorComponents);
        headNode.rotation = -vectorComponents.angle;
      };
      vector.vectorComponentsProperty.link(vectorComponentsListener);

      // dispose of things that are related to optional scale/rotate
      disposeScaleRotate = () => {
        headNode.removeInputListener(scaleRotateDragListener);
        tipPositionProperty.unlink(tipListener);
        vector.vectorComponentsProperty.unlink(vectorComponentsListener);
      };
    }

    //----------------------------------------------------------------------------------------
    // Appearance
    //----------------------------------------------------------------------------------------

    // Update the appearance of the vector's shadow. Must be unmultilinked.
    const shadowMultilink = Multilink.multilink([vector.isOnGraphProperty, vector.vectorComponentsProperty, this.vector.animateBackProperty], (isOnGraph, vectorComponents, animateBack) => {
      vectorShadowNode.visible = !animateBack && !isOnGraph;
      vectorShadowNode.resetTransform();
      if (!isOnGraph && vectorShadowNode.getBounds().isValid()) {
        vectorShadowNode.left = this.arrowNode.left + SHADOW_OFFSET_X;
        vectorShadowNode.top = this.arrowNode.top + SHADOW_OFFSET_Y;
      }
      const tipDeltaPosition = this.modelViewTransformProperty.value.modelToViewDelta(vectorComponents);
      vectorShadowNode.setTip(tipDeltaPosition.x, tipDeltaPosition.y);
    });

    // Show the vector's label when it's on the graph. Must be unlinked.
    const isOnGraphListener = isOnGraph => this.labelNode.visible = isOnGraph;
    vector.isOnGraphProperty.link(isOnGraphListener);

    // Highlight the vector's label when it is selected. Must be unlinked.
    const activeVectorListener = activeVector => {
      this.labelNode.setHighlighted(activeVector === vector);
    };
    graph.activeVectorProperty.link(activeVectorListener);

    // Disable interaction when the vector is animating back to the toolbox, where it will be disposed.
    // unlink is required on dispose.
    const animateBackListener = animateBack => {
      if (animateBack) {
        this.interruptSubtreeInput();
        this.pickable = false;
        this.cursor = 'default';
      }
    };
    this.vector.animateBackProperty.lazyLink(animateBackListener);

    // @private
    this.disposeVectorNode = () => {
      // Dispose of nodes
      angleNode.dispose();

      // Dispose of transform handling
      disposeTranslate();
      disposeScaleRotate && disposeScaleRotate();

      // Dispose of appearance-related listeners
      Multilink.unmultilink(shadowMultilink);
      vector.isOnGraphProperty.unlink(isOnGraphListener);
      graph.activeVectorProperty.unlink(activeVectorListener);
      this.vector.animateBackProperty.unlink(animateBackListener);
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeVectorNode();
    super.dispose();
  }

  /**
   * Updates the vector model, which will then round the new position depending on the coordinate snap mode
   * @param {Vector2} tipPositionView - the drag listener position
   * @private
   */
  updateTipPosition(tipPositionView) {
    assert && assert(!this.vector.animateBackProperty.value && !this.vector.inProgressAnimation, 'Cannot drag tip when animating back');
    const tipPositionModel = this.vector.tail.plus(this.modelViewTransformProperty.value.viewToModelDelta(tipPositionView));
    this.vector.moveTipToPosition(tipPositionModel);
  }

  /**
   * Updates the model vector's tail position. Called when the vector is being translated.
   * @param {Vector2} tailPositionView
   * @private
   */
  updateTailPosition(tailPositionView) {
    assert && assert(!this.vector.animateBackProperty.value && !this.vector.inProgressAnimation, 'Cannot drag tail when animating back');
    const tailPositionModel = this.modelViewTransformProperty.value.viewToModelPosition(tailPositionView);

    // Allow translation to anywhere if it isn't on the graph
    if (this.vector.isOnGraphProperty.value === false) {
      this.vector.moveToTailPosition(tailPositionModel);
    } else {
      // Update the model tail position, subject to symmetric rounding, and fit inside the graph bounds
      this.vector.moveTailToPosition(tailPositionModel);
    }
  }

  /**
   * Forwards an event to translationDragListener. Used for dragging vectors out of the toolbox.
   * @param {SceneryEvent} event
   * @public
   */
  forwardEvent(event) {
    assert && assert(event instanceof SceneryEvent, 'invalid event');
    this.translationDragListener.press(event, this);
  }
}

/**
 * Creates a (rough) dilated shape for a vector head.  The head is pointing to the right.
 * @param {number} headWidth
 * @param {number} headHeight
 * @param {number} dilation
 * @returns {Shape}
 */
function createDilatedHead(headWidth, headHeight, dilation) {
  // Starting from the upper left and moving clockwise
  return new Shape().moveTo(-headHeight, -headHeight / 2 - dilation).lineTo(0, -dilation).lineTo(dilation, 0).lineTo(0, dilation).lineTo(-headHeight, headWidth / 2 + dilation).close();
}
vectorAddition.register('VectorNode', VectorNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJWZWN0b3IyUHJvcGVydHkiLCJTaGFwZSIsIm1lcmdlIiwiQXJyb3dOb2RlIiwiQ29sb3IiLCJEcmFnTGlzdGVuZXIiLCJQYXRoIiwiU2NlbmVyeUV2ZW50IiwidmVjdG9yQWRkaXRpb24iLCJHcmFwaCIsIlZlY3RvciIsIlZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIiwiUm9vdFZlY3Rvck5vZGUiLCJWZWN0b3JBbmdsZU5vZGUiLCJTSEFET1dfT1BUSU9OUyIsIlZFQ1RPUl9BUlJPV19PUFRJT05TIiwiZmlsbCIsIkJMQUNLIiwib3BhY2l0eSIsIlNIQURPV19PRkZTRVRfWCIsIlNIQURPV19PRkZTRVRfWSIsIlZlY3Rvck5vZGUiLCJjb25zdHJ1Y3RvciIsInZlY3RvciIsImdyYXBoIiwidmFsdWVzVmlzaWJsZVByb3BlcnR5IiwiYW5nbGVWaXNpYmxlUHJvcGVydHkiLCJvcHRpb25zIiwiYXNzZXJ0IiwiT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJwcm90b3R5cGUiLCJhcnJvd09wdGlvbnMiLCJjdXJzb3IiLCJ2ZWN0b3JDb2xvclBhbGV0dGUiLCJtYWluRmlsbCIsInN0cm9rZSIsIm1haW5TdHJva2UiLCJtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSIsImFjdGl2ZVZlY3RvclByb3BlcnR5IiwidGlwRGVsdGFQb3NpdGlvbiIsInZhbHVlIiwibW9kZWxUb1ZpZXdEZWx0YSIsInZlY3RvckNvbXBvbmVudHMiLCJhbmdsZU5vZGUiLCJ2ZWN0b3JTaGFkb3dOb2RlIiwieCIsInkiLCJzZXRDaGlsZHJlbiIsImFycm93Tm9kZSIsImxhYmVsTm9kZSIsInRhaWxQb3NpdGlvblByb3BlcnR5IiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsInRhaWwiLCJ0cmFuc2xhdGlvbkRyYWdMaXN0ZW5lciIsInByZXNzQ3Vyc29yIiwidGFyZ2V0Tm9kZSIsInBvc2l0aW9uUHJvcGVydHkiLCJzdGFydCIsImFuaW1hdGVCYWNrUHJvcGVydHkiLCJpblByb2dyZXNzQW5pbWF0aW9uIiwiaXNPbkdyYXBoUHJvcGVydHkiLCJlbmQiLCJjdXJzb3JQb3NpdGlvbiIsInZpZXdUb01vZGVsRGVsdGEiLCJsb2NhbFBvaW50IiwicGx1cyIsImdyYXBoTW9kZWxCb3VuZHMiLCJjb250YWluc1BvaW50Iiwic2hhZG93T2Zmc2V0IiwiY2VudGVyIiwibWludXMiLCJ0aW1lc1NjYWxhciIsInNoYWRvd1RhaWxQb3NpdGlvbiIsImRyb3BPbnRvR3JhcGgiLCJhZGRJbnB1dExpc3RlbmVyIiwidGFpbExpc3RlbmVyIiwidGFpbFBvc2l0aW9uVmlldyIsInVwZGF0ZVRhaWxQb3NpdGlvbiIsImlzUmVtb3ZhYmxlIiwidGFpbFBvc2l0aW9uTW9kZWwiLCJ2aWV3VG9Nb2RlbFBvc2l0aW9uIiwiY3Vyc29yUG9zaXRpb25Nb2RlbCIsInBvcE9mZk9mR3JhcGgiLCJsYXp5TGluayIsImRpc3Bvc2VUcmFuc2xhdGUiLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwiZGlzcG9zZSIsInVubGluayIsImRpc3Bvc2VTY2FsZVJvdGF0ZSIsImlzVGlwRHJhZ2dhYmxlIiwiaGVhZFdpZHRoIiwiaGVhZEhlaWdodCIsImhlYWRUb3VjaEFyZWFEaWxhdGlvbiIsIlZFQ1RPUl9IRUFEX1RPVUNIX0FSRUFfRElMQVRJT04iLCJoZWFkTW91c2VBcmVhRGlsYXRpb24iLCJWRUNUT1JfSEVBRF9NT1VTRV9BUkVBX0RJTEFUSU9OIiwiaGVhZFNoYXBlIiwibW92ZVRvIiwibGluZVRvIiwiY2xvc2UiLCJoZWFkTm9kZSIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiZGV2IiwiYWRkQ2hpbGQiLCJ0aXBQb3NpdGlvblByb3BlcnR5Iiwic2NhbGVSb3RhdGVEcmFnTGlzdGVuZXIiLCJ0aXBMaXN0ZW5lciIsInRpcFBvc2l0aW9uIiwidXBkYXRlVGlwUG9zaXRpb24iLCJsYXJnZU1vdXNlQXJlYVNoYXBlIiwiZ2V0T2Zmc2V0U2hhcGUiLCJsYXJnZVRvdWNoQXJlYVNoYXBlIiwibWVkaXVtTW91c2VBcmVhU2hhcGUiLCJjcmVhdGVEaWxhdGVkSGVhZCIsIm1lZGl1bVRvdWNoQXJlYVNoYXBlIiwiU01BTExfSEVBRF9TQ0FMRSIsInNtYWxsTW91c2VBcmVhU2hhcGUiLCJzbWFsbFRvdWNoQXJlYVNoYXBlIiwidmVjdG9yQ29tcG9uZW50c0xpc3RlbmVyIiwiU0hPUlRfTUFHTklUVURFIiwibWFnbml0dWRlIiwidmlld0NvbXBvbmVudHMiLCJ2aWV3TWFnbml0dWRlIiwibWF4SGVhZEhlaWdodCIsImZyYWN0aW9uYWxIZWFkSGVpZ2h0IiwibW91c2VBcmVhIiwidG91Y2hBcmVhIiwidHJhbnNsYXRpb24iLCJyb3RhdGlvbiIsImFuZ2xlIiwidmVjdG9yQ29tcG9uZW50c1Byb3BlcnR5IiwibGluayIsInNoYWRvd011bHRpbGluayIsIm11bHRpbGluayIsImlzT25HcmFwaCIsImFuaW1hdGVCYWNrIiwidmlzaWJsZSIsInJlc2V0VHJhbnNmb3JtIiwiZ2V0Qm91bmRzIiwiaXNWYWxpZCIsImxlZnQiLCJ0b3AiLCJzZXRUaXAiLCJpc09uR3JhcGhMaXN0ZW5lciIsImFjdGl2ZVZlY3Rvckxpc3RlbmVyIiwiYWN0aXZlVmVjdG9yIiwic2V0SGlnaGxpZ2h0ZWQiLCJhbmltYXRlQmFja0xpc3RlbmVyIiwiaW50ZXJydXB0U3VidHJlZUlucHV0IiwicGlja2FibGUiLCJkaXNwb3NlVmVjdG9yTm9kZSIsInVubXVsdGlsaW5rIiwidGlwUG9zaXRpb25WaWV3IiwidGlwUG9zaXRpb25Nb2RlbCIsIm1vdmVUaXBUb1Bvc2l0aW9uIiwibW92ZVRvVGFpbFBvc2l0aW9uIiwibW92ZVRhaWxUb1Bvc2l0aW9uIiwiZm9yd2FyZEV2ZW50IiwiZXZlbnQiLCJwcmVzcyIsImRpbGF0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJWZWN0b3JOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZpZXcgZm9yIHRoZSB2ZWN0b3JzIHRoYXQgYXJlIGRyYWdnZWQgb250byB0aGUgZ3JhcGguIFRoZXNlIHZlY3RvcnMgYXJlIGNyZWF0ZWQgaW4gVmVjdG9yQ3JlYXRvclBhbmVsU2xvdC5qcyBhbmRcclxuICogc3VwcG9ydCB0aXAgZHJhZ2dpbmcgYW5kIHRhaWwgdHJhbnNsYXRpb24gZHJhZ2dpbmcgYXMgd2VsbCBhcyByZW1vdmluZyBhbmQgYW5pbWF0aW5nIHZlY3RvciBiYWNrIHRvIHRoZSBjcmVhdG9yLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBWZWN0b3IyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBEcmFnTGlzdGVuZXIsIFBhdGgsIFNjZW5lcnlFdmVudCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB2ZWN0b3JBZGRpdGlvbiBmcm9tICcuLi8uLi92ZWN0b3JBZGRpdGlvbi5qcyc7XHJcbmltcG9ydCBHcmFwaCBmcm9tICcuLi9tb2RlbC9HcmFwaC5qcyc7XHJcbmltcG9ydCBWZWN0b3IgZnJvbSAnLi4vbW9kZWwvVmVjdG9yLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIGZyb20gJy4uL1ZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFJvb3RWZWN0b3JOb2RlIGZyb20gJy4vUm9vdFZlY3Rvck5vZGUuanMnO1xyXG5pbXBvcnQgVmVjdG9yQW5nbGVOb2RlIGZyb20gJy4vVmVjdG9yQW5nbGVOb2RlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5cclxuLy8gb3B0aW9ucyBmb3IgdGhlIHZlY3RvciBzaGFkb3dcclxuY29uc3QgU0hBRE9XX09QVElPTlMgPSBtZXJnZSgge30sIFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlZFQ1RPUl9BUlJPV19PUFRJT05TLCB7XHJcbiAgZmlsbDogQ29sb3IuQkxBQ0ssXHJcbiAgb3BhY2l0eTogMC4yOFxyXG59ICk7XHJcblxyXG4vLyBvZmZzZXRzIGZvciB2ZWN0b3Igc2hhZG93IGluIHZpZXcgY29vcmRpbmF0ZXNcclxuY29uc3QgU0hBRE9XX09GRlNFVF9YID0gMy4yO1xyXG5jb25zdCBTSEFET1dfT0ZGU0VUX1kgPSAyLjE7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZWN0b3JOb2RlIGV4dGVuZHMgUm9vdFZlY3Rvck5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1ZlY3Rvcn0gdmVjdG9yLSB0aGUgdmVjdG9yIG1vZGVsXHJcbiAgICogQHBhcmFtIHtHcmFwaH0gZ3JhcGggLSB0aGUgZ3JhcGggdGhlIHZlY3RvciBiZWxvbmdzIHRvXHJcbiAgICogQHBhcmFtIHtCb29sZWFuUHJvcGVydHl9IHZhbHVlc1Zpc2libGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhblByb3BlcnR5fSBhbmdsZVZpc2libGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdmVjdG9yLCBncmFwaCwgdmFsdWVzVmlzaWJsZVByb3BlcnR5LCBhbmdsZVZpc2libGVQcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZWN0b3IgaW5zdGFuY2VvZiBWZWN0b3IsIGBpbnZhbGlkIHZlY3RvcjogJHt2ZWN0b3J9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZ3JhcGggaW5zdGFuY2VvZiBHcmFwaCwgYGludmFsaWQgZ3JhcGg6ICR7Z3JhcGh9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmFsdWVzVmlzaWJsZVByb3BlcnR5IGluc3RhbmNlb2YgQm9vbGVhblByb3BlcnR5LCBgaW52YWxpZCB2YWx1ZXNWaXNpYmxlUHJvcGVydHk6ICR7dmFsdWVzVmlzaWJsZVByb3BlcnR5fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFuZ2xlVmlzaWJsZVByb3BlcnR5IGluc3RhbmNlb2YgQm9vbGVhblByb3BlcnR5LCBgaW52YWxpZCBhbmdsZVZpc2libGVQcm9wZXJ0eTogJHthbmdsZVZpc2libGVQcm9wZXJ0eX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIG9wdGlvbnMgKSA9PT0gT2JqZWN0LnByb3RvdHlwZSwgYEV4dHJhIHByb3RvdHlwZSBvbiBvcHRpb25zOiAke29wdGlvbnN9YCApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBhcnJvd09wdGlvbnM6IG1lcmdlKCB7fSwgVmVjdG9yQWRkaXRpb25Db25zdGFudHMuVkVDVE9SX0FSUk9XX09QVElPTlMsIHtcclxuICAgICAgICBjdXJzb3I6ICdtb3ZlJyxcclxuICAgICAgICBmaWxsOiB2ZWN0b3IudmVjdG9yQ29sb3JQYWxldHRlLm1haW5GaWxsLFxyXG4gICAgICAgIHN0cm9rZTogdmVjdG9yLnZlY3RvckNvbG9yUGFsZXR0ZS5tYWluU3Ryb2tlXHJcbiAgICAgIH0gKVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCB2ZWN0b3IsXHJcbiAgICAgIGdyYXBoLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LFxyXG4gICAgICB2YWx1ZXNWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIGdyYXBoLmFjdGl2ZVZlY3RvclByb3BlcnR5LFxyXG4gICAgICBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkgPSBncmFwaC5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eTtcclxuICAgIHRoaXMudmVjdG9yID0gdmVjdG9yO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gQ3JlYXRlIE5vZGVzXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBTaW5jZSB0aGUgdGFpbCBpcyAoMCwgMCkgZm9yIHRoZSB2aWV3LCB0aGUgdGlwIGlzIHRoZSBkZWx0YSBwb3NpdGlvbiBvZiB0aGUgdGlwXHJcbiAgICBjb25zdCB0aXBEZWx0YVBvc2l0aW9uID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZS5tb2RlbFRvVmlld0RlbHRhKCB2ZWN0b3IudmVjdG9yQ29tcG9uZW50cyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIHNjZW5lcnkgbm9kZSByZXByZXNlbnRpbmcgdGhlIGFyYyBvZiBhbiBhbmdsZSBhbmQgdGhlIG51bWVyaWNhbCBkaXNwbGF5IG9mIHRoZSBhbmdsZS5cclxuICAgIC8vIGRpc3Bvc2UgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgaXQgb2JzZXJ2ZXMgYW5nbGVWaXNpYmxlUHJvcGVydHkuXHJcbiAgICBjb25zdCBhbmdsZU5vZGUgPSBuZXcgVmVjdG9yQW5nbGVOb2RlKCB2ZWN0b3IsIGFuZ2xlVmlzaWJsZVByb3BlcnR5LCBncmFwaC5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIHNoYWRvdyBmb3IgdGhlIHZlY3RvciwgdmlzaWJsZSB3aGVuIHRoZSB2ZWN0b3IgaXMgYmVpbmcgZHJhZ2dlZCBhcm91bmQgb2ZmIHRoZSBncmFwaC5cclxuICAgIGNvbnN0IHZlY3RvclNoYWRvd05vZGUgPSBuZXcgQXJyb3dOb2RlKCAwLCAwLCB0aXBEZWx0YVBvc2l0aW9uLngsIHRpcERlbHRhUG9zaXRpb24ueSwgU0hBRE9XX09QVElPTlMgKTtcclxuXHJcbiAgICAvLyBSZWNvbmZpZ3VyZSBzY2VuZSBncmFwaCB6LWxheWVyaW5nXHJcbiAgICB0aGlzLnNldENoaWxkcmVuKCBbIHZlY3RvclNoYWRvd05vZGUsIHRoaXMuYXJyb3dOb2RlLCBhbmdsZU5vZGUsIHRoaXMubGFiZWxOb2RlIF0gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIEhhbmRsZSB2ZWN0b3IgdHJhbnNsYXRpb25cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIENyZWF0ZSBhIFByb3BlcnR5IGZvciB0aGUgcG9zaXRpb24gb2YgdGhlIHRhaWwgb2YgdGhlIHZlY3Rvci4gVXNlZCBmb3IgdGhlIHRhaWwgZHJhZyBsaXN0ZW5lci5cclxuICAgIGNvbnN0IHRhaWxQb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZS5tb2RlbFRvVmlld1Bvc2l0aW9uKFxyXG4gICAgICB2ZWN0b3IudGFpbCApICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgZHJhZyBsaXN0ZW5lciBmb3IgdHJhbnNsYXRpbmcgdGhlIHZlY3RvclxyXG4gICAgdGhpcy50cmFuc2xhdGlvbkRyYWdMaXN0ZW5lciA9IG5ldyBEcmFnTGlzdGVuZXIoIHtcclxuICAgICAgcHJlc3NDdXJzb3I6IG9wdGlvbnMuYXJyb3dPcHRpb25zLmN1cnNvcixcclxuICAgICAgdGFyZ2V0Tm9kZTogdGhpcyxcclxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogdGFpbFBvc2l0aW9uUHJvcGVydHksXHJcblxyXG4gICAgICBzdGFydDogKCkgPT4ge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLnZlY3Rvci5hbmltYXRlQmFja1Byb3BlcnR5LnZhbHVlICYmICF0aGlzLnZlY3Rvci5pblByb2dyZXNzQW5pbWF0aW9uLFxyXG4gICAgICAgICAgJ2JvZHkgZHJhZyBsaXN0ZW5lciBzaG91bGQgYmUgcmVtb3ZlZCB3aGVuIHRoZSB2ZWN0b3IgaXMgYW5pbWF0aW5nIGJhY2suJyApO1xyXG4gICAgICAgIGlmICggdmVjdG9yLmlzT25HcmFwaFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgZ3JhcGguYWN0aXZlVmVjdG9yUHJvcGVydHkudmFsdWUgPSB2ZWN0b3I7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgZW5kOiAoKSA9PiB7XHJcblxyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLnZlY3Rvci5hbmltYXRlQmFja1Byb3BlcnR5LnZhbHVlICYmICF0aGlzLnZlY3Rvci5pblByb2dyZXNzQW5pbWF0aW9uLFxyXG4gICAgICAgICAgJ2JvZHkgZHJhZyBsaXN0ZW5lciBzaG91bGQgYmUgcmVtb3ZlZCB3aGVuIHRoZSB2ZWN0b3IgaXMgYW5pbWF0aW5nIGJhY2suJyApO1xyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB0byBkcm9wIHRoZSB2ZWN0b3Igb24gdGhlIGdyYXBoLCBvciBhbmltYXRlIHRoZSB2ZWN0b3IgYmFjayB0byB0aGUgdG9vbGJveC5cclxuICAgICAgICBpZiAoICF0aGlzLnZlY3Rvci5pc09uR3JhcGhQcm9wZXJ0eS52YWx1ZSApIHtcclxuXHJcbiAgICAgICAgICAvLyBHZXQgdGhlIGN1cnNvciBwb3NpdGlvbiBhcyB0aGlzIGRldGVybWluZXMgd2hldGhlciB0aGUgdmVjdG9yIGlzIGRlc3RpbmVkIGZvciB0aGUgZ3JhcGggb3IgdG9vbGJveC5cclxuICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdmVjdG9yLWFkZGl0aW9uL2lzc3Vlcy81MFxyXG4gICAgICAgICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LnZhbHVlXHJcbiAgICAgICAgICAgIC52aWV3VG9Nb2RlbERlbHRhKCB0aGlzLnRyYW5zbGF0aW9uRHJhZ0xpc3RlbmVyLmxvY2FsUG9pbnQgKS5wbHVzKCB0aGlzLnZlY3Rvci50YWlsICk7XHJcblxyXG4gICAgICAgICAgLy8gSWYgdGhlIGN1cnNvciBpcyBvbiB0aGUgZ3JhcGgsIGRyb3AgdGhlIHZlY3RvciBvbiB0aGUgZ3JhcGhcclxuICAgICAgICAgIGlmICggZ3JhcGguZ3JhcGhNb2RlbEJvdW5kcy5jb250YWluc1BvaW50KCBjdXJzb3JQb3NpdGlvbiApICkge1xyXG5cclxuICAgICAgICAgICAgLy8gRHJvcCB0aGUgdmVjdG9yIHdoZXJlIHRoZSBzaGFkb3cgd2FzIHBvc2l0aW9uZWRcclxuICAgICAgICAgICAgY29uc3Qgc2hhZG93T2Zmc2V0ID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZS52aWV3VG9Nb2RlbERlbHRhKCB2ZWN0b3JTaGFkb3dOb2RlLmNlbnRlciApXHJcbiAgICAgICAgICAgICAgLm1pbnVzKCB2ZWN0b3IudmVjdG9yQ29tcG9uZW50cy50aW1lc1NjYWxhciggMC41ICkgKTtcclxuICAgICAgICAgICAgY29uc3Qgc2hhZG93VGFpbFBvc2l0aW9uID0gdmVjdG9yLnRhaWwucGx1cyggc2hhZG93T2Zmc2V0ICk7XHJcbiAgICAgICAgICAgIHRoaXMudmVjdG9yLmRyb3BPbnRvR3JhcGgoIHNoYWRvd1RhaWxQb3NpdGlvbiApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGFuaW1hdGUgdGhlIHZlY3RvciBiYWNrXHJcbiAgICAgICAgICAgIHRoaXMudmVjdG9yLmFuaW1hdGVCYWNrUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRoZSBib2R5IGNhbiBiZSB0cmFuc2xhdGVkIGJ5IHRoZSBhcnJvdyBvciB0aGUgbGFiZWwuIHJlbW92ZUlucHV0TGlzdGVuZXIgaXMgcmVxdWlyZWQgb24gZGlzcG9zZS5cclxuICAgIHRoaXMuYXJyb3dOb2RlLmFkZElucHV0TGlzdGVuZXIoIHRoaXMudHJhbnNsYXRpb25EcmFnTGlzdGVuZXIgKTtcclxuICAgIHRoaXMubGFiZWxOb2RlLmFkZElucHV0TGlzdGVuZXIoIHRoaXMudHJhbnNsYXRpb25EcmFnTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBUcmFuc2xhdGUgd2hlbiB0aGUgdmVjdG9yJ3MgdGFpbCBwb3NpdGlvbiBjaGFuZ2VzLiB1bmxpbmsgaXMgcmVxdWlyZWQgb24gZGlzcG9zZS5cclxuICAgIGNvbnN0IHRhaWxMaXN0ZW5lciA9IHRhaWxQb3NpdGlvblZpZXcgPT4ge1xyXG4gICAgICB0aGlzLnVwZGF0ZVRhaWxQb3NpdGlvbiggdGFpbFBvc2l0aW9uVmlldyApO1xyXG4gICAgICBpZiAoIHZlY3Rvci5pc1JlbW92YWJsZSApIHtcclxuICAgICAgICBjb25zdCB0YWlsUG9zaXRpb25Nb2RlbCA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkudmFsdWUudmlld1RvTW9kZWxQb3NpdGlvbiggdGFpbFBvc2l0aW9uVmlldyApO1xyXG5cclxuICAgICAgICBjb25zdCBjdXJzb3JQb3NpdGlvbk1vZGVsID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZVxyXG4gICAgICAgICAgLnZpZXdUb01vZGVsRGVsdGEoIHRoaXMudHJhbnNsYXRpb25EcmFnTGlzdGVuZXIubG9jYWxQb2ludCApLnBsdXMoIHRhaWxQb3NpdGlvbk1vZGVsICk7XHJcblxyXG4gICAgICAgIGlmICggdmVjdG9yLmlzT25HcmFwaFByb3BlcnR5LnZhbHVlICYmICFncmFwaC5ncmFwaE1vZGVsQm91bmRzLmNvbnRhaW5zUG9pbnQoIGN1cnNvclBvc2l0aW9uTW9kZWwgKSApIHtcclxuICAgICAgICAgIHZlY3Rvci5wb3BPZmZPZkdyYXBoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGFpbFBvc2l0aW9uUHJvcGVydHkubGF6eUxpbmsoIHRhaWxMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIGRpc3Bvc2Ugb2YgdGhpbmdzIHJlbGF0ZWQgdG8gdmVjdG9yIHRyYW5zbGF0aW9uXHJcbiAgICBjb25zdCBkaXNwb3NlVHJhbnNsYXRlID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLmFycm93Tm9kZS5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLnRyYW5zbGF0aW9uRHJhZ0xpc3RlbmVyICk7XHJcbiAgICAgIHRoaXMubGFiZWxOb2RlLnJlbW92ZUlucHV0TGlzdGVuZXIoIHRoaXMudHJhbnNsYXRpb25EcmFnTGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy50cmFuc2xhdGlvbkRyYWdMaXN0ZW5lci5kaXNwb3NlKCk7XHJcbiAgICAgIHRhaWxQb3NpdGlvblByb3BlcnR5LnVubGluayggdGFpbExpc3RlbmVyICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gSGFuZGxlIHZlY3RvciBzY2FsaW5nICYgcm90YXRpb25cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGxldCBkaXNwb3NlU2NhbGVSb3RhdGUgPSBudWxsO1xyXG4gICAgaWYgKCB2ZWN0b3IuaXNUaXBEcmFnZ2FibGUgKSB7XHJcblxyXG4gICAgICAvLyBUbyBpbXByb3ZlIHJlYWRhYmlsaXR5XHJcbiAgICAgIGNvbnN0IGhlYWRXaWR0aCA9IG9wdGlvbnMuYXJyb3dPcHRpb25zLmhlYWRXaWR0aDtcclxuICAgICAgY29uc3QgaGVhZEhlaWdodCA9IG9wdGlvbnMuYXJyb3dPcHRpb25zLmhlYWRIZWlnaHQ7XHJcbiAgICAgIGNvbnN0IGhlYWRUb3VjaEFyZWFEaWxhdGlvbiA9IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlZFQ1RPUl9IRUFEX1RPVUNIX0FSRUFfRElMQVRJT047XHJcbiAgICAgIGNvbnN0IGhlYWRNb3VzZUFyZWFEaWxhdGlvbiA9IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlZFQ1RPUl9IRUFEX01PVVNFX0FSRUFfRElMQVRJT047XHJcblxyXG4gICAgICAvLyBDcmVhdGUgYW4gaW52aXNpYmxlIHRyaWFuZ2xlIGF0IHRoZSBoZWFkIG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgIGNvbnN0IGhlYWRTaGFwZSA9IG5ldyBTaGFwZSgpXHJcbiAgICAgICAgLm1vdmVUbyggMCwgMCApXHJcbiAgICAgICAgLmxpbmVUbyggLWhlYWRIZWlnaHQsIC1oZWFkV2lkdGggLyAyIClcclxuICAgICAgICAubGluZVRvKCAtaGVhZEhlaWdodCwgaGVhZFdpZHRoIC8gMiApXHJcbiAgICAgICAgLmNsb3NlKCk7XHJcbiAgICAgIGNvbnN0IGhlYWROb2RlID0gbmV3IFBhdGgoIGhlYWRTaGFwZSwge1xyXG4gICAgICAgIHN0cm9rZTogcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5kZXYgPyAncmVkJyA6IG51bGwsXHJcbiAgICAgICAgY3Vyc29yOiAncG9pbnRlcidcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBoZWFkTm9kZSApO1xyXG5cclxuICAgICAgLy8gUG9zaXRpb24gb2YgdGhlIHRpcCBvZiB0aGUgdmVjdG9yLCByZWxhdGl2ZSB0byB0aGUgdGFpbC5cclxuICAgICAgY29uc3QgdGlwUG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIHRpcERlbHRhUG9zaXRpb24gKTtcclxuXHJcbiAgICAgIC8vIERyYWcgbGlzdGVuZXIgdG8gc2NhbGUvcm90YXRlIHRoZSB2ZWN0b3IsIGF0dGFjaGVkIHRvIHRoZSBpbnZpc2libGUgaGVhZC5cclxuICAgICAgY29uc3Qgc2NhbGVSb3RhdGVEcmFnTGlzdGVuZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgICAgdGFyZ2V0Tm9kZTogaGVhZE5vZGUsXHJcbiAgICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogdGlwUG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgICBzdGFydDogKCkgPT4ge1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMudmVjdG9yLmFuaW1hdGVCYWNrUHJvcGVydHkudmFsdWUgJiYgIXRoaXMudmVjdG9yLmluUHJvZ3Jlc3NBbmltYXRpb24sXHJcbiAgICAgICAgICAgICd0aXAgZHJhZyBsaXN0ZW5lciBzaG91bGQgYmUgcmVtb3ZlZCB3aGVuIHRoZSB2ZWN0b3IgaXMgYW5pbWF0aW5nIGJhY2suJyApO1xyXG4gICAgICAgICAgZ3JhcGguYWN0aXZlVmVjdG9yUHJvcGVydHkudmFsdWUgPSB2ZWN0b3I7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICAgIGhlYWROb2RlLmFkZElucHV0TGlzdGVuZXIoIHNjYWxlUm90YXRlRHJhZ0xpc3RlbmVyICk7XHJcblxyXG4gICAgICAvLyBNb3ZlIHRoZSB0aXAgdG8gbWF0Y2ggdGhlIHZlY3RvciBtb2RlbC4gdW5saW5rIGlzIHJlcXVpcmVkIG9uIGRpc3Bvc2UuXHJcbiAgICAgIGNvbnN0IHRpcExpc3RlbmVyID0gdGlwUG9zaXRpb24gPT4ge1xyXG4gICAgICAgIHRoaXMudXBkYXRlVGlwUG9zaXRpb24oIHRpcFBvc2l0aW9uICk7XHJcbiAgICAgIH07XHJcbiAgICAgIHRpcFBvc2l0aW9uUHJvcGVydHkubGF6eUxpbmsoIHRpcExpc3RlbmVyICk7XHJcblxyXG4gICAgICAvLyBQb2ludGVyIGFyZWEgc2hhcGVzIGZvciB0aGUgaGVhZCwgaW4gMyBkaWZmZXJlbnQgc2l6ZXMuXHJcbiAgICAgIC8vIEEgcGFpciBvZiB0aGVzZSBpcyB1c2VkLCBiYXNlZCBvbiB0aGUgbWFnbml0dWRlIG9mIHRoZSB2ZWN0b3IgYW5kIHdoZXRoZXIgaXRzIGhlYWQgaXMgc2NhbGUuXHJcbiAgICAgIC8vIFNlZSBiZWxvdyBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlY3Rvci1hZGRpdGlvbi9pc3N1ZXMvMjQwI2lzc3VlY29tbWVudC01NDQ2ODI4MThcclxuICAgICAgY29uc3QgbGFyZ2VNb3VzZUFyZWFTaGFwZSA9IGhlYWRTaGFwZS5nZXRPZmZzZXRTaGFwZSggaGVhZE1vdXNlQXJlYURpbGF0aW9uICk7XHJcbiAgICAgIGNvbnN0IGxhcmdlVG91Y2hBcmVhU2hhcGUgPSBoZWFkU2hhcGUuZ2V0T2Zmc2V0U2hhcGUoIGhlYWRUb3VjaEFyZWFEaWxhdGlvbiApO1xyXG4gICAgICBjb25zdCBtZWRpdW1Nb3VzZUFyZWFTaGFwZSA9IGNyZWF0ZURpbGF0ZWRIZWFkKCBoZWFkV2lkdGgsIGhlYWRIZWlnaHQsIGhlYWRNb3VzZUFyZWFEaWxhdGlvbiApO1xyXG4gICAgICBjb25zdCBtZWRpdW1Ub3VjaEFyZWFTaGFwZSA9IGNyZWF0ZURpbGF0ZWRIZWFkKCBoZWFkV2lkdGgsIGhlYWRIZWlnaHQsIGhlYWRUb3VjaEFyZWFEaWxhdGlvbiApO1xyXG4gICAgICBjb25zdCBTTUFMTF9IRUFEX1NDQUxFID0gMC42NTsgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgICBjb25zdCBzbWFsbE1vdXNlQXJlYVNoYXBlID0gY3JlYXRlRGlsYXRlZEhlYWQoIGhlYWRXaWR0aCwgU01BTExfSEVBRF9TQ0FMRSAqIGhlYWRIZWlnaHQsIGhlYWRNb3VzZUFyZWFEaWxhdGlvbiApO1xyXG4gICAgICBjb25zdCBzbWFsbFRvdWNoQXJlYVNoYXBlID0gY3JlYXRlRGlsYXRlZEhlYWQoIGhlYWRXaWR0aCwgU01BTExfSEVBRF9TQ0FMRSAqIGhlYWRIZWlnaHQsIGhlYWRUb3VjaEFyZWFEaWxhdGlvbiApO1xyXG5cclxuICAgICAgLy8gV2hlbiB0aGUgdmVjdG9yIGNoYW5nZXMsIHRyYW5zZm9ybSB0aGUgaGVhZCBhbmQgYWRqdXN0IGl0cyBwb2ludGVyIGFyZWFzLiB1bmxpbmtlZCBpcyByZXF1aXJlZCB3aGVuIGRpc3Bvc2VkLlxyXG4gICAgICBjb25zdCB2ZWN0b3JDb21wb25lbnRzTGlzdGVuZXIgPSB2ZWN0b3JDb21wb25lbnRzID0+IHtcclxuXHJcbiAgICAgICAgLy8gQWRqdXN0IHBvaW50ZXIgYXJlYXMuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdmVjdG9yLWFkZGl0aW9uL2lzc3Vlcy8yNDAjaXNzdWVjb21tZW50LTU0NDY4MjgxOFxyXG4gICAgICAgIGNvbnN0IFNIT1JUX01BR05JVFVERSA9IDM7XHJcbiAgICAgICAgaWYgKCB2ZWN0b3JDb21wb25lbnRzLm1hZ25pdHVkZSA8PSBTSE9SVF9NQUdOSVRVREUgKSB7XHJcblxyXG4gICAgICAgICAgLy8gV2UgaGF2ZSBhICdzaG9ydCcgdmVjdG9yLCBzbyBhZGp1c3QgdGhlIGhlYWQncyBwb2ludGVyIGFyZWFzIHNvIHRoYXQgdGhlIHRhaWwgY2FuIHN0aWxsIGJlIGdyYWJiZWQuXHJcbiAgICAgICAgICBjb25zdCB2aWV3Q29tcG9uZW50cyA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkudmFsdWUubW9kZWxUb1ZpZXdEZWx0YSggdmVjdG9yLnZlY3RvckNvbXBvbmVudHMgKTtcclxuICAgICAgICAgIGNvbnN0IHZpZXdNYWduaXR1ZGUgPSB2aWV3Q29tcG9uZW50cy5tYWduaXR1ZGU7XHJcbiAgICAgICAgICBjb25zdCBtYXhIZWFkSGVpZ2h0ID0gb3B0aW9ucy5hcnJvd09wdGlvbnMuZnJhY3Rpb25hbEhlYWRIZWlnaHQgKiB2aWV3TWFnbml0dWRlO1xyXG5cclxuICAgICAgICAgIGlmICggaGVhZEhlaWdodCA+IG1heEhlYWRIZWlnaHQgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBoZWFkIGlzIHNjYWxlZCAoc2VlIEFycm93Tm9kZSBmcmFjdGlvbmFsSGVhZEhlaWdodCksIHVzZSBzbWFsbCBwb2ludGVyIGFyZWFzXHJcbiAgICAgICAgICAgIGhlYWROb2RlLm1vdXNlQXJlYSA9IHNtYWxsTW91c2VBcmVhU2hhcGU7XHJcbiAgICAgICAgICAgIGhlYWROb2RlLnRvdWNoQXJlYSA9IHNtYWxsVG91Y2hBcmVhU2hhcGU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGhlYWQgaXMgbm90IHNjYWxlZCwgdXNlIG1lZGl1bSBwb2ludGVyIGFyZWFzXHJcbiAgICAgICAgICAgIGhlYWROb2RlLm1vdXNlQXJlYSA9IG1lZGl1bU1vdXNlQXJlYVNoYXBlO1xyXG4gICAgICAgICAgICBoZWFkTm9kZS50b3VjaEFyZWEgPSBtZWRpdW1Ub3VjaEFyZWFTaGFwZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gV2UgaGF2ZSBhICdsb25nJyB2ZWN0b3IsIHNvIHVzZSB0aGUgbGFyZ2UgcG9pbnRlciBhcmVhcy5cclxuICAgICAgICAgIGhlYWROb2RlLm1vdXNlQXJlYSA9IGxhcmdlTW91c2VBcmVhU2hhcGU7XHJcbiAgICAgICAgICBoZWFkTm9kZS50b3VjaEFyZWEgPSBsYXJnZVRvdWNoQXJlYVNoYXBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVHJhbnNmb3JtIHRoZSBpbnZpc2libGUgaGVhZCB0byBtYXRjaCB0aGUgcG9zaXRpb24gYW5kIGFuZ2xlIG9mIHRoZSBhY3R1YWwgdmVjdG9yLlxyXG4gICAgICAgIGhlYWROb2RlLnRyYW5zbGF0aW9uID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZS5tb2RlbFRvVmlld0RlbHRhKCB2ZWN0b3IudmVjdG9yQ29tcG9uZW50cyApO1xyXG4gICAgICAgIGhlYWROb2RlLnJvdGF0aW9uID0gLXZlY3RvckNvbXBvbmVudHMuYW5nbGU7XHJcbiAgICAgIH07XHJcbiAgICAgIHZlY3Rvci52ZWN0b3JDb21wb25lbnRzUHJvcGVydHkubGluayggdmVjdG9yQ29tcG9uZW50c0xpc3RlbmVyICk7XHJcblxyXG4gICAgICAvLyBkaXNwb3NlIG9mIHRoaW5ncyB0aGF0IGFyZSByZWxhdGVkIHRvIG9wdGlvbmFsIHNjYWxlL3JvdGF0ZVxyXG4gICAgICBkaXNwb3NlU2NhbGVSb3RhdGUgPSAoKSA9PiB7XHJcbiAgICAgICAgaGVhZE5vZGUucmVtb3ZlSW5wdXRMaXN0ZW5lciggc2NhbGVSb3RhdGVEcmFnTGlzdGVuZXIgKTtcclxuICAgICAgICB0aXBQb3NpdGlvblByb3BlcnR5LnVubGluayggdGlwTGlzdGVuZXIgKTtcclxuICAgICAgICB2ZWN0b3IudmVjdG9yQ29tcG9uZW50c1Byb3BlcnR5LnVubGluayggdmVjdG9yQ29tcG9uZW50c0xpc3RlbmVyICk7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBBcHBlYXJhbmNlXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIGFwcGVhcmFuY2Ugb2YgdGhlIHZlY3RvcidzIHNoYWRvdy4gTXVzdCBiZSB1bm11bHRpbGlua2VkLlxyXG4gICAgY29uc3Qgc2hhZG93TXVsdGlsaW5rID0gTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgWyB2ZWN0b3IuaXNPbkdyYXBoUHJvcGVydHksIHZlY3Rvci52ZWN0b3JDb21wb25lbnRzUHJvcGVydHksIHRoaXMudmVjdG9yLmFuaW1hdGVCYWNrUHJvcGVydHkgXSxcclxuICAgICAgKCBpc09uR3JhcGgsIHZlY3RvckNvbXBvbmVudHMsIGFuaW1hdGVCYWNrICkgPT4ge1xyXG4gICAgICAgIHZlY3RvclNoYWRvd05vZGUudmlzaWJsZSA9ICggIWFuaW1hdGVCYWNrICYmICFpc09uR3JhcGggKTtcclxuICAgICAgICB2ZWN0b3JTaGFkb3dOb2RlLnJlc2V0VHJhbnNmb3JtKCk7XHJcbiAgICAgICAgaWYgKCAhaXNPbkdyYXBoICYmIHZlY3RvclNoYWRvd05vZGUuZ2V0Qm91bmRzKCkuaXNWYWxpZCgpICkge1xyXG4gICAgICAgICAgdmVjdG9yU2hhZG93Tm9kZS5sZWZ0ID0gdGhpcy5hcnJvd05vZGUubGVmdCArIFNIQURPV19PRkZTRVRfWDtcclxuICAgICAgICAgIHZlY3RvclNoYWRvd05vZGUudG9wID0gdGhpcy5hcnJvd05vZGUudG9wICsgU0hBRE9XX09GRlNFVF9ZO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0aXBEZWx0YVBvc2l0aW9uID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZS5tb2RlbFRvVmlld0RlbHRhKCB2ZWN0b3JDb21wb25lbnRzICk7XHJcbiAgICAgICAgdmVjdG9yU2hhZG93Tm9kZS5zZXRUaXAoIHRpcERlbHRhUG9zaXRpb24ueCwgdGlwRGVsdGFQb3NpdGlvbi55ICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBTaG93IHRoZSB2ZWN0b3IncyBsYWJlbCB3aGVuIGl0J3Mgb24gdGhlIGdyYXBoLiBNdXN0IGJlIHVubGlua2VkLlxyXG4gICAgY29uc3QgaXNPbkdyYXBoTGlzdGVuZXIgPSBpc09uR3JhcGggPT4gKCB0aGlzLmxhYmVsTm9kZS52aXNpYmxlID0gaXNPbkdyYXBoICk7XHJcbiAgICB2ZWN0b3IuaXNPbkdyYXBoUHJvcGVydHkubGluayggaXNPbkdyYXBoTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBIaWdobGlnaHQgdGhlIHZlY3RvcidzIGxhYmVsIHdoZW4gaXQgaXMgc2VsZWN0ZWQuIE11c3QgYmUgdW5saW5rZWQuXHJcbiAgICBjb25zdCBhY3RpdmVWZWN0b3JMaXN0ZW5lciA9IGFjdGl2ZVZlY3RvciA9PiB7XHJcbiAgICAgIHRoaXMubGFiZWxOb2RlLnNldEhpZ2hsaWdodGVkKCBhY3RpdmVWZWN0b3IgPT09IHZlY3RvciApO1xyXG4gICAgfTtcclxuICAgIGdyYXBoLmFjdGl2ZVZlY3RvclByb3BlcnR5LmxpbmsoIGFjdGl2ZVZlY3Rvckxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gRGlzYWJsZSBpbnRlcmFjdGlvbiB3aGVuIHRoZSB2ZWN0b3IgaXMgYW5pbWF0aW5nIGJhY2sgdG8gdGhlIHRvb2xib3gsIHdoZXJlIGl0IHdpbGwgYmUgZGlzcG9zZWQuXHJcbiAgICAvLyB1bmxpbmsgaXMgcmVxdWlyZWQgb24gZGlzcG9zZS5cclxuICAgIGNvbnN0IGFuaW1hdGVCYWNrTGlzdGVuZXIgPSBhbmltYXRlQmFjayA9PiB7XHJcbiAgICAgIGlmICggYW5pbWF0ZUJhY2sgKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgICAgICB0aGlzLnBpY2thYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jdXJzb3IgPSAnZGVmYXVsdCc7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLnZlY3Rvci5hbmltYXRlQmFja1Byb3BlcnR5LmxhenlMaW5rKCBhbmltYXRlQmFja0xpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZGlzcG9zZVZlY3Rvck5vZGUgPSAoKSA9PiB7XHJcblxyXG4gICAgICAvLyBEaXNwb3NlIG9mIG5vZGVzXHJcbiAgICAgIGFuZ2xlTm9kZS5kaXNwb3NlKCk7XHJcblxyXG4gICAgICAvLyBEaXNwb3NlIG9mIHRyYW5zZm9ybSBoYW5kbGluZ1xyXG4gICAgICBkaXNwb3NlVHJhbnNsYXRlKCk7XHJcbiAgICAgIGRpc3Bvc2VTY2FsZVJvdGF0ZSAmJiBkaXNwb3NlU2NhbGVSb3RhdGUoKTtcclxuXHJcbiAgICAgIC8vIERpc3Bvc2Ugb2YgYXBwZWFyYW5jZS1yZWxhdGVkIGxpc3RlbmVyc1xyXG4gICAgICBNdWx0aWxpbmsudW5tdWx0aWxpbmsoIHNoYWRvd011bHRpbGluayApO1xyXG4gICAgICB2ZWN0b3IuaXNPbkdyYXBoUHJvcGVydHkudW5saW5rKCBpc09uR3JhcGhMaXN0ZW5lciApO1xyXG4gICAgICBncmFwaC5hY3RpdmVWZWN0b3JQcm9wZXJ0eS51bmxpbmsoIGFjdGl2ZVZlY3Rvckxpc3RlbmVyICk7XHJcbiAgICAgIHRoaXMudmVjdG9yLmFuaW1hdGVCYWNrUHJvcGVydHkudW5saW5rKCBhbmltYXRlQmFja0xpc3RlbmVyICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmRpc3Bvc2VWZWN0b3JOb2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSB2ZWN0b3IgbW9kZWwsIHdoaWNoIHdpbGwgdGhlbiByb3VuZCB0aGUgbmV3IHBvc2l0aW9uIGRlcGVuZGluZyBvbiB0aGUgY29vcmRpbmF0ZSBzbmFwIG1vZGVcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHRpcFBvc2l0aW9uVmlldyAtIHRoZSBkcmFnIGxpc3RlbmVyIHBvc2l0aW9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVUaXBQb3NpdGlvbiggdGlwUG9zaXRpb25WaWV3ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMudmVjdG9yLmFuaW1hdGVCYWNrUHJvcGVydHkudmFsdWUgJiYgIXRoaXMudmVjdG9yLmluUHJvZ3Jlc3NBbmltYXRpb24sXHJcbiAgICAgICdDYW5ub3QgZHJhZyB0aXAgd2hlbiBhbmltYXRpbmcgYmFjaycgKTtcclxuXHJcbiAgICBjb25zdCB0aXBQb3NpdGlvbk1vZGVsID0gdGhpcy52ZWN0b3IudGFpbFxyXG4gICAgICAucGx1cyggdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZS52aWV3VG9Nb2RlbERlbHRhKCB0aXBQb3NpdGlvblZpZXcgKSApO1xyXG5cclxuICAgIHRoaXMudmVjdG9yLm1vdmVUaXBUb1Bvc2l0aW9uKCB0aXBQb3NpdGlvbk1vZGVsICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSBtb2RlbCB2ZWN0b3IncyB0YWlsIHBvc2l0aW9uLiBDYWxsZWQgd2hlbiB0aGUgdmVjdG9yIGlzIGJlaW5nIHRyYW5zbGF0ZWQuXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSB0YWlsUG9zaXRpb25WaWV3XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVUYWlsUG9zaXRpb24oIHRhaWxQb3NpdGlvblZpZXcgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy52ZWN0b3IuYW5pbWF0ZUJhY2tQcm9wZXJ0eS52YWx1ZSAmJiAhdGhpcy52ZWN0b3IuaW5Qcm9ncmVzc0FuaW1hdGlvbixcclxuICAgICAgJ0Nhbm5vdCBkcmFnIHRhaWwgd2hlbiBhbmltYXRpbmcgYmFjaycgKTtcclxuXHJcbiAgICBjb25zdCB0YWlsUG9zaXRpb25Nb2RlbCA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkudmFsdWUudmlld1RvTW9kZWxQb3NpdGlvbiggdGFpbFBvc2l0aW9uVmlldyApO1xyXG5cclxuICAgIC8vIEFsbG93IHRyYW5zbGF0aW9uIHRvIGFueXdoZXJlIGlmIGl0IGlzbid0IG9uIHRoZSBncmFwaFxyXG4gICAgaWYgKCB0aGlzLnZlY3Rvci5pc09uR3JhcGhQcm9wZXJ0eS52YWx1ZSA9PT0gZmFsc2UgKSB7XHJcbiAgICAgIHRoaXMudmVjdG9yLm1vdmVUb1RhaWxQb3NpdGlvbiggdGFpbFBvc2l0aW9uTW9kZWwgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBVcGRhdGUgdGhlIG1vZGVsIHRhaWwgcG9zaXRpb24sIHN1YmplY3QgdG8gc3ltbWV0cmljIHJvdW5kaW5nLCBhbmQgZml0IGluc2lkZSB0aGUgZ3JhcGggYm91bmRzXHJcbiAgICAgIHRoaXMudmVjdG9yLm1vdmVUYWlsVG9Qb3NpdGlvbiggdGFpbFBvc2l0aW9uTW9kZWwgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZvcndhcmRzIGFuIGV2ZW50IHRvIHRyYW5zbGF0aW9uRHJhZ0xpc3RlbmVyLiBVc2VkIGZvciBkcmFnZ2luZyB2ZWN0b3JzIG91dCBvZiB0aGUgdG9vbGJveC5cclxuICAgKiBAcGFyYW0ge1NjZW5lcnlFdmVudH0gZXZlbnRcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZm9yd2FyZEV2ZW50KCBldmVudCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGV2ZW50IGluc3RhbmNlb2YgU2NlbmVyeUV2ZW50LCAnaW52YWxpZCBldmVudCcgKTtcclxuICAgIHRoaXMudHJhbnNsYXRpb25EcmFnTGlzdGVuZXIucHJlc3MoIGV2ZW50LCB0aGlzICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIChyb3VnaCkgZGlsYXRlZCBzaGFwZSBmb3IgYSB2ZWN0b3IgaGVhZC4gIFRoZSBoZWFkIGlzIHBvaW50aW5nIHRvIHRoZSByaWdodC5cclxuICogQHBhcmFtIHtudW1iZXJ9IGhlYWRXaWR0aFxyXG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZEhlaWdodFxyXG4gKiBAcGFyYW0ge251bWJlcn0gZGlsYXRpb25cclxuICogQHJldHVybnMge1NoYXBlfVxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlRGlsYXRlZEhlYWQoIGhlYWRXaWR0aCwgaGVhZEhlaWdodCwgZGlsYXRpb24gKSB7XHJcblxyXG4gIC8vIFN0YXJ0aW5nIGZyb20gdGhlIHVwcGVyIGxlZnQgYW5kIG1vdmluZyBjbG9ja3dpc2VcclxuICByZXR1cm4gbmV3IFNoYXBlKClcclxuICAgIC5tb3ZlVG8oIC1oZWFkSGVpZ2h0LCAtaGVhZEhlaWdodCAvIDIgLSBkaWxhdGlvbiApXHJcbiAgICAubGluZVRvKCAwLCAtZGlsYXRpb24gKVxyXG4gICAgLmxpbmVUbyggZGlsYXRpb24sIDAgKVxyXG4gICAgLmxpbmVUbyggMCwgZGlsYXRpb24gKVxyXG4gICAgLmxpbmVUbyggLWhlYWRIZWlnaHQsIGhlYWRXaWR0aCAvIDIgKyBkaWxhdGlvbiApXHJcbiAgICAuY2xvc2UoKTtcclxufVxyXG5cclxudmVjdG9yQWRkaXRpb24ucmVnaXN0ZXIoICdWZWN0b3JOb2RlJywgVmVjdG9yTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFD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