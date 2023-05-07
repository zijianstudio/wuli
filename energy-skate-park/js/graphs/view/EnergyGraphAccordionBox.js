// Copyright 2019-2023, University of Colorado Boulder

/**
 * The accordion box in the "Graphs" screen that contains the energy graphs, as well as controls for
 * controlling the data.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import MagnifyingGlassZoomButtonGroup from '../../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignGroup, Circle, HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import VerticalCheckboxGroup from '../../../../sun/js/VerticalCheckboxGroup.js';
import EnergySkateParkConstants from '../../common/EnergySkateParkConstants.js';
import EnergySkateParkColorScheme from '../../common/view/EnergySkateParkColorScheme.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkStrings from '../../EnergySkateParkStrings.js';
import GraphsConstants from '../GraphsConstants.js';
import GraphsModel from '../model/GraphsModel.js';
import EnergyChart from './EnergyChart.js';

const kineticEnergyLabelString = EnergySkateParkStrings.energies.kineticStringProperty;
const potentialEnergyLabelString = EnergySkateParkStrings.energies.potentialStringProperty;
const thermalEnergyLabelString = EnergySkateParkStrings.energies.thermalStringProperty;
const totalEnergyLabelString = EnergySkateParkStrings.energies.totalStringProperty;
const timeSwitchLabelString = EnergySkateParkStrings.plots.timeSwitchLabelStringProperty;
const positionSwitchLabelString = EnergySkateParkStrings.plots.positionSwitchLabelStringProperty;
const plotsEnergyGraphString = EnergySkateParkStrings.plots.energyGraph.labelStringProperty;
const plotsPositionLabelStringProperty = EnergySkateParkStrings.plots.positionLabelStringProperty;
const plotsEnergyLabelString = EnergySkateParkStrings.plots.energyLabelStringProperty;
const plotsTimeLabelStringProperty = EnergySkateParkStrings.plots.timeLabelStringProperty;

// constants
const GRAPH_HEIGHT = 141;

// margin for content within the panel
const CONTENT_X_MARGIN = 4;

// size of the ABSwitch that changes from plotting position vs time
const SWITCH_SIZE = new Dimension2( 37, 18 );

const LABEL_FONT = new PhetFont( { size: 15 } );

class EnergyGraphAccordionBox extends AccordionBox {

  /**
   * @param {GraphsModel} model
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor( model, modelViewTransform, tandem ) {

    // the parent for all content of the accordion box
    const contentNode = new Node();

    const labelAlignGroup = new AlignGroup( { matchVertical: false } );

    // check boxes for visibility of energy data
    const checkboxGroup = new VerticalCheckboxGroup( [
      EnergyGraphAccordionBox.createCheckboxItem( model.kineticEnergyDataVisibleProperty, kineticEnergyLabelString, EnergySkateParkColorScheme.kineticEnergy, labelAlignGroup ),
      EnergyGraphAccordionBox.createCheckboxItem( model.potentialEnergyDataVisibleProperty, potentialEnergyLabelString, EnergySkateParkColorScheme.potentialEnergy, labelAlignGroup ),
      EnergyGraphAccordionBox.createCheckboxItem( model.thermalEnergyDataVisibleProperty, thermalEnergyLabelString, EnergySkateParkColorScheme.thermalEnergy, labelAlignGroup ),
      EnergyGraphAccordionBox.createCheckboxItem( model.totalEnergyDataVisibleProperty, totalEnergyLabelString, EnergySkateParkColorScheme.totalEnergy, labelAlignGroup )
    ], {
      checkboxOptions: {
        boxWidth: EnergySkateParkConstants.CHECKBOX_WIDTH
      },
      spacing: 12
    } );
    contentNode.addChild( checkboxGroup );

    // the graph is as long as the tracks in the Graphs screen so that position of the skater matches
    // with position along the plot
    const graphWidth = modelViewTransform.modelToViewDeltaX( GraphsConstants.TRACK_WIDTH );

    const energyPlot = new EnergyChart( model, graphWidth, GRAPH_HEIGHT, tandem.createTandem( 'energyPlot' ) );
    contentNode.addChild( energyPlot );

    // eraser button to clear all data from the graph
    const eraserButton = new EraserButton( {
      iconWidth: 22,
      touchAreaXDilation: 8,
      touchAreaYDilation: 8,
      listener: () => {
        this.clearEnergyData();
      },

      tandem: tandem.createTandem( 'eraserButton' )
    } );

    // ABSwitch to change plotting variables
    const switchLabelOptions = {
      font: LABEL_FONT,
      maxWidth: 100
    };
    const variables = GraphsModel.IndependentVariable;
    const variableSwitchTandem = tandem.createTandem( 'variableSwitch' );
    const positionLabelText = new Text( positionSwitchLabelString, merge( {
      tandem: variableSwitchTandem.createTandem( 'positionLabelText' )
    }, switchLabelOptions ) );
    const timeLabelText = new Text( timeSwitchLabelString, merge( {
      tandem: variableSwitchTandem.createTandem( 'timeLabelText' )
    }, switchLabelOptions ) );
    const variableSwitch = new ABSwitch( model.independentVariableProperty, variables.POSITION, positionLabelText, variables.TIME, timeLabelText, {
      toggleSwitchOptions: { size: SWITCH_SIZE },
      tandem: variableSwitchTandem
    } );

    const zoomButtonGroup = new MagnifyingGlassZoomButtonGroup( model.energyPlotScaleIndexProperty, {
      magnifyingGlassNodeOptions: {
        glassRadius: 6
      },
      buttonOptions: {
        xMargin: 4,
        yMargin: 4,
        touchAreaXDilation: 3,
        touchAreaYDilation: 3,

        baseColor: PhetColorScheme.PHET_LOGO_BLUE
      },

      spacing: 7,
      orientation: 'vertical',
      tandem: tandem.createTandem( 'zoomButtonGroup' )
    } );

    // graph labels - y axis includes zoom buttons as part of the label
    const yLabelText = new Text( plotsEnergyLabelString, {
      rotation: -Math.PI / 2,
      font: LABEL_FONT,
      maxWidth: energyPlot.height / 2
    } );

    // Label the x-axis with the independent variable.
    const xLabelStringProperty = new DerivedProperty( [ model.independentVariableProperty, plotsTimeLabelStringProperty, plotsPositionLabelStringProperty ],
      ( independentVariable, timeLabelString, positionLabelString ) => ( independentVariable === GraphsModel.IndependentVariable.TIME ) ? timeLabelString : positionLabelString
    );
    const xLabelText = new Text( xLabelStringProperty, { font: LABEL_FONT, maxWidth: energyPlot.width } );

    const yLabel = new VBox( {
      children: [ yLabelText, zoomButtonGroup ],
      spacing: 10
    } );
    contentNode.addChild( yLabel );
    contentNode.addChild( xLabelText );

    const titleNode = new Text( plotsEnergyGraphString, {
      font: new PhetFont( { size: 20 } ),
      maxWidth: energyPlot.width / 3
    } );

    yLabel.rightCenter = energyPlot.leftCenter.minusXY( 10, 0 );
    xLabelText.centerTop = energyPlot.centerBottom.plusXY( 0, 10 );
    checkboxGroup.rightCenter = yLabel.leftCenter.minusXY( 10, 0 );

    const buttonYMargin = 5;
    const contentYMargin = 3;
    super( contentNode, merge( {
      titleNode: titleNode,
      titleAlignX: 'left',
      titleXSpacing: 7,
      buttonXMargin: 6,
      buttonYMargin: buttonYMargin,
      contentYMargin: contentYMargin,
      contentXMargin: 7,
      contentYSpacing: 0,

      // do not resize the AccordionBox as EnergyChart labels animate (new labels may adjust bounds)
      resize: false,

      // clicking doesn't expand since the title contains other controls
      titleBarExpandCollapse: false,

      expandCollapseButtonOptions: {
        sideLength: 19,
        touchAreaXDilation: 8,
        touchAreaXShift: 2,
        touchAreaYDilation: 6
      },

      expandedProperty: model.energyPlotVisibleProperty,
      tandem: tandem.createTandem( 'accordionBox' )
    }, EnergySkateParkConstants.PANEL_OPTIONS ) );

    // decorate this Node with additional controls that are positioned along the title
    this.addChild( variableSwitch );
    this.addChild( eraserButton );

    variableSwitch.centerBottom = variableSwitch.globalToParentPoint( energyPlot.parentToGlobalPoint( energyPlot.chartPanel.centerTop ) ).minusXY( 0, buttonYMargin + contentYMargin );
    eraserButton.right = eraserButton.globalToParentPoint( energyPlot.parentToGlobalPoint( energyPlot.chartPanel.rightCenter ) ).x;
    eraserButton.centerY = variableSwitch.centerY;

    // The variable switch and eraser button are part of the title layout but should only be visible when
    // expanded
    this.expandedProperty.link( expanded => {
      variableSwitch.visible = expanded;
      eraserButton.visible = expanded;
    } );

    // @public
    this.energyPlot = energyPlot;

    // @private {GraphsModel}
    this.model = model;

    // Keep xLabelText horizontally centered.
    xLabelText.boundsProperty.link( () => {
      xLabelText.centerX = xLabelText.globalToParentPoint( energyPlot.parentToGlobalPoint( energyPlot.center ) ).x;
    } );

    // listeners - when the independent variable changes, clear all data and update labels
    model.independentVariableProperty.link( independentVariable => {
      this.clearEnergyData();
    } );

    // listeners - when the reference height is changed, clear all data (otherwise the graph will be incorrect, not inertial)
    model.skater.referenceHeightProperty.link( referenceHeight => {
      this.clearEnergyData();
    } );
  }

  /**
   * Clear all data, removing saved EnergySkateParkDataSamples and removing all data from the series rendered by the chart.
   * @private
   */
  clearEnergyData() {
    this.model.clearEnergyData();
    this.energyPlot.clearEnergyDataSeries();
  }

  /**
   * Gets the spacing in view coordinates between the right edge of the panel and the right most
   * content within the panel. Useful for layout since we want the grid lines in the ScreenView to
   * perfectly align with grid lines in the plot.
   * @public
   *
   * @returns {number}
   */
  getContentRight() {
    const localContentRight = this.globalToLocalBounds( this.energyPlot.localToGlobalBounds( this.energyPlot.chartPanel.localBounds ) ).right;
    const localPanelRight = this.localBounds.right;
    return localPanelRight - localContentRight;
  }

  /**
   * Create an "item" for a checkbox of the VerticalCheckboxGroup, with the label and controlling Property.
   * @private
   *
   * @param {Property} property
   * @param {string} labelString
   * @param {PaintDef|Color} energyColor
   * @param {AlignGroup} labelAlignGroup - for icon layout, so all lable Text has the same dimensions
   *
   * @returns {*} - Conforms to the item object of VerticalCheckboxGroup
   */
  static createCheckboxItem( property, labelString, energyColor, labelAlignGroup ) {
    const labelText = new Text( labelString, {
      font: EnergySkateParkConstants.CHECKBOX_LABEL_FONT,
      maxWidth: 50
    } );
    const labelBox = labelAlignGroup.createBox( labelText, { xAlign: 'left' } );

    // filled circle identifying the energy this label represents
    const iconNode = new Circle( 5, {
      lineWidth: 0.5,
      stroke: 'black',
      fill: energyColor,
      leftCenter: labelBox.rightCenter.plusXY( 5, 0 )
    } );

    return {
      createNode: () => new HBox( { children: [ labelBox, iconNode ], spacing: 5 } ),
      property: property
    };
  }
}

// for layout of the accordion box within a screen view, the spacing of the graph from the right edge of the
// accordion box is the x content margin
EnergyGraphAccordionBox.GRAPH_OFFSET = CONTENT_X_MARGIN;

energySkatePark.register( 'EnergyGraphAccordionBox', EnergyGraphAccordionBox );
export default EnergyGraphAccordionBox;