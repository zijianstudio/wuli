// Copyright 2018-2023, University of Colorado Boulder

/**
 * This file contains the subset of es6 features that are supported in the PhET sim codebase. If there is desirable
 * es6 code that isn't in this file. Likely it should be discussed in a dev meeting and tested with babel transpiling
 * before use. Commented out es6 features in this file are disallowed in the code base. They likely are accompanied by
 * a comment explaining why it is off limits.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import interleave from '../../../../phet-core/js/interleave.js';
import { Node, NodeOptions } from '../../../../scenery/js/imports.js';
import wilder from '../../wilder.js';
import WilderOptionsPatterns from './WilderOptionsPatterns.js';
import WilderEnumerationPatterns from './WilderEnumerationPatterns.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import TModel from '../../../../joist/js/TModel.js';

// Commented out for the currently-unsupported ES6 features
// const Utils = require( '/dot/js/Utils' );

// constants
const something = 'foo';

type WilderModelOptions = {
  tandem: Tandem;
};

class WilderModel implements TModel {
  private wilderOptionsPatterns: WilderOptionsPatterns;
  private wilderEnumerationPatterns: WilderEnumerationPatterns;

  public constructor( providedOptions: WilderModelOptions ) {

    this.wilderOptionsPatterns = new WilderOptionsPatterns();
    this.wilderEnumerationPatterns = new WilderEnumerationPatterns( {
      tandem: providedOptions.tandem.createTandem( 'wilderEnumerationPatterns' )
    } );

    // We want a built version to error out for these "asserts"
    function hardAssert( condition: boolean, message = '' ): void {
      if ( !condition ) {
        throw new Error( message );
      }
    }

    // block scoping for let/const
    const blocky = 'outside';
    if ( window ) {
      const blocky = 'inside';
      hardAssert( blocky === 'inside' );
    }
    for ( let blocky = 0; blocky <= 0; blocky++ ) {
      hardAssert( blocky === 0 );
    }
    hardAssert( blocky === 'outside' );

    // Expression-based arrow functions
    hardAssert( _.range( 0, 5 ).map( ( x: number ) => x * x )[ 3 ] === 9 );

    // Statement-based arrow functions
    hardAssert( _.range( 0, 5 ).map( ( x: number ) => {
      hardAssert( x < 5 );
      return x * x;
    } )[ 3 ] === 9 );

    const self = this; // eslint-disable-line @typescript-eslint/no-this-alias
    [ 1 ].forEach( () => {
      hardAssert( this === self );
    } );

    // Default function parameters
    function defaults( x = 1, y = 2, z = 3 ): number {
      return x + y + z;
    }

    hardAssert( defaults( 0 ) === 5 );

    // Rest parameters
    function rest( x: number, y: number, ...others: number[] ): number {
      return x + y + others.length;
    }

    hardAssert( rest( 1, 2, 3, 4, 5, 6 ) === 7 );

    // Spread operator - NOTE Do not use this on "array like" things, it doesn't get transpiled correctly. Instead use
    // `Array.from`. See https://github.com/phetsims/perennial/issues/153
    const constArray = [ 1, 2, 3 ];
    hardAssert( [ ...constArray, 4, 5, ...constArray ].length === 8 );

    // String interpolation
    hardAssert( `Testing ${2 + 3}` === 'Testing 5' );

    // Custom interpolation
    function quoter( strings: TemplateStringsArray, ...quotations: ( string | number )[] ): string {
      return interleave( strings, ( i: number ) => `"${quotations[ i ]}"` ).join( '' );
    }

    hardAssert( quoter`He said ${something} but then answered ${3 * 2}` === 'He said "foo" but then answered "6"' );

    const multiLineString = `This
 is a test of the emergency
 newline system`;
    hardAssert( multiLineString.length === 48 );

    // Binary
    hardAssert( 3 + 4 === 0b111 );

    // Object shorthand is not allowed in PhET code! Note that method shorthand is ok, like `{ listener(){} }`
    const a = 5;
    const b = 4;
    const shortObj = { a, b }; // eslint-disable-line phet-object-shorthand
    hardAssert( shortObj.a === a );
    hardAssert( shortObj.b === b );

    // Computed property names
    const computedObj = {
      [ something ]: a
    };
    hardAssert( computedObj[ something ] === a );

    // Method notation
    const methodObj = {
      add( a: number, b: number ) {
        return a + b;
      }
    };
    hardAssert( methodObj.add( 1, 2 ) === 3 );

    // Array destructuring
    const arrList = [ 1, 2, 3 ];
    const [ firstElement, , thirdElement ] = arrList;
    hardAssert( firstElement === arrList[ 0 ] );
    hardAssert( thirdElement === arrList[ 2 ] );

    // Swapping with destructuring
    let arf = 5;
    let woof = 10;
    [ arf, woof ] = [ woof, arf ];
    hardAssert( arf === 10 );
    hardAssert( woof === 5 );

    // Object destructuring
    // NOTE: This is not allowed in PhET code because of the challenge it creates in renaming object keys,
    // see https://github.com/phetsims/chipper/issues/758
    const destObject = {
      cat: 5,
      mouse: {
        animals: [ 1, 2 ]
      },
      bird: 'canary'
    };
    const { cat, bird } = destObject;
    hardAssert( cat === destObject.cat );
    hardAssert( bird === destObject.bird );
    const { cat: tabby } = destObject;
    hardAssert( tabby === destObject.cat );
    const { mouse: { animals } } = destObject;
    hardAssert( animals === destObject.mouse.animals );

    // Parameter destructuring
    function destruct( { cat, mouse: { animals: [ firstAnimal ] } }: { cat: number; mouse: { animals: number[] } } ): number {
      return cat + firstAnimal;
    }

    hardAssert( destruct( destObject ) === destObject.cat + destObject.mouse.animals[ 0 ] );

    // Options object destructuring with defaults
    type OptionsType = {
      tree?: number;
      forest?: number;
      leaf?: number;
    };
    const optionsObject: OptionsType = {
      tree: 4,
      forest: 5
    };
    const {
      tree = 12,
      forest = 100,
      leaf = 1024
    } = optionsObject || {};
    hardAssert( tree === 4 );
    hardAssert( forest === 5 );
    hardAssert( leaf === 1024 );


    type SecretSelfOptions = {
      secret?: number;
    };
    type SecretOptions = SecretSelfOptions & NodeOptions;
    class SecretNode extends Node {

      // @ts-expect-error
      public _mutatorKeys = [ ...Node.prototype._mutatorKeys, 'secret' ];
      private _secret: number;

      public constructor( options?: SecretOptions ) {

        // Can't reference `this` before the super() call
        // Don't pass options here, since want to initialize defaults before passing options to mutate. We still only
        // want to call mutate once per constructor.
        super();

        this._secret = 42;

        // mutate after instance variables have been assigned.
        this.mutate( options );
      }

      public set secret( value ) { this._secret = value; }

      public get secret() { return this._secret; }

      public override dispose(): void {
        super.dispose();
        this._secret = 0; // Don't tell!
      }

      public static createSecretNode(): SecretNode { return new SecretNode( { secret: 0 } ); }
    }

    hardAssert( new SecretNode( { secret: 5 } ).secret === 5 );
    hardAssert( new SecretNode( { opacity: 0.5 } ).opacity === 0.5 );
    hardAssert( SecretNode.createSecretNode().secret === 0 );

    // Unsupported without babel-polyfill, commented out for now. DO NOT USE in simulations. May be used in the future.
    // Iterable class (with a generator method)
    // class RelativePrimes {
    //   private n: number;
    //   constructor( n ) {
    //     this.n = n;
    //   }
    //   *[Symbol.iterator]() {
    //     for ( let i = 1;; i++ ) {
    //       if ( Utils.gcd( i, this.n ) === 1 ) {
    //         yield i;
    //       }
    //     }
    //   }
    // }
    // // Find all relative primes to 5 less than 12.
    // const relativePrimes = [];
    // for ( const n of new RelativePrimes( 5 ) ) {
    //   if ( n >= 12 ) { break; }
    //   relativePrimes.push( n );
    // }
    // hardAssert( _.isEqual( relativePrimes, [ 1, 2, 3, 4, 6, 7, 8, 9, 11 ] ) );

    // Sets
    const bag = new Set();
    bag.add( 'a' ).add( 'b' ).add( 'a' );
    hardAssert( bag.size === 2 );
    hardAssert( bag.has( 'a' ) );
    hardAssert( !bag.has( 'c' ) );

    // Maps
    const map = new Map();
    map.set( bag, 5 );
    map.set( Node, 2 );
    hardAssert( map.get( bag ) === 5 );
    hardAssert( map.get( Node ) === 2 );
  }

  /**
   */
  public reset(): void {
    // console.log( 'reset' );
  }
}

wilder.register( 'WilderModel', WilderModel );
export default WilderModel;