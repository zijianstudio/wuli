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
import Property from '../../../../axon/js/Property.js';
import Vector2 from "../../../../dot/js/Vector2";

export default class Plane implements TModel {
  public positionProperty: Property<Vector2>;
  private coord: number;

  public constructor( position: Vector2 ) {
    //TODO
    this.coord = 1;
    this.positionProperty = new Property(position);
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
    console.log("plane dt");
  }
}

relativity.register( 'Plane', Plane );