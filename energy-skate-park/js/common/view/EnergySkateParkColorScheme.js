// Copyright 2013-2021, University of Colorado Boulder

/**
 * Colors used in Energy Skate Park, using PhetColorScheme to color energies.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { Color } from '../../../../scenery/js/imports.js';
import energySkatePark from '../../energySkatePark.js';

const EnergySkateParkColorScheme = {

  // Use color instances here to prevent parsing these values multiple times, luckily PhetColorScheme also
  // uses Color instances
  kineticEnergy: PhetColorScheme.KINETIC_ENERGY,
  potentialEnergy: PhetColorScheme.GRAVITATIONAL_POTENTIAL_ENERGY,
  thermalEnergy: PhetColorScheme.HEAT_THERMAL_ENERGY,
  totalEnergy: PhetColorScheme.TOTAL_ENERGY,

  // fill of circles that show the skater path
  pathFill: new Color( 220, 175, 250 ),
  pathStroke: new Color( 'black' ),
  haloFill: new Color( 225, 231, 86, 0.75 ),

  // for radio buttons
  radioButtonBaseColor: 'white',
  radioButtonSelectedStroke: 'rgb(87,178,226)',

  // associated with the Skater to represent position of the important particle coordinate
  particleCircle: 'red',

  // colors for the Track
  roadFill: 'gray',
  roadLine: 'black',

  // colors for the reference height line
  referenceLineFill: 'rgb(74,133,208)',
  referenceLineStroke: 'black',

  // color for the reference line arrow
  referenceArrowFill: new Color( 254, 240, 53 ),

  panelFill: new Color( '#F0F0F0' ),
  panelStroke: new Color( '#ababab' ),

  // chart panels have a white fill so that energy colors are easier to see
  chartPanelFill: 'white',

  // surrounds text for better visibility
  transparentPanelFill: new Color( 255, 255, 255, 0.5 )
};

energySkatePark.register( 'EnergySkateParkColorScheme', EnergySkateParkColorScheme );

export default EnergySkateParkColorScheme;