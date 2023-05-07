// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model of a rectangular board (like a white board or bulletin board) upon which various smaller shapes can be placed.
 *
 * @author John Blanco
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import { Color } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../AreaBuilderSharedConstants.js';
import PerimeterShape from './PerimeterShape.js';

// constants
const MOVEMENT_VECTORS = {
  // This sim is using screen conventions, meaning positive Y indicates down.
  up: new Vector2( 0, -1 ),
  down: new Vector2( 0, 1 ),
  left: new Vector2( -1, 0 ),
  right: new Vector2( 1, 0 )
};

// Functions used for scanning the edge of the perimeter.  These are a key component of the "marching squares"
// algorithm that is used for perimeter traversal, see the function where they are used for more information.
const SCAN_AREA_MOVEMENT_FUNCTIONS = [
  null,                                            // 0
  () => MOVEMENT_VECTORS.up,      // 1
  () => MOVEMENT_VECTORS.right,   // 2
  () => MOVEMENT_VECTORS.right,   // 3
  () => MOVEMENT_VECTORS.left,    // 4
  () => MOVEMENT_VECTORS.up,      // 5
  previousStep => previousStep === MOVEMENT_VECTORS.up ? MOVEMENT_VECTORS.left : MOVEMENT_VECTORS.right,  // 6
  () => MOVEMENT_VECTORS.right,   // 7
  () => MOVEMENT_VECTORS.down,    // 8
  previousStep => previousStep === MOVEMENT_VECTORS.right ? MOVEMENT_VECTORS.up : MOVEMENT_VECTORS.down,  // 9
  () => MOVEMENT_VECTORS.down,   // 10
  () => MOVEMENT_VECTORS.down,   // 11
  () => MOVEMENT_VECTORS.left,   // 12
  () => MOVEMENT_VECTORS.up,     // 13
  () => MOVEMENT_VECTORS.left,   // 14
  null                           // 15
];

class ShapePlacementBoard {

  /**
   * @param {Dimension2} size
   * @param {number} unitSquareLength
   * @param {Vector2} position
   * @param {string || Color} colorHandled A string or Color object, can be wildcard string ('*') for all colors
   * @param {Property.<boolean>} showGridProperty
   * @param {Property.<boolean>} showDimensionsProperty
   */
  constructor( size, unitSquareLength, position, colorHandled, showGridProperty, showDimensionsProperty ) {

    // The size should be an integer number of unit squares for both dimensions.
    assert && assert( size.width % unitSquareLength === 0 && size.height % unitSquareLength === 0,
      'ShapePlacementBoard dimensions must be integral numbers of unit square dimensions' );

    this.showGridProperty = showGridProperty;
    this.showDimensionsProperty = showDimensionsProperty;

    // Set the initial fill and edge colors for the composite shape (defined in Property declarations below).
    this.compositeShapeFillColor = colorHandled === '*' ? new Color( AreaBuilderSharedConstants.GREENISH_COLOR ) : Color.toColor( colorHandled );
    this.compositeShapeEdgeColor = this.compositeShapeFillColor.colorUtilsDarker( AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR );

    // @public boolean Read/Write value that controls whether the placement board moves individual shapes that are
    // added to the board such that they form a single, contiguous, composite shape, or if it just snaps them to the
    // grid. The perimeter and area values are only updated when this is set to true.
    this.formCompositeProperty = new Property( true );

    // @public Read-only property that indicates the area and perimeter of the composite shape.  These must be
    // together in an object so that they can be updated simultaneously, otherwise race conditions can occur when
    // evaluating challenges.
    this.areaAndPerimeterProperty = new Property( {
      area: 0, // {number||string} - number when valid, string when invalid
      perimeter: 0  // {number||string} number when valid, string when invalid
    } );

    // @public Read-only shape defined in terms of perimeter points that describes the composite shape created by all
    // of the individual shapes placed on the board by the user.
    this.compositeShapeProperty = new Property( new PerimeterShape( [], [], unitSquareLength, {
      fillColor: this.compositeShapeFillColor,
      edgeColor: this.compositeShapeEdgeColor
    } ) );

    // @public Read-only shape that can be placed on the board, generally as a template over which the user can add
    // other shapes.  The shape is positioned relative to this board, not in absolute model space.  It should be
    // set through the method provided on this class rather than directly.
    this.backgroundShapeProperty = new Property(
      new PerimeterShape( [], [], unitSquareLength, { fillColor: 'black' } )
    );

    // @public Read/write value for controlling whether the background shape should show a grid when portrayed in the
    // view.
    this.showGridOnBackgroundShapeProperty = new Property( false );

    // Observable array of the shapes that have been placed on this board.
    this.residentShapes = createObservableArray(); // @public, read only

    // Non-dynamic public values.
    this.unitSquareLength = unitSquareLength; // @public
    this.bounds = new Bounds2( position.x, position.y, position.x + size.width, position.y + size.height ); // @public
    this.colorHandled = colorHandled === '*' ? colorHandled : Color.toColor( colorHandled ); // @public

    // Private variables
    this.numRows = size.height / unitSquareLength; // @private
    this.numColumns = size.width / unitSquareLength; // @private
    this.incomingShapes = []; // @private, {Array.<MovableShape>}, list of shapes that are animating to a spot on this board but aren't here yet
    this.updatesSuspended = false; // @private, used to improve performance when adding a bunch of shapes at once to the board

    // For efficiency and simplicity in evaluating the interior and exterior perimeter, identifying orphaned shapes,
    // and so forth, a 2D array is used to track various state information about the 'cells' that correspond to the
    // positions on this board where shapes may be placed.
    this.cells = []; //@private
    for ( let column = 0; column < this.numColumns; column++ ) {
      const currentRow = [];
      for ( let row = 0; row < this.numRows; row++ ) {
        // Add an object that defines the information internally tracked for each cell.
        currentRow.push( {
          column: column,
          row: row,
          occupiedBy: null,   // the shape occupying this cell, null if none
          cataloged: false,   // used by group identification algorithm
          catalogedBy: null   // used by group identification algorithm
        } );
      }
      this.cells.push( currentRow );
    }
  }

