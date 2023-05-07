// Copyright 2014-2022, University of Colorado Boulder

/**
 * A Scenery node that depicts a grid with squares on it.  This is used in several places in the simulation to create
 * icons that look like the things that the user might create when using the simulation.
 *
 * @author John Blanco
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color, Node, Rectangle } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import Grid from './Grid.js';

class GridIcon extends Node {

  /**
   * @param {number} columns
   * @param {number} rows
   * @param {number} cellLength
   * @param {string} shapeFillColor
   * @param {Array.<Vector2>} occupiedCells
   * @param {Object} [options]
   */
  constructor( columns, rows, cellLength, shapeFillColor, occupiedCells, options ) {

    super();

    options = merge( {
      // defaults
      gridStroke: 'black',
      gridLineWidth: 1,
      backgroundStroke: null,
      backgroundFill: 'white',
      backgroundLineWidth: 1,
      shapeStroke: new Color( shapeFillColor ).colorUtilsDarker( 0.2 ), // darkening factor empirically determined
      shapeLineWidth: 1
    }, options );

    this.addChild( new Rectangle( 0, 0, columns * cellLength, rows * cellLength, 0, 0, {
      fill: options.backgroundFill,
      stroke: options.backgroundStroke,
      lineWidth: options.backgroundLineWidth
    } ) );

    this.addChild( new Grid( new Bounds2( 0, 0, columns * cellLength, rows * cellLength ), cellLength, {
      stroke: options.gridStroke,
      lineWidth: options.gridLineWidth,
      fill: options.gridFill
    } ) );

    occupiedCells.forEach( occupiedCell => {
      this.addChild( new Rectangle( 0, 0, cellLength, cellLength, 0, 0, {
        fill: shapeFillColor,
        stroke: options.shapeStroke,
        lineWidth: options.shapeLineWidth,
        left: occupiedCell.x * cellLength,
        top: occupiedCell.y * cellLength
      } ) );
    } );

    // Pass options through to the parent class.
    this.mutate( options );
  }
}

areaBuilder.register( 'GridIcon', GridIcon );
export default GridIcon;