// Copyright 2014-2022, University of Colorado Boulder

/**
 * Icon for the control the turns the column on and off, programmatically
 * drawn for best appearance.
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Circle, LinearGradient, Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import balancingAct from '../../balancingAct.js';

// constants
const CORNER_ROUNDING = 4;
const ASPECT_RATIO = 1.6; // Ratio of width to height.

function createMiniColumn( size, options ) {
  const rootNode = new Node();

  // Create the gradient fill.
  const columnGradient = new LinearGradient( 0, 0, size.width, 0 ).addColorStop( 0, 'rgb( 150, 150, 150 )' ).addColorStop( 0.25, 'rgb( 210, 210, 210 )' ).addColorStop( 0.65, 'rgb( 150, 150, 150 )' ).addColorStop( 1, 'rgb( 170, 170, 170 )' );

  // Add the main body of the column.
  rootNode.addChild( new Rectangle( 0, 0, size.width * 0.75, size.height, 0, 0,
    {
      fill: columnGradient,
      stroke: 'black',
      lineWidth: 0.5,
      centerX: 0
    } ) );

  // Add the column base.
  rootNode.addChild( new Rectangle( 0, size.height * 0.8, size.width, size.height * 0.2, 0.5, 0.5,
    {
      fill: columnGradient,
      stroke: 'black',
      lineWidth: 0.5,
      centerX: 0
    } ) );
  rootNode.mutate( options );
  return rootNode;
}

class ColumnControlIcon extends Node {

  /**
   * @param width
   * @param showColumns
   * @param {Object} [options]
   */
  constructor( width, showColumns, options ) {
    super( options );
    const height = width / ASPECT_RATIO;
    this.addChild( new Rectangle( 0, 0, width, height, CORNER_ROUNDING, CORNER_ROUNDING,
      {
        stroke: 'black',
        lineWidth: 0.5,
        fill: new LinearGradient( 0, 0, 0, height ).addColorStop( 0, '#01ACE4' ).addColorStop( 1, '#D0ECFB' )
      }
    ) );

    // Create and add the fulcrum.
    const fulcrumWidth = width * 0.35;
    const fulcrumHeight = height * 0.5;
    const legThickness = width * 0.05;
    const fulcrumShape = new Shape();
    // Start at leftmost and lowest point.
    fulcrumShape.moveTo( -fulcrumWidth / 2, 0 );
    fulcrumShape.lineTo( -legThickness * 0.67, -fulcrumHeight - legThickness / 2 );
    fulcrumShape.lineTo( legThickness * 0.67, -fulcrumHeight - legThickness / 2 );
    fulcrumShape.lineTo( fulcrumWidth / 2, 0 );
    fulcrumShape.lineTo( fulcrumWidth / 2 - legThickness, 0 );
    fulcrumShape.lineTo( 0, -fulcrumHeight + legThickness * 0.2 );
    fulcrumShape.lineTo( -fulcrumWidth / 2 + legThickness, 0 );
    fulcrumShape.close();
    const fulcrumNode = new Path( fulcrumShape,
      {
        fill: 'rgb( 240, 240, 0 )',
        stroke: 'black',
        lineWidth: 0.5,
        centerX: width / 2,
        bottom: height
      } );
    this.addChild( fulcrumNode );

    // Create and add the plank.
    const plank = new Rectangle( 0, 0, width * 0.9, width * 0.05, 0, 0,
      {
        fill: 'rgb( 243, 203, 127 )',
        stroke: 'black',
        lineWidth: 0.5,
        centerX: width / 2,
        top: fulcrumNode.top + legThickness * 0.67
      } );
    this.addChild( plank );

    // Add the rotation point.
    this.addChild( new Circle( ( plank.top - fulcrumNode.top ) / 2, {
      fill: 'gray',
      centerX: width / 2,
      bottom: plank.top
    } ) );

    // Add the columns, if present.
    if ( showColumns ) {
      const columnSize = new Dimension2( width * 0.15, height - plank.bottom );
      this.addChild( createMiniColumn( columnSize, { bottom: height, centerX: width * 0.175 } ) );
      this.addChild( createMiniColumn( columnSize, { bottom: height, centerX: width * 0.825 } ) );
    }
  }
}

balancingAct.register( 'ColumnControlIcon', ColumnControlIcon );

export default ColumnControlIcon;