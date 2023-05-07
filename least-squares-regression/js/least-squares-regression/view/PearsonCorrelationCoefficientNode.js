// Copyright 2014-2023, University of Colorado Boulder

//TODO rename to CorrelationCoefficientAccordionBox
/**
 * A Scenery node that shows the Pearson correlation coefficient in an equation form
 *
 * @author Martin Veillette (Berea College)
 */

import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { HStrut, Node, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Panel from '../../../../sun/js/Panel.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionStrings from '../../LeastSquaresRegressionStrings.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';

// string
const pattern_0r_1value = '{0} {1}';

// constants
const R_EQUALS = StringUtils.format( '{0} =', LeastSquaresRegressionStrings.symbol.r );
const MAX_LABEL_WIDTH = 120; // restrict width of labels for i18n

class PearsonCorrelationCoefficientNode extends AccordionBox {
  /**
   * @param {Graph} graph
   * @param {Object} [options]
   */
  constructor( graph, options ) {

    // Options for the Accordion Box
    options = merge( {
      cornerRadius: 3,
      buttonXMargin: 10,
      buttonYMargin: 10,
      expandCollapseButtonOptions: {
        touchAreaXDilation: 16,
        touchAreaYDilation: 16
      },
      titleYMargin: 10,
      titleNode: new RichText( LeastSquaresRegressionStrings.correlationCoefficient, {
        replaceNewlines: true,
        align: 'center',
        font: LeastSquaresRegressionConstants.TEXT_BOLD_FONT,
        maxWidth: MAX_LABEL_WIDTH
      } ),
      titleAlignY: 'top',
      contentXMargin: 10,
      contentYMargin: 10
    }, options );

    const textOptions = { font: LeastSquaresRegressionConstants.PEARSON_COEFFICIENT_TEXT_FONT };

    // Create the left hand side of the equation (includes the equal sign)
    const leftHandSideText = new Text( R_EQUALS, textOptions );

    // Create the right hand side of the equation
    const rightHandSideText = new Text( '', textOptions );

    // calculate the maximum width of the right hand side of the equation
    const rightHandSideMaxWidth = new Text( `${MathSymbols.PLUS} 0.00`, textOptions ).width;
    const hStrut = new HStrut( rightHandSideMaxWidth );

    hStrut.left = leftHandSideText.right + 5;
    rightHandSideText.left = leftHandSideText.right + 5;

    // Create the equation
    const equation = new Node( {
      children: [
        leftHandSideText,
        hStrut,
        rightHandSideText
      ],
      maxWidth: MAX_LABEL_WIDTH
    } );

    // Create the panel that holds the equation
    const mutableEquationPanel = new Panel( equation, {
      fill: LeastSquaresRegressionConstants.GRAPH_BACKGROUND_COLOR,
      cornerRadius: LeastSquaresRegressionConstants.SMALL_PANEL_CORNER_RADIUS,
      stroke: LeastSquaresRegressionConstants.SMALL_PANEL_STROKE,
      resize: false,
      xMargin: 10
    } );

    const content = new VBox( {
      children: [ new HStrut( 180 ), mutableEquationPanel ]
    } );

    super( content, options );

    // @private
    this.graph = graph;
    this.rightHandSideText = rightHandSideText;
  }

  /**
   * @public
   * @override
   */
  reset() {
    this.update();
    super.reset();
  }

  /**
   * Updates the value of the right hand side of the equation.
   * @public
   */
  update() {
    let rValueString;

    // Check for the existence of the rValue
    if ( this.graph.isLinearFitDefined() ) {
      const rValue = this.graph.getPearsonCoefficientCorrelation();

      // if the rValue is zero and there are only two points on the graph, return null.  This is to avoid
      // a precision error for when the points are aligned horizontally and the denominator is non-zero
      if ( rValue === 0 ) {
        if ( this.graph.dataPointsOnGraph.length === 2 ) {
          rValueString = '';
        }
      }

      // getPearsonCoefficientCorrelation() will return null if NaN
      if ( rValue === null ) {
        rValueString = '';
      }
      else {
        const isNegative = ( rValue < 0 );
        const signString = isNegative ? MathSymbols.MINUS : MathSymbols.PLUS;
        rValueString = StringUtils.format( pattern_0r_1value, signString, Utils.toFixed( Math.abs( rValue ), 2 ) );
      }
    }
    else {

      // Set to null if the Pearson Coefficient does not exist
      rValueString = '';
    }

    // Update the text on the right Hand side of the equation
    this.rightHandSideText.string = rValueString;
  }
}

leastSquaresRegression.register( 'PearsonCorrelationCoefficientNode', PearsonCorrelationCoefficientNode );
export default PearsonCorrelationCoefficientNode;