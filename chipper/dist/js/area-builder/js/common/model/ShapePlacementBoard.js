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
  up: new Vector2(0, -1),
  down: new Vector2(0, 1),
  left: new Vector2(-1, 0),
  right: new Vector2(1, 0)
};

// Functions used for scanning the edge of the perimeter.  These are a key component of the "marching squares"
// algorithm that is used for perimeter traversal, see the function where they are used for more information.
const SCAN_AREA_MOVEMENT_FUNCTIONS = [null,
// 0
() => MOVEMENT_VECTORS.up,
// 1
() => MOVEMENT_VECTORS.right,
// 2
() => MOVEMENT_VECTORS.right,
// 3
() => MOVEMENT_VECTORS.left,
// 4
() => MOVEMENT_VECTORS.up,
// 5
previousStep => previousStep === MOVEMENT_VECTORS.up ? MOVEMENT_VECTORS.left : MOVEMENT_VECTORS.right,
// 6
() => MOVEMENT_VECTORS.right,
// 7
() => MOVEMENT_VECTORS.down,
// 8
previousStep => previousStep === MOVEMENT_VECTORS.right ? MOVEMENT_VECTORS.up : MOVEMENT_VECTORS.down,
// 9
() => MOVEMENT_VECTORS.down,
// 10
() => MOVEMENT_VECTORS.down,
// 11
() => MOVEMENT_VECTORS.left,
// 12
() => MOVEMENT_VECTORS.up,
// 13
() => MOVEMENT_VECTORS.left,
// 14
null // 15
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
  constructor(size, unitSquareLength, position, colorHandled, showGridProperty, showDimensionsProperty) {
    // The size should be an integer number of unit squares for both dimensions.
    assert && assert(size.width % unitSquareLength === 0 && size.height % unitSquareLength === 0, 'ShapePlacementBoard dimensions must be integral numbers of unit square dimensions');
    this.showGridProperty = showGridProperty;
    this.showDimensionsProperty = showDimensionsProperty;

    // Set the initial fill and edge colors for the composite shape (defined in Property declarations below).
    this.compositeShapeFillColor = colorHandled === '*' ? new Color(AreaBuilderSharedConstants.GREENISH_COLOR) : Color.toColor(colorHandled);
    this.compositeShapeEdgeColor = this.compositeShapeFillColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR);

    // @public boolean Read/Write value that controls whether the placement board moves individual shapes that are
    // added to the board such that they form a single, contiguous, composite shape, or if it just snaps them to the
    // grid. The perimeter and area values are only updated when this is set to true.
    this.formCompositeProperty = new Property(true);

    // @public Read-only property that indicates the area and perimeter of the composite shape.  These must be
    // together in an object so that they can be updated simultaneously, otherwise race conditions can occur when
    // evaluating challenges.
    this.areaAndPerimeterProperty = new Property({
      area: 0,
      // {number||string} - number when valid, string when invalid
      perimeter: 0 // {number||string} number when valid, string when invalid
    });

    // @public Read-only shape defined in terms of perimeter points that describes the composite shape created by all
    // of the individual shapes placed on the board by the user.
    this.compositeShapeProperty = new Property(new PerimeterShape([], [], unitSquareLength, {
      fillColor: this.compositeShapeFillColor,
      edgeColor: this.compositeShapeEdgeColor
    }));

    // @public Read-only shape that can be placed on the board, generally as a template over which the user can add
    // other shapes.  The shape is positioned relative to this board, not in absolute model space.  It should be
    // set through the method provided on this class rather than directly.
    this.backgroundShapeProperty = new Property(new PerimeterShape([], [], unitSquareLength, {
      fillColor: 'black'
    }));

    // @public Read/write value for controlling whether the background shape should show a grid when portrayed in the
    // view.
    this.showGridOnBackgroundShapeProperty = new Property(false);

    // Observable array of the shapes that have been placed on this board.
    this.residentShapes = createObservableArray(); // @public, read only

    // Non-dynamic public values.
    this.unitSquareLength = unitSquareLength; // @public
    this.bounds = new Bounds2(position.x, position.y, position.x + size.width, position.y + size.height); // @public
    this.colorHandled = colorHandled === '*' ? colorHandled : Color.toColor(colorHandled); // @public

    // Private variables
    this.numRows = size.height / unitSquareLength; // @private
    this.numColumns = size.width / unitSquareLength; // @private
    this.incomingShapes = []; // @private, {Array.<MovableShape>}, list of shapes that are animating to a spot on this board but aren't here yet
    this.updatesSuspended = false; // @private, used to improve performance when adding a bunch of shapes at once to the board

    // For efficiency and simplicity in evaluating the interior and exterior perimeter, identifying orphaned shapes,
    // and so forth, a 2D array is used to track various state information about the 'cells' that correspond to the
    // positions on this board where shapes may be placed.
    this.cells = []; //@private
    for (let column = 0; column < this.numColumns; column++) {
      const currentRow = [];
      for (let row = 0; row < this.numRows; row++) {
        // Add an object that defines the information internally tracked for each cell.
        currentRow.push({
          column: column,
          row: row,
          occupiedBy: null,
          // the shape occupying this cell, null if none
          cataloged: false,
          // used by group identification algorithm
          catalogedBy: null // used by group identification algorithm
        });
      }

      this.cells.push(currentRow);
    }
  }

  // @private
  shapeOverlapsBoard(shape) {
    const shapePosition = shape.positionProperty.get();
    const shapeBounds = new Bounds2(shapePosition.x, shapePosition.y, shapePosition.x + shape.shape.bounds.getWidth(), shapePosition.y + shape.shape.bounds.getHeight());
    return this.bounds.intersectsBounds(shapeBounds);
  }

  /**
   * Place the provide shape on this board.  Returns false if the color does not match the handled color or if the
   * shape is not partially over the board.
   * @public
   * @param {MovableShape} movableShape A model shape
   */
  placeShape(movableShape) {
    assert && assert(movableShape.userControlledProperty.get() === false, 'Shapes can\'t be placed when still controlled by user.');
    // Only place the shape if it is of the correct color and is positioned so that it overlaps with the board.
    if (this.colorHandled !== '*' && !movableShape.color.equals(this.colorHandled) || !this.shapeOverlapsBoard(movableShape)) {
      return false;
    }

    // Set the shape's visibility behavior based on whether a composite shape is being depicted.
    movableShape.invisibleWhenStillProperty.set(this.formCompositeProperty.get());

    // Determine where to place the shape on the board.
    let placementPosition = null;
    for (let surroundingPointsLevel = 0; surroundingPointsLevel < Math.max(this.numRows, this.numColumns) && placementPosition === null; surroundingPointsLevel++) {
      const surroundingPoints = this.getOuterSurroundingPoints(movableShape.positionProperty.get(), surroundingPointsLevel);
      surroundingPoints.sort((p1, p2) => p1.distance(movableShape.positionProperty.get()) - p2.distance(movableShape.positionProperty.get()));
      for (let pointIndex = 0; pointIndex < surroundingPoints.length && placementPosition === null; pointIndex++) {
        if (this.isValidToPlace(movableShape, surroundingPoints[pointIndex])) {
          placementPosition = surroundingPoints[pointIndex];
        }
      }
    }
    if (placementPosition === null) {
      // No valid position found - bail out.
      return false;
    }

    // add this shape to the list of incoming shapes
    this.addIncomingShape(movableShape, placementPosition, true);

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
  addShapeDirectlyToCell(cellColumn, cellRow, movableShape) {
    // Set the shape's visibility behavior based on whether a composite shape is being depicted.
    movableShape.invisibleWhenStillProperty.set(this.formCompositeProperty.get());

    // Add the shape by putting it on the list of incoming shapes and setting its destination.
    this.addIncomingShape(movableShape, this.cellToModelCoords(cellColumn, cellRow, false));
  }

  /**
   * Get the proportion of area that match the provided color.
   * @param color
   * @public
   */
  getProportionOfColor(color) {
    const compareColor = Color.toColor(color);
    let totalArea = 0;
    let areaOfSpecifiedColor = 0;
    this.residentShapes.forEach(residentShape => {
      const areaOfShape = residentShape.shape.bounds.width * residentShape.shape.bounds.height / (this.unitSquareLength * this.unitSquareLength);
      totalArea += areaOfShape;
      if (compareColor.equals(residentShape.color)) {
        areaOfSpecifiedColor += areaOfShape;
      }
    });
    const proportion = new Fraction(areaOfSpecifiedColor, totalArea);
    proportion.reduce();
    return proportion;
  }

  // @private, add a shape to the list of residents and make the other updates that go along with this.
  addResidentShape(movableShape, releaseOrphans) {
    // Make sure that the shape is not moving
    assert && assert(movableShape.positionProperty.get().equals(movableShape.destination), 'Error: Shapes should not become residents until they have completed animating.');

    // Made sure that the shape isn't already a resident.
    assert && assert(!this.isResidentShape(movableShape), 'Error: Attempt to add shape that is already a resident.');
    this.residentShapes.push(movableShape);

    // Make the appropriate updates.
    this.updateCellOccupation(movableShape, 'add');
    if (releaseOrphans) {
      this.releaseAnyOrphans();
    }
    this.updateAll();
  }

  //@private, remove the specified shape from the shape placement board
  removeResidentShape(movableShape) {
    assert && assert(this.isResidentShape(movableShape), 'Error: Attempt to remove shape that is not a resident.');
    const self = this;
    this.residentShapes.remove(movableShape);
    this.updateCellOccupation(movableShape, 'remove');
    this.updateAll();
    if (movableShape.userControlledProperty.get()) {
      // Watch the shape so that we can do needed updates when the user releases it.
      movableShape.userControlledProperty.lazyLink(function releaseOrphansIfDroppedOfBoard(userControlled) {
        assert && assert(!userControlled, 'Unexpected transition of userControlled flag.');
        if (!self.shapeOverlapsBoard(movableShape)) {
          // This shape isn't coming back, so we need to trigger an orphan release.
          self.releaseAnyOrphans();
          self.updateAll();
        }
        movableShape.userControlledProperty.unlink(releaseOrphansIfDroppedOfBoard);
      });
    }
  }

  // @private, add the shape to the list of incoming shapes and set up a listener to move it to resident shapes
  addIncomingShape(movableShape, destination, releaseOrphans) {
    const self = this;
    movableShape.setDestination(destination, true);

    // The remaining code in this method assumes that the shape is animating to the new position, and will cause
    // odd results if it isn't, so we double check it here.
    assert && assert(movableShape.animatingProperty.get(), 'Shape is is expected to be animating');

    // The shape is moving to a spot on the board.  We don't want to add it to the list of resident shapes yet, or we
    // may trigger a change to the exterior and interior perimeters, but we need to keep a reference to it so that
    // the valid placement positions can be updated, especially in multi-touch environments.  So, basically, there is
    // an intermediate 'holding place' for incoming shapes.
    this.incomingShapes.push(movableShape);

    // Create a listener that will move this shape from the incoming shape list to the resident list once the
    // animation completes.
    function animationCompleteListener(animating) {
      if (!animating) {
        // Move the shape from the incoming list to the resident list.
        self.incomingShapes.splice(self.incomingShapes.indexOf(movableShape), 1);
        self.addResidentShape(movableShape, releaseOrphans);
        movableShape.animatingProperty.unlink(animationCompleteListener);
        if (self.updatesSuspended && self.incomingShapes.length === 0) {
          // updates had been suspended (for better performance), and the last incoming shapes was added, so resume updates
          self.updatesSuspended = false;
          self.updateAll();
        }
      }

      // Set up a listener to remove this shape if and when the user grabs it.
      self.addRemovalListener(movableShape);
    }

    // Tag the listener so that it can be removed without firing if needed, such as when the board is cleared.
    this.tagListener(animationCompleteListener);

    // Hook up the listener.
    movableShape.animatingProperty.lazyLink(animationCompleteListener);
  }

  // @private, tag a listener for removal
  tagListener(listener) {
    listener.shapePlacementBoard = this;
  }

  // @private, check if listener function was tagged by this instance
  listenerTagMatches(listener) {
    return listener.shapePlacementBoard && listener.shapePlacementBoard === this;
  }

  // TODO: This is rather ugly.  Work with SR to improve or find alternative, or to bake into Axon.  Maybe a map.
  // @private, remove all observers from a property that have been tagged by this shape placement board.
  removeTaggedObservers(property) {
    const taggedObservers = [];
    property.forEachListener(observer => {
      if (this.listenerTagMatches(observer)) {
        taggedObservers.push(observer);
      }
    });
    taggedObservers.forEach(taggedObserver => {
      property.unlink(taggedObserver);
    });
  }

  // @private Convenience function for returning a cell or null if row or column are out of range.
  getCell(column, row) {
    if (column < 0 || row < 0 || column >= this.numColumns || row >= this.numRows) {
      return null;
    }
    return this.cells[column][row];
  }

  // @private Function for getting the occupant of the specified cell, does bounds checking.
  getCellOccupant(column, row) {
    const cell = this.getCell(column, row);
    return cell ? cell.occupiedBy : null;
  }

  /**
   * Set or clear the occupation status of the cells.
   * @param movableShape
   * @param operation
   * @private
   */
  updateCellOccupation(movableShape, operation) {
    const xIndex = Utils.roundSymmetric((movableShape.destination.x - this.bounds.minX) / this.unitSquareLength);
    const yIndex = Utils.roundSymmetric((movableShape.destination.y - this.bounds.minY) / this.unitSquareLength);

    // Mark all cells occupied by this shape.
    for (let row = 0; row < movableShape.shape.bounds.height / this.unitSquareLength; row++) {
      for (let column = 0; column < movableShape.shape.bounds.width / this.unitSquareLength; column++) {
        this.cells[xIndex + column][yIndex + row].occupiedBy = operation === 'add' ? movableShape : null;
      }
    }
  }

  // @private
  updateAreaAndTotalPerimeter() {
    if (this.compositeShapeProperty.get().exteriorPerimeters.length <= 1) {
      let totalArea = 0;
      this.residentShapes.forEach(residentShape => {
        totalArea += residentShape.shape.bounds.width * residentShape.shape.bounds.height / (this.unitSquareLength * this.unitSquareLength);
      });
      let totalPerimeter = 0;
      this.compositeShapeProperty.get().exteriorPerimeters.forEach(exteriorPerimeter => {
        totalPerimeter += exteriorPerimeter.length;
      });
      this.compositeShapeProperty.get().interiorPerimeters.forEach(interiorPerimeter => {
        totalPerimeter += interiorPerimeter.length;
      });
      this.areaAndPerimeterProperty.set({
        area: totalArea,
        perimeter: totalPerimeter
      });
    } else {
      // Area and perimeter readings are currently invalid.
      this.areaAndPerimeterProperty.set({
        area: AreaBuilderSharedConstants.INVALID_VALUE,
        perimeter: AreaBuilderSharedConstants.INVALID_VALUE
      });
    }
  }

  /**
   * Convenience function for finding out whether a cell is occupied that handles out of bounds case (returns false).
   * @private
   * @param column
   * @param row
   */
  isCellOccupied(column, row) {
    if (column >= this.numColumns || column < 0 || row >= this.numRows || row < 0) {
      return false;
    } else {
      return this.cells[column][row].occupiedBy !== null;
    }
  }

  /**
   * Function that returns true if a cell is occupied or if an incoming shape is heading for it.
   * @private
   * @param column
   * @param row
   */
  isCellOccupiedNowOrSoon(column, row) {
    if (this.isCellOccupied(column, row)) {
      return true;
    }
    for (let i = 0; i < this.incomingShapes.length; i++) {
      const targetCell = this.modelToCellVector(this.incomingShapes[i].destination);
      const normalizedWidth = Utils.roundSymmetric(this.incomingShapes[i].shape.bounds.width / this.unitSquareLength);
      const normalizedHeight = Utils.roundSymmetric(this.incomingShapes[i].shape.bounds.height / this.unitSquareLength);
      if (column >= targetCell.x && column < targetCell.x + normalizedWidth && row >= targetCell.y && row < targetCell.y + normalizedHeight) {
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
  getOuterSurroundingPoints(point, levelsRemoved) {
    const normalizedPoints = [];

    // Get the closest point in cell coordinates.
    const normalizedStartingPoint = new Vector2(Math.floor((point.x - this.bounds.minX) / this.unitSquareLength) - levelsRemoved, Math.floor((point.y - this.bounds.minY) / this.unitSquareLength) - levelsRemoved);
    const squareSize = (levelsRemoved + 1) * 2;
    for (let row = 0; row < squareSize; row++) {
      for (let column = 0; column < squareSize; column++) {
        if ((row === 0 || row === squareSize - 1 || column === 0 || column === squareSize - 1) && column + normalizedStartingPoint.x <= this.numColumns && row + normalizedStartingPoint.y <= this.numRows) {
          // This is an outer point, and is valid, so include it.
          normalizedPoints.push(new Vector2(column + normalizedStartingPoint.x, row + normalizedStartingPoint.y));
        }
      }
    }
    const outerSurroundingPoints = [];
    normalizedPoints.forEach(p => {
      outerSurroundingPoints.push(this.cellToModelVector(p));
    });
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
  isValidToPlace(movableShape, position) {
    const normalizedPosition = this.modelToCellVector(position);
    const normalizedWidth = Utils.roundSymmetric(movableShape.shape.bounds.width / this.unitSquareLength);
    const normalizedHeight = Utils.roundSymmetric(movableShape.shape.bounds.height / this.unitSquareLength);
    let row;
    let column;

    // Return false if the shape would go off the board if placed at this position.
    if (normalizedPosition.x < 0 || normalizedPosition.x + normalizedWidth > this.numColumns || normalizedPosition.y < 0 || normalizedPosition.y + normalizedHeight > this.numRows) {
      return false;
    }

    // If there are no other shapes on the board, any position on the board is valid.
    if (this.residentShapes.length === 0) {
      return true;
    }

    // Return false if this shape overlaps any previously placed shapes.
    for (row = 0; row < normalizedHeight; row++) {
      for (column = 0; column < normalizedWidth; column++) {
        if (this.isCellOccupiedNowOrSoon(normalizedPosition.x + column, normalizedPosition.y + row)) {
          return false;
        }
      }
    }

    // If this board is not set to consolidate shapes, we've done enough, and this position is valid.
    if (!this.formCompositeProperty.get()) {
      return true;
    }

    // This position is only valid if the shape will share an edge with an already placed shape or an incoming shape,
    // since the 'formComposite' mode is enabled.
    for (row = 0; row < normalizedHeight; row++) {
      for (column = 0; column < normalizedWidth; column++) {
        if (this.isCellOccupiedNowOrSoon(normalizedPosition.x + column, normalizedPosition.y + row - 1) || this.isCellOccupiedNowOrSoon(normalizedPosition.x + column - 1, normalizedPosition.y + row) || this.isCellOccupiedNowOrSoon(normalizedPosition.x + column + 1, normalizedPosition.y + row) || this.isCellOccupiedNowOrSoon(normalizedPosition.x + column, normalizedPosition.y + row + 1)) {
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
  releaseAllShapes(releaseMode) {
    const shapesToRelease = [];

    // Remove all listeners added to the shapes by this placement board.
    this.residentShapes.forEach(shape => {
      this.removeTaggedObservers(shape.userControlledProperty);
      shapesToRelease.push(shape);
    });
    this.incomingShapes.forEach(shape => {
      this.removeTaggedObservers(shape.animatingProperty);
      shapesToRelease.push(shape);
    });

    // Clear out all references to shapes placed on this board.
    this.residentShapes.clear();
    this.incomingShapes.length = 0;

    // Clear the cell array that tracks occupancy.
    for (let row = 0; row < this.numRows; row++) {
      for (let column = 0; column < this.numColumns; column++) {
        this.cells[column][row].occupiedBy = null;
      }
    }

    // Tell the shapes what to do after being released.
    shapesToRelease.forEach(shape => {
      if (typeof releaseMode === 'undefined' || releaseMode === 'jumpHome') {
        shape.returnToOrigin(false);
      } else if (releaseMode === 'animateHome') {
        shape.returnToOrigin(true);
      } else if (releaseMode === 'fade') {
        shape.fadeAway();
      } else {
        throw new Error('Unsupported release mode for shapes.');
      }
    });

    // Update board state.
    this.updateAll();
  }

  // @public - check if a shape is resident on the board
  isResidentShape(shape) {
    return this.residentShapes.includes(shape);
  }

  // @private
  releaseShape(shape) {
    assert && assert(this.isResidentShape(shape) || this.incomingShapes.contains(shape), 'Error: An attempt was made to release a shape that is not present.');
    if (this.isResidentShape(shape)) {
      this.removeTaggedObservers(shape.userControlledProperty);
      this.removeResidentShape(shape);
    } else if (this.incomingShapes.indexOf(shape) >= 0) {
      this.removeTaggedObservers(shape.animatingProperty);
      this.incomingShapes.splice(this.incomingShapes.indexOf(shape), 1);
    }
  }

  //@private
  cellToModelCoords(column, row) {
    return new Vector2(column * this.unitSquareLength + this.bounds.minX, row * this.unitSquareLength + this.bounds.minY);
  }

  //@private
  cellToModelVector(v) {
    return this.cellToModelCoords(v.x, v.y);
  }

  //@private
  modelToCellCoords(x, y) {
    return new Vector2(Utils.roundSymmetric((x - this.bounds.minX) / this.unitSquareLength), Utils.roundSymmetric((y - this.bounds.minY) / this.unitSquareLength));
  }

  //@private
  modelToCellVector(v) {
    return this.modelToCellCoords(v.x, v.y);
  }

  // @private
  createShapeFromPerimeterPoints(perimeterPoints) {
    const perimeterShape = new Shape();
    perimeterShape.moveToPoint(perimeterPoints[0]);
    for (let i = 1; i < perimeterPoints.length; i++) {
      perimeterShape.lineToPoint(perimeterPoints[i]);
    }
    perimeterShape.close(); // Shouldn't be needed, but best to be sure.
    return perimeterShape;
  }

  // @private
  createShapeFromPerimeterList(perimeters) {
    const perimeterShape = new Shape();
    perimeters.forEach(perimeterPoints => {
      perimeterShape.moveToPoint(perimeterPoints[0]);
      for (let i = 1; i < perimeterPoints.length; i++) {
        perimeterShape.lineToPoint(perimeterPoints[i]);
      }
      perimeterShape.close();
    });
    return perimeterShape;
  }

  /**
   * Marching squares algorithm for scanning the perimeter of a shape, see
   * https://en.wikipedia.org/wiki/Marching_squares or search the Internet for 'Marching Squares Algorithm' for more
   * information on this.
   * @private
   */
  scanPerimeter(windowStart) {
    const scanWindow = windowStart.copy();
    let scanComplete = false;
    const perimeterPoints = [];
    let previousMovementVector = MOVEMENT_VECTORS.up; // Init this way allows algorithm to work for interior perimeters.
    while (!scanComplete) {
      // Scan the current four-pixel area.
      const upLeftOccupied = this.isCellOccupied(scanWindow.x - 1, scanWindow.y - 1);
      const upRightOccupied = this.isCellOccupied(scanWindow.x, scanWindow.y - 1);
      const downLeftOccupied = this.isCellOccupied(scanWindow.x - 1, scanWindow.y);
      const downRightOccupied = this.isCellOccupied(scanWindow.x, scanWindow.y);

      // Map the scan to the one of 16 possible states.
      let marchingSquaresState = 0;
      if (upLeftOccupied) {
        marchingSquaresState |= 1;
      } // eslint-disable-line no-bitwise
      if (upRightOccupied) {
        marchingSquaresState |= 2;
      } // eslint-disable-line no-bitwise
      if (downLeftOccupied) {
        marchingSquaresState |= 4;
      } // eslint-disable-line no-bitwise
      if (downRightOccupied) {
        marchingSquaresState |= 8;
      } // eslint-disable-line no-bitwise

      assert && assert(marchingSquaresState !== 0 && marchingSquaresState !== 15, 'Marching squares algorithm reached invalid state.');

      // Convert and add this point to the perimeter points.
      perimeterPoints.push(this.cellToModelCoords(scanWindow.x, scanWindow.y));

      // Move the scan window to the next position.
      const movementVector = SCAN_AREA_MOVEMENT_FUNCTIONS[marchingSquaresState](previousMovementVector);
      scanWindow.add(movementVector);
      previousMovementVector = movementVector;
      if (scanWindow.equals(windowStart)) {
        scanComplete = true;
      }
    }
    return perimeterPoints;
  }

  // @private, Update the exterior and interior perimeters.
  updatePerimeters() {
    // The perimeters can only be computed for a single consolidated shape.
    if (!this.formCompositeProperty.get() || this.residentShapes.length === 0) {
      this.perimeter = 0;
      this.compositeShapeProperty.reset();
    } else {
      // Do the full-blown perimeter calculation
      let row;
      let column;
      const exteriorPerimeters = [];

      // Identify each outer perimeter.  There may be more than one if the user is moving a shape that was previously
      // on this board, since any orphaned shapes are not released until the move is complete.
      const contiguousCellGroups = this.identifyContiguousCellGroups();
      contiguousCellGroups.forEach(cellGroup => {
        // Find the top left square of this group to use as a starting point.
        let topLeftCell = null;
        cellGroup.forEach(cell => {
          if (topLeftCell === null || cell.row < topLeftCell.row || cell.row === topLeftCell.row && cell.column < topLeftCell.column) {
            topLeftCell = cell;
          }
        });

        // Scan the outer perimeter and add to list.
        const topLeftCellOfGroup = new Vector2(topLeftCell.column, topLeftCell.row);
        exteriorPerimeters.push(this.scanPerimeter(topLeftCellOfGroup));
      });

      // Scan for empty spaces enclosed within the outer perimeter(s).
      const outlineShape = this.createShapeFromPerimeterList(exteriorPerimeters);
      let enclosedSpaces = [];
      for (row = 0; row < this.numRows; row++) {
        for (column = 0; column < this.numColumns; column++) {
          if (!this.isCellOccupied(column, row)) {
            // This cell is empty.  Test if it is within the outline perimeter.
            const cellCenterInModel = this.cellToModelCoords(column, row).addXY(this.unitSquareLength / 2, this.unitSquareLength / 2);
            if (outlineShape.containsPoint(cellCenterInModel)) {
              enclosedSpaces.push(new Vector2(column, row));
            }
          }
        }
      }

      // Map the internal perimeters
      const interiorPerimeters = [];
      while (enclosedSpaces.length > 0) {
        // Locate the top left most space
        let topLeftSpace = enclosedSpaces[0];
        enclosedSpaces.forEach(cell => {
          if (cell.y < topLeftSpace.y || cell.y === topLeftSpace.y && cell.x < topLeftSpace.x) {
            topLeftSpace = cell;
          }
        });

        // Map the interior perimeter.
        const enclosedPerimeterPoints = this.scanPerimeter(topLeftSpace);
        interiorPerimeters.push(enclosedPerimeterPoints);

        // Identify and save all spaces not enclosed by this perimeter.
        const perimeterShape = this.createShapeFromPerimeterPoints(enclosedPerimeterPoints);
        const leftoverEmptySpaces = [];
        enclosedSpaces.forEach(enclosedSpace => {
          const positionPoint = this.cellToModelCoords(enclosedSpace.x, enclosedSpace.y);
          const centerPoint = positionPoint.plusXY(this.unitSquareLength / 2, this.unitSquareLength / 2);
          if (!perimeterShape.containsPoint(centerPoint)) {
            // This space is not contained in the perimeter that was just mapped.
            leftoverEmptySpaces.push(enclosedSpace);
          }
        });

        // Set up for the next time through the loop.
        enclosedSpaces = leftoverEmptySpaces;
      }

      // Update externally visible properties.  Only update the perimeters if they have changed in order to minimize
      // work done in the view.
      if (!(this.perimeterListsEqual(exteriorPerimeters, this.compositeShapeProperty.get().exteriorPerimeters) && this.perimeterListsEqual(interiorPerimeters, this.compositeShapeProperty.get().interiorPerimeters))) {
        this.compositeShapeProperty.set(new PerimeterShape(exteriorPerimeters, interiorPerimeters, this.unitSquareLength, {
          fillColor: this.compositeShapeFillColor,
          edgeColor: this.compositeShapeEdgeColor
        }));
      }
    }
  }

  // @private
  perimeterPointsEqual(perimeter1, perimeter2) {
    assert && assert(Array.isArray(perimeter1) && Array.isArray(perimeter2), 'Invalid parameters for perimeterPointsEqual');
    if (perimeter1.length !== perimeter2.length) {
      return false;
    }
    return perimeter1.every((point, index) => point.equals(perimeter2[index]));
  }

  // @private
  perimeterListsEqual(perimeterList1, perimeterList2) {
    assert && assert(Array.isArray(perimeterList1) && Array.isArray(perimeterList2), 'Invalid parameters for perimeterListsEqual');
    if (perimeterList1.length !== perimeterList2.length) {
      return false;
    }
    return perimeterList1.every((perimeterPoints, index) => this.perimeterPointsEqual(perimeterPoints, perimeterList2[index]));
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
  identifyAdjacentOccupiedCells(startCell, cellGroup) {
    assert && assert(startCell.occupiedBy !== null, 'Usage error: Unoccupied cell passed to group identification.');
    assert && assert(!startCell.cataloged, 'Usage error: Cataloged cell passed to group identification algorithm.');
    // Catalog this cell.
    cellGroup.push(startCell);
    startCell.cataloged = true;

    // Check occupancy of each of the four adjecent cells.
    Object.keys(MOVEMENT_VECTORS).forEach(key => {
      const movementVector = MOVEMENT_VECTORS[key];
      const adjacentCell = this.getCell(startCell.column + movementVector.x, startCell.row + movementVector.y);
      if (adjacentCell !== null && adjacentCell.occupiedBy !== null && !adjacentCell.cataloged) {
        this.identifyAdjacentOccupiedCells(adjacentCell, cellGroup);
      }
    });
  }

  /**
   * Returns an array representing all contiguous groups of occupied cells.  Each group is a list of cells.
   * @private
   * @returns {Array}
   */
  identifyContiguousCellGroups() {
    // Make a list of positions for all occupied cells.
    let ungroupedOccupiedCells = [];
    for (let row = 0; row < this.numRows; row++) {
      for (let column = 0; column < this.numColumns; column++) {
        const cell = this.cells[column][row];
        if (cell.occupiedBy !== null) {
          ungroupedOccupiedCells.push(this.cells[column][row]);
          // Clear the flag used by the search algorithm.
          cell.cataloged = false;
        }
      }
    }

    // Identify the interconnected groups of cells.
    const contiguousCellGroups = [];
    while (ungroupedOccupiedCells.length > 0) {
      const cellGroup = [];
      this.identifyAdjacentOccupiedCells(ungroupedOccupiedCells[0], cellGroup);
      contiguousCellGroups.push(cellGroup);
      ungroupedOccupiedCells = _.difference(ungroupedOccupiedCells, cellGroup);
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
    if (this.formCompositeProperty.get()) {
      const contiguousCellGroups = this.identifyContiguousCellGroups();
      if (contiguousCellGroups.length > 1) {
        // There are orphans that should be released.  Determine which ones.
        let indexOfRetainedGroup = 0;
        contiguousCellGroups.forEach((group, index) => {
          if (group.length > contiguousCellGroups[indexOfRetainedGroup].length) {
            indexOfRetainedGroup = index;
          }
        });
        contiguousCellGroups.forEach((group, groupIndex) => {
          if (groupIndex !== indexOfRetainedGroup) {
            group.forEach(cell => {
              const movableShape = cell.occupiedBy;
              if (movableShape !== null) {
                // Need to test in case a previously released shape covered multiple cells.
                this.releaseShape(movableShape);
                movableShape.returnToOrigin(true);
              }
            });
          }
        });
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
  replaceShapeWithUnitSquares(originalShape, unitSquares) {
    assert && assert(this.isResidentShape(originalShape), 'Error: Specified shape to be replaced does not appear to be present.');

    // The following add and remove operations do not use the add and remove methods in order to avoid releasing
    // orphans (which could cause undesired behavior) and attribute updates (which are unnecessary).
    this.residentShapes.remove(originalShape);
    this.updateCellOccupation(originalShape, 'remove');
    unitSquares.forEach(movableUnitSquare => {
      this.residentShapes.push(movableUnitSquare);

      // Set up a listener to remove this shape when the user grabs it.
      this.addRemovalListener(movableUnitSquare);

      // Make some state updates.
      this.updateCellOccupation(movableUnitSquare, 'add');
    });
  }

  /**
   * adds a listener that will remove this shape from the board when the user grabs it
   * @param {MovableShape} movableShape
   * @private
   */
  addRemovalListener(movableShape) {
    const self = this;
    function removalListener(userControlled) {
      assert && assert(userControlled === true, 'should only see shapes become user controlled after being added to a placement board');
      self.removeResidentShape(movableShape);
      movableShape.userControlledProperty.unlink(removalListener);
    }
    this.tagListener(removalListener);
    movableShape.userControlledProperty.lazyLink(removalListener);
  }

  // @public, set colors used for the composite shape shown for this board
  setCompositeShapeColorScheme(fillColor, edgeColor) {
    this.compositeShapeFillColor = fillColor;
    this.compositeShapeEdgeColor = edgeColor;
  }

  // @private, Update perimeter points, placement positions, total area, and total perimeter.
  updateAll() {
    if (!this.updatesSuspended) {
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
  setBackgroundShape(perimeterShape, centered) {
    if (perimeterShape === null) {
      this.backgroundShapeProperty.reset();
    } else {
      assert && assert(perimeterShape instanceof PerimeterShape, 'Background perimeterShape must be a PerimeterShape.');
      assert && assert(perimeterShape.getWidth() % this.unitSquareLength === 0 && perimeterShape.getHeight() % this.unitSquareLength === 0, 'Background shape width and height must be integer multiples of the unit square size.');
      if (centered) {
        const xOffset = this.bounds.minX + Math.floor((this.bounds.width - perimeterShape.getWidth()) / 2 / this.unitSquareLength) * this.unitSquareLength;
        const yOffset = this.bounds.minY + Math.floor((this.bounds.height - perimeterShape.getHeight()) / 2 / this.unitSquareLength) * this.unitSquareLength;
        this.backgroundShapeProperty.set(perimeterShape.translated(xOffset, yOffset));
      } else {
        this.backgroundShapeProperty.set(perimeterShape);
      }
    }
  }
}
areaBuilder.register('ShapePlacementBoard', ShapePlacementBoard);
export default ShapePlacementBoard;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJVdGlscyIsIlZlY3RvcjIiLCJTaGFwZSIsIkZyYWN0aW9uIiwiQ29sb3IiLCJhcmVhQnVpbGRlciIsIkFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzIiwiUGVyaW1ldGVyU2hhcGUiLCJNT1ZFTUVOVF9WRUNUT1JTIiwidXAiLCJkb3duIiwibGVmdCIsInJpZ2h0IiwiU0NBTl9BUkVBX01PVkVNRU5UX0ZVTkNUSU9OUyIsInByZXZpb3VzU3RlcCIsIlNoYXBlUGxhY2VtZW50Qm9hcmQiLCJjb25zdHJ1Y3RvciIsInNpemUiLCJ1bml0U3F1YXJlTGVuZ3RoIiwicG9zaXRpb24iLCJjb2xvckhhbmRsZWQiLCJzaG93R3JpZFByb3BlcnR5Iiwic2hvd0RpbWVuc2lvbnNQcm9wZXJ0eSIsImFzc2VydCIsIndpZHRoIiwiaGVpZ2h0IiwiY29tcG9zaXRlU2hhcGVGaWxsQ29sb3IiLCJHUkVFTklTSF9DT0xPUiIsInRvQ29sb3IiLCJjb21wb3NpdGVTaGFwZUVkZ2VDb2xvciIsImNvbG9yVXRpbHNEYXJrZXIiLCJQRVJJTUVURVJfREFSS0VOX0ZBQ1RPUiIsImZvcm1Db21wb3NpdGVQcm9wZXJ0eSIsImFyZWFBbmRQZXJpbWV0ZXJQcm9wZXJ0eSIsImFyZWEiLCJwZXJpbWV0ZXIiLCJjb21wb3NpdGVTaGFwZVByb3BlcnR5IiwiZmlsbENvbG9yIiwiZWRnZUNvbG9yIiwiYmFja2dyb3VuZFNoYXBlUHJvcGVydHkiLCJzaG93R3JpZE9uQmFja2dyb3VuZFNoYXBlUHJvcGVydHkiLCJyZXNpZGVudFNoYXBlcyIsImJvdW5kcyIsIngiLCJ5IiwibnVtUm93cyIsIm51bUNvbHVtbnMiLCJpbmNvbWluZ1NoYXBlcyIsInVwZGF0ZXNTdXNwZW5kZWQiLCJjZWxscyIsImNvbHVtbiIsImN1cnJlbnRSb3ciLCJyb3ciLCJwdXNoIiwib2NjdXBpZWRCeSIsImNhdGFsb2dlZCIsImNhdGFsb2dlZEJ5Iiwic2hhcGVPdmVybGFwc0JvYXJkIiwic2hhcGUiLCJzaGFwZVBvc2l0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsImdldCIsInNoYXBlQm91bmRzIiwiZ2V0V2lkdGgiLCJnZXRIZWlnaHQiLCJpbnRlcnNlY3RzQm91bmRzIiwicGxhY2VTaGFwZSIsIm1vdmFibGVTaGFwZSIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJjb2xvciIsImVxdWFscyIsImludmlzaWJsZVdoZW5TdGlsbFByb3BlcnR5Iiwic2V0IiwicGxhY2VtZW50UG9zaXRpb24iLCJzdXJyb3VuZGluZ1BvaW50c0xldmVsIiwiTWF0aCIsIm1heCIsInN1cnJvdW5kaW5nUG9pbnRzIiwiZ2V0T3V0ZXJTdXJyb3VuZGluZ1BvaW50cyIsInNvcnQiLCJwMSIsInAyIiwiZGlzdGFuY2UiLCJwb2ludEluZGV4IiwibGVuZ3RoIiwiaXNWYWxpZFRvUGxhY2UiLCJhZGRJbmNvbWluZ1NoYXBlIiwiYWRkU2hhcGVEaXJlY3RseVRvQ2VsbCIsImNlbGxDb2x1bW4iLCJjZWxsUm93IiwiY2VsbFRvTW9kZWxDb29yZHMiLCJnZXRQcm9wb3J0aW9uT2ZDb2xvciIsImNvbXBhcmVDb2xvciIsInRvdGFsQXJlYSIsImFyZWFPZlNwZWNpZmllZENvbG9yIiwiZm9yRWFjaCIsInJlc2lkZW50U2hhcGUiLCJhcmVhT2ZTaGFwZSIsInByb3BvcnRpb24iLCJyZWR1Y2UiLCJhZGRSZXNpZGVudFNoYXBlIiwicmVsZWFzZU9ycGhhbnMiLCJkZXN0aW5hdGlvbiIsImlzUmVzaWRlbnRTaGFwZSIsInVwZGF0ZUNlbGxPY2N1cGF0aW9uIiwicmVsZWFzZUFueU9ycGhhbnMiLCJ1cGRhdGVBbGwiLCJyZW1vdmVSZXNpZGVudFNoYXBlIiwic2VsZiIsInJlbW92ZSIsImxhenlMaW5rIiwicmVsZWFzZU9ycGhhbnNJZkRyb3BwZWRPZkJvYXJkIiwidXNlckNvbnRyb2xsZWQiLCJ1bmxpbmsiLCJzZXREZXN0aW5hdGlvbiIsImFuaW1hdGluZ1Byb3BlcnR5IiwiYW5pbWF0aW9uQ29tcGxldGVMaXN0ZW5lciIsImFuaW1hdGluZyIsInNwbGljZSIsImluZGV4T2YiLCJhZGRSZW1vdmFsTGlzdGVuZXIiLCJ0YWdMaXN0ZW5lciIsImxpc3RlbmVyIiwic2hhcGVQbGFjZW1lbnRCb2FyZCIsImxpc3RlbmVyVGFnTWF0Y2hlcyIsInJlbW92ZVRhZ2dlZE9ic2VydmVycyIsInByb3BlcnR5IiwidGFnZ2VkT2JzZXJ2ZXJzIiwiZm9yRWFjaExpc3RlbmVyIiwib2JzZXJ2ZXIiLCJ0YWdnZWRPYnNlcnZlciIsImdldENlbGwiLCJnZXRDZWxsT2NjdXBhbnQiLCJjZWxsIiwib3BlcmF0aW9uIiwieEluZGV4Iiwicm91bmRTeW1tZXRyaWMiLCJtaW5YIiwieUluZGV4IiwibWluWSIsInVwZGF0ZUFyZWFBbmRUb3RhbFBlcmltZXRlciIsImV4dGVyaW9yUGVyaW1ldGVycyIsInRvdGFsUGVyaW1ldGVyIiwiZXh0ZXJpb3JQZXJpbWV0ZXIiLCJpbnRlcmlvclBlcmltZXRlcnMiLCJpbnRlcmlvclBlcmltZXRlciIsIklOVkFMSURfVkFMVUUiLCJpc0NlbGxPY2N1cGllZCIsImlzQ2VsbE9jY3VwaWVkTm93T3JTb29uIiwiaSIsInRhcmdldENlbGwiLCJtb2RlbFRvQ2VsbFZlY3RvciIsIm5vcm1hbGl6ZWRXaWR0aCIsIm5vcm1hbGl6ZWRIZWlnaHQiLCJwb2ludCIsImxldmVsc1JlbW92ZWQiLCJub3JtYWxpemVkUG9pbnRzIiwibm9ybWFsaXplZFN0YXJ0aW5nUG9pbnQiLCJmbG9vciIsInNxdWFyZVNpemUiLCJvdXRlclN1cnJvdW5kaW5nUG9pbnRzIiwicCIsImNlbGxUb01vZGVsVmVjdG9yIiwibm9ybWFsaXplZFBvc2l0aW9uIiwicmVsZWFzZUFsbFNoYXBlcyIsInJlbGVhc2VNb2RlIiwic2hhcGVzVG9SZWxlYXNlIiwiY2xlYXIiLCJyZXR1cm5Ub09yaWdpbiIsImZhZGVBd2F5IiwiRXJyb3IiLCJpbmNsdWRlcyIsInJlbGVhc2VTaGFwZSIsImNvbnRhaW5zIiwidiIsIm1vZGVsVG9DZWxsQ29vcmRzIiwiY3JlYXRlU2hhcGVGcm9tUGVyaW1ldGVyUG9pbnRzIiwicGVyaW1ldGVyUG9pbnRzIiwicGVyaW1ldGVyU2hhcGUiLCJtb3ZlVG9Qb2ludCIsImxpbmVUb1BvaW50IiwiY2xvc2UiLCJjcmVhdGVTaGFwZUZyb21QZXJpbWV0ZXJMaXN0IiwicGVyaW1ldGVycyIsInNjYW5QZXJpbWV0ZXIiLCJ3aW5kb3dTdGFydCIsInNjYW5XaW5kb3ciLCJjb3B5Iiwic2NhbkNvbXBsZXRlIiwicHJldmlvdXNNb3ZlbWVudFZlY3RvciIsInVwTGVmdE9jY3VwaWVkIiwidXBSaWdodE9jY3VwaWVkIiwiZG93bkxlZnRPY2N1cGllZCIsImRvd25SaWdodE9jY3VwaWVkIiwibWFyY2hpbmdTcXVhcmVzU3RhdGUiLCJtb3ZlbWVudFZlY3RvciIsImFkZCIsInVwZGF0ZVBlcmltZXRlcnMiLCJyZXNldCIsImNvbnRpZ3VvdXNDZWxsR3JvdXBzIiwiaWRlbnRpZnlDb250aWd1b3VzQ2VsbEdyb3VwcyIsImNlbGxHcm91cCIsInRvcExlZnRDZWxsIiwidG9wTGVmdENlbGxPZkdyb3VwIiwib3V0bGluZVNoYXBlIiwiZW5jbG9zZWRTcGFjZXMiLCJjZWxsQ2VudGVySW5Nb2RlbCIsImFkZFhZIiwiY29udGFpbnNQb2ludCIsInRvcExlZnRTcGFjZSIsImVuY2xvc2VkUGVyaW1ldGVyUG9pbnRzIiwibGVmdG92ZXJFbXB0eVNwYWNlcyIsImVuY2xvc2VkU3BhY2UiLCJwb3NpdGlvblBvaW50IiwiY2VudGVyUG9pbnQiLCJwbHVzWFkiLCJwZXJpbWV0ZXJMaXN0c0VxdWFsIiwicGVyaW1ldGVyUG9pbnRzRXF1YWwiLCJwZXJpbWV0ZXIxIiwicGVyaW1ldGVyMiIsIkFycmF5IiwiaXNBcnJheSIsImV2ZXJ5IiwiaW5kZXgiLCJwZXJpbWV0ZXJMaXN0MSIsInBlcmltZXRlckxpc3QyIiwiaWRlbnRpZnlBZGphY2VudE9jY3VwaWVkQ2VsbHMiLCJzdGFydENlbGwiLCJPYmplY3QiLCJrZXlzIiwia2V5IiwiYWRqYWNlbnRDZWxsIiwidW5ncm91cGVkT2NjdXBpZWRDZWxscyIsIl8iLCJkaWZmZXJlbmNlIiwiaW5kZXhPZlJldGFpbmVkR3JvdXAiLCJncm91cCIsImdyb3VwSW5kZXgiLCJyZXBsYWNlU2hhcGVXaXRoVW5pdFNxdWFyZXMiLCJvcmlnaW5hbFNoYXBlIiwidW5pdFNxdWFyZXMiLCJtb3ZhYmxlVW5pdFNxdWFyZSIsInJlbW92YWxMaXN0ZW5lciIsInNldENvbXBvc2l0ZVNoYXBlQ29sb3JTY2hlbWUiLCJzdXNwZW5kVXBkYXRlc0ZvckJsb2NrQWRkIiwic2V0QmFja2dyb3VuZFNoYXBlIiwiY2VudGVyZWQiLCJ4T2Zmc2V0IiwieU9mZnNldCIsInRyYW5zbGF0ZWQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNoYXBlUGxhY2VtZW50Qm9hcmQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgb2YgYSByZWN0YW5ndWxhciBib2FyZCAobGlrZSBhIHdoaXRlIGJvYXJkIG9yIGJ1bGxldGluIGJvYXJkKSB1cG9uIHdoaWNoIHZhcmlvdXMgc21hbGxlciBzaGFwZXMgY2FuIGJlIHBsYWNlZC5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgRnJhY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9tb2RlbC9GcmFjdGlvbi5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGFyZWFCdWlsZGVyIGZyb20gJy4uLy4uL2FyZWFCdWlsZGVyLmpzJztcclxuaW1wb3J0IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzIGZyb20gJy4uL0FyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFBlcmltZXRlclNoYXBlIGZyb20gJy4vUGVyaW1ldGVyU2hhcGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1PVkVNRU5UX1ZFQ1RPUlMgPSB7XHJcbiAgLy8gVGhpcyBzaW0gaXMgdXNpbmcgc2NyZWVuIGNvbnZlbnRpb25zLCBtZWFuaW5nIHBvc2l0aXZlIFkgaW5kaWNhdGVzIGRvd24uXHJcbiAgdXA6IG5ldyBWZWN0b3IyKCAwLCAtMSApLFxyXG4gIGRvd246IG5ldyBWZWN0b3IyKCAwLCAxICksXHJcbiAgbGVmdDogbmV3IFZlY3RvcjIoIC0xLCAwICksXHJcbiAgcmlnaHQ6IG5ldyBWZWN0b3IyKCAxLCAwIClcclxufTtcclxuXHJcbi8vIEZ1bmN0aW9ucyB1c2VkIGZvciBzY2FubmluZyB0aGUgZWRnZSBvZiB0aGUgcGVyaW1ldGVyLiAgVGhlc2UgYXJlIGEga2V5IGNvbXBvbmVudCBvZiB0aGUgXCJtYXJjaGluZyBzcXVhcmVzXCJcclxuLy8gYWxnb3JpdGhtIHRoYXQgaXMgdXNlZCBmb3IgcGVyaW1ldGVyIHRyYXZlcnNhbCwgc2VlIHRoZSBmdW5jdGlvbiB3aGVyZSB0aGV5IGFyZSB1c2VkIGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG5jb25zdCBTQ0FOX0FSRUFfTU9WRU1FTlRfRlVOQ1RJT05TID0gW1xyXG4gIG51bGwsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwXHJcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy51cCwgICAgICAvLyAxXHJcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy5yaWdodCwgICAvLyAyXHJcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy5yaWdodCwgICAvLyAzXHJcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy5sZWZ0LCAgICAvLyA0XHJcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy51cCwgICAgICAvLyA1XHJcbiAgcHJldmlvdXNTdGVwID0+IHByZXZpb3VzU3RlcCA9PT0gTU9WRU1FTlRfVkVDVE9SUy51cCA/IE1PVkVNRU5UX1ZFQ1RPUlMubGVmdCA6IE1PVkVNRU5UX1ZFQ1RPUlMucmlnaHQsICAvLyA2XHJcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy5yaWdodCwgICAvLyA3XHJcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy5kb3duLCAgICAvLyA4XHJcbiAgcHJldmlvdXNTdGVwID0+IHByZXZpb3VzU3RlcCA9PT0gTU9WRU1FTlRfVkVDVE9SUy5yaWdodCA/IE1PVkVNRU5UX1ZFQ1RPUlMudXAgOiBNT1ZFTUVOVF9WRUNUT1JTLmRvd24sICAvLyA5XHJcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy5kb3duLCAgIC8vIDEwXHJcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy5kb3duLCAgIC8vIDExXHJcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy5sZWZ0LCAgIC8vIDEyXHJcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy51cCwgICAgIC8vIDEzXHJcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy5sZWZ0LCAgIC8vIDE0XHJcbiAgbnVsbCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDE1XHJcbl07XHJcblxyXG5jbGFzcyBTaGFwZVBsYWNlbWVudEJvYXJkIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtEaW1lbnNpb24yfSBzaXplXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHVuaXRTcXVhcmVMZW5ndGhcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtzdHJpbmcgfHwgQ29sb3J9IGNvbG9ySGFuZGxlZCBBIHN0cmluZyBvciBDb2xvciBvYmplY3QsIGNhbiBiZSB3aWxkY2FyZCBzdHJpbmcgKCcqJykgZm9yIGFsbCBjb2xvcnNcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gc2hvd0dyaWRQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBzaG93RGltZW5zaW9uc1Byb3BlcnR5XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHNpemUsIHVuaXRTcXVhcmVMZW5ndGgsIHBvc2l0aW9uLCBjb2xvckhhbmRsZWQsIHNob3dHcmlkUHJvcGVydHksIHNob3dEaW1lbnNpb25zUHJvcGVydHkgKSB7XHJcblxyXG4gICAgLy8gVGhlIHNpemUgc2hvdWxkIGJlIGFuIGludGVnZXIgbnVtYmVyIG9mIHVuaXQgc3F1YXJlcyBmb3IgYm90aCBkaW1lbnNpb25zLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2l6ZS53aWR0aCAlIHVuaXRTcXVhcmVMZW5ndGggPT09IDAgJiYgc2l6ZS5oZWlnaHQgJSB1bml0U3F1YXJlTGVuZ3RoID09PSAwLFxyXG4gICAgICAnU2hhcGVQbGFjZW1lbnRCb2FyZCBkaW1lbnNpb25zIG11c3QgYmUgaW50ZWdyYWwgbnVtYmVycyBvZiB1bml0IHNxdWFyZSBkaW1lbnNpb25zJyApO1xyXG5cclxuICAgIHRoaXMuc2hvd0dyaWRQcm9wZXJ0eSA9IHNob3dHcmlkUHJvcGVydHk7XHJcbiAgICB0aGlzLnNob3dEaW1lbnNpb25zUHJvcGVydHkgPSBzaG93RGltZW5zaW9uc1Byb3BlcnR5O1xyXG5cclxuICAgIC8vIFNldCB0aGUgaW5pdGlhbCBmaWxsIGFuZCBlZGdlIGNvbG9ycyBmb3IgdGhlIGNvbXBvc2l0ZSBzaGFwZSAoZGVmaW5lZCBpbiBQcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYmVsb3cpLlxyXG4gICAgdGhpcy5jb21wb3NpdGVTaGFwZUZpbGxDb2xvciA9IGNvbG9ySGFuZGxlZCA9PT0gJyonID8gbmV3IENvbG9yKCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5HUkVFTklTSF9DT0xPUiApIDogQ29sb3IudG9Db2xvciggY29sb3JIYW5kbGVkICk7XHJcbiAgICB0aGlzLmNvbXBvc2l0ZVNoYXBlRWRnZUNvbG9yID0gdGhpcy5jb21wb3NpdGVTaGFwZUZpbGxDb2xvci5jb2xvclV0aWxzRGFya2VyKCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5QRVJJTUVURVJfREFSS0VOX0ZBQ1RPUiApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgYm9vbGVhbiBSZWFkL1dyaXRlIHZhbHVlIHRoYXQgY29udHJvbHMgd2hldGhlciB0aGUgcGxhY2VtZW50IGJvYXJkIG1vdmVzIGluZGl2aWR1YWwgc2hhcGVzIHRoYXQgYXJlXHJcbiAgICAvLyBhZGRlZCB0byB0aGUgYm9hcmQgc3VjaCB0aGF0IHRoZXkgZm9ybSBhIHNpbmdsZSwgY29udGlndW91cywgY29tcG9zaXRlIHNoYXBlLCBvciBpZiBpdCBqdXN0IHNuYXBzIHRoZW0gdG8gdGhlXHJcbiAgICAvLyBncmlkLiBUaGUgcGVyaW1ldGVyIGFuZCBhcmVhIHZhbHVlcyBhcmUgb25seSB1cGRhdGVkIHdoZW4gdGhpcyBpcyBzZXQgdG8gdHJ1ZS5cclxuICAgIHRoaXMuZm9ybUNvbXBvc2l0ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCB0cnVlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyBSZWFkLW9ubHkgcHJvcGVydHkgdGhhdCBpbmRpY2F0ZXMgdGhlIGFyZWEgYW5kIHBlcmltZXRlciBvZiB0aGUgY29tcG9zaXRlIHNoYXBlLiAgVGhlc2UgbXVzdCBiZVxyXG4gICAgLy8gdG9nZXRoZXIgaW4gYW4gb2JqZWN0IHNvIHRoYXQgdGhleSBjYW4gYmUgdXBkYXRlZCBzaW11bHRhbmVvdXNseSwgb3RoZXJ3aXNlIHJhY2UgY29uZGl0aW9ucyBjYW4gb2NjdXIgd2hlblxyXG4gICAgLy8gZXZhbHVhdGluZyBjaGFsbGVuZ2VzLlxyXG4gICAgdGhpcy5hcmVhQW5kUGVyaW1ldGVyUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHtcclxuICAgICAgYXJlYTogMCwgLy8ge251bWJlcnx8c3RyaW5nfSAtIG51bWJlciB3aGVuIHZhbGlkLCBzdHJpbmcgd2hlbiBpbnZhbGlkXHJcbiAgICAgIHBlcmltZXRlcjogMCAgLy8ge251bWJlcnx8c3RyaW5nfSBudW1iZXIgd2hlbiB2YWxpZCwgc3RyaW5nIHdoZW4gaW52YWxpZFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgUmVhZC1vbmx5IHNoYXBlIGRlZmluZWQgaW4gdGVybXMgb2YgcGVyaW1ldGVyIHBvaW50cyB0aGF0IGRlc2NyaWJlcyB0aGUgY29tcG9zaXRlIHNoYXBlIGNyZWF0ZWQgYnkgYWxsXHJcbiAgICAvLyBvZiB0aGUgaW5kaXZpZHVhbCBzaGFwZXMgcGxhY2VkIG9uIHRoZSBib2FyZCBieSB0aGUgdXNlci5cclxuICAgIHRoaXMuY29tcG9zaXRlU2hhcGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbmV3IFBlcmltZXRlclNoYXBlKCBbXSwgW10sIHVuaXRTcXVhcmVMZW5ndGgsIHtcclxuICAgICAgZmlsbENvbG9yOiB0aGlzLmNvbXBvc2l0ZVNoYXBlRmlsbENvbG9yLFxyXG4gICAgICBlZGdlQ29sb3I6IHRoaXMuY29tcG9zaXRlU2hhcGVFZGdlQ29sb3JcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgUmVhZC1vbmx5IHNoYXBlIHRoYXQgY2FuIGJlIHBsYWNlZCBvbiB0aGUgYm9hcmQsIGdlbmVyYWxseSBhcyBhIHRlbXBsYXRlIG92ZXIgd2hpY2ggdGhlIHVzZXIgY2FuIGFkZFxyXG4gICAgLy8gb3RoZXIgc2hhcGVzLiAgVGhlIHNoYXBlIGlzIHBvc2l0aW9uZWQgcmVsYXRpdmUgdG8gdGhpcyBib2FyZCwgbm90IGluIGFic29sdXRlIG1vZGVsIHNwYWNlLiAgSXQgc2hvdWxkIGJlXHJcbiAgICAvLyBzZXQgdGhyb3VnaCB0aGUgbWV0aG9kIHByb3ZpZGVkIG9uIHRoaXMgY2xhc3MgcmF0aGVyIHRoYW4gZGlyZWN0bHkuXHJcbiAgICB0aGlzLmJhY2tncm91bmRTaGFwZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KFxyXG4gICAgICBuZXcgUGVyaW1ldGVyU2hhcGUoIFtdLCBbXSwgdW5pdFNxdWFyZUxlbmd0aCwgeyBmaWxsQ29sb3I6ICdibGFjaycgfSApXHJcbiAgICApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgUmVhZC93cml0ZSB2YWx1ZSBmb3IgY29udHJvbGxpbmcgd2hldGhlciB0aGUgYmFja2dyb3VuZCBzaGFwZSBzaG91bGQgc2hvdyBhIGdyaWQgd2hlbiBwb3J0cmF5ZWQgaW4gdGhlXHJcbiAgICAvLyB2aWV3LlxyXG4gICAgdGhpcy5zaG93R3JpZE9uQmFja2dyb3VuZFNoYXBlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gT2JzZXJ2YWJsZSBhcnJheSBvZiB0aGUgc2hhcGVzIHRoYXQgaGF2ZSBiZWVuIHBsYWNlZCBvbiB0aGlzIGJvYXJkLlxyXG4gICAgdGhpcy5yZXNpZGVudFNoYXBlcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpOyAvLyBAcHVibGljLCByZWFkIG9ubHlcclxuXHJcbiAgICAvLyBOb24tZHluYW1pYyBwdWJsaWMgdmFsdWVzLlxyXG4gICAgdGhpcy51bml0U3F1YXJlTGVuZ3RoID0gdW5pdFNxdWFyZUxlbmd0aDsgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5ib3VuZHMgPSBuZXcgQm91bmRzMiggcG9zaXRpb24ueCwgcG9zaXRpb24ueSwgcG9zaXRpb24ueCArIHNpemUud2lkdGgsIHBvc2l0aW9uLnkgKyBzaXplLmhlaWdodCApOyAvLyBAcHVibGljXHJcbiAgICB0aGlzLmNvbG9ySGFuZGxlZCA9IGNvbG9ySGFuZGxlZCA9PT0gJyonID8gY29sb3JIYW5kbGVkIDogQ29sb3IudG9Db2xvciggY29sb3JIYW5kbGVkICk7IC8vIEBwdWJsaWNcclxuXHJcbiAgICAvLyBQcml2YXRlIHZhcmlhYmxlc1xyXG4gICAgdGhpcy5udW1Sb3dzID0gc2l6ZS5oZWlnaHQgLyB1bml0U3F1YXJlTGVuZ3RoOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5udW1Db2x1bW5zID0gc2l6ZS53aWR0aCAvIHVuaXRTcXVhcmVMZW5ndGg7IC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmluY29taW5nU2hhcGVzID0gW107IC8vIEBwcml2YXRlLCB7QXJyYXkuPE1vdmFibGVTaGFwZT59LCBsaXN0IG9mIHNoYXBlcyB0aGF0IGFyZSBhbmltYXRpbmcgdG8gYSBzcG90IG9uIHRoaXMgYm9hcmQgYnV0IGFyZW4ndCBoZXJlIHlldFxyXG4gICAgdGhpcy51cGRhdGVzU3VzcGVuZGVkID0gZmFsc2U7IC8vIEBwcml2YXRlLCB1c2VkIHRvIGltcHJvdmUgcGVyZm9ybWFuY2Ugd2hlbiBhZGRpbmcgYSBidW5jaCBvZiBzaGFwZXMgYXQgb25jZSB0byB0aGUgYm9hcmRcclxuXHJcbiAgICAvLyBGb3IgZWZmaWNpZW5jeSBhbmQgc2ltcGxpY2l0eSBpbiBldmFsdWF0aW5nIHRoZSBpbnRlcmlvciBhbmQgZXh0ZXJpb3IgcGVyaW1ldGVyLCBpZGVudGlmeWluZyBvcnBoYW5lZCBzaGFwZXMsXHJcbiAgICAvLyBhbmQgc28gZm9ydGgsIGEgMkQgYXJyYXkgaXMgdXNlZCB0byB0cmFjayB2YXJpb3VzIHN0YXRlIGluZm9ybWF0aW9uIGFib3V0IHRoZSAnY2VsbHMnIHRoYXQgY29ycmVzcG9uZCB0byB0aGVcclxuICAgIC8vIHBvc2l0aW9ucyBvbiB0aGlzIGJvYXJkIHdoZXJlIHNoYXBlcyBtYXkgYmUgcGxhY2VkLlxyXG4gICAgdGhpcy5jZWxscyA9IFtdOyAvL0Bwcml2YXRlXHJcbiAgICBmb3IgKCBsZXQgY29sdW1uID0gMDsgY29sdW1uIDwgdGhpcy5udW1Db2x1bW5zOyBjb2x1bW4rKyApIHtcclxuICAgICAgY29uc3QgY3VycmVudFJvdyA9IFtdO1xyXG4gICAgICBmb3IgKCBsZXQgcm93ID0gMDsgcm93IDwgdGhpcy5udW1Sb3dzOyByb3crKyApIHtcclxuICAgICAgICAvLyBBZGQgYW4gb2JqZWN0IHRoYXQgZGVmaW5lcyB0aGUgaW5mb3JtYXRpb24gaW50ZXJuYWxseSB0cmFja2VkIGZvciBlYWNoIGNlbGwuXHJcbiAgICAgICAgY3VycmVudFJvdy5wdXNoKCB7XHJcbiAgICAgICAgICBjb2x1bW46IGNvbHVtbixcclxuICAgICAgICAgIHJvdzogcm93LFxyXG4gICAgICAgICAgb2NjdXBpZWRCeTogbnVsbCwgICAvLyB0aGUgc2hhcGUgb2NjdXB5aW5nIHRoaXMgY2VsbCwgbnVsbCBpZiBub25lXHJcbiAgICAgICAgICBjYXRhbG9nZWQ6IGZhbHNlLCAgIC8vIHVzZWQgYnkgZ3JvdXAgaWRlbnRpZmljYXRpb24gYWxnb3JpdGhtXHJcbiAgICAgICAgICBjYXRhbG9nZWRCeTogbnVsbCAgIC8vIHVzZWQgYnkgZ3JvdXAgaWRlbnRpZmljYXRpb24gYWxnb3JpdGhtXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuY2VsbHMucHVzaCggY3VycmVudFJvdyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICBzaGFwZU92ZXJsYXBzQm9hcmQoIHNoYXBlICkge1xyXG4gICAgY29uc3Qgc2hhcGVQb3NpdGlvbiA9IHNoYXBlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBzaGFwZUJvdW5kcyA9IG5ldyBCb3VuZHMyKFxyXG4gICAgICBzaGFwZVBvc2l0aW9uLngsXHJcbiAgICAgIHNoYXBlUG9zaXRpb24ueSxcclxuICAgICAgc2hhcGVQb3NpdGlvbi54ICsgc2hhcGUuc2hhcGUuYm91bmRzLmdldFdpZHRoKCksXHJcbiAgICAgIHNoYXBlUG9zaXRpb24ueSArIHNoYXBlLnNoYXBlLmJvdW5kcy5nZXRIZWlnaHQoKVxyXG4gICAgKTtcclxuICAgIHJldHVybiB0aGlzLmJvdW5kcy5pbnRlcnNlY3RzQm91bmRzKCBzaGFwZUJvdW5kcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGxhY2UgdGhlIHByb3ZpZGUgc2hhcGUgb24gdGhpcyBib2FyZC4gIFJldHVybnMgZmFsc2UgaWYgdGhlIGNvbG9yIGRvZXMgbm90IG1hdGNoIHRoZSBoYW5kbGVkIGNvbG9yIG9yIGlmIHRoZVxyXG4gICAqIHNoYXBlIGlzIG5vdCBwYXJ0aWFsbHkgb3ZlciB0aGUgYm9hcmQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7TW92YWJsZVNoYXBlfSBtb3ZhYmxlU2hhcGUgQSBtb2RlbCBzaGFwZVxyXG4gICAqL1xyXG4gIHBsYWNlU2hhcGUoIG1vdmFibGVTaGFwZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgIG1vdmFibGVTaGFwZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LmdldCgpID09PSBmYWxzZSxcclxuICAgICAgJ1NoYXBlcyBjYW5cXCd0IGJlIHBsYWNlZCB3aGVuIHN0aWxsIGNvbnRyb2xsZWQgYnkgdXNlci4nXHJcbiAgICApO1xyXG4gICAgLy8gT25seSBwbGFjZSB0aGUgc2hhcGUgaWYgaXQgaXMgb2YgdGhlIGNvcnJlY3QgY29sb3IgYW5kIGlzIHBvc2l0aW9uZWQgc28gdGhhdCBpdCBvdmVybGFwcyB3aXRoIHRoZSBib2FyZC5cclxuICAgIGlmICggKCB0aGlzLmNvbG9ySGFuZGxlZCAhPT0gJyonICYmICFtb3ZhYmxlU2hhcGUuY29sb3IuZXF1YWxzKCB0aGlzLmNvbG9ySGFuZGxlZCApICkgfHwgIXRoaXMuc2hhcGVPdmVybGFwc0JvYXJkKCBtb3ZhYmxlU2hhcGUgKSApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldCB0aGUgc2hhcGUncyB2aXNpYmlsaXR5IGJlaGF2aW9yIGJhc2VkIG9uIHdoZXRoZXIgYSBjb21wb3NpdGUgc2hhcGUgaXMgYmVpbmcgZGVwaWN0ZWQuXHJcbiAgICBtb3ZhYmxlU2hhcGUuaW52aXNpYmxlV2hlblN0aWxsUHJvcGVydHkuc2V0KCB0aGlzLmZvcm1Db21wb3NpdGVQcm9wZXJ0eS5nZXQoKSApO1xyXG5cclxuICAgIC8vIERldGVybWluZSB3aGVyZSB0byBwbGFjZSB0aGUgc2hhcGUgb24gdGhlIGJvYXJkLlxyXG4gICAgbGV0IHBsYWNlbWVudFBvc2l0aW9uID0gbnVsbDtcclxuICAgIGZvciAoIGxldCBzdXJyb3VuZGluZ1BvaW50c0xldmVsID0gMDtcclxuICAgICAgICAgIHN1cnJvdW5kaW5nUG9pbnRzTGV2ZWwgPCBNYXRoLm1heCggdGhpcy5udW1Sb3dzLCB0aGlzLm51bUNvbHVtbnMgKSAmJiBwbGFjZW1lbnRQb3NpdGlvbiA9PT0gbnVsbDtcclxuICAgICAgICAgIHN1cnJvdW5kaW5nUG9pbnRzTGV2ZWwrKyApIHtcclxuXHJcbiAgICAgIGNvbnN0IHN1cnJvdW5kaW5nUG9pbnRzID0gdGhpcy5nZXRPdXRlclN1cnJvdW5kaW5nUG9pbnRzKFxyXG4gICAgICAgIG1vdmFibGVTaGFwZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLFxyXG4gICAgICAgIHN1cnJvdW5kaW5nUG9pbnRzTGV2ZWxcclxuICAgICAgKTtcclxuICAgICAgc3Vycm91bmRpbmdQb2ludHMuc29ydCggKCBwMSwgcDIgKSA9PiBwMS5kaXN0YW5jZSggbW92YWJsZVNoYXBlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSAtIHAyLmRpc3RhbmNlKCBtb3ZhYmxlU2hhcGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApICk7XHJcbiAgICAgIGZvciAoIGxldCBwb2ludEluZGV4ID0gMDsgcG9pbnRJbmRleCA8IHN1cnJvdW5kaW5nUG9pbnRzLmxlbmd0aCAmJiBwbGFjZW1lbnRQb3NpdGlvbiA9PT0gbnVsbDsgcG9pbnRJbmRleCsrICkge1xyXG4gICAgICAgIGlmICggdGhpcy5pc1ZhbGlkVG9QbGFjZSggbW92YWJsZVNoYXBlLCBzdXJyb3VuZGluZ1BvaW50c1sgcG9pbnRJbmRleCBdICkgKSB7XHJcbiAgICAgICAgICBwbGFjZW1lbnRQb3NpdGlvbiA9IHN1cnJvdW5kaW5nUG9pbnRzWyBwb2ludEluZGV4IF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoIHBsYWNlbWVudFBvc2l0aW9uID09PSBudWxsICkge1xyXG4gICAgICAvLyBObyB2YWxpZCBwb3NpdGlvbiBmb3VuZCAtIGJhaWwgb3V0LlxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRkIHRoaXMgc2hhcGUgdG8gdGhlIGxpc3Qgb2YgaW5jb21pbmcgc2hhcGVzXHJcbiAgICB0aGlzLmFkZEluY29taW5nU2hhcGUoIG1vdmFibGVTaGFwZSwgcGxhY2VtZW50UG9zaXRpb24sIHRydWUgKTtcclxuXHJcbiAgICAvLyBJZiB3ZSBtYWRlIGl0IHRvIGhlcmUsIHBsYWNlbWVudCBzdWNjZWVkZWQuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhIHNoYXBlIGRpcmVjdGx5IHRvIHRoZSBzcGVjaWZpZWQgY2VsbC4gIFRoaXMgYnlwYXNzZXMgdGhlIHBsYWNlbWVudCBwcm9jZXNzLCBhbmQgaXMgZ2VuZXJhbGx5IHVzZWQgd2hlblxyXG4gICAqIGRpc3BsYXlpbmcgc29sdXRpb25zIHRvIGNoYWxsZW5nZXMuICBUaGUgc2hhcGUgd2lsbCBhbmltYXRlIHRvIHRoZSBjaG9zZW4gY2VsbC5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIGNlbGxDb2x1bW5cclxuICAgKiBAcGFyYW0gY2VsbFJvd1xyXG4gICAqIEBwYXJhbSBtb3ZhYmxlU2hhcGVcclxuICAgKi9cclxuICBhZGRTaGFwZURpcmVjdGx5VG9DZWxsKCBjZWxsQ29sdW1uLCBjZWxsUm93LCBtb3ZhYmxlU2hhcGUgKSB7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBzaGFwZSdzIHZpc2liaWxpdHkgYmVoYXZpb3IgYmFzZWQgb24gd2hldGhlciBhIGNvbXBvc2l0ZSBzaGFwZSBpcyBiZWluZyBkZXBpY3RlZC5cclxuICAgIG1vdmFibGVTaGFwZS5pbnZpc2libGVXaGVuU3RpbGxQcm9wZXJ0eS5zZXQoIHRoaXMuZm9ybUNvbXBvc2l0ZVByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBzaGFwZSBieSBwdXR0aW5nIGl0IG9uIHRoZSBsaXN0IG9mIGluY29taW5nIHNoYXBlcyBhbmQgc2V0dGluZyBpdHMgZGVzdGluYXRpb24uXHJcbiAgICB0aGlzLmFkZEluY29taW5nU2hhcGUoIG1vdmFibGVTaGFwZSwgdGhpcy5jZWxsVG9Nb2RlbENvb3JkcyggY2VsbENvbHVtbiwgY2VsbFJvdywgZmFsc2UgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBwcm9wb3J0aW9uIG9mIGFyZWEgdGhhdCBtYXRjaCB0aGUgcHJvdmlkZWQgY29sb3IuXHJcbiAgICogQHBhcmFtIGNvbG9yXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFByb3BvcnRpb25PZkNvbG9yKCBjb2xvciApIHtcclxuICAgIGNvbnN0IGNvbXBhcmVDb2xvciA9IENvbG9yLnRvQ29sb3IoIGNvbG9yICk7XHJcbiAgICBsZXQgdG90YWxBcmVhID0gMDtcclxuICAgIGxldCBhcmVhT2ZTcGVjaWZpZWRDb2xvciA9IDA7XHJcbiAgICB0aGlzLnJlc2lkZW50U2hhcGVzLmZvckVhY2goIHJlc2lkZW50U2hhcGUgPT4ge1xyXG4gICAgICBjb25zdCBhcmVhT2ZTaGFwZSA9IHJlc2lkZW50U2hhcGUuc2hhcGUuYm91bmRzLndpZHRoICogcmVzaWRlbnRTaGFwZS5zaGFwZS5ib3VuZHMuaGVpZ2h0IC8gKCB0aGlzLnVuaXRTcXVhcmVMZW5ndGggKiB0aGlzLnVuaXRTcXVhcmVMZW5ndGggKTtcclxuICAgICAgdG90YWxBcmVhICs9IGFyZWFPZlNoYXBlO1xyXG4gICAgICBpZiAoIGNvbXBhcmVDb2xvci5lcXVhbHMoIHJlc2lkZW50U2hhcGUuY29sb3IgKSApIHtcclxuICAgICAgICBhcmVhT2ZTcGVjaWZpZWRDb2xvciArPSBhcmVhT2ZTaGFwZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHByb3BvcnRpb24gPSBuZXcgRnJhY3Rpb24oIGFyZWFPZlNwZWNpZmllZENvbG9yLCB0b3RhbEFyZWEgKTtcclxuICAgIHByb3BvcnRpb24ucmVkdWNlKCk7XHJcbiAgICByZXR1cm4gcHJvcG9ydGlvbjtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlLCBhZGQgYSBzaGFwZSB0byB0aGUgbGlzdCBvZiByZXNpZGVudHMgYW5kIG1ha2UgdGhlIG90aGVyIHVwZGF0ZXMgdGhhdCBnbyBhbG9uZyB3aXRoIHRoaXMuXHJcbiAgYWRkUmVzaWRlbnRTaGFwZSggbW92YWJsZVNoYXBlLCByZWxlYXNlT3JwaGFucyApIHtcclxuXHJcbiAgICAvLyBNYWtlIHN1cmUgdGhhdCB0aGUgc2hhcGUgaXMgbm90IG1vdmluZ1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgICAgbW92YWJsZVNoYXBlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZXF1YWxzKCBtb3ZhYmxlU2hhcGUuZGVzdGluYXRpb24gKSxcclxuICAgICAgJ0Vycm9yOiBTaGFwZXMgc2hvdWxkIG5vdCBiZWNvbWUgcmVzaWRlbnRzIHVudGlsIHRoZXkgaGF2ZSBjb21wbGV0ZWQgYW5pbWF0aW5nLidcclxuICAgICk7XHJcblxyXG4gICAgLy8gTWFkZSBzdXJlIHRoYXQgdGhlIHNoYXBlIGlzbid0IGFscmVhZHkgYSByZXNpZGVudC5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzUmVzaWRlbnRTaGFwZSggbW92YWJsZVNoYXBlICksICdFcnJvcjogQXR0ZW1wdCB0byBhZGQgc2hhcGUgdGhhdCBpcyBhbHJlYWR5IGEgcmVzaWRlbnQuJyApO1xyXG5cclxuICAgIHRoaXMucmVzaWRlbnRTaGFwZXMucHVzaCggbW92YWJsZVNoYXBlICk7XHJcblxyXG4gICAgLy8gTWFrZSB0aGUgYXBwcm9wcmlhdGUgdXBkYXRlcy5cclxuICAgIHRoaXMudXBkYXRlQ2VsbE9jY3VwYXRpb24oIG1vdmFibGVTaGFwZSwgJ2FkZCcgKTtcclxuICAgIGlmICggcmVsZWFzZU9ycGhhbnMgKSB7XHJcbiAgICAgIHRoaXMucmVsZWFzZUFueU9ycGhhbnMoKTtcclxuICAgIH1cclxuICAgIHRoaXMudXBkYXRlQWxsKCk7XHJcbiAgfVxyXG5cclxuICAvL0Bwcml2YXRlLCByZW1vdmUgdGhlIHNwZWNpZmllZCBzaGFwZSBmcm9tIHRoZSBzaGFwZSBwbGFjZW1lbnQgYm9hcmRcclxuICByZW1vdmVSZXNpZGVudFNoYXBlKCBtb3ZhYmxlU2hhcGUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzUmVzaWRlbnRTaGFwZSggbW92YWJsZVNoYXBlICksICdFcnJvcjogQXR0ZW1wdCB0byByZW1vdmUgc2hhcGUgdGhhdCBpcyBub3QgYSByZXNpZGVudC4nICk7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHRoaXMucmVzaWRlbnRTaGFwZXMucmVtb3ZlKCBtb3ZhYmxlU2hhcGUgKTtcclxuICAgIHRoaXMudXBkYXRlQ2VsbE9jY3VwYXRpb24oIG1vdmFibGVTaGFwZSwgJ3JlbW92ZScgKTtcclxuICAgIHRoaXMudXBkYXRlQWxsKCk7XHJcblxyXG4gICAgaWYgKCBtb3ZhYmxlU2hhcGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgIC8vIFdhdGNoIHRoZSBzaGFwZSBzbyB0aGF0IHdlIGNhbiBkbyBuZWVkZWQgdXBkYXRlcyB3aGVuIHRoZSB1c2VyIHJlbGVhc2VzIGl0LlxyXG4gICAgICBtb3ZhYmxlU2hhcGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5sYXp5TGluayggZnVuY3Rpb24gcmVsZWFzZU9ycGhhbnNJZkRyb3BwZWRPZkJvYXJkKCB1c2VyQ29udHJvbGxlZCApIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdXNlckNvbnRyb2xsZWQsICdVbmV4cGVjdGVkIHRyYW5zaXRpb24gb2YgdXNlckNvbnRyb2xsZWQgZmxhZy4nICk7XHJcbiAgICAgICAgaWYgKCAhc2VsZi5zaGFwZU92ZXJsYXBzQm9hcmQoIG1vdmFibGVTaGFwZSApICkge1xyXG4gICAgICAgICAgLy8gVGhpcyBzaGFwZSBpc24ndCBjb21pbmcgYmFjaywgc28gd2UgbmVlZCB0byB0cmlnZ2VyIGFuIG9ycGhhbiByZWxlYXNlLlxyXG4gICAgICAgICAgc2VsZi5yZWxlYXNlQW55T3JwaGFucygpO1xyXG4gICAgICAgICAgc2VsZi51cGRhdGVBbGwoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbW92YWJsZVNoYXBlLnVzZXJDb250cm9sbGVkUHJvcGVydHkudW5saW5rKCByZWxlYXNlT3JwaGFuc0lmRHJvcHBlZE9mQm9hcmQgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGUsIGFkZCB0aGUgc2hhcGUgdG8gdGhlIGxpc3Qgb2YgaW5jb21pbmcgc2hhcGVzIGFuZCBzZXQgdXAgYSBsaXN0ZW5lciB0byBtb3ZlIGl0IHRvIHJlc2lkZW50IHNoYXBlc1xyXG4gIGFkZEluY29taW5nU2hhcGUoIG1vdmFibGVTaGFwZSwgZGVzdGluYXRpb24sIHJlbGVhc2VPcnBoYW5zICkge1xyXG5cclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgIG1vdmFibGVTaGFwZS5zZXREZXN0aW5hdGlvbiggZGVzdGluYXRpb24sIHRydWUgKTtcclxuXHJcbiAgICAvLyBUaGUgcmVtYWluaW5nIGNvZGUgaW4gdGhpcyBtZXRob2QgYXNzdW1lcyB0aGF0IHRoZSBzaGFwZSBpcyBhbmltYXRpbmcgdG8gdGhlIG5ldyBwb3NpdGlvbiwgYW5kIHdpbGwgY2F1c2VcclxuICAgIC8vIG9kZCByZXN1bHRzIGlmIGl0IGlzbid0LCBzbyB3ZSBkb3VibGUgY2hlY2sgaXQgaGVyZS5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1vdmFibGVTaGFwZS5hbmltYXRpbmdQcm9wZXJ0eS5nZXQoKSwgJ1NoYXBlIGlzIGlzIGV4cGVjdGVkIHRvIGJlIGFuaW1hdGluZycgKTtcclxuXHJcbiAgICAvLyBUaGUgc2hhcGUgaXMgbW92aW5nIHRvIGEgc3BvdCBvbiB0aGUgYm9hcmQuICBXZSBkb24ndCB3YW50IHRvIGFkZCBpdCB0byB0aGUgbGlzdCBvZiByZXNpZGVudCBzaGFwZXMgeWV0LCBvciB3ZVxyXG4gICAgLy8gbWF5IHRyaWdnZXIgYSBjaGFuZ2UgdG8gdGhlIGV4dGVyaW9yIGFuZCBpbnRlcmlvciBwZXJpbWV0ZXJzLCBidXQgd2UgbmVlZCB0byBrZWVwIGEgcmVmZXJlbmNlIHRvIGl0IHNvIHRoYXRcclxuICAgIC8vIHRoZSB2YWxpZCBwbGFjZW1lbnQgcG9zaXRpb25zIGNhbiBiZSB1cGRhdGVkLCBlc3BlY2lhbGx5IGluIG11bHRpLXRvdWNoIGVudmlyb25tZW50cy4gIFNvLCBiYXNpY2FsbHksIHRoZXJlIGlzXHJcbiAgICAvLyBhbiBpbnRlcm1lZGlhdGUgJ2hvbGRpbmcgcGxhY2UnIGZvciBpbmNvbWluZyBzaGFwZXMuXHJcbiAgICB0aGlzLmluY29taW5nU2hhcGVzLnB1c2goIG1vdmFibGVTaGFwZSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIGxpc3RlbmVyIHRoYXQgd2lsbCBtb3ZlIHRoaXMgc2hhcGUgZnJvbSB0aGUgaW5jb21pbmcgc2hhcGUgbGlzdCB0byB0aGUgcmVzaWRlbnQgbGlzdCBvbmNlIHRoZVxyXG4gICAgLy8gYW5pbWF0aW9uIGNvbXBsZXRlcy5cclxuICAgIGZ1bmN0aW9uIGFuaW1hdGlvbkNvbXBsZXRlTGlzdGVuZXIoIGFuaW1hdGluZyApIHtcclxuICAgICAgaWYgKCAhYW5pbWF0aW5nICkge1xyXG4gICAgICAgIC8vIE1vdmUgdGhlIHNoYXBlIGZyb20gdGhlIGluY29taW5nIGxpc3QgdG8gdGhlIHJlc2lkZW50IGxpc3QuXHJcbiAgICAgICAgc2VsZi5pbmNvbWluZ1NoYXBlcy5zcGxpY2UoIHNlbGYuaW5jb21pbmdTaGFwZXMuaW5kZXhPZiggbW92YWJsZVNoYXBlICksIDEgKTtcclxuICAgICAgICBzZWxmLmFkZFJlc2lkZW50U2hhcGUoIG1vdmFibGVTaGFwZSwgcmVsZWFzZU9ycGhhbnMgKTtcclxuICAgICAgICBtb3ZhYmxlU2hhcGUuYW5pbWF0aW5nUHJvcGVydHkudW5saW5rKCBhbmltYXRpb25Db21wbGV0ZUxpc3RlbmVyICk7XHJcbiAgICAgICAgaWYgKCBzZWxmLnVwZGF0ZXNTdXNwZW5kZWQgJiYgc2VsZi5pbmNvbWluZ1NoYXBlcy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgICAgICAvLyB1cGRhdGVzIGhhZCBiZWVuIHN1c3BlbmRlZCAoZm9yIGJldHRlciBwZXJmb3JtYW5jZSksIGFuZCB0aGUgbGFzdCBpbmNvbWluZyBzaGFwZXMgd2FzIGFkZGVkLCBzbyByZXN1bWUgdXBkYXRlc1xyXG4gICAgICAgICAgc2VsZi51cGRhdGVzU3VzcGVuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICBzZWxmLnVwZGF0ZUFsbCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2V0IHVwIGEgbGlzdGVuZXIgdG8gcmVtb3ZlIHRoaXMgc2hhcGUgaWYgYW5kIHdoZW4gdGhlIHVzZXIgZ3JhYnMgaXQuXHJcbiAgICAgIHNlbGYuYWRkUmVtb3ZhbExpc3RlbmVyKCBtb3ZhYmxlU2hhcGUgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUYWcgdGhlIGxpc3RlbmVyIHNvIHRoYXQgaXQgY2FuIGJlIHJlbW92ZWQgd2l0aG91dCBmaXJpbmcgaWYgbmVlZGVkLCBzdWNoIGFzIHdoZW4gdGhlIGJvYXJkIGlzIGNsZWFyZWQuXHJcbiAgICB0aGlzLnRhZ0xpc3RlbmVyKCBhbmltYXRpb25Db21wbGV0ZUxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gSG9vayB1cCB0aGUgbGlzdGVuZXIuXHJcbiAgICBtb3ZhYmxlU2hhcGUuYW5pbWF0aW5nUHJvcGVydHkubGF6eUxpbmsoIGFuaW1hdGlvbkNvbXBsZXRlTGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG5cclxuICAvLyBAcHJpdmF0ZSwgdGFnIGEgbGlzdGVuZXIgZm9yIHJlbW92YWxcclxuICB0YWdMaXN0ZW5lciggbGlzdGVuZXIgKSB7XHJcbiAgICBsaXN0ZW5lci5zaGFwZVBsYWNlbWVudEJvYXJkID0gdGhpcztcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlLCBjaGVjayBpZiBsaXN0ZW5lciBmdW5jdGlvbiB3YXMgdGFnZ2VkIGJ5IHRoaXMgaW5zdGFuY2VcclxuICBsaXN0ZW5lclRhZ01hdGNoZXMoIGxpc3RlbmVyICkge1xyXG4gICAgcmV0dXJuICggbGlzdGVuZXIuc2hhcGVQbGFjZW1lbnRCb2FyZCAmJiBsaXN0ZW5lci5zaGFwZVBsYWNlbWVudEJvYXJkID09PSB0aGlzICk7XHJcbiAgfVxyXG5cclxuICAvLyBUT0RPOiBUaGlzIGlzIHJhdGhlciB1Z2x5LiAgV29yayB3aXRoIFNSIHRvIGltcHJvdmUgb3IgZmluZCBhbHRlcm5hdGl2ZSwgb3IgdG8gYmFrZSBpbnRvIEF4b24uICBNYXliZSBhIG1hcC5cclxuICAvLyBAcHJpdmF0ZSwgcmVtb3ZlIGFsbCBvYnNlcnZlcnMgZnJvbSBhIHByb3BlcnR5IHRoYXQgaGF2ZSBiZWVuIHRhZ2dlZCBieSB0aGlzIHNoYXBlIHBsYWNlbWVudCBib2FyZC5cclxuICByZW1vdmVUYWdnZWRPYnNlcnZlcnMoIHByb3BlcnR5ICkge1xyXG4gICAgY29uc3QgdGFnZ2VkT2JzZXJ2ZXJzID0gW107XHJcbiAgICBwcm9wZXJ0eS5mb3JFYWNoTGlzdGVuZXIoIG9ic2VydmVyID0+IHtcclxuICAgICAgaWYgKCB0aGlzLmxpc3RlbmVyVGFnTWF0Y2hlcyggb2JzZXJ2ZXIgKSApIHtcclxuICAgICAgICB0YWdnZWRPYnNlcnZlcnMucHVzaCggb2JzZXJ2ZXIgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgdGFnZ2VkT2JzZXJ2ZXJzLmZvckVhY2goIHRhZ2dlZE9ic2VydmVyID0+IHtcclxuICAgICAgcHJvcGVydHkudW5saW5rKCB0YWdnZWRPYnNlcnZlciApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGUgQ29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIHJldHVybmluZyBhIGNlbGwgb3IgbnVsbCBpZiByb3cgb3IgY29sdW1uIGFyZSBvdXQgb2YgcmFuZ2UuXHJcbiAgZ2V0Q2VsbCggY29sdW1uLCByb3cgKSB7XHJcbiAgICBpZiAoIGNvbHVtbiA8IDAgfHwgcm93IDwgMCB8fCBjb2x1bW4gPj0gdGhpcy5udW1Db2x1bW5zIHx8IHJvdyA+PSB0aGlzLm51bVJvd3MgKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuY2VsbHNbIGNvbHVtbiBdWyByb3cgXTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlIEZ1bmN0aW9uIGZvciBnZXR0aW5nIHRoZSBvY2N1cGFudCBvZiB0aGUgc3BlY2lmaWVkIGNlbGwsIGRvZXMgYm91bmRzIGNoZWNraW5nLlxyXG4gIGdldENlbGxPY2N1cGFudCggY29sdW1uLCByb3cgKSB7XHJcbiAgICBjb25zdCBjZWxsID0gdGhpcy5nZXRDZWxsKCBjb2x1bW4sIHJvdyApO1xyXG4gICAgcmV0dXJuIGNlbGwgPyBjZWxsLm9jY3VwaWVkQnkgOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IG9yIGNsZWFyIHRoZSBvY2N1cGF0aW9uIHN0YXR1cyBvZiB0aGUgY2VsbHMuXHJcbiAgICogQHBhcmFtIG1vdmFibGVTaGFwZVxyXG4gICAqIEBwYXJhbSBvcGVyYXRpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZUNlbGxPY2N1cGF0aW9uKCBtb3ZhYmxlU2hhcGUsIG9wZXJhdGlvbiApIHtcclxuICAgIGNvbnN0IHhJbmRleCA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCAoIG1vdmFibGVTaGFwZS5kZXN0aW5hdGlvbi54IC0gdGhpcy5ib3VuZHMubWluWCApIC8gdGhpcy51bml0U3F1YXJlTGVuZ3RoICk7XHJcbiAgICBjb25zdCB5SW5kZXggPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggKCBtb3ZhYmxlU2hhcGUuZGVzdGluYXRpb24ueSAtIHRoaXMuYm91bmRzLm1pblkgKSAvIHRoaXMudW5pdFNxdWFyZUxlbmd0aCApO1xyXG5cclxuICAgIC8vIE1hcmsgYWxsIGNlbGxzIG9jY3VwaWVkIGJ5IHRoaXMgc2hhcGUuXHJcbiAgICBmb3IgKCBsZXQgcm93ID0gMDsgcm93IDwgbW92YWJsZVNoYXBlLnNoYXBlLmJvdW5kcy5oZWlnaHQgLyB0aGlzLnVuaXRTcXVhcmVMZW5ndGg7IHJvdysrICkge1xyXG4gICAgICBmb3IgKCBsZXQgY29sdW1uID0gMDsgY29sdW1uIDwgbW92YWJsZVNoYXBlLnNoYXBlLmJvdW5kcy53aWR0aCAvIHRoaXMudW5pdFNxdWFyZUxlbmd0aDsgY29sdW1uKysgKSB7XHJcbiAgICAgICAgdGhpcy5jZWxsc1sgeEluZGV4ICsgY29sdW1uIF1bIHlJbmRleCArIHJvdyBdLm9jY3VwaWVkQnkgPSBvcGVyYXRpb24gPT09ICdhZGQnID8gbW92YWJsZVNoYXBlIDogbnVsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICB1cGRhdGVBcmVhQW5kVG90YWxQZXJpbWV0ZXIoKSB7XHJcbiAgICBpZiAoIHRoaXMuY29tcG9zaXRlU2hhcGVQcm9wZXJ0eS5nZXQoKS5leHRlcmlvclBlcmltZXRlcnMubGVuZ3RoIDw9IDEgKSB7XHJcbiAgICAgIGxldCB0b3RhbEFyZWEgPSAwO1xyXG4gICAgICB0aGlzLnJlc2lkZW50U2hhcGVzLmZvckVhY2goIHJlc2lkZW50U2hhcGUgPT4ge1xyXG4gICAgICAgIHRvdGFsQXJlYSArPSByZXNpZGVudFNoYXBlLnNoYXBlLmJvdW5kcy53aWR0aCAqIHJlc2lkZW50U2hhcGUuc2hhcGUuYm91bmRzLmhlaWdodCAvICggdGhpcy51bml0U3F1YXJlTGVuZ3RoICogdGhpcy51bml0U3F1YXJlTGVuZ3RoICk7XHJcbiAgICAgIH0gKTtcclxuICAgICAgbGV0IHRvdGFsUGVyaW1ldGVyID0gMDtcclxuICAgICAgdGhpcy5jb21wb3NpdGVTaGFwZVByb3BlcnR5LmdldCgpLmV4dGVyaW9yUGVyaW1ldGVycy5mb3JFYWNoKCBleHRlcmlvclBlcmltZXRlciA9PiB7XHJcbiAgICAgICAgdG90YWxQZXJpbWV0ZXIgKz0gZXh0ZXJpb3JQZXJpbWV0ZXIubGVuZ3RoO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuY29tcG9zaXRlU2hhcGVQcm9wZXJ0eS5nZXQoKS5pbnRlcmlvclBlcmltZXRlcnMuZm9yRWFjaCggaW50ZXJpb3JQZXJpbWV0ZXIgPT4ge1xyXG4gICAgICAgIHRvdGFsUGVyaW1ldGVyICs9IGludGVyaW9yUGVyaW1ldGVyLmxlbmd0aDtcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFyZWFBbmRQZXJpbWV0ZXJQcm9wZXJ0eS5zZXQoIHtcclxuICAgICAgICBhcmVhOiB0b3RhbEFyZWEsXHJcbiAgICAgICAgcGVyaW1ldGVyOiB0b3RhbFBlcmltZXRlclxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gQXJlYSBhbmQgcGVyaW1ldGVyIHJlYWRpbmdzIGFyZSBjdXJyZW50bHkgaW52YWxpZC5cclxuICAgICAgdGhpcy5hcmVhQW5kUGVyaW1ldGVyUHJvcGVydHkuc2V0KCB7XHJcbiAgICAgICAgYXJlYTogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuSU5WQUxJRF9WQUxVRSxcclxuICAgICAgICBwZXJpbWV0ZXI6IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLklOVkFMSURfVkFMVUVcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGZpbmRpbmcgb3V0IHdoZXRoZXIgYSBjZWxsIGlzIG9jY3VwaWVkIHRoYXQgaGFuZGxlcyBvdXQgb2YgYm91bmRzIGNhc2UgKHJldHVybnMgZmFsc2UpLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIGNvbHVtblxyXG4gICAqIEBwYXJhbSByb3dcclxuICAgKi9cclxuICBpc0NlbGxPY2N1cGllZCggY29sdW1uLCByb3cgKSB7XHJcbiAgICBpZiAoIGNvbHVtbiA+PSB0aGlzLm51bUNvbHVtbnMgfHwgY29sdW1uIDwgMCB8fCByb3cgPj0gdGhpcy5udW1Sb3dzIHx8IHJvdyA8IDAgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5jZWxsc1sgY29sdW1uIF1bIHJvdyBdLm9jY3VwaWVkQnkgIT09IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgdHJ1ZSBpZiBhIGNlbGwgaXMgb2NjdXBpZWQgb3IgaWYgYW4gaW5jb21pbmcgc2hhcGUgaXMgaGVhZGluZyBmb3IgaXQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0gY29sdW1uXHJcbiAgICogQHBhcmFtIHJvd1xyXG4gICAqL1xyXG4gIGlzQ2VsbE9jY3VwaWVkTm93T3JTb29uKCBjb2x1bW4sIHJvdyApIHtcclxuICAgIGlmICggdGhpcy5pc0NlbGxPY2N1cGllZCggY29sdW1uLCByb3cgKSApIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmluY29taW5nU2hhcGVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCB0YXJnZXRDZWxsID0gdGhpcy5tb2RlbFRvQ2VsbFZlY3RvciggdGhpcy5pbmNvbWluZ1NoYXBlc1sgaSBdLmRlc3RpbmF0aW9uICk7XHJcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRXaWR0aCA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCB0aGlzLmluY29taW5nU2hhcGVzWyBpIF0uc2hhcGUuYm91bmRzLndpZHRoIC8gdGhpcy51bml0U3F1YXJlTGVuZ3RoICk7XHJcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRIZWlnaHQgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggdGhpcy5pbmNvbWluZ1NoYXBlc1sgaSBdLnNoYXBlLmJvdW5kcy5oZWlnaHQgLyB0aGlzLnVuaXRTcXVhcmVMZW5ndGggKTtcclxuICAgICAgaWYgKCBjb2x1bW4gPj0gdGFyZ2V0Q2VsbC54ICYmIGNvbHVtbiA8IHRhcmdldENlbGwueCArIG5vcm1hbGl6ZWRXaWR0aCAmJlxyXG4gICAgICAgICAgIHJvdyA+PSB0YXJnZXRDZWxsLnkgJiYgcm93IDwgdGFyZ2V0Q2VsbC55ICsgbm9ybWFsaXplZEhlaWdodCApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBvdXRlciBsYXllciBvZiBncmlkIHBvaW50cyBzdXJyb3VuZGluZyB0aGUgZ2l2ZW4gcG9pbnQuICBUaGUgMm5kIHBhcmFtZXRlciBpbmRpY2F0ZXMgaG93IG1hbnkgc3RlcHMgYXdheVxyXG4gICAqIGZyb20gdGhlIGNlbnRlciAnc2hlbGwnIHNob3VsZCBiZSBwcm92aWRlZC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSBwb2ludFxyXG4gICAqIEBwYXJhbSBsZXZlbHNSZW1vdmVkXHJcbiAgICovXHJcbiAgZ2V0T3V0ZXJTdXJyb3VuZGluZ1BvaW50cyggcG9pbnQsIGxldmVsc1JlbW92ZWQgKSB7XHJcbiAgICBjb25zdCBub3JtYWxpemVkUG9pbnRzID0gW107XHJcblxyXG4gICAgLy8gR2V0IHRoZSBjbG9zZXN0IHBvaW50IGluIGNlbGwgY29vcmRpbmF0ZXMuXHJcbiAgICBjb25zdCBub3JtYWxpemVkU3RhcnRpbmdQb2ludCA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICBNYXRoLmZsb29yKCAoIHBvaW50LnggLSB0aGlzLmJvdW5kcy5taW5YICkgLyB0aGlzLnVuaXRTcXVhcmVMZW5ndGggKSAtIGxldmVsc1JlbW92ZWQsXHJcbiAgICAgIE1hdGguZmxvb3IoICggcG9pbnQueSAtIHRoaXMuYm91bmRzLm1pblkgKSAvIHRoaXMudW5pdFNxdWFyZUxlbmd0aCApIC0gbGV2ZWxzUmVtb3ZlZFxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBzcXVhcmVTaXplID0gKCBsZXZlbHNSZW1vdmVkICsgMSApICogMjtcclxuXHJcbiAgICBmb3IgKCBsZXQgcm93ID0gMDsgcm93IDwgc3F1YXJlU2l6ZTsgcm93KysgKSB7XHJcbiAgICAgIGZvciAoIGxldCBjb2x1bW4gPSAwOyBjb2x1bW4gPCBzcXVhcmVTaXplOyBjb2x1bW4rKyApIHtcclxuICAgICAgICBpZiAoICggcm93ID09PSAwIHx8IHJvdyA9PT0gc3F1YXJlU2l6ZSAtIDEgfHwgY29sdW1uID09PSAwIHx8IGNvbHVtbiA9PT0gc3F1YXJlU2l6ZSAtIDEgKSAmJlxyXG4gICAgICAgICAgICAgKCBjb2x1bW4gKyBub3JtYWxpemVkU3RhcnRpbmdQb2ludC54IDw9IHRoaXMubnVtQ29sdW1ucyAmJiByb3cgKyBub3JtYWxpemVkU3RhcnRpbmdQb2ludC55IDw9IHRoaXMubnVtUm93cyApICkge1xyXG4gICAgICAgICAgLy8gVGhpcyBpcyBhbiBvdXRlciBwb2ludCwgYW5kIGlzIHZhbGlkLCBzbyBpbmNsdWRlIGl0LlxyXG4gICAgICAgICAgbm9ybWFsaXplZFBvaW50cy5wdXNoKCBuZXcgVmVjdG9yMiggY29sdW1uICsgbm9ybWFsaXplZFN0YXJ0aW5nUG9pbnQueCwgcm93ICsgbm9ybWFsaXplZFN0YXJ0aW5nUG9pbnQueSApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgb3V0ZXJTdXJyb3VuZGluZ1BvaW50cyA9IFtdO1xyXG4gICAgbm9ybWFsaXplZFBvaW50cy5mb3JFYWNoKCBwID0+IHsgb3V0ZXJTdXJyb3VuZGluZ1BvaW50cy5wdXNoKCB0aGlzLmNlbGxUb01vZGVsVmVjdG9yKCBwICkgKTsgfSApO1xyXG4gICAgcmV0dXJuIG91dGVyU3Vycm91bmRpbmdQb2ludHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmUgd2hldGhlciBpdCBpcyB2YWxpZCB0byBwbGFjZSB0aGUgZ2l2ZW4gc2hhcGUgYXQgdGhlIGdpdmVuIHBvc2l0aW9uLiAgRm9yIHBsYWNlbWVudCB0byBiZSB2YWxpZCwgdGhlXHJcbiAgICogc2hhcGUgY2FuJ3Qgb3ZlcmxhcCB3aXRoIGFueSBvdGhlciBzaGFwZSwgYW5kIG11c3Qgc2hhcmUgYXQgbGVhc3Qgb25lIHNpZGUgd2l0aCBhbiBvY2N1cGllZCBzcGFjZS5cclxuICAgKiBAcGFyYW0gbW92YWJsZVNoYXBlXHJcbiAgICogQHBhcmFtIHBvc2l0aW9uXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBpc1ZhbGlkVG9QbGFjZSggbW92YWJsZVNoYXBlLCBwb3NpdGlvbiApIHtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWRQb3NpdGlvbiA9IHRoaXMubW9kZWxUb0NlbGxWZWN0b3IoIHBvc2l0aW9uICk7XHJcbiAgICBjb25zdCBub3JtYWxpemVkV2lkdGggPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggbW92YWJsZVNoYXBlLnNoYXBlLmJvdW5kcy53aWR0aCAvIHRoaXMudW5pdFNxdWFyZUxlbmd0aCApO1xyXG4gICAgY29uc3Qgbm9ybWFsaXplZEhlaWdodCA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBtb3ZhYmxlU2hhcGUuc2hhcGUuYm91bmRzLmhlaWdodCAvIHRoaXMudW5pdFNxdWFyZUxlbmd0aCApO1xyXG4gICAgbGV0IHJvdztcclxuICAgIGxldCBjb2x1bW47XHJcblxyXG4gICAgLy8gUmV0dXJuIGZhbHNlIGlmIHRoZSBzaGFwZSB3b3VsZCBnbyBvZmYgdGhlIGJvYXJkIGlmIHBsYWNlZCBhdCB0aGlzIHBvc2l0aW9uLlxyXG4gICAgaWYgKCBub3JtYWxpemVkUG9zaXRpb24ueCA8IDAgfHwgbm9ybWFsaXplZFBvc2l0aW9uLnggKyBub3JtYWxpemVkV2lkdGggPiB0aGlzLm51bUNvbHVtbnMgfHxcclxuICAgICAgICAgbm9ybWFsaXplZFBvc2l0aW9uLnkgPCAwIHx8IG5vcm1hbGl6ZWRQb3NpdGlvbi55ICsgbm9ybWFsaXplZEhlaWdodCA+IHRoaXMubnVtUm93cyApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHRoZXJlIGFyZSBubyBvdGhlciBzaGFwZXMgb24gdGhlIGJvYXJkLCBhbnkgcG9zaXRpb24gb24gdGhlIGJvYXJkIGlzIHZhbGlkLlxyXG4gICAgaWYgKCB0aGlzLnJlc2lkZW50U2hhcGVzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmV0dXJuIGZhbHNlIGlmIHRoaXMgc2hhcGUgb3ZlcmxhcHMgYW55IHByZXZpb3VzbHkgcGxhY2VkIHNoYXBlcy5cclxuICAgIGZvciAoIHJvdyA9IDA7IHJvdyA8IG5vcm1hbGl6ZWRIZWlnaHQ7IHJvdysrICkge1xyXG4gICAgICBmb3IgKCBjb2x1bW4gPSAwOyBjb2x1bW4gPCBub3JtYWxpemVkV2lkdGg7IGNvbHVtbisrICkge1xyXG4gICAgICAgIGlmICggdGhpcy5pc0NlbGxPY2N1cGllZE5vd09yU29vbiggbm9ybWFsaXplZFBvc2l0aW9uLnggKyBjb2x1bW4sIG5vcm1hbGl6ZWRQb3NpdGlvbi55ICsgcm93ICkgKSB7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgdGhpcyBib2FyZCBpcyBub3Qgc2V0IHRvIGNvbnNvbGlkYXRlIHNoYXBlcywgd2UndmUgZG9uZSBlbm91Z2gsIGFuZCB0aGlzIHBvc2l0aW9uIGlzIHZhbGlkLlxyXG4gICAgaWYgKCAhdGhpcy5mb3JtQ29tcG9zaXRlUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoaXMgcG9zaXRpb24gaXMgb25seSB2YWxpZCBpZiB0aGUgc2hhcGUgd2lsbCBzaGFyZSBhbiBlZGdlIHdpdGggYW4gYWxyZWFkeSBwbGFjZWQgc2hhcGUgb3IgYW4gaW5jb21pbmcgc2hhcGUsXHJcbiAgICAvLyBzaW5jZSB0aGUgJ2Zvcm1Db21wb3NpdGUnIG1vZGUgaXMgZW5hYmxlZC5cclxuICAgIGZvciAoIHJvdyA9IDA7IHJvdyA8IG5vcm1hbGl6ZWRIZWlnaHQ7IHJvdysrICkge1xyXG4gICAgICBmb3IgKCBjb2x1bW4gPSAwOyBjb2x1bW4gPCBub3JtYWxpemVkV2lkdGg7IGNvbHVtbisrICkge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgIHRoaXMuaXNDZWxsT2NjdXBpZWROb3dPclNvb24oIG5vcm1hbGl6ZWRQb3NpdGlvbi54ICsgY29sdW1uLCBub3JtYWxpemVkUG9zaXRpb24ueSArIHJvdyAtIDEgKSB8fFxyXG4gICAgICAgICAgdGhpcy5pc0NlbGxPY2N1cGllZE5vd09yU29vbiggbm9ybWFsaXplZFBvc2l0aW9uLnggKyBjb2x1bW4gLSAxLCBub3JtYWxpemVkUG9zaXRpb24ueSArIHJvdyApIHx8XHJcbiAgICAgICAgICB0aGlzLmlzQ2VsbE9jY3VwaWVkTm93T3JTb29uKCBub3JtYWxpemVkUG9zaXRpb24ueCArIGNvbHVtbiArIDEsIG5vcm1hbGl6ZWRQb3NpdGlvbi55ICsgcm93ICkgfHxcclxuICAgICAgICAgIHRoaXMuaXNDZWxsT2NjdXBpZWROb3dPclNvb24oIG5vcm1hbGl6ZWRQb3NpdGlvbi54ICsgY29sdW1uLCBub3JtYWxpemVkUG9zaXRpb24ueSArIHJvdyArIDEgKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZSBhbGwgdGhlIHNoYXBlcyB0aGF0IGFyZSBjdXJyZW50bHkgb24gdGhpcyBib2FyZCBhbmQgc2VuZCB0aGVtIHRvIHRoZWlyIGhvbWUgcG9zaXRpb25zLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0gcmVsZWFzZU1vZGUgLSBDb250cm9scyB3aGF0IHRoZSBzaGFwZXMgZG8gYWZ0ZXIgcmVsZWFzZSwgb3B0aW9ucyBhcmUgJ2ZhZGUnLCAnYW5pbWF0ZUhvbWUnLCBhbmRcclxuICAgKiAnanVtcEhvbWUnLiAgJ2p1bXBIb21lJyBpcyB0aGUgZGVmYXVsdC5cclxuICAgKi9cclxuICByZWxlYXNlQWxsU2hhcGVzKCByZWxlYXNlTW9kZSApIHtcclxuICAgIGNvbnN0IHNoYXBlc1RvUmVsZWFzZSA9IFtdO1xyXG5cclxuICAgIC8vIFJlbW92ZSBhbGwgbGlzdGVuZXJzIGFkZGVkIHRvIHRoZSBzaGFwZXMgYnkgdGhpcyBwbGFjZW1lbnQgYm9hcmQuXHJcbiAgICB0aGlzLnJlc2lkZW50U2hhcGVzLmZvckVhY2goIHNoYXBlID0+IHtcclxuICAgICAgdGhpcy5yZW1vdmVUYWdnZWRPYnNlcnZlcnMoIHNoYXBlLnVzZXJDb250cm9sbGVkUHJvcGVydHkgKTtcclxuICAgICAgc2hhcGVzVG9SZWxlYXNlLnB1c2goIHNoYXBlICk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmluY29taW5nU2hhcGVzLmZvckVhY2goIHNoYXBlID0+IHtcclxuICAgICAgdGhpcy5yZW1vdmVUYWdnZWRPYnNlcnZlcnMoIHNoYXBlLmFuaW1hdGluZ1Byb3BlcnR5ICk7XHJcbiAgICAgIHNoYXBlc1RvUmVsZWFzZS5wdXNoKCBzaGFwZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENsZWFyIG91dCBhbGwgcmVmZXJlbmNlcyB0byBzaGFwZXMgcGxhY2VkIG9uIHRoaXMgYm9hcmQuXHJcbiAgICB0aGlzLnJlc2lkZW50U2hhcGVzLmNsZWFyKCk7XHJcbiAgICB0aGlzLmluY29taW5nU2hhcGVzLmxlbmd0aCA9IDA7XHJcblxyXG4gICAgLy8gQ2xlYXIgdGhlIGNlbGwgYXJyYXkgdGhhdCB0cmFja3Mgb2NjdXBhbmN5LlxyXG4gICAgZm9yICggbGV0IHJvdyA9IDA7IHJvdyA8IHRoaXMubnVtUm93czsgcm93KysgKSB7XHJcbiAgICAgIGZvciAoIGxldCBjb2x1bW4gPSAwOyBjb2x1bW4gPCB0aGlzLm51bUNvbHVtbnM7IGNvbHVtbisrICkge1xyXG4gICAgICAgIHRoaXMuY2VsbHNbIGNvbHVtbiBdWyByb3cgXS5vY2N1cGllZEJ5ID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFRlbGwgdGhlIHNoYXBlcyB3aGF0IHRvIGRvIGFmdGVyIGJlaW5nIHJlbGVhc2VkLlxyXG4gICAgc2hhcGVzVG9SZWxlYXNlLmZvckVhY2goIHNoYXBlID0+IHtcclxuICAgICAgaWYgKCB0eXBlb2YgKCByZWxlYXNlTW9kZSApID09PSAndW5kZWZpbmVkJyB8fCByZWxlYXNlTW9kZSA9PT0gJ2p1bXBIb21lJyApIHtcclxuICAgICAgICBzaGFwZS5yZXR1cm5Ub09yaWdpbiggZmFsc2UgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggcmVsZWFzZU1vZGUgPT09ICdhbmltYXRlSG9tZScgKSB7XHJcbiAgICAgICAgc2hhcGUucmV0dXJuVG9PcmlnaW4oIHRydWUgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggcmVsZWFzZU1vZGUgPT09ICdmYWRlJyApIHtcclxuICAgICAgICBzaGFwZS5mYWRlQXdheSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvciggJ1Vuc3VwcG9ydGVkIHJlbGVhc2UgbW9kZSBmb3Igc2hhcGVzLicgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFVwZGF0ZSBib2FyZCBzdGF0ZS5cclxuICAgIHRoaXMudXBkYXRlQWxsKCk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIC0gY2hlY2sgaWYgYSBzaGFwZSBpcyByZXNpZGVudCBvbiB0aGUgYm9hcmRcclxuICBpc1Jlc2lkZW50U2hhcGUoIHNoYXBlICkge1xyXG4gICAgcmV0dXJuIHRoaXMucmVzaWRlbnRTaGFwZXMuaW5jbHVkZXMoIHNoYXBlICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZVxyXG4gIHJlbGVhc2VTaGFwZSggc2hhcGUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzUmVzaWRlbnRTaGFwZSggc2hhcGUgKSB8fCB0aGlzLmluY29taW5nU2hhcGVzLmNvbnRhaW5zKCBzaGFwZSApLCAnRXJyb3I6IEFuIGF0dGVtcHQgd2FzIG1hZGUgdG8gcmVsZWFzZSBhIHNoYXBlIHRoYXQgaXMgbm90IHByZXNlbnQuJyApO1xyXG4gICAgaWYgKCB0aGlzLmlzUmVzaWRlbnRTaGFwZSggc2hhcGUgKSApIHtcclxuICAgICAgdGhpcy5yZW1vdmVUYWdnZWRPYnNlcnZlcnMoIHNoYXBlLnVzZXJDb250cm9sbGVkUHJvcGVydHkgKTtcclxuICAgICAgdGhpcy5yZW1vdmVSZXNpZGVudFNoYXBlKCBzaGFwZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuaW5jb21pbmdTaGFwZXMuaW5kZXhPZiggc2hhcGUgKSA+PSAwICkge1xyXG4gICAgICB0aGlzLnJlbW92ZVRhZ2dlZE9ic2VydmVycyggc2hhcGUuYW5pbWF0aW5nUHJvcGVydHkgKTtcclxuICAgICAgdGhpcy5pbmNvbWluZ1NoYXBlcy5zcGxpY2UoIHRoaXMuaW5jb21pbmdTaGFwZXMuaW5kZXhPZiggc2hhcGUgKSwgMSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy9AcHJpdmF0ZVxyXG4gIGNlbGxUb01vZGVsQ29vcmRzKCBjb2x1bW4sIHJvdyApIHtcclxuICAgIHJldHVybiBuZXcgVmVjdG9yMiggY29sdW1uICogdGhpcy51bml0U3F1YXJlTGVuZ3RoICsgdGhpcy5ib3VuZHMubWluWCwgcm93ICogdGhpcy51bml0U3F1YXJlTGVuZ3RoICsgdGhpcy5ib3VuZHMubWluWSApO1xyXG4gIH1cclxuXHJcbiAgLy9AcHJpdmF0ZVxyXG4gIGNlbGxUb01vZGVsVmVjdG9yKCB2ICkge1xyXG4gICAgcmV0dXJuIHRoaXMuY2VsbFRvTW9kZWxDb29yZHMoIHYueCwgdi55ICk7XHJcbiAgfVxyXG5cclxuICAvL0Bwcml2YXRlXHJcbiAgbW9kZWxUb0NlbGxDb29yZHMoIHgsIHkgKSB7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIFV0aWxzLnJvdW5kU3ltbWV0cmljKCAoIHggLSB0aGlzLmJvdW5kcy5taW5YICkgLyB0aGlzLnVuaXRTcXVhcmVMZW5ndGggKSxcclxuICAgICAgVXRpbHMucm91bmRTeW1tZXRyaWMoICggeSAtIHRoaXMuYm91bmRzLm1pblkgKSAvIHRoaXMudW5pdFNxdWFyZUxlbmd0aCApICk7XHJcbiAgfVxyXG5cclxuICAvL0Bwcml2YXRlXHJcbiAgbW9kZWxUb0NlbGxWZWN0b3IoIHYgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbFRvQ2VsbENvb3Jkcyggdi54LCB2LnkgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgY3JlYXRlU2hhcGVGcm9tUGVyaW1ldGVyUG9pbnRzKCBwZXJpbWV0ZXJQb2ludHMgKSB7XHJcbiAgICBjb25zdCBwZXJpbWV0ZXJTaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG4gICAgcGVyaW1ldGVyU2hhcGUubW92ZVRvUG9pbnQoIHBlcmltZXRlclBvaW50c1sgMCBdICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBwZXJpbWV0ZXJQb2ludHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHBlcmltZXRlclNoYXBlLmxpbmVUb1BvaW50KCBwZXJpbWV0ZXJQb2ludHNbIGkgXSApO1xyXG4gICAgfVxyXG4gICAgcGVyaW1ldGVyU2hhcGUuY2xvc2UoKTsgLy8gU2hvdWxkbid0IGJlIG5lZWRlZCwgYnV0IGJlc3QgdG8gYmUgc3VyZS5cclxuICAgIHJldHVybiBwZXJpbWV0ZXJTaGFwZTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgY3JlYXRlU2hhcGVGcm9tUGVyaW1ldGVyTGlzdCggcGVyaW1ldGVycyApIHtcclxuICAgIGNvbnN0IHBlcmltZXRlclNoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICBwZXJpbWV0ZXJzLmZvckVhY2goIHBlcmltZXRlclBvaW50cyA9PiB7XHJcbiAgICAgIHBlcmltZXRlclNoYXBlLm1vdmVUb1BvaW50KCBwZXJpbWV0ZXJQb2ludHNbIDAgXSApO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBwZXJpbWV0ZXJQb2ludHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgcGVyaW1ldGVyU2hhcGUubGluZVRvUG9pbnQoIHBlcmltZXRlclBvaW50c1sgaSBdICk7XHJcbiAgICAgIH1cclxuICAgICAgcGVyaW1ldGVyU2hhcGUuY2xvc2UoKTtcclxuICAgIH0gKTtcclxuICAgIHJldHVybiBwZXJpbWV0ZXJTaGFwZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcmNoaW5nIHNxdWFyZXMgYWxnb3JpdGhtIGZvciBzY2FubmluZyB0aGUgcGVyaW1ldGVyIG9mIGEgc2hhcGUsIHNlZVxyXG4gICAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01hcmNoaW5nX3NxdWFyZXMgb3Igc2VhcmNoIHRoZSBJbnRlcm5ldCBmb3IgJ01hcmNoaW5nIFNxdWFyZXMgQWxnb3JpdGhtJyBmb3IgbW9yZVxyXG4gICAqIGluZm9ybWF0aW9uIG9uIHRoaXMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBzY2FuUGVyaW1ldGVyKCB3aW5kb3dTdGFydCApIHtcclxuICAgIGNvbnN0IHNjYW5XaW5kb3cgPSB3aW5kb3dTdGFydC5jb3B5KCk7XHJcbiAgICBsZXQgc2NhbkNvbXBsZXRlID0gZmFsc2U7XHJcbiAgICBjb25zdCBwZXJpbWV0ZXJQb2ludHMgPSBbXTtcclxuICAgIGxldCBwcmV2aW91c01vdmVtZW50VmVjdG9yID0gTU9WRU1FTlRfVkVDVE9SUy51cDsgLy8gSW5pdCB0aGlzIHdheSBhbGxvd3MgYWxnb3JpdGhtIHRvIHdvcmsgZm9yIGludGVyaW9yIHBlcmltZXRlcnMuXHJcbiAgICB3aGlsZSAoICFzY2FuQ29tcGxldGUgKSB7XHJcblxyXG4gICAgICAvLyBTY2FuIHRoZSBjdXJyZW50IGZvdXItcGl4ZWwgYXJlYS5cclxuICAgICAgY29uc3QgdXBMZWZ0T2NjdXBpZWQgPSB0aGlzLmlzQ2VsbE9jY3VwaWVkKCBzY2FuV2luZG93LnggLSAxLCBzY2FuV2luZG93LnkgLSAxICk7XHJcbiAgICAgIGNvbnN0IHVwUmlnaHRPY2N1cGllZCA9IHRoaXMuaXNDZWxsT2NjdXBpZWQoIHNjYW5XaW5kb3cueCwgc2NhbldpbmRvdy55IC0gMSApO1xyXG4gICAgICBjb25zdCBkb3duTGVmdE9jY3VwaWVkID0gdGhpcy5pc0NlbGxPY2N1cGllZCggc2NhbldpbmRvdy54IC0gMSwgc2NhbldpbmRvdy55ICk7XHJcbiAgICAgIGNvbnN0IGRvd25SaWdodE9jY3VwaWVkID0gdGhpcy5pc0NlbGxPY2N1cGllZCggc2NhbldpbmRvdy54LCBzY2FuV2luZG93LnkgKTtcclxuXHJcbiAgICAgIC8vIE1hcCB0aGUgc2NhbiB0byB0aGUgb25lIG9mIDE2IHBvc3NpYmxlIHN0YXRlcy5cclxuICAgICAgbGV0IG1hcmNoaW5nU3F1YXJlc1N0YXRlID0gMDtcclxuICAgICAgaWYgKCB1cExlZnRPY2N1cGllZCApIHsgbWFyY2hpbmdTcXVhcmVzU3RhdGUgfD0gMTsgfSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWJpdHdpc2VcclxuICAgICAgaWYgKCB1cFJpZ2h0T2NjdXBpZWQgKSB7IG1hcmNoaW5nU3F1YXJlc1N0YXRlIHw9IDI7IH0gLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1iaXR3aXNlXHJcbiAgICAgIGlmICggZG93bkxlZnRPY2N1cGllZCApIHsgbWFyY2hpbmdTcXVhcmVzU3RhdGUgfD0gNDsgfSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWJpdHdpc2VcclxuICAgICAgaWYgKCBkb3duUmlnaHRPY2N1cGllZCApIHsgbWFyY2hpbmdTcXVhcmVzU3RhdGUgfD0gODsgfSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWJpdHdpc2VcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgIG1hcmNoaW5nU3F1YXJlc1N0YXRlICE9PSAwICYmIG1hcmNoaW5nU3F1YXJlc1N0YXRlICE9PSAxNSxcclxuICAgICAgICAnTWFyY2hpbmcgc3F1YXJlcyBhbGdvcml0aG0gcmVhY2hlZCBpbnZhbGlkIHN0YXRlLidcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIENvbnZlcnQgYW5kIGFkZCB0aGlzIHBvaW50IHRvIHRoZSBwZXJpbWV0ZXIgcG9pbnRzLlxyXG4gICAgICBwZXJpbWV0ZXJQb2ludHMucHVzaCggdGhpcy5jZWxsVG9Nb2RlbENvb3Jkcyggc2NhbldpbmRvdy54LCBzY2FuV2luZG93LnkgKSApO1xyXG5cclxuICAgICAgLy8gTW92ZSB0aGUgc2NhbiB3aW5kb3cgdG8gdGhlIG5leHQgcG9zaXRpb24uXHJcbiAgICAgIGNvbnN0IG1vdmVtZW50VmVjdG9yID0gU0NBTl9BUkVBX01PVkVNRU5UX0ZVTkNUSU9OU1sgbWFyY2hpbmdTcXVhcmVzU3RhdGUgXSggcHJldmlvdXNNb3ZlbWVudFZlY3RvciApO1xyXG4gICAgICBzY2FuV2luZG93LmFkZCggbW92ZW1lbnRWZWN0b3IgKTtcclxuICAgICAgcHJldmlvdXNNb3ZlbWVudFZlY3RvciA9IG1vdmVtZW50VmVjdG9yO1xyXG5cclxuICAgICAgaWYgKCBzY2FuV2luZG93LmVxdWFscyggd2luZG93U3RhcnQgKSApIHtcclxuICAgICAgICBzY2FuQ29tcGxldGUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGVyaW1ldGVyUG9pbnRzO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGUsIFVwZGF0ZSB0aGUgZXh0ZXJpb3IgYW5kIGludGVyaW9yIHBlcmltZXRlcnMuXHJcbiAgdXBkYXRlUGVyaW1ldGVycygpIHtcclxuICAgIC8vIFRoZSBwZXJpbWV0ZXJzIGNhbiBvbmx5IGJlIGNvbXB1dGVkIGZvciBhIHNpbmdsZSBjb25zb2xpZGF0ZWQgc2hhcGUuXHJcbiAgICBpZiAoICF0aGlzLmZvcm1Db21wb3NpdGVQcm9wZXJ0eS5nZXQoKSB8fCB0aGlzLnJlc2lkZW50U2hhcGVzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgdGhpcy5wZXJpbWV0ZXIgPSAwO1xyXG4gICAgICB0aGlzLmNvbXBvc2l0ZVNoYXBlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIH1cclxuICAgIGVsc2UgeyAvLyBEbyB0aGUgZnVsbC1ibG93biBwZXJpbWV0ZXIgY2FsY3VsYXRpb25cclxuICAgICAgbGV0IHJvdztcclxuICAgICAgbGV0IGNvbHVtbjtcclxuICAgICAgY29uc3QgZXh0ZXJpb3JQZXJpbWV0ZXJzID0gW107XHJcblxyXG4gICAgICAvLyBJZGVudGlmeSBlYWNoIG91dGVyIHBlcmltZXRlci4gIFRoZXJlIG1heSBiZSBtb3JlIHRoYW4gb25lIGlmIHRoZSB1c2VyIGlzIG1vdmluZyBhIHNoYXBlIHRoYXQgd2FzIHByZXZpb3VzbHlcclxuICAgICAgLy8gb24gdGhpcyBib2FyZCwgc2luY2UgYW55IG9ycGhhbmVkIHNoYXBlcyBhcmUgbm90IHJlbGVhc2VkIHVudGlsIHRoZSBtb3ZlIGlzIGNvbXBsZXRlLlxyXG4gICAgICBjb25zdCBjb250aWd1b3VzQ2VsbEdyb3VwcyA9IHRoaXMuaWRlbnRpZnlDb250aWd1b3VzQ2VsbEdyb3VwcygpO1xyXG4gICAgICBjb250aWd1b3VzQ2VsbEdyb3Vwcy5mb3JFYWNoKCBjZWxsR3JvdXAgPT4ge1xyXG5cclxuICAgICAgICAvLyBGaW5kIHRoZSB0b3AgbGVmdCBzcXVhcmUgb2YgdGhpcyBncm91cCB0byB1c2UgYXMgYSBzdGFydGluZyBwb2ludC5cclxuICAgICAgICBsZXQgdG9wTGVmdENlbGwgPSBudWxsO1xyXG4gICAgICAgIGNlbGxHcm91cC5mb3JFYWNoKCBjZWxsID0+IHtcclxuICAgICAgICAgIGlmICggdG9wTGVmdENlbGwgPT09IG51bGwgfHwgY2VsbC5yb3cgPCB0b3BMZWZ0Q2VsbC5yb3cgfHwgKCBjZWxsLnJvdyA9PT0gdG9wTGVmdENlbGwucm93ICYmIGNlbGwuY29sdW1uIDwgdG9wTGVmdENlbGwuY29sdW1uICkgKSB7XHJcbiAgICAgICAgICAgIHRvcExlZnRDZWxsID0gY2VsbDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIC8vIFNjYW4gdGhlIG91dGVyIHBlcmltZXRlciBhbmQgYWRkIHRvIGxpc3QuXHJcbiAgICAgICAgY29uc3QgdG9wTGVmdENlbGxPZkdyb3VwID0gbmV3IFZlY3RvcjIoIHRvcExlZnRDZWxsLmNvbHVtbiwgdG9wTGVmdENlbGwucm93ICk7XHJcbiAgICAgICAgZXh0ZXJpb3JQZXJpbWV0ZXJzLnB1c2goIHRoaXMuc2NhblBlcmltZXRlciggdG9wTGVmdENlbGxPZkdyb3VwICkgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gU2NhbiBmb3IgZW1wdHkgc3BhY2VzIGVuY2xvc2VkIHdpdGhpbiB0aGUgb3V0ZXIgcGVyaW1ldGVyKHMpLlxyXG4gICAgICBjb25zdCBvdXRsaW5lU2hhcGUgPSB0aGlzLmNyZWF0ZVNoYXBlRnJvbVBlcmltZXRlckxpc3QoIGV4dGVyaW9yUGVyaW1ldGVycyApO1xyXG4gICAgICBsZXQgZW5jbG9zZWRTcGFjZXMgPSBbXTtcclxuICAgICAgZm9yICggcm93ID0gMDsgcm93IDwgdGhpcy5udW1Sb3dzOyByb3crKyApIHtcclxuICAgICAgICBmb3IgKCBjb2x1bW4gPSAwOyBjb2x1bW4gPCB0aGlzLm51bUNvbHVtbnM7IGNvbHVtbisrICkge1xyXG4gICAgICAgICAgaWYgKCAhdGhpcy5pc0NlbGxPY2N1cGllZCggY29sdW1uLCByb3cgKSApIHtcclxuICAgICAgICAgICAgLy8gVGhpcyBjZWxsIGlzIGVtcHR5LiAgVGVzdCBpZiBpdCBpcyB3aXRoaW4gdGhlIG91dGxpbmUgcGVyaW1ldGVyLlxyXG4gICAgICAgICAgICBjb25zdCBjZWxsQ2VudGVySW5Nb2RlbCA9IHRoaXMuY2VsbFRvTW9kZWxDb29yZHMoIGNvbHVtbiwgcm93ICkuYWRkWFkoIHRoaXMudW5pdFNxdWFyZUxlbmd0aCAvIDIsIHRoaXMudW5pdFNxdWFyZUxlbmd0aCAvIDIgKTtcclxuICAgICAgICAgICAgaWYgKCBvdXRsaW5lU2hhcGUuY29udGFpbnNQb2ludCggY2VsbENlbnRlckluTW9kZWwgKSApIHtcclxuICAgICAgICAgICAgICBlbmNsb3NlZFNwYWNlcy5wdXNoKCBuZXcgVmVjdG9yMiggY29sdW1uLCByb3cgKSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBNYXAgdGhlIGludGVybmFsIHBlcmltZXRlcnNcclxuICAgICAgY29uc3QgaW50ZXJpb3JQZXJpbWV0ZXJzID0gW107XHJcbiAgICAgIHdoaWxlICggZW5jbG9zZWRTcGFjZXMubGVuZ3RoID4gMCApIHtcclxuXHJcbiAgICAgICAgLy8gTG9jYXRlIHRoZSB0b3AgbGVmdCBtb3N0IHNwYWNlXHJcbiAgICAgICAgbGV0IHRvcExlZnRTcGFjZSA9IGVuY2xvc2VkU3BhY2VzWyAwIF07XHJcbiAgICAgICAgZW5jbG9zZWRTcGFjZXMuZm9yRWFjaCggY2VsbCA9PiB7XHJcbiAgICAgICAgICBpZiAoIGNlbGwueSA8IHRvcExlZnRTcGFjZS55IHx8ICggY2VsbC55ID09PSB0b3BMZWZ0U3BhY2UueSAmJiBjZWxsLnggPCB0b3BMZWZ0U3BhY2UueCApICkge1xyXG4gICAgICAgICAgICB0b3BMZWZ0U3BhY2UgPSBjZWxsO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgLy8gTWFwIHRoZSBpbnRlcmlvciBwZXJpbWV0ZXIuXHJcbiAgICAgICAgY29uc3QgZW5jbG9zZWRQZXJpbWV0ZXJQb2ludHMgPSB0aGlzLnNjYW5QZXJpbWV0ZXIoIHRvcExlZnRTcGFjZSApO1xyXG4gICAgICAgIGludGVyaW9yUGVyaW1ldGVycy5wdXNoKCBlbmNsb3NlZFBlcmltZXRlclBvaW50cyApO1xyXG5cclxuICAgICAgICAvLyBJZGVudGlmeSBhbmQgc2F2ZSBhbGwgc3BhY2VzIG5vdCBlbmNsb3NlZCBieSB0aGlzIHBlcmltZXRlci5cclxuICAgICAgICBjb25zdCBwZXJpbWV0ZXJTaGFwZSA9IHRoaXMuY3JlYXRlU2hhcGVGcm9tUGVyaW1ldGVyUG9pbnRzKCBlbmNsb3NlZFBlcmltZXRlclBvaW50cyApO1xyXG4gICAgICAgIGNvbnN0IGxlZnRvdmVyRW1wdHlTcGFjZXMgPSBbXTtcclxuICAgICAgICBlbmNsb3NlZFNwYWNlcy5mb3JFYWNoKCBlbmNsb3NlZFNwYWNlID0+IHtcclxuICAgICAgICAgIGNvbnN0IHBvc2l0aW9uUG9pbnQgPSB0aGlzLmNlbGxUb01vZGVsQ29vcmRzKCBlbmNsb3NlZFNwYWNlLngsIGVuY2xvc2VkU3BhY2UueSApO1xyXG4gICAgICAgICAgY29uc3QgY2VudGVyUG9pbnQgPSBwb3NpdGlvblBvaW50LnBsdXNYWSggdGhpcy51bml0U3F1YXJlTGVuZ3RoIC8gMiwgdGhpcy51bml0U3F1YXJlTGVuZ3RoIC8gMiApO1xyXG4gICAgICAgICAgaWYgKCAhcGVyaW1ldGVyU2hhcGUuY29udGFpbnNQb2ludCggY2VudGVyUG9pbnQgKSApIHtcclxuICAgICAgICAgICAgLy8gVGhpcyBzcGFjZSBpcyBub3QgY29udGFpbmVkIGluIHRoZSBwZXJpbWV0ZXIgdGhhdCB3YXMganVzdCBtYXBwZWQuXHJcbiAgICAgICAgICAgIGxlZnRvdmVyRW1wdHlTcGFjZXMucHVzaCggZW5jbG9zZWRTcGFjZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHVwIGZvciB0aGUgbmV4dCB0aW1lIHRocm91Z2ggdGhlIGxvb3AuXHJcbiAgICAgICAgZW5jbG9zZWRTcGFjZXMgPSBsZWZ0b3ZlckVtcHR5U3BhY2VzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBVcGRhdGUgZXh0ZXJuYWxseSB2aXNpYmxlIHByb3BlcnRpZXMuICBPbmx5IHVwZGF0ZSB0aGUgcGVyaW1ldGVycyBpZiB0aGV5IGhhdmUgY2hhbmdlZCBpbiBvcmRlciB0byBtaW5pbWl6ZVxyXG4gICAgICAvLyB3b3JrIGRvbmUgaW4gdGhlIHZpZXcuXHJcbiAgICAgIGlmICggISggdGhpcy5wZXJpbWV0ZXJMaXN0c0VxdWFsKCBleHRlcmlvclBlcmltZXRlcnMsIHRoaXMuY29tcG9zaXRlU2hhcGVQcm9wZXJ0eS5nZXQoKS5leHRlcmlvclBlcmltZXRlcnMgKSAmJlxyXG4gICAgICAgICAgICAgIHRoaXMucGVyaW1ldGVyTGlzdHNFcXVhbCggaW50ZXJpb3JQZXJpbWV0ZXJzLCB0aGlzLmNvbXBvc2l0ZVNoYXBlUHJvcGVydHkuZ2V0KCkuaW50ZXJpb3JQZXJpbWV0ZXJzICkgKSApIHtcclxuICAgICAgICB0aGlzLmNvbXBvc2l0ZVNoYXBlUHJvcGVydHkuc2V0KCBuZXcgUGVyaW1ldGVyU2hhcGUoIGV4dGVyaW9yUGVyaW1ldGVycywgaW50ZXJpb3JQZXJpbWV0ZXJzLCB0aGlzLnVuaXRTcXVhcmVMZW5ndGgsIHtcclxuICAgICAgICAgIGZpbGxDb2xvcjogdGhpcy5jb21wb3NpdGVTaGFwZUZpbGxDb2xvcixcclxuICAgICAgICAgIGVkZ2VDb2xvcjogdGhpcy5jb21wb3NpdGVTaGFwZUVkZ2VDb2xvclxyXG4gICAgICAgIH0gKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZVxyXG4gIHBlcmltZXRlclBvaW50c0VxdWFsKCBwZXJpbWV0ZXIxLCBwZXJpbWV0ZXIyICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggcGVyaW1ldGVyMSApICYmIEFycmF5LmlzQXJyYXkoIHBlcmltZXRlcjIgKSwgJ0ludmFsaWQgcGFyYW1ldGVycyBmb3IgcGVyaW1ldGVyUG9pbnRzRXF1YWwnICk7XHJcbiAgICBpZiAoIHBlcmltZXRlcjEubGVuZ3RoICE9PSBwZXJpbWV0ZXIyLmxlbmd0aCApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBlcmltZXRlcjEuZXZlcnkoICggcG9pbnQsIGluZGV4ICkgPT4gcG9pbnQuZXF1YWxzKCBwZXJpbWV0ZXIyWyBpbmRleCBdICkgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgcGVyaW1ldGVyTGlzdHNFcXVhbCggcGVyaW1ldGVyTGlzdDEsIHBlcmltZXRlckxpc3QyICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggcGVyaW1ldGVyTGlzdDEgKSAmJiBBcnJheS5pc0FycmF5KCBwZXJpbWV0ZXJMaXN0MiApLCAnSW52YWxpZCBwYXJhbWV0ZXJzIGZvciBwZXJpbWV0ZXJMaXN0c0VxdWFsJyApO1xyXG4gICAgaWYgKCBwZXJpbWV0ZXJMaXN0MS5sZW5ndGggIT09IHBlcmltZXRlckxpc3QyLmxlbmd0aCApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBlcmltZXRlckxpc3QxLmV2ZXJ5KCAoIHBlcmltZXRlclBvaW50cywgaW5kZXggKSA9PiB0aGlzLnBlcmltZXRlclBvaW50c0VxdWFsKCBwZXJpbWV0ZXJQb2ludHMsIHBlcmltZXRlckxpc3QyWyBpbmRleCBdICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElkZW50aWZ5IGFsbCBjZWxscyB0aGF0IGFyZSBhZGphY2VudCB0byB0aGUgcHJvdmlkZWQgY2VsbCBhbmQgdGhhdCBhcmUgY3VycmVudGx5IG9jY3VwaWVkIGJ5IGEgc2hhcGUuICBPbmx5XHJcbiAgICogc2hhcGVzIHRoYXQgc2hhcmUgYW4gZWRnZSBhcmUgY29uc2lkZXJlZCB0byBiZSBhZGphY2VudCwgc2hhcGVzIHRoYXQgb25seSB0b3VjaCBhdCB0aGUgY29ybmVyIGRvbid0IGNvdW50LiAgVGhpc1xyXG4gICAqIHVzZXMgcmVjdXJzaW9uLiAgSXQgYWxzbyByZWxpZXMgb24gYSBmbGFnIHRoYXQgbXVzdCBiZSBjbGVhcmVkIGZvciB0aGUgY2VsbHMgYmVmb3JlIGNhbGxpbmcgdGhpcyBhbGdvcml0aG0uICBUaGVcclxuICAgKiBmbGFnIGlzIGRvbmUgZm9yIGVmZmljaWVuY3ksIGJ1dCB0aGlzIGNvdWxkIGJlIGNoYW5nZWQgdG8gc2VhcmNoIHRocm91Z2ggdGhlIGxpc3Qgb2YgY2VsbHMgaW4gdGhlIGNlbGwgZ3JvdXAgaWZcclxuICAgKiB0aGF0IGZsYWcgbWV0aG9kIGlzIHRvbyB3ZWlyZC5cclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHN0YXJ0Q2VsbFxyXG4gICAqIEBwYXJhbSBjZWxsR3JvdXBcclxuICAgKi9cclxuICBpZGVudGlmeUFkamFjZW50T2NjdXBpZWRDZWxscyggc3RhcnRDZWxsLCBjZWxsR3JvdXAgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzdGFydENlbGwub2NjdXBpZWRCeSAhPT0gbnVsbCwgJ1VzYWdlIGVycm9yOiBVbm9jY3VwaWVkIGNlbGwgcGFzc2VkIHRvIGdyb3VwIGlkZW50aWZpY2F0aW9uLicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFzdGFydENlbGwuY2F0YWxvZ2VkLCAnVXNhZ2UgZXJyb3I6IENhdGFsb2dlZCBjZWxsIHBhc3NlZCB0byBncm91cCBpZGVudGlmaWNhdGlvbiBhbGdvcml0aG0uJyApO1xyXG4gICAgLy8gQ2F0YWxvZyB0aGlzIGNlbGwuXHJcbiAgICBjZWxsR3JvdXAucHVzaCggc3RhcnRDZWxsICk7XHJcbiAgICBzdGFydENlbGwuY2F0YWxvZ2VkID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBDaGVjayBvY2N1cGFuY3kgb2YgZWFjaCBvZiB0aGUgZm91ciBhZGplY2VudCBjZWxscy5cclxuICAgIE9iamVjdC5rZXlzKCBNT1ZFTUVOVF9WRUNUT1JTICkuZm9yRWFjaCgga2V5ID0+IHtcclxuICAgICAgY29uc3QgbW92ZW1lbnRWZWN0b3IgPSBNT1ZFTUVOVF9WRUNUT1JTWyBrZXkgXTtcclxuICAgICAgY29uc3QgYWRqYWNlbnRDZWxsID0gdGhpcy5nZXRDZWxsKCBzdGFydENlbGwuY29sdW1uICsgbW92ZW1lbnRWZWN0b3IueCwgc3RhcnRDZWxsLnJvdyArIG1vdmVtZW50VmVjdG9yLnkgKTtcclxuICAgICAgaWYgKCBhZGphY2VudENlbGwgIT09IG51bGwgJiYgYWRqYWNlbnRDZWxsLm9jY3VwaWVkQnkgIT09IG51bGwgJiYgIWFkamFjZW50Q2VsbC5jYXRhbG9nZWQgKSB7XHJcbiAgICAgICAgdGhpcy5pZGVudGlmeUFkamFjZW50T2NjdXBpZWRDZWxscyggYWRqYWNlbnRDZWxsLCBjZWxsR3JvdXAgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSByZXByZXNlbnRpbmcgYWxsIGNvbnRpZ3VvdXMgZ3JvdXBzIG9mIG9jY3VwaWVkIGNlbGxzLiAgRWFjaCBncm91cCBpcyBhIGxpc3Qgb2YgY2VsbHMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICovXHJcbiAgaWRlbnRpZnlDb250aWd1b3VzQ2VsbEdyb3VwcygpIHtcclxuXHJcbiAgICAvLyBNYWtlIGEgbGlzdCBvZiBwb3NpdGlvbnMgZm9yIGFsbCBvY2N1cGllZCBjZWxscy5cclxuICAgIGxldCB1bmdyb3VwZWRPY2N1cGllZENlbGxzID0gW107XHJcbiAgICBmb3IgKCBsZXQgcm93ID0gMDsgcm93IDwgdGhpcy5udW1Sb3dzOyByb3crKyApIHtcclxuICAgICAgZm9yICggbGV0IGNvbHVtbiA9IDA7IGNvbHVtbiA8IHRoaXMubnVtQ29sdW1uczsgY29sdW1uKysgKSB7XHJcbiAgICAgICAgY29uc3QgY2VsbCA9IHRoaXMuY2VsbHNbIGNvbHVtbiBdWyByb3cgXTtcclxuICAgICAgICBpZiAoIGNlbGwub2NjdXBpZWRCeSAhPT0gbnVsbCApIHtcclxuICAgICAgICAgIHVuZ3JvdXBlZE9jY3VwaWVkQ2VsbHMucHVzaCggdGhpcy5jZWxsc1sgY29sdW1uIF1bIHJvdyBdICk7XHJcbiAgICAgICAgICAvLyBDbGVhciB0aGUgZmxhZyB1c2VkIGJ5IHRoZSBzZWFyY2ggYWxnb3JpdGhtLlxyXG4gICAgICAgICAgY2VsbC5jYXRhbG9nZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBJZGVudGlmeSB0aGUgaW50ZXJjb25uZWN0ZWQgZ3JvdXBzIG9mIGNlbGxzLlxyXG4gICAgY29uc3QgY29udGlndW91c0NlbGxHcm91cHMgPSBbXTtcclxuICAgIHdoaWxlICggdW5ncm91cGVkT2NjdXBpZWRDZWxscy5sZW5ndGggPiAwICkge1xyXG4gICAgICBjb25zdCBjZWxsR3JvdXAgPSBbXTtcclxuICAgICAgdGhpcy5pZGVudGlmeUFkamFjZW50T2NjdXBpZWRDZWxscyggdW5ncm91cGVkT2NjdXBpZWRDZWxsc1sgMCBdLCBjZWxsR3JvdXAgKTtcclxuICAgICAgY29udGlndW91c0NlbGxHcm91cHMucHVzaCggY2VsbEdyb3VwICk7XHJcbiAgICAgIHVuZ3JvdXBlZE9jY3VwaWVkQ2VsbHMgPSBfLmRpZmZlcmVuY2UoIHVuZ3JvdXBlZE9jY3VwaWVkQ2VsbHMsIGNlbGxHcm91cCApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjb250aWd1b3VzQ2VsbEdyb3VwcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2UgYW55IHNoYXBlcyB0aGF0IGFyZSByZXNpZGVudCBvbiB0aGUgYm9hcmQgYnV0IHRoYXQgZG9uJ3Qgc2hhcmUgYXQgbGVhc3Qgb25lIGVkZ2Ugd2l0aCB0aGUgbGFyZ2VzdFxyXG4gICAqIGNvbXBvc2l0ZSBzaGFwZSBvbiB0aGUgYm9hcmQuICBTdWNoIHNoYXBlcyBhcmUgcmVmZXJyZWQgdG8gYXMgJ29ycGhhbnMnIGFuZCwgd2hlbiByZWxlYXNlLCB0aGV5IGFyZSBzZW50IGJhY2sgdG9cclxuICAgKiB0aGUgcG9zaXRpb24gd2hlcmUgdGhleSB3ZXJlIGNyZWF0ZWQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICByZWxlYXNlQW55T3JwaGFucygpIHtcclxuXHJcbiAgICAvLyBPcnBoYW5zIGNhbiBvbmx5IGV4aXN0IHdoZW4gb3BlcmF0aW5nIGluIHRoZSAnZm9ybUNvbXBvc2l0ZScgbW9kZS5cclxuICAgIGlmICggdGhpcy5mb3JtQ29tcG9zaXRlUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIGNvbnN0IGNvbnRpZ3VvdXNDZWxsR3JvdXBzID0gdGhpcy5pZGVudGlmeUNvbnRpZ3VvdXNDZWxsR3JvdXBzKCk7XHJcblxyXG4gICAgICBpZiAoIGNvbnRpZ3VvdXNDZWxsR3JvdXBzLmxlbmd0aCA+IDEgKSB7XHJcbiAgICAgICAgLy8gVGhlcmUgYXJlIG9ycGhhbnMgdGhhdCBzaG91bGQgYmUgcmVsZWFzZWQuICBEZXRlcm1pbmUgd2hpY2ggb25lcy5cclxuICAgICAgICBsZXQgaW5kZXhPZlJldGFpbmVkR3JvdXAgPSAwO1xyXG4gICAgICAgIGNvbnRpZ3VvdXNDZWxsR3JvdXBzLmZvckVhY2goICggZ3JvdXAsIGluZGV4ICkgPT4ge1xyXG4gICAgICAgICAgaWYgKCBncm91cC5sZW5ndGggPiBjb250aWd1b3VzQ2VsbEdyb3Vwc1sgaW5kZXhPZlJldGFpbmVkR3JvdXAgXS5sZW5ndGggKSB7XHJcbiAgICAgICAgICAgIGluZGV4T2ZSZXRhaW5lZEdyb3VwID0gaW5kZXg7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICBjb250aWd1b3VzQ2VsbEdyb3Vwcy5mb3JFYWNoKCAoIGdyb3VwLCBncm91cEluZGV4ICkgPT4ge1xyXG4gICAgICAgICAgaWYgKCBncm91cEluZGV4ICE9PSBpbmRleE9mUmV0YWluZWRHcm91cCApIHtcclxuICAgICAgICAgICAgZ3JvdXAuZm9yRWFjaCggY2VsbCA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgbW92YWJsZVNoYXBlID0gY2VsbC5vY2N1cGllZEJ5O1xyXG4gICAgICAgICAgICAgIGlmICggbW92YWJsZVNoYXBlICE9PSBudWxsICkgeyAvLyBOZWVkIHRvIHRlc3QgaW4gY2FzZSBhIHByZXZpb3VzbHkgcmVsZWFzZWQgc2hhcGUgY292ZXJlZCBtdWx0aXBsZSBjZWxscy5cclxuICAgICAgICAgICAgICAgIHRoaXMucmVsZWFzZVNoYXBlKCBtb3ZhYmxlU2hhcGUgKTtcclxuICAgICAgICAgICAgICAgIG1vdmFibGVTaGFwZS5yZXR1cm5Ub09yaWdpbiggdHJ1ZSApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVwbGFjZSBvbmUgb2YgdGhlIGNvbXBvc2l0ZSBzaGFwZXMgdGhhdCBjdXJyZW50bHkgcmVzaWRlcyBvbiB0aGlzIGJvYXJkIHdpdGggYSBzZXQgb2YgdW5pdCBzcXVhcmVzLiAgVGhpcyBpc1xyXG4gICAqIGdlbmVyYWxseSBkb25lIHdoZW4gYSBjb21wb3NpdGUgc2hhcGUgd2FzIHBsYWNlZCBvbiB0aGUgYm9hcmQgYnV0IHdlIG5vdyB3YW50IGl0IHRyZWF0ZWQgYXMgYSBidW5jaCBvZiBzbWFsbGVyXHJcbiAgICogdW5pdCBzcXVhcmVzIGluc3RlYWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01vdmFibGVTaGFwZX0gb3JpZ2luYWxTaGFwZVxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPE1vdmFibGVTaGFwZT59IHVuaXRTcXVhcmVzIFBpZWNlcyB0aGF0IGNvbXByaXNlIHRoZSBvcmlnaW5hbCBzaGFwZSwgTVVTVCBCRSBDT1JSRUNUTFkgTE9DQVRFRFxyXG4gICAqIHNpbmNlIHRoaXMgbWV0aG9kIGRvZXMgbm90IHJlbG9jYXRlIHRoZW0gdG8gdGhlIGFwcHJvcHJpYXRlIHBsYWNlcy5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVwbGFjZVNoYXBlV2l0aFVuaXRTcXVhcmVzKCBvcmlnaW5hbFNoYXBlLCB1bml0U3F1YXJlcyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNSZXNpZGVudFNoYXBlKCBvcmlnaW5hbFNoYXBlICksICdFcnJvcjogU3BlY2lmaWVkIHNoYXBlIHRvIGJlIHJlcGxhY2VkIGRvZXMgbm90IGFwcGVhciB0byBiZSBwcmVzZW50LicgKTtcclxuXHJcbiAgICAvLyBUaGUgZm9sbG93aW5nIGFkZCBhbmQgcmVtb3ZlIG9wZXJhdGlvbnMgZG8gbm90IHVzZSB0aGUgYWRkIGFuZCByZW1vdmUgbWV0aG9kcyBpbiBvcmRlciB0byBhdm9pZCByZWxlYXNpbmdcclxuICAgIC8vIG9ycGhhbnMgKHdoaWNoIGNvdWxkIGNhdXNlIHVuZGVzaXJlZCBiZWhhdmlvcikgYW5kIGF0dHJpYnV0ZSB1cGRhdGVzICh3aGljaCBhcmUgdW5uZWNlc3NhcnkpLlxyXG4gICAgdGhpcy5yZXNpZGVudFNoYXBlcy5yZW1vdmUoIG9yaWdpbmFsU2hhcGUgKTtcclxuICAgIHRoaXMudXBkYXRlQ2VsbE9jY3VwYXRpb24oIG9yaWdpbmFsU2hhcGUsICdyZW1vdmUnICk7XHJcblxyXG4gICAgdW5pdFNxdWFyZXMuZm9yRWFjaCggbW92YWJsZVVuaXRTcXVhcmUgPT4ge1xyXG4gICAgICB0aGlzLnJlc2lkZW50U2hhcGVzLnB1c2goIG1vdmFibGVVbml0U3F1YXJlICk7XHJcblxyXG4gICAgICAvLyBTZXQgdXAgYSBsaXN0ZW5lciB0byByZW1vdmUgdGhpcyBzaGFwZSB3aGVuIHRoZSB1c2VyIGdyYWJzIGl0LlxyXG4gICAgICB0aGlzLmFkZFJlbW92YWxMaXN0ZW5lciggbW92YWJsZVVuaXRTcXVhcmUgKTtcclxuXHJcbiAgICAgIC8vIE1ha2Ugc29tZSBzdGF0ZSB1cGRhdGVzLlxyXG4gICAgICB0aGlzLnVwZGF0ZUNlbGxPY2N1cGF0aW9uKCBtb3ZhYmxlVW5pdFNxdWFyZSwgJ2FkZCcgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGFkZHMgYSBsaXN0ZW5lciB0aGF0IHdpbGwgcmVtb3ZlIHRoaXMgc2hhcGUgZnJvbSB0aGUgYm9hcmQgd2hlbiB0aGUgdXNlciBncmFicyBpdFxyXG4gICAqIEBwYXJhbSB7TW92YWJsZVNoYXBlfSBtb3ZhYmxlU2hhcGVcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGFkZFJlbW92YWxMaXN0ZW5lciggbW92YWJsZVNoYXBlICkge1xyXG5cclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJlbW92YWxMaXN0ZW5lciggdXNlckNvbnRyb2xsZWQgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgICAgdXNlckNvbnRyb2xsZWQgPT09IHRydWUsXHJcbiAgICAgICAgJ3Nob3VsZCBvbmx5IHNlZSBzaGFwZXMgYmVjb21lIHVzZXIgY29udHJvbGxlZCBhZnRlciBiZWluZyBhZGRlZCB0byBhIHBsYWNlbWVudCBib2FyZCdcclxuICAgICAgKTtcclxuICAgICAgc2VsZi5yZW1vdmVSZXNpZGVudFNoYXBlKCBtb3ZhYmxlU2hhcGUgKTtcclxuICAgICAgbW92YWJsZVNoYXBlLnVzZXJDb250cm9sbGVkUHJvcGVydHkudW5saW5rKCByZW1vdmFsTGlzdGVuZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnRhZ0xpc3RlbmVyKCByZW1vdmFsTGlzdGVuZXIgKTtcclxuICAgIG1vdmFibGVTaGFwZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxhenlMaW5rKCByZW1vdmFsTGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWMsIHNldCBjb2xvcnMgdXNlZCBmb3IgdGhlIGNvbXBvc2l0ZSBzaGFwZSBzaG93biBmb3IgdGhpcyBib2FyZFxyXG4gIHNldENvbXBvc2l0ZVNoYXBlQ29sb3JTY2hlbWUoIGZpbGxDb2xvciwgZWRnZUNvbG9yICkge1xyXG4gICAgdGhpcy5jb21wb3NpdGVTaGFwZUZpbGxDb2xvciA9IGZpbGxDb2xvcjtcclxuICAgIHRoaXMuY29tcG9zaXRlU2hhcGVFZGdlQ29sb3IgPSBlZGdlQ29sb3I7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZSwgVXBkYXRlIHBlcmltZXRlciBwb2ludHMsIHBsYWNlbWVudCBwb3NpdGlvbnMsIHRvdGFsIGFyZWEsIGFuZCB0b3RhbCBwZXJpbWV0ZXIuXHJcbiAgdXBkYXRlQWxsKCkge1xyXG4gICAgaWYgKCAhdGhpcy51cGRhdGVzU3VzcGVuZGVkICkge1xyXG4gICAgICB0aGlzLnVwZGF0ZVBlcmltZXRlcnMoKTtcclxuICAgICAgdGhpcy51cGRhdGVBcmVhQW5kVG90YWxQZXJpbWV0ZXIoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoaXMgbWV0aG9kIHN1c3BlbmRzIHVwZGF0ZXMgc28gdGhhdCBhIGJsb2NrIG9mIHNxdWFyZXMgY2FuIGJlIGFkZGVkIHdpdGhvdXQgaGF2aW5nIHRvIGFsbCB0aGUgcmVjYWxjdWxhdGlvbnNcclxuICAgKiBmb3IgZWFjaCBvbmUuICBUaGlzIGlzIGdlbmVyYWxseSBkb25lIGZvciBwZXJmb3JtYW5jZSByZWFzb25zIGluIGNhc2VzIHN1Y2ggYXMgZGVwaWN0aW5nIHRoZSBzb2x1dGlvbiB0byBhXHJcbiAgICogY2hhbGxlbmdlIGluIHRoZSBnYW1lLiAgVGhlIGZsYWcgaXMgYXV0b21hdGljYWxseSBjbGVhcmVkIHdoZW4gdGhlIGxhc3QgaW5jb21pbmcgc2hhcGUgaXMgYWRkZWQgYXMgYSByZXNpZGVudFxyXG4gICAqIHNoYXBlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdXNwZW5kVXBkYXRlc0ZvckJsb2NrQWRkKCkge1xyXG4gICAgdGhpcy51cGRhdGVzU3VzcGVuZGVkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgYmFja2dyb3VuZCBzaGFwZS4gIFRoZSBzaGFwZSBjYW4gb3B0aW9uYWxseSBiZSBjZW50ZXJlZCBob3Jpem9udGFsbHkgYW5kIHZlcnRpY2FsbHkgd2hlbiBwbGFjZWQgb24gdGhlXHJcbiAgICogYm9hcmQuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtQZXJpbWV0ZXJTaGFwZX0gcGVyaW1ldGVyU2hhcGUgVGhlIG5ldyBiYWNrZ3JvdW5kIHBlcmltZXRlclNoYXBlLCBvciBudWxsIHRvIHNldCBubyBiYWNrZ3JvdW5kXHJcbiAgICogcGVyaW1ldGVyU2hhcGUuXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBjZW50ZXJlZCBUcnVlIGlmIHRoZSBwZXJpbWV0ZXJTaGFwZSBzaG91bGQgYmUgY2VudGVyZWQgb24gdGhlIGJvYXJkIChidXQgc3RpbGwgYWxpZ25lZCB3aXRoIGdyaWQpLlxyXG4gICAqL1xyXG4gIHNldEJhY2tncm91bmRTaGFwZSggcGVyaW1ldGVyU2hhcGUsIGNlbnRlcmVkICkge1xyXG4gICAgaWYgKCBwZXJpbWV0ZXJTaGFwZSA9PT0gbnVsbCApIHtcclxuICAgICAgdGhpcy5iYWNrZ3JvdW5kU2hhcGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHBlcmltZXRlclNoYXBlIGluc3RhbmNlb2YgUGVyaW1ldGVyU2hhcGUsICdCYWNrZ3JvdW5kIHBlcmltZXRlclNoYXBlIG11c3QgYmUgYSBQZXJpbWV0ZXJTaGFwZS4nICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHBlcmltZXRlclNoYXBlLmdldFdpZHRoKCkgJSB0aGlzLnVuaXRTcXVhcmVMZW5ndGggPT09IDAgJiYgcGVyaW1ldGVyU2hhcGUuZ2V0SGVpZ2h0KCkgJSB0aGlzLnVuaXRTcXVhcmVMZW5ndGggPT09IDAsXHJcbiAgICAgICAgJ0JhY2tncm91bmQgc2hhcGUgd2lkdGggYW5kIGhlaWdodCBtdXN0IGJlIGludGVnZXIgbXVsdGlwbGVzIG9mIHRoZSB1bml0IHNxdWFyZSBzaXplLicgKTtcclxuICAgICAgaWYgKCBjZW50ZXJlZCApIHtcclxuICAgICAgICBjb25zdCB4T2Zmc2V0ID0gdGhpcy5ib3VuZHMubWluWCArIE1hdGguZmxvb3IoICggKCB0aGlzLmJvdW5kcy53aWR0aCAtIHBlcmltZXRlclNoYXBlLmdldFdpZHRoKCkgKSAvIDIgKSAvIHRoaXMudW5pdFNxdWFyZUxlbmd0aCApICogdGhpcy51bml0U3F1YXJlTGVuZ3RoO1xyXG4gICAgICAgIGNvbnN0IHlPZmZzZXQgPSB0aGlzLmJvdW5kcy5taW5ZICsgTWF0aC5mbG9vciggKCAoIHRoaXMuYm91bmRzLmhlaWdodCAtIHBlcmltZXRlclNoYXBlLmdldEhlaWdodCgpICkgLyAyICkgLyB0aGlzLnVuaXRTcXVhcmVMZW5ndGggKSAqIHRoaXMudW5pdFNxdWFyZUxlbmd0aDtcclxuICAgICAgICB0aGlzLmJhY2tncm91bmRTaGFwZVByb3BlcnR5LnNldCggcGVyaW1ldGVyU2hhcGUudHJhbnNsYXRlZCggeE9mZnNldCwgeU9mZnNldCApICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kU2hhcGVQcm9wZXJ0eS5zZXQoIHBlcmltZXRlclNoYXBlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmFyZWFCdWlsZGVyLnJlZ2lzdGVyKCAnU2hhcGVQbGFjZW1lbnRCb2FyZCcsIFNoYXBlUGxhY2VtZW50Qm9hcmQgKTtcclxuZXhwb3J0IGRlZmF1bHQgU2hhcGVQbGFjZW1lbnRCb2FyZDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFCLE1BQU0sOENBQThDO0FBQ2hGLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxRQUFRLE1BQU0sNkNBQTZDO0FBQ2xFLFNBQVNDLEtBQUssUUFBUSxtQ0FBbUM7QUFDekQsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQywwQkFBMEIsTUFBTSxrQ0FBa0M7QUFDekUsT0FBT0MsY0FBYyxNQUFNLHFCQUFxQjs7QUFFaEQ7QUFDQSxNQUFNQyxnQkFBZ0IsR0FBRztFQUN2QjtFQUNBQyxFQUFFLEVBQUUsSUFBSVIsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQztFQUN4QlMsSUFBSSxFQUFFLElBQUlULE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0VBQ3pCVSxJQUFJLEVBQUUsSUFBSVYsT0FBTyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUUsQ0FBQztFQUMxQlcsS0FBSyxFQUFFLElBQUlYLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRTtBQUMzQixDQUFDOztBQUVEO0FBQ0E7QUFDQSxNQUFNWSw0QkFBNEIsR0FBRyxDQUNuQyxJQUFJO0FBQTZDO0FBQ2pELE1BQU1MLGdCQUFnQixDQUFDQyxFQUFFO0FBQU87QUFDaEMsTUFBTUQsZ0JBQWdCLENBQUNJLEtBQUs7QUFBSTtBQUNoQyxNQUFNSixnQkFBZ0IsQ0FBQ0ksS0FBSztBQUFJO0FBQ2hDLE1BQU1KLGdCQUFnQixDQUFDRyxJQUFJO0FBQUs7QUFDaEMsTUFBTUgsZ0JBQWdCLENBQUNDLEVBQUU7QUFBTztBQUNoQ0ssWUFBWSxJQUFJQSxZQUFZLEtBQUtOLGdCQUFnQixDQUFDQyxFQUFFLEdBQUdELGdCQUFnQixDQUFDRyxJQUFJLEdBQUdILGdCQUFnQixDQUFDSSxLQUFLO0FBQUc7QUFDeEcsTUFBTUosZ0JBQWdCLENBQUNJLEtBQUs7QUFBSTtBQUNoQyxNQUFNSixnQkFBZ0IsQ0FBQ0UsSUFBSTtBQUFLO0FBQ2hDSSxZQUFZLElBQUlBLFlBQVksS0FBS04sZ0JBQWdCLENBQUNJLEtBQUssR0FBR0osZ0JBQWdCLENBQUNDLEVBQUUsR0FBR0QsZ0JBQWdCLENBQUNFLElBQUk7QUFBRztBQUN4RyxNQUFNRixnQkFBZ0IsQ0FBQ0UsSUFBSTtBQUFJO0FBQy9CLE1BQU1GLGdCQUFnQixDQUFDRSxJQUFJO0FBQUk7QUFDL0IsTUFBTUYsZ0JBQWdCLENBQUNHLElBQUk7QUFBSTtBQUMvQixNQUFNSCxnQkFBZ0IsQ0FBQ0MsRUFBRTtBQUFNO0FBQy9CLE1BQU1ELGdCQUFnQixDQUFDRyxJQUFJO0FBQUk7QUFDL0IsSUFBSSxDQUEyQjtBQUFBLENBQ2hDOztBQUVELE1BQU1JLG1CQUFtQixDQUFDO0VBRXhCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsSUFBSSxFQUFFQyxnQkFBZ0IsRUFBRUMsUUFBUSxFQUFFQyxZQUFZLEVBQUVDLGdCQUFnQixFQUFFQyxzQkFBc0IsRUFBRztJQUV0RztJQUNBQyxNQUFNLElBQUlBLE1BQU0sQ0FBRU4sSUFBSSxDQUFDTyxLQUFLLEdBQUdOLGdCQUFnQixLQUFLLENBQUMsSUFBSUQsSUFBSSxDQUFDUSxNQUFNLEdBQUdQLGdCQUFnQixLQUFLLENBQUMsRUFDM0YsbUZBQW9GLENBQUM7SUFFdkYsSUFBSSxDQUFDRyxnQkFBZ0IsR0FBR0EsZ0JBQWdCO0lBQ3hDLElBQUksQ0FBQ0Msc0JBQXNCLEdBQUdBLHNCQUFzQjs7SUFFcEQ7SUFDQSxJQUFJLENBQUNJLHVCQUF1QixHQUFHTixZQUFZLEtBQUssR0FBRyxHQUFHLElBQUloQixLQUFLLENBQUVFLDBCQUEwQixDQUFDcUIsY0FBZSxDQUFDLEdBQUd2QixLQUFLLENBQUN3QixPQUFPLENBQUVSLFlBQWEsQ0FBQztJQUM1SSxJQUFJLENBQUNTLHVCQUF1QixHQUFHLElBQUksQ0FBQ0gsdUJBQXVCLENBQUNJLGdCQUFnQixDQUFFeEIsMEJBQTBCLENBQUN5Qix1QkFBd0IsQ0FBQzs7SUFFbEk7SUFDQTtJQUNBO0lBQ0EsSUFBSSxDQUFDQyxxQkFBcUIsR0FBRyxJQUFJbEMsUUFBUSxDQUFFLElBQUssQ0FBQzs7SUFFakQ7SUFDQTtJQUNBO0lBQ0EsSUFBSSxDQUFDbUMsd0JBQXdCLEdBQUcsSUFBSW5DLFFBQVEsQ0FBRTtNQUM1Q29DLElBQUksRUFBRSxDQUFDO01BQUU7TUFDVEMsU0FBUyxFQUFFLENBQUMsQ0FBRTtJQUNoQixDQUFFLENBQUM7O0lBRUg7SUFDQTtJQUNBLElBQUksQ0FBQ0Msc0JBQXNCLEdBQUcsSUFBSXRDLFFBQVEsQ0FBRSxJQUFJUyxjQUFjLENBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRVcsZ0JBQWdCLEVBQUU7TUFDeEZtQixTQUFTLEVBQUUsSUFBSSxDQUFDWCx1QkFBdUI7TUFDdkNZLFNBQVMsRUFBRSxJQUFJLENBQUNUO0lBQ2xCLENBQUUsQ0FBRSxDQUFDOztJQUVMO0lBQ0E7SUFDQTtJQUNBLElBQUksQ0FBQ1UsdUJBQXVCLEdBQUcsSUFBSXpDLFFBQVEsQ0FDekMsSUFBSVMsY0FBYyxDQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUVXLGdCQUFnQixFQUFFO01BQUVtQixTQUFTLEVBQUU7SUFBUSxDQUFFLENBQ3ZFLENBQUM7O0lBRUQ7SUFDQTtJQUNBLElBQUksQ0FBQ0csaUNBQWlDLEdBQUcsSUFBSTFDLFFBQVEsQ0FBRSxLQUFNLENBQUM7O0lBRTlEO0lBQ0EsSUFBSSxDQUFDMkMsY0FBYyxHQUFHNUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7O0lBRS9DO0lBQ0EsSUFBSSxDQUFDcUIsZ0JBQWdCLEdBQUdBLGdCQUFnQixDQUFDLENBQUM7SUFDMUMsSUFBSSxDQUFDd0IsTUFBTSxHQUFHLElBQUkzQyxPQUFPLENBQUVvQixRQUFRLENBQUN3QixDQUFDLEVBQUV4QixRQUFRLENBQUN5QixDQUFDLEVBQUV6QixRQUFRLENBQUN3QixDQUFDLEdBQUcxQixJQUFJLENBQUNPLEtBQUssRUFBRUwsUUFBUSxDQUFDeUIsQ0FBQyxHQUFHM0IsSUFBSSxDQUFDUSxNQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3hHLElBQUksQ0FBQ0wsWUFBWSxHQUFHQSxZQUFZLEtBQUssR0FBRyxHQUFHQSxZQUFZLEdBQUdoQixLQUFLLENBQUN3QixPQUFPLENBQUVSLFlBQWEsQ0FBQyxDQUFDLENBQUM7O0lBRXpGO0lBQ0EsSUFBSSxDQUFDeUIsT0FBTyxHQUFHNUIsSUFBSSxDQUFDUSxNQUFNLEdBQUdQLGdCQUFnQixDQUFDLENBQUM7SUFDL0MsSUFBSSxDQUFDNEIsVUFBVSxHQUFHN0IsSUFBSSxDQUFDTyxLQUFLLEdBQUdOLGdCQUFnQixDQUFDLENBQUM7SUFDakQsSUFBSSxDQUFDNkIsY0FBYyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzFCLElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLENBQUM7O0lBRS9CO0lBQ0E7SUFDQTtJQUNBLElBQUksQ0FBQ0MsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ2pCLEtBQU0sSUFBSUMsTUFBTSxHQUFHLENBQUMsRUFBRUEsTUFBTSxHQUFHLElBQUksQ0FBQ0osVUFBVSxFQUFFSSxNQUFNLEVBQUUsRUFBRztNQUN6RCxNQUFNQyxVQUFVLEdBQUcsRUFBRTtNQUNyQixLQUFNLElBQUlDLEdBQUcsR0FBRyxDQUFDLEVBQUVBLEdBQUcsR0FBRyxJQUFJLENBQUNQLE9BQU8sRUFBRU8sR0FBRyxFQUFFLEVBQUc7UUFDN0M7UUFDQUQsVUFBVSxDQUFDRSxJQUFJLENBQUU7VUFDZkgsTUFBTSxFQUFFQSxNQUFNO1VBQ2RFLEdBQUcsRUFBRUEsR0FBRztVQUNSRSxVQUFVLEVBQUUsSUFBSTtVQUFJO1VBQ3BCQyxTQUFTLEVBQUUsS0FBSztVQUFJO1VBQ3BCQyxXQUFXLEVBQUUsSUFBSSxDQUFHO1FBQ3RCLENBQUUsQ0FBQztNQUNMOztNQUNBLElBQUksQ0FBQ1AsS0FBSyxDQUFDSSxJQUFJLENBQUVGLFVBQVcsQ0FBQztJQUMvQjtFQUNGOztFQUVBO0VBQ0FNLGtCQUFrQkEsQ0FBRUMsS0FBSyxFQUFHO0lBQzFCLE1BQU1DLGFBQWEsR0FBR0QsS0FBSyxDQUFDRSxnQkFBZ0IsQ0FBQ0MsR0FBRyxDQUFDLENBQUM7SUFDbEQsTUFBTUMsV0FBVyxHQUFHLElBQUkvRCxPQUFPLENBQzdCNEQsYUFBYSxDQUFDaEIsQ0FBQyxFQUNmZ0IsYUFBYSxDQUFDZixDQUFDLEVBQ2ZlLGFBQWEsQ0FBQ2hCLENBQUMsR0FBR2UsS0FBSyxDQUFDQSxLQUFLLENBQUNoQixNQUFNLENBQUNxQixRQUFRLENBQUMsQ0FBQyxFQUMvQ0osYUFBYSxDQUFDZixDQUFDLEdBQUdjLEtBQUssQ0FBQ0EsS0FBSyxDQUFDaEIsTUFBTSxDQUFDc0IsU0FBUyxDQUFDLENBQ2pELENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQ3RCLE1BQU0sQ0FBQ3VCLGdCQUFnQixDQUFFSCxXQUFZLENBQUM7RUFDcEQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VJLFVBQVVBLENBQUVDLFlBQVksRUFBRztJQUN6QjVDLE1BQU0sSUFBSUEsTUFBTSxDQUNkNEMsWUFBWSxDQUFDQyxzQkFBc0IsQ0FBQ1AsR0FBRyxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQ25ELHdEQUNGLENBQUM7SUFDRDtJQUNBLElBQU8sSUFBSSxDQUFDekMsWUFBWSxLQUFLLEdBQUcsSUFBSSxDQUFDK0MsWUFBWSxDQUFDRSxLQUFLLENBQUNDLE1BQU0sQ0FBRSxJQUFJLENBQUNsRCxZQUFhLENBQUMsSUFBTSxDQUFDLElBQUksQ0FBQ3FDLGtCQUFrQixDQUFFVSxZQUFhLENBQUMsRUFBRztNQUNsSSxPQUFPLEtBQUs7SUFDZDs7SUFFQTtJQUNBQSxZQUFZLENBQUNJLDBCQUEwQixDQUFDQyxHQUFHLENBQUUsSUFBSSxDQUFDeEMscUJBQXFCLENBQUM2QixHQUFHLENBQUMsQ0FBRSxDQUFDOztJQUUvRTtJQUNBLElBQUlZLGlCQUFpQixHQUFHLElBQUk7SUFDNUIsS0FBTSxJQUFJQyxzQkFBc0IsR0FBRyxDQUFDLEVBQzlCQSxzQkFBc0IsR0FBR0MsSUFBSSxDQUFDQyxHQUFHLENBQUUsSUFBSSxDQUFDL0IsT0FBTyxFQUFFLElBQUksQ0FBQ0MsVUFBVyxDQUFDLElBQUkyQixpQkFBaUIsS0FBSyxJQUFJLEVBQ2hHQyxzQkFBc0IsRUFBRSxFQUFHO01BRS9CLE1BQU1HLGlCQUFpQixHQUFHLElBQUksQ0FBQ0MseUJBQXlCLENBQ3REWCxZQUFZLENBQUNQLGdCQUFnQixDQUFDQyxHQUFHLENBQUMsQ0FBQyxFQUNuQ2Esc0JBQ0YsQ0FBQztNQUNERyxpQkFBaUIsQ0FBQ0UsSUFBSSxDQUFFLENBQUVDLEVBQUUsRUFBRUMsRUFBRSxLQUFNRCxFQUFFLENBQUNFLFFBQVEsQ0FBRWYsWUFBWSxDQUFDUCxnQkFBZ0IsQ0FBQ0MsR0FBRyxDQUFDLENBQUUsQ0FBQyxHQUFHb0IsRUFBRSxDQUFDQyxRQUFRLENBQUVmLFlBQVksQ0FBQ1AsZ0JBQWdCLENBQUNDLEdBQUcsQ0FBQyxDQUFFLENBQUUsQ0FBQztNQUMvSSxLQUFNLElBQUlzQixVQUFVLEdBQUcsQ0FBQyxFQUFFQSxVQUFVLEdBQUdOLGlCQUFpQixDQUFDTyxNQUFNLElBQUlYLGlCQUFpQixLQUFLLElBQUksRUFBRVUsVUFBVSxFQUFFLEVBQUc7UUFDNUcsSUFBSyxJQUFJLENBQUNFLGNBQWMsQ0FBRWxCLFlBQVksRUFBRVUsaUJBQWlCLENBQUVNLFVBQVUsQ0FBRyxDQUFDLEVBQUc7VUFDMUVWLGlCQUFpQixHQUFHSSxpQkFBaUIsQ0FBRU0sVUFBVSxDQUFFO1FBQ3JEO01BQ0Y7SUFDRjtJQUNBLElBQUtWLGlCQUFpQixLQUFLLElBQUksRUFBRztNQUNoQztNQUNBLE9BQU8sS0FBSztJQUNkOztJQUVBO0lBQ0EsSUFBSSxDQUFDYSxnQkFBZ0IsQ0FBRW5CLFlBQVksRUFBRU0saUJBQWlCLEVBQUUsSUFBSyxDQUFDOztJQUU5RDtJQUNBLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWMsc0JBQXNCQSxDQUFFQyxVQUFVLEVBQUVDLE9BQU8sRUFBRXRCLFlBQVksRUFBRztJQUUxRDtJQUNBQSxZQUFZLENBQUNJLDBCQUEwQixDQUFDQyxHQUFHLENBQUUsSUFBSSxDQUFDeEMscUJBQXFCLENBQUM2QixHQUFHLENBQUMsQ0FBRSxDQUFDOztJQUUvRTtJQUNBLElBQUksQ0FBQ3lCLGdCQUFnQixDQUFFbkIsWUFBWSxFQUFFLElBQUksQ0FBQ3VCLGlCQUFpQixDQUFFRixVQUFVLEVBQUVDLE9BQU8sRUFBRSxLQUFNLENBQUUsQ0FBQztFQUM3Rjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLG9CQUFvQkEsQ0FBRXRCLEtBQUssRUFBRztJQUM1QixNQUFNdUIsWUFBWSxHQUFHeEYsS0FBSyxDQUFDd0IsT0FBTyxDQUFFeUMsS0FBTSxDQUFDO0lBQzNDLElBQUl3QixTQUFTLEdBQUcsQ0FBQztJQUNqQixJQUFJQyxvQkFBb0IsR0FBRyxDQUFDO0lBQzVCLElBQUksQ0FBQ3JELGNBQWMsQ0FBQ3NELE9BQU8sQ0FBRUMsYUFBYSxJQUFJO01BQzVDLE1BQU1DLFdBQVcsR0FBR0QsYUFBYSxDQUFDdEMsS0FBSyxDQUFDaEIsTUFBTSxDQUFDbEIsS0FBSyxHQUFHd0UsYUFBYSxDQUFDdEMsS0FBSyxDQUFDaEIsTUFBTSxDQUFDakIsTUFBTSxJQUFLLElBQUksQ0FBQ1AsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDQSxnQkFBZ0IsQ0FBRTtNQUM1STJFLFNBQVMsSUFBSUksV0FBVztNQUN4QixJQUFLTCxZQUFZLENBQUN0QixNQUFNLENBQUUwQixhQUFhLENBQUMzQixLQUFNLENBQUMsRUFBRztRQUNoRHlCLG9CQUFvQixJQUFJRyxXQUFXO01BQ3JDO0lBQ0YsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsVUFBVSxHQUFHLElBQUkvRixRQUFRLENBQUUyRixvQkFBb0IsRUFBRUQsU0FBVSxDQUFDO0lBQ2xFSyxVQUFVLENBQUNDLE1BQU0sQ0FBQyxDQUFDO0lBQ25CLE9BQU9ELFVBQVU7RUFDbkI7O0VBRUE7RUFDQUUsZ0JBQWdCQSxDQUFFakMsWUFBWSxFQUFFa0MsY0FBYyxFQUFHO0lBRS9DO0lBQ0E5RSxNQUFNLElBQUlBLE1BQU0sQ0FDZDRDLFlBQVksQ0FBQ1AsZ0JBQWdCLENBQUNDLEdBQUcsQ0FBQyxDQUFDLENBQUNTLE1BQU0sQ0FBRUgsWUFBWSxDQUFDbUMsV0FBWSxDQUFDLEVBQ3RFLGdGQUNGLENBQUM7O0lBRUQ7SUFDQS9FLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUMsSUFBSSxDQUFDZ0YsZUFBZSxDQUFFcEMsWUFBYSxDQUFDLEVBQUUseURBQTBELENBQUM7SUFFcEgsSUFBSSxDQUFDMUIsY0FBYyxDQUFDWSxJQUFJLENBQUVjLFlBQWEsQ0FBQzs7SUFFeEM7SUFDQSxJQUFJLENBQUNxQyxvQkFBb0IsQ0FBRXJDLFlBQVksRUFBRSxLQUFNLENBQUM7SUFDaEQsSUFBS2tDLGNBQWMsRUFBRztNQUNwQixJQUFJLENBQUNJLGlCQUFpQixDQUFDLENBQUM7SUFDMUI7SUFDQSxJQUFJLENBQUNDLFNBQVMsQ0FBQyxDQUFDO0VBQ2xCOztFQUVBO0VBQ0FDLG1CQUFtQkEsQ0FBRXhDLFlBQVksRUFBRztJQUNsQzVDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ2dGLGVBQWUsQ0FBRXBDLFlBQWEsQ0FBQyxFQUFFLHdEQUF5RCxDQUFDO0lBQ2xILE1BQU15QyxJQUFJLEdBQUcsSUFBSTtJQUNqQixJQUFJLENBQUNuRSxjQUFjLENBQUNvRSxNQUFNLENBQUUxQyxZQUFhLENBQUM7SUFDMUMsSUFBSSxDQUFDcUMsb0JBQW9CLENBQUVyQyxZQUFZLEVBQUUsUUFBUyxDQUFDO0lBQ25ELElBQUksQ0FBQ3VDLFNBQVMsQ0FBQyxDQUFDO0lBRWhCLElBQUt2QyxZQUFZLENBQUNDLHNCQUFzQixDQUFDUCxHQUFHLENBQUMsQ0FBQyxFQUFHO01BRS9DO01BQ0FNLFlBQVksQ0FBQ0Msc0JBQXNCLENBQUMwQyxRQUFRLENBQUUsU0FBU0MsOEJBQThCQSxDQUFFQyxjQUFjLEVBQUc7UUFDdEd6RixNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDeUYsY0FBYyxFQUFFLCtDQUFnRCxDQUFDO1FBQ3BGLElBQUssQ0FBQ0osSUFBSSxDQUFDbkQsa0JBQWtCLENBQUVVLFlBQWEsQ0FBQyxFQUFHO1VBQzlDO1VBQ0F5QyxJQUFJLENBQUNILGlCQUFpQixDQUFDLENBQUM7VUFDeEJHLElBQUksQ0FBQ0YsU0FBUyxDQUFDLENBQUM7UUFDbEI7UUFDQXZDLFlBQVksQ0FBQ0Msc0JBQXNCLENBQUM2QyxNQUFNLENBQUVGLDhCQUErQixDQUFDO01BQzlFLENBQUUsQ0FBQztJQUNMO0VBQ0Y7O0VBRUE7RUFDQXpCLGdCQUFnQkEsQ0FBRW5CLFlBQVksRUFBRW1DLFdBQVcsRUFBRUQsY0FBYyxFQUFHO0lBRTVELE1BQU1PLElBQUksR0FBRyxJQUFJO0lBRWpCekMsWUFBWSxDQUFDK0MsY0FBYyxDQUFFWixXQUFXLEVBQUUsSUFBSyxDQUFDOztJQUVoRDtJQUNBO0lBQ0EvRSxNQUFNLElBQUlBLE1BQU0sQ0FBRTRDLFlBQVksQ0FBQ2dELGlCQUFpQixDQUFDdEQsR0FBRyxDQUFDLENBQUMsRUFBRSxzQ0FBdUMsQ0FBQzs7SUFFaEc7SUFDQTtJQUNBO0lBQ0E7SUFDQSxJQUFJLENBQUNkLGNBQWMsQ0FBQ00sSUFBSSxDQUFFYyxZQUFhLENBQUM7O0lBRXhDO0lBQ0E7SUFDQSxTQUFTaUQseUJBQXlCQSxDQUFFQyxTQUFTLEVBQUc7TUFDOUMsSUFBSyxDQUFDQSxTQUFTLEVBQUc7UUFDaEI7UUFDQVQsSUFBSSxDQUFDN0QsY0FBYyxDQUFDdUUsTUFBTSxDQUFFVixJQUFJLENBQUM3RCxjQUFjLENBQUN3RSxPQUFPLENBQUVwRCxZQUFhLENBQUMsRUFBRSxDQUFFLENBQUM7UUFDNUV5QyxJQUFJLENBQUNSLGdCQUFnQixDQUFFakMsWUFBWSxFQUFFa0MsY0FBZSxDQUFDO1FBQ3JEbEMsWUFBWSxDQUFDZ0QsaUJBQWlCLENBQUNGLE1BQU0sQ0FBRUcseUJBQTBCLENBQUM7UUFDbEUsSUFBS1IsSUFBSSxDQUFDNUQsZ0JBQWdCLElBQUk0RCxJQUFJLENBQUM3RCxjQUFjLENBQUNxQyxNQUFNLEtBQUssQ0FBQyxFQUFHO1VBQy9EO1VBQ0F3QixJQUFJLENBQUM1RCxnQkFBZ0IsR0FBRyxLQUFLO1VBQzdCNEQsSUFBSSxDQUFDRixTQUFTLENBQUMsQ0FBQztRQUNsQjtNQUNGOztNQUVBO01BQ0FFLElBQUksQ0FBQ1ksa0JBQWtCLENBQUVyRCxZQUFhLENBQUM7SUFDekM7O0lBRUE7SUFDQSxJQUFJLENBQUNzRCxXQUFXLENBQUVMLHlCQUEwQixDQUFDOztJQUU3QztJQUNBakQsWUFBWSxDQUFDZ0QsaUJBQWlCLENBQUNMLFFBQVEsQ0FBRU0seUJBQTBCLENBQUM7RUFDdEU7O0VBR0E7RUFDQUssV0FBV0EsQ0FBRUMsUUFBUSxFQUFHO0lBQ3RCQSxRQUFRLENBQUNDLG1CQUFtQixHQUFHLElBQUk7RUFDckM7O0VBRUE7RUFDQUMsa0JBQWtCQSxDQUFFRixRQUFRLEVBQUc7SUFDN0IsT0FBU0EsUUFBUSxDQUFDQyxtQkFBbUIsSUFBSUQsUUFBUSxDQUFDQyxtQkFBbUIsS0FBSyxJQUFJO0VBQ2hGOztFQUVBO0VBQ0E7RUFDQUUscUJBQXFCQSxDQUFFQyxRQUFRLEVBQUc7SUFDaEMsTUFBTUMsZUFBZSxHQUFHLEVBQUU7SUFDMUJELFFBQVEsQ0FBQ0UsZUFBZSxDQUFFQyxRQUFRLElBQUk7TUFDcEMsSUFBSyxJQUFJLENBQUNMLGtCQUFrQixDQUFFSyxRQUFTLENBQUMsRUFBRztRQUN6Q0YsZUFBZSxDQUFDMUUsSUFBSSxDQUFFNEUsUUFBUyxDQUFDO01BQ2xDO0lBQ0YsQ0FBRSxDQUFDO0lBQ0hGLGVBQWUsQ0FBQ2hDLE9BQU8sQ0FBRW1DLGNBQWMsSUFBSTtNQUN6Q0osUUFBUSxDQUFDYixNQUFNLENBQUVpQixjQUFlLENBQUM7SUFDbkMsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7RUFDQUMsT0FBT0EsQ0FBRWpGLE1BQU0sRUFBRUUsR0FBRyxFQUFHO0lBQ3JCLElBQUtGLE1BQU0sR0FBRyxDQUFDLElBQUlFLEdBQUcsR0FBRyxDQUFDLElBQUlGLE1BQU0sSUFBSSxJQUFJLENBQUNKLFVBQVUsSUFBSU0sR0FBRyxJQUFJLElBQUksQ0FBQ1AsT0FBTyxFQUFHO01BQy9FLE9BQU8sSUFBSTtJQUNiO0lBQ0EsT0FBTyxJQUFJLENBQUNJLEtBQUssQ0FBRUMsTUFBTSxDQUFFLENBQUVFLEdBQUcsQ0FBRTtFQUNwQzs7RUFFQTtFQUNBZ0YsZUFBZUEsQ0FBRWxGLE1BQU0sRUFBRUUsR0FBRyxFQUFHO0lBQzdCLE1BQU1pRixJQUFJLEdBQUcsSUFBSSxDQUFDRixPQUFPLENBQUVqRixNQUFNLEVBQUVFLEdBQUksQ0FBQztJQUN4QyxPQUFPaUYsSUFBSSxHQUFHQSxJQUFJLENBQUMvRSxVQUFVLEdBQUcsSUFBSTtFQUN0Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWtELG9CQUFvQkEsQ0FBRXJDLFlBQVksRUFBRW1FLFNBQVMsRUFBRztJQUM5QyxNQUFNQyxNQUFNLEdBQUd2SSxLQUFLLENBQUN3SSxjQUFjLENBQUUsQ0FBRXJFLFlBQVksQ0FBQ21DLFdBQVcsQ0FBQzNELENBQUMsR0FBRyxJQUFJLENBQUNELE1BQU0sQ0FBQytGLElBQUksSUFBSyxJQUFJLENBQUN2SCxnQkFBaUIsQ0FBQztJQUNoSCxNQUFNd0gsTUFBTSxHQUFHMUksS0FBSyxDQUFDd0ksY0FBYyxDQUFFLENBQUVyRSxZQUFZLENBQUNtQyxXQUFXLENBQUMxRCxDQUFDLEdBQUcsSUFBSSxDQUFDRixNQUFNLENBQUNpRyxJQUFJLElBQUssSUFBSSxDQUFDekgsZ0JBQWlCLENBQUM7O0lBRWhIO0lBQ0EsS0FBTSxJQUFJa0MsR0FBRyxHQUFHLENBQUMsRUFBRUEsR0FBRyxHQUFHZSxZQUFZLENBQUNULEtBQUssQ0FBQ2hCLE1BQU0sQ0FBQ2pCLE1BQU0sR0FBRyxJQUFJLENBQUNQLGdCQUFnQixFQUFFa0MsR0FBRyxFQUFFLEVBQUc7TUFDekYsS0FBTSxJQUFJRixNQUFNLEdBQUcsQ0FBQyxFQUFFQSxNQUFNLEdBQUdpQixZQUFZLENBQUNULEtBQUssQ0FBQ2hCLE1BQU0sQ0FBQ2xCLEtBQUssR0FBRyxJQUFJLENBQUNOLGdCQUFnQixFQUFFZ0MsTUFBTSxFQUFFLEVBQUc7UUFDakcsSUFBSSxDQUFDRCxLQUFLLENBQUVzRixNQUFNLEdBQUdyRixNQUFNLENBQUUsQ0FBRXdGLE1BQU0sR0FBR3RGLEdBQUcsQ0FBRSxDQUFDRSxVQUFVLEdBQUdnRixTQUFTLEtBQUssS0FBSyxHQUFHbkUsWUFBWSxHQUFHLElBQUk7TUFDdEc7SUFDRjtFQUNGOztFQUVBO0VBQ0F5RSwyQkFBMkJBLENBQUEsRUFBRztJQUM1QixJQUFLLElBQUksQ0FBQ3hHLHNCQUFzQixDQUFDeUIsR0FBRyxDQUFDLENBQUMsQ0FBQ2dGLGtCQUFrQixDQUFDekQsTUFBTSxJQUFJLENBQUMsRUFBRztNQUN0RSxJQUFJUyxTQUFTLEdBQUcsQ0FBQztNQUNqQixJQUFJLENBQUNwRCxjQUFjLENBQUNzRCxPQUFPLENBQUVDLGFBQWEsSUFBSTtRQUM1Q0gsU0FBUyxJQUFJRyxhQUFhLENBQUN0QyxLQUFLLENBQUNoQixNQUFNLENBQUNsQixLQUFLLEdBQUd3RSxhQUFhLENBQUN0QyxLQUFLLENBQUNoQixNQUFNLENBQUNqQixNQUFNLElBQUssSUFBSSxDQUFDUCxnQkFBZ0IsR0FBRyxJQUFJLENBQUNBLGdCQUFnQixDQUFFO01BQ3ZJLENBQUUsQ0FBQztNQUNILElBQUk0SCxjQUFjLEdBQUcsQ0FBQztNQUN0QixJQUFJLENBQUMxRyxzQkFBc0IsQ0FBQ3lCLEdBQUcsQ0FBQyxDQUFDLENBQUNnRixrQkFBa0IsQ0FBQzlDLE9BQU8sQ0FBRWdELGlCQUFpQixJQUFJO1FBQ2pGRCxjQUFjLElBQUlDLGlCQUFpQixDQUFDM0QsTUFBTTtNQUM1QyxDQUFFLENBQUM7TUFDSCxJQUFJLENBQUNoRCxzQkFBc0IsQ0FBQ3lCLEdBQUcsQ0FBQyxDQUFDLENBQUNtRixrQkFBa0IsQ0FBQ2pELE9BQU8sQ0FBRWtELGlCQUFpQixJQUFJO1FBQ2pGSCxjQUFjLElBQUlHLGlCQUFpQixDQUFDN0QsTUFBTTtNQUM1QyxDQUFFLENBQUM7TUFDSCxJQUFJLENBQUNuRCx3QkFBd0IsQ0FBQ3VDLEdBQUcsQ0FBRTtRQUNqQ3RDLElBQUksRUFBRTJELFNBQVM7UUFDZjFELFNBQVMsRUFBRTJHO01BQ2IsQ0FBRSxDQUFDO0lBQ0wsQ0FBQyxNQUNJO01BQ0g7TUFDQSxJQUFJLENBQUM3Ryx3QkFBd0IsQ0FBQ3VDLEdBQUcsQ0FBRTtRQUNqQ3RDLElBQUksRUFBRTVCLDBCQUEwQixDQUFDNEksYUFBYTtRQUM5Qy9HLFNBQVMsRUFBRTdCLDBCQUEwQixDQUFDNEk7TUFDeEMsQ0FBRSxDQUFDO0lBQ0w7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsY0FBY0EsQ0FBRWpHLE1BQU0sRUFBRUUsR0FBRyxFQUFHO0lBQzVCLElBQUtGLE1BQU0sSUFBSSxJQUFJLENBQUNKLFVBQVUsSUFBSUksTUFBTSxHQUFHLENBQUMsSUFBSUUsR0FBRyxJQUFJLElBQUksQ0FBQ1AsT0FBTyxJQUFJTyxHQUFHLEdBQUcsQ0FBQyxFQUFHO01BQy9FLE9BQU8sS0FBSztJQUNkLENBQUMsTUFDSTtNQUNILE9BQU8sSUFBSSxDQUFDSCxLQUFLLENBQUVDLE1BQU0sQ0FBRSxDQUFFRSxHQUFHLENBQUUsQ0FBQ0UsVUFBVSxLQUFLLElBQUk7SUFDeEQ7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRThGLHVCQUF1QkEsQ0FBRWxHLE1BQU0sRUFBRUUsR0FBRyxFQUFHO0lBQ3JDLElBQUssSUFBSSxDQUFDK0YsY0FBYyxDQUFFakcsTUFBTSxFQUFFRSxHQUFJLENBQUMsRUFBRztNQUN4QyxPQUFPLElBQUk7SUFDYjtJQUNBLEtBQU0sSUFBSWlHLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUN0RyxjQUFjLENBQUNxQyxNQUFNLEVBQUVpRSxDQUFDLEVBQUUsRUFBRztNQUNyRCxNQUFNQyxVQUFVLEdBQUcsSUFBSSxDQUFDQyxpQkFBaUIsQ0FBRSxJQUFJLENBQUN4RyxjQUFjLENBQUVzRyxDQUFDLENBQUUsQ0FBQy9DLFdBQVksQ0FBQztNQUNqRixNQUFNa0QsZUFBZSxHQUFHeEosS0FBSyxDQUFDd0ksY0FBYyxDQUFFLElBQUksQ0FBQ3pGLGNBQWMsQ0FBRXNHLENBQUMsQ0FBRSxDQUFDM0YsS0FBSyxDQUFDaEIsTUFBTSxDQUFDbEIsS0FBSyxHQUFHLElBQUksQ0FBQ04sZ0JBQWlCLENBQUM7TUFDbkgsTUFBTXVJLGdCQUFnQixHQUFHekosS0FBSyxDQUFDd0ksY0FBYyxDQUFFLElBQUksQ0FBQ3pGLGNBQWMsQ0FBRXNHLENBQUMsQ0FBRSxDQUFDM0YsS0FBSyxDQUFDaEIsTUFBTSxDQUFDakIsTUFBTSxHQUFHLElBQUksQ0FBQ1AsZ0JBQWlCLENBQUM7TUFDckgsSUFBS2dDLE1BQU0sSUFBSW9HLFVBQVUsQ0FBQzNHLENBQUMsSUFBSU8sTUFBTSxHQUFHb0csVUFBVSxDQUFDM0csQ0FBQyxHQUFHNkcsZUFBZSxJQUNqRXBHLEdBQUcsSUFBSWtHLFVBQVUsQ0FBQzFHLENBQUMsSUFBSVEsR0FBRyxHQUFHa0csVUFBVSxDQUFDMUcsQ0FBQyxHQUFHNkcsZ0JBQWdCLEVBQUc7UUFDbEUsT0FBTyxJQUFJO01BQ2I7SUFDRjtJQUNBLE9BQU8sS0FBSztFQUNkOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UzRSx5QkFBeUJBLENBQUU0RSxLQUFLLEVBQUVDLGFBQWEsRUFBRztJQUNoRCxNQUFNQyxnQkFBZ0IsR0FBRyxFQUFFOztJQUUzQjtJQUNBLE1BQU1DLHVCQUF1QixHQUFHLElBQUk1SixPQUFPLENBQ3pDMEUsSUFBSSxDQUFDbUYsS0FBSyxDQUFFLENBQUVKLEtBQUssQ0FBQy9HLENBQUMsR0FBRyxJQUFJLENBQUNELE1BQU0sQ0FBQytGLElBQUksSUFBSyxJQUFJLENBQUN2SCxnQkFBaUIsQ0FBQyxHQUFHeUksYUFBYSxFQUNwRmhGLElBQUksQ0FBQ21GLEtBQUssQ0FBRSxDQUFFSixLQUFLLENBQUM5RyxDQUFDLEdBQUcsSUFBSSxDQUFDRixNQUFNLENBQUNpRyxJQUFJLElBQUssSUFBSSxDQUFDekgsZ0JBQWlCLENBQUMsR0FBR3lJLGFBQ3pFLENBQUM7SUFFRCxNQUFNSSxVQUFVLEdBQUcsQ0FBRUosYUFBYSxHQUFHLENBQUMsSUFBSyxDQUFDO0lBRTVDLEtBQU0sSUFBSXZHLEdBQUcsR0FBRyxDQUFDLEVBQUVBLEdBQUcsR0FBRzJHLFVBQVUsRUFBRTNHLEdBQUcsRUFBRSxFQUFHO01BQzNDLEtBQU0sSUFBSUYsTUFBTSxHQUFHLENBQUMsRUFBRUEsTUFBTSxHQUFHNkcsVUFBVSxFQUFFN0csTUFBTSxFQUFFLEVBQUc7UUFDcEQsSUFBSyxDQUFFRSxHQUFHLEtBQUssQ0FBQyxJQUFJQSxHQUFHLEtBQUsyRyxVQUFVLEdBQUcsQ0FBQyxJQUFJN0csTUFBTSxLQUFLLENBQUMsSUFBSUEsTUFBTSxLQUFLNkcsVUFBVSxHQUFHLENBQUMsS0FDaEY3RyxNQUFNLEdBQUcyRyx1QkFBdUIsQ0FBQ2xILENBQUMsSUFBSSxJQUFJLENBQUNHLFVBQVUsSUFBSU0sR0FBRyxHQUFHeUcsdUJBQXVCLENBQUNqSCxDQUFDLElBQUksSUFBSSxDQUFDQyxPQUFTLEVBQUc7VUFDbEg7VUFDQStHLGdCQUFnQixDQUFDdkcsSUFBSSxDQUFFLElBQUlwRCxPQUFPLENBQUVpRCxNQUFNLEdBQUcyRyx1QkFBdUIsQ0FBQ2xILENBQUMsRUFBRVMsR0FBRyxHQUFHeUcsdUJBQXVCLENBQUNqSCxDQUFFLENBQUUsQ0FBQztRQUM3RztNQUNGO0lBQ0Y7SUFFQSxNQUFNb0gsc0JBQXNCLEdBQUcsRUFBRTtJQUNqQ0osZ0JBQWdCLENBQUM3RCxPQUFPLENBQUVrRSxDQUFDLElBQUk7TUFBRUQsc0JBQXNCLENBQUMzRyxJQUFJLENBQUUsSUFBSSxDQUFDNkcsaUJBQWlCLENBQUVELENBQUUsQ0FBRSxDQUFDO0lBQUUsQ0FBRSxDQUFDO0lBQ2hHLE9BQU9ELHNCQUFzQjtFQUMvQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UzRSxjQUFjQSxDQUFFbEIsWUFBWSxFQUFFaEQsUUFBUSxFQUFHO0lBQ3ZDLE1BQU1nSixrQkFBa0IsR0FBRyxJQUFJLENBQUNaLGlCQUFpQixDQUFFcEksUUFBUyxDQUFDO0lBQzdELE1BQU1xSSxlQUFlLEdBQUd4SixLQUFLLENBQUN3SSxjQUFjLENBQUVyRSxZQUFZLENBQUNULEtBQUssQ0FBQ2hCLE1BQU0sQ0FBQ2xCLEtBQUssR0FBRyxJQUFJLENBQUNOLGdCQUFpQixDQUFDO0lBQ3ZHLE1BQU11SSxnQkFBZ0IsR0FBR3pKLEtBQUssQ0FBQ3dJLGNBQWMsQ0FBRXJFLFlBQVksQ0FBQ1QsS0FBSyxDQUFDaEIsTUFBTSxDQUFDakIsTUFBTSxHQUFHLElBQUksQ0FBQ1AsZ0JBQWlCLENBQUM7SUFDekcsSUFBSWtDLEdBQUc7SUFDUCxJQUFJRixNQUFNOztJQUVWO0lBQ0EsSUFBS2lILGtCQUFrQixDQUFDeEgsQ0FBQyxHQUFHLENBQUMsSUFBSXdILGtCQUFrQixDQUFDeEgsQ0FBQyxHQUFHNkcsZUFBZSxHQUFHLElBQUksQ0FBQzFHLFVBQVUsSUFDcEZxSCxrQkFBa0IsQ0FBQ3ZILENBQUMsR0FBRyxDQUFDLElBQUl1SCxrQkFBa0IsQ0FBQ3ZILENBQUMsR0FBRzZHLGdCQUFnQixHQUFHLElBQUksQ0FBQzVHLE9BQU8sRUFBRztNQUN4RixPQUFPLEtBQUs7SUFDZDs7SUFFQTtJQUNBLElBQUssSUFBSSxDQUFDSixjQUFjLENBQUMyQyxNQUFNLEtBQUssQ0FBQyxFQUFHO01BQ3RDLE9BQU8sSUFBSTtJQUNiOztJQUVBO0lBQ0EsS0FBTWhDLEdBQUcsR0FBRyxDQUFDLEVBQUVBLEdBQUcsR0FBR3FHLGdCQUFnQixFQUFFckcsR0FBRyxFQUFFLEVBQUc7TUFDN0MsS0FBTUYsTUFBTSxHQUFHLENBQUMsRUFBRUEsTUFBTSxHQUFHc0csZUFBZSxFQUFFdEcsTUFBTSxFQUFFLEVBQUc7UUFDckQsSUFBSyxJQUFJLENBQUNrRyx1QkFBdUIsQ0FBRWUsa0JBQWtCLENBQUN4SCxDQUFDLEdBQUdPLE1BQU0sRUFBRWlILGtCQUFrQixDQUFDdkgsQ0FBQyxHQUFHUSxHQUFJLENBQUMsRUFBRztVQUMvRixPQUFPLEtBQUs7UUFDZDtNQUNGO0lBQ0Y7O0lBRUE7SUFDQSxJQUFLLENBQUMsSUFBSSxDQUFDcEIscUJBQXFCLENBQUM2QixHQUFHLENBQUMsQ0FBQyxFQUFHO01BQ3ZDLE9BQU8sSUFBSTtJQUNiOztJQUVBO0lBQ0E7SUFDQSxLQUFNVCxHQUFHLEdBQUcsQ0FBQyxFQUFFQSxHQUFHLEdBQUdxRyxnQkFBZ0IsRUFBRXJHLEdBQUcsRUFBRSxFQUFHO01BQzdDLEtBQU1GLE1BQU0sR0FBRyxDQUFDLEVBQUVBLE1BQU0sR0FBR3NHLGVBQWUsRUFBRXRHLE1BQU0sRUFBRSxFQUFHO1FBQ3JELElBQ0UsSUFBSSxDQUFDa0csdUJBQXVCLENBQUVlLGtCQUFrQixDQUFDeEgsQ0FBQyxHQUFHTyxNQUFNLEVBQUVpSCxrQkFBa0IsQ0FBQ3ZILENBQUMsR0FBR1EsR0FBRyxHQUFHLENBQUUsQ0FBQyxJQUM3RixJQUFJLENBQUNnRyx1QkFBdUIsQ0FBRWUsa0JBQWtCLENBQUN4SCxDQUFDLEdBQUdPLE1BQU0sR0FBRyxDQUFDLEVBQUVpSCxrQkFBa0IsQ0FBQ3ZILENBQUMsR0FBR1EsR0FBSSxDQUFDLElBQzdGLElBQUksQ0FBQ2dHLHVCQUF1QixDQUFFZSxrQkFBa0IsQ0FBQ3hILENBQUMsR0FBR08sTUFBTSxHQUFHLENBQUMsRUFBRWlILGtCQUFrQixDQUFDdkgsQ0FBQyxHQUFHUSxHQUFJLENBQUMsSUFDN0YsSUFBSSxDQUFDZ0csdUJBQXVCLENBQUVlLGtCQUFrQixDQUFDeEgsQ0FBQyxHQUFHTyxNQUFNLEVBQUVpSCxrQkFBa0IsQ0FBQ3ZILENBQUMsR0FBR1EsR0FBRyxHQUFHLENBQUUsQ0FBQyxFQUM3RjtVQUNBLE9BQU8sSUFBSTtRQUNiO01BQ0Y7SUFDRjtJQUVBLE9BQU8sS0FBSztFQUNkOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFZ0gsZ0JBQWdCQSxDQUFFQyxXQUFXLEVBQUc7SUFDOUIsTUFBTUMsZUFBZSxHQUFHLEVBQUU7O0lBRTFCO0lBQ0EsSUFBSSxDQUFDN0gsY0FBYyxDQUFDc0QsT0FBTyxDQUFFckMsS0FBSyxJQUFJO01BQ3BDLElBQUksQ0FBQ21FLHFCQUFxQixDQUFFbkUsS0FBSyxDQUFDVSxzQkFBdUIsQ0FBQztNQUMxRGtHLGVBQWUsQ0FBQ2pILElBQUksQ0FBRUssS0FBTSxDQUFDO0lBQy9CLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ1gsY0FBYyxDQUFDZ0QsT0FBTyxDQUFFckMsS0FBSyxJQUFJO01BQ3BDLElBQUksQ0FBQ21FLHFCQUFxQixDQUFFbkUsS0FBSyxDQUFDeUQsaUJBQWtCLENBQUM7TUFDckRtRCxlQUFlLENBQUNqSCxJQUFJLENBQUVLLEtBQU0sQ0FBQztJQUMvQixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNqQixjQUFjLENBQUM4SCxLQUFLLENBQUMsQ0FBQztJQUMzQixJQUFJLENBQUN4SCxjQUFjLENBQUNxQyxNQUFNLEdBQUcsQ0FBQzs7SUFFOUI7SUFDQSxLQUFNLElBQUloQyxHQUFHLEdBQUcsQ0FBQyxFQUFFQSxHQUFHLEdBQUcsSUFBSSxDQUFDUCxPQUFPLEVBQUVPLEdBQUcsRUFBRSxFQUFHO01BQzdDLEtBQU0sSUFBSUYsTUFBTSxHQUFHLENBQUMsRUFBRUEsTUFBTSxHQUFHLElBQUksQ0FBQ0osVUFBVSxFQUFFSSxNQUFNLEVBQUUsRUFBRztRQUN6RCxJQUFJLENBQUNELEtBQUssQ0FBRUMsTUFBTSxDQUFFLENBQUVFLEdBQUcsQ0FBRSxDQUFDRSxVQUFVLEdBQUcsSUFBSTtNQUMvQztJQUNGOztJQUVBO0lBQ0FnSCxlQUFlLENBQUN2RSxPQUFPLENBQUVyQyxLQUFLLElBQUk7TUFDaEMsSUFBSyxPQUFTMkcsV0FBYSxLQUFLLFdBQVcsSUFBSUEsV0FBVyxLQUFLLFVBQVUsRUFBRztRQUMxRTNHLEtBQUssQ0FBQzhHLGNBQWMsQ0FBRSxLQUFNLENBQUM7TUFDL0IsQ0FBQyxNQUNJLElBQUtILFdBQVcsS0FBSyxhQUFhLEVBQUc7UUFDeEMzRyxLQUFLLENBQUM4RyxjQUFjLENBQUUsSUFBSyxDQUFDO01BQzlCLENBQUMsTUFDSSxJQUFLSCxXQUFXLEtBQUssTUFBTSxFQUFHO1FBQ2pDM0csS0FBSyxDQUFDK0csUUFBUSxDQUFDLENBQUM7TUFDbEIsQ0FBQyxNQUNJO1FBQ0gsTUFBTSxJQUFJQyxLQUFLLENBQUUsc0NBQXVDLENBQUM7TUFDM0Q7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNoRSxTQUFTLENBQUMsQ0FBQztFQUNsQjs7RUFFQTtFQUNBSCxlQUFlQSxDQUFFN0MsS0FBSyxFQUFHO0lBQ3ZCLE9BQU8sSUFBSSxDQUFDakIsY0FBYyxDQUFDa0ksUUFBUSxDQUFFakgsS0FBTSxDQUFDO0VBQzlDOztFQUVBO0VBQ0FrSCxZQUFZQSxDQUFFbEgsS0FBSyxFQUFHO0lBQ3BCbkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDZ0YsZUFBZSxDQUFFN0MsS0FBTSxDQUFDLElBQUksSUFBSSxDQUFDWCxjQUFjLENBQUM4SCxRQUFRLENBQUVuSCxLQUFNLENBQUMsRUFBRSxvRUFBcUUsQ0FBQztJQUNoSyxJQUFLLElBQUksQ0FBQzZDLGVBQWUsQ0FBRTdDLEtBQU0sQ0FBQyxFQUFHO01BQ25DLElBQUksQ0FBQ21FLHFCQUFxQixDQUFFbkUsS0FBSyxDQUFDVSxzQkFBdUIsQ0FBQztNQUMxRCxJQUFJLENBQUN1QyxtQkFBbUIsQ0FBRWpELEtBQU0sQ0FBQztJQUNuQyxDQUFDLE1BQ0ksSUFBSyxJQUFJLENBQUNYLGNBQWMsQ0FBQ3dFLE9BQU8sQ0FBRTdELEtBQU0sQ0FBQyxJQUFJLENBQUMsRUFBRztNQUNwRCxJQUFJLENBQUNtRSxxQkFBcUIsQ0FBRW5FLEtBQUssQ0FBQ3lELGlCQUFrQixDQUFDO01BQ3JELElBQUksQ0FBQ3BFLGNBQWMsQ0FBQ3VFLE1BQU0sQ0FBRSxJQUFJLENBQUN2RSxjQUFjLENBQUN3RSxPQUFPLENBQUU3RCxLQUFNLENBQUMsRUFBRSxDQUFFLENBQUM7SUFDdkU7RUFDRjs7RUFFQTtFQUNBZ0MsaUJBQWlCQSxDQUFFeEMsTUFBTSxFQUFFRSxHQUFHLEVBQUc7SUFDL0IsT0FBTyxJQUFJbkQsT0FBTyxDQUFFaUQsTUFBTSxHQUFHLElBQUksQ0FBQ2hDLGdCQUFnQixHQUFHLElBQUksQ0FBQ3dCLE1BQU0sQ0FBQytGLElBQUksRUFBRXJGLEdBQUcsR0FBRyxJQUFJLENBQUNsQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUN3QixNQUFNLENBQUNpRyxJQUFLLENBQUM7RUFDekg7O0VBRUE7RUFDQXVCLGlCQUFpQkEsQ0FBRVksQ0FBQyxFQUFHO0lBQ3JCLE9BQU8sSUFBSSxDQUFDcEYsaUJBQWlCLENBQUVvRixDQUFDLENBQUNuSSxDQUFDLEVBQUVtSSxDQUFDLENBQUNsSSxDQUFFLENBQUM7RUFDM0M7O0VBRUE7RUFDQW1JLGlCQUFpQkEsQ0FBRXBJLENBQUMsRUFBRUMsQ0FBQyxFQUFHO0lBQ3hCLE9BQU8sSUFBSTNDLE9BQU8sQ0FBRUQsS0FBSyxDQUFDd0ksY0FBYyxDQUFFLENBQUU3RixDQUFDLEdBQUcsSUFBSSxDQUFDRCxNQUFNLENBQUMrRixJQUFJLElBQUssSUFBSSxDQUFDdkgsZ0JBQWlCLENBQUMsRUFDMUZsQixLQUFLLENBQUN3SSxjQUFjLENBQUUsQ0FBRTVGLENBQUMsR0FBRyxJQUFJLENBQUNGLE1BQU0sQ0FBQ2lHLElBQUksSUFBSyxJQUFJLENBQUN6SCxnQkFBaUIsQ0FBRSxDQUFDO0VBQzlFOztFQUVBO0VBQ0FxSSxpQkFBaUJBLENBQUV1QixDQUFDLEVBQUc7SUFDckIsT0FBTyxJQUFJLENBQUNDLGlCQUFpQixDQUFFRCxDQUFDLENBQUNuSSxDQUFDLEVBQUVtSSxDQUFDLENBQUNsSSxDQUFFLENBQUM7RUFDM0M7O0VBRUE7RUFDQW9JLDhCQUE4QkEsQ0FBRUMsZUFBZSxFQUFHO0lBQ2hELE1BQU1DLGNBQWMsR0FBRyxJQUFJaEwsS0FBSyxDQUFDLENBQUM7SUFDbENnTCxjQUFjLENBQUNDLFdBQVcsQ0FBRUYsZUFBZSxDQUFFLENBQUMsQ0FBRyxDQUFDO0lBQ2xELEtBQU0sSUFBSTVCLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRzRCLGVBQWUsQ0FBQzdGLE1BQU0sRUFBRWlFLENBQUMsRUFBRSxFQUFHO01BQ2pENkIsY0FBYyxDQUFDRSxXQUFXLENBQUVILGVBQWUsQ0FBRTVCLENBQUMsQ0FBRyxDQUFDO0lBQ3BEO0lBQ0E2QixjQUFjLENBQUNHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4QixPQUFPSCxjQUFjO0VBQ3ZCOztFQUVBO0VBQ0FJLDRCQUE0QkEsQ0FBRUMsVUFBVSxFQUFHO0lBQ3pDLE1BQU1MLGNBQWMsR0FBRyxJQUFJaEwsS0FBSyxDQUFDLENBQUM7SUFDbENxTCxVQUFVLENBQUN4RixPQUFPLENBQUVrRixlQUFlLElBQUk7TUFDckNDLGNBQWMsQ0FBQ0MsV0FBVyxDQUFFRixlQUFlLENBQUUsQ0FBQyxDQUFHLENBQUM7TUFDbEQsS0FBTSxJQUFJNUIsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHNEIsZUFBZSxDQUFDN0YsTUFBTSxFQUFFaUUsQ0FBQyxFQUFFLEVBQUc7UUFDakQ2QixjQUFjLENBQUNFLFdBQVcsQ0FBRUgsZUFBZSxDQUFFNUIsQ0FBQyxDQUFHLENBQUM7TUFDcEQ7TUFDQTZCLGNBQWMsQ0FBQ0csS0FBSyxDQUFDLENBQUM7SUFDeEIsQ0FBRSxDQUFDO0lBQ0gsT0FBT0gsY0FBYztFQUN2Qjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sYUFBYUEsQ0FBRUMsV0FBVyxFQUFHO0lBQzNCLE1BQU1DLFVBQVUsR0FBR0QsV0FBVyxDQUFDRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxJQUFJQyxZQUFZLEdBQUcsS0FBSztJQUN4QixNQUFNWCxlQUFlLEdBQUcsRUFBRTtJQUMxQixJQUFJWSxzQkFBc0IsR0FBR3JMLGdCQUFnQixDQUFDQyxFQUFFLENBQUMsQ0FBQztJQUNsRCxPQUFRLENBQUNtTCxZQUFZLEVBQUc7TUFFdEI7TUFDQSxNQUFNRSxjQUFjLEdBQUcsSUFBSSxDQUFDM0MsY0FBYyxDQUFFdUMsVUFBVSxDQUFDL0ksQ0FBQyxHQUFHLENBQUMsRUFBRStJLFVBQVUsQ0FBQzlJLENBQUMsR0FBRyxDQUFFLENBQUM7TUFDaEYsTUFBTW1KLGVBQWUsR0FBRyxJQUFJLENBQUM1QyxjQUFjLENBQUV1QyxVQUFVLENBQUMvSSxDQUFDLEVBQUUrSSxVQUFVLENBQUM5SSxDQUFDLEdBQUcsQ0FBRSxDQUFDO01BQzdFLE1BQU1vSixnQkFBZ0IsR0FBRyxJQUFJLENBQUM3QyxjQUFjLENBQUV1QyxVQUFVLENBQUMvSSxDQUFDLEdBQUcsQ0FBQyxFQUFFK0ksVUFBVSxDQUFDOUksQ0FBRSxDQUFDO01BQzlFLE1BQU1xSixpQkFBaUIsR0FBRyxJQUFJLENBQUM5QyxjQUFjLENBQUV1QyxVQUFVLENBQUMvSSxDQUFDLEVBQUUrSSxVQUFVLENBQUM5SSxDQUFFLENBQUM7O01BRTNFO01BQ0EsSUFBSXNKLG9CQUFvQixHQUFHLENBQUM7TUFDNUIsSUFBS0osY0FBYyxFQUFHO1FBQUVJLG9CQUFvQixJQUFJLENBQUM7TUFBRSxDQUFDLENBQUM7TUFDckQsSUFBS0gsZUFBZSxFQUFHO1FBQUVHLG9CQUFvQixJQUFJLENBQUM7TUFBRSxDQUFDLENBQUM7TUFDdEQsSUFBS0YsZ0JBQWdCLEVBQUc7UUFBRUUsb0JBQW9CLElBQUksQ0FBQztNQUFFLENBQUMsQ0FBQztNQUN2RCxJQUFLRCxpQkFBaUIsRUFBRztRQUFFQyxvQkFBb0IsSUFBSSxDQUFDO01BQUUsQ0FBQyxDQUFDOztNQUV4RDNLLE1BQU0sSUFBSUEsTUFBTSxDQUNoQjJLLG9CQUFvQixLQUFLLENBQUMsSUFBSUEsb0JBQW9CLEtBQUssRUFBRSxFQUN2RCxtREFDRixDQUFDOztNQUVEO01BQ0FqQixlQUFlLENBQUM1SCxJQUFJLENBQUUsSUFBSSxDQUFDcUMsaUJBQWlCLENBQUVnRyxVQUFVLENBQUMvSSxDQUFDLEVBQUUrSSxVQUFVLENBQUM5SSxDQUFFLENBQUUsQ0FBQzs7TUFFNUU7TUFDQSxNQUFNdUosY0FBYyxHQUFHdEwsNEJBQTRCLENBQUVxTCxvQkFBb0IsQ0FBRSxDQUFFTCxzQkFBdUIsQ0FBQztNQUNyR0gsVUFBVSxDQUFDVSxHQUFHLENBQUVELGNBQWUsQ0FBQztNQUNoQ04sc0JBQXNCLEdBQUdNLGNBQWM7TUFFdkMsSUFBS1QsVUFBVSxDQUFDcEgsTUFBTSxDQUFFbUgsV0FBWSxDQUFDLEVBQUc7UUFDdENHLFlBQVksR0FBRyxJQUFJO01BQ3JCO0lBQ0Y7SUFDQSxPQUFPWCxlQUFlO0VBQ3hCOztFQUVBO0VBQ0FvQixnQkFBZ0JBLENBQUEsRUFBRztJQUNqQjtJQUNBLElBQUssQ0FBQyxJQUFJLENBQUNySyxxQkFBcUIsQ0FBQzZCLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDcEIsY0FBYyxDQUFDMkMsTUFBTSxLQUFLLENBQUMsRUFBRztNQUMzRSxJQUFJLENBQUNqRCxTQUFTLEdBQUcsQ0FBQztNQUNsQixJQUFJLENBQUNDLHNCQUFzQixDQUFDa0ssS0FBSyxDQUFDLENBQUM7SUFDckMsQ0FBQyxNQUNJO01BQUU7TUFDTCxJQUFJbEosR0FBRztNQUNQLElBQUlGLE1BQU07TUFDVixNQUFNMkYsa0JBQWtCLEdBQUcsRUFBRTs7TUFFN0I7TUFDQTtNQUNBLE1BQU0wRCxvQkFBb0IsR0FBRyxJQUFJLENBQUNDLDRCQUE0QixDQUFDLENBQUM7TUFDaEVELG9CQUFvQixDQUFDeEcsT0FBTyxDQUFFMEcsU0FBUyxJQUFJO1FBRXpDO1FBQ0EsSUFBSUMsV0FBVyxHQUFHLElBQUk7UUFDdEJELFNBQVMsQ0FBQzFHLE9BQU8sQ0FBRXNDLElBQUksSUFBSTtVQUN6QixJQUFLcUUsV0FBVyxLQUFLLElBQUksSUFBSXJFLElBQUksQ0FBQ2pGLEdBQUcsR0FBR3NKLFdBQVcsQ0FBQ3RKLEdBQUcsSUFBTWlGLElBQUksQ0FBQ2pGLEdBQUcsS0FBS3NKLFdBQVcsQ0FBQ3RKLEdBQUcsSUFBSWlGLElBQUksQ0FBQ25GLE1BQU0sR0FBR3dKLFdBQVcsQ0FBQ3hKLE1BQVEsRUFBRztZQUNoSXdKLFdBQVcsR0FBR3JFLElBQUk7VUFDcEI7UUFDRixDQUFFLENBQUM7O1FBRUg7UUFDQSxNQUFNc0Usa0JBQWtCLEdBQUcsSUFBSTFNLE9BQU8sQ0FBRXlNLFdBQVcsQ0FBQ3hKLE1BQU0sRUFBRXdKLFdBQVcsQ0FBQ3RKLEdBQUksQ0FBQztRQUM3RXlGLGtCQUFrQixDQUFDeEYsSUFBSSxDQUFFLElBQUksQ0FBQ21JLGFBQWEsQ0FBRW1CLGtCQUFtQixDQUFFLENBQUM7TUFDckUsQ0FBRSxDQUFDOztNQUVIO01BQ0EsTUFBTUMsWUFBWSxHQUFHLElBQUksQ0FBQ3RCLDRCQUE0QixDQUFFekMsa0JBQW1CLENBQUM7TUFDNUUsSUFBSWdFLGNBQWMsR0FBRyxFQUFFO01BQ3ZCLEtBQU16SixHQUFHLEdBQUcsQ0FBQyxFQUFFQSxHQUFHLEdBQUcsSUFBSSxDQUFDUCxPQUFPLEVBQUVPLEdBQUcsRUFBRSxFQUFHO1FBQ3pDLEtBQU1GLE1BQU0sR0FBRyxDQUFDLEVBQUVBLE1BQU0sR0FBRyxJQUFJLENBQUNKLFVBQVUsRUFBRUksTUFBTSxFQUFFLEVBQUc7VUFDckQsSUFBSyxDQUFDLElBQUksQ0FBQ2lHLGNBQWMsQ0FBRWpHLE1BQU0sRUFBRUUsR0FBSSxDQUFDLEVBQUc7WUFDekM7WUFDQSxNQUFNMEosaUJBQWlCLEdBQUcsSUFBSSxDQUFDcEgsaUJBQWlCLENBQUV4QyxNQUFNLEVBQUVFLEdBQUksQ0FBQyxDQUFDMkosS0FBSyxDQUFFLElBQUksQ0FBQzdMLGdCQUFnQixHQUFHLENBQUMsRUFBRSxJQUFJLENBQUNBLGdCQUFnQixHQUFHLENBQUUsQ0FBQztZQUM3SCxJQUFLMEwsWUFBWSxDQUFDSSxhQUFhLENBQUVGLGlCQUFrQixDQUFDLEVBQUc7Y0FDckRELGNBQWMsQ0FBQ3hKLElBQUksQ0FBRSxJQUFJcEQsT0FBTyxDQUFFaUQsTUFBTSxFQUFFRSxHQUFJLENBQUUsQ0FBQztZQUNuRDtVQUNGO1FBQ0Y7TUFDRjs7TUFFQTtNQUNBLE1BQU00RixrQkFBa0IsR0FBRyxFQUFFO01BQzdCLE9BQVE2RCxjQUFjLENBQUN6SCxNQUFNLEdBQUcsQ0FBQyxFQUFHO1FBRWxDO1FBQ0EsSUFBSTZILFlBQVksR0FBR0osY0FBYyxDQUFFLENBQUMsQ0FBRTtRQUN0Q0EsY0FBYyxDQUFDOUcsT0FBTyxDQUFFc0MsSUFBSSxJQUFJO1VBQzlCLElBQUtBLElBQUksQ0FBQ3pGLENBQUMsR0FBR3FLLFlBQVksQ0FBQ3JLLENBQUMsSUFBTXlGLElBQUksQ0FBQ3pGLENBQUMsS0FBS3FLLFlBQVksQ0FBQ3JLLENBQUMsSUFBSXlGLElBQUksQ0FBQzFGLENBQUMsR0FBR3NLLFlBQVksQ0FBQ3RLLENBQUcsRUFBRztZQUN6RnNLLFlBQVksR0FBRzVFLElBQUk7VUFDckI7UUFDRixDQUFFLENBQUM7O1FBRUg7UUFDQSxNQUFNNkUsdUJBQXVCLEdBQUcsSUFBSSxDQUFDMUIsYUFBYSxDQUFFeUIsWUFBYSxDQUFDO1FBQ2xFakUsa0JBQWtCLENBQUMzRixJQUFJLENBQUU2Six1QkFBd0IsQ0FBQzs7UUFFbEQ7UUFDQSxNQUFNaEMsY0FBYyxHQUFHLElBQUksQ0FBQ0YsOEJBQThCLENBQUVrQyx1QkFBd0IsQ0FBQztRQUNyRixNQUFNQyxtQkFBbUIsR0FBRyxFQUFFO1FBQzlCTixjQUFjLENBQUM5RyxPQUFPLENBQUVxSCxhQUFhLElBQUk7VUFDdkMsTUFBTUMsYUFBYSxHQUFHLElBQUksQ0FBQzNILGlCQUFpQixDQUFFMEgsYUFBYSxDQUFDekssQ0FBQyxFQUFFeUssYUFBYSxDQUFDeEssQ0FBRSxDQUFDO1VBQ2hGLE1BQU0wSyxXQUFXLEdBQUdELGFBQWEsQ0FBQ0UsTUFBTSxDQUFFLElBQUksQ0FBQ3JNLGdCQUFnQixHQUFHLENBQUMsRUFBRSxJQUFJLENBQUNBLGdCQUFnQixHQUFHLENBQUUsQ0FBQztVQUNoRyxJQUFLLENBQUNnSyxjQUFjLENBQUM4QixhQUFhLENBQUVNLFdBQVksQ0FBQyxFQUFHO1lBQ2xEO1lBQ0FILG1CQUFtQixDQUFDOUosSUFBSSxDQUFFK0osYUFBYyxDQUFDO1VBQzNDO1FBQ0YsQ0FBRSxDQUFDOztRQUVIO1FBQ0FQLGNBQWMsR0FBR00sbUJBQW1CO01BQ3RDOztNQUVBO01BQ0E7TUFDQSxJQUFLLEVBQUcsSUFBSSxDQUFDSyxtQkFBbUIsQ0FBRTNFLGtCQUFrQixFQUFFLElBQUksQ0FBQ3pHLHNCQUFzQixDQUFDeUIsR0FBRyxDQUFDLENBQUMsQ0FBQ2dGLGtCQUFtQixDQUFDLElBQ3BHLElBQUksQ0FBQzJFLG1CQUFtQixDQUFFeEUsa0JBQWtCLEVBQUUsSUFBSSxDQUFDNUcsc0JBQXNCLENBQUN5QixHQUFHLENBQUMsQ0FBQyxDQUFDbUYsa0JBQW1CLENBQUMsQ0FBRSxFQUFHO1FBQy9HLElBQUksQ0FBQzVHLHNCQUFzQixDQUFDb0MsR0FBRyxDQUFFLElBQUlqRSxjQUFjLENBQUVzSSxrQkFBa0IsRUFBRUcsa0JBQWtCLEVBQUUsSUFBSSxDQUFDOUgsZ0JBQWdCLEVBQUU7VUFDbEhtQixTQUFTLEVBQUUsSUFBSSxDQUFDWCx1QkFBdUI7VUFDdkNZLFNBQVMsRUFBRSxJQUFJLENBQUNUO1FBQ2xCLENBQUUsQ0FBRSxDQUFDO01BQ1A7SUFDRjtFQUNGOztFQUVBO0VBQ0E0TCxvQkFBb0JBLENBQUVDLFVBQVUsRUFBRUMsVUFBVSxFQUFHO0lBQzdDcE0sTUFBTSxJQUFJQSxNQUFNLENBQUVxTSxLQUFLLENBQUNDLE9BQU8sQ0FBRUgsVUFBVyxDQUFDLElBQUlFLEtBQUssQ0FBQ0MsT0FBTyxDQUFFRixVQUFXLENBQUMsRUFBRSw2Q0FBOEMsQ0FBQztJQUM3SCxJQUFLRCxVQUFVLENBQUN0SSxNQUFNLEtBQUt1SSxVQUFVLENBQUN2SSxNQUFNLEVBQUc7TUFDN0MsT0FBTyxLQUFLO0lBQ2Q7SUFDQSxPQUFPc0ksVUFBVSxDQUFDSSxLQUFLLENBQUUsQ0FBRXBFLEtBQUssRUFBRXFFLEtBQUssS0FBTXJFLEtBQUssQ0FBQ3BGLE1BQU0sQ0FBRXFKLFVBQVUsQ0FBRUksS0FBSyxDQUFHLENBQUUsQ0FBQztFQUNwRjs7RUFFQTtFQUNBUCxtQkFBbUJBLENBQUVRLGNBQWMsRUFBRUMsY0FBYyxFQUFHO0lBQ3BEMU0sTUFBTSxJQUFJQSxNQUFNLENBQUVxTSxLQUFLLENBQUNDLE9BQU8sQ0FBRUcsY0FBZSxDQUFDLElBQUlKLEtBQUssQ0FBQ0MsT0FBTyxDQUFFSSxjQUFlLENBQUMsRUFBRSw0Q0FBNkMsQ0FBQztJQUNwSSxJQUFLRCxjQUFjLENBQUM1SSxNQUFNLEtBQUs2SSxjQUFjLENBQUM3SSxNQUFNLEVBQUc7TUFDckQsT0FBTyxLQUFLO0lBQ2Q7SUFDQSxPQUFPNEksY0FBYyxDQUFDRixLQUFLLENBQUUsQ0FBRTdDLGVBQWUsRUFBRThDLEtBQUssS0FBTSxJQUFJLENBQUNOLG9CQUFvQixDQUFFeEMsZUFBZSxFQUFFZ0QsY0FBYyxDQUFFRixLQUFLLENBQUcsQ0FBRSxDQUFDO0VBQ3BJOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUcsNkJBQTZCQSxDQUFFQyxTQUFTLEVBQUUxQixTQUFTLEVBQUc7SUFDcERsTCxNQUFNLElBQUlBLE1BQU0sQ0FBRTRNLFNBQVMsQ0FBQzdLLFVBQVUsS0FBSyxJQUFJLEVBQUUsOERBQStELENBQUM7SUFDakgvQixNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDNE0sU0FBUyxDQUFDNUssU0FBUyxFQUFFLHVFQUF3RSxDQUFDO0lBQ2pIO0lBQ0FrSixTQUFTLENBQUNwSixJQUFJLENBQUU4SyxTQUFVLENBQUM7SUFDM0JBLFNBQVMsQ0FBQzVLLFNBQVMsR0FBRyxJQUFJOztJQUUxQjtJQUNBNkssTUFBTSxDQUFDQyxJQUFJLENBQUU3TixnQkFBaUIsQ0FBQyxDQUFDdUYsT0FBTyxDQUFFdUksR0FBRyxJQUFJO01BQzlDLE1BQU1uQyxjQUFjLEdBQUczTCxnQkFBZ0IsQ0FBRThOLEdBQUcsQ0FBRTtNQUM5QyxNQUFNQyxZQUFZLEdBQUcsSUFBSSxDQUFDcEcsT0FBTyxDQUFFZ0csU0FBUyxDQUFDakwsTUFBTSxHQUFHaUosY0FBYyxDQUFDeEosQ0FBQyxFQUFFd0wsU0FBUyxDQUFDL0ssR0FBRyxHQUFHK0ksY0FBYyxDQUFDdkosQ0FBRSxDQUFDO01BQzFHLElBQUsyTCxZQUFZLEtBQUssSUFBSSxJQUFJQSxZQUFZLENBQUNqTCxVQUFVLEtBQUssSUFBSSxJQUFJLENBQUNpTCxZQUFZLENBQUNoTCxTQUFTLEVBQUc7UUFDMUYsSUFBSSxDQUFDMkssNkJBQTZCLENBQUVLLFlBQVksRUFBRTlCLFNBQVUsQ0FBQztNQUMvRDtJQUNGLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUQsNEJBQTRCQSxDQUFBLEVBQUc7SUFFN0I7SUFDQSxJQUFJZ0Msc0JBQXNCLEdBQUcsRUFBRTtJQUMvQixLQUFNLElBQUlwTCxHQUFHLEdBQUcsQ0FBQyxFQUFFQSxHQUFHLEdBQUcsSUFBSSxDQUFDUCxPQUFPLEVBQUVPLEdBQUcsRUFBRSxFQUFHO01BQzdDLEtBQU0sSUFBSUYsTUFBTSxHQUFHLENBQUMsRUFBRUEsTUFBTSxHQUFHLElBQUksQ0FBQ0osVUFBVSxFQUFFSSxNQUFNLEVBQUUsRUFBRztRQUN6RCxNQUFNbUYsSUFBSSxHQUFHLElBQUksQ0FBQ3BGLEtBQUssQ0FBRUMsTUFBTSxDQUFFLENBQUVFLEdBQUcsQ0FBRTtRQUN4QyxJQUFLaUYsSUFBSSxDQUFDL0UsVUFBVSxLQUFLLElBQUksRUFBRztVQUM5QmtMLHNCQUFzQixDQUFDbkwsSUFBSSxDQUFFLElBQUksQ0FBQ0osS0FBSyxDQUFFQyxNQUFNLENBQUUsQ0FBRUUsR0FBRyxDQUFHLENBQUM7VUFDMUQ7VUFDQWlGLElBQUksQ0FBQzlFLFNBQVMsR0FBRyxLQUFLO1FBQ3hCO01BQ0Y7SUFDRjs7SUFFQTtJQUNBLE1BQU1nSixvQkFBb0IsR0FBRyxFQUFFO0lBQy9CLE9BQVFpQyxzQkFBc0IsQ0FBQ3BKLE1BQU0sR0FBRyxDQUFDLEVBQUc7TUFDMUMsTUFBTXFILFNBQVMsR0FBRyxFQUFFO01BQ3BCLElBQUksQ0FBQ3lCLDZCQUE2QixDQUFFTSxzQkFBc0IsQ0FBRSxDQUFDLENBQUUsRUFBRS9CLFNBQVUsQ0FBQztNQUM1RUYsb0JBQW9CLENBQUNsSixJQUFJLENBQUVvSixTQUFVLENBQUM7TUFDdEMrQixzQkFBc0IsR0FBR0MsQ0FBQyxDQUFDQyxVQUFVLENBQUVGLHNCQUFzQixFQUFFL0IsU0FBVSxDQUFDO0lBQzVFO0lBRUEsT0FBT0Ysb0JBQW9CO0VBQzdCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFOUYsaUJBQWlCQSxDQUFBLEVBQUc7SUFFbEI7SUFDQSxJQUFLLElBQUksQ0FBQ3pFLHFCQUFxQixDQUFDNkIsR0FBRyxDQUFDLENBQUMsRUFBRztNQUN0QyxNQUFNMEksb0JBQW9CLEdBQUcsSUFBSSxDQUFDQyw0QkFBNEIsQ0FBQyxDQUFDO01BRWhFLElBQUtELG9CQUFvQixDQUFDbkgsTUFBTSxHQUFHLENBQUMsRUFBRztRQUNyQztRQUNBLElBQUl1SixvQkFBb0IsR0FBRyxDQUFDO1FBQzVCcEMsb0JBQW9CLENBQUN4RyxPQUFPLENBQUUsQ0FBRTZJLEtBQUssRUFBRWIsS0FBSyxLQUFNO1VBQ2hELElBQUthLEtBQUssQ0FBQ3hKLE1BQU0sR0FBR21ILG9CQUFvQixDQUFFb0Msb0JBQW9CLENBQUUsQ0FBQ3ZKLE1BQU0sRUFBRztZQUN4RXVKLG9CQUFvQixHQUFHWixLQUFLO1VBQzlCO1FBQ0YsQ0FBRSxDQUFDO1FBRUh4QixvQkFBb0IsQ0FBQ3hHLE9BQU8sQ0FBRSxDQUFFNkksS0FBSyxFQUFFQyxVQUFVLEtBQU07VUFDckQsSUFBS0EsVUFBVSxLQUFLRixvQkFBb0IsRUFBRztZQUN6Q0MsS0FBSyxDQUFDN0ksT0FBTyxDQUFFc0MsSUFBSSxJQUFJO2NBQ3JCLE1BQU1sRSxZQUFZLEdBQUdrRSxJQUFJLENBQUMvRSxVQUFVO2NBQ3BDLElBQUthLFlBQVksS0FBSyxJQUFJLEVBQUc7Z0JBQUU7Z0JBQzdCLElBQUksQ0FBQ3lHLFlBQVksQ0FBRXpHLFlBQWEsQ0FBQztnQkFDakNBLFlBQVksQ0FBQ3FHLGNBQWMsQ0FBRSxJQUFLLENBQUM7Y0FDckM7WUFDRixDQUFFLENBQUM7VUFDTDtRQUNGLENBQUUsQ0FBQztNQUNMO0lBQ0Y7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFc0UsMkJBQTJCQSxDQUFFQyxhQUFhLEVBQUVDLFdBQVcsRUFBRztJQUN4RHpOLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ2dGLGVBQWUsQ0FBRXdJLGFBQWMsQ0FBQyxFQUFFLHNFQUF1RSxDQUFDOztJQUVqSTtJQUNBO0lBQ0EsSUFBSSxDQUFDdE0sY0FBYyxDQUFDb0UsTUFBTSxDQUFFa0ksYUFBYyxDQUFDO0lBQzNDLElBQUksQ0FBQ3ZJLG9CQUFvQixDQUFFdUksYUFBYSxFQUFFLFFBQVMsQ0FBQztJQUVwREMsV0FBVyxDQUFDakosT0FBTyxDQUFFa0osaUJBQWlCLElBQUk7TUFDeEMsSUFBSSxDQUFDeE0sY0FBYyxDQUFDWSxJQUFJLENBQUU0TCxpQkFBa0IsQ0FBQzs7TUFFN0M7TUFDQSxJQUFJLENBQUN6SCxrQkFBa0IsQ0FBRXlILGlCQUFrQixDQUFDOztNQUU1QztNQUNBLElBQUksQ0FBQ3pJLG9CQUFvQixDQUFFeUksaUJBQWlCLEVBQUUsS0FBTSxDQUFDO0lBQ3ZELENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRXpILGtCQUFrQkEsQ0FBRXJELFlBQVksRUFBRztJQUVqQyxNQUFNeUMsSUFBSSxHQUFHLElBQUk7SUFFakIsU0FBU3NJLGVBQWVBLENBQUVsSSxjQUFjLEVBQUc7TUFDekN6RixNQUFNLElBQUlBLE1BQU0sQ0FDZHlGLGNBQWMsS0FBSyxJQUFJLEVBQ3ZCLHNGQUNGLENBQUM7TUFDREosSUFBSSxDQUFDRCxtQkFBbUIsQ0FBRXhDLFlBQWEsQ0FBQztNQUN4Q0EsWUFBWSxDQUFDQyxzQkFBc0IsQ0FBQzZDLE1BQU0sQ0FBRWlJLGVBQWdCLENBQUM7SUFDL0Q7SUFFQSxJQUFJLENBQUN6SCxXQUFXLENBQUV5SCxlQUFnQixDQUFDO0lBQ25DL0ssWUFBWSxDQUFDQyxzQkFBc0IsQ0FBQzBDLFFBQVEsQ0FBRW9JLGVBQWdCLENBQUM7RUFDakU7O0VBRUE7RUFDQUMsNEJBQTRCQSxDQUFFOU0sU0FBUyxFQUFFQyxTQUFTLEVBQUc7SUFDbkQsSUFBSSxDQUFDWix1QkFBdUIsR0FBR1csU0FBUztJQUN4QyxJQUFJLENBQUNSLHVCQUF1QixHQUFHUyxTQUFTO0VBQzFDOztFQUVBO0VBQ0FvRSxTQUFTQSxDQUFBLEVBQUc7SUFDVixJQUFLLENBQUMsSUFBSSxDQUFDMUQsZ0JBQWdCLEVBQUc7TUFDNUIsSUFBSSxDQUFDcUosZ0JBQWdCLENBQUMsQ0FBQztNQUN2QixJQUFJLENBQUN6RCwyQkFBMkIsQ0FBQyxDQUFDO0lBQ3BDO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRXdHLHlCQUF5QkEsQ0FBQSxFQUFHO0lBQzFCLElBQUksQ0FBQ3BNLGdCQUFnQixHQUFHLElBQUk7RUFDOUI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VxTSxrQkFBa0JBLENBQUVuRSxjQUFjLEVBQUVvRSxRQUFRLEVBQUc7SUFDN0MsSUFBS3BFLGNBQWMsS0FBSyxJQUFJLEVBQUc7TUFDN0IsSUFBSSxDQUFDM0ksdUJBQXVCLENBQUMrSixLQUFLLENBQUMsQ0FBQztJQUN0QyxDQUFDLE1BQ0k7TUFDSC9LLE1BQU0sSUFBSUEsTUFBTSxDQUFFMkosY0FBYyxZQUFZM0ssY0FBYyxFQUFFLHFEQUFzRCxDQUFDO01BQ25IZ0IsTUFBTSxJQUFJQSxNQUFNLENBQUUySixjQUFjLENBQUNuSCxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzdDLGdCQUFnQixLQUFLLENBQUMsSUFBSWdLLGNBQWMsQ0FBQ2xILFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDOUMsZ0JBQWdCLEtBQUssQ0FBQyxFQUNuSSxzRkFBdUYsQ0FBQztNQUMxRixJQUFLb08sUUFBUSxFQUFHO1FBQ2QsTUFBTUMsT0FBTyxHQUFHLElBQUksQ0FBQzdNLE1BQU0sQ0FBQytGLElBQUksR0FBRzlELElBQUksQ0FBQ21GLEtBQUssQ0FBSSxDQUFFLElBQUksQ0FBQ3BILE1BQU0sQ0FBQ2xCLEtBQUssR0FBRzBKLGNBQWMsQ0FBQ25ILFFBQVEsQ0FBQyxDQUFDLElBQUssQ0FBQyxHQUFLLElBQUksQ0FBQzdDLGdCQUFpQixDQUFDLEdBQUcsSUFBSSxDQUFDQSxnQkFBZ0I7UUFDMUosTUFBTXNPLE9BQU8sR0FBRyxJQUFJLENBQUM5TSxNQUFNLENBQUNpRyxJQUFJLEdBQUdoRSxJQUFJLENBQUNtRixLQUFLLENBQUksQ0FBRSxJQUFJLENBQUNwSCxNQUFNLENBQUNqQixNQUFNLEdBQUd5SixjQUFjLENBQUNsSCxTQUFTLENBQUMsQ0FBQyxJQUFLLENBQUMsR0FBSyxJQUFJLENBQUM5QyxnQkFBaUIsQ0FBQyxHQUFHLElBQUksQ0FBQ0EsZ0JBQWdCO1FBQzVKLElBQUksQ0FBQ3FCLHVCQUF1QixDQUFDaUMsR0FBRyxDQUFFMEcsY0FBYyxDQUFDdUUsVUFBVSxDQUFFRixPQUFPLEVBQUVDLE9BQVEsQ0FBRSxDQUFDO01BQ25GLENBQUMsTUFDSTtRQUNILElBQUksQ0FBQ2pOLHVCQUF1QixDQUFDaUMsR0FBRyxDQUFFMEcsY0FBZSxDQUFDO01BQ3BEO0lBQ0Y7RUFDRjtBQUNGO0FBRUE3SyxXQUFXLENBQUNxUCxRQUFRLENBQUUscUJBQXFCLEVBQUUzTyxtQkFBb0IsQ0FBQztBQUNsRSxlQUFlQSxtQkFBbUIifQ==