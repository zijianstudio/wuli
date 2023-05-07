// Copyright 2014-2022, University of Colorado Boulder

/**
 * Voltmeter gauge (panel with needle) for 'Faradays Law'
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import MinusNode from '../../../../scenery-phet/js/MinusNode.js';
import PlusNode from '../../../../scenery-phet/js/PlusNode.js';
import { Circle, Node, Path } from '../../../../scenery/js/imports.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import voltageMaxClick_mp3 from '../../../sounds/voltageMaxClick_mp3.js';
import faradaysLaw from '../../faradaysLaw.js';

// constants
const MIN_ANGLE = -Math.PI / 2;
const MAX_ANGLE = Math.PI / 2;
const CLICK_SOUND_OUTPUT_LEVEL = 0.15; // empirically determined

class VoltmeterGauge extends Node {

  /**
   * @param {NumberProperty} needleAngleProperty - angle of needle in voltmeter
   * @param {Object} [options]
   */
  constructor( needleAngleProperty, options ) {
    super();
    const arcRadius = 55; // radius of voltmeter scale, empirically determined
    const needleColor = '#3954a5'; // blue

    // background panel within which the needle moves
    const background = new Path( new Shape()
      .moveTo( 0, 0 )
      .lineTo( 0, -arcRadius )
      .moveTo( -arcRadius, 0 )
      .arc( 0, 0, arcRadius, -Math.PI, 0, false )
      .lineTo( -arcRadius, 0 )
      .close(), {
      stroke: 'black',
      lineWidth: 1
    } );
    this.addChild( background );

    // plus and minus signs
    this.addChild( new PlusNode( {
      centerX: arcRadius / 2.3,
      centerY: -arcRadius / 2.5,
      size: new Dimension2( 12, 2 )
    } ) );
    this.addChild( new MinusNode( {
      centerX: -arcRadius / 2.3,
      centerY: -arcRadius / 2.5,
      size: new Dimension2( 12, 2 )
    } ) );

    // needle base
    this.addChild( new Circle( 4, {
      fill: needleColor
    } ) );

    // needle
    const needleArrowNode = new ArrowNode( 0, 0, 0, -53, {
      headHeight: 12,
      headWidth: 8,
      tailWidth: 2,
      fill: needleColor,
      lineWidth: 0
    } );
    this.addChild( needleArrowNode );

    // sound generators
    const maxPositiveVoltageSoundClip = new SoundClip( voltageMaxClick_mp3, {
      initialOutputLevel: CLICK_SOUND_OUTPUT_LEVEL,
      initialPlaybackRate: 1.12246204831
    } );
    soundManager.addSoundGenerator( maxPositiveVoltageSoundClip );
    const maxNegativeVoltageSoundClip = new SoundClip( voltageMaxClick_mp3, {
      initialOutputLevel: CLICK_SOUND_OUTPUT_LEVEL
    } );
    soundManager.addSoundGenerator( maxNegativeVoltageSoundClip );

    // observers
    let previousClampedNeedleAngle = needleAngleProperty.value;
    needleAngleProperty.link( needleAngle => {

      // Set the angle of the needle, making sure that it doesn't exceed the max or min values.
      const clampedNeedleAngle = Utils.clamp( needleAngle, MIN_ANGLE, MAX_ANGLE );
      needleArrowNode.rotation = clampedNeedleAngle;

      // Play a sound when the needle first hits the min or max value, but only if visible.
      if ( _.some( this.getTrailsTo( phet.joist.display.rootNode ), trail => trail.isVisible() ) ) {
        if ( clampedNeedleAngle === MAX_ANGLE && previousClampedNeedleAngle < MAX_ANGLE ) {
          maxPositiveVoltageSoundClip.play();
        }
        else if ( clampedNeedleAngle === MIN_ANGLE && previousClampedNeedleAngle > MIN_ANGLE ) {
          maxNegativeVoltageSoundClip.play();
        }
      }

      // Save the needle angle for comparison the next time through.
      previousClampedNeedleAngle = clampedNeedleAngle;
    } );

    this.mutate( options );
  }
}

faradaysLaw.register( 'VoltmeterGauge', VoltmeterGauge );
export default VoltmeterGauge;