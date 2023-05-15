// Copyright 2023, University of Colorado Boulder

/**
 * TODO Describe this class and its responsibilities.
 *
 * @author Zijian Wang
 */

import relativity from '../../relativity.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import TModel from '../../../../joist/js/TModel.js';

type SelfOptions = {
  //TODO add options that are specific to RelativityModel here
};

type RelativityModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class RelativityModel implements TModel {

  public constructor( providedOptions: RelativityModelOptions ) {
    //TODO
    this.coord1 = 1;
    this.coord2 = 1;
  }

  /**
   * Resets the model.
   */
  public reset(): void {
    //TODO
  }

  /**
   * Steps the model.
   * @param dt - time step, in seconds
   */
  public step( dt: number ): void {
    //console.log("model dt"); //works
  }
}

relativity.register( 'RelativityModel', RelativityModel );