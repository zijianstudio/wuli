// Copyright 2013-2023, University of Colorado Boulder

/**
 * MicroModel is the model for the 'Micro' screen.  It extends the PHModel, substituting a different solution
 * model, and omitting the pH meter.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PHModel, { PHModelOptions } from '../../common/model/PHModel.js';
import phScale from '../../phScale.js';
import MicroSolution from './MicroSolution.js';

type SelfOptions = EmptySelfOptions;

type MicroModelOptions = SelfOptions & PickRequired<PHModelOptions<MicroSolution>, 'tandem'>;

export default class MicroModel extends PHModel<MicroSolution> {

  public constructor( providedOptions: MicroModelOptions ) {

    const options = optionize<MicroModelOptions, SelfOptions, PHModelOptions<MicroSolution>>()( {

      // Creates the solution needed by the Micro screen
      createSolution: ( solutionProperty, maxVolume, tandem ) => new MicroSolution( solutionProperty, {
        maxVolume: maxVolume,
        tandem: tandem
      } )
    }, providedOptions );

    super( options );
  }
}

phScale.register( 'MicroModel', MicroModel );