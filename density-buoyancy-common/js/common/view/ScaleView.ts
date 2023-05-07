// Copyright 2019-2022, University of Colorado Boulder

/**
 * The 3D view for a Scale.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Scale from '../model/Scale.js';
import CuboidView from './CuboidView.js';
import MassView from './MassView.js';
import VerticalCylinderView from './VerticalCylinderView.js';

export default class ScaleView extends MassView {

  private readonly scaleGeometry: THREE.BufferGeometry;

  public constructor( mass: Scale ) {

    const scaleGeometry = ScaleView.getScaleGeometry();

    super( mass, scaleGeometry );

    this.scaleGeometry = scaleGeometry;
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    this.scaleGeometry.dispose();

    super.dispose();
  }

  /**
   * Returns the geometry used for the scale
   */
  public static getScaleGeometry(): THREE.BufferGeometry {
    const cuboidElements = 18 * 3;
    const cylinderElements = 12 * 64;
    const numElements = cuboidElements + cylinderElements;

    const positionArray = new Float32Array( numElements * 3 );
    const normalArray = new Float32Array( numElements * 3 );
    const uvArray = new Float32Array( numElements * 2 );

    const topOffset = new Vector3(
      0,
      ( Scale.SCALE_HEIGHT - Scale.SCALE_TOP_HEIGHT ) / 2,
      0
    );

    CuboidView.updateArrays( positionArray, normalArray, uvArray, Scale.SCALE_BASE_BOUNDS );
    VerticalCylinderView.updateArrays( positionArray, normalArray, uvArray, Scale.SCALE_WIDTH / 2, Scale.SCALE_TOP_HEIGHT, cuboidElements, topOffset );

    const scaleGeometry = new THREE.BufferGeometry();
    scaleGeometry.addAttribute( 'position', new THREE.BufferAttribute( positionArray, 3 ) );
    scaleGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalArray, 3 ) );
    scaleGeometry.addAttribute( 'uv', new THREE.BufferAttribute( uvArray, 2 ) );

    return scaleGeometry;
  }
}

densityBuoyancyCommon.register( 'ScaleView', ScaleView );
