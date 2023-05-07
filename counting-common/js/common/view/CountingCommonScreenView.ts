// Copyright 2021-2023, University of Colorado Boulder

/**
 * Common ScreenView for CommonModel.
 *
 * @author Sharfudeen Ashraf
 */

import Property from '../../../../axon/js/Property.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node, Plane, PressListenerEvent } from '../../../../scenery/js/imports.js';
import ClosestDragForwardingListener from '../../../../sun/js/ClosestDragForwardingListener.js';
import countingCommon from '../../countingCommon.js';
import CountingCommonConstants from '../CountingCommonConstants.js';
import ArithmeticRules from '../model/ArithmeticRules.js';
import CountingObjectNode from './CountingObjectNode.js';
import CountingCommonModel from '../model/CountingCommonModel.js';
import CountingObject from '../model/CountingObject.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Tandem from '../../../../tandem/js/Tandem.js';

// types
export type CountingObjectNodeMap = Record<number, CountingObjectNode>;

class CountingCommonScreenView extends ScreenView {

  public model: CountingCommonModel;

  // Where all of the paper numbers are. NOTE: Subtypes need to add this as a child with the proper place in layering
  // (this common view doesn't do that).
  protected countingObjectLayerNode: Node;

  // The view coordinates where numbers can be dragged. Can update when the sim is resized.
  private readonly availableViewBoundsProperty: Property<Bounds2>;
  protected readonly resetAllButton: ResetAllButton;

  // Handle touches nearby to the numbers, and interpret those as the proper drag.
  private readonly closestDragForwardingListener: ClosestDragForwardingListener;

  // CountingObject.id => {CountingObjectNode} - lookup map for efficiency
  private readonly countingObjectNodeMap: CountingObjectNodeMap;

