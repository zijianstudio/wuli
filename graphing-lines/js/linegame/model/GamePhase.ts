// Copyright 2013-2022, University of Colorado Boulder

/**
 * Phases of a game, mutually exclusive
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import graphingLines from '../../graphingLines.js';

export default class GamePhase extends EnumerationValue {

  public static readonly SETTINGS = new GamePhase(); // user is choosing game settings
  public static readonly PLAY = new GamePhase(); // user is playing the game
  public static readonly RESULTS = new GamePhase(); // user is viewing results at end of a game

  public static readonly enumeration = new Enumeration( GamePhase );
}

graphingLines.register( 'GamePhase', GamePhase );