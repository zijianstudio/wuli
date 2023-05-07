// Copyright 2013-2022, University of Colorado Boulder

/**
 * H2O (water) molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Node } from '../../../../../scenery/js/imports.js';
import phScale from '../../../phScale.js';
import HydrogenNode from './HydrogenNode.js';
import OxygenNode from './OxygenNode.js';

export default class H2ONode extends Node {

  public constructor() {

    const oxygen = new OxygenNode();

    const hydrogen1 = new HydrogenNode( {
      left: oxygen.right - ( 0.2 * oxygen.width ),
      centerY: oxygen.centerY - ( 0.1 * oxygen.height )
    } );

    const hydrogen2 = new HydrogenNode( {
      centerX: oxygen.centerX + ( 0.1 * oxygen.width ),
      centerY: oxygen.bottom
    } );

    super( {
      children: [ hydrogen2, oxygen, hydrogen1 ]
    } );
  }
}

phScale.register( 'H2ONode', H2ONode );