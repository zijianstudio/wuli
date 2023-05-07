// Copyright 2013-2022, University of Colorado Boulder

/**
 * OH- (hydroxide) ion
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Node } from '../../../../../scenery/js/imports.js';
import phScale from '../../../phScale.js';
import HydrogenNode from './HydrogenNode.js';
import OxygenNode from './OxygenNode.js';

export default class OHNode extends Node {

  public constructor() {

    const oxygen = new OxygenNode();

    const hydrogen = new HydrogenNode( {
      left: oxygen.right - ( 0.2 * oxygen.width ),
      centerY: oxygen.centerY - ( 0.1 * oxygen.height )
    } );

    super( {
      children: [ oxygen, hydrogen ]
    } );
  }
}

phScale.register( 'OHNode', OHNode );