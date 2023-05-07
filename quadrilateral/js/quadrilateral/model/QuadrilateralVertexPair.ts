// Copyright 2022-2023, University of Colorado Boulder

/**
 * A pair of vertices that have some relationship. For example, they could be adjacent or opposite to each other
 * when assembled in the quadrilateral shape.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../quadrilateral.js';
import QuadrilateralVertex from './QuadrilateralVertex.js';
import UnorderedComponentPair from './UnorderedComponentPair.js';

export default class QuadrilateralVertexPair extends UnorderedComponentPair<QuadrilateralVertex> {
  public constructor( vertex1: QuadrilateralVertex, vertex2: QuadrilateralVertex ) {
    super( vertex1, vertex2 );
  }
}

quadrilateral.register( 'QuadrilateralVertexPair', QuadrilateralVertexPair );
