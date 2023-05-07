// Copyright 2020-2022, University of Colorado Boulder

/**
 * Draws a sinusoidal wave with a dashed line to represent a light path. Can also display wavefronts in multicolor.
 *
 * @author Todd Holden (https://tholden79.wixsite.com/mysite2)
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
// modules
import merge from '../../../../phet-core/js/merge.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import xrayDiffraction from '../../xrayDiffraction.js';

// constants

class LightPathNode extends Node {
  /**
   * @param {Vector2} startPoint - where light beam starts
   * @param {Vector2} endPoint - where light beam ends
   * @param {number} wavelength - wavelength of beam in Angstrom
   * @param {Object} [options]
   */
  constructor(startPoint, endPoint, wavelength, options) {
    assert && assert(wavelength > 0, `wavelength should be positive: ${wavelength}`);
    options = merge({
      // @public - options provided to override default appearance of wave, including showing the wavefronts
      amplitude: 10,
      // amplitude of the wave. Might be better to have default amplitude: (endPoint - startPoint)/10
      startPhase: 0,
      // initial phase of the wave (0 for cosine wave)
      waveFrontWidth: 0,
      // 0 for no wavefronts
      // if waveFrontWidth !=0, this gives a pattern of wavefront colors/shades. 60*i gives 6 different colors
      // can also use () => 'black' for black wavefronts, etc.
      waveFrontPattern: i => `hsl(${(60 * i % 360 + 360) % 360}, 100%, 50%)`,
      stroke: 'black',
      // color of sine wave
      centerStroke: 'gray',
      // color of dashed baseline
      lineWidth: 2,
      // width of sine wave, double width of center line
      waveFrontLineWidth: 3 // width of the wavefront markers
    }, options);
    const length = endPoint.distance(startPoint);
    const segments = Utils.roundSymmetric(length / wavelength * 16); // total number of points = number of points 16 points/wavelength
    const theta = endPoint.minus(startPoint).getAngle(); // direction of the light path
    const wnK = 2 * Math.PI / wavelength;

    //----------------------------------------------------------------------------------------

    super();

    // must have at least 2 points to draw anything. Otherwise just return empty node.
    if (segments < 2) {
      return;
    }
    let rayShape = new Shape();
    const waveShape = new Shape();
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    // dashed line to define the path of the light
    rayShape.moveToPoint(startPoint);
    rayShape.lineToPoint(endPoint);
    rayShape = rayShape.getDashedShape([8], 0);

    // create the sine wave
    let pointFromStart = new Vector2(options.amplitude * Math.cos(options.startPhase) * sinTheta, -options.amplitude * Math.cos(options.startPhase) * cosTheta);
    waveShape.moveToPoint(startPoint.plus(pointFromStart));
    for (let i = 0; i < segments; i++) {
      const currentL = i * length / (segments - 1);
      pointFromStart = new Vector2(currentL * cosTheta + options.amplitude * Math.cos(wnK * currentL + options.startPhase) * sinTheta, currentL * sinTheta - options.amplitude * Math.cos(wnK * currentL + options.startPhase) * cosTheta);
      waveShape.lineToPoint(startPoint.plus(pointFromStart));
    }
    const rayPath = new Path(rayShape, {
      stroke: options.centerStroke,
      lineWidth: options.lineWidth / 2
    });
    const wavePath = new Path(waveShape, {
      stroke: options.stroke,
      lineWidth: options.lineWidth
    });

    // this is the light wave
    this.addChild(rayPath);
    this.addChild(wavePath);

    // optionally show wavefronts
    if (options.waveFrontWidth) {
      // start phase as a fraction of the wavelength. Used to offset from every wavefront to the peak of the wave.
      const firstWaveFront = options.startPhase / 2 / Math.PI;
      const waveFrontAmp = new Vector2(options.waveFrontWidth / 2 * sinTheta, -options.waveFrontWidth / 2 * cosTheta);
      for (let i = Math.ceil(firstWaveFront); i < firstWaveFront + length / wavelength; i++) {
        // position to the i^th wavefront
        const waveFrontPosition = new Vector2((firstWaveFront - i) * wavelength * cosTheta, (firstWaveFront - i) * wavelength * sinTheta);
        this.addChild(new Path(Shape.lineSegment(startPoint.minus(waveFrontPosition).plus(waveFrontAmp), startPoint.minus(waveFrontPosition).minus(waveFrontAmp)), {
          stroke: options.waveFrontPattern(i),
          lineWidth: options.waveFrontLineWidth
        }));
      }
    }
  }
}
xrayDiffraction.register('LightPathNode', LightPathNode);
export default LightPathNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlZlY3RvcjIiLCJTaGFwZSIsIm1lcmdlIiwiTm9kZSIsIlBhdGgiLCJ4cmF5RGlmZnJhY3Rpb24iLCJMaWdodFBhdGhOb2RlIiwiY29uc3RydWN0b3IiLCJzdGFydFBvaW50IiwiZW5kUG9pbnQiLCJ3YXZlbGVuZ3RoIiwib3B0aW9ucyIsImFzc2VydCIsImFtcGxpdHVkZSIsInN0YXJ0UGhhc2UiLCJ3YXZlRnJvbnRXaWR0aCIsIndhdmVGcm9udFBhdHRlcm4iLCJpIiwic3Ryb2tlIiwiY2VudGVyU3Ryb2tlIiwibGluZVdpZHRoIiwid2F2ZUZyb250TGluZVdpZHRoIiwibGVuZ3RoIiwiZGlzdGFuY2UiLCJzZWdtZW50cyIsInJvdW5kU3ltbWV0cmljIiwidGhldGEiLCJtaW51cyIsImdldEFuZ2xlIiwid25LIiwiTWF0aCIsIlBJIiwicmF5U2hhcGUiLCJ3YXZlU2hhcGUiLCJjb3NUaGV0YSIsImNvcyIsInNpblRoZXRhIiwic2luIiwibW92ZVRvUG9pbnQiLCJsaW5lVG9Qb2ludCIsImdldERhc2hlZFNoYXBlIiwicG9pbnRGcm9tU3RhcnQiLCJwbHVzIiwiY3VycmVudEwiLCJyYXlQYXRoIiwid2F2ZVBhdGgiLCJhZGRDaGlsZCIsImZpcnN0V2F2ZUZyb250Iiwid2F2ZUZyb250QW1wIiwiY2VpbCIsIndhdmVGcm9udFBvc2l0aW9uIiwibGluZVNlZ21lbnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxpZ2h0UGF0aE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRHJhd3MgYSBzaW51c29pZGFsIHdhdmUgd2l0aCBhIGRhc2hlZCBsaW5lIHRvIHJlcHJlc2VudCBhIGxpZ2h0IHBhdGguIENhbiBhbHNvIGRpc3BsYXkgd2F2ZWZyb250cyBpbiBtdWx0aWNvbG9yLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFRvZGQgSG9sZGVuIChodHRwczovL3Rob2xkZW43OS53aXhzaXRlLmNvbS9teXNpdGUyKVxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuLy8gbW9kdWxlc1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB4cmF5RGlmZnJhY3Rpb24gZnJvbSAnLi4vLi4veHJheURpZmZyYWN0aW9uLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5cclxuY2xhc3MgTGlnaHRQYXRoTm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gc3RhcnRQb2ludCAtIHdoZXJlIGxpZ2h0IGJlYW0gc3RhcnRzXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBlbmRQb2ludCAtIHdoZXJlIGxpZ2h0IGJlYW0gZW5kc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3YXZlbGVuZ3RoIC0gd2F2ZWxlbmd0aCBvZiBiZWFtIGluIEFuZ3N0cm9tXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBzdGFydFBvaW50LCBlbmRQb2ludCwgd2F2ZWxlbmd0aCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB3YXZlbGVuZ3RoID4gMCwgYHdhdmVsZW5ndGggc2hvdWxkIGJlIHBvc2l0aXZlOiAke3dhdmVsZW5ndGh9YCApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICAvLyBAcHVibGljIC0gb3B0aW9ucyBwcm92aWRlZCB0byBvdmVycmlkZSBkZWZhdWx0IGFwcGVhcmFuY2Ugb2Ygd2F2ZSwgaW5jbHVkaW5nIHNob3dpbmcgdGhlIHdhdmVmcm9udHNcclxuICAgICAgYW1wbGl0dWRlOiAxMCwgIC8vIGFtcGxpdHVkZSBvZiB0aGUgd2F2ZS4gTWlnaHQgYmUgYmV0dGVyIHRvIGhhdmUgZGVmYXVsdCBhbXBsaXR1ZGU6IChlbmRQb2ludCAtIHN0YXJ0UG9pbnQpLzEwXHJcbiAgICAgIHN0YXJ0UGhhc2U6IDAsIC8vIGluaXRpYWwgcGhhc2Ugb2YgdGhlIHdhdmUgKDAgZm9yIGNvc2luZSB3YXZlKVxyXG4gICAgICB3YXZlRnJvbnRXaWR0aDogMCwgLy8gMCBmb3Igbm8gd2F2ZWZyb250c1xyXG4gICAgICAvLyBpZiB3YXZlRnJvbnRXaWR0aCAhPTAsIHRoaXMgZ2l2ZXMgYSBwYXR0ZXJuIG9mIHdhdmVmcm9udCBjb2xvcnMvc2hhZGVzLiA2MCppIGdpdmVzIDYgZGlmZmVyZW50IGNvbG9yc1xyXG4gICAgICAvLyBjYW4gYWxzbyB1c2UgKCkgPT4gJ2JsYWNrJyBmb3IgYmxhY2sgd2F2ZWZyb250cywgZXRjLlxyXG4gICAgICB3YXZlRnJvbnRQYXR0ZXJuOiBpID0+IGBoc2woJHsoICggNjAgKiBpICUgMzYwICkgKyAzNjAgKSAlIDM2MH0sIDEwMCUsIDUwJSlgLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsIC8vIGNvbG9yIG9mIHNpbmUgd2F2ZVxyXG4gICAgICBjZW50ZXJTdHJva2U6ICdncmF5JywgLy8gY29sb3Igb2YgZGFzaGVkIGJhc2VsaW5lXHJcbiAgICAgIGxpbmVXaWR0aDogMiwgIC8vIHdpZHRoIG9mIHNpbmUgd2F2ZSwgZG91YmxlIHdpZHRoIG9mIGNlbnRlciBsaW5lXHJcbiAgICAgIHdhdmVGcm9udExpbmVXaWR0aDogMyAvLyB3aWR0aCBvZiB0aGUgd2F2ZWZyb250IG1hcmtlcnNcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBsZW5ndGggPSBlbmRQb2ludC5kaXN0YW5jZSggc3RhcnRQb2ludCApO1xyXG4gICAgY29uc3Qgc2VnbWVudHMgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggbGVuZ3RoIC8gd2F2ZWxlbmd0aCAqIDE2ICk7IC8vIHRvdGFsIG51bWJlciBvZiBwb2ludHMgPSBudW1iZXIgb2YgcG9pbnRzIDE2IHBvaW50cy93YXZlbGVuZ3RoXHJcbiAgICBjb25zdCB0aGV0YSA9IGVuZFBvaW50Lm1pbnVzKCBzdGFydFBvaW50ICkuZ2V0QW5nbGUoKTsgLy8gZGlyZWN0aW9uIG9mIHRoZSBsaWdodCBwYXRoXHJcbiAgICBjb25zdCB3bksgPSAyICogTWF0aC5QSSAvIHdhdmVsZW5ndGg7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBtdXN0IGhhdmUgYXQgbGVhc3QgMiBwb2ludHMgdG8gZHJhdyBhbnl0aGluZy4gT3RoZXJ3aXNlIGp1c3QgcmV0dXJuIGVtcHR5IG5vZGUuXHJcbiAgICBpZiAoIHNlZ21lbnRzIDwgMiApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgbGV0IHJheVNoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICBjb25zdCB3YXZlU2hhcGUgPSBuZXcgU2hhcGUoKTtcclxuICAgIGNvbnN0IGNvc1RoZXRhID0gTWF0aC5jb3MoIHRoZXRhICk7XHJcbiAgICBjb25zdCBzaW5UaGV0YSA9IE1hdGguc2luKCB0aGV0YSApO1xyXG5cclxuICAgIC8vIGRhc2hlZCBsaW5lIHRvIGRlZmluZSB0aGUgcGF0aCBvZiB0aGUgbGlnaHRcclxuICAgIHJheVNoYXBlLm1vdmVUb1BvaW50KCBzdGFydFBvaW50ICk7XHJcbiAgICByYXlTaGFwZS5saW5lVG9Qb2ludCggZW5kUG9pbnQgKTtcclxuICAgIHJheVNoYXBlID0gcmF5U2hhcGUuZ2V0RGFzaGVkU2hhcGUoIFsgOCBdLCAwICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBzaW5lIHdhdmVcclxuICAgIGxldCBwb2ludEZyb21TdGFydCA9IG5ldyBWZWN0b3IyKCBvcHRpb25zLmFtcGxpdHVkZSAqIE1hdGguY29zKCBvcHRpb25zLnN0YXJ0UGhhc2UgKSAqIHNpblRoZXRhLFxyXG4gICAgICAtb3B0aW9ucy5hbXBsaXR1ZGUgKiBNYXRoLmNvcyggb3B0aW9ucy5zdGFydFBoYXNlICkgKiBjb3NUaGV0YSApO1xyXG4gICAgd2F2ZVNoYXBlLm1vdmVUb1BvaW50KCBzdGFydFBvaW50LnBsdXMoIHBvaW50RnJvbVN0YXJ0ICkgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHNlZ21lbnRzOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRMID0gaSAqIGxlbmd0aCAvICggc2VnbWVudHMgLSAxICk7XHJcbiAgICAgIHBvaW50RnJvbVN0YXJ0ID0gbmV3IFZlY3RvcjIoIGN1cnJlbnRMICogY29zVGhldGEgKyBvcHRpb25zLmFtcGxpdHVkZSAqIE1hdGguY29zKCB3bksgKiBjdXJyZW50TCArIG9wdGlvbnMuc3RhcnRQaGFzZSApICogc2luVGhldGEsXHJcbiAgICAgICAgY3VycmVudEwgKiBzaW5UaGV0YSAtIG9wdGlvbnMuYW1wbGl0dWRlICogTWF0aC5jb3MoIHduSyAqIGN1cnJlbnRMICsgb3B0aW9ucy5zdGFydFBoYXNlICkgKiBjb3NUaGV0YSApO1xyXG4gICAgICB3YXZlU2hhcGUubGluZVRvUG9pbnQoIHN0YXJ0UG9pbnQucGx1cyggcG9pbnRGcm9tU3RhcnQgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJheVBhdGggPSBuZXcgUGF0aCggcmF5U2hhcGUsIHtcclxuICAgICAgc3Ryb2tlOiBvcHRpb25zLmNlbnRlclN0cm9rZSxcclxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmxpbmVXaWR0aCAvIDJcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHdhdmVQYXRoID0gbmV3IFBhdGgoIHdhdmVTaGFwZSwge1xyXG4gICAgICBzdHJva2U6IG9wdGlvbnMuc3Ryb2tlLFxyXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMubGluZVdpZHRoXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdGhpcyBpcyB0aGUgbGlnaHQgd2F2ZVxyXG4gICAgdGhpcy5hZGRDaGlsZCggcmF5UGF0aCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggd2F2ZVBhdGggKTtcclxuXHJcbiAgICAvLyBvcHRpb25hbGx5IHNob3cgd2F2ZWZyb250c1xyXG4gICAgaWYgKCBvcHRpb25zLndhdmVGcm9udFdpZHRoICkge1xyXG4gICAgICAvLyBzdGFydCBwaGFzZSBhcyBhIGZyYWN0aW9uIG9mIHRoZSB3YXZlbGVuZ3RoLiBVc2VkIHRvIG9mZnNldCBmcm9tIGV2ZXJ5IHdhdmVmcm9udCB0byB0aGUgcGVhayBvZiB0aGUgd2F2ZS5cclxuICAgICAgY29uc3QgZmlyc3RXYXZlRnJvbnQgPSBvcHRpb25zLnN0YXJ0UGhhc2UgLyAyIC8gTWF0aC5QSTtcclxuICAgICAgY29uc3Qgd2F2ZUZyb250QW1wID0gbmV3IFZlY3RvcjIoIG9wdGlvbnMud2F2ZUZyb250V2lkdGggLyAyICogc2luVGhldGEsIC1vcHRpb25zLndhdmVGcm9udFdpZHRoIC8gMiAqIGNvc1RoZXRhICk7XHJcbiAgICAgIGZvciAoIGxldCBpID0gTWF0aC5jZWlsKCBmaXJzdFdhdmVGcm9udCApOyBpIDwgZmlyc3RXYXZlRnJvbnQgKyBsZW5ndGggLyB3YXZlbGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgLy8gcG9zaXRpb24gdG8gdGhlIGledGggd2F2ZWZyb250XHJcbiAgICAgICAgY29uc3Qgd2F2ZUZyb250UG9zaXRpb24gPSBuZXcgVmVjdG9yMiggKCBmaXJzdFdhdmVGcm9udCAtIGkgKSAqIHdhdmVsZW5ndGggKiBjb3NUaGV0YSxcclxuICAgICAgICAgICggZmlyc3RXYXZlRnJvbnQgLSBpICkgKiB3YXZlbGVuZ3RoICogc2luVGhldGEgKTtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKCBuZXcgUGF0aCggU2hhcGUubGluZVNlZ21lbnQoIHN0YXJ0UG9pbnQubWludXMoIHdhdmVGcm9udFBvc2l0aW9uICkucGx1cyggd2F2ZUZyb250QW1wICksXHJcbiAgICAgICAgICBzdGFydFBvaW50Lm1pbnVzKCB3YXZlRnJvbnRQb3NpdGlvbiApLm1pbnVzKCB3YXZlRnJvbnRBbXAgKSApLCB7XHJcbiAgICAgICAgICBzdHJva2U6IG9wdGlvbnMud2F2ZUZyb250UGF0dGVybiggaSApLFxyXG4gICAgICAgICAgbGluZVdpZHRoOiBvcHRpb25zLndhdmVGcm9udExpbmVXaWR0aFxyXG4gICAgICAgIH0gKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG54cmF5RGlmZnJhY3Rpb24ucmVnaXN0ZXIoICdMaWdodFBhdGhOb2RlJywgTGlnaHRQYXRoTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBMaWdodFBhdGhOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RDtBQUNBLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlELE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7O0FBRXREOztBQUVBLE1BQU1DLGFBQWEsU0FBU0gsSUFBSSxDQUFDO0VBQy9CO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxXQUFXQSxDQUFFQyxVQUFVLEVBQUVDLFFBQVEsRUFBRUMsVUFBVSxFQUFFQyxPQUFPLEVBQUc7SUFFdkRDLE1BQU0sSUFBSUEsTUFBTSxDQUFFRixVQUFVLEdBQUcsQ0FBQyxFQUFHLGtDQUFpQ0EsVUFBVyxFQUFFLENBQUM7SUFFbEZDLE9BQU8sR0FBR1QsS0FBSyxDQUFFO01BQ2Y7TUFDQVcsU0FBUyxFQUFFLEVBQUU7TUFBRztNQUNoQkMsVUFBVSxFQUFFLENBQUM7TUFBRTtNQUNmQyxjQUFjLEVBQUUsQ0FBQztNQUFFO01BQ25CO01BQ0E7TUFDQUMsZ0JBQWdCLEVBQUVDLENBQUMsSUFBSyxPQUFNLENBQUksRUFBRSxHQUFHQSxDQUFDLEdBQUcsR0FBRyxHQUFLLEdBQUcsSUFBSyxHQUFJLGNBQWE7TUFDNUVDLE1BQU0sRUFBRSxPQUFPO01BQUU7TUFDakJDLFlBQVksRUFBRSxNQUFNO01BQUU7TUFDdEJDLFNBQVMsRUFBRSxDQUFDO01BQUc7TUFDZkMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO0lBQ3hCLENBQUMsRUFBRVYsT0FBUSxDQUFDO0lBRVosTUFBTVcsTUFBTSxHQUFHYixRQUFRLENBQUNjLFFBQVEsQ0FBRWYsVUFBVyxDQUFDO0lBQzlDLE1BQU1nQixRQUFRLEdBQUd6QixLQUFLLENBQUMwQixjQUFjLENBQUVILE1BQU0sR0FBR1osVUFBVSxHQUFHLEVBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbkUsTUFBTWdCLEtBQUssR0FBR2pCLFFBQVEsQ0FBQ2tCLEtBQUssQ0FBRW5CLFVBQVcsQ0FBQyxDQUFDb0IsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELE1BQU1DLEdBQUcsR0FBRyxDQUFDLEdBQUdDLElBQUksQ0FBQ0MsRUFBRSxHQUFHckIsVUFBVTs7SUFFcEM7O0lBRUEsS0FBSyxDQUFDLENBQUM7O0lBRVA7SUFDQSxJQUFLYyxRQUFRLEdBQUcsQ0FBQyxFQUFHO01BQ2xCO0lBQ0Y7SUFDQSxJQUFJUSxRQUFRLEdBQUcsSUFBSS9CLEtBQUssQ0FBQyxDQUFDO0lBQzFCLE1BQU1nQyxTQUFTLEdBQUcsSUFBSWhDLEtBQUssQ0FBQyxDQUFDO0lBQzdCLE1BQU1pQyxRQUFRLEdBQUdKLElBQUksQ0FBQ0ssR0FBRyxDQUFFVCxLQUFNLENBQUM7SUFDbEMsTUFBTVUsUUFBUSxHQUFHTixJQUFJLENBQUNPLEdBQUcsQ0FBRVgsS0FBTSxDQUFDOztJQUVsQztJQUNBTSxRQUFRLENBQUNNLFdBQVcsQ0FBRTlCLFVBQVcsQ0FBQztJQUNsQ3dCLFFBQVEsQ0FBQ08sV0FBVyxDQUFFOUIsUUFBUyxDQUFDO0lBQ2hDdUIsUUFBUSxHQUFHQSxRQUFRLENBQUNRLGNBQWMsQ0FBRSxDQUFFLENBQUMsQ0FBRSxFQUFFLENBQUUsQ0FBQzs7SUFFOUM7SUFDQSxJQUFJQyxjQUFjLEdBQUcsSUFBSXpDLE9BQU8sQ0FBRVcsT0FBTyxDQUFDRSxTQUFTLEdBQUdpQixJQUFJLENBQUNLLEdBQUcsQ0FBRXhCLE9BQU8sQ0FBQ0csVUFBVyxDQUFDLEdBQUdzQixRQUFRLEVBQzdGLENBQUN6QixPQUFPLENBQUNFLFNBQVMsR0FBR2lCLElBQUksQ0FBQ0ssR0FBRyxDQUFFeEIsT0FBTyxDQUFDRyxVQUFXLENBQUMsR0FBR29CLFFBQVMsQ0FBQztJQUNsRUQsU0FBUyxDQUFDSyxXQUFXLENBQUU5QixVQUFVLENBQUNrQyxJQUFJLENBQUVELGNBQWUsQ0FBRSxDQUFDO0lBQzFELEtBQU0sSUFBSXhCLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR08sUUFBUSxFQUFFUCxDQUFDLEVBQUUsRUFBRztNQUNuQyxNQUFNMEIsUUFBUSxHQUFHMUIsQ0FBQyxHQUFHSyxNQUFNLElBQUtFLFFBQVEsR0FBRyxDQUFDLENBQUU7TUFDOUNpQixjQUFjLEdBQUcsSUFBSXpDLE9BQU8sQ0FBRTJDLFFBQVEsR0FBR1QsUUFBUSxHQUFHdkIsT0FBTyxDQUFDRSxTQUFTLEdBQUdpQixJQUFJLENBQUNLLEdBQUcsQ0FBRU4sR0FBRyxHQUFHYyxRQUFRLEdBQUdoQyxPQUFPLENBQUNHLFVBQVcsQ0FBQyxHQUFHc0IsUUFBUSxFQUNoSU8sUUFBUSxHQUFHUCxRQUFRLEdBQUd6QixPQUFPLENBQUNFLFNBQVMsR0FBR2lCLElBQUksQ0FBQ0ssR0FBRyxDQUFFTixHQUFHLEdBQUdjLFFBQVEsR0FBR2hDLE9BQU8sQ0FBQ0csVUFBVyxDQUFDLEdBQUdvQixRQUFTLENBQUM7TUFDeEdELFNBQVMsQ0FBQ00sV0FBVyxDQUFFL0IsVUFBVSxDQUFDa0MsSUFBSSxDQUFFRCxjQUFlLENBQUUsQ0FBQztJQUM1RDtJQUVBLE1BQU1HLE9BQU8sR0FBRyxJQUFJeEMsSUFBSSxDQUFFNEIsUUFBUSxFQUFFO01BQ2xDZCxNQUFNLEVBQUVQLE9BQU8sQ0FBQ1EsWUFBWTtNQUM1QkMsU0FBUyxFQUFFVCxPQUFPLENBQUNTLFNBQVMsR0FBRztJQUNqQyxDQUFFLENBQUM7SUFDSCxNQUFNeUIsUUFBUSxHQUFHLElBQUl6QyxJQUFJLENBQUU2QixTQUFTLEVBQUU7TUFDcENmLE1BQU0sRUFBRVAsT0FBTyxDQUFDTyxNQUFNO01BQ3RCRSxTQUFTLEVBQUVULE9BQU8sQ0FBQ1M7SUFDckIsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDMEIsUUFBUSxDQUFFRixPQUFRLENBQUM7SUFDeEIsSUFBSSxDQUFDRSxRQUFRLENBQUVELFFBQVMsQ0FBQzs7SUFFekI7SUFDQSxJQUFLbEMsT0FBTyxDQUFDSSxjQUFjLEVBQUc7TUFDNUI7TUFDQSxNQUFNZ0MsY0FBYyxHQUFHcEMsT0FBTyxDQUFDRyxVQUFVLEdBQUcsQ0FBQyxHQUFHZ0IsSUFBSSxDQUFDQyxFQUFFO01BQ3ZELE1BQU1pQixZQUFZLEdBQUcsSUFBSWhELE9BQU8sQ0FBRVcsT0FBTyxDQUFDSSxjQUFjLEdBQUcsQ0FBQyxHQUFHcUIsUUFBUSxFQUFFLENBQUN6QixPQUFPLENBQUNJLGNBQWMsR0FBRyxDQUFDLEdBQUdtQixRQUFTLENBQUM7TUFDakgsS0FBTSxJQUFJakIsQ0FBQyxHQUFHYSxJQUFJLENBQUNtQixJQUFJLENBQUVGLGNBQWUsQ0FBQyxFQUFFOUIsQ0FBQyxHQUFHOEIsY0FBYyxHQUFHekIsTUFBTSxHQUFHWixVQUFVLEVBQUVPLENBQUMsRUFBRSxFQUFHO1FBQ3pGO1FBQ0EsTUFBTWlDLGlCQUFpQixHQUFHLElBQUlsRCxPQUFPLENBQUUsQ0FBRStDLGNBQWMsR0FBRzlCLENBQUMsSUFBS1AsVUFBVSxHQUFHd0IsUUFBUSxFQUNuRixDQUFFYSxjQUFjLEdBQUc5QixDQUFDLElBQUtQLFVBQVUsR0FBRzBCLFFBQVMsQ0FBQztRQUNsRCxJQUFJLENBQUNVLFFBQVEsQ0FBRSxJQUFJMUMsSUFBSSxDQUFFSCxLQUFLLENBQUNrRCxXQUFXLENBQUUzQyxVQUFVLENBQUNtQixLQUFLLENBQUV1QixpQkFBa0IsQ0FBQyxDQUFDUixJQUFJLENBQUVNLFlBQWEsQ0FBQyxFQUNwR3hDLFVBQVUsQ0FBQ21CLEtBQUssQ0FBRXVCLGlCQUFrQixDQUFDLENBQUN2QixLQUFLLENBQUVxQixZQUFhLENBQUUsQ0FBQyxFQUFFO1VBQy9EOUIsTUFBTSxFQUFFUCxPQUFPLENBQUNLLGdCQUFnQixDQUFFQyxDQUFFLENBQUM7VUFDckNHLFNBQVMsRUFBRVQsT0FBTyxDQUFDVTtRQUNyQixDQUFFLENBQUUsQ0FBQztNQUNQO0lBQ0Y7RUFDRjtBQUNGO0FBRUFoQixlQUFlLENBQUMrQyxRQUFRLENBQUUsZUFBZSxFQUFFOUMsYUFBYyxDQUFDO0FBQzFELGVBQWVBLGFBQWEifQ==