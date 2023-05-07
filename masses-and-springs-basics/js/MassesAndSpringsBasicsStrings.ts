// Copyright 2020-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import massesAndSpringsBasics from './massesAndSpringsBasics.js';

type StringsType = {
  'centerOfOscillation': string;
  'centerOfOscillationStringProperty': LinkableProperty<string>;
  'masses-and-springs-basics': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  };
  'screen': {
    'stretch': string;
    'stretchStringProperty': LinkableProperty<string>;
    'bounce': string;
    'bounceStringProperty': LinkableProperty<string>;
    'lab': string;
    'labStringProperty': LinkableProperty<string>;
  };
  'restingPosition': string;
  'restingPositionStringProperty': LinkableProperty<string>;
  'unstretchedLength': string;
  'unstretchedLengthStringProperty': LinkableProperty<string>;
};

const MassesAndSpringsBasicsStrings = getStringModule( 'MASSES_AND_SPRINGS_BASICS' ) as StringsType;

massesAndSpringsBasics.register( 'MassesAndSpringsBasicsStrings', MassesAndSpringsBasicsStrings );

export default MassesAndSpringsBasicsStrings;
