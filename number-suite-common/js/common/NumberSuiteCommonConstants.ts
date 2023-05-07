// Copyright 2019-2023, University of Colorado Boulder

/**
 * Constants used commonly for Number Suite sims.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import LinkableProperty from '../../../axon/js/LinkableProperty.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import numberSuiteCommon from '../numberSuiteCommon.js';
import NumberSuiteCommonStrings from '../NumberSuiteCommonStrings.js';
import { SecondLocaleStrings } from './model/NumberSuiteCommonPreferences.js';
import SceneryPhetConstants from '../../../scenery-phet/js/SceneryPhetConstants.js';
import CountingCommonConstants from '../../../counting-common/js/common/CountingCommonConstants.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';

// Maps a number to the stringProperty of the translated word that corresponds to the number.
const NUMBER_TO_STRING_PROPERTY_PRIMARY: Record<number, LinkableProperty<string>> = {
  0: NumberSuiteCommonStrings.zeroStringProperty,
  1: NumberSuiteCommonStrings.oneStringProperty,
  2: NumberSuiteCommonStrings.twoStringProperty,
  3: NumberSuiteCommonStrings.threeStringProperty,
  4: NumberSuiteCommonStrings.fourStringProperty,
  5: NumberSuiteCommonStrings.fiveStringProperty,
  6: NumberSuiteCommonStrings.sixStringProperty,
  7: NumberSuiteCommonStrings.sevenStringProperty,
  8: NumberSuiteCommonStrings.eightStringProperty,
  9: NumberSuiteCommonStrings.nineStringProperty,
  10: NumberSuiteCommonStrings.tenStringProperty,
  11: NumberSuiteCommonStrings.elevenStringProperty,
  12: NumberSuiteCommonStrings.twelveStringProperty,
  13: NumberSuiteCommonStrings.thirteenStringProperty,
  14: NumberSuiteCommonStrings.fourteenStringProperty,
  15: NumberSuiteCommonStrings.fifteenStringProperty,
  16: NumberSuiteCommonStrings.sixteenStringProperty,
  17: NumberSuiteCommonStrings.seventeenStringProperty,
  18: NumberSuiteCommonStrings.eighteenStringProperty,
  19: NumberSuiteCommonStrings.nineteenStringProperty,
  20: NumberSuiteCommonStrings.twentyStringProperty
};

// A list of the primary string Properties we use in the sim.
export const NUMBER_STRING_PROPERTIES: TReadOnlyProperty<string>[] = _.values( NUMBER_TO_STRING_PROPERTY_PRIMARY );

// Maps a number to the key used to look up the translated word that corresponds to the number.
const NUMBER_TO_STRING_KEY_SECONDARY: Record<number, string> = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
  13: 'thirteen',
  14: 'fourteen',
  15: 'fifteen',
  16: 'sixteen',
  17: 'seventeen',
  18: 'eighteen',
  19: 'nineteen',
  20: 'twenty'
} as Record<number, string>;

// RequireJS namespace, used for looking up translated strings
const NUMBER_SUITE_COMMON_REQUIREJS_NAMESPACE = 'NUMBER_SUITE_COMMON';

const GROUPED_STORED_COUNTING_OBJECT_SCALE = 0.7;

// Returns either the primaryString or the secondaryString based on isPrimaryLocale. If the secondaryString doesn't
// exist but is desired, return the primaryString instead as a fallback. We know the primaryString will always exist
// because if there is a missing string in that locale, the String library will fall back to the English string instead.
// This function should be used whenever the sim needs a secondaryLocale string so that it is guarded with a fallback.
const getString = ( primaryString: string, secondaryString: string | undefined, stringKey: string,
                    isPrimaryLocale: boolean ): string => {
  const string = ( !isPrimaryLocale && secondaryString ) ? secondaryString : primaryString;
  assert && assert( string, `no string found for stringKey=${stringKey}` );
  return string;
};

const NumberSuiteCommonConstants = {

  TEN: 10, // used for organizing things into group of ten per countingObject

  MAX_AMOUNT_OF_TEN_FRAMES: 10, // The maximum amount of ten frames allowed on lab screens
  PAPER_NUMBER_INITIAL_VALUE: 1, // the initial value of every created countingObject

  // accordion box sizing

  TOTAL_ACCORDION_BOX_WIDTH: 199,           // width of the 'Total' accordion box

  // sizing for the 'lower' accordion boxes, which include the 'Ones' and 'Objects' accordion boxes
  LOWER_ACCORDION_BOX_TITLE_MAX_WIDTH: 332, // max width of the title of all lower accordion boxes
  TALL_LOWER_ACCORDION_BOX_HEIGHT: 468,     // height of the 'lower' accordion boxes on the 'Twenty' and 'Compare' screens

  // layout
  SCREEN_VIEW_PADDING_X: 15,                // minimum x-distance any node is positioned from the edges of the sim
  SCREEN_VIEW_PADDING_Y: 15,                // minimum y-distance any node is positioned from the edges of the sim
  ACCORDION_BOX_MARGIN_X: 72,               // distance between the sides of the sim and all adjacent accordion boxes

  // options for all AccordionBox instances
  ACCORDION_BOX_TITLE_FONT: new PhetFont( 16 ),

  /**
   * Maps an integer to the translated word for that integer.
   */
  numberToWord: ( numberPlaySecondaryStrings: SecondLocaleStrings, number: number, isPrimaryLocale: boolean ): string => {

    // The word for number in the primary language
    const primaryString = NUMBER_TO_STRING_PROPERTY_PRIMARY[ number ].value;

    // The word for number in the secondary language
    const stringKey = `${NUMBER_SUITE_COMMON_REQUIREJS_NAMESPACE}/${NUMBER_TO_STRING_KEY_SECONDARY[ number ]}`;
    const secondaryString = numberPlaySecondaryStrings[ stringKey ];

    // Fallback to primaryString if there is no secondary translation.
    return getString( primaryString, secondaryString, stringKey, isPrimaryLocale );
  },

  getString: getString,

  NUMBER_SUITE_COMMON_REQUIREJS_NAMESPACE: NUMBER_SUITE_COMMON_REQUIREJS_NAMESPACE,

  UNGROUPED_STORED_COUNTING_OBJECT_SCALE: 0.9,
  GROUPED_STORED_COUNTING_OBJECT_SCALE: GROUPED_STORED_COUNTING_OBJECT_SCALE,
  COUNTING_OBJECT_SCALE: 1,

  // match the size of the ResetAllButton, in screen coords
  BUTTON_LENGTH: SceneryPhetConstants.DEFAULT_BUTTON_RADIUS * 2,

  CREATOR_ICON_HEIGHT: CountingCommonConstants.SINGLE_COUNTING_OBJECT_BOUNDS.height * GROUPED_STORED_COUNTING_OBJECT_SCALE + 5,

  // Preferences dialog controls
  PREFERENCES_FONT_SIZE: 16,
  PREFERENCES_VBOX_SPACING: 15,
  PREFERENCES_DESCRIPTION_Y_SPACING: 5
};

numberSuiteCommon.register( 'NumberSuiteCommonConstants', NumberSuiteCommonConstants );
export default NumberSuiteCommonConstants;