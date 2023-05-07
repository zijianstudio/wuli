// Copyright 2014-2022, University of Colorado Boulder

/**
 * A composite node that depicts a shape placement board, a bucket containing shapes to go on the board, an area and
 * perimeter readout, and an erase button.  These are consolidated together in this node to avoid code duplication.
 *
 * @author John Blanco
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BucketFront from '../../../../scenery-phet/js/bucket/BucketFront.js';
import BucketHole from '../../../../scenery-phet/js/bucket/BucketHole.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import { Color, Node } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
import ShapeCreatorNode from '../../common/view/ShapeCreatorNode.js';
import ShapeNode from '../../common/view/ShapeNode.js';
import ShapePlacementBoardNode from '../../common/view/ShapePlacementBoardNode.js';
import AreaAndPerimeterDisplay from './AreaAndPerimeterDisplay.js';

// constants
const SPACE_AROUND_SHAPE_PLACEMENT_BOARD = AreaBuilderSharedConstants.CONTROLS_INSET;
const IDENTITY_TRANSFORM = ModelViewTransform2.createIdentity();
const UNIT_SQUARE_LENGTH = AreaBuilderSharedConstants.UNIT_SQUARE_LENGTH;
const UNIT_RECTANGLE_SHAPE = Shape.rect(0, 0, UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH);
const SHAPE_CREATOR_OFFSET_POSITIONS = [
// Offsets used for initial position of shape, relative to bucket hole center.  Empirically determined.
new Vector2(-20 - UNIT_SQUARE_LENGTH / 2, 0 - UNIT_SQUARE_LENGTH / 2), new Vector2(-10 - UNIT_SQUARE_LENGTH / 2, -2 - UNIT_SQUARE_LENGTH / 2), new Vector2(9 - UNIT_SQUARE_LENGTH / 2, 1 - UNIT_SQUARE_LENGTH / 2), new Vector2(18 - UNIT_SQUARE_LENGTH / 2, 3 - UNIT_SQUARE_LENGTH / 2), new Vector2(3 - UNIT_SQUARE_LENGTH / 2, 5 - UNIT_SQUARE_LENGTH / 2)];
class ExploreNode extends Node {
  /**
   * @param {ShapePlacementBoard} shapePlacementBoard
   * @param {function} addShapeToModel - Function for adding a newly created shape to the model.
   * @param {ObservableArrayDef} movableShapeList - The array that tracks the movable shapes.
   * @param {Bucket} bucket - Model of the bucket that is to be portrayed
   * @param {Object} [options]
   */
  constructor(shapePlacementBoard, addShapeToModel, movableShapeList, bucket, options) {
    options = merge({
      // drag bounds for the shapes that can go on the board
      shapeDragBounds: Bounds2.EVERYTHING,
      // An optional layer (scenery node) on which movable shapes will be placed.  Passing it in allows it to be
      // created outside this node, which supports some layering which is otherwise not possible.
      shapesLayer: null
    }, options);

    // Verify that the shape placement board is set up to handle a specific color, rather than all colors, since other
    // code below depends on this.
    assert && assert(shapePlacementBoard.colorHandled !== '*');
    const shapeColor = Color.toColor(shapePlacementBoard.colorHandled);
    super();

    // Create the nodes that will be used to layer things visually.
    const backLayer = new Node();
    this.addChild(backLayer);
    let movableShapesLayer;
    if (!options.shapesLayer) {
      movableShapesLayer = new Node({
        layerSplit: true
      }); // Force the moving shape into a separate layer for performance reasons.
      this.addChild(movableShapesLayer);
    } else {
      // Assume that this layer was added to the scene graph elsewhere, and doesn't need to be added here.
      movableShapesLayer = options.shapesLayer;
    }
    const bucketFrontLayer = new Node();
    this.addChild(bucketFrontLayer);
    const singleBoardControlsLayer = new Node();
    this.addChild(singleBoardControlsLayer);

    // Add the node that represents the shape placement board.  This is positioned based on this model position, and
    // all other nodes (such as the bucket) are positioned relative to this.
    const shapePlacementBoardNode = new ShapePlacementBoardNode(shapePlacementBoard);
    backLayer.addChild(shapePlacementBoardNode);

    // Add the area and perimeter display
    this.areaAndPerimeterDisplay = new AreaAndPerimeterDisplay(shapePlacementBoard.areaAndPerimeterProperty, shapeColor, shapeColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR), {
      centerX: shapePlacementBoardNode.centerX,
      bottom: shapePlacementBoardNode.top - SPACE_AROUND_SHAPE_PLACEMENT_BOARD
    });
    this.addChild(this.areaAndPerimeterDisplay);

    // Add the bucket view elements
    const bucketFront = new BucketFront(bucket, IDENTITY_TRANSFORM);
    bucketFrontLayer.addChild(bucketFront);
    const bucketHole = new BucketHole(bucket, IDENTITY_TRANSFORM);
    backLayer.addChild(bucketHole);

    // Add the shape creator nodes.  These must be added after the bucket hole for proper layering.
    SHAPE_CREATOR_OFFSET_POSITIONS.forEach(offset => {
      backLayer.addChild(new ShapeCreatorNode(UNIT_RECTANGLE_SHAPE, shapeColor, addShapeToModel, {
        left: bucketHole.centerX + offset.x,
        top: bucketHole.centerY + offset.y,
        shapeDragBounds: options.shapeDragBounds
      }));
    });

    // Add the button that allows the board to be cleared of all shapes.
    this.addChild(new EraserButton({
      right: bucketFront.right - 3,
      top: bucketFront.bottom + 5,
      touchAreaXDilation: 5,
      touchAreaYDilation: 5,
      listener: () => {
        shapePlacementBoard.releaseAllShapes('fade');
      }
    }));

    // Handle the comings and goings of movable shapes.
    movableShapeList.addItemAddedListener(addedShape => {
      if (addedShape.color.equals(shapeColor)) {
        // Create and add the view representation for this shape.
        const shapeNode = new ShapeNode(addedShape, options.shapeDragBounds);
        movableShapesLayer.addChild(shapeNode);

        // Move the shape to the front of this layer when grabbed by the user.
        addedShape.userControlledProperty.link(userControlled => {
          if (userControlled) {
            shapeNode.moveToFront();
          }
        });

        // Add the removal listener for if and when this shape is removed from the model.
        movableShapeList.addItemRemovedListener(function removalListener(removedShape) {
          if (removedShape === addedShape) {
            movableShapesLayer.removeChild(shapeNode);
            movableShapeList.removeItemRemovedListener(removalListener);
            shapeNode.dispose();
          }
        });
      }
    });
  }

  /**
   * @public
   */
  reset() {
    this.areaAndPerimeterDisplay.reset();
  }
}
areaBuilder.register('ExploreNode', ExploreNode);
export default ExploreNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVmVjdG9yMiIsIlNoYXBlIiwibWVyZ2UiLCJNb2RlbFZpZXdUcmFuc2Zvcm0yIiwiQnVja2V0RnJvbnQiLCJCdWNrZXRIb2xlIiwiRXJhc2VyQnV0dG9uIiwiQ29sb3IiLCJOb2RlIiwiYXJlYUJ1aWxkZXIiLCJBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyIsIlNoYXBlQ3JlYXRvck5vZGUiLCJTaGFwZU5vZGUiLCJTaGFwZVBsYWNlbWVudEJvYXJkTm9kZSIsIkFyZWFBbmRQZXJpbWV0ZXJEaXNwbGF5IiwiU1BBQ0VfQVJPVU5EX1NIQVBFX1BMQUNFTUVOVF9CT0FSRCIsIkNPTlRST0xTX0lOU0VUIiwiSURFTlRJVFlfVFJBTlNGT1JNIiwiY3JlYXRlSWRlbnRpdHkiLCJVTklUX1NRVUFSRV9MRU5HVEgiLCJVTklUX1JFQ1RBTkdMRV9TSEFQRSIsInJlY3QiLCJTSEFQRV9DUkVBVE9SX09GRlNFVF9QT1NJVElPTlMiLCJFeHBsb3JlTm9kZSIsImNvbnN0cnVjdG9yIiwic2hhcGVQbGFjZW1lbnRCb2FyZCIsImFkZFNoYXBlVG9Nb2RlbCIsIm1vdmFibGVTaGFwZUxpc3QiLCJidWNrZXQiLCJvcHRpb25zIiwic2hhcGVEcmFnQm91bmRzIiwiRVZFUllUSElORyIsInNoYXBlc0xheWVyIiwiYXNzZXJ0IiwiY29sb3JIYW5kbGVkIiwic2hhcGVDb2xvciIsInRvQ29sb3IiLCJiYWNrTGF5ZXIiLCJhZGRDaGlsZCIsIm1vdmFibGVTaGFwZXNMYXllciIsImxheWVyU3BsaXQiLCJidWNrZXRGcm9udExheWVyIiwic2luZ2xlQm9hcmRDb250cm9sc0xheWVyIiwic2hhcGVQbGFjZW1lbnRCb2FyZE5vZGUiLCJhcmVhQW5kUGVyaW1ldGVyRGlzcGxheSIsImFyZWFBbmRQZXJpbWV0ZXJQcm9wZXJ0eSIsImNvbG9yVXRpbHNEYXJrZXIiLCJQRVJJTUVURVJfREFSS0VOX0ZBQ1RPUiIsImNlbnRlclgiLCJib3R0b20iLCJ0b3AiLCJidWNrZXRGcm9udCIsImJ1Y2tldEhvbGUiLCJmb3JFYWNoIiwib2Zmc2V0IiwibGVmdCIsIngiLCJjZW50ZXJZIiwieSIsInJpZ2h0IiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwibGlzdGVuZXIiLCJyZWxlYXNlQWxsU2hhcGVzIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJhZGRlZFNoYXBlIiwiY29sb3IiLCJlcXVhbHMiLCJzaGFwZU5vZGUiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5IiwibGluayIsInVzZXJDb250cm9sbGVkIiwibW92ZVRvRnJvbnQiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwicmVtb3ZhbExpc3RlbmVyIiwicmVtb3ZlZFNoYXBlIiwicmVtb3ZlQ2hpbGQiLCJyZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyIiwiZGlzcG9zZSIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFeHBsb3JlTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIGNvbXBvc2l0ZSBub2RlIHRoYXQgZGVwaWN0cyBhIHNoYXBlIHBsYWNlbWVudCBib2FyZCwgYSBidWNrZXQgY29udGFpbmluZyBzaGFwZXMgdG8gZ28gb24gdGhlIGJvYXJkLCBhbiBhcmVhIGFuZFxyXG4gKiBwZXJpbWV0ZXIgcmVhZG91dCwgYW5kIGFuIGVyYXNlIGJ1dHRvbi4gIFRoZXNlIGFyZSBjb25zb2xpZGF0ZWQgdG9nZXRoZXIgaW4gdGhpcyBub2RlIHRvIGF2b2lkIGNvZGUgZHVwbGljYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgQnVja2V0RnJvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1Y2tldC9CdWNrZXRGcm9udC5qcyc7XHJcbmltcG9ydCBCdWNrZXRIb2xlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idWNrZXQvQnVja2V0SG9sZS5qcyc7XHJcbmltcG9ydCBFcmFzZXJCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvRXJhc2VyQnV0dG9uLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYXJlYUJ1aWxkZXIgZnJvbSAnLi4vLi4vYXJlYUJ1aWxkZXIuanMnO1xyXG5pbXBvcnQgQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0FyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFNoYXBlQ3JlYXRvck5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU2hhcGVDcmVhdG9yTm9kZS5qcyc7XHJcbmltcG9ydCBTaGFwZU5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU2hhcGVOb2RlLmpzJztcclxuaW1wb3J0IFNoYXBlUGxhY2VtZW50Qm9hcmROb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1NoYXBlUGxhY2VtZW50Qm9hcmROb2RlLmpzJztcclxuaW1wb3J0IEFyZWFBbmRQZXJpbWV0ZXJEaXNwbGF5IGZyb20gJy4vQXJlYUFuZFBlcmltZXRlckRpc3BsYXkuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFNQQUNFX0FST1VORF9TSEFQRV9QTEFDRU1FTlRfQk9BUkQgPSBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5DT05UUk9MU19JTlNFVDtcclxuY29uc3QgSURFTlRJVFlfVFJBTlNGT1JNID0gTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVJZGVudGl0eSgpO1xyXG5jb25zdCBVTklUX1NRVUFSRV9MRU5HVEggPSBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5VTklUX1NRVUFSRV9MRU5HVEg7XHJcbmNvbnN0IFVOSVRfUkVDVEFOR0xFX1NIQVBFID0gU2hhcGUucmVjdCggMCwgMCwgVU5JVF9TUVVBUkVfTEVOR1RILCBVTklUX1NRVUFSRV9MRU5HVEggKTtcclxuY29uc3QgU0hBUEVfQ1JFQVRPUl9PRkZTRVRfUE9TSVRJT05TID0gW1xyXG5cclxuICAvLyBPZmZzZXRzIHVzZWQgZm9yIGluaXRpYWwgcG9zaXRpb24gb2Ygc2hhcGUsIHJlbGF0aXZlIHRvIGJ1Y2tldCBob2xlIGNlbnRlci4gIEVtcGlyaWNhbGx5IGRldGVybWluZWQuXHJcbiAgbmV3IFZlY3RvcjIoIC0yMCAtIFVOSVRfU1FVQVJFX0xFTkdUSCAvIDIsIDAgLSBVTklUX1NRVUFSRV9MRU5HVEggLyAyICksXHJcbiAgbmV3IFZlY3RvcjIoIC0xMCAtIFVOSVRfU1FVQVJFX0xFTkdUSCAvIDIsIC0yIC0gVU5JVF9TUVVBUkVfTEVOR1RIIC8gMiApLFxyXG4gIG5ldyBWZWN0b3IyKCA5IC0gVU5JVF9TUVVBUkVfTEVOR1RIIC8gMiwgMSAtIFVOSVRfU1FVQVJFX0xFTkdUSCAvIDIgKSxcclxuICBuZXcgVmVjdG9yMiggMTggLSBVTklUX1NRVUFSRV9MRU5HVEggLyAyLCAzIC0gVU5JVF9TUVVBUkVfTEVOR1RIIC8gMiApLFxyXG4gIG5ldyBWZWN0b3IyKCAzIC0gVU5JVF9TUVVBUkVfTEVOR1RIIC8gMiwgNSAtIFVOSVRfU1FVQVJFX0xFTkdUSCAvIDIgKVxyXG5dO1xyXG5cclxuY2xhc3MgRXhwbG9yZU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtTaGFwZVBsYWNlbWVudEJvYXJkfSBzaGFwZVBsYWNlbWVudEJvYXJkXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gYWRkU2hhcGVUb01vZGVsIC0gRnVuY3Rpb24gZm9yIGFkZGluZyBhIG5ld2x5IGNyZWF0ZWQgc2hhcGUgdG8gdGhlIG1vZGVsLlxyXG4gICAqIEBwYXJhbSB7T2JzZXJ2YWJsZUFycmF5RGVmfSBtb3ZhYmxlU2hhcGVMaXN0IC0gVGhlIGFycmF5IHRoYXQgdHJhY2tzIHRoZSBtb3ZhYmxlIHNoYXBlcy5cclxuICAgKiBAcGFyYW0ge0J1Y2tldH0gYnVja2V0IC0gTW9kZWwgb2YgdGhlIGJ1Y2tldCB0aGF0IGlzIHRvIGJlIHBvcnRyYXllZFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2hhcGVQbGFjZW1lbnRCb2FyZCwgYWRkU2hhcGVUb01vZGVsLCBtb3ZhYmxlU2hhcGVMaXN0LCBidWNrZXQsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBkcmFnIGJvdW5kcyBmb3IgdGhlIHNoYXBlcyB0aGF0IGNhbiBnbyBvbiB0aGUgYm9hcmRcclxuICAgICAgc2hhcGVEcmFnQm91bmRzOiBCb3VuZHMyLkVWRVJZVEhJTkcsXHJcblxyXG4gICAgICAvLyBBbiBvcHRpb25hbCBsYXllciAoc2NlbmVyeSBub2RlKSBvbiB3aGljaCBtb3ZhYmxlIHNoYXBlcyB3aWxsIGJlIHBsYWNlZC4gIFBhc3NpbmcgaXQgaW4gYWxsb3dzIGl0IHRvIGJlXHJcbiAgICAgIC8vIGNyZWF0ZWQgb3V0c2lkZSB0aGlzIG5vZGUsIHdoaWNoIHN1cHBvcnRzIHNvbWUgbGF5ZXJpbmcgd2hpY2ggaXMgb3RoZXJ3aXNlIG5vdCBwb3NzaWJsZS5cclxuICAgICAgc2hhcGVzTGF5ZXI6IG51bGxcclxuXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gVmVyaWZ5IHRoYXQgdGhlIHNoYXBlIHBsYWNlbWVudCBib2FyZCBpcyBzZXQgdXAgdG8gaGFuZGxlIGEgc3BlY2lmaWMgY29sb3IsIHJhdGhlciB0aGFuIGFsbCBjb2xvcnMsIHNpbmNlIG90aGVyXHJcbiAgICAvLyBjb2RlIGJlbG93IGRlcGVuZHMgb24gdGhpcy5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNoYXBlUGxhY2VtZW50Qm9hcmQuY29sb3JIYW5kbGVkICE9PSAnKicgKTtcclxuICAgIGNvbnN0IHNoYXBlQ29sb3IgPSBDb2xvci50b0NvbG9yKCBzaGFwZVBsYWNlbWVudEJvYXJkLmNvbG9ySGFuZGxlZCApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBub2RlcyB0aGF0IHdpbGwgYmUgdXNlZCB0byBsYXllciB0aGluZ3MgdmlzdWFsbHkuXHJcbiAgICBjb25zdCBiYWNrTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYmFja0xheWVyICk7XHJcbiAgICBsZXQgbW92YWJsZVNoYXBlc0xheWVyO1xyXG4gICAgaWYgKCAhb3B0aW9ucy5zaGFwZXNMYXllciApIHtcclxuICAgICAgbW92YWJsZVNoYXBlc0xheWVyID0gbmV3IE5vZGUoIHsgbGF5ZXJTcGxpdDogdHJ1ZSB9ICk7IC8vIEZvcmNlIHRoZSBtb3Zpbmcgc2hhcGUgaW50byBhIHNlcGFyYXRlIGxheWVyIGZvciBwZXJmb3JtYW5jZSByZWFzb25zLlxyXG4gICAgICB0aGlzLmFkZENoaWxkKCBtb3ZhYmxlU2hhcGVzTGF5ZXIgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBBc3N1bWUgdGhhdCB0aGlzIGxheWVyIHdhcyBhZGRlZCB0byB0aGUgc2NlbmUgZ3JhcGggZWxzZXdoZXJlLCBhbmQgZG9lc24ndCBuZWVkIHRvIGJlIGFkZGVkIGhlcmUuXHJcbiAgICAgIG1vdmFibGVTaGFwZXNMYXllciA9IG9wdGlvbnMuc2hhcGVzTGF5ZXI7XHJcbiAgICB9XHJcbiAgICBjb25zdCBidWNrZXRGcm9udExheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJ1Y2tldEZyb250TGF5ZXIgKTtcclxuICAgIGNvbnN0IHNpbmdsZUJvYXJkQ29udHJvbHNMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzaW5nbGVCb2FyZENvbnRyb2xzTGF5ZXIgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIG5vZGUgdGhhdCByZXByZXNlbnRzIHRoZSBzaGFwZSBwbGFjZW1lbnQgYm9hcmQuICBUaGlzIGlzIHBvc2l0aW9uZWQgYmFzZWQgb24gdGhpcyBtb2RlbCBwb3NpdGlvbiwgYW5kXHJcbiAgICAvLyBhbGwgb3RoZXIgbm9kZXMgKHN1Y2ggYXMgdGhlIGJ1Y2tldCkgYXJlIHBvc2l0aW9uZWQgcmVsYXRpdmUgdG8gdGhpcy5cclxuICAgIGNvbnN0IHNoYXBlUGxhY2VtZW50Qm9hcmROb2RlID0gbmV3IFNoYXBlUGxhY2VtZW50Qm9hcmROb2RlKCBzaGFwZVBsYWNlbWVudEJvYXJkICk7XHJcbiAgICBiYWNrTGF5ZXIuYWRkQ2hpbGQoIHNoYXBlUGxhY2VtZW50Qm9hcmROb2RlICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBhcmVhIGFuZCBwZXJpbWV0ZXIgZGlzcGxheVxyXG4gICAgdGhpcy5hcmVhQW5kUGVyaW1ldGVyRGlzcGxheSA9IG5ldyBBcmVhQW5kUGVyaW1ldGVyRGlzcGxheShcclxuICAgICAgc2hhcGVQbGFjZW1lbnRCb2FyZC5hcmVhQW5kUGVyaW1ldGVyUHJvcGVydHksXHJcbiAgICAgIHNoYXBlQ29sb3IsXHJcbiAgICAgIHNoYXBlQ29sb3IuY29sb3JVdGlsc0RhcmtlciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUEVSSU1FVEVSX0RBUktFTl9GQUNUT1IgKSxcclxuICAgICAge1xyXG4gICAgICAgIGNlbnRlclg6IHNoYXBlUGxhY2VtZW50Qm9hcmROb2RlLmNlbnRlclgsXHJcbiAgICAgICAgYm90dG9tOiBzaGFwZVBsYWNlbWVudEJvYXJkTm9kZS50b3AgLSBTUEFDRV9BUk9VTkRfU0hBUEVfUExBQ0VNRU5UX0JPQVJEXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmFyZWFBbmRQZXJpbWV0ZXJEaXNwbGF5ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBidWNrZXQgdmlldyBlbGVtZW50c1xyXG4gICAgY29uc3QgYnVja2V0RnJvbnQgPSBuZXcgQnVja2V0RnJvbnQoIGJ1Y2tldCwgSURFTlRJVFlfVFJBTlNGT1JNICk7XHJcbiAgICBidWNrZXRGcm9udExheWVyLmFkZENoaWxkKCBidWNrZXRGcm9udCApO1xyXG4gICAgY29uc3QgYnVja2V0SG9sZSA9IG5ldyBCdWNrZXRIb2xlKCBidWNrZXQsIElERU5USVRZX1RSQU5TRk9STSApO1xyXG4gICAgYmFja0xheWVyLmFkZENoaWxkKCBidWNrZXRIb2xlICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBzaGFwZSBjcmVhdG9yIG5vZGVzLiAgVGhlc2UgbXVzdCBiZSBhZGRlZCBhZnRlciB0aGUgYnVja2V0IGhvbGUgZm9yIHByb3BlciBsYXllcmluZy5cclxuICAgIFNIQVBFX0NSRUFUT1JfT0ZGU0VUX1BPU0lUSU9OUy5mb3JFYWNoKCBvZmZzZXQgPT4ge1xyXG4gICAgICBiYWNrTGF5ZXIuYWRkQ2hpbGQoIG5ldyBTaGFwZUNyZWF0b3JOb2RlKCBVTklUX1JFQ1RBTkdMRV9TSEFQRSwgc2hhcGVDb2xvciwgYWRkU2hhcGVUb01vZGVsLCB7XHJcbiAgICAgICAgbGVmdDogYnVja2V0SG9sZS5jZW50ZXJYICsgb2Zmc2V0LngsXHJcbiAgICAgICAgdG9wOiBidWNrZXRIb2xlLmNlbnRlclkgKyBvZmZzZXQueSxcclxuICAgICAgICBzaGFwZURyYWdCb3VuZHM6IG9wdGlvbnMuc2hhcGVEcmFnQm91bmRzXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgYnV0dG9uIHRoYXQgYWxsb3dzIHRoZSBib2FyZCB0byBiZSBjbGVhcmVkIG9mIGFsbCBzaGFwZXMuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgRXJhc2VyQnV0dG9uKCB7XHJcbiAgICAgIHJpZ2h0OiBidWNrZXRGcm9udC5yaWdodCAtIDMsXHJcbiAgICAgIHRvcDogYnVja2V0RnJvbnQuYm90dG9tICsgNSxcclxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiA1LFxyXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDUsXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7IHNoYXBlUGxhY2VtZW50Qm9hcmQucmVsZWFzZUFsbFNoYXBlcyggJ2ZhZGUnICk7IH1cclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIEhhbmRsZSB0aGUgY29taW5ncyBhbmQgZ29pbmdzIG9mIG1vdmFibGUgc2hhcGVzLlxyXG4gICAgbW92YWJsZVNoYXBlTGlzdC5hZGRJdGVtQWRkZWRMaXN0ZW5lciggYWRkZWRTaGFwZSA9PiB7XHJcblxyXG4gICAgICBpZiAoIGFkZGVkU2hhcGUuY29sb3IuZXF1YWxzKCBzaGFwZUNvbG9yICkgKSB7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSB2aWV3IHJlcHJlc2VudGF0aW9uIGZvciB0aGlzIHNoYXBlLlxyXG4gICAgICAgIGNvbnN0IHNoYXBlTm9kZSA9IG5ldyBTaGFwZU5vZGUoIGFkZGVkU2hhcGUsIG9wdGlvbnMuc2hhcGVEcmFnQm91bmRzICk7XHJcbiAgICAgICAgbW92YWJsZVNoYXBlc0xheWVyLmFkZENoaWxkKCBzaGFwZU5vZGUgKTtcclxuXHJcbiAgICAgICAgLy8gTW92ZSB0aGUgc2hhcGUgdG8gdGhlIGZyb250IG9mIHRoaXMgbGF5ZXIgd2hlbiBncmFiYmVkIGJ5IHRoZSB1c2VyLlxyXG4gICAgICAgIGFkZGVkU2hhcGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5saW5rKCB1c2VyQ29udHJvbGxlZCA9PiB7XHJcbiAgICAgICAgICBpZiAoIHVzZXJDb250cm9sbGVkICkge1xyXG4gICAgICAgICAgICBzaGFwZU5vZGUubW92ZVRvRnJvbnQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIC8vIEFkZCB0aGUgcmVtb3ZhbCBsaXN0ZW5lciBmb3IgaWYgYW5kIHdoZW4gdGhpcyBzaGFwZSBpcyByZW1vdmVkIGZyb20gdGhlIG1vZGVsLlxyXG4gICAgICAgIG1vdmFibGVTaGFwZUxpc3QuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggZnVuY3Rpb24gcmVtb3ZhbExpc3RlbmVyKCByZW1vdmVkU2hhcGUgKSB7XHJcbiAgICAgICAgICBpZiAoIHJlbW92ZWRTaGFwZSA9PT0gYWRkZWRTaGFwZSApIHtcclxuICAgICAgICAgICAgbW92YWJsZVNoYXBlc0xheWVyLnJlbW92ZUNoaWxkKCBzaGFwZU5vZGUgKTtcclxuICAgICAgICAgICAgbW92YWJsZVNoYXBlTGlzdC5yZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyKCByZW1vdmFsTGlzdGVuZXIgKTtcclxuICAgICAgICAgICAgc2hhcGVOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuYXJlYUFuZFBlcmltZXRlckRpc3BsYXkucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbmFyZWFCdWlsZGVyLnJlZ2lzdGVyKCAnRXhwbG9yZU5vZGUnLCBFeHBsb3JlTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBFeHBsb3JlTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtB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