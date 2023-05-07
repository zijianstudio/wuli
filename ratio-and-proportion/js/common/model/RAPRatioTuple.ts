// Copyright 2020-2022, University of Colorado Boulder

/**
 * Data type that holds both terms of the ratio, with convenience functions
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import Range from '../../../../dot/js/Range.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioTerm from './RatioTerm.js';

type RAPRatioTupleState = {
  antecedent: number;
  consequent: number;
};

class RAPRatioTuple {

  public antecedent: number;
  public consequent: number;

  public static readonly STATE_SCHEMA = {
    antecedent: NumberIO,
    consequent: NumberIO
  };
  public static readonly RAPRatioTupleIO = new IOType( 'RAPRatioTupleIO', {
    valueType: RAPRatioTuple,
    toStateObject: ( rapRatioTuple: RAPRatioTuple ) => rapRatioTuple.toStateObject(),
    stateSchema: RAPRatioTuple.STATE_SCHEMA,
    fromStateObject: stateObject => RAPRatioTuple.fromStateObject( stateObject ),
    documentation: 'the basic data structure that holds both ratio term values, the antecedent and consequent.'
  } );

  public constructor( antecedent: number, consequent: number ) {
    assert && assert( !isNaN( antecedent ) );
    assert && assert( !isNaN( consequent ) );

    this.antecedent = antecedent;
    this.consequent = consequent;
  }

  public withAntecedent( antecedent: number ): RAPRatioTuple {
    return new RAPRatioTuple( antecedent, this.consequent );
  }

  public withConsequent( consequent: number ): RAPRatioTuple {
    return new RAPRatioTuple( this.antecedent, consequent );
  }

  public withValueForTerm( value: number, ratioTerm: RatioTerm ): RAPRatioTuple {
    return this.copy().setForTerm( value, ratioTerm );
  }

  public plusAntecedent( antecedentDelta: number ): RAPRatioTuple {
    return new RAPRatioTuple( this.antecedent + antecedentDelta, this.consequent );
  }

  public plusConsequent( consequentDelta: number ): RAPRatioTuple {
    return new RAPRatioTuple( this.antecedent, this.consequent + consequentDelta );
  }

  public constrainFields( range: Range ): this {
    this.antecedent = range.constrainValue( this.antecedent );
    this.consequent = range.constrainValue( this.consequent );

    return this; // for chaining
  }

  public getRatio(): number {
    return this.consequent === 0 ? Number.POSITIVE_INFINITY : this.antecedent / this.consequent;
  }

  /**
   * Get the distance between the two numbers
   * @returns - greater than 0
   */
  public getDistance(): number {
    return Math.abs( this.antecedent - this.consequent );
  }

  public equals( otherRatioTuple: RAPRatioTuple ): boolean {
    return this.antecedent === otherRatioTuple.antecedent && this.consequent === otherRatioTuple.consequent;
  }

  public getForTerm( ratioTerm: RatioTerm ): number {
    switch( ratioTerm ) {
      case RatioTerm.ANTECEDENT:
        return this.antecedent;
      case RatioTerm.CONSEQUENT:
        return this.consequent;
      default:
        assert && assert( false, `unexpected ratioTerm ${ratioTerm}` );
        return -1;
    }
  }

  public setForTerm( value: number, ratioTerm: RatioTerm ): this {
    switch( ratioTerm ) {
      case RatioTerm.ANTECEDENT:
        this.antecedent = value;
        break;
      case RatioTerm.CONSEQUENT:
        this.consequent = value;
        break;
      default:
        assert && assert( false, `unexpected ratioTerm ${ratioTerm}` );
    }
    return this;
  }

  public copy(): RAPRatioTuple {
    return new RAPRatioTuple( this.antecedent, this.consequent );
  }

  public toStateObject(): RAPRatioTupleState {
    return {
      antecedent: this.antecedent,
      consequent: this.consequent
    };
  }

  public static fromStateObject( stateObject: RAPRatioTupleState ): RAPRatioTuple {
    return new RAPRatioTuple( stateObject.antecedent, stateObject.consequent );
  }
}

ratioAndProportion.register( 'RAPRatioTuple', RAPRatioTuple );
export default RAPRatioTuple;
