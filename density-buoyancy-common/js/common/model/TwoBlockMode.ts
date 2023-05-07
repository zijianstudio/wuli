// Copyright 2022, University of Colorado Boulder

/**
 * Determines the mode difference between one block and two blocks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

export default class TwoBlockMode extends EnumerationValue {
  public static readonly ONE_BLOCK = new TwoBlockMode();
  public static readonly TWO_BLOCKS = new TwoBlockMode();

  public static readonly enumeration = new Enumeration( TwoBlockMode, {
    phetioDocumentation: 'Whether one or two blocks are visible'
  } );
}

densityBuoyancyCommon.register( 'TwoBlockMode', TwoBlockMode );
