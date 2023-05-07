// Copyright 2018-2023, University of Colorado Boulder

/**
 * VertexManipulator is the manipulator for editing a quadratic (parabola) by changing its vertex.
 * It displays the coordinates of the vertex.
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { DragListener, DragListenerOptions, Node, PressedDragListener } from '../../../../scenery/js/imports.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQColors from '../GQColors.js';
import GQConstants from '../GQConstants.js';
import GQManipulator, { GQManipulatorOptions } from './GQManipulator.js';
import Quadratic from '../model/Quadratic.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Graph from '../../../../graphing-lines/js/common/model/Graph.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../../phet-core/js/optionize.js';

// constants
const COORDINATES_Y_SPACING = 1;

type SelfOptions = EmptySelfOptions;

type VertexManipulatorOptions = SelfOptions & StrictOmit<GQManipulatorOptions, 'layoutCoordinates'>;

export default class VertexManipulator extends GQManipulator {

  /**
   * @param hProperty - h coefficient of the vertex form of the quadratic equation
   * @param kProperty - k coefficient of the vertex form of the quadratic equation
   * @param quadraticProperty - the interactive quadratic
   * @param graph
   * @param modelViewTransform
   * @param vertexVisibleProperty
   * @param coordinatesVisibleProperty
   * @param [providedOptions]
   */
  public constructor( hProperty: NumberProperty,
                      kProperty: NumberProperty,
                      quadraticProperty: TReadOnlyProperty<Quadratic>,
                      graph: Graph,
                      modelViewTransform: ModelViewTransform2,
                      vertexVisibleProperty: TReadOnlyProperty<boolean>, coordinatesVisibleProperty: TReadOnlyProperty<boolean>,
                      providedOptions: VertexManipulatorOptions ) {

    const options = optionize<VertexManipulatorOptions, SelfOptions, GQManipulatorOptions>()( {

      // GQManipulatorOptions
      radius: modelViewTransform.modelToViewDeltaX( GQConstants.MANIPULATOR_RADIUS ),
      color: GQColors.VERTEX,
      coordinatesForegroundColor: 'white',
      coordinatesBackgroundColor: GQColors.VERTEX,
      coordinatesDecimals: GQConstants.VERTEX_DECIMALS,
      phetioDocumentation: 'manipulator for the vertex'
    }, providedOptions );

    // position coordinates based on which way the parabola opens
    options.layoutCoordinates = ( coordinates, coordinatesNode, radius ) => {
      if ( coordinates ) {
        coordinatesNode.centerX = 0;
        const yOffset = radius + COORDINATES_Y_SPACING;
        if ( quadraticProperty.value.a > 0 ) {
          coordinatesNode.top = yOffset;
        }
        else {
          coordinatesNode.bottom = -yOffset;
        }
      }
    };

    // coordinates correspond to the quadratic's vertex (if it has one)
    const coordinatesProperty = new DerivedProperty( [ quadraticProperty ],
      quadratic => ( quadratic.vertex ? quadratic.vertex : null ), {
        valueType: [ Vector2, null ],
        tandem: options.tandem.createTandem( 'coordinatesProperty' ),
        phetioDocumentation: 'coordinates displayed by on vertex manipulator, null means no vertex',
        phetioValueType: NullableIO( Vector2.Vector2IO )
      } );

    // visibility of this Node
    assert && assert( !options.visibleProperty, 'VertexManipulator sets visibleProperty' );
    options.visibleProperty = new DerivedProperty(
      [ vertexVisibleProperty, quadraticProperty ],
      ( vertexVisible, quadratic ) =>
        vertexVisible &&  // the Vertex checkbox is checked
        quadratic.isaParabola() && ( quadratic.vertex !== undefined ) && // the quadratic is a parabola, so has a vertex
        graph.contains( quadratic.vertex ), // the vertex is on the graph
      {
        tandem: options.tandem.createTandem( 'visibleProperty' ),
        phetioValueType: BooleanIO
      } );

    super( coordinatesProperty, coordinatesVisibleProperty, options );

    // add the drag listener
    this.addInputListener( new VertexDragListener( this, hProperty, kProperty, graph, modelViewTransform, {
      tandem: options.tandem.createTandem( 'dragListener' )
    } ) );

    // move the manipulator
    quadraticProperty.link( quadratic => {
      if ( quadratic.vertex ) {
        this.translation = modelViewTransform.modelToViewPosition( quadratic.vertex );
      }
    } );

    options.visibleProperty.link( visible => {
      this.interruptSubtreeInput(); // cancel any drag that is in progress
    } );
  }
}

class VertexDragListener extends DragListener {

  /**
   * @param targetNode - the Node that we attached this listener to
   * @param hProperty - h coefficient of vertex form
   * @param kProperty - k coefficient of vertex form
   * @param graph
   * @param modelViewTransform
   * @param [providedOptions]
   */
  public constructor( targetNode: Node, hProperty: NumberProperty, kProperty: NumberProperty, graph: Graph,
                      modelViewTransform: ModelViewTransform2, providedOptions: DragListenerOptions<PressedDragListener> ) {

    let startOffset: Vector2; // where the drag started, relative to the manipulator

    const options = combineOptions<DragListenerOptions<PressedDragListener>>( {

      allowTouchSnag: true,

      // note where the drag started
      start: ( event, listener ) => {
        const position = modelViewTransform.modelToViewXY( hProperty.value, kProperty.value );
        startOffset = targetNode.globalToParentPoint( event.pointer.point ).minus( position );
      },

      drag: ( event, listener ) => {

        // transform the drag point from view to model coordinate frame
        const parentPoint = targetNode.globalToParentPoint( event.pointer.point ).minus( startOffset );
        let position = modelViewTransform.viewToModelPosition( parentPoint );

        // constrain to the graph
        position = graph.constrain( position );

        // constrain to range and snap to integer grid
        const h = Utils.roundSymmetric( hProperty.range.constrainValue( position.x ) );
        const k = Utils.roundSymmetric( kProperty.range.constrainValue( position.y ) );

        // Setting h and k separately results in an intermediate Quadratic.
        // We decided that this is OK, and we can live with it.
        hProperty.value = h;
        kProperty.value = k;
      }
    }, providedOptions );

    super( options );
  }
}

graphingQuadratics.register( 'VertexManipulator', VertexManipulator );