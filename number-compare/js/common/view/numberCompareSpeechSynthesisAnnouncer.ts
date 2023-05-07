// Copyright 2022-2023, University of Colorado Boulder

/**
 * An Announcer for speech synthesis that can be used with an UtteranceQueue. Used in Number Compare, see
 * NumberSuiteCommonSpeechSynthesisAnnouncer for implementation.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import NumberSuiteCommonSpeechSynthesisAnnouncer from '../../../../number-suite-common/js/common/view/NumberSuiteCommonSpeechSynthesisAnnouncer.js';
import numberCompare from '../../numberCompare.js';
import numberComparePreferences from '../model/numberComparePreferences.js';

const numberCompareSpeechSynthesisAnnouncer = new NumberSuiteCommonSpeechSynthesisAnnouncer(
  numberComparePreferences.isPrimaryLocaleProperty,
  numberComparePreferences.secondLocaleProperty,
  numberComparePreferences.primaryVoiceProperty,
  numberComparePreferences.secondVoiceProperty
);

numberCompare.register( 'numberCompareSpeechSynthesisAnnouncer', numberCompareSpeechSynthesisAnnouncer );
export default numberCompareSpeechSynthesisAnnouncer;