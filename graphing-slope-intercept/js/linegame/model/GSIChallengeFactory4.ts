// Copyright 2017-2023, University of Colorado Boulder

/**
 * Creates game challenges for Level 4 in the 'Graphing Slope-Intercept' sim.
 * Identical to level 3, except with different Place-the-Point challenges.
 * See createPlaceThePointChallenges.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Line from '../../../../graphing-lines/js/common/model/Line.js';
import EquationForm from '../../../../graphing-lines/js/linegame/model/EquationForm.js';
import PlaceThePoints from '../../../../graphing-lines/js/linegame/model/PlaceThePoints.js';
import ValuePool from '../../../../graphing-lines/js/linegame/model/ValuePool.js';
import graphingSlopeIntercept from '../../graphingSlopeIntercept.js';
import GSIChallengeFactory3 from './GSIChallengeFactory3.js';

export default class GSIChallengeFactory4 extends GSIChallengeFactory3 {

  public constructor() {
    super();
  }

  /**
   * Level 4 has a different set of place-the-point challenges, so override this function.
   */
  protected override createPlaceThePointChallenges(): PlaceThePoints[] {

    const challenges: PlaceThePoints[] = [];

    // CHALLENGE 5
    const yIntercepts = ValuePool.rangeToArray( this.yRange, true /* excludeZero */ );
    const yIntercept = ValuePool.choose( yIntercepts );
    challenges.push( new PlaceThePoints(
      '5: PlaceThePoints, slope=0, random y-intercept (not zero)',
      new Line( 0, yIntercept, 1, yIntercept ),
      EquationForm.SLOPE_INTERCEPT,
      this.xRange, this.yRange ) );

    // CHALLENGE 6
    const xIntercepts = ValuePool.rangeToArray( this.xRange, true /* excludeZero */ );
    const xIntercept = ValuePool.choose( xIntercepts );
    challenges.push( new PlaceThePoints(
      '6: PlaceThePoints, slope=undefined, random x-intercept (not zero)',
      new Line( xIntercept, 0, xIntercept, 1 ),
      EquationForm.SLOPE_INTERCEPT,
      this.xRange, this.yRange ) );

    return challenges;
  }
}

graphingSlopeIntercept.register( 'GSIChallengeFactory4', GSIChallengeFactory4 );