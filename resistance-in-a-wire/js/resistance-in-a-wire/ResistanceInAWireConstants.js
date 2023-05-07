// Copyright 2017-2022, University of Colorado Boulder

/**
 * Constants used in multiple locations within the 'Resistance in a Wire' simulation.
 *
 * @author Martin Veillette (Berea College)
 */

import Range from '../../../dot/js/Range.js';
import RangeWithValue from '../../../dot/js/RangeWithValue.js';
import Utils from '../../../dot/js/Utils.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import resistanceInAWire from '../resistanceInAWire.js';
import ResistanceInAWireStrings from '../ResistanceInAWireStrings.js';

const muchMuchSmallerThanString = ResistanceInAWireStrings.a11y.equation.sizes.muchMuchSmallerThan;
const muchSmallerThanString = ResistanceInAWireStrings.a11y.equation.sizes.muchSmallerThan;
const slightlySmallerThanString = ResistanceInAWireStrings.a11y.equation.sizes.slightlySmallerThan;
const comparableToString = ResistanceInAWireStrings.a11y.equation.sizes.comparableTo;
const slightlyLargerThanString = ResistanceInAWireStrings.a11y.equation.sizes.slightlyLargerThan;
const muchLargerThanString = ResistanceInAWireStrings.a11y.equation.sizes.muchLargerThan;
const muchMuchLargerThanString = ResistanceInAWireStrings.a11y.equation.sizes.muchMuchLargerThan;
const extremelyShortString = ResistanceInAWireStrings.a11y.wire.extremelyShort;
const veryShortString = ResistanceInAWireStrings.a11y.wire.veryShort;
const shortString = ResistanceInAWireStrings.a11y.wire.short;
const ofMediumLengthString = ResistanceInAWireStrings.a11y.wire.ofMediumLength;
const longString = ResistanceInAWireStrings.a11y.wire.long;
const veryLongString = ResistanceInAWireStrings.a11y.wire.veryLong;
const extremelyLongString = ResistanceInAWireStrings.a11y.wire.extremelyLong;
const extremelyThinString = ResistanceInAWireStrings.a11y.wire.extremelyThin;
const veryThinString = ResistanceInAWireStrings.a11y.wire.veryThin;
const thinString = ResistanceInAWireStrings.a11y.wire.thin;
const ofMediumThicknessString = ResistanceInAWireStrings.a11y.wire.ofMediumThickness;
const thickString = ResistanceInAWireStrings.a11y.wire.thick;
const veryThickString = ResistanceInAWireStrings.a11y.wire.veryThick;
const extremelyThickString = ResistanceInAWireStrings.a11y.wire.extremelyThick;
const aTinyAmountOfImpuritiesString = ResistanceInAWireStrings.a11y.wire.aTinyAmountOfImpurities;
const aVerySmallAmountOfImpuritiesString = ResistanceInAWireStrings.a11y.wire.aVerySmallAmountOfImpurities;
const aSmallAmountOfImpuritiesString = ResistanceInAWireStrings.a11y.wire.aSmallAmountOfImpurities;
const aMediumAmountOfImpuritiesString = ResistanceInAWireStrings.a11y.wire.aMediumAmountOfImpurities;
const aLargeAmountOfImpuritiesString = ResistanceInAWireStrings.a11y.wire.aLargeAmountOfImpurities;
const aVeryLargeAmountOfImpuritiesString = ResistanceInAWireStrings.a11y.wire.aVeryLargeAmountOfImpurities;
const aHugeAmountOfImpuritiesString = ResistanceInAWireStrings.a11y.wire.aHugeAmountOfImpurities;


// constants
const RESISTIVITY_RANGE = new RangeWithValue( 0.01, 1.00, 0.5 ); // in Ohm * cm
const LENGTH_RANGE = new RangeWithValue( 0.1, 20, 10 ); // in cm
const AREA_RANGE = new RangeWithValue( 0.01, 15, 7.5 ); // in cm^2

const LENGTH_DESCRIPTIONS = [ extremelyShortString, veryShortString, shortString, ofMediumLengthString, longString, veryLongString, extremelyLongString ];
const AREA_DESCRIPTIONS = [ extremelyThinString, veryThinString, thinString, ofMediumThicknessString, thickString, veryThickString, extremelyThickString ];
const RESISTIVITY_DESCRIPTIONS = [ aTinyAmountOfImpuritiesString, aVerySmallAmountOfImpuritiesString, aSmallAmountOfImpuritiesString, aMediumAmountOfImpuritiesString, aLargeAmountOfImpuritiesString, aVeryLargeAmountOfImpuritiesString, aHugeAmountOfImpuritiesString ];

const RELATIVE_SIZE_STRINGS = [ muchMuchSmallerThanString, muchSmallerThanString, slightlySmallerThanString, comparableToString, slightlyLargerThanString, muchLargerThanString, muchMuchLargerThanString ];

/**
 * Generate a map from physical value to accessible descripton. Each described range has a length of
 * valueRange / descriptionArray.length
 *
 * @param {[].string} descriptionArray
 * @param {RangeWithValue} valueRange
 *
 * @returns {[type]} [description]
 */
