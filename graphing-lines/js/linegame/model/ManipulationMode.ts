// Copyright 2013-2022, University of Colorado Boulder

/**
 * Manipulation modes, for use in configuring Game challenges.
 * These indicate which properties of a line the user is able to change.
 * For 'Graph the Line' challenges, this specifies what manipulators are provided on the graph.
 * For 'Make the Equation' challenges, this specifies which parts of the equation are interactive pickers.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import graphingLines from '../../graphingLines.js';

export default class ManipulationMode extends EnumerationValue {

  public static readonly SLOPE = new ManipulationMode();
  public static readonly INTERCEPT = new ManipulationMode();
  public static readonly SLOPE_INTERCEPT = new ManipulationMode();
  public static readonly POINT = new ManipulationMode();
  public static readonly POINT_SLOPE = new ManipulationMode();
  public static readonly TWO_POINTS = new ManipulationMode(); // 2 points that define a line: (x1,y1) and (x2,y2)
  public static readonly THREE_POINTS = new ManipulationMode(); // 3 arbitrary points that may or may not form a line: p1, p2, p3

  public static readonly enumeration = new Enumeration( ManipulationMode );
}

graphingLines.register( 'ManipulationMode', ManipulationMode );