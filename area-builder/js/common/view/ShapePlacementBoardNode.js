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
  constructor( shapePlacementBoard ) {
    super();

    // Create and add the board itself.
    const board = Rectangle.bounds( shapePlacementBoard.bounds, { fill: 'white', stroke: 'black' } );
    this.addChild( board );

    // Create and add the grid
    const grid = new Grid( shapePlacementBoard.bounds, shapePlacementBoard.unitSquareLength, { stroke: '#C0C0C0' } );
    this.addChild( grid );

    // Track and update the grid visibility
    shapePlacementBoard.showGridProperty.linkAttribute( grid, 'visible' );

    // Monitor the background shape and add/remove/update it as it changes.
    this.backgroundShape = new PerimeterShapeNode(
      shapePlacementBoard.backgroundShapeProperty,
      shapePlacementBoard.bounds,
      shapePlacementBoard.unitSquareLength,
      shapePlacementBoard.showDimensionsProperty,
      shapePlacementBoard.showGridOnBackgroundShapeProperty
    );
    this.addChild( this.backgroundShape );

    // Monitor the shapes added by the user to the board and create an equivalent shape with no edges for each.  This
    // may seem a little odd - why hide the shapes that the user placed and depict them with essentially the same
    // thing minus the edge stroke?  The reason is that this makes layering and control of visual modes much easier.
    const shapesLayer = new Node();
    this.addChild( shapesLayer );
    shapePlacementBoard.residentShapes.addItemAddedListener( addedShape => {
      if ( shapePlacementBoard.formCompositeProperty.get() ) {

        // Add a representation of the shape.
        const representation = new Path( addedShape.shape, {
          fill: addedShape.color,
          left: addedShape.positionProperty.get().x,
          top: addedShape.positionProperty.get().y
        } );
        shapesLayer.addChild( representation );

        shapePlacementBoard.residentShapes.addItemRemovedListener( function removalListener( removedShape ) {
          if ( removedShape === addedShape ) {
            shapesLayer.removeChild( representation );
            representation.dispose();
            shapePlacementBoard.residentShapes.removeItemRemovedListener( removalListener );
          }
        } );
      }
    } );

    // Add the perimeter shape, which depicts the exterior and interior perimeters formed by the placed shapes.
    this.addChild( new PerimeterShapeNode(
      shapePlacementBoard.compositeShapeProperty,
      shapePlacementBoard.bounds,
      shapePlacementBoard.unitSquareLength,
      shapePlacementBoard.showDimensionsProperty,
      new Property( true ) // grid on shape - always shown for the composite shape
    ) );
  }
}

areaBuilder.register( 'ShapePlacementBoardNode', ShapePlacementBoardNode );
export default ShapePlacementBoardNode;