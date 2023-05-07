// Copyright 2016-2021, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import energySkatePark from '../energySkatePark.js';

const EnergySkateParkQueryParameters = QueryStringMachine.getAll( {

  // Print out console messages related to the physics
  debugLog: { type: 'flag' },

  // Print out console messages related to attaching and detaching from the tracks
  debugAttachDetach: { type: 'flag' },

  // Shows the drag bounds for the control points on the premade tracks - normal behavior is for them to only be
  // visible during drag
  showPointBounds: { type: 'flag' },

  // Changes the units for acceleration due to gravity from m/s^2 to N/kg, as requested by
  // a user. So this is definitely public. - see https://github.com/phetsims/energy-skate-park/issues/293 for request issue
  // @public
  altAccelerationUnits: { type: 'flag', public: true },

  // This indicates the index (1-based) of the track to show, and enables some other track debugging
  testTrackIndex: {
    type: 'number',
    defaultValue: 0
  }
} );

energySkatePark.register( 'EnergySkateParkQueryParameters', EnergySkateParkQueryParameters );

export default EnergySkateParkQueryParameters;