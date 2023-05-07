// Copyright 2013-2022, University of Colorado Boulder

/**
 * A node that represents a stack of bricks in the view.
 *
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Text } from '../../../../scenery/js/imports.js';
import balancingAct from '../../balancingAct.js';
import BalancingActStrings from '../../BalancingActStrings.js';
import BAQueryParameters from '../BAQueryParameters.js';
import ColumnState from '../model/ColumnState.js';
import MassDragHandler from './MassDragHandler.js';

const kgString = BalancingActStrings.kg;
const unknownMassLabelString = BalancingActStrings.unknownMassLabel;

// constants
const LABEL_FONT = new PhetFont( 12 );

class BrickStackNode extends Node {

  /**
   * @param {BrickStack} brickStack
   * @param {ModelViewTransform2} modelViewTransform
   * @param {boolean} isLabeled
   * @param {Property} labelVisibleProperty
   * @param {boolean} draggable
   * @param {EnumerationDeprecatedProperty.<ColumnState>} columnStateProperty
   */
  constructor( brickStack, modelViewTransform, isLabeled, labelVisibleProperty, draggable, columnStateProperty ) {
    super( { cursor: 'pointer' } );

    BAQueryParameters.stanford && columnStateProperty.link( columnState => {
      this.cursor = columnState === ColumnState.DOUBLE_COLUMNS ? 'pointer' : 'default';
      this.pickable = columnState === ColumnState.DOUBLE_COLUMNS;
    } );
    this.brickStack = brickStack;
    this.modelViewTransform = modelViewTransform;
    this.previousAngle = 0;

    // Create and add the main shape node.
    const transformedBrickShape = modelViewTransform.modelToViewShape( brickStack.shape );
    const shapeNode = new Path( transformedBrickShape, {
      fill: 'rgb( 205, 38, 38 )',
      stroke: 'black',
      lineWidth: 1,
      touchArea: transformedBrickShape.bounds.dilatedY( 10 )
    } );
    this.addChild( shapeNode );

    // Create and add the mass label.
    if ( isLabeled ) {
      let massLabel;
      const maxTextWidth = shapeNode.bounds.width;
      if ( brickStack.isMystery ) {
        massLabel = new Text( unknownMassLabelString, {
          font: LABEL_FONT,
          maxWidth: maxTextWidth
        } );
      }
      else {

        // NOTE: The MultiLineText node was tried for this, but the spacing looked bad.
        massLabel = new Node();
        const massValueText = new Text(
          brickStack.massValue,
          {
            font: LABEL_FONT,
            centerX: 0,
            maxWidth: maxTextWidth
          }
        );
        massLabel.addChild( massValueText );
        massLabel.addChild( new Text(
          kgString,
          {
            font: LABEL_FONT,
            centerX: 0,
            top: massValueText.bottom - 4,
            maxWidth: maxTextWidth
          } )
        );
      }
      massLabel.centerX = shapeNode.centerX;
      massLabel.bottom = shapeNode.top - 1;
      this.addChild( massLabel );

      // Control label visibility.
      labelVisibleProperty.link( visible => {
        massLabel.visible = visible;
      } );
    }

    // Set initial position and record so deltas can be subsequently used. This helps minimize transformation when
    // moving the items.

    let offsetToBottom = new Vector2( 0, -this.height / 2 );
    let previousRotationAngle = 0;

    // Monitor the brick stack for position and angle changes.
    brickStack.rotationAngleProperty.link( newAngle => {
      this.rotateAround( this.center.plus( offsetToBottom ), previousRotationAngle - newAngle );
      offsetToBottom = offsetToBottom.rotated( previousRotationAngle - newAngle );
      previousRotationAngle = newAngle;
    } );
    brickStack.positionProperty.link( newPosition => {
      this.center = modelViewTransform.modelToViewPosition( newPosition ).plus( offsetToBottom );
    } );

    // Make this non-pickable when animating so that users can't grab it mid-flight.
    brickStack.animatingProperty.link( animating => {
      this.pickable = !animating;
    } );

    // Add the drag handler if this is intended to be draggable.
    if ( draggable ) {

      // @public (read-only) {MassDragHandler} - drag handler, made available for use by creator nodes
      this.dragHandler = new MassDragHandler( brickStack, modelViewTransform );

      this.addInputListener( this.dragHandler );
    }
  }
}

balancingAct.register( 'BrickStackNode', BrickStackNode );

export default BrickStackNode;