  // @private
  shapeOverlapsBoard( shape ) {
    const shapePosition = shape.positionProperty.get();
    const shapeBounds = new Bounds2(
      shapePosition.x,
      shapePosition.y,
      shapePosition.x + shape.shape.bounds.getWidth(),
      shapePosition.y + shape.shape.bounds.getHeight()
    );
    return this.bounds.intersectsBounds( shapeBounds );
  }

  /**
   * Place the provide shape on this board.  Returns false if the color does not match the handled color or if the
   * shape is not partially over the board.
   * @public
   * @param {MovableShape} movableShape A model shape
   */
  placeShape( movableShape ) {
    assert && assert(
      movableShape.userControlledProperty.get() === false,
      'Shapes can\'t be placed when still controlled by user.'
    );
    // Only place the shape if it is of the correct color and is positioned so that it overlaps with the board.
    if ( ( this.colorHandled !== '*' && !movableShape.color.equals( this.colorHandled ) ) || !this.shapeOverlapsBoard( movableShape ) ) {
      return false;
    }

    // Set the shape's visibility behavior based on whether a composite shape is being depicted.
    movableShape.invisibleWhenStillProperty.set( this.formCompositeProperty.get() );

    // Determine where to place the shape on the board.
    let placementPosition = null;
    for ( let surroundingPointsLevel = 0;
          surroundingPointsLevel < Math.max( this.numRows, this.numColumns ) && placementPosition === null;
          surroundingPointsLevel++ ) {

      const surroundingPoints = this.getOuterSurroundingPoints(
        movableShape.positionProperty.get(),
        surroundingPointsLevel
      );
      surroundingPoints.sort( ( p1, p2 ) => p1.distance( movableShape.positionProperty.get() ) - p2.distance( movableShape.positionProperty.get() ) );
      for ( let pointIndex = 0; pointIndex < surroundingPoints.length && placementPosition === null; pointIndex++ ) {
        if ( this.isValidToPlace( movableShape, surroundingPoints[ pointIndex ] ) ) {
          placementPosition = surroundingPoints[ pointIndex ];
        }
      }
    }
    if ( placementPosition === null ) {
      // No valid position found - bail out.
      return false;
    }

    // add this shape to the list of incoming shapes
    this.addIncomingShape( movableShape, placementPosition, true );

    // If we made it to here, placement succeeded.
    return true;
  }

  /**
   * Add a shape directly to the specified cell.  This bypasses the placement process, and is generally used when
   * displaying solutions to challenges.  The shape will animate to the chosen cell.
   * @public
   * @param cellColumn
   * @param cellRow
   * @param movableShape
   */
  addShapeDirectlyToCell( cellColumn, cellRow, movableShape ) {

    // Set the shape's visibility behavior based on whether a composite shape is being depicted.
    movableShape.invisibleWhenStillProperty.set( this.formCompositeProperty.get() );

    // Add the shape by putting it on the list of incoming shapes and setting its destination.
    this.addIncomingShape( movableShape, this.cellToModelCoords( cellColumn, cellRow, false ) );
  }

  /**
   * Get the proportion of area that match the provided color.
   * @param color
   * @public
   */
  getProportionOfColor( color ) {
    const compareColor = Color.toColor( color );
    let totalArea = 0;
    let areaOfSpecifiedColor = 0;
    this.residentShapes.forEach( residentShape => {
      const areaOfShape = residentShape.shape.bounds.width * residentShape.shape.bounds.height / ( this.unitSquareLength * this.unitSquareLength );
      totalArea += areaOfShape;
      if ( compareColor.equals( residentShape.color ) ) {
        areaOfSpecifiedColor += areaOfShape;
      }
    } );

    const proportion = new Fraction( areaOfSpecifiedColor, totalArea );
    proportion.reduce();
    return proportion;
  }

