// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model for the 'Line Game' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import graphingLines from '../../graphingLines.js';
import BaseGameModel from './BaseGameModel.js';
import ChallengeFactory1 from './ChallengeFactory1.js';
import ChallengeFactory2 from './ChallengeFactory2.js';
import ChallengeFactory3 from './ChallengeFactory3.js';
import ChallengeFactory4 from './ChallengeFactory4.js';
import ChallengeFactory5 from './ChallengeFactory5.js';
import ChallengeFactory6 from './ChallengeFactory6.js';

export default class LineGameModel extends BaseGameModel {

  public constructor( tandem: Tandem ) {

    // a challenge factory for each level
    const challengeFactories = [
      new ChallengeFactory1(),
      new ChallengeFactory2(),
      new ChallengeFactory3(),
      new ChallengeFactory4(),
      new ChallengeFactory5(),
      new ChallengeFactory6()
    ];

    super( challengeFactories, tandem );
  }
}

graphingLines.register( 'LineGameModel', LineGameModel );