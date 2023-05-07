// Copyright 2021-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Luisa Vargas
 */

import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import BuildANucleusStrings from './BuildANucleusStrings.js';
import DecayScreen from './decay/DecayScreen.js';
import ChartIntroScreen from './chart-intro/ChartIntroScreen.js';
import BANQueryParameters from './common/BANQueryParameters.js';
import AtomIdentifier from '../../shred/js/AtomIdentifier.js';
import BANConstants from './common/BANConstants.js';

const buildANucleusTitleStringProperty = BuildANucleusStrings[ 'build-a-nucleus' ].titleStringProperty;

const simOptions: SimOptions = {

  credits: {
    leadDesign: 'Luisa Vargas, Ariel Paul',
    softwareDevelopment: 'Luisa Vargas, Chris Klusendorf',
    team: 'Jason Donev (University of Calgary), Kathy Perkins, Amy Rouinfar',
    qualityAssurance: 'Clifford Hardin, Emily Miller, Nancy Salpepi, Kathryn Woessner',
    graphicArts: '',
    soundDesign: '',
    thanks: 'We gratefully acknowledge the support of ECO Canada for helping to fund this sim.'
  }
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {

  // check if a nuclide with the given query parameters exists and reset to default values if not
  if ( !AtomIdentifier.doesExist( BANQueryParameters.protons, BANQueryParameters.neutrons ) ) {
    const errorMessage = `A nuclide with ${BANQueryParameters.protons} protons and ${BANQueryParameters.neutrons} neutrons does not exist`;

    // add a warning if the protons or neutrons query parameter was part of an invalid combo
    // there may have already been a warning added if the query parameter value is outside the valid range, so check first
    if ( !_.some( QueryStringMachine.warnings, warning => warning.key === 'protons' ) && QueryStringMachine.containsKey( 'protons' ) ) {
      QueryStringMachine.addWarning( 'protons', BANQueryParameters.protons, errorMessage );
    }
    if ( !_.some( QueryStringMachine.warnings, warning => warning.key === 'neutrons' ) && QueryStringMachine.containsKey( 'neutrons' ) ) {
      QueryStringMachine.addWarning( 'neutrons', BANQueryParameters.neutrons, errorMessage );
    }
    BANQueryParameters.protons = BANConstants.DEFAULT_INITIAL_PROTON_COUNT;
    BANQueryParameters.neutrons = BANConstants.DEFAULT_INITIAL_NEUTRON_COUNT;
  }

  const sim = new Sim( buildANucleusTitleStringProperty, [
    new DecayScreen(),
    new ChartIntroScreen()
  ], simOptions );
  sim.start();
} );