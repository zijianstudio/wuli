// Copyright 2018-2022, University of Colorado Boulder

/**
 * Shows the boundaries of the draggable area for an ISLCObjec's center point. Adjusts with the radius of the object.
 * Currently only used in Gravity Force Lab Basics
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Multilink from '../../../axon/js/Multilink.js';
import merge from '../../../phet-core/js/merge.js';
import { Line, Node } from '../../../scenery/js/imports.js';
import inverseSquareLawCommon from '../inverseSquareLawCommon.js';

class ISLCDragBoundsNode extends Node {

  /**
   * @param       {ISLCModel} model
   * @param       {Bounds2} layoutBounds
   * @param       {ModelViewTransform2} modelViewTransform
   * @param       {Object} [options]
   */
  constructor( model, layoutBounds, modelViewTransform, options ) {

    options = merge( {
      lineWidth: 2,
      object1Stroke: 'blue',
      object2Stroke: 'red'
    }, options );

    super( options );

    // Show the min/max positions for dragging the objects
    const verticalMin = layoutBounds.minY;
    const verticalMax = layoutBounds.height;
    const object1LineOptions = { stroke: options.object1Stroke, lineWidth: options.lineWidth };
    const object2LineOptions = { stroke: options.object1Stroke, lineWidth: options.lineWidth };

    // vertical lines (drawn from yMin to yMax) that will be positioned according to the draggable limits of each object
    const object1MinLine = new Line( 0, verticalMin, 0, verticalMax, object1LineOptions );
    const object1MaxLine = new Line( 0, verticalMin, 0, verticalMax, object1LineOptions );
    const object2MinLine = new Line( 0, verticalMin, 0, verticalMax, object2LineOptions );
    const object2MaxLine = new Line( 0, verticalMin, 0, verticalMax, object2LineOptions );

    this.children = [ object1MinLine, object2MinLine, object1MaxLine, object2MaxLine ];

    let object1MinX;
    let object1MaxX;
    let object2MinX;
    let object2MaxX;
    const objectProperties = [
      model.object1.positionProperty,
      model.object1.radiusProperty,
      model.object2.positionProperty,
      model.object2.radiusProperty
    ];

    Multilink.multilink( objectProperties, () => {
      object1MinX = modelViewTransform.modelToViewX( model.getObjectMinPosition( model.object1 ) );
      object1MinLine.x1 = object1MinX;
      object1MinLine.x2 = object1MinX;

      object1MaxX = modelViewTransform.modelToViewX( model.getObjectMaxPosition( model.object1 ) );
      object1MaxLine.x1 = object1MaxX;
      object1MaxLine.x2 = object1MaxX;

      object2MinX = modelViewTransform.modelToViewX( model.getObjectMinPosition( model.object2 ) );
      object2MinLine.x1 = object2MinX;
      object2MinLine.x2 = object2MinX;

      object2MaxX = modelViewTransform.modelToViewX( model.getObjectMaxPosition( model.object2 ) );
      object2MaxLine.x1 = object2MaxX;
      object2MaxLine.x2 = object2MaxX;
    } );
  }
}

inverseSquareLawCommon.register( 'ISLCDragBoundsNode', ISLCDragBoundsNode );

export default ISLCDragBoundsNode;