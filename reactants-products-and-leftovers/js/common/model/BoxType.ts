// Copyright 2014-2022, University of Colorado Boulder

/**
 * Enum for the 2 boxes that represent the 2 states of a reaction.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';

export default class BoxType extends EnumerationValue {

  public static readonly BEFORE = new BoxType(); // before the reaction started
  public static readonly AFTER = new BoxType(); // after the reaction completes

  public static readonly enumeration = new Enumeration( BoxType );
}

reactantsProductsAndLeftovers.register( 'BoxType', BoxType );