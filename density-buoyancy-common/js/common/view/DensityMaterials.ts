// Copyright 2019-2022, University of Colorado Boulder

/**
 * Provides factory methods for creating MaterialViews for various Materials.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import { Color } from '../../../../scenery/js/imports.js';
import Bricks25_AO_jpg from '../../../images/Bricks25_AO_jpg.js';
import Bricks25_col_jpg from '../../../images/Bricks25_col_jpg.js';
import Bricks25_nrm_jpg from '../../../images/Bricks25_nrm_jpg.js';
import DiamondPlate01_col_jpg from '../../../images/DiamondPlate01_col_jpg.js';
import DiamondPlate01_met_jpg from '../../../images/DiamondPlate01_met_jpg.js';
import DiamondPlate01_nrm_jpg from '../../../images/DiamondPlate01_nrm_jpg.js';
import DiamondPlate01_rgh_jpg from '../../../images/DiamondPlate01_rgh_jpg.js';
import Ice01_alpha_jpg from '../../../images/Ice01_alpha_jpg.js';
import Ice01_col_jpg from '../../../images/Ice01_col_jpg.js';
import Ice01_nrm_jpg from '../../../images/Ice01_nrm_jpg.js';
import Metal08_col_jpg from '../../../images/Metal08_col_jpg.js';
import Metal08_met_jpg from '../../../images/Metal08_met_jpg.js';
import Metal08_nrm_jpg from '../../../images/Metal08_nrm_jpg.js';
import Metal08_rgh_jpg from '../../../images/Metal08_rgh_jpg.js';
import Metal10_col_brightened_jpg from '../../../images/Metal10_col_brightened_jpg.js';
import Metal10_col_jpg from '../../../images/Metal10_col_jpg.js';
import Metal10_met_jpg from '../../../images/Metal10_met_jpg.js';
import Metal10_nrm_jpg from '../../../images/Metal10_nrm_jpg.js';
import Metal10_rgh_jpg from '../../../images/Metal10_rgh_jpg.js';
import Styrofoam_001_AO_jpg from '../../../images/Styrofoam_001_AO_jpg.js';
import Styrofoam_001_col_jpg from '../../../images/Styrofoam_001_col_jpg.js';
import Styrofoam_001_nrm_jpg from '../../../images/Styrofoam_001_nrm_jpg.js';
import Styrofoam_001_rgh_jpg from '../../../images/Styrofoam_001_rgh_jpg.js';
import Wood26_col_jpg from '../../../images/Wood26_col_jpg.js';
import Wood26_nrm_jpg from '../../../images/Wood26_nrm_jpg.js';
import Wood26_rgh_jpg from '../../../images/Wood26_rgh_jpg.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Material from '../model/Material.js';
import MaterialView from './MaterialView.js';

// constants

function toWrappedTexture( image: HTMLImageElement ): THREE.Texture {
  const texture = ThreeUtils.imageToTexture( image, true );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Simplified environment map to give a nice reflective appearance. We compute it per-pixel
let envMapTexture: THREE.CanvasTexture | null = null;

function getEnvironmentTexture(): THREE.CanvasTexture {
  const size = 32;
  if ( !envMapTexture ) {
    const canvas = document.createElement( 'canvas' );
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext( '2d' )!;

    const imageData = context.getImageData( 0, 0, size, size );

    // For each pixel
    for ( let i = 0; i < 32 * 32; i++ ) {
      const index = i * 4;

      // Determine spherical coordinates for the equirectangular mapping
      const theta = ( i % size ) / size * Math.PI * 2;
      const phi = Math.PI * ( 0.5 - Math.floor( i / size ) / ( size - 1 ) );

      // Get a euclidean vector
      const v = new Vector3(
        -Math.cos( phi ) * Math.cos( theta ),
        Math.sin( phi ),
        Math.cos( phi ) * Math.sin( theta )
      );

      // Our light direction
      const light = new Vector3( -1 / 2, 1.5, 0.8 / 2 );

      // Front/top lighting + light
      const value = v.y > 0 || v.z < 0 ? 1 : v.dot( light ) / 2;

      imageData.data[ index + 0 ] = Utils.clamp( Math.floor( value * 255 + 127 ), 0, 255 );
      imageData.data[ index + 1 ] = Utils.clamp( Math.floor( value * 255 + 127 ), 0, 255 );
      imageData.data[ index + 2 ] = Utils.clamp( Math.floor( value * 255 + 127 ), 0, 255 );
      imageData.data[ index + 3 ] = 255;
    }

    context.putImageData( imageData, 0, 0 );

    envMapTexture = new THREE.CanvasTexture( canvas, THREE.EquirectangularReflectionMapping, THREE.RepeatWrapping, THREE.RepeatWrapping );
  }
  return envMapTexture;
}

// textures
const aluminumColorTexture = toWrappedTexture( Metal10_col_jpg );
const aluminumMetalnessTexture = toWrappedTexture( Metal10_met_jpg );
const aluminumNormalTexture = toWrappedTexture( Metal10_nrm_jpg );
const aluminumRoughnessTexture = toWrappedTexture( Metal10_rgh_jpg );
const brickAmbientOcclusionTexture = toWrappedTexture( Bricks25_AO_jpg );
const brickColorTexture = toWrappedTexture( Bricks25_col_jpg );
const brickNormalTexture = toWrappedTexture( Bricks25_nrm_jpg );
const copperColorTexture = toWrappedTexture( Metal08_col_jpg );
const copperMetalnessTexture = toWrappedTexture( Metal08_met_jpg );
const copperNormalTexture = toWrappedTexture( Metal08_nrm_jpg );
const copperRoughnessTexture = toWrappedTexture( Metal08_rgh_jpg );
const iceAlphaTexture = toWrappedTexture( Ice01_alpha_jpg );
const iceColorTexture = toWrappedTexture( Ice01_col_jpg );
const iceNormalTexture = toWrappedTexture( Ice01_nrm_jpg );
const platinumColorTexture = toWrappedTexture( Metal10_col_brightened_jpg );
const steelColorTexture = toWrappedTexture( DiamondPlate01_col_jpg );
const steelMetalnessTexture = toWrappedTexture( DiamondPlate01_met_jpg );
const steelNormalTexture = toWrappedTexture( DiamondPlate01_nrm_jpg );
const steelRoughnessTexture = toWrappedTexture( DiamondPlate01_rgh_jpg );
const styrofoamAmbientOcclusionTexture = toWrappedTexture( Styrofoam_001_AO_jpg );
const styrofoamColorTexture = toWrappedTexture( Styrofoam_001_col_jpg );
const styrofoamNormalTexture = toWrappedTexture( Styrofoam_001_nrm_jpg );
const styrofoamRoughnessTexture = toWrappedTexture( Styrofoam_001_rgh_jpg );
const woodColorTexture = toWrappedTexture( Wood26_col_jpg );
const woodNormalTexture = toWrappedTexture( Wood26_nrm_jpg );
const woodRoughnessTexture = toWrappedTexture( Wood26_rgh_jpg );

class AluminumMaterialView extends MaterialView {
  public constructor() {
    super( new THREE.MeshStandardMaterial( {
      map: aluminumColorTexture,
      normalMap: aluminumNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughnessMap: aluminumRoughnessTexture,
      metalnessMap: aluminumMetalnessTexture,
      envMap: getEnvironmentTexture()
    } ) );
  }
}

class BrickMaterialView extends MaterialView {
  public constructor() {
    super( new THREE.MeshStandardMaterial( {
      map: brickColorTexture,
      aoMap: brickAmbientOcclusionTexture,
      normalMap: brickNormalTexture,
      normalScale: new THREE.Vector2( 0.5, -0.5 ),
      roughness: 1,
      metalness: 0,
      envMap: getEnvironmentTexture()
    } ) );
  }
}

class CopperMaterialView extends MaterialView {
  public constructor() {
    super( new THREE.MeshStandardMaterial( {
      map: copperColorTexture,
      normalMap: copperNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughnessMap: copperRoughnessTexture,
      metalnessMap: copperMetalnessTexture,
      envMap: getEnvironmentTexture()
    } ) );
  }
}

class IceMaterialView extends MaterialView {
  public constructor() {
    super( new THREE.MeshPhysicalMaterial( {
      map: iceColorTexture,
      alphaMap: iceAlphaTexture,
      normalMap: iceNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughness: 0.7,
      refractionRatio: 1 / 1.309,
      metalness: 0.4,
      // @ts-expect-error they capitalized this
      clearCoat: 1,
      reflectivity: 1,
      envMapIntensity: 2, // is this too much cheating?

      transparent: true,
      side: THREE.DoubleSide,

      envMap: getEnvironmentTexture()
    } ) );
  }
}

// We just use aluminum
class PlatinumMaterialView extends MaterialView {
  public constructor() {
    super( new THREE.MeshStandardMaterial( {
      map: platinumColorTexture,
      normalMap: aluminumNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughnessMap: aluminumRoughnessTexture,
      roughness: 4,
      metalnessMap: aluminumMetalnessTexture,
      envMapIntensity: 0.5,
      emissive: 0xffffff,
      emissiveIntensity: 0.5,
      envMap: getEnvironmentTexture()
    } ) );
  }
}

class SteelMaterialView extends MaterialView {
  public constructor() {
    super( new THREE.MeshStandardMaterial( {
      map: steelColorTexture,
      normalMap: steelNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughnessMap: steelRoughnessTexture,
      metalnessMap: steelMetalnessTexture,
      envMap: getEnvironmentTexture()
    } ) );
  }
}

class StyrofoamMaterialView extends MaterialView {
  public constructor() {
    super( new THREE.MeshStandardMaterial( {
      map: styrofoamColorTexture,
      aoMap: styrofoamAmbientOcclusionTexture,
      normalMap: styrofoamNormalTexture,
      normalScale: new THREE.Vector2( 1, 1 ),
      roughness: 1.5,
      roughnessMap: styrofoamRoughnessTexture,
      metalness: 0,
      envMap: getEnvironmentTexture()
    } ) );
  }
}

class WoodMaterialView extends MaterialView {
  public constructor() {
    super( new THREE.MeshStandardMaterial( {
      map: woodColorTexture,
      normalMap: woodNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughness: 0.8,
      roughnessMap: woodRoughnessTexture,
      metalness: 0,
      envMap: getEnvironmentTexture()
    } ) );
  }
}

class CustomMaterialView extends MaterialView {
  public constructor( density: number ) {
    const lightness = Material.getCustomLightness( density );
    const color = lightness + lightness * 0x100 + lightness * 0x10000;

    super( new THREE.MeshLambertMaterial( {
      color: color
    } ) );
  }
}

class CustomColoredMaterialView extends MaterialView<THREE.MeshLambertMaterial> {

  private readonly colorProperty: Property<Color>;
  private readonly listener: ( color: Color ) => void;

  public constructor( colorProperty: Property<Color> ) {
    super( new THREE.MeshLambertMaterial() );

    this.colorProperty = colorProperty;

    this.listener = color => {
      this.material.color = ThreeUtils.colorToThree( color );
    };
    this.colorProperty.link( this.listener );
  }

  /**
   * Releases references
   */
  public override dispose(): void {
    this.colorProperty.unlink( this.listener );

    super.dispose();
  }
}

