// Copyright 2020-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import fractionMatcher from './fractionMatcher.js';

type StringsType = {
  'fraction-matcher': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  };
  'fractionsTitle': string;
  'fractionsTitleStringProperty': LinkableProperty<string>;
  'mixedNumbersTitle': string;
  'mixedNumbersTitleStringProperty': LinkableProperty<string>;
};

const FractionMatcherStrings = getStringModule( 'FRACTION_MATCHER' ) as StringsType;

fractionMatcher.register( 'FractionMatcherStrings', FractionMatcherStrings );

export default FractionMatcherStrings;
