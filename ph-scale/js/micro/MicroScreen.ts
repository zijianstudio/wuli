// Copyright 2013-2023, University of Colorado Boulder

/**
 * The 'Micro' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Property from '../../../axon/js/Property.js';
import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import { Image } from '../../../scenery/js/imports.js';
import microHomeScreenIcon_png from '../../images/microHomeScreenIcon_png.js';
import microNavbarIcon_png from '../../images/microNavbarIcon_png.js';
import PHScaleColors from '../common/PHScaleColors.js';
import phScale from '../phScale.js';
import PhScaleStrings from '../PhScaleStrings.js';
import MicroModel from './model/MicroModel.js';
import MicroScreenView from './view/MicroScreenView.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import MicroKeyboardHelpContent from './view/MicroKeyboardHelpContent.js';

type SelfOptions = EmptySelfOptions;

type MicroScreenOptions = SelfOptions & PickRequired<ScreenOptions, 'tandem'>;

export default class MicroScreen extends Screen<MicroModel, MicroScreenView> {

  public constructor( providedOptions: MicroScreenOptions ) {

    const options = optionize<MicroScreenOptions, SelfOptions, ScreenOptions>()( {

      // ScreenOptions
      name: PhScaleStrings.screen.microStringProperty,
      backgroundColorProperty: new Property( PHScaleColors.SCREEN_BACKGROUND ),
      homeScreenIcon: new ScreenIcon( new Image( microHomeScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: new ScreenIcon( new Image( microNavbarIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      //TODO https://github.com/phetsims/ph-scale/issues/249 restore when work on alternative input resume
      createKeyboardHelpNode: () => new MicroKeyboardHelpContent()
    }, providedOptions );

    super(
      () => new MicroModel( {
        tandem: options.tandem.createTandem( 'model' )
      } ),
      model => new MicroScreenView( model, ModelViewTransform2.createIdentity(), {
        tandem: options.tandem.createTandem( 'view' )
      } ),
      options
    );
  }
}

phScale.register( 'MicroScreen', MicroScreen );