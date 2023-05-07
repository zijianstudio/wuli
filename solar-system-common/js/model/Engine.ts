// Copyright 2023, University of Colorado Boulder

/**
 * Everything that controls the gravitational interactions between bodies.
 * 
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import { ObservableArray } from '../../../axon/js/createObservableArray.js';
import Body from './Body.js';
import solarSystemCommon from '../solarSystemCommon.js';

export default abstract class Engine {
  // Array of gravitational interacting bodies
  protected bodies: ObservableArray<Body>;

  protected constructor( bodies: ObservableArray<Body> ) {
    this.bodies = bodies;
  }
  public checkCollisions(): void {
    // no-op
  }
  public abstract run( dt: number, updateProperties: boolean ): void;
  public abstract update( bodies: ObservableArray<Body> ): void;
  public abstract reset(): void;
}

solarSystemCommon.register( 'Engine', Engine );