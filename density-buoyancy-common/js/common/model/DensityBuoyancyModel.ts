// Copyright 2019-2023, University of Colorado Boulder

/**
 * The core model for the Density and Buoyancy sim screens, including a pool and masses.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';
import Gravity from './Gravity.js';
import Material from './Material.js';
import P2Engine from './P2Engine.js';
import Pool from './Pool.js';
import Scale from './Scale.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Boat from '../../buoyancy/model/Boat.js';
import PhysicsEngine, { PhysicsEngineBody } from './PhysicsEngine.js';
import Mass from './Mass.js';
import Basin from './Basin.js';
import Cuboid from './Cuboid.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import TRangedProperty from '../../../../axon/js/TRangedProperty.js';
import TModel from '../../../../joist/js/TModel.js';

// constants
const BLOCK_SPACING = 0.01;
const POOL_VOLUME = 0.15;
const POOL_WIDTH = 0.9;
const POOL_DEPTH = 0.4;
const POOL_HEIGHT = POOL_VOLUME / POOL_WIDTH / POOL_DEPTH;
const GROUND_FRONT_Z = POOL_DEPTH / 2;
const POOL_BACK_Z = -POOL_DEPTH / 2;

export type DensityBuoyancyModelOptions = {
  showMassesDefault?: boolean;
  canShowForces?: boolean;
  initialForceScale?: number;
  tandem: Tandem;
};

export default class DensityBuoyancyModel implements TModel {

  public readonly showGravityForceProperty: Property<boolean>;
  public readonly showBuoyancyForceProperty: Property<boolean>;
  public readonly showContactForceProperty: Property<boolean>;
  public readonly showForceValuesProperty: Property<boolean>;
  public readonly forceScaleProperty: TRangedProperty;
  public readonly showMassesProperty: Property<boolean>;
  public readonly gravityProperty: Property<Gravity>;
  public readonly liquidMaterialProperty: Property<Material>;
  public readonly liquidDensityProperty: TReadOnlyProperty<number>;
  public readonly liquidViscosityProperty: TReadOnlyProperty<number>;

  public readonly poolBounds: Bounds3;
  public readonly groundBounds: Bounds3;
  public readonly groundPoints: Vector2[];

  // We'll keep blocks within these bounds, to generally stay in-screen. This may be
  // adjusted by the screen based on the visibleBoundsProperty. These are sensible defaults, with the minX and minY
  // somewhat meant to be adjusted.
  public readonly invisibleBarrierBoundsProperty: Property<Bounds3>;

  public readonly masses: ObservableArray<Mass>;
  public readonly pool: Pool;
  public readonly engine: PhysicsEngine;
  public readonly groundBody: PhysicsEngineBody;
  public barrierBody: PhysicsEngineBody;
  public readonly availableMasses: ObservableArray<Mass>;

  // We need to hook into a boat (if it exists) for displaying the water.
  public boat: Boat | null;

  public constructor( providedOptions?: DensityBuoyancyModelOptions ) {
    const options = optionize<DensityBuoyancyModelOptions, DensityBuoyancyModelOptions>()( {
      showMassesDefault: false,
      canShowForces: true,
      initialForceScale: 1 / 16
    }, providedOptions );

    const tandem = options.tandem;

    this.showGravityForceProperty = new BooleanProperty( false, {
      tandem: options.canShowForces ? tandem.createTandem( 'showGravityForceProperty' ) : Tandem.OPT_OUT
    } );
    this.showBuoyancyForceProperty = new BooleanProperty( false, {
      tandem: options.canShowForces ? tandem.createTandem( 'showBuoyancyForceProperty' ) : Tandem.OPT_OUT
    } );
    this.showContactForceProperty = new BooleanProperty( false, {
      tandem: options.canShowForces ? tandem.createTandem( 'showContactForceProperty' ) : Tandem.OPT_OUT
    } );
    this.showForceValuesProperty = new BooleanProperty( false, {
      tandem: options.canShowForces ? tandem.createTandem( 'showForceValuesProperty' ) : Tandem.OPT_OUT
    } );
    this.showMassesProperty = new BooleanProperty( options.showMassesDefault, {
      tandem: tandem.createTandem( 'showMassesProperty' ),
      phetioDocumentation: 'Displays a mass readout on each object'
    } );
    this.forceScaleProperty = new NumberProperty( options.initialForceScale, {
      tandem: options.canShowForces ? tandem.createTandem( 'vectorScaleProperty' ) : Tandem.OPT_OUT,
      range: new Range( Math.pow( 0.5, 9 ), 1 )
    } );

    this.gravityProperty = new Property( Gravity.EARTH, {
      valueType: Gravity,
      phetioValueType: Gravity.GravityIO,
      tandem: tandem.createTandem( 'gravityProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'The acceleration due to gravity applied to all masses, (may be potentially custom or hidden from view)'
    } );

    this.liquidMaterialProperty = new Property( Material.WATER, {
      valueType: Material,
      phetioValueType: Material.MaterialIO,
      tandem: tandem.createTandem( 'liquidMaterialProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'The material of the liquid in the pool'
    } );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.liquidDensityProperty = new DerivedProperty( [ this.liquidMaterialProperty ], liquidMaterial => liquidMaterial.density, {
      tandem: tandem.createTandem( 'liquidDensityProperty' ),
      phetioValueType: NumberIO,
      units: 'kg/m^3'
    } );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.liquidViscosityProperty = new DerivedProperty( [ this.liquidMaterialProperty ], liquidMaterial => liquidMaterial.viscosity, {
      tandem: tandem.createTandem( 'liquidViscosityProperty' ),
      phetioValueType: NumberIO,
      units: 'Pa\u00b7s'
    } );

    this.poolBounds = new Bounds3(
      -POOL_WIDTH / 2, -POOL_HEIGHT, POOL_BACK_Z,
      POOL_WIDTH / 2, 0, GROUND_FRONT_Z
    );
    this.groundBounds = new Bounds3(
      -10, -10, -2,
      10, 0, GROUND_FRONT_Z
    );

    this.invisibleBarrierBoundsProperty = new Property( new Bounds3(
      -0.875, -4, POOL_BACK_Z,
      0.875, 4, GROUND_FRONT_Z
    ), {
      valueComparisonStrategy: 'equalsFunction'
    } );

    // How many units the barrier extends out to
    const barrierSize = 5;

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    const barrierPointsProperty = new DerivedProperty( [ this.invisibleBarrierBoundsProperty ], bounds => {
      return [
        new Vector2( bounds.maxX, bounds.minY ),
        new Vector2( bounds.maxX + barrierSize, bounds.minY ),
        new Vector2( bounds.maxX + barrierSize, bounds.maxY + barrierSize ),
        new Vector2( bounds.minX - barrierSize, bounds.maxY + barrierSize ),
        new Vector2( bounds.minX - barrierSize, bounds.minY ),
        new Vector2( bounds.minX, bounds.minY ),
        new Vector2( bounds.minX, bounds.maxY ),
        new Vector2( bounds.maxX, bounds.maxY )
      ];
    } );

    if ( DensityBuoyancyCommonQueryParameters.poolWidthMultiplier !== 1 ) {
      const halfX = DensityBuoyancyCommonQueryParameters.poolWidthMultiplier * 0.45;
      const halfZ = POOL_VOLUME / ( 2 * halfX * POOL_HEIGHT * 2 );
      this.poolBounds = new Bounds3(
        -halfX, -POOL_HEIGHT, -halfZ,
        halfX, 0, halfZ
      );
      this.groundBounds = new Bounds3(
        -10, -10, -2,
        10, 0, halfZ
      );
    }

    this.groundPoints = [
      new Vector2( this.groundBounds.minX, this.groundBounds.minY ),
      new Vector2( this.groundBounds.maxX, this.groundBounds.minY ),
      new Vector2( this.groundBounds.maxX, this.groundBounds.maxY ),
      new Vector2( this.poolBounds.maxX, this.poolBounds.maxY ),
      new Vector2( this.poolBounds.maxX, this.poolBounds.minY ),
      new Vector2( this.poolBounds.minX, this.poolBounds.minY ),
      new Vector2( this.poolBounds.minX, this.poolBounds.maxY ),
      new Vector2( this.groundBounds.minX, this.groundBounds.maxY )
    ];

    this.pool = new Pool( this.poolBounds, {
      tandem: tandem.createTandem( 'pool' )
    } );

    this.boat = null;
    this.engine = new P2Engine();

    this.groundBody = this.engine.createGround( this.groundPoints );
    this.engine.addBody( this.groundBody );

    this.barrierBody = this.engine.createBarrier( barrierPointsProperty.value );
    this.engine.addBody( this.barrierBody );

    // Update the barrier shape as needed (full recreation for now)
    barrierPointsProperty.lazyLink( points => {
      this.engine.removeBody( this.barrierBody );
      this.barrierBody = this.engine.createBarrier( points );
      this.engine.addBody( this.barrierBody );
    } );

    this.availableMasses = createObservableArray();

    // Control masses by visibility, so that this.masses will be the subset of this.availableMasses that is visible
    const visibilityListenerMap = new Map<Mass, ( visible: boolean ) => void>(); // eslint-disable-line no-spaced-func
    this.availableMasses.addItemAddedListener( mass => {
      const visibilityListener = ( visible: boolean ) => {
        if ( visible ) {
          this.masses.push( mass );
        }
        else {
          this.masses.remove( mass );
        }
      };
      visibilityListenerMap.set( mass, visibilityListener );
      mass.visibleProperty.lazyLink( visibilityListener );

      if ( mass.visibleProperty.value ) {
        this.masses.push( mass );
      }
    } );
    this.availableMasses.addItemRemovedListener( mass => {
      mass.visibleProperty.unlink( visibilityListenerMap.get( mass )! );
      visibilityListenerMap.delete( mass );

      if ( mass.visibleProperty.value ) {
        this.masses.remove( mass );
      }
    } );

    this.masses = createObservableArray();
    this.masses.addItemAddedListener( mass => {
      this.engine.addBody( mass.body );
    } );
    this.masses.addItemRemovedListener( mass => {
      this.engine.removeBody( mass.body );
      mass.interruptedEmitter.emit();
    } );

    let boatVerticalVelocity = 0;
    let boatVerticalAcceleration = 0;

    // The main engine post-step actions, that will determine the net forces applied on each mass.
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.engine.addPostStepListener( dt => {
      this.updateLiquid();

      // {number}
      const gravity = this.gravityProperty.value.value;

      const boat = this.getBoat();

      if ( boat && dt ) {
        const nextBoatVerticalVelocity = this.engine.bodyGetVelocity( boat.body ).y;
        boatVerticalAcceleration = ( nextBoatVerticalVelocity - boatVerticalVelocity ) / dt;
        boatVerticalVelocity = nextBoatVerticalVelocity;
      }

      // Will set the force Properties for all of the masses
      this.masses.forEach( mass => {
        let contactForce = this.engine.bodyGetContactForces( mass.body );

        // p2.js will report bad forces for static scales, so we need to zero these out
        if ( !contactForce.isFinite() ) {
          contactForce = Vector2.ZERO;
        }

        this.engine.resetContactForces( mass.body );
        mass.contactForceInterpolatedProperty.setNextValue( contactForce );

        if ( mass instanceof Scale ) {
          let scaleForce = 0;
          this.masses.forEach( otherMass => {
            if ( mass !== otherMass ) {
              const verticalForce = this.engine.bodyGetContactForceBetween( mass.body, otherMass.body ).y;
              if ( verticalForce > 0 ) {
                scaleForce += verticalForce;
              }
            }
          } );
          mass.scaleForceInterpolatedProperty.setNextValue( scaleForce );
        }

        const velocity = this.engine.bodyGetVelocity( mass.body );

        // Limit velocity, so things converge faster.
        if ( velocity.magnitude > 5 ) {
          velocity.setMagnitude( 5 );
          this.engine.bodySetVelocity( mass.body, velocity );
        }

        const basin = mass.containingBasin;
        const submergedVolume = basin ? mass.getDisplacedVolume( basin.liquidYInterpolatedProperty.currentValue ) : 0;
        if ( submergedVolume ) {
          const displacedMass = submergedVolume * this.liquidDensityProperty.value;
          // Vertical acceleration of the boat will change the buoyant force.
          const acceleration = gravity + ( ( boat && basin === boat.basin ) ? boatVerticalAcceleration : 0 );
          const buoyantForce = new Vector2( 0, displacedMass * acceleration );
          this.engine.bodyApplyForce( mass.body, buoyantForce );
          mass.buoyancyForceInterpolatedProperty.setNextValue( buoyantForce );

          // If the boat is moving, assume the liquid moves with it, and apply viscosity due to the movement of our mass
          // inside the boat's liquid.
          if ( boat && basin === boat.basin ) {
            velocity.subtract( this.engine.bodyGetVelocity( boat.body ) );
          }

          // Increase the generally-visible viscosity effect
          const ratioSubmerged =
            ( 1 - DensityBuoyancyCommonQueryParameters.viscositySubmergedRatio ) +
            DensityBuoyancyCommonQueryParameters.viscositySubmergedRatio * submergedVolume / mass.volumeProperty.value;
          const hackedViscosity = this.liquidViscosityProperty.value ? 0.03 * Math.pow( this.liquidViscosityProperty.value / 0.03, 0.8 ) : 0;
          const viscosityMass = Math.max( DensityBuoyancyCommonQueryParameters.viscosityMassCutoff, mass.massProperty.value );
          const viscousForce = velocity.times( -hackedViscosity * viscosityMass * ratioSubmerged * 3000 * DensityBuoyancyCommonQueryParameters.viscosityMultiplier );
          this.engine.bodyApplyForce( mass.body, viscousForce );
        }
        else {
          mass.buoyancyForceInterpolatedProperty.setNextValue( Vector2.ZERO );
        }

        // Gravity
        const gravityForce = new Vector2( 0, -mass.massProperty.value * gravity );
        this.engine.bodyApplyForce( mass.body, gravityForce );
        mass.gravityForceInterpolatedProperty.setNextValue( gravityForce );
      } );
    } );
  }

  /**
   * Returns the boat (if there is one)
   */
  public getBoat(): Boat | null {
    return this.boat;
  }

  /**
   * Computes the heights of the main pool liquid (and optionally that of the boat)
   */
  private updateLiquid(): void {
    const boat = this.getBoat();

    const basins: Basin[] = [ this.pool ];
    if ( boat && boat.visibleProperty.value ) {
      basins.push( boat.basin );
      this.pool.childBasin = boat.basin;
    }
    else {
      this.pool.childBasin = null;
    }

    this.masses.forEach( mass => mass.updateStepInformation() );
    basins.forEach( basin => {
      basin.stepMasses = this.masses.filter( mass => basin.isMassInside( mass ) );
    } );

    let poolLiquidVolume = this.pool.liquidVolumeProperty.value;

    // May need to adjust volumes between the boat/pool if there is a boat
    if ( boat ) {
      if ( boat.visibleProperty.value ) {
        let boatLiquidVolume = boat.basin.liquidVolumeProperty.value;

        const poolEmptyVolumeToBoatTop = this.pool.getEmptyVolume( Math.min( boat.stepTop, this.poolBounds.maxY ) );
        const boatEmptyVolumeToBoatTop = boat.basin.getEmptyVolume( boat.stepTop );

        const poolExcess = poolLiquidVolume - poolEmptyVolumeToBoatTop;
        const boatExcess = boatLiquidVolume - boatEmptyVolumeToBoatTop;

        if ( poolExcess > 0 && boatExcess < 0 ) {
          const transferVolume = Math.min( poolExcess, -boatExcess );
          poolLiquidVolume -= transferVolume;
          boatLiquidVolume += transferVolume;
        }
        else if ( boatExcess > 0 ) {
          // If the boat overflows, just dump the rest in the pool
          poolLiquidVolume += boatExcess;
          boatLiquidVolume -= boatExcess;
        }
        boat.basin.liquidVolumeProperty.value = boatLiquidVolume;
      }
      else {
        boat.basin.liquidVolumeProperty.value = 0;
      }
    }

    // Check to see if water "spilled" out of the pool, and set the finalized liquid volume
    this.pool.liquidVolumeProperty.value = Math.min( poolLiquidVolume, this.pool.getEmptyVolume( this.poolBounds.maxY ) );

    this.pool.computeY();
    if ( boat ) {
      boat.basin.computeY();
    }

    // If we have a boat that is NOT underwater, we'll assign masses into the boat's basin where relevant. Otherwise
    // anything will go just into the pool's basin.
    if ( boat && this.pool.liquidYInterpolatedProperty.currentValue < boat.basin.stepTop + 1e-7 ) {
      this.masses.forEach( mass => {
        mass.containingBasin = boat.basin.isMassInside( mass ) ? boat.basin : ( this.pool.isMassInside( mass ) ? this.pool : null );
      } );
    }
    else {
      this.masses.forEach( mass => {
        mass.containingBasin = this.pool.isMassInside( mass ) ? this.pool : null;
      } );
    }
  }

  /**
   * Resets things to their original values.
   */
  public reset(): void {
    this.showGravityForceProperty.reset();
    this.showBuoyancyForceProperty.reset();
    this.showContactForceProperty.reset();
    this.showMassesProperty.reset();
    this.showForceValuesProperty.reset();
    this.gravityProperty.reset();
    this.liquidMaterialProperty.reset();

    this.pool.reset();
    this.masses.forEach( mass => mass.reset() );
  }

  /**
   * Steps forward in time.
   */
  public step( dt: number ): void {
    this.engine.step( dt );

    this.masses.forEach( mass => {
      mass.step( dt, this.engine.interpolationRatio );
    } );

    this.pool.liquidYInterpolatedProperty.setRatio( this.engine.interpolationRatio );
  }

  /**
   * Moves masses' previous positions to their current positions.
   */
  public uninterpolateMasses(): void {
    this.masses.forEach( mass => this.engine.bodySynchronizePrevious( mass.body ) );
  }

  /**
   * Positions masses from the left of the pool outward, with padding
   */
  public positionMassesLeft( masses: Cuboid[] ): void {
    let position = this.poolBounds.minX;

    masses.forEach( mass => {
      mass.matrix.setToTranslation(
        position - BLOCK_SPACING - mass.sizeProperty.value.width / 2,
        -mass.sizeProperty.value.minY
      );
      position -= BLOCK_SPACING + mass.sizeProperty.value.width;
      mass.writeData();
      mass.transformedEmitter.emit();
    } );
  }

  /**
   * Positions masses from the right of the pool outward, with padding
   */
  public positionMassesRight( masses: Cuboid[] ): void {
    let position = this.poolBounds.maxX;

    masses.forEach( mass => {
      mass.matrix.setToTranslation(
        position + BLOCK_SPACING + mass.sizeProperty.value.width / 2,
        -mass.sizeProperty.value.minY
      );
      position += BLOCK_SPACING + mass.sizeProperty.value.width;
      mass.writeData();
      mass.transformedEmitter.emit();
    } );
  }

  /**
   * Positions masses from the left of the pool up
   */
  public positionStackLeft( masses: Cuboid[] ): void {
    const x = this.poolBounds.minX - BLOCK_SPACING - Math.max( ...masses.map( mass => mass.sizeProperty.value.width ) ) / 2;

    this.positionStack( masses, x );
  }

  /**
   * Positions masses from the right of the pool up
   */
  public positionStackRight( masses: Cuboid[] ): void {
    const x = this.poolBounds.maxX + BLOCK_SPACING + Math.max( ...masses.map( mass => mass.sizeProperty.value.width ) ) / 2;

    this.positionStack( masses, x );
  }

  /**
   * Position a stack of masses at a given center x.
   */
  protected positionStack( masses: Cuboid[], x: number ): void {
    let position = 0;

    masses = _.sortBy( masses, mass => -mass.volumeProperty.value );

    masses.forEach( mass => {
      mass.matrix.setToTranslation( x, position + mass.sizeProperty.value.height / 2 );
      position += mass.sizeProperty.value.height;
      mass.writeData();
      this.engine.bodySynchronizePrevious( mass.body );
      mass.transformedEmitter.emit();
    } );
  }
}

densityBuoyancyCommon.register( 'DensityBuoyancyModel', DensityBuoyancyModel );
