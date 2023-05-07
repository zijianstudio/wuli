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
const GRAPH_BOUNDS = new Dimension2(480, 480); // Size of the graph Node
const GRAPH_OFFSET = new Vector2(10, 0); // Offset Vector from the center of the screen
const IDENTITY_TRANSFORM = ModelViewTransform2.createIdentity();
const DATA_POINT_CREATOR_OFFSET_POSITIONS = [
// Offsets used for initial position of point, relative to bucket hole center. Empirically determined.
new Vector2(-35, -5), new Vector2(-25, -9), new Vector2(-20, -4), new Vector2(-15, -14), new Vector2(-10, -4), new Vector2(-5, -17), new Vector2(-0, -5), new Vector2(5, -14), new Vector2(10, -3), new Vector2(15, -7), new Vector2(25, -4), new Vector2(-0, 15), new Vector2(5, 24), new Vector2(10, 13), new Vector2(15, 17), new Vector2(25, 14), new Vector2(-35, 15), new Vector2(-25, 19), new Vector2(-20, 14), new Vector2(-15, 14), new Vector2(-10, 14), new Vector2(-5, 17), new Vector2(-0, 15)];
class LeastSquaresRegressionScreenView extends ScreenView {
  /**
   * @param {LeastSquaresRegressionModel} model
   */
  constructor(model) {
    super();

    // Bounds of the graph (excluding the axes and labels) in scenery coordinates
    const viewGraphBounds = new Bounds2(this.layoutBounds.centerX - GRAPH_BOUNDS.width / 2 + GRAPH_OFFSET.x, this.layoutBounds.centerY - GRAPH_BOUNDS.height / 2 + GRAPH_OFFSET.y, this.layoutBounds.centerX + GRAPH_BOUNDS.width / 2 + GRAPH_OFFSET.x, this.layoutBounds.centerY + GRAPH_BOUNDS.height / 2 + GRAPH_OFFSET.y);
    const modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(model.graph.bounds, viewGraphBounds);

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
    const bestFitLineControlPanel = new BestFitLineControlPanel(model.graph, model.dataPoints, model.dataPointsAddedEmitter, panelOptions);

    // Create the "My Line" Control Panel (located to the left of the graph)
    const myLineControlPanel = new MyLineControlPanel(model.graph, model.dataPoints, model.dataPointsAddedEmitter, panelOptions);

    // Create the Graph Node which is responsible for 'My Line', 'Best Fit Line' and the Residuals representation
    const graphNode = new GraphNode(model.graph, viewGraphBounds, modelViewTransform);

    // Create the Graph Axes, including the tick marks, labels and axis titles
    let graphAxesNode = new GraphAxesNode(model.selectedDataSetProperty.value, modelViewTransform, model.showGridProperty);

    // Create the dataSet combo box that appears on top of the graph
    // Width of contents limited by width of graphNode for i18n
    const dataSetLabelMaxWidth = graphNode.width / 2;
    const dataSetListParent = new Node();
    const dataSetComboBox = new DataSetComboBox(model.selectedDataSetProperty, model.dataSets, dataSetListParent, dataSetLabelMaxWidth);

    // Create a Push Button (next to the ComboBox) that can activate a dialog Node (Source and Reference Node) associated with each dataSet.
    const sourceAndReferenceNode = new SourceAndReferenceNode(model.selectedDataSetProperty, this.layoutBounds);
    const sourceAndReferencePushButton = new TextPushButton(questionMarkString, {
      baseColor: 'gray',
      font: LeastSquaresRegressionConstants.TEXT_BOLD_FONT,
      listener: () => {
        this.updateSourceAndReferenceNodeVisibility(sourceAndReferenceNode);
      },
      maxWidth: graphNode.width / 15
    });

    // Create the nodes that will be used to layer things visually.
    const backLayer = new Node();
    // Create the layer where the points will be placed. They are maintained in a separate layer so that they are over
    // all of the point placement graphs in the z-order.
    const dataPointsLayer = new Node({
      layerSplit: true
    }); // Force the moving dataPoint into a separate layer for performance reasons.
    const bucketFrontLayer = new Node({
      pickable: false
    });

    // Add the bucket view elements
    const bucketFront = new BucketFront(model.bucket, IDENTITY_TRANSFORM);
    bucketFrontLayer.addChild(bucketFront);
    const bucketHole = new BucketHole(model.bucket, IDENTITY_TRANSFORM);
    backLayer.addChild(bucketHole);

    // Add the dataPoint creator nodes. These must be added on the backLayer but after the bucket hole for proper layering.
    DATA_POINT_CREATOR_OFFSET_POSITIONS.forEach(offset => {
      backLayer.addChild(new DataPointCreatorNode(model.addUserCreatedDataPoint.bind(model), modelViewTransform, {
        left: bucketHole.centerX + offset.x,
        top: bucketHole.centerY + offset.y
      }));
    });

    // Create the button that allows the graph to be cleared of all dataPoints.
    const eraserButton = new EraserButton({
      right: bucketFront.right - 3,
      top: bucketFront.bottom + 5,
      iconWidth: 25,
      listener: () => {
        model.returnAllDataPointsToBucket();
      }
    });

    // Create the Pearson Correlation coefficient panel
    const pearsonCorrelationCoefficientNode = new PearsonCorrelationCoefficientNode(model.graph, panelOptions);

    // Create grid checkbox with grid icon
    const gridCheckbox = new GridCheckbox(model.showGridProperty, {
      spacing: 10,
      iconOptions: {
        size: 48,
        stroke: LeastSquaresRegressionConstants.MAJOR_GRID_STROKE_COLOR
      }
    });

    // Add the graphAxesNode
    this.addChild(graphAxesNode);

    // Link the comboBox selectedDataSet to the Scene Graph
    // No need to unlink, listener is present for the lifetime of the sim
    model.selectedDataSetProperty.link(selectedDataSet => {
      // Remove graphAxesNode from the scene graph if it exists
      if (graphAxesNode) {
        this.removeChild(graphAxesNode);
        graphAxesNode.dispose();
      }

      // Create and add the GraphAxesNode corresponding to the selected DataSet
      const dataSetBounds = new Bounds2(selectedDataSet.xRange.min, selectedDataSet.yRange.min, selectedDataSet.xRange.max, selectedDataSet.yRange.max);
      // GraphAxesNode require a special modelView Transform that is set by the dataSet
      const modelViewTransformAxes = ModelViewTransform2.createRectangleInvertedYMapping(dataSetBounds, viewGraphBounds);
      graphAxesNode = new GraphAxesNode(selectedDataSet, modelViewTransformAxes, model.showGridProperty);
      this.addChild(graphAxesNode);
      graphAxesNode.moveToBack(); //

      // Update the graphNode (will populate it with the new dataPoints)
      graphNode.update();

      // Update the Pearson Correlation Coefficient Panel
      pearsonCorrelationCoefficientNode.update();

      // Update the Best fit Line Equation in the best Fit Line Control Panel, (regardless of the status of the node visibility )
      bestFitLineControlPanel.updateBestFitLineEquation();

      // The bucket, eraser button must be present when custom data set is selected whereas the pushButton next to the comboBox box must be set to invisible
      if (selectedDataSet === DataSet.CUSTOM) {
        bucketFront.visible = true;
        eraserButton.visible = true;
        backLayer.visible = true;
        sourceAndReferencePushButton.visible = false;
      } else {
        bucketFront.visible = false;
        eraserButton.visible = false;
        backLayer.visible = false;
        sourceAndReferencePushButton.visible = true;
      }
    });

    // Handle the comings and goings of dataPoints.
    model.dataPoints.addItemAddedListener(addedDataPoint => {
      if (model.selectedDataSetProperty.value === DataSet.CUSTOM) {
        // Create and add the view representation for this dataPoint.
        // DataPoints are movable
        const dynamicDataPointNode = new DynamicDataPointNode(addedDataPoint, modelViewTransform);
        dataPointsLayer.addChild(dynamicDataPointNode);

        // Listener for position
        const positionPropertyListener = position => {
          // Check if the point is not animated and is overlapping with the graph before adding on the list of graph data Points
          if (model.graph.isDataPointPositionOverlappingGraph(position) && !addedDataPoint.animatingProperty.value) {
            // Add dataPoint to the array of dataPoint on graph as well as the associated residuals.
            if (!model.graph.isDataPointOnList(addedDataPoint)) {
              model.graph.addPointAndResiduals(addedDataPoint);
            }
          } else {
            if (model.graph.isDataPointOnList(addedDataPoint)) {
              // Remove dataPoint from dataPoint on graph and its associated residuals.
              model.graph.removePointAndResiduals(addedDataPoint);
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
        addedDataPoint.positionProperty.lazyLink(positionPropertyListener);

        // Listener for userControlled
        const userControlledPropertyListener = userControlled => {
          if (userControlled) {
            dynamicDataPointNode.moveToFront();
          }
        };

        // Move the dataPoint to the front of this layer when grabbed by the user.
        addedDataPoint.userControlledProperty.link(userControlledPropertyListener);

        // Add the removal listener for if and when this dataPoint is removed from the model.
        model.dataPoints.addItemRemovedListener(function removalListener(removedDataPoint) {
          if (removedDataPoint === addedDataPoint) {
            // unlink the listeners on removedDataPoint
            removedDataPoint.positionProperty.unlink(positionPropertyListener);
            removedDataPoint.userControlledProperty.unlink(userControlledPropertyListener);

            // remove the representation of the dataPoint from the scene graph
            dataPointsLayer.removeChild(dynamicDataPointNode);
            dynamicDataPointNode.dispose();
            model.dataPoints.removeItemRemovedListener(removalListener);
          }
        });
      }
      // For all other DataSets than CUSTOM, the dataPoints are static
      else {
        // Create and add the view representation for this dataPoint.
        // The dataPoints are static (not movable)
        const staticDataPointNode = new StaticDataPointNode(addedDataPoint, modelViewTransform);
        dataPointsLayer.addChild(staticDataPointNode);

        // Add the removal listener for if and when this dataPoint is removed from the model.
        model.dataPoints.addItemRemovedListener(function removalListener(removedDataPoint) {
          if (removedDataPoint === addedDataPoint) {
            // remove the representation of the dataPoint from the scene graph
            dataPointsLayer.removeChild(staticDataPointNode);
            staticDataPointNode.dispose();
            model.dataPoints.removeItemRemovedListener(removalListener);
          }
        });
      }
    });

    // Create the 'Reset All' Button at the bottom right, which resets the model and some view elements
    const resetAllButton = new ResetAllButton({
      listener: () => {
        model.reset();
        graphNode.reset();
        pearsonCorrelationCoefficientNode.reset();
        bestFitLineControlPanel.reset();
        myLineControlPanel.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    });

    // Add nodes to the scene graph. Order is irrelevant for the following nodes
    this.addChild(pearsonCorrelationCoefficientNode);
    this.addChild(gridCheckbox);
    this.addChild(eraserButton);
    this.addChild(resetAllButton);
    this.addChild(bestFitLineControlPanel);
    this.addChild(myLineControlPanel);
    this.addChild(dataSetComboBox);
    this.addChild(sourceAndReferencePushButton);
    this.addChild(backLayer);
    this.addChild(graphNode);

    // Order matters here. These must come last
    this.addChild(bucketFrontLayer); //must come after back layer
    this.addChild(dataPointsLayer); // after everything but dataSetLisParent
    this.addChild(dataSetListParent); // last, so that dataSet box list is on top of dataPoint and the graph

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
  updateSourceAndReferenceNodeVisibility(sourceAndReferenceNode) {
    // Renderer must be specified here because the plane is added directly to the scene (instead of to some other node
    // that already has svg renderer)
    const plane = new Plane({
      fill: 'black',
      opacity: 0.3
    });
    this.addChild(plane);
    this.addChild(sourceAndReferenceNode);
    const sourceAndReferenceListener = {
      up: () => {
        sourceAndReferenceNode.removeInputListener(sourceAndReferenceListener);
        sourceAndReferenceNode.detach();
        plane.detach();
      }
    };
    sourceAndReferenceNode.addInputListener(sourceAndReferenceListener);
    plane.addInputListener(sourceAndReferenceListener);
  }
}
leastSquaresRegression.register('LeastSquaresRegressionScreenView', LeastSquaresRegressionScreenView);
export default LeastSquaresRegressionScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiRGltZW5zaW9uMiIsIlZlY3RvcjIiLCJTY3JlZW5WaWV3IiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIkJ1Y2tldEZyb250IiwiQnVja2V0SG9sZSIsIkVyYXNlckJ1dHRvbiIsIlJlc2V0QWxsQnV0dG9uIiwiR3JpZENoZWNrYm94IiwiTm9kZSIsIlBsYW5lIiwiVGV4dFB1c2hCdXR0b24iLCJsZWFzdFNxdWFyZXNSZWdyZXNzaW9uIiwiTGVhc3RTcXVhcmVzUmVncmVzc2lvblN0cmluZ3MiLCJMZWFzdFNxdWFyZXNSZWdyZXNzaW9uQ29uc3RhbnRzIiwiRGF0YVNldCIsIkJlc3RGaXRMaW5lQ29udHJvbFBhbmVsIiwiRGF0YVBvaW50Q3JlYXRvck5vZGUiLCJEYXRhU2V0Q29tYm9Cb3giLCJEeW5hbWljRGF0YVBvaW50Tm9kZSIsIkdyYXBoQXhlc05vZGUiLCJHcmFwaE5vZGUiLCJNeUxpbmVDb250cm9sUGFuZWwiLCJQZWFyc29uQ29ycmVsYXRpb25Db2VmZmljaWVudE5vZGUiLCJTb3VyY2VBbmRSZWZlcmVuY2VOb2RlIiwiU3RhdGljRGF0YVBvaW50Tm9kZSIsInF1ZXN0aW9uTWFya1N0cmluZyIsInF1ZXN0aW9uTWFyayIsIkdSQVBIX0JPVU5EUyIsIkdSQVBIX09GRlNFVCIsIklERU5USVRZX1RSQU5TRk9STSIsImNyZWF0ZUlkZW50aXR5IiwiREFUQV9QT0lOVF9DUkVBVE9SX09GRlNFVF9QT1NJVElPTlMiLCJMZWFzdFNxdWFyZXNSZWdyZXNzaW9uU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ2aWV3R3JhcGhCb3VuZHMiLCJsYXlvdXRCb3VuZHMiLCJjZW50ZXJYIiwid2lkdGgiLCJ4IiwiY2VudGVyWSIsImhlaWdodCIsInkiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJjcmVhdGVSZWN0YW5nbGVJbnZlcnRlZFlNYXBwaW5nIiwiZ3JhcGgiLCJib3VuZHMiLCJwYW5lbE9wdGlvbnMiLCJyZXNpemUiLCJjb3JuZXJSYWRpdXMiLCJDT05UUk9MX1BBTkVMX0NPUk5FUl9SQURJVVMiLCJmaWxsIiwiQ09OVFJPTF9QQU5FTF9CQUNLR1JPVU5EX0NPTE9SIiwiYWxpZ24iLCJ4TWFyZ2luIiwieU1hcmdpbiIsImJlc3RGaXRMaW5lQ29udHJvbFBhbmVsIiwiZGF0YVBvaW50cyIsImRhdGFQb2ludHNBZGRlZEVtaXR0ZXIiLCJteUxpbmVDb250cm9sUGFuZWwiLCJncmFwaE5vZGUiLCJncmFwaEF4ZXNOb2RlIiwic2VsZWN0ZWREYXRhU2V0UHJvcGVydHkiLCJ2YWx1ZSIsInNob3dHcmlkUHJvcGVydHkiLCJkYXRhU2V0TGFiZWxNYXhXaWR0aCIsImRhdGFTZXRMaXN0UGFyZW50IiwiZGF0YVNldENvbWJvQm94IiwiZGF0YVNldHMiLCJzb3VyY2VBbmRSZWZlcmVuY2VOb2RlIiwic291cmNlQW5kUmVmZXJlbmNlUHVzaEJ1dHRvbiIsImJhc2VDb2xvciIsImZvbnQiLCJURVhUX0JPTERfRk9OVCIsImxpc3RlbmVyIiwidXBkYXRlU291cmNlQW5kUmVmZXJlbmNlTm9kZVZpc2liaWxpdHkiLCJtYXhXaWR0aCIsImJhY2tMYXllciIsImRhdGFQb2ludHNMYXllciIsImxheWVyU3BsaXQiLCJidWNrZXRGcm9udExheWVyIiwicGlja2FibGUiLCJidWNrZXRGcm9udCIsImJ1Y2tldCIsImFkZENoaWxkIiwiYnVja2V0SG9sZSIsImZvckVhY2giLCJvZmZzZXQiLCJhZGRVc2VyQ3JlYXRlZERhdGFQb2ludCIsImJpbmQiLCJsZWZ0IiwidG9wIiwiZXJhc2VyQnV0dG9uIiwicmlnaHQiLCJib3R0b20iLCJpY29uV2lkdGgiLCJyZXR1cm5BbGxEYXRhUG9pbnRzVG9CdWNrZXQiLCJwZWFyc29uQ29ycmVsYXRpb25Db2VmZmljaWVudE5vZGUiLCJncmlkQ2hlY2tib3giLCJzcGFjaW5nIiwiaWNvbk9wdGlvbnMiLCJzaXplIiwic3Ryb2tlIiwiTUFKT1JfR1JJRF9TVFJPS0VfQ09MT1IiLCJsaW5rIiwic2VsZWN0ZWREYXRhU2V0IiwicmVtb3ZlQ2hpbGQiLCJkaXNwb3NlIiwiZGF0YVNldEJvdW5kcyIsInhSYW5nZSIsIm1pbiIsInlSYW5nZSIsIm1heCIsIm1vZGVsVmlld1RyYW5zZm9ybUF4ZXMiLCJtb3ZlVG9CYWNrIiwidXBkYXRlIiwidXBkYXRlQmVzdEZpdExpbmVFcXVhdGlvbiIsIkNVU1RPTSIsInZpc2libGUiLCJhZGRJdGVtQWRkZWRMaXN0ZW5lciIsImFkZGVkRGF0YVBvaW50IiwiZHluYW1pY0RhdGFQb2ludE5vZGUiLCJwb3NpdGlvblByb3BlcnR5TGlzdGVuZXIiLCJwb3NpdGlvbiIsImlzRGF0YVBvaW50UG9zaXRpb25PdmVybGFwcGluZ0dyYXBoIiwiYW5pbWF0aW5nUHJvcGVydHkiLCJpc0RhdGFQb2ludE9uTGlzdCIsImFkZFBvaW50QW5kUmVzaWR1YWxzIiwicmVtb3ZlUG9pbnRBbmRSZXNpZHVhbHMiLCJzdW1PZlNxdWFyZWRSZXNpZHVhbHNDaGFydCIsInVwZGF0ZVdpZHRoIiwic3VtT2ZTcXVhcmVkUmVzaWR1YWxzIiwicG9zaXRpb25Qcm9wZXJ0eSIsImxhenlMaW5rIiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eUxpc3RlbmVyIiwidXNlckNvbnRyb2xsZWQiLCJtb3ZlVG9Gcm9udCIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwicmVtb3ZhbExpc3RlbmVyIiwicmVtb3ZlZERhdGFQb2ludCIsInVubGluayIsInJlbW92ZUl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJzdGF0aWNEYXRhUG9pbnROb2RlIiwicmVzZXRBbGxCdXR0b24iLCJyZXNldCIsIm1heFgiLCJtYXhZIiwicGxhbmUiLCJvcGFjaXR5Iiwic291cmNlQW5kUmVmZXJlbmNlTGlzdGVuZXIiLCJ1cCIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJkZXRhY2giLCJhZGRJbnB1dExpc3RlbmVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMZWFzdFNxdWFyZXNSZWdyZXNzaW9uU2NyZWVuVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIFZpZXcgZm9yIHRoZSBzaW11bGF0aW9uIHNjcmVlbiBvZiBMZWFzdCBTcXVhcmVzIFJlZ3Jlc3Npb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFydGluIFZlaWxsZXR0ZSAoQmVyZWEgQ29sbGVnZSlcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgQnVja2V0RnJvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1Y2tldC9CdWNrZXRGcm9udC5qcyc7XHJcbmltcG9ydCBCdWNrZXRIb2xlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idWNrZXQvQnVja2V0SG9sZS5qcyc7XHJcbmltcG9ydCBFcmFzZXJCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvRXJhc2VyQnV0dG9uLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IEdyaWRDaGVja2JveCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvR3JpZENoZWNrYm94LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUGxhbmUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGV4dFB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvVGV4dFB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgbGVhc3RTcXVhcmVzUmVncmVzc2lvbiBmcm9tICcuLi8uLi9sZWFzdFNxdWFyZXNSZWdyZXNzaW9uLmpzJztcclxuaW1wb3J0IExlYXN0U3F1YXJlc1JlZ3Jlc3Npb25TdHJpbmdzIGZyb20gJy4uLy4uL0xlYXN0U3F1YXJlc1JlZ3Jlc3Npb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IExlYXN0U3F1YXJlc1JlZ3Jlc3Npb25Db25zdGFudHMgZnJvbSAnLi4vTGVhc3RTcXVhcmVzUmVncmVzc2lvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBEYXRhU2V0IGZyb20gJy4uL21vZGVsL0RhdGFTZXQuanMnO1xyXG5pbXBvcnQgQmVzdEZpdExpbmVDb250cm9sUGFuZWwgZnJvbSAnLi9CZXN0Rml0TGluZUNvbnRyb2xQYW5lbC5qcyc7XHJcbmltcG9ydCBEYXRhUG9pbnRDcmVhdG9yTm9kZSBmcm9tICcuL0RhdGFQb2ludENyZWF0b3JOb2RlLmpzJztcclxuaW1wb3J0IERhdGFTZXRDb21ib0JveCBmcm9tICcuL0RhdGFTZXRDb21ib0JveC5qcyc7XHJcbmltcG9ydCBEeW5hbWljRGF0YVBvaW50Tm9kZSBmcm9tICcuL0R5bmFtaWNEYXRhUG9pbnROb2RlLmpzJztcclxuaW1wb3J0IEdyYXBoQXhlc05vZGUgZnJvbSAnLi9HcmFwaEF4ZXNOb2RlLmpzJztcclxuaW1wb3J0IEdyYXBoTm9kZSBmcm9tICcuL0dyYXBoTm9kZS5qcyc7XHJcbmltcG9ydCBNeUxpbmVDb250cm9sUGFuZWwgZnJvbSAnLi9NeUxpbmVDb250cm9sUGFuZWwuanMnO1xyXG5pbXBvcnQgUGVhcnNvbkNvcnJlbGF0aW9uQ29lZmZpY2llbnROb2RlIGZyb20gJy4vUGVhcnNvbkNvcnJlbGF0aW9uQ29lZmZpY2llbnROb2RlLmpzJztcclxuaW1wb3J0IFNvdXJjZUFuZFJlZmVyZW5jZU5vZGUgZnJvbSAnLi9Tb3VyY2VBbmRSZWZlcmVuY2VOb2RlLmpzJztcclxuaW1wb3J0IFN0YXRpY0RhdGFQb2ludE5vZGUgZnJvbSAnLi9TdGF0aWNEYXRhUG9pbnROb2RlLmpzJztcclxuXHJcbmNvbnN0IHF1ZXN0aW9uTWFya1N0cmluZyA9IExlYXN0U3F1YXJlc1JlZ3Jlc3Npb25TdHJpbmdzLnF1ZXN0aW9uTWFyaztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBHUkFQSF9CT1VORFMgPSBuZXcgRGltZW5zaW9uMiggNDgwLCA0ODAgKTsgLy8gU2l6ZSBvZiB0aGUgZ3JhcGggTm9kZVxyXG5jb25zdCBHUkFQSF9PRkZTRVQgPSBuZXcgVmVjdG9yMiggMTAsIDAgKTsgLy8gT2Zmc2V0IFZlY3RvciBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIHNjcmVlblxyXG5jb25zdCBJREVOVElUWV9UUkFOU0ZPUk0gPSBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZUlkZW50aXR5KCk7XHJcbmNvbnN0IERBVEFfUE9JTlRfQ1JFQVRPUl9PRkZTRVRfUE9TSVRJT05TID0gW1xyXG4gIC8vIE9mZnNldHMgdXNlZCBmb3IgaW5pdGlhbCBwb3NpdGlvbiBvZiBwb2ludCwgcmVsYXRpdmUgdG8gYnVja2V0IGhvbGUgY2VudGVyLiBFbXBpcmljYWxseSBkZXRlcm1pbmVkLlxyXG4gIG5ldyBWZWN0b3IyKCAtMzUsIC01ICksXHJcbiAgbmV3IFZlY3RvcjIoIC0yNSwgLTkgKSxcclxuICBuZXcgVmVjdG9yMiggLTIwLCAtNCApLFxyXG4gIG5ldyBWZWN0b3IyKCAtMTUsIC0xNCApLFxyXG4gIG5ldyBWZWN0b3IyKCAtMTAsIC00ICksXHJcbiAgbmV3IFZlY3RvcjIoIC01LCAtMTcgKSxcclxuICBuZXcgVmVjdG9yMiggLTAsIC01ICksXHJcbiAgbmV3IFZlY3RvcjIoIDUsIC0xNCApLFxyXG4gIG5ldyBWZWN0b3IyKCAxMCwgLTMgKSxcclxuICBuZXcgVmVjdG9yMiggMTUsIC03ICksXHJcbiAgbmV3IFZlY3RvcjIoIDI1LCAtNCApLFxyXG4gIG5ldyBWZWN0b3IyKCAtMCwgMTUgKSxcclxuICBuZXcgVmVjdG9yMiggNSwgMjQgKSxcclxuICBuZXcgVmVjdG9yMiggMTAsIDEzICksXHJcbiAgbmV3IFZlY3RvcjIoIDE1LCAxNyApLFxyXG4gIG5ldyBWZWN0b3IyKCAyNSwgMTQgKSxcclxuICBuZXcgVmVjdG9yMiggLTM1LCAxNSApLFxyXG4gIG5ldyBWZWN0b3IyKCAtMjUsIDE5ICksXHJcbiAgbmV3IFZlY3RvcjIoIC0yMCwgMTQgKSxcclxuICBuZXcgVmVjdG9yMiggLTE1LCAxNCApLFxyXG4gIG5ldyBWZWN0b3IyKCAtMTAsIDE0ICksXHJcbiAgbmV3IFZlY3RvcjIoIC01LCAxNyApLFxyXG4gIG5ldyBWZWN0b3IyKCAtMCwgMTUgKVxyXG5dO1xyXG5cclxuY2xhc3MgTGVhc3RTcXVhcmVzUmVncmVzc2lvblNjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtMZWFzdFNxdWFyZXNSZWdyZXNzaW9uTW9kZWx9IG1vZGVsXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsICkge1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gQm91bmRzIG9mIHRoZSBncmFwaCAoZXhjbHVkaW5nIHRoZSBheGVzIGFuZCBsYWJlbHMpIGluIHNjZW5lcnkgY29vcmRpbmF0ZXNcclxuICAgIGNvbnN0IHZpZXdHcmFwaEJvdW5kcyA9IG5ldyBCb3VuZHMyKFxyXG4gICAgICB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJYIC0gR1JBUEhfQk9VTkRTLndpZHRoIC8gMiArIEdSQVBIX09GRlNFVC54LFxyXG4gICAgICB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJZIC0gR1JBUEhfQk9VTkRTLmhlaWdodCAvIDIgKyBHUkFQSF9PRkZTRVQueSxcclxuICAgICAgdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyWCArIEdSQVBIX0JPVU5EUy53aWR0aCAvIDIgKyBHUkFQSF9PRkZTRVQueCxcclxuICAgICAgdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyWSArIEdSQVBIX0JPVU5EUy5oZWlnaHQgLyAyICsgR1JBUEhfT0ZGU0VULnlcclxuICAgICk7XHJcbiAgICBjb25zdCBtb2RlbFZpZXdUcmFuc2Zvcm0gPSBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZVJlY3RhbmdsZUludmVydGVkWU1hcHBpbmcoIG1vZGVsLmdyYXBoLmJvdW5kcywgdmlld0dyYXBoQm91bmRzICk7XHJcblxyXG4gICAgLy8gT3B0aW9ucyBmb3IgdGhlIHR3byBwYW5lbHNcclxuICAgIGNvbnN0IHBhbmVsT3B0aW9ucyA9IHtcclxuICAgICAgcmVzaXplOiBmYWxzZSxcclxuICAgICAgY29ybmVyUmFkaXVzOiBMZWFzdFNxdWFyZXNSZWdyZXNzaW9uQ29uc3RhbnRzLkNPTlRST0xfUEFORUxfQ09STkVSX1JBRElVUyxcclxuICAgICAgZmlsbDogTGVhc3RTcXVhcmVzUmVncmVzc2lvbkNvbnN0YW50cy5DT05UUk9MX1BBTkVMX0JBQ0tHUk9VTkRfQ09MT1IsXHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIHhNYXJnaW46IDEwLFxyXG4gICAgICB5TWFyZ2luOiAxMFxyXG4gICAgfTtcclxuICAgIC8vIENyZWF0ZSB0aGUgXCJCZXN0IEZpdCBMaW5lXCIgQ29udHJvbCBQYW5lbCAobG9jYXRlZCB0byB0aGUgcmlnaHQgb2YgdGhlIGdyYXBoKVxyXG4gICAgY29uc3QgYmVzdEZpdExpbmVDb250cm9sUGFuZWwgPSBuZXcgQmVzdEZpdExpbmVDb250cm9sUGFuZWwoIG1vZGVsLmdyYXBoLCBtb2RlbC5kYXRhUG9pbnRzLCBtb2RlbC5kYXRhUG9pbnRzQWRkZWRFbWl0dGVyLCBwYW5lbE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIFwiTXkgTGluZVwiIENvbnRyb2wgUGFuZWwgKGxvY2F0ZWQgdG8gdGhlIGxlZnQgb2YgdGhlIGdyYXBoKVxyXG4gICAgY29uc3QgbXlMaW5lQ29udHJvbFBhbmVsID0gbmV3IE15TGluZUNvbnRyb2xQYW5lbCggbW9kZWwuZ3JhcGgsIG1vZGVsLmRhdGFQb2ludHMsIG1vZGVsLmRhdGFQb2ludHNBZGRlZEVtaXR0ZXIsIHBhbmVsT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgR3JhcGggTm9kZSB3aGljaCBpcyByZXNwb25zaWJsZSBmb3IgJ015IExpbmUnLCAnQmVzdCBGaXQgTGluZScgYW5kIHRoZSBSZXNpZHVhbHMgcmVwcmVzZW50YXRpb25cclxuICAgIGNvbnN0IGdyYXBoTm9kZSA9IG5ldyBHcmFwaE5vZGUoIG1vZGVsLmdyYXBoLCB2aWV3R3JhcGhCb3VuZHMsIG1vZGVsVmlld1RyYW5zZm9ybSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgR3JhcGggQXhlcywgaW5jbHVkaW5nIHRoZSB0aWNrIG1hcmtzLCBsYWJlbHMgYW5kIGF4aXMgdGl0bGVzXHJcbiAgICBsZXQgZ3JhcGhBeGVzTm9kZSA9IG5ldyBHcmFwaEF4ZXNOb2RlKCBtb2RlbC5zZWxlY3RlZERhdGFTZXRQcm9wZXJ0eS52YWx1ZSwgbW9kZWxWaWV3VHJhbnNmb3JtLCBtb2RlbC5zaG93R3JpZFByb3BlcnR5ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBkYXRhU2V0IGNvbWJvIGJveCB0aGF0IGFwcGVhcnMgb24gdG9wIG9mIHRoZSBncmFwaFxyXG4gICAgLy8gV2lkdGggb2YgY29udGVudHMgbGltaXRlZCBieSB3aWR0aCBvZiBncmFwaE5vZGUgZm9yIGkxOG5cclxuICAgIGNvbnN0IGRhdGFTZXRMYWJlbE1heFdpZHRoID0gZ3JhcGhOb2RlLndpZHRoIC8gMjtcclxuICAgIGNvbnN0IGRhdGFTZXRMaXN0UGFyZW50ID0gbmV3IE5vZGUoKTtcclxuICAgIGNvbnN0IGRhdGFTZXRDb21ib0JveCA9IG5ldyBEYXRhU2V0Q29tYm9Cb3goIG1vZGVsLnNlbGVjdGVkRGF0YVNldFByb3BlcnR5LCBtb2RlbC5kYXRhU2V0cywgZGF0YVNldExpc3RQYXJlbnQsIGRhdGFTZXRMYWJlbE1heFdpZHRoICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgUHVzaCBCdXR0b24gKG5leHQgdG8gdGhlIENvbWJvQm94KSB0aGF0IGNhbiBhY3RpdmF0ZSBhIGRpYWxvZyBOb2RlIChTb3VyY2UgYW5kIFJlZmVyZW5jZSBOb2RlKSBhc3NvY2lhdGVkIHdpdGggZWFjaCBkYXRhU2V0LlxyXG4gICAgY29uc3Qgc291cmNlQW5kUmVmZXJlbmNlTm9kZSA9IG5ldyBTb3VyY2VBbmRSZWZlcmVuY2VOb2RlKCBtb2RlbC5zZWxlY3RlZERhdGFTZXRQcm9wZXJ0eSwgdGhpcy5sYXlvdXRCb3VuZHMgKTtcclxuICAgIGNvbnN0IHNvdXJjZUFuZFJlZmVyZW5jZVB1c2hCdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oIHF1ZXN0aW9uTWFya1N0cmluZywge1xyXG4gICAgICBiYXNlQ29sb3I6ICdncmF5JyxcclxuICAgICAgZm9udDogTGVhc3RTcXVhcmVzUmVncmVzc2lvbkNvbnN0YW50cy5URVhUX0JPTERfRk9OVCxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVNvdXJjZUFuZFJlZmVyZW5jZU5vZGVWaXNpYmlsaXR5KCBzb3VyY2VBbmRSZWZlcmVuY2VOb2RlICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1heFdpZHRoOiBncmFwaE5vZGUud2lkdGggLyAxNVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgbm9kZXMgdGhhdCB3aWxsIGJlIHVzZWQgdG8gbGF5ZXIgdGhpbmdzIHZpc3VhbGx5LlxyXG4gICAgY29uc3QgYmFja0xheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIC8vIENyZWF0ZSB0aGUgbGF5ZXIgd2hlcmUgdGhlIHBvaW50cyB3aWxsIGJlIHBsYWNlZC4gVGhleSBhcmUgbWFpbnRhaW5lZCBpbiBhIHNlcGFyYXRlIGxheWVyIHNvIHRoYXQgdGhleSBhcmUgb3ZlclxyXG4gICAgLy8gYWxsIG9mIHRoZSBwb2ludCBwbGFjZW1lbnQgZ3JhcGhzIGluIHRoZSB6LW9yZGVyLlxyXG4gICAgY29uc3QgZGF0YVBvaW50c0xheWVyID0gbmV3IE5vZGUoIHsgbGF5ZXJTcGxpdDogdHJ1ZSB9ICk7IC8vIEZvcmNlIHRoZSBtb3ZpbmcgZGF0YVBvaW50IGludG8gYSBzZXBhcmF0ZSBsYXllciBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucy5cclxuICAgIGNvbnN0IGJ1Y2tldEZyb250TGF5ZXIgPSBuZXcgTm9kZSggeyBwaWNrYWJsZTogZmFsc2UgfSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgYnVja2V0IHZpZXcgZWxlbWVudHNcclxuICAgIGNvbnN0IGJ1Y2tldEZyb250ID0gbmV3IEJ1Y2tldEZyb250KCBtb2RlbC5idWNrZXQsIElERU5USVRZX1RSQU5TRk9STSApO1xyXG4gICAgYnVja2V0RnJvbnRMYXllci5hZGRDaGlsZCggYnVja2V0RnJvbnQgKTtcclxuICAgIGNvbnN0IGJ1Y2tldEhvbGUgPSBuZXcgQnVja2V0SG9sZSggbW9kZWwuYnVja2V0LCBJREVOVElUWV9UUkFOU0ZPUk0gKTtcclxuICAgIGJhY2tMYXllci5hZGRDaGlsZCggYnVja2V0SG9sZSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgZGF0YVBvaW50IGNyZWF0b3Igbm9kZXMuIFRoZXNlIG11c3QgYmUgYWRkZWQgb24gdGhlIGJhY2tMYXllciBidXQgYWZ0ZXIgdGhlIGJ1Y2tldCBob2xlIGZvciBwcm9wZXIgbGF5ZXJpbmcuXHJcbiAgICBEQVRBX1BPSU5UX0NSRUFUT1JfT0ZGU0VUX1BPU0lUSU9OUy5mb3JFYWNoKCBvZmZzZXQgPT4ge1xyXG4gICAgICBiYWNrTGF5ZXIuYWRkQ2hpbGQoIG5ldyBEYXRhUG9pbnRDcmVhdG9yTm9kZShcclxuICAgICAgICBtb2RlbC5hZGRVc2VyQ3JlYXRlZERhdGFQb2ludC5iaW5kKCBtb2RlbCApLFxyXG4gICAgICAgIG1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICAgICAgbGVmdDogYnVja2V0SG9sZS5jZW50ZXJYICsgb2Zmc2V0LngsXHJcbiAgICAgICAgICB0b3A6IGJ1Y2tldEhvbGUuY2VudGVyWSArIG9mZnNldC55XHJcbiAgICAgICAgfSApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBidXR0b24gdGhhdCBhbGxvd3MgdGhlIGdyYXBoIHRvIGJlIGNsZWFyZWQgb2YgYWxsIGRhdGFQb2ludHMuXHJcbiAgICBjb25zdCBlcmFzZXJCdXR0b24gPSBuZXcgRXJhc2VyQnV0dG9uKCB7XHJcbiAgICAgIHJpZ2h0OiBidWNrZXRGcm9udC5yaWdodCAtIDMsXHJcbiAgICAgIHRvcDogYnVja2V0RnJvbnQuYm90dG9tICsgNSxcclxuICAgICAgaWNvbldpZHRoOiAyNSxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBtb2RlbC5yZXR1cm5BbGxEYXRhUG9pbnRzVG9CdWNrZXQoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgUGVhcnNvbiBDb3JyZWxhdGlvbiBjb2VmZmljaWVudCBwYW5lbFxyXG4gICAgY29uc3QgcGVhcnNvbkNvcnJlbGF0aW9uQ29lZmZpY2llbnROb2RlID0gbmV3IFBlYXJzb25Db3JyZWxhdGlvbkNvZWZmaWNpZW50Tm9kZSggbW9kZWwuZ3JhcGgsIHBhbmVsT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBncmlkIGNoZWNrYm94IHdpdGggZ3JpZCBpY29uXHJcbiAgICBjb25zdCBncmlkQ2hlY2tib3ggPSBuZXcgR3JpZENoZWNrYm94KCBtb2RlbC5zaG93R3JpZFByb3BlcnR5LCB7XHJcbiAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICBpY29uT3B0aW9uczoge1xyXG4gICAgICAgIHNpemU6IDQ4LFxyXG4gICAgICAgIHN0cm9rZTogTGVhc3RTcXVhcmVzUmVncmVzc2lvbkNvbnN0YW50cy5NQUpPUl9HUklEX1NUUk9LRV9DT0xPUlxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBncmFwaEF4ZXNOb2RlXHJcbiAgICB0aGlzLmFkZENoaWxkKCBncmFwaEF4ZXNOb2RlICk7XHJcblxyXG4gICAgLy8gTGluayB0aGUgY29tYm9Cb3ggc2VsZWN0ZWREYXRhU2V0IHRvIHRoZSBTY2VuZSBHcmFwaFxyXG4gICAgLy8gTm8gbmVlZCB0byB1bmxpbmssIGxpc3RlbmVyIGlzIHByZXNlbnQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltXHJcbiAgICBtb2RlbC5zZWxlY3RlZERhdGFTZXRQcm9wZXJ0eS5saW5rKCBzZWxlY3RlZERhdGFTZXQgPT4ge1xyXG5cclxuICAgICAgLy8gUmVtb3ZlIGdyYXBoQXhlc05vZGUgZnJvbSB0aGUgc2NlbmUgZ3JhcGggaWYgaXQgZXhpc3RzXHJcbiAgICAgIGlmICggZ3JhcGhBeGVzTm9kZSApIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUNoaWxkKCBncmFwaEF4ZXNOb2RlICk7XHJcbiAgICAgICAgZ3JhcGhBeGVzTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSBHcmFwaEF4ZXNOb2RlIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHNlbGVjdGVkIERhdGFTZXRcclxuICAgICAgY29uc3QgZGF0YVNldEJvdW5kcyA9IG5ldyBCb3VuZHMyKCBzZWxlY3RlZERhdGFTZXQueFJhbmdlLm1pbiwgc2VsZWN0ZWREYXRhU2V0LnlSYW5nZS5taW4sIHNlbGVjdGVkRGF0YVNldC54UmFuZ2UubWF4LCBzZWxlY3RlZERhdGFTZXQueVJhbmdlLm1heCApO1xyXG4gICAgICAvLyBHcmFwaEF4ZXNOb2RlIHJlcXVpcmUgYSBzcGVjaWFsIG1vZGVsVmlldyBUcmFuc2Zvcm0gdGhhdCBpcyBzZXQgYnkgdGhlIGRhdGFTZXRcclxuICAgICAgY29uc3QgbW9kZWxWaWV3VHJhbnNmb3JtQXhlcyA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlUmVjdGFuZ2xlSW52ZXJ0ZWRZTWFwcGluZyggZGF0YVNldEJvdW5kcywgdmlld0dyYXBoQm91bmRzICk7XHJcbiAgICAgIGdyYXBoQXhlc05vZGUgPSBuZXcgR3JhcGhBeGVzTm9kZSggc2VsZWN0ZWREYXRhU2V0LCBtb2RlbFZpZXdUcmFuc2Zvcm1BeGVzLCBtb2RlbC5zaG93R3JpZFByb3BlcnR5ICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIGdyYXBoQXhlc05vZGUgKTtcclxuICAgICAgZ3JhcGhBeGVzTm9kZS5tb3ZlVG9CYWNrKCk7IC8vXHJcblxyXG4gICAgICAvLyBVcGRhdGUgdGhlIGdyYXBoTm9kZSAod2lsbCBwb3B1bGF0ZSBpdCB3aXRoIHRoZSBuZXcgZGF0YVBvaW50cylcclxuICAgICAgZ3JhcGhOb2RlLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgLy8gVXBkYXRlIHRoZSBQZWFyc29uIENvcnJlbGF0aW9uIENvZWZmaWNpZW50IFBhbmVsXHJcbiAgICAgIHBlYXJzb25Db3JyZWxhdGlvbkNvZWZmaWNpZW50Tm9kZS51cGRhdGUoKTtcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUgQmVzdCBmaXQgTGluZSBFcXVhdGlvbiBpbiB0aGUgYmVzdCBGaXQgTGluZSBDb250cm9sIFBhbmVsLCAocmVnYXJkbGVzcyBvZiB0aGUgc3RhdHVzIG9mIHRoZSBub2RlIHZpc2liaWxpdHkgKVxyXG4gICAgICBiZXN0Rml0TGluZUNvbnRyb2xQYW5lbC51cGRhdGVCZXN0Rml0TGluZUVxdWF0aW9uKCk7XHJcblxyXG4gICAgICAvLyBUaGUgYnVja2V0LCBlcmFzZXIgYnV0dG9uIG11c3QgYmUgcHJlc2VudCB3aGVuIGN1c3RvbSBkYXRhIHNldCBpcyBzZWxlY3RlZCB3aGVyZWFzIHRoZSBwdXNoQnV0dG9uIG5leHQgdG8gdGhlIGNvbWJvQm94IGJveCBtdXN0IGJlIHNldCB0byBpbnZpc2libGVcclxuICAgICAgaWYgKCBzZWxlY3RlZERhdGFTZXQgPT09IERhdGFTZXQuQ1VTVE9NICkge1xyXG4gICAgICAgIGJ1Y2tldEZyb250LnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIGVyYXNlckJ1dHRvbi52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICBiYWNrTGF5ZXIudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgc291cmNlQW5kUmVmZXJlbmNlUHVzaEJ1dHRvbi52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgYnVja2V0RnJvbnQudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIGVyYXNlckJ1dHRvbi52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgYmFja0xheWVyLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICBzb3VyY2VBbmRSZWZlcmVuY2VQdXNoQnV0dG9uLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSGFuZGxlIHRoZSBjb21pbmdzIGFuZCBnb2luZ3Mgb2YgZGF0YVBvaW50cy5cclxuICAgIG1vZGVsLmRhdGFQb2ludHMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIGFkZGVkRGF0YVBvaW50ID0+IHtcclxuXHJcbiAgICAgIGlmICggbW9kZWwuc2VsZWN0ZWREYXRhU2V0UHJvcGVydHkudmFsdWUgPT09IERhdGFTZXQuQ1VTVE9NICkge1xyXG4gICAgICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSB2aWV3IHJlcHJlc2VudGF0aW9uIGZvciB0aGlzIGRhdGFQb2ludC5cclxuICAgICAgICAvLyBEYXRhUG9pbnRzIGFyZSBtb3ZhYmxlXHJcbiAgICAgICAgY29uc3QgZHluYW1pY0RhdGFQb2ludE5vZGUgPSBuZXcgRHluYW1pY0RhdGFQb2ludE5vZGUoIGFkZGVkRGF0YVBvaW50LCBtb2RlbFZpZXdUcmFuc2Zvcm0gKTtcclxuICAgICAgICBkYXRhUG9pbnRzTGF5ZXIuYWRkQ2hpbGQoIGR5bmFtaWNEYXRhUG9pbnROb2RlICk7XHJcblxyXG4gICAgICAgIC8vIExpc3RlbmVyIGZvciBwb3NpdGlvblxyXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uUHJvcGVydHlMaXN0ZW5lciA9IHBvc2l0aW9uID0+IHtcclxuICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBwb2ludCBpcyBub3QgYW5pbWF0ZWQgYW5kIGlzIG92ZXJsYXBwaW5nIHdpdGggdGhlIGdyYXBoIGJlZm9yZSBhZGRpbmcgb24gdGhlIGxpc3Qgb2YgZ3JhcGggZGF0YSBQb2ludHNcclxuICAgICAgICAgIGlmICggbW9kZWwuZ3JhcGguaXNEYXRhUG9pbnRQb3NpdGlvbk92ZXJsYXBwaW5nR3JhcGgoIHBvc2l0aW9uICkgJiYgIWFkZGVkRGF0YVBvaW50LmFuaW1hdGluZ1Byb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGRhdGFQb2ludCB0byB0aGUgYXJyYXkgb2YgZGF0YVBvaW50IG9uIGdyYXBoIGFzIHdlbGwgYXMgdGhlIGFzc29jaWF0ZWQgcmVzaWR1YWxzLlxyXG4gICAgICAgICAgICBpZiAoICFtb2RlbC5ncmFwaC5pc0RhdGFQb2ludE9uTGlzdCggYWRkZWREYXRhUG9pbnQgKSApIHtcclxuICAgICAgICAgICAgICBtb2RlbC5ncmFwaC5hZGRQb2ludEFuZFJlc2lkdWFscyggYWRkZWREYXRhUG9pbnQgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICggbW9kZWwuZ3JhcGguaXNEYXRhUG9pbnRPbkxpc3QoIGFkZGVkRGF0YVBvaW50ICkgKSB7XHJcbiAgICAgICAgICAgICAgLy8gUmVtb3ZlIGRhdGFQb2ludCBmcm9tIGRhdGFQb2ludCBvbiBncmFwaCBhbmQgaXRzIGFzc29jaWF0ZWQgcmVzaWR1YWxzLlxyXG4gICAgICAgICAgICAgIG1vZGVsLmdyYXBoLnJlbW92ZVBvaW50QW5kUmVzaWR1YWxzKCBhZGRlZERhdGFQb2ludCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gdXBkYXRlIHRoZSBjb250cm9sIHBhbmVsIHJlYWRvdXRzIGFuZCBiZXN0IGZpdCBsaW5lIGdlb21ldHJ5IHdoZW4gcG9zaXRpb24gY2hhbmdlc1xyXG4gICAgICAgICAgYmVzdEZpdExpbmVDb250cm9sUGFuZWwudXBkYXRlQmVzdEZpdExpbmVFcXVhdGlvbigpO1xyXG4gICAgICAgICAgYmVzdEZpdExpbmVDb250cm9sUGFuZWwuc3VtT2ZTcXVhcmVkUmVzaWR1YWxzQ2hhcnQudXBkYXRlV2lkdGgoKTtcclxuICAgICAgICAgIG15TGluZUNvbnRyb2xQYW5lbC5zdW1PZlNxdWFyZWRSZXNpZHVhbHMudXBkYXRlV2lkdGgoKTtcclxuICAgICAgICAgIGdyYXBoTm9kZS51cGRhdGUoKTtcclxuICAgICAgICAgIHBlYXJzb25Db3JyZWxhdGlvbkNvZWZmaWNpZW50Tm9kZS51cGRhdGUoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgZ3JhcGggdXBvbiBhIGNoYW5nZSBvZiBwb3NpdGlvbiBvZiBhIGRhdGFQb2ludFxyXG4gICAgICAgIC8vIGFwcGx5IG9ic2VydmVyIHdpdGggYSBsYXp5TGluayBzbyB0aGF0IHRoZSBkYXRhUG9pbnQgaXMgbm90IGltbWVkaWF0ZWx5IGFkZGVkIHRvIHRoZSBncmFwaCwgYW5kIHdlXHJcbiAgICAgICAgLy8gY2FuIGFsbCBwb2ludHMgaW4gYnVsayBsYXRlciBhcyBhIHBlcmZvcm1hbmNlIGVuaGFuY2VtZW50LCBzZWVcclxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbGVhc3Qtc3F1YXJlcy1yZWdyZXNzaW9uL2lzc3Vlcy81OFxyXG4gICAgICAgIGFkZGVkRGF0YVBvaW50LnBvc2l0aW9uUHJvcGVydHkubGF6eUxpbmsoIHBvc2l0aW9uUHJvcGVydHlMaXN0ZW5lciApO1xyXG5cclxuICAgICAgICAvLyBMaXN0ZW5lciBmb3IgdXNlckNvbnRyb2xsZWRcclxuICAgICAgICBjb25zdCB1c2VyQ29udHJvbGxlZFByb3BlcnR5TGlzdGVuZXIgPSB1c2VyQ29udHJvbGxlZCA9PiB7XHJcbiAgICAgICAgICBpZiAoIHVzZXJDb250cm9sbGVkICkge1xyXG4gICAgICAgICAgICBkeW5hbWljRGF0YVBvaW50Tm9kZS5tb3ZlVG9Gcm9udCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIE1vdmUgdGhlIGRhdGFQb2ludCB0byB0aGUgZnJvbnQgb2YgdGhpcyBsYXllciB3aGVuIGdyYWJiZWQgYnkgdGhlIHVzZXIuXHJcbiAgICAgICAgYWRkZWREYXRhUG9pbnQudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5saW5rKCB1c2VyQ29udHJvbGxlZFByb3BlcnR5TGlzdGVuZXIgKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHRoZSByZW1vdmFsIGxpc3RlbmVyIGZvciBpZiBhbmQgd2hlbiB0aGlzIGRhdGFQb2ludCBpcyByZW1vdmVkIGZyb20gdGhlIG1vZGVsLlxyXG4gICAgICAgIG1vZGVsLmRhdGFQb2ludHMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggZnVuY3Rpb24gcmVtb3ZhbExpc3RlbmVyKCByZW1vdmVkRGF0YVBvaW50ICkge1xyXG4gICAgICAgICAgaWYgKCByZW1vdmVkRGF0YVBvaW50ID09PSBhZGRlZERhdGFQb2ludCApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHVubGluayB0aGUgbGlzdGVuZXJzIG9uIHJlbW92ZWREYXRhUG9pbnRcclxuICAgICAgICAgICAgcmVtb3ZlZERhdGFQb2ludC5wb3NpdGlvblByb3BlcnR5LnVubGluayggcG9zaXRpb25Qcm9wZXJ0eUxpc3RlbmVyICk7XHJcbiAgICAgICAgICAgIHJlbW92ZWREYXRhUG9pbnQudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS51bmxpbmsoIHVzZXJDb250cm9sbGVkUHJvcGVydHlMaXN0ZW5lciApO1xyXG5cclxuICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YVBvaW50IGZyb20gdGhlIHNjZW5lIGdyYXBoXHJcbiAgICAgICAgICAgIGRhdGFQb2ludHNMYXllci5yZW1vdmVDaGlsZCggZHluYW1pY0RhdGFQb2ludE5vZGUgKTtcclxuICAgICAgICAgICAgZHluYW1pY0RhdGFQb2ludE5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICBtb2RlbC5kYXRhUG9pbnRzLnJlbW92ZUl0ZW1SZW1vdmVkTGlzdGVuZXIoIHJlbW92YWxMaXN0ZW5lciApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICAvLyBGb3IgYWxsIG90aGVyIERhdGFTZXRzIHRoYW4gQ1VTVE9NLCB0aGUgZGF0YVBvaW50cyBhcmUgc3RhdGljXHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSB2aWV3IHJlcHJlc2VudGF0aW9uIGZvciB0aGlzIGRhdGFQb2ludC5cclxuICAgICAgICAvLyBUaGUgZGF0YVBvaW50cyBhcmUgc3RhdGljIChub3QgbW92YWJsZSlcclxuICAgICAgICBjb25zdCBzdGF0aWNEYXRhUG9pbnROb2RlID0gbmV3IFN0YXRpY0RhdGFQb2ludE5vZGUoIGFkZGVkRGF0YVBvaW50LCBtb2RlbFZpZXdUcmFuc2Zvcm0gKTtcclxuICAgICAgICBkYXRhUG9pbnRzTGF5ZXIuYWRkQ2hpbGQoIHN0YXRpY0RhdGFQb2ludE5vZGUgKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHRoZSByZW1vdmFsIGxpc3RlbmVyIGZvciBpZiBhbmQgd2hlbiB0aGlzIGRhdGFQb2ludCBpcyByZW1vdmVkIGZyb20gdGhlIG1vZGVsLlxyXG4gICAgICAgIG1vZGVsLmRhdGFQb2ludHMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggZnVuY3Rpb24gcmVtb3ZhbExpc3RlbmVyKCByZW1vdmVkRGF0YVBvaW50ICkge1xyXG4gICAgICAgICAgaWYgKCByZW1vdmVkRGF0YVBvaW50ID09PSBhZGRlZERhdGFQb2ludCApIHtcclxuICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YVBvaW50IGZyb20gdGhlIHNjZW5lIGdyYXBoXHJcbiAgICAgICAgICAgIGRhdGFQb2ludHNMYXllci5yZW1vdmVDaGlsZCggc3RhdGljRGF0YVBvaW50Tm9kZSApO1xyXG4gICAgICAgICAgICBzdGF0aWNEYXRhUG9pbnROb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgbW9kZWwuZGF0YVBvaW50cy5yZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyKCByZW1vdmFsTGlzdGVuZXIgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlICdSZXNldCBBbGwnIEJ1dHRvbiBhdCB0aGUgYm90dG9tIHJpZ2h0LCB3aGljaCByZXNldHMgdGhlIG1vZGVsIGFuZCBzb21lIHZpZXcgZWxlbWVudHNcclxuICAgIGNvbnN0IHJlc2V0QWxsQnV0dG9uID0gbmV3IFJlc2V0QWxsQnV0dG9uKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgbW9kZWwucmVzZXQoKTtcclxuICAgICAgICBncmFwaE5vZGUucmVzZXQoKTtcclxuICAgICAgICBwZWFyc29uQ29ycmVsYXRpb25Db2VmZmljaWVudE5vZGUucmVzZXQoKTtcclxuICAgICAgICBiZXN0Rml0TGluZUNvbnRyb2xQYW5lbC5yZXNldCgpO1xyXG4gICAgICAgIG15TGluZUNvbnRyb2xQYW5lbC5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIDEwLFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSAxMFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFkZCBub2RlcyB0byB0aGUgc2NlbmUgZ3JhcGguIE9yZGVyIGlzIGlycmVsZXZhbnQgZm9yIHRoZSBmb2xsb3dpbmcgbm9kZXNcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHBlYXJzb25Db3JyZWxhdGlvbkNvZWZmaWNpZW50Tm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZ3JpZENoZWNrYm94ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBlcmFzZXJCdXR0b24gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJlc2V0QWxsQnV0dG9uICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBiZXN0Rml0TGluZUNvbnRyb2xQYW5lbCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbXlMaW5lQ29udHJvbFBhbmVsICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBkYXRhU2V0Q29tYm9Cb3ggKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNvdXJjZUFuZFJlZmVyZW5jZVB1c2hCdXR0b24gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJhY2tMYXllciApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZ3JhcGhOb2RlICk7XHJcblxyXG4gICAgLy8gT3JkZXIgbWF0dGVycyBoZXJlLiBUaGVzZSBtdXN0IGNvbWUgbGFzdFxyXG4gICAgdGhpcy5hZGRDaGlsZCggYnVja2V0RnJvbnRMYXllciApOyAvL211c3QgY29tZSBhZnRlciBiYWNrIGxheWVyXHJcbiAgICB0aGlzLmFkZENoaWxkKCBkYXRhUG9pbnRzTGF5ZXIgKTsgLy8gYWZ0ZXIgZXZlcnl0aGluZyBidXQgZGF0YVNldExpc1BhcmVudFxyXG4gICAgdGhpcy5hZGRDaGlsZCggZGF0YVNldExpc3RQYXJlbnQgKTsgLy8gbGFzdCwgc28gdGhhdCBkYXRhU2V0IGJveCBsaXN0IGlzIG9uIHRvcCBvZiBkYXRhUG9pbnQgYW5kIHRoZSBncmFwaFxyXG5cclxuICAgIC8vIExheW91dCBhbGwgdGhlIG90aGVyIG5vZGVzXHJcbiAgICB7XHJcbiAgICAgIG15TGluZUNvbnRyb2xQYW5lbC5yaWdodCA9IHRoaXMubGF5b3V0Qm91bmRzLm1heFggLSAxMDtcclxuICAgICAgbXlMaW5lQ29udHJvbFBhbmVsLnRvcCA9IDIwO1xyXG4gICAgICBiZXN0Rml0TGluZUNvbnRyb2xQYW5lbC5sZWZ0ID0gMTU7XHJcbiAgICAgIGJlc3RGaXRMaW5lQ29udHJvbFBhbmVsLnRvcCA9IG15TGluZUNvbnRyb2xQYW5lbC50b3A7XHJcbiAgICAgIGRhdGFTZXRDb21ib0JveC5jZW50ZXJYID0gdmlld0dyYXBoQm91bmRzLmNlbnRlclg7XHJcbiAgICAgIGRhdGFTZXRDb21ib0JveC50b3AgPSBteUxpbmVDb250cm9sUGFuZWwudG9wO1xyXG4gICAgICBncmlkQ2hlY2tib3gubGVmdCA9IG15TGluZUNvbnRyb2xQYW5lbC5sZWZ0ICsgMTA7XHJcbiAgICAgIGdyaWRDaGVja2JveC50b3AgPSBteUxpbmVDb250cm9sUGFuZWwuYm90dG9tICsgMTA7XHJcbiAgICAgIHBlYXJzb25Db3JyZWxhdGlvbkNvZWZmaWNpZW50Tm9kZS5jZW50ZXJYID0gYmVzdEZpdExpbmVDb250cm9sUGFuZWwuY2VudGVyWDtcclxuICAgICAgcGVhcnNvbkNvcnJlbGF0aW9uQ29lZmZpY2llbnROb2RlLnRvcCA9IGJlc3RGaXRMaW5lQ29udHJvbFBhbmVsLmJvdHRvbSArIDEwO1xyXG4gICAgICBzb3VyY2VBbmRSZWZlcmVuY2VQdXNoQnV0dG9uLmNlbnRlclkgPSBkYXRhU2V0Q29tYm9Cb3guY2VudGVyWTtcclxuICAgICAgc291cmNlQW5kUmVmZXJlbmNlUHVzaEJ1dHRvbi5sZWZ0ID0gZGF0YVNldENvbWJvQm94LnJpZ2h0ICsgMTA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGlzIGlzIHRha2VuIGZyb20gTW9sZWN1bGVzQW5kTGlnaHRTY3JlZW5WaWV3IHdpdGggbW9kaWZpY2F0aW9ucy5cclxuICAgKlxyXG4gICAqIFVwZGF0ZSB0aGUgU291cmNlIGFuZCBSZWZlcmVuY2UgJ0RpYWxvZy1saWtlJyBOb2RlIHZpc2liaWxpdHkuICBUaGlzIG5vZGUgaGFzIGJlaGF2aW9yIHdoaWNoIGlzIGlkZW50aWNhbCB0byB0aGUgYWJvdXQgZGlhbG9nXHJcbiAgICogd2luZG93LCBhbmQgdGhpcyBjb2RlIGlzIGhlYXZpbHkgYm9ycm93ZWQgZnJvbSBBYm91dERpYWxvZy5qcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U291cmNlQW5kUmVmZXJlbmNlTm9kZX0gc291cmNlQW5kUmVmZXJlbmNlTm9kZSAtIFRoZSBTb3VyY2VBbmRSZWZlcmVuY2VOb2RlIHdob3NlIHZpc2liaWxpdHkgc2hvdWxkIGJlIHVwZGF0ZWQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVTb3VyY2VBbmRSZWZlcmVuY2VOb2RlVmlzaWJpbGl0eSggc291cmNlQW5kUmVmZXJlbmNlTm9kZSApIHtcclxuXHJcbiAgICAvLyBSZW5kZXJlciBtdXN0IGJlIHNwZWNpZmllZCBoZXJlIGJlY2F1c2UgdGhlIHBsYW5lIGlzIGFkZGVkIGRpcmVjdGx5IHRvIHRoZSBzY2VuZSAoaW5zdGVhZCBvZiB0byBzb21lIG90aGVyIG5vZGVcclxuICAgIC8vIHRoYXQgYWxyZWFkeSBoYXMgc3ZnIHJlbmRlcmVyKVxyXG4gICAgY29uc3QgcGxhbmUgPSBuZXcgUGxhbmUoIHsgZmlsbDogJ2JsYWNrJywgb3BhY2l0eTogMC4zIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHBsYW5lICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzb3VyY2VBbmRSZWZlcmVuY2VOb2RlICk7XHJcblxyXG4gICAgY29uc3Qgc291cmNlQW5kUmVmZXJlbmNlTGlzdGVuZXIgPSB7XHJcbiAgICAgIHVwOiAoKSA9PiB7XHJcbiAgICAgICAgc291cmNlQW5kUmVmZXJlbmNlTm9kZS5yZW1vdmVJbnB1dExpc3RlbmVyKCBzb3VyY2VBbmRSZWZlcmVuY2VMaXN0ZW5lciApO1xyXG4gICAgICAgIHNvdXJjZUFuZFJlZmVyZW5jZU5vZGUuZGV0YWNoKCk7XHJcbiAgICAgICAgcGxhbmUuZGV0YWNoKCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgc291cmNlQW5kUmVmZXJlbmNlTm9kZS5hZGRJbnB1dExpc3RlbmVyKCBzb3VyY2VBbmRSZWZlcmVuY2VMaXN0ZW5lciApO1xyXG4gICAgcGxhbmUuYWRkSW5wdXRMaXN0ZW5lciggc291cmNlQW5kUmVmZXJlbmNlTGlzdGVuZXIgKTtcclxuICB9XHJcbn1cclxuXHJcbmxlYXN0U3F1YXJlc1JlZ3Jlc3Npb24ucmVnaXN0ZXIoICdMZWFzdFNxdWFyZXNSZWdyZXNzaW9uU2NyZWVuVmlldycsIExlYXN0U3F1YXJlc1JlZ3Jlc3Npb25TY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IExlYXN0U3F1YXJlc1JlZ3Jlc3Npb25TY3JlZW5WaWV3O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxPQUFPQyxtQkFBbUIsTUFBTSx1REFBdUQ7QUFDdkYsT0FBT0MsV0FBVyxNQUFNLG1EQUFtRDtBQUMzRSxPQUFPQyxVQUFVLE1BQU0sa0RBQWtEO0FBQ3pFLE9BQU9DLFlBQVksTUFBTSxxREFBcUQ7QUFDOUUsT0FBT0MsY0FBYyxNQUFNLHVEQUF1RDtBQUNsRixPQUFPQyxZQUFZLE1BQU0sNkNBQTZDO0FBQ3RFLFNBQVNDLElBQUksRUFBRUMsS0FBSyxRQUFRLG1DQUFtQztBQUMvRCxPQUFPQyxjQUFjLE1BQU0sOENBQThDO0FBQ3pFLE9BQU9DLHNCQUFzQixNQUFNLGlDQUFpQztBQUNwRSxPQUFPQyw2QkFBNkIsTUFBTSx3Q0FBd0M7QUFDbEYsT0FBT0MsK0JBQStCLE1BQU0sdUNBQXVDO0FBQ25GLE9BQU9DLE9BQU8sTUFBTSxxQkFBcUI7QUFDekMsT0FBT0MsdUJBQXVCLE1BQU0sOEJBQThCO0FBQ2xFLE9BQU9DLG9CQUFvQixNQUFNLDJCQUEyQjtBQUM1RCxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBQ2xELE9BQU9DLG9CQUFvQixNQUFNLDJCQUEyQjtBQUM1RCxPQUFPQyxhQUFhLE1BQU0sb0JBQW9CO0FBQzlDLE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFDdEMsT0FBT0Msa0JBQWtCLE1BQU0seUJBQXlCO0FBQ3hELE9BQU9DLGlDQUFpQyxNQUFNLHdDQUF3QztBQUN0RixPQUFPQyxzQkFBc0IsTUFBTSw2QkFBNkI7QUFDaEUsT0FBT0MsbUJBQW1CLE1BQU0sMEJBQTBCO0FBRTFELE1BQU1DLGtCQUFrQixHQUFHYiw2QkFBNkIsQ0FBQ2MsWUFBWTs7QUFFckU7QUFDQSxNQUFNQyxZQUFZLEdBQUcsSUFBSTVCLFVBQVUsQ0FBRSxHQUFHLEVBQUUsR0FBSSxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNNkIsWUFBWSxHQUFHLElBQUk1QixPQUFPLENBQUUsRUFBRSxFQUFFLENBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0MsTUFBTTZCLGtCQUFrQixHQUFHM0IsbUJBQW1CLENBQUM0QixjQUFjLENBQUMsQ0FBQztBQUMvRCxNQUFNQyxtQ0FBbUMsR0FBRztBQUMxQztBQUNBLElBQUkvQixPQUFPLENBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFFLENBQUMsRUFDdEIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBRSxDQUFDLEVBQ3RCLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUUsQ0FBQyxFQUN0QixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFHLENBQUMsRUFDdkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBRSxDQUFDLEVBQ3RCLElBQUlBLE9BQU8sQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUcsQ0FBQyxFQUN0QixJQUFJQSxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUMsRUFDckIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUcsQ0FBQyxFQUNyQixJQUFJQSxPQUFPLENBQUUsRUFBRSxFQUFFLENBQUMsQ0FBRSxDQUFDLEVBQ3JCLElBQUlBLE9BQU8sQ0FBRSxFQUFFLEVBQUUsQ0FBQyxDQUFFLENBQUMsRUFDckIsSUFBSUEsT0FBTyxDQUFFLEVBQUUsRUFBRSxDQUFDLENBQUUsQ0FBQyxFQUNyQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRyxDQUFDLEVBQ3JCLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsRUFBRyxDQUFDLEVBQ3BCLElBQUlBLE9BQU8sQ0FBRSxFQUFFLEVBQUUsRUFBRyxDQUFDLEVBQ3JCLElBQUlBLE9BQU8sQ0FBRSxFQUFFLEVBQUUsRUFBRyxDQUFDLEVBQ3JCLElBQUlBLE9BQU8sQ0FBRSxFQUFFLEVBQUUsRUFBRyxDQUFDLEVBQ3JCLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsRUFBRSxFQUFHLENBQUMsRUFDdEIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxFQUFFLEVBQUcsQ0FBQyxFQUN0QixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRyxDQUFDLEVBQ3RCLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsRUFBRSxFQUFHLENBQUMsRUFDdEIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxFQUFFLEVBQUcsQ0FBQyxFQUN0QixJQUFJQSxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRyxDQUFDLEVBQ3JCLElBQUlBLE9BQU8sQ0FBRSxDQUFDLENBQUMsRUFBRSxFQUFHLENBQUMsQ0FDdEI7QUFFRCxNQUFNZ0MsZ0NBQWdDLFNBQVMvQixVQUFVLENBQUM7RUFFeEQ7QUFDRjtBQUNBO0VBQ0VnQyxXQUFXQSxDQUFFQyxLQUFLLEVBQUc7SUFFbkIsS0FBSyxDQUFDLENBQUM7O0lBRVA7SUFDQSxNQUFNQyxlQUFlLEdBQUcsSUFBSXJDLE9BQU8sQ0FDakMsSUFBSSxDQUFDc0MsWUFBWSxDQUFDQyxPQUFPLEdBQUdWLFlBQVksQ0FBQ1csS0FBSyxHQUFHLENBQUMsR0FBR1YsWUFBWSxDQUFDVyxDQUFDLEVBQ25FLElBQUksQ0FBQ0gsWUFBWSxDQUFDSSxPQUFPLEdBQUdiLFlBQVksQ0FBQ2MsTUFBTSxHQUFHLENBQUMsR0FBR2IsWUFBWSxDQUFDYyxDQUFDLEVBQ3BFLElBQUksQ0FBQ04sWUFBWSxDQUFDQyxPQUFPLEdBQUdWLFlBQVksQ0FBQ1csS0FBSyxHQUFHLENBQUMsR0FBR1YsWUFBWSxDQUFDVyxDQUFDLEVBQ25FLElBQUksQ0FBQ0gsWUFBWSxDQUFDSSxPQUFPLEdBQUdiLFlBQVksQ0FBQ2MsTUFBTSxHQUFHLENBQUMsR0FBR2IsWUFBWSxDQUFDYyxDQUNyRSxDQUFDO0lBQ0QsTUFBTUMsa0JBQWtCLEdBQUd6QyxtQkFBbUIsQ0FBQzBDLCtCQUErQixDQUFFVixLQUFLLENBQUNXLEtBQUssQ0FBQ0MsTUFBTSxFQUFFWCxlQUFnQixDQUFDOztJQUVySDtJQUNBLE1BQU1ZLFlBQVksR0FBRztNQUNuQkMsTUFBTSxFQUFFLEtBQUs7TUFDYkMsWUFBWSxFQUFFcEMsK0JBQStCLENBQUNxQywyQkFBMkI7TUFDekVDLElBQUksRUFBRXRDLCtCQUErQixDQUFDdUMsOEJBQThCO01BQ3BFQyxLQUFLLEVBQUUsTUFBTTtNQUNiQyxPQUFPLEVBQUUsRUFBRTtNQUNYQyxPQUFPLEVBQUU7SUFDWCxDQUFDO0lBQ0Q7SUFDQSxNQUFNQyx1QkFBdUIsR0FBRyxJQUFJekMsdUJBQXVCLENBQUVtQixLQUFLLENBQUNXLEtBQUssRUFBRVgsS0FBSyxDQUFDdUIsVUFBVSxFQUFFdkIsS0FBSyxDQUFDd0Isc0JBQXNCLEVBQUVYLFlBQWEsQ0FBQzs7SUFFeEk7SUFDQSxNQUFNWSxrQkFBa0IsR0FBRyxJQUFJdEMsa0JBQWtCLENBQUVhLEtBQUssQ0FBQ1csS0FBSyxFQUFFWCxLQUFLLENBQUN1QixVQUFVLEVBQUV2QixLQUFLLENBQUN3QixzQkFBc0IsRUFBRVgsWUFBYSxDQUFDOztJQUU5SDtJQUNBLE1BQU1hLFNBQVMsR0FBRyxJQUFJeEMsU0FBUyxDQUFFYyxLQUFLLENBQUNXLEtBQUssRUFBRVYsZUFBZSxFQUFFUSxrQkFBbUIsQ0FBQzs7SUFFbkY7SUFDQSxJQUFJa0IsYUFBYSxHQUFHLElBQUkxQyxhQUFhLENBQUVlLEtBQUssQ0FBQzRCLHVCQUF1QixDQUFDQyxLQUFLLEVBQUVwQixrQkFBa0IsRUFBRVQsS0FBSyxDQUFDOEIsZ0JBQWlCLENBQUM7O0lBRXhIO0lBQ0E7SUFDQSxNQUFNQyxvQkFBb0IsR0FBR0wsU0FBUyxDQUFDdEIsS0FBSyxHQUFHLENBQUM7SUFDaEQsTUFBTTRCLGlCQUFpQixHQUFHLElBQUkxRCxJQUFJLENBQUMsQ0FBQztJQUNwQyxNQUFNMkQsZUFBZSxHQUFHLElBQUlsRCxlQUFlLENBQUVpQixLQUFLLENBQUM0Qix1QkFBdUIsRUFBRTVCLEtBQUssQ0FBQ2tDLFFBQVEsRUFBRUYsaUJBQWlCLEVBQUVELG9CQUFxQixDQUFDOztJQUVySTtJQUNBLE1BQU1JLHNCQUFzQixHQUFHLElBQUk5QyxzQkFBc0IsQ0FBRVcsS0FBSyxDQUFDNEIsdUJBQXVCLEVBQUUsSUFBSSxDQUFDMUIsWUFBYSxDQUFDO0lBQzdHLE1BQU1rQyw0QkFBNEIsR0FBRyxJQUFJNUQsY0FBYyxDQUFFZSxrQkFBa0IsRUFBRTtNQUMzRThDLFNBQVMsRUFBRSxNQUFNO01BQ2pCQyxJQUFJLEVBQUUzRCwrQkFBK0IsQ0FBQzRELGNBQWM7TUFDcERDLFFBQVEsRUFBRUEsQ0FBQSxLQUFNO1FBQ2QsSUFBSSxDQUFDQyxzQ0FBc0MsQ0FBRU4sc0JBQXVCLENBQUM7TUFDdkUsQ0FBQztNQUNETyxRQUFRLEVBQUVoQixTQUFTLENBQUN0QixLQUFLLEdBQUc7SUFDOUIsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTXVDLFNBQVMsR0FBRyxJQUFJckUsSUFBSSxDQUFDLENBQUM7SUFDNUI7SUFDQTtJQUNBLE1BQU1zRSxlQUFlLEdBQUcsSUFBSXRFLElBQUksQ0FBRTtNQUFFdUUsVUFBVSxFQUFFO0lBQUssQ0FBRSxDQUFDLENBQUMsQ0FBQztJQUMxRCxNQUFNQyxnQkFBZ0IsR0FBRyxJQUFJeEUsSUFBSSxDQUFFO01BQUV5RSxRQUFRLEVBQUU7SUFBTSxDQUFFLENBQUM7O0lBRXhEO0lBQ0EsTUFBTUMsV0FBVyxHQUFHLElBQUkvRSxXQUFXLENBQUUrQixLQUFLLENBQUNpRCxNQUFNLEVBQUV0RCxrQkFBbUIsQ0FBQztJQUN2RW1ELGdCQUFnQixDQUFDSSxRQUFRLENBQUVGLFdBQVksQ0FBQztJQUN4QyxNQUFNRyxVQUFVLEdBQUcsSUFBSWpGLFVBQVUsQ0FBRThCLEtBQUssQ0FBQ2lELE1BQU0sRUFBRXRELGtCQUFtQixDQUFDO0lBQ3JFZ0QsU0FBUyxDQUFDTyxRQUFRLENBQUVDLFVBQVcsQ0FBQzs7SUFFaEM7SUFDQXRELG1DQUFtQyxDQUFDdUQsT0FBTyxDQUFFQyxNQUFNLElBQUk7TUFDckRWLFNBQVMsQ0FBQ08sUUFBUSxDQUFFLElBQUlwRSxvQkFBb0IsQ0FDMUNrQixLQUFLLENBQUNzRCx1QkFBdUIsQ0FBQ0MsSUFBSSxDQUFFdkQsS0FBTSxDQUFDLEVBQzNDUyxrQkFBa0IsRUFBRTtRQUNsQitDLElBQUksRUFBRUwsVUFBVSxDQUFDaEQsT0FBTyxHQUFHa0QsTUFBTSxDQUFDaEQsQ0FBQztRQUNuQ29ELEdBQUcsRUFBRU4sVUFBVSxDQUFDN0MsT0FBTyxHQUFHK0MsTUFBTSxDQUFDN0M7TUFDbkMsQ0FBRSxDQUFFLENBQUM7SUFDVCxDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNa0QsWUFBWSxHQUFHLElBQUl2RixZQUFZLENBQUU7TUFDckN3RixLQUFLLEVBQUVYLFdBQVcsQ0FBQ1csS0FBSyxHQUFHLENBQUM7TUFDNUJGLEdBQUcsRUFBRVQsV0FBVyxDQUFDWSxNQUFNLEdBQUcsQ0FBQztNQUMzQkMsU0FBUyxFQUFFLEVBQUU7TUFDYnJCLFFBQVEsRUFBRUEsQ0FBQSxLQUFNO1FBQ2R4QyxLQUFLLENBQUM4RCwyQkFBMkIsQ0FBQyxDQUFDO01BQ3JDO0lBQ0YsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTUMsaUNBQWlDLEdBQUcsSUFBSTNFLGlDQUFpQyxDQUFFWSxLQUFLLENBQUNXLEtBQUssRUFBRUUsWUFBYSxDQUFDOztJQUU1RztJQUNBLE1BQU1tRCxZQUFZLEdBQUcsSUFBSTNGLFlBQVksQ0FBRTJCLEtBQUssQ0FBQzhCLGdCQUFnQixFQUFFO01BQzdEbUMsT0FBTyxFQUFFLEVBQUU7TUFDWEMsV0FBVyxFQUFFO1FBQ1hDLElBQUksRUFBRSxFQUFFO1FBQ1JDLE1BQU0sRUFBRXpGLCtCQUErQixDQUFDMEY7TUFDMUM7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNuQixRQUFRLENBQUV2QixhQUFjLENBQUM7O0lBRTlCO0lBQ0E7SUFDQTNCLEtBQUssQ0FBQzRCLHVCQUF1QixDQUFDMEMsSUFBSSxDQUFFQyxlQUFlLElBQUk7TUFFckQ7TUFDQSxJQUFLNUMsYUFBYSxFQUFHO1FBQ25CLElBQUksQ0FBQzZDLFdBQVcsQ0FBRTdDLGFBQWMsQ0FBQztRQUNqQ0EsYUFBYSxDQUFDOEMsT0FBTyxDQUFDLENBQUM7TUFDekI7O01BRUE7TUFDQSxNQUFNQyxhQUFhLEdBQUcsSUFBSTlHLE9BQU8sQ0FBRTJHLGVBQWUsQ0FBQ0ksTUFBTSxDQUFDQyxHQUFHLEVBQUVMLGVBQWUsQ0FBQ00sTUFBTSxDQUFDRCxHQUFHLEVBQUVMLGVBQWUsQ0FBQ0ksTUFBTSxDQUFDRyxHQUFHLEVBQUVQLGVBQWUsQ0FBQ00sTUFBTSxDQUFDQyxHQUFJLENBQUM7TUFDbko7TUFDQSxNQUFNQyxzQkFBc0IsR0FBRy9HLG1CQUFtQixDQUFDMEMsK0JBQStCLENBQUVnRSxhQUFhLEVBQUV6RSxlQUFnQixDQUFDO01BQ3BIMEIsYUFBYSxHQUFHLElBQUkxQyxhQUFhLENBQUVzRixlQUFlLEVBQUVRLHNCQUFzQixFQUFFL0UsS0FBSyxDQUFDOEIsZ0JBQWlCLENBQUM7TUFDcEcsSUFBSSxDQUFDb0IsUUFBUSxDQUFFdkIsYUFBYyxDQUFDO01BQzlCQSxhQUFhLENBQUNxRCxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7O01BRTVCO01BQ0F0RCxTQUFTLENBQUN1RCxNQUFNLENBQUMsQ0FBQzs7TUFFbEI7TUFDQWxCLGlDQUFpQyxDQUFDa0IsTUFBTSxDQUFDLENBQUM7O01BRTFDO01BQ0EzRCx1QkFBdUIsQ0FBQzRELHlCQUF5QixDQUFDLENBQUM7O01BRW5EO01BQ0EsSUFBS1gsZUFBZSxLQUFLM0YsT0FBTyxDQUFDdUcsTUFBTSxFQUFHO1FBQ3hDbkMsV0FBVyxDQUFDb0MsT0FBTyxHQUFHLElBQUk7UUFDMUIxQixZQUFZLENBQUMwQixPQUFPLEdBQUcsSUFBSTtRQUMzQnpDLFNBQVMsQ0FBQ3lDLE9BQU8sR0FBRyxJQUFJO1FBQ3hCaEQsNEJBQTRCLENBQUNnRCxPQUFPLEdBQUcsS0FBSztNQUM5QyxDQUFDLE1BQ0k7UUFDSHBDLFdBQVcsQ0FBQ29DLE9BQU8sR0FBRyxLQUFLO1FBQzNCMUIsWUFBWSxDQUFDMEIsT0FBTyxHQUFHLEtBQUs7UUFDNUJ6QyxTQUFTLENBQUN5QyxPQUFPLEdBQUcsS0FBSztRQUN6QmhELDRCQUE0QixDQUFDZ0QsT0FBTyxHQUFHLElBQUk7TUFDN0M7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQXBGLEtBQUssQ0FBQ3VCLFVBQVUsQ0FBQzhELG9CQUFvQixDQUFFQyxjQUFjLElBQUk7TUFFdkQsSUFBS3RGLEtBQUssQ0FBQzRCLHVCQUF1QixDQUFDQyxLQUFLLEtBQUtqRCxPQUFPLENBQUN1RyxNQUFNLEVBQUc7UUFDNUQ7UUFDQTtRQUNBLE1BQU1JLG9CQUFvQixHQUFHLElBQUl2RyxvQkFBb0IsQ0FBRXNHLGNBQWMsRUFBRTdFLGtCQUFtQixDQUFDO1FBQzNGbUMsZUFBZSxDQUFDTSxRQUFRLENBQUVxQyxvQkFBcUIsQ0FBQzs7UUFFaEQ7UUFDQSxNQUFNQyx3QkFBd0IsR0FBR0MsUUFBUSxJQUFJO1VBQzNDO1VBQ0EsSUFBS3pGLEtBQUssQ0FBQ1csS0FBSyxDQUFDK0UsbUNBQW1DLENBQUVELFFBQVMsQ0FBQyxJQUFJLENBQUNILGNBQWMsQ0FBQ0ssaUJBQWlCLENBQUM5RCxLQUFLLEVBQUc7WUFFNUc7WUFDQSxJQUFLLENBQUM3QixLQUFLLENBQUNXLEtBQUssQ0FBQ2lGLGlCQUFpQixDQUFFTixjQUFlLENBQUMsRUFBRztjQUN0RHRGLEtBQUssQ0FBQ1csS0FBSyxDQUFDa0Ysb0JBQW9CLENBQUVQLGNBQWUsQ0FBQztZQUNwRDtVQUNGLENBQUMsTUFDSTtZQUNILElBQUt0RixLQUFLLENBQUNXLEtBQUssQ0FBQ2lGLGlCQUFpQixDQUFFTixjQUFlLENBQUMsRUFBRztjQUNyRDtjQUNBdEYsS0FBSyxDQUFDVyxLQUFLLENBQUNtRix1QkFBdUIsQ0FBRVIsY0FBZSxDQUFDO1lBQ3ZEO1VBQ0Y7O1VBRUE7VUFDQWhFLHVCQUF1QixDQUFDNEQseUJBQXlCLENBQUMsQ0FBQztVQUNuRDVELHVCQUF1QixDQUFDeUUsMEJBQTBCLENBQUNDLFdBQVcsQ0FBQyxDQUFDO1VBQ2hFdkUsa0JBQWtCLENBQUN3RSxxQkFBcUIsQ0FBQ0QsV0FBVyxDQUFDLENBQUM7VUFDdER0RSxTQUFTLENBQUN1RCxNQUFNLENBQUMsQ0FBQztVQUNsQmxCLGlDQUFpQyxDQUFDa0IsTUFBTSxDQUFDLENBQUM7UUFDNUMsQ0FBQzs7UUFFRDtRQUNBO1FBQ0E7UUFDQTtRQUNBSyxjQUFjLENBQUNZLGdCQUFnQixDQUFDQyxRQUFRLENBQUVYLHdCQUF5QixDQUFDOztRQUVwRTtRQUNBLE1BQU1ZLDhCQUE4QixHQUFHQyxjQUFjLElBQUk7VUFDdkQsSUFBS0EsY0FBYyxFQUFHO1lBQ3BCZCxvQkFBb0IsQ0FBQ2UsV0FBVyxDQUFDLENBQUM7VUFDcEM7UUFDRixDQUFDOztRQUVEO1FBQ0FoQixjQUFjLENBQUNpQixzQkFBc0IsQ0FBQ2pDLElBQUksQ0FBRThCLDhCQUErQixDQUFDOztRQUU1RTtRQUNBcEcsS0FBSyxDQUFDdUIsVUFBVSxDQUFDaUYsc0JBQXNCLENBQUUsU0FBU0MsZUFBZUEsQ0FBRUMsZ0JBQWdCLEVBQUc7VUFDcEYsSUFBS0EsZ0JBQWdCLEtBQUtwQixjQUFjLEVBQUc7WUFFekM7WUFDQW9CLGdCQUFnQixDQUFDUixnQkFBZ0IsQ0FBQ1MsTUFBTSxDQUFFbkIsd0JBQXlCLENBQUM7WUFDcEVrQixnQkFBZ0IsQ0FBQ0gsc0JBQXNCLENBQUNJLE1BQU0sQ0FBRVAsOEJBQStCLENBQUM7O1lBRWhGO1lBQ0F4RCxlQUFlLENBQUM0QixXQUFXLENBQUVlLG9CQUFxQixDQUFDO1lBQ25EQSxvQkFBb0IsQ0FBQ2QsT0FBTyxDQUFDLENBQUM7WUFDOUJ6RSxLQUFLLENBQUN1QixVQUFVLENBQUNxRix5QkFBeUIsQ0FBRUgsZUFBZ0IsQ0FBQztVQUMvRDtRQUNGLENBQUUsQ0FBQztNQUNMO01BQ0E7TUFBQSxLQUNLO1FBQ0g7UUFDQTtRQUNBLE1BQU1JLG1CQUFtQixHQUFHLElBQUl2SCxtQkFBbUIsQ0FBRWdHLGNBQWMsRUFBRTdFLGtCQUFtQixDQUFDO1FBQ3pGbUMsZUFBZSxDQUFDTSxRQUFRLENBQUUyRCxtQkFBb0IsQ0FBQzs7UUFFL0M7UUFDQTdHLEtBQUssQ0FBQ3VCLFVBQVUsQ0FBQ2lGLHNCQUFzQixDQUFFLFNBQVNDLGVBQWVBLENBQUVDLGdCQUFnQixFQUFHO1VBQ3BGLElBQUtBLGdCQUFnQixLQUFLcEIsY0FBYyxFQUFHO1lBQ3pDO1lBQ0ExQyxlQUFlLENBQUM0QixXQUFXLENBQUVxQyxtQkFBb0IsQ0FBQztZQUNsREEsbUJBQW1CLENBQUNwQyxPQUFPLENBQUMsQ0FBQztZQUM3QnpFLEtBQUssQ0FBQ3VCLFVBQVUsQ0FBQ3FGLHlCQUF5QixDQUFFSCxlQUFnQixDQUFDO1VBQy9EO1FBQ0YsQ0FBRSxDQUFDO01BQ0w7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNSyxjQUFjLEdBQUcsSUFBSTFJLGNBQWMsQ0FBRTtNQUN6Q29FLFFBQVEsRUFBRUEsQ0FBQSxLQUFNO1FBQ2R4QyxLQUFLLENBQUMrRyxLQUFLLENBQUMsQ0FBQztRQUNickYsU0FBUyxDQUFDcUYsS0FBSyxDQUFDLENBQUM7UUFDakJoRCxpQ0FBaUMsQ0FBQ2dELEtBQUssQ0FBQyxDQUFDO1FBQ3pDekYsdUJBQXVCLENBQUN5RixLQUFLLENBQUMsQ0FBQztRQUMvQnRGLGtCQUFrQixDQUFDc0YsS0FBSyxDQUFDLENBQUM7TUFDNUIsQ0FBQztNQUNEcEQsS0FBSyxFQUFFLElBQUksQ0FBQ3pELFlBQVksQ0FBQzhHLElBQUksR0FBRyxFQUFFO01BQ2xDcEQsTUFBTSxFQUFFLElBQUksQ0FBQzFELFlBQVksQ0FBQytHLElBQUksR0FBRztJQUNuQyxDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUMvRCxRQUFRLENBQUVhLGlDQUFrQyxDQUFDO0lBQ2xELElBQUksQ0FBQ2IsUUFBUSxDQUFFYyxZQUFhLENBQUM7SUFDN0IsSUFBSSxDQUFDZCxRQUFRLENBQUVRLFlBQWEsQ0FBQztJQUM3QixJQUFJLENBQUNSLFFBQVEsQ0FBRTRELGNBQWUsQ0FBQztJQUMvQixJQUFJLENBQUM1RCxRQUFRLENBQUU1Qix1QkFBd0IsQ0FBQztJQUN4QyxJQUFJLENBQUM0QixRQUFRLENBQUV6QixrQkFBbUIsQ0FBQztJQUNuQyxJQUFJLENBQUN5QixRQUFRLENBQUVqQixlQUFnQixDQUFDO0lBQ2hDLElBQUksQ0FBQ2lCLFFBQVEsQ0FBRWQsNEJBQTZCLENBQUM7SUFDN0MsSUFBSSxDQUFDYyxRQUFRLENBQUVQLFNBQVUsQ0FBQztJQUMxQixJQUFJLENBQUNPLFFBQVEsQ0FBRXhCLFNBQVUsQ0FBQzs7SUFFMUI7SUFDQSxJQUFJLENBQUN3QixRQUFRLENBQUVKLGdCQUFpQixDQUFDLENBQUMsQ0FBQztJQUNuQyxJQUFJLENBQUNJLFFBQVEsQ0FBRU4sZUFBZ0IsQ0FBQyxDQUFDLENBQUM7SUFDbEMsSUFBSSxDQUFDTSxRQUFRLENBQUVsQixpQkFBa0IsQ0FBQyxDQUFDLENBQUM7O0lBRXBDO0lBQ0E7TUFDRVAsa0JBQWtCLENBQUNrQyxLQUFLLEdBQUcsSUFBSSxDQUFDekQsWUFBWSxDQUFDOEcsSUFBSSxHQUFHLEVBQUU7TUFDdER2RixrQkFBa0IsQ0FBQ2dDLEdBQUcsR0FBRyxFQUFFO01BQzNCbkMsdUJBQXVCLENBQUNrQyxJQUFJLEdBQUcsRUFBRTtNQUNqQ2xDLHVCQUF1QixDQUFDbUMsR0FBRyxHQUFHaEMsa0JBQWtCLENBQUNnQyxHQUFHO01BQ3BEeEIsZUFBZSxDQUFDOUIsT0FBTyxHQUFHRixlQUFlLENBQUNFLE9BQU87TUFDakQ4QixlQUFlLENBQUN3QixHQUFHLEdBQUdoQyxrQkFBa0IsQ0FBQ2dDLEdBQUc7TUFDNUNPLFlBQVksQ0FBQ1IsSUFBSSxHQUFHL0Isa0JBQWtCLENBQUMrQixJQUFJLEdBQUcsRUFBRTtNQUNoRFEsWUFBWSxDQUFDUCxHQUFHLEdBQUdoQyxrQkFBa0IsQ0FBQ21DLE1BQU0sR0FBRyxFQUFFO01BQ2pERyxpQ0FBaUMsQ0FBQzVELE9BQU8sR0FBR21CLHVCQUF1QixDQUFDbkIsT0FBTztNQUMzRTRELGlDQUFpQyxDQUFDTixHQUFHLEdBQUduQyx1QkFBdUIsQ0FBQ3NDLE1BQU0sR0FBRyxFQUFFO01BQzNFeEIsNEJBQTRCLENBQUM5QixPQUFPLEdBQUcyQixlQUFlLENBQUMzQixPQUFPO01BQzlEOEIsNEJBQTRCLENBQUNvQixJQUFJLEdBQUd2QixlQUFlLENBQUMwQixLQUFLLEdBQUcsRUFBRTtJQUNoRTtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFbEIsc0NBQXNDQSxDQUFFTixzQkFBc0IsRUFBRztJQUUvRDtJQUNBO0lBQ0EsTUFBTStFLEtBQUssR0FBRyxJQUFJM0ksS0FBSyxDQUFFO01BQUUwQyxJQUFJLEVBQUUsT0FBTztNQUFFa0csT0FBTyxFQUFFO0lBQUksQ0FBRSxDQUFDO0lBQzFELElBQUksQ0FBQ2pFLFFBQVEsQ0FBRWdFLEtBQU0sQ0FBQztJQUN0QixJQUFJLENBQUNoRSxRQUFRLENBQUVmLHNCQUF1QixDQUFDO0lBRXZDLE1BQU1pRiwwQkFBMEIsR0FBRztNQUNqQ0MsRUFBRSxFQUFFQSxDQUFBLEtBQU07UUFDUmxGLHNCQUFzQixDQUFDbUYsbUJBQW1CLENBQUVGLDBCQUEyQixDQUFDO1FBQ3hFakYsc0JBQXNCLENBQUNvRixNQUFNLENBQUMsQ0FBQztRQUMvQkwsS0FBSyxDQUFDSyxNQUFNLENBQUMsQ0FBQztNQUNoQjtJQUNGLENBQUM7SUFFRHBGLHNCQUFzQixDQUFDcUYsZ0JBQWdCLENBQUVKLDBCQUEyQixDQUFDO0lBQ3JFRixLQUFLLENBQUNNLGdCQUFnQixDQUFFSiwwQkFBMkIsQ0FBQztFQUN0RDtBQUNGO0FBRUEzSSxzQkFBc0IsQ0FBQ2dKLFFBQVEsQ0FBRSxrQ0FBa0MsRUFBRTNILGdDQUFpQyxDQUFDO0FBQ3ZHLGVBQWVBLGdDQUFnQyJ9