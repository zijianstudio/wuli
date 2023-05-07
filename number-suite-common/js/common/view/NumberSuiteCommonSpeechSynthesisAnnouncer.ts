// Copyright 2022-2023, University of Colorado Boulder

/**
 * An Announcer for speech synthesis that can be used with an UtteranceQueue. Used in Number Suite sims on screens that
 * support speech synthesis.
 *
 * Not usable until initialized after the sim is created. See number-play-main.ts and number-compare-main.ts.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import SpeechSynthesisAnnouncer from '../../../../utterance-queue/js/SpeechSynthesisAnnouncer.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import localeProperty, { Locale } from '../../../../joist/js/i18n/localeProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TProperty from '../../../../axon/js/TProperty.js';

class NumberSuiteCommonSpeechSynthesisAnnouncer extends SpeechSynthesisAnnouncer {

  // See doc in NumberSuiteCommonPreferences
  private readonly secondLocaleProperty: TReadOnlyProperty<Locale>;

  // Whether the current voice (of primaryVoiceProperty or secondVoiceProperty) has a valid voice.
  public readonly hasVoiceProperty: TReadOnlyProperty<boolean>;

  public constructor(
    isPrimaryLocaleProperty: TReadOnlyProperty<boolean>,
    secondLocaleProperty: TReadOnlyProperty<Locale>,
    primaryVoiceProperty: TProperty<SpeechSynthesisVoice | null>,
    secondVoiceProperty: TProperty<SpeechSynthesisVoice | null>
  ) {
    super();

    this.secondLocaleProperty = secondLocaleProperty;

    // Update when the primaryVoice, secondVoice, or isPrimaryLocale changes.
    this.hasVoiceProperty = new DerivedProperty(
      [ isPrimaryLocaleProperty, primaryVoiceProperty, secondVoiceProperty ],
      ( isPrimaryLocale, primaryVoice, secondVoice ) => isPrimaryLocale ? !!primaryVoice : !!secondVoice );

    // When the SpeechSynthesisAnnouncer becomes initialized or when the available voices change, set the provided
    // voice Properties to the first available voice for their respective locales.
    Multilink.multilink(
      [ this.isInitializedProperty, this.voicesProperty ], () => {
        this.setFirstAvailableVoiceForLocale( localeProperty.value, primaryVoiceProperty );
        this.setFirstAvailableVoiceForLocale( secondLocaleProperty.value, secondVoiceProperty );
      } );
  }

  /**
   * Set the provided voiceProperty to the first available voice for the provided locale.
   */
  public setFirstAvailableVoiceForLocale( locale: Locale, voiceProperty: TProperty<SpeechSynthesisVoice | null> ): void {

    // in case we don't have any voices yet, wait until the voicesProperty is populated
    if ( this.initialized && this.voicesProperty.value.length > 0 ) {
      const translatedVoices = this.getPrioritizedVoicesForLocale( locale );
      if ( translatedVoices.length > 0 ) {
        voiceProperty.value = translatedVoices[ 0 ];
      }
      else {
        voiceProperty.value = null;
      }
    }
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonSpeechSynthesisAnnouncer', NumberSuiteCommonSpeechSynthesisAnnouncer );
export default NumberSuiteCommonSpeechSynthesisAnnouncer;
