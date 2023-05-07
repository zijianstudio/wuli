// Copyright 2017-2022, University of Colorado Boulder

/**
 * A legend graphic consisting of a double-ended arrow, two endpoint lines, and a label string. Intended to visually
 * indicate a distance scale.
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import ArrowNode from '../../../scenery-phet/js/ArrowNode.js';
import { Line, Node, Text } from '../../../scenery/js/imports.js';
import inverseSquareLawCommon from '../inverseSquareLawCommon.js';

class ISLCLegendNode extends Node {

  /**
   * @param {number} width (in view coordinates)
   * @param {string} labelString
   * @param {Object} [options]
   */
  constructor( width, labelString, options ) {

    options = merge( {
      fill: 'rgb(0,255,0)',
      fontSize: 14,
      maxWidth: 85
    }, options );

    super();
    this.center.subtractXY( 0, 10 );

    // @public (read-only) - layout for this type is often relative to this line
    this.legendArrowLine = new ArrowNode( 0, 100, width, 100, {
      fill: options.fill,
      stroke: null,
      headHeight: 4,
      headWidth: 5,
      tailWidth: 2,
      lineWidth: 1,
      doubleHead: true
    } );

    this.addChild( this.legendArrowLine );

    // create left and right end lines
    const endLinesBottom = this.legendArrowLine.bottom + 2.5;
    const endLinesTop = endLinesBottom - 10;
    const endLinesOptions = {
      stroke: options.fill,
      lineWidth: 1.25
    };

    const leftEndLine = new Line( this.legendArrowLine.left, endLinesBottom, this.legendArrowLine.left, endLinesTop, endLinesOptions );
    const rightEndLine = new Line( this.legendArrowLine.right, endLinesBottom, this.legendArrowLine.right, endLinesTop, endLinesOptions );

    this.legendArrowLine.addChild( leftEndLine );
    this.legendArrowLine.addChild( rightEndLine );

    const legendLabel = new Text( labelString, {
      fill: options.fill,
      fontSize: 14,
      maxWidth: 65
    } );

    this.addChild( legendLabel );
    this.mutate( options );

    // positioning
    legendLabel.centerX = this.localBounds.centerX;
    legendLabel.bottom = this.localBounds.maxY - 18;

    this.legendArrowLine.centerX = this.localBounds.centerX;
    this.legendArrowLine.bottom = this.localBounds.maxY;
  }
}

inverseSquareLawCommon.register( 'ISLCLegendNode', ISLCLegendNode );

export default ISLCLegendNode;