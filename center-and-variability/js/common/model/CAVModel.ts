// Copyright 2023, University of Colorado Boulder

import centerAndVariability from '../../centerAndVariability.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import CAVConstants from '../CAVConstants.js';
import Property from '../../../../axon/js/Property.js';
import CAVSceneModel from './CAVSceneModel.js';

type SelfOptions = {
  tandem: Tandem;
  instrumentMeanPredictionProperty: boolean;
};
export type CAVModelOptions = SelfOptions;

export default class CAVModel {

  public readonly isShowingPlayAreaMedianProperty: BooleanProperty; // Screens 1-3

  // TODO: Should some of these should move to subclasses? https://github.com/phetsims/center-and-variability/issues/153
  public readonly isShowingPlayAreaMeanProperty: BooleanProperty;  // Screens 2-3
  public readonly isShowingMedianPredictionProperty: BooleanProperty; // Screens 1-2
  public readonly medianPredictionProperty: NumberProperty; // Screens 1-2

  public readonly selectedSceneModelProperty: Property<CAVSceneModel>;
  public readonly soccerBallHasBeenDraggedProperty: Property<boolean>;

  public constructor( public readonly sceneModels: CAVSceneModel[], options: CAVModelOptions ) {

    this.isShowingPlayAreaMeanProperty = new BooleanProperty( false, {
      tandem: options.instrumentMeanPredictionProperty ? options.tandem.createTandem( 'isShowingPlayAreaMeanProperty' ) : Tandem.OPT_OUT
    } );
    this.isShowingPlayAreaMedianProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'isShowingPlayAreaMedianProperty' )
    } );

    this.isShowingMedianPredictionProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'isShowingMedianPredictionProperty' )
    } );

    this.medianPredictionProperty = new NumberProperty( 1, {

      // Assumes all physical ranges are the same
      range: CAVConstants.PHYSICAL_RANGE,
      tandem: options.tandem.createTandem( 'medianPredictionProperty' )
    } );

    this.selectedSceneModelProperty = new Property( sceneModels[ 0 ], {
      validValues: sceneModels,
      tandem: options.tandem.createTandem( 'selectedSceneModelProperty' )
    } );

    this.selectedSceneModelProperty.link( selectedScene => {
      this.sceneModels.forEach( sceneModel => {
        sceneModel.isVisibleProperty.value = sceneModel === selectedScene;
      } );
    } );

    this.soccerBallHasBeenDraggedProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'soccerBallHasBeenDraggedProperty' )
    } );
  }

  public step( dt: number ): void {
    // Override in subclasses

    this.selectedSceneModelProperty.value.step( dt );
  }

  public reset(): void {
    this.medianPredictionProperty.reset();

    this.isShowingPlayAreaMeanProperty.reset();
    this.isShowingPlayAreaMedianProperty.reset();

    this.isShowingMedianPredictionProperty.reset();

    this.sceneModels.forEach( sceneModel => sceneModel.reset() );
    this.selectedSceneModelProperty.reset();
    this.soccerBallHasBeenDraggedProperty.reset();
  }
}

centerAndVariability.register( 'CAVModel', CAVModel );