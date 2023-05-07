// Copyright 2013-2022, University of Colorado Boulder

import Enumeration from '../../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../../phet-core/js/EnumerationValue.js';
import phScale from '../../../phScale.js';

/**
 * Units used on the graph.
 * NOTE: When converting to TypeScript, this was not converted to a string union because we do not want to change
 * the PhET-iO API. String-union values use camelCase, while EnumerationValue uses UPPER_CASE.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

export default class GraphUnits extends EnumerationValue {
  public static readonly MOLES_PER_LITER = new GraphUnits();
  public static readonly MOLES = new GraphUnits();

  public static readonly enumeration = new Enumeration( GraphUnits );
}

phScale.register( 'GraphUnits', GraphUnits );