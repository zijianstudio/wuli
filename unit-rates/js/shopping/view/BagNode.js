// Copyright 2017-2023, University of Colorado Boulder

/**
 * View of a shopping bag.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Image } from '../../../../scenery/js/imports.js';
import URConstants from '../../common/URConstants.js';
import unitRates from '../../unitRates.js';
import BagDragListener from './BagDragListener.js';

export default class BagNode extends Image {

  /**
   * @param {Bag} bag
   * @param {Shelf} shelf
   * @param {Scale} scale
   * @param {Node} bagLayer
   * @param {Node} dragLayer
   */
  constructor( bag, shelf, scale, bagLayer, dragLayer ) {

    // This type does not propagate options to the supertype because the model determines position.
    super( bag.image, {
      scale: URConstants.BAG_IMAGE_SCALE,
      cursor: 'pointer'
    } );

    // origin is at bottom center
    const positionObserver = position => {
      this.centerX = position.x;
      this.bottom = position.y;
    };
    bag.positionProperty.link( positionObserver ); // unlink in dispose

    const visibleObserver = visible => {
      this.visible = visible;
    };
    bag.visibleProperty.link( visibleObserver ); // unlink in dispose

    const dragListener = new BagDragListener( this, bag, shelf, scale, bagLayer, dragLayer );
    this.addInputListener( dragListener ); // removeInputListener in dispose

    // @private
    this.disposeBagNode = () => {
      bag.positionProperty.unlink( positionObserver );
      bag.visibleProperty.unlink( visibleObserver );
      this.removeInputListener( dragListener );
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeBagNode();
    super.dispose();
  }
}

unitRates.register( 'BagNode', BagNode );