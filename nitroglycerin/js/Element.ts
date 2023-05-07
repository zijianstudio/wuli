// Copyright 2013-2022, University of Colorado Boulder

/**
 * Object for actual element properties (symbol, radius, etc.)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PhetColorScheme from '../../scenery-phet/js/PhetColorScheme.js';
import { Color } from '../../scenery/js/imports.js';
import nitroglycerin from './nitroglycerin.js';

export default class Element {

  // See constructor params for documentation.
  public readonly symbol: string;
  public readonly covalentRadius: number;
  public readonly vanDerWaalsRadius: number;
  public readonly electronegativity: number | null;
  public readonly atomicWeight: number;
  public readonly color: Color | string;

  // static Element instances
  public static readonly Ar = new Element( 'Ar', 97, 188, null, 39.948, '#FFAFAF' );
  public static readonly B = new Element( 'B', 85, 192, 2.04, 10.811, 'rgb(255,170,119)' ); // peach/salmon colored, CPK coloring
  public static readonly Be = new Element( 'Be', 105, 153, 1.57, 9.012182, 'rgb(194,255,95)' ); // beryllium
  public static readonly Br = new Element( 'Br', 114, 185, 2.96, 79.904, 'rgb(190,30,20)' ); // brown
  public static readonly C = new Element( 'C', 77, 170, 2.55, 12.0107, 'rgb(178,178,178)' );
  public static readonly Cl = new Element( 'Cl', 100, 175, 3.16, 35.4527, 'rgb(136,242,21)' );
  public static readonly F = new Element( 'F', 72, 147, 3.98, 18.9984032, 'rgb(245,255,36)' );
  public static readonly H = new Element( 'H', 37, 120, 2.20, 1.00794, '#ffffff' );
  public static readonly I = new Element( 'I', 133, 198, 2.66, 126.90447, '#940094' ); // dark violet, CPK coloring
  public static readonly N = new Element( 'N', 75, 155, 3.04, 14.00674, '#0000ff' );
  public static readonly Ne = new Element( 'Ne', 69, 154, null, 20.1797, '#1AFFFB' );
  public static readonly O = new Element( 'O', 73, 152, 3.44, 15.9994, PhetColorScheme.RED_COLORBLIND );
  public static readonly P = new Element( 'P', 110, 180, 2.19, 30.973762, 'rgb(255,154,0)' );
  public static readonly S = new Element( 'S', 103, 180, 2.58, 32.066, 'rgb(212,181,59)' );
  public static readonly Si = new Element( 'Si', 118, 210, 1.90, 28.0855, 'rgb(240,200,160)' ); // tan, Jmol coloring listed from https://secure.wikimedia.org/wikipedia/en/wiki/CPK_coloring
  public static readonly Sn = new Element( 'Sn', 145, 217, 1.96, 118.710, '#668080' ); // tin
  public static readonly Xe = new Element( 'Xe', 108, 216, 2.60, 131.293, '#429eb0' ); // radius is based on calculated (not empirical) data

  public static readonly elements = [
    Element.Ar, Element.B, Element.Be, Element.Br, Element.C, Element.Cl, Element.F, Element.H, Element.I, Element.N,
    Element.Ne, Element.O, Element.P, Element.S, Element.Si, Element.Sn, Element.Xe
  ];

  // Maps element.symbol to Element
  private static readonly elementMap: Map<string, Element> = createElementMap( Element.elements );

  /**
   * @param symbol
   * @param covalentRadius - covalent radius, in picometers. For a quick chart,
   *        see http://en.wikipedia.org/wiki/Atomic_radii_of_the_elements_(data_page)
   * @param vanDerWaalsRadius - Van der Waals radius, in picometers. See chart at
   *        http://en.wikipedia.org/wiki/Atomic_radii_of_the_elements_(data_page)
   * @param electronegativity - in Pauling units, see https://secure.wikimedia.org/wikipedia/en/wiki/Electronegativity,
   *        is null when undefined for an element (as is the case for noble gasses)
   * @param atomicWeight - in atomic mass units (u). from http://www.webelements.com/periodicity/atomic_weight/
   * @param color - color used in visual representations
   */
  public constructor( symbol: string, covalentRadius: number, vanDerWaalsRadius: number,
                      electronegativity: number | null, atomicWeight: number, color: Color | string ) {

    this.symbol = symbol;
    this.covalentRadius = covalentRadius;
    this.vanDerWaalsRadius = vanDerWaalsRadius;
    this.electronegativity = electronegativity;
    this.atomicWeight = atomicWeight;
    this.color = color;
  }

  public static getElementBySymbol( symbol: string ): Element {
    const element = Element.elementMap.get( symbol );
    assert && assert( element, `Element not found for symbol=${symbol}` );
    return element!;
  }

  public isSameElement( element: Element ): boolean {
    return element.symbol === this.symbol;
  }

  public isHydrogen(): boolean {
    return this.isSameElement( Element.H );
  }

  public isCarbon(): boolean {
    return this.isSameElement( Element.C );
  }

  public isOxygen(): boolean {
    return this.isSameElement( Element.O );
  }

  public toString(): string {
    return this.symbol;
  }
}

function createElementMap( elements: Element[] ): Map<string, Element> {
  const map = new Map();
  elements.forEach( element => map.set( element.symbol, element ) );
  return map;
}

nitroglycerin.register( 'Element', Element );