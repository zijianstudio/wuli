// Copyright 2023, University of Colorado Boulder

/**
 * TODO Describe this class and its responsibilities.
 *
 * @author Zijian Wang
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import optionize from '../../../phet-core/js/optionize.js';
import RelativityColors from '../common/RelativityColors.js';
import relativity from '../relativity.js';
import RelativityModel from './model/RelativityModel.js';
import RelativityScreenView from './view/RelativityScreenView.js';
import RelativityStrings from '../RelativityStrings.js';

type SelfOptions = {
  //TODO add options that are specific to RelativityScreen here
};

type RelativityScreenOptions = SelfOptions & ScreenOptions;

export default class RelativityScreen extends Screen<RelativityModel, RelativityScreenView> {

  public constructor( providedOptions: RelativityScreenOptions ) {

    const options = optionize<RelativityScreenOptions, SelfOptions, ScreenOptions>()( {
      name: RelativityStrings.screen.nameStringProperty,

      //TODO add default values for optional SelfOptions here

      //TODO add default values for optional ScreenOptions here
      backgroundColorProperty: RelativityColors.screenBackgroundColorProperty
    }, providedOptions );

    super(
      () => new RelativityModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new RelativityScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}

relativity.register( 'RelativityScreen', RelativityScreen );