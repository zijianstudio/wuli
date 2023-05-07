// Copyright 2022-2023, University of Colorado Boulder

/**
 * Model for the "Variability" class.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import centerAndVariability from '../../centerAndVariability.js';
import Property from '../../../../axon/js/Property.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import VariabilityMeasure from './VariabilityMeasure.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import CAVModel, { CAVModelOptions } from '../../common/model/CAVModel.js';
import VariabilitySceneModel from './VariabilitySceneModel.js';
import Emitter from '../../../../axon/js/Emitter.js';

type SelfOptions = EmptySelfOptions;
type VariabilityModelOptions = SelfOptions & CAVModelOptions;

export default class VariabilityModel extends CAVModel {
  private readonly initialized: boolean = false;

  public readonly selectedVariabilityProperty: Property<VariabilityMeasure>;
  public readonly isShowingRangeProperty: Property<boolean>;
  public readonly isShowingIQRProperty: Property<boolean>;
  public readonly isShowingMADProperty: Property<boolean>;
  public readonly isInfoShowingProperty: Property<boolean>;
  public readonly isShowingPlayAreaVariabilityProperty: BooleanProperty;

  public readonly resetEmitter = new Emitter();
  public readonly variabilitySceneModels: VariabilitySceneModel[];

  public constructor( options: VariabilityModelOptions ) {

    // TODO: the parent class sets this incorrectly on reset.
    // TODO: See https://github.com/phetsims/center-and-variability/issues/117. PhET-iO wants to be able to set these values. Maybe in the preferences, we would also add a "custom"
    //       option that would allow the user to specify the distribution parameters. Or for PhET-iO, and query parameters
    const sceneModels = [
      new VariabilitySceneModel( [ 0, 0, 0, 1, 3, 10, 18, 20, 18, 10, 3, 1, 0, 0, 0 ], { tandem: options.tandem.createTandem( 'sceneModel1' ) } ),
      new VariabilitySceneModel( [ 5, 5, 10, 10, 25, 30, 40, 50, 40, 30, 25, 10, 10, 5, 5 ], { tandem: options.tandem.createTandem( 'sceneModel2' ) } ),
      new VariabilitySceneModel( [ 6, 9, 11, 14, 11, 8, 6, 5, 5, 5, 5, 5, 5, 5, 5 ], { tandem: options.tandem.createTandem( 'sceneModel3' ) } ),
      new VariabilitySceneModel( [ 5, 5, 5, 5, 5, 5, 5, 5, 6, 8, 11, 14, 11, 9, 6 ], { tandem: options.tandem.createTandem( 'sceneModel4' ) } )
    ];
    super( sceneModels, options );

    this.initialized = true;

    this.variabilitySceneModels = sceneModels;


    this.selectedVariabilityProperty = new EnumerationProperty( VariabilityMeasure.RANGE, {
      tandem: options.tandem.createTandem( 'selectedVariabilityProperty' )
    } );

    this.isShowingRangeProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'isShowingRangeProperty' )
    } );

    this.isShowingIQRProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'isShowingIQRProperty' )
    } );

    this.isShowingMADProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'isShowingMADProperty' )
    } );

    this.isInfoShowingProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'isInfoShowingProperty' )
    } );


    this.isShowingPlayAreaVariabilityProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'isShowingPlayAreaVariabilityProperty' )
    } );
  }

  public override reset(): void {
    super.reset();

    this.selectedVariabilityProperty.reset();
    this.isShowingRangeProperty.reset();
    this.isShowingIQRProperty.reset();
    this.isShowingMADProperty.reset();
    this.isInfoShowingProperty.reset();

    this.resetEmitter.emit();
  }

  public static meanAbsoluteDeviation( data: number[] ): number {

    // Calculate the mean
    const mean = data.reduce( ( sum, value ) => sum + value, 0 ) / data.length;

    // Calculate the absolute deviations
    const absoluteDeviations = data.map( value => Math.abs( value - mean ) );

    // Calculate the sum of absolute deviations
    const sumOfAbsoluteDeviations = absoluteDeviations.reduce( ( sum, value ) => sum + value, 0 );

    // Calculate the MAD
    const mad = sumOfAbsoluteDeviations / data.length;

    return mad;
  }
}

centerAndVariability.register( 'VariabilityModel', VariabilityModel );