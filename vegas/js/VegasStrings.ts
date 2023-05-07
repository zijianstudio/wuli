// Copyright 2021-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import vegas from './vegas.js';

type StringsType = {
  'vegas': {
    'titleStringProperty': LinkableProperty<string>;
  };
  'pattern': {
    '0challenge': {
      '1maxStringProperty': LinkableProperty<string>;
    };
    '0hours': {
      '1minutes': {
        '2secondsStringProperty': LinkableProperty<string>;
      }
    };
    '0minutes': {
      '1secondsStringProperty': LinkableProperty<string>;
    };
    '0yourBestStringProperty': LinkableProperty<string>;
    'score': {
      'numberStringProperty': LinkableProperty<string>;
    }
  };
  'keepTryingStringProperty': LinkableProperty<string>;
  'goodStringProperty': LinkableProperty<string>;
  'greatStringProperty': LinkableProperty<string>;
  'excellentStringProperty': LinkableProperty<string>;
  'yourNewBestStringProperty': LinkableProperty<string>;
  'continueStringProperty': LinkableProperty<string>;
  'label': {
    'levelStringProperty': LinkableProperty<string>;
    'scorePatternStringProperty': LinkableProperty<string>;
    'timeStringProperty': LinkableProperty<string>;
    'score': {
      'maxStringProperty': LinkableProperty<string>;
    }
  };
  'checkStringProperty': LinkableProperty<string>;
  'nextStringProperty': LinkableProperty<string>;
  'button': {
    'newGameStringProperty': LinkableProperty<string>;
  };
  'showAnswerStringProperty': LinkableProperty<string>;
  'tryAgainStringProperty': LinkableProperty<string>;
  'selectLevelStringProperty': LinkableProperty<string>;
  'startOverStringProperty': LinkableProperty<string>;
  'keepGoingStringProperty': LinkableProperty<string>;
  'newLevelStringProperty': LinkableProperty<string>;
  'scoreStringProperty': LinkableProperty<string>;
  'doneStringProperty': LinkableProperty<string>;
  'youCompletedAllLevelsStringProperty': LinkableProperty<string>;
  'chooseYourLevelStringProperty': LinkableProperty<string>;
};

const VegasStrings = getStringModule( 'VEGAS' ) as StringsType;

vegas.register( 'VegasStrings', VegasStrings );

export default VegasStrings;
