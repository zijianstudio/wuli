// Copyright 2019-2022, University of Colorado Boulder

/**
 * GenerationClock is the clock that completes one full cycle per generation.  In the user-interface, time is
 * presented in terms of 'generations'. Various events are described as times relative to the "wall clock" time
 * on the generation clock. For example, "bunnies reproduce at 12:00", or "wolves eat at 4:00".
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import naturalSelection from '../../naturalSelection.js';
import NaturalSelectionQueryParameters from '../NaturalSelectionQueryParameters.js';
import NaturalSelectionUtils from '../NaturalSelectionUtils.js';

// const
const SECONDS_PER_GENERATION = NaturalSelectionQueryParameters.secondsPerGeneration;
const MIN_STEPS_PER_GENERATION = 10;
const MAX_DT = SECONDS_PER_GENERATION / MIN_STEPS_PER_GENERATION;
export default class GenerationClock extends PhetioObject {
  constructor(providedOptions) {
    const options = optionize()({
      // PhetioObjectOptions
      phetioState: false,
      // to prevent serialization, because we don't have an IO Type
      phetioDocumentation: 'the clock that marks the duration of a generation'
    }, providedOptions);
    super(options);
    this.isRunningProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('isRunningProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'whether the generation clock is running'
    });
    this.timeInSecondsProperty = new NumberProperty(0, {
      isValidValue: time => time >= 0,
      tandem: options.tandem.createTandem('timeInSecondsProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'time that the generation clock has been running, in seconds (decimal)',
      phetioHighFrequency: true
    });

    // Percent of the current clock cycle that has been completed.
    this.timeInPercentProperty = new DerivedProperty([this.timeInSecondsProperty], timeInSeconds => timeInSeconds % SECONDS_PER_GENERATION / SECONDS_PER_GENERATION, {
      isValidValue: timeInPercent => timeInPercent >= 0 && timeInPercent <= 1,
      tandem: Tandem.OPT_OUT
    });
    this.timeInGenerationsProperty = new DerivedProperty([this.timeInSecondsProperty], timeInSeconds => secondsToGenerations(timeInSeconds), {
      tandem: options.tandem.createTandem('timeInGenerationsProperty'),
      phetioValueType: NumberIO,
      phetioDocumentation: 'time that the generation clock has been running, in generations (decimal)',
      phetioHighFrequency: true
    });

    // Named clockGenerationProperty to distinguish it from the other 'generation' Properties in this sim.
    // See https://github.com/phetsims/natural-selection/issues/187
    this.clockGenerationProperty = new DerivedProperty([this.timeInGenerationsProperty], timeInGenerations => Math.floor(timeInGenerations), {
      isValidValue: clockGeneration => NaturalSelectionUtils.isNonNegativeInteger(clockGeneration),
      tandem: options.tandem.createTandem('clockGenerationProperty'),
      phetioValueType: NumberIO,
      phetioDocumentation: 'generation number of the current cycle of the generation clock (integer)'
    });

    // unlink is not necessary.
    assert && this.clockGenerationProperty.lazyLink((currentClockGeneration, previousClockGeneration) => {
      // Skip this when restoring PhET-iO state, because the initial state might be restored to any generation.
      if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
        assert && assert(currentClockGeneration === 0 || currentClockGeneration === previousClockGeneration + 1, `skipped a generation, currentClockGeneration=${currentClockGeneration}, previousClockGeneration=${previousClockGeneration}`);
      }
    });
  }
  reset() {
    this.isRunningProperty.reset();
    this.timeInSecondsProperty.reset();
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }

  /**
   * @param dt - the time step, in seconds
   */
  step(dt) {
    assert && assert(dt < SECONDS_PER_GENERATION, `dt=${dt} exceeded secondsPerGeneration=${SECONDS_PER_GENERATION}`);
    if (this.isRunningProperty.value) {
      this.stepTime(dt);
    }
  }

  /**
   * Sets timeInSecondsProperty, the time (in seconds) that the generation clock has been running, in seconds.
   * As time passes through the 12:00 position, it will always snap to the 12:00 position, which is when bunnies
   * die of old age and mate.
   * @param dt - the time step, in seconds
   */
  stepTime(dt) {
    const nextTime = this.timeInSecondsProperty.value + dt;
    const nextGeneration = Math.floor(secondsToGenerations(nextTime)); // integer

    if (nextGeneration > this.clockGenerationProperty.value) {
      // snap to 12:00
      this.timeInSecondsProperty.value = nextGeneration * SECONDS_PER_GENERATION;
    } else {
      this.timeInSecondsProperty.value = nextTime;
    }
  }

  /**
   * Constrains dt to a maximum value, which results in a minimum number of steps per generation. This prevents us
   * from skipping over important transitions (like applying environmental factors) or even entire generations.
   * It's possible to run the clock ridiculously fast using ?secondsPerGeneration, especially if combined with the
   * fast-forward button. Running the clock fast became as habit of testers, and this constraint protects us from
   * that type of 'run it fast' abuse. See https://github.com/phetsims/natural-selection/issues/165.
   * @param dt - time step, in seconds
   */
  static constrainDt(dt) {
    return Math.min(dt, MAX_DT);
  }
}

