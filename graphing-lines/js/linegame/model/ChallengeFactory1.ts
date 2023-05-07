// Copyright 2013-2023, University of Colorado Boulder

/**
 * Creates game challenges for Level 1, as specified in the design document.
 * Slope, intercept, and point (x1,y1) are all uniquely chosen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import graphingLines from '../../graphingLines.js';
import BaseChallengeFactory from './BaseChallengeFactory.js';
import Challenge from './Challenge.js';
import EquationForm from './EquationForm.js';
import GraphTheLine from './GraphTheLine.js';
import MakeTheEquation from './MakeTheEquation.js';
import ManipulationMode from './ManipulationMode.js';
import ValuePool from './ValuePool.js';

export default class ChallengeFactory1 extends BaseChallengeFactory {

  public constructor() {
    super();
  }

  /**
   * Creates challenges for this game level.
   */
  public override createChallenges(): Challenge[] {

    const challenges = [];

    // hoist vars
    let slope;
    let point;
    let description;
    let manipulationMode;

    // pools of values for slope, y-intercept and point
    const slopePool = new ValuePool( this.createSlopeArrays() );
    const yInterceptPool = new ValuePool( this.createYInterceptArrays() );
    const pointPool = new ValuePool( this.createPointArrays() );

    // CHALLENGE 1: Graph-the-Line, slope-intercept form
    challenges.push( new GraphTheLine(
      '1: GraphTheLine, required slopes, slope variable',
      this.createSlopeInterceptLine( slopePool.chooseRequired(), yInterceptPool.chooseOptional() ),
      EquationForm.SLOPE_INTERCEPT,
      ManipulationMode.SLOPE,
      this.xRange, this.yRange ) );

    // CHALLENGE 2: Graph-the-Line, slope-intercept form
    challenges.push( new GraphTheLine(
      '2: GraphTheLine, required y-intercept, y-intercept variable',
      this.createSlopeInterceptLine( slopePool.chooseOptional(), yInterceptPool.chooseRequired() ),
      EquationForm.SLOPE_INTERCEPT,
      ManipulationMode.INTERCEPT,
      this.xRange, this.yRange ) );

    // CHALLENGE 3: Make-the-Equation, slope-intercept form
    challenges.push( new MakeTheEquation(
      '3: MakeTheEquation, required slope, slope variable',
      this.createSlopeInterceptLine( slopePool.chooseRequired(), yInterceptPool.chooseOptional() ),
      EquationForm.SLOPE_INTERCEPT,
      ManipulationMode.SLOPE,
      this.xRange, this.yRange ) );

    // CHALLENGE 4: Make-the-Equation, slope-intercept form
    challenges.push( new MakeTheEquation(
      '4: MakeTheEquation, required y-intercept, y-intercept variable',
      this.createSlopeInterceptLine( slopePool.chooseOptional(), yInterceptPool.chooseRequired() ),
      EquationForm.SLOPE_INTERCEPT,
      ManipulationMode.INTERCEPT,
      this.xRange, this.yRange ) );

    // for point-slope form, one of each manipulation mode
    const pointSlopeManipulationModes = [ ManipulationMode.POINT, ManipulationMode.SLOPE ];

    // CHALLENGE 5: Graph-the-Line, point-slope form, point or slope variable (random choice)
    {
      // manipulation mode
      manipulationMode = ValuePool.choose( pointSlopeManipulationModes );

      if ( manipulationMode === ManipulationMode.SLOPE ) {
        point = pointPool.chooseOptional();
        slope = slopePool.chooseRequired();
        description = '5: GraphTheLine, required slope, slope variable';
      }
      else {
        point = pointPool.chooseRequired();
        slope = slopePool.chooseOptional();
        description = '5: GraphTheLine, required point, point variable';
      }

      // challenge
      challenges.push( new GraphTheLine( description,
        this.createPointSlopeLine( point, slope ),
        EquationForm.POINT_SLOPE,
        manipulationMode,
        this.xRange, this.yRange ) );
    }

    // CHALLENGE 6: Make-the-Equation, point-slope form, point or slope variable (whichever was not chosen above)
    {
      // manipulation mode
      manipulationMode = ValuePool.choose( pointSlopeManipulationModes );

      if ( manipulationMode === ManipulationMode.SLOPE ) {
        point = pointPool.chooseOptional();
        slope = slopePool.chooseRequired();
        description = '6: MakeTheEquation, required slope, slope variable';
      }
      else {
        point = pointPool.chooseRequired();
        slope = slopePool.chooseOptional();
        description = '6: MakeTheEquation, required point, point variable';
      }

      // challenge
      challenges.push( new MakeTheEquation( description,
        this.createPointSlopeLine( point, slope ),
        EquationForm.POINT_SLOPE,
        manipulationMode,
        this.xRange, this.yRange ) );
    }

    return challenges;
  }

  /**
   * Creates the sets of slopes used for generating challenges.
   */
  protected createSlopeArrays(): Fraction[][] {
    return [
      [ new Fraction( 3, 2 ), new Fraction( 4, 3 ), new Fraction( 5, 2 ), new Fraction( 5, 3 ) ],
      [ new Fraction( 1, 2 ), new Fraction( 1, 3 ), new Fraction( 1, 4 ), new Fraction( 1, 5 ) ],
      [ new Fraction( 2, 3 ), new Fraction( 3, 4 ), new Fraction( 3, 5 ), new Fraction( 2, 5 ) ]
    ];
  }

  /**
   * Creates the sets of y-intercepts used for generating challenges.
   */
  protected createYInterceptArrays(): number[][] {
    const yRangeSubset = new Range( -6, 4 );
    assert && assert( this.yRange.containsRange( yRangeSubset ), 'values are out of range' );
    return [
      ValuePool.rangeToArray( new Range( yRangeSubset.min, -1 ) ), // negative intercepts
      ValuePool.rangeToArray( new Range( 1, yRangeSubset.max ) )   // positive intercepts
    ];
  }

  /**
   * Creates the set of points used for generating challenges.
   * Points are in Quadrant 1 (both coordinates positive) or Quadrant 3 (both coordinates negative).
   */
  private createPointArrays(): Vector2[][] {

    const x1Range = new Range( -9, 4 );
    const y1Range = new Range( -9, 4 );
    assert && assert( this.xRange.containsRange( x1Range ) && this.yRange.containsRange( y1Range ) );

    let x;
    let y;

    // all points in Quadrant 1
    const quadrant1Points = [];
    for ( x = 1; x < this.xRange.max; x++ ) {
      for ( y = 1; y < this.yRange.max; y++ ) {
        quadrant1Points.push( new Vector2( x, y ) );
      }
    }

    // all points in Quadrant 3
    const quadrant3Points = [];
    for ( x = x1Range.min; x < 0; x++ ) {
      for ( y = y1Range.min; y < 0; y++ ) {
        quadrant3Points.push( new Vector2( x, y ) );
      }
    }

    return [ quadrant1Points, quadrant3Points ];
  }
}

graphingLines.register( 'ChallengeFactory1', ChallengeFactory1 );