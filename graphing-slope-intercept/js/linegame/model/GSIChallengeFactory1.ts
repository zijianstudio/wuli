// Copyright 2017-2023, University of Colorado Boulder

/**
 * Creates game challenges for Level 1 in the 'Graphing Slope-Intercept' sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import BaseChallengeFactory from '../../../../graphing-lines/js/linegame/model/BaseChallengeFactory.js';
import Challenge from '../../../../graphing-lines/js/linegame/model/Challenge.js';
import EquationForm from '../../../../graphing-lines/js/linegame/model/EquationForm.js';
import GraphTheLine from '../../../../graphing-lines/js/linegame/model/GraphTheLine.js';
import MakeTheEquation from '../../../../graphing-lines/js/linegame/model/MakeTheEquation.js';
import ManipulationMode from '../../../../graphing-lines/js/linegame/model/ManipulationMode.js';
import ValuePool from '../../../../graphing-lines/js/linegame/model/ValuePool.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import graphingSlopeIntercept from '../../graphingSlopeIntercept.js';

export default class GSIChallengeFactory1 extends BaseChallengeFactory {

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

    const challenges: Challenge[] = [];

    if ( dotRandom.nextBoolean() ) {

      // CHALLENGE 1
      challenges.push( new GraphTheLine(
        '1: GraphTheLine, required slope, slope variable',
        this.createSlopeInterceptLine( slopePool.chooseRequired(), yInterceptPool.chooseOptional() ),
        EquationForm.SLOPE_INTERCEPT,
        ManipulationMode.SLOPE,
        this.xRange, this.yRange ) );

      // CHALLENGE 2
      challenges.push( new MakeTheEquation(
        '2: MakeTheEquation, y-intercept variable',
        this.createSlopeInterceptLine( slopePool.chooseOptional(), yInterceptPool.chooseOptional() ),
        EquationForm.SLOPE_INTERCEPT,
        ManipulationMode.INTERCEPT,
        this.xRange, this.yRange ) );
    }
    else {

      // CHALLENGE 1
      challenges.push( new GraphTheLine(
        '1: GraphTheLine, y-intercept variable',
        this.createSlopeInterceptLine( slopePool.chooseOptional(), yInterceptPool.chooseOptional() ),
        EquationForm.SLOPE_INTERCEPT,
        ManipulationMode.INTERCEPT,
        this.xRange, this.yRange ) );

      // CHALLENGE 2
      challenges.push( new MakeTheEquation(
        '2: MakeTheEquation, required slope, slope variable',
        this.createSlopeInterceptLine( slopePool.chooseRequired(), yInterceptPool.chooseOptional() ),
        EquationForm.SLOPE_INTERCEPT,
        ManipulationMode.SLOPE,
        this.xRange, this.yRange ) );
    }

    // CHALLENGE 3
    challenges.push( new GraphTheLine(
      '3: GraphTheLine, required slope, slope variable',
      this.createSlopeInterceptLine( slopePool.chooseRequired(), yInterceptPool.chooseOptional() ),
      EquationForm.SLOPE_INTERCEPT,
      ManipulationMode.SLOPE,
      this.xRange, this.yRange ) );

    // CHALLENGE 4
    challenges.push( new GraphTheLine(
      '4: GraphTheLine, required y-intercept, y-intercept variable',
      this.createSlopeInterceptLine( slopePool.chooseOptional(), yInterceptPool.chooseRequired() ),
      EquationForm.SLOPE_INTERCEPT,
      ManipulationMode.INTERCEPT,
      this.xRange, this.yRange ) );

    // CHALLENGE 5
    challenges.push( new MakeTheEquation(
      '5: MakeTheEquation, required slope, slope variable',
      this.createSlopeInterceptLine( slopePool.chooseRequired(), yInterceptPool.chooseOptional() ),
      EquationForm.SLOPE_INTERCEPT,
      ManipulationMode.SLOPE,
      this.xRange, this.yRange ) );

    // CHALLENGE 6
    challenges.push( new MakeTheEquation(
      '6: MakeTheEquation, required y-intercept, y-intercept variable',
      this.createSlopeInterceptLine( slopePool.chooseOptional(), yInterceptPool.chooseRequired() ),
      EquationForm.SLOPE_INTERCEPT,
      ManipulationMode.INTERCEPT,
      this.xRange, this.yRange ) );

    assert && assert( slopePool.isEmpty(), 'some required slope was not used' );
    assert && assert( yInterceptPool.isEmpty(), 'some required y-intercept was not used' );

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
}

graphingSlopeIntercept.register( 'GSIChallengeFactory1', GSIChallengeFactory1 );