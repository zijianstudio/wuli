// Copyright 2020-2021, University of Colorado Boulder

/**
 * A collection of VibrationTestEvents. Has functions that prepare the data to be sent to
 * a containing Swift app (as is used in the Vibration project) - so that the data
 * can be saved to the device or sent back to the team for further testing.
 *
 * @author Jesse Greenberg
 */

import tappi from '../tappi.js';

class VibrationTestEventRecorder {

  /**
   * @param {VibrationManageriOS} vibrationManager - sends messages to the containing iOS app
   */
  constructor( vibrationManager ) {

    // @private - collection of VibrationTestEvents, with information about
    // user input
    this.events = [];

    // the containing iOS app will send a message to the window when it
    // wants to get the user's input events - when we receive this message
    // collect recorded data as a string and send it back to the iOS app
    window.addEventListener( 'message', event => {
      if ( typeof event.data !== 'string' ) {
        return;
      }

      if ( event.data === 'requestVibrationData' ) {
        const dataString = this.dataToString();
        vibrationManager.saveTestEvents( dataString );
      }
    } );
  }

  /**
   * Adds a VibrationTestEvent to the collection.
   * @public
   *
   * @param {VibrationTestEvent} testEvent
   */
  addTestEvent( testEvent ) {
    this.events.push( testEvent );
  }

  /**
   * Convert all saved events to a string that can be sent to the containing Swift app.
   * @public
   */
  dataToString() {
    let string = '';

    this.events.forEach( event => {
      string += `${event.x},`;
      string += `${event.y},`;
      string += `${event.time},`;
      string += `${event.name};`;
    } );

    return string;
  }
}

tappi.register( 'VibrationTestEventRecorder', VibrationTestEventRecorder );

export default VibrationTestEventRecorder;