class DebugMaterialView extends MaterialView {
  public constructor() {
    super( new THREE.MeshLambertMaterial( {
      color: 0xffaa44
    } ) );
  }
}

export default class DensityMaterials {
  /**
   * Returns a view for the given Material.
   */
  public static getMaterialView( material: Material ): MaterialView {
    if ( material === Material.ALUMINUM ) {
      return new AluminumMaterialView();
    }
    else if ( material === Material.BRICK ) {
      return new BrickMaterialView();
    }
    else if ( material === Material.COPPER ) {
      return new CopperMaterialView();
    }
    else if ( material === Material.ICE ) {
      return new IceMaterialView();
    }
    else if ( material === Material.PLATINUM ) {
      return new PlatinumMaterialView();
    }
    else if ( material === Material.STEEL ) {
      return new SteelMaterialView();
    }
    else if ( material === Material.STYROFOAM ) {
      return new StyrofoamMaterialView();
    }
    else if ( material === Material.WOOD ) {
      return new WoodMaterialView();
    }
    else if ( material.custom ) {
      if ( material.customColor === null ) {
        return new CustomMaterialView( material.density );
      }
      else {
        return new CustomColoredMaterialView( material.customColor );
      }
    }
    else {
      return new DebugMaterialView();
    }
  }

  public static readonly woodColorTexture = woodColorTexture;
  public static readonly woodNormalTexture = woodNormalTexture;
  public static readonly woodRoughnessTexture = woodRoughnessTexture;
}


densityBuoyancyCommon.register( 'DensityMaterials', DensityMaterials );
