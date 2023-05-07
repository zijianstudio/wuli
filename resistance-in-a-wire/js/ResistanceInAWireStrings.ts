// Copyright 2021-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import resistanceInAWire from './resistanceInAWire.js';

type StringsType = {
  'resistance-in-a-wire': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  };
  'area': string;
  'areaStringProperty': LinkableProperty<string>;
  'areaSymbol': string;
  'areaSymbolStringProperty': LinkableProperty<string>;
  'cm': string;
  'cmStringProperty': LinkableProperty<string>;
  'length': string;
  'lengthStringProperty': LinkableProperty<string>;
  'lengthSymbol': string;
  'lengthSymbolStringProperty': LinkableProperty<string>;
  'ohm': string;
  'ohmStringProperty': LinkableProperty<string>;
  'pattern': {
    '0label': {
      '1value': {
        '2units': string;
        '2unitsStringProperty': LinkableProperty<string>;
      }
    };
    '0resistanceUnits': {
      '1lengthUnits': string;
      '1lengthUnitsStringProperty': LinkableProperty<string>;
    }
  };
  'resistance': string;
  'resistanceStringProperty': LinkableProperty<string>;
  'resistanceSymbol': string;
  'resistanceSymbolStringProperty': LinkableProperty<string>;
  'resistivity': string;
  'resistivityStringProperty': LinkableProperty<string>;
  'a11y': {
    'summary': {
      'sim': string;
      'simStringProperty': LinkableProperty<string>;
      'currently': string;
      'currentlyStringProperty': LinkableProperty<string>;
      'resistancePattern': string;
      'resistancePatternStringProperty': LinkableProperty<string>;
      'resistivityPattern': string;
      'resistivityPatternStringProperty': LinkableProperty<string>;
      'lengthPattern': string;
      'lengthPatternStringProperty': LinkableProperty<string>;
      'areaPattern': string;
      'areaPatternStringProperty': LinkableProperty<string>;
      'interactionHint': string;
      'interactionHintStringProperty': LinkableProperty<string>;
    };
    'equation': {
      'resistanceEquation': string;
      'resistanceEquationStringProperty': LinkableProperty<string>;
      'resistanceEquationDescription': string;
      'resistanceEquationDescriptionStringProperty': LinkableProperty<string>;
      'rhoLAndAComparablePattern': string;
      'rhoLAndAComparablePatternStringProperty': LinkableProperty<string>;
      'lAndAComparablePattern': string;
      'lAndAComparablePatternStringProperty': LinkableProperty<string>;
      'noneComparablePattern': string;
      'noneComparablePatternStringProperty': LinkableProperty<string>;
      'sizes': {
        'muchMuchSmallerThan': string;
        'muchMuchSmallerThanStringProperty': LinkableProperty<string>;
        'muchSmallerThan': string;
        'muchSmallerThanStringProperty': LinkableProperty<string>;
        'slightlySmallerThan': string;
        'slightlySmallerThanStringProperty': LinkableProperty<string>;
        'comparableTo': string;
        'comparableToStringProperty': LinkableProperty<string>;
        'slightlyLargerThan': string;
        'slightlyLargerThanStringProperty': LinkableProperty<string>;
        'muchLargerThan': string;
        'muchLargerThanStringProperty': LinkableProperty<string>;
        'muchMuchLargerThan': string;
        'muchMuchLargerThanStringProperty': LinkableProperty<string>;
      };
      'alerts': {
        'grows': string;
        'growsStringProperty': LinkableProperty<string>;
        'shrinks': string;
        'shrinksStringProperty': LinkableProperty<string>;
        'growsALot': string;
        'growsALotStringProperty': LinkableProperty<string>;
        'shrinksALot': string;
        'shrinksALotStringProperty': LinkableProperty<string>;
      }
    };
    'wire': {
      'wireDescriptionPattern': string;
      'wireDescriptionPatternStringProperty': LinkableProperty<string>;
      'resistivityUnitsPattern': string;
      'resistivityUnitsPatternStringProperty': LinkableProperty<string>;
      'extremelyShort': string;
      'extremelyShortStringProperty': LinkableProperty<string>;
      'veryShort': string;
      'veryShortStringProperty': LinkableProperty<string>;
      'short': string;
      'shortStringProperty': LinkableProperty<string>;
      'ofMediumLength': string;
      'ofMediumLengthStringProperty': LinkableProperty<string>;
      'long': string;
      'longStringProperty': LinkableProperty<string>;
      'veryLong': string;
      'veryLongStringProperty': LinkableProperty<string>;
      'extremelyLong': string;
      'extremelyLongStringProperty': LinkableProperty<string>;
      'extremelyThin': string;
      'extremelyThinStringProperty': LinkableProperty<string>;
      'veryThin': string;
      'veryThinStringProperty': LinkableProperty<string>;
      'thin': string;
      'thinStringProperty': LinkableProperty<string>;
      'ofMediumThickness': string;
      'ofMediumThicknessStringProperty': LinkableProperty<string>;
      'thick': string;
      'thickStringProperty': LinkableProperty<string>;
      'veryThick': string;
      'veryThickStringProperty': LinkableProperty<string>;
      'extremelyThick': string;
      'extremelyThickStringProperty': LinkableProperty<string>;
      'aTinyAmountOfImpurities': string;
      'aTinyAmountOfImpuritiesStringProperty': LinkableProperty<string>;
      'aVerySmallAmountOfImpurities': string;
      'aVerySmallAmountOfImpuritiesStringProperty': LinkableProperty<string>;
      'aSmallAmountOfImpurities': string;
      'aSmallAmountOfImpuritiesStringProperty': LinkableProperty<string>;
      'aMediumAmountOfImpurities': string;
      'aMediumAmountOfImpuritiesStringProperty': LinkableProperty<string>;
      'aLargeAmountOfImpurities': string;
      'aLargeAmountOfImpuritiesStringProperty': LinkableProperty<string>;
      'aVeryLargeAmountOfImpurities': string;
      'aVeryLargeAmountOfImpuritiesStringProperty': LinkableProperty<string>;
      'aHugeAmountOfImpurities': string;
      'aHugeAmountOfImpuritiesStringProperty': LinkableProperty<string>;
    };
    'controls': {
      'lengthUnitsPattern': string;
      'lengthUnitsPatternStringProperty': LinkableProperty<string>;
      'areaUnitsPattern': string;
      'areaUnitsPatternStringProperty': LinkableProperty<string>;
      'resistivitySliderLabel': string;
      'resistivitySliderLabelStringProperty': LinkableProperty<string>;
      'lengthSliderLabel': string;
      'lengthSliderLabelStringProperty': LinkableProperty<string>;
      'areaSliderLabel': string;
      'areaSliderLabelStringProperty': LinkableProperty<string>;
      'sliderControls': string;
      'sliderControlsStringProperty': LinkableProperty<string>;
      'slidersDescription': string;
      'slidersDescriptionStringProperty': LinkableProperty<string>;
      'sizeChangeAlertPattern': string;
      'sizeChangeAlertPatternStringProperty': LinkableProperty<string>;
      'letterRho': string;
      'letterRhoStringProperty': LinkableProperty<string>;
      'letterL': string;
      'letterLStringProperty': LinkableProperty<string>;
      'letterA': string;
      'letterAStringProperty': LinkableProperty<string>;
    }
  }
};

const ResistanceInAWireStrings = getStringModule( 'RESISTANCE_IN_A_WIRE' ) as StringsType;

resistanceInAWire.register( 'ResistanceInAWireStrings', ResistanceInAWireStrings );

export default ResistanceInAWireStrings;
