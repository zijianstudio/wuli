// Copyright 2020-2022, University of Colorado Boulder

/**
 * Data type that holds both terms of the ratio
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */


import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import ratioAndProportion from '../../ratioAndProportion.js';


class RatioTerm extends EnumerationValue {
  public static readonly ANTECEDENT = new RatioTerm();
  public static readonly CONSEQUENT = new RatioTerm();

  public static readonly enumeration = new Enumeration( RatioTerm );
}

ratioAndProportion.register( 'RatioTerm', RatioTerm );
export default RatioTerm;
