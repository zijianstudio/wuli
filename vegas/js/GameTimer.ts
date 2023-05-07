// Copyright 2013-2022, University of Colorado Boulder

/**
 * Game timer, keeps track of the elapsed time in the game using "wall clock" time. The frame rate of this clock is
 * sufficient for displaying a game timer in "seconds", but not for driving smooth animation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import Property from '../../axon/js/Property.js';
import stepTimer from '../../axon/js/stepTimer.js';
import { TimerListener } from '../../axon/js/Timer.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import vegas from './vegas.js';
import VegasStrings from './VegasStrings.js';

export default class GameTimer {

  // whether the timer is running
  public readonly isRunningProperty: Property<boolean>;

  // seconds since the timer was started
  public readonly elapsedTimeProperty: Property<number>;

  // see Timer.setInterval and clearInterval
  private intervalId: TimerListener | null;

  public constructor() {
    this.isRunningProperty = new BooleanProperty( false );
    this.elapsedTimeProperty = new NumberProperty( 0 );
    this.intervalId = null;
  }

  public reset(): void {
    this.isRunningProperty.reset();
    this.elapsedTimeProperty.reset();
  }

  /**
   * Starts the timer. This is a no-op if the timer is already running.
   */
  public start(): void {
    if ( !this.isRunningProperty.value ) {
      this.elapsedTimeProperty.value = 0;
      this.intervalId = stepTimer.setInterval( () => {
        this.elapsedTimeProperty.value = this.elapsedTimeProperty.value + 1;
      }, 1000 ); // fire once per second
      this.isRunningProperty.value = true;
    }
  }

  /**
   * Stops the timer. This is a no-op if the timer is already stopped.
   */
  public stop(): void {
    if ( this.isRunningProperty.value ) {
      stepTimer.clearInterval( this.intervalId! );
      this.intervalId = null;
      this.isRunningProperty.value = false;
    }
  }

  /**
   * Convenience function for restarting the timer.
   */
  public restart(): void {
    this.stop();
    this.start();
  }

  /**
   * Formats a value representing seconds into H:MM:SS (localized).
   */
  public static formatTime( time: number ): string {

    const hours = Math.floor( time / 3600 );
    const minutes = Math.floor( ( time - ( hours * 3600 ) ) / 60 );
    const seconds = Math.floor( time - ( hours * 3600 ) - ( minutes * 60 ) );

    const minutesString = ( minutes > 9 || hours === 0 ) ? minutes : ( `0${minutes}` );
    const secondsString = ( seconds > 9 ) ? seconds : ( `0${seconds}` );

    if ( hours > 0 ) {
      return StringUtils.format( VegasStrings.pattern[ '0hours' ][ '1minutes' ][ '2secondsStringProperty' ].value,
        hours, minutesString, secondsString );
    }
    else {
      return StringUtils.format( VegasStrings.pattern[ '0minutes' ][ '1secondsStringProperty' ].value,
        minutesString, secondsString );
    }
  }
}

vegas.register( 'GameTimer', GameTimer );