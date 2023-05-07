// Copyright 2020-2022, University of Colorado Boulder

/**
 * ChipStackNode is the view representation of a ValueItem that is intended to look like a stack of game (e.g. poker)
 * chips, with the size of the stack being dependent upon the value of the item being represented.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Circle, Color, DragListener, LinearGradient, Node, Path, Text } from '../../../../scenery/js/imports.js';
import numberLineOperations from '../../numberLineOperations.js';

// constants
const CHIP_RADIUS = 23;
const STACKING_STAGGER_AMOUNT = new Vector2( -2, 2 );
const SHADOW_OFFSET = new Vector2( 5, 5 );
const DRAG_OFFSET = new Vector2( 0, -CHIP_RADIUS * 0.75 );

class ChipStackNode extends Node {

  /**
   * @param {ValueItem} valueItem
   */
  constructor( valueItem ) {

    assert && assert(
    valueItem.value >= -5 && valueItem.value <= 5 && valueItem.value !== 0,
      `cannot represent item with value ${valueItem.value}`
    );

    const chipFill = valueItem.value > 0 ? Color.YELLOW : Color.RED;
    const nextChipCenter = STACKING_STAGGER_AMOUNT.timesScalar( Math.abs( valueItem.value ) - 1 );

    // Add the layer where the chips will reside.
    const chipsLayer = new Node();

    // Create a shape that will be used to create the shadow.
    let shadowShape = null;

    // Create the chips and their shadows and add them to their respective layers.
    let topChip = null;
    _.times( Math.abs( valueItem.value ), () => {
      const chip = new Circle( CHIP_RADIUS, {
        fill: chipFill,
        stroke: Color.BLACK,
        center: nextChipCenter
      } );
      chipsLayer.addChild( chip );
      topChip = chip;

      // Add the next portions of the shadow shape.
      if ( shadowShape ) {
        shadowShape = shadowShape.shapeUnion( Shape.circle( nextChipCenter.x, nextChipCenter.y, CHIP_RADIUS ) );
      }
      else {
        shadowShape = Shape.circle( nextChipCenter.x, nextChipCenter.y, CHIP_RADIUS );
      }

      // Adjust the position where the next chip will go.
      nextChipCenter.subtract( STACKING_STAGGER_AMOUNT );
    } );

    // Add the label to the top chip on the stack.
    const signChar = valueItem.value > 0 ? '+' : '';
    const labelNode = new Text(
      signChar + valueItem.value,
      {
        font: new PhetFont( 22 ),
        center: Vector2.ZERO
      }
    );
    topChip.addChild( labelNode );

    // Create the shadow from the shape.
    const vectorToShadowEdge = SHADOW_OFFSET.copy().setMagnitude( CHIP_RADIUS );
    const shadowNode = new Path( shadowShape, {
      fill: new LinearGradient( shadowShape.bounds.centerX, shadowShape.bounds.centerY, vectorToShadowEdge.x, vectorToShadowEdge.y )
        .addColorStop( 0.5, new Color( 20, 20, 20, 0.4 ) )
        .addColorStop( 1, new Color( 80, 80, 80, 0.2 ) )
    } );

    super( {
      children: [ shadowNode, chipsLayer ],
      cursor: 'pointer'
    } );

    // Move the shadow into position and make it visible when this item is being dragged.  No unlink is needed.
    valueItem.isDraggingProperty.link( isDragging => {
      shadowNode.visible = isDragging;
      if ( isDragging ) {
        shadowNode.translation = SHADOW_OFFSET;
      }
      else {
        shadowNode.translation = Vector2.ZERO;
      }
    } );

    // Prevent this node from being grabbed when animating, unlink not necessary.
    valueItem.inProgressAnimationProperty.link( inProgressAnimation => {
      this.pickable = inProgressAnimation === null;
    } );

    // drag handler
    this.addInputListener( new DragListener( {

      dragBoundsProperty: new Property( this.layoutBounds ),

      start: event => {
        valueItem.isDraggingProperty.value = true;
        valueItem.teleportTo( this.eventToPosition( event ) );
        this.moveToFront(); // move to the front of the z-order in whatever layer this node is in
      },

      drag: event => {
        valueItem.teleportTo( this.eventToPosition( event ) );
      },

      end: () => {
        valueItem.isDraggingProperty.value = false;
      }
    } ) );

    // Position this node based on the model element position.  Note that there is no model-view transform, since we are
    // using the same coordinate system in both the model and view.  No unlink is needed.
    valueItem.positionProperty.link( position => {
      this.center = position;
    } );
  }

  /**
   * Convert a drag event to a position in model space.
   * @param {SceneryEvent} event
   * @returns {Vector2}
   * @private
   */
  eventToPosition( event ) {

    // pointer position in parent coordinates
    const parentPoint = this.globalToParentPoint( event.pointer.point );

    return parentPoint.plus( DRAG_OFFSET );
  }
}

numberLineOperations.register( 'ChipStackNode', ChipStackNode );
export default ChipStackNode;