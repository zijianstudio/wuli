// Copyright 2014-2022, University of Colorado Boulder

/**
 * Scenery Node representing a Control Panel with check Boxes and Sliders that controls properties of My Line
 *
 * @author Martin Veillette (Berea College)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { HStrut, Node, SceneryConstants, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import VSlider from '../../../../sun/js/VSlider.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionStrings from '../../LeastSquaresRegressionStrings.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
import EquationNode from './EquationNode.js';
import SumOfSquaredResidualsChart from './SumOfSquaredResidualsChart.js';

const aString = LeastSquaresRegressionStrings.a;
const bString = LeastSquaresRegressionStrings.b;
const myLineString = LeastSquaresRegressionStrings.myLine;
const residualsString = LeastSquaresRegressionStrings.residuals;
const squaredResidualsString = LeastSquaresRegressionStrings.squaredResiduals;
const symbolXString = LeastSquaresRegressionStrings.symbol.x;
const symbolYString = LeastSquaresRegressionStrings.symbol.y;

// constants
const SLIDER_OPTIONS = {
  trackFill: 'black',
  trackSize: new Dimension2( 2, 190 ),
  thumbSize: new Dimension2( 30, 15 ),
  thumbTouchAreaXDilation: 8,
  majorTickLength: 18
};
const MAX_WIDTH = 150;

class MyLineControlPanel extends Panel {
  /**
   *
   * @param {Graph} graph
   * @param {Array.<DataPoint>} dataPoints
   * @param {Emitter} dataPointsAddedEmitter
   * @param {Object} [options]
   */
  constructor( graph, dataPoints, dataPointsAddedEmitter, options ) {


    // Create a mutable equation y = {1} x + {2} , the slope and intercept are updated later
    // max width determined empirically, and there are 6 elements that make up the equation node
    const equationCharacterMaxWidth = MAX_WIDTH / 6;
    const equationText = new EquationNode( { maxCharacterWidth: equationCharacterMaxWidth } );

    /**
     * Function that updates the value of the current slope (based on the angle of the line)
     * @param {number} angle
     */
    function updateTextSlope( angle ) {
      const slope = graph.slope( angle );
      equationText.setSlopeText( slope * graph.slopeFactor );
    }

    /**
     * Function that updates the value of the intercept
     * @param {number} intercept
     */
    function updateTextIntercept( intercept ) {
      equationText.setInterceptText( intercept * graph.interceptFactor + graph.interceptOffset );
    }

    updateTextIntercept( 0 );
    updateTextSlope( 0 );

    // Create an immutable equation y = a x + b
    const blackOptions = {
      font: LeastSquaresRegressionConstants.TEXT_FONT,
      fill: 'black',
      maxWidth: equationCharacterMaxWidth
    };
    const boldOptions = {
      font: LeastSquaresRegressionConstants.TEXT_BOLD_FONT,
      fill: LeastSquaresRegressionConstants.MY_LINE_COLOR.BASE_COLOR,
      maxWidth: equationCharacterMaxWidth
    };

    const yText = new Text( symbolYString, blackOptions ); // 'y'
    const equalText = new Text( '=', blackOptions ); // the '=' sign
    const aText = new Text( aString, boldOptions ); // a number
    const xText = new Text( symbolXString, blackOptions ); // 'x'
    const signInterceptText = new Text( MathSymbols.PLUS, blackOptions );// '+'
    const bText = new Text( bString, boldOptions );// a number

    const immutableEquationText = new Node( {
      children: [
        yText,
        equalText,
        aText,
        xText,
        signInterceptText,
        bText
      ]
    } );

    // Layout the immutable equation
    yText.left = equationText.yText.left;
    equalText.left = equationText.equalText.left;
    aText.center = equationText.valueSlopeText.center;
    xText.left = equationText.xText.left;
    signInterceptText.left = equationText.signInterceptText.left;
    bText.center = equationText.valueInterceptText.center;

    // create the equation panel with white background
    const equationPanel = new Panel( equationText, {
      fill: 'white',
      cornerRadius: LeastSquaresRegressionConstants.SMALL_PANEL_CORNER_RADIUS,
      stroke: LeastSquaresRegressionConstants.SMALL_PANEL_STROKE,
      resize: false
    } );

    // Create two sliders: The aSlider controls the angle of the line and by proxy the slope, the bSlider controls the intercept
    const sliderInterceptRange = new Range( -1.5 * graph.bounds.maxY, 1.5 * graph.bounds.maxY );
    const maxSlope = 10; // determines the maximum slope (using the graph bounds as reference, i.e. the unit square)

    const aSlider = new VSlider( graph.angleProperty, new Range( -Math.atan( maxSlope ), Math.atan( maxSlope ) ), SLIDER_OPTIONS );
    aSlider.addMajorTick( 0 );
    const bSlider = new VSlider( graph.interceptProperty, sliderInterceptRange, SLIDER_OPTIONS );
    bSlider.addMajorTick( 0 );

    // Create label below the sliders
    const aSliderText = new Text( aString, merge( { maxWidth: MAX_WIDTH }, boldOptions ) );
    const bSliderText = new Text( bString, merge( { maxWidth: MAX_WIDTH }, boldOptions ) );

    // collect the immutable equation, the mutable equation and the sliders in one node
    const rightAlignedNode = new Node();
    const hStrut = new HStrut( 20 );
    rightAlignedNode.addChild( equationPanel );
    rightAlignedNode.addChild( immutableEquationText );
    rightAlignedNode.addChild( aSlider );
    rightAlignedNode.addChild( bSlider );
    rightAlignedNode.addChild( aSliderText );
    rightAlignedNode.addChild( bSliderText );
    rightAlignedNode.addChild( hStrut );

    // Create three checkboxes
    const checkboxTextOptions = { font: LeastSquaresRegressionConstants.CHECKBOX_TEXT_FONT, maxWidth: MAX_WIDTH };
    const lineCheckbox = new Checkbox( graph.myLineVisibleProperty, new Text( myLineString, checkboxTextOptions ) );
    const residualsCheckbox = new Checkbox( graph.myLineShowResidualsProperty, new Text( residualsString, checkboxTextOptions ) );
    const squaredResidualsCheckbox = new Checkbox( graph.myLineShowSquaredResidualsProperty, new Text( squaredResidualsString, checkboxTextOptions ) );

    // Expand the touch Area
    lineCheckbox.touchArea = lineCheckbox.localBounds.dilatedXY( 8, 8 );
    residualsCheckbox.touchArea = residualsCheckbox.localBounds.dilatedXY( 8, 8 );
    squaredResidualsCheckbox.touchArea = squaredResidualsCheckbox.localBounds.dilatedXY( 8, 8 );

    // Create the barometer chart for the sum of the squares
    const sumOfSquaredResiduals = new SumOfSquaredResidualsChart(
      graph,
      graph.getMyLineSumOfSquaredResiduals.bind( graph ),
      dataPointsAddedEmitter,
      LeastSquaresRegressionConstants.MY_LINE_COLOR.SUM_OF_SQUARES_COLOR,
      graph.myLineSquaredResidualsVisibleProperty, {
        maxLabelWidth: MAX_WIDTH
      } );

    // assemble all the previous nodes in a vertical box
    const mainBox = new VBox( {
      spacing: 10,
      children: [
        lineCheckbox,
        rightAlignedNode,
        residualsCheckbox,
        squaredResidualsCheckbox,
        sumOfSquaredResiduals
      ],
      align: 'left',
      excludeInvisibleChildrenFromBounds: false
    } );

    // layout the internal nodes of the right Aligned Node
    equationPanel.left = hStrut.right;
    equationPanel.top = lineCheckbox.bottom;
    immutableEquationText.top = equationPanel.bottom + 12;
    immutableEquationText.left = equationPanel.left + 5;
    aSlider.top = immutableEquationText.bottom + 10;
    bSlider.top = immutableEquationText.bottom + 10;
    aSlider.centerX = immutableEquationText.left + aText.centerX;
    bSlider.centerX = immutableEquationText.left + bText.centerX;
    aSliderText.top = aSlider.bottom + 8;
    bSliderText.top = bSlider.bottom + 8;
    aSliderText.centerX = aSlider.centerX;
    bSliderText.centerX = bSlider.centerX;

    super( mainBox, options );

    // Trigger the opacity/non-opacity when checking the myLine checkbox
    graph.myLineVisibleProperty.link( enabled => {
      equationText.visible = enabled;
      aSlider.pickable = enabled; // enable/disable slider
      bSlider.pickable = enabled;// enable/disable slider
      residualsCheckbox.enabled = enabled;
      squaredResidualsCheckbox.enabled = enabled;
      rightAlignedNode.opacity = enabled ? 1 : SceneryConstants.DISABLED_OPACITY;
    } );

    // update the text (slope) of the equation when the aSlider is moving
    graph.angleProperty.link( angle => {
      updateTextSlope( angle );
    } );

    // update the text (intercept) of the equation when the bSlider is moving
    graph.interceptProperty.link( intercept => {
      updateTextIntercept( intercept );
    } );

    // Trigger an update after all the points have been added in bulk to the model
    // Update the equation text
    dataPointsAddedEmitter.addListener( () => {
      updateTextSlope( graph.angleProperty.value );
      updateTextIntercept( graph.interceptProperty.value );
    } );

    // @private
    this.sumOfSquaredResiduals = sumOfSquaredResiduals;
  }

  // @public
  reset() {
    this.sumOfSquaredResiduals.reset();
  }
}

leastSquaresRegression.register( 'MyLineControlPanel', MyLineControlPanel );
export default MyLineControlPanel;