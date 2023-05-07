// Copyright 2017-2023, University of Colorado Boulder

/**
 * An area which may have multiple horizontal and vertical partitions.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import validate from '../../../../axon/js/validate.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import areaModelCommon from '../../areaModelCommon.js';
import OrientationPair from './OrientationPair.js';
import PartitionedArea from './PartitionedArea.js';
import Polynomial from './Polynomial.js';
import TermList from './TermList.js';

class Area {
  /**
   * @param {OrientationPair.<Array.<Partition>>} partitions - The passed-in partitions become "owned" by this Area
   *                                                           object (and they should not be shared by multiple areas
   *                                                           ever). Usually created in subtypes anyways.
   * @param {OrientationPair.<Property.<Color>>} colorProperties
   * @param {number} coordinateRangeMax - The maximum value that partition coordinate ranges may take. A (proportional)
   *                                    - partition can be held at the max, but if released at the max it will jump back
   *                                    - to 0.  Only one value is needed because the area is always square.
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed for this area
   */
  constructor( partitions, colorProperties, coordinateRangeMax, allowExponents ) {

    // @public {OrientationPair.<Array.<Partition>>} - Partitions for each orientation
    this.partitions = partitions;

    // @public {Array.<Partition>} - All partitions, regardless of orientation
    this.allPartitions = partitions.horizontal.concat( partitions.vertical );

    // @public {OrientationPair.<Property.<Color>>} - Colors for each orientation
    this.colorProperties = colorProperties;

    // @public {number} - The maximum value that partition coordinate ranges may take.
    this.coordinateRangeMax = coordinateRangeMax;

    // @public {boolean} - Whether exponents (powers of x) are allowed for this area
    this.allowExponents = allowExponents;

    // @public {Property.<number>} - The index of the highlighted calculation line (if using the LINE_BY_LINE choice).
    this.calculationIndexProperty = new NumberProperty( 0 );

    // @public {Array.<PartitionedArea>} - An array of 2-dimensional sections of area defined by a horizontal and
    // vertical pair of partitions.
    this.partitionedAreas = _.flatten( partitions.horizontal.map( horizontalPartition => partitions.vertical.map( verticalPartition => this.createPartitionedArea( new OrientationPair( horizontalPartition, verticalPartition ) ) ) ) );

    // @public {OrientationPair.<Property.<Polynomial|null>>} - Null if there is no defined total. Otherwise it's the
    // sum of the sizes of all (defined) partitions of the given orientation.
    this.totalProperties = OrientationPair.create( this.createMappedTermsArrayProperty.bind( this, terms => new Polynomial( terms ) ) );

    // @public {OrientationPair.<Property.<TermList|null>>} - Null if there is no defined partition. Otherwise it's a
    // list of the sizes of all (defined) partitions of the given orientation. This does NOT combine terms with the
    // same exponent, unlike this.totalProperties.
    this.termListProperties = OrientationPair.create( this.createMappedTermsArrayProperty.bind( this, terms => new TermList( terms ) ) );

    // @public {Property.<Polynomial|null>} - Null if there is no defined total, otherwise the total area (width of the
    // "area" times its height).
    this.totalAreaProperty = new DerivedProperty(
      this.totalProperties.values,
      ( horizontalTotal, verticalTotal ) => horizontalTotal && verticalTotal && horizontalTotal.times( verticalTotal ), {
        valueComparisonStrategy: 'equalsFunction'
      } );

    // @public {OrientationPair.<Property.<TermList|null>>} - Displayed term list for the product. Null if there is no
    // defined total.
    this.displayProperties = allowExponents ? this.termListProperties : this.totalProperties;

    // @public {OrientationPair.<Property.<Array.<number>>>} - For each orientation, will contain a property with an
    // unsorted list of unique boundary positions (the minimum or maximum coordinates of partitions). So if there are
    // two partitions for an orientation, one from 1 to 5, and the other from 5 to 7, the value of the property will be
    // [ 1, 5, 7 ]
    this.partitionBoundariesProperties = OrientationPair.create( this.createPartitionBoundariesProperty.bind( this ) );
  }

  /**
   * Creates a partitioned area given two partitions.
   * @protected
   *
   * @param {OrientationPair.<Partition>} partitions
   * @returns {PartitionedArea}
   */
  createPartitionedArea( partitions ) {
    const partitionedArea = new PartitionedArea( partitions );

    // By default, have the area linked to the partitions. This won't work for the game.
    // NOTE: Since we "own" the partitions memory-wise, we don't need to unlink here since they should all be GC'ed
    // at the same time.
    Multilink.multilink(
      [ partitions.horizontal.sizeProperty, partitions.vertical.sizeProperty ],
      ( horizontalSize, verticalSize ) => {
        if ( horizontalSize === null || verticalSize === null ) {
          partitionedArea.areaProperty.value = null;
        }
        else {
          partitionedArea.areaProperty.value = horizontalSize.times( verticalSize );
        }
      } );

    return partitionedArea;
  }

  /**
   * Resets the area to its initial values.
   * @public
   */
  reset() {
    // NOTE: Not resetting partitions here. The subtype takes care of that action (which may be indirect)
    this.calculationIndexProperty.reset();
  }

  /**
   * Erase the area to a 1x1, see https://github.com/phetsims/area-model-common/issues/77
   * @public
   */
  erase() {
    // Overridden in subtypes
  }

  /**
   * Returns all defined partitions for a given orientation.
   * @public
   *
   * @param {Orientation} orientation
   * @returns {Array.<Partition>}
   */
  getDefinedPartitions( orientation ) {
    validate( orientation, { validValues: Orientation.enumeration.values } );

    return this.partitions.get( orientation ).filter( partition => partition.isDefined() );
  }

  /**
   * Returns an array of Terms containing all of the defined partition sizes for the given orientation.
   * @public
   *
   * @param {Orientation} orientation
   * @returns {Array.<Term>}
   */
  getTerms( orientation ) {
    validate( orientation, { validValues: Orientation.enumeration.values } );

    return this.getDefinedPartitions( orientation ).map( partition => partition.sizeProperty.value );
  }

  /**
   * Returns a TermList containing all of the defined partition sizes for the given orientation.
   * @public
   *
   * @param {Orientation} orientation
   * @returns {TermList}
   */
  getTermList( orientation ) {
    validate( orientation, { validValues: Orientation.enumeration.values } );

    return new TermList( this.getTerms( orientation ) );
  }

  /**
   * Creates a DerivedProperty with `map( totalSizeTerms )` for a particular orientation, where totalSizeTerms
   * is an array of the total terms for that orientation.
   * @private
   *
   * @param {function} map - function( {Array.<Terms>} ): *
   * @param {Orientation} orientation
   * @returns {Property.<*|null>}
   */
  createMappedTermsArrayProperty( map, orientation ) {
    const properties = _.flatten( this.partitions.get( orientation ).map( partition => [ partition.sizeProperty, partition.visibleProperty ] ) );

    return new DerivedProperty( properties, () => {
      const terms = this.getTerms( orientation );
      if ( terms.length ) {
        return map( terms );
      }
      else {
        return null;
      }
    }, {
      valueComparisonStrategy: 'equalsFunction'
    } );
  }

  /**
   * Returns a property that will contain an array of all unique partition boundaries (the minimum or maximum
   * coordinate positions of a partition).
   * @private
   *
   * @param {Orientation} orientation
   * @returns {Property.<Array.<number>>}
   */
  createPartitionBoundariesProperty( orientation ) {
    const partitions = this.partitions.get( orientation );

    // Property dependencies
    const partitionProperties = _.flatten( partitions.map( partition => [ partition.coordinateRangeProperty, partition.visibleProperty ] ) );

    return new DerivedProperty( partitionProperties, () => _.uniq( _.flatten( partitions.map( partition => {
      const range = partition.coordinateRangeProperty.value;

      // Ignore null range or invisible
      if ( range === null || !partition.visibleProperty.value ) {
        return [];
      }
      else {
        return [ range.min, range.max ];
      }
    } ) ) ) );
  }
}

areaModelCommon.register( 'Area', Area );

export default Area;
