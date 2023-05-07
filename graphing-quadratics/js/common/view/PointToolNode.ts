// Copyright 2018-2023, University of Colorado Boulder

/**
 * PointToolNode is a tool displays the (x,y) coordinates of a point on the graph.
 * If it's sufficiently close to a curve, it will snap to that curve.
 * If it's not on the graph, it will display '( ?, ? )'.
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Graph from '../../../../graphing-lines/js/common/model/Graph.js';
import PointToolBodyNode from '../../../../graphing-lines/js/common/view/PointToolBodyNode.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Circle, DragListener, DragListenerOptions, Node, NodeOptions, Path, PressedDragListener, Rectangle, TColor } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQConstants from '../GQConstants.js';
import GQQueryParameters from '../GQQueryParameters.js';
import PointTool from '../model/PointTool.js';

const PROBE_RADIUS = 15;
const PROBE_STROKE = 'black';

type SelfOptions = {
  backgroundNormalColor?: TColor;
  foregroundNormalColor?: TColor;
  foregroundHighlightColor?: TColor;
};

type PointToolNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

export default class PointToolNode extends Node {

  public constructor( pointTool: PointTool, modelViewTransform: ModelViewTransform2, graph: Graph,
                      graphContentsVisibleProperty: TReadOnlyProperty<boolean>, providedOptions: PointToolNodeOptions ) {

    const options = optionize<PointToolNodeOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      backgroundNormalColor: 'white',
      foregroundNormalColor: 'black',
      foregroundHighlightColor: 'white',

      // NodeOptions
      cursor: 'pointer',
      phetioDocumentation: Tandem.PHET_IO_ENABLED ? pointTool.phetioDocumentation : '',
      phetioInputEnabledPropertyInstrumented: true
    }, providedOptions );

    // coordinatesProperty is null when the tool is not on the graph.
    const coordinatesProperty = new DerivedProperty( [ pointTool.positionProperty ],
      position => ( graph.contains( position ) ? position : null ), {
        valueType: [ Vector2, null ]
      } );

    const bodyNode = new PointToolBodyNode( coordinatesProperty, {
      backgroundWidth: 86,
      coordinatesSide: pointTool.probeSide,
      decimals: GQConstants.POINT_TOOL_DECIMALS
    } );

    const probeNode = new ProbeNode();

    // Put probe on correct side of body. Move the body, since the probe establishes the origin.
    if ( pointTool.probeSide === 'left' ) {
      bodyNode.left = probeNode.right - 1; // -1 for overlap, so you don't see a gap
    }
    else {
      probeNode.setScaleMagnitude( -1, 1 ); // reflect about the y axis
      bodyNode.right = probeNode.left + 1; // +1 for overlap, so you don't see a gap
    }
    bodyNode.centerY = probeNode.centerY;

    options.children = [ bodyNode, probeNode ];
    super( options );

    Multilink.multilink( [ pointTool.positionProperty, pointTool.quadraticProperty, graphContentsVisibleProperty ],
      ( position, onQuadratic, graphContentsVisible ) => {

        // move to position
        this.translation = modelViewTransform.modelToViewPosition( position );

        // update colors
        if ( graph.contains( position ) && onQuadratic && graphContentsVisible ) {

          // color code the display to onQuadratic
          bodyNode.setTextFill( options.foregroundHighlightColor );
          bodyNode.setBackgroundFill( onQuadratic.color );
        }
        else {
          bodyNode.setTextFill( options.foregroundNormalColor );
          bodyNode.setBackgroundFill( options.backgroundNormalColor );
        }
      } );

    // add the drag listener
    this.addInputListener( new PointToolDragListener( this, pointTool, modelViewTransform, graph,
      graphContentsVisibleProperty, {
        tandem: options.tandem.createTandem( 'dragListener' )
      } ) );

    // put a red dot at the origin, for debugging positioning
    if ( GQQueryParameters.showOrigin ) {
      this.addChild( new Circle( 3, { fill: 'red' } ) );
    }
  }

  public override dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }
}

/**
 * The probe that is attached to the side of the point tool. Drawn for attachment to left side.
 */

