// Copyright 2020-2022, University of Colorado Boulder

/**
 * Content for the keyboard help dialog in the discover screen
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ComboBoxKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/ComboBoxKeyboardHelpSection.js';
import RAPKeyboardHelpContent from '../../common/view/RAPKeyboardHelpContent.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';

class DiscoverScreenKeyboardHelpContent extends RAPKeyboardHelpContent {
  public constructor() {
    super( new ComboBoxKeyboardHelpSection( {
      headingString: RatioAndProportionStrings.chooseAChallengeRatioStringProperty
    } ) );
  }
}

ratioAndProportion.register( 'DiscoverScreenKeyboardHelpContent', DiscoverScreenKeyboardHelpContent );
export default DiscoverScreenKeyboardHelpContent;