// Copyright 2022-2023, University of Colorado Boulder

/**
 * Model for the "Mean & Median" screen.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import centerAndVariability from '../../centerAndVariability.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import CAVSceneModel from '../../common/model/CAVSceneModel.js';
import CAVModel from '../../common/model/CAVModel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import CAVConstants from '../../common/CAVConstants.js';

// constants
const HIGHLIGHT_ANIMATION_TIME_STEP = 0.25; // in seconds

export default class MeanAndMedianModel extends CAVModel {

  // Indicates how far the show median animation has progressed, or null if not animating. Not PhET-iO instrumented since
  // it represents a transient value.
  private highlightAnimationIndex: number | null = null;

  private lastHighlightAnimationStepTime = 0;
  public readonly isMedianAnimationCompleteProperty = new BooleanProperty( false );
  public readonly isShowingTopMedianProperty: BooleanProperty;
  public readonly isShowingTopMeanProperty: BooleanProperty;
  public readonly isShowingMeanPredictionProperty: BooleanProperty;
  public readonly meanPredictionProperty: NumberProperty;

  public constructor( options: { tandem: Tandem } ) {

    const scene = new CAVSceneModel( CAVSceneModel.chooseDistribution(), { tandem: options.tandem.createTandem( 'sceneModel' ) } );
    super( [ scene ], {
      ...options,
      instrumentMeanPredictionProperty: true
    } );

    this.isShowingTopMeanProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'isShowingTopMeanProperty' )
    } );
    this.isShowingTopMedianProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'isShowingTopMedianProperty' )
    } );

    // Don't show animation on startup or when setting PhET-iO state
    this.isShowingTopMedianProperty.lazyLink( isShowingTopMedian => {
      if ( isShowingTopMedian ) {

        if ( !phet.joist.sim.isSettingPhetioStateProperty.value ) {
          this.highlightAnimationIndex = 0;
          this.lastHighlightAnimationStepTime = scene.timeProperty.value;
        }
        else {

          // When setting PhET-iO state, show the arrow right away.
          this.isMedianAnimationCompleteProperty.value = true;
        }
      }
      else {
        this.clearAnimation();
        this.isMedianAnimationCompleteProperty.value = false;
      }
    } );

    this.meanPredictionProperty = new NumberProperty( 1.5, {
      range: CAVConstants.PHYSICAL_RANGE,
      tandem: options.tandem.createTandem( 'meanPredictionProperty' )
    } );
    this.isShowingMeanPredictionProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'isShowingMeanPredictionProperty' )
    } );

    scene.objectValueBecameNonNullEmitter.addListener( () => this.updateAnimation() );
  }

  public override reset(): void {
    super.reset();
    this.highlightAnimationIndex = null;
    this.isMedianAnimationCompleteProperty.reset();
    this.isShowingTopMeanProperty.reset();
    this.isShowingTopMedianProperty.reset();
    this.meanPredictionProperty.reset();
    this.isShowingMeanPredictionProperty.reset();
  }

  public override step( dt: number ): void {
    super.step( dt );
    this.updateAnimation();
  }

  private clearAnimation(): void {
    this.highlightAnimationIndex = null;
    this.selectedSceneModelProperty.value.soccerBalls.forEach( soccerBall => soccerBall.isShowingAnimationHighlightProperty.set( false ) );
  }

  private updateAnimation(): void {

    const sortedObjects = this.selectedSceneModelProperty.value.getSortedLandedObjects();

    for ( let i = 0; i < sortedObjects.length / 2; i++ ) {
      const isHighlighted = i === this.highlightAnimationIndex;
      sortedObjects[ i ].isShowingAnimationHighlightProperty.value = isHighlighted;

      const upperIndex = sortedObjects.length - 1 - i;
      sortedObjects[ upperIndex ].isShowingAnimationHighlightProperty.value = isHighlighted;
    }

    const isAnimationFinished = this.highlightAnimationIndex !== null &&
                                this.highlightAnimationIndex >= sortedObjects.length / 2;

    if ( isAnimationFinished ) {
      this.clearAnimation();
      this.isMedianAnimationCompleteProperty.value = true;
    }
    else if ( this.highlightAnimationIndex !== null &&
              this.selectedSceneModelProperty.value.timeProperty.value > this.lastHighlightAnimationStepTime + HIGHLIGHT_ANIMATION_TIME_STEP ) {

      // if the animation has already started, step it to the next animation index
      this.highlightAnimationIndex++;
      this.lastHighlightAnimationStepTime = this.selectedSceneModelProperty.value.timeProperty.value;
    }
  }
}

centerAndVariability.register( 'MeanAndMedianModel', MeanAndMedianModel );