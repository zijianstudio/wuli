// Copyright 2013-2022, University of Colorado Boulder

import Enumeration from '../../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../../phet-core/js/EnumerationValue.js';
import phScale from '../../../phScale.js';

/**
 * Type of graph (log or linear).
 * NOTE: When converting to TypeScript, this was not converted to a string union because we do not want to change
 * the PhET-iO API. String-union values use camelCase, while EnumerationValue uses UPPER_CASE.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

export default class GraphScale extends EnumerationValue {
  public static readonly LOGARITHMIC = new GraphScale();
  public static readonly LINEAR = new GraphScale();

  public static readonly enumeration = new Enumeration( GraphScale );
}

phScale.register( 'GraphScale', GraphScale );