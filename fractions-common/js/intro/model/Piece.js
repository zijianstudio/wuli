// Copyright 2018-2020, University of Colorado Boulder

/**
 * Represents a floating piece that is not in a cell.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import fractionsCommon from '../../fractionsCommon.js';

class Piece {
  /**
   * @param {number} denominator
   */
  constructor( denominator ) {

    // @private {number} - If the denominator would ever change, this piece would just cease to exist.
    this.denominator = denominator;

    // @public {Cell|null} - Where this piece started
    this.originCell = null;

    // @public {Cell|null} - Where this piece will end up. If set to a cell, it will change the cell appearance when
    // the piece goes away.
    this.destinationCell = null;

    // @public
    this.positionProperty = new Vector2Property( Vector2.ZERO );
  }
}

fractionsCommon.register( 'Piece', Piece );
export default Piece;