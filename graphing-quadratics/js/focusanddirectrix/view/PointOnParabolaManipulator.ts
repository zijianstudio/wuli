// Copyright 2018-2023, University of Colorado Boulder

/**
 * PointOnParabolaManipulator is the manipulator for editing a point on a parabola.
 * It displays the coordinates of the point.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { DragListener, DragListenerOptions, Node, PressedDragListener } from '../../../../scenery/js/imports.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import GQManipulator, { GQManipulatorOptions } from '../../common/view/GQManipulator.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import Quadratic from '../../common/model/Quadratic.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Graph from '../../../../graphing-lines/js/common/model/Graph.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';

// constants
const COORDINATES_X_SPACING = 1;

type SelfOptions = EmptySelfOptions;

type PointOnParabolaManipulatorOptions = SelfOptions & StrictOmit<GQManipulatorOptions, 'layoutCoordinates'>;

export default class PointOnParabolaManipulator extends GQManipulator {

  public constructor( pointOnParabolaProperty: Property<Vector2>,
                      quadraticProperty: TReadOnlyProperty<Quadratic>,
                      graph: Graph,
                      modelViewTransform: ModelViewTransform2,
                      coordinatesVisibleProperty: TReadOnlyProperty<boolean>,
                      providedOptions: PointOnParabolaManipulatorOptions ) {

    const options = optionize<PointOnParabolaManipulatorOptions, SelfOptions, GQManipulatorOptions>()( {

      // GQManipulatorOptions
      radius: modelViewTransform.modelToViewDeltaX( GQConstants.MANIPULATOR_RADIUS ),
      color: GQColors.POINT_ON_PARABOLA,
      coordinatesForegroundColor: 'white',
      coordinatesBackgroundColor: GQColors.POINT_ON_PARABOLA,
      coordinatesDecimals: GQConstants.POINT_ON_PARABOLA_DECIMALS,
      phetioDocumentation: 'manipulator for a point on the parabola'
    }, providedOptions );

    // position coordinates based on which side of the parabola the point is on
    assert && assert( !options.layoutCoordinates, 'PointOnParabolaManipulator sets layoutCoordinates' );
    options.layoutCoordinates = ( coordinates, coordinatesNode, radius ) => {
      assert && assert( coordinates, 'expected coordinates' );
      const vertex = quadraticProperty.value.vertex!;
      assert && assert( vertex, 'expected a parabola' );
      const xOffset = radius + COORDINATES_X_SPACING;
      if ( coordinates!.x >= vertex.x ) {
        coordinatesNode.left = xOffset;
      }
      else {
        coordinatesNode.right = -xOffset;
      }
      coordinatesNode.centerY = 0;
    };

    // Coordinates are identical to pointOnParabolaProperty. We're using a separate Property here
    // for PhET-iO instrumentation symmetry with other manipulators.
    const coordinatesProperty = new DerivedProperty( [ pointOnParabolaProperty ],
      pointOnParabola => pointOnParabola, {
        valueType: Vector2,
        tandem: options.tandem.createTandem( 'coordinatesProperty' ),
        phetioDocumentation: 'coordinates displayed on the point-on-quadratic manipulator',
        phetioValueType: Vector2.Vector2IO
      } );

    super( coordinatesProperty, coordinatesVisibleProperty, options );

    // add drag handler
    this.addInputListener( new PointOnParabolaDragListener( this, pointOnParabolaProperty, quadraticProperty,
      modelViewTransform, graph, {
        tandem: options.tandem.createTandem( 'dragListener' )
      } ) );

    // move the manipulator
    pointOnParabolaProperty.link( pointOnParabola => {
      this.translation = modelViewTransform.modelToViewPosition( pointOnParabola );
    } );
  }
}

class PointOnParabolaDragListener extends DragListener {

  /**
   * @param targetNode - the Node that we attached this listener to
   * @param pointOnParabolaProperty - the point
   * @param quadraticProperty - the interactive quadratic
   * @param modelViewTransform
   * @param graph
   * @param [providedOptions]
   */
  public constructor( targetNode: Node,
                      pointOnParabolaProperty: Property<Vector2>,
                      quadraticProperty: TReadOnlyProperty<Quadratic>,
                      modelViewTransform: ModelViewTransform2,
                      graph: Graph,
                      providedOptions: DragListenerOptions<PressedDragListener> ) {

    let startOffset: Vector2; // where the drag started, relative to the manipulator

    const options = combineOptions<DragListenerOptions<PressedDragListener>>( {

      allowTouchSnag: true,

      // note where the drag started
      start: ( event, listener ) => {
        const position = modelViewTransform.modelToViewPosition( pointOnParabolaProperty.value );
        startOffset = targetNode.globalToParentPoint( event.pointer.point ).minus( position );
      },

      drag: ( event, listener ) => {

        // transform the drag point from view to model coordinate frame
        const parentPoint = targetNode.globalToParentPoint( event.pointer.point ).minus( startOffset );
        const point = modelViewTransform.viewToModelPosition( parentPoint );

        // get the closest point on the parabola
        const pointOnParabola = quadraticProperty.value.getClosestPoint( point );

        // constrain to the range of the graph. x & y may both be out of range.
        if ( !graph.xRange.contains( pointOnParabola.x ) ) {

          // x is out of range, so constrain x, and solve for y
          pointOnParabola.setX( graph.xRange.constrainValue( pointOnParabola.x ) );
          pointOnParabola.setY( quadraticProperty.value.solveY( pointOnParabola.x ) );
        }

        if ( !graph.yRange.contains( pointOnParabola.y ) ) {

          // y is out of range, so constrain y, solve for x, and choose the closer of the 2 solutions
          pointOnParabola.setY( graph.yRange.constrainValue( pointOnParabola.y ) );
          const xSolutions = quadraticProperty.value.solveX( pointOnParabola.y )!;
          assert && assert( xSolutions && xSolutions.length === 2, `expected 2 solutions for x: ${xSolutions}` );
          const xClosest = ( Math.abs( xSolutions[ 0 ] - pointOnParabola.x ) < Math.abs( xSolutions[ 1 ] - pointOnParabola.x ) )
                           ? xSolutions[ 0 ] : xSolutions[ 1 ];
          pointOnParabola.setX( xClosest );
        }

        // Snap to the x value as it will be displayed, by solving for y.
        // This is so we don't see different y values for the same x value.
        // See https://github.com/phetsims/graphing-quadratics/issues/172.
        const x = Utils.toFixedNumber( pointOnParabola.x, GQConstants.POINT_ON_PARABOLA_DECIMALS );
        const y = quadraticProperty.value.solveY( x );

        pointOnParabolaProperty.value = new Vector2( x, y );
      }
    }, providedOptions );

    super( options );
  }
}

graphingQuadratics.register( 'PointOnParabolaManipulator', PointOnParabolaManipulator );