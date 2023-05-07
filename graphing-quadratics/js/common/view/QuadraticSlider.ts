// Copyright 2018-2023, University of Colorado Boulder

/**
 * QuadraticSlider is a vertical slider that has a quadratic taper.
 * This slider is used for the 'a' coefficient in the Explore screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQSlider, { GQSliderOptions } from './GQSlider.js';

type SelfOptions = EmptySelfOptions;

type QuadraticSliderOptions = SelfOptions & StrictOmit<GQSliderOptions, 'map' | 'inverseMap'>;

export default class QuadraticSlider extends GQSlider {

  /**
   * @param symbol - the coefficient's symbol
   * @param coefficientProperty - the coefficient's value
   * @param [providedOptions]
   */
  public constructor( symbol: string, coefficientProperty: NumberProperty, providedOptions: QuadraticSliderOptions ) {

    assert && assert( Math.abs( coefficientProperty.range.min ) === coefficientProperty.range.max,
      `symmetrical range is required: ${coefficientProperty.range}` );

    // coefficient for quadratic equation y = ax^2
    const a = 1 / coefficientProperty.range.max;

    const options = optionize<QuadraticSliderOptions, SelfOptions, GQSliderOptions>()( {

      // map coefficientProperty.value to slider value, x = sqrt( y / a )
      map: value => ( Math.sign( value ) * Math.sqrt( Math.abs( value ) / a ) ),

      // map slider value to coefficientProperty.value, y = ax^2
      inverseMap: value => ( Math.sign( value ) * a * value * value )
    }, providedOptions );

    super( symbol, coefficientProperty, options );
  }
}

graphingQuadratics.register( 'QuadraticSlider', QuadraticSlider );