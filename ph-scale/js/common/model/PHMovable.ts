// Copyright 2013-2022, University of Colorado Boulder

/**
 * A movable model element.
 * Semantics of units are determined by the client.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property, { Vector2PropertyOptions } from '../../../../dot/js/Vector2Property.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import phScale from '../../phScale.js';

type SelfOptions = {

  // options passed to positionProperty
  positionPropertyOptions?: StrictOmit<Vector2PropertyOptions, 'tandem'>;
};

export type PHMovableOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class PHMovable {

  public readonly positionProperty: Property<Vector2>;
  public dragBounds: Bounds2;

  public constructor( position: Vector2, dragBounds: Bounds2, providedOptions: PHMovableOptions ) {

    const options = providedOptions;

    this.positionProperty = new Vector2Property( position,
      combineOptions<Vector2PropertyOptions>( {
        tandem: options.tandem.createTandem( 'positionProperty' )
      }, options.positionPropertyOptions ) );

    this.dragBounds = dragBounds;
  }

  public reset(): void {
    this.positionProperty.reset();
  }
}

phScale.register( 'PHMovable', PHMovable );