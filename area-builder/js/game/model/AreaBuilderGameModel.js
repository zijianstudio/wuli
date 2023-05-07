// Copyright 2014-2022, University of Colorado Boulder

/**
 * Game model that works in conjunction with the QuizGameModel to add the elements that are specific to the Area
 * Builder game.  QuizGameModel handles things that are general to PhET's quiz style games, such as state transitions,
 * and this model handles the behavior that is specific to this simulation's game, such as how correct answers are
 * presented.  This approach is experimental, and this simulation (Area Builder) is the first time that it is being
 * done, so there may be significant room for improvement.
 *
 * @author John Blanco
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Color } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
import MovableShape from '../../common/model/MovableShape.js';
import ShapePlacementBoard from '../../common/model/ShapePlacementBoard.js';
import BuildSpec from './BuildSpec.js';

// constants
const UNIT_SQUARE_LENGTH = AreaBuilderSharedConstants.UNIT_SQUARE_LENGTH; // In screen coords, which are roughly pixels
const BOARD_SIZE = new Dimension2( UNIT_SQUARE_LENGTH * 12, UNIT_SQUARE_LENGTH * 8 );
const UNIT_SQUARE_SHAPE = Shape.rect( 0, 0, UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH ).makeImmutable();

class AreaBuilderGameModel {

  constructor() {

    this.showGridOnBoardProperty = new Property( false );
    this.showDimensionsProperty = new Property( false );

    // @public Value where the user's submission of area is stored.
    this.areaGuess = 0;

    // @public The shape board where the user will build and/or evaluate shapes.
    this.shapePlacementBoard = new ShapePlacementBoard(
      BOARD_SIZE,
      UNIT_SQUARE_LENGTH,
      new Vector2( ( AreaBuilderSharedConstants.LAYOUT_BOUNDS.width - BOARD_SIZE.width ) * 0.55, 85 ), // Position empirically determined
      '*', // Allow any color shape to be placed on the board
      this.showGridOnBoardProperty,
      this.showDimensionsProperty
    );

    // @public {ObservableArrayDef.<MovableShape>} - list of movable shapes that are added by the user
    this.movableShapes = createObservableArray();

    // @private The position from which squares that animate onto the board to show a solution should emerge.  The
    // offset is empirically determined to be somewhere in the carousel.
    this.solutionShapeOrigin = new Vector2( this.shapePlacementBoard.bounds.left + 30, this.shapePlacementBoard.bounds.maxY + 30 );
  }


  // @private - replace a composite shape with unit squares
  replaceShapeWithUnitSquares( movableShape ) {
    assert && assert(
      movableShape.shape.bounds.width > UNIT_SQUARE_LENGTH || movableShape.shape.bounds.height > UNIT_SQUARE_LENGTH,
      'This method should not be called for non-composite shapes'
    );

    // break the shape into the constituent squares
    const constituentShapes = movableShape.decomposeIntoSquares( UNIT_SQUARE_LENGTH );

    // add the newly created squares to this model
    constituentShapes.forEach( shape => { this.addUserCreatedMovableShape( shape ); } );

    // replace the shape on the shape placement board with unit squares
    this.shapePlacementBoard.replaceShapeWithUnitSquares( movableShape, constituentShapes );

    // remove the original composite shape from this model
    this.movableShapes.remove( movableShape );
  }

  /**
   * Function for adding new movable shapes to this model when the user is creating them, generally by clicking on
   * some sort of creator node.
   * @param {MovableShape} movableShape
   * @public
   */
  addUserCreatedMovableShape( movableShape ) {
    const self = this;
    this.movableShapes.push( movableShape );

    movableShape.userControlledProperty.lazyLink( userControlled => {
      if ( !userControlled ) {
        if ( this.shapePlacementBoard.placeShape( movableShape ) ) {
          if ( movableShape.shape.bounds.width > UNIT_SQUARE_LENGTH || movableShape.shape.bounds.height > UNIT_SQUARE_LENGTH ) {

            // This is a composite shape, meaning that it is made up of more than one unit square.  Rather than
            // tracking these, the design team decided that they should decompose into individual unit squares once
            // they have been placed.
            if ( movableShape.animatingProperty.get() ) {
              movableShape.animatingProperty.lazyLink( function decomposeCompositeShape( animating ) {

                if ( !animating ) {

                  // unhook this function
                  movableShape.animatingProperty.unlink( decomposeCompositeShape );

                  // replace this composite shape with individual unit squares
                  if ( self.shapePlacementBoard.isResidentShape( movableShape ) ) {
                    self.replaceShapeWithUnitSquares( movableShape );
                  }
                }
              } );
            }
            else {

              // decompose the shape now, since it is already on the board
              this.replaceShapeWithUnitSquares( movableShape );
            }
          }
        }
        else {
          // Shape did not go onto board, possibly because it's not over the board or the board is full.  Send it
          // home.
          movableShape.returnToOrigin( true );
        }
      }
    } );

    // Remove the shape if it returns to its origin, since at that point it has essentially been 'put away'.
    movableShape.returnedToOriginEmitter.addListener( () => {
      if ( !movableShape.userControlledProperty.get() ) {
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
   * Add a unit square directly to the shape placement board in the specified cell position (as opposed to model
   * position).  This was created to enable solutions to game challenges to be shown, but may have other uses.
   * @param cellColumn
   * @param cellRow
   * @param color
   * @private
   */
  addUnitSquareDirectlyToBoard( cellColumn, cellRow, color ) {
    const shape = new MovableShape( UNIT_SQUARE_SHAPE, color, this.solutionShapeOrigin );
    this.movableShapes.push( shape );

    // Remove this shape when it gets returned to its original position.
    shape.returnedToOriginEmitter.addListener( () => {
      if ( !shape.userControlledProperty.get() ) {
        this.movableShapes.remove( shape );
      }
    } );

    this.shapePlacementBoard.addShapeDirectlyToCell( cellColumn, cellRow, shape );
  }

  // @public, Clear the placement board of all shapes placed on it by the user
  clearShapePlacementBoard() {
    this.shapePlacementBoard.releaseAllShapes( 'jumpHome' );
  }

  // @public?
  startLevel() {
    // Clear the 'show dimensions' and 'show grid' flag at the beginning of each new level.
    this.shapePlacementBoard.showDimensionsProperty.value = false;
    this.shapePlacementBoard.showGridProperty.value = false;
  }

  // @public
  displayCorrectAnswer( challenge ) {
    if ( challenge.buildSpec ) {

      // clear whatever the user had added
      this.clearShapePlacementBoard();

      // suspend updates of the shape placement board so that the answer can be added efficiently
      this.shapePlacementBoard.suspendUpdatesForBlockAdd();

      // Add the shapes that comprise the solution.
      assert && assert( challenge.exampleBuildItSolution !== null, 'Error: Challenge does not contain an example solution.' );
      challenge.exampleBuildItSolution.forEach( shapePlacementSpec => {
        this.addUnitSquareDirectlyToBoard(
          shapePlacementSpec.cellColumn,
          shapePlacementSpec.cellRow,
          shapePlacementSpec.color
        );
      } );
    }
    else if ( challenge.checkSpec === 'areaEntered' ) {

      // For 'find the area' challenges, we turn on the grid for the background shape when displaying the answer.
      this.shapePlacementBoard.showGridOnBackgroundShape = true;
    }
  }

  // @public
  checkAnswer( challenge ) {

    let answerIsCorrect = false;
    let userBuiltSpec;
    switch( challenge.checkSpec ) {

      case 'areaEntered':
        answerIsCorrect = this.areaGuess === challenge.backgroundShape.unitArea;
        break;

      case 'areaConstructed':
        answerIsCorrect = challenge.buildSpec.area === this.shapePlacementBoard.areaAndPerimeterProperty.get().area;
        break;

      case 'areaAndPerimeterConstructed':
        answerIsCorrect = challenge.buildSpec.area === this.shapePlacementBoard.areaAndPerimeterProperty.get().area &&
                          challenge.buildSpec.perimeter === this.shapePlacementBoard.areaAndPerimeterProperty.get().perimeter;
        break;

      case 'areaAndProportionConstructed':
        userBuiltSpec = new BuildSpec(
          this.shapePlacementBoard.areaAndPerimeterProperty.get().area,
          null,
          {
            color1: challenge.buildSpec.proportions.color1,
            color2: challenge.buildSpec.proportions.color2,
            color1Proportion: this.getProportionOfColor( challenge.buildSpec.proportions.color1 )
          }
        );
        answerIsCorrect = userBuiltSpec.equals( challenge.buildSpec );
        break;

      case 'areaPerimeterAndProportionConstructed':
        userBuiltSpec = new BuildSpec(
          this.shapePlacementBoard.areaAndPerimeterProperty.get().area,
          this.shapePlacementBoard.areaAndPerimeterProperty.get().perimeter,
          {
            color1: challenge.buildSpec.proportions.color1,
            color2: challenge.buildSpec.proportions.color2,
            color1Proportion: this.getProportionOfColor( challenge.buildSpec.proportions.color1 )
          }
        );
        answerIsCorrect = userBuiltSpec.equals( challenge.buildSpec );
        break;

      default:
        assert && assert( false, 'Unhandled check spec' );
        answerIsCorrect = false;
        break;
    }

    return answerIsCorrect;
  }

  // @public, Called from main model so that this model can do what it needs to in order to give the user another chance.
  tryAgain() {
    // Nothing needs to be reset in this model to allow the user to try again.
  }

  /**
   * Returns the proportion of the shapes on the board that are the same color as the provided value.
   * @param color
   * @public
   */
  getProportionOfColor( color ) {
    // Pass through to the shape placement board.
    return this.shapePlacementBoard.getProportionOfColor( color );
  }

  /**
   * Set up anything in the model that is needed for the specified challenge.
   * @param challenge
   * @public
   */
  setChallenge( challenge ) {
    if ( challenge ) {
      assert && assert( typeof ( challenge.backgroundShape !== 'undefined' ) );

      // Set the background shape.
      this.shapePlacementBoard.setBackgroundShape( challenge.backgroundShape, true );
      this.shapePlacementBoard.showGridOnBackgroundShape = false; // Initially off, may be turned on when showing solution.

      // Set the board to either form composite shapes or allow free placement.
      this.shapePlacementBoard.formCompositeProperty.set( challenge.backgroundShape === null );

      // Set the color scheme of the composite so that the placed squares can be seen if needed.
      if ( challenge.buildSpec && this.shapePlacementBoard.formCompositeProperty.get() && challenge.userShapes ) {

        // Make the perimeter color be a darker version of the first user shape.
        const perimeterColor = Color.toColor( challenge.userShapes[ 0 ].color ).colorUtilsDarker( AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR );

        let fillColor;
        if ( challenge.buildSpec.proportions ) {
          // The composite shape needs to be see through so that the original shapes can be seen.  This allows
          // multiple colors to be depicted, but generally doesn't look quite as good.
          fillColor = null;
        }
        else {
          // The fill color should be the same as the user shapes.  Assume all user shapes are the same color.
          fillColor = challenge.userShapes[ 0 ].color;
        }

        this.shapePlacementBoard.setCompositeShapeColorScheme( fillColor, perimeterColor );
      }
    }
  }

  /**
   * @param {number} dt
   * @public
   */
  step( dt ) {
    this.movableShapes.forEach( movableShape => { movableShape.step( dt ); } );
  }

  /**
   * resets all model elements
   * @public
   */
  reset() {
    this.shapePlacementBoard.releaseAllShapes( 'jumpHome' );
    this.movableShapes.clear();
  }

}

// Size of the shape board in terms of the unit length, needed by the challenge factory.
AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH = BOARD_SIZE.width / UNIT_SQUARE_LENGTH;
AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT = BOARD_SIZE.height / UNIT_SQUARE_LENGTH;
AreaBuilderGameModel.UNIT_SQUARE_LENGTH = UNIT_SQUARE_LENGTH;

areaBuilder.register( 'AreaBuilderGameModel', AreaBuilderGameModel );
export default AreaBuilderGameModel;