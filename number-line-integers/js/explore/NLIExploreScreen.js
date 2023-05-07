// Copyright 2019-2022, University of Colorado Boulder

/**
 * The 'Explore' screen in the Number Line: Integers simulation.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import exploreScreenHome_png from '../../images/exploreScreenHome_png.js';
import exploreScreenNav_png from '../../images/exploreScreenNav_png.js';
import numberLineIntegers from '../numberLineIntegers.js';
import NumberLineIntegersStrings from '../NumberLineIntegersStrings.js';
import NLIExploreModel from './model/NLIExploreModel.js';
import NLIExploreScreenView from './view/NLIExploreScreenView.js';

class NLIExploreScreen extends Screen {

  /**
   * @param {Tandem} tandem
   * @public
   */
  constructor( tandem ) {

    const options = {
      name: NumberLineIntegersStrings.screen.exploreStringProperty,
      backgroundColorProperty: new Property( 'rgb( 254, 247, 233 )' ),
      homeScreenIcon: new ScreenIcon( new Image( exploreScreenHome_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: new ScreenIcon( new Image( exploreScreenNav_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super( () => new NLIExploreModel(), model => new NLIExploreScreenView( model ), options );
  }
}

numberLineIntegers.register( 'NLIExploreScreen', NLIExploreScreen );
export default NLIExploreScreen;