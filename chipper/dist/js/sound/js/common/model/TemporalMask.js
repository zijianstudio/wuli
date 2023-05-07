// Copyright 2022, University of Colorado Boulder

/**
 * Records on and off times of a single source, so that we can determine whether it could have contributed to the value
 * on the lattice at a later time.  This is used to prevent artifacts when the wave is turned off, and to restore
 * the lattice to black (for light), see https://github.com/phetsims/wave-interference/issues/258
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Lattice from '../../../../scenery-phet/js/Lattice.js';
import SoundConstants from '../../common/SoundConstants.js';
import sound from '../../sound.js';
export default class TemporalMask {
  // record of changes in wave disturbance sources.
  deltas = [];

  /**
   * Set the current state of the model.  If this differs from the prior state type (in position or whether it is on)
   * a delta is generated.
   * @param isSourceOn - true if the source is on, false if the source is off
   * @param numberOfSteps - integer number of times the wave has been stepped on the lattice
   * @param verticalLatticeCoordinate - vertical lattice coordinate
   */
  set(isSourceOn, numberOfSteps, verticalLatticeCoordinate) {
    const lastDelta = this.deltas.length > 0 ? this.deltas[this.deltas.length - 1] : null;
    if (this.deltas.length === 0 || lastDelta.isSourceOn !== isSourceOn || lastDelta.verticalLatticeCoordinate !== verticalLatticeCoordinate) {
      // record a delta
      this.deltas.push({
        isSourceOn: isSourceOn,
        numberOfSteps: numberOfSteps,
        verticalLatticeCoordinate: verticalLatticeCoordinate
      });
    }
  }

  /**
   * Determines if the wave source was turned on at a time that contributed to the cell value
   * @param horizontalSourceX - horizontal coordinate of the source
   * @param horizontalLatticeCoordinate - horizontal coordinate on the lattice (i)
   * @param verticalLatticeCoordinate - vertical coordinate on the lattice (j)
   * @param numberOfSteps - integer number of times the wave has been stepped on the lattice
   */
  matches(horizontalSourceX, horizontalLatticeCoordinate, verticalLatticeCoordinate, numberOfSteps) {
    // search to see if the source contributed to the value at the specified coordinate at the current numberOfSteps
    for (let k = 0; k < this.deltas.length; k++) {
      const delta = this.deltas[k];
      if (delta.isSourceOn) {
        const horizontalDelta = horizontalSourceX - horizontalLatticeCoordinate;
        const verticalDelta = delta.verticalLatticeCoordinate - verticalLatticeCoordinate;
        const distance = Math.sqrt(horizontalDelta * horizontalDelta + verticalDelta * verticalDelta);

        // Find out when this delta is in effect
        const startTime = delta.numberOfSteps;
        const endTime = this.deltas[k + 1] ? this.deltas[k + 1].numberOfSteps : numberOfSteps;
        const theoreticalTime = numberOfSteps - distance / Lattice.WAVE_SPEED;

        // if theoreticalDistance matches any time in this range, the cell's value was caused by the oscillators, and
        // not by a reflection or numerical artifact.  The tolerance is necessary because the actual group velocity
        // of the tip exceeds the theoretical speed, and the group velocity at the tail is lower than the theoretical
        // speed.  If the tolerance is too tight, this appears as an unnatural "clipping" of the wave area graph.
        const headTolerance = 2;
        const tailTolerance = 4;
        if (horizontalDelta <= 0 && theoreticalTime >= startTime - headTolerance && theoreticalTime <= endTime + tailTolerance && Math.abs(Math.atan(verticalDelta / horizontalDelta)) <= SoundConstants.CONE_ANGLE) {
          // Return as early as possible to improve performance
          return distance;
        }
      }
    }
    return -1;
  }

  /**
   * Remove delta values that are so old they can no longer impact the model, to avoid memory leaks and too much CPU
   * @param maxDistance - the furthest a point can be from a source
   * @param numberOfSteps - integer number of times the wave has been stepped on the lattice
   */
  prune(maxDistance, numberOfSteps) {
    // Save enough deltas so that even if the user toggles the source on and off rapidly, the effect will be further
    // from the source.  But don't save so many deltas that performance is degraded.
    // See https://github.com/phetsims/wave-interference/issues/319
    while (this.deltas.length > 10) {
      this.deltas.shift(); // remove oldest deltas first
    }
  }

  /**
   * Clear the state.
   */
  clear() {
    this.deltas.length = 0;
  }
}
sound.register('TemporalMask', TemporalMask);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMYXR0aWNlIiwiU291bmRDb25zdGFudHMiLCJzb3VuZCIsIlRlbXBvcmFsTWFzayIsImRlbHRhcyIsInNldCIsImlzU291cmNlT24iLCJudW1iZXJPZlN0ZXBzIiwidmVydGljYWxMYXR0aWNlQ29vcmRpbmF0ZSIsImxhc3REZWx0YSIsImxlbmd0aCIsInB1c2giLCJtYXRjaGVzIiwiaG9yaXpvbnRhbFNvdXJjZVgiLCJob3Jpem9udGFsTGF0dGljZUNvb3JkaW5hdGUiLCJrIiwiZGVsdGEiLCJob3Jpem9udGFsRGVsdGEiLCJ2ZXJ0aWNhbERlbHRhIiwiZGlzdGFuY2UiLCJNYXRoIiwic3FydCIsInN0YXJ0VGltZSIsImVuZFRpbWUiLCJ0aGVvcmV0aWNhbFRpbWUiLCJXQVZFX1NQRUVEIiwiaGVhZFRvbGVyYW5jZSIsInRhaWxUb2xlcmFuY2UiLCJhYnMiLCJhdGFuIiwiQ09ORV9BTkdMRSIsInBydW5lIiwibWF4RGlzdGFuY2UiLCJzaGlmdCIsImNsZWFyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUZW1wb3JhbE1hc2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlY29yZHMgb24gYW5kIG9mZiB0aW1lcyBvZiBhIHNpbmdsZSBzb3VyY2UsIHNvIHRoYXQgd2UgY2FuIGRldGVybWluZSB3aGV0aGVyIGl0IGNvdWxkIGhhdmUgY29udHJpYnV0ZWQgdG8gdGhlIHZhbHVlXHJcbiAqIG9uIHRoZSBsYXR0aWNlIGF0IGEgbGF0ZXIgdGltZS4gIFRoaXMgaXMgdXNlZCB0byBwcmV2ZW50IGFydGlmYWN0cyB3aGVuIHRoZSB3YXZlIGlzIHR1cm5lZCBvZmYsIGFuZCB0byByZXN0b3JlXHJcbiAqIHRoZSBsYXR0aWNlIHRvIGJsYWNrIChmb3IgbGlnaHQpLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3dhdmUtaW50ZXJmZXJlbmNlL2lzc3Vlcy8yNThcclxuICpcclxuICogQGF1dGhvciBQaWV0IEdvcmlzIChVbml2ZXJzaXR5IG9mIExldXZlbilcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgTGF0dGljZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTGF0dGljZS5qcyc7XHJcbmltcG9ydCBTb3VuZENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vU291bmRDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgc291bmQgZnJvbSAnLi4vLi4vc291bmQuanMnO1xyXG5cclxudHlwZSBEZWx0YUVudHJ5ID0ge1xyXG4gIGlzU291cmNlT246IGJvb2xlYW47XHJcbiAgbnVtYmVyT2ZTdGVwczogbnVtYmVyO1xyXG4gIHZlcnRpY2FsTGF0dGljZUNvb3JkaW5hdGU6IG51bWJlcjtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlbXBvcmFsTWFzayB7XHJcblxyXG4gIC8vIHJlY29yZCBvZiBjaGFuZ2VzIGluIHdhdmUgZGlzdHVyYmFuY2Ugc291cmNlcy5cclxuICBwcml2YXRlIHJlYWRvbmx5IGRlbHRhczogRGVsdGFFbnRyeVtdID0gW107XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgbW9kZWwuICBJZiB0aGlzIGRpZmZlcnMgZnJvbSB0aGUgcHJpb3Igc3RhdGUgdHlwZSAoaW4gcG9zaXRpb24gb3Igd2hldGhlciBpdCBpcyBvbilcclxuICAgKiBhIGRlbHRhIGlzIGdlbmVyYXRlZC5cclxuICAgKiBAcGFyYW0gaXNTb3VyY2VPbiAtIHRydWUgaWYgdGhlIHNvdXJjZSBpcyBvbiwgZmFsc2UgaWYgdGhlIHNvdXJjZSBpcyBvZmZcclxuICAgKiBAcGFyYW0gbnVtYmVyT2ZTdGVwcyAtIGludGVnZXIgbnVtYmVyIG9mIHRpbWVzIHRoZSB3YXZlIGhhcyBiZWVuIHN0ZXBwZWQgb24gdGhlIGxhdHRpY2VcclxuICAgKiBAcGFyYW0gdmVydGljYWxMYXR0aWNlQ29vcmRpbmF0ZSAtIHZlcnRpY2FsIGxhdHRpY2UgY29vcmRpbmF0ZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQoIGlzU291cmNlT246IGJvb2xlYW4sIG51bWJlck9mU3RlcHM6IG51bWJlciwgdmVydGljYWxMYXR0aWNlQ29vcmRpbmF0ZTogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgY29uc3QgbGFzdERlbHRhID0gdGhpcy5kZWx0YXMubGVuZ3RoID4gMCA/IHRoaXMuZGVsdGFzWyB0aGlzLmRlbHRhcy5sZW5ndGggLSAxIF0gOiBudWxsO1xyXG4gICAgaWYgKCB0aGlzLmRlbHRhcy5sZW5ndGggPT09IDAgfHwgbGFzdERlbHRhIS5pc1NvdXJjZU9uICE9PSBpc1NvdXJjZU9uIHx8IGxhc3REZWx0YSEudmVydGljYWxMYXR0aWNlQ29vcmRpbmF0ZSAhPT0gdmVydGljYWxMYXR0aWNlQ29vcmRpbmF0ZSApIHtcclxuXHJcbiAgICAgIC8vIHJlY29yZCBhIGRlbHRhXHJcbiAgICAgIHRoaXMuZGVsdGFzLnB1c2goIHtcclxuICAgICAgICBpc1NvdXJjZU9uOiBpc1NvdXJjZU9uLFxyXG4gICAgICAgIG51bWJlck9mU3RlcHM6IG51bWJlck9mU3RlcHMsXHJcbiAgICAgICAgdmVydGljYWxMYXR0aWNlQ29vcmRpbmF0ZTogdmVydGljYWxMYXR0aWNlQ29vcmRpbmF0ZVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIGlmIHRoZSB3YXZlIHNvdXJjZSB3YXMgdHVybmVkIG9uIGF0IGEgdGltZSB0aGF0IGNvbnRyaWJ1dGVkIHRvIHRoZSBjZWxsIHZhbHVlXHJcbiAgICogQHBhcmFtIGhvcml6b250YWxTb3VyY2VYIC0gaG9yaXpvbnRhbCBjb29yZGluYXRlIG9mIHRoZSBzb3VyY2VcclxuICAgKiBAcGFyYW0gaG9yaXpvbnRhbExhdHRpY2VDb29yZGluYXRlIC0gaG9yaXpvbnRhbCBjb29yZGluYXRlIG9uIHRoZSBsYXR0aWNlIChpKVxyXG4gICAqIEBwYXJhbSB2ZXJ0aWNhbExhdHRpY2VDb29yZGluYXRlIC0gdmVydGljYWwgY29vcmRpbmF0ZSBvbiB0aGUgbGF0dGljZSAoailcclxuICAgKiBAcGFyYW0gbnVtYmVyT2ZTdGVwcyAtIGludGVnZXIgbnVtYmVyIG9mIHRpbWVzIHRoZSB3YXZlIGhhcyBiZWVuIHN0ZXBwZWQgb24gdGhlIGxhdHRpY2VcclxuICAgKi9cclxuICBwdWJsaWMgbWF0Y2hlcyggaG9yaXpvbnRhbFNvdXJjZVg6IG51bWJlciwgaG9yaXpvbnRhbExhdHRpY2VDb29yZGluYXRlOiBudW1iZXIsIHZlcnRpY2FsTGF0dGljZUNvb3JkaW5hdGU6IG51bWJlciwgbnVtYmVyT2ZTdGVwczogbnVtYmVyICk6IG51bWJlciB7XHJcblxyXG4gICAgLy8gc2VhcmNoIHRvIHNlZSBpZiB0aGUgc291cmNlIGNvbnRyaWJ1dGVkIHRvIHRoZSB2YWx1ZSBhdCB0aGUgc3BlY2lmaWVkIGNvb3JkaW5hdGUgYXQgdGhlIGN1cnJlbnQgbnVtYmVyT2ZTdGVwc1xyXG4gICAgZm9yICggbGV0IGsgPSAwOyBrIDwgdGhpcy5kZWx0YXMubGVuZ3RoOyBrKysgKSB7XHJcbiAgICAgIGNvbnN0IGRlbHRhID0gdGhpcy5kZWx0YXNbIGsgXTtcclxuICAgICAgaWYgKCBkZWx0YS5pc1NvdXJjZU9uICkge1xyXG5cclxuICAgICAgICBjb25zdCBob3Jpem9udGFsRGVsdGEgPSBob3Jpem9udGFsU291cmNlWCAtIGhvcml6b250YWxMYXR0aWNlQ29vcmRpbmF0ZTtcclxuICAgICAgICBjb25zdCB2ZXJ0aWNhbERlbHRhID0gZGVsdGEudmVydGljYWxMYXR0aWNlQ29vcmRpbmF0ZSAtIHZlcnRpY2FsTGF0dGljZUNvb3JkaW5hdGU7XHJcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIGhvcml6b250YWxEZWx0YSAqIGhvcml6b250YWxEZWx0YSArIHZlcnRpY2FsRGVsdGEgKiB2ZXJ0aWNhbERlbHRhICk7XHJcblxyXG4gICAgICAgIC8vIEZpbmQgb3V0IHdoZW4gdGhpcyBkZWx0YSBpcyBpbiBlZmZlY3RcclxuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBkZWx0YS5udW1iZXJPZlN0ZXBzO1xyXG4gICAgICAgIGNvbnN0IGVuZFRpbWUgPSB0aGlzLmRlbHRhc1sgayArIDEgXSA/IHRoaXMuZGVsdGFzWyBrICsgMSBdLm51bWJlck9mU3RlcHMgOiBudW1iZXJPZlN0ZXBzO1xyXG5cclxuICAgICAgICBjb25zdCB0aGVvcmV0aWNhbFRpbWUgPSBudW1iZXJPZlN0ZXBzIC0gZGlzdGFuY2UgLyAoIExhdHRpY2UuV0FWRV9TUEVFRCApO1xyXG5cclxuICAgICAgICAvLyBpZiB0aGVvcmV0aWNhbERpc3RhbmNlIG1hdGNoZXMgYW55IHRpbWUgaW4gdGhpcyByYW5nZSwgdGhlIGNlbGwncyB2YWx1ZSB3YXMgY2F1c2VkIGJ5IHRoZSBvc2NpbGxhdG9ycywgYW5kXHJcbiAgICAgICAgLy8gbm90IGJ5IGEgcmVmbGVjdGlvbiBvciBudW1lcmljYWwgYXJ0aWZhY3QuICBUaGUgdG9sZXJhbmNlIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZSBhY3R1YWwgZ3JvdXAgdmVsb2NpdHlcclxuICAgICAgICAvLyBvZiB0aGUgdGlwIGV4Y2VlZHMgdGhlIHRoZW9yZXRpY2FsIHNwZWVkLCBhbmQgdGhlIGdyb3VwIHZlbG9jaXR5IGF0IHRoZSB0YWlsIGlzIGxvd2VyIHRoYW4gdGhlIHRoZW9yZXRpY2FsXHJcbiAgICAgICAgLy8gc3BlZWQuICBJZiB0aGUgdG9sZXJhbmNlIGlzIHRvbyB0aWdodCwgdGhpcyBhcHBlYXJzIGFzIGFuIHVubmF0dXJhbCBcImNsaXBwaW5nXCIgb2YgdGhlIHdhdmUgYXJlYSBncmFwaC5cclxuICAgICAgICBjb25zdCBoZWFkVG9sZXJhbmNlID0gMjtcclxuICAgICAgICBjb25zdCB0YWlsVG9sZXJhbmNlID0gNDtcclxuXHJcbiAgICAgICAgaWYgKCBob3Jpem9udGFsRGVsdGEgPD0gMCAmJiB0aGVvcmV0aWNhbFRpbWUgPj0gc3RhcnRUaW1lIC0gaGVhZFRvbGVyYW5jZSAmJiB0aGVvcmV0aWNhbFRpbWUgPD0gZW5kVGltZSArIHRhaWxUb2xlcmFuY2UgJiYgTWF0aC5hYnMoIE1hdGguYXRhbiggdmVydGljYWxEZWx0YSAvIGhvcml6b250YWxEZWx0YSApICkgPD0gU291bmRDb25zdGFudHMuQ09ORV9BTkdMRSApIHtcclxuXHJcbiAgICAgICAgICAvLyBSZXR1cm4gYXMgZWFybHkgYXMgcG9zc2libGUgdG8gaW1wcm92ZSBwZXJmb3JtYW5jZVxyXG4gICAgICAgICAgcmV0dXJuIGRpc3RhbmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAtMTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBkZWx0YSB2YWx1ZXMgdGhhdCBhcmUgc28gb2xkIHRoZXkgY2FuIG5vIGxvbmdlciBpbXBhY3QgdGhlIG1vZGVsLCB0byBhdm9pZCBtZW1vcnkgbGVha3MgYW5kIHRvbyBtdWNoIENQVVxyXG4gICAqIEBwYXJhbSBtYXhEaXN0YW5jZSAtIHRoZSBmdXJ0aGVzdCBhIHBvaW50IGNhbiBiZSBmcm9tIGEgc291cmNlXHJcbiAgICogQHBhcmFtIG51bWJlck9mU3RlcHMgLSBpbnRlZ2VyIG51bWJlciBvZiB0aW1lcyB0aGUgd2F2ZSBoYXMgYmVlbiBzdGVwcGVkIG9uIHRoZSBsYXR0aWNlXHJcbiAgICovXHJcbiAgcHVibGljIHBydW5lKCBtYXhEaXN0YW5jZTogbnVtYmVyLCBudW1iZXJPZlN0ZXBzOiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gU2F2ZSBlbm91Z2ggZGVsdGFzIHNvIHRoYXQgZXZlbiBpZiB0aGUgdXNlciB0b2dnbGVzIHRoZSBzb3VyY2Ugb24gYW5kIG9mZiByYXBpZGx5LCB0aGUgZWZmZWN0IHdpbGwgYmUgZnVydGhlclxyXG4gICAgLy8gZnJvbSB0aGUgc291cmNlLiAgQnV0IGRvbid0IHNhdmUgc28gbWFueSBkZWx0YXMgdGhhdCBwZXJmb3JtYW5jZSBpcyBkZWdyYWRlZC5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvd2F2ZS1pbnRlcmZlcmVuY2UvaXNzdWVzLzMxOVxyXG4gICAgd2hpbGUgKCB0aGlzLmRlbHRhcy5sZW5ndGggPiAxMCApIHtcclxuICAgICAgdGhpcy5kZWx0YXMuc2hpZnQoKTsgLy8gcmVtb3ZlIG9sZGVzdCBkZWx0YXMgZmlyc3RcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFyIHRoZSBzdGF0ZS5cclxuICAgKi9cclxuICBwcml2YXRlIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kZWx0YXMubGVuZ3RoID0gMDtcclxuICB9XHJcbn1cclxuXHJcbnNvdW5kLnJlZ2lzdGVyKCAnVGVtcG9yYWxNYXNrJywgVGVtcG9yYWxNYXNrICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSx3Q0FBd0M7QUFDNUQsT0FBT0MsY0FBYyxNQUFNLGdDQUFnQztBQUMzRCxPQUFPQyxLQUFLLE1BQU0sZ0JBQWdCO0FBUWxDLGVBQWUsTUFBTUMsWUFBWSxDQUFDO0VBRWhDO0VBQ2lCQyxNQUFNLEdBQWlCLEVBQUU7O0VBRTFDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NDLEdBQUdBLENBQUVDLFVBQW1CLEVBQUVDLGFBQXFCLEVBQUVDLHlCQUFpQyxFQUFTO0lBQ2hHLE1BQU1DLFNBQVMsR0FBRyxJQUFJLENBQUNMLE1BQU0sQ0FBQ00sTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUNOLE1BQU0sQ0FBRSxJQUFJLENBQUNBLE1BQU0sQ0FBQ00sTUFBTSxHQUFHLENBQUMsQ0FBRSxHQUFHLElBQUk7SUFDdkYsSUFBSyxJQUFJLENBQUNOLE1BQU0sQ0FB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