// Copyright 2014-2022, University of Colorado Boulder

/**
 * Bulb node for 'Faradays Law' simulation
 *
 * @author Vasily Shakhov (MLearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import lightBulbBase_png from '../../../../scenery-phet/mipmaps/lightBulbBase_png.js';
import { Circle, Image, Node, Path, RadialGradient } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';

// constants
const BULB_BODY_HEIGHT = 125 - 45;
const BULB_WIDTH = 65;
const BULB_BASE_WIDTH = 36;
const NUM_FILAMENT_ZIG_ZAGS = 4;
const FILAMENT_ZIG_ZAG_SPAN = 4;
const BULB_X_DISPLACEMENT = -45; // Bulb dx relative to center position
const BULB_NECK_WIDTH = BULB_BASE_WIDTH * 0.85;
const CONTROL_POINT_Y_VALUE = BULB_WIDTH * 0.7;

class BulbNode extends Node {

  /**
   * @param {NumberProperty} voltageProperty - indicated on the voltmeter
   * @param {Object} [options]
   */
  constructor( voltageProperty, options ) {
    super();

    // Create the base of the bulb
    const bulbBase = new Image( lightBulbBase_png );
    bulbBase.scale( BULB_BASE_WIDTH / bulbBase.height );

    // Important Note: For the drawing code below, the reference frame is assumed to be such that the point x=0, y=0 is
    // at the left side of the light bulb base, which is also the right side of the light bulb body, and the vertical
    // center of both.  This was the easiest to work with.

    // Create the bulb body.
    const bulbShape = new Shape().moveTo( 0, -BULB_NECK_WIDTH / 2 )
      .cubicCurveTo(
        -BULB_BODY_HEIGHT * 0.33,
        -CONTROL_POINT_Y_VALUE,
        -BULB_BODY_HEIGHT * 0.95,
        -CONTROL_POINT_Y_VALUE,
        -BULB_BODY_HEIGHT,
        0
      )
      .cubicCurveTo(
        -BULB_BODY_HEIGHT * 0.95,
        CONTROL_POINT_Y_VALUE,
        -BULB_BODY_HEIGHT * 0.33,
        CONTROL_POINT_Y_VALUE,
        0,
        BULB_NECK_WIDTH / 2
      );
    const bulbBodyOutline = new Path( bulbShape, {
      stroke: 'black',
      lineCap: 'round'
    } );
    const bulbBodyFill = new Path( bulbShape, {
      fill: new RadialGradient(
        bulbBodyOutline.centerX, bulbBodyOutline.centerY,
        BULB_WIDTH / 10, bulbBodyOutline.centerX, bulbBodyOutline.centerY,
        BULB_WIDTH / 2 )
        .addColorStop( 0, '#eeeeee' )
        .addColorStop( 1, '#bbccbb' )
    } );

    // Create the filament support wires.
    const filamentWireHeight = BULB_BODY_HEIGHT * 0.6;
    const filamentTopPoint = new Vector2( -filamentWireHeight, -BULB_WIDTH * 0.3 );
    const filamentBottomPoint = new Vector2( -filamentWireHeight, BULB_WIDTH * 0.3 );
    const filamentSupportWiresShape = new Shape()
      .moveTo( 0, -BULB_BASE_WIDTH * 0.3 )
      .cubicCurveTo(
        -filamentWireHeight * 0.3,
        -BULB_BASE_WIDTH * 0.3,
        -filamentWireHeight * 0.4,
        filamentTopPoint.y,
        filamentTopPoint.x,
        filamentTopPoint.y
      )
      .moveTo( 0, BULB_BASE_WIDTH * 0.3 )
      .cubicCurveTo(
        -filamentWireHeight * 0.3,
        BULB_BASE_WIDTH * 0.3,
        -filamentWireHeight * 0.4,
        filamentBottomPoint.y,
        filamentBottomPoint.x,
        filamentBottomPoint.y
      );
    const filamentSupportWires = new Path( filamentSupportWiresShape, { stroke: 'black' } );
    const filamentShape = new Shape()
      .moveToPoint( filamentBottomPoint )
      .zigZagToPoint( filamentTopPoint, FILAMENT_ZIG_ZAG_SPAN, NUM_FILAMENT_ZIG_ZAGS, true );
    const filamentNode = new Path( filamentShape, { stroke: 'black' } );

    // Create the 'halo' that makes the bulb look like it is shining.
    const haloNode = new Node( {
      children: [ new Circle( 5, {
        fill: 'white',
        opacity: 0.46
      } ), new Circle( 3.75, {
        fill: 'white',
        opacity: 0.51
      } ), new Circle( 2, {
        fill: 'white'
      } ) ]
    } );

    // Update the halo as the needle angle changes.
    voltageProperty.link( voltage => {

      // in angle = 1, we would have 200x200 halo (max circle diameter - 10px, so 200/10 = 20)
      const scale = 20 * Math.abs( voltage );
      if ( scale < 0.1 ) {
        haloNode.visible = false;
      }
      else {
        haloNode.visible = true;
        haloNode.scale( scale / haloNode.transform.matrix.scaleVector.x );
      }
    } );

    // Layering
    this.children = [
      bulbBodyFill,
      filamentSupportWires,
      filamentNode,
      haloNode,
      bulbBase,
      bulbBodyOutline
    ];

    // Do some last layout
    bulbBase.centerY = 0;
    bulbBase.left = 0;
    haloNode.center = filamentNode.center;

    this.mutate( options );

    this.translate( BULB_X_DISPLACEMENT, 0 );
  }
}

faradaysLaw.register( 'BulbNode', BulbNode );
export default BulbNode;