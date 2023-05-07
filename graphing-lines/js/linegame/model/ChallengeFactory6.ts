// Copyright 2013-2023, University of Colorado Boulder

/**
 * Creates game challenges for Level 6, as specified in the design document.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../dot/js/Range.js';
import { Color } from '../../../../scenery/js/imports.js';
import Line from '../../common/model/Line.js';
import graphingLines from '../../graphingLines.js';
import BaseChallengeFactory from './BaseChallengeFactory.js';
import Challenge from './Challenge.js';
import ChallengeFactory5 from './ChallengeFactory5.js';
import EquationForm from './EquationForm.js';
import GraphTheLine from './GraphTheLine.js';
import ManipulationMode from './ManipulationMode.js';
import PlaceThePoints from './PlaceThePoints.js';
import ValuePool from './ValuePool.js';

export default class ChallengeFactory6 extends BaseChallengeFactory {

  public constructor() {
    super();
  }

  /**
   * Creates challenges for this game level.
   */
  public override createChallenges(): Challenge[] {

    const challenges = [];
    let challengeNumber = 1;

    // for y-intercept manipulation challenges
    const yIntercepts = ValuePool.rangeToArray( this.yRange );

    // CHALLENGE 1:Place-the-Point, slope-intercept form, slope=0 (horizontal line), slope and intercept variable
    const yIntercept = ValuePool.choose( yIntercepts );
    challenges.push( new PlaceThePoints(
      `${challengeNumber++}: PlaceThePoints, slope=0, slope and intercept variable`,
      Line.createSlopeIntercept( 0, 1, yIntercept ),
      EquationForm.SLOPE_INTERCEPT,
      this.xRange, this.yRange ) );

    // CHALLENGES 2-4:
    // 3 Graph-the-Line challenges with mismatched representations
    // (eg, point-slope equation with slope-intercept manipulators)
    {
      // we'll pick 3 from here
      const equationForms = [ EquationForm.SLOPE_INTERCEPT, EquationForm.SLOPE_INTERCEPT, EquationForm.POINT_SLOPE, EquationForm.POINT_SLOPE ];
      assert && assert( equationForms.length === 4 );

      for ( let i = 0; i < 3; i++ ) {

        const equationForm = ValuePool.choose( equationForms );

        // random points
        const range = new Range( -7, 7 );
        assert && assert( this.xRange.containsRange( range ) && this.yRange.containsRange( range ) );
        const xList = ValuePool.rangeToArray( range );
        const yList = ValuePool.rangeToArray( range );
        const x1 = 0; // y-intercept must be an integer since we're mismatching representations
        const y1 = ValuePool.choose( yList );
        let x2 = ValuePool.choose( xList );
        if ( x2 === x1 ) {
          x2 = ValuePool.choose( xList ); // prevent undefined slope
        }
        let y2 = ValuePool.choose( yList );

        // exclude slopes of +1 and -1
        const slope = ( y2 - y1 ) / ( x2 - x1 );
        if ( slope === 1 || slope === -1 ) {
          y2 = ValuePool.choose( yList );
        }

        // challenge, with mismatched representations
        const line = new Line( x1, y1, x2, y2, Color.BLACK );
        if ( equationForm === EquationForm.SLOPE_INTERCEPT ) {
          challenges.push( new GraphTheLine(
            `${challengeNumber++}: GraphTheLine, slope-intercept form, point and slope variable`,
            line,
            equationForm,
            ManipulationMode.POINT_SLOPE,
            this.xRange, this.yRange ) );
        }
        else {
          challenges.push( new GraphTheLine(
            `${challengeNumber++}: GraphTheLine, point-slope form, slope and intercept variable`,
            line,
            equationForm,
            ManipulationMode.SLOPE_INTERCEPT,
            this.xRange, this.yRange ) );
        }
      }
    }

    // CHALLENGES 5 & 6: 2 Place-the-Point challenges (same as level 5)
    ChallengeFactory5.addPlaceThePointsChallenges( challenges, this.xRange, this.yRange );

    return challenges;
  }
}

graphingLines.register( 'ChallengeFactory6', ChallengeFactory6 );