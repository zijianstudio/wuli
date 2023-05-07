// Copyright 2017-2022, University of Colorado Boulder

/**
 * All possible layouts available via the drop-down box.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import validate from '../../../../axon/js/validate.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import areaModelCommon from '../../areaModelCommon.js';

class GenericLayout {
  /**
   * @private (use enumeration of objects)
   *
   * @param {Dimension2} size
   */
  constructor( size ) {
    // @public {Dimension2} - Dimension describes how many partitions are available in each orientation.
    this.size = size;
  }

  /**
   * Returns the number of partitions for the specific orientation.
   * @public
   *
   * @param {Orientation} orientation
   * @returns {number}
   */
  getPartitionQuantity( orientation ) {
    validate( orientation, { validValues: Orientation.enumeration.values } );

    return orientation === Orientation.HORIZONTAL ? this.size.width : this.size.height;
  }

  /**
   * Returns the layout value given a specific width and height.
   * @public
   *
   * @param {number} width
   * @param {number} height
   */
  static fromValues( width, height ) {
    assert && assert( typeof width === 'number' && isFinite( width ) && width % 1 === 0 && width >= 1 && width <= 3 );
    assert && assert( typeof height === 'number' && isFinite( height ) && height % 1 === 0 && height >= 1 && height <= 3 );

    return {
      1: {
        1: GenericLayout.ONE_BY_ONE,
        2: GenericLayout.ONE_BY_TWO,
        3: GenericLayout.ONE_BY_THREE
      },
      2: {
        1: GenericLayout.TWO_BY_ONE,
        2: GenericLayout.TWO_BY_TWO,
        3: GenericLayout.TWO_BY_THREE
      },
      3: {
        1: GenericLayout.THREE_BY_ONE,
        2: GenericLayout.THREE_BY_TWO,
        3: GenericLayout.THREE_BY_THREE
      }
    }[ width ][ height ];
  }
}

areaModelCommon.register( 'GenericLayout', GenericLayout );

// @public {GenericLayout}
GenericLayout.ONE_BY_ONE = new GenericLayout( new Dimension2( 1, 1 ) );
GenericLayout.ONE_BY_TWO = new GenericLayout( new Dimension2( 1, 2 ) );
GenericLayout.ONE_BY_THREE = new GenericLayout( new Dimension2( 1, 3 ) );
GenericLayout.TWO_BY_ONE = new GenericLayout( new Dimension2( 2, 1 ) );
GenericLayout.TWO_BY_TWO = new GenericLayout( new Dimension2( 2, 2 ) );
GenericLayout.TWO_BY_THREE = new GenericLayout( new Dimension2( 2, 3 ) );
GenericLayout.THREE_BY_ONE = new GenericLayout( new Dimension2( 3, 1 ) );
GenericLayout.THREE_BY_TWO = new GenericLayout( new Dimension2( 3, 2 ) );
GenericLayout.THREE_BY_THREE = new GenericLayout( new Dimension2( 3, 3 ) );

// @public {Array.<GenericLayout>} - All values the enumeration can take.
GenericLayout.VALUES = [
  GenericLayout.ONE_BY_ONE,
  GenericLayout.ONE_BY_TWO,
  GenericLayout.ONE_BY_THREE,
  GenericLayout.TWO_BY_ONE,
  GenericLayout.TWO_BY_TWO,
  GenericLayout.TWO_BY_THREE,
  GenericLayout.THREE_BY_ONE,
  GenericLayout.THREE_BY_TWO,
  GenericLayout.THREE_BY_THREE
];

// verify that enumeration is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( GenericLayout ); }

export default GenericLayout;