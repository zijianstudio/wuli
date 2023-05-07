// Copyright 2021-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import chains from './chains.js';

type StringsType = {
  'chains': {
    'titleStringProperty': LinkableProperty<string>;
  };
  'plainStringStringProperty': LinkableProperty<string>;
  'multilineStringStringProperty': LinkableProperty<string>;
  'htmlStringStringProperty': LinkableProperty<string>;
  'patternStringStringProperty': LinkableProperty<string>;
  'namedPlaceholdersStringStringProperty': LinkableProperty<string>;
  'sizeStringProperty': LinkableProperty<string>;
};

const ChainsStrings = getStringModule( 'CHAINS' ) as StringsType;

chains.register( 'ChainsStrings', ChainsStrings );

export default ChainsStrings;
