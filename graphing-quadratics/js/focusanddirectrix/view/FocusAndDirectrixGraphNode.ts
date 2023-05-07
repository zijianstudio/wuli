// Copyright 2018-2023, University of Colorado Boulder

/**
 * FocusAndDirectrixGraphNode is the graph for the 'Focus & Directrix' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import GQGraphNode, { GQGraphNodeOptions } from '../../common/view/GQGraphNode.js';
import VertexManipulator from '../../common/view/VertexManipulator.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import FocusAndDirectrixModel from '../model/FocusAndDirectrixModel.js';
import DirectrixNode from './DirectrixNode.js';
import FocusAndDirectrixViewProperties from './FocusAndDirectrixViewProperties.js';
import FocusManipulator from './FocusManipulator.js';
import PointOnParabolaLinesNode from './PointOnParabolaLinesNode.js';
import PointOnParabolaManipulator from './PointOnParabolaManipulator.js';

export default class FocusAndDirectrixGraphNode extends GQGraphNode {

  public constructor( model: FocusAndDirectrixModel, viewProperties: FocusAndDirectrixViewProperties, tandem: Tandem ) {

    const coordinatesVisibleProperty = viewProperties.coordinatesVisibleProperty!;
    assert && assert( coordinatesVisibleProperty );
    const vertexVisibleProperty = viewProperties.vertexVisibleProperty!;
    assert && assert( vertexVisibleProperty );

    // We do NOT want to instrument the graph, so tandem is not propagated via options
    const options: GQGraphNodeOptions = {};

    // Directrix line
    const directrixNode = new DirectrixNode(
      model.quadraticProperty,
      model.graph,
      model.modelViewTransform,
      viewProperties.directrixVisibleProperty,
      viewProperties.equationsVisibleProperty );

    // Vertex manipulator
    const vertexManipulator = new VertexManipulator(
      model.hProperty,
      model.kProperty,
      model.quadraticProperty,
      model.graph,
      model.modelViewTransform,
      vertexVisibleProperty,
      coordinatesVisibleProperty, {
        tandem: tandem.createTandem( 'vertexManipulator' ),
        phetioDocumentation: 'the manipulator for changing the vertex'
      } );

    // Focus manipulator
    const focusManipulator = new FocusManipulator(
      model.pProperty,
      model.quadraticProperty,
      model.graph,
      model.modelViewTransform,
      viewProperties.focusVisibleProperty,
      coordinatesVisibleProperty, {
        tandem: tandem.createTandem( 'focusManipulator' ),
        phetioDocumentation: 'the manipulator for changing the focus'
      } );

    // Point on Quadratic manipulator
    const pointOnParabolaManipulator = new PointOnParabolaManipulator(
      model.pointOnParabolaProperty,
      model.quadraticProperty,
      model.graph,
      model.modelViewTransform,
      coordinatesVisibleProperty, {
        visibleProperty: viewProperties.pointOnParabolaVisibleProperty,
        tandem: tandem.createTandem( 'pointOnParabolaManipulator' ),
        phetioDocumentation: 'the manipulator for changing the point on the parabola'
      } );

    // Lines that connect the point on the parabola to the focus and directrix
    const pointOnParabolaLinesNode = new PointOnParabolaLinesNode(
      model.quadraticProperty,
      model.pointOnParabolaProperty,
      model.modelViewTransform,
      viewProperties.pointOnParabolaVisibleProperty,
      viewProperties.focusVisibleProperty,
      viewProperties.directrixVisibleProperty );

    options.otherCurves = [ directrixNode, pointOnParabolaLinesNode ]; // rendered in this order
    options.decorations = [ vertexManipulator, focusManipulator, pointOnParabolaManipulator ]; // rendered in this order

    super( model, viewProperties, options );
  }
}

graphingQuadratics.register( 'FocusAndDirectrixGraphNode', FocusAndDirectrixGraphNode );