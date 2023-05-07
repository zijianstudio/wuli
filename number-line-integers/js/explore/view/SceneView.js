// Copyright 2019-2022, University of Colorado Boulder

/**
 * SceneView is a base class for scene views in the "Explore" screen, includes check boxes, comparison statement, and
 * some other UI elements that are common to all scenes.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NLCheckbox from '../../../../number-line-common/js/common/view/NLCheckbox.js';
import NLCheckboxGroup from '../../../../number-line-common/js/common/view/NLCheckboxGroup.js';
import SpatializedNumberLineNode from '../../../../number-line-common/js/common/view/SpatializedNumberLineNode.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetButton from '../../../../scenery-phet/js/buttons/ResetButton.js';
import { Node } from '../../../../scenery/js/imports.js';
import NLIConstants from '../../common/NLIConstants.js';
import ComparisonStatementAccordionBox from '../../common/view/ComparisonStatementAccordionBox.js';
import numberLineIntegers from '../../numberLineIntegers.js';
import NumberLineIntegersStrings from '../../NumberLineIntegersStrings.js';

// constants
const MAX_CHECKBOX_TEXT_WIDTH = 145; // empirically determined to stay within dev bounds
const CHECKBOX_OPTIONS = { textOptions: { maxWidth: MAX_CHECKBOX_TEXT_WIDTH } };
const absoluteValueString = NumberLineIntegersStrings.absoluteValue;
const labelsString = NumberLineIntegersStrings.labels;
const numberLineString = NumberLineIntegersStrings.numberLine;

class SceneView extends Node {

  /**
   * @param {SceneModel} sceneModel
   * @param layoutBounds
   * @param options
   * @public
   */
  constructor( sceneModel, layoutBounds, options ) {

    options = merge( {

      // automatically add number line nodes to the scene graph, set to false if subclasses need more control
      automaticallyAddNLNodes: true,

      // {Object) - common options for the number line node(s)
      commonNumberLineNodeOptions: {},

      // {Object[]|null} - unique options for each of the number lines, null if only one or all are the same
      uniqueNumberLineNodeOptionsList: null

    }, options );

    // options checking
    assert && assert(
      !options.uniqueNumberLineNodeOptionsList || options.uniqueNumberLineNodeOptionsList.length === sceneModel.numberLines.length,
      'the number of option objects for number line nodes does not match the number of number lines'
    );

    super();

    // @protected (read-only) {Bounds2}
    this.layoutBounds = layoutBounds;

    // @protected (read-only) {Node} - layer where the number line or lines go
    this.numberLinesLayer = new Node();
    this.addChild( this.numberLinesLayer );

    // @protected (read-only) {Node} - layer where the controls go
    this.controlsLayer = new Node();
    this.addChild( this.controlsLayer );

    // @protected (read-only) {Node} - layer where the scene elements go, populated primarily in sub-classes
    this.scenesLayer = new Node();
    this.addChild( this.scenesLayer );

    // @protected (read-only) {Node} - layer where the comparison statements are shown, needs to be above scene elements
    this.comparisonStatementsLayer = new Node();
    this.addChild( this.comparisonStatementsLayer );

    // checkboxes that control common model properties
    const checkboxes = [
      new NLCheckbox( sceneModel.showNumberLineProperty, numberLineString, CHECKBOX_OPTIONS ),
      new NLCheckbox( sceneModel.numberLineLabelsVisibleProperty, labelsString, CHECKBOX_OPTIONS ),
      new NLCheckbox( sceneModel.numberLineAbsoluteValueIndicatorsVisibleProperty, absoluteValueString, CHECKBOX_OPTIONS )
    ];

    // @protected {NLCheckboxGroup} - node containing the checkboxes that control common model properties
    this.checkboxGroup = new NLCheckboxGroup( checkboxes, {
      left: layoutBounds.maxX - NLIConstants.EXPLORE_SCREEN_CONTROLS_LEFT_SIDE_INSET,
      top: layoutBounds.minY + 10
    } );
    this.controlsLayer.addChild( this.checkboxGroup );

    // @private
    this.comparisonStatementBoxesOpenProperty = new BooleanProperty( true );

    // @protected - comparison statements that are inside an accordion box
    this.comparisonStatementAccordionBoxes = [];

    // Create the comparison statements, which are contained within an accordion box, one for each number line.
    sceneModel.numberLines.forEach( numberLine => {
      const comparisonStatementAccordionBox = new ComparisonStatementAccordionBox( numberLine, {
        centerX: layoutBounds.centerX,
        top: 10,
        expandedProperty: this.comparisonStatementBoxesOpenProperty
      } );
      this.comparisonStatementAccordionBoxes.push( comparisonStatementAccordionBox );
      this.comparisonStatementsLayer.addChild( comparisonStatementAccordionBox );
    } );

    // @protected (read-only) {NumberLine} - views of the number lines
    this.numberLineNodes = [];

    // Create and, if options dictate, add the number line to the view.
    sceneModel.numberLines.forEach( ( numberLine, index ) => {
      const numberLineNode = new SpatializedNumberLineNode(
        numberLine,
        merge(
          {},
          options.commonNumberLineNodeOptions,
          options.uniqueNumberLineNodeOptionsList ? options.uniqueNumberLineNodeOptionsList[ index ] : {}
        )
      );
      sceneModel.showNumberLineProperty.linkAttribute( numberLineNode, 'visible' );
      this.numberLineNodes.push( numberLineNode );
      if ( options.automaticallyAddNLNodes ) {
        this.numberLinesLayer.addChild( numberLineNode );
      }
    } );

    // button that restores the scene to its initial state but doesn't reset the model and view for the whole screen
    const sceneResetButton = new ResetButton( {
      listener: () => {
        this.interruptSubtreeInput();
        sceneModel.resetScene();
      },
      baseColor: '#f2f2f2',
      scale: 0.65,
      touchAreaDilation: 5,

      // position centered just above the scene selection buttons
      centerX: layoutBounds.maxX - 93,
      bottom: layoutBounds.maxY - 165
    } );
    this.controlsLayer.addChild( sceneResetButton );
  }

  /**
   * @public
   */
  reset() {
    this.comparisonStatementAccordionBoxes.forEach( comparisonStatementAccordionBox => {
      comparisonStatementAccordionBox.reset();
    } );
  }
}

numberLineIntegers.register( 'SceneView', SceneView );
export default SceneView;