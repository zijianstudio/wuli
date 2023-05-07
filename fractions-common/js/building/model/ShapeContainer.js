// Copyright 2018-2020, University of Colorado Boulder

/**
 * Represents an area of value 1 that can hold shape pieces that in total can sum up to 1.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import fractionsCommon from '../../fractionsCommon.js';
import BuildingRepresentation from './BuildingRepresentation.js';
import ShapePiece from './ShapePiece.js';

const scratchVector = new Vector2( 0, 0 ); // Used as a shared Vector2 so that we can avoid allocating vectors dynamically.

class ShapeContainer {
  /**
   * @param {ShapeGroup} shapeGroup - So far it is easier to pass through this reference (no need for 1 container).
   * @param {Property.<number>} partitionDenominatorProperty
   * @param {BuildingRepresentation} representation
   * @param {Emitter} changedEmitter
   * @param {Vector2} offset - Offset from the ShapeGroup's origin
   */
  constructor( shapeGroup, partitionDenominatorProperty, representation, changedEmitter, offset ) {

    // @public {ShapeGroup} shapeGroup
    this.shapeGroup = shapeGroup;

    // @public {Property.<number>}
    this.partitionDenominatorProperty = partitionDenominatorProperty;

    // @public {BuildingRepresentation}
    this.representation = representation;

    // @public {Emitter}
    this.changedEmitter = changedEmitter;

    // @public {Vector2}
    this.offset = offset;

    // @public {ObservableArrayDef.<ShapePiece>}
    this.shapePieces = createObservableArray();

    // @public {Property.<Fraction>}
    this.totalFractionProperty = new Property( new Fraction( 0, 1 ) );

    // Keep totalFractionProperty up-to-date
    this.shapePieces.addItemAddedListener( shapePiece => {
      this.totalFractionProperty.value = this.totalFractionProperty.value.plus( shapePiece.fraction ).reduced();
      this.changedEmitter.emit();
    } );
    this.shapePieces.addItemRemovedListener( shapePiece => {
      this.totalFractionProperty.value = this.totalFractionProperty.value.minus( shapePiece.fraction ).reduced();
      this.changedEmitter.emit();
    } );
  }

  /**
   * Returns whether the ShapePiece can be placed into this container.
   * @public
   *
   * @param {ShapePiece} shapePiece
   * @returns {boolean}
   */
  canFitPiece( shapePiece ) {
    if ( shapePiece.representation !== this.representation ) {
      return false;
    }

    const potentialTotalFraction = this.totalFractionProperty.value.plus( shapePiece.fraction ).reduce();
    return potentialTotalFraction.isLessThan( Fraction.ONE ) || potentialTotalFraction.equals( Fraction.ONE );
  }

  /**
   * Returns the distance of a point from this container.
   * @public
   *
   * @param {Vector2} point
   * @returns {number}
   */
  distanceFromPoint( point ) {

    // Subtract off our local offset
    const localPoint = scratchVector.set( point ).subtract( this.offset );

    if ( this.representation === BuildingRepresentation.PIE ) {
      return Math.max( 0, localPoint.magnitude - FractionsCommonConstants.SHAPE_SIZE / 2 );
    }
    else if ( this.representation === BuildingRepresentation.BAR ) {
      return Math.sqrt( ShapePiece.VERTICAL_BAR_BOUNDS.minimumDistanceToPointSquared( localPoint ) );
    }
    else {
      throw new Error( `Unsupported representation for ShapeContainer: ${this.representation}` );
    }
  }

  /**
   * Returns the value (from 0 to 1) of where this piece's "start" is.
   * @public
   *
   * @param {ShapePiece} shapePiece
   * @returns {number}
   */
  getShapeRatio( shapePiece ) {
    let rotation = 0;
    for ( let i = 0; i < this.shapePieces.length; i++ ) {
      const currentShapePiece = this.shapePieces.get( i );
      if ( currentShapePiece === shapePiece ) {
        return rotation;
      }
      rotation += currentShapePiece.fraction.value;
    }
    throw new Error( 'ShapePiece not found' );
  }

  /**
   * Returns the matrix transform (locally) for how to position a piece in the container with the given properties.
   * @public
   *
   * @param {number} startingRatio - The numeric value of all fraction pieces BEFORE the desired piece to orient
   * @param {Fraction} fraction - The value of the piece to orient
   * @param {BuildingRepresentation} representation
   * @returns {Matrix3}
   */
  static getShapeMatrix( startingRatio, fraction, representation ) {
    if ( representation === BuildingRepresentation.PIE ) {
      if ( fraction.equals( Fraction.ONE ) ) {
        return Matrix3.IDENTITY;
      }
      else {
        const centroid = ShapePiece.getSweptCentroid( fraction );
        const angle = -2 * Math.PI * startingRatio;
        return Matrix3.rotation2( angle ).timesMatrix( Matrix3.translationFromVector( centroid ) );
      }
    }
    else if ( representation === BuildingRepresentation.BAR ) {
      const centralValue = startingRatio + fraction.value / 2;
      return Matrix3.translation( Utils.linear( 0, 1, ShapePiece.VERTICAL_BAR_BOUNDS.minX, ShapePiece.VERTICAL_BAR_BOUNDS.maxX, centralValue ), 0 );
    }
    else {
      throw new Error( `Unsupported representation for getShapeMatrix: ${representation}` );
    }
  }
}

fractionsCommon.register( 'ShapeContainer', ShapeContainer );
export default ShapeContainer;