// Copyright 2014-2023, University of Colorado Boulder

/**
 * Shows a dialog box about the source and references of the selected Data Set.
 *
 * @author Martin Veillette (Berea College)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Circle, Line, Node, RichText, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionStrings from '../../LeastSquaresRegressionStrings.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';

const sourcePatternString = LeastSquaresRegressionStrings.sourcePattern;

class SourceAndReferenceNode extends ScreenView {
  /**
   * @param {Property.<DataSet>} selectedDataSetProperty
   */
  constructor( selectedDataSetProperty ) {
    /*
     * Use ScreenView, to help center and scale content. Renderer must be specified here because the window is added
     * directly to the scene, instead of to some other node that already has svg renderer.
     */
    super( { layoutBounds: new Bounds2( 0, 0, 1024, 618 ) } );

    // limit the width of the dialog content for i18n
    const maxContentWidth = this.layoutBounds.width * 2 / 3;

    const referenceText = new RichText( '', {
      font: LeastSquaresRegressionConstants.REFERENCE_FONT,
      replaceNewlines: true,
      align: 'left'
    } );
    const sourceText = new RichText( '', {
      font: LeastSquaresRegressionConstants.SOURCE_FONT,
      replaceNewlines: true,
      align: 'left'
    } );

    const children = [
      referenceText,
      sourceText
    ];

    // Create the content box
    const content = new VBox( { align: 'left', spacing: 10, children: children, maxWidth: maxContentWidth } );

    // Create the panel that contains the source and reference
    const panel = new Panel( content, {
      centerX: this.layoutBounds.centerX,
      centerY: this.layoutBounds.centerY,
      xMargin: 20,
      yMargin: 20,
      fill: 'white',
      stroke: 'black'
    } );

    // Create the 'Closed Button' in the upper right corner with a circle and a cross inside it.
    // The button is not hooked to any listener since the closing of this node is handled in the main screenView
    const buttonSize = 15;
    const buttonLineWidth = 2;
    const circle = new Circle( buttonSize, {
      fill: 'black',
      stroke: 'white',
      lineWidth: buttonLineWidth,
      centerX: 0,
      centerY: 0
    } );
    const l = buttonSize / 3;
    const upSlopeLine = new Line( l, l, -l, -l, {
      stroke: 'white',
      lineWidth: buttonLineWidth,
      centerX: 0,
      centerY: 0
    } );
    const downwardSlopeLine = new Line( l, -l, -l, l, {
      stroke: 'white',
      lineWidth: buttonLineWidth,
      centerX: 0,
      centerY: 0
    } );
    const button = new Node( { children: [ circle, upSlopeLine, downwardSlopeLine ] } );

    // Add a cursor when hovering (see https://github.com/phetsims/least-squares-regression/issues/10)
    button.cursor = 'pointer';

    // Add to this node
    this.addChild( panel );
    this.addChild( button );

    // Update the content of this node and the layout.
    // no need to unlink, present for the lifetime of the sim
    selectedDataSetProperty.link( selectedDataSet => {
      referenceText.string = selectedDataSet.reference;
      const formattedSourceString = StringUtils.format( sourcePatternString, selectedDataSet.source );
      sourceText.string = formattedSourceString;
      panel.centerX = this.layoutBounds.centerX;
      panel.centerY = this.layoutBounds.centerY;
      button.centerX = panel.right;
      button.centerY = panel.top;
    } );
  }
}

leastSquaresRegression.register( 'SourceAndReferenceNode', SourceAndReferenceNode );
export default SourceAndReferenceNode;
