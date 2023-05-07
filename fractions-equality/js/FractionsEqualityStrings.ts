// Copyright 2020-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import fractionsEquality from './fractionsEquality.js';

type StringsType = {
  'fractions-equality': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  };
  'screen': {
    'equalityLab': string;
    'equalityLabStringProperty': LinkableProperty<string>;
    'game': string;
    'gameStringProperty': LinkableProperty<string>;
  }
};

const FractionsEqualityStrings = getStringModule( 'FRACTIONS_EQUALITY' ) as StringsType;

fractionsEquality.register( 'FractionsEqualityStrings', FractionsEqualityStrings );

export default FractionsEqualityStrings;
