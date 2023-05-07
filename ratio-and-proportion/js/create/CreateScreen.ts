// Copyright 2020-2022, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import RAPModel from '../common/model/RAPModel.js';
import ratioAndProportion from '../ratioAndProportion.js';
import RatioAndProportionStrings from '../RatioAndProportionStrings.js';
import CreateScreenIcon from './view/CreateScreenIcon.js';
import CreateScreenKeyboardHelpContent from './view/CreateScreenKeyboardHelpContent.js';
import CreateScreenView from './view/CreateScreenView.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { Color } from '../../../scenery/js/imports.js';

class CreateScreen extends Screen<RAPModel, CreateScreenView> {

  public constructor( tandem: Tandem ) {

    const backgroundColorProperty = new Property( Color.WHITE );

    super(
      () => new RAPModel( tandem.createTandem( 'model' ) ),
      model => new CreateScreenView( model, backgroundColorProperty, tandem.createTandem( 'view' ) ), {
        backgroundColorProperty: backgroundColorProperty,
        tandem: tandem,
        homeScreenIcon: new CreateScreenIcon(),
        name: RatioAndProportionStrings.screen.createStringProperty,
        descriptionContent: RatioAndProportionStrings.a11y.create.homeScreenDescriptionStringProperty,
        createKeyboardHelpNode: () => new CreateScreenKeyboardHelpContent()
      }
    );
  }
}

ratioAndProportion.register( 'CreateScreen', CreateScreen );
export default CreateScreen;