  // @private, add a shape to the list of residents and make the other updates that go along with this.
  addResidentShape( movableShape, releaseOrphans ) {

    // Make sure that the shape is not moving
    assert && assert(
      movableShape.positionProperty.get().equals( movableShape.destination ),
      'Error: Shapes should not become residents until they have completed animating.'
    );

    // Made sure that the shape isn't already a resident.
    assert && assert( !this.isResidentShape( movableShape ), 'Error: Attempt to add shape that is already a resident.' );

    this.residentShapes.push( movableShape );

    // Make the appropriate updates.
    this.updateCellOccupation( movableShape, 'add' );
    if ( releaseOrphans ) {
      this.releaseAnyOrphans();
    }
    this.updateAll();
  }

  //@private, remove the specified shape from the shape placement board
  removeResidentShape( movableShape ) {
    assert && assert( this.isResidentShape( movableShape ), 'Error: Attempt to remove shape that is not a resident.' );
    const self = this;
    this.residentShapes.remove( movableShape );
    this.updateCellOccupation( movableShape, 'remove' );
    this.updateAll();

    if ( movableShape.userControlledProperty.get() ) {

      // Watch the shape so that we can do needed updates when the user releases it.
      movableShape.userControlledProperty.lazyLink( function releaseOrphansIfDroppedOfBoard( userControlled ) {
        assert && assert( !userControlled, 'Unexpected transition of userControlled flag.' );
        if ( !self.shapeOverlapsBoard( movableShape ) ) {
          // This shape isn't coming back, so we need to trigger an orphan release.
          self.releaseAnyOrphans();
          self.updateAll();
        }
        movableShape.userControlledProperty.unlink( releaseOrphansIfDroppedOfBoard );
      } );
    }
  }

  // @private, add the shape to the list of incoming shapes and set up a listener to move it to resident shapes
  addIncomingShape( movableShape, destination, releaseOrphans ) {

    const self = this;

    movableShape.setDestination( destination, true );

    // The remaining code in this method assumes that the shape is animating to the new position, and will cause
    // odd results if it isn't, so we double check it here.
    assert && assert( movableShape.animatingProperty.get(), 'Shape is is expected to be animating' );

    // The shape is moving to a spot on the board.  We don't want to add it to the list of resident shapes yet, or we
    // may trigger a change to the exterior and interior perimeters, but we need to keep a reference to it so that
    // the valid placement positions can be updated, especially in multi-touch environments.  So, basically, there is
    // an intermediate 'holding place' for incoming shapes.
    this.incomingShapes.push( movableShape );

    // Create a listener that will move this shape from the incoming shape list to the resident list once the
    // animation completes.
    function animationCompleteListener( animating ) {
      if ( !animating ) {
        // Move the shape from the incoming list to the resident list.
        self.incomingShapes.splice( self.incomingShapes.indexOf( movableShape ), 1 );
        self.addResidentShape( movableShape, releaseOrphans );
        movableShape.animatingProperty.unlink( animationCompleteListener );
        if ( self.updatesSuspended && self.incomingShapes.length === 0 ) {
          // updates had been suspended (for better performance), and the last incoming shapes was added, so resume updates
          self.updatesSuspended = false;
          self.updateAll();
        }
      }

      // Set up a listener to remove this shape if and when the user grabs it.
      self.addRemovalListener( movableShape );
    }

    // Tag the listener so that it can be removed without firing if needed, such as when the board is cleared.
    this.tagListener( animationCompleteListener );

    // Hook up the listener.
    movableShape.animatingProperty.lazyLink( animationCompleteListener );
  }


  // @private, tag a listener for removal
  tagListener( listener ) {
    listener.shapePlacementBoard = this;
  }

  // @private, check if listener function was tagged by this instance
  listenerTagMatches( listener ) {
    return ( listener.shapePlacementBoard && listener.shapePlacementBoard === this );
  }

  // TODO: This is rather ugly.  Work with SR to improve or find alternative, or to bake into Axon.  Maybe a map.
  // @private, remove all observers from a property that have been tagged by this shape placement board.
  removeTaggedObservers( property ) {
    const taggedObservers = [];
    property.forEachListener( observer => {
      if ( this.listenerTagMatches( observer ) ) {
        taggedObservers.push( observer );
      }
    } );
    taggedObservers.forEach( taggedObserver => {
      property.unlink( taggedObserver );
    } );
  }

  // @private Convenience function for returning a cell or null if row or column are out of range.
  getCell( column, row ) {
    if ( column < 0 || row < 0 || column >= this.numColumns || row >= this.numRows ) {
      return null;
    }
    return this.cells[ column ][ row ];
  }

  // @private Function for getting the occupant of the specified cell, does bounds checking.
  getCellOccupant( column, row ) {
    const cell = this.getCell( column, row );
    return cell ? cell.occupiedBy : null;
  }

  /**
   * Set or clear the occupation status of the cells.
   * @param movableShape
   * @param operation
   * @private
   */
  updateCellOccupation( movableShape, operation ) {
    const xIndex = Utils.roundSymmetric( ( movableShape.destination.x - this.bounds.minX ) / this.unitSquareLength );
    const yIndex = Utils.roundSymmetric( ( movableShape.destination.y - this.bounds.minY ) / this.unitSquareLength );

    // Mark all cells occupied by this shape.
    for ( let row = 0; row < movableShape.shape.bounds.height / this.unitSquareLength; row++ ) {
      for ( let column = 0; column < movableShape.shape.bounds.width / this.unitSquareLength; column++ ) {
        this.cells[ xIndex + column ][ yIndex + row ].occupiedBy = operation === 'add' ? movableShape : null;
      }
    }
  }

