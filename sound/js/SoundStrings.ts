// Copyright 2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import sound from './sound.js';

type StringsType = {
  'sound': {
    'titleStringProperty': LinkableProperty<string>;
  };
  'singleSource': {
    'titleStringProperty': LinkableProperty<string>;
    'help': {
      'listenerStringProperty': LinkableProperty<string>;
    }
  };
  'measure': {
    'titleStringProperty': LinkableProperty<string>;
    'clearWavesStringProperty': LinkableProperty<string>;
    'help': {
      'stickStringProperty': LinkableProperty<string>;
      'blueLinesStringProperty': LinkableProperty<string>;
    }
  };
  'twoSource': {
    'titleStringProperty': LinkableProperty<string>;
    'help': {
      'upperSpeakerStringProperty': LinkableProperty<string>;
      'listenerStringProperty': LinkableProperty<string>;
    }
  };
  'reflection': {
    'titleStringProperty': LinkableProperty<string>;
  };
  'atmStringProperty': LinkableProperty<string>;
  'hzStringProperty': LinkableProperty<string>;
  'airPressure': {
    'titleStringProperty': LinkableProperty<string>;
  };
  'audioControlPanel': {
    'titleStringProperty': LinkableProperty<string>;
    'audioEnabledStringProperty': LinkableProperty<string>;
    'speakerStringProperty': LinkableProperty<string>;
    'listenerStringProperty': LinkableProperty<string>;
  };
  'soundModeControlPanel': {
    'titleStringProperty': LinkableProperty<string>;
    'continuousStringProperty': LinkableProperty<string>;
    'pulseStringProperty': LinkableProperty<string>;
    'firePulseStringProperty': LinkableProperty<string>;
  };
  'reflectionControlPanel': {
    'positionSliderStringProperty': LinkableProperty<string>;
    'rotationSliderStringProperty': LinkableProperty<string>;
  };
  'airDensityControlPanel': {
    'titleStringProperty': LinkableProperty<string>;
    'removeAirStringProperty': LinkableProperty<string>;
    'addAirStringProperty': LinkableProperty<string>;
    'resetStringProperty': LinkableProperty<string>;
  };
  'amplitudeStringProperty': LinkableProperty<string>;
  'frequencyStringProperty': LinkableProperty<string>;
};

const SoundStrings = getStringModule( 'SOUND' ) as StringsType;

sound.register( 'SoundStrings', SoundStrings );

export default SoundStrings;
