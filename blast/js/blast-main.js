// Copyright 2013-2022, University of Colorado Boulder

/**
 * Main entry point.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import BlastScreen from './blast/BlastScreen.js';
import BlastStrings from './BlastStrings.js';

const blastTitleStringProperty = BlastStrings.blast.titleStringProperty;

simLauncher.launch( () => {

  const tandem = Tandem.ROOT;

  // add 2 instances of the same screen for memory leak testing, see phetsims/tasks#546.
  const screens = [
    new BlastScreen( tandem.createTandem( 'blast1Screen' ),
      {
        name: new Property( 'Blast 1' ),
        backgroundColorProperty: new Property( 'white' ),
        particleColor: 'red'
      }
    ),
    new BlastScreen( tandem.createTandem( 'blast2Screen' ),
      {
        name: new Property( 'Blast 2' ),
        backgroundColorProperty: new Property( 'rgb( 255, 227, 204 )' ),
        particleColor: 'blue'
      } )
  ];

  new Sim( blastTitleStringProperty, screens ).start();
} );