// Copyright 2022-2023, University of Colorado Boulder

/**
 * A pair of sides that have some relationship. For example, they could be adjacent or opposite to each other
 * when assembled in the quadrilateral shape.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../quadrilateral.js';
import QuadrilateralSide from './QuadrilateralSide.js';
import UnorderedComponentPair from './UnorderedComponentPair.js';

export default class QuadrilateralSidePair extends UnorderedComponentPair<QuadrilateralSide> {
  public constructor( component1: QuadrilateralSide, component2: QuadrilateralSide ) {
    super( component1, component2 );
  }
}

quadrilateral.register( 'QuadrilateralSidePair', QuadrilateralSidePair );
