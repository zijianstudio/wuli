// Copyright 2014-2022, University of Colorado Boulder

/**
 * A Scenery node that consists of two fractions and two color patches, used when prompting the user to create a shape
 * that is comprised to two different colors.
 *
 * @author John Blanco
 */

import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import FractionNode from './FractionNode.js';

// constants
const MULTI_LINE_SPACING = 5; // Empirically determined to look good
const SINGLE_LINE_SPACING = 12; // Empirically determined to look good
const PROMPT_TO_COLOR_SPACING = 4; // Empirically determined to look good

class ColorProportionsPrompt extends Node {

  /**
   * @param {string || Color} color1 - Color value for the 1st color patch
   * @param {string || Color} color2 - Color value for the 2nd color patch
   * @param {Fraction} color1Proportion - Fraction of the whole that is comprised of color1, must be between 0 and 1,
   * inclusive.  The proportion for color2 is deduced from this value, with the two proportions summing to 1.
   * @param {Object} [options]
   */
  constructor( color1, color2, color1Proportion, options ) {
    super();

    options = merge( {
      font: new PhetFont( { size: 18 } ),
      textFill: 'black',
      multiLine: false
    }, options );

    this.color1FractionNode = new FractionNode( color1Proportion, {
      font: options.font,
      color: options.textFill
    } );
    this.addChild( this.color1FractionNode );

    const color2Proportion = new Fraction( color1Proportion.denominator - color1Proportion.numerator, color1Proportion.denominator );
    this.color2FractionNode = new FractionNode( color2Proportion, {
      font: options.font,
      color: options.textFill
    } );
    this.addChild( this.color2FractionNode );

    const colorPatchShape = Shape.ellipse( 0, 0, this.color1FractionNode.bounds.height * 0.5, this.color1FractionNode.bounds.height * 0.35 );
    this.color1Patch = new Path( colorPatchShape, {
      fill: color1,
      left: this.color1FractionNode.right + PROMPT_TO_COLOR_SPACING,
      centerY: this.color1FractionNode.centerY
    } );
    this.addChild( this.color1Patch );

    // Position the 2nd prompt based on whether or not the options specify multi-line.
    if ( options.multiLine ) {
      this.color2FractionNode.top = this.color1FractionNode.bottom + MULTI_LINE_SPACING;
    }
    else {
      this.color2FractionNode.left = this.color1Patch.right + SINGLE_LINE_SPACING;
    }

    this.color2Patch = new Path( colorPatchShape, {
      fill: color2,
      left: this.color2FractionNode.right + PROMPT_TO_COLOR_SPACING,
      centerY: this.color2FractionNode.centerY
    } );
    this.addChild( this.color2Patch );

    this.mutate( options );
  }


  set color1( color ) {
    this.color1Patch.fill = color;
  }

  get color1() {
    return this.color1Patch.fill;
  }

  set color2( color ) {
    this.color2Patch.fill = color;
  }

  get color2() {
    return this.color2Patch.fill;
  }

  set color1Proportion( color1Proportion ) {
    this.color1FractionNode.fraction = color1Proportion;
    this.color2FractionNode.fraction = new Fraction( color1Proportion.denominator - color1Proportion.numerator, color1Proportion.denominator );
  }

  get color1Proportion() {
    return this.color1FractionNode.fraction;
  }
}

areaBuilder.register( 'ColorProportionsPrompt', ColorProportionsPrompt );
export default ColorProportionsPrompt;