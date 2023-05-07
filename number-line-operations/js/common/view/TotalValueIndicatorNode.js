// Copyright 2020-2023, University of Colorado Boulder

/**
 * TotalValueIndicatorNode is a Scenery node that takes a background node and shows a total value over it, and fills
 * the total value node with different colors based on the total value.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Node, Text } from '../../../../scenery/js/imports.js';
import numberLineOperations from '../../numberLineOperations.js';
import NumberLineOperationsStrings from '../../NumberLineOperationsStrings.js';

class TotalValueIndicatorNode extends Node {

  /**
   * @param {NumberProperty} totalValueProperty
   * @param {Node} fillableBackgroundNode - the node that will serve as the background to the value, must support setting fill
   * @param {Range} range
   * @param {Object} [options]
   */
  constructor( totalValueProperty, fillableBackgroundNode, range, options ) {

    options = merge( {

      // {Vector2} - offset of the label from the center of the background node
      labelCenterOffset: Vector2.ZERO,

      // {boolean} - if false, just shows the number, if true, uses a currency symbol and pattern
      isCurrency: false,

      // {Color} - color values used, and interpolated between, as the total value changes
      zeroFill: Color.WHITE,
      mostPositiveFill: new Color( '#1fb493' ),
      leastPositiveFill: new Color( '#a5e1d4' ),
      mostNegativeFill: new Color( '#fb1d25' ),
      leastNegativeFill: new Color( '#fda5a8' )
    }, options );

    // label that represents the value
    const labelNode = new Text( '', {
      font: new PhetFont( 20 ),
      fill: 'white',
      stroke: 'black',
      center: Vector2.ZERO,
      maxWidth: 65
    } );

    super( merge( { children: [ fillableBackgroundNode, labelNode ] }, options ) );

    // Update the fill and label as the total value changes.  Instances of this type are assumed to exist for the
    // duration of the sim, so no unlink is necessary.
    totalValueProperty.link( totalValue => {

      // Update the label text.
      const sign = totalValue < 0 ? MathSymbols.MINUS : '';
      if ( options.isCurrency ) {
        labelNode.string = StringUtils.fillIn( NumberLineOperationsStrings.currencyValuePattern, {
          sign: sign,
          currencyUnits: NumberLineOperationsStrings.currencyUnits,
          value: Math.abs( totalValue )
        } );
      }
      else {
        labelNode.string = sign + Math.abs( totalValue ).toString( 10 );
      }

      // Reposition the label.
      labelNode.center = fillableBackgroundNode.center.plus( options.labelCenterOffset );

      // Set the fill.
      let fill = options.zeroFill;
      if ( totalValue < 0 ) {
        fill = Color.interpolateRGBA(
          options.leastNegativeFill,
          options.mostNegativeFill,
          totalValue / range.min
        );
      }
      else if ( totalValue > 0 ) {
        fill = Color.interpolateRGBA(
          options.leastPositiveFill,
          options.mostPositiveFill,
          totalValue / range.max
        );
      }
      fillableBackgroundNode.fill = fill;
    } );
  }
}

numberLineOperations.register( 'TotalValueIndicatorNode', TotalValueIndicatorNode );
export default TotalValueIndicatorNode;