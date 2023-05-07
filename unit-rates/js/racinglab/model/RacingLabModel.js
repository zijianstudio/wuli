// Copyright 2017-2023, University of Colorado Boulder

/**
 * Model for the 'Racing Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import blueCar_png from '../../../images/blueCar_png.js';
import redCar_png from '../../../images/redCar_png.js';
import URColors from '../../common/URColors.js';
import unitRates from '../../unitRates.js';
import RaceCar from './RaceCar.js';

export default class RacingLabModel {

  constructor() {

    // @public is the race running?
    this.runningProperty = new BooleanProperty( false );

    // @public the red (top) car
    this.car1 = new RaceCar( redCar_png, {
      color: URColors.car1,
      trackLength: 150
    } );

    // @public the blue (bottom) car
    this.car2 = new RaceCar( blueCar_png, {
      color: URColors.car2,
      trackLength: 100,
      visible: false
    } );

    // When both cars reach the finish line, stop the race.  unmulitlink not needed.
    Multilink.lazyMultilink(
      [ this.car1.distanceProperty, this.car2.distanceProperty ],
      ( distance1, distance2 ) => {
        if ( this.car1.isAtFinish() && ( !this.car2.visibleProperty.value || this.car2.isAtFinish() ) ) {
          this.runningProperty.value = false;
        }
      } );

    // If both cars are at the finish line, changing the state to running restarts the race. unlink not needed.
    this.runningProperty.link( running => {
      if ( running && this.car1.isAtFinish() && ( !this.car2.visibleProperty.value || this.car2.isAtFinish() ) ) {
        this.car1.resetRace();
        this.car2.resetRace();
      }
    } );

    // Reset the race when any of these Properties is changed. unmultilink not needed
    // See https://github.com/phetsims/unit-rates/issues/93
    Multilink.lazyMultilink( [

        // changed via the scene radio buttons
        this.car2.visibleProperty,

        // changed via the Rate spinners
        this.car1.rate.numeratorProperty,
        this.car1.rate.denominatorProperty,
        this.car2.rate.numeratorProperty,
        this.car2.rate.denominatorProperty,

        // changed by dragging the finish line flags
        this.car1.track.lengthProperty,
        this.car2.track.lengthProperty
      ],
      this.resetRace.bind( this ) );
  }

  // @public
  reset() {
    this.runningProperty.reset();
    this.car1.reset();
    this.car2.reset();
  }

  // @private resets the race
  resetRace() {
    this.runningProperty.reset();
    this.car1.resetRace();
    this.car2.resetRace();
  }

  /**
   * Updates time-dependent parts of the model.
   * @param {number} dt - time since the previous step, in seconds
   * @public
   */
  step( dt ) {

    // Cap dt, see https://github.com/phetsims/unit-rates/issues/193
    dt = Math.min( dt, 0.1 );

    if ( this.runningProperty.value ) {
      this.car1.step( dt );
      this.car2.step( dt );
    }
  }
}

unitRates.register( 'RacingLabModel', RacingLabModel );