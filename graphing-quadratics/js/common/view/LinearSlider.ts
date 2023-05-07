// Copyright 2023, University of Colorado Boulder

/**
 * LinearSlider is a vertical slider that has a linear taper.
 * This slider is used for the 'b', 'c', 'p', 'h', and 'k' coefficients.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQSlider, { GQSliderOptions } from './GQSlider.js';

type SelfOptions = EmptySelfOptions;

type LinearSliderOptions = SelfOptions & StrictOmit<GQSliderOptions, 'map' | 'inverseMap'>;

export default class LinearSlider extends GQSlider {

  /**
   * @param symbol - the coefficient's symbol
   * @param coefficientProperty - the coefficient's value
   * @param [provideOptions]
   */
  public constructor( symbol: string, coefficientProperty: NumberProperty, provideOptions: LinearSliderOptions ) {
    super( symbol, coefficientProperty, provideOptions );
  }
}

graphingQuadratics.register( 'LinearSlider', LinearSlider );