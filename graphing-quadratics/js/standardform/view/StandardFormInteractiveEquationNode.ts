// Copyright 2018-2023, University of Colorado Boulder

/**
 * Standard form equation, y = ax^2 + bx + c, with integer coefficients that can be changed via pickers.
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

export default class StandardFormInteractiveEquationNode extends Node {

  /**
   * Constructor parameters are coefficients of the standard form: y = ax^2 + bx + c
   */
  public constructor( aProperty: NumberProperty, bProperty: NumberProperty, cProperty: NumberProperty, tandem: Tandem ) {

    const options: NodeOptions = {
      tandem: tandem,
      phetioDocumentation: 'the interactive equation in this accordion box'
    };

    // coefficient pickers
    const aPicker = new NumberPicker( aProperty, new Property( aProperty.range ),
      merge( {
        color: GQColors.STANDARD_FORM_A,
        tandem: tandem.createTandem( 'aPicker' ),
        phetioDocumentation: StringUtils.fillIn( GQConstants.PICKER_DOC, { symbol: 'a' } )
      }, GQConstants.NUMBER_PICKER_OPTIONS ) );
    const bPicker = new NumberPicker( bProperty, new Property( bProperty.range ),
      merge( {
        color: GQColors.STANDARD_FORM_B,
        tandem: tandem.createTandem( 'bPicker' ),
        phetioDocumentation: StringUtils.fillIn( GQConstants.PICKER_DOC, { symbol: 'b' } )
      }, GQConstants.NUMBER_PICKER_OPTIONS ) );
    const cPicker = new NumberPicker( cProperty, new Property( cProperty.range ),
      merge( {
        color: GQColors.STANDARD_FORM_C,
        tandem: tandem.createTandem( 'cPicker' ),
        phetioDocumentation: StringUtils.fillIn( GQConstants.PICKER_DOC, { symbol: 'c' } )
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
    const xSquaredText = new RichText( GQSymbols.xSquared, xyOptions );
    const plusText = new RichText( MathSymbols.PLUS, richTextOptions );
    const xText = new RichText( GQSymbols.x, xyOptions );
    const secondPlusText = new RichText( MathSymbols.PLUS, richTextOptions );

    options.children = [
      yText, equalToText, aPicker, xSquaredText, plusText, bPicker, xText, secondPlusText, cPicker
    ];

    super( options );

    // layout
    equalToText.left = yText.right + GQConstants.EQUATION_OPERATOR_SPACING;
    aPicker.left = equalToText.right + GQConstants.EQUATION_OPERATOR_SPACING;
    xSquaredText.left = aPicker.right + GQConstants.EQUATION_TERM_SPACING;
    plusText.left = xSquaredText.right + GQConstants.EQUATION_OPERATOR_SPACING;
    bPicker.left = plusText.right + GQConstants.EQUATION_OPERATOR_SPACING;
    xText.left = bPicker.right + GQConstants.EQUATION_TERM_SPACING;
    secondPlusText.left = xText.right + GQConstants.EQUATION_OPERATOR_SPACING;
    cPicker.left = secondPlusText.right + GQConstants.EQUATION_OPERATOR_SPACING;

    // vertically center pickers on equals
    aPicker.centerY = equalToText.centerY;
    bPicker.centerY = equalToText.centerY;
    cPicker.centerY = equalToText.centerY;
  }
}

graphingQuadratics.register( 'StandardFormInteractiveEquationNode', StandardFormInteractiveEquationNode );