// Copyright 2021-2023, University of Colorado Boulder

/**
 * Node that can display a 1, 10, 100, or other style of single countingObject which can be clicked/dragged to create
 * countingObjects. Factored out from ExplorePanel.js in make-a-ten, see https://github.com/phetsims/number-play/issues/19
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BaseNumber from '../../../../counting-common/js/common/model/BaseNumber.js';
import CountingObject from '../../../../counting-common/js/common/model/CountingObject.js';
import BaseNumberNode from '../../../../counting-common/js/common/view/BaseNumberNode.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Node, NodeOptions, PressListenerEvent } from '../../../../scenery/js/imports.js';
import countingCommon from '../../countingCommon.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import CountingObjectType from '../model/CountingObjectType.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TEmitter from '../../../../axon/js/TEmitter.js';

type SelfOptions = {

  // the type of our countingObject being displayed
  countingObjectTypeProperty?: TReadOnlyProperty<CountingObjectType>;

  // whether grouping is enabled for the displayed countingObject
  groupingEnabledProperty?: TReadOnlyProperty<boolean>;

  // the scale of the targetNode when grouping is turned on
  groupedTargetScale?: number;

  // the scale of the targetNode when grouping is turned off
  ungroupedTargetScale?: number;

  // the offset of the backTargetNode compared to the frontTargetNode
  backTargetOffset?: Vector2;

  // Set for touch and mouse areas
  pointerAreaXDilation?: number;
  pointerAreaYDilation?: number;
  pointerAreaXShift?: number;
};
type CountingCreatorNodeOptions = SelfOptions & NodeOptions;

class CountingCreatorNode extends Node {

  // The value that a countingObject has when created from this CountingCreatorNode.
  private readonly creatorNumberValue: number;

  // The Node in which the created countingObjects are positioned in.
  private coordinateFrameNode: Node;

  // The Node that can receive input for creating a countingObject.
  private readonly targetNode: Node;

  // The sum of the countingObjects in the countingArea.
  private readonly sumProperty: TReadOnlyProperty<number>;

  // When the sum is growing, when the sum has reached (equals) this number, we turn off the frontTarget visibility.
  // When the sum is decreasing, when we have reached this number, we turn on the backTarget visibility.
  // Example: For a maxSum of 10 and a creatorNumberValue of 1, this number is 9.
  private readonly frontTargetVisibilitySum: number;

  // When the sum is growing, when the sum has reached (equals) this number, we turn off the backTarget visibility.
  // When the sum is decreasing, when we have reached this number, we turn on the frontTarget visibility.
  // Example: For a maxSum of 10 and a creatorNumberValue of 1, this number is 8.
  private readonly backTargetVisibilitySum: number;

  // The offset of the backTargetNode compared to the frontTargetNode.
  private readonly backTargetOffset: Vector2;

  // Of the two-stack that makes up the targetNode, this is the countingObjectNode in the back.
  private backTargetNode: Node;

  // Of the two-stack that makes up the targetNode, this is the countingObjectNode in the front.
  private frontTargetNode: Node;

  // The highest possible sum of the countingArea. This CountingCreatorNode cannot create countingObjects with a sum
  // greater than this number.
  private readonly maxSum: number;

  public constructor( place: number,
                      coordinateFrameNode: Node,
                      sumProperty: NumberProperty,
                      resetEmitter: TEmitter,
                      addAndDragCountingObject: ( event: PressListenerEvent, countingObject: CountingObject ) => void,
                      providedOptions?: CountingCreatorNodeOptions ) {

    const options = optionize<CountingCreatorNodeOptions, SelfOptions, NodeOptions>()( {
      countingObjectTypeProperty: new EnumerationProperty( CountingObjectType.PAPER_NUMBER ),
      groupingEnabledProperty: new BooleanProperty( true ),
      groupedTargetScale: 0.65,
      ungroupedTargetScale: 1,
      backTargetOffset: new Vector2( -9, -9 ),

      pointerAreaXDilation: 15,
      pointerAreaYDilation: 5,
      pointerAreaXShift: 0
    }, providedOptions );

    super( options );

    this.creatorNumberValue = Math.pow( 10, place );

    this.coordinateFrameNode = coordinateFrameNode;

    this.sumProperty = sumProperty;

    this.maxSum = sumProperty.range.max;

    this.frontTargetVisibilitySum = this.maxSum - this.creatorNumberValue;
    this.backTargetVisibilitySum = this.frontTargetVisibilitySum - this.creatorNumberValue;

    this.backTargetOffset = options.backTargetOffset;

    this.backTargetNode = new Node();
    this.frontTargetNode = new Node();

    this.targetNode = new Node( {
      cursor: 'pointer',
      children: [ this.backTargetNode, this.frontTargetNode ]
    } );
    this.addChild( this.targetNode );

    /**
     * Creates a target that represents the frontTargetNode or backTargetNode.
     */
    const createSingleTargetNode = ( offset: Vector2 ): Node => {
      const targetNode = new Node();

      targetNode.addChild( this.createBaseNumberNode( place, options.countingObjectTypeProperty, options.groupingEnabledProperty ) );
      const scale = options.groupingEnabledProperty.value ? options.groupedTargetScale : options.ungroupedTargetScale;
      targetNode.scale( scale );

      targetNode.translation = offset;
      return targetNode;
    };

    // When the countingObjectType or groupingEnabled state changes, redraw the front and back targets to match their
    // new state.
    Multilink.multilink( [ options.countingObjectTypeProperty, options.groupingEnabledProperty ],
      ( countingObjectType, groupingEnabled ) => {

        // Record what the visibility of the target nodes was before re-creating them.
        const backTargetNodeVisible = this.backTargetNode.visible;
        const frontTargetNodeVisible = this.frontTargetNode.visible;

        // Create the new target nodes.
        this.backTargetNode = createSingleTargetNode( options.backTargetOffset );
        this.frontTargetNode = createSingleTargetNode( Vector2.ZERO );

        // Set the new target nodes to their correct visibility states.
        this.backTargetNode.visible = backTargetNodeVisible;
        this.frontTargetNode.visible = frontTargetNodeVisible;

        // Swap in the new target nodes and dilate the touch area accordingly.
        this.targetNode.children = [ this.backTargetNode, this.frontTargetNode ];

        const pointerArea = this.targetNode.localBounds
          .dilatedXY( options.pointerAreaXDilation, options.pointerAreaYDilation )
          .shiftedX( options.pointerAreaXShift );
        this.targetNode.touchArea = pointerArea;
        this.targetNode.mouseArea = pointerArea;

        this.targetNode.inputEnabled = backTargetNodeVisible || frontTargetNodeVisible;

        // Recenter ourselves after we change the bounds of the front and back targets
        if ( options.center ) {
          this.center = options.center;
        }
      } );

    // See if targets should be made invisible when the sum increases.
    sumProperty.lazyLink( this.validateVisibilityForTargetsForIncreasingSum.bind( this ) );

    // Add an input listener on the targetNode for creating countingObjects.
    this.targetNode.addInputListener( {
      down: ( event: PressListenerEvent ) => {
        if ( !event.canStartPress() ) { return; }

        // We want this relative to coordinateFrameNode, so it is guaranteed to be the proper view coordinates.
        const viewPosition = coordinateFrameNode.globalToLocalPoint( event.pointer.point );
        const countingObject = new CountingObject( this.creatorNumberValue, new Vector2( 0, 0 ), {
          groupingEnabledProperty: options.groupingEnabledProperty
        } );

        // Once we have the number's bounds, we set the position so that our pointer is in the middle of the drag target.
        countingObject.setDestination( viewPosition.minus( countingObject.getDragTargetOffset() ), false );

        // Create and start dragging the new paper number node
        addAndDragCountingObject( event, countingObject );
      }
    } );

    // Reset the targets visibility and inputEnabled when the sim is reset..
    resetEmitter.addListener( () => {
      this.backTargetNode.visible = true;
      this.frontTargetNode.visible = true;
      this.targetNode.inputEnabled = true;
    } );
  }

  /**
   * Check if either target should be made invisible, only for cases where the sum is increasing. Decreasing sum is
   * handled separately because of animations of the countingObjects.
   */
  private validateVisibilityForTargetsForIncreasingSum( sum: number, oldSum: number ): void {
    if ( sum === oldSum + this.creatorNumberValue ) {
      if ( sum === this.frontTargetVisibilitySum ) {
        this.frontTargetNode.visible = false;
      }
      else if ( sum === this.maxSum ) {
        this.backTargetNode.visible = false;
        this.targetNode.inputEnabled = false;
      }
    }
  }

  /**
   * Checks if either the backTargetNode or frontTargetNode should be made visible again, based on the state of their
   * current visibility and the sum.
   */
  public validateVisibilityForTargetsForDecreasingSum( returnedNumberValue: number ): void {
    for ( let i = 0; i < returnedNumberValue / this.creatorNumberValue; i++ ) {
      if ( !this.backTargetNode.visible && this.sumProperty.value <= this.frontTargetVisibilitySum ) {
        this.backTargetNode.visible = true;
        this.targetNode.inputEnabled = true;
      }
      else if ( !this.frontTargetNode.visible && this.sumProperty.value <= this.backTargetVisibilitySum ) {
        this.frontTargetNode.visible = true;
      }
    }
  }

  /**
   * Returns the view coordinates of the target.
   */
  public getOriginPosition(): Vector2 {

    // Trail to coordinateFrameNode, not including the coordinateFrameNode.
    const trail = this.coordinateFrameNode.getUniqueLeafTrailTo( this.targetNode ).slice( 1 );

    const origin = this.sumProperty.value <= this.backTargetVisibilitySum ?
                   this.frontTargetNode.localBounds.center :
                   this.frontTargetNode.localBounds.center.plus( this.backTargetOffset );

    // Transformed to view coordinates.
    return trail.localToGlobalPoint( origin );
  }

  /**
   * Returns a BaseNumberNode to be used as the target icon.
   */
  private createBaseNumberNode( place: number,
                                countingObjectTypeProperty: TReadOnlyProperty<CountingObjectType>,
                                groupingEnabledProperty: TReadOnlyProperty<boolean> ): BaseNumberNode {

    return new BaseNumberNode( new BaseNumber( 1, place ), 1, {
      includeHandles: false,
      countingObjectType: countingObjectTypeProperty.value,
      groupingEnabled: groupingEnabledProperty.value
    } );
  }
}

countingCommon.register( 'CountingCreatorNode', CountingCreatorNode );
export default CountingCreatorNode;
