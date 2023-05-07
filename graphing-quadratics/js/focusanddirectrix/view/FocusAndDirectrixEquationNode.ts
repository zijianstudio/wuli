// Copyright 2018-2023, University of Colorado Boulder

/**
 * Static equation in the form: y = (1/(4p)(x - h)^2 + k
 * This is an alternative version of the vertex form, when 1/(4p) is substituted for a.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { Line, Node, NodeOptions, RichText, VBox } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GQConstants from '../../common/GQConstants.js';
import GQSymbols from '../../common/GQSymbols.js';
import graphingQuadratics from '../../graphingQuadratics.js';

const FONT = GQConstants.INTERACTIVE_EQUATION_FONT;
const FRACTION_FONT = GQConstants.INTERACTIVE_EQUATION_FRACTION_FONT;
const COLOR = 'black';

export default class FocusAndDirectrixEquationNode extends Node {

  public constructor( tandem: Tandem ) {

    const options: NodeOptions = {
      maxWidth: 225, // determined empirically
      tandem: tandem,
      phetioDocumentation: 'the equation shown at the top of this accordion box',
      visiblePropertyOptions: { phetioReadOnly: true }
    };

    // y =
    const yEqualsString = `${GQSymbols.y} ${MathSymbols.EQUAL_TO}`;
    const yEqualsNode = new RichText( yEqualsString, {
      font: FONT,
      fill: COLOR
    } );

    // 1
    const numeratorNode = new RichText( '1', {
      font: FRACTION_FONT,
      fill: COLOR
    } );

    // 4p
    const denominatorString = `4${GQSymbols.p}`;
    const denominatorNode = new RichText( denominatorString, {
      font: FRACTION_FONT,
      fill: COLOR
    } );

    // horizontal line between numerator and denominator
    const fractionLineLength = 1.25 * Math.max( numeratorNode.width, denominatorNode.width );
    const fractionLine = new Line( 0, 0, fractionLineLength, 0, {
      stroke: COLOR,
      lineWidth: 1
    } );

    // 1/4p
    const fractionNode = new VBox( {
      spacing: 2,
      align: 'center',
      children: [ numeratorNode, fractionLine, denominatorNode ]
    } );

    // (x - h)^2 + k
    const rightString = StringUtils.fillIn( '({{x}} {{minus}} {{h}})<sup>2</sup> {{plus}} {{k}}', {
      x: GQSymbols.x,
      h: GQSymbols.h,
      k: GQSymbols.k,
      plus: MathSymbols.PLUS,
      minus: MathSymbols.MINUS
    } );
    const rightNode = new RichText( rightString, {
      font: FONT,
      fill: COLOR
    } );

    options.children = [ yEqualsNode, fractionNode, rightNode ];

    const xSpacing = 5;
    fractionNode.left = yEqualsNode.right + xSpacing;
    fractionNode.centerY = yEqualsNode.centerY;
    rightNode.left = fractionNode.right + xSpacing;

    super( options );
  }
}

graphingQuadratics.register( 'FocusAndDirectrixEquationNode', FocusAndDirectrixEquationNode );