// Copyright 2022-2023, University of Colorado Boulder

/**
 * Node for a CountingArea. This file was copied from counting-common/common/view/CountingCommonScreenView.js and
 * make-a-ten/explore/view/MakeATenExploreScreenView.js and then modified by @chrisklus to be used in number-suite-common.
 * See https://github.com/phetsims/number-suite-common/issues/41.
 *
 * @author Sharfudeen Ashraf
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import CountingObject from '../../../../counting-common/js/common/model/CountingObject.js';
import CountingObjectNode from '../../../../counting-common/js/common/view/CountingObjectNode.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Node, NodeOptions, PressListenerEvent, Rectangle } from '../../../../scenery/js/imports.js';
import ClosestDragForwardingListener from '../../../../sun/js/ClosestDragForwardingListener.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import CountingArea, { CountingObjectSerialization } from '../model/CountingArea.js';
import CountingObjectCreatorPanel, { CountingObjectCreatorPanelOptions } from './CountingObjectCreatorPanel.js';
import { CountingObjectNodeMap } from '../../../../counting-common/js/common/view/CountingCommonScreenView.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import CountingCommonConstants from '../../../../counting-common/js/common/CountingCommonConstants.js';
import CountingObjectType from '../../../../counting-common/js/common/model/CountingObjectType.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import optionize from '../../../../phet-core/js/optionize.js';
import DraggableTenFrameNode from '../../lab/view/DraggableTenFrameNode.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Multilink from '../../../../axon/js/Multilink.js';

type SelfOptions = {
  countingObjectLayerNode?: null | Node;
  backgroundDragTargetNode?: null | Node;
  viewHasIndependentModel?: boolean; // whether this view is hooked up to its own model or a shared model
  includeCountingObjectCreatorPanel?: boolean;
  creatorPanelX?: null | number;
  returnZoneProperty?: null | TReadOnlyProperty<Bounds2>;
  countingObjectCreatorPanelOptions?: CountingObjectCreatorPanelOptions;
};
type CountingAreaNodeOptions = SelfOptions;

// constants
const COUNTING_OBJECT_HANDLE_OFFSET_Y = -9.5; // empirically determined to be an appropriate length for just 10s and 1s, in screen coords

const COUNTING_OBJECT_REPEL_DISTANCE = 10; // empirically determined to look nice, in screen coords, repel this much
const COUNTING_OBJECT_REPEL_WHEN_CLOSER_THAN = 7; // If object are closer than this, than commence repel

class CountingAreaNode extends Node {

  // called when a countingObject finishes animating, see onNumberAnimationFinished
  private readonly animationFinishedListener: ( countingObject: CountingObject ) => void;

  // called when a countingObjectNode finishes being dragged, see onNumberDragFinished
  private readonly dragFinishedListener: ( countingObjectNode: CountingObjectNode ) => void;

  // our model
  public readonly countingArea: CountingArea;

  // CountingObject.id => {CountingObjectNode} - lookup map for efficiency
  private readonly countingObjectNodeMap: CountingObjectNodeMap;

  // The bounds of the countingArea where countingObjects can be dragged, named so that it doesn't overwrite Node.boundsProperty
  private readonly countingAreaBoundsProperty: TReadOnlyProperty<Bounds2>;
  public readonly countingObjectTypeProperty: TReadOnlyProperty<CountingObjectType>;

  // see options.viewHasIndependentModel for doc
  private readonly viewHasIndependentModel: boolean;

  // handle touches nearby to the countingObjects, and interpret those as the proper drag.
  private readonly closestDragForwardingListener: ClosestDragForwardingListener;

  // Node parent for all CountingObjectNode instances, created if not provided.
  private readonly countingObjectLayerNode: Node;

  public readonly countingObjectCreatorPanel: CountingObjectCreatorPanel;
  private readonly includeCountingObjectCreatorPanel: boolean;
  private readonly getCountingObjectOrigin: () => Vector2 = () => Vector2.ZERO;
  private readonly returnZoneProperty: TReadOnlyProperty<Bounds2> | null;

  public constructor( countingArea: CountingArea,
                      countingObjectTypeProperty: TReadOnlyProperty<CountingObjectType>,
                      countingAreaBoundsProperty: TReadOnlyProperty<Bounds2>,
                      providedOptions?: CountingAreaNodeOptions ) {

    const options = optionize<CountingAreaNodeOptions, StrictOmit<SelfOptions, 'countingObjectCreatorPanelOptions'>, NodeOptions>()( {
      countingObjectLayerNode: null,
      backgroundDragTargetNode: null,
      viewHasIndependentModel: true,
      includeCountingObjectCreatorPanel: true,
      creatorPanelX: null,
      returnZoneProperty: null
    }, providedOptions );

    super( options );

    this.animationFinishedListener = ( countingObject: CountingObject ) => this.onNumberAnimationFinished( countingObject );
    this.dragFinishedListener = ( countingObjectNode: CountingObjectNode ) => this.onNumberDragFinished( countingObjectNode.countingObject );

    this.countingArea = countingArea;

    this.countingObjectNodeMap = {};

    this.countingAreaBoundsProperty = countingAreaBoundsProperty;
    this.countingObjectTypeProperty = countingObjectTypeProperty;

    this.viewHasIndependentModel = options.viewHasIndependentModel;

    this.closestDragForwardingListener = new ClosestDragForwardingListener( 30, 0 );
    let backgroundDragTargetNode = null;
    if ( options.backgroundDragTargetNode ) {
      backgroundDragTargetNode = options.backgroundDragTargetNode;
    }
    else {
      backgroundDragTargetNode = new Rectangle( countingAreaBoundsProperty.value );
      this.addChild( backgroundDragTargetNode );
    }
    backgroundDragTargetNode.addInputListener( this.closestDragForwardingListener );

    const countingObjectAddedListener = this.onCountingObjectAdded.bind( this );
    const countingObjectRemovedListener = this.onCountingObjectRemoved.bind( this );

    // Add nodes for every already-existing countingObject
    countingArea.countingObjects.forEach( countingObjectAddedListener );

    // Add and remove nodes to match the countingArea
    countingArea.countingObjects.addItemAddedListener( countingObjectAddedListener );
    countingArea.countingObjects.addItemRemovedListener( countingObjectRemovedListener );

    // Persistent, no need to unlink
    this.countingAreaBoundsProperty.lazyLink( () => {
      this.constrainAllPositions();
    } );

    // create the CountingObjectCreatorPanel
    this.countingObjectCreatorPanel = new CountingObjectCreatorPanel( countingArea, this, options.countingObjectCreatorPanelOptions );
    if ( options.creatorPanelX ) {
      this.countingObjectCreatorPanel.centerX = options.creatorPanelX;
    }
    else {
      this.countingObjectCreatorPanel.left = countingAreaBoundsProperty.value.minX + CountingCommonConstants.COUNTING_AREA_MARGIN;
    }

    // set the y position of the CountingObjectCreatorPanel. NOTE: It is assumed below during initialization that the
    // CountingObjectCreatorPanel is positioned along the bottom of the countingArea bounds
    const updateCountingObjectCreatorPanelPosition = () => {
      this.countingObjectCreatorPanel.bottom = countingAreaBoundsProperty.value.bottom -
                                               CountingCommonConstants.COUNTING_AREA_MARGIN;
    };
    countingAreaBoundsProperty.link( updateCountingObjectCreatorPanelPosition );
    this.transformEmitter.addListener( updateCountingObjectCreatorPanelPosition );

    if ( options.includeCountingObjectCreatorPanel ) {
      this.addChild( this.countingObjectCreatorPanel );
      this.getCountingObjectOrigin = () => this.countingObjectCreatorPanel.countingCreatorNode.getOriginPosition();
    }

    // initialize the model with positioning information
    if ( this.viewHasIndependentModel ) {
      const countingObjectCreatorNodeHeight = options.includeCountingObjectCreatorPanel ? this.countingObjectCreatorPanel.height : 0;
      this.countingArea.initialize( this.getCountingObjectOrigin, countingObjectCreatorNodeHeight, countingAreaBoundsProperty );
    }

    if ( options.countingObjectLayerNode ) {
      this.countingObjectLayerNode = options.countingObjectLayerNode;
    }
    else {
      this.countingObjectLayerNode = new Node();

      // add the countingObjectLayerNode after the creator panel
      this.addChild( this.countingObjectLayerNode );
    }

    this.includeCountingObjectCreatorPanel = options.includeCountingObjectCreatorPanel;
    this.returnZoneProperty = options.returnZoneProperty;

    // In the view only because of countingObjectNode.updateNumber()
    Multilink.lazyMultilink( [
      this.countingArea.groupingEnabledProperty,
      countingObjectTypeProperty
    ], groupingEnabled => {

      // When grouping is turned off, break apart any object groups
      !groupingEnabled && this.countingArea.breakApartCountingObjects( true );

      for ( let i = 0; i < this.countingArea.countingObjects.length; i++ ) {
        const countingObject = this.countingArea.countingObjects[ i ];
        const countingObjectNode = this.getCountingObjectNode( countingObject );

        // Need to call this on countingObjects that are NOT included in sum.
        countingObjectNode.updateNumber();

        // Don't constrain a destination to objects not included in sum.
        if ( !countingObject.isAnimating ) {

          // In general this should be superfluous, but the "card" around a counting object type has larger bounds
          // than the object itself, so we need to handle this.
          countingObject.setConstrainedDestination( this.countingAreaBoundsProperty.value, countingObject.positionProperty.value );
        }
      }
    } );
  }

  /**
   * Add a countingObject to the countingArea and immediately start dragging it with the provided event.
   *
   * @param event - The Scenery event that triggered this.
   * @param countingObject - The countingObject to add and then drag
   *
   * TODO: same as CountingCommonScreenView.addAndDragCountingObject https://github.com/phetsims/number-suite-common/issues/41
   * only difference is call to countingArea.calculateTotal()
   */
  public addAndDragCountingObject( event: PressListenerEvent, countingObject: CountingObject ): void {

    // Add it and lookup the related node.
    this.countingArea.addCountingObject( countingObject );
    this.countingArea.calculateTotal();

    const countingObjectNode = this.getCountingObjectNode( countingObject );
    countingObjectNode.startSyntheticDrag( event );
  }

  /**
   * Creates and adds a CountingObjectNode.
   *
   * TODO: same work as CountingCommonScreenView.onCountingObjectAdded https://github.com/phetsims/number-suite-common/issues/41
   * Add listener calls are duplicated from MakeATenExploreScreenView.onCountingObjectAdded
   */
  public onCountingObjectAdded( countingObject: CountingObject ): void {

    const countingObjectNode = new CountingObjectNode(
      countingObject,
      this.countingAreaBoundsProperty,
      this.addAndDragCountingObject.bind( this ),
      this.handleDroppedCountingObject.bind( this ), {
        countingObjectTypeProperty: this.countingObjectTypeProperty,
        baseNumberNodeOptions: {
          handleOffsetY: COUNTING_OBJECT_HANDLE_OFFSET_Y
        }
      } );

    this.countingObjectNodeMap[ countingObjectNode.countingObject.id ] = countingObjectNode;
    this.countingObjectLayerNode.addChild( countingObjectNode );
    countingObjectNode.attachListeners();

    this.closestDragForwardingListener.addDraggableItem( countingObjectNode );

    // add listeners
    countingObject.endAnimationEmitter.addListener( this.animationFinishedListener );
    countingObjectNode.endDragEmitter.addListener( this.dragFinishedListener );
  }

  /**
   * Handles removing the relevant CountingObjectNode
   * TODO: Duplicated from CountingCommonScreenView.onCountingObjectRemoved https://github.com/phetsims/number-suite-common/issues/41
   * Listener removal duplicated from MakeATenExploreScreenView.onCountingObjectRemoved
   */
  public onCountingObjectRemoved( countingObject: CountingObject ): void {
    // TODO: same as CountingCommonScreenView.findCountingObjectNode https://github.com/phetsims/number-suite-common/issues/41
    const countingObjectNode = this.getCountingObjectNode( countingObject );

    // Remove listeners
    countingObjectNode.endDragEmitter.removeListener( this.dragFinishedListener );
    countingObject.endAnimationEmitter.removeListener( this.animationFinishedListener );

    delete this.countingObjectNodeMap[ countingObjectNode.countingObject.id ];
    this.closestDragForwardingListener.removeDraggableItem( countingObjectNode );
    countingObjectNode.dispose();
  }

  /**
   * Given a CountingObject, get the current view (CountingObjectNode) of it.
   * TODO: Duplication, https://github.com/phetsims/number-suite-common/issues/41
   */
  public getCountingObjectNode( countingObject: CountingObject ): CountingObjectNode {
    const result = this.countingObjectNodeMap[ countingObject.id ];
    assert && assert( result, 'Did not find matching Node' );
    return result;
  }

  /**
   * When the user drops a countingObject they were dragging, try to do the following things in order:
   * 1. See if there's any tenFrames underneath the dropped countingObject that should be added to.
   * 2. See if there's any countingObjects underneath the dropped countingObject that should either be combined with or
   *    moved away from.
   *
   * The implementation of checking for tenFrames first matches the current design, but a new or changed design could
   * require a different order of checking.
   */
  public handleDroppedCountingObject( draggedCountingObject: CountingObject ): void {
    if ( this.tryToAddToTenFrame( draggedCountingObject ) ) {
      return;
    }

    // TODO: duplication https://github.com/phetsims/number-suite-common/issues/41
    const draggedNode = this.getCountingObjectNode( draggedCountingObject );

    // TODO: semi-duplication https://github.com/phetsims/number-suite-common/issues/41
    // remove any countingObjects that aren't included in the sum - these are already on their way back to the creatorNode and
    // should not be tried to combined with. return if no countingObjects are left or if the draggedCountingObject is not
    // included in the sum
    const allCountingObjectNodes = _.filter( this.countingObjectLayerNode.children,
      child => child instanceof CountingObjectNode && child.countingObject.includeInSumProperty.value ) as CountingObjectNode[];

    if ( allCountingObjectNodes.length === 0 || !draggedCountingObject.includeInSumProperty.value ) {
      return;
    }

    // TODO: duplication https://github.com/phetsims/number-suite-common/issues/41
    const droppedNodes = draggedNode.findAttachableNodes( allCountingObjectNodes );

    // TODO: duplication https://github.com/phetsims/number-suite-common/issues/41
    // Check them in reverse order (the one on the top should get more priority)
    droppedNodes.reverse();

    for ( let i = 0; i < droppedNodes.length; i++ ) {
      const droppedNode = droppedNodes[ i ];
      const droppedCountingObject = droppedNode.countingObject;

      // if grouping is turned off, repel away
      if ( !this.countingArea.groupingEnabledProperty.value || !droppedCountingObject.groupingEnabledProperty.value ) {
        if ( draggedCountingObject.positionProperty.value.distance( droppedCountingObject.positionProperty.value ) < COUNTING_OBJECT_REPEL_WHEN_CLOSER_THAN ) {
          this.countingArea.repelAway( this.countingAreaBoundsProperty.value, draggedCountingObject, droppedCountingObject, () => {
            return {
              left: -COUNTING_OBJECT_REPEL_DISTANCE,
              right: COUNTING_OBJECT_REPEL_DISTANCE
            };
          } );
        }
      }
      else {
        // TODO: duplication https://github.com/phetsims/number-suite-common/issues/41
        // allow any two numbers to be combined
        this.countingArea.collapseNumberModels( this.countingAreaBoundsProperty.value, draggedCountingObject, droppedCountingObject );
        return; // No need to re-layer or try combining with others
      }
    }
  }

  /**
   * Returns whether we were able to add the countingObject to a tenFrame. If true, it also adds the countingObject
   * to the tenFrame.
   */
  private tryToAddToTenFrame( droppedCountingObject: CountingObject ): boolean {
    if ( !this.countingArea.tenFrames ) {
      return false;
    }

    const droppedCountingObjectNode = this.getCountingObjectNode( droppedCountingObject );
    const allDraggableTenFrameNodes = _.filter( this.countingObjectLayerNode.children,
      child => child instanceof DraggableTenFrameNode ) as DraggableTenFrameNode[];

    const droppedNodeCountingType = droppedCountingObjectNode.countingObjectTypeProperty.value;

    if ( !allDraggableTenFrameNodes.length ) {
      return false;
    }

    const tenFrameNode = this.findAttachableTenFrameNode( droppedCountingObjectNode, allDraggableTenFrameNodes );

    // If we found a tenFrame underneath this countingObject
    if ( tenFrameNode ) {

      // If this countingObject is not already in a tenFrame
      if ( !this.isCountingObjectContainedByTenFrame( droppedCountingObject ) ) {

        const tenFrame = tenFrameNode.tenFrame;

        // If the countingObject and tenFrame have the same countingObjectType
        let tenFrameSharesCountingObjectType = false;

        if ( tenFrame.countingObjects.lengthProperty.value > 0 ) {
          tenFrameSharesCountingObjectType = this.countingArea.countingObjects.includes( tenFrame.countingObjects[ 0 ] );
        }

        // Paper number cannot be added to tenFrames anyways.
        const noCountingObjectsInTenFrame = !tenFrame.countingObjects.lengthProperty.value &&
                                            droppedNodeCountingType !== CountingObjectType.PAPER_NUMBER;

        // Add only similar object types, or non paper-numbers if tenFrame is empty
        const shouldAdd = tenFrameSharesCountingObjectType || noCountingObjectsInTenFrame;

        // Push away objects when the tenFrame is full
        if ( !tenFrame.isFull() && shouldAdd ) {
          tenFrame.addCountingObject( droppedCountingObject );
        }
        else {
          tenFrame.pushAwayCountingObject( droppedCountingObject, this.countingAreaBoundsProperty.value );
        }
      }
      return true;
    }
    else {
      return false;
    }
  }

  /**
   * Is the provided countingObject already in a tenFrame.
   */
  private isCountingObjectContainedByTenFrame( countingObject: CountingObject ): boolean {
    let isContained = false;
    this.countingArea.tenFrames?.forEach( tenFrame => {
      if ( tenFrame.containsCountingObject( countingObject ) ) {
        isContained = true;
      }
    } );

    return isContained;
  }

  /**
   * Given the countingObjectNode and an array of DraggableTenFrameNodes, return the highest TenFrameNode that the
   * countingObjectNode is on top of, if any (or null if none are found). This relies on the assumption that the
   * DraggableTenFrameNodes provided are currently children of a Node layer.
   */
  private findAttachableTenFrameNode( countingObjectNode: CountingObjectNode,
                                      allDraggableTenFrameNodes: DraggableTenFrameNode[] ): DraggableTenFrameNode | null {
    const tenFrameNodeCandidates = allDraggableTenFrameNodes.slice();

    // Find all DraggableTenFrameNodes that are underneath the dropped countingObjectNode.
    const unorderedAttachableTenFrameNodes = tenFrameNodeCandidates.filter( tenFrameNode => {
      return tenFrameNode.tenFrame.isCountingObjectOnTopOf( countingObjectNode.countingObject );
    } );

    let attachableTenFrameNode = null;

    // Select the top attachable TenFrameNode, if any were attachable from above.
    if ( unorderedAttachableTenFrameNodes ) {
      attachableTenFrameNode = _.maxBy( unorderedAttachableTenFrameNodes, attachableTenFrameNode => {
        return attachableTenFrameNode.parent!.indexOfChild( attachableTenFrameNode );
      } )!;
    }

    return attachableTenFrameNode;
  }

  /**
   * Make sure all countingObjects are within the availableViewBounds
   * TODO: Duplication, https://github.com/phetsims/number-suite-common/issues/41
   */
  private constrainAllPositions(): void {
    this.countingArea.countingObjects.forEach( ( countingObject: CountingObject ) => {
      countingObject.setConstrainedDestination( this.countingAreaBoundsProperty.value, countingObject.positionProperty.value );
    } );
  }

  /**
   * Whether the countingObject is predominantly over the explore panel (should be collected).
   */
  private isNumberInReturnZone( countingObject: CountingObject ): boolean {
    const parentBounds = this.getCountingObjectNode( countingObject ).bounds;

    // And the bounds of our panel
    const panelBounds = this.returnZoneProperty ? this.returnZoneProperty.value : this.countingObjectCreatorPanel.bounds;

    return panelBounds.intersectsBounds( parentBounds );
  }

  /**
   * Called when a countingObject has finished animating to its destination.
   */
  private onNumberAnimationFinished( countingObject: CountingObject ): void {

    // If it animated to the return zone, it's probably split and meant to be returned.
    if ( this.countingArea.countingObjects.includes( countingObject ) && this.isNumberInReturnZone( countingObject ) ) {
      if ( countingObject.includeInSumProperty.value ) {
        this.onNumberDragFinished( countingObject );
      }
      else {
        const countingObjectValue = countingObject.numberValueProperty.value;
        this.countingArea.removeCountingObject( countingObject );

        // see if the creator node should show any hidden targets since a counting object was just returned
        this.countingObjectCreatorPanel.countingCreatorNode.validateVisibilityForTargetsForDecreasingSum( countingObjectValue );
      }
    }
    else if ( !this.viewHasIndependentModel ) {

      // if this view is running off of a shared model, then if a countingObject has already been removed from the model,
      // check if creator node should be updated
      const countingObjectValue = countingObject.numberValueProperty.value;
      this.countingObjectCreatorPanel.countingCreatorNode.validateVisibilityForTargetsForDecreasingSum( countingObjectValue );
    }
  }

  /**
   * Called when a countingObject has finished being dragged.
   */
  private onNumberDragFinished( countingObject: CountingObject ): void {

    if ( !this.includeCountingObjectCreatorPanel ) {
      return;
    }

    // Return it to the panel if it's been dropped in the panel.
    if ( this.isNumberInReturnZone( countingObject ) ) {
      countingObject.includeInSumProperty.value = false;
      this.countingArea.calculateTotal();

      // Set its destination to the proper target (with the offset so that it will disappear once centered).
      let targetPosition = this.countingObjectCreatorPanel.countingCreatorNode.getOriginPosition();
      targetPosition = targetPosition.minus( countingObject.returnAnimationBounds.center );
      const targetScale = countingObject.groupingEnabledProperty.value ? NumberSuiteCommonConstants.GROUPED_STORED_COUNTING_OBJECT_SCALE :
                          NumberSuiteCommonConstants.UNGROUPED_STORED_COUNTING_OBJECT_SCALE;
      countingObject.setDestination( targetPosition, true, {
        targetScale: targetScale,
        targetHandleOpacity: 0
      } );
    }
  }

  /**
   * Creates a serialization of the countingObjects in the model. This includes the position, value, and z-index of the
   * countingObjects.
   */
  public getSerializedCountingObjectsIncludedInSum(): CountingObjectSerialization[] {
    const countingObjectsIncludedInSum = this.countingArea.getCountingObjectsIncludedInSum();

    const countingObjectPositions: CountingObjectSerialization[] = [];
    countingObjectsIncludedInSum.forEach( countingObject => {
      const countingObjectZIndex = this.countingObjectLayerNode.children.indexOf( this.getCountingObjectNode( countingObject ) );
      assert && assert( countingObjectZIndex >= 0,
        `countingObject's corresponding Node not in countingObjectLayerNode: ${countingObjectZIndex}` );

      countingObjectPositions.push( {
        position: countingObject.positionProperty.value,
        numberValue: countingObject.numberValueProperty.value,
        zIndex: countingObjectZIndex
      } );
    } );

    return countingObjectPositions;
  }
}

numberSuiteCommon.register( 'CountingAreaNode', CountingAreaNode );
export default CountingAreaNode;
