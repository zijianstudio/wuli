// Copyright 2020-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import buildAFraction from './buildAFraction.js';

type StringsType = {
  'build-a-fraction': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  };
  'screen': {
    'buildAFraction': string;
    'buildAFractionStringProperty': LinkableProperty<string>;
    'mixedNumbers': string;
    'mixedNumbersStringProperty': LinkableProperty<string>;
    'lab': string;
    'labStringProperty': LinkableProperty<string>;
  }
};

const BuildAFractionStrings = getStringModule( 'BUILD_A_FRACTION' ) as StringsType;

buildAFraction.register( 'BuildAFractionStrings', BuildAFractionStrings );

export default BuildAFractionStrings;
