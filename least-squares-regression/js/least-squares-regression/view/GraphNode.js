// Copyright 2014-2022, University of Colorado Boulder

/**
 * View representation of a Graph. Responsible for the view of 'MyLine', 'BestFitLine'
 * and the residuals on the graph. The view of the dataPoints is handled in the main ScreenView
 *
 * @author Martin Veillette (Berea College)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Line, Node } from '../../../../scenery/js/imports.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
import ResidualLineAndSquareNode from './ResidualLineAndSquareNode.js';

class GraphNode extends Node {
  /**
   * @param {Graph} graph
   * @param {Bounds2} viewBounds
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( graph, viewBounds, modelViewTransform ) {

    super();

    const self = this;

    this.graph = graph;
    this.viewBounds = viewBounds;
    this.modelViewTransform = modelViewTransform;

    // Create 'MyLine'
    // First, get the two points formed by the intersection of the line and the boundary of the graph
    const myLineBoundaryPoints = graph.getBoundaryPoints( graph.slope( graph.angleProperty.value ), graph.interceptProperty.value );
    this.myLine = new Line(
      modelViewTransform.modelToViewPosition( myLineBoundaryPoints.point1 ),
      modelViewTransform.modelToViewPosition( myLineBoundaryPoints.point2 ),
      {
        stroke: LeastSquaresRegressionConstants.MY_LINE_COLOR.BASE_COLOR,
        lineWidth: LeastSquaresRegressionConstants.LINE_WIDTH
      } );

    // Create 'Best Fit Line'; initially set bestFitLine to zero length and then update it
    this.bestFitLine = new Line( 0, 0, 0, 0, {
      stroke: LeastSquaresRegressionConstants.BEST_FIT_LINE_COLOR.BASE_COLOR,
      lineWidth: LeastSquaresRegressionConstants.LINE_WIDTH
    } );

    if ( graph.isLinearFitDefined() ) {
      const linearFitParameters = graph.getLinearFit();
      const bestFitLineBoundaryPoints = graph.getBoundaryPoints( linearFitParameters.slope, linearFitParameters.intercept );
      this.bestFitLine = new Line(
        modelViewTransform.modelToViewPosition( bestFitLineBoundaryPoints.point1 ),
        modelViewTransform.modelToViewPosition( bestFitLineBoundaryPoints.point2 ),
        {
          stroke: LeastSquaresRegressionConstants.BEST_FIT_LINE_COLOR.BASE_COLOR,
          lineWidth: LeastSquaresRegressionConstants.LINE_WIDTH
        } );
    }

    /**
     * Update 'My Line'
     * @param {number} slope
     * @param {number} intercept
     */
    const updateMyLine = ( slope, intercept ) => {
      const boundaryPoints = graph.getBoundaryPoints( slope, intercept );
      this.myLine.setPoint1( modelViewTransform.modelToViewPosition( boundaryPoints.point1 ) );
      this.myLine.setPoint2( modelViewTransform.modelToViewPosition( boundaryPoints.point2 ) );
      this.myLine.clipArea = Shape.bounds( this.viewBounds );
    };

    // Update 'MyLine' and update 'MyLine' Residuals upon of change of angle (a proxy for the slope), or intercept
    // No need to unlink, listener is present for the lifetime of the sim
    Multilink.multilink( [ graph.angleProperty, graph.interceptProperty ], ( angle, intercept ) => {
      const slope = graph.slope( angle );
      updateMyLine( slope, intercept );
      graph.updateMyLineResiduals();
    } );

    // we will add all the residuals in a separate node
    const residualsLayer = new Node();

    // we need to track the best fit residuals in a separate array so that we can toggle their visibility when
    // the best fit is undefined
    this.bestFitResiduals = [];

    // Handle the comings and goings of 'My Line' Residuals. Recall that graph.myLineResiduals is an
    // observable array of Property.<Residual>
    graph.myLineResiduals.addItemAddedListener( addedResidualProperty => {

      // Create and add the view representation for this residual.
      const residualNode = ResidualLineAndSquareNode.createFromPool(
        addedResidualProperty,
        LeastSquaresRegressionConstants.MY_LINE_COLOR,
        this.viewBounds,
        modelViewTransform,
        graph.myLineResidualsVisibleProperty,
        graph.myLineSquaredResidualsVisibleProperty );
      residualsLayer.addChild( residualNode );

      // Add the removal listener for if and when this residual is removed from the model.
      graph.myLineResiduals.addItemRemovedListener( function removalListener( removedResidualProperty ) {
        if ( removedResidualProperty === addedResidualProperty ) {
          residualNode.release();
          residualsLayer.removeChild( residualNode );
          graph.myLineResiduals.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    // Handle the comings and goings of Best Fit Line Residuals. Recall that graph.bestFitResiduals is an
    // observable array of Property.<Residual>
    graph.bestFitLineResiduals.addItemAddedListener( addedResidualProperty => {

      // Create and add the view representation for this residual.
      const residualNode = ResidualLineAndSquareNode.createFromPool(
        addedResidualProperty,
        LeastSquaresRegressionConstants.BEST_FIT_LINE_COLOR,
        this.viewBounds,
        modelViewTransform,
        graph.bestFitLineResidualsVisibleProperty,
        graph.bestFitLineSquaredResidualsVisibleProperty );
      residualsLayer.addChild( residualNode );

      this.bestFitResiduals.push( residualNode );

      // Add the removal listener for if and when this residual is removed from the model.
      graph.bestFitLineResiduals.addItemRemovedListener( removedResidualProperty => {
        if ( removedResidualProperty === addedResidualProperty ) {

          // remove the residualNode from this.bestFitResiduals
          const index = self.bestFitResiduals.indexOf( residualNode );
          if ( index > -1 ) {
            self.bestFitResiduals.splice( index, 1 );
          }

          residualNode.release();
          residualsLayer.removeChild( residualNode );
        }
      } );
    } );

    // Hide or show the visibility of 'MyLine' and 'BestFitLine', both listeners are present for the lifetime of the sim
    graph.myLineVisibleProperty.linkAttribute( this.myLine, 'visible' );
    graph.bestFitLineVisibleProperty.linkAttribute( this.bestFitLine, 'visible' );

    // Add the residualsLayer
    this.addChild( residualsLayer );

    // Add the two lines to this Node
    this.addChild( this.myLine );
    this.addChild( this.bestFitLine );
  }

  /**
   * Resets values to their original state
   * @public
   */
  reset() {
    this.updateBestFitLine();
  }

  /**
   * @public
   */
  update() {
    this.updateBestFitLine();

    // make sure that the best fit residuals are only visible when the best fit line is defined
    this.updateBestFitResidualsVisible();
  }

  /**
   * Update Best Fit Line
   * @private
   */
  updateBestFitLine() {
    if ( this.graph.isLinearFitDefined() ) {
      const linearFitParameters = this.graph.getLinearFit();
      const boundaryPoints = this.graph.getBoundaryPoints( linearFitParameters.slope, linearFitParameters.intercept );
      this.bestFitLine.setPoint1( this.modelViewTransform.modelToViewPosition( boundaryPoints.point1 ) );
      this.bestFitLine.setPoint2( this.modelViewTransform.modelToViewPosition( boundaryPoints.point2 ) );
      this.bestFitLine.clipArea = Shape.bounds( this.viewBounds );
    }
    else {
      this.bestFitLine.setPoint1( 0, 0 ); // set line in the upper left corner
      this.bestFitLine.setPoint2( 0, 0 ); // of length zero
    }
  }

  /**
   * Make sure that the best fit residuals and squares are only visible if the linear fit is defined.
   * This visibility is separate from the visibility handled by the control panel
   * @public
   */
  updateBestFitResidualsVisible() {
    for ( let i = 0; i < this.bestFitResiduals.length; i++ ) {
      this.bestFitResiduals[ i ].visible = this.graph.isLinearFitDefined();
    }
  }
}

leastSquaresRegression.register( 'GraphNode', GraphNode );

export default GraphNode;
