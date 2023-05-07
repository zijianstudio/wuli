// Copyright 2014-2022, University of Colorado Boulder

/**
 * Voltmeter wires for 'Faradays Law' simulation model
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Circle, Color, Node, Path, RadialGradient } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawConstants from '../FaradaysLawConstants.js';

// constants
const BULB_POSITION = FaradaysLawConstants.BULB_POSITION;
const VOLTMETER_POSITION = FaradaysLawConstants.VOLTMETER_POSITION;

class VoltmeterWiresNode extends Node {

  /**
   * @param {VoltmeterNode} voltmeterNode
   */
  constructor( voltmeterNode ) {
    super();

    const wireColor = '#353a89';
    const wireWidth = 3;

    // variables, used for measuring pads too
    const leftWireX = VOLTMETER_POSITION.x + voltmeterNode.minusNode.centerX;
    const rightWireX = VOLTMETER_POSITION.x + voltmeterNode.plusNode.centerX;
    const wireTop = VOLTMETER_POSITION.y + voltmeterNode.height / 2;

    // wires goes not to exactly to bulb position, need small deltas
    const leftWireBottom = BULB_POSITION.y - 23;
    const rightWireBottom = BULB_POSITION.y - 10;

    this.addChild( new Path( new Shape()
      .moveTo( leftWireX, wireTop )
      .lineTo( leftWireX, leftWireBottom ), {
      stroke: wireColor,
      lineWidth: wireWidth
    } ) );

    this.addChild( new Path( new Shape()
      .moveTo( rightWireX, wireTop )
      .lineTo( rightWireX, rightWireBottom ), {
      stroke: wireColor,
      lineWidth: wireWidth
    } ) );

    this.addChild( createPad( {
      centerX: leftWireX,
      centerY: leftWireBottom
    } ) );

    this.addChild( createPad( {
      centerX: rightWireX,
      centerY: rightWireBottom
    } ) );

    // For PhET-iO, synchronize visibility with the VoltmeterNode
    const updateVisible = () => {
      this.visible = voltmeterNode.visible;
    };
    voltmeterNode.visibleProperty.lazyLink( updateVisible );
    updateVisible();
  }
}

/**
 * Creates measure pad.
 * @param {Object} [options]
 * @returns {Node}
 */
const createPad = options => {

  // params
  const baseColor = new Color( '#b4b5b5' );
  const transparentColor = baseColor.withAlpha( 0 );
  const radius = 7;
  const gradientLength = 2;
  const innerGradientRadius = radius - gradientLength / 2;
  const outerGradientRadius = radius + gradientLength / 2;
  const gradientOffset = gradientLength / 2;

  const pad = new Node();

  // Create the gradient fills
  const highlightFill = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
    .addColorStop( 0, baseColor )
    .addColorStop( 1, baseColor.colorUtilsBrighter( 0.7 ) );

  const shadowFill = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
    .addColorStop( 0, transparentColor )
    .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

  // base circle with white gradient
  const baseCircle = new Circle( radius, { fill: highlightFill } );
  pad.addChild( baseCircle );

  // black gradient
  const overlayForShadowGradient = new Circle( radius, { fill: shadowFill } );
  pad.addChild( overlayForShadowGradient );

  pad.mutate( options );
  return pad;
};

faradaysLaw.register( 'VoltmeterWiresNode', VoltmeterWiresNode );
export default VoltmeterWiresNode;