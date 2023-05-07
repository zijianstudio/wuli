// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model for 'RGB' screen
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import EventTimer from '../../../../phet-core/js/EventTimer.js';
import { Color } from '../../../../scenery/js/imports.js';
import colorVision from '../../colorVision.js';
import ColorVisionModel from '../../common/model/ColorVisionModel.js';
import RGBConstants from '../RGBConstants.js';
import RGBPhotonBeam from './RGBPhotonBeam.js';
import RGBPhotonEventModel from './RGBPhotonEventModel.js';

// constants
const PERCENT_RANGE = new Range( 0, 100 );
const COLOR_SCALE_FACTOR = 2.55; // for multiplying a percent by to get an rgb color intensity

class RGBModel extends ColorVisionModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    super( tandem );

    // @public
    // The values of the properties redIntensity, greenIntensity, and blueIntensity are determined
    // from the sliders, and determine the density of the photons coming out of the flashlights.
    // Range is 0-100.
    this.redIntensityProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'redIntensityProperty' ),
      units: '%',
      range: PERCENT_RANGE
    } );
    this.greenIntensityProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'greenIntensityProperty' ),
      units: '%',
      range: PERCENT_RANGE
    } );
    this.blueIntensityProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'blueIntensityProperty' ),
      units: '%',
      range: PERCENT_RANGE
    } );

    // @private
    // The perceivedIntensity properties determine the color of the thought bubbles.
    // They are calculated by taking the intensity value of the most recent photon to
    // reach the end of the photon beam (the person's eye). Each photon keeps a record of the
    // intensity for this reason, even though it is not used in determining intensity of the
    // photon itself, which is constant.
    // Range is 0-100.
    this.perceivedRedIntensityProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'perceivedRedIntensityProperty' ),
      units: '%',
      range: PERCENT_RANGE
    } );
    this.perceivedGreenIntensityProperty = new NumberProperty( 0, {
      value: 0,
      tandem: tandem.createTandem( 'perceivedGreenIntensityProperty' ),
      units: '%',
      range: PERCENT_RANGE
    } );
    this.perceivedBlueIntensityProperty = new NumberProperty( 0, {
      value: 0,
      tandem: tandem.createTandem( 'perceivedBlueIntensityProperty' ),
      units: '%',
      range: PERCENT_RANGE
    } );

    // @private
    this.redBeam = new RGBPhotonBeam(
      '#ff0000',
      this.redIntensityProperty,
      this.perceivedRedIntensityProperty,
      RGBConstants.RED_BEAM_LENGTH,
      tandem.createTandem( 'redBeam' ) );
    this.greenBeam = new RGBPhotonBeam(
      '#00ff00',
      this.greenIntensityProperty,
      this.perceivedGreenIntensityProperty,
      RGBConstants.GREEN_BEAM_LENGTH,
      tandem.createTandem( 'greenBeam' ) );
    this.blueBeam = new RGBPhotonBeam(
      '#0000ff',
      this.blueIntensityProperty,
      this.perceivedBlueIntensityProperty,
      RGBConstants.BLUE_BEAM_LENGTH,
      tandem.createTandem( 'blueBeam' ) );


    // @public {Property.<Color|string>}
    // based on the combination of the three perceived intensities, this determines the thought bubble color
    this.perceivedColorProperty = new DerivedProperty( [
        this.perceivedRedIntensityProperty,
        this.perceivedGreenIntensityProperty,
        this.perceivedBlueIntensityProperty
      ],
      ( redIntensity, greenIntensity, blueIntensity ) => new Color(
        Math.floor( redIntensity * COLOR_SCALE_FACTOR ),
        Math.floor( greenIntensity * COLOR_SCALE_FACTOR ),
        Math.floor( blueIntensity * COLOR_SCALE_FACTOR ) ), {
        tandem: tandem.createTandem( 'perceivedColorProperty' ),
        phetioValueType: Color.ColorIO
      } );

    // create a ConstantEventModel for each beam
    const redEventModel = new RGBPhotonEventModel( this.redIntensityProperty );
    const greenEventModel = new RGBPhotonEventModel( this.greenIntensityProperty );
    const blueEventModel = new RGBPhotonEventModel( this.blueIntensityProperty );

    // create an EventTimer for each beam, used to regulate when to create new photons for each beam
    // @private
    this.redEventTimer = new EventTimer( redEventModel, timeElapsed => {
      this.redBeam.createPhoton( timeElapsed );
    } );

    // @private
    this.greenEventTimer = new EventTimer( greenEventModel, timeElapsed => {
      this.greenBeam.createPhoton( timeElapsed );
    } );

    // @private
    this.blueEventTimer = new EventTimer( blueEventModel, timeElapsed => {
      this.blueBeam.createPhoton( timeElapsed );
    } );

    // link the intensity of each beam to the rate of their event timers
    // we need to 0 out the timeBeforeNextEvent, otherwise there is a long delay in seeing the first photon from
    // the time when the slider is initially moved.
    this.redIntensityProperty.link( () => { this.redEventTimer.timeBeforeNextEvent = 0; } );
    this.greenIntensityProperty.link( () => { this.greenEventTimer.timeBeforeNextEvent = 0; } );
    this.blueIntensityProperty.link( () => { this.blueEventTimer.timeBeforeNextEvent = 0; } );
  }


  // @private
  // convenience method for stepping all of the beams at once, used in step and manualStep
  stepBeams( timeElapsed ) {
    this.redBeam.updateAnimationFrame( timeElapsed );
    this.greenBeam.updateAnimationFrame( timeElapsed );
    this.blueBeam.updateAnimationFrame( timeElapsed );
  }

  // @private
  // convenience method for stepping all of the timers at once
  stepTimers( dt ) {
    this.redEventTimer.step( dt );
    this.greenEventTimer.step( dt );
    this.blueEventTimer.step( dt );
  }

  // @public
  step( dt ) {

    // Cap DT, see https://github.com/phetsims/color-vision/issues/115 and https://github.com/phetsims/joist/issues/130
    dt = Math.min( dt, 0.5 );

    if ( this.playingProperty.value ) {
      this.stepBeams( dt );
      this.stepTimers( dt );
    }
  }

  // @public @override
  // step one frame, assuming 60fps
  manualStep() {
    this.stepBeams( 1 / 60 );
    this.stepTimers( 1 / 60 );
  }

  // @public @override
  reset() {

    super.reset();

    this.redIntensityProperty.reset();
    this.greenIntensityProperty.reset();
    this.blueIntensityProperty.reset();
    this.perceivedRedIntensityProperty.reset();
    this.perceivedGreenIntensityProperty.reset();
    this.perceivedBlueIntensityProperty.reset();

    this.redBeam.reset();
    this.greenBeam.reset();
    this.blueBeam.reset();
  }
}

colorVision.register( 'RGBModel', RGBModel );

export default RGBModel;