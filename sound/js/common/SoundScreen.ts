// Copyright 2022, University of Colorado Boulder
/**
 * Screen for the sound application
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import SoundColors from '../common/SoundColors.js';
import sound from '../sound.js';
import { Node } from '../../../scenery/js/imports.js';
import SoundModel from './model/SoundModel.js';
import SoundScreenView from './view/SoundScreenView.js';
import Tandem from '../../../tandem/js/Tandem.js';
import LinkableProperty from '../../../axon/js/LinkableProperty.js';

export default class SoundScreen<T extends SoundModel> extends Screen<T, SoundScreenView> {
  public constructor( title: LinkableProperty<string>, createModel: () => T, createView: ( model: T ) => SoundScreenView, iconImage: Node ) {

    const options: ScreenOptions = {
      backgroundColorProperty: SoundColors.SCREEN_VIEW_BACKGROUND,
      name: title,
      homeScreenIcon: new ScreenIcon( iconImage, {
        size: new Dimension2( Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height ),
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      // showPlaySoundControl: true,
      // audioEnabled: true,
      tandem: Tandem.OPT_OUT
    };

    super(
      createModel,
      createView,
      options
    );
  }
}

sound.register( 'SoundScreen', SoundScreen );