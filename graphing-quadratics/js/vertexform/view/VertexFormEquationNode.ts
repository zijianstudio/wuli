// Copyright 2018-2023, University of Colorado Boulder

/**
 * Static equation in vertex form: y = a(x - h)^2 + k
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { Node, NodeOptions, RichText } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GQConstants from '../../common/GQConstants.js';
import GQSymbols from '../../common/GQSymbols.js';
import graphingQuadratics from '../../graphingQuadratics.js';

export default class VertexFormEquationNode extends Node {

  public constructor( tandem: Tandem ) {

    const options: NodeOptions = {
      maxWidth: 225, // determined empirically
      tandem: tandem,
      phetioDocumentation: 'the equation shown at the top of this accordion box',
      visiblePropertyOptions: { phetioReadOnly: true }
    };

    // y = a(x - h)^2 + k
    const text = StringUtils.fillIn( '{{y}} {{equals}} {{a}}({{x}} {{minus}} {{h}})<sup>2</sup> {{plus}} {{k}}', {
      x: GQSymbols.x,
      y: GQSymbols.y,
      a: GQSymbols.a,
      h: GQSymbols.h,
      k: GQSymbols.k,
      equals: MathSymbols.EQUAL_TO,
      minus: MathSymbols.MINUS,
      plus: MathSymbols.PLUS
    } );

    const textNode = new RichText( text, {
      font: GQConstants.INTERACTIVE_EQUATION_FONT,
      fill: 'black'
    } );

    // Wrap the RichText so that its API is not accessible to clients or PhET-iO.
    options.children = [ textNode ];

    super( options );
  }
}

graphingQuadratics.register( 'VertexFormEquationNode', VertexFormEquationNode );