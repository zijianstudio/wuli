// Copyright 2022, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */


import Enumeration from '../../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../../phet-core/js/EnumerationValue.js';
import ratioAndProportion from '../../../ratioAndProportion.js';

class DistanceResponseType extends EnumerationValue {

  // Distance Progress is generally the "closer to" and "farther from" description.
  public static readonly DISTANCE_PROGRESS = new DistanceResponseType();

  // Distance Region is generally the qualitative region of how far one hand is to the other.
  public static readonly DISTANCE_REGION = new DistanceResponseType();

  // Combo is an algorithm to use either depending on the state of the describer.
  public static readonly COMBO = new DistanceResponseType();

  public static readonly enumeration = new Enumeration( DistanceResponseType );
}

ratioAndProportion.register( 'DistanceResponseType', DistanceResponseType );
export default DistanceResponseType;