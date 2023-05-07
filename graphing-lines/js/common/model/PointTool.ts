// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model of the point tool. Highlights when it is placed on one of the lines.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import graphingLines from '../../graphingLines.js';
import Line from './Line.js';

// direction that the tip points
type PointToolOrientation = 'up' | 'down';

export default class PointTool {

  // position of the point tool
  public readonly positionProperty: Property<Vector2>;

  // line that the tool is on, null if it's not on a line
  public readonly onLineProperty: Property<Line | null>;

  public readonly orientation: PointToolOrientation;
  public readonly dragBounds: Bounds2;

  /**
   * @param position - initial position of the tool
   * @param orientation - direction that the tip points
   * @param lines - Lines that the tool might intersect
   * @param dragBounds - tool can be dragged within these bounds
   */
  public constructor( position: Vector2, orientation: PointToolOrientation, lines: ObservableArray<Line>, dragBounds: Bounds2 ) {

    assert && assert( _.includes( [ 'up', 'down' ], orientation ) );

    this.positionProperty = new Vector2Property( position );

    this.onLineProperty = new Property<Line | null>( null );

    this.orientation = orientation;
    this.dragBounds = dragBounds;

    // Update when the point tool moves or the lines change.
    // unmultilink unneeded because PointTool either exists for sim lifetime, or is owned by a Challenge that
    // doesn't require dispose.
    Multilink.multilink( [ this.positionProperty, lines.lengthProperty ],
      () => {
        let line;
        for ( let i = 0; i < lines.length; i++ ) {
          line = lines.get( i );
          if ( this.isOnLine( line ) ) {
            this.onLineProperty.value = line;
            return;
          }
        }
        this.onLineProperty.value = null;
      }
    );
  }

  public reset(): void {
    this.positionProperty.reset();
    this.onLineProperty.reset();
  }

  /**
   * Determines if the point tool is on the specified line.
   */
  public isOnLine( line: Line ): boolean {
    return line.onLinePoint( this.positionProperty.value );
  }
}

graphingLines.register( 'PointTool', PointTool );