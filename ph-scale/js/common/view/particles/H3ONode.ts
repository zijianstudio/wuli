// Copyright 2013-2022, University of Colorado Boulder

/**
 * H3O+ (hydronium) ion
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Node } from '../../../../../scenery/js/imports.js';
import phScale from '../../../phScale.js';
import HydrogenNode from './HydrogenNode.js';
import OxygenNode from './OxygenNode.js';

export default class H3ONode extends Node {

  public constructor() {

    const oxygen = new OxygenNode();

    const hydrogen1 = new HydrogenNode( {
      centerX: oxygen.left,
      centerY: oxygen.centerY - ( 0.1 * oxygen.height )
    } );

    const hydrogen2 = new HydrogenNode( {
      centerX: oxygen.centerX + ( 0.4 * oxygen.width ),
      centerY: oxygen.top + ( 0.1 * oxygen.height )
    } );

    const hydrogen3 = new HydrogenNode( {
      centerX: oxygen.centerX + ( 0.2 * oxygen.width ),
      centerY: oxygen.bottom - ( 0.1 * oxygen.height )
    } );

    super( {
      children: [ hydrogen3, oxygen, hydrogen1, hydrogen2 ]
    } );
  }
}

phScale.register( 'H3ONode', H3ONode );