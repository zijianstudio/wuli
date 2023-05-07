// Copyright 2013-2021, University of Colorado Boulder


import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import balancingAct from '../../balancingAct.js';

// constants
const ACCELERATION_DUE_TO_GRAVITY = -9.8; // meters per second squared.

class MassForceVector {

  /**
   * @param {Object} mass - A mass object as used in this simulation.
   */
  constructor( mass ) {
    this.mass = mass;
    this.forceVectorProperty = new Property( this.generateVector( mass ) );
  }

  /**
   * @public
   */
  update() {
    this.forceVectorProperty.set( this.generateVector( this.mass ) );
  }

  /**
   * @returns {boolean}
   * @public
   */
  isObfuscated() {
    return this.mass.isMystery;
  }

  /**
   * @param {Mass} mass
   * @returns {Vector2}
   * @private
   */
  generateVector( mass ) {
    return {
      origin: new Vector2( mass.positionProperty.get().x, mass.positionProperty.get().y ),
      vector: new Vector2( 0, mass.massValue * ACCELERATION_DUE_TO_GRAVITY )
    };
  }
}

balancingAct.register( 'MassForceVector', MassForceVector );

export default MassForceVector;