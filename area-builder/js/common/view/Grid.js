// Copyright 2014-2022, University of Colorado Boulder

/**
 * Defines a simple grid with horizontal and vertical lines, and no enclosing
 * lines on the outer edges.
 *
 * @author John Blanco
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Path } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';

class Grid extends Path {

  /**
   * @param {Bounds2} bounds
   * @param {number} spacing
   * @param {Object} [options]
   */
  constructor( bounds, spacing, options ) {
    const gridShape = new Shape();

    // Add the vertical lines
    for ( let i = bounds.minX + spacing; i < bounds.minX + bounds.width; i += spacing ) {
      gridShape.moveTo( i, bounds.minY );
      gridShape.lineTo( i, bounds.minY + bounds.height );
    }

    // Add the horizontal lines
    for ( let i = bounds.minY + spacing; i < bounds.minY + bounds.height; i += spacing ) {
      gridShape.moveTo( bounds.minX, i );
      gridShape.lineTo( bounds.minX + bounds.width, i );
    }

    super( gridShape, options );
  }
}

areaBuilder.register( 'Grid', Grid );
export default Grid;