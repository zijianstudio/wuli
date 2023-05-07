// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model of a simple 2D graph.  Used in the icon as well as the sim screens.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import graphingLines from '../../graphingLines.js';
import Line from './Line.js';

export default class Graph {

  public readonly xRange: Range;
  public readonly yRange: Range;
  public readonly lines: ObservableArray<Line>; // lines that the graph is currently displaying

  public constructor( xRange: Range, yRange: Range ) {
    this.xRange = xRange;
    this.yRange = yRange;
    this.lines = createObservableArray();
  }

  public getWidth(): number { return this.xRange.getLength(); }

  public getHeight(): number { return this.yRange.getLength(); }

  /**
   * Does the graph contain the specified point?
   */
  public contains( point: Vector2 ): boolean {
    return this.xRange.contains( point.x ) && this.yRange.contains( point.y );
  }

  /**
   * Constrains a point to the x,y range of the graph.
   */
  public constrain( point: Vector2 ): Vector2 {
    const x = this.xRange.constrainValue( point.x );
    const y = this.yRange.constrainValue( point.y );
    if ( point.x === x && point.y === y ) {
      return point;
    }
    else {
      return new Vector2( x, y );
    }
  }
}

graphingLines.register( 'Graph', Graph );