  // @private
  updateAreaAndTotalPerimeter() {
    if ( this.compositeShapeProperty.get().exteriorPerimeters.length <= 1 ) {
      let totalArea = 0;
      this.residentShapes.forEach( residentShape => {
        totalArea += residentShape.shape.bounds.width * residentShape.shape.bounds.height / ( this.unitSquareLength * this.unitSquareLength );
      } );
      let totalPerimeter = 0;
      this.compositeShapeProperty.get().exteriorPerimeters.forEach( exteriorPerimeter => {
        totalPerimeter += exteriorPerimeter.length;
      } );
      this.compositeShapeProperty.get().interiorPerimeters.forEach( interiorPerimeter => {
        totalPerimeter += interiorPerimeter.length;
      } );
      this.areaAndPerimeterProperty.set( {
        area: totalArea,
        perimeter: totalPerimeter
      } );
    }
    else {
      // Area and perimeter readings are currently invalid.
      this.areaAndPerimeterProperty.set( {
        area: AreaBuilderSharedConstants.INVALID_VALUE,
        perimeter: AreaBuilderSharedConstants.INVALID_VALUE
      } );
    }
  }

  /**
   * Convenience function for finding out whether a cell is occupied that handles out of bounds case (returns false).
   * @private
   * @param column
   * @param row
   */
  isCellOccupied( column, row ) {
    if ( column >= this.numColumns || column < 0 || row >= this.numRows || row < 0 ) {
      return false;
    }
    else {
      return this.cells[ column ][ row ].occupiedBy !== null;
    }
  }

