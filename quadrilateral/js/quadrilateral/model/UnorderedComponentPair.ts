// Copyright 2023, University of Colorado Boulder

/**
 * A pair of QuadrilateralVertex or QuadrilateralSide that has some relationship. For example,
 * they could be adjacent or opposite to eachother
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../quadrilateral.js';
import QuadrilateralMovable from './QuadrilateralMovable.js';

class UnorderedComponentPair<T extends QuadrilateralMovable> {
  public readonly component1: T;
  public readonly component2: T;

  protected constructor( component1: T, component2: T ) {
    this.component1 = component1;
    this.component2 = component2;
  }

  /**
   * Does this pair equal the other?
   */
  public equals( otherPair: UnorderedComponentPair<T> ): boolean {
    return ( this.component1 === otherPair.component1 && this.component2 === otherPair.component2 ) ||
           ( this.component2 === otherPair.component1 && this.component1 === otherPair.component2 );
  }

  /**
   * Does this pair include the provided component?
   */
  public includesComponent( component: T ): boolean {
    return this.component1 === component || this.component2 === component;
  }
}

quadrilateral.register( 'UnorderedComponentPair', UnorderedComponentPair );
export default UnorderedComponentPair;
