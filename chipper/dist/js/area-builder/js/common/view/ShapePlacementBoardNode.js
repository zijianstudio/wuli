// Copyright 2014-2022, University of Colorado Boulder

/**
 * View representation of a ShapePlacementBoard, which is a board (like a whiteboard or bulletin board) where shapes
 * can be placed.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import { Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import Grid from './Grid.js';
import PerimeterShapeNode from './PerimeterShapeNode.js';
class ShapePlacementBoardNode extends Node {
  /**
   * @param {ShapePlacementBoard} shapePlacementBoard
   */
  constructor(shapePlacementBoard) {
    super();

    // Create and add the board itself.
    const board = Rectangle.bounds(shapePlacementBoard.bounds, {
      fill: 'white',
      stroke: 'black'
    });
    this.addChild(board);

    // Create and add the grid
    const grid = new Grid(shapePlacementBoard.bounds, shapePlacementBoard.unitSquareLength, {
      stroke: '#C0C0C0'
    });
    this.addChild(grid);

    // Track and update the grid visibility
    shapePlacementBoard.showGridProperty.linkAttribute(grid, 'visible');

    // Monitor the background shape and add/remove/update it as it changes.
    this.backgroundShape = new PerimeterShapeNode(shapePlacementBoard.backgroundShapeProperty, shapePlacementBoard.bounds, shapePlacementBoard.unitSquareLength, shapePlacementBoard.showDimensionsProperty, shapePlacementBoard.showGridOnBackgroundShapeProperty);
    this.addChild(this.backgroundShape);

    // Monitor the shapes added by the user to the board and create an equivalent shape with no edges for each.  This
    // may seem a little odd - why hide the shapes that the user placed and depict them with essentially the same
    // thing minus the edge stroke?  The reason is that this makes layering and control of visual modes much easier.
    const shapesLayer = new Node();
    this.addChild(shapesLayer);
    shapePlacementBoard.residentShapes.addItemAddedListener(addedShape => {
      if (shapePlacementBoard.formCompositeProperty.get()) {
        // Add a representation of the shape.
        const representation = new Path(addedShape.shape, {
          fill: addedShape.color,
          left: addedShape.positionProperty.get().x,
          top: addedShape.positionProperty.get().y
        });
        shapesLayer.addChild(representation);
        shapePlacementBoard.residentShapes.addItemRemovedListener(function removalListener(removedShape) {
          if (removedShape === addedShape) {
            shapesLayer.removeChild(representation);
            representation.dispose();
            shapePlacementBoard.residentShapes.removeItemRemovedListener(removalListener);
          }
        });
      }
    });

    // Add the perimeter shape, which depicts the exterior and interior perimeters formed by the placed shapes.
    this.addChild(new PerimeterShapeNode(shapePlacementBoard.compositeShapeProperty, shapePlacementBoard.bounds, shapePlacementBoard.unitSquareLength, shapePlacementBoard.showDimensionsProperty, new Property(true) // grid on shape - always shown for the composite shape
    ));
  }
}

