// Copyright 2017-2023, University of Colorado Boulder

/**
 * A 1-dimensional section of either the width or height.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import validate from '../../../../axon/js/validate.js';
import Range from '../../../../dot/js/Range.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import areaModelCommon from '../../areaModelCommon.js';
import Term from './Term.js';

class Partition {
  /**
   * @param {Orientation} orientation
   * @param {Property.<Color>} colorProperty
   */
  constructor( orientation, colorProperty ) {
    validate( orientation, { validValues: Orientation.enumeration.values } );
    assert && assert( colorProperty instanceof ReadOnlyProperty );

    // @public {Property.<Term|null>} - Null indicates the size is not defined.
    this.sizeProperty = new Property( null, {
      valueComparisonStrategy: 'equalsFunction',
      isValidValue: Term.isTermOrNull
    } );

    // @public {Orientation} - an intrinsic property of the Partition
    this.orientation = orientation;

    // @public {Property.<Color>}
    this.colorProperty = colorProperty;

    // @public {Property.<boolean>} - Owned property, does not need to be disposed.
    this.visibleProperty = new BooleanProperty( true );

    // @public {Property.<Range|null>} - The contained 'section' of the full available model area. Should be null when
    // coordinates can't be computed. For generic partitions, it will be from 0 to 1. For proportional partitions, it
    // will be from 0 to its maximum size. Owned property, does not need to be disposed.
    this.coordinateRangeProperty = new Property( null, {
      valueComparisonStrategy: 'equalsFunction',
      isValidValue: value => value === null || value instanceof Range
    } );
  }

  /**
   * Returns whether this partition is defined, i.e. "is shown in the area, and has a size"
   * @public
   *
   * @returns {boolean}
   */
  isDefined() {
    return this.visibleProperty.value && this.sizeProperty.value !== null;
  }
}

areaModelCommon.register( 'Partition', Partition );

export default Partition;