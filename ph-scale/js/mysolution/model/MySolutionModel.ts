// Copyright 2013-2022, University of Colorado Boulder

/**
 * MySolutionModel is the model for the 'My Solution' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import TModel from '../../../../joist/js/TModel.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import Beaker from '../../common/model/Beaker.js';
import PHScaleConstants from '../../common/PHScaleConstants.js';
import phScale from '../../phScale.js';
import MySolution from './MySolution.js';

type SelfOptions = EmptySelfOptions;

type MySolutionModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class MySolutionModel implements TModel {

  // Beaker, everything else is positioned relative to it. Offset constants were set by visual inspection.
  public readonly beaker: Beaker;

  // solution in the beaker
  public readonly solution: MySolution;

  public constructor( providedOptions: MySolutionModelOptions ) {

    this.beaker = new Beaker( PHScaleConstants.BEAKER_POSITION );

    this.solution = new MySolution( {
      maxVolume: this.beaker.volume,
      tandem: providedOptions.tandem.createTandem( 'solution' )
    } );
  }

  public reset(): void {
    this.solution.reset();
  }
}

phScale.register( 'MySolutionModel', MySolutionModel );