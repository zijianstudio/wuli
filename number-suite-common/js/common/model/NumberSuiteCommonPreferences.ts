// Copyright 2022-2023, University of Colorado Boulder

/**
 * NumberSuiteCommonPreferences is the model for sim-specific preferences for all Number Suite sims, accessed via the
 * Preferences dialog. These preferences are global, and affect all screens.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonQueryParameters from '../NumberSuiteCommonQueryParameters.js';
import Property from '../../../../axon/js/Property.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import localeProperty, { availableRuntimeLocales, Locale } from '../../../../joist/js/i18n/localeProperty.js';

//TODO https://github.com/phetsims/number-suite-common/issues/18 type string map, perhaps getStringModule.TStringModule?
//TODO https://github.com/phetsims/number-suite-common/issues/18 replace any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SecondLocaleStrings = any;

class NumberSuiteCommonPreferences {

  // preference Properties directly controlled by UI

  // whether a second locale should be shown. A toggle switch is added on screens that support two locales when true.
  public readonly showSecondLocaleProperty: Property<boolean>;

  // the second locale
  public readonly secondLocaleProperty: Property<Locale>;

  // whether the Ones are included on the 'Lab' Screen
  public readonly showLabOnesProperty: Property<boolean>;

  // whether the sim speaks the model value of screens that use speech synthesis when the data or voice changes
  public readonly autoHearEnabledProperty: Property<boolean>;

  // whether the sim is using its primary locale or a second locale on screens that support two locales
  public readonly isPrimaryLocaleProperty: Property<boolean>;

  // the voice of the primary locale
  public readonly primaryVoiceProperty: Property<SpeechSynthesisVoice | null>;

  // the voice of the secondary locale
  public readonly secondVoiceProperty: Property<SpeechSynthesisVoice | null>;

  // helper Properties derived from preference Properties

  // the set of sim strings for the current secondLocale
  public readonly secondLocaleStringsProperty: TReadOnlyProperty<SecondLocaleStrings>;

  // the 'all' link of this simulation
  public readonly allUrl: string;

  public constructor( allUrl: string ) {

    // if a valid second locale was provided via a query parameter, display the second locale on sim startup
    this.showSecondLocaleProperty = new BooleanProperty( !!NumberSuiteCommonQueryParameters.secondLocale );

    // if a secondLocale was provided via a query parameter, use that, otherwise default to the primaryLocale
    this.secondLocaleProperty = new Property<Locale>( NumberSuiteCommonQueryParameters.secondLocale as Locale || localeProperty.value, {
      validValues: availableRuntimeLocales
    } );

    this.showLabOnesProperty = new BooleanProperty( NumberSuiteCommonQueryParameters.showLabOnes );

    this.autoHearEnabledProperty = new BooleanProperty( NumberSuiteCommonQueryParameters.autoHear );

    this.isPrimaryLocaleProperty = new BooleanProperty( true );

    this.primaryVoiceProperty = new Property<SpeechSynthesisVoice | null>( null );

    this.secondVoiceProperty = new Property<SpeechSynthesisVoice | null>( null );

    this.secondLocaleStringsProperty = new DerivedProperty( [ this.secondLocaleProperty ], secondLocale => {
      return phet.chipper.strings[ secondLocale ];
    } );

    this.allUrl = allUrl;
  }

  public dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonPreferences', NumberSuiteCommonPreferences );
export default NumberSuiteCommonPreferences;