// Copyright 2014-2022, University of Colorado Boulder

/**
 * A challenge, used in the balance game, in which the user must predict which
 * way the plank will tilt when the supports are removed.
 *
 * @author John Blanco
 */

import balancingAct from '../../balancingAct.js';
import BalancingActStrings from '../../BalancingActStrings.js';
import ColumnState from '../../common/model/ColumnState.js';
import BalanceGameChallenge from './BalanceGameChallenge.js';

const whatWillHappenString = BalancingActStrings.whatWillHappen;

class TiltPredictionChallenge extends BalanceGameChallenge {

  /**
   * @param fixedMasses
   */
  constructor( fixedMasses ) {
    super( ColumnState.DOUBLE_COLUMNS );
    Array.prototype.push.apply( this.fixedMassDistancePairs, fixedMasses );

    // Set up the challenge view configuration, which provides information to
    // the view about how this challenge should be displayed.
    this.viewConfig = {
      title: whatWillHappenString,
      showMassEntryDialog: false,
      showTiltPredictionSelector: true
    };
  }

  // statics

  /**
   * convenience factory method for creating a mass deduction challenge
   * @returns {MassDeductionChallenge}
   * @public
   */
  static create( fixedMass1, fixedMass1DistanceFromCenter, fixedMass2, fixedMass2DistanceFromCenter ) {

    // Add the fixed masses and their distances from the center of the balance.
    const fixedMassesList = [];
    fixedMassesList.push( { mass: fixedMass1, distance: fixedMass1DistanceFromCenter } );
    fixedMassesList.push( { mass: fixedMass2, distance: fixedMass2DistanceFromCenter } );

    // Create the actual challenge.
    return new TiltPredictionChallenge( fixedMassesList );
  }
}

balancingAct.register( 'TiltPredictionChallenge', TiltPredictionChallenge );

export default TiltPredictionChallenge;