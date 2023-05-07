// Copyright 2020-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import bumper from './bumper.js';

type StringsType = {
  'bumper': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  }
};

const BumperStrings = getStringModule( 'BUMPER' ) as StringsType;

bumper.register( 'BumperStrings', BumperStrings );

export default BumperStrings;