class ProbeNode extends Node {

  public constructor() {

    // circle
    const circle = new Circle( PROBE_RADIUS, {
      lineWidth: 3,
      stroke: PROBE_STROKE,
      fill: 'rgba( 255, 255, 255, 0.2 )', // transparent white
      centerX: 0,
      centerY: 0
    } );

    // crosshairs
    const crosshairs = new Path( new Shape()
      .moveTo( -PROBE_RADIUS, 0 )
      .lineTo( PROBE_RADIUS, 0 )
      .moveTo( 0, -PROBE_RADIUS )
      .lineTo( 0, PROBE_RADIUS ), {
      stroke: PROBE_STROKE,
      center: circle.center
    } );

    // shaft that connects the probe to the body
    const shaft = new Rectangle( 0, 0, 0.5 * PROBE_RADIUS, 4, {
      fill: 'rgb( 144, 144, 144 )',
      left: circle.right,
      centerY: circle.centerY
    } );

    super( {
      children: [ shaft, crosshairs, circle ],

      // origin at the center
      x: 0,
      y: 0
    } );
  }
}

class PointToolDragListener extends DragListener {

  public constructor( targetNode: Node, pointTool: PointTool, modelViewTransform: ModelViewTransform2, graph: Graph,
                      graphContentsVisibleProperty: TReadOnlyProperty<boolean>,
                      providedOptions: DragListenerOptions<PressedDragListener> ) {

    // When the point tool is snapped to a curve, it will also snap to integer x coordinates. This value determines
    // how close the point tool's x coordinate must be in order to snap to the closest integer x coordinate.
    // We decided that the most effective value was the smallest interval that the point tool displays.
    // See https://github.com/phetsims/graphing-quadratics/issues/169.
    const xSnapTolerance = 1 / Math.pow( 10, GQConstants.POINT_TOOL_DECIMALS );

    let startOffset: Vector2; // where the drag started, relative to the tool's origin, in parent view coordinates

    const options = combineOptions<DragListenerOptions<PressedDragListener>>( {

      allowTouchSnag: true,

      // note where the drag started
      start: ( event, listener ) => {

        // Note the mouse-click offset when dragging starts.
        const position = modelViewTransform.modelToViewPosition( pointTool.positionProperty.value );
        startOffset = targetNode.globalToParentPoint( event.pointer.point ).minus( position );

        // Move the tool that we're dragging to the foreground.
        targetNode.moveToFront();
      },

      drag: ( event, listener ) => {

        // Convert drag point to model position
        const parentPoint = targetNode.globalToParentPoint( event.pointer.point ).minus( startOffset );
        let position = modelViewTransform.viewToModelPosition( parentPoint );

        // constrained to dragBounds
        position = pointTool.dragBounds.closestPointTo( position );

        // If we're on the graph and the contents of the graph are visible...
        if ( graph.contains( position ) && graphContentsVisibleProperty.value ) {

          // If we're close enough to a quadratic, snap to that quadratic.
          const snapQuadratic = pointTool.getQuadraticNear( position,
            GQQueryParameters.snapOffDistance, GQQueryParameters.snapOnDistance );
          if ( snapQuadratic ) {

            // Get the closest point that is on the quadratic.
            position = snapQuadratic.getClosestPoint( position );

            // We will be snapping the x value as it will be displayed by the point tool.
            // See See https://github.com/phetsims/graphing-quadratics/issues/169.
            let x = Utils.toFixedNumber( position.x, GQConstants.POINT_TOOL_DECIMALS );

            // If x is close to an integer value, snap to that integer value.
            // See https://github.com/phetsims/graphing-quadratics/issues/169.
            const closestInteger = Utils.toFixedNumber( x, 0 );
            if ( Math.abs( x - closestInteger ) < xSnapTolerance ) {
              x = closestInteger;
            }

            const y = snapQuadratic.solveY( x );
            position = new Vector2( x, y );
          }
        }

        // move the point tool
        pointTool.positionProperty.value = position;
      }
    }, providedOptions );

    super( options );
  }
}

graphingQuadratics.register( 'PointToolNode', PointToolNode );