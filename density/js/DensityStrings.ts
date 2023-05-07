// Copyright 2020-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import density from './density.js';

type StringsType = {
  'density': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  };
  'screen': {
    'intro': string;
    'introStringProperty': LinkableProperty<string>;
    'compare': string;
    'compareStringProperty': LinkableProperty<string>;
    'mystery': string;
    'mysteryStringProperty': LinkableProperty<string>;
  }
};

const DensityStrings = getStringModule( 'DENSITY' ) as StringsType;

density.register( 'DensityStrings', DensityStrings );

export default DensityStrings;
