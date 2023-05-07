// Copyright 2018-2021, University of Colorado Boulder

/**
 * Supertype for implementations of the layer containing views for groups and pieces.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import { Node } from '../../../../scenery/js/imports.js';
import fractionsCommon from '../../fractionsCommon.js';
import NumberGroupNode from './NumberGroupNode.js';
import NumberPieceNode from './NumberPieceNode.js';
import ShapeGroupNode from './ShapeGroupNode.js';
import ShapePieceNode from './ShapePieceNode.js';

class BuildingLayerNode extends Node {
  /**
   * @param {BuildingModel} model
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} shapeDragBoundsProperty
   * @param {Property.<Bounds2>} numberDragBoundsProperty
   */
  constructor( model, modelViewTransform, shapeDragBoundsProperty, numberDragBoundsProperty ) {
    super();

    // @private {BuildingModel}
    this.model = model;

    // @public {ModelViewTransform2}
    this.modelViewTransform = modelViewTransform;

    // @private {Property.<Bounds2>}
    this.shapeDragBoundsProperty = shapeDragBoundsProperty;
    this.numberDragBoundsProperty = numberDragBoundsProperty;

    // @private {function}
    this.addShapeGroupListener = this.addShapeGroup.bind( this );
    this.removeShapeGroupListener = this.removeShapeGroup.bind( this );
    this.addNumberGroupListener = this.addNumberGroup.bind( this );
    this.removeNumberGroupListener = this.removeNumberGroup.bind( this );
    this.addShapePieceListener = this.addShapePiece.bind( this );
    this.removeShapePieceListener = this.removeShapePiece.bind( this );
    this.addNumberPieceListener = this.addNumberPiece.bind( this );
    this.removeNumberPieceListener = this.removeNumberPiece.bind( this );
    this.groupSelectedListener = this.groupSelected.bind( this );

    // @private {Node}
    this.groupLayer = new Node();

    // @private {Node}
    this.pieceLayer = new Node();

    this.children = [
      this.groupLayer,
      this.pieceLayer
    ];

    // @private {Array.<ShapeGroupNode>}
    this.shapeGroupNodes = [];

    // @private {Array.<NumberGroupNode>}
    this.numberGroupNodes = [];

    // @private {Array.<ShapePieceNode>}
    this.shapePieceNodes = [];

    // @private {Array.<NumberPieceNode>}
    this.numberPieceNodes = [];

    // @private {Property.<Pointer|null>} - We track the latest pointer that is actively manipulating a group, so that
    // we can ignore the pointer "down" that would otherwise select groups.
    // Otherwise cases like https://github.com/phetsims/fractions-common/issues/59 would happen.
    this.activePointerProperty = new Property( null );
  }

  /**
   * Completes initialization of the layer node. This is needed since subtypes may need to set properties on `this`
   * that can't be done before the super(), so this should be done once all setup is complete.
   * @protected
   */
  initialize() {
    this.model.shapeGroups.addItemAddedListener( this.addShapeGroupListener );
    this.model.shapeGroups.addItemRemovedListener( this.removeShapeGroupListener );
    this.model.shapeGroups.forEach( this.addShapeGroupListener );

    this.model.numberGroups.addItemAddedListener( this.addNumberGroupListener );
    this.model.numberGroups.addItemRemovedListener( this.removeNumberGroupListener );
    this.model.numberGroups.forEach( this.addNumberGroupListener );

    this.model.activeShapePieces.addItemAddedListener( this.addShapePieceListener );
    this.model.activeShapePieces.addItemRemovedListener( this.removeShapePieceListener );
    this.model.activeShapePieces.forEach( this.addShapePieceListener );

    this.model.activeNumberPieces.addItemAddedListener( this.addNumberPieceListener );
    this.model.activeNumberPieces.addItemRemovedListener( this.removeNumberPieceListener );
    this.model.activeNumberPieces.forEach( this.addNumberPieceListener );

    this.model.selectedGroupProperty.lazyLink( this.groupSelectedListener );
  }

  /**
   * Returns the corresponding ShapeGroupNode for a given ShapeGroup.
   * @public
   *
   * @param {ShapeGroup} shapeGroup
   * @returns {ShapeGroupNode}
   */
  getShapeGroupNode( shapeGroup ) {
    return _.find( this.shapeGroupNodes, shapeGroupNode => shapeGroupNode.shapeGroup === shapeGroup );
  }

  /**
   * Returns the corresponding NumberGroupNode for a given NumberGroup.
   * @public
   *
   * @param {NumberGroup} numberGroup
   * @returns {NumberGroupNode}
   */
  getNumberGroupNode( numberGroup ) {
    return _.find( this.numberGroupNodes, numberGroupNode => numberGroupNode.numberGroup === numberGroup );
  }

  /**
   * Returns the corresponding ShapePieceNode for a given ShapePiece.
   * @public
   *
   * @param {ShapePiece} shapePiece
   * @returns {ShapePieceNode}
   */
  getShapePieceNode( shapePiece ) {
    return _.find( this.shapePieceNodes, shapePieceNode => shapePieceNode.shapePiece === shapePiece );
  }

  /**
   * Returns the corresponding NumberPieceNode for a given NumberPiece.
   * @public
   *
   * @param {NumberPiece} numberPiece
   * @returns {NumberPieceNode}
   */
  getNumberPieceNode( numberPiece ) {
    return _.find( this.numberPieceNodes, numberPieceNode => numberPieceNode.numberPiece === numberPiece );
  }

  /**
   * Called when a ShapeGroup is dragged.
   * @protected
   *
   * @param {ShapeGroup} shapeGroup
   */
  onShapeGroupDrag( shapeGroup ) {

  }

  /**
   * Called when a ShapeGroup is dropped.
   * @protected
   *
   * @param {ShapeGroup} shapeGroup
   */
  onShapeGroupDrop( shapeGroup ) {

  }

  /**
   * Called when the "return/remove last" button is pressed on a ShapeGroup.
   * @protected
   *
   * @param {ShapeGroup} shapeGroup
   */
  onShapeGroupRemoveLastListener( shapeGroup ) {
    this.model.removeLastPieceFromShapeGroup( shapeGroup );
  }

  /**
   * Called when a NumberGroup is dragged.
   * @protected
   *
   * @param {NumberGroup} numberGroup
   */
  onNumberGroupDrag( numberGroup ) {

  }

  /**
   * Called when a NumberGroup is dropped.
   * @protected
   *
   * @param {NumberGroup} numberGroup
   */
  onNumberGroupDrop( numberGroup ) {

  }

  /**
   * Called when the "return/remove last" button is pressed on a NumberGroup.
   * @protected
   *
   * @param {NumberGroup} numberGroup
   */
  onNumberGroupRemoveLastListener( numberGroup ) {
    this.model.removeLastPieceFromNumberGroup( numberGroup );
  }

  /**
   * Given a group, this returns a boolean Property that should be used for whether the given group is selected.
   * @private
   *
   * @param {Group} group
   * @returns {Property.<boolean>}
   */
  getGroupSelectedProperty( group ) {
    return new DerivedProperty( [ this.model.selectedGroupProperty ], selectedGroup => selectedGroup === group );
  }

  /**
   * Called when a new ShapeGroup is added to the model (we'll create the view).
   * @private
   *
   * @param {ShapeGroup} shapeGroup
   */
  addShapeGroup( shapeGroup ) {
    const shapeGroupNode = new ShapeGroupNode( shapeGroup, {
      dragBoundsProperty: this.shapeDragBoundsProperty,
      modelViewTransform: this.modelViewTransform,
      dragListener: this.onShapeGroupDrag.bind( this, shapeGroup ),
      dropListener: pointer => {
        this.onShapeGroupDrop( shapeGroup );

        // Handles releasing of pointer focus for selection
        if ( pointer === this.activePointerProperty.value ) {
          this.activePointerProperty.value = null;
        }
      },
      selectListener: pointer => {
        this.model.selectedGroupProperty.value = shapeGroup;

        // Handles capturing of pointer focus for selection
        this.activePointerProperty.value = pointer;
      },
      removeLastListener: this.onShapeGroupRemoveLastListener.bind( this, shapeGroup ),
      isSelectedProperty: this.getGroupSelectedProperty( shapeGroup )
    } );
    this.shapeGroupNodes.push( shapeGroupNode );
    this.groupLayer.addChild( shapeGroupNode );
  }

  /**
   * Called when a ShapeGroup is removed from the model (we'll remove the view).
   * @private
   *
   * @param {ShapeGroup} shapeGroup
   */
  removeShapeGroup( shapeGroup ) {
    const shapeGroupNode = _.find( this.shapeGroupNodes, shapeGroupNode => shapeGroupNode.shapeGroup === shapeGroup );
    assert && assert( shapeGroupNode );

    arrayRemove( this.shapeGroupNodes, shapeGroupNode );
    this.groupLayer.removeChild( shapeGroupNode );
    shapeGroupNode.dispose();
  }

  /**
   * Called when a new NumberGroup is added to the model (we'll create the view).
   * @private
   *
   * @param {NumberGroup} numberGroup
   */
  addNumberGroup( numberGroup ) {
    const numberGroupNode = new NumberGroupNode( numberGroup, {
      dragBoundsProperty: this.numberDragBoundsProperty,
      modelViewTransform: this.modelViewTransform,
      dragListener: this.onNumberGroupDrag.bind( this, numberGroup ),
      dropListener: pointer => {
        this.onNumberGroupDrop( numberGroup );

        // Handles releasing of pointer focus for selection (ignore if we weren't the last pointer)
        if ( pointer === this.activePointerProperty.value ) {
          this.activePointerProperty.value = null;
        }
      },
      selectListener: pointer => {
        this.model.selectedGroupProperty.value = numberGroup;

        // Handles capturing of pointer focus for selection
        this.activePointerProperty.value = pointer;
      },
      removeLastListener: this.onNumberGroupRemoveLastListener.bind( this, numberGroup ),
      isSelectedProperty: this.getGroupSelectedProperty( numberGroup )
    } );
    this.numberGroupNodes.push( numberGroupNode );
    this.groupLayer.addChild( numberGroupNode );
  }

  /**
   * Called when a NumberGroup is removed from the model (we'll remove the view).
   * @private
   *
   * @param {NumberGroup} numberGroup
   */
  removeNumberGroup( numberGroup ) {
    const numberGroupNode = _.find( this.numberGroupNodes, numberGroupNode => numberGroupNode.numberGroup === numberGroup );
    assert && assert( numberGroupNode );

    arrayRemove( this.numberGroupNodes, numberGroupNode );
    this.groupLayer.removeChild( numberGroupNode );
    numberGroupNode.dispose();
  }

  /**
   * Called when a new ShapePiece is added to the model (we'll create the view).
   * @private
   *
   * @param {ShapePiece} shapePiece
   */
  addShapePiece( shapePiece ) {
    const shapePieceNode = new ShapePieceNode( shapePiece, {
      positioned: true,
      modelViewTransform: this.modelViewTransform,
      dropListener: wasTouch => {
        this.model.shapePieceDropped( shapePiece, wasTouch ? 100 : 50 );
      }
    } );
    this.shapePieceNodes.push( shapePieceNode );
    this.pieceLayer.addChild( shapePieceNode );
  }

  /**
   * Called when a ShapePiece is removed from the model (we'll remove the view).
   * @private
   *
   * @param {ShapePiece} shapePiece
   */
  removeShapePiece( shapePiece ) {
    const shapePieceNode = _.find( this.shapePieceNodes, shapePieceNode => shapePieceNode.shapePiece === shapePiece );

    arrayRemove( this.shapePieceNodes, shapePieceNode );
    this.pieceLayer.removeChild( shapePieceNode );
    shapePieceNode.dispose();
  }

  /**
   * Called when a new NumberPiece is added to the model (we'll create the view).
   * @private
   *
   * @param {NumberPiece} numberPiece
   */
  addNumberPiece( numberPiece ) {
    const numberPieceNode = new NumberPieceNode( numberPiece, {
      positioned: true,
      modelViewTransform: this.modelViewTransform,
      dropListener: wasTouch => {
        this.model.numberPieceDropped( numberPiece, wasTouch ? 50 : 20 );
      }
    } );
    this.numberPieceNodes.push( numberPieceNode );
    this.pieceLayer.addChild( numberPieceNode );
  }

  /**
   * Called when a NumberPiece is removed from the model (we'll remove the view).
   * @private
   *
   * @param {NumberPiece} numberPiece
   */
  removeNumberPiece( numberPiece ) {
    const numberPieceNode = _.find( this.numberPieceNodes, numberPieceNode => numberPieceNode.numberPiece === numberPiece );

    arrayRemove( this.numberPieceNodes, numberPieceNode );
    this.pieceLayer.removeChild( numberPieceNode );
    numberPieceNode.dispose();
  }

  /**
   * Called when a group is selected.
   * @private
   *
   * @param {Group} group
   */
  groupSelected( group ) {
    const shapeGroupNode = _.find( this.shapeGroupNodes, shapeGroupNode => shapeGroupNode.shapeGroup === group );
    const numberGroupNode = _.find( this.numberGroupNodes, numberGroupNode => numberGroupNode.numberGroup === group );

    const groupNode = shapeGroupNode || numberGroupNode;

    // Move groups to the front when they are selected, see https://github.com/phetsims/fractions-common/issues/44
    if ( groupNode ) {
      groupNode.moveToFront();
    }
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.model.shapeGroups.removeItemAddedListener( this.addShapeGroupListener );
    this.model.shapeGroups.removeItemRemovedListener( this.removeShapeGroupListener );

    this.model.numberGroups.removeItemAddedListener( this.addNumberGroupListener );
    this.model.numberGroups.removeItemRemovedListener( this.removeNumberGroupListener );

    this.model.activeShapePieces.removeItemAddedListener( this.addShapePieceListener );
    this.model.activeShapePieces.removeItemRemovedListener( this.removeShapePieceListener );

    this.model.activeNumberPieces.removeItemAddedListener( this.addNumberPieceListener );
    this.model.activeNumberPieces.removeItemRemovedListener( this.removeNumberPieceListener );

    this.model.selectedGroupProperty.unlink( this.groupSelectedListener );

    this.shapeGroupNodes.forEach( shapeGroupNode => shapeGroupNode.dispose() );
    this.numberGroupNodes.forEach( numberGroupNode => numberGroupNode.dispose() );
    this.shapePieceNodes.forEach( shapePieceNode => shapePieceNode.dispose() );
    this.numberPieceNodes.forEach( numberPieceNode => numberPieceNode.dispose() );

    super.dispose();
  }
}

fractionsCommon.register( 'BuildingLayerNode', BuildingLayerNode );
export default BuildingLayerNode;