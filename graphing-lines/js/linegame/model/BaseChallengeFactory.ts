// Copyright 2017-2023, University of Colorado Boulder

/**
 * Abstract base class for challenge factories in both the 'Graphing Lines' and 'Graphing Slope-Intercept' sims.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Utils from '../../../../dot/js/Utils.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import GLConstants from '../../common/GLConstants.js';
import Line from '../../common/model/Line.js';
import graphingLines from '../../graphingLines.js';
import Challenge from './Challenge.js';

type SelfOptions = {
  xRange?: Range; // range of the graph's x-axis
  yRange?: Range; // range of the graph's y-axis
};

export type BaseChallengeFactoryOptions = SelfOptions;

export default abstract class BaseChallengeFactory {

  protected readonly xRange: Range;
  protected readonly yRange: Range;

  protected constructor( providedOptions?: BaseChallengeFactoryOptions ) {

    const options = optionize<BaseChallengeFactoryOptions, SelfOptions>()( {
      xRange: GLConstants.X_AXIS_RANGE,
      yRange: GLConstants.Y_AXIS_RANGE
    }, providedOptions );

    this.xRange = options.xRange;
    this.yRange = options.yRange;
  }

  /**
   * Creates challenges for the factory's game level.
   */
  public abstract createChallenges(): Challenge[];

  /**
   * Convenience function for creating a line, give a slope and intercept.
   */
  protected createSlopeInterceptLine( slope: Fraction, intercept: number ): Line {
    return Line.createSlopeIntercept( slope.numerator, slope.denominator, intercept );
  }

  /**
   * Convenience function for creating a line, give a point and slope.
   */
  protected createPointSlopeLine( point: Vector2, slope: Fraction ): Line {
    return Line.createPointSlope( point.x, point.y, slope.numerator, slope.denominator );
  }

  /**
   * Picks a point that keeps the slope indicator on the graph.
   */
  protected static choosePointForSlope( slope: Fraction, graphXRange: Range, graphYRange: Range ): Vector2 {

    const rise = slope.numerator;
    const run = slope.denominator;

    // x
    const minX = ( run >= 0 ) ? graphXRange.min : graphXRange.min - run;
    const maxX = ( run >= 0 ) ? graphXRange.max - run : graphXRange.max;
    const x = Utils.roundSymmetric( minX + ( dotRandom.nextDouble() * ( maxX - minX ) ) );
    assert && assert( x >= minX && x <= maxX, `x out of range: ${x}` );

    // y
    const minY = ( rise >= 0 ) ? graphYRange.min : graphYRange.min - rise;
    const maxY = ( rise >= 0 ) ? graphYRange.max - rise : graphYRange.max;
    const y = Utils.roundSymmetric( minY + ( dotRandom.nextDouble() * ( maxY - minY ) ) );
    assert && assert( y >= minY && y <= maxY, `y out of range: ${y}` );

    return new Vector2( x, y );
  }

  /**
   * Picks a point (x1,x2) on the graph that results in the slope indicator (x2,y2) being off the graph.
   * This forces the user to invert the slope.
   */
  protected static choosePointForSlopeInversion( slope: Fraction, graphXRange: Range, graphYRange: Range ): Vector2 {

    const rise = slope.numerator;
    const run = slope.denominator;

    // x1 coordinates
    const minX1 = ( run >= 0 ) ? graphXRange.max - run + 1 : graphXRange.min;
    const maxX1 = ( run >= 0 ) ? graphXRange.max : graphXRange.min - run - 1;
    const x1 = Utils.roundSymmetric( minX1 + ( dotRandom.nextDouble() * ( maxX1 - minX1 ) ) );
    assert && assert( x1 >= minX1 && x1 <= maxX1, `x1 out of range: ${x1}` );

    // y1 coordinates
    const minY1 = ( rise >= 0 ) ? graphYRange.max - rise + 1 : graphYRange.min;
    const maxY1 = ( rise >= 0 ) ? graphYRange.max : graphYRange.min - rise - 1;
    const y1 = Utils.roundSymmetric( minY1 + ( dotRandom.nextDouble() * ( maxY1 - minY1 ) ) );
    assert && assert( y1 >= minY1 && y1 <= maxY1, `y1 out of range: ${y1}` );

    // compute (x2,y2) for validation
    const x2 = x1 + run;
    const y2 = y1 + rise;

    // (x1,y1) must be on the graph, (x2,y2) must be off the graph
    assert && assert( graphXRange.contains( x1 ) && !graphXRange.contains( x2 ) );
    assert && assert( graphYRange.contains( y1 ) && !graphYRange.contains( y2 ) );

    return new Vector2( x1, y1 );
  }
}

graphingLines.register( 'BaseChallengeFactory', BaseChallengeFactory );