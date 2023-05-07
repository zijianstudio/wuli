// Copyright 2018-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import MultiplyScreen from '../../area-model-common/js/screens/MultiplyScreen.js';
import PartitionScreen from '../../area-model-common/js/screens/PartitionScreen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import AreaModelIntroductionStrings from './AreaModelIntroductionStrings.js';

const areaModelIntroductionTitleStringProperty = AreaModelIntroductionStrings[ 'area-model-introduction' ].titleStringProperty;

const simOptions = {
  credits: {
    leadDesign: 'Amy Hanson, Amanda McGarry',
    softwareDevelopment: 'Jonathan Olson',
    team: 'Karina Hensberry, Susan Miller, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Steele Dalton, Bryce Griebenow, Ethan Johnson, Liam Mulhall, Ben Roberts, Jacob Romero, Ethan Ward, Clara Wilson, Kathryn Woessner',
    graphicArts: 'Mariah Hermsmeyer, Amanda McGarry, Diana L\u00f3pez Tavares'
  }
};

simLauncher.launch( () => {
  const sim = new Sim( areaModelIntroductionTitleStringProperty, [
    new MultiplyScreen(),
    new PartitionScreen()
  ], simOptions );
  sim.start();
} );