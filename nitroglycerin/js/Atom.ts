// Copyright 2013-2022, University of Colorado Boulder

/**
 * Object for actual element properties (symbol, radius, etc.)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Color } from '../../scenery/js/imports.js';
import Element from './Element.js';
import nitroglycerin from './nitroglycerin.js';

let idCounter = 1;

export default class Atom {

  public readonly element: Element;

  // These are field of Element, unpacked here for convenience. See Element for documentation of these fields.
  public readonly symbol: string;
  public readonly covalentRadius: number;
  public readonly covalentDiameter: number;
  public readonly electronegativity: number | null;
  public readonly atomicWeight: number;
  public readonly color: Color | string;

  // IDs for uniqueness and fast lookups
  public readonly reference: string;
  public readonly id: string;

  public constructor( element: Element ) {

    this.element = element;

    // Unpack Element, for convenience.
    this.symbol = element.symbol;
    this.covalentRadius = element.covalentRadius;
    this.covalentDiameter = element.covalentRadius * 2;
    this.electronegativity = element.electronegativity;
    this.atomicWeight = element.atomicWeight;
    this.color = element.color;

    this.reference = ( idCounter++ ).toString( 16 );
    this.id = `${this.symbol}_${this.reference}`;
  }

  public static createAtomFromSymbol( symbol: string ): Atom {
    return new Atom( Element.getElementBySymbol( symbol ) );
  }

  public hasSameElement( atom: Atom ): boolean {
    return this.element.isSameElement( atom.element );
  }

  public isHydrogen(): boolean {
    return this.element.isHydrogen();
  }

  public isCarbon(): boolean {
    return this.element.isCarbon();
  }

  public isOxygen(): boolean {
    return this.element.isOxygen();
  }

  public toString(): string {
    return this.symbol;
  }
}

nitroglycerin.register( 'Atom', Atom );