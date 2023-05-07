// Copyright 2018-2023, University of Colorado Boulder

/**
 * Displays the axis of symmetry for a quadratic.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Graph from '../../../../graphing-lines/js/common/model/Graph.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Line, Node } from '../../../../scenery/js/imports.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQColors from '../GQColors.js';
import GQConstants from '../GQConstants.js';
import Quadratic from '../model/Quadratic.js';
import GQEquationNode from '../../common/view/GQEquationNode.js';
import GQEquationFactory from './GQEquationFactory.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';

export default class AxisOfSymmetryNode extends Node {

  public constructor( quadraticProperty: TReadOnlyProperty<Quadratic>,
                      graph: Graph,
                      modelViewTransform: ModelViewTransform2,
                      axisOfSymmetryVisibleProperty: TReadOnlyProperty<boolean>,
                      equationsVisibleProperty: TReadOnlyProperty<boolean> ) {

    // vertical line
    const lineNode = new Line( 0, 0, 0, 1, {
      stroke: GQColors.AXIS_OF_SYMMETRY,
      lineWidth: GQConstants.AXIS_OF_SYMMETRY_LINE_WIDTH,
      lineDash: GQConstants.AXIS_OF_SYMMETRY_LINE_DASH
    } );

    // equation on a translucent background
    const equationNode = new GQEquationNode( {
      textOptions: {
        fill: GQColors.AXIS_OF_SYMMETRY,
        rotation: Math.PI / 2
      },
      visibleProperty: equationsVisibleProperty,
      maxHeight: 100 // maxHeight because equation is rotated, determined empirically
    } );

    // endpoints of the line in model coordinates, note that y is inverted
    const minY = modelViewTransform.modelToViewY( graph.yRange.max );
    const maxY = modelViewTransform.modelToViewY( graph.yRange.min );

    super( {
      children: [ lineNode, equationNode ],
      visibleProperty: new DerivedProperty(
        [ axisOfSymmetryVisibleProperty, quadraticProperty ],
        ( axisOfSymmetryVisible, quadratic ) =>
          axisOfSymmetryVisible && // the Axis of Symmetry checkbox is checked
          quadratic.isaParabola() && ( quadratic.axisOfSymmetry !== undefined ) && // the quadratic is a parabola, so has an axis of symmetry
          graph.xRange.contains( quadratic.axisOfSymmetry ) // the axis of symmetry (x=N) is on the graph
      )
    } );

    // update if the interactive quadratic is a parabola, and therefore has an axis of symmetry
    quadraticProperty.link( quadratic => {

      if ( quadratic.isaParabola() ) {
        const axisOfSymmetry = quadratic.axisOfSymmetry!;
        assert && assert( axisOfSymmetry !== undefined );
        const vertex = quadratic.vertex!;
        assert && assert( vertex !== undefined );

        // update the vertical line
        const x = modelViewTransform.modelToViewX( axisOfSymmetry );
        lineNode.setLine( x, minY, x, maxY );

        // update the equation's text
        equationNode.setTextString( GQEquationFactory.createAxisOfSymmetry( axisOfSymmetry ) );

        // position the equation to avoid overlapping vertex and y axis
        if ( axisOfSymmetry > graph.yRange.max - GQConstants.EQUATION_Y_MARGIN ) {

          // axis is at far right of graph, so put equation on left of axis
          equationNode.right = lineNode.left - GQConstants.EQUATION_CURVE_SPACING;
        }
        else if ( axisOfSymmetry < graph.yRange.min + GQConstants.EQUATION_Y_MARGIN ) {

          // axis is at far left of graph, so put equation on right of axis
          equationNode.left = lineNode.right + GQConstants.EQUATION_CURVE_SPACING;
        }
        else if ( axisOfSymmetry >= 0 ) {

          // axis is at or to right of origin, so put equation on left of axis
          equationNode.left = lineNode.right + GQConstants.EQUATION_CURVE_SPACING;
        }
        else {

          // axis is to left of origin, os put equation on right of axis
          equationNode.right = lineNode.left - GQConstants.EQUATION_CURVE_SPACING;
        }

        // space between the equation and axis
        if ( vertex.y >= 0 ) {
          equationNode.bottom = modelViewTransform.modelToViewY( graph.yRange.min + 1 );
        }
        else {
          equationNode.top = modelViewTransform.modelToViewY( graph.yRange.max - 1 );
        }
      }
    } );
  }
}

graphingQuadratics.register( 'AxisOfSymmetryNode', AxisOfSymmetryNode );