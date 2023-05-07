// Copyright 2022-2023, University of Colorado Boulder

import CAVSceneModel from '../../common/model/CAVSceneModel.js';
import centerAndVariability from '../../centerAndVariability.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Property from '../../../../axon/js/Property.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import VariabilityModel from './VariabilityModel.js';
import SoccerBall from '../../common/model/SoccerBall.js';

export default class VariabilitySceneModel extends CAVSceneModel {

  public readonly maxValueProperty: TReadOnlyProperty<number | null>;
  public readonly minValueProperty: TReadOnlyProperty<number | null>;
  public readonly rangeValueProperty: TReadOnlyProperty<number | null>;
  public readonly q1ValueProperty: Property<number | null>;
  public readonly q3ValueProperty: Property<number | null>;
  public readonly iqrValueProperty: TReadOnlyProperty<number | null>;
  public readonly madValueProperty: Property<number | null>;

  private readonly initialized: boolean = false;

  public constructor( distribution: ReadonlyArray<number>, options: { tandem: Tandem } ) {
    super( distribution, options );

    this.maxValueProperty = new DerivedProperty( [ this.dataRangeProperty ], dataRange => {
      return dataRange === null ? null : dataRange.max;
    }, {
      tandem: options.tandem.createTandem( 'maxValueProperty' ),
      phetioValueType: NullableIO( NumberIO )
    } );
    this.minValueProperty = new DerivedProperty( [ this.dataRangeProperty ], dataRange => {
      return dataRange === null ? null : dataRange.min;
    }, {
      tandem: options.tandem.createTandem( 'minValueProperty' ),
      phetioValueType: NullableIO( NumberIO )
    } );

    this.rangeValueProperty = new DerivedProperty( [ this.maxValueProperty, this.minValueProperty ], ( max, min ) => {
      return ( max === null || min === null ) ? null : max - min;
    }, {
      tandem: options.tandem.createTandem( 'rangeValueProperty' ),
      phetioValueType: NullableIO( NumberIO )
    } );

    this.q1ValueProperty = new Property<number | null>( null, {
      tandem: options.tandem.createTandem( 'q1ValueProperty' ),
      phetioValueType: NullableIO( NumberIO ),
      phetioReadOnly: true
    } );
    this.q3ValueProperty = new Property<number | null>( null, {
      tandem: options.tandem.createTandem( 'q3ValueProperty' ),
      phetioValueType: NullableIO( NumberIO ),
      phetioReadOnly: true
    } );
    this.iqrValueProperty = new DerivedProperty( [ this.q1ValueProperty, this.q3ValueProperty ], ( q1, q3 ) => {
      return q3! - q1!;
    } );

    this.madValueProperty = new Property<number | null>( null, {
      tandem: options.tandem.createTandem( 'madValueProperty' ),
      phetioValueType: NullableIO( NumberIO )
    } );

    this.updateDataMeasures();
    this.initialized = true;
  }

  public override reset(): void {
    super.reset();

    // TODO: https://github.com/phetsims/center-and-variability/issues/164 Should this be called in the parent class? Or at least make sure not to forget it
    // in any of the subclasses?
    this.updateDataMeasures();
  }

  protected override updateDataMeasures(): void {
    super.updateDataMeasures();

    if ( this.initialized ) {
      const sortedObjects = this.getSortedLandedObjects();

      // if there is enough data to calculate quartiles
      if ( sortedObjects.length >= 5 ) {

        // Split the array into lower and upper halves, ignoring the median value if there are an odd number of objects
        const splitIndex = Math.floor( sortedObjects.length / 2 );
        const lowerHalf = sortedObjects.slice( 0, splitIndex );
        const upperHalf = sortedObjects.slice( sortedObjects.length % 2 !== 0 ? splitIndex + 1 : splitIndex );

        const q1Objects: SoccerBall[] = CAVSceneModel.getMedianObjectsFromSortedArray( lowerHalf );
        const q3Objects: SoccerBall[] = CAVSceneModel.getMedianObjectsFromSortedArray( upperHalf );

        // take the average to account for cases where there is more than one object contributing to the median
        this.q1ValueProperty.value = _.mean( q1Objects.map( obj => obj.valueProperty.value! ) );
        this.q3ValueProperty.value = _.mean( q3Objects.map( obj => obj.valueProperty.value! ) );

        this.soccerBalls.forEach( object => {
          object.isQ1ObjectProperty.value = q1Objects.includes( object );
          object.isQ3ObjectProperty.value = q3Objects.includes( object );
        } );

        assert && assert( !isNaN( this.q1ValueProperty.value ) );
        assert && assert( !isNaN( this.q3ValueProperty.value ) );
      }
      else {
        this.q1ValueProperty.value = null;
        this.q3ValueProperty.value = null;
      }

      // Support call from superclass constructor
      if ( this.madValueProperty ) {
        this.madValueProperty.value = sortedObjects.length === 0 ? null :
                                      VariabilityModel.meanAbsoluteDeviation( sortedObjects.map( object => object.valueProperty.value! ) );
      }
    }
  }

}

centerAndVariability.register( 'VariabilitySceneModel', VariabilitySceneModel );