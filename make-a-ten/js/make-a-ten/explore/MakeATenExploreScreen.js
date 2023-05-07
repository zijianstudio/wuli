// Copyright 2016-2022, University of Colorado Boulder

/**
 * Explore screen of Make a Ten. Provides a panel where 100s, 10s or 1s can be dragged out, combined, and pulled
 * apart, and displays the total in the upper-left.
 *
 * @author Sharfudeen Ashraf
 */

import Property from '../../../../axon/js/Property.js';
import Screen from '../../../../joist/js/Screen.js';
import exploreHomeScreen_png from '../../../images/exploreHomeScreen_png.js';
import exploreNavBar_png from '../../../images/exploreNavBar_png.js';
import makeATen from '../../makeATen.js';
import MakeATenStrings from '../../MakeATenStrings.js';
import MakeATenConstants from '../common/MakeATenConstants.js';
import MakeATenUtils from '../common/MakeATenUtils.js';
import MakeATenExploreModel from './model/MakeATenExploreModel.js';
import MakeATenExploreScreenView from './view/MakeATenExploreScreenView.js';

class MakeATenExploreScreen extends Screen {
  constructor() {

    const options = {
      name: MakeATenStrings.screen.exploreStringProperty,
      backgroundColorProperty: new Property( MakeATenConstants.SCREEN_BACKGROUND_COLOR ),
      homeScreenIcon: MakeATenUtils.createIconWithBackgroundColor( exploreHomeScreen_png, MakeATenConstants.SCREEN_BACKGROUND_COLOR ),
      navigationBarIcon: MakeATenUtils.createIconWithBackgroundColor( exploreNavBar_png, MakeATenConstants.SCREEN_BACKGROUND_COLOR )
    };

    super(
      () => new MakeATenExploreModel(),
      model => new MakeATenExploreScreenView( model ),
      options );
  }
}

makeATen.register( 'MakeATenExploreScreen', MakeATenExploreScreen );
export default MakeATenExploreScreen;