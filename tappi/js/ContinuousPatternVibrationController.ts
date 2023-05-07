// Copyright 2020-2023, University of Colorado Boulder

/**
 * Controls and supports continuous vibration patterns and smooth transition from pattern to pattern.
 * Instead of requesting a new vibration pattern immediately, this controller waits until
 * the end of an "active" vibration pattern. The result is that the user cannot feel the change in
 * pattern as we smoothly transition, which is what would happen if we requested a new pattern
 * while in the middle of an 'on' phase of the current pattern.
 *
 * And so this class as both an "active" pattern, which is currently running and a "pending" pattern,
 * which will become the "active" pattern as soon as the previous "active" pattern finishes.
 *
 * NOTE: Instead of waiting until the end of a pattern to request a new one, it may be useful
 * to request a new pattern at the end of an 'off' portion of the current pattern. May be
 * important for long patterns where we want to transition to new pattern quickly but don't want to
 * wait until the old one finishes.
 *
 * @author Jesse Greenberg
 */

import optionize from '../../phet-core/js/optionize.js';
import tappi from './tappi.js';
import VibrationManageriOS from './VibrationManageriOS.js';

export type ContinuousPatternVibrationControllerOptions = {

  // Should the active pattern loop?
  repeat?: boolean;

  sharpness?: 1;
  intensity?: 1;

  // Initial pattern for the vibration controller, a sequence of on/off intervals in seconds - won't start vibrating
  // until calling start().
  activePattern?: number[];
};

class ContinuousPatternVibrationController {

  private activePattern: number[];
  private repeat: boolean;
  private intensity: number;
  private sharpness: number;

  // sends requests to the iOS app to begin/stop vibration
  private readonly vibrationManageriOS: VibrationManageriOS;

  // current index of the active vibration pattern
  private patternIndex = 0;

  // current interval value of the active vibration pattern
  private patternValue = 0;

  // current interval value of the active vibration pattern, in seconds
  private valueTime = 0;

  // whether we are currently running the vibration pattern
  private runningPattern = false;

  // the pattern that we are going to transition to at the end of the currently active pattern
  private pendingPattern: number[];

  public constructor( vibrationManageriOS: VibrationManageriOS, providedOptions: ContinuousPatternVibrationControllerOptions ) {

    const options = optionize<ContinuousPatternVibrationControllerOptions>()( {
      repeat: true,
      sharpness: 1,
      intensity: 1,
      activePattern: []
    }, providedOptions );

    this.vibrationManageriOS = vibrationManageriOS;
    this.activePattern = options.activePattern;
    this.repeat = options.repeat;
    this.intensity = options.intensity;
    this.sharpness = options.sharpness;
    this.pendingPattern = this.activePattern;
  }

  /**
   * Step forward in time, updates patterns.
   */
  public step( dt: number ): void {
    if ( this.runningPattern ) {
      this.valueTime += dt;

      if ( this.valueTime >= this.patternValue ) {
        this.valueTime = 0;
        this.patternIndex++;

        if ( this.patternIndex < this.activePattern.length ) {
          this.patternValue = this.activePattern[ this.patternIndex ];

          if ( this.patternIndex % 2 === 0 ) {

            // even index, indicating 'on' time for vibration
            this.vibrationManageriOS.vibrateContinuous( {
              intensity: this.intensity,
              sharpness: this.sharpness
            } );
          }
          else {

            // odd index, indicating 'off' time for vibration
            this.vibrationManageriOS.stop();
          }
        }
        else if ( this.repeat ) {

          // before looping the pattern, check to see if the pattern has changed
          if ( !_.isEqual( this.pendingPattern, this.activePattern ) ) {
            this.setNewActivePattern( this.pendingPattern );
          }

          // restart the pattern, and start again from the beginning
          this.start();
        }
        else {

          // not looping, stop vibration at end of pattern
          this.stop();
        }
      }
    }
  }

  /**
   * Transition from the previous pattern to the next pattern, which will start to play when start() is called.
   */
  public setNewActivePattern( pattern: number[] ): void {
    assert && assert( pattern.length > 0, 'pattern must have some length' );
    this.activePattern = pattern;

    // reset variables tracking where we are running the pattern, we will start over when we set a new active pattern
    this.resetPattern();
  }

  /**
   * Set the new pattern for the controller. If we are running, this will be the pending pattern
   * which we will request at the end of the current pattern to avoid stutter during rapid changes.
   * If a pattern is not running, this will be set as the active pattern right away, and can begin
   * ass soon as start() is called.
   */
  public setPattern( pattern: number[] ): void {
    assert && assert( pattern.length > 0, 'pattern must have some values' );
    this.pendingPattern = pattern;

    if ( !this.runningPattern ) {
      this.setNewActivePattern( this.pendingPattern );
    }
  }

  /**
   * Set the intensity for the vibration pattern, for both the active and pending patterns.
   */
  public setIntensity( intensity: number ): void {
    this.intensity = intensity;
  }

  /**
   * Set the sharpness for the vibration pattern, for both the active and pending patterns.
   */
  public setSharpness( sharpness: number ): void {
    this.sharpness = sharpness;
  }

  /**
   * Set whether or not the active pattern will repeat.
   */
  public setRepeat( repeat: boolean ): void {
    this.repeat = repeat;
  }

  /**
   * Start vibrating with the active pattern. Calling this will reset where we are in the active vibration pattern.
   */
  public start(): void {

    this.runningPattern = true;
    this.resetPattern();

    this.vibrationManageriOS.vibrateContinuous( {
      intensity: this.intensity,
      sharpness: this.sharpness
    } );
  }

  /**
   * Stop all vibration and play of the active pattern if we are running.
   */
  public stop(): void {
    if ( this.runningPattern ) {
      this.vibrationManageriOS.stop();
      this.runningPattern = false;
      this.resetPattern();
    }
  }

  /**
   * Reset the active pattern, and where we are in its playthrough.
   */
  public resetPattern(): void {
    this.patternIndex = 0;
    this.patternValue = this.activePattern[ this.patternIndex ];
    this.valueTime = 0;
  }
}

tappi.register( 'ContinuousPatternVibrationController', ContinuousPatternVibrationController );
export default ContinuousPatternVibrationController;