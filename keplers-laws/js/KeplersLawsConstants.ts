// Copyright 2023, University of Colorado Boulder

/**
 * Constants used throughout the Kepler's Laws Simulation.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import keplersLaws from './keplersLaws.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';

const KeplersLawsConstants = {
  PANELS_MIN_WIDTH: 250,

  MAX_ORBITAL_DIVISIONS: 6,
  MIN_ORBITAL_DIVISIONS: 2,

  TIMER_READOUT_OPTIONS: {
    font: new PhetFont( { size: 18 } ),
    fill: 'black'
  }
};

keplersLaws.register( 'KeplersLawsConstants', KeplersLawsConstants );
export default KeplersLawsConstants;