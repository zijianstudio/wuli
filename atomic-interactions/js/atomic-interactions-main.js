// Copyright 2014-2023, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */

import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import MappedProperty from '../../axon/js/MappedProperty.js';
import AtomicInteractionsScreen from '../../states-of-matter/js/atomic-interactions/AtomicInteractionsScreen.js';
import Tandem from '../../tandem/js/Tandem.js';
import AtomicInteractionsStrings from './AtomicInteractionsStrings.js';

const atomicInteractionsTitleStringProperty = AtomicInteractionsStrings[ 'atomic-interactions' ].titleStringProperty;

// You cannot pass the same Property instance as a single as the sim and screen name.
const screenNameProperty = new MappedProperty( atomicInteractionsTitleStringProperty, {
  bidirectional: true,
  map: _.identity, inverseMap: _.identity
} );

simLauncher.launch( () => {

  const simOptions = {
    credits: {
      leadDesign: 'Paul Beale, Yuen-ying Carpenter, Sarah McKagan, Emily B. Moore, Noah Podolefsky,<br>Amy Rouinfar',
      softwareDevelopment: 'John Blanco, Aaron Davis, Aadish Gupta',
      team: 'Wendy Adams, Jack Barbera, Amy Hanson, Kelly Lancaster, Ariel Paul, Kathy Perkins,<br>Carl Wieman',
      qualityAssurance: 'Steele Dalton, Amanda Davis, Bryce Griebenow, Ethan Johnson, Liam Mulhall,<br>' +
                        'Oliver Orejola, Laura Rea, Benjamin Roberts, Jacob Romero, Kathryn Woessner, Bryan Yoelin',
      thanks: 'Thanks to Actual Concepts for working with the PhET development team to convert this simulation to HTML5.'
    },

    preferencesModel: new PreferencesModel( {
      visualOptions: {
        supportsProjectorMode: true
      }
    } )
  };

  const sim = new Sim(
    atomicInteractionsTitleStringProperty,
    [ new AtomicInteractionsScreen( true, screenNameProperty, Tandem.ROOT.createTandem( 'atomicInteractionsScreen' ) ) ],
    simOptions );
  sim.start();
} );