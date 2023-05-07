// Copyright 2018-2022, University of Colorado Boulder

/**
 * An HBox of stack views, with logic for proper alignment and mouse/touch areas.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { DragListener, HBox, Node } from '../../../../scenery/js/imports.js';
import fractionsCommon from '../../fractionsCommon.js';
import NumberGroupStack from '../model/NumberGroupStack.js';
import NumberStack from '../model/NumberStack.js';
import ShapeGroupStack from '../model/ShapeGroupStack.js';
import ShapeStack from '../model/ShapeStack.js';
import NumberGroupStackNode from './NumberGroupStackNode.js';
import NumberStackNode from './NumberStackNode.js';
import ShapeGroupStackNode from './ShapeGroupStackNode.js';
import ShapeStackNode from './ShapeStackNode.js';

class StackNodesBox extends HBox {
  /**
   * @param {Array.<Stack>} stacks
   * @param {function} pressCallback - function( {SceneryEvent}, {Stack} ) - Called when a press is started.
   * @param {Object} [options]
   */
  constructor( stacks, pressCallback, options ) {
    options = merge( {
      padding: 20
    }, options );

    super( {
      spacing: options.padding
    } );

    // @private {Array.<StackNode>}
    this.stackNodes = stacks.map( stack => {
      if ( stack instanceof NumberStack ) {
        return new NumberStackNode( stack );
      }
      else if ( stack instanceof ShapeStack ) {
        return new ShapeStackNode( stack );
      }
      else if ( stack instanceof NumberGroupStack ) {
        return new NumberGroupStackNode( stack );
      }
      else if ( stack instanceof ShapeGroupStack ) {
        return new ShapeGroupStackNode( stack );
      }
      else {
        throw new Error( 'Unknown stack' );
      }
    } );

    // @private {Array.<function>} - For disposal
    this.lengthListeners = [];

    // @private {Array.<Node>} - We want to create custom-area targets for each stack that when clicked will activate
    // the "press" of the stack.
    this.stackTargets = this.stackNodes.map( stackNode => {
      const stackTarget = new Node( {
        children: [ stackNode ],
        cursor: 'pointer',
        inputListeners: [ DragListener.createForwardingListener( event => pressCallback( event, stackNode.stack ) ) ]
      } );
      stackTarget.layoutBounds = stackNode.localToParentBounds( stackNode.layoutBounds );

      // Shouldn't be pickable when it has no elements.
      const lengthListener = length => {
        stackTarget.pickable = length === 0 ? false : null;
      };
      this.lengthListeners.push( lengthListener );
      stackNode.stack.array.lengthProperty.link( lengthListener );

      return stackTarget;
    } );

    // Apply appropriate mouse/touch areas
    const maxHalfHeight = _.max( this.stackTargets.map( stackTarget => {
      return Math.max( Math.abs( stackTarget.layoutBounds.minY ), Math.abs( stackTarget.layoutBounds.maxY ) );
    } ) );
    this.stackTargets.forEach( node => {
      const layoutBounds = node.layoutBounds;
      assert && assert( layoutBounds.isValid() );
      const bounds = new Bounds2(
        -options.padding / 2 + layoutBounds.left,
        -maxHalfHeight,
        layoutBounds.right + options.padding / 2,
        maxHalfHeight
      );
      node.mouseArea = bounds;
      node.touchArea = bounds;

      // For layout, handle verticality
      node.localBounds = new Bounds2( layoutBounds.left, -maxHalfHeight, layoutBounds.right, maxHalfHeight );
    } );

    this.children = this.stackTargets;
  }

  /**
   * Sets the model positions of our model objects corresponding to their displayed (view) positions.
   * @public
   *
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Node} panel
   */
  updateModelPositions( modelViewTransform, panel ) {
    this.stackNodes.forEach( stackNode => {
      stackNode.stack.positionProperty.value = modelViewTransform.viewToModelPosition(
        stackNode.getUniqueTrailTo( panel ).localToGlobalPoint( Vector2.ZERO )
      );
    } );
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.stackNodes.forEach( ( stackNode, index ) => {
      stackNode.stack.array.lengthProperty.unlink( this.lengthListeners[ index ] );
      stackNode.dispose();
    } );

    super.dispose();
  }
}

fractionsCommon.register( 'StackNodesBox', StackNodesBox );
export default StackNodesBox;
