// Copyright 2019-2022, University of Colorado Boulder

/**
 * The 3D view for a Bottle.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import MassView from '../../common/view/MassView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Bottle from '../model/Bottle.js';
import Material from '../../common/model/Material.js';

export default class BottleView extends MassView {

  public readonly bottle: Bottle;

  public constructor( bottle: Bottle ) {

    const primaryGeometry = Bottle.getPrimaryGeometry();

    // @ts-expect-error
    super( bottle, new THREE.Geometry() );

    const bottomClipPlane = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0 );
    const topClipPlane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 0 );

    const backTopMaterial = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      opacity: 0.4,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      clippingPlanes: [ topClipPlane ]
    } );
    const backTop = new THREE.Mesh( primaryGeometry, backTopMaterial );
    this.add( backTop );

    const backBottomMaterial = new THREE.MeshPhongMaterial( {
      color: 0x33FF33,
      opacity: 0.8,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      clippingPlanes: [ bottomClipPlane ]
    } );
    const backBottom = new THREE.Mesh( primaryGeometry, backBottomMaterial );
    this.add( backBottom );

    const frontTopMaterial = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      opacity: 0.4,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
      clippingPlanes: [ topClipPlane ]
    } );
    const frontTop = new THREE.Mesh( primaryGeometry, frontTopMaterial );
    this.add( frontTop );

    const frontBottomMaterial = new THREE.MeshPhongMaterial( {
      color: 0x33FF33,
      opacity: 0.8,
      transparent: true,
      side: THREE.FrontSide,
      // depthWrite: false, // TODO: hmmm?
      clippingPlanes: [ bottomClipPlane ]
    } );
    const frontBottom = new THREE.Mesh( primaryGeometry, frontBottomMaterial );
    this.add( frontBottom );

    // TODO: optimize
    const frontBottomForDepth = new THREE.Mesh( primaryGeometry, new THREE.MeshPhongMaterial( {
      color: 0xFF0000,
      opacity: 0,
      transparent: true,
      side: THREE.FrontSide,
      clippingPlanes: [ bottomClipPlane ]
    } ) );
    this.add( frontBottomForDepth );

    const frontTopForDepth = new THREE.Mesh( primaryGeometry, new THREE.MeshPhongMaterial( {
      color: 0xFF0000,
      opacity: 0,
      transparent: true,
      side: THREE.FrontSide,
      clippingPlanes: [ topClipPlane ]
    } ) );
    this.add( frontTopForDepth );

    const cap = new THREE.Mesh( Bottle.getCapGeometry(), new THREE.MeshPhongMaterial( {
      color: 0xFF3333,
      side: THREE.DoubleSide
    } ) );
    this.add( cap );

    const crossSectionPositionArray = Bottle.createCrossSectionVertexArray();
    const crossSectionNormalArray = new Float32Array( crossSectionPositionArray.length );
    for ( let i = 1; i < crossSectionNormalArray.length; i += 3 ) {
      crossSectionNormalArray[ i ] = 1; // normals should all be 0,1,0
    }

    const interiorSurfaceGeometry = new THREE.BufferGeometry();
    interiorSurfaceGeometry.addAttribute( 'position', new THREE.BufferAttribute( crossSectionPositionArray, 3 ) );
    interiorSurfaceGeometry.addAttribute( 'normal', new THREE.BufferAttribute( crossSectionNormalArray, 3 ) );

    const setCrossSectionRelativeY = ( y: number ) => {
      Bottle.fillCrossSectionVertexArray( y, crossSectionPositionArray );
      interiorSurfaceGeometry.attributes.position.needsUpdate = true;
      interiorSurfaceGeometry.computeBoundingSphere();
    };
    // TODO: unlink
    bottle.interiorVolumeProperty.link( volume => {
      setCrossSectionRelativeY( Bottle.getYFromVolume( volume ) );
    } );

    // TODO: unlink
    const adjustClipPlanes = () => {
      const modelY = bottle.matrix.translation.y + Bottle.getYFromVolume( bottle.interiorVolumeProperty.value );

      bottomClipPlane.constant = modelY;
      topClipPlane.constant = -modelY;
    };
    bottle.transformedEmitter.addListener( adjustClipPlanes );
    bottle.interiorVolumeProperty.lazyLink( adjustClipPlanes );
    adjustClipPlanes();

    const interiorSurfaceMaterial = new THREE.MeshPhongMaterial( {
      color: 0x33FF33,
      opacity: 0.8,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    } );
    const interiorSurface = new THREE.Mesh( interiorSurfaceGeometry, interiorSurfaceMaterial );

    this.add( interiorSurface );

    // Set render order for all elements
    [
      frontTopForDepth,
      frontTop,
      interiorSurface,
      frontBottomForDepth,
      frontBottom,
      backBottom,
      backTop
    ].forEach( ( view, index ) => {
      view.renderOrder = -( index + 1 );
    } );

    Material.linkLiquidColor( bottle.interiorMaterialProperty, interiorSurfaceMaterial );
    Material.linkLiquidColor( bottle.interiorMaterialProperty, backBottomMaterial );
    Material.linkLiquidColor( bottle.interiorMaterialProperty, frontBottomMaterial );

    this.bottle = bottle;
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    // TODO: dispose everything from above

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'BottleView', BottleView );
