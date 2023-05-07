// Copyright 2020-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import wavesIntro from './wavesIntro.js';

type StringsType = {
  'waves-intro': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  };
  'water': string;
  'waterStringProperty': LinkableProperty<string>;
  'sound': string;
  'soundStringProperty': LinkableProperty<string>;
  'light': string;
  'lightStringProperty': LinkableProperty<string>;
};

const WavesIntroStrings = getStringModule( 'WAVES_INTRO' ) as StringsType;

wavesIntro.register( 'WavesIntroStrings', WavesIntroStrings );

export default WavesIntroStrings;
