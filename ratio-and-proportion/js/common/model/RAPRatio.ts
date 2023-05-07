// Copyright 2020-2023, University of Colorado Boulder

/**
 * Model type that stores the state of the Ratio. This includes its values, the velocity of how it is changing, as well
 * as logic that maintains its "locked" state, when appropriate.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import rapConstants from '../rapConstants.js';
import RAPRatioTuple from './RAPRatioTuple.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';

// The threshold for velocity of a moving ratio value to indicate that it is "moving."
const VELOCITY_THRESHOLD = 0.01;

// How often (in frames) to capture the change in ratio values for the ratio's "velocity"
const STEP_FRAME_GRANULARITY = 30;

// How many values must be different within the STEP_FRAME_GRANULARITY number of frames to trigger a velocity calculation.
const VELOCITY_MEMORY = 3;

const DEFAULT_TERM_VALUE_RANGE = rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE;

// Use the same value as the no-success region threshold. This cannot be the same as the no-success threshold though
// because that threshold value, by definition, will unlock the ratio, see https://github.com/phetsims/ratio-and-proportion/issues/257#issuecomment-748285667
const LOCK_RATIO_RANGE_MIN = rapConstants.NO_SUCCESS_VALUE_THRESHOLD + Number.EPSILON;

// This value needs to be an "even and round" number as it pertains to the step size of the sliders that control the ratio.
// See https://github.com/phetsims/ratio-and-proportion/issues/535
assert && assert( LOCK_RATIO_RANGE_MIN === 0.01, 'please be careful when changing this' );

class RAPRatio {

  // Keep two references so that this can be public readonly, AND changed internally.
  public readonly enabledRatioTermsRangeProperty: TReadOnlyProperty<Range>;
  private readonly _enabledRatioTermsRangeProperty: Property<Range>;

  // Central Property that holds the value of the ratio. Using a tuple that holds
  // both the antecedent and consequent values as a single data structure is vital for changing both hands at once, and
  // in supporting the "locked ratio" state. Otherwise there are complicated reentrant cases where changing the
  // antecedent cascades to the consequent to snap it back into ratio. Thus the creation of RAPRatioTuple.
  public readonly tupleProperty: Property<RAPRatioTuple>;

  // when true, moving one ratio value will maintain the current ratio by updating the other value Property
  public readonly lockedProperty: BooleanProperty;
  private readonly antecedentVelocityTracker: VelocityTracker;
  private readonly consequentVelocityTracker: VelocityTracker;

  // if the ratio is in the "moving in direction" state: whether or not the two hands are moving fast
  // enough together in the same direction. This indicates, among other things a bimodal interaction.
  public readonly movingInDirectionProperty: TReadOnlyProperty<boolean>;

  // To avoid an infinite loop as setting the tupleProperty from inside its lock-ratio-support
  // listener. This is predominately needed because even same antecedent/consequent values get wrapped in a new
  // RAPRatioTuple instance.
  private ratioLockListenerEnabled = true;

  public constructor( initialAntecedent: number, initialConsequent: number, tandem: Tandem ) {

    this._enabledRatioTermsRangeProperty = new Property( DEFAULT_TERM_VALUE_RANGE, {
      tandem: tandem.createTandem( 'enabledRatioTermsRangeProperty' ),
      phetioValueType: Range.RangeIO
    } );
    this.enabledRatioTermsRangeProperty = this._enabledRatioTermsRangeProperty;

    this.tupleProperty = new Property( new RAPRatioTuple( initialAntecedent, initialConsequent ), {
      valueType: RAPRatioTuple,
      valueComparisonStrategy: 'equalsFunction',
      reentrant: true,

      // phet-io
      tandem: tandem.createTandem( 'tupleProperty' ),
      phetioValueType: RAPRatioTuple.RAPRatioTupleIO
    } );

    this.lockedProperty = new BooleanProperty( false, { tandem: tandem.createTandem( 'lockedProperty' ) } );

    this.antecedentVelocityTracker = new VelocityTracker( this.lockedProperty );
    this.consequentVelocityTracker = new VelocityTracker( this.lockedProperty );

    this.movingInDirectionProperty = new DerivedProperty( [
      this.antecedentVelocityTracker.currentVelocityProperty,
      this.consequentVelocityTracker.currentVelocityProperty,
      this.lockedProperty
    ], ( changeInAntecedent, changeInConsequent, ratioLocked ) => {
      const bothMoving = changeInAntecedent !== 0 && changeInConsequent !== 0;

      // both hands should be moving in the same direction
      const movingInSameDirection = changeInAntecedent > 0 === changeInConsequent > 0;

      const movingFastEnough = Math.abs( changeInAntecedent ) > VELOCITY_THRESHOLD && // antecedent past threshold
                               Math.abs( changeInConsequent ) > VELOCITY_THRESHOLD; // consequent past threshold

      // Ignore the speed component when the ratio is locked
      return bothMoving && movingInSameDirection && ( movingFastEnough || ratioLocked );
    }, {
      tandem: tandem.createTandem( 'movingInDirectionProperty' ),
      phetioValueType: BooleanIO
    } );


    // Listener that will handle keeping both ratio tuple values in sync when the ratio is locked.
    this.tupleProperty.link( ( tuple, oldTuple ) => {
      if ( this.lockedProperty.value && this.ratioLockListenerEnabled ) {
        assert && assert( oldTuple, 'need an old value to compute locked ratio values' );

        const antecedentChanged = tuple.antecedent !== oldTuple!.antecedent;
        const consequentChanged = tuple.consequent !== oldTuple!.consequent;
        const previousRatio = oldTuple!.getRatio();

        let newAntecedent = tuple.antecedent;
        let newConsequent = tuple.consequent;

        if ( this.enabledRatioTermsRangeProperty.value.contains( oldTuple!.antecedent ) &&
             this.enabledRatioTermsRangeProperty.value.contains( oldTuple!.consequent ) &&
             antecedentChanged && consequentChanged && !phet.joist.sim.isSettingPhetioStateProperty.value ) {
          assert && assert( rapConstants.toFixed( tuple.getRatio() ) === rapConstants.toFixed( oldTuple!.getRatio() ), // eslint-disable-line bad-sim-text
            'if both values change while locked, the ratio should be maintained.' );
        }

        if ( antecedentChanged ) {
          newConsequent = newAntecedent / previousRatio;
        }
        else if ( consequentChanged ) {
          newAntecedent = newConsequent * previousRatio;
        }

        const newRatioTuple = this.clampRatioTupleValuesInRange( newAntecedent, newConsequent, previousRatio );

        // guard against reentrancy in this case.
        this.ratioLockListenerEnabled = false;
        this.tupleProperty.value = newRatioTuple;
        this.ratioLockListenerEnabled = true;
      }
    } );

    this.lockedProperty.link( ratioLocked => {
      this._enabledRatioTermsRangeProperty.value = new Range( ratioLocked ? LOCK_RATIO_RANGE_MIN : DEFAULT_TERM_VALUE_RANGE.min, DEFAULT_TERM_VALUE_RANGE.max );
    } );

    this.enabledRatioTermsRangeProperty.link( enabledRange => {
      const currentTuple = this.tupleProperty.value;
      const newAntecedent = enabledRange.constrainValue( currentTuple.antecedent );
      const newConsequent = enabledRange.constrainValue( currentTuple.consequent );

      // new instance to trigger notifications
      this.tupleProperty.value = new RAPRatioTuple( newAntecedent, newConsequent );
    } );
  }

  /**
   * While keeping the same ratio, make sure that both ratio terms are within the provided range. Returns a new
   * RAPRatioTuple, not mutated.
   */
  private clampRatioTupleValuesInRange( antecedent: number, consequent: number, ratio: number, range: Range = this.enabledRatioTermsRangeProperty.value ): RAPRatioTuple {

    // Handle if the antecedent is out of range
    if ( !range.contains( antecedent ) ) {
      antecedent = Utils.clamp( antecedent, range.min, range.max );
      consequent = antecedent / ratio;
    }

    // Handle if the consequent is out of range
    if ( !range.contains( consequent ) ) {
      consequent = Utils.clamp( consequent, range.min, range.max );
      antecedent = consequent * ratio;
    }

    assert && assert( range.contains( consequent ) );
    assert && assert( range.contains( antecedent ) );
    return new RAPRatioTuple( antecedent, consequent );
  }

  public setRatioToTarget( targetRatio: number ): void {
    const currentRatioTuple = this.tupleProperty.value;

    let antecedent = currentRatioTuple.antecedent;
    let consequent = currentRatioTuple.consequent;

    // Snap the smaller value, because that will yield a smaller snap distance, see https://github.com/phetsims/ratio-and-proportion/issues/257
    if ( antecedent < consequent ) {
      antecedent = targetRatio * consequent;
    }
    else {
      consequent = antecedent / targetRatio;
    }

    // Then clamp to be within the currently enabled range.
    const newRatioTuple = this.clampRatioTupleValuesInRange( antecedent, consequent, targetRatio );
    assert && assert( newRatioTuple !== currentRatioTuple,
      'Cannot mutate here, as we rely on notifications below when setting the Property.' );

    // Make sure that the lock ratio listener won't try to mutate the new RAPRatioTuple
    this.ratioLockListenerEnabled = false;
    this.tupleProperty.value = newRatioTuple;
    this.ratioLockListenerEnabled = true;
  }

  public get currentRatio(): number {
    return this.tupleProperty.value.getRatio();
  }

  public step(): void {
    const currentTuple = this.tupleProperty.value;
    this.antecedentVelocityTracker.step( currentTuple.antecedent );
    this.consequentVelocityTracker.step( currentTuple.consequent );
  }

  public reset(): void {

    // it is easiest if this is reset first
    this.lockedProperty.reset();

    this.tupleProperty.reset();

    this._enabledRatioTermsRangeProperty.reset();
    this.antecedentVelocityTracker.reset();
    this.consequentVelocityTracker.reset();
    this.ratioLockListenerEnabled = true;
  }
}

