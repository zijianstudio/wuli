// Copyright 2013-2023, University of Colorado Boulder

/**
 * Solution is the base class for the solution in the 'Macro' and 'Micro' screens.
 * Solvent (water) is constant, solute (in stock solution form) is variable.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { Color } from '../../../../scenery/js/imports.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import { PHValue } from './PHModel.js';
import Solute from './Solute.js';
import Water from './Water.js';
import PHScaleConstants from '../PHScaleConstants.js';
import phScale from '../../phScale.js';
import PHModel from './PHModel.js';
import LinkableReadOnlyProperty from '../../../../axon/js/LinkableReadOnlyProperty.js';

// constants
const MIN_VOLUME = Math.pow( 10, -PHScaleConstants.VOLUME_DECIMAL_PLACES );

type SelfOptions = {
  soluteVolume?: number; // initial volume of solute, in L
  waterVolume?: number; // initial volume of water, in L
  maxVolume?: number; // maximum total volume (solute + water), in L
};

export type SolutionOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class Solution extends PhetioObject {

  public readonly soluteProperty: Property<Solute>;
  public readonly soluteVolumeProperty: Property<number>;
  public readonly waterVolumeProperty: Property<number>;
  public readonly totalVolumeProperty: TReadOnlyProperty<number>;
  public readonly pHProperty: LinkableReadOnlyProperty<PHValue>;
  public readonly colorProperty: TReadOnlyProperty<Color>;
  public readonly maxVolume: number;

  // Used to update total volume atomically when draining solution, see https://github.com/phetsims/ph-scale/issues/25
  private ignoreVolumeUpdate: boolean;

  protected constructor( soluteProperty: Property<Solute>, providedOptions: SolutionOptions ) {

    const options = optionize<SolutionOptions, SelfOptions, PhetioObjectOptions>()( {

      // SelfOptions
      soluteVolume: 0,
      waterVolume: 0,
      maxVolume: 1,

      // PhetioOptions
      phetioState: false,
      phetioDocumentation: 'solution in the beaker'
    }, providedOptions );

    assert && assert( options.soluteVolume >= 0 );
    assert && assert( options.waterVolume >= 0 );
    assert && assert( options.maxVolume > 0 );
    assert && assert( options.soluteVolume + options.waterVolume <= options.maxVolume );

    super( options );

    this.soluteProperty = soluteProperty;

    // Create a PhET-iO linked element that points to where soluteProperty lives (in Dropper).
    // This makes it easier to find soluteProperty in the Studio tree.
    this.addLinkedElement( this.soluteProperty, {
      tandem: options.tandem.createTandem( 'soluteProperty' )
    } );

    this.maxVolume = options.maxVolume;

    this.soluteVolumeProperty = new NumberProperty( options.soluteVolume, {
      units: 'L',
      tandem: options.tandem.createTandem( 'soluteVolumeProperty' ),
      phetioDocumentation: `Volume of solute in the solution. soluteVolumeProperty + waterVolumeProperty should be <= ${options.maxVolume}`,
      phetioHighFrequency: true
    } );

    this.waterVolumeProperty = new NumberProperty( options.waterVolume, {
      units: 'L',
      tandem: options.tandem.createTandem( 'waterVolumeProperty' ),
      phetioDocumentation: `Volume of water in the solution. waterVolumeProperty + soluteVolumeProperty should be <= ${options.maxVolume}`,
      phetioHighFrequency: true
    } );

    // Used to update total volume atomically when draining solution, see https://github.com/phetsims/ph-scale/issues/25
    this.ignoreVolumeUpdate = false;

    this.totalVolumeProperty = new DerivedProperty(
      [ this.soluteVolumeProperty, this.waterVolumeProperty ],
      ( soluteVolume, waterVolume ) => ( this.ignoreVolumeUpdate ) ? this.totalVolumeProperty.value : ( soluteVolume + waterVolume ), {
        units: 'L',
        tandem: options.tandem.createTandem( 'totalVolumeProperty' ),
        phetioValueType: NumberIO,
        phetioDocumentation: 'total volume of the solution',
        phetioHighFrequency: true
      } );

    this.pHProperty = new DerivedProperty(
      [ this.soluteProperty, this.soluteVolumeProperty, this.waterVolumeProperty ],
      ( solute, soluteVolume, waterVolume ) => {
        if ( this.ignoreVolumeUpdate ) {
          return this.pHProperty.value;
        }
        else {
          return PHModel.computePH( solute.pH, soluteVolume, waterVolume );
        }
      }, {
        tandem: options.tandem.createTandem( 'pHProperty' ),
        phetioValueType: NullableIO( NumberIO ),
        phetioDocumentation: 'pH of the solution',
        phetioHighFrequency: true
      } );

    this.colorProperty = new DerivedProperty(
      [ this.soluteProperty, this.soluteVolumeProperty, this.waterVolumeProperty ],
      ( solute, soluteVolume, waterVolume ) => {
        if ( this.ignoreVolumeUpdate ) {
          return this.colorProperty.value;
        }
        else if ( soluteVolume + waterVolume === 0 ) {
          return Color.BLACK; // no solution, should never see this color displayed
        }
        else if ( soluteVolume === 0 || PHModel.isEquivalentToWater( this.pHProperty.value ) ) {
          return Water.color;
        }
        else {
          return solute.computeColor( soluteVolume / ( soluteVolume + waterVolume ) );
        }
      } );

    // When the solute changes, reset to initial volumes.
    // This is short-circuited while PhET-iO state is being restored. Otherwise, the restored state would be changed.
    // See https://github.com/phetsims/ph-scale/issues/132
    this.soluteProperty.link( () => {
      if ( !phet.joist.sim.isSettingPhetioStateProperty.value ) {
        this.waterVolumeProperty.reset();
        this.soluteVolumeProperty.reset();
      }
    } );
  }

  public reset(): void {
    this.soluteVolumeProperty.reset();
    this.waterVolumeProperty.reset();
  }

  //----------------------------------------------------------------------------
  // Volume (Liters)
  //----------------------------------------------------------------------------

  // Returns the amount of volume that is available to fill.
  private getFreeVolume(): number {
    return this.maxVolume - this.totalVolumeProperty.value;
  }

  // Convenience function for adding solute
  public addSolute( deltaVolume: number ): void {
    if ( deltaVolume > 0 ) {
      this.soluteVolumeProperty.value =
        Math.max( MIN_VOLUME, this.soluteVolumeProperty.value + Math.min( deltaVolume, this.getFreeVolume() ) );
    }
  }

  // Convenience function for adding water
  public addWater( deltaVolume: number ): void {
    if ( deltaVolume > 0 ) {
      this.waterVolumeProperty.value =
        Math.max( MIN_VOLUME, this.waterVolumeProperty.value + Math.min( deltaVolume, this.getFreeVolume() ) );
    }
  }

  /**
   * Drains a specified amount of solution, in liters.
   */
  public drainSolution( deltaVolume: number ): void {
    if ( deltaVolume > 0 ) {
      const totalVolume = this.totalVolumeProperty.value;
      if ( totalVolume > 0 ) {
        if ( totalVolume - deltaVolume < MIN_VOLUME ) {
          // drain the remaining solution
          this.setVolumeAtomic( 0, 0 );
        }
        else {
          // drain equal percentages of water and solute
          const waterVolume = this.waterVolumeProperty.value;
          const soluteVolume = this.soluteVolumeProperty.value;
          this.setVolumeAtomic( waterVolume - ( deltaVolume * waterVolume / totalVolume ), soluteVolume - ( deltaVolume * soluteVolume / totalVolume ) );
        }
      }
    }
  }

  /**
   * Sets volume atomically, to prevent pH value from going through an intermediate state.
   * This is used when draining solution, so that equal parts of solute and water are removed atomically.
   * See documentation of ignoreVolumeUpdate above, and https://github.com/phetsims/ph-scale/issues/25.
   */
  private setVolumeAtomic( waterVolume: number, soluteVolume: number ): void {

    // ignore the first notification if both volumes are changing
    this.ignoreVolumeUpdate = ( waterVolume !== this.waterVolumeProperty.value ) && ( soluteVolume !== this.soluteVolumeProperty.value );
    this.waterVolumeProperty.value = waterVolume;
    this.ignoreVolumeUpdate = false; // don't ignore the second notification, so that observers will update
    this.soluteVolumeProperty.value = soluteVolume;
  }
}

phScale.register( 'Solution', Solution );