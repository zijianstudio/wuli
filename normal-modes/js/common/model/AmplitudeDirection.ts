// Copyright 2020-2022, University of Colorado Boulder

/**
 * Direction of motion for masses.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import normalModes from '../../normalModes.js';

export default class AmplitudeDirection extends EnumerationValue {

  public static readonly HORIZONTAL = new AmplitudeDirection();
  public static readonly VERTICAL = new AmplitudeDirection();

  public static readonly enumeration = new Enumeration( AmplitudeDirection );
}

normalModes.register( 'AmplitudeDirection', AmplitudeDirection );