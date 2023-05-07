// Copyright 2020-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import estimation from './estimation.js';

type StringsType = {
  'estimation': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  };
  'explore': string;
  'exploreStringProperty': LinkableProperty<string>;
  'game': string;
  'gameStringProperty': LinkableProperty<string>;
  'newObject': string;
  'newObjectStringProperty': LinkableProperty<string>;
};

const EstimationStrings = getStringModule( 'ESTIMATION' ) as StringsType;

estimation.register( 'EstimationStrings', EstimationStrings );

export default EstimationStrings;
