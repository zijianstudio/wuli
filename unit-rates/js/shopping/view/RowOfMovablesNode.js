// Copyright 2017-2023, University of Colorado Boulder

/**
 * Used for debugging purposes to see the cells in each RowOfMovable instance.
 * See URQueryParameters.showCells.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Path } from '../../../../scenery/js/imports.js';
import unitRates from '../../unitRates.js';

export default class RowOfMovablesNode extends Path {

  /**
   * @param {RowOfMovables} rowOfMovables
   * @param {Object} [options]
   */
  constructor( rowOfMovables, options ) {

    options = merge( {
      stroke: 'black'
    }, options );

    const cellWidth = rowOfMovables.cellSize.width;
    const cellHeight = rowOfMovables.cellSize.height;

    // add a rectangle for each cell
    const shape = new Shape();
    rowOfMovables.getCells().forEach( cell => {
      const x = cell.position.x - ( cellWidth / 2 );
      const y = cell.position.y - cellHeight;
      shape.rect( x, y, cellWidth, cellHeight );
    } );

    super( shape, options );
  }
}

unitRates.register( 'RowOfMovablesNode', RowOfMovablesNode );