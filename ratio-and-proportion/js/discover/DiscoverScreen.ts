// Copyright 2020-2022, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import RAPModel from '../common/model/RAPModel.js';
import ratioAndProportion from '../ratioAndProportion.js';
import RatioAndProportionStrings from '../RatioAndProportionStrings.js';
import DiscoverScreenIcon from './view/DiscoverScreenIcon.js';
import DiscoverScreenKeyboardHelpContent from './view/DiscoverScreenKeyboardHelpContent.js';
import DiscoverScreenView from './view/DiscoverScreenView.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { Color } from '../../../scenery/js/imports.js';

class DiscoverScreen extends Screen<RAPModel, DiscoverScreenView> {

  public constructor( tandem: Tandem ) {

    const backgroundColorProperty = new Property( Color.WHITE );
    const options = {
      backgroundColorProperty: backgroundColorProperty,
      tandem: tandem,
      homeScreenIcon: new DiscoverScreenIcon(),
      name: RatioAndProportionStrings.screen.discoverStringProperty,
      descriptionContent: RatioAndProportionStrings.a11y.discover.homeScreenDescriptionStringProperty,
      createKeyboardHelpNode: () => new DiscoverScreenKeyboardHelpContent()
    };

    super(
      () => new RAPModel( tandem.createTandem( 'model' ) ),
      model => new DiscoverScreenView( model, backgroundColorProperty, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

ratioAndProportion.register( 'DiscoverScreen', DiscoverScreen );
export default DiscoverScreen;