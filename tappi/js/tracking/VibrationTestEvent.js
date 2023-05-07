// Copyright 2020, University of Colorado Boulder

/**
 * A collection of data related to user input, for the purposes of the Vibration project. While
 * the simulation is running we will collect the data of this class and save in the
 * VibrationTestEventRecorder collection. When the user is finished playing with the sim, the data
 * will be saved and sent to the containing Swift app, eventually to be saved as a file and
 * emailed to the team for research and presentation purposes.
 *
 * This is NOT to be used in production code.
 *
 * @author Jesse Greenberg
 */

import tappi from '../tappi.js';

class VibrationTestEvent {

  /**
   * @param {number|null} x - x coordinate of the event (in the global coordinate frame)
   * @param {number|null} y - y coordinate of the event (in the global coordinate frame)
   * @param {number} time - time since simulation launch of the event
   * @param {string|null} name - any classifying name to mark the event
   */
  constructor( x, y, time, name ) {

    // @public (read-only)
    this.x = x;
    this.y = y;
    this.time = time;
    this.name = name;
  }
}

tappi.register( 'VibrationTestEvent', VibrationTestEvent );

export default VibrationTestEvent;
