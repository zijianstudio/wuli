// Copyright 2018-2022, University of Colorado Boulder

/**
 * Supertype for nodes that show a representation of a cell-based container.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { ColorDef, Node } from '../../../../scenery/js/imports.js';
import fractionsCommon from '../../fractionsCommon.js';
import Container from '../model/Container.js';

class ContainerNode extends Node {
  /**
   * @param {Container} container
   * @param {Object} [options]
   */
  constructor( container, options ) {
    assert && assert( container instanceof Container );

    options = merge( {
      // {ColorDef} - If non-null, this will be used instead of the container's usual color
      colorOverride: null,

      // {function} - If provided, will be called as function( {Cell} cell, {SceneryEvent} event ) when a cell is
      // pressed by a pointer.
      cellDownCallback: () => {}
    }, options );

    assert && assert( ColorDef.isColorDef( options.colorOverride ) );
    assert && assert( typeof options.cellDownCallback === 'function' );

    super();

    // @public {Container}
    this.container = container;

    // @protected {ColorDef}
    this.colorOverride = options.colorOverride;

    // @protected {function}
    this.cellDownCallback = options.cellDownCallback;
  }

  /**
   * Return the midpoint offset of this node.
   * @public
   *
   * @param {number} index
   * @returns {Vector2}
   */
  getMidpointByIndex( index ) {
    return Vector2.ZERO;
  }
}

fractionsCommon.register( 'ContainerNode', ContainerNode );
export default ContainerNode;