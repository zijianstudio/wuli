// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main View for the simulation screen of Least Squares Regression.
 *
 * @author Martin Veillette (Berea College)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BucketFront from '../../../../scenery-phet/js/bucket/BucketFront.js';
import BucketHole from '../../../../scenery-phet/js/bucket/BucketHole.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import GridCheckbox from '../../../../scenery-phet/js/GridCheckbox.js';
import { Node, Plane } from '../../../../scenery/js/imports.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionStrings from '../../LeastSquaresRegressionStrings.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
import DataSet from '../model/DataSet.js';
import BestFitLineControlPanel from './BestFitLineControlPanel.js';
import DataPointCreatorNode from './DataPointCreatorNode.js';
import DataSetComboBox from './DataSetComboBox.js';
import DynamicDataPointNode from './DynamicDataPointNode.js';
import GraphAxesNode from './GraphAxesNode.js';
import GraphNode from './GraphNode.js';
import MyLineControlPanel from './MyLineControlPanel.js';
import PearsonCorrelationCoefficientNode from './PearsonCorrelationCoefficientNode.js';
import SourceAndReferenceNode from './SourceAndReferenceNode.js';
import StaticDataPointNode from './StaticDataPointNode.js';

const questionMarkString = LeastSquaresRegressionStrings.questionMark;

// constants
const GRAPH_BOUNDS = new Dimension2( 480, 480 ); // Size of the graph Node
const GRAPH_OFFSET = new Vector2( 10, 0 ); // Offset Vector from the center of the screen
const IDENTITY_TRANSFORM = ModelViewTransform2.createIdentity();
const DATA_POINT_CREATOR_OFFSET_POSITIONS = [
  // Offsets used for initial position of point, relative to bucket hole center. Empirically determined.
  new Vector2( -35, -5 ),
  new Vector2( -25, -9 ),
  new Vector2( -20, -4 ),
  new Vector2( -15, -14 ),
  new Vector2( -10, -4 ),
  new Vector2( -5, -17 ),
  new Vector2( -0, -5 ),
  new Vector2( 5, -14 ),
  new Vector2( 10, -3 ),
  new Vector2( 15, -7 ),
  new Vector2( 25, -4 ),
  new Vector2( -0, 15 ),
  new Vector2( 5, 24 ),
  new Vector2( 10, 13 ),
  new Vector2( 15, 17 ),
  new Vector2( 25, 14 ),
  new Vector2( -35, 15 ),
  new Vector2( -25, 19 ),
  new Vector2( -20, 14 ),
  new Vector2( -15, 14 ),
  new Vector2( -10, 14 ),
  new Vector2( -5, 17 ),
  new Vector2( -0, 15 )
];

class LeastSquaresRegressionScreenView extends ScreenView {

