// Copyright 2013-2023, University of Colorado Boulder

/**
 * Node for the left/right fraction with up/down spinners for denominator/numerator
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import fractionComparison from '../../fractionComparison.js';
import UpDownSpinner from './UpDownSpinner.js';

class FractionNode extends Node {

  /**
   * @param {Property.<number>} numeratorProperty
   * @param {Property.<number>} denominatorProperty
   * @param {Object} [options]
   */
  constructor( numeratorProperty, denominatorProperty, options ) {

    options = merge( {

      fill: 'black',
      //By default the fraction node is interactive, which means it has up/down spinners
      //Those spinners can be removed if the fraction node will be used as a label for underneath the number line
      interactive: true
    }, options );

    super();
    const font = new PhetFont( { size: 84 } );
    const numeratorNode = new Text( numeratorProperty.get(), { font: font, fill: options.fill } );

    const line = new Line( 0, 0, 80, 0, { lineWidth: 4, stroke: options.fill } );
    this.addChild( line );

    numeratorProperty.link( value => {
      numeratorNode.string = `${value}`;
      numeratorNode.centerX = line.centerX;
    } );

    const denominatorNode = new Text( denominatorProperty.get(), { font: font, fill: options.fill } );
    denominatorProperty.link( value => {
      denominatorNode.string = `${value}`;
      denominatorNode.centerX = line.centerX;
    } );

    numeratorNode.mutate( { centerX: line.centerX, bottom: line.bounds.minY - 2 } );
    denominatorNode.mutate( { centerX: line.centerX, top: line.bounds.maxY - 2 } );

    this.addChild( numeratorNode );
    this.addChild( denominatorNode );

    if ( options.interactive ) {
      const numeratorUpEnabledProperty = new DerivedProperty(
        [ numeratorProperty, denominatorProperty ],
        ( numerator, denominator ) => numerator < denominator );
      const numeratorDownEnabledProperty = new DerivedProperty(
        [ numeratorProperty ],
        numerator => numerator > 0 );
      const denominatorUpEnabledProperty = new DerivedProperty(
        [ denominatorProperty ],
        denominator => denominator < 10 );
      const denominatorDownEnabledProperty = new DerivedProperty(
        [ numeratorProperty, denominatorProperty ],
        ( numerator, denominator ) => denominator > 1 && numerator < denominator );

      const numeratorSpinner = new UpDownSpinner( numeratorProperty, numeratorUpEnabledProperty, numeratorDownEnabledProperty );
      const denominatorSpinner = new UpDownSpinner( denominatorProperty, denominatorUpEnabledProperty, denominatorDownEnabledProperty );

      const spinners = new VBox( {
        spacing: 20,
        children: [ numeratorSpinner, denominatorSpinner ],
        left: line.bounds.maxX + 5,
        centerY: line.bounds.centerY
      } );
      this.addChild( spinners );
    }

    this.mutate( options );
  }
}

fractionComparison.register( 'FractionNode', FractionNode );

export default FractionNode;