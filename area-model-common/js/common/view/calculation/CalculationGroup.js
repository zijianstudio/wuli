// Copyright 2018-2021, University of Colorado Boulder

/**
 * A poolable HBox for grouping calculation items with a specified spacing.
 *
 * This is pooled for performance, as recreating the view structure had unacceptable performance/GC characteristics.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Poolable from '../../../../../phet-core/js/Poolable.js';
import { HBox } from '../../../../../scenery/js/imports.js';
import areaModelCommon from '../../../areaModelCommon.js';

class CalculationGroup extends HBox {
  /**
   * @param {Array.<Node>} nodes - Each should have a clean() method to support pooling
   * @param {number} spacing
   */
  constructor( nodes, spacing ) {

    super( {
      align: 'bottom',

      // pdom
      pdomNamespace: 'http://www.w3.org/1998/Math/MathML'
    } );

    this.initialize( nodes, spacing );
  }

  /**
   * @public
   *
   * @param {Array.<Node>} nodes - Each should have a clean() method to support pooling
   * @param {number} spacing
   */
  initialize( nodes, spacing ) {
    assert && assert( Array.isArray( nodes ) );
    assert && assert( typeof spacing === 'number' );

    // @public {string}
    this.accessibleText = nodes.map( node => node.accessibleText ).join( ' ' );

    // @private {Array.<Node>|null}
    this.nodes = nodes;

    this.mutate( {
      tagName: nodes.length > 1 ? 'mrow' : null,
      spacing: spacing,
      children: nodes
    } );
  }

  /**
   * Clears the state of this node (releasing references) so it can be freed to the pool (and potentially GC'ed).
   * @public
   */
  clean() {
    // Remove our content
    this.removeAllChildren();
    this.nodes.forEach( node => {
      node.clean();
    } );
    this.nodes = null;

    this.freeToPool();
  }
}

areaModelCommon.register( 'CalculationGroup', CalculationGroup );

Poolable.mixInto( CalculationGroup );

export default CalculationGroup;