// Copyright 2018-2020, University of Colorado Boulder

/**
 * A collection of physical values and data about the Skater at a particular time. This data can be plotted visually
 * or individually inspected by the user.
 *
 * Generally this information is static, but energy values for sample CAN change. For example, when the reference height
 * line moves, energy data updates according to this line.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import energySkatePark from '../../energySkatePark.js';

// constants
// samples will fade out to this opacity before being fully removed from the model
const MIN_OPACITY = 0.05;

class EnergySkateParkDataSample {

  /**
   * @param {SkaterState} skaterState
   * @param {number} friction - to be restored when scrubbing through data
   * @param {number} time - in seconds
   * @param {boolean} stickingToTrack
   * @param {number} fadeDecay - samples being removed retain this percent of opacity (opacity = opacity * fadeDecay)
   */
  constructor( skaterState, friction, time, stickingToTrack, fadeDecay ) {
    assert && assert( fadeDecay < 1, 'samples which have initiated removal need to fade away' );

    // @public (read-only) - values copied to avoid re-calculating when inspected
    this.speed = skaterState.getSpeed();
    this.referenceHeight = skaterState.referenceHeight;
    this.position = new Vector2( skaterState.positionX, skaterState.positionY );
    this.time = time;
    this.stickingToTrack = stickingToTrack;

    // @public (read-only) {Track} - Skater's track at time of save
    this.track = skaterState.track;

    // @private {Vector2[]} - positions of the control points for the saved track, if there is one
    this.trackControlPointPositions = [];
    if ( this.track ) {
      this.track.controlPoints.forEach( controlPoint => {
        this.trackControlPointPositions.push( controlPoint.positionProperty.get() );
      } );
    }

    // @public (read-only) {number} - values copied from SkaterState, but these may change with the reference height
    // and become out of sync with SkaterState
    this.kineticEnergy = skaterState.getKineticEnergy();
    this.potentialEnergy = skaterState.getPotentialEnergy();
    this.thermalEnergy = skaterState.thermalEnergy;
    this.totalEnergy = skaterState.getTotalEnergy();

    // @public (read-only)
    this.skaterState = skaterState;

    // @public (read-only) {number}
    this.friction = friction;

    // @public - in seconds, time since this sample was added to the model
    this.timeSinceAdded = 0;

    // @public - whether or not this sample is being inspected by the probe
    this.inspectedProperty = new BooleanProperty( false );

    // @public - the opacity of this skater sample, tied to visual representation
    this.opacityProperty = new NumberProperty( 1 );

    // @public - emits an event when this EnergySkateParkDataSample has updated in some way, like when energies change
    // due to a change in reference height
    this.updatedEmitter = new Emitter();

    // @private {number} - EnergySkateParkDataSamples which have initiated removal will retain this percentage of opacity
    // every animation frame. opacity = opacity * fadeDecay
    this.fadeDecay = fadeDecay;

    // @private {boolean} - indicates that this sample should begin removal, and will fade out
    this._initiateRemove = false;
  }

  /**
   * Calculate new energies for this EnergySkateParkDataSample with the new reference height. Potential energy will be recalculated
   * and total energy will be adjusted accordingly to conserve energy. Thermal and kinetic energies should not change.
   * @public
   *
   * @param {number} referenceHeight
   */
  setNewReferenceHeight( referenceHeight ) {

    this.referenceHeight = referenceHeight;

    const oldPotentialEnergy = this.potentialEnergy;
    this.potentialEnergy = this.getPotentialEnergyAtReferenceHeight( referenceHeight );

    const energyChange = this.potentialEnergy - oldPotentialEnergy;
    this.totalEnergy = this.totalEnergy + energyChange;

    this.updatedEmitter.emit();

    if ( assert ) {
      const totalEnergy = this.potentialEnergy + this.kineticEnergy + this.thermalEnergy;
      assert( Utils.equalsEpsilon( totalEnergy, this.totalEnergy, 1E-10 ), 'energy should be conserved' );
    }
  }

  /**
   * Get the potential energy a particular reference height, using the other physical properties of the SkaterState
   * unchanged.
   * @public
   *
   * @param {number} referenceHeight
   * @returns {number}
   */
  getPotentialEnergyAtReferenceHeight( referenceHeight ) {
    return -this.skaterState.mass * this.skaterState.gravity * ( this.skaterState.positionY - referenceHeight );
  }

  /**
   * @public
   * @param {number} dt - in seconds
   */
  step( dt ) {
    if ( this._initiateRemove ) {
      this.opacityProperty.set( this.opacityProperty.get() * this.fadeDecay );
    }

    this.timeSinceAdded += dt;
  }

  /**
   * Indicate that this skater sample is about to be removed. Opacity immediately is reduced, and after a short time
   * this sample will be completely removed.
   * @public
   */
  initiateRemove() {
    this._initiateRemove = true;
  }
}

// @public
// @static
EnergySkateParkDataSample.MIN_OPACITY = MIN_OPACITY;

energySkatePark.register( 'EnergySkateParkDataSample', EnergySkateParkDataSample );
export default EnergySkateParkDataSample;