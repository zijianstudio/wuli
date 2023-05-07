// Copyright 2019-2022, University of Colorado Boulder

/**
 * The main model for the Applications screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Cube from '../../common/model/Cube.js';
import DensityBuoyancyModel, { DensityBuoyancyModelOptions } from '../../common/model/DensityBuoyancyModel.js';
import Material from '../../common/model/Material.js';
import Scale, { DisplayType } from '../../common/model/Scale.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Boat from './Boat.js';
import Bottle from './Bottle.js';

// constants
export class Scene extends EnumerationValue {
  public static readonly BOTTLE = new Scene();
  public static readonly BOAT = new Scene();

  public static readonly enumeration = new Enumeration( Scene, {
    phetioDocumentation: 'Bottle or boat scene'
  } );
}

export type BuoyancyApplicationsModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyApplicationsModel extends DensityBuoyancyModel {

  public readonly sceneProperty: Property<Scene>;
  public readonly densityExpandedProperty: Property<boolean>;

  public readonly bottle: Bottle;
  public readonly block: Cube;
  public override boat: Boat;
  public readonly rightScale: Scale;
  public readonly poolScale: Scale;

  public constructor( options: BuoyancyApplicationsModelOptions ) {

    const tandem = options.tandem;

    super( options );

    this.sceneProperty = new EnumerationProperty( Scene.BOTTLE );
    this.densityExpandedProperty = new BooleanProperty( false );

    this.bottle = new Bottle( this.engine, {
      matrix: Matrix3.translation( 0, 0 ),
      tandem: tandem.createTandem( 'bottle' ),
      visible: true
    } );
    this.availableMasses.push( this.bottle );

    this.block = Cube.createWithVolume( this.engine, Material.BRICK, new Vector2( 0.5, 0.5 ), 0.001, {
      visible: false,
      tandem: tandem.createTandem( 'block' )
    } );
    this.availableMasses.push( this.block );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.boat = new Boat( this.engine, new DerivedProperty( [ this.block.sizeProperty ], size => size.depth ), this.liquidMaterialProperty, {
      matrix: Matrix3.translation( 0, -0.1 ),
      tandem: tandem.createTandem( 'boat' ),
      visible: false
    } );
    this.availableMasses.push( this.boat );

    this.rightScale = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( 0.77, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      canMove: false,
      tandem: tandem.createTandem( 'rightScale' )
    } );
    this.availableMasses.push( this.rightScale );

    this.poolScale = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( 0.3, -Scale.SCALE_BASE_BOUNDS.minY + this.poolBounds.minY ),
      displayType: DisplayType.NEWTONS,
      canMove: false,
      tandem: tandem.createTandem( 'poolScale' )
    } );
    this.availableMasses.push( this.poolScale );

    // Adjust pool volume so that it's at the desired value WITH the pool scale inside.
    this.pool.liquidVolumeProperty.value -= this.poolScale.volumeProperty.value;
    this.pool.liquidVolumeProperty.setInitialValue( this.pool.liquidVolumeProperty.value );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.sceneProperty.link( scene => {
      this.bottle.internalVisibleProperty.value = scene === Scene.BOTTLE;
      this.boat.internalVisibleProperty.value = scene === Scene.BOAT;
      this.block.internalVisibleProperty.value = scene === Scene.BOAT;

      assert && assert( !this.boat.visibleProperty.value || !this.bottle.visibleProperty.value,
        'Boat and bottle should not be visible at the same time' );
    } );
  }

  public override step( dt: number ): void {
    assert && assert( !this.boat.visibleProperty.value || !this.bottle.visibleProperty.value,
      'Boat and bottle should not be visible at the same time' );

    super.step( dt );
  }

  /**
   * Moves the boat and block to their initial locations (see https://github.com/phetsims/buoyancy/issues/25)
   */
  public resetBoatScene(): void {
    // Reset the basin levels (clear the liquid out of the boat)
    this.boat.basin.reset();
    this.pool.reset();

    // Move things to the initial position
    this.boat.resetPosition();
    this.block.resetPosition();
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    this.densityExpandedProperty.reset();

    this.bottle.reset();
    this.block.reset();
    this.boat.reset();

    super.reset();

    this.sceneProperty.reset();

    assert && assert( !this.boat.visibleProperty.value || !this.bottle.visibleProperty.value,
      'Boat and bottle should not be visible at the same time' );
  }
}

densityBuoyancyCommon.register( 'BuoyancyApplicationsModel', BuoyancyApplicationsModel );
