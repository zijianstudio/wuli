// Copyright 2014-2022, University of Colorado Boulder

/**
 * A Scenery node that can be clicked upon to create new movable shapes in the model.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color, DragListener, Node, Path } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../AreaBuilderSharedConstants.js';
import MovableShape from '../model/MovableShape.js';
import Grid from './Grid.js';

// constants
const BORDER_LINE_WIDTH = 1;

class ShapeCreatorNode extends Node {

  /**
   * @param {Shape} shape
   * @param {string|Color} color
   * @param {function(MovableShape)} addShapeToModel - A function for adding the created shape to the model
   * @param {Object} [options]
   */
  constructor( shape, color, addShapeToModel, options ) {
    assert && assert( shape.bounds.minX === 0 && shape.bounds.minY === 0, 'Error: Shape is expected to be located at 0, 0' );
    super( { cursor: 'pointer' } );

    options = merge( {

      // Spacing of the grid, if any, that should be shown on the creator node.  Null indicates no grid.
      gridSpacing: null,

      // Max number of shapes that can be created by this node.
      creationLimit: Number.POSITIVE_INFINITY,

      // Drag bounds for the created shapes.
      shapeDragBounds: Bounds2.EVERYTHING,

      // This is a node that is or will be somewhere up the scene graph tree from this ShapeCreatorNode, doesn't move,
      // and whose parent has the coordinate frame needed to do the appropriate transformations when the a drag takes
      // place on this ShapeCreatorNode. This is needed in cases where the ShapeCreatorNode can be moved while a drag
      // of a created node is still in progress.  This can occur when the ShapeCreatorNode is placed on a carousel and
      // the sim is being used in a multi-touch environment.  See https://github.com/phetsims/area-builder/issues/95 for
      // more information.
      nonMovingAncestor: null
    }, options );

    // parameter check
    if ( options.creationLimit < Number.POSITIVE_INFINITY &&
         ( shape.bounds.width !== AreaBuilderSharedConstants.UNIT_SQUARE_LENGTH ||
           shape.bounds.height !== AreaBuilderSharedConstants.UNIT_SQUARE_LENGTH ) ) {

      // The ability to set a creation limit ONLY works for unit squares.  The reason for this is that non-unit shapes
      // are generally decomposed into unit squares when added to the placement board, so it's hard to track when they
      // get returned to their origin.  It would be possible to do this, but the requirements of the sim at the time of
      // this writing make it unnecessary.  So, if you're hitting this exception, the code may need to be revamped to
      // support creation limits for shapes that are not unit squares.
      throw new Error( 'Creation limit is only supported for unit squares.' );
    }

    // Create the node that the user will click upon to add a model element to the view.
    const representation = new Path( shape, {
      fill: color,
      stroke: Color.toColor( color ).colorUtilsDarker( AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR ),
      lineWidth: BORDER_LINE_WIDTH,
      lineJoin: 'round'
    } );
    this.addChild( representation );

    // Add grid if specified.
    if ( options.gridSpacing ) {
      const gridNode = new Grid( representation.bounds.dilated( -BORDER_LINE_WIDTH ), options.gridSpacing, {
        lineDash: [ 0, 3, 1, 0 ],
        stroke: 'black'
      } );
      this.addChild( gridNode );
    }

    const createdCountProperty = new Property( 0 ); // Used to track the number of shapes created and not returned.

    // If the created count exceeds the max, make this node invisible (which also makes it unusable).
    createdCountProperty.link( numCreated => {
      this.visible = numCreated < options.creationLimit;
    } );

    // variables used by the drag handler
    let parentScreenView = null; // needed for coordinate transforms
    let movableShape;
    let dragOffset;

    // Adjust the drag bounds to compensate for the shape that that the entire shape will stay in bounds.
    const shapeDragBounds = options.shapeDragBounds.copy();
    shapeDragBounds.setMaxX( shapeDragBounds.maxX - shape.bounds.width );
    shapeDragBounds.setMaxY( shapeDragBounds.maxY - shape.bounds.height );

    // Enclose the drag bounds in a Property so that it can be used in the drag handler.
    const dragBoundsProperty = new Property( shapeDragBounds );

    // Add the listener that will allow the user to click on this and create a new shape, then position it in the model.
    const dragListener = new DragListener( {

      dragBoundsProperty: dragBoundsProperty,
      targetNode: options.nonMovingAncestor,

      // Allow moving a finger (touch) across this node to interact with it
      allowTouchSnag: true,

      start: event => {
        if ( !parentScreenView ) {

          // Find the parent screen view by moving up the scene graph.
          let testNode = this.parents[ 0 ];
          while ( testNode !== null ) {
            if ( testNode instanceof ScreenView ) {
              parentScreenView = testNode;
              break;
            }
            testNode = testNode.parents[ 0 ]; // move up the scene graph by one level
          }
          assert && assert( parentScreenView, 'unable to find parent screen view' );
        }

        // Determine the initial position of the new element as a function of the event position and this node's bounds.
        const upperLeftCornerGlobal = this.parentToGlobalPoint( this.leftTop );
        dragOffset = upperLeftCornerGlobal.minus( event.pointer.point );
        const initialPosition = parentScreenView.globalToLocalPoint( event.pointer.point.plus( dragOffset ) );

        // Create and add the new model element.
        movableShape = new MovableShape( shape, color, initialPosition );
        movableShape.userControlledProperty.set( true );
        addShapeToModel( movableShape );

        // If the creation count is limited, adjust the value and monitor the created shape for if/when it is returned.
        if ( options.creationLimit < Number.POSITIVE_INFINITY ) {

          // Use an IIFE to keep a reference of the movable shape in a closure.
          ( () => {
            createdCountProperty.value++;
            const localRefToMovableShape = movableShape;
            localRefToMovableShape.returnedToOriginEmitter.addListener( function returnedToOriginListener() {
              if ( !localRefToMovableShape.userControlledProperty.get() ) {

                // The shape has been returned to its origin.
                createdCountProperty.value--;
                localRefToMovableShape.returnedToOriginEmitter.removeListener( returnedToOriginListener );
              }
            } );
          } )();
        }
      },

      drag: event => {
        assert && assert( movableShape, 'no movable shape for drag' );
        movableShape.positionProperty.set( parentScreenView.globalToLocalPoint( event.pointer.point.plus( dragOffset ) ) );
      },

      end: () => {
        movableShape.userControlledProperty.set( false );
        movableShape = null;
      }
    } );
    this.addInputListener( dragListener );

    // Pass options through to parent.
    this.mutate( options );

    // @private
    this.disposeShapeCreatorNode = () => {
      dragListener.dispose();
    };
  }

  /**
   * release memory references
   * @public
   */
  dispose() {
    this.disposeShapeCreatorNode();
    super.dispose();
  }
}

areaBuilder.register( 'ShapeCreatorNode', ShapeCreatorNode );
export default ShapeCreatorNode;