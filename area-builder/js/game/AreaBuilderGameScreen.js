// Copyright 2014-2022, University of Colorado Boulder

/**
 * The 'Game' screen in the Area Builder simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import gameIcon_png from '../../images/gameIcon_png.js';
import areaBuilder from '../areaBuilder.js';
import AreaBuilderStrings from '../AreaBuilderStrings.js';
import AreaBuilderSharedConstants from '../common/AreaBuilderSharedConstants.js';
import AreaBuilderIconFactory from '../common/view/AreaBuilderIconFactory.js';
import AreaBuilderChallengeFactory from './model/AreaBuilderChallengeFactory.js';
import AreaBuilderGameModel from './model/AreaBuilderGameModel.js';
import QuizGameModel from './model/QuizGameModel.js';
import AreaBuilderGameView from './view/AreaBuilderGameView.js';

class AreaBuilderGameScreen extends Screen {

  constructor( tandem ) {

    const options = {
      name: AreaBuilderStrings.gameStringProperty,
      backgroundColorProperty: new Property( AreaBuilderSharedConstants.BACKGROUND_COLOR ),
      homeScreenIcon: new ScreenIcon( new Image( gameIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: AreaBuilderIconFactory.createGameScreenNavBarIcon(),
      tandem: tandem
    };

    super(
      () => new QuizGameModel( new AreaBuilderChallengeFactory(), new AreaBuilderGameModel() ),
      model => new AreaBuilderGameView( model ),
      options
    );
  }
}

areaBuilder.register( 'AreaBuilderGameScreen', AreaBuilderGameScreen );
export default AreaBuilderGameScreen;