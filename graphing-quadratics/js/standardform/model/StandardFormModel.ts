// Copyright 2014-2023, University of Colorado Boulder

/**
 * Model for the 'Standard Form' screen.
 * Standard form of the quadratic equation is: y = ax^2 + bx + c
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty, { NumberPropertyOptions } from '../../../../axon/js/NumberProperty.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import merge from '../../../../phet-core/js/merge.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickOptional from '../../../../phet-core/js/types/PickOptional.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import GQModel from '../../common/model/GQModel.js';
import Quadratic from '../../common/model/Quadratic.js';
import graphingQuadratics from '../../graphingQuadratics.js';

// constants
const A_RANGE = new RangeWithValue( -6, 6, 1 ); // a coefficient
const B_RANGE = new RangeWithValue( -6, 6, 0 ); // b coefficient
const C_RANGE = new RangeWithValue( -6, 6, 0 ); // c constant

type SelfOptions = PickOptional<NumberPropertyOptions, 'numberType'>;

type StandardFormModelOptions = SelfOptions;

export default class StandardFormModel extends GQModel {

  // Coefficients for standard form: y = ax^2 + bx + c
  public readonly aProperty: NumberProperty;
  public readonly bProperty: NumberProperty;
  public readonly cProperty: NumberProperty;

  public constructor( tandem: Tandem, providedOptions?: StandardFormModelOptions ) {

    const options = optionize<StandardFormModelOptions, SelfOptions>()( {

      // SelfOptions
      numberType: 'Integer'
    }, providedOptions );

    // Options for all NumberProperty instances
    const numberPropertyOptions = {
      numberType: options.numberType
    };

    // a
    const aProperty = new NumberProperty( A_RANGE.defaultValue, merge( {
      range: A_RANGE,
      tandem: tandem.createTandem( 'aProperty' ),
      phetioDocumentation: StringUtils.fillIn( GQConstants.VALUE_DOC, { symbol: 'a' } )
    }, numberPropertyOptions ) );
    phet.log && aProperty.link( a => { phet.log( `a=${a}` ); } );

    // b
    const bProperty = new NumberProperty( B_RANGE.defaultValue, merge( {
      range: B_RANGE,
      tandem: tandem.createTandem( 'bProperty' ),
      phetioDocumentation: StringUtils.fillIn( GQConstants.VALUE_DOC, { symbol: 'b' } )
    }, numberPropertyOptions ) );
    phet.log && bProperty.link( b => { phet.log( `b=${b}` ); } );

    // c
    const cProperty = new NumberProperty( C_RANGE.defaultValue, merge( {
      range: C_RANGE,
      tandem: tandem.createTandem( 'cProperty' ),
      phetioDocumentation: StringUtils.fillIn( GQConstants.VALUE_DOC, { symbol: 'c' } )
    }, numberPropertyOptions ) );
    phet.log && cProperty.link( c => { phet.log( `c=${c}` ); } );

    // {DerivedProperty.<Quadratic>}
    const quadraticProperty = new DerivedProperty(
      [ aProperty, bProperty, cProperty ],
      ( a, b, c ) => new Quadratic( a, b, c, { color: GQColors.EXPLORE_INTERACTIVE_CURVE } ), {
        tandem: tandem.createTandem( 'quadraticProperty' ),
        phetioValueType: Quadratic.QuadraticIO,
        phetioDocumentation: 'the interactive quadratic, derived from a, b, and c'
      } );
    phet.log && quadraticProperty.link( quadratic => {
      phet.log( `quadratic: y = ${quadratic.a} x^2 + ${quadratic.b} x + ${quadratic.c}` );
    } );

    super( quadraticProperty, tandem );

    this.aProperty = aProperty;
    this.bProperty = bProperty;
    this.cProperty = cProperty;
  }

  public override reset(): void {
    this.aProperty.reset();
    this.bProperty.reset();
    this.cProperty.reset();
    super.reset();
  }
}

graphingQuadratics.register( 'StandardFormModel', StandardFormModel );