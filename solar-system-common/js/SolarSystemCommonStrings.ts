// Copyright 2023, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import solarSystemCommon from './solarSystemCommon.js';

type StringsType = {
  'gravityForce': string;
  'gravityForceStringProperty': LinkableProperty<string>;
  'grid': string;
  'gridStringProperty': LinkableProperty<string>;
  'measuringTape': string;
  'measuringTapeStringProperty': LinkableProperty<string>;
  'velocity': string;
  'velocityStringProperty': LinkableProperty<string>;
  'V': string;
  'VStringProperty': LinkableProperty<string>;
  'clear': string;
  'clearStringProperty': LinkableProperty<string>;
  'path': string;
  'pathStringProperty': LinkableProperty<string>;
  'zoom': string;
  'zoomStringProperty': LinkableProperty<string>;
  'offscaleMessage': string;
  'offscaleMessageStringProperty': LinkableProperty<string>;
  'speed': string;
  'speedStringProperty': LinkableProperty<string>;
  'units': {
    'AU': string;
    'AUStringProperty': LinkableProperty<string>;
    'years': string;
    'yearsStringProperty': LinkableProperty<string>;
    'kms': string;
    'kmsStringProperty': LinkableProperty<string>;
  };
  'pattern': {
    'labelUnits': string;
    'labelUnitsStringProperty': LinkableProperty<string>;
    'velocityValueUnits': string;
    'velocityValueUnitsStringProperty': LinkableProperty<string>;
    'unitsPower': string;
    'unitsPowerStringProperty': LinkableProperty<string>;
  };
  'a11y': {
    'restart': string;
    'restartStringProperty': LinkableProperty<string>;
    'massSlider': string;
    'massSliderStringProperty': LinkableProperty<string>;
    'scaleSlider': string;
    'scaleSliderStringProperty': LinkableProperty<string>;
    'increase': string;
    'increaseStringProperty': LinkableProperty<string>;
    'decrease': string;
    'decreaseStringProperty': LinkableProperty<string>;
  }
};

const SolarSystemCommonStrings = getStringModule( 'SOLAR_SYSTEM_COMMON' ) as StringsType;

solarSystemCommon.register( 'SolarSystemCommonStrings', SolarSystemCommonStrings );

export default SolarSystemCommonStrings;
