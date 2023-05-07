// Copyright 2018-2023, University of Colorado Boulder

/**
 * Alternate vertex form equation, y = (1/(4p))(x - h)^2 + k, with coefficients that can be changed via sliders.
 * All sliders have a linear taper.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import { HBox, Line, Node, NodeOptions, RichText, VBox } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import GQSymbols from '../../common/GQSymbols.js';
import LinearSlider from '../../common/view/LinearSlider.js';
import graphingQuadratics from '../../graphingQuadratics.js';

export default class FocusAndDirectrixInteractiveEquationNode extends Node {

  /**
   * Constructor parameters are coefficients of the alternate vertex form: y = (1/(4p))(x - h)^2 + k
   */
  public constructor( pProperty: NumberProperty, hProperty: NumberProperty, kProperty: NumberProperty, tandem: Tandem ) {

    const options: NodeOptions = {
      tandem: tandem,
      phetioDocumentation: 'the interactive equation in this accordion box'
    };

    // equation
    const equationNode = new EquationNode( pProperty, hProperty, kProperty, tandem.createTandem( 'equationNode' ) );

    // value sliders
    const pSlider = new LinearSlider( GQSymbols.p, pProperty, {

      // p=0 is not supported by this sim because it results in division by zero for 1/(4p).
      // see https://github.com/phetsims/graphing-quadratics/issues/31
      skipZero: true,
      interval: GQConstants.FOCUS_AND_DIRECTRIX_INTERVAL_P,
      labelColor: GQColors.FOCUS_AND_DIRECTRIX_P,
      tandem: tandem.createTandem( 'pSlider' ),
      phetioDocumentation: StringUtils.fillIn( GQConstants.SLIDER_DOC, { symbol: 'p' } )
    } );
    const hSlider = new LinearSlider( GQSymbols.h, hProperty, {
      interval: GQConstants.FOCUS_AND_DIRECTRIX_INTERVAL_H,
      labelColor: GQColors.FOCUS_AND_DIRECTRIX_H,
      tandem: tandem.createTandem( 'hSlider' ),
      phetioDocumentation: StringUtils.fillIn( GQConstants.SLIDER_DOC, { symbol: 'h' } )
    } );
    const kSlider = new LinearSlider( GQSymbols.k, kProperty, {
      interval: GQConstants.FOCUS_AND_DIRECTRIX_INTERVAL_K,
      labelColor: GQColors.FOCUS_AND_DIRECTRIX_K,
      tandem: tandem.createTandem( 'kSlider' ),
      phetioDocumentation: StringUtils.fillIn( GQConstants.SLIDER_DOC, { symbol: 'k' } )
    } );

    options.children = [ equationNode, pSlider, hSlider, kSlider ];

    super( options );

    // horizontally align sliders under their associated values in the equation
    const ySpacing = 3;
    pSlider.x = this.globalToLocalBounds( equationNode.pGlobalBounds ).centerX;
    pSlider.top = equationNode.bottom + ySpacing;
    hSlider.x = this.globalToLocalBounds( equationNode.hGlobalBounds ).centerX;
    hSlider.top = equationNode.bottom + ySpacing;
    kSlider.x = this.globalToLocalBounds( equationNode.kGlobalBounds ).centerX;
    kSlider.top = equationNode.bottom + ySpacing;
  }
}

/**
 * The equation that appears above the sliders.
 */
class EquationNode extends Node {

  private readonly pNode: Node;
  private readonly hNode: Node;
  private readonly kNode: Node;

