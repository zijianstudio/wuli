// Copyright 2013-2022, University of Colorado Boulder

/**
 * A drag handler for something that is movable and constrained to some (optional) bounds.
 * Copied from ph-scale\js\common\view\MovableDragHandler.js
 * Changes:
 * 1. Removed model view transform, this assumes nodes are moved directly
 * 2. Removed movable API, this class just moves nodes directly
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { SimpleDragHandler } from '../../../../scenery/js/imports.js';
import fractionComparison from '../../fractionComparison.js';

/**
 * @deprecated - please use DragListener for new code
 */
class NodeDragHandler extends SimpleDragHandler {

  /**
   * @param {Node} node
   * @param {Object} [options]
   */
  constructor( node, options ) {

    options = merge( {
      startDrag: () => {},
      drag: () => {},
      endDrag: () => { /* do nothing */ }  // use this to do things at the end of dragging, like 'snapping'
    }, options );

    let startOffset; // where the drag started, relative to the Movable's origin, in parent view coordinates

    super( {

      allowTouchSnag: true,

      // note where the drag started
      start: event => {
        startOffset = event.currentTarget.globalToParentPoint( event.pointer.point ).minusXY( node.x, node.y );
        options.startDrag();
      },

      // change the position, adjust for starting offset, constrain to drag bounds
      drag: event => {
        const parentPoint = event.currentTarget.globalToParentPoint( event.pointer.point ).minus( startOffset );
        const constrainedPosition = constrainBounds( parentPoint, options.dragBounds );
        node.setTranslation( constrainedPosition );
        options.drag( event );
      },

      end: event => {
        options.endDrag( event );
      }
    } );
  }
}

fractionComparison.register( 'NodeDragHandler', NodeDragHandler );

/**
 * Constrains a point to some bounds.
 * @param {Vector2} point
 * @param {Bounds2} bounds
 */
const constrainBounds = ( point, bounds ) => {
  if ( _.isUndefined( bounds ) || bounds.containsCoordinates( point.x, point.y ) ) {
    return point;
  }
  else {
    const xConstrained = Math.max( Math.min( point.x, bounds.maxX ), bounds.x );
    const yConstrained = Math.max( Math.min( point.y, bounds.maxY ), bounds.y );
    return new Vector2( xConstrained, yConstrained );
  }
};

export default NodeDragHandler;
