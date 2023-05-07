// Copyright 2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import GOPreferences from '../../geometric-optics/js/common/model/GOPreferences.js';
import GOSim from '../../geometric-optics/js/GOSim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import GeometricOpticsBasicsStrings from './GeometricOpticsBasicsStrings.js';

simLauncher.launch( () => {

  // In Geometric Optics: Basics, we want to respect the focalLengthControl query parameter.
  // But if that query parameter is not provided, then set the associated Property to 'direct'.
  if ( !QueryStringMachine.containsKey( 'focalLengthControl' ) ) {
    GOPreferences.focalLengthModelTypeProperty.value = 'direct';
  }

  // In Geometric Optics: Basics, we want to respect the add2FPointsCheckbox query parameter.
  // But if that query parameter is not provided, then set the associated Property to true.
  if ( !QueryStringMachine.containsKey( 'add2FPointsCheckbox' ) ) {
    GOPreferences.add2FPointsCheckboxProperty.value = true;
  }

  const sim = new GOSim( GeometricOpticsBasicsStrings[ 'geometric-optics-basics' ].titleStringProperty, {
    isBasicsVersion: true,
    phetioDesigned: true
  } );
  sim.start();
} );