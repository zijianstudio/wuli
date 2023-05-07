// Copyright 2020-2022, University of Colorado Boulder

/**
 * A class that controls vibrations when running the sim in a native iOS App. It sends messages form the simulation
 * WebView to its containing native swift application. This is the only way to request vibration on that platform
 * since Web vibration is not supported in Safari.
 *
 * This is a prototype, and this strategy has since been abandoned. We have since moved on to explore vibration
 * in Android devices, where tablets have vibration support. There we can use the web vibration API and also
 * use native android vibration for more sophisticated things like vibration intensity.
 */

import Utils from '../../dot/js/Utils.js';
import optionize, { EmptySelfOptions } from '../../phet-core/js/optionize.js';
import IntentionalAny from '../../phet-core/js/types/IntentionalAny.js';
import tappi from './tappi.js';

/**
 * @deprecated - This strategy is being abandoned for an android specific solution.
 */
class VibrationManageriOS {

  // Message handlers for the Webkit window, only available in Safari.
  // The actual type for the values of the Record are WKScriptMessageHandler, see
  // https://developer.apple.com/documentation/webkit/wkscriptmessagehandler. But that type is only available
  // on iOS Safari and so WKScriptMessageHandler is not a known type. This is prototype code that will probably
  // never see the light of day, so I (JG) is deciding not to re-implement the interface.
  private readonly vibrationMessageHandlers: Record<string, IntentionalAny>;

  public constructor() {

    // @ts-expect-error - Only available in Safari environments. Further typing not necessary for prototype code.
    if ( window.webkit ) {

      // @ts-expect-error - Only available in Safari environments. Further typing not necessary for prototype code.
      this.vibrationMessageHandlers = window.webkit.messageHandlers;
    }
    else {

      // TODO: Put something reasonable here.
      throw new Error( 'not on this device!' );
    }
  }

