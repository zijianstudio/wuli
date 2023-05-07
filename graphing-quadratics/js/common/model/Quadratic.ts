// Copyright 2018-2023, University of Colorado Boulder

/**
 * Quadratic is the model of an immutable quadratic, described by these equations:
 *
 * standard form: y = ax^2 + bx + c
 * vertex form: y = a(x - h)^2 + k
 * alternate vertex form: y = (1/(4p))(x - h)^2 + k
 *
 * Note that this implementation supports only parabolas that open up or down.  It does not support parabolas that
 * open left or right, which would be described by x = ay^2 + by + c.
 *
 * Typically, a quadratic requires a !== 0. But this sim is required to support a === 0.
 * So there is some non-standard behavior herein that is not exactly mathematically correct.
 * Specifically, when a === 0, Quadratic behaves like a straight line.  See for example solveX.
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Utils from '../../../../dot/js/Utils.js';
import Range from '../../../../dot/js/Range.js';
import Vector2, { Vector2StateObject } from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Color, ColorState } from '../../../../scenery/js/imports.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQColors from '../GQColors.js';
import ObjectLiteralIO from '../../../../tandem/js/types/ObjectLiteralIO.js';


type QuadraticStateObject = {

  // These properties are sufficient to restore a Quadratic, see fromStateObject.
  a: number;
  b: number;
  c: number;
  color: ColorState;

  // These properties are desired in the data stream, but will be undefined for non-parabolas (a===0).
  // Anything that is undefined will be serialized as null, because the JSON data stream cannot include undefined.
  p: number | null;
  h: number | null;
  k: number | null;
  vertex: Vector2StateObject | null;
  focus: Vector2StateObject | null;
  directrix: number | null;
  axisOfSymmetry: number | null;
};

// The points for the Bezier curve that describes this quadratic.
type QuadraticControlPoints = {
  startPoint: Vector2;
  controlPoint: Vector2;
  endPoint: Vector2;
};

type SelfOptions = {

  // The color used to render the curve.
  // This is in the model to support color-coding of the point tool.
  color?: Color | string;
};

type QuadraticOptions = SelfOptions;

export default class Quadratic {

  // Coefficients for standard form
  public readonly a: number;
  public readonly b: number;
  public readonly c: number;

  // The color used to render the curve.
  public readonly color: Color | string;

  // Roots are ordered from left to right along the x-axis. null means that all points are roots (y = 0)
  public readonly roots: Vector2[] | null;

  // Fields for vertex form. Strictly speaking, we don't have a quadratic (or a parabola) if a === 0.
  // If that's the case, then these fields will be undefined.
  public readonly p?: number;
  public readonly h?: number;
  public readonly k?: number;
  public readonly vertex?: Vector2;
  public readonly focus?: Vector2;
  public readonly directrix?: number; // y = directrix
  public readonly axisOfSymmetry?: number; // x = h

  /**
   * Constructor parameters are coefficients of the standard form equation: y = ax^2 + bx + c
   */
  public constructor( a: number, b: number, c: number, providedOptions?: QuadraticOptions ) {

    const options = optionize<QuadraticOptions, SelfOptions>()( {

      // SelfOptions
      color: 'black'
    }, providedOptions );

    this.a = a;
    this.b = b;
    this.c = c;
    this.color = options.color;
    this.roots = solveRoots( a, b, c );

    // Strictly speaking, we don't have a quadratic (or a parabola) if a === 0.
    // If that's the case, then the fields in this if block will be undefined.
    if ( a !== 0 ) {

      this.p = 1 / ( 4 * a );
      this.h = -b / ( 2 * a );
      this.k = c - ( ( b * b ) / ( 4 * a ) );

      this.vertex = new Vector2( this.h, this.k );
      this.focus = new Vector2( this.h, this.k + this.p );
      this.directrix = this.k - this.p; // y = directrix
      this.axisOfSymmetry = this.h; // x = h
    }
  }

  /**
   * Returns a copy of this Quadratic with a specified color.
   */
  public withColor( color: Color | string ): Quadratic {
    return new Quadratic( this.a, this.b, this.c, { color: color } );
  }

  /**
   * Determines whether this quadratic and some other quadratic have the same standard-form coefficients.
   */
  public hasSameCoefficients( quadratic: Quadratic ): boolean {
    return ( quadratic.a === this.a ) && ( quadratic.b === this.b ) && ( quadratic.c === this.c );
  }

  /**
   * Creates a Quadratic using coefficients of the vertex form equation: y = a(x - h)^2 + k
   * This method is used in the Vertex Form screen, where the user controls a, h, and k.
   */
  public static createFromVertexForm( a: number, h: number, k: number, options?: QuadraticOptions ): Quadratic {
    const b = -2 * a * h;
    const c = ( a * h * h ) + k;
    return new Quadratic( a, b, c, options );
  }

  /**
   * Creates a Quadratic using coefficients of the alternate vertex form equation: y = (1/(4p))(x - h)^2 + k
   * This method is used in the Focus & Directrix screen, where the user controls p, h, and k.
   */
  public static createFromAlternateVertexForm( p: number, h: number, k: number, options?: QuadraticOptions ): Quadratic {
    assert && assert( p !== 0, 'p cannot be zero' );
    const a = 1 / ( 4 * p );
    return Quadratic.createFromVertexForm( a, h, k, options );
  }

  /**
   * Deserializes a Quadratic instance.
   */
  public static fromStateObject( stateObject: QuadraticStateObject ): Quadratic {
    return new Quadratic( stateObject.a, stateObject.b, stateObject.c, {
      color: Color.fromStateObject( stateObject.color )
    } );
  }

  /**
   * Returns a string representation of this Quadratic. For debugging only, do not rely on format!
   */
  public toString(): string {
    return StringUtils.fillIn( 'Quadratic {{a}}x^2 + {{b}}x + {{c}}, color={{color}}', {
      a: this.a,
      b: this.b,
      c: this.c,
      color: this.color
    } );
  }

  /**
   * Gets the quadratic term, y = ax^2
   */
  public getQuadraticTerm(): Quadratic {
    return new Quadratic( this.a, 0, 0, { color: GQColors.QUADRATIC_TERM } );
  }

  /**
   * Gets the linear term, y = bx
   */
  public getLinearTerm(): Quadratic {
    return new Quadratic( 0, this.b, 0, { color: GQColors.LINEAR_TERM } );
  }

  /**
   * Gets the constant term, y = c
   */
  public getConstantTerm(): Quadratic {
    return new Quadratic( 0, 0, this.c, { color: GQColors.CONSTANT_TERM } );
  }

  /**
   * Does this quadratic describe a parabola?
   * Typically, a quadratic requires a !== 0. But this sim is required to support a === 0, so this
   * method is used in places where we need to determine whether we're dealing with a parabola.
   */
  public isaParabola(): boolean {
    return ( this.a !== 0 );
  }

  /**
   * Given y, solve for x.
   * If there is more than one solution, they will be in ascending order.
   * @param y
   * @returns one or more solutions, null if there is no solution
   */
  public solveX( y: number ): number[] | null {
    if ( this.isaParabola() ) {
      const vertex = this.vertex!;
      assert && assert( vertex !== undefined );

      if ( ( this.a > 0 && y < vertex.y ) || ( this.a < 0 && y > vertex.y ) ) {

        // there is no solution, y is not on the parabola
        return null;
      }
      else {
        const k = this.k!;
        assert && assert( k !== undefined );
        const h = this.h!;
        assert && assert( h !== undefined );

        // For a parabola, use vertex form.
        // y = a(x - h)^2 + k => x = h +- Math.sqrt((y - k)/a)
        // This yields 2 solutions
        const commonTerm = Math.sqrt( ( y - k ) / this.a );
        const x0 = h - commonTerm;
        const x1 = h + commonTerm;
        return [ x0, x1 ].sort( ( x0, x1 ) => x0 - x1 ); // in ascending order
      }
    }
    else {

      // For a straight line, use slope-intercept form.
      // y = bx + c => x = (y - c)/b
      // This yields one solution.
      const x0 = ( y - this.c ) / this.b;
      return [ x0 ];
    }
  }

  /**
   * Given x, solve for y.
   */
  public solveY( x: number ): number {
    return ( this.a * x * x ) + ( this.b * x ) + this.c; // y = ax^2 + bx + c
  }

  /**
   * Gets the slope of the tangent line at point (x,f(x)) on the quadratic.
   */
  public getTangentSlope( x: number ): number {
    assert && assert( this.isaParabola(), 'not supported for non-parabola' );
    return ( 2 * this.a * x ) + this.b; // first derivative
  }

  /**
   * Gets the control points that describe this quadratic.
   * See https://github.com/phetsims/graphing-quadratics/issues/1
   */
  public getControlPoints( xRange: Range ): QuadraticControlPoints {

    // to improve readability
    const minX = xRange.min;
    const maxX = xRange.max;
    const length = xRange.getLength();

    const aPrime = this.a * length * length;
    const bPrime = ( 2 * this.a * minX * length ) + ( this.b * length );
    const cPrime = ( this.a * minX * minX ) + ( this.b * minX ) + this.c;

    return {
      startPoint: new Vector2( minX, cPrime ),
      controlPoint: new Vector2( ( minX + maxX ) / 2, bPrime / 2 + cPrime ),
      endPoint: new Vector2( maxX, aPrime + bPrime + cPrime )
    };
  }

  /**
   * Is the specified point a solution to this quadratic equation?
   * @param point
   * @param [distance] - how close the point must be to the solution, defaults to 0 for exact solution
   */
  public hasSolution( point: Vector2, distance = 0 ): boolean {
    assert && assert( distance >= 0, `invalid distance: ${distance}` );
    const closestPoint = this.getClosestPoint( point );
    return point.distance( closestPoint ) <= distance;
  }

  /**
   * Gets the point on this curve that is closest to a specified point.
   */
  public getClosestPoint( point: Vector2 ): Vector2 {

    // to improve readability
    const x0 = point.x;
    const y0 = point.y;
    const a = this.a;
    const b = this.b;
    const c = this.c;

    // Use a larger threshold when deciding whether the cubic equation below has one root.
    // If we don't adjust this threshold, then Utils.solveCubicRootsReal will compute roots that are NaN.
    // See https://github.com/phetsims/graphing-quadratics/issues/170
    const discriminantThreshold = 1e-9;

    // Finding the closest point requires solving the cubic equation
    // (2a^2)x^3 + (3ab)x^2 + (b^2 + 2ac - 2ay0 + 1)x + (bc - by0 - x0) = 0
    // See http://mathworld.wolfram.com/Point-QuadraticDistance.html
    const roots = Utils.solveCubicRootsReal(
      2 * a * a,
      3 * a * b,
      b * b + 2 * a * c - 2 * a * y0 + 1,
      b * c - b * y0 - x0,
      discriminantThreshold
    )!;
    assert && assert( roots, 'all values are roots' );
    assert && assert( roots.length > 0, `unexpected number of roots: ${roots.length}` );

    // Determine which solution is closest to point (x0,y0)
    let rootPoint;
    let closestPoint = new Vector2( roots[ 0 ], this.solveY( roots[ 0 ] ) );
    for ( let i = 1; i < roots.length; i++ ) {
      rootPoint = new Vector2( roots[ i ], this.solveY( roots[ i ] ) );
      if ( rootPoint.distance( point ) < closestPoint.distance( point ) ) {
        closestPoint = rootPoint;
      }
    }

    return closestPoint;
  }

  /**
   * Given x, find the closest point on the curve that is in range.
   */
  public getClosestPointInRange( x: number, xRange: Range, yRange: Range ): Vector2 {

    // constrain x and solve for y
    x = xRange.constrainValue( x );
    let y = this.solveY( x );

    if ( !yRange.contains( y ) ) {

      // y is outside range, constrain y and solve for x
      y = yRange.constrainValue( y );
      const xValues = this.solveX( y )!;
      assert && assert( xValues, `${'No solution exists, the parabola is likely off the graph. ' +
                                    'x='}${x}, quadratic=${this.toString()}` );

      if ( this.isaParabola() ) {

        // parabola
        assert && assert( xValues.length === 2, `unexpected number of xValues: ${xValues}` );
        assert && assert( xValues[ 0 ] < xValues[ 1 ], `unexpected order of xValues: ${xValues}` );
        assert && assert( this.vertex );
        x = ( x < this.vertex!.x ) ? xValues[ 0 ] : xValues[ 1 ];
      }
      else {

        // straight line
        assert && assert( xValues.length === 1, `unexpected number of xValues: ${xValues}` );
        x = xValues[ 0 ];
      }
    }

    return new Vector2( x, y );
  }

  /**
   * Serializes this Quadratic instance.
   */
  private toStateObject(): QuadraticStateObject {
    return {

      // These properties are sufficient to restore a Quadratic, see fromStateObject.
      a: this.a,
      b: this.b,
      c: this.c,
      color: Color.toColor( this.color ).toStateObject(),

      // These properties are desired in the data stream, but will be undefined for non-parabolas (a===0).
      // Because PhET-iO values are based on JSON.stringify, undefined properties will not be present in the
      // data stream.
      p: this.p || null,
      h: this.h || null,
      k: this.k || null,
      vertex: ( this.vertex ? this.vertex.toStateObject() : null ),
      focus: ( this.focus ? this.focus.toStateObject() : null ),
      directrix: this.directrix || null,
      axisOfSymmetry: this.axisOfSymmetry || null
    };
  }

  public static readonly QuadraticIO = new IOType( 'QuadraticIO', {
    valueType: Quadratic,
    documentation:
      'QuadraticIO is a data structure that describes a quadratic equation in the model. ' +
      'Its properties are relevant to standard and vertex forms of the quadratic equation. ' +
      'Non-parabolas (a=0) will have a subset of the properties that parabolas have. ' +
      '<p>' +
      'Required properties are related to the standard form y = ax<sup>2</sup> + bx + c, and include:' +
      '</p>' +
      '<ul>' +
      '<li>a: {NumberIO} coefficient a</li>' +
      '<li>b: {NumberIO} coefficient b</li>' +
      '<li>c: {NumberIO} coefficient c</li>' +
      '<li>color: {ColorIO} the color used to draw the associated curve</li>' +
      '</ul>' +
      'All coefficient values must respect the ranges for those coefficients.',
    stateSchema: {

      // These properties are sufficient to restore a Quadratic, see fromStateObject.
      a: NumberIO,
      b: NumberIO,
      c: NumberIO,
      color: Color.ColorIO,

      // These extra properties are for the benefit of the data stream/state, when defined
      p: NullableIO( NumberIO ),
      h: NullableIO( NumberIO ),
      k: NullableIO( NumberIO ),
      vertex: NullableIO( ObjectLiteralIO ),
      focus: NullableIO( ObjectLiteralIO ),
      directrix: NullableIO( NumberIO ),
      axisOfSymmetry: NullableIO( NumberIO )
    },
    toStateObject: quadratic => quadratic.toStateObject(),
    fromStateObject: stateObject => Quadratic.fromStateObject( stateObject )
  } );
}

/**
 * Returns the real roots of the quadratic y = ax^2 + bx + c.
 * If there is more than one root, they will be in ascending order of x coordinate.
 * @param a
 * @param b
 * @param c
 * @returns null means that all points are roots (y = 0)
 */
function solveRoots( a: number, b: number, c: number ): Vector2[] | null {
  let roots = null;
  let xCoordinates = Utils.solveQuadraticRootsReal( a, b, c );
  if ( xCoordinates !== null ) {
    roots = [];
    xCoordinates = xCoordinates.sort( ( x0, x1 ) => x0 - x1 ); // in ascending order
    _.uniq( xCoordinates ).forEach( x => { roots.push( new Vector2( x, 0 ) ); } );
  }
  assert && assert( roots === null || ( roots.length >= 0 && roots.length <= 2 ), `unexpected roots: ${roots}` );
  return roots;
}

graphingQuadratics.register( 'Quadratic', Quadratic );