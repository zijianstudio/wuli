// Copyright 2019-2023, University of Colorado Boulder

/**
 * view for the "Temperature" scene
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ColorizedReadoutNode from '../../../../number-line-common/js/common/view/ColorizedReadoutNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, RichText, Text } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import NLIConstants from '../../common/NLIConstants.js';
import numberLineIntegers from '../../numberLineIntegers.js';
import NumberLineIntegersStrings from '../../NumberLineIntegersStrings.js';
import TemperatureSceneModel from '../model/TemperatureSceneModel.js';
import MonthsComboBox from './MonthsComboBox.js';
import SceneView from './SceneView.js';
import TemperatureMapNode from './TemperatureMapNode.js';
import TemperaturePointControllerNode from './TemperaturePointControllerNode.js';

// constants
const NUMBER_LINE_LABEL_FONT = new PhetFont( { size: 18, weight: 'bold' } );
const UNITS_SELECTOR_LABEL_FONT = new PhetFont( { size: 18 } );
const UNITS_SELECTOR_TEXT_OPTIONS = {
  font: UNITS_SELECTOR_LABEL_FONT,
  maxWidth: 40 // empirically determined to work with other aspects of the layout
};
const NUMBER_LINE_PANEL_WIDTH = 200; // empirically determined
const NUMBER_LINE_PANEL_MARGINS = 10;
const NUMBER_LINE_CONTENT_WIDTH = NUMBER_LINE_PANEL_WIDTH - 2 * NUMBER_LINE_PANEL_MARGINS;
const TITLE_TO_SELECTOR_SPACING = 10;
const CELSIUS_NUMBER_LINE_INDEX = TemperatureSceneModel.CELSIUS_NUMBER_LINE_INDEX;
const FAHRENHEIT_NUMBER_LINE_INDEX = TemperatureSceneModel.FAHRENHEIT_NUMBER_LINE_INDEX;

const temperatureAmountCelsiusString = NumberLineIntegersStrings.temperatureAmountCelsius;
const temperatureAmountFahrenheitString = NumberLineIntegersStrings.temperatureAmountFahrenheit;
const temperatureLabelCelsiusString = NumberLineIntegersStrings.temperatureLabelCelsius;
const temperatureLabelFahrenheitString = NumberLineIntegersStrings.temperatureLabelFahrenheit;
const temperatureMapCaptionString = NumberLineIntegersStrings.temperatureMapCaption;
const temperatureString = NumberLineIntegersStrings.temperature;

class TemperatureSceneView extends SceneView {

  /**
   * @param {TemperatureSceneModel} sceneModel
   * @param {Bounds2} layoutBounds
   * @public
   */
  constructor( sceneModel, layoutBounds ) {

    super( sceneModel, layoutBounds, {

      // options common to both number lines
      commonNumberLineNodeOptions: {
        tickMarkLabelPositionWhenVertical: 'left',
        pointNodeOptions: {
          usePointColorForLabelText: false,
          colorizeLabelBackground: true
        }
      },

      // options unique to the individual number lines, must be in correct order
      uniqueNumberLineNodeOptionsList: [
        { numericalLabelTemplate: temperatureAmountFahrenheitString },
        { numericalLabelTemplate: temperatureAmountCelsiusString }
      ],

      // Don't have the super constructor add the number line nodes - that will be done below.
      automaticallyAddNLNodes: false
    } );

    // Put the number lines on their own layer so that their position can be easily adjusted.
    const numberLinesRootNode = new Node();
    const fahrenheitNumberLineNode = this.numberLineNodes[ FAHRENHEIT_NUMBER_LINE_INDEX ];
    const celsiusNumberLineNode = this.numberLineNodes[ CELSIUS_NUMBER_LINE_INDEX ];
    numberLinesRootNode.addChild( fahrenheitNumberLineNode );
    numberLinesRootNode.addChild( celsiusNumberLineNode );

    // Get local references to other items needed to manage the two separate number lines.
    const fahrenheitNumberLine = sceneModel.numberLines[ FAHRENHEIT_NUMBER_LINE_INDEX ];
    const fahrenheitComparisonStatementAccordionBox = this.comparisonStatementAccordionBoxes[ FAHRENHEIT_NUMBER_LINE_INDEX ];
    const celsiusNumberLine = sceneModel.numberLines[ CELSIUS_NUMBER_LINE_INDEX ];
    const celsiusComparisonStatementAccordionBox = this.comparisonStatementAccordionBoxes[ CELSIUS_NUMBER_LINE_INDEX ];

    // node where the contents of the number line panel will be placed
    const numberLinePanelContent = new Node();
    numberLinePanelContent.addChild( numberLinesRootNode );

    // Make sure that the same operator is being used in both the celsius and fahrenheit comparison statements.
    celsiusComparisonStatementAccordionBox.comparisonStatementNode.selectedOperatorProperty.link( selectedOperator => {
      fahrenheitComparisonStatementAccordionBox.comparisonStatementNode.selectedOperatorProperty.set( selectedOperator );
    } );
    fahrenheitComparisonStatementAccordionBox.comparisonStatementNode.selectedOperatorProperty.link( selectedOperator => {
      celsiusComparisonStatementAccordionBox.comparisonStatementNode.selectedOperatorProperty.set( selectedOperator );
    } );

    // @private
    this.monthsComboBox = new MonthsComboBox( sceneModel.monthProperty, this.controlsLayer, {
      left: this.checkboxGroup.left,
      top: sceneModel.mapBounds.minY,
      buttonTouchAreaXDilation: 7,
      buttonTouchAreaYDilation: 7
    } );
    this.controlsLayer.addChild( this.monthsComboBox );

    // @private - map of the world that depicts temperature data
    this.temperatureMap = new TemperatureMapNode( sceneModel.monthProperty, sceneModel.mapBounds );
    this.temperatureMap.center = sceneModel.mapBounds.center;
    this.scenesLayer.addChild( this.temperatureMap );

    // Add the node that represents the box that will hold the thermometers.
    const thermometerBox = Rectangle.bounds( sceneModel.thermometerBoxBounds, {
      fill: 'white',
      stroke: 'black',
      cornerRadius: 6
    } );
    this.scenesLayer.addChild( thermometerBox );

    // caption for the temperature map
    const temperatureMapCaption = new RichText( temperatureMapCaptionString, {
      align: 'center',
      centerX: this.temperatureMap.centerX,
      top: this.temperatureMap.bottom + 7, // a little bit under the map
      font: new PhetFont( 10 ),
      fill: '#707070'
    } );
    this.scenesLayer.addChild( temperatureMapCaption );

    // radio button group for selecting the temperature units
    const temperatureUnitsSelector = new VerticalAquaRadioButtonGroup(
      sceneModel.temperatureUnitsProperty,
      [
        {
          value: NLIConstants.TEMPERATURE_UNITS.FAHRENHEIT,
          createNode: () => new Text( temperatureLabelFahrenheitString, UNITS_SELECTOR_TEXT_OPTIONS )
        },
        {
          value: NLIConstants.TEMPERATURE_UNITS.CELSIUS,
          createNode: () => new Text( temperatureLabelCelsiusString, UNITS_SELECTOR_TEXT_OPTIONS )
        }
      ],
      {
        // Limit the width to half the panel height to handle long labels from translations and string tests.
        maxWidth: ( NUMBER_LINE_PANEL_WIDTH - 2 * NUMBER_LINE_PANEL_MARGINS ) / 2,

        // This should appear in the upper left of the panel.
        right: NUMBER_LINE_CONTENT_WIDTH,
        top: 0
      }
    );
    numberLinePanelContent.addChild( temperatureUnitsSelector );

    // title for the panel where the number line will appear
    const numberLinePanelTitle = new Text( temperatureString, {
      font: NUMBER_LINE_LABEL_FONT,
      maxWidth: NUMBER_LINE_PANEL_WIDTH - temperatureUnitsSelector.width - TITLE_TO_SELECTOR_SPACING -
                2 * NUMBER_LINE_PANEL_MARGINS,

      // This should be at the top of the node, centered between the left edge and the units selector.
      centerX: ( NUMBER_LINE_CONTENT_WIDTH - temperatureUnitsSelector.width ) / 2,
      top: 0
    } );
    numberLinePanelContent.addChild( numberLinePanelTitle );

    // Manage the label texts for each thermometer.
    const celsiusLabelsLayer = new Node();
    const fahrenheitLabelsLayer = new Node();
    const onAddedNumberLinePoint = ( numberLine, labelsLayer, addedNumberLinePoint ) => {

      // Create the textual label.
      const labelNode = new ColorizedReadoutNode(
        new Property( addedNumberLinePoint.controller.label ),
        addedNumberLinePoint.colorProperty,
        {
          textOptions: {
            font: new PhetFont( 16 ),
            maxWidth: 20 // empirically determined to prevent layout problems with long and RTL strings
          }
        }
      );
      labelsLayer.addChild( labelNode );

      const numberLinePointListener = () => {
        labelNode.leftCenter = addedNumberLinePoint.getPositionInModelSpace().plus( new Vector2( 15, 0 ) );
      };
      addedNumberLinePoint.valueProperty.link( numberLinePointListener );

      const dragStateChangeHandler = dragging => {
        if ( dragging ) {
          labelNode.moveToFront();
        }
      };
      addedNumberLinePoint.isDraggingProperty.link( dragStateChangeHandler );

      const removalListener = removedNumberLinePoint => {
        if ( removedNumberLinePoint !== addedNumberLinePoint ) {
          return;
        }
        numberLine.residentPoints.removeItemRemovedListener( removalListener );
        labelsLayer.removeChild( labelNode );
        labelNode.dispose();
        addedNumberLinePoint.valueProperty.unlink( numberLinePointListener );
      };
      numberLine.residentPoints.addItemRemovedListener( removalListener );
    };

    celsiusNumberLine.residentPoints.addItemAddedListener( addedPoint => {
      onAddedNumberLinePoint( celsiusNumberLine, celsiusLabelsLayer, addedPoint );
    } );
    fahrenheitNumberLine.residentPoints.addItemAddedListener( addedPoint => {
      onAddedNumberLinePoint( fahrenheitNumberLine, fahrenheitLabelsLayer, addedPoint );
    } );

    numberLinesRootNode.addChild( celsiusLabelsLayer );
    numberLinesRootNode.addChild( fahrenheitLabelsLayer );

    // Set the number line position to be fixed, roughly horizontally centered in the panel, and just below the header
    // label.  It's important that these be absolute numbers so that the layout of the panel doesn't change
    // dramatically as the string sizes change (e.g. in translations and string tests).  The right side of the number
    // line is used to set the X position because there is no text there, so the position won't change if different
    // size labels are present.
    numberLinesRootNode.top = 25;
    numberLinesRootNode.right = 110;

    const numberLinePanel = new Panel(
      numberLinePanelContent,
      {
        fill: 'lightgray',
        stroke: 'transparent',
        align: 'center',
        resize: false,
        xMargin: NUMBER_LINE_PANEL_MARGINS,
        yMargin: NUMBER_LINE_PANEL_MARGINS,
        centerX: this.temperatureMap.left / 2, // centered between left edge of scene and left edge of map
        centerY: this.layoutBounds.minY + this.layoutBounds.maxY / 2, // centered vertically in the layout bounds
        minWidth: NUMBER_LINE_PANEL_WIDTH,
        maxWidth: NUMBER_LINE_PANEL_WIDTH
      }
    );
    this.numberLinesLayer.addChild( numberLinePanel );

    Multilink.multilink(
      [ sceneModel.temperatureUnitsProperty, sceneModel.showNumberLineProperty ],
      ( temperatureUnits, showNumberLine ) => {
        celsiusNumberLineNode.visible = temperatureUnits === NLIConstants.TEMPERATURE_UNITS.CELSIUS;
        celsiusComparisonStatementAccordionBox.visible = celsiusNumberLineNode.visible;
        celsiusLabelsLayer.visible = celsiusNumberLineNode.visible;
        fahrenheitNumberLineNode.visible = temperatureUnits === NLIConstants.TEMPERATURE_UNITS.FAHRENHEIT;
        fahrenheitComparisonStatementAccordionBox.visible = fahrenheitNumberLineNode.visible;
        fahrenheitLabelsLayer.visible = fahrenheitNumberLineNode.visible;
        numberLinePanel.visible = showNumberLine;
      }
    );

    this.scenesLayer.addChild( new Node( {
      children: sceneModel.permanentPointControllers.map(
        pointController => new TemperaturePointControllerNode(
          pointController,
          sceneModel.numberLineAbsoluteValueIndicatorsVisibleProperty,
          sceneModel.temperatureUnitsProperty
        )
      )
    } ) );
  }
}

numberLineIntegers.register( 'TemperatureSceneView', TemperatureSceneView );
export default TemperatureSceneView;
