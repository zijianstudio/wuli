// Copyright 2020-2022, University of Colorado Boulder

/**
 * Data type that holds the possible cue visuals that can be displayed for each ratio hand.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import ratioAndProportion from '../../ratioAndProportion.js';

class CueDisplay extends EnumerationValue {
  public static readonly NONE = new CueDisplay();
  public static readonly W_S = new CueDisplay();
  public static readonly UP_DOWN = new CueDisplay();
  public static readonly ARROWS = new CueDisplay();

  public static readonly enumeration = new Enumeration( CueDisplay );
}

ratioAndProportion.register( 'CueDisplay', CueDisplay );
export default CueDisplay;
