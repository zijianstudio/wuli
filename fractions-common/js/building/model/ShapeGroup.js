// Copyright 2018-2022, University of Colorado Boulder

/**
 * Represents a (growing/shrinking) set of ShapeContainers, so that it can hold arbitrary mixed fraction
 * representations. Each container can hold shape pieces, and can add up to at most 1.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import fractionsCommon from '../../fractionsCommon.js';
import BuildingRepresentation from './BuildingRepresentation.js';
import BuildingType from './BuildingType.js';
import Group from './Group.js';
import ShapeContainer from './ShapeContainer.js';

class ShapeGroup extends Group {
  /**
   * @param {BuildingRepresentation} representation
   * @param {Object} [options}]
   */
  constructor( representation, options ) {
    options = merge( {
      returnPieceListener: null,

      // {number} - The maximum number of containers. Should be at least 1
      maxContainers: FractionsCommonConstants.MAX_SHAPE_CONTAINERS
    }, options );

    super( BuildingType.SHAPE );

    assert && assert( _.includes( BuildingRepresentation.VALUES, representation ) );
    assert && assert( typeof options.maxContainers === 'number' && options.maxContainers >= 1 );

    // @public {BuildingRepresentation}
    this.representation = representation;

    // @public {number}
    this.maxContainers = options.maxContainers;

    // @private {function}
    this.returnPieceListener = options.returnPieceListener;

    // @public {ObservableArrayDef.<ShapeContainer>} - Should generally only be popped/pushed
    this.shapeContainers = createObservableArray();

    // @public {Property.<number>}
    this.partitionDenominatorProperty = new NumberProperty( 1, {
      range: new Range( 1, 8 ),
      numberType: 'Integer'
    } );

    this.shapeContainers.addItemAddedListener( () => this.changedEmitter.emit() );
    this.shapeContainers.addItemRemovedListener( () => this.changedEmitter.emit() );

    // Always want at least one container
    this.increaseContainerCount();
  }

  /**
   * The current "amount" of the entire group
   * @public
   * @override
   *
   * @returns {Fraction}
   */
  get totalFraction() {
    return this.shapeContainers.reduce( ( fraction, shapeContainer ) => fraction.plus( shapeContainer.totalFractionProperty.value ), new Fraction( 0, 1 ) );
  }

  /**
   * The center positions of every "container" in the group.
   * @public
   * @override
   *
   * @returns {Array.<Vector2>}
   */
  get centerPoints() {
    return this.shapeContainers.map( shapeContainer => this.positionProperty.value.plus( shapeContainer.offset ) );
  }

  /**
   * Clears some associated temporary properties (that isn't a full reset), particularly before it is pulled from a
   * stack.
   * @public
   * @override
   */
  clear() {
    this.partitionDenominatorProperty.reset();

    super.clear();
  }

  /**
   * Whether this group contains any pieces.
   * @public
   * @override
   *
   * @returns {boolean}
   */
  hasAnyPieces() {
    for ( let i = 0; i < this.shapeContainers.length; i++ ) {
      if ( this.shapeContainers.get( i ).shapePieces.length ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Adds a container.
   * @public
   */
  increaseContainerCount() {
    const offset = new Vector2( this.shapeContainers.length * ( FractionsCommonConstants.SHAPE_SIZE + FractionsCommonConstants.SHAPE_CONTAINER_PADDING ), 0 );
    this.shapeContainers.push( new ShapeContainer( this, this.partitionDenominatorProperty, this.representation, this.changedEmitter, offset ) );
  }

  /**
   * Removes the most-recently-added container
   * @public
   */
  decreaseContainerCount() {
    while ( this.shapeContainers.length && this.shapeContainers.get( this.shapeContainers.length - 1 ).shapePieces.length ) {
      this.returnPieceListener();
    }
    this.shapeContainers.pop();
  }
}

fractionsCommon.register( 'ShapeGroup', ShapeGroup );
export default ShapeGroup;
