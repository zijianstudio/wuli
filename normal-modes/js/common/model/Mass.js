// Copyright 2020, University of Colorado Boulder

/**
 * Mass is the model for a mass that has a position, velocity and acceleration.
 * In this simulation, the properties of the masses are set and updated by the main model.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import normalModes from '../../normalModes.js';

class Mass {

  /**
   * @param {Vector2} equilibriumPosition - mass position in model coordinates when springs are at default length
   * @param {boolean} visible
   * @param {Tandem} tandem
   */
  constructor( equilibriumPosition, visible, tandem ) {

    // @public {Property.<Vector2>} mass position in model coordinates when springs are at natural length
    this.equilibriumPositionProperty = new Vector2Property( equilibriumPosition, {
      tandem: tandem.createTandem( 'equilibriumPositionProperty' )
    } );

    // @public {Property.<boolean>} determines the visibility of the mass
    this.visibleProperty = new BooleanProperty( visible, {
      tandem: tandem.createTandem( 'visibleProperty' )
    } );

    // @public {Property.<Vector2>} mass current displacement (from the equilibrium position)
    this.displacementProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'displacementProperty' )
    } );

    // @public {Property.<Vector2>} mass current velocity
    this.velocityProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'velocityProperty' )
    } );

    // @public {Property.<Vector2>} mass current acceleration
    this.accelerationProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'accelerationProperty' )
    } );

    // @public {Property.<Vector2>} mass previous acceleration (for the Velocity Verlet algorithm)
    this.previousAccelerationProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'previousAccelerationProperty' )
    } );

  }

  /**
   * Resets displacement, velocity and acceleration to zero.
   * @public
   */
  zeroPosition() {
    this.displacementProperty.reset();
    this.velocityProperty.reset();
    this.accelerationProperty.reset();
    this.previousAccelerationProperty.reset();
  }

  /**
   * Resets all mass properties.
   * @public
   */
  reset() {
    this.equilibriumPositionProperty.reset();
    this.visibleProperty.reset();
    this.zeroPosition();
  }

}

normalModes.register( 'Mass', Mass );
export default Mass;