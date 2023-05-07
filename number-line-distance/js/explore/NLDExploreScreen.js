// Copyright 2020-2022, University of Colorado Boulder

/**
 * the 'Explore' screen in the Number Line: Distance simulation
 *
 * @author Saurabh Totey
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import exploreHomeIcon_png from '../../images/exploreHomeIcon_png.js';
import exploreNavbarIcon_png from '../../images/exploreNavbarIcon_png.js';
import NLDColors from '../common/NLDColors.js';
import numberLineDistance from '../numberLineDistance.js';
import NumberLineDistanceStrings from '../NumberLineDistanceStrings.js';
import NLDExploreModel from './model/NLDExploreModel.js';
import NLDExploreScreenView from './view/NLDExploreScreenView.js';

class NLDExploreScreen extends Screen {

  /**
   * @param {Tandem} tandem
   * @public
   */
  constructor( tandem ) {
    const options = {
      name: NumberLineDistanceStrings.screen.exploreStringProperty,
      backgroundColorProperty: NLDColors.exploreScreenBackgroundColorProperty,
      homeScreenIcon: new ScreenIcon( new Image( exploreHomeIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: new ScreenIcon( new Image( exploreNavbarIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new NLDExploreModel( tandem.createTandem( 'model' ) ),
      model => new NLDExploreScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }

}

numberLineDistance.register( 'NLDExploreScreen', NLDExploreScreen );
export default NLDExploreScreen;
