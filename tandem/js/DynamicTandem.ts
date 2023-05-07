// Copyright 2019-2022, University of Colorado Boulder

/**
 * A tandem for a dynamic element that stores the name of the archetype that defines its dynamic element's schema.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import Tandem, { DYNAMIC_ARCHETYPE_NAME, TandemOptions } from './Tandem.js';
import tandemNamespace from './tandemNamespace.js';

type DynamicTandemOptions = StrictOmit<TandemOptions, 'isValidTandemName'>;

class DynamicTandem extends Tandem {

  public constructor( parentTandem: Tandem, name: string, options?: DynamicTandemOptions ) {
    assert && assert( parentTandem, 'DynamicTandem must have a parentTandem' );
    super( parentTandem, name, {
      ...options,
      isValidTandemName: ( name: string ) => /^[a-zA-Z0-9_]+$/.test( name )
    } );
  }

  /**
   * See Tandem.getArchetypalPhetioID, in this case, look up the corresponding archetype.
   * A dynamic phetioID contains text like .................'sim.screen1.particles.particles_7.visibleProperty'
   * This method looks up the corresponding archetype like..'sim.screen1.particles.archetype.visibleProperty'
   */
  public override getArchetypalPhetioID(): string {
    assert && assert( this.parentTandem, 'Group elements must be in a Group' );
    return window.phetio.PhetioIDUtils.append( this.parentTandem!.getArchetypalPhetioID(), DYNAMIC_ARCHETYPE_NAME );
  }

  public static readonly DYNAMIC_ARCHETYPE_NAME = DYNAMIC_ARCHETYPE_NAME;
}

tandemNamespace.register( 'DynamicTandem', DynamicTandem );
export default DynamicTandem;