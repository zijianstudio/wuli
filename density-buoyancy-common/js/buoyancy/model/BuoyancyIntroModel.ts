// Copyright 2022, University of Colorado Boulder

/**
 * The main model for the Intro screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import BlockSetModel, { BlockSetModelOptions } from '../../common/model/BlockSetModel.js';
import Cube from '../../common/model/Cube.js';
import Material from '../../common/model/Material.js';
import Scale, { DisplayType } from '../../common/model/Scale.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import { MassTag } from '../../common/model/Mass.js';

export class BlockSet extends EnumerationValue {
  public static readonly SAME_MASS = new BlockSet();
  public static readonly SAME_VOLUME = new BlockSet();
  public static readonly SAME_DENSITY = new BlockSet();

  public static readonly enumeration = new Enumeration( BlockSet, {
    phetioDocumentation: 'Block set'
  } );
}

export type BuoyancyIntroModelOptions = StrictOmit<BlockSetModelOptions<BlockSet>, 'initialMode' | 'BlockSet' | 'createMassesCallback' | 'regenerateMassesCallback' | 'positionMassesCallback'>;

export default class BuoyancyIntroModel extends BlockSetModel<BlockSet> {
  public constructor( providedOptions: BuoyancyIntroModelOptions ) {
    const tandem = providedOptions.tandem;

    const blockSetsTandem = tandem.createTandem( 'blockSets' );
    const sameMassTandem = blockSetsTandem.createTandem( 'sameMass' );
    const sameVolumeTandem = blockSetsTandem.createTandem( 'sameVolume' );
    const sameDensityTandem = blockSetsTandem.createTandem( 'sameDensity' );

    const options = optionize<BuoyancyIntroModelOptions, EmptySelfOptions, BlockSetModelOptions<BlockSet>>()( {
      initialMode: BlockSet.SAME_MASS,
      BlockSet: BlockSet.enumeration,

      createMassesCallback: ( model, blockSet ) => {
        switch( blockSet ) {
          case BlockSet.SAME_MASS:
            return [
              Cube.createWithMass( model.engine, Material.WOOD, Vector2.ZERO, 5, {
                tandem: sameMassTandem.createTandem( 'blockA' ),
                adjustableMaterial: true,
                tag: MassTag.ONE_A
              } ),
              Cube.createWithMass( model.engine, Material.BRICK, Vector2.ZERO, 5, {
                tandem: sameMassTandem.createTandem( 'blockB' ),
                adjustableMaterial: true,
                tag: MassTag.ONE_B
              } )
            ];
          case BlockSet.SAME_VOLUME:
            return [
              Cube.createWithVolume( model.engine, Material.WOOD, Vector2.ZERO, 0.005, {
                tandem: sameVolumeTandem.createTandem( 'blockA' ),
                adjustableMaterial: true,
                tag: MassTag.TWO_A
              } ),
              Cube.createWithVolume( model.engine, Material.BRICK, Vector2.ZERO, 0.005, {
                tandem: sameVolumeTandem.createTandem( 'blockB' ),
                adjustableMaterial: true,
                tag: MassTag.TWO_B
              } )
            ];
          case BlockSet.SAME_DENSITY:
            return [
              Cube.createWithMass( model.engine, Material.WOOD, Vector2.ZERO, 2, {
                tandem: sameDensityTandem.createTandem( 'blockA' ),
                adjustableMaterial: true,
                tag: MassTag.THREE_A
              } ),
              Cube.createWithMass( model.engine, Material.WOOD, Vector2.ZERO, 4, {
                tandem: sameDensityTandem.createTandem( 'blockB' ),
                adjustableMaterial: true,
                tag: MassTag.THREE_B
              } )
            ];
          default:
            throw new Error( `unknown blockSet: ${blockSet}` );
        }
      },

      regenerateMassesCallback: ( model, blockSet, masses ) => {
        // See subclass for implementation
      },

      positionMassesCallback: ( model, blockSet, masses ) => {
        switch( blockSet ) {
          case BlockSet.SAME_MASS:
            model.positionMassesLeft( [ masses[ 0 ] ] );
            model.positionMassesRight( [ masses[ 1 ] ] );
            break;
          case BlockSet.SAME_VOLUME:
            model.positionMassesLeft( [ masses[ 0 ] ] );
            model.positionMassesRight( [ masses[ 1 ] ] );
            break;
          case BlockSet.SAME_DENSITY:
            model.positionMassesLeft( [ masses[ 0 ] ] );
            model.positionMassesRight( [ masses[ 1 ] ] );
            break;
          default:
            throw new Error( `unknown blockSet: ${blockSet}` );
        }
      }
    }, providedOptions );

    super( options );

    // Left scale
    this.availableMasses.push( new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( -0.77, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      canMove: true,
      tandem: providedOptions.tandem.createTandem( 'leftScale' )
    } ) );

    // Pool scale
    const poolScale = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( 0.3, -Scale.SCALE_BASE_BOUNDS.minY + this.poolBounds.minY ),
      displayType: DisplayType.NEWTONS,
      canMove: true,
      tandem: providedOptions.tandem.createTandem( 'poolScale' )
    } );
    this.availableMasses.push( poolScale );

    // Adjust pool volume so that it's at the desired value WITH the pool scale inside.
    this.pool.liquidVolumeProperty.value -= poolScale.volumeProperty.value;
    this.pool.liquidVolumeProperty.setInitialValue( this.pool.liquidVolumeProperty.value );
  }
}

densityBuoyancyCommon.register( 'BuoyancyIntroModel', BuoyancyIntroModel );
