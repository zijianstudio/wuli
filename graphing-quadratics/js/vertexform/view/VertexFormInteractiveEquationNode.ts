// Copyright 2018-2023, University of Colorado Boulder

/**
 * Vertex form equation, y = ax^2 + bx + c, with integer coefficients that can be changed via pickers.
 *
 * @author Andrea Lin
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { Node, NodeOptions, RichText } from '../../../../scenery/js/imports.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import GQSymbols from '../../common/GQSymbols.js';
import graphingQuadratics from '../../graphingQuadratics.js';

export default class VertexFormInteractiveEquationNode extends Node {

  /**
   * Constructor parameters are coefficients of the vertex form: y = ax^2 + bx + c
   */
  public constructor( aProperty: NumberProperty, hProperty: NumberProperty, kProperty: NumberProperty, tandem: Tandem ) {

    const options: NodeOptions = {
      tandem: tandem,
      phetioDocumentation: 'the interactive equation in this accordion box'
    };

    // value pickers
    const aPicker = new NumberPicker( aProperty, new Property( aProperty.range ),
      merge( {
        color: GQColors.VERTEX_FORM_A,
        tandem: tandem.createTandem( 'aPicker' ),
        phetioDocumentation: StringUtils.fillIn( GQConstants.PICKER_DOC, { symbol: 'a' } )
      }, GQConstants.NUMBER_PICKER_OPTIONS ) );
    const hPicker = new NumberPicker( hProperty, new Property( hProperty.range ),
      merge( {
        color: GQColors.VERTEX_FORM_H,
        tandem: tandem.createTandem( 'hPicker' ),
        phetioDocumentation: StringUtils.fillIn( GQConstants.PICKER_DOC, { symbol: 'h' } )
      }, GQConstants.NUMBER_PICKER_OPTIONS ) );
    const kPicker = new NumberPicker( kProperty, new Property( kProperty.range ),
      merge( {
        color: GQColors.VERTEX_FORM_K,
        tandem: tandem.createTandem( 'kPicker' ),
        phetioDocumentation: StringUtils.fillIn( GQConstants.PICKER_DOC, { symbol: 'k' } )
      }, GQConstants.NUMBER_PICKER_OPTIONS ) );

    // static parts of the equation
    const richTextOptions = {
      font: GQConstants.INTERACTIVE_EQUATION_FONT
    };
    const xyOptions = merge( {}, richTextOptions, {
      maxWidth: 30 // determined empirically
    } );
    const yText = new RichText( GQSymbols.y, xyOptions );
    const equalToText = new RichText( MathSymbols.EQUAL_TO, richTextOptions );
    const openParenthesisText = new RichText( '(', richTextOptions );
    const xText = new RichText( GQSymbols.x, xyOptions );
    const minusText = new RichText( MathSymbols.MINUS, richTextOptions );
    const parenSquaredText = new RichText( ')<sup>2</sup>', richTextOptions );
    const plusText = new RichText( MathSymbols.PLUS, richTextOptions );

    options.children = [
      yText,
      equalToText,
      aPicker,
      openParenthesisText,
      xText,
      minusText,
      hPicker,
      parenSquaredText,
      plusText,
      kPicker
    ];

    super( options );

    // layout
    equalToText.left = yText.right + GQConstants.EQUATION_OPERATOR_SPACING;
    aPicker.left = equalToText.right + GQConstants.EQUATION_OPERATOR_SPACING;
    openParenthesisText.left = aPicker.right + GQConstants.EQUATION_TERM_SPACING;
    xText.left = openParenthesisText.right + GQConstants.EQUATION_TERM_SPACING;
    minusText.left = xText.right + GQConstants.EQUATION_OPERATOR_SPACING;
    hPicker.left = minusText.right + GQConstants.EQUATION_OPERATOR_SPACING;
    parenSquaredText.left = hPicker.right + GQConstants.EQUATION_TERM_SPACING;
    plusText.left = parenSquaredText.right + GQConstants.EQUATION_OPERATOR_SPACING;
    kPicker.left = plusText.right + GQConstants.EQUATION_OPERATOR_SPACING;

    // vertically center pickers on equals
    aPicker.centerY = equalToText.centerY;
    hPicker.centerY = equalToText.centerY;
    kPicker.centerY = equalToText.centerY;
  }
}

graphingQuadratics.register( 'VertexFormInteractiveEquationNode', VertexFormInteractiveEquationNode );