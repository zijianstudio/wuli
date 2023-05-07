// Copyright 2022, University of Colorado Boulder
/**
 * Main entry point for the sim.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import { Image } from '../../scenery/js/imports.js';
import measureIcon_png from '../images/measureIcon_png.js';
import pressureIcon_png from '../images/pressureIcon_png.js';
import reflectionIcon_png from '../images/reflectionIcon_png.js';
import singleSourceIcon_png from '../images/singleSourceIcon_png.js';
import twoSourceIcon_png from '../images/twoSourceIcon_png.js';
import MeasureModel from './measure/MeasureModel.js';
import PressureModel from './air-pressure/PressureModel.js';
import ReflectionModel from './reflection/ReflectionModel.js';
import IntroModel from './intro/IntroModel.js';
import TwoSourceModel from './two-sources/TwoSourceModel.js';
import SoundScreen from './common/SoundScreen.js';
import MeasureView from './measure/MeasureView.js';
import PressureView from './air-pressure/PressureView.js';
import ReflectionView from './reflection/ReflectionView.js';
import IntroView from './intro/IntroView.js';
import TwoSourceView from './two-sources/TwoSourceView.js';
import SoundStrings from './SoundStrings.js';

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  const sim = new Sim( SoundStrings.sound.titleStringProperty, [
    new SoundScreen( SoundStrings.singleSource.titleStringProperty, () => new IntroModel(), model => new IntroView( model ), new Image( singleSourceIcon_png ) ),
    new SoundScreen( SoundStrings.measure.titleStringProperty, () => new MeasureModel(), model => new MeasureView( model ), new Image( measureIcon_png ) ),
    new SoundScreen( SoundStrings.twoSource.titleStringProperty, () => new TwoSourceModel(), model => new TwoSourceView( model ), new Image( twoSourceIcon_png ) ),
    new SoundScreen( SoundStrings.reflection.titleStringProperty, () => new ReflectionModel(), model => new ReflectionView( model ), new Image( reflectionIcon_png ) ),
    new SoundScreen( SoundStrings.airPressure.titleStringProperty, () => new PressureModel(), model => new PressureView( model ), new Image( pressureIcon_png ) )
  ], {

    //TODO fill in credits, all of these fields are optional, see joist.CreditsNode
    credits: {
      leadDesign: '',
      softwareDevelopment: 'Piet Goris, Sam Reid',
      team: '',
      qualityAssurance: '',
      graphicArts: '',
      soundDesign: '',
      thanks: ''
    }
  } );

  sim.start();
} );