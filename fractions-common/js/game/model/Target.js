// Copyright 2018-2020, University of Colorado Boulder

/**
 * Represents the goal "target" fraction along with its associated collection area values.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import fractionsCommon from '../../fractionsCommon.js';

class Target {
  /**
   * @param {Fraction} fraction
   */
  constructor( fraction ) {

    // @public {Fraction}
    this.fraction = fraction;

    // @public {Property.<Group|null>}
    this.groupProperty = new Property( null );

    // @public - Position of our target in model units (updated from the view)
    this.positionProperty = new Vector2Property( Vector2.ZERO );

    // @public {ObservableArrayDef.<Group>}
    this.hoveringGroups = createObservableArray();
  }
}

fractionsCommon.register( 'Target', Target );
export default Target;