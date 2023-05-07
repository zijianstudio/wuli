// Copyright 2014-2023, University of Colorado Boulder

/**
 * A Scenery node that represents a fraction.
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line, Node, Text } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';

class FractionNode extends Node {

  /**
   * @param {Fraction} fraction
   * @param {Object} [options]
   */
  constructor( fraction, options ) {
    super();
    options = merge( {
      // default options
      font: new PhetFont( { size: 18 } ),
      color: 'black',
      fractionBarLineWidth: 1,

      // this option controls the width of the fraction bar as a function of the widest of the numerator and denominator.
      fractionBarWidthProportion: 1.1
    }, options );

    assert && assert( options.fractionBarWidthProportion >= 1, 'The fraction bar must be at least the width of the larger fraction component.' );

    // Create and add the pieces
    this.numeratorNode = new Text( '0', { font: options.font, fill: options.color } );
    this.addChild( this.numeratorNode );
    this.denominatorNode = new Text( '0', { font: options.font, fill: options.color } );
    this.addChild( this.denominatorNode );
    const fractionBarWidth = options.fractionBarWidthProportion * Math.max( this.numeratorNode.width, this.denominatorNode.width );
    this.fractionBarNode = new Line( 0, 0, fractionBarWidth, 0, {
      stroke: options.color,
      lineWidth: options.fractionBarLineWidth
    } );
    this.addChild( this.fractionBarNode );

    this._fraction = fraction;
    this.update();
  }


  // @private
  update() {
    this.numeratorNode.string = this._fraction.numerator.toString();
    this.denominatorNode.string = this._fraction.denominator.toString();

    // Note: The fraction bar width is not updated here because the Line type didn't support changes when this code
    // was developed and the code that used this node didn't really need it.  If this code is being used in a more
    // general way, where the elements of the fraction could reach multiple digits, adjustments to the size of the
    // fraction bar will need to be added here.

    // layout
    this.numeratorNode.centerX = this.fractionBarNode.centerX;
    this.denominatorNode.centerX = this.fractionBarNode.centerX;
    this.fractionBarNode.centerY = this.numeratorNode.bottom;
    this.denominatorNode.top = this.fractionBarNode.bottom;
  }

  set fraction( fraction ) {
    this._fraction = fraction;
    this.update();
  }

  get fraction() {
    return this._fraction;
  }
}

areaBuilder.register( 'FractionNode', FractionNode );
export default FractionNode;