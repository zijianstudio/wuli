// Copyright 2022-2023, University of Colorado Boulder

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import centerAndVariability from '../../centerAndVariability.js';

/**
 * Whether to show dots or x's in the plot.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
export default class PlotType extends EnumerationValue {
  public static readonly LINE_PLOT = new PlotType();
  public static readonly DOT_PLOT = new PlotType();
  private static readonly enumeration = new Enumeration( PlotType );
}

centerAndVariability.register( 'PlotType', PlotType );