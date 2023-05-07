// Copyright 2018-2020, University of Colorado Boulder

/**
 * The ideal "target" for a collection box, that shows an additional shape-based representation of the fraction to the
 * side.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import fractionsCommon from '../../fractionsCommon.js';
import FilledPartition from './FilledPartition.js';
import Target from './Target.js';

class ShapeTarget extends Target {
  /**
   * @param {Fraction} fraction
   * @param {Array.<FilledPartition>} filledPartitions
   */
  constructor( fraction, filledPartitions ) {
    super( fraction );

    // @public {Array.<FilledPartition>}
    this.filledPartitions = filledPartitions;
  }

  /**
   * Returns a target filled in the specified manner.
   * @public
   *
   * @param {ShapePartition} shapePartition
   * @param {Fraction} fraction
   * @param {ColorDef} color
   * @param {FillType} fillType
   * @returns {ShapeTarget}
   */
  static fill( shapePartition, fraction, color, fillType ) {
    return new ShapeTarget( fraction, FilledPartition.fill( shapePartition, fraction, color, fillType ) );
  }

  /**
   * Returns a target filled sequentially from the start.
   * @public
   *
   * @param {ShapePartition} shapePartition
   * @param {Fraction} fraction
   * @param {ColorDef} color
   * @returns {ShapeTarget}
   */
  static sequentialFill( shapePartition, fraction, color ) {
    return new ShapeTarget( fraction, FilledPartition.sequentialFill( shapePartition, fraction, color ) );
  }

  /**
   * Returns a target filled randomly.
   * @public
   *
   * @param {ShapePartition} shapePartition
   * @param {Fraction} fraction
   * @param {ColorDef} color
   * @returns {ShapeTarget}
   */
  static randomFill( shapePartition, fraction, color ) {
    return new ShapeTarget( fraction, FilledPartition.randomFill( shapePartition, fraction, color ) );
  }
}

fractionsCommon.register( 'ShapeTarget', ShapeTarget );
export default ShapeTarget;