  /**
   * Start a timed vibration for the provided time in seconds.
   */
  public vibrate( seconds: number ): void {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateMessageHandler ) {
      this.vibrationMessageHandlers.vibrateMessageHandler.postMessage( { duration: seconds } );
    }
  }

  /**
   * Start a vibration that will continue forever.
   */
  public vibrateForever(): void {

    if ( this.vibrationMessageHandlers &&
         this.vibrationMessageHandlers.vibrateForeverMessageHandler ) {

      this.vibrationMessageHandlers.vibrateForeverMessageHandler.postMessage( {} );
    }
  }

  /**
   * Request a continuous vibration with provided parameters. This should replace all other functions in the future.
   */
  public vibrateContinuous( providedOptions?: VibrateOptions ): void {
    const options = optionize<VibrateOptions>()( {

      // {number[]} - a pattern for the vibration, alternating values in seconds where even indices are time when the
      // vibration is "on" and odd indices have the motor off. The pattern will repeat for options.duration or forever
      // if that option is null.
      pattern: [],

      // {number}
      sharpness: 1,

      // {number}
      intensity: 1,

      // TODO: add support for frequency
      frequency: null,

      // {number|null} - duration indicates that this vibration will proceed forever
      duration: null
    }, providedOptions );

    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateContinuousMessageHandler ) {
      this.vibrationMessageHandlers.vibrateContinuousMessageHandler.postMessage(
        {
          pattern: options.pattern,
          sharpness: options.sharpness,
          duration: options.duration,
          intensity: options.intensity,
          frequency: options.frequency
        }
      );
    }
  }


  /**
   * Request a transient vibration. A transient vibration is a single pulse at a particular time without any duration.
   * It is used typically for basic UI components to indicate successful activation or change. Use vibrateContinuous for
   * longer and more complicated vibrations.
   */
  public vibrateTransient( providedOptions?: VibrateOptions ): void {
    const options = optionize<VibrateOptions, EmptySelfOptions>()( {
      sharpness: 1,
      intensity: 1
    }, providedOptions );

    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateTransientMessageHandler ) {
      this.vibrationMessageHandlers.vibrateTransientMessageHandler.postMessage(
        {
          sharpness: options.sharpness,
          intensity: options.intensity
        }
      );
    }
  }

  /**
   * Start a vibration for the provided duration, with a provided frequency.
   */
  public vibrateAtFrequency( seconds: number, frequency: number ): void {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateFrequencyMessageHandler ) {
      this.vibrationMessageHandlers.vibrateFrequencyMessageHandler.postMessage(
        { duration: seconds, frequency: frequency }
      );
    }
  }

  /**
   * Vibrate at the desired frequency.
   * @param frequency
   * @param [intensity] - from 0 to 1
   */
  public vibrateAtFrequencyForever( frequency: number, intensity?: number ): void {
    intensity = typeof intensity === 'number' ? intensity : 1;
    intensity = Utils.clamp( intensity, 0, 1 );
    this.debug( `${intensity}` );

    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateFrequencyForeverMessageHandler ) {
      this.vibrationMessageHandlers.messageHandlers.vibrateFrequencyForeverMessageHandler.postMessage(
        { frequency: frequency, intensity: intensity }
      );
    }
  }

  /**
   * Request a vibration with a custom pattern that loops forever.
   * @param vibrationPattern - alternating values where even indexes are "on" time, odd indices are "off"
   * @param seconds - time in seconds, how long to run the vibration
   * @param loopForever - should this loop forever?
   */
  public vibrateWithCustomPattern( vibrationPattern: number[], seconds: number, loopForever: boolean ): void {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateWithCustomPatternMessageHandler ) {
      this.vibrationMessageHandlers.vibrateWithCustomPatternMessageHandler.postMessage( {
        vibrationPattern: vibrationPattern,
        duration: seconds,
        loopForever: loopForever
      } );
    }
  }

  /**
   * Vibrate with a custom pattern for the provided duration.
   * @param vibrationPattern - alternative values where even indexes are "on" time and odd indexes are "off"
   * @param seconds
   */
  public vibrateWithCustomPatternDuration( vibrationPattern: number[], seconds: number ): void {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateWithCustomPatternDurationMessageHandler ) {
      this.vibrationMessageHandlers.vibrateWithCustomPatternDurationMessageHandler.postMessage( {
        vibrationPattern: vibrationPattern,
        duration: seconds
      } );
    }
  }

  /**
   * Vibrate with a custom pattern forever.
   * @param vibrationPattern - alternating values of "on" and "off" time in seconds, starting with "on" time.
   */
  public vibrateWithCustomPatternForever( vibrationPattern: number[] ): void {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateWithCustomPatternForeverMessageHandler ) {
      this.vibrationMessageHandlers.vibrateWithCustomPatternForeverMessageHandler.postMessage(
        { vibrationPattern: vibrationPattern }
      );
    }
  }

  /**
   * Sets the intensity of the current vibration. No effect if there is no active vibration.
   * @param intensity - from 0 to 1
   */
  public setVibrationIntensity( intensity: number ): void {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrationIntensityMessageHandler ) {
      this.vibrationMessageHandlers.vibrationIntensityMessageHandler.postMessage( { intensity: intensity } );
    }
  }

  /**
   * Sets the sharpness for the current vibration. No effect if there is no active vibration.
   * @param sharpness - from 0 to 1
   */
  public setVibrationSharpness( sharpness: number ): void {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrationSharpnessMessageHandler ) {
      this.vibrationMessageHandlers.vibrationSharpnessMessageHandler.postMessage( { sharpness: sharpness } );
    }
  }

  /**
   * Stop any active vibration immediately.
   */
  public stop(): void {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.stopMessageHandler ) {
      this.vibrationMessageHandlers.stopMessageHandler.postMessage(
        {}
      );
    }
  }

  /**
   * Saves the provided data string to the containing Swift app. Data string is generated by VibrationTestEventRecorder.
   * @param dataString - the string to save
   */
  public saveTestEvents( dataString: string ): void {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.saveDataMessageHandler ) {
      this.vibrationMessageHandlers.saveDataMessageHandler.postMessage( {
        dataString: dataString
      } );
    }
  }

  /**
   * Send a debug message to the containing app that will be printed in the debugging tools.
   */
  public debug( debugString: string ): void {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.debugMessageHandler ) {
      this.vibrationMessageHandlers.debugMessageHandler.postMessage( {
        debugString: debugString
      } );
    }
  }
}

export type VibrateOptions = {

  // A pattern for the vibration, alternating values in seconds where even indices are time when the motor is "on" and
  // odd indices have the motor off. The pattern will repeat for options.duration or forever if that option is null
  pattern?: number[];

  sharpness?: number;
  intensity?: number;

  // TODO: add support for frequency
  frequency?: number | null;

  // duration indicates that this vibration will proceed forever
  duration?: number | null;
};

tappi.register( 'VibrationManageriOS', VibrationManageriOS );
export default VibrationManageriOS;