  /**
   * @param {LeastSquaresRegressionModel} model
   */
  constructor( model ) {

    super();

    // Bounds of the graph (excluding the axes and labels) in scenery coordinates
    const viewGraphBounds = new Bounds2(
      this.layoutBounds.centerX - GRAPH_BOUNDS.width / 2 + GRAPH_OFFSET.x,
      this.layoutBounds.centerY - GRAPH_BOUNDS.height / 2 + GRAPH_OFFSET.y,
      this.layoutBounds.centerX + GRAPH_BOUNDS.width / 2 + GRAPH_OFFSET.x,
      this.layoutBounds.centerY + GRAPH_BOUNDS.height / 2 + GRAPH_OFFSET.y
    );
    const modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping( model.graph.bounds, viewGraphBounds );

    // Options for the two panels
    const panelOptions = {
      resize: false,
      cornerRadius: LeastSquaresRegressionConstants.CONTROL_PANEL_CORNER_RADIUS,
      fill: LeastSquaresRegressionConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      align: 'left',
      xMargin: 10,
      yMargin: 10
    };
    // Create the "Best Fit Line" Control Panel (located to the right of the graph)
    const bestFitLineControlPanel = new BestFitLineControlPanel( model.graph, model.dataPoints, model.dataPointsAddedEmitter, panelOptions );

    // Create the "My Line" Control Panel (located to the left of the graph)
    const myLineControlPanel = new MyLineControlPanel( model.graph, model.dataPoints, model.dataPointsAddedEmitter, panelOptions );

    // Create the Graph Node which is responsible for 'My Line', 'Best Fit Line' and the Residuals representation
    const graphNode = new GraphNode( model.graph, viewGraphBounds, modelViewTransform );

    // Create the Graph Axes, including the tick marks, labels and axis titles
    let graphAxesNode = new GraphAxesNode( model.selectedDataSetProperty.value, modelViewTransform, model.showGridProperty );

    // Create the dataSet combo box that appears on top of the graph
    // Width of contents limited by width of graphNode for i18n
    const dataSetLabelMaxWidth = graphNode.width / 2;
    const dataSetListParent = new Node();
    const dataSetComboBox = new DataSetComboBox( model.selectedDataSetProperty, model.dataSets, dataSetListParent, dataSetLabelMaxWidth );

    // Create a Push Button (next to the ComboBox) that can activate a dialog Node (Source and Reference Node) associated with each dataSet.
    const sourceAndReferenceNode = new SourceAndReferenceNode( model.selectedDataSetProperty, this.layoutBounds );
    const sourceAndReferencePushButton = new TextPushButton( questionMarkString, {
      baseColor: 'gray',
      font: LeastSquaresRegressionConstants.TEXT_BOLD_FONT,
      listener: () => {
        this.updateSourceAndReferenceNodeVisibility( sourceAndReferenceNode );
      },
      maxWidth: graphNode.width / 15
    } );

    // Create the nodes that will be used to layer things visually.
    const backLayer = new Node();
    // Create the layer where the points will be placed. They are maintained in a separate layer so that they are over
    // all of the point placement graphs in the z-order.
    const dataPointsLayer = new Node( { layerSplit: true } ); // Force the moving dataPoint into a separate layer for performance reasons.
    const bucketFrontLayer = new Node( { pickable: false } );

    // Add the bucket view elements
    const bucketFront = new BucketFront( model.bucket, IDENTITY_TRANSFORM );
    bucketFrontLayer.addChild( bucketFront );
    const bucketHole = new BucketHole( model.bucket, IDENTITY_TRANSFORM );
    backLayer.addChild( bucketHole );

    // Add the dataPoint creator nodes. These must be added on the backLayer but after the bucket hole for proper layering.
    DATA_POINT_CREATOR_OFFSET_POSITIONS.forEach( offset => {
      backLayer.addChild( new DataPointCreatorNode(
        model.addUserCreatedDataPoint.bind( model ),
        modelViewTransform, {
          left: bucketHole.centerX + offset.x,
          top: bucketHole.centerY + offset.y
        } ) );
    } );

    // Create the button that allows the graph to be cleared of all dataPoints.
    const eraserButton = new EraserButton( {
      right: bucketFront.right - 3,
      top: bucketFront.bottom + 5,
      iconWidth: 25,
      listener: () => {
        model.returnAllDataPointsToBucket();
      }
    } );

    // Create the Pearson Correlation coefficient panel
    const pearsonCorrelationCoefficientNode = new PearsonCorrelationCoefficientNode( model.graph, panelOptions );

    // Create grid checkbox with grid icon
    const gridCheckbox = new GridCheckbox( model.showGridProperty, {
      spacing: 10,
      iconOptions: {
        size: 48,
        stroke: LeastSquaresRegressionConstants.MAJOR_GRID_STROKE_COLOR
      }
    } );

    // Add the graphAxesNode
    this.addChild( graphAxesNode );

    // Link the comboBox selectedDataSet to the Scene Graph
    // No need to unlink, listener is present for the lifetime of the sim
    model.selectedDataSetProperty.link( selectedDataSet => {

      // Remove graphAxesNode from the scene graph if it exists
      if ( graphAxesNode ) {
        this.removeChild( graphAxesNode );
        graphAxesNode.dispose();
      }

      // Create and add the GraphAxesNode corresponding to the selected DataSet
      const dataSetBounds = new Bounds2( selectedDataSet.xRange.min, selectedDataSet.yRange.min, selectedDataSet.xRange.max, selectedDataSet.yRange.max );
      // GraphAxesNode require a special modelView Transform that is set by the dataSet
      const modelViewTransformAxes = ModelViewTransform2.createRectangleInvertedYMapping( dataSetBounds, viewGraphBounds );
      graphAxesNode = new GraphAxesNode( selectedDataSet, modelViewTransformAxes, model.showGridProperty );
      this.addChild( graphAxesNode );
      graphAxesNode.moveToBack(); //

      // Update the graphNode (will populate it with the new dataPoints)
      graphNode.update();

      // Update the Pearson Correlation Coefficient Panel
      pearsonCorrelationCoefficientNode.update();

      // Update the Best fit Line Equation in the best Fit Line Control Panel, (regardless of the status of the node visibility )
      bestFitLineControlPanel.updateBestFitLineEquation();

      // The bucket, eraser button must be present when custom data set is selected whereas the pushButton next to the comboBox box must be set to invisible
      if ( selectedDataSet === DataSet.CUSTOM ) {
        bucketFront.visible = true;
        eraserButton.visible = true;
        backLayer.visible = true;
        sourceAndReferencePushButton.visible = false;
      }
      else {
        bucketFront.visible = false;
        eraserButton.visible = false;
        backLayer.visible = false;
        sourceAndReferencePushButton.visible = true;
      }
    } );

    // Handle the comings and goings of dataPoints.
    model.dataPoints.addItemAddedListener( addedDataPoint => {

      if ( model.selectedDataSetProperty.value === DataSet.CUSTOM ) {
        // Create and add the view representation for this dataPoint.
        // DataPoints are movable
        const dynamicDataPointNode = new DynamicDataPointNode( addedDataPoint, modelViewTransform );
        dataPointsLayer.addChild( dynamicDataPointNode );

        // Listener for position
        const positionPropertyListener = position => {
          // Check if the point is not animated and is overlapping with the graph before adding on the list of graph data Points
          if ( model.graph.isDataPointPositionOverlappingGraph( position ) && !addedDataPoint.animatingProperty.value ) {

            // Add dataPoint to the array of dataPoint on graph as well as the associated residuals.
            if ( !model.graph.isDataPointOnList( addedDataPoint ) ) {
              model.graph.addPointAndResiduals( addedDataPoint );
            }
          }
          else {
            if ( model.graph.isDataPointOnList( addedDataPoint ) ) {
              // Remove dataPoint from dataPoint on graph and its associated residuals.
              model.graph.removePointAndResiduals( addedDataPoint );
            }
          }

          // update the control panel readouts and best fit line geometry when position changes
          bestFitLineControlPanel.updateBestFitLineEquation();
          bestFitLineControlPanel.sumOfSquaredResidualsChart.updateWidth();
          myLineControlPanel.sumOfSquaredResiduals.updateWidth();
          graphNode.update();
          pearsonCorrelationCoefficientNode.update();
        };

        // Update graph upon a change of position of a dataPoint
        // apply observer with a lazyLink so that the dataPoint is not immediately added to the graph, and we
        // can all points in bulk later as a performance enhancement, see
        // https://github.com/phetsims/least-squares-regression/issues/58
        addedDataPoint.positionProperty.lazyLink( positionPropertyListener );

        // Listener for userControlled
        const userControlledPropertyListener = userControlled => {
          if ( userControlled ) {
            dynamicDataPointNode.moveToFront();
          }
        };

        // Move the dataPoint to the front of this layer when grabbed by the user.
        addedDataPoint.userControlledProperty.link( userControlledPropertyListener );

        // Add the removal listener for if and when this dataPoint is removed from the model.
        model.dataPoints.addItemRemovedListener( function removalListener( removedDataPoint ) {
          if ( removedDataPoint === addedDataPoint ) {

            // unlink the listeners on removedDataPoint
            removedDataPoint.positionProperty.unlink( positionPropertyListener );
            removedDataPoint.userControlledProperty.unlink( userControlledPropertyListener );

            // remove the representation of the dataPoint from the scene graph
            dataPointsLayer.removeChild( dynamicDataPointNode );
            dynamicDataPointNode.dispose();
            model.dataPoints.removeItemRemovedListener( removalListener );
          }
        } );
      }
      // For all other DataSets than CUSTOM, the dataPoints are static
      else {
        // Create and add the view representation for this dataPoint.
        // The dataPoints are static (not movable)
        const staticDataPointNode = new StaticDataPointNode( addedDataPoint, modelViewTransform );
        dataPointsLayer.addChild( staticDataPointNode );

        // Add the removal listener for if and when this dataPoint is removed from the model.
        model.dataPoints.addItemRemovedListener( function removalListener( removedDataPoint ) {
          if ( removedDataPoint === addedDataPoint ) {
            // remove the representation of the dataPoint from the scene graph
            dataPointsLayer.removeChild( staticDataPointNode );
            staticDataPointNode.dispose();
            model.dataPoints.removeItemRemovedListener( removalListener );
          }
        } );
      }
    } );

    // Create the 'Reset All' Button at the bottom right, which resets the model and some view elements
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        graphNode.reset();
        pearsonCorrelationCoefficientNode.reset();
        bestFitLineControlPanel.reset();
        myLineControlPanel.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );

