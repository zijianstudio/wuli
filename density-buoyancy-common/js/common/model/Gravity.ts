// Copyright 2019-2023, University of Colorado Boulder

/**
 * Represents different gravity values, including a custom option.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO, { ReferenceIOState } from '../../../../tandem/js/types/ReferenceIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';

export type GravityOptions = {
  nameProperty: TReadOnlyProperty<string>;
  tandemName: string;

  // m/s^2
  value: number;

  custom?: boolean;
  hidden?: boolean;
};

export default class Gravity {

  public nameProperty: TReadOnlyProperty<string>;
  public tandemName: string;
  public value: number;
  public custom: boolean;
  public hidden: boolean;

  public constructor( providedConfig: GravityOptions ) {

    const config = optionize<GravityOptions, GravityOptions>()( {
      custom: false,
      hidden: false
    }, providedConfig );

    this.nameProperty = config.nameProperty;
    this.tandemName = config.tandemName;
    this.value = config.value;
    this.custom = config.custom;
    this.hidden = config.hidden;
  }

  /**
   * Returns a custom material that can be modified at will.
   */
  public static createCustomGravity( value: number ): Gravity {
    return new Gravity( {
      nameProperty: DensityBuoyancyCommonStrings.gravity.customStringProperty,
      tandemName: 'custom',
      value: value,
      custom: true
    } );
  }


  public static readonly EARTH = new Gravity( {
    nameProperty: DensityBuoyancyCommonStrings.gravity.earthStringProperty,
    tandemName: 'earth',
    value: DensityBuoyancyCommonQueryParameters.gEarth
  } );

  public static readonly JUPITER = new Gravity( {
    nameProperty: DensityBuoyancyCommonStrings.gravity.jupiterStringProperty,
    tandemName: 'jupiter',
    value: 24.8
  } );

  public static readonly MOON = new Gravity( {
    nameProperty: DensityBuoyancyCommonStrings.gravity.moonStringProperty,
    tandemName: 'moon',
    value: 1.6
  } );

  public static readonly PLANET_X = new Gravity( {
    nameProperty: DensityBuoyancyCommonStrings.gravity.planetXStringProperty,
    tandemName: 'planetX',
    value: 19.6,
    hidden: true
  } );

  public static readonly GRAVITIES = [
    Gravity.EARTH,
    Gravity.JUPITER,
    Gravity.MOON,
    Gravity.PLANET_X
  ];
  public static readonly GravityIO = new IOType<Gravity, GravityState>( 'GravityIO', {
    valueType: Gravity,
    documentation: 'Represents a specific value of gravity (m/s^2)',
    toStateObject: function( gravity: Gravity ): GravityState {
      return {
        name: ReferenceIO( ReadOnlyProperty.PropertyIO( StringIO ) ).toStateObject( gravity.nameProperty ),
        tandemName: gravity.tandemName,
        value: gravity.value,
        custom: gravity.custom,
        hidden: gravity.hidden
      };
    },
    fromStateObject: ( stateObject: GravityState ) => {
      if ( stateObject.custom ) {
        stateObject.name = ReferenceIO( ReadOnlyProperty.PropertyIO( StringIO ) ).fromStateObject( stateObject.name );

        return new Gravity( stateObject as unknown as GravityOptions );
      }
      else {
        return _.find( Gravity.GRAVITIES, gravity => gravity.value === stateObject.value )!;
      }
    },
    stateSchema: {
      name: ReferenceIO( ReadOnlyProperty.PropertyIO( StringIO ) ),
      tandemName: NullableIO( StringIO ),
      value: NumberIO,
      custom: BooleanIO,
      hidden: BooleanIO
    }
  } );
}

type GravityState = {
  name: ReferenceIOState;
  tandemName: string;
  value: number;
  custom: boolean;
  hidden: boolean;
};

densityBuoyancyCommon.register( 'Gravity', Gravity );
