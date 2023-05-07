// Copyright 2023, University of Colorado Boulder

/**
 * A subclass of UtteranceQueue that is used for voicing specific to Number Suite sims. This is needed because
 * Number Sims don't have the Voicing feature, but they still need to use speech synthesis.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { Locale } from '../../../../joist/js/i18n/localeProperty.js';
import UtteranceQueue from '../../../../utterance-queue/js/UtteranceQueue.js';
import NumberSuiteCommonSpeechSynthesisAnnouncer from './NumberSuiteCommonSpeechSynthesisAnnouncer.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';

// constants
const ONE_TWO_THREE_STRING_KEY = `${NumberSuiteCommonConstants.NUMBER_SUITE_COMMON_REQUIREJS_NAMESPACE}/oneTwoThree`;

// This reference exists to ensure that the string from the string key above does not get stripped out of the sim
// during a build. Since we need to be able to get the string in ANY language requested (instead of the language that
// the sim is running in), we can't use this string Property like normal.
NumberSuiteCommonStrings.oneTwoThreeStringProperty;

export default abstract class NumberSuiteCommonUtteranceQueue extends UtteranceQueue<NumberSuiteCommonSpeechSynthesisAnnouncer> {

  // Data that can be spoken to the user. The data comes from the screen that is currently being interacted with.
  private speechDataProperty!: TReadOnlyProperty<string | null>;

  // Whether this class has been initialized.
  private initialized = false;

  // The Utterance used for speaking speechData.
  private readonly speechDataUtterance = new Utterance();

  // The Utterance used for speaking when the user is testing a voice in Preferences.
  private readonly testVoiceUtterance = new Utterance();

  // See doc in NumberSuiteCommonPreferences.
  private readonly isPrimaryLocaleProperty: TReadOnlyProperty<boolean>;
  private readonly primaryLocaleProperty: TReadOnlyProperty<SpeechSynthesisVoice | null>;
  private readonly secondLocaleProperty: TReadOnlyProperty<SpeechSynthesisVoice | null>;
  private readonly autoHearEnabledProperty: TReadOnlyProperty<boolean>;

  protected constructor( numberSuiteCommonAnnouncer: NumberSuiteCommonSpeechSynthesisAnnouncer,
                         isPrimaryLocaleProperty: TReadOnlyProperty<boolean>,
                         primaryLocaleProperty: TReadOnlyProperty<SpeechSynthesisVoice | null>,
                         secondLocaleProperty: TReadOnlyProperty<SpeechSynthesisVoice | null>,
                         autoHearEnabledProperty: TReadOnlyProperty<boolean>
  ) {
    super( numberSuiteCommonAnnouncer );

    this.isPrimaryLocaleProperty = isPrimaryLocaleProperty;
    this.primaryLocaleProperty = primaryLocaleProperty;
    this.secondLocaleProperty = secondLocaleProperty;
    this.autoHearEnabledProperty = autoHearEnabledProperty;
  }

  /**
   * Speaks the value of this.speechDataProperty.
   */
  public speakSpeechData(): void {
    assert && assert( this.initialized && this.speechDataProperty, 'Cannot speak before initialization' );
    const speechData = this.speechDataProperty.value;

    // determine which voice to use based on isPrimaryLocaleProperty
    const voice = this.isPrimaryLocaleProperty.value ? this.primaryLocaleProperty.value : this.secondLocaleProperty.value;

    speechData && voice && this.speak( speechData, this.speechDataUtterance, voice );
  }

  /**
   * Cancels any ongoing speaking of speechData.
   */
  public cancelSpeechDataSpeaking(): void {
    this.cancelUtterance( this.speechDataUtterance );
  }

  /**
   * Speaks a 'test' string in the provided voice and locale.
   */
  public speakTestVoice( voiceToTest: SpeechSynthesisVoice | null, locale: Locale ): void {
    voiceToTest && this.speak( this.getTestStringForLocale( locale ), this.testVoiceUtterance, voiceToTest );
  }

  /**
   * Speaks the provided string.
   */
  private speak( string: string, utterance: Utterance, voice: SpeechSynthesisVoice ): void {
    assert && assert( voice, 'No voice set for voiceProperty: ', voice );

    // Set the provided voice before speaking.
    utterance.announcerOptions.voice = voice;

    utterance.alert = string;
    this.addToBack( utterance );
  }

  /**
   * Returns a test string in the provided locale. If the string isn't found in the desired locale, the english version
   * of the string is returned instead.
   */
  private getTestStringForLocale( locale: Locale ): string {
    const strings = phet.chipper.strings;
    const translatedStrings = strings[ locale ];
    const backupStrings = strings.en;

    const testString = translatedStrings && translatedStrings[ ONE_TWO_THREE_STRING_KEY ] ?
                       translatedStrings[ ONE_TWO_THREE_STRING_KEY ] : backupStrings[ ONE_TWO_THREE_STRING_KEY ];

    assert && assert( testString, `No test string found for locales ${locale} or en.` );

    return testString;
  }

  /**
   * Initializes this UtteranceQueue by providing speechDataProperty to use for speaking.
   */
  protected initializeNumberSuiteCommonUtteranceQueue( speechDataProperty: TReadOnlyProperty<string | null> ): void {
    assert && assert( !this.initialized, 'Tried to initialize NumberSuiteCommonUtteranceQueue more than once.' );

    this.speechDataProperty = speechDataProperty;

    // Speak the speechData if autoHear is turned on or the speechData changes. Also check that the announcer has a
    // voice because even if the voiceProperty is set to null, the browser still speaks with a default voice.
    Multilink.lazyMultilink( [
        this.autoHearEnabledProperty, this.speechDataProperty
      ], autoHearEnabled => autoHearEnabled && this.speakSpeechData()
    );

    this.initialized = true;
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonUtteranceQueue', NumberSuiteCommonUtteranceQueue );
