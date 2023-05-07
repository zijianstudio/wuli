// Copyright 2020-2022, University of Colorado Boulder

/**
 * A collection of Properties that indicate the User is modifying a physical Property that will change
 * the system in Energy Skate Park.
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import energySkatePark from '../../energySkatePark.js';

class UserControlledPropertySet {
  constructor() {

    // @public {BooleanProperty} - public so that various controls set these to `true` upon
    // user input
    this.frictionControlledProperty = new BooleanProperty( false );
    this.gravityControlledProperty = new BooleanProperty( false );
    this.massControlledProperty = new BooleanProperty( false );
    this.referenceHeightControlledProperty = new BooleanProperty( false );
    this.trackControlledProperty = new BooleanProperty( false );
    this.skaterControlledProperty = new BooleanProperty( false );
    this.stickingToTrackControlledProperty = new BooleanProperty( false );

    // @public {BooleanProperty[]} - collection of the Properties above, so they can conveniently be
    // used in a multilink
    this.properties = [
      this.frictionControlledProperty,
      this.gravityControlledProperty,
      this.massControlledProperty,
      this.referenceHeightControlledProperty,
      this.trackControlledProperty,
      this.skaterControlledProperty,
      this.stickingToTrackControlledProperty
    ];
  }
}

energySkatePark.register( 'UserControlledPropertySet', UserControlledPropertySet );

export default UserControlledPropertySet;
