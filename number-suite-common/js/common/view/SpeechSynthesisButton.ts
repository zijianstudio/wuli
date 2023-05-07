// Copyright 2021-2023, University of Colorado Boulder

/**
 * A button that speaks the speech data of the provided NumberSuiteCommonUtteranceQueue when pressed.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import { Color, Path } from '../../../../scenery/js/imports.js';
import bullhornSolidShape from '../../../../sherpa/js/fontawesome-5/bullhornSolidShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import NumberSuiteCommonSpeechSynthesisAnnouncer from './NumberSuiteCommonSpeechSynthesisAnnouncer.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import audioManager from '../../../../joist/js/audioManager.js';
import NumberSuiteCommonUtteranceQueue from './NumberSuiteCommonUtteranceQueue.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';

type SelfOptions = {
  comparisonSignsAndTextVisibleProperty?: TReadOnlyProperty<boolean>;
};
export type SpeechSynthesisButtonOptions = SelfOptions;

// constants
const SIDE_LENGTH = NumberSuiteCommonConstants.BUTTON_LENGTH;

class SpeechSynthesisButton extends RectangularPushButton {

  public constructor(
    speechSynthesisAnnouncer: NumberSuiteCommonSpeechSynthesisAnnouncer,
    utteranceQueue: NumberSuiteCommonUtteranceQueue,
    providedOptions?: SpeechSynthesisButtonOptions ) {

    const options = optionize<SpeechSynthesisButtonOptions, SelfOptions>()( {
      comparisonSignsAndTextVisibleProperty: new BooleanProperty( true )
    }, providedOptions );

    super( {
      content: new Path( bullhornSolidShape, {
        fill: Color.BLACK
      } ),
      size: new Dimension2( SIDE_LENGTH, SIDE_LENGTH ),
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      listener: () => utteranceQueue.speakSpeechData(),
      enabledProperty: new DerivedProperty( [
        audioManager.audioEnabledProperty,
        options.comparisonSignsAndTextVisibleProperty,
        speechSynthesisAnnouncer.hasVoiceProperty
      ], ( audioEnabled, comparisonSignsAndTextVisible, hasVoice ) =>
        audioEnabled && comparisonSignsAndTextVisible && hasVoice )
    } );
  }
}

numberSuiteCommon.register( 'SpeechSynthesisButton', SpeechSynthesisButton );
export default SpeechSynthesisButton;