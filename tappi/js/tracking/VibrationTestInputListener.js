// Copyright 2020-2021, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */

import tappi from '../tappi.js';
import VibrationTestEvent from './VibrationTestEvent.js';

class VibrationTestInputListener {

  /**
   * @param {VibrationTestEventRecorder} eventRecorder - object saving VibrationTestEvents, passed in since this is not
   *                                                     the only class creating and saving events.
   */
  constructor( eventRecorder ) {

    // @private {VibrationTestEventRecorder}
    this.eventRecorder = eventRecorder;

    // in seconds
    this.elapsedTime = 0;

    this._pointerListener = {
      up: event => {
        const globalPoint = event.pointer.point;
        const testEvent = new VibrationTestEvent( globalPoint.x, globalPoint.y, this.elapsedTime, `${event.pointer.type}up` );
        this.eventRecorder.addTestEvent( testEvent );

        this.handleRelease();
      },
      cancel: evennt => {
        this.handleRelease();
      },

      // attached to the pointer, so that only moves that occur while a pointer is down are recorded
      move: event => {
        const globalPoint = event.pointer.point;
        const testEvent = new VibrationTestEvent( globalPoint.x, globalPoint.y, this.elapsedTime, `${event.pointer.type}move` );
        this.eventRecorder.addTestEvent( testEvent );
      }
    };

    this.pointer = null;
  }

  /**
   * @private
   * @param {SceneryEvent} event
   */
  handleRelease( event ) {
    this.pointer.removeInputListener( this._pointerListener );
    this.pointer = null;
  }

  /**
   * @public
   */
  interrupt() {
    if ( this.pointer ) {
      this.pointer.removeInputListener( this._pointerListener );
      this.pointer = null;
    }
  }

  /**
   * @public (scenery-internal) - part of the listener API
   * @param event
   */
  down( event ) {
    if ( this.pointer === null ) {
      this.pointer = event.pointer;
      const globalPoint = event.pointer.point;
      const testEvent = new VibrationTestEvent( globalPoint.x, globalPoint.y, this.elapsedTime, `${event.pointer.type}down` );
      this.eventRecorder.addTestEvent( testEvent );

      event.pointer.addInputListener( this._pointerListener, false );
    }
  }

  /**
   * @public (scenery-internal) - part of the listener API
   * @param event
   */
  click( event ) {

    // just record center of click target
    const position = event.target.globalBounds.center;
    console.log( position );
    const testEvent = new VibrationTestEvent( position.x, position.y, this.elapsedTime, event.pointer.type );
    this.eventRecorder.addTestEvent( testEvent );
  }

  /**
   * Sets the elapsed time to be saved for events. Rather than stepping/tracking its own elapsed time,
   * it should be set externally by a simulation because this listener is not the only one to save data
   * to the event recorder. The simulation updates its elapsed time in one location and sends that
   * to the places that need it.
   * @public
   *
   * @param {number} time - in seconds
   */
  setElapsedTime( time ) {
    this.elapsedTime = time;
  }
}

tappi.register( 'VibrationTestInputListener', VibrationTestInputListener );

export default VibrationTestInputListener;
