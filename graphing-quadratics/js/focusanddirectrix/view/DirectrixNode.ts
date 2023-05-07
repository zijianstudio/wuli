// Copyright 2018-2023, University of Colorado Boulder

/**
 * Displays the directrix for a quadratic.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { Line, Node } from '../../../../scenery/js/imports.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import GQEquationFactory from '../../common/view/GQEquationFactory.js';
import GQEquationNode from '../../common/view/GQEquationNode.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import Quadratic from '../../common/model/Quadratic.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Graph from '../../../../graphing-lines/js/common/model/Graph.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';

export default class DirectrixNode extends Node {

  public constructor( quadraticProperty: TReadOnlyProperty<Quadratic>,
                      graph: Graph, modelViewTransform: ModelViewTransform2,
                      directrixVisibleProperty: TReadOnlyProperty<boolean>,
                      equationsVisibleProperty: TReadOnlyProperty<boolean> ) {

    // horizontal line
    const lineNode = new Line( 0, 0, 0, 1, {
      stroke: GQColors.DIRECTRIX,
      lineWidth: GQConstants.DIRECTRIX_LINE_WIDTH,
      lineDash: GQConstants.DIRECTRIX_LINE_DASH
    } );

    // equation on a translucent background
    const equationNode = new GQEquationNode( {
      textOptions: {
        fill: GQColors.DIRECTRIX
      },
      visibleProperty: equationsVisibleProperty,
      maxWidth: 100 // determined empirically
    } );

    super( {
      children: [ lineNode, equationNode ],
      visibleProperty: new DerivedProperty(
        [ directrixVisibleProperty, quadraticProperty ],
        ( directrixVisible, quadratic ) =>
          directrixVisible &&  // the Directrix checkbox is checked
          ( quadratic.directrix !== undefined ) && // the quadratic has a directrix
          graph.yRange.contains( quadratic.directrix ) // the directrix (y=N) is on the graph
      )
    } );

    // endpoints of the line in model coordinates
    const minX = modelViewTransform.modelToViewX( graph.xRange.min );
    const maxX = modelViewTransform.modelToViewX( graph.xRange.max );

    // update when the interactive quadratic changes
    quadraticProperty.link( quadratic => {

      assert && assert( quadratic.isaParabola(), `expected a parabola, quadratic=${quadratic}` );
      const directrix = quadratic.directrix || 0;
      const vertex = quadratic.vertex!;
      assert && assert( vertex );

      // update the horizontal line
      const y = modelViewTransform.modelToViewY( directrix );
      lineNode.setLine( minX, y, maxX, y );

      // update the equation's text
      equationNode.setTextString( GQEquationFactory.createDirectrix( directrix ) );

      // position the equation to avoid overlapping vertex and x-axis
      if ( vertex.x >= 0 ) {

        // vertex is at or to the right of origin, so put equation on left end of line
        equationNode.left = modelViewTransform.modelToViewX( graph.xRange.min + GQConstants.EQUATION_X_MARGIN );
      }
      else {
        // vertex is to the left of origin, so put equation on right end of line
        equationNode.right = modelViewTransform.modelToViewX( graph.xRange.max - GQConstants.EQUATION_X_MARGIN );
      }

      // space between the equation and directrix
      if ( directrix > graph.xRange.max - 1 ) {
        equationNode.top = lineNode.bottom + GQConstants.EQUATION_CURVE_SPACING;
      }
      else {
        equationNode.bottom = lineNode.top - GQConstants.EQUATION_CURVE_SPACING;
      }
    } );
  }
}

graphingQuadratics.register( 'DirectrixNode', DirectrixNode );