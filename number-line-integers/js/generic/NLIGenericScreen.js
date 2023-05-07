// Copyright 2019-2022, University of Colorado Boulder

/**
 * the 'Generic' screen in the Number Line: Integers simulation
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import genericScreenHome_png from '../../images/genericScreenHome_png.js';
import genericScreenNav_png from '../../images/genericScreenNav_png.js';
import numberLineIntegers from '../numberLineIntegers.js';
import NumberLineIntegersStrings from '../NumberLineIntegersStrings.js';
import NLIGenericModel from './model/NLIGenericModel.js';
import NLIGenericScreenView from './view/NLIGenericScreenView.js';

class NLIGenericScreen extends Screen {

  /**
   * @param {Tandem} tandem
   * @public
   */
  constructor( tandem ) {

    const options = {
      name: NumberLineIntegersStrings.screen.genericStringProperty,
      backgroundColorProperty: new Property( 'rgb( 245, 255, 254 )' ),
      homeScreenIcon: new ScreenIcon( new Image( genericScreenHome_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: new ScreenIcon( new Image( genericScreenNav_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super( () => new NLIGenericModel(), model => new NLIGenericScreenView( model ), options );
  }
}

numberLineIntegers.register( 'NLIGenericScreen', NLIGenericScreen );
export default NLIGenericScreen;