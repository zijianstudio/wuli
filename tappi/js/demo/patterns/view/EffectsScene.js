// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */

import tappi from '../../../tappi.js';
import VibrationPatterns from '../../../VibrationPatterns.js';
import PatternsDemoScene from './PatternsDemoScene.js';

class EffectsScene extends PatternsDemoScene {
  constructor( activePatternProperty, options ) {
    super( activePatternProperty, options );

    // creates the buttons and adds them to the scene
    this.createPatternButtons( [
      { pattern: VibrationPatterns.QUICK_BALL_ROLL, label: 'Quick Ball Roll' },
      { pattern: VibrationPatterns.SLOW_BALL_ROLL, label: 'Slow Ball Roll' },
      { pattern: VibrationPatterns.FLUTTER, label: 'Flutter' },
      { pattern: VibrationPatterns.SLOW_DOWN, label: 'Slow Down' },
      { pattern: VibrationPatterns.HEARTBEAT, label: 'Heartbeat' },
      { pattern: VibrationPatterns.QUICK_HEARTBEAT, label: 'Quick Heartbeat' }
    ] );

    // mutate after buttons have been added for proper bounds
    this.mutate( options );
  }
}

tappi.register( 'EffectsScene', EffectsScene );
export default EffectsScene;