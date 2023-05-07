// Copyright 2019-2023, University of Colorado Boulder

/**
 * View for a single 'slot' on the VectorCreatorPanel (./VectorCreatorPanel.js).
 *
 * A slot creates a Vector when the icon is clicked.
 *
 * ## Slots can differ in:
 *  - Icon colors and sizes
 *  - Infinite slot versus only one vector per slot
 *  - Having symbols versus not having symbols
 *  - Icon components and initial vector components (e.g. on Explore 1D the initial vectors are horizontal/vertical
 *    while on Explore 2D the vectors are 45 degrees)
 *
 * ## Implementation of creation of Vectors:
 *  1. Once the icon is clicked, a Vector is made.
 *  2. A call to the SceneNode is made, passing the created Vector. The Scene Node then creates the subsequent views
 *     for the Vector (VectorNode and VectorComponentNode), layering the views correctly and forwarding the event.
 *  3. Once the Vector indicates the Vector was dropped outside the Graph, the slot will then animate the Vector and
 *     dispose the vector, signaling to the SceneNode to dispose of the views.
 *
 * @author Brandon Li
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { AlignBox, DragListener, HBox } from '../../../../scenery/js/imports.js';
import vectorAddition from '../../vectorAddition.js';
import Graph from '../model/Graph.js';
import Vector from '../model/Vector.js';
import VectorSet from '../model/VectorSet.js';
import ArrowOverSymbolNode from './ArrowOverSymbolNode.js';
import VectorAdditionIconFactory from './VectorAdditionIconFactory.js';

// The fixed-width of the parent of the icon. The Icon is placed in an alignBox to ensure the Icon
// contains the same local width regardless of the initial vector components. This ensures that
// the label of the slot is in the same place regardless of the icon size.
const ARROW_ICON_CONTAINER_WIDTH = 35;
export default class VectorCreatorPanelSlot extends HBox {
  /**
   * @param {Graph} graph - the graph to drop the vector onto
   * @param {VectorSet} vectorSet - the VectorSet that the slot adds Vectors to
   * @param {SceneNode} sceneNode - the SceneNode that this slot appears in
   * @param {Vector2} initialVectorComponents - the initial vector components to pass to created vectors
   * @param {Object} [options]
   */
  constructor(graph, vectorSet, sceneNode, initialVectorComponents, options) {
    assert && assert(graph instanceof Graph, `invalid graph: ${graph}`);
    assert && assert(vectorSet instanceof VectorSet, `invalid vectorSet: ${vectorSet}`);
    assert && assert(initialVectorComponents instanceof Vector2, `invalid initialVectorComponents: ${initialVectorComponents}`);
    assert && assert(!options || Object.getPrototypeOf(options) === Object.prototype, `Extra prototype on options: ${options}`);

    //----------------------------------------------------------------------------------------

    options = merge({
      symbol: null,
      // {string|null} the symbol to pass to created vectors
      numberOfVectors: 1,
      // {number} the number of vectors that can exist that were created by this slot
      iconArrowMagnitude: 30,
      // {number} indicates the magnitude of the icon in view coordinates
      iconVectorComponents: null,
      // {Vector2|null} used for vector icon, defaults to initialVectorComponents

      // pointer area dilation for icons, identical for mouseArea and touchArea,
      // see https://github.com/phetsims/vector-addition/issues/250
      iconPointerAreaXDilation: 10,
      iconPointerAreaYDilation: 10
    }, options);
    super({
      spacing: 5
    });

    // convenience reference
    const modelViewTransform = graph.modelViewTransformProperty.value;

    //----------------------------------------------------------------------------------------
    // Create the icon
    //----------------------------------------------------------------------------------------

    // Get the components in view coordinates.
    const iconViewComponents = modelViewTransform.viewToModelDelta(options.iconVectorComponents || initialVectorComponents);

    // Create the icon.
    const iconNode = VectorAdditionIconFactory.createVectorCreatorPanelIcon(iconViewComponents, vectorSet.vectorColorPalette, options.iconArrowMagnitude);

    // Make the iconNode easier to grab
    iconNode.mouseArea = iconNode.localBounds.dilatedXY(options.iconPointerAreaXDilation, options.iconPointerAreaYDilation);
    iconNode.touchArea = iconNode.localBounds.dilatedXY(options.iconPointerAreaXDilation, options.iconPointerAreaYDilation);

    // Get the components in model coordinates of the icon. Used to animate the vector to the icon components.
    const iconComponents = modelViewTransform.viewToModelDelta(iconViewComponents.normalized().timesScalar(options.iconArrowMagnitude));

    // Create a fixed-size box for the icon. The Icon is placed in an alignBox to ensure the Icon
    // contains the same local width regardless of the initial vector components. This ensures that
    // the label of the slot is in the same place regardless of the icon size.
    this.addChild(new AlignBox(iconNode, {
      alignBounds: new Bounds2(0, 0, ARROW_ICON_CONTAINER_WIDTH, iconNode.height)
    }));

    //----------------------------------------------------------------------------------------
    // Create the label of the slot
    //----------------------------------------------------------------------------------------

    if (options.symbol) {
      this.addChild(new ArrowOverSymbolNode(options.symbol));
    }

    //----------------------------------------------------------------------------------------
    // Creation of Vectors (See ## Implementation of creation of Vectors above)
    //----------------------------------------------------------------------------------------

    // removeInputListener is unnecessary, exists for the lifetime of the sim.
    iconNode.addInputListener(DragListener.createForwardingListener(event => {
      //----------------------------------------------------------------------------------------
      // Step 1: When the icon is clicked, create a new Vector
      //----------------------------------------------------------------------------------------

      // Find where the icon was clicked relative to the scene node (view coordinates)
      const vectorCenterView = sceneNode.globalToLocalPoint(event.pointer.point);

      // Convert the view coordinates of where the icon was clicked into model coordinates
      const vectorCenterModel = graph.modelViewTransformProperty.value.viewToModelPosition(vectorCenterView);

      // Calculate where the tail position is relative to the scene node
      const vectorTailPosition = vectorCenterModel.minus(initialVectorComponents.timesScalar(0.5));

      // Create the new Vector Model
      const vector = new Vector(vectorTailPosition, initialVectorComponents, graph, vectorSet, options.symbol);
      vectorSet.vectors.push(vector);

      //----------------------------------------------------------------------------------------
      // Step 2: A call to the Scene Node is made, passing the created Vector to create the subsequent views
      //----------------------------------------------------------------------------------------

      sceneNode.registerVector(vector, vectorSet, event);

      // Hide the icon when we've reached the numberOfVectors limit
      iconNode.visible = vectorSet.vectors.lengthProperty.value < options.numberOfVectors;

      //----------------------------------------------------------------------------------------
      // Step 3: Once the Vector indicates the Vector was dropped outside the Graph, animate and
      // dispose the Vector, signaling to the SceneNode to dispose of the views.
      //----------------------------------------------------------------------------------------

      const animateVectorBackListener = animateBack => {
        if (animateBack) {
          // Get the model position of the icon node.
          const iconPosition = graph.modelViewTransformProperty.value.viewToModelBounds(sceneNode.boundsOf(iconNode)).center;

          // Animate the vector to its icon in the panel.
          vector.animateToPoint(iconPosition, iconComponents, () => {
            vectorSet.vectors.remove(vector);
            vector.dispose();
          });
        }
      };
      vector.animateBackProperty.link(animateVectorBackListener); // unlink required when vector is removed

      // Observe when the vector is removed and clean up.
      const removeVectorListener = removedVector => {
        if (removedVector === vector) {
          iconNode.visible = true;
          vector.animateBackProperty.unlink(animateVectorBackListener);
          vectorSet.vectors.removeItemRemovedListener(removeVectorListener);
        }
      };
      vectorSet.vectors.addItemRemovedListener(removeVectorListener);
    }));
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'VectorCreatorPanelSlot is not intended to be disposed');
  }
}
vectorAddition.register('VectorCreatorPanelSlot', VectorCreatorPanelSlot);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVmVjdG9yMiIsIm1lcmdlIiwiQWxpZ25Cb3giLCJEcmFnTGlzdGVuZXIiLCJIQm94IiwidmVjdG9yQWRkaXRpb24iLCJHcmFwaCIsIlZlY3RvciIsIlZlY3RvclNldCIsIkFycm93T3ZlclN5bWJvbE5vZGUiLCJWZWN0b3JBZGRpdGlvbkljb25GYWN0b3J5IiwiQVJST1dfSUNPTl9DT05UQUlORVJfV0lEVEgiLCJWZWN0b3JDcmVhdG9yUGFuZWxTbG90IiwiY29uc3RydWN0b3IiLCJncmFwaCIsInZlY3RvclNldCIsInNjZW5lTm9kZSIsImluaXRpYWxWZWN0b3JDb21wb25lbnRzIiwib3B0aW9ucyIsImFzc2VydCIsIk9iamVjdCIsImdldFByb3RvdHlwZU9mIiwicHJvdG90eXBlIiwic3ltYm9sIiwibnVtYmVyT2ZWZWN0b3JzIiwiaWNvbkFycm93TWFnbml0dWRlIiwiaWNvblZlY3RvckNvbXBvbmVudHMiLCJpY29uUG9pbnRlckFyZWFYRGlsYXRpb24iLCJpY29uUG9pbnRlckFyZWFZRGlsYXRpb24iLCJzcGFjaW5nIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwibW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkiLCJ2YWx1ZSIsImljb25WaWV3Q29tcG9uZW50cyIsInZpZXdUb01vZGVsRGVsdGEiLCJpY29uTm9kZSIsImNyZWF0ZVZlY3RvckNyZWF0b3JQYW5lbEljb24iLCJ2ZWN0b3JDb2xvclBhbGV0dGUiLCJtb3VzZUFyZWEiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWRYWSIsInRvdWNoQXJlYSIsImljb25Db21wb25lbnRzIiwibm9ybWFsaXplZCIsInRpbWVzU2NhbGFyIiwiYWRkQ2hpbGQiLCJhbGlnbkJvdW5kcyIsImhlaWdodCIsImFkZElucHV0TGlzdGVuZXIiLCJjcmVhdGVGb3J3YXJkaW5nTGlzdGVuZXIiLCJldmVudCIsInZlY3RvckNlbnRlclZpZXciLCJnbG9iYWxUb0xvY2FsUG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJ2ZWN0b3JDZW50ZXJNb2RlbCIsInZpZXdUb01vZGVsUG9zaXRpb24iLCJ2ZWN0b3JUYWlsUG9zaXRpb24iLCJtaW51cyIsInZlY3RvciIsInZlY3RvcnMiLCJwdXNoIiwicmVnaXN0ZXJWZWN0b3IiLCJ2aXNpYmxlIiwibGVuZ3RoUHJvcGVydHkiLCJhbmltYXRlVmVjdG9yQmFja0xpc3RlbmVyIiwiYW5pbWF0ZUJhY2siLCJpY29uUG9zaXRpb24iLCJ2aWV3VG9Nb2RlbEJvdW5kcyIsImJvdW5kc09mIiwiY2VudGVyIiwiYW5pbWF0ZVRvUG9pbnQiLCJyZW1vdmUiLCJkaXNwb3NlIiwiYW5pbWF0ZUJhY2tQcm9wZXJ0eSIsImxpbmsiLCJyZW1vdmVWZWN0b3JMaXN0ZW5lciIsInJlbW92ZWRWZWN0b3IiLCJ1bmxpbmsiLCJyZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyIiwiYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVmVjdG9yQ3JlYXRvclBhbmVsU2xvdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciBhIHNpbmdsZSAnc2xvdCcgb24gdGhlIFZlY3RvckNyZWF0b3JQYW5lbCAoLi9WZWN0b3JDcmVhdG9yUGFuZWwuanMpLlxyXG4gKlxyXG4gKiBBIHNsb3QgY3JlYXRlcyBhIFZlY3RvciB3aGVuIHRoZSBpY29uIGlzIGNsaWNrZWQuXHJcbiAqXHJcbiAqICMjIFNsb3RzIGNhbiBkaWZmZXIgaW46XHJcbiAqICAtIEljb24gY29sb3JzIGFuZCBzaXplc1xyXG4gKiAgLSBJbmZpbml0ZSBzbG90IHZlcnN1cyBvbmx5IG9uZSB2ZWN0b3IgcGVyIHNsb3RcclxuICogIC0gSGF2aW5nIHN5bWJvbHMgdmVyc3VzIG5vdCBoYXZpbmcgc3ltYm9sc1xyXG4gKiAgLSBJY29uIGNvbXBvbmVudHMgYW5kIGluaXRpYWwgdmVjdG9yIGNvbXBvbmVudHMgKGUuZy4gb24gRXhwbG9yZSAxRCB0aGUgaW5pdGlhbCB2ZWN0b3JzIGFyZSBob3Jpem9udGFsL3ZlcnRpY2FsXHJcbiAqICAgIHdoaWxlIG9uIEV4cGxvcmUgMkQgdGhlIHZlY3RvcnMgYXJlIDQ1IGRlZ3JlZXMpXHJcbiAqXHJcbiAqICMjIEltcGxlbWVudGF0aW9uIG9mIGNyZWF0aW9uIG9mIFZlY3RvcnM6XHJcbiAqICAxLiBPbmNlIHRoZSBpY29uIGlzIGNsaWNrZWQsIGEgVmVjdG9yIGlzIG1hZGUuXHJcbiAqICAyLiBBIGNhbGwgdG8gdGhlIFNjZW5lTm9kZSBpcyBtYWRlLCBwYXNzaW5nIHRoZSBjcmVhdGVkIFZlY3Rvci4gVGhlIFNjZW5lIE5vZGUgdGhlbiBjcmVhdGVzIHRoZSBzdWJzZXF1ZW50IHZpZXdzXHJcbiAqICAgICBmb3IgdGhlIFZlY3RvciAoVmVjdG9yTm9kZSBhbmQgVmVjdG9yQ29tcG9uZW50Tm9kZSksIGxheWVyaW5nIHRoZSB2aWV3cyBjb3JyZWN0bHkgYW5kIGZvcndhcmRpbmcgdGhlIGV2ZW50LlxyXG4gKiAgMy4gT25jZSB0aGUgVmVjdG9yIGluZGljYXRlcyB0aGUgVmVjdG9yIHdhcyBkcm9wcGVkIG91dHNpZGUgdGhlIEdyYXBoLCB0aGUgc2xvdCB3aWxsIHRoZW4gYW5pbWF0ZSB0aGUgVmVjdG9yIGFuZFxyXG4gKiAgICAgZGlzcG9zZSB0aGUgdmVjdG9yLCBzaWduYWxpbmcgdG8gdGhlIFNjZW5lTm9kZSB0byBkaXNwb3NlIG9mIHRoZSB2aWV3cy5cclxuICpcclxuICogQGF1dGhvciBCcmFuZG9uIExpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBBbGlnbkJveCwgRHJhZ0xpc3RlbmVyLCBIQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHZlY3RvckFkZGl0aW9uIGZyb20gJy4uLy4uL3ZlY3RvckFkZGl0aW9uLmpzJztcclxuaW1wb3J0IEdyYXBoIGZyb20gJy4uL21vZGVsL0dyYXBoLmpzJztcclxuaW1wb3J0IFZlY3RvciBmcm9tICcuLi9tb2RlbC9WZWN0b3IuanMnO1xyXG5pbXBvcnQgVmVjdG9yU2V0IGZyb20gJy4uL21vZGVsL1ZlY3RvclNldC5qcyc7XHJcbmltcG9ydCBBcnJvd092ZXJTeW1ib2xOb2RlIGZyb20gJy4vQXJyb3dPdmVyU3ltYm9sTm9kZS5qcyc7XHJcbmltcG9ydCBWZWN0b3JBZGRpdGlvbkljb25GYWN0b3J5IGZyb20gJy4vVmVjdG9yQWRkaXRpb25JY29uRmFjdG9yeS5qcyc7XHJcblxyXG4vLyBUaGUgZml4ZWQtd2lkdGggb2YgdGhlIHBhcmVudCBvZiB0aGUgaWNvbi4gVGhlIEljb24gaXMgcGxhY2VkIGluIGFuIGFsaWduQm94IHRvIGVuc3VyZSB0aGUgSWNvblxyXG4vLyBjb250YWlucyB0aGUgc2FtZSBsb2NhbCB3aWR0aCByZWdhcmRsZXNzIG9mIHRoZSBpbml0aWFsIHZlY3RvciBjb21wb25lbnRzLiBUaGlzIGVuc3VyZXMgdGhhdFxyXG4vLyB0aGUgbGFiZWwgb2YgdGhlIHNsb3QgaXMgaW4gdGhlIHNhbWUgcGxhY2UgcmVnYXJkbGVzcyBvZiB0aGUgaWNvbiBzaXplLlxyXG5jb25zdCBBUlJPV19JQ09OX0NPTlRBSU5FUl9XSURUSCA9IDM1O1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlY3RvckNyZWF0b3JQYW5lbFNsb3QgZXh0ZW5kcyBIQm94IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtHcmFwaH0gZ3JhcGggLSB0aGUgZ3JhcGggdG8gZHJvcCB0aGUgdmVjdG9yIG9udG9cclxuICAgKiBAcGFyYW0ge1ZlY3RvclNldH0gdmVjdG9yU2V0IC0gdGhlIFZlY3RvclNldCB0aGF0IHRoZSBzbG90IGFkZHMgVmVjdG9ycyB0b1xyXG4gICAqIEBwYXJhbSB7U2NlbmVOb2RlfSBzY2VuZU5vZGUgLSB0aGUgU2NlbmVOb2RlIHRoYXQgdGhpcyBzbG90IGFwcGVhcnMgaW5cclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGluaXRpYWxWZWN0b3JDb21wb25lbnRzIC0gdGhlIGluaXRpYWwgdmVjdG9yIGNvbXBvbmVudHMgdG8gcGFzcyB0byBjcmVhdGVkIHZlY3RvcnNcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGdyYXBoLCB2ZWN0b3JTZXQsIHNjZW5lTm9kZSwgaW5pdGlhbFZlY3RvckNvbXBvbmVudHMsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZ3JhcGggaW5zdGFuY2VvZiBHcmFwaCwgYGludmFsaWQgZ3JhcGg6ICR7Z3JhcGh9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmVjdG9yU2V0IGluc3RhbmNlb2YgVmVjdG9yU2V0LCBgaW52YWxpZCB2ZWN0b3JTZXQ6ICR7dmVjdG9yU2V0fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluaXRpYWxWZWN0b3JDb21wb25lbnRzIGluc3RhbmNlb2YgVmVjdG9yMiwgYGludmFsaWQgaW5pdGlhbFZlY3RvckNvbXBvbmVudHM6ICR7aW5pdGlhbFZlY3RvckNvbXBvbmVudHN9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKCBvcHRpb25zICkgPT09IE9iamVjdC5wcm90b3R5cGUsIGBFeHRyYSBwcm90b3R5cGUgb24gb3B0aW9uczogJHtvcHRpb25zfWAgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIHN5bWJvbDogbnVsbCwgLy8ge3N0cmluZ3xudWxsfSB0aGUgc3ltYm9sIHRvIHBhc3MgdG8gY3JlYXRlZCB2ZWN0b3JzXHJcbiAgICAgIG51bWJlck9mVmVjdG9yczogMSwgIC8vIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgdmVjdG9ycyB0aGF0IGNhbiBleGlzdCB0aGF0IHdlcmUgY3JlYXRlZCBieSB0aGlzIHNsb3RcclxuICAgICAgaWNvbkFycm93TWFnbml0dWRlOiAzMCwgLy8ge251bWJlcn0gaW5kaWNhdGVzIHRoZSBtYWduaXR1ZGUgb2YgdGhlIGljb24gaW4gdmlldyBjb29yZGluYXRlc1xyXG4gICAgICBpY29uVmVjdG9yQ29tcG9uZW50czogbnVsbCwgLy8ge1ZlY3RvcjJ8bnVsbH0gdXNlZCBmb3IgdmVjdG9yIGljb24sIGRlZmF1bHRzIHRvIGluaXRpYWxWZWN0b3JDb21wb25lbnRzXHJcblxyXG4gICAgICAvLyBwb2ludGVyIGFyZWEgZGlsYXRpb24gZm9yIGljb25zLCBpZGVudGljYWwgZm9yIG1vdXNlQXJlYSBhbmQgdG91Y2hBcmVhLFxyXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlY3Rvci1hZGRpdGlvbi9pc3N1ZXMvMjUwXHJcbiAgICAgIGljb25Qb2ludGVyQXJlYVhEaWxhdGlvbjogMTAsXHJcbiAgICAgIGljb25Qb2ludGVyQXJlYVlEaWxhdGlvbjogMTBcclxuXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIHsgc3BhY2luZzogNSB9ICk7XHJcblxyXG4gICAgLy8gY29udmVuaWVuY2UgcmVmZXJlbmNlXHJcbiAgICBjb25zdCBtb2RlbFZpZXdUcmFuc2Zvcm0gPSBncmFwaC5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIENyZWF0ZSB0aGUgaWNvblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gR2V0IHRoZSBjb21wb25lbnRzIGluIHZpZXcgY29vcmRpbmF0ZXMuXHJcbiAgICBjb25zdCBpY29uVmlld0NvbXBvbmVudHMgPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxEZWx0YSggb3B0aW9ucy5pY29uVmVjdG9yQ29tcG9uZW50cyB8fCBpbml0aWFsVmVjdG9yQ29tcG9uZW50cyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgaWNvbi5cclxuICAgIGNvbnN0IGljb25Ob2RlID0gVmVjdG9yQWRkaXRpb25JY29uRmFjdG9yeS5jcmVhdGVWZWN0b3JDcmVhdG9yUGFuZWxJY29uKCBpY29uVmlld0NvbXBvbmVudHMsXHJcbiAgICAgIHZlY3RvclNldC52ZWN0b3JDb2xvclBhbGV0dGUsIG9wdGlvbnMuaWNvbkFycm93TWFnbml0dWRlICk7XHJcblxyXG4gICAgLy8gTWFrZSB0aGUgaWNvbk5vZGUgZWFzaWVyIHRvIGdyYWJcclxuICAgIGljb25Ob2RlLm1vdXNlQXJlYSA9IGljb25Ob2RlLmxvY2FsQm91bmRzLmRpbGF0ZWRYWSggb3B0aW9ucy5pY29uUG9pbnRlckFyZWFYRGlsYXRpb24sIG9wdGlvbnMuaWNvblBvaW50ZXJBcmVhWURpbGF0aW9uICk7XHJcbiAgICBpY29uTm9kZS50b3VjaEFyZWEgPSBpY29uTm9kZS5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIG9wdGlvbnMuaWNvblBvaW50ZXJBcmVhWERpbGF0aW9uLCBvcHRpb25zLmljb25Qb2ludGVyQXJlYVlEaWxhdGlvbiApO1xyXG5cclxuICAgIC8vIEdldCB0aGUgY29tcG9uZW50cyBpbiBtb2RlbCBjb29yZGluYXRlcyBvZiB0aGUgaWNvbi4gVXNlZCB0byBhbmltYXRlIHRoZSB2ZWN0b3IgdG8gdGhlIGljb24gY29tcG9uZW50cy5cclxuICAgIGNvbnN0IGljb25Db21wb25lbnRzID0gbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsRGVsdGEoIGljb25WaWV3Q29tcG9uZW50c1xyXG4gICAgICAubm9ybWFsaXplZCgpLnRpbWVzU2NhbGFyKCBvcHRpb25zLmljb25BcnJvd01hZ25pdHVkZSApICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgZml4ZWQtc2l6ZSBib3ggZm9yIHRoZSBpY29uLiBUaGUgSWNvbiBpcyBwbGFjZWQgaW4gYW4gYWxpZ25Cb3ggdG8gZW5zdXJlIHRoZSBJY29uXHJcbiAgICAvLyBjb250YWlucyB0aGUgc2FtZSBsb2NhbCB3aWR0aCByZWdhcmRsZXNzIG9mIHRoZSBpbml0aWFsIHZlY3RvciBjb21wb25lbnRzLiBUaGlzIGVuc3VyZXMgdGhhdFxyXG4gICAgLy8gdGhlIGxhYmVsIG9mIHRoZSBzbG90IGlzIGluIHRoZSBzYW1lIHBsYWNlIHJlZ2FyZGxlc3Mgb2YgdGhlIGljb24gc2l6ZS5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBBbGlnbkJveCggaWNvbk5vZGUsIHtcclxuICAgICAgYWxpZ25Cb3VuZHM6IG5ldyBCb3VuZHMyKCAwLCAwLCBBUlJPV19JQ09OX0NPTlRBSU5FUl9XSURUSCwgaWNvbk5vZGUuaGVpZ2h0IClcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gQ3JlYXRlIHRoZSBsYWJlbCBvZiB0aGUgc2xvdFxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgaWYgKCBvcHRpb25zLnN5bWJvbCApIHtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggbmV3IEFycm93T3ZlclN5bWJvbE5vZGUoIG9wdGlvbnMuc3ltYm9sICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIENyZWF0aW9uIG9mIFZlY3RvcnMgKFNlZSAjIyBJbXBsZW1lbnRhdGlvbiBvZiBjcmVhdGlvbiBvZiBWZWN0b3JzIGFib3ZlKVxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gcmVtb3ZlSW5wdXRMaXN0ZW5lciBpcyB1bm5lY2Vzc2FyeSwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbS5cclxuICAgIGljb25Ob2RlLmFkZElucHV0TGlzdGVuZXIoIERyYWdMaXN0ZW5lci5jcmVhdGVGb3J3YXJkaW5nTGlzdGVuZXIoIGV2ZW50ID0+IHtcclxuXHJcbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAvLyBTdGVwIDE6IFdoZW4gdGhlIGljb24gaXMgY2xpY2tlZCwgY3JlYXRlIGEgbmV3IFZlY3RvclxyXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgIC8vIEZpbmQgd2hlcmUgdGhlIGljb24gd2FzIGNsaWNrZWQgcmVsYXRpdmUgdG8gdGhlIHNjZW5lIG5vZGUgKHZpZXcgY29vcmRpbmF0ZXMpXHJcbiAgICAgIGNvbnN0IHZlY3RvckNlbnRlclZpZXcgPSBzY2VuZU5vZGUuZ2xvYmFsVG9Mb2NhbFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICk7XHJcblxyXG4gICAgICAvLyBDb252ZXJ0IHRoZSB2aWV3IGNvb3JkaW5hdGVzIG9mIHdoZXJlIHRoZSBpY29uIHdhcyBjbGlja2VkIGludG8gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgICAgY29uc3QgdmVjdG9yQ2VudGVyTW9kZWwgPSBncmFwaC5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZS52aWV3VG9Nb2RlbFBvc2l0aW9uKCB2ZWN0b3JDZW50ZXJWaWV3ICk7XHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGUgd2hlcmUgdGhlIHRhaWwgcG9zaXRpb24gaXMgcmVsYXRpdmUgdG8gdGhlIHNjZW5lIG5vZGVcclxuICAgICAgY29uc3QgdmVjdG9yVGFpbFBvc2l0aW9uID0gdmVjdG9yQ2VudGVyTW9kZWwubWludXMoIGluaXRpYWxWZWN0b3JDb21wb25lbnRzLnRpbWVzU2NhbGFyKCAwLjUgKSApO1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIHRoZSBuZXcgVmVjdG9yIE1vZGVsXHJcbiAgICAgIGNvbnN0IHZlY3RvciA9IG5ldyBWZWN0b3IoIHZlY3RvclRhaWxQb3NpdGlvbiwgaW5pdGlhbFZlY3RvckNvbXBvbmVudHMsIGdyYXBoLCB2ZWN0b3JTZXQsIG9wdGlvbnMuc3ltYm9sICk7XHJcblxyXG4gICAgICB2ZWN0b3JTZXQudmVjdG9ycy5wdXNoKCB2ZWN0b3IgKTtcclxuXHJcbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAvLyBTdGVwIDI6IEEgY2FsbCB0byB0aGUgU2NlbmUgTm9kZSBpcyBtYWRlLCBwYXNzaW5nIHRoZSBjcmVhdGVkIFZlY3RvciB0byBjcmVhdGUgdGhlIHN1YnNlcXVlbnQgdmlld3NcclxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICBzY2VuZU5vZGUucmVnaXN0ZXJWZWN0b3IoIHZlY3RvciwgdmVjdG9yU2V0LCBldmVudCApO1xyXG5cclxuICAgICAgLy8gSGlkZSB0aGUgaWNvbiB3aGVuIHdlJ3ZlIHJlYWNoZWQgdGhlIG51bWJlck9mVmVjdG9ycyBsaW1pdFxyXG4gICAgICBpY29uTm9kZS52aXNpYmxlID0gKCB2ZWN0b3JTZXQudmVjdG9ycy5sZW5ndGhQcm9wZXJ0eS52YWx1ZSA8IG9wdGlvbnMubnVtYmVyT2ZWZWN0b3JzICk7XHJcblxyXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgLy8gU3RlcCAzOiBPbmNlIHRoZSBWZWN0b3IgaW5kaWNhdGVzIHRoZSBWZWN0b3Igd2FzIGRyb3BwZWQgb3V0c2lkZSB0aGUgR3JhcGgsIGFuaW1hdGUgYW5kXHJcbiAgICAgIC8vIGRpc3Bvc2UgdGhlIFZlY3Rvciwgc2lnbmFsaW5nIHRvIHRoZSBTY2VuZU5vZGUgdG8gZGlzcG9zZSBvZiB0aGUgdmlld3MuXHJcbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgY29uc3QgYW5pbWF0ZVZlY3RvckJhY2tMaXN0ZW5lciA9IGFuaW1hdGVCYWNrID0+IHtcclxuICAgICAgICBpZiAoIGFuaW1hdGVCYWNrICkge1xyXG5cclxuICAgICAgICAgIC8vIEdldCB0aGUgbW9kZWwgcG9zaXRpb24gb2YgdGhlIGljb24gbm9kZS5cclxuICAgICAgICAgIGNvbnN0IGljb25Qb3NpdGlvbiA9IGdyYXBoLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LnZhbHVlLnZpZXdUb01vZGVsQm91bmRzKCBzY2VuZU5vZGUuYm91bmRzT2YoIGljb25Ob2RlICkgKS5jZW50ZXI7XHJcblxyXG4gICAgICAgICAgLy8gQW5pbWF0ZSB0aGUgdmVjdG9yIHRvIGl0cyBpY29uIGluIHRoZSBwYW5lbC5cclxuICAgICAgICAgIHZlY3Rvci5hbmltYXRlVG9Qb2ludCggaWNvblBvc2l0aW9uLCBpY29uQ29tcG9uZW50cywgKCkgPT4ge1xyXG4gICAgICAgICAgICB2ZWN0b3JTZXQudmVjdG9ycy5yZW1vdmUoIHZlY3RvciApO1xyXG4gICAgICAgICAgICB2ZWN0b3IuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgdmVjdG9yLmFuaW1hdGVCYWNrUHJvcGVydHkubGluayggYW5pbWF0ZVZlY3RvckJhY2tMaXN0ZW5lciApOyAvLyB1bmxpbmsgcmVxdWlyZWQgd2hlbiB2ZWN0b3IgaXMgcmVtb3ZlZFxyXG5cclxuICAgICAgLy8gT2JzZXJ2ZSB3aGVuIHRoZSB2ZWN0b3IgaXMgcmVtb3ZlZCBhbmQgY2xlYW4gdXAuXHJcbiAgICAgIGNvbnN0IHJlbW92ZVZlY3Rvckxpc3RlbmVyID0gcmVtb3ZlZFZlY3RvciA9PiB7XHJcbiAgICAgICAgaWYgKCByZW1vdmVkVmVjdG9yID09PSB2ZWN0b3IgKSB7XHJcbiAgICAgICAgICBpY29uTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHZlY3Rvci5hbmltYXRlQmFja1Byb3BlcnR5LnVubGluayggYW5pbWF0ZVZlY3RvckJhY2tMaXN0ZW5lciApO1xyXG4gICAgICAgICAgdmVjdG9yU2V0LnZlY3RvcnMucmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciggcmVtb3ZlVmVjdG9yTGlzdGVuZXIgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIHZlY3RvclNldC52ZWN0b3JzLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIHJlbW92ZVZlY3Rvckxpc3RlbmVyICk7XHJcbiAgICB9ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdWZWN0b3JDcmVhdG9yUGFuZWxTbG90IGlzIG5vdCBpbnRlbmRlZCB0byBiZSBkaXNwb3NlZCcgKTtcclxuICB9XHJcbn1cclxuXHJcbnZlY3RvckFkZGl0aW9uLnJlZ2lzdGVyKCAnVmVjdG9yQ3JlYXRvclBhbmVsU2xvdCcsIFZlY3RvckNyZWF0b3JQYW5lbFNsb3QgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxRQUFRLEVBQUVDLFlBQVksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUNoRixPQUFPQyxjQUFjLE1BQU0seUJBQXlCO0FBQ3BELE9BQU9DLEtBQUssTUFBTSxtQkFBbUI7QUFDckMsT0FBT0MsTUFBTSxNQUFNLG9CQUFvQjtBQUN2QyxPQUFPQyxTQUFTLE1BQU0sdUJBQXVCO0FBQzdDLE9BQU9DLG1CQUFtQixNQUFNLDBCQUEwQjtBQUMxRCxPQUFPQyx5QkFBeUIsTUFBTSxnQ0FBZ0M7O0FBRXRFO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLDBCQUEwQixHQUFH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