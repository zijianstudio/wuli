// Copyright 2013-2022, University of Colorado Boulder

/**
 * Water, the solvent in this sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import phScale from '../../phScale.js';
import PhScaleStrings from '../../PhScaleStrings.js';
import PHScaleColors from '../PHScaleColors.js';

const Water = Object.freeze( {
  nameProperty: PhScaleStrings.choice.waterStringProperty,
  pH: 7,
  concentration: 55, // mol/L
  color: PHScaleColors.WATER
} );

phScale.register( 'Water', Water );
export default Water;