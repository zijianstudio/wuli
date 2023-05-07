// Copyright 2023, University of Colorado Boulder

/**
 * It is useful to know the identity of a particular QuadrilateralVertex, this enumeration supports that.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import quadrilateral from '../../quadrilateral.js';

export default class QuadrilateralVertexLabel extends EnumerationValue {
  public static readonly VERTEX_A = new QuadrilateralVertexLabel();
  public static readonly VERTEX_B = new QuadrilateralVertexLabel();
  public static readonly VERTEX_C = new QuadrilateralVertexLabel();
  public static readonly VERTEX_D = new QuadrilateralVertexLabel();

  public static readonly enumeration = new Enumeration( QuadrilateralVertexLabel );
}

quadrilateral.register( 'QuadrilateralVertexLabel', QuadrilateralVertexLabel );
