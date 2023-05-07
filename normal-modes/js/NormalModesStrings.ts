// Copyright 2021-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import normalModes from './normalModes.js';

type StringsType = {
  'normal-modes': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  };
  'screen': {
    'oneDimension': string;
    'oneDimensionStringProperty': LinkableProperty<string>;
    'twoDimensions': string;
    'twoDimensionsStringProperty': LinkableProperty<string>;
  };
  'initialPositions': string;
  'initialPositionsStringProperty': LinkableProperty<string>;
  'zeroPositions': string;
  'zeroPositionsStringProperty': LinkableProperty<string>;
  'numberOfMasses': string;
  'numberOfMassesStringProperty': LinkableProperty<string>;
  'showSprings': string;
  'showSpringsStringProperty': LinkableProperty<string>;
  'showPhases': string;
  'showPhasesStringProperty': LinkableProperty<string>;
  'normalMode': string;
  'normalModeStringProperty': LinkableProperty<string>;
  'amplitude': string;
  'amplitudeStringProperty': LinkableProperty<string>;
  'normalModeSpectrum': string;
  'normalModeSpectrumStringProperty': LinkableProperty<string>;
  'phase': string;
  'phaseStringProperty': LinkableProperty<string>;
  'frequency': string;
  'frequencyStringProperty': LinkableProperty<string>;
  'frequencyRatioOmegaPattern': string;
  'frequencyRatioOmegaPatternStringProperty': LinkableProperty<string>;
  'normalModeAmplitudes': string;
  'normalModeAmplitudesStringProperty': LinkableProperty<string>;
};

const NormalModesStrings = getStringModule( 'NORMAL_MODES' ) as StringsType;

normalModes.register( 'NormalModesStrings', NormalModesStrings );

export default NormalModesStrings;