  protected constructor( model: CountingCommonModel ) {
    super( {
      tandem: Tandem.OPT_OUT
    } );

    this.model = model;

    this.countingObjectLayerNode = new Node();
    this.countingObjectNodeMap = {};
    this.availableViewBoundsProperty = new Property( ScreenView.DEFAULT_LAYOUT_BOUNDS );

    this.closestDragForwardingListener = new ClosestDragForwardingListener( 30, 0 );
    const backgroundDragTarget = new Plane();
    backgroundDragTarget.addInputListener( this.closestDragForwardingListener );
    this.addChild( backgroundDragTarget );

    // Persistent, no need to unlink
    this.availableViewBoundsProperty.lazyLink( ( availableViewBounds: Bounds2 ) => {
      model.countingObjects.forEach( countingObject => {
        countingObject.setConstrainedDestination( availableViewBounds, countingObject.positionProperty.value );
      } );
    } );

    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        this.reset();
      }
    } );
    this.addChild( this.resetAllButton );
  }

  /**
   * Used to work around super initialization order
   */
  public finishInitialization(): void {
    const countingObjectAddedListener = this.onCountingObjectAdded.bind( this );
    const countingObjectRemovedListener = this.onCountingObjectRemoved.bind( this );

    // Add nodes for every already-existing paper number
    this.model.countingObjects.forEach( countingObjectAddedListener );

    // Add and remove nodes to match the model
    this.model.countingObjects.addItemAddedListener( countingObjectAddedListener );
    this.model.countingObjects.addItemRemovedListener( countingObjectRemovedListener );
  }

  /**
   * Add a paper number to the model and immediately start dragging it with the provided event.
   *
   * @param event - The Scenery event that triggered this.
   * @param countingObject - The paper number to add and then drag
   */
  public addAndDragCountingObject( event: PressListenerEvent, countingObject: CountingObject ): void {
    // Add it and lookup the related node.
    this.model.addCountingObject( countingObject );

    const countingObjectNode = this.findCountingObjectNode( countingObject );
    countingObjectNode.startSyntheticDrag( event );
  }

  /**
   * Creates and adds a CountingObjectNode.
   */
  public onCountingObjectAdded( countingObject: CountingObject ): CountingObjectNode {
    const countingObjectNode = new CountingObjectNode( countingObject, this.availableViewBoundsProperty,
      this.addAndDragCountingObject.bind( this ), this.tryToCombineCountingObjects.bind( this ) );

    this.countingObjectNodeMap[ countingObjectNode.countingObject.id ] = countingObjectNode;
    this.countingObjectLayerNode.addChild( countingObjectNode );
    countingObjectNode.attachListeners();

    this.closestDragForwardingListener.addDraggableItem( countingObjectNode );

    return countingObjectNode;
  }

  /**
   * Handles removing the relevant CountingObjectNode
   */
  public onCountingObjectRemoved( countingObject: CountingObject ): void {
    const countingObjectNode = this.findCountingObjectNode( countingObject );

    delete this.countingObjectNodeMap[ countingObjectNode.countingObject.id ];
    this.closestDragForwardingListener.removeDraggableItem( countingObjectNode );
    countingObjectNode.dispose();
  }

  /**
   * Given a {CountingObject}, find our current display ({CountingObjectNode}) of it.
   */
  public findCountingObjectNode( countingObject: CountingObject ): CountingObjectNode {
    const result = this.countingObjectNodeMap[ countingObject.id ];
    assert && assert( result, 'Did not find matching Node' );
    return result;
  }

  /**
   * When the user drops a paper number they were dragging, see if it can combine with any other nearby paper numbers.
   */
  public tryToCombineCountingObjects( draggedCountingObject: CountingObject ): void {
    const draggedNode = this.findCountingObjectNode( draggedCountingObject );
    const draggedNumberValue = draggedCountingObject.numberValueProperty.value;
    const allCountingObjectNodes = this.countingObjectLayerNode.children;
    const droppedNodes = draggedNode.findAttachableNodes( allCountingObjectNodes as CountingObjectNode[] );

    // Check them in reverse order (the one on the top should get more priority)
    droppedNodes.reverse();

    if ( droppedNodes.length ) {
      const droppedNode = droppedNodes[ 0 ];
      const droppedCountingObject = droppedNode.countingObject;
      const droppedNumberValue = droppedCountingObject.numberValueProperty.value;

      if ( ArithmeticRules.canAddNumbers( draggedNumberValue, droppedNumberValue ) ) {
        this.model.collapseNumberModels( this.availableViewBoundsProperty.value, draggedCountingObject, droppedCountingObject );
      }
      else {
        // repel numbers - show rejection
        this.model.repelAway( this.availableViewBoundsProperty.value, draggedCountingObject, droppedCountingObject,
          ( leftCountingObject: CountingObject, rightCountingObject: CountingObject ) => {

            return {
              left: -CountingCommonConstants.MOVE_AWAY_DISTANCE[ leftCountingObject.digitLength ],
              right: CountingCommonConstants.MOVE_AWAY_DISTANCE[ rightCountingObject.digitLength ]
            };
          } );
      }
    }
  }

  /**
   * Meant for subtypes to override to do additional component layout. Can't override layout(), as it takes additional
   * parameters that we may not have access to.
   */
  protected layoutControls(): void {
    this.resetAllButton.right = this.visibleBoundsProperty.value.right - 10;
    this.resetAllButton.bottom = this.visibleBoundsProperty.value.bottom - 10;
  }

  /**
   * Some views may need to constrain the vertical room at the top (for dragging numbers) due to a status bar.
   * This should be overridden to return the value required.
   *
   * @returns - Amount in view coordinates to leave at the top of the screen
   */
  public getTopBoundsOffset(): number {
    return 0;
  }

  public override layout( bounds: Bounds2 ): void {
    super.layout( bounds );

    // Some views may need to make extra room for a status bar
    const top = this.visibleBoundsProperty.value.minY + this.getTopBoundsOffset();
    this.availableViewBoundsProperty.value = this.visibleBoundsProperty.value.withMinY( top );

    this.layoutControls();
  }

  /**
   * To reset the view, should be overridden
   */
  public reset(): void {
    // Meant to be overridden
  }
}

countingCommon.register( 'CountingCommonScreenView', CountingCommonScreenView );

export default CountingCommonScreenView;