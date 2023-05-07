// Copyright 2020-2022, University of Colorado Boulder

/**
 * PointControllerNode is a Scenery node that represents a point controller in the view.  Interactions with point
 * controller nodes enable the user to add, remove, and manipulate points on a number line.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import LockToNumberLine from '../../../../number-line-common/js/common/model/LockToNumberLine.js';
import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ShadedSphereNode from '../../../../scenery-phet/js/ShadedSphereNode.js';
import { DragListener, Line, Node } from '../../../../scenery/js/imports.js';
import numberLineCommon from '../../numberLineCommon.js';

// constants
const SPHERE_RADIUS = 10; // in screen coords, radius of sphere that is used if no controller node is provided
const ALWAYS_TRUE_PROPERTY = new BooleanProperty( true );

class PointControllerNode extends Node {

  /**
   * @param {PointController} pointController
   * @param {Object} [options]
   * @public
   */
  constructor( pointController, options ) {

    options = merge( {

      // {node} - The node used for the view representation.  Its X and Y position will be set based on the position
      // of the corresponding point controller, so it should be set up with the appropriate offset bounds.  A shaded
      // sphere is created if no node is provided.
      node: null,

      // {boolean} - controls whether there is a line drawn from this controller to the number line
      connectorLine: true,

      // {BooleanProperty} - if the connector line is present, this boolean Property can optionally be provided to
      // control its visibility
      connectorLineVisibleProperty: ALWAYS_TRUE_PROPERTY,

      cursor: 'pointer'

    }, options );

    super( options );

    // Create and add the line that will connect to the number line point.
    const connectorLine = new Line( 0, 0, 0, 0, { stroke: 'gray' } );
    connectorLine.visible = false;
    this.addChild( connectorLine );

    // @private {Node} - the node that the user will drag to move the point controller around.  If a node is not
    // provided by the client, a default node is created.
    this.draggableNode = options.node || new ShadedSphereNode( SPHERE_RADIUS * 2, {
      mainColor: pointController.color
    } );
    this.addChild( this.draggableNode );

    // function to update the visibility of the connector line
    const updateConnectorLineVisibility = () => {
      connectorLine.visible = options.connectorLineVisibleProperty.value && pointController.isControllingNumberLinePoint();
    };

    // A point controller node is visible most of the time, but if it is controlling a point that goes outside of the
    // displayed range of the number line, it should be invisible.
    const updatePointControllerVisibility = () => {
      if ( pointController.numberLinePoints.length >= 1 ) {
        let atLeastOnePointVisible = false;
        pointController.numberLines.forEach( numberLine => {
          pointController.numberLinePoints.forEach( point => {
            if ( numberLine.isPointInDisplayedRange( point ) ) {
              atLeastOnePointVisible = true;
            }
          } );
        } );
        this.visible = atLeastOnePointVisible;
      }
      else {

        // always visible if not controlling a point
        this.visible = true;
      }
    };

    // If this point controller is permanently attached to a number line, monitor that number line for changes to its
    // displayed range and make updates to this node's visibility.
    if ( pointController.lockToNumberLine === LockToNumberLine.ALWAYS ) {

      // As of this writing, there is no support for having a point controller permanently locked to multiple number
      // lines, and it seems like an unlikely case, so the following assert checks that there is only one.  If support
      // for point controllers that are locked to multiple number lines is ever needed, this will need to change.
      assert && assert( pointController.numberLines.length === 1 );

      // Listen for changes to the number line's displayed range and update visibility.
      const numberLine = pointController.numberLines[ 0 ];
      numberLine.displayedRangeProperty.link( updatePointControllerVisibility );
    }

    // Handle changes to the point controller position.
    const updateAppearanceOnPositionChange = position => {
      if ( options.connectorLine && pointController.isControllingNumberLinePoint() ) {

        // As of this writing (Nov 2019), PointControllerNode only handles drawing connector lines to a single point.
        // It would be possible to handle multiple points, but this has not been needed thus far and is therefore not
        // handled. If you need it, feel free to add it.
        assert && assert( pointController.numberLinePoints.length === 1, 'incorrect number of points controlled' );

        // Update the connector line.
        const pointPosition = pointController.numberLinePoints.get( 0 ).getPositionInModelSpace();
        connectorLine.setLine( position.x, position.y, pointPosition.x, pointPosition.y );
      }
      updateConnectorLineVisibility();
      this.draggableNode.translation = position;
      updatePointControllerVisibility();
    };
    pointController.positionProperty.link( updateAppearanceOnPositionChange );

    // Closure that moves this point controller node to the front of the z-order.
    const moveToFront = () => { this.moveToFront(); };

    // Move this point controller to the front of the z-order if any of it's currently controlled points change.
    pointController.numberLinePoints.forEach( numberLinePoint => {
      numberLinePoint.valueProperty.link( moveToFront );
    } );

    // Watch for new controlled points and add listeners to manage layering.
    const pointAddedListener = numberLinePoint => {
      numberLinePoint.valueProperty.link( moveToFront );
    };
    pointController.numberLinePoints.addItemAddedListener( pointAddedListener );

    // Remove our listeners from points that are removed from this point controller's list.
    const pointRemovedListener = removedNumberLinePoint => {
      removedNumberLinePoint.valueProperty.unlink( moveToFront );
    };
    pointController.numberLinePoints.addItemRemovedListener( pointRemovedListener );

    if ( options.connectorLineVisibleProperty !== ALWAYS_TRUE_PROPERTY ) {
      assert && assert( options.connectorLine, 'must have connector line turned on for the viz Property to make sense' );
      options.connectorLineVisibleProperty.link( updateConnectorLineVisibility );
    }

    const handlePointControllerScaleChange = scale => {
      this.draggableNode.setScaleMagnitude( scale );
    };
    pointController.scaleProperty.link( handlePointControllerScaleChange );

    // Pop to the front of the z-order when dragged.
    const dragStateChangeHandler = dragging => {
      if ( dragging ) {
        this.moveToFront();
      }
    };
    pointController.isDraggingProperty.link( dragStateChangeHandler );

    // Don't allow the point controller node to be grabbed if it is animating somewhere.
    const inProgressAnimationChangedHandler = inProgressAnimation => {
      this.pickable = inProgressAnimation === null;
    };
    pointController.inProgressAnimationProperty.link( inProgressAnimationChangedHandler );

    // drag handler if intended to be dragged
    if ( options.pickable !== false ) {
      let pointOffset;
      this.addInputListener( new DragListener( {

        dragBoundsProperty: new Property( this.layoutBounds ),

        start: event => {
          pointController.isDraggingProperty.value = true;
          const point = this.draggableNode.globalToParentPoint( event.pointer.point ); // pointer in parent frame
          const relativePoint = point.minus( this.draggableNode ); // pointer in local frame
          const startingOffset = relativePoint
            .dividedScalar( pointController.scaleProperty.value )
            .minus( relativePoint ); // if node has a scale, find offset of node after it is set to 1.0 scale
          pointController.scaleProperty.value = 1.0;
          pointController.proposePosition(
            this.draggableNode.translation.minus( startingOffset ) // if node had scale, move it to where pointer clicked
          );
          pointOffset = point.minus( this.draggableNode );
        },

        drag: event => {
          pointController.isDraggingProperty.value = true; // necessary in case isDraggingProperty is changed while dragging
          const parentPoint = this.globalToParentPoint( event.pointer.point );
          pointController.proposePosition( parentPoint.minus( pointOffset ) );
        },

        end: () => {
          pointController.isDraggingProperty.value = false;
        }
      } ) );
    }

    // If the default point controller node is being used, create and hook up the listener that will update touch
    // areas as the orientation changes so that the point controllers can be easily grabbed by a user's finger without
    // covering them up.
    let setTouchDilationBasedOnOrientation;
    if ( !options.node ) {
      setTouchDilationBasedOnOrientation = orientation => {
        const nominalBounds = this.draggableNode.localBounds;
        let touchAreaBounds;
        if ( orientation === Orientation.HORIZONTAL ) {
          const dilatedBounds = nominalBounds.dilateXY( SPHERE_RADIUS / 2, SPHERE_RADIUS * 2 );
          touchAreaBounds = dilatedBounds.shiftedY( SPHERE_RADIUS * 1.5 );
        }
        else {
          const dilatedBounds = nominalBounds.dilateXY( SPHERE_RADIUS * 2, SPHERE_RADIUS / 2 );
          touchAreaBounds = dilatedBounds.shiftedX( SPHERE_RADIUS * 1.5 );
        }
        this.draggableNode.setTouchArea( touchAreaBounds );
      };
      pointController.numberLines[ 0 ].orientationProperty.link( setTouchDilationBasedOnOrientation );
    }

    // @private
    this.disposePointControllerNode = () => {
      pointController.positionProperty.unlink( updateAppearanceOnPositionChange );
      pointController.isDraggingProperty.unlink( dragStateChangeHandler );
      pointController.inProgressAnimationProperty.unlink( inProgressAnimationChangedHandler );
      if ( options.connectorLineVisibleProperty.hasListener( updateConnectorLineVisibility ) ) {
        options.connectorLineVisibleProperty.unlink( updateConnectorLineVisibility );
      }
      pointController.numberLines.forEach( numberLine => {
        if ( numberLine.displayedRangeProperty.hasListener( updatePointControllerVisibility ) ) {
          numberLine.displayedRangeProperty.unlink( updatePointControllerVisibility );
        }
        if ( numberLine.orientationProperty.hasListener( setTouchDilationBasedOnOrientation ) ) {
          numberLine.orientationProperty.unlink( setTouchDilationBasedOnOrientation );
        }
      } );
      pointController.numberLinePoints.removeItemAddedListener( pointAddedListener );
      pointController.numberLinePoints.removeItemRemovedListener( pointRemovedListener );
      pointController.numberLinePoints.forEach( numberLinePoint => {
        numberLinePoint.valueProperty.unlink( moveToFront );
      } );
    };
  }

  /**
   * Clean up any linkages or other references that could lead to memory leaks.
   * @public
   * @override
   */
  dispose() {
    this.interruptSubtreeInput(); // Make sure there are no in-progress interactions, see #106.
    this.disposePointControllerNode();
    super.dispose();
  }
}

numberLineCommon.register( 'PointControllerNode', PointControllerNode );
export default PointControllerNode;
