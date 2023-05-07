// Copyright 2022-2023, University of Colorado Boulder

/**
 * Model for the "Median" screen
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import centerAndVariability from '../../centerAndVariability.js';
import CardModel from '../../median/model/CardModel.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import CAVSceneModel from '../../common/model/CAVSceneModel.js';
import CAVModel from '../../common/model/CAVModel.js';
import Tandem from '../../../../tandem/js/Tandem.js';

export default class MedianModel extends CAVModel {

  public readonly cards: CardModel[];
  public readonly isSortingDataProperty: BooleanProperty;
  public readonly isShowingTopMedianProperty: BooleanProperty;

  public constructor( options: { tandem: Tandem } ) {
    const scene = new CAVSceneModel( CAVSceneModel.chooseDistribution(), { tandem: options.tandem.createTandem( 'sceneModel' ) } );
    super( [ scene ], {
      ...options,
      instrumentMeanPredictionProperty: false
    } );

    this.cards = this.sceneModels[ 0 ].soccerBalls.map( ( soccerBall, index ) => new CardModel( soccerBall, {
      tandem: options.tandem.createTandem( 'cards' ).createTandem( 'card' + index )
    } ) );

    this.isSortingDataProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'isSortingDataProperty' )
    } );

    this.isShowingTopMedianProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'isShowingTopMedianProperty' )
    } );
  }

  public override reset(): void {
    super.reset();
    this.isSortingDataProperty.reset();
    this.isShowingTopMedianProperty.reset();
  }
}

centerAndVariability.register( 'MedianModel', MedianModel );