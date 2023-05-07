// Copyright 2014-2020, University of Colorado Boulder

/**
 * Model for the voltmeter in the 'Faradays Law' simulation.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import faradaysLaw from '../../faradaysLaw.js';

// constants
const ACTIVITY_THRESHOLD = 1E-3; // Used to prevent perpetual oscillation of the needle, value empirically determined.
const NEEDLE_RESPONSIVENESS = 50;  // needle responsiveness
const NEEDLE_FRICTION = 10; // friction coefficient, so needle motion looks realistic

class Voltmeter {

  /**
   * @param {FaradaysLawModel} model - simulation model
   */
  constructor( model ) {

    // @private
    this.model = model;

    // @private {number} - rad/sec
    this.needleAngularVelocity = 0;

    // @private {number} - rad/s^2
    this.needleAngularAcceleration = 0;

    // @private {NumberProperty} - converts emf from the magnets into a force on the needle (which is correlated with the displayed voltage)
    this.signalProperty = new NumberProperty( 0 );

    // @public {DerivedProperty.<number>}
    this.needleAngleProperty = new DerivedProperty( [ model.voltageProperty ], voltage => voltage, {
      units: 'radians',
      phetioHighFrequency: true
    } );
  }

  /**
   * voltmeter needle evolution over time
   * @param {number} dt - elapsed time in seconds
   * @public
   */
  step( dt ) {

    // Calculate the signal, combining the EMF from both coils.  The multiplier (including the sign thereof) is
    // empirically determined to make the needle move the correct amount and direction.
    this.signalProperty.set( 0.2 * ( this.model.bottomCoil.emfProperty.get() + this.model.topCoil.emfProperty.get() ) );

    this.needleAngularAcceleration = NEEDLE_RESPONSIVENESS * ( this.signalProperty.get() - this.model.voltageProperty.get() ) - NEEDLE_FRICTION * this.needleAngularVelocity; // angular acceleration of needle
    this.model.voltageProperty.set( this.model.voltageProperty.get() + this.needleAngularVelocity * dt + 0.5 * this.needleAngularAcceleration * dt * dt ); // angle of needle
    const angularVelocity = this.needleAngularVelocity + this.needleAngularAcceleration * dt;
    const angularAcceleration = NEEDLE_RESPONSIVENESS * ( this.signalProperty.get() - this.model.voltageProperty.get() ) - NEEDLE_FRICTION * angularVelocity;
    this.needleAngularVelocity = this.needleAngularVelocity + 0.5 * dt * ( this.needleAngularAcceleration + angularAcceleration );

    // Clamp the needle angle when its position, velocity, and acceleration go below a threshold so that it doesn't
    // oscillate forever.
    if ( this.needleAngularAcceleration !== 0 && Math.abs( this.needleAngularAcceleration ) < ACTIVITY_THRESHOLD &&
         this.needleAngularVelocity !== 0 && Math.abs( this.needleAngularVelocity ) < ACTIVITY_THRESHOLD &&
         this.model.voltageProperty.get() !== 0 && Math.abs( this.model.voltageProperty.get() ) < ACTIVITY_THRESHOLD ) {
      this.model.voltageProperty.set( 0 );
      this.needleAngularVelocity = 0;
      this.needleAngularAcceleration = 0;
    }
  }
}

faradaysLaw.register( 'Voltmeter', Voltmeter );
export default Voltmeter;