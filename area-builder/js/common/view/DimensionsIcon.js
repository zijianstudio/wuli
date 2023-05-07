// Copyright 2014-2022, University of Colorado Boulder

/**
 * A Scenery node that depicts a basic shape with its dimensions labeled, intended for use in control panels.  It
 * includes an overlying grid that can be turned on or off.
 *
 * @author John Blanco
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../AreaBuilderSharedConstants.js';
import Grid from './Grid.js';

// constants
const UNIT_LENGTH = 10; // in screen coordinates
const WIDTH = 3 * UNIT_LENGTH;
const HEIGHT = 2 * UNIT_LENGTH; // in screen coordinates
const LABEL_FONT = new PhetFont( 10 );
const DEFAULT_FILL_COLOR = AreaBuilderSharedConstants.GREENISH_COLOR;

class DimensionsIcon extends Node {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    super();

    // Create the background rectangle node.
    this.singleRectNode = new Rectangle( 0, 0, WIDTH, HEIGHT, 0, 0 );
    this.addChild( this.singleRectNode );

    // Add the grid.
    this.grid = new Grid( new Bounds2( 0, 0, WIDTH, HEIGHT ), UNIT_LENGTH, { stroke: '#b0b0b0', lineDash: [ 1, 2 ] } );
    this.addChild( this.grid );

    // Initialize the color.
    this.setColor( DEFAULT_FILL_COLOR );

    // Label the sides.
    this.addChild( new Text( '2', { font: LABEL_FONT, right: -2, centerY: HEIGHT / 2 } ) );
    this.addChild( new Text( '2', { font: LABEL_FONT, left: WIDTH + 2, centerY: HEIGHT / 2 } ) );
    this.addChild( new Text( '3', { font: LABEL_FONT, centerX: WIDTH / 2, bottom: 0 } ) );
    this.addChild( new Text( '3', { font: LABEL_FONT, centerX: WIDTH / 2, top: HEIGHT } ) );

    // Pass through any options.
    this.mutate( options );
  }

  /**
   * @param {boolean} gridVisible
   * @public
   */
  setGridVisible( gridVisible ) {
    assert && assert( typeof ( gridVisible ) === 'boolean' );
    this.grid.visible = gridVisible;
  }

  /**
   * @param color
   * @public
   */
  setColor( color ) {
    this.singleRectNode.fill = color;
    const strokeColor = Color.toColor( color ).colorUtilsDarker( AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR );
    this.singleRectNode.stroke = strokeColor;
    this.grid.stroke = strokeColor;
  }
}

areaBuilder.register( 'DimensionsIcon', DimensionsIcon );
export default DimensionsIcon;