// Copyright 2023, University of Colorado Boulder

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import centerAndVariability from '../../centerAndVariability.js';

/**
 * DistributionType is used to identify the selected distribution type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export default class DistributionType extends EnumerationValue {
  public static readonly KICKER_1 = new DistributionType();
  public static readonly KICKER_2 = new DistributionType();
  public static readonly KICKER_3 = new DistributionType();
  public static readonly KICKER_4 = new DistributionType();

  private static readonly enumeration = new Enumeration( DistributionType, {} );
}

centerAndVariability.register( 'DistributionType', DistributionType );