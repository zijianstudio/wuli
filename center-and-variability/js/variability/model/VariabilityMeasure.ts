// Copyright 2023, University of Colorado Boulder

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import centerAndVariability from '../../centerAndVariability.js';

/**
 * VariabiltyMeasure is used to identify which kind of variability the user has selected to explore.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export default class VariabiltyMeasure extends EnumerationValue {
  public static readonly RANGE = new VariabiltyMeasure();
  public static readonly IQR = new VariabiltyMeasure();
  public static readonly MAD = new VariabiltyMeasure();
  private static readonly enumeration = new Enumeration( VariabiltyMeasure );
}

centerAndVariability.register( 'VariabiltyMeasure', VariabiltyMeasure );