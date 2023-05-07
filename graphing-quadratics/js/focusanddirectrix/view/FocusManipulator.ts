// Copyright 2018-2023, University of Colorado Boulder

/**
 * FocusManipulator is the manipulator for editing a quadratic (parabola) by changing its focus.
 * It displays the coordinates of the focus.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { DragListener, DragListenerOptions, Node, PressedDragListener } from '../../../../scenery/js/imports.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import GQManipulator, { GQManipulatorOptions } from '../../common/view/GQManipulator.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import Quadratic from '../../common/model/Quadratic.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import Graph from '../../../../graphing-lines/js/common/model/Graph.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';

// constants
const COORDINATES_Y_SPACING = 1;

type SelfOptions = {

  // dragging this manipulator changes p to be a multiple of this value, in model coordinate frame
  interval?: number;
};

type FocusManipulatorOptions = SelfOptions & StrictOmit<GQManipulatorOptions, 'layoutCoordinates'>;

export default class FocusManipulator extends GQManipulator {

  /**
   * @param pProperty - p coefficient of alternate vertex form
   * @param quadraticProperty - the interactive quadratic
   * @param graph
   * @param modelViewTransform
   * @param focusVisibleProperty
   * @param coordinatesVisibleProperty
   * @param [providedOptions]
   */
  public constructor( pProperty: NumberProperty,
                      quadraticProperty: TReadOnlyProperty<Quadratic>,
                      graph: Graph,
                      modelViewTransform: ModelViewTransform2,
                      focusVisibleProperty: TReadOnlyProperty<boolean>,
                      coordinatesVisibleProperty: TReadOnlyProperty<boolean>,
                      providedOptions: FocusManipulatorOptions ) {

    const options = optionize<FocusManipulatorOptions, SelfOptions, GQManipulatorOptions>()( {

      // SelfOptions
      interval: GQConstants.FOCUS_AND_DIRECTRIX_INTERVAL_P,

      // GQManipulatorOptions
      radius: modelViewTransform.modelToViewDeltaX( GQConstants.MANIPULATOR_RADIUS ),
      color: GQColors.FOCUS,
      coordinatesForegroundColor: 'white',
      coordinatesBackgroundColor: GQColors.FOCUS,
      coordinatesDecimals: GQConstants.FOCUS_DECIMALS,
      phetioDocumentation: 'manipulator for the focus'
    }, providedOptions );

    // position coordinates based on which way the parabola opens
    assert && assert( !options.layoutCoordinates, 'FocusManipulator sets layoutCoordinates' );
    options.layoutCoordinates = ( coordinates, coordinatesNode, radius ) => {
      assert && assert( coordinates, 'expected coordinates' );
      coordinatesNode.centerX = 0;
      const yOffset = radius + COORDINATES_Y_SPACING;
      if ( quadraticProperty.value.a > 0 ) {
        coordinatesNode.bottom = -yOffset;
      }
      else {
        coordinatesNode.top = yOffset;
      }
    };

    // coordinates correspond to the quadratic's focus
    const coordinatesProperty = new DerivedProperty( [ quadraticProperty ],
      quadratic => quadratic.focus || null, {
        valueType: Vector2,
        tandem: options.tandem.createTandem( 'coordinatesProperty' ),
        phetioValueType: Vector2.Vector2IO,
        phetioDocumentation: 'coordinates displayed on the focus manipulator'
      } );

    // visibility of this Node
    assert && assert( !options.visibleProperty, 'FocusManipulator sets visibleProperty' );
    options.visibleProperty = new DerivedProperty(
      [ focusVisibleProperty, quadraticProperty ],
      ( focusVisible, quadratic ) =>
        focusVisible && // the Focus checkbox is checked
        ( quadratic.focus !== undefined ) && // the quadratic has a focus
        graph.contains( quadratic.focus ), // the focus is on the graph
      {
        tandem: options.tandem.createTandem( 'visibleProperty' ),
        phetioValueType: BooleanIO
      } );

    super( coordinatesProperty, coordinatesVisibleProperty, options );

    // add the drag listener
    this.addInputListener( new FocusDragListener( this, pProperty, quadraticProperty, graph.yRange,
      modelViewTransform, options.interval, {
        tandem: options.tandem.createTandem( 'dragListener' )
      } ) );

    // move the manipulator
    quadraticProperty.link( quadratic => {
      const focus = quadratic.focus!;
      assert && assert( focus, `expected focus: ${quadratic.focus}` );
      this.translation = modelViewTransform.modelToViewPosition( focus );
    } );

    options.visibleProperty.link( visible => {
      this.interruptSubtreeInput(); // cancel any drag that is in progress
    } );
  }
}

class FocusDragListener extends DragListener {

  /**
   * @param targetNode - the Node that we attached this listener to
   * @param pProperty - p coefficient of alternate vertex form
   * @param quadraticProperty - the interactive quadratic
   * @param yRange - range of the graph's y-axis
   * @param modelViewTransform
   * @param interval - dragging this manipulator changes p to be a multiple of this value, in model coordinate frame
   * @param [providedOptions]
   */
  public constructor( targetNode: Node, pProperty: NumberProperty, quadraticProperty: TReadOnlyProperty<Quadratic>,
                      yRange: Range, modelViewTransform: ModelViewTransform2, interval: number,
                      providedOptions: DragListenerOptions<PressedDragListener> ) {

    assert && assert( pProperty.range, 'pProperty is missing range' );

    let startOffset: Vector2; // where the drag started, relative to the manipulator

    const options = combineOptions<DragListenerOptions<PressedDragListener>>( {

      allowTouchSnag: true,

      // note where the drag started
      start: ( event, listener ) => {

        const focus = quadraticProperty.value.focus!;
        assert && assert( focus, `expected focus: ${focus}` );

        const position = modelViewTransform.modelToViewPosition( focus );
        startOffset = targetNode.globalToParentPoint( event.pointer.point ).minus( position );
      },

      drag: ( event, listener ) => {

        const vertex = quadraticProperty.value.vertex!;
        assert && assert( vertex, `expected vertex: ${vertex}` );

        // transform the drag point from view to model coordinate frame
        const parentPoint = targetNode.globalToParentPoint( event.pointer.point ).minus( startOffset );
        const position = modelViewTransform.viewToModelPosition( parentPoint );

        // constrain to the graph
        const y = yRange.constrainValue( position.y );

        // constrain and round
        let p = pProperty.range.constrainValue( y - vertex.y );
        p = Utils.roundToInterval( p, interval );

        // skip over p === 0
        if ( p === 0 ) {
          p = ( pProperty.value > 0 ) ? interval : -interval;
        }
        assert && assert( p !== 0, 'p=0 is not supported' );

        pProperty.value = p;
      }
    }, providedOptions );

    super( options );
  }
}

graphingQuadratics.register( 'FocusManipulator', FocusManipulator );