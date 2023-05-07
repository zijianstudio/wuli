// Copyright 2022, University of Colorado Boulder

/**
 * This file adds media pipe "hands" input to RAP, see MediaPipe
 *
 * In general there are a couple of actions here:
 *
 * Hand Position changes:
 * Each hand position in the sim is controlled by a few marker points from MediaPipe right around the knuckles of the hand.
 * These points are averaged to get the position of that hand. Note that axis can be flipped in options to change which
 * real-world hand corresponds to which hand in the sim.
 *
 * Voicing enabled:
 * A gestured called the "O_HAND_GESTURE", in which thumb and pointer touch in to make a circle, leaving the other fingers
 * straight, is used to turn off voicing. Turning off voicing actually allows a single voicing response to be spoken
 * fully, so in a sense, though the code thinks that the "O_HAND_GESTURE" turns off voicing, it actually allows a single
 * voicing response to be heard.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import MediaPipe, { HandLandmarks, HandPoint } from '../../../../tangible/js/mediaPipe/MediaPipe.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPRatioTuple from '../model/RAPRatioTuple.js';
import Property from '../../../../axon/js/Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import rapConstants from '../rapConstants.js';
import ViewSounds from './sound/ViewSounds.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import handleSmoothValue from './handleSmoothValue.js';
import StationaryValueTracker from './StationaryValueTracker.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import MediaPipeQueryParameters from '../../../../tangible/js/mediaPipe/MediaPipeQueryParameters.js';

if ( MediaPipeQueryParameters.cameraInput === 'hands' ) {
  MediaPipe.initialize();
}

// Number of positions to keep to average out to smooth the hand positions
const POSITION_HISTORY_LENGTH = 10;

// Number of previous O_HAND_GESTURE enabled states to keep to average out to determine if voicing is enabled. All must store
// false for the gesture to no longer be enabled.
const O_HAND_GESTURE_DETECTED_HISTORY_LENGTH = 15;

// Number of previous states to keep to average out to determine if two (and only two) hands are detected by mediaPipe.
const TWO_HANDS_DETECTED_HISTORY_LENGTH = 10;

// The max value of each hand position vector component that we get from MediaPipe. (x,y,z)
const HAND_POSITION_MAX_VALUE = 1;

// Hand-tracking points that we use to calculate the position of the ratio in the sim,  See https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model
const HAND_POINTS = [ 5, 9, 13 ];

const THUMB_TIP = 4;
const INDEX_TIP = 8;

const MARKERS_TOUCHING_THRESHOLD = 0.04;

// Scratch vectors to avoid taking too much memory
const firstMarkerTouchingVector = new Vector2( 0, 0 );
const secondMarkerTouchingVector = new Vector2( 0, 0 );

type RAPMediaPipeOptions = {
  onInput?: () => void;
  isBeingInteractedWithProperty?: Property<boolean>;
} & PickRequired<PhetioObjectOptions, 'tandem'>;

class RAPMediaPipe extends MediaPipe {

  public readonly isBeingInteractedWithProperty: Property<boolean>;
  private ratioTupleProperty: Property<RAPRatioTuple>;
  private ratioLockedProperty: Property<boolean>;
  private antecedentViewSounds: ViewSounds;
  private consequentViewSounds: ViewSounds;

  private twoHandsDetectedHistory: boolean[] = [];
  private antecedentHandPositions: Vector3[] = [];
  private consequentHandPositions: Vector3[] = [];
  private oHandGestureDetectedHistory: boolean[] = [];
  public oHandGestureProperty: Property<boolean>;
  public antecedentStationaryTracker = new StationaryValueTracker();
  public consequentStationaryTracker = new StationaryValueTracker();
  public handsStationaryProperty: TReadOnlyProperty<boolean>;

  // Use a gesture to determine if voicing for the hands should be enabled

  private onInput: () => void;

  public constructor( ratioTupleProperty: Property<RAPRatioTuple>, ratioLockedProperty: Property<boolean>,
                      antecedentViewSounds: ViewSounds, consequentViewSounds: ViewSounds, providedOptions: RAPMediaPipeOptions ) {
    const options = optionize<RAPMediaPipeOptions>()( {
      isBeingInteractedWithProperty: new BooleanProperty( false ),
      onInput: _.noop
    }, providedOptions );
    super();

    this.isBeingInteractedWithProperty = options.isBeingInteractedWithProperty;
    this.ratioTupleProperty = ratioTupleProperty;
    this.ratioLockedProperty = ratioLockedProperty;
    this.onInput = options.onInput;
    this.antecedentViewSounds = antecedentViewSounds;
    this.consequentViewSounds = consequentViewSounds;
    this.oHandGestureProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'oHandGestureProperty' ),
      phetioReadOnly: true
    } );

    this.handsStationaryProperty = new DerivedProperty( [
      this.antecedentStationaryTracker.isStationaryProperty,
      this.consequentStationaryTracker.isStationaryProperty,
      this.oHandGestureProperty
    ], ( antecedentStationary, consequentStationary, oHandGesturePresent ) => {
      return antecedentStationary && consequentStationary && !oHandGesturePresent;
    }, {
      tandem: options.tandem.createTandem( 'handsStationaryProperty' ),
      phetioValueType: BooleanIO
    } );

    this.isBeingInteractedWithProperty.lazyLink( interactedWith => {
      if ( interactedWith ) {
        this.antecedentViewSounds.boundarySoundClip.onStartInteraction();
        this.consequentViewSounds.boundarySoundClip.onStartInteraction();

        // It is arbitrary here whether to use sounds from antecedent or consequent.
        this.antecedentViewSounds.grabSoundClip.play();
      }
      else {
        this.antecedentViewSounds.boundarySoundClip.onEndInteraction( this.ratioTupleProperty.value.antecedent );
        this.consequentViewSounds.boundarySoundClip.onEndInteraction( this.ratioTupleProperty.value.consequent );

        this.antecedentViewSounds.releaseSoundClip.play();
      }
    } );
  }

  public step(): void {

    const results = MediaPipe.resultsProperty.value;

    // Be more tolerant about if we are interacting with MediaPipe.
    this.isBeingInteractedWithProperty.value = results ?
                                               this.getSmoothedTwoHandsDetected( results.multiHandLandmarks ) :
                                               false;

    // Though isBeingInteractedWithProperty is tolerant, we actually need two hands to calculate sim changes.
    if ( results && results.multiHandLandmarks && ( results.multiHandLandmarks.length === 2 || results.multiHandLandmarks.length === 1 ) &&

         // ensure that multiHandLandmarks look as expected, or ignore that frame, see https://github.com/phetsims/ratio-and-proportion/issues/501
         _.every( results.multiHandLandmarks, landmarkList => landmarkList.length === 21 ) ) {

      // Voicing is disabled with the gesture of an "O" hand gesture from both hands. Must be set before this.onInteract() is called
      this.oHandGestureProperty.value = this.oHandGesturePresent( results.multiHandLandmarks );

      const handPositions = this.getPositionsOfHands( results.multiHandLandmarks );

      if ( results.multiHandLandmarks.length === 2 ) {

        this.antecedentStationaryTracker.update( handPositions[ 0 ].y );
        this.consequentStationaryTracker.update( handPositions[ 1 ].y );
      }
      else {

        const position = handPositions[ 0 ];

        // if just one hand is detected, defer to the absolute position of the hand, arbitrarily splitting half way
        // through the screen.
        const stationaryTracker = position.x >= HAND_POSITION_MAX_VALUE / 2 ? this.consequentStationaryTracker :
                                  this.antecedentStationaryTracker;
        stationaryTracker.update( position.y );
      }

      const newTuple = this.tupleFromSmoothing( handPositions );

      // If locked, then only change one of the value, the other will update accordingly.
      if ( this.ratioLockedProperty.value ) {
        if ( MediaPipe.yAxisFlippedProperty.value ) {
          newTuple.antecedent = this.ratioTupleProperty.value.antecedent;
        }
        else {
          newTuple.consequent = this.ratioTupleProperty.value.consequent;
        }
      }

      if ( !this.oHandGestureProperty.value ) {
        this.ratioTupleProperty.value = newTuple;
      }

      this.onInteract( newTuple );
    }
  }

  private tupleFromSmoothing( handPositions: Vector3[] ): RAPRatioTuple {
    assert && assert( handPositions.length === 2 || handPositions.length === 1, 'must have 1 or 2 hands' );

    let leftHandPosition: Vector3;
    let rightHandPosition: Vector3;

    if ( handPositions.length === 2 ) {
      leftHandPosition = handPositions[ 0 ];
      rightHandPosition = handPositions[ 1 ];
    }
    else {

      // Each half of the screen the hand was detected on will correspond to which side of the ratio the single hand
      // applies to.
      if ( handPositions[ 0 ].x >= HAND_POSITION_MAX_VALUE / 2 ) {
        leftHandPosition = this.antecedentHandPositions.length > 0 ?
                           this.antecedentHandPositions[ this.antecedentHandPositions.length - 1 ] :
                           Vector3.pool.create( 0, this.ratioTupleProperty.value.antecedent, 0 );
        rightHandPosition = handPositions[ 0 ];
      }
      else {
        leftHandPosition = handPositions[ 0 ];
        rightHandPosition = this.consequentHandPositions.length > 0 ?
                            this.consequentHandPositions[ this.consequentHandPositions.length - 1 ] :
                            Vector3.pool.create( 0, this.ratioTupleProperty.value.consequent, 0 );
      }
    }
    return new RAPRatioTuple(
      this.getSmoothedPosition( leftHandPosition, this.antecedentHandPositions ).y,
      this.getSmoothedPosition( rightHandPosition, this.consequentHandPositions ).y
    ).constrainFields( rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE );
  }

  private getSmoothedTwoHandsDetected( multiHandLandmarks: HandLandmarks[] ): boolean {
    const handsDetected = multiHandLandmarks.length === 2 || multiHandLandmarks.length === 1;
    return handleSmoothValue( handsDetected, this.twoHandsDetectedHistory, TWO_HANDS_DETECTED_HISTORY_LENGTH,

      // To reduce false positives and false negatives, 50% of the history must have two hands detected.
      () => this.twoHandsDetectedHistory.filter( _.identity ).length > TWO_HANDS_DETECTED_HISTORY_LENGTH / 2
    );
  }

  /**
   * Average the historical positions together to get the current value
   */
  private getSmoothedPosition( position: Vector3, historicalPositions: Vector3[] ): Vector3 {
    return handleSmoothValue( position, historicalPositions, POSITION_HISTORY_LENGTH, Vector3.average );
  }

  private getPositionsOfHands( multiHandLandmarks: HandLandmarks[] ): Vector3[] {
    assert && assert( multiHandLandmarks.length === 2 || multiHandLandmarks.length === 1, 'must have 1 or 2 hands' );

    const handPositions = multiHandLandmarks.map( ( handMarkerPositions: HandPoint[] ) => {
      const finalPosition = new Vector3( 0, 0, 0 );

      // These are along the center of a hand, about where we have calibrated the hand icon in RAP, see https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model
      HAND_POINTS.forEach( index => {
        const point = handMarkerPositions[ index ];
        if ( !point.x || !point.y || !point.z ) {
          console.log( 'broken hand landmark input: ', multiHandLandmarks );
        }
        assert && assert( typeof point.x === 'number' );
        assert && assert( typeof point.y === 'number' );
        assert && assert( typeof point.z === 'number' );
        const yPosition = MediaPipe.xAxisFlippedProperty.value ? point.y : HAND_POSITION_MAX_VALUE - point.y;
        const xPosition = MediaPipe.yAxisFlippedProperty.value ? point.x : HAND_POSITION_MAX_VALUE - point.x;
        const position = new Vector3( xPosition, yPosition, HAND_POSITION_MAX_VALUE - point.z );
        finalPosition.add( position );
      } );

      return finalPosition.divideScalar( HAND_POINTS.length );
    } );

    return RAPMediaPipe.sortHandPositions( handPositions );
  }

  private static sortHandPositions( handPositions: Vector3[] ): Vector3[] {
    if ( handPositions.length === 2 ) {
      return handPositions[ 0 ].x <= handPositions[ 1 ].x ? handPositions : handPositions.reverse();
    }
    return handPositions;
  }

  private static positionValid( position: HandPoint ): boolean {
    return position && position.hasOwnProperty( 'x' ) && position.hasOwnProperty( 'y' ) &&
           typeof position.x === 'number' && typeof position.y === 'number';
  }

  private static markersTouching( point1: number, point2: number, handMarkerPositions: HandPoint[] ): boolean {
    assert && assert( handMarkerPositions.length === 21, '21 hand positions expected', handMarkerPositions );
    const position1 = handMarkerPositions[ point1 ];
    const position2 = handMarkerPositions[ point2 ];

    if ( !( RAPMediaPipe.positionValid( position1 ) && RAPMediaPipe.positionValid( position2 ) ) ) {
      return false;
    }

    firstMarkerTouchingVector.setXY( position1.x, position1.y );
    secondMarkerTouchingVector.setXY( position2.x, position2.y );

    return firstMarkerTouchingVector.distance( secondMarkerTouchingVector ) < MARKERS_TOUCHING_THRESHOLD;
  }

  private onInteract( newValue: RAPRatioTuple ): void {
    this.onInput();
    this.antecedentViewSounds.boundarySoundClip.onInteract( newValue.antecedent );
    this.consequentViewSounds.boundarySoundClip.onInteract( newValue.consequent );
    this.antecedentViewSounds.tickMarkBumpSoundClip.onInteract( newValue.antecedent );
    this.consequentViewSounds.tickMarkBumpSoundClip.onInteract( newValue.consequent );
  }

  private static hasOHandGesture( multiHandLandmarks: HandLandmarks[] ): boolean {

    // Cannot have O_HAND_GESTURE without two and only two hands.
    if ( multiHandLandmarks.length !== 2 ) {
      return false;
    }
    return RAPMediaPipe.markersTouching( THUMB_TIP, INDEX_TIP, multiHandLandmarks[ 0 ] ) &&
           RAPMediaPipe.markersTouching( THUMB_TIP, INDEX_TIP, multiHandLandmarks[ 1 ] );
  }

  /**
   * Voicing is eagerly disabled upon first "O-Hand Gesture" detection, but to turn it on, keep track of history to ensure
   * that the user is actually intending to stop the "O-Hand Gesture"
   */
  private oHandGesturePresent( multiHandLandmarks: HandLandmarks[] ): boolean {

    if ( multiHandLandmarks.length !== 2 ) {
      return false;
    }
    const newOHandGestureDetected = RAPMediaPipe.hasOHandGesture( multiHandLandmarks );

    if ( !newOHandGestureDetected ) {
      this.oHandGestureDetectedHistory.push( newOHandGestureDetected );
      return false;
    }

    return handleSmoothValue( newOHandGestureDetected, this.oHandGestureDetectedHistory, O_HAND_GESTURE_DETECTED_HISTORY_LENGTH,

      // If there is a single O_HAND_GESTURE present, then there is still intent to gesture.
      () => this.oHandGestureDetectedHistory.filter( _.identity ).length !== 0
    );
  }

  public reset(): void {
    this.isBeingInteractedWithProperty.reset();
  }
}

ratioAndProportion.register( 'RAPMediaPipe', RAPMediaPipe );
export default RAPMediaPipe;