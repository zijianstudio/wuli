// Copyright 2021-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import countingCommon from './countingCommon.js';

type StringsType = {
  'counting-common': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  }
};

const CountingCommonStrings = getStringModule( 'COUNTING_COMMON' ) as StringsType;

countingCommon.register( 'CountingCommonStrings', CountingCommonStrings );

export default CountingCommonStrings;
