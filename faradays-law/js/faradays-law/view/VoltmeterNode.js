// Copyright 2014-2022, University of Colorado Boulder

/**
 * Voltmeter for 'Faradays Law' simulation model
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import MinusNode from '../../../../scenery-phet/js/MinusNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PlusNode from '../../../../scenery-phet/js/PlusNode.js';
import ShadedRectangle from '../../../../scenery-phet/js/ShadedRectangle.js';
import { Color, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawStrings from '../../FaradaysLawStrings.js';
import VoltmeterGauge from './VoltmeterGauge.js';

const faradaysLawVoltageString = FaradaysLawStrings[ 'faradays-law' ].voltage;

// constants
const TERMINAL_COLOR = '#C0C0C0';
const TERMINAL_STROKE = '#000000';
const TERMINAL_BORDER_RADIUS = 3;
const RECTANGLE_HEIGHT = 107;
const READOUT_WIDTH = 132;
const TERMINAL_SIZE = 18; // size of terminals at the bottom of the voltmeter
const TERMINAL_SIGN_SIZE = new Dimension2( 12, 2 ); // size of plus and minus signs

class VoltmeterNode extends Node {

  /**
   * @param {NumberProperty} needleAngleProperty - angle of needle in voltmeter
   * @param {Tandem} tandem - This type should not be instrumented! Instead it will be instrumented by
   * VoltmeterAndWiresNode, see https://github.com/phetsims/faradays-law/issues/106
   */
  constructor( needleAngleProperty, tandem ) {
    super();

    const background = new ShadedRectangle( new Bounds2( 0, 0, 170, RECTANGLE_HEIGHT ), {
      cornerRadius: 10,
      baseColor: new Color( '#232674' ),
      center: Vector2.ZERO
    } );
    this.addChild( background );

    // background rectangle with a deflecting needle meter inside
    const readoutBackground = new Rectangle( 0, 0, READOUT_WIDTH, 72, {
      cornerRadius: 5,
      fill: '#FFF',
      centerX: 0,
      centerY: -5 // empirically determined to allow space for the label under the readout
    } );

    // scale + needle
    readoutBackground.addChild( new VoltmeterGauge( needleAngleProperty, {
      centerX: readoutBackground.width / 2,
      centerY: readoutBackground.height / 2
    } ) );
    this.addChild( readoutBackground );

    // create the label and scale it if it's too long
    const label = new Text( faradaysLawVoltageString, {
      font: new PhetFont( 18 ),
      fill: 'yellow',
      tandem: tandem.createTandem( 'labelText' ),
      phetioDocumentation: 'Text label at the bottom of the voltmeter',
      maxWidth: READOUT_WIDTH // Support PhET-iO
    } );
    label.scale( Math.min( readoutBackground.width / label.width, 1 ) );

    // position and add the label
    label.centerX = 0;
    label.centerY = ( readoutBackground.bottom + background.bottom ) * 0.48;

    // When the text changes (via PhET-iO), re-center it
    label.stringProperty.lazyLink( () => {
      label.centerX = 0;
    } );
    this.addChild( label );

    // add the plus and minus terminals at the bottom
    // @public
    this.plusNode = new Node( {
      children: [
        new Rectangle( -TERMINAL_SIZE / 2, -TERMINAL_SIZE / 2, TERMINAL_SIZE, TERMINAL_SIZE, TERMINAL_BORDER_RADIUS, TERMINAL_BORDER_RADIUS, {
          fill: TERMINAL_COLOR,
          stroke: TERMINAL_STROKE
        } ),
        new PlusNode( {
          centerX: 0,
          centerY: 0,
          size: TERMINAL_SIGN_SIZE
        } )
      ],
      center: new Vector2( TERMINAL_SIZE, RECTANGLE_HEIGHT / 2 + TERMINAL_SIZE / 2 )
    } );
    this.addChild( this.plusNode );

    // @public
    this.minusNode = new Node( {
      children: [
        new Rectangle( -TERMINAL_SIZE / 2, -TERMINAL_SIZE / 2, TERMINAL_SIZE, TERMINAL_SIZE, TERMINAL_BORDER_RADIUS, TERMINAL_BORDER_RADIUS, {
          fill: TERMINAL_COLOR,
          stroke: TERMINAL_STROKE
        } ),
        new MinusNode( {
          centerX: 0,
          centerY: 0,
          size: TERMINAL_SIGN_SIZE
        } )
      ],
      center: new Vector2( -TERMINAL_SIZE, RECTANGLE_HEIGHT / 2 + TERMINAL_SIZE / 2 )
    } );
    this.addChild( this.minusNode );
  }
}

faradaysLaw.register( 'VoltmeterNode', VoltmeterNode );
export default VoltmeterNode;