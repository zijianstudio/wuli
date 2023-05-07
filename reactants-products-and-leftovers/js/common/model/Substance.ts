// Copyright 2014-2023, University of Colorado Boulder

/**
 * A substance is a participant in a chemical reaction.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Node } from '../../../../scenery/js/imports.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';

export default class Substance {

  public readonly symbol: string;

  // substance's coefficient in the reaction equation, mutable to support 'Custom' sandwich
  public readonly coefficientProperty: Property<number>;

  // how much of the substance we have
  public readonly quantityProperty: Property<number>;

  // visual representation of the substance, mutable to support the 'Custom' sandwich
  public readonly iconProperty: Property<Node>;

  /**
   * @param coefficient - substance's coefficient in the reaction equation
   * @param symbol - used in reaction equation
   * @param icon - visual representation of the substance
   * @param [quantity] - how much of a substance we have, defaults to zero
   */
  public constructor( coefficient: number, symbol: string, icon: Node, quantity = 0 ) {

    assert && assert( coefficient >= 0 );
    assert && assert( quantity >= 0 );

    this.symbol = symbol;

    this.coefficientProperty = new NumberProperty( coefficient, {
      numberType: 'Integer'
    } );

    this.quantityProperty = new NumberProperty( quantity, {
      numberType: 'Integer'
    } );

    this.iconProperty = new Property( icon );
  }

  public reset(): void {
    this.coefficientProperty.reset();
    this.quantityProperty.reset();
    this.iconProperty.reset();
  }

  public dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
  }

  /*
   * Are 2 substances the same? AXON.Property observers are not considered.
   */
  public equals( substance: Substance ): boolean {
    return ( this.symbol === substance.symbol &&
             this.coefficientProperty.value === substance.coefficientProperty.value &&
             this.iconProperty.value === substance.iconProperty.value &&
             this.quantityProperty.value === substance.quantityProperty.value );
  }

  /**
   * Creates a shallow copy of this Substance. AXON.Property observers are not copied.
   * @param quantity - optional quantity, to override this.quantityProperty.value
   */
  public clone( quantity?: number ): Substance {
    return new Substance( this.coefficientProperty.value, this.symbol, this.iconProperty.value,
      ( quantity === undefined ) ? this.quantityProperty.value : 0 );
  }
}

reactantsProductsAndLeftovers.register( 'Substance', Substance );