// Copyright 2018-2022, University of Colorado Boulder

/**
 * Superclass for Group views.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import { DragListener, Node, PressListener } from '../../../../scenery/js/imports.js';
import fractionsCommon from '../../fractionsCommon.js';
import Group from '../model/Group.js';

class GroupNode extends Node {
  /**
   * @param {Group} group
   * @param {Object} [options]
   */
  constructor( group, options ) {
    assert && assert( group instanceof Group );

    options = merge( {
      // {boolean} - For pieces placed in stacks/containers, we don't care about the positionProperty. In addition,
      // pieces in stacks/containers ALSO care about not showing up when the piece is user-controlled or animating.
      isIcon: false,

      // {ModelViewTransform2|null}
      modelViewTransform: null,

      // {boolean}
      positioned: true,

      // {function|null} - Listeners for if drag listeners are attached. Passed the pointer.
      dragListener: null,
      dropListener: null,
      selectListener: null,

      // {Property.<boolean>}
      isSelectedProperty: new BooleanProperty( true ) // takes ownership, will dispose at the end
    }, options );

    super();

    // @private {Group}
    this.group = group;

    // @private {boolean} - Whether this will just be a "read-only" icon, or a "read-write" view object
    this.isIcon = options.isIcon;

    // @private {ModelViewTransform2|null}
    this.modelViewTransform = options.modelViewTransform;

    // @private {Array.<*>}
    this.itemsToDispose = [];

    assert && assert( this.isIcon || this.modelViewTransform, 'Positioned GroupNodes need a MVT' );

    // @private {function}
    this.visibilityListener = isAnimating => {
      if ( !options.positioned ) {
        this.visible = !isAnimating;
      }
    };
    this.group.isAnimatingProperty.link( this.visibilityListener );

    // @private {Property.<boolean>}
    this.isSelectedProperty = options.isSelectedProperty;
    this.itemsToDispose.push( this.isSelectedProperty );

    // @private {Node}
    this.displayLayer = new Node( {
      cursor: 'pointer' // We are where our input listener is added
    } );
    this.addChild( this.displayLayer );

    // @private {Node}
    this.controlLayer = new Node();
    this.addChild( this.controlLayer );

    if ( !this.isIcon ) {
      // @private {function}
      this.positionListener = position => {
        this.translation = this.modelViewTransform.modelToViewPosition( position );
      };
      this.group.positionProperty.link( this.positionListener );

      // @private {function}
      this.scaleListener = scale => {
        this.setScaleMagnitude( scale );
      };
      this.group.scaleProperty.link( this.scaleListener );

      // Don't allow touching once we start animating
      // @private {function}
      this.isAnimatingListener = isAnimating => {
        this.pickable = !isAnimating;
      };
      this.group.isAnimatingProperty.link( this.isAnimatingListener );
    }
  }

  /**
   * Hooks up drag handling.
   * @protected
   *
   * @param {Property.<Bounds2>} dragBoundsProperty
   * @param {Object} [options] - The main options object
   */
  attachDragListener( dragBoundsProperty, options ) {

    let pointer = null;

    // @public {DragListener}
    this.dragListener = new DragListener( {
      targetNode: this,
      dragBoundsProperty: dragBoundsProperty,
      transform: this.modelViewTransform,
      positionProperty: this.group.positionProperty,
      start: ( event, listener ) => {
        pointer = listener.pointer;

        options.selectListener && options.selectListener( pointer );
        this.moveToFront();
      },
      drag: () => {
        options.dragListener && options.dragListener( pointer );
      },
      end: () => {
        options.dropListener && options.dropListener( pointer );
      }
    } );
    this.itemsToDispose.push( this.dragListener );
    this.displayLayer.addInputListener( this.dragListener );

    // @private {DragListener} - Listener for handling selection/release properly for the controls
    this.controlListener = new PressListener( {
      targetNode: this,
      press: ( event, listener ) => {
        pointer = listener.pointer;

        options.selectListener && options.selectListener( event.pointer );
      },
      release: event => {
        options.dropListener && options.dropListener( pointer );
      },
      attach: false
    } );
    this.itemsToDispose.push( this.controlListener );
    this.controlLayer.addInputListener( this.controlListener );
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.group.isAnimatingProperty.unlink( this.visibilityListener );
    this.positionListener && this.group.positionProperty.unlink( this.positionListener );
    this.scaleListener && this.group.scaleProperty.unlink( this.scaleListener );
    this.isAnimatingListener && this.group.isAnimatingProperty.unlink( this.isAnimatingListener );
    this.itemsToDispose.forEach( item => item.dispose() );

    super.dispose();
  }
}

fractionsCommon.register( 'GroupNode', GroupNode );
export default GroupNode;