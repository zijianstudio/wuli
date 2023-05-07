// Copyright 2017-2023, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import SlopeInterceptScreen from '../../graphing-lines/js/slopeintercept/SlopeInterceptScreen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import { Color } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import GraphingSlopeInterceptStrings from './GraphingSlopeInterceptStrings.js';
import GSILineGameScreen from './linegame/GSILineGameScreen.js';

simLauncher.launch( () => {

  const backgroundColorProperty = new Property<Color | string>( 'rgb( 226, 255, 249 )' ); // light blue-green

  const screens = [
    new SlopeInterceptScreen( Tandem.ROOT.createTandem( 'slopeInterceptScreen' ), backgroundColorProperty ),
    new GSILineGameScreen( Tandem.ROOT.createTandem( 'lineGSILineGameScreen' ), backgroundColorProperty )
  ];

  const sim = new Sim( GraphingSlopeInterceptStrings[ 'graphing-slope-intercept' ].titleStringProperty, screens, {
    credits: {
      leadDesign: 'Amanda McGarry, Ariel Paul',
      softwareDevelopment: 'Chris Malley (PixelZoom, Inc.)',
      team: 'Bryce Gruneich, Karina K. R. Hensberry, Patricia Loeblein, Kathy Perkins',
      graphicArts: 'Megan Lai, Sharon Siman-Tov',
      qualityAssurance: 'Steele Dalton, Alex Dornan, Bryce Griebenow, Ethan Johnson, Elise Morgan, Liam Mulhall, ' +
                        'Oliver Orejola, Laura Rea, Benjamin Roberts, Jacob Romero, Maggie Wiseman, Kathryn Woessner, ' +
                        'Bryan Yoelin'
    }
  } );

  sim.start();
} );