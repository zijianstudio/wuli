// Copyright 2019-2022, University of Colorado Boulder

/**
 * The main model for the Explore screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Cube from '../../common/model/Cube.js';
import DensityBuoyancyModel, { DensityBuoyancyModelOptions } from '../../common/model/DensityBuoyancyModel.js';
import { MassTag } from '../../common/model/Mass.js';
import Material from '../../common/model/Material.js';
import Scale, { DisplayType } from '../../common/model/Scale.js';
import TwoBlockMode from '../../common/model/TwoBlockMode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

export type BuoyancyExploreModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyExploreModel extends DensityBuoyancyModel {

  public readonly modeProperty: Property<TwoBlockMode>;
  public readonly primaryMass: Cube;
  public readonly secondaryMass: Cube;
  public readonly densityExpandedProperty: Property<boolean>;

  public constructor( options: BuoyancyExploreModelOptions ) {

    const tandem = options.tandem;

    super( options );

    this.modeProperty = new EnumerationProperty( TwoBlockMode.ONE_BLOCK, {
      tandem: tandem.createTandem( 'modeProperty' )
    } );

    const blocksTandem = tandem.createTandem( 'blocks' );

    this.primaryMass = Cube.createWithMass( this.engine, Material.WOOD, new Vector2( -0.2, 0.2 ), 2, {
      tag: MassTag.PRIMARY,
      tandem: blocksTandem.createTandem( 'blockA' )
    } );
    this.availableMasses.push( this.primaryMass );
    this.secondaryMass = Cube.createWithMass( this.engine, Material.ALUMINUM, new Vector2( 0.05, 0.35 ), 13.5, {
      tag: MassTag.SECONDARY,
      tandem: blocksTandem.createTandem( 'blockB' ),
      visible: false
    } );
    this.availableMasses.push( this.secondaryMass );

    this.modeProperty.link( mode => {
      this.secondaryMass.internalVisibleProperty.value = mode === TwoBlockMode.TWO_BLOCKS;
    } );

    // Left scale
    this.availableMasses.push( new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( -0.65, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      tandem: tandem.createTandem( 'leftScale' ),
      canMove: true
    } ) );

    // Pool scale
    const poolScale = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( 0.3, -Scale.SCALE_BASE_BOUNDS.minY + this.poolBounds.minY ),
      displayType: DisplayType.NEWTONS,
      tandem: tandem.createTandem( 'poolScale' ),
      canMove: true
    } );
    this.availableMasses.push( poolScale );

    // Adjust pool volume so that it's at the desired value WITH the pool scale inside.
    this.pool.liquidVolumeProperty.value -= poolScale.volumeProperty.value;
    this.pool.liquidVolumeProperty.setInitialValue( this.pool.liquidVolumeProperty.value );

    this.densityExpandedProperty = new BooleanProperty( false );
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    this.modeProperty.reset();

    this.primaryMass.reset();
    this.secondaryMass.reset();

    this.densityExpandedProperty.reset();

    super.reset();
  }
}

densityBuoyancyCommon.register( 'BuoyancyExploreModel', BuoyancyExploreModel );
