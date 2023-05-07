// Copyright 2016-2023, University of Colorado Boulder

/**
 * Model for the double number line.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import unitRates from '../../unitRates.js';

// constants
const FIXED_AXIS_VALUES = [ 'numerator', 'denominator' ];
const SHARED_OPTIONS = {
  axisLabel: '', // {string} label for the axis
  maxDecimals: 1, // {number} maximum number of decimal places
  trimZeros: false // {boolean} whether to trim trailing zeros from decimal places
};

export default class DoubleNumberLine {

  /**
   * @param {Property.<number>} unitRateProperty
   * @param {Object} [options]
   */
  constructor( unitRateProperty, options ) {

    options = merge( {
      fixedAxis: 'denominator', // {string} which of the axes has a fixed (immutable) range
      fixedAxisRange: new Range( 0, 10 ), // {Range} range of the fixed axis
      numeratorOptions: null, // {*} options specific to the rate's numerator, see below
      denominatorOptions: null, // {*} options specific to the rate's denominator, see below

      // {function(number,number):boolean} determines whether a marker is major
      isMajorMarker: ( numerator, denominator ) => true
    }, options );

    assert && assert( _.includes( FIXED_AXIS_VALUES, options.fixedAxis ),
      `invalid fixedAxis: ${options.fixedAxis}` );

    // @public (read-only) options for the numerator (top) number line
    this.numeratorOptions = merge( {}, SHARED_OPTIONS, options.numeratorOptions );

    // @public (read-only) options for the denominator (bottom) number line
    this.denominatorOptions = merge( {}, SHARED_OPTIONS, options.denominatorOptions );

    // @public (read-only) {Property.<number>}
    this.unitRateProperty = unitRateProperty;

    // @public (read-only) {Marker[]} markers must be added/removed via addMarker/removeMarker
    this.markers = createObservableArray();

    // @public (read-only) {function(number,number):boolean}
    this.isMajorMarker = options.isMajorMarker;

    // @public (read-only) which of the axes has a fixed range, see FIXED_AXIS_VALUES
    this.fixedAxis = options.fixedAxis;

    // @private defined below
    this.numeratorRangeProperty = null;
    this.denominatorRangeProperty = null;

    if ( options.fixedAxis === 'numerator' ) {

      // numerator range is immutable
      this.numeratorRangeProperty = new Property( options.fixedAxisRange );
      this.numeratorRangeProperty.lazyLink( range => {  // unlink not needed, exists for sim lifetime
        throw new Error( 'numeratorRangeProperty should not change' );
      } );

      // denominator range is mutable, dispose not needed, exists for sim lifetime
      this.denominatorRangeProperty = new DerivedProperty( [ this.numeratorRangeProperty, unitRateProperty ],
        ( numeratorRange, unitRate ) => {
          return new Range( numeratorRange.min / unitRate, numeratorRange.max / unitRate );
        } );

      // when the denominator range changes, adjust the denominator of all markers,
      // unlink not needed, exists for sim lifetime
      this.denominatorRangeProperty.link( denominatorRange => {
        this.markers.forEach( marker => {
          marker.denominatorProperty.value = marker.numeratorProperty.value / unitRateProperty.value;
        } );
      } );
    }
    else {

      // denominator range is immutable
      this.denominatorRangeProperty = new Property( options.fixedAxisRange );
      this.denominatorRangeProperty.lazyLink( range => { // unlink not needed, exists for sim lifetime
        throw new Error( 'denominatorRangeProperty should not change' );
      } );

      // numerator range is mutable, dispose not needed, exists for sim lifetime
      this.numeratorRangeProperty = new DerivedProperty( [ this.denominatorRangeProperty, unitRateProperty ],
        ( denominatorRange, unitRate ) => {
          return new Range( denominatorRange.min * unitRate, denominatorRange.max * unitRate );
        } );

      // when the numerator range changes, adjust the numerator of all markers
      // unlink not needed, exists for sim lifetime
      this.numeratorRangeProperty.link( numeratorRange => {
        this.markers.forEach( marker => {
          marker.numeratorProperty.value = marker.denominatorProperty.value * unitRateProperty.value;
        } );
      } );
    }

    // @public {Property.<number|null>} marker that can be removed by pressing the undo button.
    // A single level of undo is supported.
    this.undoMarkerProperty = new Property( null );
  }

  // @public
  reset() {
    this.markers.reset();
    this.undoMarkerProperty.reset();
  }

  /**
   * Maps a rate's numerator from model to view coordinate frame.
   * @param {number} numerator - numerator in model coordinate frame
   * @param {number} viewMax - numerator's maximum in view coordinate frame
   * @returns {number}
   * @public
   */
  modelToViewNumerator( numerator, viewMax ) {
    return Utils.linear(
      this.numeratorRangeProperty.value.min, this.numeratorRangeProperty.value.max,
      0, viewMax,
      numerator );
  }

  /**
   * Maps a rate's denominator from model to view coordinate frame.
   * @param {number} denominator - denominator in model coordinate frame
   * @param {number} viewMax - denominator's maximum in view coordinate frame
   * @returns {number}
   * @public
   */
  modelToViewDenominator( denominator, viewMax ) {
    return Utils.linear(
      this.denominatorRangeProperty.value.min, this.denominatorRangeProperty.value.max,
      0, viewMax,
      denominator );
  }

  /**
   * Gets the maximum value that fits on the numerator (top) axis.
   * @returns {number}
   * @public
   */
  getMaxNumerator() {
    return this.numeratorRangeProperty.value.max;
  }

  /**
   * Gets the maximum value that fits on the denominator (bottom) axis.
   * @returns {number}
   * @public
   */
  getMaxDenominator() {
    return this.denominatorRangeProperty.value.max;
  }

  /**
   * This is a request to add a marker, subject to rules about uniqueness and marker precedence.
   * The rules are complicated to describe, so please consult the implementation.
   * Calling this function may result in a lower precedence marker being deleted as a side effect.
   * @param {Marker} marker
   * @returns {boolean} true if the marker was added, false if the request was ignored
   * @public
   */
  addMarker( marker ) {

    assert && assert( !this.markers.includes( marker ), `attempt to add marker again: ${marker}` );

    let wasAdded = false; //{boolean} state to determine whether the marker was added or not

    // look for a marker that conflicts with this one (has same numerator or denominator)
    const conflictingMarker = this.getConflictingMarker( marker );

    if ( !conflictingMarker ) {

      // if there is no marker that conflicts with this one, then simply add the marker
      this.markers.add( marker );
      wasAdded = true;
    }
    else if ( conflictingMarker.precedenceOf( marker ) >= 0 ) {

      // Replace with higher or same precedence marker.
      // Need to replace same precedence marker so that undo marker is properly set.
      this.removeMarker( conflictingMarker );
      if ( this.undoMarkerProperty.value === conflictingMarker ) {
        this.undoMarkerProperty.value = null;
      }
      this.markers.add( marker );
      wasAdded = true;
    }
    else {

      // ignore lower precedence marker
      unitRates.log && unitRates.log( `ignoring lower precedence marker: ${marker.toString()}` );
    }

    return wasAdded;
  }

  /**
   * Removes a marker.
   * @param {Marker} marker
   * @private
   */
  removeMarker( marker ) {
    assert && assert( this.markers.includes( marker ), `attempt to remove an unknown marker: ${marker}` );
    this.markers.remove( marker );
  }

  /**
   * Gets a marker that conflicts with the specified marker.
   * Two markers conflict if they have the same numerator or denominator, which is possible due to rounding errors.
   * @param {Marker} marker
   * @returns {Marker|null} null if there is no conflicting
   * @private
   */
  getConflictingMarker( marker ) {
    let conflictingMarker = null;
    for ( let i = 0; i < this.markers.length && !conflictingMarker; i++ ) {
      if ( marker.conflictsWith( this.markers[ i ] ) ) {
        conflictingMarker = this.markers[ i ];
      }
    }
    return conflictingMarker;
  }

  /**
   * Does this marker fall within the range of the axes?
   * @param {Marker} marker
   * @returns {boolean}
   * @public
   */
  markerIsInRange( marker ) {
    return ( this.numeratorRangeProperty.value.contains( marker.numeratorProperty.value ) &&
             this.denominatorRangeProperty.value.contains( marker.denominatorProperty.value ) );
  }

  /**
   * Undoes (removes) the undo marker. If there is no undo marker, this is a no-op.
   * @public
   */
  undo() {
    const undoMarker = this.undoMarkerProperty.value;
    if ( undoMarker ) {
      assert && assert( this.markers.includes( undoMarker ), `unexpected undoMarker: ${undoMarker}` );
      this.undoMarkerProperty.value = null;
      this.removeMarker( undoMarker );
    }
  }

  /**
   * Erases all markers that are erasable.
   * @public
   */
  erase() {

    this.undoMarkerProperty.reset();

    // remove all markers that are erasable
    this.markers.forEach( marker => {
      if ( marker.erasable ) {
        this.removeMarker( marker );
      }
    } );
  }
}

unitRates.register( 'DoubleNumberLine', DoubleNumberLine );