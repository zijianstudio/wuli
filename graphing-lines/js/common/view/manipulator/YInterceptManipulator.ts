// Copyright 2013-2023, University of Colorado Boulder

/**
 * Manipulator for changing a line's y-intercept.
 * This manipulates (x1,y1), keeping x1 constrained to zero, and effectively dragging along the y-axis.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../../dot/js/Range.js';
import Utils from '../../../../../dot/js/Utils.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../../phetcommon/js/view/ModelViewTransform2.js';
import { DragListener, Node } from '../../../../../scenery/js/imports.js';
import graphingLines from '../../../graphingLines.js';
import GLColors from '../../GLColors.js';
import Line from '../../model/Line.js';
import Manipulator from './Manipulator.js';

export default class YInterceptManipulator extends Manipulator {

  private readonly disposeYInterceptManipulator: () => void;

  public constructor( radius: number,
                      lineProperty: Property<Line>,
                      y1RangeProperty: TReadOnlyProperty<Range>,
                      modelViewTransform: ModelViewTransform2 ) {

    super( radius, GLColors.INTERCEPT, { haloAlpha: GLColors.HALO_ALPHA.intercept } );

    // move the manipulator to match the line's (x1,y1) point
    const lineObserver = ( line: Line ) => {
      this.translation = modelViewTransform.modelToViewPosition( new Vector2( line.x1, line.y1 ) );
    };
    lineProperty.link( lineObserver ); // unlink in dispose

    this.addInputListener( new YInterceptDragListener( this, lineProperty, y1RangeProperty, modelViewTransform ) );

    this.disposeYInterceptManipulator = () => {
      lineProperty.unlink( lineObserver );
    };
  }

  public override dispose(): void {
    this.disposeYInterceptManipulator();
    super.dispose();
  }
}

/**
 * Drag listener for y-intercept manipulator.
 */
class YInterceptDragListener extends DragListener {

  public constructor( targetNode: Node,
                      lineProperty: Property<Line>,
                      y1RangeProperty: TReadOnlyProperty<Range>,
                      modelViewTransform: ModelViewTransform2 ) {

    let startOffset: Vector2; // where the drag started, relative to the y-intercept, in parent view coordinates

    super( {

      allowTouchSnag: true,

      // note where the drag started
      start: event => {
        const line = lineProperty.value;
        const position = modelViewTransform.modelToViewXY( line.x1, line.y1 );
        startOffset = targetNode.globalToParentPoint( event.pointer.point ).minus( position );
      },

      drag: event => {

        const parentPoint = targetNode.globalToParentPoint( event.pointer.point ).minus( startOffset );
        const position = modelViewTransform.viewToModelPosition( parentPoint );

        // constrain to range, snap to grid
        const y1 = Utils.roundSymmetric( Utils.clamp( position.y, y1RangeProperty.value.min, y1RangeProperty.value.max ) );
        const line = lineProperty.value;

        // Keep slope constant, change y1.
        lineProperty.value = Line.createSlopeIntercept( line.rise, line.run, y1, line.color );
      }
    } );
  }
}

graphingLines.register( 'YInterceptManipulator', YInterceptManipulator );