// Copyright 2019-2022, University of Colorado Boulder

/**
 * A container for a three.js material and various associated functions/data that are needed to update it.
 *
 * Still used for subtyping the disposal, as we need a wrapper to store additional information.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

export default class MaterialView<T extends THREE.Material = THREE.Material> {

  public readonly material: T;

  public constructor( material: T ) {
    this.material = material;
  }

  /**
   * Releases references
   */
  public dispose(): void {
    this.material.dispose();
  }
}

densityBuoyancyCommon.register( 'MaterialView', MaterialView );