areaBuilder.register('ShapePlacementBoardNode', ShapePlacementBoardNode);
export default ShapePlacementBoardNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiYXJlYUJ1aWxkZXIiLCJHcmlkIiwiUGVyaW1ldGVyU2hhcGVOb2RlIiwiU2hhcGVQbGFjZW1lbnRCb2FyZE5vZGUiLCJjb25zdHJ1Y3RvciIsInNoYXBlUGxhY2VtZW50Qm9hcmQiLCJib2FyZCIsImJvdW5kcyIsImZpbGwiLCJzdHJva2UiLCJhZGRDaGlsZCIsImdyaWQiLCJ1bml0U3F1YXJlTGVuZ3RoIiwic2hvd0dyaWRQcm9wZXJ0eSIsImxpbmtBdHRyaWJ1dGUiLCJiYWNrZ3JvdW5kU2hhcGUiLCJiYWNrZ3JvdW5kU2hhcGVQcm9wZXJ0eSIsInNob3dEaW1lbnNpb25zUHJvcGVydHkiLCJzaG93R3JpZE9uQmFja2dyb3VuZFNoYXBlUHJvcGVydHkiLCJzaGFwZXNMYXllciIsInJlc2lkZW50U2hhcGVzIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJhZGRlZFNoYXBlIiwiZm9ybUNvbXBvc2l0ZVByb3BlcnR5IiwiZ2V0IiwicmVwcmVzZW50YXRpb24iLCJzaGFwZSIsImNvbG9yIiwibGVmdCIsInBvc2l0aW9uUHJvcGVydHkiLCJ4IiwidG9wIiwieSIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJyZW1vdmFsTGlzdGVuZXIiLCJyZW1vdmVkU2hhcGUiLCJyZW1vdmVDaGlsZCIsImRpc3Bvc2UiLCJyZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyIiwiY29tcG9zaXRlU2hhcGVQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2hhcGVQbGFjZW1lbnRCb2FyZE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyByZXByZXNlbnRhdGlvbiBvZiBhIFNoYXBlUGxhY2VtZW50Qm9hcmQsIHdoaWNoIGlzIGEgYm9hcmQgKGxpa2UgYSB3aGl0ZWJvYXJkIG9yIGJ1bGxldGluIGJvYXJkKSB3aGVyZSBzaGFwZXNcclxuICogY2FuIGJlIHBsYWNlZC5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUGF0aCwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGFyZWFCdWlsZGVyIGZyb20gJy4uLy4uL2FyZWFCdWlsZGVyLmpzJztcclxuaW1wb3J0IEdyaWQgZnJvbSAnLi9HcmlkLmpzJztcclxuaW1wb3J0IFBlcmltZXRlclNoYXBlTm9kZSBmcm9tICcuL1BlcmltZXRlclNoYXBlTm9kZS5qcyc7XHJcblxyXG5jbGFzcyBTaGFwZVBsYWNlbWVudEJvYXJkTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1NoYXBlUGxhY2VtZW50Qm9hcmR9IHNoYXBlUGxhY2VtZW50Qm9hcmRcclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2hhcGVQbGFjZW1lbnRCb2FyZCApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGFuZCBhZGQgdGhlIGJvYXJkIGl0c2VsZi5cclxuICAgIGNvbnN0IGJvYXJkID0gUmVjdGFuZ2xlLmJvdW5kcyggc2hhcGVQbGFjZW1lbnRCb2FyZC5ib3VuZHMsIHsgZmlsbDogJ3doaXRlJywgc3Ryb2tlOiAnYmxhY2snIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJvYXJkICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGFuZCBhZGQgdGhlIGdyaWRcclxuICAgIGNvbnN0IGdyaWQgPSBuZXcgR3JpZCggc2hhcGVQbGFjZW1lbnRCb2FyZC5ib3VuZHMsIHNoYXBlUGxhY2VtZW50Qm9hcmQudW5pdFNxdWFyZUxlbmd0aCwgeyBzdHJva2U6ICcjQzBDMEMwJyB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBncmlkICk7XHJcblxyXG4gICAgLy8gVHJhY2sgYW5kIHVwZGF0ZSB0aGUgZ3JpZCB2aXNpYmlsaXR5XHJcbiAgICBzaGFwZVBsYWNlbWVudEJvYXJkLnNob3dHcmlkUHJvcGVydHkubGlua0F0dHJpYnV0ZSggZ3JpZCwgJ3Zpc2libGUnICk7XHJcblxyXG4gICAgLy8gTW9uaXRvciB0aGUgYmFja2dyb3VuZCBzaGFwZSBhbmQgYWRkL3JlbW92ZS91cGRhdGUgaXQgYXMgaXQgY2hhbmdlcy5cclxuICAgIHRoaXMuYmFja2dyb3VuZFNoYXBlID0gbmV3IFBlcmltZXRlclNoYXBlTm9kZShcclxuICAgICAgc2hhcGVQbGFjZW1lbnRCb2FyZC5iYWNrZ3JvdW5kU2hhcGVQcm9wZXJ0eSxcclxuICAgICAgc2hhcGVQbGFjZW1lbnRCb2FyZC5ib3VuZHMsXHJcbiAgICAgIHNoYXBlUGxhY2VtZW50Qm9hcmQudW5pdFNxdWFyZUxlbmd0aCxcclxuICAgICAgc2hhcGVQbGFjZW1lbnRCb2FyZC5zaG93RGltZW5zaW9uc1Byb3BlcnR5LFxyXG4gICAgICBzaGFwZVBsYWNlbWVudEJvYXJkLnNob3dHcmlkT25CYWNrZ3JvdW5kU2hhcGVQcm9wZXJ0eVxyXG4gICAgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuYmFja2dyb3VuZFNoYXBlICk7XHJcblxyXG4gICAgLy8gTW9uaXRvciB0aGUgc2hhcGVzIGFkZGVkIGJ5IHRoZSB1c2VyIHRvIHRoZSBib2FyZCBhbmQgY3JlYXRlIGFuIGVxdWl2YWxlbnQgc2hhcGUgd2l0aCBubyBlZGdlcyBmb3IgZWFjaC4gIFRoaXNcclxuICAgIC8vIG1heSBzZWVtIGEgbGl0dGxlIG9kZCAtIHdoeSBoaWRlIHRoZSBzaGFwZXMgdGhhdCB0aGUgdXNlciBwbGFjZWQgYW5kIGRlcGljdCB0aGVtIHdpdGggZXNzZW50aWFsbHkgdGhlIHNhbWVcclxuICAgIC8vIHRoaW5nIG1pbnVzIHRoZSBlZGdlIHN0cm9rZT8gIFRoZSByZWFzb24gaXMgdGhhdCB0aGlzIG1ha2VzIGxheWVyaW5nIGFuZCBjb250cm9sIG9mIHZpc3VhbCBtb2RlcyBtdWNoIGVhc2llci5cclxuICAgIGNvbnN0IHNoYXBlc0xheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNoYXBlc0xheWVyICk7XHJcbiAgICBzaGFwZVBsYWNlbWVudEJvYXJkLnJlc2lkZW50U2hhcGVzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBhZGRlZFNoYXBlID0+IHtcclxuICAgICAgaWYgKCBzaGFwZVBsYWNlbWVudEJvYXJkLmZvcm1Db21wb3NpdGVQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgICAgLy8gQWRkIGEgcmVwcmVzZW50YXRpb24gb2YgdGhlIHNoYXBlLlxyXG4gICAgICAgIGNvbnN0IHJlcHJlc2VudGF0aW9uID0gbmV3IFBhdGgoIGFkZGVkU2hhcGUuc2hhcGUsIHtcclxuICAgICAgICAgIGZpbGw6IGFkZGVkU2hhcGUuY29sb3IsXHJcbiAgICAgICAgICBsZWZ0OiBhZGRlZFNoYXBlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCxcclxuICAgICAgICAgIHRvcDogYWRkZWRTaGFwZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLnlcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgc2hhcGVzTGF5ZXIuYWRkQ2hpbGQoIHJlcHJlc2VudGF0aW9uICk7XHJcblxyXG4gICAgICAgIHNoYXBlUGxhY2VtZW50Qm9hcmQucmVzaWRlbnRTaGFwZXMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggZnVuY3Rpb24gcmVtb3ZhbExpc3RlbmVyKCByZW1vdmVkU2hhcGUgKSB7XHJcbiAgICAgICAgICBpZiAoIHJlbW92ZWRTaGFwZSA9PT0gYWRkZWRTaGFwZSApIHtcclxuICAgICAgICAgICAgc2hhcGVzTGF5ZXIucmVtb3ZlQ2hpbGQoIHJlcHJlc2VudGF0aW9uICk7XHJcbiAgICAgICAgICAgIHJlcHJlc2VudGF0aW9uLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgc2hhcGVQbGFjZW1lbnRCb2FyZC5yZXNpZGVudFNoYXBlcy5yZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyKCByZW1vdmFsTGlzdGVuZXIgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIHBlcmltZXRlciBzaGFwZSwgd2hpY2ggZGVwaWN0cyB0aGUgZXh0ZXJpb3IgYW5kIGludGVyaW9yIHBlcmltZXRlcnMgZm9ybWVkIGJ5IHRoZSBwbGFjZWQgc2hhcGVzLlxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFBlcmltZXRlclNoYXBlTm9kZShcclxuICAgICAgc2hhcGVQbGFjZW1lbnRCb2FyZC5jb21wb3NpdGVTaGFwZVByb3BlcnR5LFxyXG4gICAgICBzaGFwZVBsYWNlbWVudEJvYXJkLmJvdW5kcyxcclxuICAgICAgc2hhcGVQbGFjZW1lbnRCb2FyZC51bml0U3F1YXJlTGVuZ3RoLFxyXG4gICAgICBzaGFwZVBsYWNlbWVudEJvYXJkLnNob3dEaW1lbnNpb25zUHJvcGVydHksXHJcbiAgICAgIG5ldyBQcm9wZXJ0eSggdHJ1ZSApIC8vIGdyaWQgb24gc2hhcGUgLSBhbHdheXMgc2hvd24gZm9yIHRoZSBjb21wb3NpdGUgc2hhcGVcclxuICAgICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmFyZWFCdWlsZGVyLnJlZ2lzdGVyKCAnU2hhcGVQbGFjZW1lbnRCb2FyZE5vZGUnLCBTaGFwZVBsYWNlbWVudEJvYXJkTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBTaGFwZVBsYWNlbWVudEJvYXJkTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxTQUFTLFFBQVEsbUNBQW1DO0FBQ3pFLE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7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