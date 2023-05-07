// Copyright 2018-2022, University of Colorado Boulder

/**
 * Shows scenes that are based off of cells.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import merge from '../../../../phet-core/js/merge.js';
import { HBox, Node, VBox } from '../../../../scenery/js/imports.js';
import fractionsCommon from '../../fractionsCommon.js';
import IntroRepresentation from '../model/IntroRepresentation.js';
import BucketNode from './BucketNode.js';
import SceneNode from './SceneNode.js';

class CellSceneNode extends SceneNode {
  /**
   * @param {ContainerSetModel} model
   * @param {Object} config
   */
  constructor( model, config ) {
    config = merge( {
      // {function} - function( {Node} container, {Object} [options] ): {Node}
      createContainerNode: null,

      // {function} - function( {Node} piece, {function} finishedAnimatingCallback, {function} droppedCallback ): {Node}
      createPieceNode: null,

      // {function} - function( {number} denominator, {number} index, {Object} options ): {Node}
      // Used to create individual cells to be displayed in the bucket.
      createCellNode: null,

      // {function} - function(): {Vector2} - gives the position of the bucket when called
      getBucketPosition: null,

      // {number} - optional
      maxContainersPerRow: model.containerCountProperty.range.max
    }, config );

    assert && assert( typeof config.createContainerNode === 'function' );
    assert && assert( typeof config.createPieceNode === 'function' );
    assert && assert( typeof config.createCellNode === 'function' );
    assert && assert( typeof config.getBucketPosition === 'function' );

    super( model );

    const representation = model.representationProperty.value;

    // {function} - Creation functions from subtypes (here since we can't use the inherit pattern)
    this.createContainerNode = config.createContainerNode;
    this.createPieceNode = config.createPieceNode;

    // @private {function}
    this.getBucketPosition = config.getBucketPosition;

    // @private {number}
    this.horizontalSpacing = CellSceneNode.getHorizontalSpacing( representation );
    this.verticalSpacing = CellSceneNode.getVerticalSpacing( representation );

    // @private {VBox}
    this.containerLayer = new VBox( {
      align: 'left',
      spacing: this.verticalSpacing
    } );

    // @private {Node}
    this.pieceLayer = new Node();

    // @private {Array.<*>}
    this.containerNodes = [];

    // @private {Array.<PieceNode>}
    this.pieceNodes = [];

    //@private {Array.<HBox>}
    this.containerHBoxes = [];

    // @private {number}
    this.maxContainersPerRow = config.maxContainersPerRow;

    // @private {function}
    this.addListener = this.addContainer.bind( this );
    this.removeListener = this.removeContainer.bind( this );
    this.pieceAddedListener = this.onPieceAdded.bind( this );
    this.pieceRemovedListener = this.onPieceRemoved.bind( this );

    model.containers.addItemAddedListener( this.addListener );
    model.containers.addItemRemovedListener( this.removeListener );
    model.pieces.addItemAddedListener( this.pieceAddedListener );
    model.pieces.addItemRemovedListener( this.pieceRemovedListener );

    // Initial setup
    model.containers.forEach( this.addListener );

    // @public {BucketNode}
    this.bucketNode = new BucketNode( model.denominatorProperty, this.onBucketDragStart.bind( this ),
      config.createCellNode, model.representationProperty, { bucketWidth: model.bucketWidth } );

    this.children = [
      this.containerLayer
    ];
  }

  /**
   * Steps forward in time.
   * @public
   * @override
   *
   * @param {number} dt
   */
  step( dt ) {
    super.step( dt );

    this.pieceNodes.slice().forEach( pieceNode => {
      pieceNode.step( dt );

      if ( pieceNode.isUserControlled ) {
        const closestCell = this.getClosestCell( pieceNode.getMidpoint(), 100 );
        if ( closestCell ) {
          pieceNode.orient( closestCell, dt );
        }
      }
    } );
  }

  /**
   * Orients the piece to match the closest cell.
   * @public
   *
   * @param {Cell} closestCell
   * @param {number} dt
   */
  orient( closestCell, dt ) {
    // Implementations can customize
  }

  /**
   * Returns the closest cell, or null if none are within the threshold.
   * @public
   *
   * @param {Vector2} midpoint
   * @param {number} [threshold]
   * @returns {Cell|null}
   */
  getClosestCell( midpoint, threshold ) {
    let closestCell = null;
    let closestDistance = threshold;
    this.model.containers.forEach( container => {
      container.cells.forEach( cell => {
        if ( !cell.isFilledProperty.value ) {
          const cellMidpoint = this.getCellMidpoint( cell );
          const distance = cellMidpoint.distance( midpoint );
          if ( distance < closestDistance ) {
            closestDistance = distance;
            closestCell = cell;
          }
        }
      } );
    } );
    return closestCell;
  }

  /**
   * Returns the midpoint associated with the cell.
   * @public
   *
   * @param {Cell} cell
   * @returns {Vector2}
   */
  getCellMidpoint( cell ) {
    const containerNode = _.find( this.containerNodes, containerNode => containerNode.container === cell.container );
    const containerTrail = containerNode.getUniqueTrail();
    const pieceTrail = this.pieceLayer.getUniqueTrail();
    if ( containerTrail.nodes[ 0 ] === pieceTrail.nodes[ 0 ] ) {
      const matrix = containerTrail.getMatrixTo( pieceTrail );
      return matrix.timesVector2( containerNode.getMidpointByIndex( cell.index ) );
    }
    else {
      return Vector2.ZERO;
    }
  }

  /**
   * Finds a given PieceNode for a matching Piece.
   * @private
   *
   * @param {Piece} piece
   * @returns {PieceNode}
   */
  findPieceNode( piece ) {
    return _.find( this.pieceNodes, pieceNode => pieceNode.piece === piece );
  }

  /**
   * Called whenever a piece is added.
   * @private
   *
   * @param {Piece} piece
   */
  onPieceAdded( piece ) {
    const pieceNode = this.createPieceNode( piece,
      () => {
        this.model.completePiece( piece );
      },
      () => {
        const currentMidpoint = pieceNode.getMidpoint();

        const closestCell = this.getClosestCell( currentMidpoint, 100 );

        pieceNode.isUserControlled = false;
        pieceNode.originProperty.value = currentMidpoint;

        if ( closestCell ) {
          pieceNode.destinationProperty.value = this.getCellMidpoint( closestCell );
          this.model.targetPieceToCell( piece, closestCell );
        }
        else {
          pieceNode.destinationProperty.value = this.getBucketPosition();
        }
      } );

    const originCell = piece.originCell;
    if ( originCell ) {
      pieceNode.originProperty.value = this.getCellMidpoint( originCell );
    }
    else {
      pieceNode.originProperty.value = this.getBucketPosition();
    }

    const destinationCell = piece.destinationCell;
    if ( destinationCell ) {
      pieceNode.destinationProperty.value = this.getCellMidpoint( destinationCell );
    }
    else {
      pieceNode.destinationProperty.value = this.getBucketPosition();
    }

    this.pieceNodes.push( pieceNode );
    this.pieceLayer.addChild( pieceNode );
  }

  /**
   * Called whenever a piece is removed.
   * @private
   *
   * @param {Piece} piece
   */
  onPieceRemoved( piece ) {
    const pieceNode = this.findPieceNode( piece );
    pieceNode.interruptSubtreeInput();
    arrayRemove( this.pieceNodes, pieceNode );
    this.pieceLayer.removeChild( pieceNode );
  }

  /**
   * Called on start event when grabbing piece from bucketNode.
   * @private
   *
   * @param {SceneryEvent} event
   */
  onBucketDragStart( event ) {
    const piece = this.model.grabFromBucket();
    const piecePosition = this.globalToLocalPoint( event.pointer.point );
    piece.positionProperty.value = piecePosition;

    const pieceNode = this.findPieceNode( piece );

    pieceNode.originProperty.value = piecePosition;
    pieceNode.isUserControlled = true;
    pieceNode.dragListener.press( event );
  }

  /**
   * Handles when a user drags a cell from a displayed container.
   *
   * @param {Cell} cell
   * @param {SceneryEvent} event
   * @private
   */
  onExistingCellDragStart( cell, event ) {
    const piece = this.model.grabCell( cell );
    piece.positionProperty.value = this.getCellMidpoint( cell );

    const pieceNode = this.findPieceNode( piece );

    pieceNode.originProperty.value = this.getCellMidpoint( cell );
    pieceNode.isUserControlled = true;
    pieceNode.dragListener.press( event );
  }

  /**
   * Add a container node to the scene graph.
   * @private
   *
   * @param {Container} container
   */
  addContainer( container ) {
    const containerNode = this.createContainerNode( container, {
      cellDownCallback: this.onExistingCellDragStart.bind( this )
    } );

    const currentContainerNodesLength = this.containerNodes.length;

    this.containerNodes.push( containerNode );

    // creates new HBox within containerLayer dependent on VBox container
    if ( currentContainerNodesLength % this.maxContainersPerRow === 0 ) {
      const containerHBox = new HBox( {
        align: 'top',
        spacing: this.horizontalSpacing
      } );
      this.containerHBoxes.push( containerHBox );
      this.containerLayer.addChild( containerHBox );
    }

    // adds the new containerNode at the end of containerHboxes array
    this.containerHBoxes[ this.containerHBoxes.length - 1 ].addChild( containerNode );

    this.updateLayout();
  }

  /**
   * Remove a container node from the scene graph.
   * @private
   *
   * NOTE: This assumes that containers are removed in-order (which should currently be true)
   *
   * @param {Container} container
   */
  removeContainer( container ) {
    const containerNode = _.find( this.containerNodes, containerNode => containerNode.container === container );

    arrayRemove( this.containerNodes, containerNode );

    // removes the last containerNode within the containerHBox Array
    this.containerHBoxes[ this.containerHBoxes.length - 1 ].removeChild( containerNode );

    const currentContainerLength = this.containerNodes.length;
    if ( currentContainerLength % this.maxContainersPerRow === 0 ) {

      // removes the last HBox within containerLayer
      this.containerLayer.removeChild( this.containerHBoxes.pop() );
    }

    containerNode.dispose();

    this.updateLayout();
  }

  /**
   * Updates the layout based on our containerLayer.
   * @public
   */
  updateLayout() {
    if ( this.containerLayer.bounds.isValid() ) {
      this.containerLayer.center = Vector2.ZERO;
    }
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.pieceNodes.forEach( pieceNode => {
      pieceNode.dragListener.interrupt();
    } );
    this.containerNodes.forEach( containerNode => containerNode.dispose() );

    this.model.containers.removeItemAddedListener( this.addListener );
    this.model.containers.removeItemRemovedListener( this.removeListener );
    this.model.pieces.removeItemAddedListener( this.pieceAddedListener );
    this.model.pieces.removeItemRemovedListener( this.pieceRemovedListener );

    this.bucketNode.dispose();

    super.dispose();
  }

  /**
   * Returns the horizontal spacing between containers for a given representation.
   * @public
   *
   * @param {IntroRepresentation} representation
   * @returns {number}
   */
  static getHorizontalSpacing( representation ) {
    return ( representation === IntroRepresentation.BEAKER || representation === IntroRepresentation.HORIZONTAL_BAR ) ? 20 : 10;
  }

  /**
   * Returns the vertical spacing between containers for a given representation.
   * @public
   *
   * @param {IntroRepresentation} representation
   * @returns {number}
   */
  static getVerticalSpacing( representation ) {
    return representation === IntroRepresentation.HORIZONTAL_BAR ? 20 : 10;
  }
}

fractionsCommon.register( 'CellSceneNode', CellSceneNode );
export default CellSceneNode;
