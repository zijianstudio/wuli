// Copyright 2014-2020, University of Colorado Boulder

/**
 * Model container for the coil in 'Faradays Law' simulation.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import faradaysLaw from '../../faradaysLaw.js';
import OrientationEnum from './OrientationEnum.js';

// constants
// in pixels, set size for transition from B=constant to B=power law
const NEAR_FIELD_RADIUS = 50;

class Coil {

  /**
   * @param {Vector2} position - center of the coil
   * @param {number} numberOfSpirals - number of spirals
   * @param {Magnet} magnet - model of the magnet
   */
  constructor( position, numberOfSpirals, magnet ) {

    // @private
    this.sense = 1; // sense of magnet = +1 or -1, simulates flipping of magnet. Magnetic field sign

    // @public (read-only)
    this.position = position;

    // @private - current value of magnetic field
    this.magneticFieldProperty = new Property( 0 );

    // @private - previous value of magnetic field
    this.previousMagneticFieldProperty = new Property( 0 );

    // @public - signal strength in coil = 'electromotive force'
    this.emfProperty = new Property( 0 );

    // @private
    this.magnet = magnet;

    // @private
    this.numberOfSpirals = numberOfSpirals;

    // set up initial conditions
    this.updateMagneticField();

    // Must be called after updateMagneticField to store the initial value
    this.previousMagneticFieldProperty.set( this.magneticFieldProperty.get() );
  }

  /**
   * Restore initial conditions
   * @public
   */
  reset() {
    this.magneticFieldProperty.reset();
    this.previousMagneticFieldProperty.reset();
    this.emfProperty.reset();
    this.updateMagneticField();
    this.previousMagneticFieldProperty.set( this.magneticFieldProperty.get() );
  }

  /**
   * Calculate magnetic field with current magnet position
   * @private
   */
  updateMagneticField() {

    const sign = this.magnet.orientationProperty.value === OrientationEnum.NS ? -1 : 1;

    const rSquared = this.position.distanceSquared( this.magnet.positionProperty.get() ) /
                     ( NEAR_FIELD_RADIUS * NEAR_FIELD_RADIUS );  // normalized squared distance from coil to magnet

    // if magnet is very close to coil, then B field is at max value;
    if ( rSquared < 1 ) {
      this.magneticFieldProperty.set( sign * 2 );
    }
    else {

      // modified dipole field --  power law of 2 gives better feel than cubic power law (original comment)
      // formula: B = s *(3 * dx^2 -r^2) / r^4, where
      // s - +-1 - sign for position of magnet
      // r - normalized distance between magnet and coil

      // normalized x-displacement from coil to magnet
      const dx = ( this.magnet.positionProperty.get().x - this.position.x ) / NEAR_FIELD_RADIUS;
      this.magneticFieldProperty.set( sign * ( 3 * dx * dx - rSquared ) / ( rSquared * rSquared ) );
    }
  }

  /**
   * Evolution of emf in coil over time
   * @param {number} dt - time in seconds
   * @public
   */
  step( dt ) {
    this.updateMagneticField();

    // number of turns in coil (equal to half the number of turns in the graphic image)
    const numberOfCoils = this.numberOfSpirals / 2;

    // emf = (nbr coils)*(change in B)/(change in t)
    const changeInMagneticField = this.magneticFieldProperty.get() - this.previousMagneticFieldProperty.get();
    this.emfProperty.set( numberOfCoils * changeInMagneticField / dt );
    this.previousMagneticFieldProperty.set( this.magneticFieldProperty.get() );
  }
}

faradaysLaw.register( 'Coil', Coil );
export default Coil;