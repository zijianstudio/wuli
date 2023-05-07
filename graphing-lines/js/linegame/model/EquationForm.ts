// Copyright 2013-2022, University of Colorado Boulder

/**
 * Used to specify the form of the equations in Game challenges.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import graphingLines from '../../graphingLines.js';

export default class EquationForm extends EnumerationValue {

  public static readonly SLOPE_INTERCEPT = new EquationForm(); // y = mx + b
  public static readonly POINT_SLOPE = new EquationForm(); // (y2 - y1) = m(x2 - x1)

  public static readonly enumeration = new Enumeration( EquationForm );
}

graphingLines.register( 'EquationForm', EquationForm );