/**
 * Converts time from seconds to generations.
 * @param seconds - time, in seconds
 * @returns time, in decimal number of generations
 */
function secondsToGenerations(seconds) {
  let generations = 0;
  if (seconds > 0) {
    generations = seconds / SECONDS_PER_GENERATION;

    // If generations is not an integer, add a small value here to compensate for floating-point error in division.
    // This ensures that we move forward and don't get stuck at certain generation values.
    // For example 8.6 seconds / 0.2 secondsPerGeneration should be 43 generations, but JavaScript evaluates
    // to 42.99999999999999. See https://github.com/phetsims/natural-selection/issues/165 and
    // https://github.com/phetsims/natural-selection/issues/230.
    if (generations % 1 !== 0) {
      generations += 0.0001;
    }
  }
  return generations;
}
naturalSelection.register('GenerationClock', GenerationClock);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsIk51bWJlcklPIiwibmF0dXJhbFNlbGVjdGlvbiIsIk5hdHVyYWxTZWxlY3Rpb25RdWVyeVBhcmFtZXRlcnMiLCJOYXR1cmFsU2VsZWN0aW9uVXRpbHMiLCJTRUNPTkRTX1BFUl9HRU5FUkFUSU9OIiwic2Vjb25kc1BlckdlbmVyYXRpb24iLCJNSU5fU1RFUFNfUEVSX0dFTkVSQVRJT04iLCJNQVhfRFQiLCJHZW5lcmF0aW9uQ2xvY2siLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJwaGV0aW9TdGF0ZSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJpc1J1bm5pbmdQcm9wZXJ0eSIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1JlYWRPbmx5IiwidGltZUluU2Vjb25kc1Byb3BlcnR5IiwiaXNWYWxpZFZhbHVlIiwidGltZSIsInBoZXRpb0hpZ2hGcmVxdWVuY3kiLCJ0aW1lSW5QZXJjZW50UHJvcGVydHkiLCJ0aW1lSW5TZWNvbmRzIiwidGltZUluUGVyY2VudCIsIk9QVF9PVVQiLCJ0aW1lSW5HZW5lcmF0aW9uc1Byb3BlcnR5Iiwic2Vjb25kc1RvR2VuZXJhdGlvbnMiLCJwaGV0aW9WYWx1ZVR5cGUiLCJjbG9ja0dlbmVyYXRpb25Qcm9wZXJ0eSIsInRpbWVJbkdlbmVyYXRpb25zIiwiTWF0aCIsImZsb29yIiwiY2xvY2tHZW5lcmF0aW9uIiwiaXNOb25OZWdhdGl2ZUludGVnZXIiLCJhc3NlcnQiLCJsYXp5TGluayIsImN1cnJlbnRDbG9ja0dlbmVyYXRpb24iLCJwcmV2aW91c0Nsb2NrR2VuZXJhdGlvbiIsInBoZXQiLCJqb2lzdCIsInNpbSIsImlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkiLCJ2YWx1ZSIsInJlc2V0IiwiZGlzcG9zZSIsInN0ZXAiLCJkdCIsInN0ZXBUaW1lIiwibmV4dFRpbWUiLCJuZXh0R2VuZXJhdGlvbiIsImNvbnN0cmFpbkR0IiwibWluIiwic2Vjb25kcyIsImdlbmVyYXRpb25zIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHZW5lcmF0aW9uQ2xvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR2VuZXJhdGlvbkNsb2NrIGlzIHRoZSBjbG9jayB0aGF0IGNvbXBsZXRlcyBvbmUgZnVsbCBjeWNsZSBwZXIgZ2VuZXJhdGlvbi4gIEluIHRoZSB1c2VyLWludGVyZmFjZSwgdGltZSBpc1xyXG4gKiBwcmVzZW50ZWQgaW4gdGVybXMgb2YgJ2dlbmVyYXRpb25zJy4gVmFyaW91cyBldmVudHMgYXJlIGRlc2NyaWJlZCBhcyB0aW1lcyByZWxhdGl2ZSB0byB0aGUgXCJ3YWxsIGNsb2NrXCIgdGltZVxyXG4gKiBvbiB0aGUgZ2VuZXJhdGlvbiBjbG9jay4gRm9yIGV4YW1wbGUsIFwiYnVubmllcyByZXByb2R1Y2UgYXQgMTI6MDBcIiwgb3IgXCJ3b2x2ZXMgZWF0IGF0IDQ6MDBcIi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0LCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBuYXR1cmFsU2VsZWN0aW9uIGZyb20gJy4uLy4uL25hdHVyYWxTZWxlY3Rpb24uanMnO1xyXG5pbXBvcnQgTmF0dXJhbFNlbGVjdGlvblF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9OYXR1cmFsU2VsZWN0aW9uUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IE5hdHVyYWxTZWxlY3Rpb25VdGlscyBmcm9tICcuLi9OYXR1cmFsU2VsZWN0aW9uVXRpbHMuanMnO1xyXG5cclxuLy8gY29uc3RcclxuY29uc3QgU0VDT05EU19QRVJfR0VORVJBVElPTiA9IE5hdHVyYWxTZWxlY3Rpb25RdWVyeVBhcmFtZXRlcnMuc2Vjb25kc1BlckdlbmVyYXRpb247XHJcbmNvbnN0IE1JTl9TVEVQU19QRVJfR0VORVJBVElPTiA9IDEwO1xyXG5jb25zdCBNQVhfRFQgPSBTRUNPTkRTX1BFUl9HRU5FUkFUSU9OIC8gTUlOX1NURVBTX1BFUl9HRU5FUkFUSU9OO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIEdlbmVyYXRpb25DbG9ja09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxQaGV0aW9PYmplY3RPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHZW5lcmF0aW9uQ2xvY2sgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgaXNSdW5uaW5nUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdGltZUluU2Vjb25kc1Byb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+O1xyXG4gIHB1YmxpYyByZWFkb25seSB0aW1lSW5QZXJjZW50UHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj47XHJcbiAgcHVibGljIHJlYWRvbmx5IHRpbWVJbkdlbmVyYXRpb25zUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj47XHJcbiAgcHVibGljIHJlYWRvbmx5IGNsb2NrR2VuZXJhdGlvblByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogR2VuZXJhdGlvbkNsb2NrT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEdlbmVyYXRpb25DbG9ja09wdGlvbnMsIFNlbGZPcHRpb25zLCBQaGV0aW9PYmplY3RPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBQaGV0aW9PYmplY3RPcHRpb25zXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZSwgLy8gdG8gcHJldmVudCBzZXJpYWxpemF0aW9uLCBiZWNhdXNlIHdlIGRvbid0IGhhdmUgYW4gSU8gVHlwZVxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGhlIGNsb2NrIHRoYXQgbWFya3MgdGhlIGR1cmF0aW9uIG9mIGEgZ2VuZXJhdGlvbidcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5pc1J1bm5pbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaXNSdW5uaW5nUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnd2hldGhlciB0aGUgZ2VuZXJhdGlvbiBjbG9jayBpcyBydW5uaW5nJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudGltZUluU2Vjb25kc1Byb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIGlzVmFsaWRWYWx1ZTogdGltZSA9PiAoIHRpbWUgPj0gMCApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpbWVJblNlY29uZHNQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aW1lIHRoYXQgdGhlIGdlbmVyYXRpb24gY2xvY2sgaGFzIGJlZW4gcnVubmluZywgaW4gc2Vjb25kcyAoZGVjaW1hbCknLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUGVyY2VudCBvZiB0aGUgY3VycmVudCBjbG9jayBjeWNsZSB0aGF0IGhhcyBiZWVuIGNvbXBsZXRlZC5cclxuICAgIHRoaXMudGltZUluUGVyY2VudFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB0aGlzLnRpbWVJblNlY29uZHNQcm9wZXJ0eSBdLFxyXG4gICAgICB0aW1lSW5TZWNvbmRzID0+ICggdGltZUluU2Vjb25kcyAlIFNFQ09ORFNfUEVSX0dFTkVSQVRJT04gKSAvIFNFQ09ORFNfUEVSX0dFTkVSQVRJT04sIHtcclxuICAgICAgICBpc1ZhbGlkVmFsdWU6IHRpbWVJblBlcmNlbnQgPT4gKCB0aW1lSW5QZXJjZW50ID49IDAgJiYgdGltZUluUGVyY2VudCA8PSAxICksXHJcbiAgICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy50aW1lSW5HZW5lcmF0aW9uc1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB0aGlzLnRpbWVJblNlY29uZHNQcm9wZXJ0eSBdLFxyXG4gICAgICB0aW1lSW5TZWNvbmRzID0+IHNlY29uZHNUb0dlbmVyYXRpb25zKCB0aW1lSW5TZWNvbmRzICksIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpbWVJbkdlbmVyYXRpb25zUHJvcGVydHknICksXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdW1iZXJJTyxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGltZSB0aGF0IHRoZSBnZW5lcmF0aW9uIGNsb2NrIGhhcyBiZWVuIHJ1bm5pbmcsIGluIGdlbmVyYXRpb25zIChkZWNpbWFsKScsXHJcbiAgICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gTmFtZWQgY2xvY2tHZW5lcmF0aW9uUHJvcGVydHkgdG8gZGlzdGluZ3Vpc2ggaXQgZnJvbSB0aGUgb3RoZXIgJ2dlbmVyYXRpb24nIFByb3BlcnRpZXMgaW4gdGhpcyBzaW0uXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25hdHVyYWwtc2VsZWN0aW9uL2lzc3Vlcy8xODdcclxuICAgIHRoaXMuY2xvY2tHZW5lcmF0aW9uUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHRoaXMudGltZUluR2VuZXJhdGlvbnNQcm9wZXJ0eSBdLFxyXG4gICAgICB0aW1lSW5HZW5lcmF0aW9ucyA9PiBNYXRoLmZsb29yKCB0aW1lSW5HZW5lcmF0aW9ucyApLCB7XHJcbiAgICAgICAgaXNWYWxpZFZhbHVlOiBjbG9ja0dlbmVyYXRpb24gPT4gTmF0dXJhbFNlbGVjdGlvblV0aWxzLmlzTm9uTmVnYXRpdmVJbnRlZ2VyKCBjbG9ja0dlbmVyYXRpb24gKSxcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Nsb2NrR2VuZXJhdGlvblByb3BlcnR5JyApLFxyXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTnVtYmVySU8sXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2dlbmVyYXRpb24gbnVtYmVyIG9mIHRoZSBjdXJyZW50IGN5Y2xlIG9mIHRoZSBnZW5lcmF0aW9uIGNsb2NrIChpbnRlZ2VyKSdcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyB1bmxpbmsgaXMgbm90IG5lY2Vzc2FyeS5cclxuICAgIGFzc2VydCAmJiB0aGlzLmNsb2NrR2VuZXJhdGlvblByb3BlcnR5LmxhenlMaW5rKCAoIGN1cnJlbnRDbG9ja0dlbmVyYXRpb24sIHByZXZpb3VzQ2xvY2tHZW5lcmF0aW9uICkgPT4ge1xyXG5cclxuICAgICAgLy8gU2tpcCB0aGlzIHdoZW4gcmVzdG9yaW5nIFBoRVQtaU8gc3RhdGUsIGJlY2F1c2UgdGhlIGluaXRpYWwgc3RhdGUgbWlnaHQgYmUgcmVzdG9yZWQgdG8gYW55IGdlbmVyYXRpb24uXHJcbiAgICAgIGlmICggIXBoZXQuam9pc3Quc2ltLmlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggY3VycmVudENsb2NrR2VuZXJhdGlvbiA9PT0gMCB8fCBjdXJyZW50Q2xvY2tHZW5lcmF0aW9uID09PSBwcmV2aW91c0Nsb2NrR2VuZXJhdGlvbiArIDEsXHJcbiAgICAgICAgICBgc2tpcHBlZCBhIGdlbmVyYXRpb24sIGN1cnJlbnRDbG9ja0dlbmVyYXRpb249JHtjdXJyZW50Q2xvY2tHZW5lcmF0aW9ufSwgcHJldmlvdXNDbG9ja0dlbmVyYXRpb249JHtwcmV2aW91c0Nsb2NrR2VuZXJhdGlvbn1gICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuaXNSdW5uaW5nUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudGltZUluU2Vjb25kc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGR0IC0gdGhlIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZHQgPCBTRUNPTkRTX1BFUl9HRU5FUkFUSU9OLFxyXG4gICAgICBgZHQ9JHtkdH0gZXhjZWVkZWQgc2Vjb25kc1BlckdlbmVyYXRpb249JHtTRUNPTkRTX1BFUl9HRU5FUkFUSU9OfWAgKTtcclxuICAgIGlmICggdGhpcy5pc1J1bm5pbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgdGhpcy5zdGVwVGltZSggZHQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGltZUluU2Vjb25kc1Byb3BlcnR5LCB0aGUgdGltZSAoaW4gc2Vjb25kcykgdGhhdCB0aGUgZ2VuZXJhdGlvbiBjbG9jayBoYXMgYmVlbiBydW5uaW5nLCBpbiBzZWNvbmRzLlxyXG4gICAqIEFzIHRpbWUgcGFzc2VzIHRocm91Z2ggdGhlIDEyOjAwIHBvc2l0aW9uLCBpdCB3aWxsIGFsd2F5cyBzbmFwIHRvIHRoZSAxMjowMCBwb3NpdGlvbiwgd2hpY2ggaXMgd2hlbiBidW5uaWVzXHJcbiAgICogZGllIG9mIG9sZCBhZ2UgYW5kIG1hdGUuXHJcbiAgICogQHBhcmFtIGR0IC0gdGhlIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RlcFRpbWUoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3QgbmV4dFRpbWUgPSB0aGlzLnRpbWVJblNlY29uZHNQcm9wZXJ0eS52YWx1ZSArIGR0O1xyXG4gICAgY29uc3QgbmV4dEdlbmVyYXRpb24gPSBNYXRoLmZsb29yKCBzZWNvbmRzVG9HZW5lcmF0aW9ucyggbmV4dFRpbWUgKSApOyAvLyBpbnRlZ2VyXHJcblxyXG4gICAgaWYgKCBuZXh0R2VuZXJhdGlvbiA+IHRoaXMuY2xvY2tHZW5lcmF0aW9uUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIC8vIHNuYXAgdG8gMTI6MDBcclxuICAgICAgdGhpcy50aW1lSW5TZWNvbmRzUHJvcGVydHkudmFsdWUgPSBuZXh0R2VuZXJhdGlvbiAqIFNFQ09ORFNfUEVSX0dFTkVSQVRJT047XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy50aW1lSW5TZWNvbmRzUHJvcGVydHkudmFsdWUgPSBuZXh0VGltZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cmFpbnMgZHQgdG8gYSBtYXhpbXVtIHZhbHVlLCB3aGljaCByZXN1bHRzIGluIGEgbWluaW11bSBudW1iZXIgb2Ygc3RlcHMgcGVyIGdlbmVyYXRpb24uIFRoaXMgcHJldmVudHMgdXNcclxuICAgKiBmcm9tIHNraXBwaW5nIG92ZXIgaW1wb3J0YW50IHRyYW5zaXRpb25zIChsaWtlIGFwcGx5aW5nIGVudmlyb25tZW50YWwgZmFjdG9ycykgb3IgZXZlbiBlbnRpcmUgZ2VuZXJhdGlvbnMuXHJcbiAgICogSXQncyBwb3NzaWJsZSB0byBydW4gdGhlIGNsb2NrIHJpZGljdWxvdXNseSBmYXN0IHVzaW5nID9zZWNvbmRzUGVyR2VuZXJhdGlvbiwgZXNwZWNpYWxseSBpZiBjb21iaW5lZCB3aXRoIHRoZVxyXG4gICAqIGZhc3QtZm9yd2FyZCBidXR0b24uIFJ1bm5pbmcgdGhlIGNsb2NrIGZhc3QgYmVjYW1lIGFzIGhhYml0IG9mIHRlc3RlcnMsIGFuZCB0aGlzIGNvbnN0cmFpbnQgcHJvdGVjdHMgdXMgZnJvbVxyXG4gICAqIHRoYXQgdHlwZSBvZiAncnVuIGl0IGZhc3QnIGFidXNlLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25hdHVyYWwtc2VsZWN0aW9uL2lzc3Vlcy8xNjUuXHJcbiAgICogQHBhcmFtIGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjb25zdHJhaW5EdCggZHQ6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIE1hdGgubWluKCBkdCwgTUFYX0RUICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ29udmVydHMgdGltZSBmcm9tIHNlY29uZHMgdG8gZ2VuZXJhdGlvbnMuXHJcbiAqIEBwYXJhbSBzZWNvbmRzIC0gdGltZSwgaW4gc2Vjb25kc1xyXG4gKiBAcmV0dXJucyB0aW1lLCBpbiBkZWNpbWFsIG51bWJlciBvZiBnZW5lcmF0aW9uc1xyXG4gKi9cclxuZnVuY3Rpb24gc2Vjb25kc1RvR2VuZXJhdGlvbnMoIHNlY29uZHM6IG51bWJlciApOiBudW1iZXIge1xyXG4gIGxldCBnZW5lcmF0aW9ucyA9IDA7XHJcbiAgaWYgKCBzZWNvbmRzID4gMCApIHtcclxuXHJcbiAgICBnZW5lcmF0aW9ucyA9ICggc2Vjb25kcyAvIFNFQ09ORFNfUEVSX0dFTkVSQVRJT04gKTtcclxuXHJcbiAgICAvLyBJZiBnZW5lcmF0aW9ucyBpcyBub3QgYW4gaW50ZWdlciwgYWRkIGEgc21hbGwgdmFsdWUgaGVyZSB0byBjb21wZW5zYXRlIGZvciBmbG9hdGluZy1wb2ludCBlcnJvciBpbiBkaXZpc2lvbi5cclxuICAgIC8vIFRoaXMgZW5zdXJlcyB0aGF0IHdlIG1vdmUgZm9yd2FyZCBhbmQgZG9uJ3QgZ2V0IHN0dWNrIGF0IGNlcnRhaW4gZ2VuZXJhdGlvbiB2YWx1ZXMuXHJcbiAgICAvLyBGb3IgZXhhbXBsZSA4LjYgc2Vjb25kcyAvIDAuMiBzZWNvbmRzUGVyR2VuZXJhdGlvbiBzaG91bGQgYmUgNDMgZ2VuZXJhdGlvbnMsIGJ1dCBKYXZhU2NyaXB0IGV2YWx1YXRlc1xyXG4gICAgLy8gdG8gNDIuOTk5OTk5OTk5OTk5OTkuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzE2NSBhbmRcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9uYXR1cmFsLXNlbGVjdGlvbi9pc3N1ZXMvMjMwLlxyXG4gICAgaWYgKCBnZW5lcmF0aW9ucyAlIDEgIT09IDAgKSB7XHJcbiAgICAgIGdlbmVyYXRpb25zICs9IDAuMDAwMTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGdlbmVyYXRpb25zO1xyXG59XHJcblxyXG5uYXR1cmFsU2VsZWN0aW9uLnJlZ2lzdGVyKCAnR2VuZXJhdGlvbkNsb2NrJywgR2VuZXJhdGlvbkNsb2NrICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUdsRSxPQUFPQyxTQUFTLE1BQTRCLHVDQUF1QztBQUVuRixPQUFPQyxZQUFZLE1BQStCLHVDQUF1QztBQUN6RixPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FB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