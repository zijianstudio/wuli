// Copyright 2021-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import phScale from './phScale.js';

type StringsType = {
  'ph-scale': {
    'titleStringProperty': LinkableProperty<string>;
  };
  'screen': {
    'macroStringProperty': LinkableProperty<string>;
    'microStringProperty': LinkableProperty<string>;
    'mySolutionStringProperty': LinkableProperty<string>;
  };
  'choice': {
    'milkStringProperty': LinkableProperty<string>;
    'chickenSoupStringProperty': LinkableProperty<string>;
    'batteryAcidStringProperty': LinkableProperty<string>;
    'vomitStringProperty': LinkableProperty<string>;
    'sodaStringProperty': LinkableProperty<string>;
    'orangeJuiceStringProperty': LinkableProperty<string>;
    'coffeeStringProperty': LinkableProperty<string>;
    'spitStringProperty': LinkableProperty<string>;
    'bloodStringProperty': LinkableProperty<string>;
    'handSoapStringProperty': LinkableProperty<string>;
    'waterStringProperty': LinkableProperty<string>;
    'drainCleanerStringProperty': LinkableProperty<string>;
  };
  'units': {
    'litersStringProperty': LinkableProperty<string>;
    'molesStringProperty': LinkableProperty<string>;
    'molesPerLiterStringProperty': LinkableProperty<string>;
  };
  'pattern': {
    '0value': {
      '1unitsStringProperty': LinkableProperty<string>;
    }
  };
  'pHStringProperty': LinkableProperty<string>;
  'acidicStringProperty': LinkableProperty<string>;
  'basicStringProperty': LinkableProperty<string>;
  'neutralStringProperty': LinkableProperty<string>;
  'concentrationStringProperty': LinkableProperty<string>;
  'quantityStringProperty': LinkableProperty<string>;
  'particleCountsStringProperty': LinkableProperty<string>;
  'ratioStringProperty': LinkableProperty<string>;
  'linearStringProperty': LinkableProperty<string>;
  'logarithmicStringProperty': LinkableProperty<string>;
  'offScaleStringProperty': LinkableProperty<string>;
  'keyboardHelpDialog': {
    'chooseASoluteStringProperty': LinkableProperty<string>;
    'soluteStringProperty': LinkableProperty<string>;
    'solutesStringProperty': LinkableProperty<string>;
    'moveThePHProbeStringProperty': LinkableProperty<string>;
    'moveTheGraphIndicatorsStringProperty': LinkableProperty<string>;
    'moveStringProperty': LinkableProperty<string>;
    'moveSlowerStringProperty': LinkableProperty<string>;
  }
};

const PhScaleStrings = getStringModule( 'PH_SCALE' ) as StringsType;

phScale.register( 'PhScaleStrings', PhScaleStrings );

export default PhScaleStrings;
