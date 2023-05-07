// Copyright 2018-2022, University of Colorado Boulder

/**
 * Model for intro-like screens that use a set of containers.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import fractionsCommon from '../../fractionsCommon.js';
import Container from './Container.js';
import IntroRepresentation from './IntroRepresentation.js';
import Piece from './Piece.js';

class ContainerSetModel {
  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    options = merge( {
      // {Array.<IntroRepresentation>}
      representations: IntroRepresentation.VALUES,

      // {number}
      initialNumerator: 0,
      initialDenominator: 1,
      initialContainerCount: 1,
      maxContainers: 6,
      maxDenominator: 8,
      bucketWidth: 355,

      // {boolean} - If true, we use more rows for containers (to fit in things like Equality Lab)
      isCompact: false
    }, options );

    // @public {Array.<IntroRepresentation>}
    this.representations = options.representations;

    // @public {Property.<IntroRepresentation>}
    this.representationProperty = new Property( IntroRepresentation.CIRCLE );

    // @public {Property.<number>} - If a fraction is N/D, the numerator is the N.
    // NOTE: All internal changes to this property should be done through changeNumeratorManually.
    this.numeratorProperty = new NumberProperty( options.initialNumerator, {
      range: new Range( 0, options.maxContainers * options.maxDenominator ),
      numberType: 'Integer'
    } );

    // @public {Property.<number>} - If a fraction is N/D, the numerator is the D
    this.denominatorProperty = new NumberProperty( options.initialDenominator, {
      range: new Range( 1, options.maxDenominator ),
      numberType: 'Integer'
    } );

    // @public {NumberProperty} - What is the maximum value the fraction can have?
    this.containerCountProperty = new NumberProperty( options.initialContainerCount, {
      range: new Range( 1, options.maxContainers ),
      numberType: 'Integer'
    } );

    // @public {boolean}
    this.isCompact = options.isCompact;

    // @public {number}
    this.bucketWidth = options.bucketWidth;

    // @public {ObservableArrayDef.<Container>}
    this.containers = createObservableArray();

    // @private {boolean} - Determines if the numerator has been changed indirectly (say, through interaction with a
    // cell/piece) rather than direct interaction (manipulation of  the numerator spinner). All internal changes to
    // the value associated with numeratorProperty should be done through the method 'changeNumeratorManually'
    this.changingInternally = false;

    // @public {ObservableArrayDef.<Piece>} - Pieces that are not filled cells (animating or user controlled)
    this.pieces = createObservableArray();

    // initialize the model with the appropriate number of containers and number of filled cells
    this.onMaxChange( this.containerCountProperty.value, 0 );
    this.onNumeratorChange( this.numeratorProperty.value, 0 );

    // Hook up listeners for external notifications (no unlink needed, since we own the Properties)
    this.numeratorProperty.lazyLink( this.onNumeratorChange.bind( this ) );
    this.denominatorProperty.lazyLink( this.onDenominatorChange.bind( this ) );
    this.containerCountProperty.lazyLink( this.onMaxChange.bind( this ) );
  }

  /**
   * Called when a user grabs a cell.
   * @public
   *
   * @param {Cell} cell
   * @returns {Piece} - The created piece that the user will start dragging
   */
  grabCell( cell ) {
    this.changeNumeratorManually( -1 );
    cell.empty();

    const piece = new Piece( this.denominatorProperty.value );
    piece.originCell = cell;
    this.pieces.push( piece );
    return piece;
  }

  /**
   * Called when a user grabs a piece from the bucketNode.
   * @public
   *
   * @returns {Piece} - The created piece that the user will start dragging
   */
  grabFromBucket() {
    const piece = new Piece( this.denominatorProperty.value );
    this.pieces.push( piece );
    return piece;
  }

  /**
   * Starts a piece animating towards the cell (counts as being filled immediately).
   * @public
   *
   * @param {Piece} piece
   * @param {Cell} cell
   */
  targetPieceToCell( piece, cell ) {
    assert && assert( piece.destinationCell === null );

    this.changeNumeratorManually( 1 );
    cell.targetWithPiece( piece );
  }

  /**
   * Interrupt a piece animating towards a cell (counts as being un-filled immediately).
   * @public
   *
   * @param {Piece} piece
   */
  untargetPiece( piece ) {
    assert && assert( piece.destinationCell !== null );

    this.changeNumeratorManually( -1 );
    piece.destinationCell.untargetFromPiece( piece );
  }

  /**
   * Immediately "finishes" the action of a piece, and removes it. If it was animating towards a cell, it will appear
   * filled.
   * @public
   *
   * @param {Piece} piece
   */
  completePiece( piece ) {
    const destinationCell = piece.destinationCell;
    if ( destinationCell ) {
      destinationCell.fillWithPiece( piece );
    }
    this.pieces.remove( piece );
  }

  /**
   * Immediately finish the action of all pieces. Helpful for denominator/max/other changes where we want to finish
   * all animations before proceeding.
   * @public
   */
  completeAllPieces() {
    while ( this.pieces.length ) {
      this.completePiece( this.pieces.get( 0 ) );
    }
  }

  /**
   * Resets the entire model.
   * @public
   */
  reset() {
    this.numeratorProperty.reset();
    this.denominatorProperty.reset();
    this.containerCountProperty.reset();
    this.representationProperty.reset();
  }

  /**
   * Fills the first available empty cell.
   * @private
   *
   * @param {boolean} animate - Whether the cell should animate into place (if false, will be instant)
   */
  fillNextCell( animate ) {
    for ( let i = 0; i < this.containers.length; i++ ) {
      const container = this.containers.get( i );
      const cell = container.getNextEmptyCell();

      if ( cell ) {
        if ( animate ) {
          const piece = new Piece( this.denominatorProperty.value );
          cell.targetWithPiece( piece );
          this.pieces.push( piece );
        }
        else {
          cell.fill();
        }
        return;
      }
    }

    throw new Error( 'could not fill a cell' );
  }

  /**
   * Empties the first available filled cell.
   * @private
   *
   * @param {boolean} animate - Whether the cell should animate to the bucketNode (if false, will be instant)
   */
  emptyNextCell( animate ) {
    for ( let i = this.containers.length - 1; i >= 0; i-- ) {
      const container = this.containers.get( i );

      const cell = container.getNextFilledCell();
      if ( cell ) {
        // If something was animating to this cell, finish the animation first
        const targetedPiece = cell.targetedPiece;
        if ( targetedPiece ) {
          this.completePiece( targetedPiece );
        }

        cell.empty();

        if ( animate && !targetedPiece ) {
          const newPiece = new Piece( this.denominatorProperty.value );
          newPiece.originCell = cell;
          this.pieces.push( newPiece );
        }
        return;
      }
    }

    throw new Error( 'could not empty a cell' );
  }

  /**
   * Handles a change in the 'max'.
   * @private
   *
   * @param {number} newMax
   * @param {number} oldMax
   */
  onMaxChange( newMax, oldMax ) {

    // So we don't have to worry about animating to different places
    this.completeAllPieces();

    const change = Math.abs( newMax - oldMax );
    _.times( change, () => {

      // Increases are simple, just add a container.
      if ( newMax > oldMax ) {
        const container = new Container();
        container.addCells( this.denominatorProperty.value );
        this.containers.push( container );
      }

      else {

        // find the container to be removed
        const lastContainer = this.containers.get( this.containers.length - 1 );

        // filled cells in the last container
        const displacedCellsCount = lastContainer.filledCellCountProperty.value;

        // number of filled cells in the other containers (excluding the last container)
        const filledCells = this.getFilledCellCount() - displacedCellsCount;

        // number of empty cells in the other containers
        const availableCellsCount = lastContainer.cells.length * newMax - filledCells;

        // the number of  filled cells to transfer from last container to the other containers
        const keptCellsCount = Math.min( availableCellsCount, displacedCellsCount );

        // add up fill
        _.times( keptCellsCount, () => {
          this.fillNextCell( false );
        } );

        // handle the extra filled cells when all the other containers are filled
        if ( displacedCellsCount > availableCellsCount ) {

          const overflowCellsCount = displacedCellsCount - availableCellsCount;
          _.times( overflowCellsCount, () => {
            this.emptyNextCell( true );
          } );

          // update the value of the numerator
          this.changeNumeratorManually( -overflowCellsCount );
        }
        // release the last (now empty) container
        this.containers.pop();
      }
    } );
  }

  /**
   * Handles a change in the numerator.
   * @private
   *
   * @param {number} newNumerator
   * @param {number} oldNumerator
   */
  onNumeratorChange( newNumerator, oldNumerator ) {
    // Ignore changes to this if we made an internal change
    if ( this.changingInternally ) {
      return;
    }

    const change = Math.abs( newNumerator - oldNumerator );
    _.times( change, () => {
      if ( newNumerator > oldNumerator ) {
        this.fillNextCell( true );
      }
      else {
        this.emptyNextCell( true );
      }
    } );
  }

  /**
   * Handles a change in the denominator.
   * @private
   *
   * @param {number} newDenominator
   * @param {number} oldDenominator
   */
  onDenominatorChange( newDenominator, oldDenominator ) {
    // So we don't have to worry about animating to different places
    this.completeAllPieces();

    const change = Math.abs( newDenominator - oldDenominator );

    // Add empty cells to every container on an increase.
    if ( newDenominator > oldDenominator ) {
      this.containers.forEach( container => {
        container.addCells( change );
      } );
    }
    // Rearrange filled cells on a decrease.
    else {
      let removedCount = 0;
      this.containers.forEach( container => {
        removedCount += container.removeCells( change );
      } );
      _.times( removedCount, () => {
        this.fillNextCell( false );
      } );
    }
  }

  /**
   * For manually changing the numerator, where we have already applied the action to be taken manually.
   * @public
   *
   * This is in contrast to automatic changes (from spinners or drag handler on numberline) where
   * we still have yet to take the actions to make our state match internally.
   *
   * @param {number} delta - The amount to add to our numerator (may be negative)
   */
  changeNumeratorManually( delta ) {
    this.changingInternally = true;
    this.numeratorProperty.value += delta;
    this.changingInternally = false;
  }

  /**
   * get the filled cells count in the containers
   * @private
   * @returns {number}
   */
  getFilledCellCount() {
    return this.containers.reduce( ( accumulator, container ) => {
      return accumulator + container.filledCellCountProperty.value;
    }, 0 );
  }
}

fractionsCommon.register( 'ContainerSetModel', ContainerSetModel );
export default ContainerSetModel;