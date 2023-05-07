// Copyright 2013-2023, University of Colorado Boulder

/**
 * Creates game challenges for Level 2, as specified in the design document.
 * Slope and intercept are uniquely chosen.
 * Point (x1,y1) is not unique, but is chosen such that slope indicator is on the graph.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../dot/js/Range.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import graphingLines from '../../graphingLines.js';
import BaseChallengeFactory from './BaseChallengeFactory.js';
import Challenge from './Challenge.js';
import EquationForm from './EquationForm.js';
import GraphTheLine from './GraphTheLine.js';
import MakeTheEquation from './MakeTheEquation.js';
import ManipulationMode from './ManipulationMode.js';
import ValuePool from './ValuePool.js';

export default class ChallengeFactory2 extends BaseChallengeFactory {

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

    // pools of values for slope and y-intercept
    const slopePool = new ValuePool( this.createSlopeArrays() );
    const yInterceptPool = new ValuePool( this.createYInterceptArrays() );

    // CHALLENGE 1: Graph-the-Line, slope-intercept form
    challenges.push( new GraphTheLine(
      '1: GraphTheLine, required slope, slope variable',
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
        slope = slopePool.chooseRequired();
        description = '5: GraphTheLine, required slope, slope variable';
      }
      else {
        slope = slopePool.chooseOptional();
        description = '5: GraphTheLine, point variable';
      }
      point = BaseChallengeFactory.choosePointForSlope( slope, this.xRange, this.yRange );

      // challenge
      challenges.push( new GraphTheLine( description,
        this.createPointSlopeLine( point, slope ),
        EquationForm.POINT_SLOPE,
        manipulationMode,
        this.xRange, this.yRange ) );
    }

    // CHALLENGE 6: Make-the-Equation, point-slope form, point or slope variable (whichever was not variable above)
    {
      // manipulation mode
      manipulationMode = ValuePool.choose( pointSlopeManipulationModes );

      if ( manipulationMode === ManipulationMode.SLOPE ) {
        slope = slopePool.chooseRequired();
        description = '6: MakeTheEquation, required slope, slope variable';
      }
      else {
        slope = slopePool.chooseOptional();
        description = '6: MakeTheEquation, point variable';
      }
      point = BaseChallengeFactory.choosePointForSlope( slope, this.xRange, this.yRange );

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
   * Creates the 3 sets of slopes that are identified in the design document.
   */
  protected createSlopeArrays(): Fraction[][] {
    return [

      // positive and negative integers
      [
        new Fraction( 1, 1 ),
        new Fraction( 2, 1 ),
        new Fraction( 3, 1 ),
        new Fraction( 4, 1 ),
        new Fraction( 5, 1 ),
        new Fraction( -1, 1 ),
        new Fraction( -2, 1 ),
        new Fraction( -3, 1 ),
        new Fraction( -4, 1 ),
        new Fraction( -5, 1 )
      ],

      // {Fraction[]} positive fractions
      ChallengeFactory2.createPositiveFractionalSlopes(),

      // negative fractions
      [
        new Fraction( -1, 2 ),
        new Fraction( -1, 3 ),
        new Fraction( -1, 4 ),
        new Fraction( -1, 5 ),
        new Fraction( -2, 3 ),
        new Fraction( -3, 4 ),
        new Fraction( -2, 5 ),
        new Fraction( -3, 5 ),
        new Fraction( -4, 5 ),
        new Fraction( -3, 2 ),
        new Fraction( -4, 3 ),
        new Fraction( -5, 2 ),
        new Fraction( -5, 3 ),
        new Fraction( -5, 4 )
      ]
    ];
  }

  /**
   * Creates the sets of y-intercepts used for generating challenges.
   */
  protected createYInterceptArrays(): number[][] {
    return [
      ValuePool.rangeToArray( new Range( this.yRange.min, -1 ) ), // negative intercepts
      ValuePool.rangeToArray( new Range( 1, this.yRange.max ) )   // positive intercepts
    ];
  }

  /**
   * Creates the set of positive fractional slopes that are identified in the design document.
   */
  public static createPositiveFractionalSlopes(): Fraction[] {
    return [
      // positive fractions
      new Fraction( 1, 4 ),
      new Fraction( 1, 5 ),
      new Fraction( 1, 6 ),
      new Fraction( 1, 7 ),
      new Fraction( 2, 5 ),
      new Fraction( 3, 5 ),
      new Fraction( 2, 7 ),
      new Fraction( 3, 7 ),
      new Fraction( 4, 7 ),
      new Fraction( 5, 2 ),
      new Fraction( 3, 2 ),
      new Fraction( 7, 2 ),
      new Fraction( 7, 3 ),
      new Fraction( 7, 4 )
    ];
  }
}

graphingLines.register( 'ChallengeFactory2', ChallengeFactory2 );