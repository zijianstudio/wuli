// Copyright 2013-2023, University of Colorado Boulder

/**
 * Manipulator for changing a line's slope.
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

export default class SlopeManipulator extends Manipulator {

  private readonly disposeSlopeManipulator: () => void;

  public constructor( radius: number,
                      lineProperty: Property<Line>,
                      riseRangeProperty: TReadOnlyProperty<Range>,
                      runRangeProperty: TReadOnlyProperty<Range>,
                      modelViewTransform: ModelViewTransform2 ) {

    super( radius, GLColors.SLOPE, { haloAlpha: GLColors.HALO_ALPHA.slope } );

    // move the manipulator to match the line's slope
    const lineObserver = ( line: Line ) => {
      this.translation = modelViewTransform.modelToViewPosition( new Vector2( line.x2, line.y2 ) );
    };
    lineProperty.link( lineObserver ); // unlink in dispose

    this.addInputListener( new SlopeDragListener( this, lineProperty, riseRangeProperty, runRangeProperty, modelViewTransform ) );

    this.disposeSlopeManipulator = () => {
      lineProperty.unlink( lineObserver );
    };
  }

  public override dispose(): void {
    this.disposeSlopeManipulator();
    super.dispose();
  }
}

/**
 * Drag listener for slope manipulator.
 */
class SlopeDragListener extends DragListener {

  public constructor( targetNode: Node,
                      lineProperty: Property<Line>,
                      riseRangeProperty: TReadOnlyProperty<Range>,
                      runRangeProperty: TReadOnlyProperty<Range>,
                      modelViewTransform: ModelViewTransform2 ) {

    let startOffset: Vector2; // where the drag started, relative to the slope manipulator, in parent view coordinates

    super( {

      allowTouchSnag: true,

      // note where the drag started
      start: event => {
        const line = lineProperty.value;
        const position = modelViewTransform.modelToViewXY( line.x2, line.y2 );
        startOffset = targetNode.globalToParentPoint( event.pointer.point ).minus( position );
      },

      drag: event => {
        const parentPoint = targetNode.globalToParentPoint( event.pointer.point ).minus( startOffset );
        const position = modelViewTransform.viewToModelPosition( parentPoint );
        // constrain to dynamic range, snap to grid
        const line = lineProperty.value;
        const run = Utils.roundSymmetric( Utils.clamp( position.x - line.x1, runRangeProperty.value.min, runRangeProperty.value.max ) );
        const rise = Utils.roundSymmetric( Utils.clamp( position.y - line.y1, riseRangeProperty.value.min, riseRangeProperty.value.max ) );
        // don't allow slope=0/0, undefined line
        if ( rise !== 0 || run !== 0 ) {
          lineProperty.value = Line.createPointSlope( line.x1, line.y1, rise, run, line.color );
        }
      }
    } );
  }
}

graphingLines.register( 'SlopeManipulator', SlopeManipulator );