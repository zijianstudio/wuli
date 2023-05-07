// Copyright 2014-2023, University of Colorado Boulder

/**
 * Model for the 'Vertex Form' screen.
 * Vertex form of the quadratic equation is: y = a(x - h)^2 + k
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import GQModel from '../../common/model/GQModel.js';
import Quadratic from '../../common/model/Quadratic.js';
import graphingQuadratics from '../../graphingQuadratics.js';

// constants
const A_RANGE = new RangeWithValue( -6, 6, 1 ); // a coefficient
const H_RANGE = new RangeWithValue( -9, 9, 0 ); // h coefficient
const K_RANGE = new RangeWithValue( -9, 9, 0 ); // k coefficient

export default class VertexFormModel extends GQModel {

  // Coefficients of vertex form: y = a(x - h)^2 + k
  public readonly aProperty: NumberProperty;
  public readonly hProperty: NumberProperty;
  public readonly kProperty: NumberProperty;

  public constructor( tandem: Tandem ) {

    // a
    const aProperty = new NumberProperty( A_RANGE.defaultValue, {
      numberType: 'Integer',
      range: A_RANGE,
      tandem: tandem.createTandem( 'aProperty' ),
      phetioDocumentation: StringUtils.fillIn( GQConstants.VALUE_DOC, { symbol: 'a' } )
    } );
    phet.log && aProperty.link( a => { phet.log( `a=${a}` ); } );

    // h
    const hProperty = new NumberProperty( H_RANGE.defaultValue, {
      numberType: 'Integer',
      range: H_RANGE,
      tandem: tandem.createTandem( 'hProperty' ),
      phetioDocumentation: StringUtils.fillIn( GQConstants.VALUE_DOC, { symbol: 'h' } )
    } );
    phet.log && hProperty.link( h => { phet.log( `h=${h}` ); } );

    // k
    const kProperty = new NumberProperty( K_RANGE.defaultValue, {
      numberType: 'Integer',
      range: K_RANGE,
      tandem: tandem.createTandem( 'kProperty' ),
      phetioDocumentation: StringUtils.fillIn( GQConstants.VALUE_DOC, { symbol: 'k' } )
    } );
    phet.log && kProperty.link( k => { phet.log( `k=${k}` ); } );

    const quadraticProperty = new DerivedProperty(
      [ aProperty, hProperty, kProperty ],
      ( a, h, k ) => Quadratic.createFromVertexForm( a, h, k, {
        color: GQColors.VERTEX_FORM_INTERACTIVE_CURVE
      } ), {
        tandem: tandem.createTandem( 'quadraticProperty' ),
        phetioDocumentation: 'the interactive quadratic, derived from a, h, and k',
        phetioValueType: Quadratic.QuadraticIO
      } );
    phet.log && quadraticProperty.link( quadratic => {
      phet.log( `quadratic: y = ${quadratic.a} (x - ${quadratic.h})^2 + ${quadratic.k}` );
    } );

    super( quadraticProperty, tandem );

    this.aProperty = aProperty;
    this.hProperty = hProperty;
    this.kProperty = kProperty;
  }

  public override reset(): void {
    this.aProperty.reset();
    this.hProperty.reset();
    this.kProperty.reset();
    super.reset();
  }
}

graphingQuadratics.register( 'VertexFormModel', VertexFormModel );