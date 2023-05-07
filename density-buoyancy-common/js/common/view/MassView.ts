// Copyright 2019-2022, University of Colorado Boulder

/**
 * The base type for 3D views of any type of mass.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import NodeTexture from '../../../../mobius/js/NodeTexture.js';
import TextureQuad from '../../../../mobius/js/TextureQuad.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass, { MassTag } from '../model/Mass.js';
import Material from '../model/Material.js';
import DensityMaterials from './DensityMaterials.js';
import MassLabelNode from './MassLabelNode.js';
import MaterialView from './MaterialView.js';

const TAG_SIZE = 0.03;
export const TAG_OFFSET = 0.005;
const TAG_SCALE = 0.0005;

export default abstract class MassView extends THREE.Mesh {

  public readonly mass: Mass;
  public materialView: MaterialView;
  private readonly materialListener: ( material: Material ) => void;
  private readonly positionListener: () => void;

  private tagNodeTexture: NodeTexture | null;
  private readonly tagMesh: TextureQuad | null;
  private readonly massNameListener?: ( string: string ) => void;

  protected readonly tagHeight: number | null = null;
  protected readonly tagOffsetProperty: Property<Vector3> = new Property<Vector3>( Vector3.ZERO );

  protected constructor( mass: Mass, initialGeometry: THREE.BufferGeometry ) {
    const materialView = DensityMaterials.getMaterialView( mass.materialProperty.value );

    super( initialGeometry, materialView.material );

    this.mass = mass;
    this.materialView = materialView;

    this.material = materialView.material;

    this.materialListener = material => {
      this.materialView.dispose();
      this.materialView = DensityMaterials.getMaterialView( material );
      this.material = this.materialView.material;
    };
    this.mass.materialProperty.lazyLink( this.materialListener );

    this.positionListener = () => {
      const position = mass.matrix.translation;

      // LHS is NOT a Vector2, don't try to simplify this
      this.position.x = position.x;
      this.position.y = position.y;
    };

    this.mass.transformedEmitter.addListener( this.positionListener );
    this.positionListener();

    this.tagNodeTexture = null;
    this.tagMesh = null;

    if ( mass.tag === MassTag.PRIMARY ) {
      this.tagNodeTexture = MassLabelNode.getPrimaryTexture();
      this.tagMesh = new TextureQuad( this.tagNodeTexture, TAG_SIZE, TAG_SIZE, {
        depthTest: true
      } );
      this.tagHeight = TAG_SIZE;
    }
    else if ( mass.tag === MassTag.SECONDARY ) {
      this.tagNodeTexture = MassLabelNode.getSecondaryTexture();
      this.tagMesh = new TextureQuad( this.tagNodeTexture, TAG_SIZE, TAG_SIZE, {
        depthTest: true
      } );
      this.tagHeight = TAG_SIZE;
    }
    else if ( mass.tag !== MassTag.NONE ) {

      const string = mass.nameProperty.value;
      this.tagNodeTexture = MassLabelNode.getBasicLabelTexture( string );

      this.tagMesh = new TextureQuad( this.tagNodeTexture, TAG_SCALE * this.tagNodeTexture._width, TAG_SCALE * this.tagNodeTexture._height, {
        depthTest: true
      } );
      this.tagHeight = TAG_SCALE * this.tagNodeTexture._height;

      this.massNameListener = string => {
        this.tagNodeTexture!.dispose();
        this.tagNodeTexture = MassLabelNode.getBasicLabelTexture( string );
        this.tagMesh!.updateTexture( this.tagNodeTexture, TAG_SCALE * this.tagNodeTexture._width, TAG_SCALE * this.tagNodeTexture._height );
        this.tagMesh!.visible = string !== '';
      };
      this.mass.nameProperty.lazyLink( this.massNameListener );
    }

    if ( this.tagMesh ) {
      this.add( this.tagMesh );
      this.tagMesh.renderOrder = 1;

      this.tagOffsetProperty.link( offset => {
        this.tagMesh!.position.set( offset.x, offset.y, offset.z + 0.0001 );
      } );
    }
  }

  /**
   * Releases references.
   */
  public dispose(): void {
    this.mass.transformedEmitter.removeListener( this.positionListener );
    this.mass.materialProperty.unlink( this.materialListener );

    this.materialView.dispose();

    if ( this.massNameListener ) {
      this.mass.nameProperty.unlink( this.massNameListener );
    }

    this.tagNodeTexture && this.tagNodeTexture.dispose();
    this.tagMesh && this.tagMesh.dispose();

    // @ts-expect-error
    super.dispose && super.dispose();
  }
}

densityBuoyancyCommon.register( 'MassView', MassView );