// Private class to keep details about tracking the velocity of each ratio term encapsulated.
class VelocityTracker {

  private ratioLockedProperty: Property<boolean>;

  // keep track of previous values to calculate the change, only unique values are appended to this
  private previousValues: number[];
  private earliestTime: number;

  // The change in ratio values since last capture. The frequency (or granularity) of this value
  // is determined by STEP_FRAME_GRANULARITY.
  public currentVelocityProperty: NumberProperty;

  // Used for keeping track of how often dVelocity is checked.
  private stepCountTracker: number;

  public constructor( ratioLockedProperty: Property<boolean> ) {

    this.ratioLockedProperty = ratioLockedProperty;
    this.previousValues = [];
    this.earliestTime = 0;
    this.currentVelocityProperty = new NumberProperty( 0 );
    this.stepCountTracker = 0;
  }

  public reset(): void {
    this.currentVelocityProperty.reset();
    this.stepCountTracker = 0;
    this.previousValues.length = 0;
  }

  public step( currentValue: number ): void {
    this.stepCountTracker++;

    // Capture a value at intervals within the timeframe for each velocity calculation.
    this.previousValues.push( currentValue );

    // only recalculate every X steps to help smooth out noise
    if ( this.stepCountTracker % STEP_FRAME_GRANULARITY === 0 ) {

      // Keep only at most this many values in the list.
      while ( this.previousValues.length > STEP_FRAME_GRANULARITY ) {
        this.previousValues.shift();
      }

      // There must be at least VELOCITY_MEMORY number of unique values (VELOCITY_MEMORY-1 number of changes) in order
      // to have velocity in this model. This doesn't account for the case in which you change from A -> B -> A, but that
      // is acceptable for our particular case since this velocity is very directional. When locked
      if ( this.previousValues.length >= VELOCITY_MEMORY &&
           ( _.uniq( this.previousValues ).length >= VELOCITY_MEMORY || this.ratioLockedProperty.value ) ) {
        this.currentVelocityProperty.value = this.previousValues[ this.previousValues.length - 1 ] - this.previousValues[ 0 ];
      }
      else {

        // No velocity if the above criteria hasn't been fulfilled
        this.currentVelocityProperty.value = 0;
      }
    }
  }
}

ratioAndProportion.register( 'RAPRatio', RAPRatio );
export default RAPRatio;
