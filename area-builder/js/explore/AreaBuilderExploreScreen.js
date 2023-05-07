// Copyright 2014-2022, University of Colorado Boulder

/**
 * The 'Explore' screen in the Area Builder simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import exploreIcon_png from '../../images/exploreIcon_png.js';
import areaBuilder from '../areaBuilder.js';
import AreaBuilderStrings from '../AreaBuilderStrings.js';
import AreaBuilderSharedConstants from '../common/AreaBuilderSharedConstants.js';
import AreaBuilderIconFactory from '../common/view/AreaBuilderIconFactory.js';
import AreaBuilderExploreModel from './model/AreaBuilderExploreModel.js';
import AreaBuilderExploreView from './view/AreaBuilderExploreView.js';


class AreaBuilderExploreScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      name: AreaBuilderStrings.exploreStringProperty,
      backgroundColorProperty: new Property( AreaBuilderSharedConstants.BACKGROUND_COLOR ),
      homeScreenIcon: new ScreenIcon( new Image( exploreIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: AreaBuilderIconFactory.createExploreScreenNavBarIcon(),
      tandem: tandem
    };

    super(
      () => new AreaBuilderExploreModel(),
      model => new AreaBuilderExploreView( model ),
      options
    );
  }
}

areaBuilder.register( 'AreaBuilderExploreScreen', AreaBuilderExploreScreen );
export default AreaBuilderExploreScreen;