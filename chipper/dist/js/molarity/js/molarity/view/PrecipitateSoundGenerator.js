// Copyright 2019-2022, University of Colorado Boulder

/**
 * sound generator used to indicate the amount of precipitate and changes thereto
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import BinMapper from '../../../../tambo/js/BinMapper.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import precipitate_mp3 from '../../../sounds/precipitate_mp3.js';
import molarity from '../../molarity.js';

// constants
const ONE_OCTAVE_NOTE_MULTIPLIERS = [1, 1.122, 1.260, 1.414, 1.587, 1.782]; // whole tone scale
const NUM_OCTAVES = 2;
const NOTE_SPAN = 4; // span of notes to choose from for a given precipitate level
const NUM_BINS = 50;

// create an array with several octaves of frequency multipliers to use for generating variations of the base sound
const FREQUENCY_MULTIPLIERS = [];
_.times(NUM_OCTAVES, outerIndex => {
  const scale = Math.pow(2, (1 - NUM_OCTAVES) / 2 + outerIndex);
  ONE_OCTAVE_NOTE_MULTIPLIERS.forEach(multiplier => {
    FREQUENCY_MULTIPLIERS.push(multiplier * scale);
  });
});
class PrecipitateSoundGenerator extends SoundClip {
  /**
   * @param {Property.<number>} precipitateAmountProperty
   * @param {VerticalSlider} soluteAmountSlider - slider that controls the amount of solute
   * @param {VerticalSlider} solutionVolumeSlider - slider that controls the volume of the solution
   * @param {Object} [options]
   */
  constructor(precipitateAmountProperty, soluteAmountSlider, solutionVolumeSlider, options) {
    super(precipitate_mp3, merge({
      initialOutputLevel: 0.5,
      rateChangesAffectPlayingSounds: false
    }, options));

    // @private {number} - keeps track of previous played sound so that we never play it twice in a row
    this.previousMultiplierIndex = -1;

    // create a "bin mapper" to map the precipitate amount into a fixed set of bins
    const precipitateAmountBinMapper = new BinMapper(new Range(0, 1), NUM_BINS);

    // monitor the precipitate level and play sounds as it changes
    precipitateAmountProperty.lazyLink((precipitateAmount, previousPrecipitateAmount) => {
      // if the change was due to an pdom-caused event, a sound should be played on every change
      const changeDueToA11yAction = soluteAmountSlider.draggingPointerType === 'pdom' || solutionVolumeSlider.draggingPointerType === 'pdom';

      // Check if a sound should be played regardless of the change amount, generally because of changes made through
      // keyboard interaction.
      if (changeDueToA11yAction) {
        // for fine changes, play one sound, for larger ones, play two
        const changeAmount = Math.abs(previousPrecipitateAmount - precipitateAmount);
        this.playPrecipitateSound(precipitateAmount);
        if (changeAmount > 0.04) {
          this.playPrecipitateSound(precipitateAmount, 0.1);
        }
      }

      // Otherwise only play if the change was initiated by the user changing the solute amount or solution volume
      else if (soluteAmountSlider.draggingPointerType !== null || solutionVolumeSlider.draggingPointerType !== null) {
        // otherwise only play if the bin changed or we hit are un-hit one of the rails
        const oldBin = precipitateAmountBinMapper.mapToBin(previousPrecipitateAmount);
        const newBin = precipitateAmountBinMapper.mapToBin(precipitateAmount);
        if (newBin !== oldBin || precipitateAmount > 0 && previousPrecipitateAmount === 0 || precipitateAmount === 0 && previousPrecipitateAmount > 0) {
          this.playPrecipitateSound(precipitateAmount);
        }
      }
    });
  }

  /**
   * play the precipitate sound based on the provided precipitate amount
   * @private
   */
  playPrecipitateSound(precipitateAmount) {
    const lowestIndex = Math.floor((1 - precipitateAmount) * (FREQUENCY_MULTIPLIERS.length - NOTE_SPAN));

    // choose the note index, but make sure it's not the same as the last one
    let multiplierIndex;
    do {
      multiplierIndex = lowestIndex + Math.floor(dotRandom.nextDouble() * NOTE_SPAN);
    } while (multiplierIndex === this.previousMultiplierIndex);

    // set the playback rate and play the sound
    this.setPlaybackRate(FREQUENCY_MULTIPLIERS[multiplierIndex]);
    this.play();
    this.previousMultiplierIndex = multiplierIndex;
  }
}
molarity.register('PrecipitateSoundGenerator', PrecipitateSoundGenerator);
export default PrecipitateSoundGenerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJSYW5nZSIsIm1lcmdlIiwiQmluTWFwcGVyIiwiU291bmRDbGlwIiwicHJlY2lwaXRhdGVfbXAzIiwibW9sYXJpdHkiLCJPTkVfT0NUQVZFX05PVEVfTVVMVElQTElFUlMiLCJOVU1fT0NUQVZFUyIsIk5PVEVfU1BBTiIsIk5VTV9CSU5TIiwiRlJFUVVFTkNZX01VTFRJUExJRVJTIiwiXyIsInRpbWVzIiwib3V0ZXJJbmRleCIsInNjYWxlIiwiTWF0aCIsInBvdyIsImZvckVhY2giLCJtdWx0aXBsaWVyIiwicHVzaCIsIlByZWNpcGl0YXRlU291bmRHZW5lcmF0b3IiLCJjb25zdHJ1Y3RvciIsInByZWNpcGl0YXRlQW1vdW50UHJvcGVydHkiLCJzb2x1dGVBbW91bnRTbGlkZXIiLCJzb2x1dGlvblZvbHVtZVNsaWRlciIsIm9wdGlvbnMiLCJpbml0aWFsT3V0cHV0TGV2ZWwiLCJyYXRlQ2hhbmdlc0FmZmVjdFBsYXlpbmdTb3VuZHMiLCJwcmV2aW91c011bHRpcGxpZXJJbmRleCIsInByZWNpcGl0YXRlQW1vdW50QmluTWFwcGVyIiwibGF6eUxpbmsiLCJwcmVjaXBpdGF0ZUFtb3VudCIsInByZXZpb3VzUHJlY2lwaXRhdGVBbW91bnQiLCJjaGFuZ2VEdWVUb0ExMXlBY3Rpb24iLCJkcmFnZ2luZ1BvaW50ZXJUeXBlIiwiY2hhbmdlQW1vdW50IiwiYWJzIiwicGxheVByZWNpcGl0YXRlU291bmQiLCJvbGRCaW4iLCJtYXBUb0JpbiIsIm5ld0JpbiIsImxvd2VzdEluZGV4IiwiZmxvb3IiLCJsZW5ndGgiLCJtdWx0aXBsaWVySW5kZXgiLCJuZXh0RG91YmxlIiwic2V0UGxheWJhY2tSYXRlIiwicGxheSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUHJlY2lwaXRhdGVTb3VuZEdlbmVyYXRvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBzb3VuZCBnZW5lcmF0b3IgdXNlZCB0byBpbmRpY2F0ZSB0aGUgYW1vdW50IG9mIHByZWNpcGl0YXRlIGFuZCBjaGFuZ2VzIHRoZXJldG9cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBCaW5NYXBwZXIgZnJvbSAnLi4vLi4vLi4vLi4vdGFtYm8vanMvQmluTWFwcGVyLmpzJztcclxuaW1wb3J0IFNvdW5kQ2xpcCBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9zb3VuZC1nZW5lcmF0b3JzL1NvdW5kQ2xpcC5qcyc7XHJcbmltcG9ydCBwcmVjaXBpdGF0ZV9tcDMgZnJvbSAnLi4vLi4vLi4vc291bmRzL3ByZWNpcGl0YXRlX21wMy5qcyc7XHJcbmltcG9ydCBtb2xhcml0eSBmcm9tICcuLi8uLi9tb2xhcml0eS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgT05FX09DVEFWRV9OT1RFX01VTFRJUExJRVJTID0gWyAxLCAxLjEyMiwgMS4yNjAsIDEuNDE0LCAxLjU4NywgMS43ODIgXTsgLy8gd2hvbGUgdG9uZSBzY2FsZVxyXG5jb25zdCBOVU1fT0NUQVZFUyA9IDI7XHJcbmNvbnN0IE5PVEVfU1BBTiA9IDQ7IC8vIHNwYW4gb2Ygbm90ZXMgdG8gY2hvb3NlIGZyb20gZm9yIGEgZ2l2ZW4gcHJlY2lwaXRhdGUgbGV2ZWxcclxuY29uc3QgTlVNX0JJTlMgPSA1MDtcclxuXHJcbi8vIGNyZWF0ZSBhbiBhcnJheSB3aXRoIHNldmVyYWwgb2N0YXZlcyBvZiBmcmVxdWVuY3kgbXVsdGlwbGllcnMgdG8gdXNlIGZvciBnZW5lcmF0aW5nIHZhcmlhdGlvbnMgb2YgdGhlIGJhc2Ugc291bmRcclxuY29uc3QgRlJFUVVFTkNZX01VTFRJUExJRVJTID0gW107XHJcbl8udGltZXMoIE5VTV9PQ1RBVkVTLCBvdXRlckluZGV4ID0+IHtcclxuICBjb25zdCBzY2FsZSA9IE1hdGgucG93KCAyLCAoIDEgLSBOVU1fT0NUQVZFUyApIC8gMiArIG91dGVySW5kZXggKTtcclxuICBPTkVfT0NUQVZFX05PVEVfTVVMVElQTElFUlMuZm9yRWFjaCggbXVsdGlwbGllciA9PiB7XHJcbiAgICBGUkVRVUVOQ1lfTVVMVElQTElFUlMucHVzaCggbXVsdGlwbGllciAqIHNjYWxlICk7XHJcbiAgfSApO1xyXG59ICk7XHJcblxyXG5jbGFzcyBQcmVjaXBpdGF0ZVNvdW5kR2VuZXJhdG9yIGV4dGVuZHMgU291bmRDbGlwIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48bnVtYmVyPn0gcHJlY2lwaXRhdGVBbW91bnRQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7VmVydGljYWxTbGlkZXJ9IHNvbHV0ZUFtb3VudFNsaWRlciAtIHNsaWRlciB0aGF0IGNvbnRyb2xzIHRoZSBhbW91bnQgb2Ygc29sdXRlXHJcbiAgICogQHBhcmFtIHtWZXJ0aWNhbFNsaWRlcn0gc29sdXRpb25Wb2x1bWVTbGlkZXIgLSBzbGlkZXIgdGhhdCBjb250cm9scyB0aGUgdm9sdW1lIG9mIHRoZSBzb2x1dGlvblxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcHJlY2lwaXRhdGVBbW91bnRQcm9wZXJ0eSwgc29sdXRlQW1vdW50U2xpZGVyLCBzb2x1dGlvblZvbHVtZVNsaWRlciwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBzdXBlciggcHJlY2lwaXRhdGVfbXAzLCBtZXJnZSgge1xyXG4gICAgICBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuNSxcclxuICAgICAgcmF0ZUNoYW5nZXNBZmZlY3RQbGF5aW5nU291bmRzOiBmYWxzZVxyXG4gICAgfSwgb3B0aW9ucyApICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBrZWVwcyB0cmFjayBvZiBwcmV2aW91cyBwbGF5ZWQgc291bmQgc28gdGhhdCB3ZSBuZXZlciBwbGF5IGl0IHR3aWNlIGluIGEgcm93XHJcbiAgICB0aGlzLnByZXZpb3VzTXVsdGlwbGllckluZGV4ID0gLTE7XHJcblxyXG4gICAgLy8gY3JlYXRlIGEgXCJiaW4gbWFwcGVyXCIgdG8gbWFwIHRoZSBwcmVjaXBpdGF0ZSBhbW91bnQgaW50byBhIGZpeGVkIHNldCBvZiBiaW5zXHJcbiAgICBjb25zdCBwcmVjaXBpdGF0ZUFtb3VudEJpbk1hcHBlciA9IG5ldyBCaW5NYXBwZXIoIG5ldyBSYW5nZSggMCwgMSApLCBOVU1fQklOUyApO1xyXG5cclxuICAgIC8vIG1vbml0b3IgdGhlIHByZWNpcGl0YXRlIGxldmVsIGFuZCBwbGF5IHNvdW5kcyBhcyBpdCBjaGFuZ2VzXHJcbiAgICBwcmVjaXBpdGF0ZUFtb3VudFByb3BlcnR5LmxhenlMaW5rKCAoIHByZWNpcGl0YXRlQW1vdW50LCBwcmV2aW91c1ByZWNpcGl0YXRlQW1vdW50ICkgPT4ge1xyXG5cclxuICAgICAgLy8gaWYgdGhlIGNoYW5nZSB3YXMgZHVlIHRvIGFuIHBkb20tY2F1c2VkIGV2ZW50LCBhIHNvdW5kIHNob3VsZCBiZSBwbGF5ZWQgb24gZXZlcnkgY2hhbmdlXHJcbiAgICAgIGNvbnN0IGNoYW5nZUR1ZVRvQTExeUFjdGlvbiA9IHNvbHV0ZUFtb3VudFNsaWRlci5kcmFnZ2luZ1BvaW50ZXJUeXBlID09PSAncGRvbScgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc29sdXRpb25Wb2x1bWVTbGlkZXIuZHJhZ2dpbmdQb2ludGVyVHlwZSA9PT0gJ3Bkb20nO1xyXG5cclxuICAgICAgLy8gQ2hlY2sgaWYgYSBzb3VuZCBzaG91bGQgYmUgcGxheWVkIHJlZ2FyZGxlc3Mgb2YgdGhlIGNoYW5nZSBhbW91bnQsIGdlbmVyYWxseSBiZWNhdXNlIG9mIGNoYW5nZXMgbWFkZSB0aHJvdWdoXHJcbiAgICAgIC8vIGtleWJvYXJkIGludGVyYWN0aW9uLlxyXG4gICAgICBpZiAoIGNoYW5nZUR1ZVRvQTExeUFjdGlvbiApIHtcclxuXHJcbiAgICAgICAgLy8gZm9yIGZpbmUgY2hhbmdlcywgcGxheSBvbmUgc291bmQsIGZvciBsYXJnZXIgb25lcywgcGxheSB0d29cclxuICAgICAgICBjb25zdCBjaGFuZ2VBbW91bnQgPSBNYXRoLmFicyggcHJldmlvdXNQcmVjaXBpdGF0ZUFtb3VudCAtIHByZWNpcGl0YXRlQW1vdW50ICk7XHJcbiAgICAgICAgdGhpcy5wbGF5UHJlY2lwaXRhdGVTb3VuZCggcHJlY2lwaXRhdGVBbW91bnQgKTtcclxuICAgICAgICBpZiAoIGNoYW5nZUFtb3VudCA+IDAuMDQgKSB7XHJcbiAgICAgICAgICB0aGlzLnBsYXlQcmVjaXBpdGF0ZVNvdW5kKCBwcmVjaXBpdGF0ZUFtb3VudCwgMC4xICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBPdGhlcndpc2Ugb25seSBwbGF5IGlmIHRoZSBjaGFuZ2Ugd2FzIGluaXRpYXRlZCBieSB0aGUgdXNlciBjaGFuZ2luZyB0aGUgc29sdXRlIGFtb3VudCBvciBzb2x1dGlvbiB2b2x1bWVcclxuICAgICAgZWxzZSBpZiAoIHNvbHV0ZUFtb3VudFNsaWRlci5kcmFnZ2luZ1BvaW50ZXJUeXBlICE9PSBudWxsIHx8XHJcbiAgICAgICAgICAgICAgICBzb2x1dGlvblZvbHVtZVNsaWRlci5kcmFnZ2luZ1BvaW50ZXJUeXBlICE9PSBudWxsICkge1xyXG5cclxuICAgICAgICAvLyBvdGhlcndpc2Ugb25seSBwbGF5IGlmIHRoZSBiaW4gY2hhbmdlZCBvciB3ZSBoaXQgYXJlIHVuLWhpdCBvbmUgb2YgdGhlIHJhaWxzXHJcbiAgICAgICAgY29uc3Qgb2xkQmluID0gcHJlY2lwaXRhdGVBbW91bnRCaW5NYXBwZXIubWFwVG9CaW4oIHByZXZpb3VzUHJlY2lwaXRhdGVBbW91bnQgKTtcclxuICAgICAgICBjb25zdCBuZXdCaW4gPSBwcmVjaXBpdGF0ZUFtb3VudEJpbk1hcHBlci5tYXBUb0JpbiggcHJlY2lwaXRhdGVBbW91bnQgKTtcclxuICAgICAgICBpZiAoIG5ld0JpbiAhPT0gb2xkQmluIHx8XHJcbiAgICAgICAgICAgICBwcmVjaXBpdGF0ZUFtb3VudCA+IDAgJiYgcHJldmlvdXNQcmVjaXBpdGF0ZUFtb3VudCA9PT0gMCB8fFxyXG4gICAgICAgICAgICAgcHJlY2lwaXRhdGVBbW91bnQgPT09IDAgJiYgcHJldmlvdXNQcmVjaXBpdGF0ZUFtb3VudCA+IDAgKSB7XHJcbiAgICAgICAgICB0aGlzLnBsYXlQcmVjaXBpdGF0ZVNvdW5kKCBwcmVjaXBpdGF0ZUFtb3VudCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogcGxheSB0aGUgcHJlY2lwaXRhdGUgc291bmQgYmFzZWQgb24gdGhlIHByb3ZpZGVkIHByZWNpcGl0YXRlIGFtb3VudFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcGxheVByZWNpcGl0YXRlU291bmQoIHByZWNpcGl0YXRlQW1vdW50ICkge1xyXG4gICAgY29uc3QgbG93ZXN0SW5kZXggPSBNYXRoLmZsb29yKCAoIDEgLSBwcmVjaXBpdGF0ZUFtb3VudCApICogKCBGUkVRVUVOQ1lfTVVMVElQTElFUlMubGVuZ3RoIC0gTk9URV9TUEFOICkgKTtcclxuXHJcbiAgICAvLyBjaG9vc2UgdGhlIG5vdGUgaW5kZXgsIGJ1dCBtYWtlIHN1cmUgaXQncyBub3QgdGhlIHNhbWUgYXMgdGhlIGxhc3Qgb25lXHJcbiAgICBsZXQgbXVsdGlwbGllckluZGV4O1xyXG4gICAgZG8ge1xyXG4gICAgICBtdWx0aXBsaWVySW5kZXggPSBsb3dlc3RJbmRleCArIE1hdGguZmxvb3IoIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgKiBOT1RFX1NQQU4gKTtcclxuICAgIH0gd2hpbGUgKCBtdWx0aXBsaWVySW5kZXggPT09IHRoaXMucHJldmlvdXNNdWx0aXBsaWVySW5kZXggKTtcclxuXHJcbiAgICAvLyBzZXQgdGhlIHBsYXliYWNrIHJhdGUgYW5kIHBsYXkgdGhlIHNvdW5kXHJcbiAgICB0aGlzLnNldFBsYXliYWNrUmF0ZSggRlJFUVVFTkNZX01VTFRJUExJRVJTWyBtdWx0aXBsaWVySW5kZXggXSApO1xyXG4gICAgdGhpcy5wbGF5KCk7XHJcbiAgICB0aGlzLnByZXZpb3VzTXVsdGlwbGllckluZGV4ID0gbXVsdGlwbGllckluZGV4O1xyXG4gIH1cclxufVxyXG5cclxubW9sYXJpdHkucmVnaXN0ZXIoICdQcmVjaXBpdGF0ZVNvdW5kR2VuZXJhdG9yJywgUHJlY2lwaXRhdGVTb3VuZEdlbmVyYXRvciApO1xyXG5leHBvcnQgZGVmYXVsdCBQcmVjaXBpdGF0ZVNvdW5kR2VuZXJhdG9yOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxTQUFTLE1BQU0sbUNBQW1DO0FBQ3pELE9BQU9DLFNBQVMsTUFBTSxvREFBb0Q7QUFDMUUsT0FBT0MsZUFBZSxNQUFNLG9DQUFvQztBQUNoRSxPQUFPQyxRQUFRLE1BQU0sbUJBQW1COztBQUV4QztBQUNBLE1BQU1DLDJCQUEyQixHQUFHLENBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUUsQ0FBQyxDQUFDO0FBQzlFLE1BQU1DLFdBQVcsR0FBRyxDQUFDO0FBQ3JCLE1BQU1DLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNyQixNQUFNQyxRQUFRLEdBQUcsRUFBRTs7QUFFbkI7QUFDQSxNQUFNQyxxQkFBcUIsR0FBRyxFQUFFO0FBQ2hDQyxDQUFDLENBQUNDLEtBQUssQ0FBRUwsV0FBVyxFQUFFTSxVQUFVLElBQUk7RUFDbEMsTUFBTUMsS0FBSyxHQUFHQyxJQUFJLENBQUNDLEdBQUcsQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEdBQUdULFdBQVcsSUFBSyxDQUFDLEdBQUdNLFVBQVcsQ0FBQztFQUNqRVAsMkJBQTJCLENBQUNXLE9BQU8sQ0FBRUMsVUFBVSxJQUFJO0lBQ2pEUixxQkFBcUIsQ0FBQ1MsSUFBSSxDQUFFRCxVQUFVLEdBQUdKLEtBQU0sQ0FBQztFQUNsRCxDQUFFLENBQUM7QUFDTCxDQUFFLENBQUM7QUFFSCxNQUFNTSx5QkFBeUIsU0FBU2pCLFNBQVMsQ0FBQztFQUVoRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWtCLFdBQVdBLENBQUVDLHlCQUF5QixFQUFFQyxrQkFBa0IsRUFBRUMsb0JBQW9CLEVBQUVDLE9BQU8sRUFBRztJQUUxRixLQUFLLENBQUVyQixlQUFlLEVBQUVILEtBQUssQ0FBRTtNQUM3QnlCLGtCQUFrQixFQUFFLEdBQUc7TUFDdkJDLDhCQUE4QixFQUFFO0lBQ2xDLENBQUMsRUFBRUYsT0FBUSxDQUFFLENBQUM7O0lBRWQ7SUFDQSxJQUFJLENBQUNHLHVCQUF1QixHQUFHLENBQUMsQ0FBQzs7SUFFakM7SUFDQSxNQUFNQywwQkFBMEIsR0FBRyxJQUFJM0IsU0FBUyxDQUFFLElBQUlGLEtBQUssQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQUVTLFFBQVMsQ0FBQzs7SUFFL0U7SUFDQWEseUJBQXlCLENBQUNRLFFBQVEsQ0FBRSxDQUFFQyxpQkFBaUIsRUFBRUMseUJBQXlCLEtBQU07TUFFdEY7TUFDQSxNQUFNQyxxQkFBcUIsR0FBR1Ysa0JBQWtCLENBQUNXLG1CQUFtQixLQUFLLE1BQU0sSUFDakRWLG9CQUFvQixDQUFDVSxtQkFBbUIsS0FBSyxNQUFNOztNQUVqRjtNQUNBO01BQ0EsSUFBS0QscUJBQXFCLEVBQUc7UUFFM0I7UUFDQSxNQUFNRSxZQUFZLEdBQUdwQixJQUFJLENBQUNxQixHQUFHLENBQUVKLHlCQUF5QixHQUFHRCxpQkFBa0IsQ0FBQztRQUM5RSxJQUFJLENBQUNNLG9CQUFvQixDQUFFTixpQkFBa0IsQ0FBQztRQUM5QyxJQUFLSSxZQUFZLEdBQUcsSUFBSSxFQUFHO1VBQ3pCLElBQUksQ0FBQ0Usb0JBQW9CLENBQUVOLGlCQUFpQixFQUFFLEdBQUksQ0FBQztRQUNyRDtNQUNGOztNQUVBO01BQUEsS0FDSyxJQUFLUixrQkFBa0IsQ0FBQ1csbUJBQW1CLEtBQUssSUFBSSxJQUMvQ1Ysb0JBQW9CLENBQUNVLG1CQUFtQixLQUFLLElBQUksRUFBRztRQUU1RDtRQUNBLE1BQU1JLE1BQU0sR0FBR1QsMEJBQTBCLENBQUNVLFFBQVEsQ0FBRVAseUJBQTBCLENBQUM7UUFDL0UsTUFBTVEsTUFBTSxHQUFHWCwwQkFBMEIsQ0FBQ1UsUUFBUSxDQUFFUixpQkFBa0IsQ0FBQztRQUN2RSxJQUFLUyxNQUFNLEtBQUtGLE1BQU0sSUFDakJQLGlCQUFpQixHQUFHLENBQUMsSUFBSUMseUJBQXlCLEtBQUssQ0FBQyxJQUN4REQsaUJBQWlCLEtBQUssQ0FBQyxJQUFJQyx5QkFBeUIsR0FBRyxDQUFDLEVBQUc7VUFDOUQsSUFBSSxDQUFDSyxvQkFBb0IsQ0FBRU4saUJBQWtCLENBQUM7UUFDaEQ7TUFDRjtJQUNGLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VNLG9CQUFvQkEsQ0FBRU4saUJBQWlCLEVBQUc7SUFDeEMsTUFBTVUsV0FBVyxHQUFHMUIsSUFBSSxDQUFDMkIsS0FBSyxDQUFFLENBQUUsQ0FBQyxHQUFHWCxpQkFBaUIsS0FBT3JCLHFCQUFxQixDQUFDaUMsTUFBTSxHQUFHbkMsU0FBUyxDQUFHLENBQUM7O0lBRTFHO0lBQ0EsSUFBSW9DLGVBQWU7SUFDbkIsR0FBRztNQUNEQSxlQUFlLEdBQUdILFdBQVcsR0FBRzFCLElBQUksQ0FBQzJCLEtBQUssQ0FBRTNDLFNBQVMsQ0FBQzhDLFVBQVUsQ0FBQyxDQUFDLEdBQUdyQyxTQUFVLENBQUM7SUFDbEYsQ0FBQyxRQUFTb0MsZUFBZSxLQUFLLElBQUksQ0FBQ2hCLHVCQUF1Qjs7SUFFMUQ7SUFDQSxJQUFJLENBQUNrQixlQUFlLENBQUVwQyxxQkFBcUIsQ0FBRWtDLGVBQWUsQ0FBRyxDQUFDO0lBQ2hFLElBQUksQ0FBQ0csSUFBSSxDQUFDLENBQUM7SUFDWCxJQUFJLENBQUNuQix1QkFBdUIsR0FBR2dCLGVBQWU7RUFDaEQ7QUFDRjtBQUVBdkMsUUFBUSxDQUFDMkMsUUFBUSxDQUFFLDJCQUEyQixFQUFFNUIseUJBQTBCLENBQUM7QUFDM0UsZUFBZUEseUJBQXlCIn0=