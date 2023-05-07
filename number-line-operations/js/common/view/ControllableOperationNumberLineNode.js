// Copyright 2020-2021, University of Colorado Boulder

/**
 * ControllableOperationNumberLineNode creates an OperationTrackingNumberLineNode and adds point controllers so that the
 * user can control point values and thus manipulate the operations.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import PointControllerNode from '../../../../number-line-common/js/common/view/PointControllerNode.js';
import merge from '../../../../phet-core/js/merge.js';
import { Node } from '../../../../scenery/js/imports.js';
import numberLineOperations from '../../numberLineOperations.js';
import OperationTrackingNumberLineNode from './OperationTrackingNumberLineNode.js';

class ControllableOperationNumberLineNode extends Node {

  /**
   * @param {OperationTrackingNumberLine} numberLine
   * @param {PointController} initialValuePointController
   * @param {ObservableArrayDef.<PointController>} pointControllerObservableArray
   * @param {Bounds2} layoutBounds - the bounds into which this must be laid out
   * @param {Object} [options] - The options are specific to this class and its components, and are not propagated to
   * the superclass.
   */
  constructor( numberLine, initialValuePointController, pointControllerObservableArray, layoutBounds, options ) {

    options = merge( {
      numberLineNodeOptions: {
        pointNodeOptions: {
          radius: 6,
          labelOpacity: 0.7 // translucent point labels are needed so that short operations can be seen behind them
        }
      }
    }, options );

    super();

    // layer where the point controllers go so that they stay behind the points
    const pointControllerLayer = new Node();
    this.addChild( pointControllerLayer );

    // node that represents the number line itself
    const numberLineNode = new OperationTrackingNumberLineNode( numberLine, options.numberLineNodeOptions );
    this.addChild( numberLineNode );

    // point controller for the starting point on the number line, which is always present
    const initialValuePointControllerNode = new PointControllerNode( initialValuePointController );
    pointControllerLayer.addChild( initialValuePointControllerNode );

    // map of point controllers to nodes
    const pointControllerToNodeMap = new Map( [ [ initialValuePointController, initialValuePointControllerNode ] ] );

    // point controller that is currently dragging if any, only one is allowed at a time
    let draggingPointController = null;

    // Define a closure that will update the pickable setting for the point controllers.  This exists because it's far
    // simpler to prevent simultaneous movements of the point controllers (which can occur in multi-touch environments)
    // than it is to support it.
    const updatePointControllerPickability = () => {

      // Check and update the dragging point controller variable.
      if ( !draggingPointController || !draggingPointController.isDraggingProperty.value ) {
        const allPointControllers = [ initialValuePointController, ...pointControllerObservableArray ];
        draggingPointController = allPointControllers.find( pc => pc.isDraggingProperty.value );
      }

      // Update the state of the point controller nodes based on which, if any, is currently being dragged.
      if ( draggingPointController ) {

        pointControllerToNodeMap.forEach( ( node, pointController ) => {

          // Make sure that only the point controller being dragged is pickable.
          node.pickable = pointController === draggingPointController;

          // It's unlikely, but possible, for two controllers to get picked up in the same animation frame.  If that
          // happened and there is more than one point controller being dragged, cancel the interactions with any that
          // are not designated as the dragging point controller.
          if ( pointController !== draggingPointController && pointController.isDraggingProperty.value ) {
            node.interruptSubtreeInput();
          }
        } );
      }
      else {

        // None of the point controllers are being dragged, so make sure all the point controller nodes are pickable.
        pointControllerToNodeMap.forEach( node => { node.pickable = true; } );
      }
    };

    // Updated the pickability of all point controllers when the dragging state of one changes.  This number line node
    // is assumed to exist for the duration of the sim and therefore no unlink is necessary.
    initialValuePointController.isDraggingProperty.link( updatePointControllerPickability );

    // Add and remove nodes for the point controllers that come and go from the number line.
    pointControllerObservableArray.addItemAddedListener( addedPointController => {
      const pointControllerNode = new PointControllerNode( addedPointController );
      pointControllerToNodeMap.set( addedPointController, pointControllerNode );
      pointControllerLayer.addChild( pointControllerNode );
      addedPointController.isDraggingProperty.link( updatePointControllerPickability ); // unlinked on removal
      const removalListener = removedPointController => {
        if ( removedPointController === addedPointController ) {
          pointControllerLayer.removeChild( pointControllerNode );
          pointControllerNode.dispose();
          pointControllerToNodeMap.delete( removedPointController );
          removedPointController.isDraggingProperty.unlink( updatePointControllerPickability );
          pointControllerObservableArray.removeItemRemovedListener( removalListener );
        }
      };
      pointControllerObservableArray.addItemRemovedListener( removalListener );
    } );
  }
}

numberLineOperations.register( 'ControllableOperationNumberLineNode', ControllableOperationNumberLineNode );
export default ControllableOperationNumberLineNode;
