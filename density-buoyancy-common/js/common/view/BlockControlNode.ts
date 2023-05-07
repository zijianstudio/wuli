// Copyright 2019-2022, University of Colorado Boulder

/**
 * A mass/volume control specifically for blocks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Node } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Cube from '../model/Cube.js';
import Cuboid from '../model/Cuboid.js';
import Material from '../model/Material.js';
import MaterialMassVolumeControlNode, { MaterialMassVolumeControlNodeOptions } from './MaterialMassVolumeControlNode.js';

export type BlockControlNodeOptions = MaterialMassVolumeControlNodeOptions;

export default class BlockControlNode extends MaterialMassVolumeControlNode {
  public constructor( cuboid: Cuboid, listParent: Node, options?: BlockControlNodeOptions ) {
    super( cuboid.materialProperty, cuboid.massProperty, cuboid.volumeProperty, [
      Material.STYROFOAM,
      Material.WOOD,
      Material.ICE,
      Material.BRICK,
      Material.ALUMINUM
    ], cubicMeters => cuboid.updateSize( Cube.boundsFromVolume( cubicMeters ) ), listParent, options );
  }
}

densityBuoyancyCommon.register( 'BlockControlNode', BlockControlNode );