  public constructor( pProperty: NumberProperty, hProperty: NumberProperty, kProperty: NumberProperty, tandem: Tandem ) {

    const options: NodeOptions = {
      tandem: tandem,
      phetioDocumentation: 'the equation that changes as the sliders are adjusted'
    };

    // options for parts of the equation
    const equationOptions = {
      font: GQConstants.INTERACTIVE_EQUATION_FONT
    };
    const xyOptions = merge( {}, equationOptions, {
      maxWidth: 20 // determined empirically
    } );

    // y
    const yNode = new RichText( GQSymbols.y, xyOptions );

    // =
    const equalsNode = new RichText( MathSymbols.EQUAL_TO, equationOptions );

    // 1
    const numeratorNode = new RichText( '1', equationOptions );

    // 4(
    const fourParenNode = new RichText( '4(', equationOptions );

    // p value
    const pNode = new NumberDisplay( pProperty, pProperty.range,
      merge( {}, GQConstants.NUMBER_DISPLAY_OPTIONS, {
        textOptions: {
          fill: GQColors.FOCUS_AND_DIRECTRIX_P
        },
        decimalPlaces: GQConstants.FOCUS_AND_DIRECTRIX_DECIMALS_P
      } ) );

    // )
    const parenNode = new RichText( ')', equationOptions );

    // 4(p)
    const denominatorNode = new HBox( {
      align: 'center',
      children: [ fourParenNode, pNode, parenNode ]
    } );

    // horizontal line between numerator and denominator
    const fractionLineLength = 1.1 * Math.max( numeratorNode.width, denominatorNode.width );
    const fractionLine = new Line( 0, 0, fractionLineLength, 0, {
      stroke: 'black',
      lineWidth: 1
    } );

    // 1/4p
    const fractionNode = new VBox( {
      spacing: 2,
      align: 'center',
      children: [ numeratorNode, fractionLine, denominatorNode ],
      scale: 0.85
    } );

    // (
    const anotherParenNode = new RichText( '(', equationOptions );

    // x
    const xNode = new RichText( GQSymbols.x, xyOptions );

    // -
    const minusNode = new RichText( MathSymbols.MINUS, equationOptions );

    // h value
    const hNode = new NumberDisplay( hProperty, hProperty.range,
      merge( {}, GQConstants.NUMBER_DISPLAY_OPTIONS, {
        textOptions: {
          fill: GQColors.FOCUS_AND_DIRECTRIX_H
        },
        decimalPlaces: GQConstants.FOCUS_AND_DIRECTRIX_DECIMALS_H
      } ) );

    // )^2
    const parenSquaredNode = new RichText( ')<sup>2</sup>', equationOptions );

    // +
    const plusNode = new RichText( MathSymbols.PLUS, equationOptions );

    // k value
    const kNode = new NumberDisplay( kProperty, kProperty.range,
      merge( {}, GQConstants.NUMBER_DISPLAY_OPTIONS, {
        textOptions: {
          fill: GQColors.FOCUS_AND_DIRECTRIX_K
        },
        decimalPlaces: GQConstants.FOCUS_AND_DIRECTRIX_DECIMALS_K
      } ) );

    // layout
    equalsNode.left = yNode.right + GQConstants.EQUATION_OPERATOR_SPACING;
    fractionNode.left = equalsNode.right + GQConstants.EQUATION_OPERATOR_SPACING;
    fractionNode.centerY = equalsNode.centerY;
    anotherParenNode.left = fractionNode.right + GQConstants.EQUATION_TERM_SPACING;
    xNode.left = anotherParenNode.right + GQConstants.EQUATION_TERM_SPACING;
    minusNode.left = xNode.right + GQConstants.EQUATION_OPERATOR_SPACING;
    hNode.left = minusNode.right + GQConstants.EQUATION_OPERATOR_SPACING;
    parenSquaredNode.left = hNode.right + GQConstants.EQUATION_TERM_SPACING;
    plusNode.left = parenSquaredNode.right + GQConstants.EQUATION_OPERATOR_SPACING;
    kNode.left = plusNode.right + GQConstants.EQUATION_OPERATOR_SPACING;
    hNode.bottom = equalsNode.bottom;
    kNode.bottom = equalsNode.bottom;

    // y = (1/(4p))(x - h)^2 + k
    options.children = [ yNode, equalsNode, fractionNode,
      anotherParenNode, xNode, minusNode, hNode, parenSquaredNode, plusNode, kNode ];

    super( options );

    this.pNode = pNode;
    this.hNode = hNode;
    this.kNode = kNode;
  }

  // Gets the global bounds of p, h, k, used for layout
  public get pGlobalBounds(): Bounds2 {
    return this.pNode.getGlobalBounds();
  }

  public get hGlobalBounds(): Bounds2 {
    return this.hNode.getGlobalBounds();
  }

  public get kGlobalBounds(): Bounds2 {
    return this.kNode.getGlobalBounds();
  }
}

graphingQuadratics.register( 'FocusAndDirectrixInteractiveEquationNode', FocusAndDirectrixInteractiveEquationNode );