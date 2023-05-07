// Copyright 2018-2021, University of Colorado Boulder

/**
 * Supertype for views for Stacks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Node } from '../../../../scenery/js/imports.js';
import fractionsCommon from '../../fractionsCommon.js';

class StackNode extends Node {
  /**
   * @param {Stack} stack
   * @param {Object} [options]
   */
  constructor( stack, options ) {
    super( {
      pickable: false
    } );

    // @public {Stack}
    this.stack = stack;

    // @public {Bounds2} - The ideal layout bounds for this node (that should be used for layout). This should be
    // defined by the concrete subtype.
    this.layoutBounds = Bounds2.NOTHING;
  }
}

fractionsCommon.register( 'StackNode', StackNode );
export default StackNode;