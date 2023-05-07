// Copyright 2014-2022, University of Colorado Boulder

/**
 * Primary model class for the 'Explore' screen of the Area Builder simulation.
 *
 * @author John Blanco
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import Bucket from '../../../../phetcommon/js/model/Bucket.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
import MovableShape from '../../common/model/MovableShape.js';
import ShapePlacementBoard from '../../common/model/ShapePlacementBoard.js';

// constants
const UNIT_SQUARE_LENGTH = AreaBuilderSharedConstants.UNIT_SQUARE_LENGTH;
const UNIT_SQUARE_SHAPE = Shape.rect( 0, 0, UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH );
const SMALL_BOARD_SIZE = new Dimension2( UNIT_SQUARE_LENGTH * 9, UNIT_SQUARE_LENGTH * 8 );
const LARGE_BOARD_SIZE = new Dimension2( UNIT_SQUARE_LENGTH * 19, UNIT_SQUARE_LENGTH * 8 );
const PLAY_AREA_WIDTH = AreaBuilderSharedConstants.LAYOUT_BOUNDS.width;
const SPACE_BETWEEN_PLACEMENT_BOARDS = UNIT_SQUARE_LENGTH;
const BOARD_Y_POS = 70; // Empirically determined from looking at the layout
const BUCKET_SIZE = new Dimension2( 90, 45 );
const BOARD_TO_BUCKET_Y_SPACING = 45;

class AreaBuilderExploreModel {

  constructor() {

    this.showShapeBoardGridsProperty = new Property( true ); // @public
    this.showDimensionsProperty = new Property( true ); // @public
    this.boardDisplayModeProperty = new StringProperty( 'single' ); // @public, value values are 'single' and 'dual'

    this.movableShapes = createObservableArray(); // @public
    this.unitSquareLength = UNIT_SQUARE_LENGTH; // @public, @final

    // Create the shape placement boards. Each boardDisplayMode has its own set of boards and buckets so that state can
    // be preserved when switching modes.
    this.leftShapePlacementBoard = new ShapePlacementBoard(
      SMALL_BOARD_SIZE,
      UNIT_SQUARE_LENGTH,
      new Vector2( PLAY_AREA_WIDTH / 2 - SPACE_BETWEEN_PLACEMENT_BOARDS / 2 - SMALL_BOARD_SIZE.width, BOARD_Y_POS ),
      AreaBuilderSharedConstants.GREENISH_COLOR,
      this.showShapeBoardGridsProperty,
      this.showDimensionsProperty
    ); // @public
    this.rightShapePlacementBoard = new ShapePlacementBoard(
      SMALL_BOARD_SIZE,
      UNIT_SQUARE_LENGTH,
      new Vector2( PLAY_AREA_WIDTH / 2 + SPACE_BETWEEN_PLACEMENT_BOARDS / 2, BOARD_Y_POS ),
      AreaBuilderSharedConstants.PURPLISH_COLOR,
      this.showShapeBoardGridsProperty,
      this.showDimensionsProperty
    ); // @public
    this.singleShapePlacementBoard = new ShapePlacementBoard(
      LARGE_BOARD_SIZE,
      UNIT_SQUARE_LENGTH,
      new Vector2( PLAY_AREA_WIDTH / 2 - LARGE_BOARD_SIZE.width / 2, BOARD_Y_POS ),
      AreaBuilderSharedConstants.ORANGISH_COLOR,
      this.showShapeBoardGridsProperty,
      this.showDimensionsProperty
    ); // @public

    // @private, for convenience.
    this.shapePlacementBoards = [ this.leftShapePlacementBoard, this.rightShapePlacementBoard, this.singleShapePlacementBoard ];

    // Create the buckets that will hold the shapes.
    const bucketYPos = this.leftShapePlacementBoard.bounds.minY + SMALL_BOARD_SIZE.height + BOARD_TO_BUCKET_Y_SPACING;
    this.leftBucket = new Bucket( {
      position: new Vector2( this.leftShapePlacementBoard.bounds.minX + SMALL_BOARD_SIZE.width * 0.7, bucketYPos ),
      baseColor: '#000080',
      size: BUCKET_SIZE,
      invertY: true
    } );
    this.rightBucket = new Bucket( {
      position: new Vector2( this.rightShapePlacementBoard.bounds.minX + SMALL_BOARD_SIZE.width * 0.3, bucketYPos ),
      baseColor: '#000080',
      size: BUCKET_SIZE,
      invertY: true
    } );
    this.singleModeBucket = new Bucket( {
      position: new Vector2( this.singleShapePlacementBoard.bounds.minX + LARGE_BOARD_SIZE.width / 2, bucketYPos ),
      baseColor: '#000080',
      size: BUCKET_SIZE,
      invertY: true
    } );
  }

  /**
   * @param {number} dt
   * @public
   */
  step( dt ) {
    this.movableShapes.forEach( movableShape => { movableShape.step( dt ); } );
  }

  /**
   * @param movableShape
   * @private
   */
  placeShape( movableShape ) {
    let shapePlaced = false;
    for ( let i = 0; i < this.shapePlacementBoards.length && !shapePlaced; i++ ) {
      shapePlaced = this.shapePlacementBoards[ i ].placeShape( movableShape );
    }
    if ( !shapePlaced ) {
      movableShape.returnToOrigin( true );
    }
  }

  /**
   * Function for adding new movable shapes to this model when the user creates them, generally by clicking on some
   * some sort of creator node.
   * @public
   * @param movableShape
   */
  addUserCreatedMovableShape( movableShape ) {
    const self = this;
    this.movableShapes.push( movableShape );
    movableShape.userControlledProperty.link( userControlled => {
      if ( !userControlled ) {
        this.placeShape( movableShape );
      }
    } );

    // The shape will be removed from the model if and when it returns to its origination point.  This is how a shape
    // can be 'put back' into the bucket.
    movableShape.returnedToOriginEmitter.addListener( () => {
      if ( !movableShape.userControlledProperty.get() ) {

        // The shape has been returned to the bucket.
        this.movableShapes.remove( movableShape );
      }
    } );

    // Another point at which the shape is removed is if it fades away.
    movableShape.fadeProportionProperty.link( function fadeHandler( fadeProportion ) {
      if ( fadeProportion === 1 ) {
        self.movableShapes.remove( movableShape );
        movableShape.fadeProportionProperty.unlink( fadeHandler );
      }
    } );
  }

  /**
   * fill the boards with unit squares, useful for debugging, not used in general operation of the sim
   * @public
   */
  fillBoards() {
    this.shapePlacementBoards.forEach( board => {
      const numRows = board.bounds.height / UNIT_SQUARE_LENGTH;
      const numColumns = board.bounds.width / UNIT_SQUARE_LENGTH;
      let movableShape;
      let shapeOrigin;
      if ( board === this.leftShapePlacementBoard ) {
        shapeOrigin = this.leftBucket.position;
      }
      else if ( board === this.rightShapePlacementBoard ) {
        shapeOrigin = this.rightBucket.position;
      }
      else {
        shapeOrigin = this.singleModeBucket.position;
      }
      _.times( numColumns, columnIndex => {
        _.times( numRows, rowIndex => {
          movableShape = new MovableShape( UNIT_SQUARE_SHAPE, board.colorHandled, shapeOrigin );
          movableShape.positionProperty.set( new Vector2(
            board.bounds.minX + columnIndex * UNIT_SQUARE_LENGTH,
            board.bounds.minY + rowIndex * UNIT_SQUARE_LENGTH
          ) );
          this.addUserCreatedMovableShape( movableShape );
        } );
      } );
    } );
  }

  /**
   * Resets all model elements
   * @public
   */
  reset() {
    this.showShapeBoardGridsProperty.reset();
    this.showDimensionsProperty.reset();
    this.boardDisplayModeProperty.reset();
    this.shapePlacementBoards.forEach( board => { board.releaseAllShapes( 'jumpHome' ); } );
    this.movableShapes.clear();
  }
}

areaBuilder.register( 'AreaBuilderExploreModel', AreaBuilderExploreModel );
export default AreaBuilderExploreModel;