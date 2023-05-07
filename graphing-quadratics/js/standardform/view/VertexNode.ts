// Copyright 2018-2023, University of Colorado Boulder

/**
 * Displays the vertex as a non-interactive point with coordinates label.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Graph from '../../../../graphing-lines/js/common/model/Graph.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import Quadratic from '../../common/model/Quadratic.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import PointNode, { PointNodeOptions } from './PointNode.js';

// constants
const COORDINATES_Y_SPACING = 5;

export default class VertexNode extends PointNode {

  public constructor( quadraticProperty: TReadOnlyProperty<Quadratic>, graph: Graph,
                      modelViewTransform: ModelViewTransform2,
                      vertexVisibleProperty: TReadOnlyProperty<boolean>,
                      coordinatesVisibleProperty: TReadOnlyProperty<boolean>,
                      tandem: Tandem ) {

    const options: PointNodeOptions = {

      // PointNode options
      radius: modelViewTransform.modelToViewDeltaX( GQConstants.POINT_RADIUS ),
      coordinatesForegroundColor: 'white',
      coordinatesBackgroundColor: GQColors.VERTEX,
      coordinatesDecimals: GQConstants.VERTEX_DECIMALS,
      tandem: tandem,
      phetioDocumentation: 'displays the vertex of the interactive quadratic'
    };

    // position coordinates on the outside of the parabola
    options.layoutCoordinates = ( coordinatesNode, pointNode ) => {
      coordinatesNode.centerX = pointNode.centerX;
      if ( quadraticProperty.value.a > 0 ) {
        // center coordinates below a parabola that opens down
        coordinatesNode.top = pointNode.bottom + COORDINATES_Y_SPACING;
      }
      else {
        // center coordinates above a parabola that opens up
        coordinatesNode.bottom = pointNode.top - COORDINATES_Y_SPACING;
      }
    };

    // coordinates correspond to the quadratic's vertex (if it has one)
    const coordinatesProperty = new DerivedProperty( [ quadraticProperty ],
      quadratic => ( quadratic.vertex ? quadratic.vertex : null ), {
        valueType: [ Vector2, null ],
        tandem: options.tandem.createTandem( 'coordinatesProperty' ),
        phetioDocumentation: 'coordinates displayed on the vertex point, null means no vertex',
        phetioValueType: NullableIO( Vector2.Vector2IO )
      } );

    // visibility of this Node
    options.visibleProperty = new DerivedProperty(
      [ vertexVisibleProperty, quadraticProperty ],
      ( vertexVisible, quadratic ) =>
        vertexVisible &&  // the Vertex checkbox is checked
        quadratic.isaParabola() && ( quadratic.vertex !== undefined ) &&  // the quadratic is a parabola, so has a vertex
        graph.contains( quadratic.vertex ), // the vertex is on the graph
      {
        tandem: options.tandem.createTandem( 'visibleProperty' ),
        phetioValueType: BooleanIO
      } );

    super( coordinatesProperty, coordinatesVisibleProperty, options );

    // move to the vertex position
    quadraticProperty.link( quadratic => {
      if ( quadratic.vertex ) {
        this.translation = modelViewTransform.modelToViewPosition( quadratic.vertex );
      }
    } );
  }
}

graphingQuadratics.register( 'VertexNode', VertexNode );