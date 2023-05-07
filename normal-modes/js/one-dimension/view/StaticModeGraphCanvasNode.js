// Copyright 2020-2021, University of Colorado Boulder

/**
 * This node draws a static normal mode graph with a fixed amplitude to represent the normal mode.
 * It is based on States of Matter's InteractionPotentialCanvasNode.
 *
 * @author Franco Barpp Gomes (UTFPR)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import { CanvasNode } from '../../../../scenery/js/imports.js';
import NormalModesColors from '../../common/NormalModesColors.js';
import NormalModesConstants from '../../common/NormalModesConstants.js';
import normalModes from '../../normalModes.js';

class StaticModeGraphCanvasNode extends CanvasNode {

  /**
   * @param {number} normalModeNumber
   * @param {Property.<number>} modeFrequencyProperty
   * @param {Object} [options]
   */
  constructor( normalModeNumber, modeFrequencyProperty, options ) {

    options = merge( {
      graphSize: new Dimension2( 40, 25 ),
      graphStartX: 0,
      curveResolution: 100
    }, NormalModesColors.MODE_GRAPH_COLORS, options );

    options.canvasBounds = new Bounds2( 0, 0, options.graphSize.width, options.graphSize.height );
    super( options );

    // @private {number} - 0 to 9, determines the normal mode represented
    this.normalModeNumber = normalModeNumber;

    // @private {number} - how many points the curve has
    this.curveResolution = options.curveResolution;

    // @private {Dimension2}
    this.graphSize = options.graphSize;

    // @private {Object} - start point of the graph
    this.graphStart = { x: options.graphStartX, y: this.graphSize.height / 2 }; // @private

    // @private {number} - x distance between consecutive graph points
    this.xStep = this.graphSize.width / this.curveResolution;

    // @private {Array.<number>}
    this.curveYPositions = new Array( this.curveResolution );

    // @private {String} - curve stroke canvas color
    this.strokeColor = options.strokeColor;

    // @private {String} - reference line (y = 0) stroke canvas color
    this.referenceLineStrokeColor = options.referenceLineStrokeColor;

    // @private {Property.<number>}
    this.modeFrequencyProperty = modeFrequencyProperty;
  }

  /**
   * Paints the static normal mode graph.
   * @param {CanvasRenderingContext2D} context
   * @public
   */
  paintCanvas( context ) {

    // draw reference line
    context.beginPath();
    context.strokeStyle = this.referenceLineStrokeColor;
    context.lineWidth = 2;
    context.moveTo( this.graphStart.x, this.graphStart.y );
    context.lineTo( this.graphStart.x + this.graphSize.width, this.graphStart.y );
    context.stroke();

    // plot
    context.beginPath();
    context.moveTo( this.graphStart.x, this.graphStart.y );
    for ( let i = 1; i < this.curveYPositions.length; i++ ) {
      context.lineTo( this.graphStart.x + i * this.xStep, this.curveYPositions[ i ] + this.graphStart.y );
    }
    context.lineTo( this.graphStart.x + this.graphSize.width, this.graphStart.y );

    context.strokeStyle = this.strokeColor;
    context.lineWidth = 2;
    context.stroke();
  }

  /**
   * Updates the curve.
   * Note that this happens only once. Because it is static, there's no need to keep updating it.
   * @public
   */
  update() {

    const n = this.normalModeNumber;
    const amplitude = 0.075;
    const phase = 0;
    const frequency = this.modeFrequencyProperty.get();
    const time = 0;

    // put a negative sign in front of it because of y coordinate stuff
    const heightFactor = -( 2 * this.graphSize.height / 3 );

    // this result is the same for all curve positions, so it's more efficient to only run it once
    const cos = Math.cos( frequency * time - phase );

    for ( let i = 0; i < this.curveYPositions.length; i++ ) {
      const x = i / this.curveResolution;

      const sin = Math.sin( x * ( n + 1 ) * Math.PI );
      this.curveYPositions[ i ] = heightFactor * ( amplitude * sin * cos ) / NormalModesConstants.MAX_AMPLITUDE;
    }
  }
}

normalModes.register( 'StaticModeGraphCanvasNode', StaticModeGraphCanvasNode );
export default StaticModeGraphCanvasNode;