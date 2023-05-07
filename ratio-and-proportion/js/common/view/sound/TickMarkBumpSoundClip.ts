// Copyright 2020-2022, University of Colorado Boulder

/**
 * A short sound to indicate when a movable component has crossed over a tick mark.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import SoundClip, { SoundClipOptions } from '../../../../../tambo/js/sound-generators/SoundClip.js';
import generalSoftClick_mp3 from '../../../../../tambo/sounds/generalSoftClick_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import Range from '../../../../../dot/js/Range.js';
import Property from '../../../../../axon/js/Property.js';

// This value was copied from similar sound work done in Waves Intro
const MIN_INTER_CLICK_TIME = 33.3; // min time between clicking sounds, in milliseconds, empirically determined

class TickMarkBumpSoundClip extends SoundClip {

  private tickMarkRangeProperty: Property<number>;
  private positionRange: Range;
  private timeOfLastClick: number;

  // by keeping track of the last value, we can test if we passed a tick mark. This is updated with the
  // granularity of how often an interaction occurs, see this.onInteract().
  private lastValue: null | number;

  /**
   * @param tickMarkRangeProperty - serves as the divisor of the position range to yield position
   * where bump sounds should occur.
   * @param positionRange - the total range in position
   * @param [options]
   */
  public constructor( tickMarkRangeProperty: Property<number>, positionRange: Range, options?: SoundClipOptions ) {
    super( generalSoftClick_mp3, options );

    this.tickMarkRangeProperty = tickMarkRangeProperty;
    this.positionRange = positionRange;
    this.timeOfLastClick = 0;
    this.lastValue = null;
  }

  /**
   * Call this when an interaction occurs that could potentially cause a tick mark sound to play.
   */
  public onInteract( currentValue: number ): void {

    if ( this.lastValue !== null ) {

      // handle the sound as desired for mouse/touch style input (for vertical changes)
      for ( let i = 0; i < this.tickMarkRangeProperty.value; i++ ) {
        const tickValue = ( i / this.positionRange.getLength() ) / this.tickMarkRangeProperty.value;

        // Not at max or min, crossed a tick mark value
        if ( currentValue !== this.positionRange.min && currentValue !== this.positionRange.max &&
             ( this.lastValue < tickValue && currentValue >= tickValue || this.lastValue > tickValue && currentValue <= tickValue ) ) {

          // if enough time has passed since the last change
          if ( phet.joist.elapsedTime - this.timeOfLastClick >= MIN_INTER_CLICK_TIME ) {
            this.play();
            this.timeOfLastClick = phet.joist.elapsedTime;
          }
          break;
        }
      }
    }

    this.lastValue = currentValue;
  }

  public reset(): void {
    this.stop( 0 );
    this.timeOfLastClick = 0;
    this.lastValue = null;
  }
}

ratioAndProportion.register( 'TickMarkBumpSoundClip', TickMarkBumpSoundClip );

export default TickMarkBumpSoundClip;