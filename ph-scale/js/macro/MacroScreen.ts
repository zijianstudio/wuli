// Copyright 2013-2023, University of Colorado Boulder

/**
 * The 'Macro' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import { Image } from '../../../scenery/js/imports.js';
import macroHomeScreenIcon_png from '../../images/macroHomeScreenIcon_png.js';
import macroNavbarIcon_png from '../../images/macroNavbarIcon_png.js';
import PHScaleColors from '../common/PHScaleColors.js';
import phScale from '../phScale.js';
import PhScaleStrings from '../PhScaleStrings.js';
import MacroModel from './model/MacroModel.js';
import MacroScreenView from './view/MacroScreenView.js';
import MacroKeyboardHelpContent from './view/MacroKeyboardHelpContent.js';

type SelfOptions = EmptySelfOptions;

type MacroScreenOptions = SelfOptions & PickRequired<ScreenOptions, 'tandem'>;

export default class MacroScreen extends Screen<MacroModel, MacroScreenView> {

  public constructor( providedOptions: MacroScreenOptions ) {

    const options = optionize<MacroScreenOptions, SelfOptions, ScreenOptions>()( {

      // ScreenOptions
      name: PhScaleStrings.screen.macroStringProperty,
      backgroundColorProperty: new Property( PHScaleColors.SCREEN_BACKGROUND ),
      homeScreenIcon: new ScreenIcon( new Image( macroHomeScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: new ScreenIcon( new Image( macroNavbarIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      //TODO https://github.com/phetsims/ph-scale/issues/249 restore when work on alternative input resume
      createKeyboardHelpNode: () => new MacroKeyboardHelpContent()
    }, providedOptions );

    super(
      () => new MacroModel( {
        tandem: options.tandem.createTandem( 'model' )
      } ),
      model => new MacroScreenView( model, ModelViewTransform2.createIdentity(), {
        tandem: options.tandem.createTandem( 'view' )
      } ),
      options
    );
  }
}

phScale.register( 'MacroScreen', MacroScreen );