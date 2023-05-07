// Copyright 2019-2022, University of Colorado Boulder

/**
 * Comparison chart for the 'Fraction Matcher'.
 * Contains signs shapes (more, equal, less), scale, indicators.
 *
 * @author Anton Ulyanov (Mlearner)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Shape } from '../../../../kite/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import fractionsCommon from '../../fractionsCommon.js';

// constants
const symbolFill = '#FFFF00';
const symbolWidth = 2;
const symbolStroke = 'black';
const lineHeight = 140;
const lineWeight = 70;
const lineBaseWidth = 2;
const lineOtherWidth = 1;
const stroke = '#000';

class MatchChartNode extends Node {
  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    super();

    const lessShape = new Shape()
      .moveTo( -lineWeight / 8, 0 )
      .lineTo( lineWeight / 4, -lineWeight / 8 )
      .lineTo( lineWeight / 4, -lineWeight / 4 )
      .lineTo( -lineWeight / 4, -lineWeight / 16 )
      .lineTo( -lineWeight / 4, lineWeight / 16 )
      .lineTo( lineWeight / 4, lineWeight / 4 )
      .lineTo( lineWeight / 4, lineWeight / 8 ).close();

    const eqShape = new Shape()
      .moveTo( -3 * lineWeight / 8, -3 * lineWeight / 16 )
      .lineTo( 3 * lineWeight / 8, -3 * lineWeight / 16 )
      .lineTo( 3 * lineWeight / 8, -lineWeight / 16 )
      .lineTo( -3 * lineWeight / 8, -lineWeight / 16 )
      .lineTo( -3 * lineWeight / 8, -3 * lineWeight / 16 )
      .moveTo( -3 * lineWeight / 8, 3 * lineWeight / 16 )
      .lineTo( 3 * lineWeight / 8, 3 * lineWeight / 16 )
      .lineTo( 3 * lineWeight / 8, lineWeight / 16 )
      .lineTo( -3 * lineWeight / 8, lineWeight / 16 )
      .lineTo( -3 * lineWeight / 8, 3 * lineWeight / 16 );

    // @private {Path}
    this.less = new Path( lessShape, {
      y: lineWeight / 4 + 10,
      stroke: symbolStroke,
      lineWidth: symbolWidth,
      fill: symbolFill
    } );
    this.eq = new Path( eqShape, {
      y: lineWeight / 4 + 10,
      stroke: symbolStroke,
      lineWidth: symbolWidth,
      fill: symbolFill
    } );
    this.more = new Node( {
      children: [
        new Path( lessShape, {
          y: lineWeight / 4 + 10,
          stroke: symbolStroke,
          lineWidth: symbolWidth,
          fill: symbolFill
        } )
      ]
    } );
    this.more.scale( -1, 1 );

    // Maps from a value to the local view coordinate in the chart
    const mapY = y => -y * lineWeight;

    // Initial vertical line
    const thickLineShape = new Shape().moveTo( 0, 0 ).lineTo( 0, -lineHeight - 20 );
    const thinLineShape = new Shape();

    // Ticks
    for ( let i = 0; i <= 2; i += 0.25 ) {
      const y = mapY( i );
      const tickOffset = ( i % 1 === 0 ) ? lineWeight / 2 : ( ( i % 0.5 === 0 ) ? 3 * lineWeight / 8 : lineWeight / 4 );
      const shape = ( i % 1 === 0 ) ? thickLineShape : thinLineShape;
      shape.moveTo( -tickOffset, y ).lineTo( tickOffset, y );
    }

    this.addChild( new Path( thickLineShape, {
      stroke: stroke,
      lineWidth: lineBaseWidth
    } ) );
    this.addChild( new Path( thinLineShape, {
      stroke: stroke,
      lineWidth: lineOtherWidth
    } ) );

    // Labels (on each side of a tick)
    [ 0, 1, 2 ].forEach( i => {
      [ -1, 1 ].forEach( direction => {
        this.addChild( new Text( i, {
          font: new PhetFont( { size: 18, weight: 'normal' } ),
          centerX: direction * ( lineWeight / 2 + 10 ),
          centerY: mapY( i )
        } ) );
      } );
    } );

    const rectWidth = lineWeight / 4 * 0.6;

    // @private {Rectangle} compare rectangles
    this.rectLeft = new Rectangle( -lineWeight / 8 - rectWidth / 2, 0, rectWidth, 0, {
      stroke: stroke,
      lineWidth: lineOtherWidth,
      fill: '#F00'
    } );
    this.rectRight = new Rectangle( lineWeight / 8 - rectWidth / 2, 0, rectWidth, 0, {
      stroke: stroke,
      lineWidth: lineOtherWidth,
      fill: '#0F0'
    } );

    this.addChild( this.rectLeft );
    this.addChild( this.rectRight );
    this.addChild( this.less );
    this.addChild( this.eq );
    this.addChild( this.more );

    // @private {Animation|null} - Set when an animation starts
    this.animation = null;

    this.reset();

    this.mutate( options );
  }

  /**
   * Starts a comparison between two values (with the given fills).
   * @public
   *
   * @param {number} leftValue
   * @param {number} rightValue
   * @param {ColorDef} leftFill
   * @param {ColorDef} rightFill
   */
  compare( leftValue, rightValue, leftFill, rightFill ) {
    this.rectLeft.fill = leftFill;
    this.rectRight.fill = rightFill;

    // Sanity check so we don't have multiple animations running at once.
    this.animation && this.animation.stop();

    this.animation = new Animation( {
      duration: 0.5,
      targets: [
        {
          object: this.rectLeft,
          attribute: 'rectHeight',
          from: 0,
          to: leftValue * lineWeight,
          easing: Easing.CUBIC_IN_OUT
        },
        {
          object: this.rectRight,
          attribute: 'rectHeight',
          from: 0,
          to: rightValue * lineWeight,
          easing: Easing.CUBIC_IN_OUT
        },
        {
          object: this.rectLeft,
          attribute: 'y',
          from: 0,
          to: -leftValue * lineWeight,
          easing: Easing.CUBIC_IN_OUT
        },
        {
          object: this.rectRight,
          attribute: 'y',
          from: 0,
          to: -rightValue * lineWeight,
          easing: Easing.CUBIC_IN_OUT
        }
      ]
    } );
    this.animation.start();

    this.less.visible = leftValue < rightValue;
    this.eq.visible = leftValue === rightValue;
    this.more.visible = leftValue > rightValue;
    this.visible = true;
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    this.animation && this.animation.step( dt );
  }

  /**
   * Resets the state
   * @public
   */
  reset() {
    this.rectLeft.y = 0;
    this.rectRight.y = 0;
    this.rectLeft.rectHeight = 0;
    this.rectRight.rectHeight = 0;

    this.less.visible = false;
    this.eq.visible = false;
    this.more.visible = false;
    this.visible = false;
  }
}

fractionsCommon.register( 'MatchChartNode', MatchChartNode );
export default MatchChartNode;