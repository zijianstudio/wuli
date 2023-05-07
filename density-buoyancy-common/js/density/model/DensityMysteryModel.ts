// Copyright 2020-2023, University of Colorado Boulder

/**
 * The main model for the Mystery screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import BlockSetModel, { BlockSetModelOptions } from '../../common/model/BlockSetModel.js';
import Cube, { CubeOptions } from '../../common/model/Cube.js';
import { MassTag } from '../../common/model/Mass.js';
import Material from '../../common/model/Material.js';
import Scale, { DisplayType } from '../../common/model/Scale.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import Cuboid from '../../common/model/Cuboid.js';
import Property from '../../../../axon/js/Property.js';

// constants
const randomMaterials = DensityBuoyancyCommonConstants.DENSITY_MYSTERY_MATERIALS;
const randomColors = [
  DensityBuoyancyCommonColors.compareYellowColorProperty,
  DensityBuoyancyCommonColors.compareBlueColorProperty,
  DensityBuoyancyCommonColors.compareGreenColorProperty,
  DensityBuoyancyCommonColors.compareRedColorProperty,
  DensityBuoyancyCommonColors.comparePurpleColorProperty,
  DensityBuoyancyCommonColors.mysteryPinkColorProperty,
  DensityBuoyancyCommonColors.mysteryOrangeColorProperty,
  DensityBuoyancyCommonColors.mysteryLightPurpleColorProperty,
  DensityBuoyancyCommonColors.mysteryLightGreenColorProperty,
  DensityBuoyancyCommonColors.mysteryBrownColorProperty,
  DensityBuoyancyCommonColors.mysteryWhiteColorProperty,
  DensityBuoyancyCommonColors.mysteryGrayColorProperty,
  DensityBuoyancyCommonColors.mysteryMustardColorProperty,
  DensityBuoyancyCommonColors.mysteryPeachColorProperty,
  DensityBuoyancyCommonColors.mysteryMaroonColorProperty
];

export class BlockSet extends EnumerationValue {
  public static readonly SET_1 = new BlockSet();
  public static readonly SET_2 = new BlockSet();
  public static readonly SET_3 = new BlockSet();
  public static readonly RANDOM = new BlockSet();

  public static readonly enumeration = new Enumeration( BlockSet, {
    phetioDocumentation: 'Block set'
  } );
}

export type DensityMysteryModelOptions = StrictOmit<BlockSetModelOptions<BlockSet>, 'initialMode' | 'BlockSet' | 'createMassesCallback' | 'regenerateMassesCallback' | 'positionMassesCallback'>;

export default class DensityMysteryModel extends BlockSetModel<BlockSet> {

  public readonly densityTableExpandedProperty: Property<boolean>;
  private readonly scale: Scale;

  public constructor( providedOptions: DensityMysteryModelOptions ) {

    const tandem = providedOptions.tandem;

    const minScreenVolume = 0.001 - 1e-7;
    const maxScreenVolume = 0.01 + 1e-7;

    const commonCubeOptions = {
      minVolume: minScreenVolume,
      maxVolume: maxScreenVolume,
      adjustVolumeOnMassChanged: true,
      adjustableMaterial: true
    };

    const createMysteryMaterials = () => {
      const densities = dotRandom.shuffle( randomMaterials ).slice( 0, 5 ).map( material => material.density );
      const colors = dotRandom.shuffle( randomColors ).slice( 0, 5 );

      return _.range( 0, 5 ).map( i => Material.createCustomMaterial( {
        density: densities[ i ],
        customColor: colors[ i ]
      } ) );
    };
    const createMysteryVolumes = () => {
      return [
        // we will want 3 smaller masses on the right, then 2 larger masses on the left
        ...dotRandom.shuffle( [ 1, 2, 3, 4, 5, 6 ].map( n => n / 1000 ) ).slice( 0, 3 ),
        ...dotRandom.shuffle( [ 7, 8, 9, 10 ].map( n => n / 1000 ) ).slice( 0, 2 )
      ].sort();
    };

    const blockSetsTandem = tandem.createTandem( 'blockSets' );
    const set1Tandem = blockSetsTandem.createTandem( 'set1' );
    const set2Tandem = blockSetsTandem.createTandem( 'set2' );
    const set3Tandem = blockSetsTandem.createTandem( 'set3' );
    const randomTandem = blockSetsTandem.createTandem( 'random' );

    const createMasses = ( model: DensityBuoyancyModel, blockSet: BlockSet ) => {
      switch( blockSet ) {
        case BlockSet.SET_1:
          return [
            Cube.createWithVolume(
              model.engine,
              Material.createCustomMaterial( {
                density: Material.WATER.density,
                customColor: DensityBuoyancyCommonColors.compareRedColorProperty
              } ),
              Vector2.ZERO,
              0.005,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.ONE_D, tandem: set1Tandem.createTandem( 'block1D' ) } )
            ),

            Cube.createWithVolume(
              model.engine,
              Material.createCustomMaterial( {
                density: Material.WOOD.density,
                customColor: DensityBuoyancyCommonColors.compareBlueColorProperty
              } ),
              Vector2.ZERO,
              0.001,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.ONE_B, tandem: set1Tandem.createTandem( 'block1B' ) } )
            ),

            Cube.createWithVolume(
              model.engine,
              Material.createCustomMaterial( {
                density: Material.WOOD.density,
                customColor: DensityBuoyancyCommonColors.compareGreenColorProperty
              } ),
              Vector2.ZERO,
              0.007,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.ONE_E, tandem: set1Tandem.createTandem( 'block1E' ) } )
            ),

            Cube.createWithVolume(
              model.engine,
              Material.createCustomMaterial( {
                density: Material.GOLD.density,
                customColor: DensityBuoyancyCommonColors.compareYellowColorProperty
              } ),
              Vector2.ZERO,
              0.001,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.ONE_C, tandem: set1Tandem.createTandem( 'block1C' ) } )
            ),

            Cube.createWithVolume(
              model.engine,
              Material.createCustomMaterial( {
                density: Material.DIAMOND.density,
                customColor: DensityBuoyancyCommonColors.comparePurpleColorProperty
              } ),
              Vector2.ZERO,
              0.0055,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.ONE_A, tandem: set1Tandem.createTandem( 'block1A' ) } )
            )
          ];
        case BlockSet.SET_2:
          return [
            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( {
                density: 4500,
                customColor: DensityBuoyancyCommonColors.mysteryPinkColorProperty
              } ),
              Vector2.ZERO,
              18,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.TWO_D, tandem: set2Tandem.createTandem( 'block2D' ) } )
            ),

            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( {
                density: 11340,
                customColor: DensityBuoyancyCommonColors.mysteryOrangeColorProperty
              } ),
              Vector2.ZERO,
              18,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.TWO_A, tandem: set2Tandem.createTandem( 'block2A' ) } )
            ),

            Cube.createWithVolume(
              model.engine,
              Material.createCustomMaterial( {
                density: Material.COPPER.density,
                customColor: DensityBuoyancyCommonColors.mysteryLightPurpleColorProperty
              } ),
              Vector2.ZERO,
              0.005,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.TWO_E, tandem: set2Tandem.createTandem( 'block2E' ) } )
            ),

            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( {
                density: 2700,
                customColor: DensityBuoyancyCommonColors.mysteryLightGreenColorProperty
              } ),
              Vector2.ZERO,
              2.7,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.TWO_C, tandem: set2Tandem.createTandem( 'block2C' ) } )
            ),

            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( {
                density: 2700,
                customColor: DensityBuoyancyCommonColors.mysteryBrownColorProperty
              } ),
              Vector2.ZERO,
              10.8,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.TWO_B, tandem: set2Tandem.createTandem( 'block2B' ) } )
            )
          ];
        case BlockSet.SET_3:
          return [
            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( {
                density: 950,
                customColor: DensityBuoyancyCommonColors.mysteryWhiteColorProperty
              } ),
              Vector2.ZERO,
              6,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.THREE_E, tandem: set3Tandem.createTandem( 'block3E' ) } )
            ),

            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( {
                density: 1000,
                customColor: DensityBuoyancyCommonColors.mysteryGrayColorProperty
              } ),
              Vector2.ZERO,
              6,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.THREE_B, tandem: set3Tandem.createTandem( 'block3B' ) } )
            ),

            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( {
                density: 400,
                customColor: DensityBuoyancyCommonColors.mysteryMustardColorProperty
              } ),
              Vector2.ZERO,
              2,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.THREE_D, tandem: set3Tandem.createTandem( 'block3D' ) } )
            ),

            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( {
                density: 7800,
                customColor: DensityBuoyancyCommonColors.mysteryPeachColorProperty
              } ),
              Vector2.ZERO,
              23.4,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.THREE_C, tandem: set3Tandem.createTandem( 'block3C' ) } )
            ),

            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( {
                density: 950,
                customColor: DensityBuoyancyCommonColors.mysteryMaroonColorProperty
              } ),
              Vector2.ZERO,
              2.85,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.THREE_A, tandem: set3Tandem.createTandem( 'block3A' ) } )
            )
          ];
        case BlockSet.RANDOM: {
          const tags = [
            MassTag.C,
            MassTag.D,
            MassTag.E,
            MassTag.A,
            MassTag.B
          ];

          const mysteryMaterials = createMysteryMaterials();
          const mysteryVolumes = createMysteryVolumes();

          return _.range( 0, 5 ).map( i => {
            return Cube.createWithVolume( model.engine, mysteryMaterials[ i ], Vector2.ZERO, mysteryVolumes[ i ], {
              adjustVolumeOnMassChanged: true,
              adjustableMaterial: true,
              tag: tags[ i ],
              tandem: randomTandem.createTandem( `block${tags[ i ].name}` ),
              minVolume: minScreenVolume,
              maxVolume: maxScreenVolume
            } );
          } );
        }
        default:
          throw new Error( `unknown blockSet: ${blockSet}` );
      }
    };

    const regenerateMasses = ( model: DensityBuoyancyModel, blockSet: BlockSet, masses: Cuboid[] ) => {
      if ( blockSet === BlockSet.RANDOM ) {
        const mysteryMaterials = createMysteryMaterials();
        const mysteryVolumes = createMysteryVolumes();

        masses.forEach( ( mass, i ) => {
          mass.materialProperty.value = mysteryMaterials[ i ];
          mass.updateSize( Cube.boundsFromVolume( mysteryVolumes[ i ] ) );
        } );
      }
    };

    const positionMasses = ( model: DensityBuoyancyModel, blockSet: BlockSet, masses: Cuboid[] ) => {
      switch( blockSet ) {
        case BlockSet.SET_1:
          model.positionStackLeft( [ masses[ 1 ], masses[ 4 ] ] );
          model.positionStackRight( [ masses[ 2 ], masses[ 3 ], masses[ 0 ] ] );
          break;
        case BlockSet.SET_2:
          model.positionStackLeft( [ masses[ 1 ], masses[ 4 ] ] );
          model.positionStackRight( [ masses[ 2 ], masses[ 3 ], masses[ 0 ] ] );
          break;
        case BlockSet.SET_3:
          model.positionStackLeft( [ masses[ 1 ], masses[ 4 ] ] );
          model.positionStackRight( [ masses[ 2 ], masses[ 3 ], masses[ 0 ] ] );
          break;
        case BlockSet.RANDOM:
          model.positionStackLeft( [ masses[ 3 ], masses[ 4 ] ] );
          model.positionStackRight( [ masses[ 0 ], masses[ 1 ], masses[ 2 ] ] );
          break;
        default:
          throw new Error( `unknown blockSet: ${blockSet}` );
      }
    };

    super( optionize<DensityMysteryModelOptions, EmptySelfOptions, BlockSetModelOptions<BlockSet>>()( {
      canShowForces: false,

      // TODO: How can this type-check if I leave these out?!? --- oh we're expecting them in our providedOptions?
      initialMode: BlockSet.SET_1,
      BlockSet: BlockSet.enumeration,

      // TODO: overridden (abstract) methods instead
      createMassesCallback: createMasses,
      regenerateMassesCallback: regenerateMasses,
      positionMassesCallback: positionMasses
    }, providedOptions ) );

    this.densityTableExpandedProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'densityTableExpandedProperty' )
    } );

    const scalePositionProperty = new DerivedProperty( [ this.invisibleBarrierBoundsProperty ], bounds => {
      return new Vector2( -0.75 + bounds.minX + 0.875, -Scale.SCALE_BASE_BOUNDS.minY );
    } );

    this.scale = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translationFromVector( scalePositionProperty.value ),
      displayType: DisplayType.KILOGRAMS,
      canMove: false,
      tandem: tandem.createTandem( 'scale' )
    } );
    this.availableMasses.push( this.scale );

    // Move the scale with the barrier, see https://github.com/phetsims/density/issues/73
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    scalePositionProperty.lazyLink( position => {
      this.scale.matrix.set02( position.x );
      this.scale.matrix.set12( position.y );
      this.scale.writeData();

      // When we reset-all, we'll want it to move back to here
      this.scale.setResetLocation();

      // Adjust its previous position also
      this.engine.bodySynchronizePrevious( this.scale.body );

      this.scale.transformedEmitter.emit();
    } );

    this.uninterpolateMasses();
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    this.densityTableExpandedProperty.reset();

    super.reset();

    // Make sure to create new random masses on a reset
    this.regenerate( BlockSet.RANDOM );

    this.uninterpolateMasses();
  }
}

densityBuoyancyCommon.register( 'DensityMysteryModel', DensityMysteryModel );