const generateDescriptionMap = ( descriptionArray, valueRange ) => {
  const map = {};

  let minValue = valueRange.min;
  for ( let i = 0; i < descriptionArray.length; i++ ) {

    const nextMin = minValue + valueRange.getLength() / descriptionArray.length;

    map[ i ] = {};
    map[ i ].description = descriptionArray[ i ];
    map[ i ].range = new Range( minValue, nextMin );

    // correct for any precision issues
    if ( i === descriptionArray.length - 1 ) {
      map[ descriptionArray.length - 1 ].range = new Range( minValue, valueRange.max );
    }

    minValue = nextMin;
  }

  return map;
};

const LENGTH_TO_DESCRIPTION_MAP = generateDescriptionMap( LENGTH_DESCRIPTIONS, LENGTH_RANGE );
const AREA_TO_DESCRIPTION_MAP = generateDescriptionMap( AREA_DESCRIPTIONS, AREA_RANGE );
const RESISTIVITY_TO_DESCRIPTION_MAP = generateDescriptionMap( RESISTIVITY_DESCRIPTIONS, RESISTIVITY_RANGE );

const ResistanceInAWireConstants = {

  // colors
  BLUE_COLOR: '#0f0ffb',
  BLACK_COLOR: '#000',
  RED_COLOR: '#F22',
  WHITE_COLOR: '#FFF',

  // formula
  FONT_FAMILY: 'Times New Roman',

  // range for sliders with default values
  RESISTIVITY_RANGE: RESISTIVITY_RANGE,
  LENGTH_RANGE: LENGTH_RANGE,
  AREA_RANGE: AREA_RANGE,

  // resistance range, based on formula R = ( resistivity * length ) / area
  RESISTANCE_RANGE: new Range(
    RESISTIVITY_RANGE.min * LENGTH_RANGE.min / AREA_RANGE.max,
    RESISTIVITY_RANGE.max * LENGTH_RANGE.max / AREA_RANGE.min
  ),

  // control panel
  SLIDER_WIDTH: 70,

  // slider unit
  THUMB_HEIGHT: 32,  // Empirically determined.
  SLIDER_HEIGHT: 230,
  SYMBOL_FONT: new PhetFont( { family: 'Times New Roman', size: 60 } ),
  NAME_FONT: new PhetFont( 16 ),
  READOUT_FONT: new PhetFont( 28 ),
  UNIT_FONT: new PhetFont( 28 ),

  // arrow node
  TAIL_LENGTH: 140,
  HEAD_HEIGHT: 45,
  HEAD_WIDTH: 30,
  TAIL_WIDTH: 10,

  // precision of values for view
  SLIDER_READOUT_DECIMALS: 2,
  getResistanceDecimals( resistance ) {
    return resistance >= 100 ? 0 : // Over 100, show no decimal points, like 102
           resistance >= 10 ? 1 : // between 10.0 and 99.9, show 2 decimal points
           resistance < 0.001 ? 4 : // when less than 0.001, show 4 decimals, see #125
           resistance < 1 ? 3 : // when less than 1, show 3 decimal places, see #125
           2; // Numbers less than 10 show 2 decimal points, like 8.35
  },

  // maps from physical value to description
  LENGTH_TO_DESCRIPTION_MAP: LENGTH_TO_DESCRIPTION_MAP,
  AREA_TO_DESCRIPTION_MAP: AREA_TO_DESCRIPTION_MAP,
  RESISTIVITY_TO_DESCRIPTION_MAP: RESISTIVITY_TO_DESCRIPTION_MAP,

  RELATIVE_SIZE_STRINGS: RELATIVE_SIZE_STRINGS,


  // pdom - used to map relative scale magnitudes of the letters to relative size description
  RELATIVE_SIZE_MAP: {
    muchMuchSmaller: {
      description: muchMuchSmallerThanString,
      range: new Range( 0, 0.1 )
    },
    muchSmaller: {
      description: muchSmallerThanString,
      range: new Range( 0.1, 0.4 )
    },
    slightlySmaller: {
      description: slightlySmallerThanString,
      range: new Range( 0.4, 0.7 )
    },
    comparable: {
      description: comparableToString,
      range: new Range( 0.7, 1.3 )
    },
    slightlyLarger: {
      description: slightlyLargerThanString,
      range: new Range( 1.3, 2 )
    },
    muchLarger: {
      description: muchLargerThanString,
      range: new Range( 2, 20 )
    },
    muchMuchLarger: {
      description: muchMuchLargerThanString,
      range: new Range( 20, Number.MAX_VALUE )
    }
  },

  /**
   * Get a description from a value map. The map must have keys with values that look like
   * {
   *   range: {Range},
   *   description: {string}
   * }
   *
   * We iterate over the map, and if the value falls in the range, the description string is returned.
   *
   * "comparable to" or
   * "much much larger than"
   *
   * @param {number} value
   * @returns {string}
   */
  getValueDescriptionFromMap( value, map ) {

    // get described ranges of each value
    const keys = Object.keys( map );
    for ( let i = 0; i < keys.length; i++ ) {
      const entry = map[ keys[ i ] ];

      if ( entry.range.contains( value, map ) ) {
        return entry.description;
      }
    }
    throw new Error( `no description for value: ${value}` );
  },

  /**
   * Get a formatted value for resistance - depending on size of resistance, number of decimals will change. Used
   * for visual readout as well as for readable values in a11y.
   *
   * @param {number} value
   * @returns {string}
   */
  getFormattedResistanceValue( value ) {
    return Utils.toFixed( value, this.getResistanceDecimals( value ) );
  }
};

resistanceInAWire.register( 'ResistanceInAWireConstants', ResistanceInAWireConstants );

export default ResistanceInAWireConstants;