// Copyright 2020-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import fractionsIntro from './fractionsIntro.js';

type StringsType = {
  'fractions-intro': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  };
  'screen': {
    'intro': string;
    'introStringProperty': LinkableProperty<string>;
    'game': string;
    'gameStringProperty': LinkableProperty<string>;
    'lab': string;
    'labStringProperty': LinkableProperty<string>;
  }
};

const FractionsIntroStrings = getStringModule( 'FRACTIONS_INTRO' ) as StringsType;

fractionsIntro.register( 'FractionsIntroStrings', FractionsIntroStrings );

export default FractionsIntroStrings;
