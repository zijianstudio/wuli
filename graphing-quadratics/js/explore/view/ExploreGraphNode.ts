// Copyright 2018-2023, University of Colorado Boulder

/**
 * Graph for the 'Explore' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import GQConstants from '../../common/GQConstants.js';
import GQGraphNode from '../../common/view/GQGraphNode.js';
import QuadraticNode from '../../common/view/QuadraticNode.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import ExploreModel from '../model/ExploreModel.js';
import ExploreViewProperties from './ExploreViewProperties.js';

export default class ExploreGraphNode extends GQGraphNode {

  public constructor( model: ExploreModel, viewProperties: ExploreViewProperties ) {

    // There is no vertex displayed on this screen.
    const preventVertexAndEquationOverlap = false;

    // quadratic term, y = ax^2
    const quadraticTermNode = new QuadraticNode(
      model.quadraticTermProperty,
      model.graph.xRange,
      model.graph.yRange,
      model.modelViewTransform,
      viewProperties.equationForm,
      viewProperties.equationsVisibleProperty, {
        visibleProperty: viewProperties.quadraticTermVisibleProperty,
        lineWidth: GQConstants.QUADRATIC_TERMS_LINE_WIDTH,
        preventVertexAndEquationOverlap: preventVertexAndEquationOverlap
      } );

    // linear term, y = bx
    const linearTermNode = new QuadraticNode(
      model.linearTermProperty,
      model.graph.xRange,
      model.graph.yRange,
      model.modelViewTransform,
      viewProperties.equationForm,
      viewProperties.equationsVisibleProperty, {
        visibleProperty: viewProperties.linearTermVisibleProperty,
        lineWidth: GQConstants.QUADRATIC_TERMS_LINE_WIDTH,
        preventVertexAndEquationOverlap: preventVertexAndEquationOverlap
      } );

    // constant term, y = bx
    const constantTermNode = new QuadraticNode(
      model.constantTermProperty,
      model.graph.xRange,
      model.graph.yRange,
      model.modelViewTransform,
      viewProperties.equationForm,
      viewProperties.equationsVisibleProperty, {
        visibleProperty: viewProperties.constantTermVisibleProperty,
        lineWidth: GQConstants.QUADRATIC_TERMS_LINE_WIDTH,
        preventVertexAndEquationOverlap: preventVertexAndEquationOverlap
      } );

    super( model, viewProperties, {
      otherCurves: [ constantTermNode, linearTermNode, quadraticTermNode ] // rendered in this order
    } );

    // Make quadratic terms available to the point tool, if they are visible. The order of
    // model.quadraticTermsProperty determines the order that the terms will be considered by
    // point tools, so maintain the order.
    Multilink.multilink( [
      viewProperties.quadraticTermVisibleProperty, model.quadraticTermProperty,
      viewProperties.linearTermVisibleProperty, model.linearTermProperty,
      viewProperties.constantTermVisibleProperty, model.constantTermProperty
    ], (
      quadraticTermVisible, quadraticTerm,
      linearTermVisible, linearTerm,
      constantTermVisible, constantTerm
    ) => {
      // order is important! compact to remove falsy values
      model.quadraticTermsProperty.value = _.compact( [
        quadraticTermVisible && quadraticTerm,
        linearTermVisible && linearTerm,
        constantTermVisible && constantTerm
      ] );
    } );
  }
}

graphingQuadratics.register( 'ExploreGraphNode', ExploreGraphNode );