// Copyright 2019-2023, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import CompareScreen from './compare/CompareScreen.js';
import { Display } from '../../scenery/js/imports.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import audioManager from '../../joist/js/audioManager.js';
import SpeechSynthesisAnnouncer from '../../utterance-queue/js/SpeechSynthesisAnnouncer.js';
import NumberCompareStrings from './NumberCompareStrings.js';
import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
import NumberComparePreferencesNode from './common/view/NumberComparePreferencesNode.js';
import numberComparePreferences from './common/model/numberComparePreferences.js';
import AutoHearControl from '../../number-suite-common/js/common/view/AutoHearControl.js';
import LabScreen from '../../number-suite-common/js/lab/LabScreen.js';
import numberCompareSpeechSynthesisAnnouncer from './common/view/numberCompareSpeechSynthesisAnnouncer.js';
import NumberSuiteCommonPreferencesNode from '../../number-suite-common/js/common/view/NumberSuiteCommonPreferencesNode.js';
import numberCompareUtteranceQueue from './common/view/numberCompareUtteranceQueue.js';
import LanguageAndVoiceControl from '../../number-suite-common/js/common/view/LanguageAndVoiceControl.js';
import localeProperty from '../../joist/js/i18n/localeProperty.js';
import MathSymbols from '../../scenery-phet/js/MathSymbols.js';

const numberCompareTitleStringProperty = NumberCompareStrings[ 'number-compare' ].titleStringProperty;
const LAB_SCREEN_SYMBOLS = [ MathSymbols.LESS_THAN, MathSymbols.GREATER_THAN, MathSymbols.EQUAL_TO, MathSymbols.PLUS, MathSymbols.MINUS ];

const simOptions: SimOptions = {
  credits: {
    leadDesign: 'Amanda McGarry',
    softwareDevelopment: 'Chris Klusendorf, Luisa Vargas',
    team: 'Sylvia Celedón-Pattichis, Michael Kauzmann, Chris Malley (PixelZoom, Inc.), Ariel Paul, Kathy Perkins, Marla Schulz, Ian Whitacre',
    qualityAssurance: 'Clifford Hardin, Emily Miller, Nancy Salpepi, Martin Veillette, Kathryn Woessner',
    graphicArts: 'Mariah Hermsmeyer',
    thanks: 'Andrea Barraugh (Math Transformations), Kristin Donley, Bertha Orona'
  },
  preferencesModel: new PreferencesModel( {
    simulationOptions: {
      customPreferences: [ {
        createContent: () => new NumberComparePreferencesNode()
      } ]
    },
    audioOptions: {
      customPreferences: [ {
        createContent: () => new AutoHearControl(
          numberComparePreferences,
          numberCompareSpeechSynthesisAnnouncer,
          NumberCompareStrings.automaticallyHearNumberSentenceStringProperty,
          NumberCompareStrings.automaticallyHearNumberSentenceDescriptionStringProperty,
          NumberSuiteCommonPreferencesNode.hasScreenType( CompareScreen ) )
      } ],

      // speech synthesis is the only sound used in this sim, no general sim sounds
      supportsSound: false
    },
    localizationOptions: {
      includeLocalePanel: false,
      customPreferences: [ {
        createContent: () => new LanguageAndVoiceControl(
          localeProperty,
          numberComparePreferences.primaryVoiceProperty,
          numberCompareUtteranceQueue
        )
      } ]
    }
  } )
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {

  const sim = new Sim( numberCompareTitleStringProperty, [
    new CompareScreen( Tandem.ROOT.createTandem( 'compareScreen' ) ),
    new LabScreen( LAB_SCREEN_SYMBOLS, numberComparePreferences, Tandem.ROOT.createTandem( 'numberCompareLabScreen' ) )
  ], simOptions );
  sim.start();

  // initialize the SpeechSynthesisAnnouncers that will use speech synthesis for general sim use and setting preferences
  if ( SpeechSynthesisAnnouncer.isSpeechSynthesisSupported() ) {
    numberCompareSpeechSynthesisAnnouncer.initialize( Display.userGestureEmitter, {

      // specify the Properties that control whether output is allowed with speech synthesis
      speechAllowedProperty: new DerivedProperty( [
        sim.isConstructionCompleteProperty,
        sim.browserTabVisibleProperty,
        sim.activeProperty,
        sim.isSettingPhetioStateProperty,
        audioManager.audioEnabledProperty
      ], ( simConstructionComplete, simVisible, simActive, simSettingPhetioState, audioEnabled ) => {
        return simConstructionComplete && simVisible && simActive && !simSettingPhetioState && audioEnabled;
      } )
    } );
    numberCompareSpeechSynthesisAnnouncer.enabledProperty.value = true;
  }

  numberCompareUtteranceQueue.initialize( sim.selectedScreenProperty );
} );