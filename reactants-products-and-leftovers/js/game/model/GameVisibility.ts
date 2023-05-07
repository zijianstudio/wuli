// Copyright 2020-2022, University of Colorado Boulder

/**
 * Enumeration that describes the visibility choices for the Game.
 * The inverted logic of "Show" vs "Hide" isn't great, but it matches the UI and prevents us from having to use
 * adapter Properties. See https://github.com/phetsims/reactants-products-and-leftovers/issues/68.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';

export default class GameVisibility extends EnumerationValue {

  public static readonly SHOW_ALL = new GameVisibility();
  public static readonly HIDE_MOLECULES = new GameVisibility();
  public static readonly HIDE_NUMBERS = new GameVisibility();

  public static readonly enumeration = new Enumeration( GameVisibility );
}

reactantsProductsAndLeftovers.register( 'GameVisibility', GameVisibility );