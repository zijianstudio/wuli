// Copyright 2022, University of Colorado Boulder

/**
 * Demo for LevelCompletedNode
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Node } from '../../../../scenery/js/imports.js';
import LevelCompletedNode from '../../LevelCompletedNode.js';

export default function demoLevelCompletedNode( layoutBounds: Bounds2 ): Node {
  return new LevelCompletedNode( 1, 10, 10, 5, true, 2000, null, true, _.noop, {
    center: layoutBounds.center
  } );
}