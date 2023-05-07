// Copyright 2019-2023, University of Colorado Boulder

/**
 * A Property that is based on the step-based interpolation between a current and previous value.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property, { PropertyOptions } from '../../../../axon/js/Property.js';
import { ReadOnlyPropertyState } from '../../../../axon/js/ReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import optionize from '../../../../phet-core/js/optionize.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

type Interpolate<T> = ( a: T, b: T, ratio: number ) => T;
type SelfOptions<T> = {
  interpolate: Interpolate<T>;
};
export type InterpolatedPropertyOptions<T> = SelfOptions<T> & PropertyOptions<T>;

export default class InterpolatedProperty<T> extends Property<T> {

  public currentValue: T;
  public previousValue: T;
  public ratio: number;

  private readonly interpolate: Interpolate<T>;

  public constructor( initialValue: T, providedConfig: InterpolatedPropertyOptions<T> ) {

    const config = optionize<InterpolatedPropertyOptions<T>, SelfOptions<T>, PropertyOptions<T>>()( {
      phetioOuterType: InterpolatedProperty.InterpolatedPropertyIO
    }, providedConfig );

    super( initialValue, config );

    this.interpolate = config.interpolate;

    this.currentValue = initialValue;
    this.previousValue = initialValue;

    this.ratio = 0;
  }

  /**
   * Sets the next value to be used (will NOT change the value of this Property).
   */
  public setNextValue( value: T ): void {
    this.previousValue = this.currentValue;
    this.currentValue = value;
  }

  /**
   * Sets the ratio to use for interpolated values (WILL change the value of this Property generally).
   */
  public setRatio( ratio: number ): void {
    this.ratio = ratio;

    this.value = this.interpolate( this.previousValue, this.currentValue, this.ratio );
  }

  /**
   * Resets the Property to its initial state.
   */
  public override reset(): void {
    super.reset();

    this.currentValue = this.value;
    this.previousValue = this.value;
    this.ratio = 0;
  }

  /**
   * Interpolation for numbers.
   */
  public static interpolateNumber( a: number, b: number, ratio: number ): number {
    return a + ( b - a ) * ratio;
  }

  /**
   * Interpolation for Vector2.
   */
  public static interpolateVector2( a: Vector2, b: Vector2, ratio: number ): Vector2 {
    return a.blend( b, ratio );
  }

  /**
   * Interpolation for Vector3.
   */
  public static interpolateVector3( a: Vector3, b: Vector3, ratio: number ): Vector3 {
    return a.blend( b, ratio );
  }

  public static readonly InterpolatedPropertyIO = ( parameterType: IOType ): IOType => {
    assert && assert( parameterType, 'InterpolatedPropertyIO needs parameterType' );

    if ( !cache.has( parameterType ) ) {
      const PropertyIOImpl = Property.PropertyIO( parameterType );

      const ioType = new IOType( `InterpolatedPropertyIO<${parameterType.typeName}>`, {
        valueType: InterpolatedProperty,
        supertype: PropertyIOImpl,
        parameterTypes: [ parameterType ],
        documentation: 'Extends PropertyIO to interpolation (with a current/previous value, and a ratio between the two)',
        toStateObject: ( interpolatedProperty: InterpolatedProperty<IntentionalAny> ): InterpolatedPropertyIOStateObject => {

          const parentStateObject = PropertyIOImpl.toStateObject( interpolatedProperty );

          parentStateObject.currentValue = parameterType.toStateObject( interpolatedProperty.currentValue );
          parentStateObject.previousValue = parameterType.toStateObject( interpolatedProperty.previousValue );
          parentStateObject.ratio = interpolatedProperty.ratio;

          return parentStateObject;
        },
        applyState: ( interpolatedProperty: InterpolatedProperty<IntentionalAny>, stateObject: InterpolatedPropertyIOStateObject ) => {
          PropertyIOImpl.applyState( interpolatedProperty, stateObject );
          interpolatedProperty.currentValue = parameterType.fromStateObject( stateObject.currentValue );
          interpolatedProperty.previousValue = parameterType.fromStateObject( stateObject.previousValue );
          interpolatedProperty.ratio = stateObject.ratio;
        },
        stateSchema: {
          currentValue: parameterType,
          previousValue: parameterType,
          ratio: NumberIO
        }
      } );

      cache.set( parameterType, ioType );
    }

    return cache.get( parameterType )!;
  };
}

// {Map.<IOType, IOType>} - Cache each parameterized PropertyIO based on
// the parameter type, so that it is only created once
const cache = new Map<IOType, IOType>();

export type InterpolatedPropertyIOStateObject = ReadOnlyPropertyState<IntentionalAny> & {
  currentValue: IntentionalAny;
  previousValue: IntentionalAny;
  ratio: number;
};

densityBuoyancyCommon.register( 'InterpolatedProperty', InterpolatedProperty );
