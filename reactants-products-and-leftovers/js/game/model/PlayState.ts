// Copyright 2014-2023, University of Colorado Boulder

/**
 * States during the 'play' phase of a game (GamePhase.PlayState), mutually exclusive.
 * For lack of better names, the state names correspond to the button that is visible.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';

export default class PlayState extends EnumerationValue {

  public static readonly FIRST_CHECK = new PlayState(); // 'Check' button is visible for the first time
  public static readonly TRY_AGAIN = new PlayState(); // 'Try Again' button is visible
  public static readonly SECOND_CHECK = new PlayState(); // 'Check' button is visible for the second time
  public static readonly SHOW_ANSWER = new PlayState(); // 'Show Answer' button is visible
  public static readonly NEXT = new PlayState(); // 'Next' button is visible
  public static readonly NONE = new PlayState(); // use this value when game is not in the 'play' phase

  public static readonly enumeration = new Enumeration( PlayState );

  // States where the user can change their guess via spinners.
  public static readonly INTERACTIVE_STATES = [ PlayState.FIRST_CHECK, PlayState.TRY_AGAIN, PlayState.SECOND_CHECK ];
}

reactantsProductsAndLeftovers.register( 'PlayState', PlayState );