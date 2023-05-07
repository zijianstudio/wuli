// Copyright 2017-2023, University of Colorado Boulder

/**
 * Creates game challenges for Level 3 in the 'Graphing Slope-Intercept' sim.
 * Uses the same sets of slopes and y-intercepts as Level 2, but generates different challenges.
 * See createChallenges.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../dot/js/Range.js';
import Line from '../../../../graphing-lines/js/common/model/Line.js';
import Challenge from '../../../../graphing-lines/js/linegame/model/Challenge.js';
import EquationForm from '../../../../graphing-lines/js/linegame/model/EquationForm.js';
import GraphTheLine from '../../../../graphing-lines/js/linegame/model/GraphTheLine.js';
import MakeTheEquation from '../../../../graphing-lines/js/linegame/model/MakeTheEquation.js';
import ManipulationMode from '../../../../graphing-lines/js/linegame/model/ManipulationMode.js';
import PlaceThePoints from '../../../../graphing-lines/js/linegame/model/PlaceThePoints.js';
import ValuePool from '../../../../graphing-lines/js/linegame/model/ValuePool.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import graphingSlopeIntercept from '../../graphingSlopeIntercept.js';
import GSIChallengeFactory2 from './GSIChallengeFactory2.js';

export default class GSIChallengeFactory3 extends GSIChallengeFactory2 {

  public constructor() {
    super();
  }

  /**
   * Creates challenges for this game level.
   */
  public override createChallenges(): Challenge[] {

    // pools of values for slope and y-intercept
    const slopePool = new ValuePool<Fraction>( this.createSlopeArrays() );
    const yInterceptPool = new ValuePool<number>( this.createYInterceptArrays() );

    let challenges: Challenge[] = [];

    // CHALLENGE 1
    challenges.push( new GraphTheLine(
      '1: GraphTheLine, required y-intercept, slope and intercept variable',
      this.createSlopeInterceptLine( slopePool.chooseOptional(), yInterceptPool.chooseRequired() ),
      EquationForm.SLOPE_INTERCEPT,
      ManipulationMode.SLOPE_INTERCEPT,
      this.xRange, this.yRange ) );

    // CHALLENGE 2
    challenges.push( new GraphTheLine(
      '2: GraphTheLine, required slope, slope and intercept variable',
      this.createSlopeInterceptLine( slopePool.chooseRequired(), yInterceptPool.chooseOptional() ),
      EquationForm.SLOPE_INTERCEPT,
      ManipulationMode.SLOPE_INTERCEPT,
      this.xRange, this.yRange ) );

    // CHALLENGE 3
    challenges.push( new MakeTheEquation(
      '3: MakeTheEquation, required slope, required y-intercept, slope and intercept variable',
      this.createSlopeInterceptLine( slopePool.chooseRequired(), yInterceptPool.chooseRequired() ),
      EquationForm.SLOPE_INTERCEPT,
      ManipulationMode.SLOPE_INTERCEPT,
      this.xRange, this.yRange ) );

    // CHALLENGE 4
    challenges.push( new MakeTheEquation(
      '4: MakeTheEquation, required slope, slope and intercept variable',
      this.createSlopeInterceptLine( slopePool.chooseRequired(), yInterceptPool.chooseOptional() ),
      EquationForm.SLOPE_INTERCEPT,
      ManipulationMode.SLOPE_INTERCEPT,
      this.xRange, this.yRange ) );

    // CHALLENGE 5 & 6
    const placeThePointChallenges = this.createPlaceThePointChallenges();
    challenges = challenges.concat( placeThePointChallenges );

    assert && assert( slopePool.isEmpty(), 'some required slope was not used' );
    assert && assert( yInterceptPool.isEmpty(), 'some required y-intercept was not used' );

    return challenges;
  }

  /**
   * Creates place-the-point challenges for this level.
   */
  protected createPlaceThePointChallenges(): PlaceThePoints[] {

    const challenges: PlaceThePoints[] = [];

    const range = new Range( -5, 5 );
    assert && assert( this.xRange.containsRange( range ) && this.yRange.containsRange( range ) );
    const x1 = 0; // causes y-intercept to be an integer
    const yList = ValuePool.rangeToArray( range );
    const riseList = ValuePool.rangeToArray( range, true /* exclude zero slope */ );
    const runList = ValuePool.rangeToArray( range, true /* exclude undefined slope */ );

    // CHALLENGE 5
    let y1 = ValuePool.choose( yList );
    let rise = ValuePool.choose( riseList );
    let run = ValuePool.choose( runList );
    if ( Math.abs( rise / run ) === 1 ) { // prevent unit slope
      run = ValuePool.choose( runList );
    }
    challenges.push( new PlaceThePoints(
      '5: PlaceThePoints, random points, integer y-intercept',
      new Line( x1, y1, x1 + run, y1 + rise ),
      EquationForm.SLOPE_INTERCEPT,
      this.xRange, this.yRange ) );

    // CHALLENGE 6
    y1 = ValuePool.choose( yList );
    rise = ValuePool.choose( riseList );
    run = ValuePool.choose( runList );
    if ( Math.abs( rise / run ) === 1 ) { // prevent unit slope
      run = ValuePool.choose( runList );
    }
    challenges.push( new PlaceThePoints(
      '6: PlaceThePoints, random points, integer y-intercept',
      new Line( x1, y1, x1 + run, y1 + rise ),
      EquationForm.SLOPE_INTERCEPT,
      this.xRange, this.yRange ) );

    return challenges;
  }
}

graphingSlopeIntercept.register( 'GSIChallengeFactory3', GSIChallengeFactory3 );