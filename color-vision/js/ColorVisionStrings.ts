// Copyright 2021-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import colorVision from './colorVision.js';

type StringsType = {
  'filterSlider': {
    'label': string;
    'labelStringProperty': LinkableProperty<string>;
  };
  'RgbBulbsModule': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  };
  'color-vision': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  };
  'bulbSlider': {
    'label': string;
    'labelStringProperty': LinkableProperty<string>;
  };
  'SingleBulbModule': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  }
};

const ColorVisionStrings = getStringModule( 'COLOR_VISION' ) as StringsType;

colorVision.register( 'ColorVisionStrings', ColorVisionStrings );

export default ColorVisionStrings;
