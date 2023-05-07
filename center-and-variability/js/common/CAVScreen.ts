// Copyright 2022-2023, University of Colorado Boulder

/**
 * Base class for all screens in the sim.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import CAVColors from '../common/CAVColors.js';
import centerAndVariability from '../centerAndVariability.js';
import CAVScreenView from './view/CAVScreenView.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import SliderControlsAndBasicActionsKeyboardHelpContent from '../../../scenery-phet/js/keyboard/help/SliderControlsAndBasicActionsKeyboardHelpContent.js';
import CAVModel from './model/CAVModel.js';

type SelfOptions = EmptySelfOptions;
export type CAVScreenOptions = SelfOptions & ScreenOptions & PickRequired<ScreenOptions, 'tandem'>;

export default class CAVScreen<M extends CAVModel, V extends CAVScreenView> extends Screen<M, V> {

  public constructor( createModel: () => M, createView: ( m: M ) => V, providedOptions?: CAVScreenOptions ) {

    const options = optionize<CAVScreenOptions, SelfOptions, ScreenOptions>()( {
      backgroundColorProperty: CAVColors.screenBackgroundColorProperty,
      createKeyboardHelpNode: () => new SliderControlsAndBasicActionsKeyboardHelpContent()
    }, providedOptions );

    super( createModel, createView, options );
  }
}

centerAndVariability.register( 'CAVScreen', CAVScreen );