    // Add nodes to the scene graph. Order is irrelevant for the following nodes
    this.addChild( pearsonCorrelationCoefficientNode );
    this.addChild( gridCheckbox );
    this.addChild( eraserButton );
    this.addChild( resetAllButton );
    this.addChild( bestFitLineControlPanel );
    this.addChild( myLineControlPanel );
    this.addChild( dataSetComboBox );
    this.addChild( sourceAndReferencePushButton );
    this.addChild( backLayer );
    this.addChild( graphNode );

    // Order matters here. These must come last
    this.addChild( bucketFrontLayer ); //must come after back layer
    this.addChild( dataPointsLayer ); // after everything but dataSetLisParent
    this.addChild( dataSetListParent ); // last, so that dataSet box list is on top of dataPoint and the graph

    // Layout all the other nodes
    {
      myLineControlPanel.right = this.layoutBounds.maxX - 10;
      myLineControlPanel.top = 20;
      bestFitLineControlPanel.left = 15;
      bestFitLineControlPanel.top = myLineControlPanel.top;
      dataSetComboBox.centerX = viewGraphBounds.centerX;
      dataSetComboBox.top = myLineControlPanel.top;
      gridCheckbox.left = myLineControlPanel.left + 10;
      gridCheckbox.top = myLineControlPanel.bottom + 10;
      pearsonCorrelationCoefficientNode.centerX = bestFitLineControlPanel.centerX;
      pearsonCorrelationCoefficientNode.top = bestFitLineControlPanel.bottom + 10;
      sourceAndReferencePushButton.centerY = dataSetComboBox.centerY;
      sourceAndReferencePushButton.left = dataSetComboBox.right + 10;
    }
  }

  /**
   * This is taken from MoleculesAndLightScreenView with modifications.
   *
   * Update the Source and Reference 'Dialog-like' Node visibility.  This node has behavior which is identical to the about dialog
   * window, and this code is heavily borrowed from AboutDialog.js.
   *
   * @param {SourceAndReferenceNode} sourceAndReferenceNode - The SourceAndReferenceNode whose visibility should be updated.
   * @private
   */
  updateSourceAndReferenceNodeVisibility( sourceAndReferenceNode ) {

    // Renderer must be specified here because the plane is added directly to the scene (instead of to some other node
    // that already has svg renderer)
    const plane = new Plane( { fill: 'black', opacity: 0.3 } );
    this.addChild( plane );
    this.addChild( sourceAndReferenceNode );

    const sourceAndReferenceListener = {
      up: () => {
        sourceAndReferenceNode.removeInputListener( sourceAndReferenceListener );
        sourceAndReferenceNode.detach();
        plane.detach();
      }
    };

    sourceAndReferenceNode.addInputListener( sourceAndReferenceListener );
    plane.addInputListener( sourceAndReferenceListener );
  }
}

leastSquaresRegression.register( 'LeastSquaresRegressionScreenView', LeastSquaresRegressionScreenView );
export default LeastSquaresRegressionScreenView;
