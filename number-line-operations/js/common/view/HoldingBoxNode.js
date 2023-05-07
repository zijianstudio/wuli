// Copyright 2020-2021, University of Colorado Boulder

/**
 * HoldingBoxNode is the view representation of a box (i.e. a rectangle) where ValueItem instances are stored when not
 * in use.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { Rectangle } from '../../../../scenery/js/imports.js';
import numberLineOperations from '../../numberLineOperations.js';

// constants
const CORNER_RADIUS = 7;

class HoldingBoxNode extends Rectangle {

  /**
   * @param {HoldingBox} holdingBox - model of the storage box
   */
  constructor( holdingBox ) {

    super(
      holdingBox.rectangleBounds.minX,
      holdingBox.rectangleBounds.minY,
      holdingBox.rectangleBounds.width,
      holdingBox.rectangleBounds.height,
      CORNER_RADIUS,
      CORNER_RADIUS,
      {
        fill: 'white',
        stroke: 'black'
      }
    );
  }
}

numberLineOperations.register( 'HoldingBoxNode', HoldingBoxNode );
export default HoldingBoxNode;