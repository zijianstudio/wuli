// Copyright 2022-2023, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import numberCompare from './numberCompare.js';

type StringsType = {
  'number-compare': {
    'titleStringProperty': LinkableProperty<string>;
  };
  'screen': {
    'compareStringProperty': LinkableProperty<string>;
  };
  'isLessThanStringProperty': LinkableProperty<string>;
  'isGreaterThanStringProperty': LinkableProperty<string>;
  'isEqualToStringProperty': LinkableProperty<string>;
  'automaticallyHearNumberSentenceStringProperty': LinkableProperty<string>;
  'automaticallyHearNumberSentenceDescriptionStringProperty': LinkableProperty<string>;
};

const NumberCompareStrings = getStringModule( 'NUMBER_COMPARE' ) as StringsType;

numberCompare.register( 'NumberCompareStrings', NumberCompareStrings );

export default NumberCompareStrings;
