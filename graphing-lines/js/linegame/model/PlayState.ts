// Copyright 2013-2022, University of Colorado Boulder

/**
 * States during the 'play' phase of a game, mutually exclusive. (See GamePhase.)
 * For lack of better names, the state names correspond to the main action that
 * the user can take in that state.  For example. the FIRST_CHECK state is where the user
 * has their first opportunity to press the 'Check' button.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import graphingLines from '../../graphingLines.js';

export default class PlayState extends EnumerationValue {

  public static readonly FIRST_CHECK = new PlayState(); // 'Check' button is visible for the first time
  public static readonly TRY_AGAIN = new PlayState(); // 'Try Again' button is visible
  public static readonly SECOND_CHECK = new PlayState(); // 'Check' button is visible for the second time
  public static readonly SHOW_ANSWER = new PlayState(); // 'Show Answer' button is visible
  public static readonly NEXT = new PlayState(); // 'Next' button is visible
  public static readonly NONE = new PlayState(); // use this value when game is not in the 'play' phase

  public static readonly enumeration = new Enumeration( PlayState );
}

graphingLines.register( 'PlayState', PlayState );