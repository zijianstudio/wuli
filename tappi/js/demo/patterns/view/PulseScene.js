// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */

import tappi from '../../../tappi.js';
import VibrationPatterns from '../../../VibrationPatterns.js';
import PatternsDemoScene from './PatternsDemoScene.js';

class PulseScene extends PatternsDemoScene {
  constructor( activePatternProperty, options ) {
    super( activePatternProperty );

    // creates the buttons and adds them to the scene
    this.createPatternButtons( [
      { pattern: VibrationPatterns.HZ_2_5, label: '2.5 Hz' },
      { pattern: VibrationPatterns.HZ_5, label: '5 Hz' },
      { pattern: VibrationPatterns.HZ_10, label: '10 Hz' },
      { pattern: VibrationPatterns.HZ_25, label: '25 Hz' },
      { pattern: VibrationPatterns.HZ_50, label: '50 Hz' },
      { pattern: VibrationPatterns.HZ_100, label: '100 Hz' }
    ] );

    // mutate after buttons have been added for proper bounds
    this.mutate( options );
  }
}

tappi.register( 'PulseScene', PulseScene );
export default PulseScene;