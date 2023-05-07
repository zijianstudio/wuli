// Copyright 2013-2023, University of Colorado Boulder

/**
 * Creates game challenges for Level 3, as specified in the design document.
 * Uses the same sets of slopes and y-intercepts as Level 2, but generates different challenges.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import graphingLines from '../../graphingLines.js';
import BaseChallengeFactory from './BaseChallengeFactory.js';
import ChallengeFactory2 from './ChallengeFactory2.js';
import EquationForm from './EquationForm.js';
import GraphTheLine from './GraphTheLine.js';
import MakeTheEquation from './MakeTheEquation.js';
import ManipulationMode from './ManipulationMode.js';
import ValuePool from './ValuePool.js';
import Challenge from './Challenge.js';

export default class ChallengeFactory3 extends ChallengeFactory2 {

  public constructor() {
    super();
  }

  /**
   * Creates challenges for this game level.
   */
  public override createChallenges(): Challenge[] {

    const challenges = [];

    // hoisted vars
    let slope;
    let point;

    // pools of values for slope and y-intercept
    const slopePool = new ValuePool( this.createSlopeArrays() );
    const yInterceptPool = new ValuePool( this.createYInterceptArrays() );

    // CHALLENGE 1: Graph-the-Line, slope-intercept form
    challenges.push( new GraphTheLine(
      '1: GraphTheLine, required y-intercept, y-intercept variable',
      this.createSlopeInterceptLine( slopePool.chooseOptional(), yInterceptPool.chooseRequired() ),
      EquationForm.SLOPE_INTERCEPT,
      ManipulationMode.SLOPE_INTERCEPT,
      this.xRange, this.yRange ) );

    // CHALLENGE 2: Graph-the-Line, point-slope form
    slope = slopePool.chooseRequired();
    point = BaseChallengeFactory.choosePointForSlope( slope, this.xRange, this.yRange );
    challenges.push( new GraphTheLine(
      '2: GraphTheLine, required slope, point and slope variable',
      this.createPointSlopeLine( point, slope ),
      EquationForm.POINT_SLOPE,
      ManipulationMode.POINT_SLOPE,
      this.xRange, this.yRange ) );

    // equation form for 3rd challenge of each type
    const equationForms = [ EquationForm.SLOPE_INTERCEPT, EquationForm.POINT_SLOPE ];

    // CHALLENGE 3: Graph-the-Line, slope-intercept or point-slope form (random choice), 2 variables
    if ( ValuePool.choose( equationForms ) === EquationForm.SLOPE_INTERCEPT ) {

      // Graph-the-Line, slope-intercept form
      challenges.push( new GraphTheLine(
        '3: GraphTheLine, required slopes, slope and intercept variable',
        this.createSlopeInterceptLine( slopePool.chooseRequired(), yInterceptPool.chooseOptional() ),
        EquationForm.SLOPE_INTERCEPT,
        ManipulationMode.SLOPE_INTERCEPT,
        this.xRange, this.yRange ) );
    }
    else {

      // Graph-the-Line, point-slope form
      slope = slopePool.chooseOptional();
      point = BaseChallengeFactory.choosePointForSlope( slope, this.xRange, this.yRange );
      challenges.push( new GraphTheLine(
        '3: GraphTheLine, point and slope variable',
        this.createPointSlopeLine( point, slope ),
        EquationForm.POINT_SLOPE,
        ManipulationMode.POINT_SLOPE,
        this.xRange, this.yRange ) );
    }

    // CHALLENGE 4: Make-the-Equation, slope-intercept form
    challenges.push( new MakeTheEquation(
      '4: MakeTheEquation, required y-intercept, slope and intercetp variable',
      this.createSlopeInterceptLine( slopePool.chooseOptional(), yInterceptPool.chooseRequired() ),
      EquationForm.SLOPE_INTERCEPT,
      ManipulationMode.SLOPE_INTERCEPT,
      this.xRange, this.yRange ) );

    // CHALLENGE 5: Make-the-Equation, point-slope form
    slope = slopePool.chooseRequired();
    point = BaseChallengeFactory.choosePointForSlope( slope, this.xRange, this.yRange );
    challenges.push( new MakeTheEquation(
      '5: MakeTheEquation, required slope, point and slope variable',
      this.createPointSlopeLine( point, slope ),
      EquationForm.POINT_SLOPE,
      ManipulationMode.POINT_SLOPE,
      this.xRange, this.yRange ) );

    // CHALLENGE 6: Make-the-Equation, slope-intercept or point-slope form (whichever wasn't chosen above), 2 variables
    if ( ValuePool.choose( equationForms ) === EquationForm.SLOPE_INTERCEPT ) {

      // Make-the-Equation, slope-intercept
      challenges.push( new MakeTheEquation(
        '6: MakeTheEquation, slope and intercept variable',
        this.createSlopeInterceptLine( slopePool.chooseOptional(), yInterceptPool.chooseOptional() ),
        EquationForm.SLOPE_INTERCEPT,
        ManipulationMode.SLOPE_INTERCEPT,
        this.xRange, this.yRange ) );
    }
    else {

      // Make-the-Equation, point-slope form
      slope = slopePool.chooseOptional();
      point = BaseChallengeFactory.choosePointForSlope( slope, this.xRange, this.yRange );
      challenges.push( new MakeTheEquation(
        '6: MakeTheEquation, point and slope variable',
        this.createPointSlopeLine( point, slope ),
        EquationForm.POINT_SLOPE,
        ManipulationMode.POINT_SLOPE,
        this.xRange, this.yRange ) );
    }

    return challenges;
  }
}

graphingLines.register( 'ChallengeFactory3', ChallengeFactory3 );