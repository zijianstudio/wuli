// Copyright 2013-2023, University of Colorado Boulder

/**
 * An immutable line, described by 2 points, (x1,y1) and (x2,y2).
 * Slope components (rise and run) are signed relative to (x1,y1).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import { Color } from '../../../../scenery/js/imports.js';
import graphingLines from '../../graphingLines.js';
import GLColors from '../GLColors.js';

export default class Line {

  // points that define the line
  public readonly x1: number;
  public readonly y1: number;
  public readonly x2: number;
  public readonly y2: number;

  // slope = rise/run
  public readonly rise: number;
  public readonly run: number;

  public readonly color: Color | string;

  public constructor( x1: number, y1: number, x2: number, y2: number, color: Color | string = 'black' ) {

    // 2 different points are required
    assert && assert( x1 !== x2 || y1 !== y2, `points are the same: (${x1},${y1})` );

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.rise = y2 - y1;
    this.run = x2 - x1;
    this.color = color || 'black';
  }

  // Convenience method for creating a line with a different color.
  public withColor( color: Color | string ): Line {
    return new Line( this.x1, this.y1, this.x2, this.y2, color );
  }

  // For debugging, do not rely on format!
  public toString(): string {
    return `Line[x1=${this.x1} y1=${this.y1} x2=${this.x2} y2=${this.y2
    } rise=${this.rise} run=${this.run} color=${this.color.toString()}]`;
  }

  // Returns true if 2 points on the specified line are also on this line.
  public same( line: Line ): boolean {
    return this.onLineXY( line.x1, line.y1 ) && this.onLineXY( line.x2, line.y2 );
  }

  // Returns true if the slope is undefined.
  public undefinedSlope(): boolean {
    return ( this.run === 0 );
  }

  // Gets the slope. Returns NaN if slope is undefined.
  public getSlope(): number {
    if ( this.undefinedSlope() ) {
      return Number.NaN;
    }
    else {
      return this.rise / this.run;
    }
  }

  /*
   * Given x, solve y = m(x - x1) + y1
   * Returns NaN if the solution is not unique, or there is no solution (x can't possibly be on the line.)
   * This occurs when we have a vertical line, with no run.
   */
  public solveY( x: number ): number {
    if ( this.undefinedSlope() ) {
      return Number.NaN;
    }
    else {
      return ( this.getSlope() * ( x - this.x1 ) ) + this.y1;
    }
  }

  /*
   * Given y, solve x = ((y - y1)/m) + x1
   * Returns NaN if the solution is not unique (horizontal line) or the slope is undefined (vertical line).
   */
  public solveX( y: number ): number {
    if ( this.rise === 0 || this.run === 0 ) {
      return Number.NaN;
    }
    else {
      return ( ( y - this.y1 ) / ( this.rise / this.run ) ) + this.x1;
    }
  }

  // Gets the simplified rise.
  public getSimplifiedRise(): number {
    if ( this.slopeIsSimplifiable() ) {
      return Utils.roundSymmetric( this.rise / Utils.gcd( this.rise, this.run ) );
    }
    else {
      return this.rise;
    }
  }

  // Gets the simplified run.
  public getSimplifiedRun(): number {
    if ( this.slopeIsSimplifiable() ) {
      return Utils.roundSymmetric( this.run / Utils.gcd( this.rise, this.run ) );
    }
    else {
      return this.run;
    }
  }

  /*
   * Simplification uses Euclid's algorithm for computing the greatest common divisor (GCD) of non-zero integers,
   * so slope can be simplified only if the rise and run meet that criteria.
   */
  public slopeIsSimplifiable(): boolean {
    return ( this.rise !== 0 ) && ( this.run !== 0 ) && Number.isInteger( this.rise ) && Number.isInteger( this.run );
  }

  /**
   * Returns true if point is on this line.
   */
  public onLinePoint( p: Vector2 ): boolean {
    return this.onLineXY( p.x, p.y );
  }

  private onLineXY( x: number, y: number ): boolean {
    if ( this.rise === 0 ) {
      return ( y === this.y1 );
    }
    else if ( this.run === 0 ) {
      return ( x === this.x1 );
    }
    else {
      // account for floating point errors, see https://github.com/phetsims/graphing-lines/issues/56
      return ( Math.abs( x - this.solveX( y ) ) < 1E-10 );
    }
  }

  /**
   * Gets the y-intercept as a simplified fraction.
   * This is valid only if (x1,y1) and (x2,y2) are at integer positions on the grid.
   */
  public getYIntercept(): Fraction {
    assert && assert( Number.isInteger( this.x1 ) && Number.isInteger( this.y1 ) && Number.isInteger( this.rise ) && Number.isInteger( this.run ) );
    if ( this.rise === 0 || this.run === 0 ) {
      return new Fraction( this.y1, 1 ); // not technically correct for run===0, but gives the desired result in slope-intercept equations
    }
    const numerator = Utils.roundSymmetric( ( this.y1 * this.run ) - ( this.x1 * this.rise ) );
    const denominator = this.run;
    const gcd = Utils.gcd( numerator, denominator );
    return new Fraction( Utils.roundSymmetric( numerator / gcd ), Utils.roundSymmetric( denominator / gcd ) );
  }

  /**
   * Creates a line by describing it in point-slope form: (y - y1) = m(x - x1)
   */
  public static createPointSlope( x1: number, y1: number, rise: number, run: number, color?: Color | string ): Line {
    return new Line( x1, y1, x1 + run, y1 + rise, color );
  }

  /**
   * Creates a line by describing it in slope-intercept form: y = mx + b
   */
  public static createSlopeIntercept( rise: number, run: number, yIntercept: number, color?: Color | string ): Line {
    return Line.createPointSlope( 0, yIntercept, rise, run, color );
  }

  // y = x (a standard line)
  public static readonly Y_EQUALS_X_LINE = new Line( 0, 0, 1, 1, GLColors.Y_EQUALS_X );

  // y = -x (a standard line)
  public static readonly Y_EQUALS_NEGATIVE_X_LINE = new Line( 0, 0, 1, -1, GLColors.Y_EQUALS_NEGATIVE_X );
}

graphingLines.register( 'Line', Line );