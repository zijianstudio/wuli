// Copyright 2013-2023, University of Colorado Boulder

/**
 * Creates game challenges for Level 4, as specified in the design document.
 * Uses the same sets of slopes and y-intercepts as Level 2, but generates different challenges.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import graphingLines from '../../graphingLines.js';
import BaseChallengeFactory from './BaseChallengeFactory.js';
import Challenge from './Challenge.js';
import ChallengeFactory2 from './ChallengeFactory2.js';
import EquationForm from './EquationForm.js';
import GraphTheLine from './GraphTheLine.js';
import MakeTheEquation from './MakeTheEquation.js';
import ManipulationMode from './ManipulationMode.js';
import ValuePool from './ValuePool.js';

export default class ChallengeFactory4 extends ChallengeFactory2 {

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
    let positiveSlopes;

    // pools of values for slope and y-intercept
    const slopePool = new ValuePool( this.createSlopeArrays() );
    const yInterceptPool = new ValuePool( this.createYInterceptArrays() );

    // equation form for 3rd challenge of each type
    const equationForms = [ EquationForm.SLOPE_INTERCEPT, EquationForm.POINT_SLOPE ];

    // CHALLENGE 1: Make-the-Equation, slope-intercept form
    challenges.push( new MakeTheEquation(
      '1: MakeTheEquation, required y-intercepts, slope and intercept variable',
      this.createSlopeInterceptLine( slopePool.chooseOptional(), yInterceptPool.chooseRequired() ),
      EquationForm.SLOPE_INTERCEPT,
      ManipulationMode.SLOPE_INTERCEPT,
      this.xRange, this.yRange ) );

    // CHALLENGE 2: Make-the-Equation, point-slope form
    slope = slopePool.chooseRequired();
    point = BaseChallengeFactory.choosePointForSlope( slope, this.xRange, this.yRange );
    challenges.push( new MakeTheEquation(
      '2: MakeTheEquation, required slope, point and slope variable',
      this.createPointSlopeLine( point, slope ),
      EquationForm.POINT_SLOPE,
      ManipulationMode.POINT_SLOPE,
      this.xRange, this.yRange ) );

    // CHALLENGE 3: Make-the-Equation, slope-intercept or point-slope form (random choice)
    if ( ValuePool.choose( equationForms ) === EquationForm.SLOPE_INTERCEPT ) {

      // Make-the-Equation, slope-intercept form
      challenges.push( new MakeTheEquation(
        '3: MakeTheEquation, slope and intercept variable',
        this.createSlopeInterceptLine( slopePool.chooseOptional(), yInterceptPool.chooseOptional() ),
        EquationForm.SLOPE_INTERCEPT,
        ManipulationMode.SLOPE_INTERCEPT,
        this.xRange, this.yRange ) );
    }
    else {

      // Make-the-Equation, point-slope form
      slope = slopePool.chooseRequired();
      point = BaseChallengeFactory.choosePointForSlope( slope, this.xRange, this.yRange );
      challenges.push( new MakeTheEquation(
        '3: MakeTheEquation , required slopes, point and slope variable',
        this.createPointSlopeLine( point, slope ),
        EquationForm.POINT_SLOPE,
        ManipulationMode.POINT_SLOPE,
        this.xRange, this.yRange ) );
    }

    // CHALLENGE 4: Graph-the-Line, slope-intercept form, slope and intercept variable
    challenges.push( new GraphTheLine(
      '4: GraphTheLine, required y-intercept, slope and intercept variable',
      this.createSlopeInterceptLine( slopePool.chooseOptional(), yInterceptPool.chooseRequired() ),
      EquationForm.SLOPE_INTERCEPT,
      ManipulationMode.SLOPE_INTERCEPT,
      this.xRange, this.yRange ) );

    // CHALLENGE 5: Graph-the-Line, point-slope form
    slope = slopePool.chooseRequired();
    point = BaseChallengeFactory.choosePointForSlope( slope, this.xRange, this.yRange );
    challenges.push( new GraphTheLine(
      '5: GraphTheLine, required slope, point and slope variable',
      this.createPointSlopeLine( point, slope ),
      EquationForm.POINT_SLOPE,
      ManipulationMode.POINT_SLOPE,
      this.xRange, this.yRange ) );

    // CHALLENGE 6: Graph-the-Line, slope-intercept or point-slope form (random choice), 2 points.
    // Choose y-intercept or point such that (x2,y2) is off the graph, so that user is forced to invert the slope.
    {
      // choose a positive fractional slope
      positiveSlopes = ChallengeFactory2.createPositiveFractionalSlopes();
      positiveSlopes.push( new Fraction( 2, 1 ) );
      positiveSlopes.push( new Fraction( 3, 1 ) );
      positiveSlopes.push( new Fraction( 4, 1 ) );
      positiveSlopes.push( new Fraction( 5, 1 ) );
      slope = ValuePool.choose( positiveSlopes );

      point = BaseChallengeFactory.choosePointForSlopeInversion( slope, this.xRange, this.yRange );

      if ( ValuePool.choose( equationForms ) === EquationForm.SLOPE_INTERCEPT ) {

        // Graph-the-Line, slope-intercept, 2 points variable
        challenges.push( new GraphTheLine(
          '6: GraphTheLine, force slope inversion, 2 points variable',
          this.createSlopeInterceptLine( slope, point.y ),
          EquationForm.SLOPE_INTERCEPT,
          ManipulationMode.TWO_POINTS,
          this.xRange, this.yRange ) );
      }
      else {

        // Graph-the-Line, point-slope, 2 points variable
        challenges.push( new GraphTheLine(
          '6: GraphTheLine, force slope inversion, 2 points variable',
          this.createPointSlopeLine( point, slope ),
          EquationForm.POINT_SLOPE,
          ManipulationMode.TWO_POINTS,
          this.xRange, this.yRange ) );
      }
    }

    return challenges;
  }
}

graphingLines.register( 'ChallengeFactory4', ChallengeFactory4 );