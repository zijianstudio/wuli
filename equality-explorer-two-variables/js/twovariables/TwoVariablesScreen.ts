// Copyright 2018-2022, University of Colorado Boulder

/**e
 * The 'Two Variables' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import EqualityExplorerScreen, { EqualityExplorerScreenOptions } from '../../../equality-explorer/js/common/EqualityExplorerScreen.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import equalityExplorerTwoVariables from '../equalityExplorerTwoVariables.js';
import TwoVariablesModel from './model/TwoVariablesModel.js';
import TwoVariablesScreenView from './view/TwoVariablesScreenView.js';

type SelfOptions = EmptySelfOptions;

type TwoVariablesScreenOptions = SelfOptions & PickRequired<EqualityExplorerScreenOptions, 'tandem'>;

export default class TwoVariablesScreen extends EqualityExplorerScreen<TwoVariablesModel, TwoVariablesScreenView> {

  public constructor( providedOptions: TwoVariablesScreenOptions ) {

    const options = optionize<TwoVariablesScreenOptions, SelfOptions, EqualityExplorerScreenOptions>()( {

      // EqualityExplorerScreenOptions
      backgroundColorProperty: new Property( 'rgb( 214, 233, 254 )' )
    }, providedOptions );

    super(
      () => new TwoVariablesModel( options.tandem.createTandem( 'model' ) ),
      model => new TwoVariablesScreenView( model, options.tandem.createTandem( 'view' ) ),
      options
    );
  }
}

equalityExplorerTwoVariables.register( 'TwoVariablesScreen', TwoVariablesScreen );