  /**
   * Function that returns true if a cell is occupied or if an incoming shape is heading for it.
   * @private
   * @param column
   * @param row
   */
  isCellOccupiedNowOrSoon( column, row ) {
    if ( this.isCellOccupied( column, row ) ) {
      return true;
    }
    for ( let i = 0; i < this.incomingShapes.length; i++ ) {
      const targetCell = this.modelToCellVector( this.incomingShapes[ i ].destination );
      const normalizedWidth = Utils.roundSymmetric( this.incomingShapes[ i ].shape.bounds.width / this.unitSquareLength );
      const normalizedHeight = Utils.roundSymmetric( this.incomingShapes[ i ].shape.bounds.height / this.unitSquareLength );
      if ( column >= targetCell.x && column < targetCell.x + normalizedWidth &&
           row >= targetCell.y && row < targetCell.y + normalizedHeight ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the outer layer of grid points surrounding the given point.  The 2nd parameter indicates how many steps away
   * from the center 'shell' should be provided.
   * @private
   * @param point
   * @param levelsRemoved
   */
  getOuterSurroundingPoints( point, levelsRemoved ) {
    const normalizedPoints = [];

    // Get the closest point in cell coordinates.
    const normalizedStartingPoint = new Vector2(
      Math.floor( ( point.x - this.bounds.minX ) / this.unitSquareLength ) - levelsRemoved,
      Math.floor( ( point.y - this.bounds.minY ) / this.unitSquareLength ) - levelsRemoved
    );

    const squareSize = ( levelsRemoved + 1 ) * 2;

    for ( let row = 0; row < squareSize; row++ ) {
      for ( let column = 0; column < squareSize; column++ ) {
        if ( ( row === 0 || row === squareSize - 1 || column === 0 || column === squareSize - 1 ) &&
             ( column + normalizedStartingPoint.x <= this.numColumns && row + normalizedStartingPoint.y <= this.numRows ) ) {
          // This is an outer point, and is valid, so include it.
          normalizedPoints.push( new Vector2( column + normalizedStartingPoint.x, row + normalizedStartingPoint.y ) );
        }
      }
    }

    const outerSurroundingPoints = [];
    normalizedPoints.forEach( p => { outerSurroundingPoints.push( this.cellToModelVector( p ) ); } );
    return outerSurroundingPoints;
  }

  /**
   * Determine whether it is valid to place the given shape at the given position.  For placement to be valid, the
   * shape can't overlap with any other shape, and must share at least one side with an occupied space.
   * @param movableShape
   * @param position
   * @returns {boolean}
   * @private
   */
  isValidToPlace( movableShape, position ) {
    const normalizedPosition = this.modelToCellVector( position );
    const normalizedWidth = Utils.roundSymmetric( movableShape.shape.bounds.width / this.unitSquareLength );
    const normalizedHeight = Utils.roundSymmetric( movableShape.shape.bounds.height / this.unitSquareLength );
    let row;
    let column;

    // Return false if the shape would go off the board if placed at this position.
    if ( normalizedPosition.x < 0 || normalizedPosition.x + normalizedWidth > this.numColumns ||
         normalizedPosition.y < 0 || normalizedPosition.y + normalizedHeight > this.numRows ) {
      return false;
    }

    // If there are no other shapes on the board, any position on the board is valid.
    if ( this.residentShapes.length === 0 ) {
      return true;
    }

    // Return false if this shape overlaps any previously placed shapes.
    for ( row = 0; row < normalizedHeight; row++ ) {
      for ( column = 0; column < normalizedWidth; column++ ) {
        if ( this.isCellOccupiedNowOrSoon( normalizedPosition.x + column, normalizedPosition.y + row ) ) {
          return false;
        }
      }
    }

    // If this board is not set to consolidate shapes, we've done enough, and this position is valid.
    if ( !this.formCompositeProperty.get() ) {
      return true;
    }

    // This position is only valid if the shape will share an edge with an already placed shape or an incoming shape,
    // since the 'formComposite' mode is enabled.
    for ( row = 0; row < normalizedHeight; row++ ) {
      for ( column = 0; column < normalizedWidth; column++ ) {
        if (
          this.isCellOccupiedNowOrSoon( normalizedPosition.x + column, normalizedPosition.y + row - 1 ) ||
          this.isCellOccupiedNowOrSoon( normalizedPosition.x + column - 1, normalizedPosition.y + row ) ||
          this.isCellOccupiedNowOrSoon( normalizedPosition.x + column + 1, normalizedPosition.y + row ) ||
          this.isCellOccupiedNowOrSoon( normalizedPosition.x + column, normalizedPosition.y + row + 1 )
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Release all the shapes that are currently on this board and send them to their home positions.
   * @public
   * @param releaseMode - Controls what the shapes do after release, options are 'fade', 'animateHome', and
   * 'jumpHome'.  'jumpHome' is the default.
   */
  releaseAllShapes( releaseMode ) {
    const shapesToRelease = [];

    // Remove all listeners added to the shapes by this placement board.
    this.residentShapes.forEach( shape => {
      this.removeTaggedObservers( shape.userControlledProperty );
      shapesToRelease.push( shape );
    } );
    this.incomingShapes.forEach( shape => {
      this.removeTaggedObservers( shape.animatingProperty );
      shapesToRelease.push( shape );
    } );

    // Clear out all references to shapes placed on this board.
    this.residentShapes.clear();
    this.incomingShapes.length = 0;

    // Clear the cell array that tracks occupancy.
    for ( let row = 0; row < this.numRows; row++ ) {
      for ( let column = 0; column < this.numColumns; column++ ) {
        this.cells[ column ][ row ].occupiedBy = null;
      }
    }

    // Tell the shapes what to do after being released.
    shapesToRelease.forEach( shape => {
      if ( typeof ( releaseMode ) === 'undefined' || releaseMode === 'jumpHome' ) {
        shape.returnToOrigin( false );
      }
      else if ( releaseMode === 'animateHome' ) {
        shape.returnToOrigin( true );
      }
      else if ( releaseMode === 'fade' ) {
        shape.fadeAway();
      }
      else {
        throw new Error( 'Unsupported release mode for shapes.' );
      }
    } );

    // Update board state.
    this.updateAll();
  }

  // @public - check if a shape is resident on the board
  isResidentShape( shape ) {
    return this.residentShapes.includes( shape );
  }

  // @private
  releaseShape( shape ) {
    assert && assert( this.isResidentShape( shape ) || this.incomingShapes.contains( shape ), 'Error: An attempt was made to release a shape that is not present.' );
    if ( this.isResidentShape( shape ) ) {
      this.removeTaggedObservers( shape.userControlledProperty );
      this.removeResidentShape( shape );
    }
    else if ( this.incomingShapes.indexOf( shape ) >= 0 ) {
      this.removeTaggedObservers( shape.animatingProperty );
      this.incomingShapes.splice( this.incomingShapes.indexOf( shape ), 1 );
    }
  }

  //@private
  cellToModelCoords( column, row ) {
    return new Vector2( column * this.unitSquareLength + this.bounds.minX, row * this.unitSquareLength + this.bounds.minY );
  }

  //@private
  cellToModelVector( v ) {
    return this.cellToModelCoords( v.x, v.y );
  }

  //@private
  modelToCellCoords( x, y ) {
    return new Vector2( Utils.roundSymmetric( ( x - this.bounds.minX ) / this.unitSquareLength ),
      Utils.roundSymmetric( ( y - this.bounds.minY ) / this.unitSquareLength ) );
  }

  //@private
  modelToCellVector( v ) {
    return this.modelToCellCoords( v.x, v.y );
  }

  // @private
  createShapeFromPerimeterPoints( perimeterPoints ) {
    const perimeterShape = new Shape();
    perimeterShape.moveToPoint( perimeterPoints[ 0 ] );
    for ( let i = 1; i < perimeterPoints.length; i++ ) {
      perimeterShape.lineToPoint( perimeterPoints[ i ] );
    }
    perimeterShape.close(); // Shouldn't be needed, but best to be sure.
    return perimeterShape;
  }

  // @private
  createShapeFromPerimeterList( perimeters ) {
    const perimeterShape = new Shape();
    perimeters.forEach( perimeterPoints => {
      perimeterShape.moveToPoint( perimeterPoints[ 0 ] );
      for ( let i = 1; i < perimeterPoints.length; i++ ) {
        perimeterShape.lineToPoint( perimeterPoints[ i ] );
      }
      perimeterShape.close();
    } );
    return perimeterShape;
  }

  /**
   * Marching squares algorithm for scanning the perimeter of a shape, see
   * https://en.wikipedia.org/wiki/Marching_squares or search the Internet for 'Marching Squares Algorithm' for more
   * information on this.
   * @private
   */
  scanPerimeter( windowStart ) {
    const scanWindow = windowStart.copy();
    let scanComplete = false;
    const perimeterPoints = [];
    let previousMovementVector = MOVEMENT_VECTORS.up; // Init this way allows algorithm to work for interior perimeters.
    while ( !scanComplete ) {

      // Scan the current four-pixel area.
      const upLeftOccupied = this.isCellOccupied( scanWindow.x - 1, scanWindow.y - 1 );
      const upRightOccupied = this.isCellOccupied( scanWindow.x, scanWindow.y - 1 );
      const downLeftOccupied = this.isCellOccupied( scanWindow.x - 1, scanWindow.y );
      const downRightOccupied = this.isCellOccupied( scanWindow.x, scanWindow.y );

      // Map the scan to the one of 16 possible states.
      let marchingSquaresState = 0;
      if ( upLeftOccupied ) { marchingSquaresState |= 1; } // eslint-disable-line no-bitwise
      if ( upRightOccupied ) { marchingSquaresState |= 2; } // eslint-disable-line no-bitwise
      if ( downLeftOccupied ) { marchingSquaresState |= 4; } // eslint-disable-line no-bitwise
      if ( downRightOccupied ) { marchingSquaresState |= 8; } // eslint-disable-line no-bitwise

      assert && assert(
      marchingSquaresState !== 0 && marchingSquaresState !== 15,
        'Marching squares algorithm reached invalid state.'
      );

      // Convert and add this point to the perimeter points.
      perimeterPoints.push( this.cellToModelCoords( scanWindow.x, scanWindow.y ) );

      // Move the scan window to the next position.
      const movementVector = SCAN_AREA_MOVEMENT_FUNCTIONS[ marchingSquaresState ]( previousMovementVector );
      scanWindow.add( movementVector );
      previousMovementVector = movementVector;

      if ( scanWindow.equals( windowStart ) ) {
        scanComplete = true;
      }
    }
    return perimeterPoints;
  }

  // @private, Update the exterior and interior perimeters.
  updatePerimeters() {
    // The perimeters can only be computed for a single consolidated shape.
    if ( !this.formCompositeProperty.get() || this.residentShapes.length === 0 ) {
      this.perimeter = 0;
      this.compositeShapeProperty.reset();
    }
    else { // Do the full-blown perimeter calculation
      let row;
      let column;
      const exteriorPerimeters = [];

      // Identify each outer perimeter.  There may be more than one if the user is moving a shape that was previously
      // on this board, since any orphaned shapes are not released until the move is complete.
      const contiguousCellGroups = this.identifyContiguousCellGroups();
      contiguousCellGroups.forEach( cellGroup => {

        // Find the top left square of this group to use as a starting point.
        let topLeftCell = null;
        cellGroup.forEach( cell => {
          if ( topLeftCell === null || cell.row < topLeftCell.row || ( cell.row === topLeftCell.row && cell.column < topLeftCell.column ) ) {
            topLeftCell = cell;
          }
        } );

        // Scan the outer perimeter and add to list.
        const topLeftCellOfGroup = new Vector2( topLeftCell.column, topLeftCell.row );
        exteriorPerimeters.push( this.scanPerimeter( topLeftCellOfGroup ) );
      } );

      // Scan for empty spaces enclosed within the outer perimeter(s).
      const outlineShape = this.createShapeFromPerimeterList( exteriorPerimeters );
      let enclosedSpaces = [];
      for ( row = 0; row < this.numRows; row++ ) {
        for ( column = 0; column < this.numColumns; column++ ) {
          if ( !this.isCellOccupied( column, row ) ) {
            // This cell is empty.  Test if it is within the outline perimeter.
            const cellCenterInModel = this.cellToModelCoords( column, row ).addXY( this.unitSquareLength / 2, this.unitSquareLength / 2 );
            if ( outlineShape.containsPoint( cellCenterInModel ) ) {
              enclosedSpaces.push( new Vector2( column, row ) );
            }
          }
        }
      }

      // Map the internal perimeters
      const interiorPerimeters = [];
      while ( enclosedSpaces.length > 0 ) {

        // Locate the top left most space
        let topLeftSpace = enclosedSpaces[ 0 ];
        enclosedSpaces.forEach( cell => {
          if ( cell.y < topLeftSpace.y || ( cell.y === topLeftSpace.y && cell.x < topLeftSpace.x ) ) {
            topLeftSpace = cell;
          }
        } );

        // Map the interior perimeter.
        const enclosedPerimeterPoints = this.scanPerimeter( topLeftSpace );
        interiorPerimeters.push( enclosedPerimeterPoints );

        // Identify and save all spaces not enclosed by this perimeter.
        const perimeterShape = this.createShapeFromPerimeterPoints( enclosedPerimeterPoints );
        const leftoverEmptySpaces = [];
        enclosedSpaces.forEach( enclosedSpace => {
          const positionPoint = this.cellToModelCoords( enclosedSpace.x, enclosedSpace.y );
          const centerPoint = positionPoint.plusXY( this.unitSquareLength / 2, this.unitSquareLength / 2 );
          if ( !perimeterShape.containsPoint( centerPoint ) ) {
            // This space is not contained in the perimeter that was just mapped.
            leftoverEmptySpaces.push( enclosedSpace );
          }
        } );

        // Set up for the next time through the loop.
        enclosedSpaces = leftoverEmptySpaces;
      }

      // Update externally visible properties.  Only update the perimeters if they have changed in order to minimize
      // work done in the view.
      if ( !( this.perimeterListsEqual( exteriorPerimeters, this.compositeShapeProperty.get().exteriorPerimeters ) &&
              this.perimeterListsEqual( interiorPerimeters, this.compositeShapeProperty.get().interiorPerimeters ) ) ) {
        this.compositeShapeProperty.set( new PerimeterShape( exteriorPerimeters, interiorPerimeters, this.unitSquareLength, {
          fillColor: this.compositeShapeFillColor,
          edgeColor: this.compositeShapeEdgeColor
        } ) );
      }
    }
  }

  // @private
  perimeterPointsEqual( perimeter1, perimeter2 ) {
    assert && assert( Array.isArray( perimeter1 ) && Array.isArray( perimeter2 ), 'Invalid parameters for perimeterPointsEqual' );
    if ( perimeter1.length !== perimeter2.length ) {
      return false;
    }
    return perimeter1.every( ( point, index ) => point.equals( perimeter2[ index ] ) );
  }

  // @private
  perimeterListsEqual( perimeterList1, perimeterList2 ) {
    assert && assert( Array.isArray( perimeterList1 ) && Array.isArray( perimeterList2 ), 'Invalid parameters for perimeterListsEqual' );
    if ( perimeterList1.length !== perimeterList2.length ) {
      return false;
    }
    return perimeterList1.every( ( perimeterPoints, index ) => this.perimeterPointsEqual( perimeterPoints, perimeterList2[ index ] ) );
  }

  /**
   * Identify all cells that are adjacent to the provided cell and that are currently occupied by a shape.  Only
   * shapes that share an edge are considered to be adjacent, shapes that only touch at the corner don't count.  This
   * uses recursion.  It also relies on a flag that must be cleared for the cells before calling this algorithm.  The
   * flag is done for efficiency, but this could be changed to search through the list of cells in the cell group if
   * that flag method is too weird.
   *
   * @private
   * @param startCell
   * @param cellGroup
   */
  identifyAdjacentOccupiedCells( startCell, cellGroup ) {
    assert && assert( startCell.occupiedBy !== null, 'Usage error: Unoccupied cell passed to group identification.' );
    assert && assert( !startCell.cataloged, 'Usage error: Cataloged cell passed to group identification algorithm.' );
    // Catalog this cell.
    cellGroup.push( startCell );
    startCell.cataloged = true;

    // Check occupancy of each of the four adjecent cells.
    Object.keys( MOVEMENT_VECTORS ).forEach( key => {
      const movementVector = MOVEMENT_VECTORS[ key ];
      const adjacentCell = this.getCell( startCell.column + movementVector.x, startCell.row + movementVector.y );
      if ( adjacentCell !== null && adjacentCell.occupiedBy !== null && !adjacentCell.cataloged ) {
        this.identifyAdjacentOccupiedCells( adjacentCell, cellGroup );
      }
    } );
  }

  /**
   * Returns an array representing all contiguous groups of occupied cells.  Each group is a list of cells.
   * @private
   * @returns {Array}
   */
  identifyContiguousCellGroups() {

    // Make a list of positions for all occupied cells.
    let ungroupedOccupiedCells = [];
    for ( let row = 0; row < this.numRows; row++ ) {
      for ( let column = 0; column < this.numColumns; column++ ) {
        const cell = this.cells[ column ][ row ];
        if ( cell.occupiedBy !== null ) {
          ungroupedOccupiedCells.push( this.cells[ column ][ row ] );
          // Clear the flag used by the search algorithm.
          cell.cataloged = false;
        }
      }
    }

    // Identify the interconnected groups of cells.
    const contiguousCellGroups = [];
    while ( ungroupedOccupiedCells.length > 0 ) {
      const cellGroup = [];
      this.identifyAdjacentOccupiedCells( ungroupedOccupiedCells[ 0 ], cellGroup );
      contiguousCellGroups.push( cellGroup );
      ungroupedOccupiedCells = _.difference( ungroupedOccupiedCells, cellGroup );
    }

    return contiguousCellGroups;
  }

  /**
   * Release any shapes that are resident on the board but that don't share at least one edge with the largest
   * composite shape on the board.  Such shapes are referred to as 'orphans' and, when release, they are sent back to
   * the position where they were created.
   * @private
   */
  releaseAnyOrphans() {

    // Orphans can only exist when operating in the 'formComposite' mode.
    if ( this.formCompositeProperty.get() ) {
      const contiguousCellGroups = this.identifyContiguousCellGroups();

      if ( contiguousCellGroups.length > 1 ) {
        // There are orphans that should be released.  Determine which ones.
        let indexOfRetainedGroup = 0;
        contiguousCellGroups.forEach( ( group, index ) => {
          if ( group.length > contiguousCellGroups[ indexOfRetainedGroup ].length ) {
            indexOfRetainedGroup = index;
          }
        } );

        contiguousCellGroups.forEach( ( group, groupIndex ) => {
          if ( groupIndex !== indexOfRetainedGroup ) {
            group.forEach( cell => {
              const movableShape = cell.occupiedBy;
              if ( movableShape !== null ) { // Need to test in case a previously released shape covered multiple cells.
                this.releaseShape( movableShape );
                movableShape.returnToOrigin( true );
              }
            } );
          }
        } );
      }
    }
  }

  /**
   * Replace one of the composite shapes that currently resides on this board with a set of unit squares.  This is
   * generally done when a composite shape was placed on the board but we now want it treated as a bunch of smaller
   * unit squares instead.
   *
   * @param {MovableShape} originalShape
   * @param {Array.<MovableShape>} unitSquares Pieces that comprise the original shape, MUST BE CORRECTLY LOCATED
   * since this method does not relocate them to the appropriate places.
   * @public
   */
  replaceShapeWithUnitSquares( originalShape, unitSquares ) {
    assert && assert( this.isResidentShape( originalShape ), 'Error: Specified shape to be replaced does not appear to be present.' );

    // The following add and remove operations do not use the add and remove methods in order to avoid releasing
    // orphans (which could cause undesired behavior) and attribute updates (which are unnecessary).
    this.residentShapes.remove( originalShape );
    this.updateCellOccupation( originalShape, 'remove' );

    unitSquares.forEach( movableUnitSquare => {
      this.residentShapes.push( movableUnitSquare );

      // Set up a listener to remove this shape when the user grabs it.
      this.addRemovalListener( movableUnitSquare );

      // Make some state updates.
      this.updateCellOccupation( movableUnitSquare, 'add' );
    } );
  }

  /**
   * adds a listener that will remove this shape from the board when the user grabs it
   * @param {MovableShape} movableShape
   * @private
   */
  addRemovalListener( movableShape ) {

    const self = this;

    function removalListener( userControlled ) {
      assert && assert(
        userControlled === true,
        'should only see shapes become user controlled after being added to a placement board'
      );
      self.removeResidentShape( movableShape );
      movableShape.userControlledProperty.unlink( removalListener );
    }

    this.tagListener( removalListener );
    movableShape.userControlledProperty.lazyLink( removalListener );
  }

  // @public, set colors used for the composite shape shown for this board
  setCompositeShapeColorScheme( fillColor, edgeColor ) {
    this.compositeShapeFillColor = fillColor;
    this.compositeShapeEdgeColor = edgeColor;
  }

  // @private, Update perimeter points, placement positions, total area, and total perimeter.
  updateAll() {
    if ( !this.updatesSuspended ) {
      this.updatePerimeters();
      this.updateAreaAndTotalPerimeter();
    }
  }

  /**
   * This method suspends updates so that a block of squares can be added without having to all the recalculations
   * for each one.  This is generally done for performance reasons in cases such as depicting the solution to a
   * challenge in the game.  The flag is automatically cleared when the last incoming shape is added as a resident
   * shape.
   * @public
   */
  suspendUpdatesForBlockAdd() {
    this.updatesSuspended = true;
  }

  /**
   * Set the background shape.  The shape can optionally be centered horizontally and vertically when placed on the
   * board.
   *
   * @public
   * @param {PerimeterShape} perimeterShape The new background perimeterShape, or null to set no background
   * perimeterShape.
   * @param {boolean} centered True if the perimeterShape should be centered on the board (but still aligned with grid).
   */
  setBackgroundShape( perimeterShape, centered ) {
    if ( perimeterShape === null ) {
      this.backgroundShapeProperty.reset();
    }
    else {
      assert && assert( perimeterShape instanceof PerimeterShape, 'Background perimeterShape must be a PerimeterShape.' );
      assert && assert( perimeterShape.getWidth() % this.unitSquareLength === 0 && perimeterShape.getHeight() % this.unitSquareLength === 0,
        'Background shape width and height must be integer multiples of the unit square size.' );
      if ( centered ) {
        const xOffset = this.bounds.minX + Math.floor( ( ( this.bounds.width - perimeterShape.getWidth() ) / 2 ) / this.unitSquareLength ) * this.unitSquareLength;
        const yOffset = this.bounds.minY + Math.floor( ( ( this.bounds.height - perimeterShape.getHeight() ) / 2 ) / this.unitSquareLength ) * this.unitSquareLength;
        this.backgroundShapeProperty.set( perimeterShape.translated( xOffset, yOffset ) );
      }
      else {
        this.backgroundShapeProperty.set( perimeterShape );
      }
    }
  }
}

areaBuilder.register( 'ShapePlacementBoard', ShapePlacementBoard );
export default ShapePlacementBoard;