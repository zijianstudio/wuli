// Copyright 2023, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import relativity from './relativity.js';

type StringsType = {
  'relativity': {
    'titleStringProperty': LinkableProperty<string>;
  };
  'screen': {
    'nameStringProperty': LinkableProperty<string>;
  }
};

const RelativityStrings = getStringModule( 'RELATIVITY' ) as StringsType;

relativity.register( 'RelativityStrings', RelativityStrings );

export default RelativityStrings;
