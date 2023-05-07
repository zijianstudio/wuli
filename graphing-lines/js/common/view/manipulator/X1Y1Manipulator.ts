// Copyright 2013-2023, University of Colorado Boulder

/**
 * Manipulator for changing a line's (x1,y1) point.
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

export default class X1Y1Manipulator extends Manipulator {

  private readonly disposeX1Y1Manipulator: () => void;

  /**
   * @param radius
   * @param lineProperty
   * @param x1RangeProperty
   * @param y1RangeProperty
   * @param modelViewTransform
   * @param constantSlope - true: slope is constant, false: (x2,y2) is constant
   */
  public constructor( radius: number,
                      lineProperty: Property<Line>,
                      x1RangeProperty: TReadOnlyProperty<Range>,
                      y1RangeProperty: TReadOnlyProperty<Range>,
                      modelViewTransform: ModelViewTransform2,
                      constantSlope: boolean ) {

    super( radius, GLColors.POINT_X1_Y1, { haloAlpha: GLColors.HALO_ALPHA.x1y1 } );

    // move the manipulator to match the line's (x1,y1) point
    const lineObserver = ( line: Line ) => {
      this.translation = modelViewTransform.modelToViewPosition( new Vector2( line.x1, line.y1 ) );
    };
    lineProperty.link( lineObserver ); // unlink in dispose

    this.addInputListener( new X1Y1DragListener( this, lineProperty, x1RangeProperty, y1RangeProperty, modelViewTransform, constantSlope ) );

    this.disposeX1Y1Manipulator = () => {
      lineProperty.unlink( lineObserver );
    };
  }

  public override dispose(): void {
    this.disposeX1Y1Manipulator();
    super.dispose();
  }
}

/**
 * Drag listener for (x1,y1) manipulator.
 */
class X1Y1DragListener extends DragListener {

  public constructor( targetNode: Node,
                      lineProperty: Property<Line>,
                      x1RangeProperty: TReadOnlyProperty<Range>,
                      y1RangeProperty: TReadOnlyProperty<Range>,
                      modelViewTransform: ModelViewTransform2,
                      constantSlope: boolean ) {

    let startOffset: Vector2; // where the drag started, relative to (x1,y1), in parent view coordinates

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
        const x1 = Utils.roundSymmetric( Utils.clamp( position.x, x1RangeProperty.value.min, x1RangeProperty.value.max ) );
        const y1 = Utils.roundSymmetric( Utils.clamp( position.y, y1RangeProperty.value.min, y1RangeProperty.value.max ) );
        const line = lineProperty.value;

        if ( constantSlope ) {
          // Keep slope constant, change (x1,y1) and (x2,y2).
          lineProperty.value = Line.createPointSlope( x1, y1, line.rise, line.run, line.color );
        }
        else if ( x1 !== lineProperty.value.x2 || y1 !== lineProperty.value.y2 ) {
          // Don't allow points to be the same, this would result in slope=0/0 (undefined line.)
          // Keep (x2,y2) constant, change (x1,y1) and slope.
          lineProperty.value = new Line( x1, y1, line.x2, line.y2, line.color );
        }
      }
    } );
  }
}

graphingLines.register( 'X1Y1Manipulator', X1Y1Manipulator );