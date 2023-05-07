// Copyright 2018-2021, University of Colorado Boulder

/**
 * Represents a ShapePartition with each shape marked as filled or unfilled (all with a particular color).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import fractionsCommon from '../../fractionsCommon.js';
import FillType from './FillType.js';
import ShapePartition from './ShapePartition.js';

class FilledPartition {
  /**
   * @param {ShapePartition} shapePartition
   * @param {Array.<boolean>} fills
   * @param {ColorDef} color
   */
  constructor( shapePartition, fills, color ) {
    assert && assert( shapePartition instanceof ShapePartition );
    assert && assert( Array.isArray( fills ) );
    assert && assert( fills.length === shapePartition.length );
    assert && fills.forEach( fill => assert( typeof fill === 'boolean' ) );

    // @public {ShapePartition}
    this.shapePartition = shapePartition;

    // @public {Array.<boolean>} - Index corresponds to the shapes in shapePartition
    this.fills = fills;

    // @public {ColorDef}
    this.color = color;

    // @public {Fraction} - The computed fraction for the value of this filled partition
    this.fraction = new Fraction( fills.filter( _.identity ).length, fills.length ).reduce();
  }

  /**
   * Returns a list of filled partitions, filled in the specified manner.
   * @public
   *
   * @param {ShapePartition} shapePartition
   * @param {Fraction} fraction
   * @param {ColorDef} color
   * @param {FillType} fillType
   * @returns {Array.<FilledPartition>}
   */
  static fill( shapePartition, fraction, color, fillType ) {
    assert && assert( _.includes( FillType.VALUES, fillType ) );

    if ( fillType === FillType.RANDOM ) {
      return FilledPartition.randomFill( shapePartition, fraction, color );
    }
    else if ( fillType === FillType.SEQUENTIAL ) {
      return FilledPartition.sequentialFill( shapePartition, fraction, color );
    }
    else {
      let result = [];
      while ( !fraction.isLessThan( Fraction.ONE ) ) {
        result = result.concat( FilledPartition.sequentialFill( shapePartition, Fraction.ONE, color ) );
        fraction = fraction.minus( Fraction.ONE );
      }
      return dotRandom.shuffle( [
        ...result,
        ...FilledPartition.randomFill( shapePartition, fraction, color )
      ] );
    }
  }

  /**
   * Returns a list of filled partitions, filled sequentially from the start.
   * @public
   *
   * @param {ShapePartition} shapePartition
   * @param {Fraction} fraction
   * @param {ColorDef} color
   * @returns {Array.<FilledPartition>}
   */
  static sequentialFill( shapePartition, fraction, color ) {
    const result = [];

    while ( Fraction.ZERO.isLessThan( fraction ) ) {
      result.push( new FilledPartition( shapePartition, shapePartition.shapes.map( ( _, index ) => {
        return index < fraction.numerator * ( shapePartition.length / fraction.denominator );
      } ), color ) );
      fraction = fraction.minus( Fraction.ONE );
    }

    return result;
  }

  /**
   * Returns a list of filled partitions, filled randomly.
   * @public
   *
   * @param {ShapePartition} shapePartition
   * @param {Fraction} fraction
   * @param {ColorDef} color
   * @returns {Array.<FilledPartition>}
   */
  static randomFill( shapePartition, fraction, color ) {
    const numSlicesPerPartition = shapePartition.length;
    const numFilledSlices = fraction.numerator * ( numSlicesPerPartition / fraction.denominator );
    const numPartitions = Math.ceil( fraction.value );
    const numTotalSlices = numPartitions * numSlicesPerPartition;
    const fills = dotRandom.shuffle( [
      ..._.times( numFilledSlices, () => true ),
      ..._.times( numTotalSlices - numFilledSlices, () => false )
    ] );
    return _.range( 0, numPartitions ).map( i => {
      return new FilledPartition( shapePartition, fills.slice( i * numSlicesPerPartition, ( i + 1 ) * numSlicesPerPartition ), color );
    } );
  }
}

fractionsCommon.register( 'FilledPartition', FilledPartition );

export default FilledPartition;