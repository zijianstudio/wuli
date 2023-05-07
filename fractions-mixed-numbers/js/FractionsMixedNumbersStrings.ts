// Copyright 2020-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import fractionsMixedNumbers from './fractionsMixedNumbers.js';

type StringsType = {
  'fractions-mixed-numbers': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  };
  'screen': {
    'intro': string;
    'introStringProperty': LinkableProperty<string>;
    'game': string;
    'gameStringProperty': LinkableProperty<string>;
    'lab': string;
    'labStringProperty': LinkableProperty<string>;
  }
};

const FractionsMixedNumbersStrings = getStringModule( 'FRACTIONS_MIXED_NUMBERS' ) as StringsType;

fractionsMixedNumbers.register( 'FractionsMixedNumbersStrings', FractionsMixedNumbersStrings );

export default FractionsMixedNumbersStrings;
