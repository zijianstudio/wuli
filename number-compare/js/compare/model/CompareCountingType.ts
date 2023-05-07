// Copyright 2021-2022, University of Colorado Boulder

/**
 * Counting representation types for the 'Compare' screen.
 *
 * @author Chris Klusendorf
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import numberCompare from '../../numberCompare.js';

class CompareCountingType extends EnumerationValue {
  public static readonly BLOCKS = new CompareCountingType();
  public static readonly NUMBER_LINE = new CompareCountingType();
  public static readonly NONE = new CompareCountingType();

  public static readonly enumeration = new Enumeration( CompareCountingType );
}

numberCompare.register( 'CompareCountingType', CompareCountingType );
export default CompareCountingType;