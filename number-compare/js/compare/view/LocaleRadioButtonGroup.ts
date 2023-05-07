// Copyright 2023, University of Colorado Boulder

/**
 * LocaleRadioButtonGroup is a vertical radio-button group for selecting primary vs secondary language.
 * It's an alternative to LocaleSwitch that takes up less horizontal space, and was developed as a workaround
 * for https://github.com/phetsims/number-compare/issues/18.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import localeProperty from '../../../../joist/js/i18n/localeProperty.js';
import { Text, TextOptions } from '../../../../scenery/js/imports.js';
import numberSuiteCommon from '../../../../number-suite-common/js/numberSuiteCommon.js';
import { AquaRadioButtonGroupItem } from '../../../../sun/js/AquaRadioButtonGroup.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import numberComparePreferences from '../../common/model/numberComparePreferences.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import numberCompareUtteranceQueue from '../../common/view/numberCompareUtteranceQueue.js';

const TEXT_OPTIONS: TextOptions = {
  font: new PhetFont( 14 ),
  maxWidth: 150 // set empirically
};

// Size the radio buttons to match the text height.
const RADIO_BUTTON_RADIUS = new Text( 'X', TEXT_OPTIONS ).height / 2;

export default class LocaleRadioButtonGroup extends VerticalAquaRadioButtonGroup<boolean> {

  public constructor() {

    const firstLanguageStringProperty = new DerivedProperty( [ localeProperty ], StringUtils.localeToLocalizedName );

    const secondLanguageStringProperty = new DerivedProperty( [
      numberComparePreferences.secondLocaleProperty
    ], StringUtils.localeToLocalizedName );

    const items: AquaRadioButtonGroupItem<boolean>[] = [
      {
        value: true,
        createNode: () => new Text( firstLanguageStringProperty, TEXT_OPTIONS )
      },
      {
        value: false,
        createNode: () => new Text( secondLanguageStringProperty, TEXT_OPTIONS )
      }
    ];

    super( numberComparePreferences.isPrimaryLocaleProperty, items, {
      spacing: 10,
      radioButtonOptions: {
        radius: RADIO_BUTTON_RADIUS
      },
      visibleProperty: new DerivedProperty( [ numberComparePreferences.showSecondLocaleProperty ], showSecondLocale => showSecondLocale )
    } );

    // Speak speechData if autoHear is turned on.
    this.onInputEmitter.addListener( () => {
      numberComparePreferences.autoHearEnabledProperty.value && numberCompareUtteranceQueue.speakSpeechData();
    } );
  }
}

numberSuiteCommon.register( 'LocaleRadioButtonGroup', LocaleRadioButtonGroup );