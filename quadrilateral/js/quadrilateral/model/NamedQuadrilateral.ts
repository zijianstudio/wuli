// Copyright 2021-2023, University of Colorado Boulder

/**
 * An enumeration for the kinds of named quadrilaterals that can be detected based on the shape's geometric properties.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import quadrilateral from '../../quadrilateral.js';

export default class NamedQuadrilateral extends EnumerationValue {
  public static readonly SQUARE = new NamedQuadrilateral();
  public static readonly RECTANGLE = new NamedQuadrilateral();
  public static readonly RHOMBUS = new NamedQuadrilateral();
  public static readonly KITE = new NamedQuadrilateral();
  public static readonly ISOSCELES_TRAPEZOID = new NamedQuadrilateral();
  public static readonly TRAPEZOID = new NamedQuadrilateral();
  public static readonly CONCAVE_QUADRILATERAL = new NamedQuadrilateral();
  public static readonly CONVEX_QUADRILATERAL = new NamedQuadrilateral();
  public static readonly TRIANGLE = new NamedQuadrilateral();
  public static readonly PARALLELOGRAM = new NamedQuadrilateral();
  public static readonly DART = new NamedQuadrilateral();

  // Gets a list of keys, values and mapping between them.  For use in EnumerationProperty and PhET-iO
  public static readonly enumeration = new Enumeration( NamedQuadrilateral, {
    phetioDocumentation: 'Possible named shapes for the quadrilateral.'
  } );
}

quadrilateral.register( 'NamedQuadrilateral', NamedQuadrilateral );
