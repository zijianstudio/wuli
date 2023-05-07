// Copyright 2017-2022, University of Colorado Boulder

/**
 * Something that has a value for each orientation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import validate from '../../../../axon/js/validate.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import areaModelCommon from '../../areaModelCommon.js';

class OrientationPair {
  /**
   * @param {*} horizontal - Value for the horizontal orientation
   * @param {*} vertical - Value for the vertical orientation
   */
  constructor( horizontal, vertical ) {
    // @public {*}
    this.horizontal = horizontal;

    // @public {*}
    this.vertical = vertical;

    // @public {Array.<*>}
    this.values = [ horizontal, vertical ];
  }

  /**
   * Returns the value associated with the particular orientation.
   * @public
   *
   * @param {Orientation} orientation
   * @returns {*}
   */
  get( orientation ) {
    validate( orientation, { validValues: Orientation.enumeration.values } );

    return orientation === Orientation.HORIZONTAL ? this.horizontal : this.vertical;
  }

  /**
   * Returns a new OrientationPair with mapped values.
   * @public
   *
   * @param {Function} mapFunction - function( {*}, {Orientation} ): {*}
   * @returns {OrientationPair.<*>} - With the mapped values
   */
  map( mapFunction ) {
    return new OrientationPair(
      mapFunction( this.horizontal, Orientation.HORIZONTAL ),
      mapFunction( this.vertical, Orientation.VERTICAL )
    );
  }

  /**
   * Calls the callback on each item of the orientation pair.
   * @public
   *
   * @param {Function} callback - function( {*}, {Orientation} )
   */
  forEach( callback ) {
    callback( this.horizontal, Orientation.HORIZONTAL );
    callback( this.vertical, Orientation.VERTICAL );
  }

  /**
   * Calls reset() on each item in the orientation pair.
   * @public
   */
  reset() {
    this.forEach( value => {
      value.reset();
    } );
  }

  /**
   * Creates an orientation pair based on a factory method.
   * @public
   *
   * @param {function} factory - Called factory( {Orientation} ) : {*}, called once for each orientation to determine
   *                             the value.
   */
  static create( factory ) {
    return new OrientationPair( factory( Orientation.HORIZONTAL ), factory( Orientation.VERTICAL ) );
  }
}

areaModelCommon.register( 'OrientationPair', OrientationPair );

export default OrientationPair;