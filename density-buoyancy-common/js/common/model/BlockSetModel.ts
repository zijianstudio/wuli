// Copyright 2022, University of Colorado Boulder

/**
 * Mix-in for modal Density/Buoyancy models, where callbacks will create/position masses for each set.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import DensityBuoyancyModel, { DensityBuoyancyModelOptions } from '../../common/model/DensityBuoyancyModel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Cuboid from './Cuboid.js';

type CreateMassesCallback<BlockSetValue extends EnumerationValue> = ( model: DensityBuoyancyModel, blockSet: BlockSetValue ) => Cuboid[];
type RegenerateMassesCallback<BlockSetValue extends EnumerationValue> = ( model: DensityBuoyancyModel, blockSet: BlockSetValue, masses: Cuboid[] ) => void;
type PositionMassesCallback<BlockSetValue extends EnumerationValue> = ( model: DensityBuoyancyModel, blockSet: BlockSetValue, masses: Cuboid[] ) => void;

type SelfOptions<BlockSetValue extends EnumerationValue> = {
  // Creates masses (when given a blockSet)
  createMassesCallback: CreateMassesCallback<BlockSetValue>;

  // Regenerate masses (when given a blockSet)
  regenerateMassesCallback: RegenerateMassesCallback<BlockSetValue>;

  // Positions masses (for a given blockSet)
  positionMassesCallback: PositionMassesCallback<BlockSetValue>;

  initialMode: BlockSetValue;
  BlockSet: Enumeration<BlockSetValue>;
};

export type BlockSetModelOptions<BlockSetValue extends EnumerationValue> = SelfOptions<BlockSetValue> & DensityBuoyancyModelOptions;

export default class BlockSetModel<BlockSetValue extends EnumerationValue> extends DensityBuoyancyModel {

  public readonly BlockSet: Enumeration<BlockSetValue>;
  public readonly blockSetProperty: Property<BlockSetValue>;
  private readonly createMassesCallback: CreateMassesCallback<BlockSetValue>;
  private readonly regenerateMassesCallback: RegenerateMassesCallback<BlockSetValue>;
  private readonly positionMassesCallback: PositionMassesCallback<BlockSetValue>;

  private blockSetToMassesMap: Map<BlockSetValue, Cuboid[]>;

  public constructor( options: BlockSetModelOptions<BlockSetValue> ) {
    super( options );

    this.BlockSet = options.BlockSet;

    const tandem = options.tandem;

    // {Property.<BlockSet>}
    this.blockSetProperty = new EnumerationProperty( options.initialMode, {
      tandem: tandem.createTandem( 'blockSets' ).createTandem( 'blockSetProperty' )
    } );

    this.createMassesCallback = options.createMassesCallback;
    this.regenerateMassesCallback = options.regenerateMassesCallback;
    this.positionMassesCallback = options.positionMassesCallback;

    this.blockSetToMassesMap = new Map<BlockSetValue, Cuboid[]>();

    // Create and position masses on startup
    options.BlockSet.values.forEach( blockSet => {
      this.blockSetToMassesMap.set( blockSet, this.createMassesCallback( this, blockSet ) );

      // Make them invisible by default, they will be made visible when their blockSet is up
      this.blockSetToMassesMap.get( blockSet )!.forEach( mass => {
        mass.internalVisibleProperty.value = false;
        this.availableMasses.push( mass );
      } );

      this.positionMasses( blockSet );
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.blockSetProperty.link( ( blockSet, oldBlockSet ) => {
      if ( oldBlockSet ) {
        this.blockSetToMassesMap.get( oldBlockSet )!.forEach( mass => {
          mass.internalVisibleProperty.value = false;
        } );
      }
      this.blockSetToMassesMap.get( blockSet )!.forEach( mass => {
        mass.internalVisibleProperty.value = true;
      } );
    } );
  }

  /**
   * Positions masses.
   */
  private positionMasses( blockSet: BlockSetValue ): void {
    this.positionMassesCallback( this, blockSet, this.blockSetToMassesMap.get( blockSet )! );
  }

  /**
   * Regenerates the masses for a specific blockSet.
   */
  public regenerate( blockSet: BlockSetValue ): void {
    this.regenerateMassesCallback( this, blockSet, this.blockSetToMassesMap.get( blockSet )! );
    this.positionMasses( blockSet );
  }

  /**
   * Resets values to their original state
   */
  public override reset(): void {
    this.blockSetProperty.reset();

    // Reset every available mass.
    this.BlockSet.values.forEach( blockSet => this.blockSetToMassesMap.get( blockSet )!.forEach( mass => mass.reset() ) );

    super.reset();

    // Reposition AFTER the reset
    this.BlockSet.values.forEach( blockSet => this.positionMasses( blockSet ) );

    // Reset the previous positions on masses
    this.BlockSet.values.forEach( blockSet => this.blockSetToMassesMap.get( blockSet )!.forEach( mass => {
      this.engine.bodySynchronizePrevious( mass.body );
    } ) );

    // Rehandle visibility, since we reset them
    this.BlockSet.values.forEach( blockSet => this.blockSetToMassesMap.get( blockSet )!.forEach( mass => {
      mass.internalVisibleProperty.value = blockSet === this.blockSetProperty.value;
    } ) );
  }
}

densityBuoyancyCommon.register( 'BlockSetModel', BlockSetModel );
